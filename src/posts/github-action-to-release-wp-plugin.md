---
title: 😎 Using GitHub actions to release a WordPress plugin
metaDesc: Avoid uploading dependencies to your repo
socialImage: /images/github-actions.png
date: '2020-07-31'
tags:
  - wordpress
  - plugin
  - development
  - github
---

The [GraphQL API for WordPress](https://github.com/GraphQLAPI/graphql-api) plugin (which I [launched last week](https://leoloso.com/posts/introducing-the-graphql-api-for-wordpress/)) has plenty of PHP dependencies, managed through Composer. These dependencies, which are located under `vendor/`, are not stored in the GitHub repo, because they do not belong there.

However, these dependencies must be inside the .zip file when installing the plugin in the WordPress site. Then, when and how do we add them into the release?

The answer is to create a [GitHub action](https://github.com/features/actions) which, upon tagging the code, will automatically create the .zip file and upload it as a release asset.

The end result looks like this: In addition to the `Source code (zip)` (which does not contain the PHP dependencies), the release assets contain a `graphql-api.zip` file, which does have the PHP dependencies, and is the actual plugin to install in the WordPress site:

![Release assets after tagging code](/images/release-assets.png "Release assets after tagging code")

In this post, I'll demonstrate step-by-step the GitHub action to build the plugin.

## Exploring existing actions

Before attempting to create my own action, I tried the following ones:

- 10up's [WordPress.org Plugin Deploy](https://github.com/10up/action-wordpress-plugin-deploy)
- [`upload-release-asset`](https://github.com/actions/upload-release-asset)

None of them worked for my case. Concerning 10up's action, its purpose is to upload the plugin release from GitHub to WordPress' SVN. This can be very useful, saving us plenty of time by avoiding to do this bureaucratic conversion manually. However, I can't use it, because my plugin is not in the WordPress plugin directory yet (for the time being, it's available only through GitHub). I attempted to use it just to generate the .zip file, without uploading to the SVN, but nope, it doesn't work.

`upload-release-asset` should have been suitable for my use case, however I couldn't make it work properly, because this action creates a release, which is then uploaded as an asset. However, when tagging the source code (say, with `v0.1.5`), the release is already created! Hence, this tool would create yet-another release, which is far from ideal. And even worse, it requires parameter `tag_name`, but this tag can't be the same used for tagging the source code, or it gives a `duplicated` error. Then, my source code was being tagged twice: first manually as `v0.1.5`, and then automatically as `plugin-v0.1.5`. Very far from ideal.

So, I created my own action.

## Creating the action

The action is [this one](https://github.com/GraphQLAPI/graphql-api/blob/d820f4aa63e42780ea6ce19a8b52cb0261c1052f/.github/workflows/main.yml):

```yaml
name: Generate Installable Plugin, and Upload as Release Asset
on:
  release:
    types: [published]
jobs:
  build:
    name: Upload Release Asset
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Build project
        run: |
          composer install --no-dev --optimize-autoloader
          mkdir build
      - name: Create artifact
        uses: montudor/action-zip@v0.1.0
        with:
          args: zip -X -r build/graphql-api.zip . -x *.git* node_modules/\* .* "*/\.*" CODE_OF_CONDUCT.md CONTRIBUTING.md ISSUE_TEMPLATE.md PULL_REQUEST_TEMPLATE.md *.dist composer.* dev-helpers** build**
      - name: Upload artifact
        uses: actions/upload-artifact@v2
        with:
            name: graphql-api
            path: build/graphql-api.zip
      - name: Upload to release
        uses: JasonEtco/upload-to-release@master
        with:
          args: build/graphql-api.zip application/zip
        env:
          GITHUB_TOKEN: ${ { secrets.GITHUB_TOKEN } }
```

Please notice that `${ { secrets.GITHUB_TOKEN } }` in the code above must not have a space between `{ {`, and between `} }`, but for some reason my Eleventy site fails compiling it 🤷🏻‍♂️.

The workflow is like this:

The action, called `"Generate Installable Plugin, and Upload as Release Asset"`, is executed whenever a new release is created, i.e. whenever I tag my code, as defined in the `on` entry:

```yaml
name: Generate Installable Plugin, and Upload as Release Asset
on:
  release:
    types: [published]
```

The computer (called a "runner") where it runs is a Linux:

```yaml
jobs:
  build:
    name: Upload Release Asset
    runs-on: ubuntu-latest
```

The first step is to check out the source code from the repo:

```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
```

Then, it builds the WordPress plugin, by having Composer download the PHP dependencies and store them under `vendor/`. This is the crucial step, for which this action exists.

Because this is the plugin for production, we can attach options `--no-dev --optimize-autoloader` to optimize the release:

```yaml
      - name: Build project
        run: |
          composer install --no-dev --optimize-autoloader
```

Next, we will create the .zip file, stored under a `build/` folder. We first create the folder:

```yaml
          mkdir build
```

And then make use of [`montudor/action-zip`](https://github.com/montudor/action-zip) to zip the files into `build/graphql-api.zip`.

In this step, I also exclude those files and folder which are needed when coding the plugin, but are not needed in the actual final plugin:

- All hidden files and folders (`.git`, `.gitignore`, etc)
- Any `node_modules/` folder (there should be none, but just in case...)
- Development files ending in .dist (such as `phpcs.xml.dist`, `phpstan.neon.dist` and `phpunit.xml.dist`)
- Composer files `composer.json` and `composer.lock`
- Markdown files for managing the repo: `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `ISSUE_TEMPLATE.md` and `PULL_REQUEST_TEMPLATE.md`
- Folder `build/`, which is created only to store the .zip file
- Folder `dev-helpers/`, which contains helpful scripts for development

```yaml
      - name: Create artifact
        uses: montudor/action-zip@v0.1.0
        with:
          args: zip -X -r build/graphql-api.zip . -x *.git* node_modules/\* .* "*/\.*" CODE_OF_CONDUCT.md CONTRIBUTING.md ISSUE_TEMPLATE.md PULL_REQUEST_TEMPLATE.md *.dist composer.* dev-helpers** build**
```

After this step, the release will have been created as `build/graphql-api.zip`. Next, as an optional step, we upload it as an artifact to the action:

```yaml
      - name: Upload artifact
        uses: actions/upload-artifact@v2
        with:
            name: graphql-api
            path: build/graphql-api.zip
```

And finally, we make use of [`JasonEtco/upload-to-release`](https://github.com/JasonEtco/upload-to-release) upload the .zip file as a release asset, under the release package which triggered the GitHub action. The secret `secrets.GITHUB_TOKEN` is implicit, GitHub already sets it up for us:

```yaml
      - name: Upload to release
        uses: JasonEtco/upload-to-release@master
        with:
          args: build/graphql-api.zip application/zip
        env:
          GITHUB_TOKEN: ${ { secrets.GITHUB_TOKEN } }
```

When tagging the source code with tag `v0.1.20`, the action is triggered, and we can see in real-time what the process is doing. Once finished, if everything went fine, all the steps executed in the workflow will have a beautiful ✅ mark:

![GitHub action run and succeeded](/images/action-run.png "GitHub action run and succeeded")

Now, heading to the [releases for tag `v0.1.20`](https://github.com/GraphQLAPI/graphql-api/releases/tag/v0.1.20), it displays a link to the newly-create release `graphql-api`:

![Release asset success](/images/release-assets.png "Release asset success")

Hurray!

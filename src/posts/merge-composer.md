---
title: ⏱️ Merge Composer to speed up development time
metaDesc: Or how to override Composer dependencies with local files
socialImage: /images/composer.png
date: '2020-03-11'
tags:
  - composer
  - development
---

When your PHP project uses the great [Composer](https://getcomposer.org) to manage dependencies, and it links to your own dependencies which are being concurrently developed, and you have the source code for these dependencies in your local drive, then you can speed up development time by pointing the project's dependencies to your local folders, as I described [here](https://leoloso.com/posts/pointing-to-local-composer-packages/).

This strategy works great, however it has a problem: these dependencies, which are defined in `composer.json`, cannot be commited into the repository, since they are specific to the computer used for development. Until today, I had to remove these dependencies each time I made a change to this file, and then added them again.

No more! I just discovered a tool that manages to solve this problem: [composer-merge-plugin](https://github.com/wikimedia/composer-merge-plugin). This tool enables to merge several `composer.json` files, so now I can define another file, called `composer.local.json`, containing the dependencies pointing to my local folder:

```json
{
  "autoload": {
    "psr-4": {
      "Leoloso\\ExamplesForPoP\\": "../../../Libraries/leoloso/examples-for-pop/src"
    }
  }
}
```

This file was added to `.gitignore`, so it's just mine, not added to the repo.

Finally, in file `composer.json` we can merge the configuration with file `composer.local.json`:

```json
{
  "require": {
    "leoloso/examples-for-wp": "dev-master",
    "wikimedia/composer-merge-plugin": "^1.4"
  },
  "extra": {
    "merge-plugin": {
      "include": [
        "composer.local.json"
      ],
      "recurse": true,
      "replace": false,
      "ignore-duplicates": false,
      "merge-dev": true,
      "merge-extra": false,
      "merge-extra-deep": false,
      "merge-scripts": false
    }
  }
}
```

Now, if the file `composer.local.json` is present, it will override the src for dependency `"leoloso/examples-for-wp"`: instead of using the files from under `vendor/`, it will use the ones in my local repo, in my folder `Libraries/leoloso/examples-for-pop/src`, which I am currently developing, saving the time from having to execute `composer update` constantly.

Handy!
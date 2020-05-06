---
title: 😎 Adding symlinks in Lando to speed-up development
metaDesc: Testing changes got 50 times faster!
socialImage: /images/lando-logo.png
date: '2020-05-06'
tags:
  - wordpress
  - lando
  - development
---

My laptop just broke, but I was lucky enough to be lent another laptop to keep working until I can have mine fixed. 

I didn't want to mess up this computer installing all the software I need to run my development web server (MAMP, MySQL, configuring `hosts` and virtual hosts, configuring `php.ini`, what PHP version to use, what WordPress, and so on), so this was the perfect chance to start using [Lando](https://docs.lando.dev/), the Docker-based tool that simplifies setting-up development projects: just configure the requirements in a `lando.yml` file in the root folder of the project, run `lando start`, and voilà, my WordPress site will be up and running.

I hit a problem though: I want to be able to modify the source files, and visualize the changes on the site immediately, without having to sync files across folders, which takes time and makes the process rather cumbersome. In my previous MAMP-based set-up, I achieved this by creating symlinks to my source code in the site folders inside the webserver. Lando, however, runs inside Docker containers, where [symlinks are not allowed](https://stackoverflow.com/a/31885214), because my local files and your local files will be different and Docker attempts to create always the same output, no matter where it runs.

However, this issue can fortunately be solved: Lando [maps a few host locations to container locations](https://docs.lando.dev/config/files.html), including the home folder, which is mapped to `/user` inside the container. And the contents are kept in sync! Hence, because my source files are hosted under `~/GitHubRepos/`, I can reference them within the container as `/user/GitHubRepos/`.

The final step is to create the symlink within the webserver inside the container. For this, I configured a [Lando service](https://docs.lando.dev/config/services.html#build-steps) to execute the `ln` command to create the symlink. Since I'm developing a WordPress plugin called `"GraphQL API"`, instead of uploading a .zip file to install it, I created a symlink `graphql-api` under folder `/app/wordpress/wp-content/plugins` pointing to the plugin source files, which exist under `/user/GitHubRepos/graphql-api`, like this:

```yaml
name: graphql-api
recipe: wordpress
config:
  webroot: wordpress

services:
  appserver:
    run_as_root:
      - ln -s /user/GitHubRepos/graphql-api /app/wordpress/wp-content/plugins/graphql-api
```

This works perfectly! Now, when modifying the source code from my repository, I can see the changes take effect immediately on the testing website. 😎

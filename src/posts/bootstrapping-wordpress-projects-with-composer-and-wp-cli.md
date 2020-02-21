---
title: 😺 Bootstrapping a new WordPress site with Composer and WP-CLI
metaDesc: Or how to launch a WordPress site in seconds...
socialImage: /images/wordpress-logo.png
date: '2020-02-21'
tags:
  - wordpress
  - composer
  - wp-cli
  - guide
---

I wrote a guide on automating the launch of [WordPress](https://wordpress.org) sites through [Composer](https://getcomposer.org) and [WP-CLI](https://wp-cli.org/) for [Design Bombs](https://www.designbombs.com/):

[Bootstrapping WordPress projects with Composer and WP-CLI](https://www.designbombs.com/bootstrapping-wordpress-projects-with-composer-and-wp-cli/)

Following the method I described in this guide, it literally takes seconds to launch a new WordPress site, making it ideal when we need to launch multiple instances of a site (DEV, STAGING, PROD) or when we produce WordPress sites for clients. 

After we have created the database, and set-up the environment variables with its information, we just need to run:

```bash
$ composer create-project leoloso/wp-install new_wp_site
```

...and this script will install the new WordPress site:

![Bootstrapping a new WordPress site "Bootstrapping a new WordPress site"](/images/install-wp-thru-composer-script.gif)

The source code for this project is in [this repo](https://github.com/leoloso/wp-install). Enjoy!
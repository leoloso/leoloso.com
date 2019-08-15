---
title: Installing WordPress through Composer and WP-CLI
socialImage: /images/wordpress-logo.png
date: '2019-08-15'
tags:
  - wordpress
  - wp-cli
  - github
  - bootstrap
  - project
---

Some time ago, I wrote article [Using Composer With WordPres](shttps://www.smashingmagazine.com/2019/03/composer-wordpress/) for Smashing Magazine to describe how to integrate [WordPress](https://wordpress.org) and [Composer](https://getcomposer.org) together, with the aim to install WordPress more easily than through the official, manual way. One of my observations was that the installation process through Composer was a bit fragmented, since we still had to install the WordPress database and change the site URL manually (logging into `wp-admin`). One reader asked, through a comment, if it was possible to also automate this step through [WP-CLI](https://wp-cli.org/), the command-line interface for WordPress, and I was not so sure about it, since I had never tried.

Well, now I have tried, and I can say: Yes, it is possible. Moreover, to prove it, I have created a Composer project executing the missing extra steps through WP-CLI, and it works like a charm! Now, I can simply execute a simple command, and my WordPress instance will be installed in a matter of minutes, without any further intervention. I put all the code in this GitHub repo: [Install WordPress through Composer and WP-CLI](https://github.com/leoloso/wp-install).

<!--
Check out how it goes:

![Installing WordPress through the project](/images/....gif "Installing WordPress through the project")-->

If you need to quickly install WordPress, try out this project and let me know how it went. Enjoy!
---
title: 🚀 Coding in PHP 7.4 and deploying to 7.1 via Rector and GitHub Actions
metaDesc: Working around the PHP limitations for WordPress
socialImage: /images/coding-php-7-4-deploying-7-1-rector.png
date: '2020-11-11'
tags:
  - wordpress
  - plugin
  - rector
  - github
  - actions
---

I've written a step-by-step guide about transpiling PHP code, from PHP 7.4 to 7.1, when creating a WordPress plugin:

[Coding in PHP 7.4 and deploying to 7.1 via Rector and GitHub Actions](https://blog.logrocket.com/coding-in-php-7-4-and-deploying-to-7-1-via-rector-and-github-actions/)

It explains all the hows and whys:

- Why the target is PHP 7.1 and not 5.6
- Which are the PHP features from each PHP version that our code can support
- How to find out which 3rd party dependencies must be transpiled
- How to make Rector work specifically for WordPress
- Testing the downgrade through Travis
- Creating the WordPress plugin via GitHub Actions

Enjoy!
---
title: 🔪 Decoupling PoP from WordPress - How it was achieved
metaDesc: Doing things properly is hard work, but well worth it
socialImage: /images/wordpress-logo.png
date: '2019-11-29'
tags:
  - wordpress
  - laravel
  - symfony
  - cms
  - pop
  - smashing
---

When some time ago I started modernizing [PoP](https://github.com/GatoGraphQL/GatoGraphQL)'s codebase to using [Composer](https://getcomposer.org) as its foundational framework for package management, I decided to also decouple PoP's codebase from [WordPress](https://wordpress.org), making it CMS-agnostic. 

Oh boy, that was a lot of work, but sure it was all worth it: PoP can now run pretty much with any PHP-based framework, including [Symfony](https://symfony.com) and [Laravel](https://laravel.com/)! 

Yay!!!!!

<span style="font-size: 100px;">🤘🏻</span>

I have recently published an extensive account of it, split into 2 parts, for Smashing Magazine. If you need to:

👉 Migrate your WordPress PHP code to other platforms 

👉 Or re-use your Gutenblock PHP code for Laravel, Drupal

👉 Or make your application code more understandable, dealing only with business logic

👉 Or you are simply interested to know how the abstraction is accomplished

...then check my articles on Smashing:

- Part 1: [Abstracting WordPress code to reuse with other CMSs - Concepts](https://www.smashingmagazine.com/2019/11/abstracting-wordpress-code-cms-concepts/)

- Part 2: [Abstracting WordPress code to reuse with other CMSs - Implementation](https://www.smashingmagazine.com/2019/11/abstracting-wordpress-code-reuse-with-other-cms-implementation/)

Enjoy!
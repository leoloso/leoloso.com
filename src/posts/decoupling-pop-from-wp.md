---
title: 🔪 Decoupling PoP from WordPress - How it was achieved
metaDesc: Doing things properly is hard work, but well worth it!
socialImage: https://leoloso.com/images/pop-logo-whitebg.png
date: '2020-10-29'
tags:
  - wordpress
  - laravel
  - symfony
  - cms
  - pop
  - smashing
---

Several months ago I started doing the migration of [PoP](https://github.com/leoloso/PoP)'s codebase to using Composer as its foundational framework for package management. In that moment, I decided to also decouple PoP's codebase from WordPress, making it CMS-agnostic. 

Oh boy, that was a lot of work! But sure it was all worth it! As a consequence, PoP can now run pretty much with any PHP-based framework, including [Symfony](https://symfony.com) and [Laravel](https://laravel.com/)! 

Yay!!!!!

If you are interested to know how the abstraction was accomplished, I have recently published an extensive account of it (split into 2 parts) for Smashing Magazine. Check it out here:

- Part 1: Abstracting WordPress code to reuse with other CMSs - Concepts
- Part 2: Abstracting WordPress code to reuse with other CMSs - Implementation

Enjoy!
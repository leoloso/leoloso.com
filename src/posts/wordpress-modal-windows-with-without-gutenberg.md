---
title: 🙃 Opening modal windows in the WordPress admin, with/out Gutenberg
metaDesc: Different ways to accomplish the same thing
socialImage: /images/wp-gutenberg-guide.jpg
date: '2020-06-30'
tags:
  - wordpress
  - gutenberg
---

I have recently wrote 2 articles which, in general terms, accomplish the same objective: to show documentation to users of my plugin through a modal window in the WordPress admin. However, they use 2 different strategies: with and without Gutenberg.

🎩 [Adding a Custom Welcome Guide to the WordPress Block Editor](https://css-tricks.com/adding-a-custom-welcome-guide-to-the-wordpress-block-editor/) explains how to leverage the `<Guide>` component from Gutenberg:

![Opening a modal window with Gutenberg](/images/wp-welcome-guide-with-gutenberg.gif "Opening a modal window with Gutenberg")

I required a few days of work to pull out this strategy.

💣 [Adding Modal Windows in the WordPress Admin Without JavaScript](https://www.designbombs.com/adding-modal-windows-in-the-wordpress-admin/) explains how to use the existing modal windows from the plugins page to display arbitrary content, using only PHP and a bit of CSS:

![Opening a modal window without Gutenberg](/images/wp-modal-window-without-gutenberg.gif "Opening a modal window without Gutenberg")

It took me just a few hours to implement this strategy.

In practical terms, both solutions succeeded to open the modal window. The user experience using Gutenberg is very polished, the one without feels hacky. At the same time, the effort of doing something with Gutenberg is much higher than without.

Which solution is better? As always, it depends. If a compelling user experience is mandatory, then Gutenberg is the way to go. But if you just need a simple solution and don't have time or money to spare, a simple hack in the WordPress admin might already do.

---
title: 💋 Hylia rocks!
metaDesc: This is how I launched my personal blog in just a few hours...
socialImage: /images/hylia.png
date: '2019-08-19'
tags:
  - hylia
  - eleventy
  - jamstack
  - blog
  - pop
  - indieweb
---

Welcome to my blog, which took 2 years for me to launch, but actually 2 hours to code and deploy! My quest to have my own blog, which was delayed for a loooong time (for reasons I'll explain below), was resolved in less time than a Bollywood film (not that I'm a fan of them, but every now and then they cheer me up). 

How so quick? It's not due to magic, even though it feels like it. It's all because of [Hylia](https://hylia.website/), a starter kit for static site generator [Eleventy](https://11ty.io/) and readily deployable to [Netlify](https://netlify.com). The site you're currently browsing is simply a fork of the [Hylia repo](https://github.com/andybelldesign/hylia), customized with my own colors and a few other modifications here and there. And even though I'm terrible at design (CSS is not my forte), it looks quite neat!

I chose Hylia for two main reasons (excluding the fact that it is open source 😀❤️): because it is extremely quick to set-up (as I just mentioned) and extremely powerful. Indeed, watching the site be compiled automatically whenever I press "Ctrl + S" in VSCode, deployed to my localhost, and hot reloaded in the browser, is a breathtaking experience. I love it!

The other motivation is the JAMstack: whichever framework/technology/language I chose for my own blog, I wanted it to be based on a static site generator, so my site could benefit from the speed of being accessed straight from a CDN (and Netlify provides the hosting for free!). I have considered also using [Hugo](https://gohugo.io) and [Gatsby](https://www.gatsbyjs.org/), and even though Eleventy won the first battle, I still plan to go back to them at some point, maybe for some other project.

Finally, Hylia stands out not only in its present but also, hopefully, in its future: its roadmap delineates the addition of Webmentions (to be part of the [IndieWeb](https://indieweb.org/), yay!) and comments already integrated with Netlify forms. 

(Unfortunately, comments in the JAMstack seem to be a thorny issue that nobody has successfully solved to date. For instance, storing comments in all-purpose forms is not an ideal solution, since then comments have only one level of depth. However, this solution is still better than no comments at all, so I welcome it until somebody implements something more appropriate). 

## Why so long to implement my blog?

In the IndieWeb there's the concept of [selfdogfooding](https://indieweb.org/selfdogfood): If you are implementing some functionality, you yourself must be using it, in your own website. Otherwise, how can you possibly convince others to use it, when it doesn't even convince or suit you? (This way of thinking is related to the "you must do what you preach" philosophy.)

![Selfdogfooding?](/images/selfdogfooding-1024.jpg "Selfdogfooding? (Image by eddiemcfish - flickr.com/photos/eddiemcfish/860062709)")

I fully believe in this premise, and I attempt to adhere to it as much as possible. In this case, I am the creator of [PoP](https://github.com/leoloso/PoP), an API + component model + framework for building sites in PHP, and, of course, I should be using PoP for building my own blog! (fortunately, PoP also can export the site as static to have it deployed on a CDN). However, PoP is not ready for building sites yet (only the API-building functionality has been finished; site-building comes next), and it has not been for a couple of years. Hence my delay! 

A few months ago I decided that enough is enough, that I should implement my blog no matter how, and once PoP is ready, then migrate it. My current blog is, then, only temporary (maybe between 6 months and 1 year). Common sense would dictate that I couldn't use a complex framework that takes plenty of time to set-up, code and deploy. And that's why Hylia, with its simplicity yet great power, has been a great choice 🤘🏽. Thanks [Andy](https://twitter.com/andybelldesign)!
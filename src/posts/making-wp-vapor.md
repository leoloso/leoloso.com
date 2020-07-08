---
title: 🤔 Bringing Laravel Vapor to WordPress, anyone?
metaDesc: Laravel Vapor just blew my mind. We should have this for WordPress too.
socialImage: /images/vapor-logo.png
date: '2019-08-26'
tags:
  - wordpress
  - laravel
  - vapor
  - php
  - serverless
---

I just watched the introduction by [Laravel](https://laravel.com)'s founder Taylor Otwell of [Laravel Vapor](https://vapor.laravel.com), a new managed solution for Laravel applications that is fully based on the "serverless" concept, enabling to deploy PHP applications without having to worry about the server. Absolutely amazing! This is the talk:

<iframe width="966" height="543" src="https://www.youtube.com/embed/XsPeWjKAUt0?list=PL-yJve--iT5qZzp0VzYaPA7ZohLl6tSdp" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Vapor relies completely on the [AWS](https://aws.amazon.com) cloud. By integrating Laravel and AWS, Vapor enables to deploy Laravel applications to the cloud with the following benefits:

- "Serverless": no need to worry about provisioning/configuration of servers
- Auto-scaling
- Pay only for what you use
- Atomic deployments and rollbacks
- Multiple environments
- Database snapshots to restore in case of trouble
- Attach public/private databases
- Many more

From all of these, the one benefit that most resonates with me is **letting go of the server**. Managing servers has time and again proved difficult, requiring fine tuning between the incoming traffic, server power and money to spend on it. Even though the AWS cloud allows for autoscaling, sometimes even the lowest viable unit to provision for production, such as an AWS EC2 small instance, may prove too much power for the requirements of the application. (From my experience, micro and nano instances are not fully reliable, since they soon run out of steam and must be restarted, and the small instance may be too expensive for my needs. For instance, I'm currently hosting a demo of the [PoP API](https://github.com/leoloso/PoP) in its own server, under [https://newapi.getpop.org](https://newapi.getpop.org/posts/api/?datastructure=graphql&fields=id|title|url|content,author.id|name|url,author.posts(searchfor:template;limit:2;order:title|asc).id|title), and its monthly cost is not negligible).

Until today there was no way around this issue for PHP. Hence the recent total victory of the [JAMstack](https://jamstack.org/): Since it is composed of static files (HTML/JS/CSS), you can host your website directly on the cloud. Not only its speed is incredibly fast, but also, through [Netlify](https://netlify.com), it is free! How could PHP beat that? Well, it couldn't!

That is until now. What Taylor Otwell seems to have achieved is to execute PHP code through the "serverless" architecture. Then, we can simply push our code to a GitHub repo, and through continuous integration it will execute a command to deploy the PHP application to the cloud. In Vapor, currently, assets are uploaded to the CDN and PHP code is executed as serverless functions. However, it is not difficult to create a PHP application that can be pre-rendered as static HTML files which, together with the assets (JS/CSS), is uploaded to the CDN, and the dynamic portion of the application (such as the user log in, sending emails, adding comments, etc) is taken care of by serverless functions running PHP code. The beauty of this scheme is that it will be as fast as the JAMstack, since the application is also deployed to a CDN, however it also supports dynamic functionality as part of the application itself! Then, we need to code only one single application in PHP that has both static and dynamic behaviour. A very simple stack. One single technology to learn. All the power from PHP. How can you possibly beat that? You can't!

This is what I call the JAMPstack: JAMstack + PHP.

I must emphasize this: the JAMstack will be no match for JAMPstack, because it is much more complex (usually composed of several moving parts, interacting with each other) and more disconnected (different services each holding different pieces of content cannot produce the same functionality as when all content is centralized). For instance, nobody has provided a proper solution for comments in the JAMstack: The Netlify solution is to store comments in all-purpose forms, which doesn't allow comments to have more than one level of depth; another solution is to save comments as markdown files inside the repo, however its execution takes ages, making the experience for the user who wrote the comment and is waiting for feedback far from optimal. The JAMPstack will deliver all the expected JAMstack behaviour, plus providing the usual advantages of executing "server-side" code to support dynamic functionality.

(The other victory of the JAMstack belongs to JavaScript, because it supports the concept of "components", as provided by libraries React and Vue, creating a wonderful development experience. However, my own project [PoP](https://github.com/leoloso/PoP) provides an implementation of components for the back-end, which I'm still working on but should soon be ready, enabling PHP to have support for components too.)

PHP is not necessarily in decline, since it still is the most widespread language powering the web. However, it has for a few years now lost its attraction for developers, who were jumping in droves to the JavaScript side, attracted by the convenience of the JAMstack. Now, we can claim those developers back to the back-end, and PHP can become a top language of choice for the development world, once again! Isn't that a fascinating thought? 

## Bringing it to WordPress, anyone?

So far, so good. However, there is one caveat (at least for me): I'm most interested in WordPress, and even though doing the jump to Laravel is extremely attractive, I believe that this solution would make the most impact if it could support WordPress. Imagine 1/3rd of the web suddenly becoming "serverless"... Wouldn't that be amazing?

Now, I have no clue if WordPress could be ported into the serverless architecture. Laravel truly seems to be ahead of the curve, planning its next move way before anyone else, so this new feature follows as a consequence from all the previous features they implemented: For instance, Laravel natively supports [queues](https://laravel.com/docs/5.8/queues), which play an important role in the serverless architecture, and which WordPress does not currently natively support. Hence, right now porting WordPress to something similar to Laravel Vapor is a big if. Can it be done? Would it be feasible, even if not all features can be supported? Would it even make sense? I have no response to all of these questions.

However, good news is that [Laravel Vapor is open source](https://github.com/laravel?utf8=%E2%9C%93&q=vapor&type=&language=). So the task at hand would not start from scratch: We can evaluate how Taylor built his solution, and analyze if it can be ported to WordPress, how easily of difficult it would be to do. Doesn't this seem like a wonderful task to work on?

So, here is my proposal: If you are reading this, and you feel excited by this prospect, then let's do it! If you are a developer keen to join, please let me know in [this Twitter thread](https://twitter.com/losoviz/status/1165848933454643201) (comments are still not enabled in my JAMstack blog 😂). If you're an investor eager to find a new exciting venture, and would be willing to fund this project, please send me a DM. 

Please spread the word 🙏. Thanks for reading!

## Update 27/08: Maybe there's no need for WordPress Vapor after all! 

I just found a tool that enables to read the WordPress database from within Laravel: [Corcel](https://github.com/corcel/corcel). Then, we can create an application based on a stack including both WordPress and Laravel:

- 👉 Client-facing back-end/admin side based on WordPress, enabling to generate content through Gutenberg
- 👉 User-facing application based on Laravel, deployed as "serverless" PHP through Laravel Vapor

This is a beautiful stack, which obtains the best of both worlds: Great content creation through Gutenberg, while removing the need to provision/maintain servers through Laravel Vapor. 😺

## Update 08/07: Somebody is working on a serverless WordPress!

Carl Alexander was equally impacted as I was when watching Taylor Otwell's presentation. But while I merely talked about it, he actually [decided to build a serverless WordPress solution](https://carlalexander.ca/wordpress-serverless-platform/). 

This is how his project, [Ymir](https://ymirapp.com/), looks so far:

<iframe width="1194" height="672" src="https://www.youtube.com/embed/SIXBwcEOIck" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Let's hope he finishes it soon!

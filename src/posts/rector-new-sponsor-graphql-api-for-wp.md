---
title: 🎉 I got my 1st big sponsor for the GraphQL API for WordPress
metaDesc: A huge step forward to keep doing open source
socialImage: /images/graphql-by-pop-logo.jpg
date: '2020-10-13'
tags:
  - graphql
  - api
  - plugin
  - sponsorship
---

My plugin [GraphQL API for WordPress](https://github.com/GraphQLAPI/graphql-api-for-wp) just got a new sponsor!

![My new sponsor](/images/tomas-sponsor.png "My new sponsor")

This is [the second sponsor](https://github.com/sponsors/leoloso/) that I get, and the first one at the u$d 1400/m tier (the other was is at u$d 70/m).

This is a huge step forward, since it gives me the economic certainty as to keep developing the plugin (at least for the short/medium term... I still need a few more sponsors for it to become a living wage and long-term economic reliability).

I'll describe how it happened.

## The road to sponsorship

Several weeks ago, there was a [proposal to introduce a fixed schedule to WordPress](https://make.wordpress.org/core/2020/08/24/proposal-dropping-support-for-old-php-versions-via-a-fixed-schedule/) to bump the minimum required PHP version. Among the comments, [one of them](https://make.wordpress.org/core/2020/08/24/proposal-dropping-support-for-old-php-versions-via-a-fixed-schedule/#comment-39591) struck me:

> So effectively this means that we cannot use PHP 8 syntax in themes/plugins if we want to support all WordPress versions until December 2023, 3 years after it has been released. This is very disappointing.

I work with WordPress. My plugin is for WordPress. Not being able to use the latest PHP features in 3 more years feels very disempowering.

So I decided to look for some solution, and I discovered [Rector](https://github.com/rectorphp/rector/), a tool to reconstruct PHP code based on rules. It is like [Babel](https://babeljs.io/), but for PHP. I asked if I could use Rector to transpile code from PHP 7.4 to 7.1, and they said yes, it could be done, but the rules to do it had not been created yet.

So I created them.

I contributed to this open source project full time for some 2 weeks, and produced some 15 rules to downgrade code, which I have applied to my plugin: Now I can code it [using features from PHP 7.4](https://github.com/GraphQLAPI/graphql-api-for-wp#supported-php-features) (and even from PHP 8.0), and release it to run on PHP 7.1, so it can still target most of the WordPress user base (only users running PHP 5.6 and 7.0 are out). That's a huge win!

After implementing those 15 rules, I [documented the remaining rules](https://github.com/rectorphp/rector/issues?q=is%3Aissue+is%3Aopen+%22%5BDowngrade+PHP%5D%22+) to downgrade PHP code, and called it a day. I didn't mind working on them, but I didn't have the time to do it. Nevertheless, I also created this task as a [sponsorable feature for my plugin](https://github.com/GraphQLAPI/graphql-api-for-wp/issues/56); if anyone sponsored my time to work on it, I could then attempt to finish the task.

Well, [Tomáš Votruba](https://tomasvotruba.com/), creator of Rector, liked my contributions so he decided to become my sponsor.

Yay! 🍾 🎉 🎊 🥳 🍻 🥂

In exchange, I'll work on the downgrade rules, and even attempt to have Rector itself run on PHP 7.1.

## Nature of the sponsorship

Now, let's be clear: Tomáš is sponsoring me to work on Rector, not on GraphQL API for WordPress. That's why the sponsoring tier is u$d 1400/m, since it involves me working on the sponsor's repo.

While I get to increase the price for the tier, it makes no difference to me if the code is in my repo or my sponsor's: when I first worked those 2 weeks, it was for the benefit of my own plugin anyway, even if the code does not belong to my project.

Ultimately, where the code lives is not really important. What is important is that my project (and, for that matter, any project based on PHP) will be able to benefit from it.

In addition, anyone from the PHP community who starts using Rector because of my work on it, may learn that it was the GraphQL API for WP that made it possible, so I gain face and recognition.

So I think this is a win-win-win for all parties involved:

- Tomáš gets Rector expanded, supporting a broader set of use cases
- I get the sponsorship money, and the associated badge of recognition from having a big sponsor
- My plugin GraphQL API for WordPress can use the new rules to use new PHP features (which was my objective all along)
- The WordPress community can implement this same strategy for their own themes and plugins
- Other PHP-based projects can also use it

## Takeaways

Some personal takeaways from this experience:

- Contributing to open source projects may pay off
- Looking for synergies may pay off. Rector and my plugin can benefit from each other. Contributing to Rector is contributing to the GraphQL API for WP
- Getting sponsors is tough, mainly at the beginning. They may not come to you. So you need to (directly or indirectly) go to them
- I'm working on my plugin for the long run, and its being successful depends on many small victories, like this one

## Coming next

My next step is to share my work on Rector with the broader WordPress and PHP communities: I've just published [an intro to downgrading from PHP 8.0 to 7.x](https://blog.logrocket.com/transpiling-php-code-from-8-0-to-7-x-via-rector/), and in a few weeks I'll publish a step-by-step guide on transpiling code for a WordPress plugin, using my repo as the example.

Hopefully, along the way I'll be able to get new sponsors, and eventually achieve long-term economic certainty with my plugin 😀

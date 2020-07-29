---
title: ❓ Why I built GraphQL API if there was WPGraphQL?
metaDesc: Personal, technological, and other reasons...
socialImage: /images/interactive-schema.png
date: '2020-07-29'
tags:
  - wordpress
  - graphql
  - api
  - plugin
---

I announced the launch of my GraphQL API [on Reddit](https://www.reddit.com/r/graphql/comments/hvucw2/i_finally_released_my_graphql_api_for_wordpress/), and I got this question:

> Why build your own when one already , and is developed by a gatsby dev?

I reproduce my response here.

## Why I built GraphQL API when there already was WPGraphQL

I can reply to this question from 3 different angles:

### 1. Personal angle

I actually started working on this project much earlier than WPGraphQL. It's just that, when I started with it, I didn't know it would eventually become a GraphQL server for WordPress, or even a GraphQL server!

I started the mental process of thinking about my solution after I published this article on Smashing Magazine, describing an architecture of server-side components to load data:

[https://www.smashingmagazine.com/2019/01/introducing-component-based-api/](https://www.smashingmagazine.com/2019/01/introducing-component-based-api/)

This article describes the foundation of how my GraphQL server works. It was published in January 2019, before Jason Bahl was even hired by Gatsby.

Around then I learnt about GraphQL, and how it returns exactly the queried data. And with my architecture, I was already solving that problem, and beautifully, since it doesn't employ a graph, so it's super performant.

So then, I had no alternative towards myself than to go ahead, and implement the GraphQL server. It took around 1 year to do. But in the process, I built it to be super super powerful, as I've been trying to show in my series of articles for LogRocket, and sharing in this channel [/r/graphql in Reddit].

And concerning the component-based architecture, when did I start working on it? Its repo, [https://github.com/leoloso/PoP](https://github.com/leoloso/PoP), was actually published in September 2016!

So I was working on my GraphQL server way back before I even knew about the existence of GraphQL.

Btw, Jason is doing a great job with WPGraphQL. Launching an alternative to his project is not about posing a challenge. We just happen, by chance, to have implemented 2 different solutions to the same problem...

### 2. Technological angle

I don't want to sound arrogant, I truly do not want. But my solution is better. Indeed, I meant it in my original post when I said this is serious GraphQL business. I'm extremely proud of what features it supports and, the best of all, is that the features it can potentially implement are boundless, thanks to the directive pipeline architecture that I described here:

[https://blog.logrocket.com/treating-graphql-directives-as-middleware/](https://blog.logrocket.com/treating-graphql-directives-as-middleware/)

WPGraphQL is, on the opposite, quite limited. Its support for directives is quite paltry. This is because it relies on webonyx/graphql-php, which is OK, but nothing great.

I have just published a blog post, comparing my plugin to both WP REST API and WPGraphQL, and explaining what makes my plugin special from a feature-point-of-view. Please read it:

[https://leoloso.com/posts/introducing-the-graphql-api-for-wordpress/](https://leoloso.com/posts/introducing-the-graphql-api-for-wordpress/)

### 3. Why not angle

I understand the feeling that, if somebody is working on an open source project about the topic I want to implement, then I should contribute there instead of doing my own thing.

But that doesn't apply if your idea to solve the problem is completely different, and can solve the problem better. Imagine if we had declared the problem of search solved by 1994, so that Google would not have been created, and we'd still be searching with Altavista nowadays.

In addition: creating another project brings innovation and improvement all across. Now that my project is out, WPGraphQL has to improve. I'm providing persisted queries. They are not. They will need to implement it, or risk having their users switch to my plugin. Can they implement it? I hope their architecture supports it (I guess it should), but I don't know for sure. What if I had contributed to their project, instead of working on mine? Well, then I couldn't have created 1/10th of what I did using my own architecture.

Have I convinced you with my explanation? 😀
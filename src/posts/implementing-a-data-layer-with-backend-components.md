---
title: How implementing a data layer through back-end components gave PoP so much power!
metaDesc: Sorry GraphQL, but "ComponentQL" kicks your ass 😅
socialImage: /images/lego.png
date: '2020-08-25'
tags:
  - pop
  - components
  - back-end
  - php
  - data
---

I recently [blogged about](/posts/components-on-the-backend) how PoP seems to be the only library/framework implementing components on the back-end side. This post is a continuation of that one, further demonstrating the great power of components into creating a sound architecture for the application.

Components are usually conceived solely for rendering the view of the application. In the case of PoP, a wonderful and unexpected development took place: back-end components can also be used to create APIs (to retrieve data from the database) in an incredibly easy way, and producing exceptionally powerful results!

Some time ago, before this development took place (which I shall describe below), I wrote article [Introducing The Component-Based API](https://www.smashingmagazine.com/2019/01/introducing-component-based-api/) for Smashing Magazine. Through comments, reader Alain asked what was the point of offering an API that already decides what the response will be, not allowing the client to fetch the data that it requires. In that moment, I didn't have a proper response to his common-sense question, so I kind of justified my way out of it.

However, thinking about it and realizing he was right, a solution to implement GraphQL-like capabilities (i.e. being able to define what data fields the API must retrieve) into PoP came to my mind. And through components, its implementation took only 3 days! That was just incredible.

Yet, the PoP API was not very useful because its data structure was different to what developers nowadays expect: to mirror the same data structure from the query, as done by GraphQL. After a developer gave me this impression, I was thinking about this problem. And lo and behold, after a few days of thinking about it, the solution came to my mind, and through components, I implemented it in only 2 days! And since here I was, I also added [field modifiers](https://github.com/leoloso/PoP#field-modifiers) in only 1 day!

So now PoP, in addition to giving the response in its own native format, can also return it as GraphQL, for free! The only difference is parameter `datastructure=graphql` in the URL. Check this out:

_List of posts + author data:_

- GraphQL: https://nextapi.getpop.org/posts/api/?datastructure=graphql&fields=id|title|date|url,author.id|name|url,author.posts.id|title|url
- PoP native: https://nextapi.getpop.org/posts/api/?fields=id|title|date|url,author.id|name|url,author.posts.id|title|url

_List of users + up to 2 posts for each, ordered by date:_

- GraphQL: https://nextapi.getpop.org/users/api/?datastructure=graphql&fields=id|name|url,posts(limit:2;order:date|desc).id|title|url|date
- PoP native: https://nextapi.getpop.org/users/api/?fields=id|name|url,posts(limit:2;order:date|desc).id|title|url|date

_Author + all posts, with their tags and comments, and the comment author info:_

- GraphQL: https://nextapi.getpop.org/author/themedemos/api/?datastructure=graphql&fields=id|name|url,posts.id|title,posts.tags.id|slug|count|url,posts.comments.id|content|date,posts.comments.author.id|name
- PoP native: https://nextapi.getpop.org/author/themedemos/api/?fields=id|name|url,posts.id|title,posts.tags.id|slug|count|url,posts.comments.id|content|date,posts.comments.author.id|name


I don't know if this impresses you, but the fact that just me alone, in barely a few weeks, has been able to replicate the functionality of a well-designed API (backed by internet-behemoth Facebook) such as GraphQL doesn't stop impressing me. And it is all because of back-end components! It's time for the world to appreciate them.


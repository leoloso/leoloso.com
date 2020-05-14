---
title: 📺 Creating persisted GraphQL queries
metaDesc: Demo using the GraphQL API for WordPress plugin
socialImage: /images/video-thumb-graphql-api-for-wp-persisted-query.jpg
date: '2020-05-14'
tags:
  - graphql
  - api
  - wordpress
---

One of the issues with GraphQL is its lack of security: the single endpoint it provides can be accessed by anyone, legit users but also attackers trying to get private data, or attempt to bring the server down by sending complex queries.

My upcoming GraphQL API for WordPress plugin offers a solution to this problem: it enables to create "persisted queries", where users can create/publish the query in advance, and remove access to the endpoint. Then, all interaction with the GraphQL server can be done through these admin-generated, pre-approved routes only. 

It's a huge win: private data is never exposed, and admins need not worry about attackers sending complex queries to bring the server down.

Check it out in the screencast below, which I recorded using the plugin in my development environment:

<iframe src="https://player.vimeo.com/video/413503547" width="640" height="400" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

In the screencast, I do the following things:

- Create a new persisted query, which is a Custom Post Type in WordPress
- Give it title "Post list". Its permalink, which will be `/graphql-query/post-list/`, is the persisted query's endpoint to access the data
- Create variable `$offset`, with an initial value of `0`
- Create the query, simply by clicking on all the fields from the GraphiQL Explorer
- Run the query on the GraphiQL client, and get the response
- Scroll down, and check that option `"Accept variables as URL params"` is on
- Publish the query
- Open its permalink in a new tab, obtaining the response through the newly-exposed endpoint
- Pass a URL param `offset` with value `5` and load the page, obtaining the new response

Coooool, right? 😎

Btw, the GraphQL API for WordPress plugin will be released in barely a few weeks! 😎 😎 😎

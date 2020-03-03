---
title: 🥊 Code-first vs. schema-first development in GraphQL
metaDesc: Which approach is better?
socialImage: /images/graphql-logo.png
date: '2020-02-27'
tags:
  - graphql
  - server
  - guide
  - pop
---

I wrote my third article for the [LogRocket Blog](https://blog.logrocket.com/), where I explain my journey on conceptualizing, designing and implementing a [GraphQL](https://graphql.org) server, as I have done for [GraphQL by PoP](https://graphql-by-pop.com):

[Code-first vs. schema-first development in GraphQL](https://blog.logrocket.com/code-first-vs-schema-first-development-graphql/)

This article describes the 2 approaches to implementing a GraphQL server:

- Schema-first: we first define the schema for the GraphQL service using the [Schema Definition Language](https://www.howtographql.com/basics/2-core-concepts/) (or SDL) and then we implement the code by matching the definitions in the schema
- Code-first: we start by coding the resolvers, and then, from code as a single source of truth, we have the schema generated as an artifact

In the article I compare both approaches, listing down the advantages and drawbacks of each, recommending when to use one or the other, and finally expressing why I prefer the code-first approach since it enables to support a myriad of features in [GraphQL by PoP](https://graphql-by-pop.com) which would not be feasible otherwise.

This is an ongoing series, and coming soon will be more article on the different strategies employed to tackle all different concerns: decentralization, federation, security, and others.

Enjoy!
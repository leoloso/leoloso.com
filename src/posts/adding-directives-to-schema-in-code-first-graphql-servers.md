---
title: 🚀 Adding directives to the schema in code-first GraphQL servers
metaDesc: No SDL? No problem!
socialImage: /images/adding-directives-graphql-schema-code-first.png
date: '2020-09-08'
tags:
  - pop
  - graphql
  - development
---

I wrote a new article for my series on designing a GraphQL server for the LogRocket block:

[Adding directives to the schema in code-first GraphQL servers](https://blog.logrocket.com/adding-directives-schema-code-first-graphql-servers/)

This time, I explore several topics:

- A strategy to add directives to the schema when there is no SDL
- Decoupling the query into 2: requested and executable
- A potential solution for implementing the flat chain syntax
- Adding directives to the schema by configuration, not code
- Server-side field aliases

Now that the [GraphQL API for WordPress](https://github.com/leoloso/PoP/tree/master/layers/GraphQLAPIForWP/plugins/graphql-api-for-wp) has been released, I can use it to demonstrate the IFTTT feature, to add directives to the schema by configuration, not code:

![Adding directives by configuration in the GraphQL API for WP](/images/ifttt-for-access-control.gif "Adding directives by configuration in the GraphQL API for WP")

As always, I hope you enjoy it!
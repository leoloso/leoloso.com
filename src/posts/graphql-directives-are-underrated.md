---
title: 😳 GraphQL directives are underrated
metaDesc: A powerful feature doesn't get the attention it deserves
socialImage: /images/graphql-directives-are-underrated.png
date: '2020-05-13'
tags:
  - graphql
  - server
  - writing
---

Not many articles (if any) comparing REST and GraphQL mention directives to be a key differentiator. Yet, I believe that directives are one of the most powerful features in GraphQL, which alone justifies migrating an API from REST to GraphQL. 

Coming from this realization, I wrote piece [GraphQL directives are underrated](https://blog.logrocket.com/graphql-directives-are-underrated/) to bring out all the beauty from directives:

- What are directives
- What different types of directives there are
- How they make GraphQL better
- Why directives are still not perfect

As I argue in my article, because most (if not all) new development in GraphQL is initiated through directives, GraphQL servers with good support for custom directives will lead GraphQL into its future. Conversely, APIs implemented on servers with poor support may eventually become stagnant, making them a poor investment for the long-term.

Hence, when searching for a GraphQL server for your new API, priority should be given to their support for custom directives. This is such a strong belief for me, that I coded [GraphQL by PoP](https://graphql-by-pop.com) (my own GraphQL server, implemented in PHP) to have directives as its very architectural foundation. Even calling resolvers is executed through a directive!

(Btw, this will be the topic of the upcoming article on my GraphQL series 😎)

---

Piece [GraphQL directives are underrated](https://blog.logrocket.com/graphql-directives-are-underrated/) is part of a series I'm writing for the [LogRocket blog](https://blog.logrocket.com/), where I explain my journey on conceptualizing, designing and implementing a [GraphQL](https://graphql.org) server, as I have done for [GraphQL by PoP](https://graphql-by-pop.com).

Enjoy!
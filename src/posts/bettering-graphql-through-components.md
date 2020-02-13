---
title: 😎 Components all the way down - A better GraphQL implementation!
metaDesc: Components make GraphQL shine... take that, schema!
socialImage: /images/pop-logo-whitebg.png
date: '2019-10-30'
tags:
  - pop
  - api
  - graphql
  - schema
---

I have recently [introduced a new implementation of GraphQL for PHP](/posts/intro-to-schemaless-graphql-api-for-pop/), which is based on the [PoP API](https://github.com/getpop/api). In this post, I will write about the improvements that using the component-based architecture can achieve over a typical schema-based implementation of GraphQL.

### Improved Speed and Safety

The time complexity to execute queries is much lower: Whereas [GraphQL's is exponential](https://blog.acolyer.org/2018/05/21/semantics-and-complexity-of-graphql/) (`O(2^n)`), PoP's is just quadratic (or `O(n^2)`) in worst case, and linear (or `O(n)`) in average (where `n` is the amount of nodes in the query graph). As a consequence, executing deeply nested queries will take lower time, and the risk of Denial of Service attacks is also reduced.

### Support for Public/Private API, One-Graph solution for everything

Because the schema is dynamically built from a component model, it can decide to incorporate or discard different elements based on different factors or situations. As such, these use cases can be easily implemented:

**Make an API that is both public and private**, by enabling certain fields only if the user is logged-in, or if the user has a specific user role (such as `admin`)

**Build a One-Graph solution for everything**, creating a customizable gateway to different services (Twitter, Salesforce, Slack, Stripe, etc) from a single endpoint

### Field-based Cache-control

Through a special directive, each field can indicate its `cache-control` configuration, and the request will calculate the overall cache-control based on all the requested fields: 

- If any field cannot be cached (such as those with user state), then the request is not cached
- Otherwise, the request is cached using the lowest value

### Decentralization

GraphQL's schema requires a type definition to live on a single location, making it difficult for team members to collaborate, often leading to a monolith architecture, or to the need to set-up special tooling to generate the schema. 

Because PoP is not based on the Schema Definition Language (or SDL), it overcomes these drawbacks, and supports:

- Cleanly splitting the data model into different responsibilities (implemented by different, disconnected teams), without the need to set-up special tooling
- Deprecation of fields based on the needs from the team/project, not on the API schema definition
- Overriding of field resolvers (eg: to test new features or provide quick fixes)

Check out these examples:

_**Normal behaviour**:_<br/>
[?query=posts.id|title|excerpt](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|excerpt)

_**Overriding behaviour #1** (available under the `"experimental"` branch):_<br/>
[?query=posts.id|title|excerpt(branch:experimental,length:30)](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|excerpt(branch:experimental,length:30))

_**Overriding behaviour #2** (available under the `"try-new-features"` branch):_<br/>
[?query=posts(limit:2).id|title|content|content(branch:try-new-features,project:block-metadata)](https://nextapi.getpop.org/api/graphql/?query=posts(limit:2).id|title|content|content(branch:try-new-features,project:block-metadata))

### Federation, coming soon

Imagine that you need to implement the following functionality:

- In some system, you have a REST API endpoint returning the subscribers to a newsletter: a list of `email` and `lang` fields
- In another system, you have a database with user information: rows of `id`, `email` and `name` fields
- In another system, you have blog posts
- You want to send the content of a blog post in a newsletter to all your users, like this:


    Hi {name},
    
    welcome to our weekly newsletter! Our post from today:
    
    {post-title}
    
    {post-content}

- The newsletter must be translated to the user's preferred language!

How would you do that using a standard GraphQL implementation? Would you believe me if I say that it can be resolved in only 1 line, and without implementing any custom server-side code?

<span style="font-size: 80px;">🤔</span>

<!--
Oh yes! Coming soon: PoP will soon feature a mechanism to resolve complex queries without server-side coding, purely based on composing operations indicated through the query.
-->

I will keep you posted 🤔


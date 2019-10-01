---
title: 😎 Components all the way down - Beating GraphQL in its own game!
metaDesc: The PoP API becomes what GraphQL wishes it could become...
socialImage: https://leoloso.com/images/pop-logo-whitebg.png
date: '2020-10-01'
tags:
  - pop
  - api
  - graphql
  - feature
---

I have recently written about how the [PoP API become the first schemaless implementation of GraphQL](/posts/pop-api-first-schemaless-graphql/). In this post, I will write about the improvements that the PoP API has designed, and implemented, over GraphQL.

## Features

In addition to satisfying the GraphQL specification, PoP also provides its own set of features that GraphQL currently does not, and possibly cannot, support (in great part due to the limitations imposed by schemas):

- ✅ URL-based queries
- ✅ HTTP caching
- ✅ Operators and Functions: `AND`, `OR`, `NOT`, `SPRINTF`, `CONTAINS`, etc
- ✅ Field composition: Query fields inside of fields
- ✅ Access to user-defined context variables

Check out these links:

_Field arguments with fields:_<br/>
[posts.id|title|is-status(status:draft)|is-status(status:published)](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|is-status(status:draft)|is-status(status:published))

_Field arguments with operators and fields:_<br/>
[posts.id|title|or(fields:is-status(status:draft),is-status(status:published))](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|or(fields:is-status(status:draft),is-status(status:published)))

_Directives with fields:_<br/>
Include: [posts.id|title|comments<include(if-field:has-comments)>.id|content](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|comments<include(if-field:has-comments)>.id|content)

_Directives with operators and fields:_<br/>
Skip: [posts.id|title|comments<skip(if-field:not(field:has-comments))>.id|content](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|comments<skip(if-field:not(field:has-comments))>.id|content)

_Accessing the context:_<br/>
[context](https://nextapi.getpop.org/api/graphql/?fields=context)

_Accessing a context variable:_<br/>
[var(name:datastructure)](https://nextapi.getpop.org/api/graphql/?fields=var(name:datastructure))

_Operator over context variable:_<br/>
[equals(field:var(name:datastructure);value:graphql)|equals(field:var(name:datastructure);value:rest)](https://nextapi.getpop.org/api/graphql/?fields=equals(field:var(name:datastructure);value:graphql)|equals(field:var(name:datastructure);value:rest))

## Speed and Safety

In addition, the time complexity to execute queries is much lower: Whereas [GraphQL's is exponential](https://blog.acolyer.org/2018/05/21/semantics-and-complexity-of-graphql/) (`O(2^n)`), PoP's is just quadratic (or `O(n^2)`). As a consequence, executing deeply nested queries will take lower time, and the risk of Denial of Service attacks is also reduced.

## Decentralization

GraphQL's schema requires a type definition to live on a single location, making it difficult for team members to collaborate, often leading to a monolith architecture, or to the need to set-up special tooling to generate the schema. 

Because PoP is schemaless, it overcomes these drawbacks, and supports:

- ✅ Cleanly splitting the data model into different responsibilities (implemented by different, disconnected teams), without the need to set-up special tooling
- ✅ Deprecation of fields based on the needs from the team/project, not on the API schema definition
- ✅ Overriding of field resolvers (eg: to test new features or provide quick fixes)

Check out these links:

_Overriding fields #1:_<br/>
Normal behaviour:<br/>
[posts.id|title|excerpt](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|excerpt)<br/>
"Experimental" branch:<br/>
[posts.id|title|excerpt(branch:experimental;length:30)](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|excerpt(branch:experimental;length:30))

_Overriding fields #2:_<br/>
Normal vs "Try new features" behaviour:<br/>
[posts(limit:2).id|title|content|content(branch:try-new-features;project:block-metadata)](https://nextapi.getpop.org/api/graphql/?fields=posts(limit:2).id|title|content|content(branch:try-new-features;project:block-metadata))

## Federation, coming soon

Imagine that you need to implement the following functionality:

- In some system, you have a REST API endpoing returning the subscribers to a newsletter: a list of `email` and `lang` fields
- In another system, you have a database with user information: rows of `id`, `email` and `name` fields
- In another system, you have blog posts
- You want to send the content of a blog post in a newsletter to all your users, like this:


    Hi {name},
    
    welcome to our weekly newsletter! Our post from today:
    
    {post-title}
    
    {post-content}

- The newsletter must be translated to the user's preferred language!

How would you do that with GraphQL? Can you implement it in a limited time or tight budget? How???

<span style="font-size: 40px;">🤔</span>

Would you believe me if I say that, through the PoP API, this can be resolved in only 1 line, and without implementing any custom server-side code?

<span style="font-size: 80px;">🤔</span>

<!--
Oh yes! Coming soon: PoP will soon feature a mechanism to resolve complex queries without server-side coding, purely based on composing operations indicated through the query.
-->

I will keep you posted 🤔


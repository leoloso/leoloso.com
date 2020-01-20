---
title: 🚀 Introducing an implementation of GraphQL through components
metaDesc: A new implementation of GraphQL in PHP? How is it any special? Click to find out!
socialImage: https://leoloso.com/images/graphql-logo.png
date: '2019-10-22'
tags:
  - pop
  - api
  - graphql
  - query
  - syntax
---

Imagine using [GraphQL](https://graphql.org) but with plenty of improvements: Server-side caching, better security (reducing the amount of time and energy spent in countering DoS attacks), removing the need to set-up the hundreds (or even thousands) of properties on the schema, splitting the creation of the data model without conflicts or overlapping boundaries across teams, and completely devoid of custom tooling. 

It sounds good, right? But, is it even possible to implement?

<p style="text-align: center;"><span style="font-size: 150px;">🤔</span></p>

Yes it is!

<p style="text-align: center;"><span style="font-size: 150px;">😲</span></p>

I have been recently implementing GraphQL's specification using [PoP](https://github.com/leoloso/PoP)'s component-based architecture, and it works like a charm! Because server-side components can represent a graph (as I have indirectly shown in my [article for Smashing Magazine](https://www.smashingmagazine.com/2019/01/introducing-component-based-api/)), these can be used instead of schemas to represent the application's data model, providing all the same features that schemas do.

Now, I can claim without a doubt or regret: Schemas are not only the foundation of GraphQL, but also **its biggest liability**! Because of the architecture they impose, schemas (as coded through the [Schema Definition Language](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51)) limit what GraphQL can (or cannot) achieve, leading to GraphQL's biggest drawbacks: Limited server-side caching, over-complexity (schema stitching, schema federation), risk of Denial of Service attacks, and difficulty of having a decentralized team collaborate on the schema (which may lead to monolithic data models), among others. 

Components can avoid all of these issues...

### Introducing the PoP API, a new implementation of GraphQL

The result of my research is the new project [GraphQL API](https://github.com/getpop/api-graphql) (based on the [PoP API](https://github.com/getpop/api)). The implementation of the GraphQL spec is not 100% complete: Support for GraphQL's input query is currently missing (but I'm working on it and should be ready within a few weeks) and other minor differences. However, it complies with everything that makes GraphQL great, particularly retrieving the queried data and nothing more or less, and having the response reflect the shape of the query.

### No need to code the schema?

The API has a schema... but **it is not coded by anyone**! Instead, it is automatically-generated from the component model itself: Simply by coding classes following OOP principles, the application will generate the schema.

To visualize it, in addition to the standard introspection field `__schema`, we can query field `fullSchema`:

[/api/graphql/?query=fullSchema](https://nextapi.getpop.org/api/graphql/?query=fullSchema)

### New syntax, supporting URL-based queries

This API is natively powered by a syntax compatible with [URL-based queries](https://github.com/getpop/field-query), which in addition to supporting all the expected features (arguments, variables, directives, etc), it also grants GraphQL superpowers, such as:

- The possibility to be cached on the server
- Operators and Helper fields
- Composable fields

I provided several examples of these new features in my previous post [😲 Making GraphQL cacheable through a new, single-line query syntax!?](/posts/graphql-query-in-a-single-line/).

However, if working with a new syntax makes you uncomfortable, fear not: I'm already working on building a service that converts from the 2 different syntaxes, bi-directionally. Then, it will be possible for the client to choose which syntax to use on a query-by-query basis. (For instance, if the query must be cached, then use my proposed new syntax; otherwise, use the standard one.)

### Improvements over the standard GraphQL

Components can deliver additional features to those available in the GraphQL spec, resulting in better speed and security, enhanced team collaboration, simpler client-side and server-side code, and others. I will write about these in my upcoming blog posts. 

<p style="text-align: center;"><span style="font-size: 120px;">😎</span></p>

Thanks for reading!


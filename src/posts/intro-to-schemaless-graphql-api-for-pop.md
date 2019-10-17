---
title: 🚀 Introducing GraphQL API for PoP - A “schemaless” implementation of GraphQL through components
metaDesc: Schemaless? But still GraphQL? How does it work!? Click to find out!
socialImage: https://leoloso.com/images/graphql-logo.png
date: '2020-10-15'
tags:
  - pop
  - api
  - graphql
  - feature
---

Imagine using [GraphQL](https://graphql.org) but with plenty of improvements: Server-side caching, robust security (avoiding having to spend time and energy in countering DoS attacks), removing the need to set-up the hundreds (or even thousands) of properties on the schema, splitting the creation of the data model without conflicts or overlapping boundaries across teams, and completely devoid of custom tooling. 

It sounds good, right? But, is it even possible to implement?

<p style="text-align: center;"><span style="font-size: 150px;">🤔</span></p>

Yes it is... through a “schemaless” GraphQL!

<p style="text-align: center;"><span style="font-size: 150px;">😲</span></p>

I have recently implemented GraphQL's specification using [PoP](https://github.com/leoloso/PoP)'s component-based architecture, and it works like a charm! Because server-side components can represent a graph (as I hinted at in my [article for Smashing Magazine](https://www.smashingmagazine.com/2019/01/introducing-component-based-api/)), these can be used instead of schemas to represent the application's data model, providing all the same features that schemas do.

Moreover, I can claim without a doubt or regret: **Schemas are not only the foundation of GraphQL, but also its biggest liability!** Because of the architecture they impose, schemas (as coded through the [Schema Definition Language](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51)) limit what GraphQL can (or cannot) achieve, leading to GraphQL's biggest drawbacks: Limited server-side caching, over-complexity (schema stitching, schema federation), risk of Denial of Service attacks, and difficulty of having a decentralized team collaborate on the schema (which may lead to monolithic data models), among others. 

Components can avoid all of these issues...

### Introducing the schemaless GraphQL API for PoP

The result of my research is the new project [GraphQL API for PoP](https://github.com/getpop/api-graphql) (based on the [PoP API](https://github.com/getpop/api)), which may possibly be the first “schemaless” implementation of GraphQL. 

(The implementation of the GraphQL spec is no 100% complete yet: Support for GraphQL's input query is currently missing, but it should be ready within a couple of weeks).

Well, actually calling it “schemaless” is up to debate, since there is a schema... but **it is not coded by anyone!** Instead, it is automatically-generated from the component model itself: Simply by coding classes following OOP principles, the application will generate the schema.

Similar to GraphQL, the schema can be inspected through the introspection `"__schema"` field:

[/api/graphql/?query=__schema](https://nextapi.getpop.org/api/graphql/?query=__schema)

### New syntax, supporting URL-based queries

This API is natively powered by a [sligthly different syntax than that from GraphQL](https://github.com/getpop/field-query), which in addition to supporting all the expected features (arguments, variables, directives, etc), it also grants GraphQL superpowers, such as:

- The possibility to be cached on the server
- Operators and Helper fields
- Nested fields

I provided several examples of these new features in my previous post [😲 Making GraphQL cacheable through a new, single-line query syntax!?](/posts/graphql-query-in-a-single-line/).

However, if working with a new syntax makes you uncomfortable, fear not: I'm already working on building a service that converts from the 2 different syntaxes, bi-directionally. Then, it will be possible for the client to choose which syntax to use on a query-by-query basis. (For instance, if a query is cacheable, then use my proposed new syntax; otherwise, use the standard one.)

### Improvements over the standard GraphQL

Components can deliver additional features to those available in the GraphQL spec, resulting in better speed and security, enhanced team collaboration, simpler client-side and server-side code, and others. I will write about these in my next blog post. 

<p style="text-align: center;"><span style="font-size: 120px;">😎</span></p>

Thanks for reading!


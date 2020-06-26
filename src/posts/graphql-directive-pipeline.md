---
title: 🏛 Architecture design - Executing GraphQL directives through a pipeline
metaDesc: Making directives the foundation of the GraphQL server
socialImage: /images/multiple-fields-slot-directive-pipeline.png
date: '2020-06-26'
tags:
  - graphql
  - pop
---

TL;DR: I published a new article on my GraphQL series: [Treating GraphQL directives as middleware](https://blog.logrocket.com/treating-graphql-directives-as-middleware/)

In the [series on GraphQL I'm writing for LogRocket](https://blog.logrocket.com/author/leonardolosoviz/), I've been arguing that good support for custom directives may be the most important factor for choosing a GraphQL server.

Motivated by this philosophy, I made the engine from [GraphQL by PoP](https://graphql-by-pop.com/) (my own implementation of a GraphQL server in PHP, soon to be made available as a WordPress plugin) operate by executing directives. In my architecture, directives are a low-level component, which can manipulate the response in any way the developer needs. Then, directives are full power, and, I'd dare say, there is pretty much nothing that cannot be achieved through some custom directive.

The design for the architecture is first conceived on the concept of middleware:

![Middleware design pattern](/images/middleware.png "Middleware design pattern")

But then, because in GraphQL [directives must be executed in order](https://spec.graphql.org/draft/#sel-HAFjBRBAABKBPv2d), this becomes a pipeline:

![Pipeline design pattern](/images/directive-pipeline-diagram.png "Pipeline design pattern")

Ultimately, the pipeline incorporates several elements (system directives `@validate` and `@resolveValueAndMerge`, multiple fields as inputs per directive, a single pipeline to handle all directives for all fields, and a few others) to make the most out of GraphQL:

![GraphQL directive pipeline](/images/multiple-fields-slot-directive-pipeline.png "GraphQL directive pipeline")

I explain in detail this architecture in my latest installment for the GraphQL series:

[Treating GraphQL directives as middleware](https://blog.logrocket.com/treating-graphql-directives-as-middleware/) 

I also compare how the directive pipeline fares against field-resolver middleware, as done by [graphql-middleware](https://github.com/prisma-labs/graphql-middleware), [Sangria](https://sangria-graphql.org/learn/#middleware), and a few other GraphQL servers.

I hope you enjoy this reading!

<span style="font-size: 80px;">👋</span>
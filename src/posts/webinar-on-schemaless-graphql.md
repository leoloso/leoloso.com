---
title: 🗓 Webinar on the “PoP API” GraphQL server
metaDesc: On November 13th at 6:00pm PST, for free
socialImage: /images/nomadjs-logo.png
date: '2019-10-30'
tags:
  - pop
  - api
  - graphql
  - schema
---

I will be presenting a [webinar on my implementation of GraphQL for PHP](https://nomadjs.com/live/kSk2ymG1OgnfnDchrCuVp/Introduction-to-the--schemaless--GraphQL/) on November 13th at 6 pm PST. To watch it, it's necessary to have an account with [NomadJS](https://nomadjs.com), however it is free to create one, so be welcome to come join me!

**Title:** Introduction to “PoP API”, a brand-new GraphQL server in PHP

**Description:**

“[With GraphQL](https://graphql.org/learn/thinking-in-graphs/#it-s-graphs-all-the-way-down-https-en-wikipedia-org-wiki-turtles-all-the-way-down), you model your business domain as a graph by defining a schema; within your schema, you define different types of nodes and how they connect/relate to one another.” Through schemas, GraphQL has greatly improved the development experience as compared to REST, enabling applications to be shipped faster then ever.

However, mainly due to the limitations from a schema model, GraphQL has faced several issues that, after several years of trying, nobody has been able to solve on a conclusive manner. Among them, its security is suboptimal, since it enables malicious actors to execute Denial of Service attacks on the database server; it cannot be cached on the server, since it mainly operates through POST requests, adding complexity and processing cost to the application on the client-side; a type definition must live on a single location, making it difficult for team members to collaborate (as evidenced by the [deprecation of schema stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching/) and the difficulty of implementing the data model in the specific way demanded by the [federation approach](https://www.apollographql.com/docs/apollo-server/federation/introduction/)), more often than not leading to a monolith architecture; it can become tedious to set it up on the server, since each schema must list down all of its objects' properties, leading to an overabundance of code; and executing a query with many levels of depth can become very slow, since its [time complexity to resolve queries can be exponential](http://olafhartig.de/files/HartigPerez_WWW2018_Preprint.pdf).

Luckily, there is an alternative approach to using a schema model for representing an information graph, which does not suffer any of its disadvantages: Components! A component hierarchy can mirror the data structure from a graph, enabling us to obtain the benefits from GraphQL, while at the same time losing none of the advantages from a simple REST architecture. Picture yourself accessing the great development experience of GraphQL, but with the added server-side performance and security from REST, minus the inconvenience of having to set-up thousands of properties on the schema, and allowing the team to split the creation of the data model without any overlapping of tasks or need to set-up special tooling. 

A data API based on components is the greatest kept secret... until this presentation demonstrates all about it. Join me for an enlightening journey into the power of components!


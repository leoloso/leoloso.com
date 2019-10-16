---
title: 🚀 Introducing GraphQL API for PoP - A “schemaless” implementation of GraphQL through components
metaDesc: Schemaless? But still GraphQL? How does it work!? Click to find out!
socialImage: https://leoloso.com/images/grapqhql-logo.png
date: '2020-10-15'
tags:
  - pop
  - api
  - graphql
  - feature
---

Imagine using [GraphQL](https://graphql.org) but with plenty of improvements: Server-side caching, robust security (avoiding having to spend time and energy in countering DoS attacks), removing the need to set-up the hundreds (or even thousands) of properties on the schema, splitting the creation of the data model without conflicts or overlapping boundaries across teams, and completely devoid of custom tooling. 

It sounds good, right? But, is it even possible to implement?

<span style="font-size: 150px;">🤔</span>

Yes it is... through a “schemaless” GraphQL!

<span style="font-size: 150px;">😲</span>

I have recently implemented GraphQL's specification using [PoP](https://github.com/leoloso/PoP)'s component-based architecture, and it works like a charm! Because server-side components can represent a graph (as I hinted at in my [article for Smashing Magazine](https://www.smashingmagazine.com/2019/01/introducing-component-based-api/)), these can be used instead of schemas to represent the application's data model, providing all the same features that schemas do.

Moreover, I can claim without a doubt or regret: **Schemas are not only the foundation of GraphQL, but also its biggest liability!** Because of the architecture they impose, schemas (as coded through the [Schema Definition Language](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51)) limit what GraphQL can (or cannot) achieve, leading to GraphQL's biggest drawbacks: Limited server-side caching, over-complexity (schema stitching, schema federation), risk of Denial of Service attacks, and difficulty of having a decentralized team collaborate on the schema (which may lead to monolithic data models), among others. 

Components can avoid all of these issues...

### Introducing GraphQL API for PoP

The result of my research is the new project [GraphQL API for PoP](https://github.com/getpop/api-graphql) (based on the [PoP API](https://github.com/getpop/api)), which may possibly be the first “schemaless” implementation of GraphQL. 

(The implementation of the GraphQL spec is no 100% complete yet: Support for GraphQL's input query is currently missing, but it should be ready within a couple of weeks).

Well, actually calling it “schemaless” is up to debate, since there is a schema... but **it is not coded by anyone!** Instead, it is automatically-generated from the component model itself: Simply by coding classes following OOP principles, the application will generate the schema.

Similar to GraphQL, the schema can be inspected through the introspection `"__schema"` field:

[/api/graphql/?query=__schema](https://nextapi.getpop.org/api/graphql/?query=__schema)

The links below show how PoP satisfies the GraphQL specification, having the response mirror the query, and support for all expected features (arguments, variables, directives, etc):

(**Note:** The query input is different to that from GraphQL: Instead of passing the query in the body of the request, it is passed through URL parameter `query` using a [slightly different syntax](https://github.com/getpop/api#query-syntax). This change is done to support server-side caching, which is not directly available in GraphQL. This is only temporary: Once support for GraphQL's query input is added, the client will be able to choose which of the 2 query input methods to use, either GraphQL's body-based one or PoP's URL-based one.)

_**Simple query:**_<br/>
[/api/graphql/?query=posts.id|title|url](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url)

_**Nested query:**_<br/>
[/api/graphql/?query=posts.id|title|url|comments.id|content|date|author.id|name|url|posts.id|title|url](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url|comments.id|content|date|author.id|name|url|posts.id|title|url)

_**Field arguments:**_<br/>
[/api/graphql/?query=posts(searchfor:template,limit:3).id|title](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:template,limit:3).id|title)

_**Variables:**_<br/>
[/api/graphql/?query=posts(searchfor:$search,limit:$limit).id|title&variables[limit]=3&variables[search]=template](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:$search,limit:$limit).id|title&variables[limit]=3&variables[search]=template)

_**Aliases:**_<br/>
[/api/graphql/?query=posts(searchfor:template,limit:3)@searchposts.id|title](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:template,limit:3)@searchposts.id|title)

_**Bookmarks:** (to return to some query path, to keep adding data)_<br/>
[/api/graphql/?query=posts(searchfor:template,limit:3)[searchposts].id|title,[searchposts].author.id|name](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:template,limit:3)[searchposts].id|title,[searchposts].author.id|name)

_**Bookmark + Alias:**_<br/>
[/api/graphql/?query=posts(searchfor:template,limit:3)[@searchposts].id|title,[searchposts].author.id|name](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:template,limit:3)[@searchposts].id|title,[searchposts].author.id|name)

_**Fragments:**_<br/>
[/api/graphql/?query=posts.--fr1&fragments[fr1]=id|author.posts(limit:1).id|title](https://nextapi.getpop.org/api/graphql/?query=posts.--fr1&fragments[fr1]=id|author.posts(limit:1).id|title)

_**Concatenating fragments:**_<br/>
[/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title](https://nextapi.getpop.org/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title)

_**Fragments inside fragments:**_<br/>
[/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title|--fr3&fragments[fr3]=author.id|url](https://nextapi.getpop.org/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title|--fr3&fragments[fr3]=author.id|url)

_**Fragments with aliases:**_<br/>
[/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)@firstpost&fragments[fr2]=id|title](https://nextapi.getpop.org/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)@firstpost&fragments[fr2]=id|title)

_**Fragments with variables:**_<br/>
[/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:$limit)&fragments[fr2]=id|title&variables[limit]=1](https://nextapi.getpop.org/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:$limit)&fragments[fr2]=id|title&variables[limit]=1)

_**Directives:**_<br/>
Include:<br/>
[/api/graphql/?query=posts.id|title|url<include(if:$include)>&variables[include]=true](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url<include(if:$include)>&variables[include]=true)<br/>
[/api/graphql/?query=posts.id|title|url<include(if:$include)>&variables[include]=](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url<include(if:$include)>&variables[include]=)<br/><br/>
Skip:<br/>
[/api/graphql/?query=posts.id|title|url<skip(if:$skip)>&variables[skip]=true](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url<skip(if:$skip)>&variables[skip]=true)<br/>
[/api/graphql/?query=posts.id|title|url<skip(if:$skip)>&variables[skip]=](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url<skip(if:$skip)>&variables[skip]=)

Yayyyyyy!!!!!!

<span style="font-size: 150px;">😎</span>

## Much much more, coming soon

Components can deliver additional features to those available in the GraphQL spec, resulting in better speed and security, enhanced team collaboration, simpler client-side and server-side code, and others. I will write about these in my next blog post. 

Thanks for reading!

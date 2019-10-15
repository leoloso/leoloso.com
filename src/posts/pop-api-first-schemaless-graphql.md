---
title: 🚀 Introducing GraphQL API for PoP - A schemaless implementation of GraphQL through components
metaDesc: Schemaless? But still GraphQL? How does it work!? Click to find out!
socialImage: https://leoloso.com/images/grapqhql-logo.png
date: '2019-10-15'
tags:
  - pop
  - api
  - graphql
  - feature
---

Imagine using [GraphQL](https://graphql.org) but with plenty of improvements: Server-side caching, robust security (avoiding having to spend time and energy in countering DoS attacks), removing the need to set-up the hundreds (or even thousands) of properties on the schema, splitting the creation of the data model without conflicts or overlapping boundaries across teams, and completely devoid of custom tooling. 

It sounds good, right? But, is it even possible to implement?

<span style="font-size: 150px;">🤔</span>

Yes it is... through a schemaless GraphQL!

<span style="font-size: 150px;">😲</span>

I've been lately working on implementing GraphQL's specification using [PoP](https://github.com/leoloso/PoP)'s component-based architecture, and it works like a charm! Because server-side components can represent a graph (as I superficially showed in my [article for Smashing Magazine](https://www.smashingmagazine.com/2019/01/introducing-component-based-api/)), these can be used instead of schemas to represent the application's data model, providing all the same features that schemas do.

Moreover, I can now claim without a doubt: **Schemas are not only the foundation of GraphQL, but also its biggest liability!** Because of the architecture they impose, schemas limit what GraphQL can, or cannot, achieve, and producing GraphQL's biggest drawbacks: Limited server-side caching, over complexity (schema stitching, schema federation), risk of Denial of Service attacks, difficulty of having a decentralized team collaborate on the schema (which may lead to monolithic architectures), among others. Components can solve all these issues in an elegant way, which I will demonstrate in an upcoming blog post. 

### Introducing GraphQL API for PoP

The result of my research is the new project [GraphQL API for PoP](https://github.com/getpop/api-graphql), which is based on the also new project [PoP API](https://github.com/getpop/api)), and which may possibly be the first schemaless implementation of GraphQL. 

(What is still missing is support for GraphQL's input query; I'm already working on it, and it should be finished within a couple of weeks).

Well, actually there is a schema. But **it is not coded by anyone!** Instead, it is automatically-generated from the component model itself, and can be inspected through the introspection `"__schema"` field:

[/api/graphql/?fields=__schema](https://nextapi.getpop.org/api/graphql/?fields=__schema)

The links below show how PoP satisfies the GraphQL specification, having the response mirror the query:

(**Note:** Please notice that the query input is different to that from GraphQL: Instead of passing the `query` in the body of the request, it is passed through parameter `fields` using a [slightly different syntax](https://github.com/getpop/api#query-syntax). This change is done to support URL-based server-side caching, which is not easily available using GraphQL's standard way to retrieve data. While this is the only way to query data in PoP right now, the GraphQL's syntax will soon be also supported; this will enable the client to choose which of the 2 input methods to provide the query: GraphQL's body-based one, or PoP's URL-based one.)

**_Simple query:_**<br/>
[/api/graphql/?fields=posts.id|title|url](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url)

**_Nested query:_**<br/>
[/api/graphql/?fields=posts.id|title|url|comments.id|content|date|author.id|name|url|posts.id|title|url](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url|comments.id|content|date|author.id|name|url|posts.id|title|url)

**_Field arguments:_**<br/>
[/api/graphql/?fields=posts(searchfor:template,limit:3).id|title](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:template,limit:3).id|title)

**_Variables:_**<br/>
[/api/graphql/?fields=posts(searchfor:$search,limit:$limit).id|title&variables[limit]=3&variables[search]=template](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:$search,limit:$limit).id|title&variables[limit]=3&variables[search]=template)

**_Aliases:_**<br/>
[/api/graphql/?fields=posts(searchfor:template,limit:3)@searchposts.id|title](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:template,limit:3)@searchposts.id|title)

**_Bookmarks:_** (to return to some query path, to keep adding data)<br/>
[/api/graphql/?fields=posts(searchfor:template,limit:3)[searchposts].id|title,[searchposts].author.id|name](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:template,limit:3)[searchposts].id|title,[searchposts].author.id|name)

**_Bookmark + Alias:_**<br/>
[/api/graphql/?fields=posts(searchfor:template,limit:3)[@searchposts].id|title,[searchposts].author.id|name](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:template,limit:3)[@searchposts].id|title,[searchposts].author.id|name)

**_Fragments:_**<br/>
[/api/graphql/?fields=posts.--fr1&fragments[fr1]=id|author.posts(limit:1).id|title](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1&fragments[fr1]=id|author.posts(limit:1).id|title)

**_Concatenating fragments:_**<br/>
[/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title)

**_Fragments inside fragments:_**<br/>
[/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title|--fr3&fragments[fr3]=author.id|url](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title|--fr3&fragments[fr3]=author.id|url)

**_Fragments with aliases:_**<br/>
[/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)@firstpost&fragments[fr2]=id|title](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)@firstpost&fragments[fr2]=id|title)

**_Fragments with variables:_**<br/>
[/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:$limit)&fragments[fr2]=id|title&variables[limit]=1](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:$limit)&fragments[fr2]=id|title&variables[limit]=1)

**_Directives:_**<br/>
Include:<br/>
[/api/graphql/?fields=posts.id|title|url<include(if:$include)>&variables[include]=true](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url<include(if:$include)>&variables[include]=true)<br/>
[/api/graphql/?fields=posts.id|title|url<include(if:$include)>&variables[include]=](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url<include(if:$include)>&variables[include]=)<br/><br/>
Skip:<br/>
[/api/graphql/?fields=posts.id|title|url<skip(if:$skip)>&variables[skip]=true](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url<skip(if:$skip)>&variables[skip]=true)<br/>
[/api/graphql/?fields=posts.id|title|url<skip(if:$skip)>&variables[skip]=](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url<skip(if:$skip)>&variables[skip]=)

Wow!!!!!!

<span style="font-size: 150px;">😎</span>

## Much much more, coming soon

As I mentioned earlier on, the component-based architecture provides many features that GraphQL currently does not support (due to the limitations imposed by schemas). I will write about these in my next blog post. 

Thanks for reading!


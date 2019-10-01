---
title: 🚀 The PoP API provides the first schemaless implementation of GraphQL!
metaDesc: Schemaless? Is that even possible? Click to find out!
socialImage: https://leoloso.com/images/grapqhql-logo.png
date: '2020-10-01'
tags:
  - pop
  - api
  - graphql
  - feature
---

Picture yourself accessing the great development experience of [GraphQL](https://graphql.org), but with the added server-side performance and security from REST, minus the inconvenience of having to set-up thousands of properties on the schema, and allowing the team to split the creation of the data model without any overlapping of tasks or need to set-up special tooling. It sounds good, right? 

Welcome to schemaless GraphQL!

I've been lately working on the [PoP API](https://github.com/getpop/api), making it satisfy the specification from GraphQL, with the objective to demonstrate that [PoP](https://github.com/leoloso/PoP)'s component-based architecture can provide the expected representation of a graph. And it works like a charm! PoP's API implementation has almost achieved feature-parity with GraphQL (only GraphQL's syntax is not supported yet), in the process becoming its first schemaless implementation!

Btw, there is a schema actually. It is just **not coded by anyone!** Instead, it is automatically-generated from the component model itself.

Don't believe me? Just check out these links:

_Automatically-generated schema:_<br/>
[__schema](https://nextapi.getpop.org/api/graphql/?fields=__schema)

_Simple query:_<br/>
[posts.id|title|url](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url)

_Nested query:_<br/>
[posts.id|title|url|comments.id|content|date|author.id|name|url|posts.id|title|url](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url|comments.id|content|date|author.id|name|url|posts.id|title|url)

_Field arguments:_<br/>
[posts(searchfor:template;limit:3).id|title](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:template;limit:3).id|title)

_Variables:_<br/>
[posts(searchfor:$search;limit:$limit).id|title&variables[limit]=3&variables[search]=template](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:$search;limit:$limit).id|title&variables[limit]=3&variables[search]=template)

_Aliases:_<br/>
[posts(searchfor:template;limit:3)@searchposts.id|title](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:template;limit:3)@searchposts.id|title)

_Bookmarks:_<br/>
[posts(searchfor:template;limit:3)[searchposts].id|title,[searchposts].author.id|name](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:template;limit:3)[searchposts].id|title,[searchposts].author.id|name)

_Bookmark + Alias:_<br/>
[posts(searchfor:template;limit:3)[@searchposts].id|title,[searchposts].author.id|name](https://nextapi.getpop.org/api/graphql/?fields=posts(searchfor:template;limit:3)[@searchposts].id|title,[searchposts].author.id|name)

_Fragments:_<br/>
[posts.--fr1&fragments[fr1]=id|author.posts(limit:1).id|title](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1&fragments[fr1]=id|author.posts(limit:1).id|title)

_Concatenating fragments:_<br/>
[posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title)

_Fragments inside fragments:_<br/>
[posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title|--fr3&fragments[fr3]=author.id|url](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title|--fr3&fragments[fr3]=author.id|url)

_Fragments with aliases:_<br/>
[posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)@firstpost&fragments[fr2]=id|title](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)@firstpost&fragments[fr2]=id|title)

_Fragments with variables:_<br/>
[posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:$limit)&fragments[fr2]=id|title&variables[limit]=1](https://nextapi.getpop.org/api/graphql/?fields=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:$limit)&fragments[fr2]=id|title&variables[limit]=1)

_Directives:_<br/>
Include:<br/>
[posts.id|title|url<include(if-field:echo(value:$include))>&variables[include]=true](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url<include(if-field:echo(value:$include))>&variables[include]=true)<br/>
[posts.id|title|url<include(if-field:echo(value:$include))>&variables[include]=](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url<include(if-field:echo(value:$include))>&variables[include]=)<br/><br/>
Skip:<br/>
[posts.id|title|url<skip(if-field:echo(value:$skip))>&variables[skip]=true](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url<skip(if-field:echo(value:$skip))>&variables[skip]=true)<br/>
[posts.id|title|url<skip(if-field:echo(value:$skip))>&variables[skip]=](https://nextapi.getpop.org/api/graphql/?fields=posts.id|title|url<skip(if-field:echo(value:$skip))>&variables[skip]=)

## Much more, coming soon

PoP also provides its own set of features that GraphQL currently does not, and possibly cannot, support (in great part due to the limitations imposed by schemas). I will write about these in my next blog post. 

Thanks for reading!


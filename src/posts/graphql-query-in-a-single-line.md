---
title: 😲 Making GraphQL cacheable through a new, single-line query syntax!?
metaDesc: Or how to give GraphQL plenty of goodies 🍪 and superpowers 🦸🏻
socialImage: https://leoloso.com/images/grapqhql-logo.png
date: '2019-10-17'
tags:
  - api
  - graphql
  - query
  - syntax
  - pop
---

[GraphQL](https://graphql.org) is great, but it has a very big issue: It is not easy to cache in the server (while [it is doable](https://blog.apollographql.com/graphql-caching-the-elephant-in-the-room-11a3df0c23ad), it doesn't come out of the box and requires a good amount of extra engineering).

The problem is GraphQL's query, which generally spans multiple lines, and is sent to the server through the body of the request instead of through URL params. If the query could be passed through URL params instead, we could then use standard mechanisms to cache the page in the server based on its URL as a unique ID.

Sure, we could have a client-side library like [Relay](https://relay.dev/docs/en/graphql-in-relay) simply compress the query in a single line, and append it to the URL. However, the URL will be pretty much unreadable, and we won't be able to manually code it anymore, as we do with REST. So this is not a solution.

A better approach is to re-create the GraphQL syntax, attempting to support all the same elements (field arguments, variables, aliases, fragments, directives, etc), however designed to be easy to write, and easy to read and understand, in a single line, so it can be passed as a URL param.

This is what I did, and I think I might have succeeded!? The results are in [this GitHub repo](https://github.com/getpop/field-query) (check it out!), and I show several examples below... ta ta ta taaaannnnnn...

<p style="text-align: center;"><span style="font-size: 120px;">🥁</span></p>

### Introducing my re-imagined GraphQL syntax

In the [repo's README](https://github.com/getpop/field-query) is the description of how each query element is coded. Hoping that the syntax is self-evident, or at least understandable enough, here I just only show some examples:

_**Simple query:**_<br/>
[/?query=posts.id|title|url](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url)

_**Nested query:**_<br/>
[/?query=posts.comments.author.posts.id|title|url](https://nextapi.getpop.org/api/graphql/?query=posts.comments.author.posts.id|title|url)

_**Retrieving properties along the nested query:**_<br/>
[/?query=posts.id|title|url|comments.id|content|date|author.id|name|url|posts.id|title|url](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url|comments.id|content|date|author.id|name|url|posts.id|title|url)

_**Field arguments:**_<br/>
[/?query=posts(searchfor:template,limit:3).id|title](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:template,limit:3).id|title)

_**Variables:**_<br/>
[/?query=posts(searchfor:$search,limit:$limit).id|title&limit=3&search=template](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:$search,limit:$limit).id|title&limit=3&search=template)

or:

[/?query=posts(searchfor:$search,limit:$limit).id|title&variables[limit]=3&variables[search]=template](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:$search,limit:$limit).id|title&variables[limit]=3&variables[search]=template)

_**Aliases:**_<br/>
[/?query=posts(searchfor:template,limit:3)@searchposts.id|title](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:template,limit:3)@searchposts.id|title)

_**Bookmarks:** (to return to some query path, to keep adding data)_<br/>
[/?query=posts(searchfor:template,limit:3)[searchposts].id|title,[searchposts].author.id|name](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:template,limit:3)[searchposts].id|title,[searchposts].author.id|name)

_**Bookmark + Alias:**_<br/>
[/?query=posts(searchfor:template,limit:3)[@searchposts].id|title,[searchposts].author.id|name](https://nextapi.getpop.org/api/graphql/?query=posts(searchfor:template,limit:3)[@searchposts].id|title,[searchposts].author.id|name)

_**Fragments:**_<br/>
[/?query=posts(limit:3).--postProps,posts(limit:4).author.posts.--postProps&postProps=id|title|url](https://nextapi.getpop.org/api/graphql/?query=posts(limit:3).--postProps,posts(limit:4).author.posts.--postProps&postProps=id|title|url)

Or:

[/?query=posts(limit:3).--postProps,posts(limit:4).author.posts.--postProps&fragments[postProps]=id|title|url](https://nextapi.getpop.org/api/graphql/?query=posts(limit:3).--postProps,posts(limit:4).author.posts.--postProps&fragments[postProps]=id|title|url)

_**Directives:**_<br/>
Include:<br/>
[/?query=posts.id|title|url<include(if:$include)>&variables[include]=true](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url<include(if:$include)>&variables[include]=true)<br/>
[/?query=posts.id|title|url<include(if:$include)>&variables[include]=](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url<include(if:$include)>&variables[include]=)<br/><br/>
Skip:<br/>
[/?query=posts.id|title|url<skip(if:$skip)>&variables[skip]=true](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url<skip(if:$skip)>&variables[skip]=true)<br/>
[/?query=posts.id|title|url<skip(if:$skip)>&variables[skip]=](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|url<skip(if:$skip)>&variables[skip]=)

### Combining elements

The different elements can be included within the other elements in a straightforward manner:

_**Concatenating fragments:**_<br/>
[/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title](https://nextapi.getpop.org/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title)

_**Fragments inside fragments:**_<br/>
[/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title|--fr3&fragments[fr3]=author.id|url](https://nextapi.getpop.org/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)&fragments[fr2]=id|title|--fr3&fragments[fr3]=author.id|url)

_**Fragments with aliases:**_<br/>
[/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)@firstpost&fragments[fr2]=id|title](https://nextapi.getpop.org/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:1)@firstpost&fragments[fr2]=id|title)

_**Fragments with variables:**_<br/>
[/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:$limit)&fragments[fr2]=id|title&variables[limit]=1](https://nextapi.getpop.org/api/graphql/?query=posts.--fr1.--fr2&fragments[fr1]=author.posts(limit:$limit)&fragments[fr2]=id|title&variables[limit]=1)

### Superpowers!

Since we are creating a new syntax, why stop in what already exists? We are creating, we are dreaming, let's also build what doesn't exist yet! The following features below are not part of GraphQL, but sure they should be!

_**Operators:**_<br/>
<a href="https://nextapi.getpop.org/api/graphql?query=not(true)">/?query=not(true)</a><br/>
<a href="https://nextapi.getpop.org/api/graphql?query=or([1, 0])">/?query=or([1, 0])</a><br/>
<a href="https://nextapi.getpop.org/api/graphql?query=and([1, 0])">/?query=and([1, 0])</a><br/>
<a href="https://nextapi.getpop.org/api/graphql?query=if(true,Show this text,Hide this text)">/?query=if(true,Show this text,Hide this text)</a><br/>
<a href="https://nextapi.getpop.org/api/graphql?query=equals(first text, second text)">/?query=equals(first text, second text)</a><br/>
<a href="https://nextapi.getpop.org/api/graphql?query=isNull(),isNull(something)">/?query=isNull(),isNull(something)</a><br/>
<a href="https://nextapi.getpop.org/api/graphql?query=sprintf(API %s is %s, [PoP, cool])">/?query=sprintf(API %s is %s, [PoP, cool])</a>)

_**Helpers:**_<br/>
<a href="https://nextapi.getpop.org/api/graphql?query=context">/?query=context</a><br/>
<a href="https://nextapi.getpop.org/api/graphql?query=var(route),var(target)@target,var(datastructure)">/?query=var(route),var(target)@target,var(datastructure)</a>

_**Nested fields:**_<br/>
<a href="https://nextapi.getpop.org/api/graphql/?query=posts.has-comments|not(has-comments())">/?query=posts.has-comments|not(has-comments())</a><br/>
<a href="https://nextapi.getpop.org/api/graphql/?query=posts.has-comments|has-featuredimage|or([has-comments(),has-featuredimage()])">/?query=posts.has-comments|has-featuredimage|or([has-comments(),has-featuredimage()])</a><br/>
<a href="https://nextapi.getpop.org/api/graphql/?query=var(fetching-site),posts.has-featuredimage|and([has-featuredimage(), var(fetching-site)])">/?query=var(fetching-site),posts.has-featuredimage|and([has-featuredimage(), var(fetching-site)])</a><br/>
<a href="https://nextapi.getpop.org/api/graphql/?query=posts.if(has-comments(),sprintf(Post with title '%s' has %s comments,[title(), comments-count()]),sprintf(Post with ID %s was created on %s, [id(),date(d/m/Y)]))@postDesc">/?query=posts.if(has-comments(),sprintf(Post with title '%s' has %s comments,[title(), comments-count()]),sprintf(Post with ID %s was created on %s, [id(),date(d/m/Y)]))@postDesc</a><br/>
<a href="https://nextapi.getpop.org/api/graphql/?query=users.name|equals(name(), leo)">/?query=users.name|equals(name(), leo)</a><br/>
<a href="https://nextapi.getpop.org/api/graphql/?query=posts.featuredimage|isNull(featuredimage())">/?query=posts.featuredimage|isNull(featuredimage())</a>

_**Nested fields with directives:**_<br/>

[/?query=posts.id|title|featuredimage<include(if:not(isNull(featuredimage())))>.id|src](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|featuredimage<include(if:not(isNull(featuredimage())))>.id|src)<br/>
[/?query=posts.id|title|featuredimage<skip(if:isNull(featuredimage()))>.id|src](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|featuredimage<skip(if:isNull(featuredimage()))>.id|src)

_**Skip output if null:**_<br/>

[/?query=posts.id|title|featuredimage?.id|src](https://nextapi.getpop.org/api/graphql/?query=posts.id|title|featuredimage?.id|src)

<p style="text-align: center;"><span style="font-size: 120px;">🦸🏻</span></p>

### Ta daaaa

That seems promising, right!? What do you think? If you like it, please give [my repo](https://github.com/getpop/field-query) a star ⭐️😀.

Thanks for reading!
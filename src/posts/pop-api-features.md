---
title: 🚀 Improving GraphQL - How the PoP API achieves new heights
metaDesc: Showing the features from this brand-new API
socialImage: /images/pop-logo-whitebg.png
date: '2019-12-02'
tags:
  - pop
  - api
  - graphql
---

I had originally started implementing the [GraphQL](https://graphql.org) spec using server-side components, providing yet another implementation of GraphQL on PHP (such as those based on the popular [graphql-php](https://github.com/webonyx/graphql-php) library), but attempting to also support those features that GraphQL fails at supporting, such as HTTP caching.

I can now claim my attempt was a success: The implementation satisfies the GraphQL spec (except for the syntax... more on this below), adding native support for [HTTP caching](https://github.com/getpop/cache-control) was straightforward, and I could even add new features that the typical GraphQL implementation out there does not support.

So, I'd say this is a good time to introduce this API to the world, and hope that the world will notice it: Please be introduced to the brand-new [PoP API](https://github.com/getpop/api), an iteration and improvement over GraphQL.

Below is the set of its unique, distinctive features (displayed [through slides here](https://slides.com/leoloso/graphql/#/15)).

### Queries are URL-based

Structure of the request:

```less
/?query=query&variable=value&fragment=fragmentQuery
```

Structure of the query:

```less
/?query=field(args)@alias<directive(args)>
```

This syntax:

- Enables HTTP/Server-side caching
- Simplifies visualization/execution of queries (straight in the browser, without any client)
- GET when it's a GET, POST when it's a POST, pass variables through URL params

This syntax can be expressed in multiple lines:

```less
/?
query=
  field(
    args
  )@alias<
    directive(
      args
    )
  > 
```

Advantages:

- It is easy to read and write as a URL param (it doesn't make use of `{` and `}` like GraphQL)
- Copy/pasting in Firefox works straight!

Example:

```less
/?
query=
  posts(
    limit: 5
  )@posts.
    id|
    date(format: d/m/Y)|
    title<
      skip(if: false)
    >
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5)@posts.id%7Cdate(format:d/m/Y)%7Ctitle<skip(if:false)>" target="_blank">View query results</a>

The syntax has the following elements:

- `(key:value)` : Arguments
- `[key:value]` or `[value]` : Array
- `$` : Variable
- `@` : Alias
- `.` : Advance relationship
- `|` : Fetch multiple fields
- `<...>` : Directive
- `--` : Fragment

Example:

```less
/?
query=
  posts(
    ids: [1, 1499, 1178],
    order: $order
  )@posts.
    id|
    date(format: d/m/Y)|
    title<
      skip(if: false)
    >|
    --props&
order=title|ASC&
props=
  url|
  author.
    name|
    url
```

<a href="https://newapi.getpop.org/api/graphql/?order=title%7CASC&amp;props=url%7Cauthor.name%7Curl&amp;query=posts(ids:%5B1,1499,1178%5D,order:%24order)@posts.id%7Cdate(format:d/m/Y)%7Ctitle<skip(if:false)>%7C--props" target="_blank">View query results</a>

### Dynamic schema

Because it is generated from code, different schemas can be created for different use cases, from a single source of truth. And the schema is natively decentralized or federated, enabling different teams to operate on their own source code.

To visualize it, in addition to the standard introspection field `__schema`, we can query field `fullSchema`:

```less
/?query=fullSchema
```

<a href="https://newapi.getpop.org/api/graphql/?query=fullSchema" target="_blank">View query results</a>

### Skip argument names

Field and directive argument names can be deduced from the schema. 

This query...

```less
// Query 1
/?
postId=1&
query=
  post($postId).
    date(d/m/Y)|
    title<
      skip(false)
    >
```

...is equivalent to this query:

```less
// Query 2
/?
postId=1&
query=
  post(id:$postId).
    date(format:d/m/Y)|
    title<
      skip(if:false)
    >
```

<a href="https://newapi.getpop.org/api/graphql/?postId=1&amp;query=post(%24postId).date(d/m/Y)%7Ctitle%3Cskip(false)%3E" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?postId=1&amp;query=post(id:%24postId).date(format:d/m/Y)%7Ctitle<skip(if:false)>" target="_blank">View query results #2</a>

### Operators and Helpers

All operators and functions provided by the language (PHP) can be made available as standard fields, and any custom “helper” functionality can be easily implemented too:

```less
1. /?query=not(true)
2. /?query=or([1,0])
3. /?query=and([1,0])
4. /?query=if(true, Show this text, Hide this text)
5. /?query=equals(first text, second text)
6. /?query=isNull(),isNull(something)
7. /?query=sprintf(%s API is %s, [PoP, cool])
8. /?query=context
```

<a href="https://newapi.getpop.org/api/graphql?query=not(true)" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql?query=or(%5B1,0%5D)" target="_blank">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql?query=and(%5B1,0%5D)" target="_blank">View query results #3</a>

<a href="https://newapi.getpop.org/api/graphql?query=if(true,Show%20this%20text,Hide%20this%20text)" target="_blank">View query results #4</a>

<a href="https://newapi.getpop.org/api/graphql?query=equals(first%20text,%20second%20text)" target="_blank">View query results #5</a>

<a href="https://newapi.getpop.org/api/graphql?query=isNull(),isNull(something)" target="_blank">View query results #6</a>

<a href="https://newapi.getpop.org/api/graphql?query=sprintf(%s%20API%20is%20%s,%20%5BPoP,%20cool%5D)" target="_blank">View query results #7</a>

<a href="https://newapi.getpop.org/api/graphql?query=context" target="_blank">View query results #8</a>

### Composable fields

The value from a field can be the input to another field, and there is no limit how many levels deep it can be.

In the example below, field `post` is injected, in its field argument `id`, the value from field `arrayItem` applied to field `posts`:

```less
/?query=
  post(
    id: arrayItem(
      posts(
        limit: 1,
        order: date|DESC
      ), 
    0)
  )@latestPost.
    id|
    title|
    date
```

<a href="https://newapi.getpop.org/api/graphql/?query=post(id:arrayItem(posts(limit:1,order:date%7CDESC),0))@latestPost.id%7Ctitle%7Cdate" target="_blank">View query results</a>

To tell if a field argument must be considered a field or a string, if it contains `()` it is a field, otherwise it is a string (eg: `posts()` is a field, and `posts` is a string)

### Composable fields with operators and helpers

Operators and helpers are standard fields, so they can be employed for composable fields. This makes available composable elements to the query, which removes the need to implement custom code in the resolvers, or to fetch raw data that is then processed in the application in the client-side. Instead, logic can be provided in the query itself.

```less
/?
format=Y-m-d&
query=
  posts.
    if (
      hasComments(), 
      sprintf(
        "This post has %s comment(s) and title '%s'", [
          commentsCount(),
          title()
        ]
      ), 
      sprintf(
        "This post was created on %s and has no comments", [
          date(format: if(not(empty($format)), $format, d/m/Y))
        ]
      )
    )@postDesc
```

<a href="https://newapi.getpop.org/api/graphql/?format=Y-m-d&amp;query=posts.if(hasComments(),sprintf(%22This%20post%20has%20%s%20comment(s)%20and%20title%20%27%s%27%22,%5BcommentsCount(),title()%5D),sprintf(%22This%20post%20was%20created%20on%20%s%20and%20has%20no%20comments%22,%5Bdate(format:if(not(empty(%24format)),%24format,d/m/Y))%5D))@postDesc" target="_blank">View query results</a>

This solves an issue with GraphQL: That we may need to define a field argument with arbitrary values in order to provide variations of the field's response (which is akin to REST's way of creating multiple endpoints to satisfy different needs, such as `/posts-1st-format/` and `/posts-2nd-format/`).

### Composable fields in directive arguments

Through composable fields, the directive can be evaluated against the object, granting it a dynamic behavior.

The example below implements the standard GraphQL `skip` directive, however it is able to decide if to skip the field or not based on a condition from the object itself:

```less
/?query=
  posts.
    title|
    featuredimage<
      skip(if:isNull(featuredimage()))
    >.
      src
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts.title%7Cfeaturedimage<skip(if:isNull(featuredimage()))>.src" target="_blank">View query results</a>

### Skip output if null

Exactly the same result above (`<skip(if(isNull(...)))>`) can be accomplished using the `?` operator: Adding it after a field, it skips the output of its value if it is null.

```less
/?query=
  posts.
    title|
    featuredimage?.
      src
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts.title%7Cfeaturedimage?.src" target="_blank">View query results</a>

### Composable directives

Directives can be nested, unlimited levels deep, enabling to create complex logic such as iterating over array elements and applying a function on them, changing the context under which a directive must execute, and others.

In the example below, directive `<forEach>` iterates all the elements from an array, and passes each of them to directive `<applyFunction>` which executes field `arrayJoin` on them:

```less
/?query=
  echo([
    [banana, apple],
    [strawberry, grape, melon]
  ])@fruitJoin<
    forEach<
      applyFunction(
        function: arrayJoin,
        addArguments: [
          array: %value%,
          separator: "---"
        ]
      )
    >
  >
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(%5B%5Bbanana,apple%5D,%5Bstrawberry,grape,melon%5D%5D)@fruitJoin%3CforEach%3CapplyFunction(function:arrayJoin,addArguments:%5Barray:%value%,separator:%22---%22%5D)%3E%3E" target="_blank">View query results</a>

### Directive expressions

An expression, defined through symbols `%...%`, is a variable used by directives to pass values to each other. An expression can be pre-defined by the directive or created on-the-fly in the query itself.

In the example below, an array contains strings to translate and the language to translate the string to. The array element is passed from directive `<forEach>` to directive `<advancePointerInArray>` through pre-defined expression `%value%`, and the language code is passed from directive `<advancePointerInArray>` to directive `<translate>` through variable `%toLang%`, which is defined only in the query:

```less
/?query=
  echo([
    [
      text: Hello my friends,
      translateTo: fr
    ],
    [
      text: How do you like this software so far?,
      translateTo: es
    ],
  ])@translated<
    forEach<
      advancePointerInArray(
        path: text,
        appendExpressions: [
          toLang:extract(%value%,translateTo)
        ]
      )<
        translate(
          from: en,
          to: %toLang%,
          oneLanguagePerField: true,
          override: true
        )
      >
    >
  >
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(%5B%5Btext:%20Hello%20my%20friends,translateTo:%20fr%5D,%5Btext:%20How%20do%20you%20like%20this%20software%20so%20far?,translateTo:%20es%5D,%5D)@translated%3CforEach%3CadvancePointerInArray(path:%20text,appendExpressions:%20%5BtoLang:extract(%value%,translateTo)%5D)%3Ctranslate(from:%20en,to:%20%toLang%,oneLanguagePerField:%20true,override:%20true)%3E%3E%3E" target="_blank">View query results</a>

### HTTP Caching

Cache the response from the query using standard [HTTP caching](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching). 

The response will contain `Cache-Control` header with the `max-age` value set at the time (in seconds) to cache the request, or `no-store` if the request must not be cached. Each field in the schema can configure its own `max-age` value, and the response's `max-age` is calculated as the lowest `max-age` among all requested fields (including composed fields).

Examples:

```less
//1. Operators have max-age 1 year
/?query=
  echo(Hello world!)

//2. Most fields have max-age 1 hour
/?query=
  echo(Hello world!)|
  posts.
    title

//3. Composed fields also supported
/?query=
  echo(posts())

//4. "time" field has max-age 0
/?query=
  time

//5. To not cache a response:
//a. Add field "time"
/?query=
  time|
  echo(Hello world!)|
  posts.
    title

//b. Add <cacheControl(maxAge:0)>
/?query=
  echo(Hello world!)|
  posts.
    title<cacheControl(maxAge:0)>
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(Hello+world!)" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=echo(Hello+world!)%7Cposts.title" target="_blank">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=echo(posts())" target="_blank">View query results #3</a>

<a href="https://newapi.getpop.org/api/graphql/?query=time" target="_blank">View query results #4</a>

<a href="https://newapi.getpop.org/api/graphql/?query=time%7Cecho(Hello+world!)%7Cposts.title" target="_blank">View query results #5</a>

<a href="https://newapi.getpop.org/api/graphql/?query=echo(Hello+world!)%7Cposts.title<cacheControl(maxAge:0)>" target="_blank">View query results #6</a>

### Many resolvers per field

Fields can be satisfied by many resolvers.

In the example below, field `excerpt` does not normally support field arg `length`, however a new resolver adds support for this field arg, and it is enabled by passing field arg `branch:experimental`:

```less
//1. Standard behaviour
/?query=
  posts.
    excerpt

//2. New feature not yet available
/?query=
  posts.
    excerpt(length:30)

//3. New feature available under 
// experimental branch
/?query=
  posts.
    excerpt(
      length:30,
      branch:experimental
    )
```
<a href="https://newapi.getpop.org/api/graphql/?query=posts.excerpt" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts.excerpt(length:30)" target="_blank">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts.excerpt(length:30,branch:experimental)" target="_blank">View query results #3</a>

Advantages:

- The data model can be customized for client/project
- Teams become autonoumous, and can avoid the bureaucracy of communicating/planning/coordinating changes to the schema
- Rapid iteration, such as allowing a selected group of testers to try out new features in production
- Quick bug fixing, such as fixing a bug specifically for a client, without worrying about breaking changes for other clients
- Field-based versioning

### Validate user state/roles

Fields can be made available only if user is logged-in, or has a specific role. When the validation fails, the schema can be set, by configuration, to either show an error message or hide the field, as to behave in public or private mode, depending on the user.

For instance, the following query will give an error message, since you, dear reader, are not logged-in:

```less
/?query=
  me.
    name
```

<a href="https://newapi.getpop.org/api/graphql/?query=me.name" target="_blank">View query results</a>

### Linear time complexity to resolve queries (`O(n)`, where `n` is #types)

The “N+1 problem” is completely avoided already by architectural design. It doesn't matter how many levels deep the graph is, it will resolve fast.

Example of a deeply-nested query:

```less
/?query=
  posts.
     author.
       posts.
         comments.
           author.
             id|
             name|
             posts.
               id|
               title|
               url|
               tags.
                 id|
                 slug
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts.author.posts.comments.author.id%7Cname%7Cposts.id%7Ctitle%7Curl%7Ctags.id%7Cslug" target="_blank">View query results</a>

### Efficient directive calls

Directives receive all their affected objects and fields together, for a single execution.

In the examples below, the Google Translate API is called the minimum possible amount of times to execute multiple translations:

```less
// The Google Translate API is called once,
// containing 10 pieces of text to translate:
// 2 fields (title and excerpt) for 5 posts
/?query=
  posts(limit:5).
    --props|
    --props@spanish<
      translate(en,es)
    >&
props=
  title|
  excerpt

// Here there are 3 calls to the API, one for
// every language (Spanish, French and German),
// 10 strings each, all calls are concurrent
/?query=
  posts(limit:5).
    --props|
    --props@spanish<
      translate(en,es)
    >|
    --props@french<
      translate(en,fr)
    >|
    --props@german<
      translate(en,de)
    >&
props=
  title|
  excerpt
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).--props%7C--props@spanish<translate(en,es)>&amp;props=title%7Cexcerpt" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).--props%7C--props@spanish%3Ctranslate(en,es)%3E%7C--props@french%3Ctranslate(en,fr)%3E%7C--props@german%3Ctranslate(en,de)%3E&amp;props=title%7Cexcerpt" target="_blank">View query results #2</a>

### Interact with APIs from the back-end

Example calling the Google Translate API from the back-end, as coded within directive `<translate>`:

```less
//1. <translate> calls the Google Translate API
/?query=
  posts(limit:5).
    title|
    title@spanish<
      translate(en,es)
    >
    
//2. Translate to Spanish and back to English
/?query=
  posts(limit:5).
    title|
    title@translateAndBack<
      translate(en,es),
      translate(es,en)
    >
    
//3. Change the provider through arguments
// (link gives error: Azure is not implemented)
/?query=
  posts(limit:5).
    title|
    title@spanish<
      translate(en,es,provider:azure)
    >
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).title%7Ctitle@spanish%3Ctranslate(en,es)%3E" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).title%7Ctitle@translateAndBack%3Ctranslate(en,es),translate(es,en)%3E" target="_blank">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).title%7Ctitle@spanish%3Ctranslate(en,es,provider:azure)%3E" target="_blank">View query results #3</a>

### Interact with APIs from the client-side

Example accessing an external API from the query itself:

```less
/?query=
echo([
  usd: [
    bitcoin: extract(
      getJSON("https://api.cryptonator.com/api/ticker/btc-usd"), 
      ticker.price
    ),
    ethereum: extract(
      getJSON("https://api.cryptonator.com/api/ticker/eth-usd"), 
      ticker.price
    )
  ],
  euro: [
    bitcoin: extract(
      getJSON("https://api.cryptonator.com/api/ticker/btc-eur"), 
      ticker.price
    ),
    ethereum: extract(
      getJSON("https://api.cryptonator.com/api/ticker/eth-eur"), 
      ticker.price
    )
  ]
])@cryptoPrices
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(%5Busd:%5Bbitcoin:extract(getJSON(%22https://api.cryptonator.com/api/ticker/btc-usd%22),ticker.price),ethereum:extract(getJSON(%22https://api.cryptonator.com/api/ticker/eth-usd%22),ticker.price)%5D,euro:%5Bbitcoin:extract(getJSON(%22https://api.cryptonator.com/api/ticker/btc-eur%22),ticker.price),ethereum:extract(getJSON(%22https://api.cryptonator.com/api/ticker/eth-eur%22),ticker.price)%5D%5D)@cryptoPrices" target="_blank">View query results</a>

### Interact with APIs, performing all required logic in a single query

The last query from the examples below accesses, extracts and manipulates data from an external API, and then uses this result to accesse yet another external API:

```less
//1. Get data from a REST endpoint
/?query=
  getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userEmailLangList
    
//2. Access and manipulate the data
/?query=
  extract(
    getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions"),
    email
  )@userEmailList
  
//3. Convert the data into an input to another system
/?query=
  getJSON(
    sprintf(
      "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
      [arrayJoin(
        extract(
          getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions"),
          email
        ),
        "%26emails[]="
      )]
    )
  )@userNameEmailList
```

<a href="https://newapi.getpop.org/api/graphql/?query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userEmailLangList" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=extract(getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22),email)@userEmailList" target="_blank">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name%7Cemail%26emails%5B%5D=%s%22,%5BarrayJoin(extract(getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22),email),%22%26emails%5B%5D=%22)%5D))@userEmailNameList" target="_blank">View query results #3</a>

### Create your content or service mesh

The example below defines and accesses a list of all services required by the application:

```less
/?query=
  echo([
    github: "https://api.github.com/repos/GatoGraphQL/GatoGraphQL",
    weather: "https://api.weather.gov/zones/forecast/MOZ028/forecast",
    photos: "https://picsum.photos/v2/list"
  ])@meshServices|
  getAsyncJSON(getSelfProp(%self%, meshServices))@meshServiceData|
  echo([
    weatherForecast: extract(
      getSelfProp(%self%, meshServiceData),
      weather.periods
    ),
    photoGalleryURLs: extract(
      getSelfProp(%self%, meshServiceData),
      photos.url
    ),
    githubMeta: echo([
      description: extract(
        getSelfProp(%self%, meshServiceData),
        github.description
      ),
      starCount: extract(
        getSelfProp(%self%, meshServiceData),
        github.stargazers_count
      )
    ])
  ])@contentMesh
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(%5Bgithub:%22https://api.github.com/repos/GatoGraphQL/GatoGraphQL%22,weather:%22https://api.weather.gov/zones/forecast/MOZ028/forecast%22,photos:%22https://picsum.photos/v2/list%22%5D)@meshServices%7CgetAsyncJSON(getSelfProp(%self%,meshServices))@meshServiceData%7Cecho(%5BweatherForecast:extract(getSelfProp(%self%,meshServiceData),weather.periods),photoGalleryURLs:extract(getSelfProp(%self%,meshServiceData),photos.url),githubMeta:echo(%5Bdescription:extract(getSelfProp(%self%,meshServiceData),github.description),starCount:extract(getSelfProp(%self%,meshServiceData),github.stargazers_count)%5D)%5D)@contentMesh" target="_blank">View query results</a>

### One-graph ready

Use custom fields to expose your data and create a single, comprehensive, unified graph.

The example below implements the same logic as the case above, however coding the logic through fields (instead of through the query):

```less
// 1. Inspect services
/?query=
  meshServices

// 2. Retrieve data
/?query=
  meshServiceData

// 3. Process data
/?query=
  contentMesh

// 4. Customize data
/?query=
  contentMesh(
    githubRepo: "getpop/api-graphql",
    weatherZone: AKZ017,
    photoPage: 3
  )@contentMesh
```

<a href="https://newapi.getpop.org/api/graphql/?query=meshServices" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=meshServiceData" target="_blank">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=contentMesh" target="_blank">View query results #3</a>

<a href="https://newapi.getpop.org/api/graphql/?query=contentMesh(githubRepo:%22getpop/api-graphql%22,weatherZone:AKZ017,photoPage:3)@contentMesh" target="_blank">View query results #4</a>

### Persisted fragments

Query sections of any size and shape can be stored in the server. It is like the persisted queries mechanism provided by GraphQL, but more granular: different persisted fragments can be added to the query, or a single fragment can itself be the query.

The example below demonstrates, once again, the same logic from the example above, but coded and stored as persisted fields:

```less
// 1. Save services
/?query=
  --meshServices

// 2. Retrieve data
/?query=
  --meshServiceData

// 3. Process data
/?query=
  --contentMesh

// 4. Customize data
/?
githubRepo=getpop/api-graphql&
weatherZone=AKZ017&
photoPage=3&
query=
  --contentMesh
```

<a href="https://newapi.getpop.org/api/graphql/?query=--meshServices" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=--meshServiceData" target="_blank">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=--contentMesh" target="_blank">View query results #3</a>

<a href="https://newapi.getpop.org/api/graphql/?githubRepo=getpop/api-graphql&amp;weatherZone=AKZ017&amp;photoPage=3&amp;query=--contentMesh" target="_blank">View query results #4</a>

### Combine with REST

Get the best from both GraphQL and REST: query resources based on endpoint, with no under/overfetching.

```less
// Query data for a single resource
{single-post-url}/api/rest/?query=
  id|
  title|
  author.
    id|
    name

// Query data for a set of resources
{post-list-url}/api/rest/?query=
  id|
  title|
  author.
    id|
    name
```

<a href="https://newapi.getpop.org/2013/01/11/markup-html-tags-and-formatting/api/rest/?query=id%7Ctitle%7Cauthor.id%7Cname" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/posts/api/rest/?query=id%7Ctitle%7Cauthor.id%7Cname" target="_blank">View query results #2</a>

### Output in many formats

Replace `"/graphql"` from the URL to output the data in a different format: XML or as properties, or any custom one (implementation takes very few lines of code).

```less
// Output as XML: Replace /graphql with /xml
/api/xml/?query=
  posts.
    id|
    title|
    author.
      id|
      name

// Output as props: Replace /graphql with /props
/api/props/?query=
  posts.
    id|
    title|
    excerpt
```

<a href="https://newapi.getpop.org/api/xml/?query=posts.id%7Ctitle%7Cauthor.id%7Cname" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/props/?query=posts.id%7Ctitle%7Cexcerpt" target="_blank">View query results #2</a>

### Normalize data for client

Just by removing the `"/graphql"` bit from the URL, the response is normalized, making its output size greatly reduced when a same field is fetched multiple times.

```less
/api/?query=
  posts.
     author.
       posts.
         comments.
           author.
             id|
             name|
             posts.
               id|
               title|
               url
```

Compare the output of the query in PoP native format:

<a href="https://newapi.getpop.org/api/?query=posts.author.posts.comments.author.id%7Cname%7Cposts.id%7Ctitle%7Curl" target="_blank">View query results</a>

...with the same output in GraphQL format:

<a href="https://newapi.getpop.org/api/graphql/?query=posts.author.posts.comments.author.id%7Cname%7Cposts.id%7Ctitle%7Curl" target="_blank">View query results</a>

### Handle issues by severity

Issues are handled differently depending on their severity:

- Informative, such as Deprecated fields and directives: to indicate they must be replaced with a substitute
- Non-blocking issues, such as Schema/Database warnings: when an issue happens on a non-mandatory field
- Blocking issues, such as Query/Schema/Database errors: when they use a wrong syntax, declare non-existing fields or directives, or produce an issues on mandatory arguments

```less
//1. Deprecated fields
/?query=
  posts.
    title|
    published
    
//2. Schema warning
/?query=
  posts(limit:3.5).
    title
    
//3. Database warning
/?query=
  users.
    posts(limit:name()).
      title
      
//4. Query error
/?query=
  posts.
    id[book](key:value)
    
//5. Schema error
/?query=
  posts.
    non-existant-field|
    is-status(
      status:non-existant-value
    )
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts.title%7Cpublished" target="_blank">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:3.5).title" target="_blank">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=users.posts(limit:name()).title" target="_blank">View query results #3</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts.id%5Bbook%5D(key:value)" target="_blank">View query results #4</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts.non-existant-field%7Cis-status(status:non-existant-value)" target="_blank">View query results #5</a>

### Type casting/validation

When an argument has its type declared in the schema, its inputs will be casted to the type. If the input and the type are incompatible, it ignores setting the input and throws a warning.

```less
/?query=
  posts(limit:3.5).
    title
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:3.5).title" target="_blank">View query results</a>

### Issues bubble upwards

If a field or directive fails and it is input to another field, this one may also fail.

```less
/?query=
  post(divide(a,4)).
    title
```

<a href="https://newapi.getpop.org/api/graphql/?query=post(divide(a,4)).title" target="_blank">View query results</a>

### Path to the issue

Issues contain the path to the composed field or directive were it was produced.

```less
/?query=
  echo([hola,chau])<
    forEach<
      translate(notexisting:prop)
    >
  >
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(%5Bhola,chau%5D)%3CforEach%3Ctranslate(notexisting:prop)%3E%3E" target="_blank">View query results</a>

### Log information

Any informative piece of information can be logged (enabled/disabled through configuration).

```less
/?
actions[]=show-logs&
postId=1&
query=
  post($postId).
    title|
    date(d/m/Y)
```

<a href="https://newapi.getpop.org/api/graphql/?actions%5B%5D=show-logs&amp;postId=1&amp;query=post(%24postId).title%7Cdate(d/m/Y)" target="_blank">View query results</a>


---
title: 💪 The PoP API now features HTTP caching!
metaDesc: Time to catch up, GraphQL!
socialImage: https://leoloso.com/images/graphql-logo.png
date: '2019-11-24'
tags:
  - pop
  - api
  - graphql
---

The [GraphQL API for PoP](https://github.com/getpop/api-graphql) now features [HTTP caching](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)! From now on, whenever requesting the API, the response will be cached (in the server, intermediate caches such as CDNs, and the user's browser) as indicated through the `Cache-Control` header. 

(Really, GraphQL, how comes you still don't support it? Why do you keep re-inventing the wheel?)

### How does it work?

It sends a `Cache-Control` header with a `max-age` value, or `no-store` if the response must not be cached.

The beauty of the implementation for PoP is that every field can have a different max-age configuration, and the response will automatically calculate the lowest max-age from all required fields. And it involves very few lines of code: Just decide how much time to cache each field and add it to the configuration, and that's it, chill.

### Alright, show me the magic!

Sure! Here I add several examples. Please click on the links below, and inspect the response headers using Chrome or Firefox's developer tools' Network tab.

Operators have a max-age of 1 year:

```php
/?query=
  echo(Hello world!)
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(Hello+world!)">[View query results]</a>

By default, fields have a max-age of 1 hour:

```php
/?query=
  echo(Hello world!)|
  posts.
    title
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(Hello+world!)|posts.title">[View query results]</a>

Nested fields are also taken into account when computing the lowest max-age:

```php
/?query=
  echo(arrayAsQueryStr(posts()))
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(arrayAsQueryStr(posts()))">[View query results]</a>

`"time"` field is not to be cached (max-age: 0):

```php
/?query=
  time
```

<a href="https://newapi.getpop.org/api/graphql/?query=time">[View query results]</a>

Ways to not cache a response:

a. Add field `"time"` to the query:

```php
/?query=
  time|
  echo(Hello world!)|
  posts.
    title
```

<a href="https://newapi.getpop.org/api/graphql/?query=time|echo(Hello+world!)|posts.title">[View query results]</a>

b. Override the default `maxAge` configuration for a field, by adding argument `maxAge: 0` to directive `<cacheControl>`:

```php
/?query=
  echo(Hello world!)|
  posts.
    title<cacheControl(maxAge:0)>
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(Hello+world!)|posts.title<cacheControl(maxAge:0)>">[View query results]</a>

Time to celebrate!!! 🥳

![Celebrate!](/images/celebration-time.jpg)


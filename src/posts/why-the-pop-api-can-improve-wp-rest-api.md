---
title: 👀 Why the PoP API can improve the WP REST API
metaDesc: Blog post for contibutors to the WP REST API
socialImage: https://leoloso.com/images/wordpress-logo.png
date: '2020-01-16'
tags:
  - pop
  - api
  - wordpress
  - rest
  - graphql
---

I wrote this blog post to share it with the contributors to the WP REST API in the Slack workspace.

### What is it?

The [PoP API](https://github.com/leoloso/api-graphql) is an API that combines both REST and GraphQL into one, providing the benefits from both of them. 

The code for both APIs is a single source of truth: the developer only codes the API once, and this is accessible through both REST and GraphQL interfaces just by changing the URL (eg: queries for [GraphQL](https://newapi.getpop.org/api/graphql/?query=posts.id|title|date|url|author.id|name|url), [REST with specific fields](https://newapi.getpop.org/api/graphql/?query=posts.id|title|date|url|author.id|name|url), [REST with default fields](https://newapi.getpop.org/api/rest/)).

### Does it work with WordPress? 

Yes. Indeed, [the demo](https://newapi.getpop.org/api/graphql/?query=posts.id|title|date|url|author.id|name|url) is a [WordPress site](https://newapi.getpop.org). 

However, it requires PHP 7.1 or above (the WordPress minimum required PHP version is currently only 5.6).

### Can it be integrated with the WP REST API?

I honestly don't know. However, I wonder if you are already planning the v3 for the WP REST API and what architectural foundations it will have (I wonder if Adam will talk about this in his WordCamp Asia talk?). In that case, maybe this API could be useful?

### Does it provide a schema?

Yes. The API generates its schema automatically from PHP code, and the schema can be dynamic (i.e. different users can access different fields). The API can then generate the [JSON schema required for the WP REST API](https://timothybjacobs.com/2017/05/17/json-schema-and-the-wp-rest-api/), however this has to be done. 

(I have only almost-finished implementing the [schema for GraphQL](https://newapi.getpop.org/api/graphql/?query=__schema) so far).

### How is it different from WP GraphQL?

Even though similar to [WP GraphQL](https://www.wpgraphql.com/) the PoP API implements a GraphQL server for WordPress, its different architecture enables it to support a wider array of features.

The PoP API is based on [server-side components](https://www.smashingmagazine.com/2019/01/introducing-component-based-api/), from which it can generate a graph to output the response as in GraphQL. Hence, the PoP API follows and satisfies the GraphQL spec, however it is not limited to it, and is able to also support REST.

In addition, it is easier to code and set-up, and it is more performant (eg: it supports server-side caching). The complete list of unique features from this API can be found [in these slides](https://slides.com/leoloso/schemaless-graphql/), starting from [slide #13](https://slides.com/leoloso/schemaless-graphql/#/13/).

### Is it ready?

For querying data it is finished. I've been using it for some time now, and I think that it is almost-ready for PROD (since I've been the only user so far, more testing is needed).

For resolving mutations it is still a work in progress (I should be able to implement it within two months). 

### Issues that this API can tackle very easily

I went through the [issues with the REST API in Trac](https://core.trac.wordpress.org/query?status=!closed&focuses=~rest-api), both the new and already-closed ones, and I identified the following ones as issues that can either be solved very easily with this API, or wouldn't even be an issue in first place.

[#39242 - Add caching to count_user_posts()](https://core.trac.wordpress.org/ticket/39242) and [#48838 - Consider "caching" embedded REST API requests](https://core.trac.wordpress.org/ticket/48838)

Directive `<cacheControl>` provides support for HTTP Caching, by setting a `"cache-control"` header to the response in which the `max-age` is automatically calculated from all required fields (the `max-age` value can be configured on a field-by-field basis). The caching itself is done by another layer (eg: Apache, a caching plugin such as WP Super Cache).

[#40365 - Introduce a REST API endpoint for sites](https://core.trac.wordpress.org/ticket/40365)

Can currently do `/?query=site(siteDomain)` to choose a specific site, after which all operations and queries, such as `/?query=site(siteDomain).posts.title`, will be performed on that site

[#40556 - REST API: Allow for server generating a user's password](https://core.trac.wordpress.org/ticket/40556)

This functionality can be created very easily. Eg: when creating a new user through the API (still not implemented!), if the array containing the user information has property "password" missing, then generate the password on the server.

[#41159 - REST API: Add a way to determine if a request is an embedded "sub-request"](https://core.trac.wordpress.org/ticket/41159) and [#46249 - REST API Performance Issues: wp/v2/posts + _embed / count_user_posts()](https://core.trac.wordpress.org/ticket/46249)

A single request can resolve the whole object data graph. Then, since all data from all nested objects are already retrieved on the same request, doing an "embed" is not needed anymore

[#41821 - REST API: Add support for threaded comments](https://core.trac.wordpress.org/ticket/41821)

Through field arguments, it is possible to provide how many levels of threaded comments to retrieve. Eg: `/?query=posts.comments(threadLevels:3).content`

[#43484 - WordPress Notification Center proposal](https://core.trac.wordpress.org/ticket/43484)

Through the implementation of directives to send the notification to the different channels, the API-first approach for the Notifications Center can be satisfied in a straightforward manner. 

For instance, following the following requirement...

> ... there would be multiple destinations that a user can have enabled, and the user should be able to configure these individually, with sane defaults applied by default. Destinations can be dashboard notification center, email, Slack, HipChat, IRC, SMS, ...

... sending a list of the logged-in user's notifications to 2 different channels (Slack and email) could be satisfied like this:

```less
/?query=
  me.
    notifications.
      sprintf("Date: %s. Notification: %s", date(), title())<
        sendToSlack,
        sendToEmail
      >
```

[#43941 - Add default value to register meta](https://core.trac.wordpress.org/ticket/43941) and [#45799 - Add an optional default parameter for WP_REST_Request::get_param method](https://core.trac.wordpress.org/ticket/45799)

A directive `<defaultValue>` can set the default value for properties when querying or mutating data. It can be configured on a field-by-field basis (similar to directive `<cacheControl>`, which allows to define a custom `maxAge` value for each field)

[#45252 - Reconsider the `context` argument in REST API calls](https://core.trac.wordpress.org/ticket/45252), [#49110 - Add ability to lock/restrict public REST API access from WP Admin](https://core.trac.wordpress.org/ticket/49110), [#48885 - REST API: Add a route to read and update separate site settings](https://core.trac.wordpress.org/ticket/48885) and [#48812 - REST API: Settings endpoint - read access](https://core.trac.wordpress.org/ticket/48812)

In this API, the schema is dynamic: there is no `context` whatsoever, and rules can be configured by the developer based on fixed or runtime conditions. For instance, the API allows to whitelist or blacklist fields, define who has access to a certain field (eg: only logged-in users, or users with a given role), and grant fine-grained control through the use of custom directives.

[#47194 - Posts endpoint: Enable collection parameters for querying by custom field](https://core.trac.wordpress.org/ticket/47194)

The API resolves nested queries with linear complexity time (on the number of types to query, not on the number of nodes), so querying by metadata is not expensive, and can be achieved easily through field arguments.

[#48818 - REST API does not check nested required properties](https://core.trac.wordpress.org/ticket/48818)

Nested properties are independently validated.

[#48828 - wp rest api renders loads and executes content for all pages when gutenberg retrieves a list of pages for the page parent select](https://core.trac.wordpress.org/ticket/48828)

Because the query can define what fields are required, doing `/pages/?query=title` will not fetch the page `content`. 

In addition, the default fields to be retrieved when querying through REST can be configured by the developer, so that querying `/pages/` can be equivalent to `/pages/?query=title|date`

[#48823 - Collect all REST API meta errors at once](https://core.trac.wordpress.org/ticket/48823) and [#48822 - Indicate partial success/error of a REST API request](https://core.trac.wordpress.org/ticket/48822)

Errors can be retrieved and shown independently for each query result, or grouped and shown all together. 

Errors bubble-up, so that they produce an error on the upper levels, however they are non-blocking for results at the same level, allowing successful results to be retrieved and sent in the response.

[#48079 - REST API: optimize how the schema API is generated for block-renderer endpoints](https://core.trac.wordpress.org/ticket/48079)

Instead of registering multiple endpoints, a block can register a unique endpoint which is customized through field arguments. In addition, the entries in the schema itself can be filtered through a query arg, so the response can exclude the unwanted entries to reduce the output size.

[#42094 - REST API: extend _fields parameter to selectively include nested fields in response JSON](https://core.trac.wordpress.org/ticket/42094)

This is natively supported, and for endless levels, not just one (such as querying `/?query=posts.author.followers.name`)

[#39965 - REST API: Introduce a controller for searching across post types](https://core.trac.wordpress.org/ticket/39965)

This is natively supported through "Union Type Resolvers", which follows the GraphQL spec to return results from different types. This applies to retrieving data from different post types (which can be resolved through a single `get_posts` call defining the corresponding post types) and from completely different entities, such as posts and users (through joining the results from executing `get_posts` and `get_users`).

In addition, field `"content"` retrieves data from different post types (field `"posts"`, instead, means exclusively "posts", so that it excludes custom post types, such as "nav_items" or "products").

[#46238 - REST API: Allow conditional field registration](https://core.trac.wordpress.org/ticket/46238)

This is natively supported. A field can be resolved by different resolvers, which are called in a chain following their priority upon registration, and each resolver can decide if to resolve the field on an object-by-object basis (eg: if the object is of a given post type).

### Want to meet in WordCamp Asia 2020?

Since I will be attending WordCamp Asia 2020 this February in Bangkok, we could meet during the contributor's day and I can explain a bit better how this API works.

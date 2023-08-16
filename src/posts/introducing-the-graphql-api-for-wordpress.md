---
title: 🎉 Introducing the GraphQL API for WordPress
metaDesc: Why I created this new WordPress plugin
socialImage: /images/interactive-schema.png
date: '2020-07-23'
tags:
  - wordpress
  - graphql
  - api
---

**Update 04/02:** The plugin [is now scoped](https://graphql-api.com/blog/graphql-api-for-wp-is-now-scoped-thanks-to-php-scoper/)! So it is fully ready for production, and will be soon uploaded to [wp.org](https://wordpress.org/plugins/) 🥳

**Update 23/01:** The GraphQL API for WordPress has its own site now: [graphql-api.com](https://graphql-api.com).

Yesterday I launched the project I've put all my efforts into: the [GraphQL API for WordPress](https://github.com/GatoGraphQL/GatoGraphQL/tree/master/layers/GatoGraphQLForWP/plugins/gatographql), a plugin which enables to retrieve data from a WordPress site using the increasingly popular [GraphQL](https://graphql.org) API.

![Interactive Schema screen in GraphQL API for WordPress](/images/interactive-schema.png "Interactive Schema screen in GraphQL API for WordPres. <a href='/images/interactive-schema.png' target='_blank'>Open in new tab</a>")

I've been developing this plugin full time for most of the last 12 months. And, taken together with [GraphQL by PoP](https://graphql-by-pop.com) (the CMS-agnostic GraphQL server in PHP, on which it is based), I've spent several years into this project.

So it's a great relief and pleasure to be finally able to release it to the world. In this blog post I explain all about it.

## Existing API solutions in WordPress

Before anything, let's tackle the elephant in the room. You may be thinking: "Wait a second. Aren't there already API solutions for WordPress?"

Yes, there are. The 2 most popular solutions are WP REST API, which is already part of WordPress core, and [WPGraphQL](https://www.wpgraphql.com/), a plugin which is also based in GraphQL.

<div class="[ md:box-flex space-between ]">
    <div class="[ md:width-half ]">
        <img src="/images/wp-rest-logo.png" alt="WP REST API logo">
    </div>
    <div class="[ md:width-half ]">
        <img src="/images/wpgraphql-logo.png" alt="WPGraphQL logo">
    </div>
</div>

"I thought so! But aren't these APIs already good?"

Yes, they are indeed good. The WP REST API is kept always up-to-date with the latest requirements from the WordPress project, most notably concerning Gutenberg. And WPGraphQL, even though it hasn't been published to the WordPress directory yet, has become more stable during the past year, gained an increasing community of users, and is approaching its 1.0 version.

"So then, why do we need yet another solution?"

Possibly, you do not need another solution. If whichever solution you're already using satisfies all your needs, and doesn't give you any trouble at all, then stay there.

But if your solution doesn't fully satisfy your needs, because it's not so fast, secure or friendly to use; it takes plenty of time to code or write documentation for it; it has limitations that hinder your application; or any other reason at all... then hear me out.

## What's so good about this new plugin

These are, I believe, GraphQL API for WordPress's two killer features:

### 1. Persisted queries

Persisted queries use GraphQL to provide pre-defined enpoints as in REST, obtaining the benefits of both APIs.

With **REST**, you create multiple endpoints, each returning a pre-defined set of data.

| Advantages |
| --- |
| ✅ It's simple |
| ✅ Accessed via `GET` or `POST` |
| ✅ Can be cached on the server or CDN |
| ✅ It's secure: only intended data is exposed |

| Disadvantages |
| --- |
| ❌ It's tedious to create all the endpoints |
| ❌ A project may face bottlenecks waiting for endpoints to be ready |
| ❌ Producing documentation is mandatory |
| ❌ It can be slow (mainly for mobile apps), since the application may need several requests to retrieve all the data |

With **GraphQL**, you provide any query to a single endpoint, which returns exactly the requested data.

| Advantages |
| --- |
| ✅ No under/over fetching of data |
| ✅ It can be fast, since all data is retrieved in a single request |
| ✅ It enables rapid iteration of the project |
| ✅ It can be self-documented |
| ✅ It provides an editor for the query (GraphiQL) that simplifies the task |

| Disadvantages |
| --- |
| ❌ Accessed only via `POST` |
| ❌ It can't be cached on the server or CDN, making it slower and more expensive than it could be |
| ❌ It may require to reinvent the wheel, such as uploading files or caching |
| ❌ Must deal with additional complexities, such as the N+1 problem |

**Persisted queries** combine these 2 approaches together:

- It uses GraphQL to create and resolve queries
- But instead of exposing a single endpoint, it exposes every pre-defined query under its own endpoint

Hence, we obtain multiple endpoints with predefined data, as in REST, but these are created using GraphQL, obtaining the advantages from each:

| Advantages |
| --- |
| ✅ Accessed via `GET` or `POST` |
| ✅ Can be cached on the server or CDN |
| ✅ It's secure: only intended data is exposed |
| ✅ No under/over fetching of data |
| ✅ It can be fast, since all data is retrieved in a single request |
| ✅ It enables rapid iteration of the project |
| ✅ It can be self-documented |
| ✅ It provides an editor for the query (GraphiQL) that simplifies the task |

And avoiding their disadvantages:

| Disadvantages |
| --- |
| ~~❌ It's tedious to create all the endpoints~~ |
| ~~❌ A project may face bottlenecks waiting for endpoints to be ready~~ |
| ~~❌ Producing documentation is mandatory~~ |
| ~~❌ It can be slow (mainly for mobile apps), since the application may need several requests to retrieve all the data~~ |
| ~~❌ Accessed only via `POST`~~ |
| ~~❌ It can't be cached on the server or CDN, making it slower and more expensive than it could be~~ |
| ~~❌ It may require to reinvent the wheel , such asuploading files or caching~~ |
| ~~❌ Must deal with additional complexities, such as the N+1 problem~~ 👈🏻 this issue is [resolved by the underlying engine](https://graphql-by-pop.com/docs/architecture/suppressing-n-plus-one-problem.html) |

Check out this video on creating a new persisted query:

<iframe src="https://player.vimeo.com/video/443790273?loop=1" width="900" height="507" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

### 2. Security

The GraphQL single endpoint, which can return any piece of data accessible through the schema, could potentially allow malicious actors to retrieve private information. Hence, we must implement security measures to protect the data.

The GraphQL API for WordPress provides several mechanisms to protect the data:

👉 We can decide to only expose data through **persisted queries**, and completely disable access through the single endpoint (indeed, it is disabled by default).

👉 We can create **custom endpoints**, each tailored to different users (such as one or another client).

👉 We can set permissions to each field in the schema through **Access Control Lists**, defining rules such as: Is the user logged-in or not? Does the user have a certain role or capability? Or any custom rule.

👉 We can define the API to be either **public or private**:

In the **public API**, the fields in the schema are exposed, and when the permission is not satisfied, the user gets an error message with a description of why the permission was rejected.

In the **private API**, the schema is customized to every user, containing only the fields available to him or her, and so when attempting to access a forbidden field, the error message says that the field doesn't exist.

## Quick overview of the features

Here is an overview of the features shipped with the first version of the plugin.

### GraphiQL and GraphiQL Explorer

[GraphiQL](https://github.com/graphql/graphiql) is a user-friendly client to create GraphQL queries.

The [GraphiQL Explorer](https://github.com/OneGraph/graphiql-explorer) is an interactive tool attached to GraphiQL, that allows to create the query by point-and-clicking on fields.

These 2 tools are embedded in the plugin, making it very easy to create the queries:

![GraphiQL with Explorer](/images/graphiql-explorer.gif "GraphiQL with Explorer")

### Interactive schema

[GraphQL Voyager](https://github.com/APIs-guru/graphql-voyager) is a tool that enables to explore the GraphQL schema:

![Interactive schema](/images/interactive-schema.gif "Interactive schema")

### Persisted queries

As already explained.

### Custom endpoints

A custom endpoint with a specific schema configuration can be created for any target, such as:

- A specific client or group of users
- A specific application, like mobile app or website
- Interacting with some 3rd-party API
- etc

The custom endpoint is a Custom Post Type, and its slug becomes the endpoint. An endpoint with title `"My endpoint"` and slug `my-endpoint` will:

- Be accessible under `/graphql/my-endpoint/`
- Expose its own GraphiQL client under `/graphql/my-endpoint/?view=graphiql`
- Expose its own Interactive schema under `/graphql/my-endpoint/?view=schema`

![Creating a custom endpoint](/images/custom-endpoint.png "Creating a custom endpoint")

![Custom endpoint's GraphiQL client](/images/custom-endpoint-graphiql.png "Custom endpoint's GraphiQL client")

![Custom endpoint's Interactive schema](/images/custom-endpoint-interactive-schema.png "Custom endpoint's Interactive schema")

### Schema configurations

Every custom endpoint and persisted query can select a schema configuration, containing the sets of Access Control Lists, HTTP Caching rules, and Field Deprecation entries (and other features, provided by extensions) to be applied on the endpoint.

![Creating a new schema configuration](/images/schema-configuration.png "Creating a new schema configuration")

### Access control

We define permissions to access every field and directive in the schema through Access Control Lists. Shipped in the plugin are the following rules:

- Disable access
- Grant access if the user is logged-in or out
- Grant access if the user has some role
- Grant access if the user has some capability

New custom rules can be added, such as:

- Grant access by IP
- Grant access by validating some header from the request
- Grant access if user has a PRO membership
- Grant access on weekends only
- Anything

![Creating an Access Control List](/images/access-control.gif "Creating an Access Control List")

### Public/private API

When access to some a field or directive is denied, there are 2 ways for the API to behave:

- Public API: Provide an error message to the user, indicating why access is denied. This behavior makes the metadata from the schema always available.
- Private API: The error message indicates that the field or directive does not exist. This behavior exposes the metadata from the schema only to those users who can access it.

![Public/Private schema](/images/public-private-schema.gif "Public/Private schema")

### HTTP caching

Because it sends the queries via `POST`, GraphQL is normally not cacheable on the server-side or intermediate stages between the client and the server, such as a CDN.

However, persisted queries can be accessed via `GET`, hence we can cache their response.

The max-age value is defined on a field and directive-basis. The response will send a `Cache-Control` header with the lowest max-age value from all the requested fields and directives, or `no-store` if either any field or directive has max-age: `0`, or if access control must check the user state for any field or directive.

![Defining a cache control policy](/images/cache-control.gif "Defining a cache control policy")

### Field deprecation

The plugin provides a user interface to deprecate fields, and indicate how they must be replaced.

![Field deprecation](/images/field-deprecation.gif "Field deprecation")

### Query inheritance

Persisted queries (and also custom endpoints) can declare a parent persisted query, from which it can inherit its properties: Its schema configuration and its GraphQL query.

Inheritance is useful for creating a hierarchy of API endpoints, such as:

- `/graphql-query/posts/mobile-app/`
- `/graphql-query/posts/website/`

In this hierarchy, we are able to define the query only on the parent `posts` persisted query, and then each child persisted query, `mobile-app` and `website`, will obtain the query from the parent, and define only its schema configuration (as to set the custom access control rules, HTTP caching and deprecated fields) for each application.

Likewise, we can declare the configuration at the parent level, and then all children implement only the GraphQL query.

- `/graphql-query/mobile-app/posts/`
- `/graphql-query/mobile-app/users/`
- `/graphql-query/website/posts/`
- `/graphql-query/website/users/`

Children queries can override variables defined in the parent query. For instance, we can generate this structure:

- `/graphql-query/posts/english/`
- `/graphql-query/posts/french/`

The GraphQL query in `posts` can have variable `$lang`, which is then set in each of the children queries with the value for the language: `"en"` and `"fr"`.

The number of levels is unlimited, so we can also create:

- `/graphql-query/mobile-app/posts/english/`
- `/graphql-query/mobile-app/posts/french/`

![API inheritance](/images/api-inheritance.gif "API inheritance")

### Namespacing

When different plugins use the same name for a type or interface, there will be a conflict in the schema. Whenever this happens, enabling schema namespacing will fix the problem, since it prepends all types and interfaces with their namespace.

For instance, if WooCommerce and Easy Digital Downloads both implement a type `Product`, there there will be a conflict. With namespacing enabled, these types become `Automattic_WooCommerce_Product` and `SandhillsDevelopment_EDD_Product`, and the conflict is resolved.

![A namespaced schema](/images/namespaced-interactive-schema.jpg "A namespaced schema")

## Q&A

Here a response to some questions I've received:

### Is it ready for production?

In theory yes, but since I've just launched the plugin, you'd better test if for some time to make sure there are no issues.

**Update 04/02:** the plugin [is now scoped](https://graphql-api.com/blog/graphql-api-for-wp-is-now-scoped-thanks-to-php-scoper/)! So the issue below does not apply anymore 🥳

~~In addition, please be aware that the GraphQL API has a dependency on a few 3rd-party PHP packages, which must be scoped to avoid potential problems with a different version of the same package being used by another plugin in the site, but the scoping [must yet be done](https://github.com/GatoGraphQL/GatoGraphQL/tree/master/layers/GatoGraphQLForWP/plugins/gatographql/issues/246).~~ 

~~Hence, test the plugin in your development environment first, and with all other plugins also activated. If you run into any trouble, please [create an issue](https://github.com/leoloso/PoP/issues/new).~~

### Can I use it with WooCommerce/ACF/{Place your name here}?

Yes, you can, because the GraphQL API for WordPress is extensible, supporting integration with any plugin. But, this integration must still be done!

If there is any plugin you need support for, and you're willing to do the implementation (i.e. creating the corresponding types and resolvers for the fields), please be welcome to [create an issue](https://github.com/leoloso/PoP/issues/new) and I will help.

### Can I use it with Gatsby?

In theory yes, it is doable, but I don't know why you'd want to do that: Jason Bahl, the creator of WPGraphQL, works for Gatsby, so relying on WPGraphQL is clearly the way to go.

### Who can use it?

Hopefully, everyone! Even though GraphQL involves technical concepts, I've worked hard to make the plugin as easy-to-use as possible.

Following the ethos from WordPress, this plugin attempts to allow anyone, i.e. bloggers, designers, marketers, salesmen, and everyone else, to be able to create an API in a simple way:

- Composing the GraphQL query by clicking on fields, and hitting "Publish"
- Granting access to the API by clicking on fields, selecting what access control rules to apply, and hitting "Publish"

Also, because the single endpoint is disabled by default, the risk of unintentionally exposing sensitive data is minimal.

### Can I switch from WPGraphQL to GraphQL API?

You can, but you will need to rewrite your existing GraphQL queries, because the shape of the schema provided by both plugins is different. 

For instance, some differences are:

- A different name for the same field, such as `postTags` instead of `tags`
- A different set of arguments to a field, such as WPGraphQL's `where` argument for the `posts` field, handled differently in GraphQL API
- WPGraphQL uses the Relay spec for edge and node data, while GraphQL API doesn't

### What's the status of the plugin?

**Update 04/02:** the plugin [has guides on how to use it](https://graphql-api.com/guides/), and [has been scoped](https://graphql-api.com/blog/graphql-api-for-wp-is-now-scoped-thanks-to-php-scoper/)! So the issues below do not apply anymore 🥳

GraphQL API is stable and, I'd dare say, ready for production (that is, after playing with it in development). ~~But some things are not complete yet:~~

- ~~[The documentation for the shipped modules](https://github.com/leoloso/PoP/issues/225). I'm working on them currently, so they should be ready soon.~~
- ~~[Scoping of the external PHP dependencies](https://github.com/leoloso/PoP/issues/246). I'll work on this issue then.~~

~~When these two issues are resolved, I may already decide to publish the GraphQL API plugin to the WordPress plugin repository, depending on the feedback I have received by then.~~

Moving forward, the schema must be completed to cover all WordPress entities, including:

- Categories
- Menus
- Options
- Meta values

Finally, GraphQL API does not currently support mutations. It must also be implemented.

## WordPress and GraphQL seamlessly integrated

WordPress is the most popular CMS in the world, because it makes it easy to anyone to create and publish content. It provides a great user experience.

GraphQL is steadily becoming the most popular API solution, because it makes it easy to access the data from a website. It provides a great developer experience.

I believe that the GraphQL API for WordPress can succeed to integrate these 2 together, combining their characteristics: to make it easy to anyone to provide access to their content.

This is, I believe, "democratizing data publishing".

## Parting words

If you like what you've seen, please:

🙏 Try it out<br/>
🙏 Star it [on GitHub](https://github.com/leoloso/PoP)<br/>
🙏 Share it with your friends and colleagues<br/>
🙏 Talk about it (please do! I have no deep-pockets to promote it, I depend on word of mouth)

And please, give me feedback about your experience, either good or bad. If you enjoyed it and found it useful, please let me know. If you think that something can be improved, let me know. If something didn't work, or something else broke in the site, let me know. Be welcome to create an issue on the repo.

![GraphQL for the masses!](/images/graphql-for-everybody.jpg)

Thanks for reading!
---
title: 👏 Types and interfaces in GraphQL by PoP are now namespaced! 
metaDesc: Let 2 WordPress plugins implement type "Portfolio"
socialImage: https://leoloso.com/images/shocked.jpg
date: '2020-02-03'
tags:
  - pop
  - api
  - graphql
---

I have just made the types and interfaces in [GraphQL by PoP](https://github.com/getpop/graphql) be automatically namespaced!

This is how the normal schema looks like [in the GraphQL Voyager](https://newapi.getpop.org/graphql-interactive/):

![Interactive schema "Interactive schema"](/images/normal-interactive-schema.jpg)

This is how it looks in [its namespaced version](https://newapi.getpop.org/graphql-interactive/?use_namespace=1):

![Namespaced interactive schema "Namespaced interactive schema"](/images/namespaced-interactive-schema.jpg)

In the namespaced schema, all types are automatically prepended using the PHP package's owner and name (in this case it is `PoP_ComponentModel_`, where `PoP` is the package owner, and `ComponentModel` is the package name).

## Why namespaces

Namespaces help manage the complexity of the schema. This is particularly useful when embedding components from a 3rd party, where we can't control how the types have been named. For instance, different plugins in [WordPress](https://wordpress.org) may implement a `Product` custom post type (such as [WooCommerce](https://woocommerce.com/) or [Easy Digital Downloads](https://easydigitaldownloads.com)); if they wish to create a GraphQL type for it, they can't just name it `Product` or it may clash with another plugin. Hence, they would have to manually prepend their their type names with the company name (such as doing `WooCommerce_Product`), which is not the most beautiful solution. 

Now, GraphQL by PoP enables to define an environment variable, and it will automatically prepend all types from a package with the PHP namespace used for that package (following the [PSR-4](https://www.php-fig.org/psr/psr-4/) convention, PHP namespaces have the form of `ownerName\projectName`, such as `"PoP\ComponentModel"`).

There are many more use cases where namespaces can be pretty useful, listed down in [this GitHub issue](https://github.com/graphql/graphql-spec/issues/163).

## GraphiQL Demo!

If you want to play with the namespaced schema, you can do it in the GraphiQL clients below.

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

This is the [GraphiQL client in normal mode](https://newapi.getpop.org/graphiql/):

<div id="graphiql-normal-schema" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

An this is the [GraphiQL client in namespaced mode](https://newapi.getpop.org/graphiql/?use_namespace=1) (which is enabled by adding URL param `use_namespace=1`):

<div id="graphiql-namespaced-schema" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

<script
  crossorigin
  src="https://unpkg.com/react/umd/react.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/graphiql/graphiql.min.js"
></script>

<script>
  const apiURL = 'https://newapi.getpop.org/api/graphql/';
  const responseText = "Click the \"Execute Query\" button";
  const graphQLFetcher = graphQLParams =>
    fetch(apiURL, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    })
      .then(response => response.json())
      .catch(() => response.text());

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        docExplorerOpen: true,
        response: responseText,
        query: "query {\n  posts {\n    url\n    title\n    excerpt\n    date\n    tags {\n      name\n      url\n    }\n    comments {\n      content\n      date\n      author {\n        name\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-normal-schema'),
  );

  const graphQLFetcher2 = graphQLParams =>
    fetch(apiURL+'/?use_namespace=1', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    })
      .then(response => response.json())
      .catch(() => response.text());

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher2,
        docExplorerOpen: true,
        response: responseText,
        query: "query {\n  posts {\n    url\n    title\n    excerpt\n    date\n    tags {\n      name\n      url\n    }\n    comments {\n      content\n      date\n      author {\n        name\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-namespaced-schema'),
  );
</script>

## Coming next... 🥁

I'll end my blog post as usual: if you are using WordPress and you need a kick-ass API, then give [GraphQL by PoP](https://github.com/getpop/graphql) a try, what are you waiting for!? 

Oh, you're waiting for the plugin, you say? 

Well, good news then... it is coming sooooon...

![](/images/shocked.jpg)

This is going to be gooooood stuff, I promise! 🤪

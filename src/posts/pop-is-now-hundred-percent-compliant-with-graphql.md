---
title: 🙏 Adding 100% compliance with GraphQL!
metaDesc: Introspection fields are now supported
socialImage: https://leoloso.com/images/graphql-logo.png
date: '2020-01-20'
tags:
  - pop
  - api
  - graphql
---

I have added support to the [GraphQL introspection fields](https://graphql.github.io/graphql-spec/draft/#sec-Introspection), so my implementation of a GraphQL server in PHP is now 100% GraphQL-spec compliant!

Because now it's officially GraphQL, I will simply call this project **GraphQL by PoP** 😁.

The API comes in 2 modes: 

- [Classic GraphQL](https://github.com/getpop/graphql): The GraphQL that you expect
- [Extended GraphQL](https://github.com/getpop/api-graphql): An upgraded version of GraphQL, supporting many more features (such as composable fields and composable directives), and using a [URL-based syntax](https://github.com/getpop/field-query).

### Demo!

> Note: The demo website [runs on WordPress](https://newapi.getpop.org), has the GraphQL endpoint [here](https://newapi.getpop.org/api/graphql/), and its GraphiQL client is [here](https://newapi.getpop.org/graphiql/). 

Since supporting introspection field `"__schema"`, we can now use GraphiQL's Doc Explorer to read the schema documentation:

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

<div id="graphiql" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

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
    document.getElementById('graphiql'),
  );
</script>

### What's next?

I must stil add support for mutations. I have already started work on it, and depending on my time availability, I may be able to finish it in a couple of months. 

### Check it out!

If your project uses [WordPress](https://wordpress.org), you can already use it (the API is CMS-agnostic, so it can also work with Symfony/Laravel/Joomla/Drupal, however adapters for them have not been implemented yet). 

So give [GraphQL by PoP](https://github.com/getpop/graphql) a try, you won't regret it! And let me know how it goes 🙏

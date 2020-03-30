---
title: 🚀 Added @removeIfNull directive to GraphQL by PoP
metaDesc: Implementing unsupported features by GraphQL
socialImage: /images/graphql-by-pop-logo.png
date: '2020-03-30'
tags:
  - pop
  - graphql
  - development
---

Directives allow to implement those features which are not natively-supported by the [GraphQL spec](https://spec.graphql.org/). Then, if any implementor has come up with a compelling way to address a problem, it may be decided to incorporate it into the spec.

Being able to difference between `null` and omissions in the query response is a great example of a feature that can be tackled through directives. When retrieving data through [GraphQL](https://graphql.org), we may sometimes want to remove a field from the response when its value is `null`. However, GraphQL currently [does not support this feature](https://github.com/graphql/graphql-spec/issues/476).

So I decided to implement it as a directive: [`@removeIfNull`](https://github.com/getpop/graphql/blob/e3b8ff918249f8e1218c95f0a5156b9355e1e5ee/src/DirectiveResolvers/RemoveIfNullDirectiveResolver.php). Its code barely occupies a few lines, with this logic:

- Check the value of the field
- If it is `null`, unset it from the object

Tadaaa, that's it! Check it out [here](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(limit%3A2)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20featuredImageOrNothing%3A%20featuredImage%20%40removeIfNull%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20src%0A%20%20%20%20%7D%0A%20%20%20%20featuredImage%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20src%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D):

<div id="graphiql" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

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
        docExplorerOpen: false,
        response: responseText,
        query: "query {\n  posts(limit:2) {\n    id\n    title\n    featuredImageOrNothing: featuredImage @removeIfNull {\n      id\n      src\n    }\n    featuredImage {\n      id\n      src\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql'),
  );
</script>

---
title: 🥳 The PoP API is now a GraphQL server!
metaDesc: A brand-new GraphQL server in PHP is coming to town
socialImage: /images/graphql-logo.png
date: '2020-01-10'
tags:
  - pop
  - api
  - graphql
---

After several months of work, I can announce that my project [GraphQL API for PoP](https://github.com/getpop/api-graphql/) finally provides a spec-compliant implementation of a [GraphQL](https://graphql.org) server in PHP! Yay!!!!!

The missing part, which I finished adding today, was the GraphQL syntax parser. Until today, the PoP API relied on [its own syntax](https://github.com/getpop/field-query) (which is needed to support the engine's broader set of features compared to a standard GraphQL server, such as [composable fields](https://github.com/getpop/api-graphql#composable-fields), [composable directives](https://github.com/getpop/api-graphql#composable-directives), and others). However, I had the realization that this custom syntax is a superset of GraphQL's syntax and, as such, it would not be a problem to support it. After exploring all the [existing GraphQL server implementations in PHP](https://devhub.io/repos/chentsulin-awesome-graphql#lib-php), I took the one [implemented by Youshido](https://github.com/youshido-php/GraphQL) and used their parser, and it works like magic!

<div style="font-size: 100px">
🥳
</div>

### Trying out the new GraphQL server in PHP

Let's play with this brand-new implementation of GraphQL, to make sure it works as expected. For this, I have set-up [this WordPress site](https://newapi.getpop.org), and installed in it the GraphQL API for PoP, available [under this endpoint](https://newapi.getpop.org/api/graphql/). 

The GraphiQL clients below contain queries to demonstrate the [GraphQL features](https://graphql.org/learn/queries/). Click the round button (with alt text "Execute query (Ctrl-Enter)") to execute the query and see the results, and you can also edit the query and the variables and run it again.

Alternatively, you can access the website's own GraphiQL client [here](https://newapi.getpop.org/graphiql/). 

> *Note:* there are no docs and no information hinting yet, because I still need to support field `"__schema"` (see section below).

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

**Fields** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20id%0A%20%20%20%20url%0A%20%20%20%20title%0A%20%20%20%20excerpt%0A%20%20%20%20date%0A%20%20%20%20tags%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-fields" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Field arguments** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(limit%3A2)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20posts(limit%3A3)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20date(format%3A%22d%2Fm%2FY%22)%0A%20%20%20%20%20%20%20%20tags%20%7B%0A%20%20%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20featuredimage%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20src%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-field-arguments" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Aliases** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A2)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20nestedPosts%3A%20posts(limit%3A3)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20formattedDate%3A%20date(format%3A%22d%2Fm%2FY%22)%0A%20%20%20%20%20%20%20%20tags%20%7B%0A%20%20%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20featuredimage%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20src%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7Dhttps://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A2)%20%7B%0A%20%20%20%20...postProperties%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20nestedPosts%3A%20posts(limit%3A3)%20%7B%0A%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20...postProperties%0A%20%20%20%20%20%20%20%20formattedDate%3A%20date(format%3A%22d%2Fm%2FY%22)%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0Afragment%20postProperties%20on%20Post%20%7B%0A%20%20id%0A%20%20title%0A%20%20tags%20%7B%0A%20%20%20%20name%0A%20%20%7D%0A%7D" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-aliases" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Fragments** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A2)%20%7B%0A%20%20%20%20...postProperties%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20nestedPosts%3A%20posts(limit%3A3)%20%7B%0A%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20...postProperties%0A%20%20%20%20%20%20%20%20formattedDate%3A%20date(format%3A%22d%2Fm%2FY%22)%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0Afragment%20postProperties%20on%20Post%20%7B%0A%20%20id%0A%20%20title%0A%20%20tags%20%7B%0A%20%20%20%20name%0A%20%20%7D%0A%7D" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-fragments" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Operation name** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20GetPosts%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A2)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPosts" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-operation-name" style="height: 40vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Variables** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20GetPosts(%24rootLimit%3A%20Int%2C%20%24nestedLimit%3A%20Int%2C%20%24dateFormat%3A%20String)%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A%24rootLimit)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20nestedPosts%3A%20posts(limit%3A%24nestedLimit)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20formattedDate%3A%20date(format%3A%24dateFormat)%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPosts&variables=%7B%0A%20%20%22rootLimit%22%3A%203%2C%0A%20%20%22nestedLimit%22%3A%202%2C%0A%20%20%22dateFormat%22%3A%20%22d%2Fm%2FY%22%0A%7D" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-variables" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Variables inside fragments** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20GetPosts(%24tagsLimit%3A%20Int)%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A2)%20%7B%0A%20%20%20%20...postProperties%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20nestedPosts%3A%20posts(limit%3A3)%20%7B%0A%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20...postProperties%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0Afragment%20postProperties%20on%20Post%20%7B%0A%20%20id%0A%20%20title%0A%20%20tags(limit%3A%24tagsLimit)%20%7B%0A%20%20%20%20name%0A%20%20%7D%0A%7D&operationName=GetPosts&variables=%7B%0A%20%20%22tagsLimit%22%3A%203%0A%7D" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-variables-inside-fragments" style="height: 80vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Default variables** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20GetPosts(%24rootLimit%3A%20Int%20%3D%203%2C%20%24nestedLimit%3A%20Int%20%3D%202%2C%20%24dateFormat%3A%20String%20%3D%20%22d%2Fm%2FY%22)%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A%24rootLimit)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20nestedPosts%3A%20posts(limit%3A%24nestedLimit)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20formattedDate%3A%20date(format%3A%24dateFormat)%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPosts" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-default-variables" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Directives** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20GetPosts(%24includeAuthor%3A%20Boolean!%2C%20%24rootLimit%3A%20Int%20%3D%203%2C%20%24nestedLimit%3A%20Int%20%3D%202)%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A%24rootLimit)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20author%20%40include(if%3A%20%24includeAuthor)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20nestedPosts%3A%20posts(limit%3A%24nestedLimit)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPosts&variables=%7B%0A%20%20%22includeAuthor%22%3A%20true%0A%7D" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-directives" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Fragments with directives** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20GetPosts(%24includeAuthor%3A%20Boolean!%2C%20%24rootLimit%3A%20Int%20%3D%203%2C%20%24nestedLimit%3A%20Int%20%3D%202)%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A%24rootLimit)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20...postProperties%0A%20%20%7D%0A%7D%0Afragment%20postProperties%20on%20Post%20%7B%0A%20%20author%20%40include(if%3A%20%24includeAuthor)%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%20%20nestedPosts%3A%20posts(limit%3A%24nestedLimit)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20date%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPosts&variables=%7B%0A%20%20%22includeAuthor%22%3A%20true%0A%7D" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-fragments-with-directives" style="height: 80vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Inline fragments** (<small>Open in <a href="https://newapi.getpop.org/graphiql/?query=query%20GetPosts(%24rootLimit%3A%20Int%20%3D%203%2C%20%24nestedLimit%3A%20Int%20%3D%202)%20%7B%0A%20%20rootPosts%3A%20posts(limit%3A%24rootLimit)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20content(limit%3A%24nestedLimit)%20%7B%0A%20%20%20%20%20%20%20%20__typename%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20...%20on%20Post%20%7B%0A%20%20%20%20%20%20%20%20%20%20excerpt%0A%20%20%20%20%20%20%20%20%20%20tags%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20...%20on%20Media%20%7B%0A%20%20%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPosts" target="getpop-graphiql">website's GraphiQL client</a></small>)

<div id="graphiql-inline-fragments" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

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
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        query: "query {\n  posts {\n    id\n    url\n    title\n    excerpt\n    date\n    tags {\n      name\n    }\n    comments {\n      content\n      author {\n        id\n        name\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-fields'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        query: "query {\n  posts(limit:2) {\n    id\n    title\n    author {\n      id\n      name\n      posts(limit:3) {\n        id\n        url\n        title\n        date(format:\"d/m/Y\")\n        tags {\n          name\n        }\n        featuredimage {\n          id\n          src\n        }\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-field-arguments'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        query: "query {\n  rootPosts: posts(limit:2) {\n    id\n    title\n    author {\n      id\n      name\n      nestedPosts: posts(limit:3) {\n        id\n        url\n        title\n        date\n        formattedDate: date(format:\"d/m/Y\")\n        tags {\n          name\n        }\n        featuredimage {\n          id\n          src\n        }\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-aliases'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        query: "query {\n  rootPosts: posts(limit:2) {\n    ...postProperties\n    author {\n      id\n      name\n      nestedPosts: posts(limit:3) {\n        url\n        ...postProperties\n        formattedDate: date(format:\"d/m/Y\")\n      }\n    }\n  }\n}\nfragment postProperties on Post {\n  id\n  title\n  tags {\n    name\n  }\n}"
      }
    ),
    document.getElementById('graphiql-fragments'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        query: "query GetPosts {\n  rootPosts: posts(limit:2) {\n    id\n    title\n    author {\n      id\n      name\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-operation-name'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        defaultVariableEditorOpen: true,
        variables: "{\n  \"rootLimit\": 3,\n  \"nestedLimit\": 2,\n  \"dateFormat\": \"d/m/Y\"\n}",
        query: "query GetPosts($rootLimit: Int, $nestedLimit: Int, $dateFormat: String) {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    author {\n      id\n      name\n      nestedPosts: posts(limit:$nestedLimit) {\n        id\n        url\n        title\n        date\n        formattedDate: date(format:$dateFormat)\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-variables'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        defaultVariableEditorOpen: true,
        variables: "{\n  \"tagsLimit\": 3\n}",
        query: "query GetPosts($tagsLimit: Int) {\n  rootPosts: posts(limit:2) {\n    ...postProperties\n    author {\n      id\n      name\n      nestedPosts: posts(limit:3) {\n        url\n        ...postProperties\n      }\n    }\n  }\n}\nfragment postProperties on Post {\n  id\n  title\n  tags(limit:$tagsLimit) {\n    name\n  }\n}"
      }
    ),
    document.getElementById('graphiql-variables-inside-fragments'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        defaultVariableEditorOpen: true,
        query: "query GetPosts($rootLimit: Int = 3, $nestedLimit: Int = 2, $dateFormat: String = \"d/m/Y\") {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    author {\n      id\n      name\n      nestedPosts: posts(limit:$nestedLimit) {\n        id\n        url\n        title\n        date\n        formattedDate: date(format:$dateFormat)\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-default-variables'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        defaultVariableEditorOpen: true,
        variables: "{\n  \"includeAuthor\": true\n}",
        query: "query GetPosts($includeAuthor: Boolean!, $rootLimit: Int = 3, $nestedLimit: Int = 2) {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    author @include(if: $includeAuthor) {\n      id\n      name\n      nestedPosts: posts(limit:$nestedLimit) {\n        id\n        url\n        title\n        date\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-directives'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        defaultVariableEditorOpen: true,
        variables: "{\n  \"includeAuthor\": true\n}",
        query: "query GetPosts($includeAuthor: Boolean!, $rootLimit: Int = 3, $nestedLimit: Int = 2) {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    ...postProperties\n  }\n}\nfragment postProperties on Post {\n  author @include(if: $includeAuthor) {\n    id\n    name\n    nestedPosts: posts(limit:$nestedLimit) {\n      id\n      url\n      title\n      date\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-fragments-with-directives'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: responseText,
        query: "query GetPosts($rootLimit: Int = 3, $nestedLimit: Int = 2) {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    author {\n      id\n      name\n      content(limit:$nestedLimit) {\n        __typename\n        title\n        ... on Post {\n          excerpt\n          tags {\n            name\n          }\n        }\n        ... on Media {\n          url\n        }\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-inline-fragments'),
  );
</script>

### Adding 100% compliance to the GraphQL spec

100% compliance of the [GraphQL spec](https://graphql.github.io/graphql-spec/draft/) is almost there. The remaining items to implement are: 

1. Satisfying the `"__schema"` field
2. Adding support for mutations

I'm already working on the first item, I expect it to be finished in a few days. Concerning the second item, I have already started work on it, depending on my time availability I may be able to finish it in a couple of months. 

### Support for REST too

Bonus feature: From a unique source code, the API also supports REST! Check out these example links:

- [List of posts](https://newapi.getpop.org/posts/api/rest/)
- [Single post](https://newapi.getpop.org/posts/cope-with-wordpress-post-demo-containing-plenty-of-blocks/api/rest/)

### Are you using WordPress? Do you need a good API? Try this one out!

Currently, WordPress users have two API alternatives:

1. REST, through the WP REST API which is already included in core
2. GraphQL, through [WPGraphQL](https://www.wpgraphql.com/)

Now, I want to add a third alternative:

3. Both GraphQL and REST, through [GraphQL API for PoP](https://github.com/getpop/api-graphql)

Please check it out, it will make your life easier. I promise. And let me know how it goes.


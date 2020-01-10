---
title: 🥳 The PoP API is now a GraphQL server!
metaDesc: A brand-new GraphQL server in PHP is coming to town
socialImage: https://leoloso.com/images/graphql-logo.png
date: '2021-01-10'
tags:
  - pop
  - api
  - graphql
---

After several months of work, I can announce that my project [GraphQL API for PoP](https://github.com/getpop/api-graphql/) finally provides a spec-compliant implementation of a [GraphQL](https://graphql.org) server in PHP!

Yay!!!!!

The missing part, which I finished adding today, was the GraphQL syntax parser. Until today, the PoP API relied on [its own syntax](https://github.com/getpop/field-query) (which is needed to support the engine's broader set of features compared to a standard GraphQL server, such as [nested fields](https://github.com/getpop/api-graphql#nested-fields), [nested directives](https://github.com/getpop/api-graphql#nested-directives), and others). However, I had the realization that this custom syntax is a superset of GraphQL's syntax and, as such, it would not be a problem to support it. After exploring all the [existing GraphQL server implementations in PHP](https://devhub.io/repos/chentsulin-awesome-graphql#lib-php), I took the one [implemented by Youshido](https://github.com/youshido-php/GraphQL) and used their parser, and it works like magic!

<div style="font-size: 100px">
🥳
</div>

### Trying out the new GraphQL server in PHP

Let's play with this brand-new implementation of GraphQL, to make sure it works as expected.

I have set-up [this WordPress site](https://newapi.getpop.org), and installed in it the GraphQL API for PoP, available [under this endpoint](https://newapi.getpop.org/api/graphql/). The GraphiQL clients below contain queries to demonstrate the [GraphQL features](https://graphql.org/learn/queries/). To execute the query and see the results, press on the round button (with alt text "Execute query (Ctrl-Enter)"). 

Alternatively, you can access the GraphiQL client under [https://newapi.getpop.org/graphiql/](https://newapi.getpop.org/graphiql/). 

> *Note:* there are no docs and no information hinting yet, because I still need to support field `"__schema"` (see section below).

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

#### Fields

<div id="graphiql-nested-field" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Field arguments

<div id="graphiql-field-arguments" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Aliases

<div id="graphiql-aliases" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Fragments

<div id="graphiql-fragments" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Operation name

<div id="graphiql-operation-name" style="height: 40vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Variables

<div id="graphiql-variables" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Variables inside fragments

<div id="graphiql-variables-inside-fragments" style="height: 80vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Default variables

<div id="graphiql-default-variables" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Directives

<div id="graphiql-directives" style="height: 75vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Fragments with directives

<div id="graphiql-fragments-with-directives" style="height: 80vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

#### Inline fragments

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
  const response = "Click the \"Execute Query\" button";
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
        response: response,
        query: "query {\n  posts {\n    id\n    url\n    title\n    excerpt\n    date\n    tags {\n      name\n    }\n    comments {\n      content\n      author {\n        id\n        name\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-nested-field'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: response,
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
        response: response,
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
        response: response,
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
        response: response,
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
        response: response,
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
        response: response,
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
        response: response,
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
        response: response,
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
        response: response,
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
        response: response,
        query: "query GetPosts($rootLimit: Int = 3, $nestedLimit: Int = 2) {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    author {\n      id\n      name\n      content(limit:$nestedLimit) {\n        title\n        ... on Post {\n          excerpt\n          tags {\n            name\n          }\n        }\n        ... on Media {\n          url\n        }\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-inline-fragments'),
  );
</script>

### Adding 100% compliance to the GraphQL spec

100% compliance of the [GraphQL spec](https://graphql.github.io/graphql-spec/draft/) is almost there. The only remaining items are: 

1. Satisfying the `"__schema"` field
2. Adding support mutations

The first item, I'm already working on that, it should be finished in a few days. The second item, I have already started work on it, hopefully it will be finished in a couple of months. 
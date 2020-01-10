---
title: 🥳 The PoP API is now a GraphQL server!
metaDesc: A new GraphQL server in PHP is born
socialImage: https://leoloso.com/images/graphql-logo.png
date: '2021-01-10'
tags:
  - pop
  - api
  - graphql
---

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

**Field:**

<div id="graphiql-field" style="height: 25vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Nested fields:**

<div id="graphiql-nested-field" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Field arguments:**

<div id="graphiql-field-arguments" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Aliases:**

<div id="graphiql-aliases" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Fragments:**

<div id="graphiql-fragments" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Operation name:**

<div id="graphiql-operation-name" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Variables:**

<div id="graphiql-variables" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Variables inside fragments:**

<div id="graphiql-variables-inside-fragments" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Default variables:**

<div id="graphiql-default-variables" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Directives:**

<div id="graphiql-directives" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Fragments with directives:**

<div id="graphiql-fragments-with-directives" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Inline fragments:**

<div id="graphiql-inline-fragments" style="height: 90vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

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
        query: "query {\n  time\n}"
      }
    ),
    document.getElementById('graphiql-field'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        schema: null,
        defaultVariableEditorOpen: false,
        response: response,
        query: "query {\n  posts {\n    id\n    title\n    __typename\n    author {\n      id\n      name\n      __typename\n      posts {\n        id\n        url\n        title\n        __typename\n        date\n        tags {\n          name\n          __typename\n        }\n        featuredimage {\n          id\n          src\n          __typename\n        }\n      }\n    }\n  }\n}"
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
        query: "query {\n  posts(limit:2) {\n    id\n    title\n    __typename\n    author {\n      id\n      name\n      __typename\n      posts(limit:3) {\n        id\n        url\n        title\n        __typename\n        date(format:\"d/m/Y\")\n        tags {\n          name\n          __typename\n        }\n        featuredimage {\n          id\n          src\n          __typename\n        }\n      }\n    }\n  }\n}"
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
        query: "query {\n  rootPosts: posts(limit:2) {\n    id\n    title\n    __typename\n    author {\n      id\n      name\n      __typename\n      nestedPosts: posts(limit:3) {\n        id\n        url\n        title\n        __typename\n        date\n        formattedDate: date(format:\"d/m/Y\")\n        tags {\n          name\n          __typename\n        }\n        featuredimage {\n          id\n          src\n          __typename\n        }\n      }\n    }\n  }\n}"
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
        query: "query {\n  rootPosts: posts(limit:2) {\n    ...postProperties\n    author {\n      id\n      name\n      __typename\n      nestedPosts: posts(limit:3) {\n        url\n        ...postProperties\n        formattedDate: date(format:\"d/m/Y\")\n        featuredimage {\n          id\n          src\n          __typename\n        }\n      }\n    }\n  }\n}\nfragment postProperties on Post {\n  id\n  title\n  __typename\n  tags {\n    name\n    __typename\n  }\n}"
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
        query: "query GetPosts {\n  rootPosts: posts(limit:2) {\n    id\n    title\n    __typename\n    author {\n      id\n      name\n      __typename\n      nestedPosts: posts(limit:3) {\n        id\n        url\n        title\n        __typename\n        date\n        formattedDate: date(format:\"d/m/Y\")\n        tags {\n          name\n          __typename\n        }\n        featuredimage {\n          id\n          src\n          __typename\n        }\n      }\n    }\n  }\n}"
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
        query: "query GetPosts($rootLimit: Int, $nestedLimit: Int, $dateFormat: String) {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    __typename\n    author {\n      id\n      name\n      __typename\n      nestedPosts: posts(limit:$nestedLimit) {\n        id\n        url\n        title\n        __typename\n        date\n        formattedDate: date(format:$dateFormat)\n        tags {\n          name\n          __typename\n        }\n        featuredimage {\n          id\n          src\n          __typename\n        }\n      }\n    }\n  }\n}"
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
        query: "query GetPosts($tagsLimit: Int) {\n  rootPosts: posts(limit:2) {\n    ...postProperties\n    author {\n      id\n      name\n      __typename\n      nestedPosts: posts(limit:3) {\n        url\n        ...postProperties\n      }\n    }\n  }\n}\nfragment postProperties on Post {\n  id\n  title\n  __typename\n  tags(limit:$tagsLimit) {\n    name\n    __typename\n  }\n}"
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
        query: "query GetPosts($rootLimit: Int = 3, $nestedLimit: Int = 2, $dateFormat: String = \"d/m/Y\") {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    __typename\n    author {\n      id\n      name\n      __typename\n      nestedPosts: posts(limit:$nestedLimit) {\n        id\n        url\n        title\n        __typename\n        date\n        formattedDate: date(format:$dateFormat)\n        tags {\n          name\n          __typename\n        }\n        featuredimage {\n          id\n          src\n          __typename\n        }\n      }\n    }\n  }\n}"
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
        query: "query GetPosts($includeAuthor: Boolean!, $rootLimit: Int = 3, $nestedLimit: Int = 2, $dateFormat: String = \"d/m/Y\") {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    __typename\n    author @include(if: $includeAuthor) {\n      id\n      name\n      __typename\n      nestedPosts: posts(limit:$nestedLimit) {\n        id\n        url\n        title\n        __typename\n        date\n        formattedDate: date(format:$dateFormat)\n        tags {\n          name\n          __typename\n        }\n        featuredimage {\n          id\n          src\n          __typename\n        }\n      }\n    }\n  }\n}"
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
        query: "query GetPosts($includeAuthor: Boolean!, $rootLimit: Int = 3, $nestedLimit: Int = 2, $dateFormat: String = \"d/m/Y\") {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    ...postProperties\n  }\n}\nfragment postProperties on Post {\n  __typename\n  author @include(if: $includeAuthor) {\n    id\n    name\n    __typename\n    nestedPosts: posts(limit:$nestedLimit) {\n      id\n      url\n      title\n      __typename\n      date\n      formattedDate: date(format:$dateFormat)\n      tags {\n        name\n        __typename\n      }\n      featuredimage {\n        id\n        src\n        __typename\n      }\n    }\n  }\n}"
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
        query: "query GetPosts($rootLimit: Int = 3, $nestedLimit: Int = 2) {\n  rootPosts: posts(limit:$rootLimit) {\n    id\n    title\n    __typename\n    author {\n      id\n      name\n      __typename\n      content(limit:$nestedLimit) {\n        title\n        ... on Post {\n          excerpt\n          featuredimage {\n            id\n            src\n          }\n        }\n        ... on Media {\n          url\n        }\n      }\n    }\n  }\n}"
      }
    ),
    document.getElementById('graphiql-inline-fragments'),
  );
</script>
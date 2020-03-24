---
title: 💯 GraphQL by PoP now supports field/directive-based versioning
metaDesc: My GraphQL server just got another lovely new feature
socialImage: /images/graphql-by-pop-logo.png
date: '2020-03-24'
tags:
  - pop
  - graphql
  - development
---

I just added support for another lovely new feature in [GraphQL by PoP](https://graphql-by-pop.com): the ability to independently version fields and directives, which can then be selected in the query through field/directive arguments. It is similar to how REST supports versioning, but extremely fine grained: instead of versioning the whole API, or the endpoint, what is versioned is a single field or directive, and a query can involve different versions for different fields.

Versioning the schema this way solves a basic problem produced by the [evolution strategy](https://graphql.org/learn/best-practices/#versioning) adopted by GraphQL: when deprecating a field, as to replace it with a newer implementation, the new field will need to have a new field name. Then, if the deprecated field cannot be removed (eg: because some clients are still accessing it, from queries that were never revised), then these fields tend to accumulate, making the schema have different fields for a same functionality, most of them already outdated, and the new, latest implementation of the field not able to have the original field name, indeed polluting the schema and making it not as lean as it should be.

## Querying

Let's see it in action. In this query, field `userServiceURLs` has 2 versions, `0.1.0` and `0.2.0`, and we can choose one or the other through field argument `versionConstraint`:

<div id="graphiql-1st" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

Please notice that the name of the argument is not `version` by `versionConstraint`: we can pass rules to select the version, following the [semantic versioning rules used by Composer](https://getcomposer.org/doc/articles/versions.md#writing-version-constraints):

<div id="graphiql-2nd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

It works for directives too:

<div id="graphiql-5th" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

## Strategies for versioning

What happens if we do not pass the `versionConstraint`? This depends on the implementation of the API, which can choose what strategy to follow:

**Use the old version by default, until a certain date in which the new version becomes the default:**

Keep using the old version until a certain date, in which the new version will become the default one to use; while in this transition period, ask the developers to explicitly add a version constraint to the old version before that date, through a new `warning` entry in the query:

<div id="graphiql-3rd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

**Use the latest version, and encourage the users to explicitly state which version to use:**

Use the latest version of the field whenever the `versionConstraint` is not set, and encourage the users to explicitly define which version must be used, showing the list of all available versions for that field through a new `warning` entry:

<div id="graphiql-4th" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

## Choosing the version for all fields in the query

Adding the `versionConstraint` parameter in the GraphQL endpoint itself (set in the [GraphQL client below](https://newapi.getpop.org/graphiql/?versionConstraint=^0.1) as `/api/endpoint/?versionConstraint=^0.1`) will implicitly define that version constraint in all fields:

<div id="graphiql-6th" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

Any field can still override this default value with its own `versionConstraint`:

<div id="graphiql-7th" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

## Visualizing the schema for some version

We can also add the `versionConstraint` parameter in the GraphQL Voyager to visualize the schema for a specific version. For instance, [in the default schema](https://newapi.getpop.org/graphql-interactive/):

![GraphQL default interactive schema](/images/versioning-field-voyager.jpg)

...field `userServiceURLs` has the following signature, which corresponds to version `0.1.0`:

![Field description for version 0.1.0](/images/versioning-field-version-010.png)

However, when [adding `?versionConstraint=^0.2` to the URL](https://newapi.getpop.org/graphql-interactive/?versionConstraint=^0.2) (which in turn sets this parameter on the endpoint), we can visualize the schema for that version constraint. Then, field `userServiceURLs` has this different signature, corresponding to version `0.2.0`:

![Field description for version 0.2.0](/images/versioning-field-version-020.png)

Please also notice that I have added the field's version as part of the field's description; that is because, currently, GraphQL doesn't feature a version attribute queryable through introspection.

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
  const responseText = "Click the \"Execute Query\" button";
  const endpointGraphQLFetcher = (endpoint, graphQLParams) =>
    fetch(endpoint, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    })
      .then(response => response.json())
      .catch(() => response.text());

  const apiURL = 'https://newapi.getpop.org/api/graphql/';
  const graphQLFetcher = graphQLParams => endpointGraphQLFetcher(apiURL, graphQLParams);

  const versionedAPIURL = `${ apiURL }?versionConstraint=^0.1`;
  const versionedGraphQLFetcher = graphQLParams => endpointGraphQLFetcher(versionedAPIURL, graphQLParams);

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: "query {\n  olderVersion:userServiceURLs(versionConstraint:\"0.1.0\")\n  newerVersion:userServiceURLs(versionConstraint:\"0.2.0\")\n}"
      }
    ),
    document.getElementById('graphiql-1st'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: "query {\n  #This will produce version 0.1.0\n  firstVersion:userServiceURLs(versionConstraint:\"^0.1\")\n  # This will produce version 0.2.0\n  secondVersion:userServiceURLs(versionConstraint:\">0.1\")\n  # This will produce version 0.2.0\n  thirdVersion:userServiceURLs(versionConstraint:\"^0.2\")\n}"
      }
    ),
    document.getElementById('graphiql-2nd'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: "query {\n  #This will produce version 0.1.0, and warn the users\n  #to explicitly set a version on the query\n  userServiceURLs\n}"
      }
    ),
    document.getElementById('graphiql-3rd'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: "query {\n  #This will produce version 0.2.0 and show\n  #all available versions to the users\n  userServiceData\n}"
      }
    ),
    document.getElementById('graphiql-4th'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: "query {\n  post(id:1) {\n    titleCase:title@makeTitle(versionConstraint:\"^0.1\")\n    upperCase:title@makeTitle(versionConstraint:\"^0.2\")\n  }\n}"
      }
    ),
    document.getElementById('graphiql-5th'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: versionedGraphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: "query {\n  #This will produce version 0.1.0\n  userServiceURLs\n}"
      }
    ),
    document.getElementById('graphiql-6th'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: versionedGraphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: "query {\n  #This will produce version 0.1.0\n  implicitVersion: userServiceURLs\n  #This will produce version 0.2.0\n  explicitVersion: userServiceURLs(versionConstraint:\"^0.2\")\n}"
      }
    ),
    document.getElementById('graphiql-7th'),
  );
</script>

---
title: ⚙️ Mandatory directives for fields/directives in GraphQL by PoP
metaDesc: My GraphQL server just got a lovely new feature
socialImage: /images/graphql-by-pop-logo.jpg
date: '2020-03-03'
tags:
  - pop
  - graphql
  - development
---

I just added support for a lovely new feature in [GraphQL by PoP](https://graphql-by-pop.com): the ability to execute mandatory directives whenever a specific field or directive is present in the GraphQL query. This means that the GraphQL engine will: 

- Whenever a specific field from some type is present in the query, add a certain directive (or directives) to be executed on the field
- Whenever a specific directive is invoked, execute another directive (or directives) before it

A mandatory directive can, itself, have its own set of mandatory directives which are also added to the directive chain up.

This feature is extremely powerful, since it allows to easily configure what directives are added to the query under what circumstances, as to implement any IFTTT strategy. It supports adding the following capabilities to our GraphQL API:

**Define the cache control max-age a field by field basis** 

Attach a [`@CacheControl`](https://github.com/getpop/cache-control/blob/fd4d45c0ad939d4ba8510c895d3d2050d318dfae/src/DirectiveResolvers/AbstractCacheControlDirectiveResolver.php) directive to all fields, customizing the value of the `maxAge` parameter: 1 year for the `Post`'s field `url`, and 1 hour for field `title`.

**Set-up access control** 

Attach a [`@validateDoesLoggedInUserHaveAnyRole`](https://github.com/getpop/user-roles-access-control/blob/4570612cd228719b9447bba022cb13f3377dfd41/src/DirectiveResolvers/ValidateDoesLoggedInUserHaveAnyRoleDirectiveResolver.php) directive to field `email` from the `User` type, so only the admins can query the user email.

**Synchronize access-control with cache-control**

By chaining up directives, we can make sure that, whenever validating if the user can access a field/directive, the response will not be cached. For instance:

- Attach directive `@validateIsUserLoggedIn` to field [`me`](https://github.com/getpop/user-state/blob/5731dced0f645c9ca6d631b3ea21794655653539/src/FieldResolvers/MeFieldResolverTrait.php)
- Attach directive `@CacheControl` with `maxAge` argument value of `0` to directive `@validateIsUserLoggedIn`.

**Beef up security** 

Attach a [`@validateIsUserLoggedIn`](https://github.com/getpop/user-state-access-control/blob/9b33e16da8d575a3da9017caa97b6f417b688fc2/src/DirectiveResolvers/ValidateIsUserLoggedInDirectiveResolver.php) directive to directive [`@translate`](https://github.com/getpop/google-translate-directive/blob/4f3efa0af5713aafdefbd428a74944d102ab0871/src/DirectiveResolvers/AbstractGoogleTranslateDirectiveResolver.php), to avoid malicious actors executing queries against the GraphQL service that can bring the server down and spike its bills (in this case, `@translate` is based on Google Translate and it pays a fee to use this service)

### Demostration

In [this schema](https://newapi.getpop.org/graphql-interactive/), the `User` type has fields `roles` and `capabilities`, which I consider to be sensitive information, so it should not be accessible by the random user.

Then, I created package [Access Control List for User Roles](https://github.com/getpop/user-roles-acl) to attach directive `@validateDoesLoggedInUserHaveAnyRole` to these two fields, configured to validate that only a user with a given role can access them ([code here](https://github.com/getpop/user-roles-acl/blob/b0c57c185b6db06af45b81d388c55d6a1dceb22f/src/Config/ServiceConfiguration.php#L22)):

```php
if ($roles = Environment::anyRoleLoggedInUserMustHaveToAccessRolesFields()) {
  ContainerBuilderUtils::injectValuesIntoService(
    'access_control_manager',
    'addEntriesForFields',
    UserRolesAccessControlGroups::ROLES,
    [
      [RootTypeResolver::class, 'roles', $roles],
      [RootTypeResolver::class, 'capabilities', $roles],
      [UserTypeResolver::class, 'roles', $roles],
      [UserTypeResolver::class, 'capabilities', $roles],
    ]
  );
}
```

When executing the query, dear reader, you won't be allowed to access those fields, since you are not logged in (which is validated before checking if the user has the required role):

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
        docExplorerOpen: false,
        response: responseText,
        query: "query {\n  user(id:1) {\n    name\n    capabilities\n    roles {\n      name\n    }\n  }\n}",
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql'),
  );
</script>
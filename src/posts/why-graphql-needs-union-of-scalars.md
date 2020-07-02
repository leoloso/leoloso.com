---
title: 🤔 Why GraphQL needs to support the union of scalars
metaDesc: Avoiding mismatching types in an elegant way
socialImage: /images/type-errors-zoom.png
date: '2020-07-02'
tags:
  - graphql
---

In my latest article on LogRocket, [Creating an @export GraphQL directive](https://blog.logrocket.com/creating-an-export-graphql-directive/), I showed the screenshot of a GraphiQL client with red lines over the query argument definitions, which indicate there is an issue going on:

![GraphiQL client with issues](/images/type-errors.png "GraphiQL client with issues")

Why is this happening? For the demonstration for my article, I have needed to print the value of the dynamic variable in the response, as to visualize that it works well. For that, I created a field [`echoVar`](https://github.com/GraphQLByPoP/graphql/blob/9d2f983b8374222cda6e4eb87de0e268ccf6f7b0/src/FieldResolvers/ConditionalOnEnvironment/VariablesAsExpressions/VariablesAsExpressionsRootFieldResolver.php), which simply echoes back the value contained in the variable.

Since the type of the values may not be known in advance (it could be a `String`, `Int`, any custom scalar, an object, or anything else), the type of `echoVar` is a generic `Mixed` type, to which all types can be "identified" with.

The consequence of using `Mixed` is that there will be a mismatch [when loading the query in the GraphiQL client](https://newapi.getpop.org/graphiql/?query=query%20GetSomeData(%0A%20%20%24_firstPostTitle%3A%20String%20%3D%20%22%22%2C%0A%20%20%24_postTitles%3A%20%5BString%5D%20%3D%20%5B%5D%2C%0A%20%20%24_firstPostData%3A%20Mixed%20%3D%20%7B%7D%2C%0A%20%20%24_postData%3A%20%5BMixed%5D%20%3D%20%5B%5D%0A)%20%7B%0A%20%20post(id%3A1)%20%7B%0A%20%20%20%20title%20%40export(as%3A%22_firstPostTitle%22)%0A%20%20%20%20title%20%40export(as%3A%22_firstPostData%22)%0A%20%20%20%20date%20%40export(as%3A%22_firstPostData%22)%0A%20%20%7D%0A%20%20posts(limit%3A2)%20%7B%0A%20%20%20%20title%20%40export(as%3A%22_postTitles%22)%0A%20%20%20%20title%20%40export(as%3A%22_postData%22)%0A%20%20%20%20date%20%40export(as%3A%22_postData%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20_firstPostTitle%3A%20echoVar(variable%3A%20%24_firstPostTitle)%0A%20%20%20%20_postTitles%3A%20echoVar(variable%3A%20%24_postTitles)%0A%20%20%20%20_firstPostData%3A%20echoVar(variable%3A%20%24_firstPostData)%0A%20%20%20%20_postData%3A%20echoVar(variable%3A%20%24_postData)%0A%20%20%7D%0A%7D&operationName=GetSomeData), showing a red line in the argument definitions and an error when hovering over them:

![Type mismatch error shown by GraphiQL](/images/type-errors-zoom.png)

I am not so troubled with this issue, because field `echoVar` is not actually needed: it was just used to see that `@export` behaves as expected. However, it is still annoying to see those red lines. 

The solution currently supported by GraphQL is extremely verbose and unmaintainable: to create different `echoVar` functions for each type (`echoStringVar`, `echoIntVar`, etc). This issue should be solved in an elegant way, avoiding the verbosity from having to declare a different field per type of response.

The [GraphQL spec issue](https://github.com/graphql/graphql-spec/issues/583#issue-442887842) linked to in my article mentions that we could provide `@export` with an additional argument `type`, but this is potentially useful only for deducing the type of the object in the GraphQL server. The hack, though, deals with the type of the object in the query, on the client. 

So, how to solve this issue? There are 3 possible approaches to it. All 3 are currently unsupported by GraphQL, but this situation could change in the foreseeable future.

## 1. Make all scalar types implement a `Serializable` interface

The trait in common among all [scalar types](https://graphql.org/learn/schema/#scalar-types) (`Int`, `Float`, `Boolean`, `String` and `ID`, and all custom scalar types) is that [they are serializable](https://www.graphql.de/blog/scalars-in-depth/). Hence, if they implemented a `Serializable` [interface](https://graphql.org/learn/schema/#interfaces), we could have field `echoVar` return this interface, and it would be satisfied not matter which actual type it returns.

However, this doesn't work, because the spec says that an [interface must include at least one field](https://spec.graphql.org/draft/#sec-Interfaces.Type-Validation), but scalar types cannot resolve fields (that's only doable by the `Object` type). Then, unless the spec is modified, scalar types cannot implement interfaces.

## 2. Support the `Any` scalar type

The `Mixed` type I have use to represent any scalar type could be a type all by itself, a kind of wildcard type that says: I represent anything.

This use case is already being dealt with, through [this pull request](https://github.com/graphql/graphql-spec/pull/325), proposing to add the `Any` type. However, this pull request is 3 years-old, and doesn't seem to have much activity, so I don't hold my breath about it.

## 3. Allow fields to return unions of scalar types

Even though currently [only object types can be part of union types](https://spec.graphql.org/draft/#sec-Unions), there is a proposal to also [support the union of scalar types](https://github.com/graphql/graphql-spec/issues/215).

With this solution, field `echoVar` could be declared to return `Int | Float | Boolean | String | ID`, and so all of these cases would be covered.

This is the solution that seems most promising of all 3. The issue has had recent activity, is directly related to the [GraphQL Input Union](https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md) proposal, which is currently being worked upon by the GraphQL Working Group, and there is [a champion working on it](https://github.com/graphql/graphql-spec/issues/215#issuecomment-612413152).

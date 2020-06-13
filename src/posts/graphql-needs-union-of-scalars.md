---
title: 🤔 Why GraphQL needs to support union of scalars
metaDesc: Mismatching types cannot be avoided
socialImage: /images/type-errors.png
date: '2021-06-13'
tags:
  - graphql
---

In latest article on LogRocket, [Creating an @export GraphQL directive](...), blablabla

Variables are normally used as inputs. For this demonstration, I have needed to print the value of the dynamic variable in the response, as to visualize that it works well. For that, I created a field [`echoVar`](https://github.com/GraphQLByPoP/graphql/blob/9d2f983b8374222cda6e4eb87de0e268ccf6f7b0/src/FieldResolvers/ConditionalOnEnvironment/VariablesAsExpressions/VariablesAsExpressionsRootFieldResolver.php), which simply echoes back the value contained in the variable.

Since we don't know in advance the type of the values (it could be a `String`, `Int`, any custom scalar, an object, or anything else), the type of `echoVar` is a generic `Mixed` type, to which all types can be "identified" with. This is a hack which, I believe, is preferable over its solution: to create different `echoVar` functions for each type (`echoString`, `echoInt`, etc), which I find it extremely verbose and unmaintainable.

The consequence of using `Mixed` is that there will be a mismatch in the [GraphiQL client](https://newapi.getpop.org/graphiql/?query=query%20GetSomeData(%0A%20%20%24_firstPostTitle%3A%20String%20%3D%20%22%22%2C%0A%20%20%24_postTitles%3A%20%5BString%5D%20%3D%20%5B%5D%2C%0A%20%20%24_firstPostData%3A%20Mixed%20%3D%20%7B%7D%2C%0A%20%20%24_postData%3A%20%5BMixed%5D%20%3D%20%5B%5D%0A)%20%7B%0A%20%20post(id%3A1)%20%7B%0A%20%20%20%20title%20%40export(as%3A%22_firstPostTitle%22)%0A%20%20%20%20title%20%40export(as%3A%22_firstPostData%22)%0A%20%20%20%20date%20%40export(as%3A%22_firstPostData%22)%0A%20%20%7D%0A%20%20posts(limit%3A2)%20%7B%0A%20%20%20%20title%20%40export(as%3A%22_postTitles%22)%0A%20%20%20%20title%20%40export(as%3A%22_postData%22)%0A%20%20%20%20date%20%40export(as%3A%22_postData%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20_firstPostTitle%3A%20echoVar(variable%3A%20%24_firstPostTitle)%0A%20%20%20%20_postTitles%3A%20echoVar(variable%3A%20%24_postTitles)%0A%20%20%20%20_firstPostData%3A%20echoVar(variable%3A%20%24_firstPostData)%0A%20%20%20%20_postData%3A%20echoVar(variable%3A%20%24_postData)%0A%20%20%7D%0A%7D&operationName=GetSomeData), showing a red line in the argument definitions and an error when hovering over them:

![Type mismatch error shown by GraphiQL](/images/type-errors.png)

The [original issue](https://github.com/graphql/graphql-spec/issues/583#issue-442887842) mentions that we could provide `@export` with an additional argument `type`, but this is potentially useful only for deducing the type of the object in the GraphQL server. The hack, though, deals with the type of the object in the query, on the client. 

I am not so troubled with this issue though, because field `echoVar` is not actually needed: it was just used to see that `@export` behaves as expected.
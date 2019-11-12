---
title: 😁 Demonstrating the PoP API, an implementation of GraphQL on steroids
metaDesc: After you've seen this, there's no turning back
socialImage: https://leoloso.com/images/pop-logo-whitebg.png
date: '2020-11-12'
tags:
  - pop
  - api
  - graphql
---

I have recently introduced the [PoP API for GraphQL](https://github.com/getpop/api-graphql), which I call a [“schemaless” implementation of GraphQL](/posts/intro-to-schemaless-graphql-api-for-pop/), and then [described some of its advantages](/posts/bettering-graphql-through-components/) over a typical implementation of [GraphQL](https://graphql.org). In this blog post, I will demonstrate some of its superpowers by implementing a slightly-complex yet very standard use case. Along the way, I will explain how it works.

### Use case to implement

You want to create an automated email-sending service to distribute your blog posts. All the data comes from 3 separate sources:

1. A REST API endpoint returning the subscribers (pairs of `email` and `language` fields) to the newsletter, provided by Mailchimp.
2. A REST API endpoint with all your customer information, including their `email` and `name` fields, provided by company's CRM.
3. The blog posts published in your website.

The email needs to be customized for each person:

1. Greeting them personally by name
2. Translating the content of the email to their own language. Using Google Translate is acceptable.

The service needs to be flexible, allowing to select the post(s) to send:

1. By providing the ID of the post
2. By providing a query to select the post, such as "latest published one"

The service will be accessed by 2 different kinds of stakeholders: 

1. Company employees, to be granted unrestricted access to all features
2. Company contractors, to be granted restricted access to certain features

Your requirements change over time, so the service will ocassionally need to implement new features. However, you do not have the budget to employ a permanent back-end developer to maintain the service in the long-term. Hence, adding new features to the service must not involve custom code (eg: providing new fields into the API).

Finally, the team members implementing the service work remotely and from different timezones, so you need to minimize their need for interaction.

### Steps to follow

Our service will follow the following steps:

1. Fetch the list of newsletter subscribers using the first API endpoint, getting their `email` and `language` fields
2. For every recipient in this list add the `name` field, fetching it from the second API endpoint by using the common `email` field as ID. 

By now, we will have the all the user data consolidated in a single list, containing fields `name`, `email` and `language`. Let's continue.

3. Retrieve the data for the specified blog post: `content` and `date`
4. Calculate all the different languages that the post needs be translated to
5. Translate the post to each language

By now, in addition to the user data, we will also have the post data, translated to all required languages. Next, we need to craft the customized email content for each user.

6. Iterate the list of users, and for each add a new field `emailContent` containing:
  a. The greeting message "Hi {name}, this is our our blog post from {date}", translated to the user's language
  b. The blog post content that had been translated to the user's language

By now, we have all the data: Rows of `email` and `emailContent` fields. We can finally send the email.

7. Iterate the list, and send the email

### Before starting: Let's explore some core concepts

Before we start the implementation of the use case, I will explain a few concepts particular to PoP.

#### URL-based queries

While the standard GraphQL sends the query contained in the body of the request, PoP sends it as a URL parameter. This has the following advantages:

- It enables server-side caching
- It removes the need for a client-side library to manipulate the query, leading to performance improvements and reduced amount of code to maintain
- The API becomes easier to consume. For instance, we can visualize the results of the query directly on the browser, without depending on GraphiQL

```php
?query=...
```

#### Similar but different query syntax

The syntax used in PoP is a re-imagining of the GraphQL syntax, supporting all the required elements (field names, arguments, variables, aliases, fragments and directives), however designed to be easy to both read and write in a single line, so the developer can already code the query in the browser without depending on special tooling.

It looks like this:

```php
?query=query1,query2,query3&variable1=value&fragment1=fragmentQuery
```

Each query has this shape:

```php
fieldName(fieldArgs)@alias<fieldDirective(directiveArgs)>
```

To make it clear to visualize, the query can be split into several lines:

```php
fieldName(
  fieldArgs
)@alias<
  fieldDirective(
    directiveArgs
  )
>
```

> **Note 1:**<br/>Firefox already handles the multi-line query: Copy/pasting it into the URL bar works perfectly. Chrome and Safari, though, require to strip all the whitespaces and line returns before pasting the query into the URL bar.
> 
> (Conclusion: use Firefox!)

> **Note 2:**<br/>
> The syntax is described in detail in [its GitHub repo](https://github.com/getpop/field-query). I will keep explaining how it works below, while implementing the use case.

#### Operators

Standard operations, such as `not`, `or`, `and`, `if`, `equals`, `isNull`, `sprintf` and many others, are supported as fields:

```php
1. ?query=not(true)
2. ?query=or([true, false])
3. ?query=and([true, false])
4. ?query=if(true, Show this text, Hide this text)
5. ?query=equals(first text, second text)
6. ?query=isNull(),isNull(something)
7. ?query=sprintf(%s API is %s, [PoP, cool])
```

[View query results: <a href="https://nextapi.getpop.org/api/graphql?query=not(true)">query #1</a>, <a href="https://nextapi.getpop.org/api/graphql?query=or([true,false])">query #2</a>, <a href="https://nextapi.getpop.org/api/graphql?query=and([true,false])">query #3</a>, <a href="https://nextapi.getpop.org/api/graphql?query=if(true,Show this text,Hide this text)">query #4</a>, <a href="https://nextapi.getpop.org/api/graphql?query=equals(first text, second text)">query #5</a>, <a href="https://nextapi.getpop.org/api/graphql?query=isNull(),isNull(something)">query #6</a>, <a href="https://nextapi.getpop.org/api/graphql?query=sprintf(API %s is %s, [PoP, cool])">query #7</a>]

#### Nested fields

Arguments passed to a field can receive other fields or operators as input.

```php
?query=
  posts.
    if (
      has-comments(), 
      sprintf(
        "Post with ID %s has %s comment(s) and title '%s'", 
        [
          id(),
          comments-count(),
          title()
        ]
      ), 
      sprintf(
        "Post with ID %s, created on %s, has no comments", 
        [
          id(), 
          date(d/m/Y)
        ]
      )
    )@postDesc
```

[<a href="https://nextapi.getpop.org/api/graphql/?query=posts.if(has-comments(),sprintf(Post with ID %s has %s comment(s) and title '%s',[id(),comments-count(),title()]),sprintf(%22Post with ID %s, created on %s, has no comments%22,[id(),date(d/m/Y)]))@postDesc">View query results</a>]

### Nested directives

A directive can modify the behaviour of another directive. Values can be passed from one to another through "expressions": special variables set by each directive, wrapped with `%...%`.

For instance, in the example below, directive `<forEach>` iterates through all the items in an array, passing each of them to its nested directive `<transformProperty>` through expression `%value%`.

```php
echo([
  [banana, apple],
  [strawberry, grape, melon]
])@fruitJoin<
  forEach<
    transformProperty(
      function: arrayJoin,
      addParams: [
        array: %value%,
        separator: "---"
      ]
    )
  >
>
```

[<a href="https://newapi.getpop.org/api/graphql/?query=echo([[banana,apple],[strawberry,grape,melon]])@fruitJoin%3CforEach%3CtransformProperty(function:arrayJoin,addParams:[array:%value%,separator:%22---%22])%3E%3E">View query results</a>]

### Implementing the Query

Time to implement the query! I promise this is going to be fun (at least, I certainly enjoyed doing it). Along the way I will explain how/why it works.

Let's start.

> **Note:**<br/>At any time, you can review the documentation for the fields/directives employed by querying the [__schema](https://newapi.getpop.org/api/graphql/?query=__schema) field.

#### Fetching the blog post

We can query field `posts` to find the latest published blog post:

```php
posts(
  limit:1, 
  order:date|DESC
).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:1,order:date|DESC).id|title|url">View query results</a>]

> **Note 1:**<br/> Use `,` to separate field arguments, each of them in `key:value` format

> **Note 2:**<br/> Use `.` to fetch nested properties from the object

> **Note 3:**<br/> Use `|` to fetch several fields from an object

This query retrieves an array of posts. To operate with a single post, we can better use field `post`, which receives the ID by argument:

```php
post(
  id:1
).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?query=post(id:1).id|title|url">View query results</a>]

Fields argument names are optional. The query above is similar to the one below, which skips fieldArg name `"id"`:

```php
post(1).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?query=post(1).id|title|url">View query results</a>]

We can pass the ID through a variable, which is resolved through a URL parameter under the variable name. For the query below, we add param `postId=1` to the URL:

```php
post($postId).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId).id|title|url">View query results</a>]

> **Note:**<br/>Use `$` to define a variable

Finally, we add an alias to make the response more compact:

```php
post($postId)@post.
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.id|title|url">View query results</a>]

> **Note:**<br/>Use `@` to define an alias

#### Fetching the blog post (again)

The previous queries were demonstrating how to fetch data for the post. Now that we know, let's fetch the data needed for our use case: the `content` and `date` fields, which will be placed under an array under alias `postData`:

```php
post($postId)@post.
  echo([
    content:content(),
    date:date(d/m/Y)
  ])@postData
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData">View query results</a>]

> **Note:**<br/>Use `[...]` to define an array and `,` to separate its items. The format for each item is either `key:value` or `value` (making the key numeric)

#### Fetching the list of newsletter subscribers

To fetch the list of newsletter subscribers from a REST endpoint, we can use field `getJSON` and specify the URL:

```php
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList">View query results</a>]

#### Calculating the list of unique languages

The previous list contains pairs of `email` and `lang` fields. Next, we calculate the list of unique languages, as to translate the blog post to all those languages. This task will be composed of two steps.

First, we extract the field `lang` from the array through field `extract` (which takes an array and a path):

```php
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList|
extract(
  getSelfProp(%self%, userList),
  lang
)
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),lang)">View query results</a>]

> **Note:**<br/>Expression `%self%` contains an object which has a pointer to all data retrieved for the current object. Accessed through function `getSelfProp`, it enables to access this data, under the property name or alias under which it was stored.

Then, we apply operator `arrayUnique`, and assign the results under alias `userLangs`:

```php
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList|
arrayUnique(
  extract(
    getSelfProp(%self%, userList),
    lang
  )
)@userLangs
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs">View query results</a>]

#### Retrieving the rest of the user information

So far, we have a list of pairs of `email` and `lang` fields stored under property `userList`. Next, using `email` as the common identifier for the data, we query the REST endpoint from the CRM to fetch the remaining user information: the `name` field. This task is composed of several steps.

First, we extract the list of all emails from `userList`, and place them under `userEmails`:

```php
extract(
  getSelfProp(%self%, userList),
  email
)@userEmails
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails">View query results</a>]

Our CRM exposes a REST endpoint which allows to filter users by email, like this:

```php
/users/api/rest/?emails[]=email1&emails[]=email2&...
```

Then, we must generate the endpoint URL by converting the array of emails into a string with the right format, and then executing `getJSON` on this URL. Let's do that.

To generate the URL, we use a combination of `sprintf` and `arrayJoin`:

```php
sprintf(
  "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
  [arrayJoin(
    getSelfProp(%self%, userEmails),
    "%26emails[]="
  )]
)
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails|sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])">View query results</a>]

> **Note 1:**<br/>The string can't have character `"&"` in it, or it will create trouble when appending it in the URL param. Instead, we must use its code `"%26"`

> **Note 2:**<br/>The REST endpoint used for this example is also satisfied by the PoP API, which combines features of both REST and GraphQL at the same time (eg: the queried resources are `/users/`, and we avoid overfetching by passing `?query=name|email`)

Having generated the URL, we execute `getJSON` on it:

```php
getJSON(
  sprintf(
    "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
    [arrayJoin(
      getSelfProp(%self%,userEmails),
      "%26emails[]="
    )]
  )
)
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails|getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)]))">View query results</a>]

Finally, we must combine the 2 lists into one, generating a new list containing all user fields: `name`, `email` and `lang`. To achieve this, we use function `arrayFill`, which, given 2 arrays, returns an array containing the entries from each of them where the index (in this case, property `email`) is the same, and we save the results under property `userData`:

```php
arrayFill(
  getJSON(
    sprintf(
      "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
      [arrayJoin(
        getSelfProp(%self%, userEmails),
        "%26emails[]="
      )]
    )
  ),
  getSelfProp(%self%, userList),
  email
)@userData
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData">View query results</a>]

#### Translating the post content to all different languages

By now we have collected the post data, saved under property `postData`, and all the user data, saved under property `userData`. It is time to mix these 2.

In order to work with these 2 arrays, we need to have both of them at the same level. However, if we pay attention to the <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData">latest query</a>, we can notice that they are under 2 different paths:

- `userData` is under `/` (root)
- `postData` is under `/post/`

Hence, we must either move `userData` down to the `post` level, or move the `postData` up to the root level. Due to PoP's graph dataloading architecture, only the latter option is feasible. The reason is a bit difficult to explain in words, but I'll try my best. (It would be much better to show the process in images, but I'm not great at design in any case.)

#### A digression to explain how data is loaded

(This will be a bit technical. Apologies in advance.)

When resolving the query to load data, the dataloader processes all elements from a same entity all at the same time, as to load all their data in a single query and completely avoiding the N+1 problem. (Indeed, PoP's dataloading mechanism has linear time complexity, or `O(n)`, based on the number of nodes in the graph. That's why it is so fast to load data, even for deeply nested graphs.) Then, let's imagine that we have the following query:

```php
posts.
  title|
  author.
    name
```

Let's say this query returns 10 posts and, for each post, it retrieves its author, and some authors have 2 or more posts, so that the query retrieves 10 posts but only 4 unique authors. The dataloading mechanism will first process all 10 posts, fetching all their required data (properties `title` and `author`), and then it will fetch all data for all 4 authors (property `name`). 

If posts with IDs `1` and `2` both have author with ID `5`, and we copy a property downwards in the graph, post `1` will first copy its properties down to author `5`, then immediately post `2` will copy its own properties down to author `5`, overriding the properties set by post `1`. By the time the dataloading mechanism reaches the users level, author `5` will only have the data from posts `2`. This situation could be avoided by copying the properties the post ID in the user object, as to not override previous values. However, while the post entity knows that it is loading data for its author, the author entity doesn't know who loaded it (the graph direction is only top-to-bottom). Hence, the post entiy can fetch properties from the author entity and store them under theauthor ID (which the post knows about), but the other way around doesn't work.

That's why we can only copy properties upwards. In this case, the `postData` property must be copied upwards, to the root.

We can now go back to the query.

#### Translating the post content to all different languages (again)

To copy the `postData` property upwards to the root level, we use directive `<copyRelationalResults>`. This directive is applied on the root entity, and it receives 2 inputs:

1. The name of the relational property, in this case `post($postId)@post`
2. The name of the properties to copy, in this case only `postData`

```php
id.
  post($postId)@post<
    copyRelationalResults([postData])
  >
```

[View query results: <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">GraphQL output</a>, <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">PoP native output</a>]

That this works is not evident at all. Moreover, you need to click on the link <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">PoP native output</a> to see the results, and appreciate that the data was indeed copied one level up. The other link, <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">GraphQL output</a>, would seem to not work... it also does, but the results are not being output!

To understand why this is so, I'll need to take several detours, to explain how data is loaded (once again) and how directives work.

#### What are directives and how do they work

Directives are sheer power: They can affect execution of the query in any desired way. They are as close to the bare metal of the dataloading engine as possible. They have access to all previously loaded data and can modify it, remove it, etc.

Directives help regulate the lifecycle of loading data in the API, by validating and resolving the fields on the objects and adding these results on a directory with all results from all objects, from which the graph is drawn. 

The dataloading engine relies on the following special directives to implement core functionality:

1. `<setSelfAsExpression>`, which defines the "expression" `%self%` which allows to retrieve previously loaded data
2. `<validate>`, which validates that the provided data matches against its definition on the schema and, if it doesn't, removes it and shows a error message
3. `<resolveValueAndMerge>`: it resolves all the fields in the query and merges their response into the final database object

These 3 directives are executed at the beginning of their own slots:

1. Front: `<setSelfAsExpression>`
2. Middle: `<validate>`
3. Back: `<resolveValueAndMerge>`

Every directive we create must indicate in which from these 3 slots it must be placed and executed. For instance, directives `<skip>` and `<include>` (mandatory ones in GraphQL) must be placed in the `"Middle"` slot, that is after fields are validated but before resolved; directive `<copyRelationalProperties>` must be placed in the `"Back"` slot, since it requires the data to be resolved before it can copy it somewhere else.

#### Differences between directives and operators

When coding a query, it may be sometimes unclear what is better, if to use an operator or use a directive. After all, the two of them can both execute functionality (such as sending an email). So, when to use one or the other?

The main difference between these 2 is the following:

An operator is a field. A field computes a value from a single object; every field is executed independently of each other field, and it is executed once per object. For instance, for the following query...

```php
post.title
```

... the field `title` is executed once on each post object. If there are 10 posts, then `title` is executed 10 times, once in each. And they see no history: given a set of inputs, they just return their output. They don't have really a lot of logic, or complexity.

Since operators are fields, we have the same situation: For the following query...

```php
post.sprintf("Post title is", [title()])
```

... the `sprintf` operator is executed once in each `title` property, which is executed 10 times, once per post, all independently from each other, and oblivious of each other.

Directives work in a different way: They are executed just once on the set of affected objects, and on the set of affected properties for each object, and they can modify the value of these properties for each of the objects. For instance, for the following query:

```php
posts.
  title<
    transformProperty(...)
  >|
  content<
    transformProperty(...)
  >
```

... the directive `<transformProperty>` will be executed only once (even if it appears twice), receiving a set of posts and properties `title` and `content` for each post.

Hence, we must use directives when:

- It is more efficient to batch execute operations. For instance, a `<sendByEmail>` directive sending 10 emails at once is more effective than a `sendByEmail()` operator sending 10 emails independently, and making 10 SMTP connections.
- We need low-level functionality, such as: modifying or deleting previous data, copying data to another object, iterating through a series of properties to apply a function to each of them, etc.

#### Concerning the native data structure used in PoP (hint: it's not a graph!)

We saw in the query above...

```php
id.
  post($postId)@post<
    copyRelationalResults([postData])
  >
```

... that we need to view the query results in <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">PoP native output</a> to see that the directive `<copyRelationalResults>` worked, and that the <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">GraphQL output</a> doesn't mirror the changes. What is going on?

First of all: the PoP API does NOT use a graph to represent the data model. Instead, it uses components, as I have explained [in this article for Smashing Magazine](https://www.smashingmagazine.com/2019/01/introducing-component-based-api/). 

However (and this is the fact that makes the magic happen) a graph does naturally arise from the relationships among the database entities defined through components, which I described in my article. Hence, the graph can be easily generated from the architecture of the API, and the GraphQL implementation is simply an application among many. For instance, if replacing the `/graphql` bit in the URL with `/rest`, we obtain the equivalent REST endpoint (as demonstrated for the REST API endpoint to fetch the CRM user data); if we replace it with `/xml`, we access the data in XML format (<a href="https://newapi.getpop.org/api/xml/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData">example</a>).

The real, underlying data structure in PoP is simply a set of relationships across database objects, which matches directly with how an SQL database works: Tables containing rows of data entries, and relationships among entities defined through IDs. That is exactly what you see when you remove the `/graphql` bit from the URL, from any URL. That's the PoP native format. Looking at is like looking at the code in the matrix.

![This is how removing /graphql feels like. Image source: huffpost.com](/images/matrix.jpg "This is how removing /graphql feels like. Image source: huffpost.com")

That is why I call this implementation “schemaless”: The developer needs not define schemas, but simply relationships among the different database object, which will most likely already exist! Just by replicating the relationships already defined in the data model, we got a free “schemaless” GraphQL: Free as in "no need to code it", not as in "it doesn't exist". After all, the schema can be automatically generated from the component model itself, and visualized by [querying the `__schema` field](https://newapi.getpop.org/api/graphql/?query=__schema).

Finally, we can provide an explanation of why the query results in <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">PoP native output</a> for directive `<copyRelationalResults>` are shown, but not in the <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">GraphQL output</a>: The PoP native format displays all the data it has accumulated, thereby there it is. The GraphQL format, though, doesn't show it because the property under which the data is copied to, `postData`, is not being queried. If we do, adding 2 levels of `id` to make sure we query the data after it has been copied, the data then does appear in the response:

```php
id.
  post($postId)@post<
    copyRelationalResults([postData])
  >,
id.
  id.
    getSelfProp(%self%, postData)
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E,id.id.getSelfProp(%self%,%20postData)">View query results</a>]

#### Revisiting how PoP loads data

Let's examine the query above together with the previous query bit that loads the property `postData`:

```php
post($postId)@post.
  echo([
    content:content(),
    date:date(d/m/Y)
  ])@postData,
id.
  post($postId)@post<
    copyRelationalResults([postData])
  >
```

[View query results: <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">PoP native output</a>]

We can see that these 2 queries are separated using `,` instead of `|`, and that there is an entity `id` after which we repeat the same field `post($postId)@post`, and only then we apply directive `<copyRelationalResults>`. Why is this so? 

Field `id` is an identity field: It returns the same object currently being operated on. In this case, it returns once again the entity `root`. (Doing `id` returns the `root` object, doing `post.id` returns the same `post` object, doing `post.author.id` returns the `user` object, and so on.) 

As I mentioned before, the dataloader loads data in stages, in which all data for a same type of entity (all posts, all users, etc) is fetched all together. Using `,` to separate a query makes it start iterating from the root all over again. Then, when processing this query...

```php
post,
id.post
``` 

...the entites being handled by the dataloader are these ones, in this exact order: `root` (the first one, always), `posts` (loaded by query `posts`, before the `,`), `root` (the first one again, after `,`), `root` again (loaded by doing `id` on the `root` object) and then `posts` again (by doing `id.post`).

As can be seen, the `id` field then enables to go back to an already loaded object, and keep loading properties on it. As such, it allows to delay loading certain data until a later iteration of the dataloader, to make sure a certain condition is satisfied.

That is exactly why we need it: Directive `<copyRelationalResults>` copies a property one level up, but it is applied on the `root` object and, by the time it is executed, the properties to copy must exist on the `post` object. Hence the iteration: `root` loads the `post`, the `post` loads its properties, then back to `root` copies the properties from the `post` to itself.

#### Translating the post content to all different languages (again) (again)

After this rather long detour, we can go back to our query.

... the directive `<copyRelationalResults>` is being applied on the `root` object (loaded by field `id`), concerning its field `post($postId)@post` 

```php
id.
  post($postId)@post<
    copyRelationalResults([postData])
  >
```

Let's first execute the query as we had been doing until now: concatenating fields using `|`. In this case, the query becomes:

```php
post($postId)@post.
  echo([
    content:content(),
    date:date(d/m/Y)
  ])@postData,
id.
  post($postId)@post<
    copyRelationalResults([postData])
  >
```

[View query results: <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData,id.post($postId)@post%3CcopyRelationalResults([postData])%3E">PoP native output</a>]

[<a href="">View query results</a>]



```php

```

[<a href="">View query results</a>]



```php

```

[<a href="">View query results</a>]



```php

```

[<a href="">View query results</a>]



```php

```

[<a href="">View query results</a>]



```php

```

[<a href="">View query results</a>]



```php

```

[<a href="">View query results</a>]



```php

```

[<a href="">View query results</a>]




### Conclusion: Benefits

Decentralized
Federation/Decentralization
Fast and Safe
One-Graph solution for everything

### What next

Mutations
Symfony Notifier
<CacheControl>
HTTP Cache 
Public/Private API
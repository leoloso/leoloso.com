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

[Visualize: <a href="https://nextapi.getpop.org/api/graphql?query=not(true)">query #1</a>, <a href="https://nextapi.getpop.org/api/graphql?query=or([true,false])">query #2</a>, <a href="https://nextapi.getpop.org/api/graphql?query=and([true,false])">query #3</a>, <a href="https://nextapi.getpop.org/api/graphql?query=if(true,Show this text,Hide this text)">query #4</a>, <a href="https://nextapi.getpop.org/api/graphql?query=equals(first text, second text)">query #5</a>, <a href="https://nextapi.getpop.org/api/graphql?query=isNull(),isNull(something)">query #6</a>, <a href="https://nextapi.getpop.org/api/graphql?query=sprintf(API %s is %s, [PoP, cool])">query #7</a>]

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

[<a href="https://nextapi.getpop.org/api/graphql/?query=posts.if(has-comments(),sprintf(Post with ID %s has %s comment(s) and title '%s',[id(),comments-count(),title()]),sprintf(%22Post with ID %s, created on %s, has no comments%22,[id(),date(d/m/Y)]))@postDesc">Visualize query</a>]

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

[<a href="https://newapi.getpop.org/api/graphql/?query=echo([[banana,apple],[strawberry,grape,melon]])@fruitJoin%3CforEach%3CtransformProperty(function:arrayJoin,addParams:[array:%value%,separator:%22---%22])%3E%3E">Visualize query</a>]

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

[<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:1,order:date|DESC).id|title|url">Visualize query</a>]

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

[<a href="https://newapi.getpop.org/api/graphql/?query=post(id:1).id|title|url">Visualize query</a>]

Fields argument names are optional. The query above is similar to the one below, which skips fieldArg name `"id"`:

```php
post(1).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?query=post(1).id|title|url">Visualize query</a>]

We can pass the ID through a variable, which is resolved through a URL parameter under the variable name. For the query below, we add param `postId=1` to the URL:

```php
post($postId).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId).id|title|url">Visualize query</a>]

> **Note:**<br/>Use `$` to define a variable

Finally, we add an alias to make the response more compact:

```php
post($postId)@post.
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.id|title|url">Visualize query</a>]

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

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.echo([content:content(),date:date(d/m/Y)])@postData">Visualize query</a>]

> **Note:**<br/>Use `[...]` to define an array and `,` to separate its items. The format for each item is either `key:value` or `value` (making the key numeric)

#### Fetching the list of newsletter subscribers

To fetch the list of newsletter subscribers from a REST endpoint, we can use field `getJSON` and specify the URL:

```php
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList">Visualize query</a>]

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

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),lang)">Visualize query</a>]

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

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs">Visualize query</a>]

#### Retrieving the rest of the user information

So far, we have a list of pairs of `email` and `lang` fields stored under property `userList`. Next, using `email` as the common identifier for the data, we query the REST endpoint from the CRM to fetch the remaining user information: the `name` field. This task is composed of several steps.

First, we extract the list of all emails from `userList`, and place them under `userEmails`:

```php
extract(
  getSelfProp(%self%, userList),
  email
)@userEmails
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails">Visualize query</a>]

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

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails|sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])">Visualize query</a>]

> **Note 1:**<br/>The string can't have character `"&"` in it, or it will create trouble when appending it in the URL param. Instead, we must use its code `"%26"`

> **Note 2:**<br/>The REST endpoint used for this example is also satisfied by the PoP API, which combines features of both REST and GraphQL at the same time (eg: the queried resources are `/users/`, and we avoid overfetching by passing `?query=name|email`)

Having generated the URL, we execute `getJSON` on it and store the results under property `userProps`:

```php
getJSON(
  sprintf(
    "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
    [arrayJoin(
      getSelfProp(%self%,userEmails),
      "%26emails[]="
    )]
  )
)@userProps
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails|getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)]))@userProps">Visualize query</a>]

Finally, we must combine the 2 lists into one, generating a new list containing all user fields: `name`, `email` and `lang`. 

```php

```

[<a href="">Visualize query</a>]



```php

```

[<a href="">Visualize query</a>]



```php

```

[<a href="">Visualize query</a>]



```php

```

[<a href="">Visualize query</a>]



```php

```

[<a href="">Visualize query</a>]



```php

```

[<a href="">Visualize query</a>]



```php

```

[<a href="">Visualize query</a>]



```php

```

[<a href="">Visualize query</a>]



```php

```

[<a href="">Visualize query</a>]



```php

```

[<a href="">Visualize query</a>]




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
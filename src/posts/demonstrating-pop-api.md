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

### Implementing the Query (with explanations along the way)

Time to implement the query! I promise this is going to be fun! (I certainly enjoyed doing it.) Along the way I will also explain how/why it works.




### Conclusion: Benefits

Decentralized
Federation/Decentralization
HTTP Cache 
Fast and Safe
Public/Private API
One-Graph solution for everything
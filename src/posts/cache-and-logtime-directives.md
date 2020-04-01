---
title: 📦 Added @cache and @traceExecutionTime directives to GraphQL by PoP
metaDesc: Keep implementing features to improve GraphQL
socialImage: /images/graphql-by-pop-logo.jpg
date: '2020-04-01'
tags:
  - pop
  - graphql
  - development
  - directives
---

I seem to be in a custom-directive-creation spree for [GraphQL by PoP](https://graphql-by-pop.com): [2 days ago](https://leoloso.com/posts/remove-if-null-directive/)  I added [directive `@removeIfNull`](https://github.com/getpop/graphql/blob/e3b8ff918249f8e1218c95f0a5156b9355e1e5ee/src/DirectiveResolvers/RemoveIfNullDirectiveResolver.php) (as to be able to distinguish between `null` and omission values in the response), and today I created directives `@cache` and `traceExecutionTime`. Let's check them out.

### @cache directive

The [@cache directive](https://github.com/getpop/engine/blob/e834fbcf7c3c1bc52f68e23e3e886eae2781146e/src/DirectiveResolvers/Cache/SaveCacheDirectiveResolver.php) enables to cache the result of a heavy-to-compute operation. The first time the field is resolved, the `@cache` directive will save the value in disk or memory (Redis, Memcached), either with an expiry date or not, and from then on whenever querying this field the cached value will be retrieved and the operation will not be performed.

> Please notice: the `@cache` directive is different than the [`@cacheControl` directive](https://github.com/getpop/cache-control/blob/7dee5642897c9e50e1b7bedd38539f0fedb77de1/src/DirectiveResolvers/AbstractCacheControlDirectiveResolver.php), which sends the `Cache-Control` header with a `max-age` to have the browser/CDN/webserver cache the response through HTTP caching.
>
> With these two directives, the caching solution in GraphQL by PoP is now very robust: HTTP caching + Field-computation caching!
>
> To find out more: the `@cacheControl` directive is demonstrated in [this blog post](https://leoloso.com/posts/pop-api-now-features-http-caching/) (it shows examples using the PoP Query Language, but it works the same way for GraphQL when passing the query through GET, or when using persisted queries).

For instance, [this query](https://newapi.getpop.org/graphiql/?show_logs=true&query=query%20%7B%0A%20%20posts(limit%3A3)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%0A%20%20%7D%0A%7D) executes the [`@translate` directive](https://github.com/getpop/translate-directive/blob/e9c9ce4ad825241ab0465eba4c754689b8ddd4bc/src/DirectiveResolvers/AbstractTranslateDirectiveResolver.php), which does a single connection to the Google Translate API and performs the translation of the posts' titles:

<div id="graphiql-1st" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

Assuming this is an expensive call, we would like to cache the field's value after the first response. [This query](https://newapi.getpop.org/graphiql/?show_logs=true&query=query%20%7B%0A%20%20posts(limit%3A3)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%20%40cache(time%3A10)%0A%20%20%7D%0A%7D) achieves that through the `@cache` directive, passing a time expiration of 10 seconds (not passing this value, the cache does not expire). To visualize it, run this query and then, within 10 seconds, run it again:

<div id="graphiql-2nd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

> Please notice that directives in GraphQL are applied in order, so the following queries are different: 
>
> - `title @translate @cache`
> - `title @cache @translate`
>
> In the 1st case, it executes `@translate` and then `@cache`, so the translation is being cached; in the 2 case, it executes `@cache` and then `@translate`, so the caching only stores the value of the `title` field and not its translation.

How do we know that the 2nd time the response came from the cache? If you notice, the endpoint is passed a parameter `actions[]=show-logs` which prints logs under the `extensions` top-level entry. The first time we execute the query, we obtain this response:

![1st execution of query with @cache directive](/images/cache-directive-1st-run.png "1st execution of query with @cache directive")

The 2nd time, executing the same query within 10 seconds, we obtain this response, in which a log informs that the value is coming from the cache:

![2nd execution of query with @cache directive](/images/cache-directive-2nd-run.png "2nd execution of query with @cache directive")

Please notice how the log indicates which are the items that have been cached: in this case, the same 3 items being filtered. If we increase the `limit` to 6, and run again within 10 seconds, the already-cached 3 items will be retrieved from the cache, and the other 3, which have not been cached yet, will be retrieved fresh through Google Translate:

![3rd execution of query with @cache directive](/images/cache-directive-3rd-run.png "3rd execution of query with @cache directive")

If we run it again, now all 6 items will be cached:

![4th execution of query with @cache directive](/images/cache-directive-4th-run.png "4th execution of query with @cache directive")

Needless to say, the query retrieving cached fields feels faster. But how much faster? Can we quantify it?

### @traceExecutionTime directive

Yes, we can quantify it, because I also implemented the perfect companion: the [`@traceExecutionTime` directive](https://github.com/getpop/trace-tools/blob/91c32f8851bfe422963fb7911dd808ada7d4fecf/src/DirectiveResolvers/EndTraceExecutionTimeDirectiveResolver.php) tracks how much time it takes to resolve the field (including all the involved directives), and adds the result to the log. Let's check it out using the same earlier example.

Let's run [this query](https://newapi.getpop.org/graphiql/?show_logs=true&query=query%20%7B%0A%20%20posts(limit%3A3)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%20%40cache(time%3A10)%20%40traceExecutionTime%0A%20%20%7D%0A%7D) with `@traceExecutionTime` first, and within 10 seconds again:

<div id="graphiql-3rd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

For the first execution, resolving the field containing the `@translate` directive took 80.111 milliseconds to execute (from connecting to the Google Translate API):

![1st execution of query with @cache and @traceExecutionTime directives](/images/cache-logtime-directives-1st-run.png "1st execution of query with @cache and @traceExecutionTime directives")

For the second execution, the results from translating the titles were all cached, so the connection to Google Translate was avoided and the field was resolved in less than 1 millisecond:

![2nd execution of query with @cache and @traceExecutionTime directives](/images/cache-logtime-directives-2nd-run.png "2nd execution of query with @cache and @traceExecutionTime directives")

That is 80 times faster! How cool is that!? 👏👏👏

### So, can I install GraphQL by PoP? How?

Yes, you can install it following [these instructions](https://github.com/leoloso/PoP-API-WP#install), but the documentation right now is all over the place and not easy to follow (there is a bit in this blog, some bits in [this GitHub repo](https://github.com/getpop/graphql#install) and a few others, some other stuff in a few Smashing Magazine and LogRocket blog articles). It's certainly not ideal.

But don't despair! I'm working on a new documentation site, and then it will be perfect! It should be ready in a few weeks time... I will post updates in this blog and on [my Twitter account](https://twitter.com/losoviz).

Hasta la vista 👋

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
  const apiURL = 'https://newapi.getpop.org/api/graphql/?actions[]=show-logs';
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
        query: 'query {\n  posts(limit:3) {\n    id\n    title @translate(from:"en", to:"es")\n  }\n}'
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
        query: 'query {\n  posts(limit:3) {\n    id\n    title @translate(from:"en", to:"es") @cache(time:10)\n  }\n}'
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
        query: 'query {\n  posts(limit:3) {\n    id\n    title @translate(from:"en", to:"es") @cache(time:10) @traceExecutionTime\n  }\n}'
      }
    ),
    document.getElementById('graphiql-3rd'),
  );
</script>

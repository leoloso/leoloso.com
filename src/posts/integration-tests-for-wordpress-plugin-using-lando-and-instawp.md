---
title: "🏃🏻‍♂️ How I run Integration Tests for my WP plugin using Lando and InstaWP"
metaDesc: Here are my strategies to test my plugin against a real WordPress site
socialImage: /images/integration-tests-meme.jpg
date: '2022-11-05'
draft: true
tags:
  - graphql
  - wordpress
  - plugin
  - development
  - testing
---

I am using [InstaWP](https://instawp.com/), a newish sandboxing service that allows to spin a WordPress site on-demand, to execute integration tests for my plugin. InstaWP offers an API to programmatically launch the new site, install the required plugins, and then destroy the instance, and we can use templates to have the WordPress site pre-loaded with data, and with a specific configuration of PHP and WordPress. It allows us to test our themes and plugins against **an actual WordPress site**, to be conveniently invoked from GitHub Actions (or any other Continuous Integration tool) before merging a Pull Request.

Preparing a new InstaWP instance in my case takes around 3 minutes (since my plugin weighs 8.4 mb, and its downloading and installation takes a bit of time), and only then I can start executing the integration tests. Hence, while InstaWP is ideal for collaborating with team members on the repo, I wouldn't want to wait this time while developing the plugin on my laptop computer.

During development, instead, I execute the integration tests against a local webserver provided via [Lando](https://github.com/lando/lando/), a Docker-based local tool to create projects on any language and technology, with pre-defined recipes for easily launching several of the most common stacks, including WordPress. Building a Lando server will take over 5 minutes but, once created, I can start the same instance again in just a few seconds. I particularly like Lando because I can commit my plugin's required configuration in the repo (defined via a `yaml` file), so anyone can clone the repo, execute a command, and have ready the same development environment.

There are 2 different things to integration test:

- The plugin's source code
- The generated WordPress .zip file

This is because the code in these 2 sets is different:

- Files not needed for production are removed from the .zip plugin, such as the JS source code for the editor blocks (shipping their `build` folder is already enough)
- Composer dependencies are compiled for PROD, so we must make sure no code under `tests` is being referenced.

And in my plugin's case, there are a few additional differences:

- The source code is coded using PHP 8.1
- The .zip file is generated as a GitHub Actions artifact and, in the process, the source code is [transpiled to PHP 7.1](https://graphql-api.com/blog/the-plugin-is-now-transpiled-from-php-80-to-71/) and [scoped](https://graphql-api.com/blog/graphql-api-for-wp-is-now-scoped-thanks-to-php-scoper/)

Putting it all together, I run my integration tests in three different combinations:

1. On the PHP source code while developing the plugin, using Lando and PHP 8.1
2. On the generated .zip plugin once I think the new feature is ready, using Lando and PHP 7.1
3. On the generated .zip plugin before merging the PR in GitHub Actions, using InstaWP and a matrix of PHP/WP configurations

Importantly, **all 3 combinations must receive the same inputs, and produce the same outputs**, and must (as much as possible) use the same configuration files to prepare their environments. A single test suite must work everywhere, without customizations or hacks.

In this blog post I'll explain how I've achieved this for my WordPress plugin, the [GraphQL API for WordPress](https://graphql-api.com), and share a few tips that have helped me.

> **Heads up!** I am less than 2 weeks away from releasing version `0.9` of the GraphQL API plugin (after _16 months of work_, and over _1000 PRs_ from _14700 commits_ 🙀). If you'd like to be notified of the upcoming release, please [watch the project in GitHub](https://github.com/leoloso/PoP) or [subscribe to the newsletter](https://graphql-api.com/newsletter/) (no spam, only announcements).

## 1. Running Integration Tests on the PHP source code (on my development computer) on PHP 8.1

This is the stack I'm using:

- Lando
- [XDebug](https://xdebug.org/)
- [Guzzle](https://github.com/guzzle/guzzle)
- [PHPUnit](https://github.com/sebastianbergmann/phpunit/)
- [Composer](https://getcomposer.org/)
- [WP-CLI](https://wp-cli.org/)
- The WordPress export tool

I'll explain why and how I'm using these, and point to the appropriate files on my repo.

### Lando

The Lando websever is hosted under [`webservers/graphql-api-for-wp`](https://github.com/leoloso/PoP/tree/master/webservers/graphql-api-for-wp), and it has [this configuration](https://github.com/leoloso/PoP/blob/master/webservers/graphql-api-for-wp/.lando.yml):

```yaml
name: graphql-api
recipe: wordpress
config:
  webroot: wordpress
  php: '8.1'
  config:
    php: ../shared/config/php.ini
  xdebug: true
env_file:
  - defaults.env
  - defaults.local.env
services:
  appserver:
    overrides:
      environment:
        XDEBUG_MODE: ''
      volumes:
        - >-
          ../../layers/GraphQLAPIForWP/plugins/graphql-api-for-wp:/app/wordpress/wp-content/plugins/graphql-api
        - >-
          ../../layers/API/packages/api-clients:/app/wordpress/wp-content/plugins/graphql-api/vendor/pop-api/api-clients
        - >-
          ../../layers/API/packages/api-endpoints-for-wp:/app/wordpress/wp-content/plugins/graphql-api/vendor/pop-api/api-endpoints-for-wp
        - >-
          ../../layers/API/packages/api-endpoints:/app/wordpress/wp-content/plugins/graphql-api/vendor/pop-api/api-endpoints
```

The noteworthy elements here are the following:

- The local webserver will be available under `https://graphql-api.lndo.site`
- The common PHP configuration across all Lando webservers, under `shared/config/php.ini`, is defined once and referenced by all of them
- XDebug is enabled, but inactive by default; it is executed only when passing environment variable `XDEBUG_TRIGGER=1` (eg: executing bash `$ XDEBUG_TRIGGER=1 vendor/bin/phpunit` )
- Two files define environment variables, but while `defaults.env` is commited to the repo, `defaults.local.env` is `.gitignore`d, so the latter contains my personal access tokens.
- The plugin code is mapped to its source code via `services > appserver > overrides > volumes`, so that modifying the code has the change reflected immediately in the webserver.

The last item is a deal breaker for me, because [the plugin's code is distributed into a multitude of independent packages](https://graphql-api.com/blog/why-to-support-cms-agnosticism-the-graphql-api-split-to-around-90-packages/), which are managed via Composer. When running `composer install` to install the plugin, all these packages would be normally copied under the `vendor/` folder, breaking the connection between source code and code deployed to the webserver. Thanks to volume overrides, Lando will read the source files instead. (I used other webservers, including [Local](https://getflywheel.com/design-and-wordpress-resources/toolbox/local-by-flywheel/) and [wp-env](https://www.npmjs.com/package/@wordpress/env), and I believe none of them offers this feature.)

### Guzzle and PHPUnit

Guzzle is a PHP library for executing HTTP requests. PHPUnit is the most popular library for executing unit tests. I use these 2 libraries to execute my integration tests, like this:

1. Execute a PHPUnit test, that uses Guzzle to send an HTTP request to the Lando webserver
2. Have the PHPUnit test analyze if the response is the expected one

This works for my plugin because it is a GraphQL server, so that interacting with the webserver via HTTP requests can demonstrate if the plugin works as expected.

For instance, I send a GraphQL query to the single endpoint:

```graphql
{
  post(by: {id: 1}) {
    title
  }
}
```

And then I assert that the response matches its expectation:

```json
{
  "data": {
    "post": {
      "title": "Hello world!"
    }
  }
}
```

I've placed all integration tests under a `Integration` folder, so to run my integration tests I just execute:

```bash
vendor/bin/phpunit --filter=Integration
```

This works well in my case, which involves testing a request/response cycle for an API. But for other use cases, this stack will not be the most suitable. For instance, if we need to test the results of users interacting with our website (such as clicking on buttons or links), then [CodeCeption](https://codeception.com/) is a better option (as explained [in this guide](https://deliciousbrains.com/automated-testing-woocommerce/). And as an alternative to PHPUnit, we can also use [Pest](https://pestphp.com/) (here is [a guide on using Pest with WordPress](https://madebydenis.com/wordpress-integration-tests-with-pest-php/).



Guzzle also allows me to log-in to the WP site, so I can execute tests logged-in as the "admin" or "writer" and test that the Access Control works well
The key is to use a cookie bag, so that after logging in the first request, all cookies are kept, and when the second request is sent the server has the user authenticated.
Link to code


      Talk about `composer reset-db` and others
      Also `composer integration-test`

## 2. Using Lando to run Integration Tests on the generated .zip WP plugin (on my development computer)



## 3. Using InstaWP and GitHub Actions to run Integration Tests on the generated .zip WP plugin (before merging the PR)


## Wrapping up



"1. Running Integration Tests on the PHP source code (on my development computer)"
  Stack:
    PHPUnit
    Guzzle
    WP-CLI
    The WordPress export tool
    Composer
      Talk about `composer reset-db` and others
      Also `composer integration-test`
    Lando
"2. Using Lando to run Integration Tests on the generated .zip WP plugin (on my development computer)"
  Stack:
    same as before, plus...
    Monorepo
      graphql-api-testing plugin
      at this stage, because Testing code can still be part of the source code, but I don't want it on the final graphql-api.zip plugin!!!!
    Talk:
      `composer integration-test-prod`
    From here, think of another blog post, about using:
      "GraphQL API PRO to download GitHub artifacts"
"3. Using InstaWP and GitHub Actions to run Integration Tests on the generated .zip WP plugin (before merging the PR)"
  Stack:
    PHPUnit
    Guzzle
    Monorepo
      graphql-api-testing plugin
    GitHub Actions
    Nightly.link
    InstaWP

This works for my plugin because it's a GraphQL server, so it has visibility from outside. If I execute this query against the exposed GraphQL endpoint:
...
It must produce this response:
...
Otherwise I need to test that a GraphiQL client for a custom endpoint has been successfully enabled or disabled. For that:
Talk about setting a custom header "X-Client-Endpoint" to check that the right page is loaded
And I can still use Guzzle, to retrieve the response headers
If it did so, my plugin works well. Otherwise, I need to worry about some problem.
That's why Guzzle is a good tool for my use case. If I had a different use case, such as testing user interactions, I'd need a different tool (such as Codeception (https://codeception.com/))





Use ideas from below, among others! Hohoho
More ideas:
  Matrix with different configs of php/wp, but then can't use free account
  Each template receives version of php/wp at the beginning, so gotta recreate the process to populate them all
  It's easier paying and then having access to WP-CLI, but I don't
  So I have a .xml to import data, and I gotta manually edit some files, like wp-config, and that's it
Talk about the whole stack for testing
  unit-testing
    BrainMonkey
    BrainFaker
    Mockery
  integration-testing
    There's no need to mock data, as I already have a real WP environment!
What's the difference between the two?
Unit-testing writeup in another blog post (if people clamors for it!)


Offer article to MasterWP:
"This is how I test my WordPress plugin"
Make it personal
  How I test my WordPress plugin
    Monorepo
      graphql-api-testing plugin
    PHPUnit
    BrainMonkey
    BrainFaker
    Mockery
    The WordPress export tool
    Lando
    Guzzle
    WP-CLI
    XDebug
    InstaWP

Track Shannon Lam/Matteo Duò on new proposal for Kinsta:
https://trello.com/c/b2EThXYD/9-preferred-topics
"Tips for testing PHP code in WordPress plugins"
Talk about:
  Using BrainMonkey (https://github.com/Brain-WP/BrainMonkey/), BrainFaker (https://github.com/Brain-WP/BrainFaker) and Mockery (https://github.com/mockery/mockery) to mock WordPress data
    Talk about extending it with get_posts
  Mockery (https://github.com/mockery/mockery)
  PHPUnit (https://github.com/sebastianbergmann/phpunit/)
  Guzzle (https://github.com/guzzle/guzzle)
  WP-CLI
  Lando to set-up a local webserver (https://github.com/lando/lando/)
  Integration tests (against localhost)
  WordPress user authentication for testing
  Pre-creating mock data using WXR export files
  Using .gql and .json files
  Using as little WP code as possible
    Justify!
  Pre-defining the mock data with the .xml export file!
  Creating seed data in Lando for the webserver testing
    And/or using wp-cli?
      https://developer.wordpress.org/cli/commands/import/
      Importing pre-created WXR file with `wp import`
  Say integration tests are only for my localhost
    To not execute with GitHub Actions for CI
      Explain how this is avoided
    That is, unless could deploy DEV code to some instance, and then test against it
    Eg: using instawp.io!!!
      https://www.youtube.com/watch?v=V_2NCAshzKA
      https://poststatus.slack.com/archives/C02707KA3B8/p1649335609608409
      Or any other similar service!?
    Talk about using env vars:
      <env name="INTEGRATION_TESTS_WEBSERVER_DOMAIN" value="graphql-api.lndo.site"/>
      <env name="INTEGRATION_TESTS_AUTHENTICATED_USER_USERNAME" value="admin"/>
      <env name="INTEGRATION_TESTS_AUTHENTICATED_USER_PASSWORD" value="admin"/>
  Talk about setting a custom header "X-Client-Endpoint" to check that the right page is loaded
    Only for DEV!
  Talk about enabling/disabling plugins for testing
    Can't use Application passwords since I don't know the password, it becomes troublesome
    So use standard WP login + headers + _wpnonce
    Check header "X-WP-Nonce"
      getRESTEndpointRequestOptions()
      postWebserverPingResponse
      https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/
      /**
        * Send the WP REST nonce as a header, to make it easier
        * to execute REST endpoints for integration tests
        */
      function addRESTNonceAsHeader(): void
      {
        if (!\is_user_logged_in()) {
          return;
        }
        header('X-WP-REST-NONCE: ' . wp_create_nonce('wp_rest'));
      }
      add_filter('init', 'addRESTNonceAsHeader');
      beforeRunningTests/afterRunningTests
      Talk about creating another plugin to keep testing apart: "graphql-api-testing"
  Talk about setting-up the REST API in the testing plugin
    ModulesAdminRESTController
  Explore:
    Create duplicate tables in WP: "integrationtests_
    (Not done!!!)
  Doing this:
    # First remove the first "Hello world!" post (and "Sample Page" and "Privacy Policy" pages), to avoid duplication (it's in the dataset)
    wp post delete $(wp post list --post_type='post,page' --format=ids --path=/app/wordpress) --force --path=/app/wordpress
    For if we need predefined creation date
    Same for users:
      wp user create editor editor@test.com --role=editor --user_pass=11111111 --first_name=Editor --last_name=Smith --user_registered="1982-06-29-17-48-26" --path=/app/wordpress
  Security: talk about this:
    /**
    * Activate the plugin, only if:
    *
    * - we are in the DEV environment, or
    * - we are executing integration tests (hosted in InstaWP)
    */
    $enablePlugin = RootEnvironment::isApplicationEnvironmentDev();
    if (!$enablePlugin) {
      $validTestingDomains = [
        'instawp.io',
      ];
      // Calculate the top level domain (app.site.com => site.com)
      $hostNames = array_reverse(explode('.', $_SERVER['HTTP_HOST']));
      $host = $hostNames[1] . '.' . $hostNames[0];
      $enablePlugin = in_array($host, $validTestingDomains);
    }
  Also added REST endpoints to modify the value of a block property, test it, and revert
    Add REST endpoints modifying value inside CPT blocks:
      - Schema Configurators
        https://graphql-api.lndo.site/wp-admin/post.php?post=191&action=edit
      - Custom Endpoints
        https://graphql-api.lndo.site/wp-admin/post.php?post=196&action=edit
      - Persisted Queries
        https://graphql-api.lndo.site/wp-admin/post.php?post=65&action=edit
      - ACLs
        https://graphql-api.lndo.site/wp-admin/post.php?post=186&action=edit
      - CCLs
        https://graphql-api.lndo.site/wp-admin/post.php?post=179&action=edit
    Create tests!
      Test:
        Execute this nested mutation:
          https://graphql-api.lndo.site/graphql/website/?view=graphiql&XDEBUG_TRIGGER=1&query=mutation%20%7B%0A%20%20%23%20loginUser(by%3A%7Bcredentials%3A%7BusernameOrEmail%3A%22author%22%2Cpassword%3A%22author%22%7D%7D)%20%7B%0A%20%20%23%20%20%20id%0A%20%20%23%20%20%20name%0A%20%20%23%20%7D%0A%20%20__typename%0A%20%20disallowedPost%3A%20post(by%3A%20%7Bid%3A%201%7D)%20%7B%0A%20%20%20%20firstTitle%3A%20title%0A%20%20%20%20update(input%3A%20%7B%0A%20%20%20%20%20%20title%3A%20%22Hello%20world!%2033333%22%0A%20%20%20%20%7D)%20%7B%0A%20%20%20%20%20%20secondTitle%3A%20title%0A%20%20%20%20%20%20update(input%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%22Hello%20world!%22%0A%20%20%20%20%20%20%7D)%20%7B%0A%20%20%20%20%20%20%20%20thirdTitle%3A%20title%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20allowedPost%3A%20post(by%3A%20%7Bid%3A%2028%7D)%20%7B%0A%20%20%20%20firstTitle%3A%20title%0A%20%20%20%20update(input%3A%20%7B%0A%20%20%20%20%20%20title%3A%20%22HTTP%20caching%20improves%20performance%2033333%22%0A%20%20%20%20%7D)%20%7B%0A%20%20%20%20%20%20secondTitle%3A%20title%0A%20%20%20%20%20%20update(input%3A%20%7B%0A%20%20%20%20%20%20%20%20title%3A%20%22HTTP%20caching%20improves%20performance%22%0A%20%20%20%20%20%20%7D)%20%7B%0A%20%20%20%20%20%20%20%20thirdTitle%3A%20title%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D
        And in advance, in the Schema Config, set the "Supported Nested Mutations" from "default" to "enabled":
          https://graphql-api.lndo.site/wp-admin/post.php?post=191&action=edit
      Same for all Others!
    Use this:
      https://developer.wordpress.org/reference/functions/serialize_blocks/
        Source: https://zerowp.com/how-to-modify-the-gutenberg-blocks-from-post-content-with-php/
      parse_blocks
        Check: getBlocksFromCustomPost
        Also: https://github.com/spacedmonkey/wp-rest-blocks/blob/aaf02b7e64c06b7224da516d498ed7b3f503dafc/src/data.php
    Endpoints:
      wp-json/graphql-api/v1/admin/cpt-block-attributes/%customPostID/
      wp-json/graphql-api/v1/admin/cpt-block-attributes/%customPostID/%uniqueBlockName/
        GET
        POST
Also read:
  https://dev.to/shelob9/unit-testing-classes-that-call-functions-form-wordpress-core-3h5p
  https://madebydenis.com/wordpress-integration-tests-with-pest-php/
  https://carlalexander.ca/introduction-wordpress-unit-testing/
  https://deliciousbrains.com/automated-testing-woocommerce/
  https://kentcdodds.com/blog/write-tests
  https://symfony.com/doc/current/testing.html#resetting-the-database-automatically-before-each-test
Sources:
  https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#using-data-from-the-triggering-workflow
Submitted to Kinsta:
  "Tips for testing PHP code in WordPress plugins". Topics to cover:
  - Using BrainMonkey (https://github.com/Brain-WP/BrainMonkey/), BrainFaker (https://github.com/Brain-WP/BrainFaker) and Mockery (https://github.com/mockery/mockery) to mock WordPress data
  - Running unit tests with PHPUnit (https://github.com/sebastianbergmann/phpunit/)
  - Using fixture to better visualize the inputs to the test, and its expected response
  - Setting-up a local webserver using Lando (https://github.com/lando/lando/)
  - Pre-creating mock data using WXR export files, and importing them into the local webserver via WP-CLI
  - Running integration tests against the local webserver using Guzzle (https://github.com/guzzle/guzzle)
  - Authenticating the WordPress user when running integration tests
  - Running integration tests in CI (eg: using GitHub Actions) via some commercial project (eg: InstaWP, https://instawp.io/), or skipping them

Think thoroughly:
Offer article on testing WP to LogRocket/CSS-Tricks?
  An easy way for integration testing in WordPress

Offer article on "WordPress + Lando" for LogRocket!?
  Or "Integration tests using Lando"
  Or anyone else?
  CSS-Tricks?
  MasterWP?
  WPExplorer?
    https://www.wpexplorer.com/
  Inspired by:
    https://poststatus.com/post-status-excerpt-no-56-wordpress-development-with-docker-and-lando/
  Ideas:
    https://wpsessions.slack.com/archives/C03DMU4JFNV/p1652999778283809?thread_ts=1652987189.057179&cid=C03DMU4JFNV
    @Nick Hance I use Lando, with my .lando.yml config file already on my repo (so the setup is ready for whoever installs it). In the config file I set-up  “volume overrides” pointing to my plugins, so I can still edit them locally and see the changes reflected on the webserver immediately, without using git submodules: https://github.com/leoloso/PoP/blob/master/webservers/graphql-api-for-wp/.lando.yml#L18. It works pretty well. All the plugins are hosted on the repo (it’s a monorepo), so their path is local to the project, but even if your plugins were hosted in a different repo, their code can be accessed (at least the Home folder is mapped in Lando, so any file within it can be accessed, and I think you can add additional mappings too)

Some article around the monorepo + testing!?
  Or "5 benefits of using a monorepo"!?
    - dev-helpers/ folder outside plugin
    - graphql-api-testing plugin
    - ...
    - ...
    - ...
  It allowed me to create the "graphql-api-testing" plugin


InstaWP integration
------------------------------------------------------

Simplify integration_tests.yml!
Only 1 job! So no need to create multiple runners <= specially for PRO!!!

When Vikas provides `PLUGIN_URL`:
> actually we support plugin_zip and theme_zip in configurations.
> but templates don’t work with configurations
> anyway.. let me work up a simple solution for this.
Then keep working on InstaWP integration, to activate plugins, WITHOUT the paid plan!
Otherwise:
Create hack around Post Deployment?
  Have all the plugins already active in the DB from the template! hohoho

Check if plugins are being installed!!!!
Once again, it stopped working! Bleh

Import `graphql-api-data.xml` data into the InstaWP template
First delete all posts and pages!
Also import PRO `graphql-api-pro-data.xml` data!
Check "Hello world!", alright?

Done:
Create workflow to execute integration tests
  Steps:
    - Find out artifacts URLs:
      Use:
        https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#using-data-from-the-triggering-workflow
      Replace "api.github.com" with "nightly.link"
      `matchingArtifact.url`
        https://docs.github.com/en/rest/actions/artifacts
      `listWorkflowRunArtifacts` in:
        https://octokit.github.io/rest.js/v18
    - Create InstaWP instance
      Inject the artifact URLs
    - Set InstaWP URL in environment
      Must inject this value:
        <env name="INTEGRATION_TESTS_WEBSERVER_DOMAIN" value="graphql-api.lndo.site"/>
      How!?
        INTEGRATION_TESTS_WEBSERVER_DOMAIN=... vendor/bin/phpunit --filter=Integration/
        phpunit.dist.xml doesn't override it!
    - Kill InstaWP instance
Links:
  https://nightly.link/
    https://github.com/actions/upload-artifact/issues/27
    https://github.com/actions/upload-artifact/issues/51
  https://github.com/actions/upload-artifact/issues/50#issuecomment-702470267
  https://stackoverflow.com/questions/60355925/share-artifacts-between-workflows-github-actions
  https://docs.github.com/en/rest/actions/artifacts#download-an-artifact
  https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts#sharing-data-between-workflow-runs
  https://github.com/actions/upload-artifact/issues/50
  https://stackoverflow.com/questions/60789862/url-of-the-last-artifact-of-a-github-action-build



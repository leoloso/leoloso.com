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

I am using [InstaWP](https://instawp.com/), a newish sandboxing service that allows to spin a WordPress site on-demand, to execute integration tests for my plugin.

InstaWP offers an API to programmatically launch the new site, install the required plugins, and then destroy the instance, and we can use templates to have the WordPress site pre-loaded with data, and with a specific configuration of PHP and WordPress. It allows us to test our themes and plugins against **an actual WordPress site**, to be conveniently invoked from GitHub Actions (or any other Continuous Integration tool) before merging a Pull Request.

Preparing a new InstaWP instance with my plugin installed and activated takes around 3 minutes (since my plugin weighs 8.4 mb, and its downloading and installation slows down the process), and only then I can start executing the integration tests.

Hence, while InstaWP is ideal to collaborate on the repo, as to make sure that a team member's code works as expected, I wouldn't want to wait this time while I'm just working on my own.

For this reason, I also execute the integration tests against a local webserver provided via [Lando](https://github.com/lando/lando/), a Docker-based local tool to create projects using any language and technology, with pre-defined recipes for easily launching several of the most common stacks (including WordPress).
Building a Lando server with my plugin's requirements will take over 5 minutes but, once created, I can start the same instance again in just a few seconds.

I particularly like Lando because I can commit my plugin's required configuration in the repo (defined via a `yaml` file), so anyone can clone the repo, execute a command, and have the same development environment ready.

There are 2 different things that I need to test:

- The plugin's source code
- The generated WordPress .zip file

This is because the code in these 2 sets is different:

- Files not needed for production are removed from the .zip plugin, such as the JS source code for the WP editor blocks (shipping their `build` folder is already enough)
- Composer dependencies must be installed and shipped within the .zip plugin.
- These dependencies are those for PROD only, so we must make sure no code under `tests` is being referenced.

And in my plugin's case, there are a few additional differences:

- The source code is coded using PHP 8.1
- The .zip file is generated as a GitHub Actions artifact and, in the process, the source code is [transpiled down to PHP 7.1](https://graphql-api.com/blog/the-plugin-is-now-transpiled-from-php-80-to-71/) and [scoped](https://graphql-api.com/blog/graphql-api-for-wp-is-now-scoped-thanks-to-php-scoper/)

Putting it all together, I run my integration tests in three different combinations:

1. While developing the plugin: Using the source code, against a local webserver provided by Lando which runs PHP 8.1
2. Once I think the newly-developed code is ready: Using the generated .zip plugin, against a different local webserver provided by Lando which runs PHP 7.1
3. Before merging the PR in GitHub Actions: Using the generated .zip plugin, against several InstaWP instances, each of them with a different configuration of PHP+WP

Importantly, **all 3 combinations must receive the same inputs, and produce the same outputs**, and must (as much as possible) use the same configuration files to prepare their environments. A single test suite must work everywhere, without customizations or hacks.

In this blog post I'll explain how I've accomplished this for my WordPress plugin, the [GraphQL API for WordPress](https://graphql-api.com), and share a few tips that I discovered along the way.

(As a side note: I am just days away from releasing version `0.9` of the GraphQL API plugin, after _16 months of work_, and over _1000 PRs_ from _14700 commits_ 🙀. If you'd like to be notified of the upcoming release, please [watch the project in GitHub](https://github.com/leoloso/PoP) or [subscribe to the newsletter](https://graphql-api.com/newsletter/) <= no spam, only announcements.)

## 1st: Running Integration Tests on the PHP source code (on my development computer)

This is the stack I'm using:

- Lando
- [XDebug](https://xdebug.org/)
- [Guzzle](https://github.com/guzzle/guzzle)
- [PHPUnit](https://github.com/sebastianbergmann/phpunit/)
- [WP-CLI](https://wp-cli.org/)
- The WordPress export tool
- [Composer](https://getcomposer.org/)

I'll explain why and how I'm using these, and point to the appropriate source files on the repo.

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

The noteworthy elements here are:

- The local webserver will be available under `https://graphql-api.lndo.site`
- The common PHP configuration across all Lando webservers, under `shared/config/php.ini`, is defined once and referenced by all of them
- XDebug is enabled, but inactive by default; it is executed only when passing environment variable `XDEBUG_TRIGGER=1` (eg: executing command `XDEBUG_TRIGGER=1 vendor/bin/phpunit` )
- Two files define environment variables, but while `defaults.env` is commited to the repo, `defaults.local.env` is `.gitignore`d, so the latter contains my personal access tokens.
- The plugin code is mapped to its source code via `services > appserver > overrides > volumes`, so that changes to the source files are reflected immediately in the application in the webserver.

The last item is a deal breaker for me, because [the plugin's code is distributed into a multitude of independent packages](https://graphql-api.com/blog/why-to-support-cms-agnosticism-the-graphql-api-split-to-around-90-packages/), which are managed via Composer. When running `composer install` to install the plugin, all these packages would be normally copied under the `vendor/` folder, breaking the connection between source code and code deployed to the webserver. Thanks to volume overrides, Lando will read the source files instead. (I used other webservers, including [Local](https://getflywheel.com/design-and-wordpress-resources/toolbox/local-by-flywheel/) and [wp-env](https://www.npmjs.com/package/@wordpress/env), and I believe none of them offers this feature.)

### Guzzle and PHPUnit

Guzzle is a PHP library for executing HTTP requests. PHPUnit is the most popular library for executing unit tests. I use these 2 libraries to execute my integration tests, like this:

1. Execute a PHPUnit test, that uses Guzzle to send an HTTP request to the Lando webserver
2. Have the PHPUnit test analyze if the response is the expected one

![Architecture](/images/resources/integration-test-architecture.png)

The integration tests are placed under an `Integration` folder, so to run my integration tests I just execute:

```bash
vendor/bin/phpunit --filter=Integration
```

Guzzle supports logging the user in and keeping the state throughout the tests. I can then assert that the response is different for users with the `admin` or `contributor` roles. This is accomplished by using a "cookie jar", and sending a first HTTP request to log the user in, before executing the tests ([source code](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/layers/GraphQLAPIForWP/phpunit-packages/webserver-requests/tests/AbstractWebserverRequestTestCase.php#L39)):

```php
class WithUserLoggedInTest extends TestCase
{
  public static function setUpBeforeClass(): void
  {
    parent::setUpBeforeClass();
    static::setUpWebserverRequestTests();
  }

  protected static function setUpWebserverRequestTests(): void
  {
    $webserverDomain = getenv('INTEGRATION_TESTS_WEBSERVER_DOMAIN');
    $this->cookieJar = CookieJar::fromArray([], $webserverDomain);
    $this->client = new Client(['cookies' => true]);
    
    // Log the user into WordPress, and store the cookies under `$this->cookieJar`
    $response = $this->client->request(
      'POST',
      'https://' . $webserverDomain . '/wp-login.php',
      [
        'cookies' => $this->cookieJar,
        // Pass the user credentials
        'form_params' => [
          'log' => getenv('INTEGRATION_TESTS_AUTHENTICATED_ADMIN_USER_USERNAME'),
          'pwd' => getenv('INTEGRATION_TESTS_AUTHENTICATED_ADMIN_USER_PASSWORD'),
        ],
      ]
    );

    // Make sure the user was authenticated
    if (!static::validateUserAuthenticationSuccess()) {
      throw new RuntimeException('Authentication of the admin user did not succeed');
    }
  }

  protected static function validateUserAuthenticationSuccess(): bool
  {
    foreach ($this->cookieJar->getIterator() as $cookie) {
      if (str_starts_with($cookie->getName(), 'wordpress_logged_in_')) {
        return true;
      }
    }
    return false;
  }

  // ...
}
```

Please notice that the webserver domain `"graphql-api.lndo.site"` is not hardcoded, but is instead retrieved via the environment variable `INTEGRATION_TESTS_WEBSERVER_DOMAIN` (and same for the username and password). These env vars are defined in file `phpunit.xml.dist` with the config for the Lando development webserver ([source file](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/phpunit.xml.dist)):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit>
  <php>
    <env name="INTEGRATION_TESTS_WEBSERVER_DOMAIN" value="graphql-api.lndo.site"/>
    <env name="INTEGRATION_TESTS_AUTHENTICATED_ADMIN_USER_USERNAME" value="admin"/>
    <env name="INTEGRATION_TESTS_AUTHENTICATED_ADMIN_USER_PASSWORD" value="admin"/>
  </php>
</phpunit>
```

But now, I can also execute the integration tests against any of the other webservers very easily, and without having to modify any config file. For instance, once I have the InstaWP instance URL and admin credentials, I can execute the integration tests by doing:

```bash
$ INTEGRATION_TESTS_WEBSERVER_DOMAIN=bobo-green-star.instawp.xyz \
  INTEGRATION_TESTS_AUTHENTICATED_ADMIN_USER_USERNAME=adminPorulito \
  INTEGRATION_TESTS_AUTHENTICATED_ADMIN_USER_PASSWORD=fP816b42dVohEWYe \
  vendor/bin/phpunit --filter=Integration
```

This stack satisfies my requirements because, as my plugin provides a GraphQL server, interacting with the webserver via HTTP requests can already demonstrate if the plugin works as expected.

For instance, I send a GraphQL query to the single endpoint:

```graphql
{
  post(by: {id: 1}) {
    title
  }
}
```

And then I assert that the response matches the expectation:

```json
{
  "data": {
    "post": {
      "title": "Hello world!"
    }
  }
}
```

These are some of the use cases I'm currently testing (there are a few others):

- A request/response cycle for an API ([example test](https://github.com/leoloso/PoP/blob/a7c7f6df67084e2c1cc9bf60bafdc4eaed1bcd7c/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/AdminClientQueryExecutionFixtureWebserverRequestTest.php), executing [this GraphQL query](https://github.com/leoloso/PoP/blob/a7c7f6df67084e2c1cc9bf60bafdc4eaed1bcd7c/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/fixture-admin-client/introspection-query.gql) and matching it against [this response](https://github.com/leoloso/PoP/blob/a7c7f6df67084e2c1cc9bf60bafdc4eaed1bcd7c/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/fixture-admin-client/introspection-query.json))
- Enabling/Disabling the single endpoint or custom endpoint ([example test](https://github.com/leoloso/PoP/blob/a7c7f6df67084e2c1cc9bf60bafdc4eaed1bcd7c/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/DisabledEndpointWebserverRequestTest.php))
- Enabling/Disabling a module via the WP REST API, and then re-analyzing the response from the API ([example test](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/FixtureEnableDisableModuleWordPressAuthenticatedUserWebserverRequestTest.php))
- Configuring a module via the WP REST API, and then re-analyzing the response from the API ([example test](https://github.com/leoloso/PoP/blob/a7c7f6df67084e2c1cc9bf60bafdc4eaed1bcd7c/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/SettingsModifyPluginSettingsFixtureEndpointWebserverRequestTest.php))
- Enabling/Disabling a client (such as the GraphiQL client) and checking if it returns a 200 or 404 status code ([example test](https://github.com/leoloso/PoP/blob/a7c7f6df67084e2c1cc9bf60bafdc4eaed1bcd7c/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/ExposeGraphiQLClientOnCustomEndpointCPTBlockAttributesFixtureEndpointWebserverRequestTest.php))
- Checking that admin and non-admin users have different access permissions to the API ([example test](https://github.com/leoloso/PoP/blob/a7c7f6df67084e2c1cc9bf60bafdc4eaed1bcd7c/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/PostMutationPermissionsFixtureEndpointWebserverRequestTest.php))
- Executing the query via `GET` or `POST` ([example test](https://github.com/leoloso/PoP/blob/a7c7f6df67084e2c1cc9bf60bafdc4eaed1bcd7c/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/PassQueryViaURLParamQueryExecutionFixtureWebserverRequestTest.php))
- Passing URL parameters to persisted queries ([example test](https://github.com/leoloso/PoP/blob/master/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/PersistedQueryFixtureWebserverRequestTest.php))

This stack is not suitable for everything that can be tested. For instance, my plugin displays a module's documentation in a modal window in the wp-admin, but I'm not testing that this modal window is indeed opened after the user clicks on the corresponding link.

If I ever decided to test this or other similar concerns, then I'd consider introducing [CodeCeption](https://codeception.com/), which is better for executing and evaluating user interactions ([this guide on testing WooCommerce](https://deliciousbrains.com/automated-testing-woocommerce/) provides some good examples), and I'd also check out if [Pest](https://pestphp.com/) offers advantages over PHPUnit (as suggested in [this article on WordPress integration tests with Pest](https://madebydenis.com/wordpress-integration-tests-with-pest-php/)).

### WP-CLI, the WordPress export tool and Composer

Using WP-CLI is pretty much mandatory, as it provides several desired objectives:

- The automation of seeding data into the WordPress site
- Using a fixed set of data, always the same one for all environments

I am testing that the execution of a GraphQL query matches some expected response, and this response will depend directly on the data stored in the WordPress site. For instance, when I execute [this query](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/fixture-enable-disable-modules/graphqlapi_graphqlapi/schema-posts.gql):

```graphql
{
  posts(pagination: { limit: 3 }) {
    id
    title
  }
}
```

The response from the API, whether executed against any of the local Lando webservers or the InstaWP instance, [must be](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/layers/GraphQLAPIForWP/phpunit-packages/graphql-api-for-wp/tests/Integration/fixture-enable-disable-modules/graphqlapi_graphqlapi/schema-posts:enabled.json):

```json
{
    "data": {
        "posts": [
            {
                "id": 1,
                "title": "Hello world!"
            },
            {
                "id": 28,
                "title": "HTTP caching improves performance"
            },
            {
                "id": 25,
                "title": "Public or Private API mode, for extra security"
            }
        ]
    }
}
```

To manage this dataset and update it concerning new requirements, I am using the WordPress export tool to generate the file [`graphql-api-data.xml`](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/webservers/graphql-api-for-wp/assets/graphql-api-data.xml), which contains the set of data that I want to test. This method is very practical as it allows me to use the WordPress editor to create the data (which for my plugin mainly comes from a handful of CPTs), and the resulting WXR data file will be commited to the repo.

Then I use WP-CLI to import this file into the Lando webserver ([source code](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/webservers/graphql-api-for-wp/setup/import-data.sh)):

```bash
wp import /app/assets/graphql-api-data.xml --authors=create --path=/app/wordpress
```

To trigger the execution of this command, I could have Lando execute it automatically (under `services > appserver > run` in the Lando configuration file), but I prefer to satisfy it instead as a Composer script, stored in [`composer.json`](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/webservers/graphql-api-for-wp/composer.json#L50-L57). This has the advantage that I can then invoke the script will, and that it acts as documentation of all scripts I can execute.

For instance, script `"build-server"` builds the Lando webserver, and then invokes script `"install-site"` (which executes script [`setup.sh`](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/webservers/graphql-api-for-wp/setup/setup.sh) with the above WP-CLI command and several other things):

```json
{
  "scripts": {
    "build-server": [
      "lando init --source remote --remote-url https://wordpress.org/latest.tar.gz --recipe wordpress --webroot wordpress --name graphql-api-for-prod",
      "lando start",
      "@install-site"
    ],
    "install-site": "lando composer install-site-within-container",
    "install-site-within-container": "/bin/sh /app/setup/setup.sh"
  }
}
```

Now, if I run the integration test and cancel it before it is completed, it may alter the database in a way that breaks the upcoming test runs (for instance, executing the mutation `updatePost` needs to be reverted immediately after). As the local Lando webserver is a single instance, I need to regenerate the data to the original state. I could rebuild the webserver, but that takes a bit of time. Instead, I can simply reset the database via the `"reset-db"` script, and have it call `"install-site"` to re-install the WordPress site:

```json
{
  "scripts": {
    "reset-db": [
      "lando wp db reset --yes --path=wordpress",
      "@install-site"
    ]
  }
}
```

Finally, with Composer I can simplify executing the integration tests, just by running ([source code](https://github.com/leoloso/PoP/blob/083133316dda047bbca58bbfacf766e8c030b522/composer.json#L555)):

```bash
composer integration-test
```

## 2nd: Using Lando to run Integration Tests on the generated .zip WP plugin (on my development computer)

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

...


Stack:
  same as before, plus...
  Monorepo
    graphql-api-testing plugin
    at this stage, because Testing code can still be part of the source code, but I don't want it on the final graphql-api.zip plugin!!!!
  Talk:
    `composer integration-test-prod`
  From here, think of another blog post, about using:
    "GraphQL API PRO to download GitHub artifacts"


      Talk about creating another plugin to keep testing apart: "graphql-api-testing"
  Talk about setting-up the REST API in the testing plugin
    ModulesAdminRESTController

## 3rd: Using InstaWP and GitHub Actions to run Integration Tests on the generated .zip WP plugin (before merging the PR)

...


Stack:
  PHPUnit
  Guzzle
  Monorepo
    graphql-api-testing plugin
  GitHub Actions
  Nightly.link
  InstaWP


More ideas:
  Matrix with different configs of php/wp, but then can't use free account
  Each template receives version of php/wp at the beginning, so gotta recreate the process to populate them all
  It's easier paying and then having access to WP-CLI, but I don't
  So I have a .xml to import data, and I gotta manually edit some files, like wp-config, and that's it

Activate plugins WITHOUT the paid plan!
Create hack around Post Deployment?
  Have all the plugins already active in the DB from the template! hohoho

Import `graphql-api-data.xml` data into the InstaWP template
First delete all posts and pages!
Also import PRO `graphql-api-pro-data.xml` data!
Check "Hello world!", alright?

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

## Wrapping up

...

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








2 Items and 3 Subitems:
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

  Another useful one is using PestPHP (check out this [great guide by Denis Žoljom](https://madebydenis.com/wordpress-integration-tests-with-pest-php/)):
    

  As an alternative, can also use [CodeCeption](https://codeception.com/) (the folks at [Delicious Brains wrote some great guides about it](https://deliciousbrains.com/automated-api-testing-codeception-wordpress/))

	Guzzle also allows me to log-in to the WP site, so I can execute tests logged-in as the "admin" or "writer" and test that the Access Control works well
		The key is to use a cookie bag, so that after logging in the first request, all cookies are kept, and when the second request is sent the server has the user authenticated.
		Link to code



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


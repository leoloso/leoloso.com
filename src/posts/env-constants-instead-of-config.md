---
title: Using environment constants when installing WordPress (a.k.a. How to not hardcode wp-config.php)
metaDesc: A Composer script makes it easy to install WordPress. Find out all about it!
socialImage: https://leoloso.com/images/wordpress-logo.png
date: '2019-08-14'
tags:
  - wordpress
  - composer
  - wp-cli
  - github
  - project
---

I recently created project [Install WordPress through Composer and WP-CLI](https://github.com/leoloso/wp-install)  which fully installs WordPress through a script, without having to manually edit file `wp-config.php` to enter the database configuration and other variables during the installation process (more info on this on my [previous blog post](/posts/wp-install.md)). This is achieved through [WP-CLI](https://wp-cli.org/), a tool which provides commands to interact with WordPress directly from the command line (or through a script), allowing us to not have to log into the `wp-admin` anymore. It is so convenient!

What the script does is to take the required configuration values from environment variables (which must be set in advance) and then, dynamically, create file `wp-config.php`. Hence, we can install the project directly from our repository, and a unique repo can serve all of our environments (`DEV`, `STAGING`, `PROD`). Preferably, **our repos must never contain environment information**! This is one of the fundamental practices of the [Twelve Factor App](http://12factor.net/), which defines guidelines to make application deployments simpler, faster and more scalable.

To dynamically save the environment variable values in file `wp-config.php` the script uses the following WP-CLI command:

```bash
wp config set {constant_name} {constant_value}
```

Then, to fill in the database information, the user is required to set the following environment variables:

```bash
$ export DB_NAME={SITE_DB_NAME}
$ export DB_USER={SITE_DB_USER}
$ export DB_PASSWORD={SITE_DB_PASSWORD}
$ export DB_HOST={SITE_DB_HOST}
```

To add these values to file `wp-config.php`, the script executes:

```bash
wp config set DB_NAME $DB_NAME
wp config set DB_USER $DB_USER
wp config set DB_PASSWORD $DB_PASSWORD 
if [ -n "$DB_HOST" ]
then
    wp config set DB_HOST $DB_HOST
fi
```

The host information is optional, because by default it is set as `"localhost"` which is an acceptable value. Hence, the script must check if environment variable `$DB_HOST` was set or not. It does this through a bash script conditional, `if [ -n "$DB_HOST" ] then ... fi`, which means: if variable `$DB_HOST` is not empty, then execute the instructions between `then` and `fi`.

All other environment variables are mandatory, so the script must also validate that they have been set. It does this through the following bash script commands:

```bash
#!/bin/bash

# Flag to know if there are errors
ERROR_ENV_VARS=""

# Required for wp-config.php
if [ -z "$DB_NAME" ]
then
    ERROR_ENV_VARS="$ERROR_ENV_VARS\nDB_NAME"
fi
if [ -z "$DB_USER" ]
then
    ERROR_ENV_VARS="$ERROR_ENV_VARS\nDB_USER"
fi
if [ -z "$DB_PASSWORD" ]
then
    ERROR_ENV_VARS="$ERROR_ENV_VARS\nDB_PASSWORD"
fi

# If there are errors, return an error state
if [ -n "$ERROR_ENV_VARS" ]
then
    echo "Fatal error: The following environment variable(s) cannot be empty: $ERROR_ENV_VARS"
    echo "Terminating process."
    exit 1
fi
```

Notice the `exit 1` at the end of the script? Through that command, the script is interrupted (after displaying an error on the console) and it doesn't proceed to install WordPress.

To set the SALT keys we can also define environment constant for each of them, or ask WP-CLI to create and assign random values:

```bash
wp config shuffle-salts
```

And that's it! With a few bash script commands we are able to automate the whole WordPress installation process. Now, after the user enters the environment information, all that is needed is to execute:

```bash
$ composer create-project leoloso/wp-install
```

And voilà! A new WordPress site will be happily installed!
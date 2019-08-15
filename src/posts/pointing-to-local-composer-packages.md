---
title: Pointing to local Composer packages, to speed up development time
#socialImage: /images/composer.png
date: '2019-08-15'
tags:
  - composer
---

I love [Composer](https://getcomposer.org). This incredible tool has greatly simplified the dependency management of my project [PoP](https://github.com/leoloso/PoP), making it feasible to split the tens of thousands of lines of code into autonomous packages that depend on each other. Indeed, for several years PoP was not easy to install, and only insiders knew what could break and how to fix it (sadly, I was the only insider! That's why there is still only 1 contributor on the project to date). Thanks to Composer, that is not the case anymore, and a simple bash command line can install the whole project automatically. Such a lifesaver! 

(Btw, [PoP's migration to Composer](https://github.com/leoloso/PoP#codebase-migration) is still ongoing. If you are willing to become involved, it will be greatly appreciated 😀❤️.)

However, not everything in Composer shines. In particular, because Composer updates its package directory every 10 minutes or so, it can take a while to be able to update our projects using the latest version of our code (even if it is already available on the Git repo). In particular, when we are developing a functionality and we want to have another package use it, to test it, then waiting these 10 minutes can be very annoying. Too bad!

But there is some kind of solution, though. If your code is using the [PSR-4](https://www.php-fig.org/psr/psr-4) (or [PSR-0](https://www.php-fig.org/psr/psr-0)) autoloading feature (which it should!), then your `composer.json` file will have a section like this:

```javascript
{
    ...
    "autoload": {
        "psr-4": {
            "{YOUR_VENDOR_NAME}\\{YOUR_PACKAGE_NAME}\\": "src"
        }
    }
    ...
}
```

This line indicates where to find the source code for a given namespace. For instance, for package [PoP Engine](https://github.com/getpop/engine), the configuration is like this:

```javascript
{
    ...
    "autoload": {
        "psr-4": {
            "PoP\\Engine\\": "src"
        }
    }
    ...
}
```

Then, whenever the code references class `PoP\Engine\Component`, Composer attempts to load file `Component.php` located under the `src/` folder from package PoP Engine (which serves namespace `PoP\Engine`).

We can hack into this configuration, by overriding the folders for all the packages to test, pointing them to a folder in our local drive where the recently-developed code is. This way, Composer will load the file directly from the development folder, instead of using the version downloaded from the [packagist.org](https://packagist.org) directory. 

For instance, a project "My Project" (stored in local folder `~/GitHub-Projects/my-project/`) depending on package "PoP Engine" (stored in local folder `~/GitHub-Libraries/getpop/engine/`) can immediately test its code by adding this configuration on the project's `composer.json` file:

```javascript
{
    ...
    "autoload": {
        "psr-4": {
            "PoP\\Engine\\": "../GitHub-Libraries/getpop/engine/src"
        }
    }
    ...
}
```

And then regenerating Composer's autoloader file:

```bash
$ composer dumpautoload
```

And voilà, no more waiting!
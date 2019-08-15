---
title: The benefits of coding with back-end components
#socialImage: /images/components.png
date: '2019-08-23'
tags:
  - pop
  - components
  - back-end
  - php
---

So, if I mention the keyword "components", what comes to your mind? React? Vue? Bootstrap maybe? What about anything PHP-based, living in the back-end? No, nothing? Nothing at all?

!["Annoyed"](/images/annoyed.jpg "It's annoying, isn't it?")

The concept of the component has been incredibly useful to the modern web, enabling developers to progressively create and manage small pieces of code that can depend on each other to create the whole site. As evidence, the popularity of component-based JavaScript libraries/frameworks, such as React and Vue, has risen to stratospheric levels. 

It is a wonder, then, how nobody has implemented the component concept for the back-end, as if it could never exist there! Well, not truly nobody... there is one player in town doing something about it...

## PoP makes justice to back-end components

[PoP](https://github.com/leoloso/PoP) is my own project, on which I've been working on for several years now. At its current stage, I call it an "API + component model + framework for building sites" (as it codebase is transformed and matures, its range of possibilites is widened, and so its description keeps changing).

PoP implements components! The way it has been designed, each component is implemented spanning both back-end and front-end, depending on the actual responsibility:

<table>
<thead>
<tr><th>Back-end (PHP)</th><th>Front-end</th></tr>
</thead>
<tbody>
<tr valign="top"><td>
<ul>
<li>Component hierarchy</li>
<li>Data loading</li>
<li>Configuration</li>
<li>Props</li>
</ul>
</td><td>
<ul>
<li>Styles (CSS)</li>
<li>View (Handlebars templates)</li>
<li>Reactivity (vanilla JavaScript)</li>
</ul>
</td></tr>
</tbody>
</table>

This splitting of responsibilities conveys a progressive/resilient nature to the component, which has several benefits:

- It will always work (even if JavaScript is disabled)
- It can be re-used across different contexts (for instance, the same component can be rendered for a website and for email, even though the resulting HTML code is different)
- It provides isomorphism of code: Because the view is implemented through [Handlebars](https://handlebarsjs.com/) templates, which can be loaded in the client but also in the server (through PHP library [LightnCandy](https://github.com/zordius/lightncandy)), then the same code works on client/server-side
- It can be easily converted into a JAMstack site: since the component hierarchy and configuration can be exported as JSON files, these can be loaded in the client too (props are discarded after being used, and the data layer is accessed through an API)

From my own experience, splitting a component into different parts, each of them tackling a different responsibility, is extremely clean, making it a breeze to produce performing code that is easy to maintain. After coding this way, I find it very difficult to use frameworks that require to code the webpage from scratch each time, or where the whole and the parts are intertwined and not properly decoupled (as when using partials accessing variables defined in some other piece of code, somewhere else in the project). 

If the approach I've just illustrated looks appealing to you, check out [PoP](https://github.com/leoloso/PoP), play with it, and let me know how it goes!
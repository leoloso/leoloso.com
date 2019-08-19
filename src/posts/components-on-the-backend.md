---
title: Bringing the back of the front-end back to the back-end
socialImage: https://leoloso.com/images/lego.png
date: '2020-08-23'
tags:
  - pop
  - components
  - back-end
  - front-end
  - full-stack
  - php
---

In what Chris Coyier calls “[the great divide](https://css-tricks.com/the-great-divide/)”, front-end developers and designers have taken over so many tasks from building the website, that they could be directly called "full-stack developers" and the role of the front-end developer/designer cannot fit a single, specific role anymore. Hence, many tasks which [once upon a time were implemented on the back-end](https://full-stack.netlify.com/) (such as site-level architecture, routing, state management, and others) are now responsibility of the front-end. Likewise, Brad Frost [points out](http://bradfrost.com/blog/post/frontend-design-react-and-a-bridge-over-the-great-divide/) that the front-end can now be divided into the “back of the front-end” and the “front of the front-end”. 

This shift of responsibilities from the back to the front-end are due, in great part, to the outstanding success of components. The concept of the component has been incredibly useful to the modern web, enabling developers to progressively create and manage small pieces of code that can depend on each other to create the whole site. As evidence, the popularity of component-based JavaScript libraries/frameworks, such as React and Vue, has risen to stratospheric levels. 

Components seem to have been implemented in the front-end only. It is a wonder how nobody has implemented the component concept for the back-end yet, as if it could never exist there! 

Well, not anymore! Somebody is doing something to remediate this situation 😬.

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
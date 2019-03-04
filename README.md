# Any Elements

Lightweight component library built to enable custom elements-like features and API for any selectors you desire.

## Features

- Class-based components.
- Automatic upgrading of existing and dynamically added elements.
- Ability to target elements with any valid CSS selector.
- Support for `connectedCallback`, `disconnectedCallback`, and `attributeChangedCallback` lifecycle hooks.
- Lazy loading of components just when they are needed.
- Distributed in multiple formats including CJS, UMD & ESM
- **Less then 1KB minified and gzipped**.

## Installation

```
npm install --save any-elements
```

## Usage

```javascript
import AnyElements from "any-elements";

class MyComponent {
  constructor() {
    console.log("I appeared on the page!");
  }
}

AnyElements.define("my-component", MyComponent, { selector: ".my-component" });
```

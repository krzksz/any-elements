# Any Elements

Lightweight component library built to enable custom elements-like features and API for any selectors you desire.

## Features

- Class-based components.
- Automatic upgrading of existing and dynamically added elements.
- Ability to target elements with any valid CSS selector.
- Support for `connected`, `disconnected`, and `attributeChanged` lifecycle hooks.
- Automatic cleanup of registered event listeners using `attachEvent` method.
- Lazy loading of components just when they are needed.
- Distributed in multiple formats including CJS, UMD & ESM
- **Less then 1KB minified and gzipped**.

## Installation

```
npm install --save any-elements
```

## Usage

### Registering a component

```javascript
import { Registry, Component } from "any-elements";

class MyComponent extends Component {}

Registry.define("my-component", MyComponent, { selector: ".my-component" });
```

### Lifecycle methods

```javascript
import { Registry, Component } from "any-elements";

class MyComponent extends Component {
  connected() {
    console.log("I appeared on the page!");
  }
  disconnected() {
    console.log("I got removed from the page!");
  }
}

Registry.define("my-component", MyComponent, { selector: ".my-component" });
```

### Listening for attribute changes

```javascript
import { Registry, Component } from "any-elements";

class MyComponent extends Component {
  observedAttributes() {
    return ["baz"];
  }
  attributeChanged(name, oldValue, newValue) {
    console.log('Attribute "baz" has changed.');
  }
}

Registry.define("my-component", MyComponent, { selector: ".my-component" });
```

### Attaching event listeners

```javascript
import { Registry, Component } from "any-elements";

class MyComponent extends Component {
  connected() {
    this.attachEvent("click", function() {
      console.log("My element was clicked!");
    });
  }
}

Registry.define("my-component", MyComponent, { selector: ".my-component" });
```

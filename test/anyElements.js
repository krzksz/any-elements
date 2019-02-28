/* global expectAsync */

const until = condition => {
  const check = (condition, resolve) => {
    if (!condition()) {
      setTimeout(() => check(condition, resolve), 50);
    } else {
      resolve();
    }
  };
  return new Promise(resolve => check(condition, resolve));
};

const anyElements = window.anyElements;

if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

describe("anyElements", () => {
  afterEach(() => {
    if (anyElements.get("foo-bar")) {
      anyElements.undefine("foo-bar");
    }
    document.body.innerHTML = "";
  });

  it("is an object", () => {
    expect(typeof anyElements).toBe("object");
  });

  describe("define method", () => {
    it("is a function", () => {
      expect(typeof anyElements.define).toBe("function");
    });

    it("throws when name is not provided", () => {
      expect(() => anyElements.define()).toThrow();
    });

    it("throws when name contains uppercase letters", () => {
      expect(() => anyElements.define("fOo-bAr")).toThrow();
    });

    it("throws when name doesn't start with a letter", () => {
      expect(() => anyElements.define("-foo-bar")).toThrow();
    });

    it("throws when name doesn't contain a hyphen", () => {
      expect(() => anyElements.define("foobar")).toThrow();
    });

    it("throws DOMException when component is already defined", () => {
      anyElements.define("foo-bar", {});

      expect(() => anyElements.define("foo-bar", {})).toThrow();
    });

    it("resolves promises from whenDefined", async () => {
      const promise = Promise.all([
        anyElements.whenDefined("foo-bar"),
        anyElements.whenDefined("foo-bar"),
      ]);
      anyElements.define("foo-bar", {});

      await expectAsync(promise).toBeResolved();
    });
  });

  describe("get method", () => {
    it("is a function", () => {
      expect(typeof anyElements.get).toBe("function");
    });

    it("returns undefined for undefined component", () => {
      expect(anyElements.get("foo-bar")).toBe(undefined);
    });

    it("returns constructor object for defined component", () => {
      const constructor = {};
      anyElements.define("foo-bar", constructor);
      expect(anyElements.get("foo-bar")).toBe(constructor);
    });
  });

  describe("undefine method", () => {
    it("is a function", () => {
      expect(typeof anyElements.undefine).toBe("function");
    });

    it("does nothing when component is not defined", () => {
      expect(anyElements.undefine("foo-bar")).toBe(undefined);
    });

    it("undefines component with given name", () => {
      anyElements.define("foo-bar", {});
      anyElements.undefine("foo-bar");

      expect(() => anyElements.define("foo-bar", {})).not.toThrowError();
    });
  });

  describe("whenDefined method", () => {
    it("is a function", () => {
      expect(typeof anyElements.whenDefined).toBe("function");
    });

    it("returns a promise", () => {
      expect(anyElements.whenDefined("foo-bar") instanceof Promise).toBe(true);
    });

    it("resolves returned promise when constructor was defined", async () => {
      anyElements.define("foo-bar", {});
      const promise = anyElements.whenDefined("foo-bar");

      await expectAsync(promise).toBeResolved();
    });

    it("resolves returned promise when constructor gets defined", async () => {
      const promise = anyElements.whenDefined("foo-bar");
      anyElements.define("foo-bar", {});

      await expectAsync(promise).toBeResolved();
    });
  });

  describe("get method", () => {
    it("is a function", () => {
      expect(typeof anyElements.get).toBe("function");
    });
  });

  it("calls connectedCallback when defined", async () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    let connected = false;
    const constructor = {
      connectedCallback() {
        connected = true;
      },
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await expectAsync(until(() => connected))
      .withContext(
        "connectedCallback was not called for element matching the selector"
      )
      .toBeResolved();
  });

  it("calls connectedCallback for nested components", async () => {
    const parent = document.createElement("div");
    const child = document.createElement("div");
    parent.appendChild(child);
    document.body.appendChild(parent);
    let connectedCalls = 0;
    const constructor = {
      connectedCallback() {
        connectedCalls++;
      },
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await expectAsync(until(() => connectedCalls === 2))
      .withContext("connectedCallback was not called for both components")
      .toBeResolved();
  });

  it("extends existing object with new properties", async () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    let connected = false;
    const constructor = {
      connectedCallback() {
        connected = true;
      },
      fooBar: "foo-bar",
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await until(() => connected);
    expect(element.fooBar).toBe(constructor.fooBar);
  });

  it("provided constructor parameter can be a function returning an object", async () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    let connected = false;
    const constructor = () => {
      return {
        connectedCallback() {
          connected = true;
        },
      };
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await until(() => connected);
  });

  it("provided constructor parameter can be a function returning a promise", async () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    let connected = false;
    const constructor = () =>
      Promise.resolve({
        connectedCallback() {
          connected = true;
        },
      });
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await until(() => connected);
  });

  it("extends existing object with new methods", async () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    let connected = false;
    const constructor = {
      connectedCallback() {
        connected = true;
      },
      fooBar() {},
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await until(() => connected);
    expect(typeof element.fooBar).toBe("function");
  });

  it("automatically binds new methods to element object", async () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    let connected = false;
    const constructor = {
      connectedCallback() {
        connected = true;
      },
      fooBar() {
        return this;
      },
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await until(() => connected);
    expect(element.fooBar()).toBe(element);
  });

  it("calls disconnectedCallback when defined", async () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    let connected = false;
    let disconnected = false;
    const constructor = {
      connectedCallback() {
        connected = true;
      },
      disconnectedCallback() {
        disconnected = true;
      },
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await until(() => connected);
    document.body.removeChild(element);
    await expectAsync(until(() => disconnected))
      .withContext(
        "disconnectedCallback was not called after element was removed"
      )
      .toBeResolved();
  });

  it("calls disconnectedCallback for nested components", async () => {
    const parent = document.createElement("div");
    const child = document.createElement("div");
    parent.appendChild(child);
    document.body.appendChild(parent);
    let connectedCount = 0;
    let disconnectedCount = 0;
    const constructor = {
      connectedCallback() {
        connectedCount++;
      },
      disconnectedCallback() {
        disconnectedCount++;
      },
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await until(() => connectedCount === 2);
    document.body.removeChild(parent);
    await expectAsync(until(() => disconnectedCount === 2))
      .withContext(
        "disconnectedCallback was not called twice after parent was removed"
      )
      .toBeResolved();
  });

  it("calls attributeChangedCallback when observedAttributes is defined", async () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    let connected = false;
    let attributesChanged = false;
    const constructor = {
      connectedCallback() {
        connected = true;
      },
      observedAttributes() {
        return ["foo-bar"];
      },
      attributeChangedCallback: (name, oldValue, newValue) => {
        attributesChanged = { name, oldValue, newValue };
      },
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await until(() => connected);
    element.setAttribute("foo-bar", "foo-baz");
    await expectAsync(
      until(() => {
        return (
          attributesChanged.name === "foo-bar" &&
          attributesChanged.oldValue === null &&
          attributesChanged.newValue === "foo-baz"
        );
      })
    )
      .withContext(
        "attributeChangedCallback was not called after attributes change"
      )
      .toBeResolved();
  });

  it("doesn't call attributeChangedCallback when observedAttributes is not defined", async done => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    let connected = false;
    let attributesChanged = false;
    const constructor = {
      connectedCallback() {
        connected = true;
      },
      attributeChangedCallback() {
        attributesChanged = true;
      },
    };
    anyElements.define("foo-bar", constructor, { selector: "div" });

    await until(() => connected);
    element.setAttribute("foo-bar", "foo-bar");
    setTimeout(() => {
      expect(attributesChanged).toBe(false);
      done();
    }, 100);
  });
});

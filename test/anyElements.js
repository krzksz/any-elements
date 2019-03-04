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

const AnyElements = window.AnyElements;

if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

describe("AnyElements", () => {
  afterEach(() => {
    if (AnyElements.get("foo-bar")) {
      AnyElements.undefine("foo-bar");
    }
    document.body.innerHTML = "";
  });

  it("is an object", () => {
    expect(typeof AnyElements).toBe("object");
  });

  describe("define method", () => {
    it("is a function", () => {
      expect(typeof AnyElements.define).toBe("function");
    });

    it("throws when name is not provided", () => {
      expect(() => AnyElements.define()).toThrow();
    });

    it("throws when name contains uppercase letters", () => {
      expect(() => AnyElements.define("fOo-bAr")).toThrow();
    });

    it("throws when name doesn't start with a letter", () => {
      expect(() => AnyElements.define("-foo-bar")).toThrow();
    });

    it("throws when name doesn't contain a hyphen", () => {
      expect(() => AnyElements.define("foobar")).toThrow();
    });

    it("throws DOMException when component is already defined", () => {
      AnyElements.define("foo-bar", {});

      expect(() => AnyElements.define("foo-bar", {})).toThrow();
    });

    it("resolves promises from whenDefined", async () => {
      const promise = Promise.all([
        AnyElements.whenDefined("foo-bar"),
        AnyElements.whenDefined("foo-bar"),
      ]);
      AnyElements.define("foo-bar", {});

      await expectAsync(promise).toBeResolved();
    });
  });

  describe("get method", () => {
    it("is a function", () => {
      expect(typeof AnyElements.get).toBe("function");
    });

    it("returns undefined for undefined component", () => {
      expect(AnyElements.get("foo-bar")).toBe(undefined);
    });

    it("returns constructor for component defined with constructor", () => {
      class FooBar {}
      AnyElements.define("foo-bar", FooBar);
      expect(AnyElements.get("foo-bar")).toBe(FooBar);
    });

    it("returns function for component defined with function", () => {
      const fooBar = () => class FooBar {};
      AnyElements.define("foo-bar", fooBar);
      expect(AnyElements.get("foo-bar")).toBe(fooBar);
    });

    it("returns promise for component defined with promise", () => {
      const fooBar = () => Promise.resolve(class FooBar {});
      AnyElements.define("foo-bar", fooBar);
      expect(AnyElements.get("foo-bar")).toBe(fooBar);
    });
  });

  describe("undefine method", () => {
    it("is a function", () => {
      expect(typeof AnyElements.undefine).toBe("function");
    });

    it("does nothing when component is not defined", () => {
      expect(AnyElements.undefine("foo-bar")).toBe(undefined);
    });

    it("undefines component with given name", () => {
      AnyElements.define("foo-bar", class FooBar {});
      AnyElements.undefine("foo-bar");

      expect(() =>
        AnyElements.define("foo-bar", class FooBar {})
      ).not.toThrowError();
    });
  });

  describe("whenDefined method", () => {
    it("is a function", () => {
      expect(typeof AnyElements.whenDefined).toBe("function");
    });

    it("returns a promise", () => {
      expect(AnyElements.whenDefined("foo-bar") instanceof Promise).toBe(true);
    });

    it("resolves returned promise when constructor was defined", async () => {
      AnyElements.define("foo-bar", class FooBar {});
      const promise = AnyElements.whenDefined("foo-bar");

      await expectAsync(promise).toBeResolved();
    });

    it("resolves returned promise when constructor gets defined", async () => {
      const promise = AnyElements.whenDefined("foo-bar");
      AnyElements.define("foo-bar", class FooBar {});

      await expectAsync(promise).toBeResolved();
    });
  });

  describe("get method", () => {
    it("is a function", () => {
      expect(typeof AnyElements.get).toBe("function");
    });
  });

  it("calls connectedCallback when defined", async () => {
    const element = document.createElement("foo-bar");
    document.body.appendChild(element);
    let called = false;
    class FooBar {
      connectedCallback() {
        called = true;
      }
    }
    AnyElements.define("foo-bar", FooBar);

    await expectAsync(until(() => called))
      .withContext(
        "connectedCallback was not called for element matching the selector"
      )
      .toBeResolved();
  });

  it("calls connectedCallback when defined with custom selector", async () => {
    const element = document.createElement("div");
    element.classList.add("foo-bar");
    document.body.appendChild(element);
    let called = false;
    class FooBar {
      connectedCallback() {
        called = true;
      }
    }
    AnyElements.define("foo-bar", FooBar, { selector: ".foo-bar" });

    await expectAsync(until(() => called)).toBeResolved();
  });

  it("calls connectedCallback for nested components", async () => {
    const parent = document.createElement("foo-bar");
    const child = document.createElement("foo-bar");
    parent.appendChild(child);
    document.body.appendChild(parent);
    let called = 0;
    class FooBar {
      connectedCallback() {
        called++;
      }
    }
    AnyElements.define("foo-bar", FooBar);

    await expectAsync(until(() => called === 2)).toBeResolved();
  });

  it("adds $any property to the element pointing to component instance", async () => {
    const element = document.createElement("foo-bar");
    document.body.appendChild(element);
    let constructed = false;
    class FooBar {
      constructor() {
        constructed = true;
      }
    }
    AnyElements.define("foo-bar", FooBar);

    await until(() => constructed);
    expect(element.$any instanceof FooBar).toBe(true);
  });

  it("provided constructor parameter can be a function returning a promise", async () => {
    const element = document.createElement("foo-bar");
    document.body.appendChild(element);
    let called = false;
    AnyElements.define(
      "foo-bar",
      () =>
        Promise.resolve(
          class FooBar {
            constructor() {
              called = true;
            }
          }
        ),
      { lazy: true }
    );

    await until(() => called);
  });

  it("calls disconnectedCallback when defined", async () => {
    const element = document.createElement("foo-bar");
    document.body.appendChild(element);
    let constructed = false;
    let disconnected = false;
    class FooBar {
      constructor() {
        constructed = true;
      }
      disconnectedCallback() {
        disconnected = true;
      }
    }
    AnyElements.define("foo-bar", FooBar);

    await until(() => constructed);
    document.body.removeChild(element);
    await expectAsync(until(() => disconnected)).toBeResolved();
  });

  it("calls disconnectedCallback for nested components", async () => {
    const parent = document.createElement("foo-bar");
    const child = document.createElement("foo-bar");
    parent.appendChild(child);
    document.body.appendChild(parent);

    let constructed = 0;
    let disconnected = 0;

    class FooBar {
      constructor() {
        constructed++;
      }
      disconnectedCallback() {
        disconnected++;
      }
    }

    AnyElements.define("foo-bar", FooBar);

    await until(() => constructed === 2);
    document.body.removeChild(parent);
    await expectAsync(until(() => disconnected === 2)).toBeResolved();
  });

  it("calls attributeChangedCallback when observedAttributes is defined", async () => {
    const element = document.createElement("foo-bar");
    document.body.appendChild(element);

    let constructed = false;
    let attributesChanged = false;

    class FooBar {
      connectedCallback() {
        constructed = true;
      }
      observedAttributes() {
        return ["baz"];
      }
      attributeChangedCallback(name, oldValue, newValue) {
        attributesChanged = { name, oldValue, newValue };
      }
    }
    AnyElements.define("foo-bar", FooBar);

    await until(() => constructed);
    element.setAttribute("baz", "foo-baz");
    await expectAsync(
      until(() => {
        return (
          attributesChanged.name === "baz" &&
          attributesChanged.oldValue === null &&
          attributesChanged.newValue === "foo-baz"
        );
      })
    ).toBeResolved();
  });

  it("doesn't call attributeChangedCallback when observedAttributes is not defined", async done => {
    const element = document.createElement("foo-bar");

    document.body.appendChild(element);
    let constructed = false;
    let attributesChanged = false;

    class FooBar {
      connectedCallback() {
        constructed = true;
      }
      attributeChangedCallback(name, oldValue, newValue) {
        attributesChanged = { name, oldValue, newValue };
      }
    }
    AnyElements.define("foo-bar", FooBar);

    await until(() => constructed);
    element.setAttribute("foo-bar", "foo-bar");
    setTimeout(() => {
      expect(attributesChanged).toBe(false);
      done();
    }, 100);
  });
});

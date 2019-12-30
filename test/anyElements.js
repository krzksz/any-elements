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
const Registry = AnyElements.Registry;
const Component = AnyElements.Component;

if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

describe("AnyElements", () => {
  describe("registry", () => {
    afterEach(() => {
      if (Registry.get("foo-bar")) {
        Registry.undefine("foo-bar");
      }
      document.body.innerHTML = "";
    });

    it("is an object", () => {
      expect(typeof Registry).toBe("object");
    });

    describe("define method", () => {
      it("is a function", () => {
        expect(typeof Registry.define).toBe("function");
      });

      it("throws when name is not provided", () => {
        expect(() => Registry.define()).toThrow();
      });

      it("throws when name contains uppercase letters", () => {
        expect(() => Registry.define("fOo-bAr")).toThrow();
      });

      it("throws when name doesn't start with a letter", () => {
        expect(() => Registry.define("-foo-bar")).toThrow();
      });

      it("throws when name doesn't contain a hyphen", () => {
        expect(() => Registry.define("foobar")).toThrow();
      });

      it("resolves promises from whenDefined", async () => {
        const promise = Promise.all([
          Registry.whenDefined("foo-bar"),
          Registry.whenDefined("foo-bar"),
        ]);
        Registry.define("foo-bar", {});

        await expectAsync(promise).toBeResolved();
      });
    });

    describe("get method", () => {
      it("is a function", () => {
        expect(typeof Registry.get).toBe("function");
      });

      it("returns undefined for undefined component", () => {
        expect(Registry.get("foo-bar")).toBe(undefined);
      });

      it("returns constructor for component defined with constructor", () => {
        class FooBar extends Component {}
        Registry.define("foo-bar", FooBar);
        expect(Registry.get("foo-bar")).toBe(FooBar);
      });

      it("returns function for component defined with function", () => {
        const fooBar = () => class FooBar extends Component {};
        Registry.define("foo-bar", fooBar);
        expect(Registry.get("foo-bar")).toBe(fooBar);
      });

      it("returns promise for component defined with promise", () => {
        const fooBar = () => Promise.resolve(class FooBar extends Component {});
        Registry.define("foo-bar", fooBar);
        expect(Registry.get("foo-bar")).toBe(fooBar);
      });
    });

    describe("undefine method", () => {
      it("is a function", () => {
        expect(typeof Registry.undefine).toBe("function");
      });

      it("does nothing when component is not defined", () => {
        expect(Registry.undefine("foo-bar")).toBe(undefined);
      });

      it("undefines component with given name", () => {
        Registry.define("foo-bar", class FooBar extends Component {});
        Registry.undefine("foo-bar");

        expect(() =>
          Registry.define("foo-bar", class FooBar extends Component {})
        ).not.toThrowError();
      });
    });

    describe("whenDefined method", () => {
      it("is a function", () => {
        expect(typeof Registry.whenDefined).toBe("function");
      });

      it("returns a promise", () => {
        expect(Registry.whenDefined("foo-bar") instanceof Promise).toBe(true);
      });

      it("resolves returned promise when constructor was defined", async () => {
        Registry.define("foo-bar", class FooBar extends Component {});
        const promise = Registry.whenDefined("foo-bar");

        await expectAsync(promise).toBeResolved();
      });

      it("resolves returned promise when constructor gets defined", async () => {
        const promise = Registry.whenDefined("foo-bar");
        Registry.define("foo-bar", class FooBar extends Component {});

        await expectAsync(promise).toBeResolved();
      });
    });

    describe("get method", () => {
      it("is a function", () => {
        expect(typeof Registry.get).toBe("function");
      });
    });

    it("calls connected when defined", async () => {
      const element = document.createElement("foo-bar");
      document.body.appendChild(element);
      let connected = false;
      class FooBar extends Component {
        connected() {
          connected = true;
        }
      }
      Registry.define("foo-bar", FooBar);

      await expectAsync(until(() => connected))
        .withContext(
          "connected was not called for element matching the selector"
        )
        .toBeResolved();
    });

    it("passes options to a component", async () => {
      const element = document.createElement("foo-bar");
      document.body.appendChild(element);
      let options = { selector: "foo-bar" };
      let passsedOptions = null;
      class FooBar extends Component {
        constructor({ node, name, options }) {
          super({ node, name, options });
          passsedOptions = this.options;
        }
      }
      Registry.define("foo-bar", FooBar, options);

      await expectAsync(until(() => passsedOptions)).toBeResolved();
      expect(options).toEqual(passsedOptions);
    });

    it("extends default options with passed ones", async () => {
      const element = document.createElement("foo-bar");
      document.body.appendChild(element);
      let options = { default: false };
      class FooBar extends Component {
        get options() {
          return { default: true };
        }

        constructor(node, name, options) {
          super(node, name, options);
          options = this.options;
        }
      }
      Registry.define("foo-bar", FooBar, options);

      await expectAsync(until(() => options)).toBeResolved();
      expect(options.default).toBe(false);
    });

    it("calls connected when defined with custom selector", async () => {
      const element = document.createElement("div");
      element.classList.add("foo-bar");
      document.body.appendChild(element);
      let connected = false;
      class FooBar extends Component {
        connected() {
          connected = true;
        }
      }
      Registry.define("foo-bar", FooBar, { selector: ".foo-bar" });

      await expectAsync(until(() => connected)).toBeResolved();
    });

    it("calls connected for nested components", async () => {
      const parent = document.createElement("foo-bar");
      const child = document.createElement("foo-bar");
      parent.appendChild(child);
      document.body.appendChild(parent);
      let called = 0;
      class FooBar extends Component {
        connected() {
          called++;
        }
      }
      Registry.define("foo-bar", FooBar);

      await expectAsync(until(() => called === 2)).toBeResolved();
    });

    it("adds $any property to the element pointing to component instance", async () => {
      const element = document.createElement("foo-bar");
      document.body.appendChild(element);
      let connected = false;
      class FooBar extends Component {
        connected() {
          connected = true;
        }
      }
      Registry.define("foo-bar", FooBar);

      await until(() => connected);
      expect(element.$any instanceof FooBar).toBe(true);
    });

    it("provided constructor parameter can be a function returning a promise", async () => {
      const element = document.createElement("foo-bar");
      document.body.appendChild(element);
      let connected = false;
      Registry.define("foo-bar", () =>
        Promise.resolve(
          class FooBar extends Component {
            connected() {
              connected = true;
            }
          }
        )
      );

      await until(() => connected);
    });

    it("calls disconnected when defined", async () => {
      const element = document.createElement("foo-bar");
      document.body.appendChild(element);
      let connected = false;
      let disconnected = false;
      class FooBar extends Component {
        connected() {
          connected = true;
        }
        disconnected() {
          disconnected = true;
        }
      }
      Registry.define("foo-bar", FooBar);

      await until(() => connected);
      document.body.removeChild(element);
      await expectAsync(until(() => disconnected)).toBeResolved();
    });

    it("calls disconnected for nested components", async () => {
      const parent = document.createElement("foo-bar");
      const child = document.createElement("foo-bar");
      parent.appendChild(child);
      document.body.appendChild(parent);

      let connected = 0;
      let disconnected = 0;

      class FooBar extends Component {
        connected() {
          connected++;
        }
        disconnected() {
          disconnected++;
        }
      }

      Registry.define("foo-bar", FooBar);

      await until(() => connected === 2);
      document.body.removeChild(parent);
      await expectAsync(until(() => disconnected === 2)).toBeResolved();
    });

    it("calls attributeChanged when observedAttributes is defined", async () => {
      const element = document.createElement("foo-bar");
      document.body.appendChild(element);

      let connected = false;
      let attributeChanged = false;

      class FooBar extends Component {
        connected() {
          connected = true;
        }
        observedAttributes() {
          return ["baz"];
        }
        attributeChanged(name, oldValue, newValue) {
          attributeChanged = { name, oldValue, newValue };
        }
      }
      Registry.define("foo-bar", FooBar);

      await until(() => connected);
      element.setAttribute("baz", "foo-baz");
      await expectAsync(
        until(() => {
          return (
            attributeChanged.name === "baz" &&
            attributeChanged.oldValue === null &&
            attributeChanged.newValue === "foo-baz"
          );
        })
      ).toBeResolved();
    });

    it("doesn't call attributeChanged when observedAttributes is not defined", async done => {
      const element = document.createElement("foo-bar");

      document.body.appendChild(element);
      let connected = false;
      let attributeChanged = false;

      class FooBar extends Component {
        connected() {
          connected = true;
        }
        attributeChanged(name, oldValue, newValue) {
          attributeChanged = { name, oldValue, newValue };
        }
      }
      Registry.define("foo-bar", FooBar);

      await until(() => connected);
      element.setAttribute("foo-bar", "foo-bar");
      setTimeout(() => {
        expect(attributeChanged).toBe(false);
        done();
      }, 100);
    });
  });

  describe("component", () => {
    it("is a function", () => {
      expect(typeof Component).toBe("function");
    });

    it("can be constructed", () => {
      const node = document.createElement("div");
      const name = "foo-bar";
      expect(() => new Component({ node, name })).not.toThrowError();
    });

    it("implements observedAttributes method", () => {
      expect(typeof Component.prototype.observedAttributes).toBe("function");
    });

    it("observedAttributes method returns an empty value by default", () => {
      const node = document.createElement("div");
      const name = "foo-bar";
      const component = new Component({ node, name });
      expect(component.observedAttributes()).toEqual(undefined);
    });

    it("implements connected method", () => {
      expect(typeof Component.prototype.connected).toBe("function");
    });

    it("implements disconnected method", () => {
      expect(typeof Component.prototype.disconnected).toBe("function");
    });

    describe("attachEvent method", () => {
      it("is defined", () => {
        expect(typeof Component.prototype.attachEvent).toBe("function");
      });

      it("attaches event to component's node", () => {
        const node = document.createElement("div");
        const name = "foo-bar";
        const component = new Component({ node, name });
        const eventName = "event";
        const listener = jasmine.createSpy(eventName);
        const event = new Event(eventName);

        component.attachEvent(eventName, listener);
        node.dispatchEvent(event);

        expect(listener).toHaveBeenCalled();
      });

      it("calls event to with component's node as a target", () => {
        const node = document.createElement("div");
        const name = "foo-bar";
        const component = new Component({ node, name });
        const eventName = "event";
        const event = new Event(eventName);

        component.attachEvent(eventName, event =>
          expect(event.target).toBe(node)
        );
        node.dispatchEvent(event);
      });

      it("passes options to event listener for component", done => {
        const parent = document.createElement("div");
        const node = document.createElement("p");
        node.appendChild(parent);

        const name = "foo-bar";
        const component = new Component({ node, name });
        const eventName = "event";
        const parentListener = jasmine.createSpy("parent");
        const nodeListener = jasmine.createSpy("node");
        const event = new Event(eventName);

        parent.addEventListener(event, parentListener, { capture: true });

        component.attachEvent(eventName, nodeListener, { capture: true });
        node.dispatchEvent(event);

        setTimeout(() => {
          expect(nodeListener).toHaveBeenCalled();
          expect(parentListener).not.toHaveBeenCalled();
          done();
        });
      });

      it("attaches event to delegate's node", () => {
        const node = document.createElement("div");
        const delegate = document.createElement("p");
        node.appendChild(delegate);

        const name = "foo-bar";
        const component = new Component({ node, name });
        const eventName = "event";
        const listener = jasmine.createSpy(eventName);
        const event = new Event(eventName);

        component.attachEvent(eventName, delegate, listener);
        delegate.dispatchEvent(event);

        expect(listener).toHaveBeenCalled();
      });

      it("calls event to with delegate's node as a target", () => {
        const node = document.createElement("div");
        const delegate = document.createElement("p");
        node.appendChild(delegate);

        const name = "foo-bar";
        const component = new Component({ node, name });
        const eventName = "event";
        const event = new Event(eventName);

        component.attachEvent(eventName, delegate, ({ target }) =>
          expect(target).toBe(delegate)
        );
        delegate.dispatchEvent(event);
      });

      it("passes options to event listener for component's delegate", done => {
        const node = document.createElement("div");
        const delegate = document.createElement("p");
        node.appendChild(delegate);

        const name = "foo-bar";
        const component = new Component({ node, name });
        const eventName = "event";
        const nodeListener = jasmine.createSpy("node");
        const delegateListener = jasmine.createSpy("delegate");
        const event = new Event(eventName);

        parent.addEventListener(event, nodeListener, {
          capture: true,
        });

        component.attachEvent(eventName, delegate, delegateListener, {
          capture: true,
        });
        delegate.dispatchEvent(event);

        setTimeout(() => {
          expect(delegateListener).toHaveBeenCalled();
          expect(nodeListener).not.toHaveBeenCalled();
          done();
        });
      });
    });
  });
});

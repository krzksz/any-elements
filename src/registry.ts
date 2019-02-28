import { HTMLAnyElement } from "./interface";

type AnyElementFunction = () => HTMLAnyElement;
type AnyElementPromise = () => Promise<HTMLAnyElement>;

const registry = {};
const promises = {};
const callOptional = callable => callable && callable();
const isFunction = variable => typeof variable === "function";

const connect = (
  element: HTMLAnyElement,
  name: string,
  constructor: HTMLAnyElement | AnyElementFunction | AnyElementPromise
) => {
  if (element.$any) {
    return;
  }

  element.$any = { name, observer: null };

  const objectOrPromise: HTMLAnyElement | AnyElementPromise = isFunction(
    constructor
  )
    ? (constructor as AnyElementFunction)()
    : (constructor as HTMLAnyElement);

  Promise.resolve(objectOrPromise).then(constructorObject => {
    for (let key in constructorObject) {
      const value = constructorObject[key];
      element[key] = isFunction(value) ? value.bind(element) : value;
    }

    const attributeFilter = callOptional(element.observedAttributes);
    if (attributeFilter) {
      const observer = new MutationObserver(mutationsList => {
        mutationsList.forEach(function(mutation) {
          const attributeName = mutation.attributeName;
          element.attributeChangedCallback(
            attributeName,
            mutation.oldValue,
            (mutation.target as HTMLElement).getAttribute(attributeName)
          );
        });
      });

      observer.observe(element as Node, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter,
      });
      element.$any.observer = observer;
    }

    callOptional(element.connectedCallback);
  });
};

const disconnect = element => {
  if (!element.$any) {
    return;
  }

  const observer = element.$any.observer;
  if (observer) {
    observer.disconnect();
  }

  callOptional(element.disconnectedCallback);

  delete element.$any;
};

const connectAll = parent => {
  // 1 is Node.ELEMENT_NODE
  if (parent.nodeType !== 1) {
    return;
  }

  for (let name in registry) {
    const { _selector, _constructor } = registry[name];

    if (parent.matches(_selector)) {
      connect(
        parent,
        name,
        _constructor
      );
    }

    const elements = parent.querySelectorAll(_selector);

    for (let i = 0; i < elements.length; i++) {
      connect(
        elements[i],
        name,
        _constructor
      );
    }
  }
};

const disconnectAll = parentNode => {
  // 1 is Node.ELEMENT_NODE
  if (parentNode.nodeType !== 1) {
    return;
  }

  disconnect(parentNode);

  const elements = parentNode.querySelectorAll(`*`);
  for (let i = 0; i < elements.length; i++) {
    disconnect(elements[i]);
  }
};

export default class AnyElementRegistry {
  public constructor() {
    const rootNode = document.body;

    new MutationObserver(mutationsList => {
      mutationsList.forEach(mutation => {
        const disconnected = mutation.removedNodes;
        for (let i = 0; i < disconnected.length; i++) {
          disconnectAll(disconnected[i]);
        }

        const connected = mutation.addedNodes;
        for (let i = 0; i < connected.length; i++) {
          connectAll(connected[i]);
        }
      });
    }).observe(rootNode, {
      childList: true,
      subtree: true,
    });

    connectAll(rootNode);
  }

  public define(
    name: string,
    constructor: object,
    options: { selector?: string } = {}
  ): void {
    if (typeof name !== "string" || !name.match(/^[a-z][^A-Z]*\-[^A-Z]*$/)) {
      throw new DOMException(`"${name}" is not a valid element name`);
    }
    if (this.get(name)) {
      throw new DOMException(`'${name}' has already been declared`);
    }

    registry[name] = {
      _constructor: constructor,
      _selector: options.selector || name,
    };

    if (promises[name]) {
      promises[name].forEach(resolve => resolve());
    }
  }

  public undefine(name: string) {
    delete registry[name];
  }

  public get(name: string): object | undefined {
    const defined = registry[name] || {};

    return defined._constructor;
  }

  public whenDefined(name: string): Promise<void> {
    const promise = new Promise(resolve => {
      if (this.get(name)) {
        resolve();
      } else {
        if (!promises[name]) {
          promises[name] = [];
        }
        promises[name].push(resolve);
      }
    }) as Promise<void>;

    return promise;
  }
}

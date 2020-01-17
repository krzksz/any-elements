import { PROPERTY_NAME } from "./constants";
import Component from "./component";

interface ComponentRegistry {
  [componentName: string]: {
    _constructor: typeof Component | PromiseLike<typeof Component>;
    _options: {
      selector: string;
    };
  };
}

const registry: ComponentRegistry = {};
const promises = {};

const rootNode = document.body;

const forEach = Array.prototype.forEach;

/**
 * Connects given DOM node with provided component.
 * @param node DOM node that should be tied with the component.
 * @param name Name of the component.
 * @param options Options object for the component.
 * @param constructor Component class or a function returning a promise that resolves to it.
 */
const connect = (
  node: HTMLElement,
  name: string,
  options: {},
  constructor: any
) => {
  if (node[PROPERTY_NAME]) {
    return;
  }
  // If component was not provided, it means that this is a function.
  if (!(constructor.prototype instanceof Component)) {
    constructor = constructor();
  }

  Promise.resolve(constructor).then(Constructor => {
    const instance = new Constructor({ node, name, options });

    const attributeFilter = instance.observedAttributes();
    if (attributeFilter) {
      const observer = new MutationObserver(mutationsList => {
        forEach.call(mutationsList, ({ attributeName, oldValue, target }) => {
          instance.attributeChanged(
            attributeName,
            oldValue,
            (target as HTMLElement).getAttribute(attributeName)
          );
        });
      });

      instance.observer = observer;

      observer.observe(node, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter,
      });
    }

    instance.connected();
  });
};

/**
 * Cleans-up the component for a given node.
 * @param node Node that has been removed from the DOM.
 */
const disconnect = (node: HTMLElement) => {
  const instance = node[PROPERTY_NAME];

  if (!instance) {
    return;
  }

  const observer = instance.observer;
  if (observer) {
    observer.disconnect();
  }

  instance.disconnected();

  forEach.call(instance.listeners, ({ eventName, node, listener, options }) =>
    node.removeEventListener(eventName, listener, options)
  );
  instance.listeners = [];

  delete instance.node[PROPERTY_NAME];
  delete instance.node;
};

/**
 * Initializes components for given root node and its descendants.
 * @param rootNode Root HTMLElement of the tree that was added to the DOM.
 * @param nameFilter Which components should be initialized, will be all defined if not provided.
 */
const connectAll = (rootNode: HTMLElement, nameFilter?: string) => {
  // 1 is Node.HTMLElement_NODE
  if (rootNode.nodeType !== 1) {
    return;
  }

  const names = nameFilter ? registry[nameFilter] : Object.keys(registry);

  forEach.call(names || [], (name: string) => {
    const HTMLElement = registry[name];
    const selector = HTMLElement._options.selector;

    if (rootNode.matches(selector)) {
      connect(rootNode, name, HTMLElement._options, HTMLElement._constructor);
    }

    forEach.call(rootNode.querySelectorAll(selector), (node: HTMLElement) =>
      connect(node, name, HTMLElement._options, HTMLElement._constructor)
    );
  });
};

/**
 * Disconnects all components for given root node and its descendants.
 * @param rootNode Root node which was removed from the DOM.
 */
const disconnectAll = (rootNode: HTMLElement) => {
  // 1 is Node.HTMLElement_NODE
  if (rootNode.nodeType !== 1) {
    return;
  }

  disconnect(rootNode);

  forEach.call(rootNode.querySelectorAll(`*`), disconnect);
};

export default class AnyHTMLElementsRegistry {
  public constructor() {
    new MutationObserver(mutationsList => {
      forEach.call(mutationsList, mutation => {
        forEach.call(mutation.removedNodes || [], disconnectAll);
        forEach.call(mutation.addedNodes || [], connectAll);
      });
    }).observe(rootNode, {
      childList: true,
      subtree: true,
    });

    connectAll(rootNode);
  }

  /**
   * Registers component with a given name and options.
   * @param name Name of the component.
   * @param constructor Constructor or a function that returns a promise resolving with a constructor.
   * @param options Component's options.
   */
  public define(
    name: string,
    constructor: typeof Component,
    options: { selector?: string }
  ): void;
  public define(
    name: string,
    constructor: PromiseLike<typeof Component>,
    options: { selector?: string }
  ): void;
  public define(
    name: string,
    constructor: typeof Component | PromiseLike<typeof Component>,
    options: { selector?: string } = {}
  ): void {
    if (typeof name !== "string" || !name.match(/^[a-z][^A-Z]*\-[^A-Z]*$/)) {
      throw new Error(`"${name}" is not a valid component name`);
    }

    registry[name] = {
      _constructor: constructor,
      _options: {
        selector: options.selector || name,
      },
    };

    connectAll(rootNode, name);

    forEach.call(promises[name] || [], resolve => resolve());
  }

  /**
   * Removes component with a given name from the registry.
   * @param name Component's name.
   */
  public undefine(name: string) {
    delete registry[name];
  }

  /**
   * Returns component's constructor or a function that returns a promise resolving to it for a given name.
   * @param name Component's name.
   */
  public get(name: string): typeof Component | PromiseLike<typeof Component> {
    return registry[name] ? registry[name]._constructor : undefined;
  }

  /**
   * Returns a promise that is going to be resolved when the component with given name gets defined.
   * @param name Component's name.
   */
  public whenDefined(name: string): Promise<void> {
    const promise = new Promise(resolve => {
      if (this.get(name)) {
        return resolve();
      }
      promises[name] = promises[name] || [];
      promises[name].push(resolve);
    }) as Promise<void>;

    return promise;
  }
}

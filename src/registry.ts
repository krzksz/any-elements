const propertyName = "$any";

const registry = {};
const promises = {};

const rootNode = document.body;

const forEach = Array.prototype.forEach;

const callIfExists = callable => callable && callable();

const connect = (node: HTMLElement, name: string, element: any) => {
  if (node[propertyName]) {
    return;
  }

  Promise.resolve(element()).then(Constructor => {
    const instance = new Constructor(node);
    instance.$element = node;
    instance.$name = name;
    node[propertyName] = instance;

    const attributeFilter = callIfExists(instance.observedAttributes);
    if (attributeFilter) {
      instance.$observer = new MutationObserver(mutationsList => {
        forEach.call(mutationsList, mutation => {
          const attributeName = mutation.attributeName;
          instance.attributeChangedCallback(
            attributeName,
            mutation.oldValue,
            (mutation.target as HTMLElement).getAttribute(attributeName)
          );
        });
      });

      instance.$observer.observe(node, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter,
      });
    }

    callIfExists(instance.connectedCallback);
  });
};

const disconnect = (node: HTMLElement) => {
  const instance = node[propertyName];

  if (!instance) {
    return;
  }

  const observer = instance.$observer;
  if (observer) {
    observer.disconnect();
  }

  callIfExists(instance.disconnectedCallback);

  delete instance.$element;
  delete node[propertyName];
};

const connectAll = (parent: HTMLElement, onlyName?: string) => {
  // 1 is Node.ELEMENT_NODE
  if (parent.nodeType !== 1) {
    return;
  }

  const names = onlyName ? registry[onlyName] : Object.keys(registry);

  forEach.call(names, (name: string) => {
    const element = registry[name];
    const selector = element._options._selector;

    if (parent.matches(selector)) {
      connect(
        parent,
        name,
        element._constructor
      );
    }

    forEach.call(parent.querySelectorAll(selector), (node: HTMLElement) =>
      connect(
        node,
        name,
        element._constructor
      )
    );
  });
};

const disconnectAll = (parent: HTMLElement) => {
  // 1 is Node.ELEMENT_NODE
  if (parent.nodeType !== 1) {
    return;
  }

  disconnect(parent);

  forEach.call(parent.querySelectorAll(`*`), disconnect);
};

export default class AnyElementRegistry {
  public constructor() {
    new MutationObserver(mutationsList => {
      forEach.call(mutationsList, mutation => {
        forEach.call(mutation.removedNodes, disconnectAll);
        forEach.call(mutation.addedNodes, connectAll);
      });
    }).observe(rootNode, {
      childList: true,
      subtree: true,
    });

    connectAll(rootNode);
  }

  public define(
    name: string,
    constructor: Function | PromiseLike<Function>,
    options: { selector?: string; lazy?: boolean } = {}
  ): void {
    if (typeof name !== "string" || !name.match(/^[a-z][^A-Z]*\-[^A-Z]*$/)) {
      throw new DOMException(`"${name}" is not a valid element name`);
    }
    if (this.get(name)) {
      throw new DOMException(`'${name}' has already been declared`);
    }

    registry[name] = {
      _constructor: !options.lazy ? () => constructor : constructor,
      _options: {
        _selector: options.selector || name,
      },
    };

    connectAll(rootNode, name);

    if (promises[name]) {
      promises[name].forEach(resolve => resolve());
    }
  }

  public undefine(name: string) {
    delete registry[name];
  }

  public get(name: string): Function | PromiseLike<Function> {
    return registry[name] ? registry[name]._constructor() : undefined;
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

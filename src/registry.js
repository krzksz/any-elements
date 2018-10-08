import * as config from "./config";

if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector;
}

let registeredComponents = [];
let observer = null;

const init = (element, component) => {
  element.setAttribute(config.attributeName, component.name);
  element[config.propertyName] = new component.constructor(element);
};

const initAll = parentNode => {
  if (parentNode.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  registeredComponents.forEach(component => {
    if (
      parentNode.matches(`${component.selector}:not([${config.attributeName}])`)
    ) {
      init(parentNode, component);
    }

    const matchedElements = parentNode.querySelectorAll(
      `${component.selector}:not([${config.attributeName}])`
    );
    for (let i = 0; i < matchedElements.length; i++) {
      init(matchedElements[i], component);
    }
  });
};

const register = (selector, name, constructor) => {
  registeredComponents.push({ selector, name, constructor });
};

const unregister = (selector, name) => {
  registeredComponents = registeredComponents.filter(component => {
    return component.selector !== selector && component.name !== name;
  });
};

const destruct = componentElement => {
  componentElement.removeAttribute(config.attributeName);
  const componentToDestruct = componentElement[config.propertyName];
  componentToDestruct.destructor();
};

const destructAll = parentNode => {
  if (parentNode.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  if (parentNode.hasAttribute(config.attributeName)) {
    destruct(parentNode);
  }

  const matchedElements = parentNode.querySelectorAll(
    `[${config.attributeName}]`
  );
  const matchedElementsLength = matchedElements.length;
  for (let i = 0; i < matchedElementsLength; i++) {
    destruct(matchedElements[i]);
  }
};

const mutationCallback = mutationsList => {
  mutationsList.forEach(mutation => {
    const removedNodes = mutation.removedNodes;
    const removedNodesLength = removedNodes.length;
    for (let i = 0; i < removedNodesLength; i++) {
      destructAll(removedNodes[i]);
    }

    const addedNodes = mutation.addedNodes;
    const addedNodesLength = addedNodes.length;
    for (let i = 0; i < addedNodesLength; i++) {
      initAll(addedNodes[i]);
    }
  });
};

const attach = (rootNode = document.body) => {
  detach();
  observer = new MutationObserver(mutationCallback).observe(rootNode, {
    childList: true,
    subtree: true,
  });
  initAll(rootNode);
};

const detach = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

export { register, unregister, attach, detach };

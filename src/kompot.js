export class Component {
  constructor(element) {
    this.element = element;
    element[componentProperty] = this;
  }
  destructor() {}
}

const rootNode = document.body;
const componentAttribute = "data-ms-component";
const componentProperty = "msComponent";

const registeredComponents = [];

const initAll = () => {
  registeredComponents.forEach(component => {
    const matchedElements = rootNode.querySelectorAll(
      `${component.selector}:not([${componentAttribute}])`
    );
    for (let i = 0; i < matchedElements.length; i++) {
      const matchedElement = matchedElements[i];
      if (matchedElement[componentProperty]) {
        continue;
      }
      matchedElement.setAttribute(
        componentAttribute,
        component.constructor.name
      );
      matchedElement[componentProperty] = new component.constructor(
        matchedElement
      );
    }
  });
};

export const register = (selector, constructor) => {
  registeredComponents.push({ selector, constructor });
};

const destruct = componentElement => {
  componentElement.removeAttribute(componentAttribute);
  const componentToDestruct = componentElement[componentProperty];
  componentToDestruct.destructor();
};

const destructAll = parentNode => {
  if (parentNode.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  if (parentNode.hasAttribute(componentAttribute)) {
    destruct(parentNode);
  }

  const matchedElements = parentNode.querySelectorAll(
    `[${componentAttribute}]`
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

    if (mutation.addedNodes.length) {
      initAll();
    }
  });
};

export const attach = () => {
  new MutationObserver(mutationCallback).observe(rootNode, {
    childList: true,
    subtree: true,
  });
  initAll();
};

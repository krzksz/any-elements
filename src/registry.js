let registeredComponents = [];
let observer = null;

const init = (element, component) => {
  if (element._smoll) {
    return;
  }
  new component.constructor(element);
};

const initAll = parentNode => {
  if (parentNode.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  registeredComponents.forEach(component => {
    if (parentNode.matches(component.selector)) {
      init(parentNode, component);
    }

    const matchedElements = parentNode.querySelectorAll(component.selector);
    for (let i = 0; i < matchedElements.length; i++) {
      init(matchedElements[i], component);
    }
  });
};

const register = (selector, constructor) => {
  registeredComponents.push({ selector, constructor });
};

const unregister = selector => {
  registeredComponents = registeredComponents.filter(
    component => component.selector !== selector
  );
};

const destruct = componentElement => {
  if (componentElement._smoll) {
    componentElement._smoll.destructor();
  }
};

const destructAll = parentNode => {
  if (parentNode.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  destruct(parentNode);

  const matchedElements = parentNode.querySelectorAll(`*`);
  for (let i = 0; i < matchedElements.length; i++) {
    destruct(matchedElements[i]);
  }
};

const mutationCallback = mutationsList => {
  mutationsList.forEach(mutation => {
    const removedNodes = mutation.removedNodes;
    for (let i = 0; i < removedNodes.length; i++) {
      destructAll(removedNodes[i]);
    }

    const addedNodes = mutation.addedNodes;
    for (let i = 0; i < addedNodes.length; i++) {
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

const detach = (rootNode = document.body) => {
  if (observer) {
    observer.disconnect();
    observer = null;
    destructAll(rootNode);
  }
};

export { register, unregister, attach, detach };

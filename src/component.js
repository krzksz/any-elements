export default class Component {
  constructor(element) {
    element._smoll = this;
    this.$element = element;
    this.$listeners = [];
  }
  attachEventListener(element, event, listener, autoBind = false) {
    if (autoBind) {
      listener = listener.bind(this);
    }
    element.addEventListener(event, listener);
    this.$listeners.push({ element, event, listener });
  }
  detachEventListener(element, event, listener) {
    this.$listeners = this.$listeners.filter(listenerEntry => {
      if (
        listenerEntry.element === element &&
        listenerEntry.event === event &&
        listenerEntry.listener === listener
      ) {
        element.removeEventListener(listener);
        return false;
      }
      return true;
    });
  }
  destructor() {
    this.$listeners.forEach(({ element, event, listener }) => {
      element.removeEventListener(event, listener);
    });
    this.$listeners = [];
  }
}

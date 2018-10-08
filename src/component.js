import * as config from "./config";

export default class Component {
  constructor(element) {
    this.element = element;
    element[config.propertyName] = this;
  }
  destructor() {}
}

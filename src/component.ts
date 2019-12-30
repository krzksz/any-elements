import { PROPERTY_NAME } from "./constants";

interface ComponentArguments {
  node: Element;
  name: string;
  options?: {};
}

interface AttachedListener {
  eventName: string;
  node: Element;
  listener: EventListenerOrEventListenerObject;
  options: boolean | EventListenerOptions;
}
// Check if certain browser supports passing event listener options as an object.
let eventObjectSupported = false;
try {
  window.addEventListener(
    "test",
    null,
    Object.defineProperty({}, "capture", {
      get() {
        eventObjectSupported = true;
      },
    })
  );
} catch (err) {}

export default class Component {
  /**
   * Component's name.
   */
  public name: string;
  /**
   * DOM node attached with the component.
   */
  public node: Element;
  /**
   * Component's options.
   */
  public options: {} = {};
  /**
   * Mutation observer assigned to the component.
   */
  protected observer: MutationObserver;
  /**
   * Array of event listeners attached to the component.
   */
  protected listeners: AttachedListener[] = [];

  public constructor({ node, name, options }: ComponentArguments) {
    this.node = node;
    node[PROPERTY_NAME] = this;
    this.name = name;
    Object.assign(this.options, options);
  }

  /**
   * Returns an array of attributes that should be observed for changes.
   */
  public observedAttributes(): string[] | void {}

  /**
   * Method invoked when component's node is added to the DOM tree.
   */
  public connected(): void {}

  /**
   * Method invoked when component's node is removed from the DOM tree.
   */
  public disconnected(): void {}

  /**
   * Attaches event listener to a component so it can be cleaned-up automatically after it is removed from DOM.
   * @param eventName Name of the event to listen for.
   * @param listener Listener to invoke when event is triggered.
   * @param options Event listener options.
   */
  public attachEvent(
    eventName: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  );
  /**
   * Attaches event listener to a component so it can be cleaned-up automatically after it is removed from DOM.
   * @param eventName Name of the event to listen for.
   * @param delegate Child element which events will be listened.
   * @param listener Listener to invoke when event is triggered.
   * @param options Event listener options.
   */
  public attachEvent(
    eventName: string,
    delegate: Element,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  );
  /**
   * Attaches event listener to a component so it can be cleaned-up automatically after it is removed from DOM.
   * @param eventName Name of the event to listen for.
   * @param delegate Child element which events will be listened.
   * @param listener Listener to invoke when event is triggered.
   * @param options Event listener options.
   */
  public attachEvent(
    eventName: string,
    listenerOrDelegate: any,
    listener: any,
    options?: boolean | AddEventListenerOptions
  ): void {
    let node = listenerOrDelegate;
    if (!(listenerOrDelegate instanceof Node)) {
      node = this.node;
      options = listener;
      listener = listenerOrDelegate;
    }
    options = eventObjectSupported
      ? options
      : (options as EventListenerOptions).capture;

    node.addEventListener(eventName, listener, options);
    this.listeners.push({ eventName, node, listener, options });
  }
}

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
export default class Component {
    /**
     * Component's name.
     */
    name: string;
    /**
     * DOM node attached with the component.
     */
    node: Element;
    /**
     * Component's options.
     */
    options: {};
    /**
     * Mutation observer assigned to the component.
     */
    protected observer: MutationObserver;
    /**
     * Array of event listeners attached to the component.
     */
    protected listeners: AttachedListener[];
    constructor({ node, name, options }: ComponentArguments);
    /**
     * Returns an array of attributes that should be observed for changes.
     */
    observedAttributes(): string[] | void;
    /**
     * Method invoked when component's node is added to the DOM tree.
     */
    connected(): void;
    /**
     * Method invoked when component's node is removed from the DOM tree.
     */
    disconnected(): void;
    attachEvent(eventName: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): any;
    attachEvent(eventName: string, delegate: Element, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): any;
}
export {};

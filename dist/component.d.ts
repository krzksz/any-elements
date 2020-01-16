interface ComponentArguments {
    node: HTMLElement;
    name: string;
    options?: {};
}
interface AttachedListener {
    eventName: string;
    node: HTMLElement;
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
    node: HTMLElement;
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
    /**
     * Attaches event listener to a component so it can be cleaned-up automatically after it is removed from DOM.
     * @param eventName Name of the event to listen for.
     * @param listener Listener to invoke when event is triggered.
     * @param options Event listener options.
     */
    attachEvent(eventName: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): any;
    /**
     * Attaches event listener to a component so it can be cleaned-up automatically after it is removed from DOM.
     * @param eventName Name of the event to listen for.
     * @param delegate Child element which events will be listened.
     * @param listener Listener to invoke when event is triggered.
     * @param options Event listener options.
     */
    attachEvent(eventName: string, delegate: HTMLElement, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): any;
}
export {};

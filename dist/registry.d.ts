import Component from "./component";
export default class AnyHTMLElementsRegistry {
    constructor();
    /**
     * Registers component with a given name and options.
     * @param name Name of the component.
     * @param constructor Constructor or a function that returns a promise resolving with a constructor.
     * @param options Component's options.
     */
    define(name: string, constructor: typeof Component, options: {
        selector?: string;
    }): void;
    define(name: string, constructor: PromiseLike<typeof Component>, options: {
        selector?: string;
    }): void;
    /**
     * Removes component with a given name from the registry.
     * @param name Component's name.
     */
    undefine(name: string): void;
    /**
     * Returns component's constructor or a function that returns a promise resolving to it for a given name.
     * @param name Component's name.
     */
    get(name: string): typeof Component | PromiseLike<typeof Component>;
    /**
     * Returns a promise that is going to be resolved when the component with given name gets defined.
     * @param name Component's name.
     */
    whenDefined(name: string): Promise<void>;
}

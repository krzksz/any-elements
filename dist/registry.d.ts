export default class AnyElementRegistry {
    constructor();
    define(name: string, constructor: Function | PromiseLike<Function>, options?: {
        selector?: string;
        lazy?: boolean;
    }): void;
    undefine(name: string): void;
    get(name: string): Function | PromiseLike<Function>;
    whenDefined(name: string): Promise<void>;
}

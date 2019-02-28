export default class AnyElementRegistry {
    constructor();
    define(name: string, constructor: object, options?: {
        selector?: string;
    }): void;
    undefine(name: string): void;
    get(name: string): object | undefined;
    whenDefined(name: string): Promise<void>;
}

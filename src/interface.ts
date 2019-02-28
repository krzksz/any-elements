export interface HTMLAnyElement extends Partial<HTMLElement> {
  $any?: { name: string; observer: MutationObserver };
  observedAttributes?: () => string[];
  connectedCallback?: () => any;
  disconnectedCallback?: () => any;
  attributeChangedCallback?: (
    name: string,
    oldValue: string,
    newValue: string
  ) => any;
}

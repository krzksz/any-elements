var n={},t={},r=function(n){return n&&n()},e=function(n){return"function"==typeof n},i=function(n,t,i){if(!n.$any){n.$any={name:t,observer:null};var o=e(i)?i():i;Promise.resolve(o).then(function(t){for(var i in t){var o=t[i];n[i]=e(o)?o.bind(n):o}var f=r(n.observedAttributes);if(f){var u=new MutationObserver(function(t){t.forEach(function(t){var r=t.attributeName;n.attributeChangedCallback(r,t.oldValue,t.target.getAttribute(r))})});u.observe(n,{attributes:!0,attributeOldValue:!0,attributeFilter:f}),n.$any.observer=u}r(n.connectedCallback)})}},o=function(n){if(n.$any){var t=n.$any.observer;t&&t.disconnect(),r(n.disconnectedCallback),delete n.$any}},f=function(t){if(1===t.nodeType)for(var r in n){var e=n[r],o=e.t,f=e.i;t.matches(o)&&i(t,r,f);for(var u=t.querySelectorAll(o),a=0;a<u.length;a++)i(u[a],r,f)}},u=function(n){if(1===n.nodeType){o(n);for(var t=n.querySelectorAll("*"),r=0;r<t.length;r++)o(t[r])}},a=function(){var n=document.body;new MutationObserver(function(n){n.forEach(function(n){for(var t=n.removedNodes,r=0;r<t.length;r++)u(t[r]);for(var e=n.addedNodes,i=0;i<e.length;i++)f(e[i])})}).observe(n,{childList:!0,subtree:!0}),f(n)};a.prototype.define=function(r,e,i){if(void 0===i&&(i={}),"string"!=typeof r||!r.match(/^[a-z][^A-Z]*\-[^A-Z]*$/))throw new DOMException('"'+r+'" is not a valid element name');if(this.get(r))throw new DOMException("'"+r+"' has already been declared");n[r]={i:e,t:i.selector||r},t[r]&&t[r].forEach(function(n){return n()})},a.prototype.undefine=function(t){delete n[t]},a.prototype.get=function(t){return(n[t]||{}).i},a.prototype.whenDefined=function(n){var r=this;return new Promise(function(e){r.get(n)?e():(t[n]||(t[n]=[]),t[n].push(e))})};export default new a;
//# sourceMappingURL=anyElements.mjs.map

var n={},t={},e=Array.prototype.forEach,i=function(n){return n&&n()},r=function(n,t,r){n.$any||Promise.resolve(r()).then(function(r){var o=new r(n);o.$element=n,o.$name=t,n.$any=o;var u=i(o.observedAttributes);u&&(o.$observer=new MutationObserver(function(n){e.call(n,function(n){var t=n.attributeName;o.attributeChangedCallback(t,n.oldValue,n.target.getAttribute(t))})}),o.$observer.observe(n,{attributes:!0,attributeOldValue:!0,attributeFilter:u})),i(o.connectedCallback)})},o=function(n){var t=n.$any;if(t){var e=t.$observer;e&&e.disconnect(),i(t.disconnectedCallback),delete t.$element,delete n.$any}},u=function(t){1===t.nodeType&&e.call(Object.keys(n),function(i){var o=n[i],u=o.i.t;t.matches(u)&&r(t,i,o.o),e.call(t.querySelectorAll(u),function(n){return r(n,i,o.o)})})},c=function(n){1===n.nodeType&&(o(n),e.call(n.querySelectorAll("*"),o))},a=function(){var n=document.body;new MutationObserver(function(n){e.call(n,function(n){e.call(n.removedNodes,c),e.call(n.addedNodes,u)})}).observe(n,{childList:!0,subtree:!0}),u(n)};a.prototype.define=function(e,i,r){if(void 0===r&&(r={}),"string"!=typeof e||!e.match(/^[a-z][^A-Z]*\-[^A-Z]*$/))throw new DOMException('"'+e+'" is not a valid element name');if(this.get(e))throw new DOMException("'"+e+"' has already been declared");n[e]={o:r.lazy?i:function(){return i},i:{t:r.selector||e}},t[e]&&t[e].forEach(function(n){return n()})},a.prototype.undefine=function(t){delete n[t]},a.prototype.get=function(t){return n[t]?n[t].o():void 0},a.prototype.whenDefined=function(n){var e=this;return new Promise(function(i){e.get(n)?i():(t[n]||(t[n]=[]),t[n].push(i))})};export default new a;
//# sourceMappingURL=anyElements.mjs.map

var n={},t={},e=document.body,i=Array.prototype.forEach,r=function(n){return n&&n()},o=function(n,t,e){n.$any||Promise.resolve(e()).then(function(e){var o=new e(n);o.$element=n,o.$name=t,n.$any=o;var u=r(o.observedAttributes);u&&(o.$observer=new MutationObserver(function(n){i.call(n,function(n){var t=n.attributeName;o.attributeChangedCallback(t,n.oldValue,n.target.getAttribute(t))})}),o.$observer.observe(n,{attributes:!0,attributeOldValue:!0,attributeFilter:u})),r(o.connectedCallback)})},u=function(n){var t=n.$any;if(t){var e=t.$observer;e&&e.disconnect(),r(t.disconnectedCallback),delete t.$element,delete n.$any}},c=function(t,e){if(1===t.nodeType){var r=e?n[e]:Object.keys(n);i.call(r,function(e){var r=n[e],u=r.i.t;t.matches(u)&&o(t,e,r.o),i.call(t.querySelectorAll(u),function(n){return o(n,e,r.o)})})}},a=function(n){1===n.nodeType&&(u(n),i.call(n.querySelectorAll("*"),u))},f=function(){new MutationObserver(function(n){i.call(n,function(n){i.call(n.removedNodes,a),i.call(n.addedNodes,c)})}).observe(e,{childList:!0,subtree:!0}),c(e)};f.prototype.define=function(i,r,o){if(void 0===o&&(o={}),"string"!=typeof i||!i.match(/^[a-z][^A-Z]*\-[^A-Z]*$/))throw new DOMException('"'+i+'" is not a valid element name');if(this.get(i))throw new DOMException("'"+i+"' has already been declared");n[i]={o:o.lazy?r:function(){return r},i:{t:o.selector||i}},c(e,i),t[i]&&t[i].forEach(function(n){return n()})},f.prototype.undefine=function(t){delete n[t]},f.prototype.get=function(t){return n[t]?n[t].o():void 0},f.prototype.whenDefined=function(n){var e=this;return new Promise(function(i){e.get(n)?i():(t[n]||(t[n]=[]),t[n].push(i))})};var s=new f;module.exports=s;
//# sourceMappingURL=anyElements.js.map

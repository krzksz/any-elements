!function(n,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(n.AnyElements={})}(this,function(n){var t=!1;try{window.addEventListener("test",null,Object.defineProperty({},"capture",{get:function(){t=!0}}))}catch(n){}var e=function(n){var t=n.node,e=n.name,i=n.options;this.options={},this.listeners=[],this.node=t,t.$any=this,this.name=e,Object.assign(this.options,i)};e.prototype.observedAttributes=function(){},e.prototype.connected=function(){},e.prototype.disconnected=function(){},e.prototype.attachEvent=function(n,e,i,o){var r=e;e instanceof Node||(r=this.node,o=i,i=e),r.addEventListener(n,i,o=t?o:o.capture),this.listeners.push({eventName:n,node:r,listener:i,options:o})};var i={},o={},r=document.body,u=Array.prototype.forEach,c=function(n,t,i,o){n.$any||(o.prototype instanceof e||(o=o()),Promise.resolve(o).then(function(e){var o=new e({node:n,name:t,options:i}),r=o.observedAttributes();if(r){var c=new MutationObserver(function(n){u.call(n,function(n){var t=n.attributeName;o.attributeChanged(t,n.oldValue,n.target.getAttribute(t))})});o.observer=c,c.observe(n,{attributes:!0,attributeOldValue:!0,attributeFilter:r})}o.connected()}))},f=function(n){var t=n.$any;if(t){var e=t.observer;e&&e.disconnect(),t.disconnected(),u.call(t.listeners,function(n){return n.node.removeEventListener(n.eventName,n.listener,n.options)}),t.listeners=[],delete t.node.$any,delete t.node}},a=function(n,t){if(1===n.nodeType){var e=t?i[t]:Object.keys(i);u.call(e,function(t){var e=i[t],o=e.t.selector;n.matches(o)&&c(n,t,e.t,e.i),u.call(n.querySelectorAll(o),function(n){return c(n,t,e.t,e.i)})})}},s=function(n){1===n.nodeType&&(f(n),u.call(n.querySelectorAll("*"),f))},v=function(){new MutationObserver(function(n){u.call(n,function(n){u.call(n.removedNodes,s),u.call(n.addedNodes,a)})}).observe(r,{childList:!0,subtree:!0}),a(r)};v.prototype.define=function(n,t,e){if(void 0===e&&(e={}),"string"!=typeof n||!n.match(/^[a-z][^A-Z]*\-[^A-Z]*$/))throw new Error('"'+n+'" is not a valid component name');i[n]={i:t,t:{selector:e.selector||n}},a(r,n),u.call(o[n]||[],function(n){return n()})},v.prototype.undefine=function(n){delete i[n]},v.prototype.get=function(n){return i[n]?i[n].i:void 0},v.prototype.whenDefined=function(n){var t=this;return new Promise(function(e){if(t.get(n))return e();o[n]=o[n]||[],o[n].push(e)})};var d=new v;n.Component=e,n.Registry=d});
//# sourceMappingURL=anyElements.umd.js.map

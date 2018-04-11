/*! jQuery v1.7.2 jquery.com | jquery.org/license */
(function(a,b){function cy(a){return f.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}function cu(a){if(!cj[a]){var b=c.body,d=f("<"+a+">").appendTo(b),e=d.css("display");d.remove();if(e==="none"||e===""){ck||(ck=c.createElement("iframe"),ck.frameBorder=ck.width=ck.height=0),b.appendChild(ck);if(!cl||!ck.createElement)cl=(ck.contentWindow||ck.contentDocument).document,cl.write((f.support.boxModel?"<!doctype html>":"")+"<html><body>"),cl.close();d=cl.createElement(a),cl.body.appendChild(d),e=f.css(d,"display"),b.removeChild(ck)}cj[a]=e}return cj[a]}function ct(a,b){var c={};f.each(cp.concat.apply([],cp.slice(0,b)),function(){c[this]=a});return c}function cs(){cq=b}function cr(){setTimeout(cs,0);return cq=f.now()}function ci(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function ch(){try{return new a.XMLHttpRequest}catch(b){}}function cb(a,c){a.dataFilter&&(c=a.dataFilter(c,a.dataType));var d=a.dataTypes,e={},g,h,i=d.length,j,k=d[0],l,m,n,o,p;for(g=1;g<i;g++){if(g===1)for(h in a.converters)typeof h=="string"&&(e[h.toLowerCase()]=a.converters[h]);l=k,k=d[g];if(k==="*")k=l;else if(l!=="*"&&l!==k){m=l+" "+k,n=e[m]||e["* "+k];if(!n){p=b;for(o in e){j=o.split(" ");if(j[0]===l||j[0]==="*"){p=e[j[1]+" "+k];if(p){o=e[o],o===!0?n=p:p===!0&&(n=o);break}}}}!n&&!p&&f.error("No conversion from "+m.replace(" "," to ")),n!==!0&&(c=n?n(c):p(o(c)))}}return c}function ca(a,c,d){var e=a.contents,f=a.dataTypes,g=a.responseFields,h,i,j,k;for(i in g)i in d&&(c[g[i]]=d[i]);while(f[0]==="*")f.shift(),h===b&&(h=a.mimeType||c.getResponseHeader("content-type"));if(h)for(i in e)if(e[i]&&e[i].test(h)){f.unshift(i);break}if(f[0]in d)j=f[0];else{for(i in d){if(!f[0]||a.converters[i+" "+f[0]]){j=i;break}k||(k=i)}j=j||k}if(j){j!==f[0]&&f.unshift(j);return d[j]}}function b_(a,b,c,d){if(f.isArray(b))f.each(b,function(b,e){c||bD.test(a)?d(a,e):b_(a+"["+(typeof e=="object"?b:"")+"]",e,c,d)});else if(!c&&f.type(b)==="object")for(var e in b)b_(a+"["+e+"]",b[e],c,d);else d(a,b)}function b$(a,c){var d,e,g=f.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((g[d]?a:e||(e={}))[d]=c[d]);e&&f.extend(!0,a,e)}function bZ(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h=a[f],i=0,j=h?h.length:0,k=a===bS,l;for(;i<j&&(k||!l);i++)l=h[i](c,d,e),typeof l=="string"&&(!k||g[l]?l=b:(c.dataTypes.unshift(l),l=bZ(a,c,d,e,l,g)));(k||!l)&&!g["*"]&&(l=bZ(a,c,d,e,"*",g));return l}function bY(a){return function(b,c){typeof b!="string"&&(c=b,b="*");if(f.isFunction(c)){var d=b.toLowerCase().split(bO),e=0,g=d.length,h,i,j;for(;e<g;e++)h=d[e],j=/^\+/.test(h),j&&(h=h.substr(1)||"*"),i=a[h]=a[h]||[],i[j?"unshift":"push"](c)}}}function bB(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=b==="width"?1:0,g=4;if(d>0){if(c!=="border")for(;e<g;e+=2)c||(d-=parseFloat(f.css(a,"padding"+bx[e]))||0),c==="margin"?d+=parseFloat(f.css(a,c+bx[e]))||0:d-=parseFloat(f.css(a,"border"+bx[e]+"Width"))||0;return d+"px"}d=by(a,b);if(d<0||d==null)d=a.style[b];if(bt.test(d))return d;d=parseFloat(d)||0;if(c)for(;e<g;e+=2)d+=parseFloat(f.css(a,"padding"+bx[e]))||0,c!=="padding"&&(d+=parseFloat(f.css(a,"border"+bx[e]+"Width"))||0),c==="margin"&&(d+=parseFloat(f.css(a,c+bx[e]))||0);return d+"px"}function bo(a){var b=c.createElement("div");bh.appendChild(b),b.innerHTML=a.outerHTML;return b.firstChild}function bn(a){var b=(a.nodeName||"").toLowerCase();b==="input"?bm(a):b!=="script"&&typeof a.getElementsByTagName!="undefined"&&f.grep(a.getElementsByTagName("input"),bm)}function bm(a){if(a.type==="checkbox"||a.type==="radio")a.defaultChecked=a.checked}function bl(a){return typeof a.getElementsByTagName!="undefined"?a.getElementsByTagName("*"):typeof a.querySelectorAll!="undefined"?a.querySelectorAll("*"):[]}function bk(a,b){var c;b.nodeType===1&&(b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase(),c==="object"?b.outerHTML=a.outerHTML:c!=="input"||a.type!=="checkbox"&&a.type!=="radio"?c==="option"?b.selected=a.defaultSelected:c==="input"||c==="textarea"?b.defaultValue=a.defaultValue:c==="script"&&b.text!==a.text&&(b.text=a.text):(a.checked&&(b.defaultChecked=b.checked=a.checked),b.value!==a.value&&(b.value=a.value)),b.removeAttribute(f.expando),b.removeAttribute("_submit_attached"),b.removeAttribute("_change_attached"))}function bj(a,b){if(b.nodeType===1&&!!f.hasData(a)){var c,d,e,g=f._data(a),h=f._data(b,g),i=g.events;if(i){delete h.handle,h.events={};for(c in i)for(d=0,e=i[c].length;d<e;d++)f.event.add(b,c,i[c][d])}h.data&&(h.data=f.extend({},h.data))}}function bi(a,b){return f.nodeName(a,"table")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function U(a){var b=V.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function T(a,b,c){b=b||0;if(f.isFunction(b))return f.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return f.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=f.grep(a,function(a){return a.nodeType===1});if(O.test(b))return f.filter(b,d,!c);b=f.filter(b,d)}return f.grep(a,function(a,d){return f.inArray(a,b)>=0===c})}function S(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function K(){return!0}function J(){return!1}function n(a,b,c){var d=b+"defer",e=b+"queue",g=b+"mark",h=f._data(a,d);h&&(c==="queue"||!f._data(a,e))&&(c==="mark"||!f._data(a,g))&&setTimeout(function(){!f._data(a,e)&&!f._data(a,g)&&(f.removeData(a,d,!0),h.fire())},0)}function m(a){for(var b in a){if(b==="data"&&f.isEmptyObject(a[b]))continue;if(b!=="toJSON")return!1}return!0}function l(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(k,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:f.isNumeric(d)?+d:j.test(d)?f.parseJSON(d):d}catch(g){}f.data(a,c,d)}else d=b}return d}function h(a){var b=g[a]={},c,d;a=a.split(/\s+/);for(c=0,d=a.length;c<d;c++)b[a[c]]=!0;return b}var c=a.document,d=a.navigator,e=a.location,f=function(){function J(){if(!e.isReady){try{c.documentElement.doScroll("left")}catch(a){setTimeout(J,1);return}e.ready()}}var e=function(a,b){return new e.fn.init(a,b,h)},f=a.jQuery,g=a.$,h,i=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,j=/\S/,k=/^\s+/,l=/\s+$/,m=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,n=/^[\],:{}\s]*$/,o=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,p=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,q=/(?:^|:|,)(?:\s*\[)+/g,r=/(webkit)[ \/]([\w.]+)/,s=/(opera)(?:.*version)?[ \/]([\w.]+)/,t=/(msie) ([\w.]+)/,u=/(mozilla)(?:.*? rv:([\w.]+))?/,v=/-([a-z]|[0-9])/ig,w=/^-ms-/,x=function(a,b){return(b+"").toUpperCase()},y=d.userAgent,z,A,B,C=Object.prototype.toString,D=Object.prototype.hasOwnProperty,E=Array.prototype.push,F=Array.prototype.slice,G=String.prototype.trim,H=Array.prototype.indexOf,I={};e.fn=e.prototype={constructor:e,init:function(a,d,f){var g,h,j,k;if(!a)return this;if(a.nodeType){this.context=this[0]=a,this.length=1;return this}if(a==="body"&&!d&&c.body){this.context=c,this[0]=c.body,this.selector=a,this.length=1;return this}if(typeof a=="string"){a.charAt(0)!=="<"||a.charAt(a.length-1)!==">"||a.length<3?g=i.exec(a):g=[null,a,null];if(g&&(g[1]||!d)){if(g[1]){d=d instanceof e?d[0]:d,k=d?d.ownerDocument||d:c,j=m.exec(a),j?e.isPlainObject(d)?(a=[c.createElement(j[1])],e.fn.attr.call(a,d,!0)):a=[k.createElement(j[1])]:(j=e.buildFragment([g[1]],[k]),a=(j.cacheable?e.clone(j.fragment):j.fragment).childNodes);return e.merge(this,a)}h=c.getElementById(g[2]);if(h&&h.parentNode){if(h.id!==g[2])return f.find(a);this.length=1,this[0]=h}this.context=c,this.selector=a;return this}return!d||d.jquery?(d||f).find(a):this.constructor(d).find(a)}if(e.isFunction(a))return f.ready(a);a.selector!==b&&(this.selector=a.selector,this.context=a.context);return e.makeArray(a,this)},selector:"",jquery:"1.7.2",length:0,size:function(){return this.length},toArray:function(){return F.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=this.constructor();e.isArray(a)?E.apply(d,a):e.merge(d,a),d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")");return d},each:function(a,b){return e.each(this,a,b)},ready:function(a){e.bindReady(),A.add(a);return this},eq:function(a){a=+a;return a===-1?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(F.apply(this,arguments),"slice",F.call(arguments).join(","))},map:function(a){return this.pushStack(e.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:E,sort:[].sort,splice:[].splice},e.fn.init.prototype=e.fn,e.extend=e.fn.extend=function(){var a,c,d,f,g,h,i=arguments[0]||{},j=1,k=arguments.length,l=!1;typeof i=="boolean"&&(l=i,i=arguments[1]||{},j=2),typeof i!="object"&&!e.isFunction(i)&&(i={}),k===j&&(i=this,--j);for(;j<k;j++)if((a=arguments[j])!=null)for(c in a){d=i[c],f=a[c];if(i===f)continue;l&&f&&(e.isPlainObject(f)||(g=e.isArray(f)))?(g?(g=!1,h=d&&e.isArray(d)?d:[]):h=d&&e.isPlainObject(d)?d:{},i[c]=e.extend(l,h,f)):f!==b&&(i[c]=f)}return i},e.extend({noConflict:function(b){a.$===e&&(a.$=g),b&&a.jQuery===e&&(a.jQuery=f);return e},isReady:!1,readyWait:1,holdReady:function(a){a?e.readyWait++:e.ready(!0)},ready:function(a){if(a===!0&&!--e.readyWait||a!==!0&&!e.isReady){if(!c.body)return setTimeout(e.ready,1);e.isReady=!0;if(a!==!0&&--e.readyWait>0)return;A.fireWith(c,[e]),e.fn.trigger&&e(c).trigger("ready").off("ready")}},bindReady:function(){if(!A){A=e.Callbacks("once memory");if(c.readyState==="complete")return setTimeout(e.ready,1);if(c.addEventListener)c.addEventListener("DOMContentLoaded",B,!1),a.addEventListener("load",e.ready,!1);else if(c.attachEvent){c.attachEvent("onreadystatechange",B),a.attachEvent("onload",e.ready);var b=!1;try{b=a.frameElement==null}catch(d){}c.documentElement.doScroll&&b&&J()}}},isFunction:function(a){return e.type(a)==="function"},isArray:Array.isArray||function(a){return e.type(a)==="array"},isWindow:function(a){return a!=null&&a==a.window},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return a==null?String(a):I[C.call(a)]||"object"},isPlainObject:function(a){if(!a||e.type(a)!=="object"||a.nodeType||e.isWindow(a))return!1;try{if(a.constructor&&!D.call(a,"constructor")&&!D.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||D.call(a,d)},isEmptyObject:function(a){for(var b in a)return!1;return!0},error:function(a){throw new Error(a)},parseJSON:function(b){if(typeof b!="string"||!b)return null;b=e.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(n.test(b.replace(o,"@").replace(p,"]").replace(q,"")))return(new Function("return "+b))();e.error("Invalid JSON: "+b)},parseXML:function(c){if(typeof c!="string"||!c)return null;var d,f;try{a.DOMParser?(f=new DOMParser,d=f.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(g){d=b}(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&e.error("Invalid XML: "+c);return d},noop:function(){},globalEval:function(b){b&&j.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(w,"ms-").replace(v,x)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var f,g=0,h=a.length,i=h===b||e.isFunction(a);if(d){if(i){for(f in a)if(c.apply(a[f],d)===!1)break}else for(;g<h;)if(c.apply(a[g++],d)===!1)break}else if(i){for(f in a)if(c.call(a[f],f,a[f])===!1)break}else for(;g<h;)if(c.call(a[g],g,a[g++])===!1)break;return a},trim:G?function(a){return a==null?"":G.call(a)}:function(a){return a==null?"":(a+"").replace(k,"").replace(l,"")},makeArray:function(a,b){var c=b||[];if(a!=null){var d=e.type(a);a.length==null||d==="string"||d==="function"||d==="regexp"||e.isWindow(a)?E.call(c,a):e.merge(c,a)}return c},inArray:function(a,b,c){var d;if(b){if(H)return H.call(b,a,c);d=b.length,c=c?c<0?Math.max(0,d+c):c:0;for(;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=a.length,e=0;if(typeof c.length=="number")for(var f=c.length;e<f;e++)a[d++]=c[e];else while(c[e]!==b)a[d++]=c[e++];a.length=d;return a},grep:function(a,b,c){var d=[],e;c=!!c;for(var f=0,g=a.length;f<g;f++)e=!!b(a[f],f),c!==e&&d.push(a[f]);return d},map:function(a,c,d){var f,g,h=[],i=0,j=a.length,k=a instanceof e||j!==b&&typeof j=="number"&&(j>0&&a[0]&&a[j-1]||j===0||e.isArray(a));if(k)for(;i<j;i++)f=c(a[i],i,d),f!=null&&(h[h.length]=f);else for(g in a)f=c(a[g],g,d),f!=null&&(h[h.length]=f);return h.concat.apply([],h)},guid:1,proxy:function(a,c){if(typeof c=="string"){var d=a[c];c=a,a=d}if(!e.isFunction(a))return b;var f=F.call(arguments,2),g=function(){return a.apply(c,f.concat(F.call(arguments)))};g.guid=a.guid=a.guid||g.guid||e.guid++;return g},access:function(a,c,d,f,g,h,i){var j,k=d==null,l=0,m=a.length;if(d&&typeof d=="object"){for(l in d)e.access(a,c,l,d[l],1,h,f);g=1}else if(f!==b){j=i===b&&e.isFunction(f),k&&(j?(j=c,c=function(a,b,c){return j.call(e(a),c)}):(c.call(a,f),c=null));if(c)for(;l<m;l++)c(a[l],d,j?f.call(a[l],l,c(a[l],d)):f,i);g=1}return g?a:k?c.call(a):m?c(a[0],d):h},now:function(){return(new Date).getTime()},uaMatch:function(a){a=a.toLowerCase();var b=r.exec(a)||s.exec(a)||t.exec(a)||a.indexOf("compatible")<0&&u.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},sub:function(){function a(b,c){return new a.fn.init(b,c)}e.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function(d,f){f&&f instanceof e&&!(f instanceof a)&&(f=a(f));return e.fn.init.call(this,d,f,b)},a.fn.init.prototype=a.fn;var b=a(c);return a},browser:{}}),e.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){I["[object "+b+"]"]=b.toLowerCase()}),z=e.uaMatch(y),z.browser&&(e.browser[z.browser]=!0,e.browser.version=z.version),e.browser.webkit&&(e.browser.safari=!0),j.test(" ")&&(k=/^[\s\xA0]+/,l=/[\s\xA0]+$/),h=e(c),c.addEventListener?B=function(){c.removeEventListener("DOMContentLoaded",B,!1),e.ready()}:c.attachEvent&&(B=function(){c.readyState==="complete"&&(c.detachEvent("onreadystatechange",B),e.ready())});return e}(),g={};f.Callbacks=function(a){a=a?g[a]||h(a):{};var c=[],d=[],e,i,j,k,l,m,n=function(b){var d,e,g,h,i;for(d=0,e=b.length;d<e;d++)g=b[d],h=f.type(g),h==="array"?n(g):h==="function"&&(!a.unique||!p.has(g))&&c.push(g)},o=function(b,f){f=f||[],e=!a.memory||[b,f],i=!0,j=!0,m=k||0,k=0,l=c.length;for(;c&&m<l;m++)if(c[m].apply(b,f)===!1&&a.stopOnFalse){e=!0;break}j=!1,c&&(a.once?e===!0?p.disable():c=[]:d&&d.length&&(e=d.shift(),p.fireWith(e[0],e[1])))},p={add:function(){if(c){var a=c.length;n(arguments),j?l=c.length:e&&e!==!0&&(k=a,o(e[0],e[1]))}return this},remove:function(){if(c){var b=arguments,d=0,e=b.length;for(;d<e;d++)for(var f=0;f<c.length;f++)if(b[d]===c[f]){j&&f<=l&&(l--,f<=m&&m--),c.splice(f--,1);if(a.unique)break}}return this},has:function(a){if(c){var b=0,d=c.length;for(;b<d;b++)if(a===c[b])return!0}return!1},empty:function(){c=[];return this},disable:function(){c=d=e=b;return this},disabled:function(){return!c},lock:function(){d=b,(!e||e===!0)&&p.disable();return this},locked:function(){return!d},fireWith:function(b,c){d&&(j?a.once||d.push([b,c]):(!a.once||!e)&&o(b,c));return this},fire:function(){p.fireWith(this,arguments);return this},fired:function(){return!!i}};return p};var i=[].slice;f.extend({Deferred:function(a){var b=f.Callbacks("once memory"),c=f.Callbacks("once memory"),d=f.Callbacks("memory"),e="pending",g={resolve:b,reject:c,notify:d},h={done:b.add,fail:c.add,progress:d.add,state:function(){return e},isResolved:b.fired,isRejected:c.fired,then:function(a,b,c){i.done(a).fail(b).progress(c);return this},always:function(){i.done.apply(i,arguments).fail.apply(i,arguments);return this},pipe:function(a,b,c){return f.Deferred(function(d){f.each({done:[a,"resolve"],fail:[b,"reject"],progress:[c,"notify"]},function(a,b){var c=b[0],e=b[1],g;f.isFunction(c)?i[a](function(){g=c.apply(this,arguments),g&&f.isFunction(g.promise)?g.promise().then(d.resolve,d.reject,d.notify):d[e+"With"](this===i?d:this,[g])}):i[a](d[e])})}).promise()},promise:function(a){if(a==null)a=h;else for(var b in h)a[b]=h[b];return a}},i=h.promise({}),j;for(j in g)i[j]=g[j].fire,i[j+"With"]=g[j].fireWith;i.done(function(){e="resolved"},c.disable,d.lock).fail(function(){e="rejected"},b.disable,d.lock),a&&a.call(i,i);return i},when:function(a){function m(a){return function(b){e[a]=arguments.length>1?i.call(arguments,0):b,j.notifyWith(k,e)}}function l(a){return function(c){b[a]=arguments.length>1?i.call(arguments,0):c,--g||j.resolveWith(j,b)}}var b=i.call(arguments,0),c=0,d=b.length,e=Array(d),g=d,h=d,j=d<=1&&a&&f.isFunction(a.promise)?a:f.Deferred(),k=j.promise();if(d>1){for(;c<d;c++)b[c]&&b[c].promise&&f.isFunction(b[c].promise)?b[c].promise().then(l(c),j.reject,m(c)):--g;g||j.resolveWith(j,b)}else j!==a&&j.resolveWith(j,d?[a]:[]);return k}}),f.support=function(){var b,d,e,g,h,i,j,k,l,m,n,o,p=c.createElement("div"),q=c.documentElement;p.setAttribute("className","t"),p.innerHTML="   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>",d=p.getElementsByTagName("*"),e=p.getElementsByTagName("a")[0];if(!d||!d.length||!e)return{};g=c.createElement("select"),h=g.appendChild(c.createElement("option")),i=p.getElementsByTagName("input")[0],b={leadingWhitespace:p.firstChild.nodeType===3,tbody:!p.getElementsByTagName("tbody").length,htmlSerialize:!!p.getElementsByTagName("link").length,style:/top/.test(e.getAttribute("style")),hrefNormalized:e.getAttribute("href")==="/a",opacity:/^0.55/.test(e.style.opacity),cssFloat:!!e.style.cssFloat,checkOn:i.value==="on",optSelected:h.selected,getSetAttribute:p.className!=="t",enctype:!!c.createElement("form").enctype,html5Clone:c.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,pixelMargin:!0},f.boxModel=b.boxModel=c.compatMode==="CSS1Compat",i.checked=!0,b.noCloneChecked=i.cloneNode(!0).checked,g.disabled=!0,b.optDisabled=!h.disabled;try{delete p.test}catch(r){b.deleteExpando=!1}!p.addEventListener&&p.attachEvent&&p.fireEvent&&(p.attachEvent("onclick",function(){b.noCloneEvent=!1}),p.cloneNode(!0).fireEvent("onclick")),i=c.createElement("input"),i.value="t",i.setAttribute("type","radio"),b.radioValue=i.value==="t",i.setAttribute("checked","checked"),i.setAttribute("name","t"),p.appendChild(i),j=c.createDocumentFragment(),j.appendChild(p.lastChild),b.checkClone=j.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=i.checked,j.removeChild(i),j.appendChild(p);if(p.attachEvent)for(n in{submit:1,change:1,focusin:1})m="on"+n,o=m in p,o||(p.setAttribute(m,"return;"),o=typeof p[m]=="function"),b[n+"Bubbles"]=o;j.removeChild(p),j=g=h=p=i=null,f(function(){var d,e,g,h,i,j,l,m,n,q,r,s,t,u=c.getElementsByTagName("body")[0];!u||(m=1,t="padding:0;margin:0;border:",r="position:absolute;top:0;left:0;width:1px;height:1px;",s=t+"0;visibility:hidden;",n="style='"+r+t+"5px solid #000;",q="<div "+n+"display:block;'><div style='"+t+"0;display:block;overflow:hidden;'></div></div>"+"<table "+n+"' cellpadding='0' cellspacing='0'>"+"<tr><td></td></tr></table>",d=c.createElement("div"),d.style.cssText=s+"width:0;height:0;position:static;top:0;margin-top:"+m+"px",u.insertBefore(d,u.firstChild),p=c.createElement("div"),d.appendChild(p),p.innerHTML="<table><tr><td style='"+t+"0;display:none'></td><td>t</td></tr></table>",k=p.getElementsByTagName("td"),o=k[0].offsetHeight===0,k[0].style.display="",k[1].style.display="none",b.reliableHiddenOffsets=o&&k[0].offsetHeight===0,a.getComputedStyle&&(p.innerHTML="",l=c.createElement("div"),l.style.width="0",l.style.marginRight="0",p.style.width="2px",p.appendChild(l),b.reliableMarginRight=(parseInt((a.getComputedStyle(l,null)||{marginRight:0}).marginRight,10)||0)===0),typeof p.style.zoom!="undefined"&&(p.innerHTML="",p.style.width=p.style.padding="1px",p.style.border=0,p.style.overflow="hidden",p.style.display="inline",p.style.zoom=1,b.inlineBlockNeedsLayout=p.offsetWidth===3,p.style.display="block",p.style.overflow="visible",p.innerHTML="<div style='width:5px;'></div>",b.shrinkWrapBlocks=p.offsetWidth!==3),p.style.cssText=r+s,p.innerHTML=q,e=p.firstChild,g=e.firstChild,i=e.nextSibling.firstChild.firstChild,j={doesNotAddBorder:g.offsetTop!==5,doesAddBorderForTableAndCells:i.offsetTop===5},g.style.position="fixed",g.style.top="20px",j.fixedPosition=g.offsetTop===20||g.offsetTop===15,g.style.position=g.style.top="",e.style.overflow="hidden",e.style.position="relative",j.subtractsBorderForOverflowNotVisible=g.offsetTop===-5,j.doesNotIncludeMarginInBodyOffset=u.offsetTop!==m,a.getComputedStyle&&(p.style.marginTop="1%",b.pixelMargin=(a.getComputedStyle(p,null)||{marginTop:0}).marginTop!=="1%"),typeof d.style.zoom!="undefined"&&(d.style.zoom=1),u.removeChild(d),l=p=d=null,f.extend(b,j))});return b}();var j=/^(?:\{.*\}|\[.*\])$/,k=/([A-Z])/g;f.extend({cache:{},uuid:0,expando:"jQuery"+(f.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){a=a.nodeType?f.cache[a[f.expando]]:a[f.expando];return!!a&&!m(a)},data:function(a,c,d,e){if(!!f.acceptData(a)){var g,h,i,j=f.expando,k=typeof c=="string",l=a.nodeType,m=l?f.cache:a,n=l?a[j]:a[j]&&j,o=c==="events";if((!n||!m[n]||!o&&!e&&!m[n].data)&&k&&d===b)return;n||(l?a[j]=n=++f.uuid:n=j),m[n]||(m[n]={},l||(m[n].toJSON=f.noop));if(typeof c=="object"||typeof c=="function")e?m[n]=f.extend(m[n],c):m[n].data=f.extend(m[n].data,c);g=h=m[n],e||(h.data||(h.data={}),h=h.data),d!==b&&(h[f.camelCase(c)]=d);if(o&&!h[c])return g.events;k?(i=h[c],i==null&&(i=h[f.camelCase(c)])):i=h;return i}},removeData:function(a,b,c){if(!!f.acceptData(a)){var d,e,g,h=f.expando,i=a.nodeType,j=i?f.cache:a,k=i?a[h]:h;if(!j[k])return;if(b){d=c?j[k]:j[k].data;if(d){f.isArray(b)||(b in d?b=[b]:(b=f.camelCase(b),b in d?b=[b]:b=b.split(" ")));for(e=0,g=b.length;e<g;e++)delete d[b[e]];if(!(c?m:f.isEmptyObject)(d))return}}if(!c){delete j[k].data;if(!m(j[k]))return}f.support.deleteExpando||!j.setInterval?delete j[k]:j[k]=null,i&&(f.support.deleteExpando?delete a[h]:a.removeAttribute?a.removeAttribute(h):a[h]=null)}},_data:function(a,b,c){return f.data(a,b,c,!0)},acceptData:function(a){if(a.nodeName){var b=f.noData[a.nodeName.toLowerCase()];if(b)return b!==!0&&a.getAttribute("classid")===b}return!0}}),f.fn.extend({data:function(a,c){var d,e,g,h,i,j=this[0],k=0,m=null;if(a===b){if(this.length){m=f.data(j);if(j.nodeType===1&&!f._data(j,"parsedAttrs")){g=j.attributes;for(i=g.length;k<i;k++)h=g[k].name,h.indexOf("data-")===0&&(h=f.camelCase(h.substring(5)),l(j,h,m[h]));f._data(j,"parsedAttrs",!0)}}return m}if(typeof a=="object")return this.each(function(){f.data(this,a)});d=a.split(".",2),d[1]=d[1]?"."+d[1]:"",e=d[1]+"!";return f.access(this,function(c){if(c===b){m=this.triggerHandler("getData"+e,[d[0]]),m===b&&j&&(m=f.data(j,a),m=l(j,a,m));return m===b&&d[1]?this.data(d[0]):m}d[1]=c,this.each(function(){var b=f(this);b.triggerHandler("setData"+e,d),f.data(this,a,c),b.triggerHandler("changeData"+e,d)})},null,c,arguments.length>1,null,!1)},removeData:function(a){return this.each(function(){f.removeData(this,a)})}}),f.extend({_mark:function(a,b){a&&(b=(b||"fx")+"mark",f._data(a,b,(f._data(a,b)||0)+1))},_unmark:function(a,b,c){a!==!0&&(c=b,b=a,a=!1);if(b){c=c||"fx";var d=c+"mark",e=a?0:(f._data(b,d)||1)-1;e?f._data(b,d,e):(f.removeData(b,d,!0),n(b,c,"mark"))}},queue:function(a,b,c){var d;if(a){b=(b||"fx")+"queue",d=f._data(a,b),c&&(!d||f.isArray(c)?d=f._data(a,b,f.makeArray(c)):d.push(c));return d||[]}},dequeue:function(a,b){b=b||"fx";var c=f.queue(a,b),d=c.shift(),e={};d==="inprogress"&&(d=c.shift()),d&&(b==="fx"&&c.unshift("inprogress"),f._data(a,b+".run",e),d.call(a,function(){f.dequeue(a,b)},e)),c.length||(f.removeData(a,b+"queue "+b+".run",!0),n(a,b,"queue"))}}),f.fn.extend({queue:function(a,c){var d=2;typeof a!="string"&&(c=a,a="fx",d--);if(arguments.length<d)return f.queue(this[0],a);return c===b?this:this.each(function(){var b=f.queue(this,a,c);a==="fx"&&b[0]!=="inprogress"&&f.dequeue(this,a)})},dequeue:function(a){return this.each(function(){f.dequeue(this,a)})},delay:function(a,b){a=f.fx?f.fx.speeds[a]||a:a,b=b||"fx";return this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){function m(){--h||d.resolveWith(e,[e])}typeof a!="string"&&(c=a,a=b),a=a||"fx";var d=f.Deferred(),e=this,g=e.length,h=1,i=a+"defer",j=a+"queue",k=a+"mark",l;while(g--)if(l=f.data(e[g],i,b,!0)||(f.data(e[g],j,b,!0)||f.data(e[g],k,b,!0))&&f.data(e[g],i,f.Callbacks("once memory"),!0))h++,l.add(m);m();return d.promise(c)}});var o=/[\n\t\r]/g,p=/\s+/,q=/\r/g,r=/^(?:button|input)$/i,s=/^(?:button|input|object|select|textarea)$/i,t=/^a(?:rea)?$/i,u=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,v=f.support.getSetAttribute,w,x,y;f.fn.extend({attr:function(a,b){return f.access(this,f.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){f.removeAttr(this,a)})},prop:function(a,b){return f.access(this,f.prop,a,b,arguments.length>1)},removeProp:function(a){a=f.propFix[a]||a;return this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,g,h,i;if(f.isFunction(a))return this.each(function(b){f(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(p);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{g=" "+e.className+" ";for(h=0,i=b.length;h<i;h++)~g.indexOf(" "+b[h]+" ")||(g+=b[h]+" ");e.className=f.trim(g)}}}return this},removeClass:function(a){var c,d,e,g,h,i,j;if(f.isFunction(a))return this.each(function(b){f(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(p);for(d=0,e=this.length;d<e;d++){g=this[d];if(g.nodeType===1&&g.className)if(a){h=(" "+g.className+" ").replace(o," ");for(i=0,j=c.length;i<j;i++)h=h.replace(" "+c[i]+" "," ");g.className=f.trim(h)}else g.className=""}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";if(f.isFunction(a))return this.each(function(c){f(this).toggleClass(a.call(this,c,this.className,b),b)});return this.each(function(){if(c==="string"){var e,g=0,h=f(this),i=b,j=a.split(p);while(e=j[g++])i=d?i:!h.hasClass(e),h[i?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&f._data(this,"__className__",this.className),this.className=this.className||a===!1?"":f._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ",c=0,d=this.length;for(;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(o," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e,g=this[0];{if(!!arguments.length){e=f.isFunction(a);return this.each(function(d){var g=f(this),h;if(this.nodeType===1){e?h=a.call(this,d,g.val()):h=a,h==null?h="":typeof h=="number"?h+="":f.isArray(h)&&(h=f.map(h,function(a){return a==null?"":a+""})),c=f.valHooks[this.type]||f.valHooks[this.nodeName.toLowerCase()];if(!c||!("set"in c)||c.set(this,h,"value")===b)this.value=h}})}if(g){c=f.valHooks[g.type]||f.valHooks[g.nodeName.toLowerCase()];if(c&&"get"in c&&(d=c.get(g,"value"))!==b)return d;d=g.value;return typeof d=="string"?d.replace(q,""):d==null?"":d}}}}),f.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,g=a.selectedIndex,h=[],i=a.options,j=a.type==="select-one";if(g<0)return null;c=j?g:0,d=j?g+1:i.length;for(;c<d;c++){e=i[c];if(e.selected&&(f.support.optDisabled?!e.disabled:e.getAttribute("disabled")===null)&&(!e.parentNode.disabled||!f.nodeName(e.parentNode,"optgroup"))){b=f(e).val();if(j)return b;h.push(b)}}if(j&&!h.length&&i.length)return f(i[g]).val();return h},set:function(a,b){var c=f.makeArray(b);f(a).find("option").each(function(){this.selected=f.inArray(f(this).val(),c)>=0}),c.length||(a.selectedIndex=-1);return c}}},attrFn:{val:!0,css:!0,html:!0,text:!0,data:!0,width:!0,height:!0,offset:!0},attr:function(a,c,d,e){var g,h,i,j=a.nodeType;if(!!a&&j!==3&&j!==8&&j!==2){if(e&&c in f.attrFn)return f(a)[c](d);if(typeof a.getAttribute=="undefined")return f.prop(a,c,d);i=j!==1||!f.isXMLDoc(a),i&&(c=c.toLowerCase(),h=f.attrHooks[c]||(u.test(c)?x:w));if(d!==b){if(d===null){f.removeAttr(a,c);return}if(h&&"set"in h&&i&&(g=h.set(a,d,c))!==b)return g;a.setAttribute(c,""+d);return d}if(h&&"get"in h&&i&&(g=h.get(a,c))!==null)return g;g=a.getAttribute(c);return g===null?b:g}},removeAttr:function(a,b){var c,d,e,g,h,i=0;if(b&&a.nodeType===1){d=b.toLowerCase().split(p),g=d.length;for(;i<g;i++)e=d[i],e&&(c=f.propFix[e]||e,h=u.test(e),h||f.attr(a,e,""),a.removeAttribute(v?e:c),h&&c in a&&(a[c]=!1))}},attrHooks:{type:{set:function(a,b){if(r.test(a.nodeName)&&a.parentNode)f.error("type property can't be changed");else if(!f.support.radioValue&&b==="radio"&&f.nodeName(a,"input")){var c=a.value;a.setAttribute("type",b),c&&(a.value=c);return b}}},value:{get:function(a,b){if(w&&f.nodeName(a,"button"))return w.get(a,b);return b in a?a.value:null},set:function(a,b,c){if(w&&f.nodeName(a,"button"))return w.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,g,h,i=a.nodeType;if(!!a&&i!==3&&i!==8&&i!==2){h=i!==1||!f.isXMLDoc(a),h&&(c=f.propFix[c]||c,g=f.propHooks[c]);return d!==b?g&&"set"in g&&(e=g.set(a,d,c))!==b?e:a[c]=d:g&&"get"in g&&(e=g.get(a,c))!==null?e:a[c]}},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):s.test(a.nodeName)||t.test(a.nodeName)&&a.href?0:b}}}}),f.attrHooks.tabindex=f.propHooks.tabIndex,x={get:function(a,c){var d,e=f.prop(a,c);return e===!0||typeof e!="boolean"&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;b===!1?f.removeAttr(a,c):(d=f.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase()));return c}},v||(y={name:!0,id:!0,coords:!0},w=f.valHooks.button={get:function(a,c){var d;d=a.getAttributeNode(c);return d&&(y[c]?d.nodeValue!=="":d.specified)?d.nodeValue:b},set:function(a,b,d){var e=a.getAttributeNode(d);e||(e=c.createAttribute(d),a.setAttributeNode(e));return e.nodeValue=b+""}},f.attrHooks.tabindex.set=w.set,f.each(["width","height"],function(a,b){f.attrHooks[b]=f.extend(f.attrHooks[b],{set:function(a,c){if(c===""){a.setAttribute(b,"auto");return c}}})}),f.attrHooks.contenteditable={get:w.get,set:function(a,b,c){b===""&&(b="false"),w.set(a,b,c)}}),f.support.hrefNormalized||f.each(["href","src","width","height"],function(a,c){f.attrHooks[c]=f.extend(f.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),f.support.style||(f.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),f.support.optSelected||(f.propHooks.selected=f.extend(f.propHooks.selected,{get:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex);return null}})),f.support.enctype||(f.propFix.enctype="encoding"),f.support.checkOn||f.each(["radio","checkbox"],function(){f.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]=f.extend(f.valHooks[this],{set:function(a,b){if(f.isArray(b))return a.checked=f.inArray(f(a).val(),b)>=0}})});var z=/^(?:textarea|input|select)$/i,A=/^([^\.]*)?(?:\.(.+))?$/,B=/(?:^|\s)hover(\.\S+)?\b/,C=/^key/,D=/^(?:mouse|contextmenu)|click/,E=/^(?:focusinfocus|focusoutblur)$/,F=/^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,G=function(
a){var b=F.exec(a);b&&(b[1]=(b[1]||"").toLowerCase(),b[3]=b[3]&&new RegExp("(?:^|\\s)"+b[3]+"(?:\\s|$)"));return b},H=function(a,b){var c=a.attributes||{};return(!b[1]||a.nodeName.toLowerCase()===b[1])&&(!b[2]||(c.id||{}).value===b[2])&&(!b[3]||b[3].test((c["class"]||{}).value))},I=function(a){return f.event.special.hover?a:a.replace(B,"mouseenter$1 mouseleave$1")};f.event={add:function(a,c,d,e,g){var h,i,j,k,l,m,n,o,p,q,r,s;if(!(a.nodeType===3||a.nodeType===8||!c||!d||!(h=f._data(a)))){d.handler&&(p=d,d=p.handler,g=p.selector),d.guid||(d.guid=f.guid++),j=h.events,j||(h.events=j={}),i=h.handle,i||(h.handle=i=function(a){return typeof f!="undefined"&&(!a||f.event.triggered!==a.type)?f.event.dispatch.apply(i.elem,arguments):b},i.elem=a),c=f.trim(I(c)).split(" ");for(k=0;k<c.length;k++){l=A.exec(c[k])||[],m=l[1],n=(l[2]||"").split(".").sort(),s=f.event.special[m]||{},m=(g?s.delegateType:s.bindType)||m,s=f.event.special[m]||{},o=f.extend({type:m,origType:l[1],data:e,handler:d,guid:d.guid,selector:g,quick:g&&G(g),namespace:n.join(".")},p),r=j[m];if(!r){r=j[m]=[],r.delegateCount=0;if(!s.setup||s.setup.call(a,e,n,i)===!1)a.addEventListener?a.addEventListener(m,i,!1):a.attachEvent&&a.attachEvent("on"+m,i)}s.add&&(s.add.call(a,o),o.handler.guid||(o.handler.guid=d.guid)),g?r.splice(r.delegateCount++,0,o):r.push(o),f.event.global[m]=!0}a=null}},global:{},remove:function(a,b,c,d,e){var g=f.hasData(a)&&f._data(a),h,i,j,k,l,m,n,o,p,q,r,s;if(!!g&&!!(o=g.events)){b=f.trim(I(b||"")).split(" ");for(h=0;h<b.length;h++){i=A.exec(b[h])||[],j=k=i[1],l=i[2];if(!j){for(j in o)f.event.remove(a,j+b[h],c,d,!0);continue}p=f.event.special[j]||{},j=(d?p.delegateType:p.bindType)||j,r=o[j]||[],m=r.length,l=l?new RegExp("(^|\\.)"+l.split(".").sort().join("\\.(?:.*\\.)?")+"(\\.|$)"):null;for(n=0;n<r.length;n++)s=r[n],(e||k===s.origType)&&(!c||c.guid===s.guid)&&(!l||l.test(s.namespace))&&(!d||d===s.selector||d==="**"&&s.selector)&&(r.splice(n--,1),s.selector&&r.delegateCount--,p.remove&&p.remove.call(a,s));r.length===0&&m!==r.length&&((!p.teardown||p.teardown.call(a,l)===!1)&&f.removeEvent(a,j,g.handle),delete o[j])}f.isEmptyObject(o)&&(q=g.handle,q&&(q.elem=null),f.removeData(a,["events","handle"],!0))}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,g){if(!e||e.nodeType!==3&&e.nodeType!==8){var h=c.type||c,i=[],j,k,l,m,n,o,p,q,r,s;if(E.test(h+f.event.triggered))return;h.indexOf("!")>=0&&(h=h.slice(0,-1),k=!0),h.indexOf(".")>=0&&(i=h.split("."),h=i.shift(),i.sort());if((!e||f.event.customEvent[h])&&!f.event.global[h])return;c=typeof c=="object"?c[f.expando]?c:new f.Event(h,c):new f.Event(h),c.type=h,c.isTrigger=!0,c.exclusive=k,c.namespace=i.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+i.join("\\.(?:.*\\.)?")+"(\\.|$)"):null,o=h.indexOf(":")<0?"on"+h:"";if(!e){j=f.cache;for(l in j)j[l].events&&j[l].events[h]&&f.event.trigger(c,d,j[l].handle.elem,!0);return}c.result=b,c.target||(c.target=e),d=d!=null?f.makeArray(d):[],d.unshift(c),p=f.event.special[h]||{};if(p.trigger&&p.trigger.apply(e,d)===!1)return;r=[[e,p.bindType||h]];if(!g&&!p.noBubble&&!f.isWindow(e)){s=p.delegateType||h,m=E.test(s+h)?e:e.parentNode,n=null;for(;m;m=m.parentNode)r.push([m,s]),n=m;n&&n===e.ownerDocument&&r.push([n.defaultView||n.parentWindow||a,s])}for(l=0;l<r.length&&!c.isPropagationStopped();l++)m=r[l][0],c.type=r[l][1],q=(f._data(m,"events")||{})[c.type]&&f._data(m,"handle"),q&&q.apply(m,d),q=o&&m[o],q&&f.acceptData(m)&&q.apply(m,d)===!1&&c.preventDefault();c.type=h,!g&&!c.isDefaultPrevented()&&(!p._default||p._default.apply(e.ownerDocument,d)===!1)&&(h!=="click"||!f.nodeName(e,"a"))&&f.acceptData(e)&&o&&e[h]&&(h!=="focus"&&h!=="blur"||c.target.offsetWidth!==0)&&!f.isWindow(e)&&(n=e[o],n&&(e[o]=null),f.event.triggered=h,e[h](),f.event.triggered=b,n&&(e[o]=n));return c.result}},dispatch:function(c){c=f.event.fix(c||a.event);var d=(f._data(this,"events")||{})[c.type]||[],e=d.delegateCount,g=[].slice.call(arguments,0),h=!c.exclusive&&!c.namespace,i=f.event.special[c.type]||{},j=[],k,l,m,n,o,p,q,r,s,t,u;g[0]=c,c.delegateTarget=this;if(!i.preDispatch||i.preDispatch.call(this,c)!==!1){if(e&&(!c.button||c.type!=="click")){n=f(this),n.context=this.ownerDocument||this;for(m=c.target;m!=this;m=m.parentNode||this)if(m.disabled!==!0){p={},r=[],n[0]=m;for(k=0;k<e;k++)s=d[k],t=s.selector,p[t]===b&&(p[t]=s.quick?H(m,s.quick):n.is(t)),p[t]&&r.push(s);r.length&&j.push({elem:m,matches:r})}}d.length>e&&j.push({elem:this,matches:d.slice(e)});for(k=0;k<j.length&&!c.isPropagationStopped();k++){q=j[k],c.currentTarget=q.elem;for(l=0;l<q.matches.length&&!c.isImmediatePropagationStopped();l++){s=q.matches[l];if(h||!c.namespace&&!s.namespace||c.namespace_re&&c.namespace_re.test(s.namespace))c.data=s.data,c.handleObj=s,o=((f.event.special[s.origType]||{}).handle||s.handler).apply(q.elem,g),o!==b&&(c.result=o,o===!1&&(c.preventDefault(),c.stopPropagation()))}}i.postDispatch&&i.postDispatch.call(this,c);return c.result}},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){a.which==null&&(a.which=b.charCode!=null?b.charCode:b.keyCode);return a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,d){var e,f,g,h=d.button,i=d.fromElement;a.pageX==null&&d.clientX!=null&&(e=a.target.ownerDocument||c,f=e.documentElement,g=e.body,a.pageX=d.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=d.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)),!a.relatedTarget&&i&&(a.relatedTarget=i===a.target?d.toElement:i),!a.which&&h!==b&&(a.which=h&1?1:h&2?3:h&4?2:0);return a}},fix:function(a){if(a[f.expando])return a;var d,e,g=a,h=f.event.fixHooks[a.type]||{},i=h.props?this.props.concat(h.props):this.props;a=f.Event(g);for(d=i.length;d;)e=i[--d],a[e]=g[e];a.target||(a.target=g.srcElement||c),a.target.nodeType===3&&(a.target=a.target.parentNode),a.metaKey===b&&(a.metaKey=a.ctrlKey);return h.filter?h.filter(a,g):a},special:{ready:{setup:f.bindReady},load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(a,b,c){f.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=f.extend(new f.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?f.event.trigger(e,null,b):f.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},f.event.handle=f.event.dispatch,f.removeEvent=c.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){a.detachEvent&&a.detachEvent("on"+b,c)},f.Event=function(a,b){if(!(this instanceof f.Event))return new f.Event(a,b);a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?K:J):this.type=a,b&&f.extend(this,b),this.timeStamp=a&&a.timeStamp||f.now(),this[f.expando]=!0},f.Event.prototype={preventDefault:function(){this.isDefaultPrevented=K;var a=this.originalEvent;!a||(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=K;var a=this.originalEvent;!a||(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=K,this.stopPropagation()},isDefaultPrevented:J,isPropagationStopped:J,isImmediatePropagationStopped:J},f.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){f.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c=this,d=a.relatedTarget,e=a.handleObj,g=e.selector,h;if(!d||d!==c&&!f.contains(c,d))a.type=e.origType,h=e.handler.apply(this,arguments),a.type=b;return h}}}),f.support.submitBubbles||(f.event.special.submit={setup:function(){if(f.nodeName(this,"form"))return!1;f.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=f.nodeName(c,"input")||f.nodeName(c,"button")?c.form:b;d&&!d._submit_attached&&(f.event.add(d,"submit._submit",function(a){a._submit_bubble=!0}),d._submit_attached=!0)})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&f.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){if(f.nodeName(this,"form"))return!1;f.event.remove(this,"._submit")}}),f.support.changeBubbles||(f.event.special.change={setup:function(){if(z.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")f.event.add(this,"propertychange._change",function(a){a.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),f.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1,f.event.simulate("change",this,a,!0))});return!1}f.event.add(this,"beforeactivate._change",function(a){var b=a.target;z.test(b.nodeName)&&!b._change_attached&&(f.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&!a.isTrigger&&f.event.simulate("change",this.parentNode,a,!0)}),b._change_attached=!0)})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!=="radio"&&b.type!=="checkbox")return a.handleObj.handler.apply(this,arguments)},teardown:function(){f.event.remove(this,"._change");return z.test(this.nodeName)}}),f.support.focusinBubbles||f.each({focus:"focusin",blur:"focusout"},function(a,b){var d=0,e=function(a){f.event.simulate(b,a.target,f.event.fix(a),!0)};f.event.special[b]={setup:function(){d++===0&&c.addEventListener(a,e,!0)},teardown:function(){--d===0&&c.removeEventListener(a,e,!0)}}}),f.fn.extend({on:function(a,c,d,e,g){var h,i;if(typeof a=="object"){typeof c!="string"&&(d=d||c,c=b);for(i in a)this.on(i,c,d,a[i],g);return this}d==null&&e==null?(e=c,d=c=b):e==null&&(typeof c=="string"?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=J;else if(!e)return this;g===1&&(h=e,e=function(a){f().off(a);return h.apply(this,arguments)},e.guid=h.guid||(h.guid=f.guid++));return this.each(function(){f.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,c,d){if(a&&a.preventDefault&&a.handleObj){var e=a.handleObj;f(a.delegateTarget).off(e.namespace?e.origType+"."+e.namespace:e.origType,e.selector,e.handler);return this}if(typeof a=="object"){for(var g in a)this.off(g,c,a[g]);return this}if(c===!1||typeof c=="function")d=c,c=b;d===!1&&(d=J);return this.each(function(){f.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){f(this.context).on(a,this.selector,b,c);return this},die:function(a,b){f(this.context).off(a,this.selector||"**",b);return this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length==1?this.off(a,"**"):this.off(b,a,c)},trigger:function(a,b){return this.each(function(){f.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return f.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||f.guid++,d=0,e=function(c){var e=(f._data(this,"lastToggle"+a.guid)||0)%d;f._data(this,"lastToggle"+a.guid,e+1),c.preventDefault();return b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){f.fn[b]=function(a,c){c==null&&(c=a,a=null);return arguments.length>0?this.on(b,null,a,c):this.trigger(b)},f.attrFn&&(f.attrFn[b]=!0),C.test(b)&&(f.event.fixHooks[b]=f.event.keyHooks),D.test(b)&&(f.event.fixHooks[b]=f.event.mouseHooks)}),function(){function x(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}if(j.nodeType===1){g||(j[d]=c,j.sizset=h);if(typeof b!="string"){if(j===b){k=!0;break}}else if(m.filter(b,[j]).length>0){k=j;break}}j=j[a]}e[h]=k}}}function w(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}j.nodeType===1&&!g&&(j[d]=c,j.sizset=h);if(j.nodeName.toLowerCase()===b){k=j;break}j=j[a]}e[h]=k}}}var a=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,d="sizcache"+(Math.random()+"").replace(".",""),e=0,g=Object.prototype.toString,h=!1,i=!0,j=/\\/g,k=/\r\n/g,l=/\W/;[0,0].sort(function(){i=!1;return 0});var m=function(b,d,e,f){e=e||[],d=d||c;var h=d;if(d.nodeType!==1&&d.nodeType!==9)return[];if(!b||typeof b!="string")return e;var i,j,k,l,n,q,r,t,u=!0,v=m.isXML(d),w=[],x=b;do{a.exec(""),i=a.exec(x);if(i){x=i[3],w.push(i[1]);if(i[2]){l=i[3];break}}}while(i);if(w.length>1&&p.exec(b))if(w.length===2&&o.relative[w[0]])j=y(w[0]+w[1],d,f);else{j=o.relative[w[0]]?[d]:m(w.shift(),d);while(w.length)b=w.shift(),o.relative[b]&&(b+=w.shift()),j=y(b,j,f)}else{!f&&w.length>1&&d.nodeType===9&&!v&&o.match.ID.test(w[0])&&!o.match.ID.test(w[w.length-1])&&(n=m.find(w.shift(),d,v),d=n.expr?m.filter(n.expr,n.set)[0]:n.set[0]);if(d){n=f?{expr:w.pop(),set:s(f)}:m.find(w.pop(),w.length===1&&(w[0]==="~"||w[0]==="+")&&d.parentNode?d.parentNode:d,v),j=n.expr?m.filter(n.expr,n.set):n.set,w.length>0?k=s(j):u=!1;while(w.length)q=w.pop(),r=q,o.relative[q]?r=w.pop():q="",r==null&&(r=d),o.relative[q](k,r,v)}else k=w=[]}k||(k=j),k||m.error(q||b);if(g.call(k)==="[object Array]")if(!u)e.push.apply(e,k);else if(d&&d.nodeType===1)for(t=0;k[t]!=null;t++)k[t]&&(k[t]===!0||k[t].nodeType===1&&m.contains(d,k[t]))&&e.push(j[t]);else for(t=0;k[t]!=null;t++)k[t]&&k[t].nodeType===1&&e.push(j[t]);else s(k,e);l&&(m(l,h,e,f),m.uniqueSort(e));return e};m.uniqueSort=function(a){if(u){h=i,a.sort(u);if(h)for(var b=1;b<a.length;b++)a[b]===a[b-1]&&a.splice(b--,1)}return a},m.matches=function(a,b){return m(a,null,null,b)},m.matchesSelector=function(a,b){return m(b,null,null,[a]).length>0},m.find=function(a,b,c){var d,e,f,g,h,i;if(!a)return[];for(e=0,f=o.order.length;e<f;e++){h=o.order[e];if(g=o.leftMatch[h].exec(a)){i=g[1],g.splice(1,1);if(i.substr(i.length-1)!=="\\"){g[1]=(g[1]||"").replace(j,""),d=o.find[h](g,b,c);if(d!=null){a=a.replace(o.match[h],"");break}}}}d||(d=typeof b.getElementsByTagName!="undefined"?b.getElementsByTagName("*"):[]);return{set:d,expr:a}},m.filter=function(a,c,d,e){var f,g,h,i,j,k,l,n,p,q=a,r=[],s=c,t=c&&c[0]&&m.isXML(c[0]);while(a&&c.length){for(h in o.filter)if((f=o.leftMatch[h].exec(a))!=null&&f[2]){k=o.filter[h],l=f[1],g=!1,f.splice(1,1);if(l.substr(l.length-1)==="\\")continue;s===r&&(r=[]);if(o.preFilter[h]){f=o.preFilter[h](f,s,d,r,e,t);if(!f)g=i=!0;else if(f===!0)continue}if(f)for(n=0;(j=s[n])!=null;n++)j&&(i=k(j,f,n,s),p=e^i,d&&i!=null?p?g=!0:s[n]=!1:p&&(r.push(j),g=!0));if(i!==b){d||(s=r),a=a.replace(o.match[h],"");if(!g)return[];break}}if(a===q)if(g==null)m.error(a);else break;q=a}return s},m.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)};var n=m.getText=function(a){var b,c,d=a.nodeType,e="";if(d){if(d===1||d===9||d===11){if(typeof a.textContent=="string")return a.textContent;if(typeof a.innerText=="string")return a.innerText.replace(k,"");for(a=a.firstChild;a;a=a.nextSibling)e+=n(a)}else if(d===3||d===4)return a.nodeValue}else for(b=0;c=a[b];b++)c.nodeType!==8&&(e+=n(c));return e},o=m.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")},type:function(a){return a.getAttribute("type")}},relative:{"+":function(a,b){var c=typeof b=="string",d=c&&!l.test(b),e=c&&!d;d&&(b=b.toLowerCase());for(var f=0,g=a.length,h;f<g;f++)if(h=a[f]){while((h=h.previousSibling)&&h.nodeType!==1);a[f]=e||h&&h.nodeName.toLowerCase()===b?h||!1:h===b}e&&m.filter(b,a,!0)},">":function(a,b){var c,d=typeof b=="string",e=0,f=a.length;if(d&&!l.test(b)){b=b.toLowerCase();for(;e<f;e++){c=a[e];if(c){var g=c.parentNode;a[e]=g.nodeName.toLowerCase()===b?g:!1}}}else{for(;e<f;e++)c=a[e],c&&(a[e]=d?c.parentNode:c.parentNode===b);d&&m.filter(b,a,!0)}},"":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("parentNode",b,f,a,d,c)},"~":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("previousSibling",b,f,a,d,c)}},find:{ID:function(a,b,c){if(typeof b.getElementById!="undefined"&&!c){var d=b.getElementById(a[1]);return d&&d.parentNode?[d]:[]}},NAME:function(a,b){if(typeof b.getElementsByName!="undefined"){var c=[],d=b.getElementsByName(a[1]);for(var e=0,f=d.length;e<f;e++)d[e].getAttribute("name")===a[1]&&c.push(d[e]);return c.length===0?null:c}},TAG:function(a,b){if(typeof b.getElementsByTagName!="undefined")return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e,f){a=" "+a[1].replace(j,"")+" ";if(f)return a;for(var g=0,h;(h=b[g])!=null;g++)h&&(e^(h.className&&(" "+h.className+" ").replace(/[\t\n\r]/g," ").indexOf(a)>=0)?c||d.push(h):c&&(b[g]=!1));return!1},ID:function(a){return a[1].replace(j,"")},TAG:function(a,b){return a[1].replace(j,"").toLowerCase()},CHILD:function(a){if(a[1]==="nth"){a[2]||m.error(a[0]),a[2]=a[2].replace(/^\+|\s*/g,"");var b=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2]==="even"&&"2n"||a[2]==="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}else a[2]&&m.error(a[0]);a[0]=e++;return a},ATTR:function(a,b,c,d,e,f){var g=a[1]=a[1].replace(j,"");!f&&o.attrMap[g]&&(a[1]=o.attrMap[g]),a[4]=(a[4]||a[5]||"").replace(j,""),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(b,c,d,e,f){if(b[1]==="not")if((a.exec(b[3])||"").length>1||/^\w/.test(b[3]))b[3]=m(b[3],null,null,c);else{var g=m.filter(b[3],c,d,!0^f);d||e.push.apply(e,g);return!1}else if(o.match.POS.test(b[0])||o.match.CHILD.test(b[0]))return!0;return b},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode&&a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!m(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){var b=a.getAttribute("type"),c=a.type;return a.nodeName.toLowerCase()==="input"&&"text"===c&&(b===c||b===null)},radio:function(a){return a.nodeName.toLowerCase()==="input"&&"radio"===a.type},checkbox:function(a){return a.nodeName.toLowerCase()==="input"&&"checkbox"===a.type},file:function(a){return a.nodeName.toLowerCase()==="input"&&"file"===a.type},password:function(a){return a.nodeName.toLowerCase()==="input"&&"password"===a.type},submit:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"submit"===a.type},image:function(a){return a.nodeName.toLowerCase()==="input"&&"image"===a.type},reset:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"reset"===a.type},button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&"button"===a.type||b==="button"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)},focus:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0===b},eq:function(a,b,c){return c[3]-0===b}},filter:{PSEUDO:function(a,b,c,d){var e=b[1],f=o.filters[e];if(f)return f(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||n([a])||"").indexOf(b[3])>=0;if(e==="not"){var g=b[3];for(var h=0,i=g.length;h<i;h++)if(g[h]===a)return!1;return!0}m.error(e)},CHILD:function(a,b){var c,e,f,g,h,i,j,k=b[1],l=a;switch(k){case"only":case"first":while(l=l.previousSibling)if(l.nodeType===1)return!1;if(k==="first")return!0;l=a;case"last":while(l=l.nextSibling)if(l.nodeType===1)return!1;return!0;case"nth":c=b[2],e=b[3];if(c===1&&e===0)return!0;f=b[0],g=a.parentNode;if(g&&(g[d]!==f||!a.nodeIndex)){i=0;for(l=g.firstChild;l;l=l.nextSibling)l.nodeType===1&&(l.nodeIndex=++i);g[d]=f}j=a.nodeIndex-e;return c===0?j===0:j%c===0&&j/c>=0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||!!a.nodeName&&a.nodeName.toLowerCase()===b},CLASS:function(a,b){return(" "+(a.className||a.getAttribute("class"))+" ").indexOf(b)>-1},ATTR:function(a,b){var c=b[1],d=m.attr?m.attr(a,c):o.attrHandle[c]?o.attrHandle[c](a):a[c]!=null?a[c]:a.getAttribute(c),e=d+"",f=b[2],g=b[4];return d==null?f==="!=":!f&&m.attr?d!=null:f==="="?e===g:f==="*="?e.indexOf(g)>=0:f==="~="?(" "+e+" ").indexOf(g)>=0:g?f==="!="?e!==g:f==="^="?e.indexOf(g)===0:f==="$="?e.substr(e.length-g.length)===g:f==="|="?e===g||e.substr(0,g.length+1)===g+"-":!1:e&&d!==!1},POS:function(a,b,c,d){var e=b[2],f=o.setFilters[e];if(f)return f(a,c,b,d)}}},p=o.match.POS,q=function(a,b){return"\\"+(b-0+1)};for(var r in o.match)o.match[r]=new RegExp(o.match[r].source+/(?![^\[]*\])(?![^\(]*\))/.source),o.leftMatch[r]=new RegExp(/(^(?:.|\r|\n)*?)/.source+o.match[r].source.replace(/\\(\d+)/g,q));o.match.globalPOS=p;var s=function(a,b){a=Array.prototype.slice.call(a,0);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(c.documentElement.childNodes,0)[0].nodeType}catch(t){s=function(a,b){var c=0,d=b||[];if(g.call(a)==="[object Array]")Array.prototype.push.apply(d,a);else if(typeof a.length=="number")for(var e=a.length;c<e;c++)d.push(a[c]);else for(;a[c];c++)d.push(a[c]);return d}}var u,v;c.documentElement.compareDocumentPosition?u=function(a,b){if(a===b){h=!0;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition)return a.compareDocumentPosition?-1:1;return a.compareDocumentPosition(b)&4?-1:1}:(u=function(a,b){if(a===b){h=!0;return 0}if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,i=b.parentNode,j=g;if(g===i)return v(a,b);if(!g)return-1;if(!i)return 1;while(j)e.unshift(j),j=j.parentNode;j=i;while(j)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;k<c&&k<d;k++)if(e[k]!==f[k])return v(e[k],f[k]);return k===c?v(a,f[k],-1):v(e[k],b,1)},v=function(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}),function(){var a=c.createElement("div"),d="script"+(new Date).getTime(),e=c.documentElement;a.innerHTML="<a name='"+d+"'/>",e.insertBefore(a,e.firstChild),c.getElementById(d)&&(o.find.ID=function(a,c,d){if(typeof c.getElementById!="undefined"&&!d){var e=c.getElementById(a[1]);return e?e.id===a[1]||typeof e.getAttributeNode!="undefined"&&e.getAttributeNode("id").nodeValue===a[1]?[e]:b:[]}},o.filter.ID=function(a,b){var c=typeof a.getAttributeNode!="undefined"&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),e.removeChild(a),e=a=null}(),function(){var a=c.createElement("div");a.appendChild(c.createComment("")),a.getElementsByTagName("*").length>0&&(o.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c}),a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!="undefined"&&a.firstChild.getAttribute("href")!=="#"&&(o.attrHandle.href=function(a){return a.getAttribute("href",2)}),a=null}(),c.querySelectorAll&&function(){var a=m,b=c.createElement("div"),d="__sizzle__";b.innerHTML="<p class='TEST'></p>";if(!b.querySelectorAll||b.querySelectorAll(".TEST").length!==0){m=function(b,e,f,g){e=e||c;if(!g&&!m.isXML(e)){var h=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);if(h&&(e.nodeType===1||e.nodeType===9)){if(h[1])return s(e.getElementsByTagName(b),f);if(h[2]&&o.find.CLASS&&e.getElementsByClassName)return s(e.getElementsByClassName(h[2]),f)}if(e.nodeType===9){if(b==="body"&&e.body)return s([e.body],f);if(h&&h[3]){var i=e.getElementById(h[3]);if(!i||!i.parentNode)return s([],f);if(i.id===h[3])return s([i],f)}try{return s(e.querySelectorAll(b),f)}catch(j){}}else if(e.nodeType===1&&e.nodeName.toLowerCase()!=="object"){var k=e,l=e.getAttribute("id"),n=l||d,p=e.parentNode,q=/^\s*[+~]/.test(b);l?n=n.replace(/'/g,"\\$&"):e.setAttribute("id",n),q&&p&&(e=e.parentNode);try{if(!q||p)return s(e.querySelectorAll("[id='"+n+"'] "+b),f)}catch(r){}finally{l||k.removeAttribute("id")}}}return a(b,e,f,g)};for(var e in a)m[e]=a[e];b=null}}(),function(){var a=c.documentElement,b=a.matchesSelector||a.mozMatchesSelector||a.webkitMatchesSelector||a.msMatchesSelector;if(b){var d=!b.call(c.createElement("div"),"div"),e=!1;try{b.call(c.documentElement,"[test!='']:sizzle")}catch(f){e=!0}m.matchesSelector=function(a,c){c=c.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!m.isXML(a))try{if(e||!o.match.PSEUDO.test(c)&&!/!=/.test(c)){var f=b.call(a,c);if(f||!d||a.document&&a.document.nodeType!==11)return f}}catch(g){}return m(c,null,null,[a]).length>0}}}(),function(){var a=c.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(!!a.getElementsByClassName&&a.getElementsByClassName("e").length!==0){a.lastChild.className="e";if(a.getElementsByClassName("e").length===1)return;o.order.splice(1,0,"CLASS"),o.find.CLASS=function(a,b,c){if(typeof b.getElementsByClassName!="undefined"&&!c)return b.getElementsByClassName(a[1])},a=null}}(),c.documentElement.contains?m.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):!0)}:c.documentElement.compareDocumentPosition?m.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}:m.contains=function(){return!1},m.isXML=function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":!1};var y=function(a,b,c){var d,e=[],f="",g=b.nodeType?[b]:b;while(d=o.match.PSEUDO.exec(a))f+=d[0],a=a.replace(o.match.PSEUDO,"");a=o.relative[a]?a+"*":a;for(var h=0,i=g.length;h<i;h++)m(a,g[h],e,c);return m.filter(f,e)};m.attr=f.attr,m.selectors.attrMap={},f.find=m,f.expr=m.selectors,f.expr[":"]=f.expr.filters,f.unique=m.uniqueSort,f.text=m.getText,f.isXMLDoc=m.isXML,f.contains=m.contains}();var L=/Until$/,M=/^(?:parents|prevUntil|prevAll)/,N=/,/,O=/^.[^:#\[\.,]*$/,P=Array.prototype.slice,Q=f.expr.match.globalPOS,R={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({find:function(a){var b=this,c,d;if(typeof a!="string")return f(a).filter(function(){for(c=0,d=b.length;c<d;c++)if(f.contains(b[c],this))return!0});var e=this.pushStack("","find",a),g,h,i;for(c=0,d=this.length;c<d;c++){g=e.length,f.find(a,this[c],e);if(c>0)for(h=g;h<e.length;h++)for(i=0;i<g;i++)if(e[i]===e[h]){e.splice(h--,1);break}}return e},has:function(a){var b=f(a);return this.filter(function(){for(var a=0,c=b.length;a<c;a++)if(f.contains(this,b[a]))return!0})},not:function(a){return this.pushStack(T(this,a,!1),"not",a)},filter:function(a){return this.pushStack(T(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?Q.test(a)?f(a,this.context).index(this[0])>=0:f.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c=[],d,e,g=this[0];if(f.isArray(a)){var h=1;while(g&&g.ownerDocument&&g!==b){for(d=0;d<a.length;d++)f(g).is(a[d])&&c.push({selector:a[d],elem:g,level:h});g=g.parentNode,h++}return c}var i=Q.test(a)||typeof a!="string"?f(a,b||this.context):0;for(d=0,e=this.length;d<e;d++){g=this[d];while(g){if(i?i.index(g)>-1:f.find.matchesSelector(g,a)){c.push(g);break}g=g.parentNode;if(!g||!g.ownerDocument||g===b||g.nodeType===11)break}}c=c.length>1?f.unique(c):c;return this.pushStack(c,"closest",a)},index:function(a){if(!a)return this[0]&&this[0].parentNode?this.prevAll().length:-1;if(typeof a=="string")return f.inArray(this[0],f(a));return f.inArray(a.jquery?a[0]:a,this)},add:function(a,b){var c=typeof a=="string"?f(a,b):f.makeArray(a&&a.nodeType?[a]:a),d=f.merge(this.get(),c);return this.pushStack(S(c[0])||S(d[0])?d:f.unique(d))},andSelf:function(){return this.add(this.prevObject)}}),f.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return f.dir(a,"parentNode")},parentsUntil:function(a,b,c){return f.dir(a,"parentNode",c)},next:function(a){return f.nth(a,2,"nextSibling")},prev:function(a){return f.nth(a,2,"previousSibling")},nextAll:function(a){return f.dir(a,"nextSibling")},prevAll:function(a){return f.dir(a,"previousSibling")},nextUntil:function(a,b,c){return f.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return f.dir(a,"previousSibling",c)},siblings:function(a){return f.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return f.sibling(a.firstChild)},contents:function(a){return f.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:f.makeArray(a.childNodes)}},function(a,b){f.fn[a]=function(c,d){var e=f.map(this,b,c);L.test(a)||(d=c),d&&typeof d=="string"&&(e=f.filter(d,e)),e=this.length>1&&!R[a]?f.unique(e):e,(this.length>1||N.test(d))&&M.test(a)&&(e=e.reverse());return this.pushStack(e,a,P.call(arguments).join(","))}}),f.extend({filter:function(a,b,c){c&&(a=":not("+a+")");return b.length===1?f.find.matchesSelector(b[0],a)?[b[0]]:[]:f.find.matches(a,b)},dir:function(a,c,d){var e=[],g=a[c];while(g&&g.nodeType!==9&&(d===b||g.nodeType!==1||!f(g).is(d)))g.nodeType===1&&e.push(g),g=g[c];return e},nth:function(a,b,c,d){b=b||1;var e=0;for(;a;a=a[c])if(a.nodeType===1&&++e===b)break;return a},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var V="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",W=/ jQuery\d+="(?:\d+|null)"/g,X=/^\s+/,Y=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,Z=/<([\w:]+)/,$=/<tbody/i,_=/<|&#?\w+;/,ba=/<(?:script|style)/i,bb=/<(?:script|object|embed|option|style)/i,bc=new RegExp("<(?:"+V+")[\\s/>]","i"),bd=/checked\s*(?:[^=]|=\s*.checked.)/i,be=/\/(java|ecma)script/i,bf=/^\s*<!(?:\[CDATA\[|\-\-)/,bg={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},bh=U(c);bg.optgroup=bg.option,bg.tbody=bg.tfoot=bg.colgroup=bg.caption=bg.thead,bg.th=bg.td,f.support.htmlSerialize||(bg._default=[1,"div<div>","</div>"]),f.fn.extend({text:function(a){return f.access(this,function(a){return a===b?f.text(this):this.empty().append((this[0]&&this[0].ownerDocument||c).createTextNode(a))},null,a,arguments.length)},wrapAll:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapAll(a.call(this,b))});if(this[0]){var b=f(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapInner(a.call(this,b))});return this.each(function(){var b=f(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=f.isFunction(a);return this.each(function(c){f(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=f
.clean(arguments);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,f.clean(arguments));return a}},remove:function(a,b){for(var c=0,d;(d=this[c])!=null;c++)if(!a||f.filter(a,[d]).length)!b&&d.nodeType===1&&(f.cleanData(d.getElementsByTagName("*")),f.cleanData([d])),d.parentNode&&d.parentNode.removeChild(d);return this},empty:function(){for(var a=0,b;(b=this[a])!=null;a++){b.nodeType===1&&f.cleanData(b.getElementsByTagName("*"));while(b.firstChild)b.removeChild(b.firstChild)}return this},clone:function(a,b){a=a==null?!1:a,b=b==null?a:b;return this.map(function(){return f.clone(this,a,b)})},html:function(a){return f.access(this,function(a){var c=this[0]||{},d=0,e=this.length;if(a===b)return c.nodeType===1?c.innerHTML.replace(W,""):null;if(typeof a=="string"&&!ba.test(a)&&(f.support.leadingWhitespace||!X.test(a))&&!bg[(Z.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Y,"<$1></$2>");try{for(;d<e;d++)c=this[d]||{},c.nodeType===1&&(f.cleanData(c.getElementsByTagName("*")),c.innerHTML=a);c=0}catch(g){}}c&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(f.isFunction(a))return this.each(function(b){var c=f(this),d=c.html();c.replaceWith(a.call(this,b,d))});typeof a!="string"&&(a=f(a).detach());return this.each(function(){var b=this.nextSibling,c=this.parentNode;f(this).remove(),b?f(b).before(a):f(c).append(a)})}return this.length?this.pushStack(f(f.isFunction(a)?a():a),"replaceWith",a):this},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){var e,g,h,i,j=a[0],k=[];if(!f.support.checkClone&&arguments.length===3&&typeof j=="string"&&bd.test(j))return this.each(function(){f(this).domManip(a,c,d,!0)});if(f.isFunction(j))return this.each(function(e){var g=f(this);a[0]=j.call(this,e,c?g.html():b),g.domManip(a,c,d)});if(this[0]){i=j&&j.parentNode,f.support.parentNode&&i&&i.nodeType===11&&i.childNodes.length===this.length?e={fragment:i}:e=f.buildFragment(a,this,k),h=e.fragment,h.childNodes.length===1?g=h=h.firstChild:g=h.firstChild;if(g){c=c&&f.nodeName(g,"tr");for(var l=0,m=this.length,n=m-1;l<m;l++)d.call(c?bi(this[l],g):this[l],e.cacheable||m>1&&l<n?f.clone(h,!0,!0):h)}k.length&&f.each(k,function(a,b){b.src?f.ajax({type:"GET",global:!1,url:b.src,async:!1,dataType:"script"}):f.globalEval((b.text||b.textContent||b.innerHTML||"").replace(bf,"/*$0*/")),b.parentNode&&b.parentNode.removeChild(b)})}return this}}),f.buildFragment=function(a,b,d){var e,g,h,i,j=a[0];b&&b[0]&&(i=b[0].ownerDocument||b[0]),i.createDocumentFragment||(i=c),a.length===1&&typeof j=="string"&&j.length<512&&i===c&&j.charAt(0)==="<"&&!bb.test(j)&&(f.support.checkClone||!bd.test(j))&&(f.support.html5Clone||!bc.test(j))&&(g=!0,h=f.fragments[j],h&&h!==1&&(e=h)),e||(e=i.createDocumentFragment(),f.clean(a,i,e,d)),g&&(f.fragments[j]=h?e:1);return{fragment:e,cacheable:g}},f.fragments={},f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){f.fn[a]=function(c){var d=[],e=f(c),g=this.length===1&&this[0].parentNode;if(g&&g.nodeType===11&&g.childNodes.length===1&&e.length===1){e[b](this[0]);return this}for(var h=0,i=e.length;h<i;h++){var j=(h>0?this.clone(!0):this).get();f(e[h])[b](j),d=d.concat(j)}return this.pushStack(d,a,e.selector)}}),f.extend({clone:function(a,b,c){var d,e,g,h=f.support.html5Clone||f.isXMLDoc(a)||!bc.test("<"+a.nodeName+">")?a.cloneNode(!0):bo(a);if((!f.support.noCloneEvent||!f.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!f.isXMLDoc(a)){bk(a,h),d=bl(a),e=bl(h);for(g=0;d[g];++g)e[g]&&bk(d[g],e[g])}if(b){bj(a,h);if(c){d=bl(a),e=bl(h);for(g=0;d[g];++g)bj(d[g],e[g])}}d=e=null;return h},clean:function(a,b,d,e){var g,h,i,j=[];b=b||c,typeof b.createElement=="undefined"&&(b=b.ownerDocument||b[0]&&b[0].ownerDocument||c);for(var k=0,l;(l=a[k])!=null;k++){typeof l=="number"&&(l+="");if(!l)continue;if(typeof l=="string")if(!_.test(l))l=b.createTextNode(l);else{l=l.replace(Y,"<$1></$2>");var m=(Z.exec(l)||["",""])[1].toLowerCase(),n=bg[m]||bg._default,o=n[0],p=b.createElement("div"),q=bh.childNodes,r;b===c?bh.appendChild(p):U(b).appendChild(p),p.innerHTML=n[1]+l+n[2];while(o--)p=p.lastChild;if(!f.support.tbody){var s=$.test(l),t=m==="table"&&!s?p.firstChild&&p.firstChild.childNodes:n[1]==="<table>"&&!s?p.childNodes:[];for(i=t.length-1;i>=0;--i)f.nodeName(t[i],"tbody")&&!t[i].childNodes.length&&t[i].parentNode.removeChild(t[i])}!f.support.leadingWhitespace&&X.test(l)&&p.insertBefore(b.createTextNode(X.exec(l)[0]),p.firstChild),l=p.childNodes,p&&(p.parentNode.removeChild(p),q.length>0&&(r=q[q.length-1],r&&r.parentNode&&r.parentNode.removeChild(r)))}var u;if(!f.support.appendChecked)if(l[0]&&typeof (u=l.length)=="number")for(i=0;i<u;i++)bn(l[i]);else bn(l);l.nodeType?j.push(l):j=f.merge(j,l)}if(d){g=function(a){return!a.type||be.test(a.type)};for(k=0;j[k];k++){h=j[k];if(e&&f.nodeName(h,"script")&&(!h.type||be.test(h.type)))e.push(h.parentNode?h.parentNode.removeChild(h):h);else{if(h.nodeType===1){var v=f.grep(h.getElementsByTagName("script"),g);j.splice.apply(j,[k+1,0].concat(v))}d.appendChild(h)}}}return j},cleanData:function(a){var b,c,d=f.cache,e=f.event.special,g=f.support.deleteExpando;for(var h=0,i;(i=a[h])!=null;h++){if(i.nodeName&&f.noData[i.nodeName.toLowerCase()])continue;c=i[f.expando];if(c){b=d[c];if(b&&b.events){for(var j in b.events)e[j]?f.event.remove(i,j):f.removeEvent(i,j,b.handle);b.handle&&(b.handle.elem=null)}g?delete i[f.expando]:i.removeAttribute&&i.removeAttribute(f.expando),delete d[c]}}}});var bp=/alpha\([^)]*\)/i,bq=/opacity=([^)]*)/,br=/([A-Z]|^ms)/g,bs=/^[\-+]?(?:\d*\.)?\d+$/i,bt=/^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,bu=/^([\-+])=([\-+.\de]+)/,bv=/^margin/,bw={position:"absolute",visibility:"hidden",display:"block"},bx=["Top","Right","Bottom","Left"],by,bz,bA;f.fn.css=function(a,c){return f.access(this,function(a,c,d){return d!==b?f.style(a,c,d):f.css(a,c)},a,c,arguments.length>1)},f.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=by(a,"opacity");return c===""?"1":c}return a.style.opacity}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":f.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!!a&&a.nodeType!==3&&a.nodeType!==8&&!!a.style){var g,h,i=f.camelCase(c),j=a.style,k=f.cssHooks[i];c=f.cssProps[i]||i;if(d===b){if(k&&"get"in k&&(g=k.get(a,!1,e))!==b)return g;return j[c]}h=typeof d,h==="string"&&(g=bu.exec(d))&&(d=+(g[1]+1)*+g[2]+parseFloat(f.css(a,c)),h="number");if(d==null||h==="number"&&isNaN(d))return;h==="number"&&!f.cssNumber[i]&&(d+="px");if(!k||!("set"in k)||(d=k.set(a,d))!==b)try{j[c]=d}catch(l){}}},css:function(a,c,d){var e,g;c=f.camelCase(c),g=f.cssHooks[c],c=f.cssProps[c]||c,c==="cssFloat"&&(c="float");if(g&&"get"in g&&(e=g.get(a,!0,d))!==b)return e;if(by)return by(a,c)},swap:function(a,b,c){var d={},e,f;for(f in b)d[f]=a.style[f],a.style[f]=b[f];e=c.call(a);for(f in b)a.style[f]=d[f];return e}}),f.curCSS=f.css,c.defaultView&&c.defaultView.getComputedStyle&&(bz=function(a,b){var c,d,e,g,h=a.style;b=b.replace(br,"-$1").toLowerCase(),(d=a.ownerDocument.defaultView)&&(e=d.getComputedStyle(a,null))&&(c=e.getPropertyValue(b),c===""&&!f.contains(a.ownerDocument.documentElement,a)&&(c=f.style(a,b))),!f.support.pixelMargin&&e&&bv.test(b)&&bt.test(c)&&(g=h.width,h.width=c,c=e.width,h.width=g);return c}),c.documentElement.currentStyle&&(bA=function(a,b){var c,d,e,f=a.currentStyle&&a.currentStyle[b],g=a.style;f==null&&g&&(e=g[b])&&(f=e),bt.test(f)&&(c=g.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),g.left=b==="fontSize"?"1em":f,f=g.pixelLeft+"px",g.left=c,d&&(a.runtimeStyle.left=d));return f===""?"auto":f}),by=bz||bA,f.each(["height","width"],function(a,b){f.cssHooks[b]={get:function(a,c,d){if(c)return a.offsetWidth!==0?bB(a,b,d):f.swap(a,bw,function(){return bB(a,b,d)})},set:function(a,b){return bs.test(b)?b+"px":b}}}),f.support.opacity||(f.cssHooks.opacity={get:function(a,b){return bq.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=f.isNumeric(b)?"alpha(opacity="+b*100+")":"",g=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&f.trim(g.replace(bp,""))===""){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bp.test(g)?g.replace(bp,e):g+" "+e}}),f(function(){f.support.reliableMarginRight||(f.cssHooks.marginRight={get:function(a,b){return f.swap(a,{display:"inline-block"},function(){return b?by(a,"margin-right"):a.style.marginRight})}})}),f.expr&&f.expr.filters&&(f.expr.filters.hidden=function(a){var b=a.offsetWidth,c=a.offsetHeight;return b===0&&c===0||!f.support.reliableHiddenOffsets&&(a.style&&a.style.display||f.css(a,"display"))==="none"},f.expr.filters.visible=function(a){return!f.expr.filters.hidden(a)}),f.each({margin:"",padding:"",border:"Width"},function(a,b){f.cssHooks[a+b]={expand:function(c){var d,e=typeof c=="string"?c.split(" "):[c],f={};for(d=0;d<4;d++)f[a+bx[d]+b]=e[d]||e[d-2]||e[0];return f}}});var bC=/%20/g,bD=/\[\]$/,bE=/\r?\n/g,bF=/#.*$/,bG=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,bH=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,bI=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,bJ=/^(?:GET|HEAD)$/,bK=/^\/\//,bL=/\?/,bM=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bN=/^(?:select|textarea)/i,bO=/\s+/,bP=/([?&])_=[^&]*/,bQ=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,bR=f.fn.load,bS={},bT={},bU,bV,bW=["*/"]+["*"];try{bU=e.href}catch(bX){bU=c.createElement("a"),bU.href="",bU=bU.href}bV=bQ.exec(bU.toLowerCase())||[],f.fn.extend({load:function(a,c,d){if(typeof a!="string"&&bR)return bR.apply(this,arguments);if(!this.length)return this;var e=a.indexOf(" ");if(e>=0){var g=a.slice(e,a.length);a=a.slice(0,e)}var h="GET";c&&(f.isFunction(c)?(d=c,c=b):typeof c=="object"&&(c=f.param(c,f.ajaxSettings.traditional),h="POST"));var i=this;f.ajax({url:a,type:h,dataType:"html",data:c,complete:function(a,b,c){c=a.responseText,a.isResolved()&&(a.done(function(a){c=a}),i.html(g?f("<div>").append(c.replace(bM,"")).find(g):c)),d&&i.each(d,[c,b,a])}});return this},serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?f.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||bN.test(this.nodeName)||bH.test(this.type))}).map(function(a,b){var c=f(this).val();return c==null?null:f.isArray(c)?f.map(c,function(a,c){return{name:b.name,value:a.replace(bE,"\r\n")}}):{name:b.name,value:c.replace(bE,"\r\n")}}).get()}}),f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){f.fn[b]=function(a){return this.on(b,a)}}),f.each(["get","post"],function(a,c){f[c]=function(a,d,e,g){f.isFunction(d)&&(g=g||e,e=d,d=b);return f.ajax({type:c,url:a,data:d,success:e,dataType:g})}}),f.extend({getScript:function(a,c){return f.get(a,b,c,"script")},getJSON:function(a,b,c){return f.get(a,b,c,"json")},ajaxSetup:function(a,b){b?b$(a,f.ajaxSettings):(b=a,a=f.ajaxSettings),b$(a,b);return a},ajaxSettings:{url:bU,isLocal:bI.test(bV[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":bW},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:bY(bS),ajaxTransport:bY(bT),ajax:function(a,c){function w(a,c,l,m){if(s!==2){s=2,q&&clearTimeout(q),p=b,n=m||"",v.readyState=a>0?4:0;var o,r,u,w=c,x=l?ca(d,v,l):b,y,z;if(a>=200&&a<300||a===304){if(d.ifModified){if(y=v.getResponseHeader("Last-Modified"))f.lastModified[k]=y;if(z=v.getResponseHeader("Etag"))f.etag[k]=z}if(a===304)w="notmodified",o=!0;else try{r=cb(d,x),w="success",o=!0}catch(A){w="parsererror",u=A}}else{u=w;if(!w||a)w="error",a<0&&(a=0)}v.status=a,v.statusText=""+(c||w),o?h.resolveWith(e,[r,w,v]):h.rejectWith(e,[v,w,u]),v.statusCode(j),j=b,t&&g.trigger("ajax"+(o?"Success":"Error"),[v,d,o?r:u]),i.fireWith(e,[v,w]),t&&(g.trigger("ajaxComplete",[v,d]),--f.active||f.event.trigger("ajaxStop"))}}typeof a=="object"&&(c=a,a=b),c=c||{};var d=f.ajaxSetup({},c),e=d.context||d,g=e!==d&&(e.nodeType||e instanceof f)?f(e):f.event,h=f.Deferred(),i=f.Callbacks("once memory"),j=d.statusCode||{},k,l={},m={},n,o,p,q,r,s=0,t,u,v={readyState:0,setRequestHeader:function(a,b){if(!s){var c=a.toLowerCase();a=m[c]=m[c]||a,l[a]=b}return this},getAllResponseHeaders:function(){return s===2?n:null},getResponseHeader:function(a){var c;if(s===2){if(!o){o={};while(c=bG.exec(n))o[c[1].toLowerCase()]=c[2]}c=o[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){s||(d.mimeType=a);return this},abort:function(a){a=a||"abort",p&&p.abort(a),w(0,a);return this}};h.promise(v),v.success=v.done,v.error=v.fail,v.complete=i.add,v.statusCode=function(a){if(a){var b;if(s<2)for(b in a)j[b]=[j[b],a[b]];else b=a[v.status],v.then(b,b)}return this},d.url=((a||d.url)+"").replace(bF,"").replace(bK,bV[1]+"//"),d.dataTypes=f.trim(d.dataType||"*").toLowerCase().split(bO),d.crossDomain==null&&(r=bQ.exec(d.url.toLowerCase()),d.crossDomain=!(!r||r[1]==bV[1]&&r[2]==bV[2]&&(r[3]||(r[1]==="http:"?80:443))==(bV[3]||(bV[1]==="http:"?80:443)))),d.data&&d.processData&&typeof d.data!="string"&&(d.data=f.param(d.data,d.traditional)),bZ(bS,d,c,v);if(s===2)return!1;t=d.global,d.type=d.type.toUpperCase(),d.hasContent=!bJ.test(d.type),t&&f.active++===0&&f.event.trigger("ajaxStart");if(!d.hasContent){d.data&&(d.url+=(bL.test(d.url)?"&":"?")+d.data,delete d.data),k=d.url;if(d.cache===!1){var x=f.now(),y=d.url.replace(bP,"$1_="+x);d.url=y+(y===d.url?(bL.test(d.url)?"&":"?")+"_="+x:"")}}(d.data&&d.hasContent&&d.contentType!==!1||c.contentType)&&v.setRequestHeader("Content-Type",d.contentType),d.ifModified&&(k=k||d.url,f.lastModified[k]&&v.setRequestHeader("If-Modified-Since",f.lastModified[k]),f.etag[k]&&v.setRequestHeader("If-None-Match",f.etag[k])),v.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+(d.dataTypes[0]!=="*"?", "+bW+"; q=0.01":""):d.accepts["*"]);for(u in d.headers)v.setRequestHeader(u,d.headers[u]);if(d.beforeSend&&(d.beforeSend.call(e,v,d)===!1||s===2)){v.abort();return!1}for(u in{success:1,error:1,complete:1})v[u](d[u]);p=bZ(bT,d,c,v);if(!p)w(-1,"No Transport");else{v.readyState=1,t&&g.trigger("ajaxSend",[v,d]),d.async&&d.timeout>0&&(q=setTimeout(function(){v.abort("timeout")},d.timeout));try{s=1,p.send(l,w)}catch(z){if(s<2)w(-1,z);else throw z}}return v},param:function(a,c){var d=[],e=function(a,b){b=f.isFunction(b)?b():b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=f.ajaxSettings.traditional);if(f.isArray(a)||a.jquery&&!f.isPlainObject(a))f.each(a,function(){e(this.name,this.value)});else for(var g in a)b_(g,a[g],c,e);return d.join("&").replace(bC,"+")}}),f.extend({active:0,lastModified:{},etag:{}});var cc=f.now(),cd=/(\=)\?(&|$)|\?\?/i;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return f.expando+"_"+cc++}}),f.ajaxPrefilter("json jsonp",function(b,c,d){var e=typeof b.data=="string"&&/^application\/x\-www\-form\-urlencoded/.test(b.contentType);if(b.dataTypes[0]==="jsonp"||b.jsonp!==!1&&(cd.test(b.url)||e&&cd.test(b.data))){var g,h=b.jsonpCallback=f.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,i=a[h],j=b.url,k=b.data,l="$1"+h+"$2";b.jsonp!==!1&&(j=j.replace(cd,l),b.url===j&&(e&&(k=k.replace(cd,l)),b.data===k&&(j+=(/\?/.test(j)?"&":"?")+b.jsonp+"="+h))),b.url=j,b.data=k,a[h]=function(a){g=[a]},d.always(function(){a[h]=i,g&&f.isFunction(i)&&a[h](g[0])}),b.converters["script json"]=function(){g||f.error(h+" was not called");return g[0]},b.dataTypes[0]="json";return"script"}}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){f.globalEval(a);return a}}}),f.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),f.ajaxTransport("script",function(a){if(a.crossDomain){var d,e=c.head||c.getElementsByTagName("head")[0]||c.documentElement;return{send:function(f,g){d=c.createElement("script"),d.async="async",a.scriptCharset&&(d.charset=a.scriptCharset),d.src=a.url,d.onload=d.onreadystatechange=function(a,c){if(c||!d.readyState||/loaded|complete/.test(d.readyState))d.onload=d.onreadystatechange=null,e&&d.parentNode&&e.removeChild(d),d=b,c||g(200,"success")},e.insertBefore(d,e.firstChild)},abort:function(){d&&d.onload(0,1)}}}});var ce=a.ActiveXObject?function(){for(var a in cg)cg[a](0,1)}:!1,cf=0,cg;f.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&ch()||ci()}:ch,function(a){f.extend(f.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(f.ajaxSettings.xhr()),f.support.ajax&&f.ajaxTransport(function(c){if(!c.crossDomain||f.support.cors){var d;return{send:function(e,g){var h=c.xhr(),i,j;c.username?h.open(c.type,c.url,c.async,c.username,c.password):h.open(c.type,c.url,c.async);if(c.xhrFields)for(j in c.xhrFields)h[j]=c.xhrFields[j];c.mimeType&&h.overrideMimeType&&h.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(j in e)h.setRequestHeader(j,e[j])}catch(k){}h.send(c.hasContent&&c.data||null),d=function(a,e){var j,k,l,m,n;try{if(d&&(e||h.readyState===4)){d=b,i&&(h.onreadystatechange=f.noop,ce&&delete cg[i]);if(e)h.readyState!==4&&h.abort();else{j=h.status,l=h.getAllResponseHeaders(),m={},n=h.responseXML,n&&n.documentElement&&(m.xml=n);try{m.text=h.responseText}catch(a){}try{k=h.statusText}catch(o){k=""}!j&&c.isLocal&&!c.crossDomain?j=m.text?200:404:j===1223&&(j=204)}}}catch(p){e||g(-1,p)}m&&g(j,k,m,l)},!c.async||h.readyState===4?d():(i=++cf,ce&&(cg||(cg={},f(a).unload(ce)),cg[i]=d),h.onreadystatechange=d)},abort:function(){d&&d(0,1)}}}});var cj={},ck,cl,cm=/^(?:toggle|show|hide)$/,cn=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,co,cp=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],cq;f.fn.extend({show:function(a,b,c){var d,e;if(a||a===0)return this.animate(ct("show",3),a,b,c);for(var g=0,h=this.length;g<h;g++)d=this[g],d.style&&(e=d.style.display,!f._data(d,"olddisplay")&&e==="none"&&(e=d.style.display=""),(e===""&&f.css(d,"display")==="none"||!f.contains(d.ownerDocument.documentElement,d))&&f._data(d,"olddisplay",cu(d.nodeName)));for(g=0;g<h;g++){d=this[g];if(d.style){e=d.style.display;if(e===""||e==="none")d.style.display=f._data(d,"olddisplay")||""}}return this},hide:function(a,b,c){if(a||a===0)return this.animate(ct("hide",3),a,b,c);var d,e,g=0,h=this.length;for(;g<h;g++)d=this[g],d.style&&(e=f.css(d,"display"),e!=="none"&&!f._data(d,"olddisplay")&&f._data(d,"olddisplay",e));for(g=0;g<h;g++)this[g].style&&(this[g].style.display="none");return this},_toggle:f.fn.toggle,toggle:function(a,b,c){var d=typeof a=="boolean";f.isFunction(a)&&f.isFunction(b)?this._toggle.apply(this,arguments):a==null||d?this.each(function(){var b=d?a:f(this).is(":hidden");f(this)[b?"show":"hide"]()}):this.animate(ct("toggle",3),a,b,c);return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){function g(){e.queue===!1&&f._mark(this);var b=f.extend({},e),c=this.nodeType===1,d=c&&f(this).is(":hidden"),g,h,i,j,k,l,m,n,o,p,q;b.animatedProperties={};for(i in a){g=f.camelCase(i),i!==g&&(a[g]=a[i],delete a[i]);if((k=f.cssHooks[g])&&"expand"in k){l=k.expand(a[g]),delete a[g];for(i in l)i in a||(a[i]=l[i])}}for(g in a){h=a[g],f.isArray(h)?(b.animatedProperties[g]=h[1],h=a[g]=h[0]):b.animatedProperties[g]=b.specialEasing&&b.specialEasing[g]||b.easing||"swing";if(h==="hide"&&d||h==="show"&&!d)return b.complete.call(this);c&&(g==="height"||g==="width")&&(b.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY],f.css(this,"display")==="inline"&&f.css(this,"float")==="none"&&(!f.support.inlineBlockNeedsLayout||cu(this.nodeName)==="inline"?this.style.display="inline-block":this.style.zoom=1))}b.overflow!=null&&(this.style.overflow="hidden");for(i in a)j=new f.fx(this,b,i),h=a[i],cm.test(h)?(q=f._data(this,"toggle"+i)||(h==="toggle"?d?"show":"hide":0),q?(f._data(this,"toggle"+i,q==="show"?"hide":"show"),j[q]()):j[h]()):(m=cn.exec(h),n=j.cur(),m?(o=parseFloat(m[2]),p=m[3]||(f.cssNumber[i]?"":"px"),p!=="px"&&(f.style(this,i,(o||1)+p),n=(o||1)/j.cur()*n,f.style(this,i,n+p)),m[1]&&(o=(m[1]==="-="?-1:1)*o+n),j.custom(n,o,p)):j.custom(n,h,""));return!0}var e=f.speed(b,c,d);if(f.isEmptyObject(a))return this.each(e.complete,[!1]);a=f.extend({},a);return e.queue===!1?this.each(g):this.queue(e.queue,g)},stop:function(a,c,d){typeof a!="string"&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]);return this.each(function(){function h(a,b,c){var e=b[c];f.removeData(a,c,!0),e.stop(d)}var b,c=!1,e=f.timers,g=f._data(this);d||f._unmark(!0,this);if(a==null)for(b in g)g[b]&&g[b].stop&&b.indexOf(".run")===b.length-4&&h(this,g,b);else g[b=a+".run"]&&g[b].stop&&h(this,g,b);for(b=e.length;b--;)e[b].elem===this&&(a==null||e[b].queue===a)&&(d?e[b](!0):e[b].saveState(),c=!0,e.splice(b,1));(!d||!c)&&f.dequeue(this,a)})}}),f.each({slideDown:ct("show",1),slideUp:ct("hide",1),slideToggle:ct("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){f.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),f.extend({speed:function(a,b,c){var d=a&&typeof a=="object"?f.extend({},a):{complete:c||!c&&b||f.isFunction(a)&&a,duration:a,easing:c&&b||b&&!f.isFunction(b)&&b};d.duration=f.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in f.fx.speeds?f.fx.speeds[d.duration]:f.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue="fx";d.old=d.complete,d.complete=function(a){f.isFunction(d.old)&&d.old.call(this),d.queue?f.dequeue(this,d.queue):a!==!1&&f._unmark(this)};return d},easing:{linear:function(a){return a},swing:function(a){return-Math.cos(a*Math.PI)/2+.5}},timers:[],fx:function(a,b,c){this.options=b,this.elem=a,this.prop=c,b.orig=b.orig||{}}}),f.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this),(f.fx.step[this.prop]||f.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];var a,b=f.css(this.elem,this.prop);return isNaN(a=parseFloat(b))?!b||b==="auto"?0:b:a},custom:function(a,c,d){function h(a){return e.step(a)}var e=this,g=f.fx;this.startTime=cq||cr(),this.end=c,this.now=this.start=a,this.pos=this.state=0,this.unit=d||this.unit||(f.cssNumber[this.prop]?"":"px"),h.queue=this.options.queue,h.elem=this.elem,h.saveState=function(){f._data(e.elem,"fxshow"+e.prop)===b&&(e.options.hide?f._data(e.elem,"fxshow"+e.prop,e.start):e.options.show&&f._data(e.elem,"fxshow"+e.prop,e.end))},h()&&f.timers.push(h)&&!co&&(co=setInterval(g.tick,g.interval))},show:function(){var a=f._data(this.elem,"fxshow"+this.prop);this.options.orig[this.prop]=a||f.style(this.elem,this.prop),this.options.show=!0,a!==b?this.custom(this.cur(),a):this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur()),f(this.elem).show()},hide:function(){this.options.orig[this.prop]=f._data(this.elem,"fxshow"+this.prop)||f.style(this.elem,this.prop),this.options.hide=!0,this.custom(this.cur(),0)},step:function(a){var b,c,d,e=cq||cr(),g=!0,h=this.elem,i=this.options;if(a||e>=i.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),i.animatedProperties[this.prop]=!0;for(b in i.animatedProperties)i.animatedProperties[b]!==!0&&(g=!1);if(g){i.overflow!=null&&!f.support.shrinkWrapBlocks&&f.each(["","X","Y"],function(a,b){h.style["overflow"+b]=i.overflow[a]}),i.hide&&f(h).hide();if(i.hide||i.show)for(b in i.animatedProperties)f.style(h,b,i.orig[b]),f.removeData(h,"fxshow"+b,!0),f.removeData(h,"toggle"+b,!0);d=i.complete,d&&(i.complete=!1,d.call(h))}return!1}i.duration==Infinity?this.now=e:(c=e-this.startTime,this.state=c/i.duration,this.pos=f.easing[i.animatedProperties[this.prop]](this.state,c,0,1,i.duration),this.now=this.start+(this.end-this.start)*this.pos),this.update();return!0}},f.extend(f.fx,{tick:function(){var a,b=f.timers,c=0;for(;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||f.fx.stop()},interval:13,stop:function(){clearInterval(co),co=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){f.style(a.elem,"opacity",a.now)},_default:function(a){a.elem.style&&a.elem.style[a.prop]!=null?a.elem.style[a.prop]=a.now+a.unit:a.elem[a.prop]=a.now}}}),f.each(cp.concat.apply([],cp),function(a,b){b.indexOf("margin")&&(f.fx.step[b]=function(a){f.style(a.elem,b,Math.max(0,a.now)+a.unit)})}),f.expr&&f.expr.filters&&(f.expr.filters.animated=function(a){return f.grep(f.timers,function(b){return a===b.elem}).length});var cv,cw=/^t(?:able|d|h)$/i,cx=/^(?:body|html)$/i;"getBoundingClientRect"in c.documentElement?cv=function(a,b,c,d){try{d=a.getBoundingClientRect()}catch(e){}if(!d||!f.contains(c,a))return d?{top:d.top,left:d.left}:{top:0,left:0};var g=b.body,h=cy(b),i=c.clientTop||g.clientTop||0,j=c.clientLeft||g.clientLeft||0,k=h.pageYOffset||f.support.boxModel&&c.scrollTop||g.scrollTop,l=h.pageXOffset||f.support.boxModel&&c.scrollLeft||g.scrollLeft,m=d.top+k-i,n=d.left+l-j;return{top:m,left:n}}:cv=function(a,b,c){var d,e=a.offsetParent,g=a,h=b.body,i=b.defaultView,j=i?i.getComputedStyle(a,null):a.currentStyle,k=a.offsetTop,l=a.offsetLeft;while((a=a.parentNode)&&a!==h&&a!==c){if(f.support.fixedPosition&&j.position==="fixed")break;d=i?i.getComputedStyle(a,null):a.currentStyle,k-=a.scrollTop,l-=a.scrollLeft,a===e&&(k+=a.offsetTop,l+=a.offsetLeft,f.support.doesNotAddBorder&&(!f.support.doesAddBorderForTableAndCells||!cw.test(a.nodeName))&&(k+=parseFloat(d.borderTopWidth)||0,l+=parseFloat(d.borderLeftWidth)||0),g=e,e=a.offsetParent),f.support.subtractsBorderForOverflowNotVisible&&d.overflow!=="visible"&&(k+=parseFloat(d.borderTopWidth)||0,l+=parseFloat(d.borderLeftWidth)||0),j=d}if(j.position==="relative"||j.position==="static")k+=h.offsetTop,l+=h.offsetLeft;f.support.fixedPosition&&j.position==="fixed"&&(k+=Math.max(c.scrollTop,h.scrollTop),l+=Math.max(c.scrollLeft,h.scrollLeft));return{top:k,left:l}},f.fn.offset=function(a){if(arguments.length)return a===b?this:this.each(function(b){f.offset.setOffset(this,a,b)});var c=this[0],d=c&&c.ownerDocument;if(!d)return null;if(c===d.body)return f.offset.bodyOffset(c);return cv(c,d,d.documentElement)},f.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;f.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(f.css(a,"marginTop"))||0,c+=parseFloat(f.css(a,"marginLeft"))||0);return{top:b,left:c}},setOffset:function(a,b,c){var d=f.css(a,"position");d==="static"&&(a.style.position="relative");var e=f(a),g=e.offset(),h=f.css(a,"top"),i=f.css(a,"left"),j=(d==="absolute"||d==="fixed")&&f.inArray("auto",[h,i])>-1,k={},l={},m,n;j?(l=e.position(),m=l.top,n=l.left):(m=parseFloat(h)||0,n=parseFloat(i)||0),f.isFunction(b)&&(b=b.call(a,c,g)),b.top!=null&&(k.top=b.top-g.top+m),b.left!=null&&(k.left=b.left-g.left+n),"using"in b?b.using.call(a,k):e.css(k)}},f.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),c=this.offset(),d=cx.test(b[0].nodeName)?{top:0,left:0}:b.offset();c.top-=parseFloat(f.css(a,"marginTop"))||0,c.left-=parseFloat(f.css(a,"marginLeft"))||0,d.top+=parseFloat(f.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(f.css(b[0],"borderLeftWidth"))||0;return{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||c.body;while(a&&!cx.test(a.nodeName)&&f.css(a,"position")==="static")a=a.offsetParent;return a})}}),f.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,c){var d=/Y/.test(c);f.fn[a]=function(e){return f.access(this,function(a,e,g){var h=cy(a);if(g===b)return h?c in h?h[c]:f.support.boxModel&&h.document.documentElement[e]||h.document.body[e]:a[e];h?h.scrollTo(d?f(h).scrollLeft():g,d?g:f(h).scrollTop()):a[e]=g},a,e,arguments.length,null)}}),f.each({Height:"height",Width:"width"},function(a,c){var d="client"+a,e="scroll"+a,g="offset"+a;f.fn["inner"+a]=function(){var a=this[0];return a?a.style?parseFloat(f.css(a,c,"padding")):this[c]():null},f.fn["outer"+a]=function(a){var b=this[0];return b?b.style?parseFloat(f.css(b,c,a?"margin":"border")):this[c]():null},f.fn[c]=function(a){return f.access(this,function(a,c,h){var i,j,k,l;if(f.isWindow(a)){i=a.document,j=i.documentElement[d];return f.support.boxModel&&j||i.body&&i.body[d]||j}if(a.nodeType===9){i=a.documentElement;if(i[d]>=i[e])return i[d];return Math.max(a.body[e],i[e],a.body[g],i[g])}if(h===b){k=f.css(a,c),l=parseFloat(k);return f.isNumeric(l)?l:k}f(a).css(c,h)},c,a,arguments.length,null)}}),a.jQuery=a.$=f,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return f})})(window);
/*
    http://www.JSON.org/json2.js
    2009-06-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON = JSON || {};


(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

﻿/**
*
*  MD5 (Message-Digest Algorithm)
*  http://www.webtoolkit.info/
*
**/
 

var MD5 = function (string) {
 
	function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}
 
	function AddUnsigned(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	}
 
 	function F(x,y,z) { return (x & y) | ((~x) & z); }
 	function G(x,y,z) { return (x & z) | (y & (~z)); }
 	function H(x,y,z) { return (x ^ y ^ z); }
	function I(x,y,z) { return (y ^ (x | (~z))); }
 
	function FF(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function GG(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function HH(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function II(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1=lMessageLength + 8;
		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
		var lWordArray=Array(lNumberOfWords-1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	};
 
	function WordToHex(lValue) {
		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	};
 
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	};
 
	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;
 
	string = Utf8Encode(string);
 
	x = ConvertToWordArray(string);
 
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}
 
	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
	return temp.toUpperCase();
};
﻿// On creation of a UUID object, set it's initial value
function UUID(){
    this.id = this.createUUID();
}

 

// When asked what this Object is, lie and return it's value
UUID.prototype.valueOf = function(){ return this.id; };
UUID.prototype.toString = function(){ return this.id; };

 

//
// INSTANCE SPECIFIC METHODS
//
UUID.prototype.createUUID = function(){
    //
    // Loose interpretation of the specification DCE 1.1: Remote Procedure Call
    // since JavaScript doesn't allow access to internal systems, the last 48 bits 
    // of the node section is made up using a series of random numbers (6 octets long).
    //  
    var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
    var dc = new Date();
    var t = dc.getTime() - dg.getTime();
    var tl = UUID.getIntegerBits(t,0,31);
    var tm = UUID.getIntegerBits(t,32,47);
    var thv = UUID.getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
    var csar = UUID.getIntegerBits(UUID.rand(4095),0,7);
    var csl = UUID.getIntegerBits(UUID.rand(4095),0,7);

    // since detection of anything about the machine/browser is far to buggy, 
    // include some more random numbers here
    // if NIC or an IP can be obtained reliably, that should be put in
    // here instead.
    var n = UUID.getIntegerBits(UUID.rand(8191),0,7) + 
            UUID.getIntegerBits(UUID.rand(8191),8,15) + 
            UUID.getIntegerBits(UUID.rand(8191),0,7) + 
            UUID.getIntegerBits(UUID.rand(8191),8,15) + 
            UUID.getIntegerBits(UUID.rand(8191),0,15); // this last number is two octets long
    return tl + tm  + thv  + csar + csl + n; 
};

 

//Pull out only certain bits from a very large integer, used to get the time
//code information for the first part of a UUID. Will return zero's if there 
//aren't enough bits to shift where it needs to.
UUID.getIntegerBits = function(val,start,end){
 var base16 = UUID.returnBase(val,16);
 var quadArray = new Array();
 var quadString = '';
 var i = 0;
 for(i=0;i<base16.length;i++){
     quadArray.push(base16.substring(i,i+1));    
 }
 for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){
     if(!quadArray[i] || quadArray[i] == '') quadString += '0';
     else quadString += quadArray[i];
 }
 return quadString;
};

 

//Replaced from the original function to leverage the built in methods in
//JavaScript. Thanks to Robert Kieffer for pointing this one out
UUID.returnBase = function(number, base){
 return (number).toString(base).toUpperCase();
};

 

//pick a random number within a range of numbers
//int b rand(int a); where 0 <= b <= a
UUID.rand = function(max){
 return Math.floor(Math.random() * (max + 1));
};

UUID.getDataId = function(){
	return new Date().getTime()+UUID.getRandomNum(1,10,3); 
};

UUID.getRandomNum = function(Min,Max,n){
	var str = "";
	for (var i = 0; i < n; i++) {
		var Range = Max - Min;   
		var Rand = Math.random();
		str += (Min + Math.round(Rand * Range));
	}
	return str;  
};


/*
  jQuery Ketchup Plugin - Tasty Form Validation
  ---------------------------------------------
  
  Version 0.3.2 - 31. Jan 2011
    - Fixed another IE problem (by https://github.com/philippbosch)
  Version 0.3.1 - 12. Jan 2011
    - Check if error-container exists (by Emil Marashliev)
    - Make it work in IE6/7 (by https://github.com/hellokingdom)
  Version 0.3   - 06. Jan 2011
    - Rewritten from scratch
  Version 0.1   - 12. Feb 2010
    - Initial release
  
  Copyright (c) 2011 by Sebastian Senf:
    http://mustardamus.com/
    http://usejquery.com/
    http://twitter.com/mustardamus

  Dual licensed under the MIT and GPL licenses:
    http://www.opensource.org/licenses/mit-license.php
    http://www.gnu.org/licenses/gpl.html

  Demo: http://demos.usejquery.com/ketchup-plugin/
  Repo: http://github.com/mustardamus/ketchup-plugin
*/
/**
 * 此插件已被我修改过 
 */
(function($) {
  $.ketchup = {
    defaults: {
	  delimit           : ",",                                   //参数分割符
      attribute           : 'data-validate',                //look in that attribute for an validation string
      validateIndicator   : 'validate',                     //in the validation string this indicates the validations eg validate(required)
      eventIndicator      : 'on',                           //in the validation string this indicates the events when validations get fired eg on(blur)
      validateEvents      : 'blur',                         //the default event when validations get fired on every field
      bindElement    : null,//如果不是submit提交，则为当前按钮提交元素
      bindElementByClass : null, //根据类名绑定元素
	  bindEvent:"click",
      targetPosition  : "leftdown", // leftdown,rightdown,centerdown,centerup
	  validateElements    : ['input', 'textarea', 'select'],//check this fields in the form for a validation string on the attribute
      createErrorContainer: null,                           //function to create the error container (can also be set via $.ketchup.createErrorContainer(fn))
      showErrorContainer  : null,                           //function to show the error container (can also be set via $.ketchup.showErrorContainer(fn))
      hideErrorContainer  : null,                           //function to hide the error container (can also be set via $.ketchup.hideErrorContainer(fn))
      addErrorMessages    : null,                            //function to add error messages to the error container (can also be set via $.ketchup.addErrorMessages(fn))
      removeErrorContainer:null,							// remove all error container
      hideAllErrorContainer:null// hide all error container
    },
    dataNames: {
      validationString    : 'ketchup-validation-string',
      validations         : 'ketchup-validations',
      events              : 'ketchup-events',
      elements            : 'ketchup-validation-elements',
      container           : 'ketchup-container'
    },
    validations           : {},
    helpers               : {},
    
    
    validation: function() {
      var message, func,
          arg1 = arguments[1];
      
      if(typeof arg1 == 'function') {
        func    = arg1;
      } else {
        message = arg1;
        func    = arguments[2];
      }
          
      this.validations[arguments[0]] = {
        message: message,
        func   : func,
        init   : arguments[3] || function(form, el) {}
      };
      
      return this;
    },
    
    
    message: function(name, message) {
      this.addMessage(name, message);
      return this;
    },
    
    
    messages: function(messages) {
      for(name in messages) {
        this.addMessage(name, messages[name]);
      }
      
      return this;
    },
    
    
    addMessage: function(name, message) {
      if(this.validations[name]) {
        this.validations[name].message = message;
      }
    },
    
    
    helper: function(name, func) {
      this.helpers[name] = func;
      return this;
    },
    
    
    init: function(form, options, fields) {      
          this.options = options;
      var self         = this,
          valEls       = this.initFunctions().initFields(form, fields);
      
      valEls.each(function() {
        var el = $(this);
        
        self.bindValidationEvent(form, el)
            .callInitFunctions(form, el);
      });
          
      form.data(this.dataNames.elements, valEls);
      this.bindFormSubmit(form);
	  this.bindFormReset(form);
    },
    
    
    initFunctions: function() {
      var opt       = this.options,
          initFuncs = [
                        'createErrorContainer',
                        'showErrorContainer',
                        'hideErrorContainer',
                        'addErrorMessages',
                        'removeErrorContainer',
                        'hideAllErrorContainer'
                      ];

      for(var f = 0; f < initFuncs.length; f++) {
        var funcName = initFuncs[f];
    
        if(!opt[funcName]) {
          opt[funcName] = this[funcName];
        }
      }
      
      return this;
    },
    
    
    initFields: function(form, fields) {
      var self      = this,
          dataNames = this.dataNames,
          valEls    = $(!fields ? this.fieldsFromForm(form) : this.fieldsFromObject(form, fields));
      
      valEls.each(function() {
        var el   = $(this),
            vals = self.extractValidations(el.data(dataNames.validationString), self.options.validateIndicator);
        
        el.data(dataNames.validations, vals);
      });
      
      return valEls;
    },
    
    
    callInitFunctions: function(form, el) {
      var vals = el.data(this.dataNames.validations);
      
      for(var i = 0; i < vals.length; i++) {
        vals[i].init.apply(this.helpers, [form, el]);
      }
    },
    
    
    fieldsFromForm: function(form) {
      var self      = this,
          opt       = this.options,
          dataNames = this.dataNames,
          valEls    = opt.validateElements,
          retArr    = [];
          valEls    = typeof valEls == 'string' ? [valEls] : valEls;
      
      for(var i = 0; i < valEls.length; i++) {
        var els = form.find(valEls[i] + '[' + opt.attribute + '*=' + opt.validateIndicator + ']');
        
        els.each(function() {
          var el     = $(this),
              attr   = el.attr(opt.attribute),
              events = self.extractEvents(attr, opt.eventIndicator);

          el.data(dataNames.validationString, attr).data(dataNames.events, events ? events : opt.validateEvents);
        });
        
        retArr.push(els.get());
      } 
      
      return this.normalizeArray(retArr);
    },
    
    
    fieldsFromObject: function(form, fields) {
      var opt       = this.options,
          dataNames = this.dataNames,
          retArr    = [];
      
      for(s in fields) {
        var valString, events;
        
        if(typeof fields[s] == 'string') {
          valString = fields[s];
          events    = opt.validateEvents;
        } else {
          valString = fields[s][0];
          events    = fields[s][1];
        }
        
        var valEls    = form.find(s);
            valString = this.mergeValidationString(valEls, valString);
            events    = this.mergeEventsString(valEls, events);
        
        valEls.data(dataNames.validationString, opt.validateIndicator + '(' + valString + ')')
              .data(dataNames.events, events);

        retArr.push(valEls.get());
      }
      
      return this.normalizeArray(retArr);
    },
    
    
    mergeEventsString: function(valEls, events) {
      var oldEvents = valEls.data(this.dataNames.events),
          newEvents = '';
      
      if(oldEvents) {
        var eveArr = oldEvents.split(' ');
        
        for(var i = 0; i < eveArr.length; i++) {
          if(events.indexOf(eveArr[i]) == -1) {
            newEvents += ' ' + eveArr[i];
          }
        }
      }
      
      return $.trim(events + newEvents);
    },
    
    
    mergeValidationString: function(valEls, newValString) {
      var opt          = this.options,
          valString    = valEls.data(this.dataNames.validationString),
          buildValFunc = function(validation) {
                           var ret = validation.name;
                           
                           if(validation.arguments.length) {
                             ret = ret + '(' + validation.arguments.join(',') + ')';
                           }
                           
                           return ret;
                         },
          inVals       = function(valsToCheck, val) {
                           for(var i = 0; i < valsToCheck.length; i++) {
                             if(valsToCheck[i].name == val.name) {
                               return true;
                             }
                           }
                         };
      
      if(valString) {
        var newVals      = this.extractValidations(opt.validateIndicator + '(' + newValString + ')', opt.validateIndicator),
            oldVals      = this.extractValidations(valString, opt.validateIndicator);
            newValString = '';
        
        for(var o = 0; o < oldVals.length; o++) {
          newValString += buildValFunc(oldVals[o]) + ',';
        }
        
        for(var n = 0; n < newVals.length; n++) {
          if(!inVals(oldVals, newVals[n])) {
            newValString += buildValFunc(newVals[n]) + ',';
          }
        }
      }
      
      return newValString;
    },
    
    
    bindFormSubmit: function(form) {
      var self = this,
          opt  = this.options;
	  if(opt.bindElement){
		  var bindEvent= !!opt.bindEvent?opt.bindEvent:"click";
		  if(typeof opt.bindElement=="string"){
			  opt.bindElement=opt.bindElement.indexOf("#")>=0?opt.bindElement:("#"+opt.bindElement);
			  opt.bindElement=$(opt.bindElement);
		  }
		  opt.bindElement.unbind(bindEvent).bind(bindEvent,function(event){
			  event.preventDefault();
			  var result=self.allFieldsValid(form, true);
			  //如果提供了事件对象，则这是一个非IE浏览器
			  if (event.stopPropagation){
				//因此它支持W3C的 stopPropagation()方法
				event.stopPropagation();
			  } else{
				//否则，我们需要使用IE的方式来取消事件冒泡
				event.cancelBubble = true;
			  }
			  return result;
		  });
	  }else if(opt.bindElementByClass){
		  var bindEvent= !!opt.bindEvent?opt.bindEvent:"click";
		  if(typeof opt.bindElementByClass=="string"){
			  opt.bindElementByClass=opt.bindElementByClass.indexOf(".")>=0?opt.bindElementByClass:("."+opt.bindElementByClass);
			  opt.bindElementByClass=$(opt.bindElementByClass);
		  }
		  opt.bindElementByClass.unbind(bindEvent).bind(bindEvent,function(event){
			  event.preventDefault();
			  var result=self.allFieldsValid(form, true);
			  //如果提供了事件对象，则这是一个非IE浏览器
			  if (event.stopPropagation){
				//因此它支持W3C的 stopPropagation()方法
				event.stopPropagation();
			  } else{
				//否则，我们需要使用IE的方式来取消事件冒泡
				event.cancelBubble = true;
			  }
			  return result;
		  });
	  } else {
		  form.submit(function() {
			return self.allFieldsValid(form, true);
		  });
	  }
    },
    
    bindFormReset: function(form) {
		var self = this;
		form.find("input:reset").click(function() {
			form.data(self.dataNames.elements).each(function() {    
				$(this).removeClass("ketchup-input-error");  
			});
		});
		$('.ketchup-error').each(function() {
    		$(this).css({"opacity": 0}).hide();
    	});
    },
    allFieldsValid: function(form, triggerEvents) {
      var self  = this,
          tasty = true;
      
      form.data(this.dataNames.elements).each(function() {          
        var el = $(this);
        
        if(self.validateElement(el, form) != true) {
          if(triggerEvents == true) {
            self.triggerValidationEvents(el);
          }
          
          tasty = false;
        }
      });

      form.trigger('formIs' + (tasty ? 'Valid' : 'Invalid'), [form]);
      
      return tasty;
    },
    
    
    bindValidationEvent: function(form, el) {      
      var self      = this,
          opt       = this.options,
          dataNames = this.dataNames,
          events    = el.data(dataNames.events).split(' ');
      for(var i = 0; i < events.length; i++) {
        el.bind('ketchup.' + events[i], function(event) {
        	var tasty     = self.validateElement(el, form),
        	container = el.data(dataNames.container);
        	if(tasty != true) {
	    		if(!container) {
	    			container = opt.createErrorContainer(form, el,event.namespace);
	    			el.data(dataNames.container, container);
	    		}                   	 
	    		opt.addErrorMessages(form, el, container, tasty);
				el.addClass("ketchup-input-error"); 
				
				if(event.namespace !="blur"){
					opt.showErrorContainer(form, el, container);
				} else {
					el.one("click",function(){
						 opt.showErrorContainer(form, el, container);
					});
				}
				el.one("blur",function(){
					opt.hideErrorContainer(form, el, container);
				});
          } else {
            if(container){
				el.removeClass("ketchup-input-error");  
              opt.hideErrorContainer(form, el, container);
            }
          }
        });
        
        this.bindValidationEventBridge(el, events[i]);
      }
      
      return this;
    },
    
    
    bindValidationEventBridge: function(el, event) {
      el.bind(event, function() {
        el.trigger('ketchup.' + event);
      });
    },
    
    
    validateElement: function(el, form) {
      var tasty = [],
          vals  = el.data(this.dataNames.validations),
          args  = [form, el, ($.trim(el.val()))];

      for(var i = 0; i < vals.length; i++) {
        if(!vals[i].func.apply(this.helpers, args.concat(vals[i].arguments))) {
          tasty.push(vals[i].message);
        }
      }
      
      form.trigger('fieldIs' + (tasty.length ? 'Invalid' : 'Valid'), [form, el]);
      
      return tasty.length ? tasty : true;
    },
    
    
    elementIsValid: function(el) {
      var dataNames = this.dataNames;
      
      if(el.data(dataNames.validations)) {
        var form = el.parentsUntil('form').last().parent();
		var  isValid=(this.validateElement(el, form) == true ? true : false);
			if(isValid){
				el.removeClass("ketchup-input-error");  
			} else {
				el.addClass("ketchup-input-error");  
			}
			return isValid;
      } else if(el.data(dataNames.elements)) {
        return this.allFieldsValid(el);
      }
      
      return null;
    },
    
    
    triggerValidationEvents: function(el) {
      var events = el.data(this.dataNames.events).split(' ');
      
      for(var e = 0; e < events.length; e++) {
        el.trigger('ketchup.' + events[e]);
      }
    },
    
    
    extractValidations: function(toExtract, indicator) { //I still don't know regex
      var fullString   = toExtract.substr(toExtract.indexOf(indicator) + indicator.length + 1),
          tempStr      = '',
          tempArr      = [],
          openBrackets = 0,
          validations  = [];
      
      for(var i = 0; i < fullString.length; i++) {
        switch(fullString.charAt(i)) {
          case '(':
            tempStr += '(';
            openBrackets++;
            break;
          case ')':
            if(openBrackets) {
              tempStr += ')';
              openBrackets--;
            } else {
              tempArr.push($.trim(tempStr));
            }
            break;
          case ',':
            if(openBrackets) {
              tempStr += ',';
            } else {
              tempArr.push($.trim(tempStr));
              tempStr = '';
            }
            break;
          default:
            tempStr += fullString.charAt(i);
            break;
        }
      }
      
      for(var v = 0; v < tempArr.length; v++) {
        var hasArgs = tempArr[v].indexOf('('),
            valName = tempArr[v],
            valArgs = [];
            
        if(hasArgs != -1) {
          valName = $.trim(tempArr[v].substr(0, hasArgs));
		  var valArgStr=tempArr[v].substr(valName.length);
		  if(this.defaults.delimit===","){
			  if(valArgStr.indexOf("^") >0 && valArgStr.indexOf("$")>0){
				   valArgs = $.map(tempArr[v].substr(valName.length+1).split("$"), function(n,i) {
					   if(i==0){
						   var j=n.indexOf("^");
						   if((j+1) !=n.indexOf("\\")){
							   n=n.substring(0,j+1)+"\\"+n.substring(j+1);
						   }
						   return $.trim(n+"$");
					   } else {
						   return  $.trim(n.replace('(', '').replace(')', ''));
					   }
				  });
			  } else {
				  valArgs = $.map(tempArr[v].substr(valName.length).split(this.defaults.delimit), function(n) {
					return $.trim(n.replace('(', '').replace(')', ''));
				  });
			  }
		  }else {
			  valArgs = $.map(valArgStr.split(this.defaults.delimit), function(n) {
				return $.trim(n.replace('(', '').replace(')', ''));
			  });
		  }
        }
        //'required:提示信息'
        var valNameArray = valName.split(":");
        valName=valNameArray[0];
        var valFunc = this.validations[valName];
 
        if(valFunc && valFunc.message) {
          var message = valFunc.message;
          //扩展自定义提示信息
          if(valNameArray[1]){
        	  message =valNameArray[1];
          }
          for(var a = 1; a <= valArgs.length; a++) {
            message = message.replace('{arg' + a + '}', valArgs[a - 1]);
          }
          
          validations.push({
            name     : valName,
            arguments: valArgs,
            func     : valFunc.func,
            message  : message,
            init     : valFunc.init
          });
        }
      }
      
      return validations;
    },
    
    
    extractEvents: function(toExtract, indicator) {
      var events = false,
          pos    = toExtract.indexOf(indicator + '(');
      
      if(pos != -1) {
        events = toExtract.substr(pos + indicator.length + 1).split(')')[0];
      }

      return events;
    },
    
    
    normalizeArray: function(array) {
      var returnArr = [];
      
      for(var i = 0; i < array.length; i++) {
        for(var e = 0; e < array[i].length; e++) {
          if(array[i][e]) {
            returnArr.push(array[i][e]);
          }
        }
      }
      
      return returnArr;
    },
    
    
    createErrorContainer: function(form, el,eventName) {
      if(typeof form == 'function') {
        this.defaults.createErrorContainer = form;
        return this;
      } else {
		var elOffset = el.offset(); 
		var leftTip=elOffset.left;
		var topTip= elOffset.top;
		var sw=Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);
		if(this.targetPosition=="leftdown"){
				leftTip=(elOffset.left + el.outerWidth()+100)>sw?elOffset.left + el.outerWidth()/2-50: elOffset.left + el.outerWidth()- 20;
		} else if(this.targetPosition=="rightdown"){
				leftTip=elOffset.left > el.outerWidth()?(elOffset.left-el.outerWidth()+50):elOffset.left/2-20;
		}else if(this.targetPosition=="centerdown" || this.targetPosition=="centerup"){
				leftTip=elOffset.left +el.outerWidth()/20-10;
		}
		if(this.targetPosition.indexOf("up")>0){
				topTip=topTip+el.outerHeight()+50;
		}
		if(leftTip<0) {
			leftTip=5;
		}
		var atrType=el.attr("type");
		if(atrType=="radio" || atrType=="checkbox"){
			var num=$("input[type="+atrType+"][name='"+el.attr("name")+"']",form).size();
			leftTip=leftTip-20*num;
		}
		if(this.targetPosition.indexOf("up")>0){
			if(eventName=="blur"){
				return $('<div class="ketchup-error"><span class='+this.targetPosition+'></span><ul></ul></div>')
				.css({
						top : topTip,
						left: leftTip,
						opacity: 0,
						display: "none"
			 	}).appendTo('body');
			} else {
				return $('<div class="ketchup-error"><span class='+this.targetPosition+'></span><ul></ul></div>')
						.css({
								top : topTip,
								left: leftTip
					 	}).appendTo('body');
			}
		} else {
			if(eventName=="blur"){
				return $('<div class="ketchup-error"><ul></ul><span class='+this.targetPosition+'></span></div>')
				.css({
					top : topTip,
					left: leftTip,
					opacity: 0,
					display: "none"
				}).appendTo('body');
			} else {
				return $('<div class="ketchup-error"><ul></ul><span class='+this.targetPosition+'></span></div>')
				.css({
					top : topTip,
					left: leftTip
				}).appendTo('body');	
			}

		
		}
      }

    },
    
    
    showErrorContainer: function(form, el, container) {
      if(typeof form == 'function') {
        this.defaults.showErrorContainer = form;
        return this;
      } else {
		  if(el.attr("type")=="radio" || el.attr("type")=="checkbox"){
			  $('.ketchup-error').each(function() {
				  if($(this).index() !=container.index())
					  $(this).hide();
		       });
		  }
		  if(this.targetPosition.indexOf("up")>0){
			  	container.show().animate({
					 top    : el.offset().top +el.outerHeight()+1,
					opacity: 1
				  }, 'fast');
		  } else {
			  container.show().animate({
					 top    : el.offset().top - container.height(),
					opacity: 1
				  }, 'fast');
		  }

      }
    },
    
    
    hideErrorContainer: function(form, el, container) {
      if(typeof form == 'function') {
        this.defaults.hideErrorContainer = form;
        return this;
      } else {
    	  if(el.attr("type")=="radio" || el.attr("type")=="checkbox"){
			  $('.ketchup-error').each(function() {
				  if($(this).index() !=container.index())
					  $(this).hide();
		         });
		  }
		   if(this.targetPosition.indexOf("up")>0){
			  	container.show().animate({
					 top    : el.offset().top +container.height(),
					opacity: 0
				  }, 'fast', function() {
				  container.hide();
				});
		  } else {
				container.animate({
				  top    : el.offset().top,
				  opacity: 0
				}, 'fast', function() {
				  container.hide();
				});
		  }
      }
    },
    
    removeErrorContainer:function(form){
    	var self = this;
    	if(self.dataNames && self.dataNames.elements && $.isArray(self.dataNames.elements)){
    		if(form.data(self.dataNames.elements)){
        		form.data(self.dataNames.elements).each(function() { 
        			$(this).data(self.dataNames.container,null);
        			$(this).removeClass("ketchup-input-error");  
        		});
    		}
    	}
    	$('.ketchup-error').each(function() {
    		$(this).remove();
    	});
    },
    hideAllErrorContainer:function(form){
    	var self = this;
    	if(self.dataNames && self.dataNames.elements && $.isArray(self.dataNames.elements)){
    		if(form.data(self.dataNames.elements)){
        		form.data(self.dataNames.elements).each(function() { 
        			$(this).removeClass("ketchup-input-error");  
        		});
    		}
    	}
    	$('.ketchup-error').each(function() {
    		$(this).css({"opacity": 0}).hide();
    	});
    },
    
    addErrorMessages: function(form, el, container, messages) {
      if(typeof form == 'function') {
        this.defaults.addErrorMessages = form;
        return this;
      } else {
        var list = container.children('ul');
        
        list.html('');
        
        for(var i = 0; i < messages.length; i++) {
        	$('<li>'+messages[i]+'</li>').appendTo(list);
        }
      }
    }
  };
  
  
  $.fn.ketchup = function(options, fields) {
    var el = $(this);
    
    if(typeof options == 'string') {
      switch(options) {
        case 'validate':
          $.ketchup.triggerValidationEvents(el);
          break;
        case 'isValid':
          return $.ketchup.elementIsValid(el);
          break;
      }
    } else {
      this.each(function() {
        $.ketchup.init(el, $.extend({}, $.ketchup.defaults, options), fields);
      });
    }
    
    return this;
  };
})(jQuery);
jQuery.ketchup
.helper('isNumber', function(value) {
  return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
})

.helper('contains', function(value, word) {
  return value.indexOf(word) != -1;
})

.helper('isEmail', function(value) {
  return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
})

.helper('isUrl', function(value) {
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
})

.helper('isUsername', function(value) {
  return /^([a-zA-Z])[a-zA-Z_-]*[\w_-]*[\S]$|^([a-zA-Z])[0-9_-]*[\S]$|^[a-zA-Z]*[\S]$/.test(value);
})

.helper('mask', function(pattern,value) {
  return new RegExp(pattern).test(value);
})

.helper('isDate', function(value) {
  return (!/Invalid|NaN/.test(new Date(value)));
})

.helper('inputsWithName', function(form, el) {
  return $('input[name="' + el.attr('name') + '"]', form);
})

.helper('inputsWithNameNotSelf', function(form, el) {
  return this.inputsWithName(form, el).filter(function() {
           return ($(this).index() != el.index());
         });
})

.helper('getKetchupEvents', function(el) {
  var events = el.data('events').ketchup,
      retArr = [];
  
  for(var i = 0; i < events.length; i++) {
    retArr.push(events[i].namespace);
  }
      
  return retArr.join(' ');
})

.helper('bindBrothers', function(form, el) {
  this.inputsWithNameNotSelf(form, el).bind(this.getKetchupEvents(el), function() {
    el.ketchup('validate');
  });
})
.helper('terminalCodeCheck',function(val){
	if(val.length>20 || val.length < 5)
		return false;
	return (/^[a-z0-9A-Z]{5,20}$/).test(val);
})
.helper('idCardCheck', function(num) {
	num = num.toUpperCase();
	if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
	{
		return false;
	}
	var len, re;
	len = num.length;
	if(len == 15) {
		re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
		var arrSplit = num.match(re);
		var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
		var bGoodDay;
		bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
		if(!bGoodDay) {
			return false;
		} else {
			var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
			var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
			var nTemp = 0, i;
			num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
			for( i = 0; i < 17; i++) {
				nTemp += num.substr(i, 1) * arrInt[i];
			}
			num += arrCh[nTemp % 11];
			return num;
		}
	}
	if(len == 18) {
		re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
		var arrSplit = num.match(re);
		var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
		var bGoodDay;
		bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
		if(!bGoodDay) {
			return false;
		} else {
			var valnum;
			var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
			var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
			var nTemp = 0, i;
			for( i = 0; i < 17; i++) {
				nTemp += num.substr(i, 1) * arrInt[i];
			}
			valnum = arrCh[nTemp % 11];
			if(valnum != num.substr(17, 1)) {
				return false;
			}
			return num;
		}
	}
	return false;
})
.helper('idCardCheck18', function(num) {
		num = num.toUpperCase();
	/*	if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
		{
			return false;
		}*/
		if(!(/(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
		{
			return false;
		}
		var len, re;
		len = num.length;
		if(len == 15) {
			re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				num += arrCh[nTemp % 11];
				return num;
			}
		}
		if(len == 18) {
			re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var valnum;
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				valnum = arrCh[nTemp % 11];
				if(valnum != num.substr(17, 1)) {
					return false;
				}
				return num;
			}
		}
		return false;
	});
jQuery.ketchup

.validation('required', 'This field is required.', function(form, el, value) {
  var type = el.attr('type').toLowerCase();
  
  if(type == 'checkbox' || type == 'radio') {
    return (el.attr('checked') == true);
  } else {
    return (($.trim(value)).length != 0);
  }
})

.validation('minlength', 'This field must have a minimal length of {arg1}.', function(form, el, value, min) {
  return (value.length >= +min);
})

.validation('maxlength', 'This field must have a maximal length of {arg1}.', function(form, el, value, max) {
  return (value.length <= +max);
})

.validation('rangelength', 'This field must have a length between {arg1} and {arg2}.', function(form, el, value, min, max) {
  return (value.length >= min && value.length <= max);
})
.validation('mask', 'This field must mask pattern {arg2} .', function(form, el, value, pattern) {
  return this.mask(pattern,value);
})
.validation('min', 'Must be at least {arg1}.', function(form, el, value, min) {
  return (this.isNumber(value) && +value >= +min);
})

.validation('max', 'Can not be greater than {arg1}.', function(form, el, value, max) {
  return (this.isNumber(value) && +value <= +max);
})

.validation('range', 'Must be between {arg1} and {arg2}.', function(form, el, value, min, max) {
  return (this.isNumber(value) && +value >= +min && +value <= +max);
})

.validation('number', 'Must be a number.', function(form, el, value) {
  return this.isNumber(value);
})

.validation('digits', 'Must be digits.', function(form, el, value) {
  return /^\d+$/.test(value);
})

.validation('email', 'Must be a valid E-Mail.', function(form, el, value) {
  return this.isEmail(value);
})

.validation('url', 'Must be a valid URL.', function(form, el, value) {
  return this.isUrl(value);
})

.validation('username', 'Must be a valid username.', function(form, el, value) {
  return this.isUsername(value);
})

.validation('match', 'Must be {arg1}.', function(form, el, value, word) {
  return (el.val() == word);
})

.validation('contain', 'Must contain {arg1}', function(form, el, value, word) {
  return this.contains(value, word);
})

.validation('date', 'Must be a valid date.', function(form, el, value) {
  return this.isDate(value);
})

.validation('minselect', 'Select at least {arg1} checkboxes.', function(form, el, value, min) {
  return (min <= this.inputsWithName(form, el).filter(':checked').length);
}, function(form, el) {
  this.bindBrothers(form, el);
})

.validation('maxselect', 'Select not more than {arg1} checkboxes.', function(form, el, value, max) {
  return (max >= this.inputsWithName(form, el).filter(':checked').length);
}, function(form, el) {
  this.bindBrothers(form, el);
})

.validation('rangeselect', 'Select between {arg1} and {arg2} checkboxes.', function(form, el, value, min, max) {
  var checked = this.inputsWithName(form, el).filter(':checked').length;
  
  return (min <= checked && max >= checked);
}, function(form, el) {
  this.bindBrothers(form, el);
});
jQuery.ketchup
.validation('required', '该字段必填.', function(form, el, value,other) {
	var nodeName=el.get(0).nodeName.toLowerCase();
	if(nodeName=="select"){
		if(other){
			return (value !=other);
		}
		return (value != "");
	} else {
		var type = el.attr('type').toLowerCase();
		if(type == 'checkbox' || type == 'radio') {
			return (el.attr('checked') == true);
		} else {
			return (value.length != 0);
		}
	}
})

.validation('reg', '{arg1}', function(form, el, value, mark) {
  	return new RegExp(mark).test(value);
})

.validation('minlength', '该字段最短长度至少 {arg1}.', function(form, el, value, min) {
  return (value.length >= +min);
})

.validation('maxlength', '该字段最长长度至多 {arg1}.', function(form, el, value, max) {
  return (value.length <= +max);
})

.validation('rangelength', '该字段长度范围必须 在 {arg1} 和 {arg2}之间.', function(form, el, value, min, max) {
  return (value.length >= min && value.length <= max);
})
.validation('mask', '该字段必须匹配 {arg2}.', function(form, el, value, pattern) {
  return this.mask(pattern,value);
})
.validation('decimalTwo', '必须为大于0的有效数字,最小保留2位小数.', function(form, el, value) {
	var pattern = /^(([1-9]{1}\d*(\.\d{1,2})?)|(0\.\d[1-9])|(0\.[1-9]\d?))$/;
  	return this.mask(pattern,value);
})
.validation('min', '最小值为 {arg1}.', function(form, el, value, min) {
  return (this.isNumber(value) && +value >= +min);
})

.validation('max', '最大值不能超过 {arg1}.', function(form, el, value, max) {
  return (this.isNumber(value) && +value <= +max);
})

.validation('range', '数字值范围在 {arg1} 和 {arg2} 之间.', function(form, el, value, min, max) {
  return (this.isNumber(value) && +value >= +min && +value <= +max);
})

.validation('number', '必须是数字.', function(form, el, value) {
  return this.isNumber(value);
})

.validation('digits', '必须是整数.', function(form, el, value) {
  return /^\d+$/.test(value);
})

.validation('contactTel', '联系电话必须为手机号或固话.', function(form, el, value) {
  return /^((1\d{10})|((0\d{2,3}\-?)?[2-9]\d{6,7}))$/.test(value);
})

.validation('isTelecomSection', '必须为有效的中国电信手机号码.', function(form, el, value) {
  return /^(180|189|133|134|153|181|108|170|177)\d{8}$/.test(value);
})
.validation('isTelecomOridCardCheck', '必须为有效的中国电信手机号码或输入合法身份证号码，', function(form, el, value) {
  return (/^(180|189|133|134|153|181|108|170|177)\d{8}$/.test(value))||(this.idCardCheck(value));
})
.validation('isStaffCode', '4-16位字符,可由英文、数字及"_"、"-"组成.', function(form, el, value) {
  return /^[a-zA-Z\d][\w-]{2,14}[a-zA-Z\d]$/.test(value);
})
.validation('email', '必须是合法的E-Mail.', function(form, el, value) {
  return this.isEmail(value);
})

.validation('url', '必须是合法的 URL.', function(form, el, value) {
  return this.isUrl(value);
})

.validation('username', '必须是用户名.', function(form, el, value) {
  return this.isUsername(value);
})

.validation('match', '必须等于 {arg1}.', function(form, el, value, word) {
  return (el.val() == word);
})

.validation('pwdMatch', '{arg1}.', function(form, el, value, word) {
  return (el.val() == $("#"+word).val());
})

.validation('contain', '必须含有 {arg1}', function(form, el, value, word) {
  return this.contains(value, word);
})

.validation('date', '必须是合法的日期 .', function(form, el, value) {
  return this.isDate(value);
})

.validation('minselect', '至少选 {arg1} 项.', function(form, el, value, min) {
  return (min <= this.inputsWithName(form, el).filter(':checked').length);
}, function(form, el) {
  this.bindBrothers(form, el);
})

.validation('maxselect', '最多选 {arg1} 项.', function(form, el, value, max) {
  return (max >= this.inputsWithName(form, el).filter(':checked').length);
}, function(form, el) {
  this.bindBrothers(form, el);
})

.validation('rangeselect', '必须选 {arg1} 和 {arg2} 项之间.', function(form, el, value, min, max) {
  var checked = this.inputsWithName(form, el).filter(':checked').length;
  
  return (min <= checked && max >= checked);
}, function(form, el) {
  this.bindBrothers(form, el);
})
.validation('idCardCheck', '请输入合法身份证号码', function(form, el, value) {
	return this.idCardCheck(value);
})
.validation('idCardCheck18', '请输入合法身份证号码', function(form, el, value) {
	return this.idCardCheck18(value);
})
.validation('terminalCodeCheck', '请输入合法的终端串码<br/>&nbsp;&nbsp;&nbsp;必须5到20位字母或数字组合,不限大小写', function(form, el, value) {
	return this.terminalCodeCheck(value);
})
.validation('idCardCheck4Target', '请输入合法身份证号码', function(form, el, value,targetId,targetVal) {
	if($("#"+targetId).val()==targetVal){
		return this.idCardCheck(value);
	}else{
		return true;
	}
	
})
.validation('checkLength', '密码必须为{arg3}位数，且不能过于简单', function(form, el, value,targetId,targetVal,len) {
	if($("#"+targetId).val()==targetVal){
		return value.length==len;
	}else{
		return true;
	}
	
})

.validation('simple_password_num1', '密码必须为{arg1}位，且不能过于简单', function(form, el,value,len) {
	//targetId 如果为空，判断第一个密码 不能为空
	//targetId 不为空[target是第一个密码的id]，判断第二个密码与第一个密码是否相等
	if(value==null||value==""){
		return false ;
	}
	if(value.length!=len){
		return false ;
	}
	if(this.isNumber(value)){
		var v = check_computeComplex(value);
		return v>1?true:false;
	}
})

.validation('simple_password_eql1', '两次密码不一致', function(form, el,value,targetId) {
	//targetId 如果为空，判断第一个密码 不能为空
	//targetId 不为空[target是第一个密码的id]，判断第二个密码与第一个密码是否相等
	var val2 = $("#"+targetId).val() ;
	if(value!=null&&value!=""){
		if(val2!=null&&val2!=""&&value!=val2){
			return false ;
		}
	}
	return true ;
})


.validation('simple_password_num2', '两次密码不一致', function(form, el,value,targetId) {
	//targetId 如果为空，判断第一个密码 不能为空
	//targetId 不为空[target是第一个密码的id]，判断第二个密码与第一个密码是否相等
	var val1 = $("#"+targetId).val() ;
	if(val1==null||val1==""){
		if(value==null||value==""){
			return true ;
		}
	}
	if(val1==value){
		return true ;
	}
	return false ;
})

.validation('equ_notnull', '两次密码不一致', function(form, el, value,targetId) {
	
})

.validation('checkLen', '密码必须为{arg1}位数', function(form, el, value,len) {
	if(value!=null&&value!=""){
		return value.length==len;
	}
})

.validation('checkLen', '密码必须为{arg1}位数', function(form, el, value,len) {
	if(value!=null&&value!=""){
		return value.length==len;
	}
})

.validation('checkCertOfficer', '请填写合法军官证号', function(form, el, value,targetId,targetVal) {
	if($("#"+targetId).val()==targetVal){
		return value!="";
	}else{
		return true;
	}
})
.validation('checkPassport', '请填写合法护照号', function(form, el, value,targetId,targetVal) {
	if($("#"+targetId).val()==targetVal){
		return value!="";
	}else{
		return true;
	}
})
.validation('depEq', '必须等于 {arg1}.', function(form, el, value,targetId) {
	if($("#"+targetId).val()!=null&&$("#"+targetId).val()!=""){
		return $("#"+targetId).val()==value;
	}
	return true ;
})

.validation('isSimplePwdNum', '非数字或过于简单', function(form, el, value) {
	if(this.isNumber(value)){
		var v = check_computeComplex(value);
		return v>1?true:false;
	}
	return false;
})

.validation('isSimplePwd', '密码强度太低.', function(form, el, value,targetId) {
//	if(value.length < 6){
//		return false;
//	}
//	//判断是否全部为一样
//	if(value.length % 2 == 0) {
//		var a = value.substring(0,value.length/2);
//		var b = value.substring(value.length/2,value.length);
//		if(a == b){
//			return false;
//		}
//	}else {
//		var a = value.substring(0,(value.length-1)/2);
//		var b = value.substring((value.length-1)/2,value.length-1);
//		if(a == b){
//			var lastStr = value.charAt(value.length-1);
//			if(lastStr == a.charAt(0)) {
//				return false;
//			}
//		}
//		
//	}
//	//判断是否为递增或递减字符串
//	var result = 0;
//	for(var i =0;i<value.length;i++) {
//		if((i+1) != value.length){
//			var a = parseInt(value.charCodeAt(i),10);
//			var b = parseInt(value.charCodeAt(i+1),10);
//			if(b-a == 1) {
//				result++;
//			}
//			else if(b-a==-1){
//				result++;
//			}
//			else {
//				result = 0;
//			}
//		}
//	}
//	if(result == (value.length-1)) {
//		return false;
//	}
//	return true;
	
	//判断是否为单一字符，例如全部为数字或小写字母，必须为组合密码
	Modes=0; 
	for (i=0;i<value.length;i++){ 
		var sChar = 0;
		var iN = value.charCodeAt(i)
		if (iN>=48 && iN <=57) //数字 
		sChar= 1; 
		if (iN>=65 && iN <=90) //大写字母 
		sChar= 2; 
		if (iN>=97 && iN <=122) //小写 
		sChar= 4; 
		else 
		sChar= 8; //特殊字符
		//测试每一个字符的类别并统计一共有多少种模式. 
		Modes=Modes|sChar; 
	} 
	var S_level = 0;
	for (i=0;i<4;i++){ 
		if (Modes & 1) S_level++; 
		Modes>>>=1; 
	} 
	if(S_level == 0 || S_level == 1) {
		return false;
	}
	return true;
});



/**
 *  Zebra_Dialog
 *
 *  A small (4KB minified), compact (one JS file, no dependencies other than jQuery 1.5.2+) and highly configurable
 *  dialog box plugin for jQuery meant to replace JavaScript's "alert" and "confirmation" dialog boxes.
 *
 *  Can also be used as a notification widget - when configured to show no buttons and to close automatically - for updates
 *  or errors, without distracting users from their browser experience by displaying obtrusive alerts.
 *
 *  Features:
 *
 *  -   great looks - out of the box
 *  -   5 types of dialog boxes available: confirmation, information, warning, error and question;
 *  -   easily customizable appearance by changing the CSS file
 *  -   create modal or non-modal dialog boxes
 *  -   easily add custom buttons
 *  -   position the dialog box wherever you want - not just in the middle of the screen
 *  -   use callback functions to handle user's choice
 *  -   works in all major browsers (Firefox, Opera, Safari, Chrome, Internet Explorer 6, 7, 8, 9)
 *
 *  Visit {@link http://stefangabos.ro/jquery/zebra-dialog/} for more information.
 *
 *  For more resources visit {@link http://stefangabos.ro/}
 *
 *  @author     Stefan Gabos <contact@stefangabos.ro>
 *  @version    1.1.1 (last revision: September 24, 2011)
 *  @copyright  (c) 2011 Stefan Gabos
 *  @license    http://www.gnu.org/licenses/lgpl-3.0.txt GNU LESSER GENERAL PUBLIC LICENSE
 *  @package    Zebra_Dialog
 */
;(function($) {

    $.Zebra_Dialog = function() {

        // default options
        var defaults = {
        	
        	id:                         "",             //the dialog that uniquely identifies
         		
        	open_speed:                 false,          //  The number of milliseconds before which to
            											//  open the dialog box or FALSE to no speed  
            											//  directly open the dialog box . 

            animation_speed:            250,            //  The speed, in milliseconds, by which the overlay and the
                                                        //  dialog box will be animated when closing.
                                                        //
                                                        //  Default is 250

            auto_close:                 false,          //  The number of milliseconds after which to automatically
                                                        //  close the dialog box or FALSE to not automatically close the
                                                        //  dialog box.
                                                        //
                                                        //  Default is FALSE

            buttons:                    true,           //  Use this for localization and for adding custom buttons.
                                                        //
                                                        //  If set to TRUE, the default buttons will be used, depending
                                                        //  on the type of the dialog box: ['Yes', 'No'] for "question"
                                                        //  type and ['Ok'] for the other dialog box types.
                                                        //
                                                        //  For custom buttons, use an array containing the captions of
                                                        //  the buttons to display: ['My button 1', 'My button 2'].
                                                        //
                                                        //  Set to FALSE if you want no buttons.
                                                        //
                                                        //  Note that when the dialog box is closed as a result of clicking
                                                        //  a button, the "onClose" event is triggered and the callback
                                                        //  function (if any) receives as argument the caption of the
                                                        //  clicked button.
                                                        //
                                                        //  See the comments for the "onClose" event below for more
                                                        //  information.

            custom_class:                false,         //  An extra class to add to the dialog box's container. Useful
                                                        //  for customizing a dialog box elements' styles at run-time.
                                                        //
                                                        //  For example, setting this value to "mycustom" and in the
                                                        //  CSS file having something like
                                                        //  .mycustom .ZebraDialog_Title { background: red }
                                                        //  would set the dialog box title's background to red.
                                                        //
                                                        //  See the CSS file for what can be changed.
                                                        //
                                                        //  Default is FALSE

            keyboard:                   true,           //  When set to TRUE, pressing the ESC key will close the dialog
                                                        //  box.
                                                        //
                                                        //  Default is TRUE.

            message:                    '',             //  The message in the dialog box - this is passed as argument
                                                        //  when the plugin is called.

            modal:                      true,           //  When set to TRUE there will be a semitransparent overlay
                                                        //  behind the dialog box, preventing users from clicking 
                                                        //  the page's content.
                                                        //
                                                        //  Default is TRUE

            overlay_close:              true,           //  Should the dialog box close when the overlay is clicked?
                                                        //
                                                        //  Default is TRUE

            overlay_opacity:            .9,             //  The opacity of the overlay (between 0 and 1)
                                                        //
                                                        //  Default is .9

            position:                   'center',       //  Position of the dialog box.
                                                        //
                                                        //  Can be either "center" (which would center the dialog box) or
                                                        //  an array with 2 elements, in the form of
                                                        //  {'horizontal_position +/- offset', 'vertical_position +/- offset'}
                                                        //  (notice how everything is enclosed in quotes) where
                                                        //  "horizontal_position" can be "left", "right" or "center",
                                                        //  "vertical_position" can be "top", "bottom" or "middle", and
                                                        //  "offset" represents an optional number of pixels to add/substract
                                                        //  from the respective horizontal or vertical position.
                                                        //
                                                        //  Positions are relative to the viewport (the area of the
                                                        //  browser that is visible to the user)!
                                                        //
                                                        //  Examples:
                                                        //
                                                        //  ['left + 20', 'top + 20'] would position the dialog box in the
                                                        //  top-left corner, shifted 20 pixels inside.
                                                        //
                                                        //  ['right - 20', 'bottom - 20'] would position the dialog box
                                                        //  in the bottom-right corner, shifted 20 pixels inside.
                                                        //
                                                        //  ['center', 'top + 20'] would position the dialog box in
                                                        //  center-top, shifted 20 pixels down.
                                                        //
                                                        //  Default is "center".

            title:                      '',             //  Title of the dialog box
                                                        //
                                                        //  Default is "" (an empty string - no title)

            type:                       'information',  //  Dialog box type.
                                                        //
                                                        //  Can be any of the following:
                                                        //
                                                        //  - confirmation
                                                        //  - error
                                                        //  - information
                                                        //  - question
                                                        //  - warning
                                                        //
                                                        //  If you don't want an icon, set the "type" property to FALSE.
                                                        //
                                                        //  By default, all types except "question" have a single button
                                                        //  with the caption "Ok"; type "question" has two buttons, with
                                                        //  the captions "Ok" and "Cancel" respectively.
                                                        //
                                                        //  Default is "information".

            vcenter_short_message:      true,           //  Should short messages be vertically centered?
                                                        //
                                                        //  Default is TRUE

            width:                      0,              //  By default, the width of the dialog box is set in the CSS
                                                        //  file. Use this property to override the default width at
                                                        //  run-time.
                                                        //
                                                        //  Must be an integer, greater than 0. Anything else will instruct
                                                        //  the script to use the default value, as set in the CSS file.
                                                        //  Value should be no less than 200 for optimal output.
                                                        //
                                                        //  Default is 0 - use the value from the CSS file.

            onClose:                null,                //  Event fired when the dialog box is closed.
                                                        //
                                                        //  The callback function (if any) receives as argument the
                                                        //  caption of the clicked button or boolean FALSE if the dialog
                                                        //  box is closed by pressing the ESC key or by clicking on the
                                                        //  overlay.
            targetEle:           null,// sample : $(this)[0]
            isDrag:              false                  //Whether to support drag,true:yes false:no,the default is false

        };

        // to avoid confusions, we use "plugin" to reference the current instance of the object
        var plugin = this;

        // this will hold the merged default, and user-provided options
        plugin.settings = {};

        // by default, we assume there are no custom options provided
        options = {};

        // if plugin is initialized so that first argument is a string
        // that string is the message to be shown in the dialog box
        if (typeof arguments[0] == 'string') options.message = arguments[0];
            
        // if plugin is initialized so that first or second argument is an object
        if (typeof arguments[0] == 'object' || typeof arguments[1] == 'object')

            // extend the options object with the user-provided options
            options = $.extend(options, (typeof arguments[0] == 'object' ? arguments[0] : arguments[1]));

        /**
         *  Constructor method
         *
         *  @return object  Returns a reference to the plugin
         */
        plugin.init = function() {

            // the plugin's final properties are the merged default and user-provided options (if any)
            plugin.settings = $.extend({}, defaults, options);

            // check if browser is Internet Explorer 6 and set a flag accordingly as we need to perform some extra tasks
            // later on for Internet Explorer 6
            plugin.isIE6 = ($.browser.msie && parseInt($.browser.version, 10) == 6) || false;

            // if dialog box should be modal
            if (plugin.settings.modal) {

                // create the overlay
                plugin.overlay = jQuery('<div class="ZebraDialogOverlay">').css({

                    'position': (plugin.isIE6 ? 'absolute' : 'fixed'),  //  for IE6 we emulate the "position:fixed" behaviour
                    'left':     0,                                      //  the overlay starts at the top-left corner of the
                    'top':      0,                                      //  browser window (later on we'll stretch it)
                    'opacity':  plugin.settings.overlay_opacity,        //  set the overlay's opacity
                    'z-index':  9998                                    //  set a high value for z-index

                });

                // if dialog box can be closed by clicking the overlay
                if (plugin.settings.overlay_close)

                    // when the overlay is clicked
                    // remove the overlay and the dialog box from the DOM
                    plugin.overlay.bind('click', plugin.close);

                // append the overlay to the DOM
                plugin.overlay.appendTo('body');

            }

            // create the dialog box
            plugin.dialog = jQuery('<div>').attr("id",plugin.settings.id).addClass('ZebraDialog' + (plugin.settings.custom_class ? ' ' + plugin.settings.custom_class : '')
            		).css({

                'position':     (plugin.isIE6 ? 'absolute' : 'fixed'),  //  for IE6 we emulate the "position:fixed" behaviour
                'left':         0,                                      //  by default, place it in the top-left corner of the
                'top':          0,                                      //  browser window (we'll position it later)
                'z-index':      9999,                                   //  the z-index must be higher than the overlay's z-index
                'display':   'none'                                //  the dialog box is hidden for now

            });

            // if a notification message
            if (!plugin.settings.buttons && plugin.settings.auto_close) {

                // generate a unique id so that we can easily find similar notifications in the DOM and stack them properly
                // (propert stacking is not currently implemented though)
                // the unique id is made up of the box's position and its auto_close value
                plugin.settings.uniqueid =  (plugin.settings.position + plugin.settings.auto_close + '').
                                            replace(/\+/g, 'inc').replace(/\-/g, 'dec').replace(/[^a-z0-9]/gi, '');

                // add the unique id as a class
                plugin.dialog.addClass(plugin.settings.uniqueid);

            }

            // check to see if the "width" property is given as an integer
            // try to convert to a integer
            var tmp = parseInt(plugin.settings.width);

            // if converted value is a valud number
            if (!isNaN(tmp) && tmp == plugin.settings.width && tmp.toString() == plugin.settings.width.toString() && tmp > 0)

                // set the dialog box's width
                plugin.dialog.css({'width' : plugin.settings.width});

            // if dialog box has a title
            if (plugin.settings.title)

                // create the title
                jQuery('<h3>').addClass('ZebraDialog_Title'
                // set the title's text
                // and append the title to the dialog box
                ).html(plugin.settings.title).appendTo(plugin.dialog);

            // create the container of the actual message
            // we save it as a reference because we'll use it later in the "draw" method
            // if the "vcenter_short_message" property is TRUE
            plugin.message = jQuery('<div>').addClass(

                // if a known dialog box type is specified, also show the appropriate icon
                'ZebraDialog_Body' + (get_type() != '' ? ' ZebraDialog_Icon ZebraDialog_' + get_type() : '')

            );

            // if short messages are to be centered vertically
            if (plugin.settings.vcenter_short_message)

                // create a secondary container for the message and add everything to the message container
                // (we'll later align the container vertically)
                jQuery('<div>').html(plugin.settings.message).appendTo(plugin.message);

            // if short messages are not to be centered vertically
            else

                // add the message to the message container
                plugin.message.html(plugin.settings.message);

            // add the message container to the dialog box
            plugin.message.appendTo(plugin.dialog);

            // get the buttons that are to be added to the dialog box
            var buttons = get_buttons();
            // if there are any buttons to be added to the dialog box
            if (buttons) {

                // create the button bar
                var button_bar = jQuery('<div>').addClass(

                    'ZebraDialog_Buttons'

                // append it to the dialog box
                ).appendTo(plugin.dialog);

                // iterate through the buttons that are to be attached to the dialog box
                $.each(buttons, function(index, value) {

                    // create button
                    var button = jQuery('<a>').attr("href","javascript:void(0)").addClass(
                        'ZebraDialog_Button' + index
                    // set button's caption
                    ).html(value);

                    // when the button is clicked
                    button.bind('click', function() {

                        // remove the overlay and the dialog box from the DOM
                        // also pass the button's label as argument
                        plugin.close(value);

                    });

                    // append the button to the button bar
                    button.appendTo(button_bar);

                });

                // since buttons are floated,
                // we need to clear floats
                jQuery('<div style="clear:both">').appendTo(button_bar);

            }

            // insert the dialog box in the DOM
            plugin.dialog.appendTo('body');
            // if the browser window is resized
            $(window).bind('resize', draw);

            // if dialog box can be closed by pressing the ESC key
            if (plugin.settings.keyboard)

                // if a key is pressed
                $(document).bind('keyup', _keyup);

            // if browser is Internet Explorer 6 we attach an event to be fired whenever the window is scrolled
            // that is because in IE6 we have to simulate "position:fixed"
            if (plugin.isIE6)

                // if window is scrolled
                $(window).bind('scroll', _scroll);

            // if plugin is to be closed automatically after a given number of milliseconds
            if (plugin.settings.auto_close !== false)

                // call the "close" method after the given number of milliseconds
                setTimeout(plugin.close, plugin.settings.auto_close);

            // draw the overlay and the dialog box
            draw();

            // return a reference to the object itself
            return plugin;

        };

        /**
         *  Close the dialog box
         *
         *  @return void
         */
        plugin.close = function() {
        	//not close the dialog box if onclose event returns false
        	var booleanClose = true;
        	// if a callback function exists for when closing the dialog box
            if (plugin.settings.onClose && typeof plugin.settings.onClose == 'function')

                // execute the callback function
            	booleanClose = plugin.settings.onClose(undefined != arguments[0] ? arguments[0] : '');
            
            if(booleanClose == false) {
            	return;
            }
            // remove all the event listeners
            if (plugin.settings.keyboard) $(document).unbind('keyup', _keyup);

            if (plugin.isIE6) $(window).unbind('scroll', _scroll);

            $(window).unbind('resize', draw);

            // if an overlay exists
            if (plugin.overlay)

                // animate overlay's css properties
                plugin.overlay.animate({

                    opacity: 0  // fade out the overlay

                },

                // animation speed
                plugin.settings.animation_speed,

                // when the animation is complete
                function() {

                    // remove the overlay from the DOM
                    plugin.overlay.remove();

                });

            // animate dialog box's css properties
            plugin.dialog.animate({

                top: 0,     // move the dialog box to the top
                opacity: 0  // fade out the dialog box

            },

            // animation speed
            plugin.settings.animation_speed,

            // when the animation is complete
            function() {

                // remove the dialog box from the DOM
                plugin.dialog.remove();

            });

            

        };

        /**
         *  Draw the overlay and the dialog box
         *
         *  @return void
         *
         *  @access private
         */
        var draw = function() {

            var

                // get the viewport width and height
                viewport_width = $(window).width(),
                viewport_height = $(window).height(),

                // get dialog box's width and height
                dialog_width = plugin.dialog.width(),
                dialog_height = plugin.dialog.height(),

                // the numeric representations for some constants that may exist in the "position" property
                values = {

                    'left':     0,
                    'top':      0,
                    'right':    viewport_width - dialog_width,
                    'bottom':   viewport_height - dialog_height,
                    'center':   (viewport_width - dialog_width) / 2,
                    'middle':   (viewport_height - dialog_height) / 2

                };

            // reset these values
            plugin.dialog_left = undefined;
            plugin.dialog_top = undefined;

            // if there is an overlay
            // (the dialog box is modal)
            if (plugin.settings.modal)

                // stretch the overlay to cover the entire viewport
                plugin.overlay.css({

                    'width':    viewport_width,
                    'height':   viewport_height

                });

            // if
            if (

                // the position is given as an array
                $.isArray(plugin.settings.position) &&

                // the array has exactly two elements
                plugin.settings.position.length == 2 &&

                // first element is a string
                typeof plugin.settings.position[0] == 'string' &&

                // first element contains only "left", "right", "center", numbers, spaces, plus and minus signs
                plugin.settings.position[0].match(/^(left|right|center)[\s0-9\+\-]*$/) &&

                // second element is a string
                typeof plugin.settings.position[1] == 'string' &&

                // second element contains only "top", "bottom", "middle", numbers, spaces, plus and minus signs
                plugin.settings.position[1].match(/^(top|bottom|middle)[\s0-9\+\-]*$/)

            ) {
                // make sure both entries are lowercase
                plugin.settings.position[0] = plugin.settings.position[0].toLowerCase();
                plugin.settings.position[1] = plugin.settings.position[1].toLowerCase();

                // iterate through the array of replacements
                $.each(values, function(index, value) {

                    // we need to check both the horizontal and vertical values
                    for (var i = 0; i < 2; i++) {

                        // replace if there is anything to be replaced
                        var tmp = plugin.settings.position[i].replace(index, value);

                        // if anything could be replaced
                        if (tmp != plugin.settings.position[i])

                            // evaluate string as a mathematical expression and set the appropriate value
                            if (i == 0) plugin.dialog_left = eval(tmp); else plugin.dialog_top = eval(tmp);

                    }

                });

            }  else if( typeof plugin.settings.position == 'string' 
            	&&  plugin.settings.position.match(/^(above|below|auto)[\s0-9\+\-]*$/)
            		&& plugin.settings.targetEle ) {
            	var position_name = plugin.settings.position.replace(/[\+\-]\s*\d+$/,"");
            	var position_digit = plugin.settings.position.replace(/^(above|below|auto)/,"");
            	var posotion=getPosition(plugin.settings.targetEle);
            	plugin.dialog_left =posotion.left-$(window).scrollLeft();	
            	plugin.dialog_top =posotion.top-$(window).scrollTop();
            	if(!/^[\+\-]?\d+/.test(position_digit)){
            	    position_digit=2;
            	};
            	if((plugin.dialog_left+dialog_width+20)>$(window).width()){
            	    plugin.dialog_left=plugin.dialog_left-dialog_width;
            	}
            	if(position_name=="above"){
            		plugin.dialog_top =plugin.dialog_top-dialog_height-Math.abs(position_digit);
            	}else if(position_name=="below"){
            	    plugin.dialog_top =plugin.dialog_top+dialog_height/2+Math.abs(position_digit);
            	} else {
            	    if(plugin.dialog_top>$(window).height()/2) {
            	        plugin.dialog_top =plugin.dialog_top-dialog_height-Math.abs(position_digit);
            	    } else {
            	        plugin.dialog_top =plugin.dialog_top+dialog_height/2+Math.abs(position_digit);
            	    }
            	}
 
            }

            // if "dialog_left" and/or "dialog_top" values are still not set
            if (undefined == plugin.dialog_left || undefined == plugin.dialog_top) {

                // the dialog box will be in its default position, centered
                plugin.dialog_left = values['center'];
                plugin.dialog_top = values['middle'];

            }

            // if short messages are to be centered vertically
            if (plugin.settings.vcenter_short_message) {

                var

                    // the secondary container - the one that containes the message
                    message = plugin.message.find('div:first'),

                    // the height of the secondary container
                    message_height = message.height(),

                    // the main container's height
                    container_height = plugin.message.height();

                // if we need to center the message vertically
                if (message_height < container_height)

                    // center the message vertically
                    message.css({

                        'margin-top':   (container_height - message_height) / 2

                    });

            }

            // position the dialog box and make it visible
            plugin.dialog.css({

                'left':         plugin.dialog_left,
                'top':          plugin.dialog_top
                //'visibility':   'visible'

            });
            // open the dialog speed
            if(plugin.settings.open_speed) {
            	plugin.dialog.fadeIn(plugin.settings.open_speed == true ? "slow" : plugin.settings.open_speed);
            }else {
            	plugin.dialog.show();
            }
            // move the focus to the first of the dialog box's buttons
            plugin.dialog.find('a[class^=ZebraDialog_Button]:first').focus();

            // if the browser is Internet Explorer 6, call the "emulate_fixed_position" method
            // (if we do not apply a short delay, it sometimes does not work as expected)
            if (plugin.isIE6) setTimeout(emulate_fixed_position, 500);
            if(plugin.settings.isDrag) {
            	$(".ZebraDialog").draggable({handle: "h3.ZebraDialog_Title", opacity: 0.65});
				$(".ZebraDialog_Title").css({"cursor":"move"});
            }
        };

        /**
         *  Emulates "position:fixed" for Internet Explorer 6.
         *
         *  @return void
         *
         *  @access private
         */
        var emulate_fixed_position = function() {

            var

                // get how much the window is scrolled both horizontally and vertically
                scroll_top = $(window).scrollTop(),
                scroll_left = $(window).scrollLeft();

            // if an overlay exists
            if (plugin.settings.modal)

                // make sure the overlay is stays positioned at the top of the viewport
                plugin.overlay.css({

                    'top':  scroll_top,
                    'left': scroll_left

                });

            // make sure the dialog box always stays in the correct position
            plugin.dialog.css({

                'left': plugin.dialog_left + scroll_left,
                'top':  plugin.dialog_top + scroll_top

            });

        };

        /**
         *  Returns an array containing the buttons that are to be added to the dialog box.
         *
         *  If no custom buttons are specified, the returned array depends on the type of the dialog box.
         *
         *  @return array       Returns an array containing the buttons that are to be added to the dialog box.
         *
         *  @access private
         */
        var get_buttons = function() {

            // if plugin.settings.buttons is not TRUE and is not an array either, don't go further
            if (plugin.settings.buttons !== true && !$.isArray(plugin.settings.buttons)) return false;

            // if default buttons are to be used
            if (plugin.settings.buttons === true)

                // there are different buttons for different dialog box types
                switch (plugin.settings.type) {

                    // for "question" type
                    case 'question':

                        // there are two buttons
                        plugin.settings.buttons = ['Yes', 'No'];

                        break;

                    // for the other types
                    default:

                        // there is only one button
                        plugin.settings.buttons = ['Ok'];

                }

            // return the buttons in reversed order
            // (buttons need to be added in reverse order because they are floated to the right)
            return plugin.settings.buttons.reverse();

        };

        /**
         *  Returns the type of the dialog box, or FALSE if type is not one of the five known types.
         *
         *  Values that may be returned by this method are:
         *  -   Confirmation
         *  -   Error
         *  -   Information
         *  -   Question
         *  -   Warning
         *
         *  @return boolean     Returns the type of the dialog box, or FALSE if type is not one of the five known types.
         *
         *  @access private
         */
        var get_type = function() {

            // see what is the type of the dialog box
            switch (plugin.settings.type) {

                // if one of the five supported types
                case 'confirmation':
                case 'error':
                case 'information':
                case 'question':
                case 'warning':

                    // return the dialog box's type, first letter capital
                    return plugin.settings.type.charAt(0).toUpperCase() + plugin.settings.type.slice(1).toLowerCase();

                    break;

                // if unknown type
                default:

                    // return FALSE
                    return false;

            }

        };

        /**
         *  Function to be called when the "onKeyUp" event occurs
         *
         *  Why as a sepparate function and not inline when binding the event? Because only this way we can "unbind" it
         *  when we close the dialog box
         *
         *  @return boolean     Returns TRUE
         *
         *  @access private
         */
        var _keyup = function(e) {

            // if pressed key is ESC
            // remove the overlay and the dialog box from the DOM
            if (e.which == 27) plugin.close();

            // let the event bubble up
            return true;

        };

        /**
         *  Function to be called when the "onScroll" event occurs in Internet Explorer 6.
         *
         *  Why as a sepparate function and not inline when binding the event? Because only this way we can "unbind" it
         *  when we close the dialog box
         *
         *  @return void
         *
         *  @access private
         */
        var _scroll = function() {

            // make sure the overlay and the dialog box always stay in the correct position
            emulate_fixed_position();

        };

        // fire up the plugin!
        // call the "constructor" method
        return plugin.init();

    };
    
    var getPosition=function (e){
        var left = 0;
        var top  = 0;
        /** Safari fix -- thanks to Luis Chato for this! */
        if (e.offsetHeight == 0) {
            e = e.firstChild; // a table cell
        }

        while (e.offsetParent){
            left += e.offsetLeft;
            top  += e.offsetTop;
            e     = e.offsetParent;
        }

        left += e.offsetLeft;
        top  += e.offsetTop;

        return {"left":left, "top":top};
    };

})(jQuery);
/**
 * @author tang zheng yu
 */
(function($) {
	var default_options = {
			effect : "show",//显示动画事件
			effectspeed:0,//显示时间,ajax 同步 提交,必须为0才行
			opacity:0.5,
			content : ""//提示内容
	};
   var create= function (options) {
	   var opt=null;
	   if(typeof options=="string"){
		   opt=default_options;
		   opt.content=options;
	   } else {
		   opt=$.extend({},default_options, options);
	   }
	   //判断是否已经存在,若存在则只替换文字
	   var ecOverLay$=$("div.ec-ui-widget-overlay");
	   var infoOverlay$=$("div.ec-dialog-info-overlay");
	   if(ecOverLay$.length>0 && infoOverlay$.length>0){		  
		   infoOverlay$.hide(function(){
			   $(this).html(opt.content).fadeIn(200);
		   });
	   }
	   if(ecOverLay$.length>0 && infoOverlay$.length>0){
		   return;
	   }
        $(window).on("resize", resize);
        var viewport_width=width(), viewport_height=height();
        var c = $("<div></div>").addClass("ec-ui-widget-overlay").appendTo(document.body).css({
            width: viewport_width,
            height: viewport_height,
            opacity:opt.opacity
        });
        var d = $("<div></div>").addClass("ec-dialog-overlay");
       
        var info = $("<div></div>").addClass("ec-dialog-info-overlay").append(opt.content);
        var icon = $("<div></div>").addClass("ec-dialog-icon-overlay").append(info);
        d.append(icon).appendTo(document.body).css({
        	"left": (viewport_width-d.width())/2,
            "top": (viewport_height-d.height())/2-50>0?(viewport_height-d.height())/2-50:(viewport_height-d.height())/2
        });
        c[opt.effect](opt.effectspeed);
        d[opt.effect](opt.effectspeed);
        return c;
    };
   var  destroy= function () {
        $([document, window]).off("resize");
        $(".ec-dialog-overlay").remove();
        $(".ec-ui-widget-overlay").remove();
    };
   var  resize= function () {
	   var viewport_width=width(), viewport_height=height();
        var c = $(".ec-ui-widget-overlay");
        c.css({
        	  width: viewport_width,
              height: viewport_height
        });
        var d = $(".ec-dialog-overlay");
        d.css({
        	"left": (viewport_width-d.width())/2,
            "top": (viewport_height-d.height())/2-50>0?(viewport_height-d.height())/2-50:(viewport_height-d.height())/2
        });
    };

   var height= function () {
        var d, c;
        if ($.browser.msie && $.browser.version < 7) {
            d = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
            c = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
            if (d < c) {
                return $(window).height() ;
            } else {
                return d;
            }
        } else {
            return $(window).height();
        }
    };
   var  width= function () {
        var c, d;
        if ($.browser.msie && $.browser.version < 7) {
            c = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
            d = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
            if (c < d) {
                return $(window).width() ;
            } else {
                return c;
            }
        } else {
            return $(window).width();
        }
    };
    $.extend($, {
    	ecOverlay:function(options){
    			create(options);	
    	},
      	unecOverlay:function(){
      			destroy();
    	}
    });
})(jQuery, this);
/**
 * @jQuery插件：Jevent
 * @author:zhanzhihu
 * @date:  2008-14-40
 * jQuery插件：自定义jQuery事件机制
 * 事件的机制：分为捕获阶段、目标阶段、冒泡阶段

 * 捕获阶段：事件定义时设置，默认为关闭，由根结点出发，至目标对象，处理事件
 * 冒泡阶段：事件定义时设置，默认为打开，由目标触发，至根结点为止，处理事件
 */
if (typeof jQueryJEvent == "undefined") { var jQueryJEvent = new Object();}


/**
 * 所有事件类的父类

 * @param {string} name    
 * @param {boolean} capture 
 * @param {boolean} bubble  
 * @param {Object} data   
 * @param {jQuery Object} target  
 */
jQueryJEvent.Event = 
function(name,capture,bubble,data,target){
	this.name    = name;
	this.capture = capture;
	this.bubble  = bubble;
	this.data    = data;
	this.target  = target;
};


jQueryJEvent.poolUnit = function(name,handleArray){
	this.name = name;
	if(handleArray instanceof Array){
		this.handleArray = handleArray;
	}else{
		this.handleArray = [handleArray];
	}
	
};
jQueryJEvent.handleUnit = function(jQueryObj,capture,bubble,func){
	this.jQueryObj = jQueryObj;
	this.capture   = capture;
	this.bubble    = bubble;
	this.func      = func;
};
jQueryJEvent.jEventController = function(){
	if(jQueryJEvent.jEventController.caller != jQueryJEvent.getJEventControllerInstance){
		throw new Error("非法调用jEventController的构造函数");return;
	}
	this.eventPool = [];
};
jQueryJEvent.jEventController.prototype = {
	handleJEvent: function(jEvent){	
		var parentArray1 = null;
		for(var i=0;i<this.eventPool.length;i+=1){
			if(this.eventPool[i].name == jEvent.name){
				if (jEvent.capture) {
						var handleArray1 = this.getJEventListener(jEvent,jEvent.name);
						for(var j=0;j<handleArray1.length;j+=1){
							handleArray1[j].func.call(handleArray1[j].jQueryObj,jEvent.data,"capture");
						}
				}
			}
		}			
	},
	addjEventListener:function(jQueryObj,name,capture,bubble,func){
		for(var i=0;i<this.eventPool.length;i+=1){
			if(this.eventPool[i].name == name){
				this.eventPool[i].handleArray.push(new jQueryJEvent.handleUnit(jQueryObj,capture,bubble,func));
				return;							
			}
		}
		this.eventPool.push(new jQueryJEvent.poolUnit(name,new jQueryJEvent.handleUnit(jQueryObj,capture,bubble,func)));
	},
	removeEventListener:function(jQueryObj,name,func){
		for(var i=0;i<this.eventPool.length;i+=1){
			if(this.eventPool[i].name == name){
				for(var j=0;j<this.eventPool[i].handleArray.length;j+=1){
					if(this.eventPool[i].handleArray[j].jQueryObj[0] == jQueryObj[0] && this.eventPool[i].handleArray[j].func == func){
						this.eventPool[i].handleArray.splice(j,1);
						return;
					}
				}
			}
		}		
	},
	removeEventListenerByName:function(names){
		for(var i = 0;i<names.length;i++){
			for(var j=0;j<this.eventPool.length;j+=1){
				if(this.eventPool[j].name == names[i]){
					this.eventPool.splice(j,1);
				}
			}
		}
	},
	hasJEventListener:function(jQueryObj,name){
		for(var i=0;i<this.eventPool.length;i+=1){
			if(this.eventPool[i].name == name){
				for(var j=0;j<this.eventPool[i].handleArray.length;j+=1){
					if(this.eventPool[i].handleArray[j].jQueryObj[0] == jQueryObj[0]){
						return true;
					}
				}
			}
		}
		return false;
	},
	getJEventListener:function(jQueryObj,name){
		var handleArrayRet = [];
		for(var i=0;i<this.eventPool.length;i+=1){
			if(this.eventPool[i].name == name){	
				for(var j=0;j<this.eventPool[i].handleArray.length;j+=1){
					handleArrayRet.push(this.eventPool[i].handleArray[j]);
				}
			}
		}
		return handleArrayRet;
	}
};
jQueryJEvent.singleJEventController = null;
jQueryJEvent.getJEventControllerInstance = function(){
	if(jQueryJEvent.singleJEventController == null){
		jQueryJEvent.singleJEventController = new jQueryJEvent.jEventController();
	}
	return jQueryJEvent.singleJEventController;
};

$.fn.extend({
	dispatchJEvent: function(name/*string*/,data,capture,bubble){		
		capture = capture || true;//发出事件时默认开启捕获

		bubble  = bubble  || true;//发出事件时默认开启冒泡

		var controller = jQueryJEvent.getJEventControllerInstance();
		var jEvent = jQuery.createJEvent(name,capture,bubble,data,this);
		controller.handleJEvent(jEvent);
	},
	addJEventListener:function(name,func,capture,bubble){		
		capture = capture || false;//添加监听时默认不开启捕获

		bubble  = bubble  || true; //添加监听时默认开启冒泡

		var controller = jQueryJEvent.getJEventControllerInstance();
		controller.addjEventListener(this,name,capture,bubble,func);	
	},
	removeJEventListener:function(name,func){
		var controller = jQueryJEvent.getJEventControllerInstance();
		controller.removeEventListener(this,name,func);
	},
	removeJEventListenerByName:function(names){
		var controller = jQueryJEvent.getJEventControllerInstance();
		controller.removeEventListenerByName(names);
	},
	hasJEventListener:function(name){
		var controller = jQueryJEvent.getJEventControllerInstance();	
		return	controller.hasJEventListener(this,name);
	},
	getJEventListener:function(name){
		var controller = jQueryJEvent.getJEventControllerInstance();	
		return controller.getJEventListener(this,name);
	}
});
$.extend({
	createJEvent:function(name,capture,bubble,data,target){
		return new jQueryJEvent.Event(name,capture,bubble,data,target);
	},
	getParentsArray:function(jQueryObj){
		var parentsArray = [];
		if(jQueryObj[0] == jQuery(document)[0]){return parentsArray;}
		var tempParent = null;		
		for(tempParent = jQueryObj.parent();tempParent[0]!=jQuery(document)[0];tempParent=tempParent.parent()){			
			parentsArray.push(tempParent);
		}
		parentsArray.push(jQuery(document));
		return parentsArray;
	},
	checkInArray:function(ele,array,isJQuery){
		isJQuery = isJQuery || true;
		for(var i=0;i<array.length;i+=1){
			if(isJQuery){
				if(array[i][0] == ele[0]){
					return true;
				}
			}else{
				if(array[i] == ele){
					return true;
				}
			}
		}
		return false;
	}
});

/**
 * 初始化清空eventPool
 * @author 林志鹏
 */
jQueryJEvent.jEventController.prototype.eventPoolInit=function(){
		this.eventPool = [];
};

jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
/*
 * SimpleModal 1.4.4 - jQuery Plugin
 * http://simplemodal.com/
 * Copyright (c) 2013 Eric Martin
 * Licensed under MIT and GPL
 * Date: Sun, Jan 20 2013 15:58:56 -0800
 */
(function(b){"function"===typeof define&&define.amd?define(["jquery"],b):b(jQuery)})(function(b){var j=[],n=b(document),k=navigator.userAgent.toLowerCase(),l=b(window),g=[],o=null,p=/msie/.test(k)&&!/opera/.test(k),q=/opera/.test(k),m,r;m=p&&/msie 6./.test(k)&&"object"!==typeof window.XMLHttpRequest;r=p&&/msie 7.0/.test(k);b.modal=function(a,h){return b.modal.impl.init(a,h)};b.modal.close=function(){b.modal.impl.close()};b.modal.focus=function(a){b.modal.impl.focus(a)};b.modal.setContainerDimensions=
function(){b.modal.impl.setContainerDimensions()};b.modal.setPosition=function(){b.modal.impl.setPosition()};b.modal.update=function(a,h){b.modal.impl.update(a,h)};b.fn.modal=function(a){return b.modal.impl.init(this,a)};b.modal.defaults={appendTo:"body",focus:!0,opacity:50,overlayId:"simplemodal-overlay",overlayCss:{},containerId:"simplemodal-container",containerCss:{},dataId:"simplemodal-data",dataCss:{},minHeight:null,minWidth:null,maxHeight:null,maxWidth:null,autoResize:!1,autoPosition:!0,zIndex:1E3,
close:!0,closeHTML:'<a class="modalCloseImg" title="Close"></a>',closeClass:"simplemodal-close",escClose:!0,overlayClose:!1,fixed:!0,position:null,persist:!1,modal:!0,onOpen:null,onShow:null,onClose:null};b.modal.impl={d:{},init:function(a,h){if(this.d.data)return!1;o=p&&!b.support.boxModel;this.o=b.extend({},b.modal.defaults,h);this.zIndex=this.o.zIndex;this.occb=!1;if("object"===typeof a){if(a=a instanceof b?a:b(a),this.d.placeholder=!1,0<a.parent().parent().size()&&(a.before(b("<span></span>").attr("id",
"simplemodal-placeholder").css({display:"none"})),this.d.placeholder=!0,this.display=a.css("display"),!this.o.persist))this.d.orig=a.clone(!0)}else if("string"===typeof a||"number"===typeof a)a=b("<div></div>").html(a);else return alert("SimpleModal Error: Unsupported data type: "+typeof a),this;this.create(a);this.open();b.isFunction(this.o.onShow)&&this.o.onShow.apply(this,[this.d]);return this},create:function(a){this.getDimensions();if(this.o.modal&&m)this.d.iframe=b('<iframe src="javascript:false;"></iframe>').css(b.extend(this.o.iframeCss,
{display:"none",opacity:0,position:"fixed",height:g[0],width:g[1],zIndex:this.o.zIndex,top:0,left:0})).appendTo(this.o.appendTo);this.d.overlay=b("<div></div>").attr("id",this.o.overlayId).addClass("simplemodal-overlay").css(b.extend(this.o.overlayCss,{display:"none",opacity:this.o.opacity/100,height:this.o.modal?j[0]:0,width:this.o.modal?j[1]:0,position:"fixed",left:0,top:0,zIndex:this.o.zIndex+1})).appendTo(this.o.appendTo);this.d.container=b("<div></div>").attr("id",this.o.containerId).addClass("simplemodal-container").css(b.extend({position:this.o.fixed?
"fixed":"absolute"},this.o.containerCss,{display:"none",zIndex:this.o.zIndex+2})).append(this.o.close&&this.o.closeHTML?b(this.o.closeHTML).addClass(this.o.closeClass):"").appendTo(this.o.appendTo);this.d.wrap=b("<div></div>").attr("tabIndex",-1).addClass("simplemodal-wrap").css({height:"100%",outline:0,width:"100%"}).appendTo(this.d.container);this.d.data=a.attr("id",a.attr("id")||this.o.dataId).addClass("simplemodal-data").css(b.extend(this.o.dataCss,{display:"none"})).appendTo("body");this.setContainerDimensions();
this.d.data.appendTo(this.d.wrap);(m||o)&&this.fixIE()},bindEvents:function(){var a=this;b("."+a.o.closeClass).bind("click.simplemodal",function(b){b.preventDefault();a.close()});a.o.modal&&a.o.close&&a.o.overlayClose&&a.d.overlay.bind("click.simplemodal",function(b){b.preventDefault();a.close()});n.bind("keydown.simplemodal",function(b){a.o.modal&&9===b.keyCode?a.watchTab(b):a.o.close&&a.o.escClose&&27===b.keyCode&&(b.preventDefault(),a.close())});l.bind("resize.simplemodal orientationchange.simplemodal",
function(){a.getDimensions();a.o.autoResize?a.setContainerDimensions():a.o.autoPosition&&a.setPosition();m||o?a.fixIE():a.o.modal&&(a.d.iframe&&a.d.iframe.css({height:g[0],width:g[1]}),a.d.overlay.css({height:j[0],width:j[1]}))})},unbindEvents:function(){b("."+this.o.closeClass).unbind("click.simplemodal");n.unbind("keydown.simplemodal");l.unbind(".simplemodal");this.d.overlay.unbind("click.simplemodal")},fixIE:function(){var a=this.o.position;b.each([this.d.iframe||null,!this.o.modal?null:this.d.overlay,
"fixed"===this.d.container.css("position")?this.d.container:null],function(b,e){if(e){var f=e[0].style;f.position="absolute";if(2>b){ try{f.removeExpression("height"),f.removeExpression("width"),f.setExpression("height",'document.body.scrollHeight > document.body.clientHeight ? document.body.scrollHeight : document.body.clientHeight + "px"'),f.setExpression("width",'document.body.scrollWidth > document.body.clientWidth ? document.body.scrollWidth : document.body.clientWidth + "px"');}catch(e){}}else{var c,d;a&&a.constructor===
Array?(c=a[0]?"number"===typeof a[0]?a[0].toString():a[0].replace(/px/,""):e.css("top").replace(/px/,""),c=-1===c.indexOf("%")?c+' + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"':parseInt(c.replace(/%/,""))+' * ((document.documentElement.clientHeight || document.body.clientHeight) / 100) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"',a[1]&&(d="number"===typeof a[1]?
a[1].toString():a[1].replace(/px/,""),d=-1===d.indexOf("%")?d+' + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"':parseInt(d.replace(/%/,""))+' * ((document.documentElement.clientWidth || document.body.clientWidth) / 100) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"')):(c='(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"',
d='(document.documentElement.clientWidth || document.body.clientWidth) / 2 - (this.offsetWidth / 2) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"');    try{f.removeExpression("top");f.removeExpression("left");f.setExpression("top",c);f.setExpression("left",d);}catch(e){}}}})},focus:function(a){var h=this,a=a&&-1!==b.inArray(a,["first","last"])?a:"first",e=b(":input:enabled:visible:"+a,h.d.wrap);setTimeout(function(){0<e.length?e.focus():h.d.wrap.focus()},
10)},getDimensions:function(){var a="undefined"===typeof window.innerHeight?l.height():window.innerHeight;j=[n.height(),n.width()];g=[a,l.width()]},getVal:function(a,b){return a?"number"===typeof a?a:"auto"===a?0:0<a.indexOf("%")?parseInt(a.replace(/%/,""))/100*("h"===b?g[0]:g[1]):parseInt(a.replace(/px/,"")):null},update:function(a,b){if(!this.d.data)return!1;this.d.origHeight=this.getVal(a,"h");this.d.origWidth=this.getVal(b,"w");this.d.data.hide();a&&this.d.container.css("height",a);b&&this.d.container.css("width",
b);this.setContainerDimensions();this.d.data.show();this.o.focus&&this.focus();this.unbindEvents();this.bindEvents()},setContainerDimensions:function(){var a=m||r,b=this.d.origHeight?this.d.origHeight:q?this.d.container.height():this.getVal(a?this.d.container[0].currentStyle.height:this.d.container.css("height"),"h"),a=this.d.origWidth?this.d.origWidth:q?this.d.container.width():this.getVal(a?this.d.container[0].currentStyle.width:this.d.container.css("width"),"w"),e=this.d.data.outerHeight(!0),f=
this.d.data.outerWidth(!0);this.d.origHeight=this.d.origHeight||b;this.d.origWidth=this.d.origWidth||a;var c=this.o.maxHeight?this.getVal(this.o.maxHeight,"h"):null,d=this.o.maxWidth?this.getVal(this.o.maxWidth,"w"):null,c=c&&c<g[0]?c:g[0],d=d&&d<g[1]?d:g[1],i=this.o.minHeight?this.getVal(this.o.minHeight,"h"):"auto",b=b?this.o.autoResize&&b>c?c:b<i?i:b:e?e>c?c:this.o.minHeight&&"auto"!==i&&e<i?i:e:i,c=this.o.minWidth?this.getVal(this.o.minWidth,"w"):"auto",a=a?this.o.autoResize&&a>d?d:a<c?c:a:f?
f>d?d:this.o.minWidth&&"auto"!==c&&f<c?c:f:c;this.d.container.css({height:b,width:a});this.d.wrap.css({overflow:e>b||f>a?"auto":"visible"});this.o.autoPosition&&this.setPosition()},setPosition:function(){var a,b;a=g[0]/2-this.d.container.outerHeight(!0)/2;b=g[1]/2-this.d.container.outerWidth(!0)/2;var e="fixed"!==this.d.container.css("position")?l.scrollTop():0;this.o.position&&"[object Array]"===Object.prototype.toString.call(this.o.position)?(a=e+(this.o.position[0]||a),b=this.o.position[1]||b):
a=e+a;this.d.container.css({left:b,top:a})},watchTab:function(a){if(0<b(a.target).parents(".simplemodal-container").length){if(this.inputs=b(":input:enabled:visible:first, :input:enabled:visible:last",this.d.data[0]),!a.shiftKey&&a.target===this.inputs[this.inputs.length-1]||a.shiftKey&&a.target===this.inputs[0]||0===this.inputs.length)a.preventDefault(),this.focus(a.shiftKey?"last":"first")}else a.preventDefault(),this.focus()},open:function(){this.d.iframe&&this.d.iframe.show();b.isFunction(this.o.onOpen)?
this.o.onOpen.apply(this,[this.d]):(this.d.overlay.show(),this.d.container.show(),this.d.data.show());this.o.focus&&this.focus();this.bindEvents()},close:function(){if(!this.d.data)return!1;this.unbindEvents();if(b.isFunction(this.o.onClose)&&!this.occb)this.occb=!0,this.o.onClose.apply(this,[this.d]);else{if(this.d.placeholder){var a=b("#simplemodal-placeholder");this.o.persist?a.replaceWith(this.d.data.removeClass("simplemodal-data").css("display",this.display)):(this.d.data.hide().remove(),a.replaceWith(this.d.orig))}else this.d.data.hide().remove();
this.d.container.hide().remove();this.d.overlay.hide();this.d.iframe&&this.d.iframe.hide().remove();this.d.overlay.remove();this.d={}}}}});

﻿/*!
 * lhgcore Calendar Plugin v3.0.0
 * Date : 2012-03-13 10:35:11
 * Copyright (c) 2009 - 2012 By Li Hui Gang
 */

;(function( $, window, undefined ){

var document = window.document, _box,
    addzero = /\b(\w)\b/g,
    _ie = !!window.ActiveXObject,
	_ie6 = _ie && !window.XMLHttpRequest,
	_$window = $(window),
	expando = 'JCA' + (new Date).getTime(),
	
_path = (function( script, i ){
    var l = script.length, path;
	
	for( ; i < l; i++ )
	{
		path = !!document.querySelector ?
		    script[i].src : script[i].getAttribute('src',4);
		
		if( path.substr(path.lastIndexOf('/')).indexOf('lhgcalendar') !== -1 )
		    break;
	}
	
	return path.substr( 0, path.lastIndexOf('/') + 1 );
})(document.getElementsByTagName('script'),0),

iframeTpl = _ie6 ? '<iframe id="lhgcal_frm" hideFocus="true" ' + 
	'frameborder="0" src="about:blank" style="position:absolute;' +
	'z-index:-1;width:100%;top:0px;left:0px;filter:' +
	'progid:DXImageTransform.Microsoft.Alpha(opacity=0)"><\/iframe>' : '',

calendarTpl =
'<table class="lcui_border" border="0" cellspacing="0" cellpadding="0">' +
'<tbody>' +
'<tr>' +
	'<td class="lcui_lt"></td>' +
	'<td class="lcui_t"></td>' +
	'<td class="lcui_rt"></td>' +
'</tr>' +
'<tr>' +
	'<td class="lcui_l"></td>' +
	'<td>' +
	    '<div class="lcui_head">' +
			'<table width="100%" cellspacing="0" cellpadding="0" border="0">' +
			'<tr>' +
			    '<td width="14"><a class="cui_pm" href="javascript:void(0);"></a></td>' +
				'<td width="40"><input class="cui_im" maxlength="4" value=""/>月</td>' +
				'<td><a class="cui_nm" href="javascript:void(0);"></a></td>' +
				'<td width="14"><a class="cui_py" href="javascript:void(0);"></a></td>' +
				'<td width="60"><input class="cui_iy" maxlength="4" value=""/>年</td>' +
				'<td width="9"><a class="cui_ny" href="javascript:void(0);"></a></td>' +
			'</tr>' +
			'</table>' +
			'<div class="cui_ymlist" style="display:none;">' +
			    '<table width="100%" cellspacing="1" cellpadding="0" border="0">' +
				    '<thead class="cui_ybar"><tr>' +
					    '<td><a class="cui_pybar" href="javascript:void(0);">«</a></td>' +
						'<td><a class="cui_cybar" href="javascript:void(0);">\xd7</a></td>' +
						'<td><a class="cui_nybar" href="javascript:void(0);">»</a></td>' +
					'</tr></thead>' +
					'<tbody class="cui_lbox">' +
					
					'</tbody>' +
				'</table>' +
			'</div>' +
		'</div>' +
		'<div class="lcui_body">' +
		    '<table cellspacing="1" cellpadding="0" border="0">' +
			    '<thead><tr>' +
				    '<td>\u65E5</td><td>\u4E00</td><td>\u4E8C</td><td>\u4E09</td><td>\u56DB</td><td>\u4E94</td><td>\u516D</td>' +
				'</tr></thead>' +
				'<tbody class="cui_db">' +
				'</tbody>' +
			'</table>' +
		'</div>' +
		'<div class="cui_foot">' +
		    '<table width="100%" cellspacing="0" cellpadding="0" border="0">' +
			'<tr>' +
			    '<td align="center" class="lcui_today"><a class="cui_tbtn" href="javascript:void(0);">\u4ECA\u5929</a></td>' +
				'<td align="center" class="lcui_time"><input class="cui_hour" maxlength="2"/>:<input class="cui_minute" maxlength="2"/>:<input class="cui_second" maxlength="2"/></td>' +
				'<td align="center" class="lcui_empty"><a class="cui_dbtn" href="javascript:void(0);">\u6E05\u7A7A</a></td>' +
			'</tr>' +
			'</table>' +
		'</div>' +
	'</td>' +
	'<td class="lcui_r"></td>' +
'</tr>' +
'<tr>' +
	'<td class="lcui_lb"></td>' +
	'<td class="lcui_b"></td>' +
	'<td class="lcui_rb"></td>' +
'</tr>' +
'</tbody>' +
'</table>' + iframeTpl;

/*! 开启IE6 CSS背景图片缓存 */
try{
	document.execCommand( 'BackgroundImageCache', false, true );
}catch(e){};

//(function(head){
//    var link = document.createElement('link');
//	
//	link.href = _path + 'skins/lhgcalendar.css';
//    link.rel = 'stylesheet';
//	
//	head.appendChild( link );
//})(document.getElementsByTagName('head')[0]);

function isDigit(ev)
{
    var iCode = ( ev.keyCode || ev.charCode );

	return (
			( iCode >= 48 && iCode <= 57 )		// Numbers
			|| (iCode >= 37 && iCode <= 40)		// Arrows
			|| iCode == 8						// Backspace
			|| iCode == 46						// Delete
	);
};

function dateFormat( format )
{
	var that = this,
	
	o = {
	    'M+': that.getMonth() + 1,
		'd+': that.getDate(),
		'h+': that.getHours()%12 == 0 ? 12 : that.getHours()%12,
		'H+': that.getHours(),
		'm+': that.getMinutes(),
		's+': that.getSeconds(),
		'q+': Math.floor((that.getMonth() + 3) / 3),
		'w': '0123456'.indexOf(that.getDay()),
		'S': that.getMilliseconds()
	};
	
	if( /(y+)/.test(format) )
	    format = format.replace(RegExp.$1, (that.getFullYear() + '').substr(4 - RegExp.$1.length));
	
	for( var k in o )
	{
	    if( new RegExp('(' + k + ')').test(format) )
		    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
	}
	
	return format;
};

function getDate( string, format )
{
    var regexp, tmpnow = new Date();
	
	/** year : /yyyy/ */
	y4 = '([0-9]{4})',
	/** year : /yy/ */
	y2 = '([0-9]{2})',
	/** index year */
	yi = -1,
	
	/** month : /MM/ */
	M2 = '(0[1-9]|1[0-2])',
	/** month : /M/ */
	M1 = '([1-9]|1[0-2])',
	/** index month */
	Mi = -1,
	
	/** day : /dd/ */
	d2 = '(0[1-9]|[1-2][0-9]|30|31)',
	/** day : /d/ */
	d1 = '([1-9]|[1-2][0-9]|30|31)',
	/** index day */
	di = -1,
	
	/** hour : /HH/ */
	H2 = '([0-1][0-9]|20|21|22|23)',
	/** hour : /H/ */
	H1 = '([0-9]|1[0-9]|20|21|22|23)',
	/** index hour */
	Hi = -1,
	
	/** minute : /mm/ */
	m2 = '([0-5][0-9])',
	/** minute : /m/ */
	m1 = '([0-9]|[1-5][0-9])',
	/** index minute */
	mi = -1,
	
	/** second : /ss/ */
	s2 = '([0-5][0-9])',
	/** second : /s/ */
	s1 = '([0-9]|[1-5][0-9])',
	/** index month */
	si = -1;
	
	if( validDate(string,format) )
	{
		var val = regexp.exec( string ), reDate,
			index = getIndex( format ),
			year = index[0] >= 0 ? val[ index[0] + 1 ] : tmpnow.getFullYear(),
			month = index[1] >= 0 ? ( val[index[1]+1] - 1 ) : tmpnow.getMonth(),
			day = index[2] >= 0 ? val[ index[2] + 1 ] : tmpnow.getDate(),
			hour = index[3] >= 0 ? val[ index[3] + 1 ] : tmpnow.getHours(),
			minute = index[4] >= 0 ? val[ index[4] + 1 ] : tmpnow.getMinutes(),
			second = index[5] >= 0 ? val[ index[5] + 1 ] : tmpnow.getSeconds(),

		reDate = new Date( year, month, day, hour, minute, second );
		
		if( reDate.getDate() == day )
		    return reDate;
		else
		    return tmpnow;
	}
	else
	    return tmpnow;
	
	function validDate( string, format )
	{
		
		sting = $.trim( string );
		if( string === '' ) return;
		
		format = format.replace(/yyyy/,y4).replace(/yy/,y2).replace(/MM/,M2)
		         .replace(/M/,M1).replace(/dd/,d2).replace(/d/,d1).replace(/HH/,H2)
				 .replace(/H/,H1).replace(/mm/,m2).replace(/m/,m1).replace(/ss/,s2)
				 .replace(/s/,s1);
		
		format = new RegExp( '^' + format + '$' );
		regexp = format;
		
		return format.test( string );
	};
	
	function getIndex( format )
	{
	    var ia = [], i = 0, ia2;
		
		yi = format.indexOf('yyyy');
		if( yi < 0 ) yi = format.indexOf('yy');
		if( yi >= 0 )
		{
		    ia[i] = yi;
			i++;
		}
		
		Mi = format.indexOf('MM');
		if( Mi < 0 ) Mi = format.indexOf('M');
		if( Mi >= 0 )
		{
		    ia[i] = Mi;
			i++;
		}
		
		di = format.indexOf('dd');
		if( di < 0 ) di = format.indexOf('d');
		if( di >= 0 )
		{
		    ia[i] = di;
			i++;
		}
		
		Hi = format.indexOf('HH');
		if( Hi < 0 ) Hi = format.indexOf('H');
		if( Hi >= 0 )
		{
		    ia[i] = Hi;
			i++;
		}
		
		mi = format.indexOf('mm');
		if( mi < 0 ) mi = format.indexOf('m');
		if( mi >= 0 )
		{
		    ia[i] = mi;
			i++;
		}
		
		si = format.indexOf('ss');
		if( si < 0 ) si = format.indexOf('s');
		if( si >= 0 )
		{
		    ia[i] = si;
			i++;
		}
		
		ia2 = [ yi, Mi, di, Hi, mi, si ];
		
		for( i = 0; i < ia.length - 1; i++ )
		{
		    for( j = 0; j < ia.length - 1 - i; j++ )
			{
			    if( ia[j] > ia[j+1] )
				{
				    var temp = ia[j];
					ia[j] = ia[j+1];
					ia[j+1] = temp;
				}
			}
		}
		
		for( i = 0; i < ia.length; i++ )
		{
		    for( j = 0; j < ia2.length; j++ )
			{
			    if( ia[i] == ia2[j] )
				    ia2[j] = i;
			}
		}
		
		return ia2;
	};
};

function convertDate( date, format, day )
{
    var tmpnow = new Date();
	
	if( /%/.test(date) )
	{
		day = day || 0;
		date = date.replace( /%y/, tmpnow.getFullYear() ).replace( /%M/, tmpnow.getMonth() + 1 ).replace( /%d/, tmpnow.getDate() + day )
		    .replace( /%H/, tmpnow.getHours() ).replace( /%m/, tmpnow.getMinutes() ).replace( /%s/, tmpnow.getSeconds() ).replace( addzero, '0$1' );
	}
	else if( /^#[\w-]+$/.test(date) )
	{
	    date = $.trim( $(date)[0].value );

		if( date.length > 0 && format )
		    date = dateFormat.call( getDate(date,format), 'yyyy-MM-dd' );
	}
	
	return date;
};

/*!--------------------------------------------------------------*/

var lhgcalendar = function( config )
    {
	    config = config || {};
		
		var setting = lhgcalendar.setting;
		
		for( var i in setting )
		{
		    if( config[i] === undefined ) config[i] = setting[i];
		}
		
		return _box ? _box._init(config) : new lhgcalendar.fn._init(config);
	};

lhgcalendar.fn = lhgcalendar.prototype =
{
    constructor: lhgcalendar,
	
	_init: function( config )
	{
	    var that = this, DOM,
		    evt = that._getEvent(),
			inpVal, date;
		
		that.config = config;
		
		that.DOM = DOM = that.DOM || that._getDOM();
		that.evObj = evt.srcElement || evt.target;
		that.inpE = config.id ? $(config.id)[0] : that.evObj;
		
		if( !config.btnBar )
		    DOM.foot[0].style.display = 'none';
		else
		    DOM.foot[0].style.display = '';
		
		if( config.minDate )
		    config.minDate = convertDate( config.minDate, config.targetFormat, config.noToday ? 1 : 0 );  
		
		if( config.maxDate )
		    config.maxDate = convertDate( config.maxDate, config.targetFormat, config.noToday ? -1 : 0 );
		
		inpVal = $.trim( that.inpE.value );
		
		if( inpVal.length > 0 )
		    date = getDate( inpVal, config.format );
		else
		    date = new Date();
		
		DOM.hour[0].value = (date.getHours() + '').replace(addzero,'0$1');
		DOM.minute[0].value = (date.getMinutes() + '').replace(addzero,'0$1');
		DOM.second[0].value = (date.getSeconds() + '').replace(addzero,'0$1');
		
		$('input',DOM.foot[0]).attr({ disabled:config.format.indexOf('H')>=0?false:true });
		
		that._draw(date).show()._offset(that.evObj);
		
		_ie6 && $('#lhgcal_frm').css({height:DOM.wrap[0].offsetHeight+'px'});
		
		if( !_box )
		{
			DOM.wrap[0].style.width = DOM.wrap[0].offsetWidth + 'px';
			that._addEvent(); _box = that;
		}
		
		return that;
	},
	
	_draw: function( date, day )
	{
	    var that = this,
		    DOM = that.DOM,
			firstDay,
			befMonth,
			curMonth,
			arrDate = [],
			inpYear,
			inpMonth,
			opt = that.config,
			frag, row, cell, n = 0, curDateStr;
		
		that.year = inpYear = date.getFullYear();
		that.month = inpMonth = date.getMonth() + 1;
		that.day = day || date.getDate();
		
		DOM.iy[0].value = inpYear;
		DOM.im[0].value = inpMonth;
		
		firstDay = new Date( inpYear, inpMonth - 1, 1 ).getDay();
		befMonth = new Date( inpYear, inpMonth - 1, 0 ).getDate();
		curMonth = new Date( inpYear, inpMonth, 0 ).getDate();
		
		for( var i = 0; i < firstDay; i++ )
		{
		    arrDate.push( befMonth );
			befMonth--;
		}
		
		arrDate.reverse();
		
		for( var i = 1; i <= curMonth; i++ )
		    arrDate.push(i);
		
		for( var i = 1; i <= 42 - curMonth - firstDay; i++ )
		    arrDate.push(i);
		
		frag = document.createDocumentFragment();
		
		for( var i = 0; i < 6; i++ )
		{
		    row = document.createElement('tr');
			for( var j = 0; j < 7; j++ )
			{
			    cell = document.createElement('td');
				curDateStr = (inpYear + '-' + inpMonth + '-' + arrDate[n]).replace(addzero,'0$1');
				
				if( n < firstDay || n >= curMonth + firstDay ||
				    opt.minDate && opt.minDate > curDateStr ||
					opt.maxDate && opt.maxDate < curDateStr ||
					opt.disWeek && opt.disWeek.indexOf(j) >= 0 )
				{
				    that._setCell( cell, arrDate[n] );
				}
				else if( opt.disDate )
				{
				    for( var m = 0, l = opt.disDate.length; m < l; m++ )
					{
					    if( /%/.test(opt.disDate[m]) )
						    opt.disDate[m] = convertDate( opt.disDate[m] );
							
						var regex = new RegExp(opt.disDate[m]),
						    tmpre = opt.enDate ? !regex.test(curDateStr) : regex.test(curDateStr);
						
						if( tmpre ) break;
					}
						
					if( tmpre )
						that._setCell( cell, arrDate[n] );
					else
						that._setCell( cell, arrDate[n], true );
				}
				else
					that._setCell( cell, arrDate[n], true );
				
				row.appendChild( cell ); n++;
			}
			frag.appendChild( row );
		}
		
		while( DOM.db[0].firstChild )
		    DOM.db[0].removeChild( DOM.db[0].firstChild );
			
		DOM.db[0].appendChild(frag);
		
		return that;
	},
	
	_setCell: function( cell, num, enabled )
	{
		if( enabled )
		{
			cell.innerHTML = '<a href="javascript:void(0);">' + num + '</a>';
			cell.firstChild[expando+'D'] = num + '';
			
			if( num === this.day )
			    $(cell).addClass('cui_today');
		}
		else
			cell.innerHTML = num + '';
	},
	
	_drawList: function( val, arr )
	{
		var DOM = this.DOM, row, cell,
		    frag = document.createDocumentFragment();
			
		for( var i = 0; i < 4; i++ )
		{
		    row = document.createElement('tr');
			for( var j = 0; j < 3; j++ )
			{
				cell = document.createElement('td');
				cell.innerHTML = '<a href="javascript:void(0);">' + (arr?arr[val]:val) + '</a>';
				row.appendChild(cell);
				
				if( arr )
				    cell.firstChild[expando+'M'] = val;
				else
				    cell.firstChild[expando+'Y'] = val;
					
				val++;
			}
			frag.appendChild(row);
		}
		
		while( DOM.lbox[0].firstChild )
		    DOM.lbox[0].removeChild( DOM.lbox[0].firstChild );
		
		DOM.lbox[0].appendChild(frag);
	    
		return this;
	},
	
	_showList: function()
	{
	    this.DOM.ymlist[0].style.display = 'block';
	},
	
	_hideList: function()
	{
	    this.DOM.ymlist[0].style.display = 'none';
	},
	
	_offset: function()
	{
	    var that = this, DOM = that.DOM, ltop,
		    inpP = $(that.evObj).offset(),
		    inpY = inpP.top + that.evObj.offsetHeight,
			ww = _$window.width(),
			wh = _$window.height(),
			dl = _$window.scrollLeft(),
			dt = _$window.scrollTop(),
			cw = DOM.wrap[0].offsetWidth,
			ch = DOM.wrap[0].offsetHeight;
		
		if( inpY + ch > wh + dt )
			inpY = inpP.top - ch - 2;
			
		if( inpP.left + cw > ww + dl )
		    inpP.left -= cw;
		
		DOM.wrap.css({ left:inpP.left + 'px', top:inpY + 'px' });
		
		ltop = DOM.im.offset().top + DOM.im[0].offsetHeight;
		DOM.ymlist[0].style.top = ltop - inpY + 'px';
		
		return that;
	},
	
	_getDOM: function()
	{
	    var wrap = document.createElement('div');
		
		wrap.style.cssText = 'position:absolute;display:none;z-index:' + this.config.zIndex + ';';
		wrap.innerHTML = calendarTpl;
		
        var name, i = 0,
			DOM = { wrap: $(wrap) },
			els = wrap.getElementsByTagName('*'),
			len = els.length;
		
		for( ; i < len; i ++ )
		{
			name = els[i].className.split('cui_')[1];
			if(name) DOM[name] = $(els[i]);
		};
		
		document.body.appendChild(wrap);
		
		return DOM;
	},
	
	_getEvent: function()
	{
	    if( _ie ) return window.event;
		
		var func = this._getEvent.caller;
	
	    while( func != null )
	    {
		    var arg = func.arguments[0];
		    if( arg && (arg + '').indexOf('Event') >= 0 ) return arg;
		    func = func.caller;
	    }
		
		return null;
	},
	
	_setDate: function( day )
	{
	    day = parseInt( day, 10 );
		
		var that = this, opt = that.config, DOM = that.DOM,
		    tmpDate = new Date( that.year, that.month-1, day );
		
		if( opt.format.indexOf('H') >= 0 )
		{
		    var hourVal = parseInt( DOM.hour[0].value, 10 ),
			    minuteVal = parseInt( DOM.minute[0].value, 10 ),
			    secondVal = parseInt( DOM.second[0].value, 10 );
			
			tmpDate = new Date(that.year,that.month-1,day,hourVal,minuteVal,secondVal);
		}
		
		that.day = day;
		
		opt.onSetDate && opt.onSetDate.call( that );
		that.inpE.value = dateFormat.call( tmpDate, opt.format );
		
		if( opt.real )
		{
		    var realFormat = opt.format.indexOf('H') >= 0 ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd';
			$(opt.real)[0].value = dateFormat.call(tmpDate,realFormat);
		}
		
		that.hide();
	},
	
	_addEvent: function()
	{
	    var that = this,
		    DOM = that.DOM;
		
		DOM.wrap.bind('click',function(evt){
		    var target = evt.target;
			
			if( target[expando+'D'] )
			    that._setDate( target[expando+'D'] );
			else if( target === DOM.pm[0] )
				that._draw( new Date(that.year, that.month - 2), that.day );
			else if( target === DOM.nm[0] )
			    that._draw( new Date(that.year, that.month), that.day );
			else if( target === DOM.py[0] )
			    that._draw( new Date(that.year - 1, that.month - 1), that.day );
			else if( target === DOM.ny[0] )
			    that._draw( new Date(that.year + 1, that.month - 1), that.day );
			else if( target === DOM.tbtn[0] )
			{
			    var today = new Date();
				that.year = today.getFullYear();
				that.month = today.getMonth() + 1;
				that.day = today.getDate();
				that._setDate( that.day );
			}
			else if( target === DOM.dbtn[0] )
			{
			    var config = that.config;
				
				if( config.onSetDate )
				{
				    that.year = '';
					that.month = '';
					that.day = '';
					config.onSetDate.call( that );
				}
				
				that.inpE.value = '';
				that.hide();
				
				if( config.real )
				    $(config.real)[0].value = '';
			}
			else if( target === DOM.im[0] )
			{
				var marr = ['01','02','03','04','05','06','07','08','09','10','11','12'],
				    x = DOM.im.offset().left - parseInt(DOM.wrap[0].style.left,10);
			    
				DOM.im[0].select();
				DOM.ybar[0].style.display = 'none';
				DOM.ymlist[0].style.left = x + 'px';
				that._drawList(0, marr)._showList();
				
				return false;
			}
			else if( target === DOM.iy[0] )
			{
				var x = DOM.iy.offset().left - parseInt(DOM.wrap[0].style.left,10);
			    
				DOM.iy[0].select();
				DOM.ybar[0].style.display = '';
				DOM.ymlist[0].style.left = x + 'px';
				that._drawList(that.year - 4)._showList();
				
				return false;
			}
			else
			{
				var today = new Date(),
				    m = DOM.im[0].value || today.getMonth() + 1,
					y = DOM.iy[0].value || today.getFullYear();
				that._draw( new Date(y,m-1), that.day );
			}
			
			that._hideList();
			
			return false;
		});
		
		DOM.ymlist.bind('click',function(evt){
		    var target = evt.target;
;			
			if( target[expando+'M'] >= 0 )
			{
			    DOM.im[0].value = target[expando+'M'] + 1;
				that._draw( new Date(that.year, target[expando+'M']), that.day )._hideList();
			}
			else if( target[expando+'Y'] )
			{
			    DOM.iy[0].value = target[expando+'Y'];
				that._draw( new Date(target[expando+'Y'], that.month-1), that.day )._hideList();
			}
			else if( target === DOM.pybar[0] )
			{
				var p = $('a',DOM.lbox[0])[0][expando+'Y'];
				that._drawList( p - 12 );
			}
			else if( target === DOM.nybar[0] )
			{
			    var p = $('a',DOM.lbox[0])[0][expando+'Y'];
				that._drawList( p + 12 );
			}
			else if( target === DOM.cybar[0] )
			    that._hideList();
			
			return false;
		});
		
		DOM.im.bind('keypress',isDigit);
		DOM.iy.bind('keypress',isDigit);
		DOM.hour.bind('keypress',isDigit);
		DOM.minute.bind('keypress',isDigit);
		DOM.second.bind('keypress',isDigit);
		
		$(document).bind('click',function(evt){
			if( evt.target !== that.evObj )
				that.hide()._hideList();
		});
	},
	
	show: function()
	{
	    this.DOM.wrap[0].style.display = 'block';
		return this;
	},
	
	hide: function()
	{
	    this.DOM.wrap[0].style.display = 'none';
		return this;
	},
	
	getDate: function( type )
	{
	    var that = this, DOM = that.DOM,
		    h = parseInt( DOM.hour[0].value, 10 ),
		    m = parseInt( DOM.minute[0].value, 10 ),
			s = parseInt( DOM.second[0].value, 10 );
		
		if( that.year === '' && that.month === '' && that.day === '' )
		    return '';
			
		switch( type )
		{
		    case 'y': return that.year;
			case 'M': return that.month;
			case 'd': return that.day;
			case 'H': return h;
			case 'm': return m;
			case 's': return s;
			case 'date': return ( that.year + '-' + that.month + '-' + that.day );
			case 'dateTime': return ( that.year + '-' + that.month + '-' + that.day + ' ' + h + ':' + m + ':' + s );
		};
	}
};

lhgcalendar.fn._init.prototype = lhgcalendar.fn;

lhgcalendar.formatDate = function( date, format )
{
	return dateFormat.call( date, format );
};

lhgcalendar.setting =
{
    id: null,
	format: 'yyyy-MM-dd',
	minDate: null,
	maxDate: null,
	btnBar: true,
	targetFormat: null,
	disWeek: null,
	onSetDate: null,
	real: null,
	disDate: null,
	enDate: false,
	zIndex: 9100,
	noToday: false,
	linkageObj: null
};

$.fn.calendar = function( config, event )
{
	event = event || 'click';
	
	this.bind(event, function(){
		lhgcalendar( config );
		return false;
	});
	
	return this;
};

window.lhgcalendar = $.calendar = lhgcalendar;

})( this.jQuery||this.lhgcore, this );
﻿function DateUtil(){}   
/**  
*  add by luofuming 20100416 22:05
*/  
DateUtil.Format=function(fmtCode,date){   
    var result,d,arr_d;   
       
    var patrn_now_1=/^y{4}-M{2}-d{2}\sh{2}:m{2}:s{2}$/;   
    var patrn_now_11=/^y{4}-M{1,2}-d{1,2}\sh{1,2}:m{1,2}:s{1,2}$/;   
       
    var patrn_now_2=/^y{4}\/M{2}\/d{2}\sh{2}:m{2}:s{2}$/;   
    var patrn_now_22=/^y{4}\/M{1,2}\/d{1,2}\sh{1,2}:m{1,2}:s{1,2}$/;   
       
    var patrn_now_3=/^y{4}年M{2}月d{2}日\sh{2}时m{2}分s{2}秒$/;   
    var patrn_now_33=/^y{4}年M{1,2}月d{1,2}日\sh{1,2}时m{1,2}分s{1,2}秒$/;   
       
    var patrn_date_1=/^y{4}-M{2}-d{2}$/;   
    var patrn_date_11=/^y{4}-M{1,2}-d{1,2}$/;   
       
    var patrn_date_2=/^y{4}\/M{2}\/d{2}$/;   
    var patrn_date_22=/^y{4}\/M{1,2}\/d{1,2}$/;   
       
    var patrn_date_3=/^y{4}年M{2}月d{2}日$/;   
    var patrn_date_33=/^y{4}年M{1,2}月d{1,2}日$/;   
       
    var patrn_time_1=/^h{2}:m{2}:s{2}$/;   
    var patrn_time_11=/^h{1,2}:m{1,2}:s{1,2}$/;   
    var patrn_time_2=/^h{2}时m{2}分s{2}秒$/;   
    var patrn_time_22=/^h{1,2}时m{1,2}分s{1,2}秒$/;   
       
    if(!fmtCode){fmtCode="yyyy/MM/dd hh:mm:ss";}   
    if(date){   
        d=new Date(date);   
        if(isNaN(d)){   
            msgBox("时间参数非法\n正确的时间示例:\nThu Nov 9 20:30:37 UTC+0800 2006\n或\n2006/       10/17");   
            return;}   
    }else{   
        d=new Date();   
    }   
  
    if(patrn_now_1.test(fmtCode))   
    {   
        arr_d=splitDate(d,true);   
        result=arr_d.yyyy+"-"+arr_d.MM+"-"+arr_d.dd+" "+arr_d.hh+":"+arr_d.mm+":"+arr_d.ss;   
    }   
    else if(patrn_now_11.test(fmtCode))   
    {   
        arr_d=splitDate(d);   
        result=arr_d.yyyy+"-"+arr_d.MM+"-"+arr_d.dd+" "+arr_d.hh+":"+arr_d.mm+":"+arr_d.ss;   
    }   
    else if(patrn_now_2.test(fmtCode))   
    {   
        arr_d=splitDate(d,true);   
        result=arr_d.yyyy+"/"+arr_d.MM+"/"+arr_d.dd+" "+arr_d.hh+":"+arr_d.mm+":"+arr_d.ss;   
    }   
    else if(patrn_now_22.test(fmtCode))   
    {   
        arr_d=splitDate(d);   
        result=arr_d.yyyy+"/"+arr_d.MM+"/"+arr_d.dd+" "+arr_d.hh+":"+arr_d.mm+":"+arr_d.ss;   
    }   
    else if(patrn_now_3.test(fmtCode))   
    {   
        arr_d=splitDate(d,true);   
        result=arr_d.yyyy+"年"+arr_d.MM+"月"+arr_d.dd+"日"+" "+arr_d.hh+"时"+arr_d.mm+"分"+arr_d.ss+"秒";   
    }   
    else if(patrn_now_33.test(fmtCode))   
    {   
        arr_d=splitDate(d);   
        result=arr_d.yyyy+"年"+arr_d.MM+"月"+arr_d.dd+"日"+" "+arr_d.hh+"时"+arr_d.mm+"分"+arr_d.ss+"秒";   
    }   
       
    else if(patrn_date_1.test(fmtCode))   
    {   
        arr_d=splitDate(d,true);   
        result=1900+arr_d.yyyy+"-"+arr_d.MM+"-"+arr_d.dd;   
    }   
    else if(patrn_date_11.test(fmtCode))   
    {   
        arr_d=splitDate(d);   
        result=arr_d.yyyy+"-"+arr_d.MM+"-"+arr_d.dd;   
    }   
    else if(patrn_date_2.test(fmtCode))   
    {   
        arr_d=splitDate(d,true);   
        result=arr_d.yyyy+"/"+arr_d.MM+"/"+arr_d.dd;   
    }   
    else if(patrn_date_22.test(fmtCode))   
    {   
        arr_d=splitDate(d);   
        result=arr_d.yyyy+"/"+arr_d.MM+"/"+arr_d.dd;   
    }   
    else if(patrn_date_3.test(fmtCode))   
    {   
        arr_d=splitDate(d,true);   
        result=arr_d.yyyy+"年"+arr_d.MM+"月"+arr_d.dd+"日";   
    }   
    else if(patrn_date_33.test(fmtCode))   
    {   
        arr_d=splitDate(d);   
        result=arr_d.yyyy+"年"+arr_d.MM+"月"+arr_d.dd+"日";   
    }   
    else if(patrn_time_1.test(fmtCode)){   
        arr_d=splitDate(d,true);   
        result=arr_d.hh+":"+arr_d.mm+":"+arr_d.ss;   
    }   
    else if(patrn_time_11.test(fmtCode)){   
        arr_d=splitDate(d);   
        result=arr_d.hh+":"+arr_d.mm+":"+arr_d.ss;   
    }   
    else if(patrn_time_2.test(fmtCode)){   
        arr_d=splitDate(d,true);   
        result=arr_d.hh+"时"+arr_d.mm+"分"+arr_d.ss+"秒";   
    }   
    else if(patrn_time_22.test(fmtCode)){   
        arr_d=splitDate(d);   
        result=arr_d.hh+"时"+arr_d.mm+"分"+arr_d.ss+"秒";   
    }   
    else{   
        msgBox("没有匹配的时间格式!");   
        return;   
    }   
       
   return result;   
};   
function splitDate(d,isZero){   
    var yyyy,MM,dd,hh,mm,ss;   
    if(isZero){   
         yyyy=d.getYear();   
         MM=(d.getMonth()+1)<10?"0"+(d.getMonth()+1):d.getMonth()+1;   
         dd=d.getDate()<10?"0"+d.getDate():d.getDate();   
         hh=d.getHours()<10?"0"+d.getHours():d.getHours();   
         mm=d.getMinutes()<10?"0"+d.getMinutes():d.getMinutes();   
         ss=d.getSeconds()<10?"0"+d.getSeconds():d.getSeconds();   
    }else{   
         yyyy=d.getYear();   
         MM=d.getMonth()+1;   
         dd=d.getDate();   
         hh=d.getHours();   
         mm=d.getMinutes();   
         ss=d.getSeconds();     
    }   
    return {"yyyy":yyyy,"MM":MM,"dd":dd,"hh":hh,"mm":mm,"ss":ss};     
}   
function msgBox(msg){   
    window.alert(msg);   
}  


function check_computeComplex(password) {
	var complex = 0;
	var length = password.length;

	var pre = '';
	var preType = 0;
	for (var i = 0; i < length; i++) {
		var cur = password.charAt(i);
		var curType = check_gettype(password, i);

		if (preType != curType || !check_isregular(cur, pre, curType)) {
			complex += curType + check_getcomplex(curType, preType);
		}

		pre = cur;
		preType = curType;
	}

	return complex;
}

function check_gettype(str, i) {
	if (str.charCodeAt(i) >= 48 && str.charCodeAt(i) <= 57) {
		return 1;
	}
	else if(str.charCodeAt(i) >= 97 && str.charCodeAt(i) <= 122) {
		return 2;
	}
	else if(str.charCodeAt(i) >= 65 && str.charCodeAt(i) <= 90) {
		return 3;
	}

	return 4;
}

function check_isregular(cur, pre, type) {
	var curCode = cur.charCodeAt(0);
	var preCode = pre.charCodeAt(0);
	
	if(curCode - preCode == 0){
		return true;
	}
	
	if(type != 4 && (curCode - preCode == 1 || curCode - preCode == -1)){
		return true;
	}
	
	return false;
}

function check_getcomplex(curType, preType){
	if(preType == 0 || curType == preType){
		return 0;
	}else if(curType == 4 || preType == 4){
		return 2;
	}else{
		return 1;
	}
}

/*
 * JQuery zTree core 3.4
 * http://zTree.me/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2012-09-03
 */
(function($){
	var settings = {}, roots = {}, caches = {},
	//default consts of core
	_consts = {
		event: {
			NODECREATED: "ztree_nodeCreated",
			CLICK: "ztree_click",
			EXPAND: "ztree_expand",
			COLLAPSE: "ztree_collapse",
			ASYNC_SUCCESS: "ztree_async_success",
			ASYNC_ERROR: "ztree_async_error"
		},
		id: {
			A: "_a",
			ICON: "_ico",
			SPAN: "_span",
			SWITCH: "_switch",
			UL: "_ul"
		},
		line: {
			ROOT: "root",
			ROOTS: "roots",
			CENTER: "center",
			BOTTOM: "bottom",
			NOLINE: "noline",
			LINE: "line"
		},
		folder: {
			OPEN: "open",
			CLOSE: "close",
			DOCU: "docu"
		},
		node: {
			CURSELECTED: "curSelectedNode"
		}
	},
	//default setting of core
	_setting = {
		treeId: "",
		treeObj: null,
		view: {
			addDiyDom: null,
			autoCancelSelected: true,
			dblClickExpand: true,
			expandSpeed: "fast",
			fontCss: {},
			nameIsHTML: false,
			selectedMulti: true,
			showIcon: true,
			showLine: true,
			showTitle: true
		},
		data: {
			key: {
				children: "children",
				name: "name",
				title: "",
				url: "url"
			},
			simpleData: {
				enable: false,
				idKey: "id",
				pIdKey: "pId",
				rootPId: null
			},
			keep: {
				parent: false,
				leaf: false
			}
		},
		async: {
			enable: false,
			contentType: "application/x-www-form-urlencoded",
			type: "post",
			dataType: "text",
			url: "",
			autoParam: [],
			otherParam: [],
			dataFilter: null
		},
		callback: {
			beforeAsync:null,
			beforeClick:null,
			beforeRightClick:null,
			beforeMouseDown:null,
			beforeMouseUp:null,
			beforeExpand:null,
			beforeCollapse:null,
			beforeRemove:null,

			onAsyncError:null,
			onAsyncSuccess:null,
			onNodeCreated:null,
			onClick:null,
			onRightClick:null,
			onMouseDown:null,
			onMouseUp:null,
			onExpand:null,
			onCollapse:null,
			onRemove:null
		}
	},
	//default root of core
	//zTree use root to save full data
	_initRoot = function (setting) {
		var r = data.getRoot(setting);
		if (!r) {
			r = {};
			data.setRoot(setting, r);
		}
		r[setting.data.key.children] = [];
		r.expandTriggerFlag = false;
		r.curSelectedList = [];
		r.noSelection = true;
		r.createdNodes = [];
		r.zId = 0;
	},
	//default cache of core
	_initCache = function(setting) {
		var c = data.getCache(setting);
		if (!c) {
			c = {};
			data.setCache(setting, c);
		}
		c.nodes = [];
		c.doms = [];
	},
	//default bindEvent of core
	_bindEvent = function(setting) {
		var o = setting.treeObj,
		c = consts.event;
		o.bind(c.NODECREATED, function (event, treeId, node) {
			tools.apply(setting.callback.onNodeCreated, [event, treeId, node]);
		});

		o.bind(c.CLICK, function (event, srcEvent, treeId, node, clickFlag) {
			tools.apply(setting.callback.onClick, [srcEvent, treeId, node, clickFlag]);
		});

		o.bind(c.EXPAND, function (event, treeId, node) {
			tools.apply(setting.callback.onExpand, [event, treeId, node]);
		});

		o.bind(c.COLLAPSE, function (event, treeId, node) {
			tools.apply(setting.callback.onCollapse, [event, treeId, node]);
		});

		o.bind(c.ASYNC_SUCCESS, function (event, treeId, node, msg) {
			tools.apply(setting.callback.onAsyncSuccess, [event, treeId, node, msg]);
		});

		o.bind(c.ASYNC_ERROR, function (event, treeId, node, XMLHttpRequest, textStatus, errorThrown) {
			tools.apply(setting.callback.onAsyncError, [event, treeId, node, XMLHttpRequest, textStatus, errorThrown]);
		});
	},
	_unbindEvent = function(setting) {
		var o = setting.treeObj,
		c = consts.event;
		o.unbind(c.NODECREATED)
		.unbind(c.CLICK)
		.unbind(c.EXPAND)
		.unbind(c.COLLAPSE)
		.unbind(c.ASYNC_SUCCESS)
		.unbind(c.ASYNC_ERROR);
	},	
	//default event proxy of core
	_eventProxy = function(event) {
		var target = event.target,
		setting = data.getSetting(event.data.treeId),
		tId = "", node = null,
		nodeEventType = "", treeEventType = "",
		nodeEventCallback = null, treeEventCallback = null,
		tmp = null;

		if (tools.eqs(event.type, "mousedown")) {
			treeEventType = "mousedown";
		} else if (tools.eqs(event.type, "mouseup")) {
			treeEventType = "mouseup";
		} else if (tools.eqs(event.type, "contextmenu")) {
			treeEventType = "contextmenu";
		} else if (tools.eqs(event.type, "click")) {
			if (tools.eqs(target.tagName, "span") && target.getAttribute("treeNode"+ consts.id.SWITCH) !== null) {
				tId = ($(target).parent("li").get(0) || $(target).parentsUntil("li").parent().get(0)).id;
				nodeEventType = "switchNode";
			} else {
				tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
				if (tmp) {
					tId = ($(tmp).parent("li").get(0) || $(tmp).parentsUntil("li").parent().get(0)).id;
					nodeEventType = "clickNode";
				}
			}
		} else if (tools.eqs(event.type, "dblclick")) {
			treeEventType = "dblclick";
			tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
			if (tmp) {
				tId = ($(tmp).parent("li").get(0) || $(tmp).parentsUntil("li").parent().get(0)).id;
				nodeEventType = "switchNode";
			}
		}
		if (treeEventType.length > 0 && tId.length == 0) {
			tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
			if (tmp) {tId = ($(tmp).parent("li").get(0) || $(tmp).parentsUntil("li").parent().get(0)).id;}
		}
		// event to node
		if (tId.length>0) {
			node = data.getNodeCache(setting, tId);
			switch (nodeEventType) {
				case "switchNode" :
					if (!node.isParent) {
						nodeEventType = "";
					} else if (tools.eqs(event.type, "click") 
						|| (tools.eqs(event.type, "dblclick") && tools.apply(setting.view.dblClickExpand, [setting.treeId, node], setting.view.dblClickExpand))) {
						nodeEventCallback = handler.onSwitchNode;
					} else {
						nodeEventType = "";
					}
					break;
				case "clickNode" :
					nodeEventCallback = handler.onClickNode;
					break;
			}
		}
		// event to zTree
		switch (treeEventType) {
			case "mousedown" :
				treeEventCallback = handler.onZTreeMousedown;
				break;
			case "mouseup" :
				treeEventCallback = handler.onZTreeMouseup;
				break;
			case "dblclick" :
				treeEventCallback = handler.onZTreeDblclick;
				break;
			case "contextmenu" :
				treeEventCallback = handler.onZTreeContextmenu;
				break;
		}
		var proxyResult = {
			stop: false,
			node: node,
			nodeEventType: nodeEventType,
			nodeEventCallback: nodeEventCallback,
			treeEventType: treeEventType,
			treeEventCallback: treeEventCallback
		};
		return proxyResult
	},
	//default init node of core
	_initNode = function(setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
		if (!n) return;
		var r = data.getRoot(setting),
		childKey = setting.data.key.children;
		n.level = level;
		n.tId = setting.treeId + "_" + (++r.zId);
		n.parentTId = parentNode ? parentNode.tId : null;
		if (n[childKey] && n[childKey].length > 0) {
			if (typeof n.open == "string") n.open = tools.eqs(n.open, "true");
			n.open = !!n.open;
			n.isParent = true;
			n.zAsync = true;
		} else {
			n.open = false;
			if (typeof n.isParent == "string") n.isParent = tools.eqs(n.isParent, "true");
			n.isParent = !!n.isParent;
			n.zAsync = !n.isParent;
		}
		n.isFirstNode = isFirstNode;
		n.isLastNode = isLastNode;
		n.getParentNode = function() {return data.getNodeCache(setting, n.parentTId);};
		n.getPreNode = function() {return data.getPreNode(setting, n);};
		n.getNextNode = function() {return data.getNextNode(setting, n);};
		n.isAjaxing = false;
		data.fixPIdKeyValue(setting, n);
	},
	_init = {
		bind: [_bindEvent],
		unbind: [_unbindEvent],
		caches: [_initCache],
		nodes: [_initNode],
		proxys: [_eventProxy],
		roots: [_initRoot],
		beforeA: [],
		afterA: [],
		innerBeforeA: [],
		innerAfterA: [],
		zTreeTools: []
	},
	//method of operate data
	data = {
		addNodeCache: function(setting, node) {
			data.getCache(setting).nodes[data.getNodeCacheId(node.tId)] = node;
		},
		getNodeCacheId: function(tId) {
			return tId.substring(tId.lastIndexOf("_")+1);
		},
		addAfterA: function(afterA) {
			_init.afterA.push(afterA);
		},
		addBeforeA: function(beforeA) {
			_init.beforeA.push(beforeA);
		},
		addInnerAfterA: function(innerAfterA) {
			_init.innerAfterA.push(innerAfterA);
		},
		addInnerBeforeA: function(innerBeforeA) {
			_init.innerBeforeA.push(innerBeforeA);
		},
		addInitBind: function(bindEvent) {
			_init.bind.push(bindEvent);
		},
		addInitUnBind: function(unbindEvent) {
			_init.unbind.push(unbindEvent);
		},
		addInitCache: function(initCache) {
			_init.caches.push(initCache);
		},
		addInitNode: function(initNode) {
			_init.nodes.push(initNode);
		},
		addInitProxy: function(initProxy) {
			_init.proxys.push(initProxy);
		},
		addInitRoot: function(initRoot) {
			_init.roots.push(initRoot);
		},
		addNodesData: function(setting, parentNode, nodes) {
			var childKey = setting.data.key.children;
			if (!parentNode[childKey]) parentNode[childKey] = [];
			if (parentNode[childKey].length > 0) {
				parentNode[childKey][parentNode[childKey].length - 1].isLastNode = false;
				view.setNodeLineIcos(setting, parentNode[childKey][parentNode[childKey].length - 1]);
			}
			parentNode.isParent = true;
			parentNode[childKey] = parentNode[childKey].concat(nodes);
		},
		addSelectedNode: function(setting, node) {
			var root = data.getRoot(setting);
			if (!data.isSelectedNode(setting, node)) {
				root.curSelectedList.push(node);
			}
		},
		addCreatedNode: function(setting, node) {
			if (!!setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
				var root = data.getRoot(setting);
				root.createdNodes.push(node);
			}
		},
		addZTreeTools: function(zTreeTools) {
			_init.zTreeTools.push(zTreeTools);
		},
		exSetting: function(s) {
			$.extend(true, _setting, s);
		},
		fixPIdKeyValue: function(setting, node) {
			if (setting.data.simpleData.enable) {
				node[setting.data.simpleData.pIdKey] = node.parentTId ? node.getParentNode()[setting.data.simpleData.idKey] : setting.data.simpleData.rootPId;
			}
		},
		getAfterA: function(setting, node, array) {
			for (var i=0, j=_init.afterA.length; i<j; i++) {
				_init.afterA[i].apply(this, arguments);
			}
		},
		getBeforeA: function(setting, node, array) {
			for (var i=0, j=_init.beforeA.length; i<j; i++) {
				_init.beforeA[i].apply(this, arguments);
			}
		},
		getInnerAfterA: function(setting, node, array) {
			for (var i=0, j=_init.innerAfterA.length; i<j; i++) {
				_init.innerAfterA[i].apply(this, arguments);
			}
		},
		getInnerBeforeA: function(setting, node, array) {
			for (var i=0, j=_init.innerBeforeA.length; i<j; i++) {
				_init.innerBeforeA[i].apply(this, arguments);
			}
		},
		getCache: function(setting) {
			return caches[setting.treeId];
		},
		getNextNode: function(setting, node) {
			if (!node) return null;
			var childKey = setting.data.key.children,
			p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
			for (var i=0, l=p[childKey].length-1; i<=l; i++) {
				if (p[childKey][i] === node) {
					return (i==l ? null : p[childKey][i+1]);
				}
			}
			return null;
		},
		getNodeByParam: function(setting, nodes, key, value) {
			if (!nodes || !key) return null;
			var childKey = setting.data.key.children;
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (nodes[i][key] == value) {
					return nodes[i];
				}
				var tmp = data.getNodeByParam(setting, nodes[i][childKey], key, value);
				if (tmp) return tmp;
			}
			return null;
		},
		getNodeCache: function(setting, tId) {
			if (!tId) return null;
			var n = caches[setting.treeId].nodes[data.getNodeCacheId(tId)];
			return n ? n : null;
		},
		getNodeName: function(setting, node) {
			var nameKey = setting.data.key.name;
			return "" + node[nameKey];
		},
		getNodeTitle: function(setting, node) {
			var t = setting.data.key.title === "" ? setting.data.key.name : setting.data.key.title;
			return "" + node[t];
		},
		getNodes: function(setting) {
			return data.getRoot(setting)[setting.data.key.children];
		},
		getNodesByParam: function(setting, nodes, key, value) {
			if (!nodes || !key) return [];
			var childKey = setting.data.key.children,
			result = [];
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (nodes[i][key] == value) {
					result.push(nodes[i]);
				}
				result = result.concat(data.getNodesByParam(setting, nodes[i][childKey], key, value));
			}
			return result;
		},
		getNodesByParamFuzzy: function(setting, nodes, key, value) {
			if (!nodes || !key) return [];
			var childKey = setting.data.key.children,
			result = [];
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (typeof nodes[i][key] == "string" && nodes[i][key].indexOf(value)>-1) {
					result.push(nodes[i]);
				}
				result = result.concat(data.getNodesByParamFuzzy(setting, nodes[i][childKey], key, value));
			}
			return result;
		},
		getNodesByFilter: function(setting, nodes, filter, isSingle, invokeParam) {
			if (!nodes) return (isSingle ? null : []);
			var childKey = setting.data.key.children,
			result = isSingle ? null : [];
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (tools.apply(filter, [nodes[i], invokeParam], false)) {
					if (isSingle) {return nodes[i];}
					result.push(nodes[i]);
				}
				var tmpResult = data.getNodesByFilter(setting, nodes[i][childKey], filter, isSingle, invokeParam);
				if (isSingle && !!tmpResult) {return tmpResult;}
				result = isSingle ? tmpResult : result.concat(tmpResult);
			}
			return result;
		},
		getPreNode: function(setting, node) {
			if (!node) return null;
			var childKey = setting.data.key.children,
			p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
			for (var i=0, l=p[childKey].length; i<l; i++) {
				if (p[childKey][i] === node) {
					return (i==0 ? null : p[childKey][i-1]);
				}
			}
			return null;
		},
		getRoot: function(setting) {
			return setting ? roots[setting.treeId] : null;
		},
		getSetting: function(treeId) {
			return settings[treeId];
		},
		getSettings: function() {
			return settings;
		},
		getZTreeTools: function(treeId) {
			var r = this.getRoot(this.getSetting(treeId));
			return r ? r.treeTools : null;
		},
		initCache: function(setting) {
			for (var i=0, j=_init.caches.length; i<j; i++) {
				_init.caches[i].apply(this, arguments);
			}
		},
		initNode: function(setting, level, node, parentNode, preNode, nextNode) {
			for (var i=0, j=_init.nodes.length; i<j; i++) {
				_init.nodes[i].apply(this, arguments);
			}
		},
		initRoot: function(setting) {
			for (var i=0, j=_init.roots.length; i<j; i++) {
				_init.roots[i].apply(this, arguments);
			}
		},
		isSelectedNode: function(setting, node) {
			var root = data.getRoot(setting);
			for (var i=0, j=root.curSelectedList.length; i<j; i++) {
				if(node === root.curSelectedList[i]) return true;
			}
			return false;
		},
		removeNodeCache: function(setting, node) {
			var childKey = setting.data.key.children;
			if (node[childKey]) {
				for (var i=0, l=node[childKey].length; i<l; i++) {
					arguments.callee(setting, node[childKey][i]);
				}
			}
			data.getCache(setting).nodes[data.getNodeCacheId(node.tId)] = null;
		},
		removeSelectedNode: function(setting, node) {
			var root = data.getRoot(setting);
			for (var i=0, j=root.curSelectedList.length; i<j; i++) {
				if(node === root.curSelectedList[i] || !data.getNodeCache(setting, root.curSelectedList[i].tId)) {
					root.curSelectedList.splice(i, 1);
					i--;j--;
				}
			}
		},
		setCache: function(setting, cache) {
			caches[setting.treeId] = cache;
		},
		setRoot: function(setting, root) {
			roots[setting.treeId] = root;
		},
		setZTreeTools: function(setting, zTreeTools) {
			for (var i=0, j=_init.zTreeTools.length; i<j; i++) {
				_init.zTreeTools[i].apply(this, arguments);
			}
		},
		transformToArrayFormat: function (setting, nodes) {
			if (!nodes) return [];
			var childKey = setting.data.key.children,
			r = [];
			if (tools.isArray(nodes)) {
				for (var i=0, l=nodes.length; i<l; i++) {
					r.push(nodes[i]);
					if (nodes[i][childKey])
						r = r.concat(data.transformToArrayFormat(setting, nodes[i][childKey]));
				}
			} else {
				r.push(nodes);
				if (nodes[childKey])
					r = r.concat(data.transformToArrayFormat(setting, nodes[childKey]));
			}
			return r;
		},
		transformTozTreeFormat: function(setting, sNodes) {
			var i,l,
			key = setting.data.simpleData.idKey,
			parentKey = setting.data.simpleData.pIdKey,
			childKey = setting.data.key.children;
			if (!key || key=="" || !sNodes) return [];

			if (tools.isArray(sNodes)) {
				var r = [];
				var tmpMap = [];
				for (i=0, l=sNodes.length; i<l; i++) {
					tmpMap[sNodes[i][key]] = sNodes[i];
				}
				for (i=0, l=sNodes.length; i<l; i++) {
					if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
						if (!tmpMap[sNodes[i][parentKey]][childKey])
							tmpMap[sNodes[i][parentKey]][childKey] = [];
						tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
					} else {
						r.push(sNodes[i]);
					}
				}
				return r;
			}else {
				return [sNodes];
			}
		}
	},
	//method of event proxy
	event = {
		bindEvent: function(setting) {
			for (var i=0, j=_init.bind.length; i<j; i++) {
				_init.bind[i].apply(this, arguments);
			}
		},
		unbindEvent: function(setting) {
			for (var i=0, j=_init.unbind.length; i<j; i++) {
				_init.unbind[i].apply(this, arguments);
			}
		},
		bindTree: function(setting) {
			var eventParam = {
				treeId: setting.treeId
			},
			o = setting.treeObj;
			o.bind('click', eventParam, event.proxy);
			o.bind('dblclick', eventParam, event.proxy);
			o.bind('mouseover', eventParam, event.proxy);
			o.bind('mouseout', eventParam, event.proxy);
			o.bind('mousedown', eventParam, event.proxy);
			o.bind('mouseup', eventParam, event.proxy);
			o.bind('contextmenu', eventParam, event.proxy);
		},
		unbindTree: function(setting) {
			var o = setting.treeObj;
			o.unbind('click', event.proxy)
			.unbind('dblclick', event.proxy)
			.unbind('mouseover', event.proxy)
			.unbind('mouseout', event.proxy)
			.unbind('mousedown', event.proxy)
			.unbind('mouseup', event.proxy)
			.unbind('contextmenu', event.proxy);
		},
		doProxy: function(e) {
			var results = [];
			for (var i=0, j=_init.proxys.length; i<j; i++) {
				var proxyResult = _init.proxys[i].apply(this, arguments);
				results.push(proxyResult);
				if (proxyResult.stop) {
					break;
				}
			}
			return results;
		},
		proxy: function(e) {
			var setting = data.getSetting(e.data.treeId);
			if (!tools.uCanDo(setting, e)) return true;
			var results = event.doProxy(e),
			r = true, x = false;
			for (var i=0, l=results.length; i<l; i++) {
				var proxyResult = results[i];
				if (proxyResult.nodeEventCallback) {
					x = true;
					r = proxyResult.nodeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
				}
				if (proxyResult.treeEventCallback) {
					x = true;
					r = proxyResult.treeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
				}
			}
			try{
				if (x && $("input:focus").length == 0) {
					tools.noSel(setting);
				}
			} catch(e) {}
			return r;
		}
	},
	//method of event handler
	handler = {
		onSwitchNode: function (event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (node.open) {
				if (tools.apply(setting.callback.beforeCollapse, [setting.treeId, node], true) == false) return true;
				data.getRoot(setting).expandTriggerFlag = true;
				view.switchNode(setting, node);
			} else {
				if (tools.apply(setting.callback.beforeExpand, [setting.treeId, node], true) == false) return true;
				data.getRoot(setting).expandTriggerFlag = true;
				view.switchNode(setting, node);
			}
			return true;
		},
		onClickNode: function (event, node) {
			var setting = data.getSetting(event.data.treeId),
			clickFlag = ( (setting.view.autoCancelSelected && event.ctrlKey) && data.isSelectedNode(setting, node)) ? 0 : (setting.view.autoCancelSelected && event.ctrlKey && setting.view.selectedMulti) ? 2 : 1;
			if (tools.apply(setting.callback.beforeClick, [setting.treeId, node, clickFlag], true) == false) return true;
			if (clickFlag === 0) {
				view.cancelPreSelectedNode(setting, node);
			} else {
				view.selectNode(setting, node, clickFlag === 2);
			}
			setting.treeObj.trigger(consts.event.CLICK, [event, setting.treeId, node, clickFlag]);
			return true;
		},
		onZTreeMousedown: function(event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (tools.apply(setting.callback.beforeMouseDown, [setting.treeId, node], true)) {
				tools.apply(setting.callback.onMouseDown, [event, setting.treeId, node]);
			}
			return true;
		},
		onZTreeMouseup: function(event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (tools.apply(setting.callback.beforeMouseUp, [setting.treeId, node], true)) {
				tools.apply(setting.callback.onMouseUp, [event, setting.treeId, node]);
			}
			return true;
		},
		onZTreeDblclick: function(event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (tools.apply(setting.callback.beforeDblClick, [setting.treeId, node], true)) {
				tools.apply(setting.callback.onDblClick, [event, setting.treeId, node]);
			}
			return true;
		},
		onZTreeContextmenu: function(event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (tools.apply(setting.callback.beforeRightClick, [setting.treeId, node], true)) {
				tools.apply(setting.callback.onRightClick, [event, setting.treeId, node]);
			}
			return (typeof setting.callback.onRightClick) != "function";
		}
	},
	//method of tools for zTree
	tools = {
		apply: function(fun, param, defaultValue) {
			if ((typeof fun) == "function") {
				return fun.apply(zt, param?param:[]);
			}
			return defaultValue;
		},
		canAsync: function(setting, node) {
			var childKey = setting.data.key.children;
			return (setting.async.enable && node && node.isParent && !(node.zAsync || (node[childKey] && node[childKey].length > 0)));
		},
		clone: function (jsonObj) {
			var buf;
			if (jsonObj instanceof Array) {
				buf = [];
				var i = jsonObj.length;
				while (i--) {
					buf[i] = arguments.callee(jsonObj[i]);
				}
				return buf;
			}else if (typeof jsonObj == "function"){
				return jsonObj;
			}else if (jsonObj instanceof Object){
				buf = {};
				for (var k in jsonObj) {
					buf[k] = arguments.callee(jsonObj[k]);
				}
				return buf;
			}else{
				return jsonObj;
			}
		},
		eqs: function(str1, str2) {
			return str1.toLowerCase() === str2.toLowerCase();
		},
		isArray: function(arr) {
			return Object.prototype.toString.apply(arr) === "[object Array]";
		},
		getMDom: function (setting, curDom, targetExpr) {
			if (!curDom) return null;
			while (curDom && curDom.id !== setting.treeId) {
				for (var i=0, l=targetExpr.length; curDom.tagName && i<l; i++) {
					if (tools.eqs(curDom.tagName, targetExpr[i].tagName) && curDom.getAttribute(targetExpr[i].attrName) !== null) {
						return curDom;
					}
				}
				curDom = curDom.parentNode;
			}
			return null;
		},
		noSel: function(setting) {
			var r = data.getRoot(setting);
			if (r.noSelection) {
				try {
					window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
				} catch(e){}
			}
		},
		uCanDo: function(setting, e) {
			return true;
		}
	},
	//method of operate ztree dom
	view = {
		addNodes: function(setting, parentNode, newNodes, isSilent) {
			if (setting.data.keep.leaf && parentNode && !parentNode.isParent) {
				return;
			}
			if (!tools.isArray(newNodes)) {
				newNodes = [newNodes];
			}
			if (setting.data.simpleData.enable) {
				newNodes = data.transformTozTreeFormat(setting, newNodes);
			}
			if (parentNode) {
				var target_switchObj = $("#" + parentNode.tId + consts.id.SWITCH),
				target_icoObj = $("#" + parentNode.tId + consts.id.ICON),
				target_ulObj = $("#" + parentNode.tId + consts.id.UL);

				if (!parentNode.open) {
					view.replaceSwitchClass(parentNode, target_switchObj, consts.folder.CLOSE);
					view.replaceIcoClass(parentNode, target_icoObj, consts.folder.CLOSE);
					parentNode.open = false;
					target_ulObj.css({
						"display": "none"
					});
				}

				data.addNodesData(setting, parentNode, newNodes);
				view.createNodes(setting, parentNode.level + 1, newNodes, parentNode);
				if (!isSilent) {
					view.expandCollapseParentNode(setting, parentNode, true);
				}
			} else {
				data.addNodesData(setting, data.getRoot(setting), newNodes);
				view.createNodes(setting, 0, newNodes, null);
			}
		},
		appendNodes: function(setting, level, nodes, parentNode, initFlag, openFlag) {
			if (!nodes) return [];
			var html = [],
			childKey = setting.data.key.children;
			for (var i = 0, l = nodes.length; i < l; i++) {
				var node = nodes[i];
				if (initFlag) {
					var tmpPNode = (parentNode) ? parentNode: data.getRoot(setting),
					tmpPChild = tmpPNode[childKey],
					isFirstNode = ((tmpPChild.length == nodes.length) && (i == 0)),
					isLastNode = (i == (nodes.length - 1));
					data.initNode(setting, level, node, parentNode, isFirstNode, isLastNode, openFlag);
					data.addNodeCache(setting, node);
				}

				var childHtml = [];
				if (node[childKey] && node[childKey].length > 0) {
					//make child html first, because checkType
					childHtml = view.appendNodes(setting, level + 1, node[childKey], node, initFlag, openFlag && node.open);
				}
				if (openFlag) {
					
					view.makeDOMNodeMainBefore(html, setting, node);
					view.makeDOMNodeLine(html, setting, node);
					data.getBeforeA(setting, node, html);
					view.makeDOMNodeNameBefore(html, setting, node);
					data.getInnerBeforeA(setting, node, html);
					view.makeDOMNodeIcon(html, setting, node);
					data.getInnerAfterA(setting, node, html);
					view.makeDOMNodeNameAfter(html, setting, node);
					data.getAfterA(setting, node, html);
					if (node.isParent && node.open) {
						view.makeUlHtml(setting, node, html, childHtml.join(''));
					}
					view.makeDOMNodeMainAfter(html, setting, node);
					data.addCreatedNode(setting, node);
				}
			}
			return html;
		},
		appendParentULDom: function(setting, node) {
			var html = [],
			nObj = $("#" + node.tId),
			ulObj = $("#" + node.tId + consts.id.UL),
			childKey = setting.data.key.children,
			childHtml = view.appendNodes(setting, node.level+1, node[childKey], node, false, true);
			view.makeUlHtml(setting, node, html, childHtml.join(''));
			if (!nObj.get(0) && !!node.parentTId) {
				view.appendParentULDom(setting, node.getParentNode());
				nObj = $("#" + node.tId);
			}
			if (ulObj.get(0)) {
				ulObj.remove();
			}
			nObj.append(html.join(''));
		},
		asyncNode: function(setting, node, isSilent, callback) {
			var i, l;
			if (node && !node.isParent) {
				tools.apply(callback);
				return false;
			} else if (node && node.isAjaxing) {
				return false;
			} else if (tools.apply(setting.callback.beforeAsync, [setting.treeId, node], true) == false) {
				tools.apply(callback);
				return false;
			}
			if (node) {
				node.isAjaxing = true;
				var icoObj = $("#" + node.tId + consts.id.ICON);
				icoObj.attr({"style":"", "class":"button ico_loading"});
			}

			var isJson = (setting.async.contentType == "application/json"), tmpParam = isJson ? "{" : "", jTemp="";
			for (i = 0, l = setting.async.autoParam.length; node && i < l; i++) {
				var pKey = setting.async.autoParam[i].split("="), spKey = pKey;
				if (pKey.length>1) {
					spKey = pKey[1];
					pKey = pKey[0];
				}
				if (isJson) {
					jTemp = (typeof node[pKey] == "string") ? '"' : '';
					tmpParam += '"' + spKey + ('":' + jTemp + node[pKey]).replace(/'/g,'\\\'') + jTemp + ',';
				} else {
					tmpParam += spKey + ("=" + node[pKey]).replace(/&/g,'%26') + "&";
				}
			}
			if (tools.isArray(setting.async.otherParam)) {
				for (i = 0, l = setting.async.otherParam.length; i < l; i += 2) {
					if (isJson) {
						jTemp = (typeof setting.async.otherParam[i + 1] == "string") ? '"' : '';
						tmpParam += '"' + setting.async.otherParam[i] + ('":' + jTemp + setting.async.otherParam[i + 1]).replace(/'/g,'\\\'') + jTemp + ",";
					} else {
						tmpParam += setting.async.otherParam[i] + ("=" + setting.async.otherParam[i + 1]).replace(/&/g,'%26') + "&";
					}
				}
			} else {
				for (var p in setting.async.otherParam) {
					if (isJson) {
						jTemp = (typeof setting.async.otherParam[p] == "string") ? '"' : '';
						tmpParam += '"' + p + ('":' + jTemp + setting.async.otherParam[p]).replace(/'/g,'\\\'') + jTemp + ",";
					} else {
						tmpParam += p + ("=" + setting.async.otherParam[p]).replace(/&/g,'%26') + "&";
					}
				}
			}
			if (tmpParam.length > 1) tmpParam = tmpParam.substring(0, tmpParam.length-1);
			if (isJson) tmpParam += "}";

			$.ajax({
				contentType: setting.async.contentType,
				type: setting.async.type,
				url: tools.apply(setting.async.url, [setting.treeId, node], setting.async.url),
				data: tmpParam,
				dataType: setting.async.dataType,
				success: function(msg) {
					var newNodes = [];
					try {
						if (!msg || msg.length == 0) {
							newNodes = [];
						} else if (typeof msg == "string") {
							newNodes = eval("(" + msg + ")");
						} else {
							newNodes = msg;
						}
					} catch(err) {
						newNodes = msg;
					}

					if (node) {
						node.isAjaxing = null;
						node.zAsync = true;
					}
					view.setNodeLineIcos(setting, node);
					if (newNodes && newNodes !== "") {
						newNodes = tools.apply(setting.async.dataFilter, [setting.treeId, node, newNodes], newNodes);
						view.addNodes(setting, node, !!newNodes ? tools.clone(newNodes) : [], !!isSilent);
					} else {
						view.addNodes(setting, node, [], !!isSilent);
					}
					setting.treeObj.trigger(consts.event.ASYNC_SUCCESS, [setting.treeId, node, msg]);
					tools.apply(callback);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					if (node) node.isAjaxing = null;
					view.setNodeLineIcos(setting, node);
					setting.treeObj.trigger(consts.event.ASYNC_ERROR, [setting.treeId, node, XMLHttpRequest, textStatus, errorThrown]);
				}
			});
			return true;
		},
		cancelPreSelectedNode: function (setting, node) {
			var list = data.getRoot(setting).curSelectedList;
			for (var i=0, j=list.length-1; j>=i; j--) {
				if (!node || node === list[j]) {
					$("#" + list[j].tId + consts.id.A).removeClass(consts.node.CURSELECTED);
					view.setNodeName(setting, list[j]);
					if (node) {
						data.removeSelectedNode(setting, node);
						break;
					}
				}
			}
			if (!node) data.getRoot(setting).curSelectedList = [];
		},
		createNodeCallback: function(setting) {
			if (!!setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
				var root = data.getRoot(setting);
				while (root.createdNodes.length>0) {
					var node = root.createdNodes.shift();
					tools.apply(setting.view.addDiyDom, [setting.treeId, node]);
					if (!!setting.callback.onNodeCreated) {
						setting.treeObj.trigger(consts.event.NODECREATED, [setting.treeId, node]);
					}
				}
			}
		},
		createNodes: function(setting, level, nodes, parentNode) {
			if (!nodes || nodes.length == 0) return;
			var root = data.getRoot(setting),
			childKey = setting.data.key.children,
			openFlag = !parentNode || parentNode.open || !!$("#" + parentNode[childKey][0].tId).get(0);
			root.createdNodes = [];
			var zTreeHtml = view.appendNodes(setting, level, nodes, parentNode, true, openFlag);
			if (!parentNode) {
				setting.treeObj.append(zTreeHtml.join(''));
			} else {
				var ulObj = $("#" + parentNode.tId + consts.id.UL);
				if (ulObj.get(0)) {
					ulObj.append(zTreeHtml.join(''));
				}
			}
			view.createNodeCallback(setting);
		},
		destroy: function(setting) {
			if (!setting) return;
			data.initCache(setting);
			data.initRoot(setting);
			event.unbindTree(setting);
			event.unbindEvent(setting);
			setting.treeObj.empty();
		},
		expandCollapseNode: function(setting, node, expandFlag, animateFlag, callback) {
			var root = data.getRoot(setting),
			childKey = setting.data.key.children;
			if (!node) {
				tools.apply(callback, []);
				return;
			}
			if (root.expandTriggerFlag) {
				var _callback = callback;
				callback = function(){
					if (_callback) _callback();
					if (node.open) {
						setting.treeObj.trigger(consts.event.EXPAND, [setting.treeId, node]);
					} else {
						setting.treeObj.trigger(consts.event.COLLAPSE, [setting.treeId, node]);
					}
				};
				root.expandTriggerFlag = false;
			}
			if (node.open == expandFlag) {
				tools.apply(callback, []);
				return;
			}
			if (!node.open && node.isParent && ((!$("#" + node.tId + consts.id.UL).get(0)) || (node[childKey] && node[childKey].length>0 && !$("#" + node[childKey][0].tId).get(0)))) {
				view.appendParentULDom(setting, node);
				view.createNodeCallback(setting);
			}
			var ulObj = $("#" + node.tId + consts.id.UL),
			switchObj = $("#" + node.tId + consts.id.SWITCH),
			icoObj = $("#" + node.tId + consts.id.ICON);

			if (node.isParent) {
				node.open = !node.open;
				if (node.iconOpen && node.iconClose) {
					icoObj.attr("style", view.makeNodeIcoStyle(setting, node));
				}

				if (node.open) {
					view.replaceSwitchClass(node, switchObj, consts.folder.OPEN);
					view.replaceIcoClass(node, icoObj, consts.folder.OPEN);
					if (animateFlag == false || setting.view.expandSpeed == "") {
						ulObj.show();
						tools.apply(callback, []);
					} else {
						if (node[childKey] && node[childKey].length > 0) {
							ulObj.slideDown(setting.view.expandSpeed, callback);
						} else {
							ulObj.show();
							tools.apply(callback, []);
						}
					}
				} else {
					view.replaceSwitchClass(node, switchObj, consts.folder.CLOSE);
					view.replaceIcoClass(node, icoObj, consts.folder.CLOSE);
					if (animateFlag == false || setting.view.expandSpeed == "" || !(node[childKey] && node[childKey].length > 0)) {
						ulObj.hide();
						tools.apply(callback, []);
					} else {
						ulObj.slideUp(setting.view.expandSpeed, callback);
					}
				}
			} else {
				tools.apply(callback, []);
			}
		},
		expandCollapseParentNode: function(setting, node, expandFlag, animateFlag, callback) {
			if (!node) return;
			if (!node.parentTId) {
				view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback);
				return;
			} else {
				view.expandCollapseNode(setting, node, expandFlag, animateFlag);
			}
			if (node.parentTId) {
				view.expandCollapseParentNode(setting, node.getParentNode(), expandFlag, animateFlag, callback);
			}
		},
		expandCollapseSonNode: function(setting, node, expandFlag, animateFlag, callback) {
			var root = data.getRoot(setting),
			childKey = setting.data.key.children,
			treeNodes = (node) ? node[childKey]: root[childKey],
			selfAnimateSign = (node) ? false : animateFlag,
			expandTriggerFlag = data.getRoot(setting).expandTriggerFlag;
			data.getRoot(setting).expandTriggerFlag = false;
			if (treeNodes) {
				for (var i = 0, l = treeNodes.length; i < l; i++) {
					if (treeNodes[i]) view.expandCollapseSonNode(setting, treeNodes[i], expandFlag, selfAnimateSign);
				}
			}
			data.getRoot(setting).expandTriggerFlag = expandTriggerFlag;
			view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback );
		},
		makeDOMNodeIcon: function(html, setting, node) {
			var nameStr = data.getNodeName(setting, node),
			name = setting.view.nameIsHTML ? nameStr : nameStr.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
			html.push("<span id='", node.tId, consts.id.ICON,
				"' title='' treeNode", consts.id.ICON," class='", view.makeNodeIcoClass(setting, node),
				"' style='", view.makeNodeIcoStyle(setting, node), "'></span><span id='", node.tId, consts.id.SPAN,
				"'>",name,"</span>");
		},
		makeDOMNodeLine: function(html, setting, node) {
			html.push("<span id='", node.tId, consts.id.SWITCH,	"' title='' class='", view.makeNodeLineClass(setting, node), "' treeNode", consts.id.SWITCH,"></span>");
		},
		makeDOMNodeMainAfter: function(html, setting, node) {
			html.push("</li>");
		},
		makeDOMNodeMainBefore: function(html, setting, node) {
			html.push("<li id='", node.tId, "' class='level", node.level,"' tabindex='0' hidefocus='true' treenode>");
		},
		makeDOMNodeNameAfter: function(html, setting, node) {
			html.push("</a>");
		},
		makeDOMNodeNameBefore: function(html, setting, node) {
			var title = data.getNodeTitle(setting, node),
			url = view.makeNodeUrl(setting, node),
			fontcss = view.makeNodeFontCss(setting, node),
			fontStyle = [];
			for (var f in fontcss) {
				fontStyle.push(f, ":", fontcss[f], ";");
			}
			html.push("<a id='", node.tId, consts.id.A, "' class='level", node.level,"' treeNode", consts.id.A," onclick=\"", (node.click || ''),
				"\" ", ((url != null && url.length > 0) ? "href='" + url + "'" : ""), " target='",view.makeNodeTarget(node),"' style='", fontStyle.join(''),
				"'");
			if (tools.apply(setting.view.showTitle, [setting.treeId, node], setting.view.showTitle) && title) {html.push("title='", title.replace(/'/g,"&#39;").replace(/</g,'&lt;').replace(/>/g,'&gt;'),"'");}
			html.push(">");
		},
		makeNodeFontCss: function(setting, node) {
			var fontCss = tools.apply(setting.view.fontCss, [setting.treeId, node], setting.view.fontCss);
			return (fontCss && ((typeof fontCss) != "function")) ? fontCss : {};
		},
		makeNodeIcoClass: function(setting, node) {
			var icoCss = ["ico"];
			if (!node.isAjaxing) {
				icoCss[0] = (node.iconSkin ? node.iconSkin + "_" : "") + icoCss[0];
				if (node.isParent) {
					icoCss.push(node.open ? consts.folder.OPEN : consts.folder.CLOSE);
				} else {
					icoCss.push(consts.folder.DOCU);
				}
			}
			return "button " + icoCss.join('_');
		},
		makeNodeIcoStyle: function(setting, node) {
			var icoStyle = [];
			if (!node.isAjaxing) {
				var icon = (node.isParent && node.iconOpen && node.iconClose) ? (node.open ? node.iconOpen : node.iconClose) : node.icon;
				if (icon) icoStyle.push("background:url(", icon, ") 0 0 no-repeat;");
				if (setting.view.showIcon == false || !tools.apply(setting.view.showIcon, [setting.treeId, node], true)) {
					icoStyle.push("width:0px;height:0px;");
				}
			}
			return icoStyle.join('');
		},
		makeNodeLineClass: function(setting, node) {
			var lineClass = [];
			if (setting.view.showLine) {
				if (node.level == 0 && node.isFirstNode && node.isLastNode) {
					lineClass.push(consts.line.ROOT);
				} else if (node.level == 0 && node.isFirstNode) {
					lineClass.push(consts.line.ROOTS);
				} else if (node.isLastNode) {
					lineClass.push(consts.line.BOTTOM);
				} else {
					lineClass.push(consts.line.CENTER);
				}
			} else {
				lineClass.push(consts.line.NOLINE);
			}
			if (node.isParent) {
				lineClass.push(node.open ? consts.folder.OPEN : consts.folder.CLOSE);
			} else {
				lineClass.push(consts.folder.DOCU);
			}
			return view.makeNodeLineClassEx(node) + lineClass.join('_');
		},
		makeNodeLineClassEx: function(node) {
			return "button level" + node.level + " switch ";
		},
		makeNodeTarget: function(node) {
			return (node.target || "_blank");
		},
		makeNodeUrl: function(setting, node) {
			var urlKey = setting.data.key.url;
			return node[urlKey] ? node[urlKey] : null;
		},
		makeUlHtml: function(setting, node, html, content) {
			html.push("<ul id='", node.tId, consts.id.UL, "' class='level", node.level, " ", view.makeUlLineClass(setting, node), "' style='display:", (node.open ? "block": "none"),"'>");
			html.push(content);
			html.push("</ul>");
		},
		makeUlLineClass: function(setting, node) {
			return ((setting.view.showLine && !node.isLastNode) ? consts.line.LINE : "");
		},
		removeChildNodes: function(setting, node) {
			if (!node) return;
			var childKey = setting.data.key.children,
			nodes = node[childKey];
			if (!nodes) return;

			for (var i = 0, l = nodes.length; i < l; i++) {
				data.removeNodeCache(setting, nodes[i]);
			}
			data.removeSelectedNode(setting);
			delete node[childKey];

			if (!setting.data.keep.parent) {
				node.isParent = false;
				node.open = false;
				var tmp_switchObj = $("#" + node.tId + consts.id.SWITCH),
				tmp_icoObj = $("#" + node.tId + consts.id.ICON);
				view.replaceSwitchClass(node, tmp_switchObj, consts.folder.DOCU);
				view.replaceIcoClass(node, tmp_icoObj, consts.folder.DOCU);
				$("#" + node.tId + consts.id.UL).remove();
			} else {
				$("#" + node.tId + consts.id.UL).empty();
			}
		},
                setFirstNode: function(setting, parentNode) {
                    var childKey = setting.data.key.children, childLength = parentNode[childKey].length;
                    if ( childLength > 0) {
                        parentNode[childKey][0].isFirstNode = true;
                    }
                },
                setLastNode: function(setting, parentNode) {
                    var childKey = setting.data.key.children, childLength = parentNode[childKey].length;
                    if ( childLength > 0) {
                        parentNode[childKey][childLength - 1].isLastNode = true;
                    }
                },
		removeNode: function(setting, node) {
			var root = data.getRoot(setting),
			childKey = setting.data.key.children,
			parentNode = (node.parentTId) ? node.getParentNode() : root;

			node.isFirstNode = false;
			node.isLastNode = false;
			node.getPreNode = function() {return null;};
			node.getNextNode = function() {return null;};

			if (!data.getNodeCache(setting, node.tId)) {
				return;
			}
                        
			$("#" + node.tId).remove();
			data.removeNodeCache(setting, node);
			data.removeSelectedNode(setting, node);

			for (var i = 0, l = parentNode[childKey].length; i < l; i++) {
				if (parentNode[childKey][i].tId == node.tId) {
					parentNode[childKey].splice(i, 1);
					break;
				}
			}
			view.setFirstNode(setting, parentNode);
			view.setLastNode(setting, parentNode);
                                                
			var tmp_ulObj,tmp_switchObj,tmp_icoObj,
			childLength = parentNode[childKey].length;

			//repair nodes old parent
			if (!setting.data.keep.parent && childLength == 0) {
				//old parentNode has no child nodes
				parentNode.isParent = false;
				parentNode.open = false;
				tmp_ulObj = $("#" + parentNode.tId + consts.id.UL);
				tmp_switchObj = $("#" + parentNode.tId + consts.id.SWITCH);
				tmp_icoObj = $("#" + parentNode.tId + consts.id.ICON);
				view.replaceSwitchClass(parentNode, tmp_switchObj, consts.folder.DOCU);
				view.replaceIcoClass(parentNode, tmp_icoObj, consts.folder.DOCU);
				tmp_ulObj.css("display", "none");

			} else if (setting.view.showLine && childLength > 0) {
				//old parentNode has child nodes
				var newLast = parentNode[childKey][childLength - 1];
				tmp_ulObj = $("#" + newLast.tId + consts.id.UL);
				tmp_switchObj = $("#" + newLast.tId + consts.id.SWITCH);
				tmp_icoObj = $("#" + newLast.tId + consts.id.ICON);
				if (parentNode == root) {
					if (parentNode[childKey].length == 1) {
						//node was root, and ztree has only one root after move node
						view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.ROOT);
					} else {
						var tmp_first_switchObj = $("#" + parentNode[childKey][0].tId + consts.id.SWITCH);
						view.replaceSwitchClass(parentNode[childKey][0], tmp_first_switchObj, consts.line.ROOTS);
						view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.BOTTOM);
					}
				} else {
					view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.BOTTOM);
				}
				tmp_ulObj.removeClass(consts.line.LINE);
			}
		},
		replaceIcoClass: function(node, obj, newName) {
			if (!obj || node.isAjaxing) return;
			var tmpName = obj.attr("class");
			if (tmpName == undefined) return;
			var tmpList = tmpName.split("_");
			switch (newName) {
				case consts.folder.OPEN:
				case consts.folder.CLOSE:
				case consts.folder.DOCU:
					tmpList[tmpList.length-1] = newName;
					break;
			}
			obj.attr("class", tmpList.join("_"));
		},
		replaceSwitchClass: function(node, obj, newName) {
			if (!obj) return;
			var tmpName = obj.attr("class");
			if (tmpName == undefined) return;
			var tmpList = tmpName.split("_");
			switch (newName) {
				case consts.line.ROOT:
				case consts.line.ROOTS:
				case consts.line.CENTER:
				case consts.line.BOTTOM:
				case consts.line.NOLINE:
					tmpList[0] = view.makeNodeLineClassEx(node) + newName;
					break;
				case consts.folder.OPEN:
				case consts.folder.CLOSE:
				case consts.folder.DOCU:
					tmpList[1] = newName;
					break;
			}
			obj.attr("class", tmpList.join("_"));
			if (newName !== consts.folder.DOCU) {
				obj.removeAttr("disabled");
			} else {
				obj.attr("disabled", "disabled");
			}
		},
		selectNode: function(setting, node, addFlag) {
			if (!addFlag) {
				view.cancelPreSelectedNode(setting);
			}
			$("#" + node.tId + consts.id.A).addClass(consts.node.CURSELECTED);
			data.addSelectedNode(setting, node);
		},
		setNodeFontCss: function(setting, treeNode) {
			var aObj = $("#" + treeNode.tId + consts.id.A),
			fontCss = view.makeNodeFontCss(setting, treeNode);
			if (fontCss) {
				aObj.css(fontCss);
			}
		},
		setNodeLineIcos: function(setting, node) {
			if (!node) return;
			var switchObj = $("#" + node.tId + consts.id.SWITCH),
			ulObj = $("#" + node.tId + consts.id.UL),
			icoObj = $("#" + node.tId + consts.id.ICON),
			ulLine = view.makeUlLineClass(setting, node);
			if (ulLine.length==0) {
				ulObj.removeClass(consts.line.LINE);
			} else {
				ulObj.addClass(ulLine);
			}
			switchObj.attr("class", view.makeNodeLineClass(setting, node));
			if (node.isParent) {
				switchObj.removeAttr("disabled");
			} else {
				switchObj.attr("disabled", "disabled");
			}
			icoObj.removeAttr("style");
			icoObj.attr("style", view.makeNodeIcoStyle(setting, node));
			icoObj.attr("class", view.makeNodeIcoClass(setting, node));
		},
		setNodeName: function(setting, node) {
			var title = data.getNodeTitle(setting, node),
			nObj = $("#" + node.tId + consts.id.SPAN);
			nObj.empty();
			if (setting.view.nameIsHTML) {
				nObj.html(data.getNodeName(setting, node));
			} else {
				nObj.text(data.getNodeName(setting, node));
			}
			if (tools.apply(setting.view.showTitle, [setting.treeId, node], setting.view.showTitle)) {
				var aObj = $("#" + node.tId + consts.id.A);
				aObj.attr("title", !title ? "" : title);
			}
		},
		setNodeTarget: function(node) {
			var aObj = $("#" + node.tId + consts.id.A);
			aObj.attr("target", view.makeNodeTarget(node));
		},
		setNodeUrl: function(setting, node) {
			var aObj = $("#" + node.tId + consts.id.A),
			url = view.makeNodeUrl(setting, node);
			if (url == null || url.length == 0) {
				aObj.removeAttr("href");
			} else {
				aObj.attr("href", url);
			}
		},
		switchNode: function(setting, node) {
			if (node.open || !tools.canAsync(setting, node)) {
				view.expandCollapseNode(setting, node, !node.open);
			} else if (setting.async.enable) {
				if (!view.asyncNode(setting, node)) {
					view.expandCollapseNode(setting, node, !node.open);
					return;
				}
			} else if (node) {
				view.expandCollapseNode(setting, node, !node.open);
			}
		}
	};
	// zTree defind
	$.fn.zTree = {
		consts : _consts,
		_z : {
			tools: tools,
			view: view,
			event: event,
			data: data
		},
		getZTreeObj: function(treeId) {
			var o = data.getZTreeTools(treeId);
			return o ? o : null;
		},
		destroy: function(treeId) {
			if (!!treeId && treeId.length > 0) {
				view.destroy(data.getSetting(treeId));
			} else {
				for(var s in settings) {
					view.destroy(settings[s]);
				}
			}
		},
		init: function(obj, zSetting, zNodes) {
			var setting = tools.clone(_setting);
			$.extend(true, setting, zSetting);
			setting.treeId = obj.attr("id");
			setting.treeObj = obj;
			setting.treeObj.empty();
			settings[setting.treeId] = setting;
			if ($.browser.msie && parseInt($.browser.version)<7) {
				setting.view.expandSpeed = "";
			}

			data.initRoot(setting);
			var root = data.getRoot(setting),
			childKey = setting.data.key.children;
			zNodes = zNodes ? tools.clone(tools.isArray(zNodes)? zNodes : [zNodes]) : [];
			if (setting.data.simpleData.enable) {
				root[childKey] = data.transformTozTreeFormat(setting, zNodes);
			} else {
				root[childKey] = zNodes;
			}

			data.initCache(setting);
			event.unbindTree(setting);
			event.bindTree(setting);
			event.unbindEvent(setting);
			event.bindEvent(setting);
			
			var zTreeTools = {
				setting : setting,
				addNodes : function(parentNode, newNodes, isSilent) {
					if (!newNodes) return null;
					if (!parentNode) parentNode = null;
					if (parentNode && !parentNode.isParent && setting.data.keep.leaf) return null;
					var xNewNodes = tools.clone(tools.isArray(newNodes)? newNodes: [newNodes]);
					function addCallback() {
						view.addNodes(setting, parentNode, xNewNodes, (isSilent==true));
					}

					if (tools.canAsync(setting, parentNode)) {
						view.asyncNode(setting, parentNode, isSilent, addCallback);
					} else {
						addCallback();
					}
					return xNewNodes;
				},
				cancelSelectedNode : function(node) {
					view.cancelPreSelectedNode(this.setting, node);
				},
				destroy : function() {
					view.destroy(this.setting);
				},
				expandAll : function(expandFlag) {
					expandFlag = !!expandFlag;
					view.expandCollapseSonNode(this.setting, null, expandFlag, true);
					return expandFlag;
				},
				expandNode : function(node, expandFlag, sonSign, focus, callbackFlag) {
					if (!node || !node.isParent) return null;
					if (expandFlag !== true && expandFlag !== false) {
						expandFlag = !node.open;
					}
					callbackFlag = !!callbackFlag;

					if (callbackFlag && expandFlag && (tools.apply(setting.callback.beforeExpand, [setting.treeId, node], true) == false)) {
						return null;
					} else if (callbackFlag && !expandFlag && (tools.apply(setting.callback.beforeCollapse, [setting.treeId, node], true) == false)) {
						return null;
					}
					if (expandFlag && node.parentTId) {
						view.expandCollapseParentNode(this.setting, node.getParentNode(), expandFlag, false);
					}
					if (expandFlag === node.open && !sonSign) {
						return null;
					}
					
					data.getRoot(setting).expandTriggerFlag = callbackFlag;
					if (sonSign) {
						view.expandCollapseSonNode(this.setting, node, expandFlag, true, function() {
							if (focus !== false) {$("#" + node.tId).focus().blur();}
						});
					} else {
						node.open = !expandFlag;
						view.switchNode(this.setting, node);
						if (focus !== false) {$("#" + node.tId).focus().blur();}
					}
					return expandFlag;
				},
				getNodes : function() {
					return data.getNodes(this.setting);
				},
				getNodeByParam : function(key, value, parentNode) {
					if (!key) return null;
					return data.getNodeByParam(this.setting, parentNode?parentNode[this.setting.data.key.children]:data.getNodes(this.setting), key, value);
				},
				getNodeByTId : function(tId) {
					return data.getNodeCache(this.setting, tId);
				},
				getNodesByParam : function(key, value, parentNode) {
					if (!key) return null;
					return data.getNodesByParam(this.setting, parentNode?parentNode[this.setting.data.key.children]:data.getNodes(this.setting), key, value);
				},
				getNodesByParamFuzzy : function(key, value, parentNode) {
					if (!key) return null;
					return data.getNodesByParamFuzzy(this.setting, parentNode?parentNode[this.setting.data.key.children]:data.getNodes(this.setting), key, value);
				},
				getNodesByFilter: function(filter, isSingle, parentNode, invokeParam) {
					isSingle = !!isSingle;
					if (!filter || (typeof filter != "function")) return (isSingle ? null : []);
					return data.getNodesByFilter(this.setting, parentNode?parentNode[this.setting.data.key.children]:data.getNodes(this.setting), filter, isSingle, invokeParam);
				},
				getNodeIndex : function(node) {
					if (!node) return null;
					var childKey = setting.data.key.children,
					parentNode = (node.parentTId) ? node.getParentNode() : data.getRoot(this.setting);
					for (var i=0, l = parentNode[childKey].length; i < l; i++) {
						if (parentNode[childKey][i] == node) return i;
					}
					return -1;
				},
				getSelectedNodes : function() {
					var r = [], list = data.getRoot(this.setting).curSelectedList;
					for (var i=0, l=list.length; i<l; i++) {
						r.push(list[i]);
					}
					return r;
				},
				isSelectedNode : function(node) {
					return data.isSelectedNode(this.setting, node);
				},
				reAsyncChildNodes : function(parentNode, reloadType, isSilent) {
					if (!this.setting.async.enable) return;
					var isRoot = !parentNode;
					if (isRoot) {
						parentNode = data.getRoot(this.setting);
					}
					if (reloadType=="refresh") {
						parentNode[this.setting.data.key.children] = [];
						if (isRoot) {
							this.setting.treeObj.empty();
						} else {
							var ulObj = $("#" + parentNode.tId + consts.id.UL);
							ulObj.empty();
						}
					}
					view.asyncNode(this.setting, isRoot? null:parentNode, !!isSilent);
				},
				refresh : function() {
					this.setting.treeObj.empty();
					var root = data.getRoot(this.setting),
					nodes = root[this.setting.data.key.children]
					data.initRoot(this.setting);
					root[this.setting.data.key.children] = nodes
					data.initCache(this.setting);
					view.createNodes(this.setting, 0, root[this.setting.data.key.children]);
				},
				removeChildNodes : function(node) {
					if (!node) return null;
					var childKey = setting.data.key.children,
					nodes = node[childKey];
					view.removeChildNodes(setting, node);
					return nodes ? nodes : null;
				},
				removeNode : function(node, callbackFlag) {
					if (!node) return;
					callbackFlag = !!callbackFlag;
					if (callbackFlag && tools.apply(setting.callback.beforeRemove, [setting.treeId, node], true) == false) return;
					view.removeNode(setting, node);
					if (callbackFlag) {
						this.setting.treeObj.trigger(consts.event.REMOVE, [setting.treeId, node]);
					}
				},
				selectNode : function(node, addFlag) {
					if (!node) return;
					if (tools.uCanDo(this.setting)) {
						addFlag = setting.view.selectedMulti && addFlag;
						if (node.parentTId) {
							view.expandCollapseParentNode(this.setting, node.getParentNode(), true, false, function() {
								$("#" + node.tId).focus().blur();
							});
						} else {
							$("#" + node.tId).focus().blur();
						}
						view.selectNode(this.setting, node, addFlag);
					}
				},
				transformTozTreeNodes : function(simpleNodes) {
					return data.transformTozTreeFormat(this.setting, simpleNodes);
				},
				transformToArray : function(nodes) {
					return data.transformToArrayFormat(this.setting, nodes);
				},
				updateNode : function(node, checkTypeFlag) {
					if (!node) return;
					var nObj = $("#" + node.tId);
					if (nObj.get(0) && tools.uCanDo(this.setting)) {
						view.setNodeName(this.setting, node);
						view.setNodeTarget(node);
						view.setNodeUrl(this.setting, node);
						view.setNodeLineIcos(this.setting, node);
						view.setNodeFontCss(this.setting, node);
					}
				}
			}
			root.treeTools = zTreeTools;
			data.setZTreeTools(setting, zTreeTools);

			if (root[childKey] && root[childKey].length > 0) {
				view.createNodes(setting, 0, root[childKey]);
			} else if (setting.async.enable && setting.async.url && setting.async.url !== '') {
				view.asyncNode(setting);
			}
			return zTreeTools;
		}
	};

	var zt = $.fn.zTree,
	consts = zt.consts;
})(jQuery);
/**
* jQuery ligerUI 1.1.9
*  
* Author daomi 2012 [ gd_star@163.com ] 
* 
*/
eval(function(E,I,A,D,J,K,L,H){function C(A){return A<62?String.fromCharCode(A+=A<26?65:A<52?71:-4):A<63?'_':A<64?'$':C(A>>6)+C(A&63)}while(A>0)K[C(D--)]=I[--A];function N(A){return K[A]==L[A]?A:K[A]}if(''.replace(/^/,String)){var M=E.match(J),B=M[0],F=E.split(J),G=0;if(E.indexOf(F[0]))F=[''].concat(F);do{H[A++]=F[G++];H[A++]=N(B)}while(B=M[G]);H[A++]=F[G]||'';return H.join('')}return E.replace(J,N)}('(5(Q){OB.CQ.DA=5(B,A){R(BO B!="5")s b;b.CW=B.CQ;b.CW.Cw=B;V P=5(){};P.CQ=B.CQ;b.CQ=DT P();b.CQ.Cw=b;R(A)Q.CV(b.CQ,A)};OB.CQ.Gf=5(A,Q,P){V B=b;s Ow(5(){B.E3(A,P||[])},Q)};w.CZ=Q.2={version:"V1.O.Lt",OO:N,GC:{},Ra:"2",Eb:{U_:"\\u7ba1\\u7406\\u5668id\\Sk\\Tq\\OL\\NL"},ML:5(P){P=P||b.Ra;V Q=P+(VW+b.OO);b.OO++;s Q},Cn:5(Q){R(B6.v==Bl){V P=B6[O];P.U=P.U||P.1.U||B6[N].U;b.addManager(P);s}R(!Q.U)Q.U=b.ML(Q.DH());R(b.GC[Q.U])throw DT Error(b.Eb.U_);b.GC[Q.U]=Q},Bm:5(P){R(BO P=="CJ"||BO P=="EC")Cy Q.2.GC[P];c R(BO P=="Dv"&&P Ho Q.2.Cm.Lp)Cy Q.2.GC[P.U]},Dd:5(P,A){A=A||"L6";R(BO P=="CJ"||BO P=="EC")s Q.2.GC[P];c R(BO P=="Dv"&&P.v){R(!P[N][A]&&!Q(P[N]).j(A))s e;s Q.2.GC[P[N][A]||Q(P[N]).j(A)]}s e},B8:5(C){V B=[];a(V P Bf b.GC){V A=b.GC[P];R(C Ho OB){R(A Ho C)B.d(A)}c R(C Ho Hh){R(Q.DI(A.Ci(),C)!=-O)B.d(A)}c R(A.Ci()==C)B.d(A)}s B},CH:5(E,B,D){R(!E)s;D=Q.CV({Lm:"BR",methodsNamespace:"ligerMethods",Mw:"8",FV:"L6",Id:o,Jf:f,Ie:e},D||{});E=E.EH(/^ligerGet/,"");E=E.EH(/^CZ/,"");R(b==e||b==w||D.Id){R(!Q.2.K_[E])Q.2.K_[E]={Br:Q["CZ"+E],Id:f};s DT Q.2[D.Mw][E](Q.CV({},Q[D.Lm][E]||{},Q[D.Lm][E+"Qy"]||{},B.v>N?B[N]:{}))}R(!Q.2.K_[E])Q.2.K_[E]={Br:Q.Br["CZ"+E],Id:o};R(/Manager$/.GI(E))s Q.2.Dd(b,D.FV);b.BE(5(){R(b[D.FV]||Q(b).j(D.FV)){V P=Q.2.Dd(b[D.FV]||Q(b).j(D.FV));R(P&&B.v>N)P.BZ(B[N]);s}R(B.v>=O&&BO B[N]=="CJ")s;V C=B.v>N?B[N]:e,A=Q.CV({},Q[D.Lm][E]||{},Q[D.Lm][E+"Qy"]||{},C||{});R(D.Ie)A[D.Ie]=b;R(D.Jf)DT Q.2[D.Mw][E](b,A);c DT Q.2[D.Mw][E](A)});R(b.v==N)s e;R(B.v==N)s Q.2.Dd(b,D.FV);R(BO B[N]=="Dv")s Q.2.Dd(b,D.FV);R(BO B[N]=="CJ"){V A=Q.2.Dd(b,D.FV);R(A==e)s;R(B[N]=="Cz"){R(B.v==Bl)s A.Dd(B[O]);c R(B.v>=Dw)s A.BZ(B[O],B[Bl])}c{V C=B[N];R(!A[C])s;V P=Hh.E3(e,B);P.shift();s A[C].E3(A,P)}}s e},Si:{},R9:{},Cm:{},8:{},K_:{}};Q.BR={};Q.CM={};Q.2.Si=Q.BR;Q.2.R9=Q.CM;Q.Br.CZ=5(P){R(P)s Q.2.CH.BD(b,P,B6);c s Q.2.Dd(b)};Q.2.Cm.Lp=5(Q){b.HN=b.HN||{};b.1=Q||{};b.CD={}};Q.CV(Q.2.Cm.Lp.CQ,{Ci:5(){s"Q.2.Cm.Lp"},DH:5(){s"2"},BZ:5(P,C){R(!P)s;R(BO P=="Dv"){V D;R(b.1!=P){Q.CV(b.1,P);D=P}c D=Q.CV({},P);R(C==CG||C==f)a(V B Bf D)R(B.EG("P$")==N)b.BZ(B,D[B]);R(C==CG||C==o)a(B Bf D)R(B.EG("P$")!=N)b.BZ(B,D[B]);s}V A=P;R(A.EG("P$")==N){R(BO C=="5")b.B3(A.FN(Bl),C);s}b.3("propertychange",P,C);R(!b.1)b.1={};b.1[A]=C;V E="_set"+A.FN(N,O).Qx()+A.FN(O);R(b[E])b[E].BD(b,C);b.3("propertychanged",P,C)},Dd:5(Q){V P="_get"+Q.FN(N,O).Qx()+Q.FN(O);R(b[P])s b[P].BD(b,Q);s b.1[Q]},GD:5(Q){V A=Q.DB(),P=b.HN[A];R(P&&P.v)s f;s o},3:5(Q,C){V B=Q.DB(),A=b.HN[B];R(!A)s;C=C||[];R((C Ho Hh)==o)C=[C];a(V D=N;D<A.v;D++){V P=A[D];R(P.En.E3(P.Vo,C)==o)s o}},B3:5(Q,D,C){R(BO Q=="Dv"){a(V B Bf Q)b.B3(B,Q[B]);s}R(BO D!="5")s o;V A=Q.DB(),P=b.HN[A]||[];C=C||b;P.d({En:D,Vo:C});b.HN[A]=P},DJ:5(Q,D){R(!Q){b.HN={};s}V A=Q.DB(),P=b.HN[A];R(!P||!P.v)s;R(!D)Cy b.HN[A];c a(V C=N,B=P.v;C<B;C++)R(P[C].En==D){P.FZ(C,O);Dl}},C0:5(){Q.2.Bm(b)}});Q.2.Cm.Dh=5(P,B){Q.2.Cm.Dh.CW.Cw.BD(b,B);V A=b.Dr();R(A)Q.CV(b,A);b.Bi=P;b.Ei();b.Rc();b.3("FQ");b.DG();b.3("rendered");b.MD()};Q.2.Cm.Dh.DA(Q.2.Cm.Lp,{Ci:5(){s"Q.2.Cm.Dh"},Dr:5(){},Ei:5(){b.l=b.Ci();R(!b.Bi)b.U=b.1.U||Q.2.ML(b.DH());c b.U=b.1.U||b.Bi.U||Q.2.ML(b.DH());Q.2.Cn(b);R(!b.Bi)s;V KU=b.j();R(KU&&KU Ho Hh)a(V Er=N;Er<KU.v;Er++){V Bt=KU[Er];b.1[Bt]=Q(b.Bi).j(Bt)}V DU=b.1;R(Q(b.Bi).j("2")){VB{V Hx=Q(b.Bi).j("2");R(Hx.EG("{")!=N)Hx="{"+Hx+"}";Sj("Hx = "+Hx+";");R(Hx)Q.CV(DU,Hx)}VP(IJ){}}},Rc:5(){},DG:5(){},MD:5(){R(b.Bi)Q(b.Bi).j("L6",b.U)},j:5(){s[]},C0:5(){R(b.Bi)Q(b.Bi).Bm();b.1=e;Q.2.Bm(b)}});Q.2.8.F4=5(P,A){Q.2.8.F4.CW.Cw.BD(b,P,A)};Q.2.8.F4.DA(Q.2.Cm.Dh,{Ci:5(){s"Q.2.8.F4"},j:5(){s["J3"]},EL:5(Q){s b.BZ("BP",Q)},ER:5(){s b.Dd("BP")},IS:5(){s b.BZ("_",o)},IP:5(){s b.BZ("_",f)},IO:5(){}});Q.2.Cd={X:o,Fy:5(A){5 P(){R(!Q.2.Cd.Ij)s;V P=Q(w).t()+Q(w).F8();Q.2.Cd.Ij.t(P)}R(!b.Ij){b.Ij=Q("<W p=\'M-w-Fy\' B7=\'CY: M7;\'></W>").Ch("m");Q(w).B3("C8.ligeruiwin",P);Q(w).B3("Kb",P)}b.Ij.BT();P();b.O3=f},GS:5(C){V P=Q("m > .M-u:E9,m > .M-w:E9");a(V F=N,B=P.v;F<B;F++){V A=P.HK(F).j("L6");R(C&&C.U==A)EP;V D=Q.2.Dd(A);R(!D)EP;V E=D.Dd("Jq");R(E)s}R(b.Ij)b.Ij.BK();b.O3=o},Qz:5(){R(!b.Ca){b.Ca=Q("<W p=\\"M-Ca\\"><W p=\\"M-Ca-EB\\"></W><W p=\\"M-F9\\"></W></W>").Ch("m");R(b.X)b.Ca.6("M-Ca-X");b.Ca.EB=Q(".M-Ca-EB:r",b.Ca);b.EB={}}b.Ca.BT();b.Ca.CT({Bv:N});s b.Ca},T5:5(){V Q=b;Q.Ca.CT({Bv:-Ot},5(){Q.Ca.Bm();Q.Ca=e})},MF:5(A){a(V P Bf b.EB){V Q=b.EB[P];R(P==A.U)Q.6("M-Ca-I2-Gr");c Q.$("M-Ca-I2-Gr")}},Um:5(P){V Q=b;R(!Q.Ca)s;R(Q.EB[P.U])s Q.EB[P.U];s e},Pz:5(C){V B=b;R(!B.Ca)B.Qz();R(B.EB[C.U])s B.EB[C.U];V P=C.Dd("CK"),A=B.EB[C.U]=Q("<W p=\\"M-Ca-I2\\"><W p=\\"M-Ca-I2-CO\\"></W><W p=\\"M-Ca-I2-4\\">"+P+"</W></W>");B.Ca.EB.BH(A);B.MF(C);A.B3("BX",5(){B.MF(C);R(C.Lf)C.FW();c C.Gr()}).B2(5(){Q(b).6("M-Ca-I2-BB")},5(){Q(b).$("M-Ca-I2-BB")});s A},TZ:5(){a(V Q Bf b.EB)R(b.EB[Q])s f;s o},MG:5(P){V Q=b;R(!Q.Ca)s;R(Q.EB[P.U]){Q.EB[P.U].DJ();Q.EB[P.U].Bm();Cy Q.EB[P.U]}R(!Q.TZ())Q.T5()},Io:5(A){V C=Q.2.B8(Q.2.Cm.IV);a(V B Bf C){V P=C[B];R(P==A){Q(P.Bi).Y("Qu-DP","9200");b.MF(P)}c Q(P.Bi).Y("Qu-DP","9100")}}};Q.2.Cm.IV=5(P,A){Q.2.Cm.IV.CW.Cw.BD(b,P,A)};Q.2.Cm.IV.DA(Q.2.Cm.Dh,{Ci:5(){s"Q.2.8.IV"},Fy:5(){R(b.1.Jq)Q.2.Cd.Fy(b)},GS:5(){R(b.1.Jq)Q.2.Cd.GS(b)},FW:5(){},Ew:5(){},Gr:5(){}});Q.2.Fb={Gk:o};Q.2.Ds={reszing:o};Q.2.GW=BO QI==="Dv"&&QI.VX?QI.VX:5(F){V A=5(Q){s Q<Cs?"N"+Q:Q},E=/[\\\\\\"\\x00-\\x1f\\x7f-\\x9f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]/Ly,C=5(Q){E.lastIndex=N;s E.GI(Q)?"\\""+Q.EH(E,5(P){V Q=meta[P];s BO Q==="CJ"?Q:"\\\\Vs"+("0000"+P.charCodeAt(N).Ej(16)).slice(-C3)})+"\\"":"\\""+Q+"\\""};R(F===e)s"e";V H=BO F;R(H==="CG")s CG;R(H==="CJ")s C(F);R(H==="EC"||H==="MB")s""+F;R(H==="Dv"){R(BO F.GW==="5")s Q.2.GW(F.GW());R(F.Cw===EM)s isFinite(b.valueOf())?b.getUTCFullYear()+"-"+A(b.getUTCMonth()+O)+"-"+A(b.getUTCDate())+"E2"+A(b.getUTCHours())+":"+A(b.getUTCMinutes())+":"+A(b.getUTCSeconds())+"Vq":e;V B=[];R(F.Cw===Hh){a(V J=N,G=F.v;J<G;J++)B.d(Q.2.GW(F[J])||"e");s"["+B.DC(",")+"]"}V D,P;a(V I Bf F){H=BO I;R(H==="EC")D="\\""+I+"\\"";c R(H==="CJ")D=C(I);c EP;H=BO F[I];R(H==="5"||H==="CG")EP;P=Q.2.GW(F[I]);B.d(D+":"+P)}s"{"+B.DC(",")+"}"}}})(DM);(5(Q){Q.Br.R_=5(P){s Q.2.CH.BD(b,"R_",B6)};Q.Br.ligerGetAccordionManager=5(){s Q.2.Dd(b)};Q.BR.H9={t:e,NK:"normal",Ml:o,Fa:N};Q.CM.H9={};Q.2.8.H9=5(P,A){Q.2.8.H9.CW.Cw.BD(b,P,A)};Q.2.8.H9.DA(Q.2.Cm.Dh,{Ci:5(){s"H9"},DH:5(){s"H9"},Dr:5(){s Q.CM.H9},DG:5(){V P=b,B=b.1;P.Bk=Q(P.Bi);R(!P.Bk.BF("M-Bk-CS"))P.Bk.6("M-Bk-CS");V A=N;R(Q("> W[Jx=f]",P.Bk).v>N)A=Q("> W",P.Bk).DP(Q("> W[Jx=f]",P.Bk));Q("> W",P.Bk).BE(5(C,P){V B=Q("<W p=\\"M-Bk-x\\"><W p=\\"M-Bk-BV\\"></W><W p=\\"M-Bk-x-B$\\"></W></W>");R(C==A)Q(".M-Bk-BV",B).6("M-Bk-BV-CP");R(Q(P).j("CK")){Q(".M-Bk-x-B$",B).BN(Q(P).j("CK"));Q(P).j("CK","")}Q(P).IY(B);R(!Q(P).BF("M-Bk-4"))Q(P).6("M-Bk-4")});Q(".M-Bk-BV",P.Bk).BE(5(){R(!Q(b).BF("M-Bk-BV-CP")&&!Q(b).BF("M-Bk-BV-BM"))Q(b).6("M-Bk-BV-BM");R(Q(b).BF("M-Bk-BV-BM"))Q(b).0().Ev(".M-Bk-4:E9").BK()});Q(".M-Bk-x",P.Bk).B2(5(){Q(b).6("M-Bk-x-BB")},5(){Q(b).$("M-Bk-x-BB")});Q(".M-Bk-BV",P.Bk).B2(5(){R(Q(b).BF("M-Bk-BV-CP"))Q(b).6("M-Bk-BV-CP-BB");c R(Q(b).BF("M-Bk-BV-BM"))Q(b).6("M-Bk-BV-BM-BB")},5(){R(Q(b).BF("M-Bk-BV-CP"))Q(b).$("M-Bk-BV-CP-BB");c R(Q(b).BF("M-Bk-BV-BM"))Q(b).$("M-Bk-BV-BM-BB")});Q(">.M-Bk-x",P.Bk).BX(5(){V P=Q(".M-Bk-BV:r",b);R(P.BF("M-Bk-BV-BM")){P.$("M-Bk-BV-BM").$("M-Bk-BV-BM-BB M-Bk-BV-CP-BB");P.6("M-Bk-BV-CP");Q(b).Ev(".M-Bk-4").BT(B.NK).Gd(".M-Bk-4:E9").BK(B.NK);Q(b).Gd(".M-Bk-x").B8(".M-Bk-BV").$("M-Bk-BV-CP").6("M-Bk-BV-BM")}c{P.$("M-Bk-BV-CP").$("M-Bk-BV-BM-BB M-Bk-BV-CP-BB").6("M-Bk-BV-BM");Q(b).Ev(".M-Bk-4").BK(B.NK)}});P.Ni=N;Q("> .M-Bk-x",P.Bk).BE(5(){P.Ni+=Q(b).t()});R(B.t&&BO(B.t)=="CJ"&&B.t.EG("%")>N){P.H5();R(B.Ml)Q(w).C8(5(){P.H5()})}c R(B.t){P.t=B.Fa+B.t;P.Bk.t(P.t);P.I1(B.t)}c P.x=P.Bk.t();P.BZ(B)},H5:5(){V P=b,A=b.1;R(!A.t||BO(A.t)!="CJ"||A.t.EG("%")==-O)s o;R(P.Bk.0()[N].Dk.DB()=="m"){V B=Q(w).t();B-=7(P.z.0().Y("KG"));B-=7(P.z.0().Y("Fh"));P.t=A.Fa+B*Dj(P.t)*N.G5}c P.t=A.Fa+(P.Bk.0().t()*Dj(A.t)*N.G5);P.Bk.t(P.t);P.Lr(P.t-P.Ni)},I1:5(A){V P=b,B=b.1;P.Bk.t(A);A-=P.Ni;Q("> .M-Bk-4",P.Bk).t(A)}})})(DM);(5(Q){Q.Br.Va=5(P){s Q.2.CH.BD(b,"Va",B6)};Q.Br.UL=5(){s Q.2.CH.BD(b,"UL",B6)};Q.BR.G6={q:GY,i:"G6",_:o};Q.CM.G6={};Q.2.8.G6=5(P,A){Q.2.8.G6.CW.Cw.BD(b,P,A)};Q.2.8.G6.DA(Q.2.8.F4,{Ci:5(){s"G6"},DH:5(){s"G6"},Dr:5(){s Q.CM.G6},DG:5(){V P=b,A=b.1;P.Cb=Q(P.Bi);P.Cb.6("M-CA");P.Cb.BH("<W p=\\"M-CA-M\\"></W><W p=\\"M-CA-FY\\"></W><BG></BG>");A.BX&&P.Cb.BX(5(){R(!A._)A.BX()});P.BZ(A)},_setEnabled:5(Q){R(Q)b.Cb.$("M-CA-_")},Lo:5(Q){R(Q){b.Cb.6("M-CA-_");b.1._=f}},G0:5(Q){b.Cb.q(Q)},_setText:5(P){Q("BG",b.Cb).BN(P)},EL:5(Q){b.BZ("i",Q)},ER:5(){s b.1.i},IS:5(){b.BZ("_",o)},IP:5(){b.BZ("_",f)}})})(DM);(5(Q){Q.Br.Gh=5(P){s Q.2.CH.BD(b,"Gh",B6)};Q.Br.O4=5(){s Q.2.CH.BD(b,"O4",B6)};Q.BR.H4={_:o};Q.CM.H4={};Q.2.8.H4=5(P,A){Q.2.8.H4.CW.Cw.BD(b,P,A)};Q.2.8.H4.DA(Q.2.8.F4,{Ci:5(){s"H4"},DH:5(){s"H4"},Dr:5(){s Q.CM.H4},DG:5(){V P=b,A=b.1;P.BS=Q(P.Bi);P.Bx=Q("<DS p=\\"M-9\\"></DS>");P.Bh=P.BS.6("M-G4").Ec("<W p=\\"M-9-Bh\\"></W>").0();P.Bh.E_(P.Bx);P.Bx.BX(5(){R(P.BS.j("_"))s o;R(A._)s o;R(P.3("beforeClick",[P.Bi])==o)s o;R(Q(b).BF("M-9-Bp"))P.Ib(o);c P.Ib(f);P.BS.3("Dp")});P.Bh.B2(5(){R(!A._)Q(b).6("M-BB")},5(){Q(b).$("M-BB")});b.BZ(A);b.IO()},_setCss:5(Q){b.Bh.Y(Q)},Ib:5(A){V Q=b,P=b.1;R(!A){Q.BS[N].Bp=o;Q.Bx.$("M-9-Bp")}c{Q.BS[N].Bp=f;Q.Bx.6("M-9-Bp")}},Lo:5(Q){R(Q){b.BS.j("_",f);b.Bh.6("M-_")}c{b.BS.j("_",o);b.Bh.$("M-_")}},LL:5(){s b.Bi.Bp},IO:5(){R(b.BS.j("_")){b.Bh.6("M-_");b.1._=f}R(b.BS[N].Bp)b.Bx.6("M-9-Bp");c b.Bx.$("M-9-Bp")}})})(DM);(5(Q){Q.Br.Hs=5(P){s Q.2.CH.BD(b,"Hs",B6)};Q.Br.Qh=5(){s Q.2.CH.BD(b,"Qh",B6)};Q.BR.FB={C8:f,Kh:o,GJ:o,Be:o,OY:o,LH:o,Oe:o,onSelected:e,Gv:e,Jb:e,Cj:"U",Fm:"i",LM:e,Co:f,C7:";",n:e,k:e,Oy:f,g:e,Ke:e,MV:e,QQ:f,CU:e,Oa:e,Nu:e,onBeforeOpen:e,FQ:e,GL:f};Q.CM.FB=Q.CM.FB||{};Q.2.8.FB=5(P,A){Q.2.8.FB.CW.Cw.BD(b,P,A)};Q.2.8.FB.DA(Q.2.8.F4,{Ci:5(){s"FB"},Dr:5(){s Q.CM.FB},Ei:5(){Q.2.8.FB.CW.Ei.BD(b);V P=b.1;R(P.Be)P.GJ=f;R(P.Kh)P.GJ=f},DG:5(){V P=b,A=b.1;P.n=A.n;P.BL=e;P.By=e;P.Fp="";P.LM="";P.Cj=e;R(b.Bi.Dk.DB()=="BS"){b.Bi.readOnly=f;P.BL=Q(b.Bi);P.Fp=b.Bi.U}c R(b.Bi.Dk.DB()=="By"){Q(b.Bi).BK();P.By=Q(b.Bi);A.Kh=o;A.GJ=o;P.Fp=b.Bi.U+"_txt";P.BL=Q("<BS l=\\"i\\" Fz=\\"f\\"/>");P.BL.j("U",P.Fp).Vl(Q(b.Bi))}c s;R(P.BL[N].Bt==CG)P.BL[N].Bt=P.Fp;P.Cj=e;R(A.LM){P.Cj=Q("#"+A.LM+":BS");R(P.Cj.v==N)P.Cj=Q("<BS l=\\"G4\\"/>");P.Cj[N].U=P.Cj[N].Bt=A.LM}c{P.Cj=Q("<BS l=\\"G4\\"/>");P.Cj[N].U=P.Cj[N].Bt=P.Fp+"_val"}R(P.Cj[N].Bt==CG)P.Cj[N].Bt=P.Cj[N].U;P.Bx=Q("<W p=\\"M-3\\"><W p=\\"M-3-CO\\"></W></W>");P.BW=Q("<W p=\\"M-BQ-By\\"><W p=\\"M-BQ-By-B$\\"><Bz IA=\\"N\\" HZ=\\"N\\" KV=\\"N\\" p=\\"M-BQ-By-Bz\\"></Bz></W></W>");P.BW.Bz=Q("Bz:r",P.BW);P.Bh=P.BL.Ec("<W p=\\"M-i M-i-NM\\"></W>").0();P.Bh.BH("<W p=\\"M-i-M\\"></W><W p=\\"M-i-FY\\"></W>");P.Bh.BH(P.Bx);P.ES=P.Bh.Ec("<W p=\\"M-i-Bh\\"></W>").0();R(A.GL)P.BW.Ch("m").6("M-BQ-By-GL");c P.ES.BH(P.BW);P.ES.BH(P.Cj);P.BL.6("M-i-FE");R(A.GJ&&!P.By)Q("Bz",P.BW).6("M-Bz-9");c{A.GJ=o;Q("Bz",P.BW).6("M-Bz-K1")}P.Bx.B2(5(){R(A._)s;b.GV="M-3-B2"},5(){R(A._)s;b.GV="M-3"}).Fv(5(){R(A._)s;b.GV="M-3-TA"}).F0(5(){R(A._)s;b.GV="M-3-B2"}).BX(5(){R(A._)s;R(P.3("Uj")==o)s o;P.NG(P.BW.El(":E9"))});P.BL.BX(5(){R(A._)s;R(P.3("Uj")==o)s o;P.NG(P.BW.El(":E9"))}).KI(5(){R(A._)s;P.Bh.$("M-i-ET")}).ET(5(){R(A._)s;P.Bh.6("M-i-ET")});P.Bh.B2(5(){R(A._)s;P.Bh.6("M-i-BB")},5(){R(A._)s;P.Bh.$("M-i-BB")});P.Md=o;P.BW.B2(e,5(Q){R(A.QQ&&P.BW.El(":E9")&&!P.Hn&&!P.Md)P.NG(f)});V B=Q("Bd",P.BW.Bz).v;R(!A.LH&&B<Lu)A.LH=B*Hj;R(A.LH)P.BW.t(A.LH);P.E7();P.BZ(A);R(A.OY)P.BW.q(A.OY);c P.BW.Y("q",P.Bh.Y("q"))},C0:5(){R(b.Bh)b.Bh.Bm();R(b.BW)b.BW.Bm();b.1=e;Q.2.Bm(b)},Lo:5(Q){R(Q)b.Bh.6("M-i-_");c b.Bh.$("M-i-_")},_setLable:5(B){V P=b,A=b.1;R(B){R(P.C2)P.C2.B8(".M-i-Da:r").BN(B+":&Ex");c{P.C2=P.ES.Ec("<W p=\\"M-N$\\"></W>").0();P.C2.E_("<W p=\\"M-i-Da\\" B7=\\"D1:h;CY:Lx;\\">"+B+":&Ex</W>");P.ES.Y("D1","h")}R(!A.EW)A.EW=Q(".M-i-Da",P.C2).IU();c Q(".M-i-Da",P.C2).IU(A.EW);Q(".M-i-Da",P.C2).q(A.EW);Q(".M-i-Da",P.C2).t(P.Bh.t());P.C2.BH("<NH B7=\\"F9:Ox;\\" />");R(A.HA)Q(".M-i-Da",P.C2).Y("i-Bn",A.HA);P.ES.Y({CY:"Lx"});P.C2.q(P.Bh.IU()+A.EW+Bl)}},G0:5(P){V Q=b;R(P>FL){Q.Bh.Y({q:P});Q.BL.Y({q:P-FL});Q.ES.Y({q:P})}},Gt:5(P){V Q=b;R(P>Cs){Q.Bh.t(P);Q.BL.t(P-Bl);Q.Bx.t(P-C3);Q.ES.Y({q:P})}},_setResize:5(A){R(A&&Q.Br.Gm){V P=b;P.BW.Gm({KM:"Ll,IM,IJ",Ke:5(){P.Md=f;P.3("Tp")},MV:5(){P.Md=o;R(P.3("NP")==o)s o}});P.BW.BH("<W p=\'M-CA-I_-Bq\'></W>")}},M6:5(D){V A=b,C=b.1;R(D==CG)s"";V P="",B=5(Q){V P=D.Ej().C7(C.C7);a(V A=N;A<P.v;A++)R(P[A]==Q)s f;s o};Q(A.n).BE(5(E,A){V Q=A[C.Cj],D=A[C.Fm];R(B(Q))P+=D+C.C7});R(P.v>N)P=P.FN(N,P.v-O);s P},Tf:5(A){V P=b,D=b.1;R(!A&&A=="")s"";V C=5(Q){V P=A.Ej().C7(D.C7);a(V B=N;B<P.v;B++)R(P[B]==Q)s f;s o},B="";Q(P.n).BE(5(E,P){V Q=P[D.Cj],A=P[D.Fm];R(C(A))B+=Q+D.C7});R(B.v>N)B=B.FN(N,B.v-O);s B},Ru:5(){},insertItem:5(){},Hq:5(){},Ib:5(D){V P=b,C=b.1,A=P.M6(D);R(C.k)P.K0(D);c R(!C.Kh){P.Ea(D,A);Q("Bd[BP="+D+"] T",P.BW).6("M-BC");Q("Bd[BP!="+D+"] T",P.BW).$("M-BC")}c{P.Ea(D,A);V B=D.Ej().C7(C.C7);Q("Bz.M-Bz-9 :9",P.BW).BE(5(){b.Bp=o});a(V E=N;E<B.v;E++)Q("Bz.M-Bz-9 Bd[BP="+B[E]+"] :9",P.BW).BE(5(){b.Bp=f})}},Rj:5(Q){b.Ib(Q)},E7:5(){V P=b,A=b.1;b.J4();R(P.By)P.SH();c R(P.n)P.Jt(P.n);c R(A.k)P.Rg(A.k);c R(A.g)P.VS(A.g);c R(A.CU)Q.Nt({l:"Ps",CU:A.CU,cache:o,GQ:"OI",FU:5(Q){P.n=Q;P.Jt(P.n);P.3("FU",[P.n])},Eb:5(A,Q){P.3("Eb",[A,Q])}})},J4:5(){V P=b,A=b.1;Q("Bz",P.BW).BN("")},SH:5(){V P=b,A=b.1;b.J4();Q("Cz",P.By).BE(5(D){V A=Q(b).Bj(),C=Q(b).BN(),B=Q("<Bd><T DP=\'"+D+"\' BP=\'"+A+"\'>"+C+"</T>");Q("Bz.M-Bz-K1",P.BW).BH(B);Q("T",B).B2(5(){Q(b).6("M-BB")},5(){Q(b).$("M-BB")})});Q("T:HK("+P.By[N].Ik+")",P.BW).BE(5(){R(Q(b).BF("M-BC")){P.BW.BK();s}Q(".M-BC",P.BW).$("M-BC");Q(b).6("M-BC");R(P.By[N].Ik!=Q(b).j("DP")&&P.By[N].TJ){P.By[N].Ik=Q(b).j("DP");P.By[N].TJ()}V D=7(Q(b).j("DP"));P.By[N].Ik=D;P.By.3("Dp");P.BW.BK();V C=Q(b).j("BP"),B=Q(b).BN();R(A.FQ)P.BL.Bj(A.FQ(C,B));c P.BL.Bj(B)});P.QE()},Jt:5(E){V A=b,D=b.1;b.J4();R(!E||!E.v)s;R(A.n!=E)A.n=E;R(D.Be){A.BW.Bz.Me=Q("<Bd p=\'M-Bz-headerow\'><T q=\'Po\'></T></Bd>");A.BW.Bz.BH(A.BW.Bz.Me);A.BW.Bz.6("M-BQ-By-g");a(V F=N;F<D.Be.v;F++){V B=Q("<T Fw=\'"+F+"\' Gw=\'"+D.Be[F].Bt+"\'>"+D.Be[F].x+"</T>");R(D.Be[F].q)B.q(D.Be[F].q);A.BW.Bz.Me.BH(B)}}a(V H=N;H<E.v;H++){V P=E[H][D.Cj],G=E[H][D.Fm];R(!D.Be){Q("Bz.M-Bz-9",A.BW).BH("<Bd BP=\'"+P+"\'><T B7=\'q:Po;\'  DP=\'"+H+"\' BP=\'"+P+"\' i=\'"+G+"\' ><BS l=\'9\' /></T><T DP=\'"+H+"\' BP=\'"+P+"\' Bn=\'h\'>"+G+"</T>");Q("Bz.M-Bz-K1",A.BW).BH("<Bd BP=\'"+P+"\'><T DP=\'"+H+"\' BP=\'"+P+"\' Bn=\'h\'>"+G+"</T>")}c{V C=Q("<Bd BP=\'"+P+"\'><T B7=\'q:Po;\'  DP=\'"+H+"\' BP=\'"+P+"\' i=\'"+G+"\' ><BS l=\'9\' /></T></Bd>");Q("T",A.BW.Bz.Me).BE(5(){V P=Q(b).j("Gw");R(P){V A=Q("<T>"+E[H][P]+"</T>");C.BH(A)}});A.BW.Bz.BH(C)}}R(D.GJ&&Q.Br.Gh)Q("Bz BS:9",A.BW).Gh();Q(".M-Bz-9 BS:9",A.BW).Dp(5(){R(b.Bp&&A.GD("KX")){V P=e;R(Q(b).0().Dd(N).Dk.DB()=="W")P=Q(b).0().0();c P=Q(b).0();R(P!=e&&A.3("KX",[P.j("BP"),P.j("i")])==o){A.BW.Dy("D3");s o}}R(!D.Kh)R(b.Bp){Q("BS:Bp",A.BW).JX(b).BE(5(){b.Bp=o;Q(".M-9-Bp",Q(b).0()).$("M-9-Bp")});A.BW.Dy("D3")}A.Vn()});Q("Bz.M-Bz-K1 T",A.BW).B2(5(){Q(b).6("M-BB")},5(){Q(b).$("M-BB")});A.QE();A.Pl()},Rg:5(A){V P=b,B=b.1;b.J4();P.BW.Bz.Bm();R(A.9!=o)A.SG=5(){V C=P.LG.OG(),D=[],A=[];Q(C).BE(5(P,Q){R(B.Oy&&Q.n.CD)s;D.d(Q.n[B.Cj]);A.d(Q.n[B.Fm])});P.Ea(D.DC(B.C7),A.DC(B.C7))};c{A.T2=5(A){R(B.Oy&&A.n.CD)s;V C=A.n[B.Cj],Q=A.n[B.Fm];P.Ea(C,Q)};A.onCancelSelect=5(Q){P.Ea("","")}}A.Vi=5(A,C){R(!P.LG)s;V Q=e;R(B.Gv)Q=B.Gv;c R(P.Cj.Bj()!="")Q=P.Cj.Bj();P.K0(Q)};P.k=Q("<Bs></Bs>");Q("W:r",P.BW).BH(P.k);P.k.QV(A);P.LG=P.k.QX()},K0:5(D){V P=b,C=b.1;R(D!=e){V A="",B=D.Ej().C7(C.C7);Q(B).BE(5(D,Q){P.LG.Qb(Q.Ej());A+=P.LG.S8(Q);R(D<B.v-O)A+=C.C7});P.Ea(D,A)}},VS:5(C){V P=b,B=b.1;b.J4();P.BW.Bz.Bm();P.g=Q("W:r",P.BW);C.K$=C.K$||Oc;C.q="GY%";C.t="GY%";C.Fa=-Bl;C.JA=o;P.F_=P.g.Ns(C);B.QQ=o;R(C.9!=o){V A=5(){V C=P.F_.Qk(),D=[],A=[];Q(C).BE(5(P,Q){D.d(Q[B.Cj]);A.d(Q[B.Fm])});P.Ea(D.DC(B.C7),A.DC(B.C7))};P.F_.B3("CheckAllRow",A);P.F_.B3("CheckRow",A)}c{P.F_.B3("SelectRow",5(E,C,A){V D=E[B.Cj],Q=E[B.Fm];P.Ea(D,Q)});P.F_.B3("UnSelectRow",5(B,A,Q){P.Ea("","")})}P.B3("BT",5(){R(P.F_)P.F_.Jv()});P.B3("NP",5(){R(P.F_){P.F_.Jv();P.F_.I1(P.BW.t()-Bl)}})},LL:5(){s Q(b.Cj).Bj()},ER:5(){s b.LL()},IO:5(){V Q=b,P=b.1;Q.Pl()},Pl:5(){V P=b,B=b.1,C=e;R(B.Gv!=e&&B.Jb!=e)P.Ea(B.Gv,B.Jb);R(B.Gv!=e){C=B.Gv;R(B.k){R(C)P.K0(C)}c{V A=P.M6(C);P.Ea(C,A)}}c R(B.Jb!=e){C=P.Tf(B.Jb);P.Ea(C,B.Jb)}c R(P.Cj.Bj()!=""){C=P.Cj.Bj();R(B.k){R(C)P.K0(C)}c{A=P.M6(C);P.Ea(C,A)}}R(!B.GJ&&C!=e)Q("Bz Bd",P.BW).B8("T:r").BE(5(){R(C==Q(b).j("BP"))Q(b).6("M-BC")});R(B.GJ&&C!=e)Q(":9",P.BW).BE(5(){V D=e,P=Q(b);R(P.0().Dd(N).Dk.DB()=="W")D=P.0().0();c D=P.0();R(D==e)s;V A=C.Ej().C7(B.C7);Q(A).BE(5(B,A){R(A==D.j("BP")){Q(".M-9",D).6("M-9-Bp");P[N].Bp=f}})})},Ea:5(P,A){V Q=b,B=b.1;Q.Cj.Bj(P);R(B.FQ)Q.BL.Bj(B.FQ(P,A));c Q.BL.Bj(A);Q.selectedValue=P;Q.selectedText=A;Q.BL.3("Dp").ET();Q.3("BC",[P,A])},Vn:5(){V P=b,A=b.1,B="",C="";Q("BS:Bp",P.BW).BE(5(){V P=e;R(Q(b).0().Dd(N).Dk.DB()=="W")P=Q(b).0().0();c P=Q(b).0();R(!P)s;B+=P.j("BP")+A.C7;C+=P.j("i")+A.C7});R(B.v>N)B=B.FN(N,B.v-O);R(C.v>N)C=C.FN(N,C.v-O);P.Ea(B,C)},QE:5(){V P=b,A=b.1;Q(".M-Bz-K1 T",P.BW).BX(5(){V D=Q(b).j("BP"),C=7(Q(b).j("DP")),B=Q(b).BN();R(P.GD("KX")&&P.3("KX",[D,B])==o){R(A.Co)P.BW.Dy("D3");c P.BW.BK();s o}R(Q(b).BF("M-BC")){R(A.Co)P.BW.Dy("D3");c P.BW.BK();s}Q(".M-BC",P.BW).$("M-BC");Q(b).6("M-BC");R(P.By)R(P.By[N].Ik!=C){P.By[N].Ik=C;P.By.3("Dp")}R(A.Co){P.Hn=f;P.BW.BK("D3",5(){P.Hn=o})}c P.BW.BK();P.Ea(D,B)})},JK:5(){V P=b,C=b.1;R(C.GL)P.BW.Y({h:P.Bh.Bw().h,X:P.Bh.Bw().X+O+P.Bh.E4()});c{V B=P.Bh.Bw().X-Q(w).F8(),A=P.BW.t()+My+C3;R(B+A>Q(w).t()&&B>A)P.BW.Y("T6",-O*(P.BW.t()+My+Dx))}},NG:5(D){V A=b,B=b.1,P=A.Bh.t();A.Hn=f;R(D){R(B.Co)A.BW.Dy("D3",5(){A.Hn=o});c{A.BW.BK();A.Hn=o}}c{A.JK();R(B.Co)A.BW.Dy("D3",5(){A.Hn=o;R(!B.GJ&&Q("T.M-BC",A.BW).v>N){V P=(Q("T.M-BC",A.BW).Bw().X-A.BW.Bw().X);Q(".M-BQ-By-B$",A.BW).CT({F8:P})}});c{A.BW.BT();A.Hn=o;R(!A.k&&!A.g&&!B.GJ&&Q("T.M-BC",A.BW).v>N){V C=(Q("T.M-BC",A.BW).Bw().X-A.BW.Bw().X);Q(".M-BQ-By-B$",A.BW).CT({F8:C})}}}A.isShowed=A.BW.El(":E9");A.3("BV",[D]);A.3(D?"BK":"BT")}});Q.2.8.FB.CQ.EL=Q.2.8.FB.CQ.Rj;Q.2.8.FB.CQ.setInputValue=Q.2.8.FB.CQ.Ea})(DM);(5(Q){Q.Br.LD=5(){s Q.2.CH.BD(b,"LD",B6)};Q.Br.Uk=5(){s Q.2.CH.BD(b,"Uk",B6)};Q.BR.Gs={H3:"PO-PM-P2 QM:QG",J0:o,onChangeDate:o,GL:f};Q.BR.DateEditorString={Qr:["\\u65e5","\\N0","\\Nv","\\Q9","\\UX","\\Q1","\\Q0"],PL:["\\N0\\Ff","\\Nv\\Ff","\\Q9\\Ff","\\UX\\Ff","\\Q1\\Ff","\\Q0\\Ff","\\u4e03\\Ff","\\u516b\\Ff","\\u4e5d\\Ff","\\Qg\\Ff","\\Qg\\N0\\Ff","\\Qg\\Nv\\Ff"],Rd:"\\u4eca\\u5929",Mc:"\\L4\\MR"};Q.CM.Gs={};Q.2.8.Gs=5(P,A){Q.2.8.Gs.CW.Cw.BD(b,P,A)};Q.2.8.Gs.DA(Q.2.8.F4,{Ci:5(){s"Gs"},DH:5(){s"Gs"},Dr:5(){s Q.CM.Gs},DG:5(){V P=b,B=b.1;R(!B.J0&&B.H3.EG(" QM:QG")>-O)B.H3=B.H3.EH(" QM:QG","");R(b.Bi.Dk.DB()!="BS"||b.Bi.l!="i")s;P.BL=Q(b.Bi);R(!P.BL.BF("M-i-FE"))P.BL.6("M-i-FE");P.Bx=Q("<W p=\\"M-3\\"><W p=\\"M-3-CO\\"></W></W>");P.i=P.BL.Ec("<W p=\\"M-i M-i-Do\\"></W>").0();P.i.BH("<W p=\\"M-i-M\\"></W><W p=\\"M-i-FY\\"></W>");P.i.BH(P.Bx);P.ES=P.i.Ec("<W p=\\"M-i-Bh\\"></W>").0();V C="";C+="<W p=\'M-BQ-BU\' B7=\'CY:DN\'>";C+="    <W p=\'M-BQ-BU-x\'>";C+="        <W p=\'M-BQ-BU-x-CA M-BQ-BU-x-TM\'><BG></BG></W>";C+="        <W p=\'M-BQ-BU-x-CA M-BQ-BU-x-Rx\'><BG></BG></W>";C+="        <W p=\'M-BQ-BU-x-i\'><DS p=\'M-BQ-BU-x-Ct\'></DS> , <DS  p=\'M-BQ-BU-x-Cv\'></DS></W>";C+="        <W p=\'M-BQ-BU-x-CA M-BQ-BU-x-RC\'><BG></BG></W>";C+="        <W p=\'M-BQ-BU-x-CA M-BQ-BU-x-Ux\'><BG></BG></W>";C+="    </W>";C+="    <W p=\'M-BQ-BU-m\'>";C+="        <Bz IA=\'N\' HZ=\'N\' KV=\'N\' p=\'M-BQ-BU-calendar\'>";C+="            <LS>";C+="                <Bd><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T></Bd>";C+="            </LS>";C+="            <Cg>";C+="                <Bd p=\'M-r\'><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T></Bd><Bd><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T></Bd><Bd><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T></Bd><Bd><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T></Bd><Bd><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T></Bd><Bd><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T><T Bn=\'BI\'></T></Bd>";C+="            </Cg>";C+="        </Bz>";C+="        <Bs p=\'M-BQ-BU-GP\'><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S></Bs>";C+="        <Bs p=\'M-BQ-BU-HH\'><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S></Bs>";C+="        <Bs p=\'M-BQ-BU-Gc\'><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S></Bs>";C+="        <Bs p=\'M-BQ-BU-Gb\'><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S><S></S></Bs>";C+="    </W>";C+="    <W p=\'M-BQ-BU-Bb\'>";C+="        <W p=\'M-BQ-BU-DF\'></W>";C+="        <W p=\'M-Cb M-Cb-Kw\'></W>";C+="        <W p=\'M-Cb M-Cb-BM\'></W>";C+="        <W p=\'M-F9\'></W>";C+="    </W>";C+="</W>";P.BU=Q(C);R(B.GL)P.BU.Ch("m").6("M-BQ-BU-GL");c P.ES.BH(P.BU);P.x=Q(".M-BQ-BU-x",P.BU);P.m=Q(".M-BQ-BU-m",P.BU);P.Bb=Q(".M-BQ-BU-Bb",P.BU);P.m.LS=Q("LS",P.m);P.m.Cg=Q("Cg",P.m);P.m.GP=Q(".M-BQ-BU-GP",P.m);P.m.HH=Q(".M-BQ-BU-HH",P.m);P.m.Gc=Q(".M-BQ-BU-Gc",P.m);P.m.Gb=Q(".M-BQ-BU-Gb",P.m);P.Bb.DF=Q(".M-BQ-BU-DF",P.Bb);P.Bb.DF.EQ=Q("<DS></DS>");P.Bb.DF.EO=Q("<DS></DS>");P.CC={TW:Q(".M-BQ-BU-x-TM",P.x),SP:Q(".M-BQ-BU-x-Ux",P.x),Sf:Q(".M-BQ-BU-x-Rx",P.x),Uy:Q(".M-BQ-BU-x-RC",P.x),OC:Q(".M-BQ-BU-x-Cv",P.x),Qd:Q(".M-BQ-BU-x-Ct",P.x),Qa:Q(".M-Cb-Kw",P.Bb),N4:Q(".M-Cb-BM",P.Bb)};V A=DT EM();P.Fd={Cv:A.GN(),Ct:A.Fg()+O,HB:A.Jo(),Do:A.Fq(),EQ:A.Ht(),EO:A.HT()};P.B_={Cv:A.GN(),Ct:A.Fg()+O,HB:A.Jo(),Do:A.Fq(),EQ:A.Ht(),EO:A.HT()};P.FO=e;P.Di=e;Q("T",P.m.LS).BE(5(A,P){Q(P).BN(B.Qr[A])});Q("S",P.m.GP).BE(5(A,P){Q(P).BN(B.PL[A])});P.CC.Qa.BN(B.Rd);P.CC.N4.BN(B.Mc);R(B.J0){P.Bb.DF.BT();P.Bb.DF.BH(P.Bb.DF.EQ).BH(":").BH(P.Bb.DF.EO);Q("S",P.m.Gc).BE(5(B,A){V P=B;R(B<Cs)P="N"+B.Ej();Q(b).BN(P)});Q("S",P.m.Gb).BE(5(B,A){V P=B;R(B<Cs)P="N"+B.Ej();Q(b).BN(P)})}P.E7();R(P.BL.Bj()!="")P.Mr();P.BU.B2(e,5(Q){R(P.BU.El(":E9")&&!P.Je)P.NE(f)});P.Bx.B2(5(){R(B._)s;b.GV="M-3-B2"},5(){R(B._)s;b.GV="M-3"}).Fv(5(){R(B._)s;b.GV="M-3-TA"}).F0(5(){R(B._)s;b.GV="M-3-B2"}).BX(5(){R(B._)s;P.E7();P.NE(P.BU.El(":E9"))});R(B._){P.BL.j("Fz","Fz");P.i.6("M-i-_")}R(B.Gv)P.BL.Bj(B.Gv);P.CC.N4.BX(5(){P.NE(f)});Q("T",P.m.Cg).B2(5(){R(Q(b).BF("M-BQ-BU-Kw"))s;Q(b).6("M-BQ-BU-BB")},5(){Q(b).$("M-BQ-BU-BB")}).BX(5(){Q(".M-BQ-BU-BC",P.m.Cg).$("M-BQ-BU-BC");R(!Q(b).BF("M-BQ-BU-Kw"))Q(b).6("M-BQ-BU-BC");P.B_.Do=7(Q(b).BN());P.B_.HB=DT EM(P.B_.Cv,P.B_.Ct-O,O).Jo();R(Q(b).BF("M-BQ-BU-Il"))R(Q("Bd",P.m.Cg).DP(Q(b).0())==N){R(--P.B_.Ct==N){P.B_.Ct=Ou;P.B_.Cv--}}c R(++P.B_.Ct==MY){P.B_.Ct=O;P.B_.Cv++}P.FO={Cv:P.B_.Cv,Ct:P.B_.Ct,Do:P.B_.Do};P.O9();P.Je=f;P.BU.Dy("D3",5(){P.Je=o})});Q(".M-BQ-BU-x-CA",P.x).B2(5(){Q(b).6("M-BQ-BU-x-CA-BB")},5(){Q(b).$("M-BQ-BU-x-CA-BB")});P.CC.OC.BX(5(){R(!P.m.HH.El(":E9"))Q("S",P.m.HH).BE(5(C,B){V A=P.B_.Cv+(C-C3);R(A==P.B_.Cv)Q(b).6("M-BC");c Q(b).$("M-BC");Q(b).BN(A)});P.m.HH.Dy()});P.m.HH.B2(5(){},5(){Q(b).MP()});Q("S",P.m.HH).BX(5(){P.B_.Cv=7(Q(b).BN());P.m.HH.Dy();P.E7()});P.CC.Qd.BX(5(){Q("S",P.m.GP).BE(5(B,A){R(P.B_.Ct==B+O)Q(b).6("M-BC");c Q(b).$("M-BC")});P.m.GP.Dy()});P.m.GP.B2(5(){},5(){Q(b).MP("D3")});Q("S",P.m.GP).BX(5(){V A=Q("S",P.m.GP).DP(b);P.B_.Ct=A+O;P.m.GP.Dy();P.E7()});P.Bb.DF.EQ.BX(5(){Q("S",P.m.Gc).BE(5(B,A){R(P.B_.EQ==B)Q(b).6("M-BC");c Q(b).$("M-BC")});P.m.Gc.Dy()});P.m.Gc.B2(5(){},5(){Q(b).MP("D3")});Q("S",P.m.Gc).BX(5(){V A=Q("S",P.m.Gc).DP(b);P.B_.EQ=A;P.m.Gc.Dy();P.E7()});P.Bb.DF.EO.BX(5(){Q("S",P.m.Gb).BE(5(B,A){R(P.B_.EO==B)Q(b).6("M-BC");c Q(b).$("M-BC")});P.m.Gb.Dy("D3",5(){V P=Q("S",b).DP(Q("S.M-BC",b));R(P>Sm){V A=(Q("S.M-BC",b).Bw().X-Q(b).Bw().X);Q(b).CT({F8:A})}})});P.m.Gb.B2(5(){},5(){Q(b).MP("D3")});Q("S",P.m.Gb).BX(5(){V A=Q("S",P.m.Gb).DP(b);P.B_.EO=A;P.m.Gb.Dy("D3");P.E7()});P.CC.Sf.BX(5(){R(--P.B_.Ct==N){P.B_.Ct=Ou;P.B_.Cv--}P.E7()});P.CC.Uy.BX(5(){R(++P.B_.Ct==MY){P.B_.Ct=O;P.B_.Cv++}P.E7()});P.CC.TW.BX(5(){P.B_.Cv--;P.E7()});P.CC.SP.BX(5(){P.B_.Cv++;P.E7()});P.CC.Qa.BX(5(){P.B_={Cv:P.Fd.Cv,Ct:P.Fd.Ct,HB:P.Fd.HB,Do:P.Fd.Do};P.FO={Cv:P.Fd.Cv,Ct:P.Fd.Ct,HB:P.Fd.HB,Do:P.Fd.Do};P.O9();P.BU.Dy("D3")});P.BL.Dp(5(){P.Mr()}).KI(5(){P.i.$("M-i-ET")}).ET(5(){P.i.6("M-i-ET")});P.i.B2(5(){P.i.6("M-i-BB")},5(){P.i.$("M-i-BB")});R(B.Da){P.C2=P.ES.Ec("<W p=\\"M-N$\\"></W>").0();P.C2.E_("<W p=\\"M-i-Da\\" B7=\\"D1:h;CY:Lx;\\">"+B.Da+":&Ex</W>");P.ES.Y("D1","h");R(!B.EW)B.EW=Q(".M-i-Da",P.C2).IU();c Q(".M-i-Da",P.C2).IU(B.EW);Q(".M-i-Da",P.C2).q(B.EW);Q(".M-i-Da",P.C2).t(P.i.t());P.C2.BH("<NH B7=\\"F9:Ox;\\" />");R(B.HA)Q(".M-i-Da",P.C2).Y("i-Bn",B.HA);P.ES.Y({CY:"Lx"});P.C2.q(P.i.IU()+B.EW+Bl)}P.BZ(B)},C0:5(){R(b.ES)b.ES.Bm();R(b.BU)b.BU.Bm();b.1=e;Q.2.Bm(b)},E7:5(){V P=b,C=b.1,E=DT EM(P.B_.Cv,P.B_.Ct-O,O).Jo(),B=P.B_.Ct,F=P.B_.Cv;R(++B==MY){B=O;F++}V D=DT EM(F,B-O,N).Fq(),A=DT EM(P.B_.Cv,P.B_.Ct-O,N).Fq();P.CC.Qd.BN(C.PL[P.B_.Ct-O]);P.CC.OC.BN(P.B_.Cv);P.Bb.DF.EQ.BN(P.B_.EQ);P.Bb.DF.EO.BN(P.B_.EO);R(P.Bb.DF.EQ.BN().v==O)P.Bb.DF.EQ.BN("N"+P.Bb.DF.EQ.BN());R(P.Bb.DF.EO.BN().v==O)P.Bb.DF.EO.BN("N"+P.Bb.DF.EO.BN());Q("T",b.m.Cg).BE(5(){b.GV=""});Q("Bd",b.m.Cg).BE(5(C,B){Q("T",B).BE(5(H,G){V B=C*Nn+(H-E),F=B+O;R(P.FO&&P.B_.Cv==P.FO.Cv&&P.B_.Ct==P.FO.Ct&&B+O==P.FO.Do){R(H==N||H==II)Q(G).6("M-BQ-BU-P8");Q(G).6("M-BQ-BU-BC");Q(G).Gd().$("M-BQ-BU-BC")}c R(P.B_.Cv==P.Fd.Cv&&P.B_.Ct==P.Fd.Ct&&B+O==P.Fd.Do){R(H==N||H==II)Q(G).6("M-BQ-BU-P8");Q(G).6("M-BQ-BU-Kw")}c R(B<N){F=A+F;Q(G).6("M-BQ-BU-Il").$("M-BQ-BU-BC")}c R(B>D-O){F=F-D;Q(G).6("M-BQ-BU-Il").$("M-BQ-BU-BC")}c R(H==N||H==II)Q(G).6("M-BQ-BU-P8").$("M-BQ-BU-BC");c G.GV="";Q(G).BN(F)})})},JK:5(){V P=b,A=b.1;R(A.GL)P.BU.Y({h:P.i.Bw().h,X:P.i.Bw().X+O+P.i.E4()});c R(P.i.Bw().X+C3>P.BU.t()&&P.i.Bw().X+P.BU.t()+My+C3-Q(w).F8()>Q(w).t()){P.BU.Y("T6",-O*(P.BU.t()+My+Dx));P.Tj=f}c P.Tj=o},NE:5(B){V P=b,A=b.1,Q=P.i.t();P.Je=f;R(B)P.BU.BK("D3",5(){P.Je=o});c{P.JK();P.BU.slideDown("D3",5(){P.Je=o})}},O9:5(){V Q=b,P=b.1;R(!b.FO)s;V A=Q.FO.Cv+"/"+Q.FO.Ct+"/"+Q.FO.Do;b.B_.EQ=7(Q.Bb.DF.EQ.BN(),Cs);b.B_.EO=7(Q.Bb.DF.EO.BN(),Cs);R(P.J0)A+=" "+b.B_.EQ+":"+b.B_.EO;b.BL.Bj(A);b.BL.3("Dp").ET()},TS:5(C){V Q=b,B=b.1,A=C.J9(/^(\\Ce{O,C3})(-|\\/)(\\Ce{O,Bl})\\Bl(\\Ce{O,Bl})Q/);R(A==e)s o;V P=DT EM(A[O],A[Dw]-O,A[C3]);R(P=="Ka")s o;s(P.GN()==A[O]&&(P.Fg()+O)==A[Dw]&&P.Fq()==A[C3])},S4:5(D){V Q=b,C=b.1,B=/^(\\Ce{O,C3})(-|\\/)(\\Ce{O,Bl})\\Bl(\\Ce{O,Bl}) (\\Ce{O,Bl}):(\\Ce{O,Bl})Q/,A=D.J9(B);R(A==e)s o;V P=DT EM(A[O],A[Dw]-O,A[C3],A[Dx],A[II]);R(P=="Ka")s o;s(P.GN()==A[O]&&(P.Fg()+O)==A[Dw]&&P.Fq()==A[C3]&&P.Ht()==A[Dx]&&P.HT()==A[II])},HU:5(C){V Q=b,P=b.1;R(C=="Ka")s e;V B=P.H3,A={"B1+":C.Fg()+O,"Ce+":C.Fq(),"Lz+":C.Ht(),"Qp+":C.HT(),"IM+":C.Sp(),"Qt+":Ig.VA((C.Fg()+Dw)/Dw),"HP":C.Sg()};R(/(GK+)/.GI(B))B=B.EH(Gg.Hf,(C.GN()+"").FN(C3-Gg.Hf.v));a(V D Bf A)R(DT Gg("("+D+")").GI(B))B=B.EH(Gg.Hf,Gg.Hf.v==O?A[D]:("Mb"+A[D]).FN((""+A[D]).v));s B},Mr:5(){V B=b,C=b.1,A=B.BL.Bj();R(A==""){B.FO=e;s f}R(!C.J0&&!B.TS(A)){R(!B.Di)B.BL.Bj("");c B.BL.Bj(B.HU(B.Di))}c R(C.J0&&!B.S4(A)){R(!B.Di)B.BL.Bj("");c B.BL.Bj(B.HU(B.Di))}c{A=A.EH(/-/Ly,"/");V P=B.HU(DT EM(A));R(P==e)R(!B.Di)B.BL.Bj("");c B.BL.Bj(B.HU(B.Di));B.Di=DT EM(A);B.FO={Cv:B.Di.GN(),Ct:B.Di.Fg()+O,HB:B.Di.Jo(),Do:B.Di.Fq(),EQ:B.Di.Ht(),EO:B.Di.HT()};B.B_={Cv:B.Di.GN(),Ct:B.Di.Fg()+O,HB:B.Di.Jo(),Do:B.Di.Fq(),EQ:B.Di.Ht(),EO:B.Di.HT()};B.BL.Bj(P);B.3("changeDate",[P]);R(Q(B.BU).El(":E9"))B.E7()}},Gt:5(P){V Q=b;R(P>C3){Q.i.Y({t:P});Q.BL.Y({t:P});Q.ES.Y({t:P})}},G0:5(P){V Q=b;R(P>FL){Q.i.Y({q:P});Q.BL.Y({q:P-FL});Q.ES.Y({q:P})}},Ib:5(P){V Q=b;R(!P)Q.BL.Bj("");R(BO P=="CJ")Q.BL.Bj(P);c R(BO P=="Dv")R(P Ho EM){Q.BL.Bj(Q.HU(P));Q.Mr()}},LL:5(){s b.Di},IS:5(){V Q=b,P=b.1;b.BL.I7("Fz");b.i.$("M-i-_");P._=o},IP:5(){V Q=b,P=b.1;b.BL.j("Fz","Fz");b.i.6("M-i-_");P._=f}})})(DM);(5(Q){V P=Q.2;Q(".M-u-CA").IB("Kp",5(){Q(b).6("M-u-CA-BB")}).IB("Ko",5(){Q(b).$("M-u-CA-BB")});Q(".M-u-Lj .M-u-BM").IB("Kp",5(){Q(b).6("M-u-BM-BB")}).IB("Ko",5(){Q(b).$("M-u-BM-BB")});Q.C_=5(){s P.CH.BD(e,"C_",B6,{Id:f})};Q.2.R3="../../lib/ligerUI/skins/Aqua/images/Cd/";5 A(A){a(V B Bf A)Q("<H$ />").j("E6",P.R3+A[B])}Q.BR.Eh={Mv:e,U:e,CC:e,Kj:f,q:280,t:e,4:"",y:e,CU:e,EX:o,Pf:e,l:"DN",h:e,X:e,Jq:f,Bt:e,Ok:o,PF:f,Mn:e,P1:e,Pp:e,Qq:f,BT:f,CK:"\\VH\\Mq",IX:o,IN:o,Jp:o,Co:Q.JO.PC?o:f,KL:e,Lk:e};Q.BR.G9={titleMessage:"\\VH\\Mq",KE:"\\ST\\RT",D7:"\\No",Df:"\\Pt",Li:"\\Sv\\Vm",Tv:"\\u6b63\\NL\\Ln\\u5f85\\RK,\\u8bf7\\u7a0d\\u5019..."};Q.CM.Eh=Q.CM.Eh||{};P.8.Eh=5(Q){P.8.Eh.CW.Cw.BD(b,e,Q)};P.8.Eh.DA(P.Cm.IV,{Ci:5(){s"Eh"},DH:5(){s"Eh"},Dr:5(){s Q.CM.Eh},DG:5(){V A=b,C=b.1;A.BZ(C,f);V F=Q("<W p=\\"M-u\\"><Bz p=\\"M-u-Bz\\" IA=\\"N\\" HZ=\\"N\\" KV=\\"N\\"><Cg><Bd><T p=\\"M-u-tl\\"></T><T p=\\"M-u-Lj\\"><W p=\\"M-u-Lj-B$\\"><W p=\\"M-u-CO\\"></W><W p=\\"M-u-CK\\"></W><W p=\\"M-u-Hc\\"><W p=\\"M-u-Mt M-u-BM\\"></W></W></W></T><T p=\\"M-u-Bd\\"></T></Bd><Bd><T p=\\"M-u-cl\\"></T><T p=\\"M-u-cc\\"><W p=\\"M-u-m\\"><W p=\\"M-u-D6\\"></W> <W p=\\"M-u-4\\"></W><W p=\\"M-u-CC\\"><W p=\\"M-u-CC-B$\\"></W></T><T p=\\"M-u-cr\\"></T></Bd><Bd><T p=\\"M-u-bl\\"></T><T p=\\"M-u-bc\\"></T><T p=\\"M-u-NH\\"></T></Bd></Cg></Bz></W>");Q("m").BH(F);A.u=F;A.Bi=F[N];A.u.m=Q(".M-u-m:r",A.u);A.u.x=Q(".M-u-Lj-B$:r",A.u);A.u.Hc=Q(".M-u-Hc:r",A.u.x);A.u.CC=Q(".M-u-CC:r",A.u);A.u.4=Q(".M-u-4:r",A.u);A.BZ(C,o);R(C.PF==o)Q(".M-u-BM",A.u).Bm();R(C.y||C.CU||C.l=="DN"){C.l=e;A.u.6("M-u-Cd")}R(C.Mv)A.u.6(C.Mv);R(C.U)A.u.j("U",C.U);A.Fy();R(C.Kj)A.F1();R(C.Ok)A.Jz();R(C.l)A.M3();c{Q(".M-u-D6",A.u).Bm();A.u.4.6("M-u-4-noimage")}R(!C.BT){A.GS();A.u.BK()}R(C.y){A.u.4.E_(C.y);Q(C.y).BT()}c R(C.CU){R(C.P1){C.CU+=C.CU.EG("?")==-O?"?":"&";C.CU+=C.P1+"="+DT EM().TT()}R(C.EX)A.u.m.EX(C.CU,5(){A.HG();A.3("JT")});c{A.GZ=Q("<EZ NA=\'N\'></EZ>");V E=C.Bt?C.Bt:"ligerwindow"+DT EM().TT();A.GZ.j("Bt",E);A.GZ.j("U",E);A.u.4.E_(A.GZ);A.u.4.6("M-u-4-nopadding");Ow(5(){A.GZ.j("E6",C.CU);A.frame=w.frames[A.GZ.j("Bt")]},N)}}R(C.Mn)A.u.Mn=C.Mn;R(C.CC)Q(C.CC).BE(5(C,B){V P=Q("<W p=\\"M-u-CA\\"><W p=\\"M-u-CA-M\\"></W><W p=\\"M-u-CA-FY\\"></W><W p=\\"M-u-CA-B$\\"></W></W>");Q(".M-u-CA-B$",P).BN(B.i);Q(".M-u-CC-B$",A.u.CC).E_(P);B.q&&P.q(B.q);B.Es&&P.BX(5(){B.Es(B,A,C)})});c A.u.CC.Bm();Q(".M-u-CC-B$",A.u.CC).BH("<W p=\'M-F9\'></W>");Q(".M-u-CK",A.u).B3("FP",5(){s o});A.u.BX(5(){P.Cd.Io(A)});Q(".M-u-Lj .M-u-BM",A.u).BX(5(){R(C.Qq)A.BK();c A.BM()});R(!C.KL){V D=N,G=N,B=C.q||A.u.q();R(C.Co==f)C.Co="D3";R(C.h!=e)D=C.h;c C.h=D=N.Dx*(Q(w).q()-B);R(C.X!=e)G=C.X;c C.X=G=N.Dx*(Q(w).t()-A.u.t())+Q(w).F8()-Cs;R(D<N)C.h=D=N;R(G<N)C.X=G=N;A.u.Y({h:D,X:G})}A.BT();Q("m").B3("PE.u",5(Q){V P=Q.which;R(P==MY)A.To();c R(P==Sl)A.Rh()});A.NR();A.HG();A.IR()},IQ:Ou,JV:Ot,Pa:5(F){V A=b,D=b.1,C=Q(w).q(),B=Q(w).t(),E=N,G=N;R(P.Cd.Ca){B-=P.Cd.Ca.E4();R(P.Cd.X)G+=P.Cd.Ca.E4()}R(F){A.u.m.CT({q:C-A.IQ},D.Co);A.u.CT({h:E,X:G},D.Co);A.u.4.CT({t:B-A.JV-A.u.CC.E4()},D.Co,5(){A.IR()})}c{A.BZ({q:C,t:B,h:E,X:G});A.IR()}},Ew:5(){V P=b,A=b.1;R(P.Gx){P.Gx.6("M-u-Hg");P.Pa(A.Co);R(P.ED)R(P.ED.BF("M-u-CV"))P.ED.6("M-u-BV-_ M-u-CV-_");c P.ED.6("M-u-BV-_ M-u-DQ-_");R(P.Ds)P.Ds.BZ({_:f});R(P.Fb)P.Fb.BZ({_:f});P.NI=f;Q(w).B3("C8.U4",5(){P.Pa(o)})}},Hg:5(){V P=b,A=b.1;R(P.Gx){P.Gx.$("M-u-Hg");R(A.Co){P.u.m.CT({q:P.Dn-P.IQ},A.Co);P.u.CT({h:P.Ia,X:P.IZ},A.Co);P.u.4.CT({t:P.H2-P.JV-P.u.CC.E4()},A.Co,5(){P.IR()})}c{P.BZ({q:P.Dn,t:P.H2,h:P.Ia,X:P.IZ});P.IR()}R(P.ED)P.ED.$("M-u-BV-_ M-u-CV-_ M-u-DQ-_");Q(w).DJ("C8.U4")}R(b.Ds)b.Ds.BZ({_:o});R(P.Fb)P.Fb.BZ({_:o});P.NI=o},FW:5(){V Q=b,B=b.1,A=P.Cd.Um(b);R(B.Co){Q.u.m.CT({q:O},B.Co);A.GK=A.Bw().X+A.t();A.HQ=A.Bw().h+A.q()/Bl;Q.u.CT({h:A.HQ,X:A.GK},B.Co,5(){Q.u.BK()})}c Q.u.BK();Q.GS();Q.JN=f;Q.Lf=o},Gr:5(){V A=b,D=b.1;R(A.JN){V C=A.Dn,B=A.H2,E=A.Ia,F=A.IZ;R(A.NI){C=Q(w).q();B=Q(w).t();E=F=N;R(P.Cd.Ca){B-=P.Cd.Ca.E4();R(P.Cd.X)F+=P.Cd.Ca.E4()}}R(D.Co){A.u.m.CT({q:C-A.IQ},D.Co);A.u.CT({h:E,X:F},D.Co)}c A.BZ({q:C,t:B,h:E,X:F})}A.Lf=f;A.JN=o;P.Cd.Io(A);A.BT()},BV:5(){V Q=b,P=b.1;R(!Q.ED)s;R(Q.ED.BF("M-u-CV"))Q.CV();c Q.DQ()},DQ:5(){V Q=b,P=b.1;R(!Q.ED)s;R(P.Co)Q.u.4.CT({t:O},P.Co);c Q.u.4.t(O);R(b.Ds)b.Ds.BZ({_:f})},CV:5(){V Q=b,A=b.1;R(!Q.ED)s;V P=Q.H2-Q.JV-Q.u.CC.E4();R(A.Co)Q.u.4.CT({t:P},A.Co);c Q.u.4.t(P);R(b.Ds)b.Ds.BZ({_:o})},NR:5(){V P=b,A=Q(">W",P.u.Hc).v;P.u.Hc.q(K4*A)},Sw:5(Q){R(!b.u)s;R(Q!=e)b.u.Y({h:Q})},Uq:5(Q){R(!b.u)s;R(Q!=e)b.u.Y({X:Q})},G0:5(Q){R(!b.u)s;R(Q>=b.IQ)b.u.m.q(Q-b.IQ)},Gt:5(B){V Q=b,A=b.1;R(!b.u)s;R(B>=b.JV){V P=B-b.JV-Q.u.CC.E4();Q.u.4.t(P)}},_setShowMax:5(B){V P=b,A=b.1;R(B){R(!P.Gx)P.Gx=Q("<W p=\\"M-u-Mt M-u-Ew\\"></W>").Ch(P.u.Hc).B2(5(){R(Q(b).BF("M-u-Hg"))Q(b).6("M-u-Hg-BB");c Q(b).6("M-u-Ew-BB")},5(){Q(b).$("M-u-Ew-BB M-u-Hg-BB")}).BX(5(){R(Q(b).BF("M-u-Hg"))P.Hg();c P.Ew()})}c R(P.Gx){P.Gx.Bm();P.Gx=e}P.NR()},RA:5(C){V A=b,B=b.1;R(C){R(!A.GM){A.GM=Q("<W p=\\"M-u-Mt M-u-FW\\"></W>").Ch(A.u.Hc).B2(5(){Q(b).6("M-u-FW-BB")},5(){Q(b).$("M-u-FW-BB")}).BX(5(){A.FW()});P.Cd.Pz(A)}}c R(A.GM){A.GM.Bm();A.GM=e}A.NR()},_setShowToggle:5(B){V P=b,A=b.1;R(B){R(!P.ED)P.ED=Q("<W p=\\"M-u-Mt M-u-DQ\\"></W>").Ch(P.u.Hc).B2(5(){R(Q(b).BF("M-u-BV-_"))s;R(Q(b).BF("M-u-CV"))Q(b).6("M-u-CV-BB");c Q(b).6("M-u-DQ-BB")},5(){Q(b).$("M-u-CV-BB M-u-DQ-BB")}).BX(5(){R(Q(b).BF("M-u-BV-_"))s;R(P.ED.BF("M-u-CV")){R(P.3("CV")==o)s;P.ED.$("M-u-CV");P.CV();P.3("extended")}c{R(P.3("DQ")==o)s;P.ED.6("M-u-CV");P.DQ();P.3("collapseed")}})}c R(P.ED){P.ED.Bm();P.ED=e}},To:5(){V Q=b,P=b.1,A;R(P.Pp!=CG)A=P.Pp;c R(P.l=="G_"||P.l=="Eb"||P.l=="FU"||P.l=="Fc")A=f;R(A)Q.BM()},Rh:5(){},S6:5(){V Q=b,P=b.1;R(P.Lk&&P.KL)Q.u.CT({Bv:-O*P.t},5(){Q.u.Bm()});c Q.u.Bm()},BM:5(){V A=b,B=b.1;P.Cd.MG(b);A.GS();A.S6();Q("m").DJ("PE.u")},_getVisible:5(){s b.u.El(":E9")},JQ:5(A){V Q=b,P=b.1;P.CU=A;R(P.EX)Q.u.m.BN("").EX(P.CU,5(){Q.3("JT")});c R(Q.GZ)Q.GZ.j("E6",P.CU)},Tu:5(Q){b.u.4.BN(Q)},T4:5(B){V P=b,A=b.1;R(B)Q(".M-u-CK",P.u).BN(B)},_hideDialog:5(){V Q=b,P=b.1;R(P.Lk&&P.KL)Q.u.CT({Bv:-O*P.t},5(){Q.u.BK()});c Q.u.BK()},G4:5(){V Q=b;P.Cd.MG(Q);Q.u.BK();Q.GS()},BT:5(){V P=b,A=b.1;P.Fy();R(A.KL){R(A.Lk){P.u.Y({Bv:-O*A.t}).6("M-u-fixed");P.u.BT().CT({Bv:N})}c P.u.BT().Y({Bv:N})}c P.u.BT();Q.2.Cd.Io.Gf(Q.2.Cd,GY,[P])},VG:5(Q){b.JQ(Q)},HG:5(){V Q=b;Q.Dn=Q.u.m.q();Q.H2=Q.u.m.t();V A=N,P=N;R(!Fk(7(Q.u.Y("X"))))A=7(Q.u.Y("X"));R(!Fk(7(Q.u.Y("h"))))P=7(Q.u.Y("h"));Q.IZ=A;Q.Ia=P},F1:5(){V A=b,B=b.1;R(Q.Br.EV)A.Fb=A.u.EV({En:".M-u-CK",CT:o,JB:5(){P.Cd.Io(A)},I4:5(){R(B.y){V C=P.B8(Q.2.8.Gs),D=P.B8(Q.2.8.FB);Q(Q.SQ(C,D)).BE(5(){R(b.JK)b.JK()})}A.HG()}})},IR:5(){V P=b,C=b.1;R(C.y){V B=Q(C.y).CZ();R(!B)B=Q(C.y).B8(":r").CZ();R(!B)s;V A=P.u.4.t(),D=P.u.4.q();B.3("C8",[{q:D,t:A}])}},Jz:5(){V P=b,A=b.1;R(Q.Br.Gm)P.Ds=P.u.Gm({Mi:5(A,Q){V C=N,B=N;R(!Fk(7(P.u.Y("X"))))C=7(P.u.Y("X"));R(!Fk(7(P.u.Y("h"))))B=7(P.u.Y("h"));R(A.Kl)P.BZ({h:B+A.Kl});R(A.K9)P.BZ({X:C+A.K9});R(A.JJ){P.BZ({q:A.JJ});P.u.m.Y({q:A.JJ-P.IQ})}R(A.LJ)P.BZ({t:A.LJ});P.IR();P.HG();s o},CT:o})},M3:5(){V P=b,A=b.1;R(A.l)R(A.l=="FU"||A.l=="NW"||A.l=="KE"){Q(".M-u-D6",P.u).6("M-u-D6-NW").BT();P.u.4.Y({Hu:Hm,Fh:Hj})}c R(A.l=="Eb"){Q(".M-u-D6",P.u).6("M-u-D6-Eb").BT();P.u.4.Y({Hu:Hm,Fh:Hj})}c R(A.l=="G_"){Q(".M-u-D6",P.u).6("M-u-D6-G_").BT();P.u.4.Y({Hu:Hm,Fh:Hj})}c R(A.l=="Fc"){Q(".M-u-D6",P.u).6("M-u-D6-Fc").BT();P.u.4.Y({Hu:Hm,Fh:Ii})}}});P.8.Eh.CQ.BK=P.8.Eh.CQ.G4;Q.C_.CP=5(P){s Q.C_(P)};Q.C_.BM=5(){V A=P.B8(P.8.Eh.CQ.Ci());a(V B Bf A){V Q=A[B];Q.C0.Gf(Q,Dx)}P.Cd.GS()};Q.C_.BT=5(A){V B=P.B8(P.8.Eh.CQ.Ci());R(B.v)a(V C Bf B){B[C].BT();s}s Q.C_(A)};Q.C_.BK=5(){V A=P.B8(P.8.Eh.CQ.Ci());a(V B Bf A){V Q=A[B];Q.BK()}};Q.C_.Eo=5(P){P=Q.CV({Lk:"Co",q:240,Jq:o,t:GY},P||{});Q.CV(P,{KL:"Ll",l:"DN",Kj:o,Ok:o,IX:o,IN:o,Jp:o});s Q.C_.CP(P)};Q.C_.Gl=5(P,A,D,B){P=P||"";R(BO(A)=="5"){B=A;D=e}c R(BO(D)=="5")B=D;V C=5(P,A,Q){A.BM();R(B)B(P,A,Q)};DU={4:P,CC:[{i:Q.BR.G9.KE,Es:C}]};R(BO(A)=="CJ"&&A!="")DU.CK=A;R(BO(D)=="CJ"&&D!="")DU.l=D;Q.CV(DU,{IX:o,IN:o,Jp:o});s Q.C_(DU)};Q.C_.JD=5(P,A,B){R(BO(A)=="5"){B=A;l=e}V C=5(Q,P){P.BM();R(B)B(Q.l=="KE")};DU={l:"Fc",4:P,CC:[{i:Q.BR.G9.D7,Es:C,l:"KE"},{i:Q.BR.G9.Df,Es:C,l:"Df"}]};R(BO(A)=="CJ"&&A!="")DU.CK=A;Q.CV(DU,{IX:o,IN:o,Jp:o});s Q.C_(DU)};Q.C_.warning=5(P,A,B){R(BO(A)=="5"){B=A;l=e}V C=5(Q,P){P.BM();R(B)B(Q.l)};DU={l:"Fc",4:P,CC:[{i:Q.BR.G9.D7,Es:C,l:"D7"},{i:Q.BR.G9.Df,Es:C,l:"Df"},{i:Q.BR.G9.Li,Es:C,l:"Li"}]};R(BO(A)=="CJ"&&A!="")DU.CK=A;Q.CV(DU,{IX:o,IN:o,Jp:o});s Q.C_(DU)};Q.C_.waitting=5(P){P=P||Q.BR.Eh.Tv;s Q.C_.CP({Mv:"M-u-SD",l:"DN",4:"<W B7=\\"padding:4px\\">"+P+"</W>",PF:o})};Q.C_.closeWaitting=5(){V A=P.B8(P.8.Eh);a(V B Bf A){V Q=A[B];R(Q.u.BF("M-u-SD"))Q.BM()}};Q.C_.FU=5(P,A,B){s Q.C_.Gl(P,A,"FU",B)};Q.C_.Eb=5(P,A,B){s Q.C_.Gl(P,A,"Eb",B)};Q.C_.G_=5(P,A,B){s Q.C_.Gl(P,A,"G_",B)};Q.C_.Fc=5(P,A){s Q.C_.Gl(P,A,"Fc")};Q.C_.prompt=5(P,D,C,B){V A=Q("<BS l=\\"i\\" p=\\"M-u-inputtext\\"/>");R(BO(C)=="5")B=C;R(BO(D)=="5")B=D;c R(BO(D)=="MB")C=D;R(BO(C)=="MB"&&C)A=Q("<G$ p=\\"M-u-G$\\"></G$>");R(BO(D)=="CJ"||BO(D)=="FC")A.Bj(D);V E=5(P,C,Q){C.BM();R(B)B(P.l=="D7",A.Bj())};DU={CK:P,y:A,q:320,CC:[{i:Q.BR.G9.KE,Es:E,l:"D7"},{i:Q.BR.G9.Li,Es:E,l:"Li"}]};s Q.C_(DU)}})(DM);(5(Q){V P=Q.2;Q.Br.EV=5(Q){s P.CH.BD(b,"EV",B6,{FV:"LE",Jf:o,Ie:"y"})};Q.Br.UI=5(){s P.CH.BD(b,"UI",B6,{FV:"LE",Jf:o,Ie:"y"})};Q.BR.Jw={JB:o,Kc:o,I4:o,En:e,B4:f,Hb:o,CT:f,Mk:e,onEndRevert:e,If:e,onDragEnter:e,onDragOver:e,onDragLeave:e,onDrop:e,_:o,HS:e,HR:e};P.8.Jw=5(Q){P.8.Jw.CW.Cw.BD(b,e,Q)};P.8.Jw.DA(P.Cm.Dh,{Ci:5(){s"Jw"},DH:5(){s"Jw"},DG:5(){V Q=b,P=b.1;b.BZ(P);Q.CN="Fn";Q.En.Y("CN",Q.CN);Q.En.B3("Fv.DE",5(A){R(P._)s;R(A.Cb==Bl)s;Q.G7.BD(Q,A)}).B3("HX.DE",5(){R(P._)s;Q.En.Y("CN",Q.CN)})},MD:5(){b.1.y.LE=b.U},G7:5(B){V A=b,C=b.1;R(A.Kq)s;R(C._)s;A.Bu={y:A.y,h:A.y.Bw().h,X:A.y.Bw().X,H6:B.EU||B.J_,H7:B.FA||B.TN};R(A.3("startDrag",[A.Bu,B])==o)s o;A.CN="Fn";A.M_(C.B4,B);R(C.B4&&!A.B4)s o;(A.B4||A.En).Y("CN",A.CN);Q(CE).B3("FP.DE",5(){s o});Q(CE).B3("HX.DE",5(){A.Iu.E3(A,B6)});P.Fb.Gk=f;Q(CE).B3("F0.DE",5(){P.Fb.Gk=o;A.JH.E3(A,B6)})},Iu:5(A){V P=b,B=b.1;R(!P.Bu)s;V C=A.EU||A.J_,D=A.FA||A.ND;P.Bu.HD=C-P.Bu.H6;P.Bu.Hv=D-P.Bu.H7;(P.B4||P.En).Y("CN",P.CN);R(P.If)P.If.BE(5(G,B){V E=Q(B),F=E.Bw();R(C>F.h&&C<F.h+E.q()&&D>F.X&&D<F.X+E.t()){R(!P.J7[G]){P.J7[G]=f;P.3("dragEnter",[B,P.B4||P.y,A])}c P.3("dragOver",[B,P.B4||P.y,A])}c R(P.J7[G]){P.J7[G]=o;P.3("dragLeave",[B,P.B4||P.y,A])}});R(P.GD("DE")){R(P.3("DE",[P.Bu,A])!=o)P.F1();c P.Ip()}c P.F1()},JH:5(A){V P=b,B=b.1;Q(CE).DJ("HX.DE");Q(CE).DJ("F0.DE");Q(CE).DJ("FP.DE");R(P.If)P.If.BE(5(B,Q){R(P.J7[B])P.3("Bq",[Q,P.B4||P.y,A])});R(P.B4)R(B.Hb){R(P.GD("Hb")){R(P.3("Hb",[P.Bu,A])!=o)P.QA(A);c P.Ip()}c P.QA(A)}c{P.F1(P.y);P.Ip()}P.CN="Fn";P.3("stopDrag",[P.Bu,A]);P.Bu=e;P.En.Y("CN",P.CN)},QA:5(P){V Q=b;Q.Kq=f;Q.B4.CT({h:Q.Bu.h,X:Q.Bu.X},5(){Q.Kq=o;Q.Ip();Q.3("endRevert",[Q.Bu,P]);Q.Bu=e})},F1:5(C){V Q=b,P=b.1;C=C||Q.B4||Q.y;V A={},D=o,B=C==Q.y;R(Q.Bu.HD){R(B||P.HS==e)A.h=Q.Bu.h+Q.Bu.HD;c A.h=Q.Bu.H6+P.HS+Q.Bu.HD;D=f}R(Q.Bu.Hv){R(B||P.HR==e)A.X=Q.Bu.X+Q.Bu.Hv;c A.X=Q.Bu.H7+P.HR+Q.Bu.Hv;D=f}R(C==Q.y&&Q.B4&&P.CT){Q.Kq=f;C.CT(A,5(){Q.Kq=o})}c C.Y(A)},_setReceive:5(P){b.J7={};R(!P)s;R(BO P=="CJ")b.If=Q(P);c b.If=P},_setHandler:5(B){V P=b,A=b.1;R(!B)P.En=Q(A.y);c P.En=(BO B=="CJ"?Q(B,A.y):B)},_setTarget:5(P){b.y=Q(P)},_setCursor:5(Q){b.CN=Q;(b.B4||b.En).Y("CN",Q)},M_:5(C,A){R(!C)s;V P=b,B=b.1;R(BO C=="5")P.B4=C.BD(b.1.y,P,A);c R(C=="R1"){P.B4=P.y.R1().Y("EN","GL");P.B4.Ch("m")}c{P.B4=Q("<W p=\'M-Fb\'></W>");P.B4.q(P.y.q()).t(P.y.t());P.B4.j("dragid",P.U).Ch("m")}P.B4.Y({h:B.HS==e?P.Bu.h:P.Bu.H6+B.HS,X:B.HR==e?P.Bu.X:P.Bu.H7+B.HR}).BT()},Ip:5(){V Q=b;R(Q.B4){Q.B4.Bm();Q.B4=e}}})})(DM);(5(Q){Q.Br.Ug=5(){s Q.2.CH.BD(b,"Ug",B6)};Q.Br.Q7=5(){s Q.2.CH.BD(b,"Q7",B6)};Q.BR.Hd={};Q.CM.Hd={};Q.2.8.Hd=5(P,A){Q.2.8.Hd.CW.Cw.BD(b,P,A)};Q.2.8.Hd.DA(Q.2.Cm.Dh,{Ci:5(){s"Hd"},DH:5(){s"Hd"},Dr:5(){s Q.CM.Hd},DG:5(){V P=b,B=b.1;P.FF=Q(b.Bi);P.FF.6("M-He");V A=N;R(Q("> W[Jx=f]",P.FF).v>N)A=Q("> W",P.FF).DP(Q("> W[Jx=f]",P.FF));P.FF.Bs=Q("<Bs p=\\"M-He-x\\"></Bs>");Q("> W",P.FF).BE(5(D,C){V B=Q("<S><BG></BG></S>");R(D==A)Q("BG",B).6("M-BC");R(Q(C).j("CK"))Q("BG",B).BN(Q(C).j("CK"));P.FF.Bs.BH(B);R(!Q(C).BF("M-He-Ja"))Q(C).6("M-He-Ja")});P.FF.Bs.QU(P.FF);Q(".M-He-Ja:HK("+A+")",P.FF).BT().Gd(".M-He-Ja").BK();Q("> Bs:r BG",P.FF).BX(5(){R(Q(b).BF("M-BC"))s;V A=Q("> Bs:r BG",P.FF).DP(b);Q(b).6("M-BC").0().Gd().B8("BG.M-BC").$("M-BC");Q(".M-He-Ja:HK("+A+")",P.FF).BT().Gd(".M-He-Ja").BK()}).JX("M-BC").B2(5(){Q(b).6("M-BB")},5(){Q(b).$("M-BB")});P.BZ(B)}})})(DM);(5(Q){Q.Br.U1=5(){s Q.2.CH.BD(b,"U1",B6)};Q.Br.UJ=5(){s Q.2.CH.BD(b,"UJ",B6)};Q.BR.EK={Ga:[],IG:{},B9:{}};Q.BR.FilterString={JE:{"P7":"\\u5e76\\u4e14","QB":"\\N6\\u8005","Nx":"\\O8\\Ln","OQ":"\\RO\\O8\\Ln","Rb":"\\UH..\\u5f00\\u59cb","Up":"\\UH..\\u7ed3\\u675f","Rm":"\\O8\\u4f3c","QS":"\\S7\\JM","Ol":"\\S7\\JM\\N6\\Ln\\JM","QO":"\\RG\\JM","QH":"\\RG\\JM\\N6\\Ln\\JM","Bf":"\\VT\\Ts\\NL...","QK":"\\RO\\VT\\Ts...","M4":"\\TO\\PI\\OV\\PR","M8":"\\TO\\PI\\OZ\\UD","M$":"\\u5220\\u9664\\OV\\PR"}};Q.BR.EK.IG["CJ"]=Q.BR.EK.IG["i"]=["Nx","OQ","Rb","Up","Rm","QS","Ol","QO","QH","Bf","QK"];Q.BR.EK.IG["EC"]=Q.BR.EK.IG["FC"]=Q.BR.EK.IG["D1"]=Q.BR.EK.IG["Do"]=["Nx","OQ","QS","Ol","QO","QH","Bf","QK"];Q.BR.EK.B9["CJ"]={F6:5(B,P){V A=Q("<BS l=\'i\'/>");B.BH(A);A.Js(P.BY.1||{});s A},EL:5(Q,P){Q.Bj(P)},ER:5(Q){s Q.CZ("Cz","BP")},C0:5(Q){Q.CZ("C0")}};Q.BR.EK.B9["Do"]={F6:5(B,P){V A=Q("<BS l=\'i\'/>");B.BH(A);A.LD(P.BY.1||{});s A},EL:5(Q,P){Q.CZ("Cz","BP",P)},ER:5(P,Q){s P.CZ("Cz","BP")},C0:5(Q){Q.CZ("C0")}};Q.BR.EK.B9["EC"]={F6:5(B,P){V A=Q("<BS l=\'i\'/>");B.BH(A);V C={Fj:P.BY.Fj,Fr:P.BY.Fr};A.LW(Q.CV(C,P.BY.1||{}));s A},EL:5(Q,P){Q.Bj(P)},ER:5(P,Q){V A=Q.BY.l=="FC";R(A)s 7(P.Bj(),Cs);c s Dj(P.Bj())},C0:5(Q){Q.CZ("C0")}};Q.BR.EK.B9["NM"]={F6:5(B,P){V A=Q("<BS l=\'i\'/>");B.BH(A);V C={n:P.n,Co:o,Cj:P.BY.Cj||P.BY.UK,Fm:P.BY.Fm||P.BY.Rs};Q.CV(C,P.BY.1||{});A.Hs(C);s A},EL:5(Q,P){Q.CZ("Cz","BP",P)},ER:5(Q){s Q.CZ("Cz","BP")},C0:5(Q){Q.CZ("C0")}};Q.2.8.EK=5(P,A){Q.2.8.EK.CW.Cw.BD(b,P,A)};Q.2.8.EK.DA(Q.2.Cm.Dh,{Ci:5(){s"EK"},DH:5(){s"EK"},Ei:5(){Q.2.8.EK.CW.Ei.BD(b)},DG:5(){V P=b,A=b.1;P.BZ(A);Q("#"+P.U+" .M4").IB("BX",5(){V A=Q(b).0().0().0().0();P.PJ(A)});Q("#"+P.U+" .M$").IB("BX",5(){V A=Q(b).0().0().0().0();P.Rp(A)});Q("#"+P.U+" .M8").IB("BX",5(){V A=Q(b).0().0().0().0();P.OA(A)});Q("#"+P.U+" .UZ").IB("BX",5(){V A=Q(b).0().0();P.Sz(A)})},_setFields:5(B){V P=b,A=b.1;R(P.C6)P.C6.Bm();P.C6=Q(P.Or()).Ch(P.Bi)},B9:{},N9:N,PJ:5(A){V P=b,C=b.1;A=Q(A||P.C6);V B=Q(">Cg:r > Bd:CR",A),E=[];E.d("<Bd p=\\"M-Ep-SI\\"><T p=\\"M-Ep-cellgroup\\" JW=\\"C3\\">");V D=!A.BF("M-Ep-C6-P9");E.d(P.Or(D,f));E.d("</T></Bd>");V F=Q(E.DC(""));B.IY(F);s F.B8("Bz:r")},Rp:5(B){V P=b,A=b.1;Q("T.M-Ep-BP",B).BE(5(){V A=Q(b).0();Q("By.J6",A).DJ();P.Mm(A)});Q(B).0().0().Bm()},Mm:5(C){V A=b,D=b.1,E=Q(C).j("LX"),P=Q(C).j("Kz"),B=A.B9[P];R(B)D.B9[E].C0(B);Q("T.M-Ep-BP:r",C).BN("")},Jt:5(D,A){V P=b,C=b.1;A=A||P.C6;V B=Q(">Cg:r > Bd:CR",A);A.B8(">Cg:r > Bd").JX(B).Bm();Q("By:r",B).Bj(D.Lb);R(D.LA)Q(D.LA).BE(5(){V D=P.OA(A);D.j("KP",b.l||"CJ");Q("By.PS",D).Bj(b.Lb);Q("By.J6",D).Bj(b.FE).3("Dp");V E=D.j("Kz");R(E&&P.B9[E]){V B=P.L2(b.FE);C.B9[B.BY.l].EL(P.B9[E],b.BP,B)}c Q(":i",D).Bj(b.BP)});R(D.G8)Q(D.G8).BE(5(){V Q=P.PJ(A);P.Jt(b,Q)})},OA:5(A){V P=b,D=b.1;A=A||P.C6;V C=Q(">Cg:r > Bd:CR",A),B=Q(P.Td());C.IY(B);R(D.Ga.v)P.Nk(B,D.Ga[N]);Q("By.J6",B).B3("Dp",5(){V D=Q(b).0().Ev().B8("By:r"),G=Q(b).Bj(),A=P.L2(G),C=A.l||"CJ",F=B.j("KP");R(C!=F){D.BN(P.OF(C));B.j("KP",C)}V H=e,E=B.j("LX");R(P.Pg(A))H=A.BY.l;R(E)P.Mm(B);R(H)P.Nk(B,A);c{B.I7("LX").I7("Kz");Q("T.M-Ep-BP:r",B).BN("<BS l=\\"i\\" p=\\"P3\\" />")}});s B},Sz:5(P){Q("By.J6",P).DJ();b.Mm(P);Q(P).Bm()},Nk:5(C,P){V A=b,E=b.1;R(A.Pg(P)){V D=Q("T.M-Ep-BP:r",C).BN(""),B=E.B9[P.BY.l];A.B9[++A.N9]=B.F6(D,P);C.j("LX",P.BY.l).j("Kz",A.N9)}},KH:5(C){V P=b,A=b.1;C=C||P.C6;V B={};Q("> Cg > Bd",C).BE(5(K,J){V H=Q(J).BF("M-Ep-UN"),I=Q(J).BF("M-Ep-SI");R(I){V G=Q("> T:r > Bz:r",J);R(G.v){R(!B.G8)B.G8=[];B.G8.d(P.KH(G))}}c R(H)B.Lb=Q(".RJ:r",J).Bj();c{V F=Q("By.J6:r",J).Bj(),A=P.L2(F),C=Q(".PS:r",J).Bj(),D=P.RX(J,A),E=Q(J).j("KP")||"CJ";R(!B.LA)B.LA=[];B.LA.d({FE:F,Lb:C,BP:D,l:E})}});s B},RX:5(D,P){V A=b,E=b.1,F=Q(D).j("Kz"),C=Q(D).j("LX"),B=A.B9[F];R(B)s E.B9[C].ER(B,P);s Q(".P3:r",D).Bj()},Pg:5(Q){V P=b,A=b.1;R(!Q.BY||!Q.BY.l)s o;s(Q.BY.l Bf A.B9)},L2:5(C){V P=b,A=b.1;a(V D=N,B=A.Ga.v;D<B;D++){V Q=A.Ga[D];R(Q.Bt==C)s Q}s e},Or:5(A,C){V Q=b,P=b.1,B=[];B.d("<Bz IA=\\"N\\" HZ=\\"N\\" KV=\\"N\\" p=\\"M-Ep-C6");R(A)B.d(" M-Ep-C6-P9");B.d("\\"><Cg>");B.d("<Bd p=\\"M-Ep-UN\\"><T p=\\"M-Ep-rowlastcell\\" Bn=\\"BJ\\" JW=\\"C3\\">");B.d("<By p=\\"RJ\\">");B.d("<Cz BP=\\"P7\\">"+P.JE["P7"]+"</Cz>");B.d("<Cz BP=\\"QB\\">"+P.JE["QB"]+"</Cz>");B.d("</By>");B.d("<BS l=\\"Cb\\" BP=\\""+P.JE["M4"]+"\\" p=\\"M4\\">");B.d("<BS l=\\"Cb\\" BP=\\""+P.JE["M8"]+"\\" p=\\"M8\\">");R(C)B.d("<BS l=\\"Cb\\" BP=\\""+P.JE["M$"]+"\\" p=\\"M$\\">");B.d("</T></Bd>");B.d("</Cg></Bz>");s B.DC("")},Td:5(F){V A=b,C=b.1;F=F||C.Ga;V P=[],B=F[N].l||"CJ";P.d("<Bd KP=\\""+B+"\\"><T p=\\"M-Ep-Cf\\">");P.d("<By p=\\"J6\\">");a(V E=N,D=F.v;E<D;E++){V Q=F[E];P.d("<Cz BP=\\""+Q.Bt+"\\"");R(E==N)P.d(" BC ");P.d(">");P.d(Q.CY);P.d("</Cz>")}P.d("</By>");P.d("</T>");P.d("<T p=\\"M-Ep-Lb\\">");P.d("<By p=\\"PS\\">");P.d(A.OF(B));P.d("</By>");P.d("</T>");P.d("<T p=\\"M-Ep-BP\\">");P.d("<BS l=\\"i\\" p=\\"P3\\" />");P.d("</T>");P.d("<T>");P.d("<W p=\\"M-CO-cross UZ\\"></W>");P.d("</T>");P.d("</Bd>");s P.DC("")},OF:5(A){V Q=b,C=b.1,F=C.IG[A],B=[];a(V E=N,D=F.v;E<D;E++){V P=F[E];B[B.v]="<Cz BP=\\""+P+"\\">";B[B.v]=C.JE[P];B[B.v]="</Cz>"}s B.DC("")}})})(DM);(5(Q){Q.Br.Ur=5(){s Q.2.CH.BD(b,"Ur",B6)};Q.BR=Q.BR||{};Q.BR.Hw={LT:180,EW:TD,DV:Ii,S3:"\\Sr",HA:"h",Bn:"h",Ga:[],ON:f,OS:"",GW:Q.2.GW};Q.BR.Hw.Rv=5(C){V P=b,A=b.1,B={};R(A.LT)B.q=A.LT;R(C.El("By"))C.Hs(B);c R(C.El(":i")||C.El(":Qe")){V Q=C.j("T8");Pq(Q){EJ"By":EJ"NM":C.Hs(B);Dl;EJ"D9":C.LW(B);Dl;EJ"Do":C.LD(B);Dl;EJ"D1":EJ"EC":B.EC=f;C.Js(B);Dl;EJ"FC":EJ"NB":B.NB=f;Ez:C.Js(B);Dl}}c R(C.El(":GB"))C.OM(B);c R(C.El(":9"))C.Gh(B);c R(C.El("G$"))C.6("M-G$")};Q.2.8.Hw=5(P,A){Q.2.8.Hw.CW.Cw.BD(b,P,A)};Q.2.8.Hw.DA(Q.2.Cm.Dh,{Ci:5(){s"Hw"},DH:5(){s"Hw"},Ei:5(){Q.2.8.Hw.CW.Ei.BD(b)},DG:5(){V P=b,B=b.1,A=Q(b.Bi);R(B.Ga&&B.Ga.v){R(!A.BF("M-Nc"))A.6("M-Nc");V D=[],C=o;Q(B.Ga).BE(5(A,Q){V B=Q.Bt||Q.U;R(!B)s;R(Q.l=="G4"){D.d("<BS l=\\"G4\\" U=\\""+B+"\\" Bt=\\""+B+"\\" />");s}V E=Q.renderToNewLine||Q.newline;R(E==e)E=f;R(Q.SQ)E=o;R(Q.C6)E=f;R(E){R(C){D.d("</Bs>");C=o}R(Q.C6){D.d("<W p=\\"M-C6");R(Q.P6)D.d(" M-C6-NT");D.d("\\">");R(Q.P6)D.d("<H$ E6=\\""+Q.P6+"\\" />");D.d("<BG>"+Q.C6+"</BG></W>")}D.d("<Bs>");C=f}D.d(P.VY(Q));D.d(P.Ud(Q));D.d(P.Rr(Q))});R(C){D.d("</Bs>");C=o}A.BH(D.DC(""))}Q("BS,By,G$",A).BE(5(){B.Rv.BD(P,Q(b))})},VY:5(Q){V P=b,B=b.1,C=Q.Da||Q.CY,A=Q.EW||Q.labelwidth||B.EW,D=Q.HA||B.HA;R(C)C+=B.S3;V E=[];E.d("<S B7=\\"");R(A)E.d("q:"+A+"Em;");R(D)E.d("i-Bn:"+D+";");E.d("\\">");R(C)E.d(C);E.d("</S>");s E.DC("")},Ud:5(Q){V P=b,C=b.1,B=Q.q||C.LT,A=Q.Bn||Q.SE||Q.textalign||C.Bn,D=[];D.d("<S B7=\\"");R(B)D.d("q:"+B+"Em;");R(A)D.d("i-Bn:"+A+";");D.d("\\">");D.d(P.Sx(Q));D.d("</S>");s D.DC("")},Rr:5(Q){V P=b,A=b.1,B=Q.DV||Q.spaceWidth||A.DV,C=[];C.d("<S B7=\\"");R(B)C.d("q:"+B+"Em;");C.d("\\">");C.d("</S>");s C.DC("")},Sx:5(P){V A=b,D=b.1,C=P.q||D.LT,B=P.Bt||P.U,G=[];R(P.ME&&P.l=="By")G.d("<BS l=\\"G4\\" U=\\""+D.OS+B+"\\" Bt=\\""+B+"\\" />");R(P.G$||P.l=="G$")G.d("<G$ ");c R(P.l=="9")G.d("<BS l=\\"9\\" ");c R(P.l=="GB")G.d("<BS l=\\"GB\\" ");c R(P.l=="Qe")G.d("<BS l=\\"Qe\\" ");c G.d("<BS l=\\"i\\" ");R(P.OW)G.d("p=\\""+P.OW+"\\" ");R(P.l)G.d("T8=\\""+P.l+"\\" ");R(P.j)a(V E Bf P.j)G.d(E+"=\\""+P.j[E]+"\\" ");R(P.ME&&P.l=="By"){G.d("Bt=\\""+P.ME+"\\"");R(D.ON)G.d(" U=\\""+D.OS+P.ME+"\\" ")}c{G.d("Bt=\\""+B+"\\"");R(D.ON)G.d(" U=\\""+B+"\\" ")}V F=Q.CV({q:C-Bl},P.1||{});G.d(" 2=\'"+D.GW(F)+"\' ");R(P.PU)G.d(" PU=\'"+D.GW(P.PU)+"\' ");G.d(" />");s G.DC("")}})})(DM);(5(Q){V M=Q.2;Q.Br.Ns=5(P){s Q.2.CH.BD(b,"Ns",B6)};Q.Br.TI=5(){s Q.2.CH.BD(b,"TI",B6)};Q.BR.CB={CK:e,q:"E$",t:"E$",K$:e,Ds:f,CU:o,IH:f,D_:O,GE:Cs,UP:[Cs,FL,Hj,Ii,Jn],Iv:[],Be:[],QJ:O,GQ:"GX",F7:"GX",showTableToggleBtn:o,Se:o,allowAdjustColWidth:f,9:o,JI:f,JZ:o,RV:f,onDragCol:e,onToggleCol:e,onChangeSort:e,Oa:e,onDblClickRow:e,onSelectRow:e,onUnSelectRow:e,onBeforeCheckRow:e,onCheckRow:e,onBeforeCheckAllRow:e,onCheckAllRow:e,onBeforeShowData:e,onAfterShowData:e,Nu:e,onSubmit:e,Tm:"PO-PM-P2",JA:f,EE:"PZ",Tk:"Ps",On:f,K6:f,Fa:N,OW:e,Cc:"Rows",DZ:"Total",S5:"D_",Uz:"O7",Qw:"sortname",SO:"sortorder",onReload:e,onToFirst:e,onToPrev:e,onToNext:e,onToLast:e,Uu:o,Qm:f,L9:"M-g-Bo-BB",SC:f,Pd:e,Pr:e,QR:"\\OV\\PR",QZ:e,Nd:e,R2:o,KZ:e,UQ:o,onAfterAddRow:e,onBeforeEdit:e,onBeforeSubmitEdit:e,onAfterEdit:e,onLoading:e,Pf:e,Q4:e,T0:o,NO:e,TU:Sl,Ng:Sm,LC:f,Nr:o,onEndEdit:e,UT:Oz,k:e,Og:e,C1:f,Ma:o,MH:f,Tt:260,HY:o,LR:f,RS:26,TQ:o,UW:o,O6:e,RY:f,onRowDragDrop:e,I6:K4,Iq:23,Bb:e,Ny:e};Q.BR.GridString={errorMessage:"\\u53d1\\u751f\\u9519\\u8bef",Sq:"\\Ql\\Mq\\u4ece{SZ}\\u5230{VL}\\uff0c\\u603b {C$} \\OZ \\u3002\\u6bcf\\RM\\Ql\\Mq\\Sr{O7}",pageTextMessage:"Page",loadingMessage:"\\PI\\u8f7d\\RK...",findTextMessage:"\\u67e5\\u627e",noRecordMessage:"\\u6ca1\\SN\\u7b26\\u5408\\OZ\\UD\\u7684\\u8bb0\\u5f55\\OL\\NL",Jg:"\\Ua\\UU\\Sk\\Tq\\u6539\\u53d8,\\u5982\\u679c\\Tn\\Tz\\u5c06\\u4e22\\u5931\\Ua\\UU,\\No\\Pt\\Tn\\Tz?",U6:"\\Sv\\Vm",R4:"\\u4fdd\\OL",TH:"\\u5e94\\u7528",U0:"{MU}\\u884c"};Q.CM.CB=Q.CM.CB||{};Q.BR.CB.IE=Q.BR.CB.IE||{};Q.BR.CB.La=Q.BR.CB.La||{};Q.BR.CB.B9=Q.BR.CB.B9||{};Q.BR.CB.IE["Do"]=5(Q,P){s Q<P?-O:Q>P?O:N};Q.BR.CB.IE["FC"]=5(Q,P){s 7(Q)<7(P)?-O:7(Q)>7(P)?O:N};Q.BR.CB.IE["D1"]=5(Q,P){s Dj(Q)<Dj(P)?-O:Dj(Q)>Dj(P)?O:N};Q.BR.CB.IE["CJ"]=5(Q,P){s Q.localeCompare(P)};Q.BR.CB.La["Do"]=5(BP,Cf){5 HU(D,P){V Q=b,A=b.1;R(Fk(D))s e;V C=P,B={"B1+":D.Fg()+O,"Ce+":D.Fq(),"Lz+":D.Ht(),"Qp+":D.HT(),"IM+":D.Sp(),"Qt+":Ig.VA((D.Fg()+Dw)/Dw),"HP":D.Sg()};R(/(GK+)/.GI(C))C=C.EH(Gg.Hf,(D.GN()+"").FN(C3-Gg.Hf.v));a(V E Bf B)R(DT Gg("("+E+")").GI(C))C=C.EH(Gg.Hf,Gg.Hf.v==O?B[E]:("Mb"+B[E]).FN((""+B[E]).v));s C}R(!BP)s"";R(BO(BP)=="CJ"&&/^\\/EM/.GI(BP)){BP=BP.EH(/^\\//,"DT ").EH(/\\/Q/,"");Sj("BP = "+BP)}R(BP Ho EM){V H3=Cf.H3||b.1.Tm||"PO-PM-P2";s HU(BP,H3)}c s BP.Ej()};Q.BR.CB.B9["Do"]={F6:5(B,P){V C=P.Cf,A=Q("<BS l=\'i\'/>");B.BH(A);V F={},E=C.BY.DU||C.BY.RH;R(E){V D=BO(E)=="5"?E(P.DZ,P.F3,P.BP,C):E;Q.CV(F,D)}A.LD(F);s A},ER:5(P,Q){s P.CZ("Cz","BP")},EL:5(P,A,Q){P.CZ("Cz","BP",A)},C8:5(P,B,A,Q){P.CZ("Cz","q",B);P.CZ("Cz","t",A)},C0:5(P,Q){P.CZ("C0")}};Q.BR.CB.B9["By"]=Q.BR.CB.B9["NM"]={F6:5(B,P){V C=P.Cf,A=Q("<BS l=\'i\'/>");B.BH(A);V F={n:C.BY.n,Co:o,Cj:C.BY.Cj||C.BY.UK,Fm:C.BY.Fm||C.BY.Rs},E=C.BY.DU||C.BY.RH;R(E){V D=BO(E)=="5"?E(P.DZ,P.F3,P.BP,C):E;Q.CV(F,D)}A.Hs(F);s A},ER:5(P,Q){s P.CZ("Cz","BP")},EL:5(P,A,Q){P.CZ("Cz","BP",A)},C8:5(P,B,A,Q){P.CZ("Cz","q",B);P.CZ("Cz","t",A)},C0:5(P,Q){P.CZ("C0")}};Q.BR.CB.B9["FC"]=Q.BR.CB.B9["D1"]=Q.BR.CB.B9["D9"]={F6:5(B,P){V C=P.Cf,A=Q("<BS l=\'i\'/>");B.BH(A);A.Y({KV:"#6E90BE"});V D={l:C.BY.l=="D1"?"D1":"FC"};R(C.BY.Fj!=CG)D.Fj=C.BY.Fj;R(C.BY.Fr!=CG)D.Fr=C.BY.Fr;A.LW(D);s A},ER:5(P,Q){V A=Q.Cf,B=A.BY.l=="FC";R(B)s 7(P.Bj(),Cs);c s Dj(P.Bj())},EL:5(P,A,Q){P.Bj(A)},C8:5(P,B,A,Q){P.CZ("Cz","q",B);P.CZ("Cz","t",A)},C0:5(P,Q){P.CZ("C0")}};Q.BR.CB.B9["CJ"]=Q.BR.CB.B9["i"]={F6:5(B,P){V A=Q("<BS l=\'i\' p=\'M-i-Ef\'/>");B.BH(A);A.Js();s A},ER:5(P,Q){s P.Bj()},EL:5(P,A,Q){P.Bj(A)},C8:5(P,B,A,Q){P.CZ("Cz","q",B);P.CZ("Cz","t",A)},C0:5(P,Q){P.CZ("C0")}};Q.BR.CB.B9["chk"]=Q.BR.CB.B9["9"]={F6:5(B,P){V A=Q("<BS l=\'9\' />");B.BH(A);A.Gh();s A},ER:5(P,Q){s P[N].Bp?O:N},EL:5(P,A,Q){P.Bj(A?f:o)},C8:5(P,B,A,Q){P.CZ("Cz","q",B);P.CZ("Cz","t",A)},C0:5(P,Q){P.CZ("C0")}};Q.2.8.CB=5(P,A){Q.2.8.CB.CW.Cw.BD(b,P,A)};Q.2.8.CB.DA(Q.2.Cm.Dh,{Ci:5(){s"Q.2.8.CB"},DH:5(){s"g"},Dr:5(){s Q.CM.CB},Ei:5(){Q.2.8.CB.CW.Ei.BD(b);V P=b,A=b.1;A.GQ=A.CU?"GX":"HM";R(A.GQ=="HM"){A.n=A.n||[];A.F7="HM"}R(A.RV==o)A.t="E$";R(!A.C1){A.MH=o;A.Ma=o;A.LR=o}R(A.Nr){A.JZ=f;A.LC=o;A.Dt={t:"E$",NU:5(B,C,D){Q(C).6("M-g-Eg-edit");P.M0(B,5(D,P){V B=Q("<W p=\'M-editbox\'></W>");B.q(Oc).t(A.I6+O);B.Ch(C);s B});5 E(){Q(C).0().0().Bm();P.TL(B)}Q("<W p=\'M-F9\'></W>").Ch(C);Q("<W p=\'M-Cb\'>"+A.R4+"</W>").Ch(C).BX(5(){P.It(B);E()});Q("<W p=\'M-Cb\'>"+A.TH+"</W>").Ch(C).BX(5(){P.Km(B)});Q("<W p=\'M-Cb\'>"+A.U6+"</W>").Ch(C).BX(5(){P.Lv(B);E()})}}}R(A.k){A.k.EA=A.k.EA||"CD";A.k.PB=A.k.PB||5(Q){V P=A.k.EA Bf Q;s P};A.k.Uh=A.k.Uh||5(Q){R("Q5"Bf Q&&Q["Q5"]==o)s o;s f}}},DG:5(){V P=b,B=b.1;P.g=Q(P.Bi);P.g.6("M-CS");V C=[];C.d("        <W p=\'M-CS-x\'><BG p=\'M-CS-x-i\'></BG></W>");C.d("                    <W p=\'M-g-D2\'></W>");C.d("        <W p=\'M-CS-KJ\'></W>");C.d("        <W p=\'M-CS-bwarp\'>");C.d("            <W p=\'M-CS-m\'>");C.d("                <W p=\'M-g\'>");C.d("                    <W p=\'M-g-Gk-Gz\'></W>");C.d("                    <W p=\'M-g-DY\'><Bz IA=\'N\' HZ=\'N\'><Cg></Cg></Bz></W>");C.d("                  <W p=\'M-T7\'>");C.d("                      <W p=\'M-g-x M-g-header1\'>");C.d("                          <W p=\'M-g-x-B$\'><Bz p=\'M-g-x-Bz\' IA=\'N\' HZ=\'N\'><Cg></Cg></Bz></W>");C.d("                      </W>");C.d("                      <W p=\'M-g-m M-g-body1\'>");C.d("                      </W>");C.d("                  </W>");C.d("                  <W p=\'M-T9\'>");C.d("                      <W p=\'M-g-x M-g-header2\'>");C.d("                          <W p=\'M-g-x-B$\'><Bz p=\'M-g-x-Bz\' IA=\'N\' HZ=\'N\'><Cg></Cg></Bz></W>");C.d("                      </W>");C.d("                      <W p=\'M-g-m M-g-body2 M-Kb\'>");C.d("                      </W>");C.d("                  </W>");C.d("                 </W>");C.d("              </W>");C.d("         </W>");C.d("         <W p=\'M-CS-Bg\'>");C.d("            <W p=\'M-CS-bbar-B$\'>");C.d("                <W p=\'M-Bg-C6  M-Bg-message\'><BG p=\'M-Bg-i\'></BG></W>");C.d("            <W p=\'M-Bg-C6 M-Bg-L3\'></W>");C.d("                <W p=\'M-Bg-Jc\'></W>");C.d("                <W p=\'M-Bg-C6\'>");C.d("                    <W p=\'M-Bg-Cb M-Bg-Ih\'><BG></BG></W>");C.d("                    <W p=\'M-Bg-Cb M-Bg-I9\'><BG></BG></W>");C.d("                </W>");C.d("                <W p=\'M-Bg-Jc\'></W>");C.d("                <W p=\'M-Bg-C6\'><BG p=\'Im\'> <BS l=\'i\' size=\'C3\' BP=\'O\' B7=\'q:20px\' maxlength=\'Dw\' /> / <BG></BG></BG></W>");C.d("                <W p=\'M-Bg-Jc\'></W>");C.d("                <W p=\'M-Bg-C6\'>");C.d("                     <W p=\'M-Bg-Cb M-Bg-Is\'><BG></BG></W>");C.d("                    <W p=\'M-Bg-Cb M-Bg-I0\'><BG></BG></W>");C.d("                </W>");C.d("                <W p=\'M-Bg-Jc\'></W>");C.d("                <W p=\'M-Bg-C6\'>");C.d("                     <W p=\'M-Bg-Cb M-Bg-Lc\'><BG></BG></W>");C.d("                </W>");C.d("                <W p=\'M-Bg-Jc\'></W>");C.d("                <W p=\'M-F9\'></W>");C.d("            </W>");C.d("         </W>");P.g.BN(C.DC(""));P.x=Q(".M-CS-x:r",P.g);P.m=Q(".M-CS-m:r",P.g);P.Bb=Q(".M-CS-Bg:r",P.g);P.DY=Q(".M-g-DY:r",P.g);P.Pe=Q(".M-g-D2:r",P.g);P.NZ=Q(".M-g-Gk-Gz",P.g);P.KJ=Q(".M-CS-KJ:r",P.g);P.Gq=Q(".M-g:r",P.g);P.Gq.j("U",P.U+"g");P.H1=Q(".M-T7:r",P.Gq);P.H0=Q(".M-T9:r",P.Gq);P.DX=Q(".M-g-x:r",P.H0);P.C5=Q(".M-g-m:r",P.H0);P.Cp={};P.Cp.DX=Q(".M-g-x:r",P.H1);P.Cp.C5=Q(".M-g-m:r",P.H1);P.DD=e;P.O1={};P.B9={};P.BY={Ef:o};R(B.t=="E$")P.B3("FH",5(){R(P.EY())P.Gq.t(Ig.Ew(P.H1.t(),P.H0.t()))});V A=Q.CV({},B);b.MT();b.O_(B.Be);Cy A["Be"];Cy A["n"];Cy A["CU"];P.BZ(A);R(!B.R2)R(B.CU)P.BZ({CU:B.CU});c R(B.n)P.BZ({n:B.n})},Sy:5(Q){R(Q)b.g.6("M-C1");c b.g.$("M-C1")},_setCssClass:5(Q){b.g.6(Q)},_setLoadingMessage:5(Q){b.Pe.BN(Q)},Gt:5(B){V P=b,A=b.1;P.DJ("FH");R(B=="E$"){P.B3("FH",5(){R(P.EY())P.Gq.t(Ig.Ew(P.H1.t(),P.H0.t()))});s}R(BO B=="CJ"&&B.EG("%")>N)R(A.inWindow)B=Q(w).t()*Dj(B)*N.G5;c B=P.g.0().t()*Dj(B)*N.G5;R(A.CK)B-=Os;R(A.IH)B-=Ot;R(A.Nd)B-=25;R(A.Bb)B-=P.KJ.E4();V C=A.Iq*(P.GT-O)+A.Iq-O;B-=C;R(B>N){P.C5.t(B);R(B>Ss)P.Cp.C5.t(B-Ss);P.Gq.t(B+C)}},Jv:5(){V Q=b,A=b.1;R(Q.EY()){Q.H1.q(Q.Cp.DW);V P=Q.Gq.q()-Q.Cp.DW;Q.H0.Y({h:Q.Cp.DW});R(P>N)Q.H0.Y({q:P})}},G0:5(A){V Q=b,P=b.1;R(Q.EY())Q.Fi()},JQ:5(Q){b.1.CU=Q;R(Q){b.1.GQ="GX";b.HJ(f)}c b.1.GQ="HM"},S9:5(Q){b.HJ(b.1.n)},HJ:5(B){V A=b,E=b.1;A.D2=f;V F=e,P=f;R(BO(B)=="5"){F=B;P=o}c R(BO(B)=="MB")P=B;c R(BO(B)=="Dv"&&B){P=o;E.GQ="HM";E.n=B}R(!E.D$)E.D$=O;R(E.F7=="GX")R(!E.MQ)E.MQ="Gn";V C=[];R(E.Iv)R(E.Iv.v)Q(E.Iv).BE(5(){C.d({Bt:b.Bt,BP:b.BP})});c R(BO E.Iv=="Dv")a(V D Bf E.Iv)C.d({Bt:D,BP:E.Iv[D]});R(E.F7=="GX"){R(E.IH){C.d({Bt:E.S5,BP:E.D$});C.d({Bt:E.Uz,BP:E.GE})}R(E.Mg){C.d({Bt:E.Qw,BP:E.Mg});C.d({Bt:E.SO,BP:E.MQ})}}Q(".M-Bg-Lc BG",A.Bb).6("M-_");R(E.GQ=="HM"){A.Dq=A.n=E.n;R(F)A.Dq[E.Cc]=A.MW(A.Dq[E.Cc],F);R(E.IH)A.DD=A.J$(A.Dq);c A.DD=A.Dq;A.Hi()}c R(E.F7=="HM"&&!P){R(A.n&&A.n[E.Cc]){A.Dq=A.n;R(F)A.Dq[E.Cc]=A.MW(A.Dq[E.Cc],F);A.DD=A.J$(A.Dq);A.Hi()}}c A.UM(C,F);A.D2=o},UM:5(A,D){V P=b,B=b.1,C={l:B.Tk,CU:B.CU,n:A,On:B.On,GQ:"OI",beforeSend:5(){R(P.GD("D2"))P.3("D2");c P.MI(f)},FU:5(Q){P.3("FU",[Q,P]);R(!Q||!Q[B.Cc]||!Q[B.Cc].v){P.DD=P.n={};P.DD[B.Cc]=P.n[B.Cc]=[];P.DD[B.DZ]=P.n[B.DZ]=N;P.Hi();s}P.n=Q;R(B.F7=="GX")P.DD=P.n;c{P.Dq=P.n;R(D)P.Dq[B.Cc]=P.MW(P.Dq[B.Cc],D);R(B.IH)P.DD=P.J$(P.Dq);c P.DD=P.Dq}P.Hi.Gf(P,Cs,[P.DD])},O5:5(){P.3("O5",[P]);R(P.GD("JT"))P.3("JT",[P]);c P.MI.Gf(P,Cs,[o])},Eb:5(D,A,C){P.DD=P.n={};P.DD[B.Cc]=P.n[B.Cc]=[];P.DD[B.DZ]=P.n[B.DZ]=N;P.MI.Gf(P,Cs,[o]);Q(".M-Bg-Lc BG",P.Bb).$("M-_");P.3("Eb",[D,A,C])}};R(B.NO)C.NO=B.NO;Q.Nt(C)},MI:5(Q){b.Pe[Q?"BT":"BK"]()},PX:5(P,C,Q,D,A){V B=P.F6(C,Q);R(P.EL)P.EL(B,Q.BP,Q);R(P.C8)P.C8(B,D,A,Q);s B},M0:5(I,C){V P=b,K=b.1;R(!K.JZ||K.LC)s;V B1=P.CX(I);R(B1.MO)s;R(P.3("M0",{DZ:B1,F3:B1["Dz"]})==o)s;P.B9[B1["Ba"]]={};B1.MO=f;P.Dm({Gu:B1});C=C||5(C,B){V D=P.Fe(C,B),A=Q(D).BN("");P.NV(C,B,f);s A};a(V F=N,E=P.Be.v;F<E;F++){V L=P.Be[F];R(!L.Bt||!L.BY||!L.BY.l||!K.B9[L.BY.l])EP;V G=K.B9[L.BY.l],A={DZ:B1,BP:B1[L.Bt],Cf:L,F3:B1["Dz"],g:P},J=C(B1,L),D=J.q(),H=J.t(),B=P.PX(G,J,A,D,H);P.B9[B1["Ba"]][L["Ba"]]={BY:G,BS:B,FK:A,Mf:J}}P.3("afterBeginEdit",{DZ:B1,F3:B1["Dz"]})},Lv:5(P){V Q=b;R(P==CG){a(V D Bf Q.B9)Q.Lv(D)}c{V C=Q.CX(P);R(!Q.B9[C["Ba"]])s;R(Q.3("Lv",{DZ:C,F3:C["Dz"]})==o)s;a(V B Bf Q.B9[C["Ba"]]){V A=Q.B9[C["Ba"]][B];R(A.BY.C0)A.BY.C0(A.BS,A.FK)}Cy Q.B9[C["Ba"]];Cy C["MO"];Q.Dm({Gu:C})}},addEditRow:5(Q){b.Km();Q=b.Cn(Q);b.M0(Q)},Km:5(A){V P=b,B=b.1;R(A==CG){a(V G Bf P.B9)P.Km(G)}c{V F=P.CX(A),Q={};R(!P.B9[F["Ba"]])s;a(V E Bf P.B9[F["Ba"]]){V D=P.B9[F["Ba"]][E],C=D.FK.Cf;R(C.Bt)Q[C.Bt]=D.BY.ER(D.BS,D.FK)}R(P.3("Ub",{DZ:F,F3:F["Dz"],SL:Q})==o)s o;P.OU(F,Q);P.3("afterSubmitEdit",{DZ:F,F3:F["Dz"],SL:Q})}},It:5(P){V Q=b,A=b.1;R(Q.BY.Ef){V B=Q.BY;Q.3("PG",[Q.BY.FK]);Q.3("It",[Q.BY.FK]);R(B.BY.C0)B.BY.C0(B.BS,B.FK);Q.BY.Mf.Bm();Q.Dm({Gu:Q.BY.FK.DZ,Cf:Q.BY.FK.Cf});Q.3("Ry",[Q.BY.FK]);Q.BY={Ef:o}}c R(P!=CG){V D=Q.CX(P);R(!Q.B9[D["Ba"]])s;R(Q.Km(P)==o)s o;a(V C Bf Q.B9[D["Ba"]]){B=Q.B9[D["Ba"]][C];R(B.BY.C0)B.BY.C0(B.BS,B.FK)}Cy Q.B9[D["Ba"]];Cy D["MO"];Q.3("Ry",{DZ:D,F3:D["Dz"]})}c a(V E Bf Q.B9)Q.It(E)},setWidth:5(Q){s b.G0(Q)},I1:5(Q){s b.Gt(Q)},HI:5(){s b.1.9?f:o},EY:5(){V Q=b,A=b.1;R(!A.C1)s o;V P=Q.Be||[];R(Q.KY()&&A.Ma||Q.HI()&&A.MH||A.LR&&A.HY)s f;a(V C=N,B=P.v;C<B;C++)R(P[C].C1)s f;b.Sy(o);s o},VN:5(){R(!b.KY())s o;s b.1.Nr?f:o},KY:5(){R(b.1.Dt&&b.1.Dt.NU)s f;s o},J1:5(){s b.1.Pr?f:o},deleteSelectedRow:5(){R(!b.BC)s;a(V P Bf b.BC){V Q=b.BC[P];R(Q["Ba"]Bf b.Cq)b.M9.Gf(b,Cs,[Q])}b.Dm.Gf(b,FL)},removeRange:5(A){V P=b,B=b.1;Q.BE(A,5(){P.Ne(b)});P.Dm()},Bm:5(P){V Q=b,A=b.1,B=Q.CX(P);Q.Ne(P);Q.Dm()},deleteRange:5(A){V P=b,B=b.1;Q.BE(A,5(){P.M9(b)});P.Dm()},RE:5(P){V Q=b,A=b.1,B=Q.CX(P);R(!B)s;Q.M9(B);Q.Dm();Q.Gj=f},M9:5(P){V Q=b,A=b.1,D=Q.CX(P);D[A.EE]="Cy";R(A.k){V B=Q.JF(D,f);R(B)a(V E=N,C=B.v;E<C;E++)B[E][A.EE]="Cy"}Q.L0=Q.L0||[];Q.L0.d(D);Q.NQ(D)},OH:5(G,J,H){V P=b,I=b.1,K,A,L;R(BO(G)=="CJ"){a(V F=N,C=P.Be.v;F<C;F++)R(P.Be[F].Bt==G)P.OH(F,J,H);s}R(BO(G)=="EC"){K=P.Be[G];L=P.CX(H);A=P.Fe(L,K)}c R(BO(G)=="Dv"&&G["Ba"]){K=G;L=P.CX(H);A=P.Fe(L,K)}c{A=G;V B=A.U.C7("|"),D=B[B.v-O];K=P.De[D];V E=Q(A).0();L=L||P.CX(E[N])}R(J!=e&&K.Bt){L[K.Bt]=J;R(L[I.EE]!="Cn")L[I.EE]="JL";P.Gj=f}P.Dm({Gu:L,Cf:K})},addRows:5(C,E,B,A){V P=b,D=b.1;Q(C).BE(5(){P.Mu(b,E,B,A)})},Ul:5(){s"FY"+(VW+b.Lw)},O0:5(Q){s(Q Bf b.Cq)},UV:5(C,A,D){V Q=b,P=b.1;Q.Lw++;C["Ba"]=Q.Ul();C["Iy"]=A;R(A&&A!=-O){V F=Q.Cq[A];R(F["KA"]&&F["KA"]!=-O){V E=Q.Cq[F["KA"]];R(E)E["Iy"]=C["Ba"]}F["KA"]=C["Ba"];C["Dz"]=F["Dz"]+O}c C["Dz"]=N;R(P.k){R(D&&D!=-O){V B=Q.Cq[D];C["D8"]=D;C["Et"]=B["Et"]+O}c{C["D8"]=-O;C["Et"]=O}C["Jj"]=C[P.k.EA]?f:o}R(C[P.EE]!="Cn")C[P.EE]="nochanged";Q.Dc[C["Dz"]]=C;Q.Cq[C["Ba"]]=C;s C},_getRows:5(B){V Q=b,A=b.1,P=[];5 C(Q){R(!Q||!Q.v)s;a(V E=N,D=Q.v;E<D;E++){V B=Q[E];P.d(B);R(B[A.k.EA])C(B[A.k.EA])}}C(B);s P},TY:5(){V Q=b,A=b.1;Q.Lw=N;Q.Dc=[];Q.Cq={};V P=-O;5 B(C,F){R(!C||!C.v)s;a(V G=N,E=C.v;G<E;G++){V D=C[G];Q.N8(D);R(D[A.EE]=="Cy")EP;Q.UV(D,P,F);P=D["Ba"];R(D["Jj"])B(D[A.k.EA],D["Ba"])}}B(Q.DD[A.Cc],-O);s Q.Dc},P_:5(F,B,A){V D=b,E=b.1,P=D.CX(F),I=D.CX(B),C,G,H=D.JU(P);C=Q.DI(P,H);H.FZ(C,O);H=D.JU(I);G=Q.DI(I,H);H.FZ(G+(A?O:N),N,P)},Fn:5(A,P,Q){b.P_(A,P,Q);b.Dm()},Qi:5(B,P,Q){a(V A Bf B)b.P_(B[A],P,Q);b.Dm()},HO:5(C){V P=b,D=b.1,E=P.CX(C),F=P.JU(E),B=Q.DI(E,F);R(B==-O||B==N)s;V A=P.M5();P.Fn(E,F[B-O],o);P.By(A)},F$:5(C){V P=b,D=b.1,E=P.CX(C),F=P.JU(E),B=Q.DI(E,F);R(B==-O||B==F.v-O)s;V A=P.M5();P.Fn(E,F[B+O],f);P.By(A)},Mu:5(F,E,A,P){V Q=b,B=b.1;F=F||{};Q.QY(F,P,E,A);Q.Dm();F[B.EE]="Cn";R(B.k){V C=Q.JF(F,f);R(C)a(V G=N,D=C.v;G<D;G++)C[G][B.EE]="Cn"}Q.Gj=f;B.C$=B.C$?(B.C$+O):O;B.D5=Ig.VD(B.C$/B.GE);Q.Nf();Q.3("FH");Q.3("afterAddRow",[F]);s F},OU:5(A,B){V P=b,C=b.1,D=P.CX(A);P.Gj=f;Q.CV(D,B||{});R(D[C.EE]!="Cn")D[C.EE]="JL";P.Dm.Gf(P,Cs,[{Gu:D}]);s D},NV:5(G,E,A){V P=b,D=b.1,C=P.Fe(G,E),H=A?"6":"$";Q(C)[H]("M-g-Bo-BA-Ef");R(G["Ba"]!=N){V F=Q(P.Cr(G["Ba"])).FI();R(!F.v)s;V I=P.CX(F[N]),B=P.Fe(I,E);R(!B)s;Q(B)[H]("M-g-Bo-BA-Ef-topcell")}R(E["Iy"]!=-O&&E["Iy"]!=e){B=Q(P.Fe(G,E)).FI();Q(B)[H]("M-g-Bo-BA-Ef-leftcell")}},Dm:5(A){V P=b,D=b.1;A=A||{};V F=A.Gu,E=A.Cf;R(E&&(E.Ic||E.Ks))s;R(F&&F[D.EE]=="Cy")s;R(F&&E){V C=P.Fe(F,E);Q(C).BN(P.PK(F,E));R(!E.Hr)P.NV(F,E,o)}c R(F)Q(P.Be).BE(5(){P.Dm({Gu:F,Cf:b})});c R(E){a(V G Bf P.Cq)P.Dm({Gu:P.Cq[G],Cf:E});a(V H=N;H<P.JS;H++){V B=CE.Ey(P.U+"|C$"+H+"|"+E["Ba"]);Q("W:r",B).BN(P.OJ(E,P.G8&&P.G8[H]?P.G8[H]:P.DD[D.Cc]))}}c P.Hi()},KH:5(B,A){V P=b,C=b.1,D=[];a(V F Bf P.Cq){V E=Q.CV(f,{},P.Cq[F]);R(E[C.EE]==B||B==CG)D.d(P.N8(E,A))}s D},N8:5(P,Q){Cy P["Ba"];Cy P["Iy"];Cy P["KA"];Cy P["Dz"];R(b.1.k){Cy P["D8"];Cy P["Et"];Cy P["Jj"]}R(Q)Cy P[b.1.EE];s P},getUpdated:5(){s b.KH("JL",f)},getDeleted:5(){s b.L0},getAdded:5(){s b.KH("Cn",f)},Ls:5(Q){V P=b,B=b.1;R(BO Q=="CJ"){R(P.Le(Q))s P.De[Q];c s P.Be[7(Q)]}c R(BO(Q)=="EC")s P.Be[Q];c R(BO Q=="Dv"&&Q.VI==O){V A=Q.U.C7("|"),C=A[A.v-O];s P.De[C]}s Q},UA:5(P){V Q=b,A=b.1;a(Er=N;Er<Q.Be.v;Er++)R(Q.Be[Er].Bt==P){R(Q.Be[Er].l)s Q.Be[Er].l;s"CJ"}s e},M2:5(){V Q=b,P=b.1;a(V A=N;A<Q.Be.v;A++)R(Q.Be[A].KD)s f;s o},Oq:5(A){V P=b,C=b.1,D=[];a(V Q Bf P.De){V B=P.De[Q];R(A!=CG){R(B["Et"]==A)D.d(B)}c R(B["Ha"])D.d(B)}s D},NC:5(C,A){V Q=b,B=b.1;R(Q.D2)s f;R(B.F7=="HM"){V P=Q.UA(C);R(!Q.Ju)Q.Ju=Q.Dq;R(B.Mg==C)Q.Ju[B.Cc].reverse();c Q.Ju[B.Cc].FJ(5(A,B){s Q.Sa(A,B,C,P)});R(B.IH)Q.DD=Q.J$(Q.Ju);c Q.DD=Q.Ju;Q.Hi()}B.Mg=C;B.MQ=A;R(B.F7=="GX")Q.HJ(B.KZ)},I3:5(B){V P=b,A=b.1;R(P.D2)s f;R(A.F7!="HM"&&P.Gj&&!JD(A.Jg))s o;A.D5=7(Q(".Im BG",P.Bb).BN());Pq(B){EJ"r":R(A.D_==O)s;A.D$=O;Dl;EJ"FI":R(A.D_==O)s;R(A.D_>O)A.D$=7(A.D_)-O;Dl;EJ"Ev":R(A.D_>=A.D5)s;A.D$=7(A.D_)+O;Dl;EJ"CR":R(A.D_>=A.D5)s;A.D$=A.D5;Dl;EJ"BS":V C=7(Q(".Im BS",P.Bb).Bj());R(Fk(C))C=O;R(C<O)C=O;c R(C>A.D5)C=A.D5;Q(".Im BS",P.Bb).Bj(C);A.D$=C;Dl}R(A.D$==A.D_)s o;R(A.D$==O){Q(".M-Bg-Ih BG",P.Bb).6("M-_");Q(".M-Bg-I9 BG",P.Bb).6("M-_")}c{Q(".M-Bg-Ih BG",P.Bb).$("M-_");Q(".M-Bg-I9 BG",P.Bb).$("M-_")}R(A.D$==A.D5){Q(".M-Bg-I0 BG",P.Bb).6("M-_");Q(".M-Bg-Is BG",P.Bb).6("M-_")}c{Q(".M-Bg-I0 BG",P.Bb).$("M-_");Q(".M-Bg-Is BG",P.Bb).$("M-_")}P.3("I3",[A.D$]);R(A.F7=="GX")P.HJ(A.KZ);c{P.DD=P.J$(P.Dq);P.Hi()}},VE:5(){a(V P Bf b.BC){V Q=b.BC[P];R(Q["Ba"]Bf b.Cq)s Q}s e},QW:5(){V Q=[];a(V A Bf b.BC){V P=b.BC[A];R(P["Ba"]Bf b.Cq)Q.d(P)}s Q},getSelectedRowObj:5(){a(V P Bf b.BC){V Q=b.BC[P];R(Q["Ba"]Bf b.Cq)s b.Cr(Q)}s e},TB:5(){V Q=[];a(V A Bf b.BC){V P=b.BC[A];R(P["Ba"]Bf b.Cq)Q.d(b.Cr(P))}s Q},Fe:5(Q,P){V A=b.CX(Q);P=b.Ls(P);s CE.Ey(b.QD(A,P))},Cr:5(P,B){V Q=b,A=b.1;R(P==e)s e;R(BO(P)=="CJ"){R(Q.O0(P))s CE.Ey(Q.U+(B?"|O|":"|Bl|")+P);c s CE.Ey(Q.U+(B?"|O|":"|Bl|")+Q.Dc[7(P)]["Ba"])}c R(BO(P)=="EC")s CE.Ey(Q.U+(B?"|O|":"|Bl|")+Q.Dc[P]["Ba"]);c R(BO(P)=="Dv"&&P["Ba"])s Q.Cr(P["Ba"],B);s P},CX:5(P){V Q=b,A=b.1;R(P==e)s e;R(BO(P)=="CJ"){R(Q.O0(P))s Q.Cq[P];c s Q.Dc[7(P)]}c R(BO(P)=="EC")s Q.Dc[7(P)];c R(BO(P)=="Dv"&&P.VI==O&&!P["Ba"])s Q.N7(P.U);s P},K8:5(C,A){V P=b,B=b.1;R(!A){C.GA=o;CE.Ey(C["Fu"]).B7.CY="";R(C["D8"]!=-O){V Q=P.De[C["D8"]];R(Q.GA){CE.Ey(Q["Fu"]).B7.CY="";b.K8(Q,A)}}}c{C.GA=f;CE.Ey(C["Fu"]).B7.CY="DN";R(C["D8"]!=-O){V D=f,Q=b.De[C["D8"]];a(V E=N;Q&&E<Q.Be.v;E++)R(!Q.Be[E].GA){D=o;Dl}R(D){Q.GA=f;CE.Ey(Q["Fu"]).B7.CY="DN";b.K8(Q,A)}}}},Qc:5(P,E,A){V B=b,I=b.1,J;R(BO(P)=="EC")J=B.Be[P];c R(BO(P)=="Dv"&&P["Ba"])J=P;c R(BO(P)=="CJ")R(B.Le(P))J=B.De[P];c{Q(B.Be).BE(5(){R(b.Bt==P)B.Qc(b,E,A)});s}R(!J)s;V L=J["LI"],G=CE.Ey(J["Fu"]);R(!G)s;G=Q(G);V C=[];a(V H Bf B.Dc){V K=B.Fe(B.Dc[H],J);R(K)C.d(K)}a(H=N;H<B.JS;H++){V F=CE.Ey(B.U+"|C$"+H+"|"+J["Ba"]);R(F)C.d(F)}V D=J.Dn;R(E&&J.GA){R(J.C1)B.Cp.DW+=(7(D)+O);c B.DW+=(7(D)+O);B.K8(J,o);Q(C).BT()}c R(!E&&!J.GA){R(J.C1)B.Cp.DW-=(7(D)+O);c B.DW-=(7(D)+O);B.K8(J,f);Q(C).BK()}R(J.C1){Q("W:r",B.Cp.DX).q(B.Cp.DW);Q("W:r",B.Cp.C5).q(B.Cp.DW)}c{Q("W:r",B.DX).q(B.DW+Ii);Q("W:r",B.C5).q(B.DW)}B.Jv();R(!A)Q(":9[Fw="+L+"]",B.DY).BE(5(){b.Bp=E;R(Q.Br.Gh){V P=Q(b).O4();R(P)P.IO()}})},Of:5(P,G){V A=b,I=b.1;R(!G)s;G=7(G,Cs);V J;R(BO(P)=="EC")J=A.Be[P];c R(BO(P)=="Dv"&&P["Ba"])J=P;c R(BO(P)=="CJ")R(A.Le(P))J=A.De[P];c{Q(A.Be).BE(5(){R(b.Bt==P)A.Of(b,G)});s}R(!J)s;V E=I.UT;R(J.JP)E=J.JP;G=G<E?E:G;V C=G-J.Dn;R(A.3("beforeChangeColumnWidth",[J,G])==o)s;J.Dn=G;R(J.C1){A.Cp.DW+=C;Q("W:r",A.Cp.DX).q(A.Cp.DW);Q("W:r",A.Cp.C5).q(A.Cp.DW)}c{A.DW+=C;Q("W:r",A.DX).q(A.DW+Ii);Q("W:r",A.C5).q(A.DW)}Q(CE.Ey(J["Fu"])).Y("q",G);V B=[];a(V L Bf A.Cq){V K=A.Fe(A.Cq[L],J);R(K)B.d(K);R(!A.VN()&&A.B9[L]&&A.B9[L][J["Ba"]]){V F=A.B9[L][J["Ba"]];R(F.BY.C8)F.BY.C8(F.BS,G,F.Mf.t(),F.FK)}}a(V H=N;H<A.JS;H++){V D=CE.Ey(A.U+"|C$"+H+"|"+J["Ba"]);R(D)B.d(D)}Q(B).Y("q",G).B8("> W.M-g-Bo-BA-B$:r").Y("q",G-Lu);A.Jv();A.3("afterChangeColumnWidth",[J,G])},Tb:5(A,F){V P=b,B=b.1,C;R(BO(A)=="EC")C=P.Be[A];c R(BO(A)=="Dv"&&A["Ba"])C=A;c R(BO(A)=="CJ")R(P.Le(A))C=P.De[A];c{Q(P.Be).BE(5(){R(b.Bt==A)P.Tb(b,F)});s}R(!C)s;V E=C["LI"],D=CE.Ey(C["Fu"]);Q(".M-g-CF-BA-i",D).BN(F);R(B.JI)Q(":9[Fw="+E+"]",P.DY).0().Ev().BN(F)},VJ:5(E,P,G){V A=b,K=b.1;R(!E||!P)s;V H=A.Ls(E),J=A.Ls(P);H.C1=J.C1;V B,D,L=H["D8"]==-O?K.Be:A.De[H["D8"]].Be,F=J["D8"]==-O?K.Be:A.De[J["D8"]].Be;B=Q.DI(H,L);D=Q.DI(J,F);V C=L==F,I=H["Et"]==J["Et"];F.FZ(D+(G?O:N),N,H);R(!C)L.FZ(B,O);c R(G)L.FZ(B,O);c L.FZ(B+O,O);A.O_(K.Be);A.Dm()},TL:5(A){V P=b,C=b.1,E=P.CX(A);R(!E)s;a(V G=N,D=P.Be.v;G<D;G++)R(P.Be[G].Ic){V F=P.Cr(E),B=P.Fe(E,P.Be[G]);Q(F).Ev("Bd.M-g-Eg").BK();Q(".M-g-Bo-BA-F2:r",B).$("M-CP");P.3("FH");s}},extendDetail:5(A){V P=b,C=b.1,E=P.CX(A);R(!E)s;a(V G=N,D=P.Be;G<D;G++)R(P.Be[G].Ic){V F=P.Cr(E),B=P.Fe(E,P.Be[G]);Q(F).Ev("Bd.M-g-Eg").BT();Q(".M-g-Bo-BA-F2:r",B).6("M-CP");P.3("FH");s}},KN:5(P){V Q=b,A=b.1;R(!A.k)s e;V B=Q.CX(P);R(!B)s e;R(B["D8"]Bf Q.Cq)s Q.Cq[B["D8"]];c s e},JF:5(A,E){V Q=b,B=b.1;R(!B.k)s e;V C=Q.CX(A);R(!C)s e;V P=[];5 D(Q){R(Q[B.k.EA])a(V F=N,C=Q[B.k.EA].v;F<C;F++){V A=Q[B.k.EA][F];R(A["PZ"]=="Cy")EP;P.d(A);R(E)D(A)}}D(C);s P},Jy:5(P){V Q=b,A=b.1,B=Q.CX(P);R(!B)s;s B["Jj"]?o:f},LN:5(P){V Q=b,A=b.1,B=b.CX(P);R(!B)s;s(B[A.k.EA]&&B[A.k.EA].v)?f:o},L$:5(Q){a(V P Bf b.Cq)R(b.Cq[P]==Q)s f;s o},NQ:5(F){V P=b,B=b.1;R(B.k){V C=P.JF(F,f);R(C)a(V G=N,E=C.v;G<E;G++){V D=Q.DI(C[G],P.BC);R(D!=-O)P.BC.FZ(D,O)}}V A=Q.DI(F,P.BC);R(A!=-O)P.BC.FZ(A,O)},JU:5(P){V Q=b,A=b.1,B=Q.CX(P),C;R(A.k&&Q.L$(B)&&B["D8"]Bf Q.Cq)C=Q.Cq[B["D8"]][A.k.EA];c C=Q.DD[A.Cc];s C},Ne:5(C){V P=b,B=b.1,D=P.JU(C),A=Q.DI(C,D);R(A!=-O)D.FZ(A,O);P.NQ(C)},QY:5(F,D,E,B){V P=b,C=b.1,G=P.DD[C.Cc];R(E){R(C.k)R(D)G=D[C.k.EA];c R(E["D8"]Bf P.Cq)G=P.Cq[E["D8"]][C.k.EA];V A=Q.DI(E,G);G.FZ(A==-O?-O:A+(B?N:O),N,F)}c{R(C.k&&D)G=D[C.k.EA];G.d(F)}},LK:5(D,B,C,P){V Q=b,A=b.1;D[A.EE]="JL";Q.Ne(D);Q.QY(D,B,C,P)},PV:5(F,C,D,A){V P=b,B=b.1,E=o;Q.BE(F,5(B,Q){R(Q["Ba"]&&P.L$(Q)){R(P.Jy(C))P.Kk(C);P.LK(Q,C,D,A);E=f}c P.Pw(Q,C,D,A)});R(E)P.Dm()},Pw:5(E,C,D,A){V P=b,B=b.1;R(Q.isArray(E)){P.PV(E,C,D,A);s}R(E["Ba"]&&P.L$(E)){P.LK(E,C,D,A);P.Dm();s}R(C&&P.Jy(C))P.Kk(C);P.Mu(E,D,A?f:o,C)},Kk:5(A){V P=b,B=b.1,C=P.CX(A);R(!C||!B.k)s;C[B.k.EA]=C[B.k.EA]||[];C["Jj"]=f;V D=[P.Cr(C)];R(P.EY())D.d(P.Cr(C,f));Q("> T > W > .M-g-k-DV:CR",D).6("M-g-k-Bx M-g-k-Bx-CP")},RP:5(A){V P=b,B=b.1,E=P.CX(A);R(!E||!B.k)s;V F=[P.Cr(E)];R(P.EY())F.d(P.Cr(E,f));Q("> T > W > .M-g-k-DV:CR",F).$("M-g-k-Bx M-g-k-Bx-CP M-g-k-Bx-BM");R(P.LN(E)){V C=P.JF(E);a(V G=N,D=C.v;G<D;G++)P.RE(C[G])}E["Jj"]=o},DQ:5(B){V P=b,C=b.1,D=P.Cr(B),A=Q(".M-g-k-Bx",D);R(A.BF("M-g-k-Bx-BM"))s;P.BV(B)},VM:5(B){V P=b,C=b.1,D=P.Cr(B),A=Q(".M-g-k-Bx",D);R(A.BF("M-g-k-Bx-CP"))s;P.BV(B)},BV:5(G){R(!G)s;V P=b,I=b.1,L=P.CX(G),J=[P.Cr(L)];R(P.EY())J.d(P.Cr(L,f));V F=L["Et"],B1,H=Q(".M-g-k-Bx:r",J),K=f;P.GO=P.GO||[];R(H.BF("M-g-k-Bx-BM")){H.$("M-g-k-Bx-BM").6("M-g-k-Bx-CP");B1=Q.DI(L,P.GO);R(B1!=-O)P.GO.FZ(B1,O)}c{K=o;H.6("M-g-k-Bx-BM").$("M-g-k-Bx-CP");B1=Q.DI(L,P.GO);R(B1==-O)P.GO.d(L)}V B=P.JF(L,f);a(V E=N,D=B.v;E<D;E++){V A=B[E],C=Q([P.Cr(A["Ba"])]);R(P.EY())C=C.Cn(P.Cr(A["Ba"],f));R(K){Q(".M-g-k-Bx",C).$("M-g-k-Bx-BM").6("M-g-k-Bx-CP");C.BT()}c{Q(".M-g-k-Bx",C).$("M-g-k-Bx-CP").6("M-g-k-Bx-BM");C.BK()}}},MT:5(){V Q=b;Q.Pc();Q.Sb();Q.Ta();Q.Qo();Q.Nf();Q.Nj()},O_:5(P){V Q=b;Q.R8();Q.Un();Q.Rz()},Sb:5(){V P=b,A=b.1;R(A.CK){Q(".M-CS-x-i",P.x).BN(A.CK);R(A.Ny)P.x.BH("<H$ E6=\'"+A.Ny+"\' />").6("M-CS-x-NT")}c P.x.BK();R(A.Bb){R(Q.Br.Nb)P.toolbarManager=P.KJ.Nb(A.Bb)}c P.KJ.Bm()},Q2:5(Q){R(Q.U!=e)s Q.U.Ej();s"Vr"+(GY+b.Oo)},Le:5(Q){s(Q Bf b.De)},R8:5(){V A=b,I=b.1;A.De={};A.Oo=N;A.RL=N;A.GT=O;R(!I.Be)s;5 B(Q,P){a(V A Bf P)R(P[A]Bf Q)Cy Q[P[A]]}5 K(E,C,G,D){B(E,["Ba","D8","Iy","KA","Fu","Ha","LI","Et","L7","IW"]);R(C>A.GT)A.GT=C;A.Oo++;E["Ba"]=A.Q2(E);E["Fu"]=A.U+"|Fs|"+E["Ba"];A.De[E["Ba"]]=E;R(!E.Be||!E.Be.v)E["LI"]=A.RL++;E["Et"]=C;E["D8"]=G;E["Iy"]=D;R(!E.Be||!E.Be.v){E["Ha"]=f;s O}V Q=N,H=-O;a(V I=N,F=E.Be.v;I<F;I++){V P=E.Be[I];Q+=K(P,C+O,E["Ba"],H);H=P["Ba"]}E["Pk"]=Q;s Q}V D=-O;R(I.HY){V J=A.J1()?o:I.C1&&I.LR,C={KK:f,Hr:f,q:I.RS,C1:J};K(C,O,-O,D);D=C["Ba"]}R(A.KY()){V E=A.J1()?o:I.C1&&I.Ma,C={Ic:f,Hr:f,q:I.Ng,C1:E};K(C,O,-O,D);D=C["Ba"]}R(A.HI()){V P=A.J1()?o:I.C1&&I.MH,C={Ks:f,Hr:f,q:I.Ng,C1:P};K(C,O,-O,D);D=C["Ba"]}a(V G=N,F=I.Be.v;G<F;G++){C=I.Be[G];K(C,O,-O,D);D=C["Ba"]}a(V H Bf A.De){C=A.De[H];R(C["Pk"]>O)C["L7"]=C["Pk"];R(C["Ha"]&&C["Et"]!=A.GT)C["IW"]=A.GT-C["Et"]+O}A.Be=A.Oq();Q(A.Be).BE(5(P,Q){Q.Gw=Q.Bt;Q.Fw=P;Q.l=Q.l||"CJ";Q.P0=P==A.Be.v-O;Q.OD=Q.OD==o?o:f;Q.C1=Q.C1?f:o;Q.Dn=A.Ve(Q);Q.GA=Q.BK?f:o})},Ve:5(B){V Q=b,A=b.1;R(B.Dn)s B.Dn;V P;R(B.q)P=B.q;c R(A.K$)P=A.K$;R(!P){V C=C3;R(Q.HI())C+=A.TU;R(Q.KY())C+=A.Ng;P=7((Q.g.q()-C)/Q.Be.v)}R(BO(P)=="CJ"&&P.EG("%")>N)B.Dn=P=7(7(P)*N.G5*(Q.g.q()-Q.Be.v));R(B.JP&&P<B.JP)P=B.JP;R(B.L1&&P>B.L1)P=B.L1;B.Dn=P;s P},Vf:5(B){V P=b,A=b.1,D=Q("<T p=\'M-g-CF-BA\'><W p=\'M-g-CF-BA-B$\'><BG p=\'M-g-CF-BA-i\'></BG></W></T>");D.j("U",B["Fu"]);R(!B["Ha"])D.6("M-g-CF-BA-VR");R(B.Fw==P.Be.v-O)D.6("M-g-CF-BA-CR");R(B.KK){D.6("M-g-CF-BA-HY");D.BN("<W p=\'M-g-CF-BA-B$\'></W>")}R(B.Ks){D.6("M-g-CF-BA-9");D.BN("<W p=\'M-g-CF-BA-B$\'><W p=\'M-g-CF-BA-i M-g-CF-BA-CA-9\'></W></W>")}R(B.Ic){D.6("M-g-CF-BA-Dt");D.BN("<W p=\'M-g-CF-BA-B$\'><W p=\'M-g-CF-BA-i M-g-CF-BA-CA-Dt\'></W></W>")}R(B.VQ)Q(".M-g-CF-BA-B$:r",D).Y("SE",B.VQ);R(B["L7"])D.j("JW",B["L7"]);R(B["IW"]){D.j("rowSpan",B["IW"]);D.t(A.Iq*B["IW"])}c D.t(A.Iq);R(B["Ha"]){D.q(B["Dn"]);D.j("Fw",B["LI"])}R(B.GA)D.BK();R(B.Bt)D.j({Gw:B.Bt});V C="";R(B.CY&&B.CY!="")C=B.CY;c R(B.Th)C=B.Th(B);c C="&Ex;";Q(".M-g-CF-BA-i:r",D).BN(C);R(!B.Hr&&B["Ha"]&&B.Ds!==o&&Q.Br.Gm)P.KB[B["Ba"]]=D.Gm({KM:"IJ",Ke:5(A,Q){b.B4.BK();P.NZ.Y({t:P.m.t(),X:N,h:Q.EU-P.g.Bw().h+7(P.m[N].Ki)}).BT()},H5:5(B,A){P.J5=f;P.NZ.Y({h:A.EU-P.g.Bw().h+7(P.m[N].Ki)});Q("m").Cn(D).Y("CN","IJ-C8")},Mi:5(A){P.J5=o;Q("m").Cn(D).Y("CN","Ez");P.NZ.BK();P.Of(B,B.Dn+A.HD);s o}});s D},Un:5(){V P=b,D=b.1;P.DW=N;P.Cp.DW=N;R(P.KB){a(V H Bf P.KB)P.KB[H].C0();P.KB=e}P.KB={};Q("Cg:r",P.DX).BN("");Q("Cg:r",P.Cp.DX).BN("");a(V A=O;A<=P.GT;A++){V E=P.Oq(A),C=A==P.GT,B=Q("<Bd p=\'M-g-CF-Bo\'></Bd>"),F=Q("<Bd p=\'M-g-CF-Bo\'></Bd>");R(!C)B.Cn(F).6("M-g-CF-VR");Q("Cg:r",P.DX).BH(B);Q("Cg:r",P.Cp.DX).BH(F);Q(E).BE(5(C,A){(A.C1?F:B).BH(P.Vf(A));R(A["Ha"]){V Q=A["Dn"];R(!A.C1)P.DW+=(7(Q)?7(Q):N)+O;c P.Cp.DW+=(7(Q)?7(Q):N)+O}})}R(P.GT>N){V G=D.Iq*P.GT;P.DX.Cn(P.Cp.DX).t(G);R(D.HY&&D.LR)P.Cp.DX.B8("T:r").t(G)}P.Jv();Q("W:r",P.DX).q(P.DW+Ii)},Rz:5(){V P=b,A=b.1;Q(":9",P.DY).DJ();Q("Cg Bd",P.DY).Bm();Q(P.Be).BE(5(D,B){R(B.Hr)s;R(B.isAllowHide==o)s;V A="Bp=\\"Bp\\"";R(B.GA)A="";V C=B.CY;Q("Cg",P.DY).BH("<Bd><T p=\\"M-Cf-h\\"><BS l=\\"9\\" "+A+" p=\\"M-9\\" Fw=\\""+D+"\\"/></T><T p=\\"M-Cf-BJ\\">"+C+"</T></Bd>")});R(Q.Br.Gh)Q("BS:9",P.DY).Gh({onBeforeClick:5(B){R(!B.Bp)s f;R(Q("BS:Bp",P.DY).v<=A.QJ)s o;s f}});R(A.JI){Q("Bd",P.DY).B2(5(){Q(b).6("M-DY-Bo-BB")},5(){Q(b).$("M-DY-Bo-BB")});V B=5(){R(Q("BS:Bp",P.DY).v+O<=A.QJ)s o;P.Qc(7(Q(b).j("Fw")),b.Bp,f)};R(Q.Br.Gh)Q(":9",P.DY).B3("Dp",B);c Q(":9",P.DY).B3("BX",B)}},Ta:5(){V Q=b,P=b.1;R(P.t=="E$"){Q.C5.t("E$");Q.Cp.C5.t("E$")}R(P.q)Q.g.q(P.q);Q.Fi.BD(Q)},Qo:5(){V P=b,C=b.1;R(C.IH){V B="",A=-O;Q(C.UP).BE(5(D,Q){V P="";R(C.GE==Q)A=D;B+="<Cz BP=\'"+Q+"\' "+P+" >"+Q+"</Cz>"});Q(".M-Bg-L3",P.Bb).BH("<By Bt=\'rp\'>"+B+"</By>");R(A!=-O)Q(".M-Bg-L3 By",P.Bb)[N].Ik=A;R(C.Se&&Q.Br.Hs)Q(".M-Bg-L3 By",P.Bb).Hs({Oe:5(){R(C.CU&&P.Gj&&!JD(C.Jg))s o;s f},q:45})}c P.Bb.BK()},MW:5(B,D){V P=b,A=b.1,Q=DT Hh();a(V C=N;C<B.v;C++)R(D(B[C],C))Q[Q.v]=B[C];s Q},Pc:5(){V P=b,B=b.1;a(V C Bf P.Dc){V A=Q(P.Cr(P.Dc[C]));R(P.EY())A=A.Cn(P.Cr(P.Dc[C],f));A.DJ()}P.C5.BN("");P.Cp.C5.BN("");P.Lw=N;P.Cq={};P.Dc=[];P.BC=[];P.JS=N;P.editorcounter=N},Om:5(G,I){V P=b,F=b.1,H=["<W p=\\"M-g-m-B$\\"><Bz p=\\"M-g-m-Bz\\" IA=N HZ=N><Cg>"];R(P.J1()){V J=[],A=[];P.G8=A;a(V C Bf G){V E=G[C],B=E[F.Pr],D=Q.DI(B,J);R(D==-O){J.d(B);D=J.v-O;A.d([])}A[D].d(E)}Q(A).BE(5(B,Q){R(A.v==O)H.d("<Bd p=\\"M-g-E8 M-g-E8-CR M-g-E8-r\\"");R(B==A.v-O)H.d("<Bd p=\\"M-g-E8 M-g-E8-CR\\"");c R(B==N)H.d("<Bd p=\\"M-g-E8 M-g-E8-r\\"");c H.d("<Bd p=\\"M-g-E8\\"");H.d(" groupindex\\"="+B+"\\" >");H.d("<T JW=\\""+P.Be.v+"\\" p=\\"M-g-E8-BA\\">");H.d("<BG p=\\"M-g-C6-LU\\">&Ex;&Ex;&Ex;&Ex;</BG>");R(F.QZ)H.d(F.QZ(J[B],Q,F.QR));c H.d(F.QR+":"+J[B]);H.d("</T>");H.d("</Bd>");H.d(P.QC(Q,I));R(P.M2())H.d(P.Nw(Q,"M-g-Ee-C6",I))})}c H.d(P.QC(G,I));H.d("</Cg></Bz></W>");(I?P.Cp.C5:P.C5).BN(H.DC(""));R(!P.J1())P.R0(I);Q("> W:r",P.C5).q(P.DW);P.Fi()},Hi:5(){V P=b,B=b.1,C=P.DD[B.Cc];R(B.IH){R(B.F7=="GX"&&P.n&&P.n[B.DZ])B.C$=P.n[B.DZ];c R(P.Dq&&P.Dq[B.Cc])B.C$=P.Dq[B.Cc].v;c R(P.n&&P.n[B.Cc])B.C$=P.n[B.Cc].v;c R(C)B.C$=C.v;B.D_=B.D$;R(!B.C$)B.C$=N;R(!B.D_)B.D_=O;B.D5=Ig.VD(B.C$/B.GE);R(!B.D5)B.D5=O;P.Nf()}Q(".M-Bg-RQ:r",P.Bb).$("M-Bg-RQ");R(P.3("beforeShowData",[P.DD])==o)s;P.Pc();P.Gj=o;R(!C)s;Q(".M-Bg-Lc:r BG",P.Bb).$("M-_");P.TY();R(P.EY())P.Om(P.Dc,f);P.Om(P.Dc,o);P.3("FH");R(B.Nd){Q(".M-CS-Bg-C$",P.Bi).Bm();Q(".M-CS-Bg",P.Bi).IY("<W p=\\"M-CS-Bg-C$\\">"+B.Nd(P.n,P.Dq)+"</W>")}R(B.L9)a(V D Bf P.Dc){V A=Q(P.Cr(P.Dc[D]));R(P.EY())A=A.Cn(P.Cr(P.Dc[D],f));A.B3("Kp.Qv",5(){P.PH(b,f)}).B3("Ko.Qv",5(){P.PH(b,o)})}P.C5.3("Kb.g");P.3("afterShowData",[P.DD])},Pu:5(P,Q){s b.U+"|"+(Q?"O":"Bl")+"|"+P["Ba"]},QD:5(P,Q){s b.Pu(P,Q.C1)+"|"+Q["Ba"]},QC:5(D,F){R(!D)s"";V P=b,C=b.1,E=[];a(V A Bf D){V B=D[A],G=B["Ba"];R(!B)EP;E.d("<Bd");E.d(" U=\\""+P.Pu(B,F)+"\\"");E.d(" p=\\"M-g-Bo");R(!F&&P.HI()&&C.Og&&C.Og(B)){P.By(B);E.d(" M-BC")}c R(P.SA(B))E.d(" M-BC");R(B["Dz"]%Bl==O&&C.Qm)E.d(" M-g-Bo-P9");E.d("\\" ");R(C.Pd)E.d(C.Pd(B,G));R(C.k&&P.GO&&P.GO.v){V H=5(){V A=P.KN(B);RN(A){R(Q.DI(A,P.GO)!=-O)s f;A=P.KN(A)}s o};R(H())E.d(" B7=\\"CY:DN;\\" ")}E.d(">");Q(P.Be).BE(5(D,A){R(F!=A.C1)s;E.d("<T");E.d(" U=\\""+P.QD(B,b)+"\\"");R(b.KK){E.d(" p=\\"M-g-Bo-BA M-g-Bo-BA-HY\\" B7=\\"q:"+b.q+"Em\\"><W p=\\"M-g-Bo-BA-B$\\"");R(C.K6)E.d(" B7 = \\"t:"+C.I6+"Em;\\" ");E.d(">"+(7(B["Dz"])+O)+"</W></T>");s}R(b.Ks){E.d(" p=\\"M-g-Bo-BA M-g-Bo-BA-9\\" B7=\\"q:"+b.q+"Em\\"><W p=\\"M-g-Bo-BA-B$\\"");R(C.K6)E.d(" B7 = \\"t:"+C.I6+"Em;\\" ");E.d("><BG p=\\"M-g-Bo-BA-CA-9\\"></BG></W></T>");s}c R(b.Ic){E.d(" p=\\"M-g-Bo-BA M-g-Bo-BA-Dt\\" B7=\\"q:"+b.q+"Em\\"><W p=\\"M-g-Bo-BA-B$\\"");R(C.K6)E.d(" B7 = \\"t:"+C.I6+"Em;\\" ");E.d("><BG p=\\"M-g-Bo-BA-F2\\"></BG></W></T>");s}V Q=b.Dn;E.d(" p=\\"M-g-Bo-BA ");R(P.O1[G+"P"+b["Ba"]])E.d("M-g-Bo-BA-SU ");R(b.P0)E.d("M-g-Bo-BA-CR ");E.d("\\"");E.d(" B7 = \\"");E.d("q:"+Q+"Em; ");R(A.GA)E.d("CY:DN;");E.d(" \\">");E.d(P.PK(B,A));E.d("</T>")});E.d("</Bd>")}s E.DC("")},PK:5(D,B){V P=b,A=b.1;R(B.KK)s"<W p=\\"M-g-Bo-BA-B$\\">"+(7(D["Dz"])+O)+"</W>";V C=[];C.d("<W p=\\"M-g-Bo-BA-B$\\"");C.d(" B7 = \\"q:"+7(B.Dn-Lu)+"Em;");R(A.K6)C.d("t:"+A.I6+"Em;FW-t:"+A.I6+"Em; ");R(B.Bn)C.d("i-Bn:"+B.Bn+";");V Q=P.Q_(D,B);C.d("\\">"+Q+"</W>");s C.DC("")},Q_:5(D,C){R(!D||!C)s"";R(C.KK)s 7(D["Dz"])+O;V F=D["Ba"],E=D["Dz"],B=C.Bt?D[C.Bt]:e,P=b,A=b.1,Q="";R(C.FQ)Q=C.FQ.BD(P,D,E,B,C);c R(A.La[C.l])Q=A.La[C.l].BD(P,B,C);c R(B!=e)Q=B.Ej();R(A.k&&(A.k.R5!=e&&A.k.R5==C.Bt||A.k.SY!=e&&A.k.SY==C.U))Q=P.Tr(Q,D);s Q||""},Tr:5(D,G){V B=G["Et"],A=b,C=b.1,E=Q.DI(G,A.GO||[])==-O,F=C.k.PB(G),P="";B=7(B)||O;a(V H=O;H<B;H++)P+="<W p=\'M-g-k-DV\'></W>";R(E&&F)P+="<W p=\'M-g-k-DV M-g-k-Bx M-g-k-Bx-CP\'></W>";c R(F)P+="<W p=\'M-g-k-DV M-g-k-Bx M-g-k-Bx-BM\'></W>";c P+="<W p=\'M-g-k-DV\'></W>";P+="<BG p=\'M-g-k-4\'>"+D+"</BG>";s P},Op:5(Dg){V A=b,DR=b.1,B=Dg,D=B.U.C7("|"),G=D[D.v-O],C4=A.De[G],I=Q(B).0(),E2=A.CX(I[N]),Cu=E2["Ba"],H=E2["Dz"];R(!C4||!C4.BY)s;V E=C4.Bt,HP=C4.Fw;R(C4.BY.l&&DR.B9[C4.BY.l]){V K=E2[E],P={DZ:E2,BP:K,Cf:C4,F3:H};R(A.3("beforeEdit",[P])==o)s o;V L=DR.B9[C4.BY.l],J=Q(B),Eq=Q(B).Bw();J.BN("");A.NV(E2,C4,f);V F=Q(B).q(),B1=Q(B).t(),CL=Q("<W p=\'M-g-BY\'></W>").Ch("m");R(Q.JO.mozilla)CL.Y({h:Eq.h,X:Eq.X}).BT();c CL.Y({h:Eq.h+O,X:Eq.X+O}).BT();V C=A.PX(L,CL,P,F,B1);A.BY={Ef:f,BY:L,BS:C,FK:P,Mf:CL};A.DJ("PG");A.B3("PG",5(){V D=L.ER(C,P);R(D!=K){Q(B).6("M-g-Bo-BA-SU");A.O1[Cu+"P"+C4["Ba"]]=f;R(C4.BY.Sn)C4.BY.Sn(B,D);P.BP=D;R(A.So(P))R(C4.BY.VU)C4.BY.VU(B,D)}})}},So:5(P){V Q=b,A=b.1;R(Q.3("Ub",[P])==o)s o;Q.OH(P.Cf,P.BP,P.DZ);R(P.Cf.FQ||Q.Tg())Q.Dm({Cf:P.Cf});Q.Dm({Gu:P.DZ});s f},J$:5(P){V Q=b,A=b.1,B={};B[A.Cc]=[];R(!P||!P[A.Cc]||!P[A.Cc].v){B[A.DZ]=N;s B}B[A.DZ]=P[A.Cc].v;R(!A.D$)A.D$=O;a(Er=(A.D$-O)*A.GE;Er<P[A.Cc].v&&Er<A.D$*A.GE;Er++)B[A.Cc].d(P[A.Cc][Er]);s B},Sa:5(A,E,C,P){V Q=b,B=b.1,D=A[C],F=E[C];R(D==e&&F!=e)s O;c R(D==e&&F==e)s N;c R(D!=e&&F==e)s-O;R(B.IE[P])s B.IE[P].BD(Q,D,F);c s D<F?-O:D>F?O:N},OJ:5(K,D){V P=b,I=b.1,F=[];R(K.KD){V C=5(Q){a(V P=N;P<L.v;P++)R(L[P].DB()==Q.DB())s f;s o},E=N,B=N,B1=N,A=Dj(D[N][K.Bt]),Q=Dj(D[N][K.Bt]);a(V H=N;H<D.v;H++){B+=O;V J=Dj(D[H][K.Bt]);R(!J)EP;E+=J;R(J>A)A=J;R(J<Q)Q=J}B1=E*O/D.v;R(K.KD.FQ){V G=K.KD.FQ({S0:E,MU:B,Vg:B1,FW:Q,Ew:A},K,P.n);F.d(G)}c R(K.KD.l){V L=K.KD.l.C7(",");R(C("S0"))F.d("<W>Sum="+E.NX(Bl)+"</W>");R(C("MU"))F.d("<W>Count="+B+"</W>");R(C("Ew"))F.d("<W>Max="+A.NX(Bl)+"</W>");R(C("FW"))F.d("<W>Min="+Q.NX(Bl)+"</W>");R(C("Vg"))F.d("<W>Avg="+B1.NX(Bl)+"</W>")}}s F.DC("")},Nw:5(B,C,D){V P=b,A=b.1,E=[];R(C)E.d("<Bd p=\\"M-g-Ee "+C+"\\">");c E.d("<Bd p=\\"M-g-Ee\\">");Q(P.Be).BE(5(A,Q){R(b.C1!=D)s;R(b.KK){E.d("<T p=\\"M-g-Ee-BA M-g-Ee-BA-HY\\" B7=\\"q:"+b.q+"Em\\"><W>&Ex;</W></T>");s}R(b.Ks){E.d("<T p=\\"M-g-Ee-BA M-g-Ee-BA-9\\" B7=\\"q:"+b.q+"Em\\"><W>&Ex;</W></T>");s}c R(b.Ic){E.d("<T p=\\"M-g-Ee-BA M-g-Ee-BA-Dt\\" B7=\\"q:"+b.q+"Em\\"><W>&Ex;</W></T>");s}E.d("<T p=\\"M-g-Ee-BA");R(b.P0)E.d(" M-g-Ee-BA-CR");E.d("\\" ");E.d("U=\\""+P.U+"|C$"+P.JS+"|"+Q.Ba+"\\" ");E.d("q=\\""+b.Dn+"\\" ");Gw=b.Gw;R(Gw)E.d("Gw=\\""+Gw+"\\" ");E.d("Fw=\\""+A+"\\" ");E.d("><W p=\\"M-g-Ee-BA-B$\\"");R(Q.Bn)E.d(" B7=\\"i-Align:"+Q.Bn+";\\"");E.d(">");E.d(P.OJ(Q,B));E.d("</W></T>")});E.d("</Bd>");R(!D)P.JS++;s E.DC("")},R0:5(C){V P=b,A=b.1;R(!P.M2())s o;R(!P.DD||P.DD[A.Cc].v==N)s o;V B=Q(P.Nw(P.DD[A.Cc],e,C));Q("Cg:r",C?P.Cp.C5:P.C5).BH(B)},Nf:5(){V P=b,A=b.1;Q(".Im BS",P.Bb).Bj(A.D_);R(!A.D5)A.D5=O;Q(".Im BG",P.Bb).BN(A.D5);V B=7((A.D_-O)*A.GE)+O,C=7(B)+7(A.GE)-O;R(!A.C$)A.C$=N;R(A.C$<C)C=A.C$;R(!A.C$)B=C=N;R(B<N)B=N;R(C<N)C=N;V D=A.Sq;D=D.EH(/{SZ}/,B);D=D.EH(/{VL}/,C);D=D.EH(/{C$}/,A.C$);D=D.EH(/{O7}/,A.GE);Q(".M-Bg-i",P.Bb).BN(D);R(!A.C$)Q(".M-Bg-Ih BG,.M-Bg-I9 BG,.M-Bg-Is BG,.M-Bg-I0 BG",P.Bb).6("M-_");R(A.D_==O){Q(".M-Bg-Ih BG",P.Bb).6("M-_");Q(".M-Bg-I9 BG",P.Bb).6("M-_")}c R(A.D_>A.D5&&A.D5>N){Q(".M-Bg-Ih BG",P.Bb).$("M-_");Q(".M-Bg-I9 BG",P.Bb).$("M-_")}R(A.D_==A.D5){Q(".M-Bg-I0 BG",P.Bb).6("M-_");Q(".M-Bg-Is BG",P.Bb).6("M-_")}c R(A.D_<A.D5&&A.D5>N){Q(".M-Bg-I0 BG",P.Bb).$("M-_");Q(".M-Bg-Is BG",P.Bb).$("M-_")}},Ui:5(P){V Q=P.C7("|"),A=Q[Bl];s A},N7:5(Q){s b.Cq[b.Ui(Q)]},FX:5(B){V A=b,F=(B.y||B.I$),D=Q(F).U8().Cn(F),H=5(P){a(V B=N,A=D.v;B<A;B++)R(BO P=="CJ"){R(Q(D[B]).BF(P))s D[B]}c R(BO P=="Dv")R(D[B]==P)s D[B];s e};R(H("M-g-BY"))s{Ef:f,BY:H("M-g-BY")};R(D.DP(b.Bi)==-O)s{Il:f};V P=o;R(D.BF("M-g-Eg")&&A.Iz)a(V I=N,E=A.Iz.v;I<E;I++)R(D.DP(A.Iz[I])!=-O){P=f;Dl}V C={g:H("M-CS"),RW:P,C1:H(A.H1[N])?f:o,x:H("M-CS-x"),DX:H("M-g-x"),C5:H("M-g-m"),C$:H("M-CS-Bg-C$"),DY:H("M-g-DY"),Bb:H("M-CS-Bg")};R(C.DX){C.RB=H("M-g-CF-Bo");C.Fs=H("M-g-CF-BA");C.KO=H("M-g-CF-BA-i");C.Rn=H("M-g-CF-BA-9");R(C.Fs){V G=C.Fs.U.C7("|")[Bl];C.Cf=A.De[G]}}R(C.C5){C.Bo=H("M-g-Bo");C.BA=H("M-g-Bo-BA");C.9=H("M-g-Bo-BA-CA-9");C.LF=H("M-g-C6-LU");C.E8=H("M-g-E8");C.F2=H("M-g-Bo-BA-F2");C.detailrow=H("M-g-Eg");C.totalrow=H("M-g-Ee");C.totalcell=H("M-g-Ee-BA");C.St=Q(C.BA).BF("M-g-Bo-BA-HY")?C.BA:e;C.S2=Q(C.BA).BF("M-g-Bo-BA-Dt")?C.BA:e;C.R7=Q(C.BA).BF("M-g-Bo-BA-9")?C.BA:e;C.SW=H("M-g-k-Bx");C.BY=H("M-g-BY");R(C.Bo)C.n=b.N7(C.Bo.U);R(C.BA)C.Ef=Q(C.BA).BF("M-g-Bo-BA-Ef");R(C.BY)C.Ef=f;R(C.Ef)C.Il=o}R(C.Bb){C.r=H("M-Bg-Ih");C.CR=H("M-Bg-I0");C.Ev=H("M-Bg-Is");C.FI=H("M-Bg-I9");C.EX=H("M-Bg-Lc");C.Cb=H("M-Bg-Cb")}s C},Nj:5(){V P=b,A=b.1;P.g.B3("Fv.g",5(Q){P.S1.BD(P,Q)});P.g.B3("KS.g",5(Q){P.TX.BD(P,Q)});P.g.B3("Gy.g",5(Q){s P.Q3.BD(P,Q)});Q(CE).B3("F0.g",5(Q){P.Te.BD(P,Q)});Q(CE).B3("BX.g",5(Q){P.Rt.BD(P,Q)});Q(w).B3("C8.g",5(Q){P.Fi.BD(P)});Q(CE).B3("PE.g",5(Q){R(Q.MX)P.MX=f});Q(CE).B3("keyup.g",5(Q){Cy P.MX});P.C5.B3("Kb.g",5(){V A=P.C5.Ki(),Q=P.C5.F8();R(A!=e)P.DX[N].Ki=A;R(Q!=e)P.Cp.C5[N].F8=Q;P.It();P.3("FH")});Q("By",P.Bb).Dp(5(){R(P.Gj&&!JD(A.Jg))s o;A.D$=O;A.GE=b.BP;P.HJ(A.KZ)});Q("BG.Im :i",P.Bb).KI(5(Q){P.I3("BS")});Q("W.M-Bg-Cb",P.Bb).B2(5(){Q(b).6("M-Bg-Cb-BB")},5(){Q(b).$("M-Bg-Cb-BB")});R(Q.Br.EV&&A.TQ){P.Kt=Q("<W p=\'M-DE-coldroptip\' B7=\'CY:DN\'><W p=\'M-Bq-Fn-HO\'></W><W p=\'M-Bq-Fn-F$\'></W></W>").Ch("m");P.DX.Cn(P.Cp.DX).EV({Hb:f,CT:o,HS:N,HR:N,B4:5(E,B){V D=P.FX(B);R(D.Fs&&D.Cf){V A=Q(".M-g-CF-BA-i:r",D.Fs).BN(),C=Q("<W p=\'M-DE-B4\' B7=\'CY:DN\'><W p=\'M-Bq-CO M-Bq-Df\'></W></W>").Ch("m");C.BH(A);s C}},Mk:5(){s o},MS:5(){b.BZ("CN","Ez");P.CD[b.U]=b},JB:5(C,A){R(A.Cb==Bl)s o;R(P.J5)s o;b.BZ("CN","Ez");V D=P.FX(A);R(!D.Fs||!D.Cf||D.Cf.Hr||D.KO)s o;R(Q(D.Fs).Y("CN").EG("C8")!=-O)s o;b.Od=D.Cf;P.Sc=f;V B=P.g.Bw();b.JR={X:B.X,Bv:B.X+P.DX.t(),h:B.h-Cs,BJ:B.h+P.g.q()+Cs}},Kc:5(C4,E){b.BZ("CN","Ez");V Dg=b.Od;R(!Dg)s o;R(P.J5)s o;R(P.Fx==e)P.Fx=-O;V I=E.EU,J=E.FA,H=o,DR=P.g.Bw(),C=b.JR;R(I<C.h||I>C.BJ||J>C.Bv||J<C.X){P.Fx=-O;P.Kt.BK();b.B4.B8(".M-Bq-CO:r").$("M-Bq-D7").6("M-Bq-Df");s}a(V L Bf P.De){V D=P.De[L];R(Dg==D){H=f;EP}R(D.Hr)EP;V B1=D["Et"]==Dg["Et"],K=!B1?o:H?f:o;R(Dg.C1!=D.C1)K=D.C1?o:f;R(P.Fx!=-O&&P.Fx!=L)EP;V G=CE.Ey(D["Fu"]),Eq=Q(G).Bw(),F={X:Eq.X,Bv:Eq.X+Q(G).t(),h:Eq.h-Cs,BJ:Eq.h+Cs};R(K){V B=Q(G).q();F.h+=B;F.BJ+=B}R(I>F.h&&I<F.BJ&&J>F.X&&J<F.Bv){V CL=A.Iq;R(D["IW"])CL*=D["IW"];P.Kt.Y({h:F.h+Dx,X:F.X-Lt,t:CL+Lt*Bl}).BT();P.Fx=L;P.VC=K?"BJ":"h";b.B4.B8(".M-Bq-CO:r").$("M-Bq-Df").6("M-Bq-D7");Dl}c R(P.Fx!=-O){P.Fx=-O;P.Kt.BK();b.B4.B8(".M-Bq-CO:r").$("M-Bq-D7").6("M-Bq-Df")}}},I4:5(B,Q){V A=b.Od;P.Sc=o;R(P.Fx!=-O){P.VJ.Gf(P,N,[A,P.Fx,P.VC=="BJ"]);P.Fx=-O}P.Kt.BK();b.BZ("CN","Ez")}})}R(Q.Br.EV&&A.UW){P.In=Q("<W p=\'M-DE-rowdroptip\' B7=\'CY:DN\'></W>").Ch("m");P.C5.Cn(P.Cp.C5).EV({Hb:f,CT:o,HS:N,HR:N,B4:5(F,C){V E=P.FX(C);R(E.Bo){V B=A.U0.EH(/{MU}/,F.GU?F.GU.v:O);R(A.O6)B=A.O6(F.GU,F,P);V D=Q("<W p=\'M-DE-B4\' B7=\'CY:DN\'><W p=\'M-Bq-CO M-Bq-Df\'></W>"+B+"</W>").Ch("m");s D}},Mk:5(){s o},MS:5(){b.BZ("CN","Ez");P.CD[b.U]=b},JB:5(C,Q){R(Q.Cb==Bl)s o;R(P.J5)s o;R(!P.Be.v)s o;b.BZ("CN","Ez");V D=P.FX(Q);R(!D.BA||!D.n||D.9)s o;V A=D.BA.U.C7("|"),B=P.De[A[A.v-O]];R(D.St||D.S2||D.R7||B==P.Be[N]){R(P.HI()){b.GU=P.SR();R(!b.GU||!b.GU.v)s o}c b.GU=[D.n];b.TC=D.n;b.BZ("CN","Fn");P.RR=f;b.JR={X:P.C5.Bw().X,Bv:P.C5.Bw().X+P.C5.t(),h:P.g.Bw().h-Cs,BJ:P.g.Bw().h+P.g.q()+Cs}}c s o},Kc:5(CL,C){V C4=b.TC;R(!C4)s o;V I=b.GU?b.GU:[C4];R(P.J5)s o;R(P.FD==e)P.FD=-O;V F=C.EU,J=C.FA,E=o,B=b.JR;R(F<B.h||F>B.BJ||J>B.Bv||J<B.X){P.FD=-O;P.In.BK();b.B4.B8(".M-Bq-CO:r").$("M-Bq-D7 M-Bq-Cn").6("M-Bq-Df");s}a(V K Bf P.Dc){V G=P.Dc[K],Dg=G["Ba"];R(C4==G)E=f;R(Q.DI(G,I)!=-O)EP;V L=E?f:o;R(P.FD!=-O&&P.FD!=Dg)EP;V B1=P.Cr(Dg),DR=Q(B1).Bw(),D={X:DR.X-C3,Bv:DR.X+Q(B1).t()+C3,h:P.g.Bw().h,BJ:P.g.Bw().h+P.g.q()};R(F>D.h&&F<D.BJ&&J>D.X&&J<D.Bv){V H=DR.X;R(L)H+=Q(B1).t();P.In.Y({h:D.h,X:H,q:D.BJ-D.h}).BT();P.FD=Dg;P.Kg=L?"Bv":"X";R(A.k&&J>D.X+Dx&&J<D.Bv-Dx){b.B4.B8(".M-Bq-CO:r").$("M-Bq-Df M-Bq-D7").6("M-Bq-Cn");P.In.BK();P.NF=f}c{b.B4.B8(".M-Bq-CO:r").$("M-Bq-Df M-Bq-Cn").6("M-Bq-D7");P.In.BT();P.NF=o}Dl}c R(P.FD!=-O){P.FD=-O;P.NF=o;P.In.BK();b.B4.B8(".M-Bq-CO:r").$("M-Bq-D7  M-Bq-Cn").6("M-Bq-Df")}}},I4:5(D,C){V H=b.GU;P.RR=o;a(V G=N;G<H.v;G++){V E=H[G].CD;R(E)H=Q.Qn(H,5(P,B){V A=Q.DI(P,E)==-O;s A})}R(P.FD!=-O){R(A.k){V F,B;R(P.NF)B=P.CX(P.FD);c{F=P.CX(P.FD);B=P.KN(F)}P.PV(H,B,F,P.Kg!="Bv");P.3("T$",{Dc:H,0:B,R$:F,F5:P.Kg=="Bv"})}c{P.Qi(H,P.FD,P.Kg=="Bv");P.3("T$",{Dc:H,0:B,R$:P.CX(P.FD),F5:P.Kg=="Bv"})}P.FD=-O}P.In.BK();b.BZ("CN","Ez")}})}},PH:5(B,A){R(M.Fb.Gk)s;V P=b,C=b.1,D=P.CX(B),E=A?"6":"$";R(P.EY())Q(P.Cr(D,f))[E](C.L9);Q(P.Cr(D,o))[E](C.L9)},Te:5(P){V Q=b,A=b.1;R(M.Fb.Gk){V B=Q.FX(P);R(B.Fs&&B.Cf)Q.3("SF",[{l:"x",Cf:B.Cf,BA:B.Fs},P]);c R(B.Bo)Q.3("SF",[{l:"Bo",DZ:B.n,Bo:B.Bo},P])}},S1:5(P){V Q=b,A=b.1},Q3:5(A){V P=b,B=b.1,D=P.FX(A);R(D.Bo){R(B.T0)P.By(D.n);R(P.GD("Gy"))s P.3("Gy",[{n:D.n,F3:D.n["Dz"],Bo:D.Bo},A])}c R(D.Fs){R(!B.JI)s f;V E=Q(D.Fs).j("Fw");R(E==CG)s f;V C=(A.EU-P.m.Bw().h+7(P.m[N].Ki));R(E==P.Be.v-O)C-=Jn;P.DY.Y({h:C,X:P.DX.t()+O});P.DY.BV();s o}},TX:5(P){V Q=b,A=b.1,B=Q.FX(P);R(B.Bo)Q.3("dblClickRow",[B.n,B.n["Ba"],B.Bo])},Rt:5(L){V Vp=(L.y||L.I$),K=b,Cu=b.1,I=K.FX(L);R(I.Il){R(K.BY.Ef&&!Q.2.Cd.O3)K.It();R(Cu.JI)K.DY.BK();s}R(I.RW||I.Ef)s;R(K.BY.Ef)K.It();R(Cu.JI)R(!I.DY)K.DY.BK();R(I.Rn){V DR=Q(I.RB),B=DR.BF("M-Bp");R(K.3("beforeCheckAllRow",[!B,K.Bi])==o)s o;R(B)DR.$("M-Bp");c DR.6("M-Bp");K.BC=[];a(V KQ Bf K.Cq)R(B)K.L8(K.Cq[KQ]);c K.By(K.Cq[KQ]);K.3("checkAllRow",[!B,K.Bi])}c R(I.KO){V Dg=Q(I.KO).0().0();R(!Cu.SC||!I.Cf)s;R(I.Cf.OD==o)s;R(Cu.CU&&K.Gj&&!JD(Cu.Jg))s;V P=Q(".M-g-CF-BA-FJ:r",Dg),H=I.Cf.Bt;R(!H)s;R(P.v>N){R(P.BF("M-g-CF-BA-FJ-Gn")){P.$("M-g-CF-BA-FJ-Gn").6("M-g-CF-BA-FJ-JC");Dg.$("M-g-CF-BA-Gn").6("M-g-CF-BA-JC");K.NC(H,"JC")}c R(P.BF("M-g-CF-BA-FJ-JC")){P.$("M-g-CF-BA-FJ-JC").6("M-g-CF-BA-FJ-Gn");Dg.$("M-g-CF-BA-JC").6("M-g-CF-BA-Gn");K.NC(H,"Gn")}}c{Dg.$("M-g-CF-BA-JC").6("M-g-CF-BA-Gn");Q(I.KO).F5("<BG p=\'M-g-CF-BA-FJ M-g-CF-BA-FJ-Gn\'>&Ex;&Ex;</BG>");K.NC(H,"Gn")}Q(".M-g-CF-BA-FJ",K.DX).Cn(Q(".M-g-CF-BA-FJ",K.Cp.DX)).JX(Q(".M-g-CF-BA-FJ:r",Dg)).Bm()}c R(I.F2&&Cu.Dt){V E2=I.n,DR=Q([K.Cr(E2,o)]);R(K.EY())DR=DR.Cn(K.Cr(E2,f));KQ=E2["Ba"];R(Q(I.F2).BF("M-CP")){R(Cu.Dt.PQ)Cu.Dt.PQ(E2,Q(".M-g-Eg-B$:r",Eq)[N]);DR.Ev("Bd.M-g-Eg").BK();Q(I.F2).$("M-CP")}c{V Eq=DR.Ev("Bd.M-g-Eg");R(Eq.v>N){Eq.BT();R(Cu.Dt.Uc)Cu.Dt.Uc(E2,Q(".M-g-Eg-B$:r",Eq)[N]);Q(I.F2).6("M-CP");K.3("FH");s}Q(I.F2).6("M-CP");V HP=N;a(V C4=N;C4<K.Be.v;C4++)R(K.Be[C4].C1)HP++;V G=Q("<Bd p=\'M-g-Eg\'><T><W p=\'M-g-Eg-B$\' B7=\'CY:DN\'></W></T></Bd>"),E=Q("<Bd p=\'M-g-Eg\'><T><W p=\'M-g-Eg-B$\' B7=\'CY:DN\'></W></T></Bd>");G.j("U",K.U+"|Dt|"+KQ);K.Iz=K.Iz||[];K.Iz.d(G[N]);K.Iz.d(E[N]);V A=Q("W:r",G);A.0().j("JW",K.Be.v-HP);DR.HK(N).F5(G);R(HP>N){E.B8("T:r").j("JW",HP);DR.HK(O).F5(E)}R(Cu.Dt.NU){Cu.Dt.NU(E2,A[N],5(){K.3("FH")});Q("W:r",E).Cn(A).BT().t(Cu.Dt.t||Cu.Tt)}c R(Cu.Dt.FQ){A.BH(Cu.Dt.FQ());A.BT()}K.3("FH")}}c R(I.LF){V F=Q(I.E8),Nq=f;R(Q(I.LF).BF("M-g-C6-LU-BM")){Q(I.LF).$("M-g-C6-LU-BM");R(F.BF("M-g-E8-CR"))Q("T:r",F).q("E$")}c{Nq=o;Q(I.LF).6("M-g-C6-LU-BM");R(F.BF("M-g-E8-CR"))Q("T:r",F).q(K.DW)}V CL=F.Ev(".M-g-Bo,.M-g-Ee-C6,.M-g-Eg");RN(f){R(CL.v==N)Dl;R(Nq){CL.BT();R(CL.BF("M-g-Eg")&&!CL.FI().B8("T.M-g-Bo-BA-Dt:r BG.M-g-Bo-BA-F2:r").BF("M-CP"))CL.BK()}c CL.BK();CL=CL.Ev(".M-g-Bo,.M-g-Ee-C6,.M-g-Eg")}K.3("FH")}c R(I.SW)K.BV(I.n);c R(I.Bo&&K.HI()){V J=Cu.UQ?f:o;R(Cu.JZ)J=f;R(I.9||!J){DR=Q(I.Bo),B=DR.BF("M-BC");R(K.3("beforeCheckRow",[!B,I.n,I.n["Ba"],I.Bo])==o)s o;V D=B?"L8":"By";K[D](I.n);R(Cu.k&&Cu.RY){V C=K.JF(I.n,f);a(V C4=N,B1=C.v;C4<B1;C4++)K[D](C[C4])}K.3("checkRow",[!B,I.n,I.n["Ba"],I.Bo])}R(!I.9&&I.BA&&Cu.JZ&&Cu.LC)K.Op(I.BA)}c R(I.Bo&&!K.HI()){R(I.BA&&Cu.JZ&&Cu.LC)K.Op(I.BA);R(Q(I.Bo).BF("M-BC")){R(!Cu.Uu){Q(I.Bo).6("M-BC-Kn");s}K.L8(I.n)}c K.By(I.n)}c R(I.Bb)R(I.r){R(K.3("toFirst",[K.Bi])==o)s o;K.I3("r")}c R(I.FI){R(K.3("toPrev",[K.Bi])==o)s o;K.I3("FI")}c R(I.Ev){R(K.3("toNext",[K.Bi])==o)s o;K.I3("Ev")}c R(I.CR){R(K.3("toLast",[K.Bi])==o)s o;K.I3("CR")}c R(I.EX){R(Q("BG",I.EX).BF("M-_"))s o;R(K.3("Kx",[K.Bi])==o)s o;R(Cu.CU&&K.Gj&&!JD(Cu.Jg))s o;K.HJ(Cu.KZ)}},By:5(C){V A=b,D=b.1,F=A.CX(C),G=F["Ba"],B=A.Cr(G),P=A.Cr(G,f);R(!A.HI()&&!A.MX){a(V H Bf A.BC){V E=A.BC[H];R(E["Ba"]Bf A.Cq){Q(A.Cr(E)).$("M-BC M-BC-Kn");R(A.EY())Q(A.Cr(E,f)).$("M-BC M-BC-Kn")}}A.BC=[]}R(B)Q(B).6("M-BC");R(P)Q(P).6("M-BC");A.BC[A.BC.v]=F;A.3("selectRow",[F,G,B])},L8:5(C){V A=b,D=b.1,E=A.CX(C),F=E["Ba"],B=A.Cr(F),P=A.Cr(F,f);Q(B).$("M-BC M-BC-Kn");R(A.EY())Q(P).$("M-BC M-BC-Kn");A.NQ(E);A.3("unSelectRow",[E,F,B])},SA:5(P){V Q=b,A=b.1,B=Q.CX(P);a(V C Bf Q.BC)R(Q.BC[C]==B)s f;s o},Fi:5(){V P=b,A=b.1;R(A.t&&A.t!="E$"){V D=Q(w).t(),G=N,C=e;R(BO(A.t)=="CJ"&&A.t.EG("%")>N){V B=P.g.0();R(A.JA){C=D;C-=7(Q("m").Y("KG"));C-=7(Q("m").Y("Fh"))}c C=B.t();G=C*Dj(A.t)*N.G5;R(A.JA||B[N].Dk.DB()=="m")G-=(P.g.Bw().X-7(Q("m").Y("KG")))}c G=7(A.t);G+=A.Fa;P.windowHeight=D;P.Gt(G)}R(P.EY()){V F=P.H1.q(),E=P.Gq.q();P.H0.Y({q:E-F})}P.3("FH")}});Q.2.8.CB.CQ.Tg=Q.2.8.CB.CQ.M2;Q.2.8.CB.CQ.Cn=Q.2.8.CB.CQ.Mu;Q.2.8.CB.CQ.JL=Q.2.8.CB.CQ.OU;Q.2.8.CB.CQ.BH=Q.2.8.CB.CQ.Pw;Q.2.8.CB.CQ.M5=Q.2.8.CB.CQ.VE;Q.2.8.CB.CQ.SR=Q.2.8.CB.CQ.QW;Q.2.8.CB.CQ.Qk=Q.2.8.CB.CQ.QW;Q.2.8.CB.CQ.getCheckedRowObjs=Q.2.8.CB.CQ.TB;Q.2.8.CB.CQ.setOptions=Q.2.8.CB.CQ.BZ})(DM);(5(Q){Q.Br.UC=5(P){s Q.2.CH.BD(b,"UC",B6)};Q.Br.Qj=5(){s Q.2.CH.BD(b,"Qj",B6)};Q.BR.Hz={LB:Jn,Kv:Jn,G2:110,DK:300,HL:170,JA:f,Fa:N,t:"GY%",onHeightChanged:e,HE:o,IT:o,Ro:f,Su:f,Tl:f,VV:f,U2:f,Q$:f,DV:Dw,MV:e,Ph:Oz,Oj:Oz};Q.CM.Hz={};Q.2.8.Hz=5(P,A){Q.2.8.Hz.CW.Cw.BD(b,P,A)};Q.2.8.Hz.DA(Q.2.Cm.Dh,{Ci:5(){s"Hz"},DH:5(){s"Hz"},Dr:5(){s Q.CM.Hz},DG:5(){V P=b,B=b.1;P.z=Q(b.Bi);P.z.6("M-z");P.q=P.z.q();R(Q("> W[EN=X]",P.z).v>N){P.X=Q("> W[EN=X]",P.z).Ec("<W p=\\"M-z-X\\" B7=\\"X:Qf;\\"></W>").0();P.X.4=Q("> W[EN=X]",P.X);R(!P.X.4.BF("M-z-4"))P.X.4.6("M-z-4");P.LB=B.LB;R(P.LB)P.X.t(P.LB)}R(Q("> W[EN=Bv]",P.z).v>N){P.Bv=Q("> W[EN=Bv]",P.z).Ec("<W p=\\"M-z-Bv\\"></W>").0();P.Bv.4=Q("> W[EN=Bv]",P.Bv);R(!P.Bv.4.BF("M-z-4"))P.Bv.4.6("M-z-4");P.Kv=B.Kv;R(P.Kv)P.Bv.t(P.Kv);V E=P.Bv.4.j("CK");R(E){P.Bv.x=Q("<W p=\\"M-z-x\\"></W>");P.Bv.E_(P.Bv.x);P.Bv.x.BN(E);P.Bv.4.j("CK","")}}R(Q("> W[EN=h]",P.z).v>N){P.h=Q("> W[EN=h]",P.z).Ec("<W p=\\"M-z-h\\" B7=\\"h:Qf;\\"></W>").0();P.h.x=Q("<W p=\\"M-z-x\\"><W p=\\"M-z-x-BV\\"></W><W p=\\"M-z-x-B$\\"></W></W>");P.h.E_(P.h.x);P.h.x.BV=Q(".M-z-x-BV",P.h.x);P.h.4=Q("> W[EN=h]",P.h);R(!P.h.4.BF("M-z-4"))P.h.4.6("M-z-4");R(!B.Ro)Q(".M-z-x-BV",P.h.x).Bm();V A=P.h.4.j("CK");R(A){P.h.4.j("CK","");Q(".M-z-x-B$",P.h.x).BN(A)}P.G2=B.G2;R(P.G2)P.h.q(P.G2)}R(Q("> W[EN=BI]",P.z).v>N){P.BI=Q("> W[EN=BI]",P.z).Ec("<W p=\\"M-z-BI\\" ></W>").0();P.BI.4=Q("> W[EN=BI]",P.BI);P.BI.4.6("M-z-4");V C=P.BI.4.j("CK");R(C){P.BI.4.j("CK","");P.BI.x=Q("<W p=\\"M-z-x\\"></W>");P.BI.E_(P.BI.x);P.BI.x.BN(C)}P.DK=B.DK;R(P.DK)P.BI.q(P.DK)}R(Q("> W[EN=BJ]",P.z).v>N){P.BJ=Q("> W[EN=BJ]",P.z).Ec("<W p=\\"M-z-BJ\\"></W>").0();P.BJ.x=Q("<W p=\\"M-z-x\\"><W p=\\"M-z-x-BV\\"></W><W p=\\"M-z-x-B$\\"></W></W>");P.BJ.E_(P.BJ.x);P.BJ.x.BV=Q(".M-z-x-BV",P.BJ.x);R(!B.Su)Q(".M-z-x-BV",P.BJ.x).Bm();P.BJ.4=Q("> W[EN=BJ]",P.BJ);R(!P.BJ.4.BF("M-z-4"))P.BJ.4.6("M-z-4");V D=P.BJ.4.j("CK");R(D){P.BJ.4.j("CK","");Q(".M-z-x-B$",P.BJ.x).BN(D)}P.HL=B.HL;R(P.HL)P.BJ.q(P.HL)}P.z.JG=Q("<W p=\'M-z-JG\'></W>");P.z.BH(P.z.JG);P.VO();P.HE=B.HE;P.IT=B.IT;P.DO=Q("<W p=\\"M-z-DQ-h\\" B7=\\"CY: DN; \\"><W p=\\"M-z-DQ-h-BV\\"></W></W>");P.EF=Q("<W p=\\"M-z-DQ-BJ\\" B7=\\"CY: DN; \\"><W p=\\"M-z-DQ-BJ-BV\\"></W></W>");P.z.BH(P.DO).BH(P.EF);P.DO.BV=Q("> .M-z-DQ-h-BV",P.DO);P.EF.BV=Q("> .M-z-DQ-BJ-BV",P.EF);P.S_();P.MT();Q(w).C8(5(){P.Fi()});P.BZ(B)},Pi:5(P){V Q=b,A=b.1;R(!Q.h)s o;Q.HE=P;R(Q.HE){Q.DO.BT();Q.FR&&Q.FR.BK();Q.h.BK()}c{Q.DO.BK();Q.FR&&Q.FR.BT();Q.h.BT()}Q.Fi()},Ov:5(P){V Q=b,A=b.1;R(!Q.BJ)s o;Q.IT=P;Q.Fi();R(Q.IT){Q.EF.BT();Q.FG&&Q.FG.BK();Q.BJ.BK()}c{Q.EF.BK();Q.FG&&Q.FG.BT();Q.BJ.BT()}Q.Fi()},MT:5(){V P=b,A=b.1;Q("> .M-z-h .M-z-x,> .M-z-BJ .M-z-x",P.z).B2(5(){Q(b).6("M-z-x-BB")},5(){Q(b).$("M-z-x-BB")});Q(".M-z-x-BV",P.z).B2(5(){Q(b).6("M-z-x-BV-BB")},5(){Q(b).$("M-z-x-BV-BB")});Q(".M-z-x-BV",P.h).BX(5(){P.Pi(f)});Q(".M-z-x-BV",P.BJ).BX(5(){P.Ov(f)});P.D0=N;R(P.X){P.D0+=P.X.t();P.D0+=7(P.X.Y("QP"));P.D0+=7(P.X.Y("PT"));P.D0+=A.DV}R(P.h){P.h.Y({X:P.D0});P.DO.Y({X:P.D0})}R(P.BI)P.BI.Y({X:P.D0});R(P.BJ){P.BJ.Y({X:P.D0});P.EF.Y({X:P.D0})}R(P.h)P.h.Y({h:N});P.Fi();P.Fi()},S_:5(){V P=b,A=b.1;P.DO.B2(5(){Q(b).6("M-z-DQ-h-BB")},5(){Q(b).$("M-z-DQ-h-BB")});P.DO.BV.B2(5(){Q(b).6("M-z-DQ-h-BV-BB")},5(){Q(b).$("M-z-DQ-h-BV-BB")});P.EF.B2(5(){Q(b).6("M-z-DQ-BJ-BB")},5(){Q(b).$("M-z-DQ-BJ-BB")});P.EF.BV.B2(5(){Q(b).6("M-z-DQ-BJ-BV-BB")},5(){Q(b).$("M-z-DQ-BJ-BV-BB")});P.DO.BV.BX(5(){P.Pi(o)});P.EF.BV.BX(5(){P.Ov(o)});R(P.h&&P.HE){P.DO.BT();P.FR&&P.FR.BK();P.h.BK()}R(P.BJ&&P.IT){P.EF.BT();P.FG&&P.FG.BK();P.BJ.BK()}},VO:5(){V P=b,A=b.1;R(P.h&&A.Tl){P.FR=Q("<W p=\'M-z-MM-h\'></W>");P.z.BH(P.FR);P.FR&&P.FR.BT();P.FR.Fv(5(Q){P.G7("Py",Q)})}R(P.BJ&&A.VV){P.FG=Q("<W p=\'M-z-MM-BJ\'></W>");P.z.BH(P.FG);P.FG&&P.FG.BT();P.FG.Fv(5(Q){P.G7("PA",Q)})}R(P.X&&A.U2){P.Jd=Q("<W p=\'M-z-MM-X\'></W>");P.z.BH(P.Jd);P.Jd.BT();P.Jd.Fv(5(Q){P.G7("P4",Q)})}R(P.Bv&&A.Q$){P.JY=Q("<W p=\'M-z-MM-Bv\'></W>");P.z.BH(P.JY);P.JY.BT();P.JY.Fv(5(Q){P.G7("O$",Q)})}P.Kf=Q("<W p=\'M-z-Gk-xline\'></W>");P.LO=Q("<W p=\'M-z-Gk-UF\'></W>");P.z.BH(P.Kf).BH(P.LO)},OE:5(){V Q=b,P=b.1;R(Q.FR)Q.FR.Y({h:Q.h.q()+7(Q.h.Y("h")),t:Q.Cl,X:Q.D0});R(Q.FG)Q.FG.Y({h:7(Q.BJ.Y("h"))-P.DV,t:Q.Cl,X:Q.D0});R(Q.Jd)Q.Jd.Y({X:Q.X.t()+7(Q.X.Y("X")),q:Q.X.q()});R(Q.JY)Q.JY.Y({X:7(Q.Bv.Y("X"))-P.DV,q:Q.Bv.q()})},Fi:5(){V P=b,B=b.1,E=P.z.t(),G=N,D=Q(w).t(),C=e;R(BO(B.t)=="CJ"&&B.t.EG("%")>N){V F=P.z.0();R(B.JA||F[N].Dk.DB()=="m"){C=D;C-=7(Q("m").Y("KG"));C-=7(Q("m").Y("Fh"))}c C=F.t();G=C*Dj(B.t)*N.G5;R(B.JA||F[N].Dk.DB()=="m")G-=(P.z.Bw().X-7(Q("m").Y("KG")))}c G=7(B.t);G+=B.Fa;P.z.t(G);P.J8=P.z.t();P.SB=P.z.q();P.Cl=P.z.t();R(P.X){P.Cl-=P.X.t();P.Cl-=7(P.X.Y("QP"));P.Cl-=7(P.X.Y("PT"));P.Cl-=B.DV}R(P.Bv){P.Cl-=P.Bv.t();P.Cl-=7(P.Bv.Y("QP"));P.Cl-=7(P.Bv.Y("PT"));P.Cl-=B.DV}P.Cl-=Bl;R(P.GD("T1")&&P.J8!=E)P.3("T1",[{J8:P.J8,DL:P.J8-E,Cl:P.Cl}]);R(P.BI){P.DK=P.SB;R(P.h)R(P.HE){P.DK-=P.DO.q();P.DK-=7(P.DO.Y("Go"));P.DK-=7(P.DO.Y("HF"));P.DK-=7(P.DO.Y("h"));P.DK-=B.DV}c{P.DK-=P.G2;P.DK-=7(P.h.Y("Go"));P.DK-=7(P.h.Y("HF"));P.DK-=7(P.h.Y("h"));P.DK-=B.DV}R(P.BJ)R(P.IT){P.DK-=P.EF.q();P.DK-=7(P.EF.Y("Go"));P.DK-=7(P.EF.Y("HF"));P.DK-=7(P.EF.Y("BJ"));P.DK-=B.DV}c{P.DK-=P.HL;P.DK-=7(P.BJ.Y("Go"));P.DK-=7(P.BJ.Y("HF"));P.DK-=B.DV}P.Ft=N;R(P.h)R(P.HE){P.Ft+=P.DO.q();P.Ft+=7(P.DO.Y("Go"));P.Ft+=7(P.DO.Y("HF"));P.Ft+=7(P.DO.Y("h"));P.Ft+=B.DV}c{P.Ft+=P.h.q();P.Ft+=7(P.h.Y("Go"));P.Ft+=7(P.h.Y("HF"));P.Ft+=B.DV}P.BI.Y({h:P.Ft});P.BI.q(P.DK);P.BI.t(P.Cl);V A=P.Cl;R(P.BI.x)A-=P.BI.x.t();P.BI.4.t(A)}R(P.h){P.DO.t(P.Cl);P.h.t(P.Cl)}R(P.BJ){P.EF.t(P.Cl);P.BJ.t(P.Cl);P.E1=N;R(P.h)R(P.HE){P.E1+=P.DO.q();P.E1+=7(P.DO.Y("Go"));P.E1+=7(P.DO.Y("HF"));P.E1+=B.DV}c{P.E1+=P.h.q();P.E1+=7(P.h.Y("Go"));P.E1+=7(P.h.Y("HF"));P.E1+=7(P.h.Y("h"));P.E1+=B.DV}R(P.BI){P.E1+=P.BI.q();P.E1+=7(P.BI.Y("Go"));P.E1+=7(P.BI.Y("HF"));P.E1+=B.DV}P.BJ.Y({h:P.E1})}R(P.Bv){P.Ms=P.J8-P.Bv.t()-Bl;P.Bv.Y({X:P.Ms})}P.OE()},G7:5(C,A){V P=b,B=b.1;P.H8=C;R(C=="Py"||C=="PA"){P.D4={H6:A.EU};P.LO.Y({h:A.EU-P.z.Bw().h,t:P.Cl,X:P.D0}).BT();Q("m").Y("CN","T3-C8")}c R(C=="P4"||C=="O$"){P.E5={H7:A.FA};P.Kf.Y({X:A.FA-P.z.Bw().X,q:P.z.q()}).BT();Q("m").Y("CN","Bo-C8")}c s;P.z.JG.q(P.z.q());P.z.JG.t(P.z.t());P.z.JG.BT();R(Q.JO.PC||Q.JO.TE)Q("m").B3("FP",5(){s o});Q(CE).B3("F0",5(){P.JH.E3(P,B6)});Q(CE).B3("HX",5(){P.Iu.E3(P,B6)})},Iu:5(A){V P=b,B=b.1;R(P.D4){P.D4.DL=A.EU-P.D4.H6;P.LO.Y({h:A.EU-P.z.Bw().h});Q("m").Y("CN","T3-C8")}c R(P.E5){P.E5.DL=A.FA-P.E5.H7;P.Kf.Y({X:A.FA-P.z.Bw().X});Q("m").Y("CN","Bo-C8")}},JH:5(A){V P=b,C=b.1,B;R(P.D4&&P.D4.DL!=CG){B=P.D4.DL;R(P.H8=="Py"){R(C.Ph)R(P.G2+P.D4.DL<C.Ph)s;P.G2+=P.D4.DL;P.h.q(P.G2);R(P.BI)P.BI.q(P.BI.q()-P.D4.DL).Y({h:7(P.BI.Y("h"))+P.D4.DL});c R(P.BJ)P.BJ.q(P.h.q()-P.D4.DL).Y({h:7(P.BJ.Y("h"))+P.D4.DL})}c R(P.H8=="PA"){R(C.Oj)R(P.HL-P.D4.DL<C.Oj)s;P.HL-=P.D4.DL;P.BJ.q(P.HL).Y({h:7(P.BJ.Y("h"))+P.D4.DL});R(P.BI)P.BI.q(P.BI.q()+P.D4.DL);c R(P.h)P.h.q(P.h.q()+P.D4.DL)}}c R(P.E5&&P.E5.DL!=CG){B=P.E5.DL;R(P.H8=="P4"){P.X.t(P.X.t()+P.E5.DL);P.D0+=P.E5.DL;P.Cl-=P.E5.DL;R(P.h){P.h.Y({X:P.D0}).t(P.Cl);P.DO.Y({X:P.D0}).t(P.Cl)}R(P.BI)P.BI.Y({X:P.D0}).t(P.Cl);R(P.BJ){P.BJ.Y({X:P.D0}).t(P.Cl);P.EF.Y({X:P.D0}).t(P.Cl)}}c R(P.H8=="O$"){P.Bv.t(P.Bv.t()-P.E5.DL);P.Cl+=P.E5.DL;P.Ms+=P.E5.DL;P.Bv.Y({X:P.Ms});R(P.h){P.h.t(P.Cl);P.DO.t(P.Cl)}R(P.BI)P.BI.t(P.Cl);R(P.BJ){P.BJ.t(P.Cl);P.EF.t(P.Cl)}}}P.3("NP",[{direction:P.H8?P.H8.EH(/C8/,""):"",DL:B},A]);P.OE();P.Kf.BK();P.LO.BK();P.D4=P.E5=P.H8=o;P.z.JG.BK();R(Q.JO.PC||Q.JO.TE)Q("m").DJ("FP");Q(CE).DJ("HX",P.Iu);Q(CE).DJ("F0",P.JH);Q("m").Y("CN","")}})})(DM);(5(Q){Q.LZ=5(P){s Q.2.CH.BD(e,"LZ",B6)};Q.BR.Fl={q:Oc,X:N,h:N,Ek:e,Ge:f};Q.CM.Fl={};Q.2.8.Fl=5(P){Q.2.8.Fl.CW.Cw.BD(b,e,P)};Q.2.8.Fl.DA(Q.2.Cm.Dh,{Ci:5(){s"Fl"},DH:5(){s"Fl"},Dr:5(){s Q.CM.Fl},DG:5(){V P=b,A=b.1;P.Tw=N;P.GR={};P.B5=P.QF();P.Bi=P.B5[N];P.B5.Y({X:A.X,h:A.h,q:A.q});A.Ek&&Q(A.Ek).BE(5(A,Q){P.Hq(Q)});Q(CE).B3("BX.B5",5(){a(V A Bf P.GR){V Q=P.GR[A];R(!Q)s;Q.BK();R(Q.Ge)Q.Ge.BK()}});P.BZ(A)},BT:5(B,A){V Q=b,P=b.1;R(A==CG)A=Q.B5;R(B&&B.h!=CG)A.Y({h:B.h});R(B&&B.X!=CG)A.Y({X:B.X});A.BT();Q.Lg(A)},Lg:5(A){V Q=b,P=b.1;R(!P.Ge)s;A.Ge.Y({h:A.Y("h"),X:A.Y("X"),q:A.IU(),t:A.E4()});R(A.El(":E9"))A.Ge.BT();c A.Ge.BK()},BK:5(A){V Q=b,P=b.1;R(A==CG)A=Q.B5;Q.Np(A);A.BK();Q.Lg(A)},BV:5(){V Q=b,P=b.1;Q.B5.BV();Q.Lg(Q.B5)},Ru:5(B){V P=b,A=b.1;Q("> .M-B5-B0[Lh="+B+"]",P.B5.Ek).Bm()},IS:5(B){V P=b,A=b.1;Q("> .M-B5-B0[Lh="+B+"]",P.B5.Ek).$("M-B5-B0-FS")},IP:5(B){V P=b,A=b.1;Q("> .M-B5-B0[Lh="+B+"]",P.B5.Ek).6("M-B5-B0-FS")},isEnable:5(B){V P=b,A=b.1;s!Q("> .M-B5-B0[Lh="+B+"]",P.B5.Ek).BF("M-B5-B0-FS")},getItemCount:5(){V P=b,A=b.1;s Q("> .M-B5-B0",P.B5.Ek).v},Hq:5(F,E){V P=b,D=b.1;R(!F)s;R(E==CG)E=P.B5;R(F.Gz){E.Ek.BH("<W p=\\"M-B5-B0-Gz\\"></W>");s}V A=Q("<W p=\\"M-B5-B0\\"><W p=\\"M-B5-B0-i\\"></W> </W>"),B=Q("> .M-B5-B0",E.Ek).v;E.Ek.BH(A);A.j("Iw",++P.Tw);F.U&&A.j("Lh",F.U);F.i&&Q(">.M-B5-B0-i:r",A).BN(F.i);F.CO&&A.E_("<W p=\\"M-B5-B0-CO M-CO-"+F.CO+"\\"></W>");R(F.FS||F._)A.6("M-B5-B0-FS");R(F.CD){A.BH("<W p=\\"M-B5-B0-Sh\\"></W>");V C=P.QF(A.j("Iw"));P.GR[A.j("Iw")]=C;C.q(D.q);C.B2(e,5(){R(!C.Mx)P.BK(C)});Q(F.CD).BE(5(){P.Hq(b,C)})}F.BX&&A.BX(5(){R(Q(b).BF("M-B5-B0-FS"))s;F.BX(F,B)});F.KS&&A.KS(5(){R(Q(b).BF("M-B5-B0-FS"))s;F.KS(F,B)});V G=Q("> .M-B5-BB:r",E);A.B2(5(){R(Q(b).BF("M-B5-B0-FS"))s;V B=Q(b).Bw().X,C=B-E.Bw().X;G.Y({X:C});P.Np(E);R(F.CD){V A=Q(b).j("Iw");R(!A)s;R(P.GR[A]){P.BT({X:B,h:Q(b).Bw().h+Q(b).q()-Dx},P.GR[A]);E.Mx=f}}},5(){R(Q(b).BF("M-B5-B0-FS"))s;V P=Q(b).j("Iw");R(F.CD){P=Q(b).j("Iw");R(!P)s}})},Np:5(B){V P=b,A=b.1;R(B==CG)B=P.B5;Q("> .M-B5-B0",B.Ek).BE(5(){R(Q("> .M-B5-B0-Sh",b).v>N){V A=Q(b).j("Iw");R(!A)s;P.GR[A]&&P.BK(P.GR[A])}});B.Mx=o},QF:5(C){V P=b,B=b.1,A=Q("<W p=\\"M-B5\\" B7=\\"CY:DN\\"><W p=\\"M-B5-UF\\"></W><W p=\\"M-B5-BB\\"><W p=\\"M-B5-BB-M\\"></W> <W p=\\"M-B5-BB-FY\\"></W></W><W p=\\"M-B5-B$\\"></W></W>");C&&A.j("ligeruiparentmenuitemid",C);A.Ek=Q("> .M-B5-B$:r",A);A.Ch("m");R(B.Ge){A.Ge=Q("<W p=\\"M-B5-Ge\\"></W>").Vl(A);P.Lg(A)}A.B2(e,5(){R(!A.Mx)Q("> .M-B5-BB:r",A).Y({X:-Os})});R(C)P.GR[C]=A;c P.GR[N]=A;s A}});Q.2.8.Fl.CQ.setEnable=Q.2.8.Fl.CQ.IS;Q.2.8.Fl.CQ.setDisable=Q.2.8.Fl.CQ.IP})(DM);(5(Q){Q.Br.S$=5(P){s Q.2.CH.BD(b,"S$",B6)};Q.Br.Rk=5(){s Q.2.CH.BD(b,"Rk",B6)};Q.BR.Hp={};Q.CM.Hp={};Q.2.8.Hp=5(P,A){Q.2.8.Hp.CW.Cw.BD(b,P,A)};Q.2.8.Hp.DA(Q.2.Cm.Dh,{Ci:5(){s"Hp"},DH:5(){s"Hp"},Dr:5(){s Q.CM.Hp},DG:5(){V P=b,A=b.1;P.Fo=Q(b.Bi);R(!P.Fo.BF("M-Fo"))P.Fo.6("M-Fo");R(A&&A.Ek)Q(A.Ek).BE(5(A,Q){P.Hq(Q)});Q(CE).BX(5(){Q(".M-CS-CA-BC",P.Fo).$("M-CS-CA-BC")});P.BZ(A)},Hq:5(D){V P=b,C=b.1,A=Q("<W p=\\"M-Fo-B0 M-CS-CA\\"><BG></BG><W p=\\"M-CS-CA-M\\"></W><W p=\\"M-CS-CA-FY\\"></W><W p=\\"M-Fo-B0-F$\\"></W></W>");P.Fo.BH(A);D.U&&A.j("menubarid",D.U);D.i&&Q("BG:r",A).BN(D.i);D.FS&&A.6("M-Fo-B0-FS");D.BX&&A.BX(5(){D.BX(D)});R(D.B5){V B=Q.LZ(D.B5);A.B2(5(){P.PD&&P.PD.BK();V A=Q(b).Bw().h,C=Q(b).Bw().X+Q(b).t();B.BT({X:C,h:A});P.PD=B;Q(b).6("M-CS-CA-BB M-CS-CA-BC").Gd(".M-Fo-B0").$("M-CS-CA-BC")},5(){Q(b).$("M-CS-CA-BB")})}c{A.B2(5(){Q(b).6("M-CS-CA-BB")},5(){Q(b).$("M-CS-CA-BB")});Q(".M-Fo-B0-F$",A).Bm()}}})})(DM);(5(Q){Q.Ed=5(P){s Q.2.CH.BD(e,"Ed",B6,{Id:f})};Q.BR.Hk={Kj:f};Q.CM.Hk={};Q.2.8.Hk=5(P){Q.2.8.Hk.CW.Cw.BD(b,e,P)};Q.2.8.Hk.DA(Q.2.Cm.Dh,{Ci:5(){s"Hk"},DH:5(){s"Hk"},Dr:5(){s Q.CM.Hk},DG:5(){V B=b,E=b.1,C="";C+="<W p=\\"M-CI\\">";C+="        <W p=\\"M-CI-lt\\"></W><W p=\\"M-CI-rt\\"></W>";C+="        <W p=\\"M-CI-M\\"></W><W p=\\"M-CI-FY\\"></W> ";C+="        <W p=\\"M-CI-D6\\"></W>";C+="        <W p=\\"M-CI-CK\\">";C+="            <W p=\\"M-CI-CK-B$\\"></W>";C+="            <W p=\\"M-CI-BM\\"></W>";C+="        </W>";C+="        <W p=\\"M-CI-4\\">";C+="        </W>";C+="        <W p=\\"M-CI-CC\\"><W p=\\"M-CI-CC-B$\\">";C+="        </W></W>";C+="    </W>";B.C9=Q(C);Q("m").BH(B.C9);B.C9.BM=5(){B.OX();B.C9.Bm()};E.q&&B.C9.q(E.q);E.CK&&Q(".M-CI-CK-B$",B.C9).BN(E.CK);E.4&&Q(".M-CI-4",B.C9).BN(E.4);R(E.CC){Q(E.CC).BE(5(C,A){V P=Q("<W p=\\"M-CI-CA\\"><W p=\\"M-CI-CA-M\\"></W><W p=\\"M-CI-CA-FY\\"></W><W p=\\"M-CI-CA-B$\\"></W></W>");Q(".M-CI-CA-B$",P).BN(A.i);Q(".M-CI-CC-B$",B.C9).BH(P);A.q&&P.q(A.q);A.Es&&P.BX(5(){A.Es(A,C,B.C9)})});Q(".M-CI-CC-B$",B.C9).BH("<W p=\'M-F9\'></W>")}V A=B.C9.q(),P=N;Q(".M-CI-CC-B$ .M-CI-CA",B.C9).BE(5(){P+=Q(b).q()});Q(".M-CI-CC-B$",B.C9).Y({marginLeft:7((A-P)*N.Dx)});B.VZ();B.F1();B.M3();V F=N,G=N,D=E.q||B.C9.q();R(E.h!=e)F=E.h;c E.h=F=N.Dx*(Q(w).q()-D);R(E.X!=e)G=E.X;c E.X=G=N.Dx*(Q(w).t()-B.C9.t())+Q(w).F8()-Cs;R(F<N)E.h=F=N;R(G<N)E.X=G=N;B.C9.Y({h:F,X:G});Q(".M-CI-CA",B.C9).B2(5(){Q(b).6("M-CI-CA-BB")},5(){Q(b).$("M-CI-CA-BB")});Q(".M-CI-BM",B.C9).B2(5(){Q(b).6("M-CI-BM-BB")},5(){Q(b).$("M-CI-BM-BB")}).BX(5(){B.C9.BM()});B.BZ(E)},BM:5(){V Q=b,P=b.1;b.Ly.OX();b.C9.Bm()},VZ:5(){V P=b,A=b.1;Q(".M-w-Fy").Bm();Q("<W p=\'M-w-Fy\' B7=\'CY: M7;\'></W>").Ch(Q("m"))},OX:5(){V P=b,A=b.1;Q(".M-w-Fy").Bm()},F1:5(){V P=b,A=b.1;R(A.Kj&&Q.Br.EV)P.C9.EV({En:".M-CI-CK-B$",CT:o})},M3:5(){V P=b,A=b.1;R(A.l)R(A.l=="FU"||A.l=="NW"){Q(".M-CI-D6",P.C9).6("M-CI-D6-NW").BT();Q(".M-CI-4",P.C9).Y({Hu:Hm,Fh:Hj})}c R(A.l=="Eb"){Q(".M-CI-D6",P.C9).6("M-CI-D6-Eb").BT();Q(".M-CI-4",P.C9).Y({Hu:Hm,Fh:Hj})}c R(A.l=="G_"){Q(".M-CI-D6",P.C9).6("M-CI-D6-G_").BT();Q(".M-CI-4",P.C9).Y({Hu:Hm,Fh:Hj})}c R(A.l=="Fc"){Q(".M-CI-D6",P.C9).6("M-CI-D6-Fc").BT();Q(".M-CI-4",P.C9).Y({Hu:Hm,Fh:Ii})}}});Q.Ed.BT=5(P){s Q.Ed(P)};Q.Ed.Gl=5(A,P,D,C){A=A||"";P=P||A;V B=5(P,Q,A){A.BM();R(C)C(P,Q,A)};DU={CK:A,4:P,CC:[{i:"\\ST\\RT",Es:B}]};R(D)DU.l=D;s Q.Ed(DU)};Q.Ed.JD=5(A,P,B){V C=5(P,Q,A){A.BM();R(B)B(Q==N)};DU={l:"Fc",CK:A,4:P,CC:[{i:"\\No",Es:C},{i:"\\Pt",Es:C}]};s Q.Ed(DU)};Q.Ed.FU=5(A,P,B){s Q.Ed.Gl(A,P,"FU",B)};Q.Ed.Eb=5(A,P,B){s Q.Ed.Gl(A,P,"Eb",B)};Q.Ed.G_=5(A,P,B){s Q.Ed.Gl(A,P,"G_",B)};Q.Ed.Fc=5(A,P){s Q.Ed.Gl(A,P,"Fc")}})(DM);(5(Q){Q.Br.OM=5(){s Q.2.CH.BD(b,"OM",B6)};Q.Br.Uv=5(){s Q.2.CH.BD(b,"Uv",B6)};Q.BR.H_={_:o};Q.CM.H_={};Q.2.8.H_=5(P,A){Q.2.8.H_.CW.Cw.BD(b,P,A)};Q.2.8.H_.DA(Q.2.8.F4,{Ci:5(){s"H_"},DH:5(){s"H_"},Dr:5(){s Q.CM.H_},DG:5(){V P=b,A=b.1;P.BS=Q(b.Bi);P.Bx=Q("<DS RU=\\"javascript:void(N)\\" p=\\"M-GB\\"></DS>");P.Bh=P.BS.6("M-G4").Ec("<W p=\\"M-GB-Bh\\"></W>").0();P.Bh.E_(P.Bx);P.BS.Dp(5(){R(b.Bp)P.Bx.6("M-GB-Bp");c P.Bx.$("M-GB-Bp");s f});P.Bx.BX(5(){P.Ob()});P.Bh.B2(5(){R(!A._)Q(b).6("M-BB")},5(){Q(b).$("M-BB")});b.Bi.Bp&&P.Bx.6("M-GB-Bp");R(b.Bi.U)Q("Da[a="+b.Bi.U+"]").BX(5(){P.Ob()});P.BZ(A)},EL:5(A){V Q=b,P=b.1;R(!A){Q.BS[N].Bp=o;Q.Bx.$("M-GB-Bp")}c{Q.BS[N].Bp=f;Q.Bx.6("M-GB-Bp")}},ER:5(){s b.BS[N].Bp},IS:5(){b.BS.j("_",o);b.Bh.$("M-_");b.1._=o},IP:5(){b.BS.j("_",f);b.Bh.6("M-_");b.1._=f},IO:5(){R(b.BS.j("_")){b.Bh.6("M-_");b.1._=f}R(b.BS[N].Bp)b.Bx.6("M-9-Bp");c b.Bx.$("M-9-Bp")},Ob:5(){V P=b,B=b.1;R(P.BS.j("_"))s o;P.BS.3("BX").3("Dp");V A;R(P.BS[N].Nc)A=P.BS[N].Nc;c A=CE;Q("BS:GB[Bt="+P.BS[N].Bt+"]",A).JX(P.BS).3("Dp");s o}})})(DM);(5(Q){Q.Br.Gm=5(P){s Q.2.CH.BD(b,"Gm",B6,{FV:"P5",Jf:o,Ie:"y"})};Q.Br.U7=5(){s Q.2.CH.BD(b,"U7",B6,{FV:"P5",Jf:o,Ie:"y"})};Q.BR.J2={KM:"KR, IJ, IM, IL, NN, Ll, NY, I_",L1:Ue,maxHeight:Ue,JP:FL,minHeight:FL,SX:Dw,CT:o,Ke:5(Q){},H5:5(Q){},Mi:5(Q){},MV:e};Q.2.8.J2=5(P){Q.2.8.J2.CW.Cw.BD(b,e,P)};Q.2.8.J2.DA(Q.2.Cm.Dh,{Ci:5(){s"J2"},DH:5(){s"J2"},DG:5(){V P=b,A=b.1;P.y=Q(A.y);P.BZ(A);P.y.HX(5(B){R(A._)s;P.E0=P.TG(B);R(P.E0)P.y.Y("CN",P.E0+"-C8");c R(P.y.Y("CN").EG("-C8")>N)P.y.Y("CN","Ez");R(A.y.LE){V C=Q.2.Dd(A.y.LE);R(C&&P.E0)C.BZ("_",f);c R(C)C.BZ("_",o)}}).Fv(5(Q){R(A._)s;R(P.E0)P.G7(Q)})},MD:5(){b.1.y.P5=b.U},TG:5(C){V P=b,F=b.1,D="",I=P.y.Bw(),E=P.y.q(),B=P.y.t(),A=F.SX,G=C.EU||C.J_,H=C.FA||C.ND;R(H>=I.X&&H<I.X+A)D+="KR";c R(H<=I.X+B&&H>I.X+B-A)D+="IM";R(G>=I.h&&G<I.h+A)D+="IL";c R(G<=I.h+E&&G>I.h+E-A)D+="IJ";R(F.KM=="all"||D=="")s D;R(Q.DI(D,P.KM)!=-O)s D;s""},_setHandles:5(Q){R(!Q)s;b.KM=Q.EH(/(\\IM*)/Ly,"").C7(",")},M_:5(){V P=b;P.B4=Q("<W p=\\"M-Ds\\"></W>");P.B4.q(P.y.q()).t(P.y.t());P.B4.j("resizableid",P.U).Ch("m")},Ip:5(){V Q=b;R(Q.B4){Q.B4.Bm();Q.B4=e}},G7:5(A){V P=b,B=b.1;P.M_();P.B4.Y({h:P.y.Bw().h,X:P.y.Bw().X,EN:"GL"});P.Bu={E0:P.E0,h:P.y.Bw().h,X:P.y.Bw().X,H6:A.EU||A.J_,H7:A.FA||A.TN,q:P.y.q(),t:P.y.t()};Q(CE).B3("FP.Ds",5(){s o});Q(CE).B3("F0.Ds",5(){P.JH.E3(P,B6)});Q(CE).B3("HX.Ds",5(){P.Iu.E3(P,B6)});P.B4.BT();P.3("Tp",[P.Bu,A])},Kd:{Qs:["KR","NN","I_"],M:["IL","NY","I_"],IL:["IL","NY","I_","IJ","NN","Ll"],Lz:["KR","NN","I_","IM","Ll","NY"]},Iu:5(P){V Q=b,A=b.1;R(!Q.Bu)s;R(!Q.B4)s;Q.B4.Y("CN",Q.Bu.E0==""?"Ez":Q.Bu.E0+"-C8");V B=P.EU||P.J_,C=P.FA||P.ND;Q.Bu.HD=B-Q.Bu.H6;Q.Bu.Hv=C-Q.Bu.H7;Q.Jz(Q.B4);Q.3("C8",[Q.Bu,P])},JH:5(A){V P=b,B=b.1;R(P.GD("UG")){R(P.3("UG",[P.Bu,A])!=o)P.Jz()}c P.Jz();P.Ip();P.3("NP",[P.Bu,A]);Q(CE).DJ("FP.Ds");Q(CE).DJ("HX.Ds");Q(CE).DJ("F0.Ds")},Jz:5(D){V P=b,B=b.1,C={h:P.Bu.h,X:P.Bu.X,q:P.Bu.q,t:P.Bu.t},A=o;R(!D){D=P.y;A=f;R(!Fk(7(P.y.Y("X"))))C.X=7(P.y.Y("X"));c C.X=N;R(!Fk(7(P.y.Y("h"))))C.h=7(P.y.Y("h"));c C.h=N}R(Q.DI(P.Bu.E0,P.Kd.M)>-O){C.h+=P.Bu.HD;P.Bu.Kl=P.Bu.HD}c R(A)Cy C.h;R(Q.DI(P.Bu.E0,P.Kd.Qs)>-O){C.X+=P.Bu.Hv;P.Bu.K9=P.Bu.Hv}c R(A)Cy C.X;R(Q.DI(P.Bu.E0,P.Kd.IL)>-O){C.q+=(P.Bu.E0.EG("IL")==-O?O:-O)*P.Bu.HD;P.Bu.JJ=C.q}c R(A)Cy C.q;R(Q.DI(P.Bu.E0,P.Kd.Lz)>-O){C.t+=(P.Bu.E0.EG("KR")==-O?O:-O)*P.Bu.Hv;P.Bu.LJ=C.t}c R(A)Cy C.t;R(A&&B.CT)D.CT(C);c D.Y(C)}})})(DM);(5(Q){Q.Br.LW=5(){s Q.2.CH.BD(b,"LW",B6)};Q.Br.TK=5(){s Q.2.CH.BD(b,"TK",B6)};Q.BR.Gp={l:"D1",Px:f,UO:Bl,Hy:N.O,FT:Jn,Tx:o,Fj:e,Fr:e,_:o};Q.CM.Gp={};Q.2.8.Gp=5(P,A){Q.2.8.Gp.CW.Cw.BD(b,P,A)};Q.2.8.Gp.DA(Q.2.8.F4,{Ci:5(){s"Gp"},DH:5(){s"Gp"},Dr:5(){s Q.CM.Gp},Ei:5(){Q.2.8.Gp.CW.Ei.BD(b);V P=b.1;R(P.l=="D1"){P.Hy=N.O;P.FT=Jn}c R(P.l=="FC"){P.Hy=O;P.FT=GY}c R(P.l=="DF"){P.Hy=O;P.FT=GY}},DG:5(){V P=b,A=b.1;P.FT=e;P.BL=e;P.BP=e;P.Fp="";R(b.Bi.Dk.DB()=="BS"&&b.Bi.l&&b.Bi.l=="i"){P.BL=Q(b.Bi);R(b.Bi.U)P.Fp=b.Bi.U}c{P.BL=Q("<BS l=\\"i\\"/>");P.BL.Ch(Q(b.Bi))}R(P.Fp==""&&A.Fp)P.Fp=A.Fp;P.Bx=Q("<W p=\\"M-3\\"><W p=\\"M-D9-HO\\"><W p=\\"M-D9-CO\\"></W></W><W p=\\"M-D9-C7\\"></W><W p=\\"M-D9-F$\\"><W p=\\"M-D9-CO\\"></W></W></W>");P.Bh=P.BL.Ec("<W p=\\"M-i\\"></W>").0();P.Bh.BH("<W p=\\"M-i-M\\"></W><W p=\\"M-i-FY\\"></W>");P.Bh.BH(P.Bx).F5(P.BW).F5(P.Cj);P.Bx.HO=Q(".M-D9-HO",P.Bx);P.Bx.F$=Q(".M-D9-F$",P.Bx);P.BL.6("M-i-FE");R(A._)P.Bh.6("M-i-_");R(!P.OR(P.BL.Bj())){P.BP=P.RI();P.BL.Bj(P.BP)}P.Bx.HO.B2(5(){R(!A._)Q(b).6("M-D9-HO-BB")},5(){MA(P.FT);Q(CE).DJ("FP.D9");Q(b).$("M-D9-HO-BB")}).Fv(5(){R(!A._){P.Nz.BD(P);P.FT=Sd(5(){P.Nz.BD(P)},A.FT);Q(CE).B3("FP.D9",5(){s o})}}).F0(5(){MA(P.FT);P.BL.3("Dp").ET();Q(CE).DJ("FP.D9")});P.Bx.F$.B2(5(){R(!A._)Q(b).6("M-D9-F$-BB")},5(){MA(P.FT);Q(CE).DJ("FP.D9");Q(b).$("M-D9-F$-BB")}).Fv(5(){R(!A._){P.FT=Sd(5(){P.Vc.BD(P)},A.FT);Q(CE).B3("FP.D9",5(){s o})}}).F0(5(){MA(P.FT);P.BL.3("Dp").ET();Q(CE).DJ("FP.D9")});P.BL.Dp(5(){V Q=P.BL.Bj();P.BP=P.Uo(Q);P.3("Rl",[P.BP]);P.BL.Bj(P.BP)}).KI(5(){P.Bh.$("M-i-ET")}).ET(5(){P.Bh.6("M-i-ET")});P.Bh.B2(5(){R(!A._)P.Bh.6("M-i-BB")},5(){P.Bh.$("M-i-BB")});P.BZ(A)},G0:5(P){V Q=b;R(P>FL){Q.Bh.Y({q:P});Q.BL.Y({q:P-FL})}},Gt:5(P){V Q=b;R(P>Cs){Q.Bh.t(P);Q.BL.t(P-Bl);Q.Bx.t(P-C3)}},Lo:5(Q){R(Q)b.Bh.6("M-i-_");c b.Bh.$("M-i-_")},EL:5(Q){b.BL.Bj(Q)},ER:5(){s b.BL.Bj()},SM:5(P,B){V Q=b,C=b.1,A=O;a(;B>N;A*=Cs,B--);a(;B<N;A/=Cs,B++);s Ig.round(P*A)/A},Vk:5(P){V Q=b,A=b.1,B=A.Px?/^-?\\Ce+Q/:/^\\Ce+Q/;R(!B.GI(P))s o;R(Dj(P)!=P)s o;s f},Rf:5(P){V Q=b,A=b.1,B=A.Px?/^-?\\Ce+(\\.\\Ce+)?Q/:/^\\Ce+(\\.\\Ce+)?Q/;R(!B.GI(P))s o;R(Dj(P)!=P)s o;s f},TV:5(P){V Q=b,B=b.1,A=P.J9(/^(\\Ce{O,Bl}):(\\Ce{O,Bl})Q/);R(A==e)s o;R(A[O]>Os||A[Bl]>60)s o;s f},OR:5(P){V Q=b,A=b.1;R(A.l=="D1"){R(!Q.Rf(P))s o;V B=Dj(P);R(A.Fj!=CG&&A.Fj>B)s o;R(A.Fr!=CG&&A.Fr<B)s o;s f}c R(A.l=="FC"){R(!Q.Vk(P))s o;B=7(P);R(A.Fj!=CG&&A.Fj>B)s o;R(A.Fr!=CG&&A.Fr<B)s o;s f}c R(A.l=="DF")s Q.TV(P);s o},Uo:5(B){V P=b,A=b.1,Q=e;R(A.l=="D1")Q=P.SM(B,A.UO);c R(A.l=="FC")Q=7(B);c R(A.l=="DF")Q=B;R(!P.OR(Q))s P.BP;c s Q},Oh:5(A){V Q=b,P=b.1;R(P.Fj!=e&&P.Fj>A)s f;R(P.Fr!=e&&P.Fr<A)s f;s o},RI:5(){V Q=b,P=b.1;R(P.l=="D1"||P.l=="FC")s N;c R(P.l=="DF")s"Mb:Mb"},OK:5(P){V Q=b,A=b.1,B=Q.BL.Bj();B=Dj(B)+P;R(Q.Oh(B))s;Q.BL.Bj(B);Q.BL.3("Dp")},Nl:5(Q){V P=b,B=b.1,C=P.BL.Bj(),A=C.J9(/^(\\Ce{O,Bl}):(\\Ce{O,Bl})Q/);LV=7(A[Bl])+Q;R(LV<Cs)LV="N"+LV;C=A[O]+":"+LV;R(P.Oh(C))s;P.BL.Bj(C);P.BL.3("Dp")},Nz:5(){V Q=b,P=b.1;R(P.l=="D1"||P.l=="FC")Q.OK(P.Hy);c R(P.l=="DF")Q.Nl(P.Hy)},Vc:5(){V Q=b,P=b.1;R(P.l=="D1"||P.l=="FC")Q.OK(-O*P.Hy);c R(P.l=="DF")Q.Nl(-O*P.Hy)},_isDateTime:5(C){V Q=b,B=b.1,A=C.J9(/^(\\Ce{O,C3})(-|\\/)(\\Ce{O,Bl})\\Bl(\\Ce{O,Bl})Q/);R(A==e)s o;V P=DT EM(A[O],A[Dw]-O,A[C3]);R(P=="Ka")s o;s(P.GN()==A[O]&&(P.Fg()+O)==A[Dw]&&P.Fq()==A[C3])},_isLongDateTime:5(D){V Q=b,C=b.1,B=/^(\\Ce{O,C3})(-|\\/)(\\Ce{O,Bl})\\Bl(\\Ce{O,Bl}) (\\Ce{O,Bl}):(\\Ce{O,Bl})Q/,A=D.J9(B);R(A==e)s o;V P=DT EM(A[O],A[Dw]-O,A[C3],A[Dx],A[II]);R(P=="Ka")s o;s(P.GN()==A[O]&&(P.Fg()+O)==A[Dw]&&P.Fq()==A[C3]&&P.Ht()==A[Dx]&&P.HT()==A[II])}})})(DM);(5(Q){Q.Br.TF=5(P){s Q.2.CH.BD(b,"TF",B6)};Q.Br.UY=5(){s Q.2.CH.BD(b,"UY",B6)};Q.BR.HV={t:e,Fa:N,Ml:o,Gy:f,Ty:o,U$:o,onBeforeOverrideTabItem:e,onAfterOverrideTabItem:e,onBeforeRemoveTabItem:e,onAfterRemoveTabItem:e,onBeforeAddTabItem:e,onAfterAddTabItem:e,onBeforeSelectTabItem:e,onAfterSelectTabItem:e};Q.BR.TabString={Mc:"\\L4\\MR\\u5f53\\u524d\\RM",Vb:"\\L4\\MR\\u5176\\u4ed6",Uw:"\\L4\\MR\\u6240\\SN",Uf:"\\u5237\\u65b0"};Q.CM.HV={};Q.2.8.HV=5(P,A){Q.2.8.HV.CW.Cw.BD(b,P,A)};Q.2.8.HV.DA(Q.2.Cm.Dh,{Ci:5(){s"HV"},DH:5(){s"HV"},Dr:5(){s Q.CM.HV},DG:5(){V P=b,A=b.1;R(A.t)P.Pj=f;P.Z=Q(b.Bi);P.Z.6("M-Z");R(A.Gy&&Q.LZ)P.Z.B5=Q.LZ({q:GY,Ek:[{i:A.Mc,U:"BM",BX:5(){P.LY.E3(P,B6)}},{i:A.Vb,U:"UB",BX:5(){P.LY.E3(P,B6)}},{i:A.Uw,U:"RZ",BX:5(){P.LY.E3(P,B6)}},{i:A.Uf,U:"Kx",BX:5(){P.LY.E3(P,B6)}}]});P.Z.4=Q("<W p=\\"M-Z-4\\"></W>");Q("> W",P.Z).Ch(P.Z.4);P.Z.4.Ch(P.Z);P.Z.Bc=Q("<W p=\\"M-Z-Bc\\"><Bs B7=\\"h: Qf; \\"></Bs></W>");P.Z.Bc.QU(P.Z);P.Z.Bc.Bs=Q("Bs",P.Z.Bc);V B=Q("> W[Jx=f]",P.Z.4),C=B.v>N;P.K3=B.j("Ck");Q("> W",P.Z.4).BE(5(I,G){V A=Q("<S p=\\"\\"><DS></DS><W p=\\"M-Z-Bc-B0-h\\"></W><W p=\\"M-Z-Bc-B0-BJ\\"></W></S>"),E=Q(b);R(E.j("CK")){Q("> DS",A).BN(E.j("CK"));E.j("CK","")}V H=E.j("Ck");R(H==CG){H=P.NJ();E.j("Ck",H);R(E.j("Jx"))P.K3=H}A.j("Ck",H);R(!C&&I==N)P.K3=H;V B=E.j("LP");R(B)A.BH("<W p=\'M-Z-Bc-B0-BM\'></W>");Q("> Bs",P.Z.Bc).BH(A);R(!E.BF("M-Z-4-B0"))E.6("M-Z-4-B0");R(E.B8("EZ").v>N){V D=Q("EZ:r",E);R(D[N].readyState!="O5"){R(E.B8(".M-Z-D2:r").v==N)E.E_("<W p=\'M-Z-D2\' B7=\'CY:M7;\'></W>");V F=Q(".M-Z-D2:r",E);D.B3("EX.Z",5(){F.BK()})}}});P.Jm(P.K3);R(A.t)R(BO(A.t)=="CJ"&&A.t.EG("%")>N){P.H5();R(A.Ml)Q(w).C8(5(){P.H5.BD(P)})}c P.I1(A.t);R(P.Pj)P.Lr();Q("S",P.Z.Bc).BE(5(){P.QL(Q(b))});P.Z.B3("KS.Z",5(B){R(!A.Ty)s;P.Ri=f;V E=(B.y||B.I$),C=E.Dk.DB();R(C=="DS"){V F=Q(E).0().j("Ck"),D=Q(E).0().B8("W.M-Z-Bc-B0-BM").v?f:o;R(D)P.IK(F)}P.Ri=o});P.BZ(A)},F1:5(A){V P=b,C=b.1;P.Jr=P.Jr||Q("<W p=\'M-Z-DE-Jr\' B7=\'CY:DN\'><W p=\'M-Bq-Fn-HO\'></W><W p=\'M-Bq-Fn-F$\'></W></W>").Ch("m");V B=Q(A).EV({Hb:f,CT:o,B4:5(){V A=Q(b).B8("DS").BN();P.KC=Q("<W p=\'M-Z-DE-B4\' B7=\'CY:DN\'><W p=\'M-Bq-CO M-Bq-Df\'></W></W>").Ch("m");P.KC.BH(A);s P.KC},MS:5(){b.BZ("CN","pointer")},JB:5(B,P){R(!Q(A).BF("M-BC"))s o;R(P.Cb==Bl)s o;V C=P.I$||P.y;R(Q(C).BF("M-Z-Bc-B0-BM"))s o},Kc:5(C,B){R(P.HC==e)P.HC=-O;V D=P.Z.Bc.Bs.B8(">S"),A=D.DP(C.y);D.BE(5(I,E){R(A==I)s;V C=I>A;R(P.HC!=-O&&P.HC!=I)s;V G=Q(b).Bw(),D={X:G.X,Bv:G.X+Q(b).t(),h:G.h-Cs,BJ:G.h+Cs};R(C){D.h+=Q(b).q();D.BJ+=Q(b).q()}V F=B.EU||B.J_,H=B.FA||B.ND;R(F>D.h&&F<D.BJ&&H>D.X&&H<D.Bv){P.Jr.Y({h:D.h+Dx,X:D.X-Lt}).BT();P.HC=I;P.KC.B8(".M-Bq-CO").$("M-Bq-Df").6("M-Bq-D7")}c{P.HC=-O;P.Jr.BK();P.KC.B8(".M-Bq-CO").$("M-Bq-D7").6("M-Bq-Df")}})},I4:5(C,B){R(P.HC>-O){V A=P.Z.Bc.Bs.B8(">S:HK("+P.HC+")").j("Ck"),D=Q(C.y).j("Ck");Ow(5(){P.Us(D,A)},N);P.HC=-O;P.KC.Bm()}P.Jr.BK();b.BZ("CN","Ez")}});s B},_setDragToMove:5(B){R(!Q.Br.EV)s;V P=b,A=b.1;R(B){R(P.I8)s;P.I8=P.I8||[];P.Z.Bc.Bs.B8(">S").BE(5(){P.I8.d(P.F1(b))})}},Us:5(A,C){V P=b,E=P.Z.Bc.Bs.B8(">S[Ck="+A+"]"),Q=P.Z.Bc.Bs.B8(">S[Ck="+C+"]"),B=P.Z.Bc.Bs.B8(">S").DP(E),D=P.Z.Bc.Bs.B8(">S").DP(Q);R(B<D)Q.F5(E);c Q.IY(E)},PP:5(){V P=b,A=b.1,C=N;Q("S",P.Z.Bc.Bs).BE(5(){C+=Q(b).q()+Bl});V B=P.Z.q();R(C>B){P.Z.Bc.BH("<W p=\\"M-Z-Bc-h\\"></W><W p=\\"M-Z-Bc-BJ\\"></W>");P.U5();s f}c{P.Z.Bc.Bs.CT({h:N});Q(".M-Z-Bc-h,.M-Z-Bc-BJ",P.Z.Bc).Bm();s o}},U5:5(){V P=b,A=b.1;Q(".M-Z-Bc-h",P.Z.Bc).B2(5(){Q(b).6("M-Z-Bc-h-BB")},5(){Q(b).$("M-Z-Bc-h-BB")}).BX(5(){P.Q6()});Q(".M-Z-Bc-BJ",P.Z.Bc).B2(5(){Q(b).6("M-Z-Bc-BJ-BB")},5(){Q(b).$("M-Z-Bc-BJ-BB")}).BX(5(){P.Vh()})},Q6:5(){V P=b,A=b.1,B=Q(".M-Z-Bc-h",P.Z.Bc).q(),D=DT Hh();Q("S",P.Z.Bc).BE(5(C,P){V A=-O*B;R(C>N)A=7(D[C-O])+Q(b).FI().q()+Bl;D.d(A)});V C=-O*7(P.Z.Bc.Bs.Y("h"));a(V E=N;E<D.v-O;E++)R(D[E]<C&&D[E+O]>=C){P.Z.Bc.Bs.CT({h:-O*7(D[E])});s}},Vh:5(){V P=b,A=b.1,C=Q(".M-Z-Bc-BJ",P.Z).q(),J=N,H=Q("S",P.Z.Bc.Bs);H.BE(5(){J+=Q(b).q()+Bl});V B=P.Z.q(),G=DT Hh();a(V I=H.v-O;I>=N;I--){V F=J-B+C+Bl;R(I!=H.v-O)F=7(G[H.v-Bl-I])-Q(H[I+O]).q()-Bl;G.d(F)}V E=-O*7(P.Z.Bc.Bs.Y("h"));a(V D=O;D<G.v;D++)R(G[D]<=E&&G[D-O]>E){P.Z.Bc.Bs.CT({h:-O*7(G[D-O])});s}},getTabItemCount:5(){V P=b,A=b.1;s Q("S",P.Z.Bc.Bs).v},Pv:5(){V P=b,A=b.1;s Q("S.M-BC",P.Z.Bc.Bs).j("Ck")},removeSelectedTabItem:5(){V Q=b,P=b.1;Q.IK(Q.Pv())},overrideSelectedTabItem:5(A){V Q=b,P=b.1;Q.TR(Q.Pv(),A)},TR:5(D,K){V P=b,I=b.1;R(P.3("beforeOverrideTabItem",[D])==o)s o;V L=K.Ck;R(L==CG)L=P.NJ();V E=K.CU,G=K.4,J=K.y,B=K.i,A=K.LP,H=K.t;R(P.O2(L))s;V F=Q("S[Ck="+D+"]",P.Z.Bc.Bs),C=Q(".M-Z-4-B0[Ck="+D+"]",P.Z.4);R(!F||!C)s;F.j("Ck",L);C.j("Ck",L);R(Q("EZ",C).v==N&&E)C.BN("<EZ NA=\'N\'></EZ>");c R(G)C.BN(G);Q("EZ",C).j("Bt",L);R(A==CG)A=f;R(A==o)Q(".M-Z-Bc-B0-BM",F).Bm();c R(Q(".M-Z-Bc-B0-BM",F).v==N)F.BH("<W p=\'M-Z-Bc-B0-BM\'></W>");R(B==CG)B=L;R(H)C.t(H);Q("DS",F).i(B);Q("EZ",C).j("E6",E);P.3("afterOverrideTabItem",[D])},Jm:5(B){V P=b,A=b.1;R(P.3("beforeSelectTabItem",[B])==o)s o;P.K3=B;Q("> .M-Z-4-B0[Ck="+B+"]",P.Z.4).BT().Gd().BK();Q("S[Ck="+B+"]",P.Z.Bc.Bs).6("M-BC").Gd().$("M-BC");P.3("afterSelectTabItem",[B])},Q8:5(){V P=b,A=b.1,D=N;Q("S",P.Z.Bc.Bs).BE(5(){D+=Q(b).q()+Bl});V C=P.Z.q();R(D>C){V B=Q(".M-Z-Bc-BJ",P.Z.Bc).q();P.Z.Bc.Bs.CT({h:-O*(D-C+B+Bl)})}},O2:5(B){V P=b,A=b.1;s Q("S[Ck="+B+"]",P.Z.Bc.Bs).v>N},addTabItem:5(L){V P=b,J=b.1;R(P.3("beforeAddTabItem",[B1])==o)s o;V B1=L.Ck;R(B1==CG)B1=P.NJ();V E=L.CU,G=L.4,C=L.i,A=L.LP,I=L.t;R(P.O2(B1)){P.Jm(B1);s}V F=Q("<S><DS></DS><W p=\'M-Z-Bc-B0-h\'></W><W p=\'M-Z-Bc-B0-BJ\'></W><W p=\'M-Z-Bc-B0-BM\'></W></S>"),D=Q("<W p=\'M-Z-4-B0\'><W p=\'M-Z-D2\' B7=\'CY:M7;\'></W><EZ NA=\'N\'></EZ></W>"),K=Q("W:r",D),H=Q("EZ:r",D);R(P.Pj){V B=P.Z.t()-P.Z.Bc.t();D.t(B)}F.j("Ck",B1);D.j("Ck",B1);R(E)H.j("Bt",B1).j("U",B1).j("E6",E).B3("EX.Z",5(){K.BK();R(L.Ky)L.Ky()});c{H.Bm();K.Bm()}R(G)D.BN(G);c R(L.y)D.BH(L.y);R(A==CG)A=f;R(A==o)Q(".M-Z-Bc-B0-BM",F).Bm();R(C==CG)C=B1;R(I)D.t(I);Q("DS",F).i(C);P.Z.Bc.Bs.BH(F);P.Z.4.BH(D);P.Jm(B1);R(P.PP())P.Q8();P.QL(F);R(J.U$&&Q.Br.EV){P.I8=P.I8||[];F.BE(5(){P.I8.d(P.F1(b))})}P.3("afterAddTabItem",[B1])},QL:5(B){V P=b,A=b.1;B.BX(5(){V A=Q(b).j("Ck");P.Jm(A)});P.Z.B5&&P.Tc(B);Q(".M-Z-Bc-B0-BM",B).B2(5(){Q(b).6("M-Z-Bc-B0-BM-BB")},5(){Q(b).$("M-Z-Bc-B0-BM-BB")}).BX(5(){V A=Q(b).0().j("Ck");P.IK(A)})},IK:5(C){V P=b,A=b.1;R(P.3("beforeRemoveTabItem",[C])==o)s o;V B=Q("S[Ck="+C+"]",P.Z.Bc.Bs).BF("M-BC");R(B){Q(".M-Z-4-B0[Ck="+C+"]",P.Z.4).FI().BT();Q("S[Ck="+C+"]",P.Z.Bc.Bs).FI().6("M-BC").Gd().$("M-BC")}Q(".M-Z-4-B0[Ck="+C+"]",P.Z.4).Bm();Q("S[Ck="+C+"]",P.Z.Bc.Bs).Bm();P.PP();P.3("afterRemoveTabItem",[C])},addHeight:5(A){V P=b,B=b.1,Q=P.Z.t()+A;P.I1(Q)},I1:5(P){V Q=b,A=b.1;Q.Z.t(P);Q.Lr()},Lr:5(){V P=b,B=b.1,A=P.Z.t()-P.Z.Bc.t();P.Z.4.t(A);Q("> .M-Z-4-B0",P.Z.4).t(A)},NJ:5(){V Q=b,P=b.1;Q.QT=Q.QT||N;s"tabitem"+(++Q.QT)},QN:5(D,P){V B=b,C=b.1,A=[];Q("> S",B.Z.Bc.Bs).BE(5(){R(Q(b).j("Ck")&&Q(b).j("Ck")!=D&&(!P||Q(".M-Z-Bc-B0-BM",b).v>N))A.d(Q(b).j("Ck"))});s A},SJ:5(D,C){V A=b,B=b.1,P=A.QN(D,f);Q(P).BE(5(){A.IK(b)})},Kx:5(F){V P=b,C=b.1,B=Q(".M-Z-4-B0[Ck="+F+"]"),D=Q(".M-Z-D2:r",B),A=Q("EZ:r",B),E=Q(A).j("E6");D.BT();A.j("E6",E).DJ("EX.Z").B3("EX.Z",5(){D.BK()})},Rq:5(C){V A=b,B=b.1,P=A.QN(e,f);Q(P).BE(5(){A.IK(b)})},H5:5(){V P=b,A=b.1;R(!A.t||BO(A.t)!="CJ"||A.t.EG("%")==-O)s o;R(P.Z.0()[N].Dk.DB()=="m"){V B=Q(w).t();B-=7(P.Z.0().Y("KG"));B-=7(P.Z.0().Y("Fh"));P.t=A.Fa+B*Dj(P.t)*N.G5}c P.t=A.Fa+(P.Z.0().t()*Dj(A.t)*N.G5);P.Z.t(P.t);P.Lr()},LY:5(A){V Q=b,P=b.1;R(!A.U||!Q.Hl)s;Pq(A.U){EJ"BM":Q.IK(Q.Hl);Q.Hl=e;Dl;EJ"UB":Q.SJ(Q.Hl);Dl;EJ"RZ":Q.Rq();Q.Hl=e;Dl;EJ"Kx":Q.Jm(Q.Hl);Q.Kx(Q.Hl);Dl}},Tc:5(B){V P=b,A=b.1;B.B3("Gy",5(A){R(!P.Z.B5)s;P.Hl=B.j("Ck");P.Z.B5.BT({X:A.FA,h:A.EU});R(Q(".M-Z-Bc-B0-BM",b).v==N)P.Z.B5.IP("BM");c P.Z.B5.IS("BM");s o})}})})(DM);(5(Q){Q.Br.Js=5(){s Q.2.CH.BD(b,"Js",B6)};Q.Br.SS=5(){s Q.2.CH.BD(b,"SS",B6)};Q.BR.Ir={Tx:e,q:e,_:o,BP:e,J3:e,NB:o,EC:o};Q.2.8.Ir=5(P,A){Q.2.8.Ir.CW.Cw.BD(b,P,A)};Q.2.8.Ir.DA(Q.2.8.F4,{Ci:5(){s"Ir"},DH:5(){s"Ir"},Ei:5(){Q.2.8.Ir.CW.Ei.BD(b);V P=b,A=b.1;R(!A.q)A.q=Q(P.Bi).q();R(Q(b.Bi).j("Fz"))A._=f},DG:5(){V P=b,A=b.1;P.BL=Q(b.Bi);P.Bh=P.BL.Ec("<W p=\\"M-i\\"></W>").0();P.Bh.BH("<W p=\\"M-i-M\\"></W><W p=\\"M-i-FY\\"></W>");R(!P.BL.BF("M-i-FE"))P.BL.6("M-i-FE");b.Nj();P.BZ(A);P.Mh()},LL:5(){s b.BL.Bj()},_setNullText:5(){b.OT()},Mh:5(){V P=b,A=b.1,Q=P.BL.Bj();R(A.EC&&!/^-?(?:\\Ce+|\\Ce{O,Dw}(?:,\\Ce{Dw})+)(?:\\.\\Ce+)?Q/.GI(Q)||A.NB&&!/^\\Ce+Q/.GI(Q)){P.BL.Bj(P.BP||N);s}P.BP=Q},OT:5(){V Q=b,P=b.1;R(P.J3&&!P._)R(!Q.BL.Bj())Q.BL.6("M-i-FE-e").Bj(P.J3)},Nj:5(){V P=b,A=b.1;P.BL.B3("KI.U9",5(){P.3("KI");P.OT();P.Mh();P.Bh.$("M-i-ET")}).B3("ET.U9",5(){P.3("ET");R(A.J3)R(Q(b).BF("M-i-FE-e"))Q(b).$("M-i-FE-e").Bj("");P.Bh.6("M-i-ET")}).Dp(5(){P.3("Rl",[b.BP])});P.Bh.B2(5(){P.3("mouseOver");P.Bh.6("M-i-BB")},5(){P.3("mouseOut");P.Bh.$("M-i-BB")})},Lo:5(Q){R(Q){b.BL.j("Fz","Fz");b.Bh.6("M-i-_")}c{b.BL.I7("Fz");b.Bh.$("M-i-_")}},G0:5(Q){R(Q>FL){b.Bh.Y({q:Q});b.BL.Y({q:Q-C3})}},Gt:5(Q){R(Q>Cs){b.Bh.t(Q);b.BL.t(Q-Bl)}},Ib:5(Q){R(Q!=e)b.BL.Bj(Q)},_setLabel:5(B){V P=b,A=b.1;R(!P.C2){P.C2=P.Bh.Ec("<W p=\\"M-N$\\"></W>").0();V C=Q("<W p=\\"M-i-Da\\" B7=\\"D1:h;\\">"+B+":&Ex</W>");P.C2.E_(C);P.Bh.Y("D1","h");R(!A.EW)A.EW=C.q();c P.Ti(A.EW);C.t(P.Bh.t());R(A.HA)P.VK(A.HA);P.C2.BH("<NH B7=\\"F9:Ox;\\" />");P.C2.q(A.EW+A.q+Bl)}c P.C2.B8(".M-i-Da").BN(B+":&Ex")},Ti:5(A){V Q=b,P=b.1;R(!Q.C2)s;Q.C2.B8(".M-i-Da").q(A)},VK:5(A){V Q=b,P=b.1;R(!Q.C2)s;Q.C2.B8(".M-i-Da").Y("i-Bn",A)},IO:5(){V Q=b,P=b.1;R(Q.BL.j("_")||Q.BL.j("Fz")){Q.Bh.6("M-i-_");Q.1._=f}c{Q.Bh.$("M-i-_");Q.1._=o}R(Q.BL.BF("M-i-FE-e")&&Q.BL.Bj()!=P.J3)Q.BL.$("M-i-FE-e");Q.Mh()}})})(DM);(5(Q){Q.KT=5(P){s Q.2.CH.BD(e,"KT",B6)};Q.Br.KT=5(P){b.BE(5(){V A=Q.CV({},Q.BR.Rw,P||{});A.y=A.y||b;R(A.E$||P==CG){R(!A.4){A.4=b.CK;R(A.OP)Q(b).I7("CK")}A.4=A.4||b.CK;Q(b).B3("Kp.Eo",5(){A.HQ=Q(b).Bw().h+Q(b).q()+(A.Pm||N);A.GK=Q(b).Bw().X+(A.Pn||N);Q.KT(A)}).B3("Ko.Eo",5(){V P=Q.2.GC[b.Jl];R(P)P.Bm()})}c{R(A.y.Jl)s;A.HQ=Q(b).Bw().h+Q(b).q()+(A.Pm||N);A.GK=Q(b).Bw().X+(A.Pn||N);A.HQ=A.HQ||N;A.GK=A.GK||N;Q.KT(A)}});s Q.2.Dd(b,"Jl")};Q.Br.ligerHideTip=5(P){s b.BE(5(){V B=P||{};R(B.PW==CG)B.PW=b.Dk.DB()=="Da"&&Q(b).j("a")!=e;V C=b;R(B.PW){V D=Q("#"+Q(b).j("a"));R(D.v==N)s;C=D[N]}V A=Q.2.GC[C.Jl];R(A)A.Bm()}).DJ("Kp.Eo").DJ("Ko.Eo")};Q.Br.ligerGetTipManager=5(){s Q.2.Dd(b)};Q.BR=Q.BR||{};Q.BR.HideTip={};Q.BR.IC={4:e,Ky:e,q:150,t:e,HQ:N,GK:N,Jk:e,y:e,E$:e,OP:f};Q.BR.Rw={Pm:O,Pn:-Dw,E$:e,OP:f};Q.CM.IC={};Q.2.8.IC=5(P){Q.2.8.IC.CW.Cw.BD(b,e,P)};Q.2.8.IC.DA(Q.2.Cm.Dh,{Ci:5(){s"IC"},DH:5(){s"IC"},Dr:5(){s Q.CM.IC},DG:5(){V P=b,A=b.1,B=Q("<W p=\\"M-Ix-Eo\\"><W p=\\"M-Ix-Eo-corner\\"></W><W p=\\"M-Ix-Eo-4\\"></W></W>");P.Eo=B;P.Eo.j("U",P.U);R(A.4){Q("> .M-Ix-Eo-4:r",B).BN(A.4);B.Ch("m")}c s;B.Y({h:A.HQ,X:A.GK}).BT();A.q&&Q("> .M-Ix-Eo-4:r",B).q(A.q-Lu);A.t&&Q("> .M-Ix-Eo-4:r",B).q(A.t);eee=A.Jk;R(A.Jk)A.Jk.j("Mo",P.U);R(A.y){Q(A.y).j("Mo",P.U);A.y.Jl=P.U}A.Ky&&A.Ky(B);P.BZ(A)},Tu:5(P){Q("> .M-Ix-Eo-4:r",b.Eo).BN(P)},Bm:5(){R(b.1.Jk)b.1.Jk.I7("Mo");R(b.1.y){Q(b.1.y).I7("Mo");b.1.y.Jl=e}b.Eo.Bm()}})})(DM);(5(Q){Q.Br.Nb=5(P){s Q.2.CH.BD(b,"Nb",B6)};Q.Br.Re=5(){s Q.2.CH.BD(b,"Re",B6)};Q.BR.IF={};Q.CM.IF={};Q.2.8.IF=5(P,A){Q.2.8.IF.CW.Cw.BD(b,P,A)};Q.2.8.IF.DA(Q.2.Cm.Dh,{Ci:5(){s"IF"},DH:5(){s"IF"},Dr:5(){s Q.CM.IF},DG:5(){V P=b,A=b.1;P.MK=Q(b.Bi);P.MK.6("M-Bb");P.BZ(A)},_setItems:5(A){V P=b;Q(A).BE(5(A,Q){P.Hq(Q)})},Hq:5(C){V P=b,B=b.1;R(C.Gz){P.MK.BH("<W p=\\"M-Bg-Jc\\"></W>");s}V A=Q("<W p=\\"M-Bb-B0 M-CS-CA\\"><BG></BG><W p=\\"M-CS-CA-M\\"></W><W p=\\"M-CS-CA-FY\\"></W></W>");P.MK.BH(A);C.U&&A.j("toolbarid",C.U);R(C.H$){A.BH("<H$ E6=\'"+C.H$+"\' />");A.6("M-Bb-B0-NT")}c R(C.CO){A.BH("<W p=\'M-CO M-CO-"+C.CO+"\'></W>");A.6("M-Bb-B0-NT")}C.i&&Q("BG:r",A).BN(C.i);C.FS&&A.6("M-Bb-B0-FS");C.BX&&A.BX(5(){C.BX(C)});A.B2(5(){Q(b).6("M-CS-CA-BB")},5(){Q(b).$("M-CS-CA-BB")})}})})(DM);(5(Q){Q.Br.QV=5(P){s Q.2.CH.BD(b,"QV",B6)};Q.Br.QX=5(){s Q.2.CH.BD(b,"QX",B6)};Q.BR.Ku={CU:e,n:e,9:f,N1:f,Ld:"folder",Na:"leaf",LQ:"i",G1:["U","CU"],treeLine:f,RF:TD,EE:"PZ",Jy:e,N2:o,onBeforeExpand:5(){},Q4:5(){},onExpand:5(){},onBeforeCollapse:5(){},PQ:5(){},Oe:5(){},T2:5(){},onBeforeCancelSelect:5(){},onCancelselect:5(){},SG:5(){},Oa:5(){},Nu:5(){},onClick:5(){},Ji:"U",N5:e,topParentIDValue:N,onBeforeAppend:5(){},onAppend:5(){},Vi:5(){},Co:f,GF:"CO",SV:o,N3:e,Nm:f};Q.2.8.Ku=5(P,A){Q.2.8.Ku.CW.Cw.BD(b,P,A)};Q.2.8.Ku.DA(Q.2.Cm.Dh,{Ei:5(){Q.2.8.Ku.CW.Ei.BD(b);V P=b,A=b.1;R(A.N2)A.N1=o},DG:5(){V P=b,A=b.1;P.BZ(A,f);P.k=Q(P.Bi);P.k.6("M-k");P.G3=["K2","PN","RU","B7"];P.D2=Q("<W p=\'M-k-D2\'></W>");P.k.F5(P.D2);P.n=[];P.M1=O;P.Cx=N;P.R6();P.UR();P.BZ(A,o)},_setTreeLine:5(Q){R(Q)b.k.$("M-k-UE");c b.k.6("M-k-UE")},JQ:5(Q){R(Q)b.HJ(e,Q)},S9:5(Q){R(Q)b.BH(e,Q)},Jt:5(Q){b.BZ("n",Q)},KH:5(){s b.n},LN:5(Q){R(b.1.Jy)s b.1.Jy(Q);s Q.CD?f:o},KN:5(A,D){V P=b;A=P.Gi(A);V B=P.NS(A,D);R(!B)s e;V C=Q(B).j("Cx");s P.Eu(C)},NS:5(A,B){V P=b;A=P.Gi(A);V C=Q(A);R(C.0().BF("M-k"))s e;R(B==CG){R(C.0().0("S").v==N)s e;s C.0().0("S")[N]}V D=7(C.j("Mj")),E=C;a(V F=D-O;F>=B;F--)E=E.0().0("S");s E[N]},OG:5(){V P=b,B=b.1;R(!b.1.9)s e;V A=[];Q(".M-9-Bp",P.k).0().0("S").BE(5(){V B=7(Q(b).j("Cx"));A.d({y:b,n:P.Eu(P.n,B)})});s A},M5:5(){V P=b,C=b.1,B={};B.y=Q(".M-BC",P.k).0("S")[N];R(B.y){V A=7(Q(B.y).j("Cx"));B.n=P.Eu(P.n,A);s B}s e},Kk:5(A){V P=b,B=b.1;Q(".M-Db",A).BE(5(){Q(b).$("M-Db").6("M-Du-CP")});Q(".M-Db-CR",A).BE(5(){Q(b).$("M-Db-CR").6("M-Du-CP")});Q("."+P.K7(),A).BE(5(){Q(b).$(P.K7()).6(P.GG(f))})},RP:5(B){V P=b,C=b.1;R(!B&&B[N].Dk.DB()!="S")s;V A=Q(B).BF("M-CR");Q(".M-Du-CP",B).BE(5(){Q(b).$("M-Du-CP").6(A?"M-Db-CR":"M-Db")});Q(".M-Du-BM",B).BE(5(){Q(b).$("M-Du-BM").6(A?"M-Db-CR":"M-Db")});Q("."+P.GG(f),B).BE(5(){Q(b).$(P.GG(f)).6(P.K7())})},collapseAll:5(){V P=b,A=b.1;Q(".M-Du-CP",P.k).BX()},expandAll:5(){V P=b,A=b.1;Q(".M-Du-BM",P.k).BX()},HJ:5(B,E,C){V P=b,D=b.1;P.D2.BT();V A=C?"Ps":"Dd";C=C||[];Q.Nt({l:A,CU:E,n:C,GQ:"OI",FU:5(Q){R(!Q)s;P.D2.BK();P.BH(B,Q);P.3("FU",[Q])},Eb:5(C,Q,B){VB{P.D2.BK();P.3("Eb",[C,Q,B])}VP(A){}}})},F9:5(){V P=b,A=b.1;Q("> S",P.k).BE(5(){P.Bm(b)})},Gi:5(B){V P=b,A=b.1;R(B==e)s B;R(BO(B)=="CJ"||BO(B)=="EC")s Q("S[Cx="+B+"]",P.k).Dd(N);c R(BO(B)=="Dv"&&"Cx"Bf B)s P.Gi(B["Cx"]);s B},Bm:5(C){V P=b,D=b.1;C=P.Gi(C);V A=7(Q(C).j("Cx")),E=P.Eu(P.n,A);R(E)P.MC([E],"Cy");V B=P.NS(C);R(D.9)P.Mz(Q(C));Q(C).Bm();P.L_(B?Q("Bs:r",B):P.k)},L_:5(A){V P=b,B=b.1,D=Q(" > S",A),C=D.v;R(!C)s;D.BE(5(B,A){R(B==N&&!Q(b).BF("M-r"))Q(b).6("M-r");R(B==C-O&&!Q(b).BF("M-CR"))Q(b).6("M-CR");R(B==N&&B==C-O)Q(b).6("M-Ut");Q("> W .M-Db,> W .M-Db-CR",b).$("M-Db M-Db-CR").6(B==C-O?"M-Db-CR":"M-Db");P.Nh(b,{KF:B==C-O})})},JL:5(E,C){V P=b,B=b.1;E=P.Gi(E);V A=7(Q(E).j("Cx"));VF=P.Eu(P.n,A);a(V D Bf C){VF[D]=C[D];R(D==B.LQ)Q("> .M-m > BG",E).i(C[D])}},BH:5(J,B,F,H){V C=b,K=b.1;J=C.Gi(J);R(C.3("beforeAppend",[J,B])==o)s o;R(!B||!B.v)s o;R(K.Ji&&K.N5)B=C.TP(B,K.Ji,K.N5);C.PY(B);C.MC(B,"Cn");R(F!=e)F=C.Gi(F);C.3("BH",[J,B]);C.LK(J,B);R(J==e){V L=C.Lq(B,O,[],f);L[L.v-O]=L[N]="";R(F!=e){Q(F)[H?"F5":"IY"](L.DC(""));C.L_(J?Q("Bs:r",J):C.k)}c{R(Q("> S:CR",C.k).v>N)C.Nh(Q("> S:CR",C.k)[N],{KF:o});C.k.BH(L.DC(""))}Q(".M-m",C.k).B2(5(){Q(b).6("M-BB")},5(){Q(b).$("M-BB")});C.MJ();C.3("RD",[J,B]);s}V I=Q(J),E=7(I.j("Mj")),D=Q("> Bs",I).v>N;R(!D){I.BH("<Bs p=\'M-CD\'></Bs>");C.Kk(J)}V P=[];a(V G=O;G<=E-O;G++){V A=Q(C.NS(J,G));P.d(A.BF("M-CR"))}P.d(I.BF("M-CR"));L=C.Lq(B,E+O,P,f);L[L.v-O]=L[N]="";R(F!=e){Q(F)[H?"F5":"IY"](L.DC(""));C.L_(J?Q("Bs:r",J):C.k)}c{R(Q("> .M-CD > S:CR",I).v>N)C.Nh(Q("> .M-CD > S:CR",I)[N],{KF:o});Q(">.M-CD",J).BH(L.DC(""))}C.MJ();Q(">.M-CD .M-m",J).B2(5(){Q(b).6("M-BB")},5(){Q(b).$("M-BB")});C.3("RD",[J,B])},MZ:5(E){V P=b,D=b.1,F=P.Gi(E),C=Q(F),B=7(C.j("Cx")),G=P.Eu(P.n,B),A=Q(">W:r",C);R(D.9)Q(".M-9",A).$("M-9-Bp").6("M-9-EI");c A.$("M-BC");P.3("MZ",[{n:G,y:C[N]}])},Qb:5(F){V P=b,D=b.1,G=e;R(BO(F)=="5")G=F;c R(BO(F)=="Dv"){V C=Q(F),B=7(C.j("Cx")),E=P.Eu(P.n,B),A=Q(">W:r",C);R(D.9)Q(".M-9",A).$("M-9-EI").6("M-9-Bp");c A.6("M-BC");P.3("By",[{n:E,y:C[N]}]);s}c G=5(Q){R(!Q[D.Ji])s o;s Q[D.Ji].Ej()==F.Ej()};Q("S",P.k).BE(5(){V B=Q(b),A=7(B.j("Cx")),C=P.Eu(P.n,A);R(G(C,A))P.Qb(b);c P.MZ(b)})},S8:5(Q){V P=b,A=b.1,B=P.Vj(Q);R(!B)s e;s B[A.LQ]},Vj:5(P){V A=b,B=b.1,C=e;Q("S",A.k).BE(5(){R(C)s;V E=Q(b),D=7(E.j("Cx")),F=A.Eu(A.n,D);R(F[B.Ji].Ej()==P.Ej())C=F});s C},TP:5(B,Q,D){R(!B||!B.v)s[];V A=[],G={},F=B.v;a(V H=N;H<F;H++){V C=B[H];G[C[Q]]=C}a(H=N;H<F;H++){V P=B[H],E=G[P[D]];R(!E){A.d(P);EP}E.CD=E.CD||[];E.CD.d(P)}s A},Eu:5(C,P){V Q=b,B=b.1;a(V D=N;D<C.v;D++){R(C[D].Cx==P)s C[D];R(C[D].CD){V A=Q.Eu(C[D].CD,P);R(A)s A}}s e},MC:5(C,A){V P=b,B=b.1;Q(C).BE(5(){b[B.EE]=A;R(b.CD)P.MC(b.CD,A)})},PY:5(B){V P=b,A=b.1;Q(B).BE(5(){R(b.Cx!=CG)s;b.Cx=P.Cx++;R(b.CD)P.PY(b.CD)})},Pb:5(B){V P=b,A=b.1;P.Jh=P.Jh||[];R(Q.DI(B,P.Jh)==-O)P.Jh.d(B);R(B.CD)Q(B.CD).BE(5(A,Q){P.Pb(Q)})},LK:5(B,D){V P=b,C=b.1,A=7(Q(B).j("Cx")),E=P.Eu(P.n,A);R(P.Cx==CG)P.Cx=N;R(E&&E.CD==CG)E.CD=[];Q(D).BE(5(A,Q){R(E)E.CD[E.CD.v]=Q;c P.n[P.n.v]=Q;P.Pb(Q)})},Nh:5(C,E){V P=b,D=b.1;R(!E)s;C=P.Gi(C);V A=Q(C),B=7(A.j("Mj"));R(E.KF!=CG)R(E.KF==f){A.$("M-CR").6("M-CR");Q("> W .M-Db",A).$("M-Db").6("M-Db-CR");Q(".M-CD S",A).B8(".M-BQ:HK("+(B-O)+")").$("M-Gz")}c R(E.KF==o){A.$("M-CR");Q("> W .M-Db-CR",A).$("M-Db-CR").6("M-Db");Q(".M-CD S",A).B8(".M-BQ:HK("+(B-O)+")").$("M-Gz").6("M-Gz")}},MJ:5(){V Q=b,A=b.1,P=Q.M1*K4;R(A.9)P+=K4;R(A.Ld||A.Na)P+=K4;P+=A.RF;Q.k.q(P)},K7:5(){V Q=b,P=b.1;s"M-k-CO-"+P.Na},GG:5(B){V Q=b,P=b.1,A="M-k-CO-"+P.Ld;R(B)A+="-CP";s A},Lq:5(C,B,P,K){V A=b,CL=b.1;R(A.M1<B)A.M1=B;P=P||[];B=B||O;V L=[];R(!K)L.d("<Bs p=\\"M-CD\\" B7=\\"CY:DN\\">");c L.d("<Bs p=\'M-CD\'>");a(V I=N;I<C.v;I++){V E=I==N,H=I==C.v-O,J=f,D=C[I];R(D.K2==o||D.K2=="o")J=o;L.d("<S ");R(D.Cx!=CG)L.d("Cx=\\""+D.Cx+"\\" ");R(J)L.d("K2="+D.K2+" ");L.d("Mj="+B+" ");a(V F=N;F<A.G3.v;F++)R(Q(b).j(A.G3[F]))C[dataindex][A.G3[F]]=Q(b).j(A.G3[F]);a(F=N;F<CL.G1.v;F++)R(D[CL.G1[F]])L.d(CL.G1[F]+"=\\""+D[CL.G1[F]]+"\\" ");L.d("p=\\"");E&&L.d("M-r ");H&&L.d("M-CR ");E&&H&&L.d("M-Ut ");L.d("\\"");L.d(">");L.d("<W p=\\"M-m\\">");a(V G=N;G<=B-Bl;G++)R(P[G])L.d("<W p=\\"M-BQ\\"></W>");c L.d("<W p=\\"M-BQ M-Gz\\"></W>");R(A.LN(D)){R(J)L.d("<W p=\\"M-BQ M-Du-CP\\"></W>");c L.d("<W p=\\"M-BQ M-Du-BM\\"></W>");R(CL.9)R(D.PN)L.d("<W p=\\"M-BQ M-9 M-9-Bp\\"></W>");c L.d("<W p=\\"M-BQ M-9 M-9-EI\\"></W>");R(CL.Ld){L.d("<W p=\\"M-BQ M-k-CO ");L.d(A.GG(CL.Ld?f:o)+" ");R(CL.GF&&D[CL.GF])L.d("M-k-CO-DN");L.d("\\">");R(CL.GF&&D[CL.GF])L.d("<H$ E6=\\""+D[CL.GF]+"\\" />");L.d("</W>")}}c{R(H)L.d("<W p=\\"M-BQ M-Db-CR\\"></W>");c L.d("<W p=\\"M-BQ M-Db\\"></W>");R(CL.9)R(D.PN)L.d("<W p=\\"M-BQ M-9 M-9-Bp\\"></W>");c L.d("<W p=\\"M-BQ M-9 M-9-EI\\"></W>");R(CL.Na){L.d("<W p=\\"M-BQ M-k-CO ");L.d(A.K7()+" ");R(CL.GF&&D[CL.GF])L.d("M-k-CO-DN");L.d("\\">");R(CL.GF&&D[CL.GF])L.d("<H$ E6=\\""+D[CL.GF]+"\\" />");L.d("</W>")}}L.d("<BG>"+D[CL.LQ]+"</BG></W>");R(A.LN(D)){V B1=[];a(G=N;G<P.v;G++)B1.d(P[G]);B1.d(H);L.d(A.Lq(D.CD,B+O,B1,J).DC(""))}L.d("</S>")}L.d("</Bs>");s L},Oi:5(A){V P=b,B=b.1,C=[];Q("> S",A).BE(5(F,A){V D=C.v;C[D]={Cx:P.Cx++};C[D][B.LQ]=Q("> BG,> DS",b).BN();a(V E=N;E<P.G3.v;E++)R(Q(b).j(P.G3[E]))C[D][P.G3[E]]=Q(b).j(P.G3[E]);a(E=N;E<B.G1.v;E++)R(Q(b).j(B.G1[E]))C[D][B.G1[E]]=Q(b).j(B.G1[E]);R(Q("> Bs",b).v>N)C[D].CD=P.Oi(Q("> Bs",b))});s C},R6:5(){V P=b,A=b.1;P.n=P.Oi(P.k);V B=P.Lq(P.n,O,[],f);B[B.v-O]=B[N]="";P.k.BN(B.DC(""));P.MJ();Q(".M-m",P.k).B2(5(){Q(b).6("M-BB")},5(){Q(b).$("M-BB")})},_applyTreeEven:5(A){V P=b,B=b.1;Q("> .M-m",A).B2(5(){Q(b).6("M-BB")},5(){Q(b).$("M-BB")})},FX:5(B){V P=b,F=(B.y||B.I$),E=F.Dk.DB(),D=Q(F).U8().Cn(F),G=5(P){a(V A=D.v-O;A>=N;A--)R(Q(D[A]).BF(P))s D[A];s e};R(D.DP(b.Bi)==-O)s{Il:f};V C={k:G("M-k"),L5:G("M-m"),9:G("M-9"),CO:G("M-k-CO"),i:E=="BG"};R(C.L5){V A=7(Q(C.L5).0().j("Cx"));C.n=P.Eu(P.n,A)}s C},UR:5(){V P=b,A=b.1;R(P.GD("Gy"))P.k.B3("Gy",5(B){V D=(B.y||B.I$),C=e;R(D.Dk.DB()=="DS"||D.Dk.DB()=="BG"||Q(D).BF("M-BQ"))C=Q(D).0().0();c R(Q(D).BF("M-m"))C=Q(D).0();c R(D.Dk.DB()=="S")C=Q(D);R(!C)s;V A=7(C.j("Cx")),E=P.Eu(P.n,A);s P.3("Gy",[{n:E,y:C[N]},B])});P.k.BX(5(C){V H=(C.y||C.I$),D=e;R(H.Dk.DB()=="DS"||H.Dk.DB()=="BG"||Q(H).BF("M-BQ"))D=Q(H).0().0();c R(Q(H).BF("M-m"))D=Q(H).0();c D=Q(H);R(!D)s;V B=7(D.j("Cx")),I=P.Eu(P.n,B),F=Q("W.M-m:r",D).B8("W.M-Du-CP:r,W.M-Du-BM:r"),E=Q(H).BF("M-Du-CP")||Q(H).BF("M-Du-BM");R(!Q(H).BF("M-9")&&!E)R(Q(">W:r",D).BF("M-BC")){R(P.3("beforeCancelSelect",[{n:I,y:D[N]}])==o)s o;Q(">W:r",D).$("M-BC");P.3("MZ",[{n:I,y:D[N]}])}c{R(P.3("KX",[{n:I,y:D[N]}])==o)s o;Q(".M-m",P.k).$("M-BC");Q(">W:r",D).6("M-BC");P.3("By",[{n:I,y:D[N]}])}R(Q(H).BF("M-9")){R(A.N1){R(Q(H).BF("M-9-EI")){Q(H).$("M-9-EI").6("M-9-Bp");Q(".M-CD .M-9",D).$("M-9-ID M-9-EI").6("M-9-Bp");P.3("Kr",[{n:I,y:D[N]},f])}c R(Q(H).BF("M-9-Bp")){Q(H).$("M-9-Bp").6("M-9-EI");Q(".M-CD .M-9",D).$("M-9-ID M-9-Bp").6("M-9-EI");P.3("Kr",[{n:I,y:D[N]},o])}c R(Q(H).BF("M-9-ID")){Q(H).$("M-9-ID").6("M-9-Bp");Q(".M-CD .M-9",D).$("M-9-ID M-9-EI").6("M-9-Bp");P.3("Kr",[{n:I,y:D[N]},f])}P.Mz(D)}c R(Q(H).BF("M-9-EI")){Q(H).$("M-9-EI").6("M-9-Bp");R(A.N2)Q(".M-9",P.k).JX(H).$("M-9-Bp").6("M-9-EI");P.3("Kr",[{n:I,y:D[N]},f])}c R(Q(H).BF("M-9-Bp")){Q(H).$("M-9-Bp").6("M-9-EI");P.3("Kr",[{n:I,y:D[N]},o])}}c R(F.BF("M-Du-CP")&&(!A.Nm||E)){R(P.3("beforeCollapse",[{n:I,y:D[N]}])==o)s o;F.$("M-Du-CP").6("M-Du-BM");R(A.Co)Q("> .M-CD",D).Dy("D3");c Q("> .M-CD",D).BV();Q("> W ."+P.GG(f),D).$(P.GG(f)).6(P.GG());P.3("DQ",[{n:I,y:D[N]}])}c R(F.BF("M-Du-BM")&&(!A.Nm||E)){R(P.3("beforeExpand",[{n:I,y:D[N]}])==o)s o;F.$("M-Du-BM").6("M-Du-CP");V G=5(){P.3("VM",[{n:I,y:D[N]}])};R(A.Co)Q("> .M-CD",D).Dy("D3",G);c{Q("> .M-CD",D).BV();G()}Q("> W ."+P.GG(),D).$(P.GG()).6(P.GG(f))}P.3("BX",[{n:I,y:D[N]}])});R(Q.Br.EV&&A.SV){P.I5=Q("<W p=\'M-DE-nodedroptip\' B7=\'CY:DN\'></W>").Ch("m");P.k.EV({Hb:f,CT:o,HS:FL,HR:FL,B4:5(H,D){V G=P.FX(D);R(G.L5){V B="Gk";R(A.N3)B=A.N3(H.GH,H,P);c{B="";V E=o;a(V I Bf H.GH){V C=H.GH[I];R(E)B+=",";B+=C.i;E=f}}V F=Q("<W p=\'M-DE-B4\' B7=\'CY:DN\'><W p=\'M-Bq-CO M-Bq-Df\'></W>"+B+"</W>").Ch("m");s F}},Mk:5(){s o},MS:5(){b.BZ("CN","Ez");P.CD[b.U]=b},JB:5(B,Q){R(Q.Cb==Bl)s o;b.BZ("CN","Ez");V C=P.FX(Q);R(C.9)s o;R(A.9){V D=P.OG();b.GH=[];a(V E Bf D)b.GH.d(D[E].n);R(!b.GH||!b.GH.v)s o}c b.GH=[C.n];b.Vd=C.n;b.BZ("CN","Fn");P.US=f;b.JR={X:P.k.Bw().X,Bv:P.k.Bw().X+P.k.t(),h:P.k.Bw().h,BJ:P.k.Bw().h+P.k.q()}},Kc:5(C4,C){V I=b.Vd;R(!I)s o;V CL=b.GH?b.GH:[I];R(P.FM==e)P.FM=-O;V G=C.EU,J=C.FA,E=o,A=b.JR;R(G<A.h||G>A.BJ||J>A.Bv||J<A.X){P.FM=-O;P.I5.BK();b.B4.B8(".M-Bq-CO:r").$("M-Bq-D7 M-Bq-Cn").6("M-Bq-Df");s}a(V K=N,F=P.Jh.v;K<F;K++){V DR=P.Jh[K],B=DR["Cx"];R(I["Cx"]==B)E=f;R(Q.DI(DR,CL)!=-O)EP;V B1=E?f:o;R(P.FM!=-O&&P.FM!=B)EP;V L=Q("S[Cx="+B+"] W:r",P.k),Dg=L.Bw(),D={X:Dg.X,Bv:Dg.X+L.t(),h:P.k.Bw().h,BJ:P.k.Bw().h+P.k.q()};R(G>D.h&&G<D.BJ&&J>D.X&&J<D.Bv){V H=Dg.X;R(B1)H+=L.t();P.I5.Y({h:D.h,X:H,q:D.BJ-D.h}).BT();P.FM=B;P.T_=B1?"Bv":"X";R(J>D.X+Nn&&J<D.Bv-Nn){b.B4.B8(".M-Bq-CO:r").$("M-Bq-Df M-Bq-D7").6("M-Bq-Cn");P.I5.BK();P.Mp=f}c{b.B4.B8(".M-Bq-CO:r").$("M-Bq-Df M-Bq-Cn").6("M-Bq-D7");P.I5.BT();P.Mp=o}Dl}c R(P.FM!=-O){P.FM=-O;P.Mp=o;P.I5.BK();b.B4.B8(".M-Bq-CO:r").$("M-Bq-D7  M-Bq-Cn").6("M-Bq-Df")}}},I4:5(D,B){V C=b.GH;P.US=o;R(P.FM!=-O){a(V F=N;F<C.v;F++){V E=C[F].CD;R(E)C=Q.Qn(C,5(P,B){V A=Q.DI(P,E)==-O;s A})}a(F Bf C){V A=C[F];R(P.Mp){P.Bm(A);P.BH(P.FM,[A])}c{P.Bm(A);P.BH(P.KN(P.FM),[A],P.FM,P.T_=="Bv")}}P.FM=-O}P.I5.BK();b.BZ("CN","Ez")}})}},Mz:5(B){V P=b,C=b.1,A=Q(".M-9-EI",B.0()).v==N,D=Q(".M-9-Bp",B.0()).v==N;R(A)B.0().FI().B8(".M-9").$("M-9-EI M-9-ID").6("M-9-Bp");c R(D)B.0().FI().B8("> .M-9").$("M-9-Bp M-9-ID").6("M-9-EI");c B.0().FI().B8("> .M-9").$("M-9-EI M-9-Bp").6("M-9-ID");R(B.0().0("S").v>N)P.Mz(B.0().0("S"))}})})(DM);(5(Q){V P=Q.2;P.SK=N;Q.MN=5(Q){s P.CH.BD(e,"MN",B6,{Id:f})};Q.MN.BT=5(P){s Q.MN(P)};Q.BR.HW={LP:f,IX:f,IN:f,Jp:f,CK:"w",EX:o,Pf:e,Jq:o};Q.CM.HW={};P.8.HW=5(Q){P.8.HW.CW.Cw.BD(b,e,Q)};P.8.HW.DA(P.Cm.IV,{Ci:5(){s"HW"},DH:5(){s"HW"},Dr:5(){s Q.CM.HW},DG:5(){V B=b,D=b.1;B.w=Q("<W p=\\"M-w\\"><W p=\\"M-w-x\\"><W p=\\"M-w-x-CC\\"><W p=\\"M-w-BV\\"></W><W p=\\"M-w-Ew\\"></W><W p=\\"M-w-BM\\"></W><W p=\\"M-F9\\"></W></W><W p=\\"M-w-x-B$\\"></W></W><W p=\\"M-w-4\\"></W></W>");B.Bi=B.w[N];B.w.4=Q(".M-w-4",B.w);B.w.x=Q(".M-w-x",B.w);B.w.CC=Q(".M-w-x-CC:r",B.w);R(D.CU){R(D.EX){B.w.4.EX(D.CU,5(){B.3("JT")});B.w.4.6("M-w-4-Kb")}c{V C=Q("<EZ NA=\'N\' E6=\'"+D.CU+"\'></EZ>"),F="ligeruiwindow"+P.SK++;R(D.Bt)F=D.Bt;C.j("Bt",F).j("U",F);D.N_=F;C.Ch(B.w.4);B.EZ=C}}c R(D.4){V A=Q("<W>"+D.4+"</W>");A.Ch(B.w.4)}c R(D.y){B.w.4.BH(D.y);D.y.BT()}b.Fy();B.Gr();Q("m").BH(B.w);B.BZ({q:D.q,t:D.t});V E=N,G=N;R(D.h!=e)E=D.h;c D.h=E=N.Dx*(Q(w).q()-B.w.q());R(D.X!=e)G=D.X;c D.X=G=N.Dx*(Q(w).t()-B.w.t())+Q(w).F8()-Cs;R(E<N)D.h=E=N;R(G<N)D.X=G=N;B.BZ(D);D.N_&&Q(">EZ",B.w.4).j("Bt",D.N_);R(!D.IN)Q(".M-w-BV",B.w).Bm();R(!D.IX)Q(".M-w-Ew",B.w).Bm();R(!D.LP)Q(".M-w-BM",B.w).Bm();B.HG();R(Q.Br.EV)B.Fb=B.w.DE=B.w.EV({En:".M-w-x-B$",JB:5(){B.Gr()},I4:5(){B.HG()},CT:o});R(Q.Br.Gm){B.resizeable=B.w.Ds=B.w.Gm({Ke:5(){B.Gr();Q(".M-w-Ew",B.w).$("M-w-KW")},Mi:5(P,Q){V C=N,A=N;R(!Fk(7(B.w.Y("X"))))C=7(B.w.Y("X"));R(!Fk(7(B.w.Y("h"))))A=7(B.w.Y("h"));R(P.K9)B.w.Y({X:C+P.K9});R(P.Kl)B.w.Y({h:A+P.Kl});R(P.JJ)B.w.q(P.JJ);R(P.LJ)B.w.4.t(P.LJ-K5);B.HG();s o}});B.w.BH("<W p=\'M-CA-I_-Bq\'></W>")}Q(".M-w-BV",B.w).BX(5(){R(Q(b).BF("M-w-BV-BM")){B.U3=o;Q(b).$("M-w-BV-BM")}c{B.U3=f;Q(b).6("M-w-BV-BM")}B.w.4.Dy()}).B2(5(){R(B.w.DE)B.w.DE.BZ("_",f)},5(){R(B.w.DE)B.w.DE.BZ("_",o)});Q(".M-w-BM",B.w).BX(5(){R(B.3("BM")==o)s o;B.w.BK();P.Cd.MG(B)}).B2(5(){R(B.w.DE)B.w.DE.BZ("_",f)},5(){R(B.w.DE)B.w.DE.BZ("_",o)});Q(".M-w-Ew",B.w).BX(5(){R(Q(b).BF("M-w-KW")){R(B.3("KW")==o)s o;B.w.q(B.Dn).Y({h:B.Ia,X:B.IZ});B.w.4.t(B.H2-K5);Q(b).$("M-w-KW")}c{R(B.3("Ew")==o)s o;B.w.q(Q(w).q()-Bl).Y({h:N,X:N});B.w.4.t(Q(w).t()-K5).BT();Q(b).6("M-w-KW")}})},HG:5(){V Q=b;Q.Dn=Q.w.q();Q.H2=Q.w.t();V A=N,P=N;R(!Fk(7(Q.w.Y("X"))))A=7(Q.w.Y("X"));R(!Fk(7(Q.w.Y("h"))))P=7(Q.w.Y("h"));Q.IZ=A;Q.Ia=P},FW:5(){b.w.BK();b.JN=f;b.Lf=o},RA:5(C){V A=b,B=b.1;R(C){R(!A.GM){A.GM=Q("<W p=\\"M-w-FW\\"></W>").QU(A.w.CC).BX(5(){A.FW()});P.Cd.Pz(A)}}c R(A.GM){A.GM.Bm();A.GM=e}},Sw:5(Q){R(Q!=e)b.w.Y({h:Q})},Uq:5(Q){R(Q!=e)b.w.Y({X:Q})},G0:5(Q){R(Q>N)b.w.q(Q)},Gt:5(Q){R(Q>K5)b.w.4.t(Q-K5)},T4:5(P){R(P)Q(".M-w-x-B$",b.w.x).BN(P)},JQ:5(A){V Q=b,P=b.1;P.CU=A;R(P.EX)Q.w.4.BN("").EX(P.CU,5(){R(Q.3("JT")==o)s o});c R(Q.GZ)Q.GZ.j("E6",P.CU)},BK:5(){V Q=b,P=b.1;b.GS();b.w.BK()},BT:5(){V Q=b,P=b.1;b.Fy();b.w.BT()},Bm:5(){V Q=b,P=b.1;b.GS();b.w.Bm()},Gr:5(){V A=b,D=b.1;R(A.JN){V C=A.Dn,B=A.H2,E=A.Ia,F=A.IZ;R(A.NI){C=Q(w).q();B=Q(w).t();E=F=N;R(P.Cd.Ca){B-=P.Cd.Ca.E4();R(P.Cd.X)F+=P.Cd.Ca.E4()}}A.BZ({q:C,t:B,h:E,X:F})}A.Lf=f;A.JN=o;P.Cd.Io(A);A.BT();P.Cd.Io(b)},VG:5(Q){s JQ(Q)}})})(DM)','l|0|1|_|$|if|li|td|id|var|div|top|css|tab|for|this|else|push|null|true|grid|left|text|attr|tree|type|body|data|false|class|width|first|return|height|dialog|length|window|header|target|layout|parent|options|ligerui|trigger|content|function|addClass|parseInt|controls|checkbox|disabled|removeClass|cell|over|selected|call|each|hasClass|span|append|center|right|hide|inputText|close|html|typeof|value|box|ligerDefaults|input|show|dateeditor|toggle|selectBox|click|editor|set|__id|toolbar|links|tr|columns|in|bar|wrapper|element|val|accordion|2|remove|align|row|checked|drop|fn|ul|name|current|bottom|offset|link|select|table|item|M|hover|bind|proxy|menu|arguments|style|find|editors|currentDate|inner|btn|Grid|buttons|children|document|hd|undefined|run|messagebox|string|title|N|ligerMethos|cursor|icon|open|prototype|last|panel|animate|url|extend|base|getRow|display|liger|taskbar|button|root|win|d|column|tbody|appendTo|__getType|valueField|tabid|middleHeight|core|add|slide|f|records|getRowObj|10|month|U|year|constructor|treedataindex|delete|option|destroy|frozen|labelwrapper|4|P|gridbody|group|split|resize|messageBox|ligerDialog|total|ligerExtend|toLowerCase|join|currentData|drag|time|_render|__idPrev|inArray|unbind|centerWidth|diff|jQuery|none|leftCollapse|index|collapse|O|a|new|p|space|gridtablewidth|gridheader|popup|record|label|note|rows|get|_columns|no|Q|UIComponent|usedDate|parseFloat|tagName|break|reRender|_width|date|change|filteredData|_extendMethods|resizable|detail|expandable|object|3|5|slideToggle|__index|middleTop|float|loading|fast|xresize|pageCount|image|yes|__pid|spinner|page|newPage|childrenName|tasks|number|wintoggle|statusName|rightCollapse|indexOf|replace|unchecked|case|Filter|setValue|Date|position|minute|continue|hour|getValue|textwrapper|focus|pageX|ligerDrag|labelWidth|load|enabledFrozen|iframe|_changeValue|error|wrap|ligerMessageBox|totalsummary|editing|detailpanel|Dialog|_init|toString|items|is|px|handler|tip|filter|R|i|onclick|__level|_getDataNodeByTreeDataIndex|next|max|nbsp|getElementById|default|dir|rightLeft|T|apply|outerHeight|yresize|src|bulidContent|grouprow|visible|prepend|auto|pageY|ComboBox|int|rowDropIn|field|tabs|rightDropHandle|SysGridHeightChanged|prev|sort|editParm|20|nodeDropIn|substr|selectedDate|selectstart|render|leftDropHandle|disable|interval|success|idAttrName|min|_getSrcElementByEvent|r|splice|heightDiff|draggable|question|now|getCellObj|u6708|getMonth|paddingBottom|_onResize|minValue|isNaN|Menu|textField|move|menubar|textFieldID|getDate|maxValue|hcell|centerLeft|__domid|mousedown|columnindex|colDropIn|mask|readonly|mouseup|_applyDrag|detailbtn|rowindex|Input|after|create|dataAction|scrollTop|clear|gridManager|down|_hide|radio|managers|hasBind|pageSize|iconFieldName|_getParentNodeClassName|draggingNodes|test|isShowCheckBox|y|absolute|winmin|getFullYear|collapsedRows|monthselector|dataType|menus|unmask|_columnMaxLevel|draggingRows|className|toJSON|server|100|jiframe|fields|minuteselector|hourselector|siblings|shadow|ligerDefer|RegExp|ligerCheckBox|getNodeDom|isDataChanged|dragging|alert|ligerResizable|asc|borderLeftWidth|Spinner|gridview|active|DateEditor|_setHeight|rowdata|initValue|columnname|winmax|contextmenu|line|_setWidth|attribute|leftWidth|sysAttribute|hidden|01|Button|_start|groups|DialogString|warn|textarea|labelAlign|day|dropIn|diffX|isLeftCollapse|borderRightWidth|_saveStatus|yearselector|enabledCheckbox|loadData|eq|rightWidth|local|events|up|S|x|proxyY|proxyX|getMinutes|getFormatDate|Tab|Window|mousemove|rownumbers|cellspacing|__leaf|revert|winbtns|EasyTab|easytab|$1|recover|Array|_showData|30|MessageBox|actionTabid|64|boxToggling|instanceof|MenuBar|addItem|issystem|ligerComboBox|getHours|paddingLeft|diffY|Form|attroptions|step|Layout|gridview2|gridview1|_height|format|CheckBox|onResize|startX|startY|dragtype|Accordion|Radio|img|cellpadding|live|Tip|incomplete|sorters|ToolBar|operators|usePager|6|e|removeTabItem|w|s|showToggle|updateStyle|setDisabled|_borderX|_onReisze|setEnabled|isRightCollapse|outerWidth|Win|__rowSpan|showMax|before|_top|_left|_setValue|isdetail|isStatic|propertyToElemnt|receive|Math|btnfirst|40|windowMask|selectedIndex|out|pcontrol|rowDroptip|setFront|_removeProxy|headerRowHeight|TextBox|btnnext|endEdit|_drag|parms|ligeruimenutemid|verify|__previd|detailrows|btnlast|setHeight|task|changePage|onStopDrag|nodeDroptip|rowHeight|removeAttr|drags|btnprev|nw|srcElement|InWindow|onStartDrag|desc|confirm|strings|getChildren|lock|_stop|allowHideColumn|newWidth|updateSelectBoxPosition|update|u4e8e|minimize|browser|minWidth|_setUrl|validRange|totalNumber|loaded|_getParentChildren|_borderY|colSpan|not|bottomDropHandle|enabledEdit|panelbox|initText|separator|topDropHandle|editorToggling|hasElement|isContinueByDataChanged|nodes|idFieldName|__hasChildren|appendIdTo|ligeruitipid|selectTabItem|50|getDay|showMin|modal|droptip|ligerTextBox|setData|sortedData|_updateFrozenWidth|Drag|lselected|isLeaf|_applyResize|showTime|enabledGroup|Resizable|nullText|clearContent|colresizing|fieldsel|receiveEntered|layoutHeight|match|screenX|_getCurrentPageData|__nextid|colResizable|dragproxy|totalSummary|ok|isLast|paddingTop|getData|blur|topbar|isrownumber|fixedType|handles|getParent|hcelltext|fieldtype|X|n|dblclick|ligerTip|attributes|border|regain|beforeSelect|enabledDetail|where|NaN|scroll|onDrag|changeBy|onStartResize|draggingxline|rowDropDir|isMultiSelect|scrollLeft|isDrag|upgrade|diffLeft|submitEdit|again|mouseout|mouseover|reverting|check|ischeckbox|colDroptip|Tree|bottomHeight|today|reload|callback|editorid|selectValueByTree|nocheckbox|isexpand|selectedTabId|22|28|fixedCellHeight|_getChildNodeClassName|_setColumnVisible|diffTop|plugins|columnWidth|rules|topHeight|clickToEdit|ligerDateEditor|ligeruidragid|groupbtn|treeManager|selectBoxHeight|__leafindex|newHeight|_appendData|_getValue|valueFieldID|hasChildren|draggingyline|showClose|textFieldName|frozenRownumbers|thead|inputWidth|togglebtn|newminute|ligerSpinner|editortype|_menuItemClick|ligerMenu|formatters|op|btnload|parentIcon|_isColumnId|actived|updateShadow|menuitemid|cancel|tc|showType|se|defaultsNamespace|u7b49|_setDisabled|Component|_getTreeHTMLByData|setContentHeight|getColumn|9|8|cancelEdit|recordNumber|inline|g|h|deletedRows|maxWidth|getField|selectpagesize|u5173|node|ligeruiid|__colSpan|unselect|mouseoverRowCssClass|_updateStyle|existRecord|clearInterval|boolean|_setTreeDataStatus|_rendered|comboboxName|activeTask|removeTask|frozenCheckbox|toggleLoading|_upadteTreeWidth|toolBar|getId|drophandle|ligerWindow|_editing|slideUp|sortOrder|u95ed|onRendered|_bulid|count|onEndResize|_searchData|ctrlKey|13|cancelSelect|frozenDetail|00|closeMessage|resizing|headrow|container|sortName|checkValue|onStopResize|outlinelevel|onRevert|changeHeightOnResize|removeEditor|opener|ligerTipId|nodeDropInParent|u793a|onTextChange|bottomTop|winbtn|addRow|cls|controlNamespace|showedSubMenu|textHeight|_setParentCheckboxStatus|beginEdit|maxOutlineLevel|isTotalSummary|_setImage|addgroup|getSelected|findTextByValue|block|addrule|_deleteData|_createProxy|deletegroup|frameborder|digits|changeSort|screenY|toggleDateEditor|rowDropInParent|_toggleSelectBox|br|maximum|getNewTabid|speed|u5728|combobox|ne|contentType|endResize|_removeSelected|_updateBtnsWidth|getParentTreeItem|hasicon|onShowDetail|setCellEditing|donne|toFixed|sw|draggingline|childIcon|ligerToolBar|form|totalRender|_removeData|_buildPager|detailColWidth|_setTreeItem|headerHoldHeight|_setEvent|appendEditor|_addTime|btnClickToToggleOnly|7|u662f|hideAllSubMenu|V|detailToEdit|ligerGrid|ajax|onError|u4e8c|_getTotalSummaryHtml|equal|headerImg|_uping|u4e00|autoCheckboxEven|single|nodeDraggingRender|btnClose|parentIDFieldName|u6216|_getRowByDomId|formatRecord|editorCounter|framename|labeltext|addRule|Function|btnYear|isSort|_setDropHandlePosition|_bulidOpSelectOptionsHtml|getChecked|updateCell|json|_getTotalCellContent|_addValue|u5b58|ligerRadio|appendID|managerCount|removeTitle|notequal|_isVerify|prefixID|checkNotNull|updateRow|u5206|cssClass|_removeWindowMask|selectBoxWidth|u6761|onSuccess|_doclick|120|draggingColumn|onBeforeSelect|setColumnWidth|isChecked|_isOverValue|_getDataByTreeHTML|minRightWidth|isResize|greaterorequal|_fillGridBody|async|_columnCount|_applyEditor|getColumns|_bulidGroupTableHtml|24|32|12|setRightCollapse|setTimeout|both|treeLeafOnly|80|_isRowId|changedCells|isTabItemExist|masking|ligerGetCheckBoxManager|complete|rowDraggingRender|pagesize|u76f8|showDate|_setColumns|bottomresize|rightresize|isParent|msie|actionMenu|keydown|allowClose|sysEndEdit|_onRowOver|u52a0|addGroup|_getCellHtml|monthMessage|MM|ischecked|yyyy|setTabButton|onCollapse|u7ec4|opsel|borderBottomWidth|validate|appendRange|isLabel|_createEditor|_addTreeDataIndexToData|__status|doMax|_addToNodes|_clearGrid|rowAttrRender|gridloading|onLoaded|enabledEditor|minLeftWidth|setLeftCollapse|makeFullHeight|__leafcount|_dataInit|distanceX|distanceY|18px|closeWhenEnter|switch|groupColumnName|post|u5426|_getRowDomId|getSelectedTabItemID|appendRow|isNegative|leftresize|addTask|islast|timeParmName|dd|valtxt|topresize|ligeruiresizableid|groupicon|and|holiday|alt|_moveData|on|_revert|or|_getHtmlFromData|_getCellDomId|_addClickEven|createMenu|mm|lessorequal|JSON|minColToggle|notin|_addTabItemEvent|hh|getTabidList|less|borderTopWidth|hideOnLoseFocus|groupColumnDisplay|greater|getnewidcount|prependTo|ligerTree|getSelectedRows|ligerGetTreeManager|_addData|groupRender|btnToday|selectNode|toggleCol|btnMonth|password|0px|u5341|ligerGetComboBoxManager|moveRange|ligerGetLayoutManager|getCheckedRows|u663e|alternatingRow|grep|_initFootbar|m|isHidden|dayMessage|t|q|z|gridrow|sortnameParmName|toUpperCase|String|createTaskbar|u516d|u4e94|_createColumnId|_onContextmenu|onContextmenu|isextend|moveToPrevTabItem|ligerGetEasyTabManager|moveToLastTabItem|u4e09|_getCellContent|allowBottomResize|_setShowMin|hrow|nextmonth|afterAppend|deleteRow|nodeWidth|u5c0f|ext|_getDefaultValue|groupopsel|u4e2d|_columnLeafCount|u9875|while|u4e0d|demotion|btnloading|rowdragging|rownumbersColWidth|u5b9a|href|isScroll|indetail|_getRuleValue|autoCheckChildren|closeall|managerIdPrev|startwith|_preRender|todayMessage|ligerGetToolBarManager|_isFloat|setTree|esc|dblclicking|selectValue|ligerGetMenuBarManager|changeValue|like|checkboxall|allowLeftCollapse|deleteGroup|removeAll|_buliderSpaceContainer|displayColumnName|_onClick|removeItem|editorBulider|ElementTip|prevmonth|afterEdit|_initBuildPopup|_bulidTotalSummary|clone|delayLoad|DialogImagePath|saveMessage|columnName|_applyTree|checkboxcell|_initColumns|methods|ligerAccordion|near|isSelected|middleWidth|enabledSort|waittingdialog|textAlign|dragdrop|onCheck|setSelect|rowgroup|removeOther|windowCount|newdata|_round|u6709|sortorderParmName|btnNextYear|merge|getSelecteds|ligerGetTextBoxManager|u786e|edited|nodeDraggable|treelink|scope|columnId|from|_compareData|_initBuildHeader|coldragging|setInterval|switchPageSizeApplyComboBox|btnPrevMonth|getMilliseconds|arrow|defaults|eval|u5df2|27|29|onChange|_checkEditAndUpdateCell|getSeconds|pageStatMessage|uff1a|18|rownumberscell|allowRightCollapse|u53d6|_setLeft|_buliderControl|_setFrozen|deleteRule|sum|_onMouseDown|detailcell|rightToken|isLongDateTime|pageParmName|_removeDialog|u5927|getTextByID|_setData|_setCollapse|ligerMenuBar|pressed|getSelectedRowObjs|draggingRow|90|safari|ligerTab|_getDir|applyMessage|ligerGetGridManager|onchange|ligerGetSpinnerManager|collapseDetail|prevyear|clientY|u589e|arrayToTree|colDraggable|overrideTabItem|isDateTime|getTime|checkboxColWidth|_isTime|btnPrevYear|_onDblClick|_updateGridData|hasTask|_initHeight|changeHeaderText|_addTabItemContextMenuEven|_bulidRuleRowHtml|_onMouseUp|findValueByText|enabledTotal|headerRender|_setLabelWidth|showOnTop|method|allowLeftResize|dateFormat|u7ee7|enter|startResize|u7ecf|_getTreeCellHtml|u62ec|detailHeight|_setContent|waittingMessage|menuItemCount|onChangeValue|dblClickToClose|u7eed|whenRClickToSelect|heightChanged|onSelect|col|_setTitle|removeTaskbar|marginTop|grid1|ltype|grid2|nodeDropDir|rowDragDrop|getColumnType|closeother|ligerLayout|u4ef6|noline|yline|stopResize|u4ee5|ligerGetDragManager|ligerGetFilterManager|valueColumnName|ligerGetButtonManager|loadServerData|rowlast|decimalplace|pageSizeOptions|selectRowButtonOnly|_setTreeEven|nodedragging|minColumnWidth|u636e|_addNewRecord|rowDraggable|u56db|ligerGetTabManager|deleterole|u6570|beforeSubmitEdit|onExtend|_buliderControlContainer|2000|reloadMessage|ligerEasyTab|isExtend|_getRowIdByDomId|beforeOpen|ligerGetDateEditorManager|_createRowid|getTask|_initBuildGridHeader|_getVerifyValue|endwith|_setTop|ligerForm|moveTabItem|onlychild|allowUnSelectRow|ligerGetRadioManager|closeAllMessage|nextyear|btnNextMonth|pagesizeParmName|draggingMessage|ligerFilter|allowTopResize|collapsed|dialogmax|setTabButtonEven|cancelMessage|ligerGetResizableManager|parents|textBox|managerIsExist|dragToMove|floor|try|colDropDir|ceil|getSelectedRow|nodedata|setUrl|u63d0|nodeType|changeCol|_setLabelAlign|to|expand|enabledDetailEdit|_addDropHandle|catch|heightAlign|mul|setGrid|u5305|onChanged|allowRightResize|1000|stringify|_buliderLabelContainer|_applyWindowMask|ligerButton|closeOtherMessage|_downing|draggingNode|_getColumnWidth|_createHeaderCell|avg|moveToNextTabItem|onAfterAppend|getDataByID|_isInt|insertAfter|u6d88|_checkboxUpdateValue|context|W|Z|c|u'.split('|'),1377,1388,/[\w\$]+/g,{},{},[]))
 $.ligerDefaults.Grid.formatters['date'] = function (value, column)
    {
        function getFormatDate(date, dateformat)
        {
            var g = this, p = this.options;
            if (isNaN(date)) return null;
            var format = dateformat;
            var o = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "h+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S": date.getMilliseconds()
            }
            if (/(y+)/.test(format))
            {
                format = format.replace(RegExp.$1, (date.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
            }
            for (var k in o)
            {
                if (new RegExp("(" + k + ")").test(format))
                {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        }
        if (!value) return "";
        // /Date(1328423451489)/
        if (typeof (value) == "string" && /^\/Date/.test(value))
        {
            value = value.replace(/^\//, "new ").replace(/\/$/, "");
            eval("value = " + value);
        }
        if (value instanceof Date)
        {
            var format = column.format || this.options.dateFormat || "yyyy-MM-dd";
            return getFormatDate(value, format);
        }else if(column.type=='date'){
        	if (isNaN(value)){
        		return null;
        	}
        	var format = column.format || this.options.dateFormat || "yyyy-MM-dd";
            return getFormatDate(new Date(value), format);
        }
        else
        {
            return value.toString();
        }
    }
/*! jQuery UI - v1.8.20 - 2012-04-30
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.core.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){function c(b,c){var e=b.nodeName.toLowerCase();if("area"===e){var f=b.parentNode,g=f.name,h;return!b.href||!g||f.nodeName.toLowerCase()!=="map"?!1:(h=a("img[usemap=#"+g+"]")[0],!!h&&d(h))}return(/input|select|textarea|button|object/.test(e)?!b.disabled:"a"==e?b.href||c:c)&&d(b)}function d(b){return!a(b).parents().andSelf().filter(function(){return a.curCSS(this,"visibility")==="hidden"||a.expr.filters.hidden(this)}).length}a.ui=a.ui||{};if(a.ui.version)return;a.extend(a.ui,{version:"1.8.20",keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}}),a.fn.extend({propAttr:a.fn.prop||a.fn.attr,_focus:a.fn.focus,focus:function(b,c){return typeof b=="number"?this.each(function(){var d=this;setTimeout(function(){a(d).focus(),c&&c.call(d)},b)}):this._focus.apply(this,arguments)},scrollParent:function(){var b;return a.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?b=this.parents().filter(function(){return/(relative|absolute|fixed)/.test(a.curCSS(this,"position",1))&&/(auto|scroll)/.test(a.curCSS(this,"overflow",1)+a.curCSS(this,"overflow-y",1)+a.curCSS(this,"overflow-x",1))}).eq(0):b=this.parents().filter(function(){return/(auto|scroll)/.test(a.curCSS(this,"overflow",1)+a.curCSS(this,"overflow-y",1)+a.curCSS(this,"overflow-x",1))}).eq(0),/fixed/.test(this.css("position"))||!b.length?a(document):b},zIndex:function(c){if(c!==b)return this.css("zIndex",c);if(this.length){var d=a(this[0]),e,f;while(d.length&&d[0]!==document){e=d.css("position");if(e==="absolute"||e==="relative"||e==="fixed"){f=parseInt(d.css("zIndex"),10);if(!isNaN(f)&&f!==0)return f}d=d.parent()}}return 0},disableSelection:function(){return this.bind((a.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(a){a.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),a.each(["Width","Height"],function(c,d){function h(b,c,d,f){return a.each(e,function(){c-=parseFloat(a.curCSS(b,"padding"+this,!0))||0,d&&(c-=parseFloat(a.curCSS(b,"border"+this+"Width",!0))||0),f&&(c-=parseFloat(a.curCSS(b,"margin"+this,!0))||0)}),c}var e=d==="Width"?["Left","Right"]:["Top","Bottom"],f=d.toLowerCase(),g={innerWidth:a.fn.innerWidth,innerHeight:a.fn.innerHeight,outerWidth:a.fn.outerWidth,outerHeight:a.fn.outerHeight};a.fn["inner"+d]=function(c){return c===b?g["inner"+d].call(this):this.each(function(){a(this).css(f,h(this,c)+"px")})},a.fn["outer"+d]=function(b,c){return typeof b!="number"?g["outer"+d].call(this,b):this.each(function(){a(this).css(f,h(this,b,!0,c)+"px")})}}),a.extend(a.expr[":"],{data:function(b,c,d){return!!a.data(b,d[3])},focusable:function(b){return c(b,!isNaN(a.attr(b,"tabindex")))},tabbable:function(b){var d=a.attr(b,"tabindex"),e=isNaN(d);return(e||d>=0)&&c(b,!e)}}),a(function(){var b=document.body,c=b.appendChild(c=document.createElement("div"));c.offsetHeight,a.extend(c.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0}),a.support.minHeight=c.offsetHeight===100,a.support.selectstart="onselectstart"in c,b.removeChild(c).style.display="none"}),a.extend(a.ui,{plugin:{add:function(b,c,d){var e=a.ui[b].prototype;for(var f in d)e.plugins[f]=e.plugins[f]||[],e.plugins[f].push([c,d[f]])},call:function(a,b,c){var d=a.plugins[b];if(!d||!a.element[0].parentNode)return;for(var e=0;e<d.length;e++)a.options[d[e][0]]&&d[e][1].apply(a.element,c)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(b,c){if(a(b).css("overflow")==="hidden")return!1;var d=c&&c==="left"?"scrollLeft":"scrollTop",e=!1;return b[d]>0?!0:(b[d]=1,e=b[d]>0,b[d]=0,e)},isOverAxis:function(a,b,c){return a>b&&a<b+c},isOver:function(b,c,d,e,f,g){return a.ui.isOverAxis(b,d,f)&&a.ui.isOverAxis(c,e,g)}})})(jQuery);
/*! jQuery UI - v1.8.20 - 2012-04-30
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.widget.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){if(a.cleanData){var c=a.cleanData;a.cleanData=function(b){for(var d=0,e;(e=b[d])!=null;d++)try{a(e).triggerHandler("remove")}catch(f){}c(b)}}else{var d=a.fn.remove;a.fn.remove=function(b,c){return this.each(function(){return c||(!b||a.filter(b,[this]).length)&&a("*",this).add([this]).each(function(){try{a(this).triggerHandler("remove")}catch(b){}}),d.call(a(this),b,c)})}}a.widget=function(b,c,d){var e=b.split(".")[0],f;b=b.split(".")[1],f=e+"-"+b,d||(d=c,c=a.Widget),a.expr[":"][f]=function(c){return!!a.data(c,b)},a[e]=a[e]||{},a[e][b]=function(a,b){arguments.length&&this._createWidget(a,b)};var g=new c;g.options=a.extend(!0,{},g.options),a[e][b].prototype=a.extend(!0,g,{namespace:e,widgetName:b,widgetEventPrefix:a[e][b].prototype.widgetEventPrefix||b,widgetBaseClass:f},d),a.widget.bridge(b,a[e][b])},a.widget.bridge=function(c,d){a.fn[c]=function(e){var f=typeof e=="string",g=Array.prototype.slice.call(arguments,1),h=this;return e=!f&&g.length?a.extend.apply(null,[!0,e].concat(g)):e,f&&e.charAt(0)==="_"?h:(f?this.each(function(){var d=a.data(this,c),f=d&&a.isFunction(d[e])?d[e].apply(d,g):d;if(f!==d&&f!==b)return h=f,!1}):this.each(function(){var b=a.data(this,c);b?b.option(e||{})._init():a.data(this,c,new d(e,this))}),h)}},a.Widget=function(a,b){arguments.length&&this._createWidget(a,b)},a.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:!1},_createWidget:function(b,c){a.data(c,this.widgetName,this),this.element=a(c),this.options=a.extend(!0,{},this.options,this._getCreateOptions(),b);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()}),this._create(),this._trigger("create"),this._init()},_getCreateOptions:function(){return a.metadata&&a.metadata.get(this.element[0])[this.widgetName]},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName),this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled "+"ui-state-disabled")},widget:function(){return this.element},option:function(c,d){var e=c;if(arguments.length===0)return a.extend({},this.options);if(typeof c=="string"){if(d===b)return this.options[c];e={},e[c]=d}return this._setOptions(e),this},_setOptions:function(b){var c=this;return a.each(b,function(a,b){c._setOption(a,b)}),this},_setOption:function(a,b){return this.options[a]=b,a==="disabled"&&this.widget()[b?"addClass":"removeClass"](this.widgetBaseClass+"-disabled"+" "+"ui-state-disabled").attr("aria-disabled",b),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_trigger:function(b,c,d){var e,f,g=this.options[b];d=d||{},c=a.Event(c),c.type=(b===this.widgetEventPrefix?b:this.widgetEventPrefix+b).toLowerCase(),c.target=this.element[0],f=c.originalEvent;if(f)for(e in f)e in c||(c[e]=f[e]);return this.element.trigger(c,d),!(a.isFunction(g)&&g.call(this.element[0],c,d)===!1||c.isDefaultPrevented())}}})(jQuery);
/*! jQuery UI - v1.8.20 - 2012-04-30
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.mouse.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){var c=!1;a(document).mouseup(function(a){c=!1}),a.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var b=this;this.element.bind("mousedown."+this.widgetName,function(a){return b._mouseDown(a)}).bind("click."+this.widgetName,function(c){if(!0===a.data(c.target,b.widgetName+".preventClickEvent"))return a.removeData(c.target,b.widgetName+".preventClickEvent"),c.stopImmediatePropagation(),!1}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),a(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(b){if(c)return;this._mouseStarted&&this._mouseUp(b),this._mouseDownEvent=b;var d=this,e=b.which==1,f=typeof this.options.cancel=="string"&&b.target.nodeName?a(b.target).closest(this.options.cancel).length:!1;if(!e||f||!this._mouseCapture(b))return!0;this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){d.mouseDelayMet=!0},this.options.delay));if(this._mouseDistanceMet(b)&&this._mouseDelayMet(b)){this._mouseStarted=this._mouseStart(b)!==!1;if(!this._mouseStarted)return b.preventDefault(),!0}return!0===a.data(b.target,this.widgetName+".preventClickEvent")&&a.removeData(b.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(a){return d._mouseMove(a)},this._mouseUpDelegate=function(a){return d._mouseUp(a)},a(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),b.preventDefault(),c=!0,!0},_mouseMove:function(b){return!a.browser.msie||document.documentMode>=9||!!b.button?this._mouseStarted?(this._mouseDrag(b),b.preventDefault()):(this._mouseDistanceMet(b)&&this._mouseDelayMet(b)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,b)!==!1,this._mouseStarted?this._mouseDrag(b):this._mouseUp(b)),!this._mouseStarted):this._mouseUp(b)},_mouseUp:function(b){return a(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,b.target==this._mouseDownEvent.target&&a.data(b.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(b)),!1},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(a){return this.mouseDelayMet},_mouseStart:function(a){},_mouseDrag:function(a){},_mouseStop:function(a){},_mouseCapture:function(a){return!0}})})(jQuery);
/*! jQuery UI - v1.8.20 - 2012-04-30
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.draggable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.draggable",a.ui.mouse,{widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1},_create:function(){this.options.helper=="original"&&!/^(?:r|a|f)/.test(this.element.css("position"))&&(this.element[0].style.position="relative"),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._mouseInit()},destroy:function(){if(!this.element.data("draggable"))return;return this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy(),this},_mouseCapture:function(b){var c=this.options;return this.helper||c.disabled||a(b.target).is(".ui-resizable-handle")?!1:(this.handle=this._getHandle(b),this.handle?(c.iframeFix&&a(c.iframeFix===!0?"iframe":c.iframeFix).each(function(){a('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1e3}).css(a(this).offset()).appendTo("body")}),!0):!1)},_mouseStart:function(b){var c=this.options;return this.helper=this._createHelper(b),this._cacheHelperProportions(),a.ui.ddmanager&&(a.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(),this.offset=this.positionAbs=this.element.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},a.extend(this.offset,{click:{left:b.pageX-this.offset.left,top:b.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.originalPosition=this.position=this._generatePosition(b),this.originalPageX=b.pageX,this.originalPageY=b.pageY,c.cursorAt&&this._adjustOffsetFromHelper(c.cursorAt),c.containment&&this._setContainment(),this._trigger("start",b)===!1?(this._clear(),!1):(this._cacheHelperProportions(),a.ui.ddmanager&&!c.dropBehaviour&&a.ui.ddmanager.prepareOffsets(this,b),this.helper.addClass("ui-draggable-dragging"),this._mouseDrag(b,!0),a.ui.ddmanager&&a.ui.ddmanager.dragStart(this,b),!0)},_mouseDrag:function(b,c){this.position=this._generatePosition(b),this.positionAbs=this._convertPositionTo("absolute");if(!c){var d=this._uiHash();if(this._trigger("drag",b,d)===!1)return this._mouseUp({}),!1;this.position=d.position}if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";return a.ui.ddmanager&&a.ui.ddmanager.drag(this,b),!1},_mouseStop:function(b){var c=!1;a.ui.ddmanager&&!this.options.dropBehaviour&&(c=a.ui.ddmanager.drop(this,b)),this.dropped&&(c=this.dropped,this.dropped=!1);var d=this.element[0],e=!1;while(d&&(d=d.parentNode))d==document&&(e=!0);if(!e&&this.options.helper==="original")return!1;if(this.options.revert=="invalid"&&!c||this.options.revert=="valid"&&c||this.options.revert===!0||a.isFunction(this.options.revert)&&this.options.revert.call(this.element,c)){var f=this;a(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){f._trigger("stop",b)!==!1&&f._clear()})}else this._trigger("stop",b)!==!1&&this._clear();return!1},_mouseUp:function(b){return this.options.iframeFix===!0&&a("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)}),a.ui.ddmanager&&a.ui.ddmanager.dragStop(this,b),a.ui.mouse.prototype._mouseUp.call(this,b)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(b){var c=!this.options.handle||!a(this.options.handle,this.element).length?!0:!1;return a(this.options.handle,this.element).find("*").andSelf().each(function(){this==b.target&&(c=!0)}),c},_createHelper:function(b){var c=this.options,d=a.isFunction(c.helper)?a(c.helper.apply(this.element[0],[b])):c.helper=="clone"?this.element.clone().removeAttr("id"):this.element;return d.parents("body").length||d.appendTo(c.appendTo=="parent"?this.element[0].parentNode:c.appendTo),d[0]!=this.element[0]&&!/(fixed|absolute)/.test(d.css("position"))&&d.css("position","absolute"),d},_adjustOffsetFromHelper:function(b){typeof b=="string"&&(b=b.split(" ")),a.isArray(b)&&(b={left:+b[0],top:+b[1]||0}),"left"in b&&(this.offset.click.left=b.left+this.margins.left),"right"in b&&(this.offset.click.left=this.helperProportions.width-b.right+this.margins.left),"top"in b&&(this.offset.click.top=b.top+this.margins.top),"bottom"in b&&(this.offset.click.top=this.helperProportions.height-b.bottom+this.margins.top)},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var b=this.offsetParent.offset();this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0])&&(b.left+=this.scrollParent.scrollLeft(),b.top+=this.scrollParent.scrollTop());if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&a.browser.msie)b={top:0,left:0};return{top:b.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:b.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.element.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var b=this.options;b.containment=="parent"&&(b.containment=this.helper[0].parentNode);if(b.containment=="document"||b.containment=="window")this.containment=[b.containment=="document"?0:a(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,b.containment=="document"?0:a(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,(b.containment=="document"?0:a(window).scrollLeft())+a(b.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(b.containment=="document"?0:a(window).scrollTop())+(a(b.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(b.containment)&&b.containment.constructor!=Array){var c=a(b.containment),d=c[0];if(!d)return;var e=c.offset(),f=a(d).css("overflow")!="hidden";this.containment=[(parseInt(a(d).css("borderLeftWidth"),10)||0)+(parseInt(a(d).css("paddingLeft"),10)||0),(parseInt(a(d).css("borderTopWidth"),10)||0)+(parseInt(a(d).css("paddingTop"),10)||0),(f?Math.max(d.scrollWidth,d.offsetWidth):d.offsetWidth)-(parseInt(a(d).css("borderLeftWidth"),10)||0)-(parseInt(a(d).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(f?Math.max(d.scrollHeight,d.offsetHeight):d.offsetHeight)-(parseInt(a(d).css("borderTopWidth"),10)||0)-(parseInt(a(d).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relative_container=c}else b.containment.constructor==Array&&(this.containment=b.containment)},_convertPositionTo:function(b,c){c||(c=this.position);var d=b=="absolute"?1:-1,e=this.options,f=this.cssPosition=="absolute"&&(this.scrollParent[0]==document||!a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,g=/(html|body)/i.test(f[0].tagName);return{top:c.top+this.offset.relative.top*d+this.offset.parent.top*d-(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():g?0:f.scrollTop())*d),left:c.left+this.offset.relative.left*d+this.offset.parent.left*d-(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():g?0:f.scrollLeft())*d)}},_generatePosition:function(b){var c=this.options,d=this.cssPosition=="absolute"&&(this.scrollParent[0]==document||!a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(d[0].tagName),f=b.pageX,g=b.pageY;if(this.originalPosition){var h;if(this.containment){if(this.relative_container){var i=this.relative_container.offset();h=[this.containment[0]+i.left,this.containment[1]+i.top,this.containment[2]+i.left,this.containment[3]+i.top]}else h=this.containment;b.pageX-this.offset.click.left<h[0]&&(f=h[0]+this.offset.click.left),b.pageY-this.offset.click.top<h[1]&&(g=h[1]+this.offset.click.top),b.pageX-this.offset.click.left>h[2]&&(f=h[2]+this.offset.click.left),b.pageY-this.offset.click.top>h[3]&&(g=h[3]+this.offset.click.top)}if(c.grid){var j=c.grid[1]?this.originalPageY+Math.round((g-this.originalPageY)/c.grid[1])*c.grid[1]:this.originalPageY;g=h?j-this.offset.click.top<h[1]||j-this.offset.click.top>h[3]?j-this.offset.click.top<h[1]?j+c.grid[1]:j-c.grid[1]:j:j;var k=c.grid[0]?this.originalPageX+Math.round((f-this.originalPageX)/c.grid[0])*c.grid[0]:this.originalPageX;f=h?k-this.offset.click.left<h[0]||k-this.offset.click.left>h[2]?k-this.offset.click.left<h[0]?k+c.grid[0]:k-c.grid[0]:k:k}}return{top:g-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:d.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:d.scrollLeft())}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval&&this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1},_trigger:function(b,c,d){return d=d||this._uiHash(),a.ui.plugin.call(this,b,[c,d]),b=="drag"&&(this.positionAbs=this._convertPositionTo("absolute")),a.Widget.prototype._trigger.call(this,b,c,d)},plugins:{},_uiHash:function(a){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),a.extend(a.ui.draggable,{version:"1.8.20"}),a.ui.plugin.add("draggable","connectToSortable",{start:function(b,c){var d=a(this).data("draggable"),e=d.options,f=a.extend({},c,{item:d.element});d.sortables=[],a(e.connectToSortable).each(function(){var c=a.data(this,"sortable");c&&!c.options.disabled&&(d.sortables.push({instance:c,shouldRevert:c.options.revert}),c.refreshPositions(),c._trigger("activate",b,f))})},stop:function(b,c){var d=a(this).data("draggable"),e=a.extend({},c,{item:d.element});a.each(d.sortables,function(){this.instance.isOver?(this.instance.isOver=0,d.cancelHelperRemoval=!0,this.instance.cancelHelperRemoval=!1,this.shouldRevert&&(this.instance.options.revert=!0),this.instance._mouseStop(b),this.instance.options.helper=this.instance.options._helper,d.options.helper=="original"&&this.instance.currentItem.css({top:"auto",left:"auto"})):(this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",b,e))})},drag:function(b,c){var d=a(this).data("draggable"),e=this,f=function(b){var c=this.offset.click.top,d=this.offset.click.left,e=this.positionAbs.top,f=this.positionAbs.left,g=b.height,h=b.width,i=b.top,j=b.left;return a.ui.isOver(e+c,f+d,i,j,g,h)};a.each(d.sortables,function(f){this.instance.positionAbs=d.positionAbs,this.instance.helperProportions=d.helperProportions,this.instance.offset.click=d.offset.click,this.instance._intersectsWith(this.instance.containerCache)?(this.instance.isOver||(this.instance.isOver=1,this.instance.currentItem=a(e).clone().removeAttr("id").appendTo(this.instance.element).data("sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return c.helper[0]},b.target=this.instance.currentItem[0],this.instance._mouseCapture(b,!0),this.instance._mouseStart(b,!0,!0),this.instance.offset.click.top=d.offset.click.top,this.instance.offset.click.left=d.offset.click.left,this.instance.offset.parent.left-=d.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=d.offset.parent.top-this.instance.offset.parent.top,d._trigger("toSortable",b),d.dropped=this.instance.element,d.currentItem=d.element,this.instance.fromOutside=d),this.instance.currentItem&&this.instance._mouseDrag(b)):this.instance.isOver&&(this.instance.isOver=0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",b,this.instance._uiHash(this.instance)),this.instance._mouseStop(b,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),d._trigger("fromSortable",b),d.dropped=!1)})}}),a.ui.plugin.add("draggable","cursor",{start:function(b,c){var d=a("body"),e=a(this).data("draggable").options;d.css("cursor")&&(e._cursor=d.css("cursor")),d.css("cursor",e.cursor)},stop:function(b,c){var d=a(this).data("draggable").options;d._cursor&&a("body").css("cursor",d._cursor)}}),a.ui.plugin.add("draggable","opacity",{start:function(b,c){var d=a(c.helper),e=a(this).data("draggable").options;d.css("opacity")&&(e._opacity=d.css("opacity")),d.css("opacity",e.opacity)},stop:function(b,c){var d=a(this).data("draggable").options;d._opacity&&a(c.helper).css("opacity",d._opacity)}}),a.ui.plugin.add("draggable","scroll",{start:function(b,c){var d=a(this).data("draggable");d.scrollParent[0]!=document&&d.scrollParent[0].tagName!="HTML"&&(d.overflowOffset=d.scrollParent.offset())},drag:function(b,c){var d=a(this).data("draggable"),e=d.options,f=!1;if(d.scrollParent[0]!=document&&d.scrollParent[0].tagName!="HTML"){if(!e.axis||e.axis!="x")d.overflowOffset.top+d.scrollParent[0].offsetHeight-b.pageY<e.scrollSensitivity?d.scrollParent[0].scrollTop=f=d.scrollParent[0].scrollTop+e.scrollSpeed:b.pageY-d.overflowOffset.top<e.scrollSensitivity&&(d.scrollParent[0].scrollTop=f=d.scrollParent[0].scrollTop-e.scrollSpeed);if(!e.axis||e.axis!="y")d.overflowOffset.left+d.scrollParent[0].offsetWidth-b.pageX<e.scrollSensitivity?d.scrollParent[0].scrollLeft=f=d.scrollParent[0].scrollLeft+e.scrollSpeed:b.pageX-d.overflowOffset.left<e.scrollSensitivity&&(d.scrollParent[0].scrollLeft=f=d.scrollParent[0].scrollLeft-e.scrollSpeed)}else{if(!e.axis||e.axis!="x")b.pageY-a(document).scrollTop()<e.scrollSensitivity?f=a(document).scrollTop(a(document).scrollTop()-e.scrollSpeed):a(window).height()-(b.pageY-a(document).scrollTop())<e.scrollSensitivity&&(f=a(document).scrollTop(a(document).scrollTop()+e.scrollSpeed));if(!e.axis||e.axis!="y")b.pageX-a(document).scrollLeft()<e.scrollSensitivity?f=a(document).scrollLeft(a(document).scrollLeft()-e.scrollSpeed):a(window).width()-(b.pageX-a(document).scrollLeft())<e.scrollSensitivity&&(f=a(document).scrollLeft(a(document).scrollLeft()+e.scrollSpeed))}f!==!1&&a.ui.ddmanager&&!e.dropBehaviour&&a.ui.ddmanager.prepareOffsets(d,b)}}),a.ui.plugin.add("draggable","snap",{start:function(b,c){var d=a(this).data("draggable"),e=d.options;d.snapElements=[],a(e.snap.constructor!=String?e.snap.items||":data(draggable)":e.snap).each(function(){var b=a(this),c=b.offset();this!=d.element[0]&&d.snapElements.push({item:this,width:b.outerWidth(),height:b.outerHeight(),top:c.top,left:c.left})})},drag:function(b,c){var d=a(this).data("draggable"),e=d.options,f=e.snapTolerance,g=c.offset.left,h=g+d.helperProportions.width,i=c.offset.top,j=i+d.helperProportions.height;for(var k=d.snapElements.length-1;k>=0;k--){var l=d.snapElements[k].left,m=l+d.snapElements[k].width,n=d.snapElements[k].top,o=n+d.snapElements[k].height;if(!(l-f<g&&g<m+f&&n-f<i&&i<o+f||l-f<g&&g<m+f&&n-f<j&&j<o+f||l-f<h&&h<m+f&&n-f<i&&i<o+f||l-f<h&&h<m+f&&n-f<j&&j<o+f)){d.snapElements[k].snapping&&d.options.snap.release&&d.options.snap.release.call(d.element,b,a.extend(d._uiHash(),{snapItem:d.snapElements[k].item})),d.snapElements[k].snapping=!1;continue}if(e.snapMode!="inner"){var p=Math.abs(n-j)<=f,q=Math.abs(o-i)<=f,r=Math.abs(l-h)<=f,s=Math.abs(m-g)<=f;p&&(c.position.top=d._convertPositionTo("relative",{top:n-d.helperProportions.height,left:0}).top-d.margins.top),q&&(c.position.top=d._convertPositionTo("relative",{top:o,left:0}).top-d.margins.top),r&&(c.position.left=d._convertPositionTo("relative",{top:0,left:l-d.helperProportions.width}).left-d.margins.left),s&&(c.position.left=d._convertPositionTo("relative",{top:0,left:m}).left-d.margins.left)}var t=p||q||r||s;if(e.snapMode!="outer"){var p=Math.abs(n-i)<=f,q=Math.abs(o-j)<=f,r=Math.abs(l-g)<=f,s=Math.abs(m-h)<=f;p&&(c.position.top=d._convertPositionTo("relative",{top:n,left:0}).top-d.margins.top),q&&(c.position.top=d._convertPositionTo("relative",{top:o-d.helperProportions.height,left:0}).top-d.margins.top),r&&(c.position.left=d._convertPositionTo("relative",{top:0,left:l}).left-d.margins.left),s&&(c.position.left=d._convertPositionTo("relative",{top:0,left:m-d.helperProportions.width}).left-d.margins.left)}!d.snapElements[k].snapping&&(p||q||r||s||t)&&d.options.snap.snap&&d.options.snap.snap.call(d.element,b,a.extend(d._uiHash(),{snapItem:d.snapElements[k].item})),d.snapElements[k].snapping=p||q||r||s||t}}}),a.ui.plugin.add("draggable","stack",{start:function(b,c){var d=a(this).data("draggable").options,e=a.makeArray(a(d.stack)).sort(function(b,c){return(parseInt(a(b).css("zIndex"),10)||0)-(parseInt(a(c).css("zIndex"),10)||0)});if(!e.length)return;var f=parseInt(e[0].style.zIndex)||0;a(e).each(function(a){this.style.zIndex=f+a}),this[0].style.zIndex=f+e.length}}),a.ui.plugin.add("draggable","zIndex",{start:function(b,c){var d=a(c.helper),e=a(this).data("draggable").options;d.css("zIndex")&&(e._zIndex=d.css("zIndex")),d.css("zIndex",e.zIndex)},stop:function(b,c){var d=a(this).data("draggable").options;d._zIndex&&a(c.helper).css("zIndex",d._zIndex)}})})(jQuery);
/*! jQuery UI - v1.8.20 - 2012-04-30
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.droppable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.droppable",{widgetEventPrefix:"drop",options:{accept:"*",activeClass:!1,addClasses:!0,greedy:!1,hoverClass:!1,scope:"default",tolerance:"intersect"},_create:function(){var b=this.options,c=b.accept;this.isover=0,this.isout=1,this.accept=a.isFunction(c)?c:function(a){return a.is(c)},this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight},a.ui.ddmanager.droppables[b.scope]=a.ui.ddmanager.droppables[b.scope]||[],a.ui.ddmanager.droppables[b.scope].push(this),b.addClasses&&this.element.addClass("ui-droppable")},destroy:function(){var b=a.ui.ddmanager.droppables[this.options.scope];for(var c=0;c<b.length;c++)b[c]==this&&b.splice(c,1);return this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable"),this},_setOption:function(b,c){b=="accept"&&(this.accept=a.isFunction(c)?c:function(a){return a.is(c)}),a.Widget.prototype._setOption.apply(this,arguments)},_activate:function(b){var c=a.ui.ddmanager.current;this.options.activeClass&&this.element.addClass(this.options.activeClass),c&&this._trigger("activate",b,this.ui(c))},_deactivate:function(b){var c=a.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass),c&&this._trigger("deactivate",b,this.ui(c))},_over:function(b){var c=a.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return;this.accept.call(this.element[0],c.currentItem||c.element)&&(this.options.hoverClass&&this.element.addClass(this.options.hoverClass),this._trigger("over",b,this.ui(c)))},_out:function(b){var c=a.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return;this.accept.call(this.element[0],c.currentItem||c.element)&&(this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("out",b,this.ui(c)))},_drop:function(b,c){var d=c||a.ui.ddmanager.current;if(!d||(d.currentItem||d.element)[0]==this.element[0])return!1;var e=!1;return this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function(){var b=a.data(this,"droppable");if(b.options.greedy&&!b.options.disabled&&b.options.scope==d.options.scope&&b.accept.call(b.element[0],d.currentItem||d.element)&&a.ui.intersect(d,a.extend(b,{offset:b.element.offset()}),b.options.tolerance))return e=!0,!1}),e?!1:this.accept.call(this.element[0],d.currentItem||d.element)?(this.options.activeClass&&this.element.removeClass(this.options.activeClass),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("drop",b,this.ui(d)),this.element):!1},ui:function(a){return{draggable:a.currentItem||a.element,helper:a.helper,position:a.position,offset:a.positionAbs}}}),a.extend(a.ui.droppable,{version:"1.8.20"}),a.ui.intersect=function(b,c,d){if(!c.offset)return!1;var e=(b.positionAbs||b.position.absolute).left,f=e+b.helperProportions.width,g=(b.positionAbs||b.position.absolute).top,h=g+b.helperProportions.height,i=c.offset.left,j=i+c.proportions.width,k=c.offset.top,l=k+c.proportions.height;switch(d){case"fit":return i<=e&&f<=j&&k<=g&&h<=l;case"intersect":return i<e+b.helperProportions.width/2&&f-b.helperProportions.width/2<j&&k<g+b.helperProportions.height/2&&h-b.helperProportions.height/2<l;case"pointer":var m=(b.positionAbs||b.position.absolute).left+(b.clickOffset||b.offset.click).left,n=(b.positionAbs||b.position.absolute).top+(b.clickOffset||b.offset.click).top,o=a.ui.isOver(n,m,k,i,c.proportions.height,c.proportions.width);return o;case"touch":return(g>=k&&g<=l||h>=k&&h<=l||g<k&&h>l)&&(e>=i&&e<=j||f>=i&&f<=j||e<i&&f>j);default:return!1}},a.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(b,c){var d=a.ui.ddmanager.droppables[b.options.scope]||[],e=c?c.type:null,f=(b.currentItem||b.element).find(":data(droppable)").andSelf();g:for(var h=0;h<d.length;h++){if(d[h].options.disabled||b&&!d[h].accept.call(d[h].element[0],b.currentItem||b.element))continue;for(var i=0;i<f.length;i++)if(f[i]==d[h].element[0]){d[h].proportions.height=0;continue g}d[h].visible=d[h].element.css("display")!="none";if(!d[h].visible)continue;e=="mousedown"&&d[h]._activate.call(d[h],c),d[h].offset=d[h].element.offset(),d[h].proportions={width:d[h].element[0].offsetWidth,height:d[h].element[0].offsetHeight}}},drop:function(b,c){var d=!1;return a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(!this.options)return;!this.options.disabled&&this.visible&&a.ui.intersect(b,this,this.options.tolerance)&&(d=this._drop.call(this,c)||d),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],b.currentItem||b.element)&&(this.isout=1,this.isover=0,this._deactivate.call(this,c))}),d},dragStart:function(b,c){b.element.parents(":not(body,html)").bind("scroll.droppable",function(){b.options.refreshPositions||a.ui.ddmanager.prepareOffsets(b,c)})},drag:function(b,c){b.options.refreshPositions&&a.ui.ddmanager.prepareOffsets(b,c),a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(this.options.disabled||this.greedyChild||!this.visible)return;var d=a.ui.intersect(b,this,this.options.tolerance),e=!d&&this.isover==1?"isout":d&&this.isover==0?"isover":null;if(!e)return;var f;if(this.options.greedy){var g=this.element.parents(":data(droppable):eq(0)");g.length&&(f=a.data(g[0],"droppable"),f.greedyChild=e=="isover"?1:0)}f&&e=="isover"&&(f.isover=0,f.isout=1,f._out.call(f,c)),this[e]=1,this[e=="isout"?"isover":"isout"]=0,this[e=="isover"?"_over":"_out"].call(this,c),f&&e=="isout"&&(f.isout=0,f.isover=1,f._over.call(f,c))})},dragStop:function(b,c){b.element.parents(":not(body,html)").unbind("scroll.droppable"),b.options.refreshPositions||a.ui.ddmanager.prepareOffsets(b,c)}}})(jQuery);
/**
 * 前台工具类
 * 
 * @class CommonUtils
 * @static
 * @author luoxh
 * @modefiy tangzhengyu
 */
CommonUtils = {
	/**
	 * 注册命名空间
	 * @param 参数1为包路径，可以多级: order.cust
	 * @param 参数2为类名，只有一级，sample:cust
	 * @example 合法例子如下
	 *          CommonUtils.regNamespace("order","cust");
	 *  		CommonUtils.regNamespace("crm.order","cust");
	 * @return 名称空间对象
	 */
	regNamespace : function() {
		var args = arguments, o = null, nameSpaces;
		o = window;
		for ( var i = 0; i < args.length; i = i + 1) {
			nameSpaces = args[i].split(".");
			for ( var j = 0; j < nameSpaces.length; j = j + 1) {
				o[nameSpaces[j]] = o[nameSpaces[j]] || {};
				o = o[nameSpaces[j]];
				if(i==1){
					break;
				}
			}
		}
		return o;
	},
	/**
	 * json {} 序列化转为 a=b&c=d
	 * 建议用jquery param方法
	 */
	serializeJson : function(obj) {
		if (!obj) {
			return "";
		}
		try {
			var key="",arrayObj=[];
			for (key in obj) {
				arrayObj.push(key+"="+obj[key]);
			}
		} catch (e) {
			return "";
		}
		return arrayObj.join("&");
	},
	/**
	 * 获取最顶级窗口window
	 * @returns
	 */
	getRootWin:function() {
		var win = window;
		while (win != win.parent) {
			win = win.parent;
		}
		return win;
	},
	/**
	 * 判断当前窗口不是顶级窗口,自动将当前窗口换成顶级窗口
	 */
	autoTopWinOnload:function(){
		   if(window != window.top){
			   this.getRootWin().top.location.href = window.location.href;
		   }	
	},
	/** arg1除以arg2的精确结果*/
	mathDiv:function (arg1,arg2){ 
	    var t1=0,t2=0,r1,r2; 
	    try{t1=arg1.toString().split(".")[1].length;}catch(e){} 
	    try{t2=arg2.toString().split(".")[1].length;}catch(e){} 
	    with(Math){ 
	      r1=Number(arg1.toString().replace(".",""));
	      r2=Number(arg2.toString().replace(".",""));
	      return (r1/r2)*pow(10,t2-t1); 
	    } 
	},
	/** arg1乘以arg2的精确结果 */
	mathMul:function(arg1,arg2){
	    var m=0,s1=arg1.toString(),s2=arg2.toString(); 
	    try{m+=s1.split(".")[1].length;}catch(e){} 
	    try{m+=s2.split(".")[1].length;}catch(e){} 
	    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m); 
	},
	/** arg1加上arg2的精确结果 */
	mathAdd:function(arg1,arg2){ 
	    var r1,r2,m; 
	    try{r1=arg1.toString().split(".")[1].length;}catch(e){r1=0;}
	    try{r2=arg2.toString().split(".")[1].length;}catch(e){r2=0;} 
	    m=Math.pow(10,Math.max(r1,r2));
	    return (arg1*m+arg2*m)/m;
	},
	/** 减法函数，用来得到精确的减法结果 */
	mathSub:function (arg1,arg2){
	       var r1,r2,m,n; 
	       try{r1=arg1.toString().split(".")[1].length;}catch(e){r1=0;} 
	       try{r2=arg2.toString().split(".")[1].length;}catch(e){r2=0;} 
	       m=Math.pow(10,Math.max(r1,r2));
	       //动态控制精度长度 
	       n=(r1>=r2)?r1:r2; 
	       return ((arg1*m-arg2*m)/m).toFixed(n); 
	},
	/**
	 * 替换字符串
	 * @param param 原字符串
	 * @param s1 被替换的字符
	 * @param s2 替换的字符
	 * @returns 返回替换后字符串
	 */
	replaceAll:function(param,s1,s2) { 
	    return param.replace(new RegExp(s1,"gm"),s2); 
	}
};

/**
 * 电子渠道集团代理商共用工具类
 * 
 * @author tang
 */
CommonUtils.regNamespace("ec.agent", "page");
/**
 * 导航菜单加载工具
 */
ec.agent.page = (function(){
	//首页头部导航菜单加载不同的子页面功能
	/**
	 * @param url 加载地址
	 * @parm target 替换页面目标id
	 */
	var _pageChildLoad= function(url,target,fun){
		$.callServiceAsHtmlGet(url,{
			"before":function(){
				var target$=null;
				if(typeof target=="string"){
					target$=$("#"+target);
				}else {
					target$=target;
				}
				target$.data("old_html",target$.html());
				target$.html('<div style="margin:5px 0 5px 0;widht:100%,height:100%;text-align:center;">'+
			     '<img src="'+contextPath+'/image/ajax-loader.gif"></div>');
			},
			"done" : function(response){
			
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var content$=null;
				if(typeof target=="string"){
					content$=$("#"+target);
				}else {
					content$=target;
				}
				content$.addClass("pageright").removeClass("in out").addClass("out");
				setTimeout(function(){
					 if(response.code==1103 ||  response.code==1104){
						content$.html(content$.data("old_html")).removeClass("cuberight in out").addClass("pop in");
					} else if(response.code==0){
						content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
					}
					setTimeout(function(){
						content$.removeClass("pop in out");
					},500);
					if($.isFunction(fun)){
						fun.apply(this,[response]);
					}
				},500);

			}
		,"fail":function(response){
				if($.isFunction(fun)){
						fun.apply(this,[response]);
				}else {
					var target$=null;
					if(typeof target=="string"){
						target$=$("#"+target);
					}else {
						target$=target;
					}
					if(response.code==0){
						
					}
					if(response.code==1103 ||  response.code==1104){
						content$.html(content$.data("old_html"));
					}else{
						target$.html('<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>加载页面失败,请重新加载!.</strong></div>');
					}
	
				}
			}
		});	
	};
	/**
	 * @param url 加载地址
	 */
	var _pageNewLoad= function(url){
		//跳转地址前判断是否登录超时
		if(login.windowpub.checkLogin()){
			window.location.href=url;
		}
	};
	//与_pageChildLoad方法相同，去掉HTML5效果
	var _pageChildLoadNoHTML5= function(url,target,fun){
		$.callServiceAsHtmlGet(url,{
			"before":function(){
				var target$=null;
				if(typeof target=="string"){
					target$=$("#"+target);
				}else {
					target$=target;
				}
				target$.data("old_html",target$.html());
				target$.html('<div style="margin:5px 0 5px 0;widht:100%,height:100%;text-align:center;">'+
			     '<img src="'+contextPath+'/image/ajax-loader.gif"></div>');
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var content$=null;
				if(typeof target=="string"){
					content$=$("#"+target);
				}else {
					content$=target;
				}
				setTimeout(function(){
					 if(response.code==1103 ||  response.code==1104){
						content$.html(content$.data("old_html"));
					} else if(response.code==0){
						content$.html(response.data);
					}
					if($.isFunction(fun)){
						fun.apply(this,[response]);
					}
				},500);

			}
		,"fail":function(response){
				if($.isFunction(fun)){
						fun.apply(this,[response]);
				}else {
					var target$=null;
					if(typeof target=="string"){
						target$=$("#"+target);
					}else {
						target$=target;
					}
					if(response.code==0){
						
					}
					if(response.code==1103 ||  response.code==1104){
						content$.html(content$.data("old_html"));
					}else{
						target$.html('<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>加载页面失败,请重新加载!.</strong></div>');
					}
	
				}
			}
		});	
	};
	return {
		pageChildLoad		:_pageChildLoad,
		pageChildLoadNoHTML5:_pageChildLoadNoHTML5,
		pageNewLoad			:_pageNewLoad
	};
})();
(function($) {
	$.extend($,{
		//error, warning, question, information 
		confirm : function(title,content,options,type) {
			var buttons= ['确定', '取消'];
			if(!$.isFunction(options.no)){
				buttons= ['确定'];
			}
			new $.Zebra_Dialog(content,{
				'keyboard':false,
            	'modal':true,
            	'overlay_close':false,
            	'overlay_opacity':.5,
                'type':    !!type?type:'confirmation',
                'title':    title,
                'buttons':  buttons,
                'onClose':  function(caption) {
                    if(caption == '确定'){
                    	if($.isFunction(options.yes)){
                    		options.yes();
                    	} 
                    	if($.isFunction(options.yesdo)){
                    		$(".ZebraDialog").remove();
                			$(".ZebraDialogOverlay").remove();
                    		options.yesdo();
                    		return;
                    	} 
                    }else{
                    	if($.isFunction(options.no)){
                    		options.no();
                    	}
                    }
                    $(".ZebraDialog").remove();
                	$(".ZebraDialogOverlay").remove();
                }
			});
		},
		//error, warning, question, information,confirmation
		alert:function(title,content,type){
			new $.Zebra_Dialog(content, {
				'open_speed':0,
				'keyboard':false,
            	'modal':true,
            	'overlay_close':false,
            	'overlay_opacity':.5,
                'type':     !!type?type:'information',
                'title':    title,
                'buttons':  ['确定']
			});
		},
		alertFast:function(title,content,type){
			new $.Zebra_Dialog(content, {
				'open_speed':0,
				'keyboard':false,
				'modal':true,
				'overlay_close':false,
				'overlay_opacity':.5,
				'type':     !!type?type:'information',
						'title':    title,
						'buttons':  ['确定']
			});
		},
		alertOpt:function(title,content,opt){
			new $.Zebra_Dialog(content, $.extend({
				'open_speed':1000,
				'keyboard':false,
				'modal':true,
				'overlay_close':false,
				'overlay_opacity':.5,
				'type':     !!type?type:'information',
						'title':    title,
						'buttons':  ['确定']
			}, opt));
		},
		//同步执行，关闭时执行后面的js动作
		alertSync:function(title,content,type,callBack){
			new $.Zebra_Dialog(content, {
				'open_speed'	:1000,
				'keyboard'		:false,
            	'modal'			:true,
            	'overlay_close'	:false,
            	'overlay_opacity':.5,
                'type'			: !!type?type:'information',
                'title'			: title,
                'buttons'		: ['确定'],
                'onClose'		: callBack
			});
		},
		//error, warning, question, information,confirmation
		alertM:function(err){
			var rand = ec.util.getNRandomCode(5);
			var opId = "alertMoreOp" + rand;
			var contId = "alertMoreContent" + rand;
			var c  = '<div>';
				c += '<div class="am_baseMsg">错误编码【'+ec.util.defaultStr(err.errCode, "未知") + '】' + ec.util.defaultStr(err.errMsg, "未知")+'</div>';
			    c += '<div class="am_more"><a id="'+ opId +'" href="javascript:void(0);" onclick="">&nbsp;【更多】&nbsp;</a></div>';
			    c += '<div id="'+ contId +'" class="am_moreMsg"><font>【详细信息】</font><br/>';
			    c += '<font>入参：</font><br/><span>'+ec.util.encodeHtml(ec.util.defaultStr(err.paramMap, "未知"))+'</span><br/>';
			    if (err.resultMap) {
			    	c += '<font>回参：</font><br/><span>'+ec.util.defaultStr(err.resultMap, "未知")+'</span><br/>';
			    }
			    c += '<font>异常信息：</font><br/><span>'+ec.util.encodeHtml(ec.util.defaultStr(err.errData, "未知"))+'</span><br/>';
			    c += '</div></div>';
			
			new $.Zebra_Dialog(c, {
				'keyboard'	:true,
            	'modal'		:true,
            	'animation_speed':500,
            	'overlay_close':false,
            	'overlay_opacity':.5,
                'type'		: "error",
                'title'		: "异常信息",
                'position' 	: ['left + 380', 'top + 100'],
                'width'		: 430,
                'buttons'	: ['确定']
			});
//			$("#alertMoreOp").off("click").on("click",function(){$("#alertMoreContent").slideDown("slow");});
			$("#"+opId).off("click").toggle(
				function(){
					$("#"+contId).slideDown("normal");
				},
				function(){
					$("#"+contId).slideUp("fast");
				}
			);
		},
		//error, warning, question, information,confirmation
		alertMore:function(title,bNumber,bContent,mContent,type){
			var c  = '<div>';
				c += '<div class="am_baseMsg">'+bNumber+'</div>';
				c += '<div class="am_baseMsg">'+bContent+'</div>';
			    c += '<div class="am_more"><a id="alertMoreOp" href="javascript:void(0);" onclick="">&nbsp;【更多】&nbsp;</a></div>';
			    c += '<div id="alertMoreContent" class="am_moreMsg"><font>详细信息：</font><br/><p>'+mContent+'</p></div>';
			    c += '</div>';
			
			new $.Zebra_Dialog(c, {
				'keyboard'	:true,
            	'modal'		:true,
            	'animation_speed':500,
            	'overlay_close':false,
            	'overlay_opacity':.5,
                'type'		: !!type?type:'information',
                'title'		: title,
                'position' 	: ['left + 380', 'top + 180'],
                'width'		: 430,
                'buttons'	: ['确定']
			});
			$("#alertMoreOp").off("click").on("click",function(){$("#alertMoreContent").slideDown("slow");});
		},
		mask : function(content) {
			$.blockUI({
        		message:  '<div id="loadmask" class="loadmask-msg" style="z-index:30000;"><div>'+content+'</div></div>'
		    });
		    $("#blockMsg").width($("#loadmask").width()+10);
		    $("#blockUI").css("opacity","0.1");
		    $("#blockMsg").css("opacity","1");
		    $("#blockOverlay").css("opacity","0.1");
		    $("#blockMsg").css("border","0");
		},
		unmask : function() {
			$.unblockUI();
		}
	});
})(jQuery);
/**
 * 商城通用JS封装方法
 *  modified by liusd
 * @author tang 
 */
CommonUtils.regNamespace("ec","util");
/**
 * 工具包
 */
ec.util=(function(){
	
	/**
	 * 显示后台验证错误信息
	 * @param 错误数组
	 */
	var _showErrorsTip=function(errorArray,form){
		var elArray=[];
		if(!form) {
			form=$("body");
		}
		$.each(errorArray,function(i){
			var el=$("#"+this.element);
			if(!(el && el.length >0) ){
				el=$("input[name='"+this.element+"']",form);
				if(el.length==0) {
					el=$("select[name='"+this.element+"']",form);
				}
				if(el.length==0) {
					el=$("textarea[name='"+this.element+"']",form);
				}
				if(el.length>0) {
					el=el.eq(0);
				} else {
					return true;
				}
			}
			var container=$("#ketchup-"+this.element);
			var elOffset = el.offset(); 
			var leftTip=elOffset.left;
			var topTip= elOffset.top+el.outerHeight()+1;
			var elType=el.attr("type");
			var name=el.attr("name");
			if(elType=="radio" || elType=="checkbox"){
				$("input[type="+elType+"][name='"+name+"']",form).each(function(n){
					if(!$(this).hasClass("ketchup-input-error")){
						$(this).addClass("ketchup-input-error");
					}
				});
			} else {
				if(!el.hasClass("ketchup-input-error")){
					el.addClass("ketchup-input-error");
				}
			}
			if(container.length == 0 ){
				$('<div id="ketchup-'+this.element+'" style="display:none"><ul></ul><span class="centerdown"></span></div>')
				.addClass('ketchup-error')
				.css  ( {
								top : topTip,
								left: leftTip
				   }).appendTo('body');
				
			}
			container=$("#ketchup-"+this.element);
			var list = container.children('ul');

			if(list.length>0) {
				if($.inArray(this.element,elArray)<0){
					list.html("");
				}
				$('<li>'+this.message+'</li>').appendTo(list);
			}

			//需要处理不同的input select textarea
			//查找同组的值有变更就隐藏
		
			if(elType=="radio" || elType=="checkbox"){
				$("input[type="+elType+"][name='"+name+"']",form).on("mouseover",function() {
					var boj=this;
					container
					.css({top    : el.offset().top-el.height()-30})
					.animate({
						  top    : el.offset().top-el.height()-20,
						  opacity: "show"
						}, "fast");	
					$(boj).focus();
				 }).on("mouseout",function(){
						var boj=this;
						container
						.animate({
							  top    : el.offset().top-el.height()-30,
							  opacity: 0
							}, "fast", function() {
								
							});
					}).one("keyup",function(){
						$(boj).removeClass("ketchup-input-error");
						el.off("mouseover","**").off("mouseout","**");
						container.hide().remove();
					});
			} else {
				el.on("mouseover",function(){
					container
					.css({top    : el.offset().top-el.height()-30})
					.animate({
						  top    : el.offset().top-el.height()-20,
						  opacity: 1
						}, "fast").show();
					this.focus();
				}).on("mouseout",function(){
					container
					.animate({
						  top    : el.offset().top-el.height()-20,
						  opacity: 0
						}, "fast", function() {
							
						});
				}).one("keyup",function(){
					el.removeClass("ketchup-input-error");
					el.off("mouseover","**").off("mouseout","**");
					container.hide().remove();
				});
			}
	

			elArray.push(this.element);
			
		});
	};
	//参数支持两个,第一个源数据，第二个为替换数据
	var _defaultStr = function(){
		var len = arguments.length;
		if(len == 1)
			return typeof arguments[0] == "undefined" || arguments[0]==null?"":arguments[0];
		else if(len == 2)
			return typeof arguments[0] == "undefined" || arguments[0]==null?arguments[1]:arguments[0];
		else
			throw new Error("入参个数["+len+"]不正确");
	};
	/**
	 * 根据json对象取其中的值，异常或者不存在都为空字符串.
	 * @return {TypeName} 
	 * @exception {TypeName} 
	 */
	var _getJSONValByKey = function(){
		var len = arguments.length;
		if(len<=1){
			throw new Error("入参个数["+len+"]不正确");
		}
		if(len>=2){
			if(typeof arguments[0] !=="object"){
				throw new Error("第一个参数必须为JSON对象！");
			}
			for(var i=1;i<len;i++){
				if(typeof arguments[i] !=="string"){
					throw new Error("第"+(i+1)+"个参数必须为字符串！");
				}
			}
		}
		var args = [];
		for(var i=1;i<arguments.length;i++){
			args[i-1]=arguments[i];
		}
		return _loopJSONDef(arguments[0],args,"");
	};
	/**
	 * 根据json对象判断键值 是否存在，存在返回true，否则false
	 * @return true | false
	 */
	var _chkJSONValByKey = function(){
		var len = arguments.length;
		if(len<=1){
			throw new Error("入参个数["+len+"]不正确");
		}
		if(len>=2){
			if(typeof arguments[0] !="object"){
				throw new Error("第一个参数必须为JSON对象！");
			}
			for(var i=1;i<len;i++){
				if(typeof arguments[i] !="string"){
					throw new Error("第"+(i+1)+"个参数必须为字符串！");
				}
			}
		}
		var args = [];
		for(var i=1;i<arguments.length;i++){
			args[i-1]=arguments[i];
		}
		var val = _loopJSONDef(arguments[0],args,"");
		return ""==val?false:true;
	};
	/**
	 * 根据对象及数组key，取得相应json值.
	 * 用法：var json = {"a":{"b":{"c":"cc"}}};
	 *      var va = _loopJSONDef(json,["a","b","c"],"dd");//此时va="cc";
	 * @param {Object} o json对象
	 * @param {Object} arrArgs key数组
	 * @param {Object} def 默认值
	 * @return {TypeName} 
	 */
	var _loopJSONDef = function(o,arrArgs,def){
		var r = loopJSON(o,arrArgs);
		return typeof r === "undefined"?def:r;
	};
	
	var loopJSON = function(o,arrArgs){
		if(Object.prototype.toString.call(o)!=="[object Object]")
			throw new Error("参数必须为JSON对象！");
		if(Object.prototype.toString.call(arrArgs)!=="[object Array]")
			throw new Error("参数必须为数组对象！");
		if (arrArgs.length == 1){
	    	return o[arrArgs[0]]==null?"":o[arrArgs[0]];
	  	}else {
	  		//key值允许不同类型的值，不一定是字符串
	    	var arg = arrArgs.shift();
	    	if (typeof(o[arg]) !== "undefined" )
	      		return loopJSON(o[arg], arrArgs);
	    	else
	      		return; 
	  	}
	};
	/**
	 * 用于表单信息提示，入参：标签位置与提示信息
	 */
	var _showMsg = function(tagId,msg){
		$("#"+tagId).html("提示："+msg);
		$("#"+tagId).fadeIn("slow");
	};
	var _hideMsg = function(tagId){
		$("#"+tagId).html("");
		$("#"+tagId).fadeOut("slow");
	};
	//返回前一地址
	var _back = function(){
		var len = arguments.length;
		if(len == 1){
			if(typeof arguments[0] =="string" && arguments[0].length > 0) {
    			window.self.location.href = contextPath+arguments[0];
    		}
		}
		if(len == 0){		
			var url=document.referrer;
	    	if(typeof(url)=="string" && url.length > 0 && url.toLowerCase().indexOf("http") >= 0) {
	    		window.self.location.href = document.referrer;
	    	} else {
	    		window.self.location.href = "javascript:history.go(-1);";
	    	}
	    }
		return false;
	};
	/**
	 * JSON对象属性追加,不覆盖
	 * @param {Object} srcJson
	 * @param {Object} attrKey
	 * @param {Object} attrVal
	 * @return {TypeName} 
	 * @exception {TypeName} 
	 */
	var _addJsonAttr = function(srcJson,attrKey,attrVal){
		if(typeof srcJson =="undefined")throw new Error("源对象无效");
		if(typeof attrKey =="undefined")throw new Error("新属性名无效");
		var newJson = {};
		try{
			for(var ak in srcJson){
				if(ak==attrKey)throw new Error("新属性键名"+attrKey+"与原对象中属性冲突。"); 
				newJson[ak]= srcJson[ak];
			}
			newJson[attrKey] = attrVal;
		}catch(e){throw new Error(e.description);};
		return newJson;
	};
	/**
	 * JSON对象合并,不覆盖或者覆盖
	 * @param {Object} srcJson
	 * @param {Object} attrKey
	 * @param {Object} attrVal
	 * @param {Object} isOverRide
	 * @return {TypeName} 
	 * @exception {TypeName} 
	 */
	var _joinJSON = function(srcJson,oriJson,isOverRide){
		if(typeof srcJson =="undefined" || !$.isPlainObject(srcJson))throw new Error("源对象无效");
		if(typeof oriJson =="undefined" || !$.isPlainObject(oriJson))throw new Error("新对象无效");
		var newJson = srcJson;
		try{
			for(var j in srcJson){
				for(var k in oriJson){
					if(j==k && isOverRide){
						newJson[j] = oriJson[k];
					}else if(j==k && !isOverRide){
						newJson[j] = srcJson[j];
					}else{
						newJson[k] = oriJson[k];
					}
				}
			}
		}catch(e){throw new Error(e.description);};
		return newJson;
	};
	/**
	 * JSON对象属性追加,覆盖
	 * @param {Object} srcJson
	 * @param {Object} attrKey
	 * @param {Object} attrVal
	 * @return {TypeName} 
	 * @exception {TypeName} 
	 */
	var _addOrReplaceJsonAttr = function(srcJson,attrKey,attrVal){
		if(typeof srcJson =="undefined")throw new Error("源对象无效");
		if(typeof attrKey =="undefined")throw new Error("新属性名无效");
		var newJson = {};
		try{
			for(var ak in srcJson){ 
				newJson[ak]= srcJson[ak];
			}
			newJson[attrKey] = attrVal;
		}catch(e){throw new Error(e.description);};
		return newJson;
	};
	/**
	 * 行颜色切换
	 * @param {Object} tbId
	 * @param {Object} evenCls
	 * @param {Object} oddCls
	 */
	var _tableEOClass = function(tbId,evenCls,oddCls){
		$("#"+tbId+" tr:even").addClass(evenCls);
		$("#"+tbId+" tr:odd").addClass(oddCls);
	};
	/**
	 * 数字判断
	 * @param {Object} obj
	 */
	var _isDigit = function(val){
		return /^[0-9]+$/.test(val);
	};
	/**
	 * 数字和字母判断
	 * @param {Object} obj
	 */
	var _isDigitAndLetter = function(val){
		return /^[A-Za-z0-9]+$/.test(val);
	};
	/**
	 * 小数 判断
	 * @param {Object} obj
	 */
	var _isDecimals = function(val){
		return /^[0-9]+[.]{0,1}[0]*[1-9]*$/.test(val);
	};
	/**
	 * 替换指定长度字符
	 * @param {Object} src
	 * @param {Object} b
	 * @param {Object} e
	 * @param {Object} repStr
	 * @return {TypeName} 
	 */
	var _encryptStr = function(src,b,e,repStr){
		if(typeof src !== "string" || src == "") return "";
		if(typeof repStr !== "string" || repStr == "")return src;
		if(src.length < e || src.length < b || b < 0 || e < 0) return src;
		var es = "";
		for(var i=0;i<src.length;i++){
			if(i<b || i>e)
		 		es += src.charAt(i);
			else
				es +=repStr;
		}
		return es;
	};
	/**
	 * 生成m~n之间的随机数
	 */
	var _getMNRandomCode = function(m,n){
		return Math.floor(Math.random()*n)+m;
	};
	
	/**
	 * 生成n位随机数
	 */
	var _getNRandomCode = function(n){
		var num = "";
		for(var i=0;i<n;i++) {
			num += Math.floor(Math.random()*10); 
		}
		return num;
	};
	
	function _atoc(numberValue){  
		var numberValue=new String(Math.round(numberValue)); // 数字金额  
		var chineseValue=""; // 转换后的汉字金额  
		var String1 = "零壹贰叁肆伍陆柒捌玖"; // 汉字数字  
		var String2 = "万仟佰拾亿仟佰拾万仟佰拾元角分"; // 对应单位  
		var len=numberValue.length; // numberValue 的字符串长度  
		var Ch1; // 数字的汉语读法  
		var Ch2; // 数字位的汉字读法  
		var nZero=0; // 用来计算连续的零值的个数  
		var String3=0; // 指定位置的数值  
		if(len>15){  
			alert("超出计算范围");  
			return "";  
		}  
		if (numberValue==0){  
			chineseValue = "零元整";  
			return chineseValue;  
		}  
		String2 = String2.substr(String2.length-len, len); // 取出对应位数的STRING2的值  
		for(var i=0; i<len; i++){  
			String3 = parseInt(numberValue.substr(i, 1),10); // 取出需转换的某一位的值  
			if ( i != (len - 3) && i != (len - 7) && i != (len - 11) && i !=(len - 15) ){  
				if ( String3 == 0 ){  
					Ch1 = "";  
					Ch2 = "";  
					nZero = nZero + 1;  
				}  
				else if ( String3 != 0 && nZero != 0 ){  
					Ch1 = "零" + String1.substr(String3, 1);  
					Ch2 = String2.substr(i, 1);  
					nZero = 0;  
				}  
				else{  
					Ch1 = String1.substr(String3, 1);  
					Ch2 = String2.substr(i, 1);  
					nZero = 0;  
				}  
			}  
			else{ // 该位是万亿，亿，万，元位等关键位  
				if( String3 != 0 && nZero != 0 ){  
					Ch1 = "零" + String1.substr(String3, 1);  
					Ch2 = String2.substr(i, 1);  
					nZero = 0;  
				}  
				else if ( String3 != 0 && nZero == 0 ){  
					Ch1 = String1.substr(String3, 1);  
					Ch2 = String2.substr(i, 1);  
					nZero = 0;  
				}  
				else if( String3 == 0 && nZero >= 3 ){  
					Ch1 = "";  
					Ch2 = "";  
					nZero = nZero + 1;  
				}  
				else{  
					Ch1 = "";  
					Ch2 = String2.substr(i, 1);  
					nZero = nZero + 1;  
				}  
				if( i == (len - 11) || i == (len - 3)){ // 如果该位是亿位或元位，则必须写上  
					Ch2 = String2.substr(i, 1);  
				}  
			}  
			chineseValue = chineseValue + Ch1 + Ch2;  
		}  
		if ( String3 == 0 ){ // 最后一位（分）为0时，加上“整”  
			chineseValue = chineseValue + "整";  
		}  
		return chineseValue;  
	};
	var _browser={ 
			versions:function(){ 
				var u = navigator.userAgent, app = navigator.appVersion; 
				return { //移动终端浏览器版本信息 
					trident: u.indexOf('Trident') > -1, //IE内核 
					presto: u.indexOf('Presto') > -1, //opera内核 
					webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核 
					gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核 
					mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端 
					ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端 
					android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器 
					iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器 
					iPad: u.indexOf('iPad') > -1, //是否iPad 
					webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部 
				}; 
			}(), 
			language:(navigator.browserLanguage || navigator.language).toLowerCase() 
	};
	var REGX_HTML_ENCODE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;

    var REGX_HTML_DECODE = /&\w+;|&#(\d+);/g;
	var _encodeHtml = function(s){
        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(REGX_HTML_ENCODE, 
                      function($0){
                          var c = $0.charCodeAt(0), r = ["&#"];
                          c = (c == 0x20) ? 0xA0 : c;
                          r.push(c); r.push(";");
                          return r.join("");
                      });
    };
	//要暴露出的公共方法
	return {
		showErrors			:_showErrorsTip,
		defaultStr			:_defaultStr,
		back				:_back,
		hideMsg				:_hideMsg,
		showMsg				:_showMsg,
		addJsonAttr			:_addJsonAttr,
		addOrReplaceJsonAttr:_addOrReplaceJsonAttr,
		tableEOClass		:_tableEOClass,
		getJSONValByKey		:_getJSONValByKey,
		chkJSONValByKey     :_chkJSONValByKey,
		getJSONValByArrayKey:_loopJSONDef,
		isDigit				:_isDigit,
		isDigitAndLetter	:_isDigitAndLetter,
		isDecimals			:_isDecimals,
		joinJSON			:_joinJSON,
		encryptStr			:_encryptStr,
		getMNRandomCode     :_getMNRandomCode,
		getNRandomCode      :_getNRandomCode,
		atoc				:_atoc,
		browser             :_browser,
		encodeHtml			:_encodeHtml
	};
})();

/**
 * 请使用jquery-1.7.2.min.js及以上版本
 * servName,服务名 params.入参 options回调函数数组和timeout 请求超时时间设置，默认10秒
 * 参数要求:json对象格式{},不能字符串,或url入参  aa=c&bb=d参数
 * <p>
 * sample: var params={map:{"key":"param","keye":"parame"}}; var
 * $.callServiceAsJson("/cust/logn/login",params,{"done":function(response){
 *  //todo
 * });
 * options参数回调为
 * {
 * 	 before:null,// 执行前回调函数
 * 	 done:null,// 成功回调函数
 * 	 fail:null,//异常回调函数
 * 	 always:null,// 执行后回调函数
 *   timeout:10000默认１０秒超时
 *   dataType:json　回返数据类型
 *   type:post 请求方法
 * }}
 * 格式如 {code:"编码",msg:"提示信息",result:"返回的结果数据",isjson:"请求是否以json返回"};
 * <P>
 * 有回调函数则为异步请求，若没有回调函数，则为同步，直接把结果返回
 * <p>
 * @author tang zheng yu
 */
(function($) {
	var default_options = {
		dataType : "json",
		type : "POST",
		contentType :"application/json;charset=UTF-8",
		timeout : 10000// 默认10秒超时
	};
	  var defalut_param_options = {
	    before:null,// 执行前回调函数
  		done:null,// 成功回调函数
  		fail:null,//异常回调函数
  		always:null,// 执行后回调函数
  		trim:true,//默认对参数所有值去掉半角和全角空格
  		timeout:130000// 请求超时时限
  		};
	  try{
		  var token=getToken(); 
	  }catch(e){}
	  if(!token)
		  token="";
      var headers = {
    		"_al_ec_token" : token
  		};
	var _callService = function(servName, params,datatype,param_options) {
					if(!(!!servName)) {
						alert("请求路径必须填写！");
						return;
					}
					var paramOptions=$.extend({},defalut_param_options, param_options||{});
					var asyncs =true; // 默认为异步请求
					if(!$.isFunction(paramOptions.done)) {
						asyncs=false; // 同步请求
					}
					var isForm=false;
					var isJsonObjet=false;
					var tempparams=params;
					var trimLeft = /^\s+/, trimRight = /\s+$/,trimCLeft=/(^　*)/g,trimCRight=/(　*$)/g;					
					try{
						if(params && typeof params=="object"){
							if(paramOptions.trim){
								params=JSON.stringify(params,function(key,value){
									if(typeof value==="string")
									{
										value= value.replace(trimLeft, "" ).replace(trimRight, "" ).replace( trimCLeft, "" ).replace( trimCRight, "" );
									}
									return value;
								});
							}else {
								params=JSON.stringify(params);
							}

						}
						if(params && /^\{(.+:.+,*){1,}\}$/.test(params)){
							isJsonObjet=true;
						}
					}catch(e){isJsonObjet=false;}

					if(params) {
						if(paramOptions.type==="GET"){
							isForm=true;
						}else if(/^(.+=.+&?){1,}$/.test(params)){
							isForm=true;
						}
					}
					if(isForm && isJsonObjet && tempparams){
						if(paramOptions.trim){
							params=JSON.parse(JSON.stringify(tempparams,function(key,value){
								if(typeof value==="string")
								{
									value= value.replace(trimLeft, "" ).replace(trimRight, "" ).replace( trimCLeft, "" ).replace( trimCRight, "" );
								}
								return value;
							}));
						} else {
							params=tempparams;
						}
						isForm=false;
					}
					var response={code:"",errorsList:"",data:"",isjson:true};
					var reqparm={};
					if(params){
						reqparm= {
								url :  servName,
								data : params,
								dataType:datatype,
								type:paramOptions.type,
								timeout:paramOptions.timeout,
								async:asyncs
							};
						
					} else {
					 reqparm= {
							url :  servName,
							dataType:datatype,
							type:paramOptions.type,
							timeout:paramOptions.timeout,
							async:asyncs
						};
					}
					//默认表请求类型
					if(isForm){
						reqparm.contentType="application/x-www-form-urlencoded;charset=UTF-8";
					}
					var req = $.extend({},default_options,reqparm,{
								beforeSend : function(xhr) {
									$.each(headers, function(key, value) {
										xhr.setRequestHeader(key,value);
								});
								if($.isFunction(paramOptions.before)) {
									paramOptions.before.apply(this);
								}
							}
							}); 
					 	$.ajax(req).done(function(data,status, xhr ){
					 		//获取sessionCode
					 		//判断是否为空，如果不为空则当前工号被强制下线，有其他人正在登录使用
					 		var sessionCode = xhr.getResponseHeader("sessionCode");
					 		if(sessionCode != null) {
					 			login.windowpub.alertLoginWindow("*当前工号已经在其它地方登录，请重新登录");
					 			return;
					 		}
					 		if(!!data && ( typeof data.data!="undefined" || typeof data.code!="undefined")){
					 			response.code=data.code;
					 			response.data=data.data;
								response.errorsList=data.errorsList;
								response.isjson=true;
						 		//未登录
								if(response.code &&( response.code==1101 ||  response.code==1100)){
//						 			alert("用户未登录或会话过期，请重新登录！");
//						 			CommonUtils.getRootWin().location.href=data.data;
						 			login.windowpub.alertLoginWindow();
						 			return;
						 		}	
						 		if(response.code &&( response.code==1103 ||  response.code==1104)){
						 			alert("无权访问页面！");
						 			return;
						 		}
						 		
						 	//非jsonresponse返回,直接返回html或text
					 		} else  {
					 			try{
					 				if(typeof data=="string"  && /^\{(.+:.+,*){1,}\}$/.test(data)) {
						 				var tempdata=eval('('+data+')');
						 				
						 				if(tempdata && typeof tempdata.data!="undefined" && typeof tempdata.code!="undefined"){
						 					//异常信息
						 					if(tempdata.code == -2) {
						 						$.alertM(tempdata.data);
						 						$.unecOverlay();
						 						response.code = -2;
						 						response.data = data;
									 			response.isjson=false;
						 						return;
						 					//未登录
						 					} else if(tempdata.code==1101 ||  tempdata.code==1100){
									 			//alert("用户未登录或会话过期，请重新登录！");
									 			login.windowpub.alertLoginWindow();
									 			//CommonUtils.getRootWin().location.href=tempdata.data;
									 			return;
									 		}
						 				}
					 				}
					 			}catch(e){
					 				alert(e.name + ": " + e.message);
					 			}
					 			response.code=xhr.getResponseHeader("respCode");
					 			response.errorsList = decodeURIComponent(xhr.getResponseHeader("respMsg"));
					 			if(typeof response.code =="undefined" || !/^[-]?\d+$/.test(response.code)){
					 				response.code=0;
					 			}
					 			//未登录
						 		if(response.code==1101 ||  response.code==1100){
//						 			alert("用户未登录或会话过期，请重新登录！");
//						 			CommonUtils.getRootWin().location.href=response.errorsList;
						 			login.windowpub.alertLoginWindow();
						 			return;
						 		}
						 		if(response.code==1103 ||  response.code==1104){
						 			alert("无权访问页面！");
						 		}
					 			response.data = data;
					 			response.isjson=false;
					 		}
					 		
							if(asyncs){
								paramOptions.done.apply(this,[response]);
							}
						//异常,非200返回处理
					 	}).fail(function(xhr,textStatus){
					 		//获取sessionCode
					 		//判断是否为空，如果不为空则当前工号被强制下线，有其他人正在登录使用
					 		var sessionCode = xhr.getResponseHeader("sessionCode");
					 		if(sessionCode != null) {
					 			login.windowpub.alertLoginWindow("*当前工号已经在其它地方登录，请重新登录");
					 			return;
					 		}
					 		var respCode =xhr.getResponseHeader("respCode");
					 		var respMsg = decodeURIComponent(xhr.getResponseHeader("respMsg"));
				 			if(!!respCode && typeof respCode !="undefined"){
				 				//未登录
						 		if(respCode==1101 ||  respCode==1100){
//						 			alert("用户未登录或会话过期，请重新登录！");
//						 			CommonUtils.getRootWin().location.href=respMsg;
						 			login.windowpub.alertLoginWindow();
						 			return;
						 		}
						 		if(response.code==1103 ||  response.code==1104){
						 			alert("无权访问页面！");
						 			return;
						 		}
				 			}
				 			if (xhr.status == 0) {//未初始化
				 				return;
				 			} else if (xhr.status == 404) {
				                 response.code=1;
								 response.errorsList=[{code:xhr.status,msg:'请求路径不存在.'}];
				              } else if (xhr.status == 500) {
				                  response.code=1;
				                  //BUG FIX please don't show the responseText directly, it's ugly
//								  response.errorsList=[{code:xhr.status,msg: xhr.responseText}];
								  response.errorsList=[{code:xhr.status,msg: '系统异常,请刷新页面重新操作或退出重登录!'}];
				              } else if (xhr.status == 403) {
				                  response.code=1;
				                  response.errorsList=[{code:xhr.status,msg:'请刷新页面重新操作或退出重登录!'}];
				              } else if (xhr.status == 400) {
				                  response.code=1;
				                  response.errorsList=[{code:xhr.status,msg:'请求数据格式错误!'}];
				              } else if (xhr.status == 12029) {
				                  response.code=1;
				                  response.errorsList=[{code:xhr.status,msg:'网络问题,请检查网络是否连接正常!'}];
				              } else {
				                  response.code=1;
				                  response.errorsList=[{code:xhr.status,msg:'网络问题,请稍后重试!'}];
				              }    
					 		if(asyncs){
						 		if($.isFunction(paramOptions.fail) ){
						 			paramOptions.fail.apply(this,[response]);
						 		} else  {
						 			$.Zebra_Dialog('<strong>'+response.errorsList[0].msg+'('+response.errorsList[0].code+')'+'</strong>', 
						 			{
						 			    'type':     'error',
						 			    'title':    '失败'
						 			});
						 		}
					 		}
					 	}).always(function() {
					 		if($.isFunction(paramOptions.always) && asyncs){
					 			paramOptions.always.apply(this);
					 		}
					 	});
					 	// 同步请求
					 	if(!asyncs){
					 		return response;
					 	}
		};
	$.extend($, {
				callServiceAsJson : function(servName, params, options) {
					//判断第二个参数是否为param_options，若是，则无参数提交
					if(params && params.done && !options){
						options=params;
						params=null;
					}
					return _callService(servName, params,"json",options);
				},
				callServiceAsJsonGet : function(servName, params, options) {
					if(params && params.done && !options){
						options=params;
						params=null;
					}
					return _callService(servName, params,"json",$.extend(options||{},{type:"GET"}));
				},
				callServiceAsXml : function(servName, params, options) {
					if(params && params.done && !options){
						options=params;
						params=null;
					}
					return _callService(servName, params,"xml",options);
				},
				callServiceAsHtml : function(servName, params, options) {
					if(params && params.done && !options){
						options=params;
						params=null;
					}
					return _callService(servName, params,"html",options);
				},
				callServiceAsHtmlGet : function(servName, params, options) {
					//判断第二个参数是否为param_options，若是，则无参数提交
					if(params && params.done && !options){
						options=params;
						params=null;
					}
					return _callService(servName, params,"html",$.extend(options||{},{type:"GET"}));
				},
				callServiceAsText : function(servName, params, options) {
					if(params && params.done && !options){
						options=params;
						params=null;
					}
					return _callService(servName, params,"text",options);
				},
				callServiceAsTextGet : function(servName, params, options) {
					if(params && params.done && !options){
						options=params;
						params=null;
					}
					return _callService(servName, params,"text",$.extend(options||{},{type:"GET"}));
				}
			});
})(jQuery, this);

/**
 * 会话超时弹出登录窗口
 *  modified by gongr
 * @author gongr 
 */
CommonUtils.regNamespace("login","windowpub");
/**
 * 工具包
 */
login.windowpub=(function(){
	
	/**
	 * 弹出登录框
	 */
	var _alertLoginWindow = function(info){
		if($("#zebra_login").length > 0) {
			return;
		}
		if(info == null){
			info = "";
		}
		//检测cookie是否存在
		var staffCookie = _getCookie("cookieUser");
		//弹出登陆窗口
		if(staffCookie != "") {
			$.unecOverlay();
			_dialogDefault(info);
		}else {
			CommonUtils.getRootWin().location.href=contextPath + "/staff/login/page";
		}
	};
	//弹出登陆框
	var _dialogDefault = function(info){
		var position;
		//判断是否为ipad
//		var ua = navigator.userAgent.toLowerCase(); 
//	    if(ua.match(/iPad/i)=="ipad") { 
//	    	position = ['center', 'top + 20'];
//		}else {
			position = ['left + 500', 'top + 180'];
//		}
		var c = "<div style='text-align:center;'><form id='zebraForm'><div id='loginDifferent' style='margin-bottom:10px;color:red;'>"+info+"</div><div style='margin-bottom:10px;'>工&nbsp;&nbsp;&nbsp;号：<input id='staffUserName1' type='text' style='width:160px;height:22px;' placeholder='请输入您的工号' data-validate='validate(required:工号不能为空) on(blur)'></div>" + 
	 	"<div>密&nbsp;&nbsp;&nbsp;码：<input id='staffPassword1' type='password' style='width:160px;height:22px;' placeholder='请输入您的密码' data-validate='validate(required:密码不能为空) on(blur)'>" + 
	 	"<div id='errorMessage' style='display:none;text-align:right;color:red;margin-top:10px;'></div></form></div>";
		new $.Zebra_Dialog(c, {
			'id':"zebra_login",
			'open_speed':true,
			'keyboard'	:false,
			'modal'		:true,
			'animation_speed':500,
			'overlay_close':false,
			'overlay_opacity':.5,
		    'type'		: false,
		    'vcenter_short_message':true,
		    'title'		: '员工登录',
		    'position' 	: position,
		    'width'		: 300,
		    'buttons'	: ['返回登录页','登录','重置'],
		    'onClose'   :function(caption) {
				if(caption == "重置"){
					$("#staffUserName1").val("");
					$("#staffPassword1").val("");
					return false;
				}
				if(caption == "返回登录页"){
					CommonUtils.getRootWin().location.href=contextPath + "/staff/login/page";
				}
			}
		});
		$("#staffUserName1").focus();
		//绑定表单验证
		$(".ZebraDialog_Button1").attr("id","btn_zebra_login");
		$('#zebraForm').bind('formIsValid', function(event, form) {
			//后台登录
			_loginCallback();
		}).ketchup({bindElement:"btn_zebra_login"});
		//绑定回车事件
		document.onkeydown = function(e){
		    var ev = document.all ? window.event : e; 
		    if(ev.keyCode==13) {
		    	$("#btn_zebra_login").focus().mousedown();
		    }
		};
	};
	
	var _getMyCookie = function(cookieName) {
		var re = new RegExp("\\b"+cookieName+"=([^;]*)\\b");
		var arr =  re.exec(document.cookie);
		return arr?arr[1]:"";
	};
	//后台验证登录
	var _loginCallback = function(){
		var staffCode = $("#staffUserName1").val();
		var pwd = $("#staffPassword1").val();
		//加密
		pwd = MD5(pwd);
		//获取5位随机码
//		var randomCode = ec.util.getNRandomCode(5);
//		pwd += randomCode;
		var lanIp = "127.0.0.1";
		var channelId = $("#_session_staff_info").attr("channelId");
		var channelName = $("#_session_staff_info").attr("channelName");
		var agentTypeCd = $("#ft_range_channel").attr("agenttypecd");
		var areaId = $("#ft_range_area").val();
		var areaCode = $("#ft_range_area").attr("areacode");
		var areaName = $("#ft_range_area").attr("areaname");
		var staffProvCode = _getMyCookie("login_area_id");
		if (!!staffProvCode && staffProvCode != "") {
			staffProvCode = staffProvCode.split("-")[0];
		}
		var params={
			"staffCode":staffCode,
			"password":pwd,
			"staffProvCode":staffProvCode,
			"lanIp":lanIp,
			"channelId":channelId,
			"channelName":channelName,
			"agentTypeCd":agentTypeCd,
			"areaId":areaId,
			"areaCode":areaCode,
			"areaName":areaName
		};
		
		$.callServiceAsJson(contextPath+"/staff/login/loginValid", params, {
			"before" : function(){
				$.ecOverlay("<strong>正在登录，请稍等...</strong>");
			},
			"always" : function(){
				$.unecOverlay();
			},
			"done"   : function(response){
				if(response.code == 0) {
					//关闭Zebra_Dialog
					$_zebraClose();
				}
				///1444:用户需重新验证
				else if(response.code == 1444){
					//$.alert("提示信息",response.data);
					//$("#errorMessage").html("*"+response.data);
					//if(response.data.length > 20) {
						//$("#errorMessage").css("text-align","left");
					//}
					//$("#errorMessage").show();
					//alert(response.data);
					$.confirm("信息",response.data
							,{yes:function(
					){
						CommonUtils.getRootWin().location.href=contextPath + "/staff/login/page";
					},no:""},"error");
				}else {
					if(response.errorsList&& response.errorsList.length>0 ){
						//$.alert("提示信息",response.errorsList[0].message);
						$("#errorMessage").html("*"+response.errorsList[0].message);
						if(response.errorsList[0].message > 20) {
							$("#errorMessage").css("text-align","left");
						}
					} else {
						//$.alert("提示信息",response.data);
						$("#errorMessage").html("*"+response.data);
						if(response.data.length > 20) {
							$("#errorMessage").css("text-align","left");
						}
					}
					$("#errorMessage").show();
				}
			},
			fail : function(response){
				$.alert("提示信息","服务忙，请稍候！");
			}
		});
	};
	
	var $_zebraClose = function(){
		$(".ZebraDialogOverlay").remove();
		$(".ZebraDialog").remove();
	};
	
	/**
	 * 根据名称获取cookie
	 */
	var _getCookie = function(name){
		var staffCookie = "";
		var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		if(arr != null) {
			staffCookie = unescape(arr[2]);
		}
		return staffCookie;
	};
	
	/**
	 * 判断是否登录超时
	 */
	var _checkLogin = function(){
		//跳转地址前判断是否登录超时
		var response = $.callServiceAsJson(contextPath+"/staff/login/isLogin");
		if(response.code != 0) {
			login.windowpub.alertLoginWindow(response.data);
 			return false;
		}
		return true;
	};
	//要暴露出的公共方法
	return {
		alertLoginWindow	:_alertLoginWindow,
		checkLogin          :_checkLogin
	};
})();


/**
 * 弹出层窗口
 * 
 * @author tang
 */
CommonUtils.regNamespace("ec.form","dialog");
/**
 * 依赖 ketchup jquery.simple 两个JS
 * 对 simple dialog二次封装
 */
ec.form.dialog = (function(){
	var defOptions={id:"",title:"","submitCallBack":null,"initCallBack":null,"closeCallBack":null,position:["15%"],modal:true,drag:false,width:null,height:null,close:true,
			beforeClose:null,afterClose:null,
			overlayLeft:null,overlayTop:null,
			zIndex:1000};//heihgt:250,submitCallBack:function(dialogForm,dialog)
	var defaultOptions={};
	var _createDialog=function(options){
		defaultOptions=$.extend({},defOptions,options||{});
		if(!(defaultOptions && defaultOptions.submitCallBack && $.isFunction(defaultOptions.submitCallBack))){
			alert("submitCallBack is must have");
			return;
		}
		// create a modal dialog with the data
		if(!defaultOptions.width){
			$("#ec-dialog-form-container"+defaultOptions.id).css({width:450});
		}else {
			$("#ec-dialog-form-container"+defaultOptions.id).css({width:defaultOptions.width});
		}
		if(defaultOptions.close){
			$("#ec-dialog-form-container"+defaultOptions.id).modal({
				closeHTML: '<a href="javascript:void(0)" title="关闭" class="modal-close simplemodal-close"><div class="modal-close"></div></a>',
				position: defaultOptions.position,
				autoResize:false,
				escClose:true,
				modal:defaultOptions.modal,
				overlayId: 'ec-dialog-overlay'+defaultOptions.id,
				containerId: 'ec-dialog-container'+defaultOptions.id,
				zIndex: defaultOptions.zIndex,
				onOpen: dialogForm.open,
				onShow: dialogForm.show,
				onClose: !!defaultOptions.onClose ? null : dialogForm.close
			});
		} else {
			$("#ec-dialog-form-container"+defaultOptions.id).modal({
				closeHTML: '',
				position: defaultOptions.position,
				autoResize:false,
				escClose:false,
				modal:defaultOptions.modal,
				overlayId: 'ec-dialog-overlay'+defaultOptions.id,
				containerId: 'ec-dialog-container'+defaultOptions.id,
				onOpen: dialogForm.open,
				onShow: dialogForm.show,
				onClose: dialogForm.close
			});
		}
			var isFixOverlay=false;
			if(defaultOptions.overlayLeft){
				isFixOverlay=true;
				$("#ec-dialog-overlay").css({"left":defaultOptions.overlayLeft});
			}
			if(defaultOptions.overlayTop){
				isFixOverlay=true;
				$("#ec-dialog-overlay").css({"top":defaultOptions.overlayTop});
			}
			if(!isFixOverlay){
				$([document,window]).off(".ecdo").on("scroll.ecdo resize.ecdo",function(){
					$("#ec-dialog-overlay"+defaultOptions.id).css({"width":width(),"height":height()});
				});
			}

	};

	   var height= function () {
	        var d, c;
	        if ($.browser.msie && $.browser.version < 7) {
	            d = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
	            c = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
	            if (d < c) {
	                return $(window).height() ;
	            } else {
	                return d;
	            }
	        } else {
	            return $(window).height();
	        }
	    };
	   var  width= function () {
	        var c, d;
	        if ($.browser.msie && $.browser.version < 7) {
	            c = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
	            d = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
	            if (c < d) {
	                return $(window).width() ;
	            } else {
	                return c;
	            }
	        } else {
	            return $(window).width();
	        }
	    };
	var dialogForm={
			open:function (dialog) {
				
				// add padding to the buttons in firefox/mozilla
				if ($.browser.mozilla) {
					$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-button').css({
						'padding-bottom': '5px'
					});
				}
				// input field font size
				if ($.browser.safari) {
					$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-input').css({
						'font-size': '.9em'
					});
				}
				
				var title$=$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-title');
				var title = defaultOptions.title;
				if(title == "") {
					title = title$.html();
				}
				//var title=title$.html();
				if(!!title$.data("firsttitle")){
					title =title$.data("firsttitle");
				} else {
					title$.data("firsttitle",title);	
				}
				
				// dynamically determine height
				var h =$("#ec-dialog-container"+defaultOptions.id).height();
				h += 22;
				if(defaultOptions.height){
					h=defaultOptions.height;
				}
				if(h<45){
					h=$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-bottom-button').height()+h+title$.height();
					$("#ec-dialog-container"+defaultOptions.id).css({"height":h});
				}
				$("#ec-dialog-container"+defaultOptions.id).data("height",h);
				if($.ketchup)
				$.ketchup.removeErrorContainer($("#ec-dialog-form-container"+defaultOptions.id));
				title$.html('加载中...');
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-loading').show();
				
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-bottom-button').hide();
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-form').hide();

				if(defaultOptions.drag){
					try{
						$("#ec-dialog-container" +defaultOptions.id).draggable({handle: "div.ec-dialog-form-top", opacity: 0.65});
						$("#ec-dialog-form-container" +defaultOptions.id+" div.ec-dialog-form-top").css({"cursor":"move"});
					}catch(e){
						//jquery.ui.core,jquery.ui.widget,jquery.ui.mouse.query.ui.draggable three js file
					}
				}
				dialog.overlay.fadeIn(200, function () {
					dialog.container.fadeIn(200, function () {
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-content').css({height:"80"});
						if(defaultOptions.initCallBack && $.isFunction(defaultOptions.initCallBack)){
							defaultOptions.initCallBack.apply(this,[dialogForm,dialog]);
						}
						dialog.data.fadeIn(200, function () {
								title$.html(title);
								$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-loading').hide();
								$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-form').fadeIn(200, function () {
									var h=0;
									if(defaultOptions.height){
										h= defaultOptions.height;
									} else {
										h=$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-form').height();
										h += 22;
										if(h<25){
											h=$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-form').children().first().height();
										}
										h += 22;
									}
									if($("#ec-dialog-container"+defaultOptions.id).height()<h){
										var containerHeight=$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-bottom-button').height()+h+title$.height();
										$("#ec-dialog-container"+defaultOptions.id).css({"height":containerHeight});
									}
									$("#ec-dialog-container"+defaultOptions.id).data("height",h);
									$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-content').animate({
										height: h
									});
									// fix png's for IE 6
									var boolBtnDiv = $("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-bottom-button').attr("ifshow");
									//alert(boolBtnDiv);
									if(boolBtnDiv != "false") {
										$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-bottom-button').show();
									}
									if ($.browser.msie && $.browser.version < 7) {
										$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-button').each(function () {
											if ($(this).css('backgroundImage').match(/^url[("']+(.*\.png)[)"']+$/i)) {
												var src = RegExp.$1;
												$(this).css({
													backgroundImage: 'none',
													filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' +  src + '", sizingMethod="crop")'
												});
											}
										});
									}
								});

						});
					});
				});
			},
			show:function (dialog) {
				if($.ketchup){
					$("#ec-dialog-form-container"+defaultOptions.id).bind('formIsValid', function(event, form) {
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-bottom-button').hide();
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-message').hide().empty();
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-title').html('提交中...');
						
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-form').fadeOut(200);
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-content').animate({
							height: '80'
						}, function () {
							$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-loading').fadeIn(200, function () {
								defaultOptions.submitCallBack.apply(this,[dialogForm,dialog]);
							});
						});
						
					}).ketchup({bindElement:"#ec-dialog-form-container"+defaultOptions.id+" .ec-dialog-form-send"});
				} else {
					$("#ec-dialog-form-container"+defaultOptions.id+" #dialogFormSubmit").click(function(){
					 $("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-message').hide().empty();
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-title').html('提交中...');
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-bottom-button').hide();
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-form').fadeOut(200);
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-content').animate({
							height: '80'
						}, function () {
							$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-loading').fadeIn(200, function () {
								defaultOptions.submitCallBack.apply(this,[dialogForm,dialog]);
							});
						});
					});
				}
			},
			close:function (dialog) {
				var modal=this;
				if($.isFunction(defaultOptions.beforeClose)){
					if(!defaultOptions.beforeClose.apply(this)){
						modal.bindEvents();
						modal.occb = false;
						return;
					};
				}
				if($.isFunction(defaultOptions.closeCallBack)) {
					defaultOptions.closeCallBack.apply(this);
				}
				if($.ketchup){
					$.ketchup.removeErrorContainer($('#dialogForm'));
					$("#ec-dialog-form-container"+defaultOptions.id).unbind('formIsValid');
				}
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-message').hide().empty();
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-title').html('关闭...');
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-loading').show();
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-bottom-button').hide();
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-form').fadeOut(200);
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-content').animate({
					height: 10
				}, function () {
					dialog.data.fadeOut(200, function () {
						dialog.container.fadeOut(200, function () {
							dialog.overlay.fadeOut(200, function () {
								$.modal.close();
								if($.isFunction(defaultOptions.afterClose)){
									defaultOptions.afterClose.apply(this);
								}
							});
						});
					});
				});
			},
			showError: function (message) {
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-loading').hide();
				var message$=$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-message')
				.html($('<div class="ec-dialog-form-error"></div>').append(message)).show();
				$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-content').animate({
					height: $("#ec-dialog-container"+defaultOptions.id).data("height")+message$.height()
				}, function () {
					var title$=$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-title');
					title$.html(title$.data("firsttitle"));
					$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-form').fadeIn(200, function () {
						$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-bottom-button').show();
						// fix png's for IE 6
						if ($.browser.msie && $.browser.version < 7) {
							$("#ec-dialog-form-container"+defaultOptions.id+' .ec-dialog-form-button').each(function () {
								if ($(this).css('backgroundImage').match(/^url[("']+(.*\.png)[)"']+$/i)) {
									var src = RegExp.$1;
									$(this).css({
										backgroundImage: 'none',
										filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' +  src + '", sizingMethod="crop")'
									});
								}
							});
						}
					});
				});
				
			}
	};
	// 要暴露出的公共方法
	return {
		createDialog:_createDialog
	};
})();
$(document).ready(function(){

	//头部导航
    $('.nav_list li').hover(function () {
        $(this).addClass('nav_contenton');
    }, function () {
        $(this).removeClass('nav_contenton');
    });	
			
   //2级tab切换
   //$(".order_tab_panel:first").show();
  // $(".order_content").hide();
   $(".order_nav ul li").each(function(index){
	 $(this).click(function(){
		$(".tips").hide();
		//$(".order_content").show();
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".order_nav").siblings(".order_content").find(".order_tab_panel").eq(index).show().siblings().hide();
		});
	});
	
   //3级tab切换
   $(".phone_tab_panel:first").show();
   $(".phone_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".phone_nav").siblings(".phone_tab_content").find(".phone_tab_panel").eq(index).show().siblings().hide();
		})
	})
	
	//填单界面主副卡
   //$(".pdcardcon:first").show();
   //$(".pdcard li:first").addClass("setcon");
   $(".pdcard li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("setcon").siblings().removeClass("setcon");
		$(this).parent().parent().next(".cardtabcon").find(".pdcardcon").eq(index).show().siblings().hide();
		})
	})
	
	//填单界面批量业务
   $(".ordertabcon:first").show();
   $(".ordertab li:first").addClass("setorder");
   $(".ordertab li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("setorder").siblings().removeClass("setorder");
		$(this).parents(".ordernav").siblings(".ordercon").find(".ordertabcon").eq(index).show().siblings().hide();
		})
	})
	
	//首页热门推荐切换
   $(".main_title a:first").addClass("hottab");
  // $(".order_content").hide();
   $(".main_title a").each(function(index){
	 $(this).click(function(){
		$(this).addClass("hottab").siblings().removeClass("hottab");
		$(this).parents(".main_title").siblings(".main_index").find(".phone_warp").find(".phone_list").eq(index).show().siblings().hide();
		});
	});
	
   //2级菜单下分类
   $(".tc_tab_panel:first").show();
   $(".tc_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".tc_nav").siblings(".tc_tab_content").find(".tc_tab_panel").eq(index).show().siblings().hide();
		})
	})		
	
   $(".add_service_tab_panel:first").show();
   $(".add_service_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".add_service_nav").siblings(".add_service_tab_content").find(".add_service_tab_panel").eq(index).show().siblings().hide();
		})
	})	
		
   $(".contract_tab_panel:first").show();
   $(".contract_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".contract_nav").siblings(".contract_tab_content").find(".contract_tab_panel").eq(index).show().siblings().hide();
		})
	})
	
   //点击套餐切换
	$(".plan_box ul li").hover(function(){
		    $(this).parent().find("li").removeClass("on");
			$(this).addClass("on");
		},function(){
			$(this).find("li").removeClass("on");	
		});		
	
   //菜单样式的添加
    $('.main_list_ul').hover(function () {
        $(this).addClass('main_list_ul_hover');
    }, function () {
        $(this).removeClass('main_list_ul_hover');
    });
	
   //首页中热卖套餐tab切换
   $(".selser_tab_panel:first").show();
   $(".side_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".side_nav").siblings(".selser_tab_content").find(".selser_tab_panel").eq(index).show().siblings().hide();
		});
	});	
	
   //首页中最新信息展示tab切换
   $(".news_tab_panel:first").show();
   $(".news_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".news_nav").siblings(".news_tab_content").find(".news_tab_panel").eq(index).show().siblings().hide();
		});
	});	
	
		
   //返回顶部
   $(this).scroll(function(){ 
	 $("#GoTop").css("top",$(this).scrollTop()+200); 
   }) 
   
   //合约套餐的显示与隐藏
  	$("#sel_plan").click(function(){
  		$("#sel_plan_content").toggle();
  	});
	   
   //显示合约的月份
   $("#cf").click(function(){
		$(".hy_content").toggle();
   });
   $("#gj").click(function(){
		$(".hy_content").toggle();
   });  
   
	 //省份选择
	$(".city-pop .subbut").click(function(){
		$(".city-pop").hide();
		$(".cur-city").removeClass("act").addClass('default');
		});		 
  	$(".cur-city").click(function(){
        $(this).removeClass('default').addClass('act');
  		$(".city-pop ").toggle();
  	});

	 //快捷方式的添加与删除
   $(".ul_list ul").each(function(index){
	 $(this).click(function(){
		$(this).toggleClass("ul_sel");	
		$(".ul_list ul a.close:first").show();
		});
	});	

});
//更多菜单的展开和收起
function more_layer(){
	var more_nav_content= document.getElementById("more_nav_content");
	var more_nav_btn= document.getElementById("more_nav_btn");
	if(more_nav_content.style.display=="none"){
		$.get( function(data){
			$('#more_nav_content').html(data);
		}); 
		more_nav_content.style.display="block";
		more_nav_btn.className="more_nav_open"
	}else{
		more_nav_content.style.display="none";
		more_nav_btn.className="more_nav_close"
	}
}


//定制的展开和收起
function more_layer2(){
	var add_service_content= document.getElementById("add_service_content");
	var o_btn= document.getElementById("o_btn");
	if(add_service_content.style.display=="none"){
		$.get( function(data){
			$('#add_service_content').html(data);
		}); 
		add_service_content.style.display="block";
		o_btn.className="o_btn_close";
	}else{
		add_service_content.style.display="none";
		o_btn.className="o_btn_open";
	}
}

//品牌全部展示与部分展示
function view_termManf_div(termManf_div_id){
	document.getElementById("termManf_small").style.display="none";
	document.getElementById("termManf_all").style.display="none";
	document.getElementById(termManf_div_id).style.display="";	
	document.getElementById("view_termManf_param").value=termManf_div_id;
}

//乐享3G上网版套餐的切换
function showtc(obj,showid){
			$('.tctab').hide()
			$('.'+showid).show();
}

//现金充值的切换
function showhm(obj,showid){
			$('.hmtab').hide()
			$('.'+showid).show();
}
function showcp(obj,showid){
			$('.cptab').hide()
			$('.'+showid).show();
}

//快捷菜单的切换
function showside(obj,showid){
		$('.side_nav a').removeClass('side_nav_hover');
			$(obj).addClass('side_nav_hover');$('.sidelisthide').hide()
			$('.'+showid).show();
}

/* idTabs ~ Sean Catchpole - Version 2.2 - MIT/GPL */
(function(){var dep={"jQuery":"http://code.jquery.com/jquery-latest.min.js"};var init=function(){(function($){$.fn.idTabs=function(){var s={};for(var i=0;i<arguments.length;++i){var a=arguments[i];switch(a.constructor){case Object:$.extend(s,a);break;case Boolean:s.change=a;break;case Number:s.start=a;break;case Function:s.click=a;break;case String:if(a.charAt(0)=='.')s.selected=a;else if(a.charAt(0)=='!')s.event=a;else s.start=a;break;}}
if(typeof s['return']=="function")
s.change=s['return'];return this.each(function(){$.idTabs(this,s);});}
$.idTabs=function(tabs,options){var meta=($.metadata)?$(tabs).metadata():{};var s=$.extend({},$.idTabs.settings,meta,options);if(s.selected.charAt(0)=='.')s.selected=s.selected.substr(1);if(s.event.charAt(0)=='!')s.event=s.event.substr(1);if(s.start==null)s.start=-1;var showId=function(){if($(this).is('.'+s.selected))
return s.change;var id="#"+this.href.split('#')[1];var aList=[];var idList=[];$("a",tabs).each(function(){if(this.href.match(/#/)){aList.push(this);idList.push("#"+this.href.split('#')[1]);}});if(s.click&&!s.click.apply(this,[id,idList,tabs,s]))return s.change;for(i in aList)$(aList[i]).removeClass(s.selected);for(i in idList)$(idList[i]).hide();$(this).addClass(s.selected);$(id).show();return s.change;}
var list=$("a[href*='#']",tabs).unbind(s.event,showId).bind(s.event,showId);list.each(function(){$("#"+this.href.split('#')[1]).hide();});var test=false;if((test=list.filter('.'+s.selected)).length);else if(typeof s.start=="number"&&(test=list.eq(s.start)).length);else if(typeof s.start=="string"&&(test=list.filter("[href*='#"+s.start+"']")).length);if(test){test.removeClass(s.selected);test.trigger(s.event);}
return s;}
$.idTabs.settings={start:0,change:false,click:null,selected:".selected",event:"!click"};$.idTabs.version="2.2";$(function(){$(".idTabs").idTabs();});})(jQuery);}
var check=function(o,s){s=s.split('.');while(o&&s.length)o=o[s.shift()];return o;}
var head=document.getElementsByTagName("head")[0];var add=function(url){var s=document.createElement("script");s.type="text/javascript";s.src=url;head.appendChild(s);}
var s=document.getElementsByTagName('script');var src=s[s.length-1].src;var ok=true;for(d in dep){if(check(this,d))continue;ok=false;add(dep[d]);}if(ok)return init();add(src);})();

/* Modernizr 2.5.3 (Custom Build) | MIT & BSD
 * Build: http://www.modernizr.com/download/#-touch-mq-cssclasses-teststyles-prefixes
 */
;window.Modernizr=function(a,b,c){function x(a){j.cssText=a}function y(a,b){return x(m.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}var d="2.5.3",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n={},o={},p={},q=[],r=q.slice,s,t=function(a,c,d,e){var f,i,j,k=b.createElement("div"),l=b.body,m=l?l:b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),k.appendChild(j);return f=["&#173;","<style>",a,"</style>"].join(""),k.id=h,m.innerHTML+=f,m.appendChild(k),l||(m.style.background="",g.appendChild(m)),i=c(k,a),l?k.parentNode.removeChild(k):m.parentNode.removeChild(m),!!i},u=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b).matches;var d;return t("@media "+b+" { #"+h+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=r.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(r.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(r.call(arguments)))};return e});var C=function(c,d){var f=c.join(""),g=d.length;t(f,function(c,d){var f=b.styleSheets[b.styleSheets.length-1],h=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"",i=c.childNodes,j={};while(g--)j[i[g].id]=i[g];e.touch="ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch||(j.touch&&j.touch.offsetTop)===9},g,d)}([,["@media (",m.join("touch-enabled),("),h,")","{#touch{top:9px;position:absolute}}"].join("")],[,"touch"]);n.touch=function(){return e.touch};for(var D in n)w(n,D)&&(s=D.toLowerCase(),e[s]=n[D](),q.push((e[s]?"":"no-")+s));return x(""),i=k=null,e._version=d,e._prefixes=m,e.mq=u,e.testStyles=t,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+q.join(" "):""),e}(this,this.document);

/**
* hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*/
(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind("mousemove",track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type=="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).bind("mousemove",track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).unbind("mousemove",track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover)}})(jQuery);(function(a){function d(){a("#social ul li, .tooltip").css({opacity:.5}).hover(function(){a(this).stop().animate({opacity:.95})},function(){a(this).stop().animate({opacity:.5})})}function c(){var b=a(".top_dropup",this);a(b).hide()}function b(){var b=a(".top_dropup",this);a(b).fadeIn(hoverIntentShow);a(this).hover(function(){a(b).fadeOut(hoverIntentHide)})}a.fn.stickyFooter=function(e){var e=a.extend({dropup_speed_show:300,dropup_speed_hide:200,dropup_speed_delay:200,top_effect:"hover_fade",showhidetop:"hide",hide_speed:1e3,hide_delay:2e3},e);return this.each(function(){var f=a(this),g=a(f).children("#slider").children("#content").children("li"),h=a(g).children(".top_dropup");a(".top_dropup").css("left","-16px").hide();d();if(e.footer_click_outside===1){stickyFooterClickOutside()}if(Modernizr.touch){a(g).bind("touchstart",function(){var b=a(this);b.siblings().removeClass("active").end().toggleClass("active");b.siblings().find(h).hide(0);b.find(h).delay(e.dropup_speed_delay).show(0).click(function(a){a.stopPropagation()})})}else if(e.top_effect==="hover_fade"){hoverIntentEffect=e.top_effect;hoverIntentShow=e.dropup_speed_show;hoverIntentHide=e.dropup_speed_hide;var i={sensitivity:2,interval:100,over:b,timeout:200,out:c};a(g).hoverIntent(i)}if(e.showhidetop=="hide"){a(f).stop().delay(e.hide_delay).slideToggle(e.hide_speed);a("#top_trigger").toggleClass("trigger_active")}else if(e.showhidetop=="show"){a(f).stop().hide().fadeIn(300)}a("#top_trigger").live("click",function(){a(f).slideToggle(400);a("#top_trigger").toggleClass("trigger_active");return false})})}})(jQuery)


/**
 * escrolltotop jquery回到顶部插件，平滑返回顶部、
 * 
 * 参数设置
 *   startline : 出现返回顶部按钮离顶部的距离
 *   scrollto : 滚动到距离顶部的距离，或者某个id元素的位置
 *   scrollduration : 平滑滚动时间
 *   fadeduration : 淡入淡出时间 eg:[ 500, 100 ] [0]淡入、[1]淡出
 *   controlHTML : html代码
 *   className ：样式名称
 *   titleName : 回到顶部的title属性
 *   offsetx : 回到顶部 right 偏移位置
 *   offsety : 回到顶部 bottom 偏移位置
 *   anchorkeyword : 猫点链接
 * eg:
 *   $.scrolltotop({
 *   	scrollduration: 1000 
 *   });
 */
 $(document).ready(function() {
	$.scrolltotop({
	startline : 100, 
	fadeduration : [500,500], 
	className : "gotop", 
   	controlHTML : '<a href="javascript:;"></a>', 
	offsetx : 10, 
	offsety : 10
	});
});

(function($){
	$.scrolltotop = function(options){
		//options = jQuery.extend({
		//	startline : 100,				//出现返回顶部按钮离顶部的距离
		//	scrollto : 0,					//滚动到距离顶部的距离，或者某个id元素的位置
		//	scrollduration : 500,			//平滑滚动时间
		//	fadeduration : [ 500, 100 ],	//淡入淡出时间 ，[0]淡入、[1]淡出
		//	controlHTML : '<a href="javascript:;"><b>回到顶部↑</b></a>',		//html代码
		//	className: '',					//样式名称
		//	titleName: '回到顶部',				//回到顶部的title属性
		//	offsetx : 5,					//回到顶部 right 偏移位置
		//	offsety : 5,					//回到顶部 bottom 偏移位置
		//	anchorkeyword : '#top', 		//猫点链接
		//	}, options);
		
		var state = {
			isvisible : false,
			shouldvisible : false
		};
		
		var current = this;
		
		var $body,$control,$cssfixedsupport;
		
		var init = function(){
			var iebrws = document.all;
			$cssfixedsupport = !iebrws || iebrws
					&& document.compatMode == "CSS1Compat"
					&& window.XMLHttpRequest
			$body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
			$control = $('<div class="'+options.className+'" id="topcontrol">' + options.controlHTML + '</div>').css({
				position : $cssfixedsupport ? 'fixed': 'absolute',
				bottom : options.offsety,
				right : options.offsetx,
				opacity : 0,
				cursor : 'pointer'
			}).attr({
				title : options.titleName
			}).click(function() {
				scrollup();
				return false;
			}).appendTo('body');
			if (document.all && !window.XMLHttpRequest && $control.text() != ''){
				$control.css({
					width : $control.width()
				});
			}
			togglecontrol();
			$('a[href="' + options.anchorkeyword + '"]').click(function() {
				scrollup();
				return false;
			});
			$(window).bind('scroll resize', function(e) {
				togglecontrol();
			})
			
			return current;
		};
		
		var scrollup = function() {
			if (!$cssfixedsupport){
				$control.css( {
					opacity : 0
				});
			}
			var dest = isNaN(options.scrollto) ? parseInt(options.scrollto): options.scrollto;
			if(typeof dest == "string"){
				dest = jQuery('#' + dest).length >= 1 ? jQuery('#' + dest).offset().top : 0;
			}
			$body.animate( {
				scrollTop : dest
			}, options.scrollduration);
		};

		var keepfixed = function() {
			var $window = jQuery(window);
			var controlx = $window.scrollLeft() + $window.width()
					- $control.width() - options.offsetx;
			var controly = $window.scrollTop() + $window.height()
					- $control.height() - options.offsety;
			$control.css( {
				left : controlx + 'px',
				top : controly + 'px'
			});
		};

		var togglecontrol = function() {
			var scrolltop = jQuery(window).scrollTop();
			if (!$cssfixedsupport){
				keepfixed();
			}
			state.shouldvisible = (scrolltop >= options.startline) ? true : false;
			if (state.shouldvisible && !state.isvisible) {
				$control.stop().animate( {
					opacity : 1
				}, options.fadeduration[0]);
				state.isvisible = true;
			} else if (state.shouldvisible == false && state.isvisible) {
				$control.stop().animate( {
					opacity : 0
				}, options.fadeduration[1]);
				state.isvisible = false;
			}
		};
		
		return init();
	};
})(jQuery);
$(document).ready(function($){
	$(".allsort").hover(function(){
			$(".navsortbg").show();
		},function(){
			$(".navsortbg").hide();
	});
});
(function($){
	$.fn.hoverForIE6=function(option){
		var s=$.extend({current:"hover",delay:0},option||{});
		$.each(this,function(){
			var timer1=null,timer2=null,flag=false;
			$(this).bind("mouseover",function(){
				if (flag){
					clearTimeout(timer2);
				}else{
					var _this=$(this);
					timer1=setTimeout(function(){
						_this.addClass(s.current);
						flag=true;
					},s.delay);
				}
			}).bind("mouseout",function(){
				if (flag){
					var _this=$(this);timer2=setTimeout(function(){
						_this.removeClass(s.current);
						flag=false;
					},s.delay);
				}else{
					clearTimeout(timer1);
				}
			})
		})
	}
})(jQuery);

$(".allsort").hoverForIE6({current:"allsorthover",delay:0});
$(".allsort .item").hoverForIE6({delay:0});

function animate(dir, step) {
	var position;
	position = parseInt($("#portaltop").css("margin-left"));
	var contentwidth;
	var sliderwidth;
	contentwidth = parseInt($("#content").css("width"));
	sliderwidth = parseInt($("#slider").css("width"));
	switch (dir) {
		case "right":
			position = ((position - step) < (sliderwidth - contentwidth)) ? (sliderwidth - contentwidth) : (position - step);
			break;
		case "left":
			position = ((position + step) > 0) ? 0 : (position + step);
			break;
		default:
			break;
	};
	
	$("#content").animate(
		{ marginLeft: position + "px" },
		800
	);
};

/** 
 * easyDialog v2.0
 * Url : http://stylechen.com/easydialog-v2.0.html
 * Author : chenmnkken@gmail.com
 * Date : 2011-08-30
 */
(function(j,o){var d=j.document,p=d.documentElement,w=function(){var m=d.body,s=!-[1,],q=s&&/msie 6/.test(navigator.userAgent.toLowerCase()),n=1,t="cache"+(+new Date+"").slice(-8),l={},e=function(){};e.prototype={getOptions:function(a){var b,c={},f={container:null,overlay:!0,drag:!0,fixed:!0,follow:null,followX:0,followY:0,autoClose:0,lock:!1,callback:null};for(b in f)c[b]=a[b]!==o?a[b]:f[b];e.data("options",c);return c},setBodyBg:function(){if(m.currentStyle.backgroundAttachment!==
"fixed")m.style.backgroundImage="url(about:blank)",m.style.backgroundAttachment="fixed"},appendIframe:function(a){a.innerHTML='<iframe style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;border:0 none;filter:alpha(opacity=0)"></iframe>'},setFollow:function(a,b,c,f){b=typeof b==="string"?d.getElementById(b):b;a=a.style;a.position="absolute";a.left=e.getOffset(b,"left")+c+"px";a.top=e.getOffset(b,"top")+f+"px"},setPosition:function(a,b){var c=a.style;c.position=q?"absolute":b?"fixed":
"absolute";b?(q?c.setExpression("top",'fuckIE6=document.documentElement.scrollTop+document.documentElement.clientHeight/2+"px"'):c.top="50%",c.left="50%"):(q&&c.removeExpression("top"),c.top=p.clientHeight/2+e.getScroll("top")+"px",c.left=p.clientWidth/2+e.getScroll("left")+"px")},createOverlay:function(){var a=d.createElement("div"),b=a.style;b.cssText="margin:0;padding:0;border:none;width:100%;height:100%;background:#333;opacity:0.6;filter:alpha(opacity=60);z-index:8999;position:fixed;top:0;left:0;";
if(q)m.style.height="100%",b.position="absolute",b.setExpression("top",'fuckIE6=document.documentElement.scrollTop+"px"');a.id="overlay";return a},createDialogBox:function(){var a=d.createElement("div");a.style.cssText="margin:0;padding:0;border:none;z-index:9000;";a.id="easyDialogBox";return a},createDialogWrap:function(a){var b=typeof a.yesFn==="function"?'<button class="btn_highlight" id="easyDialogYesBtn">'+(typeof a.yesText==="string"?a.yesText:"\u786e\u5b9a")+"</button>":"",c=typeof a.noFn===
"function"||a.noFn===!0?'<button class="btn_normal" id="easyDialogNoBtn">'+(typeof a.noText==="string"?a.noText:"\u53d6\u6d88")+"</button>":"",a=['<div class="easyDialog_content">',a.header?'<h4 class="easyDialog_title" id="easyDialogTitle"><a href="javascript:void(0)" title="\u5173\u95ed\u7a97\u53e3" class="close_btn" id="closeBtn">&times;</a>'+a.header+"</h4>":"",'<div class="easyDialog_text">'+a.content+"</div>",b===""&&c===""?"":'<div class="easyDialog_footer">'+c+b+"</div>","</div>"].join(""),
b=d.getElementById("easyDialogWrapper");if(!b)b=d.createElement("div"),b.id="easyDialogWrapper",b.className="easyDialog_wrapper";b.innerHTML=a.replace(/<[\/]*script[\s\S]*?>/ig,"");return b}};e.data=function(a,b,c){if(typeof a==="string")return b!==o&&(l[a]=b),l[a];else if(typeof a==="object")return a=a===j?0:a.nodeType===9?1:a[t]?a[t]:a[t]=++n,a=l[a]?l[a]:l[a]={},c!==o&&(a[b]=c),a[b]};e.removeData=function(a,b){if(typeof a==="string")delete l[a];else if(typeof a==="object"){var c=a===j?0:a.nodeType===
9?1:a[t];if(c!==o){var e=function(a){for(var b in a)return!1;return!0},g=function(){delete l[c];if(!(c<=1))try{delete a[t]}catch(b){a.removeAttribute(t)}};b?(delete l[c][b],e(l[c])&&g()):g()}}};e.event={bind:function(a,b,c){var f=e.data(a,"e"+b)||e.data(a,"e"+b,[]);f.push(c);f.length===1&&(c=this.eventHandler(a),e.data(a,b+"Handler",c),a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent&&a.attachEvent("on"+b,c))},unbind:function(a,b,c){var f=e.data(a,"e"+b);if(f){if(c)for(var g=f.length-1,
d=f[g];g>=0;g--)d===c&&f.splice(g,1);else f=o;if(!f||!f.length)c=e.data(a,b+"Handler"),a.addEventListener?a.removeEventListener(b,c,!1):a.attachEvent&&a.detachEvent("on"+b,c),e.removeData(a,b+"Handler"),e.removeData(a,"e"+b)}},eventHandler:function(a){return function(b){for(var b=e.event.fixEvent(b||j.event),c=e.data(a,"e"+b.type),f=0,g;g=c[f++];)g.call(a,b)===!1&&(b.preventDefault(),b.stopPropagation())}},fixEvent:function(a){if(a.target)return a;var b={},c;b.target=a.srcElement||document;b.preventDefault=
function(){a.returnValue=!1};b.stopPropagation=function(){a.cancelBubble=!0};for(c in a)b[c]=a[c];return b}};e.capitalize=function(a){var b=a.charAt(0);return b.toUpperCase()+a.replace(b,"")};e.getScroll=function(a){a=this.capitalize(a);return p["scroll"+a]||m["scroll"+a]};e.getOffset=function(a,b){var c=this.capitalize(b),c=p["client"+c]||m["client"+c]||0,e=this.getScroll(b),g=a.getBoundingClientRect();return Math.round(g[b])+e-c};e.drag=function(a,b){var c="getSelection"in j?function(){j.getSelection().removeAllRanges()}:
function(){try{d.selection.empty()}catch(a){}},f=this,g=f.event,i=!1,h=s?a:d,k=b.style.position==="fixed",m=e.data("options").fixed;g.bind(a,"mousedown",function(c){i=!0;var d=f.getScroll("top"),j=f.getScroll("left"),o=k?0:j,r=k?0:d;e.data("dragData",{x:c.clientX-f.getOffset(b,"left")+(k?j:0),y:c.clientY-f.getOffset(b,"top")+(k?d:0),el:o,et:r,er:o+p.clientWidth-b.offsetWidth,eb:r+p.clientHeight-b.offsetHeight});s&&(q&&m&&b.style.removeExpression("top"),a.setCapture());g.bind(h,"mousemove",l);g.bind(h,
"mouseup",n);s&&g.bind(a,"losecapture",n);c.stopPropagation();c.preventDefault()});var l=function(a){if(i){c();var d=e.data("dragData"),f=a.clientX-d.x,g=a.clientY-d.y,h=d.et,k=d.er,m=d.eb,d=d.el,j=b.style;j.marginLeft=j.marginTop="0px";j.left=(f<=d?d:f>=k?k:f)+"px";j.top=(g<=h?h:g>=m?m:g)+"px";a.stopPropagation()}},n=function(c){i=!1;s&&g.unbind(a,"losecapture",arguments.callee);g.unbind(h,"mousemove",l);g.unbind(h,"mouseup",arguments.callee);if(s&&(a.releaseCapture(),q&&m)){var d=parseInt(b.style.top)-
f.getScroll("top");b.style.setExpression("top","fuckIE6=document.documentElement.scrollTop+"+d+'+"px"')}c.stopPropagation()}};var r,u=function(a){a.keyCode===27&&v.close()},v={open:function(a){var b=new e,c=b.getOptions(a||{}),a=e.event,f=this,g,i,h,k;r&&(clearTimeout(r),r=o);if(c.overlay)g=d.getElementById("overlay"),g||(g=b.createOverlay(),m.appendChild(g),q&&b.appendIframe(g)),g.style.display="block";q&&b.setBodyBg();i=d.getElementById("easyDialogBox");i||(i=b.createDialogBox(),m.appendChild(i));
if(c.follow){b.setFollow(i,c.follow,c.followX,c.followY);if(g)g.style.display="none";c.fixed=!1}else b.setPosition(i,c.fixed);i.style.display="block";!c.follow&&!c.fixed&&(h=function(){b.setPosition(i,!1)},a.bind(j,"resize",h),e.data("resize",h));h=typeof c.container==="string"?d.getElementById(c.container):b.createDialogWrap(c.container);if(k=i.getElementsByTagName("*")[0]){if(k&&h!==k)k.style.display="none",m.appendChild(k),i.appendChild(h)}else i.appendChild(h);h.style.display="block";k=h.offsetWidth;
var l=h.offsetHeight;h.style.marginTop=h.style.marginRight=h.style.marginBottom=h.style.marginLeft="0px";c.follow?i.style.marginLeft=i.style.marginTop="0px":(i.style.marginLeft="-"+k/2+"px",i.style.marginTop="-"+l/2+"px");if(q&&!c.overlay)i.style.width=k+"px",i.style.height=l+"px";h=d.getElementById("closeBtn");k=d.getElementById("easyDialogTitle");var l=d.getElementById("easyDialogYesBtn"),n=d.getElementById("easyDialogNoBtn");l&&a.bind(l,"click",function(a){c.container.yesFn.call(f,a)!==!1&&f.close()});
if(n){var p=function(a){(c.container.noFn===!0||c.container.noFn.call(f,a)!==!1)&&f.close()};a.bind(n,"click",p);h&&a.bind(h,"click",p)}else h&&a.bind(h,"click",f.close);c.lock||a.bind(d,"keyup",u);c.autoClose&&typeof c.autoClose==="number"&&(r=setTimeout(f.close,c.autoClose));if(c.drag&&k)k.style.cursor="move",e.drag(k,i);e.data("dialogElements",{overlay:g,dialogBox:i,closeBtn:h,dialogTitle:k,dialogYesBtn:l,dialogNoBtn:n})},close:function(){var a=e.data("options"),b=e.data("dialogElements"),c=e.event;
r&&(clearTimeout(r),r=o);if(a.overlay&&b.overlay)b.overlay.style.display="none";b.dialogBox.style.display="none";q&&b.dialogBox.style.removeExpression("top");b.closeBtn&&c.unbind(b.closeBtn,"click");b.dialogTitle&&c.unbind(b.dialogTitle,"mousedown");b.dialogYesBtn&&c.unbind(b.dialogYesBtn,"click");b.dialogNoBtn&&c.unbind(b.dialogNoBtn,"click");!a.follow&&!a.fixed&&(b=e.data("resize"),c.unbind(j,"resize",b),e.removeData("resize"));a.lock||c.unbind(d,"keyup",u);typeof a.callback==="function"&&a.callback.call(v);
e.removeData("options");e.removeData("dialogElements")}};return v},n=function(){j.easyDialog=w()},u=function(){if(!d.body){try{p.doScroll("left")}catch(j){setTimeout(u,1);return}n()}};(function(){if(d.body)n();else if(d.addEventListener)d.addEventListener("DOMContentLoaded",function(){d.removeEventListener("DOMContentLoaded",arguments.callee,!1);n()},!1),j.addEventListener("load",n,!1);else if(d.attachEvent){d.attachEvent("onreadystatechange",function(){d.readyState==="complete"&&(d.detachEvent("onreadystatechange",
arguments.callee),n())});j.attachEvent("onload",n);var m=!1;try{m=j.frameElement==null}catch(o){}p.doScroll&&m&&u()}})()})(window,void 0);


	//套餐上的按钮显示
	//$(".contract_list2 i").hide();
	//$(".contract_list2 td").hover(
	//	function () {
	//		$(this).find("i").show();
	//	},
	//	function () {
	//		$(this).find("i").hide();
	//	});
		

	

$(document).ready(function(){
	
	//展开已订购业务
	$("#orderbutton").toggle(
		function () {
			$("#orderlist").show();
			$("#arroworder").addClass("arrowup");
			$("#arroworder").removeClass("arrow");
			$(".main_div.location .s_title").css("border-bottom","0px solid #4f7d3f");
			$("#orderbutton").css({"height":"34px","border-bottom":"1px solid #fff"});
			$("#orderbutton span").css({"color":"#327501"});
		},function(){
		$("#orderlist").hide();
		$("#arroworder").addClass("arrow");
			$("#arroworder").removeClass("arrowup");
			$("#orderbutton").css({"height":"24px","border-bottom":"1px solid #4f7d3f"});
	}
	);
	//展开已订购业务 End
	
	//客户区域按钮下拉菜单
    $(".useredit").hover(function(){
		$(".useredit_hover").show();
	},
	function(){
		$(".useredit_hover").hide();
	}
	);
	//客户区域按钮下拉菜单 End
	//客户区域按钮下拉菜单点击后隐藏菜单
	$(".useredit_hover li").click(function(){
		$(".useredit_hover").hide();
	});
	
	//手机品牌更多
	$(".btn_more").toggle(
		function () {
			//$("#termManf_small").css("height","300px");
			$("#termManf_small").hide();
			$("#termManf_all").show();
			$("#termManf_all").parent("dl").css("overflow","inherit");
		},
		function () {
			$("#termManf_small").show();
			$("#termManf_all").hide();
			$("#termManf_all").parent("dl").css("overflow","hidden");
		});
	
	$("#hy").click(function(){
		$("#treaty").show();
		$("#sel_number").show();
		$("#lj").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
		$("#hy").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
		});
	$("#lj").click(function(){
		$("#treaty").hide();
		$("#sel_number").hide();
		$("#lj").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
		$("#hy").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
		});
	
	function unfoldMenu(pn, cn){
		var p = $('strong.menu-p'), c = $('div.menu-c'), cc = $('div.menu-c-current');
		if(c.index(cn) != c.index(cc)){
			p.removeClass('menu-p-current');
			cc.hide(200, function(){
				$(this).removeAttr('style').removeClass('menu-c-current');
			})
			pn.addClass('menu-p-current');
			cn.show(200, function(){
				$(this).removeAttr('style').addClass('menu-c-current');
			});
		}
	}
	
	function menuHandle(){
		$('strong.menu-p').click(function(){
			var pn = $(this), cn = pn.next();
			unfoldMenu(pn, cn);
		});
	}
	
	//设置默认下当前展开
	function menuCurrent(){
		var idx = $('input.menu-code-index').val(), m, pn, cn, p = $('strong.menu-p'), c = $('div.menu-c'), cc = $('div.menu-c-current');
		if(/c(\d)+/.test(idx)){ //判断c（十进制）条件
			m = $('a[aid="' + idx + '"]').addClass('current');
			cn = m.parents('div.menu-c');
			pn = cn.prev();
			unfoldMenu(pn, cn);
		}
	}
	
	menuCurrent();
	menuHandle();
	
});

CommonUtils.regNamespace("common", "page");

/**
 * 前台分页组件
 * @requre jquery.js
 * @requre jquery.jevent.js
 */
common.page = (function(){ 
	
	/**
	 * 		pageSize : 5
	 */
	var page = {};
	var defaultPageSize = 5;
	var defaultListenerName = "changePage";
	var defaultPageId = "page";
	var objs = {};
	var name = "";
	var _pageDiv = {};
	var _prePage = {};
	var _nextPage = {};
	var _pageLabel = {};
	var _init = function(pageDivId,pageSize,pageId,listenerName,objList) {
		if (!pageSize || pageSize < 0) {
			page.pageSize = defaultPageSize;
		} else {
			page.pageSize = pageSize;
		}
		page.totalSize = objList.length;
		page.curPage = 1;
		if (!listenerName) {
			listenerName = defaultListenerName;
		}
		name = listenerName;
		objs = objList;
		var pageDiv = $("<div class='paging' id="+pageId+">" +
							"<span class='pageUpGray'>上一页</span>" +
							"<label></label>" +
							"<span class='nextPageGrayOrange'>下一页</span>" +
							"<label class='marginTop4'></label>" +
							"<label class='marginTop4'>跳转至</label>" +
							"<input type='text' class='inputW20H20'/>" +
							"<label class='marginTop4'>页</label>" +
						"<a class='determineBtn' href='#'>跳转</a>");
		$("#"+pageDivId).append(pageDiv);
		var totalPage = Math.ceil(page.totalSize / page.pageSize);
		if (totalPage > 0) {
			for (var i=0;i<totalPage;i++) {
				$("<a class='fontBlueB' href='#'>"+(i+1)+"</a>").appendTo(pageDiv.find("label:first"));
			}
			pageDiv.find("label:first").find("a:first").addClass("pagingSelect");
		}
		page.totalPage = totalPage;
		_prePage = pageDiv.find("span:eq(0)");
		_prePage.click(function(){
			common.page.turnPrePage();
		});
		_nextPage = pageDiv.find("span:eq(1)");
		_nextPage.click(function(){
			common.page.turnNextPage();
		});
		_pageDiv = pageDiv;
		_pageLabel = _pageDiv.find("label:eq(0)");
		$.each(_pageLabel.find("a"),function(i,a){
			$(this).click(function(){
				common.page.turnToPage($.trim(parseInt($(this).text())));
			})
		});
		_pageDiv.find("a:last").click(function(){
			var pageNum = _pageDiv.find("input").val();
			if (!pageNum) {
				$.alert("提示","请输入要跳转的页数");
				return;
			}
			common.page.turnToPage(parseInt(pageNum));
		});
		common.page.turnFirstPage();
	};
	
	var _turnPrePage = function() {
		if (page.curPage == 1) {
			$.alert("提示","已经到第一页");
			return;
		} else {
			$(this).dispatchJEvent(name, _getObjsByPage(--page.curPage))
			if (page.curPage == 1) {
				_prePage.removeClass("pageUpOrange").addClass("pageUpGray").attr("disabled","disabled");
			} else {
				_nextPage.removeClass("nextPageGray").addClass("nextPageGrayOrange").removeAttr("disabled");
			}
			_lightCurPage(page.curPage);
		}
	};
	
	var _turnNextPage = function() {
		if (page.curPage == page.totalPage) {
			$.alert("提示","已经到最后一页");
			_nextPage.removeClass("nextPageGrayOrange").addClass("nextPageGray");
			return;
		} else {
			$(this).dispatchJEvent(name, _getObjsByPage(++page.curPage))
			if (page.curPage == page.totalPage) {
				_nextPage.removeClass("nextPageGrayOrange").addClass("nextPageGray").attr("disabled","disabled");
			} else {
				_prePage.removeClass("pageUpGray").addClass("pageUpOrange").removeAttr("disabled");
			}
			_lightCurPage(page.curPage);
		}
	};
	
	var _getObjsByPage = function(curPage) {
		var objList = [];
		for (var i=curPage*page.pageSize;i<(curPage+1)*page.pageSize;i++) {
			if (i > page.totalSize) {
				break;
			}
			objList.push(objs[i-1]);
		}
		return objList;
	};
	
	var _turnFirstPage = function() {
		var objList = [];
		for (var i=0;i<page.pageSize;i++) {
			if (i>=page.totalSize) {
				break;
			}
			objList.push(objs[i]);
		}
		_prePage.attr("disabled","disabled");
		$(this).dispatchJEvent(name,objList);
//		_lightCurPage(1);
	};
	
	var _lightCurPage = function(curPage) {
		$.each(_pageLabel.find("a"),function(i, a){
			if (curPage == $.trim($(this).text())) {
				$(this).addClass("pagingSelect");
			} else {
				$(this).removeClass("pagingSelect");
			}
		});
	}
	
	var _turnToPage = function(pageNum) {
		$(this).dispatchJEvent(name, _getObjsByPage(pageNum));
		_lightCurPage(pageNum);
	}
	
	return {
		init : _init,
		turnPrePage : _turnPrePage,
		turnNextPage : _turnNextPage,
		turnFirstPage : _turnFirstPage,
		turnToPage : _turnToPage
	}
})()

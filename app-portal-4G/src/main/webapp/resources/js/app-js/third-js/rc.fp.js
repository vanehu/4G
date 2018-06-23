(function(name, context, definition) {
    "use strict";
    if(typeof define === "function" && define.amd) {
        define(definition);
    } else if(typeof module !== "undefined" && module.exports) {
        module.exports = definition();
    } else if(context.exports) {
        context.exports = definition();
    } else {
        context[name] = definition();
    }

})("GuanAnFingerBaseInfo", this, function() {
    "use strict";
    if(!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var k;
            if(this == null) {
                throw new TypeError("'this' is null or undefined");
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if(len === 0) {
                return -1;
            }
            var n = +fromIndex || 0;
            if(Math.abs(n) === Infinity) {
                n = 0;
            }
            if(n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while(k < len) {
                if(k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }
    function GuanAnFingerBaseInfo(options) {

        if(!(this instanceof GuanAnFingerBaseInfo)) {
            return new GuanAnFingerBaseInfo(options);
        }

        var defaultOptions = {
            swfContainerId: "GuanAnFingerBaseInfoJs",
            swfPath: "flash/compiled/FontList.swf",
            detectScreenOrientation: true,
            sortPluginsFor: [/palemoon/i],
            userDefinedFonts: []
        };
        this.options = this.extend(options, defaultOptions);
        if (typeof Array.prototype.forEach != "function") {
            Array.prototype.forEach = function (fn, context) {
                for (var k = 0, length = this.length; k < length; k++) {
                    if (typeof fn === "function" && Object.prototype.hasOwnProperty.call(this, k)) {
                        fn.call(context, this[k], k, this);
                    }
                }
            };
        }
        this.nativeForEach = Array.prototype.forEach;

        if (typeof Array.prototype.map != "function") {
            Array.prototype.map = function (fn, context) {
                var arr = [];
                if (typeof fn === "function") {
                    for (var k = 0, length = this.length; k < length; k++) {
                        arr.push(fn.call(context, this[k], k, this));
                    }
                }
                return arr;
            };
        }
        this.nativeMap = Array.prototype.map;

    };
    GuanAnFingerBaseInfo.prototype = {
        constructor: GuanAnFingerBaseInfo,
        extend: function(source, target) {
            if(source == null) {
                return target;
            }
            for(var k in source) {
                if(source[k] != null && target[k] !== source[k]) {
                    target[k] = source[k];
                }
            }
            return target;
        },
        get: function(done) {
            var keys = [];
            keys = this.userAgentKey(keys);
            keys = this.languageKey(keys);
            keys = this.colorDepthKey(keys);
            keys = this.pixelRatioKey(keys);
            keys = this.screenResolutionKey(keys);
            keys = this.availableScreenResolutionKey(keys);
            keys = this.timezoneOffsetKey(keys);
            // localStorage sessionStorage
            keys = this.sessionStorageKey(keys);
            keys = this.localStorageKey(keys);
            keys = this.indexedDbKey(keys);
            keys = this.addBehaviorKey(keys);
            keys = this.openDatabaseKey(keys);
            keys = this.cpuClassKey(keys);
            keys = this.platformKey(keys);
            keys = this.doNotTrackKey(keys);
            keys = this.pluginsKey(keys);
            // canvas
            keys = this.fontcanvasKey(keys);
            keys = this.webglKey(keys);
            keys = this.adBlockKey(keys);
            keys = this.hasLiedLanguagesKey(keys);
            keys = this.hasLiedResolutionKey(keys);
            keys = this.hasLiedOsKey(keys);
            keys = this.hasLiedBrowserKey(keys);
            keys = this.touchSupportKey(keys);
            keys = this.cookieidKey(keys);
            window.console && window.console.log && console.log(keys);
            var that = this;
            this.fontsKey(keys, function(newKeys) {
                var values = [];
                that.each(newKeys, function(pair) {
                    var value = pair.value;
                    if(typeof pair.value.join !== "undefined") {
                        value = pair.value.join(";");
                    }
                    values.push(value);
                });
                var murmur = that.x64hash128(values.join("~~~"), 31);
                return done(murmur, newKeys);
            });
        },
        // getPlugins:function(){
        // 	return  navigator.plugins
        // },
        getPlugins: function() {
            var keys=[]
            if(!this.options.excludePlugins){
                if(this.isIE()){
                    if(!this.options.excludeIEPlugins) {
                        keys.push({key: "ie_plugins", value: this.getIEPlugins()});
                    }
                } else {
                    keys.push({key: "regular_plugins", value: this.getRegularPlugins()});
                }
            }
            return keys;
        },
        isSafari: function () {
            if(navigator.userAgent.indexOf("Safari")>0) {
                return true;
            }
        },
        isIE: function () {
            if(navigator.appName === "Microsoft Internet Explorer") {
                return true;
            } else if(navigator.appName === "Netscape" && /Trident/.test(navigator.userAgent)) { // IE 11
                return true;
            }
            return false;
        },
        map: function(obj, iterator, context) {
            var results = [];
            // Not using strict equality so that this acts as a
            // shortcut to checking for `null` and `undefined`.
            if (obj == null) { return results; }
            if (this.nativeMap && obj.map === this.nativeMap) { return obj.map(iterator, context); }
            this.each(obj, function(value, index, list) {
                results[results.length] = iterator.call(context, value, index, list);
            });
            return results;
        },
        each: function (obj, iterator, context) {
            if (obj === null) {
                return;
            }
            if (this.nativeForEach && obj.forEach === this.nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === {}) { return; }
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, obj[key], key, obj) === {}) { return; }
                    }
                }
            }
        },

        getRegularPlugins: function () {
            var plugins = [];
            for(var i = 0, l = navigator.plugins.length; i < l; i++) {
                plugins.push(navigator.plugins[i]);
            }
            // sorting plugins only for those user agents, that we know randomize the plugins
            // every time we try to enumerate them
            if(this.pluginsShouldBeSorted()) {
                plugins = plugins.sort(function(a, b) {
                    if(a.name > b.name){ return 1; }
                    if(a.name < b.name){ return -1; }
                    return 0;
                });
            }
            return this.map(plugins, function (p) {
                var mimeTypes = this.map(p, function(mt){
                    return [mt.type, mt.suffixes].join("~");
                }).join(",");
                return [p.name, p.description, mimeTypes].join(":");
            }, this);
        },
        getIEPlugins: function () {
            var result = [];
            if((Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, "ActiveXObject")) || ("ActiveXObject" in window)) {
                var names = [
                    "AcroPDF.PDF", // Adobe PDF reader 7+
                    "Adodb.Stream",
                    "AgControl.AgControl", // Silverlight
                    "DevalVRXCtrl.DevalVRXCtrl.1",
                    "MacromediaFlashPaper.MacromediaFlashPaper",
                    "Msxml2.DOMDocument",
                    "Msxml2.XMLHTTP",
                    "PDF.PdfCtrl", // Adobe PDF reader 6 and earlier, brrr
                    "QuickTime.QuickTime", // QuickTime
                    "QuickTimeCheckObject.QuickTimeCheck.1",
                    "RealPlayer",
                    "RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)",
                    "RealVideo.RealVideo(tm) ActiveX Control (32-bit)",
                    "Scripting.Dictionary",
                    "SWCtl.SWCtl", // ShockWave player
                    "Shell.UIHelper",
                    "ShockwaveFlash.ShockwaveFlash", //flash plugin
                    "Skype.Detection",
                    "TDCCtl.TDCCtl",
                    "WMPlayer.OCX", // Windows media player
                    "rmocx.RealPlayer G2 Control",
                    "rmocx.RealPlayer G2 Control.1"
                ];
                // starting to detect plugins in IE
                result = this.map(names, function(name) {
                    try {
                        new ActiveXObject(name); // eslint-disable-no-new
                        return name;
                    } catch(e) {
                        return null;
                    }
                });
            }
            if(navigator.plugins) {
                result = result.concat(this.getRegularPlugins());
            }
            return result;
        },
        pluginsShouldBeSorted: function () {
            var should = false;
            for(var i = 0, l = this.options.sortPluginsFor.length; i < l; i++) {
                var re = this.options.sortPluginsFor[i];
                if(navigator.userAgent.match(re)) {
                    should = true;
                    break;
                }
            }
            return should;
        },

        getUserAgent: function() {
            return navigator.userAgent;
        },
        getLanguageKey: function(keys) {
            if(!this.options.excludeLanguage) {
                // IE 9,10 on Windows 10 does not have the `navigator.language` property any longer
                return navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || "";
            }
            return keys;
        },
        getColorDepthKey: function() {
            if(!this.options.excludeColorDepth) {
                return screen.colorDepth || -1;
            }
            return keys;
        },
        getWebglCanvas: function() {
            var canvas = document.createElement("canvas");
            var gl = null;
            try {
                gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            } catch(e) { /* squelch */ }
            if (!gl) { gl = null; }
            return gl;
        },
        webglKey: function(keys) {
            if(this.options.excludeWebGL) {
                return keys;
            }
            if(!this.isWebGlSupported()) {
                return keys;
            }
            keys.push({key: "webgl", value: this.getWebglFp()});
            return keys;
        },
        isWebGlSupported: function() {
            // code taken from Modernizr
            if (!this.isCanvasSupported()) {
                return false;
            }

            var canvas = document.createElement("canvas"),
                glContext;

            try {
                glContext = canvas.getContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
            } catch(e) {
                glContext = false;
            }

            return !!window.WebGLRenderingContext && !!glContext;
        },
        getWebglFp: function() {
            var gl;
            var fa2s = function(fa) {
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                return "[" + fa[0] + ", " + fa[1] + "]";
            };
            var maxAnisotropy = function(gl) {
                var anisotropy, ext = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
                return ext ? (anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT), 0 === anisotropy && (anisotropy = 2), anisotropy) : null;
            };
            gl = this.getWebglCanvas();
            if(!gl) { return null; }
            // WebGL fingerprinting is a combination of techniques, found in MaxMind antifraud script & Augur fingerprinting.
            // First it draws a gradient object with shaders and convers the image to the Base64 string.
            // Then it enumerates all WebGL extensions & capabilities and appends them to the Base64 string, resulting in a huge WebGL string, potentially very unique on each device
            // Since iOS supports webgl starting from version 8.1 and 8.1 runs on several graphics chips, the results may be different across ios devices, but we need to verify it.
            var result = [];
            var vShaderTemplate = "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}";
            var fShaderTemplate = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}";
            var vertexPosBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
            var vertices = new Float32Array([-.2, -.9, 0, .4, -.26, 0, 0, .732134444, 0]);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            vertexPosBuffer.itemSize = 3;
            vertexPosBuffer.numItems = 3;
            var program = gl.createProgram(), vshader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vshader, vShaderTemplate);
            gl.compileShader(vshader);
            var fshader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fshader, fShaderTemplate);
            gl.compileShader(fshader);
            gl.attachShader(program, vshader);
            gl.attachShader(program, fshader);
            gl.linkProgram(program);
            gl.useProgram(program);
            program.vertexPosAttrib = gl.getAttribLocation(program, "attrVertex");
            program.offsetUniform = gl.getUniformLocation(program, "uniformOffset");
            gl.enableVertexAttribArray(program.vertexPosArray);
            gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, !1, 0, 0);
            gl.uniform2f(program.offsetUniform, 1, 1);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
            if (gl.canvas != null) { result.push(gl.canvas.toDataURL()); }
            result.push("extensions:" + gl.getSupportedExtensions().join(";"));
            result.push("webgl aliased line width range:" + fa2s(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)));
            result.push("webgl aliased point size range:" + fa2s(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)));
            result.push("webgl alpha bits:" + gl.getParameter(gl.ALPHA_BITS));
            result.push("webgl antialiasing:" + (gl.getContextAttributes().antialias ? "yes" : "no"));
            result.push("webgl blue bits:" + gl.getParameter(gl.BLUE_BITS));
            result.push("webgl depth bits:" + gl.getParameter(gl.DEPTH_BITS));
            result.push("webgl green bits:" + gl.getParameter(gl.GREEN_BITS));
            result.push("webgl max anisotropy:" + maxAnisotropy(gl));
            result.push("webgl max combined texture image units:" + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
            result.push("webgl max cube map texture size:" + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
            result.push("webgl max fragment uniform vectors:" + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
            result.push("webgl max render buffer size:" + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
            result.push("webgl max texture image units:" + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
            result.push("webgl max texture size:" + gl.getParameter(gl.MAX_TEXTURE_SIZE));
            result.push("webgl max varying vectors:" + gl.getParameter(gl.MAX_VARYING_VECTORS));
            result.push("webgl max vertex attribs:" + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
            result.push("webgl max vertex texture image units:" + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
            result.push("webgl max vertex uniform vectors:" + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
            result.push("webgl max viewport dims:" + fa2s(gl.getParameter(gl.MAX_VIEWPORT_DIMS)));
            result.push("webgl red bits:" + gl.getParameter(gl.RED_BITS));
            result.push("webgl renderer:" + gl.getParameter(gl.RENDERER));
            result.push("webgl shading language version:" + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
            result.push("webgl stencil bits:" + gl.getParameter(gl.STENCIL_BITS));
            result.push("webgl vendor:" + gl.getParameter(gl.VENDOR));
            result.push("webgl version:" + gl.getParameter(gl.VERSION));

            try {
                // Add the unmasked vendor and unmasked renderer if the debug_renderer_info extension is available
                var extensionDebugRendererInfo = gl.getExtension("WEBGL_debug_renderer_info");
                if (extensionDebugRendererInfo) {
                    result.push("webgl unmasked vendor:" + gl.getParameter(extensionDebugRendererInfo.UNMASKED_VENDOR_WEBGL));
                    result.push("webgl unmasked renderer:" + gl.getParameter(extensionDebugRendererInfo.UNMASKED_RENDERER_WEBGL));
                }
            } catch(e) { /* squelch */ }

            if (!gl.getShaderPrecisionFormat) {
                return result.join("~");
            }

            result.push("webgl vertex shader high float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision);
            result.push("webgl vertex shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT ).rangeMin);
            result.push("webgl vertex shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT ).rangeMax);
            result.push("webgl vertex shader medium float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).precision);
            result.push("webgl vertex shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).rangeMin);
            result.push("webgl vertex shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).rangeMax);
            result.push("webgl vertex shader low float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT ).precision);
            result.push("webgl vertex shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT ).rangeMin);
            result.push("webgl vertex shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT ).rangeMax);
            result.push("webgl fragment shader high float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision);
            result.push("webgl fragment shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).rangeMin);
            result.push("webgl fragment shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).rangeMax);
            result.push("webgl fragment shader medium float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).precision);
            result.push("webgl fragment shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).rangeMin);
            result.push("webgl fragment shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).rangeMax);
            result.push("webgl fragment shader low float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT ).precision);
            result.push("webgl fragment shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT ).rangeMin);
            result.push("webgl fragment shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT ).rangeMax);
            result.push("webgl vertex shader high int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT ).precision);
            result.push("webgl vertex shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT ).rangeMin);
            result.push("webgl vertex shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT ).rangeMax);
            result.push("webgl vertex shader medium int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT ).precision);
            result.push("webgl vertex shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT ).rangeMin);
            result.push("webgl vertex shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT ).rangeMax);
            result.push("webgl vertex shader low int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT ).precision);
            result.push("webgl vertex shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT ).rangeMin);
            result.push("webgl vertex shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT ).rangeMax);
            result.push("webgl fragment shader high int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT ).precision);
            result.push("webgl fragment shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT ).rangeMin);
            result.push("webgl fragment shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT ).rangeMax);
            result.push("webgl fragment shader medium int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT ).precision);
            result.push("webgl fragment shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT ).rangeMin);
            result.push("webgl fragment shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT ).rangeMax);
            result.push("webgl fragment shader low int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT ).precision);
            result.push("webgl fragment shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT ).rangeMin);
            result.push("webgl fragment shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT ).rangeMax);
            return result.join("~");
        },
        getScreenWidth: function() {
            if(!this.options.excludeScreenResolution) {
                return(window.screen.width);
            }
        },
        getScreenHeight: function() {
            if(!this.options.excludeScreenResolution) {
                return(window.screen.height);
            }
        },
        getTimezoneOffsetKey: function() {
            if(!this.options.excludeTimezoneOffset) {
                return new Date().getTimezoneOffset();
            }
        },
        hasSessionStorage: function() {
            if(window.localStorage) {
                return 'true'
            } else {
                return 'false';
            }
        },
        localStorageKey: function() {
            var keys=[]
            if(!this.options.excludeSessionStorage && this.hasLocalStorage()) {
                keys.push({key: "local_storage", value: 1});
            }
            return keys;
        },
        hasLocalStorage: function () {
            try {
                return !!window.localStorage;
            } catch(e) {
                return true; // SecurityError when referencing it means it exists
            }
        },
        hasIndexedDB: function() {
            return !!window.indexedDB;
        },
        getAddBehaviorKey: function() {
            if(document.body && !this.options.excludeAddBehavior && document.body.addBehavior) {
                return "true";
            } else {
                return "false";
            }
        },
        getOpenDatabaseKey: function() {
            if(!this.options.excludeOpenDatabase && window.openDatabase) {
                return "true";
            } else {
                return "false";
            }
        },
        getNavigatorCpuClass: function() {
            if(navigator.cpuClass) {
                return navigator.cpuClass;
            } else {
                return "";
            }
        },
        getNavigatorPlatform: function() {
            if(navigator.platform) {
                return navigator.platform;
            } else {
                return "unknown";
            }
        },
        getDoNotTrack: function() { //是否DoNotTrack
            if(navigator.doNotTrack) {
                return "true";
            } else {
                return "false";
            }
        },
        fontsKey: function(keys, done) {
            if(this.options.excludeJsFonts) {
                return this.flashFontsKey(keys, done);
            }
            return this.jsFontsKey(keys, done);
        },
        flashFontsKey: function(keys, done) {
            if(this.options.excludeFlashFonts) {
                if(typeof NODEBUG === "undefined") {
                    keys.push({
                        key: "swf_fonts",
                        value: "check flash font"
                    });
                }
                return done(keys);
            }
            if(!this.hasSwfObjectLoaded()) {
                if(typeof NODEBUG === "undefined") {
                    keys.push({
                        key: "swf_fonts",
                        value: "uninstall"
                    });
                }
                return done(keys);
            }
            if(!this.hasMinFlashInstalled()) {
                if(typeof NODEBUG === "undefined") {
                    keys.push({
                        key: "swf_fonts",
                        value: "uninstall flash"
                    });
                }
                return done(keys);
            }
            if(typeof this.options.swfPath === "undefined") {
                if(typeof NODEBUG === "undefined") {
                    keys.push({
                        key: "swf_fonts",
                        value: "Flash path error！"
                    });
                }
                return done(keys);
            }

            this.loadSwfAndDetectFonts(function(fonts) {
                keys.push({
                    key: "swf_fonts",
                    value: fonts.join(";")
                });
                return done(keys);
            });
        },
        getFlashFontsKey: function() {
            var fontsList = [];
            return this.flashFontsKey(fontsList, function() {
                return fontsList[0]["value"];
            });
        },
        jsFontsKey: function(keys, done) {
            var that = this;
            var baseFonts = ["Arial", "宋体", "微软雅黑"];

            var fontList = [
                "宋体", "微软雅黑", "Andale Mono", "Arial", "Arial Black", "Arial Hebrew", "Arial MT", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS", "Bitstream Vera Sans Mono", "Book Antiqua", "Bookman Old Style", "Calibri", "Cambria", "Cambria Math", "Century", "Century Gothic", "Century Schoolbook", "Comic Sans", "Comic Sans MS", "Consolas", "Courier", "Courier New", "Garamond", "Geneva", "Georgia", "Helvetica", "Helvetica Neue", "Impact", "Lucida Bright", "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "LUCIDA GRANDE", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Typewriter", "Lucida Sans Unicode", "Microsoft Sans Serif", "Monaco", "Monotype Corsiva", "MS Gothic", "MS Outlook", "MS PGothic", "MS Reference Sans Serif", "MS Sans Serif", "MS Serif", "MYRIAD", "MYRIAD PRO", "Palatino", "Palatino Linotype", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Tahoma", "Times", "Times New Roman", "Times New Roman PS", "Trebuchet MS", "Verdana", "Wingdings", "Wingdings 2", "Wingdings 3"
            ];
            var extendedFontList = [
                "Abadi MT Condensed Light", "Academy Engraved LET", "ADOBE CASLON PRO", "Adobe Garamond", "ADOBE GARAMOND PRO", "Agency FB", "Aharoni", "Albertus Extra Bold", "Albertus Medium", "Algerian", "Amazone BT", "American Typewriter",
                "American Typewriter Condensed", "AmerType Md BT", "Andalus", "Angsana New", "AngsanaUPC", "Antique Olive", "Aparajita", "Apple Chancery", "Apple Color Emoji", "Apple SD Gothic Neo", "Arabic Typesetting", "ARCHER",
                "ARNO PRO", "Arrus BT", "Aurora Cn BT", "AvantGarde Bk BT", "AvantGarde Md BT", "AVENIR", "Ayuthaya", "Bandy", "Bangla Sangam MN", "Bank Gothic", "BankGothic Md BT", "Baskerville",
                "Baskerville Old Face", "Batang", "BatangChe", "Bauer Bodoni", "Bauhaus 93", "Bazooka", "Bell MT", "Bembo", "Benguiat Bk BT", "Berlin Sans FB", "Berlin Sans FB Demi", "Bernard MT Condensed", "BernhardFashion BT", "BernhardMod BT", "Big Caslon", "BinnerD",
                "Blackadder ITC", "BlairMdITC TT", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bodoni MT", "Bodoni MT Black", "Bodoni MT Condensed", "Bodoni MT Poster Compressed",
                "Bookshelf Symbol 7", "Boulder", "Bradley Hand", "Bradley Hand ITC", "Bremen Bd BT", "Britannic Bold", "Broadway", "Browallia New", "BrowalliaUPC", "Brush Script MT", "Californian FB", "Calisto MT", "Calligrapher", "Candara",
                "CaslonOpnface BT", "Castellar", "Centaur", "Cezanne", "CG Omega", "CG Times", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charlesworth", "Charter Bd BT", "Charter BT", "Chaucer",
                "ChelthmITC Bk BT", "Chiller", "Clarendon", "Clarendon Condensed", "CloisterBlack BT", "Cochin", "Colonna MT", "Constantia", "Cooper Black", "Copperplate", "Copperplate Gothic", "Copperplate Gothic Bold",
                "Copperplate Gothic Light", "CopperplGoth Bd BT", "Corbel", "Cordia New", "CordiaUPC", "Cornerstone", "Coronet", "Cuckoo", "Curlz MT", "DaunPenh", "Dauphin", "David", "DB LCD Temp", "DELICIOUS", "Denmark",
                "DFKai-SB", "Didot", "DilleniaUPC", "DIN", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Edwardian Script ITC", "Elephant", "English 111 Vivace BT", "Engravers MT", "EngraversGothic BT", "Eras Bold ITC", "Eras Demi ITC", "Eras Light ITC", "Eras Medium ITC",
                "EucrosiaUPC", "Euphemia", "Euphemia UCAS", "EUROSTILE", "Exotc350 Bd BT", "FangSong", "Felix Titling", "Fixedsys", "FONTIN", "Footlight MT Light", "Forte",
                "FrankRuehl", "Fransiscan", "Freefrm721 Blk BT", "FreesiaUPC", "Freestyle Script", "French Script MT", "FrnkGothITC Bk BT", "Fruitger", "FRUTIGER",
                "Futura", "Futura Bk BT", "Futura Lt BT", "Futura Md BT", "Futura ZBlk BT", "FuturaBlack BT", "Gabriola", "Galliard BT", "Gautami", "Geeza Pro", "Geometr231 BT", "Geometr231 Hv BT", "Geometr231 Lt BT", "GeoSlab 703 Lt BT",
                "GeoSlab 703 XBd BT", "Gigi", "Gill Sans", "Gill Sans MT", "Gill Sans MT Condensed", "Gill Sans MT Ext Condensed Bold", "Gill Sans Ultra Bold", "Gill Sans Ultra Bold Condensed", "Gisha", "Gloucester MT Extra Condensed", "GOTHAM", "GOTHAM BOLD",
                "Goudy Old Style", "Goudy Stout", "GoudyHandtooled BT", "GoudyOLSt BT", "Gujarati Sangam MN", "Gulim", "GulimChe", "Gungsuh", "GungsuhChe", "Gurmukhi MN", "Haettenschweiler", "Harlow Solid Italic", "Harrington", "Heather", "Heiti SC", "Heiti TC", "HELV",
                "Herald", "High Tower Text", "Hiragino Kaku Gothic ProN", "Hiragino Mincho ProN", "Hoefler Text", "Humanst 521 Cn BT", "Humanst521 BT", "Humanst521 Lt BT", "Imprint MT Shadow", "Incised901 Bd BT", "Incised901 BT",
                "Incised901 Lt BT", "INCONSOLATA", "Informal Roman", "Informal011 BT", "INTERSTATE", "IrisUPC", "Iskoola Pota", "JasmineUPC", "Jazz LET", "Jenson", "Jester", "Jokerman", "Juice ITC", "Kabel Bk BT", "Kabel Ult BT", "Kailasa", "KaiTi", "Kalinga", "Kannada Sangam MN",
                "Kartika", "Kaufmann Bd BT", "Kaufmann BT", "Khmer UI", "KodchiangUPC", "Kokila", "Korinna BT", "Kristen ITC", "Krungthep", "Kunstler Script", "Lao UI", "Latha", "Leelawadee", "Letter Gothic", "Levenim MT", "LilyUPC", "Lithograph", "Lithograph Light", "Long Island",
                "Lydian BT", "Magneto", "Maiandra GD", "Malayalam Sangam MN", "Malgun Gothic",
                "Mangal", "Marigold", "Marion", "Marker Felt", "Market", "Marlett", "Matisse ITC", "Matura MT Script Capitals", "Meiryo", "Meiryo UI", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Tai Le",
                "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "MingLiU-ExtB", "Minion", "Minion Pro", "Miriam", "Miriam Fixed", "Mistral", "Modern", "Modern No. 20", "Mona Lisa Solid ITC TT", "Mongolian Baiti",
                "MONO", "MoolBoran", "Mrs Eaves", "MS LineDraw", "MS Mincho", "MS PMincho", "MS Reference Specialty", "MS UI Gothic", "MT Extra", "MUSEO", "MV Boli",
                "Nadeem", "Narkisim", "NEVIS", "News Gothic", "News GothicMT", "NewsGoth BT", "Niagara Engraved", "Niagara Solid", "Noteworthy", "NSimSun", "Nyala", "OCR A Extended", "Old Century", "Old English Text MT", "Onyx", "Onyx BT", "OPTIMA", "Oriya Sangam MN",
                "OSAKA", "OzHandicraft BT", "Palace Script MT", "Papyrus", "Parchment", "Party LET", "Pegasus", "Perpetua", "Perpetua Titling MT", "PetitaBold", "Pickwick", "Plantagenet Cherokee", "Playbill", "PMingLiU", "PMingLiU-ExtB",
                "Poor Richard", "Poster", "PosterBodoni BT", "PRINCETOWN LET", "Pristina", "PTBarnum BT", "Pythagoras", "Raavi", "Rage Italic", "Ravie", "Ribbon131 Bd BT", "Rockwell", "Rockwell Condensed", "Rockwell Extra Bold", "Rod", "Roman", "Sakkal Majalla",
                "Santa Fe LET", "Savoye LET", "Sceptre", "Script", "Script MT Bold", "SCRIPTINA", "Serifa", "Serifa BT", "Serifa Th BT", "ShelleyVolante BT", "Sherwood",
                "Shonar Bangla", "Showcard Gothic", "Shruti", "Signboard", "SILKSCREEN", "SimHei", "Simplified Arabic", "Simplified Arabic Fixed", "SimSun", "SimSun-ExtB", "Sinhala Sangam MN", "Sketch Rockwell", "Skia", "Small Fonts", "Snap ITC", "Snell Roundhand", "Socket",
                "Souvenir Lt BT", "Staccato222 BT", "Steamer", "Stencil", "Storybook", "Styllo", "Subway", "Swis721 BlkEx BT", "Swiss911 XCm BT", "Sylfaen", "Synchro LET", "System", "Tamil Sangam MN", "Technical", "Teletype", "Telugu Sangam MN", "Tempus Sans ITC",
                "Terminal", "Thonburi", "Traditional Arabic", "Trajan", "TRAJAN PRO", "Tristan", "Tubular", "Tunga", "Tw Cen MT", "Tw Cen MT Condensed", "Tw Cen MT Condensed Extra Bold",
                "TypoUpright BT", "Unicorn", "Univers", "Univers CE 55 Medium", "Univers Condensed", "Utsaah", "Vagabond", "Vani", "Vijaya", "Viner Hand ITC", "VisualUI", "Vivaldi", "Vladimir Script", "Vrinda", "Westminster", "WHITNEY", "Wide Latin",
                "ZapfEllipt BT", "ZapfHumnst BT", "ZapfHumnst Dm BT", "Zapfino", "Zurich BlkEx BT", "Zurich Ex BT", "ZWAdobeF"
            ];

            if(that.options.extendedJsFonts) {
                fontList = fontList.concat(extendedFontList);
            }

            fontList = fontList.concat(that.options.userDefinedFonts);
            var testString = "mmmmmmmmmmlli";
            var testSize = "72px";
            var baseFontsDiv = document.createElement("div");
            var fontsDiv = document.createElement("div");
            var h = document.getElementsByTagName("body")[0];
            var defaultWidth = {};
            var defaultHeight = {};
            var createSpan = function() {
                var s = document.createElement("span");
                s.style.position = "absolute";
                s.style.left = "-9999px";
                s.style.fontSize = testSize;
                s.style.lineHeight = "normal";
                s.innerHTML = testString;
                return s;
            };
            var createSpanWithFonts = function(fontToDetect, baseFont) {
                var s = createSpan();
                s.style.fontFamily = "'" + fontToDetect + "'," + baseFont;
                return s;
            };
            var initializeBaseFontsSpans = function() {
                var spans = [];
                for(var index = 0, length = baseFonts.length; index < length; index++) {
                    var s = createSpan();
                    s.style.fontFamily = baseFonts[index];
                    baseFontsDiv.appendChild(s);
                    spans.push(s);
                }
                return spans;
            };
            var initializeFontsSpans = function() {
                var spans = {};
                for(var i = 0, l = fontList.length; i < l; i++) {
                    var fontSpans = [];
                    for(var j = 0, numDefaultFonts = baseFonts.length; j < numDefaultFonts; j++) {
                        var s = createSpanWithFonts(fontList[i], baseFonts[j]);
                        fontsDiv.appendChild(s);
                        fontSpans.push(s);
                    }
                    spans[fontList[i]] = fontSpans;
                }
                return spans;
            };
            var isFontAvailable = function(fontSpans) {
                var detected = false;
                for(var i = 0; i < baseFonts.length; i++) {
                    detected = (fontSpans[i].offsetWidth !== defaultWidth[baseFonts[i]] || fontSpans[i].offsetHeight !== defaultHeight[baseFonts[i]]);
                    if(detected) {
                        return detected;
                    }
                }
                return detected;
            };

            var baseFontsSpans = initializeBaseFontsSpans();

            h.appendChild(baseFontsDiv);

            for(var index = 0, length = baseFonts.length; index < length; index++) {
                defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth;
                defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight;
            }
            var fontsSpans = initializeFontsSpans();

            h.appendChild(fontsDiv);

            var available = [];

            for(var i = 0, l = fontList.length; i < l; i++) {
                if(isFontAvailable(fontsSpans[fontList[i]])) {
                    available.push(fontList[i]);
                }
            }

            h.removeChild(fontsDiv);
            h.removeChild(baseFontsDiv);

            keys.push({
                key: "js_fonts",
                value: available
            });
            return done(keys);
        },
        getJsFontsKey: function() {
            var fontsList = [];
            return this.jsFontsKey(fontsList, function() {
                return fontsList[0]["value"];
            });
        },
        getTimestamp: function() {
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();
            var day = now.getDay();
            var hour = now.getHours();
            var minu = now.getMinutes();
            var sec = now.getSeconds();
            var time = "";
            time = year + "-" + month + "-" + date + " " + hour + ":" + minu + ":" + sec;
            return(time);
        },
        hasSwfObjectLoaded: function() {
            return typeof window.swfobject !== "undefined";
        },
        bin2hex: function() {
            var i, l, o = "", n, s;
            s += "";
            for (i = 0, l = s.length; i < l; i++) {
                n = s.charCodeAt(i).toString(16)
                o += n.length < 2 ? "0" + n : n;
            }
            return o;
        },
        strToHexCharCode: function(str) {
            if(str === "")
                return "";
            var hexCharCode = [];
            for(var i = 0; i < str.length; i++) {
                hexCharCode.push((str.charCodeAt(i)).toString(16));
            }
            return hexCharCode.join("");
        },
        generateUUID: function() {
            var cookieUUID = this.getUUIDCookie();
            if(cookieUUID == null) {
                var d = new Date().getTime();
                var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = (d + Math.random()*16)%16 | 0;
                    d = Math.floor(d/16);
                    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
                });
                // 标示新版本的js
                uuid = "unique-test-"+uuid;
                this.setUUIDCookie(uuid);
                return uuid;
            }else {
                return cookieUUID;
            }
        },
        setUUIDCookie: function(uuid) {
            document.cookie = "ga_uuid" + "="+ escape (uuid);
        },
        getUUIDCookie: function() {
            var arr,reg = new RegExp("(^| )" + "ga_uuid" + "=([^;]*)(;|$)");
            if(arr = document.cookie.match(reg))
                return unescape(arr[2]);
            else
                return null;
        },
        // cookie支持
        cookiecheck:function(){
            if(window.navigator.cookieEnabled)
                return true;
            else{
                return false;
            }
        },
        // 判断IE版本
        checkIE:function(){
            var browser=navigator.appName
            var b_version=navigator.appVersion
            var version=b_version.split(";");
            var trim_Version=version[1].replace(/[ ]/g,"");
            if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE6.0")
            {
                //alert("IE 6.0");
            }
            else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE7.0")
            {
                //alert("IE 7.0");
            }
            else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE8.0")
            {
                //alert("IE 8.0");
            }
            else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE9.0")
            {
                //alert("IE 9.0");
            }
        },
        CanvasTest:  function() {
            var canvasData = "Not supported";
            var canvas = document.createElement('canvas');
            var canvasContext = canvas.getContext("2d");
            canvasContext.textBaseline = "alphabetic";
            canvasContext.fillStyle = "#f60";
            canvasContext.fillRect(125, 1, 62, 20);
            canvasContext.fillStyle = "#069";
            canvasContext.font = "11pt no-real-font-123";
            canvasContext.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
            canvasContext.fillStyle = "rgba(102, 204, 0, 0.7)";
            canvasContext.font = "18pt Arial";
            canvasContext.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);
            canvasData = canvas.toDataURL();
            var b64 = canvasData.replace("data:image/png;base64,","");
            // var bin = atob(b64);
            var crc = this.bin2hex(b64.slice());
            return crc;
        },
        //touch支持
        getTouchSupport: function () {
            var maxTouchPoints = 0;
            var touchEvent = false;
            if(typeof navigator.maxTouchPoints !== "undefined") {
                maxTouchPoints = navigator.maxTouchPoints;
            } else if (typeof navigator.msMaxTouchPoints !== "undefined") {
                maxTouchPoints = navigator.msMaxTouchPoints;
            }
            try {
                document.createEvent("TouchEvent");
                touchEvent = true;
            } catch(_) { /* squelch */ }
            var touchStart = "ontouchstart" in window;
            return ['Max touchpoints:'+maxTouchPoints,'TouchEvent supported:'+touchEvent,'onTouchStart supported:'+ touchStart];
        },
        getBrowserInfo: function(clientID, result, system) {
            var JsFontval = this.getJsFontsKey().toString();
            var FlashFontval = this.getFlashFontsKey().toString();
            var JsFont = JsFontval.split(",");
            var FlashFont = FlashFontval.split(",");
            var getJsFontsKey = "[";
            var getFlashFontsKey = "[";
            for(var i = 0; i < JsFont.length; i++) {
                getJsFontsKey += '"' + JsFont[i] + '",';
            };
            getJsFontsKey = getJsFontsKey.substring(0, getJsFontsKey.length - 1) + "]";
            for(var i = 0; i < FlashFont.length; i++) {
                getFlashFontsKey += '"' + FlashFont[i] + '",';
            };
            getFlashFontsKey = getFlashFontsKey.substring(0, getFlashFontsKey.length - 1) + "]";
            if(navigator.appName == "Microsoft Internet Explorer"&&parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE",""))<9){
                var v20=""
                var v22 = ""

            }else{
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var txt = 'http://www.idss-cn.com/';
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.textBaseline = "tencent";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125,1,62,20);
                ctx.fillStyle = "#069";
                ctx.fillText(txt, 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText(txt, 4, 17);

                var b64 = canvas.toDataURL().replace("data:image/png;base64,","");
                // var bin = atob(b64);
                var crc = this.bin2hex(b64.slice(-16,-12));
                var v20 =this.CanvasTest()
                var v22 = result;

            }

            if(navigator.userAgent.indexOf("Safari")>-1) {
                var v7 = '';
                var v8 = '';
            } else {
                var v7 = this.hasSessionStorage();
                var v8 = this.hasLocalStorage();
                //console.log('no'+v7)
                //console.log('no'+v8)
            }
            // 获取用户代理信息
            var v1 = this.getUserAgent();
            //浏览器语言
            var v2 = this.getLanguageKey();
            // screen size and color depth
            var v3 = this.getColorDepthKey();
            var v4 = this.getScreenWidth();
            var v5 = this.getScreenHeight();
            // 获取时区
            var v6 = this.getTimezoneOffsetKey();
            // sessionStorage localStorage

            var v9 = this.hasIndexedDB();
            var v10 = this.getAddBehaviorKey();
            var v11 = this.getOpenDatabaseKey();
            var v12 = this.getNavigatorCpuClass();
            // 获取平台信息
            var v13 = this.getNavigatorPlatform();
            // doNotTrack
            var v14 = this.getDoNotTrack();
            var v15 = getFlashFontsKey;
            // 获取系统字体
            var v16 = getJsFontsKey;
            var v17 = this.getTimestamp();
            // 获取插件信息 1
            var v18 =[];
            for(var i=0;i<this.getPlugins()[0].value.length;i++){
                v18.push('"'+this.getPlugins()[0].value[i]+'"')
            }
            v18="["+v18.toString()+"]"
            // // var v18 =this.getPlugins()[0].value;

            // console.log(typeof v18)
            // var v18 =JSON.stringify(this.getPlugins()[0].value);
            // var v18 =this.getPlugins()[0].value;

            // 是否支持cookie
            var v19 =this.cookiecheck()

            // var v21 = JSON.stringify(this.getTouchSupport())
            var v21 =[];
            for(var i=0;i<this.getTouchSupport().length;i++){
                v21.push('"'+this.getTouchSupport()[i]+'"')
            }
            v21="["+v21.toString()+"]"
            var arr = new Array(22);
            arr[0] = "sdkVersion" + "1.2.0";
            arr[1] = "language" + v2;
            arr[2] = "colorDepth" + v3;
            arr[3] = "screenWidth" + v4;
            arr[4] = "screenHeight" + v5;
            arr[5] = "timezone" + v6;
            arr[6] = "enableSessionStore" + v7;
            arr[7] = "enableLocateStore" + v8;
            arr[8] = "enableDBIndex" + v9;
            arr[9] = "enableIEAB" + v10;
            arr[10] = "enableOpenDB" + v11;
            arr[11] = "cpuInfo" + v12;
            arr[12] = "platform" + v13;
            arr[13] = "DNT" + v14;
            arr[14] = "flashFontList" + v15;
            arr[15] = "sysFontList" + v16;
            arr[16] = "plugins"+ v18;
            arr[17] = "enableCookie"+ v19;
            arr[18] = "webgl"+v20;
            arr[19] = "touchSupport"+v21;
            arr[20] = "crc" + v22;
            arr[21] = "useragent" + v1;

            //arr.sort();
            var arrString = arr.join("");
            var v23 = MD5("djT&#m23d4i@1#2D" + arrString+"timestamp" + v17);
            return '{"sdkVersion":"1.2.0","language":"' + v2 +
                '","timestamp":"' +v17+
                '","colorDepth":' + v3 +
                ',"screenWidth":' + v4 +
                ',"screenHeight":' + v5 +
                ',"timezone":"' + v6 +
                '","enableSessionStore":"' + v7 +
                '","enableLocateStore":"' + v8 +
                '","enableDBIndex":"' + v9 +
                '","enableIEAB":"' + v10 +
                '","enableOpenDB":"' + v11 +
                '","cpuInfo":"' + v12 +
                '","platform":"' + v13 +
                '","DNT":"' + v14 +
                '","flashFontList":' + v15 +
                ',"sysFontList":' + v16 +
                ',"plugins":' + v18 +
                ',"enableCookie":"' + v19 +
                '","webgl":"' + v20 +
                '","touchSupport":' + v21 +
                ',"signature":"' + v23 +
                '","clientID":"' + clientID +
                '","crc":"' + v22 +
                '","useragent":"' + v1 +
                '","system":"' + system +
                '"}';
        },
        picking: function(apiurl, clientID, system, result) {
            var json = this.getBrowserInfo(clientID, result, system);
            //console.log(this.getPlugins()[0].value)
            //document.getElementById("data").innerHTML=json
            $.ajax({
                type: 'get',
                url: apiurl,
                dataType: 'jsonp',
                data: {
                    "json": json
                },
                jsonp: "callback",
                success: function(data) {
                    console.log(data.fingerprint);
                    //document.getElementById("data").innerHTML=data.fingerprint;
                },
                error: function() {
                    console.log("error");
                }
            });
        }
    };
    return new GuanAnFingerBaseInfo();
});

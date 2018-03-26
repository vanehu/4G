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
			keys = this.sessionStorageKey(keys);
			keys = this.localStorageKey(keys);
			keys = this.indexedDbKey(keys);
			keys = this.addBehaviorKey(keys);
			keys = this.openDatabaseKey(keys);
			keys = this.cpuClassKey(keys);
			keys = this.platformKey(keys);
			keys = this.doNotTrackKey(keys);
			keys = this.pluginsKey(keys);
			keys = this.canvasKey(keys);
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
		hasLocalStorage: function() {
			if(window.localStorage) {
				return 'true';
			} else {
				return 'false';
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
						value: "请检查是否配置了检测Flash字体！"
					});
				}
				return done(keys);
			}
			if(!this.hasSwfObjectLoaded()) {
				if(typeof NODEBUG === "undefined") {
					keys.push({
						key: "swf_fonts",
						value: "未检测到Flash字体，跳过！"
					});
				}
				return done(keys);
			}
			if(!this.hasMinFlashInstalled()) {
				if(typeof NODEBUG === "undefined") {
					keys.push({
						key: "swf_fonts",
						value: "未安装flash，跳过字体检测！"
					});
				}
				return done(keys);
			}
			if(typeof this.options.swfPath === "undefined") {
				if(typeof NODEBUG === "undefined") {
					keys.push({
						key: "swf_fonts",
						value: "Flash文件路径错误！"
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
		getBrowserInfo: function(cookieid, result) {
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

			var v1 = this.getUserAgent();
			var v2 = this.getLanguageKey();
			var v3 = this.getColorDepthKey();
			var v4 = this.getScreenWidth();
			var v5 = this.getScreenHeight();
			var v6 = this.getTimezoneOffsetKey();
			var v7 = this.hasSessionStorage();
			var v8 = this.hasLocalStorage();
			var v9 = this.hasIndexedDB();
			var v10 = this.getAddBehaviorKey();
			var v11 = this.getOpenDatabaseKey();
			var v12 = this.getNavigatorCpuClass();
			var v13 = this.getNavigatorPlatform();
			var v14 = this.getDoNotTrack();
			var v15 = getFlashFontsKey;
			var v16 = getJsFontsKey;
			var v17 = this.getTimestamp();

			/*
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
			var bin = atob(b64);
			var crc = this.bin2hex(bin.slice(-16,-12));
			*/
			var v18 = result;

			var arr = new Array(18);
			arr[0] = "sdkVersion" + "1.0.0";
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
			arr[13] = "enableDoNotTrack" + v14;
			arr[14] = "flashFontList" + v15;
			arr[15] = "sysFontList" + v16;
			arr[16] = "crc" + v18;
			arr[17] = "useragent" + v1;

			arr.sort();
			var arrString = arr.join("");
			/*
            window.console && window.console.log && console.log("timestamp" + v17 + "djT&#m23d4i@1#2D" + arrString);
			*/
			var v19 = MD5("timestamp" + v17 + "djT&#m23d4i@1#2D" + arrString);
            /*
            window.console && window.console.log && console.log('{"sdkVersion":"1.0.0","language":"' + v2 + '","colorDepth":' + v3 + ',"screenWidth":' + v4 + ',"screenHeight":' + v5 + ',"timezone":"' + v6 + '","enableSessionStore":"' + v7 + '","enableLocateStore":"' + v8 + '","enableDBIndex":"' + v9 + '","enableIEAB":"' + v10 + '","enableOpenDB":"' + v11 + '","cpuInfo":"' + v12 + '","platform":"' + v13 + '","enableDoNotTrack":"' + v14 + '","flashFontList":' + v15 + ',"sysFontList":' + v16 + ',"timestamp":"' + v17 + '","signature":"' + v19 + '","cookieid":"' + cookieid + '","crc":"' + v18 + '","useragent":"' + v1 + '"}');
			*/
			return '{"sdkVersion":"1.0.0","language":"' + v2 + '","colorDepth":' + v3 + ',"screenWidth":' + v4 + ',"screenHeight":' + v5 + ',"timezone":"' + v6 + '","enableSessionStore":"' + v7 + '","enableLocateStore":"' + v8 + '","enableDBIndex":"' + v9 + '","enableIEAB":"' + v10 + '","enableOpenDB":"' + v11 + '","cpuInfo":"' + v12 + '","platform":"' + v13 + '","enableDoNotTrack":"' + v14 + '","flashFontList":' + v15 + ',"sysFontList":' + v16 + ',"timestamp":"' + v17 + '","signature":"' + v19 + '","cookieid":"' + cookieid + '","crc":"' + v18 + '","useragent":"' + v1 + '"}';
		},
		picking: function(apiurl, cookieid, result) {
			var json = this.getBrowserInfo(cookieid, result);
			$.ajax({
				type: 'get',
				url: apiurl,
				dataType: 'jsonp',
				data: {
					"json": json
				},
				jsonp: "callback",
				success: function(data) {
				},
				error: function() {
				}
			});
		}
	};
	return new GuanAnFingerBaseInfo();
});

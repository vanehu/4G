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
	},
	
	/** 判断是否ie浏览器*/
	isIE : function() {
		if (!!window.ActiveXObject || "ActiveXObject" in window)
			return true;
		else
			return false;
	},

	/** 获取浏览器版本*/
	validateBrowser : function() {
		var browserVersion = "";
		// var version = $.browser.version.substring(0, $.browser.version.indexOf("."));
		var version = $.browser.version;
		if (CommonUtils.isIE()) {
			browserVersion = "IE" + version;
		} else if ($.browser.mozilla) {
			browserVersion = "Firefox" + version;
		} else if ($.browser.safari) {
			var agent = navigator.userAgent.toLowerCase();
			var regStr_chrome = /(?:chrome|crios|crmo)\/([0-9.]+)/gi;
			var chromeVer = agent.match(regStr_chrome);
			if (chromeVer) {
				var verArr = chromeVer[0].split("/");
				var chrome_version = verArr[1].split(".");
				browserVersion = "Chrome" + chrome_version[0];
			}
		}
		return browserVersion;
	},

    /**
     * 获取字符显示长度，中文记两个长度，非中文记一个长度
     * @param str 要计算的字符串
     * @return number
     */
    getLength: function (str) {
        var chinese = 0XFF00;
        var retValue = 0;
        if (undefined == str || "" == str) {
            return 0;
        }
        var len = str.length;
        for (var i = 0; i < len; i++) {
            if ((chinese & str.charCodeAt(i)) != 0) {
                retValue += 2;
            } else {
                retValue++;
            }
        }
        return retValue;
    },
    
    /**
     *获取浏览器插件列表
     */
	getPlugins: function(){
    	var plugins = new Array();
    	var pluginList = window.navigator.plugins;
    	for(var i = 0, length = pluginList.length; i < length; i++){
    		plugins.push({
    			"name"			:pluginList[i].name,
    			"fileName"		:pluginList[i].filename,
    			"description"	:pluginList[i].description
    		});
    	}
    	return plugins;
     },

    /**
	*获取浏览器插件列表(IE)
	*/
	getIEPlugins : function(){
		return [];
	},

	/**
	*获取cookie列表
	*/
	getCookies: function(){
		 var cookies = [];

	 	if(document.cookie.length > 0){
	 		var cookieList = document.cookie.split(";");
	 		for(var i = 0, length = cookieList.length; i < length; i++){
	 			var smallCookie = cookieList[i].split("=");
				cookies.push({
					"key"	:smallCookie[0],
					"value"	:unescape(smallCookie[1])
				});
			}
	 	}

	 	var cookie = {
			"cookieEnabled":window.navigator.cookieEnabled,
			"cookies":cookies
		};

		return cookie;
	 },

	getClientOS: function(isIE){
	 	var os = "";//操作系统名称
	 	var osBit = "";//操作系统是32位或64位
	 	var browserBit = "";//浏览器是32位或64位
		var userAgentStr = window.navigator.userAgent.toLowerCase();

		if(userAgentStr.indexOf("nt 6.2") > -1){
			os = "Windows 8";
		} else if(userAgentStr.indexOf("nt 6.1") > -1){
			os = "Windows 7";
		} else if(userAgentStr.indexOf("nt 6.0") > -1){
			os = "Vista";
		} else if(userAgentStr.indexOf("nt 5.2") > -1){
			os = "Windows 2003";
		} else if(userAgentStr.indexOf("nt 5.1") > -1){
			os = "Windows XP";
		} else if (userAgentStr.indexOf("macintosh") != -1 || userAgentStr.indexOf("mac os x") != -1) {
			os = "Mac OS";
		} else if(userAgentStr.indexOf("linux") > -1){
			os = "Linux";
		} else if(userAgentStr.indexOf("X11") > -1){
			os = "Unix";
		}

		if(userAgentStr.indexOf("win64") > -1 || userAgentStr.indexOf("wow64") > -1){
			osBit = "x64";
		} else {
			osBit = "x32";
		}

		if(!!isIE){
			browserBit = window.navigator.cpuClass.toLowerCase();
		} else{
			if(userAgentStr.indexOf("x64") > -1){
				browserBit = "x64";
			} else{
				browserBit = "x32";
			}
		}

		var clientOS = {
			"os"		:os,
			"osBit"		:osBit,
			"browserBit":browserBit
		};

		return clientOS;
	},
	
	/** 
	*获取浏览器信息，包括浏览器品牌、版本号、插件支持情况、文本模式(IE)等完整信息
	*/
	getBrowserInfos: function() {
		var plugins 		= "";//插件列表
		var clientOS 		= {};//客户端信息(操作系统等)
		var browserMode		= "";//浏览器模式(IE)
		var documentMode	= "";//文本模式(IE)
		var browserBrand	= "";//浏览器
		var browserVersion	= "";//浏览器版本号

		var cookie 			= CommonUtils.getCookies();
		var vendor 			= window.navigator.vendor;//浏览器厂商
		var language 		= window.navigator.language;//浏览器语言
		var userAgentStr 	= window.navigator.userAgent.toLowerCase();

		//IE
		if(userAgentStr.indexOf("msie") != -1 && !window.opera){
			browserMode 	= ((navigator.appVersion.split(";"))[1]).replace(/[ ]/g,"");
			documentMode 	= document.documentMode;
			clientOS 		= CommonUtils.getClientOS(true);
		}
		//Firefox
		else if (userAgentStr.indexOf("firefox") >= 0) {
			browserVersion	= userAgentStr.match(/firefox\/([\d.]+)/)[1];
			browserBrand 	= "Firefox";
			plugins 		= CommonUtils.getPlugins();
			clientOS 		= CommonUtils.getClientOS();
		}
		//Chrome
		else if (userAgentStr.indexOf("chrome") >= 0) {
			browserVersion	= userAgentStr.match(/chrome\/([\d.]+)/)[1];
			browserBrand 	= "Chrome";
			plugins 		= CommonUtils.getPlugins();
			clientOS 		= CommonUtils.getClientOS();
		}
		//Opera
		else if (userAgentStr.indexOf("opera") >= 0) {
			browserVersion 	= userAgentStr.match(/opera.([\d.]+)/)[1];
			browserBrand 	= "Opera";
			plugins 		= CommonUtils.getPlugins();
			clientOS 		= CommonUtils.getClientOS();
		}
		//Safari
		else if (userAgentStr.indexOf("safari") >= 0) {
			browserVersion	= userAgentStr.match(/version\/([\d.]+)/)[1];
			browserBrand	= "Safari";
			plugins 		= CommonUtils.getPlugins();
			clientOS 		= CommonUtils.getClientOS();
		}
		//Other
		else {
			browserBrand	= "(可能是个假浏览器O(∩_∩)O~)";
			plugins 		= CommonUtils.getPlugins();
			clientOS 		= CommonUtils.getClientOS();
		}

		var browserInfos = {
			"vendor"		:vendor,
			"cookie"		:cookie,
			"plugins"		:plugins,
			"language"		:language,
			"clientOS"		:clientOS,
			"browserMode"	:browserMode,
			"documentMode"	:documentMode,
			"browserBrand"	:browserBrand,
			"browserVersion":browserVersion
		};
		
		return browserInfos;
	},

	getCookieFromJava : function(param) {
		var result = $.getCookie(param, true);
		result = result == null ? "" : result;

		return result;
	}
};

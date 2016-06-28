/**
 * 用户登录
 * 
 * @author wukf
 */
CommonUtils.regNamespace("staff", "login");
/**
 * 员工登录
 */
staff.login = (function($) {
	//update by huangjj3 清空cookie #23633
	 var cookies = document.cookie.split(";");

	for (var i = 0; i < cookies.length; i++) {
		 var cookie = cookies[i];
		 var eqPos = cookie.indexOf("=");
		 var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
		 //document.cookie = name + new Date();
		 var nameT = name.toUpperCase();
		 if(nameT.indexOf("LTEA10")>=0){
			var date = new Date();  
			date.setTime(date.getTime()+(-1*1000));  
			var expires = "; expires="+date.toGMTString();  
			document.cookie = name+"="+escape("")+expires+"; path=/"; 
		 }
	 }
	 
	
	var login_flg=false; //是否出于登录状态
	
	//登录表单验证通过事件
	var _loginFormIsValid = function(event, form) {		
		var fid = $("#store-selector-text").attr("area-id");
		var reg = /^[0-9]+$/;
		if(!reg.test(fid)){
			$.alert("提示","请先选择省份。");
			_setEnable("#button", "#loginForm");
			return;
		}
		var areaName = "";
		if( fid== "8110000" || fid == "8310000" || fid == "8120000" || fid == "8500000") {//直辖市地区为空			
		}else{
			areaName = $("#stock_city_item ul li a[data-value="+fid+"]").text();
		}
		var provinceName = $("#stock_province_item ul li a[data-value^="+fid.substring(0, 3)+"]").text();
		var province = _getAreaName(fid); //省份拼音
		_getVersion(province,areaName,provinceName,fid);
	};
	
	//获取版本
	var _getVersion = function(province,areaName,provinceName,fid){
		var date = new Date();
		var time = date.getFullYear()+""+(Number(date.getMonth())+1)+""+date.getDate()+""+date.getHours()+""+date.getMinutes()+""+date.getSeconds();
		$.ajax({
		    type: "get",
		    dataType: "json",
		    url: "login",
		    data: {"province":province,"_":time},
		    success: function (response) {
		    	var provVersion = response.provVersion;
		    	var provDomain =  response.provDomain;
		    	if(provVersion == "9"){
		    		alert("版本号获取失败[provVersion:"+provVersion+"]，请检查配置文件。");
		    		return;
		    	}
		    	if(provDomain == null || provDomain == "")
		    		provDomain = window.location.hostname;
		    	if(provVersion!="9"){
		    		var version = provVersion;
		    		var httpconfig = "http";
		    		if(version=="81" || version=="82"){
		    			httpconfig = "http";
		    		}else if(version=="83" || version=="84"){
		    			httpconfig ="https";
		    		}else if(version=="93" || version=="94"){
		    			httpconfig = "https";
		    		}
		    		var staffCode = $("#staffCode").val();
		    		var password = $("#password").val();
		    		password = MD5(password);
		    		var staffProvCode = $("#store-selector-text").attr("area-id");
		    		var url = httpconfig+"://"+provDomain+":"+version+"/provPortal/staff/login/page?areaId="+staffProvCode+"&areaName="+areaName
		    	    +"&provinceName="+provinceName+"&staffCode="+staffCode+"&password="+password+"&prov="+province;
		    		window.location = url;
		    	}
		    }
		});
	};
	//忘记密码 - 链接
	var _getPasswordUrl = function(){
		$.ajax({
		    type: "get",
		    dataType: "json",
		    url: "password",
		    data: {},
		    success: function (res) {
		    	if(res!="9"){
		    		var version = res;
		    		var httpconfig = "https";
		    		if(version=="81" || version=="82"){
		    			httpconfig = "http";
		    		}else if(version=="83" || version=="84"){
		    			httpconfig ="https";
		    		}
		    		var url = httpconfig+"://"+window.location.hostname+":"+version+"/provPortal/passwordMgr/updatePwd";
		    		window.location = url;
		    	}
		    }
		});
	};
	//登录页面初始化表单元素校验
	var _form_valid_init = function() {
		login_flg=false;
		document.onkeydown = function(event){
			var ev = event ? event : (window.event ? window.event : null);
			if(ev.keyCode==13) {
				if ($(".ZebraDialog").length > 0) {
					$(".ZebraDialog").click();
				} else if(!login_flg){
					$("#loginForm #button").click();
				} 
				return false;
			}
		};
		var isAllowBrower = validateBrowser();//判断浏览器
		if(isAllowBrower){
			$('#loginForm').bind('formIsValid', _loginFormIsValid).ketchup({bindElement:"button"});
		}else{
			alert("由于您使用的浏览器版本不兼容，请使用以下浏览器版本：IE7,IE8,IE9,IE10;Firefox12.0+;Chrome21.0+，再重新登录系统。");
		}
		$("#resetBtn").click(function(){
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#loginForm"));
			$("#staffCode").val("");
			$("#password").val("");
			$("#vali_code_input").val("");
		});		
		_getMac();
	};
	
	var _getMac=function(){
		try{		
			macFlag=true;
		}catch(e){		
			 window.location.href=contextPath+"/file/telcom.exe";
		}
	};
	
	//判断浏览器版本
	var validateBrowser=function(){
		var allowflag = false;
		var version = $.browser.version;
		if ($.browser.msie) {
			if(version>=7)
				allowflag = true;
		}else if ($.browser.mozilla) {
			if(version>=12)
				allowflag = true;
		}else if($.browser.safari){
			var agent = navigator.userAgent.toLowerCase() ;
			var regStr_chrome = /(?:chrome|crios|crmo)\/([0-9.]+)/gi ;
			var chromeVer = agent.match(regStr_chrome);
			if(chromeVer){
				var verArr = chromeVer[0].split("/");
				var chrome_version = verArr[1].split(".");
				if(chrome_version[0]>=21){
					allowflag = true;
				}
			}
		}
		return allowflag;
	};
	
	//获取地区名称
	_getAreaName = function(areaId){
		areaId = areaId.substring(0, 3);
		var areaName = "";
		switch(areaId){
			case "811": areaName = "beijing";  break;
			case "812": areaName = "tianjing"; break;
			case "814": areaName = "shxi"; break;
			case "815": areaName = "neimenggu"; break;
			case "821": areaName = "liaoning"; break;
			case "822": areaName = "jilin"; break;
			case "835": areaName = "fujian";  break;
			case "843": areaName = "hunan"; break;
			case "850": areaName = "chongqing"; break;
			case "852": areaName = "guizhou"; break;
			case "853": areaName = "yunnan"; break;
			case "854": areaName = "xizang"; break;	
			case "863": areaName = "qinghai";  break;
			case "864": areaName = "ningxia"; break;
			case "865": areaName = "xinjiang"; break;
			case "844": areaName = "guangdong"; break;
			case "832": areaName = "jiangsu"; break;
			case "851": areaName = "sichuang"; break;	
			case "833": areaName = "zhejiang";  break;
			case "834": areaName = "anhui"; break;
			case "861": areaName = "shanxi"; break;
			case "842": areaName = "hubei"; break;
			case "831": areaName = "shanghai"; break;
			case "813": areaName = "hebei"; break;
			case "837": areaName = "shandong";  break;
			case "845": areaName = "guangxi"; break;
			case "841": areaName = "henan"; break;
			case "862": areaName = "gansu"; break;
			case "836": areaName = "jiangxi"; break;
			case "846": areaName = "hainan"; break;
			case "823": areaName = "heilongjiang"; break;
			case "899": areaName = "xuni"; break;
		}
		return areaName;
	};
	// 要暴露出的公共方法
	return {
		form_valid_init : _form_valid_init,
		getPasswordUrl : _getPasswordUrl
	};
})(jQuery);

$(function() {
	staff.login.form_valid_init();
});




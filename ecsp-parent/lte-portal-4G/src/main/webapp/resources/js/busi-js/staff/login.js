/**
 * 用户登录
 * 
 * @author tang
 */
CommonUtils.regNamespace("staff", "login");
/**
 * 员工登录
 */
staff.login = (function($) {
	//update by huangjj3 清空cookie #23633
	/** var cookies = document.cookie.split(";");

	for (var i = 0; i < cookies.length; i++) {
		 var cookie = cookies[i];
		 var eqPos = cookie.indexOf("=");
		 var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
		 //document.cookie = name + new Date();
		 var nameT = name.toUpperCase();
		 if(nameT.indexOf("LTEA10")>=0){
			 $.cookie(name, null, { path: '/' });
		 }
	 }
	 */

	//记录staffId
	var staffId =null;
	//是否出于登录状态
	var login_flg=false;
	//短信验证码验证错误次数
	var smsErrorCount=0;
	//mac地址
	var macAddress="";
	var macFlag=false;
	var isUnifyLogin = false; //是否统一登陆
	//var isQRLogin = false; //是否二维码扫描登录
	//var qrLoginParam = {};
	var unifyLoginUrl = "http://"+window.location.hostname+":80/ltePortal/" ; //"http://crm.189.cn/ltePortal/"; //统一登陆地址
	//工号密码校验成功回调函数
	var callBack_success_login=function(response){
		if(response.code == 0) {
			if (response.data.data == 'N') {
				_smsFormIsValid();
				login_flg=true;
				_setEnable("#smsbutton", "#loginSmsForm");
				return;
			}
			easyDialog.open({
				container : 'SMS'
			});
			//置空短信校验码框
			$("#smspwd").val("").removeClass("ketchup-input-error");
			$("#smsresend").off("click").removeClass("cn").addClass("cf");
			if(response.data.msgnumber == 5590){
				$(".randomCode").show();
				$("#num .txtnum").attr("value",response.data.randomCode);
			}
			
			//重新发送验证码成功后,验证错误次数置0.
			smsErrorCount=0;
			//重新发送验证码成功后,验证码有效期初始化5分钟.
			sendSmsAfter30s();
			//5分钟倒计时，超过5分钟未输入验证码就失效.
			leftInvalidTime=300;
			invalidAfter5Mins();
			$("#smspwd").focus();
			login_flg=true;
		//用户入参合法性校验数错
		} else if (response.code ==1001){
			ec.util.showErrors(response.errorsList,$("#loginForm"));
			if($("#validatecode_li").attr("code")=="1"){
				_refreshValidateCodeImg();
				$("#validatecode_li").show();
				$("#login_tip_span").show();
			}
			
		//参数业务校验不通过
		} else if (response.code ==1004){
			if(response.data && response.data.image_code=="1"){
				$("#validatecode_li").show();
				$("#login_tip_span").show();
				_refreshValidateCodeImg();
			}
			$.alert('失败', 
					'<br/><strong>'+response.data.message+'</strong>',
					'error',staff.login.goback);
			
		//验证码不对通过
		} else if (response.code == 1005){
			$("#validatecode_li").show();
			$("#login_tip_span").show();
			_refreshValidateCodeImg();
			ec.util.showErrors(response.errorsList,$("#loginForm"));
			$.alert("失败", "<br>验证码不正确", 'error');
		} else if (response.code == -2) {
			$.alertM(response.data,staff.login.goback);
		} else if (response.code == 3) {
			//短信发送异常
			$.alert("提示",response.data,"error",staff.login.goback);
		//密码为初始密码，必须修改才能登录
		} else if(response.code == 14 || response.code == 11) {
			staffId = response.data.staffId;
			$("#tipMessage").text(response.data.tipMessage);
			$("#newPassword").val("");
			$("#confirm_password").val("");
			easyDialog.open({
				container : 'PWC'
			});	
		// 工号实名制校验
		} else if (response.code == 20) {
			$.alert("提示", response.data);
		} else{
			if(response.errorsList&& response.errorsList.length>0 ){
				$.alert("提示",response.errorsList[0].message,"error",staff.login.goback);
			} else {
				$.alert("提示",response.data,"error",staff.login.goback);
			}
			if($("#validatecode_li").is(":visible")){
				_refreshValidateCodeImg();
			}
		}
		_setEnable("#button", "#loginForm");
		/*if(response.code != 0 && response.code != 14) {
			if(isUnifyLogin){
				window.location = unifyLoginUrl;
				isUnifyLogin = false;
			}else{
				_setEnable("#button", "#loginForm");
			}
		}else{
			_setEnable("#button", "#loginForm");
		}*/
	};
	
	
	//短信发送成功回调函数
	var callBack_success_sms =function(response){
		if (response.code == 0) {
			//返回的url是单点登录用的，用iframe同步请求单点服务器，设置cookie。如果没有配置url，那么就直接跳转。
//			if(response.data.url&&response.data.url!=null&&response.data.url.length>0){
//				var src=response.data.url+"?token="+response.data.token+"&areaId="+response.data.areaId;
//				$("body").append("<iframe style='display: none'; src='"+src+"' onload='staff.login.redirectUrl();'></iframe>");
//				staff.login.redirectUrl();
//			}else{
				staff.login.redirectUrl();
//			}
		//用户入参合法性校验数错
		} else if (response.code == -2) {
			$.alertM(response.data);
			
		} else if (response.code ==1001){
			ec.util.showErrors(response.errorsList,$("#loginSmsForm"));
		//参数业务校验不通过
		} else if (response.code ==1004){	
			ec.util.showErrors(response.errorsList,$("#loginSmsForm"));
		} else if (response.code ==1202){
			$.confirm("信息",response.data
					,{yes:function(
			){
				window.location.href=contextPath+"/staff/login/page";
			},no:""});
		}else if(response.code==1){
			smsErrorCount=smsErrorCount+1;
			$.alert("提示",response.data);
		} else if (response.code == 1002) {
			$.alert('失败', 
					'<br/><strong>'+response.data.mess+'</strong>',
					'error',staff.login.goback);
		}else {
			if(response.errorsList&& response.errorsList.length>0 ){
				$.alert("提示",response.errorsList[0].message);
			} else {
				$.alert("提示",response.data);
			}
		}
		_setEnable("#smsbutton", "#loginSmsForm");
	};
	var _setDisable = function(id, form){
		$(id).attr("disabled", true);
		if (form == "#loginForm") {
			$(form).off('formIsValid', _loginFormIsValid);
		} else if (form == "#loginSmsForm") {
			$(form).off('formIsValid', _smsFormIsValid);
		}else if (form == "#PWCForm") {
			$(form).off('formIsValid', _pwcFormIsValid);
		}
	};
	var _setEnable = function(id, form){
		$(id).attr("disabled", false);
		if (form == "#loginForm") {
			$(form).off('formIsValid').on('formIsValid', _loginFormIsValid);
		} else if (form == "#loginSmsForm") {
			$(form).off('formIsValid').on('formIsValid', _smsFormIsValid);
		} else if (form == "#PWCForm") {
			$(form).off('formIsValid').on('formIsValid', _pwcFormIsValid);
		}
	};
	//登录表单验证通过事件
	var _loginFormIsValid = function(event, form) {
		if(macFlag){
			var staffProvCode = $("#store-selector-text").attr("area-id");
			var reg = /^[0-9]+$/;
			if(!reg.test(staffProvCode)){
				$.alert("提示","请先选择省份。");
				_setEnable("#button", "#loginForm");
				return;
			}
			var params = _buildLoginInParam();
			var vali = $("#vali_code_input").val().toUpperCase();
			var url = contextPath + "/staff/login/logindo";
			if (vali) {
				url += "?validatecode=" + vali;
			}
			$.callServiceAsJson(url, params, {
				"before": function(){
					$.ecOverlay("<strong>验证工号信息中,请稍等会儿....</strong>");
					_setDisable("#button", "#loginForm");
				},
				"done": callBack_success_login,
				"always": function(){
					$.unecOverlay();
				},
				"fail": function(response){
					$.alert("提示","请求可能发生异常，请稍候");
					_setEnable("#button", "#loginForm");
				}
			});
		}else{
			$.alert("提示","请在安装安全控件后重启浏览器访问。");
		}
	};
	
	//修改密码
	var _pwcFormIsValid = function(event, form) {
		var newPassword = $.trim($("#newPassword").val());
		var confirm_password = $.trim($("#confirm_password").val());
		var staffCode = $.trim($("#staffCode").val());
		var password = $.trim($("#password").val());
		var staffProvCode = $("#store-selector-text").attr("area-id");
		//var pattern = /(^[a-zA-Z]+\d+)|(^\d+[a-zA-Z]+)/;
		if (newPassword==""){
			$.alert("提示","密码不能为空，请重新输入！");
			return;
		}
		if(newPassword.indexOf(staffCode) >= 0){
			$.alert("提示","口令不能包含用户名.");
			return;
		}
		/*if (newPassword.length!=6|!pattern.test(newPassword)) {
			$.alert("提示","您输入的密码不符合密码规范！请确认您的密码：     1.必须为6位；      2.不含有空格及特殊字符；     3.至少包含一位字母和数字。");
			$("#newPassword").val("");
			$("#confirm_password").val("");
			return;
		}*/
		if (confirm_password=="") {
			$.alert("提示","确认密码为空，请输入确认密码！");
			return;
		}
		if (newPassword!=confirm_password) {
			$.alert("提示","两次输入密码不同，请重新确认！");
			$("#confirm_password").val("");
			return;
		}
		if(password.length<32){
			password = MD5(password);
		}
//		password = MD5(password);
		newPassword = MD5(newPassword);
		_setDisable("#pwcbutton", "#PWCForm");		
		var param = {
				staffId: staffId,
				oldPwd : password,
                "is_pwd_reset" : "is_pwd_reset",
				newPwd : newPassword,
				actionType : "UPDATE",
//				areaId : "0"//由于没有登录，不能取到地区Id，修改密码也不需要areaId，约定传0值
				areaId : staffProvCode //系管路由标识
		};
		$.callServiceAsJson(contextPath + "/staff/staffPwd", param, {
			"before":function() {
				$.ecOverlay("数据提交中,请稍等...");
				ec.util.hideMsg("msg");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if (response.code == 0) {
					$.confirm("信息","密码修改成功，您需要重新登录！",
							{yes:function(){							
								ec.util.back("/");
							},no:""});
				}
				else if(response.code == 5){
					$.alert("提示", "修改密码与原密码相同！请修改为不同的密码");
					$("#newPassword").val("");
					$("#confirm_password").val("");
				}
				else if(response.code == -2){
					$.alertM(response.data);
				}
				else{
					$.alert("提示", response.data);
					$("#newPassword").val("");
					$("#confirm_password").val("");
//					$("#msg").show();
//					ec.util.showMsg("msg", response.data);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
		
		_setEnable("#pwcbutton", "#PWCForm");
	};
	
	var _smsFormIsValid = function(event, form) {
		//判断短信验证码是否过期
		if(leftInvalidTime==0){
			$.alert("提示","对不起,您的短信验证码已经过期,请重新发送后再次验证.");
			return;
		}
		//判断短信验证错误次数,超过三次后,验证码失效，需要重新发送.
		if(smsErrorCount==3){
			$.alert("提示","对不起,3次登录错误输入后验证码已自动失效,请重新发送验证码.");
			$("#smsresend").removeClass("cf").addClass("cn").off("click").on("click",_smsResend);
			if(interResend!=null){
				window.clearInterval(interResend);
				$('#timeInfo').html("");
				$("#smsresend").attr("title","请点击重新发送短信验证码.");	
				return;
			}
			return;
		}
		var smspwd = $.trim($("#smspwd").val());
		if (smspwd=="") {
			smspwd="N";
		}
		var params="smspwd=" + smspwd;
		_setDisable("#smsbutton", "#loginSmsForm");
		$.callServiceAsJson(contextPath+"/staff/login/smsValid", params, {
			"before":function(){
				$.ecOverlay("<strong>验证短信随机码中,请稍等会儿....</strong>");
//				_setDisable("#smsbutton", "#loginSmsForm");
			},
			"done" : callBack_success_sms,
			"always":function(){
				$.unecOverlay();
//				_setEnable("#smsbutton", "#loginSmsForm");
			}
		});
		_setEnable("#smsbutton", "#loginSmsForm");
	};
	
	
	//登录页面初始化表单元素校验
	var _form_valid_init = function() {

		login_flg=false;
		$("#defaultTimeResend").text(second);//验证码提示秒数
		// submit提交
		document.onkeydown = function(event){
			var ev = event ? event : (window.event ? window.event : null);
			if(ev.keyCode==13) {
				if ($(".ZebraDialog").length > 0) {
					$(".ZebraDialog").click();
				} else if(!login_flg){
					$("#loginForm #button").click();
				} else {
					$("#loginSmsForm #smsbutton").click();
				}
				return false;
			}
		};
		var browserVersion = CommonUtils.validateBrowser();//判断浏览器
		/*
		 * 问题：unifylogin首页点击登录之后，跳转至应用服务器上的登录首页，此时需要再点击登录才会出现短信框==>需优化成统一登录首页登录后即跳转并弹出短信框
		 * 原因：原先采用异步验证浏览器，导致登录按钮事件绑定在登录按钮点击之后才生效，故未能自动跳转
		 * 方案：异步调用改为同步
		 */
		var response = $.callServiceAsJsonGet(contextPath+"/staff/browserValid", {'browserVersion': browserVersion});
		if (0 == response.code) {
			var browserLevel = response.data.level;
			var recBroStr = response.data.recBroStr.replace(/,/g, "、");
			if(browserLevel == 1) {
				$('#loginForm').bind('formIsValid', _loginFormIsValid).ketchup({bindElement:"button"});
			} else if (browserLevel == 2) {
				$('#loginForm').bind('formIsValid', _loginFormIsValid).ketchup({bindElement:"button"});
				$.alert("提示","您当前使用的浏览器为" + browserVersion + "，推荐使用下列浏览器" + recBroStr + "等，否则可能引起操作缓慢等性能隐患。");
			} else if (browserLevel == 3) {
				$.alert("提示","您当前使用的浏览器为" + browserVersion + "，不在允许使用的范围内，推荐使用下列浏览器" + recBroStr + "等。");
			}
		}
		
		$("#resetBtn").click(function(){
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#loginForm"));
			$("#staffCode").val("");
			$("#password").val("");
			$("#vali_code_input").val("");
		});		
		
		$('#loginSmsForm').bind('formIsValid', _smsFormIsValid).ketchup({bindElement:"smsbutton"});
		$('#PWCForm').bind('formIsValid', _pwcFormIsValid).ketchup({bindElement:"pwcbutton"});
		//显示图片验证码
		if($("#validatecode_li").attr("code")=="1"){//验证码图片
			$("#validatecode_li").show();//
			$("#login_tip_span").show();//密码错误两次提示
			$("#vali_code_input").one("focus",function(event){//输入验证码文本框
				_refreshValidateCodeImg();
			});
		}
		$('#vali_code_a').off("click").on("click",function(event){
			_refreshValidateCodeImg();
		});
		$('#svCloseDiv').off("click").on("click",function(event){
			easyDialog.close();
			login_flg = false;
			if(isQRLogin||staff.qrlogin._QRloginFlag){
				staff.qrlogin.initQRCode();
			}
		});
		$('#PWC_div').off("click").on("click",function(event){
			easyDialog.close();
			login_flg = false;
		});
		
		/** 二维码扫码登录初始事件 **/
		qrLoginParam.sAreaId = $("#store-selector-text").attr("area-id");
		staff.qrlogin.loadEvent(qrLoginParam);
		/**************** end *************/
		
		_getMac();
	};
	var _getMac=function(){
		try{		
			//暂时关闭记录mac地址，0025669
//			if ($.browser.msie) {
//				var locator = new ActiveXObject("WbemScripting.SWbemLocator");
//				var service = locator.ConnectServer(".");
//				var properties = service.ExecQuery("SELECT * FROM Win32_NetworkAdapterConfiguration");
//				var e = new Enumerator (properties);
//				var i = 0;
//                var firstMacCode = "";
//                var firstIpAddr = "";
//				for (;!e.atEnd();e.moveNext ()){
//					var p = e.item ();
//					if(p.IPFilterSecurityEnabled==false){
//						if(i==1){
//							firstMacCode = firstMacCode+",";
//							firstIpAddr = firstIpAddr + ",";
//						}
//						firstMacCode = firstMacCode + p.MACAddress;
//						firstIpAddr = firstIpAddr + p.IPAddress(0);
//                        i = 1;
//					}
//				}
//                if(i==1){
//                	macAddress = firstMacCode;
//                }
//                macFlag=true;
//    		}else{
    			macFlag=true;
//    		}
		}catch(e){		
			 window.location.href=contextPath+"/file/telcom.exe";
		}
	};
	
	//绑定登陆入参
	var _buildLoginInParam = function(){
		var staffCode = $("#staffCode").val();
		var password = $("#password").val();
		var staffProvCode = $("#store-selector-text").attr("area-id");
		var loginAreaName = $("#store-selector-text").text();
		macAddress = document.getElementById('txtMac').value;
//		var expires = new Date();
//		var hours = 2;
//		expires.setTime(expires.getTime() + hours * 3600 * 1000);
//		str += "; expires=" + expires.toGMTString();
//		str += "; path=/";
//		str += "; domain=189.cn;";
//		str += "; secure";
//		document.cookie = str;
		
		//加密
		if(password!=undefined && password.length<32){
			password = MD5(password);
		}
		//获取5位随机码
		//var randomCode = ec.util.getNRandomCode(5);
//		password += randomCode;
		//randomNum1 = randomCode;
		//内网IP 预留
		var lanIp = "";
		//连接时间
		var connectiontime = -1;
		//发送时间
		var sendtime = -1;
		//等待时间
		var waitingtime = -1;
		//接受时间
		var accepttime = -1;
		var fingerprint;
		try{
			//连接时间
			connectiontime = window.performance.timing.connectEnd-window.performance.timing.connectStart;
			//发送时间
			sendtime = window.performance.timing.responseEnd-window.performance.timing.requestStart;
			//等待时间
			waitingtime = window.performance.timing.responseStart-window.performance.timing.requestStart;
			//接受时间
			accepttime = window.performance.timing.responseEnd-window.performance.timing.responseStart;
			//浏览器指纹
			fingerprint = new Fingerprint({screen_resolution: true}).get();
		} catch(e) {
		
		}
		return {
			"staffCode"		:staffCode,
			"password"		:password,
			"staffProvCode"	:staffProvCode,
			"lanIp"			:lanIp,
			"connectiontime":connectiontime,
			"sendtime"		:sendtime,
			"waitingtime"	:waitingtime,
			"accepttime"	:accepttime,
			"macStr"		:macAddress,
			"fingerprint"	:fingerprint,
			"loginAreaName"	:loginAreaName
		};
	};
	//验证码重发成功回调函数
	var _callBack_success_smsresend=function(response){
		
		if (response.code==0) {
			$.alert("提示","验证码发送成功，请及时输入验证.");
			$("#smsresend").off("click").removeClass("cn").addClass("cf");
			//randomNum2 = ec.util.getNRandomCode(2);
			if(response.data.randomCode != null ){
				$("#num .txtnum").attr("value",response.data.randomCode);
			}
			//重新发送验证码成功后,验证错误次数置0.
			smsErrorCount=0;
			//重新发送验证码成功后,验证码有效期初始化5分钟.
			leftInvalidTime=300;
			sendSmsAfter30s();
			//5分钟倒计时，超过5分钟未输入验证码就失效.
			invalidAfter5Mins();
		} else if (response.code ==1202){
			$.confirm("信息",response.data
					,{yes:function(
			){
				window.location.href=contextPath+"/staff/login/page";
			},no:""},"error");
		} else{
			$.alert("提示","验证码发送失败，请重新发送.");
		};
		_setEnable("#smsbutton", "#loginSmsForm");
	};
	//重发验证码
	var _smsResend=function(){ 
		$.callServiceAsJsonGet(contextPath+"/staff/login/reSend",{'smsErrorCount':smsErrorCount} ,{
			"done" :_callBack_success_smsresend
		});	
	};
	//刷新时间
	var second=30;
	var interResend=null;
	var showTime=function(){
		if (second>0){
			second=second-1;
			if(second==0){
				$("#smsresend").removeClass("cf").addClass("cn").off("click").on("click",_smsResend);
				if(interResend!=null){
					window.clearInterval(interResend);
					$('#timeInfo').html("");
					$("#smsresend").attr("title","请点击重新发送短信验证码.");	
					return;
				}
			}
		}
		$("#smsresend").attr("title","请在"+second+"秒后再点击重新发送.");	
	};
	//短信验证码失效时间5分钟
	var leftInvalidTime=300;
	var smsInvalidTime=function(){
		if (leftInvalidTime>0){
			leftInvalidTime=leftInvalidTime-1;
		}
	};
	//30秒后重发短信验证码
	var sendSmsAfter30s=function(){
		 second=30;
		 window.clearInterval(interResend);
		 interResend=window.setInterval(showTime,1000);
	};
	//5分钟之后短信验证码过期失效
	var invalidAfter5Mins=function(){
		window.setInterval(smsInvalidTime,1000);
	};
	//刷新验证码
	var _refreshValidateCodeImg=function(){
		$("#vali_code_input").val("");
		$('#validatecodeImg').css({"width":"80px","height":"32px"}).attr('src',contextPath+'/validatecode/codeimg.jpg?' + Math.floor(Math.random()*100)).fadeIn();
	};
	//跳转地址
	var _redirectUrl = function() {
		var lastUrl=$.cookie("_last_url");
		// #1121961,删除session会话保持的弹出框cookie标识
		$.cookie('_popNotice_',null,{path:'/'});
		if(!!lastUrl && lastUrl.indexOf("/")>=0 && lastUrl.indexOf("/staff/login") <0){
			$.cookie("_last_url",null,{path:"/"});
			window.location.href=CommonUtils.replaceAll(lastUrl,'"','');
		} else {
			$.cookie("_last_url",null,{path:"/"});
			window.location.href=contextPath+"/main/home";
		}
	};
	
	//统一登陆
	var _unifyLogin = function(){
		$("#button").click();
		isUnifyLogin = true;
	};
	
	var _unifyQrLogin = function(){
		$("#switchLogin").click();
		//isQRLogin = true;
		//qrLoginParam = data;
	};
	
	//返回登陆页面
	var _goback = function(){
		if(isUnifyLogin){
			window.location = unifyLoginUrl;
			isUnifyLogin = false;
		}else if(isQRLogin){
			
		}else{
			_setEnable("#button", "#loginForm");
		}
	};
	
	var _qrLogin = function(data){
		callBack_success_login(data);
	};
	// 要暴露出的公共方法
	return {
		form_valid_init : _form_valid_init,
		refreshValidateCodeImg : _refreshValidateCodeImg,
		invalidAfter5Mins : invalidAfter5Mins,
		sendSmsAfter30s : sendSmsAfter30s,
		leftInvalidTime : leftInvalidTime,
		smsErrorCount : smsErrorCount,
		redirectUrl		: _redirectUrl,
		unifyLogin		: _unifyLogin,
		goback 			: _goback,
		unifyQrLogin	:_unifyQrLogin,
		qrLogin		:_qrLogin
	};
})(jQuery);

$(function() {
	staff.login.form_valid_init();
});


/* BEGIN area.js - lte-portal/src/main/webapp/resources/js/busi-js/common */
;CommonUtils.regNamespace("common","area");common.area=(function(g){var b={"8110000":[{id:8110000,name:"东城区"},{id:8110000,name:"西城区"},{id:8110000,name:"朝阳区"},{id:8110000,name:"丰台区"},{id:8110000,name:"石景山区"},{id:8110000,name:"海淀区"},{id:8110000,name:"门头沟区"},{id:8110000,name:"房山区"},{id:8110000,name:"通州区"},{id:8110000,name:"顺义区"},{id:8110000,name:"昌平区"},{id:8110000,name:"大兴区"},{id:8110000,name:"怀柔区"},{id:8110000,name:"平谷区"},{id:8110000,name:"密云县"},{id:8110000,name:"延庆县"}],"8310000":[{id:8310000,name:"黄浦区"},{id:8310000,name:"徐汇区"},{id:8310000,name:"长宁区"},{id:8310000,name:"静安区"},{id:8310000,name:"普陀区"},{id:8310000,name:"闸北区"},{id:8310000,name:"虹口区"},{id:8310000,name:"杨浦区"},{id:8310000,name:"闵行区"},{id:8310000,name:"宝山区"},{id:8310000,name:"嘉定区"},{id:8310000,name:"浦东新区"},{id:8310000,name:"金山区"},{id:8310000,name:"松江区"},{id:8310000,name:"青浦区"},{id:8310000,name:"奉贤区"},{id:8310000,name:"崇明县"}],"8120000":[{id:8120000,name:"和平区"},{id:8120000,name:"河东区"},{id:8120000,name:"河西区"},{id:8120000,name:"南开区"},{id:8120000,name:"河北区"},{id:8120000,name:"红桥区"},{id:8120000,name:"东丽区"},{id:8120000,name:"西青区"},{id:8120000,name:"津南区"},{id:8120000,name:"北辰区"},{id:8120000,name:"武清区"},{id:8120000,name:"宝坻区"},{id:8120000,name:"滨海新区"},{id:8120000,name:"宁河县"},{id:8120000,name:"静海县"},{id:8120000,name:"蓟县"}],"8500000":[{id:8500000,name:"万州区"},{id:8500000,name:"涪陵区"},{id:8500000,name:"渝中区"},{id:8500000,name:"大渡口区"},{id:8500000,name:"江北区"},{id:8500000,name:"沙坪坝区"},{id:8500000,name:"九龙坡区"},{id:8500000,name:"南岸区"},{id:8500000,name:"北碚区"},{id:8500000,name:"万盛区"},{id:8500000,name:"双桥区"},{id:8500000,name:"渝北区"},{id:8500000,name:"巴南区"},{id:8500000,name:"黔江区"},{id:8500000,name:"长寿区"},{id:8500000,name:"江津区"},{id:8500000,name:"合川区"},{id:8500000,name:"永川区"},{id:8500000,name:"南川区"},{id:8500000,name:"綦江县"},{id:8500000,name:"潼南县"},{id:8500000,name:"铜梁县"},{id:8500000,name:"大足县"},{id:8500000,name:"荣昌县"},{id:8500000,name:"璧山县"},{id:8500000,name:"梁平县"},{id:8500000,name:"城口县"},{id:8500000,name:"丰都县"},{id:8500000,name:"垫江县"},{id:8500000,name:"武隆县"},{id:8500000,name:"忠县"},{id:8500000,name:"开县"},{id:8500000,name:"云阳县"},{id:8500000,name:"奉节县"},{id:8500000,name:"巫山县"},{id:8500000,name:"巫溪县"},{id:8500000,name:"石柱土家族自治县"},{id:8500000,name:"秀山土家族苗族自治县"},{id:8500000,name:"酉阳土家族苗族自治县"},{id:8500000,name:"彭水苗族土家族自治县"}],"8130000":[{id:8130100,name:"石家庄市"},{id:8130200,name:"唐山市"},{id:8130300,name:"秦皇岛市"},{id:8130400,name:"邯郸市"},{id:8130500,name:"邢台市"},{id:8130600,name:"保定市"},{id:8130700,name:"张家口市"},{id:8130800,name:"承德市"},{id:8130900,name:"沧州市"},{id:8131000,name:"廊坊市"},{id:8131100,name:"衡水市"}],"8140000":[{id:8140100,name:"太原市"},{id:8140200,name:"大同市"},{id:8140300,name:"阳泉市"},{id:8140400,name:"长治市"},{id:8140500,name:"晋城市"},{id:8140600,name:"朔州市"},{id:8140700,name:"晋中市"},{id:8140800,name:"运城市"},{id:8140900,name:"忻州市"},{id:8141000,name:"临汾市"},{id:8141100,name:"吕梁市"}],"8410000":[{id:8410100,name:"郑州市"},{id:8410200,name:"开封市"},{id:8410300,name:"洛阳市"},{id:8410400,name:"平顶山市"},{id:8410500,name:"安阳市"},{id:8410600,name:"鹤壁市"},{id:8410700,name:"新乡市"},{id:8410800,name:"焦作市"},{id:8410900,name:"濮阳市"},{id:8411000,name:"许昌市"},{id:8411100,name:"漯河市"},{id:8411200,name:"三门峡市"},{id:8411300,name:"南阳市"},{id:8411400,name:"商丘市"},{id:8411500,name:"信阳市"},{id:8411600,name:"周口市"},{id:8411700,name:"驻马店市"},{id:8419001,name:"济源市"}],"8210000":[{id:8210100,name:"沈阳市"},{id:8210200,name:"大连市"},{id:8210300,name:"鞍山市"},{id:8210400,name:"抚顺市"},{id:8210500,name:"本溪市"},{id:8210600,name:"丹东市"},{id:8210700,name:"锦州市"},{id:8210800,name:"营口市"},{id:8210900,name:"阜新市"},{id:8211000,name:"辽阳市"},{id:8211100,name:"盘锦市"},{id:8211200,name:"铁岭市"},{id:8211300,name:"朝阳市"},{id:8211400,name:"葫芦岛市"}],"8220000":[{id:8220100,name:"长春市"},{id:8220200,name:"吉林市"},{id:8220300,name:"四平市"},{id:8220400,name:"辽源市"},{id:8220500,name:"通化市"},{id:8220600,name:"白山市"},{id:8220700,name:"松原市"},{id:8220800,name:"白城市"},{id:8222400,name:"延边朝鲜族自治州"}],"8230000":[{id:8230100,name:"哈尔滨市"},{id:8230200,name:"齐齐哈尔市"},{id:8230300,name:"鸡西市"},{id:8230400,name:"鹤岗市"},{id:8230500,name:"双鸭山市"},{id:8230600,name:"大庆市"},{id:8230700,name:"伊春市"},{id:8230800,name:"佳木斯市"},{id:8230900,name:"七台河市"},{id:8231000,name:"牡丹江市"},{id:8231100,name:"黑河市"},{id:8231200,name:"绥化市"},{id:8232700,name:"大兴安岭地区"}],"8150000":[{id:8150100,name:"呼和浩特市"},{id:8150200,name:"包头市"},{id:8150300,name:"乌海市"},{id:8150400,name:"赤峰市"},{id:8150500,name:"通辽市"},{id:8150600,name:"鄂尔多斯市"},{id:8150700,name:"呼伦贝尔市"},{id:8150800,name:"巴彦淖尔市"},{id:8150900,name:"乌兰察布市"},{id:8152200,name:"兴安盟"},{id:8152500,name:"锡林郭勒盟"},{id:8152900,name:"阿拉善盟"}],"8320000":[{id:8320100,name:"南京市"},{id:8320200,name:"无锡市"},{id:8320300,name:"徐州市"},{id:8320400,name:"常州市"},{id:8320500,name:"苏州市"},{id:8320600,name:"南通市"},{id:8320700,name:"连云港市"},{id:8320800,name:"淮安市"},{id:8320900,name:"盐城市"},{id:8321000,name:"扬州市"},{id:8321100,name:"镇江市"},{id:8321200,name:"泰州市"},{id:8321300,name:"宿迁市"}],"8370000":[{id:8370100,name:"济南市"},{id:8370200,name:"青岛市"},{id:8370300,name:"淄博市"},{id:8370400,name:"枣庄市"},{id:8370500,name:"东营市"},{id:8370600,name:"烟台市"},{id:8370700,name:"潍坊市"},{id:8370800,name:"济宁市"},{id:8370900,name:"泰安市"},{id:8371000,name:"威海市"},{id:8371100,name:"日照市"},{id:8371200,name:"莱芜市"},{id:8371300,name:"临沂市"},{id:8371400,name:"德州市"},{id:8371500,name:"聊城市"},{id:8371600,name:"滨州市"},{id:8371700,name:"菏泽市"}],"8340000":[{id:8340100,name:"合肥市"},{id:8340200,name:"芜湖市"},{id:8340300,name:"蚌埠市"},{id:8340400,name:"淮南市"},{id:8340500,name:"马鞍山市"},{id:8340600,name:"淮北市"},{id:8340700,name:"铜陵市"},{id:8340800,name:"安庆市"},{id:8341000,name:"黄山市"},{id:8341100,name:"滁州市"},{id:8341200,name:"阜阳市"},{id:8341300,name:"宿州市"},{id:8341500,name:"六安市"},{id:8341600,name:"亳州市"},{id:8341700,name:"池州市"},{id:8341800,name:"宣城市"}],"8330000":[{id:8330100,name:"杭州市"},{id:8330200,name:"宁波市"},{id:8330300,name:"温州市"},{id:8330400,name:"嘉兴市"},{id:8330500,name:"湖州市"},{id:8330600,name:"绍兴市"},{id:8330700,name:"金华市"},{id:8330800,name:"衢州市"},{id:8330900,name:"舟山市"},{id:8331000,name:"台州市"},{id:8331100,name:"丽水市"}],"8350000":[{id:8350100,name:"福州市"},{id:8350200,name:"厦门市"},{id:8350300,name:"莆田市"},{id:8350400,name:"三明市"},{id:8350500,name:"泉州市"},{id:8350600,name:"漳州市"},{id:8350700,name:"南平市"},{id:8350800,name:"龙岩市"},{id:8350900,name:"宁德市"}],"8420000":[{id:8420100,name:"武汉市"},{id:8420200,name:"黄石市"},{id:8420300,name:"十堰市"},{id:8420500,name:"宜昌市"},{id:8420600,name:"襄阳市"},{id:8420700,name:"鄂州市"},{id:8420800,name:"荆门市"},{id:8420900,name:"孝感市"},{id:8421000,name:"荆州市"},{id:8421100,name:"黄冈市"},{id:8421200,name:"咸宁市"},{id:8421300,name:"随州市"},{id:8422800,name:"恩施土家族苗族自治州"},{id:8429004,name:"仙桃市"},{id:8429005,name:"潜江市"},{id:8429006,name:"天门市"},{id:8429021,name:"神农架林区"}],"8430000":[{id:8430100,name:"长沙市"},{id:8430200,name:"株洲市"},{id:8430300,name:"湘潭市"},{id:8430400,name:"衡阳市"},{id:8430500,name:"邵阳市"},{id:8430600,name:"岳阳市"},{id:8430700,name:"常德市"},{id:8430800,name:"张家界市"},{id:8430900,name:"益阳市"},{id:8431000,name:"郴州市"},{id:8431100,name:"永州市"},{id:8431200,name:"怀化市"},{id:8431300,name:"娄底市"},{id:8433100,name:"湘西土家族苗族自治州"}],"8440000":[{id:8440100,name:"广州市"},{id:8440200,name:"韶关市"},{id:8440300,name:"深圳市"},{id:8440400,name:"珠海市"},{id:8440500,name:"汕头市"},{id:8440600,name:"佛山市"},{id:8440700,name:"江门市"},{id:8440800,name:"湛江市"},{id:8440900,name:"茂名市"},{id:8441200,name:"肇庆市"},{id:8441300,name:"惠州市"},{id:8441400,name:"梅州市"},{id:8441500,name:"汕尾市"},{id:8441600,name:"河源市"},{id:8441700,name:"阳江市"},{id:8441800,name:"清远市"},{id:8441900,name:"东莞市"},{id:8442000,name:"中山市"},{id:8445100,name:"潮州市"},{id:8445200,name:"揭阳市"},{id:8445300,name:"云浮市"}],"8450000":[{id:8450100,name:"南宁市"},{id:8450200,name:"柳州市"},{id:8450300,name:"桂林市"},{id:8450400,name:"梧州市"},{id:8450500,name:"北海市"},{id:8450600,name:"防城港市"},{id:8450700,name:"钦州市"},{id:8450800,name:"贵港市"},{id:8450900,name:"玉林市"},{id:8451000,name:"百色市"},{id:8451100,name:"贺州市"},{id:8451200,name:"河池市"},{id:8451300,name:"来宾市"},{id:8451400,name:"崇左市"}],"8360000":[{id:8360100,name:"南昌市"},{id:8360200,name:"景德镇市"},{id:8360300,name:"萍乡市"},{id:8360400,name:"九江市"},{id:8360500,name:"新余市"},{id:8360600,name:"鹰潭市"},{id:8360700,name:"赣州市"},{id:8360800,name:"吉安市"},{id:8360900,name:"宜春市"},{id:8361000,name:"抚州市"},{id:8361100,name:"上饶市"}],"8510000":[{id:8510100,name:"成都市"},{id:8510300,name:"自贡市"},{id:8510400,name:"攀枝花市"},{id:8510500,name:"泸州市"},{id:8510600,name:"德阳市"},{id:8510700,name:"绵阳市"},{id:8510800,name:"广元市"},{id:8510900,name:"遂宁市"},{id:8511000,name:"内江市"},{id:8511100,name:"乐山市"},{id:8511300,name:"南充市"},{id:8511400,name:"眉山市"},{id:8511500,name:"宜宾市"},{id:8511600,name:"广安市"},{id:8511700,name:"达州市"},{id:8511800,name:"雅安市"},{id:8511900,name:"巴中市"},{id:8512000,name:"资阳市"},{id:8513200,name:"阿坝藏族羌族自治州"},{id:8513300,name:"甘孜藏族自治州"},{id:8513400,name:"凉山彝族自治州"}],"8460000":[{id:8460100,name:"海口市"},{id:8460200,name:"三亚市"},{id:8460300,name:"三沙市"},{id:8469001,name:"五指山市"},{id:8469002,name:"琼海市"},{id:8469003,name:"儋州市"},{id:8469005,name:"文昌市"},{id:8469006,name:"万宁市"},{id:8469007,name:"东方市"},{id:8469021,name:"定安县"},{id:8469022,name:"屯昌县"},{id:8469023,name:"澄迈县"},{id:8469024,name:"临高县"},{id:8469025,name:"白沙黎族自治县"},{id:8469026,name:"昌江黎族自治县"},{id:8469027,name:"乐东黎族自治县"},{id:8469028,name:"陵水黎族自治县"},{id:8469029,name:"保亭黎族苗族自治县"},{id:8469030,name:"琼中黎族苗族自治县"},{id:8469031,name:"西沙群岛"},{id:8469032,name:"南沙群岛"},{id:8469033,name:"中沙群岛的岛礁及其海域"}],"8520000":[{id:8520100,name:"贵阳市"},{id:8520200,name:"六盘水市"},{id:8520300,name:"遵义市"},{id:8520400,name:"安顺市"},{id:8522200,name:"铜仁地区"},{id:8522300,name:"黔西南布依族苗族自治州"},{id:8522400,name:"毕节地区"},{id:8522600,name:"黔东南苗族侗族自治州"},{id:8522700,name:"黔南布依族苗族自治州"}],"8530000":[{id:8530100,name:"昆明市"},{id:8530300,name:"曲靖市"},{id:8530400,name:"玉溪市"},{id:8530500,name:"保山市"},{id:8530600,name:"昭通市"},{id:8530700,name:"丽江市"},{id:8530800,name:"普洱市"},{id:8530900,name:"临沧市"},{id:8532300,name:"楚雄彝族自治州"},{id:8532500,name:"红河哈尼族彝族自治州"},{id:8532600,name:"文山壮族苗族自治州"},{id:8532800,name:"西双版纳傣族自治州"},{id:8532900,name:"大理白族自治州"},{id:8533100,name:"德宏傣族景颇族自治州"},{id:8533300,name:"怒江傈僳族自治州"},{id:8533400,name:"迪庆藏族自治州"}],"8540000":[{id:8540100,name:"拉萨市"},{id:8542100,name:"昌都地区"},{id:8542200,name:"山南地区"},{id:8542300,name:"日喀则地区"},{id:8542400,name:"那曲地区"},{id:8542500,name:"阿里地区"},{id:8542600,name:"林芝地区"}],"8610000":[{id:8610100,name:"西安市"},{id:8610200,name:"铜川市"},{id:8610300,name:"宝鸡市"},{id:8610400,name:"咸阳市"},{id:8610500,name:"渭南市"},{id:8610600,name:"延安市"},{id:8610700,name:"汉中市"},{id:8610800,name:"榆林市"},{id:8610900,name:"安康市"},{id:8611000,name:"商洛市"}],"8620000":[{id:8620100,name:"兰州市"},{id:8620200,name:"嘉峪关市"},{id:8620300,name:"金昌市"},{id:8620400,name:"白银市"},{id:8620500,name:"天水市"},{id:8620600,name:"武威市"},{id:8620700,name:"张掖市"},{id:8620800,name:"平凉市"},{id:8620900,name:"酒泉市"},{id:8621000,name:"庆阳市"},{id:8621100,name:"定西市"},{id:8621200,name:"陇南市"},{id:8622900,name:"临夏回族自治州"},{id:8623000,name:"甘南藏族自治州"}],"8630000":[{id:8630100,name:"西宁市"},{id:8632100,name:"海东地区"},{id:8632801,name:"格尔木市"},{id:8632200,name:"海北藏族自治州"},{id:8632300,name:"黄南藏族自治州"},{id:8632500,name:"海南藏族自治州"},{id:8632600,name:"果洛藏族自治州"},{id:8632700,name:"玉树藏族自治州"},{id:8632800,name:"海西蒙古族藏族自治州"}],"8640000":[{id:8640100,name:"银川市"},{id:8640200,name:"石嘴山市"},{id:8640300,name:"吴忠市"},{id:8640400,name:"固原市"},{id:8640500,name:"中卫市"}],"8650000":[{id:8650100,name:"乌鲁木齐市"},{id:8650200,name:"克拉玛依市"},{id:8652100,name:"吐鲁番地区"},{id:8652200,name:"哈密地区"},{id:8652300,name:"昌吉回族自治州"},{id:8652700,name:"博尔塔拉蒙古自治州"},{id:8652800,name:"巴音郭楞蒙古自治州"},{id:8652900,name:"阿克苏地区"},{id:8653000,name:"克孜勒苏柯尔克孜自治州"},{id:8653100,name:"喀什地区"},{id:8653200,name:"和田地区"},{id:8654000,name:"伊犁哈萨克自治州"},{id:8654200,name:"塔城地区"},{id:8654300,name:"阿勒泰地区"},{id:8659001,name:"石河子市"},{id:8659002,name:"阿拉尔市"},{id:8659003,name:"图木舒克市"},{id:8659004,name:"五家渠市"},{"id":8654003,"name":"奎屯市"}],"8990000":[{"id":8990100,"name":"虚拟本地网A"},{"id":8990200,"name":"虚拟本地网B"},{"id":8990300,"name":"虚拟本地网C"}]};var d=function(j,l,i){var k=i;var m=new Date();m.setTime(m.getTime()+k*24*60*60*1000);document.cookie=j+"="+escape(l)+";expires="+m.toGMTString()+";path=/;"};var a=function(j){var i=document.cookie.match(new RegExp("(^| )"+j+"=([^;]*)(;|$)"));if(i!=null){return unescape(i[2])}return null};var e=function(j){var i="";if(j==1){i="stock_province_item"}else{if(j==2){i="stock_city_item"}}return i};var h=function(k){var l=g(k).attr("data-value");var n=g(k).html();var i=g("#ctc-area div.mt ul.tab li[data-index=0] em").html();g("#ctc-area div.mt ul.tab li[data-index=1] em").html(n);g("#store-selector-text").html(i+n).attr("area-id",l);g("#store-selector").removeClass("hover");var j=l+"-"+i+"-"+n;d("login_area_id",j,30);var m=g(k).parent().parent().parent().attr("data-area");m=new Number(m)+1;if(m=="2"){}};var c=function(k){var r=2;var l=e(r);if(l&&r){g("#"+l).html("");var p=["<ul class='area-list'>"];var q=[];var n=[];if(k&&k.length>0){for(var o=0,m=k.length;o<m;o++){k[o].name=k[o].name.replace(" ","");if(k[o].name.length>12){n.push("<li class='longer-area'><a href='#none' data-value='"+k[o].id+"'>"+k[o].name+"</a></li>")}else{if(k[o].name.length>5){q.push("<li class='long-area'><a href='#none' data-value='"+k[o].id+"'>"+k[o].name+"</a></li>")}else{p.push("<li><a href='#none' data-value='"+k[o].id+"'>"+k[o].name+"</a></li>")}}}}else{p.push("<li><a href='#none' data-value='"+currentAreaInfo.currentFid+"'> </a></li>")}p.push(q.join(""));p.push(n.join(""));p.push("</ul>");g("#"+l).html(p.join(""));g("#"+l).find("a").click(function(){h(this);s(g(this).attr("data-value"))})}};var f=function(){g("#ctc-area div.mt ul.tab li[data-index=0]").addClass("curr").find("a").addClass("hover");g("#stock_city_item").hide();g("#stock_province_item").show();g("#store-selector").off("mouseover").on("mouseover",function(){g("#store-selector").addClass("hover")});g("#store-selector").off("mouseout").on("mouseout",function(){g("#store-selector").removeClass("hover")});g("#ctc-area div.mt ul.tab li").off("click").on("click",function(){g("#ctc-area div.mt ul.tab li").removeClass("curr").find("a").removeClass("hover");g(this).addClass("curr").find("a").addClass("hover");var j=g(this).attr("data-index");if(j=="0"){g("#stock_city_item").hide();g("#stock_province_item").show()}else{if(j=="1"){g("#stock_province_item").hide();g("#stock_city_item").show()}}});g("#stock_province_item a").off("click").on("click",function(){var l=g(this).attr("data-value");if(l=="8110000"||l=="8310000"||l=="8120000"||l=="8500000"){var j=g(this).html();var m="";g("#ctc-area div.mt ul.tab li[data-index=0] em").html(j);g("#ctc-area div.mt ul.tab li[data-index=1] em").html(m);g("#store-selector-text").html(j+m).attr("area-id",l);g("#store-selector").removeClass("hover");c(b[l]);var k=l+"-"+j+"-"+m;d("login_area_id",k,30);s(l);return}g("#store-selector").off("mouseout");c(b[l+""]);g("#ctc-area div.mt ul.tab li").removeClass("curr");g("#ctc-area div.mt ul.tab li a").removeClass("hover");g("#ctc-area div.mt ul.tab li[data-index=0] em").html(g(this).html());g("#ctc-area div.mt ul.tab li[data-index=1] em").html("请选择");g("#ctc-area div.mt ul.tab li[data-index=1]").addClass("curr").find("a").addClass("hover");g("#stock_province_item").hide();g("#stock_city_item").show();});g("#stock_city_item a").off("click").on("click",function(){h(this);});var i=a("login_area_id");if(!!i&&i!=""){i=i.split("-");g("#store-selector-text").attr("area-id",i[0]).html(i[1]+i[2]);g("#ctc-area div.mt ul.tab li[data-index=0] em").html(i[1]);g("#ctc-area div.mt ul.tab li[data-index=1] em").html(i[2]);c(b[i[0].substring(0,3)+"0000"])}};var s=function(l){staff.qrlogin.loadEvent(l);};return{init:f}})(jQuery);$(function(){common.area.init()});
/* END   area.js - lte-portal/src/main/webapp/resources/js/busi-js/common */
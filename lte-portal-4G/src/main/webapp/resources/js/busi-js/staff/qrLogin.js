/**
 * 用户登录-扫码登录
 * 
 * @author tanzepeng
 */
CommonUtils.regNamespace("staff", "qrlogin");
staff.qrlogin = (function($) {
	
	var interval = null;
	
	// 当前登录,false：密码登录 true:扫码登录
	var _QRloginFlag = false;
	
	var qr_areaId = null;
	
	/**
	 * 地区权限判断是否具有【扫码登录】权限
	 */
	var _isQrLoginAuth = function(){
		
		var _res = false;
		
		var param = {
				areaId : qr_areaId.substring(0,3),
				key	   : "QRCODE_LOGIN_SWITCH"
		};
		$.ajax({
		    type: "GET",
		    dataType: "json",
		    url: contextPath+"/staff/querySwithFromMDA",
		    async:false,
		    data: param,
		    success: function (response) {
		    	if(response && response != null && response != ""){
		    		if("ON" == response){
		    			_res = true;
		    		}
		    	}
		    },
	        error:function(response){
	        	_res = false;
	        }
		});
		
		return _res;
	};
	
	// 地区选择触发
	var _loadEvent = function(param){
		
		qr_areaId = _C(param);
		
		if(qr_areaId != null && qr_areaId != ""){
			if(_isQrLoginAuth(qr_areaId)){
				$("#div_qricon").html("");
				var html= '<a id="switchLogin" href="javascript:void(0);" title="扫码登录"><img src="'+contextPath+'/image/login/login_qrcode.png"/></a>';
			    $("#div_qricon").html(html);
				
			    staff.qrlogin.initEvent();
			}else{
				$("#div_qricon").html("");
			}
		}
	};
	
	var _initEvent = function(){
		$('#switchLogin').off("click").on("click",function(event){
			if(_QRloginFlag){
				staff.qrlogin.stopInterval();
				$(".div_loginForm").css("display","block");
				$(".div_loginQrcode").css("display","none");
				$("#switchLogin").attr("title","扫码登录");
				$("#switchLogin img").attr("src",contextPath+"/image/login/login_qrcode.png");
				_QRloginFlag = false;
			}else if(!_QRloginFlag){
				$(".div_loginForm").css("display","none");
				$(".div_loginQrcode").css("display","block");
				$(".center_loginQrcode").css("display","block");
				$(".errQrcode").css("display","none");
				$(".successQrcode").css("display","none");
				$("#switchLogin").attr("title","表单登录");
				$("#switchLogin img").attr("src",contextPath+"/image/login/login_computer.png");
				_QRloginFlag = true;
				staff.qrlogin.initQRCode();
			}
		});
	};
	
	/**
	 * 扫码界面初始化
	 */
	var _initQRCode = function(){
		
		staff.qrlogin.getQRCode();
		interval  = setInterval(function () {
			//** 轮训请求,手机端是否扫码 **//*
			var response = staff.qrlogin.loopGet();
			if(100 == response.code){
				window.clearInterval(interval);
				// 扫码校验成功,开始登录系统
				staff.login.qrLogin(response.data);
			} else if (101 == response.code){	// 未扫描
				// 不做操作,继续轮循
			} else if (102 == response.code){	// 已扫描,待授权
				$(".center_loginQrcode").css("display","none");
				$(".successQrcode").css("display","block");
				$("#backLink").off("click").on("click",function(){
					_A();
					$(".errQrcode").css("display","none");
				    staff.qrlogin.initQRCode();
				});
			} else if (103 == response.code){	// 已失效
				_A();
				$(".errQrcode").css("display","block");
				$("#refreshCode").off("click").on("click",function(){
				    $(".errQrcode").css("display","none");
				    staff.qrlogin.initQRCode();
				});
			}else{
				window.clearInterval(interval);
				$.alert("提示","扫描登录失败,请通过表单登录!");
			}
		}, 1000);
	};
	
	/** 二维码失效,样式与加载 **/
	var _A = function(){
		staff.qrlogin.stopInterval();
		$(".center_loginQrcode").css("display","block");
		$(".successQrcode").css("display","none");
	};
	
	/** 获取进入首页保存的地区cookie **/
	var _B = function(cookieId){
		var i = document.cookie.match(new RegExp("(^| )" + cookieId + "=([^;]*)(;|$)"));
		if (i != null) {
			return unescape(i[2]);
		}
		return null;
	};
	
	var _C = function(data){
		/** 从统一登录过来 **/
		if(data.areaId && data.areaId != ""){
			return data.areaId;
		}
		/** cookie中缓存 **/
		var i = _B("login_area_id");
		if (!!i && i != "") {
			i = i.split("-");
			return i[0];
		}
		/** 地区选择框 **/
		return data.sAreaId;
	};
	
	var _stopInterval = function(){
		if(interval != null){
			window.clearInterval(interval);
		}
	};
	
	/**
	 * 获取二维码
	 */
	var _getQRCode = function(){
		$.callServiceAsJson(contextPath+"/staff/getRQCode",{flag:"login",areaId:qr_areaId}, {
			"done" : function(response){
				if (response.code == 0) {
					//$("#qrcode").css("display","block");
					$("#qgcode").html("");
					var html= '<img src="" id="img_qrcode"/>';
				    $("#qgcode").html(html);
					$("#img_qrcode").attr("src",response.data);
				}else{
				}
			}
		});
	};
	
	/**
	 * 轮训请求
	 */
	var _loopGet = function(){
		
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
		try{
			//连接时间
			connectiontime = window.performance.timing.connectEnd-window.performance.timing.connectStart;
			//发送时间
			sendtime = window.performance.timing.responseEnd-window.performance.timing.requestStart;
			//等待时间
			waitingtime = window.performance.timing.responseStart-window.performance.timing.requestStart;
			//接受时间
			accepttime = window.performance.timing.responseEnd-window.performance.timing.responseStart;
		} catch(e) {
		
		}
		var param = {
			"staffCode":"",
			"password":"",
			"staffProvCode":qr_areaId,
			"lanIp":lanIp,
			"connectiontime":connectiontime,
			"sendtime":sendtime,
			"waitingtime":waitingtime,
			"accepttime":accepttime,
			"macStr":"",
			"fingerprint":""
		};
		
		return $.callServiceAsJson(contextPath+"/staff/loopGet",param);
	};
	
	return {
		initQRCode		:_initQRCode,
		loadEvent		:_loadEvent,
		initEvent		:_initEvent,
		getQRCode		:_getQRCode,
		loopGet			:_loopGet,
		stopInterval	:_stopInterval
	};
})(jQuery);
//初始化
$(function(){
});
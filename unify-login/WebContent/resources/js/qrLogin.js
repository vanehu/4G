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
				queryFlag :"1",
				key	   : "QRLOGIN-"+qr_areaId.substring(0,3)
		};
		$.ajax({
		    type: "GET",
		    dataType: "text",
		    url: "qrlogin",
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
	var _loadEvent = function(areaId){
		
		qr_areaId = areaId;
		
		if(qr_areaId != null && qr_areaId != ""){
			if(_isQrLoginAuth(qr_areaId)){
				$("#div_qricon").html("");
				var html= '<a id="switchLogin" href="javascript:void(0);" title="扫码登录"><img src="resources/image/login/login_qrcode.png"/></a>';
			    $("#div_qricon").html(html);
				
			    staff.qrlogin.jumpLogin(qr_areaId);
			    //staff.qrlogin.initEvent();
			}else{
				$("#div_qricon").html("");
			}
		}
	};
	
	/**
	 * 跳转到单台扫码登录界面
	 */
	var _jumpLogin = function(areaId){
		var province = staff.login.getAreaName(areaId);
		$('#switchLogin').off("click").on("click",function(event){
			var date = new Date();
			var time = date.getFullYear()+""+(Number(date.getMonth())+1)+""+date.getDate()+""+date.getHours()+""+date.getMinutes()+""+date.getSeconds();
			$.ajax({
			    type: "get",
			    dataType: "json",
			    url: "qrlogin",
			    data: {"province":province,"_":time,"queryFlag":"2"},
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
			    		var url = httpconfig+"://"+provDomain+":"+version+"/provPortal/staff/login/page?areaId="+areaId+"&isQrFlag=Y&prov="+province;
			    		//var url = "http://127.0.0.1:8086/ltePortal/staff/login/page?areaId="+areaId+"&isQrFlag=Y&prov="+province; 
			    		window.location = url;
			    	}
			    }
			});
		});
	};
	
	var _initEvent = function(){
		$('#switchLogin').off("click").on("click",function(event){
			if(_QRloginFlag){
				staff.qrlogin.stopInterval();
				$(".div_loginForm").css("display","block");
				$(".div_loginQrcode").css("display","none");
				$("#switchLogin").attr("title","扫码登录");
				$("#switchLogin img").attr("src","resources/image/login/login_qrcode.png");
				_QRloginFlag = false;
			}else if(!_QRloginFlag){
				$(".div_loginForm").css("display","none");
				$(".div_loginQrcode").css("display","block");
				$(".center_loginQrcode").css("display","block");
				$(".errQrcode").css("display","none");
				$(".successQrcode").css("display","none");
				$("#switchLogin").attr("title","表单登录");
				$("#switchLogin img").attr("src","resources/image/login/login_computer.png");
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
			/** 轮训请求,手机端是否扫码 **/
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
	
	var _stopInterval = function(){
		if(interval != null){
			window.clearInterval(interval);
		}
	};
	
	/**
	 * 获取二维码
	 */
	var _getQRCode = function(){
		var param = {
			queryFlag : "2"
		};
		
		$.ajax({
		    type: "GET",
		    dataType: "JSON",
		    url: "qrlogin",
		    async:false,
		    data: param,
		    success: function (response) {
		    	if (response.code == 0) {
					$("#qgcode").html("");
					var html= '<img src="" id="img_qrcode"/>';
				    $("#qgcode").html(html);
					$("#img_qrcode").attr("src",response.data);
				}else{
				}
		    },
	        error:function(response){
	        	_res = false;
	        }
		});
	};
	
	/**
	 * 轮训请求
	 */
	var _loopGet = function(){
		
		var resultData = null;
		var param = {
				queryFlag :"3"
		};
		$.ajax({
		    type: "GET",
		    dataType: "json",
		    url: "qrlogin",
		    async:false,
		    data: param,
		    success: function (response) {
		    	resultData = response;
		    }
		});
		
		return resultData;
	};
	
	return {
		initQRCode		:_initQRCode,
		loadEvent		:_loadEvent,
		jumpLogin		:_jumpLogin,
		initEvent		:_initEvent,
		getQRCode		:_getQRCode,
		loopGet			:_loopGet,
		stopInterval	:_stopInterval
	};
})(jQuery);
//初始化
$(function(){
});
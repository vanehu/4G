/**
 * 密码管理
 * 
 * @author wd
 */
CommonUtils.regNamespace("staffForget","info");

staffForget.info = (function(){
	//绑定验证
	var _initFormValidate = function(){
		//重新发送验证码成功后,验证码有效期初始化5分钟.
		sendSmsAfter30s();
		//5分钟倒计时，超过5分钟未输入验证码就失效.
		staff.login.leftInvalidTime=300;
		staff.login.invalidAfter5Mins();
		$("#smspwd").focus();
		
		var _smsFormIsValid = function() {
			//判断短信验证码是否过期
			if(staff.login.leftInvalidTime==0){
				$.alert("提示","对不起,您的短信验证码已经过期,请重新发送后再次验证.");
				return;
			}
			//判断短信验证错误次数,超过三次后,验证码失效，需要重新发送.
			if(staff.login.smsErrorCount==3){
				$.alert("提示","对不起,3次登录错误输入后验证码已自动失效,请重新发送验证码.");
				return;
			}
			var smspwd = $.trim($("#smspwd").val());
			if (smspwd=="") {
				smspwd="N";
			}
			var params="smspwd=" + smspwd;
			//_setDisable("#smsbutton", "#loginSmsForm");
			$.callServiceAsJson(contextPath+"/passwordMgr/smsValid", params, {
				"before":function(){
					$.ecOverlay("<strong>验证短信随机码中,请稍等会儿....</strong>");
//					_setDisable("#smsbutton", "#loginSmsForm");
				},
				"done" : callBack_success_sms_f,
				"always":function(){
					$.unecOverlay();
//					_setEnable("#smsbutton", "#loginSmsForm");
				}
			});
			//_setEnable("#smsbutton", "#loginSmsForm");
		};
		//短信发送成功回调函数
		var callBack_success_sms_f =function(response){
			if (response.code == 0) {
				$("#info_1").css("display","none");
				$("#info_2").css("display","none");
				$("#info_3").css("display","");
				
				//	staff.login.redirectUrl();
			//用户入参合法性校验数错
			} else if (response.code == -2) {
				$.alertM(response.data);
				
			} else if (response.code ==1001){
				ec.util.showErrors(response.errorsList,$("#form1"));
			//参数业务校验不通过
			} else if (response.code ==1004){	
				ec.util.showErrors(response.errorsList,$("#form1"));
			} else if (response.code ==1202){
				$.confirm("信息",response.data
						,{yes:function(
				){
					window.location.href=contextPath+"/staff/login/page";
				},no:""});
			}else if(response.code==1){
				staff.login.smsErrorCount=staff.login.smsErrorCount+1;
				$.alert("提示",response.data);
			}else {
				//if(response.errorsList&& response.errorsList.length>0 ){
				//	$.alert("提示",response.errorsList[0].message);
				//} else {
					$.alert("提示",response.data);
				//}
			}
			//_setEnable("#smsbutton", "#loginSmsForm");
		};
	};	
	//start
	
	//验证码重发成功回调函数
	var _callBack_success_smsresend1=function(response){
		if (response.code==0) {
			$.alert("提示","验证码发送成功，请及时输入验证.");
			$("#smsresend1").off("click").removeClass("cn").addClass("cf");
			//重新发送验证码成功后,验证错误次数置0.
			staff.login.smsErrorCount=0;
			//重新发送验证码成功后,验证码有效期初始化5分钟.
			staff.login.leftInvalidTime=300;
			sendSmsAfter30s();
			//5分钟倒计时，超过5分钟未输入验证码就失效.
			staff.login.invalidAfter5Mins();
		} else if (response.code ==1202){
//			$.confirm("信息",response.data
//					,{yes:function(
//			){
//				window.location.href=contextPath+"/staff/login/page";
//			},no:""},"error");
		} else{
			$.alert("提示","验证码发送失败，请重新发送.");
		};
	//	_setEnable("#smsbutton", "#loginSmsForm");
	};
	//刷新时间
	var second=30;
	var interResend=null;
	var showTime=function(){
		if (second>0){
			second=second-1;
			if(second==0){
				$("#smsresend1").removeClass("cf").addClass("cn").off("click").on("click",_smsResend);
				if(interResend!=null){
					window.clearInterval(interResend);
					$('#timeInfo').html("");
					$("#smsresend1").attr("title","请点击重新发送短信验证码.");	
					return;
				}
			}
		}
		$("#smsresend1").attr("title","请在"+second+"秒后再点击重新发送.");	
	};
	//30秒后重发短信验证码
	var sendSmsAfter30s=function(){
		 second=30;
		 window.clearInterval(interResend);
		 interResend=window.setInterval(showTime,1000);
	};
	//end
	//重发验证码
	var _smsResend=function(){
		var param = {
				"pageIndex":1,
				"pageSize":10
		};
		$.callServiceAsJson(contextPath + "/staffMgr/reSend",param,{
			"done" :_callBack_success_smsresend1
		});	
	};
	
	
	return {
		initFormValidate:_initFormValidate
		
	};
})();
$(function(){
	staffForget.info.initFormValidate();
});

CommonUtils.regNamespace("staff", "padlogin");
staff.padlogin = (function($) {
	var _logindo=function(staffCode,password,staffProvCode,flag){
		password = MD5(password);
		var padVersions="";//pad类型android还是ios
		if(ec.util.browser.versions.android){
			padVersions="0";
		}else{
			padVersions="1";
		}
		var params={
			"staffCode":staffCode,
			"password":password,
			"staffProvCode":staffProvCode,
			"lanIp":'',
			"do_single_sign":false,
			"flag":flag,
			"padVersions":padVersions
		};
		$.callServiceAsJson(contextPath+"/staff/login/padlogindo", params, {
			"done" : function(response){
				if(response.code==0){
					if (response.data == 'N') {
						_smsvalid('1');
					}else{
						_callLoginResult('T',response.data);
					}
				}else if(response.data.errMsg!=null&&response.data.errMsg!=undefined){
					_callLoginResult('N',response.data.errMsg);
				}else{
					_callLoginResult('N',response.data);
				}
			},
			"fail" : function(response){
				_callLoginResult('N','登录调用失败');
			}
		});
	};
	var _callLogin=function(){
		var params={};
		$.callServiceAsJson(contextPath+"/staff/login/padloginout", params, {
			"done" : function(response){
				if(response.code==0){					
					_callToLoginResult();
				}
			},
			"fail" : function(response){
				_callToLoginResult();
			}
		});
	};
	var _callToLoginResult=function(){
		var arr=[];
		MyPlugin.goLogin(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	var _callExit=function(){
		var arr=[];
		MyPlugin.exitSystem(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	var _callLoginResult=function(s,m){
		var arr=new Array(2);
		arr[0]=s;
		arr[1]=m;
		MyPlugin.loginStatus(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	var _callsmsValidResult=function(s,m,j){
		var arr=new Array(3);
		arr[0]=s;
		arr[1]=m;
		arr[2]=j;
		MyPlugin.smsStatus(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	var _smsvalid=function(smspwd){
		var params="smspwd="+smspwd;
		$.callServiceAsJson(contextPath+"/staff/login/smsValid", params, {
			"done" : function(response){
				if(response.code==0){
					_callsmsValidResult('T',response.data.indexPage,response.data.menus);
				}else{
					_callsmsValidResult('N',response.data,'');
				}
			},
			"fail" : function(response){
				_callsmsValidResult('N','短信验证失败','');
			}
		});
	};
	return {
		logindo : _logindo,
		callLogin:_callLogin,
		callExit:_callExit,
		smsvalid:_smsvalid
	};
})(jQuery);
//初始化
/*$(function(){
	var operateFlag=$("#operateFlag").val();
	if(operateFlag=="0"){//会话失效返回客户端登录页面
		staff.padlogin.callLogin();
	}
});*/
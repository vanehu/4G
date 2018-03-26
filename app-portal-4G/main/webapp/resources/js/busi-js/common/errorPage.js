/**
 * 错误页面使用js
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("common", "errorPage");
/**
 * 地区查询
 */
common.errorPage = (function($){
	var _setCookie=function(name, value, date) {
		var Days = date;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/;";
	};
	var _getCookie=function(name) {
		var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (arr != null) return unescape(arr[2]);
		return null;
	};
	
	var _showError=function(){
		try{
//			var tempdata=eval('('+errorJson+')');
			if (errorJson == undefined || errorJson == '') {
				return;
			}
			var tempdata = errorJson;
				
			if(tempdata && typeof tempdata.data!="undefined" && typeof tempdata.code!="undefined"){
				//异常信息
				if(tempdata.code == -2) {
					$.alertM(tempdata.data);
					return;
				}
			}
		}catch(e){
			//alert(e.name + ": " + e.message);
		}
	};
	
	return {
		showError : _showError
	};
})(jQuery);

//初始化
$(function(){
	common.errorPage.showError();
});
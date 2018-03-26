
CommonUtils.regNamespace("cfq"); 

/**
 *芝麻信用.
 */
cfq = (function(){
	var _init = function(){
		var userName = "";
		var cardNo = "";
		userName = OrderInfo.cust.partyName;
		if(OrderInfo.cust.custId==-1){
			cardNo = OrderInfo.cust.identityNum;
		}else{
			cardNo = OrderInfo.cust.idCardNumber;
		}
		$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		//查分省前置校验开关
		var propertiesKey = "ZHIMA_URL";
		var url = offerChange.queryPortalProperties(propertiesKey);
		if("https:"==document.location.protocol){
			url = url.replace("http:","https:");
		}else if("http:"==document.location.protocol){
			url = url.replace("https:","http:");
		}
		if(url.length == 0){
			$.alert("提示","MDA未配置芝麻信用查询地址！");
			return;
		}else if(OrderInfo.cust.identityCd!=1){
//			$.alert("提示","请用实名客户受理业务！");
			var msg="请用实名客户受理业务！";
			$("#btn-dialog-ok").removeAttr("data-dismiss");
			$('#alert-modal').modal({backdrop: 'static', keyboard: false});
			$("#btn-dialog-ok").off("click").on("click",function(){
				$("#alert-modal").modal("hide");
				common.relocationCust();
//				common.callCloseWebview();
			});
			$("#modal-title").html("信息提示");
			$("#modal-content").html(msg);
			$("#alert-modal").modal();
			return;
		}else{
			var params = {
					"userName":encodeURI(userName,"utf-8"),
					"cardNo":cardNo+""
				};
//			var url="http://4gpay.asiainfo.org/pay_web/credit/queryCreditState";
//			var url="http://192.168.4.163:8080/pay_web/credit/queryCreditState";
//			var url="http://4gpay.asiainfo.org/pay_web/credit/demo2";
			$.ajax({
				type : "GET",// 用GET方式传输
				data :params,
				dataType:'jsonp',
				jsonp:'callback',		
				url : url,// 目标地址
				success : function(response) {
					$.unecOverlay();
//					alert(JSON.stringify(response));
					if (response.resultCode == 0) {
						var zmScore = response.zmScore;
						var openId = response.openId;
						window.location.href="http://ued.asiainfo.org/demo/uicenter/esale/zhima_phone_add.html?credit="+zmScore;
					}else{
						$.alert("提示","您未授权，请先授权再受理业务！");
						$("#init_content").hide();
						$("#fail_content").show();
					}
				},fail:function(response){
					$.unecOverlay();
					$("#sp_loading").text("查询失败，请稍后再试！");
					$.alert("提示","查询失败，请稍后再试！");
				}
			});
		}
	}
	
	return {
		init	:	_init
	};
	
})();

CommonUtils.regNamespace("ess", "writeCard");
/*
 * 电渠终端管理
 */
ess.writeCard = (function() {
	
	var _initDic = function() {
		//订单类型、订单状态
		var contentFlaParam = {
			"requestContentFlag": [
				"orderType", "orderStatus"
			]
		};
		var url = contextPath + "/ess/order/orderStatusAndTypeQuery";
		$.callServiceAsJson(url, contentFlaParam, {
			"before" : function() {
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (response.code == 0) {
					$.each(response.data.orderStatusList,function(){
					    $("#p_orderStatus").append("<option value='"+this.orderStatus+"' >"+this.orderStatusName+"</option>");
					});
				} else if (response.code == -2) {
					$.alertM(response.data);
				} else if (response.code == 1002) {
					$.alert("错误",response.data);
				} else {
					$.alert("异常", "ESS订单相关常量查询接口查询异常");
					return;
				}
			},
			fail : function(response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	// 查询
	var _queryOrderList = function(pageIndex) {
		var curPage = 1;
		if (pageIndex > 0) {
			curPage = pageIndex;
		};
		var extCustOrderId = ec.util.defaultStr($("#p_extCustOrderId").val());
		var consignee = ec.util.defaultStr($("#p_consignee").val());
		var accNbr = ec.util.defaultStr($("#p_accNbr").val());
		var orderStatus = ec.util.defaultStr($("#p_orderStatus").val());
		var startDate = ec.util.defaultStr($("#p_startDate").val());
		var endDate = ec.util.defaultStr($("#p_endDate").val());
		var param = {
			extCustOrderId : extCustOrderId,
			consignee : consignee,
			accNbr : accNbr,
			orderStatus : orderStatus,
			startDate : startDate,
			endDate : endDate,
			pageFlag : "writeCardPage",
			nowPage:curPage,
			pageSize:10
		};
		$.callServiceAsHtml(contextPath + "/ess/order/orderListQry", param, {
			"before" : function() {
				$.ecOverlay("ESS订单查询中，请稍等...");
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (response && response.code == -2) {
					return;
				} else if (response.data
						&& response.data.substring(0, 6) != "<table") {
					$.alert("提示", response.data);
				} else {
					$("#cart_list").html(response.data).show();
				}
			},
			fail : function(response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	};

	var _realNameAuth = function(extCustOrderId){
		var pwdKey = "0CC13AE01AFF1868E053433210AC1DC1";
		var reqTime = DateUtil.Format("yyyymmddhhmmssx",new Date());
		var accessToken = extCustOrderId+""+reqTime+""+pwdKey;
		accessToken = MD5(accessToken);
		var param ={
		    extCustOrderId : extCustOrderId,
		    reqTime : reqTime,
		    accessToken : accessToken
		};
		var response = $.callServiceAsJson(contextPath+"/ess/order/toRealNameAuth",param);
		if (response.code == 0) {
			window.parent.main.home.addTab("","实名制认证",response.data);	
		} else if (response.code == -2) {
			$.alertM(response.data);
		} else if (response.code == 1002) {
			$.alert("错误",response.data);
		} else {
			$.alert("异常", "终端回填异常");
			return;
		}
		
	};
	
	return {
		initDic : _initDic,
		queryOrderList : _queryOrderList,
		realNameAuth : _realNameAuth
	};

})();
// 初始化
$(function() {
	$("#p_startDate").off("click").on("click", function() {
		var p_endDate = $("#p_endDate").val();
		if (p_endDate == null || p_endDate == "") {
			p_endDate = DateUtil.Format("yyyy-MM-dd", new Date());
		};
		$.calendar({format : 'yyyy年MM月dd日 ',real : '#p_startDate',maxDate : p_endDate});
	});
	$("#p_endDate").off("click").on("click", function() {
		$.calendar({format : 'yyyy年MM月dd日 ',real : '#p_endDate',minDate : $("#p_startDate").val(),maxDate : '%y-%M-%d'});
	});
	$("#bt_orderListQry").off("click").on("click", function() {
		ess.writeCard.queryOrderList(1);
	});
	ess.writeCard.initDic();
});
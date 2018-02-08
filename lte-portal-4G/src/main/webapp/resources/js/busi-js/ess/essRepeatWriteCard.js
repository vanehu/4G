CommonUtils.regNamespace("ess", "repeatWriteCard");
/*
 * ESS二次写卡
 */
ess.repeatWriteCard = (function() {

	// 查询
	var _queryOrderList = function(pageIndex) {
		var curPage = 1;
		if (pageIndex > 0) {
			curPage = pageIndex;
		};
		var extCustOrderId = ec.util.defaultStr($("#p_extCustOrderId").val());
		var accNbr = ec.util.defaultStr($("#p_accNbr").val());
		var startDate = ec.util.defaultStr($("#p_startDate").val());
		var endDate = ec.util.defaultStr($("#p_endDate").val());
		if(extCustOrderId=="" && accNbr==""){
			$.alert("提示","'外部订单号'和'手机号码'必须输入一个条件！");
			return;
		}
		var param = {
			extCustOrderId : extCustOrderId,
			accNbr : accNbr,
			startDate : startDate,
			endDate : endDate,
			pageFlag : "repeatWriteCardPage",
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

	
	return {
		queryOrderList : _queryOrderList
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
		ess.repeatWriteCard.queryOrderList(1);
	});
});
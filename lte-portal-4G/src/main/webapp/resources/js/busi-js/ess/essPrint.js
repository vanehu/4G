CommonUtils.regNamespace("ess", "print");

/*
 * 远程写卡
 */
ess.print = (function() {

	// 查询
	var _queryOrderList = function(pageIndex) {
		var curPage = 1;
		if (pageIndex > 0) {
			curPage = pageIndex;
		};
		var transactionId = ec.util.defaultStr($("#p_transactionId").val());
		var consignee = ec.util.defaultStr($("#p_consignee").val());
		var accNbr = ec.util.defaultStr($("#p_accNbr").val());
		var startDate = ec.util.defaultStr($("#p_startDate").val());
		var endDate = ec.util.defaultStr($("#p_endDate").val());
		var param = {
			transactionId : transactionId,
			consignee : consignee,
			accNbr : accNbr,
			startDate : startDate,
			endDate : endDate,
			pageFlag : "invoicePrintPage",
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
	
	var _preVoucher=function(olId,areaId,accNbr){
		var soNbr = UUID.getDataId();
		var param = {
				areaId : areaId,
				acctNbr : accNbr,
				soNbr : soNbr,
				type : "2"
		};
		var loadInstFlag = query.offer.invokeLoadInst(param);
		if (!loadInstFlag) {
			$.alert("提示", "加载订单回执全量信息失败");
			return;
		}
		var voucherInfo = {
			"olId":olId,
			"soNbr": soNbr,
			"busiType":"1",
			"chargeItems":""
		};
		common.print.printVoucher(voucherInfo);
	};
	
	return {
		queryOrderList : _queryOrderList,
		preVoucher : _preVoucher
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
		ess.print.queryOrderList(1);
	});
});
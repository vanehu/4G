CommonUtils.regNamespace("ess", "print");

/*
 * 回执打印
 */
ess.print = (function() {

	// 查询
	var _queryOrderList = function(pageIndex) {
		var curPage = 1;
		if (pageIndex > 0) {
			curPage = pageIndex;
		};
		var extCustOrderId = ec.util.defaultStr($("#p_extCustOrderId").val());
		var consignee = ec.util.defaultStr($("#p_consignee").val());
		var accNbr = ec.util.defaultStr($("#p_accNbr").val());
		var startDate = ec.util.defaultStr($("#p_startDate").val());
		var endDate = ec.util.defaultStr($("#p_endDate").val());
		if(extCustOrderId == "" && consignee == "" && accNbr == "" && startDate == "" && endDate == ""){
			$.alert("提示","请输入查询条件！");
			return;
		}
		if(startDate != "" || endDate != ""){
			if(startDate == ""){
				$.alert("提示","请选择 开始时间！");
				return;
			}
			if(endDate == ""){
				var nowDate = Date.now();
				endDate = DateUtil.Format('yyyy-MM-dd', nowDate);
			}
			try {
				var startDate_temp = new Date(startDate);
				var endDate_temp = new Date(endDate);
				if((endDate_temp.getTime() - startDate_temp.getTime())/1000/60/60/24 > 31){
					$.alert("提示","请将查询时间段缩小至一个月以内！");
					return;
				}
			} catch (e) {
			}
		}
		var param = {
			extCustOrderId : extCustOrderId,
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
	
	var _preVoucher=function(olId,areaId,accNbr,orderType,extCustOrderId,extSystem){
		var soNbr = UUID.getDataId();
		var param = {
				areaId : areaId,
				acctNbr : accNbr,
				soNbr : soNbr,
				type : "2"
		};
		if("newInstall" != orderType && "preInstall" != orderType){
			var loadInstFlag = query.offer.invokeLoadInst(param);
			if (!loadInstFlag) {
				$.alert("提示", "加载订单回执全量信息失败");
				return;
			}
		}
		var voucherInfo = {
			"olId":olId,
			"soNbr": soNbr,
			"busiType":"1",
			areaId : areaId,
			orderType : orderType,
			"extCustOrderId":extCustOrderId,
			"extSystem":extSystem,
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
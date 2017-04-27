CommonUtils.regNamespace("essOrder", "main");

/*
 * 电渠订单管理
 */
essOrder.main = (function() {

	var _initDic = function() {
		//号卡发货渠道
		var dataRangeParam = {
			"operatSpecCd":"PHONECARD_CHANNEL_LIMIT",
			"dataDimensionCd":"4G_CHANNEL_RANG"
		};
		var url = contextPath + "/ess/order/queryAuthenticDataRange";
		$.callServiceAsJson(url, dataRangeParam, {
			"before" : function() {
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (response.code == 0) {
					$.each(response.data,function(){
					    $("#p_accNbrSellChannel").append("<option value='"+this.dimensionValue+"' >"+this.dataDimensionName+"</option>");
					});
				}else {
					return;
				}
			},
			fail : function(response) {
				$.unecOverlay();
			}
		});
		//终端发货渠道
		var dataRangeParam = {
			"operatSpecCd":"ZDFH_CHANNEL_LIMIT",
			"dataDimensionCd":"4G_CHANNEL_RANG"
		};
		var url = contextPath + "/ess/order/queryAuthenticDataRange";
		$.callServiceAsJson(url, dataRangeParam, {
			"before" : function() {
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (response.code == 0) {
					$.each(response.data,function(){
					    $("#p_termSellChannel").append("<option value='"+this.dimensionValue+"' >"+this.dataDimensionName+"</option>");
					});
				} else {
					return;
				}
			},
			fail : function(response) {
				$.unecOverlay();
			}
		});
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
					$.each(response.data.orderTypeList,function(){
					    $("#p_orderType").append("<option value='"+this.orderType+"' >"+this.orderTypeName+"</option>");
					});
				}else {
					return;
				}
			},
			fail : function(response) {
				$.unecOverlay();
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
		var orderType = ec.util.defaultStr($("#p_orderType").val());
		var commonRegionId = ec.util.defaultStr($("#p_areaId").val());
		var transactionId = ec.util.defaultStr($("#p_transactionId").val());
		var orderStatus = ec.util.defaultStr($("#p_orderStatus").val());
		var channelId = ec.util.defaultStr($("#p_channelId").val());
		var startDate = ec.util.defaultStr($("#p_startDate").val());
		var endDate = ec.util.defaultStr($("#p_endDate").val());
		var accNbr = ec.util.defaultStr($("#p_accNbr").val());
		var accNbrSellChannel = ec.util.defaultStr($("#p_accNbrSellChannel").val());
		var termSellChannel = ec.util.defaultStr($("#p_termSellChannel").val());
		if (startDate == "") {
			$.alert("提示", "请选择'开始时间' 再查询");
			return;
		} else if (endDate == "") {
			$.alert("提示", "请选择'结束时间' 再查询");
			return;
		};
		var param = {
			extCustOrderId : extCustOrderId,
			orderType : orderType,
			commonRegionId : commonRegionId,
			essTransactionId : transactionId,
			orderStatus : orderStatus,
			channelId : channelId,
			startDate : startDate,
			endDate : endDate,
			accNbr : accNbr,
			accNbrSellChannel : accNbrSellChannel,
			termSellChannel : termSellChannel,
			pageFlag : "orderQueryPage",
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

	var _chooseAllArea = function(areaName, areaId) {
		order.area.chooseAreaTreeAll(areaName, areaId, "3");
	};
	

	var _orderEvent = function(olId) {
		var param = {
		    olId : olId
		};
		$.callServiceAsHtml(contextPath + "/ess/order/showOrderEvent",param,{
			"before" : function() {
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (!response) {
					response.data = '';
				}
				$("#div_orderEvent_dialog").html(response.data);
				easyDialog.open({
					container : "div_orderEvent_dialog"
				});

			}
		});

	};
 
	var _queryOrderInfo = function(olId,splitOrderOlId,commonRegionId) {
		var olIds;
		if(splitOrderOlId!=null && splitOrderOlId !=""){
			olIds = [olId,splitOrderOlId];
		}else{
			olIds = [olId];
		}
		var param = {
		    "olIds":olIds,
		    areaId : commonRegionId
		};
		$.callServiceAsHtml(contextPath+"/ess/order/queryOrderInfo",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response.data && response.data.substring(0,4)!="<div"){
					$.alert("提示",response.data);
				}else{
					$("#d_query").hide();
					$("#d_essOrderInfo").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _showMain = function(){
		$("#d_essOrderInfo").hide();
		$("#cart_link").hide();
		$("#d_query").show();
	};
	
	var _exportExcel = function(){
		var extCustOrderId = ec.util.defaultStr($("#p_extCustOrderId").val());
		var orderType = ec.util.defaultStr($("#p_orderType").val());
		var commonRegionId = ec.util.defaultStr($("#p_areaId").val());
		var transactionId = ec.util.defaultStr($("#p_transactionId").val());
		var orderStatus = ec.util.defaultStr($("#p_orderStatus").val());
		var channelId = ec.util.defaultStr($("#p_channelId").val());
		var startDate = ec.util.defaultStr($("#p_startDate").val());
		var endDate = ec.util.defaultStr($("#p_endDate").val());
		var accNbr = ec.util.defaultStr($("#p_accNbr").val());
		var accNbrSellChannel = ec.util.defaultStr($("#p_accNbrSellChannel").val());
		var termSellChannel = ec.util.defaultStr($("#p_termSellChannel").val());
		var url = contextPath + "/ess/order/exportExcel?transactionId="
				+ transactionId + "&orderType=" + orderType
				+ "&commonRegionId=" + commonRegionId + "&extCustOrderId="
				+ extCustOrderId + "&orderStatus=" + orderStatus
				+ "&channelId=" + channelId + "&accNbrSellChannel="
				+ accNbrSellChannel + "&termSellChannel=" + termSellChannel
				+ "&startDate=" + startDate + "&endDate=" + endDate
				+ "&accNbr=" + accNbr;
		$("#essOrderList_action").attr("action", url);
		$("#essOrderList_action").submit();			
	};
	
	
	return {
		initDic : _initDic,
		queryOrderList : _queryOrderList,
		chooseAllArea : _chooseAllArea,
		orderEvent : _orderEvent,
		queryOrderInfo : _queryOrderInfo,
		showMain : _showMain,
		exportExcel : _exportExcel
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
		essOrder.main.queryOrderList(1);
	});
	essOrder.main.initDic();
	$("#bt_exportExcel").off("click").on("click", function() {
		essOrder.main.exportExcel();
	});
	
});
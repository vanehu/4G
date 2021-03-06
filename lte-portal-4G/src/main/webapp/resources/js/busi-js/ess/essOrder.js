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
		var extCustOrderIds = extCustOrderId.split(",");
		if(extCustOrderIds.length > 1000){
			$.alert("提示","按订单号批量查询时数量不能超过1000笔，请重新输入！");
			return;
		}
		var orderType = ec.util.defaultStr($("#p_orderType").val());
		var commonRegionId = ec.util.defaultStr($("#p_areaId").val());
		var province = commonRegionId;
		if(commonRegionId.endWith("0000")){//如果是二级地区，将commonRegionId置空
			commonRegionId = "";
		}
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
		if(extCustOrderId == "" && transactionId == "" && accNbr == ""){
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
			orderType : orderType,
			commonRegionId : commonRegionId,
			province:province,
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
 
	var _queryOrderInfo = function(olId,splitOrderOlId,commonRegionId,staffName,staffCode) {
		var olIds;
		if(splitOrderOlId!=null && splitOrderOlId !=""){
			olIds = [olId,splitOrderOlId];
		}else{
			olIds = [olId];
		}
		var param = {
		    "olIds":olIds,
		    areaId : commonRegionId,
		    "staffName":staffName,
		    "staffCode":staffCode
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
		var extCustOrderIds = extCustOrderId.split(",");
		if(extCustOrderIds.length > 1000){
			$.alert("提示","按订单号批量导出时数量不能超过1000笔，请重新输入！");
			return;
		}
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
		if(extCustOrderId == "" && orderType == "" && commonRegionId == "" && transactionId == "" && orderStatus == "" && channelId == "" && accNbr == "" && accNbrSellChannel == "" && termSellChannel == "" && startDate == "" && endDate == ""){
			$.alert("提示","请输入导出条件！");
			return;
		}
		if(extCustOrderId == "" && (startDate != "" || endDate != "")){
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
					$.alert("提示","请将导出时间段缩小至一个月以内！");
					return;
				}
			} catch (e) {
			}
		}
		var url = contextPath + "/ess/order/exportExcel?transactionId="
				+ transactionId + "&orderType=" + orderType
				+ "&commonRegionId=" + commonRegionId + "&orderStatus=" + orderStatus
				+ "&channelId=" + channelId + "&accNbrSellChannel="
				+ accNbrSellChannel + "&termSellChannel=" + termSellChannel
				+ "&startDate=" + startDate + "&endDate=" + endDate
				+ "&accNbr=" + accNbr;
		$("#p_extCustOrderId_hidden").attr("value", extCustOrderId);
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


String.prototype.endWith=function(str){  
	var reg=new RegExp(str+"$");  
	return reg.test(this);  
	}   
CommonUtils.regNamespace("essMktRes", "terminal");

/*
 * ESS终端回填
 */
essMktRes.terminal = (function() {

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
				} else {
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
		var consignee = ec.util.defaultStr($("#p_consignee").val());
		var accNbr = ec.util.defaultStr($("#p_accNbr").val());
		var orderStatus = ec.util.defaultStr($("#p_orderStatus").val());
		var startDate = ec.util.defaultStr($("#p_startDate").val());
		var endDate = ec.util.defaultStr($("#p_endDate").val());
		var province = ec.util.defaultStr($("#p_areaId").val());
		if(extCustOrderId == "" && consignee == "" && accNbr == "" && orderStatus == "" && startDate == "" && endDate == ""){
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
			province : province,
			consignee : consignee,
			accNbr : accNbr,
			orderStatus : orderStatus,
			startDate : startDate,
			endDate : endDate,
			pageFlag : "terminalInfoPage",
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
		order.area.chooseAreaTreeAll(areaName, areaId, "2");
	};
	
	var _showTerminalBackfill = function(extCustOrderId,commonRegionId,channelId,channelName) {
		var param = {
			extCustOrderId : extCustOrderId,
			commonRegionId : commonRegionId,
			channelId : channelId,
			channelName : channelName
		};
		$.callServiceAsHtml(contextPath + "/ess/order/showTerminalBackfill",param,{
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
				$("#chkTsnAForm").off('formIsValid').on('formIsValid',function(event,form){				
					_mktResInstMakeUp(param.channelName);
				}).ketchup({bindElement:"bt_backFill"});
			}
		});

	};
	

	var _mktResInstMakeUp = function(channelName) {
		var extCustOrderId = $("#s_extCustOrderId").val();
		var areaId = $("#s_commonRegionId").val();
		var channelId = $("#s_channelId").val();
		//var channelName = $("#s_channelName").val();
		var mktResInstCode = $("#s_mktResInstCode").val();
		if(!ec.util.isObj(mktResInstCode)){
			$.alert("提示", "请输入终端串号！");
			return;
		}
		var param = {
			extCustOrderId : extCustOrderId,
			commonRegionId : areaId,
			instCode : mktResInstCode,
			channelId : channelId,
			channelName : channelName
		};
		var url = contextPath + "/ess/order/mktResInstMakeUp";
		$.callServiceAsJson(url, param, {
			"before" : function() {
				$.ecOverlay("正在串码回填，请稍等...");
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (response.code == 0) {
					$.alert("提示", "终端回填成功！");
				} else if (response.code == -2) {
					$.alertM(response.data);
				} else if (response.code == 1002) {
					$.alert("错误",response.data);
				} else {
					$.alert("异常", "终端回填异常");
					return;
				}
			},
			fail : function(response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});

	};
	var _showMain = function(){
		$("#d_cartInfo").hide();
		$("#cart_link").hide();
		$("#d_query").show();
	};
	
	return {
		initDic : _initDic,
		queryOrderList : _queryOrderList,
		showTerminalBackfill : _showTerminalBackfill,
		mktResInstMakeUp : _mktResInstMakeUp,
		showMain : _showMain,
		chooseAllArea : _chooseAllArea
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
		essMktRes.terminal.queryOrderList(1);
	});
	essMktRes.terminal.initDic();
});
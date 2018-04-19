CommonUtils.regNamespace("essPartner", "main");

/*
 * ESS第三方合作商订单管理
 */
essPartner.main = (function() {

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
					$.each(response.data.orderTypeList,function(){
					    $("#p_orderType").append("<option value='"+this.orderType+"' >"+this.orderTypeName+"</option>");
					});
				} else {
					return;
				}
			},
			fail : function(response) {
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
		var orderType = ec.util.defaultStr($("#p_orderType").val());
		var commonRegionId = ec.util.defaultStr($("#p_areaId").val());
		var transactionId = ec.util.defaultStr($("#p_transactionId").val());
		var orderStatus = ec.util.defaultStr($("#p_orderStatus").val());
		var channelId = ec.util.defaultStr($("#p_channelId").val());
		var startDate = ec.util.defaultStr($("#p_startDate").val());
		var endDate = ec.util.defaultStr($("#p_endDate").val());
		var accNbr = ec.util.defaultStr($("#p_accNbr").val());
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
			pageFlag : "partnerAssitPage",
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
	
	var _returnGoods = function(extCustOrderId,lanId,accNbr,channelId) {
		var param = {
			custOrder : {
				extCustOrderId : extCustOrderId,
				channelId : channelId,
				serviceOfferId : "4090000000",
				serviceOfferName : "退货",
				accNbr : accNbr,
				lanId : lanId,
			}
		}; 
		_orderRepeal(param);
	};
	
	var _unOrder = function(extCustOrderId,lanId,accNbr,channelId) {
		var param = {
				custOrder : {
					extCustOrderId : extCustOrderId,
					channelId : channelId,
					serviceOfferId : "5010100001",
					serviceOfferName : "撤单",
					lanId : lanId,
				}
			};
		_orderRepeal(param);
	};
	
	var _exchangeGoods = function(extCustOrderId,lanId,accNbr,channelId,isNeedNewMktCode) {
		if(isNeedNewMktCode){
			var color = $("#"+"color_"+extCustOrderId).val();
			var model = $("#"+"model_"+extCustOrderId).val();
			var brand = $("#"+"brand_"+extCustOrderId).val();
			var mktResCdName = $("#"+"mktResCdName_"+extCustOrderId).val();
			var salesPrice = $("#"+"salesPrice_"+extCustOrderId).val();
			var mktResInstCode = $("#"+"mktResInstCode_"+extCustOrderId).val();
			var exchangeGoodsInfo = {
					custOrder : {
						extCustOrderId : extCustOrderId,
						channelId : channelId,
						serviceOfferId : "4040800002",
						serviceOfferName : "换货",
						accNbr : accNbr,
						lanId : lanId,
					}
			};
			OrderInfo.essOrderInfo.exchangeGoodsInfo = exchangeGoodsInfo;
			var param = {
					color : color,
					model : model,
					brand : brand,
					mktResInstCode : mktResInstCode,
					salesPrice : salesPrice,
					mktResCdName : mktResCdName,
					accNbr : accNbr,
					extCustOrderId : extCustOrderId
			};
			_showExchangeGoods(param);
		}else{
			var param = {
					custOrder : {
						extCustOrderId : extCustOrderId,
						channelId : channelId,
						serviceOfferId : "4040800002",
						serviceOfferName : "换货",
						accNbr : accNbr,
						lanId : lanId,
					}
				};
			_orderRepeal(param);
		}
	};
	
	var _orderRepeal  = function(param) {
		var url = contextPath + "/ess/order/orderRepeal";
		$.callServiceAsJson(url, param, {
			"before" : function() {
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (response.code == 0) {
					var show = "'"+param.custOrder.serviceOfferName+"'操作成功";
					$.alert("提示",show);
					easyDialog.close();
				} else if (response.code == -2) {
					$.alertM(response.data);
				} else if (response.code == 1002) {
					$.alert("错误",response.data);
				} else {
					$.alert("异常", "ESS订单下发接口异常");
					return;
				}
			},
			fail : function(response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _showExchangeGoods = function(param) {
		$.callServiceAsHtml(contextPath + "/ess/order/showExchangeGoods",param,{
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
					var inParam = {};
					OrderInfo.essOrderInfo.exchangeGoodsInfo.custOrder.newMktResInstCode = $("#p_mktResInstCode").val();
					inParam = OrderInfo.essOrderInfo.exchangeGoodsInfo;
					_orderRepeal(inParam);
				}).ketchup({bindElement:"bt_orderRepeal"});
			}
		});

	};

	return {
		initDic : _initDic,
		queryOrderList : _queryOrderList,
		chooseAllArea : _chooseAllArea,
		returnGoods : _returnGoods,
		unOrder : _unOrder,
		exchangeGoods : _exchangeGoods,
		orderRepeal : _orderRepeal,
		showExchangeGoods : _showExchangeGoods
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
		essPartner.main.queryOrderList(1);
	});
	essPartner.main.initDic();
});
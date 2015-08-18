/**
 *  付费方式修改
 */
CommonUtils.regNamespace("prod", "paymentTypeChange");

prod.paymentTypeChange = (function() {

	//初始化
	var _init = function() {
		var param = {
			offerSpecId : order.prodModify.choosedProdInfo.prodOfferId, 
			offerTypeCd : 1,
			partyId : OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}

		var prodFeeType = order.prodModify.choosedProdInfo.feeType; // 产品的 
		var offerSpecFeeType = offerSpec.feeType; //套餐的的产品
		if(prodFeeType == '2100' || prodFeeType == '1201'){ // 
			$.alert("提示","您当前的付费类型为" + order.prodModify.choosedProdInfo.feeTypeName +",不能进行变更");
			return;
		}
		else if(offerSpecFeeType == '1401' || offerSpecFeeType == '1404' || offerSpecFeeType == '1406' || offerSpecFeeType == '1407'){ // 
			$.alert("提示","没有可变更的付费类型!");
			return;
		}
		var prod = order.prodModify.choosedProdInfo;
		var actionFlag = 35;
		var opeName = "改付费方式";
		var BO_ACTION_TYPE = CONST.BO_ACTION_TYPE.CHANGE_FEE_TYPE;
		var callParam = {
			prodId : prod.prodInstId
		};
	//	_initFillPage(callParam);
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION, BO_ACTION_TYPE,
				actionFlag, opeName, "");
		var param = _getCallRuleParam(BO_ACTION_TYPE,prod.prodInstId);
		rule.rule.prepare(param,'prod.paymentTypeChange.initFillPage',callParam);
		//SoOrder.builder();
	};
	//业务规则校验
	var _getCallRuleParam = function(boActionTypeCd,prodId) {
		return {
			areaId : OrderInfo.staff.areaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			custFlag :OrderInfo.cust.custFlag,
			boInfos : [{
				boActionTypeCd : boActionTypeCd,
				instId : prodId,
				specId : CONST.PROD_SPEC.CDMA,
				prodId : prodId
			}]
		};
	};

	//初始化填单页面
	var _initFillPage = function(param) {
		var prodInfo = order.prodModify.choosedProdInfo;
		$.callServiceAsHtml(contextPath + "/prod/changePaymentType", param, {
			"before" : function() {
			},
			"done" : function(response) {
				$("#order_fill_content").html(response.data).show();
				$("#fillLastStep").click(function() {
					order.prodModify.cancel();
				});
				
				$("input:radio").each(function(i){//遍历对象
			           if(this.value== order.prodModify.choosedProdInfo.feeType){
			                $(this).attr("checked","true");
			           }
			    });
			           
				//$("#paymentType").attr("value",order.prodModify.choosedProdInfo.feeType);
				//$("#paymentType").val(order.prodModify);
				$("#nothreelinks").css("display","none");
				$(".ordercon").show();
				$(".ordertabcon").show();
				$(".h2_title").append(prodInfo.productName+"-"+prodInfo.accNbr);
				order.prepare.step(1);
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always" : function() {
				$.unecOverlay();
			}
		});
	};

	//订单提交
	var _submit = function() {
		var oldOfferFeeType = order.prodModify.choosedProdInfo.feeType;
		var newOfferFeeType = $("input[name=paymentType]:checked").attr("value");
		if (newOfferFeeType == oldOfferFeeType) {
			$.alert("提示","当前付费类型未做修改，无须提交");
			return;
		}
		var busiOrder = [];
		_createChangeFeeType(busiOrder);
		SoOrder.submitOrder(busiOrder);
    };
	//创建变更付费类型节点
	var _createChangeFeeType = function(busiOrders) {
		var oldOfferFeeType = order.prodModify.choosedProdInfo.feeType;
		var newOfferFeeType = $("input[name=paymentType]:checked").attr("value");
		//if (newOfferFeeType != oldOfferFeeType) {
			var prod = order.prodModify.choosedProdInfo;
			var busiOrder = {
				areaId : OrderInfo.getProdAreaId(prod.prodInstId), //受理地区ID
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				},
				busiObj : { //业务对象节点
					instId : order.prodModify.choosedProdInfo.prodInstId, //业务对象实例ID
					objId : order.prodModify.choosedProdInfo.productId,  //产品规格ID
					accessNumber : prod.accNbr
				//接入号码
				},
				boActionType : {
					actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
					boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_FEE_TYPE
				},
				data : {
					boProdFeeTypes : [ {
						feeType : oldOfferFeeType,
						state : "DEL"
					}, {
						feeType : newOfferFeeType,
						state : "ADD"
					} ]
				}
			};
			busiOrders.push(busiOrder);
		//}
	};
	return {
		init : _init,
		initFillPage : _initFillPage,
		submit : _submit
	};
})();
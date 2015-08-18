/**
 * 终端入口
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("mktRes", "terminal", "exchange");
/**
 * 终端入口
 */
mktRes.terminal.exchange = (function($){
	var _init = function(){
		$("#bt_terminalQry").off("click").on("click", function(){
			_terminalQuery($("#p_qryNumber").val());
		});
	};
	// 根据终端串码查询终端信息
	var _terminalQuery = function(instCode){
		if (instCode == "") {
			$.alert("提示","<br/>请先输入终端串码。");
			return;
		}
		var url = contextPath+"/mktRes/terminal/queryCoupon";
		var param = {
			"couponNumber" : instCode
		};
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				$("#coupon_tab tbody").html('');
				$("#terminalTr").removeData("couponInfo");
				
				if(response.code == -2) {
					$.alertM(response.data);
					return;
				} else if(response.code != 0) {
					$.alert("提示","<br/>查询失败,请稍后重试。");
					return;
				}
				var data = response.data;
				if (data.code != 0) {
					$.alert("提示",data.msg);
					return;
				}
				//判断id是否存在
				if (data.id == undefined) {
					$.alert("提示", "返回的数据中缺少ID，请确认。");
					return;
				}
				if (data.instInfo && data.instInfo.length > 0 && data.instInfo[0].prodId != undefined) {
					data.instFlag = true;
				} else {
					data.instFlag = false;
				}
				
				var html = '';
				html += '<tr id="terminalTr">';
				html += '<td>'+ data.couponNumber +'</td>';
				html += '<td>'+ data.couponName +'</td>';
				html += '<td>'+ data.channelName +'</td>';
				html += '<td>'+ data.staffName +'</td>';
				html += '<td>'+ data.statusDate +'</td>';
				html += '<td>'+ data.olNbr +'</td>';
				if (data.instFlag) {
					if (!data.offerId) {
						$.alert("提示","接口返回中未包含合约销售品实例ID，请检查省内返回数据。门户接口流水为"+data.transcationId);
					}
					if (!data.instInfo[0].accessNbr) {
						$.alert("提示","接口返回中未包含接入号，请检查省内返回数据。门户接口流水为"+data.transcationId);
					}
					html += '<td>';
					html += '产品信息：' + ec.util.defaultStr(data.instInfo[0].prodSpecName, "") + ' - ' + ec.util.defaultStr(data.instInfo[0].accessNbr, "") + '<br/>';
					html += '销售品信息：' + ec.util.defaultStr(data.instInfo[0].offerSpecName, "");
					html += '</td>';
				} else {
					html += '<td></td>';
				}
				var ahtml = '';
				ahtml += '<a id="exchangeTerminalA" class="purchase">换货</a>';
				if (!data.instFlag) {
					ahtml += '<a id="returnTerminalA" class="purchase">退货</a>';
				}
				html += '<td>'+ ahtml +'</td>';
				html += '</tr>';
				
				$("#coupon_tab tbody").html(html);
				$("#terminalTr").data("couponInfo", data);
				
				$("#exchangeTerminalA").off("click").on("click", function(){
					_exchangePrepare($("#terminalTr").data("couponInfo"));
				});
				$("#returnTerminalA").off("click").on("click", function(){
					_returnTerminal($("#terminalTr").data("couponInfo"));
				});
			}
		});
	};
	
	var _exchangePrepare = function() {
		ec.form.dialog.createDialog({
			"id":"-exchange-terminal",
			"width":450,
			"height":180,
			"initCallBack":function(dialogForm,dialog){
				
				$("#exchangeConfirmA").off("click").on("click",function(){
					var oldData = $("#terminalTr").data("couponInfo");
					var result = _checkCouponInstNbr(oldData);
					if (result) {
						dialogForm.close(dialog);
						_exchangeTerminal(oldData, result);
					}
				});
				$("#exchangeCancelA").off("click").on("click",function(){
					dialogForm.close(dialog);
				});
			},
			"submitCallBack":function(dialogForm,dialog){
				
			}
		});
	};
	
	var _checkCouponInstNbr = function(data) {
		var couponInstNbr = $("#couponInstNbrInp").val();
		if (couponInstNbr == "") {
			$.alert("提示","<br/>请输入有效的终端串码。");
			return;
		}
		var param = {
			"instCode" : couponInstNbr,
			"mktResId" : "" + data.couponId,
			"mktResTypeCd" : "" + data.couponTypeCd,
			"orderNo" : ""
		};
		var url = contextPath+"/mktRes/terminal/checkTerminal";
		$.ecOverlay("<strong>终端串码校验中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param,{});
		$.unecOverlay();
		if(response.code == -2) {
			$.alertM(response.data);
		} else if (response.code != 0) {
			$.alert("提示","<br/>校验失败请稍后再试。");
		} else {
			if(response.data) {
				if(response.data.code == 0) {
					if(response.data.statusCd==CONST.MKTRES_STATUS.USABLE){
//						$.alert("提示","<br/>此终端串号可以使用");
						//返回新的终端信息
						return response.data;
						
					}else{
						$.alert("提示",response.data.message);
					}
				}else if(response.data.code == 1
						&& response.data.message){
					$.alert("提示", response.data.message);
				}
			} else {
				$.alert("提示","<br/>校验失败请稍后再试。");
			}
		}
	};
	
	var _exchangeTerminal = function(oldData, newData) {
//		if (oldData.couponId != newData.STANDARD_CD) {
//			$.alert("提示","<br/>终端换货时终端规格不相符");
//			return;
//		}
		OrderInfo.actionTypeName = "退换";
		OrderInfo.businessName = oldData.couponName;
		OrderInfo.actionFlag = 18; // 终端换货
		var coupons = [];
		var oldCoupon = {
			id: oldData.id,
			couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
			inOutTypeId : "2",  //出入库类型
			inOutStatusId : "1",  //未发送
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : oldData.couponId, //物品ID
			couponinfoStatusCd : "R", //物品处理状态
			chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
			couponNum : 1, //物品数量
			storeId : oldData.storeId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : oldData.realAmount / -100, //物品价格
			couponInstanceNumber : oldData.couponNumber, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : CONST.CUST_COUPON_SALE, //客户ID
			prodId : 0, //产品ID
			offerId : 0, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列
			isOld : "Y" //旧终端
		};
		var newCoupon = {
			id: -1,
			couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
			inOutTypeId : "1",  //出入库类型
			inOutStatusId : "1",  //未发送
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : newData.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
			couponNum : 1, //物品数量
			storeId : newData.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : oldData.realAmount / 100, //旧的物品的价格
			couponInstanceNumber : newData.instCode, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : CONST.CUST_COUPON_SALE, //客户ID
			prodId : 0, //产品ID
			offerId : 0, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "", //关联序列
			isOld : "N" //新终端
		};
		var data = {};
		if (oldData.instFlag) {
			if (!oldData.offerId) {
				$.alert("提示","接口返回中未包含合约销售品实例ID，请检查省内返回数据。门户接口流水为"+oldData.transcationId);
				return;
			}
			if (!oldData.instInfo[0].accessNbr) {
				$.alert("提示","接口返回中未包含接入号，请检查省内返回数据。门户接口流水为"+oldData.transcationId);
				return;
			}
			//接口返回中未包含合约销售品实例ID，请检查省内返回数据
			//接口返回中未包含接入号，请检查省内返回数据
			oldCoupon.prodId = oldData.instInfo[0].prodId;
			oldCoupon.offerId = oldData.offerId;
			oldCoupon.partyId = oldData.instInfo[0].custId;
			newCoupon.prodId = oldData.instInfo[0].prodId;
			newCoupon.offerId = oldData.offerId;
			newCoupon.partyId = oldData.instInfo[0].custId;
			data.busiObj = {
				"accessNumber": oldData.instInfo[0].accessNbr,
                "instId": oldData.offerId,
                "isComp": "N",
                "objId": oldData.instInfo[0].offerSpecId,
                "offerTypeCd": "1"
	        };
			data.boActionType = {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.EXCHANGE_COUPON
			};
			//4G需要加载全量信息
			if(CONST.getAppDesc()==0){
				OrderInfo.order.soNbr = UUID.getDataId();
				var instParam = {
					areaId : OrderInfo.staff.soAreaId,
					acctNbr : oldData.instInfo[0].accessNbr,
					custId : '',
					soNbr : OrderInfo.order.soNbr,
					instId : oldData.instInfo[0].prodId,
					type : "2"
				};
				if (!query.offer.invokeLoadInst(instParam)) {
					return false;
				}
			}
		} else {
			data.busiObj = {
				"instId": oldData.id,
				"isComp": "N",
				"objId": oldData.couponId
	        };
			data.boActionType = {
				actionClassCd : CONST.ACTION_CLASS_CD.MKTRES_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.EXCHANGE_COUPON
			};
		}
		
		coupons.push(oldCoupon);
		coupons.push(newCoupon);
		data.coupons = coupons;
		SoOrder.getTokenSynchronize();
		//订单提交
		SoOrder.submitOrder(data);
	};
	
	var _returnTerminal = function(couponInfo){
		OrderInfo.actionTypeName = "退换";
		OrderInfo.businessName = couponInfo.couponName;
		OrderInfo.actionFlag = 17; // 终端退货
		var coupons = [{
			id: couponInfo.id,
			couponUsageTypeCd : "3", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
			inOutTypeId : "2",  //出入库类型
			inOutStatusId : "1",  //未发送
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : couponInfo.couponId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
			couponNum : 1, //物品数量
			storeId : couponInfo.storeId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : couponInfo.realAmount / 100, //物品价格,20140706 退货时价格不再取反
			couponInstanceNumber : couponInfo.couponNumber, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : CONST.CUST_COUPON_SALE, //客户ID
			prodId : 0, //产品ID
			offerId : 0, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列	
			isOld : "Y" //旧终端
		}];
		var data = {};
		data.busiObj = {
			"instId": couponInfo.id,
			"isComp": "N",
			"objId": couponInfo.couponId
        };
		data.boActionType = {
			actionClassCd : CONST.ACTION_CLASS_CD.MKTRES_ACTION,
			boActionTypeCd : CONST.BO_ACTION_TYPE.RETURN_COUPON
		};
		data.coupons = coupons;
		SoOrder.getTokenSynchronize();
		//订单提交
		SoOrder.submitOrder(data);
	};
	
	return {
		init : _init
	};
})(jQuery);

//初始化
$(function(){
	mktRes.terminal.exchange.init();
});
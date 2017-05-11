CommonUtils.regNamespace("bill", "charge");
/**
 * 翼销售充值、查余额
 */
bill.charge = (function() {
	// 支付入参
	var _chargeParams = {}; 
	// 失败次数
	var _failTimes = 0;
	// 最大容错次数
	var _maxFailTimes = 10;
	
	var chargeCheck="0";//代理保证金校验编码   0成功   1校验不通过 -2接口异常
	
	/**
	 * 获取支付平台返回订单状态并进行下一步操作
	 */
	var _afterPayCallBack = function(soNbr, status, type) {
		// 支付成功后再次查询订单状态，如果成功，则调用充值平台正式充值
		if (status == 1) {
			$.callServiceAsJson(contextPath + "/app/order/getPayOrdStatus", {olId: soNbr}, {
				"before": function() {
					$.ecOverlay("支付验证中，请稍等...");
				},
				"done": function(getPayOrdStatusRes) {
					if (ec.util.isObj(getPayOrdStatusRes.data) && _chargeParams.feeAmount != getPayOrdStatusRes.data.payAmount) {
						$.unecOverlay();
						$.alert("提示", "用户输入金额和充值平台返回金额不一致!");
					} else if (getPayOrdStatusRes.code == 0 && ec.util.isObj(getPayOrdStatusRes.data)) {
						$.unecOverlay();
						_toCharge();
					} else if(getPayOrdStatusRes.code == 1) {
						// 如果重试_maxFailTimes后，还是失败，则停止重试
						if ((++ bill.charge.failTimes) > _maxFailTimes) {
							$.unecOverlay();
							if (ec.util.isObj(getPayOrdStatusRes.data)) {
								$.alert("提示", getPayOrdStatusRes.data.respMsg + "，流水号：" + getPayOrdStatusRes.data.olId);
							} else {
								$.alert("提示", "订单状态查询失败！");
							}
							return;
						}
						// 轮询任务，以防支付成功反馈延迟，增加重试机制
						setTimeout(function() {_afterPayCallBack(soNbr, status, type);}, 3000);
					} else if (getPayOrdStatusRes.status == 1002) {
						$.unecOverlay();
						$.alert("提示", getPayOrdStatusRes.data);
					} else {
						$.unecOverlay();
						$.alertM(getPayOrdStatusRes.data);
					}
				},
				"fail": function(getPayOrdStatusRes) {
					$.unecOverlay();
					$.alert("提示", "请求可能发生异常，请稍后再试！");
				}
			});
		}
	};
	// 手机号、省编码校验
	var _checkParams = function(param) {
		var userPhoneNum = param.destinationId;
		var provinceId = param.provinceId;
		if (!(ec.util.isObj(userPhoneNum) && CONST.LTE_PHONE_HEAD.test(userPhoneNum))) {
			$.alert("提示", "请正确输入手机号。");
			return false;
		}
		if (!ec.util.isObj(provinceId)) {
			$.alert("提示", "省份编码有误！");
			return false;
		}
		return true;
	};
	var _appBalance = function() {
		$("#balanceQuery").on("click", function() {
			var param = {
					destinationId: $("#userPhoneNum").val(),
					provinceId: $("#provinceId").val()
			};
			if (!_checkParams(param)) {
				return;
			}
			$.callServiceAsJson(contextPath + "/app/bill/balance", param, {
				"before": function() {
					$.ecOverlay("查询中，请稍等...");
				},
				"done": function(response) {
					$.unecOverlay();
					if (ec.util.isObj(response)) {
						if (response.code == 0) {
							// TODO 在charge-prepare.html显示余额
							if(response.data.arrears.resultCode !=0){
								$.alert("提示", response.data.arrears.message);
								return;
							}
							if(response.data.balance.resultCode !=0){
								$.alert("提示", response.data.balance.message);
								return;
							}
							$('#queryResult').modal('show');
							var totalBalance = "0";
							if(response.data.arrears.result.SvcCont && response.data.arrears.result.SvcCont.Service_Information && response.data.arrears.result.SvcCont.Service_Information.Bill_Query_Information.Sum_Charge){
								totalBalance =response.data.arrears.result.SvcCont.Service_Information.Bill_Query_Information.Sum_Charge;
							}
							$('#totalBalance').text(totalBalance?totalBalance:"0");	
							var currentBalance = "0";
							if(totalBalance =="0"){
								if(response.data.balance.result.SvcCont && response.data.balance.result.SvcCont.Service_Information && response.data.balance.result.SvcCont.Service_Information.Total_Balance_Available){
						        	currentBalance =response.data.balance.result.SvcCont.Service_Information.Total_Balance_Available;
								}
								
								
//								if(response.data.balance.result.SvcCont && response.data.balance.result.SvcCont.Service_Information && response.data.balance.result.SvcCont.Service_Information.Balance_Information){
//									for (var i=0; i < response.data.balance.result.SvcCont.Service_Information.Balance_Information.length; i++) {
//										if(response.data.balance.result.SvcCont.Service_Information.Balance_Information[i].BalanceTypeFlag == 0){
//											currentBalance =response.data.balance.result.SvcCont.Service_Information.Balance_Information[i].Balance_Available;
//										}
//									}
//								}
								$('#totalBalance').text(currentBalance?currentBalance:"0");
							}
							$('#currentBalance').text(currentBalance?currentBalance:"0");
								
						} else if (response.code == 1) {
							$.alert("提示", response.data.message);
							return;
						} else if (response.code == -2) {
							$.alertM(response.data);
							return;
						} else if (response.code == 1202) {
							$.alert("提示", response.data);
							return;
						}
					} else {
						$.alert("提示", "返回异常");
						return;
					}
				},
				"fail": function(response) {
					$.unecOverlay();
					$.alert("提示", "请求可能发生异常，请稍后再试！");
				}
			});
		});
	};
	var _toCharge = function() {
		$.callServiceAsJson(contextPath + "/app/bill/charge", _chargeParams, {
			"before": function() {
				$.ecOverlay("提交中，请稍等...");
			},
			"done": function(response) {
				$.unecOverlay();
				if (ec.util.isObj(response)) {
					if (response.code == 0) {
						$.alert("提示", "正在充值，请等待到帐通知。");
					} else if (response.code == 1) {
						$.alert("提示", response.data.message);
						return;
					} else if (response.code == -2) {
						$.alertM(response.data);
						return;
					} else if (response.code == 1202) {
						$.alert("提示", response.data);
						return;
					}
				} else {
					$.alert("提示", "返回异常");
					return;
				}
			},
			"fail": function(response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _createTranId = function() {
		var getTranIdRes = $.callServiceAsJsonGet(contextPath + "/app/bill/getTranId", {});
		if (ec.util.isObj(getTranIdRes) && getTranIdRes.code == 0) {
			return getTranIdRes.data;
		} else {
			return "";
		}
	};
	var _toPay = function() {
		var getPayUrlParams = {
				olId: _chargeParams.tranId,
				soNbr: _chargeParams.tranId,
				charge: _chargeParams.feeAmount,
				busiUpType: "4",
				accNbr: _chargeParams.destinationId,
				chargeCheck:chargeCheck
		};
		$.callServiceAsJson(contextPath + "/app/order/getPayUrl", getPayUrlParams, {
			"before": function() {
				$.ecOverlay("请稍等...");
			},
			"done": function(getPayUrlRes) {
				$.unecOverlay();
				if (getPayUrlRes.code == 0) {
					// 原生打开支付页面
					common.callOpenPay(getPayUrlRes.data);
				} else if(getPayUrlRes.code == 1002){
					$.alert("提示", getPayUrlRes.data);
				} else{
					$.alertM(getPayUrlRes.data);
				}
			},
			"fail": function(getPayUrlRes) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _appCharge = function() {
		$("#recharge").on("click", function() {
			// 参数收集
			var feeAmount = $.trim($("#amount").val());
			if (!(ec.util.isObj(feeAmount) && CONST.POSITIVE_NUM.test(feeAmount) && feeAmount <= 500)) {
				$.alert("提示", "请正确选择或输入金额，最高500元。");
				return;
			}
			// 生成流水号供支付平台和充值接口统一使用
			var tranId = _createTranId();
			if (!ec.util.isObj(tranId)) {
				$.alert("提示", "流水号生成失败");
				return;
			}
			_chargeParams = {
					destinationId: $.trim($("#userPhoneNum").val()),
					provinceId: $("#provinceId").val(),
					feeAmount: feeAmount*100,
					tranId: tranId
			};
			if (!_checkParams(_chargeParams)) {
				return;
			}
			// 因为支付平台返回，原生只会调用calCharge.js中的queryPayOrdStatus方法，所以先设置业务类型，方便回调
			order.calcharge.busiUpType = CONST.APP_CHARGE_BUSI_UP_TYPE;
			_checkDeposit();
			// 跳转支付平台
			_toPay();
		});
	};
	
	var _checkDeposit = function() {
		//MDA获取省份CRM系统编码
		var propertiesKey = "PROVCODE_"+$("#provinceId").val().substring(0,3);
	    var PROVCODE = offerChange.queryPortalProperties(propertiesKey);
	    var DstSysID ="";
	    if(PROVCODE!=undefined && PROVCODE.length>0){
	    	DstSysID = PROVCODE;
	    }
		var params={ 
				"ContractRoot":{
					"TcpCont":{
						"DstSysID": DstSysID + ""
					},
					"SvcCont":{
						"AccNbr":  $.trim($("#userPhoneNum").val()),  
						"Amount": $.trim($("#amount").val())*100 + "", 
						"ReqSerial":"",
						"CustOrderId":""
					}
				}			
			};
            var url = contextPath+"/app/bill/checkDeposit";
			var response = $.callServiceAsJson(url,params, {});
			if(response.code){
				return;
			}
			if (response.code == 0) {
				chargeCheck="0";
			}else if (response.code == -2) {
				chargeCheck="-2";
			}else{
				chargeCheck="1";
			}
	};
	
	var _provinceSet = function() {
		var provinceInfo = CONST.AREA_PROVINCE_MAPPING[OrderInfo.staff.areaId.substr(0, 3)];
		$("#provinceId").html('<option value="' + provinceInfo.provId + '">' + provinceInfo.provName + '</option>');
	};
	var _amountChange = function() {
		$(".list-box .recharge-box li").on("click", function() {
			$(this).addClass("active").siblings().removeClass("active");
			var fee = $(this).find("span").attr("val");
			if (ec.util.isObj(fee) && $.isNumeric(fee)) {
				$("#amountInput").hide();
				$("#amount").val(fee);
			} else {
				$("#amountInput").show();
				$("#amount").val("");
				$("#amount").focus();
			}
		});
	};
	var _amountValCheck = function() {
		$("#amount").on("keyup", function() {
			this.value = this.value.replace(/\D/g, "");
		});
	};
	var _init = function() {
		// 选择或输入金额
		_amountChange();
		// 金额输入非数字限制
		_amountValCheck();
		// 查余额
		_appBalance();
		// 充值
		_appCharge();
		// 根据工号的省份限制，暂时限制跨省业务
		_provinceSet();
	};
	
	return {
		init: _init,
		afterPayCallBack: _afterPayCallBack,
		failTimes: _failTimes
	};
})();
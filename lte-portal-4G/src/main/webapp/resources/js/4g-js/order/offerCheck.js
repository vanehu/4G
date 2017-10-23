/**
 * 销售品相关校验
 * @author zhangyu15
 * @since 2017-10-19
 */
CommonUtils.regNamespace("offerCheck");

offerCheck = (function() {
	
	var _feeType = function(newSpec){
		var resultFlag = true;
		
		var feeType = $("select[name='pay_type_-1']").val();
		if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
		if(feeType == CONST.PAY_TYPE.BEFORE_PAY && (newSpec.feeType == CONST.PAY_TYPE.AFTER_PAY || newSpec.feeType==CONST.PAY_TYPE.QUASIREALTIME_AFTER_PAY || newSpec.feeType == CONST.PAY_TYPE.QUASIREALTIME_PAY)){
			$.alert("提示信息","用户付费类型为预付费，不能订购该销售品！");
			resultFlag = false;
		}else if(feeType == CONST.PAY_TYPE.AFTER_PAY && (newSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY || newSpec.feeType==CONST.PAY_TYPE.QUASIREALTIME_BEFORE_PAY || newSpec.feeType == CONST.PAY_TYPE.QUASIREALTIME_PAY)){
			$.alert("提示信息","用户付费类型为后付费，不能订购该销售品！");
			resultFlag = false;
		}
		
		return resultFlag;
	};

	/**
	 * 校验订购销售品次数，校验通过返回true，否则返回false
	 */
	var _orderTimes = function(newSpec){
		var resultFlag = true;
		
		if(newSpec.ifLimitTimes != "Y"){
			return resultFlag;
		}

		var orderedTimes = _getOrderedTimes(newSpec);
		if(ec.util.isDigit(orderedTimes) && orderedTimes > 0){
			var canOrderTimes = newSpec.orderTimes;
			var timeType = newSpec.timeType;
			switch (timeType) {
				case 1000://相对时间
					resultFlag = _compareOrderTimesByRelativeTime(newSpec, orderedTimes, canOrderTimes); break;
				case 1100://绝对时间
					resultFlag = _compareOrderTimesByAbsoluteTime(newSpec, orderedTimes, canOrderTimes); break;
				case 1200://无限制，表示用户一生只能订购1次
					resultFlag = _compareOrderTimesByDefault(orderedTimes); break;
				default: ;
			}
		} else if(orderedTimes < 0){
			resultFlag = false;
		}

		return resultFlag;
	};
	
	var _compareOrderTimesByRelativeTime = function(newSpec, orderedTimes, canOrderTimes){
		var resultFlag = true;
		var timeUnit = newSpec.timeUnit;
		var limitTime = newSpec.limitTime;
		var effDate = new Date(newSpec.effDate);
		var expDate = new Date(newSpec.effDate);
		var curDate = new Date();
		
		switch (timeUnit) {
			case 1000:// 年
				expDate.setYear(limitTime); break;
			case 1100:// 月
				expDate.setMonth(limitTime); break;
			case 1200:// 日
				expDate.setDate(limitTime); break;
			default: ;
		}
		
		resultFlag = _compareOrderTimes(curDate, effDate, expDate, orderedTimes, canOrderTimes);
		
		return resultFlag;
	};
	
	var _compareOrderTimesByAbsoluteTime = function(newSpec, orderedTimes, canOrderTimes){
		var resultFlag = true;
		var effDate = new Date(newSpec.effDate);
		var expDate = new Date(newSpec.expDate);
		var curDate = new Date();
		
		resultFlag = _compareOrderTimes(curDate, effDate, expDate, orderedTimes, canOrderTimes);
		
		return resultFlag;
	};
	
	var _compareOrderTimesByDefault = function(orderedTimes){
		var resultFlag = true;
		
		resultFlag = orderedTimes >= 1 ? false : true;
		
		if(!resultFlag){
			var alertErrorMsg = "您选择的销售品仅可订购一次，您已订购" + orderedTimes + "次。";
			$.alert("提示", alertErrorMsg);
		}
		
		return resultFlag;
	};
	
	/**
	 * 返回数字类型
	 * 0：不校验
	 * >0：校验
	 * <0：返回异常提示
	 */
	var _getOrderedTimes = function(newSpec){
		var orderedTimes = 0;
		var queryData = query.offer.queryOfferOrderedTimes([{"offerSpecId":newSpec.offerSpecId}]);
		
		if(ec.util.isObj(queryData) && ec.util.isArray(queryData.prodInfos)){
			$.each(queryData.prodInfos, function(indexProd, prodInfo){
				if(prodInfo.accNbr == OrderInfo.cust.accNbr){
					if(ec.util.isArray(prodInfo.offerListInfo)){
						$.each(prodInfo.offerListInfo, function(indexOffer, offerInfo){
							if(offerInfo.prodOfferId == newSpec.offerSpecId){
								orderedTimes = offerInfo.orderTimes;
								return false;
							}
						});
					}
				}
			});
		} else if(!ec.util.isObj(queryData)){
			orderedTimes = -1;
		}
		
		return orderedTimes;
	};
	
	//校验通过返回true，否则返回false
	var _compareOrderTimes = function(curDate, effDate, expDate, orderedTimes, canOrderTimes){
		var resultFlag = true;
		
		if(curDate - effDate >= 0 && curDate - expDate < 0){
			resultFlag = orderedTimes >= canOrderTimes ? false : true;
		}
		
		if(!resultFlag){
			var alertErrorMsg = "您选择的销售品仅可订购" + canOrderTimes +"次，您已订购" + orderedTimes + "次。";
			$.alert("提示", alertErrorMsg);
		}
		
		return resultFlag;
	};
	
	return {
		feeType		:_feeType,
		orderTimes	:_orderTimes
	};
})();
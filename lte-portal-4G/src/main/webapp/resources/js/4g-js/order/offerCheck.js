/**
 * 销售品相关校验
 * @author zhangyu15
 * @since 2017-10-19
 */
CommonUtils.regNamespace("check", "offer");

check.offer = (function() {
	
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
	 * 校验销售品已订购次数、可订购次数，校验通过返回true，否则返回false
	 * 兼容：在已订购销售品中，通过点击“参”字进行重复订购，此时入参chooseOrderTimes必传，其他情况非必传
	 * 入参：orderedOffer已订购销售品；chooseOrderTimes设置的订购次数
	 */
	var _orderTimes = function(orderedOffer, chooseOrderTimes){
		var resultFlag = true;
		var offerLimitTimes = orderedOffer.offerLimitTimes;
		
		if(!(ec.util.isObj(offerLimitTimes) && offerLimitTimes.ifLimitTimes == "Y")){
			return resultFlag;
		}
		
		chooseOrderTimes = parseInt(chooseOrderTimes);
		var orderedTimes = parseInt(orderedOffer.orderCount);
		
		if(chooseOrderTimes == orderedTimes){
			return resultFlag;
		}
		
		var canOrderTimes = offerLimitTimes.orderTimes;
		var timeType = String(offerLimitTimes.timeType);
		switch (timeType) {
			case "1000"://相对时间
				resultFlag = _compareOrderTimesByRelativeTime(offerLimitTimes, chooseOrderTimes, canOrderTimes); break;
			case "1100"://绝对时间
				resultFlag = _compareOrderTimesByAbsoluteTime(offerLimitTimes, chooseOrderTimes, canOrderTimes); break;
			case "1200"://无限制，表示用户一生只能订购1次
				resultFlag = _compareOrderTimesByDefault(orderedTimes); break;
			default: ;
		}

		return resultFlag;
	};
	
	var _compareOrderTimesByRelativeTime = function(offerLimitRules, orderedTimes, canOrderTimes){
		var timeUnit = String(offerLimitRules.timeUnit);
		var limitTime = offerLimitRules.limitTime;
		var effDate = ec.util.formatTimeStringToDate(String(offerLimitRules.offerCreatedDate), null, null);
		var expDate = ec.util.formatTimeStringToDate(String(offerLimitRules.offerCreatedDate), null, null);
		
		var curDate = new Date();
		
		switch (timeUnit) {
			case "1000":// 年
				expDate.setYear(limitTime); break;
			case "1100":// 月
				expDate.setMonth(limitTime); break;
			case "1200":// 日
				expDate.setDate(limitTime); break;
			default: ;
		}
		
		var resultFlag = _compareOrderTimes(curDate, effDate, expDate, orderedTimes, canOrderTimes);
		
		return resultFlag;
	};
	
	var _compareOrderTimesByAbsoluteTime = function(offerLimitRules, orderedTimes, canOrderTimes){
		var effDate = new Date(offerLimitRules.effDate);
		var expDate = new Date(offerLimitRules.expDate);
		var curDate = new Date();
		
		var resultFlag = _compareOrderTimes(curDate, effDate, expDate, orderedTimes, canOrderTimes);
		
		return resultFlag;
	};
	
	//校验通过返回true，否则返回false
	var _compareOrderTimes = function(curDate, effDate, expDate, orderedTimes, canOrderTimes){
		var resultFlag = true;
		
		if(curDate - effDate >= 0 && curDate - expDate < 0){
			resultFlag = orderedTimes > canOrderTimes ? false : true;
		}
		
		if(!resultFlag){
			var alertErrorMsg = "您选择的销售品限期内仅可订购" + canOrderTimes +"次，您已选择（包含已订购）共计" + orderedTimes + "次。";
			$.alert("提示", alertErrorMsg);
		}
		
		return resultFlag;
	};
	
	var _compareOrderTimesByDefault = function(orderedTimes){		
		var resultFlag = orderedTimes >= 1 ? false : true;
		
		if(!resultFlag){
			var alertErrorMsg = "您选择的销售品限期内仅可订购1次，您已选择（包含已订购）共计" + orderedTimes + "次。";
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
	var _getOrderedTimesInPeriod = function(offerSpec){
		var orderedTimes = 0;
		
		var queryData = query.offer.queryOfferOrderedTimes([{'offerSpecId':offerSpec.offerSpecId}]);
		if(ec.util.isObj(queryData) && ec.util.isArray(queryData.prodInfos)){
			$.each(queryData.prodInfos, function(indexProd, prodInfo){
				if(prodInfo.accNbr == OrderInfo.cust.accNbr){
					if(ec.util.isArray(prodInfo.offerListInfo)){
						$.each(prodInfo.offerListInfo, function(indexOffer, offerInfo){
							if(offerInfo.prodOfferId == offerSpec.offerSpecId){
								orderedTimes = parseInt(offerInfo.orderTimes);
								if(ec.util.isObj(offerSpec.offerLimitTimes)){
									offerSpec.offerLimitTimes['offerCreatedDate'] = String(offerInfo.createDate);
								}
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
	
	/**
	 * 获取互斥依赖关系的结果
	 */
	var _getExcludeDependData = function(){
		var queryExcludeDependData = OrderInfo.queryExcludeDependData;
		OrderInfo.queryExcludeDependData = {};//缓存值data清空
		OrderInfo.saveOrderedOfferSpecIds = []; //缓存OfferSpecId数据清除
		var excludeMessageList = queryExcludeDependData.result.offerSpec.exclude;
		var info = "";
		var offerSpecIds = ""; 
		if(excludeMessageList.length > 0){
			for(var i = 0;i < excludeMessageList.length; i++){
				info += excludeMessageList[i].offerSpecName + ",";
				offerSpecIds += excludeMessageList[i].offerSpecId + ",";
			}
			info = info.substr(0, info.length-1);
			offerSpecIds = offerSpecIds.substr(0, offerSpecIds.length-1);
			info = info + "的销售品与新套餐存在互斥关系，请确认是否退订";
			var offerSpecIdArray = offerSpecIds.split(",");
			$.confirm("信息确认",info,{
			    yesdo:function(){
			    	for(var i=0;i<offerSpecIdArray.length;i++){
			    		nowId = $("dd[offerspecid ='"+offerSpecIdArray[i]+"']").attr("id");
			    		for(var j = 0;j<nowId.length;j++){
			    			var needIds = nowId.split("_");
			    			AttachOffer.delOfferBomb(needIds[1], needIds[2]);
			    		}
			    	}
			    },
			    no:function(){
				   
			    }
		    });
			
		}
	}

	return {
		feeType					:_feeType,
		orderTimes				:_orderTimes,
		getOrderedTimesInPeriod	:_getOrderedTimesInPeriod,
		getExcludeDependData    :_getExcludeDependData
	};
})();
$(function() {});
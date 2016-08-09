/**
 * 产品相关查询
 * 没有任何业务逻辑
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("query","prod");

query.prod = (function() {
	
	/**
	 * 产品规格属性查询
	 * @param  offerSpecId 销售品规格ID
	 * @param  prodSpecId 产品规格ID
	 */
	var _prodSpecParamQuery = function(param){
		addParam(param);
		var url = contextPath + "/prod/prodSpecParamQuery";
		$.ecOverlay("<strong>正在查询产品规格属性中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","产品规格属性失败,稍后重试");
			return;
		}
	};
	
	/**
	 * 产品实例属性查询
	 * @param  prodId 产品实例ID
	 * @param  acctNbr 产品接入号码
	 * @param  ifServItem 是否是功能产品
	 */
	var _prodInstParamQuery = function(param){
		addParam(param);
		var url = contextPath + "/prod/prodInstParamQuery";
		$.ecOverlay("<strong>正在查询产品实例属性中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","产品规格属性失败,稍后重试");
			return;
		}
	};
	
	/**
	 * 产品下终端实例数据查询
	 * @param  prodId 产品实例ID
	 * @param  accNbr 产品接入号
	 * @param  areaId  受理地区
	 * @callBackFun 回调函数
	 * @service/intf.soService/queryOfferCouponById
	 */
	var _getTerminalInfo = function(prod){
		var params = {
			prodId: prod.prodInstId,
			areaId: OrderInfo.getProdAreaId(prod.prodInstId),
			acctNbr: prod.accNbr,
			prodBigClass : prod.prodBigClass
		};
		$.ecOverlay("<strong>正在查询产品下终端实例数据中,请稍后....</strong>");
		var response = $.callServiceAsJson(contextPath+"/order/queryTerminalInfo", params, {});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if (response.code == -2) {
			$.alertM(response.data);
		}else{
			$.alert("错误提示","接口未返回号码["+params.acctNbr+"]产品原UIM卡数据，无法继续受理！【"+response.data+"】");
		}
	};
	
	/**
	 * 产品下终端实例数据查询2
	 * @param  prodId 产品实例ID
	 * @param  accNbr 产品接入号
	 * @param  areaId  受理地区
	 * @callBackFun 回调函数
	 * @service/intf.soService/queryOfferCouponById
	 */
	var _getTerminalInfo2 = function(prod){
		var params = {
			prodId: prod.prodInstId,
			areaId: prod.areaId,
			acctNbr: prod.acctNbr,
			prodBigClass:order.prodModify.choosedProdInfo.prodBigClass
		};
		var response = $.callServiceAsJson(contextPath+"/order/queryTerminalInfo", params, {});
		if(response.code == 0){
			return response.data;
		}else{
			return null;
		}
	};
	
	/**
	 * 产品下账号信息查询
	 * @param  prodId 产品实例ID
	 * @param  acctCd 账号信息
	 * @param  areaId  受理地区
	 * @callBackFun 回调函数
	 * @service/intf.soService/queryOfferCouponById
	 */
	var _queryAcct = function(param,callBackFun) {
		var url= contextPath+"/order/account";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询账户信息中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						callBackFun(response.data);
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询账户信息失败,稍后重试");
					}
				}
			});
		}else{
			$.ecOverlay("<strong>正在查询账户信息中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data.offerSpec;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询账户信息失败,稍后重试");
			}
		}
	};
	
	/**
	 * 终端串号校验
	 */
	var _checkTerminal = function(param){
		var url = contextPath+"/mktRes/terminal/checkTerminal";
		$.ecOverlay("<strong>终端校验中,请稍后....</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == -2) {
			$.alertM(response.data);
		}else if(response.data && response.data.code == 0) {
			return response.data;
		}else if( response.data.code == 1){
			$.alert("提示", response.data.message);
		}else if( response.code == 1){
			$.alert("提示", response.data);
		}else{
			$.alert("提示","<br/>校验失败，请稍后重试！");
		}
	};
	
	//校验UIM卡
	var _checkUim=function(param){
		var url = contextPath+"/mktRes/uim/checkUim";
		$.ecOverlay("<strong>UIM卡校验中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			$.alert("提示","UIM卡校验成功!");
			return response.data;
		}else{
			if(typeof response == undefined){
				$.alert("提示","UIM卡校验请求调用失败，可能原因服务停止或者数据解析异常");
			}else if (response.code == -2) {
				$.alertM(response.data);
			}else{
				var msg="";
				if(response.data!=undefined && response.data.msg!=undefined){
					msg=response.data.msg;
				}else{
					msg="卡号["+cardNo+"]预占失败";
				}
				$.alert("提示","UIM卡校验失败，可能原因:"+msg);
			}
		}
	};
	
	//释放UIM卡
	var _releaseUim = function(param){
		var url = contextPath+"/mktRes/uim/checkUim";
		$.ecOverlay("<strong>UIM卡释放中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			$.alert("提示","UIM卡释放成功!");
			return response.data;
		}else{
			if(typeof response == undefined){
				$.alert("提示","UIM卡释放请求调用失败，可能原因服务停止或者数据解析异常");
			}else if (response.code == -2) {
				$.alertM(response.data);
			}else{
				var msg="";
				if(response.data!=undefined && response.data.msg!=undefined){
					msg=response.data.msg;
				}else{
					msg="卡号["+cardNo+"]预占失败";
				}
				$.alert("提示","UIM卡释放失败，可能原因:"+msg);
			}
		}
	};
	
	var _getOldUim = function(){
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var oldUimInfo = _getTerminalInfo(prodInfo);
		if(oldUimInfo==undefined){
			return;
		}
		var oldUimdata={
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "2",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :oldUimInfo.couponId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : 1, //物品数量
			//storeId : oldUimInfo.storeId, //仓库ID
			storeId : 1, //仓库ID
			storeName : "11", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : oldUimInfo.couponInsNumber, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :prodInfo.prodInstId, //产品ID
			offerId : prodInfo.prodOfferInstId, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列
			id:0,
			isOld : "T"  //旧卡
		};
		return oldUimdata;
	};
	
	//检查是否是4G产品实例（是否已开通4G功能产品）
	var _checkIs4GProdInst = function(prodInfo){
		var param = {
			    prodId : prodInfo.prodInstId,
			    prodSpecId : prodInfo.productId,
			    offerSpecId : prodInfo.prodOfferId,
			    acctNbr : prodInfo.accNbr
		};
		var data = query.offer.queryOpenedAttachAndServ(param);
		if(data && data.result && data.result.servLists){
			var is4G = false;
			$.each(data.result.servLists,function(){//遍历是否有开通4G上网功能
				if(this.servSpecId == CONST.PROD_SPEC.PROD_FUN_4G){ //开通4G功能产品
					is4G = true; //已开通4G上网功能产品
				}
			});
			return is4G;
		} 
		return false;
	};
	
	//补充查询基本条件
	var addParam = function(param){
		param.staffId = OrderInfo.staff.staffId;
		param.channelId = OrderInfo.staff.channelId;
		param.partyId = OrderInfo.cust.custId;
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		param.distributorId = OrderInfo.staff.distributorId;
		if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
	};
	
	return {
		checkUim				: _checkUim,
		releaseUim 				: _releaseUim,
		getTerminalInfo 		: _getTerminalInfo,
		getTerminalInfo2  		: _getTerminalInfo2,
		prodSpecParamQuery		: _prodSpecParamQuery,
		prodInstParamQuery		: _prodInstParamQuery,
		getOldUim 				: _getOldUim,
		queryAcct				: _queryAcct,
		checkTerminal			: _checkTerminal,
		checkIs4GProdInst		: _checkIs4GProdInst
	};
})();
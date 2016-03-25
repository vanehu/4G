/**
 * 销售品产品相关查询
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("query","offer");

query.offer = (function() {
	
	/**
	 * 销售品规格构成查询
	 * @param  offerSpecId 销售品规格ID
	 * @param  offerTypeCd 销售品类型,销售品主 1 ,附属2  
	 * @param  mainOfferSpecId  主套餐id
	 * @param  partyId  客户ID
	 * @callBackFun 回调函数
	 */
	var _queryOfferSpec = function(param,callBackFun) {
		param.areaId = OrderInfo.cust.areaId;
		var url= contextPath+"/agent/offer/queryOfferSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品规格构成中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data.offerSpec);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品规格构成失败,稍后重试");
					}
				}
			});
		}else{
			$.ecOverlay("<strong>正在查询销售品规格构成中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data.offerSpec;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品规格构成失败,稍后重试");
			}
		}
	};

	/**
	 * 销售品实例构成查询
	 * @param  offerId 销售品实例ID
	 * @param  areaId 地区ID
	 * @param  accessNumber 接入号
	 * @callBackFun 异步调用函数
	 */
	var _queryOfferInst = function(param,callBackFun) {
		var url= contextPath+"/app/offer/queryOfferInst";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url, param, {
				"before":function(){
					$("#attach-modal").modal('show');
					//$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},	
				"done" : function(response){
					//$.unecOverlay();
					$("#attach-modal").modal('hide');
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品实例失败,稍后重试");
					}
				}
			});
		}else {
			$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品实例失败,稍后重试");
			}
		}
	};
	
	//根据选择产品查询销售品实例，并保存到OrderInfo.offer
	var _setOffer = function(callBack) {
		var prod = order.prodModify.choosedProdInfo ; 
		var param = {
			offerId : prod.prodOfferInstId,
			offerSpecId : prod.prodOfferId,
			acctNbr : prod.accNbr,
			areaId : prod.areaId,
			distributorId : ""
		};
		if(typeof(callBack)=="function"){
			query.offer.queryOfferInst(param,function(data){
				if(data&&data.code == CONST.CODE.SUCC_CODE){
					var flag = true;
					if(ec.util.isArray(data.offerMemberInfos)){
						CacheData.sortOffer(data);
						for ( var i = 0; i < data.offerMemberInfos.length; i++) {
							var member = data.offerMemberInfos[i];
							if(member.objType==""){
								$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
								return false;
							}else if(member.objType==CONST.OBJ_TYPE.PROD){
								/*if(member.objId==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品规格【objId】节点为空，无法继续受理,请营业后台核实");
							return false;
						}*/
								if(member.accessNumber==""){
									$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
									return false;
								}
							}
							if(member.objInstId==prod.prodInstId){
								flag = false;
							}
						}
						if(flag){
							$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+prod.accNbr+"】，无法继续受理，请业务后台核实");
							return false;
						}
						OrderInfo.offer.offerMemberInfos = data.offerMemberInfos; 
						OrderInfo.offer.offerId = prod.prodOfferInstId;
						OrderInfo.offer.offerSpecId = prod.prodOfferId;
						OrderInfo.offer.offerSpecName = prod.prodOfferName;
						callBack();
					}else{//销售品成员实例为空
						$.alert("提示","查询销售品实例构成，没有返回成员实例无法继续受理");
						return false;
					}
				}
			}); //查询销售品实例构成
		}else{
			var data = query.offer.queryOfferInst(param); //查询销售品实例构成
			if(data&&data.code == CONST.CODE.SUCC_CODE){
				var flag = true;
				if(ec.util.isArray(data.offerMemberInfos)){
					CacheData.sortOffer(data);
					for ( var i = 0; i < data.offerMemberInfos.length; i++) {
						var member = data.offerMemberInfos[i];
						if(member.objType==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
							return false;
						}else if(member.objType==CONST.OBJ_TYPE.PROD){
							/*if(member.objId==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品规格【objId】节点为空，无法继续受理,请营业后台核实");
							return false;
						}*/
							if(member.accessNumber==""){
								$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
								return false;
							}
						}
						if(member.objInstId==prod.prodInstId){
							flag = false;
						}
					}
					if(flag){
						$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+prod.accNbr+"】，无法继续受理，请业务后台核实");
						return false;
					}
					OrderInfo.offer.offerMemberInfos = data.offerMemberInfos; 
					OrderInfo.offer.offerId = prod.prodOfferInstId;
					OrderInfo.offer.offerSpecId = prod.prodOfferId;
					OrderInfo.offer.offerSpecName = prod.prodOfferName;
					return true;
				}else{//销售品成员实例为空
					$.alert("提示","查询销售品实例构成，没有返回成员实例无法继续受理");
					return false;
				}
			}
		}
	};
	
	//销售品参数查询
	var _queryOfferParam = function(param,callBackFun) {
		var url= contextPath+"/app/offer/queryOfferParam";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>查询销售品实例参数中，请稍等...</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品实例参数失败,稍后重试");
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询销售品实例参数中，请稍等...</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品实例参数失败,稍后重试");
			}
		}
	};	
	
	/**
	 * 已订购附属查询 
	 */
	var _queryAttachOfferHtml = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/agent/offer/queryAttachOffer";
		if(OrderInfo.actionFlag==22){
			url = contextPath+"/agent/offer/queryAttachOffer2";
		}
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else {
						$.alert("提示","附属销售品实例查询失败,稍后重试");
						return;
					}
				}
			});
		}else{
			$.ecOverlay("<strong>查询附属销售品实例中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}		
	};
	
	/**
	 * 已订购销售品和功能产品
	 */
	var _queryOpenedAttachAndServ = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/agent/offer/queryOpenedAttachAndServ";
		$.ecOverlay("<strong>查询附属销售品实例中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else {
			$.alert("提示","查询附属销售品失败,稍后重试");
			return;
		}
	};
	
	//套餐变更，查询附属销售品页面
	var _queryChangeAttachOffer = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/agent/offer/queryChangeAttachOffer";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else {
						$.alert("提示","附属销售品实例查询失败,稍后重试");
						return;
					}
				}
			});
		}else{
			$.ecOverlay("<strong>查询附属销售品实例中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else {
				$.alert("提示","查询附属销售品实例失败,稍后重试");
				return;
			}
		}		
	};
	
	//附属销售品规格查询
	var _queryAttachSpec = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/agent/offer/queryAttachSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询附属销售品中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
						return;
					}else {
						$.alert("提示","附属销售品查询失败,稍后重试");
						return;
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询查询附属销售品中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
				return;
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}
	};
	
	//加载附属标签下的附属销售品
	var _queryCanBuyAttachSpec = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryCanBuyAttachSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询附属销售品中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
						return;
					}else {
						$.alert("提示","附属销售品查询失败,稍后重试");
						return;
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询附属销售品中，请稍等...</strong>");
			var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
				return;
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}
	};
	
	// 查询默认必须可选包
	var _queryDefMustOfferSpec = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryDefaultAndRequiredOfferSpec";
		$.ecOverlay("<strong>查询默认必须可选包中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			OrderInfo.isSuccess = "N";
			$.alertM(response.data);
			return;
		}else {
			OrderInfo.isSuccess = "N";
			$.alert("提示","可订购功能产品失败,稍后重试");
			return;
		}
	};
	// 查询默认必须可选包 + 功能产品 (补换卡加可选包)
	var _queryDefMustOfferSpecAndServ = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/agent/offer/queryDefaultAndRequiredOfferSpecAndServ";
		$.ecOverlay("<strong>查询默认必须可选包和功能产品中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			OrderInfo.isSuccess = "Y";
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","可订购可选包和功能产品失败,稍后重试");
			return;
		}
	};
	
	// 查询功能产品规格,(默认1，必须2，可订购3)
	var _queryServSpec = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/agent/offer/queryServSpec";
		$.ecOverlay("<strong>查询可订购功能产品中，请稍等...</strong>");
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
			$.alert("提示","可订购功能产品失败,稍后重试");
			return;
		}
	};
	
	//销售品互斥依赖查询
	var _queryExcludeDepend = function(param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryExcludeDepend";
		$.ecOverlay("<strong>规则校验中,请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","数据查询异常，请稍后重试！");
		}
	};
		
	//功能产品互斥依赖查询
	var _queryServExcludeDepend = function(param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryServExcludeDepend";
		$.ecOverlay("<strong>规则校验中,请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","数据查询异常，请稍后重试！");
		}
	};
	
	//查询附属销售品规格
	var _searchAttachOfferSpec = function(param,callBackFunc) {
		
		addParam(param);  //添加基本参数
		var url = contextPath+"/agent/offer/searchAttachOfferSpec";
		if(typeof(callBackFunc)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:encodeURI(JSON.stringify(param),"utf-8")},{
				"before":function(){
					$.ecOverlay("附属销售品查询中，请稍等...");
				},
				"done" : function(response){
					$.unecOverlay();
					if(response.code == 0){
						callBackFunc(response.data);
					}else if(response.code == -2){
						$.alertM(response.data);
					}else{
						$.alert("提示","查询附属销售失败，请稍后重试！");
					}
				},fail:function(response){
					$.unecOverlay();
					$.alert("提示","查询附属销售失败，请稍后重试！");
				}
			});
		}else{
			$.ecOverlay("<strong>附属销售品查询中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:encodeURI(JSON.stringify(param),"utf-8")});
			$.unecOverlay();
			if(response.code == 0){
				return response.data;
			}else if(response.code == -2){
				$.alertM(response.data);
			}else{
				$.alert("提示","查询附属销售失败，请稍后重试！");
			}
		}
	};
	
	//受理权限查询
	var _checkOperate = function(param) {
		var url = contextPath+"//app/order/checkOperate";
		$.ecOverlay("<strong>受理权限查询中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,"");
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","受理权限查询失败，请稍后重试！");
		}
	};
	
	//订单提交
	var _orderSubmit = function(param) {
		var url = contextPath+"/app/order/orderSubmit";
		if(OrderInfo.order.token!=""){
			url = contextPath+"/app/order/orderSubmit?token="+OrderInfo.order.token;
		}
		$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
		var response = $.callServiceAsHtml(url,param);
		$.unecOverlay();
		if(!response || response.code != 0){
			 return;
		}
		return response.data;
	};
	
	//订单提交（一次性）
	var _orderSubmitComplete = function(param) {
		var url = contextPath+"/app/order/orderSubmitComplete";
		if(OrderInfo.order.token!=""){
			url = contextPath+"/app/order/orderSubmitComplete?token="+OrderInfo.order.token;
		}
		$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if(!response || response.code != 0){
			 return;
		}
		return response.data;
	};	
	
	/**
	 * 查询主销售品规格构成
	 * 并对结果进行数据校验
	 */
	var _queryMainOfferSpec = function(param){
		var offerSpec = query.offer.queryOfferSpec(param); //查询主销售品构成
		if(offerSpec ==undefined){
			$.alert("错误提示","销售品规格构成查询: 没有找到销售品规格！");
			return false;
		}
		if( offerSpec.offerRoles ==undefined){
			$.alert("错误提示","销售品规格构成查询: 返回的销售品规格构成结构不对！");
			return false;
		}
		if(offerSpec.offerSpecId==undefined || offerSpec.offerSpecId==""){
			$.alert("错误提示","销售品规格构成查询: 销售品规格ID未返回，无法继续受理！");
			return false;
		}
		if(offerSpec.offerRoles.length == 0){
			$.alert("错误提示","销售品规格构成查询: 成员角色为空，无法继续受理！");
			return false;
		}
		if(offerSpec.feeType ==undefined || offerSpec.feeType=="" || offerSpec.feeType=="null"){
			$.alert("错误提示","无付费类型，无法新装！");
			return false;
		}
		offerSpec = SoOrder.sortOfferSpec(offerSpec); //排序主副卡套餐	
		if(OrderInfo.actionFlag==6 && ec.util.isArray(OrderInfo.oldprodInstInfos)){//主副卡纳入老用户
			OrderInfo.oldofferSpec.push({"offerSpec":offerSpec,"accNbr":param.accNbr});
		}else{
			OrderInfo.offerSpec = offerSpec;
		}
		return offerSpec;
	};
	
	/**
	 * 同步查询销售品规格构成
	 * 并对结果进行数据校验
	 */
	var _queryAttachOfferSpec = function(prodId,offerSpecId){
		var param = {
			offerSpecId:offerSpecId,
			partyId : OrderInfo.cust.custId,
			offerTypeCd:2	
		};	
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){//新装业务,添加主套餐id用于查询终端
			param.mainOfferSpecId = OrderInfo.offerSpec.offerSpecId;
		}
		if(OrderInfo.actionFlag==3){//可选包
			param.mainOfferSpecId = order.prodModify.choosedProdInfo.prodOfferId;
		}
		if(OrderInfo.actionFlag==21){//副卡换挡
			if(ec.util.isArray(OrderInfo.viceOfferSpec)){
				$.each(OrderInfo.viceOfferSpec,function(){
					if(this.prodId==prodId){
						param.mainOfferSpecId=this.offerSpecId;
						return false;
					}
				});
			}
		}
		var offerSpec = query.offer.queryOfferSpec(param); //查询主销售品构成
		if(offerSpec ==undefined || offerSpec.offerRoles ==undefined){
			$.alert("提示","返回的销售品规格构成结构不对！");
			return false;
		}
		if(offerSpec.offerSpecId==undefined || offerSpec.offerSpecId==""){
			$.alert("提示","销售品规格ID未返回，继续受理将出现异常！");
			return false;
		}
		if(offerSpec.offerSpecName==undefined || offerSpec.offerSpecName==""){
			$.alert("提示","销售品规格名称未返回，继续受理将出现异常！");
			return false;
		}
		var offerRoles = []; //过滤角色
		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var flag = false;
		$.each(offerSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				if(this.objId==prodSpecId){
					flag = true;
					return false;
				}
			});
			if(flag){
				offerRoles.push(this);
				return false;
			}
		});
		offerSpec.offerRoles = offerRoles;
		return offerSpec;
	};
	
	//预校验
	var _updateCheckByChange = function(param,callBackFun){
		var url = contextPath+"/order/prodModify/updateCheckByChange";
		if(typeof(callBackFun)=="function"){
			$.ecOverlay("<strong>正在预校验中，请稍等...</strong>");
			$.callServiceAsJson(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在预校验中，请稍等...</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code == 0) {
						callBackFun(response.data);
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
					    if (response.data.resultMsg) {
					        $.alert("提示","预校验失败!失败原因为："+response.data.resultMsg);
					    } else {
					        $.alert("提示","预校验失败! 集团营业后台未给出原因。");
					    }
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","预校验失败! 集团营业后台未给出原因。");
				}
			});
		}else{
			$.ecOverlay("<strong>正在预校验中，请稍等...</strong>");
			var response = $.callServiceAsJson(url,param);
			$.unecOverlay();
			if (response.code == 0) {
				return response.data;
			}else if (response.code == -2) {
				$.alertM(response.data);
			}else{
			    if (response.data.resultMsg) {
			        $.alert("提示","预校验失败!失败原因为："+response.data.resultMsg);
			    } else {
			        $.alert("提示","预校验失败! 集团营业后台未给出原因。");
			    }
			}
		}
	};
	
	/**
	 * 加载实例
	 * 如果传入了paramInfo，则使用它，否则拼入参
	 */
	var _loadInst = function(){
		if(OrderInfo.order.soNbr==null || OrderInfo.order.soNbr==undefined || OrderInfo.order.soNbr==""){
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		if(CONST.getAppDesc()!=0){ //不是4g不需要加载
			return true;
		}
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14 
				|| OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 
				|| OrderInfo.actionFlag==18){ //新装不要加载实例
			return true;
		}
		if (order.prodModify == undefined) { // 如果没有引入orderProdModify.js
			$.alert("提示","未获取到产品相关信息，无法办理二次业务！");
			return false;
		}
		var prod = order.prodModify.choosedProdInfo;
		
		if(prod==undefined || prod.prodInstId ==undefined){
			$.alert("提示","未获取到产品相关信息，无法办理二次业务！");
			return false;
		}
		var param = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),
			acctNbr : prod.accNbr,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			instId : prod.prodInstId,
			type : "2"
		};
		if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
			var flag = true;
			$.each(OrderInfo.offer.offerMemberInfos,function(){
				if(this.objType == CONST.OBJ_TYPE.PROD && this.accessNumber==prod.accNbr){ //选中号码在销售品实例构成中，为了防止销售品实例缓存
					flag = false;
					return false;
				}
			});
			if(flag){ //不在销售品实例缓存
				return query.offer.invokeLoadInst(param);
			}else{
				var vFlag = true;
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						param.acctNbr = this.accessNumber;
						param.instId = this.objInstId;
						if (!query.offer.invokeLoadInst(param)) {
							vFlag = false;
							return false;
						}
					}
				});
				return vFlag;
			}
		}else{
			return query.offer.invokeLoadInst(param);
		}
	};
	
	//补充查询基本条件
	var addParam = function(param){
		//param.staffId = '1762126';
		param.staffId = OrderInfo.staff.staffId;
		//param.channelId = '1388783';
		param.channelId	= OrderInfo.staff.channelId;
		
		//param.areaId = '8320102';
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		if(OrderInfo.cust.custId == ""){
			param.partyId = -1;
		}
		else{
			param.partyId = OrderInfo.cust.custId;
		}
		if(OrderInfo.actionFlag == 3){
			param.mainOfferSpecId=order.prodModify.choosedProdInfo.prodOfferId;
		}else if(OrderInfo.actionFlag==21){
			if(ec.util.isArray(OrderInfo.viceOfferSpec)){
				$.each(OrderInfo.viceOfferSpec,function(){
					if(this.prodId==param.prodId){
						param.mainOfferSpecId=this.offerSpecId;
						return false;
					}
				});
			}
		}else{
			param.mainOfferSpecId=OrderInfo.offerSpec.offerSpecId;
		}
		if(ec.util.isObj(OrderInfo.order.soNbr)){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
		else{
			param.soNbr = UUID.getDataId();
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		if(order.ysl!=undefined){
			if(order.ysl.yslbean.yslflag!=undefined){
//				param.yslflag = order.ysl.yslbean.yslflag;
			}
		}
		if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				if(param.acctNbr==OrderInfo.oldprodInstInfos[i].accNbr){
					param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
					param.partyId = OrderInfo.oldprodInstInfos[i].custId;
					param.mainOfferSpecId=OrderInfo.oldprodInstInfos[i].mainProdOfferInstInfos[0].prodOfferId;
				}
			}
		}
	};
	
	var _invokeLoadInst = function(param) {
//		order.prepare.createorderlonger();
		var url = contextPath+"/app/offer/loadInst";
		$.ecOverlay("<strong>全量信息加载中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);
		$.unecOverlay();
		if (response.code== 0) {
			return true;
		}else if(response.code==-2){
			$.alertM(response.data);
			return false;
		}else {
			if (response.msg == undefined) {
				$.alert("提示", "全量信息查询失败");
			} else {				
				$.alert("提示",response.msg);
			}
			return false;
		}
	};
	
	/**
	 * 产品信息查询
	 */
	var _queryProduct = function(param) {
		var url = contextPath+"/app/cust/offerorderprod";
		$.ecOverlay("<strong>查询产品信息中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else {
			$.alert("提示","查询附属销售品失败,稍后重试");
			return;
		}
	};
	
	/**
	 * 查询产品实例属性
	 * param : {
	 * prodId : "", //产品实例id
	 * acctNbr : "", //接入号
	 * prodSpecId : "", //产品规格id
	 * areaId : "" //地区id
	 * }
	 */
	var _queryProdInstParam = function(param) {
		var url = contextPath+"/app/order/prodInstParam";
		$.ecOverlay("<strong>查询产品实例属性中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else {
			$.alert("提示","查询附属销售品失败,稍后重试");
			return;
		}
	};
	
	//补换卡专用
	var _queryDefMustOfferSpecAndServAgent = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryDefaultAndRequiredOfferSpecAndServ";
		$.ecOverlay("<strong>查询默认必须可选包和功能产品中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			OrderInfo.isSuccess = "Y";
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","可订购可选包和功能产品失败,稍后重试");
			return;
		}
	};
	return {
		checkOperate			: _checkOperate,
		loadInst				: _loadInst,
		invokeLoadInst			: _invokeLoadInst,
		setOffer				: _setOffer,
		searchAttachOfferSpec	: _searchAttachOfferSpec,
		queryOfferSpec			: _queryOfferSpec,
		queryServSpec			: _queryServSpec,
		queryOfferInst 			: _queryOfferInst,
		queryOfferParam 		: _queryOfferParam,
		queryAttachOfferHtml	: _queryAttachOfferHtml,
		queryChangeAttachOffer  : _queryChangeAttachOffer,
		queryCanBuyAttachSpec 	: _queryCanBuyAttachSpec,
		queryExcludeDepend		: _queryExcludeDepend,
		queryServExcludeDepend	: _queryServExcludeDepend,
		queryAttachSpec			: _queryAttachSpec,
		queryMainOfferSpec		: _queryMainOfferSpec,
		queryAttachOfferSpec	: _queryAttachOfferSpec,
		queryDefMustOfferSpec	: _queryDefMustOfferSpec,
		queryDefMustOfferSpecAndServ : _queryDefMustOfferSpecAndServ,
		orderSubmit				: _orderSubmit,
		orderSubmitComplete		: _orderSubmitComplete,
		updateCheckByChange		: _updateCheckByChange,
		queryProduct			: _queryProduct,
		queryOpenedAttachAndServ: _queryOpenedAttachAndServ,
		queryProdInstParam		: _queryProdInstParam,
		queryDefMustOfferSpecAndServAgent		: _queryDefMustOfferSpecAndServAgent
		
		
	};
})();
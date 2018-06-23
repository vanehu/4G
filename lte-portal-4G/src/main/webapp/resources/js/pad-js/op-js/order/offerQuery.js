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
		var url= contextPath+"/offer/queryOfferSpec";
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
		var url= contextPath+"/offer/queryOfferInst";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
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
	var _setOffer = function() {
		var prod = order.prodModify.choosedProdInfo ; 
		var param = {
			offerId : prod.prodOfferInstId,
			offerSpecId : prod.prodOfferId,
			acctNbr : prod.accNbr,
			areaId : prod.areaId,
			distributorId : ""
		};
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
	};
	
	//销售品参数查询
	var _queryOfferParam = function(param,callBackFun) {
		var url= contextPath+"/offer/queryOfferParam";
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
		param.isServiceOpen="Y";
		
		var url = contextPath+"/token/pad/offer/queryAttachOffer";
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
		var url = contextPath+"/offer/queryOpenedAttachAndServ";
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
		param.isServiceOpen="Y";//Y-能力平台,N或不传-非能力平台
		var url = contextPath+"/pad/offer/queryChangeAttachOffer";
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
	// 查询功能产品规格,(默认1，必须2，可订购3)
	var _queryServSpecPost = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryServSpecPost";
		$.ecOverlay("<strong>查询可订购功能产品中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);	
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
	// 查询功能产品规格,(默认1，必须2，可订购3)
	var _queryServSpecPost = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryServSpecPost";
		$.ecOverlay("<strong>查询可订购功能产品中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);	
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
	//附属销售品规格查询
	var _queryAttachSpec = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		param.isServiceOpen="Y";
		var url = contextPath+"/pad/offer/queryAttachSpec";
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
			$.ecOverlay("<strong>查询附属销售品中，请稍等...</strong>");
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
		//redmine1503673可订购附属查询接口中新增已订购附属id
		var offerList = CacheData.getOfferList(param.prodId); //过滤已订购
		$.each(offerList,function(){
			if(this.offerSpecId !="" && this.offerSpecId !=null){
				param.offerSpecIds.push(this.offerSpecId);
			}
		});
		var url = contextPath+"/offer/queryCanBuyAttachSpec";
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
        //#1524389 主副卡纳入老用户，默认必选套餐参数传新套餐ID
        if(OrderInfo.actionFlag==6 || OrderInfo.actionFlag==2){
            for(var j=0;j<OrderInfo.oldoffer.length;j++){
                for(var i=0;i<OrderInfo.oldoffer[j].offerMemberInfos.length;i++){
                    if(param.acctNbr==OrderInfo.oldoffer[j].offerMemberInfos[i].accessNumber){
                        param.mainOfferSpecId=OrderInfo.offerSpec.offerSpecId;
                        param.offerSpecId=OrderInfo.offerSpec.offerSpecId;
                        if(ec.util.isObj(OrderInfo.offerSpec.offerRoles)){
                            $.each(OrderInfo.offerSpec.offerRoles,function(){
                                if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){
                                    param.offerRoleId = this.offerRoleId;
                                }
                            });
                        }
                    }
                }
            }
        }
        var url = contextPath+"/offer/queryDefaultAndRequiredOfferSpec";
		$.ecOverlay("<strong>查询默认必须可选包中，请稍等...</strong>");
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
	
	// 查询功能产品规格,(默认1，必须2，可订购3)
	var _queryServSpec = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryServSpec";
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
		var url = contextPath+"/offer/queryExcludeDepend";
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
	
	//销售品互斥依赖查询PAD端弹框查询
	var _queryExcludeDependBomb = function(openMap, prodId){
		//通过cookie传递拿到订购套餐的specId
		var mainSpecId = OrderInfo.offerSpec.offerSpecId;
		var needDelOfferLists = openMap.result.offerLists;
		//拼接orderedOfferSpecIds数组，为已定可选包的offerSpecId
		//var orderedOfferSpecIds = [];
		var saveOrderedOfferSpecIds = OrderInfo.saveOrderedOfferSpecIds;
		if(needDelOfferLists.length > 0){
			var nowDate = new Date().getFullYear() + (new Date().getMonth() + 1 < 10 ? "0"+(new Date().getMonth() + 1):new Date().getMonth() + 1);
			for(var i = 0;i < needDelOfferLists.length;i++){
				//调后台互斥查询接口前，通过已订购返回的数据判断互斥可选包是否当月失效，若是当月失效则不需要判断互斥
				if((ec.util.isObj(needDelOfferLists[i].expDate) && (needDelOfferLists[i].expDate).substr(0,6) - nowDate >= 0) || (!ec.util.isObj(needDelOfferLists[i].expDate))){
					//遍历拿到所有的offerSpecId
					var offerSpecId = needDelOfferLists[i].offerSpecId;
					saveOrderedOfferSpecIds.push(offerSpecId);
				}
			}
			
		}
		//遍历去除空字符串
		for(var i = 0;i<saveOrderedOfferSpecIds.length;i++){
		    if(saveOrderedOfferSpecIds[i]==''||saveOrderedOfferSpecIds[i]==null){
		    	saveOrderedOfferSpecIds.splice(i,1);
		        i=i-1;
		    }
		}
		var param = CacheData.getExcDepOfferParam(prodId, mainSpecId);
		param.orderedOfferSpecIds = saveOrderedOfferSpecIds;
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		OrderInfo.queryExcludeDependData = data;
	}
		
	//功能产品互斥依赖查询
	var _queryServExcludeDepend = function(param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryServExcludeDepend";
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
	var _searchAttachOfferSpec = function(param) {
		addParam(param);  //添加基本参数
		if(ec.util.isArray(OrderInfo.oldprodInstInfos) && (OrderInfo.actionFlag==6)){
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				if(param.acctNbr==OrderInfo.oldprodInstInfos[i].accNbr){
					param.mainOfferSpecId=OrderInfo.offerSpec.offerSpecId;
					param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);	
					if(ec.util.isObj(OrderInfo.offerSpec.offerRoles)){
						$.each(OrderInfo.offerSpec.offerRoles,function(){
							if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){
								param.offerRoleId = this.offerRoleId;
							}
						});
					}
				}
			}
		}
		var url = contextPath+"/token/pad/offer/searchAttachOfferSpec";
		$.ecOverlay("<strong>附属销售品查询中，请稍等...</strong>");
		var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","查询附属销售失败，请稍后重试！");
		}
	};
	
	//受理权限查询
	var _checkOperate = function(param) {
		var url = contextPath+"/order/checkOperate";
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
		var url = contextPath+"/order/orderSubmit";
		if(OrderInfo.order.token!=""){
			url = contextPath+"/order/orderSubmit?token="+OrderInfo.order.token;
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
		var url = contextPath+"/order/orderSubmitComplete";
		if(OrderInfo.order.token!=""){
			url = contextPath+"/order/orderSubmitComplete?token="+OrderInfo.order.token;
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
		if((OrderInfo.actionFlag==6||OrderInfo.actionFlag==2 || OrderInfo.actionFlag==1) && ec.util.isArray(OrderInfo.oldprodInstInfos)){//主副卡纳入老用户
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
	var _updateCheckByChange = function(param){
		var url = contextPath+"/order/prodModify/updateCheckByChange";
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
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){ //新装不要加载实例
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
			type : "2",
			queryType: "1,2,3,4,5",
			acctNbr : "",
			data:[]
		};
		// 企业版云盘需要传入prodBigClass为19
		if (prod.productId == CONST.PROD_SPEC.PROD_CLOUD_OFFER) {
			param.prodBigClass = 19;
		}
		//获取判断是调用新的全量接口是旧的全量接口
		var queryMergeFlag=OrderInfo.provinceInfo.mergeFlag;
		
		if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
			var flag = true;
			$.each(OrderInfo.offer.offerMemberInfos,function(){
				if(this.objType == CONST.OBJ_TYPE.PROD && this.accessNumber==prod.accNbr){ //选中号码在销售品实例构成中，为了防止销售品实例缓存
					flag = false;
					return false;
				}
			});
			
			if(flag){ //不在销售品实例缓存
				if(queryMergeFlag!=null && queryMergeFlag!="" && queryMergeFlag!="undefined" && queryMergeFlag=="1"){
					param.data.push({accessNbr:prod.accNbr,instId:prod.prodInstId});
					return _invokeLoadInstSub(param);
				}else{
					return query.offer.invokeLoadInst(param);
				}
				return query.offer.invokeLoadInst(param);
			}else{
				var vFlag = true;
				
				//1调用新接口，如果是0，就是按照旧的方式调用
				if(queryMergeFlag!=null && queryMergeFlag!="" && queryMergeFlag!="undefined" && queryMergeFlag=="1"){
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objType == CONST.OBJ_TYPE.PROD){
							param.data.push({accessNbr:this.accessNumber,instId:this.objInstId});
						}
					});
					
					if(param!=null){
						if (!_invokeLoadInstSub(param)) {
							vFlag = false;
							return false;
						}
					}
				}else{
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
				}
				
				return vFlag;
			}
		}else{
			if(queryMergeFlag!=null && queryMergeFlag!="" && queryMergeFlag!="undefined" && queryMergeFlag=="1"){
				param.data.push({accessNbr:prod.accNbr,instId:prod.prodInstId});
				return _invokeLoadInstSub(param);
			}else{
				return query.offer.invokeLoadInst(param);
			}
		}
	};
	
	//补充查询基本条件
	var addParam = function(param){
		param.staffId = OrderInfo.staff.staffId;
		param.channelId = OrderInfo.staff.channelId;
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		param.partyId = OrderInfo.cust.custId;
		param.distributorId = OrderInfo.staff.distributorId;
		
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
		
		if(order.ysl!=undefined){
			if(order.ysl.yslbean.yslflag!=undefined){
				param.yslflag = order.ysl.yslbean.yslflag;
			}
		}
		
		if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//主副卡纳入老用户
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
		order.prepare.createorderlonger();
		var url = contextPath+"/offer/loadInst";
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
	
	var _invokeLoadInstSub = function(param) {
		order.prepare.createorderlonger();
		var url = contextPath+"/token/pad/offer/loadInstNew";
		$.ecOverlay("<strong>全量信息加载中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,JSON.stringify(param));
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
	 * 主副卡页面查询 
	 */
	var _queryMemberHtml = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/token/pad/offer/queryMember";
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
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
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
		var url = contextPath+"/order/prodInstParam";
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
	
	return {
		queryServSpecPost:_queryServSpecPost,
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
		orderSubmit				: _orderSubmit,
		orderSubmitComplete		: _orderSubmitComplete,
		updateCheckByChange		: _updateCheckByChange,
		queryOpenedAttachAndServ: _queryOpenedAttachAndServ,
		queryMemberHtml			: _queryMemberHtml,
		queryProdInstParam		: _queryProdInstParam,
		invokeLoadInstSub:_invokeLoadInstSub,
		queryExcludeDependBomb:_queryExcludeDependBomb
	};
})();
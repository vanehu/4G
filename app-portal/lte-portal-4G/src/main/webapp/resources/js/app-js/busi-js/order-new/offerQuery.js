/**
 * 销售品产品相关查询
 * 
 * @author yanghm
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
		var url= contextPath+"/app/offer/queryOfferSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>请求处理中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							if(OrderInfo.actionFlag==201){//橙分期
								order.orange.orangeSpec= response.data.offerSpec;
							}
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
	
	//附属销售品规格查询(选完主套餐带出的可订购和可选择可选包等)
	var _queryAttachSpec = function(param,callBackFun) {
		param.enter=3;//传给controller表示新版ui
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryAttachSpec";
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
	
	//查询我的收藏
	var _queryMyfavorite = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryMyfavorite";
		$.ecOverlay("<strong>查询收藏功能产品中，请稍等...</strong>");
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
			$.alert("提示","查询我的收藏失败,稍后重试");
			return;
		}
	};
	//补充查询参数
	var addParam = function(param){
		//param.staffId = '1762126';
		param.staffId = OrderInfo.staff.staffId;
		//param.channelId = '1388783';
		param.channelId	= OrderInfo.staff.channelId;
		
		//param.areaId = '8320102';
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		param.partyId = OrderInfo.cust.custId;
		param.mainOfferSpecId=OrderInfo.offerSpec.offerSpecId;
		if(ec.util.isObj(OrderInfo.order.soNbr)){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
		else{
			param.soNbr = UUID.getDataId();
			OrderInfo.order.soNbr = UUID.getDataId();
		}
	};
	
	/**
	 * 已订购销售品和功能产品
	 */
	var _queryOpenedAttachAndServ = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryOpenedAttachAndServ";
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
	
	//销售品互斥依赖查询
	var _queryExcludeDepend = function(param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryExcludeDepend";
		$.ecOverlay("<strong>规则校验中,请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});
		if(response.code == 0){
			$.unecOverlay();
			return response.data;
		}else if(response.code == -2){
			$.unecOverlay();
			$.alertM(response.data);
		}else{
			$.unecOverlay();
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
	
	// 查询功能产品规格,(默认1，必须2，可订购3)
	var _queryServSpec = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/queryServSpec";
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
	
	//查询促销页可订购可选包、流量包等
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
	
	//添加销售品收藏
	var _addMyfavorite = function (param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/addMyfavorite";
		$.ecOverlay("<strong>收藏功能产品中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==1){
			$.alert("提示",response.data);
			return;
		}else {
			$.alert("提示","收藏功能产品失败,稍后重试");
			return;
		}
	};
	//取消收藏销售品
	var _delMyfavorite = function (param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/delMyfavorite";
		$.ecOverlay("<strong>取消收藏功能产品中，请稍等...</strong>");
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
			$.alert("提示","取消收藏功能产品失败,稍后重试");
			return;
		}
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
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==201){//可选包
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
	
	//查询附属销售品规格
	var _searchAttachOfferSpec = function(param,callBackFunc) {
		
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/offer/searchAttachOfferSpec";
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
	
	return {
		  queryOfferSpec        :_queryOfferSpec,
		  queryAttachSpec       :_queryAttachSpec,
		  queryMyfavorite       :_queryMyfavorite,
		  queryExcludeDepend    :_queryExcludeDepend,
		  queryServExcludeDepend:_queryServExcludeDepend,
		  queryServSpec         :_queryServSpec,
		  queryCanBuyAttachSpec :_queryCanBuyAttachSpec,
		  addMyfavorite         :_addMyfavorite,
		  delMyfavorite         :_delMyfavorite,
		  queryAttachOfferSpec  :_queryAttachOfferSpec,
		  searchAttachOfferSpec :_searchAttachOfferSpec,
		  loadInst              :_loadInst,
		  invokeLoadInst        :_invokeLoadInst,
		  queryOpenedAttachAndServ	:_queryOpenedAttachAndServ
		
	};
})();
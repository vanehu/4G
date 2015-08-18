/**
 * 销售品变更
 * 
 * @author wukf
 * date 2013-9-22
 */
CommonUtils.regNamespace("offerChange");

offerChange = (function() {
	
	var _resultOffer = {}; //预校验单接口返回
	var _isChangeFeeType=false;
	//初始化套餐变更页面
	var _init = function (){
		CacheData.isDynamicStored = true;
		offerChange.isChangeFeeType=false;
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 2;
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		//规则校验入参
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		},{
			boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		}];
		if(!rule.rule.ruleCheck(boInfos)){ //规则校验失败
			return;
		}
		//初始化套餐查询页面
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsHtmlGet(contextPath+"/order/prodoffer/prepare",{});	
		$.unecOverlay();
		if(response.code != 0) {
			$.alert("提示","查询失败,稍后重试");
			return;
		}
		SoOrder.step(0,response.data); //订单准备
		$('#search').bind('click',function(){
			order.service.searchPack();
		});
		order.prodOffer.init();
		order.service.searchPack(); //查询可以变更套餐
	};
		
	//套餐变更页面显示
	var _offerChangeView=function(){
		var oldLen = 0 ;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==2){
				oldLen++;
			}
		});
		var memberNum = 1; //判断是否多成员 1 单成员2多成员
		var viceNum = 0;
		if(oldLen>1){ //多成员角色，目前只支持主副卡
			memberNum = 2;
		}
		//把旧套餐的产品自动匹配到新套餐中
		if(!_setChangeOfferSpec(memberNum,viceNum)){  
			return;
		};
		//4g系统需要
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			if(!prod.uim.setProdUim()){ 
				return ;
			}
		}
		//初始化填单页面
		var prodInfo = order.prodModify.choosedProdInfo;
		var param = {
			boActionTypeCd : "S2" ,
			boActionTypeName : "套餐变更",
			actionFlag :"2",
			offerSpec : OrderInfo.offerSpec,
			prodId : prodInfo.prodInstId,
			offerMembers : OrderInfo.offer.offerMemberInfos,
			oldOfferSpecName : prodInfo.prodOfferName,
			oldOfferFeeType : prodInfo.feeType, //老套餐付费类型，用于初始化套餐变更页面 --jinjian
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc()
		};
		order.main.buildMainView(param);
	};
	
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_fill_content").html(response.data);
		$("#fillNextStep").off("click").on("click",function(){
			SoOrder.submitOrder();
		});
		$("#fillLastStep").off("click").on("click",function(){
			offerChange.isChangeFeeType=false;
			order.main.lastStep();
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		//遍历主销售品构成
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(ec.util.isArray(this.prodInsts)){
				$.each(this.prodInsts,function(){
					var prodId = this.prodInstId;
					var param = {
						areaId : OrderInfo.getProdAreaId(prodId),
						channelId : OrderInfo.staff.channelId,
						staffId : OrderInfo.staff.staffId,
					    prodId : prodId,
					    prodSpecId : this.objId,
					    offerSpecId : prodInfo.prodOfferId,
					    offerRoleId : this.offerRoleId,
					    acctNbr : this.accessNumber
					};
					var res = query.offer.queryChangeAttachOffer(param);
					$("#attach_"+prodId).html(res);	
					//如果objId，objType，objType不为空才可以查询默认必须
					if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
						param.queryType = "1,2";
						param.objId = this.objId;
						param.objType = this.objType;
						param.memberRoleCd = this.roleCd;
						param.offerSpecId=OrderInfo.offerSpec.offerSpecId;
						//默认必须可选包
						var data = query.offer.queryDefMustOfferSpec(param);
						CacheData.parseOffer(data);
						//默认必须功能产品
						var data = query.offer.queryServSpec(param);
						CacheData.parseServ(data);
					}
					/*if(CONST.getAppDesc()==0 && prodInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){	//预校验
					}else{	
					}*/
					AttachOffer.showMainRoleProd(prodId); //显示新套餐构成
					AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
					if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
						$("#uimDiv_"+prodId).show();
					}
				});
			}
		});
		order.dealer.initDealer(); //初始化发展人
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){ //3G转4G需要校验
			offerChange.checkOfferProd();
		}
	};
	
	//套餐变更提交组织报文
	var _changeOffer = function(busiOrders){
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
		_createChangeFeeType(busiOrders,OrderInfo.offer); //变更付费类型
		AttachOffer.setAttachBusiOrder(busiOrders);  //订购退订附属销售品
		if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
						if(OrderInfo.boProd2Tds.length>0){
							var prod = {
								prodId : this.objInstId,
								prodSpecId : this.objId,
								accessNumber : this.accessNumber,
								isComp : "N",
								boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
							};
							var busiOrder = OrderInfo.getProdBusiOrder(prod);
							if(busiOrder){
								busiOrders.push(busiOrder);
							}
						}
					}
				});
			}
		}
	};
			
	//创建退订主销售品节点
	var _createDelOffer = function(busiOrders,offer){	
		offer.offerTypeCd = 1;
		offer.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		var prodInfo = order.prodModify.choosedProdInfo;
		OrderInfo.getOfferBusiOrder(busiOrders,offer, prodInfo.prodInstId);
	};
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders,offer) {
		var prod = order.prodModify.choosedProdInfo;
		var offerSpec = OrderInfo.offerSpec;
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				objId : offerSpec.offerSpecId,  //业务规格ID
				offerTypeCd : "1", //1主销售品
				accessNumber : prod.accNbr  //接入号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
			}, 
			data:{
				ooRoles : [],
				ooOwners : [{
					partyId : OrderInfo.cust.custId, //客户ID
					state : "ADD" //动作
				}]
			}
		};
		//遍历主销售品构成
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.prodInsts!=undefined){
				$.each(this.prodInsts,function(){
					var ooRoles = {
						objId : this.objId, //业务规格ID
						objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
						objType : this.objType, // 业务对象类型
						offerRoleId : offerRole.offerRoleId, //销售品角色ID
						state : "ADD" //动作
					};
					busiOrder.data.ooRoles.push(ooRoles);
				});
			}
		});

		//销售参数节点
		if(ec.util.isArray(offerSpec.offerSpecParams)){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.value,
	                state : "ADD"
	            };
	            busiOrder.data.ooParams.push(ooParam);
			}				
		}
		
		//销售生失效时间节点
		if(offerSpec.ooTimes !=undefined ){
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(offerSpec.ooTimes);
		}
		//发展人
		busiOrder.data.busiOrderAttrs = [];
		var $tr = $("tr[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
			});
		}
		busiOrders.push(busiOrder);
	};
	
	//填单页面切换
	var _changeTab = function(prodId) {
		$.each($("#tab_"+prodId).parent().find("li"),function(){
			$(this).removeClass("setcon");
			$("#attach_tab_"+$(this).attr("prodId")).hide();
			$("#uimDiv_"+$(this).attr("prodId")).hide();
		});
		$("#tab_"+prodId).addClass("setcon");
		$("#attach_tab_"+prodId).show();
		if(AttachOffer.isChangeUim(prodId)){
			$("#uimDiv_"+prodId).show();
		}
	};
	
	//省里校验单
	var _checkOrder = function(prodId){
		_getChangeInfo();
		var data = query.offer.updateCheckByChange(JSON.stringify(OrderInfo.orderData));
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = []; //校验完清空	
		if(data==undefined){
			return false;
		}
		if(data.result!=undefined){
			offerChange.resultOffer = data.result;
		}else {
			offerChange.resultOffer = {}; 
		}
		return true;
	};
	
	//把旧套餐的产品自动匹配到新套餐中，由于现在暂时只支持主副卡跟单产品，所以可以自动匹配
	var _setChangeOfferSpec = function(memberNum,viceNum){
		if(memberNum==1){ //单产品变更
			var offerRole = getOfferRole();
			if(offerRole==undefined){
				alert("错误提示","无法变更到该套餐");
				return false;
			}
			offerRole.prodInsts = [];
			$.each(offerRole.roleObjs,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){
					var roleObj = this;
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							roleObj.prodInstId = this.objInstId;
							roleObj.accessNumber = this.accessNumber;
							offerRole.prodInsts.push(roleObj);
						}
					});
				}
			});
		}else{  //多成员角色
			for (var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				if(offerMember.objType==CONST.OBJ_TYPE.PROD){
					var flag = true;
					for (var j = 0; j < OrderInfo.offerSpec.offerRoles.length; j++) {
						var offerRole = OrderInfo.offerSpec.offerRoles[j];
						if(offerMember.roleCd==offerRole.memberRoleCd){ //旧套餐对应新套餐角色
							for (var k = 0; k < offerRole.roleObjs.length; k++) {
								var roleObj = offerRole.roleObjs[k];
								if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
									if(!ec.util.isArray(offerRole.prodInsts)){
										offerRole.prodInsts = [];
									}
									var newObject = jQuery.extend(true, {}, roleObj); 
									newObject.prodInstId = offerMember.objInstId;
									newObject.accessNumber = offerMember.accessNumber;
									offerRole.prodInsts.push(newObject);
									if(offerRole.prodInsts.length>roleObj.maxQty){
										$.alert("规则限制","新套餐【"+offerRole.offerRoleName+"】角色最多可以办理数量为"+roleObj.maxQty+",而旧套餐数量大于"+roleObj.maxQty);
										return false;
									}
									break;
								}
							}
							flag = false;
							break;
						}
					}
					if(flag){
						$.alert("规则限制","旧套餐【"+offerMember.roleName+"】角色在新套餐中不存在，无法变更");
						return false;
					}
				}
			}
		}
		return true;
	};
	
	//获取单产品变更自动匹配的角色
	var getOfferRole = function(){
		//新套餐是主副卡,获取主卡角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){  //主卡
				return offerRole;
			}
		}
		//新套餐不是主副卡，返回第一个包含接入产品的角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			for (var j = 0; j < offerRole.roleObjs.length; j++) {
				var roleObj = offerRole.roleObjs[j];
				if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					return offerRole;
				}
			}
		}
	};
	
	//获取套餐变更节点
	var _getChangeInfo = function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
		_createChangeFeeType(busiOrders,OrderInfo.offer); //变更付费类型
	};
	
	//根据省内返回的数据校验
	var _checkOfferProd = function(){
		if(offerChange.resultOffer==undefined){
			return;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			$.each(prodInfos,function(){
				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
				var flag = true;
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);
					if(this.state=="DEL"){
						if(serv!=undefined){
							var $span = $("#li_"+prodId+"_"+this.prodInstId).find("span");
							$span.addClass("del");
							serv.isdel = "Y";
							$("#del_"+prodId+"_"+this.prodInstId).hide();
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){  //在已开通里面，修改不让关闭
							$("#del_"+prodId+"_"+this.prodInstId).hide();
						}else{
							var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
							if(servSpec!=undefined){
								$("#del_"+prodId+"_"+this.productId).hide();
							}else {
								if(this.productId!=undefined && this.productId!=""){
									//AttachOffer.addOpenServList(prodId,this.productId,this.prodName,this.ifParams);
									AttachOffer.openServSpec(prodId,this.productId);
								}
							}
						}
					}
				}
			});
		}
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			$.each(offers,function(){
				var prodId = 0;
				if(this.memberInfo==undefined){
					return true;
				}
				var flag = true;
				$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
					if(ec.util.isObj(this.accProdInstId)){
						prodId = this.accProdInstId;
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
				if(this.state=="DEL"){
					if(offer!=undefined){
						var $span = $("#li_"+prodId+"_"+this.prodOfferInstId).find("span");
						$span.addClass("del");
						offer.isdel = "Y";
						$("#del_"+prodId+"_"+this.prodOfferInstId).hide();
					}	
				}else if(this.state=="ADD"){
					if(offer!=undefined){ //在已开通里面，修改不让关闭
						$("#del_"+prodId+"_"+this.prodOfferInstId).hide();
					}else{
						var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已开通里面查找
						if(offerSpec!=undefined){
							$("#del_"+prodId+"_"+this.prodOfferId).hide();
						}else {
							if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
								//AttachOffer.addOpenList(prodId,this.prodOfferId);			
								AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
							}
						}
					}
				}
			});
		}
	};
	
	//套餐变更，更改付费类型
	var _setChangeOfferFeeType = function(dom,defaultValue){
		var oldOfferFeeType = order.prodModify.choosedProdInfo.feeType;
		if(oldOfferFeeType != 1200 && oldOfferFeeType != 1202){
			$.alert("提示","不可变更新套餐付费类型");
			$(dom).val(defaultValue);
			return;
		}
		var newOfferFeeType = dom ? $(dom).val() : '';
		if(newOfferFeeType != 1200 && newOfferFeeType != 1202){
			$.alert("提示","新套餐付费类型只能变更为后付费或准预付费实时信控");
			$(dom).val(defaultValue);
			return;
		}
		OrderInfo.offerSpec.feeType = newOfferFeeType;
		
		offerChange.isChangeFeeType=true;
		AttachOffer.showOfferSpecByFeeType();
	};
	
	//创建变更付费类型节点
	var _createChangeFeeType = function(busiOrders,offer){
		var oldOfferFeeType = order.prodModify.choosedProdInfo.feeType;
		var newOfferFeeType = OrderInfo.offerSpec.feeType;
		if(newOfferFeeType != 1200 && newOfferFeeType != 1202){
			newOfferFeeType = $('#offerChangeFeeTypeSelect').val();
		}
		if(newOfferFeeType != oldOfferFeeType){
			$.each(offer.offerMemberInfos, function(i, offerMember){
				if(offerMember.objType==2){//接入类产品作为需要更换付费方式的成员
					var busiOrder = {
							areaId : OrderInfo.getProdAreaId(offerMember.objInstId),
							busiOrderInfo : {
								seq : OrderInfo.SEQ.seq--
							},
							busiObj : { //业务对象节点
								instId : offerMember.objInstId, //业务对象实例ID
								objId : offerMember.objId,  //产品规格ID
								accessNumber : offerMember.accessNumber  //接入号码
							},
							boActionType : {
								actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
								boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_FEE_TYPE
							},
							data:{
								boProdFeeTypes : [
								                 {
								                	 feeType : oldOfferFeeType,
								     				 state : "DEL"
								                 },{
								                	 feeType : newOfferFeeType,
								     				 state : "ADD"
								                 }]
							}
					};
					busiOrders.push(busiOrder);
				}
			});
		}
	};
	
	return {
		init 					: _init,
		changeOffer 			: _changeOffer,
		offerChangeView			: _offerChangeView,
		changeTab				: _changeTab,
		checkOrder				: _checkOrder,
		fillOfferChange			: _fillOfferChange,
		resultOffer				: _resultOffer,
		checkOfferProd			: _checkOfferProd,
		getChangeInfo			: _getChangeInfo,
		setChangeOfferSpec		: _setChangeOfferSpec,
		setChangeOfferFeeType	: _setChangeOfferFeeType,
		isChangeFeeType			: _isChangeFeeType
	};
})();
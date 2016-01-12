/**
 * 销售品变更
 * 
 * @author wukf
 * date 2013-9-22
 */
CommonUtils.regNamespace("offerChange");

offerChange = (function() {
	
	//初始化套餐变更页面
	var _init = function (){
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=2;
		OrderInfo.actionFlag = 2;
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		order.service.searchPack();
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
				offerChange.checkOrder(undefined, function(result){
					if(!result){ //省内校验单
						return;
					}
					//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
					if(!prod.uim.setProdUim()){ 
						return ;
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
						prodClass : prodInfo.prodClass,
						appDesc : CONST.getAppDesc()
					};
					order.main.buildMainView(param);
				});
				return;
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
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc()
		};
		order.main.buildMainView(param);
	};
	
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		// 返回按钮
		$("#offer-change-back-btn").removeAttr("onclick");
		$("#offer-change-back-btn").off("click").on("click",function(){
			order.main.lastStep();
		});
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_prepare").hide();
		$("#order-offer-change-list").html(response.data).show();
//		_initOfferLabel();//初始化主副卡标签
		$("#fillNextStep").off("click").on("click",function(){
			if(!SoOrder.checkData()){ //校验通过
				return false;
			}
			$("#order-content").hide();
			// 强商去掉发展人
//			$("#order-dealer").show();
//			order.dealer.initDealer();
			SoOrder.submitOrder();
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		$("#attach-modal").modal('show');
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
						CacheData.parseOffer(data,prodId);
						//默认必须功能产品
						param.queryType = "1";//只查询必选，不查默认
						var data = query.offer.queryServSpec(param);
						CacheData.parseServ(data,prodId);
					}
					/*if(CONST.getAppDesc()==0 && prodInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){	//预校验
					}else{	
					}*/
					AttachOffer.showMainRoleProd(prodId); //显示新套餐构成
//					AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
					if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
						//if(!uimDivShow){
							$("#uimDiv_"+prodId).show();
						//}else{
						//	$("#uimDiv_"+prodId).hide();
						//}
					}
					//uimDivShow=true;
				});
			}
		});
//		order.dealer.initDealer(); //初始化发展人
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){ //3G转4G需要校验
			offerChange.checkOfferProd();
		}
		order.main.initTounch();
	};
	
	//套餐变更提交组织报文
	var _changeOffer = function(busiOrders){
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
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
				objName : offerSpec.offerSpecName, //业务名称
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
		var $tr = $("li[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
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
		/*
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
		*/
	};
	
	//省里校验单
	var _checkOrder = function(prodId,callBackFun){
		if(OrderInfo.actionFlag==3){
			_getAttachOfferInfo();
		}else{
			_getChangeInfo();
		}
		if(typeof(callBackFun)=="function"){
			query.offer.updateCheckByChange(JSON.stringify(OrderInfo.orderData),function(data){
				OrderInfo.orderData.orderList.custOrderList[0].busiOrder = []; //校验完清空	
				if(data==undefined){
					callBackFun(false);
				}
				if(data.resultCode==0 && ec.util.isObj(data.result)){ //预校验成功
					offerChange.resultOffer = data.result;
				}else {
					$.alert("预校验规则限制",data.resultMsg);
					offerChange.resultOffer = {}; 
					callBackFun(false);
				}
				callBackFun(true);
			});
		}else{
			var data = query.offer.updateCheckByChange(JSON.stringify(OrderInfo.orderData));
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = []; //校验完清空	
			if(data==undefined){
				return false;
			}
			if(data.resultCode==0 && ec.util.isObj(data.result)){ //预校验成功
				offerChange.resultOffer = data.result;
			}else {
				$.alert("预校验规则限制",data.resultMsg);
				offerChange.resultOffer = {}; 
				return false;
			}
			return true;
		}
	};
	
	//3G套餐订购4G流量包时预校验的入参封装
	var _getAttachOfferInfo=function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && spec.ifPackage4G=="Y"){  //订购的附属销售品
					spec.offerTypeCd = 2;
					spec.boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_OFFER;
					spec.offerId = OrderInfo.SEQ.offerSeq--; 
					OrderInfo.getOfferBusiOrder(busiOrders,spec,open.prodId);	
				}
			}
		}
		$.each(busiOrders,function(){
			this.busiObj.state="ADD";
		});
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
			var flag=false;
			$.each(offerRole.roleObjs,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){
					var roleObj = this;
					flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							if(roleObj.objId!=this.objId){
								$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+this.roleName+"】角色的规格ID【"+this.objId+"】不一样");
								flag=true;
								return false;
							}
							roleObj.prodInstId = this.objInstId;
							roleObj.accessNumber = this.accessNumber;
							offerRole.prodInsts.push(roleObj);
						}
					});
					if(flag){
						return false;
					}
				}
			});
			if(flag){
				return false;
			}
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
									if(roleObj.objId!=offerMember.objId){
										$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+offerMember.roleName+"】角色的规格ID【"+offerMember.objId+"】不一样");
										return false;
									}
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
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.cust.areaId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
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
							var $dd = $("#li_"+prodId+"_"+this.prodInstId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+this.prodInstId);
								var $span_remove = $("#span_remove_"+prodId+"_"+this.prodInstId);
								if(ec.util.isObj($span)){
									$span.addClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								serv.isdel = "Y";
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){  //在已开通里面，修改不让关闭
							var $dd = $("#li_"+prodId+"_"+this.prodInstId);
							if(ec.util.isObj($dd)){
								var $span = $("#span_"+prodId+"_"+this.prodInstId);
								var $span_remove = $("#span_remove_"+prodId+"_"+this.prodInstId);
								if(ec.util.isObj($span)){
									$span.removeClass("del");
								}
								if(ec.util.isObj($span_remove)){
									$span_remove.hide();
								}
								$dd.removeAttr("onclick");
								serv.isdel = "N";
							}
						}else{
							var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
							if(servSpec!=undefined){
								var $dd = $("#li_"+prodId+"_"+this.productId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.productId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.productId);
									if(ec.util.isObj($span)){
										$span.removeClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									servSpec.isdel = "N";
								}
								
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
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){//多产品套餐
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					var prodId = this.objInstId;
					$.each(offers,function(){
						if(this.memberInfo==undefined){
							return true;
						}
						var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
						var flag = true;
						$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
							if(prodId == this.accProdInstId){		
								if(ec.util.isObj(offer)){
									this.prodId = this.accProdInstId;
								}
								flag = false;
								return false;
							}
						});
						if(flag){
							return true;
						}
						if(this.state=="DEL"){
							if(offer!=undefined){
								var $dd = $("#li_"+prodId+"_"+this.prodOfferInstId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.prodOfferInstId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferInstId);
									if(ec.util.isObj($span)){
										$span.addClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									offer.isdel = "N";
								}
								offer.isdel = "Y";
								if(this.isRepeat!="Y"){//如果可选包下面有多个接入类产品，到时候只拼一个退订节点
									this.isRepeat="Y";
								}else{
									offer.isRepeat="Y";
								}
							}	
						}else if(this.state=="ADD"){
							if(offer!=undefined){ //在已开通里面，修改不让关闭
								var $dd = $("#li_"+prodId+"_"+this.prodOfferInstId);
								if(ec.util.isObj($dd)){
									var $span = $("#span_"+prodId+"_"+this.prodOfferInstId);
									var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferInstId);
									if(ec.util.isObj($span)){
										$span.removeClass("del");
									}
									if(ec.util.isObj($span_remove)){
										$span_remove.hide();
									}
									$dd.removeAttr("onclick");
									offer.isdel = "N";
								}
							}else{
								var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已开通里面查找
								if(offerSpec!=undefined){
									var $dd = $("#li_"+prodId+"_"+this.prodOfferId);
									if(ec.util.isObj($dd)){
										var $span = $("#span_"+prodId+"_"+this.prodOfferId);
										var $span_remove = $("#span_remove_"+prodId+"_"+this.prodOfferId);
										if(ec.util.isObj($span)){
											$span.removeClass("del");
										}
										if(ec.util.isObj($span_remove)){
											$span_remove.hide();
										}
										$dd.removeAttr("onclick");
										offerSpec.isdel = "N";
									}
								}else {
									if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
										//AttachOffer.addOpenList(prodId,this.prodOfferId);			
										AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
									}
								}
							}
						}
					});
				});
			}
		}
	};
	
	//根据省内返回的数据校验拼成html
	var _checkAttachOffer = function(prodId){
		var content="";
		if(offerChange.resultOffer==undefined){
			return content;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			var str = "";
			$.each(prodInfos,function(){
//				var prodId = this.accProdInstId;
//				//容错处理，省份接入产品实例id传错
//				var flag = true;
//				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
//					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
//						flag = false;
//						return false;
//					}
//				});
				if(prodId!=this.accProdInstId){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);//已开通功能产品里面查找
					var servSpec = CacheData.getServSpec(prodId,this.productId);//已选功能产品里面查找
					if(this.state=="DEL"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span class="del">'+serv.servSpecName+'</span>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+servSpec.servSpecName+'</span>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+this.productName+'</span>'
									+'</li>';
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span>'+serv.servSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+servSpec.servSpecName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+this.productName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
								}
						}
					}
				}
			});
			if(str==""){
				content="";
			}else{
				content="<div class='fs_choosed'>订购4G流量包，需订购和取消如下功能产品：<br><ul>"+str+"</ul></div><br>";
			}
		}
		
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			var str="";
			$.each(offers,function(){
				if(this.memberInfo==undefined){
					return true;
				}
				var flag = true;
				$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
					if(ec.util.isObj(this.accProdInstId)&&prodId == this.accProdInstId){
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已订购里面查找
				var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已选里面查找
				if(this.state=="DEL"){
					if(offer!=undefined){
						str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
								+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
								+'<span class="del">'+offer.offerSpecName+'</span>'
							+'</li>';
					}else{
						if(offerSpec!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span class="del">'+offerSpec.offerSpecName+'</span>'
								+'</li>';
						}else if(this.prodOfferName!=undefined && this.prodOfferName!=""){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span class="del">'+this.prodOfferName+'</span>'
								+'</li>';
						}
					}	
				}else if(this.state=="ADD"){
					if(offer!=undefined){
						str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
								+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
								+'<span>'+offer.offerSpecName+'</span>'
								+'<dd class="mustchoose"></dd>'
							+'</li>';
					}else{
						if(offerSpec!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span>'+offerSpec.offerSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else if(this.prodOfferName!=undefined && this.prodOfferName!=""){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span>'+this.prodOfferName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}
					}
				}
			});
			if(str!=""){
				content+="<div class='fs_choosed'>订购4G流量包，需开通和关闭如下可选包：<br><ul>"+str+"</ul></div>";
			}
		}
		
		return content;
	};
	return {
		init 					: 				_init,
		offerChangeView			:				_offerChangeView,
		changeOffer 			: _changeOffer,
		changeTab				: _changeTab,
		checkOrder				: _checkOrder,
		checkAttachOffer		: _checkAttachOffer,
		fillOfferChange			: _fillOfferChange,
		checkOfferProd			: _checkOfferProd,
		getChangeInfo			: _getChangeInfo,
		setChangeOfferSpec		: _setChangeOfferSpec
	};
})();
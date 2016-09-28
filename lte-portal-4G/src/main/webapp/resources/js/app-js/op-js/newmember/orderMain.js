
CommonUtils.regNamespace("order", "main");

order.main = (function(){ 
	
	/**
	 * 填单页面展示
	 * param = {
	 * 		boActionTypeCd : S1,
	 * 		boActionTypeName : "订购",
	 *		offerSpecId : 1234,//销售品规格ID
	 *		offerSpecName : "乐享3G-129套餐",//销售品名称,
	 *		feeType : 2100,付费类型
	 *		viceCardNum : 2,//副卡数量
	 *		offerNum : 3,//销售品数量
	 *		type : 1,//1购套餐2购终端3选靓号
	 *		terminalInfo : {
	 *			terminalName : "iphone",
	 *			terminalCode : "2341234124"
	 *		},
	 *		offerRoles : [
	 *			{
	 *				offerRoleId : 1234,
	 *				offerRoleName : "主卡",
	 *				memberRoleCd : "0",
	 *				roleObjs : [{
	 *					offerRoleId : 1,
	 *					objId : ,
	 *					objName : "CDMA",
	 *					objType : 2
	 *				}]
	 *			},
	 *			{
	 *				offerRoleId : 2345,
	 *				offerRoleName : "副卡",
	 *				memberRoleCd : "1"
	 *			}
	 *		]
	 *	}
	 * 
	 */
	var _c = function(param) {
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		if(!ec.util.isArray(OrderInfo.oldprodInstInfos)){
		    if(OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
				var is_same_feeType=false;//
				if(param.feeTypeMain=="2100" && (param.offerSpec.feeType=="2100"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1200" && (param.offerSpec.feeType=="1200"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1201" && (param.offerSpec.feeType=="1201"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}
				if(!is_same_feeType){
					$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
					return;
				}
			}
		}
		$.callServiceAsHtml(contextPath+"/token/app/order/mainsub2",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					$.unecOverlay();
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.unecOverlay();
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				
				
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					setTimeout(function () { 
						$.unecOverlay();
						offerChange.fillOfferChange(response,param);
				    }, 800);
				}else if(OrderInfo.actionFlag == 21){//副卡换套餐
					order.memberChange.fillmemberChange(response,param,2);
				}else {
					$.unecOverlay();
					_callBackBuildView(response,param);
				}
			}
		});
	};
	
	var _buildMainView = function(param) {
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		
		if(OrderInfo.newClothes=="true" || OrderInfo.oldMember=="true"){
			if(!ec.util.isArray(OrderInfo.oldprodInstInfos)){
			    if(OrderInfo.actionFlag == 6 ){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
					var is_same_feeType=false;//
					
					if(param.newofferSpec!=undefined && param.newofferSpec!=null){
						if(param.feeTypeMain=="2100" && (param.newofferSpec.feeType=="2100"||param.newofferSpec.feeType=="3100"||param.newofferSpec.feeType=="3101"||param.newofferSpec.feeType=="3103")){
							is_same_feeType=true;
						}else if(param.feeTypeMain=="1200" && (param.newofferSpec.feeType=="1200"||param.newofferSpec.feeType=="3100"||param.newofferSpec.feeType=="3102"||param.newofferSpec.feeType=="3103")){
							is_same_feeType=true;
						}else if(param.feeTypeMain=="1201" && (param.newofferSpec.feeType=="1201"||param.newofferSpec.feeType=="3101"||param.newofferSpec.feeType=="3102"||param.newofferSpec.feeType=="3103")){
							is_same_feeType=true;
						}
					}
				}
				
				if(!is_same_feeType){
					$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
					return;
				}
			}
		}
		
		$.callServiceAsHtml(contextPath+"/token/app/order/mainsub2",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					$.unecOverlay();
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.unecOverlay();
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				
				OrderInfo.actionFlag = param.actionFlag;
			
				$.unecOverlay();
				
				if(OrderInfo.actionFlag == 6){
					if(OrderInfo.newClothes=="true" || OrderInfo.oldMember=="true" || OrderInfo.delViceCard=="true"){
						_callBackBuildView(response,param);
					} 
				}else if(OrderInfo.actionFlag == 21){
					order.memberChange.fillmemberChange(response,param,2);
				}
			}
		});
	};
	
	//成员变更-->拆副卡变套餐
	var _buildMainViewSub = function(param) {
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		if(!ec.util.isArray(OrderInfo.oldprodInstInfos)){
		    if(OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
				var is_same_feeType=false;//
				if(param.feeTypeMain=="2100" && (param.offerSpec.feeType=="2100"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1200" && (param.offerSpec.feeType=="1200"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1201" && (param.offerSpec.feeType=="1201"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}
				if(!is_same_feeType){
					$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
					return;
				}
			}
		}
		$.callServiceAsHtml(contextPath+"/token/app/order/mainsub2",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					$.unecOverlay();
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.unecOverlay();
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				
				
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					setTimeout(function () { 
						$.unecOverlay();
						offerChange.fillOfferChange(response,param);
				    }, 800);
				}else if(OrderInfo.actionFlag == 21){//副卡换套餐
					order.memberChange.fillmemberChange(response,param);
				}else {
					$.unecOverlay();
					_callBackBuildView(response,param);
				}
			}
		});
	};
	
	
	var _reload = function(){
		//主副卡暂存单二次加载
		if(order.memberChange.reloadFlag=="N"){
			var custOrderList = order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
			var busiOrderSub=custOrderList[1];
			
			//发展人参数
			var objId;
			var accessNumber;
			var objName;
			var prodId;
			var offerTypeCd;
			
			//订购可选包和功能产品
			$.each(custOrderList,function(){
				//一些必备信息
				//可选包发展人
				objId=this.busiObj.objId;
				accessNumber=this.busiObj.accessNumber;
				objName=this.busiObj.objName;
				offerTypeCd=this.busiObj.offerTypeCd;
				
				var actionClassCd=this.boActionType.actionClassCd;
				var boActionTypeCd=this.boActionType.boActionTypeCd;
				
				//可选包
				if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="2"){
					if(this.data.ooRoles!=undefined){
						prodId=this.data.ooRoles[0].prodId;
					}
					
					var offermap = this;
					var offerflag = false;
					$.each(AttachOffer.openList,function(){
						if(this.prodId==offermap.data.ooRoles[0].prodId){
							$.each(this.specList,function(){
								if(this.offerSpecId==offermap.busiObj.objId){
									offerflag = true;
									return false;
								}
							});
						}
					});
							
					if(!offerflag){
						AttachOffer.addOpenList(offermap.data.ooRoles[0].prodId,offermap.busiObj.objId);
						//参数
						if(offermap.data.ooParams!=undefined){
							if(offermap.data.ooParams.length>0){
								var ooParams = offermap.data.ooParams[0];
								var spec = CacheData.getOfferSpec(ooParams.offerParamId,ooParams.offerSpecParamId);
								if(!!spec.offerSpecParams){
									for (var i = 0; i < spec.offerSpecParams.length; i++) {
										var param = spec.offerSpecParams[i];
										var itemSpec = CacheData.getSpecParam(ooParams.offerParamId,ooParams.offerSpecParamId,param.itemSpecId);
										if(itemSpec.itemSpecId == CONST.ITEM_SPEC.PROT_NUMBER){
											itemSpec.setValue = $("#select1").val();
										}else{
											itemSpec.setValue = ooParams.value;
										}
									}
								}
								
								if(spec.offerRoles!=undefined && spec.offerRoles.length>0){
									for (var i = 0; i < spec.offerRoles.length; i++) {
										var offerRole = spec.offerRoles[i];
										for (var j = 0; j < offerRole.roleObjs.length; j++) {
											var roleObj = offerRole.roleObjs[j];
											if(!!roleObj.prodSpecParams){
												for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
													var prodParam = roleObj.prodSpecParams[k];
													var prodItem = CacheData.getProdSpecParam(ooParams.offerParamId,ooParams.offerSpecParamId,prodParam.itemSpecId);
													prodItem.value = ooParams.value;
												}
											}
										}
									}
								}
								$("#can_"+ooParams.offerParamId+"_"+ooParams.offerSpecParamId).removeClass("canshu").addClass("canshu2");
								var attchSpec = CacheData.getOfferSpec(ooParams.offerParamId,ooParams.offerSpecParamId);
								attchSpec.isset = "Y";
							}
						}
						
						//终端串码
						if(offermap.data.bo2Coupons!=undefined){
							var bo2Coupons = offermap.data.bo2Coupons[0];
							$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
							var coupon = {
								couponUsageTypeCd : bo2Coupons.couponUsageTypeCd, //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
								inOutTypeId : bo2Coupons.inOutTypeId,  //出入库类型
								inOutReasonId : bo2Coupons.inOutReasonId, //出入库原因
								saleId : bo2Coupons.saleId, //销售类型
								couponId : bo2Coupons.couponId, //物品ID
								couponinfoStatusCd : bo2Coupons.couponinfoStatusCd, //物品处理状态
								chargeItemCd : bo2Coupons.chargeItemCd, //物品费用项类型
								couponNum : bo2Coupons.couponNum, //物品数量
								storeId : bo2Coupons.storeId, //仓库ID
								storeName : bo2Coupons.storeName, //仓库名称
								agentId : bo2Coupons.agentId, //供应商ID
								apCharge : bo2Coupons.apCharge, //物品价格,约定取值为营销资源的
								couponInstanceNumber : bo2Coupons.couponInstanceNumber, //物品实例编码
								ruleId : bo2Coupons.ruleId, //物品规则ID
								partyId : bo2Coupons.partyId, //客户ID
								prodId : bo2Coupons.prodId, //产品ID
								offerId : bo2Coupons.offerId, //销售品实例ID
								attachSepcId : bo2Coupons.attachSepcId,
								state : bo2Coupons.state, //动作
								relaSeq : bo2Coupons.relaSeq, //关联序列	
								num	: bo2Coupons.num //第几个串码输入框
							};
							OrderInfo.attach2Coupons.push(coupon);
						}
					}
				}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S2" && this.busiObj.offerTypeCd=="2"){
					if(this.data.ooRoles!=undefined){
						prodId=this.data.ooRoles[0].prodId;
					}
					
					//退订可选包
					var offermap = this;
					var objInstId = "";
					
					//拆副卡变套餐
					if(busiOrderSub.boActionType.actionClassCd=="1200" && busiOrderSub.boActionType.boActionTypeCd=="S1" && busiOrderSub.busiObj.offerTypeCd=="1"){
						objInstId=this.data.ooRoles[0].objInstId;
						AttachOffer.delOffer(objInstId,this.busiObj.instId,"reload");
					}
					else{
						$.each(order.memberChange.oldmembers.objInstId,function(){
							if(this.instId==offermap.busiObj.instId){
								objInstId = this.objInstId;
								return false;
							}
						});
						AttachOffer.delOffer(objInstId,this.busiObj.instId,"reload");
					}
				}else if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){//功能产品
					if(this.data.boServs[0].state=="ADD"){
						var offermap = this;
						var offerflag = false;
						$.each(AttachOffer.openServList,function(){
							if(this.prodId==offermap.data.boServOrders[0].servId){
								$.each(this.servSpecList,function(){
									if(this.servSpecId==offermap.data.boServOrders[0].servSpecId){
										offerflag = true;
										return false;
									}
								});
							}
						});
						
						if(!offerflag){
							var ifParams = "N";
							if(offermap.data.boServItems!=undefined){
								ifParams = "Y";
							}
							openServSpec(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,offermap.data.boServOrders[0].servSpecName,ifParams);
							if(ifParams=="Y"){
								var spec = CacheData.getServSpec(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId);
								if(!!spec.prodSpecParams){
									for (var i = 0; i < spec.prodSpecParams.length; i++) {
										var param = spec.prodSpecParams[i];
										var itemSpec = CacheData.getServSpecParam(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,param.itemSpecId);
										$.each(offermap.data.boServItems,function(){
											if(itemSpec.itemSpecId==this.itemSpecId){
												itemSpec.setValue = this.value;
											}
										});
									}
								}
								$("#can_"+this.busiObj.instId+"_"+offermap.data.boServOrders[0].servSpecId,param.itemSpecId).removeClass("canshu").addClass("canshu2");
								var attchSpec = CacheData.getServSpec(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,param.itemSpecId);
								attchSpec.isset = "Y";
							}
						}
					}else if(this.data.boServs[0].state=="DEL"){
						AttachOffer.closeServ(this.busiObj.instId,this.data.boServOrders[0].servId,"reload");
					}
				}else if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){
					//主副卡新装
					prodId=this.data.bo2Coupons[0].prodId;
				}
				
				//发展人
				if(this.data.busiOrderAttrs!=undefined){
					var dealerMap1 = {};
					var dealerMap2 = {};
					var dealerMap3 = {};
					$.each(this.data.busiOrderAttrs,function(){
						if(this.role=="40020005"){
							dealerMap1.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap1.staffid = this.value;
								dealerMap1.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap1.staffname = this.value;
							}
							dealerMap1.objInstId=objId;
							dealerMap1.accessNumber=accessNumber;
							dealerMap1.objName=objName;
							dealerMap1.prodId=prodId;
							dealerMap1.offerTypeCd=offerTypeCd;
							dealerMap1.actionClassCd=actionClassCd;
							dealerMap1.boActionTypeCd=boActionTypeCd;
						}else if(this.role=="40020006"){
							dealerMap2.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap2.staffid = this.value;
								dealerMap2.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap2.staffname = this.value;
							}
							dealerMap2.objInstId=objId;
							dealerMap2.accessNumber=accessNumber;
							dealerMap2.objName=objName;
							dealerMap2.prodId=prodId;
							dealerMap2.offerTypeCd=offerTypeCd;
							dealerMap2.actionClassCd=actionClassCd;
							dealerMap2.boActionTypeCd=boActionTypeCd;
						}else if(this.role=="40020007"){
							dealerMap3.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap3.staffid = this.value;
								dealerMap3.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap3.staffname = this.value;
							}
							dealerMap3.objInstId=objId;
							dealerMap3.accessNumber=accessNumber;
							dealerMap3.objName=objName;
							dealerMap3.prodId=prodId;
							dealerMap3.offerTypeCd=offerTypeCd;
							dealerMap3.actionClassCd=actionClassCd;
							dealerMap3.boActionTypeCd=boActionTypeCd;
						}										
					});
					
					if(ec.util.isObj(dealerMap1.role)){
						OrderInfo.reloadProdInfo.dealerlist.push(dealerMap1);
					}
					
					if(ec.util.isObj(dealerMap2.role)){
						OrderInfo.reloadProdInfo.dealerlist.push(dealerMap2);
					}
					
					if(ec.util.isObj(dealerMap3.role)){
						OrderInfo.reloadProdInfo.dealerlist.push(dealerMap3);
					}
				}
			});
			
			//退订可选包
			$.each(AttachOffer.openList,function(){
				var openmap = this;
				$.each(this.specList,function(){
					var offermap = this;
					var offerflag = false;
					$.each(custOrderList,function(){
						if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="2"){
							if(this.busiObj.objId==offermap.offerSpecId){
								offerflag = true;
								return false;
							}
						}
					});
					if(!offerflag){
						AttachOffer.delOfferSpec(openmap.prodId,this.offerSpecId,"reload");
					}
				});
			});
			
			//退订功能产品
			$.each(AttachOffer.openServList,function(){
				var openmap = this;
				$.each(this.servSpecList,function(){
					var offermap = this;
					var offerflag = false;
					$.each(custOrderList,function(){
						if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){
							if(offermap.servSpecId==this.data.boServOrders[0].servSpecId && openmap.prodId==this.busiObj.instId){
								offerflag = true;
								return false;
							}
						}
					});
					if(!offerflag){
						var $span = $("#li_"+openmap.prodId+"_"+this.servSpecId).find("span"); //定位删除的附属
						var spec = CacheData.getServSpec(openmap.prodId,this.servSpecId);
						if(spec == undefined){ //没有在已开通附属销售列表中
							return;
						}
						$span.addClass("del");
						spec.isdel = "Y";
						AttachOffer.showHideUim(1,openmap.prodId,this.servSpecId);   //显示或者隐藏
						var serv = CacheData.getServBySpecId(openmap.prodId,this.servSpecId);
						if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
							$span.addClass("del");
							serv.isdel = "Y";
						}
					}
				});
			});
			//补换卡
			$.each(custOrderList,function(){
				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="14"){
					var instId = this.busiObj.instId;
					$("#uim_check_btn_"+instId).attr("disabled",true);
					$("#uim_check_btn_"+instId).removeClass("purchase").addClass("disablepurchase");
					$("#uim_release_btn_"+instId).attr("disabled",false);
					$("#uim_release_btn_"+instId).removeClass("disablepurchase").addClass("purchase");
					$("#uim_txt_"+instId).attr("disabled",true);
					$.each(this.data.bo2Coupons,function(){
						if(this.state=="ADD"){
							$("#uim_txt_"+instId).val(this.terminalCode);
							var coupon = {
									couponUsageTypeCd : this.couponUsageTypeCd, //物品使用类型
									cardTypeFlag : this.cardTypeFlag,
									inOutTypeId : this.inOutTypeId,  //出入库类型
									inOutReasonId : this.inOutReasonId, //出入库原因
									saleId : this.saleId, //销售类型
									couponId : this.couponId, //物品ID
									couponinfoStatusCd : this.couponinfoStatusCd, //物品处理状态
									chargeItemCd : this.chargeItemCd, //物品费用项类型
									couponNum : this.couponNum, //物品数量
									storeId : this.storeId, //仓库ID
									storeName : this.storeName, //仓库名称
									agentId : this.agentId, //供应商ID
									apCharge : this.apCharge, //物品价格
									couponInstanceNumber : this.couponInstanceNumber, //物品实例编码
									terminalCode : this.terminalCode,//前台内部使用的UIM卡号
									ruleId : this.ruleId, //物品规则ID
									partyId : this.partyId, //客户ID
									prodId :  this.prodId, //产品ID
									offerId : this.offerId, //销售品实例ID
									state : this.state, //动作
									relaSeq : this.relaSeq //关联序列	
								};
							OrderInfo.clearProdUim(instId);
							OrderInfo.boProd2Tds.push(coupon);
						}
					});
				}
			});
		}
		
		var custOrderListSub=order.memberChange.rejson.orderList.custOrderList;
		
		var orderListInfo=order.memberChange.rejson.orderList.orderListInfo;
		
		//订单备注和模版等加载
		if(orderListInfo!=null && custOrderListSub!=null){
			var custOrderAttrs=orderListInfo.custOrderAttrs;
			var isTemplateOrder=orderListInfo.isTemplateOrder;
			var templateOrderName=orderListInfo.templateOrderName;
			$(custOrderAttrs).each(function(i,custOrderAttr) { 
				var itemSpecId=custOrderAttr.itemSpecId;

				if(itemSpecId=="111111118"){
					var value=custOrderAttr.value;
					
					if(value!=null && value!=""){
						$("#order_remark").html(value);
						OrderInfo.reloadProdInfo.orderMark =value;
					}
				}
			});
			
			//模版的操作
			if(isTemplateOrder=="Y"){
				$("#isTemplateOrder").click();//选中模版按钮
				
				SoOrder.showTemplateOrderName();//显示模版名称输入
				
				$("#templateOrderName").val(templateOrderName);//赋值模版名称
			}
		}
		
	};
	
	//展示回调函数
	var _callBackBuildView = function(response, param) {
        if(OrderInfo.newClothes=="true"  || OrderInfo.oldMember=="true"){
    		SoOrder.initFillPage(); //并且初始化订单数据
    		$("#order_prepare").hide();
    		$("#member_prepare").hide();
    		var content$ = $("#order").html(response.data).show();
    		$.refresh(content$);
    		_initTounch();
    		_initFeeType(param);//初始化付费方式
    		if(param.actionFlag==''){
    			OrderInfo.actionFlag = 1;
    		}
    		
    		if(OrderInfo.actionFlag==6){
    			if(param.oldofferSpec!=undefined && param.oldofferSpec!=null){
    				_loadAttachOffer(param);
    			}
    			if(param.newofferSpec!=undefined && param.newofferSpec!=null){
    				_loadOther(param);
    			}
    		}
    		
    		if(OrderInfo.actionFlag==6 ){
    			_initAcct(0);//初始化主卡帐户列表 
    			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){
    				for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
    					var prodInfo = OrderInfo.oldprodInstInfos[i];
    					order.dealer.initDealer(prodInfo);//初始化协销
    				}
    			}else{
    				order.dealer.initDealer();//初始化协销	
    			}
    		}
    		
    		order.phoneNumber.initOffer('-1');//主卡自动填充号码入口已选过的号码
    		$("#fillNextStep").off("click").on("click",function(){
    			//SoOrder.submitOrder();
    			if(!SoOrder.checkData()){ //校验通过
    				return false;
    			}
    			$("#order-content").hide();
    			$("#order-dealer").show();
    			order.dealer.initDealer();
    		});
    		
    		if (param.memberChange) {
    			$("#orderedprod").hide();
    			$("#order_prepare").hide();
    			$("#productDiv .pdcardcon:first").show();

    			$("#fillLastStep").off("click").on("click",function(){
    				order.prodModify.cancel();
    			});
    		}else{
    			$("#fillLastStep").off("click").on("click",function(){
    				_lastStep();
    			});
    		}
    		
    		if(order.memberChange.reloadFlag=="N"){
    			$("#content").show();
    		}
    		
    		//主副卡纳入新用户选号
    		if(order.memberChange.newSubPhoneNum!="" && order.memberChange.reloadFlag=="Y"){
    			var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
    			for(var n=0;n<newSubPhoneNumsize.length;n++){
    				$("#nbr_btn_-"+(n+1)).removeAttr("onclick");
    				$("#nbr_btn_-"+(n+1)).removeClass("selectBoxTwo");
    				$("#nbr_btn_-"+(n+1)).addClass("selectBoxTwoOn");
    				var param1 = {"phoneNum":newSubPhoneNumsize[n]};
    				var data = order.phoneNumber.queryPhoneNumber(param1);
    				if(data.datamap.baseInfo){
    					//$("#nbr_btn_-"+(n+1)).html(newSubPhoneNumsize[n]+"<u></u>");
    					$("#nbr_btn_-"+(n+1)).val(newSubPhoneNumsize[n]);
    					var boProdAns={
    							prodId : "-"+(n+1), //从填单页面头部div获取
    							accessNumber : data.datamap.baseInfo.phoneNumber, //接入号
    							anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
    							anId : data.datamap.baseInfo.phoneNumId, //接入号ID
    							pnLevelId : data.datamap.baseInfo.phoneLevelId,
    							anTypeCd : data.datamap.baseInfo.pnTypeId, //号码类型
    							state : "ADD", //动作	,新装默认ADD	
    							areaId : data.datamap.baseInfo.areaId,
    							areaCode:data.datamap.baseInfo.zoneNumber,
    							memberRoleCd:CONST.MEMBER_ROLE_CD.VICE_CARD,
    							preStore:data.datamap.baseInfo.prePrice,
    							minCharge:data.datamap.baseInfo.pnPrice
    						};
    					OrderInfo.boProdAns.push(boProdAns);
    					order.dealer.changeAccNbr("-"+(n+1),newSubPhoneNumsize[n]);//选号玩要刷新发展人管理里面的号码
    				}
    			}
    		}
    		
    		if(order.memberChange.reloadFlag=="Y"){
    			if(order.memberChange.mktResInstCode!=""&& order.memberChange.mktResInstCode!=null && order.memberChange.mktResInstCode!="null"){
    				var offerId = "-1";
    				offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
    				$.each(OrderInfo.oldprodInstInfos,function(){
    					if(this.prodInstId==prodId){
    						offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
    					}
    				});
    				var mktResInstCodesize = order.memberChange.mktResInstCode.split(",");
    				for(var u=0;u<mktResInstCodesize.length;u++){
    					if(mktResInstCodesize[u]!=""&&mktResInstCodesize[u]!=null&&mktResInstCodesize[u]!="null"){
    						var nbrAndUimCode = mktResInstCodesize[u].split("_");
    						var _accNbr = nbrAndUimCode[0];
    						var _uimCode = nbrAndUimCode[1];
    						var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
    						for(var n=0;n<newSubPhoneNumsize.length;n++){
    							if(newSubPhoneNumsize[n]==_accNbr){
    								$("#uim_txt_-"+(n+1)).attr("disabled",true);
    								var uimParam = {
    										"instCode":_uimCode
    								};
    								var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
    								if (response.code==0) {
    									if(response.data.mktResBaseInfo){
    										if(response.data.mktResBaseInfo.statusCd=="1102"){
    											$("#uim_check_btn_-"+(n+1)).attr("disabled",true);
    											$("#uim_check_btn_-"+(n+1)).removeClass("purchase").addClass("disablepurchase");
    											$("#uim_release_btn_-"+(n+1)).attr("disabled",false);
    											$("#uim_release_btn_-"+(n+1)).removeClass("disablepurchase").addClass("purchase");
    											$("#uim_txt_-"+(n+1)).val(_uimCode);
    											var coupon = {
    													couponUsageTypeCd : "3", //物品使用类型
    													inOutTypeId : "1",  //出入库类型
    													inOutReasonId : 0, //出入库原因
    													saleId : 1, //销售类型
    													couponId : response.data.mktResBaseInfo.mktResId, //物品ID
    													couponinfoStatusCd : "A", //物品处理状态
    													chargeItemCd : "3000", //物品费用项类型
    													couponNum : response.data.mktResBaseInfo.qty, //物品数量
    													storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
    													storeName : "1", //仓库名称
    													agentId : 1, //供应商ID
    													apCharge : 0, //物品价格
    													couponInstanceNumber : _uimCode, //物品实例编码
    													terminalCode :_uimCode,//前台内部使用的UIM卡号
    													ruleId : "", //物品规则ID
    													partyId : OrderInfo.cust.custId, //客户ID
    													prodId :  -(n+1), //产品ID
    													offerId : offerId, //销售品实例ID
    													state : "ADD", //动作
    													relaSeq : "" //关联序列	
    												};
    											OrderInfo.clearProdUim(-(n+1));
    											OrderInfo.boProd2Tds.push(coupon);
    										}else{
    											$.alert("提示","UIM卡不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
    										}
    									}else{
    										$.alert("提示","查询不到UIM信息");
    									}
    								}else if (response.code==-2){
    									$.alertM(response.data);
    								}else {
    									$.alert("提示","UIM信息查询接口出错,稍后重试");
    								}
    							}
    						}
    					}
    				}	
    			}
    		}
    		
    		//主副卡暂存单二次加载
    		if(order.memberChange.reloadFlag=="N"){
    			$("#dealerTbody").empty();
    			var custOrderList = order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
    			$.each(custOrderList,function(){
    				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="3"){//拆副卡
    					
    				}else if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){//纳入新成员
    					//选号
    					$("#nbr_btn_"+this.data.boProdAns[0].prodId).removeClass("selectBoxTwo");
    					$("#nbr_btn_"+this.data.boProdAns[0].prodId).addClass("selectBoxTwoOn");
    					//$("#nbr_btn_"+this.data.boProdAns[0].prodId).html(this.busiObj.accessNumber+"<u></u>");
    					$("#nbr_btn_"+this.data.boProdAns[0].prodId).val(this.busiObj.accessNumber);
    					var boProdAns={
    							prodId : this.data.boProdAns[0].prodId, //从填单页面头部div获取
    							accessNumber : this.data.boProdAns[0].accessNumber, //接入号
    							anChooseTypeCd : this.data.boProdAns[0].anChooseTypeCd, //接入号选择方式,自动生成或手工配号，默认传2
    							anId : this.data.boProdAns[0].anId, //接入号ID
    							pnLevelId:this.data.boProdAns[0].pnLevelId,
    							anTypeCd : this.data.boProdAns[0].anTypeCd, //号码类型
    							state : this.data.boProdAns[0].state, //动作	,新装默认ADD	
    							areaId:this.data.boProdAns[0].areaId,
    							areaCode:this.data.boProdAns[0].areaCode,
    							memberRoleCd:this.data.boProdAns[0].memberRoleCd,
    							preStore:this.data.boProdAns[0].preStore,
    							minCharge:this.data.boProdAns[0].minCharge
    						};
    					OrderInfo.boProdAns.push(boProdAns);
    					order.dealer.changeAccNbr(this.data.boProdAns[0].prodId,this.data.boProdAns[0].accessNumber);//选号玩要刷新发展人管理里面的号码
    					//uim卡校验
    					$("#uim_check_btn_"+this.data.bo2Coupons[0].prodId).attr("disabled",true);
    					$("#uim_check_btn_"+this.data.bo2Coupons[0].prodId).removeClass("purchase").addClass("disablepurchase");
    					$("#uim_release_btn_"+this.data.bo2Coupons[0].prodId).attr("disabled",false);
    					$("#uim_release_btn_"+this.data.bo2Coupons[0].prodId).removeClass("disablepurchase").addClass("purchase");
    					$("#uim_txt_"+this.data.bo2Coupons[0].prodId).attr("disabled",true);
    					$("#uim_txt_"+this.data.bo2Coupons[0].prodId).val(this.data.bo2Coupons[0].terminalCode);
    					var coupon = {
    							couponUsageTypeCd : this.data.bo2Coupons[0].couponUsageTypeCd, //物品使用类型
    							inOutTypeId : this.data.bo2Coupons[0].inOutTypeId,  //出入库类型
    							inOutReasonId : this.data.bo2Coupons[0].inOutReasonId, //出入库原因
    							saleId : this.data.bo2Coupons[0].saleId, //销售类型
    							couponId : this.data.bo2Coupons[0].couponId, //物品ID
    							couponinfoStatusCd : this.data.bo2Coupons[0].couponinfoStatusCd, //物品处理状态
    							chargeItemCd : this.data.bo2Coupons[0].chargeItemCd, //物品费用项类型
    							couponNum : this.data.bo2Coupons[0].couponNum, //物品数量
    							storeId : this.data.bo2Coupons[0].storeId, //仓库ID
    							storeName : this.data.bo2Coupons[0].storeName, //仓库名称
    							agentId : this.data.bo2Coupons[0].agentId, //供应商ID
    							apCharge : this.data.bo2Coupons[0].apCharge, //物品价格
    							couponInstanceNumber : this.data.bo2Coupons[0].couponInstanceNumber, //物品实例编码
    							terminalCode : this.data.bo2Coupons[0].terminalCode,//前台内部使用的UIM卡号
    							ruleId : this.data.bo2Coupons[0].ruleId, //物品规则ID
    							partyId : this.data.bo2Coupons[0].partyId, //客户ID
    							prodId :  this.data.bo2Coupons[0].prodId, //产品ID
    							offerId : this.data.bo2Coupons[0].offerId, //销售品实例ID
    							state : this.data.bo2Coupons[0].state, //动作
    							relaSeq : this.data.bo2Coupons[0].relaSeq //关联序列	
    						};
    					OrderInfo.clearProdUim(this.busiObj.instId);
    					OrderInfo.boProd2Tds.push(coupon);
    					//产品密码
    					$("#pwd_"+this.busiObj.instId).val(this.data.boProdPasswords[0].pwd);
    					//封装付费方式
    					$("select[name='pay_type_-1'] option[value='"+this.data.boProdFeeTypes[0].feeType+"']").attr("selected","selected");
    				}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S2"){//纳入老成员
    					
    				}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="1"){//保留选择新套擦
    					
    				}
    				
    				//帐户信息
    				if(this.data.boAccountRelas!=undefined){
    					var acctId = this.data.boAccountRelas[0].acctId;
    					$("#acctSelect").find("option[value="+acctId+"]").attr("selected","selected");
    				}
    			});
    			var custOrderAttrs = order.memberChange.rejson.orderList.orderListInfo.custOrderAttrs;
    			$.each(custOrderAttrs,function(){
    				//订单备注
    				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.REMARK){
    					$('#order_remark').val(this.value);
    				}
    				//经办人
    				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.orderAttrName){
    					$('#orderAttrName').val(this.value);
    				}
    				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.orderAttrPhoneNbr){
    					$('#orderAttrPhoneNbr').val(this.value);
    				}
    				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.orderIdentidiesTypeCd){
    					$("#orderIdentidiesTypeCd").find("option[value="+this.value+"]").attr("selected","selected");
    				}
    				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.orderAttrIdCard){
    					$('#orderAttrIdCard').val(this.value);
    				}
    				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.orderAttrAddr){
    					$('#orderAttrAddr').val(this.value);
    				}
    				//省内订单属性
//    				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.PROV_ISALE){
//    					$('#orderProvAttrIsale').val(this.value);
//    				}
    			});
    		}
    		$("#fillNextStepSub").off("click").on("click",function(){
    			SoOrder.submitOrder();
			
			});
          }
		
		if(OrderInfo.delViceCard=="true"){
			if(OrderInfo.oldMember=="true" || OrderInfo.newClothes=="true"){
				$("#member_prepare").hide();
				if(OrderInfo.delViceCard=="true"){
					$("#offerspecContent").show();
				}
			}else{
				$("#member_prepare").show();
				//$("#offerspecContent").show();
				SoOrder.initFillPage(); //并且初始化订单数据
				$("#member_prepare").html(response.data);
			}
		
			$("#fillNextStep").off("click").on("click",function(){
				OrderInfo.viceParam = param;
				if(!SoOrder.checkData()){ //校验通过
					return false;
				}
				$("#order-content").hide();
				$("#order-dealer").show();
				order.dealer.initDealer();
			}); 
			
			$("#fillNextStepSub").off("click").on("click",function(){
				_removeAndAdd(param);
			});
			var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
			//遍历主销售品构成
			var uimDivShow=false;//是否已经展示了
			
			$.each(param.viceParam,function(){
				var prodId = this.objInstId;
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
				var res = query.offer.queryChangeAttachOffer(param,"delViceCard",2);
				$("#attach_"+prodId).html(res);	
				//如果objId，objType，objType不为空才可以查询默认必须
				if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
					param.queryType = "1,2";
					param.objId = this.objId;
					param.objType = this.objType;
					param.memberRoleCd = "400";
					param.offerSpecId=this.offerSpecId;
					//默认必须可选包
					var data = query.offer.queryDefMustOfferSpec(param,"delViceCard","sign");
					CacheData.parseOffer(data,prodId);
					//默认必须功能产品
					var data = query.offer.queryServSpec(param,"delViceCard","sign");
					CacheData.parseServ(data,prodId,"delViceCard");
				}
				AttachOffer.showMainMemberRoleProd(prodId); //显示新套餐构成
				AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
				
				if(AttachOffer.isChangeUim(prodId,"delViceCard")){ //需要补换卡
					if(!uimDivShow){
						//自动填入uim卡 
						$("#uimDiv_"+prodId).show();
						var member = CacheData.getOfferMember(prodId);
						if(member!=null && member!=undefined && member!="" && member!="null"){
						if(OrderInfo.mktResInstCode!=null && OrderInfo.mktResInstCode!="" && OrderInfo.mktResInstCode!=undefined && OrderInfo.mktResInstCode!="null"){
							var mktResInstCodesize = OrderInfo.mktResInstCode.split(",");
							for(var u=0;u<mktResInstCodesize.length;u++){
								if(mktResInstCodesize[u]!=""&&mktResInstCodesize[u]!=null&&mktResInstCodesize[u]!="null"){
									var nbrAndUimCode = mktResInstCodesize[u].split("_");
									var _accNbr = nbrAndUimCode[0];
									var _uimCode = nbrAndUimCode[1];
									//var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
								
										if(member==_accNbr){
											$("#uim_txt_"+prodId).attr("disabled",true);
											var uimParam = {
													"instCode":_uimCode
											};
											var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
											if (response.code==0) {
												if(response.data.mktResBaseInfo){
													if(response.data.mktResBaseInfo.statusCd=="1102"){
														$("#uim_check_btn_"+prodId).attr("disabled",true);
														$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
														$("#uim_release_btn_"+prodId).attr("disabled",false);
														$("#uim_release_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
														$("#uim_txt_"+prodId).val(_uimCode);
														var coupon = {
																couponUsageTypeCd : "3", //物品使用类型
																inOutTypeId : "1",  //出入库类型
																inOutReasonId : 0, //出入库原因
																saleId : 1, //销售类型
																couponId : response.data.mktResBaseInfo.mktResId, //物品ID
																couponinfoStatusCd : "A", //物品处理状态
																chargeItemCd : "3000", //物品费用项类型
																couponNum : response.data.mktResBaseInfo.qty, //物品数量
																storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
																storeName : "1", //仓库名称
																agentId : 1, //供应商ID
																apCharge : 0, //物品价格
																couponInstanceNumber : _uimCode, //物品实例编码
																terminalCode :_uimCode,//前台内部使用的UIM卡号
																ruleId : "", //物品规则ID
																partyId : OrderInfo.cust.custId, //客户ID
																prodId :  -(n+1), //产品ID
																offerId : offerId, //销售品实例ID
																state : "ADD", //动作
																relaSeq : "" //关联序列	
															};
														OrderInfo.clearProdUim(prodId);
														OrderInfo.boProd2Tds.push(coupon);
													}else{
														$.alert("提示","UIM卡不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
													}
												}else{
													$.alert("提示","查询不到UIM信息");
												}
											}else if (response.code==-2){
												$.alertM(response.data);
											}else {
												$.alert("提示","UIM信息查询接口出错,稍后重试");
											}
										}
									
								}
							}
						}
					  }
					}else{
						$("#uimDiv_"+prodId).hide();
					}
				}
				uimDivShow=true;
			});

			order.dealer.initDealer(2); //初始化发展人
		//	offerChange.initOrderProvAttr();//初始化省内订单属性
			if(OrderInfo.newClothes=="true" || OrderInfo.oldMember=="true"){
				$("#member_prepare").hide();
			}else{
				$("#member_prepare").show();
			}
		}
		
		$("#content").show();
		
		//二次加载 
		if(OrderInfo.provinceInfo.reloadFlag=="N"){
			order.main.reload();
		}	
	};
	//主卡不变副卡新装套餐
	var _removeAndAdd=function(date){
		var viceparam = [];
		var ooRoles =[];
		var params =[];
		viceparam=date.viceParam;
		ooRoles=date.ooRoles;
		params = {viceParam:viceparam,ooRoles:ooRoles,remark:$("#order_remark").val()};
		SoOrder.submitOrder(params);
	};
	//初始化帐户展示
	var _initAcct = function(flag) {

			//主副卡成员变更业务不能更改帐户，只展示主卡帐户
			if(OrderInfo.actionFlag==6){
				var param = {};
				if(flag==1){
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						param.prodId=OrderInfo.oldprodInstInfos[i].prodInstId;
						param.acctNbr=OrderInfo.oldprodInstInfos[i].accNbr;
						param.areaId=OrderInfo.oldprodInstInfos[i].areaId;
						var jr = $.callServiceAsJson(contextPath+"/apporder/queryProdAcctInfo", param);
						if(jr.code==-2){
							$.alertM(jr.data);
							return;
						}
						var prodAcctInfos = jr.data;
						prodAcctInfos[0].accessNumber = OrderInfo.oldprodInstInfos.accNbr;
						OrderInfo.oldprodAcctInfos.push({"prodAcctInfos":prodAcctInfos});
					}
				}else{
					param.prodId=order.prodModify.choosedProdInfo.prodInstId;
					param.acctNbr=order.prodModify.choosedProdInfo.accNbr;
					param.areaId=order.prodModify.choosedProdInfo.areaId;
					var jr = $.callServiceAsJson(contextPath+"/app/order/queryProdAcctInfo", param);
					if(jr.code==-2){
						$.alertM(jr.data);
						return;
					}
					var prodAcctInfos = jr.data;
					//$("#accountDiv").find("label:eq(0)").text("主卡帐户：");
					$.each(prodAcctInfos, function(i, prodAcctInfo){
						OrderInfo.acctId = prodAcctInfo.acctId;
						OrderInfo.acctCd = prodAcctInfo.acctCd;
//						$("<option>").text(prodAcctInfo.name+" : "+prodAcctInfo.acctCd).attr("value",prodAcctInfo.acctId)
//						.attr("acctcd",prodAcctInfo.acctCd).appendTo($("#acctSelect"));					
					});
				//	$("#accountDiv").find("a:eq(0)").hide();
				}
			}
	};
	
	var _initTounch = function(){
		touch.on('.item', 'touchstart', function(ev){
//			ev.preventDefault();
		});
		$(".item").each(function(i){
			touch.on(this, 'swiperight', function(ev){
				$("#carousel-example-generic").carousel('prev');
			});
			
			touch.on(this, 'swipeleft', function(ev){
				$("#carousel-example-generic").carousel('next');
			});
		});

	};
	
	var _loadAttachOffer = function(param) {
		for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
			var prodInfo = OrderInfo.oldprodInstInfos[i]; //获取老用户产品信息
//			var uimDivShow=false;//是否已经展示了
			//var prodId = prodInfo.prodInstId;
			$.each(OrderInfo.oldoffer,function(){
				if(this.accNbr == prodInfo.accNbr){
					var oldoffer = this;
					$.each(oldoffer.offerMemberInfos,function(){
						var member = this;
						var prodId = this.objInstId;
						var param = {
								areaId : OrderInfo.getProdAreaId(prodId),
								channelId : OrderInfo.staff.channelId,
								staffId : OrderInfo.staff.staffId,
							    prodId : prodId,
							    prodSpecId : member.objId,
							    offerSpecId : prodInfo.mainProdOfferInstInfos[0].prodOfferId,
							    offerRoleId : "",
							    acctNbr : member.accessNumber,
							    partyId:prodInfo.custId,
							    distributorId:OrderInfo.staff.distributorId,
							    mainOfferSpecId:prodInfo.mainProdOfferInstInfos[0].prodOfferId,
							    soNbr:OrderInfo.order.soNbr
							};
						if(ec.util.isObj(prodInfo.prodBigClass)){
							param.prodBigClass = prodInfo.prodBigClass;
						}
						$.each(OrderInfo.oldofferSpec,function(){
							if(this.accNbr==prodInfo.accNbr){
								$.each(this.offerSpec.offerRoles,function(){
									if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
										param.offerRoleId = this.offerRoleId;
									}
								});
							}
						});
						var res = query.offer.queryChangeAttachOffer(param,"oldmember",1);
						$("#attach_"+prodId).html(res);	
						//如果objId，objType，objType不为空才可以查询默认必须
						if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
							param.queryType = "1,2";
							param.objId = member.objId;
							param.objType = member.objType;
							param.memberRoleCd = "401";
							//默认必须可选包
							var data = query.offer.queryDefMustOfferSpec(param,"oldmember",1);
							CacheData.parseOffer(data);
							//默认必须功能产品
							var data = query.offer.queryServSpec(param,"oldmember",1);
							CacheData.parseServ(data);
						}
						if(ec.util.isArray(OrderInfo.oldofferSpec)){ //主套餐下的成员判断
//								var member = CacheData.getOfferMember(prodId);
							$.each(OrderInfo.oldofferSpec,function(){
								if(this.accNbr == prodInfo.accNbr){
									var offerRoles = this.offerSpec.offerRoles;
									$.each(offerRoles,function(){
										if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
											var offerRole = this;
											$.each(this.roleObjs,function(){
												if(this.objType==CONST.OBJ_TYPE.SERV){
													var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
													if(serv!=undefined){ //不在已经开跟已经选里面
														var $oldLi = $('#li_'+prodId+'_'+serv.servId);
														if(this.minQty==1){
														//	$oldLi.append('<dd class="mustchoose"></dd>');
														}
														//$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
													}
												}
											});
											return false;
										}
									});
								}
							});
						}
						AttachOffer.changeLabel(prodId,prodInfo.productId,"");
					});
				}
			});
			var oldoffer = {};
			if(ec.util.isArray(OrderInfo.oldoffer)){ //主套餐下的成员判断
//				var member = CacheData.getOfferMember(prodId);
			    $.each(OrderInfo.oldoffer,function(){
			    	if(this.accNbr == prodInfo.accNbr){
			    		oldoffer = this;
			    	}
			    });
			}
			//老用户加入副卡需要预校验,主卡是4G，加入的老用户为3G
			if(order.prodModify.choosedProdInfo.is3G== "N" && prodInfo.mainProdOfferInstInfos[0].is3G =="Y"){
				
				if(!order.memberChange.checkOrder(prodInfo,oldoffer)){ //省内校验单
					return;
				}
				
				order.memberChange.checkOfferProd(oldoffer);
			}
			
		}
	};
	
	//动态添加产品属性、附属销售品等
	var _loadOther = function(param) {
		if(OrderInfo.actionFlag==6 && param.newofferSpec!=undefined){
			$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
				var offerRole = this;
				for ( var i = 0; i < this.prodInsts.length; i++) {
					var prodInst = this.prodInsts[i];
					var param = {   
						offerSpecId : OrderInfo.offerSpec.offerSpecId,
						prodSpecId : prodInst.objId,
						offerRoleId: prodInst.offerRoleId,
						prodId : prodInst.prodInstId,
						queryType : "1,2",
						objType: prodInst.objType,
						objId: prodInst.objId,
						memberRoleCd : prodInst.memberRoleCd
					};
					
					//主副卡变更新增副卡-副卡加载已订购可选包等[W]
					_queryAttachOfferSpec(param,"newClothes",1);  //加载附属销售品
					
					var obj = {
						div_id : "item_order_"+prodInst.prodInstId,
						prodId : prodInst.prodInstId,
						offerSpecId : OrderInfo.offerSpec.offerSpecId,
						compProdSpecId : "",
						prodSpecId : prodInst.objId,
						roleCd : offerRole.roleCd,
						offerRoleId : offerRole.offerRoleId,
						partyId : OrderInfo.cust.custId
					};
					order.main.spec_parm(obj); //加载产品属性
				}			
			});
		}else{
			$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
				var offerRole = this;
				for ( var i = 0; i < this.prodInsts.length; i++) {
					var prodInst = this.prodInsts[i];
					var param = {   
						offerSpecId : OrderInfo.offerSpec.offerSpecId,
						prodSpecId : prodInst.objId,
						offerRoleId: prodInst.offerRoleId,
						prodId : prodInst.prodInstId,
						queryType : "1,2",
						objType: prodInst.objType,
						objId: prodInst.objId,
						memberRoleCd : prodInst.memberRoleCd
					};
					_queryAttachOfferSpec(param,"newClothes",1);   //加载附属销售品
					var obj = {
						div_id : "item_order_"+prodInst.prodInstId,
						prodId : prodInst.prodInstId,
						offerSpecId : OrderInfo.offerSpec.offerSpecId,
						compProdSpecId : "",
						prodSpecId : prodInst.objId,
						roleCd : offerRole.roleCd,
						offerRoleId : offerRole.offerRoleId,
						partyId : OrderInfo.cust.custId
					};
					order.main.spec_parm(obj); //加载产品属性
				}			
			});
		}

	};
	//可订购的附属查询 
	var _queryAttachOfferSpec = function(param,action,sign) {
		query.offer.addParam(param,action,sign);  //添加基本参数
		var url = contextPath+"/app/offer/queryAttachSpec";
		//if(typeof(callBackFun)=="function"){
		var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)}, {"before":function(){
			$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		}});
		if (response.code==0) {
			if(response.data){
				$("#attach_"+param.prodId).html(response.data);
				AttachOffer.showMainRoleProd(param.prodId); //通过主套餐成员显示角字
				
				//根据已选功能产品查询带出的可选包[W]
				var servSpecIds = [];
				if(AttachOffer.openServList!=null && AttachOffer.openServList!=undefined){
					$.each(AttachOffer.openServList,function(){
						if(this.prodId == param.prodId){
							var servSpecList = this.servSpecList;
							if(servSpecList!=null && servSpecList!=undefined){
								$.each(servSpecList,function(){
									if(this.servSpecId!=null&&this.servSpecId!=undefined){
										servSpecIds.push(this.servSpecId);
									}
								});
							}
						}
					});					
				}
				
				if(servSpecIds.length>0){
					param.servSpecIds = servSpecIds;
					var queryData = query.offer.queryServSpecPost(param);
					if(queryData!=null && queryData.resultCode==0){
						if(queryData.result.offerList!=null && queryData.result.offerList!=undefined){
							$.each(queryData.result.offerList,function(){
								AttachOffer.addOpenList(param.prodId,this.offerSpecId); 
							});
						}					
					}	
				}
				//结束[W]
				
				AttachOffer.changeLabel(param.prodId,param.prodSpecId,"100"); //初始化第一个标签附属
				if(param.prodId==-1 && OrderInfo.actionFlag==14){ //合约计划特殊处理
					AttachOffer.addOpenList(param.prodId,mktRes.terminal.offerSpecId);
				}
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","附属销售品查询失败,稍后重试");
			return;
		}
	};
	

	var _paymethodChange = function(obj){
		$(".paymethodChange").each(function(){
			if($(this).attr("id")!=$(obj).attr("id")){
				$(this).val($(obj).val());
			}
		});
	};
	
	var _templateTypeCheck = function(obj){
		if($("#isTemplateOrder").attr("checked")=="checked"){//如果选择批量模板
			var paytype=$('select[name="pay_type_-1"]').val(); 
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paytype!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paytype!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
		
		}
		return true ;
	};
	
	var _initFeeType = function(param) {
		if (param.feeType != undefined && param.feeType && param.feeType != CONST.PAY_TYPE.NOLIMIT_PAY) {
			$("input[name^=pay_type_][value="+param.feeType+"]").attr("checked","checked");
			$("input[name^=pay_type_]").attr("disabled","disabled");
		}
	};
	
	
	//展示帐户
	var _showAcct = function(accountInfos){
		$("#acctListTab tbody").empty();
		$.each(accountInfos,function(i, accountInfo){
			var tr = $("<tr></tr>").appendTo($("#acctListTab tbody"));
			if(accountInfo.name){
				$("<td class='teleNum'>"+accountInfo.name+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.acctId){
				$("<td acctId='"+accountInfo.acctId+"'>"+accountInfo.accountNumber+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.owner){
				$("<td>"+accountInfo.owner+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.accessNumber){
				$("<td>"+accountInfo.accessNumber+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			tr.click(function(){
				var found = false;
				var custAccts = $("#acctSelect").find("option");
				$.each(custAccts, function(i, custAcct){
					if(custAcct.value==accountInfo.acctId){
						$("#acctSelect").find("option[value="+custAcct.value+"]").attr("selected","selected");
						found = true;
						return false;
					}					
				});					
				$(this).dispatchJEvent("chooseAcct",accountInfo);				
				easyDialog.close();
				$("#defineNewAcct").hide();
			});
		});
	};
	
	
	function _spec_parm(param){
		$.callServiceAsHtmlGet(contextPath + "/app/order/orderSpecParam",param, {
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response && (response.data == 0||response.data == "0")){
					return;
				}
				$("#"+param.div_id).append(response.data);
//				$("div[name='spec_params']").each(function(){
					$.refresh($(this));
//				});
				//判断使用人产品属性是否必填
				$('#choose_user_btn_'+param.prodId).parent().parent().parent().hide();
				//只有在新装的时候才可编辑“是否信控”产品属性
				var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId);
				if(xkDom.length == 1){
					var exist = false; 
					if(OrderInfo.prodInstAttrs && OrderInfo.prodInstAttrs.length){
						$.each(OrderInfo.prodInstAttrs, function(){
							if(this.itemSpecId==CONST.PROD_ATTR.IS_XINKONG){
								$(xkDom).val(this.value);
								exist = true;
							}					
						});
					}
					if(exist){
						$(xkDom).attr("disabled","disabled");
					} else {
//						$.alert("提示","查询主卡产品实例属性未获取到“是否信控”属性值");
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value='']").remove(); //去除“请选择”空值选项
						$(xkDom).val("20"); //默认为“是”
						if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
							$(xkDom).attr("disabled","disabled");
						}
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
	}
	
	//产品属性 提交
	function _spec_parm_change_save(){
		//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		if(!_check_parm("order_spc_update")){
			return ;
		}
		var boProdItems = new Array();
		//input
		var chang_row = 0;
		$("#order_spc_update input").each(function(){
			//订单属性 是否模板 由公共类自动添加，这里不加入属性
			if($(this).attr("id")!="order_remark"&&$(this).attr("id")!="isTemplateOrder"&&$(this).attr("id")!="templateOrderName"&&$(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		//select
		$("#order_spc_update select").each(function(){
			if($(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		var busiOrderAttrs ;
		if($("#order_remark").val()){
			busiOrderAttrs = [{
				atomActionId : OrderInfo.SEQ.atomActionSeq--,
				itemSpecId : CONST.ITEM_SPEC_ID_CODE.busiOrderAttrs ,//"111111122",//备注的ID，待修改
				value : $("#order_remark").val()
			}];
			chang_row++;
		}
		if(chang_row<1){
			$.alert("提示","您未修改订单属性");
			return ;
		}
		/*
		if(!SoOrder.builder()){//加载实例缓存，并且初始化订单数据
			return;
		} 
		*/
		//配置参数：来调用产品属性修改的ser
		//OrderInfo.boProdItems = boProdItems ;
		var data = {boProdItems:boProdItems} ;
		if(busiOrderAttrs){
			data.busiOrderAttrs = busiOrderAttrs ;
		}
		OrderInfo.actionFlag=33;//改产品属性
		SoOrder.submitOrder(data);

	}
	//开通功能产品
	function openServSpec(prodId,servSpecId,specName,ifParams){
		var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
		if(servSpec==undefined){   //在可订购功能产品里面 
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : specName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			if(servSpecId==CONST.YZFservSpecId){//翼支付助手根据付费类型改变默认值
				var feeType = $("select[name='pay_type_-1']").val();
				if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
				if(feeType == CONST.PAY_TYPE.AFTER_PAY){
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {
						var prodSpecParam = newSpec.prodSpecParams[j];
						prodSpecParam.setValue = "";
					}																			
				}else{
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {							
						var prodSpecParam = newSpec.prodSpecParams[j];
						if (prodSpecParam.value!="") {
							prodSpecParam.setValue = prodSpecParam.value;
						} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
							//默认值为空则取第一个
							prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
				}
			  }
			}
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			servSpec = newSpec;
		}
		var servSpecId = servSpec.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		AttachOffer.addOpenServList(prodId,servSpecId,servSpec.servSpecName,servSpec.ifParams);
//		AttachOffer.checkServExcludeDepend(prodId,servSpec);
	};
	
	//产品属性-校验所有属性
	function _check_parm(ul_id){
		var f = true ;
		$("#"+ul_id).find("input").each(function(){
			if(f){
				f = _check_parm_self(this);
			}
		});
		return f;
	}
	//产品属性-校验单个属性
	function _check_parm_self(obj){
		//alert("---"+$(obj).val());
		if($(obj).attr("check_option")=="N"){
			if($(obj).val()==null||$(obj).val()==""){
				$.alert("提示",$(obj).attr("check_name")+" 尚未填写");
				return false;
			}
		}
		
		if($(obj).attr("check_type")=="check"){
			var len = $(obj).attr("check_len");
			//alert($(this).val()+"--"+len);
			if(len>0){
				//alert($(this).val().length+"---"+len);
				if($(obj).val().length>len){
					$.alert("提示",$(obj).attr("check_name")+" 长度过长(<"+len+")");
					return false;
				}
			}
			var mask = $(obj).attr("check_mask");
			if(mask!=null&&$(obj).val()!=null&&$(obj).val()!=""){
				//alert($(obj).val()+"---"+mask);
				//mask= "^[A-Za-z]+$";
				var pattern = new RegExp(mask) ;
				if(!pattern.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 校验失败：" + $(obj).attr("check_mess"));
					return false;
				}
			}
			var v_len = $(obj).val().length;
			if(v_len>0&&$(obj).attr("dataType")=="3"){//整数
				if(!/^[0-9]+$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非数字，请修改");
					return false;
				}
			}else if(v_len>0&&$(obj).attr("dataType")=="5"){//小数
				if(!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非小数，请修改");
					return false;
				}
			}else if(v_len>0&&($(obj).attr("dataType")=="4"||$(obj).attr("dataType")=="16")){//日期
				/*
				if(/Invalid|NaN/.test(new Date($(obj).val().substring(0,10)))){
					$.alert("提示",$(obj).attr("check_name")+ " 非日期，请修改");
					return false;
				}
				*/
			}
		}
		return true ;
	}
	//滚动分页回调 ok
	var _queryScroll = function(scrollObj){
		if(scrollObj && scrollObj.page){
			_queryStaffPage(scrollObj.page,scrollObj.scroll);
		}
	};
	//协销人-查询-入口 ok
	var _queryStaff = function(dealerId,objInstId){
		$.callServiceAsHtmlGet(contextPath + "/pad/staffMgr/getStaffListPrepare",{"dealerId":dealerId,"objInstId":objInstId},{
			"done" : function(response){
				//统一弹出框
				var popup = $.popup("#div_staff_dialog",response.data,{
					cache:true,
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){}
				});
				$("#btn_staff_select_chk").off("tap").on("tap",function(){_setStaff(objInstId);});
				$("#a_order_staff_qry").off("tap").on("tap",function(){_queryStaffPage(1);});
			}
		});
	};
	//协销人-查询 -列表 ok
	var _queryStaffPage = function(qryPage,scroller){
		var param = {
				"dealerId" :$("#dealer_id").val(),
				"qrySalesCode":$("#qrySalesCode").val(),
				"staffName":$("#qryStaffName").val(),
				"staffCode":$("#qryStaffCode").val(),
				"staffCode2":$("#qryStaffCode").val(),
				"salesCode":$("#qrySalesCode").val(),
				"pageIndex":qryPage,
				"objInstId":$("#objInstId").val(),
				"pageSize" :10
			};
		
		$.callServiceAsHtml(contextPath + "/pad/staffMgr/getStaffList",param,{
			"before":function(){
				if(qryPage==1)$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				if(qryPage==1)$.unecOverlay();
			},
			"done" : function(response){
				var _data = "";
				if(!response){
					_data='';
				}else{
					_data = response.data;
				}
				var content$ = $("#div_order_dealer_list");
				//首页时直接覆盖,其它页追加
				if(qryPage==1)content$.html(_data);
				else content$.find("tbody").append(_data);
				
				content$.find("tr").each(function(){
					$(this).off("tap").on("tap",function(event){
						$(this).addClass("userorderlistlibg").siblings().removeClass("userorderlistlibg");
					});
				});
				
				//回调刷新iscroll控制数据,控件要求
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
			}
		});	

	};
	//选中协销人 ok
	var _setStaff = function(objInstId){
		var $staff = $("#div_order_dealer_list tr.userorderlistlibg");
		$staff.each(function(){
			$("#dealer_"+objInstId).val($(this).attr("staffName")).attr("staffId", $(this).attr("staffId"));
		});
		if($staff.length > 0){
			$("#div_staff_dialog").popup("close");
		}else{
			$.alert("提示","请先选择协销人！");
		}
	};
	/*
	function _setStaff(v_id,staffId,staffCode,staffName){
		//alert(v_id+"--"+staffId+"=="+staffName);
		$("#"+v_id).val(staffName+"("+staffCode+")").attr("staffId",staffId);
		if(!$("#acctDialog").is("hidden")) {
			easyDialog.close();
		}
	}
	*/
	
	//帐户查询
	var _chooseAcct = function() {
		$("#acctDialog .contract_list td").text("帐户查询");
		$("#acctDialog .selectList").show();
		easyDialog.open({
			container : 'acctDialog'
		});
		$("#acctPageDiv").show();
		var listenerName = "chooseAcct";
		var $sel = $("#acctSelect");
		if (!$sel.hasJEventListener(listenerName)) {
			$sel.addJEventListener(listenerName,function(data){
				//遍历当前帐户列表，如果已存在，则直接显示，如果不存在，则加上一个option
				var found = false;
				$.each($sel.find("option"), function(i, option) {
					if ($(option).val() == data.acctId) {
						found = true;
						return false;
					}
				});
				if (found==false) {
					$("<option>").text(data.name+" : "+data.accountNumber).attr("value",data.acctId).attr("acctcd",data.accountNumber).appendTo($sel);
				}
				$sel.find("option[value="+data.acctId+"]").attr("selected","selected");
				if(data.acctId>0){
					$("#account").find("a:eq(1)").show();
				}
			});
		}
		//初始化弹出框
		$("#acctListTab tbody").empty();
		$("#acctPageDiv").empty();
	};
	
	//新增帐户
	var _createAcct = function() {
		$("#acctSelect").append("<option value='-1' style='color:red'>[新增] "+OrderInfo.cust.partyName+"</option>");
		$("#acctSelect").find("option[value='-1']").attr("selected","selected");
		$("#acctName").val(OrderInfo.cust.partyName);//默认帐户名称为客户名称
		//新增帐户自定义支付属性
		$("#defineNewAcct").show();
		//隐藏帐户信息的按钮
		$("#account").find("a:gt(0)").hide();
		//获取账单投递信息主数据并初始化新建帐户自定义属性
		window.setTimeout("order.main.showNewAcct()", 0);
	};
	//获取账单投递信息主数据并初始化新建帐户自定义属性
	var _showNewAcct = function(){
		acct.acctModify.ifCanAdjustBankPayment();//查询工号权限：能否选择银行托收
		acct.acctModify.getBILL_POST(function(){
			acct.acctModify.paymentType();
			acct.acctModify.billPostType();
		});
	};
	
	//展示帐户信息
	var _acctDetail = function() {
		var acctSel = $("#acctSelect");
		if(!acctSel.val()){
			$.alert("提示","请选择一个帐户");
			return
		}
		if(acctSel.val() == -1){
			$.alert("提示","该帐户是新建帐户");
			return;
		}
		$("#acctDialog .contract_list td").text("帐户信息");
		$("#acctDialog .selectList").hide();
		$("#acctPageDiv").hide();
		$("#acctListTab tbody").empty();
		easyDialog.open({
			container : 'acctDialog'
		});
		var acctQueryParam = {
			acctCd : acctSel.find("option:selected").attr("acctcd"),
			isServiceOpen:"Y"
		};			
		$.callServiceAsJson(contextPath+"/order/account", acctQueryParam, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==-2){
					$.alertM(response.data);
					return;
				}
				if(response.code==0){
					_showAcct(response.data.accountInfos);					
				}
				else{
					$("<tr><td colspan=4>"+response.data+"</td</tr>").appendTo($("#acctListTab tbody"));
				}
				$("#acctListTab tr").off("click");				
			}			
		});
	};
	
	var _lastStep = function(callbackFunc) {
		$.confirm("信息","确定回到上一步吗？",{
			yes:function(){
				//TODO　may initialize something;				
				var boProdAns = OrderInfo.boProdAns;
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
						if(boProdAns[n].idFlag){
							continue;
						}
						var param = {
								numType : 1,
								numValue : boProdAns[n].accessNumber
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param);
					}
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
				$("#order_prepare").show();
				$("#order").hide();
				if(typeof(callbackFunc)=="function"){
					callbackFunc();
				}
			},no:function(){
				
			}},"question");
	};
	
	var _getTestParam = function() {
		return {
			boActionTypeCd : "S1",
			boActionTypeName : "订购",
			offerSpecId : 1234,
			offerSpecName : "乐享3G-129套餐",
			feeType : 1200,
			viceCardNum : 3,
			offerNum : 3,
			type : 1,//1购套餐2购终端3选靓号
			terminalInfo : {
				terminalName : "IPhone5",
				terminalCode : "46456457345"
			},
			offerRoles : [
				{
					offerRoleId : 1234,
					offerRoleName : "主卡",
					memberRoleCd : "0",
					roleObjs : [{
						offerRoleId : 1,
						objId : CONST.PROD_SPEC.CDMA,
						objName : "CDMA",
						objType : 2
					}]
				},
				{
					offerRoleId : 2345,
					offerRoleName : "副卡",
					memberRoleCd : "1"
				}
			]
		};
	};
	

	var _genRandPass6Input = function(id){
		var pass = _genRandPass6();
		$("#"+id).val(pass);
	};
	
	var _genRandPass6 = function(){
		var str = "" ;
		var lastOneS = "" ;
		var thisOneS = "" ;
		var thisOneI = 0 ;
		for(var k=0;k<6;k++){
			do{
				if(str.length>0){
					lastOneS = str.substring(str.length-1,str.length) ;
				}
				thisOneI = parseInt(Math.random()*9+1);
				thisOneS = ""+thisOneI ;
				if(str.length==5){
					if(_checkIncreace6(str + thisOneS)){
						continue;
					}
				}
			}while(lastOneS==thisOneS);
			str = str + thisOneS ;
		}
		if(str.length!=6){
			return null ;
		}
		return str ;
	};
	
	var _checkIncreace6 = function(str){
		var newStr = "";
		if(str && str.length==6){
			var int0 = str[0];
			for(var i=0;i<str.length;i++){
				var int1 = parseInt(str.substring(i,i+1));
				newStr += Math.abs(int1-int0);
			}
			if("012345"==newStr||"543210"==newStr){
				return true ;
			}else{
				return false ;
			}
		}else{
			return false ;
		}
	};
	
	var _passwordCheckInput = function(id,accNbr){
		var val = $("#"+id).val();
		return _passwordCheckVal(val,accNbr);
	};
	
	var _passwordCheckVal = function(val,accNbr){
		var detail = "<div style='text-indent:0px;'>密码设置规则：<br/>1、密码必须为六位全数字；<br/>2、密码不能与接入号中的信息重复；<br/>3、密码不能包含连续相同的数字；<br/>4、密码不能是连续的六位数字。</div>";
		var reg = new RegExp("^([0-9]{6})$");//6位纯数字 0~9
		if(val==null){
			$.alertMore("提示", "", "密码不可为空！", detail, "");
			return false ;
		}else if(!reg.test(val)){
			$.alertMore("提示", "", "密码包含非数字或长度不是6位", detail, "");
			return false ;
		}
		if(accNbr!=null && accNbr.indexOf(val)>=0){
			$.alertMore("提示", "", "密码不能与接入号中的信息重复，请修改！", detail, "");
			return false ;
		}
		for(var k=0;k<5;k++){
			lastOneS = val.substring(k,k+1) ;
			thisOneS = val.substring(k+1,k+2) ;
			if(lastOneS==thisOneS){
				$.alertMore("提示", "", "密码中包含连续相同数字，请修改！", detail, "");
				return false ;
			}
		}
		if(_checkIncreace6(val)){
			$.alertMore("提示", "", "密码不可是连续6位数字，请修改！", detail, "");
			return false ;
		}
		return true ;
	};
	
	//付费类型选项变更时级联更新相关的产品属性
	var _feeTypeCascadeChange = function(dom,prodId){
		var feeType = $(dom).val();
		var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId);
		//“是否信控”产品属性，预付费时默认为“是”且不可编辑，其他默认为“是”但可编辑
		if(feeType == CONST.PAY_TYPE.BEFORE_PAY){
			$(xkDom).val("20");
			$(xkDom).attr("disabled", true);
		} else {
			$(xkDom).attr("disabled", false);
		}
		$(xkDom).addClass("styled-select");
	};
	
	
	return {
		buildMainView 				:				 _buildMainView,
		feeTypeCascadeChange		:				 _feeTypeCascadeChange,
		initTounch					:				 _initTounch,
		spec_parm					: 				 _spec_parm,
		check_parm			: _check_parm,
		queryScroll			: _queryScroll,
		queryStaff			: _queryStaff,
		queryStaffPage		: _queryStaffPage,
		setStaff			: _setStaff,
		chooseAcct 			: _chooseAcct,
		check_parm_self		: _check_parm_self,
		createAcct 			: _createAcct,
		showNewAcct 		: _showNewAcct,
		acctDetail 			: _acctDetail,
		//spec_parm_change: _spec_parm_change,
		spec_parm_change_save:_spec_parm_change_save,
		//spec_password_change:_spec_password_change,
		//spec_password_change_save:_spec_password_change_save,
		paymethodChange		:_paymethodChange,
		templateTypeCheck	:_templateTypeCheck,
		lastStep 			: _lastStep,
		genRandPass6		:_genRandPass6,
		genRandPass6Input	:_genRandPass6Input,
		passwordCheckInput	:_passwordCheckInput,
		passwordCheckVal	:_passwordCheckVal,
		checkIncreace6		:_checkIncreace6,
		reload:_reload,
		buildMainViewSub:_buildMainViewSub,
		callBackBuildView:_callBackBuildView
	};
})();


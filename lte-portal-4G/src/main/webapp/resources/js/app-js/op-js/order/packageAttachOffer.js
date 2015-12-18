/**
 * 附属销售品受理对象
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("PackageAttachOffer");

/** 附属销售品受理对象*/
PackageAttachOffer = (function() {

	var _openList = []; //保存已经选择的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openedList = []; //已经订购的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openServList = []; //保存已经选择功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openedServList = []; //保存已经订购功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openAppList = []; //保存产品下增值业务
	
	var _changeList = []; //3g订购4g流量包订单提交预校验时，保存修改缓存列表的修改数据，用于订单确认页面返回的反向操作
	
	var _labelList = []; //标签列表
	
	var totalNums=0;//记录总共添加了多少个终端输入框
	
	var isRightCheck="N";
	
	//初始化附属销售页面
	var _init = function(){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		
		OrderInfo.actionFlag = 3;
		if(OrderInfo.provinceInfo.mergeFlag=="0"){
			if(!query.offer.setOffer()){  
				return;
			}
		}
		if(!rule.rule.ruleCheck()){ //规则校验失败
			return;
		}
		var param = {
				offerSpecId : prodInfo.prodOfferId,
				offerTypeCd : 1,
				partyId: OrderInfo.cust.custId
		};
		if(ec.util.isObj(prodInfo.prodOfferId)){
			if(!query.offer.queryMainOfferSpec(param)){ //查询主套餐规格构成，并且保存
				return;
			}
		}else{
			OrderInfo.offerSpec = {};
		}
		if(CONST.getAppDesc()==0){ //4g系统需要
			if(!prod.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
				return;	
			}
		}
		_queryAttachOffer();
	}; 
	
	//已订购的附属销售品查询
	var _queryAttachOffer = function() {
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var prodId = prodInfo.prodInstId;
		var param = {
		    prodId : prodId,
		    prodSpecId : prodInfo.productId,
		    offerSpecId : prodInfo.prodOfferId,
		    acctNbr : prodInfo.accNbr
		};
		if(ec.util.isObj(prodInfo.prodBigClass)){
			param.prodBigClass = prodInfo.prodBigClass;
		}
		query.offer.queryAttachOfferHtml(param,function(data){
			SoOrder.initFillPage();
			$("#order-content").html(data).show();
			$("#fillNextStep").off("click").on("click",function(){
				if(!SoOrder.checkData()){ //校验通过
					return false;
				}
				$("#order-content").hide();
				$("#order-dealer").show();
				order.dealer.initDealer();
			});
			var member = CacheData.getOfferMember(prodId);
			//如果objId，objType，objType不为空才可以查询默认必须
			if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
				param.queryType = "1,2";
				param.objId = member.objId;
				param.objType = member.objType;
				param.offerRoleId = member.offerRoleId;
				param.memberRoleCd = member.roleCd;
				//默认必须可选包
				var data = query.offer.queryDefMustOfferSpec(param);
				
				CacheData.parseOffer(data,prodId);
				
				//默认必须功能产品
				var data = query.offer.queryServSpec(param,prodId);
				
				CacheData.parseServ(data);
			}
			
			if(ec.util.isArray(OrderInfo.offerSpec.offerRoles)){ //主套餐下的成员判断
				var member = CacheData.getOfferMember(prodId);
				$.each(OrderInfo.offerSpec.offerRoles,function(){
					if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
						$.each(this.roleObjs,function(){
							if(this.objType==CONST.OBJ_TYPE.SERV){
								var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(this.minQty==1){
										$oldLi.removeAttr("onclick");
										var $span = $("#span_"+prodId+"_"+serv.servId);
										var $span_remove = $("#span_remove_"+prodId+"_"+serv.servId);
										if(ec.util.isObj($span)){
											$span.removeClass("del");
										}
										if(ec.util.isObj($span_remove)){
											$span_remove.hide();
										}
									}
								}
							}
						});
						
						return false;
					}
				});
			}
			order.dealer.initDealer();
			
			//加载完成后判断是否二次加载，进行二次加载操作
			_querrOldOrderInfo();
		});
	};
	
	var _querrOldOrderInfo=function(){
		//开始可选包前进行重载校验 
		var isReload=OrderInfo.provinceInfo.reloadFlag;
		
		var orderInfo=OrderInfo.reloadOrderInfo;
		
		if(isReload=="N"){
			if(orderInfo==null || orderInfo=="" || orderInfo==undefined){
				$.alert("订单数据为空，重载失败!");
				return ;
			} 
			
			//0是正确的，进行信息重新加载
			var resultCode=orderInfo.resultCode;
			var resultMsg=orderInfo.resultMsg;
			
			if(resultCode=="0"){
				//进行进行数据解析工作,获取产品数据
				var custOrderList=orderInfo.result.orderList.custOrderList;
				
				var orderListInfo=orderInfo.result.orderList.orderListInfo;
				
				if(custOrderList!=null && custOrderList!=""){
					//获取下属的产品
					if(custOrderList!=null && custOrderList.length>0){
						$(custOrderList).each(function(i,custOrder) { 
							
							//先把删除的开通功能进行删除操作
							$(custOrder.busiOrder).each(function(i,busiOrder) { 
								//解析到具体的订购产品数据
								//获取产品操作类型
								var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
								
								//获取产品的操作状态,state,del-删除,add-添加
								var state="";
								var data=busiOrder.data;
								var ooOwners;
								var boServs;
								
								// 7是已开通功能，状态的获取和其他类型获取不一样
								if(boActionTypeCd=="7"){
									boServs=data.boServs;
									
									if(boServs!=null){
										$(boServs).each(function(i,boServ) { 
											state=boServ.state;
										});
									}
								}
								
								var busiObj=busiOrder.busiObj;
								
								if(boActionTypeCd=="7"){
									//7是已开通功能产品
									//获取唯一ID标识
									var instId=busiObj.instId;
									
									var boServOrders=data.boServOrders;
									
									$(data.boServs).each(function(i,boServ) { 
										var servId=boServ.servId;
										var state=boServ.state;
										if(state=="DEL"){
											_closeServ(instId,servId);
										}
									});
								}
							});
						});
						
						$(custOrderList).each(function(i,custOrder) { 
							$(custOrder.busiOrder).each(function(i,busiOrder) { 
								//解析到具体的订购产品数据
								//获取产品操作类型
								var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
								
								//获取产品的操作状态,state,del-删除,add-添加
								var state="";
								
								var data=busiOrder.data;
								
								var ooOwners;
								var boServs;
								
								// 7是已开通功能，状态的获取和其他类型获取不一样
								if(boActionTypeCd=="7"){
									boServs=data.boServs;
									
									if(boServs!=null){
										$(boServs).each(function(i,boServ) { 
											state=boServ.state;
										});
									}
								}else{
									ooOwners=data.ooOwners;
									if(ooOwners!=null){
										$(ooOwners).each(function(i,ooOwner) { 
											state=ooOwner.state;
											return false
										});
									}
								}
								
								var busiObj=busiOrder.busiObj;
								
								//S2是已订购可选包
								if(boActionTypeCd=="S2"){
									//获取唯一ID标识
									var instId=busiObj.instId;
									
									$(data.ooRoles).each(function(i,ooRole) { 
										var objInstId=ooRole.objInstId;
										if(state=="DEL"){
											_delOffer(objInstId,instId);
										}
									});
								}else if(boActionTypeCd=="7"){
									//7是已开通功能产品
									//获取唯一ID标识
									var instId=busiObj.instId;
									
									var boServOrders=data.boServOrders;
									
									$(data.boServs).each(function(i,boServ) { 
										var servId=boServ.servId;
										var state=boServ.state;
										
										if(state=="ADD"){
											$(boServOrders).each(function(i2,boServOrder) {
												var servSpecId=boServOrder.servSpecId;
												var servSpecName=boServOrder.servSpecName;
												
												_openServSpec(instId,servSpecId,servSpecName,'N');
											});
										}
									});
								}else if(boActionTypeCd=="S1"){
									//S1是订单中的已选可选包数据
									//获取唯一ID标识
									var objId=busiObj.objId;
									var accessNumber=busiObj.accessNumber;
									var objName=busiObj.objName;
									var prodId=null;
									
									var ooRoles=data.ooRoles;
									var busiOrderAttrs=data.busiOrderAttrs;
									
									$(data.ooRoles).each(function(i,ooRole) { 
										prodId=ooRole.prodId;
										return false;
									});
									
									var isNeedAdd=false;
									
									var roleCode="";
									
									//加载发展人
									//套餐变更APP是有发展人的,以下是发展人数据
									if(busiOrder.data.busiOrderAttrs!=undefined){
										var dealerMap1 = {};
										var dealerMap2 = {};
										var dealerMap3 = {};
										$.each(busiOrder.data.busiOrderAttrs,function(){
											if(this.role=="40020005"){
												dealerMap1.role = this.role;
												if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
													dealerMap1.staffid = this.value;
												}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
													dealerMap1.staffname = this.value;
												}
												dealerMap1.objInstId=objId;
												dealerMap1.accessNumber=accessNumber;
												dealerMap1.objName=objName;
												dealerMap1.prodId=prodId;
											}else if(this.role=="40020006"){
												dealerMap2.role = this.role;
												if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
													dealerMap2.staffid = this.value;
												}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
													dealerMap2.staffname = this.value;
												}
												dealerMap2.objInstId=objId;
												dealerMap2.accessNumber=accessNumber;
												dealerMap2.objName=objName;
												dealerMap2.prodId=prodId;
											}else if(this.role=="40020007"){
												dealerMap3.role = this.role;
												if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
													dealerMap3.staffid = this.value;
												}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
													dealerMap3.staffname = this.value;
												}
												dealerMap3.objInstId=objId;
												dealerMap3.accessNumber=accessNumber;
												dealerMap3.objName=objName;
												dealerMap3.prodId=prodId;
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
									
									//重载订单中已经选择的服务
									_addOfferSpec(prodId,objId,ooRoles);
									
									//加载终端数据
									var bo2Coupons=data.bo2Coupons;
									
									if(bo2Coupons!=null && bo2Coupons!=null && bo2Coupons.length>0){
										$(bo2Coupons).each(function(i,bo2Coupon) { 
											var prodId=bo2Coupon.prodId;
											var attachSepcId=bo2Coupon.attachSepcId;
											var num=bo2Coupon.num;
											var couponInstanceNumber=bo2Coupon.couponInstanceNumber;
											
											$("#terminalText_"+prodId+"_"+attachSepcId+"_"+num).val(couponInstanceNumber);
											
											_checkTerminalCode($("#terminalBtn_"+prodId+"_"+attachSepcId+"_"+num));
										});
									}
								}
							});
						});
						
						//号码的预占一定要放到最后
						$(custOrderList).each(function(i,custOrder) { 
							$(custOrder.busiOrder).each(function(i,busiOrder) { 
								//解析到具体的订购产品数据
								//获取产品操作类型
								var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
								
								var data=busiOrder.data;
								
								var ooOwners;
								var boServs;
								
								// 7是已开通功能，状态的获取和其他类型获取不一样
								if(boActionTypeCd=="14"){
									//加载UIM数据
									var bo2Coupons=data.bo2Coupons;
									
									if(bo2Coupons!=null && bo2Coupons!=null && bo2Coupons.length>0){
										$(bo2Coupons).each(function(i,bo2Coupon) { 
											var prodId=bo2Coupon.prodId;
											var attachSepcId=bo2Coupon.attachSepcId;
											var couponInstanceNumber=bo2Coupon.couponInstanceNumber;
											var state=bo2Coupon.state;
											
											if(state=="ADD"){
												
												//$("#uim_txt_"+prodId).val(couponInstanceNumber);
												
												//先释放
												//_releaseUim(prodId);
												
												//$("#uim_txt_"+prodId).val(couponInstanceNumber);											
												
												//第一次不知道为什么都会失败
												//_checkUim(prodId);
												
												//进行第二次
												//if(isRightCheck=="N"){
												//	_checkUim(prodId);
												//}
												_uimCardInfoSearch(couponInstanceNumber,prodId,bo2Coupon);
											}
										});
									}
								}
							});
						});
					}
				}
				
				//订单备注和模版等加载
				if(orderListInfo!=null && custOrderList!=null){
					var custOrderAttrs=orderListInfo.custOrderAttrs;
					var isTemplateOrder=orderListInfo.isTemplateOrder;
					var templateOrderName=orderListInfo.templateOrderName;
					
					$(custOrderAttrs).each(function(i,custOrderAttr) { 
						var itemSpecId=custOrderAttr.itemSpecId;
						
						//111111118是为备注的编码
						if(itemSpecId=="111111118"){
							var value=custOrderAttr.value;
							
							if(value!=null && value!=""){
								$("#order_remark").html(value);
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
			}
		}
	}
	
	var  _uimCardInfoSearch=function(instCode,prodId,bo2Coupon){
		$("#uim_txt_"+prodId).val(instCode);//将UIM卡信息放入
		var coupon = {
				couponUsageTypeCd : "3", //物品使用类型
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : bo2Coupon.couponId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : "3000", //物品费用项类型
				couponNum : 1, //物品数量
				storeId : bo2Coupon.storeId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : 0, //物品价格
				couponInstanceNumber :instCode, //物品实例编码
				terminalCode : instCode,//前台内部使用的UIM卡号
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId :  prodId, //产品ID
				offerId : bo2Coupon.offerId, //销售品实例ID
				state : "ADD", //动作
				relaSeq : "" //关联序列	
		};
		if(bo2Coupon.cardTypeFlag!=null && bo2Coupon.cardTypeFlag!=""){
			coupon.cardTypeFlag=bo2Coupon.cardTypeFlag;
		}
		
		//校验按钮
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		
		//释放按钮
		$("#uim_release_btn_"+prodId).removeAttr("disabled");
		$("#uim_release_btn_"+prodId).attr("class","btn btn-uim");
		
		//输入框
		$("#uim_txt_"+prodId).attr("disabled",true);
		
		if(getIsMIFICheck(prodId)){//判断是否通过MIFI 校验
			$("#isMIFI_"+prodId).val("yes");
		}else{
			$("#isMIFI_"+prodId).val("no");
		}
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
	}
	
	
	//关闭已订购功能产品
	var _closeServ = function(prodId,servId){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		if($span.attr("class")=="del"){  //已经关闭，取消关闭
			_openServ(prodId,serv);
		}else if("13409244"==serv.servSpecId){//一卡双号虚号
			$.alert("提示","请通过“一卡双号退订”入口或者短信入口退订此功能");
		}else{ //关闭
			$span.addClass("del");
			serv.isdel = "Y";
		}
	};
	
	
	//关闭已订购可选包
	var _delOffer = function(prodId,offerId){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			//二次加载，如果原先就是删除状态，不需要操作
			//AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = CacheData.getOffer(prodId,offerId);
			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offerId	
				};
				if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
							param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
						}
					}
				}else{
					param.acctNbr = OrderInfo.getAccessNumber(prodId);
				}
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				//遍历附属的构成要和主套餐的构成实例要一致（兼容融合套餐）
				var offerMemberInfos=[];
				$.each(data.offerMemberInfos,function(){
					var prodInstId=this.objInstId;
					var flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objInstId==prodInstId){
							flag=true;
							return false;
						}
					});
					if(flag){
						offerMemberInfos.push(this);
					}
				});
				
				offer.offerMemberInfos = data.offerMemberInfos=offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			var content = "";
			if(offer.offerSpec!=undefined){
				content = CacheData.getOfferProdStr(prodId,offer,1);
			}else {
				content = '退订【'+$span.text()+'】可选包' ;
			}
			
			//原本是有确认是否删除，二次加载不需要
			offer.isdel = "Y";
			$span.addClass("del");
			delServByOffer(prodId,offer);
		}
	};
	
	//删除附属销售品带出删除功能产品
	var delServByOffer = function(prodId,offer){	
		$.each(offer.offerMemberInfos,function(){
			var servId = this.objInstId;
			if($("#check_"+prodId+"_"+servId).attr("checked")=="checked"){
				var serv = CacheData.getServ(prodId,servId);
				if(ec.util.isObj(serv)){
					serv.isdel = "Y";
					var $li = $("#li_"+prodId+"_"+servId);
					$li.removeClass("canshu").addClass("canshu2");
					$li.find("span").addClass("del"); //定位删除的附属
				}
			}
		});
	};
	
	//二次加载附属业务数据信息 第一步
	var _addOfferSpec = function(prodId,offerSpecId,roles){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		
		_setServ2OfferSpec(prodId,newSpec);
		
		_checkOfferExcludeDepend(prodId,newSpec);
			
	};
	
	//添加可选包到缓存列表
	var _setSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);  //没有在已选列表里面
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			newSpec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
			if(!newSpec){
				return;
			}
			CacheData.setOfferSpec(prodId,newSpec);
		}
		return newSpec;
	};
	
	//把选中的服务保存到销售品规格中
	//把选中的服务保存到销售品规格中 第二步
	var _setServ2OfferSpec = function(prodId,offerSpec,roles){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var nowProd=prodId+"_"+this.objId;
					
					$(roles).each(function(i,role) { 
						var oldProd=role.prodId+"_"+role.objId;
							
						if(nowProd==oldProd){
							this.selQty = 1;
							return false;
						}else{
							this.selQty = 2;
						}
					});
				});
			});
		}
	};
	
	//校验销售品的互斥依赖 第三步
	var _checkOfferExcludeDepend = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//解析互斥依赖返回结果
	var paserOfferData = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				defaultOffer : [], //默选的显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							var offerSpec=CacheData.getOfferSpec(prodId,subOfferSpec.offerSpecId);
							if(ec.util.isObj(offerSpec)){
								if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}
						}
					}
				}
			}
			//解析可选包默选组
			if(ec.util.isArray(defaultOffer)){
				for (var i = 0; i < defaultOffer.length; i++) {	
					content += "需要开通： " + defaultOffer[i].offerSpecName + "<br>";
					param.defaultOffer.push(defaultOffer[i].offerSpecId);
				}	
			}
		}
		
		AttachOffer.addOpenList(prodId,offerSpecId); 

	};
	
	//开通功能产品new
	var _openServSpec = function(prodId,servSpecId,specName,ifParams){
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
		
		_checkServExcludeDepend(prodId,servSpec);
	};
	
	//校验服务的互斥依赖
	var _checkServExcludeDepend = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServData(data.result,prodId,serv);//解析数据
			}
		}
	};
	
	//解析服务互斥依赖
	var paserServData = function(result,prodId,serv){
		var servSpecId = serv.servSpecId;
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
		};
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + this.servSpecName + "<br>";
					param.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.dependServ.push(this);
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.relatedServ.push(this);
			});
		}
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
			excludeAddServ(prodId,servSpecId,param);
		}
	};
	
	//服务互斥依赖时带出添加跟删除
	var excludeAddServ = function(prodId,servSpecId,param){
		if(ec.util.isArray(param.excludeServ)){ //有互斥
			for (var i = 0; i < param.excludeServ.length; i++) { //删除已开通
				var excludeServSpecId = param.excludeServ[i].servSpecId;
				var spec = CacheData.getServSpec(prodId,excludeServSpecId);
				if(spec!=undefined){
					var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
				}else{
					var serv = CacheData.getServBySpecId(prodId,excludeServSpecId);
					if(serv!=undefined){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
		}
		if(ec.util.isArray(param.dependServ)){ // 依赖
			for (var i = 0; i < param.dependServ.length; i++) {
				var servSpec = param.dependServ[i];
				AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams); 
			}
		}
		if(ec.util.isArray(param.relatedServ)){ // 连带
			for (var i = 0; i < param.relatedServ.length; i++) {
				var servSpec = param.relatedServ[i];
				AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams); 
			}
		}
	};
	
	//终端校验
	var _checkTerminalCode = function(obj){
		var prodId=$(obj).attr("prodId");
		var offerSpecId=$(obj).attr("offerSpecId");
//		var terminalGroupId=$(obj).attr("terminalGroupId");
		var num=$(obj).attr("num");
		var flag=$(obj).attr("flag");
		if(flag==undefined){
			flag = 0 ;
		}
		
		//清空旧终端信息
		_filterAttach2Coupons(prodId,offerSpecId,num);
		
		//清空旧终端信息
//		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
//			var attach2Coupon = OrderInfo.attach2Coupons[i];
//			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
//				OrderInfo.attach2Coupons.splice(i,1);
//				break;
//			}
//		}
		var objInstId = prodId+"_"+offerSpecId;
//		var resId = $("#terminalSel_"+objInstId+"_"+terminalGroupId).val();
		var resIdArray = [];
		var terminalGroupIdArray = [];
		$("#"+objInstId+"  option").each(function(){
			resIdArray.push($(this).val());
		});
		$("#group_"+objInstId+"  option").each(function(){
			terminalGroupIdArray.push($(this).val());
		});
		var resId = resIdArray.join("|"); //拼接可用的资源规格id
		var terminalGroupId = terminalGroupIdArray.join("|"); //拼接可用的资源终端组id
		if((resId==undefined || $.trim(resId)=="") && (terminalGroupId==undefined || $.trim(terminalGroupId)=="")){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+objInstId + "_"+num).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		if(_checkData(objInstId,instCode)){
			return;
		}
		var param = {
			instCode : instCode,
			flag : flag,
			mktResId : resId
//			termGroup : terminalGroupId
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		var activtyType ="";
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && ec.util.isArray(spec.agreementInfos)){  //订购的附属销售品
                    if(spec.agreementInfos[0].activtyType == 2){
                    	activtyType = "2";
				    }
				}
			}
		}
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE || (data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2")){
			//这里原有提示校验成功，重载不需要提示
			
			
			var mktPrice=0;//营销资源返回的单位是元
			var mktColor="";
			if(ec.util.isArray(data.mktAttrList)){
				$.each(data.mktAttrList,function(){
					if(this.attrId=="65010058"){
						mktPrice=this.attrValue;
					}else if(this.attrId=="60010004"){
						mktColor=this.attrValue;
					}
				});
			}
			$("#terminalName_"+num).html("终端规格："+data.mktResName+",终端颜色："+mktColor+",合约价格："+mktPrice+"元");
			$("#terminalDesc_"+num).css("display","block");
			
			/*$("#terRes_"+objInstId).show();
			$("#terName_"+objInstId).text(data.mktResName);
			$("#terCode_"+objInstId).text(data.instCode);	
			if(price!=undefined){
				$("#terPrice_"+objInstId).text(price/100 + "元");
			}*/
			var coupon = {
				couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : data.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : data.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : mktPrice, //物品价格,约定取值为营销资源的
				couponInstanceNumber : data.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId : prodId, //产品ID
				offerId : -1, //销售品实例ID
				attachSepcId : offerSpecId,
				state : "ADD", //动作
				relaSeq : "", //关联序列	
				num	: num //第几个串码输入框
			};
			if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2"){//“已销售未补贴”的终端串码可以办理话补合约
				coupon.couponSource ="2"; //串码话补标识
			}
			if(CONST.getAppDesc()==0){
				coupon.termTypeFlag=data.termTypeFlag;
			}
			OrderInfo.attach2Coupons.push(coupon);
		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
			$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
		}else{
			$.alert("提示",data.message);
		}
	};
	
	//过滤 同一个串码输入框校验多次，如果之前有校验通过先清空
	var _filterAttach2Coupons=function(prodId,offerSpecId,num){
		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
			var attach2Coupon = OrderInfo.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId&&attach2Coupon.num==num){
				OrderInfo.attach2Coupons.splice(i,1);
				$("#terminalName_"+num).html("");
				break;
			}
		}
	};
	
	//判断同一个终端组里面是否串码有重复的
	var _checkData=function(objInstId,terminalCode){
		var $input=$("input[id^=terminalText_"+objInstId+"]");
		var num=0;
		$input.each(function(){//遍历页面上面的串码输入框，为的是跟缓存里面的串码进行比对
			var instCode=$.trim(this.value);//页面上面的串码
			if(ec.util.isObj(instCode)&&terminalCode==instCode){
				num++;
			}
		});
		if(num>=2){
			$.alert("信息提示","终端串码重复了，请填写不同的串码。");
			return true ; 
		}
		return false;
	};
	
	//uim卡号释放
	var _releaseUim = function(prodId){	
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}

		//释放UIM并更新门户记录
		var param = {
			numType : 2,
			numValue : cardNo
		};
		var jr = $.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param);			
		if(jr.code==-2){
			$.alertM(jr.data);
			return;
		}
		if(jr.code==-1){
			$.alert("提示",jr.data);
			return;
		}
		//$.alert("提示","成功释放UIM卡："+cardNo);
		
		if(OrderInfo.actionFlag==22){
			$('#attach').children().remove();
	    }
		$("#uim_check_btn_"+prodId).attr("disabled",false);
		//$("#uim_check_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
		$("#uim_release_btn_"+prodId).attr("disabled",true);
		//$("#uim_release_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		$("#uim_txt_"+prodId).attr("disabled",false);
		$("#uim_txt_"+prodId).val("");
		OrderInfo.clearProdUim(prodId);
	};
	
	//uim卡号校验
	var _checkUim = function(prodId){
		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		var offerId = "-1"; //新装默认，主销售品ID
		if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14){ //新装需要选号
			if(phoneNumber==''){
				$.alert("提示","校验UIM卡前请先选号!");
				return false;
			}
		}
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23 || OrderInfo.actionFlag==6 ){ //可选包变更，补换卡，加装副卡
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//判断是否是纳入老用户
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==prodId){
						offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
					}
				});
			}else{
				offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
			}
		}
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		var inParam = {
			"instCode" : cardNo,
			"phoneNum" : phoneNumber,
			"areaId"   : OrderInfo.getProdAreaId(prodId)
//			"areaId"   : '8320102'
		};

		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var mktResCd="";
		if(CONST.getAppDesc()==0){
			if(getIsMIFICheck(prodId)){
				mktResCd =getMktResCd(CONST.PROD_SPEC_ID.MIFI_ID);
			}else{
				mktResCd = getMktResCd(prodSpecId);
			}
			if(ec.util.isObj(mktResCd)){
//				inParam.mktResCd = mktResCd;
			}else{
				$.alert("提示","查询卡类型失败！");
				return;
			}
			if(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23){ //补换卡和异地补换卡
				if(prod.changeUim.is4GProdInst){ //如果已办理4G业务，则校验uim卡是否是4G卡
					inParam.onlyLTE = "1";
				}
			}
		}
		var data = _checkUimSub(inParam,prodId);//校验uim卡
		if(data==undefined || data.baseInfo==undefined){
			return false;
		}
		//根据uim返回数据组织物品节点
		var couponNum = data.baseInfo.qty ;
		if(couponNum==undefined||couponNum==null){
			couponNum = 1 ;
		}
		var coupon = {
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "1",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : data.baseInfo.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : couponNum, //物品数量
			storeId : data.baseInfo.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : data.baseInfo.mktResInstCode, //物品实例编码
			terminalCode : data.baseInfo.mktResInstCode,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :  prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=data.baseInfo.cardTypeFlag;//UIM卡类型
		}
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		//$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		//$("#uim_release_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).removeClass("disabled");
		$("#uim_txt_"+prodId).attr("disabled",true);
		if(getIsMIFICheck(prodId)){//判断是否通过MIFI 校验
			$("#isMIFI_"+prodId).val("yes");
		}else{
			$("#isMIFI_"+prodId).val("no");
		}
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
		if(OrderInfo.actionFlag==22 && data.baseInfo.cardTypeFlag==1){
		//	_queryAttachOffer();
		  AttachOffer.queryCardAttachOffer(data.baseInfo.cardTypeFlag);  //加载附属销售品
	    }
	};
	
	var getMktResCd = function(prodSpecId){
		var param={
			"prodSpecId":prodSpecId
		};
		var url = contextPath+"/mktRes/uim/getMktResCd";
		$.ecOverlay("<strong>获取产品规格中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == "0") {
			return response.data;
		}else{
			return "";
		}
	};
	
	/*
	 * 是否是MIFI卡类型校验
	 */
	var getIsMIFICheck=function(prodId){
		var prodIdTmp=(Math.abs(prodId)-1);
		if(AttachOffer.openServList.length>prodIdTmp){
			var specList = AttachOffer.openServList[prodIdTmp].servSpecList;
			for (var j = 0; j < specList.length; j++) {
				var spec = specList[j];
				if(spec.isdel!="Y" && spec.isdel!="C"){
					if(spec.servSpecId==CONST.PROD_SPEC_ID.MIFI_ID && CONST.APP_DESC==0){
						return true ; 
					}
				}
			}
		}
		return false;
	};
	
	var _checkUimSub=function(param,prodId){
		var url = contextPath+"/app/mktRes/uim/checkUim";
		$.ecOverlay("<strong>UIM卡校验中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			isRightCheck="Y";
			
			//$.alert("提示","UIM卡校验成功!");
			
			//校验成功后，修改按钮class属性数据
			$("#uim_check_btn_"+prodId).removeAttr("class");
			
			$("#uim_check_btn_"+prodId).attr("disabled","disabled");
												
			$("#uim_check_btn_"+prodId).attr("class","btn btn-uim");	
			
			//修改释放按钮的展示
			$("#uim_release_btn_"+prodId).removeAttr("class");
			
			$("#uim_release_btn_"+prodId).removeAttr("disabled");
			
			$("#uim_release_btn_"+prodId).attr("class","btn btn-uim");	
			
			return response.data;
		}
	};
	
	return {
		delOffer : _delOffer,
		init : _init
	};
})();
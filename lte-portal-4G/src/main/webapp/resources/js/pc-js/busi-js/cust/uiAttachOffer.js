/**
 * 附属销售品受理对象
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("uiAttachOffer");

/** 附属销售品受理对象*/
uiAttachOffer = (function() {

	var _openList = []; //保存已经选择的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openedList = []; //已经订购的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openServList = []; //保存已经选择功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openedServList = []; //保存已经订购功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openAppList = []; //保存产品下增值业务
	
	var _changeList = []; //3g订购4g流量包订单提交预校验时，保存修改缓存列表的修改数据，用于订单确认页面返回的反向操作
	
	var _labelList = []; //标签列表
	
	var isRightCheck="N";
	
//	var _terminalGroups=[];//终端组
	var totalNums=0;//记录总共添加了多少个终端输入框
	//初始化附属销售页面
	var _init = function(){
		//开始进入订单页面new
		
		var prodInfo = order.prodModify.choosedProdInfo;
		
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			order.uiCust.showPackageDialog("客户无可用产品,无法操作!");
			//$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 3;
		if(OrderInfo.provinceInfo.mergeFlag=="0"){
			if(!uiOfferQuery.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
				return ;
			}
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
		
		uiAttachOffer.queryAttachOffer();
	}; 
	
	//已订购的附属销售品查询
	var _queryAttachOffer = function() {
		//加载订单填写页面信息内容!!new
		
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
		
		//调用control，加载订单填写页面new
		var data = uiOfferQuery.queryAttachOfferHtml(param);
		//初始化填单页面new
		SoOrder.initFillPage();
		$("#order_fill_content").html(data).show();
		order.main.initOrderAttr();//初始化经办人
		var orderAttrFlag = ec.util.defaultStr($("#orderAttrFlag").val());
		var orderAttrCustId = ec.util.defaultStr($("#orderAttrCustId").val());
		OrderInfo.orderAttrFlag = orderAttrFlag;
		OrderInfo.subHandleInfo.orderAttrCustId = orderAttrCustId;
		if(orderAttrFlag=="N"){//订单提交报文中经办人下省用
			$("#orderAttrDiv").hide();
		}
		//在初始化填单页面后，一些信息是不需要的，暂时隐藏new
		$("#step1").hide();
		
		
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
			CacheData.parseOffer(data);
			//默认必须功能产品
			var data = query.offer.queryServSpec(param);
			CacheData.parseServ(data);
		}
		if(ec.util.isArray(OrderInfo.offerSpec.offerRoles)){ //主套餐下的成员判断
			var member = CacheData.getOfferMember(prodId);
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
					var offerRole = this;
					$.each(this.roleObjs,function(){
						if(this.objType==CONST.OBJ_TYPE.SERV){
							var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
							if(serv!=undefined){ //不在已经开跟已经选里面
								var $oldLi = $('#li_'+prodId+'_'+serv.servId);
								if(this.minQty==1){
									$oldLi.append('<dd class="mustchoose"></dd>');
								}
								$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
							}
						}
					});
					return false;
				}
			});
		}
		uiAttachOffer.changeLabel(prodId, prodInfo.productId,""); //初始化第一个标签附属
		order.dealer.initDealer();
		
		//进入订单页面加载结束,获取页面数据，判断是否二次加载订单
		//如果是暂存订单，需要加载订单信息
		_querrOldOrderInfo();
	};
	
	var _querrOldOrderInfo=function(){
		//开始可选包前进行重载校验 
		var isReload=order.uiCust.packageInfo.reloadFlag;
		
		var orderInfo=order.uiCust.orderInfo;
		
		if(isReload=="N"){
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
											_closeServSub(instId,servId);
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
											_delOfferSub(objInstId,instId);
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
												
												_openServSpecSub(instId,servSpecId,servSpecName,'N');
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
									
									$(busiOrderAttrs).each(function(i,busiOrderAttr) { 
										var itemSpecId=busiOrderAttr.itemSpecId;
										if(itemSpecId=="111111120"){
											roleCode=busiOrderAttr.role;
											isNeedAdd=true;
											return false;
										}
									});
									
									//新增发展人
									if(isNeedAdd){
										_addAttachDealerSub(prodId+"_"+objId,accessNumber,objName,roleCode);
									}
									
									//重载订单中已经选择的服务
									_addOfferSpecSub(prodId,objId,ooRoles);
									
									//加载终端数据
									var bo2Coupons=data.bo2Coupons;
									
									if(bo2Coupons!=null && bo2Coupons!=null && bo2Coupons.length>0){
										$(bo2Coupons).each(function(i,bo2Coupon) { 
											var prodId=bo2Coupon.prodId;
											var attachSepcId=bo2Coupon.attachSepcId;
											var num=bo2Coupon.num;
											var couponInstanceNumber=bo2Coupon.couponInstanceNumber;
											
											if(num>1){
												$("#terminalAddBtn_"+prodId+"_"+attachSepcId).click();
											}
											
											$("#terminalText_"+prodId+"_"+attachSepcId+"_"+num).val(couponInstanceNumber);
											
											_checkTerminalCodeSub($("#terminalBtn_"+prodId+"_"+attachSepcId+"_"+num));
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
		$("#uim_check_btn_"+prodId).attr("class","disablepurchase");
		
		//释放按钮
		$("#uim_release_btn_"+prodId).removeAttr("disabled");
		$("#uim_release_btn_"+prodId).attr("class","purchase");
		
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
	
	//删除已订购可选包(new)
	var _delOfferSub = function(prodId,offerId){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			//AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = _getOffer(prodId,offerId);
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
				var data = uiOfferQuery.queryOfferInst(param);
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
			}
			//这里原先是有弹窗提示的，二次加载就不需要了，原方法：_delOffer
			offer.isdel = "Y";
			$span.addClass("del");
			delServByOffer(prodId,offer);
		}
	};
	
	//获取销售品实例构成new
	var _getOffer = function(prodId,offerId){
		var offerList = _getOfferList(prodId);
		if(ec.util.isArray(offerList)){
			for ( var i = 0; i < offerList.length; i++) {
				if(offerList[i].offerId==offerId){
					return offerList[i];
				}
			}
		}
	};
	
	//通过产品id获取产品已开通附属实例列表new
	var _getOfferList = function (prodId){
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			if(opened.prodId == prodId){
				return opened.offerList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//关闭已开通功能产品(new)
	var _closeServSub = function(prodId,servId){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		if($span.attr("class")=="del"){  //已经关闭，取消关闭
			_openServ(prodId,serv);
		}else if("13409244"==serv.servSpecId){//一卡双号虚号
			$.alert("提示","请通过“一卡双号退订”入口或者短信入口退订此功能");
		}else{ //关闭
			var uim = OrderInfo.getProdUim(prodId);
			if(serv.servSpecId=="280000020" && (OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23) && uim.cardTypeFlag=="1"){//补换卡补4G卡不能退订4G上网功能产品
				$.alert("提示","4G卡不能退订【4G（LTE）上网】功能产品");
				return;
			}

			$span.addClass("del");
			serv.isdel = "Y";
		}
	};
	
	//二次加载附属业务数据信息 第一步
	var _addOfferSpecSub = function(prodId,offerSpecId,roles){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		
		_setServ2OfferSpecSub(prodId,newSpec);
		
		_checkOfferExcludeDependSub(prodId,newSpec);
			
	};
	
	//终端校验
	var _checkTerminalCodeSub = function(obj){
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
		
		var objInstId = prodId+"_"+offerSpecId;
		
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
			mktResId : resId,
			termGroup : terminalGroupId
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
	
	//把选中的服务保存到销售品规格中 第二步
	var _setServ2OfferSpecSub = function(prodId,offerSpec,roles){
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
	var _checkOfferExcludeDependSub = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferDataSub(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	
	//解析互斥依赖返回结果
	var paserOfferDataSub = function(result,prodId,offerSpecId,specName){
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
		var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		content=content+serContent;
		
		AttachOffer.addOpenList(prodId,offerSpecId); 
//		if(content==""){ //没有互斥依赖
//			AttachOffer.addOpenList(prodId,offerSpecId); 
//		}else{	
//			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
//			
//			$("#packageHiddenDiv").html(content);
//			
//			_setOffer2ExcludeOfferSpecSub(param);
//			excludeAddattch(prodId,offerSpecId,param);
//			excludeAddServ(prodId,"",paramObj);
//		}
	};
	
	//把选中的销售品保存到依赖或互斥的销售品规格中
	var _setOffer2ExcludeOfferSpecSub = function(param){
		if(param.dependOffer.offerGrpInfos.length>0){  // 依赖组
			var dependOffer=param.dependOffer;
			for (var i = 0; i < dependOffer.offerGrpInfos.length; i++) {
				var offerGrpInfo = dependOffer.offerGrpInfos[i];
				var $offerSpecs = $("input[name="+offerGrpInfo.grpId+"]:checked");
				var len  = $offerSpecs.length;
				dependOffer.offerGrpInfos[i].checkLen=len;
				for(var j=0;j<offerGrpInfo.subOfferSpecInfos.length;j++){
					var subOfferSpecInfo=offerGrpInfo.subOfferSpecInfos[j];
					$offerSpecs.each(function(){
						if($(this).val()==subOfferSpecInfo.offerSpecId){
							subOfferSpecInfo.isCheck=true;
						}
					});
				}
			}
		}
	};
	
	//点击确认，添加附属销售品发展人
	var _addAttachDealerSub = function(id,accessNumbe,objName,roleCode){
		var prodId = id.split("_")[0];
		if($("#tr_"+id)[0]==undefined){ //没有添加过
			var objId = id+"_"+OrderInfo.SEQ.dealerSeq;
			var $tdType = _getDealerTypeSub(id,objId);
			if($tdType==undefined){
				return false;
			}
			var $tr = $("#atr_"+id);
			var $newTr = $('<tr name="tr_'+id+'"></tr>');
			$newTr.append("<td>"+accessNumbe+"</td>");
			$newTr.append("<td>"+objName+"</td>");
			$newTr.append($tdType);
			
			var dealer = $("#tr_"+prodId).find("input"); //产品协销人
			var staffId = 1;
			var staffName = "";
			if(dealer[0]==undefined){
				staffId = OrderInfo.staff.staffId;
				staffName = OrderInfo.staff.staffName;
			}else {
				staffId = dealer.attr("staffId");
				staffName = dealer.attr("value");
			}
			if(order.ysl!=undefined){
				var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'" class="inputWidth183px" style="margin-left:45px;"></input></td>');
			}else{
				var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'" class="inputWidth183px" readonly="readonly" style="margin-left:45px;"></input></td>');
			}
			$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');	
			$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>');
			$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,\''+id+'\')">添加</a><label class="f_red">*</label>');
			$newTr.append($td);
			if(!ec.util.isArray(OrderInfo.channelList)||OrderInfo.channelList.length==0){
				OrderInfo.getChannelList();
			}
			var $tdChannel = $('<td></td>');
			var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+objInstId+'" class="inputWidth183px" onclick=a=this.value;></select>');
			$.each(OrderInfo.channelList,function(){
				if(dealerlist[d].channelNbr==this.channelNbr)
					$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
				else
					$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
			});
			$tdChannel.append($channelSelect);
			$tdChannel.append('<label class="f_red">*</label>');	
			$tr.append($tdChannel);
			$("#dealerTbody").append($newTr);
			
			if(roleCode!=null && roleCode !=""){
				$("#dealerType_"+id+"_"+OrderInfo.SEQ.dealerSeq).val(roleCode);
			}
			OrderInfo.SEQ.dealerSeq++;
		}
	};
	
	//校验发展人类型,并获取发展人类型列表
	var _getDealerTypeSub = function(objInstId,objId){
		var dealerType = "";
		if(order.ysl!=undefined){
			OrderInfo.order.dealerTypeList = [{"PARTYPRODUCTRELAROLECD":40020005,"NAME":"第一发展人"},{"PARTYPRODUCTRELAROLECD":40020006,"NAME":"第二发展人"},{"PARTYPRODUCTRELAROLECD":40020007,"NAME":"第三发展人"}];
		}
		if(OrderInfo.order.dealerTypeList!=undefined && OrderInfo.order.dealerTypeList.length>0){ //发展人类型列表
			$.each(OrderInfo.order.dealerTypeList,function(){
				var dealerTypeId = this.PARTYPRODUCTRELAROLECD;
				var flag = true;
				$("select[name='dealerType_"+objInstId+"']").each(function(){ //遍历选择框
					if(dealerTypeId==$(this).val()){  //如果已经存在
						flag = false;
						return false;
					}
				});
				if(flag){ //如果发展人类型没有重复
					dealerType = dealerTypeId;
					return false;
				}
			});
		}else{
			$.alert("信息提示","没有发展人类型");
			return;
		}
		if(dealerType==undefined || dealerType==""){	
			$.alert("信息提示","每个业务发展人类型不能重复");
			return;
		}
		var $td = $('<td></td>'); //发展人类型
		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth250px" style="width:183px;" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		$.each(OrderInfo.order.dealerTypeList,function(){
			if(this.PARTYPRODUCTRELAROLECD==dealerType){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected='selected'>"+this.NAME+"</option>");
			}else{
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			}
		});
		$td.append($select);
		$td.append('<label class="f_red">*</label>');
		return $td;
	};
	
	
	//开通功能产品new
	var _openServSpecSub = function(prodId,servSpecId,specName,ifParams){
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
		
		_checkServExcludeDependSub(prodId,servSpec);
	};
	
	//校验服务的互斥依赖
	var _checkServExcludeDependSub = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServDataSub(data.result,prodId,serv);//解析数据
			}
		}
	};
	
	//解析服务互斥依赖
	var paserServDataSub = function(result,prodId,serv){
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
	
	//可订购的附属查询 
	var _queryAttachOfferSpec = function(param) {
		query.offer.queryAttachSpec(param,function(data){
			if (data) {
				$("#attach_"+param.prodId).html(data);
				_showMainRoleProd(param.prodId); //通过主套餐成员显示角字
				uiAttachOffer.changeLabel(param.prodId,param.prodSpecId,""); //初始化第一个标签附属
				if(param.prodId==-1 && OrderInfo.actionFlag==14){ //合约计划特殊处理
					uiAttachOffer.addOpenList(param.prodId,mktRes.terminal.offerSpecId);
				}
			}
		});
	};
	
	//显示增值业务内容
	var _showApp = function(prodId){
		var appList = CacheData.getOpenAppList(prodId);
		var content = CacheData.getAppContent(prodId,appList);
		$.confirm("增值业务设置： ",content[0].innerHTML,{ 
			yes:function(){	
				$.each(appList,function(){
					if($("#"+prodId+"_"+this.objId).attr("checked")=="checked"){
						this.dfQty = 1;
					}else{
						this.dfQty = 0;
					}
				});
			},
			no:function(){
			}
		});
	};
	
	//获取产品实例
	var getProdInst = function(prodId){
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(ec.util.isArray(offerRole.prodInsts)){
				for ( var j = 0; j < offerRole.prodInsts.length; j++) {  //遍历产品实例列表
					if(offerRole.prodInsts[j].prodInstId==prodId){
						return offerRole.prodInsts[j];
					}
				}
			}
		}
	};
	
	//主销售品角色分解个每个接入产品
	var _showMainRoleProd = function(prodId){
		var prodInst = getProdInst(prodId);
		var app = {
			prodId:prodId,
			appList:[]
		};
		uiAttachOffer.openAppList.push(app);
		for (var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.CONTENT){ //增值业务角色
				for ( var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(roleObj.objType== CONST.OBJ_TYPE.SERV){
						if(prodInst.objId==roleObj.parentProdId && prodInst.componentTypeCd.substring(0,1)==roleObj.componentTypeCd.substring(0,1)){	
							app.appList.push(roleObj);
							if(roleObj.servSpecId==undefined){
								roleObj.servSpecId = roleObj.objId;
							}
							if(roleObj.servSpecName==undefined){
								roleObj.servSpecName = roleObj.objName;
							}
						}
					}
				}
				if(app.appList.length>0){
					var $li = $('<li id="li_'+prodId+'_'+offerRole.offerRoleId+'"></li>');
					$li.append('<dd class="mustchoose" ></dd>');	
					$li.append('<span>'+offerRole.offerRoleName+'</span>');
					$li.append('<dd id="can_'+prodId+'_'+offerRole.offerRoleId+'" class="gou2" onclick="AttachOffer.showApp('+prodId+');"></dd>');
					$("#open_app_ul_"+prodId).append($li);
				}
			}else{ 
				if(offerRole.prodInsts==undefined){
					continue;
				}
				$.each(offerRole.prodInsts,function(){  //遍历产品实例列表
					if(this.prodInstId==prodId){
						for (var k = 0; k < offerRole.roleObjs.length; k++) {
							var roleObj = offerRole.roleObjs[k];
							if(roleObj.objType==CONST.OBJ_TYPE.SERV){
								var servSpecId = roleObj.objId;
								var $oldLi = $('#li_'+prodId+'_'+servSpecId);
								var spec = CacheData.getServSpec(prodId,servSpecId);//从已选择功能产品中找
								if(spec != undefined){
									if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){
										if(roleObj.dfQty == 0 && spec.ifDault==1){//在基础功能中没有选中的默认删除状态 
											var $span=$oldLi.find("span");
											$span.addClass("del");
											spec.isdel = "Y";
										}
									}
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								var serv = CacheData.getServBySpecId(prodId,servSpecId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								if(roleObj.dfQty > 0){ //必选，或者默选
									var servSpec=jQuery.extend(true, {}, roleObj);
									CacheData.setServSpec(prodId,servSpec); //添加到已开通列表里
									spec = servSpec;
									if(ec.util.isArray(spec.prodSpecParams)){
										spec.ifParams = "Y";
									}
									$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
									var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
									if(roleObj.minQty==0){
										$li.append('<dd class="delete" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+spec.servSpecName+'\',\''+spec.ifParams+'\')"></dd>');
									}else{
										$li.append('<dd class="mustchoose"></dd>');
									}
									$li.append('<span>'+spec.servSpecName+'</span>');
									if (spec.ifParams=="Y"){
										if(CacheData.setServParam(prodId,spec)){ 
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}else {
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}
									}
									$li.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									$("#open_serv_ul_"+prodId).append($li);
									spec.isdel = "N";
									_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
								}
							}
						}
					}
				});
			}
		}
	};
	
	var _showMainMemberRoleProd=function(prodId){
		for (var i = 0; i < OrderInfo.viceOfferSpec.length; i++) {//多张副卡同时进行套餐变更
			var offerSpec=OrderInfo.viceOfferSpec[i];
			if(prodId==offerSpec.prodId){
				for (var j = 0; j < offerSpec.offerRoles.length; j++) {
					var offerRole = offerSpec.offerRoles[j];
					if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){//主卡
						for (var k = 0; k < offerRole.roleObjs.length; k++) {
							var roleObj = offerRole.roleObjs[k];
							if(roleObj.objType==CONST.OBJ_TYPE.SERV){
								var servSpecId = roleObj.objId;
								var $oldLi = $('#li_'+prodId+'_'+servSpecId);
								var spec = CacheData.getServSpec(prodId,servSpecId);//从已选择功能产品中找
								if(spec != undefined){
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								var serv = CacheData.getServBySpecId(prodId,servSpecId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								if(roleObj.dfQty > 0){ //必选，或者默选
									var servSpec=jQuery.extend(true, {}, roleObj);
									CacheData.setServSpec(prodId,servSpec); //添加到已开通列表里
									spec = servSpec;
									if(ec.util.isArray(spec.prodSpecParams)){
										spec.ifParams = "Y";
									}
									$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
									var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
									if(roleObj.minQty==0){
										$li.append('<dd class="delete" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+spec.servSpecName+'\',\''+spec.ifParams+'\')"></dd>');
									}else{
										$li.append('<dd class="mustchoose"></dd>');
									}
									$li.append('<span>'+spec.servSpecName+'</span>');
									if (spec.ifParams=="Y"){
										if(CacheData.setServParam(prodId,spec)){ 
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}else {
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}
									}
									$li.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									$("#open_serv_ul_"+prodId).append($li);
									spec.isdel = "N";
									_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
								}
							}
						}
					}
				}
			}
		}
	};
	
	//查询附属销售品规格
	var _searchAttachOfferSpec = function(prodId,offerSpecId,prodSpecId) {
		var param = {   
			prodId : prodId,
		    prodSpecId : prodSpecId,
		    offerSpecIds : [offerSpecId],
		    ifCommonUse : "" 
		};
//		if(OrderInfo.actionFlag == 2){ //套餐变更		
//			param.offerSpecIds=[OrderInfo.offerSpec.offerSpecId];
//		}
		if(OrderInfo.actionFlag == 2){ //套餐变更		
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(ec.util.isArray(this.prodInsts)){
					$.each(this.prodInsts,function(){
						if(this.prodInstId==prodId){
							param.acctNbr = this.accessNumber;
							param.offerRoleId = this.offerRoleId;
							param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);	
							return false;
						}
					});
				}
			});
		}else if(OrderInfo.actionFlag == 3){  //可选包
			var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
			param.acctNbr = prodInfo.accNbr;
			if(!ec.util.isObj(prodInfo.prodOfferId)){
				prodInfo.prodOfferId = "";
			}
			var offerRoleId = CacheData.getOfferMember(prodInfo.prodInstId).offerRoleId;
			if(offerRoleId==undefined){
				offerRoleId = "";
			}
			param.offerRoleId = offerRoleId;
			param.offerSpecIds.push(prodInfo.prodOfferId);
		}else if(OrderInfo.actionFlag == 21){ //副卡套餐变更		
			$.each(OrderInfo.viceOfferSpec,function(){
				var offerSpecId=this.offerSpecId;
				var accessNumber=this.accessnumber;
				if(this.prodId==prodId){
					$.each(this.offerRoles,function(){
						if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD || this.memberRoleCd=="1"){
							$.each(this.roleObjs,function(){
								if(this.objType==CONST.OBJ_TYPE.PROD){
									param.acctNbr = accessNumber;
									param.offerRoleId = this.offerRoleId;
									param.offerSpecIds.push(offerSpecId);	
									return false;
								}
							});
						}
					});
				}
			});
		}else if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
					param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
					$.each(OrderInfo.oldofferSpec,function(){
						if(this.accNbr==OrderInfo.oldprodInstInfos[i].accNbr){
							param.offerSpecIds.push(this.offerSpec.offerSpecId);	
							$.each(this.offerSpec.offerRoles,function(){
								if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
									param.offerRoleId = this.offerRoleId;
								}
							});
						}
					});
				}
			}
		}else { //新装
			param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
			var prodInst = OrderInfo.getProdInst(prodId);
			if(prodInst){
				param.offerRoleId = prodInst.offerRoleId;
			}
		}
		var offerSepcName = $("#search_text_"+prodId).val();
		if(offerSepcName.replace(/\ /g,"")==""){
			$.alert("提示","请输入查询条件！");
			return;
		}
		param.offerSpecName = offerSepcName;
		var data = query.offer.searchAttachOfferSpec(param);
		if(data!=undefined){
			$("#attach_div_"+prodId).html(data).show();
		}
	};
	
	//点击搜索出来的附属销售品
	var _selectAttachOffer = function(prodId,offerSpecId){
		$("#attach_div_"+prodId).hide();
		_addAttOffer(prodId,offerSpecId);
	};
	
	//点击搜索出来的功能产品
	var _selectServ = function(prodId,servSpecId,specName,ifParams){
		$("#attach_div_"+prodId).hide();
		_openServSpec(prodId,servSpecId,specName,ifParams);
	};
	
	//点击搜索出来的附属销售品
	var _closeAttachSearch = function(prodId){
		$("#attach_div_"+prodId).hide();
	};
	
	//删除附属销售品规格
	var _delOfferSpec = function(prodId,offerSpecId){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			var content = CacheData.getOfferProdStr(prodId,spec,2);
			$.confirm("信息确认",content,{ 
				yes:function(){
					$span.addClass("del");
					spec.isdel = "Y";
					delServSpec(prodId,spec); //取消订购销售品时
					order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
					$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
					spec.isTerminal = 0;
				},
				no:function(){
					
				}
			});
		}
	};
	
	//删除附属销售品实例
	var _delOffer = function(prodId,offerId){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.addOffer(prodId,offerId,$span.text());
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
				var data = uiOfferQuery.queryOfferInst(param);
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
			$.confirm("信息确认",content,{ 
				yes:function(){
					offer.isdel = "Y";
					$span.addClass("del");
					delServByOffer(prodId,offer);
				},
				no:function(){	
				}
			});
		}
	};
	
	//关闭服务规格
	var _closeServSpec = function(prodId,servSpecId,specName,ifParams){
		var $span = $("#li_"+prodId+"_"+servSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.openServSpec(prodId,servSpecId,specName,ifParams);
		}else { //退订
			$.confirm("信息确认","取消开通【"+$span.text()+"】功能产品",{ 
				yesdo:function(){
					var spec = CacheData.getServSpec(prodId,servSpecId);
					if(spec == undefined){ //没有在已开通附属销售列表中
						return;
					}
					$span.addClass("del");
					spec.isdel = "Y";
					_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
					
					var serv = CacheData.getServBySpecId(prodId,servSpecId);
					if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
						$span.addClass("del");
						serv.isdel = "Y";
						//_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
					}
				},
				no:function(){
				}
			});
		}
	};
	
	//关闭服务实例
	var _closeServ = function(prodId,servId){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		if($span.attr("class")=="del"){  //已经关闭，取消关闭
			_openServ(prodId,serv);
		}else if("13409244"==serv.servSpecId){//一卡双号虚号
			$.alert("提示","请通过“一卡双号退订”入口或者短信入口退订此功能");
		}else{ //关闭
			var uim = OrderInfo.getProdUim(prodId);
			if(serv.servSpecId=="280000020" && (OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23) && uim.cardTypeFlag=="1"){//补换卡补4G卡不能退订4G上网功能产品
				$.alert("提示","4G卡不能退订【4G（LTE）上网】功能产品");
				return;
			}
			$.confirm("信息确认","关闭【"+$span.text()+"】功能产品",{ 
				yesdo:function(){
					$span.addClass("del");
					serv.isdel = "Y";
				},
				no:function(){						
				}
			});
		}
	};
	
	//开通功能产品
	var _openServSpec = function(prodId,servSpecId,specName,ifParams){
		$.confirm("信息确认","开通【"+specName+"】功能产品",{ 
			yesdo:function(){
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
			},
			no:function(){
			}
		});
	};
	
	//开通功能产品
	var _openServ = function(prodId,serv){
		$.confirm("信息确认","取消关闭【"+serv.servSpecName+"】功能产品",{ 
			yesdo:function(){
				if(serv!=undefined){   //在可订购功能产品里面 
					if(serv.servSpecId==""){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.removeClass("del");
						serv.isdel = "N";
					}else{
						_checkServExcludeDepend(prodId,serv);
					}
				}
			},
			no:function(){
			}
		});
	};
	
	//校验销售品的互斥依赖
	var _checkOfferExcludeDepend = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
//		if(param.orderedOfferSpecIds.length == 0 ){
////			AttachOffer.addOpenList(prodId,offerSpecId); 
//			paserOfferData("",prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
//		}else{
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
//		}
		
		//获取销售品节点校验销售品下功能产品的互斥依赖
		/*var offerSpec = CacheData.getOfferSpec(offerSpecId);
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var param = {
						prodId : prodId,
						servSpecId : this.objId,
						orderedServSpecIds : [] //功能产品互斥依赖查询入场数组
					};
					//已选销售品列表
					var offerSpecList = CacheData.getSpecList(prodId);
					if(ec.util.isArray(offerSpecList)){
						$.each(offerSpecList,function(){
							if(this.offerSpecId!=offerSpecId && this.isdel!="Y" && this.isdel!="C"){
								param.orderedOfferSpecIds.push(this.offerSpecId);
							}
						});
					}
					if(param.orderedServSpecIds.length == 0 ){
						AttachOffer.addOpenList(prodId,offerSpecId); 
					}else{
						datas.push(query.offer.queryServExcludeDepend(param));//查询规则校验
					}
				});
			});
		}*/
		//paserData(datas,prodId,offerSpecId,offer.offerSpecName,"OFFER"); //解析数据
		
		/*if(param.orderedOfferSpecIds.length == 0 ){
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserData(data.result,prodId,offerSpecId,offer.offerSpecName,"OFFER"); //解析数据
			}
		}*/
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
	
	//订购附属销售品
	var _addOfferSpec = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		$.confirm("信息确认",content,{ 
			yes:function(){
				CacheData.setServ2OfferSpec(prodId,newSpec);
			},
			yesdo:function(){
				_checkOfferExcludeDepend(prodId,newSpec);
			},
			no:function(){
			}
		});
	};
	
	//根据预校验返回订购附属销售品
	var _addOfferSpecByCheck = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		$.confirm("信息确认",content,{ 
			yes:function(){
				CacheData.setServ2OfferSpec(prodId,newSpec);
			},
			yesdo:function(){
				_checkOfferExcludeDepend(prodId,newSpec);
			}
		});
	};
	
	//删除附属销售品带出删除功能产品
	var delServSpec = function(prodId,offerSpec){
		$.each(offerSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				var servSpecId = this.objId;
				if($("#check_"+prodId+"_"+servSpecId).attr("checked")=="checked"){
					var spec = CacheData.getServSpec(prodId,servSpecId);
					if(ec.util.isObj(spec)){
						spec.isdel = "Y";
						var $li = $("#li_"+prodId+"_"+servSpecId);
						$li.removeClass("canshu").addClass("canshu2");
						$li.find("span").addClass("del"); //定位删除的附属
						_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
					}
				}
			});
		});
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
	
	//取消退订附属销售品
	var _addOffer = function(prodId,offerId){
		var specName = $("#li_"+prodId+"_"+offerId).find("span").text();
		$.confirm("信息确认","取消退订【"+specName+"】可选包",{ 
			yesdo:function(){
				var offer = CacheData.getOffer(prodId,offerId); //在已经开通列表中查找
				if(offer!=undefined){   //在可订购功能产品里面 
					if(offer.offerSpecId==""){
						var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
						$span.removeClass("del");
						offer.isdel = "N";
					}else{
						_checkOfferExcludeDepend(prodId,offer);
					}
				}
			},
			no:function(){
			}
		});
	};
	
	//确认订购附属销售品
	var _addAttOffer = function(prodId,offerSpecId,specName){
		_addOfferSpec(prodId,offerSpecId);
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
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
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
		var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		content=content+serContent;
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{	
			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
			$.confirm("订购： " + specName,content,{ 
				yes:function(){
					CacheData.setOffer2ExcludeOfferSpec(prodId,param);
				},
				yesdo:function(){
					excludeAddattch(prodId,offerSpecId,param);
					excludeAddServ(prodId,"",paramObj);
				},
				no:function(){
					
				}
			});
		}
	};
	
	/*//解析互斥依赖返回结果
	var paserData = function(datas,prodId,offerSpecId,specName,objType){
		var exclude = result.offerSpec.exclude;
		var depend = result.offerSpec.depend;
		var servExclude = result.servSpec.exclude;
		var servDepend = result.servSpec.depend;

		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeOffer : [],   //互斥依赖显示列表
			dependOffer : {  //存放互斥依赖列表
				dependOffers : [],
				offerGrpInfos : []
			},
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [] //存放互斥依赖列表
		};
		
		//解析可选包互斥依赖组
		if(exclude!=undefined && exclude.length>0){
			for (var i = 0; i < exclude.length; i++) {
				var offerList = AttachOffer.getOfferList(prodId); //互斥要去除已订购手动删除
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
		if(depend!=undefined && depend.offerInfos!=undefined && depend.offerInfos.length>0){
			for (var i = 0; i < depend.offerInfos.length; i++) {	
				content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
				param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
			}	
		}
		if(depend!=undefined && depend.offerGrpInfos!=undefined && depend.offerGrpInfos.length>0){
			for (var i = 0; i < depend.offerGrpInfos.length; i++) {
				var offerGrpInfo = depend.offerGrpInfos[i];
				param.dependOffer.offerGrpInfos.push(offerGrpInfo);
				content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
				if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
					for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
						var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
						content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
					}
				}
			}
		}
		
		//解析功能产品互斥依赖组
		if(servExclude!=undefined && servExclude.length>0){
			$.each(servExclude,function(){
				if(this.offerSpecId == undefined || this.offerSpecId == ""){ //纯功能产品互斥
					var servList = AttachOffer.getServList(prodId); //互斥要去除已订购手动删除
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
				}else {  //可选包下功能产品互斥
					var offerList = AttachOffer.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == this.offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + this.offerSpecName + "<br>";
						param.excludeOffer.push(this.offerSpecId);
					}
				}
			});
		}
		if(servDepend!=undefined && servDepend.length>0){
			$.each(servDepend,function(){
				if(this.offerSpecId == undefined || this.offerSpecId == ""){ //纯功能产品依赖
					content += "需要开通：   " + this.servSpecName + "<br>";
					param.dependServ.push(this);
				}else {  //功能产品与可选包下功能产品依赖
					content += "需要开通：   " + this.offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(this.offerSpecId);
				}
			});
		}
		
		if(content==""){ //没有互斥依赖
			if(objType == "OFFER"){
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}else {
				AttachOffer.addOpenServList(prodId,offerSpecId); 
			}
		}else{	
			$.confirm("开通： " + specName,content,{ 
				yesdo:function(){
					excludeAddattch(prodId,offerSpecId,param,objType);
				},
				no:function(){
					
				}
			});
		}
	};*/
	
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
			$.confirm("开通： " + serv.servSpecName,content,{ 
				yesdo:function(){
					AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
					excludeAddServ(prodId,servSpecId,param);
				},
				no:function(){
				}
			});
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
	
	//互斥依赖时添加
	var excludeAddattch = function(prodId,specId,param){
		if(param.dependOffer.offerGrpInfos.length>0){  // 依赖组
			var dependOffer=param.dependOffer;
			for (var i = 0; i < dependOffer.offerGrpInfos.length; i++) {
				var offerGrpInfo = dependOffer.offerGrpInfos[i];
				var len  = offerGrpInfo.checkLen;
				if(len>=offerGrpInfo.minQty&&len<=offerGrpInfo.maxQty){
					$.each(offerGrpInfo.subOfferSpecInfos,function(){
						if(this.isCheck){
							AttachOffer.addOpenList(prodId,this.offerSpecId); 
						}
					});
				}else if(len<offerGrpInfo.minQty){
					$.alert("提示信息","依赖组至少选中"+offerGrpInfo.minQty+"个！");
					return;
				}else if(len>offerGrpInfo.maxQty){
					$.alert("提示信息","依赖组至多选中"+offerGrpInfo.maxQty+"个！");
					return;
				}else {
					$.alert("错误信息","依赖组选择出错！");
					return;
				}
			}
		}
		
		AttachOffer.addOpenList(prodId,specId); //添加开通附属
		if(param.excludeOffer.length>0){ //有互斥
			//删除已开通
			for (var i = 0; i < param.excludeOffer.length; i++) {
				var excludeSpecId = param.excludeOffer[i];
				var spec = CacheData.getOfferSpec(prodId,excludeSpecId);
				if(spec!=undefined){
					var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
					$("#terminalUl_"+prodId+"_"+excludeSpecId).remove();
				}
				var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
				if(offer!=undefined){
					var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
					$span.addClass("del");
					offer.isdel = "Y";
				}
			}
		}
		if(param.dependOffer.dependOffers.length>0){ // 依赖
			for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
				var offerSpecId = param.dependOffer.dependOffers[i];
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}
		}
		if(param.defaultOffer.length>0){ // 默选
			for (var i = 0; i < param.defaultOffer.length; i++) {
				var offerSpecId = param.defaultOffer[i];
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}
		}
		/*if(objType == "OFFER"){
			AttachOffer.addOpenList(prodId,specId); //添加开通附属
			if(param.excludeOffer.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeOffer.length; i++) {
					var excludeSpecId = param.excludeOffer[i];
					var spec = AttachOffer.getSpec(prodId,excludeSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var offer = AttachOffer.getOfferBySpecId(prodId,excludeSpecId);
					if(offer!=undefined){
						var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
						$span.addClass("del");
						offer.isdel = "Y";
					}
				}
			}
			if(param.dependOffer.dependOffers.length>0){ // 依赖
				for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
					var offerSpecId = param.dependOffer.dependOffers[i];
					AttachOffer.addOpenList(prodId,offerSpecId); 
				}
			}
		}else{
			AttachOffer.addOpenServList(prodId,specId); //添加开通功能
			if(param.excludeServ!=undefined && param.excludeServ.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeServ.length; i++) {
					var excludeServSpecId = param.excludeServ[i].servSpecId;
					var spec = CacheData.getServSpec(prodId,excludeServSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var serv = AttachOffer.getServ(prodId,excludeServSpecId);
					if(serv!=undefined){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
			if(param.dependServ!=undefined&&param.dependServ.length>0){ // 依赖
				for (var i = 0; i < param.dependServ.length; i++) {
					var servSpecId = param.dependServ[i].servSpecId;	
					var newSpec = {
						objId : servSpecId, //调用公用方法使用
						servSpecId : servSpecId,
						servSpecName : param.dependServ[i].servSpecName,
						ifParams : param.dependServ[i].ifParams,
						isdel : "C"   //加入到缓存列表没有做页面操作为C
					};
					var inPamam = {
						prodSpecId:servSpecId
					};
					if("Y"  == newSpec.ifParams){
						var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
						if(data==undefined || data.result==undefined){
							return;
						}
						newSpec.prodSpecParams = data.result.prodSpecParams;
					}
					CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
					AttachOffer.addOpenServList(prodId,servSpecId); 
				}
			}
		}*/
	};
	
	//添加到开通列表
	var _addOpenList = function(prodId,offerSpecId){
		if(!_manyPhoneFilter(prodId,offerSpecId)){
			return;
		}
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(offer != undefined){ //在已开通中，需要取消退订
			if(offer.isdel!="Y"){
				var newSpec = _setSpec(prodId,offerSpecId);
				if(newSpec==undefined){ //没有在已开通附属销售列表中
					return;
				}
				if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
					offer.counts++;
					newSpec.counts=offer.counts;
					if(_ifOrderAgain(newSpec)){
						offer.counts--;
						return;
					}
					if(offer.counts<=2){
						var $li=$("#li_"+prodId+"_"+offer.offerId);
						$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.setParam('+prodId+','+offerSpecId+','+1+');"></dd>');
					}
				}
			}else{
				var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
				$span.removeClass("del");
				offer.isdel = "N";
			}
			return;
		}
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		if(newSpec.isdel=="C"){ //没有在已开通附属销售列表中，但是已经加载到缓存
			if(_ifOrderAgain(newSpec)){
				return;
			}
			var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			var $li = $('<li id="li_'+prodId+'_'+offerSpecId+'"></li>');
			if(newSpec.ifDault==0){ //必须
				$li.append('<dd class="mustchoose"></dd>');	
			}else {
				$li.append('<dd class="delete" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')"></dd>');	
			}
			$li.append('<span>'+newSpec.offerSpecName+'</span>');
			if(newSpec.ifParams){
				if(CacheData.setParam(prodId,newSpec)){ 
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}else {
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}
			}
			if(newSpec.ifShowTime=="Y"){
				$li.append('<dd class="time" id="time_'+prodId+'_'+offerSpecId+'" onclick="AttachOffer.showTime('+prodId+','+offerSpecId+',\''+newSpec.offerSpecName+'\');"></dd>');
			}
			if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
				$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" onclick="AttachOffer.setParam('+prodId+','+offerSpecId+');"></dd>');
			}
			$("#open_ul_"+prodId).append($li);
			newSpec.isdel = "N";
		}else if((newSpec.isdel=="Y")) { 
			var $span = $("#li_"+prodId+"_"+offerSpecId).find("span");
			$span.removeClass("del");
			newSpec.isdel = "N";
		}else if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
			newSpec.counts++;
			if(_ifOrderAgain(newSpec)){
				newSpec.counts--;
				return;
			}
//			if(newSpec.counts>=2){
//				var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
//				$spec.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.setParam('+prodId+','+offerSpecId+');"></dd>');
//			}
			
		}else {  //容错处理 //if((newSpec.isdel=="N")) 
			var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			var $li = $('<li id="li_'+prodId+'_'+offerSpecId+'"></li>');
			if(newSpec.ifDault==0){ //必须
				$li.append('<dd class="mustchoose"></dd>');	
			}else {
				$li.append('<dd class="delete" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')"></dd>');	
			}
			$li.append('<span>'+newSpec.offerSpecName+'</span>');
			if (newSpec.ifParams){
				if(CacheData.setParam(prodId,newSpec)){ 
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}else {
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}
			}
			if(newSpec.ifShowTime=="Y"){
				$li.append('<dd class="time" id="time_'+prodId+'_'+offerSpecId+'" onclick="AttachOffer.showTime('+prodId+','+offerSpecId+',\''+newSpec.offerSpecName+'\');"></dd>');
			}
			$("#open_ul_"+prodId).append($li);
		}
		
		//获取销售品节点校验销售品下功能产品的互斥依赖
		if(newSpec!=undefined){
			$.each(newSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.objType==4 && this.selQty!=2){
						var ifParams = "N";
						if(ec.util.isArray(this.prodSpecParams)){
							ifParams = "Y";
						}
						_addOpenServList(prodId,this.objId,this.objName,ifParams);
						if(this.minQty>0){
							_minQtyFileter(prodId,this.objId);
						}
					}
				});
			});
		}
		if(ec.util.isArray(newSpec.agreementInfos)){ //合约销售品需要输入终端
			if(OrderInfo.actionFlag!=14){//非购机入口的
				totalNums=0;
//				OrderInfo.attach2Coupons.splice(0,OrderInfo.attach2Coupons.length);
//				OrderInfo.attach2Coupons=[];//清除串码组
				_removeAttach2Coupons(prodId,newSpec.offerSpecId);//清除串码组
//				AttachOffer.terminalGroups=[];//清除终端组缓存
//				$.each(newSpec.agreementInfos,function(){
//					AttachOffer.terminalGroups.push(this.terminalGroups);//兼容多个agreementInfos，一般不会有多个的。
//				});
				var objInstId = prodId+'_'+newSpec.offerSpecId;
				//一个终端对应一个ul
				var $ul = $('<ul id="terminalUl_'+objInstId+'" class="fillin show"></ul>');
				var $sel = $('<select id="terminalSel_'+objInstId+'"></select>');  
				var $li1 = $('<li class="full"><label style="width:auto; margin:0px 10px;"><span style="color:#71AB5A;font-size:16px">'+newSpec.offerSpecName+'</span></label></li>');
				
				var $li2 = $('<li style="display:none;"><label> 可选终端规格：</label></li>'); //隐藏
				$.each(newSpec.agreementInfos,function(){
					var $option = $('<option value="'+this.terminalModels+'" price="'+this.agreementPrice+'">'+this.terminalName+'</option>');
					$sel.append($option);
				});
				$li2.append($sel).append('<label class="f_red">*</label>');
				
				var minNum=newSpec.agreementInfos[0].minNum;
				var maxNum=newSpec.agreementInfos[0].maxNum;
				var $li3=$('<ul></ul>');
				var isFastOffer = 0 ;
				if(ec.util.isArray(newSpec.extAttrParams)){
					$.each(newSpec.extAttrParams,function(){
						if(this.attrId == CONST.OFFER_FAST_FILL){
							isFastOffer = 1;
							return false;
						}
					});
				}
				for(var i=0;i<newSpec.agreementInfos.length;i++){
					var agreementInfo=newSpec.agreementInfos[i];
//					for(var j=0;j<agreementInfo.terminalGroups.length;j++){
//						var terminalGroupId=agreementInfo.terminalGroups[j].terminalGroupId;//终端组
//						var terminalMinNum=agreementInfo.terminalGroups[j].terminalMinNum;
//						var terminalMaxNum=agreementInfo.terminalGroups[j].terminalMaxNum;
						var $ulGroups=$('<ul id="ul_'+objInstId+'" class="fillin show"></ul>');
						var $liGroups = $('<li class="full"><label> 终端：</label></li>');
						var $selTerms = $('<select style="display:none;" id="'+objInstId+'"></select>');
						var $selTermGroups = $('<select style="display:none;" id="group_'+objInstId+'"></select>');
						if(ec.util.isArray(agreementInfo.terminalGroups)){ //如果有配置终端组，则拼接终端组的规格ID和包含的终端规格ID
							for(var j=0;j<agreementInfo.terminalGroups.length;j++){
								var $optionTermGroups=$('<option value="'+agreementInfo.terminalGroups[j].terminalGroupId+'" terminalMaxNum="'+agreementInfo.terminalGroups[j].terminalMaxNum+'" terminalMinNum="'+agreementInfo.terminalGroups[j].terminalMinNum+'">'+agreementInfo.terminalGroups[j].terminalGroupId+'</option>');
								$selTermGroups.append($optionTermGroups);
								if(ec.util.isArray(agreementInfo.terminalGroups[j].terminalGroup)){
									$.each(agreementInfo.terminalGroups[j].terminalGroup,function(){
										var $optionTerms=$('<option value="'+this.terminalModels+'" price="'+this.terminalPrice+'">'+this.terminalName+'</option>');
										$selTerms.append($optionTerms);
									});
								}
							}
						}
						if(ec.util.isArray(agreementInfo.terminals)){ //如果是直接配置终端规格（旧数据），则拼接终端规格ID
							$.each(agreementInfo.terminals,function(){
								var $optionTerms=$('<option value="'+this.terminalModels+'" price="'+this.terminalPrice+'">'+this.terminalName+'</option>');
								$selTerms.append($optionTerms);
							});
						}
						
						$liGroups.append($selTerms).append($selTermGroups);
						if(maxNum>newSpec.agreementInfos[0].minNum){
							var $strAdd=$('<input id="terminalAddBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="0" onclick="AttachOffer.addAndDelTerminal(this)" value="添加" class="purchase" style="float:left"></input>');
							var $strDel=$('<input id="terminalDelBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="1" onclick="AttachOffer.addAndDelTerminal(this)" value="删除" class="purchase" style="float:left"></input>');
							$liGroups.append($strAdd).append($strDel);
						}
						$ulGroups.append($liGroups);
//						if(minNum<=0){
//							$li3.append($ulGroups);
//							break;
//						}
//						if(minNum<terminalMinNum){
//							terminalMinNum=minNum;
//						}
						for(var k=1;k<=minNum;k++){
							var $liTerminal=$('<li><label>终端校验：</label><input id="terminalText_'+objInstId+'_'+k+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
									+'<input id="terminalBtn_'+objInstId+'_'+k+'" type="button" num="'+k+'" flag="'+isFastOffer+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)" value="校验" class="purchase" style="float:left"></input></li>');
							var	$li4 = $('<li id="terminalDesc_'+k+'" style="white-space:nowrap;"><label></label><label id="terminalName_'+k+'"></label></li>');
							
							$ulGroups.append($liTerminal).append($li4);
						}
						$li3.append($ulGroups);
						totalNums+=minNum;
//					}
				}
				var $div = $("#terminalDiv_"+prodId);
				$ul.append($li1).append($li2).append($li3).appendTo($div);
				$div.show();
				if(newSpec.agreementInfos[0].minNum>0){//合约里面至少要有一个终端
					newSpec.isTerminal = 1;
				}
			}else if(OrderInfo.actionFlag==14){
					var objInstId = prodId+'_'+newSpec.offerSpecId;
					var terminalUl=$("#terminalUl_"+objInstId);//如果有就不添加串码框了，防止重复
					if(terminalUl.length>0){
						return;
					}
					//一个终端对应一个ul
					var $ul = $('<ul id="terminalUl_'+objInstId+'" class="fillin show"></ul>');
					var $sel = $('<select id="terminalSel_'+objInstId+'"></select>');  
					var $li1 = $('<li class="full"><label style="width:auto; margin:0px 10px;"><span style="color:#71AB5A;font-size:16px">'+newSpec.offerSpecName+'</span></label></li>');
					var $li2 = $('<li style="display:none;"><label> 可选终端规格：</label></li>'); //隐藏
					$.each(newSpec.agreementInfos,function(){
						var $option = $('<option value="'+this.terminalModels+'" price="'+this.agreementPrice+'">'+this.terminalName+'</option>');
						$sel.append($option);
					});
					$li2.append($sel).append('<label class="f_red">*</label>');
					var $li3 = $('<li><label>终端校验：</label><input id="terminalText_'+objInstId+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
							+'<input id="terminalBtn_'+objInstId+'" type="button" onclick="AttachOffer.checkTerminalCode('+prodId+','+newSpec.offerSpecId+')" value="校验" class="purchase" style="float:left"></input></li>');	
					/*var $li4 = $('<li id="terRes_'+objInstId+'" class="full" style="display: none;" >'
							+'<label style="width:auto; margin:0px 10px;">终端名称：<span id="terName_'+objInstId+'" ></span></label>'
							+'<label style="width:auto; margin:0px 10px;">终端串码：<span id="terCode_'+objInstId+'" ></span></label>'
							+'<label style="width:auto; margin:0px 10px;">终端价格：<span id="terPrice_'+objInstId+'" ></span></label></li>');*/
					var $div = $("#terminalDiv_"+prodId);
					var $li4 = $('<li id="terminalDesc" style="display:none;white-space:nowrap;"><label> 终端规格：</label><label id="terminalName"></label></li>');
					$ul.append($li1).append($li2).append($li3).append($li4).appendTo($div);
					$div.show();
					newSpec.isTerminal = 1;
					
					for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
						var coupon = OrderInfo.attach2Coupons[i];
						if(prodId==coupon.prodId){
							$("#terminalSel_"+objInstId).val(coupon.couponId);
							$("#terminalSel_"+objInstId).attr("disabled",true);
							$("#terminalText_"+objInstId).val(coupon.couponInstanceNumber);
							$("#terminalText_"+objInstId).attr("disabled",true);
							$("#terminalBtn_"+objInstId).hide();
						}
					}
				}
			//}
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
			mktResId : resId,
			termGroup : terminalGroupId   //update by huangjj #13336需求资源要求这个参数不传
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
			$.alert("信息提示",data.message);
//			$("#terminalSel_"+objInstId).val(data.mktResId);
//			$("#terminalName").html(data.mktResName);
//			$("#terminalDesc").css("display","block");
//			var price = $("#terminalSel_"+objInstId).find("option:selected").attr("price");
			
			
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
	
	//添加到开通列表
	var _addOpenServList = function(prodId,servSpecId,servSpecName,ifParams){
		//从已开通功能产品中找
		var serv = CacheData.getServBySpecId(prodId,servSpecId); 
		if(serv != undefined){
			$("#li_"+prodId+"_"+serv.servId).find("span").removeClass("del");
			serv.isdel = "N";
			return;
		}
		//从已选择功能产品中找
		var spec = CacheData.getServSpec(prodId,servSpecId);
//		if(OrderInfo.actionFlag==22){
//			spec = undefined;
//		}
		if(spec == undefined){
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : servSpecName,
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
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			spec = newSpec;
		} 
		if(spec.isdel == "C"){  //没有订购过
			$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
			var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
			if(spec.ifDault==0){ //必须
				$li.append('<dd class="mustchoose"></dd>');	
			}else {
				$li.append('<dd class="delete" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+servSpecName+'\',\''+ifParams+'\')"></dd>');
			}
			$li.append('<span>'+spec.servSpecName+'</span>');
			if (spec.ifParams=="Y"){
				if(CacheData.setServParam(prodId,spec)){ 
					$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
				}else {
					$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
				}
			}
			$("#open_serv_ul_"+prodId).append($li);
		}else {
			$("#li_"+prodId+"_"+servSpecId).find("span").removeClass("del");
		}
		spec.isdel = "N";
		_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
	};
	
	//现在主销售品参数
	var _showMainParam = function(){
		var content = CacheData.getParamContent(-1,OrderInfo.offerSpec,0);
		$.confirm("参数设置： ",content,{ 
			yes:function(){	
				
			},
			no:function(){
				
			}
		});
		$('#paramForm').bind('formIsValid', function(event, form) {
		}).ketchup({bindElement:"easyDialogYesBtn"});
	};
	
	//显示参数
	var _showParam = function(prodId,offerSpecId,flag){	
		if(flag==1){ //显示已订购附属		
			var offer = CacheData.getOfferBySpecId(prodId,offerSpecId);
			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offer.offerId	
				};
				param.acctNbr = OrderInfo.getAccessNumber(prodId);
				var data = uiOfferQuery.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				offer.offerMemberInfos = data.offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			if(!offer.isGetParam){  //已订购附属没有参数，需要获取销售品参数
				var param = {   
				    offerTypeCd : "2",
				    offerId: offer.offerId,
				    offerSpecId : offer.offerSpecId
				};
				var offerParam = query.offer.queryOfferParam(param); //重新获取销售品参数
				if(offerParam==undefined){
					return;
				}else{
					offer.offerParamInfos = offerParam.offerParamInfos;
					offer.isGetParam = true;
				}
			}
			var content = CacheData.getParamContent(prodId,offer,flag);
			$.confirm("参数设置： ",content,{ 
				yes:function(){		
				},
				no:function(){
				}
			});
			order.protocolnbr.init();
			$('#paramForm').bind('formIsValid', function(event, form) {
				//参数输入校验
				if(!paramInputCheck()){
					return;
				}
				var isset = false;
				$.each(offer.offerSpec.offerSpecParams,function(){
					var itemInfo = CacheData.getOfferParam(prodId,offer.offerId,this.itemSpecId);
					if(itemInfo.itemSpecId == CONST.ITEM_SPEC.PROT_NUMBER){
						itemInfo.setValue = $("#select1").val();
					}else{
					    itemInfo.setValue = $("#"+prodId+"_"+this.itemSpecId).val();
					}
					if(itemInfo.value!=itemInfo.setValue){
						itemInfo.isUpdate = "Y";
						isset = true;
					}
				});
				if(isset){
					$("#can_"+prodId+"_"+offer.offerId).removeClass("canshu").addClass("canshu2");
					offer.isset = "Y";
					offer.update = "Y";
				}else{
					$("#can_"+prodId+"_"+offer.offerId).removeClass("canshu2").addClass("canshu");
					offer.isset = "N";
					offer.update = "N";
				}
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});		
		}else {
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			if(spec == undefined){  //未开通的附属销售品，需要获取销售品构成
				spec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
				if(!spec){
					return;
				}
			}
			var content = CacheData.getParamContent(prodId,spec,flag);	
			$.confirm("参数设置： ",content,{ 
				yes:function(){
				},
				no:function(){
				}
			});
			order.protocolnbr.init();
			$('#paramForm').bind('formIsValid', function(event, form){
				//参数输入校验
				if(!paramInputCheck()){
					return;
				}
				if(!!spec.offerSpecParams){
					for (var i = 0; i < spec.offerSpecParams.length; i++) {
						var param = spec.offerSpecParams[i];
						var itemSpec = CacheData.getSpecParam(prodId,offerSpecId,param.itemSpecId);
						if(itemSpec.itemSpecId == CONST.ITEM_SPEC.PROT_NUMBER){
							itemSpec.setValue = $("#select1").val();
						}else{
							itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
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
									var prodItem = CacheData.getProdSpecParam(prodId,offerSpecId,prodParam.itemSpecId);
									prodItem.value = $("#"+prodId+"_"+prodParam.itemSpecId).val();
								}
							}
						}
					}
				}
				$("#can_"+prodId+"_"+offerSpecId).removeClass("canshu").addClass("canshu2");
				var attchSpec = CacheData.getOfferSpec(prodId,offerSpecId);
				attchSpec.isset = "Y";
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});	
		}
	};
	
	//显示服务参数
	var _showServParam = function(prodId,servSpecId,flag){
		if(flag==1){ //显示已订购附属
			var serv = CacheData.getServBySpecId(prodId,servSpecId);
			var param = {
				prodId : serv.servId,
				ifServItem:"Y"
			};
			if(!serv.isGetParamSpec){  //已订购附属没有参数，需要获取销售品参数	
				param.prodSpecId = serv.servSpecId;
				var dataSepc = query.prod.prodSpecParamQuery(param); //重新获取销售品参数
				if(dataSepc==undefined){
					return;
				}else{
					serv.prodSpecParams = dataSepc.result.prodSpecParams;
					serv.isGetParamSpec = true;
				}
			}
			if(!serv.isGetParamInst){  //已订购附属没有参数，需要获取销售品参数
				var data = query.prod.prodInstParamQuery(param); //重新获取销售品参数
				if(data==undefined){
					return;
				}else{
					serv.prodInstParams = data.result.prodInstParams;
					serv.isGetParamInst = true;
				}
			}
			var content = CacheData.getParamContent(prodId,serv,3);
			
			if(OrderInfo.isGroupProSpecId(serv.servSpecId)){//群功能产品
				ec.form.dialog.createDialog({
					"id":"-group",
					"width":"370",
					"height":"440",
					"initCallBack":function(dialogForm,dialog){
						AttachOffer.dialogForm=dialogForm;
						AttachOffer.dialog=dialog;
						$("#div_group").empty();
						$("#div_group").append(content);
						$("#div_group_btn").empty();
						var str='<a href="javascript:void(0)" id="ok_btn" class="btn_h30"><span>确认</span></a>'
						+'<a href="javascript:void(0);" id="cancel_btn" class="btn_h30" style="margin-left:20px;"><span>取消</span></a>';
						$("#div_group_btn").append(str);
						//绑定确定按钮click事件
						$("#ok_btn").off("click").on("click",function(event){
							_groupInistOkBtn(prodId,servSpecId);
						});
						$("#cancel_btn").off("click").on("click",function(event){
							_closeDialog();
						});
					},
					"submitCallBack":function(dialogForm,dialog){
						
					},
					"closeCallBack":function(dialogForm,dialog){
					}
				});
				return;
			}
			
			$.confirm("参数设置： ",content,{ 
				yes:function(){	
					
				},
				no:function(){
					
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form) {
				var isset = false;
				$.each(serv.prodSpecParams,function(){
					var prodItem = CacheData.getServInstParam(prodId,serv.servId,this.itemSpecId);
					prodItem.setValue = $("#"+prodId+"_"+this.itemSpecId).val();	
					if(prodItem.value!=prodItem.setValue){
						prodItem.isUpdate = "Y";
						isset = true;
					}
				});
				if(isset){
					$("#can_"+prodId+"_"+serv.servId).removeClass("canshu").addClass("canshu2");
					serv.isset = "Y";
					serv.update = "Y";
				}else{
					$("#can_"+prodId+"_"+serv.servId).removeClass("canshu2").addClass("canshu");
					serv.isset = "N";
					serv.update = "N";
				}
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
		
		}else {
			var spec = CacheData.getServSpec(prodId,servSpecId);
			if(spec == undefined){  //未开通的附属销售品，需要获取销售品构成
				return;
			}
			var content = CacheData.getParamContent(prodId,spec,2);	
			
			if(OrderInfo.isGroupProSpecId(spec.servSpecId)){//群功能产品
				ec.form.dialog.createDialog({
					"id":"-group",
					"width":"370",
					"height":"440",
					"initCallBack":function(dialogForm,dialog){
						AttachOffer.dialogForm=dialogForm;
						AttachOffer.dialog=dialog;
						$("#div_group").empty();
						$("#div_group").append(content);
						$("#div_group_btn").empty();
						var str='<a href="javascript:void(0)" id="ok_btn" class="btn_h30"><span>确认</span></a>'
						+'<a href="javascript:void(0);" id="cancel_btn" class="btn_h30" style="margin-left:20px;"><span>取消</span></a>';
						$("#div_group_btn").append(str);
						//绑定确定按钮click事件
						$("#ok_btn").off("click").on("click",function(event){
							_groupOkBtn(prodId,servSpecId);
						});
						$("#cancel_btn").off("click").on("click",function(event){
							_closeDialog();
						});
					},
					"submitCallBack":function(dialogForm,dialog){
						
					},
					"closeCallBack":function(dialogForm,dialog){
					}
				});
				return;
			}
			
			$.confirm("参数设置： ",content,{ 
				yes:function(){
				},
				no:function(){	
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form){
				if(!!spec.prodSpecParams){
					for (var i = 0; i < spec.prodSpecParams.length; i++) {
						var param = spec.prodSpecParams[i];
						var itemSpec = CacheData.getServSpecParam(prodId,servSpecId,param.itemSpecId);
						itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
					}
				}
				$("#can_"+prodId+"_"+servSpecId).removeClass("canshu").addClass("canshu2");
				var attchSpec = CacheData.getServSpec(prodId,servSpecId);
				attchSpec.isset = "Y";
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
		}
	};
	
	//已选群功能产品确定按钮
	var _groupOkBtn=function(prodId,servSpecId){
		var spec = CacheData.getServSpec(prodId,servSpecId);
		var flag=true;
		if(!!spec.prodSpecParams){
			for (var i = 0; i < spec.prodSpecParams.length; i++) {
				var param = spec.prodSpecParams[i];
				var itemSpec = CacheData.getServSpecParam(prodId,servSpecId,param.itemSpecId);
				itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
				if(!ec.util.isObj(itemSpec.setValue)){
					$.alert("信息提示",param.name+"不能为空");
					flag=false;
					break;
				}
			}
		}
		if(flag){
			$("#can_"+prodId+"_"+servSpecId).removeClass("canshu").addClass("canshu2");
			var attchSpec = CacheData.getServSpec(prodId,servSpecId);
			attchSpec.isset = "Y";
			easyDialog.close();
//			_closeDialog();
		}
	};
	
	//已订购群功能产品确定按钮
	var _groupInistOkBtn=function(prodId,servSpecId){
		var serv = CacheData.getServBySpecId(prodId,servSpecId);
		var isset = false;
		$.each(serv.prodSpecParams,function(){
			var prodItem = CacheData.getServInstParam(prodId,serv.servId,this.itemSpecId);
			prodItem.setValue = $("#"+prodId+"_"+this.itemSpecId).val();	
			if(prodItem.value!=prodItem.setValue){
				prodItem.isUpdate = "Y";
				isset = true;
			}
		});
			if(isset){
				$("#can_"+prodId+"_"+serv.servId).removeClass("canshu").addClass("canshu2");
				serv.isset = "Y";
				serv.update = "Y";
			}else{
				$("#can_"+prodId+"_"+serv.servId).removeClass("canshu2").addClass("canshu");
				serv.isset = "N";
				serv.update = "N";
			}
			_closeDialog();
	};
	
	var _closeDialog = function() {
		if(AttachOffer.dialogForm!=undefined&&AttachOffer.dialog!=undefined){
			AttachOffer.dialogForm.close(AttachOffer.dialog);
		}
	};
	
	//（销售品）参数输入校验（服务参数暂未使用）
	var paramInputCheck = function(){
		var pass = true;
		$("#paramForm").find("input[type=text]").each(function(){
			var mask = $(this).attr("mask");
			var maskmsg = $(this).attr("maskmsg");
			if(mask!=null && mask!="" && mask.substring(0,1)=="/" && mask.substring(mask.length-1,mask.length)=="/"){
				if(!eval(mask).test($(this).val())){
					$.alert("提示",maskmsg);
					pass = false;
					return false;
				}
			}
		});
		return pass;
	};
	
	//销售品生失效时间显示
	var _showTime = function(prodId,offerSpecId,offerSpecName){	
		var data = OrderInfo.getPrivilege("EFF_TIME");		
		$('#attachName').text(offerSpecName+"--生失效设置");
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		_initTime(spec);
		easyDialog.open({
			container : "div_time_dialog"
		});
		$("#timeSpan").off("click").on("click",function(){
			_setAttachTime(prodId,offerSpecId);
		});
		if(data==0){
			$("#startTimeTr").show();
			$("#endTimeTr").show();
		}else{
			$("#startTimeTr").hide();
			$("#endTimeTr").hide();
		}
	};
	
	//销售品生效时间显示
	var _showStartTime = function(){	
		var strDate =DateUtil.Format("yyyy年MM月dd日",new Date());
		var endDate = $("#endDt").val();
		if(endDate ==""){
			$.calendar({minDate:strDate});
		}else{
			$.calendar({minDate:strDate,maxDate:endDate});
		}
	};
	
	//销售品失效时间显示
	var _showEndTime = function(){	
		var strDate = $("#startDt").val();
		if(strDate==""){
			strDate =DateUtil.Format("yyyy年MM月dd日",new Date());
		}
		$.calendar({minDate:strDate});
	};
	
	//初始化时间设置页面
	var _initTime = function(spec){
		if(spec!=undefined && spec.ooTimes!=undefined){
			var ooTime = spec.ooTimes;
			$("input[name=startTimeType][value='"+ooTime.startType+"']").attr("checked","checked");
			$("input[name=endTimeType][value='"+ooTime.endType+"']").attr("checked","checked");
			$("#startDt").val("");
			$("#endDt").val("");
			$("#endTime").val("");
			if(ooTime.startType == 4){ //指定生效时间
				$("#startDt").val(ooTime.startDt);
			}
			if(ooTime.endType == 4){ //指定失效时间
				$("#endDt").val(ooTime.endDt);
			}else if(ooTime.endType == 5){  //有效时长
				$("#endTime").val(ooTime.effTime);
				$("#endTimeUnit").val(ooTime.effTimeUnitCd);
			}
		}else {
			$("input[name=startTimeType][value=1]").attr("checked","checked");
			$("input[name=endTimeType][value=1]").attr("checked","checked");
			$("#startDt").val("");
			$("#endDt").val("");
			$("#endTime").val("");
		}
	};
	
	//显示主套餐时间
	var _showOfferTime = function(){
		var data = OrderInfo.getPrivilege("EFF_TIME");		
		$('#attachName').text(OrderInfo.offerSpec.offerSpecName+"-生失效设置");
		_initTime(OrderInfo.offerSpec);
		easyDialog.open({
			container : "div_time_dialog"
		});
		$("#timeSpan").off("click").on("click",function(){
			_setMainTime();
		});
		if(data==0){
			$("#startTimeTr").show();
			$("#endTimeTr").show();
		}else{
			$("#startTimeTr").hide();
			$("#endTimeTr").hide();
		}
	};
	
	//显示主套餐构成
	var _showMainMember = function(){
		$('#memberName').text(OrderInfo.offerSpec.offerSpecName+"-构成");
		$("#main_member_div").empty();
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.memberRoleCd == CONST.MEMBER_ROLE_CD.CONTENT){
				var $ul = $('</div><ul id="serv_ul_'+prodId+'"></ul>');
				var $div = $('<div id="serv_div_'+prodId+'" class="fs_choosed"></div>');
				$("#main_member_div").append("<h4>"+this.offerRoleName+"</h4>").append($div.append($ul));
				$.each(offerRole.roleObjs,function(){
					var $li = $('<li id="li_'+prodId+'_'+this.objId+'">'+this.objName+'</li>');
					var $checkbox = $('<input type="checkbox" name="serv_check_'+prodId+'" servSpecId="'+this.objId+'"></input>');
					$ul.append($checkbox).append($li);
				});
				$("#main_member_div").append('<div class="clear"></div>');
			}else{
				$.each(offerRole.prodInsts,function(){
					var prodId = this.prodInstId;
					var $ul = $('</div><ul id="serv_ul_'+prodId+'"></ul>');
					var $div = $('<div id="serv_div_'+prodId+'" class="fs_choosed"></div>');
					$("#main_member_div").append("<h4>"+this.offerRoleName+"</h4>").append($div.append($ul));
					$.each(offerRole.roleObjs,function(){
						if(this.objType == CONST.OBJ_TYPE.SERV){
							var $li = $('<li id="li_'+prodId+'_'+this.objId+'">'+this.objName+'</li>');
							var $checkbox = $('<input type="checkbox" name="serv_check_'+prodId+'" servSpecId="'+this.objId+'"></input>');
							$ul.append($checkbox).append($li);		
						}
					});
					$("#main_member_div").append('<div class="clear"></div>');
				});
			}
		});
		easyDialog.open({
			container : "div_member_dialog"
		});
		
		$.each(OrderInfo.offerSpec.offerRoles,function(){  //自动勾选功能产品
			var offerRole = this;
			$.each(offerRole.prodInsts,function(){ //自动勾选接入产品已经选择的功能产品
				var prodInst = this;
				$.each(offerRole.roleObjs,function(){ //根据规格配置勾选默认的功能产品
					var servSpecId = this.objId;
					if(this.minQty>0){ //必选
						$("input[name='serv_check_"+prodInst.prodInstId+"']").each(function(){
							if(servSpecId==$(this).attr("servSpecId")){
								$(this).attr("checked","checked");
								$(this).attr("disabled","disabled");
							}
						});
					}
				});
				if(!!prodInst.servInsts){  
					$.each(prodInst.servInsts,function(){  //遍历产品实例下已经选择的功能产品
						var servSpecId = this.objId;
						$("input[name='serv_check_"+prodInst.prodInstId+"']").each(function(){
							if(servSpecId==$(this).attr("servSpecId")){
								$(this).attr("checked","checked");
							}
						});
					});
				}
			});
		});
		
		$("#memberSpan").off("click").on("click",function(){
			_setMainMember();
		});
	};
	
	//保存主销售品成员
	var _setMainMember = function(){
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			$.each(this.prodInsts,function(){
				var prodInst = this;
				prodInst.servInsts = [];
				$("input[name='serv_check_"+this.prodInstId+"']:checked").each(function(){
					var servSpecId = $(this).attr("servSpecId");
					$.each(offerRole.roleObjs,function(){
						if(this.objId==servSpecId){  //获取选择功能产品的构成
							prodInst.servInsts.push(this);	
						}
					});
				});
			});
		});
		easyDialog.close();
	};
	
	//获取ooTime节点
	var _getTime = function(){
		var ooTime = {
			state : "ADD" 
		};
		//封装生效时间
		var startRadio = $("input[name=startTimeType]:checked").attr("value");
		ooTime.startType = startRadio;
		if(startRadio==1){
			ooTime.isDefaultStart = "Y";
		}else if(startRadio==2){  //竣工生效，不传值
			
		}else if(startRadio==3){  //次月生效
			ooTime.startTime = 1;
			ooTime.startTimeUnitCd = 7;
			//ooTime.startDt = _getNextMonthFirstDate();
		}else if(startRadio==4){ //指定生效时间
			if($("#startDt").val()==""){
				$.alert("提示","指定生效时间不能为空!");
				return;
			}
			ooTime.startDt = $("#startDt").val();
		}
		//封装失效时间
		var endRadio = $("input[name=endTimeType]:checked").attr("value");	
		ooTime.endType = endRadio;
		if(endRadio==1){
			ooTime.isDefaultEnd = "Y";
		}else if(endRadio==4){
			if($("#endDt").val()==""){
				$.alert("提示","指定失效时间不能为空!");
				return;
			}
			ooTime.endDt = $("#endDt").val();
		}else if(endRadio==5){
			var end = $("#endTime").val();
			if(end==""){
				$.alert("提示","有效时长不能为空!");
				return;
			}
			if(isNaN(end)){
				$.alert("提示","有效时长必须为数字!");
				return;
			} 
			if(end<=0){
				$.alert("提示","有效时长必须大于0!");
				return;
			} 
			ooTime.effTime = end;
			ooTime.effTimeUnitCd = $("#endTimeUnit").val();
		}
		return ooTime;
	};
	
	//设置主销售品生失效时间设置
	var _setMainTime = function(){
		var ooTime = _getTime();
		if(ooTime==undefined){
			return;
		}
		OrderInfo.offerSpec.ooTimes = ooTime;
		$("#mainTime").removeClass("time").addClass("time2");
		easyDialog.close();
	};
	
	//设置附属销售品生失效时间设置
	var _setAttachTime = function(prodId,offerSpecId){
		var ooTime = _getTime();
		if(ooTime==undefined){
			return;
		}
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		spec.ooTimes = ooTime;
		$("#time_"+prodId+"_"+offerSpecId).removeClass("time").addClass("time2");
		easyDialog.close();
	};
	
	//获取下个月第一天
	/*var _getNextMonthFirstDate = function(){
		var d = new Date();
		var yyyy = 1900+d.getYear();    
		var MM = d.getMonth()+1;      
		var dd = "01";   
		if(MM==12){
			yyyy++;
			MM = "01";	
		}else if(MM<9){
			MM++;
			MM = "0"+MM;
		}else {
			MM++;
		}
		return yyyy+"-"+MM+"-"+dd; 
	};*/
	
	//切换标签 增加入参flag，当点击子标签时，不对tap隐藏
	var _changeLabel = function(prodId,prodSpecId,labelId,flag){
		$.each(AttachOffer.labelList,function(){ //附属标签显示隐藏
			if(this.prodId==prodId){
				$.each(this.labels,function(){
					if(labelId==""){
						labelId = this.label;
						$("#tab_"+prodId+"_"+this.label).addClass("setcon");
						$("#parentLabel_" + prodId + "_" + this.label).show();
					}else{
						if(labelId == this.label){
							$("#tab_"+prodId+"_"+this.label).addClass("setcon");
							$("#ul_"+prodId+"_"+this.label).show();
							$("#parentLabel_" + prodId + "_" + this.label).show();
						}else{
							$("#tab_"+prodId+"_"+this.label).removeClass("setcon");
							$("#ul_"+prodId+"_"+this.label).hide();
							if (1 != flag) {
								$("#parentLabel_" + prodId + "_" + this.label).hide();
							}
						}
					}
				});
			}
		});
		// 选择流量包时，默认显示第一个子标签的内容，加return是为了避免递归循环
		if(labelId == 100 && "ON" == offerChange.queryPortalProperties("NEW_LABEL_FLAG")) {
 			$("#parentLabel_" + prodId + "_" + labelId + " li:first").click();
			return;
 		}
		var $ul = $("#ul_"+prodId+"_"+labelId); //创建ul
		if($ul[0]==undefined){ //没有加载过，重新加载  
			var queryType = "3";
			if(prodId>0){
				queryType = "";
			}
			if(labelId==CONST.LABEL.SERV){  //功能产品
				var param = {
					prodId : prodId,
					prodSpecId : prodSpecId,
					queryType : queryType,
					labelId : labelId
				};
				var data = query.offer.queryServSpec(param);
				var $ul = $('<ul id="ul_'+prodId+'_'+labelId+'"></ul>');
				if(data!=undefined && data.resultCode == "0"){
					if(ec.util.isArray(data.result.servSpec)){
						var servList = CacheData.getServList(prodId);//过滤已订购
						var servSpecList = CacheData.getServSpecList(prodId);//过滤已选择
						$.each(data.result.servSpec,function(){
							AttachOffer.allOfferList.push(this);
							var servSpecId = this.servSpecId;
							var flag = true;
							$.each(servList,function(){
								if(this.servSpecId==servSpecId&&this.isDel!="C"){
									flag = false;
									return false;
								}
							});
							$.each(servSpecList,function(){
								if(this.servSpecId==servSpecId){
									flag = false;
									return false;
								}
							});
							if(flag){
								var $li = $('<li id="li_'+prodId+'_'+this.servSpecId+'"></li>');
								var $dd = $('<dd class="canchoose" onclick="AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\')"></dd>');
								var $span = $('<span><a href="javascript:AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\')">'+this.servSpecName+'</a></span>');
								var $dd2 = $('<dd class="canshu2" onclick="AttachOffer.offerSpecDetail('+prodId+','+this.servSpecId+')"><img src="'+contextPath+'/image/common/more.png"/></dd>');
								$li.append($dd).append($span).append($dd2).appendTo($ul);
							}
						});
					}
				}
				$("#div_"+prodId).append($ul);
			}else{
				var param = {
					prodSpecId : prodSpecId,
					offerSpecIds : [],
					queryType : queryType,
					prodId : prodId,
					partyId : OrderInfo.cust.custId,
					labelId : labelId,
					ifCommonUse : ""			
				};
				if(OrderInfo.actionFlag == 2){ //套餐变更		
					$.each(OrderInfo.offerSpec.offerRoles,function(){
						if(ec.util.isArray(this.prodInsts)){
							$.each(this.prodInsts,function(){
								if(this.prodInstId==prodId){
									param.acctNbr = this.accessNumber;
									param.offerRoleId = this.offerRoleId;
									param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);	
									return false;
								}
							});
						}
					});
				}else if(OrderInfo.actionFlag == 3 || OrderInfo.actionFlag == 22){  //可选包
					var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
					param.acctNbr = prodInfo.accNbr;
					if(!ec.util.isObj(prodInfo.prodOfferId)){
						prodInfo.prodOfferId = "";
					}
					var offerRoleId = CacheData.getOfferMember(prodInfo.prodInstId).offerRoleId;
					if(offerRoleId==undefined){
						offerRoleId = "";
					}
					param.offerRoleId = offerRoleId;
					param.offerSpecIds.push(prodInfo.prodOfferId);
				}else if(OrderInfo.actionFlag == 21){ //副卡套餐变更		
					$.each(OrderInfo.viceOfferSpec,function(){
						var offerSpecId=this.offerSpecId;
						var accessNumber=this.accessnumber;
						if(this.prodId==prodId){
							$.each(this.offerRoles,function(){
								if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD || this.memberRoleCd=="1"){
									$.each(this.roleObjs,function(){
										if(this.objType==CONST.OBJ_TYPE.PROD){
											param.acctNbr = accessNumber;
											param.offerRoleId = this.offerRoleId;
											param.offerSpecIds.push(offerSpecId);	
											return false;
										}
									});
								}
							});
						}
					});
				}else if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
							$.each(OrderInfo.oldofferSpec,function(){
								if(this.accNbr==OrderInfo.oldprodInstInfos[i].accNbr){
									param.offerSpecIds.push(this.offerSpec.offerSpecId);	
									$.each(this.offerSpec.offerRoles,function(){
										if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
											param.offerRoleId = this.offerRoleId;
										}
									});
								}
							});
						}
					}
				}else { //新装
					param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
					var prodInst = OrderInfo.getProdInst(prodId);
					if(prodInst){
						param.offerRoleId = prodInst.offerRoleId;
					}
				}
				query.offer.queryCanBuyAttachSpec(param,function(data){
					var $ul = $('<ul id="ul_'+prodId+'_'+labelId+'"></ul>');
					if(data!=undefined && data.resultCode == "0"){
						if(ec.util.isArray(data.result.offerSpecList)){
							var offerList = CacheData.getOfferList(prodId); //过滤已订购
							var offerSpecList = CacheData.getOfferSpecList(prodId);//过滤已选择
							$.each(data.result.offerSpecList,function(){
								AttachOffer.allOfferList.push(this);
								var offerSpecId = this.offerSpecId;
								var flag = true;
								var ifOrderAgain=this.ifOrderAgain;//是否可以重复订购
								$.each(offerList,function(){
									if(this.offerSpecId==offerSpecId&&this.isDel!="C"&&ifOrderAgain!="Y"){
										flag = false;
										return false;
									}
								});
								$.each(offerSpecList,function(){
									if(this.offerSpecId==offerSpecId&&ifOrderAgain!="Y"){
										flag = false;
										return false;
									}
								});
								if(flag){
									var $li = $('<li id="li_'+prodId+'_'+this.offerSpecId+'"></li>');
									if(ec.util.isObj(ifOrderAgain)&&ifOrderAgain=="Y"){
										$li = $('<li id="li_'+prodId+'_'+this.offerSpecId+'_'+ifOrderAgain+'"></li>');
									}
									var $dd = $('<dd class="canchoose" onclick="AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')"></dd>');
									var $span = $('<span><a href="javascript:AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')" >'+this.offerSpecName+'</a></span>');
									var $dd2 = $('<dd class="canshu2" onclick="AttachOffer.offerSpecDetail('+prodId+','+this.offerSpecId+')"><img src="'+contextPath+'/image/common/more.png"/></dd>');
									$li.append($dd).append($span).append($dd2).appendTo($ul);
								}
							});
						}
					}
					$("#div_"+prodId).append($ul);
				});
			}
		}
	};
	
	//开通跟取消开通功能产品时判断是否显示跟隐藏补换卡
	var _showHideUim = function(flag,prodId,servSpecId){
		if(CONST.getAppDesc()==0 && servSpecId == CONST.PROD_SPEC.PROD_FUN_4G){ //4G系统并且是开通或者关闭4g功能产品
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){//套餐变更
				prodClass = CacheData.getOfferMember(prodId).prodClass;
			}else if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){
				for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
					if(prodId == OrderInfo.oldprodInstInfos[i].prodInstId){
						prodClass = OrderInfo.oldprodInstInfos[i].prodClass;
					}
				}
			}
			if(flag==0){ //开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡需要补卡
					$("#title_"+prodId).show();
					$("#uimDiv_"+prodId).show();
				}
			}else if(flag==1){//取消开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡，已经显示补卡,判断是否隐藏补卡
					$("#uimDiv_"+prodId).hide();
				}
			}
		}
	};
	
	//判断是否需要补卡
	var _isChangeUim = function(objId){
		if(CONST.getAppDesc()==0){
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			var prodId = order.prodModify.choosedProdInfo.prodInstId;
			if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){//套餐变更
				var member = CacheData.getOfferMember(objId);
				prodClass = member.prodClass;
				prodId = member.objInstId;
			}else if(OrderInfo.actionFlag==6 && ec.util.isArray(OrderInfo.oldprodInstInfos)){
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==objId){
						prodClass = this.prodClass;
						prodId = this.prodInstId;
					}
				});
			}
			if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡，已经显示补卡,判断是否隐藏补卡
				var servSpec = CacheData.getServSpec(prodId,CONST.PROD_SPEC.PROD_FUN_4G);
				if(servSpec!=undefined && servSpec.isdel != "Y" && servSpec.isdel != "C"){ //有开通4G功能产品
					return true;
				}
			}
		}
		return false;
	};
	
	//获取附属销售品节点
	var _setAttachBusiOrder = function(busiOrders){
		//遍历已选功能产品列表
		$.each(AttachOffer.openServList,function(){
			var prodId = this.prodId;
			$.each(this.servSpecList,function(){
				if(this.isdel != "Y" && this.isdel != "C"){  //订购的功能产品  && _getRelaType(this.servSpecId)!="1000"
					SoOrder.createServ(this,prodId,0,busiOrders);
				}
			});
		});
		//遍历已订购功能产品列表
		$.each(AttachOffer.openedServList,function(){
			var prodId = this.prodId;
			$.each(this.servList,function(){
				if(this.isdel == "Y"){  //关闭功能产品
					SoOrder.createServ(this,prodId,1,busiOrders);
				}else {
					if(this.update=="Y"){  //变更功能产品
						SoOrder.createServ(this,prodId,2,busiOrders);
					}
				}
			});
		});
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C"){  //订购的附属销售品
					if(ec.util.isObj(spec.counts)){//组装重复订购的可选包
						for(var k=0;k<spec.counts;k++){
							SoOrder.createAttOffer(spec,open.prodId,0,busiOrders);
						}
					}else{
						SoOrder.createAttOffer(spec,open.prodId,0,busiOrders);
					}
				}
			}
		}
		//遍历已订购附属销售品列表
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			for ( var j = 0; j < opened.offerList.length; j++) {  //遍历当前产品下面的附属销售品
				var offer = opened.offerList[j];
				if(offer.isdel == "Y"){  //退订的附属销售品
					if(ec.util.isObj(offer.counts)){//组装重复订购的可选包
						for(var k=0;k<offer.orderCount;k++){
							offer.offerId=offer.offerIds[k];
							SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
						}
					}else{
						SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
					}
				}else if(offer.update=="Y"){//修改附属销售品
					SoOrder.createAttOffer(offer,opened.prodId,2,busiOrders);
				}else if(ec.util.isObj(offer.orderCount)&&ec.util.isObj(offer.counts)){
					if(offer.orderCount>offer.counts){//退订附属销售品
						for(var k=0;k<(offer.orderCount-offer.counts);k++){
							offer.offerId=offer.offerIds[k];
							SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
						}
					}else if(offer.orderCount<offer.counts){//订购附属销售品
						var spec = CacheData.getOfferSpec(opened.prodId,offer.offerSpecId);
						for(var k=0;k<(offer.counts-offer.orderCount);k++){
							SoOrder.createAttOffer(spec,opened.prodId,0,busiOrders);
						}
					}
					
				}
			}
		}
		
		//遍历已选增值业务
		$.each(AttachOffer.openAppList,function(){
			var prodId = this.prodId;
			$.each(this.appList,function(){
				if(this.dfQty==1){  //开通增值业务
					SoOrder.createServ(this,prodId,0,busiOrders);
				}
			});
		});
	};
	//把对比省预校验的后有变动的 功能产品和可选包 放入临时缓存列表中
	var _setChangeList=function(prodId){
		AttachOffer.changeList=[];//清空
		var prodInfos = offerChange.resultOffer.prodInfos;//预校验返回的功能产品
		if(ec.util.isArray(prodInfos)){
			$.each(prodInfos,function(){
//				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
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
					var param={
						prodInstId:prodId
					};
					var serv = CacheData.getServ(prodId,this.prodInstId);//在已开通的功能产品里面查找
					var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
					if(this.state=="DEL"){
						if(serv!=undefined && serv.isdel != "Y"){
							param.objId=this.prodInstId;
							param.status=(serv.isdel!=undefined?serv.isdel:"N");
							param.objIdType=1;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							serv.isdel = "Y";
							AttachOffer.changeList.push(param);
						}else if(servSpec!=undefined && servSpec.isdel !="Y" && servSpec.isdel !="C"){
							param.objId=this.productId;
							param.status=servSpec.isdel;
							param.objIdType=2;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							servSpec.isdel = "Y";
							AttachOffer.changeList.push(param);
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined && serv.isdel == "Y"){  //在已开通里面，修改不让关闭
							param.objId=this.prodInstId;
							param.status=serv.isdel;
							param.objIdType=1;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							serv.isdel = "N";
							AttachOffer.changeList.push(param);
						}else if(servSpec != undefined && servSpec.isdel =="Y"){
							param.objId=this.productId;
							param.status=servSpec.isdel;
							param.objIdType=2;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							servSpec.isdel = "N";
							AttachOffer.changeList.push(param);
						}else if(serv==undefined && servSpec==undefined){
							param.objId=this.productId;
							param.status="Y";
							param.objIdType=2;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							AttachOffer.changeList.push(param);
							if(this.productId!=undefined && this.productId!=""){
//								AttachOffer.openServSpec(prodId,this.productId);
								var newSerSpec = {
										objId : this.productId,
										servSpecId : this.productId,
										servSpecName : this.productName,
										ifParams : "N",
										isdel : "N"  
									};
								CacheData.setServSpec(prodId,newSerSpec); //添加到已开通列表里
								var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
								servSpec.isdel="N";
							}
						}
					}
				}
			});
		}
		var offers = offerChange.resultOffer.prodOfferInfos;//省预校验返回的可选包
		if(ec.util.isArray(offers)){
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
				var param={
						prodInstId:prodId
					};
				var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
				var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已选里面查找
				if(this.state=="DEL"){
					if(offer!=undefined && offer.isdel != "Y"){
						param.objId=this.prodOfferInstId;
						param.status=(offer.isdel!=undefined?offer.isdel:"N");
						param.objIdType=3;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offer.isdel = "Y";
						AttachOffer.changeList.push(param);
					}else if(offerSpec!=undefined && offerSpec.isdel !="Y" && offerSpec.isdel !="C"){
						param.objId=this.prodOfferId;
						param.status=offerSpec.isdel;
						param.objIdType=4;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offerSpec.isdel = "Y";
						AttachOffer.changeList.push(param);
					}	
				}else if(this.state=="ADD"){
					if(offer!=undefined && offer.isdel == "Y"){  //在已开通里面，修改不让关闭
						param.objId=this.prodOfferInstId;
						param.status=offer.isdel;
						param.objIdType=3;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offer.isdel = "N";
						AttachOffer.changeList.push(param);
					}else if(offerSpec != undefined && offerSpec.isdel =="Y"){
						param.objId=this.prodOfferId;
						param.status=offerSpec.isdel;
						param.objIdType=4;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offerSpec.isdel = "N";
						AttachOffer.changeList.push(param);
					}else if(offer==undefined && offerSpec==undefined){
						param.objId=this.prodOfferId;
						param.status="Y";
						param.objIdType=4;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						AttachOffer.changeList.push(param);
						if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
//							AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
							var newOfferSpec=_setSpec(prodId,this.prodOfferId);
							newOfferSpec.isdel="N";
						}
					}
				}
			});
		}
	};
	//还原预校验前的缓存信息
	var _reductionChangList=function(prodId){
		$.each(AttachOffer.changeList,function(){
			if(this.prodInstId==prodId){
				if(this.objIdType==1){
					var serv = CacheData.getServ(prodId,this.objId);//在已开通的功能产品里面查找
					if(serv!=undefined){
						serv.isdel=this.status;
					}
				}else if(this.objIdType==2){
					var servSpec = CacheData.getServSpec(prodId,this.objId);//在已选的功能产品里面查找
					if(servSpec!=undefined){
						servSpec.isdel=this.status;
					}
				}else if(this.objIdType==3){
					var offer = CacheData.getOffer(prodId,this.objId); //已开通里面查找
					if(offer!=undefined){
						offer.isdel=this.status;
					}
				}else if(this.objIdType==4){
					var offerSpec = CacheData.getOfferSpec(prodId,this.objId); //已选里面查找
					if(offerSpec!=undefined){
						offerSpec.isdel=this.status;
					}
				}
			}
		});
	};
	//查询销售品对象的互斥依赖连带的关系
	var _servExDepReByRoleObjs=function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		paramObj.excludeServ=[];//初始化
		paramObj.dependServ=[];//初始化
		paramObj.relatedServ=[];//初始化
		var globContent="";
		$.each(newSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				if(this.objType==4 && this.selQty==1){
						var servSpec = CacheData.getServSpec(prodId,this.objId); //在已选列表中查找
						if(servSpec==undefined){   //在可订购功能产品里面 
							var serv = CacheData.getServBySpecId(prodId,this.objId); //在已开通列表中查找
							if(serv==undefined){
								var newServSpec = {
										objId : this.objId, //调用公用方法使用
										servSpecId : this.objId,
										servSpecName : this.objName,
										ifParams : this.isCompParam,
										prodSpecParams : this.prodSpecParams,
										isdel : "C"   //加入到缓存列表没有做页面操作为C
								};
								CacheData.setServSpec(prodId,newServSpec); //添加到已开通列表里
								servSpec = newServSpec;
							}else{
								servSpec=serv;
							}
						}
						var servSpecId = servSpec.servSpecId;
						var param = CacheData.getExcDepServParam(prodId,servSpecId);
						if(param.orderedServSpecIds.length == 0){
//							AttachOffer.addOpenServList(prodId,servSpecId,servSpec.servSpecName,servSpec.ifParams);
						}else{
							var data=query.offer.queryExcludeDepend(param);//查询规则校验
							var content=paserServDataByObjs(data.result,prodId,servSpec,newSpec);
							if(content!=""){
								content=("开通【"+servSpec.servSpecName+"】功能产品：<br>"+content);
								globContent+=(content+"<br>");
							}
						}
				}
			});
		});
		return globContent;
	};
	
	//转换接口返回的互斥依赖
	var paramObj = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
	};
	//解析服务互斥依赖
	var paserServDataByObjs = function(result,prodId,serv,newSpec){
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var content = "";
		
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
					paramObj.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				if(!AttachOffer.filterServ(this.servSpecId,newSpec)){
					content += "需要开通：   " + this.servSpecName + "<br>";
					paramObj.dependServ.push(this);
				}
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				if(!AttachOffer.filterServ(this.servSpecId,newSpec)){
					content += "需要开通：   " + this.servSpecName + "<br>";
					paramObj.relatedServ.push(this);
				}
			});
		}
		return content;
	};
	
	//去重，把互斥依赖里面的信息进行去重处理
	var _filterServ=function(servSpecId,newSpec){
		var flag=false;
		$.each(newSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				if(this.objType==4 && this.selQty==1){
					if(servSpecId==this.objId){
						flag=true;
						return false;
					}
				}
			});
		});
		if(!flag){
			if(ec.util.isArray(paramObj.dependServ)){
				for(var i=0;i<paramObj.dependServ.length;i++){
					if(servSpecId==paramObj.dependServ[i].servSpecId){
						flag=true;
						break;
					}
				}
			}
			if(!flag){
				if(ec.util.isArray(paramObj.relatedServ)){
					for(var i=0;i<paramObj.relatedServ.length;i++){
						if(servSpecId==paramObj.relatedServ[i].servSpecId){
							flag=true;
							break;
						}
					}
				}
			}
		}
		return flag;
	};
	
	//销售品角色成员对象是中 minQty大于0的话 就必须设置其为不能删除（暂定）
	var _minQtyFileter=function(prodId,servSpecId){
		//从已开通功能产品中找
		var serv = CacheData.getServBySpecId(prodId,servSpecId); 
		var $li;
		if(serv != undefined){
			$li=$("#li_"+prodId+"_"+serv.servId);
		}else{
			$li=$("#li_"+prodId+"_"+servSpecId);
		}
		if($li!=undefined){
			$li.find(".delete").remove();
			$li.append('<dd class="mustchoose"></dd>');	
		}
	};
	
	/**
	 * 判断 该合约是否满足被订购的条件：主套餐成员实例数据小于最小终端数，需要进行提示，不允许受理
	 */
	var _manyPhoneFilter=function(prodId,offerSpecId){
			if(OrderInfo.actionFlag==14){
				return true;
			}
			var newSpec;
			var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
			if(ec.util.isObj(offer)){
				newSpec=offer;
			}else{
				newSpec = _setSpec(prodId,offerSpecId);
			}
			if(newSpec==undefined){
				return false;
			}
			if(ec.util.isArray(newSpec.agreementInfos)){
				var num=0;
				if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag == 6){
					$.each(OrderInfo.offerSpec.offerRoles,function(){
					$.each(this.prodInsts,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD){
							num++;
						}
						});
					});
				}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3){
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							num++;
						}
					});
				}else if(OrderInfo.actionFlag == 21){
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD&&this.objInstId==prodId){  //接入类产品
							num++;
						}
					});
				}
				
				var minNum=newSpec.agreementInfos[0].minNum;
				var maxNum=newSpec.agreementInfos[0].maxNum;
				if(!ec.util.isObj(minNum)){
					$.alert("信息提示","销售品规格查询，未返回最小合约数，请后台确认。");
					return false;
				}
				if(num<minNum){
					$.alert("信息提示","该合约的最小合约数为"+minNum+"个，而该套餐的成员实例只有"+num+"个，故无法办理该合约。");
					return false;
				}
				if(maxNum>num){
					newSpec.agreementInfos[0].maxNum=num;//取最小的一个为最大终端数
				}
//				var terminalMinNum=0;
//				var terminalMaxNum=0;
//				$.each(newSpec.agreementInfos,function(){
//					$.each(this.terminalGroups,function(){
//						terminalMinNum+=this.terminalMinNum;
//						terminalMaxNum+=this.terminalMaxNum;
//					});
//				});
//				if(minNum>terminalMaxNum){
//					$.alert("信息提示","该合约的终端配置有问题，最小合约数大于组内最大值之和，请配置组核查。");
//					return false;
//				}
//				if(maxNum<terminalMinNum){
//					$.alert("信息提示","该合约的终端配置有问题，最大合约数小于组内最小值之和，请配置组核查。");
//					return false;
//				}
			}
		return true;
	};
	
	//添加终端
	var _addAndDelTerminal=function(obj){
		var prodId=$(obj).attr("prodId");
		var offerSpecId=$(obj).attr("offerSpecId");
		var fag=$(obj).attr("fag");
		var newSpec;
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(ec.util.isObj(offer)){
			newSpec=offer;
		}else{
			newSpec = _setSpec(prodId,offerSpecId);
		}
		var objInstId = prodId+'_'+newSpec.offerSpecId;
//		var terminalMaxNum=0;
//		var terminalMinNum=0;
//		$.each(newSpec.agreementInfos,function(){
//			$.each(this.terminalGroups,function(){
//				if(this.terminalGroupId==terminalGroupId){
//					terminalMaxNum=this.terminalMaxNum;
//					terminalMinNum=this.terminalMinNum;
//					return false;
//				}
//			});
//		});
		var maxNum=newSpec.agreementInfos[0].maxNum;
		var minNum=newSpec.agreementInfos[0].minNum;
//		$("li[id=^terminalDesc_"+terminalGroupId+"]");
//		var $ul=$(obj).parent().parent();ul_"'+objInstId+'
		var $ul=$("#ul_"+objInstId);
		var $li=$("#ul_"+objInstId+" li");
		var length=$li.length-1;
//		var $liPre=$("li[id=^terminalDesc_"+terminalGroupId+"]")
//		var length=$("li[id=^terminalDesc_"+terminalGroupId+"]").length;
		var isFastOffer = 0 ;
		if(ec.util.isArray(newSpec.extAttrParams)){
			$.each(newSpec.extAttrParams,function(){
				if(this.attrId == CONST.OFFER_FAST_FILL){
					isFastOffer = 1;
					return false;
				}
			});
		}
		if(fag==0){//添加终端
			if(totalNums>=maxNum){
				$.alert("信息提示","终端数已经达到最大，不能再添加了。");
				return;
			}
//			if(terminalMaxNum==(length/2)){
//				$.alert("信息提示","终端数已经达到最大，不能再添加了。");
//				return;
//			}
			var $liTerminalAdd=$('<li><label>终端校验：</label><input id="terminalText_'+objInstId+'_'+(length/2+1)+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
					+'<input id="terminalBtn_'+objInstId+'_'+(length/2+1)+'" type="button" flag="'+isFastOffer+'" num="'+(length/2+1)+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)" value="校验" class="purchase" style="float:left"></input></li>');
			var $liAdd = $('<li id="terminalDesc_'+(length/2+1)+'" style="white-space:nowrap;"><label></label><label id="terminalName_'+(length/2+1)+'"></label></li>');
			
			$ul.append($liTerminalAdd).append($liAdd);
			totalNums++;
		}else{//删除终端
			if(minNum==(length/2)){
				$.alert("信息提示","终端数已经达到最小，不能再删除了。");
				return;
			}
			$li.each(function(index){
				if(length-1==index){
					$(this).remove();
				}else if(length==index){
					_filterAttach2Coupons(prodId,offerSpecId,(index/2));
					$(this).remove();
				}
				
			});
			totalNums--;
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
	
	//清空同一个产品下的同一个销售品的串码缓存信息
	var _removeAttach2Coupons=function(prodId,offerSpecId){
		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
			var attach2Coupon = OrderInfo.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
				OrderInfo.attach2Coupons.splice(i,1);
				i--;
			}
		}
	};
	
	//判断是否是重复订购的逻辑
	var _ifOrderAgain=function(newSpec){
		if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
			if(parseInt(newSpec.orderCount)<newSpec.counts){
//				var $specAgain = $('#li_'+prodId+'_'+offerSpecId+'_'+newSpec.ifOrderAgain); //在已开通附属里面
//				$specAgain.remove();
				$.alert("信息提示","可选包："+newSpec.offerSpecName+"至多只能订购"+newSpec.orderCount+"次");
				return true;
			}
		}
	};
	
	//1表示从已订购那边过来的
	var _setParam=function(prodId,offerSpecId,flag){
		var newSpec = _setSpec(prodId,offerSpecId);  //没有在已选列表里面
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(flag==1){
			newSpec.counts=offer.counts;
		}
		var content = '<form id="paramForm">' ;
		content += "次数" + ' : <input id="text_'+prodId+'_'+offerSpecId  
		+'" class="inputWidth183px" type="text" value="'+newSpec.counts+'"><br>'; 
		content +='</form>' ;
		$.confirm("参数设置： ",content,{ 
			yes:function(){
			},
			no:function(){
			}
		});
		$('#paramForm').bind('formIsValid', function(event, form) {
			var nums=$("#text_"+prodId+"_"+offerSpecId).val();
			var reg = /^\+?[1-9][0-9]*$/;//正整数
			if(!reg.test(nums)){
				$.alert("信息提示","次数只能是正整数。");
				return;
			}
//			if(flag==1&&offer.orderCount>nums){
//				$.alert("信息提示","可选包【"+newSpec.offerSpecName+"】不允许退订！");
//				return;
//			}
			if(parseInt(newSpec.orderCount)<nums){
				$.alert("信息提示","可选包【"+newSpec.offerSpecName+"】至多只能订购"+newSpec.orderCount+"次");
				return;
			}
			if(flag==1 && offer!=undefined){
				if(offer.orderCount>nums){//退订附属销售品
					if(!ec.util.isArray(offer.offerMemberInfos)){//销售品实例查询	
						var param = {
								prodId:prodId,
								areaId: OrderInfo.getProdAreaId(prodId),
								offerId:offer.offerId	
						};
						param.acctNbr = OrderInfo.getAccessNumber(prodId);
						var data = uiOfferQuery.queryOfferInst(param);
						if(data==undefined){
							return;
						}
						offer.offerMemberInfos = data.offerMemberInfos;
						offer.offerSpec = data.offerSpec;
					}
				}
				offer.counts=nums;
			}else{
				newSpec.counts=nums;
			}
			$(".ZebraDialog").remove();
			$(".ZebraDialogOverlay").remove();
		}).ketchup({bindElementByClass:"ZebraDialog_Button1"});	
	};
	
	var _offerSpecDetail=function(prodId,offerSpecId){
		var offerSpecName ="";
		var summary = "";
		$.each(AttachOffer.allOfferList,function(){
			if(this.offerSpecId == offerSpecId){
				offerSpecName = this.offerSpecName;
				summary = this.summary;
			}else if(this.servSpecId == offerSpecId){
				offerSpecName = this.servSpecName;
				summary = this.summary;
			}
		});
		$('#detail_tbody').empty();
		var $tr = $('<tr></tr>');
		//var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"><td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
		$tr.append('<td>'+offerSpecName+'</td><td width="900">'+summary+'</td>');
		$('#detail_tbody').append($tr);
		easyDialog.open({
			container : "div_detail_dialog"
		});
	};
	//已订购的附属销售品查询
	var _queryCardAttachOffer = function(cardTypeFlag) {
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
		
		var data = uiOfferQuery.queryAttachOfferHtml(param);
	//	SoOrder.initFillPage();
		$("#attach").html(data).show();
		//var member = CacheData.getOfferMember(prodId);
		//如果objId，objType，objType不为空才可以查询默认必须
		//if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
            var temp = {   
				boActionTypeCd : '14',
				cardType : cardTypeFlag=="1"?"4G":"3G",
				accNbr: prodInfo.accNbr,
				prodInstId : prodId,
				prodId : prodId,
				prodSpecId : prodInfo.productId
			};
			//默认必须可选包和功能产品
			var data = query.offer.queryDefMustOfferSpecAndServ(temp);
			CacheData.parseOffer(data);
			CacheData.parseServ(data);
		//}
		if(ec.util.isArray(OrderInfo.offerSpec.offerRoles)){ //主套餐下的成员判断
			var member = CacheData.getOfferMember(prodId);
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
					var offerRole = this;
					$.each(this.roleObjs,function(){
						if(this.objType==CONST.OBJ_TYPE.SERV){
							var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
							if(serv!=undefined){ //不在已经开跟已经选里面
								var $oldLi = $('#li_'+prodId+'_'+serv.servId);
								if(this.minQty==1){
									$oldLi.append('<dd class="mustchoose"></dd>');
								}
								$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
							}
						}
					});
					return false;
				}
			});
		}
		//AttachOffer.changeLabel(prodId, prodInfo.productId,""); //初始化第一个标签附属
		//order.dealer.initDealer();
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
												
			$("#uim_check_btn_"+prodId).attr("class","disablepurchase");	
			
			$("#uim_check_btn_"+prodId).attr("disabled","disabled");	
			
			//修改释放按钮的展示
			$("#uim_release_btn_"+prodId).removeAttr("class");
			
			$("#uim_release_btn_"+prodId).removeAttr("disabled");
			
			$("#uim_release_btn_"+prodId).attr("class","purchase");	
			
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
	
	return {
		addOffer 				: _addOffer,
		addOfferSpec 			: _addOfferSpec,
		addOpenList				: _addOpenList,
		addOpenServList			: _addOpenServList,
		addOfferSpecByCheck		: _addOfferSpecByCheck,
		addAndDelTerminal		: _addAndDelTerminal,
		closeAttachSearch 		: _closeAttachSearch,
		changeLabel				: _changeLabel,
		changeList				: _changeList,
		closeServ				: _closeServ,
		closeServSpec			: _closeServSpec,
		checkData				: _checkData,
		delOffer				: _delOffer,
		delOfferSpec			: _delOfferSpec,
		labelList				: _labelList,
		isChangeUim				: _isChangeUim,
		init					: _init,
		openList				: _openList,
		openedList				: _openedList,
		openServList			: _openServList,
		openedServList 			: _openedServList,
		openServSpec			: _openServSpec,
		openAppList				: _openAppList,
		queryAttachOffer 		: _queryAttachOffer,
		queryAttachOfferSpec 	: _queryAttachOfferSpec,
		queryCardAttachOffer    : _queryCardAttachOffer,
		showParam 				: _showParam,
		showServParam			: _showServParam,
		showTime				: _showTime,
		setAttachTime			: _setAttachTime,
		searchAttachOfferSpec   : _searchAttachOfferSpec,
		selectAttachOffer		: _selectAttachOffer,
		showOfferTime			: _showOfferTime,
		showMainParam			: _showMainParam,
		showMainMember			: _showMainMember,
		selectServ				: _selectServ,
		showStartTime			: _showStartTime,
		showEndTime			    : _showEndTime,
		setAttachBusiOrder		: _setAttachBusiOrder,
		showApp					: _showApp,
		showHideUim				: _showHideUim,
		showMainRoleProd		: _showMainRoleProd,
		checkTerminalCode		: _checkTerminalCode,
		checkOfferExcludeDepend	: _checkOfferExcludeDepend,
		checkServExcludeDepend	: _checkServExcludeDepend,
		servExDepReByRoleObjs	: _servExDepReByRoleObjs,
		setChangeList			: _setChangeList,
		reductionChangList		: _reductionChangList,
		filterServ				: _filterServ,
		setParam				: _setParam,
		showMainMemberRoleProd	: _showMainMemberRoleProd,
		offerSpecDetail         : _offerSpecDetail
	};
})();
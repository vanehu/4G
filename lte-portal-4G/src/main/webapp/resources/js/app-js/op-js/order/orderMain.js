
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
	var _buildMainView = function(param) {
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		
		/*if(OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
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
		}*/
		$.callServiceAsHtml(contextPath+"/token/app/order/main",param,{
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
				if(OrderInfo.actionFlag == 2){
					setTimeout(function () { 
						$.unecOverlay();
						offerChange.fillOfferChange(response,param);
				    }, 800);
				}else {
					$.unecOverlay();
					_callBackBuildView(response,param);
				}
			}
		});
	};
	
	//展示回调函数
	var _callBackBuildView = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_prepare").hide();
		var content$ = $("#order").html(response.data).show();
		$.refresh(content$);
		
		_initTounch();
		//_initOfferLabel();//初始化主副卡标签
		_initFeeType(param);//初始化付费方式
		
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}
		
		if(OrderInfo.actionFlag==6){//主副卡纳入老用户
			if(order.memberChange.newMemberFlag){
				_loadOther(param);
			}
			if(order.memberChange.oldMemberFlag){
				_initAcct(1);//初始化副卡帐户列表
				_loadAttachOffer(param);
			}
			if(order.memberChange.changeMemberFlag){
				order.memberChange.fillmemberChange(response,param);
			}
		}else{
			_loadOther(param);//页面加载完再加载其他元素
		}
		
		//APP版本暂无帐户功能，屏蔽
//		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
//			_initAcct();//初始化帐户列表 
//			$("#acctName").val(OrderInfo.cust.partyName);
//			order.dealer.initDealer();//初始化协销		
//		}
//		_addEvent();//添加页面事件*/
		
		order.phoneNumber.initOffer('-1');//主卡自动填充号码入口已选过的号码
		
		//新装进入下一步[W]
		$("#fillNextStep").off("click").on("click",function(){
			if(!SoOrder.checkData()){ //校验通过
				return false;
			}
			$("#order-content").hide();
			$("#order-dealer").show();
			order.dealer.initDealer();
			
			//放入需要查询的工号数据[W]
			var DevelopmentCode= OrderInfo.codeInfos.DevelopmentCode;
			var reloadFlag= OrderInfo.provinceInfo.reloadFlag;
			if(DevelopmentCode!=null && DevelopmentCode!="" && DevelopmentCode!="null" && reloadFlag=="Y" && (OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2)){
				//查询工号数据
				$("#staffCode").val(DevelopmentCode);
				order.dealer.queryStaff(0,'dealer',OrderInfo.codeInfos.developmentObjId);
			}
		});
		if (param.memberChange) {
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#productDiv .pdcardcon:first").show();
			order.prepare.step(1);
			$("#fillLastStep").off("click").on("click",function(){
				order.prodModify.cancel();
			});
		}else{
			$("#fillLastStep").off("click").on("click",function(){
				_lastStep();
			});
		}
		
		//初始化uim卡号
		_initUimCode();
		
		//判断是否初始化帐户信息
		if(OrderInfo.acct&&OrderInfo.acct.acctCd!=null&&OrderInfo.acct.acctCd!=""){//新装传帐户id
			_createAcctWithId();
		}
		
		//新装省份传主副卡信息
		if(OrderInfo.newOrderNumInfo.mainPhoneNum!=""){
			//主卡选号需要的参数 
			var param = {"phoneNum":"",
						"prodId":""};
			//查询号码信息
			param.phoneNum = OrderInfo.newOrderNumInfo.mainPhoneNum;
			param.prodId = "-1";
			var result = order.phoneNumber.queryPhoneNumber(param);
			if(result==undefined||result.datamap==undefined||result.datamap.baseInfo==undefined){
				$("#nbr_btn_-1").val("");
				$("#phonenum_btn_-1").removeAttr("onclick");
			}else{
				if(result&&result.datamap.baseInfo!=undefined){					
					var phoneParam={
							prodId : param.prodId, //从填单页面头部div获取
							accessNumber : result.datamap.baseInfo.phoneNumber, //接入号
							anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
							anId : result.datamap.baseInfo.phoneNumId, //接入号ID
							pnLevelId:result.datamap.baseInfo.phoneLevelId,
							anTypeCd : result.datamap.baseInfo.pnTypeId, //号码类型
							state : "ADD", //动作	,新装默认ADD
							areaId:result.datamap.baseInfo.areaId,
							areaCode:result.datamap.baseInfo.zoneNumber,
							memberRoleCd:"",
							preStore:result.datamap.baseInfo.prePrice,
							minCharge:result.datamap.baseInfo.pnPrice,
							idFlag:"1"
						};
					if(param.prodId&&param.prodId=="-1"){
						phoneParam.memberRoleCd = CONST.MEMBER_ROLE_CD.MAIN_CARD;
					}
					$("#nbr_btn_-1").val(OrderInfo.newOrderNumInfo.mainPhoneNum);
					$("#phonenum_btn_-1").removeAttr("onclick");
					OrderInfo.boProdAns.push(phoneParam);
				}
			}
		}
		
		if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""){
			var param = {"phoneNum":"","prodId":""};
			var numBtns = $("input[id^='nbr_btn_']");			
			var nums = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
			var subNums = [];
			$.each(numBtns,function(){
				if($(this).attr("id")!="nbr_btn_-1"){
					subNums.push(this);
				};
			});
			$.each(subNums,function(index,subNum){
				//副卡选号需要的参数  
				param.phoneNum = nums[index];
				param.prodId = -2-index;
				var resData = order.phoneNumber.queryPhoneNumber(param);
				if(resData==undefined||resData.datamap==undefined||resData.datamap.baseInfo==undefined){
					$(subNum).val("");
					$("#phonenum_btn_"+prodId).removeAttr("onclick");
				}else{
					if(resData&&resData.datamap.baseInfo!=undefined){
						var phoneParam={
								prodId : param.prodId, //从填单页面头部div获取
								accessNumber : resData.datamap.baseInfo.phoneNumber, //接入号
								anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
								anId : resData.datamap.baseInfo.phoneNumId, //接入号ID
								pnLevelId:resData.datamap.baseInfo.phoneLevelId,
								anTypeCd : resData.datamap.baseInfo.pnTypeId, //号码类型
								state : "ADD", //动作	,新装默认ADD
								areaId:resData.datamap.baseInfo.areaId,
								areaCode:resData.datamap.baseInfo.zoneNumber,
								memberRoleCd:"",
								preStore:resData.datamap.baseInfo.prePrice,
								minCharge:resData.datamap.baseInfo.pnPrice,
								idFlag:"1"
							};
						if(param.prodId&&param.prodId!="-1"){
							phoneParam.memberRoleCd = CONST.MEMBER_ROLE_CD.VICE_CARD;
						}		
						$(subNum).val(nums[index]);
						$("#phonenum_btn_"+prodId).removeAttr("onclick");
						OrderInfo.boProdAns.push(phoneParam);
					}
				}
			});
		}
		
		//新装二次加载处理
		if(OrderInfo.provinceInfo.reloadFlag&&OrderInfo.provinceInfo.reloadFlag=="N"){
			var custOrderList = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
			$.each(custOrderList,function(){
				var offerTypeCd=this.busiObj.offerTypeCd;
				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){//纳入新成员
					var prodId = this.busiObj.instId;
					var accessNumber = this.busiObj.accessNumber;//接入号
					var terminalCode = this.data.bo2Coupons[0].terminalCode;//uim卡号
					var feeType = this.data.boProdFeeTypes[0].feeType;//付费类型
					var prodPwTypeCd = this.data.boProdPasswords[0].prodPwTypeCd;
					var pwd = this.data.boProdPasswords[0].pwd;//产品密码
					//主卡才有是否信控
					var isCheckMask = "20";//默认信控
					if(this.data.boProdItems&&this.data.boProdItems[0].itemSpecId){
						var itemSpecId = this.data.boProdItems[0].itemSpecId;
						if(itemSpecId=="40010030"){//是否信控
							isCheckMask = this.data.boProdItems[0].value;
						}
						//是否信控放在OrderInfo.newOrderInfo.isCheckMask中				
						var checkMark = {};
						checkMark.itemSpecId = itemSpecId;
						checkMark.prodId = prodId;
						checkMark.isCheckMask = isCheckMask;
						OrderInfo.reloadProdInfo.checkMaskList.push(checkMark);
						
						$("#"+itemSpecId+"_"+prodId+"").find("option[value='"+isCheckMask+"']").attr("selected","selected");
					}
					
					$("#nbr_btn_"+prodId).val(accessNumber);
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
					//付费方式_spec_parm
					OrderInfo.reloadProdInfo.feeType = feeType ;
					$("#idtype").find("option[value='"+feeType+"']").attr("selected","selected");
					//order.dealer.changeAccNbr(this.data.boProdAns[0].prodId,this.data.boProdAns[0].accessNumber);//选号玩要刷新发展人管理里面的号码
					//uim卡校验
					$("#uim_check_btn_"+this.data.bo2Coupons[0].prodId).attr("disabled",true);;
					$("#uim_release_btn_"+this.data.bo2Coupons[0].prodId).removeClass("disabled");
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
					//$("#pwd_"+this.busiObj.instId).val(this.data.boProdPasswords[0].pwd);				
					//$("select[name='pay_type_-1'] option[value='"+this.data.boProdFeeTypes[0].feeType+"']").attr("selected","selected");
				}		
				
				//发展人
				var objInstId="";
				var accessNum="";
				var objName="";
				var prodId="";
				if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1"){
					objInstId = this.busiObj.objId;
					accessNum=this.busiObj.accessNumber;
					objName=this.busiObj.objName;
					prodId=this.data.ooRoles[0].prodId;
				}
				
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
							dealerMap1.objInstId=objInstId;
							dealerMap1.accessNumber=accessNum;
							dealerMap1.objName=objName;
							dealerMap1.prodId=prodId;
							dealerMap1.offerTypeCd=offerTypeCd;
						}else if(this.role=="40020006"){
							dealerMap2.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap2.staffid = this.value;
								dealerMap2.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap2.staffname = this.value;
							}
							dealerMap2.objInstId=objInstId;
							dealerMap2.accessNumber=accessNum;
							dealerMap2.objName=objName;
							dealerMap2.prodId=prodId;
							dealerMap2.offerTypeCd=offerTypeCd;
						}else if(this.role=="40020007"){
							dealerMap3.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap3.staffid = this.value;
								dealerMap3.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap3.staffname = this.value;
							}
							dealerMap3.objInstId=objInstId;
							dealerMap3.accessNumber=accessNum;
							dealerMap3.objName=objName;
							dealerMap3.prodId=prodId;
							dealerMap3.offerTypeCd=offerTypeCd;
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
				
				//帐户信息
				if(this.data.boAccountRelas!=undefined){
					var acctId = this.data.boAccountRelas[0].acctId;
					$("#acctSelect").find("option[value="+acctId+"]").attr("selected","selected");
				}			
			});
			//
			order.main.newProdReload();
			var custOrderAttrs = OrderInfo.reloadOrderInfo.orderList.orderListInfo.custOrderAttrs;
			$.each(custOrderAttrs,function(){
				//订单备注
				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.REMARK){
					OrderInfo.reloadProdInfo.orderMark = this.value;
				}
			});
		}
	};
	//新装套餐二次加载,可选包、功能包处理
	var _newProdReload = function(){
		//处理可选包和功能产品增删
		var custOrderList = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
		$.each(custOrderList,function(){
			if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1"){
				var offermap = this;
				$.each(AttachOffer.openList,function(){
					if(this.prodId==offermap.data.ooRoles[0].prodId){
						var offerflag = false;
						$.each(this.specList,function(){
							if(this.offerSpecId==offermap.busiObj.objId){
								offerflag = true;
								return false;
							}
						});
						if(!offerflag){
							//AttachOffer.addOfferSpec(this.prodId,offermap.busiObj.objId);
							_addOfferSpecSub(this.prodId,offermap.busiObj.objId);
							//是否有终端信息
							if(offermap.data.bo2Coupons!=undefined){
								for(var i=0;i<offermap.data.bo2Coupons.length;i++){
									var bo2Coupons = offermap.data.bo2Coupons[i];
									if(i==0){
										$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
										AttachOffer.checkTerminalCode($("#terminalBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num));
									}else{
										AttachOffer.addAndDelTerminal($("#terminalAddBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId));
										$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
										AttachOffer.checkTerminalCode($("#terminalBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num));
									}
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
										//AttachOffer.checkTerminalCodeReload($("#terminalAddBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num));
								}
							}
						}
					}
				});
				
				//老用户纳入
				if(offermap.data.ooRoles[0].prodId>0){
					AttachOffer.addOfferSpecReload(offermap.data.ooRoles[0].prodId,offermap.busiObj.objId);
				}
			}else if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){
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
					AttachOffer.openServSpecReload(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,offermap.data.boServOrders[0].servSpecName,ifParams);
	/*				if(ifParams=="Y"){
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
					}*/
				}
				
				//老用户纳入
				if(offermap.busiObj.instId>0){
					var ifParams = "N";
					if(offermap.data.boServItems!=undefined){
						ifParams = "Y";
					}
					AttachOffer.openServSpecReload(offermap.busiObj.instId,offermap.data.boServOrders[0].servSpecId,offermap.data.boServOrders[0].servSpecName,ifParams);
				}
			}
		});
		//处理缓存里面存在而二次加载回参没有的产品
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
					AttachOffer.delOfferSpecReload(openmap.prodId,this.offerSpecId);
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
					AttachOffer.closeServSpecReload(openmap.prodId,this.servSpecId,this.servSpecName,this.ifParams);
				}
			});
		});
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
		//var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		//content=content+serContent;
		
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
	//初始化uim卡号
	var _initUimCode = function() {
		//错误提示信息，如果有号码，但是UIM为空时提示
		var codeMsg=OrderInfo.newOrderNumInfo.codeMsg;
		
		if(codeMsg!=null && codeMsg!=""){
			$.alert("提示",codeMsg);
		}else{
			var mktResInstCodeSub= OrderInfo.newOrderNumInfo.mktResInstCode;
			
			if(OrderInfo.newOrderNumInfo.mktResInstCode && mktResInstCodeSub!=null && mktResInstCodeSub!="" && mktResInstCodeSub!="null"){
				var mktResInstCode = mktResInstCodeSub.split(",");
				
				if(mktResInstCode!=null && mktResInstCode.length>0){
					for (var i = 0; i <= mktResInstCode.length; i ++) {
						//numAndUim-->号码_UIM
						var numAndUim=mktResInstCode[i];
						
						if(numAndUim!=null && numAndUim!=""){
							var codes=numAndUim.split("_");
							if(codes!=null && codes.length==2){
								var num=codes[0];
								var uim=codes[1];
								
								var uimParam = {"instCode":uim};
								var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
								
								if (response.code==0) {
									if(response.data && response.data.mktResBaseInfo){
										if(response.data.mktResBaseInfo.statusCd=="1102"){
											$("#uim_check_btn_"+num).attr("disabled",true);
											$("#uim_check_btn_"+num).removeClass("purchase").addClass("disablepurchase");
											$("#uim_release_btn_"+num).attr("disabled",false);
											$("#uim_release_btn_"+num).removeClass("disablepurchase").addClass("purchase");
											$("#uim_txt_" + num).val(uim);
											
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
												couponInstanceNumber : response.data.mktResBaseInfo.instCode, //物品实例编码
												terminalCode : response.data.mktResBaseInfo.instCode,//前台内部使用的UIM卡号
												ruleId : "", //物品规则ID
												partyId : OrderInfo.cust.custId, //客户ID
												prodId :  num, //产品ID
												offerId : "-1", //销售品实例ID
												state : "ADD", //动作
												relaSeq : "" //关联序列	
											};
											
											OrderInfo.clearProdUim(num);
											OrderInfo.boProd2Tds.push(coupon);
										}else{
											$.alert("提示","UIM卡["+uim+"]不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
										}
									}else{
										$.alert("提示","没有查询到相应的UIM卡["+uim+"]信息");
									}
								}else if (response.code==-2){
									$.alert(response.data);
								}else {
									$.alert("提示","UIM信息查询接口出错,稍后重试");
								}
							}
						}
					}
				}
			}
		}
	};
	
	//增加传入帐户
	var _createAcctWithId = function() {
	   //帐户信息查询参数初始化 
		var acctQueryParam;
		acctQueryParam = {acctCd : OrderInfo.acct.acctCd,isServiceOpen:"Y"};
		acctQueryParam.areaId=OrderInfo.getAreaId();
		$.callServiceAsJson(contextPath+"/order/account", acctQueryParam, {
				"before":function(){	},
				"always":function(){},
				"done" : function(response){
					if(response.code==-2){//查询接口出错
						$.alertM(response.data);
						return;
					}
					if(response.code==0){//查询成功
						var returnMap = response.data;
						if(returnMap.resultCode==0){
							if(returnMap.accountInfos && returnMap.accountInfos.length > 0){
								//将对应的帐号添加进进OrderInfo.acct中，以便生成订单时使用
								$.each(returnMap.accountInfos, function(i, prodAcctInfo){
									if(prodAcctInfo.acctId!=null&&prodAcctInfo.acctId!=""){
										OrderInfo.acct={"acctId":prodAcctInfo.acctId,"acctcd":prodAcctInfo.accountNumber,"name":prodAcctInfo.name};
										return false;
									}	
								});	
							} else{//未查询到帐户信息
							    $.alert("提示","没有查询到帐户合同号对应的帐户信息");
							}
						}
						else{
							$.alertM(returnMap.resultMsg);
						}				
					}else{
						$.alertM(response.data);
					}
				}
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
						if(member.objType==CONST.OBJ_TYPE.PROD){
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
							
							//获取已订购，可订购等数据[W]
							var res = query.offer.queryChangeAttachOfferSub(param);
							//var res = query.offer.queryAttachSpec(param);
							$("#attach_"+prodId).html(res);	
							
							//如果objId，objType，objType不为空才可以查询默认必须
							if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
								param.queryType = "1,2";
								param.objId = member.objId;
								param.objType = member.objType;
								param.memberRoleCd = "401";
								//默认必须可选包
								var data = query.offer.queryDefMustOfferSpec(param);
								CacheData.parseOffer(data);
								//默认必须功能产品
								var data = query.offer.queryServSpec(param);
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
								});
							}
							AttachOffer.changeLabel(prodId,prodInfo.productId,"");
						}
					});
				}
			});
			
//				if(_isChangeUim(prodId)){ //需要补换卡
//					if(!uimDivShow){
//						$("#uimDiv_"+prodId).show();
//					}else{
//						$("#uimDiv_"+prodId).hide();
//					}
//				}
//				uimDivShow=true;
			
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
			if((order.prodModify.choosedProdInfo.is3G== "N" && prodInfo.mainProdOfferInstInfos[0].is3G =="Y") || "ON" == offerChange.queryPortalProperties("YJY-" + OrderInfo.staff.soAreaId.substring(0,3) + "0000")){
				if(!order.memberChange.checkOrder(prodInfo,oldoffer)){ //省内校验单
					return;
				}
				order.memberChange.checkOfferProd(oldoffer);
			}
			
		}
//		order.main.reload();
					
//				});
//			}
//		});
	};
	
	//动态添加产品属性、附属销售品等
	var _loadOther = function(param) {
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
				AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品
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
		
		if(order.service.oldMemberFlag){
			order.main.loadAttachOffer();
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
			/*
			var paymethod = null ;
			var paymethodid = null ;
			$(".paymethodChange").each(function(){//获取第一个付费方式
				if(paymethod==null){
					paymethod = $(this).val();
					paymethodid = $(this).attr("id");
				}
			});
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paymethod!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paymethod!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
			*/
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
		$.callServiceAsHtmlGet(contextPath + "/token/app/order/orderSpecParam",param, {
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
					if(OrderInfo.actionFlag != 1&& OrderInfo.actionFlag != 14){
						$(xkDom).attr("disabled","disabled");
					} else {
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value=' ']").remove(); //去除“请选择”空值选项
						$(xkDom).val("20"); //默认为“是”
						if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
							$(xkDom).attr("disabled","disabled");
						}
					}
					$(xkDom).addClass("styled-select");
				}
				//新装--二次加载(是否信控)处理 
				if(OrderInfo.provinceInfo.reloadFlag&&OrderInfo.provinceInfo.reloadFlag=="N"){
					$.each(OrderInfo.reloadProdInfo.checkMaskList,function(){
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+this.prodId+"").find("option[value='"+this.isCheckMask+"']").attr("selected","selected");
					});
					
					//判断是否是预付费，是：修改信控信息
					var feetype = $("select[name='pay_type_-1']").find("option:selected").val();
					if(feetype=="2100"){
						order.main.feeTypeCascadeChange($("select[name='pay_type_-1']"),'-1');
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
						$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param, {
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
						$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
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
			boActionTypeCd : S1,
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
		createAcctWithId    :_createAcctWithId,
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
		newProdReload      :_newProdReload,
		loadAttachOffer:_loadAttachOffer,
	};
})();


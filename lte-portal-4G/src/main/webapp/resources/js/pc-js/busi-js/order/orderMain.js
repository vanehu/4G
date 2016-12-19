
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
		//组装数据
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		/*if(order.memberChange.newMemberFlag && OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
			var is_same_feeType=false;//
			if(param.feeTypeMain=="2100" && (OrderInfo.offerSpec.feeType=="2100"||OrderInfo.offerSpec.feeType=="3100"||OrderInfo.offerSpec.feeType=="3101"||OrderInfo.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1200" && (OrderInfo.offerSpec.feeType=="1200"||OrderInfo.offerSpec.feeType=="3100"||OrderInfo.offerSpec.feeType=="3102"||OrderInfo.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1201" && (OrderInfo.offerSpec.feeType=="1201"||OrderInfo.offerSpec.feeType=="3101"||OrderInfo.offerSpec.feeType=="3102"||OrderInfo.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}
			if(!is_same_feeType){
				$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
				return;
			}
		}*/
		$.callServiceAsHtml(contextPath+"/token/pc/order/main",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					offerChange.fillOfferChange(response,param);
				}else if(OrderInfo.actionFlag == 21){//副卡换套餐
					order.memberChange.fillmemberChange(response,param);
				}else {
					_callBackBuildView(response,param);
				}
				if(CONST.getAppDesc()==1 && (OrderInfo.actionFlag==1 ||OrderInfo.actionFlag==14)){
					$("#li_is_activation").show();
				}
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//展示回调函数
	var _callBackBuildView = function(response, param) {
		order.prepare.showOrderTitle(OrderInfo.actionTypeName, param.offerSpecName, false);
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#deal_package").css("display","none");
		$("#order_prod_list").css("display","none");
		$("#order_fill_content").html(response.data);	
		_initOrderLabel();//初始化订单标签
		_initOfferLabel();//初始化主副卡标签
		_initFeeType(param);//初始化付费方式
		_initOrderProvAttr();//初始化省内订单属性		
		if(CONST.getAppDesc()==0){
				$("#orderAttrDiv").show();
				_initOrderAttr();//经办人
		}
		var orderAttrFlag = ec.util.defaultStr($("#orderAttrFlag").val());
		var orderAttrCustId = ec.util.defaultStr($("#orderAttrCustId").val());
		OrderInfo.orderAttrFlag = orderAttrFlag;
		OrderInfo.subHandleInfo.orderAttrCustId = orderAttrCustId;
		if(orderAttrFlag=="N"){//订单提交报文中经办人下省用
			$("#orderAttrDiv").hide();
		}
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}
		
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
			order.main.initAcct(0);//初始化主卡帐户列表 
			order.dealer.initDealer();//初始化协销	
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
			if(order.service.oldMemberFlag){
				order.main.initAcct(1);//初始化副卡帐户列表
			}
			_loadOther(param);//页面加载完再加载其他元素
		}
		if(OrderInfo.actionFlag==1){
			$("#templateOrderDiv").show();
		}
		_addEvent();//添加页面事件
		order.phoneNumber.initOffer('-1');//主卡自动填充号码入口已选过的号码
		if(OrderInfo.actionFlag==1&&OrderInfo.newOrderInfo.isLastFlag=="true"){
			$("#fillLastStep").show();
		}
		$("#fillNextStep").off("click").on("click",function(){
			SoOrder.submitOrder();
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
		_initUimCode();//初始化uim卡号
		
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
				$("#nbr_btn_-1").html("<u></u>");
				$("#nbr_btn_-1").removeAttr("onclick");
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
					$("#nbr_btn_-1").html(OrderInfo.newOrderNumInfo.mainPhoneNum+"<u></u>");
					$("#nbr_btn_-1").removeAttr("onclick");
					OrderInfo.boProdAns.push(phoneParam);
				}
			}
		}
		
		if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""){
			var param = {"phoneNum":"","prodId":""};
			var numBtns = $("a[id^='nbr_btn_']");
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
					$(subNum).html("<u></u>");
					$(subNum).removeAttr("onclick");
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
						$(subNum).html(nums[index]+"<u></u>");
						$(subNum).removeAttr("onclick");
						OrderInfo.boProdAns.push(phoneParam);
					}
				}

			});
		}
		
		//新装暂存单二次加载
		if(OrderInfo.newOrderInfo.isReloadFlag=="N"){
			var result=OrderInfo.newOrderInfo.result;
			var prodOfferId=OrderInfo.newOrderInfo.prodOfferId;
			var prodOfferName=OrderInfo.newOrderInfo.prodOfferName;
			order.service.callBackBuildOrder(result,prodOfferId,prodOfferName);
		}
		
		//主副卡纳入新用户选号
		var nbrlist = [];
		var nbrflag = true;
		if(order.memberChange.newSubPhoneNum!="" && order.memberChange.reloadFlag=="Y"){
			var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
			for(var n=0;n<newSubPhoneNumsize.length;n++){
				if(newSubPhoneNumsize[n]!=""&&newSubPhoneNumsize[n]!=null&&newSubPhoneNumsize[n]!="null"){
					$.each(nbrlist,function(){
						if(this==newSubPhoneNumsize[n]){
							nbrflag = false;
							return false;
						}else{
							nbrflag = true;
						}
					});
					if(nbrflag){
						nbrlist.push(newSubPhoneNumsize[n]);
						$("#nbr_btn_-"+(n+1)).removeAttr("onclick");
						$("#nbr_btn_-"+(n+1)).removeClass("selectBoxTwo");
						$("#nbr_btn_-"+(n+1)).addClass("selectBoxTwoOn");
						var param = {"phoneNum":newSubPhoneNumsize[n]};
						var data = order.phoneNumber.queryPhoneNumber(param);
						if(data.datamap.baseInfo){
							$("#nbr_btn_-"+(n+1)).html(newSubPhoneNumsize[n]+"<u></u>");
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
					}else{
						$.alert("提示","号码"+newSubPhoneNumsize[n]+"重复输入");
					}
				}
			}
		}
		//主副卡纳入新用户UIM卡
		if(order.memberChange.mktResInstCode!="" && order.memberChange.reloadFlag=="Y"){
			nbrlist = [];
			nbrflag = true;
			var offerId = "-1";
			offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
			$.each(OrderInfo.oldprodInstInfos,function(){
				if(this.prodInstId==prodId){
					offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
				}
			});
			var mktResInstCodesize = order.memberChange.mktResInstCode.split(",");
			for(var u=0;u<mktResInstCodesize.length;u++){
				if(mktResInstCodesize[u]!=""&&mktResInstCodesize[u]!=null&&mktResInstCodesize[u]!="null" && order.memberChange.newSubPhoneNum!=""){
					var nbrAndUimCode = mktResInstCodesize[u].split("_");
					var _accNbr = nbrAndUimCode[0];
					var _uimCode = nbrAndUimCode[1];
					var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
					var uimflag = false;
					$.each(nbrlist,function(){
						if(this==_accNbr){
							nbrflag = false;
							return false;
						}else{
							nbrflag = true;
						}
					});
					if(!nbrflag){
						$.alert("提示","UIM卡"+_uimCode+"对应的号码重复");
						return;
					}
					for(var n=0;n<newSubPhoneNumsize.length;n++){
						if(newSubPhoneNumsize[n]==_accNbr){
							nbrlist.push(newSubPhoneNumsize[n]);
							uimflag = true;
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
							break;
						}
					}
					if(!uimflag){
						$.alert("提示","UIM卡"+_uimCode+"未匹配到接入号");
					}
				}
			}
		}
		//发展人
		if(OrderInfo.provinceInfo.salesCode!=""&&(OrderInfo.newOrderInfo.isReloadFlag!="N" || order.memberChange.reloadFlag=="Y")){
			order.main.queryDealer();
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
					$("#nbr_btn_"+this.data.boProdAns[0].prodId).html(this.busiObj.accessNumber+"<u></u>");
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
				//发展人
				if(this.data.busiOrderAttrs!=undefined){
					var dealerlist = [];
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
						}else if(this.role=="40020006"){
							dealerMap2.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap2.staffid = this.value;
								dealerMap2.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap2.staffname = this.value;
							}
						}else if(this.role=="40020007"){
							dealerMap3.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap3.staffid = this.value;
								dealerMap3.channelNbr = this.channelNbr;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap3.staffname = this.value;
							}
						}
						
					});
					if(ec.util.isObj(dealerMap1.role)){
						dealerlist.push(dealerMap1);
					}
					if(ec.util.isObj(dealerMap2.role)){
						dealerlist.push(dealerMap2);
					}
					if(ec.util.isObj(dealerMap3.role)){
						dealerlist.push(dealerMap3);
					}
					var objInstId = "";
					var deldealerflag = "";
					if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){
						objInstId = this.busiObj.instId;
					}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1"){
						objInstId = this.data.ooRoles[0].prodId+"_"+this.busiObj.objId;
						deldealerflag = "DEL";
					}
					var dealeraccNbr = this.busiObj.accessNumber;
					for(var d=0;d<dealerlist.length;d++){
						var $tr;
						if(d==0){
							$tr = $("<tr id='tr_"+objInstId+"' name='tr_"+objInstId+"'></tr>");
						}else{
							$tr = $('<tr name="tr_'+objInstId+'"></tr>');
						}
						var $tdType = $('<td></td>');
						var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
						var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
						$.each(OrderInfo.order.dealerTypeList,function(){
							if(dealerlist[d].role==this.PARTYPRODUCTRELAROLECD){
								$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected>"+this.NAME+"</option>");
							}else{
								$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
							}
						});
						$tdType.append($select);
						$tdType.append('<label class="f_red">*</label>');
						$tr.append("<td>"+dealeraccNbr+"</td>");
						if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){
							$tr.append("<td>移动电话（仅含本地语音）</td>");
						}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1"){
							$tr.append("<td>"+this.busiObj.objName+"</td>");
						}
						$tr.append($tdType);
						var $td;
						if(deldealerflag=="DEL"){
							if(d==0){
								$td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+dealerlist[d].staffid+'" value="'+dealerlist[d].staffname+'" class="inputWidth183px" readonly="readonly" style="margin-left:45px;"></input></td>');
							}else{
								$td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+dealerlist[d].staffid+'" value="'+dealerlist[d].staffname+'" class="inputWidth183px" readonly="readonly" ></input></td>');
							}
						}else{
							$td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+dealerlist[d].staffid+'" value="'+dealerlist[d].staffname+'" class="inputWidth183px" readonly="readonly" ></input></td>');
						}
						$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
						if(d==0){
							if(deldealerflag=="DEL"){
								$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>');
							}
							$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>');
						}else{
							$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>');
						}
						$tr.append($td);
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
						OrderInfo.SEQ.dealerSeq++;
						$("#dealerTbody").append($tr);
					}
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
//				if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.PROV_ISALE){
//					$('#orderProvAttrIsale').val(this.value);
//				}
			});
			order.main.reload();
		}
	};
	
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
	
	//订购附属销售品
	function addOfferSpec(prodId,offerSpecId){
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
							var res = query.offer.queryChangeAttachOffer(param);
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
	
	//判断是否需要补卡
	var _isChangeUim = function(objId){
		if(CONST.getAppDesc()==0){
			var prodClass = OrderInfo.oldprodInstInfos.prodClass;
			var prodId = OrderInfo.oldprodInstInfos.prodInstId;
			if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡，已经显示补卡,判断是否隐藏补卡
				var servSpec = CacheData.getServSpec(prodId,CONST.PROD_SPEC.PROD_FUN_4G);
				if(servSpec!=undefined && servSpec.isdel != "Y" && servSpec.isdel != "C"){ //有开通4G功能产品
					return true;
				}
			}
		}
		return false;
	};
	
	//根据产品id获取销售品成员
	var _getOfferMember = function(prodId){
		for(var j=0;j<OrderInfo.oldoffer.length;j++){
			for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
				if(offerMember.objInstId==prodId){
					return offerMember;
				}
			}
		}
		return {};
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
					ul_id : "item_order_"+prodInst.prodInstId,
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
			/*var paytype=$('select[name="pay_type_-1"]').val(); 
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
			}*/
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
	
	//初始化帐户展示
	var _initAcct = function(flag) {
		if((OrderInfo.actionFlag==1 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14) && flag==0){
			//新装默认新建帐户
			_createAcct();
			return;
		}
			//主副卡成员变更业务不能更改帐户，只展示主卡帐户
			if(OrderInfo.actionFlag==6 || OrderInfo.actionFlag==2){
				var param = {};
				if(flag==1){
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						param.prodId=OrderInfo.oldprodInstInfos[i].prodInstId;
						param.acctNbr=OrderInfo.oldprodInstInfos[i].accNbr;
						param.areaId=OrderInfo.oldprodInstInfos[i].areaId;
						var jr = $.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param);
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
					var jr = $.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param);
					if(jr.code==-2){
						$.alertM(jr.data);
						return;
					}
					var prodAcctInfos = jr.data;
					$("#accountDiv").find("label:eq(0)").text("主卡帐户：");
					$.each(prodAcctInfos, function(i, prodAcctInfo){
						$("<option>").text(prodAcctInfo.name+" : "+prodAcctInfo.acctCd).attr("value",prodAcctInfo.acctId)
						.attr("acctcd",prodAcctInfo.acctCd).appendTo($("#acctSelect"));					
					});
					$("#accountDiv").find("a:eq(0)").hide();
				}
			}else{
				//新装默认新建帐户
				_createAcct();
			}
	};
	
	//初始化订单标签
	var _initOrderLabel = function() {
		//订单标签
		$(".ordertabcon:first").show();
		$(".ordertab li:first").addClass("setorder");
		$(".ordertab li").each(function(index){
			$(this).click(function(){
				var orderSeq = $(this).attr("order");
				if (orderSeq > 1) {
					$(".order_copy").show();
				} else {
					$(".order_copy").hide();
				}
				$(this).addClass("setorder").siblings().removeClass("setorder");
				$(this).parents(".ordernav").parent().siblings(".ordercon").find(".ordertabcon").eq(index).show().siblings().hide();
			});
		});
	};
	
	//初始化uim卡号
	var _initUimCode = function() {
		var codeMsg=OrderInfo.provinceInfo.codeMsg;
		if(codeMsg!=null && codeMsg!=""){
			$.alert("提示",codeMsg);
		}else{
			var mktResInstCode=OrderInfo.newOrderNumInfo.mktResInstCode
			
			if(OrderInfo.newOrderNumInfo.mktResInstCode && mktResInstCode!=null && mktResInstCode!=""){
				var mktResInstCode = OrderInfo.newOrderNumInfo.mktResInstCode.split(",");
				for (var i = 0; i <= mktResInstCode.length; i ++) {
					//numAndUim-->号码_UIM
					var numAndUim=mktResInstCode[i];
					
					if(numAndUim!=null && numAndUim!=""){
						var codes=numAndUim.split("_");
						if(codes!=null && codes.length==2){
							var num=codes[0];
							var uim=codes[1];
							
							var uimParam={"instCode":uim};
							var response=$.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
							if(response.code==0){//成功
								if(response.data && response.data.mktResBaseInfo){
									if(response.data.mktResBaseInfo.statusCd=="1102"){
										//填值&修改样式和可点击按钮
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
										//处理umi卡不是预占状态
										$.alert("提示","UIM卡["+uim+"]不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
									}
								}else {
									//处理不存在情况
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
	};
	
	//初始化主副卡标签
	var _initOfferLabel = function() {
		//主副卡标签
		$.each($(".pdcard"),function(i, pdcard){
			$(this).find("li:first").addClass("setcon");
			if(!ec.util.isArray(OrderInfo.oldprodInstInfos)){
				$.each($(this).find("li"),function(j, li){
					$(this).click(function(){
						$(this).addClass("setcon").siblings().removeClass("setcon");
						$(this).parent().parent().next(".cardtabcon").find(".pdcardcon").eq(j).show().siblings().hide();
					});
				});
			}
		});
	};
	//初始化购物车属性
	var _initOrderAttr = function() {
		//客户类型,证件类型
		order.cust.partyTypeCdChoose($("#orderPartyTypeCd").children(":first-child"),"orderIdentidiesTypeCd");
		order.cust.identidiesTypeCdChoose($("#orderIdentidiesTypeCd").children(":first-child"),"orderAttrIdCard");
		//初始化使用人.根据开关
		var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "REAL_USER_" + OrderInfo.staff.areaId.substr(0, 3)});
		if (response.code == "0") {
			OrderInfo.realUserFlag = response.data;
		}
		if(response.data == "ON"){
			order.cust.partyTypeCdChoose($("#orderPartyTypeCdB").children(":first-child"),"orderIdentidiesTypeCdB");
			order.cust.identidiesTypeCdChoose($("#orderIdentidiesTypeCdB").children(":first-child"),"orderUserIdCard");
		}
	};
	
	//初始化省内订单属性
	var _initOrderProvAttr = function(){
		if(order.cust.fromProvFlag == "1" && ec.util.isObj(order.cust.provIsale)){
			$("#orderProvAttrIsale").val(order.cust.provIsale);
		}
	};
	
	//帐户信息-添加页面点击事件
	var _addEvent = function() {
		//页面点击帐户查询
		$('#acctQueryForm').bind('formIsValid', function(event, form) {
			var acctQueryParam;
			//1.根据接入号查询帐户
			if($("#chooseQueryAcctType").val()==1){
				if(!CONST.LTE_PHONE_HEAD.test($.trim($("#d_query_nbr input").val()))){
					$.alert("提示", "请输入有效的中国电信手机号");
					return;
				}
//				var param = {
//						accessNumber : $("#d_query_nbr input").val(),
//						prodPwd : $("#d_query_pwd input").val()
//				};
				//根据接入号查询帐户需先经过产品密码鉴权
//				var jr = $.callServiceAsJson(contextPath + "/order/prodAuth", param);
//				if (jr.code==0){
					acctQueryParam = {
						accessNumber : $("#d_query_nbr input").val()							
					};
//				} 
//				else{
//					$.alert("提示",jr.data);
//				}				
			} 
			//2.根据合同号查询帐户
			else if($("#chooseQueryAcctType").val()==2){
				if($.trim($("#d_query_cd input").val()) == null || $.trim($("#d_query_cd input").val()) == ""){
					$.alert("提示", "请输入合同号");
					return;
				}
				acctQueryParam = {
					acctCd : $("#d_query_cd input").val()
				};
			}
			//0.查询当前客户下帐户
			else{
				acctQueryParam = {
					custId : OrderInfo.cust.custId,
					isServiceOpen:"Y"
				};
			}	
			acctQueryParam.areaId=OrderInfo.getAreaId();
			
			$.callServiceAsJson(contextPath+"/token/pc/order/account", acctQueryParam, {
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$("#acctListTab tbody").empty();
					if(response.code==-2){
						$.alertM(response.data);
						return;
					}
					if(response.code==0){
						var returnMap = response.data;
						if(returnMap.resultCode==0){
							if(returnMap.accountInfos && returnMap.accountInfos.length > 0){
								$("#acctPageDiv").empty();
								common.page.init("acctPageDiv", 5, "pageId","queryAccount", returnMap.accountInfos);
							} 
							else{
								$("<tr><td colspan=4>未查询到帐户信息</td></tr>").appendTo($("#acctListTab tbody"));
							}
						}
						else{
							$("<tr><td colspan=4>"+returnMap.resultMsg+"</td></tr>").appendTo($("#acctListTab tbody"));
						}				
					}
					else{
						$("<tr><td colspan=4>"+response.data+"</td</tr>").appendTo($("#acctListTab tbody"));
					}
				}
			});
		}).ketchup({bindElement:"querAcctBtn"});

		$("#zhanghuclose").click(function(){
			easyDialog.close();
			//删除所有选择帐户监听
			$(document).removeJEventListener("queryAccount");
		});
		$(this).addJEventListener("queryAccount",function(data){
			_showAcct(data);
		});
		///选择查询帐户的条件
		$("#chooseQueryAcctType").change(function(){
			if($(this).val() == 1){//1.根据接入号查询
				$("#d_query_cd").remove();
				$("#querAcctBtn").parent().before("<dd id='d_query_nbr'>&nbsp;<input type='text' data-validate='validate(required:接入号不能为空) on(keyup blur)'" +
						" value='' class='inputWidth150px'></dd>");
//				$("#querAcctBtn").parent().before("<dd id='d_query_pwd'>&nbsp; 产品密码：&nbsp;<input  type='password' data-validate='validate(required:密码不能为空) on(keyup blur)' " +
//						"value='' class='inputWidth150px'></dd>");
			}else if($(this).val()==2){//2.根据合同号查询
				$("#d_query_nbr").remove();
//				$("#d_query_pwd").remove();
				$("#querAcctBtn").parent().before("<dd id='d_query_cd'>&nbsp;<input type='text' data-validate='validate(required:合同号不能为空) on(keyup blur)'" +
						" value='' class='inputWidth150px' ></dd>");
			}else{//0.查询当前客户下账户（默认）
				$("#d_query_cd").remove();
				$("#d_query_nbr").remove();
			}
		});
		$("#chooseQueryAcctType").change();
		//当前是否选用新帐户（是否展示自定义属性）
		$("#acctSelect").change(function(){
			if($(this).val()==-1){
				$(this).parent().find("a:eq(1)").hide();
				$("#defineNewAcct").show();
			}
			else{
				$(this).parent().find("a:eq(1)").show();
				$("#defineNewAcct").hide();
			}
		});
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
	
	//复制订单一的数据到当前订单
	var _copyOrder = function(scope) {
		//获取订单一的数据
		//主卡数据
//		var param = {};
//		var tarOrderSeq = $(".order_confirmation:visible").attr("order");
//		//付费方式
//		var paymethod = $("input[name=order_1_main_pay_type]:checked").val().trim();
//		if (paymethod) {
//			$("input[name=order_"+tarOrderSeq+"_main_pay_type][value="+paymethod+"]").attr("checked","checked");
//		}
//		//产品密码
//		var mainPwd  = $("#order_1_main_pwd").val();
//		if (mainPwd) {
//			$("#order_"+tarOrderSeq+"_main_pwd").val(mainPwd);
//		}
//		//判断是否有副卡
//		if ($("input[name=order_1_vice_1_pay_type]")[0]) {
//			$.each($("div[order=1]").find("div[vice=1]"),function(i,div){
//				//付费方式
//				var method = $("input[name=order_1_vice_"+(i+1)+"_pay_type]:checked").val();
//				//产品密码
//				if (method) {
//					$("input[name=order_"+tarOrderSeq+"_vice_"+(i+1)+"_pay_type][value="+method+"]").attr("checked","checked");
//				}
//				var pwd = $("#order_1_vice_"+(i+1)+"_pwd").val();
//				if (pwd) {
//					$("#order_"+tarOrderSeq+"_vice_"+(i+1)+"_pwd").val(pwd);
//				}
//			});
//		}
//		//协销人
//		var dealer = $("#order_1_dealer").val().trim();
//		if (dealer) {
//			$("#order_"+tarOrderSeq+"_dealer").val(dealer);
//			$("#order_"+tarOrderSeq+"_dealer").attr("staffId",$("#order_1_dealer").attr("staffId"));
//		}
//		//订单备注
//		var remark = $("#order_1_remark").val().trim();
//		if (remark) {
//			$("#order_"+tarOrderSeq+"_remark").val(dealer);
//		}
	};
	
	function _spec_parm(param){
		$.callServiceAsHtmlGet(contextPath + "/order/orderSpecParam",param, {
			"done" : function(response){
				if(response && response.code == -2){
					if(param.prodId!=-1&&param.prodId!="-1"){
						$("#"+param.ul_id).append("<li><label> </label></li>");
					}
					return ;
				}else if(response && (response.data == 0||response.data == "0")){
					if(param.prodId!=-1&&param.prodId!="-1"){
						$("#"+param.ul_id).append("<li><label> </label></li>");
					}
					//$.alert("提示","该产品无产品规格属性！");
					return;
				}
				//$("#order_spec_parm").append(response.data);
				$("#"+param.ul_id).append(response.data);
				
				//判断使用人产品属性是否必填
				_checkUsersProdAttr(param.prodId, $("#"+param.ul_id));
				
				//只有在新装的时候才可编辑“是否信控”产品属性
				var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId);
				if(xkDom.length == 1){
					//如果是6主副卡成员变更副卡加装，使副卡的信控属性与主卡保持一致
					if(OrderInfo.actionFlag == 6){
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
//							$.alert("提示","查询主卡产品实例属性未获取到“是否信控”属性值");
							$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value='']").remove(); //去除“请选择”空值选项
							$(xkDom).val("20"); //默认为“是”
							if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
								$(xkDom).attr("disabled","disabled");
							}
						}
					} else if (OrderInfo.actionFlag != 1 && OrderInfo.actionFlag != 14){
						$(xkDom).attr("disabled","disabled");
					} else {
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value='']").remove(); //去除“请选择”空值选项
						$(xkDom).val("20"); //默认为“是”
						if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
							$(xkDom).attr("disabled","disabled");
						}
					}
				}
				//新装--二次加载(是否信控)处理
				$.each(OrderInfo.newOrderInfo.checkMaskList,function(){
					$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+this.prodId+"").find("option[value='"+this.isCheckMask+"']").attr("selected","selected");
				});
				//判断是否是预付费，是：修改信控信息
				if(OrderInfo.newOrderInfo.isReloadFlag=="N"){
					var feetype = $("select[name='pay_type_-1']").find("option:selected").val();
					if(feetype=="2100"){
						order.main.feeTypeCascadeChange($("select[name='pay_type_-1']"),'-1');
					}
				}
				//主副卡暂存单二次加载
				if(order.memberChange.reloadFlag=="N"||OrderInfo.newOrderInfo.isReloadFlag=="N"||OrderInfo.reloadFlag=="N"){				
					var custOrderList ="";//order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
					if(order.memberChange.rejson&&order.memberChange.rejson.orderList&&order.memberChange.rejson.orderList.custOrderList[0].busiOrder){
						custOrderList = order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
					}else if(OrderInfo.newOrderInfo.result&&OrderInfo.newOrderInfo.result.orderList){
						custOrderList = OrderInfo.newOrderInfo.result.orderList.custOrderList[0].busiOrder;
					}else if(OrderInfo.data&&OrderInfo.data.orderList){
						custOrderList = OrderInfo.data.orderList.custOrderList[0].busiOrder;
					}
					$.each(custOrderList,function(){
						if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){//纳入新成员
							//封装产品属性
							if(this.data.boProdItems){
								var newboProdItems = this.data.boProdItems;
								$("[name=prodSpec_"+this.busiObj.instId+"]").each(function(){
									var tagName = this.tagName;
									var itemSpecId=$(this).attr("id").split("_")[0];
									var newid = $(this).attr("id");
									for(var i=0;i<newboProdItems.length;i++){
										if(newboProdItems[i].itemSpecId == itemSpecId && newid.split("_")[1]==newboProdItems[i].prodSpecItemId){
											if(tagName=="SELECT"){
												$("#"+newid+" option[value='"+newboProdItems[i].value+"']").attr("selected","selected");
											}else{
												$("#"+newid).val(newboProdItems[i].value);
											}
										}
									}
								});
							}
						}
					});
				}
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
	}
	
	//判断使用人产品属性是否必填，mantis 0147689: 关于政企单位用户实名制信息录入相关工作的要求 ；
	function _checkUsersProdAttr(prodId, dom){
		//1）新建客户新装，如果是政企客户，填单时必须填写使用人；
		//2）老客户新装，根据客户查询判断是政企客户（segmentId=1000）时，填单必须填写使用人；
		var itemId = CONST.PROD_ATTR.PROD_USER + '_' + prodId;
		if($('#'+itemId).length > 0){
			OrderInfo.roleType = "";
			//查分省前置校验开关
	        var propertiesKey = "FUKA_SHIYR_"+OrderInfo.staff.soAreaId.substring(0,3);
	        var isFlag = offerChange.queryPortalProperties(propertiesKey);
			var isOptional = true;
			if(OrderInfo.cust && OrderInfo.cust.custId && OrderInfo.cust.custId != '-1'){ //老客户
				
				if(_isCustomers(OrderInfo.cust.identityCd)){ //政企客户
					isOptional = false;
				}else if(OrderInfo.actionFlag =='6' && isFlag=="ON"){//主副卡加装副卡
					isOptional = false;
					OrderInfo.roleType = "Y";
				}else if(OrderInfo.actionFlag ==2 && prodId<0 && isFlag=="ON"){
					isOptional = false;
					OrderInfo.roleType = "Y";
				}else if(OrderInfo.actionFlag ==1 && prodId<-1 && isFlag=="ON"){//老客户新装加载副卡
					isOptional = false;
					OrderInfo.roleType = "Y";
				}
			} else { //新建客户
				if(OrderInfo.boCustInfos && OrderInfo.boCustInfos.partyTypeCd == '2'){ //政企客户
					isOptional = false;
				}else if(prodId !=-1 && isFlag=="ON"){//新装prodId不为-1表示有副卡新装
					OrderInfo.roleType = "Y";
					isOptional = false;
				}
			}
			if(!isOptional){
				for(var i=0;i<OrderInfo.prodAttrs.length;i++){
					if(OrderInfo.prodAttrs[i].id == itemId){
						OrderInfo.prodAttrs[i].isOptional = 'N';
						break;
					}
				}
				//绑定弹出框事件，用于定位客户
				$('#'+itemId).attr({'check_option':'N','readonly':'readonly','disabled':'disabled'}).show();
				$('#choose_user_btn_'+prodId).off('click').on('click',function(){
					order.main.toChooseUser(prodId);
				}).show();
				
			} else {
				$('#'+itemId).attr({'readonly':'readonly','disabled':'disabled'}).hide();
				$('#choose_user_btn_'+prodId).off('click').hide();
				$('#choose_user_btn_'+prodId).parent().hide();
			}
		}
	};
	
	//显示客户定位弹出框
	function _toChooseUser(prodId){
		if(OrderInfo.realUserFlag == "ON"){
			easyDialog.open({
				container : "choose_user_dialog_new"
			});
			$("#user_prodId").val(prodId);
			$("#chooseUserBt").removeClass("btna_o").addClass("btna_g");
			$('#chooseUserBt').off('click');
		}else {
			order.cust.queryForChooseUser = true; //标识客户定位是为了选择使用人
			order.cust.bindCustQueryForChoose(); //客户定位查询按钮
			$('#chooseUserBtn').off('click').on('click',function(){
				if(!!order.cust.tmpChooseUserInfo && order.cust.tmpChooseUserInfo.custId){
					//保存并显示使用人信息，清空弹出框的客户信息、临时保存的客户信息，关闭弹出框
					OrderInfo.updateChooseUserInfos(prodId, order.cust.tmpChooseUserInfo);
					$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId+'_name').val(order.cust.tmpChooseUserInfo.partyName);
					$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId).val(order.cust.tmpChooseUserInfo.custId);
					order.cust.tmpChooseUserInfo = {};
					
					easyDialog.close();
//					$('#p_cust_identityNum_choose').val('');
//					$('#chooseUserInfo td').html('');
					$('#chooseUserList').hide();
				} else {
					$.alert("提示","请定位客户作为使用人");
					return false;
				}
			});
			_showChooseUserDialog(null, prodId);
		}
	};
	
	/*
	 * 显示选择使用人弹出框，custInfo为空则使用prodId定位已保存的使用人信息，custInfo不为空则更新临时保存的使用人信息
	 */
	function _showChooseUserDialog(custInfo, prodId){
		custInfo = custInfo || OrderInfo.getChooseUserInfo(prodId);
		if(custInfo != null && custInfo.custId){
			//将客户信息作为使用人tmpChooseUserInfo，确认后保存到OrderInfo.choosedUserInfos
			order.cust.tmpChooseUserInfo = custInfo;
//			order.cust.tmpChooseUserInfo.prodId = '';
			$('#chooseUserInfoName').html(custInfo.partyName);
			$('#chooseUserInfoNum').html(custInfo.identityName + '/' + custInfo.idCardNumber);
			$('#chooseUserInfoAreaName').html(custInfo.areaName);
			$('#chooseUserList').show();
		} else {
			$('#chooseUserInfo td').html('');
			$('#chooseUserList').hide();
		}
		$('#p_cust_identityCd_choose option:first').attr('selected','selected');
		$('#p_cust_identityNum_choose').val('');
		order.cust.custidentidiesTypeCdChoose($('#p_cust_identityCd_choose'),'p_cust_identityNum_choose');
		if($.ketchup){
			$.ketchup.hideAllErrorContainer($("#custQueryForChooseForm"));
		}
		easyDialog.open({
			container : "choose_user_dialog",
			callback : function(){
				order.cust.queryForChooseUser = false; //关闭弹出框时重置标识位
				if($.ketchup){
					$.ketchup.hideAllErrorContainer($("#custQueryForChooseForm"));
				}
			}
		});
	};
	
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
	
	$('staff_dialog_close').onclick = function(){
		easyDialog.close();
	};
	
	//协销人-查询(发展人查询)
	function _queryStaffPage(qryPage){
		_queryStaff(qryPage,$("#dealer_id").val(),$("#objInstId").val());
	}
	
	//协销人-查询(发展人查询)
	function _queryStaff(qryPage,v_id,objInstId){
		if(qryPage == 0){
			$("#p_staff_areaId").val("");
			$("#p_staff_areaId_val").val("");
		}
		var param = {
				"dealerId":v_id,
				"areaId":$("#p_staff_areaId").val(),
				//"currentAreaAllName":$("#p_staff_areaId_val").val(),//去掉省市信息，因为带了>符号，会被过滤
				"currentAreaAllName":"",
				"staffName":$("#qryStaffName").val(),
				"staffCode":$("#qryStaffCode").val(),
				"salesCode":$("#qrySalesCode").val(),
				"pageIndex":qryPage,
				"objInstId":objInstId,
				"pageSize":10
		};
		
		$.callServiceAsHtml(contextPath + "/staffMgr/getStaffList",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					response.data='';
				}
				$("#div_staff_dialog").html(response.data);
				
				$("#staff_list_body tr").each(function(){$(this).off("click").on("click",function(event){
					_linkSelectPlan("#staff_list_body tr",this);
					event.stopPropagation();
					});});
				easyDialog.open({
					container : "div_staff_dialog"
				});
				
			}
		});	

	}
	
	var _linkSelectPlan=function(loc, selected){
		$(loc).removeClass("plan_select");
		$(loc).children(":first-child").html("");
		$(selected).addClass("plan_select");
		var nike="<i class='select'></i>";
		$(selected).children(":first").html(nike);
	};
	//协销人-修改
	function _setStaff(objInstId){			
		var $staff = $("#staff_list_body .plan_select");
		if($staff.length <= 0){
			$.alert("操作提示","请选择 协销人！");
			return;
		}
		//协销人开关
		var channelOnOFF=OrderInfo.rulesJson.channelOnOFF;
		if(channelOnOFF == "ON"){//开关打开如果无归属渠道则不允许选择
			var staffChannel = $staff.children().eq(6).html();  
			if(staffChannel == "无渠道"){
				$.alert("操作提示","您好，您选择的发展人没有归属渠道，请重新选择！");
				return;
			}
		}
		$staff.each(function(){
			var $channelList = $(this).find("td select[name='channel_list']");
			$("#dealerChannel_"+objInstId).empty(); 
			var $channelListOptions ="";
			if($channelList.length <= 0){
//				$.each(OrderInfo.channelList,function(){
//					if(this.isSelect==1)
//						$channelListOptions += "<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>";				
//				});
				$channelListOptions += "<option value='"+this.channelNbr+"' selected ='selected'>无渠道</option>";				
			}else{			
				$($channelList).find("option").each(function(){
					var $channelListOptionVal  = $(this).val() ; 
					var $channelListOptionName = $(this).html() ; 
					if(this.selected==true){
						$channelListOptions += "<option value='"+$channelListOptionVal+"' selected ='selected'>"+$channelListOptionName+"</option>";
					}else{
						$channelListOptions += "<option value='"+$channelListOptionVal+"'>"+$channelListOptionName+"</option>";
					}
				});
			}
			$("#dealerChannel_"+objInstId).append($channelListOptions);
			$("#dealer_"+objInstId).val($(this).attr("staffName")).attr("staffId", $(this).attr("staffId"));
		});
		easyDialog.close();
	}
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
		if(OrderInfo.cust.custId<0){
			$("#chooseQueryAcctType option[value=0]").remove();
			$("#chooseQueryAcctType").val(1);
			$("#d_query_cd").remove();
			$("#d_query_nbr").remove();
			$("#querAcctBtn").parent().before("<dd id='d_query_nbr'>&nbsp;<input type='text' data-validate='validate(required:接入号不能为空) on(keyup blur)'" +
					" value='' class='inputWidth150px'></dd>");
		}
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
	//增加传入帐户
	var _createAcctWithId = function() {
	   //帐户信息查询参数初始化 
		var acctQueryParam;
		acctQueryParam = {
			acctCd : OrderInfo.acct.acctCd,
			isServiceOpen:"Y"   //是否能力开放,Y-是,N-否
		};
		acctQueryParam.areaId=OrderInfo.getAreaId();
		
		$.callServiceAsJson(contextPath+"/token/pc/order/account", acctQueryParam, {
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
								$("#accountDiv").find("label:eq(0)").text("主卡帐户：");
								//将对应的帐号添加进去
								$.each(returnMap.accountInfos, function(i, prodAcctInfo){
									$("<option>").text(prodAcctInfo.name+" : "+prodAcctInfo.accountNumber).attr("value",prodAcctInfo.acctId)
									.attr("acctcd",prodAcctInfo.accountNumber).appendTo($("#acctSelect"));	
									//选中第一个传入的帐户
									if(i==0){
										$("#acctSelect").find("option[value="+prodAcctInfo.acctId+"]").attr("selected","selected");
									}
								});	
								$("#acctSelect").find("option[value='-1']").remove();//将新增的选项进行删除
								$("#accountDiv").find("a:eq(0)").hide();
								$("#acctSelect").parent().find("a:eq(1)").show();//显示帐户信息按钮
								$("#defineNewAcct").hide();//隐藏新增帐户对应内容
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
			isServiceOpen:"Y"   //是否能力开放,Y-是,N-否
		};			
		
		$.callServiceAsJson(contextPath+"/token/pc/order/account", acctQueryParam, {
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
	
	var _lastStep = function() {
		$.confirm("信息","确定回到上一步吗？",{
			yes:function(){
				OrderInfo.resetChooseUserInfo();
				
				//TODO　may initialize something;				
				var boProdAns = OrderInfo.boProdAns;
				var boProdAn = order.service.boProdAn;
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
				//若是购机或选号入口则将继续释放主卡以外的预占号码（过滤身份证预占的号码）
//				if(order.service.releaseFlag==1){
//					if(boProdAns.length>0){
//						for(var n=0;n<boProdAns.length;n++){
//							if(boProdAns[n].accessNumber==boProdAn.accessNumber || boProdAns[n].idFlag){
//								continue;
//							}
//							var param = {
//									numType : 1,
//									numValue : boProdAns[n].accessNumber
//							};
//							$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
//						}
//					}
//				}
				//若是套餐入口则将继续释放主副卡预占的号码（过滤身份证预占的号码）
//				if(order.service.releaseFlag==2){
//					if(boProdAns.length>0){
//						for(var n=0;n<boProdAns.length;n++){
//							if(boProdAns[n].idFlag){
//								continue;
//							}
//							var param = {
//									numType : 1,
//									numValue : boProdAns[n].accessNumber
//							};
//							$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
//						}
//					}
//					if(boProdAn.accessNumber!='')
//						order.phoneNumber.resetBoProdAn();
//				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
						if(boProdAns[n].idFlag!=undefined&&boProdAns[n].idFlag=='0'){
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
				
				$("#order_fill_content").empty();
				order.prepare.showOrderTitle();
				$("#order_tab_panel_content").show();
				order.prepare.step(1);
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
	}
	
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
		//“是否信控”产品属性，预付费时默认为“是”且不可编辑，其他默认为“是”但可编辑
		if(feeType == CONST.PAY_TYPE.BEFORE_PAY){
			//增加付费方式对翼支付助手功能产品的限制
			if((OrderInfo.actionFlag==1||OrderInfo.actionFlag==3||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14)
					&&CacheData.getServSpec(-1,381000960)!=null){
				var spec = CacheData.getServSpec(-1,381000960);
				if(spec.isdel==undefined||spec.isdel!="Y"){
					$.confirm("信息确认","您已选择开通【翼支付交费助手】功能产品，如果修改付费类型为预付费，其属性将赋为默认值！",{ 
						yesdo:function(){
							for ( var j = 0; j < spec.prodSpecParams.length; j++) {							
								var prodSpecParam = spec.prodSpecParams[j];
								prodSpecParam.setValue = prodSpecParam.value;
//								if (!!prodSpecParam.valueRange[0]) 
//									prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
								}
						},
						no:function(){
							$(dom).find("option[value='1200']").attr("selected",true);
							$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId).val("20").removeAttr("disabled");
						}
					});
				}				
			}
			$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId).val("20").attr("disabled","disabled");
		} else {
			if((OrderInfo.actionFlag==1||OrderInfo.actionFlag==3||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14)
					&&CacheData.getServSpec(-1,381000960)!=null){
				var spec = CacheData.getServSpec(-1,381000960);
				if(spec.isdel==undefined||spec.isdel!="Y"){
					$.confirm("信息确认","您已选择开通【翼支付交费助手】功能产品，如果修改付费类型为后付费，将置空其选择属性，且属性不再可选！！",{ 
						yesdo:function(){
							for ( var j = 0; j < spec.prodSpecParams.length; j++) {							
								var prodSpecParam = spec.prodSpecParams[j];
								prodSpecParam.setValue = "";
							}
						},
						no:function(){
							$(dom).find("option[value='2100']").attr("selected",true);
							$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId).val("20").attr("disabled","disabled");
						}
					});
				}				
			}
			$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId).val("20").removeAttr("disabled");
		}
	};
	
	var _reload = function(){
		//主副卡暂存单二次加载
		if(order.memberChange.reloadFlag=="N"){
			var custOrderList = order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
			//订购可选包和功能产品
			$.each(custOrderList,function(){
				//可选包
				if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="2"){
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
					var offermap = this;
					var objInstId = "";
					$.each(order.memberChange.oldmembers.objInstId,function(){
						if(this.instId==offermap.busiObj.instId){
							objInstId = this.objInstId;
							return false;
						}
					});
					AttachOffer.delOffer(objInstId,this.busiObj.instId,"reload");
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
	};
	
	var _queryGroupPage=function(pageIndex){
		_queryGroup($("#queryType").val(),pageIndex,$("#id").val());
	};
	
	//群号查询
	function _queryGroup(queryType,pageIndex,id){
//		if(pageIndex!=0){
//			if($("#accessNbr").val()==""){
//				$.alert("提示","接入号不能为空");
//				return;
//			}
//			if($("#BIZID").val()==""){
//				$.alert("提示","群号码不能为空");
//				return;
//			}
//		}
		var param = {
				"custId":"",
				"curPage":pageIndex,
				"pageSize":10,
				"acctNbr":$("#accessNbr").val(),
				"areaId":OrderInfo.getAreaId(),
				"lanId":OrderInfo.getAreaId(),
				"extCustId":"",
				"BIZID":$("#BIZID").val(),
				"areaNbr":"",
				"prodClass":"12",
				"queryTypeTmp":queryType,
				"objInstId":id
		};
		$.callServiceAsHtml(contextPath + "/offer/getGroupList",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code == -2){
					$.alertM(response.data);
					return;
				}
//				if(!response){
//					response.data='';
//				}
				$("#div_staff_dialog").html(response.data);
				$("#group_list_body tr").each(function(){$(this).off("click").on("click",function(event){
					_linkSelectPlan("#group_list_body tr",this);
					event.stopPropagation();
					});});
				easyDialog.open({
					container : "div_staff_dialog"
				});
			}
		});	
	};
	
	//群信息-修改
	var _setGroup=function(objInstId){
		var $group = $("#group_list_body .plan_select");
		$group.each(function(){
			$("#"+objInstId).val($(this).attr("accessNumber"));
		});
		if($group.length > 0){
			easyDialog.close();
		}else{
			$.alert("操作提示","请选择群！");
		}
	};
	
	var _isCustomers=function(id){
		  //政企客户
		  if(id==6|| id==7 || id== 15|| id==34 || id==43){
			  return true;
		  }
		  else{
			  return false;
		  }
	  };
	//发展人-查询
	function _queryDealer(){
		var param = {
				"dealerId":"",
				"areaId":OrderInfo.staff.soAreaId.substring(0,3) + "0000",
				"currentAreaAllName":"",
				"staffName":"",
				"staffCode":OrderInfo.provinceInfo.salesCode,
				"salesCode":"",
				"pageIndex":1,
				"objInstId":"",
				"pageSize":10
		};
		$.callServiceAsJson(contextPath + "/token/pc/cust/getDealerList",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if (response.code == 0) {
					var list = response.data;
					var staffName = list[0].staffName;
					var staffId = list[0].staffId;
					$("#dealerTbody").find("tr").each(function(){
						var td = $(this).children("td").eq(3).children("input");
						var id = td.attr("id");
						$("#"+id).attr("value",staffName);
						$("#"+id).attr("staffid",staffId);
						return false;
					});
				}else{
					$.alertM(response.data);
				}
			}
		});	
	}
	
	return {
		buildMainView : _buildMainView,
		copyOrder : _copyOrder,
		spec_parm:_spec_parm,
		check_parm:_check_parm,
		queryStaff:_queryStaff,
		queryStaffPage:_queryStaffPage,
		setStaff:_setStaff,
		chooseAcct : _chooseAcct,
		check_parm_self:_check_parm_self,
		createAcct : _createAcct,
		createAcctWithId:_createAcctWithId,
		showNewAcct : _showNewAcct,
		acctDetail : _acctDetail,
		//spec_parm_change: _spec_parm_change,
		spec_parm_change_save:_spec_parm_change_save,
		//spec_password_change:_spec_password_change,
		//spec_password_change_save:_spec_password_change_save,
		paymethodChange:_paymethodChange,
		templateTypeCheck:_templateTypeCheck,
		lastStep : _lastStep,
		genRandPass6:_genRandPass6,
		genRandPass6Input:_genRandPass6Input,
		passwordCheckInput:_passwordCheckInput,
		passwordCheckVal:_passwordCheckVal,
		checkIncreace6:_checkIncreace6,
		feeTypeCascadeChange:_feeTypeCascadeChange,
		isChangeUim:_isChangeUim,
		loadAttachOffer:_loadAttachOffer,
		queryGroupPage:_queryGroupPage,
		queryGroup:_queryGroup,
		setGroup:_setGroup,
		getOfferMember:_getOfferMember,
		toChooseUser : _toChooseUser,
		showChooseUserDialog : _showChooseUserDialog,
		reload:_reload,
		initAcct:_initAcct,
		queryDealer:_queryDealer,
		initOrderAttr:_initOrderAttr
	};
})();


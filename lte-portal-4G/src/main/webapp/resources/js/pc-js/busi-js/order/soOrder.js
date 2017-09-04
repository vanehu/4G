/**
 * 受理订单对象
 * 
 * @author wukf
 */
CommonUtils.regNamespace("SoOrder");

/** 受理订单对象*/
SoOrder = (function() {
	
	//订单准备
	var _builder = function() {
		if(query.offer.loadInst()){  //加载实例到缓存
			SoOrder.initFillPage();
			return true;
		}else{
			return false;
		};
	};
	//主副卡订单确认信息
	var _viceParam="";
	//初始化填单页面，为规则校验类型业务使用
	var _initFillPage = function(){
		SoOrder.initOrderData();
		SoOrder.step(1); //显示填单界面
		OrderInfo.order.step=1;//订单页面
		_getToken(); //获取页面步骤
	}; 
	
	//初始化订单数据
	var _initOrderData = function(){
		OrderInfo.confidence = 0 ;
		OrderInfo.faceVerifyFlag = "N" ;
		OrderInfo.resetSeq(); //重置序列
		OrderInfo.resetData(); //重置 数据
		OrderInfo.orderResult = {}; //清空购物车
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.getAreaId();
		OrderInfo.resetChooseUserInfo();
	};
	
	var _getCheckOperatSpec=function(){
		var url=contextPath+"/token/pc/order/getCheckOperatSpec";//获取是否有分段的权限
		var response = $.callServiceAsJson(url, {});
		OrderInfo.zcd_privilege=response.data;
	};
	
	//提交订单节点
	var _submitOrder = function(data) {
		_getCheckOperatSpec();
		if(_getOrderInfo(data)){
			//过滤订单数据判断是否有客户变更
			OrderInfo.oneCardFiveNum = [];
			//订单提交
			var url = contextPath+"/token/pc/order/orderSubmit";
			if(OrderInfo.order.token!=""){
				url = contextPath+"/token/pc/order/orderSubmit?token="+OrderInfo.order.token;
			}
			cert.fillupOrderInfoCertReaderCustInfos();
			$.callServiceAsJson(url,JSON.stringify(OrderInfo.orderData), {
				"before":function(){
					$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
				},"always":function(){
					//$.unecOverlay();
				},	
				"done" : function(response){
					$.unecOverlay();
					_getToken();
					if (response.code == 0) {
						var data = response.data;
//						ruleInfos=[{
//							"ruleCode" :"LTESC920203",
//							"ruleDesc":"【用户改套餐后其套餐资费低于靓号保底需保底补差】",
//							"ruleLevel":"0"	
//					}
//					
//					];
//							data.result.ruleInfos=ruleInfos;				
//						if(data.checkRule!=undefined && data.checkRule=="notCheckRule"){
//							var ruleDesc = "";
//							$.each(data.result.ruleInfos, function(){
//								ruleDesc += this.ruleDesc+"<br/>";
//							});
//							$.alert("提示",ruleDesc);
//							OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
//							OrderInfo.resetSeq(); //重置序列
//						}
						
						if(data.checkRule!=undefined && data.checkRule!="notCheckRule"){
							//新规则校验
							var orderdata=response.data;
							var checkParams={
								"olId":orderdata.rolId,
								"soNbr":orderdata.rsoNbr,
								"areaId" : OrderInfo.staff.areaId,
								"chargeItems":[]
							};
							
							var checkUrl=contextPath+"/token/pc/order/checkRuleToProv";
							$.callServiceAsJson(checkUrl,checkParams, {
								"before":function(){
									$.ecOverlay("<strong>正在下省校验中,请稍候...</strong>");
								},
								"always":function(){
									
								},	
								"done" : function(checkResponse){
									//关闭弹出提示
									$.unecOverlay();
									var provCheckResult;
									if (checkResponse.code == 0) {
										var dataSub = checkResponse.data;
										//存在可继续受理的省内校验错误，需要在前台进行提示
										if(dataSub.returnCode!=null && dataSub.returnCode!="0000"){
											dataSub.provCheckErrorCode = dataSub.data.returnCode;
											dataSub.provCheckErrorMsg = "";
											if(dataSub.returnCode!=undefined && dataSub.returnCode!=null){
												response.datadataSub.provCheckErrorMsg +=  "【错误编码："+dataSub.returnCode+"】";
											}
											//省内校验欠费的编码和提示
											if(dataSub.returnCode=="110019" || dataSub.returnCode=="110145"){
												dataSub.provCheckErrorMsg += "该用户所在账户存在欠费，请提醒用户及时缴费，避免因欠费影响用户正常使用和业务办理，以及欠费滞纳金的产生。";
											}
										}
										
										if(dataSub.checkResult!=undefined){
											OrderInfo.checkresult=dataSub.checkResult;		
										}
										
										var returnData = _gotosubmitOrder(response.data);
										_orderConfirm(returnData);
									}else{	
										data.provCheckError = "Y";
										if(checkResponse.data && checkResponse.data.resultMsg!=undefined && $.trim(checkResponse.data.resultMsg)!=""){
											data.provCheckErrorMsg = checkResponse.data.resultMsg;
										} else if(checkResponse.data.errMsg!=undefined && $.trim(checkResponse.data.errMsg)!=""){
											data.provCheckErrorMsg = checkResponse.data.errMsg;
											if(checkResponse.data.errCode){
												data.provCheckErrorMsg = "【错误编码："+checkResponse.data.errCode+"】" + data.provCheckErrorMsg;
											}
											if(checkResponse.data.errData){
												data.provCheckErrorData=checkResponse.data.errData;
												
												data.provCheckErrorMsg+=","+data.provCheckErrorData;
											}
											if(checkResponse.data.paramMap){
												data.provCheckErrorMsg += "【入参："+checkResponse.data.paramMap+"】";
											}
										} else{
											data.provCheckErrorMsg = "未返回错误信息，可能是下省请求超时，请返回填单页面并稍后重试订单提交。";
										}
										var returnData = _gotosubmitOrder(data);
										_orderConfirm(returnData);			
									}
								},
								"fail":function(response){
									$.unecOverlay();
									$.alert("提示","下省校验失败");
								}
							});
						}else{
							var returnData = _gotosubmitOrder(response.data);
							_orderConfirm(returnData);
						}
					}else{
						$.alertM(response.data);
						OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
						OrderInfo.resetSeq(); //重置序列
					}
				}
			});
		}	
	};
	
	var _gotosubmitOrder = function(orderdata){
		var url = contextPath+"/token/pc/order/gotosubmitOrder";
		$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
		var response = $.callServiceAsHtml(url,JSON.stringify(orderdata));
		$.unecOverlay();
		return response.data;
	};
	
	//填充订单信息
	var _getOrderInfo = function(data){
		if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){ //终端购买、退换货
			//如果是合约机换货，已经加载缓存
			if (OrderInfo.actionFlag==18 && data.boActionType.actionClassCd==CONST.ACTION_CLASS_CD.OFFER_ACTION) {
				
			} else {
				query.offer.loadInst(); //加载实例到缓存
			}
			couponSale(data);
			if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
				OrderInfo.orderData.orderList.orderListInfo.soNbr = OrderInfo.order.soNbr;
			}
			return true;
		}
		var busiOrders = [];  //存放订单项数组
		var custOrderAttrs = []; //获取订单属性数组
		var itemValue="N";
		if(_setOfferType()){
			itemValue="Y";
		}
		custOrderAttrs.push({
			itemSpecId : CONST.BUSI_ORDER_ATTR.THRETOFOUR_ITEM,//3转4标志
			value : itemValue
		});
		custOrderAttrs.push({ //订单时长
			itemSpecId : "111111113",
			value : OrderInfo.orderlonger
		});	
		custOrderAttrs.push({ //业务类型
			itemSpecId : CONST.BUSI_ORDER_ATTR.BUSITYPE_FLAG,
			value : OrderInfo.busitypeflag
		});
		
		custOrderAttrs.push({ //定位客户时长
			itemSpecId : "30010050",
			value : OrderInfo.custorderlonger
		});	
		custOrderAttrs.push({ //
			itemSpecId : "800000064",
			value :"PC"
		});	
		// 
		custOrderAttrs.push({ //
			itemSpecId : "800000048",
			value :OrderInfo.recordId
		});	
		if(OrderInfo.zcd_privilege==='0'){
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.ZCD_ITEM,//是否是暂存单
				value : 0
			});
		}
		if(ec.util.isObj(OrderInfo.order.soNbr)){
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.SO_NBR,//全量查询的soNbr
				value : OrderInfo.order.soNbr
			});
		}
		//添加订单属性，isale下省流水号
//		if(order.cust.fromProvFlag == "1"){
		if($("#orderProvAttrIsale").length){
			order.cust.provIsale = $.trim($("#orderProvAttrIsale").val());
		}
		if(ec.util.isObj(order.cust.provIsale)){
			order.cust.fromProvFlag = "1";
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.PROV_ISALE,
				value : order.cust.provIsale
			});	
		} else {
			order.cust.fromProvFlag = "0";
		}
//		}
		if(!_checkData()){ //校验通过
			return false;
		}
		//订单备注前置
		var remark = $('#order_remark').val(); 
		if(ec.util.isObj(remark)){
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});	
		}
		
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){ //新装
			_createOrder(busiOrders); //新装
		}else if (OrderInfo.actionFlag==2){ //套餐变更
			offerChange.changeOffer(busiOrders);	
		}else if (OrderInfo.actionFlag==3){ //可选包变更		
			_createAttOrder(busiOrders); //附属销售品变更
			if(busiOrders.length==0){
				$.alert("提示","没有做任何业务，无法提交");
				return false;
			}
		}else if (OrderInfo.actionFlag==4){ //客户资料变更
			_createCustOrder(busiOrders,data); //附属销售品变更
		}else if (OrderInfo.actionFlag==5){//销售品成员变更拆副卡
			_delViceCard(busiOrders,data);
		}else if (OrderInfo.actionFlag==6){ //销售品成员变更加装副卡
			_createMainOrder(busiOrders);
		}else if (OrderInfo.actionFlag==7){ //拆主卡保留副卡
			_delAndNew(busiOrders,data); 
		}else if (OrderInfo.actionFlag==8){ //新建客户单独订单
			_createCustOrderOnly(busiOrders,data);
		}else if (OrderInfo.actionFlag==9){ //活卡销售返档
			_ActiveReturnOrder(busiOrders,data); 
		}else if (OrderInfo.actionFlag==10){ //传到节点busiOrder 
			busiOrders = data;
		}else if (OrderInfo.actionFlag==11){ //撤单,有做特殊处理
			busiOrders = data;
		}else if (OrderInfo.actionFlag==12){ //加入退出组合
			busiOrders = data;
		}else if(OrderInfo.actionFlag==16){ //改号
			_changeNumber(busiOrders);	
		}else if(OrderInfo.actionFlag==19){ //返销
			OrderInfo.actionClassCd = OrderInfo.orderItemCd;
			_fillBusiOrder(busiOrders,data,"N"); //填充业务对象节点	
		}else if(OrderInfo.actionFlag==20){ //返销
			_delAndNew(busiOrders,data); 
		}else if(OrderInfo.actionFlag==21){ //销售品成员变更保留副卡订购新套餐
			_delViceCardAndNew(busiOrders,data);
		}else if(OrderInfo.actionFlag== 22 ){ //补换卡
			busiOrders = data;
		}else if(OrderInfo.actionFlag == 23){//异地补换卡
			busiOrders = data;
			//异地补换卡的订单地区为当前渠道对应的地区
			OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.staff.areaId;
			//外部客户ID
			var corCustId = $("#custInfos").attr("corCustId");
			if(ec.util.isObj(corCustId)){
				var custOrderAttr1 = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.COR_CUST_ID,
					value : corCustId
				};
				custOrderAttrs.push(custOrderAttr1);
			}
			//省内客户ID
			var extCustId = $("#custInfos").attr("extCustId");
			if(ec.util.isObj(extCustId)){
				var custOrderAttr2 = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.EXT_CUST_ID,
					value : extCustId
				};
				custOrderAttrs.push(custOrderAttr2);
			}
			//省内产品实例ID
			var extProdInstId = order.prodModify.choosedProdInfo.extProdInstId;
			if(ec.util.isObj(extProdInstId)){
				var custOrderAttr3 = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.EXT_PROD_INST_ID,
						value : extProdInstId
				};
				custOrderAttrs.push(custOrderAttr3);
			}
			//外部产品实例ID
			var corProdInstId = order.prodModify.choosedProdInfo.corProdInstId;
			if(ec.util.isObj(corProdInstId)){
				var custOrderAttr4 = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.COR_PROD_INST_ID,
						value : corProdInstId
				};
				custOrderAttrs.push(custOrderAttr4);
			}
			//营销资源省内实例ID
			var extCouponInstanceId = order.prodModify.choosedProdInfo.extCouponInstanceId;
			if(ec.util.isObj(extCouponInstanceId)){
				var custOrderAttr5 = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.EXT_COUPON_INST_ID,
						value : extCouponInstanceId
				};
				custOrderAttrs.push(custOrderAttr5);
			}
			//营销资源外部实例ID
			var corCouponInstanceId = order.prodModify.choosedProdInfo.corCouponInstanceId;
			if(ec.util.isObj(corCouponInstanceId)){
				var custOrderAttr6 = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.COR_COUPON_INST_ID,
						value : corCouponInstanceId
				};
				custOrderAttrs.push(custOrderAttr6);
			}
		}else{  //默认单个业务动作
			_fillBusiOrder(busiOrders,data,"N"); //填充业务对象节点
		}
		
		//老用户副卡纳入帐号修改结点
		if(query.common.queryPropertiesStatus("ADD_OLD_USER_MOD_ACCT_"+OrderInfo.getAreaId().substring(0,3)))
			if(!_oldprodAcctChange(busiOrders)) 
				return false;
				
		//订单填充经办人信息
		_addHandleInfo(busiOrders, custOrderAttrs);
		//使用人节点
		if(OrderInfo.realUserFlag == "ON"){
			_createCustInfo(busiOrders);
		}
		OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs = custOrderAttrs; //订单属性数组
		OrderInfo.orderData.orderList.orderListInfo.extCustOrderId = OrderInfo.provinceInfo.provIsale; //省份流水
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = busiOrders; //订单项数组
		if($("#isTemplateOrder").attr("checked")=="checked"){ //批量订单
			OrderInfo.orderData.orderList.orderListInfo.isTemplateOrder ="Y";
			OrderInfo.orderData.orderList.orderListInfo.templateOrderName =$("#templateOrderName").val();
			if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==14){
				OrderInfo.orderData.orderList.orderListInfo.templateType = $("#templateOrderDiv").find("select").val(); //批量换挡
			}else if(OrderInfo.actionFlag==2){
				OrderInfo.orderData.orderList.orderListInfo.templateType = 5; //批量换挡
			}else if(OrderInfo.actionFlag==3){
				OrderInfo.orderData.orderList.orderListInfo.templateType = 2; //批量可选包订购退订
			}
		}else{
			OrderInfo.orderData.orderList.orderListInfo.isTemplateOrder ="N";
		}
		if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
			OrderInfo.orderData.orderList.orderListInfo.soNbr = OrderInfo.order.soNbr;
		}
		if(OrderInfo.preliminaryInfo !=null && OrderInfo.preliminaryInfo.businessType != null){
			var  mainOfferSpecIdParam = { //套餐id
				itemSpecId : CONST.BUSI_ORDER_ATTR.MAIN_OFFER_SPECID,
				value : OrderInfo.mainOfferSpecId
			};
			OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs.push(mainOfferSpecIdParam);
			var  creditLineParam = { //征信信用额度
					itemSpecId : CONST.BUSI_ORDER_ATTR.CREDIT_LINE,
					value : OrderInfo.preliminaryInfo.money
			};
			OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs.push(creditLineParam);
		}
		return true;
	};
	
	//终端销售
	var couponSale = function(data){
		var coupons = data.coupons;
		OrderInfo.getOrderData(); //获取订单提交节点
		//新建客户、或是老客户、或是虚拟客户
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		if (OrderInfo.cust.custId == -1) {
			OrderInfo.createCust(busiOrders);
		} else if (OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != "") {
			OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		} else {
			OrderInfo.orderData.orderList.orderListInfo.partyId = CONST.CUST_COUPON_SALE;
		}
		if (OrderInfo.actionFlag == 18) {
			OrderInfo.orderData.orderList.orderListInfo.partyId = coupons[0].partyId;
		}
		//填入订单
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : data.busiObj,  
			boActionType : data.boActionType, 
			data:{
				bo2Coupons:[]
			}
		};
		busiOrder.data.bo2Coupons = coupons;
		if (data.dealers) {
			busiOrder.data.busiOrderAttrs = data.dealers;
		}
		busiOrders.push(busiOrder);
	};
	
	//订单确认
	var _orderConfirm = function(data){
		SoOrder.step(2,data);
		//记录olId到cookie，用于取消订单
		SoOrder.delOrderBegin();
		
		if(OrderInfo.actionFlag==1 ||OrderInfo.actionFlag==14){ //新装
			$("#orderTbody").append("<tr><td >套餐名称：</td><td>"+OrderInfo.offerSpec.offerSpecName+"</td></tr>");
			var $span = $("<span>订购</span>"+OrderInfo.offerSpec.offerSpecName+"<span class='showhide'></span>");
			$("#tital").append($span);
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				$.each(this.prodInsts,function(){
					$("#orderTbody").append("<tr ><td>"+this.offerRoleName+"号码：</td><td>"
							+OrderInfo.getProdAn(this.prodInstId).accessNumber+"</td></tr> ");
				});
			});
			
			if(order.service.oldMemberFlag){
				for(var j=0;j<OrderInfo.oldoffer.length;j++){
					for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
						var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
						if(offerMember.objType==CONST.OBJ_TYPE.PROD){
							$("#orderTbody").append("<tr ><td>纳入副卡号码：</td><td>"+offerMember.accessNumber+"</td></tr> ");	
						}
					}
				}
			}
		}else if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){ //裸机销售
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#order_tab_panel_content").hide();
			$("#orderTbody").append("<tr><td >终端名称：</td><td>"+OrderInfo.businessName+"</td></tr>");
			var busiOrder = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;
			var bo2Coupons = undefined;
			if (OrderInfo.actionFlag==13) {
				for(var i=0; i<busiOrder.length; i++) {
					var boActionType = busiOrder[i].boActionType;
					if (boActionType.actionClassCd==CONST.ACTION_CLASS_CD.MKTRES_ACTION
							&& boActionType.boActionTypeCd==CONST.BO_ACTION_TYPE.COUPON_SALE) {
						bo2Coupons = busiOrder[i].data.bo2Coupons;
					}
				}
				$("#orderTbody").append("<tr><td >终端串码：</td><td>"+bo2Coupons[0].couponInstanceNumber+"</td></tr>");
			} else if (OrderInfo.actionFlag==17) {
				for(var i=0; i<busiOrder.length; i++) {
					var boActionType = busiOrder[i].boActionType;
					if (boActionType.actionClassCd==CONST.ACTION_CLASS_CD.MKTRES_ACTION
							&& boActionType.boActionTypeCd==CONST.BO_ACTION_TYPE.RETURN_COUPON) {
						bo2Coupons = busiOrder[i].data.bo2Coupons;
					}
				}
				$("#orderTbody").append("<tr><td >终端串码：</td><td>"+bo2Coupons[0].couponInstanceNumber+"</td></tr>");
			} else if (OrderInfo.actionFlag==18) {
				for(var i=0; i<busiOrder.length; i++) {
					var boActionType = busiOrder[i].boActionType;
					if (boActionType.boActionTypeCd==CONST.BO_ACTION_TYPE.EXCHANGE_COUPON) {
						bo2Coupons = busiOrder[i].data.bo2Coupons;
					}
				}
				var oldCoupon = null;
				var newCoupon = null;
				if (bo2Coupons[0].state=="DEL") {
					oldCoupon = bo2Coupons[0];
					newCoupon = bo2Coupons[1];
				} else {
					oldCoupon = bo2Coupons[1];
					newCoupon = bo2Coupons[0];
				}
				$("#orderTbody").append("<tr><td >旧终端串码：</td><td>"+oldCoupon.couponInstanceNumber+"</td></tr>");
				$("#orderTbody").append("<tr><td >新终端串码：</td><td>"+newCoupon.couponInstanceNumber+"</td></tr>");
			}
			var $span = $("<span>"+OrderInfo.actionTypeName+"</span>"+OrderInfo.businessName+"<span class='showhide'></span>");
			$("#tital").append($span);
		}else{ //二次业务
			var prod = order.prodModify.choosedProdInfo;
			$("#orderTbody").append("<tr id='offerSpecName'><td >套餐名称：</td><td>"+prod.prodOfferName+"</td></tr>");
			$("#orderTbody").append("<tr id='accNbrTr'><td>手机号码：</td><td>"+prod.accNbr+"</td></tr> ");	
			if(OrderInfo.actionFlag==2){ //套餐变更 
				OrderInfo.actionTypeName = "套餐变更";
				$("#orderTbody").append("<tr><td >新套餐名称：</td><td>"+OrderInfo.offerSpec.offerSpecName+"</td></tr>");
				$("#accNbrTr").hide();
				for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) { //遍历主销售品构成
					var offerMember = OrderInfo.offer.offerMemberInfos[i];
					if(offerMember.objType==CONST.OBJ_TYPE.PROD){
						$("#orderTbody").append("<tr ><td>"+offerMember.roleName+"号码：</td><td>"+offerMember.accessNumber+"</td></tr> ");	
					}
				}
				if(offerChange.newMemberFlag){
					$.each(OrderInfo.boProdAns,function(){
						$("#orderTbody").append("<tr ><td>纳入副卡号码：</td><td>"+this.accessNumber+"</td></tr> ");	
					});
				}
				if(offerChange.oldMemberFlag){
					for(var j=0;j<OrderInfo.oldoffer.length;j++){
						for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
							var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
							if(offerMember.objType==CONST.OBJ_TYPE.PROD){
								$("#orderTbody").append("<tr ><td>纳入副卡号码：</td><td>"+offerMember.accessNumber+"</td></tr> ");	
							}
						}
					}
				}
			}else if(OrderInfo.actionFlag==3){ //可选包变更 
				OrderInfo.actionTypeName = "订购/退订可选包与功能产品";
			}else if(OrderInfo.actionFlag==4||OrderInfo.actionFlag==8){ //客户资料变更与新建客户单独
				$("#offerSpecName").hide();
				$("#accNbrTr").hide();
			}else if(OrderInfo.actionFlag==5){  //主副卡成员变更拆除副卡
				$("#accNbrTr").hide();
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						if(this.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD && this.isRemove=="Y"){
							$("#orderTbody").append("<tr ><td>拆除副卡号码：</td><td>"+this.accessNumber+"</td></tr> ");	
						}else {
							$("#orderTbody").append("<tr ><td>"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");	
						}
					}
				});
				OrderInfo.actionTypeName = "主副卡成员变更";
			}else if(OrderInfo.actionFlag==6){ //主副卡成员变更纳入副卡
				$("#accNbrTr").hide();
				if(ec.util.isArray(OrderInfo.viceOfferSpec)){
					$.each(OrderInfo.viceOfferSpec,function(){
						$("#orderTbody").append("<tr><td >新套餐名称：</td><td>"+this.offerSpecName+"</td></tr>");
					});
				}
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						$("#orderTbody").append("<tr ><td>"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");
					}
				});
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						if(this.roleCd != CONST.MEMBER_ROLE_CD.MAIN_CARD){
							var knew="";
							var del="";
							var objInstId=this.objInstId;
							$.each(_viceParam,function(i,val){
								if(val.objInstId==objInstId&&val.knew=="Y"){
									knew="Y";
								}
								if(val.objInstId==objInstId&&val.del=="Y"){
									del="Y";
								}
							});
							if(knew=="Y"){
								$("#orderTbody").append("<tr ><td>订购"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");
							}else if(del=="Y"){
								$("#orderTbody").append("<tr ><td>拆除"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");	
							}
						}
					}
				});
				$.each(OrderInfo.boProdAns,function(){
					$("#orderTbody").append("<tr ><td>纳入副卡号码：</td><td>"+this.accessNumber+"</td></tr> ");	
				});
				if(ec.util.isArray(OrderInfo.oldAddNumList)){
					for(var i=0;i<OrderInfo.oldAddNumList.length;i++){
						$("#orderTbody").append("<tr ><td>纳入副卡号码：</td><td>"+OrderInfo.oldAddNumList[i].accNbr+"</td></tr> ");	
					}
				}
				OrderInfo.actionTypeName = "主副卡成员变更";
			}else if(OrderInfo.actionFlag==7){ //主副卡拆机保留副卡
				$("#accNbrTr").hide();
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						if(this.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
							$("#orderTbody").append("<tr ><td>拆除"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");	
						}else {
							var del="";
							var accessNumber=this.accessNumber;
							$.each(_viceParam,function(i,val){
								if(val.accessNumber==accessNumber&&val.del=="N"){
									del="N";
								}
							});
							if(del=="N"){
								$("#orderTbody").append("<tr ><td>订购"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");
							}else{
								$("#orderTbody").append("<tr ><td>拆除"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");	
							}
						}
					}
				});
				OrderInfo.actionTypeName = CONST.getBoActionTypeName(OrderInfo.boActionTypeCd);
			}else if(OrderInfo.actionFlag==21){ //主副卡成员变更
				if(ec.util.isArray(OrderInfo.viceOfferSpec)){
					$.each(OrderInfo.viceOfferSpec,function(){
						$("#orderTbody").append("<tr><td >新套餐名称：</td><td>"+this.offerSpecName+"</td></tr>");
					});
				}
				$("#accNbrTr").hide();
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						if(this.roleCd != CONST.MEMBER_ROLE_CD.MAIN_CARD){
							var knew="";
							var del="";
							var objInstId=this.objInstId;
							$.each(_viceParam,function(i,val){
								if(val.objInstId==objInstId&&val.knew=="Y"){
									knew="Y";
								}
								if(val.objInstId==objInstId&&val.del=="Y"){
									del="Y";
								}
							});
							if(knew=="Y"){
								$("#orderTbody").append("<tr ><td>订购"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");
							}else if(del=="Y"){
								$("#orderTbody").append("<tr ><td>拆除"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");	
							}
						}
					}
				});
				OrderInfo.actionTypeName = "主副卡成员变更";
			}else if(OrderInfo.actionFlag==20){ //主副卡拆机保留副卡
				$("#accNbrTr").hide();
				for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) { //遍历主销售品构成
					var offerMember = OrderInfo.offer.offerMemberInfos[i];
					if(offerMember.objType==CONST.OBJ_TYPE.PROD){
						if(offerMember.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
							$("#orderTbody").append("<tr ><td>拆除"+offerMember.roleName+"号码：</td><td>"+offerMember.accessNumber+"</td></tr> ");	
						}else {
							$("#orderTbody").append("<tr ><td>订购"+offerMember.roleName+"号码：</td><td>"+offerMember.accessNumber+"</td></tr> ");	
						}
					}
				}
				OrderInfo.actionTypeName = "返销";	
			}else if(OrderInfo.actionFlag==12){ //加入组合退出组合
				$("#accNbrTr").hide();
				for (var i = 0; i < OrderInfo.confirmList.length; i++) {
					var prod = OrderInfo.confirmList[i];
					for(var j = 0; j < prod.accNbr.length; j++){
						$("#orderTbody").append("<tr><td >"+prod.name+"：</td><td>"+prod.accNbr[j]+"</td></tr>");
					}
				}
			}else if(OrderInfo.actionFlag==16){ //改号
				OrderInfo.actionTypeName = "改号";
				$.each(OrderInfo.boProdAns,function(){
					if(this.state=="ADD"){
						$("#orderTbody").append("<tr id='accNbrTr'><td>新号码：</td><td>"+this.accessNumber+"</td></tr> ");	
					}
				});
			}else if(OrderInfo.actionFlag==0&&OrderInfo.actionTypeName=="拆机"){ //拆机
				$("#accNbrTr").hide();
				var isMainCard="";
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD&&this.objInstId==order.prodModify.choosedProdInfo.prodInstId){
						isMainCard="Y";	
					}
				});
				if(isMainCard=="Y"){
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
							$("#orderTbody").append("<tr ><td>拆除"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");	
					});
				}
				OrderInfo.actionTypeName = "拆机";
			}
			var $span = $("<span>"+OrderInfo.actionTypeName+"</span>");
			$("#tital").append($span);
		}
		
		var ruleFlag = true;
		if($("#ruleTbody tr").length>0){ //规则限制
			$("#ruleTbody tr").each(function (){
				var ruleLevel = $(this).attr("ruleLevel");
				if(ruleLevel == "1"){
					ruleFlag = false;
					return false; 
				}
			});
		}
		if(ruleFlag){
			if(OrderInfo.orderResult.autoBoInfos!=undefined&&OrderInfo.orderResult.autoBoInfos.length>0){
				$("#chooseTable").append($('<tr><th width="50%">业务提醒编码</th><th>业务提醒内容</th></tr>'));
				$.each(OrderInfo.orderBusiHint,function(){
					$("#chooseTable").append($('<tr><td width="50%">'+this.promptCode+'</td><td>'+this.promptDesc+'</td></tr>'));
				});
			}
			if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 ){
				_showOrderOffer(); //显示订购的销售品
			}else if(OrderInfo.actionFlag==2){ //套餐变更 
				_showChangeAttach();
			}else if (OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22){
				_showAttachOffer(); //显示订购的销售品
			}else if (OrderInfo.actionFlag==6){
				_showAddViceOffer(); //加装副卡显示订购的销售品
			}else if(OrderInfo.actionFlag==21 && order.memberChange.getSimulateData()){
				_showMemberChangeAttach();
			}else{
				if(OrderInfo.orderResult.autoBoInfos!=undefined&&OrderInfo.orderResult.autoBoInfos.length>0){
					$("#chooseTable").append($('<tr><th width="50%">业务名称</th><th>业务动作</th></tr>'));
					$.each(OrderInfo.orderResult.autoBoInfos,function(){
						$("#chooseTable").append($('<tr><td width="50%">'+this.specName+'</td><td>'+this.boActionTypeName+'</td></tr>'));
					});
				}
			}
		}
	};
	
	//显示步骤
	var _showStep = function(k,data) {
		for (var i = 1; i < 4; i++) {
			$("#step"+i).hide();
		}
		$("#step"+k).show();
	};
	
	//页面步骤,优化页面显示功能
	var _step = function(k,data){
		if(k==0){   //订单准备页面
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#order_fill_content").hide();
			$("#order_tab_panel_content").html(data).show();
			k++;
		}else if(k==1){  //订单填写页面
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#order_tab_panel_content").hide();
			$("#order_confirm").hide();
			$("#order_fill_content").show();
		}else if(k==2){ //订单确认填写页面
			//修改客户按钮隐藏
            $("#custModifyId").attr("style","display: none;");
			$("#main_conetent").hide();
			$("#order_fill_content").hide();
			$("#order_tab_panel_content").hide();
			$("#order_confirm").html(data).show();	
		}
		for (var i = 1; i < 4; i++) {
			$("#step"+i).hide();
		}
		$("#step"+k).show();
	};
	
	// 新装，显示订购的销售品
	var _showOrderOffer = function(){
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			$.each(this.prodInsts,function(){
				$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.offerRoleName+')</th><th>业务动作</th></tr>'));			
				_showAttOffer(this.prodInstId);
			});
		});
	};
	
	//显示加装副卡订购的销售品
	var _showAddViceOffer = function(){
		if(ec.util.isArray(OrderInfo.oldoffer)){
			$.each(OrderInfo.oldoffer,function(){
				$.each(this.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD){
						$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.roleName+')</th><th>业务动作</th></tr>'));
						_showAttOffer(this.objInstId);
					}
				});
			});
		}else{
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){
					$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.offerRoleName+')</th><th>业务动作</th></tr>'));
					$.each(this.prodInsts,function(){
						_showAttOffer(this.prodInstId);	
					});
				}
			});
		}
	};
	
	//套餐变更销售附属
	var _showChangeAttach = function(){
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==CONST.OBJ_TYPE.PROD){
				$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.roleName+')</th><th>业务动作</th></tr>'));
				_showAttOffer(this.objInstId);
			}
		});
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.memberRoleCd==401){
				$.each(this.prodInsts,function(){
					var instid = '"'+this.prodInstId+'"';
					if(instid.indexOf("-")!=-1){
						_showAttOffer(this.prodInstId);
					}
				});
			}
		});
		if(offerChange.oldMemberFlag){
			$.each(OrderInfo.oldoffer,function(){
				$.each(this.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD){
						_showAttOffer(this.objInstId);
					}
				});
			});
		}
	};
	
	//副卡套餐变更销售附属
	var _showMemberChangeAttach = function(){
		if(ec.util.isArray(OrderInfo.viceOfferSpec)){
			$.each(OrderInfo.viceOfferSpec,function(){
//				var prodId=this.prodId;
//				$.each(OrderInfo.offer.offerMemberInfos,function(){
//					if(this.objType==CONST.OBJ_TYPE.PROD&&prodId==this.objInstId){
				$("#chooseTable").append($('<tr><th width="50%">业务名称(基础移动电话)</th><th>业务动作</th></tr>'));
				_showAttOffer(this.prodId);
//					}
//				});
			});
		}
	};
	
	//显示订购的销售品
	var _showAttachOffer = function(){
		var prod = order.prodModify.choosedProdInfo;
		if(prod==undefined || prod.prodInstId ==undefined){
			return true;
		}
		$("#chooseTable").append($('<tr><th width="50%">业务名称</th><th>业务动作</th></tr>'));
		_showAttOffer(prod.prodInstId);
	};
	
	//显示的可选包/功能产品
	var _showAttOffer = function(prodId){
		var offerSpecList = CacheData.getOfferSpecList(prodId);
		var offerList = CacheData.getOfferList(prodId);
		var servSpecList = CacheData.getServSpecList(prodId);
		var servList = CacheData.getServList(prodId);
		var appList = CacheData.getOpenAppList(prodId);
		//可选包显示
		if(offerSpecList!=undefined && offerSpecList.length>0){  
			$.each(offerSpecList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel != "Y" && this.isdel != "C"){  //订购的附属销售品
					if(ec.util.isObj(this.counts)){//组装重复订购的可选包
						for(var i=0;i<this.counts;i++){
							$("#chooseTable").append($('<tr><td width="50%">'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_BUY+'</td></tr>'));
						}
					}else{
						$("#chooseTable").append($('<tr><td width="50%">'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_BUY+'</td></tr>'));
					}
				}
			});
		}
		if(offerList!=undefined && offerList.length>0){
			$.each(offerList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel == "Y"){  //退订的附属销售品
					if(ec.util.isObj(this.counts)){//组装重复订购的可选包
						for(var i=0;i<this.counts;i++){
							$("#chooseTable").append($('<tr><td width="50%">'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_DEL+'</td></tr>'));
						}
					}else{
						$("#chooseTable").append($('<tr><td width="50%">'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_DEL+'</td></tr>'));
					}
				}else if(this.update == "Y"){
					$("#chooseTable").append($('<tr><td width="50%">'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_UPDATE+'</td></tr>'));
				}else if(ec.util.isObj(this.orderCount)&&ec.util.isObj(this.counts)){
					if(this.orderCount<this.counts){//订购附属销售品
						for(var k=0;k<(this.counts-this.orderCount);k++){
							$("#chooseTable").append($('<tr><td width="50%">'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_BUY+'</td></tr>'));
						}
					}
				}
			});
		}
		//功能产品显示
		if(servSpecList!=undefined && servSpecList.length>0){
			$.each(servSpecList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel != "Y"  && this.isdel != "C"){  //订购的附属销售品
					$("#chooseTable").append($('<tr><td width="50%">'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_OPEN+'</td></tr>'));
				}
			});
		}
		if(servList!=undefined && servList.length>0){
			$.each(servList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel == "Y"){  //退订的附属销售品
					$("#chooseTable").append($('<tr><td width="50%">'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_CLOSE+'</td></tr>'));
				}else if(this.update == "Y"){
					$("#chooseTable").append($('<tr><td width="50%">'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_UPDATE+'</td></tr>'));
				}
			});
		}
		if(appList!=undefined && appList.length>0){
			$.each(appList,function(){ //遍历当前产品下面的增值业务
				if(this.dfQty == 1){  //开通增值业务
					$("#chooseTable").append($('<tr><td width="50%">'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_OPEN+'</td></tr>'));
				}
			});
		}
		
		//动作链返回显示
		if(OrderInfo.orderResult.autoBoInfos!=undefined){
			$.each(OrderInfo.orderResult.autoBoInfos,function(){
//				if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
//					var instAccessNumber = this.instAccessNumber;
//					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
//						if(instAccessNumber==OrderInfo.oldprodInstInfos[i].accNbr && OrderInfo.oldprodInstInfos[i].prodInstId==prodId){
//							$("#chooseTable").append($('<tr><td width="50%">'+this.specName+'</td><td>'+this.boActionTypeName+'</td></tr>'));
//						}
//					}
//				}else{
					if(this.instAccessNumber==OrderInfo.getAccessNumber(prodId)){
						$("#chooseTable").append($('<tr><td width="50%">'+this.specName+'</td><td>'+this.boActionTypeName+'</td></tr>'));
					}
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(this.instAccessNumber==OrderInfo.oldprodInstInfos[i].accNbr && OrderInfo.oldprodInstInfos[i].prodInstId==prodId){
							$("#chooseTable").append($('<tr><td width="50%">'+this.specName+'</td><td>'+this.boActionTypeName+'</td></tr>'));
						}
					}
//				}
			});
		}
	};
	
	//订单返回
	var _orderBack = function(){
		//订单返回修改new
		//3G套餐订购4G流量包 订单返回需还原预校验前的缓存信息
		if(CONST.getAppDesc()==0 && OrderInfo.actionFlag==3){
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			var prodId = order.prodModify.choosedProdInfo.prodInstId;
			var specList=CacheData.getOfferSpecList(prodId);
			var flag=false;
			if(ec.util.isArray(specList)){
				$.each(specList,function(){
					if(this.ifPackage4G=="Y" && this.isdel != "Y" && this.isdel != "C"){ //是否有开通4g流量包
						flag = true;
						return false;
					}
				});
			}
			if(flag && prodClass==CONST.PROD_CLASS.THREE){
				AttachOffer.reductionChangList(prodId);
			}
		}
		//不再绑定异常撤单
		SoOrder.delOrderFin();
	
		$("#order_fill_content").show();
		$("#main_conetent").show();
		if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){
			$("#order_tab_panel_content").show();
		}
		$("#order_confirm").hide();
		SoOrder.showStep(1);
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
		OrderInfo.resetSeq(); //重置序列
		SoOrder.delOrder();
		_getToken(); //获取页面步骤
		if(CONST.getAppDesc()!=0){
			$("#custModifyId").show();
		}
	};
	
	//作废购物车
	var _delOrder = function(olId){
		if(olId==undefined){
			olId = OrderInfo.orderResult.olId;
		}
//		var olId = OrderInfo.orderResult.olId;
		if(olId!=0&&olId!=undefined){  //作废购物车
			var param = {
				olId : olId,
				areaId : OrderInfo.getAreaId()
			};
			$.callServiceAsJsonGet(contextPath+"/token/pc/order/delOrder",param,{
				"done" : function(response){
					if (response.code==0) {
						if(response.data.resultCode==0){
							$.alert("提示","购物车作废成功！");
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","购物车作废失败！");
					}
				},
				fail:function(response){
					$.alert("提示","信息","请求可能发生异常，请稍后再试");
				}
			});
		}
	};
	
	var _delOrderBegin = function(){
		$.cookie(CONST.DEL_ORDER_FLAG.SILENT_OLID, OrderInfo.orderResult.olId);
		$("a[href^='/']").off("mousedown").on("mousedown", function(){
			SoOrder.delOrderSilent();
			window.location.href=this.href;
		});
		//在订单确认和收银台页面关闭浏览器时调用订单作废
		$(window).off("unload").on("unload", function(){
			SoOrder.delOrderSilent();
		});
	};
	var _delOrderSilent = function() {
//		var olId = OrderInfo.orderResult.olId;
		var olId = $.cookie(CONST.DEL_ORDER_FLAG.SILENT_OLID);
		$.cookie(CONST.DEL_ORDER_FLAG.SILENT_OLID, null);
		if(olId!=0&&olId!=undefined && olId != null){  //作废购物车
			var param = {
				olId : olId,
				areaId : OrderInfo.getAreaId(),
				flag: "U"
			};
			var result = $.callServiceAsJsonGet(contextPath+"token/pc/order/delOrder",param);
			//自动撤单时后台会释放该单预占的号码，门户相应更新预占号码表状态（目前撤单不释放预占的UIM，这里也不更新UIM的状态）
			var resources  = [];
			for (var i = 0; i < OrderInfo.boProdAns.length; i++) {	
				var res = {
					accNbr :OrderInfo.boProdAns[i].accessNumber,
					accNbrType : 1,  //号码类型（1手机号码2.UIM卡）
					action : "UPDATE"
				};
				resources.push(res);
			}
			if(resources.length>0){
				var url= contextPath+"/common/updateResState";	 
				$.callServiceAsJsonGet(url,{strParam:JSON.stringify(resources)},{
					"done" : function(response){
						if (response.code==0) {
							if(response.data){
							}
						}
					}
				});	
			}
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
			OrderInfo.resetSeq(); //重置序列
			_getToken();
			SoOrder.delOrderFin();
		}
	};
	var _delOrderFin = function(){
		$.cookie(CONST.DEL_ORDER_FLAG.SILENT_OLID, null);
		$("a[href^='/']").off("mousedown");
		$(window).off("unload");
	};
	
	//拆副卡
	var _delViceCard = function(busiOrders,data){
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息 
		var param = {
			offerSpecId : prodInfo.prodOfferId,  //业务规格ID
			offerId : prodInfo.prodOfferInstId,  //业务对象实例ID
			offerTypeCd : "1",
			isUpdate : "Y",
			boActionTypeCd : CONST.BO_ACTION_TYPE.UPDATE_OFFER,
			data : data
		};
		OrderInfo.getOfferBusiOrder(busiOrders,param,data[0].objInstId);
		$.each(data,function(){
			var prod = {
				prodId : this.objInstId, 
				isComp : "Y",
				boActionTypeCd : CONST.BO_ACTION_TYPE.REMOVE_PROD
			};
			busiOrders.push(OrderInfo.getProdBusiOrder(prod));
			$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
				if(this.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD && this.objInstId== prodId){
					this.isRemove = "Y";//标志是否拆机
					return false;
				}
			});
		});
	};
	
	//销售品成员变更保留副卡订购新套餐拆副卡并订购新套餐
	var _delViceCardAndNew = function(busiOrders,data){		
		//var newData = data ;
		var objInstId="";
        var newData = data.viceParam ;
        _viceParam=newData;
        var ooRoles = data.ooRoles;
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息 
		var param = {
			offerSpecId : prodInfo.prodOfferId,  //业务规格ID
			offerId : prodInfo.prodOfferInstId,  //业务对象实例ID
			offerTypeCd : "1",
			isUpdate : "Y",
			boActionTypeCd : CONST.BO_ACTION_TYPE.UPDATE_OFFER,
			data : data.ooRoles
		};
		$.each(OrderInfo.offer.offerMemberInfos,function(i){
			if(this.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){
				objInstId = this.objInstId;
				return false;
			}
		});
		OrderInfo.getOfferBusiOrder(busiOrders,param,objInstId);		
		//订购副卡主套餐
		for (var i = 0; i < newData.length; i++) {
			if(newData[i].knew=="Y"){
			var offerSpec = newData[i];
			var accessNumber="";
			$.each(OrderInfo.offer.offerMemberInfos,function(){
				if(this.objInstId==offerSpec.objInstId){
					accessNumber=this.accessNumber;
				}
			});
			var busiOrder2 = {
				areaId : prodInfo.areaId,  //受理地区ID
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					objId : offerSpec.offerSpecId,  //业务规格ID
					objName : offerSpec.offerSpecName,
					instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
					isComp : "N", //是否组合
					offerTypeCd : "1" //1主销售品
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
			if(ec.util.isObj(accessNumber)){
				busiOrder2.busiObj.accessNumber=accessNumber;
			}
			//遍历主销售品构成
			for ( var j = 0; j < OrderInfo.offer.offerMemberInfos.length; j++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[j];
				if(offerMember.objInstId==offerSpec.objInstId){
					var ooRoles = {
						objId : offerMember.objId, //业务规格ID
						objInstId : offerMember.objInstId, //业务对象实例ID,新装默认-1
						objType : offerMember.objType, // 业务对象类型
						offerRoleId : offerSpec.offerRoleId, //销售品角色ID
						state : "ADD" //动作
					};
					busiOrder2.data.ooRoles.push(ooRoles);
					break;
				}
			}
			
			//发展人
			var $tr = $("tr[name='tr_"+offerSpec.offerSpecId+"']");
			if($tr!=undefined){
				busiOrder2.data.busiOrderAttrs = [];
				$tr.each(function(){   //遍历产品有几个发展人
					var dealer = {
							itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
							role : $(this).find("select").val(),
							value : $(this).find("input").attr("staffid"),
							channelNbr : $(this).find("select[name ='dealerChannel_"+offerSpec.offerSpecId+"']").val()
					};
					busiOrder2.data.busiOrderAttrs.push(dealer);
					var dealer_name = {
							itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
							role : $(this).find("select").val(),
							value : $(this).find("input").attr("value") 
					};
					busiOrder2.data.busiOrderAttrs.push(dealer_name);
				});
			}
			
			busiOrders.push(busiOrder2);
			  //查询副卡的产品属性并保存
            var param = {
                prodId: offerSpec.objInstId, // 产品实例id
                acctNbr: offerSpec.accessNumber, // 接入号
                prodSpecId: offerSpec.objId, // 产品规格id
                areaId: OrderInfo.getAreaId() // 地区id
            };
            var prodAttr = query.offer.queryProdInstParam(param);
            if (ec.util.isObj(prodAttr) && ec.util.isObj(prodAttr.prodSpecParams) && prodAttr.prodSpecParams.length > 0) {
                $.each(prodAttr.prodSpecParams, function () {
                    if (this.itemSpecId == CONST.PROD_ATTR.PROD_USER) {//获取使用人属性
                        if (ec.util.isObj(this.userId) && this.userId != OrderInfo.cust.custId) {//副卡有对应的使用人信息，此时副卡换套餐变成单成员时要下使用人变更节点。
                            _fillBusiOrder4changeUse(busiOrders, offerSpec, this);
                        }
                    }
                });
            }
			}else{
			var prod = {
						prodId : newData[i].objInstId, 
						isComp : "Y",
						boActionTypeCd : CONST.BO_ACTION_TYPE.REMOVE_PROD
					};
			busiOrders.push(OrderInfo.getProdBusiOrder(prod));
			}
			
			
		}
		
		if(order.memberChange.getSimulateData()){
			if(ec.util.isArray(OrderInfo.viceOfferSpec)){
				$.each(OrderInfo.viceOfferSpec,function(){
					var prodId=this.prodId;
					if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
						$.each(OrderInfo.offer.offerMemberInfos,function(){
							if(prodId==this.objInstId&&this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
								if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
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
				});
			}
			AttachOffer.setAttachBusiOrder(busiOrders);  //订购退订附属销售品
		}
	};
	
	//填充业务对象节点
	var _fillBusiOrder = function(busiOrders,data,isComp) {	
		var prod = order.prodModify.choosedProdInfo; //获取产品信息 
		var boActionTypeCd= OrderInfo.boActionTypeCd;
		var objId= prod.productId;
		var instId=prod.prodInstId;
		var classcd=OrderInfo.actionClassCd;
		var offerTypeCd = "1" ;//1主销售品 
		if(boActionTypeCd==CONST.BO_ACTION_TYPE.ADDOREXIT_COMP){
			objId=prod.prodOfferId;
			instId=prod.prodOfferInstId;
			classcd=CONST.ACTION_CLASS_CD.OFFER_ACTION;
		}
		if(boActionTypeCd==CONST.BO_ACTION_TYPE.BUY_BACK_ORDER_CONTRACT){
			objId=OrderInfo.buyBack_orderItemObjId;
			instId=OrderInfo.buyBack_orderItemObjInstId;
			offerTypeCd = "2";//2可选包
		}
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : objId,//prodInfo.productId, //业务对象规格ID
				instId : instId, //业务对象实例ID
				isComp : isComp, //是否组合
				accessNumber : prod.accNbr,   //业务号码
				offerTypeCd : offerTypeCd  //1主销售品
			},  
			boActionType : {
				actionClassCd : classcd,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		
		if(boActionTypeCd==CONST.BO_ACTION_TYPE.BUY_BACK_CHANGE_CARD|| boActionTypeCd==CONST.BO_ACTION_TYPE.BUY_BACK_ORDER_CONTRACT){
			busiOrder.boRelas = OrderInfo.boRelas;			
		}
		busiOrder.data =data;
		busiOrders.push(busiOrder);
	};
	//创建变更使用人节点
	var _fillBusiOrder4changeUse = function(busiOrders,bobj,attr) {
        var busiOrder = {
            areaId: OrderInfo.getAreaId(),  //受理地区ID
            busiOrderInfo: {
                seq: OrderInfo.SEQ.seq--
            },
            busiObj: { //业务对象节点
                objId: bobj.objId,////业务对象规格ID
                instId: bobj.objInstId, //业务对象实例ID
                isComp: "N", //是否组合
                accessNumber: bobj.accessNumber,   //业务号码
                offerTypeCd: bobj.objType //1主销售品
            },
            boActionType: {
                actionClassCd: CONST.ACTION_CLASS_CD.PROD_ACTION,
                boActionTypeCd: CONST.BO_ACTION_TYPE.PRODUCT_INFOS
            },
            data: {
                boProdItems: [
                    {
                        itemSpecId: CONST.PROD_ATTR.PROD_USER,
                        prodSpecItemId: "",
                        state: "DEL",
                        value: attr.userId
                    }
                ],
                boCertiAccNbrRels: []
            }
        };
        var ca = $.extend(true, {}, OrderInfo.boCertiAccNbrRel);
        ca.partyId = OrderInfo.cust.custId;
        ca.accNbr = bobj.accessNumber;
        ca.state = "ADD";
        ca.serviceType = "1200";//变更使用人
        _setUserInfo(ca);
        busiOrder.data.boCertiAccNbrRels.push(ca);
        busiOrders.push(busiOrder);
    };

	
	//创建订单数据
	var _createOrder = function(busiOrders) {
		//添加客户节点
		if(OrderInfo.cust.custId == -1){
			OrderInfo.createCust(busiOrders);	
		}
		var acctId = $("#acctSelect").find("option:selected").attr("value"); //先写死
		if(acctId < 0 && acctId!=undefined ){
			OrderInfo.createAcct(busiOrders,acctId);	//添加帐户节点
		}
		var busiOrder = _createMainOffer(busiOrders); //添加主销售品节点	
		//遍历主销售品构成,添加产品节点
		for ( var i = 0; i < busiOrder.data.ooRoles.length; i++) {
			var ooRole = busiOrder.data.ooRoles[i];
			if(ooRole.objType==2 && ooRole.memberRoleCd!=undefined){
				busiOrders.push(_createProd(ooRole.objInstId,ooRole.objId));	
			}		
		}
		AttachOffer.setAttachBusiOrder(busiOrders);  //添加可选包跟功能产品
	};
	
	//初始化订单获取token
	var _getToken = function() {
		var response = $.callServiceAsHtmlGet(contextPath+"/token/pc/common/getToken");
		OrderInfo.order.token = response.data;
	};
	
	//获取token的同步请求
	var _getTokenSynchronize = function() {
		var response = $.callServiceAsHtmlGet(contextPath+"/token/pc/common/getToken");
		OrderInfo.order.token = response.data;
	};
	
	//创建主副卡订单数据
	var _createMainOrder = function(busiOrders) {
		var prodInfo = order.prodModify.choosedProdInfo;
		var busiOrder = {
			areaId : prodInfo.areaId,  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : prodInfo.prodOfferId,  //业务规格ID
				instId : prodInfo.prodOfferInstId, //业务对象实例ID
				accessNumber : prodInfo.accNbr, //业务号码
				isComp : "Y", //是否组合
				offerTypeCd : "1" //1主销售品
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP
			}, 
			data:{
				ooRoles : []			
			}
		};
		
		if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//纳入老用户
			var offerRoleId = "";
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
//					if(offerRole.prodInsts!=undefined && offerRole.prodInsts.length>0){
//						for ( var j = 0; j < offerRole.prodInsts.length; j++) {
//							var prodInst = offerRole.prodInsts[j];
							offerRoleId = offerRole.offerRoleId;
							break;
//						}		
//					}
				} 
			}
			
			//[W]
			var action_type = (OrderInfo.hasMainCarFlag) ? CONST.BO_ACTION_TYPE.DEL_OFFER : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP;
			
			for(var q=0;q<OrderInfo.oldprodInstInfos.length;q++){
				var oldprodInfo = OrderInfo.oldprodInstInfos[q];
				var oldbusiOrder = {
						areaId : oldprodInfo.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							objId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferId,  //业务规格ID
							instId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferInstId, //业务对象实例ID
							accessNumber : oldprodInfo.accNbr, //业务号码
							isComp : "Y", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER
						}, 
						data:{
							ooRoles : []			
						}
					};
				var memberid = -1;
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
					if(OrderInfo.oldoffer[i].accNbr==oldprodInfo.accNbr){
						$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
							if(this.objType==CONST.OBJ_TYPE.PROD){
								var ooRole = {
									objId : this.objId,
									objInstId : this.objInstId,
									objType : this.objType,
									offerMemberId : memberid,
									offerRoleId : offerRoleId,
									state : "ADD"
								};
								busiOrder.data.ooRoles.push(ooRole);
								var oldooRole = {
										objId : this.objId,
										objInstId : this.objInstId,
										objType : this.objType,
										offerMemberId : this.offerMemberId,
										offerRoleId : this.offerRoleId,
										state : "DEL"
									};
								oldbusiOrder.data.ooRoles.push(oldooRole);
								--memberid;
							}
						});
					}
				}
				busiOrders.push(oldbusiOrder);
			}
			if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) { //遍历主销售品构成
					$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
							if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
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
		}
		if(order.memberChange.newMemberFlag){
			//遍历主销售品构成
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
					if(offerRole.prodInsts!=undefined && offerRole.prodInsts.length>0){
						for ( var j = 0; j < offerRole.prodInsts.length; j++) {
							var prodInst = offerRole.prodInsts[j];
							var ooRole = {
								objId : prodInst.objId,
								objInstId : prodInst.prodInstId,
								objType : prodInst.objType,
								offerMemberId : OrderInfo.SEQ.offerMemberSeq--,
								offerRoleId : prodInst.offerRoleId,
								state : "ADD"
							};
							busiOrder.data.ooRoles.push(ooRole);
							busiOrders.push(_createProd(prodInst.prodInstId,prodInst.objId));	
						}		
					}
				} 
			} 
		}
		if(order.memberChange.changeMemberFlag){
//			var objInstId="";
	        var newData = order.memberChange.viceparams;
//	        _viceParam=newData;
	        var ooRoles = order.memberChange.ooRoless;
			var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息 
//			var param = {
//				offerSpecId : prodInfo.prodOfferId,  //业务规格ID
//				offerId : prodInfo.prodOfferInstId,  //业务对象实例ID
//				offerTypeCd : "1",
//				isUpdate : "Y",
//				boActionTypeCd : CONST.BO_ACTION_TYPE.UPDATE_OFFER,
//				data : data.ooRoles
//			};
//			$.each(OrderInfo.offer.offerMemberInfos,function(i){
//				if(this.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){
//					objInstId = this.objInstId;
//					return false;
//				}
//			});
//			OrderInfo.getOfferBusiOrder(busiOrders,param,objInstId);	
	        $.each(ooRoles,function(){
	        	busiOrder.data.ooRoles.push(this);
	        });
//			busiOrder.data.ooRoles.push(ooRoles);
			//订购副卡主套餐
			for (var i = 0; i < newData.length; i++) {
				if(newData[i].knew=="Y"){
					var offerSpec = newData[i];
					var accessNumber="";
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objInstId==offerSpec.objInstId){
							accessNumber=this.accessNumber;
						}
					});
					var busiOrder2 = {
						areaId : prodInfo.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							objId : offerSpec.offerSpecId,  //业务规格ID
							objName : offerSpec.offerSpecName,
							instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
							isComp : "N", //是否组合
							offerTypeCd : "1" //1主销售品
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
					if(ec.util.isObj(accessNumber)){
						busiOrder2.busiObj.accessNumber=accessNumber;
					}
					//遍历主销售品构成
					for ( var j = 0; j < OrderInfo.offer.offerMemberInfos.length; j++) {
						var offerMember = OrderInfo.offer.offerMemberInfos[j];
						if(offerMember.objInstId==offerSpec.objInstId){
							var ooRoles = {
								objId : offerMember.objId, //业务规格ID
								objInstId : offerMember.objInstId, //业务对象实例ID,新装默认-1
								objType : offerMember.objType, // 业务对象类型
								offerRoleId : offerSpec.offerRoleId, //销售品角色ID
								state : "ADD" //动作
							};
							busiOrder2.data.ooRoles.push(ooRoles);
							break;
						}
					}
					
					//发展人
					var $tr = $("tr[name='tr_"+offerSpec.offerSpecId+"']");
					if($tr!=undefined){
						busiOrder2.data.busiOrderAttrs = [];
						$tr.each(function(){   //遍历产品有几个发展人
							var dealer = {
									itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
									role : $(this).find("select").val(),
									value : $(this).find("input").attr("staffid") 
							};
							busiOrder2.data.busiOrderAttrs.push(dealer);
							var dealer_name = {
									itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
									role : $(this).find("select").val(),
									value : $(this).find("input").attr("value") 
							};
							busiOrder2.data.busiOrderAttrs.push(dealer_name);
						});
					}
					
					busiOrders.push(busiOrder2);
					var isON = query.common.queryPropertiesStatus("VICE_CARD_DEL_USER_"+OrderInfo.cust.areaId.substr(0,3));
					if(OrderInfo.busitypeflag == 21 && !CacheData.isGov(OrderInfo.cust.identityCd) && isON){
						  //查询副卡的产品属性并保存
			            var param = {
			                prodId: offerSpec.objInstId, // 产品实例id
			                acctNbr: offerSpec.accessNumber, // 接入号
			                prodSpecId: offerSpec.objId, // 产品规格id
			                areaId: OrderInfo.getAreaId() // 地区id
			            };
			            var prodAttr = query.offer.queryProdInstParam(param);
			            if (ec.util.isObj(prodAttr) && ec.util.isObj(prodAttr.prodSpecParams) && prodAttr.prodSpecParams.length > 0) {
			                $.each(prodAttr.prodSpecParams, function () {
			                    if (this.itemSpecId == CONST.PROD_ATTR.PROD_USER) {//获取使用人属性
			                        if (ec.util.isObj(this.userId) && this.userId != OrderInfo.cust.custId) {//副卡有对应的使用人信息，此时副卡换套餐变成单成员时要下使用人变更节点。
			                            _fillBusiOrder4changeUse(busiOrders, offerSpec, this);
			                        }
			                    }
			                });
			            }
					}
				}else{
					var prod = {
								prodId : newData[i].objInstId, 
								isComp : "Y",
								boActionTypeCd : CONST.BO_ACTION_TYPE.REMOVE_PROD
							};
					busiOrders.push(OrderInfo.getProdBusiOrder(prod));
				}
				
				
			}
			if(order.memberChange.getSimulateData()){
				if(ec.util.isArray(OrderInfo.viceOfferSpec)){
					$.each(OrderInfo.viceOfferSpec,function(){
						var prodId=this.prodId;
						if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
							$.each(OrderInfo.offer.offerMemberInfos,function(){
								if(prodId==this.objInstId&&this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
									if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
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
					});
				}
//				AttachOffer.setAttachBusiOrder(busiOrders);  //订购退订附属销售品
			}
		}
		AttachOffer.setAttachBusiOrder(busiOrders);//添加附属
		busiOrders.push(busiOrder);
	};
	
	//创建主副卡订单数据
	var _delAndNew = function(busiOrders,newDataMap) {
		var newData = newDataMap ;
		var remark = "" ; 
		var allDel=true;
		var v_actionClassCd = CONST.ACTION_CLASS_CD.OFFER_ACTION;
		var v_boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		var v_actionClassCd2 = CONST.ACTION_CLASS_CD.OFFER_ACTION;
		var v_boActionTypeCd2 = CONST.BO_ACTION_TYPE.BUY_OFFER;
		if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
			v_actionClassCd = CONST.ACTION_CLASS_CD.PROD_ACTION;//产品及服务动作
			v_boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_BACK;//返销
			v_actionClassCd2 = CONST.ACTION_CLASS_CD.OFFER_ACTION;//销售品动作
			v_boActionTypeCd2 = CONST.BO_ACTION_TYPE.BUY_OFFER;//订购销售品
			v_boActionTypeCdAdd =CONST.BO_ACTION_TYPE.BUY_BACK;//副卡带出动作小类
			newData = newDataMap.viceParam ;
			remark = newDataMap.remark; 
		}else if(OrderInfo.actionFlag==7){
			v_boActionTypeCdAdd =CONST.BO_ACTION_TYPE.REMOVE_PROD;//副卡带出动作小类
		}
		for (var i = 0; i < newData.length; i++) {
			var offerSpec = newData[i];
			if(offerSpec.del=='N'){
				allDel=false;
			}
		}
		if(allDel){
			_viceParam=newData;
			var busiOrder = {
					areaId : OrderInfo.getProdAreaId(order.prodModify.choosedProdInfo.prodInstId),  //受理地区ID
					busiOrderInfo : {
						seq : OrderInfo.SEQ.seq--
					}, 
					busiObj : { //业务对象节点
						accessNumber : order.prodModify.choosedProdInfo.accNbr,
						objId : order.prodModify.choosedProdInfo.productId,  //业务规格ID,prod.prodOfferId
						instId : order.prodModify.choosedProdInfo.prodInstId, //业务对象实例ID,prod.prodOfferInstId
						isComp : "N", //是否组合
						offerTypeCd : "1" //1主销售品
					},  
					boActionType : {
						actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
						boActionTypeCd : OrderInfo.boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
					},
					data:{
						boProdStatuses :[{
							prodStatusCd : order.prodModify.choosedProdInfo.prodStateCd,
							state : "DEL"
						},{
							prodStatusCd : (OrderInfo.boActionTypeCd==CONST.BO_ACTION_TYPE.PREMOVE_PROD) ? CONST.PROD_STATUS_CD.STOP_PROD : CONST.PROD_STATUS_CD.REMOVE_PROD,
							state : "ADD"
						}],
						busiOrderAttrs:[]
					}
				};
			/*var remark = $('#order_remark').val();   //订单备注
			if(remark!=""&&remark!=undefined){
				busiOrder.data.busiOrderAttrs.push({
					itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
					value : remark
				});	
			}*/
				busiOrders.push(busiOrder);	
			for (var i = 0; i < newData.length; i++) {
				var offerSpec = newData[i];
				var busiOrder = {
						areaId : OrderInfo.getProdAreaId(offerSpec.prodInstId),  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							accessNumber :offerSpec.accessNumber,
							objId : offerSpec.objId,  //业务规格ID,prod.prodOfferId
							instId : offerSpec.objInstId, //业务对象实例ID,prod.prodOfferInstId
							isComp : "N", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : OrderInfo.boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
						},
						data:{
							boProdStatuses :[/*{
								prodStatusCd :order.prodModify.choosedProdInfo.prodStateCd,
								state : "DEL"
							},*/
							{
								prodStatusCd : (OrderInfo.boActionTypeCd==CONST.BO_ACTION_TYPE.PREMOVE_PROD) ? CONST.PROD_STATUS_CD.STOP_PROD : CONST.PROD_STATUS_CD.REMOVE_PROD,
								state : "ADD"
							}],
							busiOrderAttrs:[]
						}
					};
				/*var remark = $('#order_remark').val();   //订单备注
				if(remark!=""&&remark!=undefined){
					busiOrder.data.busiOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
						value : remark
					});	
				}*/
					busiOrders.push(busiOrder);	
			}
			return;
		}
		if(OrderInfo.actionFlag==7){ //7 拆主卡保留副卡
			_viceParam=newData;
			//退订主套餐
			var prod = order.prodModify.choosedProdInfo;
			var busiOrder = {
				areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					objId : prod.prodOfferId,  //业务规格ID,prod.prodOfferId
					instId : prod.prodOfferInstId, //业务对象实例ID,prod.prodOfferInstId
					isComp : "N", //是否组合
					offerTypeCd : "1" //1主销售品
				},  
				boActionType : {
					actionClassCd : v_actionClassCd,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
					boActionTypeCd : v_boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
				},
				data:{
					ooRoles : [],	
					ooOwners : [{
						partyId : OrderInfo.cust.custId, //客户ID
						state : "DEL" //动作
					}]
				}
			};
			//遍历主销售品构成
			for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				var ooRoles = {
					objId : offerMember.objId, //业务规格ID
					objInstId : offerMember.objInstId, //业务对象实例ID,新装默认-1
					objType : offerMember.objType, // 业务对象类型
					offerMemberId : offerMember.offerMemberId, //成员id
					offerRoleId : offerMember.offerRoleId, //销售品角色ID
					state : "DEL" //动作
				};
				busiOrder.data.ooRoles.push(ooRoles);
			}
			busiOrders.push(busiOrder);	
			/*var prod = {
				prodId : this.objInstId, 
				isComp : "Y",
				boActionTypeCd : CONST.BO_ACTION_TYPE.REMOVE_PROD
			};
			busiOrders.push(OrderInfo.getProdBusiOrder(prod));*/
		}else {
			//反销主卡
			var prod = order.prodModify.choosedProdInfo;
			var busiOrder = {
				areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					objId : prod.productId,  //业务规格ID,prod.prodOfferId
					instId : prod.prodInstId, //业务对象实例ID,prod.prodOfferInstId
					accessNumber : prod.accNbr, //接入号码
					isComp : "N" //是否组合
				},  
				boActionType : {
					actionClassCd : v_actionClassCd,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
					boActionTypeCd : v_boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
				},
				data:{
					boProdStatuses : [
					  {
						  "prodStatusCd": CONST.PROD_STATUS_CD.NORMAL_PROD,
	                        "state": "DEL"
					  },{
						  "prodStatusCd": CONST.PROD_STATUS_CD.REMOVE_PROD,
	                        "state": "ADD"
					  }
					],	
					busiOrderAttrs : []
				}
			};
			/*//订单属性
			if(remark!=undefined&&remark!=""){
				busiOrder.data.busiOrderAttrs.push({
					itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
					value : remark
				});	
			}*/
			busiOrders.push(busiOrder);	
		}
		
		//订购副卡主套餐
		for (var i = 0; i < newData.length; i++) {
			var offerSpec = newData[i];
			if(offerSpec.del=="N"){
			var busiOrder2 = {
				areaId : OrderInfo.getAreaId(),  //受理地区ID
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					objId : offerSpec.offerSpecId,  //业务规格ID
					instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
					isComp : "N", //是否组合
					offerTypeCd : "1" //1主销售品
				},  
				boActionType : {
					actionClassCd : v_actionClassCd2,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
					boActionTypeCd : v_boActionTypeCd2//CONST.BO_ACTION_TYPE.BUY_OFFER
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
			for ( var j = 0; j < OrderInfo.offer.offerMemberInfos.length; j++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[j];
				if(offerMember.objInstId==offerSpec.objInstId){
					var ooRoles = {
						objId : offerMember.objId, //业务规格ID
						objInstId : offerMember.objInstId, //业务对象实例ID,新装默认-1
						objType : offerMember.objType, // 业务对象类型
						offerRoleId : offerSpec.offerRoleId, //销售品角色ID
						state : "ADD" //动作
					};
					busiOrder2.data.ooRoles.push(ooRoles);
					break;
				}
			}
			busiOrders.push(busiOrder2);
		}else{
				var busiOrder = {
						areaId : OrderInfo.getProdAreaId(offerSpec.prodInstId),  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							accessNumber :offerSpec.accessNumber,
							objId : offerSpec.objId,  //业务规格ID,prod.prodOfferId
							instId : offerSpec.objInstId, //业务对象实例ID,prod.prodOfferInstId
							isComp : "N", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,//CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : OrderInfo.boActionTypeCd//CONST.BO_ACTION_TYPE.DEL_OFFER
						},
						data:{
							boProdStatuses :[/*{
								prodStatusCd :order.prodModify.choosedProdInfo.prodStateCd,
								state : "DEL"
							},*/
							{
								prodStatusCd : (OrderInfo.boActionTypeCd==CONST.BO_ACTION_TYPE.PREMOVE_PROD) ? CONST.PROD_STATUS_CD.STOP_PROD : CONST.PROD_STATUS_CD.REMOVE_PROD,
								state : "ADD"
							}],
							busiOrderAttrs:[]
						}
					};
				/*var remark = $('#order_remark').val();   //订单备注
				if(remark!=""&&remark!=undefined){
					busiOrder.data.busiOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
						value : remark
					});	
				}*/
					busiOrders.push(busiOrder);	
		}
		}
	};
	
	//创建附属销售品订单数据
	var _createAttOrder = function(busiOrders){	
		AttachOffer.setAttachBusiOrder(busiOrders);		
		var prodInfo = order.prodModify.choosedProdInfo;
		if(AttachOffer.isChangeUim(prodInfo.prodInstId)){
			if(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0){
				var prod = {
					prodId : prodInfo.prodInstId,
					prodSpecId : prodInfo.productId,
					isComp : "N",
					accessNumber : prodInfo.accNbr,
					boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
				};
				busiOrders.push(OrderInfo.getProdBusiOrder(prod));
			}
		}
	};
	
	//创建附属销售品订单数据
	var _createCustOrder = function(busiOrders,data){	
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.cust.custId //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : OrderInfo.actionClassCd,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
	};
	//创建活卡销售返档订单数据
	var _ActiveReturnOrder = function(busiOrders,data){
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				accessNumber: order.prodModify.choosedProdInfo.accNbr,
				instId : OrderInfo.cust.custId //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : OrderInfo.actionClassCd,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
		var busiOrderAdd = {
				areaId : OrderInfo.getAreaId(),  //受理地区ID		
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					accessNumber: order.prodModify.choosedProdInfo.accNbr,
					instId : order.prodModify.choosedProdInfo.prodInstId, //业务对象实例ID
					objId :order.prodModify.choosedProdInfo.productId
				},  
				boActionType : {
					actionClassCd: CONST.ACTION_CLASS_CD.PROD_ACTION,
                    boActionTypeCd: CONST.BO_ACTION_TYPE.ACTIVERETURNTWO
				}, 
				data:{}
			};
		busiOrderAdd.data.boProdStatuses = [{
			prodStatusCd : CONST.PROD_STATUS_CD.READY_PROD,
			state : "DEL"
		},{
			prodStatusCd : CONST.PROD_STATUS_CD.DONE_PROD,
			state : "ADD"
		}
		];
		busiOrders.push(busiOrderAdd);
	};
	//创建客户单独订单
	var _createCustOrderOnly = function(busiOrders,data){
		var busiOrder = {
			areaId : OrderInfo.getAreaId(),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : -1 //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : OrderInfo.actionClassCd,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
	};
	
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders) {
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(-1),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : OrderInfo.offerSpec.offerSpecId,  //业务规格ID
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				isComp : "N", //是否组合
				offerTypeCd : "1" //1主销售品
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
			}, 
			data:{
				ooRoles : [],
				ooOwners : [],
				busiOrderAttrs : []
			}
		};
		var accNbr = OrderInfo.getAccessNumber(-1);
		if(ec.util.isObj(accNbr)){ //接入号
			busiOrder.busiObj.accessNumber = accNbr;
		}		
		//遍历主销售品构成
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			$.each(this.prodInsts,function(){
				var ooRoles = {
					objId : this.objId, //业务规格ID
					objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
					objType : this.objType, // 业务对象类型
					memberRoleCd : this.memberRoleCd, //成员角色类型
					offerRoleId : this.offerRoleId, //销售品角色ID
					state : "ADD" //动作
				};
				busiOrder.data.ooRoles.push(ooRoles);  //接入类产品
				var prodId = this.prodInstId;
				if(this.servInsts!=undefined && this.servInsts.length>0){ //功能类产品
					$.each(this.servInsts,function(){
						var ooRoles = {
							objId : this.objId, //业务规格ID
							objInstId : OrderInfo.SEQ.servSeq--, //业务对象实例ID,新装默认-1
							objType : this.objType, // 业务对象类型
							prodId : prodId,
							//memberRoleCd : this.memberRoleCd, //成员角色类型
							offerRoleId : this.offerRoleId, //销售品角色ID
							state : "ADD" //动作
						};
						busiOrder.data.ooRoles.push(ooRoles); //功能类产品
					});
				}
			});
		}); 
		
		if(order.service.oldMemberFlag){//纳入老用户
			var offerRoleId = "";
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
							offerRoleId = offerRole.offerRoleId;
							break;
				} 
			}
			for(var q=0;q<OrderInfo.oldprodInstInfos.length;q++){
				var oldprodInfo = OrderInfo.oldprodInstInfos[q];
				var oldbusiOrder = {
						areaId : oldprodInfo.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							objId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferId,  //业务规格ID
							instId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferInstId, //业务对象实例ID
							accessNumber : oldprodInfo.accNbr, //业务号码
							isComp : "Y", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER
						}, 
						data:{
							ooRoles : []			
						}
					};
				
					var memberid = -1;
					for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
						if(OrderInfo.oldoffer[i].accNbr==oldprodInfo.accNbr){
							$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
								//if((this.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD || this.roleCd=="1") && this.objType=="2"){
								if(this.objType==CONST.OBJ_TYPE.PROD){
									var ooRole = {
										objId : this.objId,
										objInstId : this.objInstId,
										objType : this.objType,
										offerMemberId : memberid,
										offerRoleId : offerRoleId,
										state : "ADD"
									};
									busiOrder.data.ooRoles.push(ooRole);
									var oldooRole = {
											objId : this.objId,
											objInstId : this.objInstId,
											objType : this.objType,
											offerMemberId : this.offerMemberId,
											offerRoleId : this.offerRoleId,
											state : "DEL"
										};
									oldbusiOrder.data.ooRoles.push(oldooRole);
									--memberid;
								}
							});
						}
					}
				busiOrders.push(oldbusiOrder);
			}
			if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) { //遍历主销售品构成
					$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
							if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
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
		}
		
		//销售参数节点
		var offerSpecParams = OrderInfo.offerSpec.offerSpecParams;
		if(offerSpecParams!=undefined && offerSpecParams.length>0){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpecParams.length; i++) {
				var param = offerSpecParams[i];
				if(param.setValue==undefined || param.setValue==""){
					param.setValue = param.value;
				}
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.setValue,
	                state : "ADD"
	            };
	            busiOrder.data.ooParams.push(ooParam);
			}				
		}
		
		//销售生失效时间节点
		if(OrderInfo.offerSpec.ooTimes !=undefined ){  
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(OrderInfo.offerSpec.ooTimes);
		}
		
		//所属人节点
		var ooOwners = {
			partyId : OrderInfo.cust.custId, //客户对象ID
			state : "ADD" //动作
		};
		busiOrder.data.ooOwners.push(ooOwners);
		
		//发展人
		var $tr = $("#dealerTbody tr[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid"),
					channelNbr : $(this).find("select[name ='dealerChannel_"+OrderInfo.offerSpec.offerSpecId+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				var dealer_name = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("value")
				};
				busiOrder.data.busiOrderAttrs.push(dealer_name);
			});
		}
		
		busiOrders.push(busiOrder);
		return busiOrder;
	};
	
	//创建产品节点
	var _createProd = function(prodId,prodSpecId) {	
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prodId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq-- 
			}, 
			busiObj : { //业务对象节点
				objId : prodSpecId,  //业务对象ID
				instId : prodId, //业务对象实例ID
				isComp : "N"  //是否组合
				//accessNumber : "" //接入号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
				boActionTypeCd : "1"
			}, 
			data:{
				boProdFeeTypes : [], //付费方式节点
				boProdSpecs : [{
					prodSpecId : prodSpecId,
					state : 'ADD'
				}], //产品规格节点
				boCusts : [],  //客户信息节点		
				boProdItems : [], //产品属性节点
				boProdPasswords : [], //产品密码节点
				boProdAns : [], //号码信息节点
				//boProd2Tds : [], //UIM卡节点信息
				bo2Coupons : [],  //物品信息节点
				boAccountRelas : [], //帐户关联关系节
				boCertiAccNbrRels : [], //证号关联关系节点
				boProdStatuses : [], //产品状态节点
				busiOrderAttrs : [] //订单属性节点
			}
		};
		
		var prodStatus = CONST.PROD_STATUS_CD.NORMAL_PROD;
		if($("#isActivation").attr("checked")=="checked"){//首话单激活
			prodStatus = CONST.PROD_STATUS_CD.DONE_PROD;
		}else if($("#isTemplateOrder").attr("checked")=="checked"){ //批量订单
			if($("#templateOrderDiv").find("select").val()==0){ //批量开活卡
				prodStatus = CONST.PROD_STATUS_CD.READY_PROD;	
			}
		}
		//封装产品状态节点
		busiOrder.data.boProdStatuses.push({
			state : "ADD",
			prodStatusCd : prodStatus
		});	
			
		//封装号码信息节点
		var boProdAns = OrderInfo.boProdAns;
		for ( var i = 0; i < boProdAns.length; i++) {
			if(boProdAns[i].prodId==prodId){
				busiOrder.data.boProdAns.push(boProdAns[i]);
				busiOrder.busiObj.accessNumber = boProdAns[i].accessNumber;
				break;
			}
		}
		
		//封装UIM卡信息节点
		var boProd2Tds = OrderInfo.boProd2Tds;
		for ( var i = 0; i < boProd2Tds.length; i++) {
			if(boProd2Tds[i].prodId==prodId){
				busiOrder.data.bo2Coupons.push(boProd2Tds[i]);
				break;
			}
		}
		
		/*//封装物品信息节点
		var bo2Coupons = OrderInfo.bo2Coupons;
		for ( var i = 0; i < bo2Coupons.length; i++) {
			if( bo2Coupons[i].prodId==prodId){
				busiOrder.data.bo2Coupons = bo2Coupons[i].coupons;
				break;
			}
		}*/
		
		//封装客户与产品之间的关系信息
		busiOrder.data.boCusts.push({
			partyId	: OrderInfo.cust.custId, //客户ID
			partyProductRelaRoleCd : "0", //客户与产品之间的关系（担保关系）
			state : "ADD" //动作
		});
		
		//封装产品密码
		var pwd=$("#pwd_"+prodId).val();
		if(pwd=="******"){
			pwd = order.main.genRandPass6();
		}
		var boProdPassword = {
			prodPwTypeCd : 2, //密码类型
			pwd : pwd, //密码
			state : "ADD"  //动作
		};
		busiOrder.data.boProdPasswords.push(boProdPassword);
		
		//封装产品属性
		$("[name=prodSpec_"+prodId+"]").each(function(){
			var itemSpecId=$(this).attr("id").split("_")[0];
			//防止提交重复的产品属性
			var exist = false;
			for(var i=0;i<busiOrder.data.boProdItems.length;i++){
				if(busiOrder.data.boProdItems[i].itemSpecId == itemSpecId){
					exist = true;
					break;
				}
			}
			if(!exist){
				var val=$.trim($(this).val());
				if(val!=""&&val!=undefined){
					var prodSpecItem = {
							itemSpecId : itemSpecId,  //属性规格ID
							prodSpecItemId : OrderInfo.SEQ.itemSeq--, //产品属性实例ID
							state : "ADD", //动作
							value : val//属性值	
					};
					busiOrder.data.boProdItems.push(prodSpecItem);
				}
			}
		});
		
		//封装付费方式
		//var paytype=$('select[name="pay_type_'+prodId+'"]').val(); 
		var paytype=$('select[name="pay_type_-1"]').val();  //先写死
		if(paytype!= undefined){
			busiOrder.data.boProdFeeTypes.push({
				feeType : paytype,
				state : "ADD"
			});
		}
		
		//封装付费方式
		/*$("[name=prodSpec_"+prodId+"]").each(function(){
			var itemSpecId=$(this).attr("id").split("_")[0];
			if(itemSpecId==CONST.PROD_ATTR.FEE_TYPE){ //付费方式
				busiOrder.data.boProdFeeTypes.push({
					feeType : $(this).val(),
					state : "ADD"
				});
				return false;
			}
		});
		*/
		/*//订单属性
		var remark = $('#order_remark').val();   //订单备注
		if(remark!=""&&remark!=undefined){
			busiOrder.data.busiOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});	
		}*/
		//发展人
		var $tr;
		var objInstId_dealer;
		if(OrderInfo.actionFlag==6){ //加装发展人根据产品
			objInstId_dealer = prodId;
			$tr = $("tr[name='tr_"+prodId+"']");
		}else{
			objInstId_dealer = OrderInfo.offerSpec.offerSpecId;
			$tr = $("#dealerTbody tr[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		}
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid"),
					channelNbr : $(this).find("select[name ='dealerChannel_"+objInstId_dealer+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				var dealer_name = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("value") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer_name);
			});
		}
		
		var $option = $("#acctSelect").find("option:selected");
		var acctId = $option.attr("value");
		var acctCd = -1;
		if(acctId==undefined){
			acctId = -1;
			acctCd = -1;
		}else if(acctId<0 ){ //新增
			acctCd = acctId;
		}else{
			acctCd = $option.attr("acctcd");
		}
		var boAccountRela = {
			acctId : acctId,
			acctCd : acctCd,
			acctRelaTypeCd : "1", //帐户和产品关联原因
			chargeItemCd : "0", //帐户主要费用类型
			percent : "100", //付费比例
			priority : "1",  //付费优先级
			state : "ADD" //动作
		};
		
		busiOrder.data.boAccountRelas.push(boAccountRela);	
		if (ec.util.isObj(OrderInfo.boProdAns) && OrderInfo.boProdAns.length > 0 && prodSpecId != CONST.PROD_SPEC.PROD_CLOUD_OFFER) {
            $.each(OrderInfo.boProdAns, function () {
                if (busiOrder.busiObj.accessNumber != this.accessNumber) {//封装当前号码下的证号关系节点
                    return true;
                }
                var currUserInfo = null;
                var parent = this;
                var ca = $.extend(true, {}, OrderInfo.boCertiAccNbrRel);
                var isON = query.common.queryPropertiesStatus("REAL_USER_"+OrderInfo.cust.areaId.substr(0,3));//新使用人开关
                if (isON) {
                    $.each(OrderInfo.subUserInfos, function () {
                        if (this.prodId == parent.prodId) {
                            currUserInfo = this;
                        }
                    });
                } else {
                    $.each(OrderInfo.choosedUserInfos, function () {
                        if (this.prodId == parent.prodId) {
                            currUserInfo = this.custInfo;
                        }
                    });
                }

                ca.accNbr = this.accessNumber;
                ca.state = this.state;
                if (ec.util.isObj(currUserInfo)) {
                    ca.partyId = currUserInfo.custId;
                    ca.certType = isON ? currUserInfo.orderIdentidiesTypeCd : currUserInfo.identityCd;
                    ca.certNum = isON?currUserInfo.identityNum:currUserInfo.idCardNumber;
                    ca.certNumEnc = isON ? currUserInfo.certNumEnc : currUserInfo.certNum;
                    ca.custName = isON ? currUserInfo.orderAttrName : currUserInfo.partyName;
                    ca.custNameEnc = isON ? currUserInfo.custNameEnc : currUserInfo.CN;
                    ca.certAddress = isON ? currUserInfo.orderAttrAddr : currUserInfo.addressStr;
                    ca.certAddressEnc = isON ? currUserInfo.certAddressEnc : currUserInfo.address;
                } else {
                    ca.partyId = OrderInfo.cust.custId;
                    if (OrderInfo.cust.custId == "-1") {//新建客户
                        if (CacheData.isGov(OrderInfo.boCustIdentities.identidiesTypeCd)) {//政企客户新建没使用人，不封装证号关系节点
                            return true;
                        } else {
                            ca.certType = OrderInfo.boCustIdentities.identidiesTypeCd;
                            ca.certNum = OrderInfo.boCustIdentities.identityNum;
                            ca.custName = OrderInfo.boCustInfos.name;
                            ca.certAddress = OrderInfo.boCustInfos.addressStr;
                        }
                    } else {//老客户
                        _setUserInfo(ca);
                    }
                }
                ca.serviceType = "1000";
                busiOrder.data.boCertiAccNbrRels.push(ca);
            });
        }
		return busiOrder;
	};
	
	//创建附属销售品节点
	var _createAttOffer = function(offerSpec,prodId,flag,busiOrders) {
		if(flag==1){  //退订附属
			offerSpec.offerTypeCd = 2;
			offerSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
			OrderInfo.getOfferBusiOrder(busiOrders,offerSpec,prodId);
		}else if(flag==2){  //参数变更
			if(offerSpec.offerSpec.offerSpecParams!=undefined && offerSpec.offerSpec.offerSpecParams.length>0){  //销售参数节点
				offerSpec.offerTypeCd = 2;
				offerSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.UPDATE_OFFER;
				OrderInfo.getOfferBusiOrder(busiOrders,offerSpec,prodId);
			}
			/*if(offerSpec.offerMembers!=undefined && offerSpec.offerMembers.length>0){ //设置功能产品参数	 
				for (var i = 0; i < offerSpec.offerMembers.length; i++) {
					var offerMember = offerSpec.offerMembers[i];
					if(offerMember.prodParamInfos.length >0){
						offerMember.boActionTypeCd = CONST.BO_ACTION_TYPE.PRODUCT_PARMS;
						offerMember.prodId = prodId;
						offerMember.prodSpecId = offerMember.objId;
						busiOrders.push(OrderInfo.getProdBusiOrder(offerMember));
					}
				}
			}*/
		}else{ //订购
			offerSpec.offerTypeCd = 2;
			offerSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_OFFER;
			offerSpec.offerId = OrderInfo.SEQ.offerSeq--; 
			OrderInfo.getOfferBusiOrder(busiOrders,offerSpec,prodId);			
		}
	};
	
	//创建功能产品节点
	var _createServ = function(servSpec,prodId,flag,busiOrders) {
		servSpec.prodId = prodId;
		if(flag==1){  //退订附属
			servSpec.servClose = "Y";
			servSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.SERV_OPEN;
			busiOrders.push(OrderInfo.getProdBusiOrder(servSpec));	
		}else if(flag==2){  //参数变更
			if(servSpec.prodSpecParams!=undefined && servSpec.prodSpecParams.length>0){  //设置功能产品参数	
				servSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.PRODUCT_PARMS;
				servSpec.memberId = servSpec.servId;
				busiOrders.push(OrderInfo.getProdBusiOrder(servSpec));
			}
		}else{ //订购
			servSpec.servId = OrderInfo.SEQ.servSeq--;
			servSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.SERV_OPEN;		
			busiOrders.push(OrderInfo.getProdBusiOrder(servSpec));	
		}
	};
	
	//改号
	var _changeNumber = function(busiOrders){
		var data = {};
		data.boProdAns = OrderInfo.boProdAns;
		OrderInfo.setProdModifyBusiOrder(busiOrders,data);
	};	
	
	//订单数据校验
	var _checkData = function() {
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14 || (OrderInfo.actionFlag==2&&offerChange.newMemberFlag)){ //新装
			if(OrderInfo.cust.custId==""){
				$.alert("提示","客户信息不能为空！");
				return false ; 
			}
			//遍历主销售品构成
			if(OrderInfo.order.dealerTypeList==undefined ||OrderInfo.order.dealerTypeList.length == 0 ){
				$.alert("提示","发展人类型不能为空！");
				return false ; 
			}
			
			if(!query.common.queryPropertiesStatus("ADD_OLD_USER_MOD_ACCT_"+OrderInfo.getAreaId().substring(0,3))){
				//纳入老用户判断主卡副卡账户一致
				if(ec.util.isArray(OrderInfo.oldprodAcctInfos)){
					for(var a=0;a<OrderInfo.oldprodAcctInfos.length;a++){
						var oldacctId = OrderInfo.oldprodAcctInfos[a].prodAcctInfos[0].acctId;
						var mainacctid = $("#acctSelect option:selected").val();
						if(oldacctId!=mainacctid){
							$.alert("提示","副卡和主卡的账户不一致！");
							return false ; 
						}
					}
				}
			}
			
			if(order.service.oldMemberFlag){
				var paytype=$('select[name="pay_type_-1"]').val();
				var isNumberRight=0;
				var nowNum="";
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.feeType.feeType!=paytype){
						isNumberRight=1;
						nowNum=this.accNbr;
						return;
					}
				});
				
				if(isNumberRight==1){
					//$.alert("提示",nowNum+"和主卡的付费类型不一致！");
				//	return false;
				}
			}
			
			//校验号码跟UIM卡
			if(!(order.memberChange.oldMemberFlag && !order.memberChange.newMemberFlag  && !order.memberChange.changeMemberFlag) &&
					!(!order.memberChange.oldMemberFlag && !order.memberChange.newMemberFlag  && order.memberChange.changeMemberFlag)){
				for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
					var offerRole = OrderInfo.offerSpec.offerRoles[i];
					var prodInsts=OrderInfo.offerSpec.offerRoles[i].prodInsts;
					if(prodInsts!=undefined && prodInsts!=null && prodInsts!=""){
					for ( var j = 0; j < offerRole.prodInsts.length; j++) {
						var prodInst = offerRole.prodInsts[j];
						if(OrderInfo.actionFlag==2){
							var instid = '"'+prodInst.prodInstId+'"';
							if(prodInst.memberRoleCd=="401" && instid.indexOf("-")!=-1){
								var accNbr = OrderInfo.getProdAn(prodInst.prodInstId).accessNumber;
								var password = $("#pwd_"+prodInst.prodInstId).val();
								if(password!="******"){
									if(!order.main.passwordCheckVal(password, accNbr)){
										return false ;
									}
								}
								if(accNbr==undefined || accNbr == ""){
									$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
									return false;
								} 
								if(OrderInfo.getProdTd(prodInst.prodInstId)==""&&(OrderInfo.zcd_privilege!=0||OrderInfo.actionFlag == 14)){
									$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】UIM卡不能为空！");
									$("#uim_txt_"+prodInst.prodInstId).css("border-color","red");
									return false;
								}
							}
						}else{
							var accNbr = OrderInfo.getProdAn(prodInst.prodInstId).accessNumber;
							var password = $("#pwd_"+prodInst.prodInstId).val();
								if(password!="******"){
									if(!order.main.passwordCheckVal(password, accNbr)){
										return false ;
									}
								}
								if(accNbr==undefined || accNbr == ""){
									$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
									return false;
								} 
								if(OrderInfo.getProdTd(prodInst.prodInstId)==""&&(OrderInfo.zcd_privilege!=0||OrderInfo.actionFlag == 14)){
									if(prodInst.objId!=CONST.PROD_SPEC.PROD_CLOUD_OFFER){
										$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】UIM卡不能为空！");
										$("#uim_txt_"+prodInst.prodInstId).css("border-color","red");
										return false;
									}
								}
							}
							//封装产品属性
							var flag = false;
							$("[name='pay_type_-1']").each(function(){
								if($(this).val()!= undefined&&$(this).val()!=null&&$(this).val()!=""){
									flag = true ;
								}
							});
							if(!flag){
								$.alert("信息提示","没有配置付费类型，无法提交");
								return false;
							}
						//校验必填的产品属性和是否有重复的产品属性
						var prodAttrEmptyFlag = false; //必填产品属性是否已输入
						var prodAttrRepeatFlag = false; //是否包含重复的产品属性
						var prodAttrEmptyCheckName = null;
						var prodAttrRepeatCheckName = null;
						var prodAttrErrorFlag = false;//产品属性格式错误
						var prodAttrErrorCheckName = null;
						$(OrderInfo.prodAttrs).each(function(){
							var id = this.id;
							if(!prodAttrEmptyFlag){
								if(this.isOptional == "N" && id){
									var val=$.trim($("#"+id).val());
									if(val == "" || val == undefined){
										prodAttrEmptyCheckName = this.name;
										prodAttrEmptyFlag = true;
									}
								}
							}
							if(!prodAttrRepeatFlag){
								if($("[id='"+id+"']").length > 1){
									prodAttrRepeatCheckName = this.name;
									prodAttrRepeatFlag = true;
								}
							}
							//遍历产品属性，涉及企业云邮箱和管理员手机号，单独做正则判断
							var checkName = this.name;
							if(checkName == "企业管理员邮箱"){
								var val=$.trim($("#"+id).val());
								 if(!val.match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/)){
									 prodAttrErrorFlag = true;
									 prodAttrErrorCheckName = "管理员邮箱格式输入错误，无法提交";
								 }
							}
							if(checkName == "管理员手机号码"){
								var val=$.trim($("#"+id).val());
								var rex = /^1\d{10}$/;
								if(!val.match(rex)){
									 prodAttrErrorFlag = true;
									 prodAttrErrorCheckName = "管理员手机号码格式输入错误，无法提交";
								 }
							}
						});
						if(prodAttrErrorFlag){
							$.alert("信息提示",prodAttrErrorCheckName);
							return false;
						}
						//加载副卡使用人可以为空 redmine926542
						if(prodAttrEmptyCheckName =='使用人' &&  OrderInfo.roleType=="Y"){
							prodAttrEmptyFlag = false;
						}
						if(prodAttrEmptyFlag){
							$.alert("信息提示","没有配置产品属性("+prodAttrEmptyCheckName+")，无法提交");
							return false;
						}
						if(prodAttrRepeatFlag){
							$.alert("信息提示","产品属性("+prodAttrRepeatCheckName+")重复，无法提交");
							return false;
						}
						
						if(!order.main.templateTypeCheck()){
							return false;
						}
					}
				  }
				}
			}
			
			var oldMemberUimFlag = true;
			if(order.memberChange.oldMemberFlag || offerChange.oldMemberFlag){
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
					$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
						var member = this;
						if(member.objType == CONST.OBJ_TYPE.PROD){  //接入产品
							if(AttachOffer.isChangeUim(member.objInstId)){
								var td = OrderInfo.getProdTd(member.objInstId);
								if(td==""){
									$.alert("提示","加装移动电话"+member.accessNumber+" UIM卡不能为空！");
									oldMemberUimFlag = false;
									return false ; 
								}
							}
						}
					});
					if(!oldMemberUimFlag){
						break;
					}
				}
				if(!oldMemberUimFlag){
					return;
				}
			}
			var acctId = $("#acctSelect").val();
			if(acctId==undefined || $.trim(acctId)==""){
				$.alert("提示","请新建或者查询选择一个可用帐户");
				return false;
			}
			if(acctId<0){
				//帐户信息填写校验
				if(!_checkAcctInfo()){
					return false;
				}
			}
		}

        //一证五号校验
        if(!_oneCertFiveCheckData(order.cust.getCustInfo415())){
            return false;
        }

		//补换卡校验
		if(OrderInfo.actionFlag == 22 || OrderInfo.actionFlag == 23){
			if(OrderInfo.boProd2OldTds.length==0){
				$.alert("提示","原UIM卡信息为空！");
				return false ; 
			}
			if(OrderInfo.boProd2Tds.length==0 && OrderInfo.zcd_privilege!=0){
				$.alert("提示","UIM卡不能为空！");
				return false ; 
			}
	        if(OrderInfo.actionFlag==22 &&  OrderInfo.boProd2Tds[0].cardTypeFlag==1  && order.prodModify.choosedProdInfo.productId != '280000000' && OrderInfo.isSuccess == "N"){
	        	$.alert("提示","可选包加载失败！不能正常受理业务！");
			    return false ; 
		    }
		}
		
		//销售品更功能产品参数校验
		if(OrderInfo.actionFlag == 1||OrderInfo.actionFlag == 2||OrderInfo.actionFlag == 3
				|| OrderInfo.actionFlag == 6||OrderInfo.actionFlag == 14||OrderInfo.actionFlag ==21 || OrderInfo.actionFlag ==22){
			//判断UIM卡校验是否与当前业务匹配
			for ( var i = 0; i < OrderInfo.checkUimData.length; i++) {
				var uimData = OrderInfo.checkUimData[i];
				if (uimData.isWireBusi == 1) { // 上网卡 - 移动电话业务
					$.alert("提示", "选择的UIM卡为【" + uimData.uimCode
							+ "+" + uimData.uimName
							+ "】，无法办理移动电话产品，请使用普通UIM卡办理业务。");
					return false;
				} else if (uimData.isWireBusi == 2) { // 普通卡 - 无线业务
					$.alert("提示", "选择的UIM卡为【" + uimData.uimCode
							+ "+" + uimData.uimName
							+ "】，无法办理天翼宽带-无线上网产品，请使用数据卡类型的UIM卡办理业务。");
					return false;
				}
			}
			//附属销售参数设置校验
			for ( var i = 0; i < AttachOffer.openList.length; i++) {
				var specList = AttachOffer.openList[i].specList;
				var roleName = OrderInfo.getOfferRoleName(AttachOffer.openList[i].prodId);
				for (var j = 0; j < specList.length; j++) {
					var spec = specList[j];
					if(spec.isdel!="Y" && spec.isdel!="C"){
						if(spec.ifParams){  //销售参数节点
							if(spec.isset !="Y"){
								$.alert("提示",roleName+" "+spec.offerSpecName+"：参数未设置");
								return false ; 
							}
						}
					}
				}
			}
			//功能产品参数设置校验
			for ( var i = 0; i < AttachOffer.openServList.length; i++) {
				var specList = AttachOffer.openServList[i].servSpecList;
				var roleName = OrderInfo.getOfferRoleName(AttachOffer.openServList[i].prodId);
				for (var j = 0; j < specList.length; j++) {
					var spec = specList[j];
					if(spec.isdel!="Y" && spec.isdel!="C"){
						if(spec.servSpecId==CONST.PROD_SPEC_ID.MIFI_ID && CONST.APP_DESC==0){
							if("no"==$("#isMIFI_-"+(i+1)).val()){
								$.alert("提示","要开通"+spec.servSpecName+"功能，请选择4G上网卡-全球卡（MIFI卡）！");
								$("#uim_txt_-"+(i+1)).css("border-color","red");
								return false ; 
							}
						}
						if(spec.ifParams=="Y"){  //销售参数节点
							if(spec.isset !="Y"){
								$.alert("提示",roleName+" "+spec.servSpecName+"：参数未设置");
								return false ; 
							}
						}
					}
				}
			}
				//附属销售参数终端校验
				for ( var i = 0; i < AttachOffer.openList.length; i++) {
					var specList = AttachOffer.openList[i].specList;
					var prodId = AttachOffer.openList[i].prodId;
					var roleName = OrderInfo.getOfferRoleName(prodId);
					for (var j = 0; j < specList.length; j++) {
						var spec = specList[j];
						if(spec.isdel!="Y" && spec.isdel!="C"){
							if(spec.isTerminal==1){  //1表示有终端
								var min=spec.agreementInfos[0].minNum;
								var max=spec.agreementInfos[0].maxNum;
								var total=0;
								var flag = true;
								var isrepeat=false;
								var $input=$("input[id^=terminalText_"+prodId+"_"+spec.offerSpecId+"]");
								$input.each(function(){//遍历页面上面的串码输入框，为的是跟缓存里面的串码进行比对
									var finder=false;
									var instCode=$.trim(this.value);//页面上面的串码
									if(ec.util.isObj(instCode)){
										var objInstId = prodId+"_"+spec.offerSpecId;
										if(AttachOffer.checkData(objInstId,instCode)){
											isrepeat=true;
											return false;
										}
										$.each(OrderInfo.attach2Coupons,function(){
											if(spec.offerSpecId == this.attachSepcId && prodId==this.prodId){
												var couponInstanceNumber=this.couponInstanceNumber;//缓存里面的串码
												if($.trim(couponInstanceNumber)==instCode){
													total++;
													finder=true;
													flag=false;
													return false;
												}
											}	
										});
									}
									if(!finder){//没有找到
										flag=true;
										return false;
									}
								});
								if(isrepeat){
									return false ; 
								}
								if(total<min){//总的终端数比合约终端还小，无法提交
									$.alert("提示",roleName+" "+spec.offerSpecName+"：合约终端数必须不小于"+min);
									return false ; 
								}
								if(flag){
									$.alert("提示",roleName+" "+spec.offerSpecName+"：终端信息未填写全");
									return false ; 
								}
							}
							
						}
					}
			
			
			//套餐变更,可选包变更，补换卡校验
			if(CONST.getAppDesc()==0){
				if(OrderInfo.actionFlag == 2 ){ //套餐变更补换卡校验
					for ( var k = 0; k < OrderInfo.offer.offerMemberInfos.length; k++) {
						var member = OrderInfo.offer.offerMemberInfos[k];
						if(member.objType == CONST.OBJ_TYPE.PROD){  //接入产品
							if(AttachOffer.isChangeUim(member.objInstId)){
								var td = OrderInfo.getProdTd(member.objInstId);
								if(td==""){
									$.alert("提示",member.roleName+" UIM卡不能为空！");
									return false ; 
								}
							}
						}
					}
				}else if(OrderInfo.actionFlag == 3){ //可选包变更补换卡校验
					if(AttachOffer.isChangeUim()){
						if(OrderInfo.boProd2Tds.length==0){
							$.alert("提示","UIM卡不能为空！");
							return false ; 
						}
					}
				}else if(OrderInfo.actionFlag == 6){//主副卡变更，副卡换套餐
					if(ec.util.isArray(OrderInfo.viceOfferSpec)){//多张副卡同时进行换挡
						var flag=false;
						$.each(OrderInfo.viceOfferSpec,function(){
							var prodId=this.prodId;
							for ( var k = 0; k < OrderInfo.offer.offerMemberInfos.length; k++) {
								var member = OrderInfo.offer.offerMemberInfos[k];
								if(prodId==member.objInstId&&member.objType == CONST.OBJ_TYPE.PROD){  //接入产品
									if(AttachOffer.isChangeUim(member.objInstId)){
										var td = OrderInfo.getProdTd(member.objInstId);
										if(td==""){
											$.alert("提示","基础移动电话 "+member.accessNumber+" UIM卡不能为空！");
											flag=true;
											return false ; 
										}
									}
								}
							}
						});
						if(flag){
							return false;
						}
					}
				}
			}
		}
		
		//开通4G功能产品时，需要校验UIM，终端是否是4G
		if(CONST.getAppDesc()==0){
			//TODO tmp for Mantis 0042657: 临时为北京去掉终端卡匹配关系，仅对北京生效
			if(OrderInfo.getAreaId() == null || OrderInfo.getAreaId().indexOf("811") != 0){
				for ( var i = 0; i < AttachOffer.openServList.length; i++) {
					var specList = AttachOffer.openServList[i].servSpecList;
					var flag = false;//是否开通4G上网功能产品
					var isTerminal=false;//是否有终端
					$.each(specList,function(){//遍历是否有开通4G上网功能
						if(this.servSpecId == CONST.PROD_SPEC.PROD_FUN_4G && this.isdel != "Y" && this.isdel != "C"){ //开通4G功能产品
							flag = true;
							return false;
						}
					});
					var prodId=AttachOffer.openServList[i].prodId;
					var termTypeFlags=[];//终端类型,兼容多个终端
					
					if(AttachOffer.openList[i]!=undefined){
						var specListTemp = AttachOffer.openList[i].specList;
						for (var j = 0; j < specListTemp.length; j++) {
							var spec = specListTemp[j];
							if(spec.isdel!="Y" && spec.isdel!="C"){
								if(spec.isTerminal==1){  //1表示有终端
									$.each(OrderInfo.attach2Coupons,function(){//遍历是否有终端
										if(prodId==this.prodId){//有终端信息
											isTerminal = true;
											if(ec.util.isObj(this.termTypeFlag)){
												var param={
														termTypeFlag:this.termTypeFlag
												};
												termTypeFlags.push(param);
											}
										}	
									});
								}
							}
						}
					}
					
					var roleName = OrderInfo.getOfferRoleName(prodId);
					if(isTerminal&&!ec.util.isArray(termTypeFlags)&&OrderInfo.zcd_privilege!=0){
						$.alert("信息提示",roleName+"中,营销资源未返回终端机型，无法判断是3G终端还是4G终端!");
						return false;
					}
					
					if(flag){ //该产品已经开通4G功能产品，需要做4G卡终端校验
						if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14 || order.memberChange.newMemberFlag || order.memberChange.oldMemberFlag){ //新装
							var uim = OrderInfo.getProdUim(prodId);
							if(uim.cardTypeFlag=="2"){ //3g卡
								$.alert("信息提示","您已开通【4G（LTE）上网】功能产品，不能使用3G卡，故无法提交");
								return false;
							}
							if(_isThreeTerminal(termTypeFlags,isTerminal)){
								$.alert("信息提示","您已开通【4G（LTE）上网】功能产品，不能使用3G终端，故无法提交");
								return false;
							}
						}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3 || order.memberChange.changeMemberFlag){
							var oldUim = OrderInfo.getProdOldUim(prodId);
							if(oldUim.is4GCard!="Y"){//旧卡不是4G卡 就判断新卡是否是4G卡
								var uim = OrderInfo.getProdUim(prodId);
								if(uim.cardTypeFlag=="2"){
									$.alert("信息提示","您已开通【4G（LTE）上网】功能产品，不能使用3G卡，故无法提交");
									return false;
								}
							}
							if(_isThreeTerminal(termTypeFlags,isTerminal)){
								$.alert("信息提示","您已开通【4G（LTE）上网】功能产品，不能使用3G终端，故无法提交");
								return false;
							}
						}
					}
				}
			} //TODO tmp for Mantis 0042657
		}
		}
		
		//根据开关判断是否进行经办人校验
		if (OrderInfo.realNamePhotoFlag == "ON") {
			//实名制拍照：经办人校验
			if(OrderInfo.orderAttrFlag == "Y"){
				//经办人必填进行校验，否则不校验
				if(OrderInfo.subHandleInfo.authFlag != "Y"){
					if(OrderInfo.subHandleInfo.authFlag == "F"){
						$.alert("提示","经办人拍照留存上传失败，请重新拍照认证！");
						return false;
					}  else if(OrderInfo.subHandleInfo.authFlag == "N"){
						$.alert("提示","经办人拍照人证相符审核，发送短信失败，失败原因："+OrderInfo.subHandleInfo.authFlagErr);
						return false;
					} else if(OrderInfo.subHandleInfo.authFlag == "S"){
						$.alert("提示","经办人拍照人证相符审核不通过，请重新审核。");
						return false;
					} else{
						$.alert("提示","经办人信息未通过人证相符认证，请您先对经办人拍照认证！");
						return false;
					}
				}
			}
		}else{//开关关闭,订单购物车属性(经办人)老模式
			var orderAttrName = $.trim($("#orderAttrName").val()); //经办人姓名
			var orderAttrIdCard =$.trim($("#orderAttrIdCard").val()); //证件号码
			var orderAttrPhoneNbr = $.trim($("#orderAttrPhoneNbr").val()); //联系人号码
			if(ec.util.isObj(orderAttrName)&&ec.util.isObj(orderAttrIdCard)&&ec.util.isObj(orderAttrPhoneNbr)){
			}else if(ec.util.isObj(orderAttrName)||ec.util.isObj(orderAttrIdCard)||ec.util.isObj(orderAttrPhoneNbr)){
				if(!ec.util.isObj(orderAttrName)){
					$.alert("提示","经办人姓名为空，经办人姓名、联系人号码、证件号码必须同时为空或不为空，因此无法提交！");
					return false;
				}
				if(!ec.util.isObj(orderAttrPhoneNbr)){
					$.alert("提示","联系人号码为空，经办人姓名、联系人号码、证件号码必须同时为空或不为空，因此无法提交！");
					return false;
				}
				if(!ec.util.isObj(orderAttrIdCard)){
					$.alert("提示","证件号码为空，经办人姓名、联系人号码、证件号码必须同时为空或不为空，因此无法提交！");
					return false;
				}
			}
		}
		return true; 
	};
	//判断是否包含有3G的机型
	var _isThreeTerminal=function(termTypeFlags,isTerminal){
		var threeTerminal=false;
		$.each(termTypeFlags,function(){
			if(isTerminal && this.termTypeFlag=="2"){
				threeTerminal=true;
				return false;
			}
		});
		return threeTerminal;
	};
	//帐户信息填写校验公用方法（新装，过户，帐户信息修改，改帐务定制关系）
	var _checkAcctInfo = function(){
		if($.trim($("#acctName").val())==""){
			$.alert("提示","帐户名称不能为空");
			return false;
		}
		if($("#paymentType").val()==110000){
			if($("#bankId").val()=="" || $.trim($("#bankAcct").val())=="" || $.trim($("#paymentMan").val())==""){
				$.alert("提示","若选择银行支付请填写必要的银行支付信息");
				return false;
			}
		}			
		if($("#postType").val()!=-1){
			if($.trim($("#postAddress").val())==""){
				$.alert("提示","若选择投递账单请填写必要的账单投递信息");
				return false;
			}
			if($("#postType").val()==13){
				var EmailType = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/; // /^[^\.@]+@[^\.@]+\.[a-z]+$/;
				if(EmailType.test($("#postAddress").val())==false){
					$.alert("提示","若选择 Email 投递帐单请输入有效的 Email 地址");
					return false;
				}
			}
		}
		return true;
	};
	
	//修改资源状态
	var _updateResState= function() {
		var resources  = [];
		for (var i = 0; i < OrderInfo.boProdAns.length; i++) {	
			var res = {
				accNbr :OrderInfo.boProdAns[i].accessNumber,
				accNbrType : 1,  //号码类型（1手机号码2.UIM卡）
				action : "UPDATE"
			};
			resources.push(res);
		}
		for (var i = 0; i < OrderInfo.boProd2Tds.length; i++) {
			var res = {
				accNbr :OrderInfo.boProd2Tds[i].terminalCode,
				accNbrType : 2,  //号码类型（1手机号码2.UIM卡）
				action : "UPDATE"
			};
			resources.push(res);
		}
		if(resources.length>0){
			var url= contextPath+"/common/updateResState";	 
			$.callServiceAsJsonGet(url,{strParam:JSON.stringify(resources)},{
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
						}
					}
				}
			});	
		}
	};
	
	//显示模板名称
	var _showTemplateOrderName = function(id){
		if($("#isTemplateOrder").attr("checked")=="checked"){
			//#1476473 营业厅翼支付开户IT流程优化
			if(CacheData.hasServSpec(CONST.PROD_SPEC.YIPAY_SERVSPECID)){
				$.alert("提示","当前订单已订购【翼支付】功能产品，不允许勾选为批量模版，如需勾选，请退订【翼支付】功能产品。");
				$("#isTemplateOrder").removeAttr("checked");
				return;
			}
			if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==14){
				$(".template_info_type").show();
				$("#isActivation").removeAttr("checked");
				$("#isActivation").attr("disabled","disabled");
				//$("#templateTypeDiv").show();
				//$("#templateOrderName").show();
				//$("#templateOrderTitle").show();
			}
			$(".template_info_name").show();
		}else {
			$(".template_info_name").hide();
			$(".template_info_type").hide();
			$("#templateOrderName").val("");
			$("#isActivation").removeAttr("disabled");
			//$("#templateOrderTitle").hide();
			//$("#templateTypeDiv").hide();
			//$("#templateOrderName").val("");	
		}
	};
	
	//首话单激活
	var _showActivation = function(){
		if($("#isActivation").attr("checked")=="checked"){
			$("#isTemplateOrder").removeAttr("checked");
			$("#isTemplateOrder").attr("disabled","disabled");
			$(".template_info_name").hide();
			$(".template_info_type").hide();
			$("#templateOrderName").val("");
		}else {
			$("#isTemplateOrder").removeAttr("disabled");
		}
	};
	
	//重新排列offerRole 把按顺序把主卡角色提前
	var _sortOfferSpec = function(offerSpec){
		var tmpOfferSpecRole = [];
		for ( var i = 0; i < offerSpec.offerRoles.length; i++) {
			var offerRole = offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){ //主卡
				tmpOfferSpecRole.push(offerRole);
			}
		}
		for ( var i = 0; i < offerSpec.offerRoles.length; i++) {
			var offerRole = offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd!=CONST.MEMBER_ROLE_CD.MAIN_CARD){
				tmpOfferSpecRole.push(offerRole);
			}
		}
		offerSpec.offerRoles = tmpOfferSpecRole;
		return offerSpec;
	};
	
	var _checkOrder=function(){
		var flag = false;
		var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
		var prodId = order.prodModify.choosedProdInfo.prodInstId;
		var specList=CacheData.getOfferSpecList(prodId);
		if(ec.util.isArray(specList)){
			$.each(specList,function(){
				if(this.ifPackage4G=="Y" && this.isdel != "Y" && this.isdel != "C"){ //是否有开通4g流量包
					flag = true;
					return false;
				}
			});
		}
		if(CONST.getAppDesc()==0 && flag && prodClass==CONST.PROD_CLASS.THREE && OrderInfo.actionFlag==3){//可选包变更 且是3G用户套餐 开通了4G流量包 必须进行省预校验
			if(offerChange.checkOrder()){//省预校验
				var content=offerChange.checkAttachOffer(prodId);
				if(content!=""){
					if(_checkData()){
						$("#offer_serv").html(content);
						easyDialog.open({
							container : 'offer_dialog'
						});
					}
//					$.confirm("信息确认",content,{ 
//						yesdo:function(){
//							if(_checkData()){
//								AttachOffer.setChangeList(prodId);
//								SoOrder.submitOrder();
//							}
//						},
//						no:function(){
//						}
//					});
				}else{
					SoOrder.submitOrder();
				}
			}
		}else{
			SoOrder.submitOrder();
		}
	};
	var _orderPrepare=function(){
		var prodId = order.prodModify.choosedProdInfo.prodInstId;
		AttachOffer.setChangeList(prodId);
		SoOrder.submitOrder();
		easyDialog.close();
	};
	
	//判断是否是3G转4G
	var _setOfferType=function(){
		var oldType=order.prodModify.choosedProdInfo.is3G;
		if(OrderInfo.actionFlag==2){
			var newType=OrderInfo.offerSpec.is3G;
			if(ec.util.isObj(oldType)){
				if(ec.util.isObj(newType)){
					if(oldType=="Y"&&newType=="N"){
						return true;
					}
				}
			}
		}else if(OrderInfo.actionFlag==3){
			if(ec.util.isObj(oldType)){
				if(oldType=="Y"){
					for ( var i = 0; i < AttachOffer.openServList.length; i++) {
						var specList = AttachOffer.openServList[i].servSpecList;
						var flag = false;//是否开通4G上网功能产品
						$.each(specList,function(){//遍历是否有开通4G上网功能
							if(this.servSpecId == CONST.PROD_SPEC.PROD_FUN_4G && this.isdel != "Y" && this.isdel != "C"){ //开通4G功能产品
								flag = true;
								return false;
							}
						});
						if(flag){
							return true;
						}
					}
				}
			}
		}
		return false;
	};
	
	//填充订单经办人信息
	var _addHandleInfo = function(busiOrders, custOrderAttrs){
		if(OrderInfo.realNamePhotoFlag == "ON"){//开关打开
			if(OrderInfo.subHandleInfo.orderAttrFlag == "Y" || OrderInfo.subHandleInfo.orderAttrFlag == "C"){
				//经办人必填时进行经办人填充
				if(OrderInfo.subHandleInfo.authFlag == "Y"){
					//人证相符
					if(OrderInfo.subHandleInfo.handleExist == "Y"){
						//如果是老客户
						OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;//门户主页客户定位的客户ID
						OrderInfo.orderData.orderList.orderListInfo.handleCustId = OrderInfo.subHandleInfo.handleCustId;//经办人查询出的客户ID
					} else if(OrderInfo.subHandleInfo.handleExist == "N"){
						//如果是新客户
						var handleCustInstId = OrderInfo.SEQ.offerSeq--;
						OrderInfo.HandleCustInstId = handleCustInstId;
						OrderInfo.orderData.orderList.orderListInfo.handleCustId = handleCustInstId;//新建经办人，handleCustId与partyId一致
						OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;//-3经办人客户，-2使用人客户，-1产权客户
						_createHandleCust(busiOrders);
					} else{
						$.alert("提示","经办人信息发生未知异常，可能重复操作或多窗口操作，请刷新页面清空浏览器缓存后重新尝试！");
						return false;
					}
				}
			}else{
				var handleCustId = $("#orderAttrCustId").val(); 
				OrderInfo.orderData.orderList.orderListInfo.handleCustId = handleCustId;
			}
			//添加虚拟订单ID属性
			if(OrderInfo.subHandleInfo.virOlId != null && OrderInfo.subHandleInfo.virOlId != undefined && OrderInfo.subHandleInfo.virOlId != ""){
				//添加虚拟订单ID属性
				custOrderAttrs.push({
					itemSpecId : CONST.BUSI_ORDER_ATTR.VIROLID,
					value : OrderInfo.subHandleInfo.virOlId//即照片上传时后台返回的18位的虚拟订单ID:virOlId
				});
				var result =  query.common.queryPropertiesMapValue("FACE_VERIFY_FLAG", "FACE_VERIFY_"+String(OrderInfo.staff.areaId).substr(0, 3));
				if(ec.util.isObj(OrderInfo.handleInfo.identityPic) && result.FACE_VERIFY_SWITCH == "ON" && !query.common.checkOperateSpec("RZBDGN")){
			        custOrderAttrs.push({
					    itemSpecId : CONST.BUSI_ORDER_ATTR.CONFIDENCE,
						value : OrderInfo.confidence  //人证照片比对相似度
					});
					custOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.FACE_VERIFY_FLAG,
						value : OrderInfo.faceVerifyFlag //人证比对是否成功 
					});
				}
			}
		} else{//开关关闭
			//订单购物车属性(经办人) 老模式
			var orderAttrName = $.trim($("#orderAttrName").val()); //经办人姓名
			var orderIdentidiesTypeCd = $("#orderIdentidiesTypeCd  option:selected").val(); //证件类型
			var orderAttrIdCard =$.trim($("#orderAttrIdCard").val()); //证件号码
			var orderAttrAddr = $.trim($("#orderAttrAddr").val()); //地址
			var orderAttrPhoneNbr = $.trim($("#orderAttrPhoneNbr").val()); //联系人号码
			if(ec.util.isObj(orderAttrName)&&ec.util.isObj(orderAttrIdCard)&&ec.util.isObj(orderAttrPhoneNbr)){
				if(ec.util.isObj(orderAttrName)){
					custOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.orderAttrName,
						value : orderAttrName
					});	
				}
				if(ec.util.isObj(orderAttrIdCard)){
					custOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.orderIdentidiesTypeCd,
						value : orderIdentidiesTypeCd
					});	
					custOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.orderAttrIdCard,
						value : orderAttrIdCard
					});	
				}
				if(ec.util.isObj(orderAttrPhoneNbr)){
					custOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.orderAttrPhoneNbr,
						value : orderAttrPhoneNbr
					});	
				}
				if(ec.util.isObj(orderAttrAddr)){
					custOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.orderAttrAddr,
						value : orderAttrAddr
					});	
				}
			}else if(ec.util.isObj(orderAttrName)||ec.util.isObj(orderAttrIdCard)||ec.util.isObj(orderAttrPhoneNbr)){
				if(!ec.util.isObj(orderAttrName)){
					$.alert("提示","经办人姓名为空，经办人姓名、联系人号码、证件号码必须同时为空或不为空，因此无法提交！");
					return false;
				}
				if(!ec.util.isObj(orderAttrPhoneNbr)){
					$.alert("提示","联系人号码为空，经办人姓名、联系人号码、证件号码必须同时为空或不为空，因此无法提交！");
					return false;
				}
				if(!ec.util.isObj(orderAttrIdCard)){
					$.alert("提示","证件号码为空，经办人姓名、联系人号码、证件号码必须同时为空或不为空，因此无法提交！");
					return false;
				}
			}
		}
	};
	
	//创建经办人节点
	var _createHandleCust = function(busiOrders) {
		var busiOrder = {
			areaId	: OrderInfo.getAreaId(),//受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId		: OrderInfo.HandleCustInstId,
				accessNumber: OrderInfo.getAccessNumber(-1)
			},  
			boActionType : {
				actionClassCd	: CONST.ACTION_CLASS_CD.CUST_ACTION,
				boActionTypeCd	: CONST.BO_ACTION_TYPE.CUST_CREATE
			}, 
			data : {
				boCustInfos 		: [],
				boCustIdentities	: [],
				boPartyContactInfo	: [],
				boCustCheckLogs     : [],
				boCustProfiles      : []
			}
		};
		//经办人信息节点
		busiOrder.data.boCustInfos.push({
			name			: OrderInfo.subHandleInfo.orderAttrName,//客户名称
			state			: "ADD",//状态
			areaId			: OrderInfo.getAreaId(),
			telNumber 		: OrderInfo.subHandleInfo.orderAttrPhoneNbr,//联系电话
			addressStr		: OrderInfo.subHandleInfo.orderAttrAddr,//客户地址
			partyTypeCd		: 1,//客户类型
			defaultIdType	: OrderInfo.subHandleInfo.identidiesTypeCd,//证件类型
			mailAddressStr	: OrderInfo.subHandleInfo.orderAttrAddr,//通信地址
			businessPassword: ""//客户密码
		});
		//客户证件节点
		busiOrder.data.boCustIdentities.push({
			state			: "ADD",//状态
			isDefault		: "Y",//是否首选
			identityNum		: OrderInfo.subHandleInfo.identityNum,//证件号码
			identidiesPic	: OrderInfo.subHandleInfo.imageInfo,//二进制证件照片
			identidiesTypeCd: OrderInfo.subHandleInfo.identidiesTypeCd//证件类型
		});
		//客户联系人节点
		if(OrderInfo.subHandleInfo.orderAttrPhoneNbr!=null && OrderInfo.subHandleInfo.orderAttrPhoneNbr !=""){
			var contactGender = "1";
			if(OrderInfo.subHandleInfo.identidiesTypeCd == "1"){
				if (parseInt(OrderInfo.subHandleInfo.identityNum.substr(16, 1)) % 2 == 1) { 
					contactGender = "1"; 
				} else { 
					contactGender = "2"; 
				}
			}
			busiOrder.data.boPartyContactInfo.push({
				contactAddress : OrderInfo.subHandleInfo.orderAttrAddr,//参与人的联系地址
		        contactGender  : contactGender,//参与人联系人的性别
		        contactName : OrderInfo.subHandleInfo.orderAttrName,//参与人的联系人名称
		        contactType : "10",//联系人类型
		        headFlag : "1",//是否首选联系人
		        mobilePhone : OrderInfo.subHandleInfo.orderAttrPhoneNbr,//参与人的移动电话号码
		        staffId : OrderInfo.staff.staffId,//员工ID
		        state : "ADD",//状态
		        statusCd : "100001"//订单状态
			});
		}
		if(OrderInfo.subHandleInfo.checkCustCertSwitch == "ON"){
			var boCustCheckLog = {
				checkMethod			: OrderInfo.subHandleInfo.checkMethod,
				custId 		        : OrderInfo.HandleCustInstId,
				objId		        : "",	
				checkDate		    : OrderInfo.subHandleInfo.checkDate,		
				checker		        : OrderInfo.subHandleInfo.checker,
				checkChannel		: OrderInfo.subHandleInfo.checkChannel,						
				certCheckResult		: OrderInfo.subHandleInfo.certCheckResult,
				errorMessage	    : OrderInfo.subHandleInfo.errorMessage,				
				staffId	            : OrderInfo.subHandleInfo.staffId		
			};
			busiOrder.data.boCustCheckLogs.push(boCustCheckLog);
			var realNameChech = {
					partyProfileCatgCd: CONST.BUSI_ORDER_ATTR.REAL_NAME_CHECK,
					profileValue: "1",
		            state: "ADD"
			};
			busiOrder.data.boCustProfiles.push(realNameChech);
		}
		busiOrders.push(busiOrder);
	};	
	
	//使用人
	var _createCustInfo = function(busiOrders) {
		for(var i=0;i<OrderInfo.subUserInfos.length;i++){
			var subUserInfo = OrderInfo.subUserInfos[i];
			if(subUserInfo.isOldCust == "N"){
				var busiOrder = {
						areaId	: OrderInfo.getAreaId(),//受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							instId		: subUserInfo.instId,
							accessNumber: OrderInfo.getAccessNumber(subUserInfo.prodId)
						},  
						boActionType : {
							actionClassCd	: CONST.ACTION_CLASS_CD.CUST_ACTION,
							boActionTypeCd	: CONST.BO_ACTION_TYPE.CUST_CREATE
						}, 
						data : {
							boCustInfos 		: [],
							boCustIdentities	: [],
							boPartyContactInfo	: [],
							boCustCheckLogs     : [],
							boCustProfiles      : []
						}
					};
					//经办人信息节点
					busiOrder.data.boCustInfos.push({
						name			: subUserInfo.orderAttrName,//客户名称
						state			: "ADD",//状态
						areaId			: OrderInfo.getAreaId(),
						telNumber 		: subUserInfo.orderAttrPhoneNbr,//联系电话
						addressStr		: subUserInfo.orderAttrAddr,//客户地址
						partyTypeCd		: 1,//客户类型
						defaultIdType	: subUserInfo.orderIdentidiesTypeCd,//证件类型
						mailAddressStr	: subUserInfo.orderAttrAddr,//通信地址
						businessPassword: ""//客户密码
					});
					//客户证件节点
					busiOrder.data.boCustIdentities.push({
						state			: "ADD",//状态
						isDefault		: "Y",//是否首选
						identityNum		: subUserInfo.identityNum,//证件号码
						identidiesPic	: subUserInfo.identityPic,//二进制证件照片
						identidiesTypeCd: subUserInfo.orderIdentidiesTypeCd//证件类型
					});
					//客户联系人节点
					if(subUserInfo.orderAttrPhoneNbr!=null && subUserInfo.orderAttrPhoneNbr!=""){
						var contactGender = "1";
						if(subUserInfo.orderIdentidiesTypeCd == "1"){
							if (parseInt(subUserInfo.identityNum.substr(16, 1)) % 2 == 1) { 
								contactGender = "1"; 
							} else { 
								contactGender = "2"; 
							}
						}
						busiOrder.data.boPartyContactInfo.push({
							contactAddress : subUserInfo.orderAttrAddr,//参与人的联系地址
					        contactGender  : contactGender,//参与人联系人的性别
					        contactName : subUserInfo.orderAttrName,//参与人的联系人名称
					        contactType : "10",//联系人类型
					        headFlag : "1",//是否首选联系人
					        mobilePhone : subUserInfo.orderAttrPhoneNbr,//参与人的移动电话号码
					        staffId : OrderInfo.staff.staffId,//员工ID
					        state : "ADD",//状态
					        statusCd : "100001"//订单状态
						});
					}
					if(subUserInfo.checkCustCertSwitch == "ON"){
						var boCustCheckLog = {
							checkMethod			: subUserInfo.checkMethod,
							custId 		        : subUserInfo.instId,
							objId		        : "",	
							checkDate		    : subUserInfo.checkDate,		
							checker		        : subUserInfo.checker,
							checkChannel		: subUserInfo.checkChannel,						
							certCheckResult		: subUserInfo.certCheckResult,
							errorMessage	    : subUserInfo.errorMessage,				
							staffId	            : subUserInfo.staffId		
						};
						busiOrder.data.boCustCheckLogs.push(boCustCheckLog);
						var realNameChech = {
								partyProfileCatgCd: CONST.BUSI_ORDER_ATTR.REAL_NAME_CHECK,
								profileValue: "1",
					            state: "ADD"
						};
						busiOrder.data.boCustProfiles.push(realNameChech);
					}
					busiOrders.push(busiOrder);
			    }
			}
	};
	/**
     * 一证五号订单数据校验
     * @param custInfo
     * @returns {boolean}
     * @private
     */
    var _oneCertFiveCheckData = function (inParam) {
        if( OrderInfo.needCheckFlag == "N" && OrderInfo.actionFlag =="1"){
            return true;
        }
    	OrderInfo.oneCardPhone = "";
        var oneCertFiveNum = false;//一证五号校验结果
        if (ec.util.isObj(OrderInfo.boProdAns) && OrderInfo.boProdAns.length > 0) {
        	var oneCertFiveNO = 0;
            $.each(OrderInfo.boProdAns, function () {
                var parent = this;
                var isCheck = true;//是否进行一证五号校验，选择了使用人的号码之前校验过，这里跳过
                if (ec.util.isObj(OrderInfo.choosedUserInfos) && OrderInfo.choosedUserInfos.length > 0) {//有选择使用人的情况
                    $.each(OrderInfo.choosedUserInfos, function () {
                        if (this.prodId == parent.prodId) {
                            isCheck = false;
                        }
                    });
                }
                if (ec.util.isObj(OrderInfo.subUserInfos) && OrderInfo.subUserInfos.length > 0) {//有选择使用人的情况
                    $.each(OrderInfo.subUserInfos, function () {
                        if (this.prodId == parent.prodId) {
                            isCheck = false;
                        }
                    });
                }
                if (isCheck) {
                	oneCertFiveNO ++ ;
                	OrderInfo.oneCardPhone = "号码："+this.accessNumber+"，"+OrderInfo.oneCardPhone;
                } else {
                    oneCertFiveNum = true;//不做一证五号校验的默认返回true
                }
            });
            var oneCardFive ={
            		certNum:inParam.certNum,
            		oneCertFiveNO:oneCertFiveNO
			};
            OrderInfo.oneCardFiveNum.push(oneCardFive);
            oneCertFiveNum = order.cust.preCheckCertNumberRel(this.prodId, inParam);
        } else {
            oneCertFiveNum = true;//不做一证五号校验的默认返回true
        }
        return oneCertFiveNum;
    };
    /**
     * 获取使用人信息，政企客户取使用人信息
     * @param ca
     * @private
     */
    var _setUserInfo = function (ca) {
        if (CacheData.isGov(OrderInfo.cust.identityCd)) {
            ca.certType = OrderInfo.cust.userIdentityCd;
            ca.certNum = OrderInfo.cust.userIdentityNum;
            ca.certNumEnc = OrderInfo.cust.userCertNumEnc;
            ca.custName = OrderInfo.cust.userName;
            ca.custNameEnc = OrderInfo.cust.userNameEnc;
            ca.certAddress = OrderInfo.cust.userCertAddress;
            ca.certAddressEnc = OrderInfo.cust.userCertAddressEnc;
        } else {
            ca.certType = OrderInfo.cust.identityCd;
            ca.certNum = OrderInfo.cust.idCardNumber;
            ca.custName = OrderInfo.cust.partyName;
            ca.certAddress = OrderInfo.cust.addressStr;
            ca.certNumEnc = OrderInfo.cust.certNum;
            ca.custNameEnc = OrderInfo.cust.CN;
            ca.certAddressEnc = OrderInfo.cust.address;
        }
    };
    
    var _oldprodAcctChange= function (busiOrders) {
    	//#1466473 纳入老用户判断主卡副卡账户是否一致，不一致提示修改副卡账户
		if(ec.util.isArray(OrderInfo.oldprodInstInfos)){
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				var oldprodInst = OrderInfo.oldprodInstInfos[i];
				if(!ec.util.isArray(oldprodInst.prodAcctInfos)||!ec.util.isObj(oldprodInst.prodAcctInfos[0].acctId)){
					$.alert("提示", "号码["+oldprodInst.accNbr+"]未查到帐号信息，无法完成副卡纳入！");
					return false;
				}
				var oldprodAcct = oldprodInst.prodAcctInfos[0];
				var mainAcctid = $("#acctSelect option:selected").val();
				var mainAcctCd = $("#acctSelect option:selected").attr("acctCd");
				if(mainAcctid<0){
					mainAcctCd = mainAcctid;
				}

				if(oldprodAcct.acctId!=mainAcctid){
					//账户节点变更节点
					var busiOrder={
						areaId : OrderInfo.getAreaId(),  //受理地区ID		
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							accessNumber: oldprodInst.accNbr,
							instId : oldprodInst.prodInstId, //业务对象实例ID
							objId :oldprodInst.productId,
							isComp : "N",
							offerTypeCd : "1"
						},  
						boActionType : {
							actionClassCd: CONST.ACTION_CLASS_CD.PROD_ACTION,
		                    boActionTypeCd: CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT
						}, 
						data:{}
					};
					//创建账户变更节点
					busiOrder.data.boAccountRelas=[];
					var _boAccountRelasOld={
	                        acctCd: oldprodAcct.acctCd,
	                        acctId: oldprodAcct.acctId,
							acctRelaTypeCd : "1",
							chargeItemCd : oldprodAcct.chargeItemCd,
							percent : oldprodAcct.percent,
							priority : ec.util.isObj(oldprodAcct.priority)?oldprodAcct.priority:"1",//没返回协商取1，不然后台报错
							prodAcctId : oldprodAcct.prodAcctId,
							extProdAcctId : ec.util.isObj(oldprodAcct.extProdAcctId)?oldprodAcct.extProdAcctId:"",
							state : "DEL"
					};
					var _boAccountRelasNew={
						 	acctCd: mainAcctCd,
						 	acctId: mainAcctid,
							acctRelaTypeCd : "1",			//协商写死
							chargeItemCd : 1,               //账目项标识，暂固定为1，表示支付所有账目项
							percent : "100",                //支付比重，该账目项占该产品的价格比重，与上一个属性相匹配，暂固定为100
							priority : "1",                 //支付优先级，暂固定为1，表示最高优先级
							prodAcctId : "-1",              //标识产品与帐户的支付匹配关系，新选的帐户和该产品无匹配关系，默认 -1
							state : "ADD"
					};
					busiOrder.data.boAccountRelas.push(_boAccountRelasOld);
					busiOrder.data.boAccountRelas.push(_boAccountRelasNew);
					busiOrders.push(busiOrder);
				}
			}
		}
		return true;
    };
    
	return {
		builder 				: _builder,
		createAttOffer  		: _createAttOffer,
		createServ				: _createServ,
		delOrder 				: _delOrder,
		delAndNew				: _delAndNew,
		getOrderInfo 			: _getOrderInfo,
		getToken				: _getToken,
		getTokenSynchronize 	: _getTokenSynchronize,
		initFillPage			: _initFillPage,
		initOrderData			: _initOrderData,
		orderBack				: _orderBack,
		step					: _step,
		showStep				: _showStep,
		submitOrder 			: _submitOrder,
		checkAcctInfo  			: _checkAcctInfo,
		showTemplateOrderName   : _showTemplateOrderName,
		sortOfferSpec			: _sortOfferSpec,
		updateResState			: _updateResState,
		delOrderBegin			: _delOrderBegin,
		delOrderSilent			: _delOrderSilent,
		delOrderFin				: _delOrderFin,
		showActivation			: _showActivation,
		checkOrder				: _checkOrder,
		orderPrepare			: _orderPrepare,
		getCheckOperatSpec		: _getCheckOperatSpec,
		createProd				: _createProd
	};
})();
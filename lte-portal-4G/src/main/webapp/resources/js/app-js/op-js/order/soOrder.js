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
		OrderInfo.order.step=2;
		if(OrderInfo.actionFlag==1){
			try{
				common.callTitle(3);//3 头部为 新装 字眼头部
			}catch(e){
			}
		}
//		SoOrder.step(1); //显示填单界面
		_getToken(); //获取页面步骤
	}; 
	
	//初始化订单数据
	var _initOrderData = function(){
		OrderInfo.resetSeq(); //重置序列
		OrderInfo.resetData(); //重置 数据
		OrderInfo.orderResult = {}; //清空购物车
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.actionFlag = OrderInfo.actionFlag;
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.getAreaId();
	};
	
	//提交订单节点
	var _submitOrder = function(data) {
		//#1466473  纳入老用户判断主卡副卡账户是否一致，不一致提示修改副卡账户
		if(ec.util.isArray(OrderInfo.oldprodInstInfos)){
			var acctIdFlag = false;//主副卡是否一致标识
			var acctNumberList = [];//副卡是否一致标识
			for(var a=0;a<OrderInfo.oldprodAcctInfos.length;a++){
				var oldacctId = OrderInfo.oldprodAcctInfos[a].prodAcctInfos[0].acctId;
				var mainacctid = OrderInfo.acctId;
				if(oldacctId!=mainacctid){
					acctIdFlag = true;
					acctNumberList.push(OrderInfo.oldprodAcctInfos[a].prodAcctInfos[0].accessNumber);
				}
			}
			if(acctIdFlag){
				var tips = "您当前纳入加装的号码[";
				for(var a=0;a<acctNumberList.length;a++){
					if(a==0){
						tips += acctNumberList[a];
					}else{
						tips += ","+acctNumberList[a];
					}
				}
				tips += "]，账户与主卡账户不一致，纳入后将统一使用主卡账户，是否确认修改？";
				
				$.confirm("确认",tips,{ 
					yesdo:function(){
						_submitOrder2(data);
					},
					no:function(){
					}
				});
			}else{
				_submitOrder2(data);
			}
		}else{
			_submitOrder2(data);
		}
	};
	
	var _submitOrder2 = function(data) {
		if(_getOrderInfo(data)){
			//订单提交
			OrderInfo.oneCardFiveNum = [];
			var url = contextPath+"/order/orderSubmit";
			if(OrderInfo.order.token!=""){
				url = contextPath+"/token/app/order/orderSubmit?token="+OrderInfo.order.token;
			}
			
			$.callServiceAsJson(url,JSON.stringify(OrderInfo.orderData), {
				"before":function(){
					$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
				},"done" : function(response){
					$.unecOverlay();
					_getToken();
					if (response.code == 0) {
						var data = response.data;
						if(OrderInfo.actionFlag==8 || OrderInfo.actionFlag==4){
							if(data.resultCode==0){
								if(OrderInfo.actionFlag==8){
									$.alert("信息提示","客户创建成功");
									common.saveCust();
								}else{
									$.alert("信息提示","客户修改成功");
								}
								//cust.clearCustForm();
							}else{
								$.alert("信息提示",data.resultMsg);
							}
						}else{
							if(data.result.ruleInfos!=undefined && data.result.ruleInfos.length > 0){
								var ruleDesc = "";
								$.each(data.result.ruleInfos, function(){
									ruleDesc += this.ruleDesc+"<br/>";
								});
								$.alert("提示",ruleDesc);
								OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
								OrderInfo.resetSeq(); //重置序列
							}else if(data.checkRule!=undefined){
								var provCheckResult = order.calcharge.tochargeSubmit(response.data);
								if(provCheckResult.code==0){
									
									///token/app/order/
									var returnData = _gotosubmitOrder(response.data);
									_orderConfirm(returnData);
								}else{//下省校验失败也将转至订单确认页面，展示错误信息，只提供返回按钮
									response.data.provCheckError = "Y";
									if(provCheckResult.data.resultMsg!=undefined && $.trim(provCheckResult.data.resultMsg)!=""){
										response.data.provCheckErrorMsg = provCheckResult.data.resultMsg;
									} else if(provCheckResult.data.errMsg!=undefined && $.trim(provCheckResult.data.errMsg)!=""){
										response.data.provCheckErrorMsg = provCheckResult.data.errMsg;
										if(provCheckResult.data.errCode){
											response.data.provCheckErrorMsg = "【错误编码："+provCheckResult.data.errCode+"】" + response.data.provCheckErrorMsg;
										}
										if(provCheckResult.data.errData){
											response.data.provCheckErrorData=provCheckResult.data.errData;
											try{
												var errData=$.parseJSON(provCheckResult.data.errData);
												if(errData.resultMsg){
													response.data.provCheckErrorMsg+=","+errData.resultMsg;
												}
											}catch(e){
												
											}
										}
										if(provCheckResult.data.paramMap){
											response.data.provCheckErrorMsg += "【入参："+provCheckResult.data.paramMap+"】";
										}
									} else{
										response.data.provCheckErrorMsg = "未返回错误信息，可能是下省请求超时，请返回填单页面并稍后重试订单提交。";
									}
									var returnData = _gotosubmitOrder(response.data);
									_orderConfirm(returnData);								
								}
							}else{
								var returnData = _gotosubmitOrder(response.data);
								_orderConfirm(returnData);
							}
						}
					}else{
						$.alertM(response.data);
//						_getToken();
						OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
						OrderInfo.resetSeq(); //重置序列
						//返回填单页面
						$("#order-content").show();
						$("#order-dealer").hide();
					}
				}
			});
//					var result = query.offer.orderSubmit(JSON.stringify(OrderInfo.orderData));
//					if(result){
//						_orderConfirm(result);
//					}else{
//						_getToken();
//						OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
//						OrderInfo.resetSeq(); //重置序列
//					}
		}	
	};
	
	var _gotosubmitOrder = function(orderdata){
			var url = contextPath+"/token/app/order/gotosubmitOrder";
			$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
			var response = $.callServiceAsHtml(url,JSON.stringify(orderdata));
			$.unecOverlay();
			return response.data;
	};
	
	//填充订单信息
	var _getOrderInfo = function(data){
		//一证五号校验
        if(!_oneCertFiveCheckData(cust.getCustInfo415())){
            return false;
        }
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
		
//		custOrderAttrs.push({
//			itemSpecId : "111111113",
//			value : OrderInfo.orderlonger
//		});	
		custOrderAttrs.push({
			itemSpecId : "30010024",
			value : OrderInfo.busitypeflag
		});
		custOrderAttrs.push({ //
			itemSpecId : "800000064",
			value :"App"
		});	
		custOrderAttrs.push({ //
			itemSpecId : "800000048",
			value :OrderInfo.recordId
		});	
//		custOrderAttrs.push({
//			itemSpecId : "30010050",
//			value : OrderInfo.custorderlonger
//		});	
		//添加订单属性，isale下省流水号
//		if(order.cust.fromProvFlag == "1"){
//		order.cust.provIsale = $.trim($("#orderProvAttrIsale").val());
//		if(ec.util.isObj(order.cust.provIsale)){
//			order.cust.fromProvFlag = "1";
//			custOrderAttrs.push({
//				itemSpecId : CONST.BUSI_ORDER_ATTR.PROV_ISALE,
//				value : order.cust.provIsale
//			});	
//		} else {
//			order.cust.fromProvFlag = "0";
//		}
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
			OrderInfo.orderData.orderList.orderListInfo.partyId= -1;
			OrderInfo.orderData.orderList.orderListInfo.soNbr = UUID.getDataId();
			/*custOrderAttrs.push({
				itemSpecId : "111111140",//3转4标志
				value : "C1"
			});*/
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
			_fillBusiOrder(busiOrders,data,"N"); //填充业务对象节点	
		}else if(OrderInfo.actionFlag==20){ //返销
			_delAndNew(busiOrders,data); 
		}else if(OrderInfo.actionFlag==21){ //销售品成员变更保留副卡订购新套餐
			_delViceCardAndNew(busiOrders,data);
		}else if(OrderInfo.actionFlag== 22 ){ //补换卡
			busiOrders = data;
		}else if(OrderInfo.actionFlag == 23){//异地补换卡
			busiOrders = data;
			//异地补换卡的订单地区为受理工号当前的受理地区而不是定位客户的受理地区
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
		if(!_oldprodAcctChange(busiOrders)) return false;
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
		//OrderInfo.orderData.orderList.orderListInfo.channelId = "1388753";  //受理渠道id
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
			$("#orderTbody").append('<li class="list-group-item" id="offerSpecName"> <h4 class="list-group-item-heading"> 套餐名称</h4><p class="list-group-item-text">'+OrderInfo.offerSpec.offerSpecName+'</p></li>');
			$("#tital").html("<span>订购</span>"+OrderInfo.offerSpec.offerSpecName);
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				$.each(this.prodInsts,function(){
					$("#orderTbody").append('<li class="list-group-item" id="offerSpecName"> <h4 class="list-group-item-heading"> '+this.offerRoleName+'</h4><p class="list-group-item-text">'+OrderInfo.getProdAn(this.prodInstId).accessNumber+'</p></li>');
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
			$("#order_prepare").hide();
			$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">终端名称：</div><div class="ui-block-b">'+OrderInfo.businessName+'</div></div>');
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
				$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">终端串码：</div><div class="ui-block-b">'+bo2Coupons[0].couponInstanceNumber+'</div></div>');
			} else if (OrderInfo.actionFlag==17) {
				for(var i=0; i<busiOrder.length; i++) {
					var boActionType = busiOrder[i].boActionType;
					if (boActionType.actionClassCd==CONST.ACTION_CLASS_CD.MKTRES_ACTION
							&& boActionType.boActionTypeCd==CONST.BO_ACTION_TYPE.RETURN_COUPON) {
						bo2Coupons = busiOrder[i].data.bo2Coupons;
					}
				}
				$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">终端串码：</div><div class="ui-block-b">'+bo2Coupons[0].couponInstanceNumber+'</div></div>');
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
				$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">旧终端串码：</div><div class="ui-block-b">'+oldCoupon.couponInstanceNumber+'</div></div>');
				$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">新终端串码：</div><div class="ui-block-b">'+newCoupon.couponInstanceNumber+'</div></div>');
			}
			var $span = $("<span>"+OrderInfo.actionTypeName+"</span>"+OrderInfo.businessName);
			$("#tital").append($span);
		}else{ //二次业务
			var prod = order.prodModify.choosedProdInfo;
			$("#orderTbody").append('<li class="list-group-item" id="offerSpecName"> <h4 class="list-group-item-heading"> 套餐名称</h4><p class="list-group-item-text">'+prod.prodOfferName+'</p></li>');
			$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading"> 手机号码</h4><p class="list-group-item-text">'+prod.accNbr+'</p></li>');	
			if(OrderInfo.actionFlag==2){ //套餐变更 
				OrderInfo.actionTypeName = "套餐变更";
				$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading">新套餐名称</h4><p class="list-group-item-text">'+OrderInfo.offerSpec.offerSpecName+'</p></li>');	
				$("#accNbrTr").hide();
				for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) { //遍历主销售品构成
					var offerMember = OrderInfo.offer.offerMemberInfos[i];
					if(offerMember.objType==CONST.OBJ_TYPE.PROD){
						$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading">'+offerMember.roleName+'号码</h4><p class="list-group-item-text">'+offerMember.accessNumber+'</p></li>');
					}
				}
				if(offerChange.newMemberFlag){
					$.each(OrderInfo.boProdAns,function(){
						$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading">纳入副卡号码</h4><p class="list-group-item-text">'+this.accessNumber+'</p></li>');
					});
				}
				if(offerChange.oldMemberFlag){
					for(var j=0;j<OrderInfo.oldoffer.length;j++){
						for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
							var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
							if(offerMember.objType==CONST.OBJ_TYPE.PROD){
								$("#orderTbody").append('<li class="list-group-item" id="accNbrTr"> <h4 class="list-group-item-heading">纳入副卡号码</h4><p class="list-group-item-text">'+offerMember.accessNumber+'</p></li>');
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
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除副卡号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
						}else {
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
						}
					}
				});
				OrderInfo.actionTypeName = "主副卡成员变更";
			}else if(OrderInfo.actionFlag==6){ //主副卡成员变更纳入副卡
				$("#accNbrTr").hide();
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');
					}
				});
				$.each(OrderInfo.boProdAns,function(){
					$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">纳入副卡号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div> ');	
				});
				OrderInfo.actionTypeName = "主副卡成员变更";
			}else if(OrderInfo.actionFlag==7){ //主副卡拆机保留副卡
				$("#accNbrTr").hide();
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						if(this.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div> ');	
						}else {
							var del="";
							var accessNumber=this.accessNumber;
							$.each(_viceParam,function(i,val){
								if(val.accessNumber==accessNumber&&val.del=="N"){
									del="N";
								}
							});
							if(del=="N"){
								$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">订购'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');
							}else{
								$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div> ');	
							}
						}
					}
				});
				OrderInfo.actionTypeName = CONST.getBoActionTypeName(OrderInfo.boActionTypeCd);
			}else if(OrderInfo.actionFlag==21){ //主副卡成员变更
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
								$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">订购'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');
							}else if(del=="Y"){
								$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
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
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+offerMember.roleName+'号码：</div><div class="ui-block-b">'+offerMember.accessNumber+'</div></div> ');	
						}else {
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">订购'+offerMember.roleName+'号码：</div><div class="ui-block-b">'+offerMember.accessNumber+'</div></div>');	
						}
					}
				}
				OrderInfo.actionTypeName = "返销";	
			}else if(OrderInfo.actionFlag==12){ //加入组合退出组合
				$("#accNbrTr").hide();
				for (var i = 0; i < OrderInfo.confirmList.length; i++) {
					var prod = OrderInfo.confirmList[i];
					for(var j = 0; j < prod.accNbr.length; j++){
						$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">'+prod.name+'：</div><div class="ui-block-b">'+prod.accNbr[j]+'</div></div>');
					}
				}
			}else if(OrderInfo.actionFlag==16){ //改号
				OrderInfo.actionTypeName = "改号";
				$.each(OrderInfo.boProdAns,function(){
					if(this.state=="ADD"){
						$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">新号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
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
							$("#orderTbody").append('<div class="ui-grid-a"><div class="ui-block-a">拆除'+this.roleName+'号码：</div><div class="ui-block-b">'+this.accessNumber+'</div></div>');	
					});
				}
				OrderInfo.actionTypeName = "拆机";
			}
			var $span = $("<span>订单确认</span>");
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
		if(ec.util.isObj($("#provCheckErrorMsg").attr("title"))){
			ruleFlag = false;
		}
		if(ruleFlag){
			if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){
				_showOrderOffer(); //显示订购的销售品
			}else if(OrderInfo.actionFlag==2){ //套餐变更 
				_showChangeAttach();
			}else if (OrderInfo.actionFlag==3){
				_showAttachOffer(); //显示订购的销售品
			}else if (OrderInfo.actionFlag==6){
				_showAddViceOffer(); //加装副卡显示订购的销售品
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
			//$("#orderedprod").hide();
			$("#order_prepare").hide();
			//$("#order_tab_panel_content").hide();
			$("#order_confirm").hide();
			$("#order_fill").show();
		}else if(k==2){ //订单确认填写页面
			$("#order-content").hide();
			$("#order-dealer").hide();
			$("#order-confirm").html(data).show();
			OrderInfo.order.step=3;
		}
		/*for (var i = 1; i < 4; i++) {
			$("#step"+i).hide();
		}
		$("#step"+k).show();*/
	};
	
	// 新装，显示订购的销售品
	var _showOrderOffer = function(){
		var i=0;
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			$.each(this.prodInsts,function(){
				if(i==0){
					$("#orderTbody").after($('<table id="chooseTable_'+this.prodInstId+'" class="table table-bordered tablecenter"></table>'));
					i="chooseTable_"+this.prodInstId;
				}else{
					$("#"+i).after($('<table id="chooseTable_'+this.prodInstId+'" class="table table-bordered tablecenter"></table>'));
					i="chooseTable_"+this.prodInstId;
				}
				$("#chooseTable_"+this.prodInstId).append($('<thead><tr><th  style="width: 60%;">业务名称('+this.offerRoleName+')</th><th>业务动作</th></tr></thead>'));			
				_showAttOffer(this.prodInstId);
			});
		});
	};
	
	//显示加装副卡订购的销售品
	var _showAddViceOffer = function(){
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){
				$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.offerRoleName+')</th><th>业务动作</th></tr>'));
				$.each(this.prodInsts,function(){
					_showAttOffer(this.prodInstId);	
				});
			}
		});
	};
	
	//套餐变更销售附属
	var _showChangeAttach = function(){
		var i=0;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==CONST.OBJ_TYPE.PROD){
				if(i==0){
					$("#orderTbody").after($('<table id="chooseTable_'+this.objInstId+'" class="table table-bordered tablecenter"></table>'));
					i="chooseTable_"+this.objInstId;
				}else{
					$("#"+i).after($('<table id="chooseTable_'+this.objInstId+'" class="table table-bordered tablecenter"></table>'));
					i="chooseTable_"+this.objInstId;
				}
				$("#chooseTable_"+this.objInstId).append($('<thead><tr><th  style="width: 60%;">业务名称('+this.roleName+')</th><th>业务动作</th></tr></thead>'));			
				_showAttOffer(this.objInstId);
			}
		});
		var j=0;
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.memberRoleCd==401){
				$.each(this.prodInsts,function(){
					var instid = '"'+this.prodInstId+'"';
					if(instid.indexOf("-")!=-1){
						if(j==0){
//							$("#orderTbody").after($('<table id="chooseTable_'+this.prodInstId+'" class="table table-bordered tablecenter"></table>'));
							j="chooseTable_"+this.prodInstId;
						}else{
							$("#"+j).after($('<table id="chooseTable_'+this.prodInstId+'" class="table table-bordered tablecenter"></table>'));
							j="chooseTable_"+this.prodInstId;
						}
//						$("#chooseTable_"+this.prodInstId).append($('<thead><tr><th  style="width: 60%;">业务名称('+this.offerRoleName+')</th><th>业务动作</th></tr></thead>'));			
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
	
	//显示订购的销售品
	var _showAttachOffer = function(){
		var prod = order.prodModify.choosedProdInfo;
		if(prod==undefined || prod.prodInstId ==undefined){
			return true;
		}
		$("#orderTbody").after($('<table id="chooseTable_'+prod.prodInstId+'" class="table table-bordered tablecenter"></table>'));
		$("#chooseTable_"+prod.prodInstId).append($('<thead><tr><th  style="width: 60%;">业务名称</th><th>业务动作</th></tr></thead>'));
		_showAttOffer(prod.prodInstId);
	};
	
	//显示的可选包/功能产品
	var _showAttOffer = function(prodId){
		var offerSpecList = CacheData.getOfferSpecList(prodId);
		var offerList = CacheData.getOfferList(prodId);
		var servSpecList = CacheData.getServSpecList(prodId);
		var servList = CacheData.getServList(prodId);
		var appList = CacheData.getOpenAppList(prodId);
		$("#chooseTable_"+prodId).append("<tbody>");
		//可选包显示
		if(offerSpecList!=undefined && offerSpecList.length>0){  
			$.each(offerSpecList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel != "Y" && this.isdel != "C"){  //订购的附属销售品
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_BUY+'</td></tr>'));
				}
			});
		}
		if(offerList!=undefined && offerList.length>0){
			$.each(offerList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel == "Y"){  //退订的附属销售品
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_DEL+'</td></tr>'));
				}else if(this.update == "Y"){
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_UPDATE+'</td></tr>'));
				}
			});
		}
		//功能产品显示
		if(servSpecList!=undefined && servSpecList.length>0){
			$.each(servSpecList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel != "Y"  && this.isdel != "C"){  //订购的附属销售品
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_OPEN+'</td></tr>'));
				}
			});
		}
		if(servList!=undefined && servList.length>0){
			$.each(servList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel == "Y"){  //退订的附属销售品
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_CLOSE+'</td></tr>'));
				}else if(this.update == "Y"){
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_UPDATE+'</td></tr>'));
				}
			});
		}
		if(appList!=undefined && appList.length>0){
			$.each(appList,function(){ //遍历当前产品下面的增值业务
				if(this.dfQty == 1){  //开通增值业务
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.servSpecName+'</td><td>'+CONST.EVENT.PROD_OPEN+'</td></tr>'));
				}
			});
		}
		
		//动作链返回显示
		if(OrderInfo.orderResult.autoBoInfos!=undefined){
			$.each(OrderInfo.orderResult.autoBoInfos,function(){
				if(this.instAccessNumber==OrderInfo.getAccessNumber(prodId)){
					$("#chooseTable_"+prodId).append($('<tr><td>'+this.specName+'</td><td>'+this.boActionTypeName+'</td></tr>'));
				}
			});
		}
		$("#chooseTable_"+prodId).append("</tbody>");
	};
	
	//订单返回
	var _orderBack = function(){
		//不再绑定异常撤单
		SoOrder.delOrderFin();
		
		$("#order-content").show();
		//$("#main_conetent").show();

		$("#order-confirm").hide();
		//SoOrder.showStep(1);
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
		OrderInfo.resetSeq(); //重置序列
		SoOrder.delOrder();
		_getToken(); //获取页面步骤
		if(CONST.getAppDesc()!=0){
			if($("#a-cust-modify")[0]){
				$("#a-cust-modify").show();
			}
		}
	};
	
	//作废购物车
	var _delOrder = function(){
		var olId = OrderInfo.orderResult.olId;
		if(olId!=0&&olId!=undefined){  //作废购物车
			var param = {
				olId : olId,
				areaId : OrderInfo.getAreaId()
			};
			$.callServiceAsJsonGet(contextPath+"/app/order/delOrder",param,{
				"done" : function(response){
					if (response.code==0) {
						if(response.data.resultCode==0){
							$.alert("提示","购物车作废成功！");
							OrderInfo.order.step=2;
						}
					}else if (response.code==-2){
						$.alertM(response.data.errData);
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
			var result = $.callServiceAsJsonGet(contextPath+"/order/delOrder",param);
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
			var busiOrder2 = {
				areaId : prodInfo.areaId,  //受理地区ID
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
			var prod = {
						prodId : newData[i].objInstId, 
						isComp : "Y",
						boActionTypeCd : CONST.BO_ACTION_TYPE.REMOVE_PROD
					};
			busiOrders.push(OrderInfo.getProdBusiOrder(prod));
			}
			
			
		}
	};
	
	//填充业务对象节点
	var _fillBusiOrder = function(busiOrders,data,isComp) {	
		var prod = order.prodModify.choosedProdInfo; //获取产品信息 
		var boActionTypeCd= OrderInfo.boActionTypeCd;
		var objId= prod.productId;
		var instId=prod.prodInstId;
		var classcd=OrderInfo.actionClassCd;
		if(boActionTypeCd==CONST.BO_ACTION_TYPE.ADDOREXIT_COMP){
			objId=prod.prodOfferId;
			instId=prod.prodOfferInstId;
			classcd=CONST.ACTION_CLASS_CD.OFFER_ACTION;
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
				offerTypeCd : "1"  //1主销售品
			},  
			boActionType : {
				actionClassCd : classcd,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
	};
	
	//创建订单数据
	var _createOrder = function(busiOrders) {
		//添加客户节点
		if(OrderInfo.cust.custId == -1){
			OrderInfo.createCust(busiOrders);	
		}
		//var acctId = -1; //先写死
		var acctId=-1;
		if(OrderInfo.acct!=undefined&&OrderInfo.acct.acctId!=undefined&&OrderInfo.acct.acctId!=null&&OrderInfo.acct.acctId!=""){//新装传帐户id
			acctId=OrderInfo.acct.acctId;
		}
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
		var response = $.callServiceAsHtmlGet(contextPath+"/common/getToken");
		OrderInfo.order.token = response.data;
	};
	
	//获取token的同步请求
	var _getTokenSynchronize = function() {
		var response = $.callServiceAsHtmlGet(contextPath+"/common/getToken");
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
		
		//遍历主销售品构成
		
		if(ec.util.isArray(OrderInfo.oldprodInstInfos)){
			//纳入老用户
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
			if(OrderInfo.boProd2Tds.length>0){
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
				objName : OrderInfo.offerSpec.offerSpecName,//业务名称
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
		var $tr = $("li[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role:$(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
					value : $(this).find("input").attr("staffid"),
					//APP发展人渠道[W]
					channelNbr:$(this).find("select[name='dealerChannel_"+OrderInfo.offerSpec.offerSpecId+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				
				var dealer_name = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
					role:$(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
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
		
		//封装客户与产品之间的关系信息
		busiOrder.data.boCusts.push({
			partyId	: OrderInfo.cust.custId, //客户ID
			partyProductRelaRoleCd : "0", //客户与产品之间的关系（担保关系）
			state : "ADD" //动作
		});
		
		//封装产品密码
		var pwd=$("#pwd_"+prodId).val();
		if(pwd=="******"||OrderInfo.actionFlag==1){
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
		
		//发展人
		var $tr;
		var objInstId_dealer;
		if(OrderInfo.actionFlag==6){ //加装发展人根据产品
			objInstId_dealer = prodId;
		}else{
			objInstId_dealer = OrderInfo.offerSpec.offerSpecId;
		}
		
		//获取所有的发展人数据[W]
		$tr = $("#dealerTbody li[name='tr_"+objInstId_dealer+"']");
		
		if($tr!=undefined){
			 //遍历产品有几个发展人
			$tr.each(function(){  
				//编码
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select[name ='dealerType_"+objInstId_dealer+"']").val(),
					value : $(this).find("input").attr("staffid"),
					channelNbr : $(this).find("select[name ='dealerChannel_"+objInstId_dealer+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				
				//名称
				var dealer_name = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
					role : $(this).find("select[name ='dealerType_"+objInstId_dealer+"']").val(),
					value : $(this).find("input").attr("value") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer_name);
			});
		}
		
		var acctId=-1;
		if(OrderInfo.acct!=undefined&&OrderInfo.acct.acctId!=undefined&&OrderInfo.acct.acctId!=null&&OrderInfo.acct.acctId!=""){//新装传帐户id
			acctId=OrderInfo.acct.acctId;
		}
		var acctCd = -1;
		if(acctId==undefined){
			acctId = -1;
			acctCd = -1;
		}else if(acctId<0 ){ //新增
			acctCd = acctId;
		}else{
			acctCd = OrderInfo.acct.acctcd;
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
            	 var ca = $.extend(true, {}, OrderInfo.boCertiAccNbrRel);
                 ca.accNbr = this.accessNumber;
                 ca.state = this.state;
                 ca.partyId = OrderInfo.cust.custId;
                 _setUserInfo(ca);
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
							if(accNbr==undefined || accNbr == ""){
								$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
								return false;
							} 
							if(OrderInfo.getProdTd(prodInst.prodInstId)==""){
								$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】UIM卡不能为空！");
								$("#uim_txt_"+prodInst.prodInstId).css("border-color","red");
								return false;
							}
						}
					}else{
						var accNbr = OrderInfo.getProdAn(prodInst.prodInstId).accessNumber;
						
//						var password = $("#pwd_"+prodInst.prodInstId).val();
//						if(password!="******"){
//							if(!order.main.passwordCheckVal(password, accNbr)){
//								return false ;
//							}
//						}
						if(accNbr==undefined || accNbr == ""){
							$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
							return false;
						} 
						if(OrderInfo.getProdTd(prodInst.prodInstId)==""){
							if(prodInst.objId!=CONST.PROD_SPEC.PROD_CLOUD_OFFER) {
								$.alert("信息提示", "【接入产品(" + offerRole.offerRoleName + ")】UIM卡不能为空！");
								$("#uim_txt_" + prodInst.prodInstId).css("border-color", "red");
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
					
					//校验必填的产品属性
					var prodAttrFlag = true;
					var checkName = null;
					var prodAttrErrorFlag = false;//产品属性格式错误
					var prodAttrErrorCheckName = null;
					$(OrderInfo.prodAttrs).each(function(){
						var isOptional = this.isOptional;
						var id = this.id;
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
							if(!val.match(/^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\\d{8}$/)){
								 prodAttrErrorFlag = true;
								 prodAttrErrorCheckName = "管理员手机号码格式输入错误，无法提交";
							 }
						}
						if(isOptional == "N" && id){
							var val=$.trim($("#"+id).val());
							if(val == "" || val == undefined){
								checkName = this.name;
								prodAttrFlag = false;
							}
						}
					});
					if(prodAttrErrorFlag){
						$.alert("信息提示",prodAttrErrorCheckName);
						return false;
					}
					if(!prodAttrFlag){
						$.alert("信息提示","没有配置产品属性("+checkName+")，无法提交");
						return false;
					}
					
//					if(!order.main.templateTypeCheck()){
//						return false;
//					}
				}
			   }
			}
//			var acctId = $("#acctSelect").val();
//			if(acctId==undefined || $.trim(acctId)==""){
//				$.alert("提示","请新建或者查询选择一个可用帐户");
//				return false;
//			}
//			if(acctId<0){
//				//帐户信息填写校验
//				if(!_checkAcctInfo()){
//					return false;
//				}
//			}
		}
		
		//销售品更功能产品参数校验
		if(OrderInfo.actionFlag == 1||OrderInfo.actionFlag == 2||OrderInfo.actionFlag == 3
				|| OrderInfo.actionFlag == 6||OrderInfo.actionFlag == 14){
			//附属销售参数设置校验
			for ( var i = 0; i < AttachOffer.openList.length; i++) {
				var specList = AttachOffer.openList[i].specList;
				var roleName = OrderInfo.getOfferRoleName(AttachOffer.openList[i].prodId);
				for (var j = 0; j < specList.length; j++) {
					var spec = specList[j];
					if(spec.isdel!="Y" && spec.isdel!="C"){
						if(spec.ifParams){  //销售参数节点
							if(spec.isset !="Y"){
//								$.alert("提示",roleName+" "+spec.offerSpecName+"：参数未设置");
//								return false ; 
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
//								$.alert("提示",roleName+" "+spec.servSpecName+"：参数未设置");
//								return false ; 
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
							var flag = true;
							$.each(OrderInfo.attach2Coupons,function(){
								if(spec.offerSpecId == this.attachSepcId && prodId==this.prodId){
									flag = false;
									return false;
								}	
							});
							if(flag){
								$.alert("提示",roleName+" "+spec.offerSpecName+"：终端信息未填写");
								return false ; 
							}
						}
					}
				}
			}
		}
		
		//套餐变更,可选包变更，补换卡校验
		if(CONST.getAppDesc()==0){
			if(OrderInfo.actionFlag == 2 ){ //套餐变更补换卡校验
				for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
					var member = OrderInfo.offer.offerMemberInfos[i];
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
				var oldMemberUimFlag = true;
				if(offerChange.oldMemberFlag){
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
			}else if(OrderInfo.actionFlag == 3){ //可选包变更补换卡校验
				if(AttachOffer.isChangeUim()){
					if(OrderInfo.boProd2Tds.length==0){
						$.alert("提示","UIM卡不能为空！");
						return false ; 
					}
				}
			}
		}
		
		//补换卡校验
		if(OrderInfo.actionFlag == 22 || OrderInfo.actionFlag == 23){
			if(OrderInfo.boProd2OldTds.length==0){
				$.alert("提示","原UIM卡信息为空！");
				return false ; 
			}
			if(OrderInfo.boProd2Tds.length==0){
				$.alert("提示","UIM卡不能为空！");
				return false ; 
			}
		}
		
		//开通4G功能产品时，需要校验UIM，终端是否是4G
		if(CONST.getAppDesc()==0){
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
				var termTypeFlag="";//终端类型
				
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
											termTypeFlag=this.termTypeFlag;
										}
										return false;
									}	
								});
							}
						}
					}
				}
				
				var roleName = OrderInfo.getOfferRoleName(prodId);
				if(isTerminal && termTypeFlag==""){
					$.alert("信息提示",roleName+"中,营销资源未返回终端机型，无法判断是3G终端还是4G终端!");
					return false;
				}
				
				if(flag){ //该产品已经开通4G功能产品，需要做4G卡终端校验
					if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14){ //新装
						var uim = OrderInfo.getProdUim(prodId);
						if(uim.cardTypeFlag=="2"){ //3g卡
							$.alert("信息提示",roleName+"中UIM卡是3G卡，无法提交");
							return false;
						}
						if(isTerminal && termTypeFlag=="2"){
							$.alert("信息提示",roleName+"中终端是3G机型，无法提交");
							return false;
						}
					}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3 ){
						var oldUim = OrderInfo.getProdOldUim(prodId);
						if(oldUim.is4GCard!="Y"){//旧卡不是4G卡 就判断新卡是否是4G卡
							var uim = OrderInfo.getProdUim(prodId);
							if(uim.cardTypeFlag=="2"){
								$.alert("信息提示",roleName+"中UIM卡是3G卡，无法提交");
								return false;
							}
						}
						if(isTerminal && termTypeFlag=="2"){
							$.alert("信息提示",roleName+"中终端是3G机型，无法提交");
							return false;
						}
					}
				}else{//没有开通4G功能产品 就判断UIM卡和终端的类型要一致，4G终端匹配4GUIM卡 3G终端匹配3GUIM卡
					if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14){ //新装
						if(isTerminal){
							var uim = OrderInfo.getProdUim(prodId);
							if(uim.cardTypeFlag!=termTypeFlag){ //终端和卡不匹配
								var uimtype=uim.cardTypeFlag=="1"?"4G卡":"3G卡";
								var termtype=termTypeFlag=="1"?"4G机型":"3G机型";
								$.alert("信息提示",roleName+"中UIM卡是"+uimtype+" 终端是"+termtype+"，无法提交");
								return false;
							}
						}
					}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3 ){
						if(isTerminal){
							var currentUimCoupon = OrderInfo.getProdUim(prodId); //当前uim卡物品信息，做套餐变更或可选包变更时可能带出补换卡业务，提交时使用新的uim检验终端
							if(ec.util.isObj(currentUimCoupon) && ec.util.isObj(currentUimCoupon.cardTypeFlag)){ //补换卡
								if(currentUimCoupon.cardTypeFlag=="2" && termTypeFlag=="1"){ 
									$.alert("信息提示",roleName+"中UIM卡是3G卡 终端是4G机型，无法提交");
									return false;
								}
								if(currentUimCoupon.cardTypeFlag=="1" && termTypeFlag=="2"){ 
									$.alert("信息提示",roleName+"中UIM卡是4G卡 终端是3G机型，无法提交");
									return false;
								}
							} else {  //未做补换卡
								var oldUim = OrderInfo.getProdOldUim(prodId);
								if(ec.util.isObj(oldUim.is4GCard)){
									if(oldUim.is4GCard!="Y"){//旧卡不是4G卡 
										if(termTypeFlag=="1"){
											$.alert("信息提示",roleName+"中UIM卡是3G卡 终端是4G机型，无法提交");
											return false; 
										}
									}else{
										if(termTypeFlag=="2"){
											$.alert("信息提示",roleName+"中UIM卡是4G卡 终端是3G机型，无法提交");
											return false;
										}
									}
								}
							}
							
						}
					}
				}
			}
		}
		
		return true; 
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
	
	//弹出确定框
	var _showAlertDialog=function(title,content){
		$("#modal-title").html(title);
		$("#modal-content").html(content);
		$("#alert-modal").modal('show');
	};
	/**
     * 一证五号订单数据校验
     * @param custInfo
     * @returns {boolean}
     * @private
     */
    var _oneCertFiveCheckData = function (inParam) {
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
                if (isCheck) {
                	oneCertFiveNO ++ ;
                } else {
                    oneCertFiveNum = true;//不做一证五号校验的默认返回true
                }
            });
            var oneCardFive ={
            		certNum:inParam.certNum,
            		oneCertFiveNO:oneCertFiveNO
			};
            OrderInfo.oneCardFiveNum.push(oneCardFive);
            if (cust.preCheckCertNumberRel(this.prodId, inParam)) {
                oneCertFiveNum = true;
            }
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
            ca.certType = OrderInfo.custBak.identityCd;
            ca.certNum = OrderInfo.custBak.idCardNumber;
            ca.custName = OrderInfo.custBak.partyName;
            ca.certAddress = OrderInfo.custBak.addressStr;
            ca.certNumEnc = OrderInfo.custBak.certNum;
            ca.custNameEnc = OrderInfo.custBak.CN;
            ca.certAddressEnc = OrderInfo.custBak.address;
	    }
    };
    
    var _oldprodAcctChange= function (busiOrders) {
    	//#1466473  纳入老用户判断主卡副卡账户是否一致，不一致提示修改副卡账户
		if(ec.util.isArray(OrderInfo.oldprodInstInfos)){
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				var oldprodInst = OrderInfo.oldprodInstInfos[i];
				if(!ec.util.isArray(oldprodInst.prodAcctInfos)||!ec.util.isObj(oldprodInst.prodAcctInfos[0].acctId)){
					$.alert("提示", "号码["+oldprodInst.accNbr+"]未查到帐号信息，无法完成副卡纳入！");
					return false;
				}
				var oldprodAcct = oldprodInst.prodAcctInfos[0];
				var mainAcctid = OrderInfo.acctId;
				var mainAcctCd = OrderInfo.acctCd;
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
							extProdAcctId : ec.util.isObj(oldprodAcct.prodAcctId)?oldprodAcct.prodAcctId:"",
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
		getTokenSynchronize     : _getTokenSynchronize,
		initFillPage			: _initFillPage,
		initOrderData			: _initOrderData,
		orderBack				: _orderBack,
		step					: _step,
		showStep				: _showStep,
		submitOrder 			: _submitOrder,
		showAlertDialog			: _showAlertDialog,
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
		checkData               :  _checkData,
		createProd				: _createProd
	};
})();
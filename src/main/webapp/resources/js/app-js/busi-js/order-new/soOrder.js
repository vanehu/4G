/**
 * 受理订单对象
 * 
 * @author wukf
 */
CommonUtils.regNamespace("SoOrder");

/** 受理订单对象*/
SoOrder = (function() { 
	var _usedNum = 0; 
	var _jbrMustAge=16;//经办人年龄(默认值)
	//初始化填单页面，为规则校验类型业务使用
	var _initFillPage = function(){
		SoOrder.initOrderData();
		if(OrderInfo.actionFlag==1){
			try{
				common.callTitle(3);//3 头部为 新装 字眼头部
			}catch(e){
			}
		}
		_getToken(); //获取token用于校验
	}; 
	
	//初始化订单数据
	var _initOrderData = function(){
		OrderInfo.resetSeq(); //重置序列
		OrderInfo.resetData(); //重置 数据
		OrderInfo.orderResult = {}; //清空购物车
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.actionFlag = OrderInfo.actionFlag;
		if(OrderInfo.actionFlag==201){//橙分期与可选包一致
			OrderInfo.orderData.orderList.orderListInfo.actionFlag=3;
		}
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.getAreaId();
	};
	
	//提交订单节点
	var _submitOrder = function(data) {
		if(MD5("tgjbr"+OrderInfo.staff.isHandleCustNeeded+"tgjbr")!=OrderInfo.staff.MD5_tgjbr.toUpperCase()){
			$.alert("提示","请勿篡改跳过经办人权限！");
			return;
		}
		var propertiesKey = "REAL_NAME_PHOTO_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
		var isFlag = offerChange.queryPortalProperties(propertiesKey);
		if(isFlag == "error"){
			return false;
		}
		OrderInfo.preBefore.idPicFlag = isFlag;
		SoOrder.usedNum = cust.usedNum;
		var ageJbrMustKey = "AgelimitNeedJbrFlag";
		var ageJbrMustFlag = offerChange.queryPortalProperties(ageJbrMustKey);//岁数限制经办人必填开关
		var custAge=OrderInfo.cust.age;//客户年龄
		if(ageJbrMustFlag=="ON"){
			var jbrMustAge=SoOrder.queryConstConfig("17");
			if(custAge>=jbrMustAge){//客户年龄小于指定年龄必填经办人,大于则可以不填
				ageJbrMustFlag="OFF";
			}	
		}
		if(OrderInfo.actionFlag==8){//新增客户
			OrderInfo.busitypeflag = 25;
		}else if(OrderInfo.actionFlag==13){//购裸机
			OrderInfo.busitypeflag = 24;
		}else if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==201){//可选包变更,橙分期
			OrderInfo.busitypeflag = 14;
			OrderInfo.order.step=3;
		}else if(OrderInfo.actionFlag==6 ||OrderInfo.actionFlag==21){//主副卡成员变更
			if(OrderInfo.staff.isHandleCustNeeded == "true" && (OrderInfo.preBefore.idPicFlag != "OFF" || ageJbrMustFlag == "ON" ) && !OrderInfo.virOlId){
				$.alert("提示","经办人信息必填，请前往经办人页面进行实名拍照！");
				return;
			}
			OrderInfo.busitypeflag = 3;
		}else if(OrderInfo.actionFlag==2){//套餐变更
			OrderInfo.busitypeflag = 2;
		}else if(OrderInfo.actionFlag==9){//客户返档
			if(OrderInfo.staff.isHandleCustNeeded == "true" && (OrderInfo.preBefore.idPicFlag != "OFF" || ageJbrMustFlag == "ON" ) && !OrderInfo.virOlId){
				$.alert("提示","经办人信息必填，请前往经办人页面进行实名拍照！");
				return;
			}
			OrderInfo.busitypeflag = 12;
		}else if(OrderInfo.actionFlag==22){//补换卡
			//补卡经办人必填  换卡经办人非必填
			if(OrderInfo.staff.isHandleCustNeeded == "true" && (OrderInfo.preBefore.idPicFlag != "OFF" || ageJbrMustFlag == "ON" ) && !OrderInfo.virOlId && OrderInfo.uimtypeflag == "22"){
				$.alert("提示","经办人信息必填，请前往经办人页面进行实名拍照！");
				return;
			}
			OrderInfo.busitypeflag = OrderInfo.uimtypeflag;
		}else if(OrderInfo.actionFlag==23){//异地补换卡
			//补卡经办人必填  换卡经办人非必填
			if(OrderInfo.staff.isHandleCustNeeded == "true" && (OrderInfo.preBefore.idPicFlag != "OFF"|| ageJbrMustFlag == "ON" ) && !OrderInfo.virOlId && OrderInfo.uimtypeflag == "22"){
				$.alert("提示","经办人信息必填，请前往经办人页面进行实名拍照！");
				return;
			}
			OrderInfo.busitypeflag = 19;
		}else if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==112){//新装
			if(OrderInfo.staff.isHandleCustNeeded == "true" && (OrderInfo.preBefore.idPicFlag != "OFF" || ageJbrMustFlag == "ON" ) && !OrderInfo.virOlId){
				$.alert("提示","经办人信息必填，请前往经办人页面进行实名拍照！");
				return;
			}
			OrderInfo.busitypeflag = 1;
		}
		if(_getOrderInfo(data)){
			
			//订单提交
			var url = contextPath+"/app/order/orderSubmit?token="+OrderInfo.order.token;
			if(OrderInfo.actionFlag==8 || OrderInfo.actionFlag==4){//实名制客户新建，和客户修改走一点提交接口
				url = contextPath+"/app/order/orderSubmitComplete?token="+OrderInfo.order.token;
			}
			$.callServiceAsJson(url,JSON.stringify(OrderInfo.orderData), {
				"before":function(){
					$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
				},"done" : function(response){
					$.unecOverlay();
					$('#newCustBtn').removeAttr("disabled")
					if (response.code == 0) {
						var data = response.data;
						if(OrderInfo.actionFlag==8 || OrderInfo.actionFlag==4){
							if(data.resultCode==0){
								var msg="";
								if(OrderInfo.actionFlag==8){
									msg="客户创建成功，购物车ID：" + response.data.olId;
								}else{
									msg="客户修改成功";
								}
								$("#btn-dialog-ok").removeAttr("data-dismiss");
								$('#alert-modal').modal({backdrop: 'static', keyboard: false});
								$("#btn-dialog-ok").off("click").on("click",function(){
									common.callCloseWebview();
								});
								$("#modal-title").html("信息提示");
								$("#modal-content").html(msg);
								$("#alert-modal").modal();
							}else{
								$.alert("信息提示",data.resultMsg);
							}
						}else{
							if(data.checkRule!=undefined && data.checkRule!="notCheckRule"){
								var provCheckResult = order.calcharge.tochargeSubmit(response.data);
								if(provCheckResult.code==0){
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
					}else if(response.code == 1002){
						$.alert("信息提示",response.data);
						if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==6){//新装与主副卡成员变更需要重置翼支付订购状态
							order.main.restoreYzfInitialState();
						}
					}else{
						$.alertM(response.data);
						if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==6){//新装与主副卡成员变更需要重置翼支付订购状态
							order.main.restoreYzfInitialState();
						}
//						_getToken();
						OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
						OrderInfo.resetSeq(); //重置序列
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
			var url = contextPath+"/app/order/gotosubmitOrder";
			$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
			orderdata.enter=3;
			var response = $.callServiceAsHtml(url,JSON.stringify(orderdata));
			$.unecOverlay();
			return response.data;
	};
	
	//填充订单信息
	var _getOrderInfo = function(data){
		if(OrderInfo.actionFlag==13){ //购裸机
			query.offer.loadInst(); //加载实例到缓存
			couponSale(data);
			if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
				OrderInfo.orderData.orderList.orderListInfo.soNbr = OrderInfo.order.soNbr;
			}
			OrderInfo.orderData.orderList.orderListInfo.custOrderType = OrderInfo.busitypeflag;
			return true;
		}
		SoOrder.getToken();
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
			OrderInfo.orderData.orderList.orderListInfo.custOrderType = OrderInfo.busitypeflag;
			return true;
		}
		var busiOrders = [];  //存放订单项数组
		var custOrderAttrs = []; //获取订单属性数组
		var itemValue="N";
		//经办人新报文
//		if(OrderInfo.actionFlag == 1){
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.VIROLID,//虚拟订单号
				value : OrderInfo.virOlId
			});
			if(OrderInfo.preBefore.idPicFlag == "ON"){
				custOrderAttrs.push({ //业务类型
					itemSpecId : CONST.BUSI_ORDER_ATTR.CURIP,
					value : OrderInfo.curIp
				});
			}
//		}
		
//		custOrderAttrs.push({
//			itemSpecId : CONST.BUSI_ORDER_ATTR.THRETOFOUR_ITEM,//3转4标志
//			value : itemValue
//		});
//		custOrderAttrs.push({ //业务类型
//			itemSpecId : CONST.BUSI_ORDER_ATTR.BUSITYPE_FLAG,
//			value : OrderInfo.busitypeflag
//		});
		if(OrderInfo.actionFlag==112){
			custOrderAttrs.push({ //融合新装订单流水
				itemSpecId : "40010037",
				value : $("#TransactionID").val()
			});
		}
		OrderInfo.orderData.orderList.orderListInfo.custOrderType = OrderInfo.busitypeflag;
		
		//订单备注前置
		var remark = $('#order_remark').val(); 
		if(ec.util.isObj(remark)){
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});	
		}
		if(OrderInfo.actionFlag==14 || OrderInfo.actionFlag==1 || OrderInfo.actionFlag==112){
			//订单购物车属性(经办人)
			if(CONST.getAppDesc()==0){
				var orderAttrName = $.trim($("#orderAttrName").val()); //经办人姓名
				var orderIdentidiesTypeCd = $("#orderIdentidiesTypeCd  option:selected").val(); //证件类型
				var orderAttrIdCard = $.trim($("#orderAttrIdCard").val());; //证件号码
				if("1"==orderIdentidiesTypeCd){
					orderAttrIdCard =$.trim($("#sfzorderAttrIdCard").val()); //身份证号码
				}
				var orderAttrAddr = $.trim($("#orderAttrAddr").val()); //地址
				var orderAttrPhoneNbr = $.trim($("#orderAttrPhoneNbr").val()); //联系人号码
			}
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==112){ //新装
			_createOrder(busiOrders); //新装
		}else if (OrderInfo.actionFlag==2){ //套餐变更
			offerChange.changeOffer(busiOrders);	
			if(OrderInfo.jbr.custId){
				OrderInfo.orderData.orderList.orderListInfo.handleCustId = OrderInfo.jbr.custId;
				if(OrderInfo.jbr.custId < -1){
					OrderInfo.createJbr(busiOrders);
				}
			}
		}else if (OrderInfo.actionFlag==3){ //可选包变更		
			_createAttOrder(busiOrders); //附属销售品变更
			if(busiOrders.length==0){
				$.alert("提示","没有做任何业务，无法提交");
				return false;
			}
			if(OrderInfo.jbr.custId){
				OrderInfo.orderData.orderList.orderListInfo.handleCustId = OrderInfo.jbr.custId;
				if(OrderInfo.jbr.custId < -1){
					OrderInfo.createJbr(busiOrders);
				}
			}
		}else if (OrderInfo.actionFlag==201){ //订购橙分期合约包
			query.offer.loadInst(); //加载实例到缓存
			_createAttOrder(busiOrders); 
			if(busiOrders.length==0){
				$.alert("提示","没有做任何业务，无法提交");
				return false;
			}
		}else if (OrderInfo.actionFlag==8){ //新建客户单独订单
			OrderInfo.orderData.orderList.orderListInfo.partyId= -1;
			OrderInfo.orderData.orderList.orderListInfo.soNbr = UUID.getDataId();
			_createCustOrderOnly(busiOrders,data);
		}else if (OrderInfo.actionFlag==9){ //活卡销售返档
			_ActiveReturnOrder(busiOrders,data); 
		}else if(OrderInfo.actionFlag== 22 ){ //补换卡
			busiOrders = data;
			if(OrderInfo.jbr.custId){
				OrderInfo.orderData.orderList.orderListInfo.handleCustId = OrderInfo.jbr.custId;
				if(OrderInfo.jbr.custId < -1){
					OrderInfo.createJbr(busiOrders);
				}
			}
		}else if(OrderInfo.actionFlag == 23){//异地补换卡
			if(OrderInfo.jbr.custId){
				OrderInfo.orderData.orderList.orderListInfo.handleCustId = OrderInfo.jbr.custId;
				if(OrderInfo.jbr.custId < -1){
					OrderInfo.createJbr(busiOrders);
				}
			}
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
		}else if (OrderInfo.actionFlag==6){ //主副卡成员变更加装副卡
			_createMainOrder(busiOrders);
			if(OrderInfo.jbr.custId){
				OrderInfo.orderData.orderList.orderListInfo.handleCustId = OrderInfo.jbr.custId;
				if(OrderInfo.jbr.custId < -1){
					OrderInfo.createJbr(busiOrders);
				}
			}
		}else if(OrderInfo.actionFlag==21){ //销售品成员变更拆除副卡
			_delViceCardAndNew(busiOrders,data);
			if(OrderInfo.jbr.custId){
				OrderInfo.orderData.orderList.orderListInfo.handleCustId = OrderInfo.jbr.custId;
				if(OrderInfo.jbr.custId < -1){
					OrderInfo.createJbr(busiOrders);
				}
			}
		}
		OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs = custOrderAttrs; //订单属性数组
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
	
	
	//订单数据校验
	var _checkData = function() {
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 112){ //新装
			if(OrderInfo.cust.custId==""){
				$.alert("提示","客户信息不能为空！");
				return false ; 
			}
			var prodAttrFlag = true;
			order.main.noUserFlag = false;
			if(OrderInfo.prodAttrs.length>0){
				for ( var i = 0; i < OrderInfo.prodAttrs.length; i++) {
					var prodAttr=OrderInfo.prodAttrs[i];
					if(prodAttr.isOptional=="N"){//必填需校验
						prodAttrFlag=order.main.check_parm_self($("#"+prodAttr.id));
					}
				}
				if(order.main.noUserFlag){
					return false;
				}
				if(!prodAttrFlag){
					return false;
				}
			}
			
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				for ( var j = 0; j < offerRole.prodInsts.length; j++) {
					var prodInst = offerRole.prodInsts[j];			        
					var prodId=prodInst.prodInstId;
					var accNbr = OrderInfo.getProdAn(prodInst.prodInstId).accessNumber;
					if(accNbr==undefined || accNbr == ""){
						$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
						return false;
					} 
					if(OrderInfo.getProdTd(prodInst.prodInstId)=="" && !order.service.isCloudOffer){//非企业云盘
						$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】UIM卡不能为空！");
						return false;
					}
					//封装产品属性
					var flag = false;
					$("[name='payType']").each(function(){
						if($(this).val()!= undefined&&$(this).val()!=null&&$(this).val()!=""){
							flag = true ;
						}
					});
					if(!flag){
						$.alert("信息提示","没有配置付费类型，无法提交");
						return false;
					}
					
					
					
					//校验必填的产品属性
//					var prodAttrFlag = true;
//					var checkName = null;
//					$(OrderInfo.prodAttrs).each(function(){
//						var isOptional = this.isOptional;
//						var id = this.id;
//						if(isOptional == "N" && id){
//							var val=$.trim($("#"+id).val());
//							if(val == "" || val == undefined){
//								checkName = this.name;
//								prodAttrFlag = false;
//							}
//						}
//					});
//					if(!prodAttrFlag){
//						$.alert("信息提示","没有配置产品属性("+checkName+")，无法提交");
//						return false;
//					}
					
				}
			}
		}
		//销售品更功能产品参数校验
		if(OrderInfo.actionFlag == 1||OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3
				|| OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 112){
			//主销售参数设置校验 
			if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 112){
				var spec = OrderInfo.offerSpec;
				if(spec.ifParams&&spec.offerSpecParams!=null&&spec.offerSpecParams.length>0){  //销售参数节点
					if(spec.isset !="Y"){
						$.alert("提示","主套餐【"+spec.offerSpecName+"】：参数未设置！");
						return false ; 
					}
				}
			}
			if(OrderInfo.actionFlag == 21){
				var spec = AttachOffer.newViceParam;
				for(var i = 0;i < spec.length; i++){
					if(spec[i].offerSpecParams!=null&&spec[i].offerSpecParams.length>0){  //销售参数节点
						if(spec[i].isset !="Y"){
							$.alert("提示","副卡号码："+spec[i].accessNumber+"的新套餐【"+spec[i].offerSpecName+"】：参数未设置！");
							return false ; 
						}
					}
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
		//橙分期校验
//		if(OrderInfo.actionFlag == 201){//橙分期
//			if(OrderInfo.boProd2OldTds.length==0){
//				$.alert("提示","UIM卡信息不能为空！");
//				return false ; 
//			}
//		}
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
					if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 112){ //新装
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
					if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 112){ //新装
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
	//创建活卡销售返档订单数据
	var _ActiveReturnOrder = function(busiOrders,data){
		OrderInfo.busitypeflag = 43;
		var _BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.TRANSFERRETURN;
		var toCustId = cust.readIdCardUser.custId;
		var toCustName = cust.readIdCardUser.partyName;
		var toAddressStr = cust.readIdCardUser.addressStr;
		var nameCN = cust.readIdCardUser.CN;
		var toIdentidiesTypeCd = cust.readIdCardUser.identityCd;
		var toIdCardNumber = cust.readIdCardUser.idCardNumber;
		
		if(cust.readIdCardUser.custId < 0){
			var createCust = {						
					areaId : order.prodModify.choosedProdInfo.areaId,						
					boActionType : {							
						actionClassCd : CONST.ACTION_CLASS_CD.CUST_ACTION, //动作大类：客户动作							
						boActionTypeCd : CONST.BO_ACTION_TYPE.CUST_CREATE //动作小类：新建客户							
					},						
					busiObj : {					        
						instId : -1				        								
					},						
					busiOrderInfo : {
						seq : OrderInfo.SEQ.seq--
					},						
					data : {
						boCustIdentities: [ {				                
							identidiesTypeCd : toIdentidiesTypeCd,	//证件类型编码			                
							identityNum : toIdCardNumber, //证件号码
							defaultIdType :toIdentidiesTypeCd,	//证件类型编码		
							identidiesPic :cust.custCatsh.identityPic,
							state : "ADD"
			            }],				        
			            boCustInfos: [{				                
			            	areaId : order.prodModify.choosedProdInfo.areaId,  
			                businessPassword : "111111",
			                name :  toCustName,
							addressStr :toAddressStr,//客户地址
			                partyTypeCd : 1,
			                defaultIdType:1,
			                mailAddressStr :toAddressStr,
			                telNumber:$('#mobilePhone').val(),
			                state : "ADD"
			            }],
			            boPartyContactInfo:[]
					}
			};
			if(data.boPartyContactInfo != undefined || data.boPartyContactInfo != null){
				createCust.data.boPartyContactInfo.push(data.boPartyContactInfo[0]);
			}
			busiOrders.push(createCust);
		}
			OrderInfo.busitypeflag = 43;
			var _BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.TRANSFERRETURN;
			var toCustId = cust.readIdCardUser.custId;
			var toCustName = cust.readIdCardUser.custName;
			var toAddressStr = cust.readIdCardUser.address;
			var nameCN = cust.readIdCardUser.CN;
			var toIdentidiesTypeCd = cust.readIdCardUser.identityCd;
			var toIdCardNumber = cust.readIdCardUser.idCardNumber;
			var acctId = -1; //要更换的帐户ID
			var acctCd = -1;
			OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT,9,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT),"");
			//更换客户节点
			var transferCust = {
					areaId : order.prodModify.choosedProdInfo.areaId,	
					boActionType : {
						actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION, //动作大类：产品动作
						boActionTypeCd : _BO_ACTION_TYPE //动作小类：过户
					},
					busiObj : {				        
						accessNumber : order.prodModify.choosedProdInfo.accNbr,			        
						instId : order.prodModify.choosedProdInfo.prodInstId,			        
						isComp : "N",			        
						objId : order.prodModify.choosedProdInfo.productId,			        
						offerTypeCd : "1"			    
					}, 
					busiOrderInfo : {
						seq : OrderInfo.SEQ.seq--
					},	
					data : {
						boCusts : [{			                
							partyId : OrderInfo.cust.custId,			                
							partyProductRelaRoleCd : 0,			                
							state : "DEL"			            
						},
			            {
			                partyId : toCustId,
			                partyProductRelaRoleCd : 0,
			                state : "ADD"
			            }],
			            boProdStatuses : [{
							prodStatusCd : CONST.PROD_STATUS_CD.READY_PROD,
							state : "DEL"
						},{
							prodStatusCd : CONST.PROD_STATUS_CD.DONE_PROD,
							state : "ADD"
						}]
					}
			};
			if (cust.OneCertNumFlag=="ON") {// 判断是否是政企客户，为个人客户时封装证号关系节点
				transferCust.data.boCertiAccNbrRels = [];
	            if(cust.readIdCardUser.newUserFlag=="true"){//新客户
	            	 var boCertiAccNbrRel={
	            			 "accNbr":order.prodModify.choosedProdInfo.accNbr,
	                         "state": "ADD",
	                         "partyId" : cust.readIdCardUser.custId,
	                         "certType": cust.readIdCardUser.identityCd,
	                         "certNum" : cust.readIdCardUser.idCardNumber,
	                         "custName" : cust.readIdCardUser.partyName,
	                         "certAddress": cust.readIdCardUser.addressStr,
	                         "serviceType": "1300"// 返档	 
	            	 }
	            }else{
	                var boCertiAccNbrRel={
	                        "accNbr":order.prodModify.choosedProdInfo.accNbr,
	                        "state": "ADD",
	                        "partyId" : cust.readIdCardUser.custId,
	                        "certType": cust.readIdCardUser.identityCd,
	                        "certNum" : cust.readIdCardUser.idCardNumber,
	                        "certNumEnc": cust.readIdCardUser.certNum,
	                        "custName" : cust.readIdCardUser.partyName,
	                        "custNameEnc": cust.readIdCardUser.CN,
	                        "certAddress": cust.readIdCardUser.addressStr,
	                        "certAddressEnc": cust.readIdCardUser.address,
	                        "serviceType": "1300"// 返档
	                    }
	            }

	            transferCust.data.boCertiAccNbrRels.push(boCertiAccNbrRel);
			};
			//使用人节点
			  var boProdItems = 
				   [{
				   itemSpecId : CONST.PROD_ATTR.PROD_USER,
				   state : "DEL",
				   value : OrderInfo.cust.custId
			   	  }, 
			   	  {
			   		  itemSpecId : CONST.PROD_ATTR.PROD_USER,
			   		  state : "ADD",
			   		  value : toCustId
			   	  }]
			 transferCust.data.boProdItems = boProdItems;
			 busiOrders.push(transferCust);
// OrderInfo.createAcct(busiOrders, -1,toCustId,nameCN);
// var changeAcct = true;
//			if(order.prodModify.accountInfo.acctId==acctId){				
//				changeAcct = false;							
//			}
//			//更换帐户节点
//			if(changeAcct){
//				//更改帐户节点
//				var acctChangeNode = {
//						areaId : OrderInfo.getAreaId(), 
//						busiOrderInfo : {
//							seq : OrderInfo.SEQ.seq-- 
//						}, 
//						busiObj : {
//							accessNumber: order.prodModify.choosedProdInfo.accNbr,
//							instId : order.prodModify.choosedProdInfo.prodInstId, //业务对象实例ID
//							objId :order.prodModify.choosedProdInfo.productId,
//		                    isComp: "N",
//		                    offerTypeCd: "1"
//						},  
//						boActionType : {
//							actionClassCd : 1300,
//							boActionTypeCd : "-6"
//						}, 
//						data : {
//							boAccountRelas : [{
//								acctCd: order.prodModify.accountInfo.acctCd,
//				                acctId: order.prodModify.accountInfo.acctId,						
//								acctRelaTypeCd : "1",							
//								chargeItemCd : "0",				
//								percent : "100",							
//								priority : 1,							
//								prodAcctId : "",						
//								state : "DEL"				
//							},
//							{
//								acctCd : acctCd,
//								acctId : acctId,
//								acctRelaTypeCd : 1,
//								chargeItemCd : 1,               
//								percent : 100,               
//								priority : 1,                 
//								prodAcctId : -1,              
//								state : "ADD"
//							}]							                
//						}
//				};
//				busiOrders.push(acctChangeNode);
//			}
			
			
			//改账户信息节点
			if (data.boAccountInfos != undefined || data.boAccountInfos != null) {
				// 新增帐户节点
				var acctChangeNode = {
					areaId : OrderInfo.getAreaId(),
					busiOrderInfo : {
						seq : OrderInfo.SEQ.seq--
					},
					
					boActionType : {
						actionClassCd : CONST.ACTION_CLASS_CD.ACCT_ACTION,
						boActionTypeCd : CONST.BO_ACTION_TYPE.ACCT_INFO_MODIFY
					},
					busiObj : {
						accessNumber : order.prodModify.choosedProdInfo.accNbr,
						instId : data.boAccountInfos[0].acctId
					},
					data : {"boAccountInfos":data.boAccountInfos}
				};
				busiOrders.push(acctChangeNode);
			}
		if(OrderInfo.jbr.custId){
			OrderInfo.orderData.orderList.orderListInfo.handleCustId = OrderInfo.jbr.custId;
			if(OrderInfo.jbr.custId < -1){
				OrderInfo.createJbr(busiOrders);
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
		OrderInfo.orderData.orderList.orderListInfo.handleCustId = undefined;
		if(ec.util.isObj(OrderInfo.jbr.custId)){
			OrderInfo.orderData.orderList.orderListInfo.handleCustId = OrderInfo.jbr.custId;
			if(OrderInfo.jbr.custId < -1){
				OrderInfo.createJbr(busiOrders);
			}
		}
		
		if(!!OrderInfo.choosedUserInfos && OrderInfo.choosedUserInfos.length){
			for(var i=0; i<OrderInfo.choosedUserInfos.length; i++){
				var isCreateUser = true;
				var custInfo = OrderInfo.choosedUserInfos[i].custInfo;
				//使用人为老客户 不下发
				if(custInfo.custId > -1){
					isCreateUser = false;
				}
				//使用人与客户或经办人一致  无需传新增节点
				if(custInfo.custId == OrderInfo.cust.custId || custInfo.custId == OrderInfo.jbr.custId){
					isCreateUser = false;
				}
				//同个使用人不下发
				for(var j=0; j<i; j++){
					if(custInfo.custId == OrderInfo.choosedUserInfos[j].custInfo.custId){
						isCreateUser = false;
					}
				}
				if(isCreateUser){
					OrderInfo.createUser(busiOrders,custInfo);
				}
			}
		}
		
		var acctId = -1; //先写死
//		var acctId =$("#acctSelect").val();
		if(acctId < 0 && acctId!=undefined ){
			OrderInfo.createAcct(busiOrders,acctId);	//添加帐户节点
		}
		var busiOrder = _createMainOffer(busiOrders); //添加主销售品节点	
		//遍历主销售品构成,添加产品节点
		for ( var i = 0; i < busiOrder.data.ooRoles.length; i++) {
			var ooRole = busiOrder.data.ooRoles[i];
			if(ooRole.objType==2){
				busiOrders.push(_createProd(ooRole.objInstId,ooRole.objId));	
			}		
		}
		AttachOffer.setAttachBusiOrder(busiOrders);  //添加可选包跟功能产品
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
				}else{
					SoOrder.submitOrder();
				}
			}
		}else{
			SoOrder.submitOrder();
		}
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
		
		//销售参数节点
		var offerSpecParams = OrderInfo.offerSpec.offerSpecParams;
		if(offerSpecParams!=undefined && offerSpecParams.length>0){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpecParams.length; i++) {
				var param = offerSpecParams[i];
				if(param.setValue==undefined){
					param.setValue = param.value;
				}
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.setValue,
	                state : "ADD"
	            };
	            if (ec.util.isObj(param.setValue)) {
					busiOrder.data.ooParams.push(ooParam);
				}
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
		// 发展人
        $('#dealerList').children('li').not(':first').each(function() {
            var o = $(this).data();
            var dealer = {
                itemSpecId: CONST.BUSI_ORDER_ATTR.DEALER,
                role: o.role,
                value: o.staffid,
                channelNbr: o.channelnbr
            };
            busiOrder.data.busiOrderAttrs.push(dealer);
            var dealer_name = {
                itemSpecId: CONST.BUSI_ORDER_ATTR.DEALER_NAME,
                role: o.role,
                value: o.dealername
            };
            busiOrder.data.busiOrderAttrs.push(dealer_name);
        })	
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
				//boCertiAccNbrRels : [], //证号关联关系节点
				boProdStatuses : [], //产品状态节点
				busiOrderAttrs : [] //订单属性节点
			}
		};
	    if(cust.OneCertNumFlag=="ON"){
	    	if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==6){//新装添加证号关系节点
				busiOrder.data.boCertiAccNbrRels=[];
			}
	    }
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
		if(pwd=="******"|| pwd == undefined || OrderInfo.actionFlag==1){
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
		var paytype=$("#payType_"+prodId).val();
		//新装的副卡付费方式与主卡保持一致
		if(OrderInfo.actionFlag==1 && prodId!=-1){
			paytype=$("#payType_-1").val();
		}
		if(paytype!= undefined){
			busiOrder.data.boProdFeeTypes.push({
				feeType : paytype,
				state : "ADD"
			});
		}
		//发展人
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 6){
            $('#dealerList').children('li').not(':first').each(function() {
                var o = $(this).data();
                var dealer = {
                    itemSpecId: CONST.BUSI_ORDER_ATTR.DEALER,
                    role: o.role,
                    value: o.staffid,
                    channelNbr: o.channelnbr
                };
                busiOrder.data.busiOrderAttrs.push(dealer);
                var dealer_name = {
                    itemSpecId: CONST.BUSI_ORDER_ATTR.DEALER_NAME,
                    role: o.role,
                    value: o.dealername
                };
                busiOrder.data.busiOrderAttrs.push(dealer_name);
            })
		}		
		var acctId= -1;
		var acctCd=-1;
		if(OrderInfo.actionFlag==6){ 
			acctId = OrderInfo.acctId;
			acctCd = OrderInfo.acctCd;
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
		//新装：一证五号需封装证号信息节点
	    if(cust.OneCertNumFlag=="ON" && !order.service.isCloudOffer){//非天翼云盘
			if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==6){
				if (ec.util.isObj(OrderInfo.boProdAns) && OrderInfo.boProdAns.length > 0) {
					var ca={};
					if (OrderInfo.cust.custId == "-1") {//新建客户
	                    ca.certType = OrderInfo.cust.identityCd;
	                    ca.certNum = OrderInfo.cust.identityNum;
	                    ca.custName = OrderInfo.cust.partyName;
	                    ca.certAddress =OrderInfo.cust.addressStr;
	                    if(OrderInfo.cust.identityCd!="1"){//非身份证类型
	                    	ca.certNum=OrderInfo.cust.identityNum;	
	        			}
	                } else {//老客户
	                    ca.certType = OrderInfo.cust.identityCd;
	                    ca.certNum = OrderInfo.cust.idCardNumber;
	                    ca.custName = OrderInfo.cust.partyName;
	                    ca.certAddress = OrderInfo.cust.addressStr;
	                    ca.certNumEnc = OrderInfo.cust.certNum.replace(/&#61/g,"=");
	                    ca.custNameEnc = OrderInfo.cust.CN.replace(/&#61/g,"=");
	                    ca.certAddressEnc = OrderInfo.cust.address.replace(/&#61/g,"=");
	        
	                }
					ca.partyId=OrderInfo.cust.custId;
					ca.serviceType = "1000";
					ca.state="ADD";
					var propertiesKey = "FUKA_SHIYR_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
				    var userFlag = offerChange.queryPortalProperties(propertiesKey);//使用人开关
				    var userInfo = OrderInfo.getChooseUserInfo(prodId);
					if((cust.isCovCust(OrderInfo.cust.identityCd) || userFlag=="ON") && userInfo != null){
						ca={};
						if (userInfo.custId <= -1) {//新建客户
		                    ca.certType = userInfo.identityCd;
		                    ca.certNum = userInfo.idCardNumber;
		                    ca.custName = userInfo.partyName;
		                    ca.certAddress =userInfo.addressStr;
		                } else {//老客户
		                    ca.certType = userInfo.identityCd;
		                    ca.certNum = userInfo.idCardNumber;
		                    ca.custName = userInfo.partyName;
		                    ca.certAddress = userInfo.addressStr;
		                    ca.certNumEnc = userInfo.certNum.replace(/&#61/g,"=");
		                    ca.custNameEnc = userInfo.CN.replace(/&#61/g,"=");
		                    ca.certAddressEnc = userInfo.address.replace(/&#61/g,"=");
		        
		                }
						ca.partyId=userInfo.custId;
						ca.serviceType = "1000";
						ca.state="ADD";
					}
					$.each(OrderInfo.boProdAns, function () {
						if(this.prodId==prodId){
						   ca.accNbr=this.accessNumber;
						   busiOrder.data.boCertiAccNbrRels.push(ca);
						}
					});
				}
			}
	    }
		return busiOrder;
	};
	
	//初始化订单获取token
	var _getToken = function() {
		var response = $.callServiceAsHtmlGet(contextPath+"/common/getToken");
		OrderInfo.order.token = response.data;
	};
	
	//订单确认
	var _orderConfirm = function(data){
		SoOrder.step(2,data);
		_showConfirm(data);	
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==112 || OrderInfo.actionFlag==6){ //新装 ,副卡加装
			$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+OrderInfo.offerSpec.offerSpecName+'</span><span class="subtitle font-secondary">主套餐</span></span></li>');
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				$.each(this.prodInsts,function(){					
					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+OrderInfo.getProdAn(this.prodInstId).accessNumber+'</span><span class="subtitle font-secondary">'+this.offerRoleName+'</span></span></li>');
				});
			});
		}else if(OrderInfo.actionFlag==13){//购裸机
			$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+OrderInfo.businessName+'</span><span class="subtitle font-secondary">终端名称</span></span></li>');
			var busiOrder = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;
			var bo2Coupons = undefined;
			for(var i=0; i<busiOrder.length; i++) {
				var boActionType = busiOrder[i].boActionType;
				if (boActionType.actionClassCd==CONST.ACTION_CLASS_CD.MKTRES_ACTION
						&& boActionType.boActionTypeCd==CONST.BO_ACTION_TYPE.COUPON_SALE) {
					bo2Coupons = busiOrder[i].data.bo2Coupons;
				}
			}
			$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+bo2Coupons[0].couponInstanceNumber+'</span><span class="subtitle font-secondary">终端串码</span></span></li>');
		}else if(OrderInfo.actionFlag==21){//拆副卡
			var prod = order.prodModify.choosedProdInfo;
			$("#orderTbody").append('<li id="offerSpecName"><span class="list-title"><span class="title-lg">'+prod.prodOfferName+'</span><span class="subtitle font-secondary">套餐名称</span></span></li>');
			$.each(order.memberChange.memberDelList, function(index, item) {
				$("#orderTbody").append('<li id="accNbrTr"><span class="list-title"><span class="title-lg">'+item+'</span><span class="subtitle font-secondary">拆除副卡号码</span></span></li>');	
			});
		}else if(OrderInfo.actionFlag==201){
			OrderInfo.actionTypeName = "订购橙分期合约包";
		}else if(OrderInfo.actionFlag==3){ //可选包变更 和订购橙分期合约包
			OrderInfo.actionTypeName = "订购/退订可选包与功能产品";
		}else{ //二次业务
			var prod = order.prodModify.choosedProdInfo;
			$("#orderTbody").append('<li id="offerSpecName"><span class="list-title"><span class="title-lg">'+prod.prodOfferName+'</span><span class="subtitle font-secondary">套餐名称</span></span></li>');
			$("#orderTbody").append('<li id="accNbrTr"><span class="list-title"><span class="title-lg">'+prod.accNbr+'</span><span class="subtitle font-secondary">手机号码</span></span></li>');	
			if(OrderInfo.actionFlag==2){ //套餐变更 
				OrderInfo.actionTypeName = "套餐变更";
				$("#accNbrTr").hide();
				$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+OrderInfo.offerSpec.offerSpecName+'</span><span class="subtitle font-secondary">新套餐名称</span></span></li>');
				for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) { //遍历主销售品构成
					var offerMember = OrderInfo.offer.offerMemberInfos[i];
					if(offerMember.objType==CONST.OBJ_TYPE.PROD){
						$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+offerMember.accessNumber+'</span><span class="subtitle font-secondary">'+offerMember.roleName+'号码</span></span></li>');
					}
				}
			} 
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
		if(ec.util.isObj($("#provCheckErrorMsg").html())){
			ruleFlag = false;
		}
		if(ruleFlag){
			if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==112 || OrderInfo.actionFlag==6){
				_showOrderOffer(); //显示订购的销售品
			}else if(OrderInfo.actionFlag==2){ //套餐变更 
				_showChangeAttach();
			}else if (OrderInfo.actionFlag==3){
				_showAttachOffer(); //显示订购的销售品
			}else if(OrderInfo.actionFlag==201){//订购橙分期合约包
				_showAttachOffer(); //显示订购的销售品
			}
				
		}
	};
	
	// 新装，显示订购的销售品
	var _showOrderOffer = function(){
		var i=0;
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			$.each(this.prodInsts,function(){
							
				_showAttOffer(this.prodInstId);
			});
		});
	};
	//套餐变更销售附属
	var _showChangeAttach = function(){
		var i=0;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==CONST.OBJ_TYPE.PROD){
				if(OrderInfo.offer.offerMemberInfos.length >1){
					_showAttOffer(this.objInstId,this.roleName);
				} else {
					_showAttOffer(this.objInstId);
				}
				
			}
		});
	};
	
	//显示订购的销售品
	var _showAttachOffer = function(){
		var prod = order.prodModify.choosedProdInfo;
		if(prod==undefined || prod.prodInstId ==undefined){
			return true;
		}
		_showAttOffer(prod.prodInstId);
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
			$("#order_fill_content").hide();
			$("#order-confirm").html(data).show();			
			OrderInfo.order.step=3;
		}
		/*for (var i = 1; i < 4; i++) {
			$("#step"+i).hide();
		}
		$("#step"+k).show();*/
	};
	
	//显示的可选包/功能产品
	var _showAttOffer = function(prodId,roleName){
		var offerSpecList = CacheData.getOfferSpecList(prodId);
		var offerList = CacheData.getOfferList(prodId);
		var servSpecList = CacheData.getServSpecList(prodId);
		var servList = CacheData.getServList(prodId);
		if(roleName != undefined){
			$("#orderTbody").append('<li><span class="list-title"><span>'+roleName+' 业务动作</span></span></li>');					
		}
		//可选包显示
		if(offerSpecList!=undefined && offerSpecList.length>0){  
			$.each(offerSpecList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel != "Y" && this.isdel != "C"){  //订购的附属销售品
					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.offerSpecName+'</span><span class="subtitle font-secondary">'+CONST.EVENT.OFFER_BUY+'</span></span></li>');	
				}
			});
		}
		if(offerList!=undefined && offerList.length>0){
			$.each(offerList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel == "Y"){  //退订的附属销售品
					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.offerSpecName+'</span><span class="subtitle font-secondary">'+CONST.EVENT.OFFER_DEL+'</span></span></li>');					
				}else if(this.update == "Y"){
					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.offerSpecName+'</span><span class="subtitle font-secondary">'+CONST.EVENT.OFFER_UPDATE+'</span></span></li>');
				}else if(ec.util.isObj(this.orderCount)&&ec.util.isObj(this.counts)){
					if(this.orderCount<this.counts){//订购附属销售品
						for(var k=0;k<(this.counts-this.orderCount);k++){
							$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.offerSpecName+'</span><span class="subtitle font-secondary">'+CONST.EVENT.OFFER_OFFER_BUY+'</span></span></li>');							
						}
					}
				}
			});
		}
		//功能产品显示
		if(servSpecList!=undefined && servSpecList.length>0){
			$.each(servSpecList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel != "Y" && this.isdel != "C"){  //订购的功能产品
                   //订购的附属销售品
					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.servSpecName+'</span><span class="subtitle font-secondary">'+CONST.EVENT.PROD_OPEN+'</span></span></li>');
				}
				});
		}
		if(servList!=undefined && servList.length>0){
			$.each(servList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel == "Y"){  //退订的附属销售品
					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.servSpecName+'</span><span class="subtitle font-secondary">'+CONST.EVENT.PROD_CLOSE+'</span></span></li>');					
				}else if(this.update == "Y"){
					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.servSpecName+'</span><span class="subtitle font-secondary">'+CONST.EVENT.PROD_UPDATE+'</span></span></li>');					
				}
			});
		}
//		if(appList!=undefined && appList.length>0){
//			$.each(appList,function(){ //遍历当前产品下面的增值业务
//				if(this.dfQty == 1){  //开通增值业务
//					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.servSpecName+'</span><span class="subtitle font-secondary"></span></span><span class="pull-right p-r-10 list-text">'+CONST.EVENT.PROD_OPEN+'</span></li>');						
//				}
//			});
//		}
		
		//动作链返回显示
//		if(OrderInfo.orderResult.autoBoInfos!=undefined){
//			$.each(OrderInfo.orderResult.autoBoInfos,function(){
//				if(this.instAccessNumber==OrderInfo.getAccessNumber(prodId)){
//					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.specName+'</span><span class="subtitle font-secondary"></span></span><span class="pull-right p-r-10 list-text">'+this.boActionTypeName+'</span></li>');	
//				}
//			});
//		}
	};
	
	//显示订单确认界面，订单填写界面隐藏
	var _showConfirm = function(data) {
		if(OrderInfo.actionFlag==112){
			$("#orderContentDiv").hide();
			$("#orderConfirmDiv").show();
			$("#nav-tab-5").html(data);
			$("#nav-tab-4").removeClass("active in");
	    	$("#nav-tab-5").addClass("active in");
	    	$("#tab4_li").removeClass("active");
	    	$("#tab5_li").addClass("active");
	    	OrderInfo.order.step = 5;
	    	$("#qt").removeClass("active");
			$("#jd").addClass("active");
//			$("#jd").click();
		}else{
			OrderInfo.order.step = 6;
			$("#orderContentDiv").hide();
			$("#headTabDiv1").hide();
			$("#headTabDiv2").show();
			$("#orderConfirmDiv").show();
			$("#nav-tab-7").html(data);
			$("#nav-tab-7").addClass("active in");
		}
		if(OrderInfo.actionFlag==201 || OrderInfo.actionFlag==22|| OrderInfo.actionFlag==9){
			OrderInfo.order.step = 3;
		}
		if(OrderInfo.actionFlag==13){//购裸机
			OrderInfo.order.step = 2;
		}
		if(OrderInfo.actionFlag==14){//合约新装
			OrderInfo.order.step = 7;
		}
		if(OrderInfo.actionFlag==6){//加装副卡
			OrderInfo.order.step = 4;
		}
		if(OrderInfo.actionFlag==21){//拆副卡
			OrderInfo.order.step = 3;
		}
		$("#tab7_li").addClass("active");	
	};
	
	//显示订单填写界面，订单确认界面隐藏
	var _orderBack = function() {
		if(OrderInfo.actionFlag==112){
			$("#nav-tab-5").removeClass("active in");
	    	$("#nav-tab-4").addClass("active in");
	    	$("#tab5_li").removeClass("active");
	    	$("#tab4_li").addClass("active");
	    	$("#jd").removeClass("active");
			$("#qt").addClass("active");
			OrderInfo.order.step=4;
			$("#orderContentDiv").show();
			$("#orderConfirmDiv").hide();
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
			OrderInfo.resetSeq(); //重置序列
			SoOrder.delOrder();
			return;
		}
		if(OrderInfo.actionFlag==201){//橙分期
			$("#nav-tab-7").removeClass("active in");
	    	$("#nav-tab-2").addClass("active in");
	    	$("#tab7_li").removeClass("active");
	    	$("#tab2_li").addClass("active");
			$("#orderContentDiv").show();
			$("#orderConfirmDiv").hide();
			$("#headTabDiv1").show();
			$("#headTabDiv2").hide();
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
			OrderInfo.resetSeq(); //重置序列
			SoOrder.delOrder();
			OrderInfo.order.step=2;
			return;
		}
		if(OrderInfo.actionFlag==22){
			$("#order_fill_content").show();
		}
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==2){
			OrderInfo.order.step=3;
			$("#order-content").show();
		}
		if(OrderInfo.actionFlag==9 || OrderInfo.actionFlag==22){
			$("#custInfoModifyBtn").attr("disabled","disabled");
			OrderInfo.order.step=1;
		}
		if(OrderInfo.actionFlag==13){//购裸机
			$("#nav-tab-7").removeClass("active in");
	    	$("#nav-tab-1").addClass("active in");
	    	$("#tab7_li").removeClass("active");
	    	$("#tab1_li").addClass("active");
			$("#orderContentDiv").show();
			$("#orderConfirmDiv").hide();
			$("#headTabDiv1").show();
			$("#headTabDiv2").hide();
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
			OrderInfo.resetSeq(); //重置序列
			SoOrder.delOrder();
			OrderInfo.order.step=1;
			return;
		}
		if(OrderInfo.actionFlag==14){//合约新装
			OrderInfo.order.step=6;
		}
		if(OrderInfo.actionFlag==21){//拆副卡
			OrderInfo.order.step=2;
		}
		if(OrderInfo.actionFlag==6){//加装副卡
			OrderInfo.order.step=3;
		}
		if(OrderInfo.actionFlag==21 || OrderInfo.actionFlag==6){//拆副卡、加装副卡
			$("#nav-tab-7").removeClass("active in");
	    	$("#nav-tab-3").addClass("active in");
	    	$("#tab7_li").removeClass("active");
	    	$("#tab3_li").addClass("active");
			$("#orderContentDiv").show();
			$("#orderConfirmDiv").hide();
			$("#headTabDiv1").show();
			$("#headTabDiv2").hide();
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
			OrderInfo.resetSeq(); //重置序列
			SoOrder.delOrder();
			return;
		}
		if(OrderInfo.actionFlag==1){//新装
			OrderInfo.order.step=5;
		}
		
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==112){//新装与主副卡成员变更需要重置翼支付订购状态
			order.main.restoreYzfInitialState();
		}
		$("#orderConfirmDiv").hide();
		$("#orderContentDiv").show();
		$("#headTabDiv1").show();
		$("#headTabDiv2").hide();
		$("#nav-tab-7").removeClass("active in");
		$("#nav-tab-6").addClass("active in");
		$("#tab6-li").addClass("active");
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
		OrderInfo.resetSeq(); //重置序列
		SoOrder.delOrder();
		_getToken(); //获取页面步骤
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
							if(OrderInfo.actionFlag==9){//客户返档
								$("#custInfoModifyBtn").removeAttr("disabled");
							}
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
		}else{ //订购
			offerSpec.offerTypeCd = 2;
			offerSpec.boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_OFFER;
			offerSpec.offerId = OrderInfo.SEQ.offerSeq--; 
			OrderInfo.getOfferBusiOrder(busiOrders,offerSpec,prodId);			
		}
	};
	
	//获取token的同步请求
	var _getTokenSynchronize = function() {
		var response = $.callServiceAsHtmlGet(contextPath+"/common/getToken");
		OrderInfo.order.token = response.data;
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
	
	//创建主副卡订单数据
	var _createMainOrder = function(busiOrders) {
		var prodInfo = order.prodModify.choosedProdInfo;
		var offerBusiOrder = {};
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
						if(ec.util.isObj(offerBusiOrder.areaId)){
							ooRole.offerRoleId = "601";
							offerBusiOrder.data.ooRoles.push(ooRole);
						}
						busiOrders.push(_createProd(prodInst.prodInstId,prodInst.objId));	
					}		
				}
			} 
		} 
		if(ec.util.isObj(offerBusiOrder.areaId)){
			busiOrders.push(offerBusiOrder);
		}
		AttachOffer.setAttachBusiOrder(busiOrders);//添加附属
		busiOrders.push(busiOrder);
	};
	
	//销售品成员变更拆除副卡
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
			if(this.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD && this.objType == CONST.OBJ_TYPE.PROD){
				objInstId = this.objInstId;
				return false;
			}
		});
		OrderInfo.getOfferBusiOrder(busiOrders,param,objInstId);
		var offerBusiOrder = {};
		$.each(order.memberChange.delAttachOfferList,function(){//共享套餐级可选包
			var cartOpenedList = this;
			$.each(this.offerLists,function(){
				var offerList = this;
				if(this.offerRoleId=="600"){
					$.each(newData,function(){
						if(this.objInstId==cartOpenedList.prodId){
							offerBusiOrder = {
									areaId : OrderInfo.getProdAreaId(this.objInstId),  //受理地区ID
									busiOrderInfo : {
										seq : OrderInfo.SEQ.seq--
									}, 
									busiObj : { //业务对象节点
										objId : offerList.offerSpecId,  //业务规格ID
										instId : offerList.offerId, //业务对象实例ID
										accessNumber : this.accessNumber, //业务号码
										offerTypeCd : "2"
									},  
									boActionType : {
										actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
										boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP
									}, 
									data:{
										ooRoles : []			
									}
								};
							$.each(OrderInfo.offer.offerMemberInfos,function(){
								var ooRole = {
										objId : this.objId,
										objInstId :this.objInstId,
										objType : this.objType,
										offerRoleId : this.offerRoleId,
										state : "DEL"
									};
								if(this.objType=="2"){
									ooRoles.prodId = this.objInstId;
									ooRoles.objInstId = this.objInstId;
									offerBusiOrder.data.ooRoles.push(ooRole);
								}
							});
						}
					});
				}
			});
		});
		if(ec.util.isObj(offerBusiOrder.areaId)){
			busiOrders.push(offerBusiOrder);
		}
		//封装拆除副卡节点
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
   
 //查询X：X周岁以下办理任何电信业务必须填写经办人(传17)  Y：经办人必须是Y周岁以上(传18)
   var _queryConstConfig=function(typeClass){
		var year=SoOrder.jbrMustAge;
		var param={
			typeClass:typeClass,
			queryType:"3"
		};
		var url=contextPath+"/print/queryConstConfig";
		//$.ecOverlay("<strong>正在查询公共数据查询的服务中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		if (response.code==0) {
			if(response.data!=undefined){
				year=response.data.value;
			}
		}
		return year;
	};
	return {
		sortOfferSpec           :_sortOfferSpec,
		delOrder 				: _delOrder,
		getOrderInfo 			: _getOrderInfo,
		initFillPage			: _initFillPage,
		initOrderData			: _initOrderData,
		orderBack				: _orderBack,
		submitOrder 			: _submitOrder,
		checkOrder				: _checkOrder,
		checkData               : _checkData,
		createMainOffer         :_createMainOffer,
		createProd              :_createProd,
		createAttOffer          :_createAttOffer,
		createServ              :_createServ,
		getToken                :_getToken,
		gotosubmitOrder         :_gotosubmitOrder,
		orderConfirm            :_orderConfirm,
		showConfirm             :_showConfirm,
		step					:_step,
		showOrderOffer          :_showOrderOffer,
		showAttOffer            :_showAttOffer,
		showAttachOffer         :_showAttachOffer,
		getTokenSynchronize     :_getTokenSynchronize,
		createMainOrder         :_createMainOrder,
		delViceCardAndNew       :_delViceCardAndNew,
		usedNum					:_usedNum,
		jbrMustAge              :_jbrMustAge,
		queryConstConfig        :_queryConstConfig
	};
})();
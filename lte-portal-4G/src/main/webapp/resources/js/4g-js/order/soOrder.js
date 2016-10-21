/**
 * 受理订单对象
 * 
 * @author wukf
 */
CommonUtils.regNamespace("SoOrder");

/** 受理订单对象*/
SoOrder = (function() {
	var isYWTX = "";
	var _inSubmit = false; //标识位，是否正在进行订单提交
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
		OrderInfo.resetSeq(); //重置序列
		OrderInfo.resetData(); //重置 数据
		OrderInfo.orderResult = {}; //清空购物车
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.getAreaId();
		OrderInfo.resetChooseUserInfo();
	};
	
	var _getCheckOperatSpec=function(){
		//已加载过就不在加载
		if(OrderInfo.load_zcd_privilege !== true){
			var url=contextPath+"/order/getCheckOperatSpec";//获取是否有分段的权限
			var response = $.callServiceAsJson(url, {});
			OrderInfo.zcd_privilege=response.data;
			OrderInfo.load_zcd_privilege = true;
		}
	};
	
	//判断是否正在进行订单提交
	var _isInSubmitOrder = function(){
		return SoOrder.inSubmit;
	};
	
	//开始订单提交 （设置标识，屏蔽提交按钮）
	var _beginSubmitOrder = function(){
		SoOrder.inSubmit = true;
		//屏蔽提交按钮（或链接）
		var $eles = $("#fillNextStep"); //可在此添加 需要屏蔽click效果的元素，如 $("#fillNextStep,#submitButtonId") 
		if($eles.length > 0){
			//将绑定的click事件处理函数保存到自定义的click_o事件中，然后解绑click事件
			for(var i=0;i<$eles.length;i++){
				var events = $.data($eles[i],"events");
				if(events && events.click){
					for(var j=0;j<events.click.length;j++){
						$($eles[i]).on("click_o",events.click[j].data,events.click[j].handler);
					}
					$($eles[i]).off("click");
				}
				//置灰，将href参数保存到href_o ，然后去除href参数
				$($eles[i]).removeClass("btna_o").addClass("btna_g").attr({"href_o":$($eles[i]).attr("href"),"disabled":"disabled"}).removeAttr("href");
			}
		}
	};
	
	//完成订单提交（设置标识，还原提交按钮）
	var _completeSubmitOrder = function(){
		//激活提交按钮（或链接）
		var $eles = $("#fillNextStep"); //可在此添加 需要还原click效果的元素，如 $("#fillNextStep,#submitButtonId")
		if($eles.length > 0){
			for(var i=0;i<$eles.length;i++){
				//去除置灰，从href_o参数还原href参数 ，然后去除href_o参数
				$($eles[i]).removeClass("btna_g").addClass("btna_o").attr("href",$($eles[i]).attr("href_o")).removeAttr("href_o").removeAttr("disabled");
				//从绑定的click_o事件中还原绑定click事件，然后解绑click_o事件
				var events = $.data($eles[i],"events");
				if(events && events.click_o){
					for(var j=0;j<events.click_o.length;j++){
						$($eles[i]).on("click",events.click_o[j].data,events.click_o[j].handler);
					}
					$($eles[i]).off("click_o");
				}
			}
		}
		SoOrder.inSubmit = false;
	};
	
	//提交订单节点
	var _submitOrder = function(data) {
		if(_isInSubmitOrder()){
			$.alert("提示","订单已提交，请耐心等待或刷新重试！");
			return;
		}
		_beginSubmitOrder();
		var async = false; //是否是异步请求
		try {
			_getCheckOperatSpec();
			if(_getOrderInfo(data)){
				
				//订单提交
				var url = contextPath+"/order/orderSubmit";
				if(OrderInfo.order.token!=""){
					url = contextPath+"/order/orderSubmit?token="+OrderInfo.order.token;
				}
				if (OrderInfo.custCreateToken !== undefined || OrderInfo.custCreateToken !== "") {
					OrderInfo.orderData.token = OrderInfo.custCreateToken;
				}
				async = true;
				$.callServiceAsJson(url,JSON.stringify(OrderInfo.orderData), {
					"before":function(){
						$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
					},"always":function(){
						//如果是同步请求，在finally中 重置标识位；如果为异步请求，在请求处理完成时，重置标识位
						_completeSubmitOrder();
						$.unecOverlay();
					},	
					"done" : function(response){
						try {
							_getToken();
							if (response.code == 0) {
								var data = response.data;
								if(data.checkRule!=undefined && data.checkRule!="notCheckRule"){
									//下省校验单
									var provCheckResult = order.calcharge.tochargeSubmit(response.data);
									//下省校验请求成功
									if(provCheckResult.code==0){
										//存在可继续受理的省内校验错误，需要在前台进行提示
										if(provCheckResult.data.returnCode!=null && provCheckResult.data.returnCode!="0000"){
											response.data.provCheckErrorCode = provCheckResult.data.returnCode;
											response.data.provCheckErrorMsg = "";
											if(provCheckResult.data.returnCode!=undefined && provCheckResult.data.returnCode!=null){
												response.data.provCheckErrorMsg +=  "【错误编码："+provCheckResult.data.returnCode+"】";
											}
											//省内校验欠费的编码和提示
											if(provCheckResult.data.returnCode=="110019" || provCheckResult.data.returnCode=="110145"){
												response.data.provCheckErrorMsg += "该用户所在账户存在欠费，请提醒用户及时缴费，避免因欠费影响用户正常使用和业务办理，以及欠费滞纳金的产生。";
											}
										}
									
										var returnData = _gotosubmitOrder(response.data);
										OrderInfo.orderBusiHint = null;
										//查是否调用业务提示查询开关
										var propertiesKey = "YWTX-"+OrderInfo.staff.soAreaId.substring(0,3) + "0000";
										isYWTX = offerChange.queryPortalProperties(propertiesKey);
										if(isYWTX == "ON"){
											//下省校验成功之后调用提示接口提醒接口，获取提醒信息
											var url=contextPath+"/order/queryOrderBusiHint";
											var params={
													"olId":response.data.rolId,
													"soNbr":response.data.rsoNbr,
													"areaId" : OrderInfo.staff.areaId,
													"chargeItems":[]
											};
											$.ecOverlay("<strong>正在查询提醒信息,请稍等会儿....</strong>");
											var response = $.callServiceAsJson(url,params);
											$.unecOverlay();
											if(response.code == 0 && response.data.result!=null && response.data.result.orderPromptInfos!=null){
												OrderInfo.orderBusiHint = response.data.result.orderPromptInfos;
											}
										}
										_orderConfirm(returnData);
									}
									//下省校验失败也将转至订单确认页面，展示错误信息，只提供返回按钮
									else{
										response.data.provCheckError = "Y";
										response.data.provCheckErrorCode = provCheckResult.data.errCode;
										response.data.provCheckErrorMsg = "";
										if(provCheckResult.data.errCode!=undefined && provCheckResult.data.errCode!=null){
											response.data.provCheckErrorMsg +=  "【错误编码："+provCheckResult.data.errCode+"】";
										}
										if(provCheckResult.data.errMsg!=undefined && provCheckResult.data.errMsg!=null){
											response.data.provCheckErrorMsg += provCheckResult.data.errMsg;
										}else{
											response.data.provCheckErrorMsg += "未返回错误信息，可能是下省请求超时，请返回填单页面并稍后重试订单提交。";
										}
									
										var returnData = _gotosubmitOrder(response.data);
										_orderConfirm(returnData);								
									}
								}else{
									var returnData = _gotosubmitOrder(response.data);
									_orderConfirm(returnData);
								}
							}else{
								$.alertM(response.data);
//								_getToken();
								OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
								OrderInfo.resetSeq(); //重置序列
							}
						} catch (e) {
							try {
				    			
					    	} catch (e2) {
					    	}
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
		} finally{
			//如果是同步请求，在finally中 重置标识位；如果为异步请求，在请求处理完成时，重置标识位
			if(!async){ 
				_completeSubmitOrder();
			}
		}	
	};
	
	var _gotosubmitOrder = function(orderdata){
			var url = contextPath+"/order/gotosubmitOrder";
			$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
			var response = $.callServiceAsHtml(url,JSON.stringify(orderdata));
			$.unecOverlay();
			return response.data;
	};
	
	//填充订单信息
	var _getOrderInfo = function(data){
		if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18 || OrderInfo.actionFlag==37 || OrderInfo.actionFlag==38){ //终端购买、退换货
			//如果是合约机换货，已经加载缓存
			if (OrderInfo.actionFlag==18 && data.boActionType.actionClassCd==CONST.ACTION_CLASS_CD.OFFER_ACTION) {
				
			} else {
				query.offer.loadInst(); //加载实例到缓存
			}
			if(OrderInfo.actionFlag==37){
				zdyycouponSale(data);
			}else{
				couponSale(data);
			}
			
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
		//返档订单备注信息
		var response = $.callServiceAsJson(contextPath+"/common/queryPortalProperties",{propertiesKey : "RETURN_ACCOUNT_FLAG"});
		if(OrderInfo.actionFlag==43&&response!=undefined&&response.data!=undefined){
			if(response.data=="ON"&&OrderInfo.orderDataRemark!=undefined&&OrderInfo.orderDataRemark!=""){
					custOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,	    				
			            value : $.trim(OrderInfo.orderDataRemark)//订单备注
					}) ;
			}
		}
		//可选包变更,提交订单时将客户等级信息拼装到订单属性
		if(OrderInfo.actionFlag==3){
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.itemSpecID,//客户等级属性标识ID
				value : OrderInfo.cust.vipLevel
			});
		}
		custOrderAttrs.push({
			itemSpecId : CONST.BUSI_ORDER_ATTR.THRETOFOUR_ITEM,//3转4标志
			value : itemValue
		});
		custOrderAttrs.push({ //订单时长
			itemSpecId : "111111113",
			value : OrderInfo.orderlonger
		});
		custOrderAttrs.push({ //浏览器类型版本
			itemSpecId: "800000046",
			value: CacheData.getBrowserTypeVersion()
		});
		custOrderAttrs.push({ //useragent
			itemSpecId: "800000047",
			value: navigator.userAgent
		});
		custOrderAttrs.push({ //鉴权日志id
			itemSpecId: "800000048",
			value: CacheData.getRecordId()
		});
		custOrderAttrs.push({ //业务类型
			itemSpecId : CONST.BUSI_ORDER_ATTR.BUSITYPE_FLAG,
			value : order.prepare.isPreInstall() ? 27 : OrderInfo.busitypeflag
		});
		custOrderAttrs.push({ //定位客户时长
			itemSpecId : "30010050",
			value : OrderInfo.custorderlonger
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
		var  val = "";
		var val2 = "";
		if (ec.util.isObj(remark)) {
			if (OrderInfo.actionFlag == 23) {
				val = $("#_session_staff_info").attr("areaAllName");
				val2 = val.substring(val.indexOf(" > ") + 2, val.length);
				if (val2.indexOf(" > ") != -1) {
					val2 = val2.substring(0, val2.indexOf(" > "));
				}
				remark = remark + "|" + val.substring(0, val.indexOf(" > "))
						+ val2 + " " + OrderInfo.staff.channelCode + " "
						+ OrderInfo.staff.staffCode;
			}
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});
		} else if (OrderInfo.actionFlag == 23) {// 异地补换卡
			val = $("#_session_staff_info").attr("areaAllName");
			val2 = val.substring(val.indexOf(" > ") + 2, val.length);
			if (val2.indexOf(" > ") != -1) {
				val2 = val2.substring(0, val2.indexOf(" > "));
			}
			remark = "|" + val.substring(0, val.indexOf(" > ")) + val2 + " "
					+ OrderInfo.staff.channelCode + " " + OrderInfo.staff.staffCode;
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});
		}
		
		//订单购物车属性(经办人)
		if(CONST.getAppDesc()==0){
			var orderAttrName = $.trim($("#orderAttrName").val()); //经办人姓名
			var orderIdentidiesTypeCd = $("#orderIdentidiesTypeCd  option:selected").val(); //证件类型
			var orderAttrIdCard =$.trim($("#orderAttrIdCard").val()); //证件号码
			var orderAttrAddr = $.trim($("#orderAttrAddr").val()); //地址
			var orderAttrPhoneNbr = $.trim($("#orderAttrPhoneNbr").val()); //联系人号码
			// 新建客户或二次业务，政企客户，经办人必填 （2016-3-17回退）
			/*if (OrderInfo.boCustInfos.partyTypeCd == '2' || order.cust.isCovCust(OrderInfo.cust.identityCd)) {
				if (!(ec.util.isObj(orderAttrName) && ec.util.isObj(orderAttrIdCard) && ec.util.isObj(orderAttrAddr) && ec.util.isObj(orderAttrPhoneNbr))) {
					$.alert("提示", "政企单位用户经办人为必填项！");
					return false;
				}
			}*/
			if(ec.util.isObj(orderAttrName)&&ec.util.isObj(orderAttrIdCard)&&ec.util.isObj(orderAttrPhoneNbr)&&ec.util.isObj(orderAttrAddr)){
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
			}else if(ec.util.isObj(orderAttrName)||ec.util.isObj(orderAttrIdCard)||ec.util.isObj(orderAttrPhoneNbr)||ec.util.isObj(orderAttrAddr)){
				if(!ec.util.isObj(orderAttrName)){
					$.alert("提示","经办人姓名为空，经办人姓名、联系人号码、证件号码、证件地址必须同时为空或不为空，因此无法提交！");
					return false;
				}
				if(!ec.util.isObj(orderAttrPhoneNbr)){
					$.alert("提示","联系人号码为空，经办人姓名、联系人号码、证件号码、证件地址必须同时为空或不为空，因此无法提交！");
					return false;
				}
				if(!ec.util.isObj(orderAttrIdCard)){
					$.alert("提示","证件号码为空，经办人姓名、联系人号码、证件号码、证件地址必须同时为空或不为空，因此无法提交！");
					return false;
				}
				if(!ec.util.isObj(orderAttrAddr)){
					$.alert("提示","证件地址为空，经办人姓名、联系人号码、证件号码、证件地址必须同时为空或不为空，因此无法提交！");
					return false;
				}
			}
		}
		if(OrderInfo.saveOrder.olId!=""){
			custOrderAttrs.push({
				itemSpecId : "800000035",
				value : OrderInfo.saveOrder.olId
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
		}else if (OrderInfo.actionFlag==10 || OrderInfo.actionFlag==43){ //传到节点busiOrder 
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
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.CHANGE_CARD_ORDER_TYPE,
				value : "1"
			});
			custOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.CHANGE_CARD_AREA_ID,
				value : $("#p_cust_areaId").val()
			});
		}else if(OrderInfo.actionFlag == 40){//紧急开机
			_createUrgentBoot(busiOrders,data,"N");
		}else if(OrderInfo.actionFlag == 28){//主副卡成员角色互换
			_buildBusiOrders(data, busiOrders);
		}else{  //默认单个业务动作
			_fillBusiOrder(busiOrders,data,"N"); //填充业务对象节点
		}
		OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs = custOrderAttrs; //订单属性数组
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = busiOrders; //订单项数组
		if($("#isTemplateOrder").attr("checked")=="checked"){ //批量订单
			OrderInfo.orderData.orderList.orderListInfo.isTemplateOrder ="Y";
			OrderInfo.orderData.orderList.orderListInfo.templateOrderName =$("#templateOrderName").val();
			if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==14){
				OrderInfo.orderData.orderList.orderListInfo.templateType = $("#templateOrderDiv").find("select").val(); //批量换档
			}else if(OrderInfo.actionFlag==2){
				OrderInfo.orderData.orderList.orderListInfo.templateType = 5; //批量换档
			}else if(OrderInfo.actionFlag==3){
				OrderInfo.orderData.orderList.orderListInfo.templateType = 2; //批量可选包订购退订
			}
			
			if(OrderInfo.actionFlag==1){
				var shareArea = "";
				//如果共享本地网，则传8320100，如果共享本省，则传8320000。
				if($("#shareType").val() == "1"){ // 本地网
					shareArea = OrderInfo.getAreaId().substring(0,5) + "00";
				}
				else if($("#shareType").val() == "2"){ // 本省
					shareArea = OrderInfo.getAreaId().substring(0,3) + "0000";
				}
				OrderInfo.orderData.orderList.orderListInfo.shareArea = shareArea;
			}
		}else{
			OrderInfo.orderData.orderList.orderListInfo.isTemplateOrder ="N";
		}
		if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
			OrderInfo.orderData.orderList.orderListInfo.soNbr = OrderInfo.order.soNbr;
		}
		if(OrderInfo.termReserveFlag == CONST.OL_TYPE_CD.ZDYY){
			OrderInfo.orderData.orderList.orderListInfo.olTypeCd = CONST.OL_TYPE_CD.ZDYY;
		}else{
			OrderInfo.orderData.orderList.orderListInfo.olTypeCd = CONST.OL_TYPE_CD.FOUR_G;
		}
		if (order.prepare.isPreInstall()) {
			OrderInfo.orderData.orderList.orderListInfo.custOrderType = 27;
		}
		if (OrderInfo.actionFlag == 28) {
			//主副卡互换拼装custOrderType节点，表示业务类型，用于后台落表，与属性CONST.BUSI_ORDER_ATTR.BUSITYPE_FLAG一样
			OrderInfo.orderData.orderList.orderListInfo.custOrderType = OrderInfo.actionFlag;//或OrderInfo.busitypeflag
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
		if (OrderInfo.actionFlag == 18 || OrderInfo.actionFlag == 38) {
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
		if(OrderInfo.actionFlag==38){
			busiOrder.boRelas = data.boRelas;
		};
		busiOrder.data.bo2Coupons = coupons;
		if (data.dealers) {
			busiOrder.data.busiOrderAttrs = data.dealers;
		};
		busiOrders.push(busiOrder);
	};
	
	//终端预约
	var zdyycouponSale = function(data){
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
		OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs = data.custOrderAttrs;
		//填入订单
		$.each(data.terminalList,function(){
			var zdyynum = this.zdyynum;
			for(var i=0;i<zdyynum;i++){
			var busiOrder = {
					areaId : OrderInfo.getAreaId(),  //受理地区ID		
					busiOrderInfo : {
						seq : OrderInfo.SEQ.seq--
					}, 
					busiObj : this.busiObj,  
					boActionType : this.boActionType, 
					data:{
						bo2Coupons:[]
					}
				};
				busiOrder.data.bo2Coupons = this.coupons;
				busiOrder.data.busiOrderAttrs = [];
				if (this.yyType) {
					busiOrder.data.busiOrderAttrs.push(this.yyType);
				}
				if (this.cfgRuleId) {
					busiOrder.data.busiOrderAttrs.push(this.cfgRuleId);
				}
				busiOrders.push(busiOrder);
			}
		});
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
					if(OrderInfo.isGroupProSpec(this.objId)){
					    $("#orderTbody").append("<tr><td>群号</td><td>"
								+ order.main.BIZID +"</td></tr> ");
					}else{
						$("#orderTbody").append("<tr ><td>"+this.offerRoleName+"号码：</td><td>"
								+OrderInfo.getProdAn(this.prodInstId).accessNumber+"</td></tr> ");
					}
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
		}else if(OrderInfo.actionFlag==37){
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#order_tab_panel_content").hide();
			$("#zdyypage").hide();
			$("#tijiao").hide();
			$("#orderTbody").append("<tr><td>终端名称</td><td>终端颜色</td><td>预约类型</td><td>预约政策</td><td>预约数量</td></tr>");
			$.each(OrderInfo.terminalList,function(){
				var $newTr = $("<tr></tr>");
				$newTr.append("<td>"+this.zdyyTerminalListInfo.mktResName+"</td>");
				$newTr.append("<td>"+this.zdyyTerminalListInfo.color+"</td>");
				$newTr.append("<td>"+this.zdyyTerminalListInfo.yyType+"</td>");
				$newTr.append("<td>"+this.zdyyTerminalListInfo.yyPolicy+"</td>");
				$newTr.append("<td>"+this.zdyyTerminalListInfo.zdyynum+"</td>");
				$("#orderTbody").append($newTr);
			});
		}else if(OrderInfo.actionFlag==38){//终端预约退订
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#order_tab_panel_content").hide();
			$("#d_query").hide();
			$("#tab_orderList").hide();
			$("#orderTbody").append("<tr><td >终端名称：</td><td>"+OrderInfo.businessName+"</td></tr>");
			var busiOrder = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;
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
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
					if(this.objType==CONST.OBJ_TYPE.PROD){
						$("#orderTbody").append("<tr ><td>"+this.roleName+"号码：</td><td>"+this.accessNumber+"</td></tr> ");
					}
				});
				$.each(OrderInfo.boProdAns,function(){
					$("#orderTbody").append("<tr ><td>纳入副卡号码：</td><td>"+this.accessNumber+"</td></tr> ");	
				});
				if(ec.util.isArray(OrderInfo.oldAddNumList)){
					/*for(var i=0;i<OrderInfo.oldAddNumList.length;i++){
						$("#orderTbody").append("<tr ><td>纳入副卡号码：</td><td>"+OrderInfo.oldAddNumList[i].accNbr+"</td></tr> ");	
					}*/
					for(var j=0;j<OrderInfo.oldoffer.length;j++){
						for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
							var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
							if(offerMember.objType==CONST.OBJ_TYPE.PROD){
								$("#orderTbody").append("<tr ><td>纳入副卡号码：</td><td>"+offerMember.accessNumber+"</td></tr> ");	
							}
						}
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
			} else if (OrderInfo.actionFlag==39){ //改付费类型
				OrderInfo.actionTypeName = "修改付费类型";
			} else if (OrderInfo.actionFlag==28){ //主副卡角色互换
				OrderInfo.actionTypeName = "主副卡角色互换";
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
			if(OrderInfo.orderBusiHint!=null && OrderInfo.orderBusiHint.length>0 && isYWTX == "ON"){
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
				if(this.instAccessNumber==OrderInfo.getAccessNumber(prodId)){
					$("#chooseTable").append($('<tr><td width="50%">'+this.specName+'</td><td>'+this.boActionTypeName+'</td></tr>'));
				}
			});
		}
	};
	
	//订单返回
	var _orderBack = function(){
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
		}else if(OrderInfo.actionFlag==37){
			$("#zdyypage").show();
			$("#tijiao").show();
		}else if(OrderInfo.actionFlag==38){
			$("#d_query").show();
			$("#tab_orderList").show();
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
			$.callServiceAsJsonGet(contextPath+"/order/delOrder",param,{
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
		if(olId!=0 && olId!=undefined && olId != null && OrderInfo.saveOrder.flag!="true"){  //作废购物车
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
		var offerBusiOrder = {};
		var delFlag = false;
		$.each(AttachOffer.mainCartOpenedList,function(){//共享套餐级可选包
			var mainCartOpenedList = this;
			$.each(this.offerLists,function(){
				var offerList = this;
				if(this.offerRoleId=="600"){
					$.each(newData,function(){
						if(this.objInstId==mainCartOpenedList.prodId){
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
										objInstId : this.objInstId,
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
							delFlag = true;
						}
					});
				}
			});
		});
		if(!delFlag){
			$.each(AttachOffer.mainCartOpenedList,function(){//共享套餐级可选包
				var mainCartOpenedList = this;
				$.each(this.offerLists,function(){
					var offerList = this;
					if(this.offerRoleId=="600"){
						offerBusiOrder = {
								areaId : OrderInfo.getProdAreaId(this.objInstId),  //受理地区ID
								busiOrderInfo : {
									seq : OrderInfo.SEQ.seq--
								}, 
								busiObj : { //业务对象节点
									objId : offerList.offerSpecId,  //业务规格ID
									instId : offerList.offerId, //业务对象实例ID
									accessNumber : mainCartOpenedList.accessNumber, //业务号码
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
							var offerMemberInfos = this;
							$.each(newData,function(){
								if(offerMemberInfos.objInstId == this.objInstId){
									var ooRole = {
											objId : this.objId,
											objInstId : this.objInstId,
											objType : this.objType,
											offerRoleId : this.offerRoleId,
											state : "DEL"
										};
									offerBusiOrder.data.ooRoles.push(ooRole);
								}
							});
						});
					}
				});
			});
		}
		if(ec.util.isObj(offerBusiOrder.areaId)){
			busiOrders.push(offerBusiOrder);
		}
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
			//保留副卡订购新套餐副卡新套餐销售参数节点
			if(ec.util.isArray(offerSpec.offerSpecParams)){  
				busiOrder2.data.ooParams = [];
				for (var k = 0; k < offerSpec.offerSpecParams.length; k++) {
					var param = offerSpec.offerSpecParams[k];
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
						busiOrder2.data.ooParams.push(ooParam);
					}
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
		var offerBusiOrder = {};
		var delFlag = false;
		$.each(AttachOffer.mainCartOpenedList,function(){//共享套餐级可选包
			var mainCartOpenedList = this;
			$.each(this.offerLists,function(){
				var offerList = this;
				if(this.offerRoleId=="600"){
					if(prod.prodInstId==mainCartOpenedList.prodId){
						offerBusiOrder = {
								areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID		
								busiOrderInfo : {
									seq : OrderInfo.SEQ.seq--
								}, 
								busiObj : { //业务对象节点
									objId : objId,//prodInfo.productId, //业务对象规格ID
									instId : instId, //业务对象实例ID
									accessNumber : prod.accNbr,   //业务号码
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
									objInstId : this.objInstId,
									objType : this.objType,
									offerRoleId : this.offerRoleId,
									state : "DEL"
								};
							if(this.objType=="2"){
								ooRoles.prodId = this.objInstId;
								ooRoles.objInstId = this.objInstId;
								offerBusiOrder.data.ooRoles.push(ooRole);
								if(boActionTypeCd==CONST.BO_ACTION_TYPE.BUY_BACK_ORDER_CONTRACT){
									delete  offerBusiOrder.data.ooRoles;
								};
							}
						});
						delFlag = true;
					}
				}
			});
		});
		if(!delFlag){
			$.each(AttachOffer.mainCartOpenedList,function(){//共享套餐级可选包
				var mainCartOpenedList = this;
				$.each(this.offerLists,function(){
					var offerList = this;
					if(this.offerRoleId=="600"){
						offerBusiOrder = {
								areaId : OrderInfo.getProdAreaId(this.objInstId),  //受理地区ID
								busiOrderInfo : {
									seq : OrderInfo.SEQ.seq--
								}, 
								busiObj : { //业务对象节点
									objId : offerList.offerSpecId,  //业务规格ID
									instId : offerList.offerId, //业务对象实例ID
									accessNumber : mainCartOpenedList.accessNumber, //业务号码
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
							if(this.objInstId == prod.prodInstId){
								var ooRole = {
										objId : this.objId,
										objInstId : this.objInstId,
										objType : this.objType,
										offerRoleId : this.offerRoleId,
										state : "DEL"
									};
								offerBusiOrder.data.ooRoles.push(ooRole);
								if(boActionTypeCd==CONST.BO_ACTION_TYPE.BUY_BACK_ORDER_CONTRACT){
									delete  offerBusiOrder.data.ooRoles;
								};
							}
						});
					}
				});
			});
		}
		if(ec.util.isObj(offerBusiOrder.areaId)){
			busiOrders.push(offerBusiOrder);
		}
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
		$.each(AttachOffer.mainCartOpenedList,function(){//共享套餐级可选包
			var mainCartOpenedList = this;
			$.each(this.offerLists,function(){
				if(this.offerRoleId=="600"){
					offerBusiOrder = {
							areaId : prodInfo.areaId,  //受理地区ID
							busiOrderInfo : {
								seq : OrderInfo.SEQ.seq--
							}, 
							busiObj : { //业务对象节点
								objId : this.offerSpecId,  //业务规格ID
								instId : this.offerId, //业务对象实例ID
								accessNumber : mainCartOpenedList.accessNumber, //业务号码
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
				}
			});
		});
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
							boActionTypeCd : action_type
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
								if(ec.util.isObj(offerBusiOrder.areaId)){
									ooRole.offerRoleId = "601";
									offerBusiOrder.data.ooRoles.push(ooRole);
								}
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
			if(ec.util.isObj(offerBusiOrder.areaId)){
				busiOrders.push(offerBusiOrder);
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
		}else{
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
	var _createAttOrder = function (busiOrders) {
		AttachOffer.setAttachBusiOrder(busiOrders);
		var prodInfo = order.prodModify.choosedProdInfo;
		if (OrderInfo.boProd2Tds.length > 0 || (OrderInfo.zcd_privilege == 0 && AttachOffer.isChangeUim(prodInfo.prodInstId))) {
			var prod = {
				prodId: prodInfo.prodInstId,
				prodSpecId: prodInfo.productId,
				isComp: "N",
				accessNumber: prodInfo.accNbr,
				boActionTypeCd: CONST.BO_ACTION_TYPE.CHANGE_CARD
			};
			busiOrders.push(OrderInfo.getProdBusiOrder(prod));
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
		var offerSpecParams = OrderInfo.offerSpec.offerSpecParams;//mark
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
		
		//发展人
		var $tr = $("#dealerTbody tr[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
					value : $(this).find("input").attr("staffid"),
					channelNbr : $(this).find("select[name ='dealerChannel_"+OrderInfo.offerSpec.offerSpecId+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				var dealer_name = { 
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
						role : $(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
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
				boProdStatuses : [], //产品状态节点
				busiOrderAttrs : [] //订单属性节点
			}
		};
		if(OrderInfo.isGroupProSpec(prodSpecId)){
			busiOrder.boActionType.boActionTypeCd="4010100001";
		}
		var prodStatus = CONST.PROD_STATUS_CD.NORMAL_PROD;
		if($("#isActivation").attr("checked")=="checked"){//首话单激活
			prodStatus = CONST.PROD_STATUS_CD.DONE_PROD;
		}else if($("#isTemplateOrder").attr("checked")=="checked"){ //批量订单
			if($("#templateOrderDiv").find("select").val()==0){ //批量开活卡
				prodStatus = CONST.PROD_STATUS_CD.READY_PROD;	
			}
		} else if (order.prepare.isPreInstall()) {//用户预装
			prodStatus = CONST.PROD_STATUS_CD.READY_PROD;
		}
		//封装产品状态节点
		busiOrder.data.boProdStatuses.push({
			state : "ADD",
			prodStatusCd : prodStatus
		});	
			
		//封装号码信息节点
		if(OrderInfo.isGroupProSpec(prodSpecId)){
			var bizid = order.main.BIZID;
			var anId = "";
			if(bizid.length>12){
				anId = bizid.substring(0,12);
			}else{
				anId = bizid;
			}
			var boProdAns={
					prodId : "", //从填单页面头部div获取
					accessNumber : bizid, //接入号
					anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
					anId : anId, //接入号ID
					anTypeCd : "4", //号码类型
					state : "ADD", //动作	,新装默认ADD	
					areaId:OrderInfo.getProdAreaId(prodId),
					areaCode:"",
					memberRoleCd:""
				};
			busiOrder.data.boProdAns.push(boProdAns);
			busiOrder.busiObj.accessNumber = bizid;
		}else{
			var boProdAns = OrderInfo.boProdAns;
			for ( var i = 0; i < boProdAns.length; i++) {
				if(boProdAns[i].prodId==prodId){
					busiOrder.data.boProdAns.push(boProdAns[i]);
					busiOrder.busiObj.accessNumber = boProdAns[i].accessNumber;
					break;
				}
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
//			$tr = $("#dealerTbody tr[name='tr_"+prodId+"']");
		}else{
			objInstId_dealer = OrderInfo.offerSpec.offerSpecId;
//			$tr = $("#dealerTbody tr[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		}
		$tr = $("#dealerTbody tr[name='tr_"+objInstId_dealer+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select[name ='dealerType_"+objInstId_dealer+"']").val(),
					value : $(this).find("input").attr("staffid"),
					channelNbr : $(this).find("select[name ='dealerChannel_"+objInstId_dealer+"']").val()
					
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				var dealer_name = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
						role : $(this).find("select[name ='dealerType_"+objInstId_dealer+"']").val(),
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
			if(order.service.oldMemberFlag){
				var paytype=$('select[name="pay_type_-1"]').val();
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.feeType.feeType!=paytype){
						$.alert("提示",this.accNbr+"和主卡的付费类型不一致！");
						return false ; 
					}
				});
			}
			//校验号码跟UIM卡
			if(!(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6)){
				for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
					var offerRole = OrderInfo.offerSpec.offerRoles[i];
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
									if(!OrderInfo.isGroupProSpec(prodInst.objId)){
										$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
										return false;
									}
								} 
								if(OrderInfo.getProdTd(prodInst.prodInstId)==""&&(OrderInfo.zcd_privilege!=0||OrderInfo.actionFlag == 14)){
									if(!OrderInfo.isGroupProSpec(prodInst.objId)){
										if($("#uim_txt_"+prodInst.prodInstId).val() !=""){
											$.alert("信息提示","请先校验【接入产品("+offerRole.offerRoleName+")】UIM卡！");
										}else{
											$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】UIM卡不能为空！");
										}
										$("#uim_txt_"+prodInst.prodInstId).css("border-color","red");
										return false;
									}
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
								if(!OrderInfo.isGroupProSpec(prodInst.objId)){
									$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
									return false;
								}
							} 
							if(OrderInfo.getProdTd(prodInst.prodInstId)==""&&(OrderInfo.zcd_privilege!=0||OrderInfo.actionFlag == 14)){
								if(!OrderInfo.isGroupProSpec(prodInst.objId)){
									if($("#uim_txt_"+prodInst.prodInstId).val() !=""){
										$.alert("信息提示","请先校验【接入产品("+offerRole.offerRoleName+")】UIM卡！");
									}else{
										$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】UIM卡不能为空！");
									}
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
						//属性A的值会影响属性B是否必填
						var prodAttrRelationFlag = false;
						var prodAttrRelationName = null;
						var prodAttrName = null;
						var prodAttrText = null;
						$(OrderInfo.prodAttrs).each(function(){
							if(!prodAttrRelationFlag){
								var val=$.trim($("#"+this.id).val());
								prodAttrName = this.name;
							    $(this.valueRange).each(function(){
							    	valueRan = this;
	                                if(val == this.value){
	                                	$(this.itemRelation).each(function(){
	                                        if(this.minQty!=null && this.minQty != "" && this.minQty == 1){
	                                        	var itemRelVal=$.trim($("#"+this.itemRelId).val());
	                                        	if(itemRelVal == "" || itemRelVal == undefined){
	                                        		prodAttrRelationFlag = true;
	                        						prodAttrRelationName = this.itemSpecName;
	                        						prodAttrText = valueRan.text;
	        									}
	                                        }
	                                        
	        						    });
	                                }
							    });
							}
						});
						if(prodAttrRelationFlag){
                    		$.alert("信息提示","产品属性（"+prodAttrRelationName+"）未配置，无法提交，失败原因：产品属性（"+prodAttrName+"）选择'"+prodAttrText+"'时，产品属性（"+prodAttrRelationName+"）为必填。");
							return false;
						}
						//校验必填的产品属性和是否有重复的产品属性
						var prodAttrEmptyFlag = false; //必填产品属性是否已输入
						var prodAttrRepeatFlag = false; //是否包含重复的产品属性
						var prodAttrEmptyCheckName = null;
						var prodAttrRepeatCheckName = null;
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
						});
						//加载副卡使用人可以为空 redmine926533
						if(prodAttrEmptyCheckName =='使用人' && (OrderInfo.actionFlag =='6' || OrderInfo.roleType=="Y")){
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
			//update by jinjian，redmine 33877，取消原有的UIM卡和无线上网卡以及移动电话业务的关联，任意UIM卡都可以受理无线上网卡和移动电话业务
			//判断UIM卡校验是否与当前业务匹配 
//			for ( var i = 0; i < OrderInfo.checkUimData.length; i++) {
//				var uimData = OrderInfo.checkUimData[i];
//				if (uimData.isWireBusi == 1) { // 上网卡 - 移动电话业务
//					$.alert("提示", "选择的UIM卡为【" + uimData.uimCode
//							+ "+" + uimData.uimName
//							+ "】，无法办理移动电话产品，请使用普通UIM卡办理业务。");
//					return false;
//				} else if (uimData.isWireBusi == 2) { // 普通卡 - 无线业务
//					$.alert("提示", "选择的UIM卡为【" + uimData.uimCode
//							+ "+" + uimData.uimName
//							+ "】，无法办理天翼宽带-无线上网产品，请使用数据卡类型的UIM卡办理业务。");
//					return false;
//				}
//			}
			//主销售参数设置校验 
			if(OrderInfo.actionFlag == 1||OrderInfo.actionFlag == 2){
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
								$.alert("提示",roleName+"【"+spec.offerSpecName+"】：参数未设置");
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
								$.alert("提示",roleName+" 【"+spec.servSpecName+"】：参数未设置");
								return false ; 
							}
						}
					}
				}
			}
			if(OrderInfo.zcd_privilege!=0){
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
				}else if(OrderInfo.actionFlag == 21){//主副卡变更，副卡换套餐
					if(ec.util.isArray(OrderInfo.viceOfferSpec)){//多张副卡同时进行换档
						var flag=false;
						$.each(OrderInfo.viceOfferSpec,function(){
							var prodId=this.prodId;
							for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
								var member = OrderInfo.offer.offerMemberInfos[i];
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
						if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14){ //新装
							var uim = OrderInfo.getProdUim(prodId);
							if(uim.cardTypeFlag=="2"){ //3g卡
								$.alert("信息提示","您已开通【4G（LTE）上网】功能产品，不能使用3G卡，故无法提交");
								return false;
							}
							if(_isThreeTerminal(termTypeFlags,isTerminal)){
								$.alert("信息提示","您已开通【4G（LTE）上网】功能产品，不能使用3G终端，故无法提交");
								return false;
							}
						}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3 || OrderInfo.actionFlag == 21){
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
					}else{//没有开通4G功能产品 就判断UIM卡和终端的类型要一致，4G终端匹配4GUIM卡 3G终端匹配3GUIM卡
						//if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14){ //新装
							//if(isTerminal){
							//	var uim = OrderInfo.getProdUim(prodId);
							//	var threeOrFour=false;
							//	if(ec.util.isObj(uim) && ec.util.isObj(uim.cardTypeFlag)){
							//		$.each(termTypeFlags,function(){
							//			if(this.termTypeFlag!=uim.cardTypeFlag){
							//				var uimtype=uim.cardTypeFlag=="1"?"4G卡":"3G卡";
							//				var termtype=this.termTypeFlag=="1"?"4G机型":"3G机型";
							//				$.alert("信息提示",roleName+"中UIM卡是"+uimtype+" 终端是"+termtype+"，无法提交");
							//				threeOrFour=true;
							//				return false;
							//			}
							//		});
							//	}
							//	if(threeOrFour){ //终端和卡不匹配
							//		return false;
							//	}
							//}
						//}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3 || OrderInfo.actionFlag == 21){
							//if(isTerminal){
								//var currentUimCoupon = OrderInfo.getProdUim(prodId); //当前uim卡物品信息，做套餐变更或可选包变更时可能带出补换卡业务，提交时使用新的uim检验终端
								//if(ec.util.isObj(currentUimCoupon) && ec.util.isObj(currentUimCoupon.cardTypeFlag)){ //补换卡
								//	var fourTerminal=false;
								//	$.each(termTypeFlags,function(){
								//		if(this.termTypeFlag=="1"){
								//			fourTerminal=true;
								//			return false;
								//		}
								//	});
									//if(currentUimCoupon.cardTypeFlag=="2" && fourTerminal){
									//	$.alert("信息提示",roleName+"中UIM卡是3G卡 终端是4G机型，无法提交");
									//	return false;
									//}
									//if(currentUimCoupon.cardTypeFlag=="1" && _isThreeTerminal(termTypeFlags,isTerminal)){
									//	$.alert("信息提示",roleName+"中UIM卡是4G卡 终端是3G机型，无法提交");
									//	return false;
									//}
								//} else {  //未做补换卡
									//var oldUim = OrderInfo.getProdOldUim(prodId);
									//if(ec.util.isObj(oldUim.is4GCard)){
									//	if(oldUim.is4GCard!="Y"){//旧卡不是4G卡
									//		var fourTerminal=false;
									//		$.each(termTypeFlags,function(){
									//			if(this.termTypeFlag=="1"){
									//				fourTerminal=true;
									//				return false;
									//			}
									//		});
									//		if(fourTerminal){
									//			$.alert("信息提示",roleName+"中UIM卡是3G卡 终端是4G机型，无法提交");
									//			return false;
									//		}
									//	}else{
									//		if(_isThreeTerminal(termTypeFlags,isTerminal)){
									//			$.alert("信息提示",roleName+"中UIM卡是4G卡 终端是3G机型，无法提交");
									//			return false;
									//		}
									//	}
									//}
								//}
							//
							//}
						//}
					}
				}
			} //TODO tmp for Mantis 0042657
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
			if(OrderInfo.boProd2Tds[i].uimType == "2"){//表示这个订单是白卡，更新uim订单状态的时候需要转换下uim卡号
				var serviceName = contextPath + "/mktRes/writeCard/getAsciiToHex";
				var asciiFStr = OrderInfo.boProd2Tds[i].couponInstanceNumber.substring(OrderInfo.boProd2Tds[i].couponInstanceNumber.length-4,OrderInfo.boProd2Tds[i].couponInstanceNumber.length);
				var param = {
					"asciiFStr":asciiFStr       
				};
				var response = $.callServiceAsJson(serviceName, param);
				
				var selUimCard = OrderInfo.boProd2Tds[i].couponInstanceNumber.substring(0,OrderInfo.boProd2Tds[i].couponInstanceNumber.length-4)+response.data.asciiStr;
				var res = {
						accNbr :selUimCard,
						accNbrType : 3,  //号码类型（1手机号码2.UIM卡）
						action : "UPDATE"
					};
			}else{
				var res = {
						accNbr :OrderInfo.boProd2Tds[i].terminalCode,
						accNbrType : 2,  //号码类型（1手机号码2.UIM卡）
						action : "UPDATE"
					};
			}
			
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
				$(".share_info_type").show();
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
			$(".share_info_type").hide();
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
	
	var _saveOrderSubmit = function(){
		var params = {
				"areaId":OrderInfo.getAreaId(),
				"custOrderAttrs":[{
					"itemSpecId":"111111198",
					"value":"0"
				}],
				"olId":OrderInfo.orderResult.olId
				};
		$.callServiceAsJson(contextPath+"/order/saveOrderAttrs",JSON.stringify(params), {
			"before":function(){
				$.ecOverlay("<strong>订单暂存中，请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				_getToken();
				if (response.code == 0) {
					$.alert("提示","订单暂存成功");
					OrderInfo.saveOrder.flag = "true";
					$("#orderSave").removeClass("btna_o").addClass("btna_g").off("click");
					$('#orderSave').removeAttr("onclick");
				}else{
					$.alertM(response.data);
				}
			}
		});
	};
	
	//紧急开机
	var _createUrgentBoot = function(busiOrders,data,isComp){	
		var prod = order.prodModify.choosedProdInfo; //获取产品信息 
		var boActionTypeCd= OrderInfo.boActionTypeCd;
		var objId= prod.productId;
		var instId=prod.prodInstId;
		var dateStr = DateUtil.Format("yyyymmddhhmmssx",new Date());
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : objId,//prodInfo.productId, //业务对象规格ID
				instId : instId, //业务对象实例ID
				isComp : isComp, //是否组合
				accessNumber : prod.accNbr //业务号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.TEMPORARY_CREDIT
			}, 
			data:{
				boTempCreditLimit:[{
					applyDate:dateStr,
					applyStaff:OrderInfo.staff.staffId,
					creditLimitId:OrderInfo.creditLimitId,
					state:"ADD",
					statusCd:"1000",
					tempCreditLimitId:"-1"
				}]
			}
		};
		busiOrders.push(busiOrder);
		var busiOrder = {
				areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID		
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				}, 
				busiObj : { //业务对象节点
					objId : objId,//prodInfo.productId, //业务对象规格ID
					instId : instId, //业务对象实例ID
					isComp : isComp, //是否组合
					accessNumber : prod.accNbr //业务号码
				},  
				boActionType : {
					actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
					boActionTypeCd : boActionTypeCd
				}, 
				data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
		
	};
	
	/**
	 * 主副卡互换，填充业务动作节点
	 */
	var _buildBusiOrders = function(param, busiOrders){
		var prodInfo = order.prodModify.choosedProdInfo;
		//创建业务主节点
		var busiOrder = {
			areaId : prodInfo.areaId,  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId		: prodInfo.prodOfferId,  //业务规格ID
				instId		: prodInfo.prodOfferInstId, //业务对象实例ID
				accessNumber: prodInfo.accNbr, //业务号码
				isComp		: "Y", //是否组合
				offerTypeCd : "1" //1主销售品
			},  
			boActionType : {
				actionClassCd	: CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd	: CONST.BO_ACTION_TYPE.ADDOREXIT_COMP
			}, 
			data:{
				ooRoles			:[],
				busiOrderAttrs	:[]
			}
		};

		var sub_ooRole = null;//副卡的ooRole
		var main_ooRole = null;//主卡的ooRole
		//循环遍历，确定需要互换的两个主副卡节点信息
		for(var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
			var offerMemberInfo = OrderInfo.offer.offerMemberInfos[i];
			//确定副卡并且与所选择的副卡号码相等，将其退订
			if((offerMemberInfo.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD) && offerMemberInfo.accessNumber == param.subAcctNbr){
				sub_ooRole = {
					objId 		 : offerMemberInfo.objId,//产品规格ID
					objInstId	 : offerMemberInfo.objInstId,//产品实例ID
					objType 	 : offerMemberInfo.objType,//产品接入类型，2接入类产品，4功能类产品
					offerMemberId: offerMemberInfo.offerMemberId,//成员的实例ID
					offerRoleId	 : offerMemberInfo.offerRoleId,//成员角色ID，表示主副卡
					state 		 : "DEL"
				};
			}
			//确定主卡并且与所选择的主卡号码相等，将其退订
			if(offerMemberInfo.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD && offerMemberInfo.accessNumber == param.mainAcctNbr){
				main_ooRole = {
					objId 		 : offerMemberInfo.objId,//产品规格ID
					objInstId	 : offerMemberInfo.objInstId,//产品实例ID
					objType 	 : offerMemberInfo.objType,//产品接入类型，2接入类产品，4功能类产品
					offerMemberId: offerMemberInfo.offerMemberId,//成员的实例ID
					offerRoleId	 : offerMemberInfo.offerRoleId,//成员角色ID，表示主副卡：30045主卡，30046副卡
					state 		 : "DEL"
				};
			}
		}

		var tempOfferRoleId = sub_ooRole.offerRoleId;//临时变量，副卡offerRoleId

		//1.退订副卡
		busiOrder.data.ooRoles.push(sub_ooRole);
		//2.退订主卡
		busiOrder.data.ooRoles.push(main_ooRole);
		//3.将原副卡订购为主卡
		var sub_ooRole_copy = $.extend( true, {}, sub_ooRole); 
		sub_ooRole_copy.offerRoleId = main_ooRole.offerRoleId;
		sub_ooRole_copy.state = "ADD";
		busiOrder.data.ooRoles.push(sub_ooRole_copy);
		//4.将原主卡订购为副卡
		var main_ooRole_copy = $.extend( true, {}, main_ooRole); 
		main_ooRole_copy.offerRoleId = tempOfferRoleId;
		main_ooRole_copy.state = "ADD";
		busiOrder.data.ooRoles.push(main_ooRole_copy);
		
		//添加发展人
		var $tr = $("#dealerTbody tr[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr != undefined){
			$tr.each(function(){//遍历发展人
				var dealer = {
					itemSpecId	: CONST.BUSI_ORDER_ATTR.DEALER,
					role		: $(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
					value		: $(this).find("input").attr("staffid"),
					channelNbr	: $(this).find("select[name ='dealerChannel_"+OrderInfo.offerSpec.offerSpecId+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				var dealerName = { 
					itemSpecId	: CONST.BUSI_ORDER_ATTR.DEALER_NAME,
					role		: $(this).find("select[name='dealerType_"+OrderInfo.offerSpec.offerSpecId+"']").val(),
					value		: $(this).find("input").attr("value") 
				};
				busiOrder.data.busiOrderAttrs.push(dealerName);
			});
		}
		busiOrders.push(busiOrder);
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
		saveOrderSubmit			: _saveOrderSubmit,
		createProd				: _createProd,
		inSubmit				: _inSubmit
	};
})();
/**
 * 受理订单对象
 * 
 * @author wukf
 */
CommonUtils.regNamespace("SoOrder");

/** 受理订单对象*/
SoOrder = (function() { 
	
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
		var propertiesKey = "REAL_NAME_PHOTO_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
		var isFlag = offerChange.queryPortalProperties(propertiesKey);
		OrderInfo.preBefore.idPicFlag = isFlag;
		
		if(OrderInfo.actionFlag==8){//新增客户
			OrderInfo.busitypeflag = 25;
		}else if(OrderInfo.actionFlag==13){//购裸机
			OrderInfo.busitypeflag = 24;
		}else if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==201){//可选包变更,橙分期
			OrderInfo.busitypeflag = 14;
			OrderInfo.order.step=3;
		}else if(OrderInfo.actionFlag==6){//主副卡成员变更
			OrderInfo.busitypeflag = 3;
		}else if(OrderInfo.actionFlag==2){//套餐变更
			OrderInfo.busitypeflag = 2;
		}else if(OrderInfo.actionFlag==9){//客户返档
			OrderInfo.busitypeflag = 12;
		}else if(OrderInfo.actionFlag==22){//补换卡
			OrderInfo.busitypeflag = OrderInfo.uimtypeflag;
		}else if(OrderInfo.actionFlag==23){//异地补换卡
			OrderInfo.busitypeflag = 19;
		}else if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==112){//新装
			if(OrderInfo.preBefore.idPicFlag == "ON" && !OrderInfo.virOlId){
				$.alert("提示","请前往经办人页面进行实名拍照！");
				return;
			}
			OrderInfo.busitypeflag = 1;
		}
		if(_getOrderInfo(data)){
			//订单提交
			var url = contextPath+"/app/order/orderSubmit?token="+OrderInfo.order.token;
			$.callServiceAsJson(url,JSON.stringify(OrderInfo.orderData), {
				"before":function(){
					$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
				},"done" : function(response){
					$.unecOverlay();
					if (response.code == 0) {
						var data = response.data;
						if(OrderInfo.actionFlag==8 || OrderInfo.actionFlag==4){
							if(data.resultCode==0){
								var msg="";
								if(OrderInfo.actionFlag==8){
									msg="客户创建成功，购物车ID：" + response.data.rolId;
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
					}else{
						$.alertM(response.data);
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
		SoOrder.getToken();
		var busiOrders = [];  //存放订单项数组
		var custOrderAttrs = []; //获取订单属性数组
		var itemValue="N";
		//经办人新报文
		if(OrderInfo.actionFlag == 1){
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
		}
		
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
				if(ec.util.isObj(orderAttrName)&&ec.util.isObj(orderAttrIdCard)&&ec.util.isObj(orderAttrPhoneNbr)){
//					if(ec.util.isObj(orderAttrName)){
//						custOrderAttrs.push({
//							itemSpecId : CONST.BUSI_ORDER_ATTR.orderAttrName,
//							value : orderAttrName
//						});	
//					}
//					if(ec.util.isObj(orderAttrIdCard)){
//						custOrderAttrs.push({
//							itemSpecId : CONST.BUSI_ORDER_ATTR.orderIdentidiesTypeCd,
//							value : orderIdentidiesTypeCd
//						});	
//						custOrderAttrs.push({
//							itemSpecId : CONST.BUSI_ORDER_ATTR.orderAttrIdCard,
//							value : orderAttrIdCard
//						});	
//					}
//					if(ec.util.isObj(orderAttrPhoneNbr)){
//						custOrderAttrs.push({
//							itemSpecId : CONST.BUSI_ORDER_ATTR.orderAttrPhoneNbr,
//							value : orderAttrPhoneNbr
//						});	
//					}
//					if(ec.util.isObj(orderAttrAddr)){
//						custOrderAttrs.push({
//							itemSpecId : CONST.BUSI_ORDER_ATTR.orderAttrAddr,
//							value : orderAttrAddr
//						});	
//					}
				}else if(ec.util.isObj(orderAttrName)||ec.util.isObj(orderAttrIdCard)||ec.util.isObj(orderAttrPhoneNbr)){
//					if(!ec.util.isObj(orderAttrName)){
//						$.alert("提示","经办人姓名为空，经办人姓名、经办人号码、证件号码必须同时为空或不为空，因此无法提交！");
//						return false;
//					}
//					if(!ec.util.isObj(orderAttrPhoneNbr)){
//						$.alert("提示","经办人号码为空，经办人姓名、经办人号码、证件号码必须同时为空或不为空，因此无法提交！");
//						return false;
//					}
//					if(!ec.util.isObj(orderAttrIdCard)){
//						$.alert("提示","证件号码为空，经办人姓名、经办人号码、证件号码必须同时为空或不为空，因此无法提交！");
//						return false;
//					}
				}
			}
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==112){ //新装
			_createOrder(busiOrders); //新装
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
			/*custOrderAttrs.push({
				itemSpecId : "111111140",//3转4标志
				value : "C1"
			});*/
			_createCustOrderOnly(busiOrders,data);
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
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				for ( var j = 0; j < offerRole.prodInsts.length; j++) {
					var prodInst = offerRole.prodInsts[j];
					var accNbr = OrderInfo.getProdAn(prodInst.prodInstId).accessNumber;
					if(accNbr==undefined || accNbr == ""){
						$.alert("信息提示","【接入产品("+offerRole.offerRoleName+")】号码不能为空！");
						return false;
					} 
					if(OrderInfo.getProdTd(prodInst.prodInstId)==""){
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
					var prodAttrFlag = true;
					var checkName = null;
					$(OrderInfo.prodAttrs).each(function(){
						var isOptional = this.isOptional;
						var id = this.id;
						if(isOptional == "N" && id){
							var val=$.trim($("#"+id).val());
							if(val == "" || val == undefined){
								checkName = this.name;
								prodAttrFlag = false;
							}
						}
					});
					if(!prodAttrFlag){
						$.alert("信息提示","没有配置产品属性("+checkName+")，无法提交");
						return false;
					}
					
//					if(!order.main.templateTypeCheck()){
//						return false;
//					}
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
		var dealer = {
			itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
			role : $("#dealerType").val(),
			value : $("#dealerName").attr("staffid"),
			channelNbr : $("#cur_channelCode").val()
		};
		busiOrder.data.busiOrderAttrs.push(dealer);
		var dealer_name = {
			itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
			role : $("#dealerType").val(),
			value : $("#dealerName").attr("value")
		};
		busiOrder.data.busiOrderAttrs.push(dealer_name);		
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
		if(paytype!= undefined){
			busiOrder.data.boProdFeeTypes.push({
				feeType : paytype,
				state : "ADD"
			});
		}
		//发展人
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14){
			var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $("#dealerType").val(),
					value : $("#dealerName").attr("staffid"),
					channelNbr : $("#cur_channelCode").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				var dealer_name = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
					role : $("#dealerType").val(),
					value : $("#dealerName").attr("value")
				};
				busiOrder.data.busiOrderAttrs.push(dealer_name);
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
		return busiOrder;
	};
	
	//初始化订单获取token
	var _getToken = function() {
		var response = $.callServiceAsHtmlGet(contextPath+"/common/getToken");
		OrderInfo.order.token = response.data;
	};
	
	//订单确认
	var _orderConfirm = function(data){
		_showConfirm(data);	
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==112){ //新装 
			$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+OrderInfo.offerSpec.offerSpecName+'</span><span class="subtitle font-secondary">主套餐</span></span></li>');
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				$.each(this.prodInsts,function(){					
					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+OrderInfo.getProdAn(this.prodInstId).accessNumber+'</span><span class="subtitle font-secondary">'+this.offerRoleName+'</span></span></li>');
				});
			});
		}else{ //二次业务
			var prod = order.prodModify.choosedProdInfo;
			$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+prod.prodOfferName+'</span><span class="subtitle font-secondary">套餐名称</span></span></li>');
			$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+prod.accNbr+'</span><span class="subtitle font-secondary">手机号码</span></span></li>');	
           if(OrderInfo.actionFlag==3){ //可选包变更 和订购橙分期合约包
				OrderInfo.actionTypeName = "订购/退订可选包与功能产品";
			}else if(OrderInfo.actionFlag==201){
				OrderInfo.actionTypeName = "订购橙分期合约包";
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
			if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14 || OrderInfo.actionFlag==112){
				_showOrderOffer(); //显示订购的销售品
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
	
	//显示订购的销售品
	var _showAttachOffer = function(){
		var prod = order.prodModify.choosedProdInfo;
		if(prod==undefined || prod.prodInstId ==undefined){
			return true;
		}
		_showAttOffer(prod.prodInstId);
	};
	
	//显示的可选包/功能产品
	var _showAttOffer = function(prodId){
		var offerSpecList = CacheData.getOfferSpecList(prodId);
		var offerList = CacheData.getOfferList(prodId);
		var servSpecList = CacheData.getServSpecList(prodId);
		var servList = CacheData.getServList(prodId);
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
                   //订购的附属销售品
					$("#orderTbody").append('<li><span class="list-title"><span class="title-lg">'+this.servSpecName+'</span><span class="subtitle font-secondary">'+CONST.EVENT.PROD_OPEN+'</span></span></li>');
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
		if(OrderInfo.actionFlag==201){
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
			return;
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
		showOrderOffer          :_showOrderOffer,
		showAttOffer            :_showAttOffer,
		showAttachOffer         :_showAttachOffer
	};
})();
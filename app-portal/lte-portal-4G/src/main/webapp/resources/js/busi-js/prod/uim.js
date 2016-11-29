/**
 * uim卡管理
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("prod","uim");

prod.uim = (function() {
	
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
		//update by huangjj3 #13318，如果选择的是空白卡，cardNo需要做下逻辑处理
		var selUimType = $("#selUimType").val();
		if(selUimType == 2){//表示选择的是空白卡
			var cardNoStr = cardNo.substring(cardNo.length - 2,cardNo.length - 1);
			var cardNoLast = cardNo.substring(cardNo.length -1,cardNo.length);
			var serviceName = contextPath + "/mktRes/writeCard/getHexToAscii";
			var hexStr = cardNo.substring(cardNo.length-2,cardNo.length);
			var param = {
				"hexStr":hexStr       
			};
			var response = $.callServiceAsJson(serviceName, param);
			cardNo = cardNo.substring(0,cardNo.length-2)+ response.data.strHex;
			
		}
		if(selUimType == 3 || selUimType == 4){//表示读取的是空白卡
			cardNo = $("#resultCardNo").val();
		}
		$("#uim_lable").attr("disabled",false); 
		var inParam = {
			"instCode" : cardNo,
			"phoneNum" : phoneNumber,
			"selUimType":selUimType,
			"serialNumberCode":$.trim($("#uim_txt_"+prodId).val()),
			"areaId"   : OrderInfo.getProdAreaId(prodId)
		};

		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var mktResCd="";
		if(CONST.getAppDesc()==0){
			if(getIsMIFICheck(prodId)){
				mktResCd = _getMktResCd(CONST.PROD_SPEC_ID.MIFI_ID);
			}else{
				mktResCd = _getMktResCd(prodSpecId);
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
		var data = query.prod.checkUim(inParam);//校验uim卡
		if(data==undefined || data.baseInfo==undefined){
			return false;
		}
		else
		{
			var uimData = {
					prodId :  prodId, //产品ID
					isWireBusi : "",
					isWireUIM : false, //判断是否为无线上网卡
					wireType : 0, //1-普通上网卡 2-全球上网卡 0-默认
					uimCode  : data.baseInfo.mktResInstCode,
					uimName  : data.baseInfo.mktResName
			};
			$.each(data.attrList, function() {
				if (this.attrId == '60020007') {
					uimData.isWireUIM = true;
					uimData.wireType = this.attrValue;
					return false;
				}
			});
			if(uimData.isWireUIM){
				if (prodSpecId == CONST.PROD_SPEC.CDMA) {
					uimData.isWireBusi = 1; // 上网卡 - 移动电话业务
				}
			}else{
				if(prodSpecId == CONST.PROD_SPEC.DATA_CARD){
					uimData.isWireBusi = 2; // 普通卡 - 无线业务
				}
			}
			OrderInfo.clearCheckUimData(prodId);
			OrderInfo.checkUimData.push(uimData);
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
			uimType:"",//标识用于订单成功更新订单状态
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=data.baseInfo.cardTypeFlag;//UIM卡类型
		}
		if(selUimType==2 || selUimType==3 || selUimType==4){
			coupon.uimType = "2";
		}
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		$("#uim_release_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
		$("#uim_txt_"+prodId).attr("disabled",true);
		if(getIsMIFICheck(prodId)){//判断是否通过MIFI 校验
			$("#isMIFI_"+prodId).val("yes");
		}else{
			$("#isMIFI_"+prodId).val("no");
		}
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
		if(OrderInfo.actionFlag==22 && data.baseInfo.cardTypeFlag==1 && order.prodModify.choosedProdInfo.productId != '280000000'){
		//	_queryAttachOffer();
		  AttachOffer.queryCardAttachOffer(data.baseInfo.cardTypeFlag);  //加载附属销售品
	    }
		// 办理上网卡套餐，UIM校验当卡为全球上网卡自动带出天翼宽带-国际及港澳台数据漫游
		if (OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14) {
			if (uimData.isWireUIM && uimData.wireType == '02'
					&& prodSpecId == CONST.PROD_SPEC.DATA_CARD) {
				// AttachOffer.openServSpec(prodId,13409441,'天翼宽带-国际及港澳台数据漫游','N');
				AttachOffer.addOpenServList(prodId,
						CONST.PROD_SPEC_ID.WIRE_GLOBAL, '天翼宽带-国际及港澳台数据漫游', 'N');
				var $li = $("#li_" + prodId + "_"
						+ CONST.PROD_SPEC_ID.WIRE_GLOBAL);
				if ($li.length > 0) {
					$li.find("dd").removeClass("delete").addClass("mustchoose")
							.attr("onclick", '');
				}
			}
		}
		//3转4弹出促销窗口
		//查询卡类型
		var oldCardis4GCard = "";
		if(prodId!=null && prodId>=0){//不为新装
			var param ={
					prodInstId	: prodId,
					areaId		: order.prodModify.choosedProdInfo.areaId,
					acctNbr		: phoneNumber
				};
			    var terminalInfo = query.prod.getTerminalInfo2(param);
				if(terminalInfo!=null&&terminalInfo.is4GCard!=null&&terminalInfo.is4GCard!=""){
				    if(terminalInfo.is4GCard =="Y"){
				    	oldCardis4GCard = "Y";
					}else{
						oldCardis4GCard = "N";
					}
				}else{
					if(order.prodModify.choosedProdInfo.prodClass== "3"){
						oldCardis4GCard = "N";
					}else{
						oldCardis4GCard = "Y";
					}
				}
		}
		
		if(oldCardis4GCard == "N" && data.baseInfo.cardTypeFlag==1){
			$("#isShow_"+prodId).show();
			var param = {
				prodSpecId : prodSpecId,
				offerSpecIds : [],
				queryType : "3",
				prodId : prodId,
				partyId : OrderInfo.cust.custId,
				ifCommonUse : "",
				if3Up4:"Y"
			};
			var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
			var accNbr = prodInfo.accNbr;
			param.acctNbr = accNbr;
			if(!ec.util.isObj(prodInfo.prodOfferId)){
				prodInfo.prodOfferId = "";
			}
			var offerRoleId = CacheData.getOfferMember(prodInfo.prodInstId).offerRoleId;
			if(offerRoleId==undefined){
				offerRoleId = "";
			}
			param.offerRoleId = offerRoleId;
			param.offerSpecIds.push(prodInfo.prodOfferId);

			var data = query.offer.queryCanBuyAttachSpec(param);//可订购附属销售品			
			if(data!=undefined && data.resultCode == "0"&&data.result.offerSpecList.length>0){
				
				var attachOfferList = CacheData.getOfferList(prodId);//已订购附属销售品
				var content = '<form id="promotionForm"><table>';
				var selectStr = "";
				var optionStr = "";				
				selectStr = selectStr+"<tr><td>可订购促销包: </td><td><select class='inputWidth183px' id="+accNbr+"><br>"; 

				//循环遍历可订购附属销售品
				$.each(data.result.offerSpecList,function(){
					var offerSpec = this;
					var offerSpecId = this.offerSpecId;
					var offerSpecName = this.offerSpecName;
					var ifOrderAgain = this.ifOrderAgain;//是否可以重复订购
					var ifDueOrderAgain = this.ifDueOrderAgain;//当月到期是否可以重复订购
					var isOrdered = false;
					
					if(attachOfferList != undefined && attachOfferList.length > 0){
						//循环遍历已订购附属销售品
						$.each(attachOfferList,function(){
							//如果可订购附属在已订购列表中
							if(this.offerSpecId == offerSpecId && this.isDel != "C"){
								isOrdered = true;
								var expireDate = this.expDate;//已订购的附属销售品的失效时间
								expireDate = expireDate.substring(4,6);//截取失效时间(20150201000000)的月份(02)
								var currentMonth = new Date().getMonth() + 1;//获取当前月份(0-11,从0开始，如0为1月份，1为2月份)
								if(currentMonth < 10){
									currentMonth = "0" + currentMonth;//如果月份为个位数，则补充"0"于首位
								}
								if(expireDate == currentMonth){
									//如果已订购是当月到期
									if(ifOrderAgain == "Y" || ifDueOrderAgain == "Y"){
										//如果该附属可重复订购或者到期当月可重复订购，则展示；否则屏蔽不展示
										optionStr += '<option value="' + offerSpecId + '">' + offerSpecName + '</option>';
									}
								}
							}
						});
						//如果该可订购附属没有在已订购列表中，则不过滤
						if(!isOrdered){
							isOrdered = true;
							optionStr += '<option value="' + offerSpecId + '">' + offerSpecName + '</option>';
						}
					} else{
						//如果没有已订购附属，则不对可订购进行过滤，直接展示
						optionStr += '<option value="' + offerSpecId + '">' + offerSpecName + '</option>';
					}
				});
				selectStr += optionStr + "</select></td></tr>"; 
				content +=selectStr;
				var offerSpecId;
				$.confirm("促销包选择",content,{ 
					yes:function(){	
						
					},
					no:function(){
						
					}
				});
				$('#promotionForm').bind('formIsValid', function(event, form) {
					offerSpecId = $('#'+accNbr+' option:selected').val();
					$(".ZebraDialog").remove();
	                $(".ZebraDialogOverlay").remove();
	                AttachOffer.selectAttachOffer(prodId,offerSpecId);
				}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
				
			}
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
	
	var _getMktResCd = function(prodSpecId){
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
	
	//uim卡号释放
	var _releaseUim = function(prodId){	
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		//update by huangjj3 #13318，如果选择的是空白卡，cardNo需要做下逻辑处理
		var selUimType = $("#selUimType").val();
		if(selUimType == 2){//表示选择的是空白卡
			var cardNoStr = cardNo.substring(cardNo.length - 2,cardNo.length - 1);
			var cardNoLast = cardNo.substring(cardNo.length -1,cardNo.length);
			var serviceName = contextPath + "/mktRes/writeCard/getHexToAscii";
			var hexStr = cardNo.substring(cardNo.length-2,cardNo.length);
			var param = {
				"hexStr":hexStr       
			};
			var response = $.callServiceAsJson(serviceName, param);
			cardNo = cardNo.substring(0,cardNo.length-2)+ response.data.strHex;
		}
		if(selUimType == 3){//表示读取的是空白卡
			cardNo = $("#resultCardNo").val();
		}
/*		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		var inParam = {
			"oldInstCode":cardNo,
			"phoneNum":phoneNumber
		};
		var data = query.prod.releaseUim(inParam);//释放uim卡
		if(data==undefined){
			return false;
		}*/
		//释放UIM并更新门户记录
		var param = {
				numType : 2,
				selUimType:$("#selUimType").val(),
				serialNumberCode:$.trim($("#uim_txt_"+prodId).val()),
				numValue : cardNo
		};
		var jr = $.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);			
		if(jr.code==-2){
			$.alertM(jr.data);
			return;
		}
		if(jr.code==-1){
			$.alert("提示",jr.data);
			return;
		}
		$.alert("提示","成功释放UIM卡："+$.trim($("#uim_txt_"+prodId).val()));
		if(OrderInfo.actionFlag==22){
			$('#attach').children().remove();
			AttachOffer.openServList = [];
			AttachOffer.openList = [];
	    }
		if (OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14) {
			var prodSpecId = OrderInfo.getProdSpecId(prodId);
			var uimData = OrderInfo.getCheckUimData(prodId);
			if (uimData.isWireUIM && uimData.wireType == '02'
				&& prodSpecId == CONST.PROD_SPEC.DATA_CARD) {
				AttachOffer.closeServSpec(prodId,
						CONST.PROD_SPEC_ID.WIRE_GLOBAL, '天翼宽带-国际及港澳台数据漫游', 'N');
				var $li = $("#li_" + prodId + "_"
						+ CONST.PROD_SPEC_ID.WIRE_GLOBAL);
				if ($li.length > 0) {
					$li.find("dd").removeClass("mustchoose").addClass("delete")
							.attr("onclick","AttachOffer.closeServSpec('" + prodId
											+ "','"
											+ CONST.PROD_SPEC_ID.WIRE_GLOBAL
											+ "','天翼宽带-国际及港澳台数据漫游','N')");
				}
			}
		}
		$("#uim_check_btn_"+prodId).attr("disabled",false);
		$("#uim_check_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
		$("#uim_release_btn_"+prodId).attr("disabled",true);
		$("#uim_release_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		$("#uim_txt_"+prodId).attr("disabled",false);
		$("#uim_txt_"+prodId).val("");
		$.each(OrderInfo.boProd2Tds,function(){
			var prodId = this.prodId;
		    var accNbr = OrderInfo.getAccessNumber(prodId);
		    order.dealer.removeAttDealer(accNbr); //删除协销人
		});
		OrderInfo.clearCheckUimData(prodId);
		OrderInfo.clearProdUim(prodId);
	};
	
	//保存旧卡
	var _setOldUim = function(offerId ,prodId,uim){
		var oldUim={
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "2",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :uim.couponId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : CONST.ACCT_ITEM_TYPE.UIM_CHARGE_ITEM_CD, //物品费用项类型
			couponNum : 1, //物品数量
			//storeId : oldUimInfo.storeId, //仓库ID
			storeId : 1, //仓库ID
			storeName : "11", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : uim.couponInsNumber, //物品实例编码
			terminalCode : uim.couponInsNumber,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId : prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列
			id:0,
			isOld : "T",  //旧卡
			is4GCard : uim.is4GCard
		};
		OrderInfo.boProd2OldTds.push(oldUim);
		order.prodModify.choosedProdInfo.extCouponInstanceId = uim.extCouponInstanceId;
		order.prodModify.choosedProdInfo.corCouponInstanceId = uim.corCouponInstanceId;
	};

	//根据UIM类型，设置产品是3G还是4G，并且保存uim卡
	var _setProdUim = function(){
		OrderInfo.boProd2OldTds = []; //清空旧卡
		var flag = true;
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23){ //可选包变更，补换卡
			var prod = order.prodModify.choosedProdInfo; 
			var uim = query.prod.getTerminalInfo(prod);
			if(uim == undefined){  //查询旧卡信息失败返回
				return false;
			}
			_setOldUim(prod.prodOfferInstId,prod.prodInstId,uim); //保存旧卡信息
			if(uim.is4GCard=="Y"){
				prod.prodClass = CONST.PROD_CLASS.FOUR;
			}else{
				prod.prodClass = CONST.PROD_CLASS.THREE;
			}
		}else if(OrderInfo.actionFlag==21){
			var prod = {};
			$.each(OrderInfo.viceOfferSpec,function(){
				var prodId=this.prodId;
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD&&this.objInstId==prodId){ //接入类产品
						prod.prodInstId = this.objInstId;
						prod.accNbr = this.accessNumber;
						var uim = query.prod.getTerminalInfo(prod);
						if(uim == undefined){  //查询旧卡信息失败返回
							flag = false;
							return false;
						}
						_setOldUim(this.offerId,this.objInstId,uim); //保存旧卡信息
						if(uim.is4GCard=="Y"){
							this.prodClass = CONST.PROD_CLASS.FOUR;
						}else{
							this.prodClass = CONST.PROD_CLASS.THREE;
						}
					}
				});
			});
		}else{
			var prod = {};
			$.each(OrderInfo.offer.offerMemberInfos,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){ //接入类产品
					prod.prodInstId = this.objInstId;
					prod.accNbr = this.accessNumber;
					var uim = query.prod.getTerminalInfo(prod);
					if(uim == undefined){  //查询旧卡信息失败返回
						flag = false;
						return false;
					}
					_setOldUim(this.offerId,this.objInstId,uim); //保存旧卡信息
					if(uim.is4GCard=="Y"){
						this.prodClass = CONST.PROD_CLASS.FOUR;
					}else{
						this.prodClass = CONST.PROD_CLASS.THREE;
					}
					var prodInfo = order.prodModify.choosedProdInfo; 
					if(prodInfo!=undefined && prodInfo.prodInstId==this.objInstId){
						prodInfo.prodClass = this.prodClass;
					}
				}
			});
		}
		return flag;	
	};

	var _getCardType=function(mktResCd,mktResId,instCode){
		var param = {
			"mktResCd": mktResCd,
			"mktResId": mktResId,
			"instCode": instCode
		};
		var url = contextPath + "/mktRes/uim/getResCardType";
		$.ecOverlay("<strong>获取获取卡类型中,请稍等...</strong>");
		var response = $.callServiceAsJson(url, param);
		$.unecOverlay();
		if (response.code == 0) {
			var result = response.data;
			if (ec.util.isObj(result) && ec.util.isObj(result[0].uimTypeFlag)) {
				return result[0].uimTypeFlag;
			} else {
				return "";
			}
		} else if (response.code == -2) {
			$.alertM(response.data);
			return "";
		} else {
			return "";
		}
	};

	/**
	 * 卡应用信息查询
	 * @param mktResInstCodeList
	 * @private
     */
	_queryUimAppInfo = function (mktResInstCode,prodId) {
		if (!ec.util.isObj(mktResInstCode)) {
			$.alert("提示", "UIM卡号不能为空！");
			return;
		}
		var idPre = "ec-dialog-form-container";
		var uimAppInfoDialog = "-nfc-app-infos" + prodId;
		ec.form.dialog.createDialog({
			"id": uimAppInfoDialog,
			"width": 1000,
			"height": 500,
			"initCallBack": function (dialogForm, dialog) {
				var param = {
					"mktResInstCodeList": [mktResInstCode]
				};
				if (OrderInfo.busitypeflag == 13 || OrderInfo.busitypeflag == 21 || OrderInfo.busitypeflag == 22) {//补换卡业务添加旧卡信息
					if (ec.util.isObj(OrderInfo.boProd2OldTds) && ec.util.isObj(OrderInfo.boProd2OldTds[0].terminalCode)) {
						param.mktResInstCodeList.push(OrderInfo.boProd2OldTds[0].terminalCode);
					}
				}
				var url = contextPath + "/mktRes/uim/nfcAppInfos";
				$.callServiceAsHtml(url, param, {
					"before": function () {
						$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
					},
					"always": function () {
						$.unecOverlay();
					},
					"done": function (response) {
						prod.uim.dialogForm = dialogForm;
						prod.uim.dialog = dialog;
						if (!response) {
							$.alert("提示", "<br/>处理失败，请稍后重试！");
							return;
						}
						if (response.code != 0) {
							if (prod.uim.dialogForm != undefined && prod.uim.dialog != undefined) {
								prod.uim.dialogForm.close(prod.uim.dialog);
							}
							if (response.code == 1006) {
								$.alert("提示", "未查询到相关数据！");
							}
							return;
						}
						$("#"+idPre+uimAppInfoDialog).find("#nfcAppContent").html(response.data);
						//显示第一个tab的div
						$("#tab_content_0").show();
						//绑定切换合约页click事件
						$("#contract_nav_nfc_app_tab li").off("click").on("click", function (event) {
							_setNfcAppTab(this, $(this).attr("itemIndex"));
						});
						//绑定确定按钮click事件
						$("#"+idPre+uimAppInfoDialog).find("#nfc_app_nav_confirm_a").off("click").on("click", function (event) {
							prod.uim.dialogForm.close(prod.uim.dialog);
						});
					}
				});
			},
			"submitCallBack": function (dialogForm, dialog) {
			},
			"closeCallBack": function (dialogForm, dialog) {
				$("#"+idPre+uimAppInfoDialog).find("#nfcAppContent").html('');
			}
		});
		/**
		 * 切换卡应用信息标签页
		 */
		var _setNfcAppTab = function (selected, id) {
			if ($(selected).hasClass("current")) {
				return;
			}
			$("#contract_nav_nfc_app_tab li").removeClass("current");
			$("#tab_" + id).addClass("current");
			$(".contract_tab_content_nfc_app").hide();
			$("#tab_content_" + id).show();
		};

	};
	return {
		checkUim				: _checkUim,
		releaseUim 				: _releaseUim,
		setProdUim				: _setProdUim,
		setOldUim				: _setOldUim,
		getCardType				: _getCardType,
		getMktResCd				: _getMktResCd,
		queryUimAppInfo			: _queryUimAppInfo
	};
})();
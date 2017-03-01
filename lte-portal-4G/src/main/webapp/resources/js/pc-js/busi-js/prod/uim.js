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
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
        if(prodId>0 && (OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3)){
        	//任务（小组） #1223397 能力开放 ---- 4G系统换卡增加单独短信验证的需求
    		var param = {
    		   "munber":order.prodModify.choosedProdInfo.accNbr,
    		   "areaId":order.prodModify.choosedProdInfo.areaId,
    		   "flag":"actionFlag"
    		};
    		$.callServiceAsJsonGet(contextPath+"/staff/login/changeUimCheck", param , {
    			"before" : function(){
    				$.ecOverlay("<strong>短信权限验证中,请稍等会儿....</strong>");
    			},
    			"done" : function(response){
    				if (response.code == 0) {
    					$('#changeUimSmsForm').bind('formIsValid', _smsFormIsValid).ketchup({bindElement:"changeuimsmsbutton"});
    					easyDialog.open({
    						container : 'CHANGEUIMSMS'
    					});
    					//置空短信校验码框
    					$("#defaultTimeResend").text(second);//验证码提示秒数
    					window.clearInterval(interResend);
    					$("#smspwd").val("").removeClass("ketchup-input-error");
    					$("#changeuimsmsresend").off("click").removeClass("cn").addClass("cf");
    					if(response.data.randomCode !=undefined||response.data.randomCode !=''){
    						$(".randomCode").show();
    						//#544326 IE7不兼容$("#num .txtnum")语法
//    						$("#num .txtnum").attr("value",response.data.randomCode);
    						$("#changeUimSmsRandomNum").attr("value",response.data.randomCode);
    					}
//    					$("#checkNum .txtnum").attr("value",order.prodModify.choosedProdInfo.accNbr);
    					$("#changeUimSmsCheckNum").attr("value",order.prodModify.choosedProdInfo.accNbr);
    					//重新发送验证码成功后,验证错误次数置0.
    					smsErrorCount=0;
    					//重新发送验证码成功后,验证码有效期初始化5分钟.
    					sendSmsAfter30s();
    					//5分钟倒计时，超过5分钟未输入验证码就失效.
    					leftInvalidTime=300;
    					invalidAfter5Mins();
    					$("#smspwd").focus();
    					_setEnable("#changeuimsmsbutton", "#changeUimSmsForm");
    				}else if(response.code==3){
    					$.alert("提示",response.data);
    					return;
    				}else if(response.code==1002){
    					_checkUimFunction(prodId);
    					return;
    				}else if(response.code==1003){
    					$.alert("提示",response.data);
    					return;
    				}else{
    					$.alertM(response.data.errMsg);
    					return;
    				}
    			},
    			"always" : function(){
    				$.unecOverlay();
    			},
    			"fail" : function(response){
    				$.alert("提示","请求可能发生异常，请稍候");
    			}
    		});	
		}else{
			_checkUimFunction(prodId);
		}
	};
	//刷新时间
	var second=30;
	var interResend=null;
	var showTime=function(){
		if (second>0){
			second=second-1;
			if(second==0){
				$("#defaultTimeResend").html("");	
				$("#changeuimsmsresend").removeClass("cf").addClass("cn").off("click").on("click",_smsResend);
				if(interResend!=null){
					window.clearInterval(interResend);
					$('#timeInfo').html("");
					$("#changeuimsmsresend").attr("title","请点击重新发送短信验证码.");		
					return;
				}
			}
			$("#defaultTimeResend").html("在"+second+"秒内");	
		}
		$("#changeuimsmsresend").attr("title","请在"+second+"秒后再点击重新发送.");	
	};

	//短信验证码失效时间5分钟
	var leftInvalidTime=300;
	var smsInvalidTime=function(){
		if (leftInvalidTime>0){
			leftInvalidTime=leftInvalidTime-1;
		}
	};
	//30秒后重发短信验证码
	var sendSmsAfter30s=function(){
		 second=30;
		 window.clearInterval(interResend);
		 interResend=window.setInterval(showTime,1000);
	};
	//5分钟之后短信验证码过期失效
	var invalidAfter5Mins=function(){
		window.setInterval(smsInvalidTime,1000);
	};
	
	//重发验证码
	var _smsResend=function(){ 
		$.callServiceAsJsonGet(contextPath+"/staff/login/changeUimReSend",{'smsErrorCount':smsErrorCount} ,{
			"done" :function(response){				
				if (response.code==0) {
					$.alert("提示","验证码发送成功，请及时输入验证.");
					$("#smsresend").off("click").removeClass("cn").addClass("cf");
					//randomNum2 = ec.util.getNRandomCode(2);
					if(response.data.randomCode != null ){
						$("#num .txtnum").attr("value",response.data.randomCode);
					}
					//重新发送验证码成功后,验证错误次数置0.
					smsErrorCount=0;
					//重新发送验证码成功后,验证码有效期初始化5分钟.
					leftInvalidTime=300;
					sendSmsAfter30s();
					//5分钟倒计时，超过5分钟未输入验证码就失效.
					invalidAfter5Mins();
				} else{
					if(response.data!=undefined||response.data!=null){
						$.alert("提示",response.data);
					}
				};
				_setEnable("#changeuimsmsbutton", "#changeUimSmsForm");
			}
		});	
	};
	var _setDisable = function(id, form){
		$(id).attr("disabled", true);
		$(form).off('formIsValid', _smsFormIsValid);
	};
	var _setEnable = function(id, form){
		$(id).attr("disabled", false);
		$(form).off('formIsValid').on('formIsValid', _smsFormIsValid);
	};
	var _smsFormIsValid = function(event, form) {
		//判断短信验证码是否过期
		if(leftInvalidTime==0){
			$.alert("提示","对不起,您的短信验证码已经过期,请重新发送后再次验证.");
			return;
		}
		//判断短信验证错误次数,超过三次后,验证码失效，需要重新发送.
		if(smsErrorCount==3){
			$.alert("提示","对不起,3次错误输入后验证码已自动失效,请重新发送验证码.");
			$("#changeuimsmsresend").removeClass("cf").addClass("cn").off("click").on("click",_smsResend);
			if(interResend!=null){
				window.clearInterval(interResend);
				$('#timeInfo').html("");
				$("#changeuimsmsresend").attr("title","请点击重新发送短信验证码.");	
				return;
			}
			return;
		}
		var smspwd = $.trim($("#smspwd").val());
		if (smspwd=="") {
			smspwd="N";
		}
		var params = "smspwd=" + smspwd + "&number=" + order.prodModify.choosedProdInfo.accNbr;
		_setDisable("#changeuimsmsbutton", "#changeUimSmsForm");
		$.callServiceAsJson(contextPath+"/staff/login/changeUimSmsValid", params, {
			"before":function(){
				$.ecOverlay("<strong>验证短信随机码中,请稍等会儿....</strong>");
//				_setDisable("#changeuimsmsbutton", "#changeUimSmsForm");
			},
			"done" : function(response){
				if (response.code == 0) {
					try{
						easyDialog.close();
					}catch(e){
						$("#CHANGEUIMSMS").hide();
						$("#overlay").hide();
					}
					_checkUimFunction(prodId);
				} else if (response.code == 1) {
					smsErrorCount+=1;
					$.alert("提示",response.data);
				}else {
						$.alert("提示","请求异常，请重新登录再试！");
				}
			},
			"always":function(){
				$.unecOverlay();
//				_setEnable("#changeuimsmsbutton", "#changeUimSmsForm");
			}
		});
		_setEnable("#changeuimsmsbutton", "#changeUimSmsForm");
	};
	//uim卡号校验
	var _checkUimFunction = function(prodId){
		OrderInfo.uimType=$("#uimType").val();
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
		var selUimType = $("#selUimType").val();
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		var inParam = {
			"instCode" : cardNo,
			"selUimType":selUimType,
			"phoneNum" : phoneNumber,
			"serialNumberCode":$.trim($("#uim_txt_"+prodId).val()),
			"areaId"   : OrderInfo.getProdAreaId(prodId)
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
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=data.baseInfo.cardTypeFlag;//UIM卡类型
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
	
	}
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
	
	//uim卡号释放
	var _releaseUim = function(prodId){	
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
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
		$.alert("提示","成功释放UIM卡："+cardNo);
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
	return {
		getMktResCd:getMktResCd,
		checkUim				: _checkUim,
		releaseUim 				: _releaseUim,
		setProdUim				: _setProdUim,
		getCardType				: _getCardType,
		setOldUim				: _setOldUim
	};
})();
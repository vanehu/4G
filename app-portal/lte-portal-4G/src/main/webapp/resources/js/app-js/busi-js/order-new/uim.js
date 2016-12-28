/**
 * uim卡管理
 * 
 * @author yanghm
 * date 2016-10-25
 */
CommonUtils.regNamespace("product","uim");

product.uim = (function() {
	
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
				offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
		}
		var cardNo =$.trim($("#uim_input_"+prodId).val());
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
		var data = _checkData(inParam);//校验uim卡
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
		$("#uim_release_"+prodId).removeClass("dis-none");
		$("#uim_check_"+prodId).addClass("dis-none");
		$("#uim_input_"+prodId).attr("disabled",true);
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
	
	//uim卡号释放
	var _releaseUim = function(prodId){	
		var cardNo =$.trim($("#uim_input_"+prodId).val());
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
		$.alert("提示","成功释放UIM卡："+cardNo);
		$("#uim_call_"+prodId).removeClass("dis-none");
		$("#uim_release_"+prodId).addClass("dis-none");
		$("#uim_input_"+prodId).attr("disabled",false);
		$("#uim_input_"+prodId).val("");
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
	
	//uim卡号校验（补换卡专用）
	var _checkUimApp = function(prodId){
        if (OrderInfo.uimtypeflag == 0) {
        	OrderInfo.uimtypeflag = 21;
        }
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
			"areaId"   : OrderInfo.getProdAreaId(prodId).toString(),
			"staffId"   : OrderInfo.staff.staffId,
			"channelId" : OrderInfo.staff.channelId
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
		var data = query.prod.checkUim(inParam);//校验uim卡
		if(data==undefined || data.baseInfo==undefined){
			return false;
		}
		$("#isCheck_Card").css("display","initial");
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
		$("#uim_release_btn_"+prodId).attr("disabled",false);
//		$("#uim_release_btn_"+prodId).removeClass("disabled");
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
		  AttachOffer.queryCardAttachOfferApp(data.baseInfo.cardTypeFlag);  //加载附属销售品
	    }
	
		//zhengyx7 uim效验 3转4弹出促销窗口
		if(OrderInfo.actionFlag!=1 && order.prodModify.choosedProdInfo.prodClass== "3" && data.baseInfo.cardTypeFlag==1){
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
			var data = query.offer.queryCanBuyAttachSpec(param);
			if(data!=undefined && data.resultCode == "0"&&data.result.offerSpecList.length>0){
				var content = '<form id="promotionForm"><table>';
				var selectStr = "";
				var optionStr = "";
				selectStr = selectStr+"<tr><td>可订购促销包: </td><td><select class='inputWidth183px' id="+accNbr+"><br>"; 
				$.each(data.result.offerSpecList,function(){
					var offerSpec = this;
					optionStr +='<option value="'+this.offerSpecId+'">'+this.offerSpecName+'</option>';
				});
				selectStr += optionStr + "</select></td></tr></table></form>"; 
				content +=selectStr;
				var offerSpecId;
				$.confirm("促销包选择",content,{ 
					yes:function(){	
						offerSpecId = $('#'+accNbr+' option:selected').val();
						AttachOffer.selectAttachOffer(prodId,offerSpecId);
					},
					no:function(){
						
					}
				});
				
			}
		}
		//
	};
	
	//uim卡号释放
	var _releaseUimApp = function(prodId){	
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
		$.alert("提示","成功释放UIM卡："+cardNo);
		if(OrderInfo.actionFlag==22){
			$('#attach').children().remove();
	    }
		$("#uim_check_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).attr("disabled",true);
		$("#uim_txt_"+prodId).attr("disabled",false);
		$("#uim_txt_"+prodId).val("");
		$("#isCheck_Card").css("display","none");
		OrderInfo.clearProdUim(prodId);
	};
	var _selUimApp = function(){
		var uimSel = $("#uimSel").val();
		if(uimSel !=undefined) {
			OrderInfo.uimtypeflag = parseInt(uimSel);
		}
	}
	
	//获取校验UIM卡
	var _checkData=function(param){
		var url = contextPath+"/app/mktRes/uim/checkUim";
		$.ecOverlay("<strong>UIM卡校验中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			$.alert("提示","UIM卡校验成功!");
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
		getMktResCd:getMktResCd,
		checkUim				: _checkUim,
		releaseUim 				: _releaseUim,
		setProdUim				: _setProdUim,
		setOldUim				: _setOldUim,
		checkUimApp			    : _checkUimApp,
		releaseUimApp			: _releaseUimApp,
		selUimApp               : _selUimApp,
		checkData               :_checkData
	};
})();
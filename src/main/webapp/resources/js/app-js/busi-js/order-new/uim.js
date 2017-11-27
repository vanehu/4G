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
		if(OrderInfo.actionFlag == 22){
			if (OrderInfo.uimtypeflag == 0) {
	        	OrderInfo.uimtypeflag = 21;
	        }
		}
        if(prodId>0 && (OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3)){
        	var cardNo =$.trim($("#uim_input_"+prodId).val());
    		if(cardNo==undefined || cardNo==''){
    			$.alert("提示","UIM卡不能为空!");
    			return false;
    		}
    		//短信校验
    		_msgCheck();
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
	
	var _msgCheck = function(){
		//任务（小组） #1223398 营业门户 ---- 4G系统换卡增加单独短信验证的需求
		var param = {
		   "munber":order.prodModify.choosedProdInfo.accNbr,
		   "areaId":order.prodModify.choosedProdInfo.areaId,
		   "flag":"actionFlag"
		};
		$.callServiceAsJsonGet(contextPath+"/staff/login/changeUimCheck", param , {
			"before" : function(){
				$.ecOverlay("<strong>短信权限验证中,请稍等会儿....</strong>");
			},
//			"always" : function(){
//				$.unecOverlay();
//			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					var content = getMsgContent(response.data);
					var title='短信验证';
					$("#btn-dialog-ok").removeAttr("data-dismiss");
					$('#alert-modal').modal({backdrop: 'static', keyboard: false});
					$("#btn-dialog-ok").off("click").on("click",function(){
						_smsFormIsValid();
					});
					$("#modal-title").html(title);
					$("#modal-content").html(content);
					$("#alert-modal").modal();
					
					//置空短信校验码框
					window.clearInterval(interResend);
					$("#smspwd").val("");
					$("#changeuimsmsresend").off("click");
					if(response.data.randomCode !=undefined||response.data.randomCode !=''){
						$(".randomCode").show();
						//#544326 IE7不兼容$("#num .txtnum")语法
//						$("#num .txtnum").attr("value",response.data.randomCode);
						$("#changeUimSmsRandomNum").html(response.data.randomCode);
					}
//					$("#checkNum .txtnum").attr("value",order.prodModify.choosedProdInfo.accNbr);
					$("#changeUimSmsCheckNum").html(order.prodModify.choosedProdInfo.accNbr);
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
					$.unecOverlay();
					if(OrderInfo.actionFlag == 3 || OrderInfo.actionFlag == 2){
						_checkUimFunction(prodId);
					} else {
						prod.changeUim.initApp();
					}
					return;
				}else if(response.code==1003){
					$.unecOverlay();
					$.alert("提示",response.data);
					return;
				}else{
					$.unecOverlay();
					$.alertM(response.data.errMsg);
					return;
				}
			},
			
			"fail" : function(response){
				$.alert("提示","请求可能发生异常，请稍候");
			}
		});	
	}
	
	//短信对话框展示内容
	var getMsgContent = function(data){
		var html = '<table width="100%" border="0" cellspacing="0" cellpadding="0" class="SMScode"> <tr>';
		html += '<td><p>为确保用户的个人信息安全，在办理该业务前，需先进行短信验证，请输入用户提供的随机短信验证码！</p></td> </tr>';
		html += '<tr class="randomCode"> <td style="height: 0.9rem;font-size: medium;">验证的号码  '+order.prodModify.choosedProdInfo.accNbr;
		html += '</td></tr>';
		html += '<tr><td  style="height: 0.9rem;font-size: medium;">短信验证码  ';
		html += '<input  type="text" name="smspwd" id="smspwd" placeholder="请输入验证码" maxlength="6"/>';
	    html += '</td></tr>';
	    html += ' <tr class="randomCode"><td>';
	    html += '<div id="msg_error" class="hidden" style="font-size: small;color: red;paddingleft: 0.4rem;">验证码不能为空</div>';
	    html += '</td></tr>';
	    html += ' <tr class="randomCode" style="display:none"><td  style="height: 0.9rem;font-size: medium;">';
	    html += ' 随机序列号  ';
	    html +='<span id="changeUimSmsRandomNum" class="txtnum" disabled="disabled"/>';
	    html +='</td> </tr><tr>';
	    html +='<tr><td><p>- 验证码在5分钟内有效，3次错误输入后失效。</p>';
	    html +='<p>- 如您<font id="defaultTimeResend">'+second+'</font>仍未收到验证码，请点击<a id="changeuimsmsresend" onclick="javascript:void(0);">重新获取验证码。</a></p>';
	    html +='<p>- 如果您连续3次重试都没有成功收到短信验证码，建议您稍后再试。</p></td></tr></table>';
	    return html;
	    
	}
	
	//重发验证码
	var _smsResend=function(){ 
		$.callServiceAsJsonGet(contextPath+"/staff/login/changeUimReSend",{'smsErrorCount':smsErrorCount} ,{
			"done" :function(response){				
				if (response.code==0) {
					$.alert("提示","验证码发送成功，请及时输入验证.");
					$("#smsresend").off("click").removeClass("cn").addClass("cf");
					//randomNum2 = ec.util.getNRandomCode(2);
					if(response.data.randomCode != null ){
						$("#changeUimSmsRandomNum").html(response.data.randomCode);
					}
					//重新发送验证码成功后,验证错误次数置0.
					smsErrorCount=0;
					//重新发送验证码成功后,验证码有效期初始化5分钟.
					leftInvalidTime=300;
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
	var _smsFormIsValid = function() {
		if($('#smspwd').val().trim() == ""){
			$('#msg_error').removeClass('hidden');
			return;
		} else {
			$('#msg_error').addClass('hidden');
		}
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
				$.unecOverlay();
				if (response.code == 0) {
					if(response.data==undefined || response.data.smsPwd==undefined || MD5("SMS"+smspwd+"SMS")!=response.data.smsPwd.toUpperCase()){
						$.alert("提示","短信校验失败！");
						return;
					}
					$("#alert-modal").modal("hide");
					if(OrderInfo.actionFlag == 3 || OrderInfo.actionFlag == 2){
						_checkUimFunction(prodId);
					} else {
						prod.changeUim.initApp();
					}
				} else if (response.code == 1) {
					smsErrorCount+=1;
					$.alert("提示",response.data);
					
				}else {
					$.alert("提示","请求异常，请重新登录再试！");
				}
			},
			"always":function(){
				
//				_setEnable("#changeuimsmsbutton", "#changeUimSmsForm");
			}
		});
		_setEnable("#changeuimsmsbutton", "#changeUimSmsForm");
	};
	//uim卡号校验
	var _checkUimFunction = function(prodId){
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
		$("#uim_call_LY_"+prodId).removeClass("dis-none");
		$("#uim_call_OTG_"+prodId).removeClass("dis-none");
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
		if(OrderInfo.jbr){
			OrderInfo.jbr.custId = undefined;
			OrderInfo.jbr.partyName = undefined;
			OrderInfo.jbr.telNumber = undefined;
			OrderInfo.jbr.addressStr = undefined;
			OrderInfo.jbr.identityCd = undefined;
			OrderInfo.jbr.mailAddressStr = undefined;
			OrderInfo.jbr.identityPic = undefined;
			OrderInfo.jbr.identityNum = undefined;
		}
		if(OrderInfo.uimtypeflag == "22" && OrderInfo.preBefore.idPicFlag=="ON"){//补卡经办人必填
				OrderInfo.jbr.custId = OrderInfo.cust.custId;
				OrderInfo.jbr.partyName = OrderInfo.cust.partyName;
				OrderInfo.jbr.telNumber = OrderInfo.cust.telNumber;
				OrderInfo.jbr.addressStr = OrderInfo.cust.addressStr;
				OrderInfo.jbr.identityCd = OrderInfo.cust.identityCd;
				OrderInfo.jbr.mailAddressStr = OrderInfo.cust.mailAddressStr;
				OrderInfo.jbr.identityPic = OrderInfo.cust.identityPic;
				OrderInfo.jbr.identityNum = OrderInfo.cust.identityNum;
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
	
	//蓝牙、OTG读取UIM卡号(入参传“1”代表OTG读UIM  不传或者传其它值代表蓝牙读UIM)
    var _gotoReadUIM = function(type,objId) {
        var arr = new Array(1)
        arr[0] = type;
        MyPlugin.gotoReadUIM(arr, function(result) {
        	$("#"+objId).val(result);
        	var prodId = objId.substring(objId.length-2,objId.length);
        	$("#uim_call_"+prodId).addClass("dis-none");
    		$("#uim_call_LY_"+prodId).addClass("dis-none");
    		$("#uim_call_OTG_"+prodId).addClass("dis-none");
    		$("#uim_check_"+prodId).removeClass("dis-none");
        });
      }
    
	return {
		getMktResCd:getMktResCd,
		checkUim				: _checkUim,
		releaseUim 				: _releaseUim,
		setProdUim				: _setProdUim,
		setOldUim				: _setOldUim,
		checkUimApp			    : _checkUimApp,
		releaseUimApp			: _releaseUimApp,
		selUimApp               : _selUimApp,
		checkData               :_checkData,
		smsFormIsValid			:_smsFormIsValid,
		smsResend				:_smsResend,
		smsFormIsValid			:_smsFormIsValid,
		msgCheck				:_msgCheck,
		gotoReadUIM				:_gotoReadUIM
	};
})();
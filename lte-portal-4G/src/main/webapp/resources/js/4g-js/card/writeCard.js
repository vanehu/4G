/**
 * 写卡
 * 
 * @author xuj
 */
CommonUtils.regNamespace("order", "writeCard");
var ty_plugin = null;
var productId = "";
var g_realWriteCard = true;//true真实写卡，false假写卡
//根据浏览器加载
if ($.browser.msie) {
	try{
		ty_plugin =new ActiveXObject("HBW0001.HBW0001Ctrl.1");
	}catch(e){}
}

order.writeCard = (function(){
	//4G卡
	//var _4GCARDS=["00700","00701","00702","00703","00704","00705","00706","00707","00708","00709","00710","00711","00712","00713","00312","00313","00314","00315","00316","00317"];
	
	var _settings = {
			busiComponentCode:"",
			session: {
				staffId:"",
				staffSerial:"",
				staffAreaId:"",
				staffAreaName:"",
				staffName:"",
				staffNumber:"",
				channelId:"",
				channelName:""
			},
			renderTo:"",
			params: {
				switchId:"",
				phoneNumber:"",
				lanId:"",
				dstOrgId:"",
				dstSysId:"",
				scene:"",
				terminalCode:""
			},
			config: {
				"rscAreaId":"",
				"cardAreaId":"",
				"isUnLoad":true
			//写卡后是否立即卸载动态链接库
			}
		};
	    var _TransactionID = "";
		var _haveReadCard = false;
		var _haveWriteCard = false;
		var g_phoneNumber = '';//'18920099334';//
		var g_subFlag = 'N';//副卡标识 Y|副卡 ;N|主卡.
		var _switchCache = [];
		var ty_plugin = null;
		var _rscJson = {
			"iccid":"",
			"imsi":"",
			"imsig":"",
			"data":"",
			"dataLength":"0",
			"state":"N",
			"prodId":""
		};
		var _rscJsonMN = {
				"iccid":"",
				"imsi":"",
				"imsig":"",
				"data":"",
				"dataLength":"0",
				"state":"N",
				"prodId":""
		};
	//卡数据资源JSON state:N 为不可用来写卡 Y 为可以
	this._cardDllInfoJson = {
		"dllId":"",
		"dllName":"",
		"":"",
		"password":"",
		"factoryCode":""
	};//动态链接库JSON
	var _cardInfoJson = {
		"serialNumber":"",
		"factoryCode":"",
		"cardTypeId":"",
		"cardName":"",
		"materialId":"",
		"canWrite":"N"
	};
	var ocx;
	var _essWriteCard = {};
	
	var _writeReadCard=function(prodId){
		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		if (phoneNumber==""){
			$.alert("提示",'请选择号码!','confirmation');
			return;
		}
        if(prodId>0 && (OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3)){
        	//任务（小组） #1221286 营业门户 ---- 4G系统换卡增加单独短信验证的需求
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
    					_createDialog(prodId,phoneNumber);
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
			_createDialog(prodId,phoneNumber);
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
					var phoneNumber = OrderInfo.getAccessNumber(prodId);
					_createDialog(prodId,phoneNumber);
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

	var _createDialog = function(prodId,phoneNumber){
		ec.form.dialog.createDialog({"id":"-card"+prodId,width:350,"initCallBack":function(){			
			$("#write_card_phone_number"+prodId).val(phoneNumber);
			//ActiveX 控件无法用JQUERY方法获取
			ocx = document.getElementById("ocx"+prodId);
			//绑定读卡按钮事件
			$("#btnReadCard"+prodId).click(function(){
				$("#btnReadCard"+prodId).attr("disabled","disabled");
				if (!order.writeCard.readCard(prodId)) {
					$("#serialNum"+prodId).val("");
					$("#cardTypeId"+prodId).val("");
				}else{
					$.alert("提示",'成功读卡!','confirmation');
				}
				$("#btnReadCard"+prodId).removeAttr("disabled");
			});
			$("#btnWriteCard"+prodId).click(function(){
				$("#btnWriteCard"+prodId).attr("disabled","disabled");
				var writeResultFlg;
				if(OrderInfo.actionFlag!=null && OrderInfo.actionFlag == 42){
					writeResultFlg=order.writeCard.essRepeatWriteCard(prodId);
				}else{
					writeResultFlg=order.writeCard.writeCard(prodId);
				}
				if (!writeResultFlg) {
					//$.alert("提示",'写卡失败!','error');
					return;
				}
				$("#btnWriteCard"+prodId).removeAttr("disabled");
				if (writeResultFlg){//写卡成功
					$.modal.close();
				}

			});
		},"submitCallBack":function(dialogForm,dialog){}});

	};
	
	var _readCard = function(prodId){
		_haveReadCard = true;
		if(!g_realWriteCard){
			var date = new Date();
			_rscJson.imsi = "1111111111111"+date.getMilliseconds();
			_rscJson.iccid = "89860314105350023801";
			if (_rscJson.iccid.length==20){
				_rscJson.iccid = _rscJson.iccid.substr(0,_rscJson.iccid.length-1);
			}
			$("#serialNum"+prodId).val(_rscJson.iccid);
			$("#serialNum").val("33333333333" + date.getMilliseconds());
			_cardInfoJson.cardTypeId = ("33333333333" + date.getMilliseconds()).substr(5,5);
			if(!_getCardType()){
				return false;
			}
			if(ec.util.isObj(_cardInfoJson.cardTypeId)){
				if(prod.changeUim.is4GProdInst&&(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23)){//判断是否有开通4G功能产品
					//var flag=false;//默认3G卡
					//for(var i=0;i<_4GCARDS.length;i++){
					//	if(_cardInfoJson.cardTypeId==_4GCARDS[i]){//4G卡
					//		flag=true;
					//		break;
					//	}
					//}
					//if(!flag){
					if(CONST.UIMTYPE3G4G.IS3G==prod.uim.getCardType("","",_cardInfoJson.serialNumber)){
						$.alert("信息提示","您已开通了【4G（LTE）上网】功能产品，而UIM卡是3G卡，请使用4G的白卡！");
						return false;
					}
				}
			 }
			return true;
		}
		// 读取ICCID 转
		var iccidResult =null;
		try{
			iccidResult = ec.util.defaultStr(ocx.strGetICCID());
		}catch(e){
			$.alert("提示","加载读卡插件失败,请检查是否已正确安装插件或浏览器正确设置!错误信息："+e.message,"error");
			return false;
		}
		//alert("iccidResult:"+iccidResult);
		var opCode1 = iccidResult.substring(iccidResult.length - 4,iccidResult.length);
		if (opCode1 == '') {
			$.alert("提示","读取卡失败!请确认卡连接是否正常!");
			return false;
		}
		if(prodId == undefined){
			if (opCode1 != '' && opCode1 != "FFFF") {
				$.alert("提示","卡片已有数据,不能重复写入!");
				return false;
			}
		}
		
		//var iccid = iccidResult.substring(0,iccidResult.length-5); 
		var iccid = iccidResult;
		
		//读取空卡序列号
		var serialNum = "";
		var result = ec.util.defaultStr(ocx.GetEmptyCardFile());//读卡器读取结果
		var opCode = result.substring(result.length - 5,result.length);
		//alert("opCode::"+opCode);
		
		// add by wangdan 9/11 start
		/*var columnValue = "";
		try{
			var qryConfigUrl=contextPath+"/mktRes/queryApConf";	
			var jr = $.callServiceAsJsonGet(qryConfigUrl);
			if(jr.code==0 && jr.data){
				for(var n=0;n<jr.data.length;n++){								
					if(jr.data[n].SERIALNUM_FILTER){									
						columnValue = jr.data[n].SERIALNUM_FILTER[0].COLUMN_VALUE;
					}								
										
				}
			}
		}catch(e){
			
		}#13318，所有的白卡都不截取，现直接入库*/
		//end
		if (opCode != '' && opCode != "FFFF") {
			//update by huangjj3 #13318，如果选择的是空白卡，cardNo需要做下逻辑处理
			var serviceName = contextPath + "/mktRes/writeCard/getAsciiToHex";
			var asciiFStr = result.substring(result.length-4,result.length);
			var param = {
				"asciiFStr":asciiFStr       
			};
			var response = $.callServiceAsJson(serviceName, param);
			
			var selUimCard = result.substring(0,result.length-4)+response.data.asciiStr;
			$("#uim_txt_"+prodId).val(selUimCard);
			$("#resultCardAsciiFStr").val(selUimCard);
			$("#resultCardNo").val(result);
			if($("#selUimType").val()!="4"){
				$("#selUimType").val("3");
				$("#selUim").val("2");//下拉框选择为空白卡
			}else{
				$("#selUim").val("4");
			}
			$("#uim_lable").attr("disabled",true);  
			serialNum = result;//#13318，所有的白卡都不截取，现直接入库
			factoryCode = result.substring(result.length - 2,result.length);
			//if(factoryCode==42){
			//	factoryCode=30;
			//}
		}
		var areaId = OrderInfo.getProdAreaId(prodId);
		/*areaId = areaId.substring(0,3) + "0000";
		//不要截取的  add by wangdan 9/11 start
		for(var i=0,nserialnumValues = columnValue.split(",");i< columnValue.length;i++){
			if (areaId == nserialnumValues[i]) {
				serialNum = result;
				break;
			}
		}#13318，所有的白卡都不截取，现直接入库*/
		//end
		//alert("serialNumber:="+_cardInfoJson.serialNumber);
		//如果读取到了空卡序列号就加载卡片信息
		if (ec.util.defaultStr(serialNum) != "") {
			_cardInfoJson.serialNumber = serialNum;
			_cardInfoJson.factoryCode = factoryCode;
			_cardInfoJson.cardTypeId = serialNum.substr(5,5);
			//alert("cardTypeId:"+_cardInfoJson.cardTypeId);
			
			//加载卡片信息
			/*chylg
			if (_initBlankCardTypeInfo() == false) {
				alert("加载卡片信息失败");
				return false;
			} else {
				selectMaterialId = _cardInfoJson.materialId;
				$("#cardType").find("option[value=" + selectMaterialId + "]").attr("selected",
						"selected");
			}
			*/
		}
		
		if(!_getCardType()){
			return false;
		}
		if(ec.util.isObj(_cardInfoJson.cardTypeId)){
			if(prod.changeUim.is4GProdInst&&(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23)){//判断是否有开通4G功能产品
				//var flag=false;//默认3G卡
				//for(var i=0;i<_4GCARDS.length;i++){
				//	if(_cardInfoJson.cardTypeId==_4GCARDS[i]){//4G卡
				//		flag=true;
				//		break;
				//	}
				//}
				if(CONST.UIMTYPE3G4G.IS3G==prod.uim.getCardType("","",_cardInfoJson.serialNumber)){
					$.alert("信息提示","您已开通了【4G（LTE）上网】功能产品，而UIM卡是3G卡，请使用4G的白卡！");
					return false;
				}
			}
		 }
		//alert("_cardInfoJson:="+JSON.stringify(_cardInfoJson));
		if (iccid == 'FFFFFFFFFFFFFFFFFFFF' || iccid == '00000000000000000000') {
			_cardInfoJson.canWrite = 'Y';
			$("#btnWriteCard"+prodId).css("display","");
			$("#serialNum"+prodId).val(_cardInfoJson.serialNumber);
			$("#iccid"+prodId).val(_rscJson.iccid);
			$("#imsi"+prodId).val(_rscJson.imsi);
			$("#cardTypeId"+prodId).val(_cardInfoJson.cardTypeId);
		} else {//成品卡
			_cardInfoJson.canWrite = 'N';
			//如果是受理中写卡，成品卡隐藏写卡按钮
			if (_settings.params.scene == "1") {
				$("#btnWriteCard"+prodId).css("display","none");
			}
			if (serialNum != null) {//白卡写出的成品卡
				$("#serialNum"+prodId).val(_cardInfoJson.serialNumber);
				$("#cardTypeId"+prodId).val(_cardInfoJson.cardTypeId);
			} else {//厂商生成的成品卡
				var bcdcode = iccid.substring(0,19); //原有成品卡取19位做终端码
				$("#serialNum"+prodId).val(bcdcode);
			}
		}
		return true;
	};
	
	var _writeCard = function(prodId){
		
		_haveWriteCard = false;//false;
		productId = prodId;
		//[start]模拟写卡
        if(!g_realWriteCard){
            _haveWriteCard = true;
            $.alert("提示","写卡成功!","confirmation");
            $("#uim_txt_"+prodId).val(_rscJson.iccid);
            var coupon = {
				couponUsageTypeCd : "3", //物品使用类型
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId :"10", //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.ACCT_ITEM_TYPE.UIM_CHARGE_ITEM_CD, //物品费用项类型
				couponNum : "1", //物品数量
				storeId : "8230010", //仓库ID
				storeName : "11", //仓库名称
				agentId : 1, //供应商ID
				apCharge : 0, //物品价格
				couponInstanceNumber : "8230007407312006106", //物品实例编码
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId :prodId, //产品ID
				state : "ADD", //动作
				relaSeq : "" //关联序列	
			};
            if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){
            	coupon.offerId = "-1";
            }else{
            	coupon.offerId = order.prodModify.choosedProdInfo.prodOfferInstId; //销售品实例ID
            }
    		OrderInfo.clearProdUim(prodId);
            OrderInfo.boProd2Tds.push(coupon);
            return true;
        }
		//[end]模拟写卡

		//写卡之前必须要先读卡
		if (!_haveReadCard) {
			$.alert("提示","请先读卡!","error");
			return false;
		}
		

		//写卡之前再读卡
		if (!_readCard()) {
			$.alert("提示","写卡前验证读卡验证时读卡失败，请确认设备是否连接好!","error");
			return false;
		}

		//if (_cardInfoJson.canWrite != 'Y') {
		//	$.alert("提示","插入的卡片是不是可写的白卡,该卡在库存中状态不是可写卡或者已经是成品卡，请换卡!","error");
		//	return false;
		//}
		//如果是黑莓手机写卡一定要是支持EVDO的CG双模卡
		var hmPesn = $("#pesn").val();
		
		if (hmPesn != undefined && hmPesn != "" && hmPesn != null) {
			cardType = _cardInfoJson.serialNumber.substr(6,2);
			if (cardType != '10') {
				$.alert("提示","黑莓手机终端配套的手机卡必须是支持EVDO的CG双模卡，请换支持EVDO的CG双模卡进行写卡!","error");
				return false;
			}
		}
		//alert("加载动态链接库");
		//加载动态链接库
		if (!_updateCardDll()) { return false; }
		
		//alert("加载动态链接库 end");
		
		//写卡之前必须调用DisConnectReader()函数断开写卡器，江苏恒宝的写卡方式
		var dkResult = ocx.DisConnectReader();
		if (dkResult != "0") {
			$.alert("提示","写卡之前,断开写卡器失败!","error");
			return false;
		}
		//客户端调用插件函数获取随机数
		var getResult = ocx.GetRandNum();
		//alert("随机数="+getResult);
		
		if (getResult.length != 16) {
			$.alert("提示","写卡异常:获取随机数失败！" + result,"error");
			return false;
		}
		var randomNum = getResult;
		//判断是否为8字节长的随机数
		if (randomNum.length != 16) {
			//alert('判断8字节');
			$.alert("提示","写卡异常:从卡商组件获取随机数不是8字节长的随机数！","error");
			return false;
		}
		//判断密码是否为空
		if (_cardDllInfoJson.dllPassword == "") {
			//alert('密码'+_cardDllPassword);
			$.alert("提示","写卡异常(组件鉴权密码不可为空)，请检查！","error");
			return false;
		}
		//alert("用获取的随机数生成鉴权码");
		/*-----------------------------用获取的随机数生成鉴权码 -------------------*/
		var authCode = null;
		serviceName = contextPath + "/mktRes/writeCard/authCode";
		try {
			var param = {
				randomNum:randomNum,
				dllPassword:_cardDllInfoJson.password,
				factoryCode:_cardDllInfoJson.factoryCode,
				authCodeType:_cardDllInfoJson.authcodeType
			};

			var response = $.callServiceAsJson(serviceName, param);
			var authCodeJson;
			if(response.code == 0){
				authCodeJson = response.data;
			}else{
				$.alertM(response.data);
				return false;
			}
			
			var code = authCodeJson.code;
			if (code != null && code == "POR-0000") {
				authCode = authCodeJson.authCode;
				//authCode ='B9488FBC60982B48';
				//alert('鉴权码='+authCode);
			} else {
				$.alert("提示","用获取的随机数生成鉴权码失败！","error");
				return false;
			}
		} catch(e) {
			$.alert("提示","用获取的随机数生成鉴权码异常!" + e.message,"error");
			return false;
		}
		//alert("用获取的随机数生成鉴权码authCode:" + authCode);
		/*-----------------------------用获取的鉴权密钥和生产的随机数生产鉴权码完成 -----------------*/

		//获得鉴权结果
		var auResult = ocx.Authentication(authCode);
		
		var opCode = auResult;
		if (opCode != "0") {
			$.alert("提示","鉴权失败！" + auResult,"error");
			return false;
		}
		/*------------------------准备工作完成，开始调用Active控件写卡----------------------------------------*/
		//先申请资源数据
		//if (!_applyResourceData(scope)){
		if (!_applyResourceData(prodId)) {
			//alert('申请卡数据以后');
			//如果申请资源数据失败
			return false;
		}
		
		//alert("调用组件写卡函数进行写卡");
		
		_haveWriteCard = true;
		//申请资源成功，写卡过程已经开始
		//调用组件写卡函数进行写卡，调用dep接口传入写卡数据。
		//$.alert("提示","写入数据_rscJson.data="+_rscJson.data+"\n\n写卡结果;authCode:"+authCode+";writeCardResult="+writeCardResult,"error");
		//alert("写入数据_rscJson.data="+_rscJson.data+"\n\n写卡结果;writeCardResult="+writeCardResult);
		//return false;
		//_rscJson.data = "89860311805101572698,460036700435919,8097808C,3760,9,FFFF,0bf0ad8280d2b0a0,1234,55900648,85232888,49600368,59EF72FB,460036700435919@mycdma.cn,75d6ecc6632fac57,460036700435919@mycdma.cn,30ffc6952e03ccd0;37623582e5265d5a;cdfd165333f66519,460036700435919@mycdma.cn,e43472656c30e82e;671ab8c55dbdb14f;16a7e838ae5db0fa,e51c11352e62e0ac;98e3ce89414d982a;cac02f2ef7d2544d,,,,";
		//_rscJson.data = "89860313007580411850,460030252801743,805BA245,3619,3,FFFF,123013c243731bc8,1234,51154902,74059570,96831988,90892996,460030252801743@mycdma.cn,059f7bdf8e3f4e12,460030252801743@mycdma.cn,e99eeb2f8c1ddf16;a4316f058ba1aedb;54034ca47e67108c;edfa87035ebe8a18;90719b0fea72386f,460030252801743@mycdma.cn,9aebd4cdfeeccfcb;529995a75de27bf9;f868720e8cc7ee48;5ee4410b4ca89979;9666d03a637b22ee,2479e9c1334e9337;795e86be92e2a431;df518cdb3c732c8f;d6c98a059b44ff3c;edb8698d619dc2d1,204043153514753,3,19e7126871e1eb11a85a4ae90b8daa7c,+316540942000";
		//_rscJson.data = "89860313900100000102,460036531190990,8000A876,13824,0,FFFF,a471b07640a45918,1234,66709721,78778797,85087049,B8C32115,460036531190990@mycdma.cn,63044385d047084c,460036531190990@mycdma.cn,c1d4f3f021172c63,460036531190990@mycdma.cn,5c3a505e7f018f7d,0dc6e3733d291f52,,,";
		//alert("xj:"+_rscJson.data);
		var writeCardResult = ocx.YXPersonalize(authCode,"",1,_rscJson.data,"");
		//alert("writeCardResult:"+writeCardResult);
		if (writeCardResult != "0") {
			//客户端提示：写卡失败时各卡商返回各自定义的错误信息 
			var paramLog = {
					mkt_res_inst_code : $("#resultCardNo").val(),
					iccid : $("#resultCardNo").val(),
					card_source : _cardDllInfoJson.dllName,
					err_desc :"写卡失败，请将白卡取出！错误编码=" + writeCardResult+"详细错误请联系卡商["+_cardDllInfoJson.remark+"]确认",
					acc_nbr : '',
					contact_record : ''
			};
			_writeCardLogInfo(paramLog);
			$.alert("提示","写卡失败，请将白卡取出！错误编码=" + writeCardResult+"详细错误请联系卡商["+_cardDllInfoJson.remark+"]确认","error");
			_completeWriteCard("1",writeCardResult);//写卡失败回填
			return false;
		} else {
			//写卡成功
			if (_completeWriteCard("00000000",writeCardResult)) {
				if(OrderInfo.actionFlag == 41){
					var url = contextPath + "/ess/order/writeCardMakeUp";
					$.callServiceAsJson(url,_essWriteCard, {
						"before" : function() {
							$.ecOverlay("正在串码回填，请稍等...");
						},
						"always" : function() {
							$.unecOverlay();
						},
						"done" : function(response) {
							if (response.code == 0) {
								$.confirm("提示","写卡成功,资源补录成功！",{ 
									yes:function(){
										window.location.href = contextPath+"/ess/order/remoteWriteCard";
									},
									no:function(){
										window.location.href = contextPath+"/ess/order/remoteWriteCard";
									}
								});
								return;
							} else if (response.code == -2) {
								$.alertM(response.data);
								return;
							} else if (response.code == 1002) {
								$.alert("错误", response.data);
								return;
							} else {
								$.alert("异常", "写卡成功,资源补录异常");
								return;
							}
						},
						fail : function(response) {
							$.unecOverlay();
							$.alert("提示", "请求可能发生异常，请稍后再试！");
						}
					});
				}else{
					$.alert("提示","恭喜，您已经成功写卡！");
				}
				$("#uim_check_btn_"+prodId).attr("disabled",true);
				$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
				return true;
			} else {
				//$.alert("提示","写卡成功，但卡资源下发异常","error");
				return false;
			}
		}
		return false;
	};
	
	var _updateCardDll = function(){
		
		//先清空组件信息JSON
		_cardDllInfoJson = {
			"authcodeType":"",	
			"dllId":"",
			"dllName":"",
			"dllVersion":"",
			"password":"",
			"factoryCode":""
		};//动态链接库JSON
		var serialNum = _cardInfoJson.serialNumber;
		//alert('serialNum'+serialNum);
		if (serialNum != undefined) {
			// 提取卡商代码
			
			var cardFatctoyCode = _cardInfoJson.factoryCode;
			
			
			// 根据卡商编码获取卡商最新版本插件DLL信息    
			if (!_getCardDllInfo(cardFatctoyCode)) {
				alert("提示","不能把厂商写卡组件下载到本机客户端!","error");
				return false;
			}
			// 加载卡商组件
			var isOk = _updateOrLoadDll();
			if (!isOk) { return false; }
			return true;
		} else {
			$.alert("提示","卡序列号值(serialNum=" + serialNum + ")不符合规范!","error");
			return false;
		}
	};
	var _recycleCard=function(scope){
		if (confirm("请你确定，你是否有权限进行清除卡数据操作！！")) {
			//-----------------------------------------------------------------------------
			if (!_readCard(scope)) {
				$.alert("提示","清卡前验证读卡验证时读卡失败，请确认设备是否连接好","error");
				return false;
			}
			//加载动态链接库
			if (!_updateCardDll(scope)) { return false; }
			// 卡片的合法性检测
			var result = ty_plugin.TyJsRps_CheckData();
			var opCode = result.substring(result.length - 4,result.length);
			if (opCode != "0000") {
				$.alert("提示","卡片合法性检测失败，请检查卡是否正确插入写卡设备中！","error");
				return false;
			}
			
			// 是否白卡: 0|0000--白卡  1|0000--成品卡
			var isblank = result.substr(0,1);
			
			if (isblank != 0) {
				$.alert("提示","您插入的是成品卡，可以进行清卡操作！","error");
			} else {
				$.alert("提示","您插入的不是成品卡，不可以进行清卡操作！","error");
				return false;
			}
			//-----------------------------------------------------------------------------
			
			//客户端调用插件的TyJsRps_GetRandNum函数获取随机数
			var result = ty_plugin.TyJsRps_GetRandNum();
			var opCode = result.substring(result.length - 4,result.length);
			if (opCode != "0000") {
				$.alert("提示","获取随机数失败！","error");
				return false;
			}
			randomNum = result.substring(0,result.length - 5);
			
			//判断是否为8字节长的随机数
			if (randomNum.length != 16) {
				$.alert("提示","从卡商组件获取随机数不是8字节长的随机数！","error");
				return false;
			}
			
			//获取随机数并利用组件鉴权密码进行3DES加密
			var authCode = null;
			var client = new bss.serviceframework.ajax.client( {
				timeout:40000,
				timeoutHandle:function(){
					$.alert("提示","超时","error");
					return false;
				}
			});
			//获取鉴权码
			var serviceName = "bss.writeCard.writeCardFacade.getAuthCode";
			var client = new bss.serviceframework.ajax.client( {
				timeout:40000,
				timeoutHandle:function(){
					$.alert("提示","超时","error");
					return false;
				}
			});
			try {
				var response = client.callServiceAsJson(serviceName, {
					"randomNum":randomNum,
					"dllInfo":_cardDllInfoJson
				});
				var authCodeJson = response.getBodyAsJson();
				var flag = authCodeJson.flag;
				if (flag != null && flag == "0") {
					authCode = authCodeJson.authCode;
				} else {
					$.alert("提示","利用组件鉴权密码对随机数进行3DES加密失败！","error");
				}
			} catch(e) {
				$.alert("提示","请求组件鉴权密码对随机数进行3DES加密失败!","error");
				return false;
			}
			
			//调用组件清卡函数
			var result = ty_plugin.TyJsRps_ClearCard(authCode);
			var opCode = result.substring(result.length - 4,result.length);
			if (opCode != "0000") {
				alert("清除卡数据失败！");
				return false;
			} else {
				alert("除卡数据成功！");
			}
			// 卡片的合法性检测
			var result = ty_plugin.TyJsRps_CheckData();
			var opCode = result.substring(result.length - 4,result.length);
			if (opCode != "0000") {
				$.alert("提示","卡片合法性检测失败，请检查卡是否正确插入写卡设备中！","error");
				return false;
			}
			// 是否白卡: 0|0000--白卡  1|0000--成品卡
			var isblank = result.substr(0,1);
			if (isblank == 0) {
				//调用后台完成数据库中数据的变化操作,暂提供
			}
			//卸载动态链接库
			_unloadDll(scope);
			return true;
		}
	};
	
	_getCardDllInfo=function(factoryCode,scope){
		//先清掉g_cardDllInfoJson
		_cardDllInfoJson = null;
		try {
			if (factoryCode != undefined) {
				var writeCardNewDLL = $("#selUimType").val();//写卡新组件开关
				//alert("厂商编码2："+factoryCode);
				if(writeCardNewDLL=='4'){
					var serviceName = contextPath + "/mktRes/writeCard/cardDllInfo";
					var param = {
						"factoryCode":factoryCode,
						"cardType":"newCard"
					};
					var cardDllInfoJson;
					var response = $.callServiceAsJson(serviceName, param);
					
					if(response.code == 0){
						cardDllInfoJson = response.data.cardDllInfo;
					}else{
						$.alertM(response.data);
						return false;
					}
					//alert("cardDllInfoJson:"+JSON.stringify(cardDllInfoJson));
					var dllId = cardDllInfoJson.dllId;
					if (dllId == undefined || dllId == null || dllId == "") {
						var paramLog = {
								mkt_res_inst_code : $("#resultCardNo").val(),
								iccid : $("#resultCardNo").val(),
								card_source : cardDllInfoJson.dllName,
								err_desc : "卡商(编码=" + factoryCode + ")获取不到对应的组件信息！",
								acc_nbr : '',
								contact_record : ''
						};
						_writeCardLogInfo(paramLog);
						$.alert("提示","卡商(编码=" + factoryCode + ")获取不到对应的组件信息！","error");
						return false;
					}
					_cardDllInfoJson = cardDllInfoJson;
				
				}else{
					var serviceName = contextPath + "/mktRes/writeCard/cardDllInfo";
					var param = {
						"factoryCode":factoryCode,
						"cardType":"oldCard" 
					};
					var cardDllInfoJson;
					var response = $.callServiceAsJson(serviceName, param);
					
					if(response.code == 0){
						cardDllInfoJson = response.data.cardDllInfo;
					}else{
						$.alertM(response.data);
						return false;
					}
					//alert("cardDllInfoJson:"+JSON.stringify(cardDllInfoJson));
					var dllId = cardDllInfoJson.dllId;
					if (dllId == undefined || dllId == null || dllId == "") {
						var paramLog = {
								mkt_res_inst_code : $("#resultCardNo").val(),
								iccid : $("#resultCardNo").val(),
								card_source : cardDllInfoJson.dllName,
								err_desc : "卡商(编码=" + factoryCode + ")获取不到对应的组件信息！",
								acc_nbr : '',
								contact_record : ''
						};
						_writeCardLogInfo(paramLog);
						$.alert("提示","卡商(编码=" + factoryCode + ")获取不到对应的组件信息！","error");
						return false;
					}
					_cardDllInfoJson = cardDllInfoJson;
				}
				
				return true;
			} else {
				$.alert("提示","卡商编码值不可为空！","error");
				return false;
			}
		} catch(e) {
			$.alert("提示","获取卡商组件信息时异常!" + e.message,"error");
			var paramLog = {
					mkt_res_inst_code : $("#resultCardNo").val(),
					iccid : $("#resultCardNo").val(),
					card_source : '',
					err_desc : "获取卡商组件信息时异常!" + e.message,
					acc_nbr : '',
					contact_record : ''
			};
			_writeCardLogInfo(paramLog);
			return false;
		}
	};
	_updateOrLoadDll=function(){
		//_cardDllInfoJson = {"dllId":"","dllName":"","dllVersion":"","dllPassword":"","factoryCode":""};//动态链接库JSON
		//先判断组件是否存在
		//alert("_updateOrLoadDll=="+_cardDllInfoJson.dllName);
		var fso = new ActiveXObject('Scripting.FileSystemObject');
		try {
			fso.GetFile("C:\\WINDOWS\\system32\\" + _cardDllInfoJson.dllName + ".DLL");
			var serviceName = contextPath + "/mktRes/writeCard/writecardLog";
			var param = {
					factoryCode:_cardDllInfoJson.factoryCode,
					authCodeType:_cardDllInfoJson.authCodeType,
					version:_cardDllInfoJson.dllName,
					serviceCode:OrderInfo.busitypeflag,
					isUpdate:'0',//表示不需要更新
					cardSource:_cardDllInfoJson.remark
				};
			$.callServiceAsJson(serviceName, param);
		} catch(e) {
			$("#cardupdate").attr("href","https://ct.crm.189.cn/phoneimg/card/"+ _cardDllInfoJson.dllName+".DLL");
			$("#writeTitle").html("写卡组件更新");
			$("#rcard").hide();
			$("#dllName").html(_cardDllInfoJson.dllName+".DLL");
			$("#cardt").show();
			var serviceName = contextPath + "/mktRes/writeCard/writecardLog";
			var param = {
					factoryCode:_cardDllInfoJson.factoryCode,
					authCodeType:_cardDllInfoJson.authCodeType,
					version:_cardDllInfoJson.dllName,
					serviceCode:OrderInfo.busitypeflag,
					isUpdate:'1',//表示需要更新
					cardSource:_cardDllInfoJson.remark
				};
			$.callServiceAsJson(serviceName, param);
			//$.alert("提示","您插入白卡的卡商写卡组件不存在，请将组件下载保存到C:\\WINDOWS\\system32 目录下！","error");
			//$.alert("提示","您当前使用的卡组件的版本已更新，请下载更新至最新的版本[" + _cardDllInfoJson.dllVersion + "]后重新写卡。");
			//var url = contextPath + "/card/"+ _cardDllInfoJson.dllName+".DLL";
			//location.href = url;
			var paramLog = {
					mkt_res_inst_code : $("#resultCardNo").val(),
					iccid : $("#resultCardNo").val(),
					card_source : _cardDllInfoJson.dllName,
					err_desc : '写卡组件未更新',
					acc_nbr : '',
					contact_record : ''
			};
			_writeCardLogInfo(paramLog);
			return false;
		}
		//alert("fso=="+fso);
		//装载组件
		var loaddll = ocx.TransferDll(_cardDllInfoJson.dllName + ".DLL");
		if (loaddll != '0') {
			$.alert("提示","您插入白卡的卡商写卡组件不存在，请将组件下载保存到以下目录：<br/>32位系统 C:\\Windows\\System32<br/>64位系统 C:\\Windows\\SysWOW64<br/>","error");
			var url = "https://ct.crm.189.cn/phoneimg/card/"+ _cardDllInfoJson.dllName + ".DLL";
			location.href = url;
			return false;
		}
		//alert("loaddll=="+loaddll);
		// 读取组件版本号
		var version = ocx.GetDllVersion();
		//alert("version: " + version);
		// 组件版本不是最新, 执行更新
		if (version != _cardDllInfoJson.dllVersion) {
			var writeCardNewDLL = $("#selUimType").val();//写卡新组件开关
			if(writeCardNewDLL == "4"){
				$.alert("提示","您当前您使用的是测试卡组件版本为[" + version + "]，目前系统对应的卡组件版本为[" + _cardDllInfoJson.dllVersion + "]请使用与系统卡组件相对应的卡进行写卡。");
			}else{
				$.alert("提示","您当前使用的白卡组件版本为[" + version + "]，目前系统对应的卡组件版本为[" + _cardDllInfoJson.dllVersion + "]请使用与系统卡组件相对应的卡进行写卡。");
			}
//			alert("您插入白卡的卡商写卡组件不是最新版本，请将最新版本组件下载保存到C:\\WINDOWS\\system32 目录下!");
//			var url = contextPath + "/card/"+ _cardDllInfoJson.dllName;
//			location.href = url;
			return false;
		}
		return true;
	};
	
	_applyResourceData=function(prodId){
		//先清空之前的资源数据
			//写卡请求的参数： 手机号码，卡产品编号，归属地区号
			//漫游地区号，登陆工号，工号名称，营业厅标识，营业厅名称
			_rscJson = {
				"iccid":"",
				"imsi":"",
				"data":"",
				"dataLength":"0",
				"state":"N",
				"prodId":""
			};//卡数据资源JSON state:N 为不可用来写卡 Y 为可以

			//请求后返回给客户端的数据直接是可以写卡的暗文
			var serviceName = contextPath + "/mktRes/writeCard/cardInfo";
						
			try {
				//alert(JSON.stringify(order.prodModify.choosedProdInfo));
				// 提取卡商代码
				var areaCode = OrderInfo.getAreaCode(prodId);
				if (areaCode == undefined || areaCode ==""){
					areaCode = OrderInfo.staff.areaCode;
				}
				var param = {
					factoryCode:_cardDllInfoJson.factoryCode,
					authCodeType:_cardDllInfoJson.authCodeType,
					hmUimid:'',//黑莓
					cardNo:_cardInfoJson.cardTypeId,
					phoneNumber:OrderInfo.getAccessNumber(prodId),
					areaId:OrderInfo.getProdAreaId(prodId),
					areaCode:areaCode,//归属地区号
					fromAreaCode:OrderInfo.staff.areaCode//漫游地区号
				};
				if(OrderInfo.actionFlag != null && (OrderInfo.actionFlag == 41 || OrderInfo.actionFlag == 42)){
					param.essWriteCard = 'Y';//标志ESS页面的操作
					param.iccserial = _cardInfoJson.serialNumber;
					param.iccid = $("#resultCardNo").val();
					param.serviceCode = OrderInfo.busitypeflag;//新增一个动作表示，用于记日志update by huangjj
					param.remark = _cardDllInfoJson.remark;
					param.extCustOrderId = OrderInfo.essOrderInfo.essOrder.extCustOrderId;
				}
				var resourceDataJson;
				var response = $.callServiceAsJson(serviceName, param);
				if(response.code == 0){
					resourceDataJson = response.data.cardInfo;
					_TransactionID = response.data.TransactionID;
				}else{
					var paramLog = {
							mkt_res_inst_code : $("#resultCardNo").val(),
							iccid : $("#resultCardNo").val(),
							card_source : _cardDllInfoJson.dllName,
							err_desc : response.data.errMsg,
							acc_nbr : OrderInfo.getAccessNumber(prodId),
							contact_record : ''
					};
					_writeCardLogInfo(paramLog);
					$.alertM(response.data);
					return false;
				}
				//alert(JSON.stringify(response));
				var flag = resourceDataJson.flag;
				if (flag != undefined && flag == "0") {
					_rscJson = {
						"iccid":"",
						"imsi":"",
						"imsig":"",
						"data":"",
						"state":"Y",
						"uimid":"",
						"sid":"",
						"accolc":"",
						"nid":"",
						"akey":"",
						"pin1":"",
						"pin2":"",
						"puk1":"",
						"puk2":"",
						"imsilte":"",
//						"adm":"",
//						"hrpdupp":"",
//						"hrpdss":"",
//						"imsig":"",
//						"acc":"",
//						"smsp":"",
						"prodId":""
					};
					_rscJson.iccid = resourceDataJson.iccid;
					_rscJson.imsi = resourceDataJson.imsi;
					_rscJson.imsig = resourceDataJson.imsig;
					_rscJson.uimid = resourceDataJson.uimid;
					_rscJson.sid = resourceDataJson.sid;
					_rscJson.accolc = resourceDataJson.accolc;
					_rscJson.nid = resourceDataJson.nid;
					_rscJson.akey = resourceDataJson.akey;
					_rscJson.pin2 = resourceDataJson.pin2;
					_rscJson.pin1 = resourceDataJson.pin1;
					_rscJson.puk1 = resourceDataJson.puk1;
					_rscJson.puk2 = resourceDataJson.puk2;
					_rscJson.imsilte = resourceDataJson.imsilte;
					_rscJson.data = resourceDataJson.data;
					_rscJson.dataLength = resourceDataJson.dataLength;
					_rscJson.prodId = prodId;
					return true;
				} else {
					var msg = resourceDataJson.msg;
					var paramLog = {
							mkt_res_inst_code : $("#resultCardNo").val(),
							iccid : $("#resultCardNo").val(),
							card_source : _cardDllInfoJson.dllName,
							err_desc : "请求可写卡的资源数据失败:" + msg,
							acc_nbr : OrderInfo.getAccessNumber(prodId),
							contact_record : _TransactionID
					};
					_writeCardLogInfo(paramLog);
					if (msg != undefined) {
						$.alert("提示","请求可写卡的资源数据失败:" + msg,"error");
					} else {
						$.alert("提示","请求可写卡的资源数据失败" ,"error");
					}
					return false;
				}
			} catch(e) {
				$.alert("提示","请求可写卡的资源数据异常!" + e.message ,"error");
				return false;
			}
		};
	_completeWriteCard=function(result,resultCode){
			var serviceName = contextPath + "/mktRes/writeCard/completeWriteCard";
			var srInParam = {
				"areaId": OrderInfo.getProdAreaId(_rscJson.prodId),
			    "InoutInfo": {
			        "ApplyNo": "001",
			        "InoutId": "",
			        "BillType": "2",
			        "SaleNo": "",
			        "BatchId": "",
			        "OperationType": "1100",
			        "MktResStoreId": "",
			        "ChannelId": OrderInfo.staff.channelId,
			        "AreaId": OrderInfo.getProdAreaId(_rscJson.prodId),
			        "StaffId": OrderInfo.staff.staffId
			    },
			    "MktResInstInfos": [
			        {
			            "MktResInstInfo": {
			                "BaseInfo": {
			                    "MktResTypeCd": "",
			                    "StatusCd" : "2",
			                    "MktResId": "",
			                    "MktResCd": _cardInfoJson.cardTypeId,
			                    "MktResInstCode": _cardInfoJson.serialNumber,    //_rscJson.iccid,
			                    "SalesPrice": "0",
			                    "CostPrice": "0",
			                    "Quantity": "1",
			                    "Unit": "101"
			                },
			                
//			                60020005：ICCID
//			                60020002：C-IMSI(3G)
//			                60020003：G-IMSI
//			                60020004:L-IMSI(4G)
//			                65010026:PIN1
//			                65010027:PIN2
//			                65010028:PUK1
//			                65010029:PUK2
//			                65010030:管理密码(ADM)
//			                65010033:UIMID
//			                65010035:AKEY
//			                65010037:NID
//			                65010038:ACCOL
			                
			              "AttrList": [
			                             
								{
								    "AttrId": "60020005",
								    "AttrValue": _rscJson.iccid
								},
								{
								    "AttrId": "60020002",
								    "AttrValue": _rscJson.imsi
								},
								{
								    "AttrId": "60020003",
								    "AttrValue":  _rscJson.imsig
								},
								{
								    "AttrId": "60020004",
								    "AttrValue": _rscJson.imsilte
								},
								{
								    "AttrId": "65010026",
								    "AttrValue": _rscJson.pin1
								},
								{
								    "AttrId": "65010027",
								    "AttrValue": _rscJson.pin2
								},
								{
								    "AttrId": "65010028",
								    "AttrValue": _rscJson.puk1
								},
								{
								    "AttrId": "65010029",
								    "AttrValue": _rscJson.puk2
								},
								{
								    "AttrId": "65010030",
								    "AttrValue": _rscJson.adm
								},
								{
								    "AttrId": "65010033",
								    "AttrValue":  _rscJson.uimid
								},
								{
								    "AttrId": "65010035",
								    "AttrValue": _rscJson.akey
								},  
								{
								    "AttrId": "65010037",
								    "AttrValue": _rscJson.nid
								},
								{
								    "AttrId": "65010038",
								    "AttrValue": _rscJson.accolc
								},
								{
								    "AttrId": "60029003",
								    "AttrValue": OrderInfo.staff.channelId
								},
								{
								    "AttrId": "60029004",
								    "AttrValue": _cardDllInfoJson.remark
								},
								{
								    "AttrId": "60029005",
								    "AttrValue": _cardDllInfoJson.dllVersion
								},
								{
								    "AttrId": "65010019",
								    "AttrValue": OrderInfo.getProdAreaId(_rscJson.prodId)
								}
			                ]
			            }
			        }
			    ]
					
			};
			var param = {
				imsi:_rscJson.imsi,     
				iccserial:_cardInfoJson.serialNumber,     
				iccid:_rscJson.iccid,  
				resultCode:result,
				resultMessage:"写卡器返回结果编码"+resultCode,
				phoneNumber:OrderInfo.getAccessNumber(_rscJson.prodId),
				cardType:_cardInfoJson.cardTypeId,
				eventType:"2",
				areaId:OrderInfo.getProdAreaId(_rscJson.prodId),
				serviceCode:OrderInfo.busitypeflag,//新增一个动作表示，用于记日志update by huangjj
				TransactionID:_TransactionID,
				remark:_cardDllInfoJson.remark,
				"srInParam":srInParam
			};
			if(OrderInfo.actionFlag != null && (OrderInfo.actionFlag == 41 || OrderInfo.actionFlag == 42)){
				param.essWriteCard = 'Y';//标志ESS页面的操作
				param.extCustOrderId = OrderInfo.essOrderInfo.essOrder.extCustOrderId;
			}
			try {
				
				var eventJson;
				var response = $.callServiceAsJson(serviceName, param);
				eventJson = response.data;
				//alert(JSON.stringify(response));
				
				if (!response) {
					$.alert("提示","<br/>写卡成功后且未响应数据卡资源回填到卡管系统异常,请稍后重试。");
					var paramLog = {
							mkt_res_inst_code : $("#resultCardNo").val(),
							iccid : _rscJson.iccid,
							card_source : _cardDllInfoJson.dllName,
							err_desc : "写卡成功后未响应数据卡资源回填到卡管系统异常,请稍后重试。",
							acc_nbr : OrderInfo.getAccessNumber(_rscJson.prodId),
							contact_record : _TransactionID
					};
					_writeCardLogInfo(paramLog);
					return;
				}
			   if(response.code != 0) {
					$.alert("提示","<br/>写卡成功后调用卡资源回填到卡管系统异常,请稍后重试。");
					if(response.data !="" && response.data !=undefined){
						alertMM(response.data);
					}
					var paramLog = {
							mkt_res_inst_code : $("#resultCardNo").val(),
							iccid : _rscJson.iccid,
							card_source : _cardDllInfoJson.dllName,
							err_desc : "写卡成功后卡资源回填到卡管系统异常,请稍后重试。错误原因："+response.data.errMsg,
							acc_nbr : OrderInfo.getAccessNumber(_rscJson.prodId),
							contact_record : _TransactionID
					};
					_writeCardLogInfo(paramLog);
					return;
				}
				//var eventJson = response.data;
				if (eventJson.code != 0) {
					$.alert("提示","写卡成功后调用卡资源回填到卡管系统异常！错误原因：" + eventJson.message,"error");
					return;
				}
//				var flag = eventJson.code;
//				var msg = eventJson.message;
//				if (flag != "0") {
//					$.alertM(response.data);
//					//$.alert("提示","调用卡资源回填到卡管系统异常！" + msg,"error");
//					return false;
//				}

				if(response.code == 0) {
					 //写卡成功后把卡数据入库便于异常单释放
					var phoneNumber = OrderInfo.getAccessNumber(_rscJson.prodId);
					_rscJson.phoneNumber = phoneNumber;
					var inParam = {
							"instCode" : $("#resultCardAsciiFStr").val(),
							"phoneNum" : phoneNumber,
							"remark": "3",//
							"areaId"   : OrderInfo.getProdAreaId(_rscJson.prodId)
					};
					var serviceUrl = contextPath + "/mktRes/writeCard/intakeSerialNumber";
					$.callServiceAsJson(serviceUrl, inParam);
				}
				_backFillOrderCardInfo(eventJson.result);
				return true;
			} catch(e) {
				$.alert("提示","写卡入库成功后订单数据填充异常！错误原因" + e.message,"error");
				var paramLog = {
						mkt_res_inst_code : $("#resultCardNo").val(),
						iccid :_rscJson.iccid,
						card_source : _cardDllInfoJson.dllName,
						err_desc : "写卡入库成功后订单数据填充异常！错误原因" + e.message,
						acc_nbr : OrderInfo.getAccessNumber(_rscJson.prodId),
						contact_record : _TransactionID
				};
				_writeCardLogInfo(paramLog);
				return false;
			}
	};
	_backFillOrderCardInfo=function(result){
		//要求截取前19位编码
		try {
			if (_rscJson.iccid.length==20){
				_rscJson.iccid = _rscJson.iccid.substr(0,_rscJson.iccid.length-1);
			}
			$("#uim_txt_"+_rscJson.prodId).val($("#resultCardAsciiFStr").val());
			var resp = $.callServiceAsJson(contextPath+"/mktRes/terminal/infoQueryByCode", {instCode:_cardInfoJson.serialNumber,"areaId": OrderInfo.getProdAreaId(_rscJson.prodId)});//mark 根据串码获取卡类型，异地补换卡，获取产品的地区
			if(resp.code ==0&&ec.util.isObj(resp.data.mktResBaseInfo)&&ec.util.isObj(resp.data.mktResBaseInfo.mktResId)){
				result.mktResId = resp.data.mktResBaseInfo.mktResId;
			}else{
				if(ec.util.isObj(resp.data.resultMsg)){
					$.alert("信息提示","根据串码："+_cardInfoJson.serialNumber+"获取卡类型失败！失败原因："+resp.data.resultMsg);
					return ;
				}else{
					$.alert("信息提示","根据串码："+_cardInfoJson.serialNumber+"获取卡类型失败！失败原因未返回！");
					return ;
				}				
			}
		} catch(e) {
			$.alert("提示","根据串码："+_cardInfoJson.serialNumber+"获取卡类型失败！错误原因" + e.message,"error");
			var paramLog = {
					mkt_res_inst_code : $("#resultCardNo").val(),
					iccid :_rscJson.iccid,
					card_source : _cardDllInfoJson.dllName,
					err_desc : "根据串码："+_cardInfoJson.serialNumber+"获取卡类型失败！错误原因" + e.message,
					acc_nbr : OrderInfo.getAccessNumber(_rscJson.prodId),
					contact_record : _TransactionID
			};
			_writeCardLogInfo(paramLog);
			return false;
		}
		 if (OrderInfo.actionFlag == 41) {// ESS远程写卡
			 _essWriteCard = {
				extCustOrderId : OrderInfo.essOrderInfo.essOrder.extCustOrderId,
			    commonRegionId : OrderInfo.essOrderInfo.essOrder.commonRegionId,
				mktResInst :{
					mktResCd : resp.data.mktResBaseInfo.mktResCd+"",
					mktResType : resp.data.mktResBaseInfo.mktResTypeCd,
					mktResInstCode : resp.data.mktResBaseInfo.instCode,
					mktResStoreId : resp.data.mktResBaseInfo.mktResStoreId+"",
					orderItemGroupId : OrderInfo.essOrderInfo.essOrder.orderItemGroupId,
					quantity : "1",
					salesPrice : "0",
					attr :[{
						attrId: "21011203",
						attrVal: _rscJson.imsi
					},{
						attrId: "21011202",
						attrVal: _rscJson.iccid
					},{
						attrId: "20002010",
						attrVal: _rscJson.imsig
					},{
						attrId: "60020004",
						attrVal: _rscJson.imsilte
					}]
				}
			};
		}
		 var coupon= {
					couponUsageTypeCd : "3", // 物品使用类型
					inOutTypeId : "1",  //出入库类型
					inOutReasonId : 0, //出入库原因
					saleId : 1, //销售类型
					couponId :result.mktResId, //物品ID
					couponinfoStatusCd : "A", //物品处理状态
					chargeItemCd : CONST.ACCT_ITEM_TYPE.UIM_CHARGE_ITEM_CD, //物品费用项类型
					couponNum : "1", //物品数量
					storeId : result.mktStoreId, //仓库ID
					storeName : "11", //仓库名称
					agentId : 1, //供应商ID
					apCharge : 0, //物品价格
					couponInstanceNumber : _cardInfoJson.serialNumber,  //物品实例编码 _rscJson.iccid
					ruleId : "", //物品规则ID
					partyId : OrderInfo.cust.custId, //客户ID
					prodId :_rscJson.prodId, //产品ID
					offerId : "", //销售品实例ID
					state : "ADD", //动作
					cardTypeFlag:2,
					uimType:"2",//标识用于订单成功更新订单状态
					relaSeq : "" //关联序列	
				};
		 try{
			  if(ec.util.isObj(_cardInfoJson.cardTypeId)) {
				 var uimCardType = prod.uim.getCardType("", "", _cardInfoJson.serialNumber);
				 if (CONST.UIMTYPE3G4G.IS4G == uimCardType) {//4G卡
					 coupon.cardTypeFlag = 1;
				 }
				 //补换卡和异地补换卡增加4g卡不能补3g卡的限制
				 if(prod.changeUim.is4GProdInst&&(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23)){//判断是否有开通4G功能产品
						if(CONST.UIMTYPE3G4G.IS3G==uimCardType){
							$.alert("信息提示","您已开通了【4G（LTE）上网】功能产品，而UIM卡是3G卡，请使用4G的白卡！");
							return false;
						}
					}
			 }
	         if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){
	         	coupon.offerId = "-1";
	         }else{
	         	coupon.offerId = order.prodModify.choosedProdInfo.prodOfferInstId; //销售品实例ID
	         }
	 		 OrderInfo.clearProdUim(_rscJson.prodId);
	         OrderInfo.boProd2Tds.push(coupon);
	         if((OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23) && coupon.cardTypeFlag==1 && order.prodModify.choosedProdInfo.productId != '280000000'){
	        	AttachOffer.openServList = [];
	     		AttachOffer.openList = [];
	     	    AttachOffer.queryCardAttachOffer(coupon.cardTypeFlag);  //加载附属销售品
	      	 }
		 } catch(e) {
				$.alert("提示","您已开通了【4G（LTE）上网】功能产品，而UIM卡是3G卡，请使用4G的白卡！错误原因：" + e.message,"error");
				var paramLog = {
						mkt_res_inst_code : $("#resultCardNo").val(),
						iccid :_rscJson.iccid,
						card_source : _cardDllInfoJson.dllName,
						err_desc : "您已开通了【4G（LTE）上网】功能产品，而UIM卡是3G卡，请使用4G的白卡！错误原因：" + e.message,
						acc_nbr : OrderInfo.getAccessNumber(_rscJson.prodId),
						contact_record : _TransactionID
				};
				_writeCardLogInfo(paramLog);
				return false;
		}
 		//3转4弹出促销窗口//查询卡类型
 		var oldCardis4GCard = "";
 		if(ec.util.isObj(_rscJson.prodId)&& _rscJson.prodId>=0){//不为新装
 			var param ={
 					prodInstId	: _rscJson.prodId,
 					areaId		: order.prodModify.choosedProdInfo.areaId,
 					acctNbr		: _rscJson.phoneNumber
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
 		if(oldCardis4GCard == "N" && coupon.cardTypeFlag==1){
 			var prodId = _rscJson.prodId;
 			$("#isShow_"+prodId).show();
 			var prodSpecId = OrderInfo.getProdSpecId(prodId);
 			var param = {
 				prodSpecId : prodSpecId,
 				offerSpecIds : [],
 				queryType : "3",
 				prodId : productId,
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
 			try{
	 			param.offerRoleId = offerRoleId;
	 			param.offerSpecIds.push(prodInfo.prodOfferId);
	 			var data = query.offer.queryCanBuyAttachSpec(param);
	 			if(data != undefined && data.resultCode == "0" && data.result.offerSpecList.length > 0){ 				
	 				var attachOfferList = CacheData.getOfferList(_rscJson.prodId);//已订购附属销售品
	 				var content = '<form id="promotionForm"><table>';
	 				var selectStr = "";
	 				var optionStr = "";
	 				selectStr = selectStr + "<tr><td>可订购促销包: </td><td><select class='inputWidth183px' id=" + accNbr + "><br>"; 
	 				
	 				//循环遍历可订购附属销售品
	 				$.each(data.result.offerSpecList,function(){
	 					var offerSpec = this;
	 					var offerSpecId = this.offerSpecId;
						var offerSpecName = this.offerSpecName;
						var ifOrderAgain = this.ifOrderAgain;//是否可以重复订购
						var ifDueOrderAgain = this.ifDueOrderAgain;//当月到期是否可以重复订购
						
						if(attachOfferList != undefined && attachOfferList.length > 0){
							//循环遍历已订购附属销售品
							$.each(attachOfferList,function(){
								//如果可订购附属在已订购列表中
								if(this.offerSpecId == offerSpecId && this.isDel != "C"){
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
								} else{
									//如果该可订购附属没有在已订购列表中，则不过滤
									optionStr += '<option value="' + offerSpecId + '">' + offerSpecName + '</option>';
								}
							});
						} else{
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
	 	                AttachOffer.selectAttachOffer(productId,offerSpecId);
	 				}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
	 				
	 			}
 			} catch(e) {
 				$.alert("提示","促销可选包弹出框弹出！错误原因：" + e.message,"error");
 				var paramLog = {
 						mkt_res_inst_code : $("#resultCardNo").val(),
 						iccid :_rscJson.iccid,
 						card_source : _cardDllInfoJson.dllName,
 						err_desc : "促销可选包弹出框弹出！错误原因：" + e.message,
 						acc_nbr : OrderInfo.getAccessNumber(_rscJson.prodId),
 						contact_record : _TransactionID
 				};
 				_writeCardLogInfo(paramLog);
 				return false;
 			}
 		}
	};
	var _getCardType=function(){
		var response = $.callServiceAsJson(contextPath + "/mktRes/writeCard/getCardType", {});
		if(response.code == 0){
			if(response.data){
				_4GCARDS=[];
				for(var n=0;n<response.data.length;n++){								
					if(response.data[n].COLUMN_VALUE!="00311"){	
						_4GCARDS.push(response.data[n].COLUMN_VALUE);
					}								
				}
				return true;
			}
		}else{
			$.alertM(response.data);
			return false;
		}
		return false;
	};
	
	var alertMM = function(err){//此方法仅针对写卡出错的弹出框。
		var rand = ec.util.getNRandomCode(5);
		var opId = "alertMoreOp" + rand;
		var contId = "alertMoreContent" + rand;
		var c  = '<div>';
			c += '<div class="am_baseMsg">错误编码【'+ec.util.defaultStr(err.errCode, "未知") + '】' + ec.util.defaultStr(err.errMsg, "未知")+'</div>';
		    c += '<div class="am_more"><a id="'+ opId +'" href="javascript:void(0);" onclick="">&nbsp;【更多】&nbsp;</a></div>';
		    c += '<div id="'+ contId +'" class="am_moreMsg"><font>【详细信息】</font><br/>';
		    c += '<font>异常信息：</font><br/><span>'+ec.util.encodeHtml(ec.util.defaultStr(err.errData, "未知"))+'</span><br/>';
		    c += '<font>入参：</font><br/><span>'+ec.util.encodeHtml(ec.util.defaultStr(err.paramMap, "未知"))+'</span><br/>';
		    if (err.resultMap) {
		    	c += '<font>回参：</font><br/><span>'+ec.util.defaultStr(err.resultMap, "未知")+'</span><br/>';
		    }
		    c += '</div></div>';
		
		new $.Zebra_Dialog(c, {
			'keyboard'	:true,
        	'modal'		:true,
        	'animation_speed':500,
        	'overlay_close':false,
        	'overlay_opacity':.5,
            'type'		: "error",
            'title'		: "异常信息",
            'position' 	: ['left + 380', 'top + 100'],
            'width'		: 430,
            'buttons'	: ['确定']
		});
		
		$("#"+contId).slideDown("normal");
		
		
//		$("#alertMoreOp").off("click").on("click",function(){$("#alertMoreContent").slideDown("slow");});
		$("#"+opId).off("click").toggle(
			function(){
				$("#"+contId).slideDown("normal");
			},
			function(){
				$("#"+contId).slideUp("fast");
			}
		);
	};
	
	var _essWriteReadCard=function(phoneNumber,extCustOrderId,orderNeedAction,commonRegionId,zoneNumber){
		OrderInfo.actionFlag = 41 ;
		_essWriteCard = {};
		var orderItemGroupId = $("#"+phoneNumber).val();
		var essOrder = {
			phoneNumber : phoneNumber,
			extCustOrderId : extCustOrderId,
			commonRegionId : commonRegionId,
			zoneNumber : zoneNumber,
			orderItemGroupId : orderItemGroupId
		};
		OrderInfo.essOrderInfo.essOrder = essOrder;
		var param = {
			extCustOrderId : extCustOrderId,
			consignee : "",
			accNbr : "",
			orderStatus : "",
			startDate : "",
			endDate : "",
			pageFlag : "",
			nowPage:1,
			pageSize:10
		};
		$.callServiceAsJson(contextPath + "/ess/order/orderQry", param, {
			"before" : function() {
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (response.code == 0) {
					var orderNeedActionFlag ="";
					if(response.data.orderList[0]!=null){
						orderNeedActionFlag =response.data.orderList[0].orderNeedAction;
					}
					if(orderNeedActionFlag == "realNameAndWriteCard"){
						$.alert("提示","请先实名制认证后再写卡！");
						return;
					}else if(orderNeedActionFlag == "nothingToDo"){
						$.alert("提示","已写卡，请勿二次写卡！");
						return;
					}else{
						_essShowReadWirteCard(phoneNumber,extCustOrderId);
					}
				} else if (response.code == -2) {
					$.alertM(response.data);
					return;
				} else if (response.code == 1002) {
					$.alert("错误",response.data);
					return;
				} else {
					$.alert("异常", "ESS订单查询接口查询异常");
					return;
				}
			
				
			},
			fail : function(response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _essShowReadWirteCard=function(phoneNumber,extCustOrderId){
		$("#d_writeCard").html("");
		var prodId = extCustOrderId; //没写错，只是作为标识
		var html = "";
		html += '<OBJECT id="ocx'+prodId+'" style="height: 0px;width: 0px;" Classid="clsid:5e497bde-0e29-4ac0-bfb1-4af7b7940277" codeBase="${contextPath}/card/common.ocx#version=1.0.0.1"></OBJECT>';
		html += '<div style="display:none" id="ec-dialog-form-container-card'+prodId+'" class="ec-dialog-form-container">';
		html += '<div class="ec-dialog-form-top">';
		html += '<h1 class="ec-dialog-form-title" id="writeTitle">写卡</h1>';
		html += '</div>';
		html += '<div class="ec-dialog-form-content" id="rcard">';
		html += '<div class="ec-dialog-form-loading" style="display:none"></div>';
		html += '<div class="ec-dialog-form-message" style="display:none"></div>';
		html += '<div class="ec-dialog-form-form" >';
		html += '<form action="#" id="dialogForm">';
		html += '<div>';
		html += '<p class="pb" style="height: 30px;">';
		html += '<label class="w1">手机号码:</label>';
		html += '<input type="text"  id="write_card_phone_number'+prodId+'" class="txt2 inputDisabled" readonly="readonly" disabled="disabled" />';
		html += '</p>';
		html += '<p class="pb" id="dk_content">';
		html += '<label class="w1">卡序列号:</label>';
		html += '<input type="text" class="txt3" id="serialNum'+prodId+'"/>';
		html += '</p>';
		html += '</div>';
		html += '<div align="left" style="margin-left: 60px;">';
		html += '<a class="btna_o" href="javascript:void(0);" id="btnReadCard'+prodId+'"><span>读卡</span></a>&nbsp; <a class="btna_o" href="javascript:void(0);" id="btnWriteCard'+prodId+'"><span>写卡</span></a>';
		html += '</div>';
		html += '<input type="hidden" id="iccid" value=""/>';
		html += '<input type="hidden" id="imsi" value=""/>';
		html += '<a href = "https://ct.crm.189.cn/phoneimg/card/CardMan3x21_V1_1_1_0.exe">下载写卡器驱动</a>';
		html += '</form>';
		html += '</div>';
		html += '</div>';
		html += '<div class="ec-dialog-form-content" id="cardt" style="display:none">';
		html += '<div class="ec-dialog-form-loading" style="display:none"></div>';
		html += '<div class="ec-dialog-form-message" style="display:none"></div>';
		html += '<div class="ec-dialog-form-form" >';
		html += '<form action="#" id="dialogForm">';
		html += '	<div>';
		html += '		<p class="pb" style="font-weight:bold;height: 30px;top:40px;">';
		html += '		           尊敬的用户，系统卡组件近期有更新，请您下载最新的卡组件<span style="color:#00F" id="dllName"></span>，把最新的卡组件保存到以下目录：<br/>32位系统 C:\\Windows\\System32<br/>64位系统 C:\\Windows\\SysWOW64<br/>';
		
		html += '		</p>';
		html += '	</div>';
		html += '	<div style="height: 30px;"></div>';
		html += '	<div align="left" style="font-weight:bold;margin-left: 5px;">';
		html += '	     请点击下载<a id="cardupdate" href = "" style="color:#00F">最新的卡组件</a>';
		html += '	</div>';
		html += '</form>';
		html += '</div>';
		html += '</div>';
		html += '<div class="ec-dialog-form-bottom"></div>';
		html += '</div>';
		$("#d_writeCard").append(html);
		if (!ec.util.isObj(phoneNumber)){
			$.alert("提示",'ESS订单查询接口返回接入号为空!','confirmation');
			return;
		}
		order.writeCard.createDialog(prodId,phoneNumber);
	};
	var _essRepeatWriteReadCard=function(phoneNumber,extCustOrderId,orderNeedAction,commonRegionId,zoneNumber){
		OrderInfo.actionFlag = 42 ;
		_essWriteCard = {};
		var iccId = $("#"+extCustOrderId).val();
		if(!ec.util.isObj(iccId)){
			$.alert("提示","ESS购物车列表查询接口返回iccId为空！");
			return;
		}
		var essOrder = {
			phoneNumber : phoneNumber,
			extCustOrderId : extCustOrderId,
			commonRegionId : commonRegionId,
			zoneNumber : zoneNumber,
			iccId : iccId,
			mktResInstCode : $("#"+extCustOrderId+"_mktResInstCode").val()
		};
		OrderInfo.essOrderInfo.essOrder = essOrder;
		_essShowReadWirteCard(phoneNumber,extCustOrderId);
	};
	var _essRepeatWriteCard =function(prodId){
		
		_haveWriteCard = false;//false;
		productId = prodId;
		//写卡之前必须要先读卡
		if (!_haveReadCard) {
			$.alert("提示","请先读卡!","error");
			return false;
		}
		//写卡之前再读卡
		if (!_readCard()) {
			$.alert("提示","写卡前验证读卡验证时读卡失败，请确认设备是否连接好!","error");
			return false;
		}
		//如果是黑莓手机写卡一定要是支持EVDO的CG双模卡
		var hmPesn = $("#pesn").val();
		if (hmPesn != undefined && hmPesn != "" && hmPesn != null) {
			cardType = _cardInfoJson.serialNumber.substr(6,2);
			if (cardType != '10') {
				$.alert("提示","黑莓手机终端配套的手机卡必须是支持EVDO的CG双模卡，请换支持EVDO的CG双模卡进行写卡!","error");
				return false;
			}
		}
		//加载动态链接库
		if (!_updateCardDll()) { return false; }
		//写卡之前必须调用DisConnectReader()函数断开写卡器，江苏恒宝的写卡方式
		var dkResult = ocx.DisConnectReader();
		if (dkResult != "0") {
			$.alert("提示","写卡之前,断开写卡器失败!","error");
			return false;
		}
		//客户端调用插件函数获取随机数
		var getResult = ocx.GetRandNum();
		//alert("随机数="+getResult);
		
		if (getResult.length != 16) {
			$.alert("提示","写卡异常:获取随机数失败！" + result,"error");
			return false;
		}
		var randomNum = getResult;
		//判断是否为8字节长的随机数
		if (randomNum.length != 16) {
			//alert('判断8字节');
			$.alert("提示","写卡异常:从卡商组件获取随机数不是8字节长的随机数！","error");
			return false;
		}
		//判断密码是否为空
		if (_cardDllInfoJson.dllPassword == "") {
			//alert('密码'+_cardDllPassword);
			$.alert("提示","写卡异常(组件鉴权密码不可为空)，请检查！","error");
			return false;
		}
		/*-----------------------------用获取的随机数生成鉴权码 -------------------*/
		var authCode = null;
		serviceName = contextPath + "/mktRes/writeCard/authCode";
		try {
			var param = {
				randomNum:randomNum,
				dllPassword:_cardDllInfoJson.password,
				factoryCode:_cardDllInfoJson.factoryCode,
				authCodeType:_cardDllInfoJson.authcodeType
			};

			var response = $.callServiceAsJson(serviceName, param);
			var authCodeJson;
			if(response.code == 0){
				authCodeJson = response.data;
			}else{
				$.alertM(response.data);
				return false;
			}
			
			var code = authCodeJson.code;
			if (code != null && code == "POR-0000") {
				authCode = authCodeJson.authCode;
				//authCode ='B9488FBC60982B48';
				//alert('鉴权码='+authCode);
			} else {
				$.alert("提示","用获取的随机数生成鉴权码失败！","error");
				return false;
			}
		} catch(e) {
			$.alert("提示","用获取的随机数生成鉴权码异常!" + e.message,"error");
			return false;
		}
		//alert("用获取的随机数生成鉴权码authCode:" + authCode);
		/*-----------------------------用获取的鉴权密钥和生产的随机数生产鉴权码完成 -----------------*/
		//获得鉴权结果
		var auResult = ocx.Authentication(authCode);
		var opCode = auResult;
		if (opCode != "0") {
			$.alert("提示","鉴权失败！" + auResult,"error");
			return false;
		}
		/*------------------------准备工作完成，开始调用Active控件写卡----------------------------------------*/
		//查询卡资源数据
		if (!_cardResourceQuery(prodId)) {
			return false;
		}
		//alert("调用组件写卡函数进行写卡");
		_haveWriteCard = true;
		//申请资源成功，写卡过程已经开始
		//调用组件写卡函数进行写卡，调用dep接口传入写卡数据。
		//$.alert("提示","写入数据_rscJson.data="+_rscJson.data+"\n\n写卡结果;authCode:"+authCode+";writeCardResult="+writeCardResult,"error");
		//alert("写入数据_rscJson.data="+_rscJson.data+"\n\n写卡结果;writeCardResult="+writeCardResult);
		//return false;
		//_rscJson.data = "89860311805101572698,460036700435919,8097808C,3760,9,FFFF,0bf0ad8280d2b0a0,1234,55900648,85232888,49600368,59EF72FB,460036700435919@mycdma.cn,75d6ecc6632fac57,460036700435919@mycdma.cn,30ffc6952e03ccd0;37623582e5265d5a;cdfd165333f66519,460036700435919@mycdma.cn,e43472656c30e82e;671ab8c55dbdb14f;16a7e838ae5db0fa,e51c11352e62e0ac;98e3ce89414d982a;cac02f2ef7d2544d,,,,";
		//_rscJson.data = "89860313007580411850,460030252801743,805BA245,3619,3,FFFF,123013c243731bc8,1234,51154902,74059570,96831988,90892996,460030252801743@mycdma.cn,059f7bdf8e3f4e12,460030252801743@mycdma.cn,e99eeb2f8c1ddf16;a4316f058ba1aedb;54034ca47e67108c;edfa87035ebe8a18;90719b0fea72386f,460030252801743@mycdma.cn,9aebd4cdfeeccfcb;529995a75de27bf9;f868720e8cc7ee48;5ee4410b4ca89979;9666d03a637b22ee,2479e9c1334e9337;795e86be92e2a431;df518cdb3c732c8f;d6c98a059b44ff3c;edb8698d619dc2d1,204043153514753,3,19e7126871e1eb11a85a4ae90b8daa7c,+316540942000";
		//_rscJson.data = "89860313900100000102,460036531190990,8000A876,13824,0,FFFF,a471b07640a45918,1234,66709721,78778797,85087049,B8C32115,460036531190990@mycdma.cn,63044385d047084c,460036531190990@mycdma.cn,c1d4f3f021172c63,460036531190990@mycdma.cn,5c3a505e7f018f7d,0dc6e3733d291f52,,,";
		//alert("xj:"+_rscJson.data);
		var writeCardResult = ocx.YXPersonalize(authCode,"",1,_rscJson.data,"");
		//alert("writeCardResult:"+writeCardResult);
		if (writeCardResult != "0") {
			var serviceName = contextPath + "/mktRes/writeCard/writecardLog";
			var param = {
					couponInstanceCode:OrderInfo.essOrderInfo.essOrder.mktResInstCode,
					iccId:OrderInfo.essOrderInfo.essOrder.iccId,
					serviceCode:OrderInfo.busitypeflag+'',
					cardSource:_cardDllInfoJson.remark,
					methodName:"W",
					errDesc:writeCardResult,
					contactRecord:OrderInfo.essOrderInfo.essOrder.extCustOrderId,
					result:writeCardResult,
					extCustOrderId:OrderInfo.essOrderInfo.essOrder.extCustOrderId,
					accNbr:OrderInfo.essOrderInfo.essOrder.phoneNumber
				};
			$.callServiceAsJson(serviceName, param);
			//客户端提示：写卡失败时各卡商返回各自定义的错误信息 
			$.alert("提示","写卡失败，请将白卡取出！错误编码=" + writeCardResult+"详细错误请联系卡商["+_cardDllInfoJson.remark+"]确认","error");
			return false;
		} else {
			//写卡成功
			var serviceName = contextPath + "/mktRes/writeCard/writecardLog";
			var param = {
					couponInstanceCode:OrderInfo.essOrderInfo.essOrder.mktResInstCode,
					iccId:OrderInfo.essOrderInfo.essOrder.iccId,
					serviceCode:OrderInfo.busitypeflag+'',
					cardSource:_cardDllInfoJson.remark,
					methodName:"W",
					errDesc:"",
					contactRecord:OrderInfo.essOrderInfo.essOrder.extCustOrderId,
					result:"写卡成功",
					extCustOrderId:OrderInfo.essOrderInfo.essOrder.extCustOrderId,
					accNbr:OrderInfo.essOrderInfo.essOrder.phoneNumber
				};
			$.callServiceAsJson(serviceName, param);
			$.confirm("提示","恭喜，您已经成功写卡！",{ 
				yes:function(){
					window.location.href = contextPath+"/ess/order/repeatWriteCard";
				},
				no:function(){
					window.location.href = contextPath+"/ess/order/repeatWriteCard";
				}
			});
			return;
		    return true;
		}
		return false;
	};
	_cardResourceQuery=function(prodId){
		//先清空之前的资源数据
			//写卡请求的参数： 手机号码，卡产品编号，归属地区号
			//漫游地区号，登陆工号，工号名称，营业厅标识，营业厅名称
			_rscJson = {
				"iccid":"",
				"imsi":"",
				"data":"",
				"dataLength":"0",
				"state":"N",
				"prodId":""
			};//卡数据资源JSON state:N 为不可用来写卡 Y 为可以

			//请求后返回给客户端的数据直接是可以写卡的暗文
			var serviceName = contextPath + "/mktRes/writeCard/cardResourceQuery";
						
			try {
				//alert(JSON.stringify(order.prodModify.choosedProdInfo));
				// 提取卡商代码
				var areaCode = OrderInfo.getAreaCode(prodId);
				if (areaCode == undefined || areaCode ==""){
					areaCode = OrderInfo.staff.areaCode;
				}
				var param = {
					factoryCode:_cardDllInfoJson.factoryCode,
					authCodeType:_cardDllInfoJson.authCodeType,
					hmUimid:'',//黑莓
					cardNo:_cardInfoJson.cardTypeId,
					phoneNumber:OrderInfo.getAccessNumber(prodId),
					areaId:OrderInfo.getProdAreaId(prodId),
					areaCode:areaCode,//归属地区号
					iccId:OrderInfo.essOrderInfo.essOrder.iccId,
					fromAreaCode:OrderInfo.staff.areaCode//漫游地区号
				};
				var resourceDataJson;
				var response = $.callServiceAsJson(serviceName, param);
				if(response.code == 0){
					resourceDataJson = response.data.cardInfo;
					_TransactionID = response.data.TransactionID;
				}else{
					$.alertM(response.data);
					return false;
				}
				//alert(JSON.stringify(response));
				var flag = resourceDataJson.flag;
				if (flag != undefined && flag == "0") {
					_rscJson = {
						"iccid":"",
						"imsi":"",
						"imsig":"",
						"data":"",
						"state":"Y",
						"uimid":"",
						"sid":"",
						"accolc":"",
						"nid":"",
						"akey":"",
						"pin1":"",
						"pin2":"",
						"puk1":"",
						"puk2":"",
						"imsilte":"",
//						"adm":"",
//						"hrpdupp":"",
//						"hrpdss":"",
//						"imsig":"",
//						"acc":"",
//						"smsp":"",
						"prodId":""
					};
					_rscJson.iccid = resourceDataJson.iccid;
					_rscJson.imsi = resourceDataJson.imsi;
					_rscJson.imsig = resourceDataJson.imsig;
					_rscJson.uimid = resourceDataJson.uimid;
					_rscJson.sid = resourceDataJson.sid;
					_rscJson.accolc = resourceDataJson.accolc;
					_rscJson.nid = resourceDataJson.nid;
					_rscJson.akey = resourceDataJson.akey;
					_rscJson.pin2 = resourceDataJson.pin2;
					_rscJson.pin1 = resourceDataJson.pin1;
					_rscJson.puk1 = resourceDataJson.puk1;
					_rscJson.puk2 = resourceDataJson.puk2;
					_rscJson.imsilte = resourceDataJson.imsilte;
					_rscJson.data = resourceDataJson.data;
					_rscJson.dataLength = resourceDataJson.dataLength;
					_rscJson.prodId = prodId;
					return true;
				} else {
					var msg = resourceDataJson.msg;
					if (msg != undefined) {
						$.alert("提示","请求可写卡的资源数据失败:" + msg,"error");
					} else {
						$.alert("提示","请求可写卡的资源数据失败" ,"error");
					}
					return false;
				}
			} catch(e) {
				$.alert("提示","请求可写卡的资源数据异常!" + e.message ,"error");
				return false;
			}
		};
	var _writeCardLogInfo = function(param){
		//请求后返回给客户端的数据直接是可以写卡的暗文
		var serviceName = contextPath + "/mktRes/writeCard/writeCardLogInfo";
		$.callServiceAsJson(serviceName, param);
	};
	
	var _essMNWriteCard=function(phoneNumber,extCustOrderId,orderNeedAction,commonRegionId,zoneNumber){
		OrderInfo.actionFlag = 41 ;
		var orderItemGroupId = $("#"+phoneNumber).val();
		var essOrder = {
				phoneNumber : phoneNumber,
				extCustOrderId : extCustOrderId,
				commonRegionId : commonRegionId,
				zoneNumber : zoneNumber,
				orderItemGroupId : orderItemGroupId
			};
		OrderInfo.essOrderInfo.essOrder = essOrder;
		var param = {
			extCustOrderId : extCustOrderId,
			consignee : "",
			accNbr : "",
			orderStatus : "",
			startDate : "",
			endDate : "",
			pageFlag : "",
			nowPage:1,
			pageSize:10
		};
		$.callServiceAsJson(contextPath + "/ess/order/orderQry", param, {
			"before" : function() {
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (response.code == 0) {
					var orderNeedActionFlag ="";
					if(response.data.orderList[0]!=null){
						orderNeedActionFlag =response.data.orderList[0].orderNeedAction;
					}
					if(orderNeedActionFlag == "realNameAndWriteCard"){
						$.alert("提示","请先实名制认证后再写卡！");
						return;
					}else if(orderNeedActionFlag == "nothingToDo"){
						$.alert("提示","已写卡，请勿二次写卡！");
						return;
					}else{
						_mnWriteCard(extCustOrderId,phoneNumber);
					}
				} else if (response.code == -2) {
					$.alertM(response.data);
					return;
				} else if (response.code == 1002) {
					$.alert("错误",response.data);
					return;
				} else {
					$.alert("异常", "ESS订单查询接口查询异常");
					return;
				}
			
				
			},
			fail : function(response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _essMNRepeatWritCard=function(phoneNumber,extCustOrderId,orderNeedAction,commonRegionId,zoneNumber){
		OrderInfo.actionFlag = 42 ;
		_essWriteCard = {};
		var iccId = $("#"+extCustOrderId).val();
		if(!ec.util.isObj(iccId)){
			$.alert("提示","ESS购物车列表查询接口返回iccId为空！");
			return;
		}
		var essOrder = {
			phoneNumber : phoneNumber,
			extCustOrderId : extCustOrderId,
			commonRegionId : commonRegionId,
			zoneNumber : zoneNumber,
			iccId : iccId,
			mktResInstCode : $("#"+extCustOrderId+"_mktResInstCode").val()
		};
		OrderInfo.essOrderInfo.essOrder = essOrder;
		_mnWriteCard(extCustOrderId,phoneNumber);
	};
	var _mnWriteCard = function(extCustOrderId,phoneNumber){
		$("#d_writeCard").html("");
		var randStr = "898600031705101572698";
		var areaIdMN = "8320400";
		var prodId = extCustOrderId; //没写错，只是作为标识
		var html = "";
		html += '<OBJECT id="ocx'+prodId+'" style="height: 0px;width: 0px;" Classid="clsid:5e497bde-0e29-4ac0-bfb1-4af7b7940277" codeBase="${contextPath}/card/common.ocx#version=1.0.0.1"></OBJECT>';
		html += '<div style="display:none" id="ec-dialog-form-container-card'+prodId+'" class="ec-dialog-form-container">';
		html += '<div class="ec-dialog-form-top">';
		html += '<h1 class="ec-dialog-form-title" id="writeTitle">模拟写卡</h1>';
		html += '</div>';
		html += '<div class="ec-dialog-form-content" id="rcard">';
		html += '<div class="ec-dialog-form-loading" style="display:none"></div>';
		html += '<div class="ec-dialog-form-message" style="display:none"></div>';
		html += '<div class="ec-dialog-form-form" >';
		html += '<form action="#" id="dialogForm">';
		html += '<div>';
		html += '<p class="pb" style="height: 30px;">';
		html += '<label class="w1">手机号码:</label>';
		html += '<input type="text"  id="write_card_phone_number'+prodId+'" class="txt2 inputDisabled" readonly="readonly" disabled="disabled" />';
		html += '</p>';
		html += '<p class="pb" id="dk_content">';
		html += '<label class="w1">参数卡号:</label>';
		html += '<input type="text" value ='+randStr+'  id="serialNum'+prodId+'"/>';
		html += '</p>';
		html += '<p class="pb" id="dk_content">';
		html += '<label class="w1">参数地区:</label>';
		html += '<input type="text" value ='+areaIdMN+'  id="areaIdMN'+prodId+'"/>';
		html += '</p>';
		html += '</div>';
		html += '<div align="left" style="margin-left: 60px;">';
		html += '<a class="btna_o" href="javascript:void(0);" id="btnReadCard'+prodId+'"><span>模拟写卡</span></a>';
		html += '</div>';
		html += '<input type="hidden" id="iccid" value=""/>';
		html += '<input type="hidden" id="imsi" value=""/>';
		html += '<a href = "https://ct.crm.189.cn/phoneimg/card/CardMan3x21_V1_1_1_0.exe">下载写卡器驱动</a>';
		html += '</form>';
		html += '</div>';
		html += '</div>';
		html += '<div class="ec-dialog-form-content" id="cardt" style="display:none">';
		html += '<div class="ec-dialog-form-loading" style="display:none"></div>';
		html += '<div class="ec-dialog-form-message" style="display:none"></div>';
		html += '<div class="ec-dialog-form-form" >';
		html += '<form action="#" id="dialogForm">';
		html += '	<div>';
		html += '		<p class="pb" style="font-weight:bold;height: 30px;top:40px;">';
		html += '		           尊敬的用户，系统卡组件近期有更新，请您下载最新的卡组件<span style="color:#00F" id="dllName"></span>，把最新的卡组件保存到以下目录：<br/>32位系统 C:\\Windows\\System32<br/>64位系统 C:\\Windows\\SysWOW64<br/>';	
		html += '		</p>';
		html += '	</div>';
		html += '	<div style="height: 30px;"></div>';
		html += '	<div align="left" style="font-weight:bold;margin-left: 5px;">';
		html += '	     请点击下载<a id="cardupdate" href = "" style="color:#00F">最新的卡组件</a>';
		html += '	</div>';
		html += '</form>';
		html += '</div>';
		html += '</div>';
		html += '<div class="ec-dialog-form-bottom"></div>';
		html += '</div>';
		$("#d_writeCard").append(html);
		if (!ec.util.isObj(phoneNumber)){
			$.alert("提示",'ESS订单查询接口返回接入号为空!','confirmation');
			return;
		}
		_createDialogMN(prodId,phoneNumber);
	}
	var _createDialogMN = function(prodId,phoneNumber){
		ec.form.dialog.createDialog({"id":"-card"+prodId,width:350,"initCallBack":function(){			
			$("#write_card_phone_number"+prodId).val(phoneNumber);
			//ActiveX 控件无法用JQUERY方法获取
			ocx = document.getElementById("ocx"+prodId);
			//绑定读卡按钮事件
			$("#btnReadCard"+prodId).click(function(){
				_applyDataMN(prodId);
			});
			$("#btnWriteCard"+prodId).click(function(){
				_compDataMN(prodId);
			});
			
		},"submitCallBack":function(dialogForm,dialog){}});

	};
	_applyDataMN=function(prodId){
		_rscJsonMN = {
				"iccid":"",
				"imsi":"",
				"data":"",
				"dataLength":"0",
				"state":"N",
				"prodId":""
			};
			var serviceName = contextPath + "/mktRes/writeCard/cardInfo";
			try {
				var param = {
					factoryCode:'58',
					authCodeType:'58',
					hmUimid:'',//黑莓
					cardNo: $("#serialNum"+prodId).val().substr(5,5),
					phoneNumber:$("#write_card_phone_number"+prodId).val(),
					areaId:$("#areaIdMN"+prodId).val(),
					areaCode:'0731',//归属地区号
					fromAreaCode:'0731'//漫游地区号
				};
				if(OrderInfo.actionFlag != null && (OrderInfo.actionFlag == 41 || OrderInfo.actionFlag == 42)){
					param.essWriteCard = 'Y';//标志ESS页面的操作
					param.iccserial = _cardInfoJson.serialNumber;
					param.iccid = $("#resultCardNo").val();
					param.serviceCode = OrderInfo.busitypeflag;//新增一个动作表示，用于记日志update by huangjj
					param.remark = _cardDllInfoJson.remark;
					param.extCustOrderId = OrderInfo.essOrderInfo.essOrder.extCustOrderId;
				}
				var resourceDataJson;
				var response = $.callServiceAsJson(serviceName, param);
				if(response.code == 0){
					resourceDataJson = response.data.cardInfo;
					_TransactionID = response.data.TransactionID;
				}else{
					if(response.data !="" && response.data !=undefined){
						alertMM(response.data);
					}
					return;
				}
				var flag = resourceDataJson.flag;
				if (flag != undefined && flag == "0") {
					_rscJsonMN = {
						"iccid":"",
						"imsi":"",
						"imsig":"",
						"data":"",
						"state":"Y",
						"uimid":"",
						"sid":"",
						"accolc":"",
						"nid":"",
						"akey":"",
						"pin1":"",
						"pin2":"",
						"puk1":"",
						"puk2":"",
						"imsilte":"",
						"prodId":""
					};
					_rscJsonMN.iccid = resourceDataJson.iccid;
					_rscJsonMN.imsi = resourceDataJson.imsi;
					_rscJsonMN.imsig = resourceDataJson.imsig;
					_rscJsonMN.uimid = resourceDataJson.uimid;
					_rscJsonMN.sid = resourceDataJson.sid;
					_rscJsonMN.accolc = resourceDataJson.accolc;
					_rscJsonMN.nid = resourceDataJson.nid;
					_rscJsonMN.akey = resourceDataJson.akey;
					_rscJsonMN.pin2 = resourceDataJson.pin2;
					_rscJsonMN.pin1 = resourceDataJson.pin1;
					_rscJsonMN.puk1 = resourceDataJson.puk1;
					_rscJsonMN.puk2 = resourceDataJson.puk2;
					_rscJsonMN.imsilte = resourceDataJson.imsilte;
					_rscJsonMN.data = resourceDataJson.data;
					_rscJsonMN.dataLength = resourceDataJson.dataLength;
					_rscJsonMN.prodId = prodId;
					_compDataMN(prodId);
					return true;
				} else {
					var msg = resourceDataJson.msg;
					if (msg != undefined) {
						$.alert("提示","请求可写卡的资源数据失败:" + msg,"error");
					} else {
						$.alert("提示","请求可写卡的资源数据失败" ,"error");
					}
					return false;
				}
			} catch(e) {
				$.alert("提示","请求可写卡的资源数据异常!" + e.message ,"error");
				return false;
			}
		};
		_compDataMN=function(prodId){
				var serviceName = contextPath + "/mktRes/writeCard/completeWriteCard";
				var srInParam = {
					"areaId": $("#areaIdMN"+prodId).val(),
				    "InoutInfo": {
				        "ApplyNo": "001",
				        "InoutId": "",
				        "BillType": "2",
				        "SaleNo": "",
				        "BatchId": "",
				        "OperationType": "1100",
				        "MktResStoreId": "",
				        "ChannelId": OrderInfo.staff.channelId,
				        "AreaId": $("#areaIdMN"+prodId).val(),
				        "StaffId": OrderInfo.staff.staffId
				    },
				    "MktResInstInfos": [
				        {
				            "MktResInstInfo": {
				                "BaseInfo": {
				                    "MktResTypeCd": "",
				                    "StatusCd" : "2",
				                    "MktResId": "",
				                    "MktResCd": $("#serialNum"+prodId).val().substr(5,5),
				                    "MktResInstCode": $("#serialNum"+prodId).val(),    //_rscJson.iccid,
				                    "SalesPrice": "0",
				                    "CostPrice": "0",
				                    "Quantity": "1",
				                    "Unit": "101"
				                },
				              "AttrList": [
				                             
									{
									    "AttrId": "60020005",
									    "AttrValue": _rscJsonMN.iccid
									},
									{
									    "AttrId": "60020002",
									    "AttrValue": _rscJsonMN.imsi
									},
									{
									    "AttrId": "60020003",
									    "AttrValue":  _rscJsonMN.imsig
									},
									{
									    "AttrId": "60020004",
									    "AttrValue": _rscJsonMN.imsilte
									},
									{
									    "AttrId": "65010026",
									    "AttrValue": _rscJsonMN.pin1
									},
									{
									    "AttrId": "65010027",
									    "AttrValue": _rscJsonMN.pin2
									},
									{
									    "AttrId": "65010028",
									    "AttrValue": _rscJsonMN.puk1
									},
									{
									    "AttrId": "65010029",
									    "AttrValue": _rscJsonMN.puk2
									},
									{
									    "AttrId": "65010030",
									    "AttrValue": _rscJsonMN.adm
									},
									{
									    "AttrId": "65010033",
									    "AttrValue":  _rscJsonMN.uimid
									},
									{
									    "AttrId": "65010035",
									    "AttrValue": _rscJsonMN.akey
									},  
									{
									    "AttrId": "65010037",
									    "AttrValue": _rscJsonMN.nid
									},
									{
									    "AttrId": "65010038",
									    "AttrValue": _rscJsonMN.accolc
									},
									{
									    "AttrId": "60029003",
									    "AttrValue": OrderInfo.staff.channelId
									},
									{
									    "AttrId": "60029004",
									    "AttrValue": "测试"
									},
									{
									    "AttrId": "60029005",
									    "AttrValue": "11111"
									},
									{
									    "AttrId": "65010019",
									    "AttrValue": "21212"
									}
				                ]
				            }
				        }
				    ]
						
				};
				var param = {
					imsi:_rscJsonMN.imsi,     
					iccserial: $("#serialNum"+prodId).val(),     
					iccid:_rscJsonMN.iccid,  
					resultCode:'00000000',
					resultMessage:"写卡器返回结果编码",
					phoneNumber:$("#write_card_phone_number"+prodId).val(),
					cardType:$("#serialNum"+prodId).val().substr(5,5),
					eventType:"2",
					areaId:$("#areaIdMN"+prodId).val(),
					serviceCode:12,//新增一个动作表示，用于记日志update by huangjj
					TransactionID:_TransactionID,
					remark:"测试",
					"srInParam":srInParam
				};
				if(OrderInfo.actionFlag != null && (OrderInfo.actionFlag == 41 || OrderInfo.actionFlag == 42)){
					param.essWriteCard = 'Y';//标志ESS页面的操作
					param.extCustOrderId = OrderInfo.essOrderInfo.essOrder.extCustOrderId;
				}
				try {
					
					var eventJson;
					var response = $.callServiceAsJson(serviceName, param);
					eventJson = response.data;
					//alert(JSON.stringify(response));
					
					if (!response) {
						$.alert("提示","<br/>卡资源回填到卡管系统异常,请稍后重试。");
						return;
					}
				   if(response.code != 0) {
					   $.alert("提示","<br/>调用卡资源回填到卡管系统异常,请稍后重试。");
						if(response.data !="" && response.data !=undefined){
							alertMM(response.data);
						}
						return;
					}
					//var eventJson = response.data;
					if (eventJson.code != 0) {
						$.alert("提示","调用卡资源回填到卡管系统异常！" + eventJson.message,"error");
						return;
					}

					if(response.code == 0) {
						var resp = $.callServiceAsJson(contextPath+"/mktRes/terminal/infoQueryByCode", {instCode:$("#serialNum"+prodId).val(),"areaId":$("#areaIdMN"+prodId).val()});//mark 根据串码获取卡类型，异地补换卡，获取产品的地区
						if(resp.code ==0&&ec.util.isObj(resp.data.mktResBaseInfo)&&ec.util.isObj(resp.data.mktResBaseInfo.mktResId)){
						}else{
							if(ec.util.isObj(resp.data.resultMsg)){
								$.alert("信息提示","根据串码："+$("#serialNum"+prodId).val()+"获取卡类型失败！失败原因："+resp.data.resultMsg);
								return ;
							}else{
								$.alert("信息提示","根据串码："+$("#serialNum"+prodId).val()+"获取卡类型失败！失败原因未返回！");
								return ;
							}				
						}
						 _essWriteCard = {};
						 _essWriteCard = {
									extCustOrderId : OrderInfo.essOrderInfo.essOrder.extCustOrderId,
								    commonRegionId : OrderInfo.essOrderInfo.essOrder.commonRegionId,
									mktResInst :{
										mktResCd : resp.data.mktResBaseInfo.mktResCd+"",
										mktResType : resp.data.mktResBaseInfo.mktResTypeCd,
										mktResInstCode : resp.data.mktResBaseInfo.instCode,
										mktResStoreId : resp.data.mktResBaseInfo.mktResStoreId+"",
										orderItemGroupId : OrderInfo.essOrderInfo.essOrder.orderItemGroupId,
										quantity : "1",
										salesPrice : "0",
										attr :[{
											attrId: "21011203",
											attrVal: _rscJsonMN.imsi
										},{
											attrId: "21011202",
											attrVal: _rscJsonMN.iccid
										},{
											attrId: "20002010",
											attrVal: _rscJson.imsig
										},{
											attrId: "60020004",
											attrVal: _rscJsonMN.imsilte
										}]
									}
								};
						var url = contextPath + "/ess/order/writeCardMakeUp";
						$.callServiceAsJson(url,_essWriteCard, {
							"before" : function() {
								$.ecOverlay("正在串码回填，请稍等...");
							},
							"always" : function() {
								$.unecOverlay();
							},
							"done" : function(response) {
								if (response.code == 0) {
									$.confirm("提示","写卡成功,资源补录成功！",{ 
										yes:function(){
											window.location.href = contextPath+"/ess/order/remoteWriteCard";
										},
										no:function(){
											window.location.href = contextPath+"/ess/order/remoteWriteCard";
										}
									});
									return;
								} else if (response.code == -2) {
									$.alertM(response.data);
									return;
								} else if (response.code == 1002) {
									$.alert("错误", response.data);
									return;
								} else {
									$.alert("异常", "写卡成功,资源补录异常");
									return;
								}
							},
							fail : function(response) {
								$.unecOverlay();
								$.alert("提示", "请求可能发生异常，请稍后再试！");
							}
						});
					}
					return true;
				} catch(e) {
					$.alert("提示","调用卡资源回填到卡管系统异常！" + e.message,"error");
					return false;
				}
		};
	return {
		writeReadCard : _writeReadCard,
		readCard : _readCard,
		writeCard : _writeCard,
		getCardType : _getCardType,
		createDialog : _createDialog,
		essShowReadWirteCard : _essShowReadWirteCard,
		essWriteReadCard : _essWriteReadCard,
		essRepeatWriteReadCard : _essRepeatWriteReadCard,
		essRepeatWriteCard : _essRepeatWriteCard,
		writeCardLogInfo  : _writeCardLogInfo,
		essMNWriteCard : _essMNWriteCard,
		essMNRepeatWritCard : _essMNRepeatWritCard
	};
})();

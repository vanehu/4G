/**
 * 写卡
 * 
 * @author xuj
 */
CommonUtils.regNamespace("order", "writeCard");
var ty_plugin = null;
var g_realWriteCard = true;//true真实写卡，false假写卡
//根据浏览器加载
if ($.browser.msie) {
	try{
		ty_plugin =new ActiveXObject("HBW0001.HBW0001Ctrl.1");
	}catch(e){}
}

order.writeCard = (function(){
	
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
	var _writeReadCard=function(prodId){
		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		if (phoneNumber==""){
			$.alert("提示",'请选择号码!','confirmation');
			return;
		}
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
				var writeResultFlg=order.writeCard.writeCard(prodId);
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
			_rscJson.iccid = "82300074073120061092";
			if (_rscJson.iccid.length==20){
				_rscJson.iccid = _rscJson.iccid.substr(0,_rscJson.iccid.length-1)
			}
			$("#serialNum"+prodId).val(_rscJson.iccid);
			//$("#serialNum").val("33333333333" + date.getMilliseconds());
			return true;
		}
		// 读取ICCID 转
		var iccidResult =null;
		try{
			iccidResult = ec.util.defaultStr(ocx.strGetICCID());
		}catch(e){
			$.alert("提示","加载读卡插件失败,请检查是否已正确安装插件!错误信息："+e.message,"error");
			return false;
		}
		//alert("iccidResult:"+iccidResult);
		var opCode1 = iccidResult.substring(iccidResult.length - 4,iccidResult.length);
		if (opCode1 == '') {
			$.alert("提示","读取卡失败!请确认卡连接是否正常!");
			return false;
		}
		
		if (opCode1 != '' && opCode1 != "FFFF") {
			$.alert("提示","卡片已有数据,不能重复写入!");
			return false;
		}
		//var iccid = iccidResult.substring(0,iccidResult.length-5); 
		var iccid = iccidResult;
		
		//读取空卡序列号
		var serialNum = "";
		var result = ec.util.defaultStr(ocx.GetEmptyCardFile());
		//alert("GetEmptyCardFile:"+iccidResult);
		var opCode = result.substring(result.length - 5,result.length);
		//alert("opCode::"+opCode);
		if (opCode != '' && opCode != "FFFF") {
			//alert("取空卡序列号");
			serialNum = result.substring(0,result.length - 2);
			factoryCode = result.substring(result.length - 2,result.length);
			//if(factoryCode==42){
			//	factoryCode=30;
			//}
		}
		//alert("serialNumber:="+_cardInfoJson.serialNumber);
		//如果读取到了空卡序列号就加载卡片信息
		if (ec.util.defaultStr(serialNum) != "" && serialNum.length == 20) {
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
			$.alert("提示","写卡失败，请将白卡取出！错误编码=" + writeCardResult,"error");
			_completeWriteCard("1",writeCardResult);//写卡失败回填
			return false;
		} else {
			//写卡成功
			if (_completeWriteCard("00000000",writeCardResult)) {
				$.alert("提示","恭喜，您已经成功写卡！");
				return true;
			} else {
				$.alert("提示","写卡成功，但卡资源下发异常","error");
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
		if (serialNum != undefined && serialNum.length == 20) {
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
				//alert("厂商编码2："+factoryCode);
				var serviceName = contextPath + "/mktRes/writeCard/cardDllInfo";
				var param = {
					"factoryCode":factoryCode       
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
					$.alert("提示","卡商(编码=" + factoryCode + ")获取不到对应的组件信息！","error");
					return false;
				}
				_cardDllInfoJson = cardDllInfoJson;
				return true;
			} else {
				$.alert("提示","卡商编码值不可为空！","error");
				return false;
			}
		} catch(e) {
			$.alert("提示","获取卡商组件信息时异常!" + e.message,"error");
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
		} catch(e) {
			$.alert("提示","您插入白卡的卡商写卡组件不存在，请将组件下载保存到C:\\WINDOWS\\system32 目录下！","error");
			var url = contextPath + "/card/"+ _cardDllInfoJson.dllName+".DLL";
			location.href = url;
			return false;
		}
		//alert("fso=="+fso);
		//装载组件
		var loaddll = ocx.TransferDll(_cardDllInfoJson.dllName + ".DLL");
		if (loaddll != '0') {
			$.alert("提示","您插入白卡的卡商写卡组件不存在，请将组件下载保存到C:\\WINDOWS\\system32 目录下！","error");
			var url = contextPath + "/card/"+ _cardDllInfoJson.dllName + ".DLL";
			location.href = url;
			return false;
		}
		//alert("loaddll=="+loaddll);
		// 读取组件版本号
		var version = ocx.GetDllVersion();
		//alert("version: " + version);
		// 组件版本不是最新, 执行更新
		/**
		if (version != _cardDllInfoJson.dllVersion) {
			alert("您插入白卡的卡商写卡组件不是最新版本，请将最新版本组件下载保存到C:\\WINDOWS\\system32 目录下!");
			var url = contextPath + "/card/"+ _cardDllInfoJson.dllName;
			location.href = url;
			return false;
		}
		**/
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
					areaCode:areaCode
				};
				var resourceDataJson;
				var response = $.callServiceAsJson(serviceName, param);
				if(response.code == 0){
					resourceDataJson = response.data.cardInfo;
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
						"prodId":""
					};
					_rscJson.iccid = resourceDataJson.iccid;
					_rscJson.imsi = resourceDataJson.imsi;
					_rscJson.imsig = resourceDataJson.imsig;
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
	_completeWriteCard=function(result,resultCode){
			var serviceName = contextPath + "/mktRes/writeCard/completeWriteCard";
			var srInParam = {
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
			                    "MktResId": "",
			                    "MktResCd": _cardInfoJson.cardTypeId.substr(1,_cardInfoJson.cardTypeId.length),
			                    "MktResInstCode": _rscJson.iccid,
			                    "SalesPrice": "0",
			                    "CostPrice": "0",
			                    "Quantity": "1",
			                    "Unit": "101"
			                },
			                "AttrList": [
			                ]
			            }
			        }
			    ]
					
			}
			var param = {
				imsi:_rscJson.imsi,     
				iccserial:_cardInfoJson.serialNumber,     
				iccid:_rscJson.iccid,  
				resultCode:result,
				resultMessage:"写卡器返回结果编码"+resultCode,
				phoneNumber:order.prodModify.choosedProdInfo.accNbr,
				cardType:_cardInfoJson.cardTypeId,
				eventType:"2",
				areaId:OrderInfo.getProdAreaId(_rscJson.prodId),
				"srInParam":srInParam
			};
			try {
				
				var eventJson;
				var response = $.callServiceAsJson(serviceName, param);
				eventJson = response.data;
				//alert(JSON.stringify(response));
				var flag = eventJson.code;
				var msg = eventJson.message;
				if (flag != "0") {
					$.alertM(response.data);
					//$.alert("提示","调用卡资源回填到卡管系统异常！" + msg,"error");
					return false;
				}
				_backFillOrderCardInfo(eventJson.result);
				return true;
			} catch(e) {
				$.alert("提示","调用卡资源回填到卡管系统异常！" + e.message,"error");
				return false;
			}
	};
	_backFillOrderCardInfo=function(result){
		//要求截取前19位编码
		if (_rscJson.iccid.length==20){
			_rscJson.iccid = _rscJson.iccid.substr(0,_rscJson.iccid.length-1)
		}
		 $("#uim_txt_"+_rscJson.prodId).val(_rscJson.iccid);
         var coupon= {
					couponUsageTypeCd : "3", //物品使用类型
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
					couponInstanceNumber : _rscJson.iccid, //物品实例编码
					ruleId : "", //物品规则ID
					partyId : OrderInfo.cust.custId, //客户ID
					prodId :_rscJson.prodId, //产品ID
					offerId : "", //销售品实例ID
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
	}
	return {
		writeReadCard : _writeReadCard,
		readCard:_readCard,
		writeCard:_writeCard
	};
})();
/**
 * 附属销售品受理对象
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("AttachOffer");

/** 附属销售品受理对象*/
AttachOffer = (function() {

	var _openList = []; //保存已经选择的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openedList = []; //已经订购的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openServList = []; //保存已经选择功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openedServList = []; //保存已经订购功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openAppList = []; //保存产品下增值业务
	
	var _labelList = []; //标签列表
	
	var _isChangeUim = 0 ; //3g订购4g流量包判断是否需要补换卡 0不需要补卡，1需要
	
	//初始化附属销售页面
	var _init = function(){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 3;
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		if(!rule.rule.ruleCheck()){ //规则校验失败
			return;
		}
		var param = {
			offerSpecId : prodInfo.prodOfferId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		if(isObj(prodInfo.prodOfferId)){
			if(!query.offer.queryMainOfferSpec(param)){ //查询主套餐规格构成，并且保存
				return;
			}
		}else{
			OrderInfo.offerSpec = {};
		}
		if(CONST.getAppDesc()==0){ //4g系统需要
			if(!prod.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
				return;	
			}
		}
		SoOrder.initFillPage();
		AttachOffer.queryAttachOffer();
		order.dealer.initDealer();
	}; 
	
	//可订购的附属查询 
	var _queryAttachOfferSpec = function(param) {
		query.offer.queryAttachSpec(param,function(data){
			if (data) {
				$("#attach_"+param.prodId).html(data);
				_showMainRoleProd(param.prodId); //通过主套餐成员显示角字
				AttachOffer.changeLabel(param.prodId,param.prodSpecId,""); //初始化第一个标签附属
				if(param.prodId==-1 && OrderInfo.actionFlag==14){ //合约计划特殊处理
					AttachOffer.addOpenList(param.prodId,mktRes.terminal.offerSpecId);
				}
			}
		});
	};
	
	//显示增值业务内容
	var _showApp = function(prodId){
		var appList = CacheData.getOpenAppList(prodId);
		var content = CacheData.getAppContent(prodId,appList);
		$.confirm("增值业务设置： ",content[0].innerHTML,{ 
			yes:function(){	
				$.each(appList,function(){
					if($("#"+prodId+"_"+this.objId).attr("checked")=="checked"){
						this.dfQty = 1;
					}else{
						this.dfQty = 0;
					}
				});
			},
			no:function(){
			}
		});
	};
	
	//获取产品实例
	var getProdInst = function(prodId){
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.prodInsts!=undefined){
				for ( var j = 0; j < offerRole.prodInsts.length; j++) {  //遍历产品实例列表
					if(offerRole.prodInsts[j].prodInstId==prodId){
						return offerRole.prodInsts[j];
					}
				}
			}
		}
	};
	
	//主销售品角色分解个每个接入产品
	var _showMainRoleProd = function(prodId){
		var prodInst = getProdInst(prodId);
		var app = {
			prodId:prodId,
			appList:[]
		};
		AttachOffer.openAppList.push(app);
		for (var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.CONTENT){ //增值业务角色
				for ( var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(roleObj.objType== CONST.OBJ_TYPE.SERV){
						if(prodInst.objId==roleObj.parentProdId && prodInst.componentTypeCd.substring(0,1)==roleObj.componentTypeCd.substring(0,1)){	
							app.appList.push(roleObj);
							if(roleObj.servSpecId==undefined){
								roleObj.servSpecId = roleObj.objId;
							}
							if(roleObj.servSpecName==undefined){
								roleObj.servSpecName = roleObj.objName;
							}
						}
					}
				}
				if(app.appList.length>0){
					var $li = $('<li id="li_'+prodId+'_'+offerRole.offerRoleId+'"></li>');
					$li.append('<dd class="mustchoose" ></dd>');	
					$li.append('<span>'+offerRole.offerRoleName+'</span>');
					$li.append('<dd id="can_'+prodId+'_'+offerRole.offerRoleId+'" class="gou2" onclick="AttachOffer.showApp('+prodId+');"></dd>');
					$("#open_app_ul_"+prodId).append($li);
				}
			}else{ 
				if(offerRole.prodInsts==undefined){
					continue;
				}
				$.each(offerRole.prodInsts,function(){  //遍历产品实例列表
					if(this.prodInstId==prodId){
						for (var k = 0; k < offerRole.roleObjs.length; k++) {
							var roleObj = offerRole.roleObjs[k];
							if(roleObj.objType==CONST.OBJ_TYPE.SERV){
								var servSpecId = roleObj.objId;
								var $oldLi = $('#li_'+prodId+'_'+servSpecId);
								var spec = CacheData.getServSpec(prodId,servSpecId);//从已选择功能产品中找
								if(spec != undefined){
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								var serv = CacheData.getServBySpecId(prodId,servSpecId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								if(roleObj.dfQty > 0){ //必选，或者默选
									_setServSpec(prodId,roleObj); //添加到已开通列表里
									spec = roleObj;
									if(isArray(spec.prodSpecParams)){
										spec.ifParams = "Y";
									}
									$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
									var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
									if(roleObj.minQty==0){
										$li.append('<dd class="delete" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+spec.servSpecName+'\',\''+spec.ifParams+'\')"></dd>');
									}else{
										$li.append('<dd class="mustchoose"></dd>');
									}
									$li.append('<span>'+spec.servSpecName+'</span>');
									if (spec.ifParams=="Y"){
										if(CacheData.setServParam(prodId,spec)){ 
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}else {
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}
									}
									$li.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									$("#open_serv_ul_"+prodId).append($li);
									spec.isdel = "N";
									showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
								}
							}
						}
					}
				});
			}
		}
	};
	
	//查询附属销售品规格
	var _searchAttachOfferSpec = function(prodId,offerSpecId,prodSpecId) {
		var param = {   
			prodId : prodId,
		    prodSpecId : prodSpecId,
		    offerSpecIds : [offerSpecId],
		    ifCommonUse : "" 
		};
		var offerSepcName = $("#search_text_"+prodId).val();
		if(offerSepcName.replace(/\ /g,"")==""){
			$.alert("提示","请输入查询条件！");
			return;
		}
		param.offerSpecName = offerSepcName;
		var data = query.offer.searchAttachOfferSpec(param);
		if(data!=undefined){
			$("#attach_div_"+prodId).html(data).show();
		}
	};
	
	//点击搜索出来的附属销售品
	var _selectAttachOffer = function(prodId,offerSpecId){
		$("#attach_div_"+prodId).hide();
		_addAttOffer(prodId,offerSpecId);
	};
	
	//点击搜索出来的功能产品
	var _selectServ = function(prodId,servSpecId,specName,ifParams){
		$("#attach_div_"+prodId).hide();
		_openServSpec(prodId,servSpecId,specName,ifParams);
	};
	
	//点击搜索出来的附属销售品
	var _closeAttachSearch = function(prodId){
		$("#attach_div_"+prodId).hide();
	};
	
	//已订购的附属销售品查询
	var _queryAttachOffer = function() {
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var prodId = prodInfo.prodInstId;
		var param = {
		    prodId : prodId,
		    prodSpecId : prodInfo.productId,
		    offerSpecId : prodInfo.prodOfferId,
		    acctNbr : prodInfo.accNbr
		};
		query.offer.queryAttachOffer(param,function(data){
			//$("#order_prepare").hide();
			//order.prepare.showOrderTitle("订购/退订功能可选包", "", false);
			$("#order_fill_content").html(data).show();
			$("#dealer").val(OrderInfo.staff.staffName).attr("staffId",OrderInfo.staff.staffId);
			if(isArray(OrderInfo.offerSpec.offerRoles)){
				var member = CacheData.getOfferMember(prodId);
				$.each(OrderInfo.offerSpec.offerRoles,function(){
					if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
						var offerRole = this;
						$.each(this.roleObjs,function(){
							if(this.objType==CONST.OBJ_TYPE.SERV){
								var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(this.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
								}
							}
						});
						return false;
					}
				});
			}
			
			AttachOffer.changeLabel(prodId, prodInfo.productId,""); //初始化第一个标签附属
		});
	};
	
	//删除附属销售品规格
	var _delOfferSpec = function(prodId,offerSpecId){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			var content = CacheData.getOfferProdStr(prodId,spec,2);
			$.confirm("信息确认",content,{ 
				yes:function(){
					$span.addClass("del");
					spec.isdel = "Y";
					delServSpec(prodId,spec); //取消订购销售品时
					order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
					$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
					spec.isTerminal = 0;
				},
				no:function(){
					
				}
			});
		}
	};
	
	//删除附属销售品实例
	var _delOffer = function(prodId,offerId){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = CacheData.getOffer(prodId,offerId);
			if(!isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					offerId:offerId	
				};
				param.acctNbr = OrderInfo.getAccessNumber(prodId);
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				offer.offerMemberInfos = data.offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			var content = "";
			if(offer.offerSpec!=undefined){
				content = CacheData.getOfferProdStr(prodId,offer,1);
			}else {
				content = '退订【'+$span.text()+'】可选包' ;
			}
			$.confirm("信息确认",content,{ 
				yes:function(){
					offer.isdel = "Y";
					$span.addClass("del");
					delServByOffer(prodId,offer);
				},
				no:function(){	
				}
			});
		}
	};
	
	//关闭服务规格
	var _closeServSpec = function(prodId,servSpecId,specName,ifParams){
		var $span = $("#li_"+prodId+"_"+servSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.openServSpec(prodId,servSpecId,specName,ifParams);
		}else { //退订
			$.confirm("信息确认","取消开通【"+$span.text()+"】功能产品",{ 
				yesdo:function(){
					var spec = CacheData.getServSpec(prodId,servSpecId);
					if(spec == undefined){ //没有在已开通附属销售列表中
						return;
					}
					$span.addClass("del");
					spec.isdel = "Y";
					showHideUim(1,prodId,servSpecId);   //显示或者隐藏
				},
				no:function(){
				}
			});
		}
	};
	
	//关闭服务实例
	var _closeServ = function(prodId,servId){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		if($span.attr("class")=="del"){  //已经关闭，取消关闭
			_openServ(prodId,serv);
		}else { //关闭
			$.confirm("信息确认","关闭【"+$span.text()+"】功能产品",{ 
				yesdo:function(){
					$span.addClass("del");
					serv.isdel = "Y";
				},
				no:function(){						
				}
			});
		}
	};
	
	//开通功能产品
	var _openServSpec = function(prodId,servSpecId,specName,ifParams){
		$.confirm("信息确认","开通【"+specName+"】功能产品",{ 
			yesdo:function(){
				var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
				if(servSpec==undefined){   //在可订购功能产品里面 
					var newSpec = {
						objId : servSpecId, //调用公用方法使用
						servSpecId : servSpecId,
						servSpecName : specName,
						ifParams : ifParams,
						isdel : "C"   //加入到缓存列表没有做页面操作为C
					};
					var inPamam = {
						prodSpecId:servSpecId
					};
					if(ifParams == "Y"){
						var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
						if(data==undefined || data.result==undefined){
							return;
						}
						newSpec.prodSpecParams = data.result.prodSpecParams;
					}
					_setServSpec(prodId,newSpec); //添加到已开通列表里
					servSpec = newSpec;
				}
				_checkServExcludeDepend(prodId,servSpec);
			},
			no:function(){
			}
		});
	};
	
	//开通功能产品
	var _openServ = function(prodId,serv){
		$.confirm("信息确认","取消关闭【"+serv.servSpecName+"】功能产品",{ 
			yesdo:function(){
				if(serv!=undefined){   //在可订购功能产品里面 
					if(serv.servSpecId==""){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.removeClass("del");
						serv.isdel = "N";
					}else{
						_checkServExcludeDepend(prodId,serv);
					}
				}
			},
			no:function(){
			}
		});
	};
	
	//校验销售品的互斥依赖
	var _checkOfferExcludeDepend = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = {
			prodId : prodId,
			offerSpecId : offerSpecId,
			orderedOfferSpecIds : [] //可选包互斥依赖查询入场数组
		};
		//已开通销售品列表
		var offerList = CacheData.getOfferList(prodId); 
		if(isArray(offerList)){
			$.each(offerList,function(){
				if(this.offerSpecId!=offerSpecId && this.isdel!="Y"  && this.isdel!="N"){
					if(this.offerSpecId!=undefined){
						param.orderedOfferSpecIds.push(this.offerSpecId);
					}
				}
			});
		}
		//已选销售品列表
		var offerSpecList = CacheData.getOfferSpecList(prodId); 
		if(isArray(offerSpecList)){
			$.each(offerSpecList,function(){
				if(this.offerSpecId!=offerSpecId && this.isdel!="Y"){
					if(this.offerSpecId!=undefined){
						param.orderedOfferSpecIds.push(this.offerSpecId);
					}
				}
			});
		}
		if(param.orderedOfferSpecIds.length == 0 ){
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{
			var data = query.offer.queryExcludeDepend(param);//查询规则校验
			if(data!=undefined){
				paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
			}
		}
		
		//获取销售品节点校验销售品下功能产品的互斥依赖
		/*var offerSpec = CacheData.getOfferSpec(offerSpecId);
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var param = {
						prodId : prodId,
						servSpecId : this.objId,
						orderedServSpecIds : [] //功能产品互斥依赖查询入场数组
					};
					//已选销售品列表
					var offerSpecList = CacheData.getSpecList(prodId);
					if(isArray(offerSpecList)){
						$.each(offerSpecList,function(){
							if(this.offerSpecId!=offerSpecId && this.isdel!="Y" && this.isdel!="C"){
								param.orderedOfferSpecIds.push(this.offerSpecId);
							}
						});
					}
					if(param.orderedServSpecIds.length == 0 ){
						AttachOffer.addOpenList(prodId,offerSpecId); 
					}else{
						datas.push(query.offer.queryServExcludeDepend(param));//查询规则校验
					}
				});
			});
		}*/
		//paserData(datas,prodId,offerSpecId,offer.offerSpecName,"OFFER"); //解析数据
		
		/*if(param.orderedOfferSpecIds.length == 0 ){
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserData(data.result,prodId,offerSpecId,offer.offerSpecName,"OFFER"); //解析数据
			}
		}*/
	};
	
	//校验服务的互斥依赖
	var _checkServExcludeDepend = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		//互斥依赖入参
		var param = { 
			servSpecId:servSpecId,
			prodId:prodId,
			orderedServSpecIds : [] //销售品互斥依赖查询入场数组
		};
		//遍历已选功能产品
		var servSpecList = CacheData.getServSpecList(prodId);
		if(isArray(servSpecList)){
			$.each(servSpecList,function(){ //遍历已选择功能产品
				if(this.servSpecId!=servSpecId && this.isdel!="Y" && this.isdel!="C"){
					param.orderedServSpecIds.push(this.servSpecId);
				}
			});
		}
		//遍历已选功能产品
		var servList = CacheData.getServList(prodId);
		if(isArray(servList)){
			$.each(servList,function(){ //遍历已选择功能产品
				if(this.servSpecId!=servSpecId && this.isdel!="Y" && this.isdel!="C"){
					param.orderedServSpecIds.push(this.servSpecId);
				}
			});
		}
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServData(data.result,prodId,serv);//解析数据
			}
		}
	};
	
	//订购附属销售品
	var _addOfferSpec = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		$.confirm("信息确认",content,{ 
			yes:function(){
				setServ2OfferSpec(prodId,newSpec);
			},
			yesdo:function(){
				_checkOfferExcludeDepend(prodId,newSpec);
			},
			no:function(){
				
			}
		});
	};
	
	//根据预校验返回订购附属销售品
	var _addOfferSpecByCheck = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		$.confirm("信息确认",content,{ 
			yes:function(){
				setServ2OfferSpec(prodId,newSpec);
			},
			yesdo:function(){
				_checkOfferExcludeDepend(prodId,newSpec);
			}
		});
	};
	
	//删除附属销售品带出删除功能产品
	var delServSpec = function(prodId,offerSpec){
		$.each(offerSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				var servSpecId = this.objId;
				if($("#check_"+prodId+"_"+servSpecId).attr("checked")=="checked"){
					var spec = CacheData.getServSpec(prodId,servSpecId);
					spec.isdel = "Y";
					var $li = $("#li_"+prodId+"_"+servSpecId);
					$li.removeClass("canshu").addClass("canshu2");
					$li.find("span").addClass("del"); //定位删除的附属
					showHideUim(1,prodId,servSpecId);   //显示或者隐藏
				}
			});
		});
	};
	
	//删除附属销售品带出删除功能产品
	var delServByOffer = function(prodId,offer){	
		$.each(offer.offerMemberInfos,function(){
			var servId = this.objInstId;
			if($("#check_"+prodId+"_"+servId).attr("checked")=="checked"){
				var serv = CacheData.getServ(prodId,servId);
				if(serv != undefined){ //没有在已开通附属销售列表中
					return false;
				}
				serv.isdel = "Y";
				var $li = $("#li_"+prodId+"_"+servId);
				$li.removeClass("canshu").addClass("canshu2");
				$li.find("span").addClass("del"); //定位删除的附属
			}
		});
	};
	
	//把选中的服务保存到销售品规格中
	var setServ2OfferSpec = function(prodId,offerSpec){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if($("#check_"+prodId+"_"+this.objId).attr("checked")=="checked"){
						this.selQty = 1;
					}
				});
			});
		}
	};
	
	//取消退订附属销售品
	var _addOffer = function(prodId,offerId){
		var specName = $("#li_"+prodId+"_"+offerId).find("span").text();
		$.confirm("信息确认","取消退订【"+specName+"】可选包",{ 
			yesdo:function(){
				var offer = CacheData.getOffer(prodId,offerId); //在已经开通列表中查找
				if(offer!=undefined){   //在可订购功能产品里面 
					if(offer.offerSpecId==""){
						var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
						$span.removeClass("del");
						offer.isdel = "N";
					}else{
						_checkOfferExcludeDepend(prodId,offer);
					}
				}
			},
			no:function(){
			}
		});
	};
	
	//确认订购附属销售品
	var _addAttOffer = function(prodId,offerSpecId,specName){
		_addOfferSpec(prodId,offerSpecId);
	};
	
	//解析互斥依赖返回结果
	var paserOfferData = function(result,prodId,offerSpecId,specName){
		var exclude = result.offerSpec.exclude;
		var depend = result.offerSpec.depend;
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeOffer : [],   //互斥依赖显示列表
			dependOffer : {  //存放互斥依赖列表
				dependOffers : [],
				offerGrpInfos : []
			}
		};
		
		//解析可选包互斥依赖组
		if(isArray(exclude)){
			for (var i = 0; i < exclude.length; i++) {
				var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(offerList!=undefined){
					for ( var j = 0; j < offerList.length; j++) {
						if(offerList[j].isdel=="Y"){
							if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
					param.excludeOffer.push(exclude[i].offerSpecId);
				}
			}
		}
		if(depend!=undefined && isArray(depend.offerInfos)){
			for (var i = 0; i < depend.offerInfos.length; i++) {	
				content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
				param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
			}	
		}
		if(depend!=undefined && isArray(depend.offerGrpInfos)){
			for (var i = 0; i < depend.offerGrpInfos.length; i++) {
				var offerGrpInfo = depend.offerGrpInfos[i];
				param.dependOffer.offerGrpInfos.push(offerGrpInfo);
				content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
				if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
					for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
						var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
						content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
					}
				}
			}
		}
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{	
			$.confirm("开通： " + specName,content,{ 
				yesdo:function(){
					excludeAddattch(prodId,offerSpecId,param);
				},
				no:function(){
					
				}
			});
		}
	};
	
	/*//解析互斥依赖返回结果
	var paserData = function(datas,prodId,offerSpecId,specName,objType){
		var exclude = result.offerSpec.exclude;
		var depend = result.offerSpec.depend;
		var servExclude = result.servSpec.exclude;
		var servDepend = result.servSpec.depend;

		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeOffer : [],   //互斥依赖显示列表
			dependOffer : {  //存放互斥依赖列表
				dependOffers : [],
				offerGrpInfos : []
			},
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [] //存放互斥依赖列表
		};
		
		//解析可选包互斥依赖组
		if(exclude!=undefined && exclude.length>0){
			for (var i = 0; i < exclude.length; i++) {
				var offerList = AttachOffer.getOfferList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(offerList!=undefined){
					for ( var j = 0; j < offerList.length; j++) {
						if(offerList[j].isdel=="Y"){
							if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
					param.excludeOffer.push(exclude[i].offerSpecId);
				}
			}
		}
		if(depend!=undefined && depend.offerInfos!=undefined && depend.offerInfos.length>0){
			for (var i = 0; i < depend.offerInfos.length; i++) {	
				content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
				param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
			}	
		}
		if(depend!=undefined && depend.offerGrpInfos!=undefined && depend.offerGrpInfos.length>0){
			for (var i = 0; i < depend.offerGrpInfos.length; i++) {
				var offerGrpInfo = depend.offerGrpInfos[i];
				param.dependOffer.offerGrpInfos.push(offerGrpInfo);
				content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
				if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
					for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
						var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
						content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
					}
				}
			}
		}
		
		//解析功能产品互斥依赖组
		if(servExclude!=undefined && servExclude.length>0){
			$.each(servExclude,function(){
				if(this.offerSpecId == undefined || this.offerSpecId == ""){ //纯功能产品互斥
					var servList = AttachOffer.getServList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(servList!=undefined){
						for ( var i = 0; i < servList.length; i++) {
							if(servList[i].isdel=="Y"){
								if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + this.servSpecName + "<br>";
						param.excludeServ.push(this);
					}
				}else {  //可选包下功能产品互斥
					var offerList = AttachOffer.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == this.offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + this.offerSpecName + "<br>";
						param.excludeOffer.push(this.offerSpecId);
					}
				}
			});
		}
		if(servDepend!=undefined && servDepend.length>0){
			$.each(servDepend,function(){
				if(this.offerSpecId == undefined || this.offerSpecId == ""){ //纯功能产品依赖
					content += "需要开通：   " + this.servSpecName + "<br>";
					param.dependServ.push(this);
				}else {  //功能产品与可选包下功能产品依赖
					content += "需要开通：   " + this.offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(this.offerSpecId);
				}
			});
		}
		
		if(content==""){ //没有互斥依赖
			if(objType == "OFFER"){
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}else {
				AttachOffer.addOpenServList(prodId,offerSpecId); 
			}
		}else{	
			$.confirm("开通： " + specName,content,{ 
				yesdo:function(){
					excludeAddattch(prodId,offerSpecId,param,objType);
				},
				no:function(){
					
				}
			});
		}
	};*/
	
	//解析服务互斥依赖
	var paserServData = function(result,prodId,serv){
		var servSpecId = serv.servSpecId;
		var servExclude = result.servSpec.exclude;
		var servDepend = result.servSpec.depend;

		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [] //存放互斥依赖列表
		};
		
		//解析功能产品互斥依赖组
		if(isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + this.servSpecName + "<br>";
					param.excludeServ.push(this);
				}
			});
		}
		if(isArray(servDepend)){
			$.each(servDepend,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.dependServ.push(this);
			});
		}
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{	
			$.confirm("开通： " + serv.servSpecName,content,{ 
				yesdo:function(){
					AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
					excludeAddServ(prodId,servSpecId,param);
				},
				no:function(){
				}
			});
		}
	};
	
	//服务互斥依赖时带出添加跟删除
	var excludeAddServ = function(prodId,servSpecId,param){
		if(isArray(param.excludeServ)){ //有互斥
			for (var i = 0; i < param.excludeServ.length; i++) { //删除已开通
				var excludeServSpecId = param.excludeServ[i].servSpecId;
				var spec = CacheData.getServSpec(prodId,excludeServSpecId);
				if(spec!=undefined){
					var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
				}else{
					var serv = CacheData.getServ(prodId,excludeServSpecId);
					if(serv!=undefined){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
		}
		if(isArray(param.dependServ)){ // 依赖
			for (var i = 0; i < param.dependServ.length; i++) {
				var servSpec = param.dependServ[i];
				AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams); 
			}
		}
	};
	
	//互斥依赖时添加
	var excludeAddattch = function(prodId,specId,param){
		if(param.dependOffer.offerGrpInfos.length>0){  // 依赖组
			for (var i = 0; i < dependOffer.offerGrpInfos.length; i++) {
				var offerGrpInfo = dependOffer.offerGrpInfos[i];
				var $offerSpecs = $("input[name="+offerGrpInfo.grpId+"]:checked");
				var len  = $offerSpecs.length;
				if(len>=offerGrpInfo.minQty&&len<=offerGrpInfo.maxQty){
					$offerSpecs.each(function(index,spec){
						AttachOffer.addOpenList(prodId,spec.id); 
					});
				}else {
					$.alert("错误信息","依赖组选择出错！");
					return;
				}
			}
		}
		
		AttachOffer.addOpenList(prodId,specId); //添加开通附属
		if(param.excludeOffer.length>0){ //有互斥
			//删除已开通
			for (var i = 0; i < param.excludeOffer.length; i++) {
				var excludeSpecId = param.excludeOffer[i];
				var spec = CacheData.getOfferSpec(prodId,excludeSpecId);
				if(spec!=undefined){
					var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
				}
				var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
				if(offer!=undefined){
					var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
					$span.addClass("del");
					offer.isdel = "Y";
				}
			}
		}
		if(param.dependOffer.dependOffers.length>0){ // 依赖
			for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
				var offerSpecId = param.dependOffer.dependOffers[i];
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}
		}
		/*if(objType == "OFFER"){
			AttachOffer.addOpenList(prodId,specId); //添加开通附属
			if(param.excludeOffer.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeOffer.length; i++) {
					var excludeSpecId = param.excludeOffer[i];
					var spec = AttachOffer.getSpec(prodId,excludeSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var offer = AttachOffer.getOfferBySpecId(prodId,excludeSpecId);
					if(offer!=undefined){
						var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
						$span.addClass("del");
						offer.isdel = "Y";
					}
				}
			}
			if(param.dependOffer.dependOffers.length>0){ // 依赖
				for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
					var offerSpecId = param.dependOffer.dependOffers[i];
					AttachOffer.addOpenList(prodId,offerSpecId); 
				}
			}
		}else{
			AttachOffer.addOpenServList(prodId,specId); //添加开通功能
			if(param.excludeServ!=undefined && param.excludeServ.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeServ.length; i++) {
					var excludeServSpecId = param.excludeServ[i].servSpecId;
					var spec = CacheData.getServSpec(prodId,excludeServSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var serv = AttachOffer.getServ(prodId,excludeServSpecId);
					if(serv!=undefined){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
			if(param.dependServ!=undefined&&param.dependServ.length>0){ // 依赖
				for (var i = 0; i < param.dependServ.length; i++) {
					var servSpecId = param.dependServ[i].servSpecId;	
					var newSpec = {
						objId : servSpecId, //调用公用方法使用
						servSpecId : servSpecId,
						servSpecName : param.dependServ[i].servSpecName,
						ifParams : param.dependServ[i].ifParams,
						isdel : "C"   //加入到缓存列表没有做页面操作为C
					};
					var inPamam = {
						prodSpecId:servSpecId
					};
					if("Y"  == newSpec.ifParams){
						var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
						if(data==undefined || data.result==undefined){
							return;
						}
						newSpec.prodSpecParams = data.result.prodSpecParams;
					}
					_setServSpec(prodId,newSpec); //添加到已开通列表里
					AttachOffer.addOpenServList(prodId,servSpecId); 
				}
			}
		}*/
	};
	
	//添加到开通列表
	var _addOpenList = function(prodId,offerSpecId){
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(offer != undefined){ //在已开通中，需要取消退订
			var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
			$span.removeClass("del");
			offer.isdel = "N";
			return;
		}
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		if(newSpec.isdel=="C"){ //没有在已开通附属销售列表中，但是已经加载到缓存
			var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			var $li = $('<li id="li_'+prodId+'_'+offerSpecId+'"></li>');
			$li.append('<dd class="delete" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')"></dd>');	
			$li.append('<span>'+newSpec.offerSpecName+'</span>');
			if(newSpec.ifParams){
				if(CacheData.setParam(prodId,newSpec)){ 
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}else {
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}
			}
			if(newSpec.ifShowTime=="Y"){
				$li.append('<dd class="time" id="time_'+prodId+'_'+offerSpecId+'" onclick="AttachOffer.showTime('+prodId+','+offerSpecId+',\''+newSpec.offerSpecName+'\');"></dd>');
			}
			$("#open_ul_"+prodId).append($li);
			newSpec.isdel = "N";
		}else if((newSpec.isdel=="Y")) { 
			var $span = $("#li_"+prodId+"_"+offerSpecId).find("span");
			$span.removeClass("del");
			newSpec.isdel = "N";
		}else if((newSpec.isdel=="N")) {  //容错处理
			var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			var $li = $('<li id="li_'+prodId+'_'+offerSpecId+'"></li>');
			$li.append('<dd class="delete" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')"></dd>');	
			$li.append('<span>'+newSpec.offerSpecName+'</span>');
			if (newSpec.ifParams){
				if(CacheData.setParam(prodId,newSpec)){ 
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}else {
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}
			}
			if(newSpec.ifShowTime=="Y"){
				$li.append('<dd class="time" id="time_'+prodId+'_'+offerSpecId+'" onclick="AttachOffer.showTime('+prodId+','+offerSpecId+',\''+newSpec.offerSpecName+'\');"></dd>');
			}
			$("#open_ul_"+prodId).append($li);
		}
		
		//获取销售品节点校验销售品下功能产品的互斥依赖
		if(newSpec!=undefined){
			$.each(newSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.objType==4 && this.selQty==1){
						var ifParams = "N";
						if(isArray(this.prodSpecParams)){
							ifParams = "Y";
						}
						_addOpenServList(prodId,this.objId,this.objName,ifParams);
					}
				});
			});
		}
		if(isArray(newSpec.agreementInfos)){ //合约销售品需要输入终端
			/*var $sel = $("#terminalSel_"+prodId);
			$sel.empty();
			$.each(newSpec.agreementInfos,function(){
				var $option = $('<option value="'+this.terminalModels+'">'+this.terminalName+'</option>');
				$sel.append($option);
			});
			$("#terminalDiv_"+prodId).show();
			AttachOffer.isTerminal = 1;*/
			if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){
				var objInstId = prodId+'_'+newSpec.offerSpecId;
				//一个终端对应一个ul
				var $ul = $('<ul id="terminalUl_'+objInstId+'" class="fillin show"></ul>');
				var $sel = $('<select id="terminalSel_'+objInstId+'"></select>');  
				var $li1 = $('<li class="full"><label style="width:auto; margin:0px 10px;"><span style="color:#71AB5A;font-size:16px">'+newSpec.offerSpecName+'</span></label></li>');
				var $li2 = $('<li><label> 可选终端规格：</label></li>');
				$.each(newSpec.agreementInfos,function(){
					var $option = $('<option value="'+this.terminalModels+'" price="'+this.agreementPrice+'">'+this.terminalName+'</option>');
					$sel.append($option);
				});
				$li2.append($sel).append('<label class="f_red">*</label>');
				var $li3 = $('<li><label>终端校验：</label><input id="terminalText_'+objInstId+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
						+'<a onclick="AttachOffer.checkTerminalCode('+prodId+','+newSpec.offerSpecId+')" class="purchase" style="float:left">校验</a></li>');	
				/*var $li4 = $('<li id="terRes_'+objInstId+'" class="full" style="display: none;" >'
						+'<label style="width:auto; margin:0px 10px;">终端名称：<span id="terName_'+objInstId+'" ></span></label>'
						+'<label style="width:auto; margin:0px 10px;">终端串码：<span id="terCode_'+objInstId+'" ></span></label>'
						+'<label style="width:auto; margin:0px 10px;">终端价格：<span id="terPrice_'+objInstId+'" ></span></label></li>');*/
				var $div = $("#terminalDiv_"+prodId);
				$ul.append($li1).append($li2).append($li3).appendTo($div);
				$div.show();
				newSpec.isTerminal = 1;
			}
		}
	};
	
	//终端校验
	var _checkTerminalCode = function(prodId,offerSpecId){
		//清空旧终端信息
		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
			var attach2Coupon = OrderInfo.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
				OrderInfo.attach2Coupons.splice(i,1);
				break;
			}
		}
		var objInstId = prodId+"_"+offerSpecId;
		var resId = $("#terminalSel_"+objInstId).val();
		if(resId==undefined || $.trim(resId)==""){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+objInstId).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		var param = {
			instCode : instCode,
			mktResId : resId
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE){
			$.alert("信息提示",data.message);
			var price = $("#terminalSel_"+objInstId).find("option:selected").attr("price");
			/*$("#terRes_"+objInstId).show();
			$("#terName_"+objInstId).text(data.mktResName);
			$("#terCode_"+objInstId).text(data.instCode);	
			if(price!=undefined){
				$("#terPrice_"+objInstId).text(price/100 + "元");
			}*/
			var coupon = {
				couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : data.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : data.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : price/100, //物品价格
				couponInstanceNumber : data.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId : prodId, //产品ID
				offerId : -1, //销售品实例ID
				attachSepcId : offerSpecId,
				state : "ADD", //动作
				relaSeq : "" //关联序列	
			};
			OrderInfo.attach2Coupons.push(coupon);
		}else{
			$.alert("提示",data.message);
		}
	};
	
	//添加可选包到缓存列表
	var _setSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);  //没有在已选列表里面
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			newSpec = query.offer.queryAttachOfferSpec(offerSpecId); //重新获取销售品构成
			if(!newSpec){
				return;
			}
			newSpec.isdel = "C";
			var flag = true ; 
			for (var i = 0; i < AttachOffer.openList.length; i++) { //没有开通任何附属
				var open = AttachOffer.openList[i];
				if(open.prodId==prodId){
					flag = false;
					break;
				}
			} 
			if(flag){
				var open = {
					prodId : prodId,
					specList : []
				};
				AttachOffer.openList.push(open);
			}
			CacheData.getOfferSpecList(prodId).push(newSpec);//添加到已开通列表里
		}
		return newSpec;
	};
	
	//添加可选包到缓存列表
	var _setServSpec = function(prodId,spec){
		if(spec.servSpecId==undefined){
			spec.servSpecId = spec.objId;
		}
		if(spec.servSpecName==undefined){
			spec.servSpecName = spec.objName;
		}
		var flag = true ; 
		for (var i = 0; i < AttachOffer.openServList.length; i++) { //没有开通任何附属
			var open = AttachOffer.openServList[i];
			if(open.prodId==prodId){
				flag = false;
				break;
			}
		} 
		if(flag){
			var open = {
				prodId : prodId,
				servSpecList : []
			};
			AttachOffer.openServList.push(open);
		}
		CacheData.getServSpecList(prodId).push(spec);//添加到已开通列表里
	};
	
	//添加到开通列表
	var _addOpenServList = function(prodId,servSpecId,servSpecName,ifParams){
		//从已开通功能产品中找
		var serv = CacheData.getServBySpecId(prodId,servSpecId); 
		if(serv != undefined){
			$("#li_"+prodId+"_"+serv.servId).find("span").removeClass("del");
			serv.isdel = "N";
			return;
		}
		//从已选择功能产品中找
		var spec = CacheData.getServSpec(prodId,servSpecId);
		if(spec == undefined){
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : servSpecName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			}
			_setServSpec(prodId,newSpec); //添加到已开通列表里
			spec = newSpec;
		} 
		if(spec.isdel == "C"){  //没有订购过
			$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
			var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
			$li.append('<dd class="delete" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+servSpecName+'\',\''+ifParams+'\')"></dd>');	
			$li.append('<span>'+spec.servSpecName+'</span>');
			if (spec.ifParams=="Y"){
				if(CacheData.setServParam(prodId,spec)){ 
					$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
				}else {
					$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
				}
			}
			$("#open_serv_ul_"+prodId).append($li);
			spec.isdel = "N";
			showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
		}else {
			$("#li_"+prodId+"_"+servSpecId).find("span").removeClass("del");
			spec.isdel = "N";
			showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
		}
	};
	
	//现在主销售品参数
	var _showMainParam = function(){
		var content = CacheData.getParamContent(-1,OrderInfo.offerSpec,0);
		$.confirm("参数设置： ",content,{ 
			yes:function(){	
				
			},
			no:function(){
				
			}
		});
		$('#paramForm').bind('formIsValid', function(event, form) {
		}).ketchup({bindElement:"easyDialogYesBtn"});
	};
	
	//显示参数
	var _showParam = function(prodId,offerSpecId,flag){	
		if(flag==1){ //显示已订购附属		
			var offer = CacheData.getOfferBySpecId(prodId,offerSpecId);
			if(!isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					offerId:offer.offerId	
				};
				param.acctNbr = OrderInfo.getAccessNumber(prodId);
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				offer.offerMemberInfos = data.offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			if(!offer.isGetParam){  //已订购附属没有参数，需要获取销售品参数
				var param = {   
				    offerTypeCd : "2",
				    offerId: offer.offerId,
				    offerSpecId : offer.offerSpecId
				};
				var offerParam = query.offer.queryOfferParam(param); //重新获取销售品参数
				if(offerParam==undefined){
					return;
				}else{
					offer.offerParamInfos = offerParam.offerParamInfos;
					offer.isGetParam = true;
				}
			}
			var content = CacheData.getParamContent(prodId,offer,flag);
			$.confirm("参数设置： ",content,{ 
				yes:function(){		
				},
				no:function(){
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form) {
				var isset = false;
				$.each(offer.offerSpec.offerSpecParams,function(){
					var itemInfo = CacheData.getOfferParam(prodId,offer.offerId,this.itemSpecId);
					itemInfo.setValue = $("#"+prodId+"_"+this.itemSpecId).val();	
					if(itemInfo.value!=itemInfo.setValue){
						itemInfo.isUpdate = "Y";
						isset = true;
					}
				});
				if(isset){
					$("#can_"+prodId+"_"+offer.offerId).removeClass("canshu").addClass("canshu2");
					offer.isset = "Y";
					offer.update = "Y";
				}else{
					$("#can_"+prodId+"_"+offer.offerId).removeClass("canshu2").addClass("canshu");
					offer.isset = "N";
					offer.update = "N";
				}
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});		
		}else {
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			if(spec == undefined){  //未开通的附属销售品，需要获取销售品构成
				spec = query.offer.queryAttachOfferSpec(offerSpecId); //重新获取销售品构成
				if(!spec){
					return;
				}
			}
			var content = CacheData.getParamContent(prodId,spec,flag);	
			$.confirm("参数设置： ",content,{ 
				yes:function(){
				},
				no:function(){
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form){
				if(!!spec.offerSpecParams){
					for (var i = 0; i < spec.offerSpecParams.length; i++) {
						var param = spec.offerSpecParams[i];
						var itemSpec = CacheData.getSpecParam(prodId,offerSpecId,param.itemSpecId);
						itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
					}
				}
				if(spec.offerRoles!=undefined && spec.offerRoles.length>0){
					for (var i = 0; i < spec.offerRoles.length; i++) {
						var offerRole = spec.offerRoles[i];
						for (var j = 0; j < offerRole.roleObjs.length; j++) {
							var roleObj = offerRole.roleObjs[j];
							if(!!roleObj.prodSpecParams){
								for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
									var prodParam = roleObj.prodSpecParams[k];
									var prodItem = CacheData.getProdSpecParam(prodId,offerSpecId,prodParam.itemSpecId);
									prodItem.value = $("#"+prodId+"_"+prodParam.itemSpecId).val();
								}
							}
						}
					}
				}
				$("#can_"+prodId+"_"+offerSpecId).removeClass("canshu").addClass("canshu2");
				var attchSpec = CacheData.getOfferSpec(prodId,offerSpecId);
				attchSpec.isset = "Y";
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});	
		}
	};
	
	//显示服务参数
	var _showServParam = function(prodId,servSpecId,flag){
		if(flag==1){ //显示已订购附属
			var serv = CacheData.getServBySpecId(prodId,servSpecId);
			var param = {
				prodId : serv.servId,
				ifServItem:"Y"
			};
			if(!serv.isGetParamSpec){  //已订购附属没有参数，需要获取销售品参数	
				param.prodSpecId = serv.servSpecId;
				var dataSepc = query.prod.prodSpecParamQuery(param); //重新获取销售品参数
				if(dataSepc==undefined){
					return;
				}else{
					serv.prodSpecParams = dataSepc.result.prodSpecParams;
					serv.isGetParamSpec = true;
				}
			}
			if(!serv.isGetParamInst){  //已订购附属没有参数，需要获取销售品参数
				var data = query.prod.prodInstParamQuery(param); //重新获取销售品参数
				if(data==undefined){
					return;
				}else{
					serv.prodInstParams = data.result.prodInstParams;
					serv.isGetParamInst = true;
				}
			}
			var content = CacheData.getParamContent(prodId,serv,3);
			$.confirm("参数设置： ",content,{ 
				yes:function(){	
					
				},
				no:function(){
					
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form) {
				var isset = false;
				$.each(serv.prodSpecParams,function(){
					var prodItem = CacheData.getServInstParam(prodId,serv.servId,this.itemSpecId);
					prodItem.setValue = $("#"+prodId+"_"+this.itemSpecId).val();	
					if(prodItem.value!=prodItem.setValue){
						prodItem.isUpdate = "Y";
						isset = true;
					}
				});
				if(isset){
					$("#can_"+prodId+"_"+serv.servId).removeClass("canshu").addClass("canshu2");
					serv.isset = "Y";
					serv.update = "Y";
				}else{
					$("#can_"+prodId+"_"+serv.servId).removeClass("canshu2").addClass("canshu");
					serv.isset = "N";
					serv.update = "N";
				}
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
		
		}else {
			var spec = CacheData.getServSpec(prodId,servSpecId);
			if(spec == undefined){  //未开通的附属销售品，需要获取销售品构成
				return;
			}
			var content = CacheData.getParamContent(prodId,spec,2);	
			$.confirm("参数设置： ",content,{ 
				yes:function(){
				},
				no:function(){	
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form){
				if(!!spec.prodSpecParams){
					for (var i = 0; i < spec.prodSpecParams.length; i++) {
						var param = spec.prodSpecParams[i];
						var itemSpec = CacheData.getServSpecParam(prodId,servSpecId,param.itemSpecId);
						itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
					}
				}
				$("#can_"+prodId+"_"+servSpecId).removeClass("canshu").addClass("canshu2");
				var attchSpec = CacheData.getServSpec(prodId,servSpecId);
				attchSpec.isset = "Y";
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
		}
		
	};
	
	//销售品生失效时间显示
	var _showTime = function(prodId,offerSpecId,offerSpecName){	
		var data = OrderInfo.getPrivilege("EFF_TIME");		
		$('#attachName').text(offerSpecName+"--生失效设置");
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		_initTime(spec);
		easyDialog.open({
			container : "div_time_dialog"
		});
		$("#timeSpan").off("click").on("click",function(){
			_setAttachTime(prodId,offerSpecId);
		});
		if(data==0){
			$("#startTimeTr").show();
			$("#endTimeTr").show();
		}else{
			$("#startTimeTr").hide();
			$("#endTimeTr").hide();
		}
	};
	
	//销售品生效时间显示
	var _showStartTime = function(){	
		var strDate =DateUtil.Format("yyyy-MM-dd",new Date());
		var endDate = $("#endDt").val();
		if(endDate ==""){
			$.calendar({minDate:strDate});
		}else{
			$.calendar({minDate:strDate,maxDate:endDate});
		}
	};
	
	//销售品失效时间显示
	var _showEndTime = function(){	
		var strDate = $("#startDt").val();
		if(strDate==""){
			strDate =DateUtil.Format("yyyy-MM-dd",new Date());
		}
		$.calendar({minDate:strDate});
	};
	
	//初始化时间设置页面
	var _initTime = function(spec){
		if(spec!=undefined && spec.ooTimes!=undefined){
			var ooTime = spec.ooTimes;
			$("input[name=startTimeType][value='"+ooTime.startType+"']").attr("checked","checked");
			$("input[name=endTimeType][value='"+ooTime.endType+"']").attr("checked","checked");
			$("#startDt").val("");
			$("#endDt").val("");
			$("#endTime").val("");
			if(ooTime.startType == 4){ //指定生效时间
				$("#startDt").val(ooTime.startDt);
			}
			if(ooTime.endType == 4){ //指定失效时间
				$("#endDt").val(ooTime.endDt);
			}else if(ooTime.endType == 5){  //有效时长
				$("#endTime").val(ooTime.effTime);
				$("#endTimeUnit").val(ooTime.effTimeUnitCd);
			}
		}else {
			$("input[name=startTimeType][value=1]").attr("checked","checked");
			$("input[name=endTimeType][value=1]").attr("checked","checked");
			$("#startDt").val("");
			$("#endDt").val("");
			$("#endTime").val("");
		}
	};
	
	//显示主套餐时间
	var _showOfferTime = function(){
		var data = OrderInfo.getPrivilege("EFF_TIME");		
		$('#attachName').text(OrderInfo.offerSpec.offerSpecName+"-生失效设置");
		_initTime(OrderInfo.offerSpec);
		easyDialog.open({
			container : "div_time_dialog"
		});
		$("#timeSpan").off("click").on("click",function(){
			_setMainTime();
		});
		if(data==0){
			$("#startTimeTr").show();
			$("#endTimeTr").show();
		}else{
			$("#startTimeTr").hide();
			$("#endTimeTr").hide();
		}
	};
	
	//显示主套餐构成
	var _showMainMember = function(){
		$('#memberName').text(OrderInfo.offerSpec.offerSpecName+"-构成");
		$("#main_member_div").empty();
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.memberRoleCd == CONST.MEMBER_ROLE_CD.CONTENT){
				var $ul = $('</div><ul id="serv_ul_'+prodId+'"></ul>');
				var $div = $('<div id="serv_div_'+prodId+'" class="fs_choosed"></div>');
				$("#main_member_div").append("<h4>"+this.offerRoleName+"</h4>").append($div.append($ul));
				$.each(offerRole.roleObjs,function(){
					var $li = $('<li id="li_'+prodId+'_'+this.objId+'">'+this.objName+'</li>');
					var $checkbox = $('<input type="checkbox" name="serv_check_'+prodId+'" servSpecId="'+this.objId+'"></input>');
					$ul.append($checkbox).append($li);
				});
				$("#main_member_div").append('<div class="clear"></div>');
			}else{
				$.each(offerRole.prodInsts,function(){
					var prodId = this.prodInstId;
					var $ul = $('</div><ul id="serv_ul_'+prodId+'"></ul>');
					var $div = $('<div id="serv_div_'+prodId+'" class="fs_choosed"></div>');
					$("#main_member_div").append("<h4>"+this.offerRoleName+"</h4>").append($div.append($ul));
					$.each(offerRole.roleObjs,function(){
						if(this.objType == CONST.OBJ_TYPE.SERV){
							var $li = $('<li id="li_'+prodId+'_'+this.objId+'">'+this.objName+'</li>');
							var $checkbox = $('<input type="checkbox" name="serv_check_'+prodId+'" servSpecId="'+this.objId+'"></input>');
							$ul.append($checkbox).append($li);		
						}
					});
					$("#main_member_div").append('<div class="clear"></div>');
				});
			}
		});
		easyDialog.open({
			container : "div_member_dialog"
		});
		
		$.each(OrderInfo.offerSpec.offerRoles,function(){  //自动勾选功能产品
			var offerRole = this;
			$.each(offerRole.prodInsts,function(){ //自动勾选接入产品已经选择的功能产品
				var prodInst = this;
				$.each(offerRole.roleObjs,function(){ //根据规格配置勾选默认的功能产品
					var servSpecId = this.objId;
					if(this.minQty>0){ //必选
						$("input[name='serv_check_"+prodInst.prodInstId+"']").each(function(){
							if(servSpecId==$(this).attr("servSpecId")){
								$(this).attr("checked","checked");
								$(this).attr("disabled","disabled");
							}
						});
					}
				});
				if(!!prodInst.servInsts){  
					$.each(prodInst.servInsts,function(){  //遍历产品实例下已经选择的功能产品
						var servSpecId = this.objId;
						$("input[name='serv_check_"+prodInst.prodInstId+"']").each(function(){
							if(servSpecId==$(this).attr("servSpecId")){
								$(this).attr("checked","checked");
							}
						});
					});
				}
			});
		});
		
		$("#memberSpan").off("click").on("click",function(){
			_setMainMember();
		});
	};
	
	//保存主销售品成员
	var _setMainMember = function(){
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			$.each(this.prodInsts,function(){
				var prodInst = this;
				prodInst.servInsts = [];
				$("input[name='serv_check_"+this.prodInstId+"']:checked").each(function(){
					var servSpecId = $(this).attr("servSpecId");
					$.each(offerRole.roleObjs,function(){
						if(this.objId==servSpecId){  //获取选择功能产品的构成
							prodInst.servInsts.push(this);	
						}
					});
				});
			});
		});
		easyDialog.close();
	};
	
	//获取ooTime节点
	var _getTime = function(){
		var ooTime = {
			state : "ADD" 
		};
		//封装生效时间
		var startRadio = $("input[name=startTimeType]:checked").attr("value");
		ooTime.startType = startRadio;
		if(startRadio==1){
			ooTime.isDefaultStart = "Y";
		}else if(startRadio==2){  //竣工生效，不传值
			
		}else if(startRadio==3){  //次月生效
			ooTime.startTime = 1;
			ooTime.startTimeUnitCd = 7;
			//ooTime.startDt = _getNextMonthFirstDate();
		}else if(startRadio==4){ //指定生效时间
			if($("#startDt").val()==""){
				$.alert("提示","指定生效时间不能为空!");
				return;
			}
			ooTime.startDt = $("#startDt").val();
		}
		//封装失效时间
		var endRadio = $("input[name=endTimeType]:checked").attr("value");	
		ooTime.endType = endRadio;
		if(endRadio==1){
			ooTime.isDefaultEnd = "Y";
		}else if(endRadio==4){
			if($("#endDt").val()==""){
				$.alert("提示","指定失效时间不能为空!");
				return;
			}
			ooTime.endDt = $("#endDt").val();
		}else if(endRadio==5){
			var end = $("#endTime").val();
			if(end==""){
				$.alert("提示","有效时长不能为空!");
				return;
			}
			if(isNaN(end)){
				$.alert("提示","有效时长必须为数字!");
				return;
			} 
			if(end<=0){
				$.alert("提示","有效时长必须大于0!");
				return;
			} 
			ooTime.effTime = end;
			ooTime.effTimeUnitCd = $("#endTimeUnit").val();
		}
		return ooTime;
	};
	
	//设置主销售品生失效时间设置
	var _setMainTime = function(){
		var ooTime = _getTime();
		if(ooTime==undefined){
			return;
		}
		OrderInfo.offerSpec.ooTimes = ooTime;
		$("#mainTime").removeClass("time").addClass("time2");
		easyDialog.close();
	};
	
	//设置附属销售品生失效时间设置
	var _setAttachTime = function(prodId,offerSpecId){
		var ooTime = _getTime();
		if(ooTime==undefined){
			return;
		}
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		spec.ooTimes = ooTime;
		$("#time_"+prodId+"_"+offerSpecId).removeClass("time").addClass("time2");
		easyDialog.close();
	};
	
	//获取下个月第一天
	/*var _getNextMonthFirstDate = function(){
		var d = new Date();
		var yyyy = 1900+d.getYear();    
		var MM = d.getMonth()+1;      
		var dd = "01";   
		if(MM==12){
			yyyy++;
			MM = "01";	
		}else if(MM<9){
			MM++;
			MM = "0"+MM;
		}else {
			MM++;
		}
		return yyyy+"-"+MM+"-"+dd; 
	};*/
	
	//是否显示uim卡
	var _isCheckUim = function(prodId){
		if($("#checkbox_"+prodId).attr("checked")){
			AttachOffer.isChangeUim = 1;
			$("#uimDiv_"+prodId).show();
		}else{
			AttachOffer.isChangeUim = 0;
			$("#uimDiv_"+prodId).hide();
		}
	};
	
	//切换标签
	var _changeLabel = function(prodId,prodSpecId,labelId){
		$.each(AttachOffer.labelList,function(){ //附属标签显示隐藏
			if(this.prodId==prodId){
				$.each(this.labels,function(){
					if(labelId==""){
						labelId = this.label;
						$("#tab_"+prodId+"_"+this.label).addClass("setcon");
					}else{
						if(labelId == this.label){
							$("#tab_"+prodId+"_"+this.label).addClass("setcon");
							$("#ul_"+prodId+"_"+this.label).show();
						}else{
							$("#tab_"+prodId+"_"+this.label).removeClass("setcon");
							$("#ul_"+prodId+"_"+this.label).hide();
						}
					}
				});
			}
		});
		var $ul = $("#ul_"+prodId+"_"+labelId); //创建ul
		if($ul[0]==undefined){ //没有加载过，重新加载  
			var queryType = "3";
			if(prodId>0){
				queryType = "";
			}
			if(labelId==CONST.LABEL.SERV){  //功能产品
				var param = {
					prodId : prodId,
					prodSpecId : prodSpecId,
					queryType : queryType,
					labelId : labelId
				};
				var data = query.offer.queryCanBuyServ(param);
				var $ul = $('<ul id="ul_'+prodId+'_'+labelId+'"></ul>');
				if(data!=undefined && data.resultCode == "0"){
					if(isArray(data.result.servSpec)){
						var servList = CacheData.getServList(prodId);//过滤已订购
						var servSpecList = CacheData.getServSpecList(prodId);//过滤已选择
						$.each(data.result.servSpec,function(){
							var servSpecId = this.servSpecId;
							var flag = true;
							$.each(servList,function(){
								if(this.servSpecId==servSpecId&&this.isDel!="C"){
									flag = false;
									return false;
								}
							});
							$.each(servSpecList,function(){
								if(this.servSpecId==servSpecId){
									flag = false;
									return false;
								}
							});
							if(flag){
								var $li = $('<li id="li_'+prodId+'_'+this.servSpecId+'"></li>');
								var $dd = $('<dd class="canchoose" onclick="AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\')"></dd>');
								var $span = $('<span><a href="javascript:AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\')">'+this.servSpecName+'</a></span>');
								$li.append($dd).append($span).appendTo($ul);
							}
						});
					}
				}
				$("#div_"+prodId).append($ul);
			}else{
				var param = {
					prodSpecId : prodSpecId,
					offerSpecIds : [],
					queryType : queryType,
					prodId : prodId,
					partyId : OrderInfo.cust.custId,
					labelId : labelId,
					ifCommonUse : ""			
				};
				if(OrderInfo.actionFlag == 2){ //套餐变更		
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历主销售品构成
						if(this.objInstId==prodId){
							param.acctNbr = this.accessNumber;
							param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);	
							return false;
						}
					});
				}else if(OrderInfo.actionFlag == 3){  //可选包
					var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
					param.acctNbr = prodInfo.accNbr;
					if(!isObj(prodInfo.prodOfferId)){
						prodInfo.prodOfferId = "";
					}
					param.offerSpecIds.push(prodInfo.prodOfferId);
				}else { //新装
					param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
				}
				query.offer.queryCanBuyAttachSpec(param,function(data){
					var $ul = $('<ul id="ul_'+prodId+'_'+labelId+'"></ul>');
					if(data!=undefined && data.resultCode == "0"){
						if(isArray(data.result.offerSpecList)){
							var offerList = CacheData.getOfferList(prodId); //过滤已订购
							var offerSpecList = CacheData.getOfferSpecList(prodId);//过滤已选择
							$.each(data.result.offerSpecList,function(){
								var offerSpecId = this.offerSpecId;
								var flag = true;
								$.each(offerList,function(){
									if(this.offerSpecId==offerSpecId&&this.isDel!="C"){
										flag = false;
										return false;
									}
								});
								$.each(offerSpecList,function(){
									if(this.offerSpecId==offerSpecId){
										flag = false;
										return false;
									}
								});
								if(flag){
									var $li = $('<li id="li_'+prodId+'_'+this.offerSpecId+'"></li>');
									var $dd = $('<dd class="canchoose" onclick="AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')"></dd>');
									var $span = $('<span><a href="javascript:AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')" >'+this.offerSpecName+'</a></span>');
									$li.append($dd).append($span).appendTo($ul);
								}
							});
						}
					}
					$("#div_"+prodId).append($ul);
				});
			}
		}
	};
	
	//开通跟取消开通功能产品时判断是否显示跟隐藏补换卡
	var showHideUim = function(flag,prodId,servSpecId){
		if(flag==0){ //开通功能产品
			if(OrderInfo.actionFlag==3 && order.prodModify.choosedProdInfo.prodClass==CONST.PROD_CLASS.THREE
					&& servSpecId == CONST.PROD_SPEC.PROD_FUN_4G && AttachOffer.isChangeUim==0 && CONST.getAppDesc()==0){ //显示补卡
				$("#uimDiv_"+prodId).show();
				AttachOffer.isChangeUim = 1;
			}
		}else if(flag==1){//取消开通功能产品
			if(OrderInfo.actionFlag==3 && order.prodModify.choosedProdInfo.prodClass==CONST.PROD_CLASS.THREE
					&& servSpecId==CONST.PROD_SPEC.PROD_FUN_4G && AttachOffer.isChangeUim==1&&CONST.getAppDesc()==0){ //已经显示补卡,判断是否隐藏补卡
				var specList = CacheData.getServSpecList(prodId);
				var flag = true;
				if(specList!=undefined){
					$.each(specList,function(){
						if(this.servSpecId ==CONST.PROD_SPEC.PROD_FUN_4G && this.servSpecId !=servSpecId && this.isdel !="Y" && this.isdel !="C"){
							flag = false ;
							return false;	
						} 
					});
				}
				if(flag==true){
					$("#uimDiv_"+prodId).hide();
					AttachOffer.isChangeUim = 0;
				}
			}
		}
	};
	
	//获取附属销售品节点
	var _setAttachBusiOrder = function(busiOrders){
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C"){  //订购的附属销售品
					SoOrder.createAttOffer(spec,open.prodId,0,busiOrders);
				}
			}
		}
		//遍历已订购附属销售品列表
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			for ( var j = 0; j < opened.offerList.length; j++) {  //遍历当前产品下面的附属销售品
				var offer = opened.offerList[j];
				if(offer.isdel == "Y"){  //退订的附属销售品
					SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
				}else {
					if(offer.update=="Y"){  //修改附属销售品
						SoOrder.createAttOffer(offer,opened.prodId,2,busiOrders);
					}
				}
			}
		}
		//遍历已选功能产品列表
		$.each(AttachOffer.openServList,function(){
			var prodId = this.prodId;
			$.each(this.servSpecList,function(){
				if(this.isdel != "Y" && this.isdel != "C" && this.isdel != "P"){  //订购的功能产品  && _getRelaType(this.servSpecId)!="1000"
					SoOrder.createServ(this,prodId,0,busiOrders);
				}
			});
		});
		//遍历已订购功能产品列表
		$.each(AttachOffer.openedServList,function(){
			var prodId = this.prodId;
			$.each(this.servList,function(){
				if(this.isdel == "Y"){  //关闭功能产品
					SoOrder.createServ(this,prodId,1,busiOrders);
				}else {
					if(this.update=="Y"){  //变更功能产品
						SoOrder.createServ(this,prodId,2,busiOrders);
					}
				}
			});
		});
		//遍历已选增值业务
		$.each(AttachOffer.openAppList,function(){
			var prodId = this.prodId;
			$.each(this.appList,function(){
				if(this.dfQty==1){  //开通增值业务
					SoOrder.createServ(this,prodId,0,busiOrders);
				}
			});
		});
	};
	
	//判断是否是空对象
	var isObj = function(obj){
		var flag = false;
		if(obj!=undefined && $.trim(obj)!="" && obj!=null){
			flag = true;
		}
		return flag;
	};
	
	//判断是否是空数组
	var isArray = function(obj){
		if(!!obj && obj.length>0){
			return true;
		}else{
			return false;
		}
	};
	
	return {
		addOffer 				: _addOffer,
		addOfferSpec 			: _addOfferSpec,
		addOpenList				: _addOpenList,
		addOpenServList			: _addOpenServList,
		addOfferSpecByCheck		: _addOfferSpecByCheck,
		closeAttachSearch 		: _closeAttachSearch,
		changeLabel				: _changeLabel,
		closeServ				: _closeServ,
		closeServSpec			: _closeServSpec,
		delOffer				: _delOffer,
		delOfferSpec			: _delOfferSpec,
		labelList				: _labelList,
		isChangeUim				: _isChangeUim,
		isCheckUim				: _isCheckUim,
		init					: _init,
		openList				: _openList,
		openedList				: _openedList,
		openServList			: _openServList,
		openedServList 			: _openedServList,
		openServSpec			: _openServSpec,
		openAppList				: _openAppList,
		queryAttachOffer 		: _queryAttachOffer,
		queryAttachOfferSpec 	: _queryAttachOfferSpec,
		showParam 				: _showParam,
		showServParam			: _showServParam,
		showTime				: _showTime,
		setAttachTime			: _setAttachTime,
		searchAttachOfferSpec   : _searchAttachOfferSpec,
		selectAttachOffer		: _selectAttachOffer,
		showOfferTime			: _showOfferTime,
		showMainParam			: _showMainParam,
		showMainMember			: _showMainMember,
		selectServ				: _selectServ,
		showStartTime			: _showStartTime,
		showEndTime			    : _showEndTime,
		setAttachBusiOrder		: _setAttachBusiOrder,
		showApp					: _showApp,
		showMainRoleProd		: _showMainRoleProd,
		checkTerminalCode		: _checkTerminalCode
	};
})();
/**
 * 销售品变更
 * 
 * @author wukf
 * date 2013-9-22
 */
CommonUtils.regNamespace("offerChange");

offerChange = (function() {
	
	var _resultOffer = {}; //预校验单接口返回
	
	//初始化套餐变更页面
	var _init = function (){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 2;
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		},{
			boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		}];
		if(!rule.rule.ruleCheck(boInfos)){ //规则校验失败
			return;
		}
		//初始化套餐查询页面
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsHtmlGet(contextPath+"/order/prodoffer/prepare",{});	
		$.unecOverlay();
		if(response.code != 0) {
			$.alert("提示","查询失败,稍后重试");
			return;
		}
		SoOrder.step(0,response.data); //订单准备
		$('#search').bind('click',function(){
			order.service.searchPack();
		});
		order.prodOffer.init();
		order.service.searchPack(); //查询可以变更套餐
	};
		
	//套餐变更页面显示
	var _offerChangeView=function(){
		var oldLen = 0 ;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==2){
				oldLen++;
			}
		});
		var memberNum = 1; //判断是否多成员 1 单成员2多成员
		var viceNum = 0;
		if(oldLen>1){ //多成员角色，目前只支持主副卡
			var flag = true;
			$.each(OrderInfo.offer.offerMemberInfos,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){ //接入产品
					if(this.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){ //主卡
						flag = false;
					}else if(this.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
						viceNum++;
					}else{
						flag = true;
						return false;
					}
				}
			});
			if(flag){
				$.alert("错误提示","目前只支持单产品或者集团集约化主副卡的套餐变更");	
				return;
			}
			memberNum = 2;
		}
		//把旧套餐的产品自动匹配到新套餐中
		if(!_setChangeOfferSpec(memberNum,viceNum)){  
			return;
		};
		//4g系统需要
		if(CONST.getAppDesc()==0){ 
			if(order.prodModify.choosedProdInfo.is3G== "Y"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			if(!prod.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
				return ;
			}
		}
		//初始化填单页面
		var prodInfo = order.prodModify.choosedProdInfo;
		var param = {
			boActionTypeCd : "S2" ,
			boActionTypeName : "套餐变更",
			actionFlag :"2",
			offerSpec : OrderInfo.offerSpec,
			prodId : prodInfo.prodInstId,
			offerMembers : OrderInfo.offer.offerMemberInfos,
			oldOfferSpecName : prodInfo.prodOfferName,
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc()
		};
		order.main.buildMainView(param);
	};
	
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		order.prepare.showOrderTitle(OrderInfo.actionTypeName, order.prodModify.choosedProdInfo.accNbr, false);
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_fill_content").html(response.data);
		$("#fillNextStep").off("click").on("click",function(){
			SoOrder.submitOrder();
		});
		$("#fillLastStep").off("click").on("click",function(){
			order.main.lastStep();
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		//遍历主销售品构成
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.prodInsts!=undefined && this.prodInsts.length>0){
				$.each(this.prodInsts,function(){
					var prodId = this.prodInstId;
					var param = {
						areaId : OrderInfo.getProdAreaId(prodId),
						channelId : OrderInfo.staff.channelId,
						staffId : OrderInfo.staff.staffId,
					    prodId : prodId,
					    prodSpecId : this.objId,
					    offerSpecId : prodInfo.prodOfferId,
					    acctNbr : this.accessNumber
					};
					var res = query.offer.queryChangeAttachOffer(param);
					$("#attach_"+prodId).html(res);	
					AttachOffer.showMainRoleProd(prodId); //显示新套餐构成
					AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
				});
			}
		});
		order.dealer.initDealer(); //初始化发展人
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y"){ //3G转4G需要校验
			offerChange.checkOfferProd();
		}
	};
	
	//套餐变更提交组织报文
	var _changeOffer = function(busiOrders){
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
		AttachOffer.setAttachBusiOrder(busiOrders);  //订购退订附属销售品
		if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
			if(!!OrderInfo.offer.offerMemberInfos){ //遍历主销售品构成
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
						if(OrderInfo.boProd2Tds.length>0){
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
	};
			
	//创建退订主销售品节点
	var _createDelOffer = function(busiOrders,offer){	
		offer.offerTypeCd = 1;
		offer.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		var prodInfo = order.prodModify.choosedProdInfo;
		OrderInfo.getOfferBusiOrder(busiOrders,offer, prodInfo.prodInstId);
	};
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders,offer) {
		var prod = order.prodModify.choosedProdInfo;
		var offerSpec = OrderInfo.offerSpec;
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				objId : offerSpec.offerSpecId,  //业务规格ID
				offerTypeCd : "1", //1主销售品
				accessNumber : prod.accNbr  //接入号码
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
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.prodInsts!=undefined){
				$.each(this.prodInsts,function(){
					var ooRoles = {
						objId : this.objId, //业务规格ID
						objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
						objType : this.objType, // 业务对象类型
						offerRoleId : offerRole.offerRoleId, //销售品角色ID
						state : "ADD" //动作
					};
					busiOrder.data.ooRoles.push(ooRoles);
				});
			}
		});
		
		//订单属性
		var remark = $('#order_remark').val(); 
		if(remark!=""&&remark!=undefined){
			busiOrder.data.busiOrderAttrs = [];
			busiOrder.data.busiOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});	
		}

		//销售参数节点
		if(offerSpec.offerSpecParams!=undefined && offerSpec.offerSpecParams.length>0){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
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
		if(offerSpec.ooTimes !=undefined ){
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(offerSpec.ooTimes);
		}
		busiOrders.push(busiOrder);
	};
	
	//填单页面切换
	var _changeTab = function(prodId) {
		$.each($("#tab_"+prodId).parent().find("li"),function(){
			$(this).removeClass("setcon");
			$("#attach_tab_"+$(this).attr("prodId")).hide();
			$("#uimDiv_"+$(this).attr("prodId")).hide();
		});
		$("#tab_"+prodId).addClass("setcon");
		$("#attach_tab_"+prodId).show();
		$("#uimDiv_"+prodId).show();
	};
	
	//省里校验单
	var _checkOrder = function(prodId){
		_getChangeInfo();
		var data = query.offer.updateCheckByChange(JSON.stringify(OrderInfo.orderData));
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = []; //校验完清空	
		if(data==undefined){
			return false;
		}
		if(data.result!=undefined){
			offerChange.resultOffer = data.result;
		}else {
			offerChange.resultOffer = {}; 
		}
		return true;
	};
	
	//把旧套餐的产品自动匹配到新套餐中，由于现在暂时只支持主副卡跟单产品，所以可以自动匹配
	var _setChangeOfferSpec = function(memberNum,viceNum){
		if(memberNum==1){ //单产品变更
			var offerRole = getOfferRole();
			if(offerRole==undefined){
				alert("错误提示","无法变更到该套餐");
				return false;
			}
			offerRole.prodInsts = [];
			$.each(offerRole.roleObjs,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){
					var roleObj = this;
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							roleObj.prodInstId = this.objInstId;
							roleObj.accessNumber = this.accessNumber;
							offerRole.prodInsts.push(roleObj);
						}
					});
				}
			});
		}else{  //主副卡
			var flag = true;
			for (var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){ //判断是否有主卡
					flag = false;
				}else if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //判断副卡数量
					for (var j = 0; j < offerRole.roleObjs.length; j++) {
						var roleObj = offerRole.roleObjs[j];
						if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							if(roleObj.maxQty<viceNum){ //新套餐副卡最大值小于旧套餐
								$.alert("信息提示","新套餐最多可以办理副卡数量为"+roleObj.maxQty+",旧套餐为"+viceNum+"需要拆副卡");
								return false;
							}
						}
					}
				}
			}
			if(flag){
				$.alert("信息提示","旧套餐是多成员主副卡套餐，新套餐不是主副卡套餐，不能变更");
				return false;
			}else{
				$.each(OrderInfo.offerSpec.offerRoles,function(){
					var offerRole = this;
					offerRole.prodInsts = [];
					$.each(this.roleObjs,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD){
							var newObject = jQuery.extend(true, {}, this); 
							$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
								if(offerRole.memberRoleCd == this.roleCd && this.objType==CONST.OBJ_TYPE.PROD){
									newObject.prodInstId = this.objInstId;
									newObject.accessNumber = this.accessNumber;
									offerRole.prodInsts.push(newObject);
								}
							});
						}
					});
				});
			}
		}
		return true;
	};
	
	//获取单产品变更自动匹配的角色
	var getOfferRole = function(){
		//新套餐是主副卡,获取主卡角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){  //主卡
				return offerRole;
			}
		}
		//新套餐不是主副卡，返回第一个包含接入产品的角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			for (var j = 0; j < offerRole.roleObjs.length; j++) {
				var roleObj = offerRole.roleObjs[j];
				if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					return offerRole;
				}
			}
		}
	};
	
	//获取套餐变更节点
	var _getChangeInfo = function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
	};
	
	//根据省内返回的数据校验
	var _checkOfferProd = function(){
		if(offerChange.resultOffer==undefined){
			return;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(prodInfos!=undefined && prodInfos.length>0){
			$.each(prodInfos,function(){
				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
				var flag = true;
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				if(prodId!=this.prodInstId){//功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);
					if(this.state=="DEL"){
						if(serv!=undefined){
							var $span = $("#li_"+prodId+"_"+this.prodInstId).find("span");
							$span.addClass("del");
							serv.isdel = "Y";
							$("#del_"+prodId+"_"+this.prodInstId).hide();
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){  //在已开通里面，修改不让关闭
							$("#del_"+prodId+"_"+this.prodInstId).hide();
						}else{
							var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
							if(servSpec!=undefined){
								$("#del_"+prodId+"_"+this.productId).hide();
							}else {
								if(this.productId!=undefined && this.productId!=""){
									AttachOffer.openServSpec(prodId,this.productId);
								}
							}
						}
					}
				}
			});
		}
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(offers!=undefined && offers.length>0){
			$.each(offers,function(){
				var prodId = 0;
				if(this.memberInfo==undefined){
					return false;
				}
				$.each(this.memberInfo,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD){
						prodId = this.objInstId;
					}
				});
				//容错处理，省份接入产品实例id传错
				var flag = true;
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
				if(this.state=="DEL"){
					if(offer!=undefined){
						var $span = $("#li_"+this.prodId+"_"+this.prodOfferInstId).find("span");
						$span.addClass("del");
						offer.isdel = "Y";
						$("#del_"+this.prodId+"_"+this.prodOfferInstId).hide();
					}	
				}else if(this.state=="ADD"){
					if(offer!=undefined){ //在已开通里面，修改不让关闭
						$("#del_"+this.prodId+"_"+this.prodOfferInstId).hide();
					}else{
						var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已开通里面查找
						if(offerSpec!=undefined){
							$("#del_"+this.prodId+"_"+this.prodOfferId).hide();
						}else {
							if(this.prodOfferId!=undefined && this.prodOfferId!="" && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
								AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
							}
						}
					}
				}
			});
		}
	};
	
	return {
		init 					: _init,
		changeOffer 			: _changeOffer,
		offerChangeView			: _offerChangeView,
		changeTab				: _changeTab,
		checkOrder				: _checkOrder,
		fillOfferChange			: _fillOfferChange,
		resultOffer				: _resultOffer,
		checkOfferProd			: _checkOfferProd,
		getChangeInfo			: _getChangeInfo,
		setChangeOfferSpec		: _setChangeOfferSpec
	};
})();
/**
 * 销售品产品相关查询
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("query","offer");

query.offer = (function() {
	
	/**
	 * 销售品规格构成查询
	 * @param  offerSpecId 销售品规格ID
	 * @param  offerTypeCd 销售品类型,销售品主 1 ,附属2  
	 * @param  mainOfferSpecId  主套餐id
	 * @param  partyId  客户ID
	 * @callBackFun 回调函数
	 */
	var _queryOfferSpec = function(param,callBackFun) {
		var url= contextPath+"/offer/queryOfferSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品规格构成中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data.offerSpec);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品规格构成失败,稍后重试");
					}
				}
			});
		}else{
			$.ecOverlay("<strong>正在查询销售品规格构成中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data.offerSpec;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品规格构成失败,稍后重试");
			}
		}
	};

	/**
	 * 销售品实例构成查询
	 * @param  offerId 销售品实例ID
	 * @param  areaId 地区ID
	 * @param  accessNumber 接入号
	 * @callBackFun 异步调用函数
	 */
	var _queryOfferInst = function(param,callBackFun) {
		var url= contextPath+"/offer/queryOfferInst";
		addParam(param);
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品实例失败,稍后重试");
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品实例失败,稍后重试");
			}
		}
	};
	
	//根据选择产品查询销售品实例，并保存到OrderInfo.offer
	var _setOffer = function() {
		var prod = order.prodModify.choosedProdInfo ; 
		var param = {
			offerId : prod.prodOfferInstId,
			offerSpecId : prod.prodOfferId,
			acctNbr : prod.accNbr,
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),
			distributorId : ""
		};
		var data = query.offer.queryOfferInst(param); //查询销售品实例构成
		if(data&&data.code == CONST.CODE.SUCC_CODE){
			var flag = true;
			if(data.offerMemberInfos!=undefined && data.offerMemberInfos.length>0){
				for ( var i = 0; i < data.offerMemberInfos.length; i++) {
					var member = data.offerMemberInfos[i];
					if(member.objType==""){
						$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
						return false;
					}else if(member.objType==CONST.OBJ_TYPE.PROD){
						/*if(member.objId==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品规格【objId】节点为空，无法继续受理,请营业后台核实");
							return false;
						}*/
						if(member.accessNumber==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
							return false;
						}
					}
					if(member.objInstId==prod.prodInstId){
						flag = false;
					}
				}
				if(flag){
					$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+prod.accNbr+"】，无法继续受理，请业务后台核实");
					return false;
				}
				OrderInfo.offer.offerMemberInfos = data.offerMemberInfos; 
				OrderInfo.offer.offerId = prod.prodOfferInstId;
				OrderInfo.offer.offerSpecId = prod.prodOfferId;
				OrderInfo.offer.offerName = prod.prodOfferName;
				return true;
			}else{//销售品成员实例为空
				$.alert("提示","查询销售品实例构成，没有返回成员实例无法继续受理");
				return false;
			}
		}
	};
	
	//销售品参数查询
	var _queryOfferParam = function(param,callBackFun) {
		var url= contextPath+"/offer/queryOfferParam";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>查询销售品实例参数中，请稍等...</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品实例参数失败,稍后重试");
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询销售品实例参数中，请稍等...</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品实例参数失败,稍后重试");
			}
		}
	};	
	
	/**
	 * 已订购附属查询 
	 */
	var _queryAttachOffer = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryAttachOffer";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else {
						$.alert("提示","附属销售品实例查询失败,稍后重试");
						return;
					}
				}
			});
		}else{
			$.ecOverlay("<strong>查询查询附属销售品实例中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}		
	};
	
	//套餐变更，查询附属销售品页面
	var _queryChangeAttachOffer = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryChangeAttachOffer";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else {
						$.alert("提示","附属销售品实例查询失败,稍后重试");
						return;
					}
				}
			});
		}else{
			$.ecOverlay("<strong>查询附属销售品实例中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else {
				$.alert("提示","查询附属销售品实例失败,稍后重试");
				return;
			}
		}		
	};
	
	//附属销售品规格查询
	var _queryAttachSpec = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryAttachSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询附属销售品中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
						return;
					}else {
						$.alert("提示","附属销售品查询失败,稍后重试");
						return;
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询查询附属销售品中，请稍等...</strong>");
			var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
				return;
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}
	};
	
	//加载附属标签下的附属销售品
	var _queryCanBuyAttachSpec = function(param,callBackFun) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryCanBuyAttachSpec";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)},{
				"before":function(){
					$.ecOverlay("<strong>正在查询附属销售品中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
						return;
					}else {
						$.alert("提示","附属销售品查询失败,稍后重试");
						return;
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>查询附属销售品中，请稍等...</strong>");
			var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
				return;
			}else {
				$.alert("提示","查询附属销售品失败,稍后重试");
				return;
			}
		}
	};
	
	// 加载可订购功能产品
	var _queryCanBuyServ = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryCanBuyServ";
		$.ecOverlay("<strong>查询可订购功能产品中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","可订购功能产品失败,稍后重试");
			return;
		}
	};
	
	//销售品互斥依赖查询
	var _queryExcludeDepend = function(param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryExcludeDepend";
		$.ecOverlay("<strong>规则校验中,请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","数据查询异常，请稍后重试！");
		}
	};
		
	//功能产品互斥依赖查询
	var _queryServExcludeDepend = function(param){
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/queryServExcludeDepend";
		$.ecOverlay("<strong>规则校验中,请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,{strParam:JSON.stringify(param)});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","数据查询异常，请稍后重试！");
		}
	};
	
	//查询附属销售品规格
	var _searchAttachOfferSpec = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/offer/searchAttachOfferSpec";
		$.ecOverlay("<strong>附属销售品查询中，请稍等...</strong>");
		var response = $.callServiceAsHtmlGet(url,{strParam:JSON.stringify(param)});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","查询附属销售失败，请稍后重试！");
		}
	};
	
	//受理权限查询
	var _checkOperate = function(param) {
		var url = contextPath+"/order/checkOperate";
		$.ecOverlay("<strong>受理权限查询中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,"");
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","受理权限查询失败，请稍后重试！");
		}
	};
	
	//订单提交
	var _orderSubmit = function(param) {
		var url = contextPath+"/order/orderSubmit";
		if(OrderInfo.order.token!=""){
			url = contextPath+"/order/orderSubmit?token="+OrderInfo.order.token;
		}
		$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
		var response = $.callServiceAsHtml(url,param);
		$.unecOverlay();
		if(!response || response.code != 0){
			 return;
		}
		return response.data;
	};
	
	//订单提交（一次性）
	var _orderSubmitComplete = function(param) {
		var url = contextPath+"/order/orderSubmitComplete";
		if(OrderInfo.order.token!=""){
			url = contextPath+"/order/orderSubmitComplete?token="+OrderInfo.order.token;
		}
		$.ecOverlay("<strong>订单提交中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if(!response || response.code != 0){
			 return;
		}
		return response.data;
	};	
	
	/**
	 * 查询主销售品规格构成
	 * 并对结果进行数据校验
	 */
	var _queryMainOfferSpec = function(param){
		var offerSpec = query.offer.queryOfferSpec(param); //查询主销售品构成
		if(offerSpec ==undefined || offerSpec.offerRoles ==undefined){
			$.alert("提示","返回的销售品规格构成结构不对！");
			return false;
		}
		if(offerSpec.offerSpecId==undefined || offerSpec.offerSpecId==""){
			$.alert("提示","销售品规格ID未返回，无法继续受理！");
			return false;
		}
		if(offerSpec.offerRoles.length == 0){
			$.alert("提示","套餐角色为空，你重新选择！");
			return false;
		}
		if(offerSpec.feeType ==undefined || offerSpec.feeType=="" || offerSpec.feeType=="null"){
			$.alert("提示","无付费类型，无法新装！");
			return false;
		}
		offerSpec = SoOrder.sortOfferSpec(offerSpec); //排序主副卡套餐	
		OrderInfo.offerSpec = offerSpec;
		return offerSpec;
	};
	
	/**
	 * 同步查询销售品规格构成
	 * 并对结果进行数据校验
	 */
	var _queryAttachOfferSpec = function(offerSpecId){
		var param = {
			offerSpecId:offerSpecId,
			partyId : OrderInfo.cust.custId,
			offerTypeCd:2	
		};	
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){//新装业务,添加主套餐id用于查询终端
			param.mainOfferSpecId = OrderInfo.offerSpec.offerSpecId;
		}
		var offerSpec = query.offer.queryOfferSpec(param); //查询主销售品构成
		if(offerSpec ==undefined || offerSpec.offerRoles ==undefined){
			$.alert("提示","返回的销售品规格构成结构不对！");
			return false;
		}
		if(offerSpec.offerSpecId==undefined || offerSpec.offerSpecId==""){
			$.alert("提示","销售品规格ID未返回，继续受理将出现异常！");
			return false;
		}
		if(offerSpec.offerSpecName==undefined || offerSpec.offerSpecName==""){
			$.alert("提示","销售品规格名称未返回，继续受理将出现异常！");
			return false;
		}
		return offerSpec;
	};
	
	//预校验
	var _updateCheckByChange = function(param){
		var url = contextPath+"/order/prodModify/updateCheckByChange";
		$.ecOverlay("<strong>正在预校验中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			return response.data;
		}else if (response.code == -2) {
			$.alertM(response.data);
		}else{
			$.alert("提示","预校验失败!失败原因为："+response.data);
		}
	};
	
	/**
	 * 加载实例
	 * 如果传入了paramInfo，则使用它，否则拼入参
	 */
	var _loadInst = function(){
		OrderInfo.order.soNbr = UUID.getDataId();
		if(CONST.getAppDesc()!=0){ //不是4g不需要加载
			return true;
		}
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14 
				|| OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 
				|| OrderInfo.actionFlag==18){ //新装不要加载实例
			return true;
		}
		if (order.prodModify == undefined) { // 如果没有引入orderProdModify.js
			$.alert("提示","未获取到产品相关信息，无法办理二次业务！");
			return false;
		}
		var prod = order.prodModify.choosedProdInfo;
		
		if(prod==undefined || prod.prodInstId ==undefined){
			$.alert("提示","未获取到产品相关信息，无法办理二次业务！");
			return false;
		}
		
		var param = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),
			acctNbr : prod.accNbr,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			instId : prod.prodInstId,
			type : "2"
		};
		if(OrderInfo.offer.offerMemberInfos!=undefined && OrderInfo.offer.offerMemberInfos.length>0){ //遍历主销售品构成
			var flag = true;
			var row = 0 ;
			$.each(OrderInfo.offer.offerMemberInfos,function(){
				if(this.objType == CONST.OBJ_TYPE.PROD){
					row ++ ;
					param.acctNbr = this.accessNumber;
					param.instId = this.objInstId;
					if (!query.offer.invokeLoadInst(param)) {
						flag = false;
						return false;
					}
				}
			});
			if(row==0){
				return query.offer.invokeLoadInst(param);
			}
			return flag;
		}else{
			return query.offer.invokeLoadInst(param);
		}
	};
	
	//补充查询基本条件
	var addParam = function(param){
		param.staffId = OrderInfo.staff.staffId;
		param.channelId = OrderInfo.staff.channelId;
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		param.partyId = OrderInfo.cust.custId;
		param.distributorId = OrderInfo.staff.distributorId;
		if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
	};
	
	var _invokeLoadInst = function(param) {
		var url = contextPath+"/offer/loadInst";
		$.ecOverlay("<strong>全量信息加载中，请稍等...</strong>");
		var response = $.callServiceAsJsonGet(url,param);
		$.unecOverlay();
		if (response.code== 0) {
			return true;
		}else if(response.code==-2){
			$.alertM(response.data);
			return false;
		}else {
			if (response.msg == undefined) {
				$.alert("提示", "全量信息查询失败");
			} else {				
				$.alert("提示",response.msg);
			}
			return false;
		}
	};
	
	return {
		queryOfferSpec			: _queryOfferSpec,
		queryOfferInst 			: _queryOfferInst,
		queryOfferParam 		: _queryOfferParam,
		queryAttachOffer		: _queryAttachOffer,
		queryChangeAttachOffer  : _queryChangeAttachOffer,
		orderSubmit				: _orderSubmit,
		orderSubmitComplete		: _orderSubmitComplete,
		queryAttachSpec			: _queryAttachSpec,
		setOffer				: _setOffer,
		loadInst				: _loadInst,
		invokeLoadInst			: _invokeLoadInst,
		queryCanBuyAttachSpec 	: _queryCanBuyAttachSpec,
		queryCanBuyServ			: _queryCanBuyServ,
		queryExcludeDepend		: _queryExcludeDepend,
		queryServExcludeDepend	: _queryServExcludeDepend,
		searchAttachOfferSpec	: _searchAttachOfferSpec,
		queryMainOfferSpec		: _queryMainOfferSpec,
		queryAttachOfferSpec	: _queryAttachOfferSpec,
		checkOperate			: _checkOperate,
		updateCheckByChange		: _updateCheckByChange
	};
})();
/**
 * 订单信息对象
 * 
 * @author wukf
 */
CommonUtils.regNamespace("OrderInfo");

/** 订单信息对象*/
OrderInfo = (function() {
	
	/*
	 * 每个功能点标识，0是产品变更等单业务动作订单提交，1新装，2变更,3可选包变更,4客户资料变更 5.拆副卡
	 * 
	 * 6 销售品成员变更加装副卡，7 拆主卡保留副卡 8单独新建客户,10 是公用节点传入 11 撤单，12 加入退出组合 
	 * 
	 * 13 购买裸机  14 合约套餐  15 补退费  16 改号	17 终端退货 18 终端换货 19返销 20返销,22补换卡,31改产品密码，32重置产品密码，,33改产品属性，34修改短号，
	 * 
	 */
	var _actionFlag = 0;

	var _cust = { //保存客户信息
		custId : "",
		partyName : ""
	}; 
	
	var _staff = { //员工登陆信息
		staffId : 0,  //员工id
		channelId : 0,   //受理渠道id
		channelName: "",
		areaId : 0,    //受理地区id
		areaCode : 0,
		distributorId : "" //转售商标识
	}; 
		
	var _offerSpec = {}; //主销售品构成
	
	var _offer = { //主销售品实例构成
		offerId : "",
		offerSpecId : "",
		offerMemberInfos : []
	}; 
	
	var _offerProdInst = { //主销售品实例构成查副卡信息
		offerId : "",
		offerSpecId : "",
		offerMemberInfos : []
	}; 
	
	var _actionClassCd = 0; //业务动作大类,订单初始化时赋值
	
	var _boActionTypeCd = ""; //业务动作小类,订单初始化时赋值
	
	var _actionTypeName = "订购"; //业务动作名称
	
	var _businessName = ""; //业务名称
	
	var _confirmList = []; //保存特殊业务，确认页面展示使用
	
	var _orderResult = {};  //订单提交，返回结果报存

	var _orderData = {}; //订单提交完整节点
	
	var _order = {  //订单常用全局变量
		dealerType : "",   //保存发展人类型
		soNbr : "", //购物车流水
		oldSoNbr : "", //撤单时用于保存选中某个订单的购物车流水
		oldSoId : "",//撤单时用于保存选中某个订单的购物车ID
		step : 0 , //页面步骤
		token : "", // 防止订单重复提交
		templateType : 1,   //模板类型: 0批量开活卡,1批量新装 ,2批量订购/退订附属, 3组合产品纳入退出 ,4批量修改产品属性,5批量换挡 ,8拆机 ,9批量修改发展人
		dealerTypeList : [] ////发展人类型列表
	};
	
	//权限控制
	var  _privilege = {
		effTime : ""
	};
	
	//序列号
	var _SEQ = {
		seq : -1,  //序列号，来区分每个业务对象动作,每次减1
		offerSeq : -1,  //序列号，用来实例化每个是销售品,每次减1
		prodSeq : -1,  //序列号，用来实例化每个是产品,每次减1
		servSeq : -1,  //序列号，用来实例化每个是服务,每次减1
		itemSeq : -1,  //序列号，用来实例化每个是产品属性,每次减1
		acctSeq : -1,  //序列号，用来实例化每个是帐户,每次减1
		acctCdSeq : -1,  //序列号，用来实例化每个是帐户合同号,每次减1
		paramSeq : -1,  //序列号，用来实例化每个附属销售品参数的每个值,每次减1
		atomActionSeq : -1,  //序列号，用来实例化每个原子动作的每个值,每次减1
		offerMemberSeq : -1, //序列号，用来实例化每个角色成员的每个值,每次减1
		dealerSeq : 1   //协销人序列号，
	};
	
	var _boCusts = []; //客户信息节点

	var _boProdItems = []; //产品属性节点列表
		
	var _boProdPasswords = []; //产品密码节点列表

	var _boProdAns = []; //号码信息节点列表
	
	var _boProd2Tds = []; //UIM卡节点信息列表
	
	var _boProd2OldTds = []; //保存旧UIM卡节点信息列表
	
	var _bo2Coupons = []; //物品信息节点
	
	var _attach2Coupons = []; //附属销售品需要的物品信息
	
	//创建一个订单完整节点
	var _getOrderData = function(){
		//订单提交完整节点
		var data = { 
			orderList : {
				orderListInfo : { 
					isTemplateOrder : "N",   //是否批量
					templateType : OrderInfo.order.templateType,  //模板类型: 1 新装；8 拆机；2 订购附属；3 组合产品纳入/退出
					staffId : OrderInfo.staff.staffId,
					channelId : OrderInfo.staff.channelId,  //受理渠道id
					areaId : OrderInfo.staff.areaId,
					partyId : -1,  //新装默认-1
					distributorId : OrderInfo.staff.distributorId, //转售商标识
					olTypeCd : CONST.OL_TYPE_CD.FOUR_G  //4g标识
				},
				custOrderList :[{busiOrder : []}]   //客户订购列表节点
			}
		};
		OrderInfo.orderData = data;
		return OrderInfo.orderData;
	};		
		
	//创建客户节点
	var _createCust = function(busiOrders) {
		var busiOrder = {
			areaId : OrderInfo.staff.areaId,  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : -1 //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.CUST_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.CUST_CREATE
			}, 
			data:{
				boCustInfos : [],
				boCustIdentities : [],
				boPartyContactInfo : []
			}
		};
		busiOrder.data.boCustInfos.push(OrderInfo.boCustInfos);
		busiOrder.data.boCustIdentities.push(OrderInfo.boCustIdentities);
		if($("#tabProfile0").attr("click")=="0"&&($("#contactName").val()!="")){
			busiOrder.data.boPartyContactInfo.push(OrderInfo.boPartyContactInfo);
		}
		
		if(OrderInfo.boCustProfiles!=undefined && OrderInfo.boCustProfiles!=""){
			busiOrder.data.boCustProfiles = [];
			busiOrder.data.boCustProfiles = OrderInfo.boCustProfiles;
		}
		busiOrders.push(busiOrder);
	};
	
	//创建帐户节点
	var _createAcct = function(busiOrders,acctId) {
		var acctName = $("#acctName").val();
		var paymentType = $("#paymentType").val();  //100000现金，110000银行
		var bankId = "";
		var bankAcct = "";
		var paymentMan = "";
		if(paymentType==110000){ //银行
			bankId = $("#bankId").val(); //银行ID
			bankAcct = $("#bankAcct").val(); //银行帐号
			paymentMan = $("#paymentMan").val(); //支付人
		}
		
		var busiOrder = {
			areaId : OrderInfo.staff.areaId,  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq-- 
			}, 
			busiObj : { //业务对象节点
				instId : acctId //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.ACCT_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.ACCT_CREATE
			}, 
			data : {
				boAccountInfos : [{  //帐户节点
					partyId : OrderInfo.cust.custId, //客户ID
					acctName : acctName, //帐户名称
					acctCd : acctId, //帐户CD
					acctId : acctId, //帐户ID
					businessPassword : "111111", //业务密码
					state : "ADD", //动作
					acctTypeCd : "1" // 默认1
				}],
				boPaymentAccounts : [{ //帐户托收节点
					paymentAcctTypeCd : paymentType, //类型
					bankId : bankId, //银行ID
					bankAcct : bankAcct, //银行帐户ID
					paymentMan : paymentMan, //付费人
					limitQty : "1", //数量
					state : "ADD" //动作
				}],
				boAcct2PaymentAccts : [{ //帐户付费关联关系节点
					priority : "1", //优先级
					state : "ADD" //动作
				}],
				boAccountItems : [],
				boAccountMailings : [] //账单投递信息节点	
			}
		};
		if($("#postType").val()!=-1){
			var boAccountMailing = {
					mailingType : $("#postType").val(),   //*投递方式
					param1 : $("#postAddress").val(),     //*投递地址
					param2 : "1",                         //格式ID
					param3 : $("#postCycle").val(),       //*投递周期
					param7 : $("#billContent").val(),     //*账单内容
					state : "ADD"
			};
			if($("#postType").val()==11 || $("#postType").val()==15){				
				boAccountMailing.param1 = $("#postAddress").val()+","+$("#zipCode").val()+" , "+$("#consignee").val(); //*收件地址,邮编,收件人			
			}
			busiOrder.data.boAccountMailings.push(boAccountMailing);
		}
		busiOrders.push(busiOrder);
	};
	
	/**
	 * 获取销售品节点
	 * busiOrders 业务对象节点
	 * offer 销售品节点
	 * prodId 产品id
	 */
	var _getOfferBusiOrder = function (busiOrders,offer,prodId){
		var accNbr = _getAccessNumber(prodId);
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prodId),  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq-- 
			}, 
			busiObj : { //业务对象节点
				objId : offer.offerSpecId,  //业务规格ID
				instId : offer.offerId,  //业务对象实例ID
				offerTypeCd : offer.offerTypeCd //2附属销售品
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : offer.boActionTypeCd
			}, 
			data:{}
		};
		
		if(isObj(offer.offerSpecName)){ //销售品名称
			busiOrder.busiObj.objName = offer.offerSpecName;
		}
		if(isObj(accNbr)){ //接入号
			busiOrder.busiObj.accessNumber = accNbr;
		}
		
		//订单属性--新需求现在这样写死
		var remark = $('#order_remark').val(); 
		if(remark!=""&&remark!=undefined){
			busiOrder.data.busiOrderAttrs = [];
			busiOrder.data.busiOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});	
		}
		
		if(offer.boActionTypeCd == CONST.BO_ACTION_TYPE.BUY_OFFER){ //订购销售品
			//发展人
			var $tr = $("tr[name='tr_"+prodId+"_"+offer.offerSpecId+"']");
			if($tr!=undefined&&$tr.length>0){
				busiOrder.data.busiOrderAttrs = [];
				$tr.each(function(){   //遍历产品有几个发展人
					var dealer = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("staffid") 
					};
					busiOrder.data.busiOrderAttrs.push(dealer);
				});
			}
			//所属于人节点
			busiOrder.data.ooOwners = [];
			busiOrder.data.ooOwners.push({
				partyId : OrderInfo.cust.custId, //客户对象ID
				state : "ADD" //动作
			});
			//销售参数节点
			if(isArray(offer.offerSpecParams)){  
				busiOrder.data.ooParams = [];
				$.each(offer.offerSpecParams,function(){
					if(isObj(this.setValue)){
						var ooParam = {
			                itemSpecId : this.itemSpecId,
			                offerParamId : OrderInfo.SEQ.paramSeq--,
			                offerSpecParamId : this.offerSpecParamId,
			                value : this.setValue,
			                state : "ADD"
			            };
						 busiOrder.data.ooParams.push(ooParam);
					}
				});		
			}
			
			//销售生失效时间节点
			if(offer.ooTimes !=undefined ){  
				busiOrder.data.ooTimes = [];
				busiOrder.data.ooTimes.push(offer.ooTimes);
			}
			//销售品物品节点
			$.each(OrderInfo.attach2Coupons,function(){
				if(offer.offerSpecId == this.attachSepcId && prodId==this.prodId){
					this.offerId = offer.offerId;
					busiOrder.data.bo2Coupons = [];
					busiOrder.data.bo2Coupons.push(this);
					return false;
				}	
			});
			//销售品成员角色节点
			busiOrder.data.ooRoles = [];
			//var busiOrderServ = {}; //服务参数使用
			//var ifParam = false; //是否有服务参数
			//遍历附属销售品构成
			$.each(offer.offerRoles,function(){
				var offerRole = this;
				$.each(this.roleObjs,function(){
					//if(this.relaTypeCd == CONST.RELA_TYPE_CD.MUST){ //归属关系
						var ooRoles = {
							prodId : prodId, //产品id
							offerRoleId : offerRole.offerRoleId, //销售品角色ID
							objId : this.objId, //规格id
							objType : this.objType, // 业务对象类型
							relaType : this.relaTypeCd,
							state : "ADD" //动作
						};
						if(this.objType == CONST.OBJ_TYPE.PROD){ //产品
							var prodSpecId = OrderInfo.getProdSpecId(prodId);
							if(prodSpecId==this.objId || prodSpecId==""){//兼容省份空规格
								ooRoles.objInstId = prodId;//业务对象实例ID
							}else{
								return true;
							}
						}else if(this.objType == CONST.OBJ_TYPE.SERV){ //服务
							var serv = CacheData.getServBySpecId(prodId,this.objId); //从服务实例中取值
							if(serv!=undefined){
								ooRoles.objInstId = serv.servId;
							}else{
								var servId = OrderInfo.SEQ.servSeq--;
								this.servId = servId;
								this.prodId = prodId;
								ooRoles.objInstId = servId;
								if(isObj(accNbr)){ //接入号
									this.accessNumber = accNbr;
								}
								this.boActionTypeCd = CONST.BO_ACTION_TYPE.SERV_OPEN;
								this.servSpecName = this.objName;
								busiOrders.push(_getProdBusiOrder(this));
								var servSpec = CacheData.getServSpec(prodId,this.objId); //从服务实例中取值
								if(servSpec!=undefined){
									servSpec.isdel = "P"; //销售品构成中的功能产品，不要重新开通
								}
							}
						}else { // 7销售品
							ooRoles.objInstId = OrderInfo.SEQ.offerSeq--;//业务对象实例ID
						}
						busiOrder.data.ooRoles.push(ooRoles);
					//}
				});
			});
			busiOrders.push(busiOrder);
			/*
			for ( var i = 0; i < offer.offerRoles.length; i++) {
				var offerRole = offer.offerRoles[i];
				for ( var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(roleObj.relaTypeCd == CONST.RELA_TYPE_CD.MUST){ //归属关系
						var ooRoles = {
							prodId : prodId, //产品id
							offerRoleId : offerRole.offerRoleId, //销售品角色ID
							objId : roleObj.objId, //规格id
							objType : roleObj.objType, // 业务对象类型
							state : "ADD" //动作
						};
						if(roleObj.objType =="2"){ //产品
							ooRoles.objInstId = prodId;//业务对象实例ID
						}else if(roleObj.objType =="4"){ //服务
							var servId = OrderInfo.SEQ.servSeq--;
							roleObj.servId = servId;
							roleObj.prodId = prodId;
							ooRoles.objInstId = servId;
							if(isObj(accNbr)){ //接入号
								roleObj.accessNumber = accNbr;
							}
							if(isArray(roleObj.prodSpecParams)){  //服务参数节点
								ifParam = true;
								roleObj.boActionTypeCd = CONST.BO_ACTION_TYPE.SERV_OPEN;
								busiOrderServ = _getProdBusiOrder(roleObj);
							}
						}else { // 7销售品
							ooRoles.objInstId = OrderInfo.SEQ.offerSeq--;//业务对象实例ID
						}
						busiOrder.data.ooRoles.push(ooRoles);
					}
				}
			} 
			busiOrders.push(busiOrder);
			if(ifParam){
				busiOrders.push(busiOrderServ);
			}*/
		}else if(offer.boActionTypeCd == CONST.BO_ACTION_TYPE.DEL_OFFER){ //退订销售品
			busiOrder.data.ooOwners = [];
			busiOrder.data.ooOwners.push({
				partyId : OrderInfo.cust.custId, //客户对象ID
				state : "DEL" //动作
			});
			if(isArray(offer.offerMemberInfos)){ //遍历主销售品构成
				busiOrder.data.ooRoles = [];
				$.each(offer.offerMemberInfos,function(){
					//if(this.objType== CONST.OBJ_TYPE.PROD){
						var ooRoles = {
							objId : this.objId, //业务规格ID
							objInstId : this.objInstId, //业务对象实例ID,新装默认-1
							objType : this.objType, // 业务对象类型
							offerRoleId : this.offerRoleId, //销售品角色ID
							state : "DEL" //动作
						};
						if(this.objType != CONST.OBJ_TYPE.PROD){ //不是接入产品
							ooRoles.prodId = prodId;//业务对象实例ID
						}
						if(this.offerMemberId!=undefined){  //兼容两级接口
							ooRoles.offerMemberId = this.offerMemberId; //成员id
						}
						busiOrder.data.ooRoles.push(ooRoles);
					//}
				});
			}
			busiOrders.push(busiOrder);
		}else if(offer.boActionTypeCd == CONST.BO_ACTION_TYPE.UPDATE_OFFER){ //销售品成员变更,改参数
			if(offer.isUpdate=="Y"){ //销售品成员变更
				busiOrder.data.ooRoles = offer.data;
			}else{
				if(isArray(offer.offerSpec.offerSpecParams)){
					busiOrder.data.ooParams = [];
					$.each(offer.offerSpec.offerSpecParams,function(){
						if(this.isUpdate=="Y"){
							if(isObj(this.value)){
								var delParam = {
					                itemSpecId : this.itemSpecId,
					                offerParamId : this.offerParamId,
					                offerSpecParamId : this.offerSpecParamId,
					                value : this.value,
					                state : "DEL"
					            };
								busiOrder.data.ooParams.push(delParam);
							}
							if(isObj(this.setValue)){
								var addParam = {
					                itemSpecId : this.itemSpecId,
					                offerParamId : OrderInfo.SEQ.paramSeq--,
					                offerSpecParamId : this.offerSpecParamId,
					                value : this.setValue,
					                state : "ADD"
					            };
					            busiOrder.data.ooParams.push(addParam);
							}
						}
					});	
				}
			}
			busiOrders.push(busiOrder);
		}
	};
			

	/*
	 * 获取产品节点
	 * @param  prodId 产品ID
	 * @param  servSpecName 产品名称
	 * @param  isComp  是否组合
	 * @param  boActionTypeCd  动作类型
	 */
	var _getProdBusiOrder = function (prodServ){
		var accNbr = _getAccessNumber(prodServ.prodId);
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prodServ.prodId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq-- 
			}, 
			busiObj : { //业务对象节点
				objId : OrderInfo.getProdSpecId(prodServ.prodId),  //业务对象ID
				instId : prodServ.prodId //业务对象实例ID
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
				boActionTypeCd : prodServ.boActionTypeCd
			}, 
			data:{}
		};
		if(isObj(prodServ.isComp)){ //是否组合
			busiOrder.busiObj.isComp = prodServ.isComp;
		}
		if(isObj(accNbr)){ //接入号码
			busiOrder.busiObj.accessNumber = accNbr;
		}
		
		//订单属性--新需求现在这样写死
		var remark = $('#order_remark').val(); 
		if(remark!=""&&remark!=undefined){
			if(!isArray(busiOrder.data.busiOrderAttrs)){
				busiOrder.data.busiOrderAttrs = [];
			}
			busiOrder.data.busiOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});	
		}
		
		if(prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.PRODUCT_PARMS){ //改产品属性
			if(isArray(prodServ.prodSpecParams)){
				busiOrder.data.boServOrders = [];
				busiOrder.data.boServOrders.push({
					servId: prodServ.memberId,
                    servSpecId: prodServ.servSpecId
				});
				busiOrder.data.boServItems = [];
				$.each(prodServ.prodSpecParams,function(){
					if(this.isUpdate=="Y"){
						if(isObj(this.value)){
							var delParam = {
				                itemSpecId : this.itemSpecId,
				                servId : prodServ.memberId,
				                value : this.value,
				                state : "DEL"
				            };
							busiOrder.data.boServItems.push(delParam);
						}
						if(isObj(this.setValue)){
							var addParam = {
				                itemSpecId : this.itemSpecId,
				                servId : prodServ.memberId,
				                value : this.setValue,
				                state : "ADD"
				            };
							busiOrder.data.boServItems.push(addParam);	
						}
					}
				});
			}
		}else if(prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.SERV_OPEN){  //服务开通或关闭
			var state = "ADD";
			if(prodServ.servClose == "Y"){ //服务关闭
				state = "DEL";
			}else {
				if(prodServ.servSpecId == undefined && prodServ.objId != undefined){
					prodServ.servSpecId = prodServ.objId;  //服务开通
				}
			}
			var servOrder = {
				servId: prodServ.servId,
                servSpecId: prodServ.servSpecId
			};
			if(isObj(prodServ.servSpecName)){ //产品名称
				servOrder.servSpecName = prodServ.servSpecName;
			}
			busiOrder.data.boServOrders = [];
			busiOrder.data.boServOrders.push(servOrder);
			
			busiOrder.data.boServs = [];
			busiOrder.data.boServs.push({
				servId: prodServ.servId,
                state: state
			});
			if(prodServ.servClose != "Y"){ //服务开通
				busiOrder.data.boServItems = [];
				if(isArray(prodServ.prodSpecParams)){
					$.each(prodServ.prodSpecParams,function(){
						if(isObj(this.setValue)){
							var addParam = {
				                itemSpecId : this.itemSpecId,
				                servId : prodServ.servId,
				                value : this.setValue,
				                state : state
				            };
				            busiOrder.data.boServItems.push(addParam);
						}
					});
				}
				
				//发展人
				var $tr = $("tr[name='tr_"+prodId+"_"+prodServ.servSpecId+"']");
				if($tr!=undefined&&$tr.length>0){
					if(!isArray(busiOrder.data.busiOrderAttrs)){
						busiOrder.data.busiOrderAttrs = [];
					}
					$tr.each(function(){   //遍历产品有几个发展人
						var dealer = {
							itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
							role : $(this).find("select").val(),
							value : $(this).find("input").attr("staffid") 
						};
						busiOrder.data.busiOrderAttrs.push(dealer);
					});
				}
			}
		}else if(prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.REMOVE_PROD){  //拆机
			busiOrder.data.boProdStatuses = [{ 
				prodStatusCd : CONST.PROD_STATUS_CD.NORMAL_PROD,
				state : "DEL"
			},{prodStatusCd : CONST.PROD_STATUS_CD.REMOVE_PROD,
				state : "ADD"
			}];
		}else if(prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.CHANGE_CARD ||
				prodServ.boActionTypeCd == CONST.BO_ACTION_TYPE.DIFF_AREA_CHANGE_CARD){  //补换卡	
			var proUim = OrderInfo.getProdUim(prodServ.prodId); //获取新卡
			if(isObj(proUim.prodId)){ //有新卡
				busiOrder.data.bo2Coupons = [];
				busiOrder.data.bo2Coupons.push(proUim);
				busiOrder.data.bo2Coupons.push(OrderInfo.getProdOldUim(prodServ.prodId));
				if(isObj(prodServ.remark)){ //备注
					var orderRemark={
						itemSpecId: CONST.BUSI_ORDER_ATTR.REMARK,
						value: prodServ.remark
					};
					busiOrder.data.busiOrderAttrs = [];
					busiOrder.data.busiOrderAttrs.push(orderRemark);
				}
			}else{
				return false;
			}
 		}
		return busiOrder;
	};
	
	/**
	 * 设置产品修改类通用服务
	 * busiOrders 业务对象节点
	 * data 数据节点
	 */
	var _setProdModifyBusiOrder = function(busiOrders,data) {	
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息 
		var busiOrder = {
			areaId : OrderInfo.staff.areaId,  //受理地区ID		
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				objId : prodInfo.productId,//prodInfo.productId, //业务对象规格ID
				instId : prodInfo.prodInstId, //业务对象实例ID
				accessNumber : prodInfo.accNbr  //业务号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
				boActionTypeCd : OrderInfo.boActionTypeCd
			}, 
			data:{}
		};
		busiOrder.data =data;
		busiOrders.push(busiOrder);
	};
	
	//获取产品跟可选包的关联关系
	var _getRelaType = function(servSpecId){
		var relaType = "";
		//遍历已开通附属销售品列表
		$.each(AttachOffer.openList,function(){
			$.each(this.specList,function(){
				$.each(this.offerRoles,function(){
					$.each(this.roleObjs,function(){
						if(this.objId==servSpecId){
							relaType = this.relaTypeCd;
							return false;
						}
					});
				});
			});
		});
		return relaType;
	};
	
	//客户信息节点
	var _boCustInfos = {
		areaId : 0,
		defaultIdType:"1",//证件类型
		businessPassword : "", //客户密码
		name : "", //	客户名称
		partyTypeCd : 1,//客户类型
		state : "ADD", //状态
		telNumber : "",  //联系电话
		addressStr:"" //客户地址
	};
	
	//客户证件节点
	var _boCustIdentities = {
		identidiesTypeCd : "1", //证件类型
		identityNum : "", //证件号码
		isDefault : "Y", //是否首选
		state : "ADD"  //状态
	};

	//客户联系人节点
	var _boPartyContactInfo = {
		contactAddress : "",//参与人的联系地址
        contactDesc : "",//参与人联系详细信息
        contactEmployer  : "",//参与人的联系单位
        contactGender  : "",//参与人联系人的性别
        contactId : "",//参与人联系信息的唯一标识
        contactName : "",//参与人的联系人名称
        contactType : "",//联系人类型
        eMail : "",//参与人的eMail地址
        fax : "",//传真号
        headFlag : "",//是否首选联系人
        homePhone : "",//参与人的家庭联系电话
        mobilePhone : "",//参与人的移动电话号码
        officePhone : "",//参与人办公室的电话号码
        postAddress : "",//参与人的邮件地址
        postcode : "",//参与人联系地址的邮政编码
        staffId : 0,//员工ID
        state : "",//状态
        statusCd : "100001"//订单状态
	};
	
	//客户属性
	var _boCustProfiles = {
			
	};
	
	//获取物品信息节点
	var _getCoupon = function() {	
		var coupon = {
			couponUsageTypeCd : "", //物品使用类型
			inOutTypeId : "",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 0, //销售类型
			couponId : 0, //物品ID
			couponinfoStatusCd : "", //物品处理状态
			chargeItemCd : "", //物品费用项类型
			couponNum : "", //物品数量
			storeId : 0, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : "", //物品实例编码
			ruleId : 0, //物品规则ID
			partyId : 0, //客户ID
			prodId : 0, //产品ID
			offerId : 0, //销售品实例ID
			state : "", //动作
			relaSeq : "" //关联序列	
		};
		return coupon;
	};
	
	//初始化序列
	var _resetSeq = function(){
		OrderInfo.SEQ.seq = -1;  
		OrderInfo.SEQ.offerSeq = -1; 
		OrderInfo.SEQ.prodSeq = -1;  
		OrderInfo.SEQ.servSeq = -1;  
		OrderInfo.SEQ.itemSeq = -1;  
		OrderInfo.SEQ.acctSeq = -1;  
		OrderInfo.SEQ.acctCdSeq = -1;  
		OrderInfo.SEQ.paramSeq = -1;  
		OrderInfo.SEQ.atomActionSeq = -1;
		//OrderInfo.SEQ.dealerSeq = 1;
	};
	
	//初始化数据
	var _resetData = function(){
		OrderInfo.boProdAns = [];  
		OrderInfo.boProd2Tds = []; 
		//OrderInfo.boProd2OldTds = []; 
		OrderInfo.bo2Coupons = [];
		AttachOffer.openList = [];
		AttachOffer.openedList = [];
		AttachOffer.openServList = [];
		AttachOffer.openedServList = [];
		AttachOffer.openAppList = [];
		AttachOffer.labelList = [];
		AttachOffer.isChangeUim = 0;
		OrderInfo.confirmList = [];
		OrderInfo.orderResult = {}; 
		/*OrderInfo.offerSpec = {}; //主销售品构成
		OrderInfo.offer = { //主销售品实例构成
			offerId : "",
			offerSpecId : "",
			offerMemberInfos : []
		}; */
		OrderInfo.order.step = 1;   //填单页面步骤为1
	};
	
	//初始化基础数据，actionClassCd 动作大类，boActionTypeCd 动作小类，actionFlag 受理类型，actionTypeName 动作名称，批量模板使用 templateType
	var _initData = function(actionClassCd,boActionTypeCd,actionFlag,actionTypeName,templateType){
		if(actionClassCd!=""&&actionClassCd!=undefined){
			OrderInfo.actionClassCd = actionClassCd;
		}
		if(boActionTypeCd!=""&&boActionTypeCd!=undefined){
			OrderInfo.boActionTypeCd = boActionTypeCd;
		}
		if(actionFlag!=undefined){
			OrderInfo.actionFlag = actionFlag;
		}
		if(actionTypeName!=""&&actionTypeName!=undefined){
			OrderInfo.actionTypeName = actionTypeName;
		}
		if(templateType!=""&&templateType!=undefined){
			OrderInfo.order.templateType = templateType;
		}
	};
	
	//获取号码
	var _getProdAn = function(prodId){
		var prodAn = {};
		for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
			var an = OrderInfo.boProdAns[i];
			if(an==undefined){
				continue;
			}else{
				if(an.prodId == prodId){
					prodAn = an;
				}
			}
		}
		return prodAn;
	};

	//获取号码
	var _setProdAn = function(prodId,an){
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			$.each(this.prodInsts,function(){
				if(this.prodInstId == prodId){
					this.an = an;
					return false;
				}
			});
		});
	};
	
	
	//获取选号对应的地区
	var _getProdAreaId = function(prodId){
		if(prodId!=undefined && prodId>0){ //二次业务
			var areaId = order.prodModify.choosedProdInfo.areaId;
			if(areaId == undefined || areaId==""){
				return OrderInfo.staff.areaId;	
			}
			return areaId;
		}else { //新装
			for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
				var an = OrderInfo.boProdAns[i];
				if(an.prodId == prodId){
					if(an.areaId == undefined || an.areaId==""){
						return OrderInfo.staff.areaId;
					}else{
						return an.areaId;
					}
				}
			}
			return OrderInfo.staff.areaId;
		}
	};
	
	//获取uim对象
	var _getProdOldUim = function(prodId){
		for (var i = 0; i < OrderInfo.boProd2OldTds.length; i++) {
			var td = OrderInfo.boProd2OldTds[i];
			if(td.prodId == prodId){
				return td;
			}
		}
		return {};
	};
	
	//获取uim对象
	var _getProdUim = function(prodId){
		for (var i = 0; i < OrderInfo.boProd2Tds.length; i++) {
			var td = OrderInfo.boProd2Tds[i];
			if(td.prodId == prodId){
				return td;
			}
		}
		return {};
	};
	
	//清空旧uim
	var _clearProdUim = function(prodId){
		for (var i = 0; i < OrderInfo.boProd2Tds.length; i++) {
			var td = OrderInfo.boProd2Tds[i];
			if(td.prodId == prodId){
				OrderInfo.boProd2Tds.splice(i,1);
			}
		}
	};
	
	//获取uim卡
	var _getProdTd = function(prodId){
		for (var i = 0; i < OrderInfo.boProd2Tds.length; i++) {
			var td = OrderInfo.boProd2Tds[i];
			if(td.prodId == prodId){
				return td.terminalCode;
			}
		}
		return "";
	};
	
	//获取物品
	var _getProdCoupon = function(prodId){
		var flag = true;
		for (var i = 0; i < OrderInfo.bo2Coupons.length; i++) {
			var coupon = OrderInfo.bo2Coupons[i];
			if(coupon.prodId == prodId){
				flag = false ;
				return coupon;
			}
		}
		if(flag){
			var bo2Coupon = {
				prodId : prodId,
				coupons : []
			};
			OrderInfo.bo2Coupons.push(bo2Coupon);
			return bo2Coupon;
		}
	};
	
	//初始化物品
	var _initProdCoupon = function(prodId){
		var flag = true;
		for (var i = 0; i < OrderInfo.bo2Coupons.length; i++) {
			var coupon = OrderInfo.bo2Coupons[i];
			if(coupon.prodId == prodId){
				coupon.coupons = [];
				return coupon;
			}
		}
		if(flag){
			var bo2Coupon = {
				prodId : prodId,
				coupons : []
			};
			OrderInfo.bo2Coupons.push(bo2Coupon);
			return bo2Coupon;
		}
	};
	
	//根据产品id获取号码
	var _getAccessNumber = function(prodId){
		var accessNumber = "";
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){
			for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
				var an = OrderInfo.boProdAns[i];
				if(an.prodId == prodId){
					if(an.accessNumber != undefined ){
						accessNumber =  an.accessNumber;
					}
				}
			}
		}else if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){
			$.each(OrderInfo.offer.offerMemberInfos,function(i){
				if(this.objInstId==prodId){
					accessNumber = this.accessNumber;
					return false;
				}
			});
		} else if(prodId!=undefined && prodId>0){
			accessNumber = order.prodModify.choosedProdInfo.accNbr;	
		}
		return accessNumber;
	};
	
	//根据产品id获取地区编码
	var _getAreaCode = function(prodId){
		var areaCode = "";
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){
			for (var i = 0; i < OrderInfo.boProdAns.length; i++) {
				var an = OrderInfo.boProdAns[i];
				if(an.prodId == prodId){
					if(an.areaCode != undefined ){
						areaCode =  an.areaCode;
					}
				}
			}
		}else if(prodId!=undefined && prodId>0){
			areaCode = order.prodModify.choosedProdInfo.areaCode;	
		}
		if(areaCode ==undefined || areaCode==""){
			areaCode = OrderInfo.staff.areaCode;	
		}
		return areaCode;
		
	};
	
	//根据产品id获取号码
	var _getAccNbrByRoleCd = function(roleCd){
		var accNbr = "";
		$.each(OrderInfo.boProdAns,function(){
			if(this.memberRoleCd==roleCd){
				accNbr = this.accessNumber;
				return false;
			}
		});
		if(accNbr==undefined || accNbr==""){
			accNbr = OrderInfo.boProdAns[0].accessNumber;
		}
		return accNbr;
	};
	
	//获取产品对应的角色
	var _getOfferRoleName = function(prodId){
		var offerRoleName = "";
		if(OrderInfo.actionFlag==2 || OrderInfo.actionFlag==3){
			if(OrderInfo.offer.offerMemberInfos!=undefined){
				$.each(OrderInfo.offer.offerMemberInfos,function(i){
					if(this.objInstId == prodId){
						offerRoleName = this.roleName;  //角色名称
						return false;
					}
				});
			}
		}else{
			if(OrderInfo.offerSpec.offerRoles!=undefined){
				$.each(OrderInfo.offerSpec.offerRoles,function(i){
					var roleName = this.offerRoleName;  //角色名称
					if(this.prodInsts!=undefined){
						$.each(this.prodInsts,function(){
							if(this.prodInstId == prodId){
								offerRoleName = roleName;
								return false;
							}
						});
					}
				});
			}
		}
		return offerRoleName;
	};
	
	//根据产品Id获取缓存中的产品实例
	var _getProdInst = function(prodId){
		var prodInst = {};
		if(OrderInfo.actionFlag == 2){ //套餐变更
			$.each(OrderInfo.offer.offerMemberInfos,function(i){
				if(this.objInstId ==prodId){
					prodInst = this;
					prodInst.accNbr = this.accessNumber;
					return false;
				}
			});
		}else if(OrderInfo.actionFlag == 3){ //可选包变更
			prodInst = order.prodModify.choosedProdInfo;
		}else { //新装
			$.each(OrderInfo.offerSpec.offerRoles,function(i){
				if(this.prodInsts!=undefined){
					$.each(this.prodInsts,function(){
						if(this.prodInstId == prodId){
							prodInst = this;
							return false;
						}
					});
				}
			});
		}
		return prodInst;
	};
	
	//根据接入产品id获取接人产品规格
	var _getProdSpecId = function(prodId){
		var prodSpecId = CONST.PROD_SPEC.CDMA;  //默认CDMA
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				$.each(this.prodInsts,function(){
					if(this.prodInstId == prodId){
						prodSpecId = this.objId;
						return false;
					}
				});
			});
		}else if(OrderInfo.actionFlag==2){
			$.each(OrderInfo.offer.offerMemberInfos,function(i){
				if(this.objInstId==prodId){
					prodSpecId = this.objId;
					return false;
				}
			});
		} else if(prodId!=undefined && prodId>0){
			prodSpecId = order.prodModify.choosedProdInfo.productId;	
		}
		return prodSpecId;
	};
	
	//获取权限
	var _getPrivilege = function(manageCode){
		if(OrderInfo.privilege.effTime==""){
			var param = {
				manageCode : manageCode	
			};
			return query.offer.checkOperate(param);
		}
	};
	
	//判断是否是空对象
	var isObj = function(obj){
		var flag = false;
		if(obj!=undefined && $.trim(obj)!=""){
			flag = true;
		}
		return flag;
	};
	
	//判断是否是空数组
	var isArray = function(obj){
		if(!!obj && obj.length>0){
			return true;
		}else{
			return false;
		}
	};
				
	return {	
		order					: _order,
		SEQ						: _SEQ,
		resetSeq				: _resetSeq,
		resetData				: _resetData,	
		orderResult				: _orderResult,
		cust					: _cust,
		staff					: _staff,
		offerSpec				: _offerSpec,
		offer 					: _offer,
		attach2Coupons			: _attach2Coupons,
		boCustInfos 			: _boCustInfos,
		boCustIdentities 		: _boCustIdentities,
		boPartyContactInfo 		: _boPartyContactInfo,
		boCustProfiles			: _boCustProfiles,
		boCusts					: _boCusts,
		boProdItems				: _boProdItems,
		boProdPasswords			: _boProdPasswords,
		boProdAns				: _boProdAns,
		boProd2Tds				: _boProd2Tds,
		bo2Coupons				: _bo2Coupons,
		boProd2OldTds			: _boProd2OldTds,
		clearProdUim			: _clearProdUim,
		getCoupon				: _getCoupon,
		orderData 				: _orderData,
		getOrderData 			: _getOrderData,
		actionClassCd			: _actionClassCd,
		boActionTypeCd			: _boActionTypeCd,
		actionFlag 				: _actionFlag,
		actionTypeName			: _actionTypeName,
		initData				: _initData,
		getOfferBusiOrder		: _getOfferBusiOrder,
		getProdBusiOrder		: _getProdBusiOrder,
		createCust				: _createCust,
		createAcct				: _createAcct,
		getProdAn				: _getProdAn,
		getProdTd				: _getProdTd,
		getProdUim				: _getProdUim,
		getProdOldUim			: _getProdOldUim,
		getProdAreaId			: _getProdAreaId,
		getProdCoupon			: _getProdCoupon,
		getProdInst				: _getProdInst,
		getAccessNumber			: _getAccessNumber,
		getAreaCode				: _getAreaCode,
		initProdCoupon			: _initProdCoupon,
		setProdAn				: _setProdAn,
		setProdModifyBusiOrder	: _setProdModifyBusiOrder,
		confirmList				: _confirmList,
		getOfferRoleName		: _getOfferRoleName,
		getAccNbrByRoleCd    	: _getAccNbrByRoleCd,
		businessName			: _businessName,
		getProdSpecId			: _getProdSpecId,
		privilege				: _privilege,
		getPrivilege			: _getPrivilege,
		offerProdInst          : _offerProdInst
	};
})();
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
		OrderInfo.resetSeq(); //重置序列
		OrderInfo.resetData(); //重置 数据
		OrderInfo.orderResult = {}; //清空购物车
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
	};
	
	//提交订单节点
	var _submitOrder = function(data) {
		if(_getOrderInfo(data)){
			//订单提交
			var result = query.offer.orderSubmit(JSON.stringify(OrderInfo.orderData));
			if(result){
				_orderConfirm(result);
			}else{
				OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
				OrderInfo.resetSeq(); //重置序列
			}
		}	
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
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		if(!_checkData()){ //校验通过
			return false;
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
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = data;
		}else if (OrderInfo.actionFlag==11){ //撤单,有做特殊处理
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = data;
		}else if (OrderInfo.actionFlag==12){ //加入退出组合
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = data;
		}else if(OrderInfo.actionFlag==16){ //改号
			_changeNumber(busiOrders);	
		}else if(OrderInfo.actionFlag==19){ //返销
			_fillBusiOrder(busiOrders,data,"N"); //填充业务对象节点	
		}else if(OrderInfo.actionFlag==20){ //返销
			_delAndNew(busiOrders,data); 
		}else if(OrderInfo.actionFlag==21){ //销售品成员变更保留副卡订购新套餐
			_delViceCardAndNew(busiOrders,data);
		}else if(OrderInfo.actionFlag== 22){ //补换卡
			OrderInfo.orderData.orderList.custOrderList[0].busiOrder = data;
		}else{  //默认单个业务动作	
			_fillBusiOrder(busiOrders,data,"N"); //填充业务对象节点
		}
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
		//填入订单
		var busiOrder = {
			areaId : OrderInfo.staff.areaId,  //受理地区ID		
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
					if (boActionType.actionClassCd==CONST.ACTION_CLASS_CD.MKTRES_ACTION
							&& boActionType.boActionTypeCd==CONST.BO_ACTION_TYPE.EXCHANGE_COUPON) {
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
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==CONST.OBJ_TYPE.PROD){
				$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.roleName+')</th><th>业务动作</th></tr>'));
				_showAttOffer(this.objInstId);
			}
		});
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
					$("#chooseTable").append($('<tr><td width="50%">'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_BUY+'</td></tr>'));
				}
			});
		}
		if(offerList!=undefined && offerList.length>0){
			$.each(offerList,function(){ //遍历当前产品下面的附属销售品
				if(this.isdel == "Y"){  //退订的附属销售品
					$("#chooseTable").append($('<tr><td width="50%">'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_DEL+'</td></tr>'));
				}else if(this.update == "Y"){
					$("#chooseTable").append($('<tr><td width="50%">'+this.offerSpecName+'</td><td>'+CONST.EVENT.OFFER_UPDATE+'</td></tr>'));
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
	var _delOrder = function(){
		var olId = OrderInfo.orderResult.olId;
		if(olId!=0&&olId!=undefined){  //作废购物车
			var param = {
				olId : olId,
				areaId : OrderInfo.staff.areaId
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
					$.alert("提示","信息","服务忙，请稍后再试！");
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
				areaId : OrderInfo.staff.areaId
			};
			var result = $.callServiceAsJsonGet(contextPath+"/order/delOrder",param);
			
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
				areaId : OrderInfo.staff.areaId,  //受理地区ID
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
		var acctId = $("#acctSelect").find("option:selected").attr("value"); //先写死
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
	
	//初始化订单获取token
	var _getToken = function() {
		$.callServiceAsHtmlGet(contextPath+"/common/getToken",{
			"done" : function(response){
				OrderInfo.order.token = response.data;
			}
		});	
	};
	
	//创建主副卡订单数据
	var _createMainOrder = function(busiOrders) {
		var prodInfo = order.prodModify.choosedProdInfo;
		var busiOrder = {
			areaId : OrderInfo.staff.areaId,  //受理地区ID
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
				ooRoles : [],
				ooOwners : []				
			}
		};
		
		//所属人节点
		var ooOwners = {
			partyId : OrderInfo.cust.custId, //客户对象ID
			state : "ADD" //动作
		};
		busiOrder.data.ooOwners.push(ooOwners);
		
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
			var remark = $('#order_remark').val();   //订单备注
			if(remark!=""&&remark!=undefined){
				busiOrder.data.busiOrderAttrs.push({
					itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
					value : remark
				});	
			}
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
				var remark = $('#order_remark').val();   //订单备注
				if(remark!=""&&remark!=undefined){
					busiOrder.data.busiOrderAttrs.push({
						itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
						value : remark
					});	
				}
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
			//订单属性
			if(remark!=undefined&&remark!=""){
				busiOrder.data.busiOrderAttrs.push({
					itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
					value : remark
				});	
			}
			busiOrders.push(busiOrder);	
		}
		
		//订购副卡主套餐
		for (var i = 0; i < newData.length; i++) {
			var offerSpec = newData[i];
			var busiOrder2 = {
				areaId : OrderInfo.staff.areaId,  //受理地区ID
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
		} 
	};
	
	//创建附属销售品订单数据
	var _createAttOrder = function(busiOrders){	
		AttachOffer.setAttachBusiOrder(busiOrders);		
		var prodInfo = order.prodModify.choosedProdInfo;
		if(AttachOffer.isChangeUim == 1 && prodInfo.prodClass==CONST.PROD_CLASS.THREE){ //可选包变更补换卡
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
			areaId : OrderInfo.staff.areaId,  //受理地区ID		
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
			areaId : OrderInfo.staff.areaId,  //受理地区ID		
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
		var busiOrderAdd = {
				areaId : OrderInfo.staff.areaId,  //受理地区ID		
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
			areaId : OrderInfo.staff.areaId,  //受理地区ID		
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
				ooOwners : []				
			}
		};
		
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
		busiOrders.push(busiOrder);
		return busiOrder;
	};
	
	//创建产品节点
	var _createProd = function(prodId,prodSpecId) {	
		/*var an = OrderInfo.getProdAn(prodId).accessNumber;
		if(an==undefined || an==""){ 
			return;	
		}*/
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
		
		var prodStatus = CONST.PROD_STATUS_CD.NEW_PROD;
		if($("#isTemplateOrder").attr("checked")=="checked"){ //批量订单
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
				//busiOrder.busiObj.accessNumber = boProdAns[i].accessNumber;
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
		//订单属性
		var remark = $('#order_remark').val();   //订单备注
		if(remark!=""&&remark!=undefined){
			busiOrder.data.busiOrderAttrs.push({
				itemSpecId : CONST.BUSI_ORDER_ATTR.REMARK,
				value : remark
			});	
		}
		//发展人
		var $tr = $("tr[name='tr_"+prodId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
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
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14){ //新装
			if(OrderInfo.cust.custId==""){
				$.alert("提示","客户信息不能为空！");
				return false ; 
			}
			//遍历主销售品构成
			if(OrderInfo.order.dealerTypeList==undefined ||OrderInfo.order.dealerTypeList.length == 0 ){
				$.alert("提示","发展人类型不能为空！");
				return false ; 
			}
			//校验号码跟UIM卡
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
						$("#uim_txt_"+prodInst.prodInstId).css("border-color","red");
						return false;
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
					if(!order.main.templateTypeCheck()){
						return false;
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
		
		//套餐变更补换卡校验
		if(OrderInfo.actionFlag == 2 ){
			for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var member = OrderInfo.offer.offerMemberInfos[i];
				if(member.objType == CONST.OBJ_TYPE.PROD){  //接入产品
					if(member.prodClass == CONST.PROD_CLASS.THREE && CONST.getAppDesc()==0 && OrderInfo.offerSpec.is3G=="N"){  //3G uim卡  
						var td = OrderInfo.getProdTd(member.objInstId);
						if(td==""){
							$.alert("提示",member.roleName+" UIM卡不能为空！");
							return false ; 
						}
					}
				}
			}
		}
		//可选包变更补换卡校验
		if(OrderInfo.actionFlag == 3){
			if(AttachOffer.isChangeUim == 1 && CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.prodClass==CONST.PROD_CLASS.THREE){
				if(OrderInfo.boProd2Tds.length==0){
					$.alert("提示","UIM卡不能为空！");
					return false ; 
				}
			}
		}
		//补换卡校验
		if(OrderInfo.actionFlag == 22){
			if(OrderInfo.boProd2Tds.length==0){
				$.alert("提示","UIM卡不能为空！");
				return false ; 
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
			if($("#bankId").val()=="" || $.trim($("#bankAcct").val())==""){
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
				//$("#templateTypeDiv").show();
				//$("#templateOrderName").show();
				//$("#templateOrderTitle").show();
			}
			$(".template_info_name").show();
		}else {
			$(".template_info_name").hide();
			$(".template_info_type").hide();
			$("#templateOrderName").val("");
			//$("#templateOrderTitle").hide();
			//$("#templateTypeDiv").hide();
			//$("#templateOrderName").val("");	
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
	
	
	return {
		builder 				: _builder,
		createAttOffer  		: _createAttOffer,
		createServ				: _createServ,
		delOrder 				: _delOrder,
		delAndNew				: _delAndNew,
		getOrderInfo 			: _getOrderInfo,
		getToken				: _getToken,
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
		delOrderFin				: _delOrderFin
	};
})();
CommonUtils.regNamespace("acct", "acctModify");
/**
 * 二次业务帐户信息修改
 */
acct.acctModify = (function(){
	//这几个节点将用来装旧帐户信息
	var boAccountInfoDEL = {};
	var boPaymentAccountDEL = {};
	var boAccountMailingDEL = {};
	//修改帐户信息规则校验
	var _showAcctInfoModify = function(){
		var param = order.prodModify.getCallRuleParam(CONST.BO_ACTION_TYPE.ACCTINFOMODIFY,order.prodModify.choosedProdInfo.prodInstId);
		var callParam = {
				boActionTypeCd : CONST.BO_ACTION_TYPE.ACCTINFOMODIFY,
				boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ACCTINFOMODIFY),
				accessNumber : order.prodModify.choosedProdInfo.accNbr,
				prodOfferName : order.prodModify.choosedProdInfo.prodOfferName
			};

		var checkRule = rule.rule.prepare(param,'acct.acctModify.acctInfoModify',callParam);
		if (checkRule) return ;
//		SoOrder.builder();
		OrderInfo.initData(CONST.ACTION_CLASS_CD.ACCT_ACTION,CONST.BO_ACTION_TYPE.ACCTINFOMODIFY,10,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ACCTINFOMODIFY),"");	
	};
	
	//获取产品下帐户信息，跳转并初始化修改帐户信息页面
	var _acctInfoModify = function(){
		if(!order.prodModify.choosedProdInfo.prodInstId || !order.prodModify.choosedProdInfo.accNbr){
			$.alert("提示","产品信息定位异常，请联系管理员");
			$("#orderedprod").show();
			$("#order_prepare").show();
			$("#order_tab_panel_content").show();
			$("#order_confirm").show();
			$("#order_fill_content").hide();
			order.prepare.hideStep();
			return;
		}		
		var param={
				prodId : order.prodModify.choosedProdInfo.prodInstId,
				acctNbr : order.prodModify.choosedProdInfo.accNbr
		};
		$.callServiceAsHtml(contextPath + "/order/prodModify/acctInfoModify", param, {
			"before":function(){
				$.ecOverlay("<strong>正在确认当前产品帐户,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},						
			"done":function(response){
				if(response.code!=0){
					$.alert("提示","无法确认当前产品帐户，请联系管理员");
					$("#orderedprod").show();
					$("#order_prepare").show();
					$("#order_tab_panel_content").show();
					$("#order_confirm").show();
					$("#order_fill_content").hide();
					order.prepare.hideStep();
					return;
				}
				$("#order_fill_content").html(response.data).show();
				$(".h2_title").append(order.prodModify.choosedProdInfo.productName+"-"+order.prodModify.choosedProdInfo.accNbr);
				_chooseAcctToModify("#acctInfoList tr",$("#acctInfoList").children(":first-child"));
				$("#acctInfoList tr").each(function(){$(this).off("click").on("click",function(event){
					_chooseAcctToModify("#acctInfoList tr",this);
					event.stopPropagation();
					});
				});				
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
			}
		});
	};
	
	//切换展示要修改的帐户信息
	var _chooseAcctToModify = function(trs, $tr){
		$(trs).removeClass("plan_select");
		$(trs).children(":first-child").html("");
		$($tr).addClass("plan_select");
		$($tr).children(":first").html("<i class='select'></i>");
		//查询要修改的帐户详情
		var param = {
				acctId : $tr.attr("id")
		};
		var response = $.callServiceAsHtml(contextPath + "/order/prodModify/queryAcctDetailInfo", param);											
//		if(response.errorsList!=undefined && response.errorsList!="null"){					
//			$.alert("提示", response.errorsList);									
//		} 	
		if(response.code!=0){
			$("#acctInfoDetail").html("账户信息加载失败").show();
			return;
		}
		$("#acctInfoDetail").html(response.data).show();
		_getBILL_POST();	
		//删去重复加载的选择项
		var postTypes = $("#postType option:not(:first)");				
		$.each(postTypes, function(i, postType){					
			if($(postType).val()==$("#postType option:first").val()){						
				$(postType).remove();
				return false;
			}
		});
		var billContents = $("#billContent option:not(:first)");
		$.each(billContents, function(i, billContent){
			if($(billContent).val()==$("#billContent option:first").val()){
				$(billContent).remove();
				return false;
			}
		});
		var postCycles = $("#postCycle option:not(:first)");
		$.each(postCycles, function(i, postCycle){
			if($(postCycle).val()==$("#postCycle option:first").val()){
				$(postCycle).remove();
				return false;
			}
		});
		//帐户信息显示或隐藏初始化
		_paymentType();
		_billPostType();
		if($("#billContent").val()==14){
			$("#receipt").show();
		}
		//记录旧的帐户信息
		boAccountInfoDEL = {
				acctCd : $("#acctInfoList .plan_select td:eq(0)").attr("id"),        //*帐户合同号
				acctName : $("#acctName").val(),                            //*帐户名称
				acctTypeCd : "1",
				partyId : $("#partyId").val(),                              //*客户ID
				prodId : order.prodModify.choosedProdInfo.prodInstId,       //产品ID
				state : "DEL"
		};
		boPaymentAccountDEL = {
				bankAcct : $("#bankAcct").val(),
				bankId : $("#bankId").val(),
				limitQty : "1",
				paymentAcctTypeCd : $("#paymentType").val(),     //*支付类型 100000:现金 110000:银行 
				paymentAccountId : $("#paymentType").attr("name"),
				paymentMan : $("#paymentMan").val(),
				state : "DEL"
		};
		if($("#postType").val()!=-1){
			boAccountMailingDEL = {
					mailingType : $("#postType").val(),   //*投递方式
					param1 : $("#postAddress").val(),     //*投递地址
					param2 : "1",                         //格式ID
					param3 : $("#postCycle").val(),       //*投递周期
					param7 : $("#billContent").val(),     //*账单内容
					state : "DEL"
			};
			if($("#postType").val()==11 || $("#postType").val()==15){
				boAccountMailingDEL.param1 = $("#postAddress").val()+","+$("#zipCode").val()+","+$("#consignee").val(); //*收件地址,邮编,收件人			
			}
		}
		else{
			boAccountMailingDEL = {};
		}
	};
	
	//获取账单投递信息主数据	
	var _getBILL_POST = function(showNewDetail){
		var configParam = {
				CONFIG_PARAM_TYPE : "BILL_POST"
		};				
		var qryConfigUrl=contextPath+"/order/queryApConf";	
		var jr = $.callServiceAsJsonGet(qryConfigUrl, configParam);
		if(jr.code==0 && jr.data){
			for(var n=0;n<jr.data.length;n++){								
				//账单投递方式								
				if(jr.data[n].BILL_POST_TYPE){									
					$.each(jr.data[n].BILL_POST_TYPE, function(i, postType){										
						$("<option>").attr("value",postType.COLUMN_VALUE).text(postType.COLUMN_VALUE_NAME).appendTo($("#postType"));									
					});								
				}								
				//账单投递内容								
				else if(jr.data[n].BILL_POST_CONTENT){									
					$.each(jr.data[n].BILL_POST_CONTENT, function(i, postContent){										
						$("<option>").attr("value",postContent.COLUMN_VALUE).text(postContent.COLUMN_VALUE_NAME).appendTo($("#billContent"));									
					});								
				}								
				//账单投递周期								
				else if(jr.data[n].BILL_POST_CYCLE){									
					$.each(jr.data[n].BILL_POST_CYCLE, function(i, postCycle){										
						$("<option>").attr("value",postCycle.COLUMN_VALUE).text(postCycle.COLUMN_VALUE_NAME).appendTo($("#postCycle"));									
					});								
				}							
			}
			if(showNewDetail){
				showNewDetail();
			}
		}
		
	};
	
	//选择支付方式
	var _paymentType = function(){
		if($("#paymentType").val()==100000){
			$(".bank").hide();
			$("#paymentType").parent().addClass("full");
		}
		else{
			$(".bank").show();
			$("#paymentType").parent().removeClass("full");
		}
	};
	
	//选择账单投递方式
	var _billPostType = function(){
		if($("#postType").val()==-1){
			$(".billPost").hide();
			$("#postType").parent().addClass("full");
			$("#billContent").find("option[value=11]").attr("selected","selected");
			$("#postType").find("option[value=12]").show();
			$("#postType").find("option[value=13]").show();
			$("#postType").find("option[value=14]").show();
			$("#receipt").hide();
		}
		else{
			$(".billPost").show();
			$("#postType").parent().removeClass("full");
			if($("#postType").val()==12){
				$("#postAddress").attr("placeHolder","请输入有效的传真号码");
			}
			else if($("#postType").val()==13){
				$("#postAddress").attr("placeHolder","请输入有效的Email地址");
			}
			else if($("#postType").val()==14){
				$("#postAddress").attr("placeHolder","请输入有效的手机号");
			}
			else{
				$("#postAddress").attr("placeHolder","请输入准确的收件地址");
			}
		}
	};
	
	//选择账单内容（发票不支持电子投递方式）
	var _billContent = function(){
		if($("#billContent").val()==14){						
			if($("#postType").val()==12 || $("#postType").val()==13 || $("#postType").val()==14){
				$("#postType").find("option[value=11]").attr("selected","selected");
				$("#postAddress").val("");
				$("#postAddress").attr("placeHolder","请输入准确的收件地址");
			}
			$("#postType").find("option[value=12]").hide();
			$("#postType").find("option[value=13]").hide();
			$("#postType").find("option[value=14]").hide();
			$("#receipt").fadeIn("slow");
		}
		else{			
			$("#postType").find("option[value=12]").show();
			$("#postType").find("option[value=13]").show();
			$("#postType").find("option[value=14]").show();
			$("#receipt").fadeOut("slow");
		}
	};
	
	//地区查询（银行查询弹出框）
	var _queryAllArea = function(){
		order.area.chooseAreaTreeAll("p_bank_areaId_val","p_bank_areaId",3);
	};
	
	//银行查询
	var _queryBank = function(pageIndex){
		var _bank;
		var _curPage = 1;
		if(pageIndex==0){
			_bank = {
					name : "",
					bankId : "",
					simpleSpell : "",
					commonRegionId : ""
			};
		}
		if(pageIndex>0){
			_curPage = pageIndex;
			_bank = {
					name : $("#p_bandkname").val(),
					bankId : "",
					simpleSpell : $("#p_simpleSpell").val(),
					commonRegionId : $("#p_bank_areaId").val()
			};
		}
		var param = {				
				bank : _bank,
				curPage : _curPage,
				pageSize : 10
		};
		$.callServiceAsHtml(contextPath + "/acct/getBankList",param,{
			"before":function(){
				$.ecOverlay("<strong>银行查询中,请稍等....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='';
				}
				$("#div_bank_dialog").html(response.data);				
				$("#bank_list tr").each(function(){$(this).off("click").on("click",function(event){
					_chooseBank("#bank_list tr",this);
					event.stopPropagation();
					});
				});
				easyDialog.open({
					container : "div_bank_dialog"
				});				
			}
		});	
	};
	
	//选定银行
	var _chooseBank = function(trs, $tr){
		$(trs).removeClass("plan_select");
		$(trs).children(":first-child").html("");
		$($tr).addClass("plan_select");
		$($tr).children(":first").html("<i class='select'></i>");
	};
	
	//在页面上添加选定的银行信息
	var _fillBankInfo = function(){
		var $bank = $("#bank_list .plan_select");
		$("#bankId").val($($bank).attr("id"));
		$("#bankName").val($($bank).find("td:eq(2)").text());
		if($bank.length > 0){
			easyDialog.close();
		}
		else{
			$.alert("操作提示","请选择银行！");
		}
	};
	
	//帐户信息修改：订单提交
	var _acctInfoModify_Submit = function() {
		//帐户信息填写校验
		if(!SoOrder.checkAcctInfo()){
			return;
		}			
		//订单报文开始组装
		var _busiOrder = {
				areaId : OrderInfo.staff.areaId,
				boActionType : {
					actionClassCd : CONST.ACTION_CLASS_CD.ACCT_ACTION,
					boActionTypeCd : CONST.BO_ACTION_TYPE.ACCTINFOMODIFY
				},
				busiObj : {
					accessNumber : order.prodModify.choosedProdInfo.accNbr,
					instId :  $("#acctInfoList .plan_select").attr("id"), //帐户ID
					isComp : "N",
					objId : "",
					offerTypeCd : "1"
				},
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				},
				data : {
					boAccountInfos : [],
					boAcct2PaymentAccts : [],
					boAccountItems : [],
					boPaymentAccounts : [],
					boAccountMailings : []
				}
		};
		//帐户基本信息节点
		var boAccountInfoADD = {
				acctCd : $("#acctInfoList .plan_select td:eq(0)").attr("id"),        //*帐户合同号
				acctName : $("#acctName").val(),                            //*帐户名称
				acctTypeCd : "1",
				partyId : $("#partyId").val(),                              //*客户ID
				prodId : order.prodModify.choosedProdInfo.prodInstId,       //产品ID
				state : "ADD"
		};
		_busiOrder.data.boAccountInfos.push(boAccountInfoDEL);
		_busiOrder.data.boAccountInfos.push(boAccountInfoADD);
		//帐户付费关联关系节点
		var boAcct2PaymentAcctADD = {
				priority : "1",
				paymentAccountId : $("#paymentType").attr("name"),
				state : "ADD"
		};
		_busiOrder.data.boAcct2PaymentAccts.push(boAcct2PaymentAcctADD);
		//帐户支付信息节点
		var boPaymentAccountADD = {
				bankAcct : "",
				bankId : "",
				limitQty : "1",
				paymentAcctTypeCd : $("#paymentType").val(),     //*支付类型 100000:现金 110000:银行 
				paymentAccountId : $("#paymentType").attr("name"),
				paymentMan : "",
				state : "ADD"
		};
		if($("#paymentType").val()==110000){
			boPaymentAccountADD.bankAcct = $("#bankAcct").val();        //*银行帐号
			boPaymentAccountADD.bankId = $("#bankId").val();            //*银行ID
			boPaymentAccountADD.paymentMan = $("#paymentMan").val();    //支付人
		}
		_busiOrder.data.boPaymentAccounts.push(boPaymentAccountDEL);
		_busiOrder.data.boPaymentAccounts.push(boPaymentAccountADD);
		//账单投递信息节点
		if(boAccountMailingDEL.mailingType){
			_busiOrder.data.boAccountMailings.push(boAccountMailingDEL);
		}
		if($("#postType").val()!=-1){
			var boAccountMailingADD = {
					mailingType : $("#postType").val(),   //*投递方式
					param1 : $("#postAddress").val(),     //*投递地址
					param2 : "1",                         //格式ID
					param3 : $("#postCycle").val(),       //*投递周期
					param7 : $("#billContent").val(),     //*账单内容
					state : "ADD"
			};
			if($("#postType").val()==11 || $("#postType").val()==15){				
				boAccountMailingADD.param1 = $("#postAddress").val()+","+$("#zipCode").val()+" , "+$("#consignee").val(); //*收件地址,邮编,收件人			
			}
			_busiOrder.data.boAccountMailings.push(boAccountMailingADD);
		}
		var busiOrder = [];
		busiOrder.push(_busiOrder);
		SoOrder.submitOrder(busiOrder);
	};
	
	return{
		showAcctInfoModify : _showAcctInfoModify,
		acctInfoModify : _acctInfoModify,
		getBILL_POST : _getBILL_POST,
		paymentType : _paymentType,
		billPostType : _billPostType,
		billContent : _billContent,		
		queryAllArea : _queryAllArea,			
		queryBank : _queryBank,
		fillBankInfo : _fillBankInfo,
		acctInfoModify_Submit : _acctInfoModify_Submit
	};
	
})();
CommonUtils.regNamespace("account", "query");

/**
 * 帐户详情查询
 */
account.query = (function(){
	
	var _areaId = "";
	
	//地区选择（系统管理维度列表弹出框）	
	var _chooseArea = function(){
		order.area.chooseAreaTreeManger("acct/preQueryAccount","p_areaId_val","p_areaId",3);
	};
	
	//客户查询（弹出框）
	var _showQueryCust = function(){
		if($("#p_areaId_val").val()==""){
			$.alert("提示","请先选择所属地区再进行客户查询");
			return;
		}
		easyDialog.open({
			container : "d_cust"
		});
		$("#cust").val("");
		$("#custlist").html("");
		$(".easyDialogclose").click(function(){
			easyDialog.close();			
		});						
	};
	
	//初始化客户认证类型弹出框
	var _initCustIdType = function(){
		var param = {attrSpecCode : "PTY-0004"};
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#cust_id_type").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");							
						}
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
	};
	
	//变更客户认证类型
	var _changeCustIdType = function(option){
		var type = $(option).val();
		if(type==0){
			$("#cust").attr("placeHolder","请输入有效的中国电信手机号");
			$("#cust").attr("data-validate","validate(isTelecomSection:请输入有效的中国电信号码) on(blur)");
		}
		else if(type==1){
			$("#cust").attr("placeHolder","请输入合法的身份证号码");
			$("#cust").attr("data-validate","validate(idCardCheck:请准确填写身份证号码) on(blur)");
		}
		else if(type==2){
			$("#cust").attr("placeHolder","请输入合法的军官证");
			$("#cust").attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}
		else if(type==3){
			$("#cust").attr("placeHolder","请输入合法的护照");
			$("#cust").attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}
		else{
			$("#cust").attr("placeHolder","请输入合法的证件号码");
			$("#cust").attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		$("#cust").val("");
		_queryCust();
	};
	
	//查询客户
	var _queryCust = function(){
		$("#custQueryForm").off().bind("formIsValid", function(event, form){			
			var _acctNbr = "";
			var _identityNum = "";
			var _identityCd = "";
			if($("#cust_id_type").val()==0){
				_acctNbr = $("#cust").val();
			}
			else{
				_identityCd = $("#cust_id_type").val();
				_identityNum = $("#cust").val();
			}
			var param = {
					acctNbr : _acctNbr,
					identityCd : _identityCd,
					identityNum : _identityNum,
					partyName : "",
					custQueryType : $("#custQueryType").val(),
					diffPlace : "maybe",
					areaId : $("#p_areaId").val(),
					query : "acct"  //账户详情查询的页面标志
			};
			$.callServiceAsHtml(contextPath+"/cust/queryCust",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.code != 0) {
						$.alert("提示","查询失败,稍后重试");
						return;
					}
					if(response.data =="false\r\n") {
						$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
						return;
					}
					$("#custlist").html(response.data).show();
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				}				
			});
		}).ketchup({bindElement:"bt_cust_query"});
	};
	
	//选定客户
	var _chooseCust = function(tr){
		var custName = $(tr).find("td:eq(0)").text();
		var custId = $(tr).find("td:eq(3)").text();
		$("#custName").val(custName).attr("name", custId);
		easyDialog.close();
	};
	
	//重置客户信息
	var _resetCust = function(){
		$("#custName").val("").removeAttr("name");
	};
	
	//变更精确查询条件
	var _changeQueryType = function(option){
		if($(option).val()==1){
			$("#num").attr("placeHolder","请输入有效的中国电信手机号");
		}
		else{
			$("#num").attr("placeHolder","请输入帐户合同号");
		}
	};
	
	//定位帐户
	var _queryAccount = function(){
		if($("#p_areaId_val").val()==""){
			$.alert("提示","请选择所属地区");
			return;
		}
		var queryNum = $.trim($("#num").val());
		if($("#custName").val()=="" && queryNum==""){
			$.alert("提示","请至少再输入以下一个查询条件：所属客户，接入号，合同号");
			return;
		}
		if(queryNum!=""){
			if($("#query_type").val()==1){
				var check = /^(180|189|133|134|153|181|108|170|177)\d{8}$/.test(queryNum);
				if(check==false){
					$.alert("提示","请输入有效的中国电信手机号");
					return;
				}
			}
		}
		var param = {
				areaId : $("#p_areaId").val()							
		};
		if($("#custName").val()!=""){
			param.custId = $("#custName").attr("name");
		}
		if(queryNum!=""){
			if($("#query_type").val()==1){
				param.accessNumber = queryNum;
			}
			else{
				param.acctCd = queryNum;
			}
		}		
		$.callServiceAsHtmlGet(contextPath+"/acct/queryAccount", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#acctList").html(response.data).show();	
				$("#acctDetail").hide();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
		
	}; 
	
	//查询帐户详情
	var _queryAcctDetail = function(_acctId){
		var param = {
				acctId : _acctId,
				areaId : $("#p_areaId").val()
		};
		$.callServiceAsHtmlGet(contextPath+"/acct/queryAcctDetail", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#acctDetail").html(response.data).show();	
				$("#acctList").hide();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	
	//返回按钮
	var _back = function(){
		$("#acctDetail").hide();
		$("#acctList").show();
	};
	
	return{
		areaId : _areaId,
		chooseArea : _chooseArea,
		showQueryCust : _showQueryCust,
		initCustIdType : _initCustIdType,
		changeCustIdType : _changeCustIdType,
		queryCust : _queryCust,
		chooseCust : _chooseCust,
		resetCust : _resetCust,
		changeQueryType : _changeQueryType,
		queryAccount : _queryAccount,
		queryAcctDetail : _queryAcctDetail,
		back : _back
	};
	
})();

$(function(){
	
	account.query.initCustIdType();
	account.query.queryCust();
	
});
/**
 * 客户资料管理
 */
CommonUtils.regNamespace("order", "cust");

order.cust = (function(){
	
	var _choosedCustInfo = {};
	var createCustInfo = {};
	var custInfo = null;
	var authFlag = null;
	var g_query_cust_infos = [];
	//客户鉴权跳转权限
	var _jumpAuthflag="";
	//客户属性
	var _partyProfiles =[];
	//客户属性分页列表
	var _profileTabLists =[];
	
	var _getCustInfo = function() {
		return custInfo;
	};
	var _orderBtnflag="";
	var _form_valid_init = function() {
		 //客户鉴权
		$('#custAuthForm').bind('formIsValid', function(event, form) {
			var param = _choosedCustInfo;
			param.prodPwd = $.trim($("#authPassword").val());
			//param.areaId = 21;//TODO need modify
			//param.accessNumber="11969577";;//TODO need modify
			param.accessNumber=_choosedCustInfo.accessNumber;
			param.authFlag=authFlag;
			$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},"done" : function(response){
					if (response.code == -2) {
						return;
					}
					if(response.data =="false\r\n") {
						$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
						return;
					}
					//判断能否转为json，可以的话返回的就是错误信息
					try {
						var errorData = $.parseJSON(response.data);
						$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack,"error");
						return;
					} catch(e){
						
					}
					custInfo = param;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
					
					OrderInfo.cust = _choosedCustInfo;
					_custAuthCallBack(response);
				},"always":function(){
					$.unecOverlay();
				}
			});
		}).ketchup({bindElement:"custAuthbtn"});
		
		$("#useraddclose").off("click").on("click",function(event){
			easyDialog.close();
			$("#cCustName").val("");
			$("#cCustIdCard").val("");
			authFlag="";
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#custCreateForm"));
		});
		//重置
		$("#custresetBtn").off("click").on("click",function(event){
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#custCreateForm"));
			$("#btncustreset").click();
			
		});
		
		
	};
	//客户类型选择事件
	var _partyTypeCdChoose = function(scope) {
		var partyTypeCd=$(scope).val();
		//客户类型关联证件类型下拉框
		$("#identidiesTypeCd").empty();
		_certTypeByPartyType(partyTypeCd);
		//创建客户证件类型选择事件
		_identidiesTypeCdChoose($("#identidiesTypeCd").children(":first-child"));
		//创建客户确认按钮
		_custcreateButton();

	};
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd){
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
				}
	   if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var certTypedate = data[i];
							$("#identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							
						}
					}
				}
	};
	//客户定位证件类型选择事件
	var _custidentidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==-1){
			$("#p_cust_identityNum").attr("placeHolder","请输入合法的接入号码");
			$("#p_cust_identityNum").attr("data-validate","validate(required:请准确填写接入号码) on(keyup)");
		}else if (identidiesTypeCd==1){
			$("#p_cust_identityNum").attr("placeHolder","请输入合法的身份证号码");
			$("#p_cust_identityNum").attr("data-validate","validate(idCardCheck:请准确填写身份证号码) on(keyup)");
		}else if(identidiesTypeCd==2){
			$("#p_cust_identityNum").attr("placeHolder","请输入合法的军官证");
			$("#p_cust_identityNum").attr("data-validate","validate(required:请准确填写军官证) on(keyup)");
		}else if(identidiesTypeCd==3){
			$("#p_cust_identityNum").attr("placeHolder","请输入合法的护照");
			$("#p_cust_identityNum").attr("data-validate","validate(required:请准确填写护照) on(keyup)");
		}else{
			$("#p_cust_identityNum").attr("placeHolder","请输入合法的证件号码");
			$("#p_cust_identityNum").attr("data-validate","validate(required:请准确填写证件号码) on(keyup)");
		}
		if(identidiesTypeCd!=-1){
			$("#isAppointNum").attr("checked",false);
		}
		_custLookforButton();

	};
	//创建客户证件类型选择事件
	var _identidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==1){
			$("#cCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#cCustIdCard").attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
			$("#cCustIdCard").attr("placeHolder","请输入合法军官证");
			$("#cCustIdCard").attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			$("#cCustIdCard").attr("placeHolder","请输入合法护照");
			$("#cCustIdCard").attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else{
			$("#cCustIdCard").attr("placeHolder","请输入合法证件号码");
			$("#cCustIdCard").attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		_custcreateButton();

	};
	 var _custLookforButton = function() {
	//客户定位查询按钮
	$('#custQueryFirstForm').off().bind('formIsValid', function(event, form) {
		var identityCd="";
		var idcard="";
		var diffPlace="";
		var acctNbr="";
		var identityNum="";
		var queryType="";
		var queryTypeValue="";
		identityCd=$("#p_cust_identityCd").val();
		identityNum=$.trim($("#p_cust_identityNum").val());
		//判断是否是号码或身份证输入
		if(identityCd!=-1){
		 identityCd=$("#p_cust_identityCd").val();
		 authFlag="1";
		}else{
		 authFlag="0";
		}
		if(identityCd==-1){
			acctNbr=identityNum;
			identityNum="";
			identityCd="";
		}else if(identityCd=="acctCd"||identityCd=="custNumber"){
			acctNbr="";
			identityNum="";
			identityCd="";
			queryType=$("#p_cust_identityCd").val();
			queryTypeValue=$.trim($("#p_cust_identityNum").val());

		}
		diffPlace=$("#DiffPlaceFlag").val();
		areaId=$("#p_cust_areaId").val();
		var param = {
				"acctNbr":acctNbr,
				"identityCd":identityCd,
				"identityNum":identityNum,
				"partyName":"",
				"custQueryType":$("#custQueryType").val(),
				"diffPlace":diffPlace,
				"areaId" : areaId,
				"queryType" :queryType,
				"queryTypeValue":queryTypeValue
				
		};
		$.callServiceAsHtml(contextPath+"/cust/queryCust",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					return;
				}
				_queryCallBack(response);
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
				$.unecOverlay();
				$("#usersearchbtn").attr("disabled",false);
			}
		});
	}).ketchup({bindElement:"usersearchbtn"});
	 };
	//创建客户确认按钮
    var _custcreateButton = function() {
	    $('#custCreateForm').off().bind('formIsValid',function(event) {
		_checkIdentity();
	     }).ketchup({bindElement:"createcustsussbtn"});
    };
	//客户查询列表
	var _queryCallBack = function(response) {
		if(response.data =="false\r\n") {
			$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
			return;
		}
		var content$ = $("#custList");
		content$.html(response.data).show();
		$(".userclose").off("click").on("click",function(event) {
			authFlag="";
			$(".usersearchcon").hide();
		});
		if($("#custListTable").attr("custInfoSize")=="1"){
			$(".usersearchcon").hide();
		}
	};
	
	// 客户重新定位
	var _custReset = function() {
		//填单页面
		if(0!=OrderInfo.order.step){
			window.location.reload();
		}
		$("#custQryDiv").show();
		$("#custInfo").hide();
		$("#p_cust_identityNum").val("");
		$("#authPassword").val("");
		authFlag="";
		OrderInfo.boCusts.partyId="";
		//新建客户
		OrderInfo.boCustInfos.name="";
		OrderInfo.boCustIdentities.identityNum="";
		OrderInfo.cust = {
			custId:-1,	
			custName : "",
			areaId:""
		};
		//定位客户
		OrderInfo.boCusts.prodId=-1;
		OrderInfo.boCusts.partyId="";
		OrderInfo.boCusts.partyProductRelaRoleCd="0";
		OrderInfo.boCusts.state="ADD";
		OrderInfo.cust = "";
		//已订购查询是不是查询标志
		order.cust.orderBtnflag="";
		//填单步骤
		OrderInfo.order.step=0;
		if((CONST.getAppDesc()!=0)&&($("#custModifyId").is(":hidden"))){
			$("#custModifyId").show();
		}
		
	};
	
	/**
	 * 客户鉴权
	 */
	var _custAuth = function(scope) {
		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#authPassword").val());
		param.authFlag=authFlag;
		$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				custInfo = param;
				OrderInfo.boCusts.prodId=-1;
				OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
				OrderInfo.boCusts.partyProductRelaRoleCd="0";
				OrderInfo.boCusts.state="ADD";
				OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
				
				OrderInfo.cust = _choosedCustInfo;
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	var _jumpAuth = function() {
		var param = _choosedCustInfo;
		param.authFlag="1";
		$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				custInfo = param;
				OrderInfo.boCusts.prodId=-1;
				OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
				OrderInfo.boCusts.partyProductRelaRoleCd="0";
				OrderInfo.boCusts.state="ADD";
				OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
				
				OrderInfo.cust = _choosedCustInfo;
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	// cust auth callback
	var _custAuthCallBack = function(response) {
		if(authFlag=="0"){
			easyDialog.close();
		}
		$("#custList").hide();
		$("#custQryDiv").hide();
		if($.ketchup)
			$.ketchup.hideAllErrorContainer($("#custCreateForm"));
		var content$ = $("#custInfo");
		content$.html(response.data).show();
		if((OrderInfo.boCusts.partyId!="-1"&&OrderInfo.boCusts.partyId!=""&&OrderInfo.boCusts.partyId!=undefined)&&order.prodModify.lteFlag==true){
			$("#custModifyId").attr("style","display: none;");
		}else{
			$("#custModifyId").attr("style","");
		}
		$("#cCustName").val("");
		$("#cCustIdCard").val("");
		main.home.hideMainIco();
	};
	//客户列表点击
	var _showCustAuth = function(scope) {
		_choosedCustInfo = {
			custId : $(scope).find("td:eq(3)").text(),
			partyName : $(scope).find("td:eq(0)").text(),
			idCardNumber : $(scope).find("td:eq(4)").text(),
			identityName : $(scope).attr("identityName"),
			areaName : $(scope).attr("areaName"),
			areaId : $(scope).attr("areaId"),
			identityCd :$(scope).attr("identityCd"),
			addressStr :$(scope).attr("addressStr"),
			norTaxPayer :$(scope).attr("norTaxPayer"),
			segmentId :$(scope).attr("segmentId"),
			segmentName :$(scope).attr("segmentName")
			
		};
		if(authFlag=="0"){
			//TODO init view 
			easyDialog.open({
				container : 'auth'
			});
			if(order.cust.jumpAuthflag=="0"){
				$("#jumpAuth").show();
			}
			$("#authClose").off("click").on("click",function(event){
				easyDialog.close();
				$("#authPassword").val("");
			});
			}
			else{
				_custAuth(scope);
			}

	};
	//创键客户
	var _showCustCreate = function(scope) {
		tabProfileFlag="1";
		_partyTypeCdChoose($("#partyTypeCd").children(":first-child"));
		_identidiesTypeCdChoose($("#identidiesTypeCd").children(":first-child"));
		_custcreateButton();
		_spec_parm_show();
		$("#partyProfile").attr("style","display:none");
		easyDialog.open({
			container : 'user_add'
		});
	};
	//已订购业务
	var _btnQueryCustProd=function(curPage){
		//收集参数
		var param={};
		if(_choosedCustInfo==null){
			param.custId="";
		}else{
		param.custId=_choosedCustInfo.custId;
		param.areaId =$("#area").attr("areaId");
		//	param.custId="123002382243";//need modify
		}
		if(document.getElementById("accNbrQuery")){
			param.acctNbr=$.trim($("#accNbrQuery").val());
		} else if($("#isAppointNum").attr("checked")=="checked"){
			param.acctNbr=$.trim($("#p_cust_identityNum").val());
		}else {
			param.acctNbr="";
		}
		if(document.getElementById("custPageSize")){
			param.pageSize=$.trim($("#custPageSize").val());
			if(!(/^[1-9]\d*$/.test(param.pageSize))&&(param.pageSize!="")){
				$.alert("提示信息","页码格式不正确，必须为有效数字。");
				return false;
			}
			if(param.pageSize>15){
				$.alert("提示信息","页数大小不能超过15。");
				return false;
			}
		}else {
			param.pageSize="";
		}
		param.curPage=curPage;
		param.DiffPlaceFlag=$("#DiffPlaceFlag").val();
		if(param.custId==null||param.custId==""){
			$.alert("提示","无法查询已订购产品");
			return;
		}
		//请求地址
		var url = contextPath+"/cust/orderprod";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				if (response.code == -2) {
					return;
				}else if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				var content$=$("#orderedprod");
				content$.html(response.data);
				//_linkSelectPlan("#phoneNumListtbody tr",$("#phoneNumListtbody").children(":first-child"));
				//绑定每行合约click事件
				$("#phoneNumListtbody tr").off("click").on("click",function(event){
					var thisTr=this;
					if(1==OrderInfo.order.step&&(!$(thisTr).hasClass("plan_select"))){
						$.confirm("确认","你已重新选择号码，需跳转至上一步，是否确认?",{
							yes:function(){
								_cancel();
								_linkQueryOffer(thisTr);
								OrderInfo.order.step=0;
							},
							no:function(){
								null;
							}
						});
					}else if(2==OrderInfo.order.step&&(!$(thisTr).hasClass("plan_select"))){
						$.confirm("确认","你已重新选择号码，需取消订单，是否确认?",{
							yes:function(){
								SoOrder.orderBack();
								_cancel();
								_linkQueryOffer(thisTr);
								OrderInfo.order.step=0;
							},
							no:function(){
								null;
							}
						});
					}else{
						_linkQueryOffer(this);
					}
					
					});
				
				$("#plan2ndDiv tbody tr").each(function(){$(this).off("click").on("click",function(event){
					var this2Tr=this;
					if(1==OrderInfo.order.step&&(!$(this2Tr).hasClass("plan_select2"))){
						$.confirm("确认","你已重新选择号码，需跳转至上一步，是否确认?",{
							yes:function(){
								_cancel();
								order.cust.linkSelectPlan(this2Tr);event.stopPropagation();
								OrderInfo.order.step=0;
							},
							no:function(){
								null;
							}
						});
					}else if(2==OrderInfo.order.step&&(!$(this2Tr).hasClass("plan_select2"))){
						$.confirm("确认","你已重新选择号码，需取消订单，是否确认?",{
							yes:function(){
								SoOrder.orderBack();
								_cancel();
								order.cust.linkSelectPlan(this2Tr);event.stopPropagation();
								OrderInfo.order.step=0;
							},
							no:function(){
								null;
							}
						});
					}else{
						order.cust.linkSelectPlan(this);event.stopPropagation();
					}
					
					
					});});
				
				$("#phoneNumListtbody").children(":first-child").next("#plan2ndTr").find("#plan2ndDiv tbody tr:first").click();
				$("#phoneNumListtbody").children(":first-child").click();
			}
		});	
	};
	/**
	 * 已订购产品查询
	 */
	var _linkQueryOffer=function(selected){
		//3G用户标识
		$("#is3GCheckbox").off().change(function() { 
			order.prodModify.getChooseProdInfo();
			}); 
		//勾取消
		$("#phoneNumListtbody tr").filter(".plan_select").children(":first-child").html("");
		$("#phoneNumListtbody tr").filter(".plan_select")
			.removeClass("plan_select").next("#plan2ndTr").hide();
		$(selected).addClass("plan_select").next("#plan2ndTr").show();
		//打勾操作
		var nike="<i class='select'></i>";
		$(selected).children(":first-child").html(nike);
		
		$(selected).next("#plan2ndTr").find("#plan2ndDiv tbody tr:first").click();
		
	};
	var _linkSelectPlan=function(selected){
		//二层选择取消
		$("#plan2ndDiv tbody tr").removeClass("plan_select2");
		//勾取消
		$("#plan2ndDiv tbody tr").children(":first-child").next().html("");
		$(selected).addClass("plan_select2");
		//打勾操作
		var nike="<i class='select'></i>";
		$(selected).children(":first-child").next().html(nike);
		order.prodModify.getChooseProdInfo();
		
	};
	//已订购业务
	var _btnQueryCustProdMore=function(param){
		if(OrderInfo.cust.custId==-1){
			$.alert("提示","新建客户无法查询已订购产品！");
			return;
		}
		var curPage=1;
		$("#prodDetail").hide();
		$("#prodInfo").hide();
		$("#prodList").show();
		//$("#orderedprod").show();
		$("#orderContent").show();
		if(order.cust.orderBtnflag==""){//初次查询
			//隐藏菜单
			main.home.hideMainIco();
			_btnQueryCustProd(curPage);
			$("#orderedprod").show();
			$("#arroworder").removeClass();
			$("#arroworder").addClass("arrowup");
			
			$(".main_div.location .s_title").css("border-bottom","0px solid #4f7d3f");
			$("#orderbutton").css({"height":"35px","border-bottom":"1px solid #fff"});
			$("#orderbutton span").css({"color":"#327501"});
			order.cust.orderBtnflag="1";
		}else if(order.cust.orderBtnflag=="0"||$("#orderedprod").is(":hidden")){
			$("#orderedprod").show();
			$("#arroworder").removeClass();
			$("#arroworder").addClass("arrowup");
			
			$(".main_div.location .s_title").css("border-bottom","0px solid #4f7d3f");
			$("#orderbutton").css({"height":"35px","border-bottom":"1px solid #fff"});
			$("#orderbutton span").css({"color":"#327501"});
			order.cust.orderBtnflag="1";
			
		}else{
			$("#orderedprod").hide();
			$("#arroworder").removeClass();
			$("#arroworder").addClass("arrow");
			order.cust.orderBtnflag="0";
			$("#orderbutton").css({"height":"24px","border-bottom":"1px solid #4f7d3f"});
		}
		/*$("#orderbutton").off("click").on("click",function(event){_btnQueryPhoneNumber();event.stopPropagation();});*/
	};
	//定位客户选择地区
	var _chooseArea = function(){
		order.area.chooseAreaTree("order/prepare","p_cust_areaId_val","p_cust_areaId",3);
	};
	//客户信息查询户选择地区
	var _preQueryCustChooseArea = function(){
		order.area.chooseAreaTreeManger("cust/preQueryCust","p_areaId_val","p_areaId",3);
	};
	//异地定位客户选择地区
	var _chooseAllArea = function(){
		order.area.chooseAreaTreeAll("p_cust_areaId_val","p_cust_areaId",3);
	};
	//新建客户选择地区
	var _newCustChooseArea = function(){
		order.area.chooseAreaTree("order/prepare","p_ncust_areaId_val","p_ncust_areaId",3);
	};
	//已订购选择地区
	var _prodChooseArea = function(){
		order.area.chooseAreaTree("order/prepare","prodareaName","prodareaid",3);
		order.prodModify.choosedProdInfo.areaId=$("#prodareaid").val();
	};
	//定位客户证件类型下拉框
	var _initDic = function(){
		var param = {"attrSpecCode":"PTY-0004"} ;
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#p_cust_identityCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
							
						}
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
		_custidentidiesTypeCdChoose($("#p_cust_identityCd").children(":first-child"));
	};
	//客户属性-展示
	var _spec_parm_show = function(){
		var param={};
		$.callServiceAsHtmlGet(contextPath + "/cust/partyProfileSpecList",param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if (response.code == -2) {
					return;
				}
				$("#partyProfile").html(response.data);
				
				
			}
		});	
		
	};
	//客户属性-展示 更多按钮
	var _btnMoreProfile=function(){
		if($("#partyProfile").is(":hidden")){
			$("#partyProfile").show();
			$("#proarroworder").removeClass();
			$("#proarroworder").addClass("arrowup");
			order.cust.changeLabel(0);
		}else{
			$("#partyProfile").hide();
			$("#proarroworder").removeClass();
			$("#proarroworder").addClass("arrow");
			$("#tabProfile0").attr("click","1");
			$("#contactName").attr("data-validate","");
			_custcreateButton();
		}
		/*$("#orderbutton").off("click").on("click",function(event){_btnQueryPhoneNumber();event.stopPropagation();});*/
	};
	//客户信息查询定位客户
	var _queryCust = function(){
		var identityCd="";
		var acctNbr="";
		var identityNum="";
		identityCd=$("#p_cust_identityCd").val();
		identityNum=$.trim($("#p_cust_identityNum").val());
		if(identityNum==""){
			$.alert("提示","请输入证件号码！");
			return;
		}
		//判断是否是号码或身份证输入
		if(identityCd==1){
		 identityCd=$("#p_cust_identityCd").val();
		}
		if(identityCd==-1){
			acctNbr=identityNum;
			identityNum="";
			identityCd="";
		}

		diffPlace=$("#DiffPlaceFlag").val();
		areaId=$("#p_areaId").val();
		var param = {
				"acctNbr":acctNbr,
				"identityCd":identityCd,
				"identityNum":identityNum,
				"partyName":"",
				"custQueryType":$("#custQueryType").val(),
				"diffPlace":diffPlace,
				"areaId" : areaId
		};
		$.callServiceAsHtmlGet(contextPath+"/cust/queryCustAlone", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if (response.code == -2) {
					return;
				}
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#acctList").html(response.data).show();	
				$("#acctDetail").hide();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
		
	};
	//查询客户详情
	var _queryCustDetail = function(_custId){
		var param = {
				partyId : _custId,
				areaId : $("#p_areaId").val()
		};
		$.callServiceAsHtml(contextPath+"/cust/custInfo", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if (response.code == -2) {
					return;
				}
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#acctDetail").html(response.data).show();	
				$("#acctList").hide();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	var _mvnoCustCreate = function(callParam) {
		var param={};
		param.partyName=OrderInfo.cust.partyName;
		param.custId=OrderInfo.cust.custId;
		//定位客户
		param.idCardNumber=OrderInfo.cust.idCardNumber;
		$.callServiceAsHtml(contextPath + "/cust/mvnoCustCreate", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					return;
				}
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				_partyTypeCdChoose($("#cmPartyTypeCd").children(":first-child"));
				_identidiesTypeCdChoose($("#div_cm_identidiesType").children(":first-child"));
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$(".ordercon").show();
				$(".ordertabcon").show();
				$("#step1").show();
				
				$(".ordercon a:first span").text("取 消");
				_form_custInfomodify_btn();
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	var _createCustConfirm = function() {
	createCustInfo = {
			cAreaId : $("#p_ncust_areaId").val(),
			cAreaName : $("#p_ncust_areaId_val").val(),
			cCustName : $.trim($("#cCustName").val()),
			cCustIdCard :  $.trim($("#cCustIdCard").val()),
			cPartyTypeCd : $.trim($("#partyTypeCd  option:selected").val()), //($.trim($("#partyTypeCd  option:selected").val())==1) ? "1100":"1000",
			cPartyTypeName : ($.trim($("#partyTypeCd  option:selected").val())==1) ? "个人客户":"政企客户",
			cIdentidiesTypeCd : $.trim($("#identidiesTypeCd  option:selected").val()),
			cAddressStr :$.trim($("#cAddressStr").val())
		};
	var _boPartyContactInfo = {
			contactAddress : $.trim($("#contactAddress").val()),//参与人的联系地址
	        contactDesc : $.trim($("#contactDesc").val()),//参与人联系详细信息
	        contactEmployer  : $.trim($("#contactEmployer").val()),//参与人的联系单位
	        contactGender  : $.trim($("#contactGender").val()),//参与人联系人的性别
	        contactId : $.trim($("#contactId").val()),//参与人联系信息的唯一标识
	        contactName : $.trim($("#contactName").val()),//参与人的联系人名称
	        contactType : $.trim($("#contactType").val()),//联系人类型
	        eMail : $.trim($("#eMail").val()),//参与人的eMail地址
	        fax : $.trim($("#fax").val()),//传真号
	        headFlag :  $("#headFlag  option:selected").val(),//是否首选联系人
	        homePhone : $.trim($("#homePhone").val()),//参与人的家庭联系电话
	        mobilePhone : $.trim($("#mobilePhone").val()),//参与人的移动电话号码
	        officePhone : $.trim($("#officePhone").val()),//参与人办公室的电话号码
	        postAddress : $.trim($("#postAddress").val()),//参与人的邮件地址
	        postcode : $.trim($("#postcode").val()),//参与人联系地址的邮政编码
	        staffId : OrderInfo.staff.staffId,//员工ID
	        state : "ADD",//状态
	        statusCd : "100001"//订单状态
	};
	OrderInfo.boCustInfos.name=createCustInfo.cCustName;//客户名称
	OrderInfo.boCustInfos.areaId=createCustInfo.cAreaId;//客户地区
	OrderInfo.boCustInfos.partyTypeCd=createCustInfo.cPartyTypeCd;//客户类型
	OrderInfo.boCustInfos.defaultIdType=createCustInfo.cIdentidiesTypeCd;//证件类型
	OrderInfo.boCustInfos.addressStr=createCustInfo.cAddressStr;//客户地址
	OrderInfo.boCustIdentities.identidiesTypeCd=createCustInfo.cIdentidiesTypeCd;//证件类型
	OrderInfo.boCustIdentities.identityNum=createCustInfo.cCustIdCard;//证件号码
	//boPartyContactInfo
	OrderInfo.boPartyContactInfo.contactAddress= _boPartyContactInfo.contactAddress,//参与人的联系地址
	OrderInfo.boPartyContactInfo.contactDesc =_boPartyContactInfo.contactDesc,//参与人联系详细信息
	OrderInfo.boPartyContactInfo.contactEmployer  =_boPartyContactInfo.contactEmployer,//参与人的联系单位
	OrderInfo.boPartyContactInfo.contactGender  =_boPartyContactInfo.contactGender,//参与人联系人的性别
	OrderInfo.boPartyContactInfo.contactId =_boPartyContactInfo.contactId,//参与人联系信息的唯一标识
	OrderInfo.boPartyContactInfo.contactName =_boPartyContactInfo.contactName,//参与人的联系人名称
	OrderInfo.boPartyContactInfo.contactType =_boPartyContactInfo.contactType,//联系人类型
	OrderInfo.boPartyContactInfo.eMail =_boPartyContactInfo.eMail,//参与人的eMail地址
	OrderInfo.boPartyContactInfo.fax =_boPartyContactInfo.fax,//传真号
	OrderInfo.boPartyContactInfo.headFlag =_boPartyContactInfo.headFlag,//是否首选联系人
	OrderInfo.boPartyContactInfo.homePhone =_boPartyContactInfo.homePhone,//参与人的家庭联系电话
	OrderInfo.boPartyContactInfo.mobilePhone =_boPartyContactInfo.mobilePhone,//参与人的移动电话号码
	OrderInfo.boPartyContactInfo.officePhone =_boPartyContactInfo.officePhone,//参与人办公室的电话号码
	OrderInfo.boPartyContactInfo.postAddress =_boPartyContactInfo.postAddress,//参与人的邮件地址
	OrderInfo.boPartyContactInfo.postcode =_boPartyContactInfo.postcode,//参与人联系地址的邮政编码
	OrderInfo.boPartyContactInfo.staffId =_boPartyContactInfo.staffId,//员工ID
	OrderInfo.boPartyContactInfo.state =_boPartyContactInfo.state,//状态
	OrderInfo.boPartyContactInfo.statusCd =_boPartyContactInfo.statusCd//订单状态

	OrderInfo.cust = {
		custId:-1,	
		partyName : createCustInfo.cCustName,
		areaId:createCustInfo.cAreaId
	};
	//客户属性
	OrderInfo.boCustProfiles=[];
	//客户属性节点
	for ( var i = 0; i < order.cust.partyProfiles.length; i++) {
		var partyProfiles = order.cust.partyProfiles[i];
		var profileValue=$("#"+partyProfiles.attrId).val();
		if(""==profileValue||undefined==profileValue){
			profileValue==$("#"+partyProfiles.attrId+"option:selected").val();
		}
		var partyProfiles = {
				partyProfileCatgCd: partyProfiles.attrId,
				profileValue: profileValue,
                state: "ADD"
		};
		if(""!=profileValue&&profileValue!=undefined){
		OrderInfo.boCustProfiles.push(partyProfiles);}
	}
	
	easyDialog.close();
	var param = {};
	param.prodPwd = "";
	param.accessNumber="";
	param.authFlag="1";
	authFlag="";
	param.identityCd=createCustInfo.cIdentidiesTypeCd;
	param.idCardNumber=createCustInfo.cCustIdCard;
	param.partyName=createCustInfo.cCustName;
	param.areaId=createCustInfo.cAreaId;
	param.areaName=createCustInfo.cAreaName;
	param.segmentName=createCustInfo.cPartyTypeName;
	param.identityName=$("#identidiesTypeCd  option:selected").text();
	$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
		"before":function(){
			$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		},"done" : function(response){
			if(response.code != 0) {
				$.alert("提示","客户鉴权失败,稍后重试");
				return;
			}
			if(response.data =="false\r\n") {
				$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
				return;
			}
			
			_custAuthCallBack(response);
		},"always":function(){
			$.unecOverlay();
		}
	});
   };
   //验证证件号码是否存在
	var _checkIdentity = function() {
		createCustInfo = {
				cAreaId : $("#p_ncust_areaId").val(),
				cAreaName : $("#p_ncust_areaId_val").val(),
				cCustName : $.trim($("#cCustName").val()),
				cCustIdCard :  $.trim($("#cCustIdCard").val()),
				cPartyTypeCd : $.trim($("#partyTypeCd  option:selected").val()),
				cIdentidiesTypeCd : $.trim($("#identidiesTypeCd  option:selected").val()),
				cAddressStr :$.trim($("#cAddressStr").val())
			};
		diffPlace=$("#DiffPlaceFlag").val();
		var params = {
				"acctNbr":"",
				"identityCd":createCustInfo.cIdentidiesTypeCd,
				"identityNum":createCustInfo.cCustIdCard,
				"partyName":"",
				"custQueryType":$("#custQueryType").val(),
				"diffPlace":diffPlace,
				"areaId" : createCustInfo.cAreaId
		};
		var url=contextPath+"/cust/checkIdentity";
		var response = $.callServiceAsJson(url, params, {"before":function(){
			$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		}});
		var msg="";
		if (response.code == 0) {
			$.unecOverlay();
			$.confirm("确认","此证件号码已存在,是否确认新建?",{ 
				yes:function(){	
					_createCustConfirm();
				},
				no:function(){
					
				}
			});
		}else{
			$.unecOverlay();
			_createCustConfirm();
		}
	};
	//切换标签
	var _changeLabel = function(labelId){
		if($("#partyProfile").is(":visible")==false){
			$("#partyProfile").show();
		}
		if(labelId=="0"){
			$("#tabProfile0").show();
			$("#cardtab_pro_0").addClass("setcon");
			$("#tabProfile0").attr("click","0");
			$("#contactName").attr("data-validate","validate(required:请准确填写联系人名称) on(blur)").attr("placeholder","请准确填写联系人名称");
			_custcreateButton();
		}else if(($("#tabProfile0").attr("click")=="0")&&($("#contactName").val()=="")){
			$.alert("提示","联系人名称不能为空！","information");
			return;
		}
		for ( var i = 0; i < order.cust.profileTabLists.length; i++) {
			var profileTabLists = order.cust.profileTabLists[i];
			var tabProfileNum=profileTabLists.tabProfileNum;
			var partyProfileCatgTypeCd=profileTabLists.partyProfileCatgTypeCd;
			if(labelId==partyProfileCatgTypeCd){
				$("#"+tabProfileNum).show();
				$("#cardtab_pro_"+partyProfileCatgTypeCd).addClass("setcon");
				$("#tabProfile0").hide();
				$("#cardtab_pro_0").removeClass("setcon");
			}else{
				$("#"+tabProfileNum).hide();
				$("#cardtab_pro_"+partyProfileCatgTypeCd).removeClass("setcon");
			}
		}
		
	};
	//指定号码checkbox
	var _isAppointNum = function(){
		if($("#p_cust_identityCd").val()!=-1){
			$.alert("提示","只能接入号码才能指定号码！","information");
			$("#isAppointNum").attr("checked",false);
			return;
		}
		
		
	};
	//退出二次业务
	var _cancel = function() {		
			//退出二次业务时释放被预占的UIM卡
			var boProd2Tds = OrderInfo.boProd2Tds;
			if(boProd2Tds.length>0){
				for(var n=0;n<boProd2Tds.length;n++){
					var param = {
							numType : 2,
							numValue : boProd2Tds[n].terminalCode
					};
					$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
				}
			}
			//退出二次业务时释放被预占的号码（过滤身份证预占的号码）
			var boProdAns = OrderInfo.boProdAns;
			if(boProdAns.length>0){
				for(var n=0;n<boProdAns.length;n++){
					if(boProdAns[n].idFlag){
						continue;
					}
					var param = {
							numType : 1,
							numValue : boProdAns[n].accessNumber
					};
					$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
				}
				order.service.boProdAn = {};
				order.phoneNumber.resetBoProdAn();
			}			
			//页面变动
			$("#order_fill_content").empty();
			order.prepare.hideStep();
			$("#orderedprod").show();
			$("#order_prepare").show();
	};
	return {
		form_valid_init : _form_valid_init,
		showCustAuth : _showCustAuth,
		showCustCreate : _showCustCreate,
		custAuth : _custAuth,
		getCustInfo : _getCustInfo,
		custReset:_custReset,
		btnQueryCustProd:_btnQueryCustProd,
		btnQueryCustProdMore:_btnQueryCustProdMore,
		jumpAuth : _jumpAuth,
		identidiesTypeCdChoose :_identidiesTypeCdChoose,
		custidentidiesTypeCdChoose :_custidentidiesTypeCdChoose,
		choosedCustInfo :_choosedCustInfo,
		partyTypeCdChoose :_partyTypeCdChoose,
		chooseArea :_chooseArea,
		chooseAllArea : _chooseAllArea,
		newCustChooseArea :_newCustChooseArea,
		prodChooseArea : _prodChooseArea,
		initDic : _initDic,
		btnMoreProfile : _btnMoreProfile,
		partyProfiles : _partyProfiles,
		profileTabLists : _profileTabLists,
		queryCust : _queryCust,
		queryCustDetail :_queryCustDetail,
		mvnoCustCreate : _mvnoCustCreate,
		changeLabel :_changeLabel,
		jumpAuthflag : _jumpAuthflag,
		orderBtnflag :_orderBtnflag,
		custcreateButton :_custcreateButton,
		isAppointNum :_isAppointNum,
		preQueryCustChooseArea :_preQueryCustChooseArea,
		linkSelectPlan:_linkSelectPlan
	};
})();
$(function() {
   order.cust.form_valid_init();
   order.cust.initDic();
});
/**
 *
 * 首页
 * 
 * @author tang
 */
CommonUtils.regNamespace("main", "home");
//首页初始化
$(function(){
	
   /*
	//首页中热卖套餐tab切换
   $(".selser_tab_panel:first").show();
   $(".side_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".side_nav").siblings(".selser_tab_content").find(".selser_tab_panel").eq(index).show().siblings().hide();
		});
	});	
   	
   //首页中最新信息展示tab切换
   $(".news_tab_panel:first").show();
   $(".news_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".news_nav").siblings(".news_tab_content").find(".news_tab_panel").eq(index).show().siblings().hide();
		});
	});
      	
   //首页中最新信息展示tab切换
   $(".phone_list:first").show();
   $(".main_title a").each(function(index){
	 $(this).click(function(){
		 
		 $(".goodsListInfor").eq(index).show().siblings().hide();

		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".news_nav").siblings(".news_tab_content").find(".news_tab_panel").eq(index).show().siblings().hide();
		});
	});
   */

   
});
main.home = (function(){

	//首页请求公告
	var _queryNotice = function(){
		var param = "";
		$.callServiceAsHtmlGet(contextPath + "/main/notice",param, {
			"done" : function(response){
				if(!response){
					response = {};
					response.data='<li><a href="#" class="ft">暂无公告</a></li>';
				}
				$(".news").html(response.data);
				var box=document.getElementById("new"),can=true; 
				box.innerHTML+=box.innerHTML; 
				box.onmouseover=function(){can=false;}; 
				box.onmouseout=function(){can=true;}; 
				void function(){ 
					var stop=box.scrollTop%41==0&&!can; 
					if(!stop) {
						box.scrollTop==parseInt(box.scrollHeight/2)?box.scrollTop=0:box.scrollTop++; 
					}
					setTimeout(arguments.callee, box.scrollTop%41?10:3000);
				}();
			},
			fail:function(response){
				$.unecOverlay();
				//$.alert("提示","公告加载失败，请稍后再试！");
			}
		});
	};
	
	//首页请求已设置的快捷菜单
	var _queryMainShortcut = function(){
		$.callServiceAsHtmlGet(contextPath + "/menu/mainshortcut", {
			"done":function(response){
				$("#faster_ul").html(response.data).show();
			},
			fail:function(response){
				$.unecOverlay();
				//$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	
	var _hideMainIco = function(){
		$(".allsort").removeClass("showme");
		$(".main_quick_div").css("display","none");
		$(".news").css("display","none");
		$(".homecon").css("width","100%").css("margin-left","0px");
		$("#div_main_index").removeClass("main_index").addClass("main_div");
	};
	
	/*****************************************************首页弹出框初始化调用函数*****************************************************/
	var _createDialog = function(){
		$(".allsort").removeClass("showme"); //打开弹出框的时候收起菜单导航
		//登录窗口
		var response = $.callServiceAsJson(contextPath+"/staff/login/isLogin");
		if (response.code !=0){
			login.windowpub.alertLoginWindow(response.data);
			return;
		}
		//快捷菜单设置窗口
		easyDialog.open({
			container : "q_menu_dialog"
		});
		main.home.getMyList();
		main.home.getLv1();
		
		$("#q_menuclose").click(function(){
			easyDialog.close();
			$(".allsort").addClass("showme"); //关闭弹出框的时候重新展开菜单导航
			main.home.queryMainShortcut();
		});
	};

	/*******************************************************快捷菜单设置调用函数*******************************************************/			
		//(弹出框上部分)已设置的快捷菜单
		var _getMyList = function(){
			var param = {
					setShortcut : 1
			};
			$.callServiceAsHtmlGet(contextPath + "/menu/mainshortcut", param, {
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					$("#shortcut_getmylist").html(response.data).show();
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","服务忙，请稍后再试！");
				}
			});
		};
		
		//(弹出框下部分左侧)第一级菜单
		var _getLv1 = function(){
			var url = contextPath+"/menu/inquireLv1";
			$.callServiceAsHtmlGet(url,{
				"done":function(response){
					$("#parentslist").html(response.data).show();
					$("#first_level a:first").addClass("side_nav_hover");
					var parentId = $("#first_level").find("a[class=side_nav_hover]").attr("id");
					main.home.getLv2(parentId);
				}
			});
		};
		
		//点击第一级菜单项目切换第二级菜单
		var _changeParent = function(parentId){
			$("#first_level").find("a[class=side_nav_hover]").removeClass();
			$("#first_level").find("a[id="+parentId+"]").addClass("side_nav_hover");
			main.home.getLv2(parentId);
		};
		
		//(弹出框下部分右侧)第二级菜单
		var _getLv2 = function(parentId){
			var url = contextPath+"/menu/inquireLv2";
			var param = {"parentId":parentId};
			$.callServiceAsHtmlGet(url,param, {
				"before":function(){
					$.ecOverlay("<strong>菜单查询中,请稍等...</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.data == ""){
						$("#son_list").html("<font style='color:#FA3D03;'>您没有权限添加此菜单</font>").show();
					}else {
						$("#son_list").html(response.data).show();
						$("#shortcut_getmylist").find("li").each(function(){
							var menuId=$(this).attr("id");
							var menu$=$("#second_level").find("ul[id="+menuId+"]");
							if(menu$ && menu$.length>0){
								menu$.addClass("ul_sel").removeAttr("onclick").css("cursor", "auto").find("a.close").show();	
							}
						});	
					}
				}
			});
		};
		
		//(弹出框下部分右侧)第三级菜单
		var _getLv3 = function(grandParentId, parentId){
			var url = contextPath+"/menu/inquireLv3";
			var param = {
					"grandParentId":grandParentId,
					"parentId":parentId
			};
			$.callServiceAsHtmlGet(url,param, {
					"before":function(){
					$.ecOverlay("<strong>菜单查询中,请稍等...</strong>");
				},"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.data == ""){
						$("#son_list").html("<font style='color:#FA3D03;'>您没有权限添加此菜单</font>").show();
					}else {
						$("#son_list").html(response.data).show();
						$("#shortcut_getmylist").find("li").each(function(){
							var menuId=$(this).attr("id");
							var menu$=$("#son_list").find("ul[id="+menuId+"]");
							if(menu$ && menu$.length>0){
								menu$.addClass("ul_sel").removeAttr("onclick").css("cursor", "auto").find("a.close").show();
							}
						});	
					}
				}
			});
		};
		
		//快捷菜单添加
		var _addShortcut = function(resourceId,isDrag){
			var ul$=$("#son_list").find("ul[id="+resourceId+"]");
			var dispOrder=1;
			var shortcutList$=$("#shortcut_getmylist");
			if(!isDrag){
				var lis = $("#shortcut_getmylist ul li");
				var lastEle$=shortcutList$.find("li:last");
				if(lis.length >=8){
					$.alert("提示","最多允许添加8个图标,请取消已选图标后再添加！");
					return;
				}
				if(lastEle$.length>0){
					dispOrder=lastEle$.attr("disporder")/1+1;
				}else{
					dispOrder=1;
				}
			}else {
				dispOrder=$("#shortcut_getmylist").find("#"+resourceId).index()+1;
			}	
			var url = contextPath+"/menu/setShortcut";
			var param = {
				    "dispOrder":dispOrder,
					"resourceId":resourceId,
					"actionType":"ADD"
			};
			$.callServiceAsJson(url,param, {
				"before":function(){
					$.ecOverlay("添加中...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.code==0){
						if(!isDrag){
							ul$.addClass("ul_sel").removeAttr("onclick").css("cursor", "auto").find("a.close").show();
							var dragAdd$=changeQuickLi(ul$.clone());
							var darg$=shortcutList$.find("ul").append(dragAdd$.html()).find("#"+dragAdd$.attr("id")).attr("disporder",dispOrder);
//			        		addDragEvent(darg$);
//			        		addDropEvent(darg$);
//			        		ul$.draggable("destroy");
						}
					}else if(response.code==-2){
						$.alertM(response.data);
					}					
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","服务忙，请稍后再试！");
				}
			});
		};
		
		//将待选的菜单ul元素转为已选的快捷菜单li元素
		function changeQuickLi(ulEle$){
			ulEle$.find("a").remove();
			ulEle$.find("div").removeClass("ul_list_img").addClass("quick_top_ul_img");
			ulEle$.find("li").attr("id",ulEle$.attr("id")).attr("onclick","main.home.deleteShortcut("+ulEle$.attr("id")+")");
			return ulEle$;
		}
		
		//快捷菜单删除
		var _deleteShortcut = function(resourceId,isDrag){
			var url = contextPath+"/menu/setShortcut";
			var param = {
					"resourceId":resourceId,
					"actionType":"DEL"
			};
			$.callServiceAsJson(url,param, {
				"before":function(){
					$.ecOverlay("删除中...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.code==0){
						var ulEle$=$("#son_list").find("#"+resourceId);
						if(ulEle$ && ulEle$.length>0){
							ulEle$.removeClass("ul_sel").attr("onclick","main.home.addShortcut("+resourceId+")").css("cursor", "pointer").find("a.close").hide();
						}
						if(!isDrag){
//							addDragEvent(ulEle$,true);
						}
						$("#shortcut_getmylist ul").find("li[id="+resourceId+"]").remove();
					}else if(response.code==-2){
						$.alertM(response.data);
					}	
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","服务忙，请稍后再试！");
				}
			});
		};
		
		function _gotoPrepare(id){
			$("#mktResTypeCd").val($("#"+id).attr("mktResTypeCd"));
			$("#mktResCd").val($("#"+id).attr("mktResCd"));
			$("#mktResId").val($("#"+id).attr("mktResId"));
			$("#brand").val($("#"+id).attr("brand"));
			$("#phoneType").val($("#"+id).attr("phoneType"));
			$("#phoneColor").val($("#"+id).attr("phoneColor"));
			$("#mktName").val($("#"+id).attr("mktName"));
			$("#mktPrice").val($("#"+id).attr("mktPrice"));
			$("#mktPicA").val($("#"+id).attr("mktPicA"));
			$("#oprepare_form").submit();
		}
		
		function _gotoPrepare2(id){
			$("#prodOfferId").val(id);
			$("#oprepare_form2").submit();
		}
		
/**************************	以下为拖拽相关,暂不使用
	
		function sortQuickByUpdate(){
			var shortCutInfo=[];
			$("#shortcut_getmylist").find("ul > li").each(function(i){
				var id=$(this).attr("id");
				if(!!id){
					shortCutInfo.push({"resourceId":$(this).attr("id"),"dispOrder":i+1});
					$(this).attr("disporder",i+1);
				}
			});
			var url = contextPath+"/menu/sortquick";
			$.callServiceAsJson(url,{"shortlist":shortCutInfo}, {
				"before":function(){
					$.ecOverlay("排序中...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
				}
			});
		}
		
		function sortQuickByInsertUpdate(){
			var shortCutInfo=[];
			$("#shortcut_getmylist").find("ul > li").each(function(i){
				var id=$(this).attr("id");
				if(!!id){
					shortCutInfo.push({"resourceId":$(this).attr("id"),"dispOrder":i+1});
				}
			});
			var url = contextPath+"/menu/sortquick";
			$.callServiceAsJson(url,{"shortlist":shortCutInfo}, {
				"before":function(){
					$.ecOverlay("排序中...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
				}
			});
		}
		
		function dragSort(){
			$("#shortcut_getmylist").find("li").draggable({
			      helper: "clone",
			      opacity: .75,
			      zIndex:1011,
			      containment:"#ec-dialog-container",
			      refreshPositions: true, // Performance?
			      revert: "invalid",
			      revertDuration: 300,
			      scroll: true,
			      stop:function(event,ui){
			    	  if($(this).data("drop")){
			    		  sortQuickByUpdate();
			    		  $(this).removeData("drop");
			    	  }
			      }
		   });

			$("#shortcut_getmylist").find("li").droppable({
			        drop: function(e, ui) {
			        		if($(ui.draggable).parent("ul").hasClass("quick_top_ul")){
			        			//右拖
			        			if($(ui.draggable).index()<$(this).index()){
			        				$(this).after($(ui.draggable));
			        			}else{
			        				$(ui.draggable).after($(this));
			        			}
			        			$(ui.draggable).data("drop",true); 
				        		addDropEvent($(ui.draggable));
				        	}else {
				        		var dragAdd$=changeQuickLi($(ui.draggable).clone());
				        		$(this).after(dragAdd$.html());
				        		$(ui.draggable).addClass("ul_sel").find("a.close").show();     
				        		var darg$=$(this).parent().find("#"+dragAdd$.attr("id"));
				        		addDragEvent(darg$);
				        		addDropEvent(darg$);
				        		choseson(dragAdd$.attr("id"),true);
				        	}
			        },
			        hoverClass: "accept",
			        over: function(e, ui) {
			        }
			   });
		}
		
		function dragDelete(){
			$("#son_list").parent("div").droppable({
		        drop: function(e, ui) {
		        	var parentUl$=$(ui.draggable).parent("ul");
		        	if(parentUl$ && parentUl$.length>0 && parentUl$.hasClass("quick_top_ul")){
		        		var id=$(ui.draggable).attr("id");
		        		$(ui.draggable).remove();
		        		var ulEle$=$("#son_list").find("#"+id);
		        		ulEle$.attr("onclick","main.home.choseson("+id+")").removeClass("ul_sel").find("a.close").hide();
		        		cancelshortcut(id,true);
		        		addDragEvent(ulEle$,true);
		        	}
		        },
		        hoverClass: "accept",
		        over: function(e, ui) {
		        	
		        }
		   });
		}
		

		function dragAdd(){

			$("#son_list").find("ul").not(".ul_sel").draggable({
			      helper: "clone",
			      opacity: .75,
			      zIndex:1011,
			      containment:"#ec-dialog-container",
			      refreshPositions: true, // Performance?
			      revert: "invalid",
			      revertDuration: 300,
			      scroll: true,
			      stop:function(event,ui){
			    	  if($(this).hasClass("ul_sel")){
			    		  $(this).draggable("destroy");
			    	  }
			      }
		   });
		}
		
		function addDragEvent(ele$,isDestroy){
			if(isDestroy){
				ele$.draggable({
				      helper: "clone",
				      opacity: .75,
				      zIndex:1011,
				      containment:"#ec-dialog-container",
				      refreshPositions: true, // Performance?
				      revert: "invalid",
				      revertDuration: 300,
				      scroll: true,
				      stop:function(event,ui){
				    	  if($(this).hasClass("ul_sel")){
				    		  $(this).draggable("destroy");
				    	  }
				      }
			   });
			}else{
				ele$.draggable({
				      helper: "clone",
				      opacity: .75,
				      zIndex:1011,
				      containment:"#ec-dialog-container",
				      refreshPositions: true, // Performance?
				      revert: "invalid",
				      revertDuration: 300,
				      scroll: true,
				      stop:function(event,ui){
				    	  if($(this).data("drop")){
				    		  sortQuickByUpdate();
				    		  $(this).removeData("drop");
				    	  }
				      }
			   });
			}
		}
		
		function addDropEvent(ele$){
			ele$.droppable({
		        drop: function(e, ui) {
		        	if($(ui.draggable).parent("ul").hasClass("quick_top_ul")){
		        		//右拖
	        			if($(ui.draggable).index()<$(this).index()){
	        				$(this).after($(ui.draggable));
	        			}else{
	        				$(ui.draggable).after($(this));
	        			}
	        			$(ui.draggable).data("drop",true); 
		        	}else {
		        		var dragAdd$=changeQuickLi($(ui.draggable).clone());
		        		$(this).after(dragAdd$.html());
		        		$(ui.draggable).addClass("ul_sel").find("a.close").show();      
		        		var darg$=$(this).parent().find("#"+dragAdd$.attr("id"));
		        		addDragEvent(darg$);
		        		addDropEvent(darg$);
		        	}
		        },
		        hoverClass: "accept",
		        over: function(e, ui) {
		        	
		        }
		   });
		}
		
**************************/
	
	return {
		queryNotice:_queryNotice,
		queryMainShortcut:_queryMainShortcut,
		getMyList			:_getMyList,
		getLv1				:_getLv1,
		getLv2				:_getLv2,
		getLv3				:_getLv3,
		createDialog		:_createDialog,
		addShortcut			:_addShortcut,
		deleteShortcut		:_deleteShortcut,
		changeParent		:_changeParent,
		gotoPrepare			:_gotoPrepare,
		gotoPrepare2		:_gotoPrepare2,
		hideMainIco			:_hideMainIco
	};
	
})();



/**
 * 终端入口
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("mktRes", "terminal");
/**
 * 终端入口
 */
mktRes.terminal = (function($){
	var _offerSpecId = ""; //保存合约附属ID，合约套餐使用
	var pageSize = 12;
	var termInfo = {};
	/**
	 * 校验是否可以进入下一步
	 */
	var buyChk = {
			buyType : "lj",
			numFlag : false,
			numLevel : "0",
			hyFlag : false,
			hyType: "cfsj",
			hyOfferSpecId: 0,
			hyOfferSpecName: "",
			hyOfferSpecQty: 0,
			hyOfferSpecFt: 0,
			hyOfferRoles:null,
			tsnFlag : false
	};
	_initBuyChk = function() {
		buyChk = {
				buyType : "lj",
				numFlag : false,
				numLevel : "0",
				hyFlag : false,
				hyType: "cfsj",
				hyOfferSpecId: 0,
				hyOfferSpecName: "",
				hyOfferSpecQty: 0,
				hyOfferSpecFt: 0,
				hyOfferRoles:null,
				tsnFlag : false
		};
	};
	/**
	 * 检验buyChk的状态，从而改变订购按钮的样式
	 */
	var _chkState=function(){
		if ("lj"==buyChk.buyType) {
			OrderInfo.actionFlag = 13;
			$("#treaty").hide();
			$("#sel_number").hide();
			$("#lj").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
			$("#hy").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
			
			if(buyChk.tsnFlag) {
				$("#purchaseTermA").removeClass("btna_g").addClass("btna_o");
			}
			
		} else if ("hy"==buyChk.buyType){
			OrderInfo.actionFlag = 14;
			$("#treaty").show();
			$("#sel_number").show();
			$("#lj").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
			$("#hy").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
			
			if(buyChk.numFlag && buyChk.hyFlag && buyChk.tsnFlag) {
				$("#purchaseTermA").removeClass("btna_g").addClass("btna_o");
			} else {
				$("#purchaseTermA").removeClass("btna_o").addClass("btna_g");
			}
			if (buyChk.hyFlag) {
				if (buyChk.hyType == 'cfsj') {
					$("#cfsjA").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");			
				} else {
					$("#gjsfA").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
				}
			} else {
				$("#cfsjA,#gjsfA").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
				$("#choosedOfferPlan").html("");
			}
			if (buyChk.numFlag) {
				$("#cNumA").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
			} else {
				$("#cNumA").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
				$("#choosedNumSpan").html("");
			}
		}
	};
	var _setNumber=function(num, numLevel){
		$("#choosedNumSpan").html(num);
		buyChk.numFlag = true;
		buyChk.numLevel = numLevel;
		_chkState();
	};
	var _init =function(){
		
	};
	
	/**
	 * 按钮查询
	 */
	var _btnQueryTerminal=function(curPage){
		//请求地址
		var url = contextPath+"/mktRes/terminal/list";
		//收集参数
		var param = _buildInParam(curPage);
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				var termList$=$("#order_term_list");
				termList$.show();
				termList$.html(response.data).fadeIn();
			}
		});	
	};
	/**
	 * 链接查询
	 */
	var _linkQueryTerminal = function(loc,selected){
		_exchangeSelected(loc,selected);
		_btnQueryTerminal(1);
	};
	/**
	 * 构造查询条件
	 */
	var _buildInParam = function(curPage){
		var brand = "";
		var phoneType = "";
		var $priceArea = $("#priceArea a[class='selected']");
		var minPrice = $priceArea.attr("minPrice");
		var maxPrice = $priceArea.attr("maxPrice");
		var commCond = $("#commCond").val();
		//处理品牌选择项
		if($("#termManf_small").css("display") != "none"){
			brand = $("#termManf_small a[class='selected']").attr("val");
		}
		if($("#termManf_all").css("display") != "none"){
			brand = $("#termManf_all a[class='selected']").attr("val");
		}
		brand = ec.util.defaultStr(brand);
		if($("#phoneType_small").css("display") != "none"){
			phoneType = $("#phoneType_small a[class='selected']").attr("val");
		}
		if($("#phoneType_all").css("display") != "none"){
			phoneType = $("#phoneType_all a[class='selected']").attr("val");
		}
		phoneType = ec.util.defaultStr(phoneType);
		minPrice = ec.util.defaultStr(minPrice);
		maxPrice = ec.util.defaultStr(maxPrice);
		commCond = ec.util.defaultStr(commCond);
		if(minPrice!=""){
			minPrice=parseInt(minPrice) * 100;
		}
		if(maxPrice!=""){
			maxPrice=parseInt(maxPrice) * 100;
		}
		var attrList = [];
		if(brand != "" && brand != "无限") {
			var attr = {
				"attrId":CONST.TERMINAL_SPEC_ATTR_ID.BRAND,
				"attrValue":brand
			};
			attrList.push(attr);
		}
		if(phoneType != "" && phoneType != "无限") {
			var attr = {
					"attrId":CONST.TERMINAL_SPEC_ATTR_ID.PHONE_TYPE,
					"attrValue":phoneType
			};
			attrList.push(attr);
		}
		return {
			"mktResCd":"",
			"mktResName":commCond,
			"mktResType":"",
			"minPrice":minPrice,
			"maxPrice":maxPrice,
			"pageInfo":{
				"pageIndex":curPage,
				"pageSize":pageSize
			},
			"attrList":attrList
		};
	};
	/**
	 * 点击前定位
	 */
	var _exchangeSelected = function(loc,selected){
		$(loc).removeClass("selected");
		$(selected).addClass("selected");
	};
	/**
	 * 初始化查询条件
	 */
	var _initInParam = function(brand,minPrice,maxPrice,commCond){
		$("#commCond").val(commCond);
		//给搜索输入框绑定回车事件
		$("#commCond").off("keydown").on("keydown", function(e){
			var ev = document.all ? window.event : e; 
			if(ev.keyCode==13) {
				$("#btn_term_search").click();
			}
		});
		var not_exist_ = false;
		$("#termManf_small a").each(function(){
			if($(this).attr("val")==brand){
				$(this).addClass("selected");
				not_exist_ = true;
			}else{
				$(this).removeClass("selected");
			}
		});
		if(!not_exist_){
			$("#termManf_all a").each(function(){
				if($(this).attr("val")==brand){
					$(this).addClass("selected");
				}else{
					$(this).removeClass("selected");
				}
			});
			//_view_termManf("termManf_all");
		}
		$("#priceArea a").removeClass("selected");
		$("#priceArea a[minPrice='"+minPrice+"'][maxPrice='"+maxPrice+"']").addClass("selected");
	};
	/**
	 * 成功获取搜索条件后展示
	 */
	var call_back_success_queryApConfig=function(response){
		var dataLength=response.data.length;
		var PHONE_BRAND;
		var PHONE_PRICE_AREA;
		var PHONE_TYPE;
		var terminalBrandLessHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		var terminalBrandMoreHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		var phonePriceAreaHtml="<a href=\"javascript:void(0);\" class=\"selected\" minPrice=\"\" maxPrice=\"\">不限</a>";
		var phoneTypeLessHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		var phoneTypeMoreHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		//终端品牌
		for (var i=0; i < dataLength; i++) {
			if(response.data[i].PHONE_BRAND){
			  	PHONE_BRAND=response.data[i].PHONE_BRAND;
			  	var brandLength;
			  	if(PHONE_BRAND.length<=6){
			  		brandLength=PHONE_BRAND.length;
			  	}else{
			  		brandLength=6;
			  	}
			  	for(var m=0;m<brandLength;m++){
			  		var phoneBrand=(PHONE_BRAND[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  		terminalBrandLessHtml=terminalBrandLessHtml+"<a href=\"javascript:void(0);\" val="+phoneBrand+">"+phoneBrand+"</a>";
			  	}
			  	if(PHONE_BRAND.length>6){
			  		for(var n=0;n<PHONE_BRAND.length;n++){
			  			var phoneBrand=(PHONE_BRAND[n].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  			terminalBrandMoreHtml=terminalBrandMoreHtml+"<a href=\"javascript:void(0);\" val="+phoneBrand+">"+phoneBrand+"</a>";
			  		}
			  		$("#termManfId_more").show();
			  		$("#termManfId_more").off("click").on("click",function(event){
			  			_viewSmallOrAll("#termManf_all", "#termManf_small");
			  			event.stopPropagation();
			  		});
			  		$("#termManfId_more").toggle(
			  			function(){
			  				$("#termManfId_more a").addClass("btn_less");
			  				$("#termManfId_more a").text("收起");
			  			},
			  			function(){
			  				$("#termManfId_more a").removeClass("btn_less");
			  				$("#termManfId_more a").text("展开");
			  			});
			  		
			  	}
			  	$("#termManf_small").html(terminalBrandLessHtml);
			  	$("#termManf_all").html(terminalBrandMoreHtml);
				continue;
			}
		};
		//终端价格
		for (var i=0; i < dataLength; i++) {
			if(response.data[i].PHONE_PRICE_AREA){
			  	PHONE_PRICE_AREA=response.data[i].PHONE_PRICE_AREA;
			  	for(var m=0;m<PHONE_PRICE_AREA.length;m++){
			  		var  phonePriceArea=(PHONE_PRICE_AREA[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  			var phonePriceAreaArry=phonePriceArea.split("-");
			  			if(phonePriceAreaArry.length!=1){
			  				minPrice=phonePriceAreaArry[0];
			  				maxPrice=phonePriceAreaArry[1];
			  			}else{
			  				phonePriceAreaArry=phonePriceAreaArry.toString();
			  				minPrice=phonePriceAreaArry.substring(0,phonePriceAreaArry.length-2);
			  				maxPrice="\"\"";
			  			}
			  			
			  			phonePriceAreaHtml=phonePriceAreaHtml+"<a href=\"javascript:void(0);\" minPrice="+minPrice+" maxPrice="+maxPrice+">"+phonePriceArea+"</a>";
			  	}
			  	$("#priceArea").html(phonePriceAreaHtml);
				continue;
			}
		};
		//终端类型
		for (var i=0; i < dataLength; i++) {
			if(response.data[i].PHONE_TYPE){
				PHONE_TYPE=response.data[i].PHONE_TYPE;
			  	var typeLength;
			  	if(PHONE_TYPE.length<=6){
			  		typeLength=PHONE_TYPE.length;
			  	}else{
			  		typeLength=6;
			  	}
			  	for(var m=0;m<typeLength;m++){
			  		var phoneType=(PHONE_TYPE[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  		phoneTypeLessHtml=phoneTypeLessHtml+"<a href=\"javascript:void(0);\" val="+phoneType+">"+phoneType+"</a>";
			  	}
			  	if(PHONE_TYPE.length>6){
			  		for(var n=0;n<PHONE_TYPE.length;n++){
			  			var phoneType=(PHONE_TYPE[n].COLUMN_VALUE_NAME).replace(/\"/g, "");
			  			phoneTypeMoreHtml=phoneTypeMoreHtml+"<a href=\"javascript:void(0);\" val="+phoneType+">"+phoneType+"</a>";
			  		}
			  		$("#phoneTypeId_more").show();
			  		$("#phoneTypeId_more").off("click").on("click",function(event){_viewSmallOrAll("#phoneType_all", "#phoneType_small");event.stopPropagation();});
			  	}
			  	$("#phoneType_small").html(phoneTypeLessHtml);
			  	$("#phoneType_all").html(phoneTypeMoreHtml);
				continue;
			}
		};
		//手机终端
		$("#btn_term_search").off("click").on("click",function(event){_btnQueryTerminal(1);event.stopPropagation();});
		$("#termManf_small a[val!='更多']").off("click").on("click",function(event){_linkQueryTerminal("#termManf_small a[val!='更多']",this);});
		$("#termManf_all a[val!='更多']").off("click").on("click",function(event){_linkQueryTerminal("#termManf_all a[val!='更多']",this);});
		$("#priceArea a").off("click").on("click",function(event){_linkQueryTerminal("#priceArea a",this);});
		$("#phoneType_small a[val!='更多']").off("click").on("click",function(event){_linkQueryTerminal("#phoneType_small a[val!='更多']",this);});
		$("#phoneType_all a[val!='更多']").off("click").on("click",function(event){_linkQueryTerminal("#phoneType_all a[val!='更多']",this);});
	};
	/**
	 * 获取搜索条件
	 */
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	/**
	 * 全部展示与部分展示
	 */
	var _viewSmallOrAll = function(small, all){
		if($(small).is(':hidden')){
			$(small).css("display","");
			$(all).css("display","none");
			$(all).parent("dl").css("overflow","auto");
		}else{
			$(small).css("display","none");
			$(all).css("display","");
			$(all).parent("dl").css("overflow","hidden");
		}
	};
	/**
	 * 选择立即订购终端
	 */
	var _selectTerminal=function(obj){
		//mktResTypeCd="${mkt.mktResTypeCd}" mktResCd="${mkt.mktResCd}" brand="${brand}" phoneType="${phoneType}" 
		//phoneColor="${phoneColor}" mktName="${mkt.mktResName}" mktPrice="${(mkt.salePrice)}" mktPicA="${p_pic}" 
		var param = {
				mktResTypeCd :$(obj).attr("mktResTypeCd"),
				mktResCd :$(obj).attr("mktResCd"),
				mktResId :$(obj).attr("mktResId"),
				brand :$(obj).attr("brand"),
				phoneType :$(obj).attr("phoneType"),
				phoneColor :$(obj).attr("phoneColor"),
				mktName : $(obj).attr("mktName"),
				mktPrice : $(obj).attr("mktPrice"),
				mktPicA : $(obj).attr("mktPicA")
		};
		var termDetailUrl = contextPath+"/mktRes/terminal/detail";
		$.callServiceAsHtml(termDetailUrl, param, {
			"before":function(){
				$.ecOverlay("<strong>在处理中,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					$.alert("提示","<br/>处理失败，请稍后重试！");
					return;
				}
				if(response.code != 0) {
					$.alert("提示","<br/>处理失败，请稍后重试！");
					return;
				}
				var termDetail$=$("#order_term_detail");
				$("#order_tab_panel_terminal .order_tab_header").hide();
				$("#order_term_list").hide();
				termDetail$.show();
				termDetail$.html(response.data).fadeIn();
				
				$("#hy").click(function(){
					_initBuyChk();
					buyChk.buyType = 'hy';
					_chkState();
				});
				$("#lj").click(function(){
					_initBuyChk();
					buyChk.buyType = 'lj';
					_chkState();
				});
				$("#cNumA").click(function(){
					_chkState();
					order.prepare.phoneNumDialog('terminal','Y1','01');
				});
				$("#cfsjA").click(function(){
					_selectHy(1);
				});
				$("#gjsfA").click(function(){
					_selectHy(2);
				});
				$("#chkTsnA").click(function(){
					_checkTerminalCode('tsn');
				});
				$("#purchaseTermA").click(function(){
					_purchase();
				});
			}
		});	
	};
	/**
	 * 选择合约
	 */
	var _selectHy=function(agreementType){
		$("#choosedOfferPlan").html("");
		buyChk.hyFlag = false;
		if (agreementType == 1) {
			buyChk.hyType = 'cfsj';
		} else {
			buyChk.hyType = 'gjsf';
		}
		_chkState();
		
		if (!buyChk.numFlag){
			$.alert("提示","请先选号！");
			return;
		}
		
		ec.form.dialog.createDialog({
			"id":"-gjhy",
			"width":980,
			"height":550,
			"initCallBack":function(dialogForm,dialog){
				var param={
						"mktResCd":$("#mktResId").val(),
						"agreementType":agreementType
				};
				var url=contextPath+"/mktRes/terminal/mktplan";
				$.callServiceAsHtmlGet(url,param,{
					"before":function(){
//						$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
					},
					"always":function(){
//						$.unecOverlay();
					},
					"done" : function(response){
						mktRes.terminal.dialogForm=dialogForm;
						mktRes.terminal.dialog=dialog;
						if(!response){
							$.alert("提示","<br/>处理失败，请稍后重试！");
							return;
						}
						if(response.code != 0) {
							if (response.code == 1006){
								$.alert("提示","<br/>查询不到，请稍后重试");
							} else {								
								$.alert("提示","<br/>查询失败，请稍后重试");
							}
							if(mktRes.terminal.dialogForm!=undefined&&mktRes.terminal.dialog!=undefined){
								mktRes.terminal.dialogForm.close(mktRes.terminal.dialog);
							}
							return;
						}
						$("#gjhyContent").html(response.data);
						//显示第一个tab的div
						$("#tab_content_0").show();
						//绑定切换合约页click事件
						$("#contract_nav_agreement li").off("click").on("click",function(event){
							_setPlanOfferTab(this, $(this).attr("itemIndex"));
						});
						//绑定每行合约click事件
						$("#phone_warp_id .contract_tab_content tr:gt(0)").off("click").on("click",function(event){
							_linkQueryOffer(this);
						});
						//绑定确定按钮click事件
						$("#hy_nav_confirm_a").off("click").on("click",function(event){
							_selectPlan();
						});
					}
				});	
			 },
			"submitCallBack":function(dialogForm,dialog){
				buyChk.hyFlag = true;
			},
			"closeCallBack":function(dialogForm,dialog){
//				buyChk.hyFlag = false;
				_chkState();
				var content$=$("#gjhyContent");
				content$.html('');
			}
		});
	};
	/**
	 * 切换合约计划标签页
	 */
	var _setPlanOfferTab=function(selected, id){
		if ($(selected).hasClass("current")) {
			return;
		}
		$("#contract_nav_agreement li").removeClass("current");
		$("#tab_"+id).addClass("current");
		$(".contract_tab_content").hide();
		$("#tab_content_"+id).show();
	};
	/**
	 * 根据合约查询套餐
	 */
	var _linkQueryOffer=function(selected){
		if ($(selected).hasClass("plan_select")) {
			$(selected).removeClass("bg plan_select").next("#plan2ndTr").hide();
			return false;
		}
		$("#phone_warp_id .contract_tab_content tr").filter(".plan_select")
			.removeClass("bg plan_select").next("#plan2ndTr").hide();
		$(selected).addClass("bg").addClass("plan_select");
		var offerSpecId=$(selected).attr("offerSpecId");
		var agreementType = $(selected).attr("agreementType");
		_queryOffer(selected, offerSpecId, agreementType);
	};
	/**
	 * 查询套餐后生成展示内容
	 */
	var _queryOffer=function(selected, offerSpecId, agreementType){
		
		var obj$ = $(selected).next("#plan2ndTr");
		if (obj$.length > 0) {
			obj$.show();
			return;
		}
		
		//调用order.js中的方法获得主销售品规格
		var response = order.service.queryPackForTerm(offerSpecId, agreementType, '');
		if (typeof(response) == "undefined" || response==null){
			$.alert("提示","<br/>未查到套餐，请稍后再试！");
			return;
		}
		if (response.code == -2){
			$.alertM(response.data);
			$.unecOverlay();
			return;
		}
		if(response.code != 0 || response.data.code != "POR-0000"){
			$.alert("提示","<br/>未查到合适套餐，请稍后再试！");
			return;
		}
		var offerHtml="";
		offerHtml+="<tr id='plan2ndTr' class='nocolor'>";
		offerHtml+="<td class='nopadding' colspan='7'>";
		offerHtml+="<div id='plan2ndDiv' class='plan_second_list cashier_tr'>";
		offerHtml+="  <table class='contract_list'>";
		offerHtml+="  <thead>";
		offerHtml+="    <tr>";
		offerHtml+="      <td class='borderLTB'>&nbsp;</td><td>套餐名称</td><td>价格</td>";
		offerHtml+="      <td>流量</td><td>语音分钟数</td><td>WIFI时长</td><td>点对点短信</td>";
		offerHtml+="      <td>点对点彩信</td><td>套餐外流量</td><td>套餐外通话分钟数</td>";
		offerHtml+="    </tr>";
		offerHtml+="  </thead>";
		offerHtml+="  <tbody>";
		var offerInfos = response.data.prodOfferInfos;
		if (offerInfos.length == 0) {
			$.alert("提示","<br/>未查到套餐，请稍后再试！");
		}
		for(var i=0;i<offerInfos.length;i++){
			var offer = offerInfos[i];
			offerHtml+="    <tr offerSpecId='"+offer.offerSpecId+"' ";
			offerHtml+=		"   offerSpecName='"+offer.offerSpecName+"' ";
			offerHtml+=		"   price='"+offer.price+"' >";
			offerHtml+="      <td></td>";
			offerHtml+="      <td style='width:240px;'>"+ec.util.defaultStr(offer.offerSpecName)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.price)+"</td>";
			var inFlux = '';
			if (offer.inFlux >= 1024) {
				inFlux = offer.inFlux / 1024 + 'G';
			} else {
				inFlux = offer.inFlux + 'M';
			}
			offerHtml+="      <td>"+ec.util.defaultStr(inFlux)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.inVoice)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.inWIFI)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.inSMS)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.inMMS)+"</td>";
			offerHtml+="      <td style='width:140px;'>"+ec.util.defaultStr(offer.outFlux)+"</td>";
			offerHtml+="      <td>"+ec.util.defaultStr(offer.outVoice)+"</td>";
			offerHtml+="    </tr>";
		}
		offerHtml+="  </tbody>";
		offerHtml+="  </table>";
		offerHtml+="</div>";
		offerHtml+="</td>";
		offerHtml+="</tr>";
		
		$(selected).after(offerHtml);
		$("#plan2ndDiv tbody tr").off("click").on("click",function(event){_linkSelectPlan(this);event.stopPropagation();});
//		alert(response.data);
	};
	var _linkSelectPlan=function(selected){
		$("#plan2ndDiv tbody tr").removeClass("plan_select2");
		$("#plan2ndDiv tbody tr").children(":first-child").html("");
		var offerSpecId = $(selected).attr("offerSpecId");
		var result = _queryOfferSpec(offerSpecId, selected);
		if (result) {
			$(selected).addClass("plan_select2");
			var nike="<i class='terminalSelect'></i>";
			$(selected).children(":first").html(nike);
		}
	};
	
	var _queryOfferSpec=function(offerSpecId, selected){
		var inParam = {
			"price":$(selected).attr("price"),
			"id" : 'tcnum1',
			"specId" : offerSpecId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.areaId
		};
		order.service.opeSer(inParam); //调用公用弹出层
		return true;
	};
	
	
	/**
	 * 查询销售品构成
	 */
	var _queryOfferSpecOld=function(offerSpecId, selected){
		buyChk.hyOfferSpecQty=0;
		buyChk.hyOfferSpecFt=0;
		var data = $(selected).data("__offerSpec");
		if (typeof(data) == "undefined") {
			var params={
					"offerSpecId":Number(offerSpecId)
			};
			var url = contextPath+"/order/queryOfferSpec";
			var response = $.callServiceAsJson(url,params);
			data = response.data.offerSpec;
			$(selected).data("__offerSpec", data);
			
			if (typeof(response) == "undefined" || response==null){
				$.alert("提示","<br/>未查到销售品构成，请稍后再试！");
				return false;
			}
			if (response.code != "0" || !response.isjson){
				$.alert("提示","<br/>未查到销售品构成，请稍后再试！");
				return false;
			}
			if(response.data.code != "POR-0000"){
				$.alert("提示","<br/>未查到销售品构成，请稍后再试！");
				return false;
			}
		}
		var offerSpec= SoOrder.sortOfferSpec(data);//排序主副卡销售品
				
		var offerRoles=offerSpec.offerRoles;
		
		buyChk.hyOfferRoles=offerRoles;
		
		var i;
		var maxQty = 0;
		var minQty = 0;
		/*
		for(i=0;i<offerRoles.length;i++){
			if(CONST.MEMBER_ROLE_CD.VICE_CARD==offerRoles[i].memberRoleCd){
				maxQty=offerRoles[i].maxQty;
				minQty=offerRoles[i].minQty;
			} else {
				offerRoles[i].selectQty=1;
			}
		}
		*/
		/*卞贤伟 2014-0307修改 控制副卡个数*/
		for(i=0;i<offerRoles.length;i++){
			var offerRole = offerRoles[i];
			if(CONST.MEMBER_ROLE_CD.VICE_CARD==offerRoles[i].memberRoleCd){
				if(offerRole.roleObjs){
					$.each(offerRole.roleObjs,function(){
						if(this.objType == 2){
							maxQty = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
							minQty = this.minQty<0?"0":this.minQty;//主卡的最大数量
						}
					});
				}
			} else {
				offerRoles[i].selectQty=1;
			}
		}
		offerSpec.offerRoles=offerRoles;
		//填OrderInfo
		OrderInfo.offerSpec = offerSpec;
		
		//付费类型 ：初始化buyChk.hyOfferSpecFt
		buyChk.hyOfferSpecFt=offerSpec.feeType;
		
		//如果没有副卡
		if (maxQty == 0) {
			return true;
		}
		
		//副卡个数
		var cPanel = $("#termOfferSpecViceLi");
		cPanel.find("input").val(minQty);
		cPanel.find(".addinfo").html("&nbsp;&nbsp;&nbsp;"+minQty+"-"+maxQty+"（张） ");
		cPanel.find("a:first").off("click").on("click", function(event){
			var num = parseInt(cPanel.find("input").val());
			if (num <= minQty) {
				$.alert("提示","副卡数量已经达到最小值，不能再减少。");
				return;
			} else {
				cPanel.find("input").val(num-1);
			}
		});
		cPanel.find("a:last").off("click").on("click", function(event){
			var num = parseInt(cPanel.find("input").val());
			if (num >= maxQty) {
				$.alert("提示","副卡数量已经达到最大值，不能再增加。");
				return;
			} else {
				cPanel.find("input").val(num+1);
			}
		});
		easyDialog.open({
			container : 'termOfferSpec'
		});
		$("#termOfferSpecClose").off("click").on("click",function(event){
			easyDialog.close();
		});
		$("#termOfferSpecCancel").off("click").on("click",function(event){
			easyDialog.close();
		});
		$("#termOfferSpecConfirm").off("click").on("click",function(event){
			var selectQty = cPanel.find("input").val();
			buyChk.hyOfferSpecQty = selectQty;
			for(i=0;i<offerRoles.length;i++){
				if(CONST.MEMBER_ROLE_CD.VICE_CARD==offerRoles[i].memberRoleCd){
					offerRoles[i].selectQty=selectQty;
				} else {
					offerRoles[i].selectQty=1;
				}
			}
			OrderInfo.offerSpec.offerRoles = offerRoles;
			
			easyDialog.close();
		});
		return true;
	};
	/**
	 * 在合约套餐窗口选择套餐
	 */
	var _selectPlan=function(){
		//搜索是否有
		var offerSpec=$("#plan2ndDiv tbody tr[class='plan_select2']");
		if (offerSpec.length!=1) {
			$.alert("提示","请选择一个套餐！");
			return;
		}
		//填入合约信息
		var agreement = offerSpec.parents("#plan2ndTr").prev();
		if (agreement.length!=1) {
			$.alert("提示","请选择一个合约！");
			return;
		}
		mktRes.terminal.offerSpecId = agreement.attr("offerSpecId");
		buyChk.hyFlag = true;
		buyChk.hyOfferSpecId=offerSpec.attr("offerSpecId");
		buyChk.hyOfferSpecName=offerSpec.attr("offerSpecName");
//		order.service.setOfferSpec(1, Number(buyChk.hyOfferSpecQty));
		
		_chkState();
		$("#choosedOfferPlan").html(agreement.attr("offerSpecName"));
		if(mktRes.terminal.dialogForm!=undefined&&mktRes.terminal.dialog!=undefined){
			mktRes.terminal.dialogForm.close(mktRes.terminal.dialog);
		}
	};
	/**
	 * 增加附属销售品（填入合约信息）
	 */
	var _addAttachParam=function(prodId,offerSpecId,offerSpecName){
		var param = {
			offerSpecId:offerSpecId,
			prodId:prodId
		};
		var orderedOfferSpecIds = [];
		var specList = AttachOffer.getSpecList(prodId);
		if(specList!=undefined){
			for (var i = 0; i < specList.length; i++) {  //遍历开通附属
				if(specList[i].offerSpecId!=offerSpecId&&specList[i].isdel!="Y"){
					orderedOfferSpecIds.push(specList[i].offerSpecId);
				}
			}	
		}
		var offerList = AttachOffer.getOfferList(prodId);
		if(offerList!=undefined){
			for (var i = 0; i < offerList.length; i++) { //遍历已订购附属
				if(offerList[i].offerSpecId!=offerSpecId && offerList[i].isdel!="Y"){
					orderedOfferSpecIds.push(offerList[i].offerSpecId);
				}
			}
		}
		if(orderedOfferSpecIds.length>0){
			param.orderedOfferSpecIds = orderedOfferSpecIds;
		}
		var response = $.callServiceAsJsonGet(contextPath+"/offer/queryExcludeDepend",{strParam:JSON.stringify(param)},{});
		if(response.code == 0){
			AttachOffer.parseRuleData(response.data,offerSpecId,prodId,offerSpecName);	
			return true;
		}else if(response.code == 1){
			$.alert("提示","<strong>"+response.errorsList[0].msg+"("+response.errorsList[0].code+")</strong>");
		}else{
			$.alert("提示","数据查询异常，请稍后重试！");
		}
		return false;
	};
	/**
	 * 终端串号校验
	 */
	var _checkTerminalCode=function(id){
		termInfo = {};
		buyChk.tsnFlag = false;
		_chkState();
		$("#tsn_hid").val("");
		
		var tc = $("#"+id).val();
		if(tc == "")
			return ;
		var param = {
			"instCode" : tc,
			"mktResId" : $("#mktResId").val(),
			"mktResTypeCd" : $("#mktResType").val(),
			"orderNo" : ""
		};
		var url = contextPath+"/mktRes/terminal/checkTerminal";
		$.callServiceAsJson(url,param,{
			"before":function(){
//				$.ecOverlay("<strong>终端串码校验中,请稍等...</strong>");
			},"always":function(){
//				$.unecOverlay();
			},
			"done" : function(response){
				if (response && response.code == -2) {
					$.alertM(response.data);
				} else if(response&&response.data&&response.data.code == 0) {
					if(response.data.statusCd==CONST.MKTRES_STATUS.USABLE){
						$.alert("提示","<br/>此终端串号可以使用");
						//记录终端串码
//						SoOrder.order.item.mhk.sn  = tc;
						buyChk.tsnFlag = true;
						_chkState();
						$("#tsn_hid").val(tc);
						termInfo = response.data;
						
					}else{
						$.alert("提示",response.data.message);
					}
				}else if(response && response.data && response.data.message
						&& response.data.code == 1){
					$.alert("提示", response.data.message);
				}else{
					$.alert("提示","<br/>校验失败，请稍后重试！");
				}
			}
		});
	};
	
	/**
	 * 购买手机，判断是否满足条件，合约机跳往填单，裸机直接算费
	 */
	var _purchase=function(){
		if ("lj"==buyChk.buyType) {
			if (!buyChk.tsnFlag) {
				$.alert("提示","<br/>请先校验终端串号。");
				return;
			}
			var apCharge = $("#price").val() / 100;
			var coupons = [{
				couponUsageTypeCd : "3", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : termInfo.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : termInfo.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : apCharge, //物品价格
				couponInstanceNumber : termInfo.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : CONST.CUST_COUPON_SALE, //客户ID
				prodId : 0, //产品ID
				offerId : 0, //销售品实例ID
				state : "ADD", //动作
				relaSeq : "" //关联序列	
			}];
			//如果是老客户或新建客户
			if (OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != "") {
				coupons[0].partyId = OrderInfo.cust.custId;
			}
			OrderInfo.actionTypeName = "订购";
			OrderInfo.businessName = $("#mktResName").val();
			var data = {};
			data.busiObj = {
				instId : termInfo.mktResId //业务对象实例ID
			};
			data.boActionType = {
				actionClassCd : CONST.ACTION_CLASS_CD.MKTRES_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.COUPON_SALE
			};
			data.coupons = coupons;
			//订单提交
			SoOrder.submitOrder(data);
			return;
		} else if ("hy"==buyChk.buyType) {
			if (!buyChk.numFlag) {
				$.alert("提示","<br/>请先选号。");
				return;
			} else if (!buyChk.hyFlag) {
				$.alert("提示","<br/>请先选择合约套餐。");
				return;
			} else if (!buyChk.tsnFlag) {
				$.alert("提示","<br/>请先校验终端串号。");
				return;
			}
			//校验客户是否已定位
			if (OrderInfo.cust.custId==undefined||OrderInfo.cust.custId=="") {
				$.alert("提示","<br/>在订购套餐之前请先进行客户定位！");
				return;
			}
			//构造参数，填单
		} else {
			return;
		}
		var coupon = {
			couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
			inOutTypeId : "1",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : termInfo.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
			couponNum : 1, //物品数量
			storeId : termInfo.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : $("#price").val() / 100, //物品价格
			couponInstanceNumber : termInfo.instCode, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId : -1, //产品ID
			offerId : -1, //销售品实例ID
			attachSepcId : mktRes.terminal.offerSpecId,
			state : "ADD", //动作
			relaSeq : "" //关联序列	
		};
		OrderInfo.attach2Coupons = [];
		OrderInfo.attach2Coupons.push(coupon);
		var param = {
			boActionTypeCd : 'S1',
			boActionTypeName : "订购",
			offerSpec : OrderInfo.offerSpec,
			offerSpecId : buyChk.hyOfferSpecId,
			offerSpecName : buyChk.hyOfferSpecName,
			viceCardNum : Number(buyChk.hyOfferSpecQty),
			feeType : buyChk.hyOfferSpecFt,
			offerNum : 1,
			type : 2,//1购套餐2购终端3选靓号
			actionFlag : OrderInfo.actionFlag,
			terminalInfo : {
				terminalName : $("#mktResName").val(),
				terminalCode : $("#tsn_hid").val()
			},
			offerRoles : buyChk.hyOfferRoles
		};
		OrderInfo.actionTypeName = "订购";
		SoOrder.builder(); //初始化订单数据
		order.main.buildMainView(param);
	};
	
	return {
		init:_init,
		btnQueryTerminal:_btnQueryTerminal,
		initInParam:_initInParam,
		queryApConfig:_queryApConfig,
		selectTerminal:_selectTerminal,
		setNumber:_setNumber,
		offerSpecId:_offerSpecId
	};
})(jQuery);

//初始化
$(function(){
	//mktRes.terminal.init();
});
/**
 * 终端入口
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("mktRes", "terminal", "exchange");
/**
 * 终端入口
 */
mktRes.terminal.exchange = (function($){
	var _init = function(){
		$("#bt_terminalQry").off("click").on("click", function(){
			_terminalQuery($("#p_qryNumber").val());
		});
	};
	// 根据终端串码查询终端信息
	var _terminalQuery = function(instCode){
		if (instCode == "") {
			$.alert("提示","<br/>请先输入终端串码。");
			return;
		}
		var url = contextPath+"/mktRes/terminal/queryCoupon";
		var param = {
			"couponNumber" : instCode
		};
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				$("#coupon_tab tbody").html('');
				$("#terminalTr").removeData("couponInfo");
				
				if(response.code == -2) {
					$.alertM(response.data);
					return;
				} else if(response.code != 0) {
					$.alert("提示","<br/>查询失败,请稍后重试。");
					return;
				}
				var data = response.data;
				if (data.code != 0) {
					$.alert("提示",data.msg);
					return;
				}
				//判断id是否存在
				if (data.id == undefined) {
					$.alert("提示", "返回的数据中缺少ID，请确认。");
					return;
				}
				if (data.instInfo && data.instInfo.length > 0 && data.instInfo[0].prodId != undefined) {
					data.instFlag = true;
				} else {
					data.instFlag = false;
				}
				
				var html = '';
				html += '<tr id="terminalTr">';
				html += '<td>'+ data.couponNumber +'</td>';
				html += '<td>'+ data.couponName +'</td>';
				html += '<td>'+ data.channelName +'</td>';
				html += '<td>'+ data.staffName +'</td>';
				html += '<td>'+ data.statusDate +'</td>';
				html += '<td>'+ data.olId +'</td>';
				if (data.instFlag) {
					html += '<td>';
					html += '产品信息：' + data.instInfo[0].prodSpecName + ' - ' + data.instInfo[0].accessNbr + '<br/>';
					html += '销售品信息：' + data.instInfo[0].offerSpecName;
					html += '</td>';
				} else {
					html += '<td></td>';
				}
				var ahtml = '';
				ahtml += '<a id="exchangeTerminalA" class="purchase">换货</a>';
				if (!data.instFlag) {
					ahtml += '<a id="returnTerminalA" class="purchase">退货</a>';
				}
				html += '<td>'+ ahtml +'</td>';
				html += '</tr>';
				
				$("#coupon_tab tbody").html(html);
				$("#terminalTr").data("couponInfo", data);
				
				$("#exchangeTerminalA").off("click").on("click", function(){
					_exchangePrepare($("#terminalTr").data("couponInfo"));
				});
				$("#returnTerminalA").off("click").on("click", function(){
					_returnTerminal($("#terminalTr").data("couponInfo"));
				});
			}
		});
	};
	
	var _exchangePrepare = function() {
		ec.form.dialog.createDialog({
			"id":"-exchange-terminal",
			"width":450,
			"height":180,
			"initCallBack":function(dialogForm,dialog){
				
				$("#exchangeConfirmA").off("click").on("click",function(){
					var oldData = $("#terminalTr").data("couponInfo");
					var result = _checkCouponInstNbr(oldData);
					if (result) {
						dialogForm.close(dialog);
						_exchangeTerminal(oldData, result);
					}
				});
				$("#exchangeCancelA").off("click").on("click",function(){
					dialogForm.close(dialog);
				});
			},
			"submitCallBack":function(dialogForm,dialog){
				
			}
		});
	};
	
	var _checkCouponInstNbr = function(data) {
		var couponInstNbr = $("#couponInstNbrInp").val();
		if (couponInstNbr == "") {
			$.alert("提示","<br/>请输入有效的终端串码。");
			return;
		}
		var param = {
			"instCode" : couponInstNbr,
			"mktResId" : "" + data.couponId,
			"mktResTypeCd" : "" + data.couponTypeCd,
			"orderNo" : ""
		};
		var url = contextPath+"/mktRes/terminal/checkTerminal";
		$.ecOverlay("<strong>终端串码校验中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param,{});
		$.unecOverlay();
		if(response.code == -2) {
			$.alertM(response.data);
		} else if (response.code != 0) {
			$.alert("提示","<br/>校验失败请稍后再试。");
		} else {
			if(response.data) {
				if(response.data.code == 0) {
					if(response.data.statusCd==CONST.MKTRES_STATUS.USABLE){
//						$.alert("提示","<br/>此终端串号可以使用");
						//返回新的终端信息
						return response.data;
						
					}else{
						$.alert("提示",response.data.message);
					}
				}else if(response.data.code == 1
						&& response.data.message){
					$.alert("提示", response.data.message);
				}
			} else {
				$.alert("提示","<br/>校验失败请稍后再试。");
			}
		}
	};
	
	var _exchangeTerminal = function(oldData, newData) {
//		if (oldData.couponId != newData.STANDARD_CD) {
//			$.alert("提示","<br/>终端换货时终端规格不相符");
//			return;
//		}
		OrderInfo.actionTypeName = "退换";
		OrderInfo.businessName = oldData.couponName;
		OrderInfo.actionFlag = 18; // 终端换货
		var coupons = [];
		var oldCoupon = {
			id: oldData.id,
			couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
			inOutTypeId : "2",  //出入库类型
			inOutStatusId : "1",  //未发送
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : oldData.couponId, //物品ID
			couponinfoStatusCd : "R", //物品处理状态
			chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
			couponNum : 1, //物品数量
			storeId : oldData.storeId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : oldData.realAmount / -100, //物品价格
			couponInstanceNumber : oldData.couponNumber, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : CONST.CUST_COUPON_SALE, //客户ID
			prodId : 0, //产品ID
			offerId : 0, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列
			isOld : "Y" //旧终端
		};
		var newCoupon = {
			id: -1,
			couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
			inOutTypeId : "1",  //出入库类型
			inOutStatusId : "1",  //未发送
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : newData.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
			couponNum : 1, //物品数量
			storeId : newData.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : oldData.realAmount / 100, //旧的物品的价格
			couponInstanceNumber : newData.instCode, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : CONST.CUST_COUPON_SALE, //客户ID
			prodId : 0, //产品ID
			offerId : 0, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "", //关联序列
			isOld : "N" //新终端
		};
		var data = {};
		if (oldData.instFlag) {
			oldCoupon.prodId = oldData.instInfo[0].prodId;
			oldCoupon.offerId = oldData.instInfo[0].offerId;
			newCoupon.prodId = oldData.instInfo[0].prodId;
			newCoupon.offerId = oldData.instInfo[0].offerId;
			data.busiObj = {
				"accessNumber": oldData.instInfo[0].accessNbr,
                "instId": oldData.instInfo[0].offerId,
                "isComp": "N",
                "objId": oldData.instInfo[0].offerSpecId,
                "offerTypeCd": "1"
	        };
			data.boActionType = {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.EXCHANGE_COUPON
			};
			//4G需要加载全量信息
			if(CONST.getAppDesc()==0){
				OrderInfo.order.soNbr = UUID.getDataId();
				var instParam = {
					areaId : OrderInfo.staff.areaId,
					acctNbr : oldData.instInfo[0].accessNbr,
					custId : '',
					soNbr : OrderInfo.order.soNbr,
					instId : oldData.instInfo[0].prodId,
					type : "2"
				};
				if (!query.offer.invokeLoadInst(instParam)) {
					return false;
				}
			}
		} else {
			data.busiObj = {
				"instId": oldData.id,
				"isComp": "N",
				"objId": oldData.couponId
	        };
			data.boActionType = {
				actionClassCd : CONST.ACTION_CLASS_CD.MKTRES_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.EXCHANGE_COUPON
			};
		}
		
		coupons.push(oldCoupon);
		coupons.push(newCoupon);
		data.coupons = coupons;
		//订单提交
		SoOrder.submitOrder(data);
	};
	
	var _returnTerminal = function(couponInfo){
		OrderInfo.actionTypeName = "退换";
		OrderInfo.businessName = couponInfo.couponName;
		OrderInfo.actionFlag = 17; // 终端退货
		var coupons = [{
			id: couponInfo.id,
			couponUsageTypeCd : "3", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
			inOutTypeId : "2",  //出入库类型
			inOutStatusId : "1",  //未发送
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : couponInfo.couponId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
			couponNum : 1, //物品数量
			storeId : couponInfo.storeId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : couponInfo.realAmount / -100, //物品价格
			couponInstanceNumber : couponInfo.couponNumber, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : CONST.CUST_COUPON_SALE, //客户ID
			prodId : 0, //产品ID
			offerId : 0, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列	
			isOld : "Y" //旧终端
		}];
		var data = {};
		data.busiObj = {
			"instId": couponInfo.id,
			"isComp": "N",
			"objId": couponInfo.couponId
        };
		data.boActionType = {
			actionClassCd : CONST.ACTION_CLASS_CD.MKTRES_ACTION,
			boActionTypeCd : CONST.BO_ACTION_TYPE.RETURN_COUPON
		};
		data.coupons = coupons;
		//订单提交
		SoOrder.submitOrder(data);
	};
	
	return {
		init : _init
	};
})(jQuery);

//初始化
$(function(){
	mktRes.terminal.exchange.init();
});

CommonUtils.regNamespace("order", "area");

var ztree=null;
var areaType = null ;
var areaNameVal = "" ;

/**
 *地区字典.
 */
order.area = (function(){
	
	//获取查询类维度权限
	var _chooseAreaTreeManger = function(_type,_areaName,_areaId,_areaLeve){
		_chooseAreaTreeMain(_type,_areaName,_areaId,_areaLeve,contextPath + '/orderQuery/areaTreeManger');
	};
	//获取业务类维度权限
	var _chooseAreaTree = function(_type,_areaName,_areaId,_areaLeve){
		_chooseAreaTreeMain(_type,_areaName,_areaId,_areaLeve,contextPath + '/orderQuery/areaTree');
	};
	var _chooseAreaTreeMain = function(_type,_areaName,_areaId,_areaLeve,url){
		if(!login.windowpub.checkLogin()){
			return ;
		}
		var areaId = _areaId;
		var areaName = _areaName ;
		$.ligerDialog.open({
			width:350,
			height:350,
			title:'请选择地区(*不可选)',
			url:url + '?areaType='+_type+"&areaLeve="+_areaLeve,
			buttons: [ { text: '确定', onclick: function (item, dialog) { 
						if (!ztree) {
							//alert("无可选地区！");
							return;
						}
						var node=ztree.getSelected();
						if(node){
							if(node.data.isAllRegionFlag=="Y"){
								$('#'+areaId).val(node.data.commonRegionId);
								$('#'+areaId).attr("areaCode",node.data.regionCode);
								$('#'+areaName).val(areaNameVal);
								dialog.close();
								//产品通用查询页面更改地区时初始化查询条件
								if(_type=="prod/preProdQuery"){
									if(product.query.areaId!=$("#p_areaId").val()){
										if($("#custName").val()!="" || $("#num").val()!=""){
											$.alert("提示","地区已变更，请重新定位产品");
										}
										$("#prodList").html("");
										$("#custName").val("").attr("name", "");
										$("#num").val("");
										product.query.areaId = $("#p_areaId").val();	
									}
								}
								//帐户详情查询页面更改地区时初始化查询条件
								if(_type=="acct/preQueryAccount"){
									if(account.query.areaId!=$("#p_areaId").val()){
										if($("#custName").val()!="" || $("#num").val()!=""){
											$.alert("提示","地区已变更，请重新定位帐户");
										}
										$("#acctList").html("");
										$("#custName").val("").attr("name", "");
										$("#num").val("");
										account.query.areaId = $("#p_areaId").val();	
									}
								}
							}else{
								alert("当前地区不可选！");
							}
						}else{
							alert("请选择地区！");
						}
					} },
			           { text: '取消', onclick: function (item, dialog) { dialog.close(); } } ] 	
		});
	};
	
	//获取全部地区维度
	var _chooseAreaTreeAll = function(_areaName,_areaId,_areaLeve){
		if(!login.windowpub.checkLogin()){
			return ;
		}
		var areaId = _areaId;
		var areaName = _areaName ;
		$.ligerDialog.open({
			width:350,
			height:350,
			title:'请选择地区',
			url:contextPath + '/orderQuery/areaTreeAll?areaLeve='+_areaLeve,
			buttons: [ { text: '确定', onclick: function (item, dialog) { 
						if(!ztree) {
							return;
						}
						var node=ztree.getSelected();
						if(node){
							$('#'+areaId).val(node.data.commonRegionId);
							$('#'+areaId).attr("areaCode",node.data.regionCode);
							$('#'+areaName).val(areaNameVal);
							dialog.close();
						}else{
							alert("请选择地区！");
						}
					} },
			           { text: '取消', onclick: function (item, dialog) { dialog.close(); } } ] 	
		});
	};
	
	//获取计费功能地区维度与省份编码（原计费使用，已弃用）
	var _flatAreaPageDialog=null;
	var nameId;
	var valId;
	var _flatAreaPage = function(val_id,name_id){
		nameId=name_id;
		valId=val_id;
		_flatAreaPageDialog=$.ligerDialog.open({
			width:400,
			height:320,
			title:'请选择地区',
			url:contextPath + '/orderQuery/tree_flat',
			buttons: [ 
			           { text: '取消',onclick: function (item, dialog) { dialog.close(); } } ]
			           
		});
	};
	var _areaChecked=function( val,name){
		if(_flatAreaPageDialog!=null){
			if(valId&&$("#"+valId)){
				$("#"+valId).val(val);
			}
			if(nameId&&$("#"+nameId)){
				$("#"+nameId).val(name);
			}
			_flatAreaPageDialog.close();
		}
	};
	var _dicInitEnd = function(){
		$.unecOverlay();
		$("#dic_mess").hide();
		alert(111);
		$("#commonRegionTree").show();
	};
	
	return {
		areaChecked:_areaChecked,
		flatAreaPage:_flatAreaPage,
		chooseAreaTree:		_chooseAreaTree,
		chooseAreaTreeAll:	_chooseAreaTreeAll,
		chooseAreaTreeManger:_chooseAreaTreeManger,
		dicInitEnd:_dicInitEnd
	};
	
})();


/**
 * 对缓存数据操作
 * 
 * @author wukf
 * date 2014-01-15
 */
CommonUtils.regNamespace("CacheData");

/** 缓存数据对象*/
CacheData = (function() {
	
	//获取参数内容
	var _getParamContent = function(prodId,spec,flag){
		var content = '<form id="paramForm">' ;
		if(flag==2){  //功能产品规格参数
			if(isArray(spec.prodSpecParams)){ //拼接功能产品规格参数
				for (var i = 0; i < spec.prodSpecParams.length; i++) { 
					var param = spec.prodSpecParams[i];
					if(param.value==undefined){
						param.value = "";
					}
					content += _getStrByParam(prodId,param,param.itemSpecId,param.value);
				}
			}
		}else if(flag==3){ //功能产品实例参数
			if(isArray(spec.prodSpecParams)){ //拼接功能产品规格参数
				//spec.prodSpecParams = sortParam(spec.prodSpecParams);
				for (var i = 0; i < spec.prodSpecParams.length; i++) { 
					var param = spec.prodSpecParams[i];
					if(isArray(spec.prodInstParams)){ //拼接功能产品实例参数
						$.each(spec.prodInstParams,function(){
							if(this.itemSpecId==param.itemSpecId){
								param.value = this.value;
							}
						});
					}
					if(param.value==undefined){
						param.value = "";
					}
					content += _getStrByParam(prodId,param,param.itemSpecId,param.value);
				}
			}
		} else if(flag==1){  //销售品实例参数
			if(spec.offerSpec!=undefined){
				if(isArray(spec.offerSpec.offerSpecParams)){
					var offerSpecParams = spec.offerSpec.offerSpecParams;//sortParam(spec.offerSpec.offerSpecParams);
					$.each(offerSpecParams,function(){
						var param = this;
						if(isArray(spec.offerParamInfos)){ //销售品实例参数
							$.each(spec.offerParamInfos,function(){  
								if(this.itemSpecId==param.itemSpecId){
									param.value = this.value;
								}
							});
						}
						content += _getStrByParam(prodId,this,this.itemSpecId,this.value);
					});
				}
			}
		}else {  //销售品规格参数
			if(isArray(spec.offerSpecParams)){
				var offerSpecParams = spec.offerSpecParams;//sortParam(spec.offerSpecParams);
				$.each(offerSpecParams,function(){
					content += _getStrByParam(prodId,this,this.itemSpecId,this.value);
				});
			}
			/*if(spec.offerRoles!=undefined && spec.offerRoles.length>0){
				for (var i = 0; i < spec.offerRoles.length; i++) {
					var offerRole = spec.offerRoles[i];
					for (var j = 0; j < offerRole.roleObjs.length; j++) {
						var roleObj = offerRole.roleObjs[j];
						if(roleObj.prodSpecParams !=undefined && roleObj.prodSpecParams.length>0){
							for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
								content += _getStrByParam(prodId,roleObj.prodSpecParams[k],roleObj.prodSpecParams[k].itemSpecId,flag);
							}
						}
					}
				}
			}*/
		}
		content +='</form>' ;
		return content;
	};
	
	//获取增值业务内容
	var _getAppContent = function(prodId,appList){
		//var appList = CacheData.getOpenAppList(prodId);
		var $form = $('<form id="appForm"></form>');
		if(!!appList && appList.length>0){ //下拉框
			$.each(appList,function(){
				var $input = $('<input id="'+prodId+'_'+this.objId+'" name="'+prodId+'" type="checkbox">'+this.objName+'</input></br>');
				if(this.minQty == 0){
					if(this.dfQty>0){
						$input.attr("checked","checked");
					}
				}else if(this.minQty > 0){
					$input.attr("checked","checked");
					$input.attr("disabled","disabled");
				}
				$form.append($input);
			});
		}
		return $form;
	};
	
	//根据参数获取字符串
	var _getStrByParam = function(prodId,param,itemSpecId,paramVal){
		var selectStr = "";
		if(isNull(param.setValue)){
			paramVal = param.setValue;
		}else{
			param.setValue = param.value;
		}
		if(!!param.valueRange && param.valueRange.length>0){ //下拉框
			if(param.rule.isConstant=='Y'){ //不可修改
				selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>"; 
			}else {
				if(param.rule.isOptional=="N") { //必填
					selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" data-validate='validate(required,reg:"
					+param.rule.maskMsg+"("+param.rule.mask+")) on(blur)'><label class='f_red'>*</label><br>"; 
				}else{
					selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+"><br>"; 
				}
			}
			var optionStr = "";
			if(param.value==""){//没有默认值
				optionStr +='<option value="" >请选择</option>';
				/*if(paramVal==""){
					optionStr +='<option value="" selected="selected">请选择</option>';
					for ( var j = 0; j < param.valueRange.length; j++) {
						var valueRange = param.valueRange[j];
						optionStr +='<option value="'+valueRange.value+'">'+valueRange.text+'</option>';
					}
				}else{
					optionStr +='<option value="" >请选择</option>';
					for ( var j = 0; j < param.valueRange.length; j++) {
						var valueRange = param.valueRange[j];
						if(valueRange.value==paramVal){
							optionStr +='<option value="'+valueRange.value+'" selected="selected" >'+valueRange.text+'</option>';
						}else {
							optionStr +='<option value="'+valueRange.value+'">'+valueRange.text+'</option>';
						}
					}
				}*/
			}
			for ( var j = 0; j < param.valueRange.length; j++) {
				var valueRange = param.valueRange[j];
				if(valueRange.value==paramVal){
					optionStr +='<option value="'+valueRange.value+'" selected="selected" >'+valueRange.text+'</option>';
				}else {
					optionStr +='<option value="'+valueRange.value+'">'+valueRange.text+'</option>';
				}
			}
			selectStr += optionStr + "</select><br>"; 
		}else { 
			 if(param.dataTypeCd==1){  //文本框
				if(param.rule==undefined){
					selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId +'" class="inputWidth183px" type="text" value="'+paramVal+'" ><br>'; 
				}else {
					if(param.rule.isConstant=='Y'){ //不可修改
						selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId
						+'" class="inputWidth183px" type="text" disabled="disabled" value="'+paramVal+'" ><br>';
					}else {
						if(param.rule.isOptional=="N") { //必填
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="text" data-validate="validate(required,reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><label class="f_red">*</label><br>'; 
						}else{
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="text" data-validate="validate(reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><br>'; 
						}
					}
				}
			} else if(param.dataTypeCd==8){  //密码框
				if(param.rule==undefined){
					selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId +'" class="inputWidth183px" type="password" value="'+paramVal+'" ><br>'; 
				}else{
					if(param.rule.isConstant=='Y'){
						selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId
						+'" class="inputWidth183px" type="password"  disabled="disabled" value="'+paramVal+'" ><br>';
					}else {
						if(param.rule.isOptional=="N") {
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="password" data-validate="validate(required,reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><label class="f_red">*</label><br>'; 
						}else{
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="password" data-validate="validate(reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><br>'; 
						}
					}
				}
			}else if(param.dataTypeCd==4){ //日期，暂时不写
			
			
			}
		}
		return selectStr;
	};
	
	//获取销售品下的功能产品拼接成字符串
	var _getOfferProdStr = function(prodId,spec,flag){
		var content = '<form id="paramForm">' ;
		var str = "";
		if(flag==0){  //订购可选包
			$.each(spec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.objType==4){
						if(this.minQty==0 && this.maxQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked">'+this.objName+'<br>'; 
						}else if(this.minQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'"  type="checkbox" checked="checked" disabled="disabled">'+this.objName+'<br>';
						}
					}
				});
			});
			if(str==""){
				content = '订购【'+spec.offerSpecName+'】可选包' ;
			}else{
				content = '订购【'+spec.offerSpecName+'】可选包，需要开通以下勾选的功能产品：<br>' +str;
			}
		}else if(flag==1) { //退订可选包
			$.each(spec.offerMemberInfos,function(){  //退订时候spec当成serv
				var offerMember = this;
				$.each(spec.offerSpec.offerRoles,function(){
					$.each(this.roleObjs,function(){
						if(offerMember.objId==this.objId && this.relaTypeCd==CONST.RELA_TYPE_CD.SELECT){ //优惠构成关系
							var servId = offerMember.objInstId;
							if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CLOSE){
								str += '<input id="check_'+prodId+'_'+servId+'" type="checkbox" checked="checked" disabled="disabled">'+this.objName+'<br>'; 
							}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE){
								str += '<input id="check_'+prodId+'_'+servId+'" type="checkbox" checked="checked">'+this.objName+'<br>';
							}
						}
					});
				});
			});
			if(str==""){
				content = '退订【'+spec.offerSpecName+'】可选包' ;
			}else{
				content = '退订【'+spec.offerSpecName+'】可选包，需要关闭以下勾选的功能产品：<br>' +str;
			}
		}else if(flag==2) { //取消订购可选包
			$.each(spec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.relaTypeCd==CONST.RELA_TYPE_CD.SELECT){ //优惠构成关系
						if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CLOSE){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked" disabled="disabled">'+this.objName+'<br>'; 
						}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked">'+this.objName+'<br>';
						}
					}
				});
			});
			if(str==""){
				content = '取消订购【'+spec.offerSpecName+'】可选包' ;
			}else{
				content = '取消订购【'+spec.offerSpecName+'】可选包，需要取消开通以下勾选的功能产品：<br>' +str;
			}
		}
		content +='</form>';
		return content;
	};
	
	//获取可开通功能产品页面
	var _getCanBuyServHtml = function(prodId,spec,flag){
		
		/*<ul id="ul_${param.prodId}_${param.labelId}">
		<#if unOpenServList?? && (unOpenServList?size>0)>	
		 	<#list unOpenServList as item>
				<li id="li_${param.prodId}_${item.servSpecId}">
		 		<dd class="canchoose" onclick="AttachOffer.openServSpec(${param.prodId},${item.servSpecId},'${item.servSpecName}','${item.ifParams}')"></dd>
			        <span><a href="javascript:AttachOffer.openServSpec(${param.prodId},${item.servSpecId},'${item.servSpecName}','${item.ifParams}')" >${item.servSpecName}</a></span>
			     </li>
			</#list>
		</#if>
		</ul>*/
	};
	
	//获取可订购附属销售品页面
	var _getCanBuyOfferHtml = function(prodId,spec,flag){
		
	};
	
	//自动设置参数
	var _setParam = function(prodId,offerSpec){
		//自动设置销售品参数
		if(!!offerSpec.offerSpecParams){
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				if(isArray(param.valueRange)){ //不是下拉框
					if(param.value==undefined || param.value==""){ //必须手工填写
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}else{
					if(param.value==undefined || param.value==""){
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}
			}
		}
		//自动设置服务参数
		/*if(!!offerSpec.offerRoles){
			for (var i = 0; i < offerSpec.offerRoles.length; i++) {
				var offerRole = offerSpec.offerRoles[i];
				for (var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(!!roleObj.prodSpecParams){
						for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
							var param = roleObj.prodSpecParams[k];
							if(param.valueRange.length == 0){ //不是下拉框
								if(param.value===""){ //必须手工填写
									return false;
								}
							}else{
								if(param.value==undefined || param.value==""){
									param.value = param.valueRange[0].value; 
								}
							}
						}
					}
				}
			}
		}*/
		offerSpec.isset = "Y";
		return true;
	};

	//自动设置服务参数
	var _setServParam = function(prodId,servSpec){
		if(!!servSpec.prodSpecParams){
			for (var k = 0; k < servSpec.prodSpecParams.length; k++) {
				var param = servSpec.prodSpecParams[k];
				if(isArray(param.valueRange)){ //下拉框
					if(param.value==undefined || param.value==""){ //必须手工填写
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}else{
					if(param.value==undefined || param.value==""){
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}
			}
		}
		servSpec.isset = "Y";
		return true;
	};
	
	//通过产品id获取产品已开通附属规格列表
	var _getOfferSpecList = function (prodId){
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			if(open.prodId == prodId){
				return open.specList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//通过产品id,跟销售品规格id获取销售品构成
	var _getOfferSpec = function(prodId,offerSpecId){
		var specList = _getOfferSpecList(prodId);
		if(specList!=undefined){
			for ( var i = 0; i < specList.length; i++) {
				if(specList[i].offerSpecId==offerSpecId){
					return specList[i];
				}
			}
		}
	};
	
	//获取某个销售品规格参数  
	var _getSpecParam = function(prodId,offerSpecId,itemSpecId){
		var spec = _getOfferSpec(prodId,offerSpecId);
		if(typeof(spec)!="undefined"){
			for ( var i = 0; i < spec.offerSpecParams.length; i++) {
				if(spec.offerSpecParams[i].itemSpecId==itemSpecId){
					return spec.offerSpecParams[i];
				}
			}
		}
	};
	
	//获取销售品下某个功能产品参数  
	var _getProdSpecParam = function(prodId,offerSpecId,itemSpecId){
		var spec = _getOfferSpec(prodId,offerSpecId);
		if(!!spec.offerRoles){
			for (var i = 0; i < spec.offerRoles.length; i++) {
				var offerRole = spec.offerRoles[i];
				for (var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(roleObj.prodSpecParams !=undefined && roleObj.prodSpecParams.length>0){
						for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
							if(roleObj.prodSpecParams[k].itemSpecId==itemSpecId){
								return roleObj.prodSpecParams[k];
							}
						}
					}
				}
			}
		}
	};
	
	//通过产品id获取产品已开通附属实例列表
	var _getOfferList = function (prodId){
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			if(opened.prodId == prodId){
				return opened.offerList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//获取销售品实例构成
	var _getOffer = function(prodId,offerId){
		var offerList = _getOfferList(prodId);
		if(offerList != undefined){
			for ( var i = 0; i < offerList.length; i++) {
				if(offerList[i].offerId==offerId){
					return offerList[i];
				}
			}
		}
	};
	
	//根据规格ID获取销售品实例构成
	var _getOfferBySpecId = function(prodId,offerSpecId){
		var offerList = _getOfferList(prodId);
		if(offerList != undefined){
			for ( var i = 0; i < offerList.length; i++) {
				if(offerList[i].offerSpecId==offerSpecId){
					return offerList[i];
				}
			}
		}
	};
	
	//获取某个销售品参数  
	var _getOfferParam = function(prodId,offerId,itemSpecId){
		var offer = _getOffer(prodId,offerId);
		if(offer.offerSpec.offerSpecParams!=undefined){
			for ( var i = 0; i < offer.offerSpec.offerSpecParams.length; i++) {
				if(offer.offerSpec.offerSpecParams[i].itemSpecId==itemSpecId){
					return offer.offerSpec.offerSpecParams[i];
				}
			}
		}
		/*if(offer.offerParamInfos!=undefined){
			for ( var i = 0; i < offer.offerParamInfos.length; i++) {
				if(offer.offerParamInfos[i].offerParamId==offerParamId){
					return offer.offerParamInfos[i];
				}
			}
		}*/
	};
	
	//获取某个实例功能产品参数  
	var _getProdInstParam = function(prodId,offerId,itemSpecId){
		var offer = _getOffer(prodId,offerId);
		if(isArray(offer.offerMembers)){
			for (var i = 0; i < offer.offerMembers.length; i++) {
				var offerMember = offer.offerMembers[i];
				for (var j = 0; j < offerMember.prodParamInfos.length; j++) {
					for (var k = 0; k < offerMember.prodParamInfos.length; k++) {
						var prodParam = offerMember.prodParamInfos[k];
						if(prodParam.itemSpecId==itemSpecId){
							return prodParam;
						}
					}
				}
			}
		}
	};
	
	
	//通过产品id获取产品已选功能产品规格列表
	var _getServSpecList = function(prodId){
		for ( var i = 0; i < AttachOffer.openServList.length; i++) {
			var open = AttachOffer.openServList[i];
			if(open.prodId == prodId){
				return open.servSpecList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//根据产品id,跟规格ID获取功能产品
	var _getServSpec = function(prodId,servSpecId){
		var servSpecList = _getServSpecList(prodId);
		if(servSpecList != undefined){
			for ( var i = 0; i < servSpecList.length; i++) {
				if(servSpecList[i].servSpecId==servSpecId){
					return servSpecList[i];
				}
			}
		}
	};
	
	//获取某个功能产品一个参数  
	var _getServSpecParam = function(prodId,servSpecId,itemSpecId){
		var servSpec = _getServSpec(prodId,servSpecId);
		if(isArray(servSpec.prodSpecParams)){
			for (var i = 0; i < servSpec.prodSpecParams.length; i++) {
				if(servSpec.prodSpecParams[i].itemSpecId==itemSpecId){
					return servSpec.prodSpecParams[i];
				}
			}
		}
	};
	
	//通过产品id获取产品已选功能产品实例列表
	var _getServList = function(prodId){
		for ( var i = 0; i < AttachOffer.openedServList.length; i++) {
			var opened = AttachOffer.openedServList[i];
			if(opened.prodId == prodId){
				return opened.servList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//通过功能产品id获取功能产品
	var _getServ = function(prodId,servId){
		var servList = _getServList(prodId);
		if(isArray(servList)){
			for ( var i = 0; i < servList.length; i++) {
				if(servList[i].servId==servId){
					return servList[i];
				}
			}
		}
	};
	
	//通过功能产品id获取功能产品
	var _getServBySpecId = function(prodId,servSpecId){
		var servList = _getServList(prodId);
		if(isArray(servList)){
			for ( var i = 0; i < servList.length; i++) {
				if(servList[i].servSpecId==servSpecId){
					return servList[i];
				}
			}
		}
	};
	
	//获取某个实例功能产品参数  
	var _getServInstParam = function(prodId,servId,itemSpecId){
		var serv = _getServ(prodId,servId);
		if(isArray(serv.prodSpecParams)){
			for ( var i = 0; i < serv.prodSpecParams.length; i++) {
				var servParam = serv.prodSpecParams[i];
				if(servParam.itemSpecId==itemSpecId){
					return servParam;
				}
			}
		}
		/*if(isArray(serv.prodInstParams)){
			for ( var i = 0; i < serv.prodInstParams.length; i++) {
				var servParam = serv.prodInstParams[i];
				if(servParam.itemSpecId==itemSpecId){
					return servParam;
				}
			}
		}*/
	};
	
	//获取增值业务列表
	var _getOpenAppList = function(prodId){
		for ( var i = 0; i < AttachOffer.openAppList.length; i++) {
			var open = AttachOffer.openAppList[i];
			if(open.prodId == prodId){
				return open.appList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//根据产品id获取销售品成员
	var _getOfferMember = function(prodId){
		if(isArray(OrderInfo.offer.offerMemberInfos)){ //销售品实例构成
			for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				if(offerMember.objInstId==prodId){
					return offerMember;
				}
			}
		}
	};
	
	var sortParam = function(param){
		param.sort(
		    function(a, b){
		        if(a.itemSpecId < b.itemSpecId) return -1;
		        if(a.itemSpecId > b.itemSpecId) return 1;
		        return 0;
		    }
		);
	};
	
	var isNull = function(obj){
		if(obj!=undefined && obj!=""){
			return true;
		}else{
			return false;
		}
	};
	
	var isArray = function(obj){
		if(!!obj && obj.length>0){
			return true;
		}else{
			return false;
		}
	};
	
	return {
		getParamContent			: _getParamContent,
		setParam				: _setParam,
		setServParam			: _setServParam,
		getOfferSpecList		: _getOfferSpecList,
		getOfferSpec			: _getOfferSpec,
		getSpecParam			: _getSpecParam,
		getOfferList			: _getOfferList,
		getOffer				: _getOffer,
		getOfferParam			: _getOfferParam,
		getOfferBySpecId		: _getOfferBySpecId,
		getServList				: _getServList,
		getServ					: _getServ,
		getServBySpecId			: _getServBySpecId,
		getServSpec				: _getServSpec,
		getServSpecList			: _getServSpecList,
		getProdInstParam		: _getProdInstParam,
		getProdSpecParam		: _getProdSpecParam,
		getServInstParam		: _getServInstParam,
		getServSpecParam		: _getServSpecParam,
		getOfferProdStr			: _getOfferProdStr,
		getOpenAppList			: _getOpenAppList,
		getAppContent			: _getAppContent,
		getOfferMember			: _getOfferMember,
		getCanBuyServHtml		: _getCanBuyServHtml,
		getCanBuyOfferHtml		: _getCanBuyOfferHtml	
	};
})();
/**
 * 订单算费
 * 
 * @author tang
 */
CommonUtils.regNamespace("order", "calcharge");
/**
 * 订单算费
 */
order.calcharge = (function(){
	var _chargeItems = [];
	var _prints=[];
	var _olId=0;
	var _soNbr=0;
	var num=0;
	var money=0;
	var _pageFlag='newOrder';
	var submit_success=false;
	var _addbusiOrder=function(proId,obj){
		var html=$("#pro_"+proId).html();
		if(html!=undefined&&html!=''){
			easyDialog.open({
				container : 'moneyAdd'
			});
			$("#addContent").html('');
			$("#addContent").html(html);
			$("#moneyclose").off("click").on("click",function(event){easyDialog.close();});
			order.calcharge.trObj=obj;
		}else{
			$.alert("提示","没有可添加费用项的业务对象！");
		}
	};
	var _addSubmit=function(boId,boActionTypeCd,objType,objId,objName,actionName,objInstId,prodId){
		var refundType = "0" ;
		//撤单 if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
		if(OrderInfo.actionFlag==11){
			refundType = "1" ;
		}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
			refundType = "2" ;
		}
		var param={"boId":boId,"objInstId":objInstId,"prodId":prodId,"boActionTypeCd":boActionTypeCd,"actionFlag":OrderInfo.actionFlag,
				"objType":objType,"objId":objId,"itemNum":num,"objName":objName,"actionName":actionName,"refundType":refundType};
		$.callServiceAsHtml(contextPath+"/order/getChargeAddByObjId",param,{
			"before":function(){
				$.ecOverlay("<strong>正在增加收费项,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				_addItems(boId,response.data);
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});	
	};
	var _addItems=function(boId,html){
		easyDialog.close();
		if(html!=''){
			$(order.calcharge.trObj).parent().parent().after(html);
			num--;
			_reflashTotal();
		}else{
			$.alert("提示","没有可添加的费用项");
			return;
		}
	};
	var _delItems=function(obj,val,str){
		if(str=='old'){
			var fee=$("#feeAmount_"+val).val();
			if(($("#realAmount_"+val).val())*100==0){
				$("#realAmount_"+val).val(((fee/100).toFixed(2))+"");
			}else{
				$("#realAmount_"+val).val('0');
			}			
			var real=($("#realAmount_"+val).val())*100;
			if(real!=fee){
				$("#chargeModifyReasonCd_"+val).show();
			}else{
				$("#chargeModifyReasonCd_"+val).hide();
			}
		}else{
			$(obj).parent().parent().remove();
		}
		_reflashTotal();
	};
	var _delItems2=function(obj,itemTypeId,val,str){
		var flag = _queryPayMethodByItem(itemTypeId,val,null);
		if(flag){
			if(str=='old'){
				var fee=$("#feeAmount_"+val).val();
				if(($("#realAmount_"+val).val())*100!=0){
					$("#realAmount_"+val).val(((fee/100).toFixed(2))+"");
				}else{
					$("#realAmount_"+val).val('0');
				}			
				var real=($("#realAmount_"+val).val())*100;
				if(real!=fee){
					$("#chargeModifyReasonCd_"+val).show();
				}else{
					$("#chargeModifyReasonCd_"+val).hide();
				}
			}else{
				$(obj).parent().parent().remove();
			}
			_reflashTotal();
		}
	};
	var _reflashTotal=function(){
		_chargeItems=[];
		_prints=[];
		var realAmount=0;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var aa=($("#realAmount_"+val).val())*1;
				if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
					aa=($("#backAmount_"+val).val())*1;
				}
				realAmount=realAmount+aa;
				_commitParam(val);
			}
		});
		if(OrderInfo.actionFlag==15){
			var backAmount=0;
			$("#calTab tbody tr").each(function() {
				var val = $(this).attr("id");
				if(val!=undefined&&val!=''){
					val=val.substr(5,val.length);
					var aa=($("#backAmount_"+val).val())*1;
					backAmount=backAmount+aa;
				}
			});
			$('#backAmount').val(Number(backAmount).toFixed(2));
		}
		//alert(JSON.stringify(_prints));
		$('#realmoney').val(Number(realAmount).toFixed(2));
		if(OrderInfo.actionFlag==15){
			order.refund.conBtns();
		}else{
			_conBtns();
		}
	};
	var _submitParam=function(){
		var remakrFlag = true ;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var chargeModifyReasonCd=$("#chargeModifyReasonCd_"+val).val();
				if(chargeModifyReasonCd=="1"){
					if($("#remark_"+val).val()==undefined||$("#remark_"+val).val()==null||$("#remark_"+val).val()==''){
						remakrFlag = false ;
					}
				}
			}
		});
		if(!remakrFlag){
			$.alert("提示信息","请填写修改原因");
			return false ;
		}
		_chargeItems=[];
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var realmoney=($("#realAmount_"+val).val())*100+'';
				var amount=$("#feeAmount_"+val).val();
				var feeAmount="";
				if(amount!=undefined&&amount!=''){
					feeAmount=amount+'';
				}else{
					feeAmount=realmoney;
				}
				if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
					feeAmount = $("#feeAmount_"+val).val()*1+'';
					realmoney = (0-($("#backAmount_"+val).val())*100)+'';
					//realmoney = (parseInt(feeAmount) + parseInt(realmoney))+'';
					//alert("feeAmount="+feeAmount+"||realmoney="+realmoney);
				}
				var acctItemTypeId=$("#acctItemTypeId_"+val).val();
				var objId=$("#objId_"+val).val();
				var objType=$("#objType_"+val).val();
				var acctItemId=$("#acctItemId_"+val).val();
				var boId=$("#boId_"+val).val();
				var payMethodCd=$("#payMethodCd_"+val).val();
				var objInstId=$("#objInstId_"+val).val();
				var prodId=$("#prodId_"+val).val();
				var boActionType=$("#boActionType_"+val).val();
				var chargeModifyReasonCd=$("#chargeModifyReasonCd_"+val).val();
				var remark=$('#chargeModifyReasonCd_'+val).find("option:selected").text();
				if(chargeModifyReasonCd=="1"){
					remark = $("#remark_"+val).val();
				}
				/*
				if($("#chargeModifyReasonCd_"+val).is(":hidden")){
					chargeModifyReasonCd= 1;
					remark="";
				}
				*/
				var param={"realAmount":realmoney,
						"feeAmount":feeAmount,
						"acctItemTypeId":acctItemTypeId,
						"objId":objId,
						"objType":objType,
						"acctItemId":acctItemId,
						"boId":boId,
						"prodId":prodId,
						"objInstId":objInstId,
						"payMethodCd":payMethodCd,
						"posSeriaNbr":"-1",
						"chargeModifyReasonCd":chargeModifyReasonCd,
						"remark":remark,
						"boActionType":boActionType
				};
				_chargeItems.push(param);
			}
		});
		return true ;
	};
	var _selectChangePayMethodCd=function(trid){
		var methodCd=$("#changeMethod_"+trid).val();
		$("#payMethodCd_"+trid).val(methodCd);
	};
	//调用接口，判断用户是否可以修改金额，并加载付费类型
	var _queryPayMethodByItem = function(itemTypeId,trid,defmethod){
		var params={"acctItemTypeId":itemTypeId};
		var url=contextPath+"/order/queryPayMethodByItem";
		
		var response = $.callServiceAsJson(url, params);
		if (response.code == 0) {
			if(response.data!=undefined&&response.data!=null){
				if(response.data.length>0){
					var items=response.data;
					var flag=false;
					if(OrderInfo.actionFlag==11){//撤单
						if(items[0].limitChange=="N"){
							return true ;
						}
					}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){//返销
						if(items[0].limitBuyBack=="N"){
							return true ;
						}
					}else if(OrderInfo.actionFlag==15){
						if(items[0].limitRedo=="N"){
							flag=true;
						}
					}else{
						if(items[0].limitChange=="N"){
							flag=true;
						}
					}
					if(flag){
						//if(OrderInfo.actionFlag!=19&&OrderInfo.actionFlag!=20&&OrderInfo.actionFlag!=15){
							var methodsInfo=items[0].payMethods;
							if(methodsInfo.length>0){
								if(trid){
									var id="'"+trid+"'";
									var html='<select id="changeMethod_'+trid+'" style="border: 1px solid #DCDCDC;height: 23px;line-height: 23px;padding: 1px; width: 120px;" onchange="order.calcharge.selectChangePayMethodCd('+id+')">';
									$.each(methodsInfo,function(i,method){
										if(method.payMethodCd==defmethod){
											html+='<option value="'+method.payMethodCd+'" selected="selected">'+method.payMethodName+'</option>';
										}else{
											html+='<option value="'+method.payMethodCd+'">'+method.payMethodName+'</option>';
										}
									});
									html+='</select>';
									$("#payMethodText_"+trid).html(html);
								}
							}
						//}
						return true ;
					}else{
						$.alert("提示","当前产品不可修改费用!");
						return false ;
						
					}
					
				}
			}
		}else if (response.code == -2) {
			$.alertM(response.data);
			return false ;
		}else{
			$.alert("提示","查询付费方式失败!");
			return false ;
		}
		
		
		
	};
	
	var _bindChargeModifyReason = function(trid){
		if($("#chargeModifyReasonCd_"+trid).val()=="1"){
			$("#remark_"+trid).css("display","inline");
		}else{
			$("#remark_"+trid).css("display","none");
		}
	};
	
	var _changePayMethod=function(itemTypeId,trid,defmethod,obj){
		var flag = _queryPayMethodByItem(itemTypeId,trid,defmethod);
		if(flag){
			//$("#chargeModifyReasonCd_"+trid).show();
			//$("#remark_"+trid).hide();chargeModifyReasonCd
			$("#chargeModifyReasonCd_"+trid).off("change").on("change",function(){
				if($(this).val()=="1"){
					$("#remark_"+trid).css("display","inline");
				}else{
					$("#remark_"+trid).css("display","none");
				}
			});
			if(OrderInfo.actionFlag==11||OrderInfo.actionFlag==19||OrderInfo.actionFlag==20||OrderInfo.actionFlag==15){//撤单，返销，补退费
				$("#backAmount_"+trid).removeAttr("disabled").css("border","1px solid #DCDCDC").focus() ;
			}else{
				$("#realAmount_"+trid).removeAttr("disabled").css("border","1px solid #DCDCDC").focus() ;
			}
		}
		$(obj).removeAttr("onclick").removeClass("money_edit").addClass("money_edit_gray");
	};
	var _commitParam=function(val){
		var realmoney=($("#realAmount_"+val).val())*100+'';
		var amount=$("#feeAmount_"+val).val();
		var feeAmount="";
		if(amount!=undefined&&amount!=''){
			feeAmount=amount+'';
		}else{
			feeAmount=realmoney;
		}
		var acctItemTypeId=$("#acctItemTypeId_"+val).val();
		var objId=$("#objId_"+val).val();
		var objType=$("#objType_"+val).val();
		var acctItemId=$("#acctItemId_"+val).val();
		var acctItemTypeName=$("#acctItemTypeName_"+val).val();
		var param2={"realmoney":realmoney,
				"feeAmount":feeAmount,
				"acctItemTypeId":acctItemTypeId,
				"objId":objId,
				"objType":objType,
				"acctItemId":acctItemId,
				"acctItemTypeName":acctItemTypeName
		};
		_prints.push(param2);
	};
	var _editMoney=function(obj,val,str){//obj:对象,val:id,str:类型
		var cash=$.trim($(obj).val());//当前费用
		if(cash==''){
			$(obj).val('0');
			order.calcharge.reflashTotal();
		}else{
			if(str=="old"){//修改费用
				var amount=$("#feeAmount_"+val).val();
				var check = true ;
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		check = false ;
				}else if(cash*100>amount*1){
					$.alert("提示","实收费用金额不能高于应收金额！");
					check = false ;
				}
				if(check){
					var real=($(obj).val())*100;
		  			if(real!=amount){
		  				$("#chargeModifyReasonCd_"+val).show();
					}else{
						$("#chargeModifyReasonCd_"+val).hide();
						$("#remark_"+val).hide();
					}
					_reflashTotal();
				}else{
					if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}
			}else if(str=="undo"){//退费：撤单和返销
				var check = true ;
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){//金额非数字，恢复金额
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		check = false ;
				}else{
					if(cash<0){//退费金额 不能填负值
						$.alert("提示","退费金额不能为负值！");
						check = false ;
					}else{
						var amount=$("#realhidden_"+val).val();
						var v_cash = cash*-1 ;
						if(v_cash<amount*1){//要退-100，不能退120
							$.alert("提示","退费金额不能高于实收金额！");
							check = false ;
						}
					}
				}
				if(check){
					var real=($(obj).val())*-1;
					var amount=$("#realhidden_"+val).val();
					if(real!=0){
		  				$("#chargeModifyReasonCd_"+val).show();
					}else{
						$("#chargeModifyReasonCd_"+val).hide();
						$("#remark_"+val).hide();
					}
					_reflashTotal();
				}else{
					if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}
			}else if(str=="new"){//新增费用
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}else{
					_reflashTotal();
				}
			}
		}
	};
	var _setGlobeMoney=function(obj){
		money=$.trim($(obj).val());
	};
	var _conBtns=function(){
		
		var val=($('#realmoney').val())*1;
		if(OrderInfo.actionFlag==11){
			$("#orderCancel").off("click").on("click",function(event){
				order.undo.orderBack();
			});
		}else{
			$("#orderCancel").off("click").on("click",function(event){
				SoOrder.orderBack();
			});
		}
		
		if(!submit_success){
			if(val!=0){
				$("#toCharge").removeClass("btna_g").addClass("btna_o");
				$("#toComplate").removeClass("btna_o").addClass("btna_g");
				$("#toCharge").off("click").on("click",function(event){
					_tochargeSubmit('1');
				});
				$("#toComplate").off("click");
			}else{
				$("#toCharge").removeClass("btna_o").addClass("btna_g");
				$("#toComplate").removeClass("btna_g").addClass("btna_o");
				$("#toCharge").off("click");
				$("#toComplate").off("click").on("click",function(event){
					_tochargeSubmit('0');
				});
			}
		}else{
//			if(val!=0){
//				$("#printInvoiceA").removeClass("btna_g").addClass("btna_o");
//			}else{
//				$("#printInvoiceA").removeClass("btna_o").addClass("btna_g");
//				$("#printInvoiceA").off("click");
//			}
			$("#toCharge").removeClass("btna_o").addClass("btna_g");
			$("#toComplate").removeClass("btna_o").addClass("btna_g");
			$("#toCharge").off("click");
			$("#toComplate").off("click");
		}
	};
	var _tochargeSubmit=function(flag){
		//TEST BEGIN
//		$.confirm("信息提示","收费成功，是否打印发票?",{
//			names:["是","否"],
//			yesdo:function(){
//				var param={
//					"soNbr":OrderInfo.order.soNbr,
//					"billType" : 0,
//					"olId" : _olId,
//					"areaId" : OrderInfo.staff.areaId,
//					"acctItemIds":[]
//				};
//				common.print.prepareInvoiceInfo(param);
//				return;
//			},
//			no:function(){						
//			}
//		});
//		return;
		//TEST END
		
		if(submit_success){
			$.alert("提示","订单已经激活,不能重复操作!");
			return;
		}
		if(!_submitParam()){
			return ;
		}
		var params={
			"olId":_olId,
			"soNbr":OrderInfo.order.soNbr,
			"areaId" : OrderInfo.staff.areaId,
			"chargeItems":_chargeItems
		};
		//$.alert(JSON.stringify(params));
		var url=contextPath+"/order/chargeSubmit";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				var msg="";
				if (response.code == 0) {
					//受理成功，不再取消订单
					SoOrder.delOrderFin();
					
					if(OrderInfo.actionFlag==31){//改产品密码，则将session中密码重置，用户需要重新输入密码
						var url=contextPath+"/cust/passwordReset";
						var response = $.callServiceAsJson(url, null, {});
					}
					submit_success=true;
					if(flag=='1'){
						if(OrderInfo.actionFlag==11){
							msg="退费成功";
						}else{
							msg="收费成功";
						}
					}else{
						msg="受理成功";
					}	
					$("#toCharge").removeClass("btna_o").addClass("btna_g");
					$("#toComplate").removeClass("btna_o").addClass("btna_g");
					//$("#orderCancel").removeClass("btna_o").addClass("btna_g");
					//$("#orderCancel").off("click");
					$("#printVoucherA").removeClass("btna_o").addClass("btna_g").off("click");
					$("#toComplate").off("click");
					$("#toCharge").off("click");
					//移除费用新增、费用修改按钮
					$(".charge_add").remove();
					//禁用费用项修改框
					$(".cash_inp_dis").attr("disabled","disabled");
					if(OrderInfo.actionFlag==11){
						$("#orderCancel").html("<span>返回首页</span>");
						$("#orderCancel").off("click").on("click",function(event){
							order.undo.toUndoMain(1);
						});
					}else{
//						$("#orderCancel").removeClass("btna_o").addClass("btna_g");
//						$("#orderCancel").off("click");
						//将订单取消改为继续受理
						$("#orderCancel span").html("继续受理");
						$("#orderCancel").off("click").on("click",function(event){_backToEntr();});
					}
					//异地补换卡调用订单受理接口在本地存储订单数据
					//alert("DiffPlaceFlag:"+$("#DiffPlaceFlag").val());
					//alert(JSON.stringify(OrderInfo));
					/*屏蔽异地写卡订单记录
					if (OrderInfo.boActionTypeCd == "14" && $("#DiffPlaceFlag").val() == "diff"
						&& OrderInfo.orderData.orderList.orderListInfo.areaId!=OrderInfo.staff.areaId){
						var orderData = OrderInfo.orderData;
						orderData.orderList.orderListInfo.areaId = OrderInfo.staff.areaId;
						orderData.orderList.custOrderList[0].busiOrder[0].areaId = OrderInfo.staff.areaId;
						orderData.orderList.custOrderList[0].busiOrder[0].boActionType.boActionTypeCd = "-10000";
						var result = query.offer.orderSubmitComplete(JSON.stringify(OrderInfo.orderData));
						if (result.resultCode == "0"){
							alert(result.resultMsg);
						}else{
							alert("创建本地订单失败：原因："+result.resultMsg);
						}
					}
					*/
					SoOrder.updateResState(); //修改UIM，号码状态
					//金额不为零，提示收费成功
					if(flag=='1'){
						var realmoney=($('#realmoney').val())*1;
						//费用大于0，才可以打印发票
						if (realmoney > 0) {
							//收费成功，先调初始化发票信息
							var param={
								"soNbr":OrderInfo.order.soNbr,
								"billType" : 0,
								"olId" : _olId,
								"printFlag" : -1,
								"areaId" : OrderInfo.staff.areaId,
								"acctItemIds":[]
							};
							var initResult = common.print.initPrintInfo(param);
							if(!initResult) {
								return;
							}
							//然后提示是否打印发票
							$.confirm("信息提示","收费成功，是否打印发票?",{
								names:["是","否"],
								yesdo:function(){
									var param={
										"soNbr":OrderInfo.order.soNbr,
										"billType" : 0,
										"olId" : _olId,
										"printFlag" : 0,
										"areaId" : OrderInfo.staff.areaId,
										"acctItemIds":[]
									};
									common.print.prepareInvoiceInfo(param);
									return;
								},
								no:function(){
								}
							});
						} else {
							//提示收费成功
							_showFinDialog(flag, msg);
						}
					} else {
						//提示受理完成
						_showFinDialog(flag, msg);
					}
					//将订单取消改为继续受理
//					$("#orderCancel span").html("继续受理");
//					$("#orderCancel").off("click").on("click",function(event){_backToEntr();});
					return;
					
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					if(response.data!=undefined){
						$.alert("提示",response.data);
					}else{
						$.alert("提示","费用信息提交失败!");
					}
				}
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
		
	};
	var _showFinDialog=function(flag, msg){
		var html='<table class="contract_list rule">';
		if(flag=='1'){
			if(OrderInfo.actionFlag==11){
				html+='<thead><tr> <td colspan="2">退费结果</td></tr></thead></table>';
			}else{
				html+='<thead><tr> <td colspan="2">收费结果</td></tr></thead></table>';
			}
		}else{
			html+='<thead><tr> <td colspan="2">受理结果</td></tr></thead></table>';
		}
		html+='<div id="rules_div">';
		html+='<table width="100%" border="0" cellspacing="0" cellpadding="0">';
		html+='<tr>';
		html+='<td align="right"><i class="rule_icon"></i></td>';
		html+='<td><span class="rule_font">'+msg+'</span></td>';
		html+='</tr>';
		html+='</table>';
		html+='</div>';
		easyDialog.open({
			container : 'successTip_dialog'
		});
		$("#successTipContent").html('');
		$("#successTipContent").html(html);
		$("#successTipclose,#successTip_dialog_cls").off("click").on("click",function(event){easyDialog.close();order.cust.custReset();});
		//返回三个入口
		if(OrderInfo.actionFlag==11){
			$("#successTip_dialog_cnt").off("click").on("click",function(event){order.undo.toUndoMain(1);});
		}else{
			$("#successTip_dialog_cnt").off("click").on("click",function(event){_backToEntr();});
		}
		if(flag=='1'){
			if(OrderInfo.actionFlag==11){
				$("#successTip_dialog_inv").show();
				$("#successTip_dialog_inv").off("click").on("click",function(event){_invaideInvoice();});
				$("#successTip_dialog_inv").css("margin-left","30px");
				$("#successTip_dialog_cnt").css("margin-left","30px");
			}	
		}
	};
	
	var _showErrorInfo=function(){
		if($('#sumitErrorInfo').is(':hidden')){
			$("#sumitErrorInfo").css("display","");
		}else{
			$("#sumitErrorInfo").css("display","none");
		}
	};
	var _selePaymethod=function(str,obj){
		var selObj =$("#payMethodCd_"+str);
		selObj.empty();
		$("select[@id=backpayMethodCd_"+str+"] option").each(function(){
			var vv=$(this).val();
			if(vv!=undefined){
				var tt=$(this).text();
				if(vv.split("_")[1]==$(obj).val()){
					$("<option value='"+vv.split("_")[0]+"'>"+tt+"</option>").appendTo(selObj);
				}
			}
	    });

	};
	var _backToEntr=function(){
		//如果有easyDialog弹出框，则关闭它
		if ($("#successTip_dialog").is(":visible")) {
			easyDialog.close();			
		}
		
		if (OrderInfo.actionFlag == 17 || OrderInfo.actionFlag == 18) {
			window.location.href = contextPath+"/mktRes/terminal/exchangePrepare";
			return;
		}else if(OrderInfo.actionFlag ==8){
			window.location.href = contextPath+"/cust/mvnoCustCreate";
			return;
		}
		$("#order_confirm,#order_fill_content,#order_tab_panel_content").empty();
		$("#order_prepare").show();
		order.cust.custReset();
		//如果是新建客户，则要重置客户信息
		if(OrderInfo.cust.custId == -1) {
			order.cust.custReset();
		}
	};
	var _calchargeInit=function(){
		$("#step1").hide();
		$("#step2").hide();
		$("#step3").show();
		_olId = OrderInfo.orderResult.olId;
		_soNbr = OrderInfo.orderResult.soNbr;
		_chargeItems = [];
		_prints=[];
		num=0;
		money=0;
		submit_success=false;
		var refundType = "0" ;
		if(OrderInfo.actionFlag==11){
			refundType = "1" ;
		}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
			refundType = "2" ;
		}
		var params={
			"olId":_olId,
			"actionFlag":OrderInfo.actionFlag,
			"actionTypeName" : encodeURI(OrderInfo.actionTypeName),
			"businessName" : encodeURI(OrderInfo.businessName),
			"olNbr":OrderInfo.orderResult.olNbr,
			"soNbr" : OrderInfo.order.soNbr,
			"refundType":refundType
		};
		$.callServiceAsHtmlGet(contextPath+"/order/getChargeList",params,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","收费页面加载失败，请稍后重试");
					return;
				}
				var content$=$("#order_confirm");
				content$.html(response.data).show();
				if(OrderInfo.actionFlag==1){ 
					$("#buytitle").html("<span>订购</span>"+OrderInfo.offerSpec.offerSpecName);
				}else if(OrderInfo.actionFlag==11){
					$("#buytitle").html("撤单");
					$("#toCharge").html("<span>退费</span>");
				}else if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){
					$("#buytitle").html("<span>"+OrderInfo.actionTypeName+"</span>"+OrderInfo.businessName);
				}else if(OrderInfo.actionFlag==19||OrderInfo.actionFlag==20){
					$("#buytitle").html("返销");
					$("#toCharge").html("<span>退费</span>");
				}else{
					$("#buytitle").html("<span>"+OrderInfo.actionTypeName+"</span>");
				}
				$.each($(".cashier_td"),function(){
					var prodId=$(this).attr("id");
					var obj=$(this);
					if($.trim($(this).html())==""&&$("#phoneNumListtbody")!=undefined){
						$.each($("#phoneNumListtbody tr").find("td:eq(0)"),function(){
							 var prodInstId=$(this).attr("prodInstId");
							 var accNbr=$(this).attr("accNbr");
							 var prodName=$(this).attr("productName");
							 if(prodInstId!=undefined&&accNbr!=undefined){
								 if(prodId==prodInstId){
									 obj.html(prodName+"&nbsp;-&nbsp;"+accNbr);
								 }
							 }
						});	
					}
					
				});
				$("#printVoucherA").off("click").on("click", function(event){
					if(!_submitParam()){
						return ;
					}
					var voucherInfo = {
						"olId":_olId,
						"soNbr":OrderInfo.order.soNbr,
						"busiType":"1",
						"chargeItems":_chargeItems
					};
					common.print.printVoucher(voucherInfo);
				});
				_reflashTotal();
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	
	var _appendTrTd = function(item){
		//补贴金额,赠送话费额 不计入
		if(item.acctItemTypeId == '2090000' || item.acctItemTypeId == '2091000'){
			return '';
		}
		if(item.feeAmount == 0){
			return '';
		}
		var html = "<tr>";
		html += '<td>';
		//先预设打印次数为0
		item.printTimes = 0;
		if(item.printTimes == 0){
			html += '<input type="checkbox" checked="checked" name="acctItem" value="';
		}else{
			html += '<input type="checkbox" disabled="disabled" name="acctItem" value="';
		}
		html += item.acctItemTypeId + '_' + item.objId  + '"/>';
		
		html += '</td>';
		html += '<td style="width: 200px">'+item.acctItemTypeName+'</td>';
		html += '<td>'+ (parseFloat(item.realmoney)/100).toFixed(2)+'</td>';
		html += '</tr>';
		return html;
	};
	


	var _invaideInvoice = function(){
		var params = {"olId":OrderInfo.order.oldSoId,"soNbr":OrderInfo.order.oldSoNbr} ;
		$.callServiceAsHtmlGet(contextPath+"/order/invaideInvoice",params,{
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					//alert(response.data);
					var data = $.parseJSON(response.data) ;
					if(data.code==0){
						//$("#successTip_dialog_inv").removeClass("btna_o").addClass("btna_g");
						$("#successTip_dialog_inv").off("click");
						$.alert("提示","作废发票成功！");	
					}else if(data.code==1){
						$.alert("提示","作废发票失败！");
					}else if(data.code==2){
						$.alert("提示","未获取到发票信息！");
					}else if(data.code==3){
						$.alert("提示","获取发票失败！");
					}else{
						$.alert("提示","作废发票异常！");
					}
				} else if(response.code == -2){
				}else{
					$.alert("提示","作废发票异常！");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	
	
	return {
		addItems:_addItems,
		delItems:_delItems,
		reflashTotal:_reflashTotal,
		editMoney:_editMoney,
		setGlobeMoney:_setGlobeMoney,
		conBtns:_conBtns,
		addbusiOrder:_addbusiOrder,
		addSubmit:_addSubmit,
		selePaymethod:_selePaymethod,
		calchargeInit:_calchargeInit,
		showErrorInfo:_showErrorInfo,
		pageFlag:_pageFlag,
		changePayMethod:_changePayMethod,
		selectChangePayMethodCd:_selectChangePayMethodCd,
		bindChargeModifyReason:_bindChargeModifyReason,
		invaideInvoice:_invaideInvoice
	};
})();


/**
 * 发展人管理
 * 
 * @author wukf
 * date 2014-01-20
 */
CommonUtils.regNamespace("order","dealer");

/** 发展人对象*/
order.dealer = (function() {
	//初始化发展人
	var _initDealer = function() {
		$.ecOverlay("<strong>正在查询发展人类型中,请稍后....</strong>");
		var response = $.callServiceAsJson(contextPath+"/order/queryPartyProfileSpecList",null); //发展人类型查询
		$.unecOverlay();
		if(response.code==0){
			OrderInfo.order.dealerTypeList = response.data;
		}else if(response.code==-2){
			$.alertM(response.data);
			return;
		}else{
			$.alert("信息提示",response.msg);
			return;
		}
		if(OrderInfo.actionFlag!=2&&OrderInfo.actionFlag!=3){ //可选包变更不需要初始化发展人
			$.each(OrderInfo.offerSpec.offerRoles,function(){
	    		$.each(this.prodInsts,function(){
	    			var objInstId = this.prodInstId;
	    			var $tr = $("<tr id='tr_"+objInstId+"' name='tr_"+objInstId+"'></tr>");
	    			var $tdType = $('<td></td>');
	    			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
	    			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
	    			$.each(OrderInfo.order.dealerTypeList,function(){
	    				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
	    			});
	    			$tdType.append($select);
					$tdType.append('<label class="f_red">*</label>');
	    			//$tr.append("<td>"+CONST.EVENT.PROD_NEW+"</td>");
					var accNbr = "未选号";
					if(this.accNbr!=undefined && this.accNbr!=""){
						accNbr = prodInst.accNbr;
					}
	    			$tr.append("<td>"+accNbr+"</td>");
					$tr.append("<td>"+this.objName+"</td>");
					$tr.append($tdType);
					var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px" readonly="readonly" ></input></td>');
					$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
					$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>');
					$tr.append($td);
					OrderInfo.SEQ.dealerSeq++;
					$("#dealerTbody").append($tr);
	    		});
	    	});
		}
	};
	
	//修改发展人角色
	var _changeDealer = function(select,objInstId,value){
		var i = 0;
		$("select[name="+objInstId+"]").each(function(){
			if($(this).val() == $(select).val()){
				i++;
			}
		});
		if(i>1){
			$.alert("信息提示","每个业务的发展人类型不能重复");
			$(select).val(value);
		}
	};
	
	//点击确认，添加附属销售品发展人
	var _addAttachDealer = function(){
		$("input[name=attach_dealer]:checked").each(function(){	
			var id = $(this).attr("id");	
			var prodId = id.split("_")[0];
			if($("#tr_"+id)[0]==undefined){ //没有添加过
				var objId = id+"_"+OrderInfo.SEQ.dealerSeq;
				var $tdType = _getDealerType(id,objId);
				if($tdType==undefined){
					return false;
				}
				var $tr = $("#atr_"+id);
				var $newTr = $('<tr name="tr_'+id+'"></tr>');
				$newTr.append("<td>"+$tr.children().eq(1).text()+"</td>");
				$newTr.append("<td>"+$tr.children().eq(2).text()+"</td>");
				$newTr.append($tdType);
				
				var dealer = $("#tr_"+prodId).find("input"); //产品协销人
				var staffId = 1;
				var staffName = "";
				if(dealer[0]==undefined){
					staffId = OrderInfo.staff.staffId;
					staffName = OrderInfo.staff.staffName;
				}else {
					staffId = dealer.attr("staffId");
					staffName = dealer.attr("value");
				}
				var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'" class="inputWidth183px" readonly="readonly" style="margin-left:45px;"></input></td>');
				$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');	
				$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>');
				$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,\''+id+'\')">添加</a><label class="f_red">*</label>');
				$newTr.append($td);
				$("#dealerTbody").append($newTr);
				OrderInfo.SEQ.dealerSeq++;
			}	
		});
		easyDialog.close();
	};
	
	//添加一行产品协销人
	var _addProdDealer = function(obj,objInstId,type){
		var $oldTr = $(obj).parent().parent();
		var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
		var $tdType = _getDealerType(objInstId,objId);
		if($tdType==undefined){
			return;
		}
		var $tr = $('<tr name="tr_'+objInstId+'"></tr>');
		/*if(type==1){
			$tr.append("<td>"+CONST.EVENT.PROD_NEW+"</td>");
		}else{
			$tr.append("<td>"+CONST.EVENT.OFFER_BUY+"</td>");
		}*/
		$tr.append("<td>"+$oldTr.find("td").eq(0).text()+"</td>");
		$tr.append("<td>"+$oldTr.find("td").eq(1).text()+"</td>");
		$tr.append($tdType);
		var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+objInstId+'" staffId="'+$oldTr.find("input").attr("staffId")+'" value="'+$oldTr.find("input").attr("value")+'" class="inputWidth183px" readonly="readonly" ></input></td>');
		$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
		$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>');
		/*if(type==1){
			$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>');
		}else{
			$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>');
			$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+')">添加</a><label class="f_red">*</label>');
		}*/
		$tr.append($td);	
		$oldTr.after($tr);
		OrderInfo.SEQ.dealerSeq++;
	};
	
	//改变发展人号码
	var _changeAccNbr = function(prodId,accNbr){
		$("tr[name^='tr_"+prodId+"']").each(function(){
			$(this).find("td").eq(0).text(accNbr);
		});
	};
	
	//校验发展人类型,并获取发展人类型列表
	var _getDealerType = function(objInstId,objId){
		var dealerType = "";
		if(OrderInfo.order.dealerTypeList!=undefined && OrderInfo.order.dealerTypeList.length>0){ //发展人类型列表
			$.each(OrderInfo.order.dealerTypeList,function(){
				var dealerTypeId = this.PARTYPRODUCTRELAROLECD;
				var flag = true;
				$("select[name='dealerType_"+objInstId+"']").each(function(){ //遍历选择框
					if(dealerTypeId==$(this).val()){  //如果已经存在
						flag = false;
						return false;
					}
				});
				if(flag){ //如果发展人类型没有重复
					dealerType = dealerTypeId;
					return false;
				}
			});
		}else{
			$.alert("信息提示","没有发展人类型");
			return;
		}
		if(dealerType==undefined || dealerType==""){	
			$.alert("信息提示","每个业务发展人类型不能重复");
			return;
		}
		var $td = $('<td></td>'); //发展人类型
		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth250px" style="width:183px;" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		$.each(OrderInfo.order.dealerTypeList,function(){
			if(this.PARTYPRODUCTRELAROLECD==dealerType){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected='selected'>"+this.NAME+"</option>");
			}else{
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			}
		});
		$td.append($select);
		$td.append('<label class="f_red">*</label>');
		return $td;
	};
	
	//显示已经受理的业务列表
	var _showOfferList = function(){	
		$('#attach_tbody').empty();
		//主销售品
		/*if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 2){
			var id = OrderInfo.offerSpec.offerSpecId;
			if($("tr[name='tr_"+id+"']")[0]==undefined){
				var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"></tr>');
				$tr.append('<td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td>');
				$tr.append('<td>主套餐</td><td>'+OrderInfo.offerSpec.offerSpecName+'</td>');
				$('#attach_tbody').append($tr);
			}
		}*/
		//接入产品
		if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14){
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				$.each(this.prodInsts,function(){
					/*var accNbr = "未选号";
					if(this.accNbr!=undefined && this.accNbr!=""){
						accNbr = prodInst.accNbr;
					}*/
					var id = this.prodInstId;
					var accNbr = OrderInfo.getProdAn(id).accessNumber;
					if(accNbr==undefined || accNbr==""){ 
						accNbr = "未选号";
					}
					if($("tr[name='tr_"+id+"']")[0]==undefined){
						var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')">');
						$tr.append('<td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
						$tr.append('<td>'+accNbr+'</td><td>'+this.objName+'</td>');
						$('#attach_tbody').append($tr);
					}
				});
			});
		}
		//可选包
		$.each(AttachOffer.openList,function(){
			var prodId = this.prodId;
			var accNbr = OrderInfo.getAccessNumber(prodId);
			if(accNbr==undefined || accNbr==""){ 
				accNbr = "未选号";
			}
			$.each(this.specList,function(){
				var id = prodId+'_'+this.offerSpecId;
				if(this.isdel != "Y" && this.isdel != "C" && $("tr[name='tr_"+id+"']")[0]==undefined){  //订购的附属销售品	
					
					var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')">');
					$tr.append('<td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
					$tr.append('<td>'+accNbr+'</td><td>'+this.offerSpecName+'</td>');
					$('#attach_tbody').append($tr);
				};
			});
		});
		//功能产品
		$.each(AttachOffer.openServList,function(){
			var prodId = this.prodId;
			var accNbr = OrderInfo.getAccessNumber(prodId);
			if(accNbr==undefined || accNbr==""){ 
				accNbr = "未选号";
			}
			$.each(this.servSpecList,function(){
				var id = prodId+'_'+this.servSpecId;
				if(this.isdel != "Y" && this.isdel != "C"  && $("tr[name='tr_"+id+"']")[0]==undefined){  //订购的附属销售品
					var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"><td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
					$tr.append('<td>'+accNbr+'</td><td>'+this.servSpecName+'</td>');
					$('#attach_tbody').append($tr);
				};
			});
		});
		easyDialog.open({
			container : "div_attach_dialog"
		});
	};
	
	//勾选一个附属
	var _checkAttach = function(id){
		var tr = $("#atr_"+id);
		var checkbox = $("#"+id);
		if(checkbox.attr("checked")=="checked"){
			tr.removeClass("plan_select");
			checkbox.attr("checked", false);
		}else {
			tr.addClass("plan_select");
			checkbox.attr("checked", true);
		}
	};
	
	//删除协销人
	var _removeDealer = function(obj){
		$(obj).parent().parent().remove();
	};
	
	//删除协销人
	var _removeAttDealer = function(id){
		$("tr[name^='tr_"+id+"']").each(function(){
			$(this).remove();
		});
	};
	
	return {
		initDealer 			: _initDealer,
		changeAccNbr		: _changeAccNbr,
		showOfferList		: _showOfferList,
		addProdDealer		: _addProdDealer,
		addAttachDealer		: _addAttachDealer,
		checkAttach			: _checkAttach,
		removeDealer		: _removeDealer,
		removeAttDealer		: _removeAttDealer,
		changeDealer		: _changeDealer
	};
})();
CommonUtils.regNamespace("order", "memberChange");
order.memberChange = function(){
	var _offerProd={};
	var _ischooseOffer=false;
	
	//点击主副卡成员变更跳出一个div
	var _showOfferCfgDialog=function(){
		//4G系统判断，如果是3g套餐不能做该业务
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G=="Y"){
			$.alert("提示","3G套餐不允许做主副卡成员变更业务！","information");
			return;
		}
		//查询销售品规格并且保存
		var param = {
			offerSpecId : order.prodModify.choosedProdInfo.prodOfferId, 
			offerTypeCd : 1,
			partyId : OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		//根据销售品规格验证是否是主副卡套餐
		var flag = true;
		$.each(offerSpec.offerRoles,function(){
			if (this.memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {
				flag = false;
				return false;
			}
		});
		if(flag){
			$.alert("错误","你选择的套餐不是主副卡套餐，不能进行主副卡成员变更");
			return;
		}
		//查询销售品实例并且保存
		if(!query.offer.setOffer()){  
			return;
		}

		var existViceCardNum = 0;//已有副卡数量
		var viceMinQty = 0;
		var viceMaxQty = 0;
		var numId= ""; //副卡输入框ID
		$("#memeberChange ul:last li").remove();
		$.each(OrderInfo.offerSpec.offerRoles,function(i,offerRole){
			if (offerRole.memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.offerRoleId==offerRole.offerRoleId && this.objType==CONST.OBJ_TYPE.PROD){
						$("#memeberChange ul:first li").text(this.accessNumber).attr("prodId",offerRole.prodId);
						_offerProd.objInstId=this.objInstId;
						_offerProd.accessNumber=this.accessNumber;
						return;
					}
				});
			} else if (offerRole.memberRoleCd == CONST.MEMBER_ROLE_CD.VICE_CARD) {
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.offerRoleId == offerRole.offerRoleId  && this.objType==CONST.OBJ_TYPE.PROD){
						var li = $("<li  id=\"li_viceCard_new_"+this.accessNumber+"\" style=\"width:100%\">").text(this.accessNumber).appendTo($("#memeberChange ul:last"));
						li.attr("del","N").attr("knew","N").attr("objId",this.objId).attr("objInstId",this.objInstId)
						  .attr("objType",this.objType).attr("offerMemberId",this.offerMemberId).attr("offerRoleId",this.offerRoleId);
						var eleI = $("<i id='plan_no'><a id='' accNbr='"+this.accessNumber+"' class='purchase' href='javascript:void(0)'>拆副卡</a></i>").appendTo(li);
						eleI.click(function(){
							if (($(this).parent().attr("del") == "N")) {
								$(this).parent().css("text-decoration","line-through").attr("del","Y").attr("knew","N");
								$(this).find("a").text("不 拆");
							} else {
								$(this).parent().css("text-decoration","").attr("del","N").attr("knew","N");
								$(this).find("a").text("拆副卡");
								$("#"+'viceCard_new_'+$(this).find("a").attr("accNbr")).html("");
							}
						});
						$("<span  id='viceCard_new_"+this.accessNumber+"'></span>").appendTo(li);
						var eleR = $("<i id='plan_no_remain'><a id='' accNbr='"+this.accessNumber+"' class='purchase' href='javascript:void(0)'>保留>>选择新套餐</a></i>").appendTo(li);
						eleR.click(function(){
							order.service.offerDialog('viceCard_new_'+$(this).find("a").attr("accNbr"));
							//$($("#plan_no")).parent().css("text-decoration","line-through").attr("del","Y");
						});	
						existViceCardNum++;
					}
				});
				$.each(offerRole.roleObjs,function(){  //便利副卡角色下的成员
					if(this.objType == CONST.OBJ_TYPE.PROD){
						this.minQty = 0;
						this.dfQty = 0;
						viceMinQty = 0;
						viceMaxQty = this.maxQty;
						numId = offerRole.offerRoleId+"_"+this.objId;//offerRole.memberRoleCd;
					}
				});
			}
		});
		
		
		//如果已有的副卡数量还未达到副卡的最大数量，加上增加副卡的按钮
		$("#memeberChange h5:last i").remove();
		if (existViceCardNum < viceMaxQty) {
			viceMaxQty = viceMaxQty-existViceCardNum;
			var cPanel = $("<i id='plan_no'>" +
					"<label>新增副卡：</label>" +
					"<a class='add'></a><input id='"+numId+"' type='text' value='0' class='numberTextBox width22' disabled='disabled'>" +
					"<a class='add2'></a>" +
					"</i>").appendTo($("#memeberChange h5:last"));
			cPanel.find("a:first").click(function(){
				var num = parseInt(cPanel.find("input").val());
				var ifRemoveProd = false;
				var lis = $("#memeberChange ul:last li");
				for (var i=0;i<lis.length;i++) {
					if ($(lis).attr("del") == "Y") {
						ifRemoveProd = true;
						break;
					}
				}
				var min=viceMinQty;
				if(ifRemoveProd){
					min=0;
				}
				if (num <= min) {
					$.alert("提示","副卡数量已经达到最小值，不能再减少。");
					return;
				} else {
					cPanel.find("input").val(num-1);
				}
			});
			cPanel.find("a:last").click(function(){
				var num = parseInt(cPanel.find("input").val());
				if (num >= viceMaxQty) {
					$.alert("提示","副卡数量已经达到最大值，不能再增加。");
					return;
				} else {
					cPanel.find("input").val(num+1);
				}
			});
		}
		$("#memeberChange .btna_o:last").click(function(){
			_closeDialog();
		});
		ec.form.dialog.createDialog({
			"id":"-memeberChange",
			"width":480,
			"height":400,
			"initCallBack":function(dialogForm,dialog){
				order.prodModify.dialogForm=dialogForm;
				order.prodModify.dialog=dialog;
			},
			"submitCallBack":function(dialogForm,dialog){}
		});
		
	};

	var _submit = function() {
		var lis = $("#memeberChange ul li");
		var ifRemoveProd = false;
		for (var i=0;i<lis.length;i++) {
			if ($(lis[i]).attr("del") == "Y"||$(lis[i]).attr("knew") == "Y") {
				ifRemoveProd = true;
				break;
			}
		}
		var num = $("#memeberChange ul:last h5 i input").val();
		if ((ifRemoveProd) && num> 0) {
			$.alert("提示","副卡拆机和副卡新装不能同时做，请分开两次操作");
			return;
		}
		if (!(ifRemoveProd) && num <=0) {
			$.alert("提示","没有对副卡进行操作。");
			return;
		}
		
		var prod = order.prodModify.choosedProdInfo; 
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
			instId : prod.prodOfferInstId,
			specId : prod.prodOfferId,
			prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
		}];
		if(num>0){//新装副卡
			OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,6,
					CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
			var param = {
				memberChange : "Y",
				type : 1,
				boActionTypeName : "主副卡成员变更",
				viceCardNum : parseInt(num),
				feeTypeMain:order.prodModify.choosedProdInfo.feeType,
				offerNum : 1,
				custId : OrderInfo.cust.custId,
				actionFlag:6,
				accessNumber:_offerProd.accessNumber,
				offerSpec: OrderInfo.offerSpec
			};
			order.service.setOfferSpec(); //把选择的主副卡数量保存
			if(rule.rule.ruleCheck(boInfos)){  //业务规则校验
				order.main.buildMainView(param);	
			}
			order.memberChange.closeDialog();
		}
	   if(ifRemoveProd){//保留副卡
		   var viceparam = [];
			var params =[];
			$.each($("#memeberChange ul: li"),function(i, li){//所有副卡信息
				if ($(this).attr("knew") == "Y"||$(this).attr("del") == "Y") {
					viceparam.push({
						objId : $(this).attr("objId"),
						objInstId : $(this).attr("objInstId"),
						objType : $(this).attr("objType"),
						offerRoleId : $(this).attr("addRoleId"),
						offerSpecId :$(this).attr("addSpecId"),
						offerMemberId:$(this).attr("offerMemberId"),
						del : $(this).attr("del"),
						knew : $(this).attr("knew")
					});
				}
			});
			var ooRoles = [];
			$.each($("#memeberChange ul: li"),function(i, li){
				if ($(this).attr("del") == "Y"||$(this).attr("knew") == "Y") {
					ooRoles.push({
						objId : $(this).attr("objId"),
						objInstId : $(this).attr("objInstId"),
						objType : $(this).attr("objType"),
						offerMemberId : $(this).attr("offerMemberId"),
						offerRoleId : $(this).attr("offerRoleId"),
						state:'DEL'
					});
				}
			});
			//params = {viceParam:viceparam,ooRoles:ooRoles};
		   OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,21,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
		   var boInfos = [{
				boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
				instId : _offerProd.offerId,
				specId : _offerProd.offerSpecId,
				prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
			}];
/*		   if(rule.rule.ruleCheck(boInfos)){  //业务规则校验
		   _removeAndAdd();
		   }*/
		   var submitFlag = "removeProd" ;
		   var boActionType=CONST.BO_ACTION_TYPE.ADDOREXIT_COMP;
			var callParam = {
				boActionTypeCd : boActionType,
				boActionTypeName : CONST.getBoActionTypeName(boActionType),
				//accessNumber : _choosedProdInfo.accNbr,
				submitFlag:submitFlag,
				viceParam:viceparam,
				ooRoles:ooRoles
			};
/*			OrderInfo.order.templateType=templateType;
			var v_actionFlag = 0 ;
			if(boActionType==CONST.BO_ACTION_TYPE.BUY_BACK){
				v_actionFlag =20;//OrderInfo.actionFlag
			}*/
			var param={
				areaId : OrderInfo.staff.areaId,
				staffId : OrderInfo.staff.staffId,
				channelId : OrderInfo.staff.channelId,
				custId : OrderInfo.cust.custId,
				boInfos : []
			};
			param.boInfos=boInfos;
			//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,boActionType,v_actionFlag,CONST.getBoActionTypeName(boActionType),templateType);
			var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
			if(flag) return;
	   }
	};
	var _closeDialog = function() {
		if(order.prodModify.dialogForm!=undefined&&order.prodModify.dialog!=undefined){
			order.prodModify.dialogForm.close(order.prodModify.dialog);
		}
	};
	//主卡不变副卡新装套餐
	var _removeAndAdd=function(date){
		var viceparam = [];
		var ooRoles =[];
		var params =[];
		viceparam=date.viceParam;
		ooRoles=date.ooRoles;
		params = {viceParam:viceparam,ooRoles:ooRoles,remark:$("#order_remark").val()};
		SoOrder.submitOrder(params);
		
	};
	//业务规则校验
	var _getCallRuleParam = function(boActionTypeCd,prodId) {
		return {
			areaId : OrderInfo.staff.areaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			boInfos : [{
				boActionTypeCd : boActionTypeCd,
				instId : prodId,
				specId : CONST.PROD_SPEC.CDMA,
				prodId : prodId
			}]
		};
	};
	return {
		showOfferCfgDialog : _showOfferCfgDialog,
		closeDialog : _closeDialog,
		submit : _submit,
		offerProd:_offerProd,
		ischooseOffer :_ischooseOffer,
		removeAndAdd :_removeAndAdd
	};
}();
$(function(){
	$("#memeberChangeclose").click(function(){
		order.memberChange.closeDialog();
	});
	$("#memeberChange .btna_o:first").click(function(){
		order.memberChange.closeDialog();
		order.memberChange.submit();
	});
	$("#memeberChange .btna_o:last").click(function(){
		order.memberChange.closeDialog();
	});
});
CommonUtils.regNamespace("order", "service");

order.service = (function(){
	var _offerprice=""; 
	
	//主套餐查询
	var _searchPack = function(pageIndex){
		var custId = OrderInfo.cust.custId;
		var searchtext = $('#searchtext').val();
		if(searchtext=="请输入您要搜索的套餐名称或首字母简拼"){
			searchtext="";
		}
		var phoneLevel=order.phoneNumber.boProdAn.level;
		if(phoneLevel==undefined&&phoneLevel==null){
			phoneLevel='';
		}
		var subPage=$("#subpageFlag").val();
		var params={"subPage":subPage,"qryStr":searchtext,"pnLevelId":phoneLevel,"custId":custId,"PageIndex":pageIndex,"PageSize":10};
		
		if($("#price_basic").css("display") != "none"){
			var priceVal = $("#price_basic a.selected").attr("val");
			if(priceVal!=null&&priceVal!=""){
				var priceArr = priceVal.split("-");
				if(priceArr[0]!=null&&priceArr[0]!=""){
					params.priceMin = priceArr[0] ;
				}
				if(priceArr[1]!=null&&priceArr[1]!=""){
					params.priceMax = priceArr[1] ;
				}
			}
		}
		if($("#influx_basic").css("display") != "none"){
			var influxVal = $("#influx_basic a.selected").attr("val");
			if(influxVal!=null&&influxVal!=""){
				var influxArr = influxVal.split("-");
				if(influxArr[0]!=null&&influxArr[0]!=""){
					params.INFLUXMin = influxArr[0]*1024 ;
				}
				if(influxArr[1]!=null&&influxArr[1]!=""){
					params.INFLUXMax = influxArr[1]*1024 ;
				}
			}
		}
		if($("#invoice_basic").css("display") != "none"){
			var invoiceVal = $("#invoice_basic a.selected").attr("val");
			if(invoiceVal!=null&&invoiceVal!=""){
				var invoiceArr = invoiceVal.split("-");
				if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
					params.INVOICEMin = invoiceArr[0] ;
				}
				if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
					params.INVOICEMax = invoiceArr[1] ;
				}
			}
		}
		_queryData(params);
		
	};
	
	var _searchPackById = function(prodOfferId){
		var params={"prodOfferId":prodOfferId,"pnLevelId":"","PageIndex":1,"PageSize":10};
		_queryData(params);
	};
	
	var _queryData = function(params) {
		if(OrderInfo.actionFlag==2){
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if(offerSpecId!=undefined){
				params.changeGradeProdOfferId = offerSpecId;
			}
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		var url = contextPath+"/order/offerSpecList";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				if(!response){
					response.data='<li><a href="#" class="ft">暂无套餐</a></li>';
				}
				if (response.code == -2) {
					return;
				}else if(response.code != 0) {
					$.alert("提示","response.code");
					return;
				}
				$("#service_detial").html(response.data).fadeIn();
				var show_per_page = 10; //每页显示条数
				var number_of_items = $('#offerlistcont').children().size();
				if(number_of_items==0){
					//var noitems_html = "<div style='text-align:center;'>抱歉，没有找到相关的套餐。</div>";
					var noitems_html = "<img width='25' height='25' src='"+contextPath+"/image/icon/tip.png'>抱歉，没有找到相关的套餐。";
					$("#errinfo").html(noitems_html);
					$('#page_navigation').html("");
				}else{
					var number_of_pages = Math.ceil(number_of_items/show_per_page);
					$('#current_page').val(0);
					$('#show_per_page').val(show_per_page);
					var navigation_html = '<label><span class="pageUpGray" onclick="order.service.previous();">上一页</span></label><label>';
					var current_link = 0;
					while(number_of_pages > current_link){
						navigation_html += '<a class="page_link" href="javascript:order.service.go_to_page(' + current_link +')" longdesc="' + current_link +'">'+ (current_link + 1) +'</a>';
						current_link++;
					}
					navigation_html += '</label><label><span class="nextPageGrayOrange" onclick="order.service.next();">下一页</span></label>';
					$('#page_navigation').html(navigation_html);
					$('#page_navigation .page_link:first').addClass('pagingSelect');
					//$('#page_navigation .page_link:first').removeClass('page_link');
					$('#offerlistcont').children().css('display', 'none');
					$('#offerlistcont').children().slice(0, show_per_page).css('display', 'table-row');
					if($('.pagingSelect').next('.page_link').length==false){
						$('.nextPageGrayOrange').removeClass('nextPageGrayOrange').addClass('nextPageGray');
					}
				}	
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	/**
	 * 根据合约规格编码aoId查询主销售品
	 */
	var _queryPackForTerm = function(aoId, agreementType, numLevel){
		var params={
			"aoId":aoId,
			"agreementType":agreementType,
			"numLevel":numLevel
		};
		var url = contextPath+"/order/queryPackForTerm";
		var response = $.callServiceAsJson(url,params, {});
		return response;
	};
	
	//订购销售品
	var _buyService = function(id,specId,price) {
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
			return;
		}
		var param = {
			"price":price,
			"id" : id,
			"specId" : specId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.areaId
		};
		if(OrderInfo.actionFlag == 2){  //套餐变更不做校验
			order.service.opeSer(param);   
		}else {  //新装
			var boInfos = [{
	            boActionTypeCd: "S1",//动作类型
	            instId : "",
	            specId : specId //产品（销售品）规格ID
	        }];
	        if(rule.rule.ruleCheck(boInfos)){  //业务规则校验通过
	        	order.service.opeSer(param);   
	        }
		}
	};
	
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){	
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		if(OrderInfo.actionFlag == 2){ //套餐变更
			offerChange.offerChangeView();
			return;
		}
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var $tbody = $("#member_tbody");
		$tbody.html("");
		$("#main_title").text(OrderInfo.offerSpec.offerSpecName);
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			var $tr = $("<tr style='background:#f8f8f8;'></tr>");
			var $td = $('<td class="borderLTB" style="font-size:14px; padding:0px 0px 0px 12px"><span style="color:#518652; font-size:14px;">'
					+offerRole.offerRoleName+'</span>&nbsp;&nbsp;</td>');
			if(this.memberRoleCd == CONST.MEMBER_ROLE_CD.CONTENT){
				$tr.append($td).append($("<td colspan='3'></td>")).appendTo($tbody);
			}else{
				$tr.append($td).appendTo($tbody);
			}
			
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
				if(this.objType == CONST.OBJ_TYPE.PROD){
					if(offerRole.minQty == 0){ //加装角色
						this.minQty = 0;
						this.dfQty = 0;
					}
					var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
					$tr.append("<td align='left' colspan='3'>"+this.objName+" :<i id='plan_no' style='margin-top: 3px; display: inline-block; vertical-align: middle;'>"+
							"<a class='add' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'></a>"+
							"<input id='"+objInstId+"' type='text' value='"+this.dfQty+"' class='numberTextBox width22' readonly='readonly'>"+
							"<a class='add2' href='javascript:order.service.addNum(\""+objInstId+"\","+this.maxQty+");'> </a>"+
							"</i>"+this.minQty+"-"+max+"（张） </td>");	
					iflag++;
				}
			});
			var $trServ = $("<tr></tr>");
			var i = 0;
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id	
				if(this.objType == CONST.OBJ_TYPE.SERV){  //是否有功能产品
					if(i%4==0){
						$trServ = $("<tr></tr>");
						$trServ.appendTo($tbody);
					}
					var $input = $('<input id="'+objInstId+'" name="'+offerRole.offerRoleId+'" type="checkbox">'+this.objName+'</input>');
					if(this.minQty == 0){
						if(this.dfQty>0){
							$input.attr("checked","checked");
						}
					}else if(this.minQty > 0){
						$input.attr("checked","checked");
						$input.attr("disabled","disabled");
					}
					var $td = $("<td></td>");
					$td.append($input).appendTo($trServ);
					i++;
					iflag++;
				}
			});
		});
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(iflag>1){
			easyDialog.open({
				container : "member_dialog"
			});
			$("#member_btn").off("click").on("click",function(){
				order.service.confirm(param);
			});
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};
	
	//选择完主套餐构成后确认
	var _confirm = function(param){
		if(!_setOfferSpec()){
			$.alert("错误提示","请选择一个接入产品");
			return;
		}
		if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
			order.main.buildMainView(param);	
		}
		easyDialog.close();
	};
	
	//根据页面选择成员数量保存销售品规格构成 offerType为1是单产品
	var _setOfferSpec = function(offerType){
		var k = -1;
		var flag = false;  //判断是否选接入产品
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			offerRole.prodInsts = []; //角色对象实例
			$.each(this.roleObjs,function(){
				if(this.objType== CONST.OBJ_TYPE.PROD){  //接入类产品
					var num = 0;  //接入类产品数量选择
					if(offerType==1){  //单产品
						num = 1;
					}else{ //多成员销售品
						num = $("#"+offerRole.offerRoleId+"_"+this.objId).val();  //接入类产品数量选择
					}
					if(num==undefined || num==""){
						num = 0;
					}
					for ( var i = 0; i < num; i++) {
						var newObject = jQuery.extend(true, {}, this); 
						newObject.prodInstId = k--;
						if(num>1){ //同一个规格产品选择多个
							newObject.offerRoleName = offerRole.offerRoleName+(i+1);
						}else{
							newObject.offerRoleName = offerRole.offerRoleName;
						}
						newObject.memberRoleCd = offerRole.memberRoleCd;
						offerRole.prodInsts.push(newObject);   
						flag = true;
					}
					offerRole.selQty = num;
				}else{ //功能类产品
					if(this.minQty==0 && $("#"+offerRole.offerRoleId+"_"+this.objId).attr("checked")=="checked"){
						this.dfQty = 1;
					}
				}
			});
		});
		return flag;
	};
	
	var _addNum = function(id,max){
		var num = Number($("#"+id).val());
		if(max<0){
			num+=1;
			$("#"+id).val(num);
		}else{
			if(num<max){
				num+=1;
				$("#"+id).val(num);
			}
		}		
	};
	
	var _subNum = function(id,min){
		var num = Number($("#"+id).val());
		if(num>min){
			num-=1;
			$("#"+id).val(num);
		}		
	};
	
	var _addNumNoLim = function(id){
		var num = Number($("#"+id).val());
		num+=1;
		$("#"+id).val(num);		
	};
	
	var _subNumNoLim = function(id){
		var num = Number($("#"+id).val());
		num-=1;
		$("#"+id).val(num);		
	};
	
	var _previous= function(){
		new_page = parseInt($('#current_page').val()) - 1;
		if($('.pagingSelect').prev('.page_link').length==true){
			go_to_page(new_page);
		}
		
	};

	var _next=function(){
		new_page = parseInt($('#current_page').val()) + 1;
		if($('.pagingSelect').next('.page_link').length==true){
			go_to_page(new_page);
		}
		
	};
	
	var go_to_page = function(page_num){
		var show_per_page = parseInt($('#show_per_page').val());
		start_from = page_num * show_per_page;
		end_on = start_from + show_per_page;
		$('#offerlistcont').children().css('display', 'none').slice(start_from, end_on).css('display', 'table-row');
		$('.page_link[longdesc=' + page_num +']').addClass('pagingSelect').siblings('.pagingSelect').removeClass('pagingSelect');
		$('#current_page').val(page_num);
		if($('.pagingSelect').prev('.page_link').length==true){
			$('.pageUpGray').removeClass('pageUpGray').addClass('pageUpOrange');
		}else{
			$('.pageUpOrange').removeClass('pageUpOrange').addClass('pageUpGray');
		}
		
		if($('.pagingSelect').next('.page_link').length==true){
			$('.nextPageGray').removeClass('nextPageGray').addClass('nextPageGrayOrange');
		}else{
			$('.nextPageGrayOrange').removeClass('nextPageGrayOrange').addClass('nextPageGray');
		}
	};
	
	//订单取消时，释放已预占资源的入口标识。0：初始化状态，1：购机或选号入口，2：套餐入口
	var _releaseFlag = 0;
	//购机和选号入口的预占号码信息缓存
	var _boProdAn = {};

	var _initSpec = function(){
		$("#search").off("click").on("click",function(){order.service.searchPack();});
	};
	var _offerDialog=function(subPage){
		var param={};
		var url=contextPath+"/order/prodoffer/prepare?subPage="+subPage;
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>页面显示失败,稍后重试</strong></div>';
				}
				if(response.code != 0) {
					$.alert("提示","页面显示失败,稍后重试");
					return;
				}
				var content$=$("#offerspecContent");
				content$.html(response.data);
				order.prepare.backToInit();
				_initSpec();
				order.prodOffer.queryApConfig();
				order.service.searchPack();
				$("#chooseofferspecclose").click(function(){
					_closeChooseDialog();
				});
				easyDialog.open({
					container : 'chooseofferspec'
				});
			}
		});	
	};
	var _closeChooseDialog = function() {
		if (!$("#chooseofferspec").is(":hidden")){
			easyDialog.close();
		}
	};
	var _choosedOffer=function(id,specId,price,subpage,specName){
		var param={"offerSpecId":specId};
		var response = $.callServiceAsJson(contextPath+"/order/queryOfferSpec",param);
		if (response.code==0) {
			if(response.data){
				var offerRoleId="";
				var prodOfferSpec=response.data.offerSpec;
				if (prodOfferSpec && prodOfferSpec.offerRoles) {
					var offerRoles = prodOfferSpec.offerRoles;
					for (var i=0;i<offerRoles.length;i++){
						if (offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD
								|| offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.VICE_CARD) {
							if(offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
								offerRoleId=offerRoles[i].offerRoleId;
								break;
							}
						}else{
							offerRoleId=offerRoles[i].offerRoleId;
							break;
						}
					}
				}
				if(offerRoleId!=""){
					_closeChooseDialog();
					order.prodModify.chooseOfferForMember(specId,subpage,specName,offerRoleId);
				}else{
					$.alert("提示","无法选择套餐，套餐规格查询失败！");
				}
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","套餐详细加载失败，请稍后再试！");
		}
	};
	return {
		searchPack	:_searchPack,
		queryPackForTerm:_queryPackForTerm,
		addNum:_addNum,
		subNum:_subNum,
		addNumNoLim:_addNumNoLim,
		subNumNoLim:_subNumNoLim,
		opeSer : _opeSer,
		buyService :_buyService,
		previous:_previous,
		next:_next,
		go_to_page:go_to_page,
		releaseFlag:_releaseFlag,
		boProdAn:_boProdAn,
		offerprice:_offerprice,
		initSpec:_initSpec,
		searchPackById:_searchPackById,
		offerDialog:_offerDialog,
		choosedOffer:_choosedOffer,
		setOfferSpec:_setOfferSpec,
		confirm		: _confirm
	};
})();


CommonUtils.regNamespace("order", "main");

order.main = (function(){ 
	
	/**
	 * 填单页面展示
	 * param = {
	 * 		boActionTypeCd : S1,
	 * 		boActionTypeName : "订购",
	 *		offerSpecId : 1234,//销售品规格ID
	 *		offerSpecName : "乐享3G-129套餐",//销售品名称,
	 *		feeType : 2100,付费类型
	 *		viceCardNum : 2,//副卡数量
	 *		offerNum : 3,//销售品数量
	 *		type : 1,//1购套餐2购终端3选靓号
	 *		terminalInfo : {
	 *			terminalName : "iphone",
	 *			terminalCode : "2341234124"
	 *		},
	 *		offerRoles : [
	 *			{
	 *				offerRoleId : 1234,
	 *				offerRoleName : "主卡",
	 *				memberRoleCd : "0",
	 *				roleObjs : [{
	 *					offerRoleId : 1,
	 *					objId : ,
	 *					objName : "CDMA",
	 *					objType : 2
	 *				}]
	 *			},
	 *			{
	 *				offerRoleId : 2345,
	 *				offerRoleName : "副卡",
	 *				memberRoleCd : "1"
	 *			}
	 *		]
	 *	}
	 * 
	 */
	var _buildMainView = function(param) {
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		$.callServiceAsHtml(contextPath+"/order/main",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					offerChange.fillOfferChange(response,param);
				}else {
					_callBackBuildView(response,param);
				}
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//展示回调函数
	var _callBackBuildView = function(response, param) {
		order.prepare.showOrderTitle(OrderInfo.actionTypeName, param.offerSpecName, false);
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_fill_content").html(response.data);
		_initOrderLabel();//初始化订单标签
		_initOfferLabel();//初始化主副卡标签
		_initFeeType(param);//初始化付费方式
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
			_initAcct();//初始化帐户列表 
			order.dealer.initDealer();//初始化协销		
		}
		_loadOther(param);//页面加载完再加载其他元素
		if(OrderInfo.actionFlag==1){
			$("#templateOrderDiv").show();
		}
		_addEvent();//添加页面事件
		order.phoneNumber.initOffer('-1');//主卡自动填充号码入口已选过的号码
		$("#fillNextStep").off("click").on("click",function(){
			SoOrder.submitOrder();
		});
		if (param.memberChange) {
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#productDiv .pdcardcon:first").show();
			order.prepare.step(1);
			$("#fillLastStep").off("click").on("click",function(){
				order.prodModify.cancel();
			});
		}else{
			$("#fillLastStep").off("click").on("click",function(){
				_lastStep();
			});
		}
	};
	
	//动态添加产品属性、附属销售品等
	var _loadOther = function(param) {
		$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
			var offerRole = this;
			for ( var i = 0; i < this.prodInsts.length; i++) {
				var prodInst = this.prodInsts[i];
				var param = {   
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					prodSpecId : prodInst.objId,
					offerRoleId: prodInst.offerRoleId,
					prodId : prodInst.prodInstId,
					queryType : "1,2",
					objType: prodInst.objType,
					objId: prodInst.objId,
					memberRoleCd : prodInst.memberRoleCd
				};
				AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品
				var obj = {
					ul_id : "item_order_"+prodInst.prodInstId,
					prodId : prodInst.prodInstId,
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					compProdSpecId : "",
					prodSpecId : prodInst.objId,
					roleCd : offerRole.roleCd,
					offerRoleId : offerRole.offerRoleId,
					partyId : OrderInfo.cust.custId
				};
				order.main.spec_parm(obj); //加载产品属性
			}			
		});
	};
	
	var _paymethodChange = function(obj){
		$(".paymethodChange").each(function(){
			if($(this).attr("id")!=$(obj).attr("id")){
				$(this).val($(obj).val());
			}
		});
	};
	
	var _templateTypeCheck = function(obj){
		if($("#isTemplateOrder").attr("checked")=="checked"){//如果选择批量模板
			var paytype=$('select[name="pay_type_-1"]').val(); 
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paytype!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paytype!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
			/*
			var paymethod = null ;
			var paymethodid = null ;
			$(".paymethodChange").each(function(){//获取第一个付费方式
				if(paymethod==null){
					paymethod = $(this).val();
					paymethodid = $(this).attr("id");
				}
			});
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paymethod!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paymethod!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
			*/
		}
		return true ;
	};
	
	var _initFeeType = function(param) {
		if (param.feeType != undefined && param.feeType && param.feeType != CONST.PAY_TYPE.NOLIMIT_PAY) {
			$("input[name^=pay_type_][value="+param.feeType+"]").attr("checked","checked");
			$("input[name^=pay_type_]").attr("disabled","disabled");
		}
	};
	
	//初始化帐户展示
	var _initAcct = function() {
		//新客户自动新建帐户
		if(OrderInfo.cust.custId==-1){
			_createAcct();
		}
		else{
			//主副卡成员变更业务不能更改帐户，只展示主卡帐户
			if(OrderInfo.actionFlag==6){
				var param = {
						prodId : order.prodModify.choosedProdInfo.prodInstId,
						acctNbr : order.prodModify.choosedProdInfo.accNbr
				};
				var jr = $.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param);
				if(jr.code==-2){
					$.alertM(jr.data);
					return;
				}
				var prodAcctInfos = jr.data;
				$("#accountDiv").find("label:eq(0)").text("主卡帐户：");
				$.each(prodAcctInfos, function(i, prodAcctInfo){
					$("<option>").text(prodAcctInfo.owner+" : "+prodAcctInfo.name).attr("value",prodAcctInfo.acctId)
					.attr("acctcd",prodAcctInfo.acctCd).appendTo($("#acctSelect"));					
				});
				$("#accountDiv").find("a:eq(0)").hide();
			}
			else{
				//先查询客户下的已有帐户
				var param = {
					custId : OrderInfo.cust.custId
				};				
				$.callServiceAsJson(contextPath+"/order/account", param, {
					"done" : function(response){
						if (response==undefined) {
							$.alert("提示", "帐户查询失败");
							return;
						}
						if (response.code==0) {
							var returnMap = response.data;
							if(returnMap.resultCode==0){
								if(returnMap.accountInfos && returnMap.accountInfos.length > 0){
									$.each(returnMap.accountInfos, function(i, accountInfo){
										$("<option>").text("[已有] "+accountInfo.owner+" : "+accountInfo.name).attr("value",accountInfo.acctId).attr("acctcd",accountInfo.accountNumber).appendTo($("#acctSelect"));
									});
								}			
							}
							else{
								$.alert("提示", "客户的帐户定位失败，请联系管理员，若要办理新装业务请稍后再试或者使用新建帐户。错误细节："+returnMap.resultMsg);
							}
						} else {
							if (response.code==-2) {
								$.alertM(response.data);
								return;
							} else {
								$.alert("提示",response.data);
							}							
						}
						//无论是否查询到旧帐户，最后都新建一个账户
						_createAcct();
					}
				});				
			}
		}
	};
	
	//初始化订单标签
	var _initOrderLabel = function() {
		//订单标签
		$(".ordertabcon:first").show();
		$(".ordertab li:first").addClass("setorder");
		$(".ordertab li").each(function(index){
			$(this).click(function(){
				var orderSeq = $(this).attr("order");
				if (orderSeq > 1) {
					$(".order_copy").show();
				} else {
					$(".order_copy").hide();
				}
				$(this).addClass("setorder").siblings().removeClass("setorder");
				$(this).parents(".ordernav").parent().siblings(".ordercon").find(".ordertabcon").eq(index).show().siblings().hide();
			});
		});
	};
	
	//初始化主副卡标签
	var _initOfferLabel = function() {
		//主副卡标签
		$.each($(".pdcard"),function(i, pdcard){
			$(this).find("li:first").addClass("setcon");
			$.each($(this).find("li"),function(j, li){
				$(this).click(function(){
					$(this).addClass("setcon").siblings().removeClass("setcon");
					$(this).parent().parent().next(".cardtabcon").find(".pdcardcon").eq(j).show().siblings().hide();
				});
			});
		});
		
	};
	
	//添加页面点击事件
	var _addEvent = function() {		
		//页面点击帐户查询
		$('#acctQueryForm').bind('formIsValid', function(event, form) {
			var response;
			//根据接入号查询帐户
			if($("#chooseQueryAcctType").val()==1){
//				var param = {
//						accessNumber : $("#d_query_nbr input").val(),
//						prodPwd : $("#d_query_pwd input").val()
//				};
				//根据接入号查询帐户需先经过产品密码鉴权
//				var jr = $.callServiceAsJson(contextPath + "/order/prodAuth", param);
//				if (jr.code==0){
					var acctQueryParam = {
						accessNumber : $("#d_query_nbr input").val()							
					};
					response = _queryAcct(acctQueryParam);
//				} 
//				else{
//					$.alert("提示",jr.data);
//				}				
			} 
			//根据合同号查询帐户
			else{
				var acctQueryParam = {
					acctCd : $("#d_query_cd input").val()
				};
				response = _queryAcct(acctQueryParam);
			}
			$("#acctListTab tbody").empty();
			if(response.code==0){
				var returnMap = response.data;
				if(returnMap.resultCode==0){
					if(returnMap.accountInfos && returnMap.accountInfos.length > 0){
						$("#acctPageDiv").empty();
						common.page.init("acctPageDiv",5,"pageId","queryAccount",returnMap.accountInfos);
					} 
					else{
						$("<tr><td colspan=4>未查询到帐户信息</td></tr>").appendTo($("#acctListTab tbody"));
					}
				}
				else{
					$("<tr><td colspan=4>"+returnMap.resultMsg+"</td></tr>").appendTo($("#acctListTab tbody"));
				}				
			} 
			else{
				$("<tr><td colspan=4>"+response.data+"</td</tr>").appendTo($("#acctListTab tbody"));
			}
		}).ketchup({bindElement:"querAcctBtn"});

		$("#zhanghuclose").click(function(){
			easyDialog.close();
			//删除所有选择帐户监听
			$(document).removeJEventListener("chooseAcct");
		});
		$(this).addJEventListener("queryAccount",function(data){
			_showAcct(data);
		});
		///选择根据接入号还是合同号查询帐户
		$("#chooseQueryAcctType").change(function(){
			if($(this).val() == 1) {
				$("#d_query_cd").remove();
				$("#querAcctBtn").parent().before("<dd id='d_query_nbr'>&nbsp;<input type='text' data-validate='validate(required:接入号不能为空) on(keyup blur)'" +
						" value='' class='inputWidth150px'></dd>");
//				$("#querAcctBtn").parent().before("<dd id='d_query_pwd'>&nbsp; 产品密码：&nbsp;<input  type='password' data-validate='validate(required:密码不能为空) on(keyup blur)' " +
//						"value='' class='inputWidth150px'></dd>");
			} else {
				$("#d_query_nbr").remove();
//				$("#d_query_pwd").remove();
				$("#querAcctBtn").parent().before("<dd id='d_query_cd'>&nbsp;<input type='text' data-validate='validate(required:合同号不能为空) on(keyup blur)'" +
						" value='' class='inputWidth150px' ></dd>");
			}
		});
		$("#chooseQueryAcctType").change();
		//选择帐户
		$("#acctSelect").change(function(){
			if($(this).val()>0){
				$(this).parent().find("a:eq(1)").show();
				$("#defineNewAcct").hide();
			}
			else{
				$(this).parent().find("a:eq(1)").hide();
				$("#defineNewAcct").show();
			}
		});
	};
	
	//查询帐户（新装时查询已有帐户）
	var _queryAcct = function(acctQueryParam) {
		var response = $.callServiceAsJson(contextPath+"/order/account", acctQueryParam);
		if(response.code==-2){
			$.alertM(response.data);
			return;
		}
		return response;
	};
	
	//展示帐户
	var _showAcct = function(accountInfos){
		$("#acctListTab tbody").empty();
		$.each(accountInfos,function(i, accountInfo){			
			var tr = $("<tr></tr>").appendTo($("#acctListTab tbody"));
			if(accountInfo.name){
				$("<td class='teleNum'>"+accountInfo.name+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.acctId){
				$("<td acctId='"+accountInfo.acctId+"'>"+accountInfo.accountNumber+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.owner){
				$("<td>"+accountInfo.owner+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.accessNumber){
				$("<td>"+accountInfo.accessNumber+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			tr.click(function(){
				var found = false;
				var custAccts = $("#acctSelect").find("option");
				$.each(custAccts, function(i, custAcct){
					if(custAcct.value==accountInfo.acctId){
						$("#acctSelect").find("option[value="+custAcct.value+"]").attr("selected","selected");
						found = true;
						return false;
					}					
				});					
				$(this).dispatchJEvent("chooseAcct",accountInfo);				
				easyDialog.close();
				$("#defineNewAcct").hide();
			});
		});
	};
	
	//复制订单一的数据到当前订单
	var _copyOrder = function(scope) {
		//获取订单一的数据
		//主卡数据
//		var param = {};
//		var tarOrderSeq = $(".order_confirmation:visible").attr("order");
//		//付费方式
//		var paymethod = $("input[name=order_1_main_pay_type]:checked").val().trim();
//		if (paymethod) {
//			$("input[name=order_"+tarOrderSeq+"_main_pay_type][value="+paymethod+"]").attr("checked","checked");
//		}
//		//产品密码
//		var mainPwd  = $("#order_1_main_pwd").val();
//		if (mainPwd) {
//			$("#order_"+tarOrderSeq+"_main_pwd").val(mainPwd);
//		}
//		//判断是否有副卡
//		if ($("input[name=order_1_vice_1_pay_type]")[0]) {
//			$.each($("div[order=1]").find("div[vice=1]"),function(i,div){
//				//付费方式
//				var method = $("input[name=order_1_vice_"+(i+1)+"_pay_type]:checked").val();
//				//产品密码
//				if (method) {
//					$("input[name=order_"+tarOrderSeq+"_vice_"+(i+1)+"_pay_type][value="+method+"]").attr("checked","checked");
//				}
//				var pwd = $("#order_1_vice_"+(i+1)+"_pwd").val();
//				if (pwd) {
//					$("#order_"+tarOrderSeq+"_vice_"+(i+1)+"_pwd").val(pwd);
//				}
//			});
//		}
//		//协销人
//		var dealer = $("#order_1_dealer").val().trim();
//		if (dealer) {
//			$("#order_"+tarOrderSeq+"_dealer").val(dealer);
//			$("#order_"+tarOrderSeq+"_dealer").attr("staffId",$("#order_1_dealer").attr("staffId"));
//		}
//		//订单备注
//		var remark = $("#order_1_remark").val().trim();
//		if (remark) {
//			$("#order_"+tarOrderSeq+"_remark").val(dealer);
//		}
	};
	
	function _spec_parm(param){
		$.callServiceAsHtmlGet(contextPath + "/order/orderSpecParam",param, {
			"done" : function(response){
				if(response && response.code == -2){
					if(param.prodId!=-1&&param.prodId!="-1"){
						$("#"+param.ul_id).append("<li><label> </label></li>");
					}
					return ;
				}else if(response && (response.data == 0||response.data == "0")){
					if(param.prodId!=-1&&param.prodId!="-1"){
						$("#"+param.ul_id).append("<li><label> </label></li>");
					}
					//$.alert("提示","该产品无产品规格属性！");
					return;
				}
				//$("#order_spec_parm").append(response.data);
				$("#"+param.ul_id).append(response.data);
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
	}
	
	//产品属性 提交
	function _spec_parm_change_save(){
		//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		if(!_check_parm("order_spc_update")){
			return ;
		}
		var boProdItems = new Array();
		//input
		var chang_row = 0;
		$("#order_spc_update input").each(function(){
			//订单属性 是否模板 由公共类自动添加，这里不加入属性
			if($(this).attr("id")!="order_remark"&&$(this).attr("id")!="isTemplateOrder"&&$(this).attr("id")!="templateOrderName"&&$(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		//select
		$("#order_spc_update select").each(function(){
			if($(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		var busiOrderAttrs ;
		if($("#order_remark").val()){
			busiOrderAttrs = [{
				atomActionId : OrderInfo.SEQ.atomActionSeq--,
				itemSpecId : CONST.ITEM_SPEC_ID_CODE.busiOrderAttrs ,//"111111122",//备注的ID，待修改
				value : $("#order_remark").val()
			}];
			chang_row++;
		}
		if(chang_row<1){
			$.alert("提示","您未修改订单属性");
			return ;
		}
		/*
		if(!SoOrder.builder()){//加载实例缓存，并且初始化订单数据
			return;
		} 
		*/
		//配置参数：来调用产品属性修改的ser
		//OrderInfo.boProdItems = boProdItems ;
		var data = {boProdItems:boProdItems} ;
		if(busiOrderAttrs){
			data.busiOrderAttrs = busiOrderAttrs ;
		}
		OrderInfo.actionFlag=33;//改产品属性
		SoOrder.submitOrder(data);

	}
	//产品属性-校验所有属性
	function _check_parm(ul_id){
		var f = true ;
		$("#"+ul_id).find("input").each(function(){
			if(f){
				f = _check_parm_self(this);
			}
		});
		return f;
	}
	//产品属性-校验单个属性
	function _check_parm_self(obj){
		//alert("---"+$(obj).val());
		if($(obj).attr("check_option")=="N"){
			if($(obj).val()==null||$(obj).val()==""){
				$.alert("提示",$(obj).attr("check_name")+" 尚未填写");
				return false;
			}
		}
		
		if($(obj).attr("check_type")=="check"){
			var len = $(obj).attr("check_len");
			//alert($(this).val()+"--"+len);
			if(len>0){
				//alert($(this).val().length+"---"+len);
				if($(obj).val().length>len){
					$.alert("提示",$(obj).attr("check_name")+" 长度过长(<"+len+")");
					return false;
				}
			}
			var mask = $(obj).attr("check_mask");
			if(mask!=null&&$(obj).val()!=null&&$(obj).val()!=""){
				//alert($(obj).val()+"---"+mask);
				//mask= "^[A-Za-z]+$";
				var pattern = new RegExp(mask) ;
				if(!pattern.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 校验失败：" + $(obj).attr("check_mess"));
					return false;
				}
			}
			var v_len = $(obj).val().length;
			if(v_len>0&&$(obj).attr("dataType")=="3"){//整数
				if(!/^[0-9]+$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非数字，请修改");
					return false;
				}
			}else if(v_len>0&&$(obj).attr("dataType")=="5"){//小数
				if(!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非小数，请修改");
					return false;
				}
			}else if(v_len>0&&($(obj).attr("dataType")=="4"||$(obj).attr("dataType")=="16")){//日期
				/*
				if(/Invalid|NaN/.test(new Date($(obj).val().substring(0,10)))){
					$.alert("提示",$(obj).attr("check_name")+ " 非日期，请修改");
					return false;
				}
				*/
			}
		}
		return true ;
	}
	
	$('staff_dialog_close').onclick = function(){
		easyDialog.close();
	};
	
	//协销人-查询
	function _queryStaffPage(qryPage){
		_queryStaff(qryPage,$("#dealer_id").val(),$("#objInstId").val());
	}
	//协销人-查询
	function _queryStaff(qryPage,v_id,objInstId){
		var param = {
				"dealerId":v_id,
				"staffName":$("#qryStaffName").val(),
				"staffCode":$("#qryStaffCode").val(),
				"salesCode":$("#qrySalesCode").val(),
				"pageIndex":qryPage,
				"objInstId":objInstId,
				"pageSize":10
		};
		
		$.callServiceAsHtml(contextPath + "/staffMgr/getStaffList",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					response.data='';
				}
				$("#div_staff_dialog").html(response.data);
				
				$("#staff_list_body tr").each(function(){$(this).off("click").on("click",function(event){
					_linkSelectPlan("#staff_list_body tr",this);
					event.stopPropagation();
					});});
				easyDialog.open({
					container : "div_staff_dialog"
				});
				
			}
		});	

	}
	
	var _linkSelectPlan=function(loc, selected){
		$(loc).removeClass("plan_select");
		$(loc).children(":first-child").html("");
		$(selected).addClass("plan_select");
		var nike="<i class='select'></i>";
		$(selected).children(":first").html(nike);
	};
	//协销人-修改
	function _setStaff(objInstId){
		var $staff = $("#staff_list_body .plan_select");
		$staff.each(function(){
			$("#dealer_"+objInstId).val($(this).attr("staffName")).attr("staffId", $(this).attr("staffId"));
		});
		if($staff.length > 0){
			easyDialog.close();
		}else{
			$.alert("操作提示","请选择 协销人！");
		}
	}
	/*
	function _setStaff(v_id,staffId,staffCode,staffName){
		//alert(v_id+"--"+staffId+"=="+staffName);
		$("#"+v_id).val(staffName+"("+staffCode+")").attr("staffId",staffId);
		if(!$("#acctDialog").is("hidden")) {
			easyDialog.close();
		}
	}
	*/
	
	//帐户查询
	var _chooseAcct = function() {
		$("#acctDialog .contract_list td").text("帐户查询");
		$("#acctDialog .selectList").show();
		easyDialog.open({
			container : 'acctDialog'
		});
		var listenerName = "chooseAcct";
		var $sel = $("#acctSelect");
		if (!$sel.hasJEventListener(listenerName)) {
			$sel.addJEventListener(listenerName,function(data){
				//遍历当前帐户列表，如果已存在，则直接显示，如果不存在，则加上一个option					
				var found = false;					
				$.each($sel.find("option"), function(i, option) {						
					if ($(option).val() == data.acctId) {							
						found = true;							
						return false;						
					}					
				});					
				if (found==false) {						
					$("<option>").text(data.owner+" : "+data.name).attr("value",data.acctId).attr("acctcd",data.accountNumber).appendTo($sel);					
				}
				$sel.find("option[value="+data.acctId+"]").attr("selected","selected");
				if(data.acctId>0){
					$("#account").find("a:eq(1)").show();
				}
			});
		}
		//初始化弹出框
		$("#acctListTab tbody").empty();
		$("#acctPageDiv").empty();
	};
	
	//新增帐户
	var _createAcct = function() {			
		$("#acctSelect").append("<option value='-1' style='color:red'>[新增] "+OrderInfo.cust.partyName+"</option>");		
		$("#acctSelect").find("option[value='-1']").attr("selected","selected");
		$("#acctName").val(OrderInfo.cust.partyName);//默认帐户名称为客户名称
		//新增帐户自定义支付属性
		$("#defineNewAcct").show();
		//隐藏帐户信息的按钮
		$("#account").find("a:gt(0)").hide();
		//获取账单投递信息主数据并初始化新建帐户自定义属性
		window.setTimeout("order.main.showNewAcct()", 0);
	};
	//获取账单投递信息主数据并初始化新建帐户自定义属性
	var _showNewAcct = function(){
		acct.acctModify.getBILL_POST(function(){
			acct.acctModify.paymentType();
			acct.acctModify.billPostType();
		});
	};
	
	//帐户详情
	var _acctDetail = function() {
		var acctSel = $("#acctSelect");
		if(!acctSel.val()) {
			$.alert("提示","请选择一个帐户");
		}
		if (acctSel.val() == -1) {
			$.alert("提示","该帐户是新建帐户");
			return;
		} 
		else {
			$("#acctDialog .contract_list td").text("帐户信息");
			$("#acctDialog .selectList").hide();
			var param = {
				acctCd : acctSel.find("option:selected").attr("acctcd")
			};
			var response = _queryAcct(param);
			var resultMap = response.data;
			_showAcct(resultMap.accountInfos);
			$("#acctListTab tr").off("click");
			easyDialog.open({
				container : 'acctDialog'
			});
		}
	};
	
	var _lastStep = function() {
		$.confirm("信息","确定回到上一步吗？",{
			yes:function(){
				//TODO　may initialize something;				
				var boProdAns = OrderInfo.boProdAns;
				var boProdAn = order.service.boProdAn;
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//若是购机或选号入口则将继续释放主卡以外的预占号码（过滤身份证预占的号码）
//				if(order.service.releaseFlag==1){
//					if(boProdAns.length>0){
//						for(var n=0;n<boProdAns.length;n++){
//							if(boProdAns[n].accessNumber==boProdAn.accessNumber || boProdAns[n].idFlag){
//								continue;
//							}
//							var param = {
//									numType : 1,
//									numValue : boProdAns[n].accessNumber
//							};
//							$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
//						}
//					}
//				}
				//若是套餐入口则将继续释放主副卡预占的号码（过滤身份证预占的号码）
//				if(order.service.releaseFlag==2){
//					if(boProdAns.length>0){
//						for(var n=0;n<boProdAns.length;n++){
//							if(boProdAns[n].idFlag){
//								continue;
//							}
//							var param = {
//									numType : 1,
//									numValue : boProdAns[n].accessNumber
//							};
//							$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
//						}
//					}
//					if(boProdAn.accessNumber!='')
//						order.phoneNumber.resetBoProdAn();
//				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
						if(boProdAns[n].idFlag){
							continue;
						}
						var param = {
								numType : 1,
								numValue : boProdAns[n].accessNumber
						};
						$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
					}
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
				
				$("#order_fill_content").empty();
				order.prepare.showOrderTitle();
				$("#order_tab_panel_content").show();
				order.prepare.step(1);
			},no:function(){
				
			}},"question");
	};
	
	var _getTestParam = function() {
		return {
			boActionTypeCd : S1,
			boActionTypeName : "订购",
			offerSpecId : 1234,
			offerSpecName : "乐享3G-129套餐",
			feeType : 1200,
			viceCardNum : 3,
			offerNum : 3,
			type : 1,//1购套餐2购终端3选靓号
			terminalInfo : {
				terminalName : "IPhone5",
				terminalCode : "46456457345"
			},
			offerRoles : [
				{
					offerRoleId : 1234,
					offerRoleName : "主卡",
					memberRoleCd : "0",
					roleObjs : [{
						offerRoleId : 1,
						objId : CONST.PROD_SPEC.CDMA,
						objName : "CDMA",
						objType : 2
					}]
				},
				{
					offerRoleId : 2345,
					offerRoleName : "副卡",
					memberRoleCd : "1"
				}
			]
		};
	};
	
	return {
		buildMainView : _buildMainView,
		copyOrder : _copyOrder,
		spec_parm:_spec_parm,
		check_parm:_check_parm,
		queryStaff:_queryStaff,
		queryStaffPage:_queryStaffPage,
		setStaff:_setStaff,
		chooseAcct : _chooseAcct,
		check_parm_self:_check_parm_self,
		createAcct : _createAcct,
		showNewAcct : _showNewAcct,
		acctDetail : _acctDetail,
		//spec_parm_change: _spec_parm_change,
		spec_parm_change_save:_spec_parm_change_save,
		//spec_password_change:_spec_password_change,
		//spec_password_change_save:_spec_password_change_save,
		paymethodChange:_paymethodChange,
		templateTypeCheck:_templateTypeCheck,
		lastStep : _lastStep
	};
})();


/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("order", "prodModify");
/**
 * 订单准备
 */
order.prodModify = (function(){
	var authFlag="";
	var _coupon="";
	var lteFlag=(CONST.getAppDesc()==0) ? true : false;//下省标志,给LHW
//	var lteFlag=false;//下省标志，给XH
	var _ischooseOffer=false;
	var _choosedProdInfo = {};
	//客户信息修改客户属性信息
	var _profiles=[];
	//客户属性分页列表
	var _profileTabLists =[];
	//帐户信息修改帐户邮寄信息
	//获取选中的产品信息
	var _getChooseProdInfo = function() {
		var prodInfoTr=$("#phoneNumListtbody tr[class='plan_select']").find("td:eq(0)");
		if(prodInfoTr.attr("accNbr")==undefined){
			prodInfoTr=$("#phoneNumListtbody tr[class='bg plan_select']").find("td:eq(0)");
		}
		var prodInfoChildTr=$("#subphoneNumListtbody tr[class='plan_select2']").find("td:eq(0)");
		_choosedProdInfo  = {
			accNbr :prodInfoTr.attr("accNbr"),//产品接入号
			productName :prodInfoTr.attr("productName"),//产品规格名称
			prodStateName :prodInfoTr.attr("prodStateName"),//产品状态名称
			feeTypeName :prodInfoTr.attr("feeTypeName"),//付费方式名称
			prodInstId :prodInfoTr.attr("prodInstId"),//产品ID
			prodStateCd :prodInfoTr.attr("prodStateCd"),//产品状态CD
			productId :prodInfoTr.attr("productId"),//产品规格ID
			feeType :prodInfoTr.attr("feeType"),//付费方式id
			prodClass :$(prodInfoTr).attr("prodClass"),//产品大类 4 表示4G；3表示3G
			stopRecordCd :prodInfoTr.attr("stopRecordCd"),//停机记录CD
			stopRecordName :prodInfoTr.attr("stopRecordName"),//停机记录名称
			prodOfferName :prodInfoChildTr.attr("prodOfferName"),//主套餐名称
			custName :prodInfoChildTr.attr("custName"),//所属人客户名称
			startDt :prodInfoChildTr.attr("startDt"),//生效时间
			endDt :prodInfoChildTr.attr("endDt"),//失效时间
			prodOfferId :prodInfoChildTr.attr("prodOfferId"),//主套餐规格ID
			prodOfferInstId :prodInfoChildTr.attr("prodOfferInstId"),//主套餐实例ID
			custId :prodInfoChildTr.attr("custId"),//所属人客户ID
			is3G :prodInfoChildTr.attr("is3G"),//3G/4G主销售品标识
			areaCode :prodInfoTr.attr("zoneNumber"),//产品地区CODE
			areaId : prodInfoTr.attr("areaId")//产品地区id
		};
		order.prodModify.choosedProdInfo=_choosedProdInfo;
	};
	//业务规则校验
	var _getCallRuleParam = function(boActionTypeCd,prodId) {
		return {
			areaId : OrderInfo.staff.areaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			boInfos : [{
				boActionTypeCd : boActionTypeCd,
				instId : prodId,
				specId : CONST.PROD_SPEC.CDMA,
				prodId : prodId
			}]
		};
	};
	//预校验单校验
	var _updateCheckByChange = function (actionClassCd,boActionTypeCd,prodStatusCd,toprodStatusCd) {
		var data = { 
				orderList : {
					orderListInfo : { 
						isTemplateOrder : "N",   //是否批量
						templateType : "1",  //模板类型: 1 新装；8 拆机；2 订购附属；3 组合产品纳入/退出
						staffId : OrderInfo.staff.staffId,
						channelId : OrderInfo.staff.channelId,  //受理渠道id
						areaId : OrderInfo.staff.areaId,  //受理地区ID
						partyId :  _choosedProdInfo.custId,  //新装默认-1
						olTypeCd : CONST.OL_TYPE_CD.FOUR_G  //4g标识
					},
					custOrderList :[{busiOrder : []}]   //客户订购列表节点
				}
			};
		data.orderList.custOrderList[0].busiOrder=[{
	    	areaId: OrderInfo.staff.areaId,  //受理地区ID
		    boActionType: {
		        actionClassCd: actionClassCd,//受理大类
		        boActionTypeCd: boActionTypeCd//退订销售品
		    }, busiObj: {
		        accessNumber: _choosedProdInfo.accNbr,
		        instId: _choosedProdInfo.prodInstId,
		        isComp: "N",
		        objId: CONST.PROD_SPEC.CDMA,
		        offerTypeCd: "1"
		    }, busiOrderInfo: {
		        seq: OrderInfo.SEQ.seq
		    },data: {
		    	boProdStatuses : [{
					atomActionId : OrderInfo.SEQ.atomActionSeq--,
					prodStatusCd : prodStatusCd,
					state : "DEL"
				},{
					atomActionId : OrderInfo.SEQ.atomActionSeq--,
					prodStatusCd : toprodStatusCd,
					state : "ADD"
				}
		        ]
		    }
	    }];
		params=JSON.stringify(data);
		var url=contextPath+"/order/prodModify/updateCheckByChange";
		var response = $.callServiceAsJson(url, params, {});
		var msg="";
		if (response.code == 0) {
			return true;
		}else if(response.code == -2){
			$.alertM(response.data);
			return false;
		}else{
			msg=response.data;
			$.alert("提示","预校验失败!失败原因为："+msg);
			return false;
		}
	};	
	//补换卡规则校验
	var _showChangeCard = function () {
		prod.changeUim.init();
	};
	
	//加入群组规则校验
	var _showAddComp = function(){
		var compspecparam = {
				"productId":_choosedProdInfo.productId
		}
		if(getCompInfo(compspecparam)==""){
			return;
		}
		var param = {
				"areaId" : OrderInfo.staff.areaId, //地区ID
				"custId" : OrderInfo.cust.custId, //客户ID
				"staffId" : OrderInfo.staff.staffId,
				"channelId" : OrderInfo.staff.channelId,
				"boInfos":[{
					"boActionTypeCd": CONST.BO_ACTION_TYPE.ADD_COMP,//动作类型
				    "instId" : _choosedProdInfo.prodInstId, //实例ID
				    "specId" : CONST.PROD_SPEC.CDMA //产品（销售品）规格ID
				}]
		};
		var callParam = {
				"prodInstId" : _choosedProdInfo.prodInstId,
				"productId" : _choosedProdInfo.productId
		};
		var checkRule = rule.rule.prepare(param,'order.prodModify.addComp',callParam);
	}
	
	//退出群组规则校验
	var _showRemoveComp = function(){
		var compspecparam = {
				"productId":_choosedProdInfo.productId
		}
		if(getCompInfo(compspecparam)==""){
			return;
		}
		var param = {
				"areaId" : OrderInfo.staff.areaId, //地区ID
				"custId" : OrderInfo.cust.custId, //客户ID
				"staffId" : OrderInfo.staff.staffId,
				"channelId" : OrderInfo.staff.channelId,
				"boInfos":[{
					"boActionTypeCd": CONST.BO_ACTION_TYPE.ADD_COMP,//动作类型
				    "instId" : _choosedProdInfo.prodInstId, //实例ID
				    "specId" : CONST.PROD_SPEC.CDMA //产品（销售品）规格ID
				}]
		};
		var callParam = {
				"prodInstId" : _choosedProdInfo.prodInstId,
				"productId" : _choosedProdInfo.productId
		};
		var checkRule = rule.rule.prepare(param,'order.prodModify.removeComp',callParam);
	};
	var _queryOfferSpec=function(){
		var offerSpecId = _choosedProdInfo.prodOfferId;
		//offerSpecId = 300500003940;//TODO need delete
		var offerId=_choosedProdInfo.prodOfferInstId;
		//offerId=120000000645;//TODO need delete
		_offerProd.offerId=offerId;
		_offerProd.offerSpecId=offerSpecId;
		if(offerSpecId==undefined||offerSpecId==''){
			return {};
		}else{
			var param={"offerSpecId":offerSpecId};
			var response = $.callServiceAsJson(contextPath+"/order/queryOfferSpec",param);
			if (response.code==0) {
				if(response.data){
					_offerSpec = response.data.offerSpec;
				}
			}
		}
		return _offerSpec;
	};
	
	//挂失解挂准备
	var _showLossRepProd = function () {
		var submitState="";
        var BO_ACTION_TYPE="";
        var inprodStatusCd="";
        var intoprodStatusCd="";
		if(_choosedProdInfo.prodStateCd=="100000"){
			inprodStatusCd=_choosedProdInfo.prodStateCd;
			intoprodStatusCd=CONST.PROD_STATUS_CD.STOP_PROD;
			BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.LOSSREP_PROD;
			if(inprodStatusCd==""){
				inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
			}
			//预校验
/*			if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
			}*/
		}else if((_choosedProdInfo.stopRecordCd.indexOf("110000") >= 0)&&(_choosedProdInfo.prodStateCd=="120000")){
			inprodStatusCd=_choosedProdInfo.prodStateCd;
			intoprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;;
			BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.DISLOSSREP_PROD;
		}else if(_choosedProdInfo.prodStateCd=="120000"){
			$.alert("提示","产品状态为停机且有挂失过才能解挂","information");
			return;
		}else if(_choosedProdInfo.prodStateCd!="100000"){
			$.alert("提示","产品状态为在用时才能挂失","information");
			return;
		}
		var param = _getCallRuleParam(BO_ACTION_TYPE,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : BO_ACTION_TYPE,
			boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd :inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			prodOfferName : _choosedProdInfo.prodOfferName,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:submitState
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,0,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		var checkRule = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
	};
	//停机保号/取消停机保号准备
	var _showStopKeepNumProd = function () {
		var submitState="";
        var BO_ACTION_TYPE="";
        var inprodStatusCd="";
        var intoprodStatusCd="";
		if(_choosedProdInfo.prodStateCd=="100000"){
			BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.STOPKEEPNUM;
			inprodStatusCd=_choosedProdInfo.prodStateCd;
			intoprodStatusCd=CONST.PROD_STATUS_CD.STOP_PROD;
			if(inprodStatusCd==""){
				inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
			}
			//预校验
			/*if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
			}*/
		}else if((_choosedProdInfo.stopRecordCd.indexOf("120000") >= 0)&&(_choosedProdInfo.prodStateCd=="120000")){
			BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.DISSTOPKEEPNUM;
			inprodStatusCd=_choosedProdInfo.prodStateCd;
			intoprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}else{
			$.alert("提示","产品状态为在用时才能停机保号或停机保号才能进行停机保号复机","information");
			return;
		}
		var param = _getCallRuleParam(BO_ACTION_TYPE,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : BO_ACTION_TYPE,
			boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd :inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			prodOfferName : _choosedProdInfo.prodOfferName,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:submitState
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,0,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		var checkRule = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
	};
	//客户修改资料
	var _showCustInfoModify = function () {
		if("-1"==OrderInfo.cust.custId){
			$("#cCustName").val(OrderInfo.boCustInfos.name);
			$("#cCustIdCard").val(OrderInfo.boCustIdentities.identityNum);
			$("#partyTypeCd option[value='"+OrderInfo.boCustInfos.partyTypeCd+"']").attr("selected", true);
			$("#identidiesTypeCd option[value='"+OrderInfo.boCustIdentities.identidiesTypeCd+"']").attr("selected", true);
			$("#cAddressStr").val(OrderInfo.boCustInfos.addressStr);
			//证件类型选择事件
			order.cust.identidiesTypeCdChoose($("#identidiesTypeCd option[value='"+OrderInfo.boCustIdentities.identidiesTypeCd+"']"));
			tabProfileFlag="1";
			//客户联系人
			$("#contactAddress").val(OrderInfo.boPartyContactInfo.contactAddress);
			$("#contactDesc").val(OrderInfo.boPartyContactInfo.contactDesc);
			$("#contactEmployer").val(OrderInfo.boPartyContactInfo.contactEmployer);
			//$("#contactGender").val(OrderInfo.boPartyContactInfo.contactGender);
			$("#contactGender option[value='"+OrderInfo.boPartyContactInfo.contactGender+"']").attr("selected", true);
			$("#contactName").val(OrderInfo.boPartyContactInfo.contactName);
			//$("#contactType").val(OrderInfo.boPartyContactInfo.contactType);
			$("#contactType option[value='"+OrderInfo.boPartyContactInfo.contactType+"']").attr("selected", true);
			$("#eMail").val(OrderInfo.boPartyContactInfo.eMail);
			$("#fax").val(OrderInfo.boPartyContactInfo.fax);
			//$("#headFlag").val(OrderInfo.boPartyContactInfo.headFlag);
			$("#headFlag option[value='"+OrderInfo.boPartyContactInfo.headFlag+"']").attr("selected", true);
			$("#homePhone").val(OrderInfo.boPartyContactInfo.homePhone);
			$("#mobilePhone").val(OrderInfo.boPartyContactInfo.mobilePhone);
			$("#officePhone").val(OrderInfo.boPartyContactInfo.officePhone);
			$("#postAddress").val(OrderInfo.boPartyContactInfo.postAddress);
			$("#postcode").val(OrderInfo.boPartyContactInfo.postcode);
			easyDialog.open({
				container : 'user_add'
			});
		}else{
			var submitState="";
	        var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUSTINFOMODIFY;
			submitState="ADD";
			var param = _getCallRuleParam(BO_ACTION_TYPE,null);
			var callParam = {
				boActionTypeCd : BO_ACTION_TYPE,
				boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
				accessNumber : "",
				prodOfferName : "",
				state:submitState
			};
/*			SoOrder.builder(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE);
			OrderInfo.actionTypeName = CONST.getBoActionTypeName(BO_ACTION_TYPE);
			OrderInfo.actionFlag=4;*/
			OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,4,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
			var checkRule = rule.rule.prepare(param,'order.prodModify.custInfoModify',callParam);
			if (checkRule) return;
			//SoOrder.builder();
			
		}
	};
	//改客户资料返档
	var _showActiveReturn = function () {
		if(_choosedProdInfo.prodStateCd!=CONST.PROD_STATUS_CD.READY_PROD){
			$.alert("提示","产品必须为预开通时才能进行改客户资料返档","information");
			return;
		}
		var submitState="";
        var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.ACTIVERETURN;
		submitState="ADD";
		var param = _getCallRuleParam(BO_ACTION_TYPE,null);
		var callParam = {
			boActionTypeCd : BO_ACTION_TYPE,
			boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
			accessNumber : "",
			prodOfferName : "",
			state:submitState
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,9,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		var checkRule = rule.rule.prepare(param,'order.prodModify.custInfoModify',callParam);
		if (checkRule) return;
	};
	//修改帐户信息
	var _showAcctInfoModify = function () {
			var submitState="";
	        var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.ACCTINFOMODIFY;
			submitState="ADD";
			var param = _getCallRuleParam(BO_ACTION_TYPE,null);
			var callParam = {
				boActionTypeCd : BO_ACTION_TYPE,
				boActionTypeName : CONST.getBoActionTypeName(BO_ACTION_TYPE),
				accessNumber : "",
				prodOfferName : "",
				state:submitState
			};
			OrderInfo.initData(CONST.ACTION_CLASS_CD.ACCT_ACTION,BO_ACTION_TYPE,0,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
			var checkRule = rule.rule.prepare(param,'order.prodModify.acctInfoModify',callParam);
			if (checkRule) return ;
			//SoOrder.builder();
			
	};
	var _form_custInfomodify_btn = function() {
		//修改客户下一步确认按钮
		$('#custModifyForm').off("formIsValid").on("formIsValid",function(event) {
			var modifyCustInfo={};
			modifyCustInfo = {
					custName : $.trim($("#cmCustName").val()),
					identidiesTypeCd :  $("#div_cm_identidiesType  option:selected").val(),
					custIdCard :  $.trim($("#cmCustIdCard").val()),
					addressStr: $.trim($("#cmAddressStr").val())
				};
			var data = {};
			data.boCustInfos = [{
				areaId : OrderInfo.staff.areaId,
				name : $("#boCustIdentities").attr("partyName"),
				norTaxPayerId : "0",
				partyTypeCd : $("#boCustIdentities").attr("partyTypeCd"),
				addressStr :$("#boCustIdentities").attr("addressStr"),
				state : "DEL"
			},{
				areaId : OrderInfo.staff.areaId,
				name : modifyCustInfo.custName,
				norTaxPayerId : "0",
				partyTypeCd : $("#cmPartyTypeCd  option:selected").val(),
				addressStr :modifyCustInfo.addressStr,
				state : "ADD"
			}];
			if(OrderInfo.cust.idCardNumber==""||OrderInfo.cust.idCardNumber==null){
				data.boCustIdentities = [{
					identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
					identityNum : modifyCustInfo.custIdCard,
					isDefault : "Y",
					state : "ADD"
				}];	
			}else{
			data.boCustIdentities = [{
				identidiesTypeCd :OrderInfo.cust.identityCd,
				identityNum : OrderInfo.cust.idCardNumber,
				isDefault : "Y",
				state : "DEL"
			},{
				identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
				identityNum : modifyCustInfo.custIdCard,
				isDefault : "Y",
				state : "ADD"
			}];
			}
			data.boCustProfiles=[];
			//客户属性信息
			for ( var i = 0; i < order.prodModify.profiles.length; i++) {
				var profilesObj = order.prodModify.profiles[i];
				var profilesDel ={};
				var profilesAdd ={};
				profilesDel={
					partyProfileCatgCd: profilesObj.attrId,
					profileValue: profilesObj.defaultValue,
					state : "DEL"};
				profilesAdd={
					partyProfileCatgCd: profilesObj.attrId,
					profileValue: $.trim($("#profiles_"+profilesObj.attrId).val()),
					state : "ADD"
				};
				if(document.getElementById("profiles_"+profilesObj.attrId)&&profilesObj.profileValue!=$.trim($("#profiles_"+profilesObj.attrId).val())){
					data.boCustProfiles.push(profilesDel);
					data.boCustProfiles.push(profilesAdd);
				}

			} 
			//客户联系人
			data.boPartyContactInfo=[];
			var _boPartyContactInfoOld = {
/*					contactAddress : $("#modTabProfile0").attr("contactAddress"),//参与人的联系地址
			        contactDesc : $("#modTabProfile0").attr("contactDesc"),//参与人联系详细信息
			        contactEmployer  : $("#modTabProfile0").attr("contactEmployer"),//参与人的联系单位
			        contactGender  : $("#modTabProfile0").attr("contactGender"),//参与人联系人的性别
*/			        contactId : $("#modTabProfile0").attr("contactId"),//参与人联系信息的唯一标识
                    statusCd : "100001",
                    contactName : $("#modTabProfile0").attr("contactName"),//参与人的联系人名称
                    headFlag :  $("#modTabProfile0").attr("headFlag"),//是否首选联系人
/*			        
			        contactType : $("#modTabProfile0").attr("contactType"),//联系人类型
			        eMail : $("#modTabProfile0").attr("eMail"),//参与人的eMail地址
			        fax : $("#modTabProfile0").attr("fax"),//传真号
			        
			        homePhone : $("#modTabProfile0").attr("homePhone"),//参与人的家庭联系电话
			        mobilePhone : $("#modTabProfile0").attr("mobilePhone"),//参与人的移动电话号码
			        officePhone : $("#modTabProfile0").attr("officePhone"),//参与人办公室的电话号码
			        postAddress : $("#modTabProfile0").attr("postAddress"),//参与人的邮件地址
			        postcode : $("#modTabProfile0").attr("postcode"),//参与人联系地址的邮政编码
			        staffId : OrderInfo.staff.staffId,//员工ID
*/			        state : "DEL"//状态
			};
			var _boPartyContactInfo = {
					contactAddress : $.trim($("#contactAddress").val()),//参与人的联系地址
			        contactDesc : $.trim($("#contactDesc").val()),//参与人联系详细信息
			        contactEmployer  : $.trim($("#contactEmployer").val()),//参与人的联系单位
			        contactGender  : $.trim($("#contactGender").val()),//参与人联系人的性别
			        contactId : $.trim($("#contactId").val()),//参与人联系信息的唯一标识
			        contactName : $.trim($("#contactName").val()),//参与人的联系人名称
			        contactType : $.trim($("#contactType").val()),//联系人类型
			        eMail : $.trim($("#eMail").val()),//参与人的eMail地址
			        fax : $.trim($("#fax").val()),//传真号
			        headFlag :  $("#headFlag  option:selected").val(),//是否首选联系人
			        homePhone : $.trim($("#homePhone").val()),//参与人的家庭联系电话
			        mobilePhone : $.trim($("#mobilePhone").val()),//参与人的移动电话号码
			        officePhone : $.trim($("#officePhone").val()),//参与人办公室的电话号码
			        postAddress : $.trim($("#postAddress").val()),//参与人的邮件地址
			        postcode : $.trim($("#postCode").val()),//参与人联系地址的邮政编码
			        staffId : OrderInfo.staff.staffId,//员工ID
			        state : "ADD",//状态
			        statusCd : "100001"//订单状态
			};
			if($("#modTabProfile0").attr("click")=="0"){
				if(_boPartyContactInfoOld.contactId!=""){
					data.boPartyContactInfo.push(_boPartyContactInfoOld);
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}else{
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}
				
			}
			SoOrder.submitOrder(data);
		}).ketchup({bindElement:"custInfoModifyBtn"});
	};
    //客户类型选择事件
	var _partyTypeCdChoose = function(scope) {
		var partyTypeCd=$(scope).val();
		//_partyType(partyTypeCd);
		$("#cm_identidiesTypeCd").empty();
		//客户类型关联证件类型下拉框
		_certTypeByPartyType(partyTypeCd);
		//证件类型选择事件
		_identidiesTypeCdChoose($("#div_cm_identidiesType").children(":first-child"));

	};
	var _partyType = function(partyTypeCd) {
		if(partyTypeCd==1){
			var identidiesTypeCdHtml="<select id=\"cmIdentidiesTypeCd\" onchange=\"order.prodModify.identidiesTypeCdChoose(this)\"><option value=\"1\" >身份证</option><option value=\"2\">军官证</option></select>";
		}else if(partyTypeCd==2){
			var identidiesTypeCdHtml="<select id=\"cmIdentidiesTypeCd\" onchange=\"order.prodModify.identidiesTypeCdChoose(this)\"><option value=\"3\">护照</option><option value=\"23\">ICP经营许可证</option><option value=\"39\">税务登记号</option></select>";
		};
		$("#div_cm_identidiesType").html(identidiesTypeCdHtml);
	};
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd){
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
				}
	   if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var certTypedate = data[i];
							$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							
						}
					}
				}
	};
	//证件类型选择事件
	var _identidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==undefined){
			identidiesTypeCd=$("#div_cm_identidiesType  option:selected").val();
		}
		if(identidiesTypeCd==1){
			$("#cmCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#cmCustIdCard").attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
			$("#cmCustIdCard").attr("placeHolder","请输入合法军官证");
			$("#cmCustIdCard").attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			$("#cmCustIdCard").attr("placeHolder","请输入合法护照");
			$("#cmCustIdCard").attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else{
			$("#cmCustIdCard").attr("placeHolder","请输入合法证件号码");
			$("#cmCustIdCard").attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		_form_custInfomodify_btn();
	};
	var _custInfoModify = function(callParam) {
		var param={};
		param.partyName=OrderInfo.cust.partyName;
		param.custId=OrderInfo.cust.custId;
		//定位客户
		param.idCardNumber=OrderInfo.cust.idCardNumber;
		param.boActionTypeName=callParam.boActionTypeName;
		$.callServiceAsHtml(contextPath + "/order/prodModify/custInfoModify", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}
				if(response.data =="false\r\n") {
					$.alert("提示","抱歉，查询无返回客户详情信息。");
					//$.alertM(response.data);
					return;
				}
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				//根据客户类型查询证件类型
				_partyTypeCdChoose($("#cmPartyTypeCd  option:selected"));
				//取客户证件类型
				$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
				//根据证件类型对行添加校验
				_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
				
				
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$(".ordercon").show();
				$(".ordertabcon").show();
				$("#step1").show();
				
				$(".ordercon a:first span").text("取 消");
				_form_custInfomodify_btn();
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	var _lossRepProd = function(callParam) {
		param=_choosedProdInfo;
		$.extend(param, callParam);
		$.callServiceAsHtml(contextPath + "/order/prodModify/lossRepProd", param, {
			"before":function(){
			},"done" : function(response){
				var content$ = $("#order_prepare");
				content$.html(response.data).show();
				$(".ordercon").show();
				$(".ordertabcon").show();
				$("#step1").show();
				$("#custInfo").hide();
				$(".ordercon a:first span").text("取 消");
			},"always":function(){
				$.unecOverlay();
			}
		});
		SoOrder.builder(CONST.ACTION_CLASS_CD.PROD_ACTION,param.boActionTypeCd);
/*		OrderInfo.actionClassCd = 1300;
		OrderInfo.boActionTypeCd = "1171";*/
/*		OrderInfo.actionClassCd = CONST.ACTION_CLASS_CD.PROD_ACTION;
		OrderInfo.boActionTypeCd = param.boActionTypeCd;
		SoOrder.builder(1300,"14");*/
	};
	//挂失 订单提交
	var _lossRepProdSubmit = function(param) {
		var data = {};
		data.orderRemark = $.trim($("#order_remark").val());
		data.boProdStatuses = [{
			prodStatusCd : 8,
			state : submitState
		}];
		SoOrder.submitOrder(data);
		//_commonSubmit(CONST.BO_ACTION_TYPE.LOSSREP_PROD,_choosedProdInfo.prodStateCd,"111111122");
	};
	var _closeDialog = function() {
		if(order.prodModify.dialogForm!=undefined&&order.prodModify.dialog!=undefined){
			order.prodModify.dialogForm.close(order.prodModify.dialog);
		}
	};
	var _removeCommit=function(prodStatusCd,boActionType,templateType){
		var inprodStatusCd="";
        var intoprodStatusCd="";
        inprodStatusCd=_choosedProdInfo.prodStateCd;
		intoprodStatusCd=prodStatusCd;
		if(inprodStatusCd==""){
			inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		var param = _getCallRuleParam(boActionType,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : boActionType,
			boActionTypeName : CONST.getBoActionTypeName(boActionType),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd : inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:"ADD"
		};
		OrderInfo.order.templateType=templateType;
		var v_actionFlag = 0 ;
		if(boActionType==CONST.BO_ACTION_TYPE.BUY_BACK){
			v_actionFlag =19;//OrderInfo.actionFlag
		}
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,boActionType,v_actionFlag,CONST.getBoActionTypeName(boActionType),templateType);
		var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
		if(flag) return;
		//SoOrder.builder();
		
	};
	var _showMemberWin=function(){
		_ischooseOffer=false;
		var viceCount=0;
		var offerMemberInfos=OrderInfo.offer.offerMemberInfos;
		$.each($("#delPhoneNumber ul:last li"),function(i, li){
			$(this).remove();
		});
		$.each(offerMemberInfos,function(i,offerMember){
			if(offerMember.roleCd != CONST.MEMBER_ROLE_CD.MAIN_CARD&&offerMember.roleCd !=CONST.MEMBER_ROLE_CD.VICE_CARD){//不是主卡卡套餐跳过
				return false;
			}
			if(offerMember.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD&&_choosedProdInfo.accNbr==offerMember.accessNumber){
				return false;
			}
			if (offerMember.roleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD&& offerMember.objType==CONST.OBJ_TYPE.PROD) {
				$("#delPhoneNumber ul:first h5").text(offerMember.roleName);
				$("#delPhoneNumber ul:first li").text(offerMember.accessNumber);
			} else if (offerMember.roleCd == CONST.MEMBER_ROLE_CD.VICE_CARD&& offerMember.objType==CONST.OBJ_TYPE.PROD) {
				if (offerMember.accessNumber) {
					$("#delPhoneNumber ul:last h5").text(offerMember.roleName);
					var li = $("<li class='full'>").text(offerMember.accessNumber).appendTo($("#delPhoneNumber ul:last"));
					var objId=offerMember.objId;
					var objInstId=offerMember.objInstId;
					var objType=offerMember.objType;
					var offerMemberId=offerMember.offerMemberId;
					var offerRoleId=offerMember.offerRoleId;
                    var accessNumber=offerMember.accessNumber;
					li.attr("del","Y").attr("accessNumber",accessNumber).attr("objId",objId).attr("objInstId",objInstId).attr("objType",objType).attr("offerMemberId",offerMemberId).attr("offerRoleId",offerRoleId);
					$("<span  id='viceCard_"+offerMember.accessNumber+"'></span>").appendTo(li);
					var eleI = $("<i id='plan_no'><a id='' class='purchase' href='javascript:void(0)'>保留>>选择新套餐</a></i>").appendTo(li);
					eleI.click(function(){
						order.service.offerDialog('viceCard_'+offerMember.accessNumber);
					});		
				 }
			}
			 viceCount++;
		});
		if(viceCount>1){
			return true;
		}else{
			return false;
		}
	};
	//选中套餐返回
	var _chooseOfferForMember=function(specId,subpage,specName,offerRoleId){
		$("#"+subpage).html("&nbsp;&nbsp;<span style='color: #327501;'>订购新套餐：</span>"+specName);
		$("#"+subpage).parent().attr("addSpecId",specId).attr("addRoleId",offerRoleId).attr("del","N");
		_ischooseOffer=true;
		if(document.getElementById("li_"+subpage)){
			$("#li_"+subpage).css("text-decoration","").attr("del","N").attr("knew","Y");
			$("#li_"+subpage).find("i:first-child").find("a").text("拆副卡");
		}
		
	};
	//主卡拆机副卡新装套餐
	var _removeAndAdd=function(prodStatusCd,boActionType,templateType){
		var viceparam = [];
		$.each($("#delPhoneNumber ul:last li"),function(i, li){//所有副卡信息
				viceparam.push({
					objId : $(this).attr("objId"),
					objInstId : $(this).attr("objInstId"),
					objType : $(this).attr("objType"),
					offerRoleId : $(this).attr("addRoleId"),
					offerSpecId :$(this).attr("addSpecId"),
					offerMemberId:$(this).attr("offerMemberId"),
					accessNumber :$(this).attr("accessNumber"),
					del :$(this).attr("del")
				});
		});
		var inprodStatusCd="";
        var intoprodStatusCd="";
        inprodStatusCd=_choosedProdInfo.prodStateCd;
		intoprodStatusCd=prodStatusCd;
		if(inprodStatusCd==""){
			inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		var param = _getCallRuleParam(boActionType,_choosedProdInfo.prodInstId);
		var submitFlag = (boActionType==CONST.BO_ACTION_TYPE.BUY_BACK?"buyBack":"removeAndRetainVice") ;
		var callParam = {
			boActionTypeCd : boActionType,
			boActionTypeName : CONST.getBoActionTypeName(boActionType),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd : inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:"ADD",
			submitFlag:submitFlag,//"removeAndRetainVice",
			viceParam:viceparam
		};
		OrderInfo.order.templateType=templateType;
		var v_actionFlag = 0 ;
		if(boActionType==CONST.BO_ACTION_TYPE.BUY_BACK){
			v_actionFlag =20;//OrderInfo.actionFlag
		}
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,boActionType,v_actionFlag,CONST.getBoActionTypeName(boActionType),templateType);
		var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
		if(flag) return;
		//SoOrder.builder();
		
	};
	var _commonShowDialog=function(){
		$("#delPhoneNumber .btna_o:last").click(function(){
			_closeDialog();
		});
		ec.form.dialog.createDialog({
			"id":"-delephone",
			"width":480,
			"height":400,
			"initCallBack":function(dialogForm,dialog){
				order.prodModify.dialogForm=dialogForm;
				order.prodModify.dialog=dialog;
			},
			"submitCallBack":function(dialogForm,dialog){}
		});
	};
	//欠费拆机
	var _showOweRemoveProd = function () {
		/*
		 * 规则后移
		if(_choosedProdInfo.stopRecordCd.indexOf("130000") < 0){
			$.alert("提示","产品必须为\"欠费停机\"时才能欠费拆机","information");
			return;
		}
		*/
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD;
/*		if(lteFlag){
		var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
		if (!flag) return;
		}*/
		if(!query.offer.setOffer()){
			return;
		}
		if(_showMemberWin()){
			$("#delPhoneTitle").html(CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD)+'-是否保留成员');			
			$("#delPhoneNumber .btna_o:first").off("click").on("click",function(event){
				_closeDialog();
				_removeAndAdd(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD,8);
			});			
			_commonShowDialog();
		}else{
			_removeCommit(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD,8);
		}
	};
	
	//拆机
	var _showRemoveProd = function () {
		/*if(_choosedProdInfo.prodStateCd!='100000'){
			$.alert("提示","产品状态为\"在用\"时才能拆机","information");
			return;
		}*/
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.REMOVE_PROD;
/*		if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
		}*/
		if(!query.offer.setOffer()){
			return;
		}
		if(_showMemberWin()){
			$("#delPhoneTitle").html(CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.REMOVE_PROD)+'-是否保留成员');			
			$("#delPhoneNumber .btna_o:first").off("click").on("click",function(event){
				_closeDialog();
				_removeAndAdd(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.REMOVE_PROD,1);
			});			
			_commonShowDialog();
		}else{
			_removeCommit(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.REMOVE_PROD,1);
		}
	};
	
	//预拆机
	var _showOrderRemoveProd = function() {
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.STOP_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.PREMOVE_PROD;
/*		if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
		}*/
		if(!query.offer.setOffer()){
			return;
		}
		if(_showMemberWin()){
			$("#delPhoneTitle").html(CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PREMOVE_PROD)+'-是否保留成员');			
			$("#delPhoneNumber .btna_o:first").off("click").on("click",function(event){
				_closeDialog();
				_removeAndAdd(CONST.PROD_STATUS_CD.STOP_PROD,CONST.BO_ACTION_TYPE.PREMOVE_PROD,1);
			});			
			_commonShowDialog();
		}else{
			_removeCommit(CONST.PROD_STATUS_CD.STOP_PROD,CONST.BO_ACTION_TYPE.PREMOVE_PROD,1);
		}
	};
	
	//预拆机复机
	var _showCoverOrderRemoveProd = function() {
		/*
		 * 规则后移
		if(_choosedProdInfo.prodStateCd!='120000'){
			$.alert("提示","产品状态为\"拆机\"时才能复机","information");
			return;
		}
		*/
		var inprodStatusCd="";
        var intoprodStatusCd="";
        inprodStatusCd=_choosedProdInfo.prodStateCd;
		intoprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		if(inprodStatusCd==""){
			inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd : inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:"ADD"
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PREMOVE_BACK_PROD),"");
		var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
		if (flag) return;
		//SoOrder.builder();
		
	};
	
	//违章拆机
	var _showBreakRuleRemoveProd = function() {
		/*
		 * 规则后移
		if(_choosedProdInfo.prodStateCd!='100000'){
			$.alert("提示","产品状态为\"在用\"时才能拆机","information");
			return;
		}
		*/
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.BREAK_RULE_REMOVE_PROD;
/*		if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
		}*/
		if(!query.offer.setOffer()){
			return;
		}
		if(_showMemberWin()){
			$("#delPhoneTitle").html(CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.BREAK_RULE_REMOVE_PROD)+'-是否保留成员');			
			$("#delPhoneNumber .btna_o:first").off("click").on("click",function(event){
				_closeDialog();
				_removeAndAdd(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.BREAK_RULE_REMOVE_PROD,1);
			});			
			_commonShowDialog();
		}else{
			_removeCommit(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.BREAK_RULE_REMOVE_PROD,1);
		}
	};
	//未激活拆机
	var _showNoActiveRemoveProd = function() {
		if(_choosedProdInfo.prodStateCd!='140000'){
			$.alert("提示","产品状态为未激活(预开通)时才能拆机","information");
			return;
		}
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD;
		/*if(lteFlag){
		var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
		if (!flag) return;
		}*/
		var inprodStatusCd="";
        var intoprodStatusCd="";
        inprodStatusCd=_choosedProdInfo.prodStateCd;
		intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;
		if(inprodStatusCd==""){
			inprodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD),
			accessNumber : _choosedProdInfo.accNbr,
			prodStatusCd : inprodStatusCd,
			toprodStatusCd : intoprodStatusCd,
			itemSpecId : CONST.BUSI_ORDER_ATTR.REMOVE_REASON,
			state:"ADD"
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.NOACTIVE_REMOVE_PROD),"");
		var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
		if (flag) return;
		//SoOrder.builder();
		
	};
	
	//只有订单信息的变更页面公共方法
	var _commonPrepare = function(param) {
		$.callServiceAsHtml(contextPath + "/order/prodModifyCommon", param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#ordercon").show();
				$("#ordertabcon").show();
				order.prepare.step(1);
				OrderInfo.order.step=1;//订单备注页面
				$("#orderedprod").hide();
				$("#order_prepare").hide();
				$(".ordercon a:first span").text("取 消");
				$(".main_body").css("height","150px");
				$(".main_body").css("min-height","150px");
				$("#order_confirm").empty();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$("#fillNextStep").unbind("click").bind("click",function(){
					if(param.submitFlag=='removeAndRetainVice'){
						_commitRetainVice(param);
					}else if(param.submitFlag=='buyBack'){
						_commitBuyBack(param);
					}else if(param.submitFlag=='removeProd'){
						order.memberChange.removeAndAdd(param);
					}else{
						_commonSubmit(param.boActionTypeCd,param.prodStatusCd,param.toprodStatusCd,param.itemSpecId,param.state);
					}
					OrderInfo.order.step=2;//订单确认页面
				});
				$("#templateOrderDiv").hide();
				if(param.boActionTypeCd==CONST.BO_ACTION_TYPE.OWE_REMOVE_PROD){
					$("#templateOrderDiv").show();
				}
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	var _commitRetainVice=function(param){
		//alert(param.submitFlag);
		//alert(OrderInfo.offer.offerId);
		OrderInfo.actionFlag=7;
		SoOrder.submitOrder(param.viceParam);
	};
	var _commitBuyBack=function(param){
		OrderInfo.actionFlag=20;
		var params = {viceParam:param.viceParam,remark:$("#order_remark").val()};
		SoOrder.submitOrder(params);
	};
	var _commonSubmit = function(boActionTypeCd,prodStatusCd,toprodStatusCd,itemSpecId,state) {
		OrderInfo.actionClassCd = CONST.ACTION_CLASS_CD.PROD_ACTION;
		OrderInfo.boActionTypeCd = boActionTypeCd;
		if(_isNullParam(prodStatusCd)){
			prodStatusCd=CONST.PROD_STATUS_CD.NORMAL_PROD;
		}
		if(_isNullParam(toprodStatusCd)){
			toprodStatusCd=CONST.PROD_STATUS_CD.STOP_PROD;
		}
		var data = {};
		if(!_isNullParam(prodStatusCd)) {
			data.boProdStatuses = [{
				//atomActionId : OrderInfo.SEQ.atomActionSeq--,
				prodStatusCd : prodStatusCd,
				state : "DEL"
			},{
				//atomActionId : OrderInfo.SEQ.atomActionSeq--,
				prodStatusCd : toprodStatusCd,
				state : "ADD"
			}
			];
		}
		if(!_isNullParam(itemSpecId)) {
			data.busiOrderAttrs = [{
				//atomActionId : OrderInfo.SEQ.atomActionSeq--,
				itemSpecId : itemSpecId,
				value : $.trim($("textarea[id^=order_remark]").val())
			}];
		}
		SoOrder.submitOrder(data);
	};
	
	function _gotoOrderModify(response){
		var content$ = $("#order_fill_content");
		content$.html(response.data).show();
		
		$(".main_div .h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
		
		$("#ordercon").show();
		$("#ordertabcon").show();
		order.prepare.step(1);
		$("#orderedprod").hide();
		$("#order_prepare").hide();
		$(".ordercon a:first span").text("取 消");
		$(".main_body").css("height","150px");
		$(".main_body").css("min-height","150px");
		$("#order_confirm").empty();
		$("#fillLastStep").click(function(){
			order.prodModify.cancel();
		});
		/*
		$("#fillNextStep").unbind("click").bind("click",function(){
			_commonSubmit(param.boActionTypeCd,param.prodStatusCd,param.itemSpecId,param.state);
		});
		*/
		
	}
	
	//修改产品实例属性
	var _spec_parm_change= function(){	
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PARMS,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PARMS,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		//OrderInfo.actionFlag=33;//改产品属性
		var checkRule = rule.rule.prepare(param,'order.prodModify.spec_parm_show',callParam);
	};
	//产品实例属性-展示
	var _spec_parm_show = function(){
		var param={
				prodInstId:_choosedProdInfo.prodInstId,
				offerSpecId:_choosedProdInfo.prodOfferId,
				prodSpecId:_choosedProdInfo.productId,
				partyId:OrderInfo.cust.custId,
				acctNbr:_choosedProdInfo.accNbr,
				areaId:_choosedProdInfo.areaId
		};
		$.callServiceAsHtmlGet(contextPath + "/order/orderSpecParamChange",param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}
				if(response && response.data){
					if(response.data==0||response.data==1){
						$.alert("提示","该产品无产品实例属性！");
					}else if(response.data==-1){
						$.alert("提示","产品实例属性加载异常！");
					}else{
						//$("#"+param.ul_id).append(response.data);
						_gotoOrderModify(response);		
					}
				}else{
					$.alert("提示","产品实例属性加载异常");
				}
			}
		});	
		
	};
	
	//修改产品密码 
	var _showPasswordChange = function () {
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD),"");
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		OrderInfo.actionFlag=31;//改产品密码
		var checkRule = rule.rule.prepare(param,'order.prodModify.spec_password_change',callParam);
	};
	//修改产品密码
	var _spec_password_change= function(){
		var param={"accNbr":_choosedProdInfo.accNbr};
		$.callServiceAsHtmlGet(contextPath + "/order/orderPasswordChange",param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				_gotoOrderModify(response);
				$('#password_form').bind('formIsValid',_spec_password_change_check).ketchup({bindElement:"btsubmit"});
			}
		});	
	};
	//产品密码修改-鉴权
	function _spec_password_change_check(){
		//SoOrder.builder();
		//SoOrder.builder(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD);
		if("none"!=$("#li_password_old").css("display")){
			if(!$("#password_old").val()){
				$.alert("操作提示","请输入 原产品密码");
				return ;
			}
		}
		if(!$("#password_change1").val()){
			$.alert("操作提示","请输入 产品密码");	
			return ;
		}else if(!$("#password_change2").val()){
			$.alert("操作提示","请输入 确认密码");	
			return ;
		}else if($("#password_change1").val()!=$("#password_change2").val()){
			$.alert("操作提示","两次密码不一致");	
			return ;
		}
		var param = {
				password_old:$("#password_old").val(),
				accessNumber:_choosedProdInfo.accNbr,
				areaId:_choosedProdInfo.areaId
		} ;
		$.callServiceAsHtml(contextPath+"/order/orderPasswordCheck",param,{
			"before":function(){
				$.ecOverlay("<strong>正在提交中,请稍等...</strong>");
			},"done" : function(response){
				if(response && response.code == -2){
					return ;
				}
				var data = eval("(" + response.data + ")");
				//alert("--"+data.successed);
				if(data.successed==true||data.successed=="true"){
					_spec_password_change_save();
				}else{
					$.alert("密码校验失败",data.data);
					$.unecOverlay();
					return;
				}
			}
		});
	}
	//产品密码修改-提交
	function _spec_password_change_save(){
		var boProdPasswords = new Array();
		var boProdPasswords_del = {
				prodId : _choosedProdInfo.prodInstId, //从页面头部div获取
				prodPwTypeCd : "2", //密码类型
				pwd : $("#password_old").val(), //密码
				state : "DEL"  //动作
			};
		var boProdPasswords_add = {
				prodId : _choosedProdInfo.prodInstId, //从页面头部div获取
				prodPwTypeCd : "2", //密码类型
				pwd : $("#password_change1").val(), //密码
				state : "ADD"  //动作
			};
		boProdPasswords.push(boProdPasswords_del);
		boProdPasswords.push(boProdPasswords_add);
		var data = {boProdPasswords:boProdPasswords} ;
		OrderInfo.actionFlag=31;//改产品密码
		SoOrder.submitOrder(data);
		
	}
	
	
	//密码重置 校验
	var _showPasswordReset = function () {
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD),"");
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PASSWORD),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		OrderInfo.actionFlag=32;//重置产品密码
		var checkRule = rule.rule.prepare(param,'order.prodModify.spec_password_reset',callParam);
	};
	//密码重置 修改
	var _spec_password_reset= function(){
		$.callServiceAsHtmlGet(contextPath + "/order/orderPasswordReset",null, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				_gotoOrderModify(response);
				//$('#password_form').bind('formIsValid').ketchup();
				$('#password_form').bind('formIsValid',_spec_password_reset_save).ketchup({bindElement:"btsubmit"});
			}
		});	
	};
	//密码重置 保存
	function _spec_password_reset_save(){
		/*
		if(!$("#password_change1").val()){
			$.alert("操作提示","请输入 产品密码");
			return ;
		}else if(!$("#password_change2").val()){
			$.alert("操作提示","请输入 确认密码");	
			return ;
		}else if($("#password_change1").val()!=$("#password_change2").val()){
			$.alert("操作提示","两次密码不一致");	
			return ;
		}
		*/
		
		var boProdPasswords = new Array();
		var boProdPasswords_del = {
				prodId : _choosedProdInfo.prodInstId, //从页面头部div获取
				prodPwTypeCd : "2", //密码类型
				pwd : "", //密码
				state : "DEL"  //动作
			};
		var boProdPasswords_add = {
				prodId : _choosedProdInfo.prodInstId, //从页面头部div获取
				prodPwTypeCd : "2", //密码类型
				pwd : "111111",//$("#password_change1").val(), //密码
				state : "ADD"  //动作
			};
		boProdPasswords.push(boProdPasswords_del);
		boProdPasswords.push(boProdPasswords_add);
		var data = {boProdPasswords:boProdPasswords} ;
		OrderInfo.actionFlag=32;//重置产品密码
		SoOrder.submitOrder(data);
	}
	
	//修改短号：校验
	function _shortnum_change(){
		//SoOrder.builder();
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PARMS,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PARMS,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		OrderInfo.actionFlag=34;//修改短号
		var checkRule = rule.rule.prepare(param,'order.prodModify.shortnum_show',callParam);
	}
	//修改短号--展示
	function _shortnum_show(id){
		var param={"prodId":_choosedProdInfo.prodInstId,acctNbr:_choosedProdInfo.accNbr};
		$.callServiceAsHtmlGet(contextPath + "/order/orderShortnumChange",param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}
				if(response && response.data){
					if(response.data==0){
						$.alert("提示","该产品无短号信息！");
					}else if(response.data==-1){
						$.alert("提示","加载短号信息异常！");
					}else{
						_gotoOrderModify(response);		
					}
				}else{
					$.alert("提示","短号加载异常");
				}
			}
		});	
	}
	function _shortnum_change_val(obj){
		if($(obj).attr("checkSta")=="2"&&$(obj).val()!=$(obj).attr("changeval")){
			$(obj).attr("checkSta","0");
		}
		/*
		var shortnum_sel = $("#shortnum_sel").val();
		var id = $("#ul_"+shortnum_sel).attr("t_id");
		var shortnum_val = $("#"+id).val() ;
		if($("#"+id).attr("checkSta")=="2"&&shortnum_val!=$("#"+id).attr("changeval")){
			$("#"+id).attr("checkSta","0");
		}
		*/
	}
	function _shortnum_check(){
		var shortnum_sel = $("#shortnum_sel").val();
		var id = $("#ul_"+shortnum_sel).attr("t_id");
		var shortnum_val = $("#"+id).val() ;
		var reg = new RegExp("^[0-9]*$");
		if(null==shortnum_val||""==shortnum_val){
			$.alert("提示","请输入新的短号");
			return;
		}else if(shortnum_val==$("#"+id).attr("oldval")){
			$.alert("提示","短号未修改，请修改后再校验");
			return ;
		}else if(!reg.test(shortnum_val)){
			$.alert("提示", "短号只能为数字，请重新输入！");
			return;
		}else if(shortnum_val==$("#"+id).attr("changeval")){
			if($("#"+id).attr("checkSta")=="2"){
				$.alert("提示", "短号已校验成功，可以使用！");
				return;
			}else if($("#"+id).attr("checkSta")=="1"){
				$.alert("提示", "短号未通过校验，请修改再试！");
				return;
			}
		}
		var param = {
				groupNbr:$("#"+id).attr("groupNbr"),//"18900000000",//
				extProdId:$("#"+id).attr("extProdId"),//"255",//
				productNbr:"",
				accNbr:_choosedProdInfo.accNbr,//18108880390,//
				extPordInstId:$("#"+id).attr("extPordInstId"),
				groupShortNbr:shortnum_val,
				lanId:$("#"+id).attr("lanId"),//"8320100",//
				checkNbr:$("#"+id).attr("changeval")
			};
		var url = contextPath+"/order/checkReleaseShortNum";
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>短号校验中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},"done" : function(response){
				$("#"+id).attr("changeval",shortnum_val);
				if (response.code == 0) {
					$("#"+id).attr("checkSta","2");
					$("#uimCheck").removeClass().addClass("order_check");
					$.alert("提示",response.data);
					return ;
				}else{
					$("#"+id).attr("checkSta","1");
					$.alert("提示",response.data);
					$("#uimCheck").removeClass().addClass("order_check_error");
					return ;
				}
			},"fail":function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
				return ;
			}
		});	
	}
	
	//修改短号--提交
	function _shortnum_save(){
		var shortnum_sel = $("#shortnum_sel").val();
		var id = $("#ul_"+shortnum_sel).attr("t_id");
		var shortnum_val = $("#"+id).val() ;
		if(shortnum_val==$("#"+id).attr("oldval")){
			$.alert("提示","短号未修改，请修改并校验");
			return;
		}else if($("#"+id).attr("checkSta")=="0"){
			$.alert("提示","短号未校验，请校验后再提交！");
			return ;
		}else if($("#"+id).attr("checkSta")=="1"){
			$.alert("提示","短号未通过校验，请修改再试！");
			return ;
		}
		//SoOrder.builder(CONST.ACTION_CLASS_CD.SHORTNUM_ACTION,CONST.BO_ACTION_TYPE.SHORT_NUM);
		
		//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		//SoOrder.builder();
		var boProdCompItems = new Array();
		var boProdCompItems_row = {itemSpecId:$("#"+id).attr("itemSpecId"),name:"",prodCompId:$("#"+id).attr("prodCompId"),state:"DEL",value:$("#"+id).attr("oldval")} ;
		boProdCompItems.push(boProdCompItems_row);
		boProdCompItems_row = {itemSpecId:$("#"+id).attr("itemSpecId"),name:"",prodCompId:$("#"+id).attr("prodCompId"),state:"ADD",value:$("#"+id).val()} ;
		boProdCompItems.push(boProdCompItems_row);
		var boProdCompOrders_row = {"prodCompRelaRoleCd":$("#"+id).attr("prodCompRelaRoleCd"),"compProdId":$("#"+id).attr("compProdId"),"prodCompId":$("#"+id).attr("prodCompId")} ;
		var boProdCompOrders = new Array();
		boProdCompOrders.push(boProdCompOrders_row);
		var data = {boProdCompItems:boProdCompItems,boProdCompOrders:boProdCompOrders} ;
		//alert(JSON.stringify(data));
		//return ;
		OrderInfo.actionFlag=34;//修改短号
		SoOrder.submitOrder(data);
		
	}
	
	
	
	var _isNullParam = function(data){
		return data == undefined || !data;
	};
	
	//补换卡
	var _changeCard = function(param){
		//SoOrder.builder();
		
		$.callServiceAsHtml(contextPath+"/order/changeCard", param, {
			"before":function(){
			},
			"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$(".ordercon").show();
				$(".ordertabcon").show();
				$(".h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
				order.prepare.step(1);
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always":function(){
				$.unecOverlay();
			}
		});
		
	};	
	
	var compspecGrps = "";
	var getCompInfo = function(compspecparam){
		var grprlue = ""
		var returndata = $.callServiceAsJson(contextPath+"/order/compPspecGrps", compspecparam, {});
		if(returndata.code == 0){
			if(returndata.data.length!=0){
				grprlue = returndata.data;
				compspecGrps = grprlue;//compspecGrps 其他地方用，弹窗显示的角色分类。grprlue 判断存不存在角色
			}
			return grprlue;
		}else if(returndata.code == -2){
			$.alertM(returndata.data);
			return "";
		}else{
			$.alert("提示","该产品不是组合产品，请重新选择！");
			return "";
		}
	};
	var _addComp = function(param){
		
		OrderInfo.initData("","",12,"纳入成员");
		SoOrder.builder();
		var compparam ={};
		$.callServiceAsHtml(contextPath+"/order/addComp", compparam, {
			"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$(".ordercon").show();
				$(".ordertabcon").show();
				order.prepare.step(1);
				$(".h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//退出群组
	var _removeComp = function(param){
		
		OrderInfo.initData("","",12,"退出成员");
		SoOrder.builder();
		var compparam ={};
		$.callServiceAsHtml(contextPath+"/order/removeComp", compparam, {
			"done" : function(response){
				var content$ = $("#order_fill_content");
				content$.html(response.data).show();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$(".h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
				$(".ordercon").show();
				$(".ordertabcon").show();
				order.prepare.step(1);
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//查询群组的账号
	var _queryRomveAcc = function(){
		var prodnum = $.trim($("#removeAcc").val());
		if(prodnum==""){
			$.alert("提示","请输入需要查询的接入号！");
			return;
		}else{
			var params = {
				"compProdId":_choosedProdInfo.prodInstId,
				"accessNumber":prodnum
			};
		}
		var removephones = getChoosedMenbr();
		if(removephones.length!=0){
			for(var i=0;i<removephones.length;i++){
				if(prodnum==removephones[i]){
					$.alert("提示","该号码已经在待退出成员中，请重新选择！");
					return;
				}
			}
		}
		var url = contextPath+"/order/queryCompmenber";
		$.callServiceAsJson(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				if (response.code == 0) {
					var compProdMemberInfos = response.data;
					if(compProdMemberInfos.length>0){
						var prodmenber = compProdMemberInfos[0];
						var addnbrhtml="<li id='li_"+prodmenber.accessNumber+"' prodInstId='"+prodmenber.prodId+"' phonenumber='"+prodmenber.accessNumber+"' prodCompRelaRoleCd='"+prodmenber.prodCompRelaRoleCd+
						"' prodCompRelaRoleName='"+prodmenber.prodCompRelaRoleName+"' prodCompId='"+prodmenber.prodCompId+"'>"+
						"<dd class='delete' onclick='order.prodModify.removeCompDelSelect(this);'></dd><span id='addNbr'>"+prodmenber.accessNumber+"</span>";
						$("#choosed_menbers").append(addnbrhtml);
					}else{
						$.alert("提示","该号不在群组成员中，请重新选择！");
						return;
					}
				}else if(response.code == -2){
					$.alertM(response.data);
				}else{
					$.alert("提示",response.data);
					return;
				}
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});		
	};
	
	//可选包订购退订
	var _orderAttachOffer = function () {
		AttachOffer.init();
	};
	
	//套餐变更
	var _changeOffer = function () {
		offerChange.init();
	};
	
	//改付费帐户规则校验
	var _showChangeAccount = function(){
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT,_choosedProdInfo.prodInstId);
		var callParam = {
				boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT,
				boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT),
				accessNumber : _choosedProdInfo.accNbr,
				prodOfferName : _choosedProdInfo.prodOfferName
			};
		var flag = rule.rule.prepare(param,'order.prodModify.changeAccount',callParam);
		if (flag) return;
		//SoOrder.builder();
	};
	
	//获取产品原帐户信息并转至改付费帐户页面
	var _changeAccount = function(){
		if(!_choosedProdInfo.prodInstId || !_choosedProdInfo.accNbr){
			$.alert("提示","产品信息定位异常，请联系管理员");
			$("#orderedprod").show();
			$("#order_prepare").show();
			$("#order_tab_panel_content").show();
			$("#order_confirm").show();
			$("#order_fill_content").hide();
			order.prepare.hideStep();
			return;
		}
		var param = {
			prodId : _choosedProdInfo.prodInstId,
			acctNbr : _choosedProdInfo.accNbr
		};
		$.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param, {
			"before":function(){
				$.ecOverlay("<strong>正在确认当前产品帐户,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(jr){
				if(jr.code != 0||jr.data.length==0) {
					if(jr.code==-2){
						$.alertM(jr.data);
					}
					else{
						$.alert("提示","当前产品帐户定位失败，请联系管理员");
					}
					$("#orderedprod").show();
					$("#order_prepare").show();
					$("#order_tab_panel_content").show();
					$("#order_confirm").show();
					$("#order_fill_content").hide();
					order.prepare.hideStep();
					return;
				}				
				var prodAcctInfos = jr.data;
				$.callServiceAsHtml(contextPath+"/order/preChangeAccount", prodAcctInfos, {
					"before":function(){
						$.ecOverlay("<strong>当前产品帐户已确认</strong>");
					},
					"always":function(){
						$.unecOverlay();
					},
					"done":function(response){
						if(!response){
							 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';
						}
						if(response.code != 0) {
							$.alert("提示","查询失败,请稍后重试");
							return;
						}											
						$("#order_fill_content").html(response.data).show();
						$(".h2_title").append(_choosedProdInfo.productName+"-"+_choosedProdInfo.accNbr);
						$("#origAccts option:first").attr("selected", "selected");
						//获取账单投递信息主数据				
						acct.acctModify.getBILL_POST();
					},
					fail:function(response){
						$.unecOverlay();
						$.alert("提示","服务忙，请稍后再试！");
					}
				});
			}
		});
	};
	
	//产品下原有付费帐户展示（弹出框）
	var _showOrigAccts = function(){
		easyDialog.open({
			container : "origAcctDialog"
		});
		$("#origAcctClose").click(function(){
			easyDialog.close();
		});
	};
		
	//查询帐户信息并选择新的付费帐户（弹出框）
	var _chooseAcct = function() {
		$("#chooseQueryAcctType").find("option[value=1]").attr("selected","selected");
		$("#d_query_nbr").show();
//		$("#d_query_pwd").show();
		easyDialog.open({
			container : "queryAcctDialog"
		});
		$("#chooseQueryAcctType").change(function(){
			if($("#chooseQueryAcctType").val()==1){
				$("#d_query_cd").hide();
				$("#d_query_nbr").show();
//				$("#d_query_pwd").show();
			}
			else{				
				$("#d_query_nbr").hide();
				$("#d_query_pwd").hide();
				$("#d_query_cd").show();
			}
		});
		$("#queryAcctClose").click(function(){
			$("#acctListTab tbody").empty();
			$("#d_query_cd").hide();
			$("#d_query_nbr").hide();
//			$("#d_query_pwd").hide();
			easyDialog.close();
		});
	};
			
	//查询帐户,显示查询结果，记录选择的帐户信息
	var newAcctList = [];
	var _queryAccount = function(acctSelect){
		//根据接入号查询帐户
		var response;
		if($("#chooseQueryAcctType").val()==1){
//			var param = {
//					accessNumber : $("#d_query_nbr input").val(),
//					prodPwd : $("#d_query_pwd input").val()
//			};
			//根据接入号查询帐户需先经过产品密码鉴权
//			var jr = $.callServiceAsJson(contextPath+"/order/prodAuth", param);
//			if(jr.code==0){
				var acctQueryParam = {
					accessNumber : $("#d_query_nbr input").val()
				};
				response = order.prodModify.returnAccount(acctQueryParam);		
//			}
//			else{
//				$.alert("提示",jr.data);
//			}
		}
		//根据合同号查询帐户
		else{
			var acctQueryParam = {
					acctCd : $("#d_query_cd input").val()
			};
			response = order.prodModify.returnAccount(acctQueryParam);
		}		
		$("#acctListTab tbody").empty();
		if(response.code==0){
			var returnMap = response.data;
			if(returnMap.resultCode==0){
				if(returnMap.accountInfos && returnMap.accountInfos.length>0){
					var accountInfos = returnMap.accountInfos;
					$.each(accountInfos, function(i, accountInfo){					
						var tr = $("<tr></tr>").appendTo($("#acctListTab tbody"));
						if(accountInfo.name){
							$("<td class='teleNum'>"+accountInfo.name+"</td>").appendTo(tr);
						}
						else{
							$("<td></td>").appendTo(tr);
						}
						if(accountInfo.acctId){
							$("<td acctId='"+accountInfo.acctId+"'>"+accountInfo.accountNumber+"</td>").appendTo(tr);
						}
						else{
							$("<td></td>").appendTo(tr);
						}
						if(accountInfo.owner){
							$("<td>"+accountInfo.owner+"</td>").appendTo(tr);
						}
						else{
							$("<td></td>").appendTo(tr);
						}
						if(accountInfo.accessNumber){
							$("<td>"+accountInfo.accessNumber+"</td>").appendTo(tr);
						}
						else{
							$("<td></td>").appendTo(tr);
						}
						tr.click(function(){
							var newAccount = {
									acctCd : accountInfo.accountNumber,
									acctId : accountInfo.acctId,
									acctRelaTypeCd : "1",
									chargeItemCd : 1,               //账目项标识，暂固定为1，表示支付所有账目项
									percent : "100",                //支付比重，该账目项占该产品的价格比重，与上一个属性相匹配，暂固定为100
									priority : "1",                 //支付优先级，暂固定为1，表示最高优先级
									prodAcctId : "-1",              //标识产品与帐户的支付匹配关系，新选的帐户和该产品无匹配关系，默认 -1
									state : "ADD"
							};
							newAcctList.push(newAccount);
							
							$("#acctListTab tbody").empty();
							$("#d_query_cd").hide();
							$("#d_query_nbr").hide();
							$("#d_query_pwd").hide();
							$("#defineNewAcct").hide();
							easyDialog.close();
							var found = false;
							$.each($(acctSelect).find("option"), function(i, option){
								if($(option).val()==accountInfo.acctId){
									found = true;
									return false;
								}								
							});
							if(found==false){										
								$("<option>").text(accountInfo.owner+" : "+accountInfo.name).attr("value", accountInfo.acctId).appendTo($(acctSelect));
							}
							$(acctSelect).find("option[value=default]").remove();
							$(acctSelect).find("option[value="+accountInfo.acctId+"]").attr("selected","selected");
						});
					});			
				}
				else{
					$("<tr><td colspan=4>未查询到帐户信息</td></tr>").appendTo($("#acctListTab tbody"));
				}	
			}
			else{
				$("<tr><td colspan=4>"+returnMap.resultMsg+"</td></tr>").appendTo($("#acctListTab tbody"));
			}
		}
		else{
			$("<tr><td colspan=4>"+response.data+"</td></tr>").appendTo($("#acctListTab tbody"));
		}
	};
	
	//帐户查询请求（二次业务时查询已有帐户）
	var _returnAccount = function(acctQueryParam){
		acctQueryParam.areaId =  _choosedProdInfo.areaId;
		var response = $.callServiceAsJson(contextPath+"/order/account", acctQueryParam);
		if(response.code==-2){
			$.alertM(response.data);
			return;
		}
		return response;
	};
	
	//新建帐户
	var _createAcct = function(){
		var newAccount = {
				acctCd : -1,
				acctId : -1,
				acctRelaTypeCd : "1",
				chargeItemCd : 1,               //账目项标识，暂固定为1，表示支付所有账目项
				percent : "100",                //支付比重，该账目项占该产品的价格比重，与上一个属性相匹配，暂固定为100
				priority : "1",                 //支付优先级，暂固定为1，表示最高优先级
				prodAcctId : "-1",              //标识产品与帐户的支付匹配关系，新选的帐户和该产品无匹配关系，默认 -1
				state : "ADD"
		};
		newAcctList.push(newAccount);
		$("<option value='-1' style='color:red'>[新增] "+OrderInfo.cust.partyName+"</option>").appendTo($("#newAccts"));
		$("#newAccts").find("option[value=default]").remove();
		$("#newAccts").find("option[value=-1]").attr("selected","selected");
		$("#acctName").val(OrderInfo.cust.partyName);//默认帐户名称为客户名称
		$("#newAccts").parent().find("a:eq(1)").hide();
		//新增帐户自定义支付属性
		$("#defineNewAcct").show();
		acct.acctModify.paymentType();
		acct.acctModify.billPostType();
	};
	
	//切换新付费帐户
	var _ifNewAcct = function(acctSelect){
		if($(acctSelect).val()<0){
			$("#defineNewAcct").show();
		}
		else{
			$("#defineNewAcct").hide();
		}
	};

	//改付费帐户提交（下一步）
	var _changeAccountSave = function(){
		
		//帐户信息校验
		if($("#newAccts").val()=="default"){
			$.alert("提示","请选择新帐户");
			return;
		}		
		//新建帐户支付信息与投递信息填写校验
		if($("#newAccts").val()<0){
			//帐户信息填写校验
			if(!SoOrder.checkAcctInfo()){
				return;
			}
		}

		var repick = false;
		var origAccts = $("#origAccts").find("option");
		$.each(origAccts, function(i, origAcct){
			if($("#newAccts").val()==$(origAcct).val()){
				repick = true;
				return false;
			}
		});
		if(repick==false){
			
			var delAcctId = $("#origAccts").val();
			var origAcct = $("#origAcctList tbody").find("tr[id="+delAcctId+"]");							
			
			var _acctCd = $(origAcct).find("td:eq(4)").text();					
			var _acctId = $(origAcct).find("td:eq(0)").text();					
			var _chargeItemCd = $(origAcct).find("td:eq(2)").text();					
			var _percent = $(origAcct).find("td:eq(7)").text();					
			var _priority = $(origAcct).find("td:eq(8)").text();
			if(_priority==""){
				_priority = 1;
			}
			var _prodAcctId = $(origAcct).find("td:eq(1)").text();	
			
			var origAcctInfo = {							
					acctCd : _acctCd,							
					acctId : _acctId,							
					acctRelaTypeCd : "1",							
					chargeItemCd : _chargeItemCd,				
					percent : _percent,							
					priority : _priority,							
					prodAcctId : _prodAcctId,						
					state : "DEL"					
			};
				
			var newAcctInfo;
			$.each(newAcctList, function(i, newAccount){
				if(newAccount.acctId==$("#newAccts").val()){
					newAcctInfo = newAccount;
					return false;
				}
			});
			
			var _boAccountRelas = [];
			_boAccountRelas.push(origAcctInfo);
			_boAccountRelas.push(newAcctInfo);
		
			var _busiOrderAttrs = [];
			var remark = $("#orderRemark").val();		
			_busiOrderAttrs.push({
				itemSpecId : "111111118",
				value : remark
			});
		
			var data = {
					boAccountRelas : _boAccountRelas,
					busiOrderAttrs : _busiOrderAttrs
			};
			//更换的帐户为新建帐户
			if($("#newAccts").val()==-1){
				OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT,10,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT),"");
				var busiOrder = [];
				//新建帐户节点
				OrderInfo.createAcct(busiOrder, -1);
				//更改帐户节点
				var acctChangeNode = {
						areaId : OrderInfo.staff.areaId,
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq-- 
						}, 
						busiObj : {
							accessNumber: _choosedProdInfo.accNbr,
                            instId: _choosedProdInfo.prodInstId,
                            isComp: "N",
                            objId: _choosedProdInfo.productId,
                            offerTypeCd: "1"
						},  
						boActionType : {
							actionClassCd : 1300,
							boActionTypeCd : "-6"
						}, 
						data : data
				};
				busiOrder.push(acctChangeNode);
				
				SoOrder.submitOrder(busiOrder);
			}
			//更换的帐户为已有帐户
			else{
				OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT),"");
				SoOrder.submitOrder(data);
			}			
		}
		else{
			$.alert("提示","该帐户已经是付费帐户了，请重新选择");
			return;
		}		
	};
	
	//退出二次业务
	var _cancel = function() {
		$.confirm("信息","确定取消当前操作吗？",{
		yes:function(){			
			//退出二次业务时释放被预占的UIM卡
			var boProd2Tds = OrderInfo.boProd2Tds;
			if(boProd2Tds.length>0){
				for(var n=0;n<boProd2Tds.length;n++){
					var param = {
							numType : 2,
							numValue : boProd2Tds[n].terminalCode
					};
					$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
				}
			}
			//退出二次业务时释放被预占的号码（过滤身份证预占的号码）
			var boProdAns = OrderInfo.boProdAns;
			if(boProdAns.length>0){
				for(var n=0;n<boProdAns.length;n++){
					if(boProdAns[n].idFlag){
						continue;
					}
					var param = {
							numType : 1,
							numValue : boProdAns[n].accessNumber
					};
					$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
				}
				order.service.boProdAn = {};
				order.phoneNumber.resetBoProdAn();
			}			
			//页面变动
			$("#order_fill_content").empty();
			OrderInfo.order.step=0;//订单初始页面
			order.prepare.hideStep();
			$("#orderedprod").show();
			$("#order_prepare").show();
		},no:function(){
			
		}},"question");
	};
	
	//加入组合入参
	var compparam = "";
	var _queryCustProd = function(){
		var hasmeneber = false;
		var prodnum = $.trim($("#prodnbr").val());
		if(prodnum==""){
			$.alert("提示","请输入需要查询的接入号！");
			return;
		}else{
			hasmeneber = isExist(prodnum);
		}
		if(hasmeneber.flag){
			if(hasmeneber.data=="1"){
				var param = {};
				var prodnum = $.trim($("#prodnbr").val());
				param.acctNbr=prodnum;
				var url = contextPath+"/cust/queryprodbynbr";
			}else{
				$.alert("提示","该产品已经在组合中，请重新选择！");
				return;
			}
		}else{
			return;
		}
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				if(response.code == -2){
					return;
				}else if(response.code != 0) {
					$.alert("提示","客户查询失败,稍后重试");
					return;
				}
				var content$=$("#prodinst");
				content$.html(response.data);
			}
		});	
	};
	
	var _compChangeTab = function(num){
		if(num == 1){
			$("#tab_1").addClass("setcon");
			$("#tab_2").removeClass("setcon");
			$("#addCompPage").show();
			$("#releaseShortNum").hide();
			$("#compopr").show();
		}else{
			$("#tab_2").addClass("setcon");
			$("#tab_1").removeClass("setcon");
			$("#addCompPage").hide();
			$("#releaseShortNum").show();
			$("#compopr").hide();
		}
	};
	
	var _addToComp = function(obj){
		var phonenumber = $(obj).parent().parent().children(":first-child").next().text();
		var productId = $(obj).parent().parent().children(":last-child").text();
		var prodInstId = $(obj).parent().parent().children().eq(-2).text();
		var prodStateCd = $(obj).parent().parent().children().eq(-3).text();
		var linum = $("#choosed_menbers li").length;
		if(linum>12){
			$.alert("提示","已经超过了加入的最大数量！");
			return;
		}
		if(prodStateCd!="100000"){
			$.alert("提示","该产品状态不符，不能纳入成员！");
			return;
		}
		var addphones = getChoosedMenbr();
		if(addphones.length!=0){
			for(var i=0;i<addphones.length;i++){
				if(phonenumber==addphones[i]){
					$.alert("提示","该号码已经在待纳入成员中，请重新选择！");
					return;
				}
			}
		}
		ec.form.dialog.createDialog({
			"id":"-grps",
			"initCallBack":function(dialogForm,dialog){
				var compdata = compspecGrps;
				var compPspecCompGrp2Pspecs = compspecGrps[0].compPspecCompGrp2Pspecs;//成员角色
				var compPspecCompGrpRelas = compspecGrps[0].compPspecCompGrpRelas;//子组角色
				if(compPspecCompGrpRelas==undefined){
					compPspecCompGrpRelas = [];
				}
				var zNodes=[];
				var menber=[];
				for(var i=0;i<compPspecCompGrp2Pspecs.length;i++){
					var grpspec = {
						name:compPspecCompGrp2Pspecs[i].prodSpecName,
						prodCompRelaRoleCd:compPspecCompGrp2Pspecs[i].prodCompRelaRoleCd,
						prodCompRelaRoleName:compPspecCompGrp2Pspecs[i].prodCompRelaRoleName,
						prodSpecId:compPspecCompGrp2Pspecs[i].prodSpecId
					};
					menber.push(grpspec);
				}
				var childmenber = [];
				for(var i=0;i<compPspecCompGrpRelas.length;i++){
					var compPspecCompGrpRelasSpecs = compPspecCompGrpRelas[i];
					var childSpec = [];
					for(var j=0;j<compPspecCompGrpRelasSpecs.length;j++){
						var grpspec = {
							name:compPspecCompGrpRelasSpecs[j].prodSpecName,
							prodCompRelaRoleCd:compPspecCompGrpRelasSpecs[j].prodCompRelaRoleCd,
							prodCompRelaRoleName:compPspecCompGrpRelasSpecs[j].prodCompRelaRoleName,
							prodSpecId:compPspecCompGrpRelasSpecs[j].prodSpecId
						};
						childSpec.push(grpspec);
					}
					var childrole = {
						name:compPspecCompGrpRelasSpecs[i].compPspecCompGrpName,
						children:childSpec
					}
					childmenber.push(childrole);
				}
				var setting = {	
					data: {
						key: {
							title:"t"
						},
						simpleData: {
							enable: true
						}
					},
					callback: {
						onClick: onClick
					}
				};
				if(compPspecCompGrp2Pspecs.length!=0){
					var node = {
						name:"成员",
						open:true,
						children:menber
					};
					zNodes.push(node);
				}
				if(compPspecCompGrpRelas.length!=0){
					var node = {
						name:"子组",
						children:childmenber
					};
					zNodes.push(node);
				}
				if(compPspecCompGrp2Pspecs.length==0&&compPspecCompGrpRelas.length==0){
					$.alert("提示","该产品没有成员规则，请重新选择群组产品！");
					return;
				}
				var prodCompRelaRoleCd="";
				var prodCompRelaRoleName="";
				function onClick(event, treeId, treeNode, clickFlag) {
					prodCompRelaRoleCd="";
					prodCompRelaRoleName="";
					var prodSpecId = treeNode.prodSpecId;
					if(prodSpecId==productId){//不同产品只能加入到指定类别下
						prodCompRelaRoleCd=treeNode.prodCompRelaRoleCd;
						prodCompRelaRoleName=treeNode.prodCompRelaRoleName;
					}else{
						$.alert("提示","不能加入该角色，请重新选择！");
					}
				}	
				$.fn.zTree.init($("#rluename"), setting, zNodes);
				
				$("#nextstep").click(function(){
					if(prodCompRelaRoleCd!=""&&prodCompRelaRoleName!=""){
						$("#dialogtitle").html('设置短号');
						var shortnumhtml = "短号设置：<input type='text' id='shortnumtext' class='inputWidth183px'/>";
						$("#rluename").html('').html(shortnumhtml);
						$("#nextstep").hide();
						$("#submitbtn2").show();
					}else{
						$.alert("提示","请选择所需纳入的成员！");
						return;
					}
				});
				$("#submitbtn2").click(function(){
					var shortnum = $("#shortnumtext").val();
					var reg = new RegExp("^[0-9]*$");
					if(shortnum==''){
						$("#errinfo").html("对不起，请输入短号！");
						return;
					}
				    if(!reg.test(shortnum)){
				    	$("#errinfo").html("短号只能为数字，请重新输入！");
						return;
				    }
				    var param = {
				    	groupNbr:_choosedProdInfo.accNbr,
						extProdId:_choosedProdInfo.productId,
						productNbr:"",
						accNbr:phonenumber,
						extPordInstId:_choosedProdInfo.prodInstId,
						shortNbr:shortnum,
						statusCd:"1102"
					};
					var url = contextPath+"/order/checkGroupShortNum";
					var res = $.callServiceAsJson(url,param,{});	
					if (res.code == 0) {
						var addnbrhtml="<li id='li_"+phonenumber+"' prodInstId='"+prodInstId+"' phonenumber='"+phonenumber+"' prodCompRelaRoleCd='"+prodCompRelaRoleCd+
						"' prodCompRelaRoleName='"+prodCompRelaRoleName+"' productId='"+productId+"' style='width:280px;'>" +
						"<dd class='delete' onclick='order.prodModify.addCompDelSelect(this);'></dd>"+
						"<span id='addNbr' style='display:inline;padding:0 5px 0 22px;'>"+phonenumber+"</span>"+
						"<span style='display:inline;padding:0px;'>[短号：</span><span style='display:inline;padding:0px;' id='shortNumber'>"+shortnum+
						"</span><span class='modshortnum' onclick='order.prodModify.changeShortNum(this);' style='display:inline;padding:0 25px 0 20px;'></span>"+
						"<span style='display:inline;padding:0px;'>]</span>";
						$("#choosed_menbers").append(addnbrhtml);
						dialogForm.close(dialog);
					}else if(res.code == -2){
						$.alertM(res.data);
					}else{
						$.alert("提示",res.data);
					}
				});
			},
			"submitCallBack":function(dialogForm,dialog){},
			width:400,height:150
		});
	};
	
	var getChoosedMenbr = function(){
		var numbers = [];
		$("#choosed_menbers li").each(function(){
			var phonenum= $(this).children('span#addNbr').text();
			numbers.push(phonenum);
		});
		return numbers;
	};
	
	var boolHasShortNum = function(){
		var hasshrot = true;
		$("#choosed_menbers li").each(function(){
			var phonenum= $(this).children('span#shortNumber').text();
			if(phonenum==""){
				hasshrot = false;
			}
		});
		return hasshrot;
	};
	
	var _changeShortNum =function(obj){
		var phonenum = $(obj).parent().children('span#addNbr').text();
		var shortnum = $(obj).parent().children('span#shortNumber').text();
		ec.form.dialog.createDialog({
			"id":"-shrotnum",
			"initCallBack":function(dialogForm,dialog){
				$("#shortnumval").val(shortnum);
				$("#submitbtn3").click(function(){
					shortnum = $(obj).parent().children('span#shortNumber').text();
					var newshortnum = $("#shortnumval").val();
					if(shortnum==newshortnum){
						dialogForm.close(dialog);
					}
					if(shortnum==""&&newshortnum!=""){
						var result = getOprShortNumInfo(phonenum,newshortnum,"1102");
						if(result.code==0){
							$("#li_"+phonenum).children('span#shortNumber').html(newshortnum);
						}else if(result.code==-2){
							$.alertM(result.data);
							return;
						}else{
							$.alert("提示","短号预占失败！");
							return;
						}
						dialogForm.close(dialog);
					}
					if(shortnum!=""&&newshortnum==""){
						$.alert("提示","请输入短号！");
						return;
					}
					if(shortnum!=""&&newshortnum!=""){
						var resultremove = getOprShortNumInfo(phonenum,shortnum,"1000");
						if(resultremove.code==0){
							$("#li_"+phonenum).children('span#shortNumber').html('');
						}else if(resultremove.code==-2){
							$.alertM(resultremove.data);
							return;
						}else{
							$.alert("提示","短号预占失败！");
							return;
						}
						var resultadd = getOprShortNumInfo(phonenum,newshortnum,"1102");
						if(resultadd.code==0){
							$("#li_"+phonenum).children('span#shortNumber').html(newshortnum);
						}else if(resultadd.code==-2){
							$.alertM(resultadd.data);
							return;
						}else{
							$.alert("提示","预占失败！");
							return;
						}
						dialogForm.close(dialog);
					}
				});
			},
			"submitCallBack":function(dialogForm,dialog){},
			width:350,height:100
		});
	};
	
	var getOprShortNumInfo = function(accNbr,shortNbr,statusCd){
		var param = {
			groupNbr:_choosedProdInfo.accNbr,
			extProdId:_choosedProdInfo.productId,
			productNbr:"",
			accNbr:accNbr,
			extPordInstId:_choosedProdInfo.prodInstId,
			shortNbr:shortNbr,
			statusCd:statusCd
		};
		var url = contextPath+"/order/checkGroupShortNum";
		var res = $.callServiceAsJson(url,param,{});
		return res;
	};
	
	var _releaseShortNum = function(){
		var shortNbr = $("#resshortnum").val();
		var param = {
			groupNbr:_choosedProdInfo.accNbr,
			extProdId:_choosedProdInfo.productId,
			productNbr:"",
			accNbr:"",
			extPordInstId:_choosedProdInfo.prodInstId,
			shortNbr:shortNbr,
			statusCd:"1000"
		};
		var url = contextPath+"/order/checkGroupShortNum";
		var res = $.callServiceAsJson(url,param,{});
		if(res.code==0){
			$.alert("提示","短号释放成功！");
			$("#choosed_menbers li").each(function(){
				var shortNum= $(this).children('span#shortNumber').text();
				if(shortNbr==shortNum){
					$(this).children('span#shortNumber').html('');
				}
			});
		}else if(res.code==-2){
			$.alertM(res.data);
			return;
		}else{
			$.alert("提示",res.data);
		}
	};
	
	var canAddAnother = function(){
		var phonelist = $("#choosed_menbers").html();
		phonelist = phonelist.replace(/[\r\n]/g,"").replace(/[ ]/g,"");
		if(phonelist!=''){
			var lastspan = $("#choosed_menbers").children(':last-child').children('span').length;
			if(lastspan<2){
				return false;
			}else{
				return true;
			}
		}else{
			return true;	
		}
	};
	
	var isExist = function(prodnum){
		var params = {
			"compProdId":_choosedProdInfo.prodInstId,
			"accessNumber":prodnum
		};
		var url = contextPath+"/order/queryCompmenber";
		var returndata = {};
		var isexist = $.callServiceAsJson(url,params, {});
		if (isexist.code == 0) {
			returndata.flag = true;
			var compProdMemberInfos = isexist.data;
			if(compProdMemberInfos.length>0){
				returndata.data="0";//表示在群组里面
			}else{
				returndata.data="1";//表示不在群组里面
			}
			return returndata;
		}else if(isexist.code == -2){
			$.alertM(returndata.data);
			returndata.flag = false;
		}else{
			returndata.flag = false;
			$.alert("提示",isexist.data);
			return returndata;
		}
	};
	
	var _addCompSubmit = function(){
		var phonelist = $("#choosed_menbers").html();
		phonelist = phonelist.replace(/[\r\n]/g,"").replace(/[ ]/g,"");
		if(phonelist==""){
			$.alert("提示","请选择纳入组合的成员！");
			return;
		}
		var boolshort = boolHasShortNum();
		if(!boolshort){
			$.alert("提示","待加入成员未全部设置短号，请全部设置好后再提交！");
			return;
		}
		var busiOrder = [];
		var addMenbers = [];
		var prodCompId = -1;
		$("#choosed_menbers li").each(function(){
			var prodInstId = $(this).attr('prodInstId');
			var phonenumber = $(this).attr('phonenumber');
			var prodCompRelaRoleCd = $(this).attr('prodCompRelaRoleCd');
			var prodCompRelaRoleName = $(this).attr('prodCompRelaRoleName');
			var productId = $(this).attr('productId');
			var shortnum =$(this).children('span#shortNumber').text();
			addMenbers.push(phonenumber);
			var compparam = {
				"busiOrderInfo": {
					"seq": OrderInfo.SEQ.seq--
		        },
		        "busiObj": {
			        "objId": CONST.PROD_SPEC.CDMA,
			        "instId": prodInstId,
			        "accessNumber": phonenumber
		        },
	            "boActionType": {
	                "actionClassCd": CONST.ACTION_CLASS_CD.PROD_ACTION,
	                "boActionTypeCd": CONST.BO_ACTION_TYPE.ADD_COMP
	            },
	            "areaId": OrderInfo.staff.areaId,
	            "aggreementId": "",
	            "data": {
	            	"boProdCompOrders": [{
	            		"prodCompRelaRoleCd": prodCompRelaRoleCd,
	                    "prodCompRelaRoleName": prodCompRelaRoleName,
	                    "prodCompId": prodCompId,
	                    "compProdId": _choosedProdInfo.prodInstId
	                }],
	                "boProdCompRelas": [{
	                	"prodCompId": prodCompId,
	                    "state": "ADD",
	                    "atomActionId":OrderInfo.SEQ.atomActionSeq--
	                }],
	                "boProdSpecs": [{
	                	"prodSpecId": productId,
	                    "atomActionId": OrderInfo.SEQ.atomActionSeq--,
	                    "state": "KIP"
	                }],
	                "boProdCompItems":[{
	        			"itemSpecId": "37906",
	        			"name": "",
	        			"prodCompId": prodCompId,
	        			"state": "ADD",
	        			"value": shortnum,
	        			"atomActionId":OrderInfo.SEQ.atomActionSeq--
	        		}],
	        		"busiOrderAttrs":[{
	        			itemSpecId:"111111111",
	        			value:$("#orderRemark").val()
	        		}]
	            }
	        };
			busiOrder.push(compparam);
			prodCompId--;
		});
		OrderInfo.confirmList = [];
		var comfimProdInfo = {
			name:_choosedProdInfo.productName,
			accNbr : [_choosedProdInfo.accNbr]
		};
		OrderInfo.confirmList.push(comfimProdInfo);
		var comfimMeneber = {
			name:"纳入成员",
			accNbr : addMenbers
		};
		OrderInfo.confirmList.push(comfimMeneber);
		SoOrder.submitOrder(busiOrder);
	};
	
	var _removeCompSubmit = function(){
		var t = $("#choosed_menbers").html();
        t = t.replace(/[\r\n]/g,"").replace(/[ ]/g,"");
		if(t==""){
			$.alert("提示","请选择退出组合的成员！");
			return;
		}
		var busiOrder = [];
		var addMenbers = [];
		$("#choosed_menbers li").each(function(){
			var prodInstId = $(this).attr('prodInstId');
			var phonenumber = $(this).attr('phonenumber');
			var prodCompRelaRoleCd = $(this).attr('prodCompRelaRoleCd');
			var prodCompRelaRoleName = $(this).attr('prodCompRelaRoleName');
			var prodCompId = $(this).attr('prodCompId');
			addMenbers.push(phonenumber);
			var compparam = {
				"busiOrderInfo": {
					"seq": -1
				},
			    "busiObj": {
				    "objId": CONST.PROD_SPEC.CDMA,
				    "instId": prodInstId,
				    "accessNumber": phonenumber
			    },
		        "boActionType": {
		            "actionClassCd": CONST.ACTION_CLASS_CD.PROD_ACTION,
		            "boActionTypeCd": CONST.BO_ACTION_TYPE.ADD_COMP
		        },
		        "areaId": OrderInfo.staff.areaId,
		        "aggreementId": "",
		        "data": {
		        	"boProdCompOrders": [{
		            	"prodCompRelaRoleCd": prodCompRelaRoleCd,
		                "prodCompRelaRoleName": prodCompRelaRoleName,
		                "prodCompId": prodCompId,
		                "compProdId": _choosedProdInfo.prodInstId
		            }],
		            "boProdCompRelas": [{
		                "prodCompId": prodCompId,
		                "state": "DEL"
		            }],
		        	"busiOrderAttrs":[{
		    			itemSpecId:"111111111",
		    			value:$("#orderRemark").val()
		    		}]
		        }
			};
			busiOrder.push(compparam);
		});
		OrderInfo.confirmList=[];
		var comfimProdInfo = {
			name:_choosedProdInfo.productName,
			accNbr : [_choosedProdInfo.accNbr]
		};
		OrderInfo.confirmList.push(comfimProdInfo);
		var comfimMeneber = {
			name:"退出成员",
			accNbr : addMenbers
		};
		OrderInfo.confirmList.push(comfimMeneber);
		SoOrder.submitOrder(busiOrder);
	};
	
	var _removeCompDelSelect = function(obj){
		$.confirm("确认","确定要取消该号码吗?",{ 
			yes:function(){
				var accNbr = $(obj).next().text();
				$("#li_"+accNbr).remove();
			},
			no:function(){						
			}
		});
	};
	
	var _addCompDelSelect = function(obj){
		$.confirm("确认","确定要取消该号码吗?",{ 
			yes:function(){
				var accNbr = $(obj).parent().children('span#addNbr').text();
				var shortnum =$(obj).parent().children('span#shortNumber').text();
				if(shortnum!=""){
					var param = {
						groupNbr:_choosedProdInfo.accNbr,
						extProdId:_choosedProdInfo.productId,
						productNbr:"",
						accNbr:accNbr,
						extPordInstId:_choosedProdInfo.prodInstId,
						shortNbr:shortnum,
						statusCd:"1000"
					};
					var url = contextPath+"/order/checkGroupShortNum";
					var response = $.callServiceAsJson(url,param,{});
					if(response.code==0){
						$("#li_"+accNbr).remove();
					}else if(response.code==-2){
						$.alertM(response.data);
					}else{
						alert("删除失败");
					}
				}else{
					$("#li_"+accNbr).remove();
				}
				
			},
			no:function(){						
			}
		});
	};

	//返销
	var _showBuyBack = function () {
		var param = _getCallRuleParam(CONST.BO_ACTION_TYPE.PRODUCT_PARMS,_choosedProdInfo.prodInstId);
		var callParam = {
			boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_BACK,
			boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.BUY_BACK),
			accessNumber : _choosedProdInfo.accNbr,
			prodOfferName : _choosedProdInfo.prodOfferName
		};
		var checkRule = rule.rule.prepare(param,'order.prodModify.showBuyBackDo',callParam);
	};
	
	//返销
	var _showBuyBackDo = function () {
		//预校验
		var inprodStatusCd=_choosedProdInfo.prodStateCd;
		var intoprodStatusCd=CONST.PROD_STATUS_CD.REMOVE_PROD;// 产品状态,REMOVE_PROD
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.BUY_BACK;//业务动作小类
/*		if(lteFlag){
			var flag=_updateCheckByChange(CONST.ACTION_CLASS_CD.PROD_ACTION,BO_ACTION_TYPE,inprodStatusCd,intoprodStatusCd);
			if (!flag) return;
		}*/
		if(!query.offer.setOffer()){
			return;
		}
		if(_showMemberWin()){
			$("#delPhoneTitle").html(CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.BUY_BACK)+'-是否保留成员');			
			$("#delPhoneNumber .btna_o:first").off("click").on("click",function(event){
				_closeDialog();
				_removeAndAdd(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.BUY_BACK,1);
			});			
			_commonShowDialog();
		}else{
			_removeCommit(CONST.PROD_STATUS_CD.REMOVE_PROD,CONST.BO_ACTION_TYPE.BUY_BACK,1);
		}
	};
	var _setCoupon = function (coupon) {
		_coupon = coupon;
	};
	//客户属性-展示 更多按钮
	var _btnMoreProfile=function(){
		if($("#modPartyProfile").is(":hidden")){
			$("#modPartyProfile").show();
			$("#proarroworder").removeClass();
			$("#proarroworder").addClass("arrowup");
			order.prodModify.changeLabel(0);
		}else{
			$("#modPartyProfile").hide();
			$("#proarroworder").removeClass();
			$("#proarroworder").addClass("arrow");
			$("#modTabProfile0").attr("click","1");
			$("#contactName").attr("data-validate","");
			_form_custInfomodify_btn();
		}
		/*$("#orderbutton").off("click").on("click",function(event){_btnQueryPhoneNumber();event.stopPropagation();});*/
	};
	//切换标签
	var _changeLabel = function(labelId){
		if($("#partyProfile").is(":visible")==false){
			$("#partyProfile").show();
		}
		if(labelId=="0"){
			$("#modTabProfile0").show();
			$("#cardtab_mod_0").addClass("setcon");
			$("#modTabProfile0").attr("click","0");
			$("#contactName").attr("data-validate","validate(required:请准确填写联系人名称) on(keyup)");
			_form_custInfomodify_btn();
		}else if(($("#modTabProfile0").attr("click")=="0")&&($("#contactName").val()=="")){
			$.alert("提示","联系人名称不能为空！","information");
			return;
		}
		for ( var i = 0; i < order.prodModify.profileTabLists.length; i++) {
			var profileTabLists = order.prodModify.profileTabLists[i];
			var tabProfileNum=profileTabLists.tabProfileNum;
			var partyProfileCatgTypeCd=profileTabLists.partyProfileCatgTypeCd;
			if(labelId==partyProfileCatgTypeCd){
				$("#"+tabProfileNum).show();
				$("#cardtab_mod_"+partyProfileCatgTypeCd).addClass("setcon");
				$("#modTabProfile0").hide();
				$("#cardtab_mod_0").removeClass("setcon");
			}else{
				$("#"+tabProfileNum).hide();
				$("#cardtab_mod_"+partyProfileCatgTypeCd).removeClass("setcon");
			}
		}
		
	};
	return {
		changeCard : _changeCard,
		getChooseProdInfo : _getChooseProdInfo,
		lossRepProd : _lossRepProd,
		lossRepProdSubmit : _lossRepProdSubmit,
		choosedProdInfo : _choosedProdInfo,
		showLossRepProd : _showLossRepProd,
		showStopKeepNumProd : _showStopKeepNumProd,
		showCustInfoModify : _showCustInfoModify,
		custInfoModify : _custInfoModify,
		commonPrepare : _commonPrepare,
		showOweRemoveProd:_showOweRemoveProd,
		showRemoveProd : _showRemoveProd,
		showOrderRemoveProd : _showOrderRemoveProd,
		showCoverOrderRemoveProd : _showCoverOrderRemoveProd,
		showBreakRuleRemoveProd : _showBreakRuleRemoveProd,
		showNoActiveRemoveProd:_showNoActiveRemoveProd,
		spec_parm_change : _spec_parm_change,
		showChangeCard : _showChangeCard,
		spec_password_change : _spec_password_change,
		spec_password_change_save : _spec_password_change_save,
		showPasswordChange : _showPasswordChange,
		spec_password_change_check : _spec_password_change_check,
		getCallRuleParam : _getCallRuleParam,
		cancel : _cancel,
		orderAttachOffer : _orderAttachOffer,
		changeOffer		: _changeOffer,
		shortnum_change:_shortnum_change,
		shortnum_show:_shortnum_show,
		shortnum_save:_shortnum_save,
		spec_parm_show:_spec_parm_show,
		showAddComp : _showAddComp,
		addComp :_addComp,
		addToComp:_addToComp,
		compChangeTab:_compChangeTab,
		queryCustProd : _queryCustProd,
		addCompSubmit : _addCompSubmit,
		spec_parm_show:_spec_parm_show,
		showChangeAccount : _showChangeAccount,
		changeAccount : _changeAccount,
		showOrigAccts : _showOrigAccts,
		chooseAcct : _chooseAcct,
		queryAccount : _queryAccount,
		returnAccount : _returnAccount,
		createAcct : _createAcct,
		ifNewAcct : _ifNewAcct,
		changeAccountSave  :_changeAccountSave,
		showRemoveComp:_showRemoveComp,
		removeComp:_removeComp,
		profiles :_profiles,
		profileTabLists :_profileTabLists,
		partyTypeCdChoose:_partyTypeCdChoose,
		identidiesTypeCdChoose :_identidiesTypeCdChoose,
		removeCompSubmit :_removeCompSubmit,
		showPasswordReset:_showPasswordReset,
		spec_password_reset:_spec_password_reset,
		spec_password_reset_save:_spec_password_reset_save,
		queryRomveAcc:_queryRomveAcc,
		removeCompDelSelect:_removeCompDelSelect,
		addCompDelSelect:_addCompDelSelect,
		chooseOfferForMember:_chooseOfferForMember,
		shortnum_check:_shortnum_check,
		shortnum_change_val:_shortnum_change_val,
		changeShortNum:_changeShortNum,
		releaseShortNum:_releaseShortNum,
		showActiveReturn :_showActiveReturn,
		showBuyBack:_showBuyBack,
		showBuyBackDo:_showBuyBackDo,
		setCoupon:_setCoupon,
		lteFlag :lteFlag,
		btnMoreProfile :_btnMoreProfile,
		changeLabel : _changeLabel
	};
})();
/**
 * 号码查询
 * 
 * @author lianld
 */
CommonUtils.regNamespace("order", "phoneNumber");
/**
 * 号码查询
 */
var phoneNum_level="";
order.phoneNumber = (function(){
	var _boProdAn = {
			accessNumber : "", //接入号
			org_level:"",//原始的号码等级，为了页面展示增加的字段
			level : "", //等级
			anId : "", //接入号ID
			anTypeCd : "",//号码类型
			areaId:"",
			memberRoleCd:""
	};
	var _resetBoProdAn = function(){
		_boProdAn = {
				accessNumber : "", //接入号
				org_level:"",//原始的号码等级，为了页面展示增加的字段
				level : "", //等级
				anId : "", //接入号ID
				anTypeCd : "",//号码类型
				areaId:"",
				memberRoleCd:""
		};
	};
	var idcode=[];
	//请求地址
	var url = contextPath+"/mktRes/phonenumber/list";
	var phoneNumberVal="";
	//按钮查询
	var _btnQueryPhoneNumber=function(param){
		//收集参数
		param = _buildInParam(param);
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				var content$=$("#order_phonenumber .phone_warp");
				content$.html(response.data);
				$("#btnSwitchNbr").off("click").on("click",function(){order.phoneNumber.btnQueryPhoneNumber({});});
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});	
	};
	var _btnIBydentityQuery=function(){
		var idcode=$.trim($("#idCode").val());
		if(idcode==''){
			$.alert("提示","请先输入身份证号码!");
			return;
		}
		if(!_idcardCheck(idcode)){
			$.alert("提示","身份证号码输入有误!");
			return;
		}
		var areaId=$("#p_phone_areaId").val();
		var param={"identityId":idcode,"areaId":areaId};
		$.callServiceAsHtmlGet(contextPath+"/mktRes/phonenumber/listByIdentity",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				var content$=$("#order_phonenumber .phone_warp");
				content$.html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});	
	};
	//选择身份证预占的号码
	var _btnToOffer=function(obj){
		phoneNumberVal = $(obj).attr("numberVal"); 
		var memberRoleCd=CONST.MEMBER_ROLE_CD.MAIN_CARD;
		//选号类型：新装主卡选号、新装副卡选号 Y1、Y2
		var subFlag=$("#subFlag").val();
		if(subFlag=='Y2'){
			memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
		}
		//订单序号：O1、O2区分暂存单允许多个订单的情况
		var subnum=$("#subnum").val();
		//入口终端入口，号码入口，订单填写入口:terminal\offer\number
		var subPage=$("#subPage").val();
		//号码的预存话费
		var preStoreFare=phoneNumberVal.split("_")[1];
		//保底消费
		var pnPrice=phoneNumberVal.split("_")[2];
		if(order.service.offerprice!=''){
			var minMonthFare=parseInt(pnPrice);
			//套餐月基本费用
			var packageMonthFare=parseInt(order.service.offerprice);
			if(packageMonthFare<minMonthFare){
				$.alert("提示","对不起,此号码不能被选购.(原因:套餐月基本费用必须大于号码月保底消费)");
				return;
			}
		}
		//正在被预占的号码
		var phoneNumber=phoneNumberVal.split("_")[0];
		var anTypeCd=phoneNumberVal.split("_")[3];
		var plevel=phoneNumberVal.split("_")[5];
		var phoneNumId=phoneNumberVal.split("_")[6];
		var areaId=$("#p_phone_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var areaCode=$("#p_phone_areaId").attr("areaCode");
		if(areaCode==null || areaCode==""){
			areaCode =OrderInfo.staff.areaCode;
		} 
		if(phoneNumber){
			var oldrelease=false;
			var oldPhoneNumber="";
			var oldAnTypeCd="";
			if(subPage=='terminal'||subPage=='number'){
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
				/*if(oldPhoneNumber==phoneNumber){
					$.alert("提示","号码已经被预占,请选择其它号码!");
					return;
				}*/
			}else if(subPage=='offer'){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						oldPhoneNumber=OrderInfo.boProdAns[i].accessNumber;
						oldAnTypeCd=OrderInfo.boProdAns[i].anTypeCd;
						break;
					}
				}
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId!=subnum){
						if(OrderInfo.boProdAns[i].accessNumber==phoneNumber){
							$.alert("提示","你已经选择了该号码,请选择其它号码!");
							return;
						}
					}
				}
			}
			if(oldPhoneNumber!=""){
				oldrelease=true;
				for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
					if(idcode[i]==oldPhoneNumber){
						oldrelease=false;
						break;
					}
				}
				if(oldrelease){
					var purchaseUrl=contextPath+"/mktRes/phonenumber/purchase";
					var params={"oldPhoneNumber":oldPhoneNumber,"oldAnTypeCd":oldAnTypeCd};
					$.callServiceAsJson(purchaseUrl, params, {});
				}
			}
			idcode.push(phoneNumber);
			if(subPage=='number'){
				var content$=$("#order_fill_content");
				content$.html('');
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.level=plevel;
				_boProdAn.org_level=response.data.phoneLevelId;
				_boProdAn.anId=phoneNumId;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				_boProdAn.memberRoleCd=memberRoleCd;
				_boProdAn.idFlag=0;
				order.service.boProdAn = _boProdAn;
			}else if(subPage=='terminal'){
				mktRes.terminal.setNumber(phoneNumber, plevel);
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.level=plevel;
				_boProdAn.org_level=response.data.phoneLevelId;
				_boProdAn.anId=phoneNumId;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				_boProdAn.memberRoleCd=memberRoleCd;
				_boProdAn.idFlag=0;
				order.service.boProdAn = _boProdAn;
			}else if(subPage=='offer'){
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.anId=phoneNumId;
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.level=response.data.phoneLevelId;
				_boProdAn.org_level=response.data.phoneLevelId;
				_boProdAn.areaId=areaId;
				_boProdAn.areaCode =areaCode;
				$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
				$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
				$("#nbr_btn_"+subnum).html(phoneNumber+"<u></u>");
				var isExists=false;
				if(OrderInfo.boProdAns.length>0){
					for(var i=0;i<OrderInfo.boProdAns.length;i++){
						if(OrderInfo.boProdAns[i].prodId==subnum){
							OrderInfo.boProdAns[i].accessNumber=phoneNumber;
							OrderInfo.boProdAns[i].anTypeCd=anTypeCd;
							OrderInfo.boProdAns[i].pnLevelId=plevel;
							OrderInfo.boProdAns[i].anId=phoneNumId;
							OrderInfo.boProdAns[i].areaId=areaId;
							OrderInfo.boProdAns[i].areaCode =areaCode;
							OrderInfo.boProdAns[i].memberRoleCd=memberRoleCd;
							OrderInfo.boProdAns[i].idFlag=0;
							isExists=true;
							OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
							order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
							break;
						}
					}
				}
				if(!isExists){
					var param={
						prodId : subnum, //从填单页面头部div获取
						accessNumber : phoneNumber, //接入号
						anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
						anId : phoneNumId, //接入号ID
						anTypeCd : anTypeCd, //号码类型
						pnLevelId:plevel,
						state : "ADD", //动作	,新装默认ADD	
						areaId:areaId,
						areaCode:areaCode,
						memberRoleCd:memberRoleCd,
						idFlag:0
					};
					OrderInfo.boProdAns.push(param);
				}
				if(subnum=='-1'){
					OrderInfo.boCustInfos.telNumber=phoneNumber;
				}
			}
		} else {
			$.alert("提示","号码格式不正确!");
		}
	};
	
	var _initOffer=function(subnum){
		if(_boProdAn.accessNumber!=''){
			$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
			$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
			$("#nbr_btn_"+subnum).html(_boProdAn.accessNumber+"<u></u>");
			order.dealer.changeAccNbr(subnum,_boProdAn.accessNumber);
		}
		if(_boProdAn.accessNumber!=''){
			var isExists=false;
			if(OrderInfo.boProdAns.length>0){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						OrderInfo.boProdAns[i].accessNumber=_boProdAn.accessNumber;
						OrderInfo.boProdAns[i].anTypeCd=_boProdAn.anTypeCd;
						OrderInfo.boProdAns[i].anId=_boProdAn.anId;
						OrderInfo.boProdAns[i].pnLevelId=_boProdAn.level;
						OrderInfo.boProdAns[i].areaId=_boProdAn.areaId;
						OrderInfo.boProdAns[i].memberRoleCd=_boProdAn.memberRoleCd;
						if(_boProdAn.idFlag){
							OrderInfo.boProdAns[i].idFlag=_boProdAn.idFlag;
						}
						OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
						order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
						isExists=true;
						break;
					}
				}
			}
			if(!isExists){
				var param={
					prodId : subnum, //从填单页面头部div获取
					accessNumber : _boProdAn.accessNumber, //接入号
					anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
					anId : _boProdAn.anId, //接入号ID
					pnLevelId:_boProdAn.level,
					anTypeCd : _boProdAn.anTypeCd, //号码类型
					state : "ADD", //动作	,新装默认ADD
					areaId:_boProdAn.areaId,
					memberRoleCd:_boProdAn.memberRoleCd
				};
				if(_boProdAn.idFlag){
					param.idFlag=_boProdAn.idFlag;
				}
				OrderInfo.boProdAns.push(param);
			}
			if(subnum=='-1'){
				OrderInfo.boCustInfos.telNumber=_boProdAn.accessNumber;
			}
		}
	};
	
	var _qryOfferInfoByPhoneNumFee=function(){
		var param={};
		$.callServiceAsHtmlGet(contextPath+"/order/prodoffer/prepare",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response||response.code != 0){
					 response.data='查询失败,稍后重试';
				}
				var content$=$("#order_tab_panel_content");
				content$.html(response.data);
				order.service.initSpec();
				order.prodOffer.init();
				order.service.searchPack();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	
	//号码预占
	var _btnPurchase=function(obj){
		phoneNumberVal = $(obj).attr("numberVal"); 
		var memberRoleCd=CONST.MEMBER_ROLE_CD.MAIN_CARD;
		//选号类型：新装主卡选号、新装副卡选号 Y1、Y2
		var subFlag=$("#subFlag").val();
		if(subFlag=='Y2'){
			memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
		}
		//订单序号：O1、O2区分暂存单允许多个订单的情况
		var subnum=$("#subnum").val();
		//入口终端入口，号码入口，订单填写入口:terminal\offer\number
		var subPage=$("#subPage").val();
		//号码的预存话费
		var preStoreFare=phoneNumberVal.split("_")[1];
		//保底消费
		var pnPrice=phoneNumberVal.split("_")[2];
		var areaId=$("#p_phone_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var areaCode=$("#p_phone_areaId").attr("areaCode");
		if(areaCode==null || areaCode==""){
			areaCode =OrderInfo.staff.areaCode;
		} 
		if(order.service.offerprice!=''){
			var minMonthFare=parseInt(pnPrice);
			//套餐月基本费用
			var packageMonthFare=parseInt(order.service.offerprice);
			if(packageMonthFare<minMonthFare){
				$.alert("提示","对不起,此号码不能被选购.(原因:套餐月基本费用必须大于号码月保底消费)");
				return;
			}
		}
		//正在被预占的号码
		var phoneNumber=phoneNumberVal.split("_")[0];
		var anTypeCd=phoneNumberVal.split("_")[3];
		var plevel=phoneNumberVal.split("_")[5];
		if(phoneNumber){
			var phoneAreaId = $("#p_phone_areaId").val();
			var params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd,"areaId":phoneAreaId};
			var oldrelease=false;
			var oldPhoneNumber="";
			var oldAnTypeCd="";
			if(subPage=='terminal'||subPage=='number'){
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
				if(oldPhoneNumber==phoneNumber){
					$.alert("提示","号码已经被预占,请选择其它号码!");
					return;
				}else{
					_boProdAn={};
				}
			}else if(subPage=='offer'){
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].prodId==subnum){
						oldPhoneNumber=OrderInfo.boProdAns[i].accessNumber;
						oldAnTypeCd=OrderInfo.boProdAns[i].anTypeCd;
						break;
					}
				}
				for(var i=0;i<OrderInfo.boProdAns.length;i++){
					if(OrderInfo.boProdAns[i].accessNumber==phoneNumber){
						$.alert("提示","号码已经被预占,请选择其它号码!");
						return;
					}
				}
			}
			if(oldPhoneNumber&&oldPhoneNumber!=""){
				oldrelease=true;
				for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
					if(idcode[i]==oldPhoneNumber){
						oldrelease=false;
						break;
					}
				}
				if(oldrelease){
					params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd,"areaId":phoneAreaId};
				}
			}
			var purchaseUrl=contextPath+"/mktRes/phonenumber/purchase";
			$.callServiceAsJson(purchaseUrl, params, {
				"before":function(){
					$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
				},"always":function(){
					$.unecOverlay();
				},	
				"done" : function(response){
					if (response.code == 0) {
						//去掉其他号码选中效果
						$(obj).siblings().each(function(){
							$(this).removeClass("select");
							var numberval=$(this).attr("numberval").split("_");
							var tx="<span style='padding-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元</span> <span style='padding-left:10px;'> 保底<span class='orange'>"+numberval[2]+"</span>元</span>";
							$(this).find("div").html(tx);
						});
						//添加号码选中样式
						$(obj).addClass("select");
						if(subPage=='number'){
							var content$=$("#order_fill_content");
							content$.html('');
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.level=response.data.phoneLevelId;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.areaId=areaId;
							_boProdAn.areaCode = areaCode;
							_boProdAn.memberRoleCd=memberRoleCd;
							order.service.boProdAn = _boProdAn;

						}else if(subPage=='terminal'){
							mktRes.terminal.setNumber(phoneNumber, response.data.phoneLevelId);
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.level=response.data.phoneLevelId;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.areaId=areaId;
							_boProdAn.areaCode = areaCode;
							_boProdAn.memberRoleCd=memberRoleCd;
							order.service.boProdAn = _boProdAn;

						}else if(subPage=='offer'){
							$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
							$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
							$("#nbr_btn_"+subnum).html(phoneNumber+"<u></u>");
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.level=response.data.phoneLevelId;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.areaId=areaId;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.anId=response.data.phoneNumId;
							var isExists=false;
							if(OrderInfo.boProdAns.length>0){ //判断是否选过
								for(var i=0;i<OrderInfo.boProdAns.length;i++){
									if(OrderInfo.boProdAns[i].prodId==subnum){
										OrderInfo.boProdAns[i].accessNumber=phoneNumber;
										OrderInfo.boProdAns[i].anTypeCd=anTypeCd;
										OrderInfo.boProdAns[i].pnLevelId=response.data.phoneLevelId;
										OrderInfo.boProdAns[i].anId=response.data.phoneNumId;
										OrderInfo.boProdAns[i].areaId=areaId;
										OrderInfo.boProdAns[i].areaCode = areaCode;
										OrderInfo.boProdAns[i].memberRoleCd=memberRoleCd;
										isExists=true;
										OrderInfo.setProdAn(OrderInfo.boProdAns[i]);  //保存到产品实例列表里面
										order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
										break;
									}
								}
							}
							if(!isExists){
								var param={
									prodId : subnum, //从填单页面头部div获取
									accessNumber : phoneNumber, //接入号
									anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
									anId : response.data.phoneNumId, //接入号ID
									pnLevelId:response.data.phoneLevelId,
									anTypeCd : anTypeCd, //号码类型
									state : "ADD", //动作	,新装默认ADD	
									areaId:areaId,
									areaCode:areaCode,
									memberRoleCd:memberRoleCd
								};
								OrderInfo.boProdAns.push(param);
								OrderInfo.setProdAn(param);  //保存到产品实例列表里面
								order.dealer.changeAccNbr(subnum,phoneNumber); //选号玩要刷新发展人管理里面的号码
							}
							if(subnum=='-1'){
								OrderInfo.boCustInfos.telNumber=phoneNumber;
							}

						}
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						var msg="";
						if(response.data!=undefined&&response.data.msg!=undefined){
							msg=response.data.msg;
						}else{
							msg="号码["+phoneNumber+"]预占失败";
						}
						$.alert("提示","号码预占失败，可能原因:"+msg);
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","服务忙，请稍后再试！");
				}
			});
		} else {
			$.alert("提示","号码格式不正确!");
		}
	};
	

	
	//链接查询
	var _linkQueryPhoneNumber = function(loc,selected){
		_exchangeSelected(loc,selected);
		_btnQueryPhoneNumber();
	};
	//构造查询条件 
	var _buildInParam = function(param){
		var areaId=$("#p_phone_areaId").val();
		var pnHead = $("#pnHead").find("a.selected").attr("val");
		var pnEnd =$.trim($("#pnEnd").val());
		if(pnEnd=='最后四位'){
			pnEnd='';
		}
		var phoneNum=$.trim($("#phoneNum").val());
		if(phoneNum=="任意四位"){
			phoneNum='';
		}
		var pnCharacterId="";
		var Greater  = "";
		var Less  ="";
		var preStore$=$("#preStore").find("a.selected");
		if(preStore$.length>0){
			Greater= preStore$.attr("Greater");
			Less=preStore$.attr("Less");
		}
		
		var poolId = $("#nbrPool option:selected").val();	
		
		if($("#pnCharacterId_basic").css("display") != "none"){
			pnCharacterId = $("#pnCharacterId_basic a.selected").attr("val");
		}
		if($("#pnCharacterId_all").css("display") != "none"){
			pnCharacterId = $("#pnCharacterId_all a.selected").attr("val");
		}
		pnCharacterId = ec.util.defaultStr(pnCharacterId);
		return {"pnHead":pnHead,"pnEnd":pnEnd,"goodNumFlag":pnCharacterId,"maxPrePrice":Less,
			"minPrePrice":Greater,"pnLevelId":'',"pageSize":"15","phoneNum":phoneNum,"areaId":areaId,"poolId":poolId
		};
	};
	//点击前定位
	var _exchangeSelected = function(loc,selected){
		$(loc).each(function(){$(this).removeClass("selected");});
		$(selected).addClass("selected");
	};
	//分页查询
	var _getIndexPagePhoneNumber=function(pageIndex){
		var param={pageIndex:pageIndex};
		order.phoneNumber.btnQueryPhoneNumber(param);
	};
	var _idcardCheck=function(num){
		num = num.toUpperCase();
		if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
		{
			return false;
		}
		var len, re;
		len = num.length;
		if(len == 15) {
			re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				num += arrCh[nTemp % 11];
				return num;
			}
		}
		if(len == 18) {
			re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
			var arrSplit = num.match(re);
			var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
			var bGoodDay;
			bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay) {
				return false;
			} else {
				var valnum;
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				var nTemp = 0, i;
				for( i = 0; i < 17; i++) {
					nTemp += num.substr(i, 1) * arrInt[i];
				}
				valnum = arrCh[nTemp % 11];
				if(valnum != num.substr(17, 1)) {
					return false;
				}
				return num;
			}
		}
		return false;
	};
	//查询平台配置信息
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
		var qryConfigUrl=contextPath+"/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	var call_back_success_queryApConfig=function(response){
		var PHONE_NUMBER_PRESTORE;
		var PHONE_NUMBER_SEGMENT;
		var PHONE_NUMBER_FEATURE;
		var phoneNumberPreStoreHtml="<a href=\"javascript:void(0);\" class=\"selected\" Greater=\"\" Less=\"\">不限</a>";
		var phoneNumStartHtml="<a href=\"javascript:void(0);\" class=\"selected\" val=\"\">不限</a>";
		var phoneNumberFeatureLessHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		var phoneNumberFeatureMoreHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
		if(response.data){
			var dataLength=response.data.length;
			//号码预存话费
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_PRESTORE){
				  	PHONE_NUMBER_PRESTORE=response.data[i].PHONE_NUMBER_PRESTORE;
				  	for(var m=0;m<PHONE_NUMBER_PRESTORE.length;m++){
				  		var  preStore=PHONE_NUMBER_PRESTORE[m].COLUMN_VALUE_NAME.replace(/\"/g, "");
				  		var greater;
				  		var less;
			  			var preStoreArry=preStore.split("-");
			  			if(preStoreArry.length!=1){
			  				greater=preStoreArry[0];
			  				less=preStoreArry[1];
			  			}else{
			  				preStoreArry=preStoreArry.toString();
			  				greater=preStoreArry.substring(0,preStoreArry.length-2);
			  				less="\"\"";
			  			}
			  			preStore=preStore.replace(/\"/g, "");
				  		phoneNumberPreStoreHtml=phoneNumberPreStoreHtml+"<a href=\"javascript:void(0);\" Greater="+greater+" Less="+less+">"+preStore+"</a>";
				  	}
				  	$("#preStore").html(phoneNumberPreStoreHtml);
					continue;
				}
			};
			//号段
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_SEGMENT){
				  	PHONE_NUMBER_SEGMENT=response.data[i].PHONE_NUMBER_SEGMENT;
				  	for(var m=0;m<PHONE_NUMBER_SEGMENT.length;m++){
				  		var  numberStart=PHONE_NUMBER_SEGMENT[m].COLUMN_VALUE_NAME;
				  		numberStart=numberStart.replace(/\"/g, "");
				  		phoneNumStartHtml=phoneNumStartHtml+"<a href=\"javascript:void(0);\" val="+numberStart+">"+numberStart+"</a>";
				  	}
				  	$("#pnHead").html(phoneNumStartHtml);
					continue;
				}
			};
			//号码特征
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].PHONE_NUMBER_FEATURE){
				  	PHONE_NUMBER_FEATURE=response.data[i].PHONE_NUMBER_FEATURE;
				  	var featureLength;
				  	if(PHONE_NUMBER_FEATURE.length<=9){
				  		featureLength=PHONE_NUMBER_FEATURE.length;
				  	}else{
				  		featureLength=9;
				  	}
				  	for(var m=0;m<featureLength;m++){
				  		var numberFeature=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
				  		var numberFeatureVal=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE).replace(/\"/g, "");
				  		phoneNumberFeatureLessHtml=phoneNumberFeatureLessHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
				  	}
				  	if(PHONE_NUMBER_FEATURE.length>9){
				  		for(var n=0;n<PHONE_NUMBER_FEATURE.length;n++){
				  			var numberFeature=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE_NAME).replace(/\"/g, "");
				  			var numberFeatureVal=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE).replace(/\"/g, "");
				  			phoneNumberFeatureMoreHtml=phoneNumberFeatureMoreHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
				  		}
				  		$("#pnCharacterId_more").show();
				  		$("#pnCharacterId_more").off("click").on("click",function(event){_view_phonenumber_feature();event.stopPropagation();});
				  	}
				  	$("#pnCharacterId_basic").html(phoneNumberFeatureLessHtml);
				  	$("#pnCharacterId_all").html(phoneNumberFeatureMoreHtml);
					continue;
				}
			};
		}
		$("#pnCharacterId_basic a").each(function(){$(this).off("click").on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#pnCharacterId_basic a",this);event.stopPropagation();});});
		$("#pnCharacterId_all a").each(function(){$(this).off("click").on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#pnCharacterId_all a",this);event.stopPropagation();});});
		$("#pnHead a").each(function(){$(this).off("click");$(this).on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#pnHead a",this);event.stopPropagation();});});
		$("#preStore a").each(function(){$(this).off("click");$(this).on("click",function(event){order.phoneNumber.linkQueryPhoneNumber("#preStore a",this);event.stopPropagation();});});
	};
	//号码类型全部展示与部分展示
	var _view_phonenumber_feature = function(){
		if($('#pnCharacterId_basic').is(':hidden')){
			$("#pnCharacterId_basic").css("display","");
			$("#pnCharacterId_all").css("display","none");
			$("#pnCharacterId_all").parent("dl").css("overflow","inherit");
		}else{
			$("#pnCharacterId_basic").css("display","none");
			$("#pnCharacterId_all").css("display","");
			$("#pnCharacterId_all").parent("dl").css("overflow","hidden");
		}
	};
	
	var _initPhonenumber=function(){
		order.phoneNumber.queryApConfig();
		queryPhoneNbrPool();
		var param={};
		order.phoneNumber.btnQueryPhoneNumber(param);
		$("#btnNumSearch").off("click").on("click",function(){order.phoneNumber.btnQueryPhoneNumber(param);});
		$("#btnNumExistSearch").off("click").on("click",function(event){order.phoneNumber.btnIBydentityQuery(param);event.stopPropagation();});
	};
	
	//查询号池
	var queryPhoneNbrPool = function(){
		var url=contextPath+"/mktRes/phonenumber/queryPhoneNbrPool";
		var param={};
		var response = $.callServiceAsJson(url,param);
		if (response.code==0) {
			if(response.data){
				var phoneNbrPoolList= response.data.phoneNbrPoolList;
				var $sel = $('<select id="nbrPool" style="width:200px;"></select>');  
				var $defaultopt = $('<option value="" selected="selected">请选择号池</option>');
				$sel.append($defaultopt);
				if(phoneNbrPoolList!=null){
					$.each(phoneNbrPoolList,function(){
						var $option = $('<option value="'+this.poolId+'">'+this.poolName+'</option>');
						$sel.append($option);
					});
				}
				$("#nbrPool").append($sel);
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","号池加载失败，请稍后再试！");
		}
	};
	//选择地区
	var _chooseArea = function(){
		order.area.chooseAreaTree("order/prepare","p_phone_areaId_val","p_phone_areaId",3);
	};
	var _initPage=function(){
		var url=contextPath+"/mktRes/phonenumber/prepare";
		var param={};
		if(_boProdAn.accessNumber!=''&&_boProdAn.anTypeCd!=''){
			var oldrelease=true;
			for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
				if(idcode[i]==_boProdAn.accessNumber){
					oldrelease=false;
					break;
				}
			}
			if(oldrelease){
				param={"oldPhoneNumber":_boProdAn.accessNumber,"oldAnTypeCd":_boProdAn.anTypeCd};
			}
		}
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='选号页面加载异常,稍后重试';
				}
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				var content$=$("#order_tab_panel_content");
				content$.html(response.data);
				_boProdAn = {accessNumber : "",level : "",anId : "",anTypeCd : ""};
				_initPhonenumber();
			}
		});	
	};
	//设置号码等级
	var _qryPhoneNbrLevelInfoList=function(){
		var can_cheng_Num=false;
		$(".select_nbr_li").each(function(){
			if($(this).hasClass("select")){
				can_cheng_Num=true;
			}
		});
		if(!can_cheng_Num){
			$.alert("提示","请先选择号码！");
			return;
		}
		//入口终端入口，号码入口，订单填写入口:terminal\offer\number
		var subPage=$("#subPage").val();
		//订单序号：O1、O2区分暂存单允许多个订单的情况
		var subnum=$("#subnum").val();
		var qryUrl=contextPath+"/mktRes/qryPhoneNbrLevelInfoList";
		$.ligerDialog.open({
			width:560,
			height:350,
			allowClose:false,
			title:'设置号码等级',
			url:qryUrl+"?pnLevelId="+_boProdAn.level+"&areaId="+_boProdAn.areaId+"&org_level="+_boProdAn.org_level,
			buttons: [ { text: '确定', onclick:function (item, dialog) {
				var strs=phoneNum_level.split("_");////全局变量，保存“号码等级_预存金额_保底金额”，由弹出框的iframe，赋值
				dialog.close(); 
				//设置选择的样式
				$(".select_nbr_li").each(function(){
					if($(this).hasClass("select")){
						var numberval=$(this).attr("numberval").split("_");
						var tx;
						if(phoneNum_level!=undefined&&phoneNum_level!=""&&numberval[5]!=strs[0]){
							tx="<span style='float:left;margin-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元<br/>保底<span class='orange'>"+numberval[2]+"</span>元</span><span style='float:right;margin-right:10px;'>预存<span class='orange'>"+strs[1]+"</span>元<br/>保底<span class='orange'>"+strs[2]+"</span>元</span><span style='width: 15px; display: table; height: 30px; padding-top: 10px;'><img  src='"+contextPath+"/image/common/levelArrow.png'></span>";
						}else{
							tx="<span style='padding-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元</span> <span style='padding-left:10px;'> 保底<span class='orange'>"+numberval[2]+"</span>元</span>";
						}
						$(this).find("div").html(tx);
					}
				});
				//保存刚修改的值
				if(subPage=='number'){
					_boProdAn.level=strs[0];
				}else if(subPage=='terminal'){
					_boProdAn.level=strs[0];
				}else if(subPage=='offer'){
					for(var i=0;i<OrderInfo.boProdAns.length;i++){
						if(OrderInfo.boProdAns[i].prodId==subnum){
							OrderInfo.boProdAns[i].pnLevelId=strs[0];
							break;
						}
					}
				}
			} }, { text: '关闭', onclick: function (item, dialog) { dialog.close(); } }] 	
		});
	};
	//结束选号，不通的模块要做的动作不相同
	var _endSelectNum=function(){
		if(_boProdAn.level==""||_boProdAn.level==undefined){
			$.alert("提示","请先选择号码！");
			return;
		}
		//入口终端入口，号码入口，订单填写入口:terminal\offer\number
		var subPage=$("#subPage").val();

		if(subPage=='number'){
			_qryOfferInfoByPhoneNumFee();
		}else if(subPage=='terminal'){
			if(order.phoneNumber.dialogForm!=undefined&&order.phoneNumber.dialog!=undefined){
				order.phoneNumber.dialogForm.close(order.phoneNumber.dialog);
			}
		}else if(subPage=='offer'){
			if(order.phoneNumber.dialogForm!=undefined&&order.phoneNumber.dialog!=undefined){
				order.phoneNumber.dialogForm.close(order.phoneNumber.dialog);
			}
		}
	};
	return {
		qryPhoneNbrLevelInfoList:_qryPhoneNbrLevelInfoList,
		endSelectNum:_endSelectNum,
		btnPurchase : _btnPurchase,
		btnQueryPhoneNumber : _btnQueryPhoneNumber,
		linkQueryPhoneNumber : _linkQueryPhoneNumber,
		getIndexPagePhoneNumber :_getIndexPagePhoneNumber,
		queryApConfig:_queryApConfig,
		initPhonenumber:_initPhonenumber,
		boProdAn:_boProdAn,
		resetBoProdAn:_resetBoProdAn,
		btnIBydentityQuery:_btnIBydentityQuery,
		btnToOffer:_btnToOffer,
		initOffer:_initOffer,
		initPage:_initPage,
		chooseArea : _chooseArea
	};
})();
/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("order", "prepare");
/**
 * 订单准备
 */
order.prepare = (function(){
	//三个入口选择
	var _tabChange= function(){
		$("#order_quick_nav li").each(function(){$(this).off("click").on("click",function(event){
			OrderInfo.actionFlag= 1;
			var url=$(this).attr("url");
			var forTab = $(this).attr("for");
			_commonTab(url,forTab);
			event.stopPropagation();});});
		$("#order_nav li").each(function(){$(this).off("click").on("click",function(event){
			OrderInfo.actionFlag= 1;
			var url=$(this).attr("url");
			var forTab = $(this).attr("for");
			_commonTab(url,forTab);
			event.stopPropagation();});});
		//异地业务隐藏三个入口
		var diffPlaceFlag = $("#diffPlaceFlag").val();
		if (diffPlaceFlag == "diff") {
			$("#order_prepare").hide();
			$("#nothreelinks").show();
		}
		
		//如果有资源ID，则跳转到终端详情
		var mktResCd$ = $("#mktResHidId").attr("mktResCd");
		var offerSpecId$ = $("#offerSpecHidId").val();
		if (mktResCd$ && mktResCd$.length > 0) {
			var url = contextPath+"/mktRes/terminal/prepare";
			var param={};
			var response = $.callServiceAsHtmlGet(url,param);
			var content$=$("#order_tab_panel_content");
			content$.html(response.data);
			mktRes.terminal.selectTerminal($("#mktResHidId"));
			$("#order_prepare").hide();
			order.prepare.step(1);//显示"第一步：订单准备"
			_showOrderTitle("", "购手机", true);
			content$.show();
		}else if (offerSpecId$ && offerSpecId$.length > 0) {
			var url = contextPath+"/order/prodoffer/prepare";
			var param={"prodOfferId":offerSpecId$};
			var response = $.callServiceAsHtmlGet(url,param);
			var content$=$("#order_tab_panel_content");
			content$.html(response.data);
			$("#order_prepare").hide();
			order.prepare.step(1);//显示"第一步：订单准备"
			_showOrderTitle("", "办套餐", true);
			content$.show();
			order.service.initSpec();
			order.prodOffer.init();
		}
	};
	var _commonTab=function(url,forTab){
		var param={};
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				if(order.cust.orderBtnflag=="1"){
					order.cust.btnQueryCustProdMore();
				};
				main.home.hideMainIco();
				$("#order_prepare").hide();
				$("#order_fill_content").hide();
				$("#orderedprod").hide();
				order.prepare.step(1);//显示"第一步：订单准备"
				var content$=$("#order_tab_panel_content");
				content$.html(response.data).show();
				if (forTab == "order_tab_panel_terminal") {
					_showOrderTitle("", "购手机", true);
					order.service.releaseFlag = 1;
					mktRes.terminal.queryApConfig();
					mktRes.terminal.initInParam('', '', '', '', '');
					mktRes.terminal.btnQueryTerminal(1);
				}else if(forTab == "order_tab_panel_phonenumber"){
					_showOrderTitle("", "选号码", true);
					order.service.releaseFlag = 1;
					order.phoneNumber.initPhonenumber();
				}else if(forTab == "order_tab_panel_offer"){
					_showOrderTitle("", "办套餐", true);
					//判断是否直接进入新装套餐入口
					if(order.service.releaseFlag==0){
						order.service.releaseFlag = 2;
					}
					order.service.initSpec();
					order.prodOffer.init();
					order.service.searchPack();
					order.phoneNumber.resetBoProdAn();
				}
			}
		});	
	};
	//弹出选择号码窗口
	//subPage入口:终端入口，号码入口，订单填写入口:terminal\offer\number
	//subnum订单序号：O1、O2区分暂存单允许多个订单的情况
	//subFlag选号类型：新装主卡选号、新装副卡选号 Y1、Y2
	var _phoneNumDialog=function(subPage,subFlag,subnum){
		var position=["8%"];
		if ($.browser.mozilla) {
			position=["8%"];
		}
		ec.form.dialog.createDialog({
				"id":"-phonenumber",
				"width":970,
				"height":440,
				"position":position,
				"initCallBack":function(dialogForm,dialog){
					var param={"subPage":subPage};
					var url=contextPath+"/mktRes/phonenumber/prepare";
					$.callServiceAsHtmlGet(url,param,{
						"before":function(){
							$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
						},
						"always":function(){
							$.unecOverlay();
						},
						"done" : function(response){
							if(!response){
								 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
							}
							if(response.code != 0) {
								$.alert("提示","查询失败,稍后重试");
								return;
							}
							order.phoneNumber.dialogForm=dialogForm;
							order.phoneNumber.dialog=dialog;
							var content$=$("#phonenumberContent");
							content$.html(response.data);
							$("#subPage").val(subPage);
							$("#subFlag").val(subFlag);
							$("#subnum").val(subnum);
							order.phoneNumber.initPhonenumber();
						}
					});	
				 },
				"submitCallBack":function(dialogForm,dialog){}
		});
	};
	/**
	 * uim卡号释放
	 */
	var _releaseUIM=function(subPage,subflag,subnum){
		if(_checkIsable(subflag,subnum)){
			return;
		}
		var cardNo=$.trim($("#uim_"+subnum).val());
		if(cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return;
		}
		param = {"oldInstCode":cardNo,"phoneNum":""};
		var url = contextPath+"/mktRes/uim/checkUim";
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>UIM卡释放中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},"done" : function(response){
				if (response.code == 0) {
					$.alert("提示","UIM卡释放成功!");
					$("#uim_btn_"+subnum).attr('unable','false');
					$("#uim_btn_"+subnum).removeClass("disablepurchase").addClass("purchase");
					$("#uimrelease_btn_"+subnum).attr('unable','true');
					$("#uimrelease_btn_"+subnum).removeClass("purchase").addClass("disablepurchase");
					$("#uim_"+subnum).removeAttr("disabled");
					$("#uim_"+subnum).val("");
					//alert(JSON.stringify(OrderInfo.boProd2Tds));
					//alert(JSON.stringify(OrderInfo.bo2Coupons));
					for(var i=0;i<OrderInfo.boProd2Tds.length;i++){
						if(OrderInfo.boProd2Tds[i].prodId==subnum){
							OrderInfo.boProd2Tds.splice(i,1);
						}
					}
					for(var i=0;i<OrderInfo.bo2Coupons.length;i++){
						if(OrderInfo.bo2Coupons[i].prodId==subnum){
							var coupons=OrderInfo.bo2Coupons[i].coupons;
							if(coupons.length>0){//节点的物品里面已经有数据
								for(var j=0;j<coupons.length;j++){
									if(coupons[j].couponInstanceNumber==cardNo){//之前已经有对应的UIM的物品，替换掉
										OrderInfo.bo2Coupons[i].coupons.splice(j,1);
										sonExist=true;
										break;
									}
								}
							}else{
								OrderInfo.bo2Coupons[i].coupons=[];
							}
						}
					}
					//alert(JSON.stringify(OrderInfo.boProd2Tds));
					//alert(JSON.stringify(OrderInfo.bo2Coupons));
				}else{
					if(typeof response == undefined){
						$.alert("提示","UIM卡释放请求调用失败，可能原因服务停止或者数据解析异常");
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						var msg="";
						if(response.data!=undefined&&response.data.msg!=undefined){
							msg=response.data.msg;
						}else{
							msg="卡号["+cardNo+"]释放失败";
						}
						$.alert("提示","UIM卡释放失败，可能原因:"+msg);
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
		
   var _checkIsable=function(subflag,subnum){
	   if(subflag=="0"){
		   if($("#uim_btn_"+subnum).attr('unable')=="true"){
			   return true;
		   }else{
			   return false;
		   }
	   }else if(subflag=="1"){
		   if($("#uimrelease_btn_"+subnum).attr('unable')=="true"){
			   return true;
		   }else{
			   return false;
		   }  
	   }else{
		   return true;
	   }
   };
	/**
	 * uim卡号校验
	 */
	var _checkUIM=function(subPage,subflag,subnum){
		if(_checkIsable(subflag,subnum)){
			return;
		}
		var cardNo=$.trim($("#uim_"+subnum).val());
		if(cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return;
		}
		for(var i=0;i<OrderInfo.boProd2Tds.length;i++){
			if(OrderInfo.boProd2Tds[i].terminalCode==cardNo){
				$.alert("提示","UIM卡已经被预占,请输入其它号码!");
				return;
			}
		}
		var hisCardNo="";
		//var hisCouponId="";
		for(var i=0;i<OrderInfo.boProd2Tds.length;i++){
			if(OrderInfo.boProd2Tds[i].prodId==subnum){
				hisCardNo=OrderInfo.boProd2Tds[i].terminalCode;
				//hisCouponId=OrderInfo.boProd2Tds[i].couponId;
				break;
			}
		}
		var phoneNumber="";
		for(var i=0;i<OrderInfo.boProdAns.length;i++){
			if(OrderInfo.boProdAns[i].prodId==subnum){
				phoneNumber=OrderInfo.boProdAns[i].accessNumber;
				break;
			}
		}
		var prodId = -1;
		var offerId = -1;
		if(OrderInfo.actionFlag==3){ //可选包变更使用	
			var prodInfo = order.prodModify.choosedProdInfo;
			phoneNumber = prodInfo.accNbr;
			prodId = prodInfo.prodInstId;
			offerId = prodInfo.prodOfferInstId;
		}
		if(phoneNumber==''){
			$.alert("提示","校验UIM卡前请先选号!");
			return;
		}
		var param = {"instCode":cardNo,"phoneNum":phoneNumber};
		if(hisCardNo!=""){
			param = {"oldInstCode":hisCardNo,"phoneNum":phoneNumber,"newInstCode":cardNo};
		}
		var url = contextPath+"/mktRes/uim/checkUim";
		$.callServiceAsJson(url,param,{
			"before":function(){
				$.ecOverlay("<strong>UIM卡校验中,请稍等...</strong>");
			},"always":function(){
				$.unecOverlay();
			},"done" : function(response){
				if (response.code == 0) {
					$.alert("提示","UIM卡校验成功!");
					if(subPage=='offer'){
						$("#uim_btn_"+subnum).attr('unable','true');
						$("#uim_btn_"+subnum).removeClass("purchase").addClass("disablepurchase");
						$("#uimrelease_btn_"+subnum).attr('unable','false');
						$("#uimrelease_btn_"+subnum).removeClass("disablepurchase").addClass("purchase");
						$("#uim_"+subnum).attr("disabled",true);
						//$("#uimrelease_btn_"+subnum).off("click").on("click",function(){order.prepare.releaseUIM('offer','1',subnum);});
					}
					//$("#uimCheck_"+subnum).removeClass("order_check_error").addClass("order_check");
					var isExists=false;
					for(var i=0;i<OrderInfo.boProd2Tds.length;i++){
						if(OrderInfo.boProd2Tds[i].prodId==subnum){
							OrderInfo.boProd2Tds[i].terminalCode=cardNo;
							OrderInfo.boProd2Tds[i].couponId=response.data.baseInfo.mktResId;
							isExists=true;
							break;
						}
					}
					if(!isExists){
						var param={
							prodId : subnum, //从填单页面头部div获取
							anTypeCd : "",  //UIM号类型
							deviceModelId : 0, //设备类型ID
							maintainTypeCd : "1",  //默认1
							ownerTypeCd : "",  //待确定
							state : "", //动作
							terminalCode : cardNo, //卡号
							terminalDevId : "", //卡设备实例ID
							terminalDevSpecId : "", //卡设备类型ID
							couponId : response.data.baseInfo.mktResId, //物品ID
							anId : 0 //号码ID
						};
						OrderInfo.boProd2Tds.push(param);
					}
					isExists=false;
					var v_couponNum = response.data.baseInfo.qty ;
					if(v_couponNum==undefined||v_couponNum==null){
						v_couponNum = 1 ;
					}
					var coupon = {
						couponUsageTypeCd : "3", //物品使用类型
						inOutTypeId : "1",  //出入库类型
						inOutReasonId : 0, //出入库原因
						saleId : 1, //销售类型
						couponId :response.data.baseInfo.mktResId, //物品ID
						couponinfoStatusCd : "A", //物品处理状态
						chargeItemCd : CONST.ACCT_ITEM_TYPE.UIM_CHARGE_ITEM_CD, //物品费用项类型
						couponNum : v_couponNum, //物品数量
						storeId : response.data.baseInfo.mktResStoreId, //仓库ID
						storeName : "1", //仓库名称
						agentId : 1, //供应商ID
						apCharge : 0, //物品价格
						couponInstanceNumber : response.data.baseInfo.mktResInstCode, //物品实例编码
						ruleId : "", //物品规则ID
						partyId : OrderInfo.cust.custId, //客户ID
						prodId :prodId, //产品ID
						offerId : offerId, //销售品实例ID
						state : "ADD", //动作
						relaSeq : "" //关联序列	
					};
					for(var i=0;i<OrderInfo.bo2Coupons.length;i++){
						var sonExist=false;
						if(OrderInfo.bo2Coupons[i].prodId==subnum){
							var coupons=OrderInfo.bo2Coupons[i].coupons;
							if(coupons.length>0){//节点的物品里面已经有数据
								for(var j=0;j<coupons.length;j++){
									if(coupons[j].couponInstanceNumber==hisCardNo){//之前已经有对应的UIM的物品，替换掉
										OrderInfo.bo2Coupons[i].coupons[j]=coupon;
										sonExist=true;
										break;
									}
								}
							}else{
								OrderInfo.bo2Coupons[i].coupons.push(coupon);
							}
							if(!sonExist){//没有对应的UIM卡
								OrderInfo.bo2Coupons[i].coupons.push(coupon);
							}
							isExists=true;
							break;
						}
					}
					if(!isExists){
						var coupons2=[];
						coupons2.push(coupon);
						var bo2Coupon = {
							prodId : subnum, //从填单页面头部div获取
							coupons : coupons2
						};
						OrderInfo.bo2Coupons.push(bo2Coupon);
					}
				}else{
					if(typeof response == undefined){
						$.alert("提示","UIM卡校验请求调用失败，可能原因服务停止或者数据解析异常");
					}else if (response.code == -2) {
						$.alertM(response.data);
					}else{
						var msg="";
						if(response.data!=undefined&&response.data.msg!=undefined){
							msg=response.data.msg;
						}else{
							msg="卡号["+cardNo+"]预占失败";
						}
						$.alert("提示","UIM卡校验失败，可能原因:"+msg);
					}
//					$("#uimCheck_"+subnum).removeClass("order_check").addClass("order_check_error");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});	
	};
	
	var _step = function(num) {
		//如果没传参数，默认显示第一步
		if (num == undefined || !num) {
			num = 1;
		}
		$.each($("div[id^=step]"),function(i,stepDiv){
			if (num == (i+1)) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	};
	
	var _hideStep = function() {
		$("div[id^=step]").hide();
	};
	
	var _showOrderTitle = function(action, titleName, backwardFlag){
//		var cont$ = $("<span id='orderTitleSpan'></span>").html(action);
//		var back$ = '';
//		if (backwardFlag == true) {
//			back$ = $("<a href='javascript:void(0);'><span style='float: right;'>返回</span></a>");
//			back$.addClass("numberSearch back3").show().click(function(){order.prepare.backToInit();});
//		}
//		$("#orderTitleDiv h2").html('').append(cont$).append(titleName).append(back$).parent().show();
	};
	var _hideOrderTitle = function() {
		$("#orderTitleDiv").hide();
	};

	var _backToInit=function(){
		//若是购机或选号入口，在退出业务办理时将释放主卡预占的号码（过滤身份证预占的号码）
		var boProdAn = order.service.boProdAn;
		if(boProdAn.accessNumber && !boProdAn.idFlag){
			var param = {
					numType : 1,
					numValue : boProdAn.accessNumber
			};
			$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param, {
				"done" : function(){}
			});
			order.service.boProdAn = {};
		}
		order.phoneNumber.resetBoProdAn();
		_hideOrderTitle();
		$("#step1").hide();
		$("#main_div").hide();
		$("#order_prepare").show();
		$("#order_tab_panel_content").html('');
		if(OrderInfo.actionFlag == 2){
			$("#orderedprod").show();
			$("#arroworder").removeClass();
			$("#arroworder").addClass("arrowup");
		}
	};
	return {
		tabChange:_tabChange,
		phoneNumDialog:_phoneNumDialog,
		checkUIM:_checkUIM,
		step : _step,
		hideStep : _hideStep,
		showOrderTitle : _showOrderTitle,
		hideOrderTitle : _hideOrderTitle,
		backToInit:_backToInit,
		releaseUIM:_releaseUIM
	};
})();
//初始化
$(function(){
	order.prepare.tabChange();
});
/**
 * 套餐入口
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("order", "prodOffer");
/**
 * 套餐入口
 */
order.prodOffer = (function($){
	
	var _init = function(){
		order.prodOffer.queryApConfig();
		
	};
	
	
	//查询平台配置信息
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"PROD_AND_OFFER"};
		var qryConfigUrl=contextPath+"/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	
	var call_back_success_queryApConfig=function(response){
		var OFFER_PRICE ;
		var OFFER_INFLUX ;
		var OFFER_INVOICE ;
		
		var OFFER_PRICE_html   = "<a href='javascript:void(0);' class='selected' val='' >不限</a>";
		var OFFER_INFLUX_html  = "<a href='javascript:void(0);' class='selected' val='' >不限</a>";
		var OFFER_INVOICE_html = "<a href='javascript:void(0);' class='selected' val='' >不限</a>";
		if(response.data){
			var dataLength=response.data.length;
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].OFFER_PRICE){
					OFFER_PRICE = response.data[i].OFFER_PRICE ;
					for(var j=0;j<OFFER_PRICE.length;j++){
						var rowKey=OFFER_PRICE[j].COLUMN_VALUE;
						var rowVal=OFFER_PRICE[j].COLUMN_VALUE_NAME;
						OFFER_PRICE_html=OFFER_PRICE_html+"<a href='javascript:void(0);' val='"+rowKey+"'>"+rowVal+"</a>";
					}
					$("#price_basic").html(OFFER_PRICE_html);
					$("#price_basic a").each(function(){
						$(this).off("click").on("click",function(event){
							$("#price_basic a").each(function(){$(this).removeClass("selected");});
							$(this).addClass("selected");
							event.stopPropagation();
							order.service.searchPack(1);
						});
					});
				}else if(response.data[i].OFFER_INFLUX){
					OFFER_INFLUX = response.data[i].OFFER_INFLUX ;
					for(var j=0;j<OFFER_INFLUX.length;j++){
						var rowKey=OFFER_INFLUX[j].COLUMN_VALUE;
						var rowVal=OFFER_INFLUX[j].COLUMN_VALUE_NAME;
						OFFER_INFLUX_html=OFFER_INFLUX_html+"<a href='javascript:void(0);' val='"+rowKey+"'>"+rowVal+"</a>";
					}
					$("#influx_basic").html(OFFER_INFLUX_html);
					$("#influx_basic a").each(function(){
						$(this).off("click").on("click",function(event){
							$("#influx_basic a").each(function(){$(this).removeClass("selected");});
							$(this).addClass("selected");
							event.stopPropagation();
							order.service.searchPack(1);
						});
					});
				}else if(response.data[i].OFFER_INVOICE){
					OFFER_INVOICE = response.data[i].OFFER_INVOICE ;
					for(var j=0;j<OFFER_INVOICE.length;j++){
						var rowKey=OFFER_INVOICE[j].COLUMN_VALUE;
						var rowVal=OFFER_INVOICE[j].COLUMN_VALUE_NAME;
						OFFER_INVOICE_html=OFFER_INVOICE_html+"<a href='javascript:void(0);' val='"+rowKey+"'>"+rowVal+"</a>";
					}
					$("#invoice_basic").html(OFFER_INVOICE_html);
					$("#invoice_basic a").each(function(){
						$(this).off("click").on("click",function(event){
							$("#invoice_basic a").each(function(){$(this).removeClass("selected");});
							$(this).addClass("selected");
							event.stopPropagation();
							order.service.searchPack(1);
						});
					});
				}
			}
		}
	};
	
	return {
		init:_init,
		queryApConfig:_queryApConfig
	};
})(jQuery);

//初始化
$(function(){
	
});

CommonUtils.regNamespace("order", "refund");
/**
 *订单查询.
 */
order.refund = (function(){
	var submit_success=false;
	var _olId=0;
	var _olNbr=0;
	var money=0;
	var _areaId=OrderInfo.staff.areaId;
	var _soNbr=0;
	var _queryOrderList = function(pageIndex){
		if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
			$.alert("提示","请选择'地区'再查询");
			return ;
		}
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {"areaId":$("#p_areaId").val(),
				"startDt":$("#p_startDt").val().replace(/-/g,''),
				"endDt":$("#p_endDt").val().replace(/-/g,''),
				"qryNumber":$("#p_qryNumber").val(),
				"channelId":$("#p_channelId").val(),
				"busiStatusCd":"301200",
				"olNbr":$("#p_olNbr").val(),
				"refundFlag":"refund",
				"olStatusCd":"",
				"qryBusiOrder":1,
				nowPage:curPage,
				pageSize:10
		};
		
		$.callServiceAsHtmlGet(contextPath+"/report/cartList",param,{
			"before":function(){
				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>数据加载失败，请稍后重试</strong></div>';
				}
				var content$=$("#order_list");
				content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	var _editMoney=function(obj,val,str){
		var cash=$.trim($(obj).val());
		if(cash==''){
			$(obj).val('0');
			order.calcharge.reflashTotal();
		}else{
			if(str=="old"){
				var check = true ;
				if(!/^[0-9]+([.]\d{1,2})?$/.test(cash)){//金额非数字，恢复金额
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		check = false ;
				}else{
					if(cash<0){//退费金额 不能填负值
						$.alert("提示","退费金额不能为负值！");
						check = false ;
					}else{
						var amount=$("#realhidden_"+val).val();
						if(cash*1>amount*1){//要退100，不能退120
							$.alert("提示","退费金额不能高于实收金额！");
							check = false ;
						}
					}
				}
				if(check){
					var amount=$("#realhidden_"+val).val();
					if(cash!=0){
		  				$("#chargeModifyReasonCd_"+val).show();
					}else{
						$("#chargeModifyReasonCd_"+val).hide();
						$("#remark_"+val).hide();
					}
					//$("#realAmount_"+val).val(amount-cash);
					order.calcharge.reflashTotal();
				}else{
					if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}
			}
			
		}
	};
	var _setGlobeMoney=function(obj){
		money=$.trim($(obj).val());
	};
	var _delItems=function(obj,val,str){
		if(str=='old'){
			var fee=$("#realhidden_"+val).val();
			if(($("#realAmount_"+val).val())*100==0){
				$("#realAmount_"+val).val(fee);
				$("#backAmount_"+val).val('0.00');
			}else{
				$("#realAmount_"+val).val('0.00');
				$("#backAmount_"+val).val(fee);
			}	
			var back=($("#backAmount_"+val).val())*1;
  			if(back>0){
  				$("#chargeModifyReasonCd_"+val).show();	
			}else{
				$("#chargeModifyReasonCd_"+val).hide();
				$("#remark_"+val).hide();
			}
		}else{
			$(obj).parent().parent().remove();
		}
		order.calcharge.reflashTotal();
	};
	var _queryChargeItems=function(olId,olNbr,areaId){
		_olId=olId;
		_areaId=areaId;
		_olNbr=olNbr;
		_soNbr = UUID.getDataId();
		OrderInfo.order.soNbr=_soNbr;
		var param={
			"olId" : olId,
			"areaId" : areaId,
			"olNbr":olNbr,
			"soNbr":_soNbr
		};
		var url=contextPath+"/order/refund/chargeList";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","数据加载失败，请稍后重试");
					return;
				}
				submit_success=false;
				$("#d_refund_order").hide();
				var content$=$("#order_charge");
				content$.html(response.data).show();
				OrderInfo.actionFlag=15;//补退费
				order.calcharge.reflashTotal();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	var _conBtns=function(){
		var real=($('#realmoney').val())*1;
		$("#orderCancel").off("click").on("click",function(event){
			$("#d_refund_order").show();
			$("#order_charge").hide();
		});
		var flag=false;
		var back=0;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var aa=($("#backAmount_"+val).val())*1;
				var itemType=$("#acctItemId_"+val).val();
				var real=$("#realAmount_"+val).val();
				if(itemType=="-1"&&real*1>0){
					flag=true;
				}
				back=back+aa;
			}
		});
		if(back>0){
			flag=true;
		}
		if(!submit_success){
			if(real>0){
				$("#printInvoiceA").removeClass("btna_g").addClass("btna_o");
				$("#printInvoiceA").off("click").on("click",function(event){
					var param={
						"soNbr":OrderInfo.order.soNbr,
						"billType" : 0,
						"olId" : _olId,
						"areaId" : OrderInfo.staff.areaId,
						"acctItemIds":[]
					};
					OrderInfo.orderResult.olId=_olId;
					OrderInfo.orderResult.olNbr=_olNbr;
					common.print.prepareInvoiceInfo(param);
				});	
			}else{
				$("#printInvoiceA").removeClass("btna_o").addClass("btna_g");
				$("#printInvoiceA").off("click");
			}
			if(flag){
				$("#toComplate").removeClass("btna_g").addClass("btna_o");
				$("#toComplate").off("click").on("click",function(event){
					_tochargeSubmit();
				});
			}else{
				$("#toComplate").removeClass("btna_o").addClass("btna_g");
				$("#toComplate").off("click");
			}
		}else{
			if(real>0){
				$("#printInvoiceA").removeClass("btna_g").addClass("btna_o");
			}else{
				$("#printInvoiceA").removeClass("btna_o").addClass("btna_g");
				$("#printInvoiceA").off("click");
			}
			$("#toComplate").removeClass("btna_o").addClass("btna_g");
			$("#toComplate").off("click");
		}
	};
	var _submitParam=function(){
		var remakrFlag = true ;
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var chargeModifyReasonCd=$("#chargeModifyReasonCd_"+val).val();
				if(chargeModifyReasonCd=="1"){
					if($("#remark_"+val).val()==undefined||$("#remark_"+val).val()==null||$("#remark_"+val).val()==''){
						remakrFlag = false ;
					}
				}
			}
		});
		if(!remakrFlag){
			$.alert("提示信息","请填写修改原因");
			return false ;
		}
		_chargeItems=[];
		$("#calTab tbody tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
				val=val.substr(5,val.length);
				var acctItemId=$("#acctItemId_"+val).val();
				var realmoney=($("#realAmount_"+val).val())*100+'';
				var amount=$("#feeAmount_"+val).val();
				var backAmount=$("#backAmount_"+val).val();
				var feeAmount="";
				if(amount!=undefined&&amount!=''){
					feeAmount=amount+'';
				}else{
					feeAmount=realmoney;
				}
				
				
				if(OrderInfo.actionFlag==15){
					feeAmount = $("#feeAmount_"+val).val()*1;
					realmoney = $("#realAmount_"+val).val()*100-$("#backAmount_"+val).val()*100;
				}

				var operType="";
				if(acctItemId=="-1"||(backAmount*1>0)){
					var acctItemTypeId=$("#acctItemTypeId_"+val).val();
					var objId=$("#objId_"+val).val();
					var objType=$("#objType_"+val).val();
					var boId=$("#boId_"+val).val();
					var payMethodCd=$("#payMethodCd_"+val).val();
					var objInstId=$("#objInstId_"+val).val();
					var prodId=$("#prodId_"+val).val();
					var chargeModifyReasonCd=$("#chargeModifyReasonCd_"+val).val();
					var remark=$('#chargeModifyReasonCd_'+val).find("option:selected").text();
					if(chargeModifyReasonCd==1){
						remark = $("#remark_"+val).val();
					}
					if(acctItemId=="-1"){
						operType="1";
					}else if(backAmount*1>0){
						operType="-1";
					}
					var param={"realAmount":realmoney,
							"feeAmount":feeAmount,
							"acctItemTypeId":acctItemTypeId,
							"objId":objId,
							"objType":objType,
							"acctItemId":acctItemId,
							"boId":boId,
							"prodId":prodId,
							"objInstId":objInstId,
							"payMethodCd":payMethodCd,
							"posSeriaNbr":"-1",
							"chargeModifyReasonCd":chargeModifyReasonCd,
							"remark":remark,
							"operType":operType
					};
					_chargeItems.push(param);
				}
			}
		});
		return true ;
	};
	var _tochargeSubmit=function(){
		if(submit_success){
			$.alert("提示","订单已经激活,不能重复操作!");
			return;
		}
		if(!_submitParam()){
			return ;
		}
		var params={
			"olId":_olId,
			"areaId" : _areaId,
			"chargeItems":_chargeItems
		};
		var url=contextPath+"/order/refund/addOrReturnSubmit";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				var msg="";
				if (response.code == 0) {
					submit_success=true;
					msg="提交成功";	
					$("#toComplate").removeClass("btna_o").addClass("btna_g");
					$("#toComplate").off("click");	
					var html='<table class="contract_list rule">';
					html+='<thead><tr> <td colspan="2">受理结果</td></tr></thead></table>';
					html+='<div id="rules_div">';
					html+='<table width="100%" border="0" cellspacing="0" cellpadding="0">';
					html+='<tr>';
					html+='<td align="right"><i class="rule_icon"></i></td>';
					html+='<td><span class="rule_font">'+msg+'</span></td>';
					html+='</tr>';
					html+='</table>';
					html+='</div>';
					easyDialog.open({
						container : 'successTip_dialog'
					});
					$("#successTipContent").html('');
					$("#successTipContent").html(html);
					$("#successTipclose").off("click").on("click",function(event){easyDialog.close();$("#d_refund_order").show();$("#order_charge").hide();});
					//order.cust.orderBtnflag="";
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					if(response.data!=undefined){
						$.alert("提示",response.data);
					}else{
						$.alert("提示","费用信息提交失败!");
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
		
	};
	return {
		queryOrderList:_queryOrderList,
		queryChargeItems:_queryChargeItems,
		conBtns:_conBtns,
		editMoney:_editMoney,
		setGlobeMoney:_setGlobeMoney,
		delItems:_delItems
	};
})();
/**
 * 打印方法-回执、发票、押金票据
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("common", "print");
/**
 * 打印方法-回执、发票、押金票据
 */
common.print = (function($){
	
	var _preVoucher=function(olId, chargeItems){
		if (CONST.getAppDesc() == 0) {
			var trList = $("#tab_orderList tr[olId=" + olId + "]");
			var areaId = '';
			var instList = [];
			for (var i=0; i < trList.length; i++) {
				var tr = trList[i];
				var instId = $(tr).attr("objInstId");
				if (instId == undefined || instId == '') {
					$.alert("提示", "objInstId为空，请核查接口返回的数据！");
					return ;
				}
				var accessNumber = $(tr).attr("accessNumber");
				if (accessNumber == undefined || accessNumber == '') {
					$.alert("提示", "accessNumber为空，请核查接口返回的数据！");
					return ;
				}
			}
			for (var i=0; i < trList.length; i++) {
				var tr = trList[i];
				var instId = $(tr).attr("objInstId");
				var accessNumber = $(tr).attr("accessNumber");
				if ($.inArray(instId, instList) >= 0) {
					continue;
				}
				areaId = $(tr).attr("areaId");
				OrderInfo.orderResult.olNbr = $(tr).attr("olNbr");
				var custId = '';
				OrderInfo.order.soNbr = UUID.getDataId();
				var param = {
						areaId : areaId,
						acctNbr : accessNumber,
						custId : custId,
						soNbr : OrderInfo.order.soNbr ,
						//queryType : "1,2,3,4,5",
						instId : instId,
						type : "2"
				};
				var loadInstFlag = query.offer.invokeLoadInst(param);
				if (!loadInstFlag) {
					return;
				}
				instList.push(instId);
			}
		} else {
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		OrderInfo.orderResult.olId = olId;
		
		var voucherInfo = {
			"olId":OrderInfo.orderResult.olId,
			"soNbr": OrderInfo.order.soNbr,
			"busiType":"1",
			"chargeItems":chargeItems
		};
		common.print.printVoucher(voucherInfo);
	};
	var _printVoucher=function(voucherInfo){
		$("#voucherForm").remove();
		/**test**/
		/*var _chargeItems=[];
		var param={"realAmount":"10000",
				"feeAmount":"10000",
				"acctItemTypeId":"1",
				"objId":"2",
				"objType":"1",
				"acctItemId":"2",
				"boId":"121231",
				"prodId":"32443",
				"objInstId":"456456",
				"payMethodCd":"1",
				"posSeriaNbr":"-1",
				"chargeModifyReasonCd":"1",
				"remark":"",
				"boActionType":"1"
		};
		_chargeItems.push(param);
		var voucherInfo = {
			"olId":'370000009610',
			"soNbr":'37201402210000009629',
			"busiType":"1",
			"chargeItems":_chargeItems
		};*/
		if(_getCookie('_session_pad_flag')=='1'){
			var arr=new Array(3);
			if(ec.util.browser.versions.android){
				arr[0]='print/voucher';				
			}else{
				arr[0]='print/iosVoucher';				
			}
			arr[1]='voucherInfo';
			arr[2]=JSON.stringify(voucherInfo);
			MyPlugin.printShow(arr,
                function(result) {
                },
                function(error) {
                }
			);
		}else{
		    $("<form>", {
		    	id: "voucherForm",
		    	style: "display:none;",
				target: "_blank",
				method: "POST",
				action: contextPath + "/print/voucher"
		    }).append($("<input>", {
		    	id : "voucherInfo",
		    	name : "voucherInfo",
		    	type: "hidden",
		    	value: JSON.stringify(voucherInfo)
		    })).appendTo("body").submit();
		}
	};
	
	var _preInvoice=function(olId, printFlag){
		if (CONST.getAppDesc() == 0) {
			var trList = $("#tab_orderList tr[olId=" + olId + "]");
			var areaId = '';
			var instList = [];
			for (var i=0; i < trList.length; i++) {
				var tr = trList[i];
				var instId = $(tr).attr("objInstId");
				if (instId == undefined || instId == '') {
					$.alert("提示", "objInstId为空，请核查接口返回的数据！");
					return ;
				}
				var accessNumber = $(tr).attr("accessNumber");
				if (accessNumber == undefined || accessNumber == '') {
					$.alert("提示", "accessNumber为空，请核查接口返回的数据！");
					return ;
				}
			}
			for (var i=0; i < trList.length; i++) {
				var tr = trList[i];
				var instId = $(tr).attr("objInstId");
				var accessNumber = $(tr).attr("accessNumber");
				if ($.inArray(instId, instList) >= 0) {
					continue;
				}
				areaId = $(tr).attr("areaId");
				OrderInfo.orderResult.olNbr = $(tr).attr("olNbr");
				var custId = '';
				OrderInfo.order.soNbr = UUID.getDataId();
				var param = {
						areaId : areaId,
						acctNbr : accessNumber,
						custId : custId,
						soNbr : OrderInfo.order.soNbr ,
						//queryType : "1,2,3,4,5",
						instId : instId,
						type : "2"
				};
				var loadInstFlag = query.offer.invokeLoadInst(param);
				if (!loadInstFlag) {
					return;
				}
				instList.push(instId);
			}
		} else {
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		OrderInfo.orderResult.olId = olId;
		var param = {
			"olId" : OrderInfo.orderResult.olId,
			"soNbr": OrderInfo.order.soNbr,
			"billType" : 0,
			"printFlag": printFlag,
			"areaId" : areaId,
			"acctItemIds":[]
		};
		common.print.prepareInvoiceInfo(param);
	};
	var _closePrintDialog=function(){
		if(common.print.dialogForm!=undefined&&common.print.dialog!=undefined){
			common.print.dialogForm.close(common.print.dialog);
		}
	};
	/**
	 * 填写打印发票信息
	 */
	var _prepareInvoiceInfo=function(param){
		
		//判断是否一般纳税人，如果是的话提示
		if (OrderInfo.cust.norTaxPayer == "Y") {
			$.alert("提示", "客户为一般纳税人，请到省份CRM系统打印专用增值税发票！");
			return;
		}
		
		ec.form.dialog.createDialog({
			"id":"-invoice-items",
			"width":580,
//			"height":450,
			"zIndex":1100,
			"initCallBack":function(dialogForm,dialog){
				var url=contextPath+"/print/getInvoiceItems";
				$.callServiceAsJson(url,param,{
					"before":function(){
//						$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
					},
					"always":function(){
//						$.unecOverlay();
					},
					"done" : function(response){
						common.print.dialogForm=dialogForm;
						common.print.dialog=dialog;
						$("#invoiceItemsConCancel").off("click").on("click",function(event){
							common.print.closePrintDialog();
						});
						if(!response){
							$.alert("提示","<br/>查询失败，请稍后重试");
							common.print.closePrintDialog();
							return;
						}
						if(response.code == -2) {
							$.alertM(response.data);
							common.print.closePrintDialog();
							return;
						}
						if(response.code != 0) {
							$.alert("提示","<br/>查询失败，请稍后重试");
							common.print.closePrintDialog();
							return;
						}
						if(response.data.resultCode != '0') {
							$.alert("提示", response.data.resultMsg);
							common.print.closePrintDialog();
							return;
						}
						//判断是否有可打印费用项
						if (response.data.chargeItems == undefined || response.data.chargeItems.length==0) {
							$.alert("提示", "没有可打印的费用项");
							common.print.closePrintDialog();
							return;
						}
						
						//查询可打印费用项成功，接下去查询模板组
						if (CONST.getAppDesc() == 0) {
							var tempUrl = contextPath+"/print/getInvoiceTemplates";
							var tempParam = {
								'areaId' : OrderInfo.staff.areaId
							};
							var tempResp = $.callServiceAsJson(tempUrl, tempParam, {});
							if (tempResp.code == -2) {
								$.alertM(tempResp.data);
								common.print.closePrintDialog();
								return;
							} else if (tempResp.code != 0) {
								$.alert("提示",ec.util.defaultStr(tempResp.data, "获取打印模板出错"));
								common.print.closePrintDialog();
								return;
							} else {
								var tempData = tempResp.data;
								if (tempData.resultCode != 'POR-0000') {
									$.alert("提示",ec.util.defaultStr(tempData.resultMsg, "获取打印模板异常"));
									common.print.closePrintDialog();
									return;
								}
								if (tempData.length == 0) {
									$.alert("提示", "没有获取到可用的打印模板");
									common.print.closePrintDialog();
									return;
								}
								var tempHtml = "";
								var tempList = tempData.tempList;
								if (typeof tempList != undefined && tempList.length > 0) {
									tempHtml += "<option selected='selected' value="+tempList[0].templateId+">"+tempList[0].templateName+"</option>";
									for(var i = 1; i < tempList.length; i++){
										var template = tempList[i];
										tempHtml += "<option value="+template.templateId+">"+template.templateName+"</option>";
									}
								}
								$("#tempListSel").html(tempHtml);
							}
						} else {
							$("#tempListSel").parent().parent().hide();
						}
						
						
						//判断billType，对于票据隐藏发票代码和发票号码输入框，并调整显示文字
						if (param.billType == 1) {
							$("#dialog-form-invoice-items dl[billType='1']").hide();
							$("#titleDt").html("票据抬头：");
							$("#tempDt").html("票据模板：");
						}
						//显示接入号
						var selHtml = "";
						var prodInfo = response.data.prodInfo;
						if (prodInfo != undefined && prodInfo.length > 0) {
							selHtml+="<option selected='selected' value="+prodInfo[0].accessNumber+">"+prodInfo[0].accessNumber+"</option>";
							for(var i=1;i<prodInfo.length;i++){
								var prod = prodInfo[i];
								selHtml+="<option value="+prod.accessNumber+">"+prod.accessNumber+"</option>";
							}
							$("#acceNbrSel").data("prodInfo", prodInfo);
						}
						$("#acceNbrSel").html(selHtml);
						//判断是否是重打还是补打
						common.print.oldInvoiceFlag = '0';
						if (_checkCanReOrAdd(response.data.invoiceInfos, param.printFlag)) {
							common.print.closePrintDialog();
							return;
						}
						
						//显示费用项
						var contHtml = "";
						contHtml+="<div id='invoiceContDiv' class='plan_second_list cashier_tr'>";
						contHtml+="  <table class='contract_list'>";
						contHtml+="  <thead>";
						contHtml+="    <tr>";
						contHtml+="      <td>是否打印</td><td>费用名称</td><td>费用(元)</td><td>税金(元)</td><td>付费方式</td>";
						contHtml+="    </tr>";
						contHtml+="  </thead>";
						contHtml+="  <tbody>";
						var chargeItems = response.data.chargeItems;
						for(var i=0;i<chargeItems.length;i++){
							var item = chargeItems[i];
							contHtml+="    <tr acctItemId="+item.acctItemId+" acctItemTypeId="+item.acctItemTypeId+" ";
							contHtml+="        acctItemTypeName='"+item.acctItemTypeName+"' boActionType='"+item.boActionType+"' ";
							contHtml+="        boActionType='"+item.boActionType+"' boId="+item.boId+" feeAmount="+item.feeAmount+" ";
							contHtml+="        invoiceId="+item.invoiceId+" objId="+item.objId+" objType="+item.objType+" ";
							contHtml+="        payMethodCd="+item.payMethodCd+" payMethodName="+item.payMethodName+" ";
							contHtml+="        realAmount="+item.realAmount + " ";
							contHtml+="        tax="+item.tax+" taxRate="+item.taxRate+" >";
							if (_checkChargeItem(item)) {
								contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' checked='checked'/></td>";
							} else {
								contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' disabled='disabled'/></td>";
							}
							contHtml+="      <td>"+item.acctItemTypeName+"</td>";
							contHtml+="      <td>"+(item.realAmount / 100).toFixed(2)+"</td>";
							contHtml+="      <td>"+(item.tax / 100).toFixed(2)+"</td>";
							contHtml+="      <td>"+item.payMethodName+"</td>";
							contHtml+="    </tr>";
						}
						contHtml+="  </tbody>";
						contHtml+="  </table>";
						contHtml+="</div>";
						$("#invoiceItemsContDiv").html(contHtml);
						$("#ec-dialog-form-content").css("height", "auto");
						$("#invoiceItemsConfirm").off("click").on("click",function(event){
							if (common.print.oldInvoiceFlag != '0') {
								$.alert("信息", "存在未作废发票，请先作废发票");
								common.print.closePrintDialog();
								return;
							}
							_saveInvoiceInfo(param, response.data);
						});
						
					}
				});	
			 },
			"submitCallBack":function(dialogForm,dialog){
				
			},
			"closeCallBack":function(dialogForm,dialog){
//				var content$=$("#printItemsContDiv");
//				content$.html('');
			}
		});
	};
	var _initPrintInfo=function(param) {
		var url=contextPath+"/print/getInvoiceItems";
		var queryResult = $.callServiceAsJson(url,param);
		if(!queryResult){
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return;
		}
		if(queryResult.code == -2) {
			$.alertM(queryResult.data);
			return;
		}
		if(queryResult.code != 0) {
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return;
		}
		if(queryResult.data.resultCode != '0') {
			$.alert("提示", queryResult.data.resultMsg);
			return;
		}
		//判断是否有可打印费用项
		if (queryResult.data.chargeItems == undefined || queryResult.data.chargeItems.length==0) {
			$.alert("提示", "没有可打印的费用项");
			return;
		}
		var result = _prepareInitParam(param, queryResult.data);
		var invoiceInfos = result.invoiceInfos;
		
		var params={"invoiceInfos" : invoiceInfos};
		var response = _invokeSavingMethod(params, param.printFlag);
		if (response == false) {
			return false;
		}
		invoiceInfos = _setInvoiceId(invoiceInfos, response.data.invoiceIds, '0');
		return invoiceInfos;
	};
	
	var _getPrintState=function(printFlag) {
		if (printFlag == '-1') {
			return '初始打印';
		} else if (printFlag == '0') {
			return '正常打印';
		} else if (printFlag == '1') {
			return '重打';
		} else if (printFlag == '2') {
			return '补打';
		} else {
			return '未知操作';
		}
	};
	//判断是否能重打或补打  true - 限制 , false - 允许打印
	var _checkCanReOrAdd=function(invoiceInfos, printFlag) {
		if (invoiceInfos != undefined && invoiceInfos instanceof Array && invoiceInfos.length > 0) {
			for (var i=0; i < invoiceInfos.length; i++) {
				if (invoiceInfos[i].printFlag=='-1') {
					//未打印时，允许正常打印和补打
					if (printFlag == '0' || printFlag == '2') {
						
					} else {
						$.alert("信息", "此购物车对应的发票未打印过，请到发票补打页面。");
						return true;
					}
				} else if (invoiceInfos[i].printFlag == '0') {
					//正常打印状态，允许重打
					if (printFlag == '1') {
						//弹出作废发票提示
						_invalidInvoice(invoiceInfos, printFlag);
					} else {
						$.alert("信息", "此购物车对应的发票正常打印过，只允许重打。");
						return true;
					}
				} else if (invoiceInfos[i].printFlag == '1' || invoiceInfos[i].printFlag == '2') {
					//重打或补打状态，允许重打
					if (printFlag == '1') {
						//弹出作废发票提示
						_invalidInvoice(invoiceInfos, printFlag);
					} else {
						$.alert("信息", "此购物车对应的发票已打印过，只允许重打。");
						return true;
					}
				} else {
					//默认不允许
					$.alert("信息", "发票信息中打印标识值不规范");
					return true;
				}
			}
			//走出循环，代表允许打印
			return false;
		} else {
			//没有发票信息，允许正常打印
			if (printFlag == '0') {
				return false;
			} else {
				$.alert("信息", "此购物车没有对应的发票信息，只允许正常打印");
				return true;
			}
		}
	};
	
	//判断是否已打印过发票，true-有旧发票需要作废,false-没有旧发票
	var _invalidInvoice=function(invoiceInfos, printFlag) {
		if (invoiceInfos != undefined && invoiceInfos instanceof Array && invoiceInfos.length > 0) {
			//筛选invoiceId，展示需要作废的发票代码和发票号码
			$('#invalidInvoiceDiv').remove();
			var html = '';
			html += '<div class="easyDialogdiv" style="width:481px;height:300px;" id="invalidInvoiceDiv">';
			html += '  <div class="easyDialogclose" id="invalidInvoiceClose"></div>';
			html += '  <h5 class="s_title">存在未作废发票，请先作废发票</h5>';
			html += '  <div class="form-content" id="infoDiv">';
			html += '  </div>';
			html += '  <div align="center" style="margin: 20px auto;">';
			html += '    <a id="invalidInvoiceConfirm" class="btna_o" href="javascript:void(0)"><span >确认</span></a>';
			html += '    <a id="invalidInvoiceCancel" class="btna_o" style="margin-left:20px;" href="javascript:void(0)"><span>取消</span></a>';
			html += '  </div>'; 
			html += '</div>';
			$('body').append(html);
			
			var infoHtml = '';
			var invoiceIds = [];
			for (var i=0; i < invoiceInfos.length; i++) {
				var info = invoiceInfos[i];
				if ($.inArray(info.invoiceId, invoiceIds) >= 0) {
					
				} else {
					infoHtml += '<div class="marginAndFont">发票代码：' + info.invoiceNbr + '; 发票号码：' + info.invoiceNum + '</div><br>';
					invoiceIds.push(info.invoiceId);
				}
			}
			if (invoiceIds.length > 0) {
				//需要作废发票
				common.print.oldInvoiceFlag = '1';
				$("#infoDiv").html(infoHtml);
				easyDialog.open({
					container : 'invalidInvoiceDiv'
				});
				$("#invalidInvoiceConfirm").off("click").on("click", function() {
					//调用作废发票接口
					var param = {
						"invoiceIds" : invoiceIds,
						"areaId" : OrderInfo.staff.areaId
					};
					var response = $.callServiceAsJson(contextPath+"/print/invalidInvoices",param);
					if (response.code == 0) {
						var data = response.data;
						if (data.resultCode == 0) {
							$.alert("信息", "作废发票成功");
							common.print.oldInvoiceFlag = '0';
						} else {
							if (data.resultMsg != undefined && data.resultMsg != '') {
								$.alert("信息", data.resultMsg);
							} else {
								$.alert("信息", "作废发票失败");
							}
						}
					} else if (response.code == -2) {
						$.alertM(response.data);
						return;
					} else {
						$.alert("信息", "作废发票失败");
						return;
					}
					easyDialog.close();
				});
				$("#invalidInvoiceCancel").off("click").on("click", function() {
					easyDialog.close();
				});
			}
			return false;
		} else {
			return false;
		}
	};
	//校验费用项能否被打印，true-可以打印；false-不可打印
	var _checkChargeItem=function(item){
		var payMethodCd = item.payMethodCd;
		if (payMethodCd == CONST.PAYMETHOD_CD.ZHANG_WU_DAI_SHOU) {
			return false;
		}
		return true;
	};
	
	//校验发票抬头，发票代码，发票号码等
	var _chkInput=function(param){
		try {
			//发票的需要校验代码和号码
			if (param.billType != 1) {
				if ($("#invoiceNbrInp").val() == "") {
					$.alert("提示","请输入发票代码");
					return true;
				}
				//原17位发票代码，现12位
				if (!/^\d{0,12}$/.test($("#invoiceNbrInp").val())) {
					$.alert("提示","请输入正确的发票代码");
					return true;
				}
				if ($("#invoiceNumInp").val() == "") {
					$.alert("提示","请输入发票号码");
					return true;
				}
				//8位发票号码
				if (!/^\d{0,12}$/.test($("#invoiceNumInp").val())) {
					$.alert("提示","请输入正确的发票号码");
					return true;
				}
			}
			if ($("#invoiceTitleInp").val() == "") {
				$.alert("提示","请输入发票抬头");
				return true;
			}
			
			if($("#invoiceContDiv tbody input:checked").length < 1) {
				$.alert("提示","请选择要打印的费用项");
				return true;
			}
		} catch (e) {
			return true;
		}
		return false;
	};
	var _prepareInitParam=function(param, queryResult) {
		var invoiceInfos =[];
		var invoiceInfo = {
			"acctItemIds": [],
			"instanceType": 2,//根据过滤取值，优先为产品或销售品，2-产品，7-销售品
			"instanceId": 0,//根据过滤取值，优先为产品或销售品
			"invoiceType": "58B", //58A:电子发票；58B:纸币发票
			"staffId": OrderInfo.staff.staffId,
			"amount": 0,
			"realPay": 0,
			"tax": 0,//可为空，暂为0
			"invoiceNbr": 0,//发票代码，前台人工输入，票据时可为空
			"invoiceNum": "0",//发票号码，前台人工输入，票据时可为空
			"custOrderId": OrderInfo.orderResult.olId,
			"custSoNumber": OrderInfo.orderResult.olNbr,
			"custId": OrderInfo.cust.custId,
			"commonRegionId": OrderInfo.staff.areaId,
			"channelId": OrderInfo.staff.channelId,
			"bssOrgId": OrderInfo.staff.orgId,
			"acctNbr": 0,//接入号码，根据5.12接口返回展示，前台选择
			"paymethod": 100000,
			"busiName": "具体业务说明",//可为空
			"rmbUpper": "人民币大写",//固定此值
			"accountUpper": "零圆整",
			"account": 0,
			"billType": param.billType,//票据类型：0发票，1收据
			"printFlag": param.printFlag,//打印标记：0正常打印，1重打票据，2补打票据，-1未打印
			"invoiceId": 0
		};
		
		var instanceFlag = false;
		var sumFeeAmount = 0;
		var sumRealAmount = 0;
		var sumTax = 0;
		var items = [];
		var payMethodName = "";
		var chargeItems = queryResult.chargeItems;
		for(var i=0;i<chargeItems.length;i++){
			var item = chargeItems[i];
			invoiceInfo.acctItemIds.push({"acctItemId": item.acctItemId});
			if (item.objType == "2") {
				invoiceInfo.instanceType = item.objType;
				invoiceInfo.instanceId = item.objId;
				invoiceInfo.paymethod = item.payMethodCd;
				instanceFlag = true;
			} else if (!instanceFlag && item.objType == "7") {
				invoiceInfo.instanceType =item.objType;
				invoiceInfo.instanceId = item.objId;
				invoiceInfo.paymethod = item.payMethodCd;
			}
			//计算金额
			sumFeeAmount += parseInt(item.feeAmount);
			sumRealAmount += parseInt(item.realAmount);
			sumTax += parseInt(item.tax);
			payMethodName = item.payMethodName;
		}
		
		//设置金额
		invoiceInfo.amount = sumFeeAmount;
		invoiceInfo.realPay = sumRealAmount;
		invoiceInfo.tax = sumTax;
		invoiceInfo.account = sumRealAmount;
		invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
		//取实例ID和类型
		invoiceInfo.invoiceNbr = 0;
		invoiceInfo.invoiceNum = "0";
		//取接入号
		var prodInfo = queryResult.prodInfo;
		if (prodInfo != undefined && prodInfo.length > 0) {
			invoiceInfo.acctNbr = prodInfo[0].accessNumber;
		}
		
		invoiceInfos.push(invoiceInfo);
		var result = {
			"payMethodName" : payMethodName,
			"items" : items,
			"invoiceInfos" : invoiceInfos
		};
		return result;
	};
	var _addParam=function(param, queryResult) {
		var invoiceInfos = [];
		var invoiceInfo = {
			"acctItemIds": [],
			"instanceType": 2,//根据过滤取值，优先为产品或销售品，2-产品，7-销售品
			"instanceId": 0,//根据过滤取值，优先为产品或销售品
			"invoiceType": "58B", //58A:电子发票；58B:纸币发票
			"staffId": OrderInfo.staff.staffId,
			"amount": 0,
			"realPay": 0,
			"tax": 0,//可为空，暂为0
			"invoiceNbr": 0,//发票代码，前台人工输入，票据时可为空
			"invoiceNum": "0",//发票号码，前台人工输入，票据时可为空
			"custOrderId": OrderInfo.orderResult.olId,
			"custSoNumber": OrderInfo.orderResult.olNbr,
			"custId": OrderInfo.cust.custId,
			"commonRegionId": OrderInfo.staff.areaId,
			"channelId": OrderInfo.staff.channelId,
			"bssOrgId": OrderInfo.staff.orgId,
			"acctNbr": 0,//接入号码，根据5.12接口返回展示，前台选择
			"paymethod": 100000,
			"busiName": "具体业务说明",//可为空
			"rmbUpper": "人民币大写",//固定此值
			"accountUpper": "零圆整",
			"account": 0,
			"billType": param.billType,//票据类型：0发票，1收据
			"printFlag": param.printFlag,//打印标记：0正常打印，1重打票据，2补打票据，-1未打印
			"invoiceId": 0
		};
		//设置invoiceId
		invoiceInfo.invoiceId = queryResult.invoiceInfos[0].invoiceId;
		
		var instanceFlag = false;
		var sumFeeAmount = 0;
		var sumRealAmount = 0;
		var sumTax = 0;
		var items = [];
		var payMethodName = "";
		//获取费用项和接入号的关系
		var rela = _getAcceNbrBoIdRela(queryResult);
		invoiceInfo.acctItemIds = [];
		$("#invoiceContDiv tbody input:checked").parent().parent().each(function(){
			//设置账单项ID
			invoiceInfo.acctItemIds.push({"acctItemId": $(this).attr("acctItemId")});
			//设置实例id和类型，优先为产品或销售品，2-产品，7-销售品
			if ($(this).attr("objType") == "2") {
				invoiceInfo.instanceType = $(this).attr("objType");
				invoiceInfo.instanceId = $(this).attr("objId");
				invoiceInfo.paymethod = $(this).attr("payMethodCd");
				instanceFlag = true;
			} else if (!instanceFlag && $(this).attr("objType") == "7") {
				invoiceInfo.instanceType = $(this).attr("objType");
				invoiceInfo.instanceId = $(this).attr("objId");
				invoiceInfo.paymethod = $(this).attr("payMethodCd");
			}
			//计算金额
			sumFeeAmount += parseInt($(this).attr("feeAmount"));
			sumRealAmount += parseInt($(this).attr("realAmount"));
			sumTax += parseInt($(this).attr("tax"));
			var accessNumber = '';
			var boId = $(this).attr("boId");
			for (var i=0; i < rela.length; i++) {
				if (boId == rela[i].boId) {
					accessNumber = rela[i].accessNumber;
				}
			}
			
			items.push({
				"itemName" : $(this).attr("acctItemTypeName"),
				"charge" : parseInt($(this).attr("realAmount")),
				"tax" : parseInt($(this).attr("tax")),
				"accessNumber" : accessNumber
			});
			payMethodName = $(this).attr("payMethodName");
		});
		if(OrderInfo.actionFlag==11){
			invoiceInfo.printFlag = 0;
		}
		
		//设置金额
		invoiceInfo.amount = sumFeeAmount;
		invoiceInfo.realPay = sumRealAmount;
		invoiceInfo.tax = sumTax;
		invoiceInfo.account = sumRealAmount;
		invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
		//取实例ID和类型
		invoiceInfo.invoiceNbr = $("#invoiceNbrInp").val();
		invoiceInfo.invoiceNum = "" + $("#invoiceNumInp").val();
		//取接入号
		invoiceInfo.acctNbr = $("#acceNbrSel option:selected").val();
		
		invoiceInfos.push(invoiceInfo);
		var result = {
			"payMethodName" : payMethodName,
			"items" : items,
			"invoiceInfos" : invoiceInfos
		};
		return result;
	};
	var _getAcceNbrBoIdRela=function(queryResult) {
		var rela = [];
		var chargeItems = queryResult.chargeItems;
		var prodInfo = queryResult.prodInfo;
		for (var i=0; i < chargeItems.length; i++) {
			var boId = chargeItems[i].boId;
			for(var j=0; j < prodInfo.length; j++) {
				var accessNumber = prodInfo[j].accessNumber;
				var busiOrders = prodInfo[j].busiOrders;
				for (var k=0; k < busiOrders.length; k++) {
					if (busiOrders[k].boId == boId) {
						var tmp = {
							"boId" : boId,
							"accessNumber" : accessNumber
						};
						rela.push(tmp);
					}
				}
			}
		}
		return rela;
	};
	
	var _saveInvoiceInfo=function(param, queryResult){
		
		if (_chkInput(param)) {
			return;
		}
		
		var result = _addParam(param, queryResult);
		var invoiceInfos = result.invoiceInfos;
		
		var params={"invoiceInfos" : invoiceInfos};
		var response = _invokeSavingMethod(params, param.printFlag);
		if (response == false) {
			return;
		}
		
		//调用受理后台结束，开始调用生成PDF
		var invoiceParam = {
			"partyName" : $("#invoiceTitleInp").val(),
			"templateId" : $("#tempListSel :selected").val(),
			"prodInfo" : $("#acceNbrSel").data("prodInfo"),
			"items" : result.items,
			"payMethod" : result.payMethodName,
			"invoiceInfos" : invoiceInfos
		};
		_printInvoice(invoiceParam);
		//最终关闭窗口
		common.print.closePrintDialog();
		return;
	};
	var _invokeSavingMethod=function(params, printFlag){
		$.ecOverlay("<strong>正在提交中,请稍等会儿....</strong>");
		var response = $.callServiceAsJson(contextPath+"/print/saveInvoiceInfo",params);
		$.unecOverlay();
		if(response.code == -2) {
			$.alertM(response.data);
			return false;
		} else if(response.code != 0 || response.data.resultCode != "0") {
			$.alert("提示", _getPrintState(printFlag) + "调用集团发票打印处理接口失败，请稍后重试");
			return false;
		}
		return response;
	};
	var _setInvoiceId=function(invoiceInfos, invoiceIds, printFlag) {
		for(var i=0;i<invoiceInfos.length;i++){
			invoiceInfos[i].invoiceId = invoiceIds[i];
			invoiceInfos[i].printFlag = printFlag;
		}
		return invoiceInfos;
	};
	
	var _getCookie = function(name){
		var cookievalue = "";
		var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		if(arr != null) {
			cookievalue = unescape(arr[2]);
		}
		return cookievalue;
	};
	var _printInvoice=function(invoiceParam){
		$("#invoiceForm").remove();
		if(_getCookie('_session_pad_flag')=='1'){
			var arr=new Array(3);
			if(ec.util.browser.versions.android){
				arr[0]='print/invoice';
			}else{
				arr[0]='print/iosInvoice';
			}
			arr[1]='invoiceParam';
			arr[2]=encodeURI(JSON.stringify(invoiceParam));
			MyPlugin.printShow(arr,
                function(result) {
                },
                function(error) {
                }
			);
		}else{
		    $("<form>", {
		    	id: "invoiceForm",
		    	style: "display:none;",
		    	target: "_blank",
		    	method: "POST",
		    	action: contextPath + "/print/invoice"
		    }).append($("<input>", {
		    	id : "invoiceParam",
		    	name : "invoiceParam",
		    	type: "hidden",
		    	value: encodeURI(JSON.stringify(invoiceParam))
		    })).appendTo("body").submit();
		}
	};
	return {
		preVoucher:_preVoucher,
		printVoucher:_printVoucher,
		preInvoice:_preInvoice,
		initPrintInfo:_initPrintInfo,
		closePrintDialog : _closePrintDialog,
		prepareInvoiceInfo:_prepareInvoiceInfo,
		saveInvoiceInfo:_saveInvoiceInfo,
		printInvoice : _printInvoice
	};
})(jQuery);

//初始化
$(function(){
	
});
/**
 * 补换卡
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("prod","changeUim");

prod.changeUim = (function() {
	
	//初始化
	var _init = function(){
		var prod = order.prodModify.choosedProdInfo;
		//客户级规则校验入参
		var param = {
			"areaId" : OrderInfo.staff.areaId, //地区ID
			"custId" : OrderInfo.cust.custId, //客户ID
			"staffId" : OrderInfo.staff.staffId,
			"channelId" : OrderInfo.staff.channelId,
			"boInfos":[{
				"boActionTypeCd": CONST.BO_ACTION_TYPE.CHANGE_CARD,//动作类型
			    "instId" : prod.prodInstId, //实例ID
			    "specId" : CONST.PROD_SPEC.CDMA //产品（销售品）规格ID
			}]
		};
		var area = $("#DiffPlaceFlag").val();
		var areaAtionType = "";
		var opeName = "";
		if(area=="diff"){
			areaAtionType = CONST.BO_ACTION_TYPE.DIFF_AREA_CHANGE_CARD;
			opeName = "异地补换卡";
			var areaid = prod.areaId;
			if(areaid==undefined || areaid==''){
				$.alert("提示","营业后台未返回产品归属地区，无法办理异地补换卡业务！");
				return false;
			}
		}else{
			areaAtionType = CONST.BO_ACTION_TYPE.CHANGE_CARD;
			opeName = "补换卡";
		}
		var callParam = {
			prodId : prod.prodInstId 	
		};
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,areaAtionType,22,opeName,"");
		rule.rule.prepare(param,'prod.changeUim.initFillPage',callParam);
	};
	
	//初始化填单页面
	var _initFillPage = function(param){
		if(!prod.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			return false;
		}
		var prodInfo = order.prodModify.choosedProdInfo;
		$.callServiceAsHtml(contextPath+"/prod/changeCard", param, {
			"before":function(){
			},
			"done" : function(response){
				$("#order_fill_content").html(response.data).show();
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				$("#nothreelinks").css("display","none");
				$(".ordercon").show();
				$(".ordertabcon").show();
				$(".h2_title").append(prodInfo.productName+"-"+prodInfo.accNbr);
				order.prepare.step(1);
				$("#orderedprod").hide();
				$("#order_prepare").hide();
			},
			"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//订单提交
	var _submit = function(){
		var prod = order.prodModify.choosedProdInfo;
		var param = {
			prodId : prod.prodInstId,	
			boActionTypeCd : OrderInfo.boActionTypeCd,
			remark : $("#orderRemark").val()
		};
		var busiOrder = [];
		busiOrder.push(OrderInfo.getProdBusiOrder(param));
		SoOrder.submitOrder(busiOrder);
	};
	
	return {
		init				: _init,
		initFillPage		: _initFillPage,
		submit 				: _submit
	};
})();
CommonUtils.regNamespace("prod", "telnum");

var phoneNum_level="";
prod.telnum = (function(){
	var _boProdAn = {
			accessNumber : "", //接入号
			org_level:"",//原始的号码等级，为了页面展示增加的字段
			level : "", //等级
			anId : "", //接入号ID
			anTypeCd : "",//号码类型
			areaId:"",
			memberRoleCd:""
		};
		var _resetBoProdAn = function(){
			_boProdAn = {
					accessNumber : "", //接入号
					org_level:"",//原始的号码等级，为了页面展示增加的字段
					level : "", //等级
					anId : "", //接入号ID
					anTypeCd : "",//号码类型
					areaId:"",
					memberRoleCd:""
			};
		};
		var idcode=[];
		//请求地址
		var url = contextPath+"/mktRes/telnumcg/list";
		var phoneNumberVal="";
		//按钮查询
		var _btnQueryPhoneNumber=function(param){
			//收集参数
			param = _buildInParam(param);
			$.callServiceAsHtmlGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(!response||response.code != 0){
						 response.data='查询失败,稍后重试';
					}
					var content$=$("#order_phonenumber .phone_warp");
					content$.html(response.data);
					$("#btnSwitchNbr").off("click").on("click",function(){prod.telnum.btnQueryPhoneNumber({});});
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","服务忙，请稍后再试！");
				}
			});	
		};
		var _btnIBydentityQuery=function(){
			var idcode=$.trim($("#idCode").val());
			if(idcode==''){
				$.alert("提示","请先输入身份证号码!");
				return;
			}
			if(!_idcardCheck(idcode)){
				$.alert("提示","身份证号码输入有误!");
				return;
			}
			var areaId=$("#p_phone_areaId").val();
			var param={"identityId":idcode,"areaId":areaId};
			$.callServiceAsHtmlGet(contextPath+"/mktRes/telnumcg/listByIdentity",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(!response||response.code != 0){
						 response.data='查询失败,稍后重试';
					}else if(response.code ==-2){
						return;
					}
					var content$=$("#order_phonenumber .phone_warp");
					content$.html(response.data);
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","服务忙，请稍后再试！");
				}
			});	
		};
		//选择身份证预占的号码
		var _btnToOffer=function(obj){
			phoneNumberVal = $(obj).attr("numberVal"); 
			var memberRoleCd=CONST.MEMBER_ROLE_CD.MAIN_CARD;
			//选号类型：新装主卡选号、新装副卡选号 Y1、Y2
			var subFlag=$("#subFlag").val();
			if(subFlag=='Y2'){
				memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
			}
			//订单序号：O1、O2区分暂存单允许多个订单的情况
			var subnum=$("#subnum").val();
			//入口终端入口，号码入口，订单填写入口:terminal\offer\number
			var subPage=$("#subPage").val();
			//号码的预存话费
			var preStoreFare=phoneNumberVal.split("_")[1];
			//保底消费
			var pnPrice=phoneNumberVal.split("_")[2];
			if(order.service.offerprice!=''){
				var minMonthFare=parseInt(pnPrice);
				//套餐月基本费用
				var packageMonthFare=parseInt(order.service.offerprice);
				if(packageMonthFare<minMonthFare){
					$.alert("提示","对不起,此号码不能被选购.(原因:套餐月基本费用必须大于号码月保底消费)");
					return;
				}
			}
			//正在被预占的号码
			var phoneNumber=phoneNumberVal.split("_")[0];
			var anTypeCd=phoneNumberVal.split("_")[3];
			var plevel=phoneNumberVal.split("_")[5];
			var phoneNumId=phoneNumberVal.split("_")[6];
			var areaId=$("#chooseAreaId").val();
			if(areaId==null||areaId==""){
				areaId=OrderInfo.staff.areaId;
			}
			if(phoneNumber){
				var oldrelease=false;
				var oldPhoneNumber="";
				var oldAnTypeCd="";
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
				if(oldPhoneNumber!=""){
					oldrelease=true;
					for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
						if(idcode[i]==oldPhoneNumber){
							oldrelease=false;
							break;
						}
					}
					if(oldrelease){
						var purchaseUrl=contextPath+"/mktRes/phonenumber/purchase";
						var params={"oldPhoneNumber":oldPhoneNumber,"oldAnTypeCd":oldAnTypeCd};
						$.callServiceAsJson(purchaseUrl, params, {});
					}
				}
				idcode.push(phoneNumber);
				
				_boProdAn.accessNumber=phoneNumber;
				_boProdAn.anTypeCd=anTypeCd;
				_boProdAn.level=response.data.phoneLevelId;
				_boProdAn.org_level=response.data.phoneLevelId;
				_boProdAn.anId=response.data.phoneNumId;
				_boProdAn.areaId=areaId;
				_boProdAn.memberRoleCd=memberRoleCd;
				order.service.boProdAn = _boProdAn;
				//去掉其他号码选中效果
				$(obj).siblings().each(function(){
					$(this).removeClass("select");
				});
				//添加号码选中样式
				$(obj).addClass("select");
				
			} else {
				$.alert("提示","号码格式不正确!");
			}
		};
		var _initOffer=function(subnum){
			if(_boProdAn.accessNumber!=''){
				$("#nbr_btn_"+subnum).removeClass("selectBoxTwo");
				$("#nbr_btn_"+subnum).addClass("selectBoxTwoOn");
				$("#nbr_btn_"+subnum).html(_boProdAn.accessNumber+"<u></u>");
			}
			if(_boProdAn.accessNumber!=''){
				var isExists=false;
				if(OrderInfo.boProdAns.length>0){
					for(var i=0;i<OrderInfo.boProdAns.length;i++){
						if(OrderInfo.boProdAns[i].prodId==subnum){
							OrderInfo.boProdAns[i].accessNumber=_boProdAn.accessNumber;
							OrderInfo.boProdAns[i].anTypeCd=_boProdAn.anTypeCd;
							OrderInfo.boProdAns[i].anId=_boProdAn.anId;
							OrderInfo.boProdAns[i].pnLevelId=_boProdAn.level;
							OrderInfo.boProdAns[i].areaId=_boProdAn.areaId;
							OrderInfo.boProdAns[i].memberRoleCd=_boProdAn.memberRoleCd;
							if(_boProdAn.idFlag){
								OrderInfo.boProdAns[i].idFlag=_boProdAn.idFlag;
							}
							isExists=true;
							break;
						}
					}
				}
				if(!isExists){
					var param={
						prodId : subnum, //从填单页面头部div获取
						accessNumber : _boProdAn.accessNumber, //接入号
						anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
						anId : _boProdAn.anId, //接入号ID
						pnLevelId:_boProdAn.level,
						anTypeCd : _boProdAn.anTypeCd, //号码类型
						state : "ADD", //动作	,新装默认ADD
						areaId:_boProdAn.areaId,
						memberRoleCd:_boProdAn.memberRoleCd
					};
					if(_boProdAn.idFlag){
						param.idFlag=_boProdAn.idFlag;
					}
					OrderInfo.boProdAns.push(param);
				}
				if(subnum=='-1'){
					OrderInfo.boCustInfos.telNumber=_boProdAn.accessNumber;
				}
			}
		};
		var _qryOfferInfoByPhoneNumFee=function(){
			var param={};
			$.callServiceAsHtmlGet(contextPath+"/order/prodoffer/prepare",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(!response||response.code != 0){
						 response.data='查询失败,稍后重试';
					}
					var content$=$("#order_tab_panel_content");
					content$.html(response.data);
					order.service.initSpec();
					order.prodOffer.init();
					order.service.searchPack();
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","服务忙，请稍后再试！");
				}
			});
		};
		//号码预占
		var _btnPurchase=function(obj){
			phoneNumberVal = $(obj).attr("numberVal"); 
			var memberRoleCd=CONST.MEMBER_ROLE_CD.MAIN_CARD;
			//选号类型：新装主卡选号、新装副卡选号 Y1、Y2
			var subFlag=$("#subFlag").val();
			if(subFlag=='Y2'){
				memberRoleCd=CONST.MEMBER_ROLE_CD.VICE_CARD;
			}
			//号码的预存话费
			var preStoreFare=phoneNumberVal.split("_")[1];
			//保底消费
			var pnPrice=phoneNumberVal.split("_")[2];
			var areaId=$("#chooseAreaId").val();
			if(areaId==null||areaId==""){
				areaId=OrderInfo.staff.areaId;
			}
			if(order.service.offerprice!=''){
				var minMonthFare=parseInt(pnPrice);
				//套餐月基本费用
				var packageMonthFare=parseInt(order.service.offerprice);
				if(packageMonthFare<minMonthFare){
					$.alert("提示","对不起,此号码不能被选购.(原因:套餐月基本费用必须大于号码月保底消费)");
					return;
				}
			}
			//正在被预占的号码
			var phoneNumber=phoneNumberVal.split("_")[0];
			var anTypeCd=phoneNumberVal.split("_")[3];
			var plevel=phoneNumberVal.split("_")[5];
			if(phoneNumber){
				var params={"phoneNumber":phoneNumber,"actionType":"E","anTypeCd":anTypeCd};
				var oldrelease=false;
				var oldPhoneNumber="";
				var oldAnTypeCd="";
				oldPhoneNumber=_boProdAn.accessNumber;
				oldAnTypeCd=_boProdAn.anTypeCd;
				if(oldPhoneNumber==phoneNumber){
					$.alert("提示","号码已经被预占,请选择其它号码!");
					return;
				}else{
					_boProdAn={};
				}
				if(oldPhoneNumber!=""){
					oldrelease=true;
					for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
						if(idcode[i]==oldPhoneNumber){
							oldrelease=false;
							break;
						}
					}
					if(oldrelease){
						params={"newPhoneNumber":phoneNumber,"oldPhoneNumber":oldPhoneNumber,"newAnTypeCd":anTypeCd,"oldAnTypeCd":oldAnTypeCd};
					}
				}
				var purchaseUrl=contextPath+"/mktRes/phonenumber/purchase";
				$.callServiceAsJson(purchaseUrl, params, {
					"before":function(){
						$.ecOverlay("<strong>正在预占号码,请稍等会儿....</strong>");
					},"always":function(){
						$.unecOverlay();
					},	
					"done" : function(response){
						if (response.code == 0) {
							_boProdAn.accessNumber=phoneNumber;
							_boProdAn.anTypeCd=anTypeCd;
							_boProdAn.level=response.data.phoneLevelId;
							_boProdAn.org_level=response.data.phoneLevelId;
							_boProdAn.anId=response.data.phoneNumId;
							_boProdAn.areaId=areaId;
							_boProdAn.memberRoleCd=memberRoleCd;
							order.service.boProdAn = _boProdAn;
							//去掉其他号码选中效果
							$(obj).siblings().each(function(){
								$(this).removeClass("select");
								var numberval=$(this).attr("numberval").split("_");
								var tx="<span style='padding-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元</span><span style='padding-left:10px;'>保底<span color='orange'>"+numberval[2]+"</span>元</span>";
								$(this).find("div").html(tx);
							});
							//添加号码选中样式
							$(obj).addClass("select");
						}else if (response.code == -2) {
							$.alertM(response.data);
						}else{
							$.alert("提示","号码预占失败!");
						}
					},
					fail:function(response){
						$.unecOverlay();
						$.alert("提示","服务忙，请稍后再试！");
					}
				});
			} else {
				$.alert("提示","号码格式不正确!");
			}
		};
		
		//链接查询
		var _linkQueryPhoneNumber = function(loc,selected){
			_exchangeSelected(loc,selected);
			_btnQueryPhoneNumber();
		};
		//构造查询条件 
		var _buildInParam = function(param){
			var areaId=$("#p_phone_areaId").val();
			var pnHead = $("#pnHead").find("a.selected").attr("val");
			var pnEnd =$.trim($("#pnEnd").val());
			if(pnEnd=='最后四位'){
				pnEnd='';
			}
			var phoneNum=$.trim($("#phoneNum").val());
			if(phoneNum=="任意四位"){
				phoneNum='';
			}
			var pnCharacterId;
			var Greater  = "";
			var Less  ="";
			var preStore$=$("#preStore").find("a.selected");
			if(preStore$.length>0){
				Greater= preStore$.attr("Greater");
				Less=preStore$.attr("Less");
			}
			if($("#pnCharacterId_basic").css("display") != "none"){
				pnCharacterId = $("#pnCharacterId_basic a.selected").attr("val");
			}
			if($("#pnCharacterId_all").css("display") != "none"){
				pnCharacterId = $("#pnCharacterId_all a.selected").attr("val");
			}
			pnCharacterId = ec.util.defaultStr(pnCharacterId);
			return {"pnHead":pnHead,"pnEnd":pnEnd,"pnCharacterId":pnCharacterId,"maxPrePrice":Less,
				"minPrePrice":Greater,"pnLevelId":'',"pageSize":"20","phoneNum":phoneNum,"areaId":areaId
			};
		};
		//点击前定位
		var _exchangeSelected = function(loc,selected){
			$(loc).each(function(){$(this).removeClass("selected");});
			$(selected).addClass("selected");
		};
		//分页查询
		var _getIndexPagePhoneNumber=function(pageIndex){
			var param={pageIndex:pageIndex};
			prod.telnum.btnQueryPhoneNumber(param);
		};
		var _idcardCheck=function(num){
			num = num.toUpperCase();
			if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num)))//是否15位数字或者17位数字加一位数字或字母X
			{
				return false;
			}
			var len, re;
			len = num.length;
			if(len == 15) {
				re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
				var arrSplit = num.match(re);
				var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
				var bGoodDay;
				bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
				if(!bGoodDay) {
					return false;
				} else {
					var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
					var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
					var nTemp = 0, i;
					num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
					for( i = 0; i < 17; i++) {
						nTemp += num.substr(i, 1) * arrInt[i];
					}
					num += arrCh[nTemp % 11];
					return num;
				}
			}
			if(len == 18) {
				re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
				var arrSplit = num.match(re);
				var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
				var bGoodDay;
				bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
				if(!bGoodDay) {
					return false;
				} else {
					var valnum;
					var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
					var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
					var nTemp = 0, i;
					for( i = 0; i < 17; i++) {
						nTemp += num.substr(i, 1) * arrInt[i];
					}
					valnum = arrCh[nTemp % 11];
					if(valnum != num.substr(17, 1)) {
						return false;
					}
					return num;
				}
			}
			return false;
		};
		//查询平台配置信息
		var _queryApConfig=function(){
			var configParam={"CONFIG_PARAM_TYPE":"TERMINAL_AND_PHONENUMBER"};
			var qryConfigUrl=contextPath+"/order/queryApConf";
			$.callServiceAsJsonGet(qryConfigUrl, configParam,{
				"done" : call_back_success_queryApConfig
			});
		};
		var call_back_success_queryApConfig=function(response){
			var PHONE_NUMBER_PRESTORE;
			var PHONE_NUMBER_SEGMENT;
			var PHONE_NUMBER_FEATURE;
			var phoneNumberPreStoreHtml="<a href=\"javascript:void(0);\" class=\"selected\" Greater=\"\" Less=\"\">不限</a>";
			var phoneNumStartHtml="<a href=\"javascript:void(0);\" class=\"selected\" val=\"\">不限</a>";
			var phoneNumberFeatureLessHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
			var phoneNumberFeatureMoreHtml="<a href=\"javascript:void(0);\" class=\"selected \" val=\"\">不限</a>";
			if(response.data){
				var dataLength=response.data.length;
				//号码预存话费
				for (var i=0; i < dataLength; i++) {
					if(response.data[i].PHONE_NUMBER_PRESTORE){
					  	PHONE_NUMBER_PRESTORE=response.data[i].PHONE_NUMBER_PRESTORE;
					  	for(var m=0;m<PHONE_NUMBER_PRESTORE.length;m++){
					  		var  preStore=PHONE_NUMBER_PRESTORE[m].COLUMN_VALUE_NAME.replace(/\"/g, "");
					  		var greater;
					  		var less;
				  			var preStoreArry=preStore.split("-");
				  			if(preStoreArry.length!=1){
				  				greater=preStoreArry[0];
				  				less=preStoreArry[1];
				  			}else{
				  				preStoreArry=preStoreArry.toString();
				  				greater=preStoreArry.substring(0,preStoreArry.length-2);
				  				less="\"\"";
				  			}
				  			preStore=preStore.replace(/\"/g, "");
					  		phoneNumberPreStoreHtml=phoneNumberPreStoreHtml+"<a href=\"javascript:void(0);\" Greater="+greater+" Less="+less+">"+preStore+"</a>";
					  	}
					  	$("#preStore").html(phoneNumberPreStoreHtml);
						continue;
					}
				};
				//号段
				for (var i=0; i < dataLength; i++) {
					if(response.data[i].PHONE_NUMBER_SEGMENT){
					  	PHONE_NUMBER_SEGMENT=response.data[i].PHONE_NUMBER_SEGMENT;
					  	for(var m=0;m<PHONE_NUMBER_SEGMENT.length;m++){
					  		var  numberStart=PHONE_NUMBER_SEGMENT[m].COLUMN_VALUE_NAME;
					  		numberStart=numberStart.replace(/\"/g, "");
					  		phoneNumStartHtml=phoneNumStartHtml+"<a href=\"javascript:void(0);\" val="+numberStart+">"+numberStart+"</a>";
					  	}
					  	$("#pnHead").html(phoneNumStartHtml);
						continue;
					}
				};
				//号码特征
				for (var i=0; i < dataLength; i++) {
					if(response.data[i].PHONE_NUMBER_FEATURE){
					  	PHONE_NUMBER_FEATURE=response.data[i].PHONE_NUMBER_FEATURE;
					  	var featureLength;
					  	if(PHONE_NUMBER_FEATURE.length<=6){
					  		featureLength=PHONE_NUMBER_FEATURE.length;
					  	}else{
					  		featureLength=6;
					  	}
					  	for(var m=0;m<featureLength;m++){
					  		var numberFeature=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
					  		var numberFeatureVal=(PHONE_NUMBER_FEATURE[m].COLUMN_VALUE).replace(/\"/g, "");
					  		phoneNumberFeatureLessHtml=phoneNumberFeatureLessHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
					  	}
					  	if(PHONE_NUMBER_FEATURE.length>6){
					  		for(var n=0;n<PHONE_NUMBER_FEATURE.length;n++){
					  			var numberFeature=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE_NAME).replace(/\"/g, "");
					  			var numberFeatureVal=(PHONE_NUMBER_FEATURE[n].COLUMN_VALUE).replace(/\"/g, "");
					  			phoneNumberFeatureMoreHtml=phoneNumberFeatureMoreHtml+"<a href=\"javascript:void(0);\" val="+numberFeatureVal+">"+numberFeature+"</a>";
					  		}
					  		$("#pnCharacterId_more").show();
					  		$("#pnCharacterId_more").off("click").on("click",function(event){_view_phonenumber_feature();event.stopPropagation();});
					  	}
					  	$("#pnCharacterId_basic").html(phoneNumberFeatureLessHtml);
					  	$("#pnCharacterId_all").html(phoneNumberFeatureMoreHtml);
						continue;
					}
				};
			}
			$("#pnCharacterId_basic a").each(function(){$(this).off("click").on("click",function(event){prod.telnum.linkQueryPhoneNumber("#pnCharacterId_basic a",this);event.stopPropagation();});});
			$("#pnCharacterId_all a").each(function(){$(this).off("click").on("click",function(event){prod.telnum.linkQueryPhoneNumber("#pnCharacterId_all a",this);event.stopPropagation();});});
			$("#pnHead a").each(function(){$(this).off("click");$(this).on("click",function(event){prod.telnum.linkQueryPhoneNumber("#pnHead a",this);event.stopPropagation();});});
			$("#preStore a").each(function(){$(this).off("click");$(this).on("click",function(event){prod.telnum.linkQueryPhoneNumber("#preStore a",this);event.stopPropagation();});});
		};
		//号码类型全部展示与部分展示
		var _view_phonenumber_feature = function(){
			if($('#pnCharacterId_basic').is(':hidden')){
				$("#pnCharacterId_basic").css("display","");
				$("#pnCharacterId_all").css("display","none");
				$("#pnCharacterId_all").parent("dl").css("overflow","inherit");
			}else{
				$("#pnCharacterId_basic").css("display","none");
				$("#pnCharacterId_all").css("display","");
				$("#pnCharacterId_all").parent("dl").css("overflow","hidden");
			}
		};
		
		var _initPhonenumber=function(){
			prod.telnum.queryApConfig();
			var param={};
			prod.telnum.btnQueryPhoneNumber(param);
			$("#btnNumSearch").off("click").on("click",function(){prod.telnum.btnQueryPhoneNumber(param);});
			$("#btnNumExistSearch").off("click").on("click",function(event){prod.telnum.btnIBydentityQuery(param);event.stopPropagation();});
		};
		//选择地区
		var _chooseArea = function(){
			order.area.chooseAreaTree("order/prepare","p_phone_areaId_val","p_phone_areaId",3);
		};
		
		//规则校验
		var _initPage = function(){
			var param = order.prodModify.getCallRuleParam(CONST.BO_ACTION_TYPE.UPDATE_ACCNBR,order.prodModify.choosedProdInfo.prodInstId);
			var callParam = {
					boActionTypeCd : CONST.BO_ACTION_TYPE.UPDATE_ACCNBR,
					boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.UPDATE_ACCNBR),
					accessNumber : order.prodModify.choosedProdInfo.accNbr,
					prodOfferName : order.prodModify.choosedProdInfo.prodOfferName
				};
			var flag = rule.rule.prepare(param,'prod.telnum.showTelnumChange',callParam);
			if (flag) return;
		};
		
		var _showTelnumChange=function(){
			//初始化订单信息
			OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.UPDATE_ACCNBR,16,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.UPDATE_ACCNBR),"");
			SoOrder.builder();//设置页面效果
		
			var url=contextPath+"/mktRes/telnumcg-prepare";
			var param={};
			if(_boProdAn.accessNumber!=''&&_boProdAn.anTypeCd!=''){
				var oldrelease=true;
				for(var i=0;i<idcode.length;i++){//身份证预占的号码不需要被释放
					if(idcode[i]==_boProdAn.accessNumber){
						oldrelease=false;
						break;
					}
				}
				if(oldrelease){
					param={"oldPhoneNumber":_boProdAn.accessNumber,"oldAnTypeCd":_boProdAn.anTypeCd};
				}
			}
			$.callServiceAsHtmlGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(!response){
						 response.data='选号页面加载异常,稍后重试';
					}
					if(response.code != 0) {
						$.alert("提示","查询失败,稍后重试");
						return;
					}
					var content$=$("#order_fill_content").show();
					content$.html(response.data);
					//设置页面修改号和类型。
					$("#cgnum_view").html(order.prodModify .choosedProdInfo.productName+"："+order.prodModify .choosedProdInfo.accNbr);
					//初始化要修改的号和选择的号
					_boProdAn = {accessNumber : "",level : "",anId : "",anTypeCd : ""};
					_initPhonenumber();
				}
			});	
		};
		var _nextStep=function(){
			if(_boProdAn.accessNumber){
				OrderInfo.boProdAns = [];
				_boProdAn.state="ADD";
				OrderInfo.boProdAns.push(_boProdAn);
				var call_param={"prodInstId":order.prodModify.choosedProdInfo.prodInstId,
						"areaId":order.prodModify.choosedProdInfo.areaId};
				var qryUrl=contextPath+"/mktRes/telnumcg/queryProdInstAccNbr";
				$.callServiceAsJson(qryUrl, call_param,{
					"done" : function(response){
						if(response.code==0){
							if(response.data.prodInstAccNbrList&&response.data.prodInstAccNbrList.length>0){
								var oldAn = response.data.prodInstAccNbrList[0];
								var an = {
									accessNumber : oldAn.accNbr,
									anTypeCd : _boProdAn.anTypeCd,
									anId : oldAn.anId,
									state : "DEL"
								};
								OrderInfo.boProdAns.push(an);
								SoOrder.submitOrder();
							}else{
								$.alert("提示","该产品实例未返回原号码信息");
							}
						}else if(response.code==-2){
							$.alertM(response.data);
						}else{
							if(response.data){
								$.alert("提示","产品实例与号码关系查询异常！"+response.data);
							}else{
								$.alert("提示","产品实例与号码关系查询异常！");
							}
							return;
						}
					}
				});
			}else{
				$.alert("提示","请选择新号码！");
			}
		};
		//设置号码等级
		var _qryPhoneNbrLevelInfoList=function(){
			if(_boProdAn.level==""){
				$.alert("提示","请先选择新号码！");
				return;
			}
			var qryUrl=contextPath+"/mktRes/qryPhoneNbrLevelInfoList";
			$.ligerDialog.open({
				width:560,
				height:350,
				title:'设置号码等级',
				allowClose:false,
				url:qryUrl+"?pnLevelId="+_boProdAn.level+"&areaId="+_boProdAn.areaId+"&org_level="+_boProdAn.org_level,
				buttons: [ { text: '确定', onclick: function (item, dialog) {
							var strs=phoneNum_level.split("_");////全局变量，保存“号码等级_预存金额_保底金额”，由弹出框的iframe，赋值
							dialog.close(); 
							$(".select_nbr_li").each(function(){//设置选择的样式
								if($(this).hasClass("select")){
									var numberval=$(this).attr("numberval").split("_");
									var tx;
									if(phoneNum_level!=undefined&&phoneNum_level!=""&&numberval[5]!=strs[0]){
										tx="<span style='float:left;margin-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元<br/>保底<span class='orange'>"+numberval[2]+"</span>元</span><span style='float:right;margin-right:10px;'>预存<span class='orange'>"+strs[1]+"</span>元<br/>保底<span class='orange'>"+strs[2]+"</span>元</span><span style='width: 15px; display: table; height: 30px; padding-top: 10px;'><img  src='"+contextPath+"/image/common/levelArrow.png'></span>";
									}else{
										tx="<span style='padding-left:10px;'>预存<span class='orange'>"+numberval[1]+"</span>元</span> <span style='padding-left:10px;'> 保底<span class='orange'>"+numberval[2]+"</span>元</span>";
									}
									$(this).find("div").html(tx);
								}
							});
							_boProdAn.level=strs[0];
						} },
				           { text: '关闭', onclick: function (item, dialog) { dialog.close(); } } ] 	
			});
		};
		return {
			qryPhoneNbrLevelInfoList:_qryPhoneNbrLevelInfoList,
			nextStep:_nextStep,
			btnPurchase : _btnPurchase,
			btnQueryPhoneNumber : _btnQueryPhoneNumber,
			linkQueryPhoneNumber : _linkQueryPhoneNumber,
			getIndexPagePhoneNumber :_getIndexPagePhoneNumber,
			queryApConfig:_queryApConfig,
			initPhonenumber:_initPhonenumber,
			boProdAn:_boProdAn,
			resetBoProdAn:_resetBoProdAn,
			btnIBydentityQuery:_btnIBydentityQuery,
			btnToOffer:_btnToOffer,
			initOffer:_initOffer,
			initPage:_initPage,
			showTelnumChange:_showTelnumChange,
			chooseArea : _chooseArea
		};

})();

/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("prod", "transferModify");
/**
 * 订单准备
 */
prod.transferModify = (function(){
	var _toCustName="";
	var _transchoosedCustInfo={};
	var _BO_ACTION_TYPE="";
	//选中的帐户信息
	var _choosedAcctInfo = {};
	//过户
	var _showCustTransfer = function () {
/*if(order.prodModify.choosedProdInfo.prodStateCd!="100000"||order.prodModify.choosedProdInfo.prodStateCd!="140000"){
			$.alert("提示","产品状态为\"在用\"才能进行过户","information");
			return;
		}*/
			var submitState="";
	        _BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.TRANSFER;
			submitState="ADD";
			var param = order.prodModify.getCallRuleParam(_BO_ACTION_TYPE, order.prodModify.choosedProdInfo.prodInstId);
			var callParam = {
				boActionTypeCd : _BO_ACTION_TYPE,
				boActionTypeName : CONST.getBoActionTypeName(_BO_ACTION_TYPE),
				accessNumber : "",
				prodOfferName : "",
				state:submitState
			};
			var checkRule = rule.rule.prepare(param,'prod.transferModify.custTransfer',callParam);
			if (checkRule) return;
	};
	//过户返档
	var _showCustTransferReturn = function () {
		/*	if(order.prodModify.choosedProdInfo.prodStateCd!="100000"||order.prodModify.choosedProdInfo.prodStateCd!="140000"){
					$.alert("提示","产品状态为\"在用\"才能进行过户","information");
					return;
				}*/
					var submitState="";
			        _BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.TRANSFERRETURN;
					submitState="ADD";
					var param = order.prodModify.getCallRuleParam(_BO_ACTION_TYPE, order.prodModify.choosedProdInfo.prodInstId);
					var callParam = {
						boActionTypeCd : _BO_ACTION_TYPE,
						boActionTypeName : CONST.getBoActionTypeName(_BO_ACTION_TYPE),
						accessNumber : "",
						prodOfferName : "",
						state:submitState
					};
					var checkRule = rule.rule.prepare(param,'prod.transferModify.custTransfer',callParam);
					if (checkRule) return;
			};
			
	//过户订单提交
	var _custTransfer_Submit = function() {
		
		var toCustId = $("#litransCustId").attr("transCustId");
		var _toCustId = -1;
		if(toCustId!=""){
			_toCustId = toCustId;
		}
		var toCustName = $("#litransCustId").attr("transCustName");
		var toAddressStr = $("#litransCustId").attr("transAddressStr");
		var toIdentidiesTypeCd = $("#div_tra_identidiesTypeCd option:selected").val();
		var toIdCardNumber = $("#litransidCardNumber").attr("transidCardNumber");
		
		if(toCustId==OrderInfo.cust.custId){
			$.alert("提示","同一客户，无需过户，请确认！","information");
			return;		   
		}
		if(toIdCardNumber==undefined || toCustId==undefined){		
			$.alert("提示","未定位目标客户，请先定位！","information");		
			return;
	    }
		//帐户信息校验
		if(!$("#acctSelect").val()){
			$.alert("提示","请新建或者查询选择一个可用帐户");
			return;
		}
		if($("#acctSelect").val()<0){
			//帐户信息填写校验
			if(!SoOrder.checkAcctInfo()){
				return;
			}
		}
		
		var acctId = $("#acctSelect").val(); //要更换的帐户ID
		var acctCd = -1;
		if(acctId>0){
			acctCd = $("#acctSelect").find("option:selected").attr("acctcd"); //要更换的帐户合同号
		}
		SoOrder.builder();
		//查询产品下帐户信息
		var param = {
				prodId : order.prodModify.choosedProdInfo.prodInstId,
				acctNbr : order.prodModify.choosedProdInfo.accNbr
			};
		var jr = $.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param);
		if(jr.code != 0||jr.data.length==0) {
			if(jr.code==-2){
				$.alertM(jr.data);
			}
			else{
				$.alert("提示","当前产品帐户定位失败，请联系管理员");
			}
			return;
		}
		var origAcct = jr.data[0]; //原帐户信息
		var changeAcct = true;		
		if(origAcct.acctId==acctId){				
			changeAcct = false;							
		}
		if(origAcct.priority==""){
			origAcct.priority = 1;
		}
        OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,_BO_ACTION_TYPE,10,CONST.getBoActionTypeName(_BO_ACTION_TYPE),"");
			
			var busiOrder = [	];
			//新建客户节点
			if(toCustId==""){
				var createCust = {						
						areaId : OrderInfo.staff.areaId,						
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
								state : "ADD"
				            }],				        
				            boCustInfos: [{				                
				            	areaId : OrderInfo.staff.areaId,  
				                businessPassword : "111111",
				                name :  toCustName,
								addressStr :toAddressStr,//客户地址
				                partyTypeCd : 1,
				                state : "ADD"
				            }]
						}
				};
				busiOrder.push(createCust);
			}
			//更换客户节点
			var transferCust = {
					areaId : OrderInfo.staff.areaId,	
					boActionType : {
						actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION, //动作大类：产品动作
						boActionTypeCd : _BO_ACTION_TYPE //动作小类：过户
					},
					busiObj : {				        
						accessNumber : order.prodModify.choosedProdInfo.accNbr,			        
						instId : order.prodModify.choosedProdInfo.prodInstId,			        
						isComp : "N",			        
						objId : CONST.PROD_SPEC.CDMA,			        
						offerTypeCd : "1"			    
					}, 
					busiOrderInfo : {
						seq : OrderInfo.SEQ.seq--
					},	
					data : {
						boCusts : [{			                
							partyId : order.prodModify.choosedProdInfo.custId,			                
							partyProductRelaRoleCd : 0,			                
							state : "DEL"			            
						},
			            {
			                partyId : _toCustId,
			                partyProductRelaRoleCd : 0,
			                state : "ADD"
			            }],
			            busiOrderAttrs : [{			            				    				
			            	itemSpecId : "111111118",	    				
			            	value : $("#order_remark").val() //订单备注		    			
			            }]
					}
			};
			busiOrder.push(transferCust);
			//过户返档
			if(_BO_ACTION_TYPE==CONST.BO_ACTION_TYPE.TRANSFERRETURN){
				var busiOrderAdd = {
						areaId : OrderInfo.staff.areaId,  //受理地区ID		
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
				busiOrder.push(busiOrderAdd);
				
			}
			//新建帐户节点
			if($("#acctSelect").val()==-1){
				
				var acctName = $("#acctName").val();
				var paymentType = $("#paymentType").val();  //100000现金，110000银行
				var bankId = "";
				var bankAcct = "";
				var paymentMan = "";
				if(paymentType==110000){ //银行
					bankId = $("#bankId").val(); //银行ID
					bankAcct = $("#bankAcct").val(); //银行帐号
					paymentMan = $("#paymentMan").val(); //支付人
				}
				
				var createAcct = {
					areaId : OrderInfo.staff.areaId,  //受理地区ID
					busiOrderInfo : {
						seq : OrderInfo.SEQ.seq-- 
					}, 
					busiObj : { //业务对象节点
						instId : -1 //业务对象实例ID
					},  
					boActionType : {
						actionClassCd : CONST.ACTION_CLASS_CD.ACCT_ACTION,
						boActionTypeCd : CONST.BO_ACTION_TYPE.ACCT_CREATE
					}, 
					data : {
						boAccountInfos : [{  //帐户节点
							partyId : _toCustId, //客户ID
							acctName : acctName, //帐户名称
							acctCd : -1, //帐户CD
							acctId : -1, //帐户ID
							businessPassword : "111111", //业务密码
							state : "ADD", //动作
							acctTypeCd : "1" // 默认1
						}],
						boPaymentAccounts : [{ //帐户托收节点
							paymentAcctTypeCd : paymentType, //类型
							bankId : bankId, //银行ID
							bankAcct : bankAcct, //银行帐户ID
							paymentMan : paymentMan, //付费人
							limitQty : "1", //数量
							state : "ADD" //动作
						}],
						boAcct2PaymentAccts : [{ //帐户付费关联关系节点
							priority : "1", //优先级
							state : "ADD" //动作
						}],
						boAccountItems : [],
						boAccountMailings : [] //账单投递信息节点	
					}
				};
				if($("#postType").val()!=-1){
					var boAccountMailing = {
							mailingType : $("#postType").val(),   //*投递方式
							param1 : $("#postAddress").val(),     //*投递地址
							param2 : "1",                         //格式ID
							param3 : $("#postCycle").val(),       //*投递周期
							param7 : $("#billContent").val(),     //*账单内容
							state : "ADD"
					};
					if($("#postType").val()==11 || $("#postType").val()==15){				
						boAccountMailing.param1 = $("#postAddress").val()+","+$("#zipCode").val()+" , "+$("#consignee").val(); //*收件地址,邮编,收件人			
					}
					createAcct.data.boAccountMailings.push(boAccountMailing);
				}
				busiOrder.push(createAcct);
			}
			//更换帐户节点
			if(changeAcct){
				var transferAcct = {
						areaId : OrderInfo.staff.areaId,
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION, //动作大类：产品动作
							boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT //动作小类：改帐务定制关系
						}, 
						busiObj : {				        
							accessNumber : order.prodModify.choosedProdInfo.accNbr,			        
							instId : order.prodModify.choosedProdInfo.prodInstId,			        
							isComp : "N",			        
							objId : CONST.PROD_SPEC.CDMA,			        
							offerTypeCd : "1"			    
						}, 
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						},	
						data : {
							boAccountRelas : [{
								acctCd : origAcct.acctCd,							
								acctId : origAcct.acctId,							
								acctRelaTypeCd : 1,							
								chargeItemCd : origAcct.chargeItemCd,				
								percent : origAcct.percent,							
								priority : origAcct.priority,							
								prodAcctId : origAcct.prodAcctId,						
								state : "DEL"			
							},
							{
								acctCd : acctCd,
								acctId : acctId,
								acctRelaTypeCd : 1,
								chargeItemCd : 1,               
								percent : 100,               
								priority : 1,                 
								prodAcctId : -1,              
								state : "ADD"
							}]							                
						}
				};
				busiOrder.push(transferAcct);
				//订单提交
				SoOrder.submitOrder(busiOrder);
				
			}
			else{
				$.confirm("提示信息","只更换了所属客户，而没有更换付费帐户<br/>确定吗？", {
					yes : function(){
						SoOrder.submitOrder(busiOrder);
					},
					no : function(){
						return;
					}
				}, "question");
			};
	};
    //客户类型选择事件
	var _partyTypeCdChoose = function(scope) {
		var partyTypeCd=$(scope).val();
		//_partyType(partyTypeCd);
		//客户类型关联证件类型下拉框
		$("#div_tra_identidiesTypeCd").empty();
		_certTypeByPartyType(partyTypeCd);
		_identidiesTypeCdChoose($("#div_tra_identidiesTypeCd").children(":first-child"));

	};
	var _partyType = function(partyTypeCd) {
		if(partyTypeCd=="1"){
			var identidiesTypeCdHtml="<select id=\"tra_IdentidiesTypeCd\" onchange=\"order.transferModify.identidiesTypeCdChoose(this)\"><option value=\"1\" >身份证</option><option value=\"2\">军官证</option></select>";
		}else if(partyTypeCd=="2"){
			var identidiesTypeCdHtml="<select id=\"tra_IdentidiesTypeCd\" onchange=\"order.transferModify.identidiesTypeCdChoose(this)\"><option value=\"3\">护照</option><option value=\"23\">ICP经营许可证</option><option value=\"39\">税务登记号</option></select>";
		};
		$("#div_tra_identidiesTypeCd").html(identidiesTypeCdHtml);
	};
	//证件类型选择事件
	var _identidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==1||identidiesTypeCd=="undefined"){
			$("#transfercCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#transfercCustIdCard").attr("data-validate","validate(idCardCheck:请输入合法身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
			$("#transfercCustIdCard").attr("placeHolder","请输入合法军官证");
			$("#transfercCustIdCard").attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			$("#transfercCustIdCard").attr("placeHolder","请输入合法护照");
			$("#transfercCustIdCard").attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else{
			$("#transfercCustIdCard").attr("placeHolder","请输入合法证件号码");
			$("#transfercCustIdCard").attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		_form_TransfercustCreate_btn();
	};
	var _form_custTransfer_btn = function() {
		//过户至客户定位按钮
		$('#custTransferForm').off("formIsValid").on("formIsValid",function(event) {
			var identityCd="";
			var acctNbr="";
			var identityNum="";
			identityCd=$("#p_cust_tra_identityCd").val();
			identityNum=$.trim($("#TransferNum").val());
			if(identityNum==""){
				$.alert("提示","请输入证件号码！");
				return;
			}
			if($("#TransferNum").val().length<14){
				 authFlag="0";
				}
				else{
				 authFlag="1";
				}
			//判断是否是号码或身份证输入
			if(identityCd==1){
			 identityCd=$("#p_cust_tra_identityCd").val();
			}
			if(identityCd==-1){
				acctNbr=identityNum;
				identityNum="";
				identityCd="";
			}
			/*{"acctNbr":"13301543143","identityCd":"","areaId":"2,74,77,20,21,75,1000,23,76","identityNum":"","staffId":"1001"}*/
			var param = {
					"acctNbr":acctNbr,
					"identityCd":identityCd,
					"identityNum":identityNum,
					"partyName":"",
					"custQueryType":$("#custQueryType").val()
			};
			$.callServiceAsHtml(contextPath+"/order/prodModify/transferQueryCust",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},"done" : function(response){
					if(response.code != 0) {
						$.alert("提示","查询失败,稍后重试");
						return;
					}
					_queryCallBack(response);
				},fail:function(response){
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				},"always":function(){
					$.unecOverlay();
					$("#usersearchbtn").attr("disabled",false);
				}
			});
		}).ketchup({bindElement:"custTransferBtn"});
	};
	var _form_TransferAuth_btn = function() {
		//过户至客户客户鉴权按钮
	$('#transCustAuthForm').unbind("click").bind('formIsValid', function(event, form) {
		var param = _transchoosedCustInfo;
		param.prodPwd = $.trim($("#transAuthPassword").val());
		//param.accessNumber="11969577";//TODO need modify
		//param.accessNumber=choosedCustInfo.accessNumber;
		param.authFlag=authFlag;
		$.callServiceAsHtml(contextPath+"/order/prodModify/transCustAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				if(response.data =="false\r\n") {
					$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
					return;
				}
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	}).ketchup({bindElement:"transCustAuthbtn"});
	};
	var _form_TransfercustCreate_btn = function() {
	//过户创建客户确认按钮
	$('#ransferCustCreateForm').unbind("click").bind('formIsValid',function(event) {
		var createCustInfo = {
				cCustName : $.trim($("#transfercCustName").val()),
				cCustIdCard :  $.trim($("#transfercCustIdCard").val()),
				cAddressStr :  $.trim($("#transfercAddressStr").val())
			};
		easyDialog.close();
		var param = {};
		param.prodPwd = "";
		param.accessNumber="";
		param.authFlag="1";
		authFlag="";
		param.idCardNumber=createCustInfo.cCustIdCard;
		param.partyName=createCustInfo.cCustName;
		param.identityName=$("#div_tra_identidiesTypeCd option:selected").text();
		param.addressStr=createCustInfo.cAddressStr;
		$.callServiceAsHtml(contextPath+"/order/prodModify/transCustAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				if(response.data =="false\r\n") {
					$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
					return;
				}
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	}).ketchup({bindElement:"ransferAddcustsussbtn"});
	};
	//过户客户定位查询列表
	var _queryCallBack = function(response) {
		if(response.data =="false\r\n") {
			$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
			return;
		}
		var content$ = $("#custTransferList");
		content$.html(response.data).show();
		$(".userclose").off("click").on("click",function(event) {
			authFlag="";
			$(".usersearchtranscon").hide();
		});
		$(".usersearchtranscon").show();
/*		$("#transCustAuth").off("click").on("click",function(event) {
			_showCustAuth(this);
		});*/
		_form_TransferAuth_btn();
	};
	//过户客户列表点击
	var _showCustAuth = function(scope) {
		_transchoosedCustInfo = {
			custId : $(scope).find("td:eq(3)").text(),
			partyName : $(scope).find("td:eq(0)").text(),
			idCardNumber : $(scope).attr("idCardNumber"),
			identityName : $(scope).attr("identityName"),
			areaName : $(scope).attr("areaName")
		};
		
		if($("#TransferNum").val().length<14){
			//TODO init view 
			easyDialog.open({
				container : 'Transferauth'
			});
			$("#transAuthClose").off("click").on("click",function(event){
				easyDialog.close();
				authFlag="";
				$("#transAuthPassword").val("");
			});
			}
			else{
				_custAuth(scope);
			}

	};
	/**
	 * 客户鉴权
	 */
	var _custAuth = function(scope) {
		var param = _transchoosedCustInfo;
		param.prodPwd = $.trim($("#transAuthPassword").val());
		//param.areaId = 21;//TODO need modify
		//param.accessNumber="11969577"; //need update
		//param.accessNumber=choosedCustInfo.accessNumber;
		param.authFlag=authFlag;
		$.callServiceAsHtml(contextPath+"/order/prodModify/transCustAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				custInfo = param;
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	// cust auth callback
	var _custAuthCallBack = function(response) {
		if(authFlag=="0"){
			easyDialog.close();
		};
		if($.ketchup)
			$.ketchup.hideAllErrorContainer($("#custCreateForm"));
		var content$ = $("#custTransferInfo");
		content$.html(response.data).show();
		$("#custTransferList").hide();
		$(".usersearchtranscon").hide();
		
		if($("#litransCustId").attr("transCustId")==""){
			$("#TransferNum").val("");
			_transchoosedCustInfo.custId=-1;
			_toCustName=$.trim($("#transfercCustName").val());
		}else{		
			_toCustName=$("#litransCustId").attr("transcustname");
		}
		_initAcct();
		$("#accountDiv").show();
	};
	//过户创键客户
	var _showCustCreate = function(scope) {
		easyDialog.open({
			container : 'transfer_cust_add'
		});
		_partyTypeCdChoose($("#div_tra_partyTypeCd").children(":first-child"));
		
		$("#usercreateclose").off("click").on("click",function(event){
			easyDialog.close();
			$("#transfercCustName").val("");
			$("#transfercCustIdCard").val("");
			authFlag="";
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#ransferCustCreateForm"));
		});
		_form_TransfercustCreate_btn();

	};
	var _jumpAuth = function() {
		var param = _transchoosedCustInfo;
		param.authFlag="1";
		$.callServiceAsHtml(contextPath+"/order/prodModify/transCustAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//每次定位客户后，初始化帐户展示
	var _initAcct = function() {
		//新建客户自动新建帐户
		if ($("#litransCustId").attr("transCustId")=="") {
			_whetherCreateAcct();
		} 
		//老客户默认查询使用其已有帐户，若没有老帐户则使用新建帐户
		else {
			var param = {
				custId : $("#litransCustId").attr("transCustId")
			};
			var response = order.prodModify.returnAccount(param);
			if(response.code==0){
				var returnMap = response.data;
				if(returnMap.resultCode==0){
					if(returnMap.accountInfos && returnMap.accountInfos.length > 0){
						$.each(returnMap.accountInfos, function(i, accountInfo){
							var found = false;
							$.each($("#acctSelect option"), function(i, option){
								if($(option).val()==accountInfo.acctId){
									found = true;
									return false;
								}
							});
							if(!found){
								$("<option>").text(accountInfo.owner+" : "+accountInfo.name).attr("value",accountInfo.acctId).attr("acctcd",accountInfo.accountNumber).appendTo($("#acctSelect"));
							}							
							$("#acctSelect").find("option[value="+accountInfo.acctId+"]").attr("selected","selected");							
						});
						$("#defineNewAcct").hide();
					} 
					else{
						_whetherCreateAcct();
					}
				}
				else{
					$.alert("提示", "客户的帐户定位失败，请联系管理员，若要办理新装业务请稍后再试或者新建帐户。错误细节："+returnMap.resultMsg);	
				}				
			} 
			else{
				$.alert("提示",response.data);
			}
		}
	};
	
	//判断是否已新增过帐户，酌情新建或者切换帐户展示 
	var _whetherCreateAcct = function() {		
		var alreadyCreateAcct = false;
		if($("#acctSelect option").size()>0){
			$.each($("#acctSelect option"), function(i, option){
				if($(option).val()==-1){
					alreadyCreateAcct = true;
					return false;
				}
			});
			if(!alreadyCreateAcct){
				order.main.createAcct();
			}
			else{
				$("#acctSelect").find("option[value=-1]").attr("selected","selected");
				$("#defineNewAcct").show();
			}
		}
		else{
			order.main.createAcct();
		}
	};
		
	var _custTransfer = function(callParam) {
		var param = callParam;		
		param.custName=OrderInfo.cust.custName;
		param.custId=OrderInfo.cust.custId;
		param.accessNumber=order.prodModify.choosedProdInfo.accNbr;
		$.callServiceAsHtml(contextPath + "/order/prodModify/custTransfer", param, {		
			"done" : function(response){				
				$("#order_fill_content").html(response.data).show();
				$(".h2_title").append(order.prodModify.choosedProdInfo.productName+"-"+order.prodModify.choosedProdInfo.accNbr);
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				_initDic();
				_form_custTransfer_btn();
			}
		});
	};
	//定位客户证件类型下拉框
	var _initDic = function(){
		var param = {"attrSpecCode":"PTY-0004"} ;
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#p_cust_tra_identityCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
							
						}
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
	};
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd){
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
				}
	   if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var certTypedate = data[i];
							$("#div_tra_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							
						}
					}
				}
	};

	return {
		showCustTransfer : _showCustTransfer,
		custTransfer : _custTransfer,
		showCustCreate :_showCustCreate,
		custTransfer_Submit :_custTransfer_Submit,
		jumpAuth:_jumpAuth,
		partyTypeCdChoose :_partyTypeCdChoose,
		identidiesTypeCdChoose :_identidiesTypeCdChoose,
		showCustTransferReturn :_showCustTransferReturn,
		showCustAuth :_showCustAuth
	};
})();
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
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 || OrderInfo.actionFlag==6){ //可选包变更，补换卡，加装副卡
			offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
		}
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		var inParam = {
			"instCode" : cardNo,
			"phoneNum" : phoneNumber
		};
//		if(OrderInfo.getProdSpecId(prodId)==CONST.PROD_SPEC.CDMA){
//			inParam.mktResCd = "0702";
//		}else if(OrderInfo.getProdSpecId(prodId)==CONST.PROD_SPEC.DATA_CARD){
//			inParam.mktResCd = "0703,0704,0705";
//		}
		var prodSpecId = OrderInfo.getProdSpecId(prodId);
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
		if(CONST.getAppDesc()==0){
			var mktResCd = getMktResCd(prodSpecId);
			if(isNotNull(mktResCd)){
				inParam.mktResCd = mktResCd;
			}else{
				$.alert("提示","查询卡类型失败！");
				return;
			}
		}
		var data = query.prod.checkUim(inParam);//校验uim卡
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
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		$("#uim_release_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
		$("#uim_txt_"+prodId).attr("disabled",true);
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
	};
	
	//uim卡号释放
	var _releaseUim = function(prodId){	
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		var inParam = {
			"oldInstCode":cardNo,
			"phoneNum":phoneNumber
		};
		var data = query.prod.releaseUim(inParam);//释放uim卡
		if(data==undefined){
			return false;
		}
		$("#uim_check_btn_"+prodId).attr("disabled",false);
		$("#uim_check_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
		$("#uim_release_btn_"+prodId).attr("disabled",true);
		$("#uim_release_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		$("#uim_txt_"+prodId).attr("disabled",false);
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
			isOld : "T"  //旧卡
		};
		OrderInfo.boProd2OldTds.push(oldUim);
	};

	//根据UIM类型，设置产品是3G还是4G，并且保存uim卡
	var _setProdUim = function(){
		OrderInfo.boProd2OldTds = []; //清空旧卡
		var flag = true;
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22){//可选包变更，补换卡
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
	
	var isNotNull = function(obj){
		if(obj!=undefined && obj!=""){
			return true;
		}else{
			return false;
		}
	};
	return {
		checkUim				: _checkUim,
		releaseUim 				: _releaseUim,
		setProdUim				: _setProdUim
	};
})();
/**
 * 产品相关查询
 * 没有任何业务逻辑
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("query","prod");

query.prod = (function() {
	
	/**
	 * 产品规格属性查询
	 * @param  offerSpecId 销售品规格ID
	 * @param  prodSpecId 产品规格ID
	 */
	var _prodSpecParamQuery = function(param){
		addParam(param);
		var url = contextPath + "/prod/prodSpecParamQuery";
		$.ecOverlay("<strong>正在查询产品规格属性中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","产品规格属性失败,稍后重试");
			return;
		}
	};
	
	/**
	 * 产品实例属性查询
	 * @param  prodId 产品实例ID
	 * @param  acctNbr 产品接入号码
	 * @param  ifServItem 是否是功能产品
	 */
	var _prodInstParamQuery = function(param){
		addParam(param);
		var url = contextPath + "/prod/prodInstParamQuery";
		$.ecOverlay("<strong>正在查询产品实例属性中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return;
		}else {
			$.alert("提示","产品规格属性失败,稍后重试");
			return;
		}
	};
	
	/**
	 * 产品下终端实例数据查询
	 * @param  prodId 产品实例ID
	 * @param  accNbr 产品接入号
	 * @param  areaId  受理地区
	 * @callBackFun 回调函数
	 * @service/intf.soService/queryOfferCouponById
	 */
	var _getTerminalInfo = function(prod){
		var params = {
			prodId: prod.prodInstId,
			areaId: OrderInfo.getProdAreaId(prod.prodInstId),
			acctNbr: prod.accNbr
		};
		$.ecOverlay("<strong>正在查询产品下终端实例数据中,请稍后....</strong>");
		var response = $.callServiceAsJson(contextPath+"/order/queryTerminalInfo", params, {});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if (response.code == -2) {
			$.alertM(response.data);
		}else{
			$.alert("提示","接口未返回产品原UIM卡数据！");
		}
	};
	
	/**
	 * 产品下账号信息查询
	 * @param  prodId 产品实例ID
	 * @param  acctCd 账号信息
	 * @param  areaId  受理地区
	 * @callBackFun 回调函数
	 * @service/intf.soService/queryOfferCouponById
	 */
	var _queryAcct = function(param,callBackFun) {
		var url= contextPath+"/order/account";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询账户信息中,请稍后....</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						callBackFun(response.data);
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询账户信息失败,稍后重试");
					}
				}
			});
		}else{
			$.ecOverlay("<strong>正在查询账户信息中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data.offerSpec;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询账户信息失败,稍后重试");
			}
		}
	};
	
	/**
	 * 终端串号校验
	 */
	var _checkTerminal = function(param){
		var url = contextPath+"/mktRes/terminal/checkTerminal";
		$.ecOverlay("<strong>终端校验中,请稍后....</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == -2) {
			$.alertM(response.data);
		}else if(response.data && response.data.code == 0) {
			return response.data;
		}else if( response.data.code == 1){
			$.alert("提示", response.data.message);
		}else{
			$.alert("提示","<br/>校验失败，请稍后重试！");
		}
	};
	
	//校验UIM卡
	var _checkUim=function(param){
		var url = contextPath+"/mktRes/uim/checkUim";
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
	
	//释放UIM卡
	var _releaseUim = function(param){
		var url = contextPath+"/mktRes/uim/checkUim";
		$.ecOverlay("<strong>UIM卡释放中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			$.alert("提示","UIM卡释放成功!");
			return response.data;
		}else{
			if(typeof response == undefined){
				$.alert("提示","UIM卡释放请求调用失败，可能原因服务停止或者数据解析异常");
			}else if (response.code == -2) {
				$.alertM(response.data);
			}else{
				var msg="";
				if(response.data!=undefined && response.data.msg!=undefined){
					msg=response.data.msg;
				}else{
					msg="卡号["+cardNo+"]预占失败";
				}
				$.alert("提示","UIM卡释放失败，可能原因:"+msg);
			}
		}
	};
	
	var _getOldUim = function(){
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var oldUimInfo = _getTerminalInfo(prodInfo);
		if(oldUimInfo==undefined){
			return;
		}
		var oldUimdata={
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "2",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :oldUimInfo.couponId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : 1, //物品数量
			//storeId : oldUimInfo.storeId, //仓库ID
			storeId : 1, //仓库ID
			storeName : "11", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : oldUimInfo.couponInsNumber, //物品实例编码
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :prodInfo.prodInstId, //产品ID
			offerId : prodInfo.prodOfferInstId, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列
			id:0,
			isOld : "T"  //旧卡
		};
		return oldUimdata;
	};
	//补充查询基本条件
	var addParam = function(param){
		param.staffId = OrderInfo.staff.staffId;
		param.channelId = OrderInfo.staff.channelId;
		param.partyId = OrderInfo.cust.custId;
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		param.distributorId = OrderInfo.staff.distributorId;
		if(OrderInfo.order.soNbr!=undefined && OrderInfo.order.soNbr != ""){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
	};
	
	return {
		checkUim				: _checkUim,
		releaseUim 				: _releaseUim,
		getTerminalInfo 		: _getTerminalInfo,
		prodSpecParamQuery		: _prodSpecParamQuery,
		prodInstParamQuery		: _prodInstParamQuery,
		getOldUim 				: _getOldUim,
		queryAcct				: _queryAcct,
		checkTerminal			: _checkTerminal
	};
})();
/**
 * 规则
 */
CommonUtils.regNamespace("rule", "rule");

rule.rule = (function(){

	
	var checkFlag = false;
	var checkObj = {};
	var _callBackStr = "";
	var _callBackParam = {};
	
	var _init = function() {
		$("#ruleBody").html("");
		$("#ruleclose").click(function(){
			_closeRuleDiv();
		});
		//授信
		$("#credit").click(function(){
			_credit();
		});
		$("#closedialog").click(function(){
			_cancel();
		});
	};
	/**
	 * 受理准备调用规则
	 * param : {
	 * 		
	 *  	ruleParam : {
	 *  		boActionTypeCd : 'S1', //动作类型
	 *  		instId : '1200001', //实例ID
	 *  		specId : '1201201', //产品（销售品）规格ID
	 *  		custId : '345903434', //客户ID
	 *  		areaId : '899990',//地区ID
	 *  	}
	 *  	
	 * }
	 */
	var _prepare = function(param,callBackStr,callBackParam){
		_init();
		_callBackStr = callBackStr;
		_callBackParam = callBackParam;
		if(!query.offer.loadInst()){  //加载实例到缓存
			return;
		};
		var inParam ={
			prodInfo : order.prodModify.choosedProdInfo,
			areaId : param.areaId,
			staffId : param.staffId,
			channelId : param.channelId,
			custId : param.custId,
			boInfos : param.boInfos,
			soNbr : OrderInfo.order.soNbr
		};
		$.ecOverlay("<strong>客户级规则校验中，请稍等...</strong>");
		var response = $.callServiceAsJson(contextPath+"/rule/prepare",inParam); //调用规则校验
		$.unecOverlay();
		var checkData = response.data;
		if(response.code==0){
			if(checkData == null){
				$.alert("提示","规则校验异常，请联系管理人员！");
				return;
			}
		}else{
			$.alertM(response.data);
			return;
		}
		
		if(checkData.ruleType == "portal"){
			if (checkData.resultCode == "0"){
				$.alert("提示",checkData.resultMsg);
				return true;
			}
		}		
		if (checkData.result && checkData.result.resultInfo) {
			var checkRuleInfo = checkData.result.resultInfo;
			if (checkRuleInfo != null && checkRuleInfo.length > 0) {
				$.each(checkRuleInfo, function(i, ruleInfo) {
					$("<tr>" +
							"<td>"+ruleInfo.resultCode+"</td>" +
							"<td>"+ruleInfo.ruleDesc+"</td>" +
							"<td>"+_getRuleLevelName(ruleInfo.ruleLevel)+"</td>" +
							"<td><div style='display:block;margin-left:30px;' class='"+_getRuleImgClass(ruleInfo.ruleLevel)+"'></div></td>" +
					"</tr>").appendTo($("#ruleBody"));
				});
				easyDialog.open({
					container : 'ruleDiv'
				});
			} else {
				_credit();	
				SoOrder.initFillPage();		
			}
		} else {
			_credit();
			SoOrder.initFillPage();	
		}
		if (checkData.resultCode != 0) {
			$("#ruleSubmit").hide();
		} else {
			checkObj = param;
			checkFlag = true;
		}
	};
	
	var _getRuleImgClass = function(ruleLevel) {
		if (ruleLevel < 4) {
			return "correct";
		} else {
			return "error";
		}
	};
	
	var _getRuleLevelName = function(ruleLevel) {
		if (ruleLevel == 0) {
			return "提示级";
		} else if (ruleLevel == 1) {
			return "中级";
		} else if (ruleLevel == 2) {
			return "高级";
		} else if (ruleLevel == 3) {
			return "特技";
		} else if (ruleLevel == 4) {
			return "限制级";
		}
	};
	
	var _prepareCallBack = function(response) {
		var content$ = $("#ruleDiv");
		content$.html(response.data).show();
	};
	
	
	/**
	 * 规则页面点击确定按钮
	 */
	var _submit = function() {
		if (!checkFlag) {
			return;
		}
		$.callServiceAsHtml(contextPath+checkObj.uri, checkObj.param, checkObj.callObj);
		easyDialog.close();
	};
	
	/**
	 * 关闭规则窗口
	 */
	var _closeRuleDiv = function() {
		if (!$("#ruleDiv").is(":hidden")) {
			easyDialog.close();
		}
	};
	
	var _cancel = function() {
		//TODO may do other things;
		if (!$("#ruleDiv").is(":hidden")) {
			easyDialog.close();
		}
	};
	
	var _showRuleDiv = function(ruleInfo) {
		
	};
	
	var _credit = function() {
		eval(_callBackStr + "("+JSON.stringify(_callBackParam) + ")");
		_closeRuleDiv();
	};
	
	//生成订单流水号，加载实例到缓存,规则校验
	var _ruleCheck = function(boInfos){
		_init();
		if(!query.offer.loadInst()){  //生成订单流水号，加载实例到缓存，如果失败
			return false;
		};
		if(boInfos==undefined){  //没有传，表示不做业务规则校验
			return true;
		}
		OrderInfo.order.step=1;//订单页面
		var inParam ={
			areaId : OrderInfo.staff.areaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			boInfos : boInfos,
			prodInfo : order.prodModify.choosedProdInfo	
		};
		$.ecOverlay("<strong>客户级规则校验中，请稍等...</strong>");
		var response = $.callServiceAsJson(contextPath+"/rule/prepare",inParam); //调用规则校验
		$.unecOverlay();
		if(response!=undefined && response.code==0){
			var checkData = response.data;
			if(checkData == null){
				$.alert("提示","规则校验异常，请联系管理人员！");
				return false;
			}
			if(checkData.ruleType == "portal"){  //门户层校验
				if (checkData.resultCode == "0"){  // 0为门户层校验为通过
					$.alert("提示",checkData.resultMsg);
					return false;
				}
			}		
			var checkRuleInfo = checkData.result.resultInfo;  //业务规则校验
			if(checkRuleInfo!=undefined && checkRuleInfo.length > 0){
				$.each(checkRuleInfo, function(i, ruleInfo) {
					$("<tr><td>"+ruleInfo.resultCode+"</td>" +
							"<td>"+ruleInfo.ruleDesc+"</td>" +
							"<td>"+_getRuleLevelName(ruleInfo.ruleLevel)+"</td>" +
							"<td><div style='display:block;margin-left:30px;' class='"+_getRuleImgClass(ruleInfo.ruleLevel)+"'></div></td>" +
					"</tr>").appendTo($("#ruleBody"));
				});
				easyDialog.open({
					container : 'ruleDiv'
				});
				return false;
			}else {
				return true;
			}
		}else{
			$.alertM(response.data);
			return;
		}
	};
	
	return {
		submit 			: _submit,
		prepare 		: _prepare,
		showRuleDiv 	: _showRuleDiv,
		ruleCheck		: _ruleCheck
	};
})();
$(function(){

});


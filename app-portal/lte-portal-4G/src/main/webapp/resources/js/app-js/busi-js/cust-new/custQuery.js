/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("custQuery");
/**
 * 订单准备
 */
custQuery = (function(){
	//客户鉴权跳转权限
	var _jumpAuthflag="";
	var _queryForChooseUser = false;
	var authFlag = null; 
	var _orderBtnflag="";
	var _choosedCustInfo = {};
	var _q_custList = [];//客户定位返回客户列表
	
	//进入客户定位页面
	var _goQueryCust = function(){
		var param = {};
		$.callServiceAsHtml(contextPath+"/app/cust/query",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}
				if(OrderInfo.actionFlag == 111){
					$("#sd_tab-box").hide();
					$("#cust").hide();
				}
				var content$ = $("#queryCust");
				content$.html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//新增客户
	var _custCreat = function(){
		var param = {"newFlag":"Y","actionFlag":"111"};
		$.callServiceAsHtml(contextPath+"/app/cust/realCreate",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					$.alertM(response.data);
					return;
				}
				var content$ = $("#cust-nav-tab-2");
				content$.html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//客户定位证件类型选择事件
	var _custidentidiesTypeCdChoose = function(scope,id) {
		// 非接入号隐藏产品类别选择
//		$("#prodTypeCd").hide();
		$("#"+id).val("");
		$("#"+id).attr("oninput", "value=value.replace(/[^A-Za-z0-9]/ig,'')");
		var identidiesTypeCd=$(scope).val();
		$("#"+id).attr("maxlength","100");
		// 非身份证类型 读卡按钮失效
//		$("#userid").next("span").find("button").prop("disabled", true);
		if(identidiesTypeCd==-1){
			$("#zjsm").hide();
			$("#cpdl").show();
			$("#"+id).attr("oninput", "value=value.replace(/[^0-9-]+/,'')");
			$("#"+id).attr("maxlength","11");
			if(OrderInfo.actionFlag != "9"){
				$("#zdjrhm").show();
				
			}
			$("#"+id).attr("placeHolder","请输入接入号码");
//			$("#"+id).attr("data-validate","validate(required:请准确填写接入号码) on(keyup)");
		}else if (identidiesTypeCd==1){
			$("#zjsm").show();
			$("#cpdl").hide();
//			$("#userid").next("span").find("button").prop("disabled", false);
			$("#"+id).attr("placeHolder","请输入身份证号码");
			$("#"+id).attr("data-validate","validate(idCardCheck:请准确填写身份证号码) on(keyup)");
		}else if(identidiesTypeCd==2){
			$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9\u4e00-\u9fa5]/ig,'')");
			$("#"+id).attr("placeHolder","请输入军官证");
			$("#"+id).attr("data-validate","validate(required:请准确填写军官证) on(keyup)");
		}else if(identidiesTypeCd==3){
			$("#"+id).attr("placeHolder","请输入护照");
			$("#"+id).attr("data-validate","validate(required:请准确填写护照) on(keyup)");
		}else if(identidiesTypeCd==15){
			$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9-]/ig,'')");
			$("#"+id).attr("placeHolder","请输入证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(keyup)");
			$("#"+id).attr("maxlength","20");
			
		}else{
			$("#"+id).attr("placeHolder","请输入证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(keyup)");
		}
		if(identidiesTypeCd!=-1){
			$("#zdjrhm").hide();
		}
	};
	
	//客户定位-查询客户
	var _queryCust = function () {
		// 验证表单数据
		if  (!_identityNumValidate()) {
			return;
		};
		//客户定位时长
//		var url=contextPath+"/order/createorderlonger";
//		var response = $.callServiceAsJson(url, {});
//		if(response.code==0){
//			OrderInfo.custorderlonger=response.data;
//		}
		var identityCd="";
		var prodClass = "";
		var idcard="";
		var diffPlace="";
		var acctNbr="";
		var identityNum="";
		var queryType="";
		var queryTypeValue="";
		identityCd=$("#identidiesType").val(); // 证件类型
		identityNum=$.trim($("#userid").val());// 证件号
		//判断是否是号码或身份证输入

		//省份甩单定位客户不需要进行客户鉴权
//		if(order.cust.fromProvFlag == "1" || (identityCd!=-1 && CONST.getAppDesc()!=0)){
//			identityCd=$("#idtype_dummy").val();
//			authFlag="1";
//		}else{
//			//4G所有证件类型定位都需要客户鉴权
//			authFlag="0";
//		}
		//4G所有证件类型定位都需要客户鉴权
		authFlag="0";
		if( OrderInfo.actionFlag == "9" )
		{
			authFlag ="1";
		}
		if(identityCd==-1){
			acctNbr=identityNum;
			identityNum="";
			identityCd="";
		}else if(identityCd=="acctCd"||identityCd=="custNumber"){
			acctNbr="";
			identityNum="";
			identityCd="";
			queryType=$("#identidiesType").val();
			queryTypeValue=$.trim($("#userid").val());

		}
		diffPlace=$("#DiffPlaceFlag").val();
		areaId=$("#p_cust_areaId").val();
		//lte进行受理地区市级验证
//		if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
//			$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
//			return;
//		}
		var param = {
				"prodClass":prodClass,
				"actionFlag":OrderInfo.actionFlag,
				"acctNbr":acctNbr,
				"identityCd":identityCd,
				"identityNum":identityNum,
				"partyName":"",
				"custQueryType":$("#custQueryType").val(),
				"diffPlace":diffPlace,
				"areaId" : areaId,
				"queryType" :queryType,
				"queryTypeValue":queryTypeValue,
				"identidies_type":$("#identidiesType option:selected").text()
		};
		// 如果是接入号，且开关打开，则添加产品大类字段
//		if ($("#p_cust_identityCd").val() == -1 && "ON" == CacheData.getIntOptSwitch()) {
//			param.prodClass = $("#prodTypeCd").val();
//		}
		$.callServiceAsHtml(contextPath+"/app/cust/appQueryCust",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					return;
				}
//				_queryCallBack(response);
				if(response.data.indexOf("showDiffcode") >=0) {
					$.alert("提示","抱歉，该工号没有异地业务的权限！");
					return;
				}
				if(response.data.indexOf("false") >=0) {
					$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
					return;
				}
				$("#custQuerycontent").hide();
				if(OrderInfo.actionFlag == 111){
					$("#sd_tab-box").show();
				}
				var content$ = $("#cust-query-list");
				content$.html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
//				$.unecOverlay();
//				$("#usersearchbtn").attr("disabled",false);
			}
		});
	};
	
	var _identityNumValidate = function () {
		var identidiesTypeCd=$("#identidiesType").val();
		var identityNum = $("#userid").val();
		if ("" == $.trim(identityNum)) {
			$.alert("提示","号码不能为空");
			return false;
		}
		if(identidiesTypeCd==-1){
			var reg = /^\d{11}$/;
			if(reg.test(identityNum) === false) {
				$.alert("提示","请准确填写接入号码");
				return false;
			} 
		}else if (identidiesTypeCd==1){
			var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
			if(reg.test(identityNum) === false) {
				$.alert("提示","请准确填写身份证号码");
				return false;
			} 
		}else if(identidiesTypeCd==2){
			var reg = /^A-Za-z0-9\u4e00-\u9fa5{1,}$/;
			if(reg.test(identityNum) === false) {
				$.alert("提示","请准确填写军官证");
				return false;
			} 
		}else if(identidiesTypeCd==3){
			
		}else if(identidiesTypeCd==15){
			var reg = /^A-Za-z0-9-{1,20}$/;
			if(reg.test(identityNum) === false) {
				$.alert("提示","请准确填写证件号码");
				return false;
			} 
		}else{
		}
		return true;
	};
	
	//客户列表点击
	var _showCustAuth = function(scope) {
		_choosedCustInfo = {
			custId : $(scope).attr("custId"), //$(scope).find("td:eq(3)").text(),
			partyName : $(scope).attr("partyName"), //$(scope).find("td:eq(0)").text(),
			idCardNumber : $(scope).attr("idCardNumber"), //$(scope).find("td:eq(4)").text(),
			identityName : $(scope).attr("identityName"),
			areaName : $(scope).attr("areaName"),
			areaId : $(scope).attr("areaId"),
			identityCd :$(scope).attr("identityCd"),
			addressStr :$(scope).attr("addressStr"),
			norTaxPayer :$(scope).attr("norTaxPayer"),
			segmentId :$(scope).attr("segmentId"),
			segmentName :$(scope).attr("segmentName"),
			custFlag :$(scope).attr("custFlag"),
			vipLevel :$(scope).attr("vipLevel"),
			vipLevelName :$(scope).attr("vipLevelName"),
			accNbr:$(scope).attr("accNbr")
		};
		//设置被选择标识
		$(scope).attr("selected","selected");
		$(scope).siblings().each(function () {
				$(this).removeAttr("selected");
		});
		
		 判断是否是政企客户
		var isGovCust = false;
		for (var i = 0; i <= CacheData.getGovCertType().length; i ++) {
			if (_choosedCustInfo.identityCd == CacheData.getGovCertType()[i]) {
				isGovCust = true;
				break;
			}
		}
		//省份政企开关
		var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "GOV_"+(_choosedCustInfo.areaId+"").substr(0,3)});
		var govSwitch = "OFF";
		if(response.code=="0"){
			govSwitch = response.data;
		}
		if(cust.queryForChooseUser && isGovCust){
			$.alert('提示','使用人必须是公众客户，请重新定位。');
			return false;
		}
		
		if(authFlag=="0"){
			//TODO init view 
			if(custQuery.authType == '00'){
				$("#custAuthTypeName").html("客户密码：");
			} else {
				$("#custAuthTypeName").html("产品密码：");
			}
			var pCustIdentityCd = $("#identidiesType").val();
			$("#idCardType2").text(_choosedCustInfo.identityName);
			if (_choosedCustInfo.identityCd == "1") {
				$("#readCertBtnID2").show();
				$("#idCardNumber2").attr("disabled", "disabled");
			} else {
				$("#readCertBtnID2").hide();
				$("#idCardNumber2").removeAttr("disabled");
			}
			var canRealName = $('#custInfos').parent().children('[selected="selected"]').attr('canrealname');
			var accessNumber=_choosedCustInfo.accNbr;
			if(OrderInfo.actionFlag == "2" && OrderInfo.actionFlag == "22" && -1==$("#identidiesType").val() && !ec.util.isObj(_choosedCustInfo.accNbr)){
				_choosedCustInfo.accNbr = $.trim($("#userid").val());
			}
			if(OrderInfo.actionFlag == "2" || OrderInfo.actionFlag == "3" || OrderInfo.actionFlag == "9" || OrderInfo.actionFlag == "22") {
				if(!_querySecondBusinessAuth(OrderInfo.actionFlag, "Y")) {
					if(-1==$("#identidiesType").val()){
						accessNumber=$.trim($("#userid").val());
					} else{
						$("#auth_tab1").removeClass();
						$("#content1").removeClass("active");
						$("#auth_tab1").hide();
						$("#auth_tab3").hide();
						$("#content1").hide();
						$("#content3").hide();
						$("#auth_tab2").addClass("active");
						$("#content2").addClass("active");
					}
				}
				
			}
			
			/*if(!ec.util.isObj(accessNumber)){
				$("#auth_tab1").hide();
				$("#auth_tab3").hide();
				$("#content1").hide();
				$("#content3").hide();
			}else{
				$("#auth_tab1").show();
				$("#auth_tab2").show();
				$("#auth_tab3").show();
				$("#content1").show();
				$("#content2").hide();
				$("#content3").hide();
			}*/
			//初始化弹出窗口
			$("#authPassword2").val("");
			$("#idCardNumber2").val("");
			$("#smspwd2").val("");
			$("#num").val("");
			
			if("9" != OrderInfo.actionFlag) {
				if ( ec.util.isObj(canRealName) && 1 == canRealName) {
					$('#auth3').modal('show');
				}else{
					$.alert("提示","非实名制不能进行此操作");
				}
			}else {
				if ( ec.util.isObj(canRealName) && 1 != canRealName) {
					$('#auth3').modal('show');
				}else{
					$.alert("提示","实名制不能进行此操作");
				}
			}


			if(custQuery.jumpAuthflag=="0"){
				//$("#jumpAuth").off('click').on('click', function(){
				//	order.cust.jumpAuth();
				//});
				$("#jumpAuth1").show();
				$("#jumpAuth2").show();
				$("#jumpAuth3").show();
			}
//			$("#authClose").off("click").on("click",function(event){
//				easyDialog.close();
//				$("#authPassword").val("");
//			});
//			$("#authIDClose").off("click").on("click",function(event){
//				easyDialog.close();
//				$("#authIDTD").val("");
//			});
		} else{
			//_custAuth(scope);
			_jumpAuth();
		}
	};
	
	//多种鉴权方式的tab页切换
	var _changeTab = function (tabId) {
		if (tabId == 2 && _choosedCustInfo.identityCd != "1") {
			if (_isSelfChannel()) {
				$("#idCardNumber2").removeAttr("disabled");
			} else {
				$("#idCardNumber2").attr("disabled", "disabled");
				$.alert("提示", "请到电信自有营业厅办理业务！");
			}
		}
		$("#auth-nav-tab-1").removeClass("active in");
		$("#auth-nav-tab-2").removeClass("active in");
		$("#auth-nav-tab-3").removeClass("active in");
		$("#auth-nav-tab-"+tabId).addClass("active in");
	};
	
	//返回是否是自营渠道
	var _isSelfChannel = function () {
		var currentCT = $("#currentCT").val();//渠道类型
		var isSelfChannel = false;
		if (currentCT == CONST.CHANNEL_TYPE_CD.ZQZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXDL
			|| currentCT == CONST.CHANNEL_TYPE_CD.HYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.SYKHZXDL
			|| currentCT == CONST.CHANNEL_TYPE_CD.XYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXJL
			|| currentCT == CONST.CHANNEL_TYPE_CD.ZYOUT || currentCT == CONST.CHANNEL_TYPE_CD.ZYINGT
			|| currentCT == CONST.CHANNEL_TYPE_CD.WBT) {
			isSelfChannel = true;
		}
		return isSelfChannel;
	};
	
	//客户鉴权--产品密码
	var _productPwdAuth=function(level){
    
		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#authPassword2").val());
		if(!ec.util.isObj(param.prodPwd)){
			$.alert("提示","产品密码不能为空！");
			return;
		}
		param.validateType = "3";
		param.accessNumber=_choosedCustInfo.accessNumber;
		param.authFlag=authFlag;

		var recordParam={};
		recordParam.validateType="3";
		recordParam.validateLevel=level;
		recordParam.custId=param.custId;
		recordParam.accessNbr=_choosedCustInfo.accNbr;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		$('#auth3').modal('hide'); 
		$.callServiceAsHtml(contextPath+"/agent/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				}
				if(response.data.indexOf("false") >=0) {
					$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				}
				//判断能否转为json，可以的话返回的就是错误信息
				try {
					var errorData = $.parseJSON(response.data);
					$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack,"error");
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				} catch(e){
				}
				if(!custQuery.queryForChooseUser){
					custInfo = param;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;

					OrderInfo.cust = _choosedCustInfo;
					if (level == "1") {
						$('#auth3').modal('hide'); 
						_custAuthCallBack(response);
					} else {
						$('#auth3').modal('hide');
					}
				} else {
					//鉴权成功后显示选择使用人弹出框
					order.main.showChooseUserDialog(param);
				}
				recordParam.resultCode = "0";
				_saveAuthRecord(recordParam);
			}
		});
	};
	
	//客户鉴权--证件类型
	var _identityTypeAuth=function(level){
		$('#auth3').modal('hide');
		var idCardNumber2 = "";
		if (level == "1") {
			idCardNumber2 = $("#idCardNumber2").val();
			if (_choosedCustInfo.identityCd != "1") {
				if (_isSelfChannel()) {
					$("#idCardNumber2").removeAttr("disabled");
				} else {
					$("#idCardNumber2").attr("disabled", "disabled");
					$.alert("提示", "请到电信自有营业厅办理业务！");
					return;
				}
			}
		} else if (level == "2") {
			idCardNumber2 = $("#idCardNumber2").val();
			if (_choosedCustInfo.identityCd != "1") {
				if (_isSelfChannel()) {
					$("#idCardNumber2").removeAttr("disabled");
				} else {
					$("#idCardNumber2").attr("disabled", "disabled");
					$.alert("提示", "请到电信自有营业厅办理业务！");
					return;
				}
			}
		}
		var param = _choosedCustInfo;
		param.validateType="1";
		param.identityNum = base64encode(utf16to8($.trim($("#idCardNumber2").val())));
		if(!ec.util.isObj(param.identityNum)){
			$.alert("提示","证件号码不能为空！");
			return;
		}
		param.identityCd=param.identityCd;
		param.accessNumber=_choosedCustInfo.accNbr;
		param.authFlag=authFlag;

		var recordParam={};
		recordParam.validateType="1";
		recordParam.validateLevel=level;
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accessNumber;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		$.callServiceAsHtml(contextPath+"/agent/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				}
				//判断能否转为json，可以的话返回的就是错误信息
				try {
					var errorData = $.parseJSON(response.data);
					if (ec.util.isObj(errorData) && errorData == false) {
						$.alert("提示", "鉴权失败");
					} else {
						$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack,"error");
					}
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				} catch(e){
				}
				//window.localStorage.setItem("OrderInfo.cust",JSON.stringify(OrderInfo.cust));
				if(!custQuery.queryForChooseUser){
					custInfo = param;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;

					OrderInfo.cust = _choosedCustInfo;
					if (level == "1") {
						$('#auth3').modal('hide');
						_custAuthCallBack(response);
					} else {
						$('#auth3').modal('hide');
					}
				} else {
					//鉴权成功后显示选择使用人弹出框
					order.main.showChooseUserDialog(param);
				}
				recordParam.resultCode = "0";
				_saveAuthRecord(recordParam);
			}
		});
	};
	
	//短信发送
	var _smsResend = function (level) {
		$("#smspwd2").val("");
		var accNbr = "";
		if (level == "1") {
			accNbr = _choosedCustInfo.accNbr;
			if(-1==$("#identidiesType").val()){
				accNbr=$.trim($("#userid").val());
			}
		} else if (level == "2") {
			accNbr = order.prodModify.choosedProdInfo.accNbr;
		}
		if(!ec.util.isObj(accNbr)){
			$.alert("提示","手机号不存在，无法发送短信");
			return;
		}
//		var param = {
//			"pageIndex": 1,
//			"pageSize": 10,
//			"munber":accNbr,
//			"isSecond":"Y"
//		};
		var param = {
				"phoneNum":accNbr
			};
		$.callServiceAsJsonGet(contextPath + "/staff/login/custAuthSmsSend", param, {
			"done": function (response) {
				if (response.code == 0) {
					if(response.data.randomCode != null ){
						$("#num").val(response.data.randomCode);
					}
					$.alert("提示", "验证码发送成功，请及时输入验证.");
				} else {
					$.alert("提示", response.data.errData);
				}
			}
		});
	};
	
	//短信验证
	var _smsvalid=function(level){
		$('#auth3').modal('hide');
		var params="smspwd="+$("#smspwd2").val();
		if(!ec.util.isObj($("#smspwd2").val())){
			$.alert("提示","验证码不能为空！");
			return;
		}
		var param = _choosedCustInfo;
		var recordParam={};
		recordParam.validateType="2";
		recordParam.validateLevel=level;
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accNbr;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;


		$.callServiceAsJson(contextPath+"/staff/login/custAuthSmsValid", params, {
			"before":function(){
				$.ecOverlay("<strong>验证短信随机码中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if(response.code==0){
					$('#auth3').modal('hide');
					if (level == "1") {
						var param = _choosedCustInfo;
						param.authFlag="1";
						$.unecOverlay();
						$.callServiceAsHtml(contextPath+"/agent/cust/custAuth",param,{
							"before":function(){
								$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
							},"done" : function(response){
								if(response.code != 0) {
									$.alert("提示","客户鉴权失败,稍后重试");
									return;
								}
								
								if(!custQuery.queryForChooseUser){
									custInfo = param;
									OrderInfo.boCusts.prodId=-1;
									OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
									OrderInfo.boCusts.partyProductRelaRoleCd="0";
									OrderInfo.boCusts.state="ADD";
									OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;

									OrderInfo.cust = _choosedCustInfo;
									_custAuthCallBack(response);
								} else {
									//鉴权成功后显示选择使用人弹出框
									order.main.showChooseUserDialog(param);
								}
							},"always":function(){
								$.unecOverlay();
							}
						});
					} else {
						$('#auth3').modal('hide');
					}
					recordParam.resultCode = "0";
					_saveAuthRecord(recordParam);
				}else{
					$.alert("提示",response.data);
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
				}
			},
			"fail" : function(response){
				$.unecOverlay();
				$.alert("提示","短信校验失败！");
				recordParam.resultCode = "1";
				_saveAuthRecord(recordParam);
			}
		});
	};
	
	//跳过鉴权
	var _jumpAuth = function() {
		if(authFlag=="0" && custQuery.jumpAuthflag!="0"){
			$.alert("提示","没有跳过校验权限！");
			return;
		}
		var param = _choosedCustInfo;
		param.authFlag="1";
		$('#auth3').modal('hide');
		var recordParam={};
		recordParam.validateType="4";
		recordParam.validateLevel="1";
		recordParam.custId=param.custId;
		recordParam.accessNbr=_choosedCustInfo.accNbr;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		$.callServiceAsHtml(contextPath+"/agent/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					recordParam.resultCode = "1";
					_saveAuthRecord(recordParam);
					return;
				}
				
				if(!custQuery.queryForChooseUser){
					custInfo = param;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;
					
					OrderInfo.cust = _choosedCustInfo;
					_custAuthCallBack(response);
				} else {
					//鉴权成功后显示选择使用人弹出框
					order.main.showChooseUserDialog(param);
				}
				recordParam.resultCode = "0";
				_saveAuthRecord(recordParam);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//鉴权方式日志记录
	var _saveAuthRecord=function(param){
		var url=contextPath+"/secondBusi/saveAuthRecord";
		var response= $.callServiceAsJson(url,param);
		if(response.code==0){
			var result=response.data.result;
			CacheData.setRecordId(result.recordId);
		}else{
			$.alertM(response.data);
		}
	};
	
	var _custAuthCallBack = function(response) {
		$("#custQuerycontent").hide();
		$("#cust-query-list").hide();
//		if($.ketchup)
//		$.ketchup.hideAllErrorContainer($("#custCreateForm"));
//		$("#custInfo").html(response.data).show();
//		if("2" == OrderInfo.actionFlag || "22"== OrderInfo.actionFlag ) {
//			if(_choosedCustInfo.accNbr != null && ec.util.isObj(_choosedCustInfo.accNbr) &&(response.data).indexOf("query-cust-prod") != -1) {
//				$("#query-cust-prod").click();
//				$("#query-cust-prod").hide();
//			}
//		}
		
		_queryCustNext();
	};
	
	var _queryCustNext = function () {
		var params={};
		// 改变按钮事件和文字
		$("#query-cust-btn").removeAttr("onclick");
		// 选中产品信息后再激活
		$("#query-cust-btn").prop("disabled", true);
		//新装隐藏客户产品信息
		if("1" == OrderInfo.actionFlag || "13" == OrderInfo.actionFlag || "14" == OrderInfo.actionFlag){
			$("#query-cust-prod").hide();
			$("#query-cust-btn").prop("disabled", false);
		}
		$("#query-cust-btn").html('<span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> 下一步');
		// 办号卡
		if ("1" == OrderInfo.actionFlag) {
			params.method ='/app/order/prodoffer/prepare';
			params.actionFlag = 1;
			common.callOrderServer(OrderInfo.staff, OrderInfo.cust, order.prodModify.choosedProdInfo, params);
			return;
		}
		// 套餐变更
		if ("2" == OrderInfo.actionFlag) {
			params.method ="/app/order/prodoffer/offerchange/prepare";
			params.actionFlag = 2;
		}
		// 客户资料返档
		if ("9" == OrderInfo.actionFlag) {
			params.method ="/app/prodModify/prepare";
			params.actionFlag = 9;
		}
		// 补换卡
		if ("22" == OrderInfo.actionFlag) {
			params.method ="/app/prodModify/toCheckUimUI";
			params.actionFlag = 22;
		}
		// 购裸机
		if ("13" == OrderInfo.actionFlag) {
			$("#query-cust-btn").off("click").bind("click", function () {
			if (ec.util.isObj(OrderInfo.staff.staffId) && ec.util.isObj(OrderInfo.cust.custId) && ec.util.isObj(order.prodModify.choosedProdInfo)) {
				OrderInfo.order.step = 4;
				SoOrder.submitOrder(mktRes.terminal.Ljdata);
			} else if (!ec.util.isObj(OrderInfo.staff.staffId)) {
				$.alert("提示", "员工信息为空");
			} else if (!ec.util.isObj(OrderInfo.cust.custId)) {
				$.alert("提示", "客户信息为空");
			} else if (!ec.util.isObj(order.prodModify.choosedProdInfo)) {
				$.alert("提示", "产品信息为空");
			}
			});
		}
		// 购合约机
		if ("14" == OrderInfo.actionFlag) {
			$("#query-cust-btn").off("click").bind("click", function () {
			if (ec.util.isObj(OrderInfo.staff.staffId) && ec.util.isObj(OrderInfo.cust.custId) && ec.util.isObj(order.prodModify.choosedProdInfo)) {
				OrderInfo.order.step = 4;
				SoOrder.submitOrder();
			} else if (!ec.util.isObj(OrderInfo.staff.staffId)) {
				$.alert("提示", "员工信息为空");
			} else if (!ec.util.isObj(OrderInfo.cust.custId)) {
				$.alert("提示", "客户信息为空");
			} else if (!ec.util.isObj(order.prodModify.choosedProdInfo)) {
				$.alert("提示", "产品信息为空");
			}
			});
		}
		// 购合约机
		if ("1" == OrderInfo.actionFlag) {
			$("#query-cust-btn").off("click").bind("click", function () {
			if (ec.util.isObj(OrderInfo.staff.staffId) && ec.util.isObj(OrderInfo.cust.custId) && ec.util.isObj(order.prodModify.choosedProdInfo)) {
				OrderInfo.order.step = 3;
				SoOrder.submitOrder();
			} else if (!ec.util.isObj(OrderInfo.staff.staffId)) {
				$.alert("提示", "员工信息为空");
			} else if (!ec.util.isObj(OrderInfo.cust.custId)) {
				$.alert("提示", "客户信息为空");
			} else if (!ec.util.isObj(order.prodModify.choosedProdInfo)) {
				$.alert("提示", "产品信息为空");
			}
			});
		}
		
		// 办号卡
		if ("111" == OrderInfo.actionFlag) {
			for(var l=0;l<custQuery.q_custList.length;l++){
				if(custQuery.q_custList[l].custId == OrderInfo.cust.custId){
					OrderInfo.cust.contactInfos = custQuery.q_custList[l].contactInfos;
//					_choosedCustInfo.contactInfos = custQuery.q_custList[l].contactInfos;
				}
			}
//			params.method ='/app/order/broadband/prepare';
//			params.actionFlag = 112;
//			common.callOrderServer(OrderInfo.staff, OrderInfo.cust, order.prodModify.choosedProdInfo, params);
//			return;
			order.broadband.showCust();
			$("#sd_tab-box").show();
			$("#cust").show();
		}
		
		if("1" != OrderInfo.actionFlag && "13" != OrderInfo.actionFlag && "14" != OrderInfo.actionFlag){
			$("#query-cust-btn").off("click").bind("click", function () {
			if (ec.util.isObj(OrderInfo.staff.staffId) && ec.util.isObj(OrderInfo.cust.custId) && ec.util.isObj(order.prodModify.choosedProdInfo)) {
				common.callOrderServer(OrderInfo.staff, OrderInfo.cust, order.prodModify.choosedProdInfo, params);
			} else if (!ec.util.isObj(OrderInfo.staff.staffId)) {
				$.alert("提示", "员工信息为空");
			} else if (!ec.util.isObj(OrderInfo.cust.custId)) {
				$.alert("提示", "客户信息为空");
			} else if (!ec.util.isObj(order.prodModify.choosedProdInfo)) {
				$.alert("提示", "产品信息为空");
			}
			});
		}
		
	};
	
	return {
		goQueryCust:_goQueryCust,
		custidentidiesTypeCdChoose:_custidentidiesTypeCdChoose,
		queryCust:_queryCust,
		custCreat:_custCreat,
		q_custList:_q_custList,
		showCustAuth:_showCustAuth,
		changeTab:_changeTab,
		productPwdAuth:_productPwdAuth,
		smsResend:_smsResend,
		smsvalid:_smsvalid,
		jumpAuth:_jumpAuth,
		identityTypeAuth:_identityTypeAuth,
		smsvalid:_smsvalid,
		saveAuthRecord:_saveAuthRecord,
		queryCustNext:_queryCustNext
	};	
})();
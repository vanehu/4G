/**
 * 客户资料管理
 */
CommonUtils.regNamespace("order", "cust");

order.cust = (function(){
	
	var _choosedCustInfo = {};
	var createCustInfo = {};
	var custInfo = null;
	var authFlag = null;
	var _fromProvFlag = "0"; //省份甩单标志
	var _provIsale = null; //省份isale流水号
	var g_query_cust_infos = [];
	//客户鉴权跳转权限
	var _jumpAuthflag="";
	//客户属性
	var _partyProfiles =[];
	//客户属性分页列表
	var _profileTabLists =[];
	var _tmpChooseUserInfo = {};
	var _queryForChooseUser = false;
	
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
					if(response.data.indexOf("false") >=0) {
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
					//window.localStorage.setItem("OrderInfo.cust",JSON.stringify(OrderInfo.cust));
					if(!order.cust.queryForChooseUser){
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
		}).ketchup({bindElement:"custAuthbtn"});
		//身份证鉴权
		$('#custAuthFormID').bind('formIsValid', function(event, form) {
			var param = _choosedCustInfo;
            param.pCustIdentityCd = $("#p_cust_identityCd").val();
			param.identityNum =base64encode($.trim($("#authIDTD").val()));
			param.custId = _choosedCustInfo.custId;
			param.authFlag=authFlag;
			$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},"done" : function(response){
					if (response.code == -2) {
						return;
					}
					if(response.data.indexOf("false") >=0) {
						$.alert("提示","抱歉，您输入的身份证号有误，请重新输入。");
						return;
					}
					//判断能否转为json，可以的话返回的就是错误信息
					try {
						var errorData = $.parseJSON(response.data);
						$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack,"error");
						return;
					} catch(e){

					}
					if(!order.cust.queryForChooseUser){
						custInfo = param;
						OrderInfo.boCusts.prodId=-1;
						OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
						OrderInfo.boCusts.partyProductRelaRoleCd="0";
						OrderInfo.boCusts.state="ADD";
						OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;

					//window.localStorage.setItem("OrderInfo.cust",JSON.stringify(OrderInfo.cust));
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
		}).ketchup({bindElement:"custAuthbtnID"});

		$("#useraddclose").off("click").on("click",function(event){
			easyDialog.close();
		});
		//重置
		$("#custresetBtn").off("click").on("click",function(event){
			if($.ketchup)
				$.ketchup.hideAllErrorContainer($("#custCreateForm"));
			$("#btncustreset").click();
			
		});
		
		
	};
	//客户类型选择事件
	var _partyTypeCdChoose = function(scope,id) {
		var partyTypeCd=$(scope).val();
		//客户类型关联证件类型下拉框
		$("#"+id).empty();
		_certTypeByPartyType(partyTypeCd,id);
		//创建客户证件类型选择事件
		_identidiesTypeCdChoose($("#"+id).children(":first-child"),"cCustIdCard");
		//创建客户确认按钮
		_custcreateButton();

	};
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd,id){
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
						//去除重复的证件类型编码
						var uniData = [];
						for(var i=0;i<data.length;i++){
							var unique = true;
							var certTypeCd = data[i].certTypeCd;
							for(var j=0;j<uniData.length;j++){
								unique = unique && data[i].certTypeCd != uniData[j].certTypeCd;
								if(!unique){
									break;
								}
							}
							if ("p_cust_identityCd" == id) {
								uniData.push(data[i]);
							} else {
								//只有定义的渠道类型新建客户的时候可以选择非身份证类型,其他的渠道类型只能选择身份证类型。
								var isAllowChannelType = false;
								if (OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.ZQZXDL || OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.GZZXDL
									|| OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.HYKHZXDL || OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.SYKHZXDL
									|| OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.XYKHZXDL || OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.GZZXJL
									|| OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.ZYOUT || OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.ZYINGT
									|| OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.WBT) { // || _partyTypeCd != "1" //新建政企客户时同样有这个限制
									isAllowChannelType = true;
								}
								if (!isAllowChannelType && certTypeCd == "1") {
									isAllowChannelType = true;
								}
								if (unique && isAllowChannelType) {
									uniData.push(data[i]);
								}
							}
						}
						
						for(var i=0;i<uniData.length;i++){
							var certTypedate = uniData[i];
							$("#"+id).append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
						}
						//屏蔽身份证
						if(id=="identidiesTypeCd" && OrderInfo.staff.idType=="OFF")
						{
							$("#"+id+" option[value='1']").remove();
							$("#readCertBtnCreate").hide();
						}
					}
				}
	};
	//客户定位证件类型选择事件
	var _custidentidiesTypeCdChoose = function(scope,id) {
		// 非接入号隐藏产品类别选择
		$("#prodTypeCd").hide();
		$("#"+id).val("");
		$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9]/ig,'')");
		var identidiesTypeCd=$(scope).val();
		$("#"+id).attr("maxlength","100");
		if(identidiesTypeCd==-1){
			if ("ON" == CacheData.getIntOptSwitch()) {
				$("#prodTypeCd").show();
			}
			$("#"+id).attr("placeHolder","请输入接入号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写接入号码) on(keyup)");
		}else if (identidiesTypeCd==1){
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
			$("#isAppointNum").attr("checked",false);
		}
		if(id == 'p_cust_identityNum_choose'){
			_bindCustQueryForChoose();
		} else {
			_custLookforButton();
		}
		
		//如果是身份证，则禁止输入，否则启用输入控件
//		var isID = identidiesTypeCd==1;
//		var isIdTypeOff = OrderInfo.staff.idType=="OFF";
//		$('#p_cust_identityNum').attr("disabled",isID&&(!isIdTypeOff));
	};
	//创建客户证件类型选择事件
	var _identidiesTypeCdChoose = function(scope,id) {
		$("#"+id).val("");
		$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9]/ig,'')");
		var identidiesTypeCd=$(scope).val();
		$("#"+id).attr("maxlength","100");
		if(identidiesTypeCd==1){
			$("#"+id).attr("placeHolder","请输入合法身份证号码");
			$("#"+id).attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
		    $("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9\u4e00-\u9fa5]/ig,'')");
			$("#"+id).attr("placeHolder","请输入合法军官证");
			$("#"+id).attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			$("#"+id).attr("placeHolder","请输入合法护照");
			$("#"+id).attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else if(identidiesTypeCd==15) {
			$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9-]/ig,'')");
			$("#"+id).attr("placeHolder","请输入合法证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
			$("#"+id).attr("maxlength","20");
		}else{
			$("#"+id).attr("placeHolder","请输入合法证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		_custcreateButton();
		
		//如果是身份证，则禁止输入，否则启用输入控件
		var isID = identidiesTypeCd==1;
		var isIdTypeOff = OrderInfo.staff.idType=="OFF";
		$('#cCustIdCard').attr("disabled",isID&&(!isIdTypeOff));
		$('#cCustName').attr("disabled",isID&&(!isIdTypeOff));
		$('#cAddressStr').attr("disabled",isID&&(!isIdTypeOff));
	};
	 var _custLookforButton = function() {
	//客户定位查询按钮
	$('#custQueryFirstForm').off().bind('formIsValid', function(event, form) {
		var url=contextPath+"/order/createorderlonger";
		var response = $.callServiceAsJson(url, {});
		if(response.code==0){
			OrderInfo.custorderlonger=response.data;
		}
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

		//省份甩单定位客户不需要进行客户鉴权
		if(order.cust.fromProvFlag == "1" || (identityCd!=-1 && CONST.getAppDesc()!=0)){
			identityCd=$("#p_cust_identityCd").val();
			authFlag="1";
		}else{
			//4G所有证件类型定位都需要客户鉴权
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
		//lte进行受理地区市级验证
		if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
			$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
			return;
		}
		var param = {
				"acctNbr":acctNbr,
				"identityCd":identityCd,
				"identityNum":identityNum,
				"partyName":"",
				"custQueryType":$("#custQueryType").val(),
				"diffPlace":diffPlace,
				"areaId" : areaId,
				"queryType" :queryType,
				"queryTypeValue":queryTypeValue,
				"identidies_type":$("#p_cust_identityCd  option:selected").text()
		};
		// 如果是接入号，且开关打开，则添加产品大类字段
		if ($("#p_cust_identityCd").val() == -1 && "ON" == CacheData.getIntOptSwitch()) {
			param.prodClass = $("#prodTypeCd").val();
		}
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
	    	var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}
			_checkIdentity();
	     }).ketchup({bindElement:"createcustsussbtn"});
    };
	//客户查询列表
	var _queryCallBack = function(response) {
		if(response.data.indexOf("showVerificationcode") >=0) {
			$("#vali_code_input").val("");
			$('#validatecodeImg').css({"width":"80px","height":"32px"}).attr('src',contextPath+'/validatecode/codeimg.jpg?' + Math.floor(Math.random()*100)).fadeIn();
			easyDialog.open({
				container : 'Verificationcode_div'
			});
			return;
		}
		if(response.data.indexOf("false") >=0) {
			$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
			return;
		}
		var content$ = $("#custList");
		content$.html(response.data).show();
		$(".userclose").off("click").on("click",function(event) {
			authFlag="";
			$(".usersearchcon").hide();
			$("#custListOverlay").hide();
		});
		if($("#custListTable").attr("custInfoSize")=="1"){
			$(".usersearchcon").hide();
			$("#custListOverlay").hide();
		}
		$("#custListOverlay").show();
	};
	
	// 客户重新定位
	var _custReset = function() {
		//填单页面
		if((0!=OrderInfo.order.step)||(0==OrderInfo.order.step&&OrderInfo.actionFlag==2)){
			window.location.reload();
		}
		if($("#subPage").val()=="number"){
			window.location.reload();
		}
		$("#custQryDiv").show();
		$("#custInfo").hide();
		$("#custListOverlay").hide();
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
				
				//window.localStorage.setItem("OrderInfo.cust",JSON.stringify(OrderInfo.cust));
				if(!order.cust.queryForChooseUser){
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
	};
	
	var _jumpAuth = function() {
		if(order.cust.jumpAuthflag!="0"){
			$.alert("提示","没有跳过校验权限！");
			return;
		}
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
				
				//window.localStorage.setItem("OrderInfo.cust",JSON.stringify(OrderInfo.cust));
				if(!order.cust.queryForChooseUser){
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
			segmentName :$(scope).attr("segmentName"),
			custFlag :$(scope).attr("custFlag"),
			vipLevel :$(scope).attr("vipLevel"),
			vipLevelName :$(scope).attr("vipLevelName")
		};
		// 判断是否是政企客户
		var isGovCust = false;
		for (var i = 0; i <= CacheData.getGovCertType().length; i ++) {
			if (_choosedCustInfo.identityCd == CacheData.getGovCertType()[i]) {
				isGovCust = true;
				break;
			}
		}
		if(order.cust.queryForChooseUser && isGovCust){
			$.alert('提示','使用人必须是公众客户，请重新定位。');
			return false;
		}
		if(authFlag=="0"){
			//TODO init view 
			if(order.cust.authType == '00'){
				$("#custAuthTypeName").html("客户密码：");
			} else {
				$("#custAuthTypeName").html("产品密码：");
			}
			var pCustIdentityCd = $("#p_cust_identityCd").val();
			if("1"==pCustIdentityCd){
//				var isIdTypeOff = OrderInfo.staff.idType=="OFF";
//				$('#authIDTD').attr("disabled",!isIdTypeOff);//身份鉴权的身份证在读卡时被禁用，此处根据开关控制是否允许输入
				easyDialog.open({
					container:'authID',
					callback : function(){
						order.cust.queryForChooseUser = false; //关闭弹出框时重置标识位
					}
				});
			}else{
				easyDialog.open({
					container : 'auth',
					callback : function(){
						order.cust.queryForChooseUser = false; //关闭弹出框时重置标识位
					}
				});
			}
			if(order.cust.jumpAuthflag=="0"){
				//$("#jumpAuth").off('click').on('click', function(){
				//	order.cust.jumpAuth();
				//});
				$("#jumpAuth").show();
				$("#jumpAuthID").show();
			}
			$("#authClose").off("click").on("click",function(event){
				easyDialog.close();
				$("#authPassword").val("");
			});
			$("#authIDClose").off("click").on("click",function(event){
				easyDialog.close();
				$("#authIDTD").val("");
			});
		} else{
			_custAuth(scope);
		}
	};
	//创键客户
	var _userAddClosed = function() {
		$("#cCustName").val("");
		$("#cCustIdCard").val("");
		$("#cAddressStr").val("");
		$("#cMailAddressStr").val("");
		$("#discontactName").val("");
		$("#dishomePhone").val("");
		$("#disofficePhone").val("");
		$("#dismobilePhone").val("");
		authFlag="";
		if($.ketchup)
			$.ketchup.hideAllErrorContainer($("#custCreateForm"));
	};
	var _showCustCreate = function(scope) {
		var areaId=$("#p_cust_areaId").val();
		if(areaId.indexOf("0000")>0){
			$.alert("提示","前页受理地区为省级地区无法进行创建,请先选择市级地区！");
			return;
		}
		tabProfileFlag="1";
		_partyTypeCdChoose($("#partyTypeCd").children(":first-child"),"identidiesTypeCd");
		_setSelectVal("identidiesTypeCd","1"); //默认证件类型使用“身份证”
		_identidiesTypeCdChoose($("#identidiesTypeCd  option:selected").length ?  $("#identidiesTypeCd  option:selected") : $("#identidiesTypeCd").children(":first-child"),"cCustIdCard");
		_custcreateButton();
		_spec_parm_show();
		$("#partyProfile").attr("style","display:none");
		easyDialog.open({
			container : 'user_add',
			callback : _userAddClosed
		});
	};
	var _setSelectVal = function(id,val){
		if($("#"+id+"  option:selected").val() != val){
			$("#"+id+"  option").each(function(){
				if($(this).val() == val){
					$(this).attr("selected","selected");
				} else {
					$(this).removeAttr("selected");
				}
			});
		}
	};
	//已订购业务
	var _btnQueryCustProd=function(curPage){
		//收集参数
		var param={};
		// 如果是接入号，且开关打开，则添加产品大类字段
		if ($("#p_cust_identityCd").val() == -1 && "ON" == CacheData.getIntOptSwitch()) {
			param.prodClass = $("#prodTypeCd").val();
		}
		if(_choosedCustInfo==null){
			param.custId="";
		}else{
		param.custId=_choosedCustInfo.custId;
		param.areaId =$("#area").attr("areaId");
		//	param.custId="123002382243";//need modify
		}
		if(document.getElementById("accNbrQuery")){
			param.acctNbr=$.trim($("#accNbrQuery").val());
			if(CONST.getAppDesc()==0){
				param.areaId=$("#p_cust_areaId").val();
			}
			
		} else if($("#isAppointNum").attr("checked")=="checked"){
			param.acctNbr=$.trim($("#p_cust_identityNum").val());
			if(CONST.getAppDesc()==0){
				param.areaId=$("#p_cust_areaId").val();
			}
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
		order.area.chooseAreaTree("order/prepare","p_cust_areaId_val","p_cust_areaId",3,function(areaid,areaCode,areaName){
			OrderInfo.staff.soAreaId =areaid;
			OrderInfo.staff.soAreaName=areaName;
			OrderInfo.staff.soAreaCode =areaCode;
			$("#order_prepare").show();
			$("#order_tab_panel_content").hide();
			$("#step1").hide();
			
		});
	};
	//定位客户选择地区，选择使用人
	var _chooseAreaForChooseUser = function(){
		order.area.chooseAreaTree("order/prepare","p_cust_areaId_val_choose","p_cust_areaId_choose",3,function(areaid,areaCode,areaName){
			OrderInfo.staff.soAreaId =areaid;
			OrderInfo.staff.soAreaName=areaName;
			OrderInfo.staff.soAreaCode =areaCode;
//			$("#order_prepare").show();
//			$("#order_tab_panel_content").hide();
//			$("#step1").hide();
			
		});
	};
	//客户信息查询户选择地区
	var _preQueryCustChooseArea = function(){
		order.area.chooseAreaTreeManger("cust/preQueryCust","p_areaId_val","p_areaId",3);
	};
	//异地定位客户选择地区
	var _chooseAllArea = function(){
		order.area.chooseAreaTreeAll("p_cust_areaId_val","p_cust_areaId",3,"limitProvince");
	};
	//协销人地区
	var _chooseStaffArea = function(){
		order.area.chooseAreaTreeCurrent("p_staff_areaId_val","p_staff_areaId",3,"limitProvince",$("#p_staff_areaId").val().substring(0,3)+"0000");
	//	order.area.chooseAreaTreeAll("p_staff_areaId_val","p_staff_areaId",3,"limitProvince");
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
//		var param = {"attrSpecCode":"PTY-0004"} ;
//		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
//			"done" : function(response){
//				if(response.code==0){
//					var data = response.data ;
//					if(data!=undefined && data.length>0){
//						for(var i=0;i<data.length;i++){
//							var busiStatus = data[i];
//							$("#p_cust_identityCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
//							
//						}
//					}
//				}else if(response.code==-2){
//					$.alertM(response.data);
//					return;
//				}else{
//					$.alert("提示","调用主数据接口失败！");
//					return;
//				}
//			}
//		});
		_certTypeByPartyType("-1","p_cust_identityCd"); //客户定位也使用根据客户类型查询证件类型接口，p_cust_identityCd=-1表示查询所有已关联的证件类型
		_certTypeByPartyType("-1","p_cust_identityCd_choose"); //初始化证件类型，p_cust_identityCd=-1表示查询所有已关联的证件类型
		_custidentidiesTypeCdChoose($("#p_cust_identityCd").children(":first-child"),"p_cust_identityNum");
		_checkAutoCustQry(); //省份甩单，自动定位客户
		//根据身份证开关隐藏读卡按钮
		if(OrderInfo.staff.idType=="OFF")
		{
			$("#readCertBtn").hide();
			$("#readCertBtnID").hide();
		}
	};
	//使用带入的客户信息自动定位客户
	var _checkAutoCustQry = function(){
		if($("#fromProvFlag").length && $("#fromProvFlag").val() == "1"){
			order.cust.fromProvFlag = "1";
			order.cust.provIsale = $("#provIsale").val();
			$("#p_cust_areaId_val").val("");
			$("#p_cust_areaId").val($("#provAreaId").val());
			$("#p_cust_identityCd").val($("#provIdentityCd").val());
			$("#p_cust_identityNum").val($("#provIdentityNum").val());
			if($("#provIdentityCd").val()!=-1){
				$("#isAppointNum").attr("checked",false);
			}
			$("#usersearchbtn").click();
		} else {
			order.cust.fromProvFlag = "0";
			order.cust.provIsale = null;
		}
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
				$.alert("提示","请求可能发生异常，请稍后再试！");
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
				$.alert("提示","请求可能发生异常，请稍后再试！");
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
				_partyTypeCdChoose($("#cmPartyTypeCd").children(":first-child"),"cc_identidiesTypeCd");
				_identidiesTypeCdChoose($("#div_cm_identidiesType").children(":first-child"),"ccCustIdCard");
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
		//验证客户信息的长度（字符长度）--解决maxleng中中文只占一个字符导致后台数据库存储长度溢出
		var isLengthFlag = true; 
		$("#user_add  input").each(function(){
			var ascRegexp = /[^\x00-\xFF]/g;
			var length = $(this).attr("maxlength");
			var valueLength =  $(this).val().replace(ascRegexp, '..').length;
			if(valueLength>length){
				$.alert("提示",$(this).attr("id")+"字符超长！,请限制在"+length+"字符！(中文算两个字符！)");
				isLengthFlag = false;
				return false;
			}			
		});
		if(!isLengthFlag){
			return false;
		}
	createCustInfo = {
			cAreaId : OrderInfo.staff.soAreaId,// $("#p_ncust_areaId").val(),
			cAreaName : OrderInfo.staff.soAreaName,
			cCustName : $.trim($("#cCustName").val()),
			cCustIdCard :  $.trim($("#cCustIdCard").val()),
			cPartyTypeCd : $.trim($("#partyTypeCd  option:selected").val()), //($.trim($("#partyTypeCd  option:selected").val())==1) ? "1100":"1000",
			cPartyTypeName : ($.trim($("#partyTypeCd  option:selected").val())==1) ? "个人客户":"政企客户",
			cIdentidiesTypeCd : $.trim($("#identidiesTypeCd  option:selected").val()),
			cAddressStr :$.trim($("#cAddressStr").val()),
			cMailAddressStr :$.trim($("#cMailAddressStr").val())
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
	OrderInfo.boCustInfos.mailAddressStr=createCustInfo.cMailAddressStr;//通信地址
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
			if(response.data.indexOf("false") >=0) {
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
		if(!ec.util.isObj($.trim($("#identidiesTypeCd  option:selected").val()))){
			$.alert("提示","证件类型不能为空！","information");
			return;
		}
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var custName=$("#p_cust_areaId_val").val();
		createCustInfo = {
				cAreaId : areaId,
				cAreaName : custName,
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
	var _isAppointNum = function(identityCdId){
		identityCdId = identityCdId || 'p_cust_identityCd';
		if($("#"+identityCdId).val()!=-1){
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
	//返回按钮
	var _back = function(){
		$("#acctDetail").hide();
		$("#acctList").show();
	};
	//定位客户时读卡
	var _readCert = function() {
		var man = cert.readCert();
		if (man.resultFlag != 0){
			$.alert("提示", man.errorMsg);
			return;
		}
		$('#p_cust_identityCd').val(1);//身份证类型
		_custidentidiesTypeCdChoose($("#p_cust_identityCd option:selected"),"p_cust_identityNum");
		$('#p_cust_identityNum').val(man.resultContent.certNumber);
//		$('#p_cust_identityNum').attr("disabled",true);
		//查询
		$("#usersearchbtn").click();
	};
	//新建客户时读卡
	var _readCertWhenCreate = function() {
		var man = cert.readCert();
		if (man.resultFlag != 0){
			$.alert("提示", man.errorMsg);
			return;
		}
		$('#partyTypeCd').val(1);//个人
		_partyTypeCdChoose($("#partyTypeCd option:selected"),"identidiesTypeCd");
		$('#identidiesTypeCd').val(1);//身份证类型
		_identidiesTypeCdChoose($("#identidiesTypeCd option:selected"),"cCustIdCard");
		$('#cCustIdCard').val(man.resultContent.certNumber);//设置身份证号
		$('#cCustIdCard').attr("disabled",true);
		$('#cCustName').val(man.resultContent.partyName);//姓名
		$('#cCustName').attr("disabled",true);
		$('#cAddressStr').val(man.resultContent.certAddress);//地址
		$('#cAddressStr').attr("disabled",true);
	};
	//用户鉴权时读卡
	var _readCertWhenAuth = function() {
		var man = cert.readCert();
		if (man.resultFlag != 0){
			$.alert("提示", man.errorMsg);
			return;
		}
		$('#authIDTD').val(man.resultContent.certNumber);
//		$('#authIDTD').attr("disabled",true);
		
		$("#custAuthbtnID").click();
	};
	//绑定客户选择查询事件，使用人
	var _bindCustQueryForChoose = function(){
		$('#custQueryForChooseForm').off().bind('formIsValid', function(event, form) {
			var identityCd="";
			var idcard="";
			var diffPlace="";
			var acctNbr="";
			var identityNum="";
			var queryType="";
			var queryTypeValue="";
			identityCd=$("#p_cust_identityCd_choose").val();
			identityNum=$.trim($("#p_cust_identityNum_choose").val());
			authFlag="0"; //需要鉴权
			if(identityCd==-1){
				acctNbr=identityNum;
				identityNum="";
				identityCd="";
			}else if(identityCd=="acctCd"||identityCd=="custNumber"){
				acctNbr="";
				identityNum="";
				identityCd="";
				queryType=$("#p_cust_identityCd_choose").val();
				queryTypeValue=$.trim($("#p_cust_identityNum_choose").val());
			}
			diffPlace=$("#DiffPlaceFlag_choose").val();
			areaId=$("#p_cust_areaId_choose").val();
			//lte进行受理地区市级验证
			if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
				$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
				return;
			}
			var param = {
					"acctNbr":acctNbr,
					"identityCd":identityCd,
					"identityNum":identityNum,
					"partyName":"",
					"custQueryType":$("#custQueryType_choose").val(),
					"diffPlace":diffPlace,
					"areaId" : areaId,
					"queryType" :queryType,
					"queryTypeValue":queryTypeValue,
					"identidies_type":$("#p_cust_identityCd_choose  option:selected").text()
			};
			
			
			//JSON.stringify(param)
			//TODO 
			$.callServiceAsHtml(contextPath+"/cust/queryCust",param, {
				"before":function(){
					$.ecOverlay("<strong>正在查询中，请稍等...</strong>");
				},"always":function(){
					$.unecOverlay();
				},	
				"done" : function(response){
					if (response.code == -2) {
						return;
					}
					if(response.data.indexOf("false") >=0) {
						$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
						return;
					}
					
					order.cust.jumpAuthflag = $(response.data).find('#jumpAuthflag').val();
					order.cust.showCustAuth($(response.data).find('#custInfos'));
//					var content$ = $("#custList");
//					content$.html(response.data).show();
//					$(".userclose").off("click").on("click",function(event) {
//						authFlag="";
//						$(".usersearchcon").hide();
//					});
//					if($("#custListTable").attr("custInfoSize")=="1"){
//						$(".usersearchcon").hide();
//					}
				},
				"fail":function(response){
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				}
			});
		}).ketchup({bindElement:"userSearchForChooseBtn"});
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
		chooseStaffArea : _chooseStaffArea,
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
		linkSelectPlan:_linkSelectPlan,
		back :_back,
		readCert : _readCert,
		readCertWhenCreate : _readCertWhenCreate,
		readCertWhenAuth : _readCertWhenAuth,
		fromProvFlag : _fromProvFlag,
		provIsale : _provIsale,
		chooseAreaForChooseUser : _chooseAreaForChooseUser,
		certTypeByPartyType : _certTypeByPartyType,
		bindCustQueryForChoose : _bindCustQueryForChoose,
		tmpChooseUserInfo : _tmpChooseUserInfo,
		queryForChooseUser : _queryForChooseUser
	};
})();
$(function() {
   order.cust.form_valid_init();
   order.cust.initDic();
});
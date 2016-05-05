/**
 * 客户资料管理
 */
CommonUtils.regNamespace("order", "cust");

order.cust = (function(){
	var _choosedCustInfo={};
	//客户类型选择事件
	var _partyTypeCdChoose = function(scope,id) {
		var partyTypeCd=$(scope).val();	
		//客户类型关联证件类型下拉框
		$("#"+id).empty();
		_certTypeByPartyType(partyTypeCd,id);
		//创建客户证件类型选择事件
		//_identidiesTypeCdChoose($("#"+id).children(":first-child"),"cCustIdCard");
		//创建客户确认按钮
		//_custcreateButton();

	};
	
	//创建客户证件类型选择事件
	var _identidiesTypeCdChoose = function(scope,id) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==1){
			$("#"+id).attr("placeHolder","请输入合法身份证号码");
			$("#"+id).attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(blur)");
		}else if(identidiesTypeCd==2){
			$("#"+id).attr("placeHolder","请输入合法军官证");
			$("#"+id).attr("data-validate","validate(required:请准确填写军官证) on(blur)");
		}else if(identidiesTypeCd==3){
			$("#"+id).attr("placeHolder","请输入合法护照");
			$("#"+id).attr("data-validate","validate(required:请准确填写护照) on(blur)");
		}else{
			$("#"+id).attr("placeHolder","请输入合法证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
		}
		_custcreateButton();
		
		//启用读卡时禁用的控件
		$('#cCustIdCard').attr("disabled",false);
		$('#cCustName').attr("disabled",false);
		$('#cAddressStr').attr("disabled",false);
	};
	
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd,id){
		var _obj = $("#"+id);
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
						    //只有定义的渠道类型新建客户的时候可以选择非身份证类型,其他的渠道类型只能选择身份证类型。
							var isAllowChannelType = false;
							if(OrderInfo.staff.channelType==CONST.CHANNEL_TYPE_CD.ZQZXDL || OrderInfo.staff.channelType==CONST.CHANNEL_TYPE_CD.GZZXDL
									|| OrderInfo.staff.channelType==CONST.CHANNEL_TYPE_CD.HYKHZXDL || OrderInfo.staff.channelType==CONST.CHANNEL_TYPE_CD.SYKHZXDL
									|| OrderInfo.staff.channelType==CONST.CHANNEL_TYPE_CD.XYKHZXDL || OrderInfo.staff.channelType==CONST.CHANNEL_TYPE_CD.GZZXJL
									|| OrderInfo.staff.channelType==CONST.CHANNEL_TYPE_CD.ZYOUT || OrderInfo.staff.channelType==CONST.CHANNEL_TYPE_CD.ZYINGT
									|| OrderInfo.staff.channelType==CONST.CHANNEL_TYPE_CD.WBT || _partyTypeCd != "1" ){
								isAllowChannelType = true;
							}
							if(!isAllowChannelType && certTypeCd == "1"){
								isAllowChannelType= true;
							}
							if(unique && isAllowChannelType){
								uniData.push(data[i]);
							}
						}
						
						for(var i=0;i<uniData.length;i++){
							var certTypedate = uniData[i];
							_obj.append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
						}
						//jquery mobile 需要刷新才能生效
						_obj.selectmenu().selectmenu('refresh');
						if(id=='identidiesTypeCd'){
							//创建客户证件类型选择事件
							_identidiesTypeCdChoose($("#"+id).children(":first-child"),"cCustIdCard");
						}
					}
				}
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
    
  //验证证件号码是否存在
	var _checkIdentity = function() {
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
			cPartyTypeCd : $.trim($("#partyTypeCd option:selected").val()),
			cIdentidiesTypeCd : $.trim($("#identidiesTypeCd option:selected").val()),
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
		var url=contextPath+"/pad/cust/checkIdentity";
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
	//客户鉴权--证件类型
	var _identityTypeAuth=function(){
		
		var param = _choosedCustInfo;
		param.validateType="1";
		param.identityNum =$.trim($("#idCardNumber2").val());
		if(!ec.util.isObj(param.identityNum)){
			$.alert("提示","证件号码不能为空！");
			return;
		}
		param.accessNumber=OrderInfo.acctNbr;
		param.identityCd=OrderInfo.cust.identityCd;
		param.areaId=OrderInfo.cust.areaId;
		param.custId=OrderInfo.cust.custId;
		var recordParam={};
		recordParam.validateType="1";
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/token/pad/cust/custAuthSub",param);
		$.unecOverlay();
		//_saveAuthRecordFail(recordParam);  错误
		// _saveAuthRecordSuccess(recordParam);成功
		
		if(response.data.code=="0"){
			//成功
			OrderInfo.authRecord.validateType="3";
			OrderInfo.authRecord.resultCode="0";
			_saveAuthRecordSuccess(recordParam);
			_goService();
			
		}else{
			//错误
			_saveAuthRecordFail(recordParam);
			$.alertM(response.data);
		}
	};
	//客户鉴权--产品密码
	var _productPwdAuth=function(){

		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#authPassword2").val());
		if(!ec.util.isObj(param.prodPwd)){
			$.alert("提示","产品密码不能为空！");
			return;
		}
		param.validateType = "3";
		param.accessNumber=OrderInfo.acctNbr;
		param.identityCd=OrderInfo.cust.identityCd;
		param.idCardNumber=OrderInfo.cust.idCardNumber;
		param.areaId=OrderInfo.cust.areaId;
		param.custId=OrderInfo.cust.custId;
		
		var recordParam={};
		recordParam.validateType="3";
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/token/pad/cust/custAuthSub",param);
		$.unecOverlay();
		//_saveAuthRecordFail(recordParam);  错误
		// _saveAuthRecordSuccess(recordParam);成功
		
		if(response.data.isValidate=="true"){
			//成功
			OrderInfo.authRecord.validateType="3";
			OrderInfo.authRecord.resultCode="0";
			_saveAuthRecordSuccess(recordParam);
			_goService();
			
			
		}else{
			//错误
			_saveAuthRecordFail(recordParam);
			$.alertM(response.data.message);
		}
		
	};
	

	//多种鉴权方式的tab页切换
	var _changeTab = function (tabId) {
		$.each($("#auth_tab"+tabId).parent().find("li"),function(){
			$(this).removeClass("setcon");
		});
		$("#auth_tab"+tabId).addClass("setcon");
		$.each($("#contents div"),function(){
			$(this).hide();
		});
		$("#content"+tabId).show();
		if (tabId == 2) {
			if (_choosedCustInfo.identityCd == 1) {
				$("#idCardNumber2").attr("disabled", "disabled");
			} else {
				$("#idCardNumber2").removeAttr("disabled");
			}
		}
	};
	//短信发送
	var _smsResend = function () {
		var param = {
			"pageIndex": 1,
			"pageSize": 10,
			"phone":OrderInfo.acctNbr
		};
		$.callServiceAsJson(contextPath + "/token/pad/staffMgr/reSendSub", param, {
			"done": function (response) {
				if (response.code == 0) {
					$.alert("提示", "验证码发送成功，请及时输入验证.");
				} else {
					$.alert("提示", "验证码发送失败，请重新发送.");
				}
				;
			}
		});
	};
	//短信验证
	var _smsvalid=function(){
		var params="smspwd="+$("#smspwd2").val();
		if(!ec.util.isObj($("#smspwd2").val())){
			$.alert("提示","验证码不能为空！");
			return;
		}
		var param = _choosedCustInfo;
		var recordParam={};
		recordParam.validateType="2";
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;


		$.callServiceAsJson(contextPath+"/passwordMgr/smsValid", params, {
			"before":function(){
				$.ecOverlay("<strong>验证短信随机码中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				if(response.code==0){
					OrderInfo.authRecord.validateType="2";
					OrderInfo.authRecord.resultCode="0";
					_saveAuthRecordSuccess(recordParam);
					_goService();
				}else{
					$.alert("提示",response.data);
					_saveAuthRecordFail(recordParam);
				}
			},
			"fail" : function(response){
				_saveAuthRecordFail(recordParam);
			},
			"always":function(){
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
	//鉴权方式日志记录成功
	var _saveAuthRecordSuccess=function(param){
		param.resultCode = "0";
		_saveAuthRecord(param);
	};
	//鉴权方式日志记录失败
	var _saveAuthRecordFail=function(param){
		param.resultCode = "1";
		_saveAuthRecord(param);
	};

	//保存静态客户信息
	var _createCustConfirm = function() {
		createCustInfo = {
			cAreaId 			: OrderInfo.staff.soAreaId,
			cAreaName 			: OrderInfo.staff.soAreaName,
			cCustName 			: $.trim($("#cCustName").val()),
			cCustIdCard 		: $.trim($("#cCustIdCard").val()),
			cPartyTypeCd 		: $.trim($("#partyTypeCd  option:selected").val()),
			cPartyTypeName 		: ($.trim($("#partyTypeCd  option:selected").val())==1) ? "个人客户":"政企客户",
			cIdentidiesTypeCd 	: $.trim($("#identidiesTypeCd  option:selected").val()),
			cAddressStr 		: $.trim($("#cAddressStr").val()),
			cMailAddressStr 	: $.trim($("#cMailAddressStr").val())
		};
		var _boPartyContactInfo = {
			contactAddress 	: $.trim($("#contactAddress").val()),//参与人的联系地址
	        contactDesc 	: $.trim($("#contactDesc").val()),//参与人联系详细信息
	        contactEmployer : $.trim($("#contactEmployer").val()),//参与人的联系单位
	        contactGender  	: $.trim($("#contactGender").val()),//参与人联系人的性别
	        contactId 		: $.trim($("#contactId").val()),//参与人联系信息的唯一标识
	        contactName 	: $.trim($("#contactName").val()),//参与人的联系人名称
	        contactType 	: $.trim($("#contactType").val()),//联系人类型
	        eMail 			: $.trim($("#eMail").val()),//参与人的eMail地址
	        fax 			: $.trim($("#fax").val()),//传真号
	        headFlag 		: $.trim($("#headFlag  option:selected").val()),//是否首选联系人
	        homePhone 		: $.trim($("#homePhone").val()),//参与人的家庭联系电话
	        mobilePhone 	: $.trim($("#mobilePhone").val()),//参与人的移动电话号码
	        officePhone 	: $.trim($("#officePhone").val()),//参与人办公室的电话号码
	        postAddress 	: $.trim($("#postAddress").val()),//参与人的邮件地址
	        postcode 		: $.trim($("#postcode").val()),//参与人联系地址的邮政编码
	        staffId 		: OrderInfo.staff.staffId,//员工ID
	        state 			: "ADD",//状态
	        statusCd 		: "100001"//订单状态
		};
		OrderInfo.boCustInfos.name					= createCustInfo.cCustName;//客户名称
		OrderInfo.boCustInfos.areaId				= createCustInfo.cAreaId;//客户地区
		OrderInfo.boCustInfos.partyTypeCd			= createCustInfo.cPartyTypeCd;//客户类型
		OrderInfo.boCustInfos.defaultIdType			= createCustInfo.cIdentidiesTypeCd;//证件类型
		OrderInfo.boCustInfos.addressStr			= createCustInfo.cAddressStr;//客户地址
		OrderInfo.boCustInfos.mailAddressStr		= createCustInfo.cMailAddressStr;//通信地址
		OrderInfo.boCustIdentities.identidiesTypeCd	= createCustInfo.cIdentidiesTypeCd;//证件类型
		OrderInfo.boCustIdentities.identityNum		= createCustInfo.cCustIdCard;//证件号码
		//boPartyContactInfo
		OrderInfo.boPartyContactInfo.contactAddress	=_boPartyContactInfo.contactAddress,//参与人的联系地址
		OrderInfo.boPartyContactInfo.contactDesc 	=_boPartyContactInfo.contactDesc,//参与人联系详细信息
		OrderInfo.boPartyContactInfo.contactEmployer=_boPartyContactInfo.contactEmployer,//参与人的联系单位
		OrderInfo.boPartyContactInfo.contactGender  =_boPartyContactInfo.contactGender,//参与人联系人的性别
		OrderInfo.boPartyContactInfo.contactId 		=_boPartyContactInfo.contactId,//参与人联系信息的唯一标识
		OrderInfo.boPartyContactInfo.contactName 	=_boPartyContactInfo.contactName,//参与人的联系人名称
		OrderInfo.boPartyContactInfo.contactType 	=_boPartyContactInfo.contactType,//联系人类型
		OrderInfo.boPartyContactInfo.eMail 			=_boPartyContactInfo.eMail,//参与人的eMail地址
		OrderInfo.boPartyContactInfo.fax 			=_boPartyContactInfo.fax,//传真号
		OrderInfo.boPartyContactInfo.headFlag 		=_boPartyContactInfo.headFlag,//是否首选联系人
		OrderInfo.boPartyContactInfo.homePhone 		=_boPartyContactInfo.homePhone,//参与人的家庭联系电话
		OrderInfo.boPartyContactInfo.mobilePhone 	=_boPartyContactInfo.mobilePhone,//参与人的移动电话号码
		OrderInfo.boPartyContactInfo.officePhone 	=_boPartyContactInfo.officePhone,//参与人办公室的电话号码
		OrderInfo.boPartyContactInfo.postAddress 	=_boPartyContactInfo.postAddress,//参与人的邮件地址
		OrderInfo.boPartyContactInfo.postcode		=_boPartyContactInfo.postcode,//参与人联系地址的邮政编码
		OrderInfo.boPartyContactInfo.staffId 		=_boPartyContactInfo.staffId,//员工ID
		OrderInfo.boPartyContactInfo.state 			=_boPartyContactInfo.state,//状态
		OrderInfo.boPartyContactInfo.statusCd 		=_boPartyContactInfo.statusCd//订单状态

		OrderInfo.cust = {
			custId		: -1,	
			partyName 	: createCustInfo.cCustName,
			areaId		: createCustInfo.cAreaId
		};
		//客户属性
		OrderInfo.boCustProfiles=[];
		//客户属性节点
		for ( var i = 0; i < _partyProfiles.length; i++) {
			var partyProfiles = _partyProfiles[i];
			var profileValue  = $("#"+partyProfiles.attrId).val();
			if(""==profileValue||undefined==profileValue){
				profileValue==$("#"+partyProfiles.attrId+"option:selected").val();
			}
			var partyProfiles = {
				partyProfileCatgCd: partyProfiles.attrId,
				profileValue: profileValue,
                state: "ADD"
			};
			if(""!=profileValue && profileValue!=undefined){
				OrderInfo.boCustProfiles.push(partyProfiles);
			}
		}
		$("#div_cust_create").popup("close");
		var param = {};
		param.prodPwd 		= "";
		param.accessNumber	="";
		param.authFlag		="1";
		authFlag			="";
		param.identityCd	=createCustInfo.cIdentidiesTypeCd;
		param.idCardNumber	=createCustInfo.cCustIdCard;
		param.partyName		=createCustInfo.cCustName;
		param.areaId		=createCustInfo.cAreaId;
		param.areaName		=createCustInfo.cAreaName;
		param.segmentName	=createCustInfo.cPartyTypeName;
		param.identityName	=$("#identidiesTypeCd option:selected").text();
		$.callServiceAsHtml(contextPath+"/pad/cust/custAuth",param,{
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
	//客户鉴权--证件类型
	var _identityTypeAuth=function(){
		if(!order.cust.isSelfChannel()){
			  $("#idCardNumber2").attr("readonly","readonly");
				 $.alert("提示","请到电信自有营业厅办理业务");
				 return ;
	       }
		var param = _choosedCustInfo;
		param.validateType="1";
		param.identityNum = $.trim($("#idCardNumber2").val());
		if(!ec.util.isObj(param.identityNum)){
			$.alert("提示","证件号码不能为空！");
			return;
		}
		param.accessNumber=OrderInfo.acctNbr;
		param.identityCd=OrderInfo.cust.identityCd;
		param.areaId=OrderInfo.cust.areaId;
		param.custId=OrderInfo.cust.custId;

		var recordParam={};
		recordParam.validateType="1";
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/token/pad/cust/custAuthSub",param);
		$.unecOverlay();
		//_saveAuthRecordFail(recordParam);  错误
		// _saveAuthRecordSuccess(recordParam);成功
		
		if(response.data.code=="0"){
			//成功
			OrderInfo.authRecord.validateType="1";
			OrderInfo.authRecord.resultCode="0";
			_saveAuthRecordSuccess(recordParam);
			_goService();
			
		}else{
			//错误
			_saveAuthRecordFail(recordParam);
			if(response.code=="-2"){
				$.alertM(response.data);
			}
			else{
				$.alertM(response.data);
			}
			
		}
	};
	//客户鉴权--产品密码
	var _productPwdAuth=function(){

		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#authPassword2").val());
		if(!ec.util.isObj(param.prodPwd)){
			$.alert("提示","产品密码不能为空！");
			return;
		}
		param.validateType = "3";
		param.accessNumber=OrderInfo.acctNbr;
		param.identityCd=OrderInfo.cust.identityCd;
		param.idCardNumber=OrderInfo.cust.idCardNumber;
		param.areaId=OrderInfo.cust.areaId;
		param.custId=OrderInfo.cust.custId;
		
		var recordParam={};
		recordParam.validateType="3";
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/token/pad/cust/custAuthSub",param);
		$.unecOverlay();
		//_saveAuthRecordFail(recordParam);  错误
		// _saveAuthRecordSuccess(recordParam);成功
		
		if(response.data.isValidate=="true"){
			//成功
			OrderInfo.authRecord.validateType="3";
			OrderInfo.authRecord.resultCode="0";
			_saveAuthRecordSuccess(recordParam);
			_goService();
			
			
		}else{
			//错误
			_saveAuthRecordFail(recordParam);
			if(response.code=="-2"){
				$.alertM(response.data);
			}
			else{
				$.alertM(response.data);
			}
			
		}
		
	};
	//跳过鉴权
	var _jumpAuth2 = function() {
		var recordParam={};
		recordParam.validateType="4";
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		//记录到日志里
		order.cust.saveAuthRecordFail(recordParam);
		OrderInfo.authRecord.validateType="4";
		OrderInfo.authRecord.resultCode="0";
		if (OrderInfo.authRecord.resultCode == "0") {
		//	
			$(".title").css('display','none');
			$("#tab-box").css('display','none'); 
			//如果是套餐变更
			if(OrderInfo.actionFlag==2){
				if(OrderInfo.provinceInfo.prodOfferId!="" && OrderInfo.provinceInfo.prodOfferId!=null && OrderInfo.provinceInfo.prodOfferId!="null"){
					order.uiCusts.offerinit(OrderInfo.provinceInfo.prodOfferId,null);
				}
				else{
					order.uiCusts.initSub();	
				}
				
			}
			//主副卡
			else if(OrderInfo.actionFlag==6){
	
				order.memberChange.showOfferCfgDialog();
			}
			//可选包
			else if(OrderInfo.actionFlag==3){
	
				order.prodModify.orderAttachOffer();
			}
			else if(OrderInfo.actionFlag==1){
				url=contextPath+"/pad/order/prodoffer/prepare.html";
				$("#auth2").css('display','none'); 
				order.prepare.commonTab(url,"order_tab_panel_offer");
			}
			OrderInfo.authRecord.resultCode = "";
			OrderInfo.authRecord.validateType = "";
		}
	};

	//多种鉴权方式的tab页切换
	var _changeTab = function (tabId) {
		$.each($("#auth_tab"+tabId).parent().find("li"),function(){
			$(this).removeClass("setcon");
		});
		$("#auth_tab"+tabId).addClass("setcon");
		$.each($("#contents div"),function(){
			$(this).hide();
		});
		$("#content"+tabId).show();
		if (tabId == 2) {
			if (_choosedCustInfo.identityCd == 1) {
				$("#idCardNumber2").attr("disabled", "disabled");
			} else {
				$("#idCardNumber2").removeAttr("disabled");
			}
		}
	};
	
	//短信验证
	var _smsvalid=function(){
		var params="smspwd="+$("#smspwd2").val();
		if(!ec.util.isObj($("#smspwd2").val())){
			$.alert("提示","验证码不能为空！");
			return;
		}
		var param = _choosedCustInfo;
		var recordParam={};
		recordParam.validateType="2";
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;


		$.callServiceAsJson(contextPath+"/passwordMgr/smsValid", params, {
			"before":function(){
				$.ecOverlay("<strong>验证短信随机码中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				if(response.code==0){
					OrderInfo.authRecord.validateType="2";
					OrderInfo.authRecord.resultCode="0";
					_saveAuthRecordSuccess(recordParam);
					_goService();
				}else{
					$.alert("提示",response.data);
					_saveAuthRecordFail(recordParam);
				}
			},
			"fail" : function(response){
				_saveAuthRecordFail(recordParam);
			},
			"always":function(){
				$.unecOverlay();
			}
		});
	};
	var _goService=function (){
	
		$(".title").css('display','none');
		$("#tab-box").css('display','none'); 
			//如果是套餐变更
			if(OrderInfo.actionFlag==2){
				if(OrderInfo.provinceInfo.prodOfferId!="" && OrderInfo.provinceInfo.prodOfferId!=null && OrderInfo.provinceInfo.prodOfferId!="null"){
					order.uiCusts.offerinit(OrderInfo.provinceInfo.prodOfferId,null);
				}
				else{
					order.uiCusts.initSub();	
				}
				
			}
			//主副卡
			else if(OrderInfo.actionFlag==6){
				order.memberChange.showOfferCfgDialog();
			}
			//可选包
			else if(OrderInfo.actionFlag==3){
				order.prodModify.orderAttachOffer();
			}
			else if(OrderInfo.actionFlag==1){
				url=contextPath+"/pad/order/prodoffer/prepare.html";
				$("#auth2").css('display','none'); 
				order.prepare.commonTab(url,"order_tab_panel_offer");
			}
			OrderInfo.authRecord.resultCode = "";
			OrderInfo.authRecord.validateType = "";
		
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
	//判断是否是自营渠道
	var _isSelfChannel=function(){
		var is=false;
		var channelType=OrderInfo.rulesJson.channelType;
		if(channelType==CONST.CHANNEL_TYPE_CD.ZQZXDL || channelType==CONST.CHANNEL_TYPE_CD.GZZXDL
				|| channelType==CONST.CHANNEL_TYPE_CD.HYKHZXDL || channelType==CONST.CHANNEL_TYPE_CD.SYKHZXDL
				|| channelType==CONST.CHANNEL_TYPE_CD.XYKHZXDL || channelType==CONST.CHANNEL_TYPE_CD.GZZXJL
				|| channelType==CONST.CHANNEL_TYPE_CD.ZYOUT || channelType==CONST.CHANNEL_TYPE_CD.ZYINGT
				|| channelType==CONST.CHANNEL_TYPE_CD.WBT){// || _partyTypeCd != "1" ){
			is = true;
		}
		if(!is && OrderInfo.cust.identityCd==1){
			is=true;
		}
		return is;
	}
	//鉴权方式日志记录成功
	var _saveAuthRecordSuccess=function(param){
		param.resultCode = "0";
		_saveAuthRecord(param);
	};
	//鉴权方式日志记录失败
	var _saveAuthRecordFail=function(param){
		param.resultCode = "1";
		_saveAuthRecord(param);
	};

	return {	
		identidiesTypeCdChoose :_identidiesTypeCdChoose,
		partyTypeCdChoose :_partyTypeCdChoose,
		certTypeByPartyType : _certTypeByPartyType,
		custcreateButton :_custcreateButton,
		saveAuthRecordFail:_saveAuthRecordFail,
		saveAuthRecordSuccess:_saveAuthRecordSuccess,
		saveAuthRecord:_saveAuthRecord,
		productPwdAuth:_productPwdAuth,
		changeTab:_changeTab,
		smsResend:_smsResend,
		smsvalid:_smsvalid,
		jumpAuth2:_jumpAuth2,
		identityTypeAuth:_identityTypeAuth,
		saveAuthRecordFail:_saveAuthRecordFail,
		saveAuthRecordSuccess:_saveAuthRecordSuccess,
		saveAuthRecord:_saveAuthRecord,
		productPwdAuth:_productPwdAuth,
		changeTab:_changeTab,
		smsvalid:_smsvalid,
		jumpAuth2:_jumpAuth2,
		choosedCustInfo:_choosedCustInfo,
		isSelfChannel:_isSelfChannel
	};
})();
$(function() {
//   order.cust.form_valid_init();
//   order.cust.initDic();
});
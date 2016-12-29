/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("cust");
/**
 * 订单准备
 */
cust = (function(){
	var _choosedCustInfo = {};
	var _checkUserInfo = {
			 accNbr: ""
	};
	var _newUIFalg = "ON";
	var _clearCustForm = function(){
		$('#cmCustName').val("");
		$('#cmAddressStr').val("");
		$('#telNumber').val("");
		$('#mailAddressStr').val("");
		$('#cmCustIdCard').val("");
		$('#cmCustIdCardOther').val("");
		cust.validatorForm();
	};
	var _clearJbrForm = function(){
		$('#orderAttrName').val("");
		$('#sfzorderAttrIdCard').val("");
		$('#orderAttrIdCard').val("");
		$('#orderAttrAddr').val("");
//		$('#orderAttrPhoneNbr').val("");
		cust.jbrvalidatorForm();
	};
	var _clearUserForm = function(){
		$('#userOrderAttrName').val("");
		$('#usersfzorderAttrIdCard').val("");
		$('#userOrderAttrIdCard').val("");
		$('#userOrderAttrAddr').val("");
		$('#userOrderAttrPhoneNbr').val("");
		cust.uservalidatorForm();
	};
	var _queryForChooseUser = false;
	var _custFlag = "";
	//客户鉴权跳转权限
	var _jumpAuthflag="";
	var _tmpChooseUserInfo = {};
	var _tmpJbrInfo = "";
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
	//客户新增提交
	var _newCustSubmit = function(){
		if(OrderInfo.actionFlag=="35" || OrderInfo.actionFlag=="34" || OrderInfo.actionFlag=="112" ||OrderInfo.actionFlag=="1" ||OrderInfo.actionFlag=="8"){
			var validate=$("#custFormdata").Validform();
			if(!validate.check()){
				return;
			}
		} else {
			$('#custFormdata').data('bootstrapValidator').validate();
		}
		var propertiesKey = "CMADDRESS_CHECK_FLAG";
	    var isFlag = offerChange.queryPortalProperties(propertiesKey);
	    if(!isFlag){
	    	isFlag="OFF";
	    }
	    
	    var cmAddressStr = document.getElementById("cmAddressStr").value;
		if(cmAddressStr.replace(/[^\x00-\xff]/g,"aa").length<12 && isFlag=="ON"){
			$.alert("提示","证件地址长度不得少于6个汉字");
		}else {
			if($('#custFormdata').data('bootstrapValidator').isValid()){
				/*var url=contextPath+"/order/createorderlonger";
				var response = $.callServiceAsJson(url, {});
				if(response.code==0){
					OrderInfo.custorderlonger=response.data;
				}*/
				
				_checkIdentity();

			}
		}
		
	};
	
	
	var _custSubmit = function(){
		//从页面信息读取到cust缓存
		OrderInfo.cust.custId = -1;//客户地区
		OrderInfo.cust.partyName = $('#cmCustName').val();//客户名称
		OrderInfo.cust.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.cust.telNumber = $('#telNumber').val();//联系电话
		OrderInfo.cust.addressStr = $('#cmAddressStr').val();//客户地址
		OrderInfo.cust.mailAddressStr = $('#mailAddressStr').val();//通信地址
		OrderInfo.cust.identityCd = $('#cm_identidiesTypeCd').val();//证件类型
		OrderInfo.cust.contactName = $.trim($('#contactName').val());//联系人
		OrderInfo.cust.mobilePhone = $.trim($('#mobilePhone').val());//联系人手机
		OrderInfo.cust.contactAddress = $.trim($('#contactAddress').val());//联系人地址
        
		//联系人不为空时才封装联系人信息上传
		if($.trim($('#contactName').val()).length>0){
			OrderInfo.boPartyContactInfo.contactName = $.trim($('#contactName').val());//联系人
			OrderInfo.boPartyContactInfo.mobilePhone = $.trim($('#mobilePhone').val());//联系人手机
			OrderInfo.boPartyContactInfo.contactAddress = $.trim($('#contactAddress').val());//联系人地址
			OrderInfo.cust.custOther1 = JSON.stringify(OrderInfo.boPartyContactInfo);
		}
		if(OrderInfo.cust.identityCd==1){
			OrderInfo.cust.identityNum = $('#cmCustIdCard').val();//证件号码
		}else{
			OrderInfo.cust.identityNum = $('#cmCustIdCardOther').val();//证件号码
		}
		var flag=$("#flag").val();
		if(ec.util.isObj(flag)){//有值代表是实名制创建客户页面
			var data = {
				boCustInfos : [],
				boCustIdentities : [],	
				boPartyContactInfo : []
			};
			_getCustInfo();
			data.boCustInfos.push(OrderInfo.boCustInfos);
			data.boCustIdentities.push(OrderInfo.boCustIdentities);
			if($.trim($('#contactName').val()).length>0){
				data.boPartyContactInfo.push(OrderInfo.boPartyContactInfo);
			}
			SoOrder.submitOrder(data);
		}else{
			common.saveCust();
		}
	};
	
	var _jbrSubmit = function(){
		
		OrderInfo.jbr.partyName = $('#orderAttrName').val();//经办人名称
		OrderInfo.jbr.areaId = OrderInfo.staff.areaId;//经办人地区
		OrderInfo.jbr.telNumber = $('#orderAttrPhoneNbr').val();//联系电话
		OrderInfo.jbr.addressStr = $('#orderAttrAddr').val();//经办人地址
		OrderInfo.jbr.identityCd = $('#orderIdentidiesTypeCd').val();//证件类型
		if(OrderInfo.jbr.identityCd==1){
			OrderInfo.jbr.identityNum = $('#sfzorderAttrIdCard').val();//证件号码
		}else{
			OrderInfo.jbr.identityNum = $('#orderAttrIdCard').val();//证件号码
		}
		if(OrderInfo.jbr.identityCd == OrderInfo.cust.identityCd && OrderInfo.jbr.identityNum == OrderInfo.cust.identityNum){
			OrderInfo.jbr.custId = OrderInfo.cust.custId;
		} else {
			OrderInfo.jbr.custId = OrderInfo.SEQ.instSeq--;//客户地区
		}
		var data = {
				boCustInfos : [],
				boCustIdentities : [],	
				boPartyContactInfo : []
			};
			_getJbrInfo();
			data.boCustInfos.push(OrderInfo.boJbrInfos);
			data.boCustIdentities.push(OrderInfo.boJbrIdentities);
			//若用户有填写经办人联系号码，则新建经办人时添加联系人信息，否则不添加联系人信息
			if(ec.util.isObj(OrderInfo.jbr.telNumber)){
				OrderInfo.bojbrPartyContactInfo.staffId 		= OrderInfo.staff.staffId;
				OrderInfo.bojbrPartyContactInfo.contactName 	= $.trim($("#orderAttrName").val());
				OrderInfo.bojbrPartyContactInfo.mobilePhone 	= $.trim($("#orderAttrPhoneNbr").val());
				OrderInfo.bojbrPartyContactInfo.contactAddress 	= $.trim($("#orderAttrAddr").val());
				OrderInfo.bojbrPartyContactInfo.contactGender   = "1";//性别，默认为男
				//根据身份证判断性别，无从判别默认为男
				if(OrderInfo.boJbrIdentities.identidiesTypeCd == "1"){
					var identityNum = OrderInfo.boJbrIdentities.identityNum;
					identityNum = parseInt(identityNum.substring(16,17));//取身份证第17位判断性别，奇数男，偶数女
					OrderInfo.bojbrPartyContactInfo.contactGender = (identityNum % 2) == 0 ? "2" : "1";//1男2女
				}
				data.boPartyContactInfo.push(OrderInfo.bojbrPartyContactInfo);
			}
	}
	
	//拼接经办人信息跟经办人属性从jbr节点解析到boJbrInfos，boJbrIdentities
	var _getJbrInfo = function(){
		OrderInfo.boJbrInfos.name = OrderInfo.jbr.partyName;//客户名称
		OrderInfo.boJbrInfos.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.boJbrInfos.partyTypeCd = 1 ;//客户类型
		OrderInfo.boJbrInfos.defaultIdType = 1 ;//证件类型
		OrderInfo.boJbrInfos.addressStr= OrderInfo.jbr.addressStr;//客户地址
		OrderInfo.boJbrInfos.telNumber = OrderInfo.jbr.telNumber;//联系电话
		OrderInfo.boJbrInfos.mailAddressStr = OrderInfo.jbr.mailAddressStr;//通信地址
		OrderInfo.boJbrInfos.state = "ADD";
		
		OrderInfo.boJbrIdentities.identidiesTypeCd = OrderInfo.jbr.identityCd;//证件类型
		OrderInfo.boJbrIdentities.identityNum = OrderInfo.jbr.identityNum;//证件号码
		OrderInfo.boJbrIdentities.identidiesPic = OrderInfo.jbr.identityPic;//证件照片
		OrderInfo.boJbrIdentities.isDefault = "Y";
		OrderInfo.boJbrIdentities.state = "ADD";
	};
	
	//拼接客户信息跟客户属性从cust节点解析到boCustInfos，boCustIdentities
	var _getCustInfo = function(){
		
		OrderInfo.boCustInfos.name = OrderInfo.cust.partyName;//客户名称
		OrderInfo.boCustInfos.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.boCustInfos.partyTypeCd = 1 ;//客户类型
		OrderInfo.boCustInfos.defaultIdType = 1 ;//证件类型
		OrderInfo.boCustInfos.addressStr= OrderInfo.cust.addressStr;//客户地址
		OrderInfo.boCustInfos.telNumber = OrderInfo.cust.telNumber;//联系电话
		OrderInfo.boCustInfos.mailAddressStr = OrderInfo.cust.mailAddressStr;//通信地址
		OrderInfo.boCustInfos.state = "ADD";
		
		OrderInfo.boCustIdentities.identidiesTypeCd = OrderInfo.cust.identityCd;//证件类型
		OrderInfo.boCustIdentities.identityNum = OrderInfo.cust.identityNum;//证件号码
		OrderInfo.boCustIdentities.identidiesPic = OrderInfo.cust.identityPic;//证件照片
		OrderInfo.boCustIdentities.isDefault = "Y";
		OrderInfo.boCustIdentities.state = "ADD";
	};
	
	
	//拼接经办人信息跟经办人属性从jbr节点解析到boJbrInfos，boJbrIdentities
	var _getUserInfo = function(custInfo){
		OrderInfo.boUserInfos.custId = custInfo.custId;
		OrderInfo.boUserInfos.name = custInfo.partyName;//客户名称
		OrderInfo.boUserInfos.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.boUserInfos.partyTypeCd = 1 ;//客户类型
		OrderInfo.boUserInfos.defaultIdType = 1 ;//证件类型
		OrderInfo.boUserInfos.addressStr= custInfo.addressStr;//客户地址
		OrderInfo.boUserInfos.telNumber = custInfo.accNbr;//联系电话
		OrderInfo.boUserInfos.mailAddressStr = custInfo.mailAddressStr;//通信地址
		OrderInfo.boUserInfos.state = "ADD";
//		OrderInfo.boUserInfosArr.push(OrderInfo.boUserInfos);
		
		OrderInfo.boUserIdentities.identidiesTypeCd = custInfo.identityCd;//证件类型
		OrderInfo.boUserIdentities.identityNum = custInfo.idCardNumber;//证件号码
		OrderInfo.boUserIdentities.identidiesPic = custInfo.identityPic;//证件照片
		OrderInfo.boUserIdentities.isDefault = "Y";
		OrderInfo.boUserIdentities.state = "ADD";
//		OrderInfo.boUserIdentitiesArr.push(OrderInfo.boUserIdentities);
	};
	
	
	//客户修改提交
	var _updateCustSubmit = function(){
		$('#custFormdata').data('bootstrapValidator').validate();
		if($('#custFormdata').data('bootstrapValidator').isValid()){
			/*var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}
			_checkIdentity();*/
			var data = {};
			data.boCustInfos = [{
				areaId : OrderInfo.cust.areaId,
				name : $("#boCustIdentities").attr("partyName"),
				norTaxPayerId : "0",
				partyTypeCd : $("#boCustIdentities").attr("partyTypeCd"),
				addressStr :$("#boCustIdentities").attr("addressStr"),
				state : "DEL"
			},{
				areaId : OrderInfo.cust.areaId,
				name : modifyCustInfo.custName,
				norTaxPayerId : "0",
				partyTypeCd : $("#cmPartyTypeCd").val(),
				addressStr :modifyCustInfo.addressStr,
				state : "ADD"
			}];
			var identityPic = OrderInfo.cust.identityPic;
			if (identityPic === undefined) {
				identityPic = "";
			}
			if(!ec.util.isObj(OrderInfo.cust.idCardNumber)){
				data.boCustIdentities = [{
					identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
					identityNum : modifyCustInfo.custIdCard,
					isDefault : "Y",
					state : "ADD",
					identidiesPic : identityPic
				}];	
			}else{
				data.boCustIdentities = [{
					identidiesTypeCd :OrderInfo.cust.identityCd,
					identityNum : OrderInfo.cust.idCardNumber,
					isDefault : "Y",
					state : "DEL",
					identidiesPic : ""
				},{
					identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
					identityNum : modifyCustInfo.custIdCard,
					isDefault : "Y",
					state : "ADD",
					identidiesPic : identityPic
				}];
			}
			SoOrder.submitOrder(data);
		}
	};
	
    
	//验证证件号码是否存在
	var _checkIdentity = function() {
		var areaId = OrderInfo.staff.areaId;
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var custName=$("#p_cust_areaId_val").val();
		createCustInfo = {
			cAreaId : areaId,
			cAreaName : custName,
			cCustName : $.trim($("#cmCustName").val()),
			cCustIdCard :  $.trim($("#cmCustIdCard").val()),
			cPartyTypeCd : $.trim($("#cmPartyTypeCd").val()),
			cIdentidiesTypeCd : $.trim($("#cm_identidiesTypeCd").val()),
			cAddressStr :$.trim($("#cmAddressStr").val())
		};
		if(createCustInfo.cIdentidiesTypeCd==1){
			createCustInfo.cCustIdCard = $('#cmCustIdCard').val();//证件号码
		}else{
			createCustInfo.cCustIdCard = $('#cmCustIdCardOther').val();//证件号码
		}
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
		var flag=$("#flag").val();
		if(flag){
			var url=contextPath+"/app/cust/checkIdentity";
			var response = $.callServiceAsJson(url, params, {"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			}});
			var msg="";
			if (response.code == 0) {
				$.unecOverlay();
				$.confirm("确认","此证件号码已存在,是否确认新建?",{ 
					yes:function(){	
						_custSubmit();
					},
					no:function(){
						
					}
				});
			}else{
				$.unecOverlay();
				_custSubmit();
			}
			
		}else{
			_custSubmit();
		}
	};
	
	var _form_custInfomodify_btn = function() {
		//修改客户下一步确认按钮
		$('#custInfoModifyBtn').off("click").on("click",function(event) {
			$('#custFormdata').data('bootstrapValidator').validate();
			if($('#custFormdata').data('bootstrapValidator').isValid()){
				if(order.prodModify.accountInfo!=undefined&&$.trim($("#accountName").val())==""){
					$.alert("提示","账户名称不能为空!"); 
					return ;
				}
				var modifyCustInfo={};
				modifyCustInfo = {
						custName : $.trim($("#cmCustName").val()),
						identidiesTypeCd :  $("#div_cm_identidiesType  option:selected").val(),
						custIdCard :  $.trim($("#cmCustIdCard").val()),
						addressStr: $.trim($("#cmAddressStr").val())
				};
				var data = {};
				data.boCustInfos = [{
					areaId : OrderInfo.cust.areaId,
					name : $("#boCustIdentities").attr("partyName"),
					norTaxPayerId : "0",
					partyTypeCd : $("#boCustIdentities").attr("partyTypeCd"),
					addressStr :$("#boCustIdentities").attr("addressStr"),
					state : "DEL"
				},{
					areaId : OrderInfo.cust.areaId,
					name : modifyCustInfo.custName,
					norTaxPayerId : "0",
					partyTypeCd : $("#cmPartyTypeCd").val(),
					addressStr :modifyCustInfo.addressStr,
					state : "ADD"
				}];
				var identityPic = OrderInfo.cust.identityPic;
				if (identityPic === undefined) {
					identityPic = "";
				}
				if(!ec.util.isObj(OrderInfo.cust.idCardNumber)){
					data.boCustIdentities = [{
						identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
						identityNum : modifyCustInfo.custIdCard,
						isDefault : "Y",
						state : "ADD",
						identidiesPic : identityPic
					}];	
				}else{
					data.boCustIdentities = [{
						identidiesTypeCd :OrderInfo.cust.identityCd,
						identityNum : OrderInfo.cust.idCardNumber,
						isDefault : "Y",
						state : "DEL",
						identidiesPic : ""
					},{
						identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
						identityNum : modifyCustInfo.custIdCard,
						isDefault : "Y",
						state : "ADD",
						identidiesPic : identityPic
					}];
				}
				//当有账户缓存且所填账户名称与账户缓存名称不一致时 accountChangeState为true 否则为false
				var	accountChangeState=(order.prodModify.accountInfo!=undefined)&&($.trim($("#accountName").val())!=order.prodModify.accountInfo.name)?true:false;
				//如果accountChangeState为ture ,拼接账户信息
				if(accountChangeState){
					accountInfoOld=order.prodModify.accountInfo;
					var name=$.trim($("#accountName").val());
					data.boAccountInfos=[];
					var _boProdAcctInfosOld={
	                            acctCd: accountInfoOld.acctCd,
	                            acctId: accountInfoOld.acctId,
	                            acctName: accountInfoOld.name,
	                            CN:accountInfoOld.acctName==undefined?"":accountInfoOld.acctName,
	                            acctTypeCd: "1",
	                            partyId: accountInfoOld.custId,
	                            prodId: order.prodModify.choosedProdInfo.productId,
	                            state: "DEL"
					};
					var _boProdAcctInfos={
							 	acctCd: accountInfoOld.acctCd,
							 	acctId: accountInfoOld.acctId,
							 	acctName: $.trim($("#accountName").val()),
							 	acctTypeCd: "1",
							 	partyId: accountInfoOld.custId,
							 	prodId: order.prodModify.choosedProdInfo.productId,
							 	state: "ADD"
					};
					data.boAccountInfos.push(_boProdAcctInfosOld);
					data.boAccountInfos.push(_boProdAcctInfos);
					
				}
				//清除账户信息缓存
				order.prodModify.accountInfo=null;

//				//客户联系人
				data.boPartyContactInfo=[];
				var _boPartyContactInfoOld = {
						contactId : $("#contactIdOld").val(),//参与人联系信息的唯一标识
						statusCd : "100001",
						contactName : $("#contactNameOld").val(),//参与人的联系人名称
						headFlag :  $("#headFlagOld").val(),//是否首选联系人
						state : "DEL"//状态
				};
				var _boPartyContactInfo = {
						contactAddress : $.trim($("#contactAddress").val()),//参与人的联系地址
						contactId : "",//参与人联系信息的唯一标识
						contactName : $.trim($("#contactName").val()),//参与人的联系人名称
						mobilePhone : $.trim($("#mobilePhone").val()),//参与人的联系人手机
						headFlag :  $("#headFlag").val(),//是否首选联系人
						staffId : OrderInfo.staff.staffId,//员工ID
						state : "ADD",//状态
						statusCd : "100001"//订单状态
				};
				if(ec.util.isObj(_boPartyContactInfoOld.contactId)){
					data.boPartyContactInfo.push(_boPartyContactInfoOld);
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}else if(ec.util.isObj($.trim($("#contactName").val()))){
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}
				SoOrder.submitOrder(data);
			}
		});
	};
    //客户类型选择事件
	var _partyTypeCdChoose = function(scope) {
		var partyTypeCd=$(scope).val();
		//_partyType(partyTypeCd);
		$("#cm_identidiesTypeCd").empty();
		//客户类型关联证件类型下拉框
		_certTypeByPartyType(partyTypeCd);
		//证件类型选择事件
//		_identidiesTypeCdChoose($("#div_cm_identidiesType").children(":first-child"));

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
		   			$.alert("错误","根据员工类型查询员工证件类型无数据,请配置");
					return;
				}
	   if(response.code==0){
					var data = response.data ;
					var currentCT = $("#currentCT").val();//渠道类型
					//只有定义的渠道类型新建客户的时候可以选择非身份证类型,其他的渠道类型只能选择身份证类型。
					var isAllowChannelType = false;
					if (currentCT == CONST.CHANNEL_TYPE_CD.ZQZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXDL
						|| currentCT == CONST.CHANNEL_TYPE_CD.HYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.SYKHZXDL
						|| currentCT == CONST.CHANNEL_TYPE_CD.XYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXJL
						|| currentCT == CONST.CHANNEL_TYPE_CD.ZYOUT || currentCT == CONST.CHANNEL_TYPE_CD.ZYINGT
						|| currentCT == CONST.CHANNEL_TYPE_CD.WBT) { // || _partyTypeCd != "1" //新建政企客户时同样有这个限制
						isAllowChannelType = true;
					}
					if(data!=undefined && data.length>0){
						OrderInfo.certTypedates = data;
						for(var i=0;i<OrderInfo.certTypedates.length;i++){
							var certTypedate = OrderInfo.certTypedates[i];
							if (certTypedate.certTypeCd == "1") {//身份证
									$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
								}else if(isAllowChannelType){//如果自有渠道，开放所有
									$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
								}
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
		if(OrderInfo.actionFlag!="9"){
			$("#cmCustName").val("");
			$("#cmCustIdCard").val("");
			$("#cmAddressStr").val("");
			$("#cmCustIdCardOther").val("");
		}
		$("#cmCustName").removeAttr("readonly");
		$("#cmCustIdCard").removeAttr("readonly");
		$("#cmAddressStr").removeAttr("readonly");
		$("#cmCustIdCard").attr("type","hidden");
		$("#cmCustIdCardOther").removeAttr("type");
		if(identidiesTypeCd==1){
			$("#cmCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#div-cmcustidcard").show();
			$("#readCard").show();
			$("#div-cmcustidcard-none").hide();
			$("#cmCustIdCardOther").attr("type","hidden");
			$("#cmCustIdCard").removeAttr("type");
			$("#cmCustName").attr("readonly","readonly");
			$("#cmCustIdCard").attr("readonly","readonly");
			$("#cmAddressStr").attr("readonly","readonly");
			try{
				$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",false,null);
				$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",true,null);
			}catch(err){}
			
		}else if(identidiesTypeCd==2){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法军官证");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$("#readCard").hide();
			try{
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
			}catch(err){}
		}else if(identidiesTypeCd==3){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法护照");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$("#readCard").hide();
			try{
				$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
				$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
			}catch(err){}
			
		}else{
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法证件号码");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$("#readCard").hide();
			try{
				$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
				$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
			} catch(err){}
				
		}
		$("#testBtn").click();
		_form_custInfomodify_btn();
	};
	
	//翼销售-经办人-客户类型选择事件
	var _jbrpartyTypeCdChoose = function(scope,id) {
		var partyTypeCd=$(scope).val();	
		//客户类型关联证件类型下拉框
		$("#"+id).empty();
		try{
			if(!ec.util.isObj(OrderInfo.curIp)){
				common.getMobileIp("cust.getIp");
			}
		}catch(err){
			
		}finally{
			_jbrcertTypeByPartyType(partyTypeCd,id);
		}
		
		//创建客户证件类型选择事件
//		_jbridentidiesTypeCdChoose($("#"+id).children(":first-child"),"orderAttrIdCard");
		//创建客户确认按钮
		//_custcreateButton();

	};
	//翼销售-经办人-客户类型关联证件类型下拉框
	var _jbrcertTypeByPartyType = function(_partyTypeCd,id){
		var _obj = $("#"+id);
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/app/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
				}
	   var currentCT = $("#currentCT").val();//渠道类型
	   var propertiesKey = "REAL_NAME_PHOTO_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
	   var isFlag = offerChange.queryPortalProperties(propertiesKey);
	   OrderInfo.preBefore.idPicFlag = isFlag;
	   var cardType = OrderInfo.cust.identityCd;
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
							if(currentCT==CONST.CHANNEL_TYPE_CD.ZQZXDL || currentCT==CONST.CHANNEL_TYPE_CD.GZZXDL
									|| currentCT==CONST.CHANNEL_TYPE_CD.HYKHZXDL || currentCT==CONST.CHANNEL_TYPE_CD.SYKHZXDL
									|| currentCT==CONST.CHANNEL_TYPE_CD.XYKHZXDL || currentCT==CONST.CHANNEL_TYPE_CD.GZZXJL
									|| currentCT==CONST.CHANNEL_TYPE_CD.ZYOUT || currentCT==CONST.CHANNEL_TYPE_CD.ZYINGT
									|| currentCT==CONST.CHANNEL_TYPE_CD.WBT || _partyTypeCd != "1" ){
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
//							if(certTypedate.certTypeCd == cardType && _partyTypeCd==1 && isFlag=="ON"){
							if(certTypedate.certTypeCd == "1"){
								_obj.append("<option value='"+certTypedate.certTypeCd+"' selected='selected'>"+certTypedate.name+"</option>");
							}else{
								_obj.append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							}
						}
					    var identidiesTypeCd=$("#" + id + " option[selected='selected']").val();
						if(identidiesTypeCd==1){
							$("#jbrsfz").show();
							$("#jbrsfz_i").show();
							$("#qtzj").hide();
							$("#orderAttrName").attr("readonly","readonly");
							$("#orderAttrAddr").attr("readonly","readonly");
							$("#orderAttrIdCard").attr("type","hidden");
							$("#sfzorderAttrIdCard").removeAttr("type");
							$("#queryJbr").attr("disabled","disabled");
							if(OrderInfo.actionFlag == "111"){
								$("#queryJbr").hide();
							} else{
								$("#whole").hide();
								$("#only").show();
							}
//							$("#queryJbr").hide();
						}else{
							$("#jbrsfz").hide();
							$("#jbrsfz_i").hide();
							$("#qtzj").show();
							$("#orderAttrName").removeAttr("readonly");
							$("#orderAttrAddr").removeAttr("readonly");
							$("#sfzorderAttrIdCard").attr("type","hidden");
							$("#orderAttrIdCard").removeAttr("type");
							$("#queryJbr").removeAttr("disabled");
							if(OrderInfo.actionFlag == "111"){
								$("#queryJbr").hide();
							} else {
								$("#whole").hide();
								$("#only").show();
							}
//							$("#queryJbr").show();
						}
						$("#photo").show();
						OrderInfo.virOlId = "";
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
//						if(OrderInfo.jbr.identityPic){
//							OrderInfo.jbr.identityPic = undefined;
//						}
						if(OrderInfo.preBefore.idPicFlag=="ON"){//实名拍照省份开关为开
//							$("#photo").show();
//							$("#queryJbr").show();
								OrderInfo.jbr.custId = OrderInfo.cust.custId;
								OrderInfo.jbr.partyName = OrderInfo.cust.partyName;
								OrderInfo.jbr.telNumber = OrderInfo.cust.telNumber;
								OrderInfo.jbr.addressStr = OrderInfo.cust.addressStr;
								OrderInfo.jbr.identityCd = OrderInfo.cust.identityCd;
								OrderInfo.jbr.mailAddressStr = OrderInfo.cust.mailAddressStr;
								OrderInfo.jbr.identityPic = OrderInfo.cust.identityPic;
								OrderInfo.jbr.identityNum = OrderInfo.cust.identityNum;
						}
						//jquery mobile 需要刷新才能生效
//						_obj.selectmenu().selectmenu('refresh');
//						if(id=='orderIdentidiesTypeCd'){
//							//创建经办人证件类型选择事件
////							$("#orderIdentidiesTypeCd option[value='1'").attr("selected", true);
////							_jbridentidiesTypeCdChoose($("#"+id).children(":first-child"),"orderAttrIdCard");
//							_jbridentidiesTypeCdChoose(($("#" + id + " option[selected='selected']")),"orderAttrIdCard",_partyTypeCd);
//						}
					}
				}
	};
	
	//证件类型选择事件
	var _jbridentidiesTypeCdChoose = function(scope,id,partyTypeCd) {
		order.broadband.isSameOne=false;
		order.broadband.canCallPhote=false;
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==1){
			$("#jbrsfz").show();
			$("#jbrsfz_i").show();
			$("#qtzj").hide();
			$("#orderAttrName").attr("readonly","readonly");
			$("#orderAttrAddr").attr("readonly","readonly");
			$("#orderAttrIdCard").attr("type","hidden");
			$("#sfzorderAttrIdCard").removeAttr("type");
			$("#queryJbr").attr("disabled","disabled");
			if(OrderInfo.actionFlag == "111"){
				$("#queryJbr").hide();
			} else{
				$("#whole").hide();
				$("#only").show();
			}
		}else{
			$("#jbrsfz").hide();
			$("#jbrsfz_i").hide();
			$("#qtzj").show();
			$("#orderAttrName").removeAttr("readonly");
			$("#orderAttrAddr").removeAttr("readonly");
			$("#orderAttrIdCard").removeAttr("readonly");
			$("#sfzorderAttrIdCard").attr("type","hidden");
			$("#orderAttrIdCard").removeAttr("type");
			$("#queryJbr").removeAttr("disabled");
			if(OrderInfo.actionFlag == "111"){
				$("#queryJbr").show();
			} else{
				$("#whole").show();
				$("#only").hide();
			}
//			
		}
		if(OrderInfo.jbr){
			OrderInfo.jbr.custId ="";
			OrderInfo.virOlId = "";
			OrderInfo.jbr.identityPic = undefined;
		}
		cust.clearJbrForm();
		
	};
	
	//翼销售-使用人-客户类型选择事件
	var _userpartyTypeCdChoose = function(scope,id) {
		var partyTypeCd=$(scope).val();	
		//客户类型关联证件类型下拉框
		$("#"+id).empty();
		_usercertTypeByPartyType(partyTypeCd,id);

	};
	//翼销售-经办人-客户类型关联证件类型下拉框
	var _usercertTypeByPartyType = function(_partyTypeCd,id){
		var _obj = $("#"+id);
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/app/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
				}
	   var currentCT = $("#currentCT").val();//渠道类型
	   var cardType = OrderInfo.cust.identityCd;
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
							if(currentCT==CONST.CHANNEL_TYPE_CD.ZQZXDL || currentCT==CONST.CHANNEL_TYPE_CD.GZZXDL
									|| currentCT==CONST.CHANNEL_TYPE_CD.HYKHZXDL || currentCT==CONST.CHANNEL_TYPE_CD.SYKHZXDL
									|| currentCT==CONST.CHANNEL_TYPE_CD.XYKHZXDL || currentCT==CONST.CHANNEL_TYPE_CD.GZZXJL
									|| currentCT==CONST.CHANNEL_TYPE_CD.ZYOUT || currentCT==CONST.CHANNEL_TYPE_CD.ZYINGT
									|| currentCT==CONST.CHANNEL_TYPE_CD.WBT || _partyTypeCd != "1" ){
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
							if(certTypedate.certTypeCd == 1){
								_obj.append("<option value='"+certTypedate.certTypeCd+"' selected='selected'>"+certTypedate.name+"</option>");
							}else {
								_obj.append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							}
						}
						//jquery mobile 需要刷新才能生效
//						_obj.selectmenu().selectmenu('refresh');
						if(id=='userOrderIdentidiesTypeCd'){
							//创建经办人证件类型选择事件
//							$("#orderIdentidiesTypeCd option[value='1'").attr("selected", true);
							_useridentidiesTypeCdChoose(($("#" + id + " option[selected='selected']")),"userOrderAttrIdCard");
						}
					}
				}
	};
	
	//证件类型选择事件
	var _useridentidiesTypeCdChoose = function(scope,id) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==-1){
			$("#cust_identityNum_choose_label").html("电话号码"); 
		} else {
			$("#cust_identityNum_choose_label").html("证件号码"); 
		}
			
		if(identidiesTypeCd==1){
			$("#usersfz").show();
			$("#usersfz_i").show();
			$("#userqtzj").hide();
			$("#userOrderAttrName").attr("readonly","readonly");
			$("#userOrderAttrAddr").attr("readonly","readonly");
		}else{
			$("#usersfz").hide();
			$("#usersfz_i").hide();
			$("#userqtzj").show();
			$("#userOrderAttrName").removeAttr("readonly");
			$("#userOrderAttrAddr").removeAttr("readonly");
		}
	};
	
	//读卡获取经办人信息
	var _getjbrGenerationInfos=function(name,idcard,address,identityPic){
		$("#orderAttrName").val(name);
		$("#sfzorderAttrIdCard").val(idcard);
		$("#orderAttrAddr").val(address);
		if(ec.util.isObj(_newUIFalg) && _newUIFalg == "ON" &&  (OrderInfo.actionFlag=="35" || OrderInfo.actionFlag=="34" || OrderInfo.actionFlag=="112" ||OrderInfo.actionFlag=="1" ||OrderInfo.actionFlag=="8")){
			$("#jbrFormdata").Validform().check();
		} else {
			$('#jbrFormdata').data('bootstrapValidator').validate();
		}
		OrderInfo.jbr.identityPic = identityPic;//证件照片
		OrderInfo.virOlId = "";
		order.main.queryJbr();
	};
	//校验表单提交
	var _jbrvalidatorForm=function(){
		var propertiesKey = "NEWUIFLAG_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
		_newUIFalg = offerChange.queryPortalProperties(propertiesKey);
		if(OrderInfo.actionFlag=="35" || OrderInfo.actionFlag=="34"  ||OrderInfo.actionFlag=="1" ||OrderInfo.actionFlag=="8"  || OrderInfo.actionFlag=="111"){
			var jbrFormdata = $("#jbrFormdata").Validform({
				btnSubmit:"queryJbr",
				ignoreHidden:true,
				datatype:{
					"zh6-50":/[\u4e00-\u9fa5]{6}|^.{12}/,
					"sfz":/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
					"qtzj":/^[0-9a-zA-Z]{1,100}$/,
					"phone":/(^\d{11}$)/
				},
				tiptype:function(msg,o,cssctl){
					
					//msg：提示信息;
					//o:{obj:*,type:*,curform:*}, obj指向的是当前验证的表单元素（或表单对象），type指示提示的状态，值为1、2、3、4， 1：正在检测/提交数据，2：通过验证，3：验证失败，4：提示ignore状态, curform为当前form对象;
					//cssctl:内置的提示信息样式控制函数，该函数需传入两个参数：显示提示信息的对象 和 当前提示的状态（既形参o中的type）;
					if(!o.obj.is("form")){//验证表单元素时o.obj为该表单元素，全部验证通过提交表单时o.obj为该表单对象;
						if(o.type == 3){
							var objtip=o.obj.siblings(".Validform_checktip");
							cssctl(objtip,o.type);
							objtip.text(msg);
						}
						if(o.type == 2){
							var objtip=o.obj.siblings(".Validform_checktip");
							cssctl(objtip,o.type);
							objtip.text("");
						}
					}
				}
			});
			jbrFormdata.addRule([
				{
				    ele:"#orderAttrName",
				    datatype:"*",
				    nullmsg:"经办人姓名不能为空",
				    errormsg:"经办人姓名不能为空"
				},
				{
				    ele:"#sfzorderAttrIdCard",
				    datatype:"sfz",
				    nullmsg:"身份证号码不能为空",
				    errormsg:"证件号码只能为数字或字母"
				},
				{
				    ele:"#orderAttrIdCard",
				    datatype:"qtzj",
				    nullmsg:"证件号码不能为空",
				    errormsg:"证件号码只能为数字或字母"
				},
				{
				    ele:"#orderAttrAddr",
				    datatype:"*",
				    nullmsg:"证件地址不能为空"
				},
				{
				    ele:"#orderAttrPhoneNbr",
				    datatype:"phone",
				    errormsg:"请输入正确的手机号码",
				    nullmsg:"联系方式不能为空"
				}                
			]);
		} else {
			$('#jbrFormdata').bootstrapValidator({
		        message: '无效值',
		        feedbackIcons: {
		            valid: 'glyphicon glyphicon-ok',
		            invalid: 'glyphicon glyphicon-remove',
		            validating: 'glyphicon glyphicon-refresh'
		        },
		        fields: {
//		        	sfzorderAttrIdCard: {
//		            	trigger: 'blur',
//		                validators: {
//		                    regexp: {
//		                        regexp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
//		                        //regexp: /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/,
//		                        message: '请输入合法身份证号码'
//		                    }
//		                }
//		            },
		            orderAttrIdCard: {
		            	trigger: 'blur',
		                validators: {
		                    regexp: {
		                        regexp: /^[0-9a-zA-Z]*$/g,
		                        message: '证件号码只能为数字或字母'
		                    }
		                }
		            },
		            orderAttrPhoneNbr: {
		            	trigger: 'blur',
		                validators: {
		                    regexp: {
		                        /*regexp: /(^\d{11}$)/,
		                        message: '手机号码只能为11数字'*/
		                    	regexp: /^1[34578]\d{9}$/,
		                        message: '手机号码不合法'
		                    }
		                }
		            }
		        }
		    });
		}
	};
	//校验表单提交
	var _uservalidatorForm=function(){
		$('#userFormdata').bootstrapValidator({
	        message: '无效值',
	        feedbackIcons: {
	            valid: 'glyphicon glyphicon-ok',
	            invalid: 'glyphicon glyphicon-remove',
	            validating: 'glyphicon glyphicon-refresh'
	        },
	        fields: {
	        	usersfzorderAttrIdCard: {
	            	trigger: 'blur',
	                validators: {
	                    regexp: {
	                        regexp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
	                        //regexp: /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/,
	                        message: '请输入合法身份证号码'
	                    }
	                }
	            },
	            userOrderAttrIdCard: {
	            	trigger: 'blur',
	                validators: {
	                    regexp: {
	                        regexp: /^[0-9a-zA-Z]*$/g,
	                        message: '证件号码只能为数字或字母'
	                    }
	                }
	            },
	            userOrderAttrPhoneNbr: {
	            	trigger: 'blur',
	                validators: {
	                    regexp: {
	                        /*regexp: /(^\d{11}$)/,
	                        message: '手机号码只能为11数字'*/
	                    	regexp: /^1[34578]\d{9}$/,
	                        message: '手机号码不合法'
	                    }
	                }
	            }
	        }
	    });
	};
	
	//校验表单提交
	var _validatorForm=function(){
		$('#custFormdata').bootstrapValidator({
	        message: '无效值',
	        feedbackIcons: {
	            valid: 'glyphicon glyphicon-ok',
	            invalid: 'glyphicon glyphicon-remove',
	            validating: 'glyphicon glyphicon-refresh'
	        },
	        fields: {
	        	cmCustName: {
	        		trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '客户姓名不能为空'
	                    }
	                }
	            },
	            cmCustIdCard: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '身份证号码不能为空'
	                    },
	                    regexp: {
	                        regexp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
	                        message: '请输入合法身份证号码'
	                    }
	                }
	            },
	            cmCustIdCardOther: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '证件号码不能为空'
	                    },
	                    regexp: {
	                        regexp: /^[0-9a-zA-Z]*$/g,
	                        message: '证件号码只能为数字或字母'
	                    }
	                }
	            },
	            cmAddressStr: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '证件地址不能为空'
	                    }
//	            ,
//	                    regexp: {
//	                        regexp: /[\u4e00-\u9fa5]{6}|^.{12}/,
//	                        message: '证件地址长度不得少于6个汉字'
//	                    }
	                }
	            },
	            mobilePhone: {
	            	trigger: 'blur',
	                validators: {
	                    regexp: {
	                        regexp: /(^\d{11}$)/,
	                        message: '手机号码只能为11数字'
	                    }
	                }
	            },
	            phonenumber: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '手机号码不能为空'
	                    }
	                }
	            }
	        }
	    });
//		$(".new_user_box").Validform();
		var propertiesKey = "NEWUIFLAG_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
		_newUIFalg = offerChange.queryPortalProperties(propertiesKey);
		if(_newUIFalg == "ON" && (OrderInfo.actionFlag=="35" || OrderInfo.actionFlag=="34" || OrderInfo.actionFlag=="112" ||OrderInfo.actionFlag=="1")){
			var new_user_box = $(".new_user_box").Validform({
				btnSubmit:".sun-btn", 
				ignoreHidden:true,
				datatype:{
					"zh6-50":/[\u4e00-\u9fa5]{6}|^.{12}/,
					"sfz":/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
					"qtzj":/^[0-9a-zA-Z]{1,100}$/
				},
				tiptype:function(msg,o,cssctl){
					
					//msg：提示信息;
					//o:{obj:*,type:*,curform:*}, obj指向的是当前验证的表单元素（或表单对象），type指示提示的状态，值为1、2、3、4， 1：正在检测/提交数据，2：通过验证，3：验证失败，4：提示ignore状态, curform为当前form对象;
					//cssctl:内置的提示信息样式控制函数，该函数需传入两个参数：显示提示信息的对象 和 当前提示的状态（既形参o中的type）;
					if(!o.obj.is("form")){//验证表单元素时o.obj为该表单元素，全部验证通过提交表单时o.obj为该表单对象;
						if(o.type == 3){
							var objtip=o.obj.siblings(".Validform_checktip");
							cssctl(objtip,o.type);
							objtip.text(msg);
						}
						if(o.type == 2){
							var objtip=o.obj.siblings(".Validform_checktip");
							cssctl(objtip,o.type);
							objtip.text("");
						}
					}
				},
				showAllError:true,
			});
			new_user_box.addRule([
				{
				    ele:"#cmCustName",
				    datatype:"*",
				    nullmsg:"客户姓名不能为空",
				    errormsg:"客户姓名不能为空"
				},
				{
				    ele:"#cmCustIdCardOther",
				    datatype:"qtzj",
				    nullmsg:"证件号码不能为空",
				    errormsg:"证件号码只能为数字或字母"
				},
				{
				    ele:"#cmCustIdCard",
				    datatype:"sfz",
				    nullmsg:"身份证号码不能为空",
				    errormsg:"请输入合法身份证号码"
				},
				{
				    ele:"#cmAddressStr",
				    datatype:"zh6-50",
				    nullmsg:"证件地址不能为空",
				    errormsg:"证件地址长度不得少于6个汉字"
				},
				{
				    ele:"#mobilePhone",
				    datatype:"m",
				    errormsg:"请输入正确的手机号码",
				    ignore:"ignore"
				}                
			]);
		}
		
	};
	
	//获取证件类型以及初始化
	var _getIdentidiesTypeCd=function(){
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		
		//取客户证件类型
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
		
		OrderInfo.busitypeflag=12;
        var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.ACTIVERETURN;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,9,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		SoOrder.initFillPage();
	};
	
	
	//初始化新增客户
	var _initNewCust = function(){
		
		cust.validatorForm();
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		//取客户证件类型
		//$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		var opts=document.getElementById("cm_identidiesTypeCd");
		for(var i=0;i<opts.options.length;i++){
	           if(1==opts.options[i].value){
	               opts.options[i].selected =true;
	               break;
	           }
	     }
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
		
		$('#newCustBtn').off("click").on("click",_newCustSubmit);
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUST_CREATE;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,8,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");

		SoOrder.initFillPage();
	};
	
	//初始化新增客户
	var _initUpdateCust = function(){
		cust.validatorForm();
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		//证件类型选中
		$("#cm_identidiesTypeCd").find("option[value="+$("#zjlx").val()+"]").attr("selected","selected");
		//取客户证件类型
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
	
		$('#updateCustBtn').off("click").on("click",_updateCustSubmit);
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUSTINFOMODIFY;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,4,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");

		SoOrder.initFillPage();
	};
	
	var _getIDCardInfos=function(name,idcard,address,photosBase64){
		$("#cmCustName").val(name);
		$("#cm_identidiesTypeCd").val("1");
		$("#cm_identidiesTypeCd").change();
		$("#cmCustIdCard").val(idcard);
		$("#cmAddressStr").val(address);
		$("#photos").attr("src","data:image/jpg;base64,"+photosBase64);
	};
	
	var _getPicture=function(olId,photosBase64){
		$("#photos").attr("src","data:image/jpg;base64,"+photosBase64);
		OrderInfo.virOlId = olId;
		mktRes.terminal.closeJBR();
	};
	
	var _getGenerationInfos=function(name,idcard,address,identityPic){
		$("#cm_identidiesTypeCd").val("1");
		$("#cm_identidiesTypeCd").change();
		$("#cmCustIdCard").val(idcard);
		$("#cmCustName").val(name);
		$("#cmAddressStr").val(address);
		if(ec.util.isObj(_newUIFalg) && _newUIFalg == "ON" &&  (OrderInfo.actionFlag=="35" || OrderInfo.actionFlag=="34" || OrderInfo.actionFlag=="112" ||OrderInfo.actionFlag=="1" ||OrderInfo.actionFlag=="8")){
			$("#custFormdata").Validform().check();
		} else {
			$('#custFormdata').data('bootstrapValidator').validate();
		}
		OrderInfo.cust.identityPic = identityPic;//证件照片
	};
	
	var _getUserGenerationInfos=function(name,idcard,address,identityPic){
		$("#userOrderAttrName").val(name);
		$("#userOrderIdentidiesTypeCd").val("1");
		$("#userOrderIdentidiesTypeCd").change();
		$("#usersfzorderAttrIdCard").val(idcard);
		$("#userOrderAttrAddr").val(address);
		OrderInfo.virOlId = "";
		cust.tmpChooseUserInfo.identityPic = identityPic;//证件照片
	};
	
	
	//新增客户订单查询页面
	var _custQueryAdd=function(){
		var param = {};
		$.callServiceAsHtml(contextPath+"/app/cust/custQueryAdd",param,{
			"before":function(){
				$.ecOverlay("加载中请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				$("#order-content").hide();
				$("#cust").html(response.data).show();
			},
			fail:function(){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	}
	//新增客户订单查询列表页面
	var _custQueryAddList=function(pageIndex,scroller){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var startDt = $("#p_startDt").val().replace(/-/g,'');
		var endDt = $("#p_endDt").val().replace(/-/g,'');
		if(startDt>endDt){
			$.alert("提示","起始时间不能大于结束时间！");
			return;
		}else{
			param = {
						"startDt":($("#p_startDt").val()).replace(/-/g,''),
						"endDt":($("#p_endDt").val()).replace(/-/g,''),
						nowPage:curPage,
						pageSize:10
				};
			$.callServiceAsHtml(contextPath+"/app/cust/custQueryAddList",param,{
				"before":function(){
					$.ecOverlay("查询中请稍等...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(response && response.code == -2){
						return ;
					}else{
						if(curPage == 1){
							$("#cust_search").hide();
							$("#cust_list").html(response.data).show();
							$("#cust_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
						if(curPage > 1){
							$("#all_cust_list").append(response.data);
							$("#cust_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
					}
				},
				fail:function(){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}
	}
	
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_custQueryAddList(scrollObj.page,scrollObj.scroll);
		}
	};
	
	//客户架构信息查询接口
	var _queryCustCompreInfo = function(mainPhoneNum,provCustAreaId,busitypeflag,oldFlag){
		var param = {
			    "acctNbr": "",
			    "areaId": provCustAreaId,
			    "diffPlace": "local",
			    "identidies_type": "",
			    "identityCd": "",
			    "identityNum": "",
			    "olTypeCd": "8",
			    "operType": busitypeflag,
			    "partyName": "",
			    "prodClass": "12",
			    "queryType": "",
			    "queryTypeValue": ""
			};
		if(busitypeflag==1){
			param.queryTypeValue = mainPhoneNum;
			param.identidies_type = "客户编码";
			param.queryType = "custNumber";
		}else{
			param.acctNbr = mainPhoneNum;
			param.identidies_type = "接入号码";
		}
		$.ecOverlay("<strong>正在查询客户架构信息中,请稍等...</strong>");
		var response = $.callServiceAsJson(contextPath+"/token/pc/cust/queryCustCompreInfo", param);
		$.unecOverlay();
		if(response.code == 0) {
			if(response.data == null){
				$.alert("提示","客户架构信息接口无数据返回。");
				return false;
			}
			if(response.data.custInfos==undefined){
				$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
				return false;
			}else if(!ec.util.isArray(response.data.custInfos)){
				$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
				return false;
			}
			if(response.data.prodInstInfos==undefined && busitypeflag!=1){
				$.alert("提示","客户下没有可以办理业务的移动用户。");
				return false;
			}
			if(response.data.offerMemberInfos==undefined && busitypeflag!=1){
				$.alert("提示","查询销售品实例构成，没有返回成员实例无法继续受理。");
				return false;
			}
			if(oldFlag=="OLD"){
				var custInfos = response.data.custInfos;
				if(OrderInfo.actionFlag!=1 && custInfos[0].custId!=OrderInfo.cust.custId){
					$.alert("提示",mainPhoneNum+"和主卡的客户不一致！");
					return false;
				}
				var prodInstInfos = {};
				var prodInfos = response.data.prodInstInfos;
				$.each(prodInfos,function(){
					if(this.accNbr==mainPhoneNum){
						prodInstInfos = this;
						if(prodInstInfos.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
							$.alert("提示",mainPhoneNum+"不是在用产品！");
							return false;
						}
//						if(OrderInfo.actionFlag!=1 && prodInstInfos.feeType.feeType!=order.prodModify.choosedProdInfo.feeType){
//							$.alert("提示",mainPhoneNum+"和主卡的付费类型不一致！");
//							return false;
//						}
						if(prodInstInfos.productId=="280000000"){
							$.alert("提示",mainPhoneNum+"是无线宽带，不能纳入！");
							return false;
						}
						prodInstInfos.custId = custInfos[0].custId;
						OrderInfo.oldprodInstInfos.push(prodInstInfos);
					}
				})
				
				var flag = true;
				for ( var i = 0; i < response.data.offerMemberInfos.length; i++) {
					var member = response.data.offerMemberInfos[i];
					if(member.objType==""){
						$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
						return false;
					}else if(member.objType==CONST.OBJ_TYPE.PROD){
						if(member.accessNumber==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
							return false;
						}
					}
					if(member.objInstId==prodInstInfos.prodInstId){
						flag = false;
					}
				}
				if(flag){
					$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+prodInstInfos.accNbr+"】，无法继续受理，请业务后台核实");
					return false;
				}
				var offerInfos = {
					"offerMemberInfos":	response.data.offerMemberInfos,
					"offerId":prodInstInfos.mainProdOfferInstInfos[0].prodOfferInstId,
					"offerSpecId":prodInstInfos.mainProdOfferInstInfos[0].prodOfferId,
					"offerSpecName":prodInstInfos.mainProdOfferInstInfos[0].prodOfferName,
					"accNbr":prodInstInfos.accNbr
				};
				OrderInfo.oldoffer.push(offerInfos);
				order.memberChange.viceCartNum = 0;
				$.each(OrderInfo.oldoffer,function(){
					$.each(this.offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD){
							order.memberChange.viceCartNum++;
						}
					})
				});
			}else{
				var custInfos = response.data.custInfos;
				OrderInfo.cust={
					addressStr: custInfos[0].addressStr,
					areaId: custInfos[0].areaId,
					areaName: custInfos[0].areaName,
					authFlag: custInfos[0].authType,
					custFlag: custInfos[0].custFlag,
					custId: custInfos[0].custId,
					idCardNumber: custInfos[0].idCardNumber,
					identityCd: custInfos[0].identityCd,
					identityName: custInfos[0].identityName,
					norTaxPayer: "",
					partyName: custInfos[0].partyName,
					segmentId: custInfos[0].segmentId,
					segmentName: custInfos[0].segmentName,
					vipLevel: custInfos[0].vipLevel,
					vipLevelName: custInfos[0].vipLevelName
				}
				if(busitypeflag!=1){
					var prodInstInfos = response.data.prodInstInfos;
					if(prodInstInfos.length<1){
						$.alert("提示","省份未返回产品实例信息");
						return false;
					}
					order.prodModify.choosedProdInfo={
						accNbr: prodInstInfos[0].accNbr,
						areaCode: prodInstInfos[0].zoneNumber,
						areaId: prodInstInfos[0].areaId,
						corProdInstId: prodInstInfos[0].corProdInstId,
						custId: prodInstInfos[0].mainProdOfferInstInfos[0].custId,
						custName: prodInstInfos[0].mainProdOfferInstInfos[0].custName,
						endDt: prodInstInfos[0].mainProdOfferInstInfos[0].endDt,
						extProdInstId: prodInstInfos[0].extProductId,
						feeType: prodInstInfos[0].feeType.feeType,
						feeTypeName: prodInstInfos[0].feeType.feeTypeName,
						is3G: prodInstInfos[0].mainProdOfferInstInfos[0].is3G,
						prodBigClass: prodInstInfos[0].prodBigClass,
						prodClass: prodInstInfos[0].prodClass,
						prodInstId: prodInstInfos[0].prodInstId,
						prodOfferId: prodInstInfos[0].mainProdOfferInstInfos[0].prodOfferId,
						prodOfferInstId: prodInstInfos[0].mainProdOfferInstInfos[0].prodOfferInstId,
						prodOfferName: prodInstInfos[0].mainProdOfferInstInfos[0].prodOfferName,
						prodStateCd: prodInstInfos[0].prodStateCd,
						prodStateName: prodInstInfos[0].prodStateName,
						productId: prodInstInfos[0].productId,
						productName: prodInstInfos[0].productName,
						startDt: prodInstInfos[0].mainProdOfferInstInfos[0].startDt,
						stopRecordCd: prodInstInfos[0].prodStopRecords[0].stopRecordCd,
						stopRecordName: prodInstInfos[0].prodStopRecords[0].stopRecordName
					}
					var flag = true;
					for ( var i = 0; i < response.data.offerMemberInfos.length; i++) {
						var member = response.data.offerMemberInfos[i];
						if(member.objType==""){
							$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
							return false;
						}else if(member.objType==CONST.OBJ_TYPE.PROD){
							if(member.accessNumber==""){
								$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
								return false;
							}
						}
						if(member.objInstId==order.prodModify.choosedProdInfo.prodInstId){
							flag = false;
						}
					}
					if(flag){
						$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+order.prodModify.choosedProdInfo.accNbr+"】，无法继续受理，请业务后台核实");
						return false;
					}
					OrderInfo.offer.offerMemberInfos = response.data.offerMemberInfos; 
					OrderInfo.offer.offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
					OrderInfo.offer.offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
					OrderInfo.offer.offerSpecName = order.prodModify.choosedProdInfo.prodOfferName;
				}
			}
		}else{
			$.alertM(response.data);
			return false;
		}
		return true;
	};
	//客户鉴权--证件类型
	var _identityTypeAuth=function(id){

		var param = _choosedCustInfo;
		param.validateType="1";
		param.identityNum = $.trim($("#"+id).val());
		if(!ec.util.isObj(param.identityNum)){
			$.alert("提示","证件号码不能为空！");
			return;
		}
		param.accessNumber=OrderInfo.acctNbr;
		param.identityCd=OrderInfo.cust.identityCd;
		param.areaId=OrderInfo.cust.areaId;
		param.custId=OrderInfo.cust.custId;

		var recordParam={};
		
		if(id=="idCardNumberSub3"){
			recordParam.validateType="6";
		}
		else{
			recordParam.validateType="1";
		}
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/token/app/cust/custAuthSub",param);
		$.unecOverlay();
		//_saveAuthRecordFail(recordParam);  错误
		// _saveAuthRecordSuccess(recordParam);成功
		
		if(response.data.code=="0"){
			$("#auth2").css('display','none'); 
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
	
	//证件+使用人鉴权
    var _identityTypeAuthSub=function(){
    	//单位证件
		var UnitCertificate=$("#idCardNumberSub").val();
		if(!ec.util.isObj(UnitCertificate)){
			$.alert("提示","单位证件号码不能为空！");
			return;
		}
		//使用人证件
		var PersonCertificate=$("#idCardNumberSub1").val();
		if(!ec.util.isObj(PersonCertificate)){
			$.alert("提示","使用人证件号码不能为空！");
			return;
		}
		var param = _choosedCustInfo;
		var recordParam={};
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		//校验单位
		param.validateType="1";
		param.accessNumber=OrderInfo.acctNbr;
		param.identityCd=OrderInfo.cust.identityCd;
		param.areaId=OrderInfo.cust.areaId;
		param.custId=OrderInfo.cust.custId;
		param.identityNum = UnitCertificate;
		recordParam.validateType="5";
		recordParam.validateLevel="2";
		var response= $.callServiceAsJson(contextPath+"/token/app/cust/custAuthSub",param);
		if(response.data.code=="0"){
			//单位证件校验成功
			var param2 ={};
			param2.validateType="1";
			param2.accessNumber=OrderInfo.acctNbr;
			param2.identityCd=OrderInfo.rulesJson.identidyTypeCd;  //证件类型
			param2.areaId=OrderInfo.cust.areaId;
			param2.custId=OrderInfo.cust.custId;
			param2.identityNum =PersonCertificate;
			var response= $.callServiceAsJson(contextPath+"/token/app/cust/custAuthSub",param2);
			if(response.data.code=="0"){
				//单位证件和使用人证件都校验成功
				OrderInfo.authRecord.validateType="3";
				OrderInfo.authRecord.resultCode="0";
				_saveAuthRecordSuccess(recordParam);
				_goService();
			}
			else{
				//错误
				_saveAuthRecordFail(recordParam);
				$.alertM(response.data);
			}
			
		}
		else{
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
		var response= $.callServiceAsJson(contextPath+"/token/app/cust/custAuthSub",param);
		$.unecOverlay();
		//_saveAuthRecordFail(recordParam);  错误
		// _saveAuthRecordSuccess(recordParam);成功
		
		if(response.data.isValidate=="true"){
			$("#auth2").css('display','none'); 
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
	//跳过鉴权
	var _jumpAuth2 = function() {
		
		var checkType  = "";
		if(OrderInfo.actionFlag==2){//套餐变更
			checkType = "1";
		}else if(OrderInfo.actionFlag==3){//主副卡成员变更
			checkType = "4";
		}else if(OrderInfo.actionFlag==14){//可选包变更
			checkType = "3";
		}
		if(checkType !=""){
			//查分省前置校验开关
	        var propertiesKey = "TOKENPRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
		    var isPCF = offerChange.queryPortalProperties(propertiesKey);
		    if(isPCF == "ON"){
	        	if(OrderInfo.preBefore.prcFlag != "Y"){
	        		if(!order.prodModify.preCheckBeforeOrder(checkType,"cust.goService")){
	            		return ;
	            	}
	        	}
	        }
	        OrderInfo.preBefore.prcFlag = ""; 
		}
		
		var recordParam={};
		recordParam.validateType="4";
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		//记录到日志里
		cust.saveAuthRecordFail(recordParam);
		OrderInfo.authRecord.validateType="4";
		OrderInfo.authRecord.resultCode="0";
		if (OrderInfo.authRecord.resultCode == "0") {
		//	
			
			//如果是套餐变更
			if(OrderInfo.actionFlag==2){
				$("#auth2").css('display','none'); 
				var sy=$("#order_prepare").css("display");
				if(sy=="none"){
					$("#order_prepare") .css('display', 'block');
				}
				offerChangeNew.init();
				
			}
			//主副卡
			else if(OrderInfo.actionFlag==3){
				$("#auth2").css('display','none');
				var sy=$("#member_prepare").css("display");
				if(sy=="none"){
					$("#member_prepare") .css('display', 'block');
				}
				order.memberChange.init();
			}
			//可选包
			else if(OrderInfo.actionFlag==14){
				$("#auth2").css('display','none');
				var sy=$("#order-content").css("display");
				if(sy=="none"){
					$("#order-content") .css('display', 'block');
				}
				AttachOffer.init();
			}
			//新装
			else if(OrderInfo.actionFlag=="1"){
				$("#auth2").css('display','none');
				var prodOfferId=OrderInfo.provinceInfo.prodOfferId;
				if(prodOfferId!="" && prodOfferId!=null &&prodOfferId!="null"){
					order.service.buyService(prodOfferId,"");
				}
				else{
					 $("#order_prepare").css('display','block');
					order.service.init();
				}
				
			}
			OrderInfo.authRecord.resultCode = "";
			OrderInfo.authRecord.validateType = "";
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
		recordParam.validateLevel="1";
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
					$("#auth2").css('display','none'); 
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
	var _goService=function (){
		
		
		var checkType  = "";
		if(OrderInfo.actionFlag==2){//套餐变更
			checkType = "1";
		}else if(OrderInfo.actionFlag==3){//主副卡成员变更
			checkType = "4";
		}else if(OrderInfo.actionFlag==14){//可选包变更
			checkType = "3";
		}
		if(checkType != ""){
			//查分省前置校验开关
	        var propertiesKey = "TOKENPRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
		    var isPCF = offerChange.queryPortalProperties(propertiesKey);
		    if(isPCF == "ON"){
	        	if(OrderInfo.preBefore.prcFlag != "Y"){
	        		if(!order.prodModify.preCheckBeforeOrder(checkType,"cust.goService")){
	            		return ;
	            	}
	        	}
	        }
	        OrderInfo.preBefore.prcFlag = "";   
		}
	
		//easyDialog.close();
	//	if (OrderInfo.authRecord.resultCode == "0") {
			//如果是套餐变更
			if(OrderInfo.actionFlag==2){
				$("#auth2").css('display','none'); 
				var sy=$("#order_prepare").css("display");
				if(sy=="none"){
					$("#order_prepare") .css('display', 'block');
				}
				offerChangeNew.init();
				
			}
			//主副卡
			else if(OrderInfo.actionFlag==3){
				$("#auth2").css('display','none');
				var sy=$("#member_prepare").css("display");
				if(sy=="none"){
					$("#member_prepare") .css('display', 'block');
				}
				order.memberChange.init();
			}
			//可选包
			else if(OrderInfo.actionFlag==14){
				$("#auth2").css('display','none');
				var sy=$("#order-content").css("display");
				if(sy=="none"){
					$("#order-content") .css('display', 'block');
				}
				AttachOffer.init();
			}
			else if(OrderInfo.actionFlag==1){
				$("#auth2").css('display','none');
				var prodOfferId=OrderInfo.provinceInfo.prodOfferId;
				if(prodOfferId!="" && prodOfferId!=null &&prodOfferId!="null"){
					order.service.buyService(prodOfferId,"");
				}
				else{
					 $("#order_prepare").css('display','block');
					order.service.init();
				}
			}
			OrderInfo.authRecord.resultCode = "";
			OrderInfo.authRecord.validateType = "";
	//	}
		
	};
	//鉴权方式日志记录
	var _saveAuthRecord=function(param){
		var url=contextPath+"/token/secondBusi/saveAuthRecord";
		var response= $.callServiceAsJson(url,param);
		if(response.code==0){
			var result=response.data.result;
			//CacheData.setRecordId(result.recordId);
			OrderInfo.recordId=result.recordId;
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
	
	// 判断是否是政企客户(入参identityCd 为要判断的证件类型)
	var _isCovCust = function (identityCd) {
		var isGovCustFlag = false;
		for (var i = 0; i < CacheData.getGovCertType().length; i ++) {
			if (identityCd == CacheData.getGovCertType()[i]) {
				isGovCustFlag = true;
				break;
			}
		}
		return isGovCustFlag;
	};

	//使用人展示客户鉴权
	var _showCustAuth = function(scope,type) {
		_custFlag = type;
		var a=$(scope).attr("custId");
		_choosedCustInfo = {
			custId : $(scope).attr("custId"), //$(scope).find("td:eq(3)").text(),
			partyName : $(scope).attr("partyName"), //$(scope).find("td:eq(0)").text(),
			CN : $(scope).attr("CN"),
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
			accNbr:$(scope).attr("accNbr"),
			userIdentityCd:$(scope).attr("userIdentityCd"),//使用人证件类型
			userIdentityName:$(scope).attr("userIdentityName"),//使用人证件名称
			userIdentityNum:$(scope).attr("userIdentityNum"),//使用人证件号码
			accountName:$(scope).attr("accountName"),//账户名
			userName:$(scope).attr("userName"),//使用人名
			userCustId:$(scope).attr("userCustId"),//使用人客户id
			isSame:$(scope).attr("isSame")//使用人名称与账户名称是否一致
			};
		//设置被选择标识
		_checkUserInfo.accNbr = "";
		_checkUserInfo.accNbr = $(scope).attr("accNbr");
		$(scope).attr("selected","selected");
		$(scope).siblings().each(function () {
				$(this).removeAttr("selected");
		});
		if(_custFlag == "jbr"){
			order.main.showJbrInfo(_choosedCustInfo);
			return;
		} 
		// 判断是否是政企客户
		var isGovCust = false;
		for (var i = 0; i < CacheData.getGovCertType().length; i ++) {
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
		var menuName = $("#menuName").attr("menuName");
		if(ec.util.isObj(menuName)&&(CONST.MENU_FANDANG==menuName||CONST.MENU_CUSTFANDANG==menuName||CONST.MENU_RETURNFILE==menuName)){
			authFlag = "1";
		}
		if(authFlag=="0"){
			//TODO init view 
			if(cust.authType == '00'){
				$("#custAuthTypeName").html("客户密码：");
			} else {
				$("#custAuthTypeName").html("产品密码：");
			}

			if (govSwitch == "ON" && isGovCust) {
				if(!ec.util.isObj(_choosedCustInfo.userCustId)&&ec.util.isObj(_choosedCustInfo.accNbr)){
					$.alert("提示","返回的使用人信息为空，请补全信息！");
					return;
				}
				//政企客户隐藏个人证件鉴权方式【2】
				$("#auth3").find("#auth_tab2").hide();
				$("#auth3").find("#content2").hide();

				//设置单位证件+使用人证件【5】
				$("#auth3").find("#idCardTypeUnit5").text(_choosedCustInfo.identityName);
				$("#auth3").find("#idCardType5").text(_choosedCustInfo.userIdentityName);
				if (_choosedCustInfo.userIdentityCd == "1") {
					$("#auth3").find("#readCertBtnID5").show();
					$("#auth3").find("#idCardNumber5").attr("disabled", "disabled");
				} else {
					$("#auth3").find("#readCertBtnID5").hide();
					$("#auth3").find("#idCardNumber5").removeAttr("disabled");
				}

				//设置单位证件【6】
				$("#auth3").find("#idCardType6").text(_choosedCustInfo.identityName);

				//设置使用人【7】
				$("#auth3").find("#idCardType7").text(_choosedCustInfo.userIdentityName);
				$("#auth3").find("#auth7userName").text(_choosedCustInfo.userName);
				$("#auth3").find("#auth7accountName").text(_choosedCustInfo.accountName);
				$("#auth3").find("#auth7isSame").text(_choosedCustInfo.isSame == "Y" ? "是" : "否");
				if (_choosedCustInfo.userIdentityCd == "1") {
					$("#auth3").find("#readCertBtnID7").show();
					$("#auth3").find("#idCardNumber7").attr("disabled", "disabled");
				} else {
					$("#auth3").find("#readCertBtnID7").hide();
					$("#auth3").find("#idCardNumber7").removeAttr("disabled");
				}


				var canRealName = $(scope).attr('canrealname');
				// 针对实名制标识canRealName=""的情况做提示
				if (!ec.util.isObj(canRealName)) {
					$.alert("提示", "canRealName为空，当前为非实名制客户，请先沟通营业员进行资料补登。");
					return;
				}
				var accessNumber = _choosedCustInfo.accNbr;
				//接入号定位，直接使用输入的接入号
				if (-1 == $("#p_cust_identityCd").val()) {
					accessNumber = $.trim($("#p_cust_identityNum").val());
				}
				//没有使用人信息接入号只有一个单位证件鉴权方式
				if (!ec.util.isObj(accessNumber)) {
					//只显示单位证件鉴权
					$("#auth3").find("#auth_tab1").removeClass();
					$("#auth3").find("#auth_tab1").hide();
					$("#auth3").find("#auth_tab2").removeClass();
					$("#auth3").find("#auth_tab2").hide();
					$("#auth3").find("#auth_tab3").removeClass();
					$("#auth3").find("#auth_tab3").hide();
					$("#auth3").find("#auth_tab5").removeClass();
					$("#auth3").find("#auth_tab5").hide();
					$("#auth3").find("#auth_tab6").addClass("setcon");
					$("#auth3").find("#auth_tab6").show();
					$("#auth3").find("#auth_tab7").removeClass();
					$("#auth3").find("#auth_tab7").hide();
					$("#auth3").find("#content1").hide();
					$("#auth3").find("#content2").hide();
					$("#auth3").find("#content3").hide();
					$("#auth3").find("#content5").hide();
					$("#auth3").find("#content6").show();
					$("#auth3").find("#content7").hide();
				} else {
					$("#auth3").find("#auth_tab1").addClass("setcon");
					$("#auth3").find("#auth_tab2").removeClass();
					$("#auth3").find("#auth_tab3").removeClass();
					$("#auth3").find("#auth_tab5").removeClass();
					$("#auth3").find("#auth_tab6").removeClass();
					$("#auth3").find("#auth_tab7").removeClass();
					$("#auth3").find("#auth_tab1").show();
					$("#auth3").find("#auth_tab2").hide();
					$("#auth3").find("#auth_tab3").show();
					$("#auth3").find("#auth_tab5").show();
					$("#auth3").find("#auth_tab6").show();
					$("#auth3").find("#auth_tab7").show();
					$("#auth3").find("#content1").show();
					$("#auth3").find("#content2").hide();
					$("#auth3").find("#content3").hide();
					$("#auth3").find("#content5").hide();
					$("#auth3").find("#content6").hide();
					$("#auth3").find("#content7").hide();
				}
			} else {
				$("#auth3").find("#idCardType2").text(_choosedCustInfo.identityName);
				if (_choosedCustInfo.identityCd == "1") {
					$("#auth3").find("#readCertBtnID2").show();
					if(typeof(parent.bindStatus) != "undefined" && parent.bindStatus){
						$("#auth3").find("#discernBtn_5").show();
					}
					$("#auth3").find("#idCardNumber2").attr("disabled", "disabled");
				} else {
					$("#auth3").find("#readCertBtnID2").hide();
					$("#auth3").find("#discernBtn_5").hide();
					$("#auth3").find("#idCardNumber2").removeAttr("disabled");
				}
				var canRealName = $(scope).attr('canrealname');
				// 新疆-未实名号码查询定位异常 canRealName=""
				if (!ec.util.isObj(canRealName)) {
					$.alert("提示", "canRealName为空，当前为非实名制客户，请先沟通营业员进行资料补登。");
					return;
				}
				var accessNumber = _choosedCustInfo.accNbr;
				if (-1 == $("#p_cust_identityCd").val()) {
					accessNumber = $.trim($("#p_cust_identityNum").val());
				}
				if (!ec.util.isObj(accessNumber)) {
					$("#auth3").find("#auth_tab1").removeClass();
					$("#auth3").find("#auth_tab1").hide();
					$("#auth3").find("#auth_tab2").addClass("setcon");
					$("#auth3").find("#auth_tab3").removeClass();
					$("#auth3").find("#auth_tab3").hide();
					$("#auth3").find("#content1").hide();
					$("#auth3").find("#content2").show();
					$("#auth3").find("#content3").hide();
				} else {
					$("#auth3").find("#auth_tab1").addClass("setcon");
					$("#auth3").find("#auth_tab2").removeClass();
					$("#auth3").find("#auth_tab3").removeClass();
					$("#auth3").find("#auth_tab1").show();
					$("#auth3").find("#auth_tab2").show();
					$("#auth3").find("#auth_tab3").show();
					$("#auth3").find("#content1").show();
					$("#auth3").find("#content2").hide();
					$("#auth3").find("#content3").hide();
				}
				$("#auth3").find("#auth_tab5").hide();
				$("#auth3").find("#auth_tab6").hide();
				$("#auth3").find("#auth_tab7").hide();
				$("#auth3").find("#content5").hide();
				$("#auth3").find("#content6").hide();
				$("#auth3").find("#content7").hide();
			}
			
			//初始化弹出窗口
			initAuth3();
			if (ec.util.isObj(canRealName) && 1 == canRealName) {
				$("#auth3").modal("show");
			}else{
				_realCheck(contextPath, scope);
			}
			if(cust.jumpAuthflag=="0"){
				$("#auth3").find("#jumpAuth1").show();
				$("#auth3").find("#jumpAuth2").show();
				$("#auth3").find("#jumpAuth3").show();
			}
		} else{
			_custAuth(scope);
		}
	};
	

	/**
	 * 客户定位鉴权窗初始化
	 */
	function initAuth3() {
		$("#auth3").find("#authPassword2").val("");
		$("#auth3").find("#idCardNumber2").val("");
		$("#auth3").find("#smspwd2").val("");
		$("#auth3").find("#idCardNumberUnit5").val("");
		$("#auth3").find("#idCardNumber5").val("");
		$("#auth3").find("#idCardNumber6").val("");
		$("#auth3").find("#auth7userName").val("");
		$("#auth3").find("#auth7accountName").val("");
		$("#auth3").find("#auth7isSame").val("");
		$("#auth3").find("#idCardNumber7").val("");
	}

	//实名制校验
	var _realCheck = function (context, scope) {
		if($(scope).attr("identityCd") != 1){
			if(_custFlag == "jbr"){
				order.main.showJbrInfo(_choosedCustInfo);
				return;
			} 
		}
		var canRealName = "";
		// 使用人实名制从#custInfos节点获取不准确
		if (ec.util.isObj(scope)) {
			canRealName = $(scope).attr('canrealname');
		} else {
			canRealName = $('#custInfos').parent().children('[selected="selected"]').attr('canrealname');
		}
		if (ec.util.isObj(canRealName) && 1 != canRealName) {
//			$.alert("提示", "当前为非实名制客户，请先沟通营业员进行资料补登。","confirmation", function () {
//				var url = window.location.protocol + '//' + window.location.host + context + "/main/home";
//				window.location = url;
//			});
			$.alert("提示", "当前为非实名制客户，请先联系营业员进行资料补登。");
		}
	};
	
	/**
	 * 使用人客户鉴权
	 */
	var _custAuth = function(scope) {
		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#auth3").find("#authPassword2").val());
		param.authFlag=authFlag;
		$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				//鉴权成功后显示选择使用人弹出框
				order.main.showChooseUserDialog(param);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//使用人跳过鉴权
	var _jumpAuth = function() {
		if(cust.jumpAuthflag!="0"){
			$.alert("提示","没有跳过校验权限！");
			return;
		}
		var param = JSON.stringify(_choosedCustInfo);
		var recordParam={};
		recordParam.validateType="4";
		recordParam.validateLevel="1";
		recordParam.custId=_choosedCustInfo.custId;
		recordParam.accessNbr=_choosedCustInfo.accessNumber;
		recordParam.certType=_choosedCustInfo.identityCd;
		recordParam.certNumber=_choosedCustInfo.idCardNumber;
		param.authFlag="1";
		$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
//					recordParam.resultCode = "1";
//					_saveAuthRecord2(recordParam);
					return;
				}		
				//鉴权成功后隐藏鉴权，显示选择使用人弹出框
				$("#auth3").modal("hide");
				$('#chooseUserList').show();
				if(_custFlag == "jbr"){
					order.main.showJbrInfo(_choosedCustInfo);
				} else {
					order.main.showChooseUserTable(_choosedCustInfo);
				}
				
				OrderInfo.cust_validateType="4";//保存鉴权方式
//				recordParam.resultCode = "0";
//				_saveAuthRecord2(recordParam);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	//客户鉴权--产品密码--app
	var _productPwdAuth2=function(){

		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#authPassword2").val());
		if(!ec.util.isObj(param.prodPwd)){
			$.alert("提示","产品密码不能为空！");
			return;
		}
		param.validateType = "3";
		param.accessNumber=_choosedCustInfo.accNbr;		
		var recordParam={};
		recordParam.validateType="3";
		recordParam.validateLevel="2";
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accNbr;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/app/cust/custAuthSub",JSON.stringify(param));
		$.unecOverlay();
		//_saveAuthRecordFail(recordParam);  错误
		// _saveAuthRecordSuccess(recordParam);成功
		
		if(response.data.isValidate=="true"){
			//鉴权成功后隐藏鉴权，显示选择使用人弹出框
			$("#auth3").modal("hide");
			$('#chooseUserList').show();
			if(_custFlag == "jbr"){
				order.main.showJbrInfo(_choosedCustInfo);
			} else {
				order.main.showChooseUserTable(_choosedCustInfo);
			}
			OrderInfo.cust_validateType="3";//保存鉴权方式
			OrderInfo.authRecord.validateType="3";
			OrderInfo.authRecord.resultCode="0";
//			recordParam.resultCode = "0";
//			_saveAuthRecord2(recordParam);
			//_goService();
			
			
		}else{
			//错误
//			recordParam.resultCode = "1";
//			_saveAuthRecord2(recordParam);
			$.alertM(response.data);
		}
		
	};

	//鉴权日志记录
	var _saveAuthRecord2=function(param){
		var url=contextPath+"/secondBusi/saveAuthRecord";
		var response= $.callServiceAsJson(url,param);
		if(response.code==0){
			var result=response.data.result;
			//CacheData.setRecordId(result.recordId);
			OrderInfo.recordId=result.recordId;
		}else{
			$.alertM(response.data);
		}
	};

	//客户鉴权--证件类型-app
	var _identityTypeAuth2=function(id){

		var param = _choosedCustInfo;
		param.validateType="1";
		param.identityNum = $.trim($("#"+id).val());
		if(!ec.util.isObj(param.identityNum)){
			$.alert("提示","证件号码不能为空！");
			return;
		}
		param.accessNumber=_choosedCustInfo.accNbr;
		param.identityCd=param.identityCd;
		param.areaId=param.areaId;
		param.custId=param.custId;

		var recordParam={};
		
		if(id=="idCardNumberSub3"){
			recordParam.validateType="6";
		}
		else{
			recordParam.validateType="1";
		}
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=_choosedCustInfo.accNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/app/cust/custAuthSub",JSON.stringify(param));
		$.unecOverlay();
		//_saveAuthRecordFail(recordParam);  错误
		// _saveAuthRecordSuccess(recordParam);成功
		
		if(response.data.code=="0"){
			//鉴权成功后隐藏鉴权，显示选择使用人弹出框
			$("#auth3").modal("hide");
			$('#chooseUserList').show();
			if(_custFlag == "jbr"){
				order.main.showJbrInfo(_choosedCustInfo);
			} else {
				order.main.showChooseUserTable(_choosedCustInfo);
			}
			OrderInfo.cust_validateType="3";//保存鉴权方式
			OrderInfo.authRecord.validateType="3";
			OrderInfo.authRecord.resultCode="0";
//			recordParam.resultCode = "0";
//			_saveAuthRecord2(recordParam);
//			_goService();
			
		}else{
			//错误
//			recordParam.resultCode = "1";
//			_saveAuthRecord2(recordParam);
			$.alertM(response.data);
		}
	};
	
	//短信发送--app
	var _smsResend2 = function () {
		var param = {
			"pageIndex": 1,
			"pageSize": 10,
			"phone":_choosedCustInfo.acctNbr
		};
		$.callServiceAsJson(contextPath + "/app/staffMgr/reSendSub", param, {
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
	
	//多种鉴权方式的tab页切换--app
	var _changeTab2 = function (tabId) {
		$.each($("#auth_tab"+tabId).parent().find("li"),function(){
			$(this).removeClass("setcon");
		});
		$("#auth_tab"+tabId).addClass("setcon");
//		$.each($("#contents div"),function(){
//			$(this).hide();
//		});
		$("#content1").hide();
		$("#content2").hide();
		$("#content3").hide();
		$("#content"+tabId).show();
		if (tabId == 2) {
			if (_choosedCustInfo.identityCd == 1) {
				$("#idCardNumber2").attr("disabled", "disabled");
			} else {
				$("#idCardNumber2").removeAttr("disabled");
			}
		}
	};
	//短信验证--app
	var _smsvalid2=function(){
		if(!ec.util.isObj($("#smspwd2").val())){
			$.alert("提示","验证码不能为空！");
			return;
		}
		var smspwd2=$("#smspwd2").val();
		var params = "smspwd=" + smspwd2+"&number="+_choosedCustInfo.accNbr;
		var param = _choosedCustInfo;
		var recordParam={};
		recordParam.validateType="2";
		recordParam.validateLevel="1";
		recordParam.custId=param.custId;
		recordParam.accessNbr=_choosedCustInfo.accNbr;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;


		$.callServiceAsJson(contextPath+"/passwordMgr/smsValid", params, {
			"before":function(){
				$.ecOverlay("<strong>验证短信随机码中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				if(response.code==0){
					//鉴权成功后隐藏鉴权，显示选择使用人弹出框
					$("#auth3").modal("hide");
					$('#chooseUserList').show();
					if(_custFlag == "jbr"){
						order.main.showJbrInfo(_choosedCustInfo);
					} else {
						order.main.showChooseUserTable(_choosedCustInfo);
					}
					OrderInfo.cust_validateType="2";//保存鉴权方式 
					OrderInfo.authRecord.validateType="2";
					OrderInfo.authRecord.resultCode="0";
//					_saveAuthRecordSuccess(recordParam);
//					_goService();
				}else{
					$.unecOverlay();
					$.alert("提示",response.data);
//					_saveAuthRecordFail(recordParam);
				}
			},
			"fail" : function(response){
//				_saveAuthRecordFail(recordParam);
			},
			"always":function(){
				//$.unecOverlay();
			}
		});
	};
	
 //使用人读卡后回调
	var _getGenerationInfos2=function(name,idcard,address,identityPic){
		$("#idCardNumber2").val(idcard);
		OrderInfo.user.identityPic = identityPic;
		
	};
	
	var _getIp=function(Ip){
		OrderInfo.curIp = Ip;
	}
	
	var _callPhotos=function(method){
//		var isGov = _isCovCust(OrderInfo.cust.identityCd);
		var isJbrCustSame = (OrderInfo.cust.partyName == $("#orderAttrName").val());
		var jbrIdentityCd = $("#div_cm_identidiesType  option:selected").val();
		var userIdentityCd="";
		var hasUser = false;
//		var isUserCustSame = false;
//		var isJbrUserSame = false;
		var chooseUserInfo = OrderInfo.getChooseUserInfo(order.prodModify.choosedProdInfo.productId);
//		if(!chooseUserInfo){
//			hasUser = true;
//			if(chooseUserInfo.tmpChooseUserInfo.partyName == OrderInfo.cust.partyName){
//				isUserCustSame = true;
//			} else if(chooseUserInfo.tmpChooseUserInfo.partyName == $("#orderAttrName").val()){
//				isJbrUserSame = true;
//			}
//			
//		}
//		$.alert("dd","OrderInfo.cust.isGov -- " + isGov+
//				"  OrderInfo.cust.identityCd -- "+OrderInfo.cust.identityCd +
//				"  OrderInfo.cust.partyName -- " + OrderInfo.cust.partyName +
//				"  OrderInfo.cust.identityNum -- " + OrderInfo.cust.identityNum +
//				"  isJbrCustSame -- " +  isJbrCustSame +
//				"  prodId -- " + order.prodModify.choosedProdInfo.productId
//				);
//		var type = "0";
//		if(jbrIdentityCd == 1){
//			if(!CusrInfo.cust.identityPic && !CustInfo.jbrCertPic){
//				$.alert("提示","请进行经办人身份证件扫描！");
//			}
//		}
		common.callPhotos(method);
//		if(!isGov){
//			if(hasUser){
//				if(OrderInfo.cust.identityCd =='1' && isUserCustSame){//1、公众客户，经办人是本人 客户证件类型是身份证 有副卡
//					type = "6";
//				} else if(OrderInfo.cust.identityCd !='1' && isUserCustSame){//2、公众客户 非身份证 同一人 有副卡
//					type = "7";
//				} else if(OrderInfo.cust.identityCd =='1' && !isUserCustSame){//2、公众客户 非身份证 同一人 有副卡
//					type = "8";
//				}
//			} else {
//				if(OrderInfo.cust.identityCd =='1' && isJbrCustSame){//1、公众客户，经办人是本人 客户证件类型是身份证 无副卡
//					type = "1";
//				} else if(OrderInfo.cust.identityCd !='1' && isJbrCustSame){//2、公众客户 非身份证 同一人 无副卡
//					type = "2";
//				} else if(OrderInfo.cust.identityCd =='1' && jbrIdentityCd =='1' && !isJbrCustSame){//3、公众客户，经办人是他人 客户证件类型是身份证 经办人证件类型是身份证 无副卡
//					type = "3";
//				} else if(OrderInfo.cust.identityCd =='1' && jbrIdentityCd !='1'&& !isJbrCustSame){//4、公众客户，经办人是他人 客户证件类型是身份证 经办人证件类型不是身份证 无副卡
//					type = "4";
//				} else if(OrderInfo.cust.identityCd !='1' && jbrIdentityCd !='1'&& !isJbrCustSame){//5、公众客户，经办人是他人 客户证件类型不是身份证 经办人证件类型不是身份证 无副卡
//					type = "5";
//				} 
//			}
//			
//		} else{
//			
//		}
//		var str = "{\"picturesInfo\":[{\"orderInfo\":\"XXXXXXXXX\",\"picFlag\":\"A\",\"custName\":\"hiuu\",\"certType\":\"身份证\",\"certNumber\":\"902222222\",\"accNbr\":\"123456666\"},\"orderInfo\":\"XXXXXXXXX\",\"picFlag\":\"B\",\"custName\":\"hiuu\",\"certType\":\"身份证\",\"certNumber\":\"902222222\",\"accNbr\":\"123456666\"},{\"orderInfo\":\"XXXXXXXXX\",\"picFlag\":\"C\",\"custName\":\"hiuu\",\"certType\":\"身份证\",\"certNumber\":\"902222222\",\"accNbr\":\"123456666\"},{\"orderInfo\":\"\",\"picFlag\":\"D\",\"custName\":\"hiuu\",\"certType\":\"身份证\",\"certNumber\":\"902222222\",\"accNbr\":\"123456666\"}]}";
		
	};
	 //宽带甩单经办人拍照完回调方法
	var _getPicture2=function(olId,pictures){
		var picturesJson=$.parseJSON(pictures);
		var picturesInfo=picturesJson.picturesInfo;
		for(var i=0;i<picturesInfo.length;i++){//原生返回照片列表
			if(picturesJson.picturesInfo[i].picFlag=="D"){//经办人拍照照片
				order.broadband.jbrPictureName=picturesJson.picturesInfo[i].fileName;
			}
		}	
		order.broadband.haveCallPhote=true;
		OrderInfo.virOlId = olId;
	};
	
	//宽带甩单读卡获取经办人信息
	var _getjbrGenerationInfos2=function(name,idcard,address,identityPic){
		order.broadband.queryJbr(idcard);
		$("#orderAttrName").val(name);
		$("#sfzorderAttrIdCard").val(idcard);
		$("#orderAttrAddr").val(address);
		OrderInfo.jbr.identityPic = identityPic;//证件照片
		var custIdentidiesTypeCd=OrderInfo.cust.identityCd;//客户证件类型
		var custNumber=OrderInfo.cust.idCardNumber;//客户证件号码
		var jbrIdentidiesTypeCd=$("#orderIdentidiesTypeCd  option:selected").val();//经办人证件类型
		var jbrIdentityNum;
		if(jbrIdentidiesTypeCd==1){
			jbrIdentityNum = $('#sfzorderAttrIdCard').val();//证件号码
		}else{
			jbrIdentityNum = $('#orderAttrIdCard').val();//证件号码
		}
		if(custIdentidiesTypeCd==jbrIdentidiesTypeCd && custNumber==jbrIdentityNum){//经办人为本人,无需查询
			order.broadband.isSameOne=true;
			return;
		}
		order.broadband.isSameOne=false;
		

	};
	
	return {
		jbridentidiesTypeCdChoose 	: 		_jbridentidiesTypeCdChoose,
		jbrvalidatorForm 			: 		_jbrvalidatorForm,
		jbrpartyTypeCdChoose 		: 		_jbrpartyTypeCdChoose,
		jbrcertTypeByPartyType 		: 		_jbrcertTypeByPartyType,
		getjbrGenerationInfos		:		_getjbrGenerationInfos,
		scroll 						: 		_scroll,
		custQueryAddList 			: 		_custQueryAddList,
		custQueryAdd 				: 		_custQueryAdd,
		getIdentidiesTypeCd 		: 		_getIdentidiesTypeCd,
		identidiesTypeCdChoose		:		_identidiesTypeCdChoose,
		validatorForm				:		_validatorForm,
		initNewCust					:		_initNewCust,
		initUpdateCust				:		_initUpdateCust,
		clearCustForm				:		_clearCustForm,
		getCustInfo					:		_getCustInfo,
		getGenerationInfos			:		_getGenerationInfos,
		getIDCardInfos				: 		_getIDCardInfos,
		getPicture					:		_getPicture,
		queryCustCompreInfo			:		_queryCustCompreInfo,
		saveAuthRecordFail:_saveAuthRecordFail,
		saveAuthRecordSuccess:_saveAuthRecordSuccess,
		saveAuthRecord:_saveAuthRecord,
		identityTypeAuth:_identityTypeAuth,
		identityTypeAuthSub:_identityTypeAuthSub,
		jumpAuth2:_jumpAuth2,
		changeTab:_changeTab,
		productPwdAuth:_productPwdAuth,
		smsResend:_smsResend,
		smsvalid:_smsvalid,
		isSelfChannel:_isSelfChannel,
		goService:_goService,
		isCovCust:_isCovCust,
		jumpAuthflag:_jumpAuthflag,
		showCustAuth:_showCustAuth,
		realCheck:_realCheck,
		checkUserInfo:_checkUserInfo,
		queryForChooseUser:_queryForChooseUser,
		jumpAuth:_jumpAuth,
		tmpChooseUserInfo : _tmpChooseUserInfo,
		tmpJbrInfo:_tmpJbrInfo,
		choosedCustInfo:_choosedCustInfo,
		productPwdAuth2:_productPwdAuth2,
		identityTypeAuth2:_identityTypeAuth2,
		smsResend2      :_smsResend2,
		changeTab2    :_changeTab2,
		smsvalid2    :_smsvalid2,
		getGenerationInfos2:_getGenerationInfos2,
		callPhotos:_callPhotos,
		getIp:_getIp,
		jbrSubmit:_jbrSubmit,
		getJbrInfo:_getJbrInfo,
		getUserInfo:_getUserInfo,
		certTypeByPartyType:_certTypeByPartyType,
		uservalidatorForm:_uservalidatorForm,
		useridentidiesTypeCdChoose 	: 		_useridentidiesTypeCdChoose,
		userpartyTypeCdChoose 		: 		_userpartyTypeCdChoose,
		usercertTypeByPartyType 	: 		_usercertTypeByPartyType,
		getUserGenerationInfos		:		_getUserGenerationInfos,
		clearJbrForm				:		_clearJbrForm,
		clearUserForm				:		_clearUserForm,
		getPicture2                 :       _getPicture2,
		getjbrGenerationInfos2      :       _getjbrGenerationInfos2,
		newUIFalg					:		_newUIFalg
	};	
})();
// OrderInfo.boCustInfos.partyTypeCd = 1 ;//客户类型
//$(document).ready(function() {
//	order.prodModify.validatorForm();
//	order.prodModify.getIdentidiesTypeCd();//初始化证件类型
//});
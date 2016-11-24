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
	//客户鉴权跳转权限
	var _jumpAuthflag="";
	var _queryForChooseUser = false;
	var authFlag = null; 
	var _orderBtnflag="";
	var _clearCustForm = function(){
		$('#cmCustName').val("");
		$('#cmAddressStr').val("");
		$('#telNumber').val("");
		$('#mailAddressStr').val("");
		$('#cmCustIdCard').val("");
		$('#cmCustIdCardOther').val("");
		cust.validatorForm();
	};
	
	//客户新增提交
	var _newCustSubmit = function(){
		$('#custFormdata').data('bootstrapValidator').validate();
		if($('#custFormdata').data('bootstrapValidator').isValid()){
			/*var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}*/
			_custSubmit();
			//_checkIdentity();
		}
	};
	
	//客户新增提交
	var _agentNewCustSubmit = function(){
		$('#custFormdata').data('bootstrapValidator').validate();
		if($('#custFormdata').data('bootstrapValidator').isValid()){
			/*var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}*/
			_agentCheckIdentity();
		}
	};
	
	
	var _custSubmit = function(){
		if(OrderInfo.cust.custId==undefined){
			OrderInfo.cust = { //保存客户信息
				custId : "",
				partyName : "",
				vipLevel : "",
				vipLevelName : "",
				custFlag :"1100", //1000：红客户，1100：白客户，1200：黑客户
				identityPic : ""
			}
		}
		//从页面信息读取到cust缓存
		OrderInfo.cust.custId = -1;//客户地区
		OrderInfo.cust.partyName = $('#cmCustName').val();//客户名称
		OrderInfo.cust.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.cust.telNumber = $('#telNumber').val();//联系电话
		OrderInfo.cust.addressStr = $('#cmAddressStr').val();//客户地址
		OrderInfo.cust.mailAddressStr = $('#mailAddressStr').val();//通信地址
		OrderInfo.cust.identityCd = $('#cm_identidiesTypeCd').val();//证件类型
		//联系人不为空时才封装联系人信息上传
		if($.trim($('#contactName').val()).length>0){
			OrderInfo.boPartyContactInfo.contactName = $.trim($('#contactName').val());//联系人
			OrderInfo.boPartyContactInfo.mobilePhone = $.trim($('#mobilePhone').val());//联系人手机
			OrderInfo.boPartyContactInfo.contactAddress = $.trim($('#contactAddress').val());//联系人地址
		}else{
			if($.trim($('#mobilePhone').val())!=0 || $.trim($('#contactAddress').val())!=0){
				$.alert("错误","请输入联系人！");
				return;
			}
		}
		if(OrderInfo.cust.identityCd==1){
			OrderInfo.cust.identityNum = $('#cmCustIdCard').val();//证件号码
		}else{
			OrderInfo.cust.identityNum = $('#cmCustIdCardOther').val();//证件号码
		}
		var flag=$("#flag").val();
		if(ec.util.isObj(flag)){//有值代表是实名制创建客户页面
//			var data = {
//				boCustInfos : [],
//				boCustIdentities : [],	
//				boPartyContactInfo : []
//			};
			_getCustInfo();
//			data.boCustInfos.push(OrderInfo.boCustInfos);
//			data.boCustIdentities.push(OrderInfo.boCustIdentities);
//			if($.trim($('#contactName').val()).length>0){
//				data.boPartyContactInfo.push(OrderInfo.boPartyContactInfo);
//			}
//			OrderInfo.actionFlag = 1;
			if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
				OrderInfo.order.step = 4;
			}
			if(OrderInfo.actionFlag == 13){
				SoOrder.submitOrder(mktRes.terminal.Ljdata);
			}else SoOrder.submitOrder();
		}else{
			
			common.saveCust();
		}
	};
	
	var _agentCustSubmit = function(){
		if(OrderInfo.cust.custId==undefined){
			OrderInfo.cust = { //保存客户信息
				custId : "",
				partyName : "",
				vipLevel : "",
				vipLevelName : "",
				custFlag :"1100", //1000：红客户，1100：白客户，1200：黑客户
				identityPic : ""
			}
		}
		//从页面信息读取到cust缓存
		OrderInfo.cust.custId = -1;//客户地区
		OrderInfo.cust.partyName = $('#cmCustName').val();//客户名称
		OrderInfo.cust.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.cust.telNumber = $('#telNumber').val();//联系电话
		OrderInfo.cust.addressStr = $('#cmAddressStr').val();//客户地址
		OrderInfo.cust.mailAddressStr = $('#mailAddressStr').val();//通信地址
		OrderInfo.cust.identityCd = $('#cm_identidiesTypeCd').val();//证件类型
		//联系人不为空时才封装联系人信息上传
		if($.trim($('#contactName').val()).length>0){
			OrderInfo.boPartyContactInfo.contactName = $.trim($('#contactName').val());//联系人
			OrderInfo.boPartyContactInfo.mobilePhone = $.trim($('#mobilePhone').val());//联系人手机
			OrderInfo.boPartyContactInfo.contactAddress = $.trim($('#contactAddress').val());//联系人地址
		}else{
			if($.trim($('#mobilePhone').val())!=0 || $.trim($('#contactAddress').val())!=0){
				$.alert("错误","请输入联系人！");
				return;
			}
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
		OrderInfo.jbr.custId = -2;//客户地区
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
		var data = {
				boCustInfos : [],
				boCustIdentities : [],	
				boPartyContactInfo : []
			};
			_getJbrInfo();
			data.boCustInfos.push(OrderInfo.boJbrInfos);
			data.boCustIdentities.push(OrderInfo.boJbrIdentities);
//			if($.trim($('#contactName').val()).length>0){
//				data.boPartyContactInfo.push(OrderInfo.boPartyContactInfo);
//			}
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
	var _userSubmit = function(i){
//		OrderInfo.user.custId = choosedCustInfo.custId;//客户地区
//		OrderInfo.user.partyName = choosedCustInfo.partyName;//经办人名称
//		OrderInfo.user.areaId = choosedCustInfo.areaId;//经办人地区
//		OrderInfo.user.telNumber = choosedCustInfo.accNbr;//联系电话
//		OrderInfo.user.addressStr = choosedCustInfo.addressStr;//经办人地址
//		OrderInfo.user.identityCd = addressStr.identityCd;//证件类型
//		OrderInfo.user.identityNum = addressStr.idCardNumber;//证件号码
		var data = {
				boCustInfos : [],
				boCustIdentities : [],	
				boPartyContactInfo : []
			};
//			_getUserInfo(choosedCustInfo);
			data.boCustInfos.push(OrderInfo.boUserInfosArr[i]);
			
//			if($.trim($('#contactName').val()).length>0){
//				data.boPartyContactInfo.push(OrderInfo.boPartyContactInfo);
//			}
			data.boCustIdentities.push(OrderInfo.boUserIdentitiesArr[i]);
	}
	
	//拼接经办人信息跟经办人属性从jbr节点解析到boJbrInfos，boJbrIdentities
	var _getUserInfo = function(choosedCustInfo){
		OrderInfo.user.custId = choosedCustInfo.custId;
		OrderInfo.boUserInfos.custId = choosedCustInfo.custId;
		OrderInfo.boUserInfos.name = choosedCustInfo.partyName;//客户名称
		OrderInfo.boUserInfos.areaId = choosedCustInfo.areaId;//客户地区
		OrderInfo.boUserInfos.partyTypeCd = 1 ;//客户类型
		OrderInfo.boUserInfos.defaultIdType = 1 ;//证件类型
		OrderInfo.boUserInfos.addressStr= choosedCustInfo.addressStr;//客户地址
		OrderInfo.boUserInfos.telNumber = choosedCustInfo.accNbr;//联系电话
		OrderInfo.boUserInfos.mailAddressStr = choosedCustInfo.mailAddressStr;//通信地址
		OrderInfo.boUserInfos.state = "ADD";
		OrderInfo.boUserInfosArr.push(OrderInfo.boUserInfos);
		
		OrderInfo.boUserIdentities.identidiesTypeCd = choosedCustInfo.identityCd;//证件类型
		OrderInfo.boUserIdentities.identityNum = choosedCustInfo.idCardNumber;//证件号码
		OrderInfo.boUserIdentities.identidiesPic = OrderInfo.user.identityPic;//证件照片
		OrderInfo.boUserIdentities.isDefault = "Y";
		OrderInfo.boUserIdentities.state = "ADD";
		OrderInfo.boUserIdentitiesArr.push(OrderInfo.boUserIdentities);
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
					identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
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
		var url=contextPath+"/agent/cust/checkIdentity";
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
	};
	
	//验证证件号码是否存在
	var _agentCheckIdentity = function() {
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
		var url=contextPath+"/agent/cust/checkIdentity";
		var response = $.callServiceAsJson(url, params, {"before":function(){
			$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		}});
		var msg="";
		if (response.code == 0) {
			$.unecOverlay();
			$.confirm("确认","此证件号码已存在,是否确认新建?",{ 
				yes:function(){	
					_agentCustSubmit();
				},
				no:function(){
					
				}
			});
		}else{
			$.unecOverlay();
			_agentCustSubmit();
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
						identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
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
				}else if(ec.util.isObj($.trim($("#contactName").val()))&&ec.util.isObj($.trim($("#contactAddress").val()))){
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}
					
				SoOrder.submitOrder(data);
			}
		});
	};
	//强商-经办人-客户类型选择事件
	var _jbrpartyTypeCdChoose = function(scope,id) {
		var partyTypeCd=$(scope).val();	
		//客户类型关联证件类型下拉框
		$("#"+id).empty();
		_jbrcertTypeByPartyType(partyTypeCd,id);
		//创建客户证件类型选择事件
//		_jbridentidiesTypeCdChoose($("#"+id).children(":first-child"),"orderAttrIdCard");
		//创建客户确认按钮
		//_custcreateButton();

	};
	//强商-经办人-客户类型关联证件类型下拉框
	var _jbrcertTypeByPartyType = function(_partyTypeCd,id){
		var _obj = $("#"+id);
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/agent/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
				}
	   var currentCT = $("#currentCT").val();//渠道类型
	   var haveCust = $("#haveCust").val();
	   
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
						var propertiesKey = "REAL_NAME_PHOTO_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
					    var isFlag = offerChange.queryPortalProperties(propertiesKey);
					    OrderInfo.preBefore.idPicFlag = isFlag;
					    if(isFlag == "ON"){
					    	if(haveCust != "N"){
					    		OrderInfo.jbr.custId = OrderInfo.cust.custId;
								OrderInfo.jbr.partyName = OrderInfo.cust.partyName;
								OrderInfo.jbr.telNumber = OrderInfo.cust.telNumber;
								OrderInfo.jbr.addressStr = OrderInfo.cust.addressStr;
								OrderInfo.jbr.identityCd = OrderInfo.cust.identityCd;
								OrderInfo.jbr.mailAddressStr = OrderInfo.cust.mailAddressStr;
								OrderInfo.jbr.identityPic = OrderInfo.cust.identityPic;
								OrderInfo.jbr.identityNum = cardNumber;
					    	}
					    }
						
						for(var i=0;i<uniData.length;i++){
							var certTypedate = uniData[i];
							if(certTypedate.certTypeCd=="1"){
								_obj.append("<option value='"+certTypedate.certTypeCd+"' selected='selected'>"+certTypedate.name+"</option>");
							}else _obj.append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
						}
						//jquery mobile 需要刷新才能生效
//						_obj.selectmenu().selectmenu('refresh');
						if(id=='orderIdentidiesTypeCd'){
							//创建经办人证件类型选择事件
//							$("#orderIdentidiesTypeCd option[value='1'").attr("selected", true);
							_jbridentidiesTypeCdChoose(($("#" + id + " option[selected='selected']")),"orderAttrIdCard");
						}
					}
				}
	};
	
	//证件类型选择事件
	var _jbridentidiesTypeCdChoose = function(scope,id) {
		var identidiesTypeCd=$(scope).val();
//		if(identidiesTypeCd==undefined){
//			identidiesTypeCd=$("#div_cm_identidiesType  option:selected").val();
//		}
		if(identidiesTypeCd==1){
			$("#jbrsfz").show();
			$("#jbrsfz_i").show();
			$("#qtzj").hide();
			$("#orderAttrName").attr("readonly","readonly");
			$("#sfzorderAttrIdCard").attr("readonly","readonly");
			$("#orderAttrAddr").attr("readonly","readonly");
//			$('#jbrFormdata').data('bootstrapValidator').enableFieldValidators("orderAttrIdCard",true,"sfzorderAttrIdCard");
		}else{
			$("#jbrsfz").hide();
			$("#jbrsfz_i").hide();
			$("#qtzj").show();
			$("#orderAttrName").removeAttr("readonly");
			$("#sfzorderAttrIdCard").removeAttr("readonly");
			$("#orderAttrAddr").removeAttr("readonly");
//			$('#jbrFormdata').data('bootstrapValidator').enableFieldValidators("orderAttrIdCard",true,"orderAttrIdCard");
		}
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
	//客户类型关联证件类型下拉框(翼销售)
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
						for(var i=0;i<data.length;i++){
							var certTypedate = data[i];
							if (certTypedate.certTypeCd == "1") {//身份证
									$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
								}else if(isAllowChannelType){//如果自有渠道，开放所有
									$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
								}
						}
					}
				}
	};
	
	//客户类型关联证件类型下拉框（强商）
	var _agentCertTypeByPartyType = function(_partyTypeCd,id){
		// 快销卡反档允许所有证件类型
		if ("9" == OrderInfo.actionFlag) {
			$("#userid").attr("placeholder", "请输入接入号码");
			$("#" + id).append('<option value="-1" >接入号码</option>');
			/*var params = {"partyTypeCd":_partyTypeCd} ;
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
						if ("idtype" == id) {
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
						//$("#"+id).append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
					}
					//屏蔽身份证
					if(id=="identidiesTypeCd" && OrderInfo.staff.idType=="OFF")
					{
						$("#"+id+" option[value='1']").remove();
						$("#readCertBtnCreate").hide();
					}
				}
			}*/
		} else {
			$("#" + id).append('<option value="1" >居民身份证</option>');
			$("#userid").attr("placeholder", "请输入身份证号码");
			$("#isAppointNum").parents(".form-group").hide();
			$("#userid").next("span").find("button").prop("disabled", false);
		}
	};
	
	//证件类型选择事件
	var _identidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==undefined){
			identidiesTypeCd=$("#div_cm_identidiesType  option:selected").val();
		}
		$("#cmCustName").removeAttr("readonly");
		$("#cmCustIdCard").removeAttr("readonly");
		$("#cmAddressStr").removeAttr("readonly");
		if(identidiesTypeCd==1){
			$("#cmCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#div-cmcustidcard").show();
			$("#div-readcmcustidcard").show();
			$("#div-cmcustidcard-none").hide();
			
			$("#cmCustName").attr("readonly","readonly");
			$("#cmCustIdCard").attr("readonly","readonly");
			$("#cmAddressStr").attr("readonly","readonly");
			
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",false,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",true,null);
		}else if(identidiesTypeCd==2){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法军官证");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$("#div-readcmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else if(identidiesTypeCd==3){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法护照");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$("#div-readcmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else{
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法证件号码");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$("#div-readcmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}
		_form_custInfomodify_btn();
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
	                        //regexp: /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/,
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
	                }
	            },
	            mobilePhone: {
	            	trigger: 'blur',
	                validators: {
	                    regexp: {
	                        /*regexp: /(^\d{11}$)/,
	                        message: '手机号码只能为11数字'*/
	                    	regexp: /^1[34578]\d{9}$/,
	                        message: '手机号码不合法'
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
	};
	
	//校验表单提交
	var _jbrvalidatorForm=function(){
		$('#jbrFormdata').bootstrapValidator({
	        message: '无效值',
	        feedbackIcons: {
	            valid: 'glyphicon glyphicon-ok',
	            invalid: 'glyphicon glyphicon-remove',
	            validating: 'glyphicon glyphicon-refresh'
	        },
	        fields: {
	        	sfzorderAttrIdCard: {
	            	trigger: 'blur',
	                validators: {
	                    regexp: {
	                        regexp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
	                        //regexp: /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/,
	                        message: '请输入合法身份证号码'
	                    }
	                }
	            },
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
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
	
		$('#newCustBtn').off("click").on("click",_newCustSubmit);
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUST_CREATE;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,8,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");

//		SoOrder.initFillPage();
	};
	
	//初始化新增客户
	var _agentInitNewCust = function(){
		cust.validatorForm();
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		//取客户证件类型
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
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

		/*OrderInfo.staff = { //员工登陆信息
			staffId : sessionStaff.staffId,  //员工id
			channelId : sessionStaff.currentChannelId,   //受理渠道id
			channelName: "",
			areaId : 0,    //受理地区id
			areaCode : 0,
			soAreaId : sessionStaff.currentAreaId,    //新装受理地区id
			soAreaCode : 0, 
			distributorId : "" //转售商标识
		};*/
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
	};
	
	var _getGenerationInfos=function(name,idcard,address,identityPic){
		$("#cmCustName").val(name);
		$("#cm_identidiesTypeCd").val("1");
		$("#cm_identidiesTypeCd").change();
		$("#cmCustIdCard").val(idcard);
		$("#cmAddressStr").val(address);
		if(OrderInfo.preBefore.idPicFlag == "ON"){
			OrderInfo.virOlId ="";
		}
		OrderInfo.cust.identityPic = identityPic;//证件照片
	};
	//读卡获取经办人信息
	var _getjbrGenerationInfos=function(name,idcard,address,identityPic){
		$("#orderAttrName").val(name);
		$("#sfzorderAttrIdCard").val(idcard);
		$("#orderAttrAddr").val(address);
		if(OrderInfo.preBefore.idPicFlag == "ON"){
			OrderInfo.virOlId ="";
		}
		OrderInfo.jbr.identityPic = identityPic;//证件照片
	};
	
	// 客户定位读取身份证号码
	var _getCustIdCard=function(name,idcard,address){
//		$("#cmCustName").val(name);
//		$("#cm_identidiesTypeCd").val("1");
//		$("#cm_identidiesTypeCd").change();
		$("#userid").val(idcard);
//		$("#cmAddressStr").val(address);
	};
	
	var _getreadCertBtnID=function(name,idcard,address){

		$("#idCardNumber2").val(idcard);
	};
	
	//新增客户订单查询页面
	var _custQueryAdd=function(){
		var param = {};
		$.callServiceAsHtml(contextPath+"/agent/cust/custQueryAdd",param,{
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
			$.callServiceAsHtml(contextPath+"/agent/cust/custQueryAddList",param,{
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
	var _queryCust = function () {
		// 验证表单数据
		if  (!_identityNumValidate()) {
			return;
		};
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
		$.callServiceAsHtml(contextPath+"/agent/cust/agentQueryCust",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					return;
				}
				_queryCallBack(response);
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
//				$.unecOverlay();
//				$("#usersearchbtn").attr("disabled",false);
			}
		});
	};
	//客户查询列表
	var _queryCallBack = function(response) {
//		if(response.data.indexOf("showVerificationcode") >=0) {
//			$("#vali_code_input").val("");
//			$('#validatecodeImg').css({"width":"80px","height":"32px"}).attr('src',contextPath+'/validatecode/codeimg.jpg?' + Math.floor(Math.random()*100)).fadeIn();
//			easyDialog.open({
//				container : 'Verificationcode_div'
//			});
//			return;
//		}
		if(response.data.indexOf("showDiffcode") >=0) {
			$.alert("提示","抱歉，该工号没有异地业务的权限！");
			return;
		}
		if(response.data.indexOf("false") >=0) {
			$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
			return;
		}
		var content$ = $("#cust-query-list");
		content$.html(response.data).show();
//		$(".userclose").off("click").on("click",function(event) {
//			authFlag="";
//			$(".usersearchcon").hide();
//			$("#custListOverlay").hide();
//		});
//		if($("#custListTable").attr("custInfoSize")=="1"){
//			$(".usersearchcon").hide();
//			$("#custListOverlay").hide();
//		}
//		$("#custListOverlay").show();
	};
	//指定号码checkbox
	var _isAppointNum = function(identityCdId){
		//$("#isAppointNum").prop("checked", false);
		identityCdId = identityCdId || 'idtype';
		if($("#"+identityCdId).val()!=-1){
			$.alert("提示","只能接入号码才能指定号码！","information");
			$("#isAppointNum").prop("checked", false);
			return;
		}
		
		
	};
	//客户定位证件类型选择事件
	var _custidentidiesTypeCdChoose = function(scope,id) {
		// 非接入号隐藏产品类别选择
//		$("#prodTypeCd").hide();
		$("#"+id).val("");
		$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9]/ig,'')");
		var identidiesTypeCd=$(scope).val();
		$("#"+id).attr("maxlength","100");
		// 非身份证类型 读卡按钮失效
		$("#userid").next("span").find("button").prop("disabled", true);
		if(identidiesTypeCd==-1){
//			if ("ON" == CacheData.getIntOptSwitch()) {
//				$("#prodTypeCd").show();
//			}
			if(OrderInfo.actionFlag != "9"){
				$("#isAppointNum").parents(".form-group").show();
			}
			$("#"+id).attr("placeHolder","请输入接入号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写接入号码) on(keyup)");
		}else if (identidiesTypeCd==1){
			$("#userid").next("span").find("button").prop("disabled", false);
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
			$("#isAppointNum").parents(".form-group").hide();
		}
//		if(id == 'p_cust_identityNum_choose'){
//			_bindCustQueryForChoose();
//		} else {
//			_custLookforButton();
//		}
		
		//如果是身份证，则禁止输入，否则启用输入控件
//		var isID = identidiesTypeCd==1;
//		var isIdTypeOff = OrderInfo.staff.idType=="OFF";
//		$('#p_cust_identityNum').attr("disabled",isID&&(!isIdTypeOff));
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
		// 判断是否是政企客户
//		var isGovCust = false;
//		for (var i = 0; i <= CacheData.getGovCertType().length; i ++) {
//			if (_choosedCustInfo.identityCd == CacheData.getGovCertType()[i]) {
//				isGovCust = true;
//				break;
//			}
//		}
//		if(cust.queryForChooseUser && isGovCust){
//			$.alert('提示','使用人必须是公众客户，请重新定位。');
//			return false;
//		}
		if(authFlag=="0"){
			//TODO init view 
			if(cust.authType == '00'){
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
						$("#auth_tab2").addClass("active")
						$("#content2").addClass("active")
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


			if(cust.jumpAuthflag=="0"){
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
	/**
	 * 客户鉴权
	 */
	var _custAuth = function(scope) {
		var param = _choosedCustInfo;
		param.prodPwd = $.trim($("#authPassword").val());
		if ("" == param.prodPwd) {
			$("#custAuthTypeName").next("small").text("请输入密码");
			return;
		}
		param.authFlag=authFlag;
		$('#auth').modal('hide');
		$.callServiceAsHtml(contextPath+"/agent/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					return;
				}
				
				if(!cust.queryForChooseUser){
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
	/*
	 * 客户身份证鉴权
	 * */
	var _custIdAuth = function () {
		var authIDTD = $.trim($("#authIDTD").val());
		var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
		if(reg.test(authIDTD) === false) {
			$("#custAuthTypeNameID small").text("请正确填写证件号");
			return;
		}
		var param = _choosedCustInfo;
        param.pCustIdentityCd = $("#identidiesType").val();
		param.identityNum =base64encode(utf16to8(authIDTD));
		param.custId = _choosedCustInfo.custId;
		param.authFlag=authFlag;
		$('#authID').modal('hide');
		// done区域内，弹框不显示 ，在always区域判断
		var isCustIdAuthFail = false;
		$.callServiceAsHtml(contextPath+"/agent/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					return;
				}
				if(response.data.indexOf("false") >=0) {
					isCustIdAuthFail = true;
					return;
				}
				//判断能否转为json，可以的话返回的就是错误信息
				try {
					var errorData = $.parseJSON(response.data);
					$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack,"error");
					return;
				} catch(e){

				}
				if(!cust.queryForChooseUser){
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
				if (isCustIdAuthFail) {
					$.alert("提示","抱歉，您输入的身份证号有误，请重新输入。");
				}
			}
		});
	};
	var _jumpAuth = function() {
		if(authFlag=="0" && cust.jumpAuthflag!="0"){
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
					_saveAuthRecordFail(recordParam);
					return;
				}
				
				if(!cust.queryForChooseUser){
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
				_saveAuthRecordSuccess(recordParam);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	// cust auth callback
	var _custAuthCallBack = function(response) {
//		if(authFlag=="0"){
//			easyDialog.close();
//		}
		$("#agent-cust-query").hide();
		$("#cust-query-list").hide();
		if($.ketchup)
			$.ketchup.hideAllErrorContainer($("#custCreateForm"));
		var content$ = $("#custInfo");
		content$.html(response.data).show();
		if("2" == OrderInfo.actionFlag || "22"== OrderInfo.actionFlag ) {
			if(_choosedCustInfo.accNbr != null && ec.util.isObj(_choosedCustInfo.accNbr) &&(response.data).indexOf("query-cust-prod") != -1) {
				$("#query-cust-prod").click();
				$("#query-cust-prod").hide();
			}
		}
		
		// 改变返回按钮事件
//		$("#query-cust-back-btn").attr("onclick", "cust.custReset()");
		_queryCustNext();
		
		
//		if((OrderInfo.boCusts.partyId!="-1"&&OrderInfo.boCusts.partyId!=""&&OrderInfo.boCusts.partyId!=undefined)&&order.prodModify.lteFlag==true){
//			$("#custModifyId").attr("style","display: none;");
//		}else{
//			$("#custModifyId").attr("style","");
//		}
//		$("#cCustName").val("");
//		$("#cCustIdCard").val("");
//		main.home.hideMainIco();
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
			params.method ='/agent/order/prodoffer/prepare';
			params.actionFlag = 1;
		}
		// 套餐变更
		if ("2" == OrderInfo.actionFlag) {
			params.method ="/agent/order/prodoffer/offerchange/prepare";
			params.actionFlag = 2;
		}
		// 客户资料返档
		if ("9" == OrderInfo.actionFlag) {
			params.method ="/agent/prodModify/prepare";
			params.actionFlag = 9;
		}
		// 补换卡
		if ("22" == OrderInfo.actionFlag) {
			params.method ="/agent/prodModify/toCheckUimUI";
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
	//已订购业务
	var _btnQueryCustProdMore=function(param){
		if(OrderInfo.cust.custId==-1){
			$.alert("提示","新建客户无法查询已订购产品！");
			return;
		}
		var curPage=1;
//		$("#prodDetail").hide();
//		$("#prodInfo").hide();
//		$("#prodList").show();
		//$("#orderedprod").show();
//		$("#orderContent").show();
		// 避免因缓存 影响查询
		cust.orderBtnflag = "";
		if(cust.orderBtnflag==""){//初次查询
			//隐藏菜单
//			main.home.hideMainIco();
			_btnQueryCustProd(curPage);
//			$("#orderedprod").show();
//			$("#arroworder").removeClass();
//			$("#arroworder").addClass("arrowup");
//			
//			$(".main_div.location .s_title").css("border-bottom","0px solid #4f7d3f");
//			$("#orderbutton").css({"height":"35px","border-bottom":"1px solid #fff"});
//			$("#orderbutton span").css({"color":"#327501"});
			cust.orderBtnflag="1";
		}
//		else if(order.cust.orderBtnflag=="0"||$("#orderedprod").is(":hidden")){
//			$("#orderedprod").show();
//			$("#arroworder").removeClass();
//			$("#arroworder").addClass("arrowup");
//			
//			$(".main_div.location .s_title").css("border-bottom","0px solid #4f7d3f");
//			$("#orderbutton").css({"height":"35px","border-bottom":"1px solid #fff"});
//			$("#orderbutton span").css({"color":"#327501"});
//			order.cust.orderBtnflag="1";
//			
//		}else{
//			$("#orderedprod").hide();
//			$("#arroworder").removeClass();
//			$("#arroworder").addClass("arrow");
//			order.cust.orderBtnflag="0";
//			$("#orderbutton").css({"height":"24px","border-bottom":"1px solid #4f7d3f"});
//		}
		/*$("#orderbutton").off("click").on("click",function(event){_btnQueryPhoneNumber();event.stopPropagation();});*/
	};
	//已订购业务
	var _btnQueryCustProd=function(curPage){
		//收集参数
		var param={};
		// 如果是接入号，且开关打开，则添加产品大类字段
//		if ($("#p_cust_identityCd").val() == -1 && "ON" == CacheData.getIntOptSwitch()) {
//			param.prodClass = $("#prodTypeCd").val();
//		}
		if(_choosedCustInfo==null){
			param.custId="";
		}else{
		param.custId=_choosedCustInfo.custId;
		param.areaId =$("#area").attr("areaId");
		//	param.custId="123002382243";//need modify
		}
//		if(document.getElementById("accNbrQuery")){
//			param.acctNbr=$.trim($("#accNbrQuery").val());
//			if(CONST.getAppDesc()==0){
//				param.areaId=$("#p_cust_areaId").val();
//			}
//			
//		} else 
		// 客户定位指定接入号 已订购只返回该号码信息
		if($("#identidiesType").val() == -1 && $("#isAppointNum").prop("checked")){
			param.acctNbr=$.trim($("#userid").val());

			if(CONST.getAppDesc()==0){
				param.areaId=$("#p_cust_areaId").val();
			}
		}else {
			param.acctNbr = "";
			if("2" == OrderInfo.actionFlag || "22"== OrderInfo.actionFlag ) {
				if(_choosedCustInfo.accNbr != null && ec.util.isObj(_choosedCustInfo.accNbr))
				{
				    param.acctNbr = _choosedCustInfo.accNbr; 
				}
			}
			
		}
//		if(document.getElementById("custPageSize")){
//			param.pageSize=$.trim($("#custPageSize").val());
//			if(!(/^[1-9]\d*$/.test(param.pageSize))&&(param.pageSize!="")){
//				$.alert("提示信息","页码格式不正确，必须为有效数字。");
//				return false;
//			}
//			if(param.pageSize>15){
//				$.alert("提示信息","页数大小不能超过15。");
//				return false;
//			}
//		}else {
//			param.pageSize="";
//		}
		param.pageSize="";
		param.curPage=curPage;
		param.DiffPlaceFlag="local";
		if(param.custId==null||param.custId==""){
			$.alert("提示","无法查询已订购产品");
			return;
		}
		//请求地址
		var url = contextPath+"/agent/cust/orderprod";
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
				if("2" == OrderInfo.actionFlag || "22"== OrderInfo.actionFlag ) {
					if(_choosedCustInfo.accNbr != null && ec.util.isObj(_choosedCustInfo.accNbr) && (response.data).indexOf("更多") == -1) {
						$("#custHasprodOfferName").click();
					}
				}
				// 隐藏已订购查询按钮
				$("#query-cust-prod").hide();
				// 卡类型查询
				/*$("#phoneNumListtbody td[name ='pord_uim_type_query']").each(function () {
					var currentTd = $(this);
					var param = {
							prodId	: $(this).attr("prodInstId"),
							areaId		: $(this).attr("areaId"),
							acctNbr		: $(this).attr("acctNbr")
						};
					$.callServiceAsJson(contextPath+"/order/queryTerminalInfo", param, {
						"done" : function(response){
							if(response.code == 0) {
								var terminalInfo = response.data;
								if(ec.util.isObj(terminalInfo.is4GCard)){
									if(terminalInfo.is4GCard == "Y"){
										currentTd.text("4G卡");
									}else{
										currentTd.text("3G卡");
									}
								}
							} else {
								currentTd.text("查询失败");
							}
						}
					});
				});*/
				
				//_linkSelectPlan("#phoneNumListtbody tr",$("#phoneNumListtbody").children(":first-child"));
				//绑定每行合约click事件
//				$("#phoneNumListtbody tr").off("click").on("click",function(event){
//					var thisTr=this;
//					if(1==OrderInfo.order.step&&(!$(thisTr).hasClass("plan_select"))){
//						$.confirm("确认","你已重新选择号码，需跳转至上一步，是否确认?",{
//							yes:function(){
//								_cancel();
//								_linkQueryOffer(thisTr);
//								OrderInfo.order.step=0;
//							},
//							no:function(){
//								null;
//							}
//						});
//					}else if(2==OrderInfo.order.step&&(!$(thisTr).hasClass("plan_select"))){
//						$.confirm("确认","你已重新选择号码，需取消订单，是否确认?",{
//							yes:function(){
//								SoOrder.orderBack();
//								_cancel();
//								_linkQueryOffer(thisTr);
//								OrderInfo.order.step=0;
//							},
//							no:function(){
//								null;
//							}
//						});
//					}else{
//						_linkQueryOffer(this);
//					}
//					
//					});
//				
//				$("#plan2ndDiv tbody tr").each(function(){$(this).off("click").on("click",function(event){
//					var this2Tr=this;
//					if(1==OrderInfo.order.step&&(!$(this2Tr).hasClass("plan_select2"))){
//						$.confirm("确认","你已重新选择号码，需跳转至上一步，是否确认?",{
//							yes:function(){
//								_cancel();
//								order.cust.linkSelectPlan(this2Tr);event.stopPropagation();
//								OrderInfo.order.step=0;
//							},
//							no:function(){
//								null;
//							}
//						});
//					}else if(2==OrderInfo.order.step&&(!$(this2Tr).hasClass("plan_select2"))){
//						$.confirm("确认","你已重新选择号码，需取消订单，是否确认?",{
//							yes:function(){
//								SoOrder.orderBack();
//								_cancel();
//								order.cust.linkSelectPlan(this2Tr);event.stopPropagation();
//								OrderInfo.order.step=0;
//							},
//							no:function(){
//								null;
//							}
//						});
//					}else{
//						order.cust.linkSelectPlan(this);event.stopPropagation();
//					}
//					
//					
//					});});
//				
//				$("#phoneNumListtbody").children(":first-child").next("#plan2ndTr").find("#plan2ndDiv tbody tr:first").click();
//				$("#phoneNumListtbody").children(":first-child").click();
			}
		});	
	};
	var _custReset = function(flag) {
		if(flag!=undefined && flag == 1){
			$.confirm("确认","您确定要重新定位吗?",{
				yes:function(){	
					// 重置返回按钮
					$("#query-cust-back-btn").attr("onclick", "common.callReturnBack()");
					// 重置查询按钮
					$("#query-cust-btn").prop("disabled", false);
					$("#query-cust-btn").html('<span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查询');
					$("#query-cust-btn").off("click").bind("click", function () {
						cust.queryCust();
					});
					$("#custInfo").hide();
					$("#agent-cust-query").show();
					$("#cust-query-list").html("");
					$("#userid").val("");
					$("#authPassword").val("");
					authFlag="";
					OrderInfo.boCusts.partyId="";
					
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId="";
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.cust = "";
					//删除session中的客户缓存信息
					var param={
					};
					$.callServiceAsJson(contextPath+"/agent/cust/removeCustSession",param,{
						"before":function(){
			//				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
						},"done" : function(response){
			//				$.unecOverlay();
						},fail:function(response){
			//				$.unecOverlay();
							$.alert("提示","查询失败，请稍后再试！");
						},"always":function(){
							$.unecOverlay();
						}
					});
				},
				no:function(){
					
				}
			});
		}else{
			// 重置返回按钮
			$("#query-cust-back-btn").attr("onclick", "common.callReturnBack()");
			// 重置查询按钮
			$("#query-cust-btn").prop("disabled", false);
			$("#query-cust-btn").html('<span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查询');
			$("#query-cust-btn").off("click").bind("click", function () {
				cust.queryCust();
			});
			$("#custInfo").hide();
			$("#agent-cust-query").show();
			$("#cust-query-list").html("");
			$("#userid").val("");
			$("#authPassword").val("");
			authFlag="";
			OrderInfo.boCusts.partyId="";
			
			OrderInfo.boCusts.prodId=-1;
			OrderInfo.boCusts.partyId="";
			OrderInfo.boCusts.partyProductRelaRoleCd="0";
			OrderInfo.boCusts.state="ADD";
			OrderInfo.cust = "";
			//删除session中的客户缓存信息
			var param={
			};
			$.callServiceAsJson(contextPath+"/agent/cust/removeCustSession",param,{
				"before":function(){
	//				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},"done" : function(response){
	//				$.unecOverlay();
				},fail:function(response){
	//				$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				},"always":function(){
					$.unecOverlay();
				}
			});
		}
	};
	// 查询卡类型
	var _queryCardType = function(_prodId, _areaId, _acctNbr) {
		var currentTd = $("td[name=pord_uim_type_query][prodInstId='" + _prodId + "']");
		var param = {
				prodId	: _prodId,
				areaId	: _areaId,
				acctNbr	: _acctNbr
			};
		if (currentTd.text() == "4G卡" || currentTd.text() == "3G卡") {
			return;
		}
		$.callServiceAsJson(contextPath+"/agent/order/queryTerminalInfo", param, {
			"before":function(){
				currentTd.text("查询中...");
			},
			"done" : function(response){
				if(response.code == 0) {
					var terminalInfo = response.data;
					if(ec.util.isObj(terminalInfo.is4GCard)){
						if(terminalInfo.is4GCard == "Y"){
							currentTd.text("4G卡");
						}else{
							currentTd.text("3G卡");
						}
					}
				} else {
					currentTd.text("查询失败");
				}
			},
			"always":function(){
			}
		});
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
					_saveAuthRecordFail(recordParam);
					return;
				}
				if(response.data.indexOf("false") >=0) {
					$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
					_saveAuthRecordFail(recordParam);
					return;
				}
				//判断能否转为json，可以的话返回的就是错误信息
				try {
					var errorData = $.parseJSON(response.data);
					$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack,"error");
					_saveAuthRecordFail(recordParam);
					return;
				} catch(e){
				}
				if(!cust.queryForChooseUser){
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
				_saveAuthRecordSuccess(recordParam);
			}
		});
	};
	
	//客户鉴权--证件类型
	var _identityTypeAuth=function(level){

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
					_saveAuthRecordFail(recordParam);
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
					_saveAuthRecordFail(recordParam);
					return;
				} catch(e){
				}
				//window.localStorage.setItem("OrderInfo.cust",JSON.stringify(OrderInfo.cust));
				if(!cust.queryForChooseUser){
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
				_saveAuthRecordSuccess(recordParam);
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
		var param = {
			"pageIndex": 1,
			"pageSize": 10,
			"munber":accNbr,
			"isSecond":"Y"
		};
		$.callServiceAsJsonGet(contextPath + "/staff/login/changeUimReSend", param, {
			"done": function (response) {
				if (response.code == 0) {
					if(response.data.randomCode != null ){
						$("#num").val(response.data.randomCode);
					}
					$.alert("提示", "验证码发送成功，请及时输入验证.");
				} else {
					$.alert("提示", response.data);
				}
			}
		});
	};
	//短信验证
	var _smsvalid=function(level){
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


		$.callServiceAsJson(contextPath+"/staff/login/changeUimSmsValid", params, {
			"before":function(){
				$.ecOverlay("<strong>验证短信随机码中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				if(response.code==0){
					$('#auth3').modal('hide');
					$.unecOverlay();
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
								
								if(!cust.queryForChooseUser){
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
					_saveAuthRecordSuccess(recordParam);
				}else{
					$.unecOverlay();
					$.alert("提示",response.data);
					_saveAuthRecordFail(recordParam);
				}
			},
			"fail" : function(response){
				_saveAuthRecordFail(recordParam);
			}
		});
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

	//二次业务菜单鉴权方式查询
	var _querySecondBusinessAuth = function(menuId,isSimple,callbackFunc){
		var url=contextPath+"/agent/secondBusi/querySecondBusinessMenuAuth";
		var param={
			menuId:menuId,
			isSimple:isSimple
		};
		var response= $.callServiceAsHtml(url,param);
		var date = JSON.parse(response.data);
		var success =  date.successed;
		if(!success ) {
			return false;
		}
		var rule1 = date.data.rule1;
		var rule2 = date.data.rule2;
		var rule3 = date.data.rule3;
		var rule4 = date.data.rule4;
		var authTypeStr = date.data.authTypeStr;
		if("Y" == rule4){
			$("#jumpAuth1").show();
			$("#jumpAuth2").show();
			$("#jumpAuth3").show();
		} 
		
		if("Y" != rule3) {
			$("#auth_tab1").removeClass();
			$("#auth_tab1").hide();
			$("#content1").hide();
		} else if("Y" != rule1){
			$("#auth_tab2").removeClass();
			$("#auth_tab2").hide();
			$("#content2").hide();
		} else if("Y" != rule2){
			$("#auth_tab3").removeClass();
			$("#auth_tab3").hide();
			$("#content3").hide();
		} 
		
		if("Y" != rule3 && "Y" == rule1) {
			$("#auth_tab2").addClass("active");
			$("#content2").addClass("active");
		}
		if("Y" != rule3 && "Y" != rule1 && "Y" == rule2) {
			$("#auth_tab3").addClass("active");
			$("#content3").addClass("active");
		}
		return true;
	};
	
	var _getSessionCust = function(){
		var param={
		};
		$.callServiceAsHtml(contextPath+"/agent/cust/showCustList",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
				if (response.code == -2) {
					return;
				}
				_queryCallBack(response);
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			},"always":function(){
				$.unecOverlay();
			}
		});
	}
	
	var _getIp=function(Ip){
		OrderInfo.curIp = Ip;
	}
	
	return {
		jbridentidiesTypeCdChoose 	: 		_jbridentidiesTypeCdChoose,
		jbrvalidatorForm 			: 		_jbrvalidatorForm,
		jbrpartyTypeCdChoose 		: 		_jbrpartyTypeCdChoose,
		jbrcertTypeByPartyType 		: 		_jbrcertTypeByPartyType,
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
		getjbrGenerationInfos		:		_getjbrGenerationInfos,
		getIDCardInfos				: 		_getIDCardInfos,
		getPicture					:		_getPicture,
		agentCertTypeByPartyType    :       _agentCertTypeByPartyType,
		queryCust					: 		_queryCust,
		isAppointNum				:		_isAppointNum,
		custidentidiesTypeCdChoose  :		_custidentidiesTypeCdChoose,
		jumpAuthflag 				:		_jumpAuthflag,
		showCustAuth 				:		_showCustAuth,
		queryForChooseUser 			: 		_queryForChooseUser,
		custAuth 					: 		_custAuth,
		custIdAuth					:		_custIdAuth,
		jumpAuth 					: 		_jumpAuth,
		btnQueryCustProd			:		_btnQueryCustProd,
		btnQueryCustProdMore		:		_btnQueryCustProdMore,
		orderBtnflag 				:		_orderBtnflag,
		queryCustNext				:		_queryCustNext,
		custReset					:		_custReset,
		getCustIdCard				:		_getCustIdCard,
		queryCardType				:		_queryCardType,
		productPwdAuth              :       _productPwdAuth,
		identityTypeAuth            :       _identityTypeAuth,
		smsResend                   :       _smsResend,
		smsvalid                    :       _smsvalid,
		saveAuthRecord              :       _saveAuthRecord,
		saveAuthRecordSuccess       :       _saveAuthRecordSuccess,
		saveAuthRecordFail          :       _saveAuthRecordFail,
		getreadCertBtnID            :       _getreadCertBtnID,
		changeTab					:		_changeTab,
		isSelfChannel				:		_isSelfChannel,
		getSessionCust				:		_getSessionCust,
		agentNewCustSubmit			:		_agentNewCustSubmit,
		agentInitNewCust			:		_agentInitNewCust,
		userSubmit					:		_userSubmit,
		getUserInfo					:		_getUserInfo,
		jbrSubmit					:		_jbrSubmit,
		getJbrInfo					:		_getJbrInfo,
		getIp						:		_getIp
	};	
})();

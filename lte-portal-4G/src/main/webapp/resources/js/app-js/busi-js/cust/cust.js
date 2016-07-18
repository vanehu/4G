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
	var _clearCustForm = function(){
		$('#cmCustName').val("");
		$('#cmAddressStr').val("");
		$('#telNumber').val("");
		$('#mailAddressStr').val("");
		$('#cmCustIdCard').val("");
		$('#cmCustIdCardOther').val("");
		cust.validatorForm();
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
	//客户新增提交
	var _newCustSubmit = function(){
		$('#custFormdata').data('bootstrapValidator').validate();
		if($('#custFormdata').data('bootstrapValidator').isValid()){
			/*var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}*/
			_checkIdentity();

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
		_identidiesTypeCdChoose($("#div_cm_identidiesType").children(":first-child"));

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
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else if(identidiesTypeCd==3){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法护照");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else{
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法证件号码");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}
		_form_custInfomodify_btn();
	};
	
	//翼销售-经办人-客户类型选择事件
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
							if(i==0){
								_obj.append("<option value='"+certTypedate.certTypeCd+"' selected='selected'>"+certTypedate.name+"</option>");
							}else _obj.append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
						}
						//jquery mobile 需要刷新才能生效
//						_obj.selectmenu().selectmenu('refresh');
						if(id=='orderIdentidiesTypeCd'){
							//创建经办人证件类型选择事件
//							$("#orderIdentidiesTypeCd option[value='1'").attr("selected", true);
							_jbridentidiesTypeCdChoose($("#"+id).children(":first-child"),"orderAttrIdCard");
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
			$("#orderAttrAddr").attr("readonly","readonly");
//			$('#jbrFormdata').data('bootstrapValidator').enableFieldValidators("orderAttrIdCard",true,"sfzorderAttrIdCard");
		}else{
			$("#jbrsfz").hide();
			$("#jbrsfz_i").hide();
			$("#qtzj").show();
			$("#orderAttrName").removeAttr("readonly");
			$("#orderAttrAddr").removeAttr("readonly");
//			$('#jbrFormdata').data('bootstrapValidator').enableFieldValidators("orderAttrIdCard",true,"orderAttrIdCard");
		}
	};
	
	//读卡获取经办人信息
	var _getjbrGenerationInfos=function(name,idcard,address,identityPic){
		$("#orderAttrName").val(name);
		$("#sfzorderAttrIdCard").val(idcard);
		$("#orderAttrAddr").val(address);
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
	
	var _getPicture=function(photosBase64){
		$("#photos").attr("src","data:image/jpg;base64,"+photosBase64);
	};
	
	var _getGenerationInfos=function(name,idcard,address,identityPic){
		$("#cmCustName").val(name);
		$("#cm_identidiesTypeCd").val("1");
		$("#cm_identidiesTypeCd").change();
		$("#cmCustIdCard").val(idcard);
		$("#cmAddressStr").val(address);
		OrderInfo.cust.identityPic = identityPic;//证件照片
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
						if(OrderInfo.actionFlag!=1 && prodInstInfos.feeType.feeType!=order.prodModify.choosedProdInfo.feeType){
							$.alert("提示",mainPhoneNum+"和主卡的付费类型不一致！");
							return false;
						}
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
		goService:_goService

	};	
})();

//$(document).ready(function() {
//	order.prodModify.validatorForm();
//	order.prodModify.getIdentidiesTypeCd();//初始化证件类型
//});
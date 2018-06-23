/**
 * 客户资料管理
 */
CommonUtils.regNamespace("cust", "create");

cust.create = (function(){
	var _init =function(){
		$("#ccCustName").val("");
		$("#ccCustIdCard").val("");
		$("#ccAddressStr").val("");
		$("#contactName").val("");
		$("#contactAddress").val("");
		$("#contactEmployer").val("");
		$("#homePhone").val("");
		$("#officePhone").val("");
		$("#mobilePhone").val("");
		$("#contactDesc").val("");
		$("#eMail").val("");
		$("#postcode").val("");
		$("#postAddress").val("");
		$("#fax").val("");
		if(OrderInfo.staff.idType=="OFF"){
			$("#readCertBtnCreateCust").hide();
		}
	}
/*	//客户类型选择事件
	var _partyTypeCdChoose = function(scope) {
		var partyTypeCd=$(scope).val();
		_partyType(partyTypeCd);
		_identidiesTypeCdChoose($("#div_cc_identidiesType").children(":first-child"));

	};
	var _partyType = function(partyTypeCd) {
		if(partyTypeCd==1){
			var identidiesTypeCdHtml="<select id=\"identidiesTypeCd\" onchange=\"cust.create.identidiesTypeCdChoose(this)\"><option value=\"1\">身份证</option><option value=\"2\">军官证</option></select>";
		}else if(partyTypeCd==2){
			var identidiesTypeCdHtml="<select id=\"identidiesTypeCd\" onchange=\"cust.create.identidiesTypeCdChoose(this)\"><option value=\"3\">护照</option><option value=\"23\">ICP经营许可证</option><option value=\"39\">税务登记号</option></select>";
		};
		$("#div_cc_identidiesType").html(identidiesTypeCdHtml);
	};*/
	//客户类型选择事件
	var _partyTypeCdChoose = function(scope) {
		var partyTypeCd=$(scope).val();
		//客户类型关联证件类型下拉框
		$("#cc_identidiesTypeCd").empty();
		_certTypeByPartyType(partyTypeCd);
		//创建客户证件类型选择事件
		_identidiesTypeCdChoose($("#div_cc_identidiesType").children(":first-child"));

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
							$("#cc_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							
						}
					}
				}
	};
	//创建客户证件类型选择事件
	var _identidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==1){
			$("#ccCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#ccCustIdCard").attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(keyup)");
		}else if(identidiesTypeCd==2){
			$("#ccCustIdCard").attr("placeHolder","请输入合法军官证");
			$("#ccCustIdCard").attr("data-validate","validate(required:请准确填写军官证) on(keyup)");
		}else if(identidiesTypeCd==3){
			$("#ccCustIdCard").attr("onkeyup", "value=value.replace(/[^A-Za-z0-9-]/ig,'')");
			$("#ccCustIdCard").attr("placeHolder","请输入合法护照");
			$("#ccCustIdCard").attr("data-validate","validate(required:请准确填写护照) on(keyup)");
		}else{
			$("#ccCustIdCard").attr("placeHolder","请输入合法证件号码");
			$("#ccCustIdCard").attr("data-validate","validate(required:请准确填写证件号码) on(keyup)");
		}
		_form_custCreateOnly_btn();
		
		//如果是身份证，则禁止输入，否则启用输入控件
		var isID = identidiesTypeCd==1;
		var isIdTypeOff = OrderInfo.staff.idType=="OFF";
		$('#ccCustName').attr("disabled",isID&&(!isIdTypeOff));
		$('#ccCustIdCard').attr("disabled",isID&&(!isIdTypeOff));
		$('#ccAddressStr').attr("disabled",isID&&(!isIdTypeOff));
	};
	var _SoOrderbuilder = function(){
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUST_CREATE;
		if(!SoOrder.builder()){//加载实例缓存，并且初始化订单数据
			return;
		}
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,8,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
	}
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
//		_SoOrderbuilder();
		
	};
	//客户属性-展示 更多按钮
	var _btnMoreProfile=function(){
		if($("#partyProfile").is(":hidden")){
			$("#partyProfile").show();
			$("#proarroworder").removeClass();
			$("#proarroworder").addClass("arrowup");
			$("#morehinfoBox").show();
			$("#cardtab_pro_0").click();
		}else{
			$("#moreh5").hide();
			$("#morehinfoBox").hide();
			$("#partyProfile").hide();
			$("#proarroworder").removeClass();
			$("#proarroworder").addClass("arrow");
			$("#tabProfile0").attr("click","1");
			$("#contactName").attr("data-validate","");
//			_custcreateButton();
		}
		/*$("#orderbutton").off("click").on("click",function(event){_btnQueryPhoneNumber();event.stopPropagation();});*/
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
			$("#contactName").attr("data-validate","validate(required:请准确填写联系人名称) on(keyup)");
//			_custcreateButton();
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
	var _boCustProfiles=function(){
	//客户属性
	OrderInfo.boCustProfiles=[];
	//客户属性节点
	for ( var i = 0; i < order.cust.partyProfiles.length; i++) {
		var partyProfiles = order.cust.partyProfiles[i];
		var profileValue=$("#"+partyProfiles.attrId).val();
		if(""==profileValue||"undefined"==profileValue){
			profileValue==$("#"+partyProfiles.attrId+"option:selected").val();
		}
		var partyProfiles = {
				partyProfileCatgCd: partyProfiles.attrId,
				profileValue: profileValue,
                state: "ADD"
		};
		if(""!=profileValue){
		OrderInfo.boCustProfiles.push(partyProfiles);}
	}
	};
	var _boCustInfos=function(){
		var CustInfo = {
				custName : $.trim($("#ccCustName").val()),
				identidiesTypeCd :  $("#div_cc_identidiesType  option:selected").val(),
				custIdCard :  $.trim($("#ccCustIdCard").val()),
				areaId :$("#p_cr_cust_areaId").val(),
				addressStr :$("#ccAddressStr").val(),
				mailAddressStr : $('#ccMailAddressStr').val()
			};
		var data = {};
		data.boCustInfos = [{
			areaId : CustInfo.areaId,
			name : CustInfo.custName,
			norTaxPayerId : "0",
			partyTypeCd : "1",
			addressStr : CustInfo.addressStr,
			mailAddressStr : CustInfo.mailAddressStr,
			state : "ADD"
		}];
		data.boCustIdentities = [{
			identidiesTypeCd :CustInfo.identidiesTypeCd,
			defaultIdType:CustInfo.identidiesTypeCd,//证件类型
			identityNum : CustInfo.custIdCard,
			isDefault : "Y",
			state : "ADD"
		}];
		data.boCustProfiles=[];
		//客户属性信息
		for ( var i = 0; i < order.cust.partyProfiles.length; i++) {
			var profilesObj = order.cust.partyProfiles[i];
			var profilesAdd ={};
			profilesAdd={
				partyProfileCatgCd: profilesObj.attrId,
				profileValue: $.trim($("#"+profilesObj.attrId).val()),
				state : "ADD"
			};
			if(""!=profilesAdd.profileValue){
				data.boCustProfiles.push(profilesAdd);}
		}
		//客户联系人
		data.boPartyContactInfo=[];
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
		        headFlag :  $.trim($("#headFlag  option:selected").val()),//是否首选联系人
		        homePhone : $.trim($("#homePhone").val()),//参与人的家庭联系电话
		        mobilePhone : $.trim($("#mobilePhone").val()),//参与人的移动电话号码
		        officePhone : $.trim($("#officePhone").val()),//参与人办公室的电话号码
		        postAddress : $.trim($("#postAddress").val()),//参与人的邮件地址
		        postcode : $.trim($("#postcode").val()),//参与人联系地址的邮政编码
		        staffId : OrderInfo.staff.staffId,//员工ID
		        state : "ADD",//状态
		        statusCd : "100001"//订单状态
		};
		if($("#tabProfile0").attr("click")=="0"){
			data.boPartyContactInfo.push(_boPartyContactInfo);
		}
		
		var busiOrder = {
				areaId : OrderInfo.getAreaId(),  //受理地区ID
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
				data : data
		};
		
		OrderInfo.getOrderData(); //获取订单提交节点
		SoOrder.getToken();
		OrderInfo.order.soNbr = UUID.getDataId();
		SoOrder.submitOrder(busiOrder);
	};
	//下一步确认按钮
	var _form_custCreateOnly_btn = function() {
		
		$('#custCreateOnlyForm').off("formIsValid").on("formIsValid",function(event) {
			OrderInfo.actionFlag=40;
			_checkIdentity();
		}).ketchup({bindElement:"custCreateOnlyBtn"});
	};
	//验证证件号码是否存在
	var _checkIdentity = function() {
		createCustInfo = {
				cAreaId : OrderInfo.staff.soAreaId,
				cAreaName : "",
				cCustName : $.trim($("#ccCustName").val()),
				cCustIdCard :  $.trim($("#ccCustIdCard").val()),
				cPartyTypeCd : $.trim($("#ccPartyTypeCd  option:selected").val()),
				cIdentidiesTypeCd : $.trim($("#cc_identidiesTypeCd  option:selected").val())
			};
		diffPlace="local";
		var params = {
				"acctNbr":"",
				"identityCd":createCustInfo.cIdentidiesTypeCd,
				"identityNum":createCustInfo.cCustIdCard,
				"partyName":"",
				"custQueryType":"queryOnly",
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
					_boCustProfiles();
					_boCustInfos();
					$("#cust_fill_content").hide();
				},
				no:function(){
					
				}
			});
		}else{
			$.unecOverlay();
			_boCustProfiles();
			_boCustInfos();
			$("#cust_fill_content").hide();
		}
	};
	//新建客户选择地区
	var _newCustChooseArea = function(){
		order.area.chooseAreaTree("cust/mvnoCustCreate","p_cr_cust_areaId_val","p_cr_cust_areaId",3);
	};
	//新建客户时读卡
	var _readCertWhenCreate = function() {
		var servCode="新建客户";
		var man = cert.readCert(servCode);
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
				//版本需要更新特殊处理 不需要提示errorMsg
				return ;
			}
			$.alert("提示", man.errorMsg);
			return;
	   }
		$('#ccPartyTypeCd').val(1);//个人
		cust.create.partyTypeCdChoose($("#ccPartyTypeCd option[value='1']"));
		$('#cc_identidiesTypeCd').val(1);//身份证类型
		cust.create.identidiesTypeCdChoose($("#cc_identidiesTypeCd option[value='1']"));
		$('#ccCustName').val(man.resultContent.partyName);//姓名
		$('#ccCustIdCard').val(man.resultContent.certNumber);//设置身份证号
		$('#ccAddressStr').val(man.resultContent.certAddress);//地址
	};
	return {
		partyTypeCdChoose : _partyTypeCdChoose,
		spec_parm_show :_spec_parm_show,
		btnMoreProfile : _btnMoreProfile,
		form_custCreateOnly_btn : _form_custCreateOnly_btn,
		identidiesTypeCdChoose :_identidiesTypeCdChoose,
		changeLabel : _changeLabel,
		newCustChooseArea :_newCustChooseArea,
		readCertWhenCreate : _readCertWhenCreate,
		init :_init
	};
})();
$(function() {
	cust.create.init();
	cust.create.partyTypeCdChoose($("#ccPartyTypeCd").children(":first-child"));
	cust.create.spec_parm_show();
	cust.create.form_custCreateOnly_btn();
	});
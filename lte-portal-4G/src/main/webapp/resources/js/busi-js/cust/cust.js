/**
 * 客户资料管理
 */
CommonUtils.regNamespace("order", "cust");

order.cust = (function(){
    var man;
	var _choosedCustInfo = {};
	var _checkUserInfo = {
		 accNbr: ""
	};
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
	var _certInfo = {};

	var _getCustInfo = function() {
		return custInfo;
	};
	var _orderBtnflag="";
	// 安全办公开关
	var _securityOfficeFlag = "";
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
					OrderInfo.cust_validateType = "3";//保存鉴权方式
				},"always":function(){
					$.unecOverlay();
				}
			});
		}).ketchup({bindElement:"custAuthbtn"});
		//身份证鉴权
		$('#custAuthFormID').bind('formIsValid', function(event, form) {
			var param = _choosedCustInfo;
            param.pCustIdentityCd = $("#p_cust_identityCd").val();
			param.identityNum =base64encode(utf16to8($.trim($("#authIDTD").val())));
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

		$("#useraddclose").off("click").on("click",function(event) {
			try {
				easyDialog.close();
			} catch(e) {
				$('#user_add').hide();
				$('#overlay').hide();
			}
		});
		$("#userinfoclose,#custsussbtn").off("click").on("click",function(event){
			easyDialog.close();
		});
		//重置
		$("#createcustresetBtn").off("click").on("click",function(event) {
			if ($.ketchup) {
				$.ketchup.hideAllErrorContainer($("#custCreateForm"));
			}
			if ($.trim($("#identidiesTypeCd option:selected").val()) == "1" && $("#td_custIdCard").data("flag") == "1") {
				$("#td_custIdCard").data("flag", "0");
				_certInfo = {};
				$("#td_custName").html("");
				$("#td_custIdCard").html("");
				$("#td_addressStr").html("");
				var identityPic = $("#img_custPhoto").data("identityPic");
				if (identityPic != undefined) {
					$("#img_custPhoto").removeData("identityPic").attr("src", "");
				}
				$("#tr_custPhoto").hide();
			}
			$("#btncreatecustreset").click();
			_setSelectVal("identidiesTypeCd", "1"); //默认证件类型使用“身份证”
		});
		$("#custresetBtn").off("click").on("click",function(event){
			$("#btncustreset").click();
		});
	};
	//客户类型选择事件
	var _partyTypeCdChoose = function(scope,id) {
		var partyTypeCd=$(scope).val();
        if ("1" == partyTypeCd) {
            $($(scope).parents(".network")[0]).find("#cCustName").attr("data-validate", "validate(personal) on(blur)");
            $("#industryClassCd").hide();
            OrderInfo.industryClassInfo ={};
        } else if ("2" == partyTypeCd) {
            $($(scope).parents(".network")[0]).find("#cCustName").attr("data-validate", "validate(government) on(blur)");
            $("#industryClassCd").show();
            $("#industryClassCdSe").empty();
            //政企客户显示行业类型
    		var param = {
    			"areaId"      :$("#p_cust_areaId").val(),
    		    "attrSpecCode":"INDUSTRY_CLASS"
    		} ;
    		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
    			"done" : function(response){
    				if(response.code==0){
    					var data = response.data ;
    					if(data!=undefined && data.length>0){
    						OrderInfo.industryClassInfo = data;
    						for(var i=0;i<data.length;i++){
    							var busiStatus = data[i];
    							$("#industryClassCdSe").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
    						}
    					}

    					var industryClassCdSe = $("#industryClassCdSe").val();
    					var seCondGradIndustryClass = [];
    					
    					for(var i=0;i<OrderInfo.industryClassInfo.length;i++){
    						if(OrderInfo.industryClassInfo[i].attrValueCode == industryClassCdSe){
    							seCondGradIndustryClass = OrderInfo.industryClassInfo[i].attrSpecDesc.seCondGradIndustryClass;
    							if(OrderInfo.industryClassInfo[i].attrExtendValue!=null &&OrderInfo.industryClassInfo[i].attrExtendValue!=""){
    								$("#identidiesTypeCd").val(OrderInfo.industryClassInfo[i].attrExtendValue);
    								$("#identidiesTypeCd").attr("disabled","disabled"); 
    							}else{
    								$("#identidiesTypeCd").removeAttr("disabled");
    							}
    							break;
    						}
    					}
    					$("#industryClassCdSeSecond").empty();
    					$("#industryClassCdSeSecond").append("<option value='def'>--请选择--</option>");
    					$("#industryClassCdSeThird").empty();
    					$("#industryClassCdSeThird").append("<option value='def'>--请选择--</option>");
    					for(var i=0;i<seCondGradIndustryClass.length;i++){
    						var seCondInfo= seCondGradIndustryClass[i];
    						$("#industryClassCdSeSecond").append("<option value='"+seCondInfo.industryClassCd+"' >"+seCondInfo.name+"</option>");
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
        }
		//客户类型关联证件类型下拉框
		$("#"+id).empty();
		_certTypeByPartyType(partyTypeCd,id);
		//创建客户证件类型选择事件,新建客户以及经办人客户选择事件，id对应不同
		var typeCdChooseId = "cCustIdCard";
		// 新建客户
		if (id == "identidiesTypeCd") {
			typeCdChooseId = "cCustIdCard";
		}
		// 新建客户经办人
		if (id == "custCAttrIdentidiesTypeCd") {
			typeCdChooseId = "custCAttrIdCard";
		}
		// 填单页面
		if (id == "orderIdentidiesTypeCd") {
			typeCdChooseId = "orderAttrIdCard";
		}
		_identidiesTypeCdChoose($("#"+id).children(":first-child"), typeCdChooseId);
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
							if(certTypedate.isDefault == "Y"){
								$("#"+id).append("<option value='"+certTypedate.certTypeCd+"' selected='selected'>"+certTypedate.name+"</option>");
							}else{
								$("#"+id).append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							}
						}
						//屏蔽身份证
						/*if(id=="identidiesTypeCd" && OrderInfo.staff.idType=="OFF")
						{
							$("#"+id+" option[value='1']").remove();
							$("#readCertBtnCreate").hide();
						}*/
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

		}else if (identidiesTypeCd=="bizId") {
			$("#"+id).attr("placeHolder","请输入计费标识");
			$("#"+id).attr("data-validate","validate(required:请准确填写计费标识) on(keyup)");
		}else{
			$("#"+id).attr("placeHolder","请输入证件号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写证件号码) on(keyup)");
		}

		// 反档处理
		if(OrderInfo.actionFlag == 43 && id != "p_cust_identityNum_choose"){
			var isID = identidiesTypeCd==1;
			var isIdTypeOff = OrderInfo.staff.idType=="OFF";
			$("#"+id).attr("disabled",isID&&(!isIdTypeOff));
		}

		if(identidiesTypeCd==-1 || identidiesTypeCd=="cloudId"){
			$("#isAppointNum").attr("checked",true);
		}else{
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
	//客户定位证件类型选择事件
	var _iotCustidentidiesTypeCdChoose = function(scope,id) {

		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==-1){
			$("#"+id).attr("placeHolder","请输入接入号码");
			$("#"+id).attr("data-validate","validate(number:请准确填写接入号码) on(keyup)");
		}else if (identidiesTypeCd==100){
			$("#"+id).attr("placeHolder","请输入终端串码");
			$("#"+id).attr("data-validate","validate(terminalCodeCheck:请准确填写终端串码) on(keyup)");
		}
	};

	//创建客户证件类型选择事件
	var _identidiesTypeCdChoose = function(scope,id) {
		$("#identidiesTypeCd").removeAttr("disabled");
		$("#"+id).val("");
		$("#"+id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9]/ig,'')");
		var identidiesTypeCd=$(scope).val();
		$("#"+id).attr("maxlength", "100");
		if (identidiesTypeCd == 1) {
			/*$("#"+id).attr("placeHolder","请输入合法身份证号码");
			$("#"+id).attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(blur)");*/
			// 新建客户身份证读卡，隐藏表单
			if (id == "cCustIdCard") {
				$("#readCertBtnCreate").show();
				$('#td_custIdCard').removeData("flag");
				// 获取pushBusi.js里绑定状态
				if(CONST.GET_BIND_STATUS()){
					$("#discernBtn_2").show();
				}
				$("#btn_readCert").show(); // 预受理
				$("#td_custName").data("custName", $("#td_custName").html());
				$("#td_custName").html("");
				$("#td_custIdCard").data("custIdCard", $("#td_custIdCard").html());
				$("#td_custIdCard").html("").data("flag", "0");
				$("#td_addressStr").data("addressStr", $("#td_addressStr").html());
				$("#td_addressStr").html("");
				_certInfo = {};
				var identityPic = $("#img_custPhoto").data("identityPic");
				if (identityPic != undefined) {
					$("#img_custPhoto").removeData("identityPic").attr("src", "");
				}
			}
			// 填单页面经办人读卡
			if (id == "orderAttrIdCard") {
				$("#orderAttrReadCertBtn").show();
			  if(CONST.GET_BIND_STATUS()){
					$("#discernBtn_4").show();
				}
				$("#orderAttrName").hide();
				$("#orderAttrIdCard").hide();
				$("#orderAttrAddr").hide();
				$("#orderAttrQueryCertBtn").hide();
				$("#li_order_attr span").show();
				$("#li_order_remark2 span").show();
				$("#li_order_remark3 span").show();
			}
			// 填单页面使用人读卡
			if (id == "orderUserAttrIdCard") {
				$("#orderUserAttrReadCertBtn").show();
				$("#orderUserAttrName").hide();
				$("#orderUserAttrIdCard").hide();
				$("#orderUserAttrAddr").hide();
				$("#orderUserAttrQueryCertBtn").hide();
				$("#li_order_name span").show();
				$("#li_order_cert span").show();
				$("#li_order_nbr span").show();
			}
			// 新建客户经办人读卡
			if (id == "custCAttrIdCard") {
				$("#custCAttrReadCertBtn").show();
				if(CONST.GET_BIND_STATUS()){
					$("#discernBtn_3").show();
				}
				// 元素id由后台传来，这边读卡隐藏输入框，只能先写死
				$("#" + CONST.BUSI_ORDER_ATTR.orderAttrName).hide();
				$("#" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard).hide();
				$("#" + CONST.BUSI_ORDER_ATTR.orderAttrAddr).hide();
				$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrName + "']").show();
				$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard + "']").show();
				$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrAddr + "']").show();
			}
		} else {
			if (CONST.realNamePhotoFlag == "OFF"){
				$("#orderAttrQueryCertBtn").hide();
				// $("#orderAttrQueryCertBtn").remove();
		    }else{
		    	$("#orderAttrQueryCertBtn").show();
		    }
			// 新建客户非身份证，还原表单
			if (id == "cCustIdCard") {
				$("#btn_readCert").hide(); // 预受理
				var $readCertBtn = $("#readCertBtnCreate");
				var $discernBtn = $("#discernBtn_2");
				if ("none" != $readCertBtn.css("display")) {
					$readCertBtn.hide();
					$discernBtn.hide();
					$("#td_custName").html($("#td_custName").data("custName"));
					$("#td_custIdCard").html($("#td_custIdCard").data("custIdCard"));
					$("#td_addressStr").html($("#td_addressStr").data("addressStr"));
					var identityPic = $("#img_custPhoto").data("identityPic");
					if (identityPic != undefined) {
						$("#img_custPhoto").removeData("identityPic").attr("src", "");
					}
					$("#cCustName").focus();
				}
			}
			// 填单页面经办人非身份证
			if (id == "orderAttrIdCard") {
				$("#orderAttrReadCertBtn").hide();
				$("#discernBtn_4").hide();
				$("#orderAttrName").show();
				$("#orderAttrName").val("");
				$("#orderAttrIdCard").show();
				$("#orderAttrIdCard").val("");
				$("#orderAttrAddr").show();
				$("#orderAttrAddr").val("");

				$("#li_order_attr span").hide();
				$("#li_order_attr span").text("");
				$("#li_order_remark2 span").hide();
				$("#li_order_remark2 span").text("");
				$("#li_order_remark3 span").hide();
				$("#li_order_remark3 span").text("");
			}
			// 填单页面使用人非身份证
			if (id == "orderUserAttrIdCard") {
				$("#orderUserAttrReadCertBtn").hide();
				$("#orderUserAttrName").show();
				$("#orderUserAttrName").val("");
				$("#orderUserAttrIdCard").show();
				$("#orderUserAttrIdCard").val("");
				$("#orderUserAttrAddr").show();
				$("#orderUserAttrAddr").val("");

				$("#li_order_name span").hide();
				$("#li_order_name span").text("");
				$("#li_order_card span").hide();
				$("#li_order_card span").text("");
				$("#li_order_addr span").hide();
				$("#li_order_addr span").text("");
			}
			// 新建客户经办人非身份证
			if (id == "custCAttrIdCard") {
				$("#custCAttrReadCertBtn").hide();
				$("#discernBtn_3").hide();
				$("#" + CONST.BUSI_ORDER_ATTR.orderAttrName).show();
				$("#" + CONST.BUSI_ORDER_ATTR.orderAttrName).val("");
				$("#" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard).show();
				$("#" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard).val("");
				$("#" + CONST.BUSI_ORDER_ATTR.orderAttrAddr).show();
				$("#" + CONST.BUSI_ORDER_ATTR.orderAttrAddr).val("");
				$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrName + "']").hide();
				$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrName + "']").text("");
				$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard + "']").hide();
				$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard + "']").text("");
				$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrAddr + "']").hide();
				$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrAddr + "']").text("");
			}
			if(identidiesTypeCd==2){
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
            if (query.common.queryPropertiesStatus("CHECK_RULES_" + (ec.util.isObj(OrderInfo.staff.areaId) ? OrderInfo.staff.areaId.substr(0, 3) : "")) && CacheData.isInCheckRuleByTypeCd(identidiesTypeCd)) {
                if (id == "custCAttrIdCard") {
                    $("#" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard).removeAttr("onkeyup");
                    $("#" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard).attr("placeHolder", "请输入合法" + CacheData.getCheckRuleByKey(identidiesTypeCd, "name"));
                    $("#" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard).attr("data-validate", "validate(blank_" + CacheData.getCheckRuleByKey(identidiesTypeCd, "checkFunction") + ":" + CacheData.getCheckRuleByKey(identidiesTypeCd, "description") + ") on(blur)");

                    $("#" + CONST.BUSI_ORDER_ATTR.orderAttrAddr).removeAttr("onkeyup");
                    $("#" + CONST.BUSI_ORDER_ATTR.orderAttrAddr).attr("placeHolder", "请输入经办人地址");
                    $("#" + CONST.BUSI_ORDER_ATTR.orderAttrAddr).attr("data-validate", "validate(blank_address) on(blur)");

                    $("#" + CONST.BUSI_ORDER_ATTR.orderAttrName).removeAttr("onkeyup");
                    $("#" + CONST.BUSI_ORDER_ATTR.orderAttrName).attr("placeHolder", "请输入经办人姓名");
                    $("#" + CONST.BUSI_ORDER_ATTR.orderAttrName).attr("data-validate", "validate(blank_personal) on(blur)");
                } else {
                    $("#" + id).removeAttr("onkeyup");
                    $("#" + id).attr("placeHolder", "请输入合法" + CacheData.getCheckRuleByKey(identidiesTypeCd, "name"));
                    $("#" + id).attr("data-validate", "validate(" + CacheData.getCheckRuleByKey(identidiesTypeCd, "checkFunction") + ":" + CacheData.getCheckRuleByKey(identidiesTypeCd, "description") + ") on(blur)");
                }
            }
        }
		if($("#partyTypeCd").val() == 2){
			for(var i=0;i<OrderInfo.industryClassInfo.length;i++){
				if(OrderInfo.industryClassInfo[i].attrExtendValue == identidiesTypeCd){
					$("#industryClassCdSeSecond").empty();
					$("#industryClassCdSeSecond").append("<option value='def'>--请选择--</option>");
					$("#industryClassCdSeThird").empty();
					$("#industryClassCdSeThird").append("<option value='def'>--请选择--</option>");
					$("#industryClassCdSe").attr("value",OrderInfo.industryClassInfo[i].attrValueCode);
					$("#identidiesTypeCd").attr("disabled","disabled"); 
					for(var j=0;j<OrderInfo.industryClassInfo[i].attrSpecDesc.seCondGradIndustryClass.length;j++){
						var seCondInfo= OrderInfo.industryClassInfo[i].attrSpecDesc.seCondGradIndustryClass[j];
						$("#industryClassCdSeSecond").append("<option value='"+seCondInfo.industryClassCd+"' >"+seCondInfo.name+"</option>");
					}
					break;
				}
			}
		}
		_custcreateButton();
        _jbrcreateButton();//经办人事件绑定
		//如果是身份证，则禁止输入，否则启用输入控件
		var isID = identidiesTypeCd==1;
		var isIdTypeOff = OrderInfo.staff.idType=="OFF";
		if (id == "cCustIdCard") {
			$("#cCustName").val("");
			$("#cAddressStr").val("");
			$('#cCustIdCard').attr("disabled",isID&&(!isIdTypeOff));
			$('#cCustName').attr("disabled",isID&&(!isIdTypeOff));
			$('#cAddressStr').attr("disabled",isID&&(!isIdTypeOff));
		}
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
            OrderInfo.cust_validateType = "1";
		}else{
			//4G所有证件类型定位都需要客户鉴权
			authFlag="0";
		}
		if(identityCd==-1 || identityCd=="cloudId"){
			acctNbr=identityNum;
			identityNum="";
			identityCd="";
		}else if(identityCd=="acctCd"||identityCd=="custNumber"||identityCd=="bizId"){
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
				"identidies_type":$("#p_cust_identityCd  option:selected").text(),
				"soNbr":UUID.getDataId()
		};
		// 如果是接入号，且开关打开，则添加产品大类字段
		if ($("#p_cust_identityCd").val() == -1 && "ON" == CacheData.getIntOptSwitch()) {
			param.prodClass = $("#prodTypeCd").val();
		}else if($("#p_cust_identityCd").val()=="cloudId"){
			param.prodClass = CONST.PROD_BIG_CLASS.PROD_CLASS_CLOUD;
		}
		// 将客户查询入参保存，供查询预约号码用
		order.cust.custQueryParam = param;
		//实名信息采集单将查询信息保存
		if(OrderInfo.actionFlag == 45){
			cust.collection.custInfo = {
				"queryNum":$.trim($("#p_cust_identityNum").val()),
				"queryType":$.trim($("#p_cust_identityCd").val()),
				"queryTypeName":$("#p_cust_identityCd  option:selected").text(),
				"queryAreaId" : areaId,
				"queryAreaName" : $("#p_cust_areaId_val").val()
			}
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
    		 var val = $("#cAddressStr").val();
    		 if(val ==  undefined){
    			 val = $("#td_addressStr").html();
    		 }
    		 var len = 0;
             for (var i = 0; i < val.length; i++) {
                  var a = val.charAt(i);
                  if (a.match(/[^\x00-\xff]/ig) != null)
                 {
                     len += 2;
                 }
                 else
                 {
                     len += 1;
                 }
             }
            if ($.trim(len) < 12){
	        	$.alert("提示","客户地址必须大于等于12个字符!");
	        	return false;
	        }
		    if ($.trim($("#identidiesTypeCd option:selected").val()) == "1" && $('#td_custIdCard').data("flag") != "1"){
        		$.alert("提示","请先读卡");
        		return false;
        	}
        	
        	//判断新建客户姓名以空格开头或结尾，身份证读取的不管
        	if ($.trim($("#identidiesTypeCd option:selected").val()) != "1"){
	        	var cCustName = $("#cCustName").val();
	        	if(ec.util.isObj(cCustName)&&cCustName.substr(0,1)==" "||cCustName.substr(cCustName.length-1)==" "){
	        		$.alert("提示", "客户姓名不能以空格开头或结尾，请确认！");
	        		return false;
	        	}
        	}
        	
    	   // 如果填写了联系人相关信息，则联系人名称不能为空
		   if (!($.trim($("#dishomePhone").val()) == "" && $.trim($("#disofficePhone").val()) == "" && $.trim($("#dismobilePhone").val()) == "") && $.trim($("#discontactName").val()) == "") {
			   $.alert("提示","联系人名称不能为空！","information");
			   return;
		   }
		   // 政企客户，经办人必填
		   if ($("#partyTypeCd option:selected").val() == "2") {
			   if (!ec.util.isObj($("#" + CONST.BUSI_ORDER_ATTR.orderAttrName).val()) || !ec.util.isObj($("#" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard).val()) || !ec.util.isObj($("#" + CONST.BUSI_ORDER_ATTR.orderAttrAddr).val()) || !ec.util.isObj($("#" + CONST.BUSI_ORDER_ATTR.orderAttrPhoneNbr).val())) {
				   $.alert("提示", "政企单位用户经办人信息为必填项！");
				   return;
			   }
			   var industryClassCdSe = $("#industryClassCdSe").val();
			   var identidiesTypeCd =  $("#identidiesTypeCd").val();
			   var checkFlag = true;
			   var tipsInfo="";
			   for(var i=0;i<OrderInfo.industryClassInfo.length;i++){
				   if(industryClassCdSe == OrderInfo.industryClassInfo[i].attrValueCode && OrderInfo.industryClassInfo[i].attrExtendValue!=null && OrderInfo.industryClassInfo[i].attrExtendValue!="" && identidiesTypeCd!=OrderInfo.industryClassInfo[i].attrExtendValue){
					   checkFlag = false;
					   tipsInfo="行业类型为'"+OrderInfo.industryClassInfo[i].attrValueName+"' 时，证件类型必须 "+$("#identidiesTypeCd option[value=" + OrderInfo.industryClassInfo[i].attrExtendValue + "]").text()+"'";
					   break;
				   }else if(identidiesTypeCd == OrderInfo.industryClassInfo[i].attrExtendValue && industryClassCdSe != OrderInfo.industryClassInfo[i].attrValueCode){
					   checkFlag = false;
					   tipsInfo="证件类型为 '"+$("#identidiesTypeCd option[value=" + OrderInfo.industryClassInfo[i].attrExtendValue + "]").text()+"' 时，行业类型必须为 '"+OrderInfo.industryClassInfo[i].attrValueName+"'";
					   break;
				   }
			   };
               if(!checkFlag){
            	   $.alert("提示",tipsInfo);
    			   return; 
               }
			   
		   }
	    	var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger = response.data;
			}
			_checkIdentity();
	     }).ketchup({bindElement:"createcustsussbtn"});
    };

    //经办人校验form绑定
    var _jbrcreateButton = function () {
        $("#jbrForm").off("formIsValid").bind("formIsValid", function (event) {
            _showCertPicture();
            $("#img_Cert").attr("src", contextPath + "/image/id_card.jpg");
        }).ketchup({bindElement: "orderAttrQueryCertBtn"});
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
		if(response.data.indexOf("errCode=405") >=0) {
			$.alert("提示","抱歉，业务操作过频，工号锁定!");
			return;
		}

		if(response.data.indexOf("showDiffcode") >=0) {
			$.alert("提示","抱歉，该工号没有异地业务的权限！");
			return;
		}
		if(response.data.indexOf("false") ==0) {
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
		//$("#custListOverlay").show();
	};

	// 客户重新定位
	var _custReset = function() {
		//填单页面
		if((0!=OrderInfo.order.step)||(0==OrderInfo.order.step&&OrderInfo.actionFlag==2)||(0==OrderInfo.order.step&&OrderInfo.actionFlag==37)){
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
		OrderInfo.cust_validateType="";//重置客户鉴权方式
		OrderInfo.cust_validateNum="";//保存鉴权号码
		OrderInfo.boCusts.partyId="";
		//重新定位重置已选产品信息缓存
		order.prodModify.choosedProdInfo={};
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
		var param = $.extend(true, {}, _choosedCustInfo);
		param.prodPwd = $.trim($("#auth3").find("#authPassword2").val());
		param.authFlag=authFlag;
		param.fromProvFlag=order.cust.fromProvFlag;
		param.menuName = $("#menuName").attr("menuName");
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
		var recordParam={};
		recordParam.validateType="4";
		recordParam.validateLevel="1";
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accessNumber;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		param.authFlag="1";
		$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","客户鉴权失败,稍后重试");
					_saveAuthRecordFail(recordParam);
					return;
				}
				//判断能否转为json，可以的话返回的就是错误信息
				try {
					var errorData = $.parseJSON(response.data);
					if (ec.util.isObj(errorData.custAuthInfo)) {
						$.alert("提示", errorData.custAuthInfo);
						_saveAuthRecordFail(recordParam);
						return;
					}
				} catch (e) {
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
				OrderInfo.cust_validateType="4";//保存鉴权方式
				_saveAuthRecordSuccess(recordParam);
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	// cust auth callback
	var _custAuthCallBack = function(response) {
		OrderInfo.authRecord.resultCode="";
		if(authFlag=="0"){
			try{
				easyDialog.close();
			}catch(e){
				$("#auth3").hide();
				$("#overlay").hide();
			}
		}
		$("#custList").hide();
		$("#custQryDiv").hide();
		if($.ketchup)
			$.ketchup.hideAllErrorContainer($("#custCreateForm"));
		var content$ = $("#custInfo");
		content$.html(response.data).show();
		if((OrderInfo.boCusts.partyId!="-1"&&OrderInfo.boCusts.partyId!=""&&OrderInfo.boCusts.partyId!=undefined)&&order.prodModify.lteFlag==true){
			//$("#custModifyId").attr("style","display: none;");
		}else{
			//$("#custModifyId").attr("style","");
			var $update = $('<a id="custModifyId" class="numberSearch loc_edit"><span>修改</span></a>');
			$update.prependTo($('#custInfo').find('.uedit')).css('margin-right','5px'); // 防止IE样式丢失无间隔
			$('#custModifyId').off('click').on('click',function(){
				order.prodModify.showCustInfoModify();
			});

		}
		$("#cCustName").val("");
		$("#cCustIdCard").val("");
		main.home.hideMainIco();
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

	/**
	 * 根据tabId获取鉴权类型
	 * @param tabId
	 * @returns {string}
	 */
	function getAuthType(tabId, isSame) {
		var retId = "";
		if (tabId == "1") {
			retId = "3";
		} else if (tabId == "2") {
			retId = "1";
		} else if (tabId == "3") {
			retId = "2";
		} else if (tabId == "7" && isSame == "N") {
			retId = "8";
		} else {
			retId = tabId;
		}
		return retId;
	}
	//客户列表点击
	var _showCustAuth = function(scope) {
		if(OrderInfo.menuName == "ZXHYBL"){
			var accNbr = $(scope).attr("accNbr");
			var identityNum = $.trim($("#p_cust_identityNum").val());
			var  qryResponse =  _qryPreliminaryInfo(identityNum,accNbr);
			if(qryResponse.code == 0){
				if(qryResponse.data.result == null || qryResponse.data.result.userInfo == null || qryResponse.data.result.userInfo.businessType==null){
					$.alert("错误","查询后台 '客户信息核验接口' 未返回结果，查询接口流水号："+qryResponse.data.transactionID);
					return;
				}else{
					var userInfo = qryResponse.data.result.userInfo;
					var areaId = $("#p_cust_areaId").val();
					if(userInfo.cityCode.substr(0,5) != areaId.substr(0,5)){
						$.alert("提示","集约4G系统里用户的受理地区 "+areaId+" 和征信平台初审接口返回 cityCode "+userInfo.cityCode+" 办理业务的城市编码不一致,无法办理征信业务。");
						return;
					}
					if(identityNum != userInfo.idcard){
						$.alert("提示","集约4G系统里用户办理用户的证件号码和征信平台初审接口返回的idcard用户身份证号码不一致，无法办理征信业务。");
						return;
					}
					if(accNbr != userInfo.userPhone){
						$.alert("提示","集约4G征信平台初审接口返回的userPhone用户手机号码不一致，无法办理征信业务。");
						return;
					}
					
					OrderInfo.preliminaryInfo = userInfo;
				};
			}else{
				$.alertM(qryResponse.data);
				return;
			};
		};
        var param = {
            "accNbr": $(scope).attr("accNbr"),
            "identityCd": $(scope).attr("identityCd"),
            "areaId": $(scope).attr("areaId"),
            "custId": $(scope).attr("custId"),
            "soNbr": UUID.getDataId()
        };

		var isCloud = $('#p_cust_identityCd').val()=="cloudId"?true:false;

        _choosedCustInfo = {
            custId: $(scope).attr("custId"), //$(scope).find("td:eq(3)").text(),
            partyName: $(scope).attr("partyName"), //$(scope).find("td:eq(0)").text(),
            CN: $(scope).attr("CN"),
            address: $(scope).attr("address"),
            certNum: $(scope).attr("certNum"),
            idCardNumber: $(scope).attr("idCardNumber"), //$(scope).find("td:eq(4)").text(),
            identityName: $(scope).attr("identityName"),
            areaName: $(scope).attr("areaName"),
            areaId: $(scope).attr("areaId"),
            identityCd: $(scope).attr("identityCd"),
            addressStr: $(scope).attr("addressStr"),
            norTaxPayer: $(scope).attr("norTaxPayer"),
            segmentId: $(scope).attr("segmentId"),
            segmentName: $(scope).attr("segmentName"),
            custFlag: $(scope).attr("custFlag"),
            vipLevel: $(scope).attr("vipLevel"),
            vipLevelName: $(scope).attr("vipLevelName"),
            accNbr: $(scope).attr("accNbr"),
			isCloud:isCloud,
            userIdentityCd: "",//使用人证件类型
            userIdentityName: "",//使用人证件名称
            userIdentityNum: "",//使用人证件号码
            accountName: "",//账户名
            userName: "",//使用人名
            userCustId: "",//使用人客户id
            isSame: ""//使用人名称与账户名称是否一致
        };
        
        //实名信息采集单客户定位判断是否为政企客户，否则提示拦截
        if(OrderInfo.actionFlag == 45){
        	 // 判断是否是政企客户
            var isGovCust = false;
            for (var i = 0; i < CacheData.getGovCertType().length; i++) {
                if (_choosedCustInfo.identityCd == CacheData.getGovCertType()[i]) {
                    isGovCust = true;
                    break;
                }
            }
            if(!isGovCust){
            	 $.alert('提示', '实名信息采集单客户必须为政企客户，请重新定位。');
            	 $(".userclose").click();
                 return false;
            }
        }

		// 天翼云盘无使用人
        if(ec.util.isObj(param.accNbr) && !_choosedCustInfo.isCloud){
        	$.callServiceAsJson(contextPath + "/cust/queryCustExt", param, {
                "before": function () {
                    $.ecOverlay("<strong>正在查询中,请稍等...</strong>");
                }, "done": function (response) {
                    if (response.code == 0) {
            			 if(ec.util.isObj(response.data.userIdentityCd))_choosedCustInfo.userIdentityCd = response.data.userIdentityCd;//使用人证件类型
            			 if(ec.util.isObj(response.data.userIdentityName))_choosedCustInfo.userIdentityName = response.data.userIdentityName;//使用人证件名称
            			 if(ec.util.isObj(response.data.userIdentityNum))_choosedCustInfo.userIdentityNum = response.data.userIdentityNum;//使用人证件号码
            			 if(ec.util.isObj(response.data.userCertNumEnc))_choosedCustInfo.userCertNumEnc = response.data.userCertNumEnc;//使用人证件号码加密字段
            			 if(ec.util.isObj(response.data.userCertAddress))_choosedCustInfo.userCertAddress = response.data.userCertAddress;//使用人证件地址
            			 if(ec.util.isObj(response.data.userCertAddressEnc))_choosedCustInfo.userCertAddressEnc = response.data.userCertAddressEnc;//使用人证件地址加密字段
            			 if(ec.util.isObj(response.data.accountName))_choosedCustInfo.accountName = response.data.accountName;//账户名
            			 if(ec.util.isObj(response.data.userName))_choosedCustInfo.userName = response.data.userName;//使用人名
            			 if(ec.util.isObj(response.data.userNameEnc))_choosedCustInfo.userNameEnc = response.data.userNameEnc;//使用人名加密字段
            			 if(ec.util.isObj(response.data.userCustId))_choosedCustInfo.userCustId = response.data.userCustId;//使用人客户id
            			 if(ec.util.isObj(response.data.isSame))_choosedCustInfo.isSame = response.data.isSame;//使用人名称与账户名称是否一致
                    	 _showCustAuth2(scope,_choosedCustInfo);
                    } else {
                        $.alertM(response.data);
                    }
                }, "fail": function (response) {

                }, "always": function () {
                    $.unecOverlay();
                }
            });
        }else{
        	_showCustAuth2(scope,_choosedCustInfo);
        }
	}

	var _showCustAuth2 = function(scope,_choosedCustInfo) {
        //设置被选择标识
        _checkUserInfo.accNbr = "";
        _checkUserInfo.accNbr = $(scope).attr("accNbr");
        $(scope).attr("selected", "selected");
        $(scope).siblings().each(function () {
            $(this).removeAttr("selected");
        });
        // 判断是否是政企客户
        var isGovCust = false;
        for (var i = 0; i < CacheData.getGovCertType().length; i++) {
            if (_choosedCustInfo.identityCd == CacheData.getGovCertType()[i]) {
                isGovCust = true;
                break;
            }
        }
        //省份政企开关
        var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "GOV_" + _choosedCustInfo.areaId.substr(0, 3)});
        var govSwitch = "OFF";
        if (response.code == "0") {
            govSwitch = response.data;
        }
        if (order.cust.queryForChooseUser && isGovCust) {
            $.alert('提示', '使用人必须是公众客户，请重新定位。');
            return false;
        }
        var menuName = $("#menuName").attr("menuName");
        if (ec.util.isObj(menuName) && (CONST.MENU_FANDANG == menuName || CONST.MENU_CUSTFANDANG == menuName || CONST.MENU_RETURNFILE == menuName || CONST.MENU_REMOVEPROD == menuName || CONST.MENU_BUYBACK == menuName)) {
            authFlag = "1";
        }
        if (authFlag == "0") {
            //TODO init view
            if (order.cust.authType == '00') {
                $("#custAuthTypeName").html("客户密码：");
            } else {
                $("#custAuthTypeName").html("产品密码：");
            }

            if (govSwitch == "ON" && isGovCust) {
                //有“测试卡权限”或“党政军备案卡权限”定位客户时不校验政企客户使用人信息
                if (!ec.util.isObj(_choosedCustInfo.userCustId) && ec.util.isObj(_choosedCustInfo.accNbr) && !_choosedCustInfo.isCloud&&!OrderInfo.specialtestauth&&!OrderInfo.dzjbakqx) {
                    $.alert("提示", "返回的使用人信息为空，请补全信息！");
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
                if (!ec.util.isObj(accessNumber) || !ec.util.isObj(_choosedCustInfo.userCustId)) {
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
                    if (CONST.GET_BIND_STATUS()) {
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
                easyDialog.open({
                    container: 'auth3',
                    callback: function () {
                        order.cust.queryForChooseUser = false; //关闭弹出框时重置标识位
                    }
                });
            } else {
                _realCheck(contextPath, scope);
            }
            if (order.cust.jumpAuthflag == "0") {
                $("#auth3").find("#jumpAuth").show();
            }
            $("#authClose").off("click").on("click", function (event) {
                easyDialog.close();
                initAuth3();
            });
        } else {
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
		var menuName = $("#menuName").val();
		OrderInfo.menuName = menuName;
		if(areaId.indexOf("0000")>0){
			$.alert("提示","前页受理地区为省级地区无法进行创建,请先选择市级地区！");
			return;
		}
		tabProfileFlag="1";
		$("#partyTypeCd").val("1");//默认个人客户
		_partyTypeCdChoose($("#partyTypeCd").children(":first-child"),"identidiesTypeCd");
		_setSelectVal("identidiesTypeCd","1"); //默认证件类型使用“身份证”
		_identidiesTypeCdChoose($("#identidiesTypeCd  option:selected").length ?  $("#identidiesTypeCd  option:selected") : $("#identidiesTypeCd").children(":first-child"),"cCustIdCard");
		_custcreateButton();
		_spec_parm_show();
		if(menuName!=null && menuName == "ZXHYBL"){
			$("#partyTypeCd").attr("disabled","disabled");  
			$("#identidiesTypeCd").attr("disabled","disabled"); 
		}
		$("#partyProfile").attr("style","display:none");
		easyDialog.open({
			container: 'user_add',
			callback: _userAddClosed
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
		if ($("#p_cust_identityCd").val() == "cloudId"){
			param.prodClass = CONST.PROD_BIG_CLASS.PROD_CLASS_CLOUD;
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
		var menuName = $("#menuName").attr("menuName");
		if(ec.util.isObj(menuName)){
			param.menuName = menuName;
		}else{
			param.menuName = "";
		}
		if(param.custId==null||param.custId==""){
			$.alert("提示","无法查询已订购产品");
			return;
		}
		// 通过BIZID定位的客户，已订购查询需要增加入参调另一个接口
		if ("bizId" == order.cust.custQueryParam.queryType) {
			param.lanId = OrderInfo.getAreaId();
			param.extCustId = "";
			param.BIZID = order.cust.custQueryParam.queryTypeValue;
			param.areaNbr = "";
			param.flag = "all";
		}
		//请求地址
		var url = contextPath+"/cust/orderprod";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#phoneNumListtbody tr td[name ='pord_uim_type_query']").each(function(){
					var param ={
							prodInstId	: $(this).attr("prodInstId"),
							areaId		: $(this).attr("areaId"),
							acctNbr		: $(this).attr("acctNbr")
						};
						var terminalInfo = query.prod.getTerminalInfo2(param);
						if(terminalInfo!=null&&terminalInfo.is4GCard!=null&&terminalInfo.is4GCard!=""){
							if(terminalInfo.is4GCard =="Y"){
								$(this).text("4G卡");
							}else{
								if(terminalInfo.is4GCard =="N"&&terminalInfo.couponId!= undefined){
									$(this).text("3G卡");
								}else{
									$(this).text("非集约卡");
								}
							}
						}else{
							$(this).text(" ");
						}
				});
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%;height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				if (response.code == -2) {
					return;
				}else if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				var content$=$("#orderedprod");
				content$.html(response.data);
				// 安全办公群组拆机菜单开关
				if ("ON" != _securityOfficeFlag) {
					$("#orderedprod a:contains('群组拆机')").hide();
		        }
				//_linkSelectPlan("#phoneNumListtbody tr",$("#phoneNumListtbody").children(":first-child"));
				//绑定每行合约click事件
				$("#phoneNumListtbody>tr:even").off("click").on("click",function(event){
					var thisTr=this;
					if(1==OrderInfo.order.step&&(!$(thisTr).hasClass("plan_select"))){
						$.confirm("确认","你已重新选择号码，需跳转至上一步，是否确认?",{
							yes:function(){
								_cancel();
								OrderInfo.order.step=0;
								_linkQueryOffer(thisTr);
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
								OrderInfo.order.step=0;
								_linkQueryOffer(thisTr);
							},
							no:function(){
								null;
							}
						});
					}else{
						_linkQueryOffer(this);
					}
					OrderInfo.roleCd = $(thisTr).find("td:eq(0)").attr('roleCd');
					//#1476472初始化老用户使用人信息
					var param = {
						prodInstId : order.prodModify.choosedProdInfo.prodInstId,
						acctNbr : order.prodModify.choosedProdInfo.accNbr,
						prodSpecId : order.prodModify.choosedProdInfo.productId,
						areaId : order.prodModify.choosedProdInfo.areaId
					};
					order.cust.initUserInfos(param);
				});


//				$("#plan2ndDiv tbody tr").each(function(){$(this).off("click").on("click",function(event){
				$("div[id='plan2ndDiv'] tbody tr").each(function(){$(this).off("click").on("click",function(event){
					var this2Tr=this;
					if(1==OrderInfo.order.step&&(!$(this2Tr).hasClass("plan_select2"))){
						$.confirm("确认","你已重新选择号码，需跳转至上一步，是否确认?",{
							yes:function(){
								_cancel();
								OrderInfo.order.step=0;
								order.cust.linkSelectPlan(this2Tr);event.stopPropagation();
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
								OrderInfo.order.step=0;
								order.cust.linkSelectPlan(this2Tr);event.stopPropagation();
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
		if (OrderInfo.menuName == "ZXHYBL"){
			if(OrderInfo.preliminaryInfo.businessType != CONST.BUS_TYPE.STOCK_SINGLE && OrderInfo.preliminaryInfo.businessType != CONST.BUS_TYPE.STOCK_FUSE){
				$.alert("提示","'客户信息核验接口'返回可做业务类型为："+OrderInfo.preliminaryInfo.businessType+",该业务类型不可办理二次业务");
				return;
			}
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
		order.area.chooseAreaTreeCurrent("p_staff_areaId_val","p_staff_areaId",3,"",$("#p_staff_areaId").val().substring(0,3)+"0000");
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
		_iotCustidentidiesTypeCdChoose($("#iot_p_cust_identityCd").children(":first-child"),"p_cust_identityNum");
		_checkAutoCustQry(); //省份甩单，自动定位客户
		//根据身份证开关隐藏读卡按钮
		var menuName = $("#menuName").val();
		OrderInfo.menuName = menuName;
		if(OrderInfo.staff.idType=="OFF" && menuName !="ZXHYBL")
		{
			$("#readCertBtn").hide();
			$("#readCertBtnID").hide();
		}
		// 安全办公开关
		var flagQueryRes = $.callServiceAsJson(contextPath + "/common/queryPortalProperties", {"propertiesKey": "SECURITY_OFFICE_FLAG"});
        _securityOfficeFlag = flagQueryRes.code == 0 ? flagQueryRes.data : "";
        if ("ON" != _securityOfficeFlag) {
        	$("#p_cust_identityCd option[value='bizId']").hide();
        	$("#p_cust_identityCd option[value='bizId']").remove(); // 兼容ie下option隐藏无效
        }
        
        //实名信息采集单信息获取,自动定位客户
    	var cltOrder = $("#cltOrder").val();
    	if(cltOrder == "Y"){
    		$.callServiceAsJson(contextPath + "/order/getCltorderInfo",{}, {
    			"before":function(){
    				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
    			},
    			"always":function(){
    				$.unecOverlay();
    			},
    			"done" : function(response){
    				if (response.code == 0) {
						OrderInfo.cltOrderInfo = response.data.collectionOrderList.collectionOrderInfo;
    					var cltCustList = response.data.collectionOrderList.collectionCustInfos;
    					for(var i = 0; i<cltCustList.length; i++){
    						//产权人
    						if(cltCustList[i].partyRoleCd =='0'){
								OrderInfo.cltCustInfo = cltCustList[i];
    						//使用人
    						}else if(cltCustList[i].partyRoleCd =='1'){
    							cltCustList[i].thisOrderUseNum = 0;//初始化本次订单使用数目为0
								OrderInfo.cltUserList.push(cltCustList[i]);
    						//经办人
    						}else if(cltCustList[i].partyRoleCd =='3'){
								OrderInfo.cltjbrInfo = cltCustList[i];
    						}
    					}
    					
    			    	if(!ec.util.isObj(OrderInfo.cltCustInfo.collectionItemId)||
    			    			!ec.util.isObj(OrderInfo.cltCustInfo.remarks.queryAreaId)||
    			    			!ec.util.isObj(OrderInfo.cltCustInfo.remarks.queryNum)||
    			    			!ec.util.isObj(OrderInfo.cltCustInfo.remarks.queryType)){
    			    		$.alert("错误", "采集单客户信息获取失败，采集单错误，无法继续受理，请重试。");
    						return;
    			    	}
    					
    			    	if(!ec.util.isObj(OrderInfo.cltjbrInfo.collectionItemId)){
    			    		$.alert("错误", "采集单经办人信息获取失败，采集单错误，无法继续受理，请重试。");
    						return;
    			    	}
    			    	
    			    	if(OrderInfo.cltUserList.length<1){
    			    		$.alert("错误", "采集单使用人信息获取失败，采集单错误，无法继续受理，请重试。");
    						return;
    			    	}else{
    			    		var hasEmptyUser = false;
    			    		for(var i = 0; i<OrderInfo.cltUserList.length; i++){
    			    			if(OrderInfo.cltUserList[i].realQuantity<OrderInfo.cltUserList[i].maxQuantity){
    			    				hasEmptyUser = true;
    			    				break;
    			    			}
    			    		}
    			    		if(!hasEmptyUser){
        			    		$.alert("错误", "该采集单使用人已经全部达到期望办理号卡数量，无法继续受理业务。");
        						return;
    			    		}
    			    	}
        				//实名信息采集单受理  
        				OrderInfo.isCltOrder = true;
    					$("#p_cust_areaId").val(OrderInfo.cltCustInfo.remarks.queryAreaId);
    					$("#p_cust_identityCd").val(OrderInfo.cltCustInfo.remarks.queryType);
    					$("#p_cust_identityNum").val(OrderInfo.cltCustInfo.remarks.queryNum);
    					$("#p_cust_areaId_val").val(OrderInfo.cltCustInfo.remarks.queryAreaName);
    					$("#usersearchbtn").click();
    					
    				}else{
    					$.alert("提示",response.data);
    					return;
    				}
    			}
    		});	
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
					response.data='<div style="margin:2px 0 2px 0;width:100%;height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';
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
					response.data='<div style="margin:2px 0 2px 0;width:100%;height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';
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
	var _createCustConfirm = function(inData) {
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
		var identidiesTypeCd = $.trim($("#identidiesTypeCd option:selected").val());
		createCustInfo = {
			cAreaId : OrderInfo.staff.soAreaId,// $("#p_ncust_areaId").val(),
			cAreaName : OrderInfo.staff.soAreaName,
			cPartyTypeCd : $.trim($("#partyTypeCd option:selected").val()), //($.trim($("#partyTypeCd  option:selected").val())==1) ? "1100":"1000",
			cPartyTypeName : ($.trim($("#partyTypeCd option:selected").val())==1) ? "个人客户":"政企客户",
			cIdentidiesTypeCd : identidiesTypeCd,
			cMailAddressStr :$.trim($("#cMailAddressStr").val())
		};
		if ("1" == identidiesTypeCd) {
			createCustInfo.cCustName = _certInfo.custName;
			createCustInfo.cCustIdCard = _certInfo.custIdCard;
			createCustInfo.cAddressStr = _certInfo.addressStr;
			var identityPic = $("#img_custPhoto").data("identityPic");
			if (identityPic != undefined) {
				OrderInfo.boCustIdentities.identidiesPic=identityPic;
			}
		} else {
			createCustInfo.cCustName = $.trim($("#cCustName").val());
			createCustInfo.cCustIdCard = $.trim($("#cCustIdCard").val());
			createCustInfo.cAddressStr = $.trim($("#cAddressStr").val());
			OrderInfo.boCustIdentities.identidiesPic="";
		}

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
	if($("#partyTypeCd").val() == 2){
		if($("#industryClassCdSeThird").val() !=null && $("#industryClassCdSeThird").val() !="" && $("#industryClassCdSeThird").val() !="def"){
			OrderInfo.boCustInfos.industryClassCd = $("#industryClassCdSeThird").val();
		}else if($("#industryClassCdSeSecond").val() !=null && $("#industryClassCdSeSecond").val() !="" && $("#industryClassCdSeSecond").val() !="def"){
			OrderInfo.boCustInfos.industryClassCd = $("#industryClassCdSeSecond").val();
		}else {
			OrderInfo.boCustInfos.industryClassCd = $("#industryClassCdSe").val();
		}
	}
	OrderInfo.boCustInfos.name=createCustInfo.cCustName;//客户名称
	OrderInfo.boCustInfos.areaId=createCustInfo.cAreaId;//客户地区
	OrderInfo.boCustInfos.partyTypeCd=createCustInfo.cPartyTypeCd;//客户类型
	OrderInfo.boCustInfos.defaultIdType=createCustInfo.cIdentidiesTypeCd;//证件类型
	OrderInfo.boCustInfos.addressStr=createCustInfo.cAddressStr;//客户地址
	OrderInfo.boCustInfos.mailAddressStr=createCustInfo.cMailAddressStr;//通信地址
	OrderInfo.boCustIdentities.identidiesTypeCd=createCustInfo.cIdentidiesTypeCd;//证件类型
	OrderInfo.boCustIdentities.identityNum=createCustInfo.cCustIdCard;//证件号码
	OrderInfo.custCreateToken = _certInfo.token;
	//boPartyContactInfo
	OrderInfo.boPartyContactInfo.contactAddress= _boPartyContactInfo.contactAddress;//参与人的联系地址
	OrderInfo.boPartyContactInfo.contactDesc =_boPartyContactInfo.contactDesc;//参与人联系详细信息
	OrderInfo.boPartyContactInfo.contactEmployer  =_boPartyContactInfo.contactEmployer;//参与人的联系单位
	OrderInfo.boPartyContactInfo.contactGender  =_boPartyContactInfo.contactGender;//参与人联系人的性别
	OrderInfo.boPartyContactInfo.contactId =_boPartyContactInfo.contactId;//参与人联系信息的唯一标识
	OrderInfo.boPartyContactInfo.contactName =_boPartyContactInfo.contactName;//参与人的联系人名称
	OrderInfo.boPartyContactInfo.contactType =_boPartyContactInfo.contactType;//联系人类型
	OrderInfo.boPartyContactInfo.eMail =_boPartyContactInfo.eMail;//参与人的eMail地址
	OrderInfo.boPartyContactInfo.fax =_boPartyContactInfo.fax;//传真号
	OrderInfo.boPartyContactInfo.headFlag =_boPartyContactInfo.headFlag;//是否首选联系人
	OrderInfo.boPartyContactInfo.homePhone =_boPartyContactInfo.homePhone;//参与人的家庭联系电话
	OrderInfo.boPartyContactInfo.mobilePhone =_boPartyContactInfo.mobilePhone;//参与人的移动电话号码
	OrderInfo.boPartyContactInfo.officePhone =_boPartyContactInfo.officePhone;//参与人办公室的电话号码
	OrderInfo.boPartyContactInfo.postAddress =_boPartyContactInfo.postAddress;//参与人的邮件地址
	OrderInfo.boPartyContactInfo.postcode =_boPartyContactInfo.postcode;//参与人联系地址的邮政编码
	OrderInfo.boPartyContactInfo.staffId =_boPartyContactInfo.staffId;//员工ID
	OrderInfo.boPartyContactInfo.state =_boPartyContactInfo.state;//状态
	OrderInfo.boPartyContactInfo.statusCd =_boPartyContactInfo.statusCd;//订单状态
	OrderInfo.cust = {
		custId:-1,
		partyName : createCustInfo.cCustName,
		areaId:createCustInfo.cAreaId
	};
	//客户属性
	OrderInfo.boCustProfiles=[];
	OrderInfo.boCustCheckLogs.checkCustCertSwitch = inData.checkCustCertSwitch;
	if(inData.checkCustCertSwitch == "ON"){
		OrderInfo.boCustCheckLogs.checkMethod = inData.checkMethod;
		OrderInfo.boCustCheckLogs.custId = "-1";
		OrderInfo.boCustCheckLogs.objId = "";
		OrderInfo.boCustCheckLogs.checkDate = inData.checkDate;
		OrderInfo.boCustCheckLogs.checker = OrderInfo.staff.staffName;
		OrderInfo.boCustCheckLogs.checkChannel = OrderInfo.staff.channelId;
		OrderInfo.boCustCheckLogs.certCheckResult = inData.certCheckResult;
		OrderInfo.boCustCheckLogs.errorMessage = inData.errorMessage;
		OrderInfo.boCustCheckLogs.staffId = OrderInfo.staff.staffId;
		var realNameChech = {
				partyProfileCatgCd: CONST.BUSI_ORDER_ATTR.REAL_NAME_CHECK,
				profileValue: "1",
	            state: "ADD"
		};
		OrderInfo.boCustProfiles.push(realNameChech);
	}
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
	// 增加证件类型属性节点（因为不方便配置，所有前台直接写死，不由后台配置）
	var partyIdTypeProfiles = {
			partyProfileCatgCd: CONST.BUSI_ORDER_ATTR.orderIdentidiesTypeCd,
			profileValue: $("#custCAttrIdentidiesTypeCd option:selected").val(),
            state: "ADD"
	};
	OrderInfo.boCustProfiles.push(partyIdTypeProfiles);
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
		var identidiesTypeCd = $.trim($("#identidiesTypeCd option:selected").val());
		if (!ec.util.isObj(identidiesTypeCd)) {
			$.alert("提示", "证件类型不能为空！", "information");
			return;
		}
		var areaId=$("#p_cust_areaId").val();
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var custName=$("#p_cust_areaId_val").val();
		var inData = {};
		createCustInfo = {
			cAreaId : areaId,
			cAreaName : custName,
			cPartyTypeCd : $.trim($("#partyTypeCd option:selected").val()),
			cIdentidiesTypeCd : identidiesTypeCd
		};
		if ("1" == identidiesTypeCd) {
			createCustInfo.cCustName = _certInfo.custName;
			createCustInfo.cCustIdCard = _certInfo.custIdCard;
			createCustInfo.cAddressStr = _certInfo.addressStr;
		} else {
			createCustInfo.cCustName = $.trim($("#cCustName").val());
			createCustInfo.cCustIdCard = $.trim($("#cCustIdCard").val());
			createCustInfo.cAddressStr = $.trim($("#cAddressStr").val());
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
		//实名核验 checkCustCert
		var switchResponse = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "CHECK_CUST_CERT_" + createCustInfo.cAreaId.substr(0, 3)});
	    var checkCustCertSwitch = "";
		if (switchResponse.code == "0") {
	    	checkCustCertSwitch = switchResponse.data;
	    }
		if(checkCustCertSwitch == "ON"){
			var inParams = {
					"certType":createCustInfo.cIdentidiesTypeCd,
					"certNum":createCustInfo.cCustIdCard,
					"areaId" : createCustInfo.cAreaId
				};
				var checkUrl=contextPath+"/cust/checkCustCert";
				var checkResponse = $.callServiceAsJson(checkUrl, inParams, {"before":function(){
				}});
				if (checkResponse.code == 0) {
					var result = checkResponse.data.result;
					inData.checkMethod  = result.checkMethod;
					inData.certCheckResult = result.certCheckResult;
					inData.errorMessage = result.errorMessage;
					inData.checkDate = result.checkDate;
					inData.checkCustCertSwitch = checkCustCertSwitch;
				}else{
					$.alertM(checkResponse.data);
					return;
				}
		}
		if(OrderInfo.menuName == "ZXHYBL"){
			if(createCustInfo.cIdentidiesTypeCd!="1"){
				$.alert("错误","办理征信分期合约业务，证件类型必须是身份证。");
				return;
			}
			var idcard = _certInfo.custIdCard;
			var  qryResponse =  _qryPreliminaryInfo(idcard,"");
			if(qryResponse.code == 0){
				if(qryResponse.data.result == null || qryResponse.data.result.userInfo == null || qryResponse.data.result.userInfo.businessType==null){
					$.alert("错误","查询后台 '征信平台初审接口' 未返回结果，查询接口流水号："+qryResponse.data.transactionID);
					return;
				}else{
					var userInfo = qryResponse.data.result.userInfo;
					if(userInfo.businessType != CONST.BUS_TYPE.ADD_SINGLE && userInfo.businessType != CONST.BUS_TYPE.ADD_FUSE && userInfo.businessType != CONST.BUS_TYPE.ADD_OTHER_FUSE){
						$.alert("提示","新建客户只能做新增业务,'征信平台初审接口'返回可做业务类型为："+userInfo.businessType);
						return;
					}
					var areaId = $("#p_cust_areaId").val();
					if(userInfo.cityCode.substr(0,5) != areaId.substr(0,5)){
						$.alert("提示","集约4G系统里用户的受理地区 "+areaId+" 和征信平台初审接口返回 cityCode "+userInfo.cityCode+" 办理业务的城市编码不一致,无法办理征信业务。");
						return;
					}
					if(idcard != userInfo.idcard){
						$.alert("提示","集约4G系统里用户办理用户的证件号码和征信平台初审接口返回的idcard用户身份证号码不一致，无法办理征信业务。");
						return;
					}
					OrderInfo.preliminaryInfo = userInfo;
				};
			}else{
				$.alertM(qryResponse.data);
				return;
			};
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
					_createCustConfirm(inData);
				},
				no:function(){

				}
			});
		}else{
			$.unecOverlay();
			_createCustConfirm(inData);
		}

		//表示新建客户是身份证，保存信息用户身份证预约号码比对
		if($.trim($("#identidiesTypeCd option:selected").val()) == 1){
			var param = {
					"identityNum":_certInfo.custIdCard,
					"areaId" : OrderInfo.getAreaId(),
				    "flag":"1"
			};
			order.cust.custQueryParam = param;
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
		if($("#"+identityCdId).val()!=-1 && $("#"+identityCdId).val()!="cloudId"){
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
	var _showReadCert = function (man, id, parentId) {
		$("#td_cust_name").text(man.resultContent.partyName);
		$("#td_cust_idCard").text(man.resultContent.certNumber);
		if (man.resultContent.identityPic != undefined) {
			$("#img_cust_photo").attr("src", "data:image/jpeg;base64," + man.resultContent.identityPic);
			$("#tr_cust_photo").show();
		}
		$("#td_address_str").text(man.resultContent.certAddress);
		//easyDialog.open({
		//	container : 'user_info',
		//	callback : function() {
		//		$("#td_cust_name").text("");
		//		$("#td_cust_idCard").text("");
		//		$("#img_cust_photo").attr("src", "");
		//		$("#tr_cust_photo").hide();
		//		$("#td_address_str").text("");
		//		$("#" + id).click();
		//	}
		//});
		$.alertW("身份证信息展示",$("#user_info2").html(),"",function(){
			if (ec.util.isObj(parentId)) {
				$(parentId).find("#" + id).click();
			} else {
				$("#" + id).click();
			}
		},400);
	};
	//定位客户时读卡
	var _readCert = function() {
		var man = cert.readCert(CONST.CERT_READER_QUERY_CUST);
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
				//版本需要更新特殊处理 不需要提示errorMsg
				return ;
			}
			$.alert("提示", man.errorMsg);
			return;
		}
		$('#p_cust_identityCd').val(1);//身份证类型
		_custidentidiesTypeCdChoose($("#p_cust_identityCd option:selected"),"p_cust_identityNum");
		$('#p_cust_identityNum').val(man.resultContent.certNumber);
		_showReadCert(man, "usersearchbtn");
//		$('#p_cust_identityNum').attr("disabled",true);
		//查询
//		$("#usersearchbtn").click();
	};
	var _submitCertInfo = function(certInfo) {
		_certInfo = {
			custName : certInfo.partyName,
			custIdCard : certInfo.certNumber,
			addressStr : certInfo.certAddress,
			token : certInfo.signature
		};
	};
	//新建客户时读卡
	var _readCertWhenCreate = function() {
		$('#td_custIdCard').data("flag", "1");
		$inputFlag = $("<input type='hidden' id='createFlag' value='1'/>");
		$("#createUserbtn").append($inputFlag);
		var man = cert.readCert(CONST.CERT_READER_CREATE_CUST);
		$("#createFlag").remove();
		//var man=cert.test();
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
					//版本需要更新特殊处理 不需要提示errorMsg
					return ;
			}
			$.alert("提示", man.errorMsg);
			return;
		}

		_setValueForNewCust(man.resultContent);
	};

	var _setValueForNewCust = function(data){
		$('#partyTypeCd').val(1);//个人
		_partyTypeCdChoose($("#partyTypeCd option:selected"),"identidiesTypeCd");
		$('#identidiesTypeCd').val(1);//身份证类型
		_identidiesTypeCdChoose($("#identidiesTypeCd option:selected"),"cCustIdCard");
		$('#td_custIdCard').data("flag", "1");
		$('#td_custName').text(data.partyName);//姓名
		$('#td_custIdCard').text(data.certNumber);//设置身份证号
		if (undefined != data.identityPic) {
			$("#img_custPhoto").attr("src", "data:image/jpeg;base64," + data.identityPic);
			$("#img_custPhoto").data("identityPic", data.identityPic);
			$("#tr_custPhoto").show();
		}
		$('#td_addressStr').text(data.certAddress);//地址
		if(OrderInfo.menuName!=null && OrderInfo.menuName == "ZXHYBL"){
			$("#identidiesTypeCd").attr("disabled","disabled"); 
		}
		_submitCertInfo(data);
	};

	//用户鉴权时读卡
	var _readCertWhenAuth = function() {
		var man = cert.readCert(CONST.CERT_READER_AUTH_CUST);
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
					//版本需要更新特殊处理 不需要提示errorMsg
					return ;
			}
			$.alert("提示", man.errorMsg);
			return;
		}

		$('#authIDTD').val(man.resultContent.certNumber);
//		$('#authIDTD').attr("disabled",true);
		_showReadCert(man, "custAuthbtnID");
//		$("#custAuthbtnID").click();
	};

	//用户鉴权时读卡二次业务
	var _readCertWhenAuth2 = function (level, id) {
		var parentId = "";
		var servCode="";
		if (level == "1") {
			parentId = "#auth3";//客户定位鉴权弹出窗口id
			servCode=CONST.CERT_READER_AUTH_CUSTOMER;
		} else if (level == "2") {
			parentId = "#auth2";//二次业务鉴权弹出窗口id
			servCode=CONST.CERT_READER_SECOND_BUSI_AUTH;
		}
		var man = cert.readCert(servCode);
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
					//版本需要更新特殊处理 不需要提示errorMsg
				return ;
			}
			$.alert("提示", man.errorMsg);
			return;
		}

		$(parentId).find("#idCardNumber"+id).val(man.resultContent.certNumber);
		_showReadCert(man, "custAuthbtn" + id, parentId);
	};

//	// 填单页面经办人读卡
//	var _readCertWhenOrder = function() {
//		var man = cert.readCert();
//		if (man.resultFlag != 0){
//			$.alert("提示", man.errorMsg);
//			return;
//		}
//
//		_setValueForAgentOrderSpan(man.resultContent);
//	};

	var _setValueForAgentOrderSpan = function(data){
		// 设置隐藏域的表单数据
		$('#orderAttrName').val(data.partyName);//姓名
		$('#orderAttrIdCard').val(data.certNumber);//设置身份证号
		$('#orderAttrAddr').val(data.certAddress);//地址
		// 设置文本显示
		$("#li_order_attr span").text(data.partyName);
		$("#li_order_remark2 span").text(data.certNumber);
		$("#li_order_remark3 span").text(data.certAddress);
	};

	// 新建客户经办人读卡
	var _readCertWhenCustCAttr = function() {
		var servCode="经办人";
		man = cert.readCert(servCode);
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
					//版本需要更新特殊处理 不需要提示errorMsg
				return ;
			}
			$.alert("提示", man.errorMsg);
			return;
		}
		_setValueForAgentSpan(man.resultContent);
	};

	// 设置经办人隐藏、展示域
	var _setValueForAgentSpan = function(data){

		// 设置隐藏域的表单数据
		$('#' + CONST.BUSI_ORDER_ATTR.orderAttrName).val(data.partyName);//姓名
		$('#' + CONST.BUSI_ORDER_ATTR.orderAttrIdCard).val(data.certNumber);//设置身份证号
		$('#' + CONST.BUSI_ORDER_ATTR.orderAttrAddr).val(data.certAddress);//地址
		// 设置文本显示
		$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrName + "']").text(data.partyName);
		$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrIdCard + "']").text(data.certNumber);
		$("span[name='" + CONST.BUSI_ORDER_ATTR.orderAttrAddr + "']").text(data.certAddress);
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
			diffPlace=$("#diffPlaceFlag_choose").val();
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
					if(response.data.indexOf("false") ==0) {
						$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
						return;
					}

					order.cust.jumpAuthflag = $(response.data).find('#jumpAuthflag').val();
					var custInfoSize = $(response.data).find('#custInfoSize').val();
					// 使用人定位时，存在多客户的情况
					if (custInfoSize == 1) {
						order.cust.showCustAuth($(response.data).find('#custInfos'));
					} else if (custInfoSize > 1) {
						$("#choose_multiple_user_dialog").html(response.data);
						easyDialog.open({
							container: 'choose_multiple_user_dialog',
							callback: function () {
							}
						});
					}
					$(".userclose").off("click").on("click",function(event) {
						try {
							easyDialog.close();
						} catch (e) {
							$('#choose_multiple_user_dialog').hide();
							$('#overlay').hide();
						}
						authFlag="";
						$(".usersearchcon").hide();
					});
					if($("#custListTable").attr("custInfoSize")=="1"){
						$(".usersearchcon").hide();
					}
				},
				"fail":function(response){
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				}
			});
		}).ketchup({bindElement:"userSearchForChooseBtn"});
	};

	//多客户分页查询，后台服务不支持分页，故使用假分页（一次查询分次展示）
	var _queryCustByPageIndex = function(pageIndex){
		pageIndex = parseInt(pageIndex);
		if(pageIndex <= 0 || isNaN(pageIndex)){
			return;
		}
		var pageSize = parseInt($('#ec-pagination').attr('pageSize'));
		var totalSize = $('#custListTable tbody tr').length;
		var totalPage = totalSize % pageSize == 0 ? totalSize/pageSize : parseInt(totalSize/pageSize) + 1;
		if(pageIndex > totalPage){
			$.alert('提示', '页码超出最大值');
			return;
		}

		$('#custListTable tbody tr').hide();
		$('#ec-page-no').html(pageIndex);

		if(pageIndex == 1){
			$('#custListTable tbody tr:lt('+pageSize*pageIndex+')').show();
			$('#ec-page-prevs').removeClass('pageUpOrange').removeAttr('page').addClass('pageUpGray');
		} else {
			$('#custListTable tbody tr:lt('+pageSize*pageIndex+'):gt('+(pageSize*(pageIndex-1)-1)+')').show();
			$('#ec-page-prevs').addClass('pageUpOrange').attr('page', pageIndex-1).removeClass('pageUpGray');
		}
		if(pageIndex == totalPage){
			$('#ec-page-next').removeClass('nextPageGrayOrange').removeAttr('page').addClass('nextPageGray');
		} else {
			$('#ec-page-next').addClass('nextPageGrayOrange').attr('page', pageIndex+1).removeClass('nextPageGray');
		}

		$("a[id^='ec-page-'],span[id^='ec-page-']").off("click.page");

		$("a[id^='ec-page-'][page],span[id^='ec-page-'][page]").each(function(){
			$(this).on("click.page",function(){order.cust.queryCustByPageIndex($(this).attr("page"));});
		});
	};

	//实名制校验
	var _realCheck = function (context, scope) {
		var canRealName = "";
		// 使用人实名制从#custInfos节点获取不准确
		if (ec.util.isObj(scope)) {
			canRealName = $(scope).attr('canrealname');
		} else {
			canRealName = $('#custInfos').parent().children('[selected="selected"]').attr('canrealname');
		}
		if (ec.util.isObj(canRealName) && 1 != canRealName) {
			$.alert("提示", "当前为非实名制客户，请先沟通营业员进行资料补登。","confirmation", function () {
				var url = window.location.protocol + '//' + window.location.host + context + "/main/home";
				window.location = url;
			});
		}
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


	//多种鉴权方式的tab页切换
	var _changeTab = function (id,tabId) {
		$.each($("#"+id+" #auth_tab"+tabId).parent().find("li"),function(){
			$(this).removeClass("setcon");
		});
		$("#"+id+" #auth_tab"+tabId).addClass("setcon");
		$.each($("#"+id+" #contents div"),function(){
			$(this).hide();
		});
		$("#"+id+" #content"+tabId).show();
		if (tabId == 2 && _choosedCustInfo.identityCd != "1") {
			if (_isSelfChannel()) {
				$("#" + id + " #idCardNumber2").removeAttr("disabled");
			} else {
				$("#" + id + " #idCardNumber2").attr("disabled", "disabled");
				$.alert("提示", "请到电信自有营业厅办理业务！");
			}
		}
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

	//短信发送
	var _smsResend = function (level) {
		var accNbr = "";
		if (level == "1") {
			$("#auth3").find("#smspwd2").val("");
			accNbr = _choosedCustInfo.accNbr;
			if(-1==$("#p_cust_identityCd").val()){
				accNbr=$.trim($("#p_cust_identityNum").val());
			}
		} else if (level == "2") {
			$("#auth2").find("#smspwd2").val("");
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
						$("#num .txtnum").attr("value",response.data.randomCode);
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
		var smspwd2 = "";
		if (level == "1") {
			smspwd2 = $("#auth3").find("#smspwd2").val();
		} else if (level == "2") {
			smspwd2 = $("#auth2").find("#smspwd2").val();
		}
		var params = "smspwd=" + smspwd2+"&number="+_choosedCustInfo.accNbr;
		if (!ec.util.isObj(smspwd2)) {
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
					OrderInfo.authRecord.validateType="2";
					OrderInfo.authRecord.resultCode="0";
					if (level == "1") {
						var param = _choosedCustInfo;
						param.authFlag="1";
						OrderInfo.cust_validateType = "2";//保存鉴权方式
						OrderInfo.cust_validateNum = _choosedCustInfo.accNbr;//保存鉴权号码
                        var paramsms = $.extend(true, {}, param);
                        paramsms.smspwd = smspwd2;
                        paramsms.number = _choosedCustInfo.accNbr;
						$.callServiceAsHtml(contextPath+"/cust/custAuth",paramsms,{
							"before":function(){
								$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
							},"done" : function(response){
								if(response.code != 0) {
									$.alert("提示","客户鉴权失败,稍后重试");
									return;
								}
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
					} else {
						try{
							easyDialog.close();
						}catch(e){
							$("#auth2").hide();
							$("#overlay").hide();
						}
					}
					_saveAuthRecordSuccess(recordParam);
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

	//客户鉴权--产品密码
	var _productPwdAuth=function(level){
		var authPassword2 = "";
		if (level == "1") {
			authPassword2 = $("#auth3").find("#authPassword2").val();
		} else if (level == "2") {
			authPassword2 = $("#auth2").find("#authPassword2").val();
		}
		var param = _choosedCustInfo;
		param.prodPwd = $.trim(authPassword2);
		if(!ec.util.isObj(param.prodPwd)){
			$.alert("提示","产品密码不能为空！");
			return;
		}
		param.validateType = "3";
		param.accessNumber=_choosedCustInfo.accNbr;
		param.authFlag=authFlag;

		var recordParam={};
		recordParam.validateType="3";
		recordParam.validateLevel=level;
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accessNumber;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
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
				if(!order.cust.queryForChooseUser){
					custInfo = param;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;

					OrderInfo.cust = _choosedCustInfo;
					OrderInfo.authRecord.validateType="3";
					OrderInfo.authRecord.resultCode="0";
					if (level == "1") {
						OrderInfo.cust_validateType = "3";//保存鉴权方式
						OrderInfo.cust_validateNum = _choosedCustInfo.accNbr;//保存鉴权号码
						_custAuthCallBack(response);
					} else {
						try{
							easyDialog.close();
						}catch(e){
							$("#auth2").hide();
							$("#overlay").hide();
						}
					}
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

	/**
	 * 客户鉴权--证件类型
	 * @param level 鉴权级别，1客户，2用户
	 * @param id 鉴权tab页的id号，以便获取到对应tab页上的证件号码
	 * @private
	 */
	var _identityTypeAuth=function(level,id){
		//根据鉴权级别设置对应的鉴权窗口父级id
		var parentId = "";
		if (level == "1") {
			parentId = "#auth3";//客户定位鉴权弹出窗口id
		} else if (level == "2") {
			parentId = "#auth2";//二次业务鉴权弹出窗口id
		}
		//获取证件类型鉴权的证件号码
		var idCardNumber = $(parentId).find("#idCardNumber" + id).val();
		if (("1" == id && _choosedCustInfo.identityCd != "1") || ("7" == id && _choosedCustInfo.userIdentityCd != "1")) {
			if (_isSelfChannel()) {
				$(parentId).find("#idCardNumber" + id).removeAttr("disabled");
			} else {
				$(parentId).find("#idCardNumber" + id).attr("disabled", "disabled");
				$.alert("提示", "请到电信自有营业厅办理业务！");
				return;
			}
		}
		var param = $.extend(true, {}, _choosedCustInfo);
		if(CacheData.isGov(_choosedCustInfo.identityCd)){
			param.ifOrgUseCust = "Y";
		}
		param.validateType = getAuthType(id, param.isSame);
		param.identityNum = base64encode(utf16to8(idCardNumber));
		if (!ec.util.isObj(param.identityNum)) {
			$.alert("提示", "证件号码不能为空！");
			return;
		}
		param.accessNumber=_choosedCustInfo.accNbr;
		param.authFlag=authFlag;

		if (!(id=="2"||id=="6")) {
			param.custId = param.userCustId;
			param.identityCd = param.userIdentityCd;
		}

		var recordParam={};
		recordParam.validateType=getAuthType(id, param.isSame);
		recordParam.validateLevel=level;
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accessNumber;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;

		$.callServiceAsHtml(contextPath+"/cust/custAuth",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					_saveAuthRecordFail(recordParam);
					return;
				}
				//判断能否转为json，可以的话返回的就是错误信息
				try {
					var errorData = $.parseJSON(response.data);
					if(ec.util.isObj(errorData.custAuthInfo)){
						$.alert("提示",errorData.custAuthInfo);
						return;
					}
					if (ec.util.isObj(errorData) && errorData == false) {
						$.alert("提示", "鉴权失败！");
					} else {
						$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack, "error");
					}
					_saveAuthRecordFail(recordParam);
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
					OrderInfo.authRecord.validateType = getAuthType(id, param.isSame);
					OrderInfo.authRecord.resultCode="0";
					if (level == "1") {
						OrderInfo.cust_validateType = getAuthType(id, param.isSame);//保存鉴权方式
						_custAuthCallBack(response);
					} else {
						try{
							easyDialog.close();
						}catch(e){
							$("#auth2").hide();
							$("#overlay").hide();
						}
					}
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

	/**
	 * 客户鉴权--证件类型（单位证件+使用人证件混合鉴权）
	 * @param level 鉴权级别，1客户，2用户
	 * @param id 鉴权tab页的id号，以便获取到对应tab页上的证件号码
	 * @private
	 */
	var _multiIdentityTypeAuth=function(level,id){
		var firstAuth = false;//第一次鉴权是否成功，默认为不成功
		var firstRecordId = "";
		//根据鉴权级别设置对应的鉴权窗口父级id
		var parentId = "";
		if (level == "1") {
			parentId = "#auth3";//客户定位鉴权弹出窗口id
		} else if (level == "2") {
			parentId = "#auth2";//二次业务鉴权弹出窗口id
		}

		var idCardNumberUnit5 = $(parentId).find("#idCardNumberUnit" + id).val();//单位证件
		var idCardNumber = $(parentId).find("#idCardNumber" + id).val();//使用人证件
		if (!ec.util.isObj(idCardNumberUnit5)) {
			$.alert("提示", "单位证件号码不能为空！");
			return;
		}
		if (!ec.util.isObj(idCardNumber)) {
			$.alert("提示", "使用人证件号码不能为空！");
			return;
		}

		if (_choosedCustInfo.userIdentityCd != "1") {
			if (_isSelfChannel()) {
				$(parentId).find("#idCardNumber" + id).removeAttr("disabled");
			} else {
				$(parentId).find("#idCardNumber" + id).attr("disabled", "disabled");
				$.alert("提示", "请到电信自有营业厅办理业务！");
				return;
			}
		}
		var param1 = $.extend(true, {}, _choosedCustInfo);
		if (CacheData.isGov(_choosedCustInfo.identityCd)) {
			param1.ifOrgUseCust = "Y";
		}
		param1.validateType = getAuthType(id, param1.isSame);
		param1.identityNum = base64encode(utf16to8(idCardNumberUnit5));//首先进行单位证件鉴权

		param1.accessNumber=_choosedCustInfo.accNbr;
		param1.authFlag=authFlag;

		//鉴权日志记录参数封装
		var recordParam={};
		recordParam.validateType=getAuthType(id, param1.isSame);
		recordParam.validateLevel=level;
		recordParam.accessNbr = param1.accessNumber;
		recordParam.custId = param1.custId;
		recordParam.certType = param1.identityCd;
		recordParam.certNumber = param1.identityNum;

		$.callServiceAsHtml(contextPath+"/cust/custAuth",param1,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					_saveAuthRecordFail(recordParam);
					return;
				}
				//判断能否转为json，可以的话返回的就是错误信息
				try {
					var errorData = $.parseJSON(response.data);
					if (ec.util.isObj(errorData) && errorData == false) {
						$.alert("提示", "鉴权失败！");
					} else {
						$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack, "error");
					}
					_saveAuthRecordFail(recordParam);
					return;
				} catch(e){
				}
				_saveAuthRecordSuccess(recordParam);
				firstAuth = true;//设置第一次鉴权成功标识
				firstRecordId = CacheData.getRecordId();
			},"always":function(){
				$.unecOverlay();
			}
		});

		var param2 = $.extend(true, {}, _choosedCustInfo);
		if (CacheData.isGov(_choosedCustInfo.identityCd)) {
			param2.ifOrgUseCust = "Y";
		}
		param2.validateType = getAuthType(id, param2.isSame);
		param2.identityNum = base64encode(utf16to8(idCardNumber));//单位证件鉴权成功后再进行使用人证件鉴权
		param2.accessNumber=_choosedCustInfo.accNbr;
		param2.authFlag=authFlag;
		param2.custId = param2.userCustId;
		param2.identityCd = param2.userIdentityCd;

		//鉴权日志记录参数封装
		var recordParam={};
		recordParam.validateType=getAuthType(id, param2.isSame);
		recordParam.validateLevel=level;
		recordParam.accessNbr = param2.accessNumber;
		recordParam.custId = param2.custId;
		recordParam.certType = param2.identityCd;
		recordParam.certNumber = param2.identityNum;


		$.callServiceAsHtml(contextPath+"/cust/custAuth",param2,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					_saveAuthRecordFail(recordParam);
					return;
				}
				//判断能否转为json，可以的话返回的就是错误信息
				try {
					var errorData = $.parseJSON(response.data);
					if (ec.util.isObj(errorData) && errorData == false) {
						$.alert("提示", "鉴权失败！");
					} else {
						$.alertMore("异常信息", errorData.resultMsg, errorData.errorStack, "error");
					}
					_saveAuthRecordFail(recordParam);
					return;
				} catch(e){
				}
				if(!order.cust.queryForChooseUser){
					custInfo = param2;
					OrderInfo.boCusts.prodId=-1;
					OrderInfo.boCusts.partyId=_choosedCustInfo.custId;
					OrderInfo.boCusts.partyProductRelaRoleCd="0";
					OrderInfo.boCusts.state="ADD";
					OrderInfo.boCusts.norTaxPayer=_choosedCustInfo.norTaxPayer;

					OrderInfo.cust = _choosedCustInfo;
					OrderInfo.authRecord.validateType = getAuthType(id, param2.isSame);
					OrderInfo.authRecord.resultCode="0";
					if (level == "1") {
						OrderInfo.cust_validateType = getAuthType(id, param2.isSame);//保存鉴权方式
						_custAuthCallBack(response);
					} else {
						try{
							easyDialog.close();
						}catch(e){
							$("#auth2").hide();
							$("#overlay").hide();
						}
					}
				} else {
					//鉴权成功后显示选择使用人弹出框
					order.main.showChooseUserDialog(param2);
				}
				_saveAuthRecordSuccess(recordParam);
				CacheData.setRecordId(firstRecordId + "," + CacheData.getRecordId());
			},"always":function(){
				$.unecOverlay();
			}
		});
	};

	//跳过鉴权--二次业务
	var _jumpAuth2 = function() {
		var param = _choosedCustInfo;
		var recordParam={};
		recordParam.validateType="4";
		recordParam.validateLevel="2";
		recordParam.custId=param.custId;
		recordParam.accessNbr=param.accessNumber;
		recordParam.certType=param.identityCd;
		recordParam.certNumber=param.idCardNumber;
		OrderInfo.authRecord.resultCode = "0";
		try{
			easyDialog.close();
		}catch(e){
			$("#auth2").hide();
			$("#overlay").hide();
		}
		_saveAuthRecordSuccess(recordParam);
	};

	//返回是否是自营渠道
	var _isSelfChannel = function () {
		var isSelfChannel = false;
		if (OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.ZQZXDL || OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.GZZXDL
			|| OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.HYKHZXDL || OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.SYKHZXDL
			|| OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.XYKHZXDL || OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.GZZXJL
			|| OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.ZYOUT || OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.ZYINGT
			|| OrderInfo.staff.channelType == CONST.CHANNEL_TYPE_CD.WBT) {
			isSelfChannel = true;
		}
		return isSelfChannel;
	};

	// 填单页面经办人读卡
	var _readCertWhenOrder = function() {
		man = cert.readCert(CONST.CERT_READER_HANDLE_CUST);
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
					//版本需要更新特殊处理 不需要提示errorMsg
					return ;
			}
			$.alert("提示", man.errorMsg);
			return;
		}
		_setValueForAgentOrderSpan(man.resultContent);
		if (CONST.realNamePhotoFlag == "ON") {
		    if (undefined != man.resultContent.identityPic && null != man.resultContent.identityPic && "" != man.resultContent.identityPic) {
	      		$("#img_Cert").attr("src", "data:image/jpeg;base64," + man.resultContent.identityPic);
	      		OrderInfo.bojbrCustIdentities.identidiesPic = man.resultContent.identityPic;
	      		if(OrderInfo.actionFlag == 45){
		      		OrderInfo.bojbrCustIdentities.addressStr = man.resultContent.certAddress;
		      		OrderInfo.bojbrCustIdentities.name = man.resultContent.partyName;
		      		OrderInfo.bojbrCustIdentities.identityNum = man.resultContent.certNumber;
	      		}
	      		_showCertPicture();
			} else{
				$.alert("错误", "当前经办人身份证照片为空，无法继续受理，请确认。");
				return;
			}
		}
	};

	//准备加载拍照弹窗
	 var _showCertPicture = function(){
		 var orderAttrName = $.trim($("#orderAttrName").val()); //经办人姓名
		 var orderAttrIdCard = $.trim($("#orderAttrIdCard").val()); //证件号码
		 var orderAttrAddr = $.trim($("#orderAttrAddr").val()); //地址

		 if(!(ec.util.isObj(orderAttrName) && ec.util.isObj(orderAttrIdCard) && ec.util.isObj(orderAttrAddr))){
			$.alert("提示","您填写的经办人信息不完整，姓名、地址、证件号必填。");
			return false;
		}

		var areaId = order.prodModify.choosedProdInfo.areaId;
		areaId = ec.util.isObj(areaId) ? areaId : OrderInfo.cust.areaId;
		areaId = ec.util.isObj(areaId) ? areaId : $("#p_cust_areaId").val();
		var identityNum = $.trim($("#orderAttrIdCard").val());
		var identityCd = $("#orderIdentidiesTypeCd").val();
		//lte进行受理地区市级验证
		if(CONST.getAppDesc() == 0 && String(areaId).indexOf("0000") > 0){
			var alertMsg = ec.util.isObj(OrderInfo.cust.name) ? "客户【" + OrderInfo.cust.name + "】的归属地区" : "您所选择的受理地区";
			$.alert("提示", alertMsg + "为省级地区，无法定位查询经办人。");
			return;
		}

		var param = {
			"areaId" 			:areaId,
			"acctNbr"			:"",
			"partyName"			:"",
			"diffPlace"			:$("#DiffPlaceFlag").val(),
			"queryType" 		:"",
			"queryFlag"			:"queryHandleCust",
			"identityCd"		:identityCd,
			"identityNum"		:identityNum,
			"custQueryType"		:"",
			"queryTypeValue"	:"",
			"identidies_type"	:$("#orderIdentidiesTypeCd  option:selected").text()
		};
		$.callServiceAsJson(contextPath + "/cust/queryoffercust", param, {
			"before" : function() {
				$.ecOverlay("<strong>正在查询经办人信息, 请稍等...</strong>");
			},
			"done" : function(response) {
				if(response.code == 0 && response.data){
					//新建需要,实名制核验
                    if(!ec.util.isArray(response.data.custInfos)){
						var switchResponse = query.common.queryPropertiesValue("CHECK_CUST_CERT_" + areaId.substr(0, 3));
				    	OrderInfo.bojbrCustCheckLogs.checkCustCertSwitch = switchResponse;
						if(switchResponse == "ON"){
							var inParams = {
									"certType":identityCd,
									"certNum":identityNum,
									"areaId" : areaId
							};
							var checkUrl=contextPath+"/cust/checkCustCert";
							var checkResponse = $.callServiceAsJson(checkUrl, inParams, {"before":function(){
							}});
							if (checkResponse.code == 0) {
								var result = checkResponse.data.result;
								OrderInfo.bojbrCustCheckLogs.checkMethod = result.checkMethod;
								OrderInfo.bojbrCustCheckLogs.objId = "";
								OrderInfo.bojbrCustCheckLogs.checkDate = result.checkDate;
								OrderInfo.bojbrCustCheckLogs.checker = OrderInfo.staff.staffName;
								OrderInfo.bojbrCustCheckLogs.checkChannel = OrderInfo.staff.channelId;
								OrderInfo.bojbrCustCheckLogs.certCheckResult = result.certCheckResult;
								OrderInfo.bojbrCustCheckLogs.errorMessage = result.errorMessage;
								OrderInfo.bojbrCustCheckLogs.staffId = OrderInfo.staff.staffId;
							}else{
								$.alertM(checkResponse.data);
								return;
							};
						};
					};
                    _getResponseResult(response, identityNum);// 开始处理经办人信息
                    //采集单受理不拍照
        			if(!OrderInfo.isCltNewOrder()) {
                    	_showCameraView();// 加载拍照弹窗
        			}

				}else if(response.code == 1 && response.data){
					$.alert("错误", "查询经办人信息失败，错误原因：" + response.data);
				}else if(response.code == -2 && response.data){
					$.alertM(response.data);
				}else{
					$.alert("错误", "查询经办人信息发生未知异常，请稍后重试。错误信息：" + response.data);
				}
			},
			"fail" : function(response) {
				$.alert("错误","查询经办人信息发生未知异常：" + response.data);
			},
			"always" : function() {
				$.unecOverlay();
			}
		});
	};

	//处理经办人查询结果
	var _getResponseResult = function(response, identityNum){
		//经办人信息填写模块信息保护优化
		 _disableHandleCustInfos();
		//判断新老用户封装用户信息
		if(ec.util.isArray(response.data.custInfos)){
			OrderInfo.ifCreateHandleCust = false;//不需要新建经办人
			var custInfo = response.data.custInfos[0];//默认取第一个节点，针对经办人查询，Java端也只会返回一个
			OrderInfo.handleCustId 					  = custInfo.custId;//经办人客户ID
			OrderInfo.bojbrCustInfos.name 			  = custInfo.partyName;
			OrderInfo.bojbrCustInfos.addressStr		  = custInfo.addressStr;
			OrderInfo.bojbrCustIdentities.identityNum = custInfo.idCardNumber;
			_setValueForAgentOrderSpan({//页面展示客户脱敏信息
				"partyName"		:custInfo.partyName,
				"certAddress"	:custInfo.addressStr,
				"certNumber"	:custInfo.idCardNumber
			});
			//异地补换卡特殊，无论新老客户，默认对漫游省下新建经办人节点
			if((OrderInfo.actionFlag == 23 && OrderInfo.busitypeflag == 13)) {
				//若同省异市，且为老客户，则不新建经办人；跨省则对漫游省新建经办人
				if(String(OrderInfo.staff.areaId).substring(0,3) != String(OrderInfo.cust.areaId).substring(0,3)){
					_fillupHandleCustInfos(custInfo);
				}
			}
			//填充读卡信息
			if (custInfo.identityCd == 1) {
				OrderInfo.fillupPartyId2CertReaderCustInfos(identityNum, custInfo.custId);
			};
		} else{
			//实名信息采集单受理自动新建
			if(OrderInfo.isCltNewOrder()) {
				_yes2Continue();//继续受理
			}else{
				var orderAttrName = $.trim($("#orderAttrName").val());
				$.confirm("确认","没有查询到【" + orderAttrName + "】客户信息，系统将自动创建经办人客户，是否确认继续受理？", {
					yes:function(){
						_yes2Continue();//继续受理
					},
					no:function(){
						_removeDisabled();//去除经办人被置灰的限制
						_close();//关闭摄像头及拍照弹框
						return;
					}
				});
			}
		}
	};

	//经办人为新客户，此时会新建客户，用户确认并继续受理
	var _yes2Continue = function(){
		_fillupHandleCustInfosCommon({
			"name"				:$.trim($("#orderAttrName").val()),
			"telNumber"			:$.trim($("#orderAttrPhoneNbr").val()),
			"addressStr"		:$.trim($("#orderAttrAddr").val()),
			"partyTypeCd"		:$.trim($("#orderPartyTypeCd").val()),
			"mailAddressStr"	:$.trim($("#orderAttrAddr").val()),
			"defaultIdTycre"	:$.trim($("#orderIdentidiesTypeCd").val()),
			"identidiesTypeCd"	:$.trim($("#orderIdentidiesTypeCd").val()),
			"identityNum"		:$.trim($("#orderAttrIdCard").val()),
			"contactName"		:$.trim($("#orderAttrName").val()),
			"mobilePhone"		:$.trim($("#orderAttrPhoneNbr").val()),
			"contactAddress"	:$.trim($("#orderAttrAddr").val())
		});
	};

	//往订单信息中填充经办人信息，除异地补换卡业务外通用
	var _fillupHandleCustInfosCommon = function(handleCustInfo){
		OrderInfo.handleCustId = "";
		OrderInfo.ifCreateHandleCust = true;//需要新建经办人
		//1.经办人客户信息
		OrderInfo.bojbrCustInfos.name			= handleCustInfo.name;			//客户名称
		OrderInfo.bojbrCustInfos.areaId			= OrderInfo.getAreaId();		//客户地区
		OrderInfo.bojbrCustInfos.telNumber		= handleCustInfo.telNumber;		//联系电话
		OrderInfo.bojbrCustInfos.addressStr		= handleCustInfo.addressStr;	//证件地址
		OrderInfo.bojbrCustInfos.partyTypeCd	= handleCustInfo.partyTypeCd;	//客户类型
		OrderInfo.bojbrCustInfos.mailAddressStr	= handleCustInfo.mailAddressStr;//通信地址
		OrderInfo.bojbrCustInfos.defaultIdTycre	= handleCustInfo.defaultIdTycre;//证件类型
		//2.经办人证件信息
		OrderInfo.bojbrCustIdentities.identidiesTypeCd	= handleCustInfo.identidiesTypeCd;	//证件类型
		OrderInfo.bojbrCustIdentities.identityNum 		= handleCustInfo.identityNum;		//证件号码
		//3.若用户有填写经办人联系号码，则新建经办人时添加联系人信息，否则不添加联系人信息
		if(ec.util.isObj(OrderInfo.bojbrCustInfos.telNumber)){
			OrderInfo.bojbrPartyContactInfo.staffId 		= OrderInfo.staff.staffId;
			OrderInfo.bojbrPartyContactInfo.contactName 	= handleCustInfo.contactName;
			OrderInfo.bojbrPartyContactInfo.mobilePhone 	= handleCustInfo.mobilePhone;
			OrderInfo.bojbrPartyContactInfo.contactAddress 	= handleCustInfo.contactAddress;
			//根据身份证判断性别，无从判别默认为男
			if(OrderInfo.bojbrCustIdentities.identidiesTypeCd == "1"){
				var identityNum = String(OrderInfo.bojbrCustIdentities.identityNum);
				identityNum = parseInt(identityNum.substring(16,17));//取身份证第17位判断性别，奇数男，偶数女
				OrderInfo.bojbrPartyContactInfo.contactGender = (identityNum % 2) == 0 ? "2" : "1";//1男2女
			} else{
				OrderInfo.bojbrPartyContactInfo.contactGender = "1";//性别，默认为男
			}
		}
	};

	//往订单信息中填充经办人信息，针对异地补换卡特殊处理，其他业务不可用
	var _fillupHandleCustInfos = function(handleCustInfo){
		OrderInfo.handleCust 		= handleCustInfo;//经办人客户信息
		OrderInfo.handleCustId		= handleCustInfo.custId;//经办人客户ID
		OrderInfo.ifCreateHandleCust= true;//需要新建经办人
		//1.经办人客户信息
		OrderInfo.bojbrCustInfos.name			= handleCustInfo.partyName;				//客户名称
		OrderInfo.bojbrCustInfos.areaId			= OrderInfo.getAreaId();				//客户地区
		OrderInfo.bojbrCustInfos.address		= handleCustInfo.address;				//加密后的客户地址
		OrderInfo.bojbrCustInfos.custName 		= handleCustInfo.CN;					//加密后的客户名
		OrderInfo.bojbrCustInfos.telNumber		= $.trim($("#orderAttrPhoneNbr").val());//联系电话
		OrderInfo.bojbrCustInfos.addressStr		= handleCustInfo.addressStr;			//证件地址
		OrderInfo.bojbrCustInfos.partyTypeCd	= $.trim($("#orderPartyTypeCd").val());	//客户类型
		OrderInfo.bojbrCustInfos.mailAddress	= handleCustInfo.address;				//加密后的客户地址
		OrderInfo.bojbrCustInfos.mailAddressStr	= handleCustInfo.custAddress;			//客户地址
		OrderInfo.bojbrCustInfos.defaultIdTycre	= $.trim($("#orderIdentidiesTypeCd").val());//证件类型
		//2.经办人证件信息
		OrderInfo.bojbrCustIdentities.identidiesTypeCd	= $.trim($("#orderIdentidiesTypeCd").val());//证件类型
		OrderInfo.bojbrCustIdentities.certNum 			= handleCustInfo.certNum;//加密后的证件号码
		OrderInfo.bojbrCustIdentities.identityNum 		= handleCustInfo.idCardNumber;//证件号码
		//3.若用户有填写经办人联系号码，则新建经办人时添加联系人信息，否则不添加联系人信息
		if(ec.util.isObj(OrderInfo.bojbrCustInfos.telNumber)){
			if(ec.util.isArray(handleCustInfo.contactInfos)){//有联系人节点返回，则尽可能从联系人节点取值
				var contactInfo = handleCustInfo.contactInfos[0];
				OrderInfo.bojbrPartyContactInfo.staffId 		= OrderInfo.staff.staffId;
				OrderInfo.bojbrPartyContactInfo.mobilePhone 	= OrderInfo.bojbrCustInfos.telNumber;
				OrderInfo.bojbrPartyContactInfo.contactName 	= contactInfo.contactName;
				OrderInfo.bojbrPartyContactInfo.contactNameEnc 	= contactInfo.contactNameEnc;
				OrderInfo.bojbrPartyContactInfo.contactAddress 	= "";//后台要求传空字符串
				if(ec.util.isObj(contactInfo.contactGender)){
					OrderInfo.bojbrPartyContactInfo.contactGender = contactInfo.contactGender;
				} else{
					//没能从联系人节点判断性别，则从证件类型判断
					if(OrderInfo.bojbrCustIdentities.identidiesTypeCd == "1"){
						var identityNum = String(OrderInfo.bojbrCustIdentities.identityNum);
						identityNum = parseInt(identityNum.substring(16,17));//取身份证第17位判断性别，奇数男，偶数女
						OrderInfo.bojbrPartyContactInfo.contactGender = (identityNum % 2) == 0 ? "2" : "1";//1男2女
					} else{
						OrderInfo.bojbrPartyContactInfo.contactGender = "1";//性别，默认为男
					}
				}
			} else{//没有联系人节点返回，完全从客户信息取值
				OrderInfo.bojbrPartyContactInfo.staffId 		= OrderInfo.staff.staffId;
				OrderInfo.bojbrPartyContactInfo.mobilePhone 	= OrderInfo.bojbrCustInfos.telNumber;
				OrderInfo.bojbrPartyContactInfo.contactName 	= OrderInfo.bojbrCustInfos.name;
				OrderInfo.bojbrPartyContactInfo.contactNameEnc 	= handleCustInfo.CN;//未返回联系人节点时，只能CN代替
				OrderInfo.bojbrPartyContactInfo.contactAddress 	= "";//后台要求传空字符串;
				//根据证件类型判断性别
				if(OrderInfo.bojbrCustIdentities.identidiesTypeCd == "1"){
					var identityNum = String(OrderInfo.bojbrCustIdentities.identityNum);
					identityNum = parseInt(identityNum.substring(16,17));//取身份证第17位判断性别，奇数男，偶数女
					OrderInfo.bojbrPartyContactInfo.contactGender = (identityNum % 2) == 0 ? "2" : "1";//1男2女
				} else{
					OrderInfo.bojbrPartyContactInfo.contactGender = "1";//性别，默认为男
				}
			}
		}
	};

	//展示拍照弹出加载摄像头
	var _showCameraView = function(){
		//没有看错，确实是open->close->open
		easyDialog.open({
			container : "ec-dialog-photo-graph"
		});
		easyDialog.close();
		easyDialog.open({
			container : "ec-dialog-photo-graph"
		});
		$("#img_Cert")[0].height=258;
		$("#img_Cert")[0].width=200;
		//初始化页面
		$("#device").empty();
		$("#startPhotos").show();
		$("#startPhotos").off("click").on("click",function(){_createVideo();});
		$("#tips").empty();
		$("#img_Photo")[0].src="";
		$("#img_Photo")[0].height=0;
		$("#img_Photo")[0].width=0;
		//按钮灰话，不绑定事件
		$("#takePhotos").removeClass("btna_o").addClass("btna_g");
		$("#rePhotos").removeClass("btna_o").addClass("btna_g");
		$("#confirmAgree").removeClass("btna_o").addClass("btna_g");
		$("#takePhotos").off("click");
		$("#rePhotos").off("click");
		$("#confirmAgree").off("click");
		$("#auditSmsPwd").val("");
		$("#auditStaffTips").empty();
		$("#photographReviewDiv").show();
		$("#auditDiv").hide();
		_getCameraInfo();
		if(CONST.photographReviewFlag == "ON" && CONST.isPhotographReviewNeeded){
			order.query.qryOperateSpecStaffList();
		}
	};

	//加载拍照设备列表，获取摄像头信息
	var _getCameraInfo = function(){
		//拍照仪版本检查更新
		query.common.checkCameraDriverVersion();
		
		var device = capture.getDevices();
	    device = JSON.parse(device);
		if (device == null || device == undefined) {
			$("#tips").html("提示：请检查是否正确安装插件");
			return;
	    }
		if(device.resultFlag == 0){
			$.each(device.devices,function(){
			    $("#device").append("<option value='"+this.device+"' >"+this.name+"</option>");
			});
			$("#startPhotos").off("click").on("click",function(){_createVideo();});
		}else{
			$("#tips").html("提示："+device.errorMsg);
			return;
		}
	};

	// 创建视频(点击重新拍照也是这里)
	var _createVideo = function() {
		var device = $("#device").val();
		if(device!=null && device != ""){
			var createVideo = JSON.parse(capture.createVideo(device,1280,720));//创建视频
			if(createVideo.resultFlag == 0){
				$("#startPhotos").hide();
				OrderInfo.isCreateVideo = "Y";
				$("#capture")[0].style.visibility = 'visible';
				$("#takePhotos").removeClass("btna_g").addClass("btna_o");
				$("#takePhotos").off("click").on("click",function(){_createImage();});
			}else{
				$("#tips").html("提示："+createVideo.errorMsg);
				return;
			}
		}else{
			$("#startPhotos").show();
			$("#tips").html("提示：请选择一个摄像头设备");
			return;
		}
	};

	// 拍照(点击确认拍照)
	var _createImage = function() {
		$("#tips").empty();
		if(!$('#img_Photo').is(":hidden")){}
		var createImage = cert.createImage();
		if (createImage && createImage.resultFlag != 0){
			$("#tips").html("提示："+ createImage.errorMsg);
			return false;
		}
		//针对IE8需要压缩照片
		var browser = CommonUtils.validateBrowser();
		var param = {
			"photograph":((browser.indexOf("IE8") >= 0) || (browser.indexOf("IE7") >= 0)) ? encodeURIComponent(createImage.compImage) : encodeURIComponent(createImage.image),
			"venderId":createImage.venderId
		};
		$.ecOverlay("<strong>正在处理中, 请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath + "/cust/preHandleCustCertificate", param);
		$.unecOverlay();
		if(response.code == 0 && response.data){
			$("#takePhotos").removeClass("btna_o").addClass("btna_g").off("click");
			$("#img_Photo").attr("src", "data:image/jpeg;base64," + response.data.photograph);
			$("#img_Photo").attr("width", 640);
			$("#img_Photo").attr("height", 360);

			$("#img_Photo").data("identityPic", createImage.image);
			$("#img_Photo").data("signature", createImage.signature);
			$("#img_Photo").data("venderId", createImage.venderId);
			//拍照后置灰按钮，取消绑定事件
			$("#takePhotos").off("click");
			$("#takePhotos").removeClass("btna_o").addClass("btna_g");
			$("#rePhotos").removeClass("btna_g").addClass("btna_o");
			$("#rePhotos").off("click").on("click",function(){_rePhotos();});
			$("#confirmAgree").removeClass("btna_g").addClass("btna_o");
			$("#confirmAgree").off("click").on("click",function(){_uploadImage();});
		}else{
			$.alertM(response.data);
			$("#tips").html("提示："+response.data);
		}

		try{
			var obj = cert.closeVideo();
			var json = JSON.parse(obj);
			if (json && json.resultFlag != 0){
				$("#tips").html("提示：" + json.errorMsg);
			}
		}catch(e) {
			throw new Error("camera driver (DoccameraOcx.exe) is not installed correctly.");
		}
	};

	var _rePhotos = function(){
		//初始化页面
		$("#tips").html("");
		$("#img_Photo")[0].src="";
		$("#img_Photo")[0].height=0;
		$("#img_Photo")[0].width=0;
		//拍照后置灰按钮，取消绑定事件
		$("#rePhotos").off("click");
		$("#rePhotos").removeClass("btna_o").addClass("btna_g");
		$("#confirmAgree").removeClass("btna_o").addClass("btna_g");
		$("#confirmAgree").off("click");
		$("#takePhotos").off("click").on("click",function(){_createImage();});
		$("#takePhotos").removeClass("btna_g").addClass("btna_o");
		_createVideo();
	};

	//刷新时间
	var second = 30;
	var interResend = null;
	var showTime = function(){
		if (second > 0){
			second--;
			if(second == 0){
				$("#confirmagreesmsresend").removeClass("cf").addClass("cn").off("click").on("click",_confirmAgreeSmsResend);
				$("#auditDefaultTimeResend").html("");
				if(interResend != null){
					window.clearInterval(interResend);
					$('#timeInfo').html("");
					$("#confirmagreesmsresend").attr("title","请点击重新发送短信验证码.");		
					return;
				}
			}
			$("#auditDefaultTimeResend").html("在" + second + "秒内");	
		}
		$("#confirmagreesmsresend").attr("title", "请在"+second+"秒后再点击重新发送.");	
	};

	//短信验证码失效时间5分钟
	var leftInvalidTime=300;
	var smsInvalidTime=function(){
		if (leftInvalidTime>0){
			leftInvalidTime--;
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
	var _confirmAgreeSmsResend=function(){ 
		$.callServiceAsJsonGet(contextPath+"/staff/login/confirmAgreeSmsResend",{'smsErrorCount':smsErrorCount} ,{
			"done" :function(response){				
				if (response.code==0) {
					$.alert("提示","验证码发送成功，请及时输入验证.");
					$("#confirmagreesmsresend").off("click").removeClass("cn").addClass("cf");
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
			}
		});	
	};

	// 上传照片
	var uploadCustCertificateParams = {};
	
	var _uploadImage = function() {
		var auditStaff = $("#auditStaffList").val();
		var auditMode = $("#auditMode").val();
		
		if(CONST.photographReviewFlag == "ON" && CONST.isPhotographReviewNeeded){
			if(!ec.util.isObj(auditStaff) || auditStaff == "-1"){
				$.alert("提示", "请选择审核人");
				return;
			}
			if(!ec.util.isObj(auditMode) || auditMode == "-1"){
				$.alert("提示", "请选择审核方式");
				return;
			}
			
			if(ec.util.isArray(OrderInfo.operateSpecStaff.operateSpecStaffList)){
				$.each(OrderInfo.operateSpecStaff.operateSpecStaffList, function(){
					if(this.staffId == auditStaff){
						OrderInfo.operateSpecStaff.staffId = this.staffId;
						OrderInfo.operateSpecStaff.staffCode = this.staffCode;
						OrderInfo.operateSpecStaff.staffName = this.staffName;
						OrderInfo.operateSpecStaff.phoneNumber = this.phone;
					}
				});
			} else{
				$.alert("错误", "未获取到审核人员列表数据，请关闭拍照窗稍后重新尝试。");
				return;
			}
		}
		
		$("#confirmAgree").removeClass("btna_o").addClass("btna_g");
		$("#confirmAgree").off("click");
		$("#tips").empty();
	    var pictures = [];
		if(!!OrderInfo.bojbrCustInfos &&
				OrderInfo.bojbrCustInfos.identidiesTypeCd !=  $.trim($("#orderIdentidiesTypeCd").val()) &&
				OrderInfo.bojbrCustInfos.identityNum!= $.trim($("#orderIdentidiesTypeCd").val())){
			pictures.push({
				"flag"		: "C",
				"staffId"	: OrderInfo.operateSpecStaff.staffId,
				"signature" : "",
	            "photograph": encodeURIComponent(OrderInfo.bojbrCustIdentities.identidiesPic)//经办人身份证照片
			});
			pictures.push({
	            "flag"		: "D",
	            "staffId"	: OrderInfo.operateSpecStaff.staffId,
	            "signature" : $("#img_Photo").data("signature"),
	            "photograph": encodeURIComponent($("#img_Photo").data("identityPic"))//经办人拍照照片
	            
			});
			if (ec.util.isObj(OrderInfo.boCustIdentities.identidiesPic)){
				pictures.push({
		            "flag"		: "A",
		            "signature" : "",
		            "photograph": encodeURIComponent(OrderInfo.boCustIdentities.identidiesPic)//新建客户身份证照片
		        });
			}
			
			//现场审核补充参数
			if(CONST.isPhotographReviewNeeded && CONST.photographReviewFlag == "ON" && auditMode == "1"){
				$.each(pictures, function(){
					this.checkType = auditMode;
				});
			}
			
			uploadCustCertificateParams = {
				accNbr		: "",
				areaId		: OrderInfo.getAreaId(),
				srcFlag		: "REAL",
				certType	: $.trim($("#orderIdentidiesTypeCd").val()),//证件类型
				venderId  	: $("#img_Photo").data("venderId"),
				extSystem	: "1000000206",
				certNumber	: $.trim($("#orderAttrIdCard").val()), //证件号码
				photographs	: pictures
		    };
			
			if(CONST.photographReviewFlag == "ON" && CONST.isPhotographReviewNeeded){
				if(auditMode == "1"){//现场审核，短信校验通过再上传
					//发送短信
					_sendSms4Audit("1");
				} else if(auditMode == "2"){//远程审核，上传后再短信
					var callBackFuncMust = "order.cust.sendSms4Audit('2')";
					var callBackFuncOption = "";
					_uploadImageMainFunc(uploadCustCertificateParams, callBackFuncMust, callBackFuncOption);
				}
			} else{
				_uploadImageMainFunc(uploadCustCertificateParams, "order.cust.close()", "");
			}
		}
	};
	
	//现场审核、远程审核发送短信
	var _sendSms4Audit = function(auditMode){
		var param = {
		   number: OrderInfo.operateSpecStaff.phoneNumber,
		   areaId : OrderInfo.getAreaId(),
		   virOlId : OrderInfo.virOlId,
		   checkType: auditMode
		};
		$.callServiceAsJsonGet(contextPath + "/staff/login/confirmAgreeCheck", param , {
			"before" : function(){
				$.ecOverlay("<strong>短信发送中,请稍等会儿...</strong>");
			},
			"done" : function(response){
				if (response.code == 0) {
					_initAuditHtml(auditMode);
				}else if(response.code == 3){
					$.alert("提示", "审核短信发送失败：" + response.data);
					return;
				}else if(response.code == 1002){
					return;
				}else if(response.code == 1003){
					$.alert("提示","审核短信发送失败：" + response.data);
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
				$.alert("提示", "审核短信发送失败： 请求可能发生未知异常，请稍候再试");
			}
		});	
	};
	
	var _initAuditHtml = function(auditMode){
		OrderInfo.operateSpecStaff.auditMode = auditMode;
		if(auditMode == "1"){//现场审核
			$("#auditStaffTips").html("审核人：" + OrderInfo.operateSpecStaff.staffName + "/" + OrderInfo.operateSpecStaff.phoneNumber);
			$("#photographReviewDiv").hide();
			$("#auditDiv").show();
			$("#auditDefaultTimeResend").text(second);//验证码提示秒数
			window.clearInterval(interResend);
			$("#auditSmsPwd").val("").removeClass("ketchup-input-error");
			$("#confirmagreesmsresend").off("click").removeClass("cn").addClass("cf");
			//重新发送验证码成功后,验证错误次数置0.
			smsErrorCount=0;
			//重新发送验证码成功后,验证码有效期初始化5分钟.
			sendSmsAfter30s();
			//5分钟倒计时，超过5分钟未输入验证码就失效.
			leftInvalidTime = 300;
			invalidAfter5Mins();
			$("#auditSmsPwd").focus();
			
		}else{//远程审核
			_close();
			var virOlId = OrderInfo.virOlId;
			var staffCode = OrderInfo.operateSpecStaff.staffCode;
			var staffName = OrderInfo.operateSpecStaff.staffName;
			var auditTips = "经办人拍照人像远程审核请求已经发送 "+staffName+"（工号"+staffCode+"），虚拟流水号："+virOlId+"，请联系审核人尽快处理。";
			$.alert("提示", auditTips);
			return;
		};
	};
	//上传照片主函数
	var _uploadImageMainFunc = function(params, callBackFuncMust, callBackFuncOption){
		 var result =  query.common.queryPropertiesMapValue("FACE_VERIFY_FLAG", "FACE_VERIFY_"+String(OrderInfo.staff.areaId).substr(0, 3));
		 if(result.FACE_VERIFY_SWITCH == "ON" && CONST.isfaceVerify){
			 var param={
				 "ContractRoot":{
						   "SvcCont":{
							     "params":{
							    	  "olid":"",
									  "busi_type": OrderInfo.busitypeflag,
									  "opt_name": $.trim($("#orderAttrName").val()),
									  "opt_certnum": $.trim($("#orderAttrIdCard").val()), 
								      "cust_id":OrderInfo.cust.custId,
								      "party_name": man.resultContent.partyName,
								      "gender":man.resultContent.gender,
								      "nation":man.resultContent.nation,
								      "born_day":man.resultContent.bornDay,
								      "cert_address" : man.resultContent.certAddress,
								      "cert_number":man.resultContent.certNumber,
								      "cert_org": man.resultContent.certOrg,
								      "eff_date":man.resultContent.effDate,
								      "exp_date":man.resultContent.expDate,
								      "image_idcard" : encodeURIComponent(OrderInfo.bojbrCustIdentities.identidiesPic), 
								      "image_best":encodeURIComponent($("#img_Photo").data("identityPic"))
	                             }
						    },
						    "TcpCont": {
						    	
						    }
					    }
			 };
			 var response =  $.callServiceAsJson(contextPath+"/cust/pic/verify",param);
			 if(response.code == 0 && response.data){
				 OrderInfo.confidence = response.data.confidence;   
				 OrderInfo.faceVerifyFlag = response.data.faceVerifyFlag; // y or n 
				 if(response.data.faceVerifyFlag == "Y"){
				     $.each(params.photographs, function(){
								this.checkType = "3";
					 });
					 $.alert("提示", "人证相符，相符度 "+confidence+'%,拍摄成功');
				 }else{
					  if(CONST.isForcePassfaceVerify){
						     $.each(params.photographs, function(){
									this.checkType = "4";
						     });
						     $.alert("提示", "人证相符，相符度 "+confidence+'%,拍摄成功');
					  }else{
						  $.alert("提示", "人证不符，相符度 "+confidence+'%,低于阀值'+ response.data.fz +'%，请重新拍摄');
				    	  return;
				      }
				}
			}else if(response.code == 1 && response.data){
				$.alert("错误", "人证比对失败，错误原因：" + response.data);
				return false;
			}else if(response.code == -2 && response.data){
				$.alertM(response.data);
				return false;
			}else{
				$.alert("错误", "人证比对发生未知异常，请稍后重试。错误信息：" + response.data);
				return false;
			}
		 }
		 uploadCustCertificate(params, callBackFuncMust, callBackFuncOption);
	};
	var uploadCustCertificate = function(params){
		    $.ecOverlay("<strong>正在处理中, 请稍等...</strong>");
			var response = $.callServiceAsJson(contextPath + "/cust/uploadCustCertificate", params);
			$.unecOverlay();
			if(response.code == 0 && response.data){
				isUploadImageSuccess = true;
				OrderInfo.virOlId = response.data.virOlId;
				eval(callBackFuncMust);
				if(ec.util.isObj(callBackFuncOption)){
					eval(callBackFuncOption);
				}
				return true;
			}else if(response.code == 1 && response.data){
				$.alert("错误", "证件上传失败，错误原因：" + response.data);
				return false;
			}else if(response.code == -2 && response.data){
				$.alertM(response.data);
				return false;
			}else{
				$.alert("错误", "证件上传发生未知异常，请稍后重试。错误信息：" + response.data);
				return false;
			}
	}
	//现场审核：审核不过，重新拍照按钮
	var _auditFailureRePhoto = function(){
		$("#photographReviewDiv").show();
		$("#auditDiv").hide();
		_rePhotos();
	};
	
	//现场审核：审核通过按钮
	var _auditConfirm = function() {
		//判断短信验证码是否过期
		if(leftInvalidTime == 0){
			$.alert("提示", "您的短信验证码已经过期，请重新发送后再次验证。");
			return;
		}
		//判断短信验证错误次数,超过三次后,验证码失效，需要重新发送.
		if(smsErrorCount == 3){
			$.alert("提示","对不起，3次错误输入后验证码已自动失效，请重新发送验证码。");
			$("#confirmagreesmsresend").removeClass("cf").addClass("cn").off("click").on("click",_confirmAgreeSmsResend);
			if(interResend != null){
				window.clearInterval(interResend);
				$('#timeInfo').html("");
				$("#confirmagreesmsresend").attr("title","请点击重新发送短信验证码.");	
				return;
			}
			return;
		}
		
		var smspwd = ec.util.isObj($.trim($("#auditSmsPwd").val())) ? $.trim($("#auditSmsPwd").val()) : "N";
		var smsValidparams = "smspwd=" + smspwd + "&number=" + OrderInfo.operateSpecStaff.phoneNumber;
		$.callServiceAsJson(contextPath + "/staff/login/confirmAgreeSmsValid", smsValidparams, {
			"before":function(){
				$.ecOverlay("<strong>验证短信随机码中,请稍等会儿...</strong>");
			},
			"done" : function(response){
				if (response.code == 0) {
//					var callBackFuncMust = "order.query.photographReviewSucess()";
//					var callBackFuncOption = "order.cust.close()";
					var callBackFuncMust = "order.cust.close()";
					var callBackFuncOption = "OrderInfo.operateSpecStaff.isAuditSucess = true";
					_uploadImageMainFunc(uploadCustCertificateParams, callBackFuncMust, callBackFuncOption);
				} else if (response.code == 1) {
					smsErrorCount++;
					$.alert("提示", response.data);
				}else {
					$.alert("提示","请求异常，请重新登录再试！");
				};
			},
			"always":function(){
				$.unecOverlay();
			}
		});
	};

	//关闭拍照弹框，关闭视频
	var _close = function() {
		try{
			var closeResult = cert.closeVideo();
//			var closeResultJsonObj = JSON.parse(closeResult);
//			if (closeResultJsonObj && closeResultJsonObj.resultFlag != 0){
//				$.alert("错误", "关闭摄像头发生错误，请清空浏览器缓存，重新将拍照设备与电脑连接后再次尝试，错误信息：" + closeResultJsonObj.errorMsg);
//			}
		}catch(e) {
			throw new Error("camera driver (DoccameraOcx.exe) is not installed correctly.");
		}finally{
			easyDialog.close();
			$(".ZebraDialogOverlay").remove();
			$(".ZebraDialog").remove();
		}
    };

    //捕获ESC动作
    document.onkeydown=function(event){
		var e = event || window.event || arguments.callee.caller.arguments[0];
    	if(e && e.keyCode==27){//按 Esc
    		_close();
    		return;
    	}
    };

    //经办人信息填写模块信息保护优化
    var _disableHandleCustInfos = function(){
    	var backgroundColor = "background-color: #E8E8E8;";
    	var backgroundColorGray = "#E8E8E8;";
    	//1.“查询读卡”按钮隐藏，“重置”按钮展示
    	_bindEvent4HandleCust();
    	//2.置灰证件类型
    	$('#orderIdentidiesTypeCd').attr("disabled", "disabled");
    	$('#orderIdentidiesTypeCd').attr("style", backgroundColor);
    	//3.置灰经办人姓名
    	$("#orderAttrName").css("background-color", backgroundColorGray).attr("disabled", true);
    	$("#li_order_attr span").css("background-color", backgroundColorGray).attr("disabled", true);
    	//4.置灰证件号码
    	$("#orderAttrIdCard").css("background-color", backgroundColorGray).attr("disabled", true);
    	$("#li_order_remark2 span").css("background-color", backgroundColorGray).attr("disabled", true);
    	//5.置灰证件地址
    	$("#orderAttrAddr").css("background-color", backgroundColorGray).attr("disabled", true);
    	$("#li_order_remark3 span").css("background-color", backgroundColorGray).attr("disabled", true);
    	//6.置灰联系人号码
    	$("#orderAttrPhoneNbr").css("background-color", backgroundColorGray).attr("disabled", true);
    };

    //为重置按钮绑定新的事件
    var _bindEvent4HandleCust = function() {
    	$("#orderAttrResetBtn").show();
    	$("#orderAttrReadCertBtn").hide();
    	$("#orderAttrQueryCertBtn").hide();
    };

    //恢复被置灰的经办人
    var _resetHandleCustInfos = function(){
    	//1.去除置灰的限制
    	_removeDisabled();
    	//2.重置页面上的经办人信息
    	_setValueForAgentOrderSpan({
			"partyName"		:"",
			"certAddress"	:"",
			"certNumber"	:""
		});
    	$("#orderAttrPhoneNbr").val("");
    	//3.重置经办人js缓存
    	OrderInfo.resetOrderInfoCache();
    };

    //去除置灰的限制，恢复读卡和查询两个按钮
    var _removeDisabled = function(){
    	var backgroundColorWhite = "white;";
    	var orderIdentidiesTypeCd = $("#orderIdentidiesTypeCd").val();
    	if(orderIdentidiesTypeCd == 1){
    		$("#orderAttrResetBtn").hide();
        	$("#orderAttrReadCertBtn").show();
        	$("#orderAttrQueryCertBtn").hide();
    	} else{
    		$("#orderAttrResetBtn").hide();
        	$("#orderAttrReadCertBtn").hide();
        	$("#orderAttrQueryCertBtn").show();
    	}
    	_jbrcreateButton();
    	$("#orderAttrReadCertBtn").attr("onclick", "javascript:order.cust.readCertWhenOrder()");
    	//重置证件类型
    	$('#orderIdentidiesTypeCd').removeAttr("disabled").removeAttr("style");
    	//重置经办人姓名
    	$("#orderAttrName").css("background-color", backgroundColorWhite).attr("disabled", false);
    	$("#li_order_attr span").css("background-color", backgroundColorWhite).attr("disabled", false);
    	//重置证件号码
    	$("#orderAttrIdCard").css("background-color", backgroundColorWhite).attr("disabled", false);
    	$("#li_order_remark2 span").css("background-color", backgroundColorWhite).attr("disabled", false);
    	//重置证件地址
    	$("#orderAttrAddr").css("background-color", backgroundColorWhite).attr("disabled", false);
    	$("#li_order_remark3 span").css("background-color", backgroundColorWhite).attr("disabled", false);
    	//重置联系人号码
    	$("#orderAttrPhoneNbr").css("background-color", backgroundColorWhite).attr("disabled", false);
    };
    
    /*
     * 实名信息采集单经办人自动填充
     */
    var _cltjbrCreate = function(){	
    	_setSelectVal("orderIdentidiesTypeCd","1"); //默认证件类型使用“身份证”
    	_identidiesTypeCdChoose($('#orderIdentidiesTypeCd'),'orderAttrIdCard');
		$("#orderAttrReadCertBtn").remove();//读卡（重置）按钮去除，不允许再添加其他人为经办人
		$("#orderAttrQueryCertBtn").remove();//查询（重置）按钮去除，不允许再添加其他人为经办人
		$("#orderAttrResetBtn").remove();//查询（重置）按钮去除，不允许再添加其他人为经办人

    	//拦截采集单信息
    	if(!ec.util.isObj(OrderInfo.cltjbrInfo.fileOrderId)){
    		$.alert("错误", "经办人信息获取失败，采集单错误，无法继续受理，请重试。");
			return;
    	}
    	//调用后台接口下载经办人身份证照片
		$.ecOverlay("<strong>正在处理经办人信息中, 请稍等...</strong>");
		var response = $.callServiceAsJson(contextPath + "/order/downloadCustCertificate", {
			areaId		: OrderInfo.getAreaId(),
			srcFlag		: "REAL",
			olId		: OrderInfo.cltjbrInfo.fileOrderId
		});
		$.unecOverlay();
		if(response.code == 0 && response.data){
			var _identidiesPic ="";
			var _custPhoto = "";
			for(var i=0; i<response.data.photographs.length;i++){
				if(response.data.photographs[i].picFlag == "C"){
					_identidiesPic = response.data.photographs[i].photograph;
				}else if(response.data.picturesInfo[i].picFlag == "D"){
					_custPhoto = response.data.photographs[i].photograph;
				}
			}

			OrderInfo.bojbrCustIdentities.identidiesPic = _identidiesPic;
			OrderInfo.bojbrCustIdentities.custPhoto = _custPhoto;
			// 设置隐藏域的表单数据
			$('#orderAttrName').val(OrderInfo.cltjbrInfo.custName);//姓名
			$('#orderAttrIdCard').val(OrderInfo.cltjbrInfo.certNumber);//设置身份证号
			$('#orderAttrAddr').val(OrderInfo.cltjbrInfo.addressStr);//地址
			$('#orderAttrPhoneNbr').val(OrderInfo.cltjbrInfo.telNumber);//联系方式
			// 设置文本显示
			$("#li_order_attr span").text(OrderInfo.cltjbrInfo.custName);
			$("#li_order_remark2 span").text(OrderInfo.cltjbrInfo.certNumber);
			$("#li_order_remark3 span").text(OrderInfo.cltjbrInfo.addressStr);
			
			if (CONST.realNamePhotoFlag == "ON") {
			    if (ec.util.isObj(_identidiesPic)) {
					if (!ec.util.isObj(_custPhoto)) {
						$.alert("错误", "当前采集单经办人照片为空，采集单错误，无法继续受理，请确认重试。");
						return;
					}else{
						//拍照预览按钮展示，事件绑定
						$("#orderAttrPicShowBtn").show().off("click").on("click",function(){
							$("#img_photo_show").attr("src", "data:image/jpeg;base64," + _custPhoto);
			                easyDialog.open({
			                    container: 'ec-dialog-photo-show'
			                });
						});
			      		_showCertPicture();
					}
				} else{
					$.alert("错误", "当前经办人身份证照片为空，采集单错误，无法继续受理，请确认重试。");
					return;
				}
			}
		}else if(response.code == 1 && response.data){
			$.alert("错误", "经办人证件照下载失败，错误原因：" + response.data);
			return;
		}else if(response.code == -2 && response.data){
			$.alertM(response.data);
			return;
		}else{
			$.alert("错误", "经办人证件照下载发生未知异常，请稍后重试。错误信息：" + response.data);
			return;
		}
	};
	
    /**
     * 证号关系预校验接口
     */
    var _preCheckCertNumberRel = function (prodId, inParam) {
        if(order.prepare.isPreInstall()) {
            return true;
        }
        var isON = query.common.queryPropertiesStatus("ONE_CERT_5_NUMBER_"+OrderInfo.cust.areaId.substr(0,3));
        if(!isON){
            return true;
        }
        var checkResult = false;
        var param = $.extend(true, {"certType": "", "certNum": "", "certAddress": "", "custName": ""}, inParam);
        if(CacheData.isGov(param.certType)){//过滤政企的证件类型，政企的证件不调用一证五号校验
            return true;
        }
        var response=$.callServiceAsJson(contextPath + "/cust/preCheckCertNumberRel", JSON.stringify(param));
        if (response.code == 0) {
            var result = response.data;
            if (ec.util.isObj(result)) {
                var checkData = ec.util.mapGet(OrderInfo.oneCardFiveNum.checkNum, _getCustInfo415Flag(inParam));
                if (!ec.util.isObj(checkData)) {
                    checkData = [];
                }
                var checkCount = checkData.length;
                if ($.inArray(prodId, checkData) != -1) {
                    checkCount = checkData.length - 1;
                }
                if ((parseInt(result.usedNum) + checkCount) < 5) {
                    $.unique($.merge(checkData, [prodId]));
                    ec.util.mapPut(OrderInfo.oneCardFiveNum.checkNum, _getCustInfo415Flag(inParam), checkData);
                    ec.util.mapPut(OrderInfo.oneCardFiveNum.usedNum, _getCustInfo415Flag(inParam), result.usedNum);
                    checkResult=true;
                } else {
                    $.alert("提示", "证件「" + inParam.certNum + "」全国范围已有5张及以上移动号卡，无法在证件下新增证号关系！");
                }
            }
        } else {
            $.alertM(response.data);
        }
        return checkResult;
    };
    /**
     * 证号关系预校验接口,只查询数据不校验
     */
    var _preCheckCertNumberRelQueryOnly = function (inParam) {
        if(order.prepare.isPreInstall()) {
            return true;
        }
        var isON = query.common.queryPropertiesStatus("ONE_CERT_5_NUMBER_" + OrderInfo.cust.areaId.substr(0, 3));
        if (isON) {
            var param = $.extend(true, {"certType": "", "certNum": "", "certAddress": "", "custName": ""}, inParam);
            if (CacheData.isGov(param.certType)) {//过滤政企的证件类型，政企的证件不调用一证五号校验
                return true;
            }
            var response = $.callServiceAsJson(contextPath + "/cust/preCheckCertNumberRel", JSON.stringify(param));
            if (response.code == 0) {
                var result = response.data;
                if (ec.util.isObj(result)) {
                    ec.util.mapPut(OrderInfo.oneCardFiveNum.usedNum, _getCustInfo415Flag(inParam), result.usedNum);
                }
            } else {
                $.alertM(response.data);
            }
        }
    };

    /**
     * 获取一证五号客户信息，新客户或者老用户
     * @private
     */
    var _getCustInfo415 = function () {
        var inParam = {};
        if (OrderInfo.cust.custId == "-1") {//新客户
            inParam={
                "certType": OrderInfo.boCustIdentities.identidiesTypeCd,
                "certNum": OrderInfo.boCustIdentities.identityNum,
                "certAddress": OrderInfo.boCustInfos.addressStr,
                "custName": OrderInfo.boCustInfos.name
            };
        } else {//老客户
            if(CacheData.isGov(OrderInfo.cust.identityCd)){//如果是政企客户取政企使用人信息
                inParam = {
                    "certType": OrderInfo.cust.userIdentityCd,
                    "certNum": OrderInfo.cust.userIdentityNum,
                    "certAddress": OrderInfo.cust.userCertAddress,
                    "custName": OrderInfo.cust.userName,
                    "custNameEnc": OrderInfo.cust.userNameEnc,
                    "certNumEnc": OrderInfo.cust.userCertNumEnc,
                    "certAddressEnc": OrderInfo.cust.userCertAddressEnc
                };
            }else{
                inParam = {
                    "certType": OrderInfo.cust.identityCd,
                    "certNum": OrderInfo.cust.idCardNumber,
                    "certAddress": OrderInfo.cust.addressStr,
                    "custName": OrderInfo.cust.partyName,
                    "custNameEnc": OrderInfo.cust.CN,
                    "certNumEnc": OrderInfo.cust.certNum,
                    "certAddressEnc": OrderInfo.cust.address
                };
            }
        }
        return inParam;
    };

    /**
     * 获取当前客户的证件类型
     * @private
     */
    var _getCustCertType = function () {
        var certType = OrderInfo.cust.identityCd;
        if (OrderInfo.cust.custId == "-1") {//新客户
            certType=OrderInfo.boCustIdentities.identidiesTypeCd;
        }
        return certType;
    };

    /**
     * 获取一证五号客户信息唯一标识，新客户或者老用户
     * @private 有脱敏信息的客户信息中脱敏证件号不具有唯一性，用加密字段做唯一标识，
     */
    var _getCustInfo415Flag = function (inParam) {
        if(ec.util.isObj(inParam.certNumEnc)){
            return inParam.certNumEnc;
        }else{
            return inParam.certNum;
        }
    };
    
  //行业类型选择事件
	var _industryClassCdSeChoose = function(scope,id) {
		var industryClassCdSe=$(scope).val();
		if(id == "first"){
			var seCondGradIndustryClass = [];
			for(var i=0;i<OrderInfo.industryClassInfo.length;i++){
				if(OrderInfo.industryClassInfo[i].attrValueCode == industryClassCdSe){
					seCondGradIndustryClass = OrderInfo.industryClassInfo[i].attrSpecDesc.seCondGradIndustryClass;
					if(OrderInfo.industryClassInfo[i].attrExtendValue!=null &&OrderInfo.industryClassInfo[i].attrExtendValue!=""){
						$("#identidiesTypeCd").val(OrderInfo.industryClassInfo[i].attrExtendValue);
						$("#identidiesTypeCd").attr("disabled","disabled"); 
					}else{
						$("#identidiesTypeCd").removeAttr("disabled");
						$("#identidiesTypeCd option:first").prop("selected","selected");
					}
					break;
				}
			}
			$("#industryClassCdSeSecond").empty();
			$("#industryClassCdSeSecond").append("<option value='def'>--请选择--</option>");
			$("#industryClassCdSeThird").empty();
			$("#industryClassCdSeThird").append("<option value='def'>--请选择--</option>");
			for(var i=0;i<seCondGradIndustryClass.length;i++){
				var seCondInfo= seCondGradIndustryClass[i];
				$("#industryClassCdSeSecond").append("<option value='"+seCondInfo.industryClassCd+"' >"+seCondInfo.name+"</option>");
			}
		}else if(id == "second"){
			$("#industryClassCdSeThird").empty();
			$("#industryClassCdSeThird").append("<option value='def'>--请选择--</option>");
			var thirdGradIndustryClass = [];
			for(var i=0;i<OrderInfo.industryClassInfo.length;i++){
				for(var j=0;j<OrderInfo.industryClassInfo[i].attrSpecDesc.seCondGradIndustryClass.length;j++){
					if(OrderInfo.industryClassInfo[i].attrSpecDesc.seCondGradIndustryClass[j].industryClassCd == industryClassCdSe){
						thirdGradIndustryClass = OrderInfo.industryClassInfo[i].attrSpecDesc.seCondGradIndustryClass[j].thirdGradIndustryClass;
						break;
					}
				}
			}
			for(var i=0;i<thirdGradIndustryClass.length;i++){
				var thirdInfo= thirdGradIndustryClass[i];
				$("#industryClassCdSeThird").append("<option value='"+thirdInfo.industryClassCd+"' >"+thirdInfo.name+"</option>");
			}
		}
	};
	
	//征信 获取初审信息
	var _qryPreliminaryInfo = function(idCard,phoneNumber) {
		OrderInfo.preliminaryInfo = {};
		var partnerCode = $("#partnerCode").val();
		var param = {
			areaId : $("#p_cust_areaId").val(),
			idCard : idCard,
			phoneNumber : phoneNumber,
			partnerCode : partnerCode
		};
		var qryUrl=contextPath+"/order/qryPreliminaryInfo";
		var response = $.callServiceAsJson(qryUrl, param);
		if (response.code == 0 && response.data.result!=null && response.data.result.userInfo!=null) {
			response.data.result.userInfo.partnerCode = partnerCode;
			response.data.result.userInfo.transactionID = response.data.transactionID;
		};
		return response;
	};
	
	/**
	 * #1476472 增加翼支付功能产品订购限制，判断是否满足订购条件
	 * 	返回true表示校验通过，为可订购；false为校验不通过，不允许订购，默认提示退订
	 * 	prodId 产品实例ID，新装的为负数序列
	 * 	type 校验场景,1：初始化套餐带出；2：选择使用人（直接调用证件校验方法）；3：选择订购翼支付）
	 */
	var _canOrderYiPay = function (prodId,type) {
		var isNew = false;
		//判断prodId是否存在并是否小于0来判断是否为新装产品
		if(ec.util.isObj(prodId)&&prodId<0){
			isNew = true;
		}
		//先取产权客户证件类型,如果是新建客户，取新建节点的证件类型
		var identityCd = OrderInfo.cust.identityCd;
		if(OrderInfo.cust.custId < 0){
			identityCd = OrderInfo.boCustInfos.defaultIdType;
		}
		//判断是否为政企客户
		var isGov = _isCovCust(identityCd);
		//使用人证件类型
		var userIdentityCd = "";
		if(isNew){
			//初始化套餐带出
			if(type == 1){
				//新装初始化套餐带出政企用户不校验，选择使用人时校验，公众用户直接校验产权人
				if(isGov){
					return true;
				}
			//选择订购翼支付
			}else if(type == 3){
                var isON = query.common.queryPropertiesStatus("REAL_USER_"+OrderInfo.cust.areaId.substr(0,3));
                if(isON){
                	if(ec.util.isObj(OrderInfo.subUserInfos)){
	    	    		 $.each(OrderInfo.subUserInfos, function () {
	                         if (this.prodId == prodId) {
	                         	userIdentityCd = this.orderIdentidiesTypeCd;
	                         }
	                     });
	    	    	 }
               }else{
               	 	if(ec.util.isObj(OrderInfo.choosedUserInfos)){
	                    $.each(OrderInfo.choosedUserInfos, function () {
		                    if (this.prodId == prodId) {
		                    	userIdentityCd = this.custInfo.identityCd;
		                    }
		                });
               	 	}
         		}
          		//有使用人直接校验使用人
          		if(ec.util.isObj(userIdentityCd)){
          			identityCd = userIdentityCd;
          		}else{
          			//政企用户如果没选择使用人不校验，选择使用人时校验，公众用户无使用人直接校验产权人
          			if(isGov){
						return true;
					}
          		}
			}
		}else{
		  //判断老用户对应使用人，政企必有使用人，无使用人直接拦截，公众有使用人校验使用人，无使用人校验产权用户
			if(ec.util.isObj(OrderInfo.oldUserInfos)){
				$.each(OrderInfo.oldUserInfos, function () {
		              if (this.prodId == prodId) {
		            	 userIdentityCd = this.identidiesTypeCd;
		              }
		         });
			}
		  
           if(ec.util.isObj(userIdentityCd)){
	           //判断拆副卡变更套餐，公众用户，副卡变主卡，如果有使用人，会删除，需要校验产权人
           	   //主副卡互换，公众用户，副卡边主卡，如果有使用人，会删除，需要校验产权人，主卡还是校验产权人
	           if(!(OrderInfo.actionFlag == 21||OrderInfo.actionFlag == 28&&!isGov)){
	           	  identityCd = userIdentityCd;
	           }
           }else{
			  if(isGov){
				return false;
			  }
           }
		}
		return _yiPayidentityCdCheck(identityCd);
	};
	
	/**
	 * 增加翼支付功能产品订购限制，根据证件类型判断是否满足订购条件
	 * 返回true表示校验通过，为可订购；false为校验不通过，不允许订购
	 * identityCd 证件类型
	 */
	var _yiPayidentityCdCheck = function (identityCd) {
		if(ec.util.isObj(identityCd)){
			//判断是否在能订购证件类型列表中
			for (var i = 0; i < CONST.YIPAY_IDENTITYCD.length; i ++) {
				if (identityCd == CONST.YIPAY_IDENTITYCD[i].CD) {
					return true;
				}
			}
		}
		return false;
	};
	
	/**
	 * 查询使用人信息缓存至OrderInfo.oldUserInfos
	 * 调用场景：套餐变更初始化；
	 * param{
	 * 		prodInstId : objInstId,
	 * 		acctNbr : accessNumber,
	 * 		prodSpecId : objId,
	 * 		areaId : OrderInfo.getAreaId()
	 * };
	 */
	var _initUserInfos = function(param){
		if(!ec.util.isObj(OrderInfo.oldUserInfos)){
			OrderInfo.oldUserInfos = [];
		}
		//先判断是否存在，存在就不再次调用获取
		var userhasInitFlag = false;
		$.each(OrderInfo.oldUserInfos, function () {
              if (this.prodId == param.prodId) {
            	 userhasInitFlag = true;
            	 return;
              }
        });
        if(userhasInitFlag)return;
		var url= contextPath+"/cust/getUserInfo";
		$.ecOverlay("<strong>正在使用人信息中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data&&!$.isEmptyObject(response.data)){
				response.data.prodId = param.prodInstId;
				OrderInfo.oldUserInfos.push(response.data);
			}
		}else if (response.code==-2){
			$.alertM(response.data);
		}else {
			if(response.data){
				$.alert("提示","获取使用人信息失败!"+response.data);
			}else{
				$.alert("提示","获取使用人信息失败!");
			}
		}
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
		jumpAuth2 : _jumpAuth2,
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
		setValueForNewCust:_setValueForNewCust,
		readCertWhenAuth : _readCertWhenAuth,
		readCertWhenAuth2 : _readCertWhenAuth2,
		fromProvFlag : _fromProvFlag,
		provIsale : _provIsale,
		chooseAreaForChooseUser : _chooseAreaForChooseUser,
		certTypeByPartyType : _certTypeByPartyType,
		bindCustQueryForChoose : _bindCustQueryForChoose,
		tmpChooseUserInfo : _tmpChooseUserInfo,
		queryForChooseUser : _queryForChooseUser,
		queryCustByPageIndex : _queryCustByPageIndex,
		realCheck:_realCheck,
		iotCustidentidiesTypeCdChoose:_iotCustidentidiesTypeCdChoose,
		readCertWhenOrder:_readCertWhenOrder,
		setValueForAgentOrderSpan:_setValueForAgentOrderSpan,
		readCertWhenCustCAttr:_readCertWhenCustCAttr,
		setValueForAgentSpan:_setValueForAgentSpan,
		isCovCust: _isCovCust,
		changeTab:_changeTab,
		saveAuthRecord:_saveAuthRecord,
		saveAuthRecordSuccess:_saveAuthRecordSuccess,
		saveAuthRecordFail:_saveAuthRecordFail,
		smsResend:_smsResend,
		smsvalid:_smsvalid,
		productPwdAuth:_productPwdAuth,
		identityTypeAuth:_identityTypeAuth,
		multiIdentityTypeAuth:_multiIdentityTypeAuth,
		showReadCert:_showReadCert,
		isSelfChannel:_isSelfChannel,
		checkUserInfo : _checkUserInfo,
		showCertPicture : _showCertPicture,
		createVideo : _createVideo,
		getCameraInfo : _getCameraInfo,
		close:_close,
        jbrcreateButton:_jbrcreateButton,
        disableHandleCustInfos:_disableHandleCustInfos,
        resetHandleCustInfos:_resetHandleCustInfos,
        removeDisabled:_removeDisabled,
        cltjbrCreate:_cltjbrCreate,
        preCheckCertNumberRel:_preCheckCertNumberRel,
        preCheckCertNumberRelQueryOnly:_preCheckCertNumberRelQueryOnly,
        industryClassCdSeChoose:_industryClassCdSeChoose,
        getCustInfo415:_getCustInfo415,
        getCustInfo415Flag:_getCustInfo415Flag,
        getCustCertType:_getCustCertType,
        auditFailureRePhoto:_auditFailureRePhoto,
        auditConfirm:_auditConfirm,
        sendSms4Audit:_sendSms4Audit,
        getCustCertType:_getCustCertType,
        canOrderYiPay:_canOrderYiPay,
        yiPayidentityCdCheck:_yiPayidentityCdCheck,
        initUserInfos:_initUserInfos
	};
})();
$(function() {
   order.cust.form_valid_init();
   order.cust.initDic();
   OrderInfo.specialtestauth = !query.common.checkOperateSpec(CONST.ZYCSK);
   OrderInfo.dzjbakqx = !query.common.checkOperateSpec(CONST.DZJBAKQX);
   CONST.isHandleCustNeeded = query.common.checkOperateSpec(CONST.TGJBRBTQX);
   CONST.isPhotographReviewNeeded = !query.common.checkOperateSpec(CONST.RXSHGN);
   CONST.isfaceVerify = !query.common.checkOperateSpec(CONST.RZBDGN);
   CONST.isForcePassfaceVerify = !query.common.checkOperateSpec(CONST.QZSHQX);
   CONST.realNamePhotoFlag = query.common.queryPropertiesValue("REAL_NAME_PHOTO_" + String(OrderInfo.staff.areaId).substr(0, 3));
   CONST.photographReviewFlag = query.common.queryPropertiesValue("PHOTOGRAPH_REVIEW_" + String(OrderInfo.staff.areaId).substr(0, 3));
});
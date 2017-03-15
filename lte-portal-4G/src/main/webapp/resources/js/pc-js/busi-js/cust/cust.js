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
			//param.areaId = 21;
			//param.accessNumber="11969577";
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
				},"always":function(){
					$.unecOverlay();
				}
			});
		}).ketchup({bindElement:"custAuthbtn"});
		//身份证鉴权
		$('#custAuthFormID').bind('formIsValid', function(event, form) {
			var param = _choosedCustInfo;
            param.pCustIdentityCd =$("#p_cust_identityCd_choose").val();// $("#p_cust_identityCd").val();
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
			$("#cCustName").val("");
			$("#cCustIdCard").val("");
			$("#discontactName").val("");
			$("#dishomePhone").val("");
			$("#disofficePhone").val("");
			$("#dismobilePhone").val("");
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
	var _partyTypeCdChoose = function(scope,id) {
		var partyTypeCd=$(scope).val();//OrderInfo.cust.identityCd;//$(scope).val();
		//客户类型关联证件类型下拉框
		$("#"+id).empty();
		_certTypeByPartyType(partyTypeCd,id);
		//创建客户证件类型选择事件
		//_identidiesTypeCdChoose($("#"+id).children(":first-child"),"cCustIdCard");
		//创建客户确认按钮
		//_custcreateButton();

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
	
	//flag  0:成功；1:错误；2:异常
	
	var _saveCloudLog = function(flag,beginTime,endTime,inParams,outParams){
        var param={};
        param.flag=flag;
        param.startTime=beginTime;
        param.endTime=endTime;
        param.inParams=inParams;
        param.outParams=outParams;
		var resp = $.callServiceAsJson(contextPath+"/common/saveCloudLog", param);
		};
	
	/**
	 * 读取二代证云读卡
	 */

	function _readCertCloud(id){
		 //开始时间
		var beginTime=new Date().getTime();
		
	    //云读卡
	    	//获取协议
	    	var param={};
	    	param.teminalType="PC";
	    	var response = $.callServiceAsJson(contextPath+"/common/getCloudParam", param);
	    	if(response.code==0){
	    		var appId=response.data.appId;
	    		var timestamp=response.data.timestamp;
	    		var nonce=response.data.nonce;
	    		var businessExt=response.data.businessExt;
	    		var signature=response.data.signature;
	    		
                try{
                	var jsonStr =CertCtl.cloudReadCert(appId,timestamp,nonce,businessExt,signature);
                	jsonStr=eval("("+jsonStr+")");
                	var inParams={
          	    		  "appId":appId,
          	    		  "timestamp":timestamp,
          	    		  "nonce":nonce,
          	    		  "businessExt":businessExt,
          	    		  "signature":signature
          	    		};
                	outParams={
                	  "resultFlag":jsonStr.resultFlag,
                	  "errorMsg":jsonStr.errorMsg,
                	  "resultContent":jsonStr.resultContent                			
                	};
                	//断开连接
                	CertCtl.disconnect();
                	//获取结束时间
                	var endTime=new Date().getTime();
                	if(jsonStr.resultFlag==0){
                		//记录日志
                		var flag=0;
                		_saveCloudLog(flag,beginTime,endTime,inParams,outParams);
                		var p={};
                		p.data=jsonStr.resultContent.certificate;
                		var resp = $.callServiceAsJson(contextPath+"/common/decodeCert",JSON.stringify(p));
                		if(resp.code==0){
                			var certNumber=resp.data.certNumber;
                			$('#idCardNumber'+id).val(certNumber);
                		}
                		else{
                			alertM("提示","数据解密异常");
                    		return ;
                		}
                	}
                	else{
                		var flag=1;
                		_saveCloudLog(flag,beginTime,endTime,inParams,outParams);
                		$.alert("提示",jsonStr.errorMsg);
                		return ;
                	}
                }
                catch(e){
                	
                }
	    	}
	    	else{
	    		$.alertM(response.errorMsg);
	    		return ;
	    	}
	}
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd,id){
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/token/pc/cust/queryCertType";
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
							if(certTypedate.isDefault == "Y"){
								$("#"+id).append("<option selected='selected' value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							}else{
								$("#"+id).append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							}
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
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==-1){
			$("#"+id).attr("placeHolder","请输入接入号码");
			$("#"+id).attr("data-validate","validate(required:请准确填写接入号码) on(keyup)");
		}else if (identidiesTypeCd==1){
			$("#"+id).attr("placeHolder","请输入身份证号码");
			$("#"+id).attr("data-validate","validate(idCardCheck:请准确填写身份证号码) on(keyup)");
		}else if(identidiesTypeCd==2){
			$("#"+id).attr("placeHolder","请输入军官证");
			$("#"+id).attr("data-validate","validate(required:请准确填写军官证) on(keyup)");
		}else if(identidiesTypeCd==3){
			$("#"+id).attr("placeHolder","请输入护照");
			$("#"+id).attr("data-validate","validate(required:请准确填写护照) on(keyup)");
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
		
		//启用读卡时禁用的控件
		$('#p_cust_identityNum').attr("disabled",false);
	};
	//创建客户证件类型选择事件
	var _identidiesTypeCdChoose = function(scope,id) {
		var identidiesTypeCd=$(scope).val();//OrderInfo.cust.identityCd;
		if(identidiesTypeCd==1){
			$("#"+id).attr("placeHolder","请输入合法身份证号码");
			$("#"+id).attr("data-validate","validate(idCardCheck18:请输入合法身份证号码) on(blur)");
			if (id == "orderAttrIdCard") {// 填单页面经办人读卡
				$("#orderAttrReadCertBtn").show();
				$("#orderAttrName").hide();
				$("#orderAttrIdCard").hide();
				$("#orderAttrAddr").hide();
				$("#li_order_attr span").show();
				$("#li_order_remark2 span").show();
				$("#li_order_remark3 span").show();
				$("#orderAttrQryBtn").hide();
			}else if(id == "orderUserIdCard"){//使用人
				$("#orderUserQryBtn").hide();
				$("#orderUserReadCertBtn").show();
				$("#orderUserName").hide();
				$("#orderUserIdCard").hide();
				$("#orderUserAddr").hide();
				$("#li_order_user span").show();
				$("#li_order_user2 span").show();
				$("#li_order_user3 span").show();
				$("#chooseUserBt").removeClass("btna_o").addClass("btna_g");
				$('#chooseUserBt').off('click');
			};
		}else{
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
				if(OrderInfo.realNamePhotoFlag == "ON"){//开关打开
					$("#orderAttrQryBtn").show();
					if (query.common.queryPropertiesStatus("CHECK_RULES_" + (ec.util.isObj(OrderInfo.staff.areaId) ? OrderInfo.staff.areaId.substr(0, 3) : "")) && CacheData.isInCheckRuleByTypeCd(identidiesTypeCd)) {
		                $("#" + id).removeAttr("onkeyup");
		                $("#" + id).attr("placeHolder", "请输入合法" + CacheData.getCheckRuleByKey(identidiesTypeCd, "name"));
		                $("#" + id).attr("data-validate", "validate(" + CacheData.getCheckRuleByKey(identidiesTypeCd, "checkFunction") + ":" + CacheData.getCheckRuleByKey(identidiesTypeCd, "description") + ") on(blur)");
		            }
					$("#jbrCertCheckForm").off().bind('formIsValid', function(event, form){
						_qryCustInfo();
					}).ketchup({bindElement:"orderAttrQryBtn"});	
				}
			}else if(id == "orderUserIdCard"){//使用人
				$("#orderUserReadCertBtn").hide();
				$("#li_order_user span").text("");
				$("#li_order_user span").hide();
				$("#li_order_user2 span").text("");
				$("#li_order_user2 span").hide();
				$("#li_order_user3 span").text("");
				$("#li_order_user3 span").hide();
				$("#orderUserName").show();
				$("#orderUserName").val("");
				$("#orderUserIdCard").show();
				$("#orderUserIdCard").val("");
				$("#orderUserAddr").show();
				$("#orderUserAddr").val("");
				$("#orderUserQryBtn").show();
				$("#chooseUserBt").removeClass("btna_o").addClass("btna_g");
				$('#chooseUserBt').off('click');
				if (query.common.queryPropertiesStatus("CHECK_RULES_" + (ec.util.isObj(OrderInfo.staff.areaId) ? OrderInfo.staff.areaId.substr(0, 3) : "")) && CacheData.isInCheckRuleByTypeCd(identidiesTypeCd)) {
	                $("#" + id).removeAttr("onkeyup");
	                $("#" + id).attr("placeHolder", "请输入合法" + CacheData.getCheckRuleByKey(identidiesTypeCd, "name"));
	                $("#" + id).attr("data-validate", "validate(" + CacheData.getCheckRuleByKey(identidiesTypeCd, "checkFunction") + ":" + CacheData.getCheckRuleByKey(identidiesTypeCd, "description") + ") on(blur)");
	            }
				$("#syrCertCheckForm").off().bind('formIsValid', function(event, form){
					_qryUserCustInfo();
				}).ketchup({bindElement:"orderUserQryBtn"});	
			};
		};
		
		_custcreateButton();
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
		});
		if($("#custListTable").attr("custInfoSize")=="1"){
			$(".usersearchcon").hide();
		}
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
//		if(order.cust.jumpAuthflag!="0"){
//			$.alert("提示","没有跳过校验权限！");
//			return;
//		}
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
		_choosedCustInfo= {
				custId : $(scope).attr("custId"), //$(scope).find("td:eq(3)").text(),
				partyName : $(scope).attr("partyName"), //$(scope).find("td:eq(0)").text(),
				CN : $(scope).attr("CN"),
				address: $(scope).attr("address"),
				certNum: $(scope).attr("certNum"),
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
			var isGovCust = false;
			for (var i = 0; i < CacheData.getGovCertType().length; i ++) {
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
				var pCustIdentityCd = $("#p_cust_identityCd_choose").val();//$("#p_cust_identityCd").val();
				$("#auth5 #idCardType2").text(_choosedCustInfo.identityName);
				if (_choosedCustInfo.identityCd == "1") {
					$("#auth5 #readCertBtnID5").show();
					$("#auth5 #idCardNumber5").attr("disabled", "disabled");
				} else {
					$("#auth5 #readCertBtnID5").hide();
					$("#auth5 #idCardNumber5").removeAttr("disabled");
				}
				var canRealName = $(scope).attr('canrealname');
				var accessNumber=_choosedCustInfo.accNbr;
				if(-1==$("#p_cust_identityCd_choose").val()){
					accessNumber=$.trim($("#p_cust_identityNum_choose").val());
				}
				if(accessNumber!=undefined && accessNumber!=null && accessNumber!=""){
					OrderInfo.acctNbr=accessNumber;
				}
				if(!ec.util.isObj(accessNumber)){
					$("#auth_tab7").removeClass();
					$("#auth_tab8").hide();
					$("#auth_tab9").addClass("setcon");
					$("#auth_tab9").removeClass();
					$("#auth_tab9").hide();
					$("#content7").hide();
					$("#content8").show();
					$("#content9").hide();
				}else{
					$("#auth_tab7").addClass("setcon");
					$("#auth_tab8").removeClass();
					$("#auth_tab9").removeClass();
					$("#auth_tab7").show();
					$("#auth_tab8").show();
					$("#auth_tab9").show();
					$("#content7").show();
					$("#content8").hide();
					$("#content9").hide();
				}
				//初始化弹出窗口
				$("#auth5 #authPassword2").val("");
				$("#auth5 #idCardNumber2").val("");
				$("#auth5 #smspwd2").val("");
				var menuName = $("#menuName").attr("menuName");
				if ((ec.util.isObj(canRealName) && 1 == canRealName)||(ec.util.isObj(menuName)&&(CONST.MENU_FANDANG==menuName||CONST.MENU_CUSTFANDANG==menuName))) {
					easyDialog.open({
						container: 'auth5',
						callback: function () {
							order.cust.queryForChooseUser = false; //关闭弹出框时重置标识位
						}
					});
				}else{
					_realCheck(contextPath);
				}
				if(order.cust.jumpAuthflag=="0"){
					$("#auth5 #jumpAuth").show();
				}
				$("#authClose").off("click").on("click",function(event){
					easyDialog.close();
					$("#auth5 #authPassword2").val("");
					$("#auth5 #idCardNumber2").val("");
					$("#auth5 #smspwd2").val("");
				});
			} else{
				_custAuth(scope);
			}
	};
	
	//多种鉴权方式的tab页切换
	var _changeTabSub = function (id,tabId) {
		$.each($("#"+id+" #auth_tab"+tabId).parent().find("li"),function(){
			$(this).removeClass("setcon");
		});
		$("#"+id+" #auth_tab"+tabId).addClass("setcon");
		$.each($("#"+id+" #contents div"),function(){
			$(this).hide();
		});
		$("#"+id+" #content"+tabId).show();
	};
	
	//创键客户
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
			container : 'user_add'
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
		order.area.chooseAreaTree("/order/prepare","p_cust_areaId_val","p_cust_areaId",3,function(areaid,areaCode,areaName){
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
		order.area.chooseAreaTree("/order/prepare","p_cust_areaId_val_choose","p_cust_areaId_choose",3,function(areaid,areaCode,areaName){
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
		order.area.chooseAreaTree("/order/prepare","p_ncust_areaId_val","p_ncust_areaId",3);
	};
	//已订购选择地区
	var _prodChooseArea = function(){
		order.area.chooseAreaTree("/order/prepare","prodareaName","prodareaid",3);
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
		//根据开关判断是否进行经办人校验
		var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "REAL_NAME_PHOTO_" + OrderInfo.staff.areaId.substr(0, 3)});
		if (response.code == "0") {
			OrderInfo.realNamePhotoFlag = response.data;
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
		_custidentidiesTypeCdChoose($("#p_cust_identityCd").children(":first-child"),"p_cust_identityNum");
		$('#p_cust_identityNum').val(man.resultContent.certNumber);
		$('#p_cust_identityNum').attr("disabled",true);
		//查询
		$("#usersearchbtn").click();
	};
	/**
	 * 读取二代证
	 */
	function _readCertSub(){
	    if (CertCtl == null || CertCtl == undefined) {
	    	return {"resultFlag":-1,"errorMsg":"浏览器不支持读卡器"};
	    }
	    var conn = null;
	    try {
	    	var ret = CertCtl.connect();
	    	conn = JSON.parse(ret);
	    } catch(e) {
	    	conn = {"resultFlag":-1,"errorMsg":"连接读卡器失败，可能未安装驱动及控件"};
	    }
	    if (conn.resultFlag != 0) {
	        return conn;
	    }
	    var man = JSON.parse(CertCtl.readCert());
	    try {
		    CertCtl.disconnect();
	    } catch(e) {
	    }
	    return man;
	}
	//新建客户时读卡
	var _readCertWhenCreate = function() {
		var man = cert.readCert();
		if (man.resultFlag != 0){
			$.alert("提示", man.errorMsg);
			return;
		}
		$('#partyTypeCd').val(1);//个人
		_partyTypeCdChoose($("#partyTypeCd").children(":first-child"),"identidiesTypeCd");
		$('#identidiesTypeCd').val(1);//身份证类型
		_identidiesTypeCdChoose($("#identidiesTypeCd").children(":first-child"),"cCustIdCard");
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
		$('#authIDTD').attr("disabled",true);
		
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
					"accNbr":prodInstInfos.accNbr,
					"custInfos":response.data.custInfos
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
					certNum : custInfos[0].certNum,
					CN:custInfos[0].CN,
					address:custInfos[0].address,
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
		//一证五号校验
		 var inParam = {
	                "certType": OrderInfo.cust.identityCd,
	                "certNum":OrderInfo.cust.idCardNumber, 
	                "certAddress": OrderInfo.cust.addressStr,
	                "custName": OrderInfo.cust.partyName,
	                "custNameEnc": OrderInfo.cust.CN,
	                "certNumEnc": OrderInfo.cust.certNum,
	                "certAddressEnc": OrderInfo.cust.address
	            };
       if(OrderInfo.actionFlag ==0 && !order.cust.preCheckCertNumberRel("-1", inParam)){
           return false;
       }
		return true;
	};
	
	//证件鉴权-政企客户   单位证件+使用人证件
	var _identityTypeAuthSub=function(id){
		//单位证件
		var UnitCertificate=$("#idCardNumber2").val();
		if(!ec.util.isObj(UnitCertificate)){
			$.alert("提示","单位证件号码不能为空！");
			return;
		}
		//使用人证件
		var PersonCertificate=$("#idCardNumber10").val();
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
		param.identityNum = base64encode(utf16to8($.trim($("#idCardNumber2").val())));
		recordParam.validateType="5";
		recordParam.validateLevel="2";
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/token/pc/cust/custAuthSub",param);
		$.unecOverlay();
		//单位证件校验成功
		if(response.data.code=="0"){			
			//校验使用人 
			var param2 ={};
			param2.validateType="1";
			param2.accessNumber=OrderInfo.acctNbr;  //产品号码
			param2.identityCd=OrderInfo.rulesJson.identidyTypeCd;  //证件类型
			param2.areaId=OrderInfo.cust.areaId;
			param2.custId=OrderInfo.rulesJson.useCustId;//OrderInfo.cust.custId;
			param2.identityNum = base64encode(utf16to8($.trim($("#idCardNumber10").val())));
			$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
			var response= $.callServiceAsJson(contextPath+"/token/pc/cust/custAuthSub",param2);
			$.unecOverlay();
			if(response.data.code=="0"){
				//使用人证件校验成功
				//成功
				OrderInfo.authRecord.validateType="5";
				OrderInfo.authRecord.resultCode="0";
				_saveAuthRecordSuccess(recordParam);
		         if($.browser.msie) {
						   $("#auth2").css('display','none');
				            
						} else {
							easyDialog.close();
						}
					_goService();
			}
			else{
				//错误
				_saveAuthRecordFail(recordParam);
				$.alert("提示",response.data.errData);
			}
		}
		else{
			//错误
			_saveAuthRecordFail(recordParam);
			$.alert("提示",response.data.errData);
		}
		
	}
	
	
	//证件鉴权--证件类型
	var _identityTypeAuth=function(id){
		if(id==2){
		//判断是否是自营渠道
		if(!order.cust.isSelfChannel()){
			 $("#idCardNumber2").attr("readonly","readonly");
			 $.alert("提示","请到电信自有营业厅办理业务");
			 return;
		}
		}
		var param = _choosedCustInfo;
		var recordParam={};
		param.validateType="1";
	    //param.identityNum = base64encode($.trim($("#idCardNumber"+id).val()));
		param.identityNum = base64encode(utf16to8($.trim($("#idCardNumber"+id).val()))); 
		if(!ec.util.isObj(param.identityNum)){
			$.alert("提示","证件号码不能为空！");
			return;
		}
	   if(id==5){
		    param.accessNumber=_choosedCustInfo.accNbr;
	   		param.identityCd=_choosedCustInfo.identityCd;
	   		param.areaId=_choosedCustInfo.areaId;
	   		param.custId=_choosedCustInfo.custId;
	    	recordParam.custId=_choosedCustInfo.custId;
	  		recordParam.accessNbr=_choosedCustInfo.acctNbr;
	  		recordParam.certType=_choosedCustInfo.identityCd;
	  		recordParam.certNumber=_choosedCustInfo.idCardNumber;
			recordParam.validateType="1";
	   }
	   else{
		    //使用人证件鉴权
		    if(id==11){
		    	param.identityCd=OrderInfo.rulesJson.identidyTypeCd;  //证件类型
		    	param.custId=OrderInfo.rulesJson.useCustId;
		    	recordParam.validateType=6;
		    }
		    else{
		    	recordParam.validateType=1;
		    	param.identityCd=OrderInfo.cust.identityCd;
		    	param.custId=OrderInfo.cust.custId;
		    }
		    param.accessNumber=OrderInfo.acctNbr;
			param.areaId=OrderInfo.cust.areaId;
			
			
			recordParam.custId=OrderInfo.cust.custId;
			recordParam.accessNbr=OrderInfo.acctNbr;
			recordParam.certType=OrderInfo.cust.identityCd;
			recordParam.certNumber=OrderInfo.cust.idCardNumber;
	   }
      

		recordParam.validateLevel="2";
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/token/pc/cust/custAuthSub",param);
		$.unecOverlay();
		
		if(response.data.code=="0"){
			//成功
			OrderInfo.authRecord.validateType="3";
			OrderInfo.authRecord.resultCode="0";
			_saveAuthRecordSuccess(recordParam);
			if(id==5){
				//鉴权成功后显示选择使用人弹出框
				order.main.showChooseUserDialog(_choosedCustInfo);
			}
			else {
				
				if($.browser.msie) {
					   $("#auth2").css('display','none');
			            
					} else {
						easyDialog.close();
					}
				_goService();
			}
			
		}else{
			//错误
			_saveAuthRecordFail(recordParam);
			$.alert("提示",response.data.errData);
		}
	};
	//客户鉴权--产品密码
	var _productPwdAuth=function(id){

		var param = _choosedCustInfo;
		var recordParam={};
		param.prodPwd = $.trim($("#authPassword"+id).val());
		if(!ec.util.isObj(param.prodPwd)){
			$.alert("提示","产品密码不能为空！");
			return;
		}
		param.validateType = "3";
		if(id==5){
			param.accessNumber=_choosedCustInfo.accNbr;
			param.identityCd=_choosedCustInfo.identityCd;
			param.idCardNumber=_choosedCustInfo.idCardNumber;
			param.areaId=_choosedCustInfo.areaId;
			param.custId=_choosedCustInfo.custId;
		}
		else{
			param.accessNumber=OrderInfo.acctNbr;
			param.identityCd=OrderInfo.cust.identityCd;
			param.idCardNumber=OrderInfo.cust.idCardNumber;
			param.areaId=OrderInfo.cust.areaId;
			param.custId=OrderInfo.cust.custId;
		}
		
		
		
		recordParam.validateType="3";
		recordParam.validateLevel="2";
		recordParam.custId=OrderInfo.cust.custId;
		recordParam.accessNbr=OrderInfo.acctNbr;
		recordParam.certType=OrderInfo.cust.identityCd;
		recordParam.certNumber=OrderInfo.cust.idCardNumber;
		$.ecOverlay("<strong>正在校验中,请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath+"/token/pc/cust/custAuthSub",param);
		$.unecOverlay();
		//_saveAuthRecordFail(recordParam);  错误
		// _saveAuthRecordSuccess(recordParam);成功
		
		if(response.data.isValidate=="true"){
			//成功
			OrderInfo.authRecord.validateType="3";
			OrderInfo.authRecord.resultCode="0";
			_saveAuthRecordSuccess(recordParam);
			if(id==2){
				if($.browser.msie) {
					   $("#auth2").css('display','none');
			            
					} else {
						easyDialog.close();
					}
				_goService();
			}
			else{
				//鉴权成功后显示选择使用人弹出框
				order.main.showChooseUserDialog(_choosedCustInfo);
			}
			
			
		}else{
			//错误
			_saveAuthRecordFail(recordParam);
			$.alertM(response.data);
		}
		
	};
	//用户鉴权时读卡二次业务  /custAuthSub
	var _readCertWhenAuth2 = function(id) {

		if (CertCtl == null || CertCtl == undefined) {
	    	return {"resultFlag":-1,"errorMsg":"浏览器不支持读卡器"};
	    }
	    var conn = null;
	    try {
	    	var ret = CertCtl.connect();
	    	conn = JSON.parse(ret);
	    } catch(e) {
	    	conn = {"resultFlag":-1,"errorMsg":"连接读卡器失败，可能未安装驱动及控件"};
	    	$.alert("提示",conn.errorMsg);
	    	return ;
	    }
	    if (conn.resultFlag != 0) {
	        return conn;
	    }
	    if(conn.isCloud==0)
	    {
	    	_readCertCloud(id);
	    }
	    else{
	    	  var  man = JSON.parse(CertCtl.readCert());
		  	    try {
		  		    CertCtl.disconnect();
		  	    } catch(e) {
		  	    }
		  	  if (man.resultFlag != 0){
					$.alert("提示", man.errorMsg);
					return;
				}
				$('#idCardNumber'+id).val(man.resultContent.certNumber);
	    }
	
		
	};
	//跳过鉴权
	var _jumpAuth2 = function() {
		var checkType  = "";
		if(OrderInfo.actionFlag==2){//套餐变更
			checkType = "1";
		}else if(OrderInfo.actionFlag==6){//主副卡成员变更
			checkType = "4";
		}else if(OrderInfo.actionFlag==3){//可选包变更
			checkType = "3";
		}
		OrderInfo.prodAttrs = [];
		if(checkType !=""){
			//查分省前置校验开关
	        var propertiesKey = "TOKENPRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
	        var isPCF = offerChange.queryPortalProperties(propertiesKey);
	        if(isPCF == "ON"){
	        	if(OrderInfo.preBefore.prcFlag != "Y"){
	        		if(!order.prodModify.preCheckBeforeOrder(checkType,"order.cust.jumpAuth2")){
	            		return ;
	            	}
	        	}
	        }
	        OrderInfo.preBefore.prcFlag = "";
		}
		
        if($.browser.msie) {
 		   $("#auth2").css('display','none');
             
 		} else {
 			easyDialog.close();
 		}
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
			
			//如果是套餐变更
			if(OrderInfo.actionFlag==2){
				if(OrderInfo.offid!="" && OrderInfo.offid!=null && OrderInfo.offid!="null"){
					order.uiCustes.linkQueryOffer();
					
				}
				else{
					offerChange.init();
				}
				
			}
			//主副卡
			else if(OrderInfo.actionFlag==6){
				
				order.memberChange.showOfferCfgDialog();
			}
			//可选包
			else if(OrderInfo.actionFlag==3){
				order.uiCust.orderAttachOffer();
			}
		    //新装
			else if(OrderInfo.actionFlag==1){
				if(OrderInfo.offid!="" && OrderInfo.offid!=null && OrderInfo.offid!="null"){
					order.service.initSpec();
					order.prodOffer.init();
					order.service.searchPack();
					order.phoneNumber.resetBoProdAn();
					order.service.buyService(OrderInfo.offid,"");
				}
				else{
					order.prepare.createorderlonger();
					order.service.initSpec();
					order.prodOffer.init();
					order.service.searchPack();
					order.phoneNumber.resetBoProdAn();
				}
			}
			OrderInfo.authRecord.resultCode = "";
			OrderInfo.authRecord.validateType = "";
		}
	
	};

	//多种鉴权方式的tab页切换
	var _changeTab = function (tabId) {
		//如果是政企客户
		if(_isCustomers(OrderInfo.cust.identityCd)==1000 && order.prodModify.customersOnOff=="ON"){
	       //使用人证件类型非个人证件类型，请选择其它鉴权方式
			var idType=OrderInfo.rulesJson.identidyTypeCd;
			if(idType=="" || idType==undefined || idType==null || _isCustomers(idType)==1000){
				 $.alert("提示","使用人证件类型非个人证件类型，请选择其它鉴权方式");
				 return ;
			}
         }
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
		if(tabId==1){
			//判断是否是自营渠道
			if(!order.cust.isSelfChannel()){
				 $("#idCardNumber2").attr("readonly","readonly");
				 $.alert("提示","请到电信自有营业厅办理业务");
			}
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
	//短信发送
	var _smsResend = function (id) {
		var param = {
			"pageIndex": 1,
			"pageSize": 10
			
		};
		if(id==5){
             param.phone=_choosedCustInfo.accNbr;
		}
		else{
			 param.phone=OrderInfo.acctNbr;
		}
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
	var _smsvalid=function(id){
		var params="smspwd="+$("#smspwd"+id).val();
		if(!ec.util.isObj($("#smspwd"+id).val())){
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
					if(id==2){
						if($.browser.msie) {
							   $("#auth2").css('display','none');
					            
							} else {
								easyDialog.close();
							}
						_goService();
					}
					else{
						//鉴权成功后显示选择使用人弹出框
						order.main.showChooseUserDialog(_choosedCustInfo);
					}
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
		
		var checkType  = "";
		if(OrderInfo.actionFlag==2){//套餐变更
			checkType = "1";
		}else if(OrderInfo.actionFlag==6){//主副卡成员变更
			checkType = "4";
		}else if(OrderInfo.actionFlag==3){//可选包变更
			checkType = "3";
		}
		
		if(checkType !=""){
			//查分省前置校验开关
	        var propertiesKey = "TOKENPRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
		    var isPCF = offerChange.queryPortalProperties(propertiesKey);
		    if(isPCF == "ON"){
	        	if(OrderInfo.preBefore.prcFlag != "Y"){
	        		if(!order.prodModify.preCheckBeforeOrder(checkType,"order.cust.goService")){
	            		return ;
	            	}
	        	}
	        }
	        OrderInfo.preBefore.prcFlag = "";   
		}
		
			//如果是套餐变更
			if(OrderInfo.actionFlag==2){
				if(OrderInfo.offid!="" && OrderInfo.offid!=null && OrderInfo.offid!="null"){
					order.uiCustes.linkQueryOffer();
				}
				else{
					offerChange.init();
				}
				
			}
			//主副卡
			else if(OrderInfo.actionFlag==6){
				order.memberChange.showOfferCfgDialog();
			}
			//可选包
			else if(OrderInfo.actionFlag==3){
				order.uiCust.orderAttachOffer();
			}
			//新装
			else if(OrderInfo.actionFlag==1){
				if(OrderInfo.offid!="" && OrderInfo.offid!=null && OrderInfo.offid!="null"){
					order.service.initSpec();
					order.prodOffer.init();
					order.service.searchPack();
					order.phoneNumber.resetBoProdAn();
					order.service.buyService(OrderInfo.offid,"");
				}
				else{
					order.prepare.createorderlonger();
					order.service.initSpec();
					order.prodOffer.init();
					order.service.searchPack();
					order.phoneNumber.resetBoProdAn();
				}

			}
			OrderInfo.authRecord.resultCode = "";
			OrderInfo.authRecord.validateType = "";
	};
	var _isCustomers=function(id){
		  //政企客户
		  if(id==6|| id==7 || id== 15|| id==34 || id==43){
			  return 1000;
		  }
		  else{
			  return 500;
		  }
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
	// 填单页面经办人读卡
	var _readCertWhenOrder = function() {
		var man = cert.readCert();
		if (man.resultFlag != 0){
			$.alert("提示", man.errorMsg);
			return;
		}
		if (OrderInfo.realNamePhotoFlag == "ON") {//新模式
			if(man.resultContent.identityPic == null || man.resultContent.identityPic == undefined || man.resultContent.identityPic == ""){
				$.alert("提示", "当前经办人身份证照片为空，请确认");
				return;
			}
			_setValueForAgentOrderSpan(man.resultContent);
			$("#orderAttrReadCertBtn").hide();
			$("#orderAttrReset").show();
			$("#orderIdentidiesTypeCd").attr("disabled","disabled"); 
			_queryCustInfo();
			if(OrderInfo.queryCustInfo.code != 0){
				//新建需要,实名制核验
				var switchResponse = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "CHECK_CUST_CERT_" + OrderInfo.staff.soAreaId.substr(0, 3)});
			    var checkCustCertSwitch = "";
				if (switchResponse.code == "0") {
			    	checkCustCertSwitch = switchResponse.data;
			    }
				if(checkCustCertSwitch == "ON"){
					var  orderIdentidiesTypeCd = ec.util.defaultStr($("#orderIdentidiesTypeCd").val());
					var  identityNum = ec.util.defaultStr($("#orderAttrIdCard").val());
					var inParams = {
							"certType": orderIdentidiesTypeCd,
							"certNum": identityNum
						};
					var checkUrl=contextPath+"/cust/checkCustCert";
					var checkResponse = $.callServiceAsJson(checkUrl, inParams, {"before":function(){
					}});
					if (checkResponse.code == 0) {
						var result = checkResponse.data.result;
						OrderInfo.handleInfo.checkCustCertSwitch = checkCustCertSwitch;
						OrderInfo.handleInfo.checkMethod = result.checkMethod;
						OrderInfo.handleInfo.objId = "";
						OrderInfo.handleInfo.checkDate = result.checkDate;
						OrderInfo.handleInfo.checker = OrderInfo.staff.staffName;
						OrderInfo.handleInfo.checkChannel = OrderInfo.staff.channelId;
						OrderInfo.handleInfo.certCheckResult = result.certCheckResult;
						OrderInfo.handleInfo.errorMessage = result.errorMessage;
						OrderInfo.handleInfo.staffId = OrderInfo.staff.staffId;
					}else{
						$.alertM(checkResponse.data);
						return;
					}
				};
			}
			//弹出拍照弹框
			_showPhotoGraph(man.resultContent);
		}else{//老模式
			_setValueForAgentOrderSpan(man.resultContent);
		}
		
	};
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
	
	var _showPhotoGraph = function(resultContent){
		easyDialog.open({
			container : "ec-dialog-photo-graph"
		});
		easyDialog.close();
		easyDialog.open({
			container : "ec-dialog-photo-graph"
		});
		//显示身份证照片
		$("#show")[0].src="data:;base64,"+resultContent.identityPic;
		OrderInfo.handleInfo.identityPic = resultContent.identityPic;
		$("#show")[0].height=258;
		$("#show")[0].width=200;
		//初始化页面
		$("#cameraList").empty(); 
		$("#startPhotos").show();
		$("#tips").html("");
		$("#creatPic")[0].src="";
		$("#creatPic")[0].height=0;
		$("#creatPic")[0].width=0;
		//按钮灰话，不绑定事件
		$("#takePhotos").removeClass("btna_o").addClass("btna_g");
		$("#rePhotos").removeClass("btna_o").addClass("btna_g");
		$("#confirmAgree").removeClass("btna_o").addClass("btna_g");
		$("#takePhotos").off("click");
		$("#rePhotos").off("click");
		$("#confirmAgree").off("click");
		var checkCameraDriverVersionFlag = _checkCameraDriverVersion();
		if(checkCameraDriverVersionFlag){
			return;
		};
		_getCameraInfo();
	};
	var _qryCustInfo = function(resultContent){
		var  orderIdentidiesTypeCd = ec.util.defaultStr($("#orderIdentidiesTypeCd").val());
		var  identityNum = ec.util.defaultStr($("#orderAttrIdCard").val());
		var  orderAttrName = ec.util.defaultStr($("#orderAttrName").val());
		var  orderAttrAddr = ec.util.defaultStr($("#orderAttrAddr").val());
		if(orderIdentidiesTypeCd=="" || identityNum =="" || orderAttrName==""|| orderAttrAddr==""){
			$.alert("提示","经办人信息不完整，请重新填写完整！");
			return;
		}
		_queryCustInfo();
		if(OrderInfo.queryCustInfo.code != 0){
			//新建需要,实名制核验
			var switchResponse = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "CHECK_CUST_CERT_" + OrderInfo.staff.soAreaId.substr(0, 3)});
		    var checkCustCertSwitch = "";
			if (switchResponse.code == "0") {
		    	checkCustCertSwitch = switchResponse.data;
		    }
			if(checkCustCertSwitch == "ON"){
				var inParams = {
						"certType": orderIdentidiesTypeCd,
						"certNum": identityNum
					};
				var checkUrl=contextPath+"/cust/checkCustCert";
				var checkResponse = $.callServiceAsJson(checkUrl, inParams, {"before":function(){
				}});
				if (checkResponse.code == 0) {
					var result = checkResponse.data.result;
					OrderInfo.handleInfo.checkCustCertSwitch = checkCustCertSwitch;
					OrderInfo.handleInfo.checkMethod = result.checkMethod;
					OrderInfo.handleInfo.objId = "";
					OrderInfo.handleInfo.checkDate = result.checkDate;
					OrderInfo.handleInfo.checker = OrderInfo.staff.staffName;
					OrderInfo.handleInfo.checkChannel = OrderInfo.staff.channelId;
					OrderInfo.handleInfo.certCheckResult = result.certCheckResult;
					OrderInfo.handleInfo.errorMessage = result.errorMessage;
					OrderInfo.handleInfo.staffId = OrderInfo.staff.staffId;
				}else{
					$.alertM(checkResponse.data);
					return;
				}
			};
		}
		easyDialog.open({
			container : "ec-dialog-photo-graph"
		});
		easyDialog.close();
		easyDialog.open({
			container : "ec-dialog-photo-graph"
		});
		//初始化页面
		$("#orderAttrQryBtn").hide();
		$("#orderAttrReset").show();
		$("#orderIdentidiesTypeCd").attr("disabled","disabled");
		$("#orderAttrName").attr("disabled",true);
		$("#orderAttrIdCard").attr("disabled",true);
		$("#orderAttrAddr").attr("disabled",true);
		//显示默认头像
		$("#show")[0].src=contextPath+"/image/id_card.jpg";
		$("#cameraList").empty(); 
		$("#startPhotos").show();
		$("#tips").html("");
		$("#creatPic")[0].src="";
		$("#creatPic")[0].height=0;
		$("#creatPic")[0].width=0;
		//按钮灰话，不绑定事件
		$("#takePhotos").removeClass("btna_o").addClass("btna_g");
		$("#rePhotos").removeClass("btna_o").addClass("btna_g");
		$("#confirmAgree").removeClass("btna_o").addClass("btna_g");
		$("#startPhotos").off("click");
		$("#takePhotos").off("click");
		$("#rePhotos").off("click");
		$("#confirmAgree").off("click");
		var checkCameraDriverVersionFlag = _checkCameraDriverVersion();
		if(checkCameraDriverVersionFlag){
			return;
		};
		_getCameraInfo();
	};
	
	var _getCameraInfo = function(){
		//获取摄像头信息
		var device = capture.getDevices();
	    device = JSON.parse(device);
		if (device == null || device == undefined) {
			$("#tips").html("提示：请检查是否正确安装插件");
			return;
	    }
		if(device.resultFlag == 0){
			$.each(device.devices,function(){
			    $("#cameraList").append("<option value='"+this.device+"' >"+this.name+"</option>");
			});
			$("#startPhotos").off("click").on("click",function(){order.cust.startPhotos();});
		}else{
			$("#tips").html("提示："+device.errorMsg);
			return;
		}
	};
	var _startPhotos = function(){
		//创建视频
		var device = $("#cameraList").val();
		if(device!=null && device != ""){
			var createVideo = JSON.parse(capture.createVideo(device,1280,720));
			if(createVideo.resultFlag == 0){
				$("#startPhotos").hide();
				OrderInfo.isCreateVideo = "Y";
				$("#capture")[0].style.visibility = 'visible';
				$("#takePhotos").removeClass("btna_g").addClass("btna_o");
				$("#takePhotos").off("click").on("click",function(){order.cust.takePhotos();});
			}else{
				$("#tips").html("提示："+createVideo.errorMsg);
				return;
			}
		}else{
			$("#startPhotos").show();
			$("#tips").html("提示：请选择一个摄像头"); 
			return;
		}
	};
	var _takePhotos = function(resultContent){
		var device = $("#cameraList").val();
		var str=capture.createImage(device);
		var json = JSON.parse(str);
		if (json.resultFlag == 0) {
			OrderInfo.handleInfo.imageInfo = json.image;
			OrderInfo.handleInfo.venderId = json.venderId;
			OrderInfo.handleInfo.signature = json.signature;
			var param = {
				photograph : encodeURIComponent(json.image),
				venderId :json.venderId
			};
			var browserType = CacheData.getBrowserTypeVersion();
			if((browserType.indexOf("IE:8") >= 0)){
				param.photograph = encodeURIComponent(json.compImage);
			};
			var resp = $.callServiceAsJson(contextPath+"/token/pc/cust/preHandleCustCertificate", param);
			if(resp.code==0){
				var picShow = resp.data.photograph;
				var a = $("#creatPic");
				var imgshow = a[0];
				imgshow.src="data:;base64,"+picShow;
				imgshow.height=360;
				imgshow.width=640;
				//拍照后置灰按钮，取消绑定事件
				$("#takePhotos").off("click");
				$("#takePhotos").removeClass("btna_o").addClass("btna_g");
				$("#rePhotos").removeClass("btna_g").addClass("btna_o");
				$("#rePhotos").off("click").on("click",function(){order.cust.rePhotos();});
				$("#confirmAgree").removeClass("btna_g").addClass("btna_o");
				$("#confirmAgree").off("click").on("click",function(){order.cust.confirmAgree();});
			}else{
				$("#tips").html("提示："+resp.data);
				return;
			}
		} else {
			$("#tips").html("提示："+json.errorMsg);
			return;
		}
	};
	var _rePhotos = function(resultContent){
		//初始化页面
		$("#tips").html("");
		$("#creatPic")[0].src="";
		$("#creatPic")[0].height=0;
		$("#creatPic")[0].width=0;
		//拍照后置灰按钮，取消绑定事件
		$("#rePhotos").off("click");
		$("#rePhotos").removeClass("btna_o").addClass("btna_g");
		$("#confirmAgree").removeClass("btna_o").addClass("btna_g");
		$("#confirmAgree").off("click");
		$("#takePhotos").off("click").on("click",function(){order.cust.takePhotos();});
		$("#takePhotos").removeClass("btna_g").addClass("btna_o");
		_startPhotos();
	};
	var _confirmAgree = function(resultContent){
		$("#confirmAgree").removeClass("btna_o").addClass("btna_g");
		$("#confirmAgree").off("click");
		OrderInfo.subHandleInfo = {};
		var  orderIdentidiesTypeCd = ec.util.defaultStr($("#orderIdentidiesTypeCd").val());
		var  identityNum = ec.util.defaultStr($("#orderAttrIdCard").val());
		var  orderAttrName = ec.util.defaultStr($("#orderAttrName").val());
		var  orderAttrAddr = ec.util.defaultStr($("#orderAttrAddr").val());
		var  orderAttrPhoneNbr = ec.util.defaultStr($("#orderAttrPhoneNbr").val());
        var param;
        var queryCustInfo = OrderInfo.queryCustInfo;
		if(queryCustInfo.code == 0){//定位到客户，照片不下省
			param = {
			    photographs: [{
				    photograph: encodeURIComponent(OrderInfo.handleInfo.imageInfo),
				    flag: "D",//*经办人头像照片
				    signature:OrderInfo.handleInfo.signature
				}],
			    venderId  	: OrderInfo.handleInfo.venderId,//*厂商ID
				srcFlag   	: "REAL",//*来源标识(实名制拍照留存需传REAL)
				accNbr		: orderAttrPhoneNbr,
				areaId		: OrderInfo.getAreaId(),
				certNumber	: identityNum,
				certType 	: orderIdentidiesTypeCd,
				custName 	: orderAttrName,
				extSystem	: "1000000206"
			};
			OrderInfo.subHandleInfo.handleExist = "Y";
			OrderInfo.subHandleInfo.handleCustId = queryCustInfo.data.custInfos[0].custId;
        }else{//定位不到客户，用身份证，身份证的照片二进制下省
        	if($("#orderIdentidiesTypeCd").val() == 1){
        		param = {
        			    photographs: [
        			        {
        				        photograph: encodeURIComponent(OrderInfo.handleInfo.imageInfo),
        				        flag: "D",//*经办人头像照片
        				        signature:OrderInfo.handleInfo.signature},
        				    {
            				    photograph: encodeURIComponent(OrderInfo.handleInfo.identityPic),
            				    flag: "C"//*经办人身份证照片
            				}
        			    ],
        			    venderId  	: OrderInfo.handleInfo.venderId,//*厂商ID
        				srcFlag   	: "REAL",//*来源标识(实名制拍照留存需传REAL)
    					accNbr		: orderAttrPhoneNbr,
        				areaId		: OrderInfo.getAreaId(),
        				certNumber	: identityNum,
        				certType 	: orderIdentidiesTypeCd,
        				custName 	: orderAttrName,
        				extSystem	: "1000000206"
        			};
        	}else{
        		param = {
        			    photographs: [
        			        {
        				        photograph: encodeURIComponent(OrderInfo.handleInfo.imageInfo),
        				        flag: "D",//*经办人头像照片
        				        signature:OrderInfo.handleInfo.signature}
        			    ],
        			    venderId  	: OrderInfo.handleInfo.venderId,//*厂商ID
        				srcFlag   	: "REAL",//*来源标识(实名制拍照留存需传REAL)
        				accNbr		: orderAttrPhoneNbr,
        				areaId		: OrderInfo.getAreaId(),
        				certNumber	: identityNum,
        				certType 	: orderIdentidiesTypeCd,
        				custName 	: orderAttrName,
        				extSystem	: "1000000206"
        			};
        	}
        	OrderInfo.subHandleInfo.handleExist = "N";
        	OrderInfo.subHandleInfo.identidiesTypeCd = orderIdentidiesTypeCd;
        	OrderInfo.subHandleInfo.identityNum = identityNum;
        	OrderInfo.subHandleInfo.orderAttrName = orderAttrName;
        	OrderInfo.subHandleInfo.orderAttrAddr = orderAttrAddr;
        	OrderInfo.subHandleInfo.orderAttrPhoneNbr = orderAttrPhoneNbr;
        	OrderInfo.subHandleInfo.imageInfo = OrderInfo.handleInfo.identityPic;
        }
		OrderInfo.subHandleInfo.orderAttrFlag = OrderInfo.orderAttrFlag;
		var uploadCustCertificate = $.callServiceAsJson(contextPath+"/token/pc/cust/uploadCustCertificate",param);
		if(uploadCustCertificate.code == 0){
			if(OrderInfo.handleInfo.checkCustCertSwitch == "ON"){
				OrderInfo.subHandleInfo.checkCustCertSwitch = OrderInfo.handleInfo.checkCustCertSwitch;
				OrderInfo.subHandleInfo.checkMethod = OrderInfo.handleInfo.checkMethod;
				OrderInfo.subHandleInfo.objId = "";
				OrderInfo.subHandleInfo.checkDate = OrderInfo.handleInfo.checkDate;
				OrderInfo.subHandleInfo.checker = OrderInfo.staff.staffName;
				OrderInfo.subHandleInfo.checkChannel = OrderInfo.staff.channelId;
				OrderInfo.subHandleInfo.certCheckResult = OrderInfo.handleInfo.certCheckResult;
				OrderInfo.subHandleInfo.errorMessage = OrderInfo.handleInfo.errorMessage;
				OrderInfo.subHandleInfo.staffId = OrderInfo.staff.staffId;
			}
			OrderInfo.subHandleInfo.authFlag = "Y";
			OrderInfo.subHandleInfo.virOlId = uploadCustCertificate.data.virOlId;
			_closeShowPhoto();
		}else{
			OrderInfo.subHandleInfo.authFlag = "F";
			$("#confirmAgree").removeClass("btna_g").addClass("btna_o");
			$("#confirmAgree").off("click").on("click",function(){order.cust.confirmAgree();});
			if(uploadCustCertificate.code == 1){
				$("#tips").html("提示："+uploadCustCertificate.data+"请稍后再试。");
				return;
			}
			$("#tips").html("FTP上传失败，错误原因："+uploadCustCertificate.errCode+"-"+uploadCustCertificate.errMsg+"请稍后再试。");
			return;
		}
	};
	//关闭弹框
    var _closeShowPhoto = function(){
    	capture.closeVideo();
    	easyDialog.close();
	};
    document.onkeydown=function(event){
    	if(OrderInfo.isCreateVideo == "Y"){
    		var e = event || window.event || arguments.callee.caller.arguments[0];
        	if(e && e.keyCode==27){ // 按 Esc 
        		//关闭摄像头
        		capture.closeVideo();
        		return;
        	}
    	}
    }; 
    
    
    // 使用人读卡
	var _readCertWhenUser = function() {
		var man = cert.readCert();
		if (man.resultFlag != 0){
			$.alert("提示", man.errorMsg);
			return;
		}
		// 设置隐藏域的表单数据
		$('#orderUserName').val(man.resultContent.partyName);//姓名
		$('#orderUserIdCard').val(man.resultContent.certNumber);//设置身份证号
		$('#orderUserAddr').val(man.resultContent.certAddress);//地址
		// 设置文本显示
		$("#li_order_user span").text(man.resultContent.partyName);
		$("#li_order_user2 span").text(man.resultContent.certNumber);
		$("#li_order_user3 span").text(man.resultContent.certAddress);
		_qryUserCustInfo(man.resultContent);
	};
    
	var _qryUserCustInfo = function(data) {
		//客户定位
		var  orderIdentidiesTypeCd = ec.util.defaultStr($("#orderIdentidiesTypeCdB").val());
		var  identityNum = ec.util.defaultStr($("#orderUserIdCard").val());
		var  orderAttrName = ec.util.defaultStr($("#orderUserName").val());
		var  orderAttrAddr = ec.util.defaultStr($("#orderUserAddr").val());
		var  orderAttrPhoneNbr = ec.util.defaultStr($("#orderUserPhoneNbr").val());
		var  user_prodId = ec.util.defaultStr($("#user_prodId").val());
		var custParam = {
				"identityCd":orderIdentidiesTypeCd,
				"identityNum":identityNum,
				"partyName":"",
				"queryType" :""
		};
		var queryCustInfo = $.callServiceAsJson(contextPath+"/token/pc/cust/queryCustInfo", custParam);
		var userSubInfo = {};
		if(queryCustInfo.code == 0){//定位到客户,传客户ID
			userSubInfo = {
				prodId : user_prodId,
				custId : queryCustInfo.data.custInfos[0].custId,
				orderIdentidiesTypeCd : queryCustInfo.data.custInfos[0].identityCd,
    			identityNum : queryCustInfo.data.custInfos[0].idCardNumber,
    			orderAttrName : queryCustInfo.data.custInfos[0].partyName,
    			orderAttrAddr : queryCustInfo.data.custInfos[0].addressStr,
    			certNumEnc    : queryCustInfo.data.custInfos[0].certNum,
    			custNameEnc   : queryCustInfo.data.custInfos[0].CN,
    			certAddressEnc : queryCustInfo.data.custInfos[0].address,
				isOldCust : "Y"
			};
        }else{//定位不到客户C1
        	userSubInfo = {
        			prodId : user_prodId,
        			custId : -1,
        			orderIdentidiesTypeCd : orderIdentidiesTypeCd,
        			identityNum : identityNum,
        			orderAttrName : orderAttrName,
        			orderAttrAddr : orderAttrAddr,
        			orderAttrPhoneNbr : orderAttrPhoneNbr,
        			isOldCust : "N"
        		};
    		if(OrderInfo.queryCustInfo.code != 0){
    			//新建需要,实名制核验
    			var switchResponse = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "CHECK_CUST_CERT_" + OrderInfo.staff.soAreaId.substr(0, 3)});
    		    var checkCustCertSwitch = "";
    			if (switchResponse.code == "0") {
    		    	checkCustCertSwitch = switchResponse.data;
    		    }
    			if(checkCustCertSwitch == "ON"){
    				var inParams = {
    						"certType": orderIdentidiesTypeCd,
    						"certNum": identityNum
    					};
    				var checkUrl=contextPath+"/cust/checkCustCert";
    				var checkResponse = $.callServiceAsJson(checkUrl, inParams, {"before":function(){
    				}});
    				if (checkResponse.code == 0) {
    					var result = checkResponse.data.result;
    					userSubInfo.checkCustCertSwitch = checkCustCertSwitch;
    					userSubInfo.checkMethod = result.checkMethod;
    					userSubInfo.objId = "";
    					userSubInfo.checkDate = result.checkDate;
    					userSubInfo.checker = OrderInfo.staff.staffName;
    					userSubInfo.checkChannel = OrderInfo.staff.channelId;
    					userSubInfo.certCheckResult = result.certCheckResult;
    					userSubInfo.errorMessage = result.errorMessage;
    					userSubInfo.staffId = OrderInfo.staff.staffId;
    				}else{
    					$.alertM(checkResponse.data);
    					return;
    				}
    			};
    		}
        	if(orderIdentidiesTypeCd == 1){
        		userSubInfo.identityPic = data.identityPic;
        	}
        }
		var inParam = {};
        if (queryCustInfo.data.custInfos.length==0 || OrderInfo.cust.custId == "-1") {//新客户
            inParam={
                "certType": userSubInfo.orderIdentidiesTypeCd,
                "certNum": userSubInfo.identityNum,
                "certAddress": userSubInfo.orderAttrAddr,
                "custName": userSubInfo.orderAttrName
            };
        } else {//老客户
            inParam = {
            		"certType": queryCustInfo.data.custInfos[0].identityCd,
                    "certNum": queryCustInfo.data.custInfos[0].idCardNumber,
                    "certAddress": queryCustInfo.data.custInfos[0].addressStr,
                    "custName": queryCustInfo.data.custInfos[0].partyName,
                    "custNameEnc": queryCustInfo.data.custInfos[0].CN,
                    "certNumEnc": queryCustInfo.data.custInfos[0].certNum,
                    "certAddressEnc": queryCustInfo.data.custInfos[0].address
            };
        }
        if (order.cust.preCheckCertNumberRel(this.prodId, inParam)) {
        	//校验使用人添加几次
        	var userNO = 0;
        	if (ec.util.isObj(OrderInfo.subUserInfos) && OrderInfo.subUserInfos.length > 0) {//有选择使用人的情况
                $.each(OrderInfo.subUserInfos, function () {
                    if(_getCustInfo415Flag(this) == _getCustInfo415Flag(inParam)){
                    	userNO ++;
                    }
                });
            }
        	if((parseInt(userNO)+parseInt(ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,order.cust.getCustInfo415Flag(order.cust.getCustInfo415()))))>5){
                $.alert("提示","此用户下已经有"+(parseInt(userNO-1)+ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,order.cust.getCustInfo415Flag(order.cust.getCustInfo415())))+"个号码，请选择其他用户做为使用人！");
            }else{
            	$("#chooseUserBt").removeClass("btna_g").addClass("btna_o");
        		$('#chooseUserBt').off('click').on('click',function(){
        			_commitUser(userSubInfo);
        		});
            }
        }
	}; 
	
    // 使用人
	var _commitUser = function(userSubInfo) {
		var prodId = $("#user_prodId").val();
		var orderUserName = $("#orderUserName").val();
		if(userSubInfo.isOldCust == "Y"){
			$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId+'_name').val(orderUserName);
			$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId).val(userSubInfo.custId);
		}else if(userSubInfo.isOldCust == "N"){
			var instId = OrderInfo.SEQ.offerSeq--;
			userSubInfo.instId = instId;
			$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId+'_name').val("[新增]"+orderUserName);
			$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId).val(instId);
		};
		var  orderAttrPhoneNbr = ec.util.defaultStr($("#orderUserPhoneNbr").val());
		userSubInfo.orderAttrPhoneNbr = orderAttrPhoneNbr;
		for(var i=0;i<OrderInfo.subUserInfos.length;i++){
            if(OrderInfo.subUserInfos[i].prodId == userSubInfo.prodId ){
                OrderInfo.subUserInfos.splice(i,1);//从下标为i的元素开始，连续删除1个元素
                i--;//因为删除下标为i的元素后，该位置又被新的元素所占据，所以要重新检测该位置
            }
        }
		OrderInfo.subUserInfos.push(userSubInfo);
		easyDialog.close();
	};
    
	 //检查版本是否需要更新
	var _checkCameraDriverVersion = function() {
		var camVer = JSON.parse(capture.getVersion());
		var param = null;
		var resultFlag = false;
		if(camVer != null){
			if(camVer.resultFlag == 0){
				param = {
					"versionSerial"	:camVer.versionSerial,//*控件版本号
					"venderId"		:camVer.venderId//*厂商ID
				};
			}
		}
		if(param != null){
			var versionSerial = param.versionSerial;
			var venderId = param.venderId;
			if(versionSerial == null || versionSerial == undefined || versionSerial == "" || venderId == null || venderId == undefined || venderId == ""){
				resultFlag = true;
				$("#tips").html("错误："+"拍照仪驱动版本更新校验失败：入参为空！");
			} else{
				var response = $.callServiceAsJson(contextPath + "/common/checkCameraDriverVersion", param);
				if (response.code == 0) {
					var cameraDriverInfo = response.data;
					if(cameraDriverInfo.update){//需要更新驱动
						resultFlag = true;
						var alertMsg = "请点击“下载控件”更新驱动，更新后需清除缓存、重启浏览器。";
						$("#tips").html("提示："+alertMsg);
					}
				} else if (response.code == 1){
					resultFlag = true;
					$("#tips").html("错误："+response.data);

				}
			}
		} else{
			resultFlag = true;
			$("#tips").html("错误："+"拍照仪驱动版本更新校验失败：入参为空！");
		}
		return resultFlag;
	};
	
	 //经办人重置按钮
	var _orderAttrReset = function() {
		var identidiesTypeCd=$("#orderIdentidiesTypeCd").val();//OrderInfo.cust.identityCd;
		if(identidiesTypeCd==1){
			$("#orderAttrReset").hide();
			$("#orderAttrReadCertBtn").show();
			$("#orderIdentidiesTypeCd").removeAttr("disabled");
			
			$('#orderAttrName').val("");//姓名
			$('#orderAttrIdCard').val("");//设置身份证号
			$('#orderAttrAddr').val("");//地址
			// 设置文本显示
			$("#li_order_attr span").text("");
			$("#li_order_remark2 span").text("");
			$("#li_order_remark3 span").text("");
		}else{
			//初始化页面
			$("#orderAttrReset").hide();
			$("#orderAttrQryBtn").show();
			$("#orderIdentidiesTypeCd").removeAttr("disabled");
			$("#orderAttrName").removeAttr("disabled");
			$("#orderAttrIdCard").removeAttr("disabled");
			$("#orderAttrAddr").removeAttr("disabled");
			$('#orderAttrName').val("");//姓名
			$('#orderAttrIdCard').val("");//证件号
			$('#orderAttrAddr').val("");//地址
		}
		OrderInfo.subHandleInfo = {};
	};
	 //客户定位
	var _queryCustInfo = function() {
		//客户定位
		var  orderIdentidiesTypeCd = ec.util.defaultStr($("#orderIdentidiesTypeCd").val());
		var  identityNum = ec.util.defaultStr($("#orderAttrIdCard").val());
		var custParam = {
				"identityCd":orderIdentidiesTypeCd,
				"identityNum":identityNum,
				"partyName":"",
				"queryType" :""
		};
		var queryCustInfo = $.callServiceAsJson(contextPath+"/token/pc/cust/queryCustInfo", custParam);
		OrderInfo.queryCustInfo = queryCustInfo;
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
        return inParam;
    };

	
    /**
     * 证号关系预校验接口
     */
    var _preCheckCertNumberRel = function (prodId, inParam) {
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
            	if (ec.util.isObj(result)) {
            		ec.util.mapPut(OrderInfo.oneCardFiveNO.usedNum, _getCustInfo415Flag(inParam), result.usedNum);
            		if(parseInt(result.usedNum)>=5 && OrderInfo.actionFlag ==0){
                		$.alert("提示", "工信部要求支撑全国实名制一证五卡验证,一个用户证件下不能有超过5个号码！");
                		checkResult = false;
                	}else if(parseInt(result.usedNum) <5 && OrderInfo.oneCardFiveNum.length<=0){
                		checkResult=true;
                	}else if(parseInt(result.usedNum)>=5 && OrderInfo.actionFlag !=0){//应该可以直接else，由于是补丁，只能新加
                		checkResult=true;
                	}
                	if(OrderInfo.oneCardFiveNum.length>0){
                		 $.each(OrderInfo.oneCardFiveNum, function () {
                			 var oneCard = this;
                			 if(inParam.certNum ==oneCard.certNum){
                				 if ((parseInt(result.usedNum) + oneCard.oneCertFiveNO) <=5) {
                	                    checkResult=true;
                	                } else {
                	                	 checkResult = false;
                	                	 OrderInfo.oneCardFiveNum = [];
                	                    $.alert("提示", "工信部要求支撑全国实名制一证五卡验证,一个用户证件下不能有超过5个号码！");
                	                    return checkResult;
                	                }
                			 }
                		 });
                	}
                }
            }
        } else {
            $.alertM(response.data);
        }
        return checkResult;
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
	
	return {
		saveAuthRecordFail:_saveAuthRecordFail,
		saveAuthRecordSuccess:_saveAuthRecordSuccess,
		saveAuthRecord:_saveAuthRecord,
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
		queryForChooseUser : _queryForChooseUser,
		queryCustCompreInfo:_queryCustCompreInfo,
		isCovCust:_isCovCust,
		productPwdAuth:_productPwdAuth,
		changeTab:_changeTab,
		smsResend:_smsResend,
		smsvalid:_smsvalid,
		jumpAuth2:_jumpAuth2,
		identityTypeAuth:_identityTypeAuth,
		readCertWhenAuth2:_readCertWhenAuth2,
		isSelfChannel:_isSelfChannel,
		changeTabSub:_changeTabSub,
		goService:_goService,
		identityTypeAuthSub:_identityTypeAuthSub,
		readCertWhenOrder:_readCertWhenOrder,
		qryCustInfo:_qryCustInfo,
		startPhotos:_startPhotos,
		takePhotos:_takePhotos,
		rePhotos:_rePhotos,
		confirmAgree:_confirmAgree,
		closeShowPhoto:_closeShowPhoto,
		readCertWhenUser:_readCertWhenUser,
		qryUserCustInfo:_qryUserCustInfo,
		commitUser:_commitUser,
		orderAttrReset:_orderAttrReset,
		getCustInfo415 : _getCustInfo415,
		preCheckCertNumberRel : _preCheckCertNumberRel,
		getCustInfo415Flag : _getCustInfo415Flag
	};
})();
$(function() {
//   order.cust.form_valid_init();
	order.cust.initDic();
});
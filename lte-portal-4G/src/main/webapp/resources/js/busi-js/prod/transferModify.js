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
		OrderInfo.busitypeflag=15;
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
		if(OrderInfo.authRecord.resultCode!="0"){
			if (order.prodModify.querySecondBusinessAuth("11", "Y", "prod.transferModify.showCustTransferReturn")) {
				return;
			}
		}

		if(order.prodModify.choosedProdInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","当前产品状态不是【在用】,不允许受理该业务！");
			return;
		}
		OrderInfo.busitypeflag=0;
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
				acctNbr : order.prodModify.choosedProdInfo.accNbr,
				areaId : order.prodModify.choosedProdInfo.areaId
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
						areaId : order.prodModify.choosedProdInfo.areaId,						
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
				            	areaId : order.prodModify.choosedProdInfo.areaId,  
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
					areaId : order.prodModify.choosedProdInfo.areaId,	
					boActionType : {
						actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION, //动作大类：产品动作
						boActionTypeCd : _BO_ACTION_TYPE //动作小类：过户
					},
					busiObj : {				        
						accessNumber : order.prodModify.choosedProdInfo.accNbr,			        
						instId : order.prodModify.choosedProdInfo.prodInstId,			        
						isComp : "N",			        
						objId : order.prodModify.choosedProdInfo.productId,			        
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
						areaId : order.prodModify.choosedProdInfo.areaId,  //受理地区ID		
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
				OrderInfo.createAcct(busiOrder, -1);
			}
			//更换帐户节点
			if(changeAcct){
				var transferAcct = {
						areaId : order.prodModify.choosedProdInfo.areaId,
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION, //动作大类：产品动作
							boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_ACCOUNT //动作小类：改帐务定制关系
						}, 
						busiObj : {				        
							accessNumber : order.prodModify.choosedProdInfo.accNbr,			        
							instId : order.prodModify.choosedProdInfo.prodInstId,			        
							isComp : "N",			        
							objId : order.prodModify.choosedProdInfo.productId,			        
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
	//物联网过户订单提交
	var _iotCustTransfer_Submit = function() {

		var param={
			"acctOrderItemGrp":{
				"acctInfos":{
					"acctName":$("#acctName").val(),
					"acctNumber":"-1",
					"action":"ADD",
					"payMethod":$("#paymentType").val(),
					"attrInfos":{
						"attrSpecId":$("#iot_liProduct").attr("attrinfosattrspecid"),
						"attrValue":$("#iot_liProduct").attr("attrInfosattrValueId"),
						"action":"ADD"
					}
				}
			},
			"custOrderInfo":{
				"custNumber":$("#iot_liCust").attr("custNumber")
			},
			"custOrderItemGrp":{
				"custInfo":{
					"action":"ADD",
					"certAddress":$("#transfercAddressStr").val(),
					"certNumber":$("#transfercCustIdCard").val(),
					"certType":$("#div_tra_identidiesTypeCd").val(),
					"custName":$("#transfercCustName").val(),
					"custNumber":"-1",
					"custType":$("#div_tra_partyTypeCd").val()
				}
			},
			"prodOrderItemGrp":{
				"prodInfo":{
					"acctNumber":"-1",
					"custNumber":"-1",
					"logicLanId":"8320100",
					"prodInstId":$("#iot_liProduct").attr("prodInstId"),
					"attrInfos":{
						"attrSpecId":$("#iot_liProduct").attr("attrinfosattrspecid"),
						"attrValue":$("#iot_liProduct").attr("attrInfosattrValueId")
					}
				}
			}
		};

		if(!ec.util.isObj($("#iot_liCust").attr("custNumber"))){
			$.alert("提示","请先定位原客户！");
			return;
		}
		if(!ec.util.isObj($("#transfercCustName").val())){
			$.alert("提示","客户姓名不能为空！");
			return;
		}
		if(!ec.util.isObj($("#transfercCustIdCard").val())){
			$.alert("提示","证件号码不能为空！");
			return;
		}
		if(!ec.util.isObj($("#transfercAddressStr").val())){
			$.alert("提示","客户地址不能为空！");
			return;
		}
		if(!ec.util.isObj($("#acctName").val())){
			$.alert("提示","帐户名称不能为空！");
			return;
		}
		$.callServiceAsJson(contextPath+"/order/orderSubmit4iot",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code ==0) {
					$.alert("提示","订单提交成功！","confirmation", function () {
						window.location=contextPath+"/order/prodModify/custTransfe4iot";
					});
					return;
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("错误",response.data,"error");
					return;
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","订单提交失败！");
			},"always":function(){
				$.unecOverlay();
			}
		});


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
		//每次更换证件类型，置空证件号码输入框的内容
		$("#transfercCustIdCard").val("");
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
		
		//如果是身份证，则禁止输入，否则启用输入控件
		var isID = identidiesTypeCd==1;
		var isIdTypeOff = OrderInfo.staff.idType=="OFF";
		$('#transfercCustName').attr("disabled",isID&&(!isIdTypeOff));
		$('#transfercCustIdCard').attr("disabled",isID&&(!isIdTypeOff));
		$('#transfercAddressStr').attr("disabled",isID&&(!isIdTypeOff));
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
		//物联网过户至客户定位按钮
	var _iotFormCustTransferBtn = function() {
			var identityCd=$("#iot_p_cust_tra_identityCd").val();
			var identityNum=$.trim($("#iotTransferNum").val());
			if(identityNum==""){
				$.alert("提示","请输入查询条件！");
				return;
			}

			var param = {
					"identityCd":identityCd,
					"identityNum":identityNum
			};
			$.callServiceAsHtml(contextPath+"/order/prodModify/transferQueryCust4iot",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				}, "done": function (response) {
					if (response.code == 0) {
						var iotCustTransferInfo = $("#iotCustTransferInfo");
						iotCustTransferInfo.html(response.data).show();
					} else {
						$.alert("提示", "查询失败,稍后重试");
						return;
					}
				},fail:function(response){
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				},"always":function(){
					$.unecOverlay();
					$("#usersearchbtn").attr("disabled",false);
				}
			});
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
				if(response.data.indexOf("false") >=0) {
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
				if(response.data.indexOf("false") >=0) {
					$.alert("提示","抱歉，您输入的密码有误，请重新输入。");
					return;
				}
				_transferCreatedCustInfos = {
					cCustName:createCustInfo.cCustName,
					cCustIdCard:createCustInfo.cCustIdCard,
					cAddressStr:createCustInfo.cAddressStr,
					partyTypeCd:$("#div_tra_partyTypeCd").val(),
					identidiesTypeCd:$("#div_tra_identidiesTypeCd").val()
				};
				_custAuthCallBack(response);
			},"always":function(){
				$.unecOverlay();
			}
		});
	}).ketchup({bindElement:"ransferAddcustsussbtn"});
	};
	//过户客户定位查询列表
	var _queryCallBack = function(response) {
		if(response.data.indexOf("false") >=0) {
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
	var _transferCreatedCustInfos = null;
	var _userAddClosed = function() {
		$("#transfercCustName").val("");
		$("#transfercCustIdCard").val("");
		$("#transfercAddressStr").val("");
		authFlag="";
		if($.ketchup)
			$.ketchup.hideAllErrorContainer($("#ransferCustCreateForm"));
	};
	var _showCustCreate = function(scope) {
		easyDialog.open({
			container : 'transfer_cust_add',
			callback : _userAddClosed
		});
		_partyTypeCdChoose($("#div_tra_partyTypeCd").children(":first-child"));
		
		if (_transferCreatedCustInfos) {
			$('#div_tra_partyTypeCd').val(_transferCreatedCustInfos.partyTypeCd);//个人
			prod.transferModify.partyTypeCdChoose($("#div_tra_partyTypeCd option[value='"+_transferCreatedCustInfos.partyTypeCd+"']"));
			$('#div_tra_identidiesTypeCd').val(_transferCreatedCustInfos.identidiesTypeCd);//身份证类型
			prod.transferModify.identidiesTypeCdChoose($("#div_tra_identidiesTypeCd option[value='"+_transferCreatedCustInfos.identidiesTypeCd+"']"));
			$('#transfercCustIdCard').val(_transferCreatedCustInfos.cCustIdCard);//设置身份证号
			$('#transfercCustName').val(_transferCreatedCustInfos.cCustName);//姓名
			$('#transfercAddressStr').val(_transferCreatedCustInfos.cAddressStr);//地址
		}
		
		$("#usercreateclose").off("click").on("click",function(event){
			easyDialog.close();
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
								$("<option>").text(accountInfo.name+" : "+accountInfo.accountNumber).attr("value",accountInfo.acctId).attr("acctcd",accountInfo.accountNumber).appendTo($("#acctSelect"));
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
		_transferCreatedCustInfos = null;
		if(OrderInfo.staff.idType=="OFF"){
			$("#readCertTransferBtn").hide();
			$("#readCertTransferBtnCreate").hide();
		}
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
	//定位客户时读卡
	var _readCert = function() {
		var man = cert.readCert();
		if (man.resultFlag != 0){
			$.alert("提示", man.errorMsg);
			return;
		}
		$('#p_cust_tra_identityCd').val(1);//身份证类型
		order.cust.custidentidiesTypeCdChoose($("#p_cust_tra_identityCd option[value='1']"),"TransferNum");
		$('#TransferNum').val(man.resultContent.certNumber);
		order.cust.showReadCert(man, "custTransferBtn");
		//查询
//		$("#custTransferBtn").click();
	};
	//新建客户时读卡
	var _readCertWhenCreate = function() {
		var man = cert.readCert();
		if (man.resultFlag != 0){
			$.alert("提示", man.errorMsg);
			return;
		}
		$('#div_tra_partyTypeCd').val(1);//个人
		prod.transferModify.partyTypeCdChoose($("#div_tra_partyTypeCd option[value='1']"));
		$('#div_tra_identidiesTypeCd').val(1);//身份证类型
		prod.transferModify.identidiesTypeCdChoose($("#div_tra_identidiesTypeCd option[value='1']"));
		$('#transfercCustName').val(man.resultContent.partyName);//姓名
		$('#transfercCustIdCard').val(man.resultContent.certNumber);//设置身份证号
		$('#transfercAddressStr').val(man.resultContent.certAddress);//地址
	};

	return {
		showCustTransfer : _showCustTransfer,
		custTransfer : _custTransfer,
		showCustCreate :_showCustCreate,
		custTransfer_Submit :_custTransfer_Submit,
		iotCustTransfer_Submit :_iotCustTransfer_Submit,
		jumpAuth:_jumpAuth,
		partyTypeCdChoose :_partyTypeCdChoose,
		identidiesTypeCdChoose :_identidiesTypeCdChoose,
		iotFormCustTransferBtn :_iotFormCustTransferBtn,
		initDic :_initDic,
		showCustTransferReturn :_showCustTransferReturn,
		showCustAuth :_showCustAuth,
		readCert : _readCert,
		readCertWhenCreate : _readCertWhenCreate,
		certTypeByPartyType:_certTypeByPartyType
	};
})();
$(function(){
	prod.transferModify.initDic();
	//客户类型关联证件类型下拉框
	$("#div_tra_identidiesTypeCd").empty();
	prod.transferModify.certTypeByPartyType(1);
	prod.transferModify.identidiesTypeCdChoose($("#div_tra_identidiesTypeCd").children(":first-child"));
});
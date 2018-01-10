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
	//返档改造开关标记
	var _returnFlag=false;
	var _toCustName="";
	var _transchoosedCustInfo={};
	var _BO_ACTION_TYPE="";
	//选中的帐户信息
	var _choosedAcctInfo = {};
	var _realUserFlag = "";
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
		OrderInfo.prodAttrs = [];
		if(OrderInfo.authRecord.resultCode!="0"){
			if (order.prodModify.querySecondBusinessAuth("11", "Y", "prod.transferModify.showCustTransferReturn")) {
				return;
			}
		}

		if(order.prodModify.choosedProdInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","当前产品状态不是【在用】,不允许受理该业务！");
			return;
		}
		
		//查分省前置校验开关
        var propertiesKey = "PRECHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
        var isPCF = offerChange.queryPortalProperties(propertiesKey);
        if(isPCF == "ON"){
        	if(OrderInfo.preBefore.prcFlag != "Y"){
        		if(!order.prodModify.preCheckBeforeOrder("11","prod.transferModify.showCustTransferReturn")){
            		return ;
            	}
        	}
        }
        OrderInfo.preBefore.prcFlag = "";
        
		OrderInfo.busitypeflag=49;
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
		var nameCN = $("#litransCustId").attr("CN");
		var toIdentidiesTypeCd = $("#p_cust_tra_identityCd").val();
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
        //一证五号校验
        if(!_transOneCertFiveNumCheck(toCustId,toIdentidiesTypeCd,toIdCardNumber,toCustName,toAddressStr)){
		    return;
        }

        var acctId = $("#acctSelect").val(); //要更换的帐户ID
		var acctCd = -1;
		if(acctId>0){
			acctCd = $("#acctSelect").find("option:selected").attr("acctcd"); //要更换的帐户合同号
		}
		var subUserInfos = OrderInfo.subUserInfos;
		var choosedUserInfos = OrderInfo.choosedUserInfos;
		SoOrder.builder(CONST.returnCustSubmitFlag);//返档在订单提交时才初始化订单数据，特殊，增加标识
		OrderInfo.subUserInfos = subUserInfos;
		OrderInfo.choosedUserInfos = choosedUserInfos;
		//返档要求partyId取返档后客户ID，做特殊处理redmine 794183
		OrderInfo.orderData.orderList.orderListInfo.partyId = _toCustId;
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
        OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,_BO_ACTION_TYPE,43,CONST.getBoActionTypeName(_BO_ACTION_TYPE),"");
			
			var busiOrder = [	];
			//新建客户节点
			if(toCustId==""){
				var boCustIdentitie = {
					identidiesTypeCd : toIdentidiesTypeCd,	//证件类型编码			                
					identityNum : toIdCardNumber, //证件号码
					defaultIdType :toIdentidiesTypeCd,	//证件类型编码		
					state : "ADD"
				};
				if ("1" === toIdentidiesTypeCd) { //身份证
					var identityPic = $("#img_ransferCustPhoto").data("identityPic");
					if (identityPic != undefined) {
						boCustIdentitie.identidiesPic = identityPic;
					}
				}
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
							boCustIdentities: [boCustIdentitie],
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
			            boProdStatuses : [{
							prodStatusCd : CONST.PROD_STATUS_CD.READY_PROD,
							state : "DEL"
						},{
							prodStatusCd : CONST.PROD_STATUS_CD.DONE_PROD,
							state : "ADD"
						}
						],
			            busiOrderAttrs : [{			            				    				
			            	itemSpecId : "111111118",	    				
			            	value : $("#order_remark").val() //订单备注		    			
			            }],
			            boProdItems : []
					}
			};
			var  boProdItems = [];
			//使用人新模式
			if($("#800000011_-1_name").val()!=null && $("#800000011_-1_name").val()!= ''){//选择了使用人
				if(_realUserFlag == "ON"){
			        var subUserInfo = subUserInfos[0];
			        if(subUserInfo.isOldCust == "N"){
				        var busiOrderUser = {
					        areaId	: order.prodModify.choosedProdInfo.areaId,// 受理地区ID
					        busiOrderInfo : {
						        seq : OrderInfo.SEQ.seq--
					        },
					        busiObj : { // 业务对象节点
						        instId		: subUserInfo.custId,
						        accessNumber: order.prodModify.choosedProdInfo.accNbr
					        },
					        boActionType : {
						        actionClassCd	: CONST.ACTION_CLASS_CD.CUST_ACTION,
						        boActionTypeCd	: CONST.BO_ACTION_TYPE.CUST_CREATE
					        },
					        data : {
						        boCustInfos 		: [],
						        boCustIdentities	: [],
						        boPartyContactInfo	: [],
						        boCustCheckLogs     : [],
						        boCustProfiles      : []
					        }
				        };
				        // 信息节点
				        busiOrderUser.data.boCustInfos.push({
					        name			: subUserInfo.orderAttrName,		// 客户名称
					        ignore			: "Y", 								// 临时方法,新建C1订单提交不校验
					        custType		: subUserInfo.servType,  			// 新建客户类型1:使用人,2责任人
					        ownerProd		: subUserInfo.prodId,				// 客户产品归属
					        state			: "ADD",							// 状态
					        areaId			: order.prodModify.choosedProdInfo.areaId,// 订单地区ID
					        telNumber 		: subUserInfo.orderAttrPhoneNbr,	// 联系电话
					        addressStr		: subUserInfo.orderAttrAddr,		// 客户地址
					        partyTypeCd		: 1,								// 客户类型
					        defaultIdType	: subUserInfo.orderIdentidiesTypeCd,// 证件类型
					        mailAddressStr	: subUserInfo.orderAttrAddr,		// 通信地址
					        businessPassword: ""								// 客户密码
				        });
				        // 证件节点
				        busiOrderUser.data.boCustIdentities.push({
					        state			: "ADD",	// 状态
					        isDefault		: "Y",		// 是否首选
					        identityNum		: subUserInfo.identityNum,			// 证件号码
					        identidiesPic	: subUserInfo.identityPic,			// 二进制证件照片
					        identidiesTypeCd: subUserInfo.orderIdentidiesTypeCd	// 证件类型
				        });
				        // 联系人节点
				        if(ec.util.isObj(subUserInfo.orderAttrPhoneNbr)){
					        var contactGender = "1";
					        if(subUserInfo.orderIdentidiesTypeCd == "1"){
						        if (parseInt(subUserInfo.identityNum.substr(16, 1)) % 2 == 1) {
							        contactGender = "1";
						        } else {
							        contactGender = "2";
						        }
					        }
					        busiOrderUser.data.boPartyContactInfo.push({
						        state			: "ADD",						// 状态
						        staffId 		: OrderInfo.staff.staffId,		// 员工ID
						        statusCd		: "100001",						// 订单状态
						        headFlag		: "1",							// 是否首选联系人
						        contactName		: subUserInfo.orderAttrName,	// 参与人的联系人名称
						        contactType		: "10",							// 联系人类型
						        mobilePhone		: subUserInfo.orderAttrPhoneNbr,// 参与人的移动电话号码
						        contactGender	: contactGender,				// 参与人联系人的性别
						        contactAddress	: subUserInfo.orderAttrAddr		// 参与人的联系地址
					        });
				        }
				        if(subUserInfo.checkCustCertSwitch == "ON"){
					        var boCustCheckLog = {
						        checkMethod			: subUserInfo.checkMethod,
						        custId 		        : subUserInfo.custId,
						        objId		        : "",	
						        checkDate		    : subUserInfo.checkDate,		
						        checker		        : subUserInfo.checker,
						        checkChannel		: subUserInfo.checkChannel,						
						        certCheckResult		: subUserInfo.certCheckResult,
					        	errorMessage	    : subUserInfo.errorMessage,				
					        	staffId	            : subUserInfo.staffId		
					        };
					        busiOrderUser.data.boCustCheckLogs.push(boCustCheckLog);
					        var realNameChech = {
							        partyProfileCatgCd: CONST.BUSI_ORDER_ATTR.REAL_NAME_CHECK,
							        profileValue: "1",
				                    state: "ADD"
					        };
					        busiOrderUser.data.boCustProfiles.push(realNameChech);
				        }
				        busiOrder.push(busiOrderUser);
			        }
			        if(CacheData.isGov(toIdentidiesTypeCd)){//政企
				        boProdItems = [
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"ADD",
		    					value:subUserInfo.custId
		    				}
					    ]
				    }else{//公众客户
				        boProdItems = [
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"DEL",
		    					value:OrderInfo.cust.custId
		    				},
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"ADD",
		    					value:subUserInfo.custId
		    				}
					    ]
				    }
		        }else{//使用人老模式
				    boProdItems = [
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"DEL",
		    					value:OrderInfo.cust.custId
		    				},
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"ADD",
		    					value:$("#800000011_-1").val()
		    				}
					]
			    }
			}else{//未选择使用人
				if(!CacheData.isGov(toIdentidiesTypeCd)){//公众客户
				    boProdItems = [
						{
		    				itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    				prodSpecItemId:"",
		    				state:"DEL",
		    				value:OrderInfo.cust.custId
		    			},
						{
		    				itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    				prodSpecItemId:"",
		    				state:"ADD",
		    				value:_toCustId
		    			}
					]
				}
			}
			transferCust.data.boProdItems = boProdItems;
			busiOrder.push(transferCust);
			//过户返档
			if(_BO_ACTION_TYPE==CONST.BO_ACTION_TYPE.TRANSFERRETURN){
                //添加证号关系
                _addCertiAccNbrRels(_transchoosedCustInfo, transferCust, toIdentidiesTypeCd, toIdCardNumber, toCustName, toAddressStr);
			}
			//新建帐户节点
			if($("#acctSelect").val()==-1){
				var acctName = $("#acctName").val();
				if(acctName==toCustName){
					OrderInfo.createAcct(busiOrder, -1,_toCustId,nameCN);
				}else{
					OrderInfo.createAcct(busiOrder, -1,_toCustId);
				}
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
//		        if(OrderInfo.actionFlag==43 && CacheData.isGov(toIdentidiesTypeCd)){
//		        	var govUser = {
//		        			areaId : order.prodModify.choosedProdInfo.areaId,  //受理地区ID
//		        			busiOrderInfo : {
//		        				seq : OrderInfo.SEQ.seq-- 
//		        			}, 
//		        			busiObj : { //业务对象节点
//		        				accessNumber: order.prodModify.choosedProdInfo.accNbr,
//		    					instId : order.prodModify.choosedProdInfo.prodInstId, //业务对象实例ID
//		    					objId :order.prodModify.choosedProdInfo.productId,
//		    					isComp:"N"
//		        			},  
//		        			boActionType : {
//		        				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
//		        				boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PARMS
//		        			}, 
//		        			data:{
//		        				boProdItems:[{
//		    						itemSpecId:CONST.PROD_ATTR.PROD_USER,
//		    						prodSpecItemId:"",
//		    						state:"ADD",
//		    						value:$("#800000011_-1").val()
//		    					}]
//		        			}
//		        		};
//		        	busiOrder.push(govUser);
//		        }
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
		var identidiesTypeCd = $(scope).val();
		if (identidiesTypeCd == "1" || identidiesTypeCd == "undefined") {
			$("#transfercCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#transfercCustIdCard").attr("data-validate","validate(idCardCheck:请输入合法身份证号码) on(blur)");
		} else {
			var $custPhoto = $("#tr_ransferCustPhoto");
			if ("none" != $custPhoto.css("display")) {
				$custPhoto.hide();
				var identityPic = $("#img_ransferCustPhoto").data("identityPic");
				if (identityPic != undefined) {
					$("#img_ransferCustPhoto").removeData("identityPic");
				}
			}
			if(identidiesTypeCd==2){
				$("#transfercCustIdCard").attr("placeHolder","请输入合法军官证");
				$("#transfercCustIdCard").attr("data-validate","validate(required:请准确填写军官证) on(blur)");
			}else if(identidiesTypeCd==3){
				$("#transfercCustIdCard").attr("onkeyup", "value=value.replace(/[^A-Za-z0-9-]/ig,'')");
				$("#transfercCustIdCard").attr("placeHolder","请输入合法护照");
				$("#transfercCustIdCard").attr("data-validate","validate(required:请准确填写护照) on(blur)");
			}else{
				$("#transfercCustIdCard").attr("placeHolder","请输入合法证件号码");
				$("#transfercCustIdCard").attr("data-validate","validate(required:请准确填写证件号码) on(blur)");
			}
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
			$("#addCust").hide();
			$("#custTransferInfo").empty();
			$("#modAccountProfile").hide();
			$("#govUser").hide();
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
			if(OrderInfo.actionFlag==43){
				param.busiFlag = 'FD';
			}
			OrderInfo.ReturnFileParam = param;
			$.callServiceAsHtml(contextPath+"/order/prodModify/transferQueryCust",param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
				},"done" : function(response){
					$.unecOverlay();
					if(response.code != 0) {
						$.alert("提示","查询失败,稍后重试");
						return;
					}
					if(OrderInfo.actionFlag==43){
						if(OrderInfo.reFileType != "mainNoRealname" || CacheData.isGov(identityCd)){
							$("#govUser").show();
				            $('#choose_user_btn_-1').off('click').on('click',function(){
							    if (query.common.queryPropertiesValue("REAL_USER_" + OrderInfo.staff.areaId.substr(0, 3)) == "ON" || OrderInfo.reFileType == "mainNoRealname"){
							        //使用人新模式
							        _realUserFlag = "ON";
							        order.main.openChooseDialog(this, {"tipThead"	:"选择使用人"});
						        } else{
							        //使用人老模式
						    	    _realUserFlag = "OFF";
							        order.main.toChooseUser2(-1);
						        }
						    }).show();
						}
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
	$('#ransferCustCreateForm').unbind().bind('formIsValid',sub = function(event) {
		var cCustIdCard = $.trim($("#transfercCustIdCard").val());
		var identityCd = $("#div_tra_identidiesTypeCd").val();
		if(OrderInfo.actionFlag==43 && OrderInfo.ReturnFileParam!=null && (OrderInfo.ReturnFileParam.identityCd!=identityCd || OrderInfo.ReturnFileParam.identityNum!=cCustIdCard)){
			$.alert("提示","请先查询输入的'证件类型'和'证件号码'是否存在！");
			return;
		}
		if(OrderInfo.actionFlag==43){
			//省份返档开关，ON是过户返档，OFF是改客户资料返档
			var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "TRANSFERRETURN_"+order.prodModify.choosedProdInfo.areaId.substr(0,3)});
			var transferSwitch = "ON";
			if(response.code=="0"){
				transferSwitch = response.data;
			}
			if(transferSwitch == "OFF"){
				_BO_ACTION_TYPE = CONST.BO_ACTION_TYPE.ACTIVERETURN;
			}
			if(CacheData.isGov(identityCd)){
				$("#govUser").show();
			}
		}
		var createCustInfo = {
				cCustName : $.trim($("#transfercCustName").val()),
				cCustIdCard :  cCustIdCard,
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
		if(response.data.indexOf("FD_") >=0){
			var message = response.data.split("_");
			$.alert("提示",message[1]);
			return;
		}else if(response.data.indexOf("false") >=0) {
			if(OrderInfo.actionFlag==43){
				$("#addCust").show();
			}
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
            identityCd : $(scope).attr("identityCd"),
            addressStr : $(scope).attr("addressStr"),
            partyName : $(scope).attr("partyName"),
            certNum : $(scope).attr("certNum"),
            address : $(scope).attr("address"),
			idCardNumber : $(scope).attr("idCardNumber"),
			identityName : $(scope).attr("identityName"),
			areaName : $(scope).attr("areaName"),
			CN : $(scope).attr("CN")
		};
		_BO_ACTION_TYPE = CONST.BO_ACTION_TYPE.TRANSFERRETURN;
		if($("#TransferNum").val().length<14){
			//TODO init view 
			if(OrderInfo.actionFlag == 43){
				authFlag = '1';
				_custAuth(scope);
			}else{
				easyDialog.open({
					container : 'Transferauth'
				});
				$("#transAuthClose").off("click").on("click",function(event){
					easyDialog.close();
					authFlag="";
					$("#transAuthPassword").val("");
				});
			}
		}else{
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
				//custInfo = param;
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
		if(_BO_ACTION_TYPE == CONST.BO_ACTION_TYPE.ACTIVERETURN&&OrderInfo.actionFlag!=43){
			$("#accountDiv").hide();
			$("#modAccountProfile").show();
			$('#choose_user_btn_-1').off('click').on('click',function(){
				order.main.toChooseUser("-1");
			}).show();
		}else{
			$("#accountDiv").show();
		}
		
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
			if ("1" == _transferCreatedCustInfos.identidiesTypeCd) {
				$("#tr_ransferCustPhoto").show();
			}
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
				$.unecOverlay();
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
		//返档标识  真为返档  否为改客户资料返档
		var  acctReturn_Mark=OrderInfo.actionFlag==43&&_returnFlag;
		$("#acctSelect").empty();
		$("#account").find("a:gt(0)").show();
		//客户资料返档时 新建客户自动新建帐户
		if ($("#litransCustId").attr("transCustId")==""&&!acctReturn_Mark) {
			_whetherCreateAcct();
		} 
		//老客户默认查询使用其已有帐户，若没有老帐户则使用新建帐户
		else {
			var	custId="";
			var response ="";
			if(acctReturn_Mark){
				var param = {
						prodId : order.prodModify.choosedProdInfo.prodInstId,
						acctNbr : order.prodModify.choosedProdInfo.accNbr,
						areaId : order.prodModify.choosedProdInfo.areaId
					};
				response = $.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param);
				if(response.code==0){
					var returnMap = response.data;
							$.each(returnMap, function(i, accountInfo){
								var found = false;
								$.each($("#acctSelect option"), function(i, option){
									if($(option).val()==accountInfo.acctId){
										found = true;
										return false;
									}
								});
								if(!found){
									$("<option>").text(accountInfo.name+" : "+accountInfo.acctCd).attr("value",accountInfo.acctId).attr("acctcd",accountInfo.acctCd).appendTo($("#acctSelect"));
								}							
								$("#acctSelect").find("option[value="+accountInfo.acctId+"]").attr("selected","selected");							
							});
							$("#defineNewAcct").hide();
							//默认账户名称为第一个账户的名称
							$("#acctName").attr("value",returnMap[0].name);
				} 
				else{
					$.alert("提示",response.data.errMsg);
				}
			}else{
				custId=  $("#litransCustId").attr("transCustId");
				var param = {
						"custId" : custId
					};
				 response = order.prodModify.returnAccount(param);
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
								//默认账户名称为第一个账户的名称
								$("#acctName").attr("value",returnMap.accountInfos[0].name);
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
			
			
	
		}
		//判断是否是 "返档" 
		if(acctReturn_Mark&&_returnFlag){
			//隐藏所有功能键
			$("#defineNewAcct").hide();
			//隐藏账户其它除名称外属性
			$("#defineNewAcct").find("li").hide();
			//失效账户选择
			$("#acctSelect").attr("disabled","disabled");
			$("#account").find("a").hide();
			//显示账户名称修改按钮
			$("#account").find("a:eq(2)").show();
			//显示账户名称
			$("#defineNewAcct").find("li:eq(0)").show();
		}else{
			//隐藏账户名称修改按钮
			$("#account").find("a:eq(2)").hide();
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
		param.actionFlag = OrderInfo.actionFlag;
		param.partyName=OrderInfo.cust.partyName;
		//定位客户
		param.idCardNumber=OrderInfo.cust.idCardNumber;
		param.boActionTypeName=callParam.boActionTypeName;
		param.areaId=OrderInfo.getAreaId();
		$.callServiceAsHtml(contextPath + "/order/prodModify/custTransfer", param, {		
			"done" : function(response){				
				$("#order_fill_content").html(response.data).show();
				$(".h2_title").append(order.prodModify.choosedProdInfo.productName+"-"+order.prodModify.choosedProdInfo.accNbr);
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
				var menuName = $("#menuName").attr("menuName");
				if((ec.util.isObj(menuName)&&(CONST.MENU_FANDANG==menuName||CONST.MENU_CUSTFANDANG==menuName||CONST.MENU_RETURNFILE==menuName))){
					$("#fillLastStep").hide();
					$("#order_quick_nav").hide();
				}
				_initDic();
				_form_custTransfer_btn();
				//任务（小组） #1506077 电渠加装副卡业务支持预装+返档 ---- 营业门户
                var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "ECS_RETURN_FILE_"+order.prodModify.choosedProdInfo.areaId.substr(0,3)});
                var ecsReFileSwitch = "OFF";
                if (response.code == "0") {
                    ecsReFileSwitch = response.data;
                }
                OrderInfo.ecsReFileSwitch = ecsReFileSwitch;
                OrderInfo.reFileType = "";
                OrderInfo.reFileMainCustInfo = {};
				if(ecsReFileSwitch == "ON"){
					//先判断是主卡还是副卡
					if(order.prodModify.choosedProdInfo.roleCd == CONST.MAINPROD_ROLECD.VICE_ROLECD){//副卡
					    if(OrderInfo.cust.canrealname == '1'){//已实名
					    	$("#queryCust").hide();
							var $li = $('<li style="white-space: nowrap" class="full">姓名 &nbsp:&nbsp'+OrderInfo.cust.partyName+'</li>');
                        	$li.append('<li style="white-space: nowrap" class="full">证件&nbsp:&nbsp'+OrderInfo.cust.identityName+'/'+OrderInfo.cust.idCardNumber+'</li>');
					    	$li.append('<li style="white-space: nowrap" class="full">地区 &nbsp:&nbsp'+OrderInfo.cust.areaName+'</li>');
                        	$("#custTransferInfo").append($li);
                        	$("#govUser").show();
                        	$('#choose_user_btn_-1').off('click').on('click',function(){
                        	     //使用人新模式
                        	     _realUserFlag = "ON";
                        	     order.main.openChooseDialog(this, {"tipThead"	:"选择使用人"});
							}).show();
					    	OrderInfo.reFileType = "viceRealname";
						}else{//未实名
						    //查询销售品实例并且保存,查询主卡信息
		                    if(!query.offer.setOffer()){
		                	    $("#reFileMain").hide();
			                    return;
		                    }
		                    var mainOfferMemberInfo = null;
		                    $.each(OrderInfo.offer.offerMemberInfos,function(){
					            if(this.roleCd ==CONST.MEMBER_ROLE_CD.MAIN_CARD){
					            	mainOfferMemberInfo = this;
					        	    return;
					            }
				            });
				            if(mainOfferMemberInfo == null ){
				        	    $("#reFileMain").hide();
			                    return;
				            }
				            var acctNbr = mainOfferMemberInfo.accessNumber;
				            var param = {
				                "acctNbr":acctNbr,
				                "identityCd":"",
				                "identityNum":"",
				                "partyName":"",
				                "queryFlag":"queryHandleCust",
				                "custQueryType":"",
				                "diffPlace":$("#DiffPlaceFlag").val(),
				                "areaId" : order.prodModify.choosedProdInfo.areaId,
				                "queryType" :"",
				                "queryTypeValue":"",
				                "identidies_type":""
		                    };
				            $.callServiceAsJson(contextPath + "/cust/queryoffercust", param, {
				                "before" : function() {
				                    $.ecOverlay("<strong>正在查询主卡客户信息, 请稍等...</strong>");
				                },
			                    "done" : function(response) {
				                    if(response.code == 0 && response.data){
                                        if(ec.util.isArray(response.data.custInfos)){
			                                var custInfo = response.data.custInfos[0];
			                                //判断主卡是否已实名
		                                    if(custInfo.canRealName == '1'){
		                                        OrderInfo.reFileMainCustInfo = custInfo;
							                    OrderInfo.reFileType = "viceNoRealname";
							                    $("#queryCust").hide();
							                    var $li = $('<li style="white-space: nowrap" class="full">姓名 &nbsp:&nbsp'+OrderInfo.cust.partyName+'</li>');
                        	                    $li.append('<li style="white-space: nowrap" class="full">证件&nbsp:&nbsp'+OrderInfo.cust.identityName+'/'+OrderInfo.cust.idCardNumber+'</li>');
					    	                    $li.append('<li style="white-space: nowrap" class="full">地区 &nbsp:&nbsp'+OrderInfo.cust.areaName+'</li>');
							                    $("#custTransferInfo").append($li);
							                    $("#govUser").show();
				        	                    $('#choose_user_btn_-1').off('click').on('click',function(){
								                    //使用人新模式
                        	                        _realUserFlag = "ON";
                        	                        order.main.openChooseDialog(this, {"tipThead"	:"选择使用人"});
							                    }).show();
		                                    }else{
		                    	                $("#reFileMain").hide();
		                    	                var tisp = "存在主卡未返档，请优先主卡返档。主卡接入号码："+acctNbr;
		                    	                $.alert("错误",tisp);
		                    	                return;
		                                    }
                                        }
				                    }else if(response.code == 1 && response.data){
				                    	$("#reFileMain").hide();
				                        $.alert("错误", "查询主卡客户信息失败，错误原因：" + response.data);
				                        return;
				                    }else if(response.code == -2 && response.data){
				                	    $("#reFileMain").hide();
				                        $.alertM(response.data);
				                        return;
				                    }else{
				                    	$("#reFileMain").hide();
				                        $.alert("错误", "查询主卡客户信息发生未知异常，请稍后重试。错误信息：" + response.data);
				                        return;
				                    }
				                },
			                    "fail" : function(response) {
			                    	$("#reFileMain").hide();
				                    $.alert("错误","查询主卡客户信息发生未知异常：" + response.data);
			                    },
			                    "always" : function() {
				                    $.unecOverlay();
			                    }
		                    });
						}
					}else{//主卡
						if(OrderInfo.cust.canrealname == '1'){//已实名
							$("#queryCust").hide();
							var $li = $('<li style="white-space: nowrap" class="full">姓名 &nbsp:&nbsp'+OrderInfo.cust.partyName+'</li>');
                            $li.append('<li style="white-space: nowrap" class="full">证件&nbsp:&nbsp'+OrderInfo.cust.identityName+'/'+OrderInfo.cust.idCardNumber+'</li>');
							$li.append('<li style="white-space: nowrap" class="full">地区 &nbsp:&nbsp'+OrderInfo.cust.areaName+'</li>');
							$("#custTransferInfo").append($li);
							$("#accountDiv").show();
							OrderInfo.reFileType = "mainRealname";
							_ecs_initAcct(OrderInfo.cust.custId);
						}else{//未实名
							OrderInfo.reFileType = "mainNoRealname";
						}
					}
				}else{
				    _initReturnCust4GovEnt();
				}
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
						if(OrderInfo.actionFlag == 43){
							order.cust.custidentidiesTypeCdChoose($("#p_cust_tra_identityCd"),'TransferNum');
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
		var servCode="定位客户";
		var man = cert.readCert(servCode);
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
				//版本需要更新特殊处理 不需要提示errorMsg
				return ;
			}
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
		$('#div_tra_partyTypeCd').val(1);//个人
		prod.transferModify.partyTypeCdChoose($("#div_tra_partyTypeCd option[value='1']"));
		$('#div_tra_identidiesTypeCd').val(1);//身份证类型
		prod.transferModify.identidiesTypeCdChoose($("#div_tra_identidiesTypeCd option[value='1']"));
		$('#transfercCustName').val(man.resultContent.partyName);//姓名
		$('#transfercCustIdCard').val(man.resultContent.certNumber);//设置身份证号
		if (man.resultContent.identityPic !== undefined) {
			$("#img_ransferCustPhoto").attr("src", "data:image/jpeg;base64," + man.resultContent.identityPic);
			$("#img_ransferCustPhoto").data("identityPic", man.resultContent.identityPic);
			$("#tr_ransferCustPhoto").show();
		}
		$('#transfercAddressStr').val(man.resultContent.certAddress);//地址
	};
	
	//改造后返档
	var _showReturnFile = function () {
		OrderInfo.prodAttrs = [];
		if(OrderInfo.authRecord.resultCode!="0"){
			if (order.prodModify.querySecondBusinessAuth("11", "Y", "prod.transferModify.showReturnFile")) {
				return;
			}
		}

		if(order.prodModify.choosedProdInfo.prodStateCd!=CONST.PROD_STATUS_CD.READY_PROD){
			$.alert("提示","当前产品状态不是【预开通】,不允许受理该业务！");
			return;
		}
		//返档改造开关
		var response = $.callServiceAsJson(contextPath+"/common/queryPortalProperties",{propertiesKey : "RETURN_ACCOUNT_FLAG"});
		_returnFlag=response.data=="ON"?true:false;
		OrderInfo.busitypeflag=0;
		OrderInfo.actionFlag = 43;
		/*	if(order.prodModify.choosedProdInfo.prodStateCd!="100000"||order.prodModify.choosedProdInfo.prodStateCd!="140000"){
					$.alert("提示","产品状态为\"在用\"才能进行过户","information");
					return;
				}*/
					var submitState="";
			        _BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.TRANSFERRETURN;
			        //规则校验时候以远改客户资料返档校验为准，“预开通”状态才能受理
			        var boActtionType = CONST.BO_ACTION_TYPE.ACTIVERETURN;
					submitState="ADD";
					var param = order.prodModify.getCallRuleParam(boActtionType, order.prodModify.choosedProdInfo.prodInstId);
					var callParam = {
						boActionTypeCd : boActtionType,
						boActionTypeName : "返档",
						accessNumber : "",
						prodOfferName : "",
						state:submitState
					};
					var checkRule = rule.rule.prepare(param,'prod.transferModify.custTransfer',callParam);
					if (checkRule) return;
	};
	
	var _returnFile_Submit = function(){
		if(OrderInfo.ecsReFileSwitch == "ON"){
			_ecs_custTransfer_Submit();
		}else{
			//政企必须传使用人
		    var toIdentidiesTypeCd = $("#p_cust_tra_identityCd").val();
		    var isGovEntCust = false;//判断是否政企客户，true：是；false：否
		    if (CacheData.isGov(toIdentidiesTypeCd)) {
			    isGovEntCust = true;
			    if(($("#800000011_-1_name").val()==null || $("#800000011_-1_name").val()=='')){
				    $.alert("提示","政企客户必须选择使用人！");
				    return;
			    }
		    };
		    if(OrderInfo.actionFlag==43 && _returnFlag){
			    if (isGovEntCust && query.common.queryPropertiesStatus("TRANSFER_CUST_FLAG")) {
				    //针对政企、预开通、已实名的客户返档
				    _returnCustSubmit4GovEnt();
			    } else{
				    //其他情况的返档
				    _returnCust_Submit();
			    };
		    }else if(_BO_ACTION_TYPE == CONST.BO_ACTION_TYPE.TRANSFERRETURN){
			    _custTransfer_Submit();
		    }else{
			    _changeDataReturn_Submit();
		    }
		}
	};
	
	var _changeDataReturn_Submit = function(){
		SoOrder.builder(CONST.returnCustSubmitFlag);//返档在订单提交时才初始化订单数据，特殊，增加标识
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
		var accountInfoOld = jr.data[0]; //原帐户信息
		var acctName = $.trim($("#accountName").val());
		var boAccountInfos = [];
		if(acctName!=null && acctName !=""){
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
		    boAccountInfos.push(_boProdAcctInfosOld);
		    boAccountInfos.push(_boProdAcctInfos);
		}
        OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,_BO_ACTION_TYPE,43,CONST.getBoActionTypeName(_BO_ACTION_TYPE),"");
	    var busiOrder = [];
	    //改客户资料返档ACTIVERETURN
		var busiOrderReturn = {
			areaId : order.prodModify.choosedProdInfo.areaId,
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.CUST_ACTION, // 动作大类：客户动作
				boActionTypeCd : _BO_ACTION_TYPE// 动作小类：改客户资料
			},
			busiObj : {
				accessNumber : order.prodModify.choosedProdInfo.accNbr,
				instId : $("#boCustIdentities").attr("partyId")
			},
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			},
			data : {
				boAccountInfos : [],
				boCustIdentities : [],
				boCustInfos :[{
					areaId : OrderInfo.cust.areaId,
					name : $("#boCustIdentities").attr("partyName"),
					custName : $("#boCustIdentities").attr("pName"), // 加密后的客户名称
					norTaxPayerId : "0",
					partyTypeCd : $("#boCustIdentities").attr("partyTypeCd"),
					addressStr : $("#boCustIdentities").attr("addressStr"),
					address : $("#boCustIdentities").attr("address"), // 加密后的客户地址
					state : "DEL"
				}, {
					areaId : OrderInfo.cust.areaId,
					name : _transferCreatedCustInfos.cCustName,
					norTaxPayerId : "0",
					partyTypeCd : _transferCreatedCustInfos.partyTypeCd,
					addressStr : _transferCreatedCustInfos.cAddressStr,
					state : "ADD"
		        }],
		        boCustProfiles : [],
		        boPartyContactInfo : [],
                boCertiAccNbrRels:[]
			}
		};

		if(boAccountInfos.length>0){
			busiOrderReturn.data.boAccountInfos = boAccountInfos;
		}
		var toIdentidiesTypeCd = $("#p_cust_tra_identityCd").val();
		var toIdCardNumber = $("#litransidCardNumber").attr("transidCardNumber");
		var boCustIdentitie = [];
		var boCustIdentitieAdd = {
				identidiesTypeCd : toIdentidiesTypeCd,	//证件类型编码			                
				identityNum : toIdCardNumber, //证件号码
				isDefault : "Y",	
				state : "ADD"
		};
		if ("1" === toIdentidiesTypeCd) { //身份证
			var identityPic = $("#img_ransferCustPhoto").data("identityPic");
			if (identityPic != undefined) {
				boCustIdentitieAdd.identidiesPic = identityPic;
			}
		}
		var boCustIdentitieOld = {
			identidiesTypeCd : OrderInfo.cust.identityCd,
			identityNum : OrderInfo.cust.idCardNumber,
			certNum : $("#boCustIdentities").attr("certNum"), // 加密后的证件号
			isDefault : "Y",
			state : "DEL"
		};
        //证号关系
        var boCertiAccNbrRel = $.extend(true, {}, OrderInfo.boCertiAccNbrRel);
        boCertiAccNbrRel.accNbr = order.prodModify.choosedProdInfo.accNbr;
        boCertiAccNbrRel.partyId = "-1";
        boCertiAccNbrRel.certType = toIdentidiesTypeCd;
        boCertiAccNbrRel.certNum = toIdCardNumber;
        boCertiAccNbrRel.custName = _transferCreatedCustInfos.cCustName;
        boCertiAccNbrRel.certAddress = _transferCreatedCustInfos.cAddressStr;
        busiOrderReturn.data.boCertiAccNbrRels.push(boCertiAccNbrRel);
		boCustIdentitie.push(boCustIdentitieAdd);
		boCustIdentitie.push(boCustIdentitieOld);
		busiOrderReturn.data.boCustIdentities = boCustIdentitie;
		busiOrder.push(busiOrderReturn);
        //产品返档
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
					actionClassCd: CONST.ACTION_CLASS_CD.PROD_ACTION,//产品动作
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
	    //账户动作
        if(boAccountInfos.length>0){
        	var busiOrderAcct = {
        			areaId : order.prodModify.choosedProdInfo.areaId,
        			boActionType : {
        				actionClassCd : CONST.ACTION_CLASS_CD.ACCT_ACTION, // 动作大类：账户动作
        				boActionTypeCd : _BO_ACTION_TYPE
        			// 动作小类：改客户资料
        			},
        			busiObj : {
        				accessNumber : order.prodModify.choosedProdInfo.accNbr,
        				instId : accountInfoOld.acctId
        			},
        			busiOrderInfo : {
        				seq : OrderInfo.SEQ.seq--
        			},
        			data : {
        				boAccountInfos : boAccountInfos
        			}
        		};
	        busiOrder.push(busiOrderAcct);
		}
        if(CacheData.isGov(toIdentidiesTypeCd)){
        	var govUser = {
        			areaId : order.prodModify.choosedProdInfo.areaId,  //受理地区ID
        			busiOrderInfo : {
        				seq : OrderInfo.SEQ.seq-- 
        			}, 
        			busiObj : { //业务对象节点
        				accessNumber: order.prodModify.choosedProdInfo.accNbr,
    					instId : order.prodModify.choosedProdInfo.prodInstId, //业务对象实例ID
    					objId :order.prodModify.choosedProdInfo.productId,
    					isComp:"N"
        			},  
        			boActionType : {
        				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
        				boActionTypeCd : CONST.BO_ACTION_TYPE.PRODUCT_PARMS
        			}, 
        			data:{
        				boProdItems:[{
    						itemSpecId:CONST.PROD_ATTR.PROD_USER,
    						prodSpecItemId:"",
    						state:"ADD",
    						value:$("#800000011_-1").val()
    					}]
        			}
        		};
        	busiOrder.push(govUser);
        }
		SoOrder.submitOrder(busiOrder);
	};
	var _showCustUpdate=function(){
		//显示
	 	$("#defineNewAcct").show();
	 	$("#postType").attr("disabled","disabled");
	 	$("#paymentType").attr("disabled","disabled");
	 	
	};
	//返档提交
	var _returnCust_Submit=function(){
		var toCustId = $("#litransCustId").attr("transCustId");
		var _toCustId = -1;
		if(toCustId!=""){
			_toCustId = toCustId;
		}
		var toCustName = $("#litransCustId").attr("transCustName");
		var toAddressStr = $("#litransCustId").attr("transAddressStr");
		var nameCN = $("#litransCustId").attr("CN");
		var toIdentidiesTypeCd = $("#p_cust_tra_identityCd").val();
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
		if($.trim($("#acctName").val())==""){
			$.alert("提示","帐户名称不能为空！");
			return;
		}

        //一证五号校验
        if (!_transOneCertFiveNumCheck(toCustId, toIdentidiesTypeCd, toIdCardNumber, toCustName, toAddressStr)) {
            return;
        }

		//订单备注信息
		OrderInfo.orderDataRemark =$("#order_remark").val();
		var acctId = $("#acctSelect").val(); //要更换的帐户ID
		var acctCd = -1;
		if(acctId>0){
			acctCd = $("#acctSelect").find("option:selected").attr("acctcd"); //要更换的帐户合同号
		}
		var subUserInfos = OrderInfo.subUserInfos;
		var choosedUserInfos = OrderInfo.choosedUserInfos;
		SoOrder.builder(CONST.returnCustSubmitFlag);//返档在订单提交时才初始化订单数据，特殊，增加标识
		OrderInfo.subUserInfos = subUserInfos;
		OrderInfo.choosedUserInfos = choosedUserInfos;
		//返档要求partyId取返档后客户ID，做特殊处理redmine 794183
		OrderInfo.orderData.orderList.orderListInfo.partyId = _toCustId;
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
        OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,_BO_ACTION_TYPE,43,CONST.getBoActionTypeName(_BO_ACTION_TYPE),"");
			
			var busiOrder = [	];
			//新建客户节点
			if(toCustId==""||_toCustId==-1){
				var boCustIdentitie = {
					identidiesTypeCd : toIdentidiesTypeCd,	//证件类型编码			                
					identityNum : toIdCardNumber, //证件号码
					defaultIdType :toIdentidiesTypeCd,	//证件类型编码		
					state : "ADD"
				};
				if ("1" === toIdentidiesTypeCd) { //身份证
					var identityPic = $("#img_ransferCustPhoto").data("identityPic");
					if (identityPic != undefined) {
						boCustIdentitie.identidiesPic = identityPic;
					}
				}
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
							boCustIdentities: [boCustIdentitie],
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
						boActionTypeCd :  CONST.BO_ACTION_TYPE.TRANSFERRETURN //动作小类：过户
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
			            boProdStatuses : [{
							prodStatusCd : CONST.PROD_STATUS_CD.READY_PROD,
							state : "DEL"
						},{
							prodStatusCd : CONST.PROD_STATUS_CD.DONE_PROD,
							state : "ADD"
						}
						],
			            boProdItems : []
					}
			};
			var  boProdItems = [];
			//使用人新模式
			if($("#800000011_-1_name").val()!=null && $("#800000011_-1_name").val()!= ''){//选择了使用人
				if(_realUserFlag == "ON"){
			        var subUserInfo = subUserInfos[0];
			        if(subUserInfo.isOldCust == "N"){
				        var busiOrderUser = {
					        areaId	: order.prodModify.choosedProdInfo.areaId,// 受理地区ID
					        busiOrderInfo : {
						        seq : OrderInfo.SEQ.seq--
					        },
					        busiObj : { // 业务对象节点
						        instId		: subUserInfo.custId,
						        accessNumber: order.prodModify.choosedProdInfo.accNbr
					        },
					        boActionType : {
						        actionClassCd	: CONST.ACTION_CLASS_CD.CUST_ACTION,
						        boActionTypeCd	: CONST.BO_ACTION_TYPE.CUST_CREATE
					        },
					        data : {
						        boCustInfos 		: [],
						        boCustIdentities	: [],
						        boPartyContactInfo	: [],
						        boCustCheckLogs     : [],
						        boCustProfiles      : []
					        }
				        };
				        // 信息节点
				        busiOrderUser.data.boCustInfos.push({
					        name			: subUserInfo.orderAttrName,		// 客户名称
					        ignore			: "Y", 								// 临时方法,新建C1订单提交不校验
					        custType		: subUserInfo.servType,  			// 新建客户类型1:使用人,2责任人
					        ownerProd		: subUserInfo.prodId,				// 客户产品归属
					        state			: "ADD",							// 状态
					        areaId			: order.prodModify.choosedProdInfo.areaId,// 订单地区ID
					        telNumber 		: subUserInfo.orderAttrPhoneNbr,	// 联系电话
					        addressStr		: subUserInfo.orderAttrAddr,		// 客户地址
					        partyTypeCd		: 1,								// 客户类型
					        defaultIdType	: subUserInfo.orderIdentidiesTypeCd,// 证件类型
					        mailAddressStr	: subUserInfo.orderAttrAddr,		// 通信地址
					        businessPassword: ""								// 客户密码
				        });
				        // 证件节点
				        busiOrderUser.data.boCustIdentities.push({
					        state			: "ADD",	// 状态
					        isDefault		: "Y",		// 是否首选
					        identityNum		: subUserInfo.identityNum,			// 证件号码
					        identidiesPic	: subUserInfo.identityPic,			// 二进制证件照片
					        identidiesTypeCd: subUserInfo.orderIdentidiesTypeCd	// 证件类型
				        });
				        // 联系人节点
				        if(ec.util.isObj(subUserInfo.orderAttrPhoneNbr)){
					        var contactGender = "1";
					        if(subUserInfo.orderIdentidiesTypeCd == "1"){
						        if (parseInt(subUserInfo.identityNum.substr(16, 1)) % 2 == 1) {
							        contactGender = "1";
						        } else {
							        contactGender = "2";
						        }
					        }
					        busiOrderUser.data.boPartyContactInfo.push({
						        state			: "ADD",						// 状态
						        staffId 		: OrderInfo.staff.staffId,		// 员工ID
						        statusCd		: "100001",						// 订单状态
						        headFlag		: "1",							// 是否首选联系人
						        contactName		: subUserInfo.orderAttrName,	// 参与人的联系人名称
						        contactType		: "10",							// 联系人类型
						        mobilePhone		: subUserInfo.orderAttrPhoneNbr,// 参与人的移动电话号码
						        contactGender	: contactGender,				// 参与人联系人的性别
						        contactAddress	: subUserInfo.orderAttrAddr		// 参与人的联系地址
					        });
				        }
				        if(subUserInfo.checkCustCertSwitch == "ON"){
					        var boCustCheckLog = {
						        checkMethod			: subUserInfo.checkMethod,
						        custId 		        : subUserInfo.custId,
						        objId		        : "",	
						        checkDate		    : subUserInfo.checkDate,		
						        checker		        : subUserInfo.checker,
						        checkChannel		: subUserInfo.checkChannel,						
						        certCheckResult		: subUserInfo.certCheckResult,
					        	errorMessage	    : subUserInfo.errorMessage,				
					        	staffId	            : subUserInfo.staffId		
					        };
					        busiOrderUser.data.boCustCheckLogs.push(boCustCheckLog);
					        var realNameChech = {
							        partyProfileCatgCd: CONST.BUSI_ORDER_ATTR.REAL_NAME_CHECK,
							        profileValue: "1",
				                    state: "ADD"
					        };
					        busiOrderUser.data.boCustProfiles.push(realNameChech);
				        }
				        busiOrder.push(busiOrderUser);
			        }
			        if(CacheData.isGov(toIdentidiesTypeCd)){//政企
				        boProdItems = [
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"ADD",
		    					value:subUserInfo.custId
		    				}
					    ]
				    }else{//公众客户
				        boProdItems = [
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"DEL",
		    					value:OrderInfo.cust.custId
		    				},
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"ADD",
		    					value:subUserInfo.custId
		    				}
					    ]
				    }
		        }else{//使用人老模式
				    boProdItems = [
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"DEL",
		    					value:OrderInfo.cust.custId
		    				},
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"ADD",
		    					value:$("#800000011_-1").val()
		    				}
					]
			    }
			}else{//未选择使用人
				if(!CacheData.isGov(toIdentidiesTypeCd)){//公众客户
				    boProdItems = [
						{
		    				itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    				prodSpecItemId:"",
		    				state:"DEL",
		    				value:OrderInfo.cust.custId
		    			},
						{
		    				itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    				prodSpecItemId:"",
		    				state:"ADD",
		    				value:_toCustId
		    			}
					]
				}
			}
			transferCust.data.boProdItems = boProdItems;
			busiOrder.push(transferCust);
        //添加证号关系
        _addCertiAccNbrRels(_transchoosedCustInfo, transferCust, toIdentidiesTypeCd, toIdCardNumber, toCustName, toAddressStr);
			//账户节点变更节点
			var boAccountInfoAdd={
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
						actionClassCd: CONST.ACTION_CLASS_CD.ACCT_ACTION,
	                    boActionTypeCd: CONST.BO_ACTION_TYPE.ACCT_INFO_MODIFY
					}, 
					data:{}
				};
				//创建账户变更节点
				boAccountInfoAdd.data.boAccountInfos=[];
				var _boProdAcctInfosOld={
                        acctCd: origAcct.acctCd,
                        acctId: origAcct.acctId,
                        acctName: origAcct.name,
                        CN:origAcct.acctName==undefined?"":origAcct.acctName,
                        acctTypeCd: "1",
                        partyId: origAcct.custId,
                        prodId: order.prodModify.choosedProdInfo.productId,
                        state: "DEL"
				};
				var _boProdAcctInfos={
					 	acctCd: origAcct.acctCd,
					 	acctId: origAcct.acctId,
					 	acctName: $.trim($("#acctName").val()),
					 	acctTypeCd: "1",
					 	//这里取新客户ID
					 	partyId: _toCustId,
					 	prodId: order.prodModify.choosedProdInfo.productId,
					 	state: "ADD"
				};
				if(_boProdAcctInfos.acctName==origAcct.name){
					_boProdAcctInfos.CN=acctName==undefined?"":origAcct.acctName;
				}
				boAccountInfoAdd.data.boAccountInfos.push(_boProdAcctInfosOld);
				boAccountInfoAdd.data.boAccountInfos.push(_boProdAcctInfos);
				
				busiOrder.push(boAccountInfoAdd);
				//订单提交
				SoOrder.submitOrder(busiOrder);
	};

    /**
     * 添加证号关系节点
     * @param _transchoosedCustInfo
     * @param busiOrderAdd
     * @param toIdentidiesTypeCd
     * @param toIdCardNumber
     * @param toCustName
     * @param toAddressStr
     * @private
     */
    var _addCertiAccNbrRels = function (_transchoosedCustInfo, busiOrderAdd, toIdentidiesTypeCd, toIdCardNumber, toCustName, toAddressStr) {
        if (!CacheData.isGov(_transchoosedCustInfo.identityCd)) {//判断是否是政企客户，为个人客户时封装证号关系节点
            busiOrderAdd.data.boCertiAccNbrRels = [];

            var ca = $.extend(true, {}, OrderInfo.boCertiAccNbrRel);
            ca.accNbr = order.prodModify.choosedProdInfo.accNbr;
            ca.state = "ADD";
            if (ec.util.isObj(_transchoosedCustInfo) && _transchoosedCustInfo.custId != "-1") {
                ca.partyId = _transchoosedCustInfo.custId;
                ca.certType = _transchoosedCustInfo.identityCd;
                ca.certNum = _transchoosedCustInfo.idCardNumber;
                ca.certNumEnc = _transchoosedCustInfo.certNum;
                ca.custName = _transchoosedCustInfo.partyName;
                ca.custNameEnc = _transchoosedCustInfo.CN;
                ca.certAddress = _transchoosedCustInfo.addressStr;
                ca.certAddressEnc = _transchoosedCustInfo.address;
            } else {
                ca.partyId = "-1";
                ca.certType = toIdentidiesTypeCd;
                ca.certNum = toIdCardNumber;
                ca.custName = toCustName;
                ca.certAddress = toAddressStr;
            }
            ca.serviceType = "1300";//返档
            busiOrderAdd.data.boCertiAccNbrRels.push(ca);
        }
    };

    /**
     * 返档一证五号校验
     * @param toCustId
     * @param toIdentidiesTypeCd
     * @param toIdCardNumber
     * @param toCustName
     * @param toAddressStr
     * @private
     */
    var _transOneCertFiveNumCheck = function (toCustId, toIdentidiesTypeCd, toIdCardNumber, toCustName, toAddressStr) {
        //一证五号校验
        var checkResult = true;
        var inParam = {};
        var transProdId = "-1";
        if (ec.util.isObj(toCustId)) {
            inParam = {
                "certType": _transchoosedCustInfo.identityCd,
                "certNum": _transchoosedCustInfo.idCardNumber,
                "certAddress": _transchoosedCustInfo.addressStr,
                "custName": _transchoosedCustInfo.partyName,
                "custNameEnc": _transchoosedCustInfo.CN,
                "certNumEnc": _transchoosedCustInfo.certNum,
                "certAddressEnc": _transchoosedCustInfo.address
            };
            transProdId = _transchoosedCustInfo.prodId;
        } else {
            inParam = {
                "certType": toIdentidiesTypeCd,
                "certNum": toIdCardNumber,
                "certAddress": toAddressStr,
                "custName": toCustName
            };
        }
        if (!order.cust.preCheckCertNumberRel(transProdId, inParam)) {
            checkResult = false;
        }
        return checkResult;
    };
    
    /**
     * 针对预开通的政企客户返档初始化页面，一般从“政企批开”来做“返档”
     * 满足3个条件：政企客户、预开通、已实名
     */
    var _initReturnCust4GovEnt = function(){
    	//非政企客户或开关未开启，不做任何处理
    	var isGovEntCust = CacheData.isGov(OrderInfo.cust.identityCd);
    	var isTransferCustFlagOn = query.common.queryPropertiesStatus("TRANSFER_CUST_FLAG");
    	if(!(isGovEntCust && isTransferCustFlagOn && _returnFlag)){
    		return;
    	}
    	//1.展示使用人按钮
    	$("#govUser").show();
        $('#choose_user_btn_-1').off('click').on('click',function(){
			order.main.toChooseUser("-1");
		}).show();
        //2.去除客户定位
        $("#queryCust").hide();
        //3.展示账户信息，且不可修改
        //3.1调接口查询账户
        _initAcct();
        //3.2展示账户ID
        $("#accountDiv").show();
        //3.3展示账户名称
        $("#defineNewAcct").show();
        //3.4禁止修改账户
        $("#acctName").attr("disabled","disabled");
        $("#acctSelect").attr("disabled","disabled");
        $('#acctSelect').attr("style", "background-color:#E8E8E8;width:282px;");
		$("#account").find("a").hide();
		//4.最后初始化订单基础数据
		SoOrder.builder(CONST.returnCustSubmitFlag);
    };
    
    /**
     * 针对预开通的政企客户返档提交，一般从“政企批开”来做“返档”
     */
	var _returnCustSubmit4GovEnt=function(){
//		var toCustId = $("#litransCustId").attr("transCustId");
		var toCustId = OrderInfo.cust.custId;
		var _toCustId = -1;
		if(ec.util.isObj(toCustId)){
			_toCustId = toCustId;
		}
		
		var nameCN = OrderInfo.cust.CN;
		var toCustName = OrderInfo.cust.partyName;
		var toAddressStr = OrderInfo.cust.addressStr;
		var toIdCardNumber = OrderInfo.cust.idCardNumber;
		var toIdentidiesTypeCd = OrderInfo.cust.identityCd;
		
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
		if($.trim($("#acctName").val())==""){
			$.alert("提示","帐户名称不能为空！");
			return;
		}

        //一证五号校验
        if (!_transOneCertFiveNumCheck(toCustId, toIdentidiesTypeCd, toIdCardNumber, toCustName, toAddressStr)) {
            return;
        }

		//订单备注信息
		OrderInfo.orderDataRemark =$("#order_remark").val();
		var acctId = $("#acctSelect").val(); //要更换的帐户ID
		var acctCd = -1;
		if(acctId > 0){
			acctCd = $("#acctSelect").find("option:selected").attr("acctcd"); //要更换的帐户合同号
		}
		
		//返档在订单提交时才初始化订单数据，特殊，增加标识
//		SoOrder.builder(CONST.returnCustSubmitFlag);
		//返档要求partyId取返档后客户ID，做特殊处理redmine 794183
		OrderInfo.orderData.orderList.orderListInfo.partyId = _toCustId;
		
		//查询产品下帐户信息
//		var response = $.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", {
//			areaId : order.prodModify.choosedProdInfo.areaId,
//			prodId : order.prodModify.choosedProdInfo.prodInstId,
//			acctNbr: order.prodModify.choosedProdInfo.accNbr
//		});
//		if(response.code != 0||response.data.length==0) {
//			if(response.code==-2){
//				$.alertM(response.data);
//			}
//			else{
//				$.alert("提示","当前产品帐户定位失败，请联系管理员");
//			}
//			return;
//		}

        OrderInfo.initData(
	    	CONST.ACTION_CLASS_CD.PROD_ACTION,
	    	CONST.BO_ACTION_TYPE.PRODUCT_INFOS,
	    	43,
	    	CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_INFOS),
	    	""
        );
			
		var busiOrders = [];
		var choosedProdInfo = order.prodModify.choosedProdInfo;		
		var changeUserBusiOrder = {
			areaId : OrderInfo.getProdAreaId(choosedProdInfo.prodInstId),	
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : {
				objId 		: choosedProdInfo.productId,	//业务对象规格ID
				instId 		: choosedProdInfo.prodInstId,	//业务对象实例ID
				isComp 		: "N", 							//是否组合
				offerTypeCd : "1",  						//1主销售品
				accessNumber: choosedProdInfo.accNbr  		//业务号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION, //动作大类							
				boActionTypeCd: CONST.BO_ACTION_TYPE.PRODUCT_INFOS //动作小类
			}, 
			data:{
				boProdItems		 :[],
				boCertiAccNbrRels:[]
			}
		};		
		
		var prodAttrsOfUserId = null;
        var isRealUserFlagON = query.common.queryPropertiesStatus("REAL_USER_"+OrderInfo.cust.areaId.substr(0,3));
        if(isRealUserFlagON){
            $.each(OrderInfo.subUserInfos, function () {
            	//this.prodId == choosedProdInfo.prodInstId
                if (this.prodId == -1) {
                    var ca = $.extend(true, {}, OrderInfo.boCertiAccNbrRel);
                    ca.accNbr = choosedProdInfo.accNbr;
                    ca.state = "ADD";
                    if (ec.util.isObj(this)) {
                        ca.partyId = ec.util.isObj(this.custId)?this.custId.toString():"-1";
                        ca.certType = this.orderIdentidiesTypeCd;
                        ca.certNum = this.identityNum;
                        ca.custName = this.custName;
                        ca.certAddress = this.orderAttrAddr;
                        ca.certNumEnc = this.certNumEnc;
                        ca.custNameEnc = this.custNameEnc;
                        ca.certAddressEnc = this.certAddressEnc;
                        ca.serviceType = "1200";//变更使用人
                        changeUserBusiOrder.data.boCertiAccNbrRels.push(ca);
                        prodAttrsOfUserId = ca.partyId;
                    }
                }
            });
        } else{
            $.each(OrderInfo.choosedUserInfos, function () {
            	//this.prodId == choosedProdInfo.prodInstId
	            if (this.prodId == -1) {
	                var ca = $.extend(true, {}, OrderInfo.boCertiAccNbrRel);
	                ca.accNbr = choosedProdInfo.accNbr;
	                ca.state = "ADD";
	                if (ec.util.isObj(this.custInfo)) {
	                    ca.partyId = this.custInfo.custId;
	                    ca.certType = this.custInfo.identityCd;
	                    ca.certNum = this.custInfo.idCardNumber;
	                    ca.certNumEnc = this.custInfo.certNum;
	                    ca.custName = this.custInfo.partyName;
	                    ca.custNameEnc = this.custInfo.CN;
	                    ca.certAddress = this.custInfo.addressStr;
	                    ca.certAddressEnc = this.custInfo.address;
	                    ca.serviceType = "1200";//变更使用人
	                    changeUserBusiOrder.data.boCertiAccNbrRels.push(ca);
	                    prodAttrsOfUserId = ca.partyId;
	                }
	            }
            });
        }
        
        var boProdItemsAdd = {
        	"state"			:"ADD",
        	"value"			:prodAttrsOfUserId,
			"itemSpecId"	:CONST.PROD_ATTR.PROD_USER,
			"prodSpecItemId":""
		};
        var boProdItemsDel = {
			"state"			:"DEL",
        	"value"			:prodAttrsOfUserId,
			"itemSpecId"	:CONST.PROD_ATTR.PROD_USER,
			"prodSpecItemId":""
		};
//        changeUserBusiOrder.data.boProdItems.push(boProdItemsDel);
        changeUserBusiOrder.data.boProdItems.push(boProdItemsAdd);
		busiOrders.push(changeUserBusiOrder);
		
		//订单提交
		SoOrder.submitOrder(busiOrders);
	};
	
	var _ecs_custTransfer_Submit =function(){
		var toCustId = $("#litransCustId").attr("transCustId");
		var _toCustId = -1;
		if(toCustId!=""){
			_toCustId = toCustId;
		}
		var toCustName = $("#litransCustId").attr("transCustName");
		var toAddressStr = $("#litransCustId").attr("transAddressStr");
		var nameCN = $("#litransCustId").attr("CN");
		var toIdentidiesTypeCd = $("#p_cust_tra_identityCd").val();
		var toIdCardNumber = $("#litransidCardNumber").attr("transidCardNumber");
	    if(OrderInfo.reFileType== 'mainNoRealname' ||OrderInfo.reFileType== 'viceRealname' || OrderInfo.reFileType== 'viceNoRealname'){
			 if (CacheData.isGov(toIdentidiesTypeCd)) {
			    if(($("#800000011_-1_name").val()==null || $("#800000011_-1_name").val()=='')){
				    $.alert("提示","政企客户必须选择使用人！");
				    return;
			    }
		    };
		}
		if(OrderInfo.reFileType== 'viceNoRealname'){
		    toCustId  = OrderInfo.reFileMainCustInfo.custId;
		    _toCustId = OrderInfo.reFileMainCustInfo.custId;
		    toCustName = OrderInfo.reFileMainCustInfo.partyName;
		    toAddressStr = OrderInfo.reFileMainCustInfo.addressStr;
		    toIdentidiesTypeCd = OrderInfo.reFileMainCustInfo.identityCd;
		    toIdCardNumber = OrderInfo.reFileMainCustInfo.idCardNumber;
		    _transchoosedCustInfo = OrderInfo.reFileMainCustInfo;
		}else if(OrderInfo.reFileType== 'viceRealname' || OrderInfo.reFileType== 'mainRealname'){
			toCustId = OrderInfo.cust.custId;
			_toCustId = OrderInfo.cust.custId;
			toCustName = OrderInfo.cust.partyName;
		    toAddressStr = OrderInfo.cust.addressStr;
		    toIdentidiesTypeCd = OrderInfo.cust.identityCd;
		    toIdCardNumber = OrderInfo.cust.idCardNumber;
			_transchoosedCustInfo = OrderInfo.cust;
		}
		if(toIdCardNumber==undefined || toCustId==undefined){		
			$.alert("提示","未定位目标客户，请先定位！","information");		
			return;
	    }
	    if(OrderInfo.reFileType== 'mainRealname' || OrderInfo.reFileType== 'mainNoRealname'){
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
	    }
        //一证五号校验
        if(!_transOneCertFiveNumCheck(toCustId,toIdentidiesTypeCd,toIdCardNumber,toCustName,toAddressStr)){
		    return;
        }

        var acctId = $("#acctSelect").val(); //要更换的帐户ID
		var acctCd = -1;
		if(acctId>0){
			acctCd = $("#acctSelect").find("option:selected").attr("acctcd"); //要更换的帐户合同号
		}
		var subUserInfos = OrderInfo.subUserInfos;
		var choosedUserInfos = OrderInfo.choosedUserInfos;
		SoOrder.builder(CONST.returnCustSubmitFlag);//返档在订单提交时才初始化订单数据，特殊，增加标识
		OrderInfo.subUserInfos = subUserInfos;
		OrderInfo.choosedUserInfos = choosedUserInfos;
		//返档要求partyId取返档后客户ID，做特殊处理redmine 794183
		OrderInfo.orderData.orderList.orderListInfo.partyId = _toCustId;
        OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,_BO_ACTION_TYPE,43,CONST.getBoActionTypeName(_BO_ACTION_TYPE),"");
		var busiOrder = [	];
		//新建客户节点
		if(OrderInfo.reFileType == 'mainNoRealname'){
			if(toCustId==""){
				var boCustIdentitie = {
					identidiesTypeCd : toIdentidiesTypeCd,	//证件类型编码			                
					identityNum : toIdCardNumber, //证件号码
					defaultIdType :toIdentidiesTypeCd,	//证件类型编码		
					state : "ADD"
				};
				if ("1" === toIdentidiesTypeCd) { //身份证
					var identityPic = $("#img_ransferCustPhoto").data("identityPic");
					if (identityPic != undefined) {
						boCustIdentitie.identidiesPic = identityPic;
					}
				}
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
							boCustIdentities: [boCustIdentitie],
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
		}
			//返档
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
			            boProdStatuses : [{
							prodStatusCd : CONST.PROD_STATUS_CD.READY_PROD,
							state : "DEL"
						},{
							prodStatusCd : CONST.PROD_STATUS_CD.DONE_PROD,
							state : "ADD"
						}
						],
			            busiOrderAttrs : [{			            				    				
			            	itemSpecId : "111111118",	    				
			            	value : $("#order_remark").val() //订单备注		    			
			            }],
			            boCusts : [],
			            boProdItems : []
					}
			};
			var boCusts = [];
			if(OrderInfo.reFileType== 'mainNoRealname' || OrderInfo.reFileType== 'viceNoRealname'){
				var oldCustId = "";
				if(order.prodModify.choosedProdInfo.custId !=null){
					oldCustId = order.prodModify.choosedProdInfo.custId;
				}
				boCusts  = [{			                
				    partyId : oldCustId,			                
				    partyProductRelaRoleCd : 0,			                
					state : "DEL"			            
				},
			    {
			        partyId : _toCustId,
			        partyProductRelaRoleCd : 0,
			        state : "ADD"
			    }]
			}
			transferCust.data.boCusts = boCusts;
			var  boProdItems = [];
		if(OrderInfo.reFileType!= 'mainRealname'){
			//使用人新模式
			if($("#800000011_-1_name").val()!=null && $("#800000011_-1_name").val()!= ''){//选择了使用人
			        var subUserInfo = subUserInfos[0];
			        if(subUserInfo.isOldCust == "N"){
				        var busiOrderUser = {
					        areaId	: order.prodModify.choosedProdInfo.areaId,// 受理地区ID
					        busiOrderInfo : {
						        seq : OrderInfo.SEQ.seq--
					        },
					        busiObj : { // 业务对象节点
						        instId		: subUserInfo.custId,
						        accessNumber: order.prodModify.choosedProdInfo.accNbr
					        },
					        boActionType : {
						        actionClassCd	: CONST.ACTION_CLASS_CD.CUST_ACTION,
						        boActionTypeCd	: CONST.BO_ACTION_TYPE.CUST_CREATE
					        },
					        data : {
						        boCustInfos 		: [],
						        boCustIdentities	: [],
						        boPartyContactInfo	: [],
						        boCustCheckLogs     : [],
						        boCustProfiles      : []
					        }
				        };
				        // 信息节点
				        busiOrderUser.data.boCustInfos.push({
					        name			: subUserInfo.orderAttrName,		// 客户名称
					        ignore			: "Y", 								// 临时方法,新建C1订单提交不校验
					        custType		: subUserInfo.servType,  			// 新建客户类型1:使用人,2责任人
					        ownerProd		: subUserInfo.prodId,				// 客户产品归属
					        state			: "ADD",							// 状态
					        areaId			: order.prodModify.choosedProdInfo.areaId,// 订单地区ID
					        telNumber 		: subUserInfo.orderAttrPhoneNbr,	// 联系电话
					        addressStr		: subUserInfo.orderAttrAddr,		// 客户地址
					        partyTypeCd		: 1,								// 客户类型
					        defaultIdType	: subUserInfo.orderIdentidiesTypeCd,// 证件类型
					        mailAddressStr	: subUserInfo.orderAttrAddr,		// 通信地址
					        businessPassword: ""								// 客户密码
				        });
				        // 证件节点
				        busiOrderUser.data.boCustIdentities.push({
					        state			: "ADD",	// 状态
					        isDefault		: "Y",		// 是否首选
					        identityNum		: subUserInfo.identityNum,			// 证件号码
					        identidiesPic	: subUserInfo.identityPic,			// 二进制证件照片
					        identidiesTypeCd: subUserInfo.orderIdentidiesTypeCd	// 证件类型
				        });
				        // 联系人节点
				        if(ec.util.isObj(subUserInfo.orderAttrPhoneNbr)){
					        var contactGender = "1";
					        if(subUserInfo.orderIdentidiesTypeCd == "1"){
						        if (parseInt(subUserInfo.identityNum.substr(16, 1)) % 2 == 1) {
							        contactGender = "1";
						        } else {
							        contactGender = "2";
						        }
					        }
					        busiOrderUser.data.boPartyContactInfo.push({
						        state			: "ADD",						// 状态
						        staffId 		: OrderInfo.staff.staffId,		// 员工ID
						        statusCd		: "100001",						// 订单状态
						        headFlag		: "1",							// 是否首选联系人
						        contactName		: subUserInfo.orderAttrName,	// 参与人的联系人名称
						        contactType		: "10",							// 联系人类型
						        mobilePhone		: subUserInfo.orderAttrPhoneNbr,// 参与人的移动电话号码
						        contactGender	: contactGender,				// 参与人联系人的性别
						        contactAddress	: subUserInfo.orderAttrAddr		// 参与人的联系地址
					        });
				        }
				        if(subUserInfo.checkCustCertSwitch == "ON"){
					        var boCustCheckLog = {
						        checkMethod			: subUserInfo.checkMethod,
						        custId 		        : subUserInfo.custId,
						        objId		        : "",	
						        checkDate		    : subUserInfo.checkDate,		
						        checker		        : subUserInfo.checker,
						        checkChannel		: subUserInfo.checkChannel,						
						        certCheckResult		: subUserInfo.certCheckResult,
					        	errorMessage	    : subUserInfo.errorMessage,				
					        	staffId	            : subUserInfo.staffId		
					        };
					        busiOrderUser.data.boCustCheckLogs.push(boCustCheckLog);
					        var realNameChech = {
							        partyProfileCatgCd: CONST.BUSI_ORDER_ATTR.REAL_NAME_CHECK,
							        profileValue: "1",
				                    state: "ADD"
					        };
					        busiOrderUser.data.boCustProfiles.push(realNameChech);
				        }
				        busiOrder.push(busiOrderUser);
			        }
			        if(CacheData.isGov(toIdentidiesTypeCd)){//政企
				        boProdItems = [
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"ADD",
		    					value:subUserInfo.custId
		    				}
					    ]
				    }else{//公众客户
				        boProdItems = [
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"DEL",
		    					value:OrderInfo.cust.custId
		    				},
							{
		    					itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    					prodSpecItemId:"",
		    					state:"ADD",
		    					value:subUserInfo.custId
		    				}
					    ]
				    }
			}else{//未选择使用人
				if(!CacheData.isGov(toIdentidiesTypeCd)){//公众客户
				    boProdItems = [
						{
		    				itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    				prodSpecItemId:"",
		    				state:"DEL",
		    				value:OrderInfo.cust.custId
		    			},
						{
		    				itemSpecId:CONST.PROD_ATTR.PROD_USER,
		    				prodSpecItemId:"",
		    				state:"ADD",
		    				value:_toCustId
		    			}
					]
				}
			}
		}	
			transferCust.data.boProdItems = boProdItems;
			busiOrder.push(transferCust);
			_addCertiAccNbrRels(_transchoosedCustInfo, transferCust, toIdentidiesTypeCd, toIdCardNumber, toCustName, toAddressStr);
		if(OrderInfo.reFileType== 'mainRealname' || OrderInfo.reFileType== 'mainNoRealname'){
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
			    }else{
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
			//新建帐户节点
			if($("#acctSelect").val()==-1){
				var acctName = $("#acctName").val();
				if(acctName==toCustName){
					OrderInfo.createAcct(busiOrder, -1,_toCustId,nameCN);
				}else{
					OrderInfo.createAcct(busiOrder, -1,_toCustId);
				}
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
			}else{
				$.confirm("提示信息","只更换了所属客户，而没有更换付费帐户<br/>确定吗？", {
					yes : function(){
						SoOrder.submitOrder(busiOrder);
					},
					no : function(){
						return;
					}
				}, "question");
			};
		}else{
			//订单提交
			SoOrder.submitOrder(busiOrder);
		}
	}

    //ecs返档初始化帐户展示
	var _ecs_initAcct = function(custId) {
		var param = {
			"custId" : custId
		};
		var response = order.prodModify.returnAccount(param);
		if (response.code == 0) {
			var returnMap = response.data;
			if (returnMap.resultCode == 0) {
				if (returnMap.accountInfos && returnMap.accountInfos.length > 0) {
					$.each(returnMap.accountInfos, function(i, accountInfo) {
								var found = false;
								$.each($("#acctSelect option"), function(i,
												option) {
											if ($(option).val() == accountInfo.acctId) {
												found = true;
												return false;
											}
										});
								if (!found) {
									$("<option>").text(accountInfo.name + " : "
											+ accountInfo.accountNumber).attr(
											"value", accountInfo.acctId)
											.attr("acctcd",
													accountInfo.accountNumber)
											.appendTo($("#acctSelect"));
								}
								$("#acctSelect").find("option[value="
										+ accountInfo.acctId + "]").attr(
										"selected", "selected");
							});
					$("#defineNewAcct").hide();
					// 默认账户名称为第一个账户的名称
					$("#acctName")
							.attr("value", returnMap.accountInfos[0].name);
				} else {
					_whetherCreateAcct();
				}
			} else {
				$.alert("提示", "客户的帐户定位失败，请联系管理员，若要办理新装业务请稍后再试或者新建帐户。错误细节："
								+ returnMap.resultMsg);
			}
		} else {
			$.alert("提示", response.data);
		}
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
		certTypeByPartyType:_certTypeByPartyType,
		showReturnFile : _showReturnFile,
		returnFile_Submit : _returnFile_Submit,
		changeDataReturn_Submit : _changeDataReturn_Submit,
		showCustUpdate:_showCustUpdate,
		returnCust_Submit:_returnCust_Submit,
        addCertiAccNbrRels:_addCertiAccNbrRels,
        transOneCertFiveNumCheck:_transOneCertFiveNumCheck,
        ecs_custTransfer_Submit:_ecs_custTransfer_Submit,
        ecs_initAcct : _ecs_initAcct
	};
})();
$(function(){
	prod.transferModify.initDic();
	//客户类型关联证件类型下拉框
	$("#div_tra_identidiesTypeCd").empty();
	prod.transferModify.certTypeByPartyType(1);
	prod.transferModify.identidiesTypeCdChoose($("#div_tra_identidiesTypeCd").children(":first-child"));
});
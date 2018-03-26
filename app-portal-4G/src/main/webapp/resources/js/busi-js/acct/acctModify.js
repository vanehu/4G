CommonUtils.regNamespace("acct", "acctModify");
/**
 * 二次业务帐户信息修改
 */
acct.acctModify = (function(){
	//这几个节点将用来装旧帐户信息
	var boAccountInfoDEL = {};
	var boPaymentAccountDEL = {};
	var boAccountMailingDEL = {};
	//修改帐户信息规则校验
	var _showAcctInfoModify = function(){
		var param = order.prodModify.getCallRuleParam(CONST.BO_ACTION_TYPE.ACCTINFOMODIFY,order.prodModify.choosedProdInfo.prodInstId);
		var callParam = {
				boActionTypeCd : CONST.BO_ACTION_TYPE.ACCTINFOMODIFY,
				boActionTypeName : CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ACCTINFOMODIFY),
				accessNumber : order.prodModify.choosedProdInfo.accNbr,
				prodOfferName : order.prodModify.choosedProdInfo.prodOfferName
			};

		var checkRule = rule.rule.prepare(param,'acct.acctModify.acctInfoModify',callParam);
		if (checkRule) return ;
//		SoOrder.builder();
		OrderInfo.initData(CONST.ACTION_CLASS_CD.ACCT_ACTION,CONST.BO_ACTION_TYPE.ACCTINFOMODIFY,10,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ACCTINFOMODIFY),"");	
	};
	
	//获取产品下帐户信息，跳转并初始化修改帐户信息页面
	var _acctInfoModify = function(){
		if(!order.prodModify.choosedProdInfo.prodInstId || !order.prodModify.choosedProdInfo.accNbr){
			$.alert("提示","产品信息定位异常，请联系管理员");
			$("#orderedprod").show();
			$("#order_prepare").show();
			$("#order_tab_panel_content").show();
			$("#order_confirm").show();
			$("#order_fill_content").hide();
			order.prepare.hideStep();
			return;
		}		
		var param={
				prodId : order.prodModify.choosedProdInfo.prodInstId,
				acctNbr : order.prodModify.choosedProdInfo.accNbr
		};
		$.callServiceAsHtml(contextPath + "/order/prodModify/acctInfoModify", param, {
			"before":function(){
				$.ecOverlay("<strong>正在确认当前产品帐户,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},						
			"done":function(response){
				if(response.code!=0){
					$.alert("提示","无法确认当前产品帐户，请联系管理员");
					$("#orderedprod").show();
					$("#order_prepare").show();
					$("#order_tab_panel_content").show();
					$("#order_confirm").show();
					$("#order_fill_content").hide();
					order.prepare.hideStep();
					return;
				}
				$("#order_fill_content").html(response.data).show();
				$(".h2_title").append(order.prodModify.choosedProdInfo.productName+"-"+order.prodModify.choosedProdInfo.accNbr);
				_chooseAcctToModify("#acctInfoList tr",$("#acctInfoList").children(":first-child"));
				$("#acctInfoList tr").each(function(){$(this).off("click").on("click",function(event){
					_chooseAcctToModify("#acctInfoList tr",this);
					event.stopPropagation();
					});
				});				
				$("#fillLastStep").click(function(){
					order.prodModify.cancel();
				});
			}
		});
	};
	
	//切换展示要修改的帐户信息
	var _chooseAcctToModify = function(trs, $tr){
		$(trs).removeClass("plan_select");
		$(trs).children(":first-child").html("");
		$($tr).addClass("plan_select");
		$($tr).children(":first").html("<i class='select'></i>");
		//查询要修改的帐户详情
		var param = {
				acctId : $tr.attr("id")
		};
		var response = $.callServiceAsHtml(contextPath + "/order/prodModify/queryAcctDetailInfo", param);											
//		if(response.errorsList!=undefined && response.errorsList!="null"){					
//			$.alert("提示", response.errorsList);									
//		} 	
		if(response.code!=0){
			$("#acctInfoDetail").html("账户信息加载失败").show();
			return;
		}
		$("#acctInfoDetail").html(response.data).show();
		_getBILL_POST();	
		//删去重复加载的选择项
		var postTypes = $("#postType option:not(:first)");				
		$.each(postTypes, function(i, postType){					
			if($(postType).val()==$("#postType option:first").val()){						
				$(postType).remove();
				return false;
			}
		});
		var billContents = $("#billContent option:not(:first)");
		$.each(billContents, function(i, billContent){
			if($(billContent).val()==$("#billContent option:first").val()){
				$(billContent).remove();
				return false;
			}
		});
		var postCycles = $("#postCycle option:not(:first)");
		$.each(postCycles, function(i, postCycle){
			if($(postCycle).val()==$("#postCycle option:first").val()){
				$(postCycle).remove();
				return false;
			}
		});
		//帐户信息显示或隐藏初始化
		_paymentType();
		_billPostType();
		if($("#billContent").val()==14){
			$("#receipt").show();
		}
		//记录旧的帐户信息
		boAccountInfoDEL = {
				acctCd : $("#acctInfoList .plan_select td:eq(0)").attr("id"),        //*帐户合同号
				acctName : $("#acctName").val(),                            //*帐户名称
				acctTypeCd : "1",
				partyId : $("#partyId").val(),                              //*客户ID
				prodId : order.prodModify.choosedProdInfo.prodInstId,       //产品ID
				state : "DEL"
		};
		boPaymentAccountDEL = {
				bankAcct : $("#bankAcct").val(),
				bankId : $("#bankId").val(),
				limitQty : "1",
				paymentAcctTypeCd : $("#paymentType").val(),     //*支付类型 100000:现金 110000:银行 
				paymentAccountId : $("#paymentType").attr("name"),
				paymentMan : $("#paymentMan").val(),
				state : "DEL"
		};
		if($("#postType").val()!=-1){
			boAccountMailingDEL = {
					mailingType : $("#postType").val(),   //*投递方式
					param1 : $("#postAddress").val(),     //*投递地址
					param2 : "1",                         //格式ID
					param3 : $("#postCycle").val(),       //*投递周期
					param7 : $("#billContent").val(),     //*账单内容
					state : "DEL"
			};
			if($("#postType").val()==11 || $("#postType").val()==15){
				boAccountMailingDEL.param1 = $("#postAddress").val()+","+$("#zipCode").val()+","+$("#consignee").val(); //*收件地址,邮编,收件人			
			}
		}
		else{
			boAccountMailingDEL = {};
		}
	};
	
	//查询工号权限：能否选择银行托收
	var _ifCanAdjustBankPayment = function(){
		var jr = $.callServiceAsJson(contextPath+"/acct/ifCanAdjustBankPayment", {});
		if(jr.data=="0"){
			$("#paymentType").append("<option value='110000'>银行</option>");
		}
	};
	
	//获取账单投递信息主数据	
	var _getBILL_POST = function(showNewDetail){
		var configParam = {
				CONFIG_PARAM_TYPE : "BILL_POST"
		};				
		var qryConfigUrl=contextPath+"/order/queryApConf";	
		var jr = $.callServiceAsJsonGet(qryConfigUrl, configParam);
		if(jr.code==0 && jr.data){
			for(var n=0;n<jr.data.length;n++){								
				//账单投递方式								
				if(jr.data[n].BILL_POST_TYPE){									
					$.each(jr.data[n].BILL_POST_TYPE, function(i, postType){										
						$("<option>").attr("value",postType.COLUMN_VALUE).text(postType.COLUMN_VALUE_NAME).appendTo($("#postType"));									
					});								
				}								
				//账单投递内容								
				else if(jr.data[n].BILL_POST_CONTENT){									
					$.each(jr.data[n].BILL_POST_CONTENT, function(i, postContent){										
						$("<option>").attr("value",postContent.COLUMN_VALUE).text(postContent.COLUMN_VALUE_NAME).appendTo($("#billContent"));									
					});								
				}								
				//账单投递周期								
				else if(jr.data[n].BILL_POST_CYCLE){									
					$.each(jr.data[n].BILL_POST_CYCLE, function(i, postCycle){										
						$("<option>").attr("value",postCycle.COLUMN_VALUE).text(postCycle.COLUMN_VALUE_NAME).appendTo($("#postCycle"));									
					});								
				}							
			}
			if(showNewDetail){
				showNewDetail();
			}
		}
		
	};
	
	//选择支付方式
	var _paymentType = function(){
		if($("#paymentType").val()==100000){
			$(".bank").hide();
			$("#paymentType").parent().addClass("full");
		}
		else{
			$(".bank").show();
			$("#paymentType").parent().removeClass("full");
		}
	};
	
	//选择账单投递方式
	var _billPostType = function(){
		if($("#postType").val()==-1){
			$(".billPost").hide();
			$("#postType").parent().addClass("full");
			$("#billContent").find("option[value=11]").attr("selected","selected");
			$("#postType").find("option[value=12]").show();
			$("#postType").find("option[value=13]").show();
			$("#postType").find("option[value=14]").show();
			$("#receipt").hide();
		}
		else{
			$(".billPost").show();
			$("#postType").parent().removeClass("full");
			if($("#postType").val()==12){
				$("#postAddress").attr("placeHolder","请输入有效的传真号码");
			}
			else if($("#postType").val()==13){
				$("#postAddress").attr("placeHolder","请输入有效的Email地址");
			}
			else if($("#postType").val()==14){
				$("#postAddress").attr("placeHolder","请输入有效的手机号");
			}
			else{
				$("#postAddress").attr("placeHolder","请输入准确的收件地址");
			}
		}
	};
	
	//选择账单内容（发票不支持电子投递方式）
	var _billContent = function(){
		if($("#billContent").val()==14){						
			if($("#postType").val()==12 || $("#postType").val()==13 || $("#postType").val()==14){
				$("#postType").find("option[value=11]").attr("selected","selected");
				$("#postAddress").val("");
				$("#postAddress").attr("placeHolder","请输入准确的收件地址");
			}
			$("#postType").find("option[value=12]").hide();
			$("#postType").find("option[value=13]").hide();
			$("#postType").find("option[value=14]").hide();
			$("#receipt").fadeIn("slow");
		}
		else{			
			$("#postType").find("option[value=12]").show();
			$("#postType").find("option[value=13]").show();
			$("#postType").find("option[value=14]").show();
			$("#receipt").fadeOut("slow");
		}
	};
	
	//地区查询（银行查询弹出框）
	var _queryAllArea = function(){
		order.area.chooseAreaTreeAll("p_bank_areaId_val","p_bank_areaId",3);
	};
	
	//银行查询
	var _queryBank = function(pageIndex){
		var _bank;
		var _curPage = 1;
		if(pageIndex==0){
			_bank = {
					name : "",
					bankId : "",
					simpleSpell : "",
					commonRegionId : ""
			};
		}
		if(pageIndex>0){
			_curPage = pageIndex;
			_bank = {
					name : $("#p_bandkname").val(),
					bankId : "",
					simpleSpell : $("#p_simpleSpell").val(),
					commonRegionId : $("#p_bank_areaId").val()
			};
		}
		var param = {				
				bank : _bank,
				curPage : _curPage,
				pageSize : 10
		};
		$.callServiceAsHtml(contextPath + "/acct/getBankList",param,{
			"before":function(){
				$.ecOverlay("<strong>银行查询中,请稍等....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='';
				}
				$("#div_bank_dialog").html(response.data);				
				$("#bank_list tr").each(function(){$(this).off("click").on("click",function(event){
					_chooseBank("#bank_list tr",this);
					event.stopPropagation();
					});
				});
				easyDialog.open({
					container : "div_bank_dialog"
				});				
			}
		});	
	};
	
	//选定银行
	var _chooseBank = function(trs, $tr){
		$(trs).removeClass("plan_select");
		$(trs).children(":first-child").html("");
		$($tr).addClass("plan_select");
		$($tr).children(":first").html("<i class='select'></i>");
	};
	
	//在页面上添加选定的银行信息
	var _fillBankInfo = function(){
		var $bank = $("#bank_list .plan_select");
		$("#bankId").val($($bank).attr("id"));
		$("#bankName").val($($bank).find("td:eq(2)").text());
		if($bank.length > 0){
			easyDialog.close();
		}
		else{
			$.alert("操作提示","请选择银行！");
		}
	};
	
	//帐户信息修改：订单提交
	var _acctInfoModify_Submit = function() {
		//帐户信息填写校验
		if(!SoOrder.checkAcctInfo()){
			return;
		}			
		//订单报文开始组装
		var _busiOrder = {
				areaId : order.prodModify.choosedProdInfo.areaId,
				boActionType : {
					actionClassCd : CONST.ACTION_CLASS_CD.ACCT_ACTION,
					boActionTypeCd : CONST.BO_ACTION_TYPE.ACCTINFOMODIFY
				},
				busiObj : {
					accessNumber : order.prodModify.choosedProdInfo.accNbr,
					instId :  $("#acctInfoList .plan_select").attr("id"), //帐户ID
					isComp : "N",
					objId : "",
					offerTypeCd : "1"
				},
				busiOrderInfo : {
					seq : OrderInfo.SEQ.seq--
				},
				data : {
					boAccountInfos : [],
					boAcct2PaymentAccts : [],
					boAccountItems : [],
					boPaymentAccounts : [],
					boAccountMailings : []
				}
		};
		//帐户基本信息节点
		var boAccountInfoADD = {
				acctCd : $("#acctInfoList .plan_select td:eq(0)").attr("id"),        //*帐户合同号
				acctName : $("#acctName").val(),                            //*帐户名称
				acctTypeCd : "1",
				partyId : $("#partyId").val(),                              //*客户ID
				prodId : order.prodModify.choosedProdInfo.prodInstId,       //产品ID
				state : "ADD"
		};
		_busiOrder.data.boAccountInfos.push(boAccountInfoDEL);
		_busiOrder.data.boAccountInfos.push(boAccountInfoADD);
		//帐户付费关联关系节点
		var boAcct2PaymentAcctADD = {
				priority : "1",
				paymentAccountId : $("#paymentType").attr("name"),
				state : "ADD"
		};
		_busiOrder.data.boAcct2PaymentAccts.push(boAcct2PaymentAcctADD);
		//帐户支付信息节点
		var boPaymentAccountADD = {
				bankAcct : "",
				bankId : "",
				limitQty : "1",
				paymentAcctTypeCd : $("#paymentType").val(),     //*支付类型 100000:现金 110000:银行 
				paymentAccountId : $("#paymentType").attr("name"),
				paymentMan : "",
				state : "ADD"
		};
		if($("#paymentType").val()==110000){
			boPaymentAccountADD.bankAcct = $("#bankAcct").val();        //*银行帐号
			boPaymentAccountADD.bankId = $("#bankId").val();            //*银行ID
			boPaymentAccountADD.paymentMan = $("#paymentMan").val();    //支付人
		}
		_busiOrder.data.boPaymentAccounts.push(boPaymentAccountDEL);
		_busiOrder.data.boPaymentAccounts.push(boPaymentAccountADD);
		//账单投递信息节点
		if(boAccountMailingDEL.mailingType){
			_busiOrder.data.boAccountMailings.push(boAccountMailingDEL);
		}
		if($("#postType").val()!=-1){
			var boAccountMailingADD = {
					mailingType : $("#postType").val(),   //*投递方式
					param1 : $("#postAddress").val(),     //*投递地址
					param2 : "1",                         //格式ID
					param3 : $("#postCycle").val(),       //*投递周期
					param7 : $("#billContent").val(),     //*账单内容
					state : "ADD"
			};
			if($("#postType").val()==11 || $("#postType").val()==15){				
				boAccountMailingADD.param1 = $("#postAddress").val()+","+$("#zipCode").val()+" , "+$("#consignee").val(); //*收件地址,邮编,收件人			
			}
			_busiOrder.data.boAccountMailings.push(boAccountMailingADD);
		}
		var busiOrder = [];
		busiOrder.push(_busiOrder);
		SoOrder.submitOrder(busiOrder);
	};
	
	return{
		showAcctInfoModify : _showAcctInfoModify,
		acctInfoModify : _acctInfoModify,
		ifCanAdjustBankPayment : _ifCanAdjustBankPayment,
		getBILL_POST : _getBILL_POST,
		paymentType : _paymentType,
		billPostType : _billPostType,
		billContent : _billContent,		
		queryAllArea : _queryAllArea,			
		queryBank : _queryBank,
		fillBankInfo : _fillBankInfo,
		acctInfoModify_Submit : _acctInfoModify_Submit
	};
	
})();
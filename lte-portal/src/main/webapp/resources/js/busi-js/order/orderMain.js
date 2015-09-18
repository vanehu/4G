
CommonUtils.regNamespace("order", "main");

order.main = (function(){ 
	
	/**
	 * 填单页面展示
	 * param = {
	 * 		boActionTypeCd : S1,
	 * 		boActionTypeName : "订购",
	 *		offerSpecId : 1234,//销售品规格ID
	 *		offerSpecName : "乐享3G-129套餐",//销售品名称,
	 *		feeType : 2100,付费类型
	 *		viceCardNum : 2,//副卡数量
	 *		offerNum : 3,//销售品数量
	 *		type : 1,//1购套餐2购终端3选靓号
	 *		terminalInfo : {
	 *			terminalName : "iphone",
	 *			terminalCode : "2341234124"
	 *		},
	 *		offerRoles : [
	 *			{
	 *				offerRoleId : 1234,
	 *				offerRoleName : "主卡",
	 *				memberRoleCd : "0",
	 *				roleObjs : [{
	 *					offerRoleId : 1,
	 *					objId : ,
	 *					objName : "CDMA",
	 *					objType : 2
	 *				}]
	 *			},
	 *			{
	 *				offerRoleId : 2345,
	 *				offerRoleName : "副卡",
	 *				memberRoleCd : "1"
	 *			}
	 *		]
	 *	}
	 * 
	 */
	var _buildMainView = function(param) {
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		
		if(OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
			var is_same_feeType=false;//
			if(param.feeTypeMain=="2100" && (param.offerSpec.feeType=="2100"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3103"||param.offerSpec.feeType=="4102"||param.offerSpec.feeType=="4104"||param.offerSpec.feeType=="4105"||param.offerSpec.feeType=="4107")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1200" && (param.offerSpec.feeType=="1200"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103"||param.offerSpec.feeType=="4101"||param.offerSpec.feeType=="4104"||param.offerSpec.feeType=="4106"||param.offerSpec.feeType=="4107")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1201" && (param.offerSpec.feeType=="1201"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103"||param.offerSpec.feeType=="4103"||param.offerSpec.feeType=="4105"||param.offerSpec.feeType=="4106"||param.offerSpec.feeType=="4107")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1202" && (param.offerSpec.feeType=="1202"||param.offerSpec.feeType=="4101"||param.offerSpec.feeType=="4102"||param.offerSpec.feeType=="4103"||param.offerSpec.feeType=="4104"||param.offerSpec.feeType=="4105"||param.offerSpec.feeType=="4106"||param.offerSpec.feeType=="4107")){
				is_same_feeType=true;
			}
			if(!is_same_feeType){
				$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
				return;
			}
		}
		CacheData.isDynamicStored = true;
		$.callServiceAsHtml(contextPath+"/order/main",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					offerChange.fillOfferChange(response,param);
				}else {
					_callBackBuildView(response,param);
				}
				if(CONST.getAppDesc()==1 && (OrderInfo.actionFlag==1 ||OrderInfo.actionFlag==14)){
					//$("#li_is_activation").show();
				}
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//展示回调函数
	var _callBackBuildView = function(response, param) {
		order.prepare.showOrderTitle(OrderInfo.actionTypeName, param.offerSpecName, false);
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_fill_content").html(response.data);
		_initOrderLabel();//初始化订单标签
		_initOfferLabel();//初始化主副卡标签
		_initFeeType(param);//初始化付费方式
		if(CONST.getAppDesc()==0){
			$("#orderAttrDiv").show();
			_initOrderAttr();//初始化4G经办人	
		}
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
			_initAcct();//初始化帐户列表 
			order.dealer.initDealer();//初始化协销		
		}
		_loadOther(param);//页面加载完再加载其他元素
		if(OrderInfo.actionFlag==1){
			$("#templateOrderDiv").show();
		}
		_addEvent();//添加页面事件
		order.phoneNumber.initOffer('-1');//主卡自动填充号码入口已选过的号码
		$("#fillNextStep").off("click").on("click",function(){
			SoOrder.submitOrder();
		});
		if (param.memberChange) {
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#productDiv .pdcardcon:first").show();
			order.prepare.step(1);
			$("#fillLastStep").off("click").on("click",function(){
				order.prodModify.cancel();
			});
		}else{
			$("#fillLastStep").off("click").on("click",function(){
				_lastStep();
			});
		}
	};
	
	//动态添加产品属性、附属销售品等
	var _loadOther = function(param) {
		$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
			var offerRole = this;
			for ( var i = 0; i < this.prodInsts.length; i++) {
				var prodInst = this.prodInsts[i];
				var param = {   
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					prodSpecId : prodInst.objId,
					offerRoleId: prodInst.offerRoleId,
					prodId : prodInst.prodInstId,
					queryType : "1,2",
					objType: prodInst.objType,
					objId: prodInst.objId,
					memberRoleCd : prodInst.memberRoleCd
				};
				AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品
				var obj = {
					ul_id : "item_order_"+prodInst.prodInstId,
					prodId : prodInst.prodInstId,
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					compProdSpecId : "",
					prodSpecId : prodInst.objId,
					roleCd : offerRole.roleCd,
					offerRoleId : offerRole.offerRoleId,
					partyId : OrderInfo.cust.custId
				};
				order.main.spec_parm(obj); //加载产品属性
			}			
		});
	};
	
	var _paymethodChange = function(obj){
		$(".paymethodChange").each(function(){
			if($(this).attr("id")!=$(obj).attr("id")){
				$(this).val($(obj).val());
			}
		});
	};
	
	var _templateTypeCheck = function(obj){
		if($("#isTemplateOrder").attr("checked")=="checked"){//如果选择批量模板
			if($(obj).val()=="0"){//若批量类型选用批开活卡则关闭首话单激活
				$("#isActivation").removeAttr("checked");
			}
			var paytype=$('select[name="pay_type_-1"]').val(); 
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paytype!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paytype!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
			/*
			var paymethod = null ;
			var paymethodid = null ;
			$(".paymethodChange").each(function(){//获取第一个付费方式
				if(paymethod==null){
					paymethod = $(this).val();
					paymethodid = $(this).attr("id");
				}
			});
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paymethod!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paymethod!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
			*/
		}
		return true ;
	};
	
	var _initFeeType = function(param) {
		if (param.feeType != undefined && param.feeType && param.feeType != CONST.PAY_TYPE.NOLIMIT_PAY) {
			$("input[name^=pay_type_][value="+param.feeType+"]").attr("checked","checked");
			$("input[name^=pay_type_]").attr("disabled","disabled");
		}
	};
	
	//初始化帐户展示
	var _initAcct = function() {
		//新客户自动新建帐户
//		if(OrderInfo.cust.custId==-1){
//			_createAcct();
//		}
//		else{
			//主副卡成员变更业务不能更改帐户，只展示主卡帐户
			if(OrderInfo.actionFlag==6){
				var param = {
						prodId : order.prodModify.choosedProdInfo.prodInstId,
						acctNbr : order.prodModify.choosedProdInfo.accNbr,
						areaId : order.prodModify.choosedProdInfo.areaId
				};
				var jr = $.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param);
				if(jr.code==-2){
					$.alertM(jr.data);
					return;
				}
				var prodAcctInfos = jr.data;
				$("#accountDiv").find("label:eq(0)").text("主卡帐户：");
				$.each(prodAcctInfos, function(i, prodAcctInfo){
					$("<option>").text(prodAcctInfo.name+" : "+prodAcctInfo.acctCd).attr("value",prodAcctInfo.acctId)
					.attr("acctcd",prodAcctInfo.acctCd).appendTo($("#acctSelect"));					
				});
				$("#accountDiv").find("a:eq(0)").hide();
			}
			else{
				//新装默认新建帐户
				_createAcct();
			}
			/*
			else{
				//先查询客户下的已有帐户
				var param = {
					custId : OrderInfo.cust.custId
				};				
				$.callServiceAsJson(contextPath+"/order/account", param, {
					"done" : function(response){
						if (response==undefined) {
							$.alert("提示", "帐户查询失败");
							return;
						}
						if (response.code==0) {
							var returnMap = response.data;
							if(returnMap.resultCode==0){
								if(returnMap.accountInfos && returnMap.accountInfos.length > 0){
									$.each(returnMap.accountInfos, function(i, accountInfo){
										$("<option>").text("[已有] "+accountInfo.name+" : "+accountInfo.accountNumber).attr("value",accountInfo.acctId).attr("acctcd",accountInfo.accountNumber).appendTo($("#acctSelect"));
									});
								}			
							}
							else{
								$.alert("提示", "客户的帐户定位失败，请联系管理员，若要办理新装业务请稍后再试或者使用新建帐户。错误细节："+returnMap.resultMsg);
							}
						} else {
							if (response.code==-2) {
								$.alertM(response.data);
								return;
							} else {
								$.alert("提示",response.data);
							}							
						}
						//无论是否查询到旧帐户，最后都新建一个账户
						_createAcct();
					}
				});				
			}*/
//		}
	};
	
	//初始化订单标签
	var _initOrderLabel = function() {
		//订单标签
		$(".ordertabcon:first").show();
		$(".ordertab li:first").addClass("setorder");
		$(".ordertab li").each(function(index){
			$(this).click(function(){
				var orderSeq = $(this).attr("order");
				if (orderSeq > 1) {
					$(".order_copy").show();
				} else {
					$(".order_copy").hide();
				}
				$(this).addClass("setorder").siblings().removeClass("setorder");
				$(this).parents(".ordernav").parent().siblings(".ordercon").find(".ordertabcon").eq(index).show().siblings().hide();
			});
		});
	};
	
	//初始化主副卡标签
	var _initOfferLabel = function() {
		//主副卡标签
		$.each($(".pdcard"),function(i, pdcard){
			$(this).find("li:first").addClass("setcon");
			$.each($(this).find("li"),function(j, li){
				$(this).click(function(){
					$(this).addClass("setcon").siblings().removeClass("setcon");
					$(this).parent().parent().next(".cardtabcon").find(".pdcardcon").eq(j).show().siblings().hide();
				});
			});
		});
		
	};
	//初始化购物车属性
	var _initOrderAttr = function() {
		//客户类型,证件类型
		order.cust.partyTypeCdChoose($("#orderPartyTypeCd").children(":first-child"),"orderIdentidiesTypeCd");
		order.cust.identidiesTypeCdChoose($("#orderIdentidiesTypeCd").children(":first-child"),"orderAttrIdCard");
		
	};
	
	//帐户信息-添加页面点击事件
	var _addEvent = function() {
		//页面点击帐户查询
		$('#acctQueryForm').bind('formIsValid', function(event, form) {
			var acctQueryParam;
			//1.根据接入号查询帐户
			if($("#chooseQueryAcctType").val()==1){
//				var param = {
//						accessNumber : $("#d_query_nbr input").val(),
//						prodPwd : $("#d_query_pwd input").val()
//				};
				//根据接入号查询帐户需先经过产品密码鉴权
//				var jr = $.callServiceAsJson(contextPath + "/order/prodAuth", param);
//				if (jr.code==0){
					acctQueryParam = {
						accessNumber : $("#d_query_nbr input").val()							
					};
//				} 
//				else{
//					$.alert("提示",jr.data);
//				}				
			} 
			//2.根据合同号查询帐户
			else if($("#chooseQueryAcctType").val()==2){
				acctQueryParam = {
					acctCd : $("#d_query_cd input").val()
				};
			}
			//0.查询当前客户下帐户
			else{
				acctQueryParam = {
						custId : OrderInfo.cust.custId
				};
			}			
			$.callServiceAsJson(contextPath+"/order/account", acctQueryParam, {
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$("#acctListTab tbody").empty();
					if(response.code==-2){
						$.alertM(response.data);
						return;
					}
					if(response.code==0){
						var returnMap = response.data;
						if(returnMap.resultCode==0){
							if(returnMap.accountInfos && returnMap.accountInfos.length > 0){
								$("#acctPageDiv").empty();
								common.page.init("acctPageDiv", 5, "pageId","queryAccount", returnMap.accountInfos);
							} 
							else{
								$("<tr><td colspan=4>未查询到帐户信息</td></tr>").appendTo($("#acctListTab tbody"));
							}
						}
						else{
							$("<tr><td colspan=4>"+returnMap.resultMsg+"</td></tr>").appendTo($("#acctListTab tbody"));
						}				
					}
					else{
						$("<tr><td colspan=4>"+response.data+"</td</tr>").appendTo($("#acctListTab tbody"));
					}
				}
			});
		}).ketchup({bindElement:"querAcctBtn"});

		$("#zhanghuclose").click(function(){
			easyDialog.close();
			//删除所有选择帐户监听
			$(document).removeJEventListener("queryAccount");
		});
		$(this).addJEventListener("queryAccount",function(data){
			_showAcct(data);
		});
		///选择查询帐户的条件
		$("#chooseQueryAcctType").change(function(){
			if($(this).val() == 1){//1.根据接入号查询
				$("#d_query_cd").remove();
				$("#querAcctBtn").parent().before("<dd id='d_query_nbr'>&nbsp;<input type='text' data-validate='validate(required:接入号不能为空) on(keyup blur)'" +
						" value='' class='inputWidth150px'></dd>");
//				$("#querAcctBtn").parent().before("<dd id='d_query_pwd'>&nbsp; 产品密码：&nbsp;<input  type='password' data-validate='validate(required:密码不能为空) on(keyup blur)' " +
//						"value='' class='inputWidth150px'></dd>");
			}else if($(this).val()==2){//2.根据合同号查询
				$("#d_query_nbr").remove();
//				$("#d_query_pwd").remove();
				$("#querAcctBtn").parent().before("<dd id='d_query_cd'>&nbsp;<input type='text' data-validate='validate(required:合同号不能为空) on(keyup blur)'" +
						" value='' class='inputWidth150px' ></dd>");
			}else{//0.查询当前客户下账户（默认）
				$("#d_query_cd").remove();
				$("#d_query_nbr").remove();
			}
		});
		$("#chooseQueryAcctType").change();
		//当前是否选用新帐户（是否展示自定义属性）
		$("#acctSelect").change(function(){
			if($(this).val()==-1){
				$(this).parent().find("a:eq(1)").hide();
				$("#defineNewAcct").show();
			}
			else{
				$(this).parent().find("a:eq(1)").show();
				$("#defineNewAcct").hide();
			}
		});
	};
		
	//展示帐户
	var _showAcct = function(accountInfos){
		$("#acctListTab tbody").empty();
		$.each(accountInfos,function(i, accountInfo){
			var tr = $("<tr></tr>").appendTo($("#acctListTab tbody"));
			if(accountInfo.name){
				$("<td class='teleNum'>"+accountInfo.name+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.acctId){
				$("<td acctId='"+accountInfo.acctId+"'>"+accountInfo.accountNumber+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.owner){
				$("<td>"+accountInfo.owner+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.accessNumber){
				$("<td>"+accountInfo.accessNumber+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			tr.click(function(){
				var found = false;
				var custAccts = $("#acctSelect").find("option");
				$.each(custAccts, function(i, custAcct){
					if(custAcct.value==accountInfo.acctId){
						$("#acctSelect").find("option[value="+custAcct.value+"]").attr("selected","selected");
						found = true;
						return false;
					}					
				});					
				$(this).dispatchJEvent("chooseAcct",accountInfo);				
				easyDialog.close();
				$("#defineNewAcct").hide();
			});
		});
	};
	
	//复制订单一的数据到当前订单
	var _copyOrder = function(scope) {
		//获取订单一的数据
		//主卡数据
//		var param = {};
//		var tarOrderSeq = $(".order_confirmation:visible").attr("order");
//		//付费方式
//		var paymethod = $("input[name=order_1_main_pay_type]:checked").val().trim();
//		if (paymethod) {
//			$("input[name=order_"+tarOrderSeq+"_main_pay_type][value="+paymethod+"]").attr("checked","checked");
//		}
//		//产品密码
//		var mainPwd  = $("#order_1_main_pwd").val();
//		if (mainPwd) {
//			$("#order_"+tarOrderSeq+"_main_pwd").val(mainPwd);
//		}
//		//判断是否有副卡
//		if ($("input[name=order_1_vice_1_pay_type]")[0]) {
//			$.each($("div[order=1]").find("div[vice=1]"),function(i,div){
//				//付费方式
//				var method = $("input[name=order_1_vice_"+(i+1)+"_pay_type]:checked").val();
//				//产品密码
//				if (method) {
//					$("input[name=order_"+tarOrderSeq+"_vice_"+(i+1)+"_pay_type][value="+method+"]").attr("checked","checked");
//				}
//				var pwd = $("#order_1_vice_"+(i+1)+"_pwd").val();
//				if (pwd) {
//					$("#order_"+tarOrderSeq+"_vice_"+(i+1)+"_pwd").val(pwd);
//				}
//			});
//		}
//		//协销人
//		var dealer = $("#order_1_dealer").val().trim();
//		if (dealer) {
//			$("#order_"+tarOrderSeq+"_dealer").val(dealer);
//			$("#order_"+tarOrderSeq+"_dealer").attr("staffId",$("#order_1_dealer").attr("staffId"));
//		}
//		//订单备注
//		var remark = $("#order_1_remark").val().trim();
//		if (remark) {
//			$("#order_"+tarOrderSeq+"_remark").val(dealer);
//		}
	};
	
	function _spec_parm(param){
		$.callServiceAsHtmlGet(contextPath + "/order/orderSpecParam",param, {
			"done" : function(response){
				if(response && response.code == -2){
					if(param.prodId!=-1&&param.prodId!="-1"){
						$("#"+param.ul_id).append("<li><label> </label></li>");
					}
					return ;
				}else if(response && (response.data == 0||response.data == "0")){
					if(param.prodId!=-1&&param.prodId!="-1"){
						$("#"+param.ul_id).append("<li><label> </label></li>");
					}
					//$.alert("提示","该产品无产品规格属性！");
					return;
				}
				//$("#order_spec_parm").append(response.data);
				$("#"+param.ul_id).append(response.data);
				
				//判断使用人产品属性是否必填
				_checkUsersProdAttr(param.prodId, $("#"+param.ul_id));
				
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
	}
	
	//判断使用人产品属性是否必填，mantis 0147689: 关于政企单位用户实名制信息录入相关工作的要求 ；
	function _checkUsersProdAttr(prodId, dom){
		//1）新建客户新装，如果是政企客户，填单时必须填写使用人；
		//2）老客户新装，根据客户查询判断是政企客户（segmentId=1000）时，填单必须填写使用人；
		var itemId = CONST.PROD_ATTR.PROD_USER + '_' + prodId;
		if($('#'+itemId).length > 0){
			var isOptional = true;
			if(OrderInfo.cust && OrderInfo.cust.custId && OrderInfo.cust.custId != '-1'){ //老客户
				/*根据证件类型来判断
				 * var isGovCust = false;
				for (var i = 0; i <= CacheData.getGovCertType().length; i ++) {
					if (OrderInfo.cust.identityCd == CacheData.getGovCertType()[i]) {
						isGovCust = true;
						break;
					}
				}
				if(isGovCust){ //政企客户
					isOptional = false;
				}*/
				if(OrderInfo.cust.segmentId == '1000'){ //政企客户
					isOptional = false;
				}
			} else { //新建客户
				if(OrderInfo.boCustInfos && OrderInfo.boCustInfos.partyTypeCd == '2'){ //政企客户
					isOptional = false;
				}
			}
			if(!isOptional){
				for(var i=0;i<OrderInfo.prodAttrs.length;i++){
					if(OrderInfo.prodAttrs[i].id == itemId){
						OrderInfo.prodAttrs[i].isOptional = 'N';
						break;
					}
				}
				//绑定弹出框事件，用于定位客户
				$('#'+itemId).attr({'check_option':'N','readonly':'readonly','disabled':'disabled'}).show();
				$('#choose_user_btn_'+prodId).off('click').on('click',function(){
					order.main.toChooseUser(prodId);
				}).show();
				
			} else {
				$('#'+itemId).attr({'readonly':'readonly','disabled':'disabled'}).hide();
				$('#choose_user_btn_'+prodId).off('click').hide();
				$('#choose_user_btn_'+prodId).parent().hide();
			}
		}
	};
	
	//显示客户定位弹出框
	function _toChooseUser(prodId){
		order.cust.queryForChooseUser = true; //标识客户定位是为了选择使用人
		order.cust.bindCustQueryForChoose(); //客户定位查询按钮
		$('#chooseUserBtn').off('click').on('click',function(){
			if(!!order.cust.tmpChooseUserInfo && order.cust.tmpChooseUserInfo.custId){
				//保存并显示使用人信息，清空弹出框的客户信息、临时保存的客户信息，关闭弹出框
				OrderInfo.updateChooseUserInfos(prodId, order.cust.tmpChooseUserInfo);
				$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId+'_name').val(order.cust.tmpChooseUserInfo.partyName);
				$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId).val(order.cust.tmpChooseUserInfo.custId);
				order.cust.tmpChooseUserInfo = {};
				
				easyDialog.close();
//				$('#p_cust_identityNum_choose').val('');
//				$('#chooseUserInfo td').html('');
				$('#chooseUserList').hide();
			} else {
				$.alert("提示","请定位客户作为使用人");
				return false;
			}
		});
		_showChooseUserDialog(null, prodId);
	};
	
	/*
	 * 显示选择使用人弹出框，custInfo为空则使用prodId定位已保存的使用人信息，custInfo不为空则更新临时保存的使用人信息
	 */
	function _showChooseUserDialog(custInfo, prodId){
		custInfo = custInfo || OrderInfo.getChooseUserInfo(prodId);
		if(custInfo != null && custInfo.custId){
			//将客户信息作为使用人tmpChooseUserInfo，确认后保存到OrderInfo.choosedUserInfos
			order.cust.tmpChooseUserInfo = custInfo;
//			order.cust.tmpChooseUserInfo.prodId = '';
			$('#chooseUserInfoName').html(custInfo.partyName);
			$('#chooseUserInfoNum').html(custInfo.identityName + '/' + custInfo.idCardNumber);
			$('#chooseUserInfoAreaName').html(custInfo.areaName);
			$('#chooseUserList').show();
		} else {
			$('#chooseUserInfo td').html('');
			$('#chooseUserList').hide();
		}
		$('#p_cust_identityCd_choose option:first').attr('selected','selected');
		$('#p_cust_identityNum_choose').val('');
		order.cust.custidentidiesTypeCdChoose($('#p_cust_identityCd_choose'),'p_cust_identityNum_choose');
		if($.ketchup){
			$.ketchup.hideAllErrorContainer($("#custQueryForChooseForm"));
		}
		easyDialog.open({
			container : "choose_user_dialog",
			callback : function(){
				order.cust.queryForChooseUser = false; //关闭弹出框时重置标识位
				if($.ketchup){
					$.ketchup.hideAllErrorContainer($("#custQueryForChooseForm"));
				}
			}
		});
	};
	
	//产品属性 提交
	function _spec_parm_change_save(){
		//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		if(!_check_parm("order_spc_update")){
			return ;
		}
		var boProdItems = new Array();
		//input
		var chang_row = 0;
		$("#order_spc_update input").each(function(){
			//订单属性 是否模板 由公共类自动添加，这里不加入属性
			if($(this).attr("id")!="order_remark"&&$(this).attr("id")!="isTemplateOrder"&&$(this).attr("id")!="templateOrderName"&&$(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		//select
		$("#order_spc_update select").each(function(){
			if($(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		var busiOrderAttrs ;
		if($("#order_remark").val()){
			busiOrderAttrs = [{
				atomActionId : OrderInfo.SEQ.atomActionSeq--,
				itemSpecId : CONST.ITEM_SPEC_ID_CODE.busiOrderAttrs ,//"111111122",//备注的ID，待修改
				value : $("#order_remark").val()
			}];
			chang_row++;
		}
		if(chang_row<1){
			$.alert("提示","您未修改订单属性");
			return ;
		}
		/*
		if(!SoOrder.builder()){//加载实例缓存，并且初始化订单数据
			return;
		} 
		*/
		//配置参数：来调用产品属性修改的ser
		//OrderInfo.boProdItems = boProdItems ;
		var data = {boProdItems:boProdItems} ;
		if(busiOrderAttrs){
			data.busiOrderAttrs = busiOrderAttrs ;
		}
		OrderInfo.actionFlag=33;//改产品属性
		SoOrder.submitOrder(data);

	}
	//产品属性-校验所有属性
	function _check_parm(ul_id){
		var f = true ;
		$("#"+ul_id).find("input").each(function(){
			if(f){
				f = _check_parm_self(this);
			}
		});
		return f;
	}
	//产品属性-校验单个属性
	function _check_parm_self(obj){
		//alert("---"+$(obj).val());
		if($(obj).attr("check_option")=="N"){
			if($(obj).val()==null||$(obj).val()==""){
				$.alert("提示",$(obj).attr("check_name")+" 尚未填写");
				return false;
			}
		}
		
		if($(obj).attr("check_type")=="check"){
			var len = $(obj).attr("check_len");
			//alert($(this).val()+"--"+len);
			if(len>0){
				//alert($(this).val().length+"---"+len);
				if($(obj).val().length>len){
					$.alert("提示",$(obj).attr("check_name")+" 长度过长(<"+len+")");
					return false;
				}
			}
			var mask = $(obj).attr("check_mask");
			if(mask!=null&&$(obj).val()!=null&&$(obj).val()!=""){
				//alert($(obj).val()+"---"+mask);
				//mask= "^[A-Za-z]+$";
				var pattern = new RegExp(mask) ;
				if(!pattern.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 校验失败：" + $(obj).attr("check_mess"));
					return false;
				}
			}
			var v_len = $(obj).val().length;
			if(v_len>0&&$(obj).attr("dataType")=="3"){//整数
				if(!/^[0-9]+$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非数字，请修改");
					return false;
				}
			}else if(v_len>0&&$(obj).attr("dataType")=="5"){//小数
				if(!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非小数，请修改");
					return false;
				}
			}else if(v_len>0&&($(obj).attr("dataType")=="4"||$(obj).attr("dataType")=="16")){//日期
				/*
				if(/Invalid|NaN/.test(new Date($(obj).val().substring(0,10)))){
					$.alert("提示",$(obj).attr("check_name")+ " 非日期，请修改");
					return false;
				}
				*/
			}
		}
		return true ;
	}
	
	$('staff_dialog_close').onclick = function(){
		easyDialog.close();
	};
	
	//协销人-查询
	function _queryStaffPage(qryPage){
		_queryStaff(qryPage,$("#dealer_id").val(),$("#objInstId").val());
	}
	//协销人-查询
	function _queryStaff(qryPage,v_id,objInstId){
		var param = {
				"dealerId":v_id,
				"staffName":$("#qryStaffName").val(),
				"staffCode":$("#qryStaffCode").val(),
				"salesCode":$("#qrySalesCode").val(),
				"pageIndex":qryPage,
				"objInstId":objInstId,
				"pageSize":10
		};
		
		$.callServiceAsHtml(contextPath + "/staffMgr/getStaffList",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					response.data='';
				}
				$("#div_staff_dialog").html(response.data);
				
				$("#staff_list_body tr").each(function(){$(this).off("click").on("click",function(event){
					_linkSelectPlan("#staff_list_body tr",this);
					event.stopPropagation();
					});});
				easyDialog.open({
					container : "div_staff_dialog"
				});
				
			}
		});	

	}
	
	var _linkSelectPlan=function(loc, selected){
		$(loc).removeClass("plan_select");
		$(loc).children(":first-child").html("");
		$(selected).addClass("plan_select");
		var nike="<i class='select'></i>";
		$(selected).children(":first").html(nike);
	};
	//协销人-修改
	function _setStaff(objInstId){
		var $staff = $("#staff_list_body .plan_select");
		$staff.each(function(){
			$("#dealer_"+objInstId).val($(this).attr("staffName")).attr("staffId", $(this).attr("staffId"));
		});
		if($staff.length > 0){
			easyDialog.close();
		}else{
			$.alert("操作提示","请选择 协销人！");
		}
	}
	/*
	function _setStaff(v_id,staffId,staffCode,staffName){
		//alert(v_id+"--"+staffId+"=="+staffName);
		$("#"+v_id).val(staffName+"("+staffCode+")").attr("staffId",staffId);
		if(!$("#acctDialog").is("hidden")) {
			easyDialog.close();
		}
	}
	*/
	
	//帐户查询
	var _chooseAcct = function() {
		$("#acctDialog .contract_list td").text("帐户查询");
		$("#acctDialog .selectList").show();
		easyDialog.open({
			container : 'acctDialog'
		});
		$("#acctPageDiv").show();
		var listenerName = "chooseAcct";
		var $sel = $("#acctSelect");
		if (!$sel.hasJEventListener(listenerName)) {
			$sel.addJEventListener(listenerName,function(data){
				//遍历当前帐户列表，如果已存在，则直接显示，如果不存在，则加上一个option
				var found = false;
				$.each($sel.find("option"), function(i, option) {
					if ($(option).val() == data.acctId) {
						found = true;
						return false;
					}
				});
				if (found==false) {
					$("<option>").text(data.name+" : "+data.accountNumber).attr("value",data.acctId).attr("acctcd",data.accountNumber).appendTo($sel);
				}
				$sel.find("option[value="+data.acctId+"]").attr("selected","selected");
				if(data.acctId>0){
					$("#account").find("a:eq(1)").show();
				}
			});
		}
		//初始化弹出框
		$("#acctListTab tbody").empty();
		$("#acctPageDiv").empty();
	};
	
	//新增帐户
	var _createAcct = function() {
		$("#acctSelect").append("<option value='-1' style='color:red'>[新增] "+OrderInfo.cust.partyName+"</option>");
		$("#acctSelect").find("option[value='-1']").attr("selected","selected");
		$("#acctName").val(OrderInfo.cust.partyName);//默认帐户名称为客户名称
		//新增帐户自定义支付属性
		$("#defineNewAcct").show();
		//隐藏帐户信息的按钮
		$("#account").find("a:gt(0)").hide();
		//获取账单投递信息主数据并初始化新建帐户自定义属性
		window.setTimeout("order.main.showNewAcct()", 0);
	};
	//获取账户各属性主数据并初始化新建帐户自定义属性
	var _showNewAcct = function(){
		acct.acctModify.getBILL_POST(function(){
			acct.acctModify.creditLimit();
			acct.acctModify.paymentType();
			acct.acctModify.billPostType();
		});
	};
	
	//展示帐户信息
	var _acctDetail = function() {
		var acctSel = $("#acctSelect");
		if(!acctSel.val()){
			$.alert("提示","请选择一个帐户");
			return
		}
		if(acctSel.val() == -1){
			$.alert("提示","该帐户是新建帐户");
			return;
		}
		$("#acctDialog .contract_list td").text("帐户信息");
		$("#acctDialog .selectList").hide();
		$("#acctPageDiv").hide();
		$("#acctListTab tbody").empty();
		easyDialog.open({
			container : 'acctDialog'
		});
		var acctQueryParam = {
			acctCd : acctSel.find("option:selected").attr("acctcd")
		};			
		$.callServiceAsJson(contextPath+"/order/account", acctQueryParam, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==-2){
					$.alertM(response.data);
					return;
				}
				if(response.code==0){
					_showAcct(response.data.accountInfos);					
				}
				else{
					$("<tr><td colspan=4>"+response.data+"</td</tr>").appendTo($("#acctListTab tbody"));
				}
				$("#acctListTab tr").off("click");				
			}			
		});
	};
	
	var _lastStep = function() {
		$.confirm("信息","确定回到上一步吗？",{
			yes:function(){
				//TODO　may initialize something;				
				var boProdAns = OrderInfo.boProdAns;
				var boProdAn = order.service.boProdAn;
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//若是购机或选号入口则将继续释放主卡以外的预占号码（过滤身份证预占的号码）
//				if(order.service.releaseFlag==1){
//					if(boProdAns.length>0){
//						for(var n=0;n<boProdAns.length;n++){
//							if(boProdAns[n].accessNumber==boProdAn.accessNumber || boProdAns[n].idFlag){
//								continue;
//							}
//							var param = {
//									numType : 1,
//									numValue : boProdAns[n].accessNumber
//							};
//							$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
//						}
//					}
//				}
				//若是套餐入口则将继续释放主副卡预占的号码（过滤身份证预占的号码）
//				if(order.service.releaseFlag==2){
//					if(boProdAns.length>0){
//						for(var n=0;n<boProdAns.length;n++){
//							if(boProdAns[n].idFlag){
//								continue;
//							}
//							var param = {
//									numType : 1,
//									numValue : boProdAns[n].accessNumber
//							};
//							$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
//						}
//					}
//					if(boProdAn.accessNumber!='')
//						order.phoneNumber.resetBoProdAn();
//				}
				//释放预占的号码
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
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
				
				$("#order_fill_content").empty();
				order.prepare.showOrderTitle();
				$("#order_tab_panel_content").show();
				order.prepare.step(1);
			},no:function(){
				
			}},"question");
	};
	
	var _getTestParam = function() {
		return {
			boActionTypeCd : S1,
			boActionTypeName : "订购",
			offerSpecId : 1234,
			offerSpecName : "乐享3G-129套餐",
			feeType : 1200,
			viceCardNum : 3,
			offerNum : 3,
			type : 1,//1购套餐2购终端3选靓号
			terminalInfo : {
				terminalName : "IPhone5",
				terminalCode : "46456457345"
			},
			offerRoles : [
				{
					offerRoleId : 1234,
					offerRoleName : "主卡",
					memberRoleCd : "0",
					roleObjs : [{
						offerRoleId : 1,
						objId : CONST.PROD_SPEC.CDMA,
						objName : "CDMA",
						objType : 2
					}]
				},
				{
					offerRoleId : 2345,
					offerRoleName : "副卡",
					memberRoleCd : "1"
				}
			]
		};
	};
	

	var _genRandPass6Input = function(id){
		var pass = _genRandPass6();
		$("#"+id).val(pass);
	};
	
	var _genRandPass6 = function(){
		var str = "" ;
		var lastOneS = "" ;
		var thisOneS = "" ;
		var thisOneI = 0 ;
		for(var k=0;k<6;k++){
			do{
				if(str.length>0){
					lastOneS = str.substring(str.length-1,str.length) ;
				}
				thisOneI = parseInt(Math.random()*9+1);
				thisOneS = ""+thisOneI ;
				if(str.length==5){
					if(_checkIncreace6(str + thisOneS)){
						continue;
					}
				}
			}while(lastOneS==thisOneS);
			str = str + thisOneS ;
		}
		if(str.length!=6){
			return null ;
		}
		return str ;
	};
	
	var _checkIncreace6 = function(str){
		var rownum = 0 ;
		if(str && str.length==6){
			for(var i=0;i<5;i++){
				var int1 = parseInt(str.substring(i,i+1));
				var int2 = parseInt(str.substring(i+1,i+2));
				rownum = rownum + (int1-int2);
			}
			if(rownum==5||rownum==-5){
				return true ;
			}else{
				return false ;
			}
		}else{
			return false ;
		}
	};
	
	var _passwordCheckInput = function(id,accNbr){
		var val = $("#"+id).val();
		return _passwordCheckVal(val,accNbr);
	};
	
	var _passwordCheckVal = function(val,accNbr){
		var reg = new RegExp("^([0-9]{6})$");//6位纯数字 0~9
		if(val==null){
			$.alert("提示","密码不可为空！");
			return false ;
		}else if(!reg.test(val)){
			$.alert("提示","密码包含非数字或长度不是6位！");
			return false ;
		}
		if(accNbr!=null && accNbr.indexOf(val)>=0){
			$.alert("提示","密码不能与接入号中的信息重复，请修改！");
			return false ;
		}
		for(var k=0;k<5;k++){
			lastOneS = val.substring(k,k+1) ;
			thisOneS = val.substring(k+1,k+2) ;
			if(lastOneS==thisOneS){
				$.alert("提示","密码中包含连续相同数字，请修改！");
				return false ;
			}
		}
		if(_checkIncreace6(val)){
			$.alert("提示","密码不可是连续6位数字，请修改！");
			return false ;
		}
		return true ;
	};
	
	var _queryGroupPage=function(pageIndex){
		_queryGroup($("#queryType").val(),pageIndex,$("#id").val());
	};
	
	//群号查询
	function _queryGroup(queryType,pageIndex,id){
		var param = {
				"identifyNbr":$("#identifyNbr").val(),
				"custName":$("#custName").val(),
				"accessNbr":$("#accessNbr").val(),
				"areaId":OrderInfo.getAreaId(),
				"curPage":pageIndex,
				"queryType":queryType,
				"queryTypeTmp":queryType,
				"objInstId":id,
				"pageSize":10
		};
		$.callServiceAsHtml(contextPath + "/offer/getGroupList",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					response.data='';
				}
				$("#div_staff_dialog").html(response.data);
				
				$("#group_list_body tr").each(function(){$(this).off("click").on("click",function(event){
					_linkSelectPlan("#group_list_body tr",this);
					event.stopPropagation();
					});});
				easyDialog.open({
					container : "div_staff_dialog"
				});
				
			}
		});	

	};
	
	//群信息-修改
	var _setGroup=function(objInstId){
		var $group = $("#group_list_body .plan_select");
		$group.each(function(){
			$("#"+objInstId).val($(this).attr("accessNumber"));
		});
		if($group.length > 0){
			easyDialog.close();
		}else{
			$.alert("操作提示","请选择群！");
		}
	};
	
	return {
		buildMainView : _buildMainView,
		copyOrder : _copyOrder,
		spec_parm:_spec_parm,
		check_parm:_check_parm,
		queryStaff:_queryStaff,
		queryStaffPage:_queryStaffPage,
		setStaff:_setStaff,
		chooseAcct : _chooseAcct,
		check_parm_self:_check_parm_self,
		createAcct : _createAcct,
		showNewAcct : _showNewAcct,
		acctDetail : _acctDetail,
		//spec_parm_change: _spec_parm_change,
		spec_parm_change_save:_spec_parm_change_save,
		//spec_password_change:_spec_password_change,
		//spec_password_change_save:_spec_password_change_save,
		paymethodChange:_paymethodChange,
		templateTypeCheck:_templateTypeCheck,
		lastStep : _lastStep,
		genRandPass6:_genRandPass6,
		genRandPass6Input:_genRandPass6Input,
		passwordCheckInput:_passwordCheckInput,
		passwordCheckVal:_passwordCheckVal,
		checkIncreace6:_checkIncreace6,
		queryGroup:_queryGroup,
		queryGroupPage:_queryGroupPage,
		setGroup:_setGroup,
		toChooseUser : _toChooseUser,
		showChooseUserDialog : _showChooseUserDialog
	};
})();


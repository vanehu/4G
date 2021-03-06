
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
			if(param.feeTypeMain=="2100" && (param.offerSpec.feeType=="2100"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1200" && (param.offerSpec.feeType=="1200"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}else if(param.feeTypeMain=="1201" && (param.offerSpec.feeType=="1201"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
				is_same_feeType=true;
			}	
			if(!is_same_feeType){
				$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
				return;
			}
		}		
		$.callServiceAsHtml(contextPath+"/pad/order/main",param,{
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
					$.jqmRefresh($("#order_fill_content"));
				}else if(OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 21){					
					_callBackMemberView(response,param);
					$.jqmRefresh($("#order_fill_content"));
				}else {
					_callBackBuildView(response,param);
				}
				/*if(CONST.getAppDesc()==1 && (OrderInfo.actionFlag==1 ||OrderInfo.actionFlag==14)){
					$("#li_is_activation").show();
				}*/
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	
	//展示回调函数
	var _callBackBuildView = function(response, param) {
		order.prepare.showOrderTitle(OrderInfo.actionTypeName, param.offerSpecName, false);
		SoOrder.initFillPage(); //并且初始化订单数据
		var content$ = $("#order_fill").html(response.data).fadeIn();
		$.jqmRefresh(content$);
		_initOfferLabel();//初始化主副卡标签
		_initFeeType(param);//初始化付费方式
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}
		mktRes.phoneNbr.initOffer('-1');//主卡自动填充号码入口已选过的号码
		_loadOther(param);//页面加载完再加载其他元素
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
			//_initAcct();//初始化帐户列表 
			$("#acctName").val(OrderInfo.cust.partyName);
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){
				for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
					var prodInfo = OrderInfo.oldprodInstInfos[i];
					order.dealer.initDealer(prodInfo);//初始化协销
				}
			}else{
				order.dealer.initDealer();//初始化协销	
			}	
		}
		/*if(OrderInfo.actionFlag==1){
			$("#templateOrderDiv").show();
		}
		_addEvent();//添加页面事件*/
		$("#fillNextStep").off("click").on("click",function(){
			SoOrder.submitOrder();
		});
		
		//新装UIM卡初始
		if(OrderInfo.actionFlag&&OrderInfo.actionFlag=="1"){
			var $uimDivs = $("div[id^='uimDiv_']");
			$.each($uimDivs,function(index,$uimDiv){
				$($uimDiv).show();
			});
		}
		
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
	
	//主副卡成员变更展示回调函数
	var _callBackMemberView = function(response, param) {		
		order.prepare.showOrderTitle(OrderInfo.actionTypeName, param.offerSpecName, false);
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#deal_package").css("display","none");
		$("#order_prod_list").css("display","none");	
		$("#order_tab_panel_content").html(response.data);
		$.jqmRefresh($("#order_tab_panel_content"));	
		_initFeeType(param);//初始化付费方式
		_initOrderProvAttr();//初始化省内订单属性
		if(CONST.getAppDesc()==0 && OrderInfo.actionFlag==6){
			$("#orderAttrDiv").show();		
			_initOrderAttr();//初始化4G经办人	
		}
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
			_initAcct(0);//初始化主卡帐户列表 
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){
				for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
					var prodInfo = OrderInfo.oldprodInstInfos[i];
					order.dealer.initDealer(prodInfo);//初始化协销
				}
			}else{
				order.dealer.initDealer();//初始化协销
			}
		}
		if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户		
			_initAcct(1);//初始化副卡帐户列表	
			_loadAttachOffer(param);			
		}else if(OrderInfo.actionFlag==6){
			mktRes.phoneNbr.initOffer('-1');//主卡自动填充号码入口已选过的号码
			_loadOther(param);//页面加载完再加载其他元素
		}else if(OrderInfo.actionFlag==21){
			_loadViceMember(param);
		}		
		
		if(OrderInfo.actionFlag==1){
			$("#templateOrderDiv").show();
		}
		_addEvent();//添加页面事件
		
		
		$("#fillNextStep").off("click").on("click",function(){
			order.memberChange.removeAndAdd(param);
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
	
		if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""){
			alert("hrihr");
			var param = {"phoneNum":"",
						"prodId":""};
			var numBtns = $("a[id^='nbr_btn_']");			
			var nums = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
			var subNums = [];
			$.each(numBtns,function(){
				if($(this).attr("id")!="nbr_btn_-1"){
					subNums.push(this);
				};
			});
			$.each(subNums,function(index,subNum){
				//副卡选号需要的参数  
				param.phoneNum = nums[index];
				param.prodId = -2-index;
				var resData = order.phoneNumber.queryPhoneNumber(param);
				if(resData==undefined||resData.datamap==undefined||resData.datamap.baseInfo==undefined){
					$(subNum).html("<u></u>");
					$(subNum).removeAttr("onclick");
				}else{
					if(resData&&resData.datamap.baseInfo!=undefined){
						var phoneParam={
								prodId : param.prodId, //从填单页面头部div获取
								accessNumber : resData.datamap.baseInfo.phoneNumber, //接入号
								anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
								anId : resData.datamap.baseInfo.phoneNumId, //接入号ID
								pnLevelId:resData.datamap.baseInfo.phoneLevelId,
								anTypeCd : resData.datamap.baseInfo.pnTypeId, //号码类型
								state : "ADD", //动作	,新装默认ADD
								areaId:resData.datamap.baseInfo.areaId,
								areaCode:resData.datamap.baseInfo.zoneNumber,
								memberRoleCd:"",
								preStore:resData.datamap.baseInfo.prePrice,
								minCharge:resData.datamap.baseInfo.pnPrice,
								idFlag:"1"
							};
						if(param.prodId&&param.prodId!="-1"){
							phoneParam.memberRoleCd = CONST.MEMBER_ROLE_CD.VICE_CARD;
						}		
						$(subNum).html(nums[index]+"<u></u>");
						$(subNum).removeAttr("onclick");
						OrderInfo.boProdAns.push(phoneParam);
					}
				}

			});
		}	
		//主副卡纳入新用户选号
		if(order.memberChange.newSubPhoneNum!="" && order.memberChange.reloadFlag=="Y"){
			var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
			for(var n=0;n<newSubPhoneNumsize.length;n++){
				if(newSubPhoneNumsize[n]!=""&&newSubPhoneNumsize[n]!=null&&newSubPhoneNumsize[n]!="null"){
					$("#nbr_btn_-"+(n+1)).removeAttr("onclick");
					$("#nbr_btn_-"+(n+1)).removeClass("selectBoxTwo");
					$("#nbr_btn_-"+(n+1)).addClass("selectBoxTwoOn");
					var param = {"phoneNum":newSubPhoneNumsize[n]};
					var data = order.phoneNumber.queryPhoneNumber(param);
					if(data.datamap.baseInfo){
						$("#nbr_btn_-"+(n+1)).html(newSubPhoneNumsize[n]+"<u></u>");
						var boProdAns={
								prodId : "-"+(n+1), //从填单页面头部div获取
								accessNumber : data.datamap.baseInfo.phoneNumber, //接入号
								anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
								anId : data.datamap.baseInfo.phoneNumId, //接入号ID
								pnLevelId : data.datamap.baseInfo.phoneLevelId,
								anTypeCd : data.datamap.baseInfo.pnTypeId, //号码类型
								state : "ADD", //动作	,新装默认ADD	
								areaId : data.datamap.baseInfo.areaId,
								areaCode:data.datamap.baseInfo.zoneNumber,
								memberRoleCd:CONST.MEMBER_ROLE_CD.VICE_CARD,
								preStore:data.datamap.baseInfo.prePrice,
								minCharge:data.datamap.baseInfo.pnPrice
							};
						OrderInfo.boProdAns.push(boProdAns);
						order.dealer.changeAccNbr("-"+(n+1),newSubPhoneNumsize[n]);//选号玩要刷新发展人管理里面的号码
					}
				}
			}
		}			
	};
	
	//根据产品id获取销售品成员
	var _getOfferMember = function(prodId){
		for(var j=0;j<OrderInfo.oldoffer.length;j++){
			for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
				if(offerMember.objInstId==prodId){
					return offerMember;
				}
			}
		}
		return {};
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
					partyId : OrderInfo.cust.custId,
					actionFlag : OrderInfo.actionFlag
				};				
				if(OrderInfo.actionFlag == "6"){//主副卡成员变更				
					order.main.spec_member_parm(obj); //加载产品属性
				}else{
					order.main.spec_parm(obj); //加载产品属性
				}
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
	var _initAcct = function(flag) {
		//新客户自动新建帐户
//		if(OrderInfo.cust.custId==-1){
//			_createAcct();
//		}
//		else{
			//主副卡成员变更业务不能更改帐户，只展示主卡帐户
			if(OrderInfo.actionFlag==6){
				var param = {};
				if(flag==1){
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						param.prodId=OrderInfo.oldprodInstInfos[i].prodInstId;
						param.acctNbr=OrderInfo.oldprodInstInfos[i].accNbr;
						param.areaId=OrderInfo.oldprodInstInfos[i].areaId;
						var jr = $.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param);
						if(jr.code==-2){
							$.alertM(jr.data);
							return;
						}
						var prodAcctInfos = jr.data;
						prodAcctInfos[0].accessNumber = OrderInfo.oldprodInstInfos.accNbr;
						OrderInfo.oldprodAcctInfos.push({"prodAcctInfos":prodAcctInfos});
					}
				}else{
					param.prodId=order.prodModify.choosedProdInfo.prodInstId;
					param.acctNbr=order.prodModify.choosedProdInfo.accNbr;
					param.areaId=order.prodModify.choosedProdInfo.areaId;
					var jr = $.callServiceAsJson(contextPath+"/order/queryProdAcctInfo", param);
					if(jr.code==-2){
						$.alertM(jr.data);
						return;
					}
					var prodAcctInfos = jr.data;
					var _obj = $("#acctSelect");
					$("#accountDiv").find("label:eq(0)").text("主卡帐户：");
					$.each(prodAcctInfos, function(i, prodAcctInfo){
						_obj.append("<option value='"+prodAcctInfo.acctId+"' acctcd='"+prodAcctInfo.acctCd+"'>"+prodAcctInfo.name+" : "+prodAcctInfo.acctCd+"</option>");
					});				
					//jquery mobile 需要刷新才能生效
					_obj.selectmenu().selectmenu('refresh');
					
					$("#accountDiv").find("button:eq(0)").hide();
				}				
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
		$(".many li").bind("click", function () {
			var index = $(this).index();
			var divs = $("#tabs-body .ordercona");
			$(this).parent().children("li").attr("class", "tab-nav");//将所有选项置为未选中
			$(this).attr("class", "tab-nav-action"); //设置当前选中项为选中样式
			divs.hide();//隐藏所有选中项内容
			divs.eq(index).show(); //显示选中项对应内容
		});
	};
	//初始化购物车属性
	var _initOrderAttr = function() {
		//客户类型,证件类型
		order.cust.partyTypeCdChoose($("#orderPartyTypeCd").children(":first-child"),"orderIdentidiesTypeCd");
		order.cust.identidiesTypeCdChoose($("#orderIdentidiesTypeCd").children(":first-child"),"orderAttrIdCard");
		
	};
	
	//初始化省内订单属性
	var _initOrderProvAttr = function(){
		if(order.cust.fromProvFlag == "1" && ec.util.isObj(order.cust.provIsale)){
			$("#orderProvAttrIsale").val(order.cust.provIsale);
		}
	};
	
	//帐户信息-添加页面点击事件
	var _addEvent = function() {
		//页面点击帐户查询
		$('#acctQueryForm').bind('formIsValid', function(event, form) {
			var acctQueryParam;
			//1.根据接入号查询帐户
			if($("#chooseQueryAcctType").val()==1){
				if(!CONST.LTE_PHONE_HEAD.test($.trim($("#d_query_nbr input").val()))){
					$.alert("提示", "请输入有效的中国电信手机号");
					return;
				}
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
	
	
	function _spec_parm(param){
		$.callServiceAsHtmlGet(contextPath + "/pad/order/orderSpecParam",param, {
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response && (response.data == 0||response.data == "0")){
					return;
				}
				$("#"+param.ul_id).after(response.data);
				$("div[name='spec_params']").each(function(){
					$.jqmRefresh($(this));
				});
				//只有在新装的时候才可编辑“是否信控”产品属性
				var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId);
				if(xkDom.length == 1){
					if(OrderInfo.actionFlag != 1&& OrderInfo.actionFlag != 14){
						$(xkDom).attr("disabled","disabled");
						$(xkDom).parent().find("a").addClass("ui-state-disabled");
					} else {
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value=' ']").remove(); //去除“请选择”空值选项
						$(xkDom).val("20"); //默认为“是”
						if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
							$(xkDom).attr("disabled","disabled");
							$(xkDom).parent().find("a").addClass("ui-state-disabled");
						}
					}
					$(xkDom).selectmenu().selectmenu('refresh');
				}
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
	}
	
	function _spec_member_parm(param){
		$.callServiceAsHtmlGet(contextPath + "/pad/order/orderSpecParam",param, {
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
				//加载可选包		
				var pageagehtml = "<div class=\"optional\"> 可选包/功能产品 <a href=\"#optional_"+param.prodId+"\" data-role=\"button\" data-icon=\"optional\" data-iconpos=\"notext\" data-theme=\"i\">可选包/功能产品</a> </div>";
				$("#"+param.ul_id).append(pageagehtml);
				
			
				$.jqmRefresh($("#order_tab_panel_content"));
				
				//判断使用人产品属性是否必填
				_checkUsersProdAttr(param.prodId, $("#"+param.ul_id));
				
				//只有在新装的时候才可编辑“是否信控”产品属性
				var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId);
				if(xkDom.length == 1){
					//如果是6主副卡成员变更副卡加装，使副卡的信控属性与主卡保持一致
					if(OrderInfo.actionFlag == 6){
						var exist = false; 
						if(OrderInfo.prodInstAttrs && OrderInfo.prodInstAttrs.length){
							$.each(OrderInfo.prodInstAttrs, function(){
								if(this.itemSpecId==CONST.PROD_ATTR.IS_XINKONG){
									$(xkDom).val(this.value);
									exist = true;
								}					
							});
						}
						if(exist){
							$(xkDom).attr("disabled","disabled");
						} else {
//							$.alert("提示","查询主卡产品实例属性未获取到“是否信控”属性值");
							$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value='']").remove(); //去除“请选择”空值选项
							$(xkDom).val("20"); //默认为“是”
							if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
								$(xkDom).attr("disabled","disabled");
							}
						}
					} else if (OrderInfo.actionFlag != 1 && OrderInfo.actionFlag != 14){
						$(xkDom).attr("disabled","disabled");
					} else {
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value='']").remove(); //去除“请选择”空值选项
						$(xkDom).val("20"); //默认为“是”
						if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
							$(xkDom).attr("disabled","disabled");
						}
					}
				}
				//新装--二次加载(是否信控)处理
				$.each(OrderInfo.newOrderInfo.checkMaskList,function(){
					$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+this.prodId+"").find("option[value='"+this.isCheckMask+"']").attr("selected","selected");
				});
				//判断是否是预付费，是：修改信控信息
				if(OrderInfo.newOrderInfo.isReloadFlag=="N"){
					var feetype = $("select[name='pay_type_-1']").find("option:selected").val();
					if(feetype=="2100"){
						order.main.feeTypeCascadeChange($("select[name='pay_type_-1']"),'-1');
					}
				}
				//主副卡暂存单二次加载
				if(order.memberChange.reloadFlag=="N"||OrderInfo.newOrderInfo.isReloadFlag=="N"){				
					var custOrderList ="";//order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
					if(order.memberChange.rejson&&order.memberChange.rejson.orderList&&order.memberChange.rejson.orderList.custOrderList[0].busiOrder){
						custOrderList = order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
					}else if(OrderInfo.newOrderInfo.result&&OrderInfo.newOrderInfo.result.orderList.custOrderList[0].busiOrder){
						custOrderList = OrderInfo.newOrderInfo.result.orderList.custOrderList[0].busiOrder;
					}
					$.each(custOrderList,function(){
						if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){//纳入新成员
							//封装产品属性
							var newboProdItems = this.data.boProdItems;
							$("[name=prodSpec_"+this.busiObj.instId+"]").each(function(){
								var tagName = this.tagName;
								var itemSpecId=$(this).attr("id").split("_")[0];
								var newid = $(this).attr("id");
								for(var i=0;i<newboProdItems.length;i++){
									if(newboProdItems[i].itemSpecId == itemSpecId && newid.split("_")[1]==newboProdItems[i].prodSpecItemId){
										if(tagName=="SELECT"){
											$("#"+newid+" option[value='"+newboProdItems[i].value+"']").attr("selected","selected");
										}else{
											$("#"+newid).val(newboProdItems[i].value);
										}
									}
								}
							});
						}
					});
				}
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
				if(OrderInfo.actionFlag == 6){//主副卡成员变更
					$('#MEMBERDIV_'+prodId).hide();					
				}
			}
		}
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
	//滚动分页回调 ok
	var _queryScroll = function(scrollObj){
		if(scrollObj && scrollObj.page){
			_queryStaffPage(scrollObj.page,scrollObj.scroll);
		}
	};
	//协销人-查询-入口 ok
	var _queryStaff = function(dealerId,objInstId){		
		$.callServiceAsHtmlGet(contextPath + "/pad/staffMgr/getStaffListPrepare",{"dealerId":dealerId,"objInstId":objInstId},{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				//统一弹出框
				var popup = $.popup("#div_staff_dialog",response.data,{
					cache:true,
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){}
				});
				$("#btn_staff_select_chk").off("tap").on("tap",function(){_setStaff(objInstId);});
				$("#a_order_staff_qry").off("tap").on("tap",function(){_queryStaffPage(1);});
			}
		});
	};
	//协销人-查询 -列表 ok
	var _queryStaffPage = function(qryPage,scroller){
		
		var param = {
				"dealerId" :$("#dealer_id").val(),
				"qrySalesCode":$("#qrySalesCode").val(),
				"staffName":$("#qryStaffName").val(),
				"staffCode":$("#qryStaffCode").val(),
				"staffCode2":$("#qryStaffCode").val(),
				"salesCode":$("#qrySalesCode").val(),
				"pageIndex":qryPage,
				"objInstId":$("#objInstId").val(),
				"pageSize" :10
			};
		
		$.callServiceAsHtml(contextPath + "/pad/staffMgr/getStaffList",param,{
			"before":function(){
				if(qryPage==1)$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				if(qryPage==1)$.unecOverlay();
			},
			"done" : function(response){
				var _data = "";
				if(!response){
					_data='';
				}else{
					_data = response.data;
				}
				var content$ = $("#div_order_dealer_list");
				//首页时直接覆盖,其它页追加
				if(qryPage==1)content$.html(_data);
				else content$.find("tbody").append(_data);
				
				content$.find("tr").each(function(){
					$(this).off("tap").on("tap",function(event){
						$(this).addClass("userorderlistlibg").siblings().removeClass("userorderlistlibg");
					});
				});
				
				//回调刷新iscroll控制数据,控件要求
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
			}
		});	

	};
	//选中协销人 ok
	var _setStaff = function(objInstId){
		var $staff = $("#div_order_dealer_list tr.userorderlistlibg");
		$staff.each(function(){
			var $channelList = $(this).find("dd select[name='channel_list']");
			$("#dealerChannel_"+objInstId).empty(); 
			var $channelListOptions ="";
			if($channelList.length <= 0){
				$.each(OrderInfo.channelList,function(){
					if(this.isSelect==1)
						$channelListOptions += "<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>";				
				});
			}else{			
				$($channelList).find("option").each(function(){
					var $channelListOptionVal  = $(this).val() ; 
					var $channelListOptionName = $(this).html() ; 
					if(this.selected==true){
						$channelListOptions += "<option value='"+$channelListOptionVal+"' selected ='selected'>"+$channelListOptionName+"</option>";
					}else{
						$channelListOptions += "<option value='"+$channelListOptionVal+"'>"+$channelListOptionName+"</option>";
					}
				});
			}
			$("#dealerChannel_"+objInstId).append($channelListOptions);
			$("#dealer_"+objInstId).val($(this).attr("staffName")).attr("staffId", $(this).attr("staffId"));
		});
		if($staff.length > 0){
			$("#div_staff_dialog").popup("close");
		}else{
			$.alert("提示","请先选择协销人！");
		}
	};
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
	//获取账单投递信息主数据并初始化新建帐户自定义属性
	var _showNewAcct = function(){
		acct.acctModify.ifCanAdjustBankPayment();//查询工号权限：能否选择银行托收
		acct.acctModify.getBILL_POST(function(){
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
				mktRes.phoneNbr.resetBoProdAn();
				$("#order_fill").empty();
				$("#order_prepare").show();
				$("#order_fill_content").empty();
				//order.prepare.showOrderTitle();
				$("#order_tab_panel_content").show();
				//order.prepare.step(1);
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
		var newStr = "";
		if(str && str.length==6){
			var int0 = str[0];
			for(var i=0;i<str.length;i++){
				var int1 = parseInt(str.substring(i,i+1));
				newStr += Math.abs(int1-int0);
			}
			if("012345"==newStr||"543210"==newStr){
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
		var detail = "<div style='text-indent:0px;'>密码设置规则：<br/>1、密码必须为六位全数字；<br/>2、密码不能与接入号中的信息重复；<br/>3、密码不能包含连续相同的数字；<br/>4、密码不能是连续的六位数字。</div>";
		var reg = new RegExp("^([0-9]{6})$");//6位纯数字 0~9
		if(val==null){
			$.alertMore("提示", "", "密码不可为空！", detail, "");
			return false ;
		}else if(!reg.test(val)){
			$.alertMore("提示", "", "密码包含非数字或长度不是6位", detail, "");
			return false ;
		}
		if(accNbr!=null && accNbr.indexOf(val)>=0){
			$.alertMore("提示", "", "密码不能与接入号中的信息重复，请修改！", detail, "");
			return false ;
		}
		for(var k=0;k<5;k++){
			lastOneS = val.substring(k,k+1) ;
			thisOneS = val.substring(k+1,k+2) ;
			if(lastOneS==thisOneS){
				$.alertMore("提示", "", "密码中包含连续相同数字，请修改！", detail, "");
				return false ;
			}
		}
		if(_checkIncreace6(val)){
			$.alertMore("提示", "", "密码不可是连续6位数字，请修改！", detail, "");
			return false ;
		}
		return true ;
	};
	
	//付费类型选项变更时级联更新相关的产品属性
	var _feeTypeCascadeChange = function(dom,prodId){
		var feeType = $(dom).val();
		var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId);
		//“是否信控”产品属性，预付费时默认为“是”且不可编辑，其他默认为“是”但可编辑
		if(feeType == CONST.PAY_TYPE.BEFORE_PAY){
			$(xkDom).val("20").attr("disabled","disabled");
			$(xkDom).parent().find("a").addClass("ui-state-disabled");
		} else {
			$(xkDom).val("20").removeAttr("disabled");
			$(xkDom).parent().find("a").removeClass("ui-state-disabled");
		}
		$(xkDom).selectmenu().selectmenu('refresh');
	};
	
	var _reload = function(){
		//主副卡暂存单二次加载
		if(order.memberChange.reloadFlag=="N"){
			var custOrderList = order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
			//订购可选包和功能产品
			$.each(custOrderList,function(){
				//可选包
				if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="2"){
					var offermap = this;
					var offerflag = false;
					$.each(AttachOffer.openList,function(){
						if(this.prodId==offermap.data.ooRoles[0].prodId){
							$.each(this.specList,function(){
								if(this.offerSpecId==offermap.busiObj.objId){
									offerflag = true;
									return false;
								}
							});
						}
					});
							if(!offerflag){
								AttachOffer.addOpenList(offermap.data.ooRoles[0].prodId,offermap.busiObj.objId);
								//参数
								if(offermap.data.ooParams!=undefined){
									if(offermap.data.ooParams.length>0){
										var ooParams = offermap.data.ooParams[0];
										var spec = CacheData.getOfferSpec(ooParams.offerParamId,ooParams.offerSpecParamId);
										if(!!spec.offerSpecParams){
											for (var i = 0; i < spec.offerSpecParams.length; i++) {
												var param = spec.offerSpecParams[i];
												var itemSpec = CacheData.getSpecParam(ooParams.offerParamId,ooParams.offerSpecParamId,param.itemSpecId);
												if(itemSpec.itemSpecId == CONST.ITEM_SPEC.PROT_NUMBER){
													itemSpec.setValue = $("#select1").val();
												}else{
													itemSpec.setValue = ooParams.value;
												}
											}
										}
										if(spec.offerRoles!=undefined && spec.offerRoles.length>0){
											for (var i = 0; i < spec.offerRoles.length; i++) {
												var offerRole = spec.offerRoles[i];
												for (var j = 0; j < offerRole.roleObjs.length; j++) {
													var roleObj = offerRole.roleObjs[j];
													if(!!roleObj.prodSpecParams){
														for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
															var prodParam = roleObj.prodSpecParams[k];
															var prodItem = CacheData.getProdSpecParam(ooParams.offerParamId,ooParams.offerSpecParamId,prodParam.itemSpecId);
															prodItem.value = ooParams.value;
														}
													}
												}
											}
										}
										$("#can_"+ooParams.offerParamId+"_"+ooParams.offerSpecParamId).removeClass("canshu").addClass("canshu2");
										var attchSpec = CacheData.getOfferSpec(ooParams.offerParamId,ooParams.offerSpecParamId);
										attchSpec.isset = "Y";
									}
								}
								//终端串码
								if(offermap.data.bo2Coupons!=undefined){
									var bo2Coupons = offermap.data.bo2Coupons[0];
									$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
									var coupon = {
											couponUsageTypeCd : bo2Coupons.couponUsageTypeCd, //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
											inOutTypeId : bo2Coupons.inOutTypeId,  //出入库类型
											inOutReasonId : bo2Coupons.inOutReasonId, //出入库原因
											saleId : bo2Coupons.saleId, //销售类型
											couponId : bo2Coupons.couponId, //物品ID
											couponinfoStatusCd : bo2Coupons.couponinfoStatusCd, //物品处理状态
											chargeItemCd : bo2Coupons.chargeItemCd, //物品费用项类型
											couponNum : bo2Coupons.couponNum, //物品数量
											storeId : bo2Coupons.storeId, //仓库ID
											storeName : bo2Coupons.storeName, //仓库名称
											agentId : bo2Coupons.agentId, //供应商ID
											apCharge : bo2Coupons.apCharge, //物品价格,约定取值为营销资源的
											couponInstanceNumber : bo2Coupons.couponInstanceNumber, //物品实例编码
											ruleId : bo2Coupons.ruleId, //物品规则ID
											partyId : bo2Coupons.partyId, //客户ID
											prodId : bo2Coupons.prodId, //产品ID
											offerId : bo2Coupons.offerId, //销售品实例ID
											attachSepcId : bo2Coupons.attachSepcId,
											state : bo2Coupons.state, //动作
											relaSeq : bo2Coupons.relaSeq, //关联序列	
											num	: bo2Coupons.num //第几个串码输入框
										};
										OrderInfo.attach2Coupons.push(coupon);
								}
							}
						
				}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S2" && this.busiObj.offerTypeCd=="2"){
					var offermap = this;
					var objInstId = "";
					$.each(order.memberChange.oldmembers.objInstId,function(){
						if(this.instId==offermap.busiObj.instId){
							objInstId = this.objInstId;
							return false;
						}
					});
					AttachOffer.delOffer(objInstId,this.busiObj.instId,"reload");
				}else if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){//功能产品
					if(this.data.boServs[0].state=="ADD"){
						var offermap = this;
						var offerflag = false;
						$.each(AttachOffer.openServList,function(){
							if(this.prodId==offermap.data.boServOrders[0].servId){
								$.each(this.servSpecList,function(){
									if(this.servSpecId==offermap.data.boServOrders[0].servSpecId){
										offerflag = true;
										return false;
									}
								});
							}
						});
								if(!offerflag){
									var ifParams = "N";
									if(offermap.data.boServItems!=undefined){
										ifParams = "Y";
									}
									openServSpec(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,offermap.data.boServOrders[0].servSpecName,ifParams);
									if(ifParams=="Y"){
										var spec = CacheData.getServSpec(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId);
										if(!!spec.prodSpecParams){
											for (var i = 0; i < spec.prodSpecParams.length; i++) {
												var param = spec.prodSpecParams[i];
												var itemSpec = CacheData.getServSpecParam(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,param.itemSpecId);
												$.each(offermap.data.boServItems,function(){
													if(itemSpec.itemSpecId==this.itemSpecId){
														itemSpec.setValue = this.value;
													}
												});
											}
										}
										$("#can_"+this.busiObj.instId+"_"+offermap.data.boServOrders[0].servSpecId,param.itemSpecId).removeClass("canshu").addClass("canshu2");
										var attchSpec = CacheData.getServSpec(this.busiObj.instId,offermap.data.boServOrders[0].servSpecId,param.itemSpecId);
										attchSpec.isset = "Y";
									}
								}
							
					}else if(this.data.boServs[0].state=="DEL"){
						AttachOffer.closeServ(this.busiObj.instId,this.data.boServOrders[0].servId,"reload");
					}
				}
			});
			
			//退订可选包
			$.each(AttachOffer.openList,function(){
				var openmap = this;
				$.each(this.specList,function(){
					var offermap = this;
					var offerflag = false;
					$.each(custOrderList,function(){
						if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="2"){
							if(this.busiObj.objId==offermap.offerSpecId){
								offerflag = true;
								return false;
							}
						}
					});
					if(!offerflag){
						AttachOffer.delOfferSpec(openmap.prodId,this.offerSpecId,"reload");
					}
				});
			});
			
			//退订功能产品
			$.each(AttachOffer.openServList,function(){
				var openmap = this;
				$.each(this.servSpecList,function(){
					var offermap = this;
					var offerflag = false;
					$.each(custOrderList,function(){
						if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="7"){
							if(offermap.servSpecId==this.data.boServOrders[0].servSpecId && openmap.prodId==this.busiObj.instId){
								offerflag = true;
								return false;
							}
						}
					});
					if(!offerflag){
						var $span = $("#li_"+openmap.prodId+"_"+this.servSpecId).find("span"); //定位删除的附属
						var spec = CacheData.getServSpec(openmap.prodId,this.servSpecId);
						if(spec == undefined){ //没有在已开通附属销售列表中
							return;
						}
						$span.addClass("del");
						spec.isdel = "Y";
						AttachOffer.showHideUim(1,openmap.prodId,this.servSpecId);   //显示或者隐藏
						var serv = CacheData.getServBySpecId(openmap.prodId,this.servSpecId);
						if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
							$span.addClass("del");
							serv.isdel = "Y";
						}
					}
				});
			});
			//补换卡
			$.each(custOrderList,function(){
				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="14"){
					var instId = this.busiObj.instId;
					$("#uim_check_btn_"+instId).attr("disabled",true);
					$("#uim_check_btn_"+instId).removeClass("purchase").addClass("disablepurchase");
					$("#uim_release_btn_"+instId).attr("disabled",false);
					$("#uim_release_btn_"+instId).removeClass("disablepurchase").addClass("purchase");
					$("#uim_txt_"+instId).attr("disabled",true);
					$.each(this.data.bo2Coupons,function(){
						if(this.state=="ADD"){
							$("#uim_txt_"+instId).val(this.terminalCode);
							var coupon = {
									couponUsageTypeCd : this.couponUsageTypeCd, //物品使用类型
									cardTypeFlag : this.cardTypeFlag,
									inOutTypeId : this.inOutTypeId,  //出入库类型
									inOutReasonId : this.inOutReasonId, //出入库原因
									saleId : this.saleId, //销售类型
									couponId : this.couponId, //物品ID
									couponinfoStatusCd : this.couponinfoStatusCd, //物品处理状态
									chargeItemCd : this.chargeItemCd, //物品费用项类型
									couponNum : this.couponNum, //物品数量
									storeId : this.storeId, //仓库ID
									storeName : this.storeName, //仓库名称
									agentId : this.agentId, //供应商ID
									apCharge : this.apCharge, //物品价格
									couponInstanceNumber : this.couponInstanceNumber, //物品实例编码
									terminalCode : this.terminalCode,//前台内部使用的UIM卡号
									ruleId : this.ruleId, //物品规则ID
									partyId : this.partyId, //客户ID
									prodId :  this.prodId, //产品ID
									offerId : this.offerId, //销售品实例ID
									state : this.state, //动作
									relaSeq : this.relaSeq //关联序列	
								};
							OrderInfo.clearProdUim(instId);
							OrderInfo.boProd2Tds.push(coupon);
						}
					});
				}
			});
		}
	};
	
	var _loadAttachOffer = function(param) {
		for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
			var prodInfo = OrderInfo.oldprodInstInfos[i]; //获取老用户产品信息
//			var uimDivShow=false;//是否已经展示了
			var prodId = prodInfo.prodInstId;
			var member = _getOfferMember(prodId);
			var param = {
					areaId : prodInfo.areaId,
					channelId : OrderInfo.staff.channelId,
					staffId : OrderInfo.staff.staffId,
				    prodId : prodId,
				    prodSpecId : prodInfo.productId,
				    offerSpecId : prodInfo.mainProdOfferInstInfos[0].prodOfferId,
				    offerRoleId : "",
				    acctNbr : prodInfo.accNbr,
				    partyId:prodInfo.custId,
				    distributorId:OrderInfo.staff.distributorId,
				    mainOfferSpecId:prodInfo.mainProdOfferInstInfos[0].prodOfferId,
				    soNbr:OrderInfo.order.soNbr
				};
			if(ec.util.isObj(prodInfo.prodBigClass)){
				param.prodBigClass = prodInfo.prodBigClass;
			}
			$.each(OrderInfo.oldofferSpec,function(){
				if(this.accNbr==prodInfo.accNbr){
					$.each(this.offerSpec.offerRoles,function(){
						if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){							
							param.offerRoleId = this.offerRoleId;
						}
					});
				}
			});
			var res = query.offer.queryChangeAttachOffer(param);
			$("#attach_"+prodId).html(res);	
			$.jqmRefresh($("#attach_"+prodId));
			//如果objId，objType，objType不为空才可以查询默认必须
			if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
				param.queryType = "1,2";
				param.objId = member.objId;
				param.objType = member.objType;
				param.memberRoleCd = "401";
				//默认必须可选包
				var data = query.offer.queryDefMustOfferSpec(param);
				CacheData.parseOffer(data);
				//默认必须功能产品
				var data = query.offer.queryServSpec(param);
				CacheData.parseServ(data);
			}
			var oldoffer;
			if(ec.util.isArray(OrderInfo.oldoffer)){ //主套餐下的成员判断
//				var member = CacheData.getOfferMember(prodId);
			    $.each(OrderInfo.oldoffer,function(){
			    	if(this.accNbr == prodInfo.accNbr){
			    		oldoffer = this;
			    	}
			    });
			}
			if(ec.util.isArray(OrderInfo.oldofferSpec)){ //主套餐下的成员判断
//					var member = CacheData.getOfferMember(prodId);
				$.each(OrderInfo.oldofferSpec,function(){
					if(this.accNbr == prodInfo.accNbr){
						var offerRoles = this.offerSpec.offerRoles;
						$.each(offerRoles,function(){
							if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
								var offerRole = this;
								$.each(this.roleObjs,function(){
									if(this.objType==CONST.OBJ_TYPE.SERV){
										var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
										if(serv!=undefined){ //不在已经开跟已经选里面
											var $oldLi = $('#li_'+prodId+'_'+serv.servId);
											if(this.minQty==1){
												$oldLi.append('<dd class="mustchoose"></dd>');
											}
											$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
										}
									}
								});
								return false;
							}
						});
					}
				});
			}
			AttachOffer.changeLabel(prodId,prodInfo.productId,""); //初始化第一个标签附属
//				if(_isChangeUim(prodId)){ //需要补换卡
//					if(!uimDivShow){
//						$("#uimDiv_"+prodId).show();
//					}else{
//						$("#uimDiv_"+prodId).hide();
//					}
//				}
//				uimDivShow=true;
			
			//老用户加入副卡需要预校验,主卡是4G，加入的老用户为3G
			if((order.prodModify.choosedProdInfo.is3G== "N" && prodInfo.mainProdOfferInstInfos[0].is3G =="Y") || "ON" == offerChange.queryPortalProperties("YJY-" + OrderInfo.staff.soAreaId.substring(0,3) + "0000")){
				if(!order.memberChange.checkOrder(prodInfo,oldoffer)){ //省内校验单
					return;
				}
				order.memberChange.checkOfferProd(oldoffer);
			}
			
		}
		//order.main.reload();
//				});
//			}
//		});
	};
	
	var _loadViceMember = function(param) {
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		//遍历主销售品构成
		var uimDivShow=false;//是否已经展示了
		$.each(param.viceParam,function(){
			var prodId = this.objInstId;
			var param = {
				areaId : OrderInfo.getProdAreaId(prodId),
				channelId : OrderInfo.staff.channelId,
				staffId : OrderInfo.staff.staffId,
			    prodId : prodId,
			    prodSpecId : this.objId,
			    offerSpecId : prodInfo.prodOfferId,
			    offerRoleId : this.offerRoleId,
			    acctNbr : this.accessNumber
			};
			var res = query.offer.queryChangeAttachOffer(param);
			$("#attach_"+prodId).html(res);		
			$.jqmRefresh($("#attach_"+prodId));
			//如果objId，objType，objType不为空才可以查询默认必须		
			if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
				param.queryType = "1,2";
				param.objId = this.objId;
				param.objType = this.objType;
				param.memberRoleCd = "400";
				param.offerSpecId=this.offerSpecId;
				//默认必须可选包
				var data = query.offer.queryDefMustOfferSpec(param);
				CacheData.parseOffer(data,prodId);
				//默认必须功能产品
				var data = query.offer.queryServSpec(param);
				CacheData.parseServ(data,prodId);
			}
			/*if(CONST.getAppDesc()==0 && prodInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){	//预校验
			}else{	
			}*/
			AttachOffer.showMainMemberRoleProd(prodId); //显示新套餐构成
			AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
			if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
				if(!uimDivShow){
					$("#uimDiv_"+prodId).show();
				}else{
					$("#uimDiv_"+prodId).hide();
				}
			}
			uimDivShow=true;
		});		
		order.dealer.initDealer(); //初始化发展人
		offerChange.initOrderProvAttr();//初始化省内订单属性
	};
	
	return {
		buildMainView 		: _buildMainView,
		spec_parm			: _spec_parm,
		spec_member_parm 	: _spec_member_parm,
		check_parm			: _check_parm,
		queryScroll			: _queryScroll,
		queryStaff			: _queryStaff,
		queryStaffPage		: _queryStaffPage,
		setStaff			: _setStaff,
		chooseAcct 			: _chooseAcct,
		check_parm_self		: _check_parm_self,
		createAcct 			: _createAcct,
		showNewAcct 		: _showNewAcct,
		acctDetail 			: _acctDetail,
		//spec_parm_change: _spec_parm_change,
		spec_parm_change_save:_spec_parm_change_save,
		//spec_password_change:_spec_password_change,
		//spec_password_change_save:_spec_password_change_save,
		paymethodChange		:_paymethodChange,
		templateTypeCheck	:_templateTypeCheck,
		lastStep 			: _lastStep,
		genRandPass6		:_genRandPass6,
		genRandPass6Input	:_genRandPass6Input,
		passwordCheckInput	:_passwordCheckInput,
		passwordCheckVal	:_passwordCheckVal,
		checkIncreace6		:_checkIncreace6,
		feeTypeCascadeChange:_feeTypeCascadeChange,
		reload:_reload,
		loadAttachOffer:_loadAttachOffer
	};
})();


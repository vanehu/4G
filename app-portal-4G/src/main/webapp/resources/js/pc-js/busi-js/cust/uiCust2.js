/**
 * 客户资料管理
 */
CommonUtils.regNamespace("order", "uiCusts");

order.uiCusts = (function(){
	
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
	
	var _orderInfo;
	
	var showDialogInfo=function(content){
		$.ligerDialog.waitting("<div style='width:100%;text-align:center;font-size:15px;'>"+content+"</div>");
	}
	
	var _showPackageDialog=function(msg){
		var html="<table class=\"contract_list rule\">";
		html+='<thead><tr> <td colspan="2">提示</td></tr></thead></table>';
		html+="<div id=\"rules_div\" height=\"height:140px;\">";
		html+='<table width="100%" height="120px;" border="0" cellspacing="0" cellpadding="0">';
		html+='<tr>';
		html+='<td align="right"></td>';
		html+="<td><div class=\"rule_font\" style=\"width:100%;font-size:15px; text-align:center;\">"+msg+"</div></td>";
		html+='</tr>';
		html+='</table>';
		html+='</div>';
		easyDialog.open({
			container : 'packageTip_dialog'
		});
		$("#infoTipContent").html("");
		$("#infoTipContent").html(html);
	};
	
	var _custQuery=function(){
		//开始可选包前进行重载校验 
	//	var isReload=_packageInfo.reloadFlag;
/*
		if(isReload=="N"){
			if(order.uiCust.orderInfo==null || order.uiCust.orderInfo=="" || order.uiCust.orderInfo=="undefined"){
				_showPackageDialog("二次加载数据信息丢失!");
				return;
			}
			
			var resultCode=order.uiCust.orderInfo.resultCode;
			
			var resultMsg=order.uiCust.orderInfo.resultMsg;
			
			if(resultCode==null || resultCode=="" || resultCode=="undefined"){
				_showPackageDialog("二次加载数据信息丢失!");
				return;
			}
			
			if(resultCode=="-1" || resultCode=="2"){
				_showPackageDialog(resultMsg);
				return;
			}
		}
	*/	
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
		if(order.uiCusts.fromProvFlag == "1" || (identityCd!=-1 && CONST.getAppDesc()!=0)){
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
		
		//旧客户定位地市是获取工号地市，暂不用
		//areaId=$("#p_cust_areaId").val();
		
		//改为使用参数中的地市进行定位
		areaId=$("#custAreaId_").val();
		
		if(areaId==null || areaId=="" || areaId=="null" || areaId=="undefined"){
			_showPackageDialog("用于客户定位的地市为空，请重试!");
			return;
		}
		
		//lte进行受理地区市级验证
		if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
			_showPackageDialog("省级地区无法进行定位客户,请选择市级地区!");
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
		
		$.callServiceAsHtml(contextPath+"/token/pc/cust/queryCustSub",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询客户信息中,请稍候...</strong>");
			},"done" : function(response){
				if (response.code == -2) {
					return;
				}
				
				_queryCallBack(response);

			},fail:function(response){
				$.unecOverlay();
				_showPackageDialog("客户定位失败，请稍后再试!");
			},"always":function(){
				$.unecOverlay();
				$("#usersearchbtn").attr("disabled",false);
			}
		});
	}

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
			_showPackageDialog("抱歉,没有定位到客户,请尝试其他客户");
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
		
		//_showCustAuth($("#custInfos"));
		
	}
	
	//展示客户验证窗口，这里不需要，但是还是需要这个环节，弹出后马上关闭
	var _showCustAuth = function(scope) {

		
		$("#main_div_1").show();
		
		_choosedCustInfo = {
			custId : $(scope).find("td:eq(3)").text(),
			partyName : $(scope).find("td:eq(0)").text(),
			idCardNumber : $(scope).find("td:eq(4)").text(),
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
			vipLevelName :$(scope).attr("vipLevelName")
		};
		if(order.uiCusts.queryForChooseUser && _choosedCustInfo.segmentId != 1100){
			_showPackageDialog("使用人必须是公众客户，请重新定位");
			return false;
		}
		if(authFlag=="0"){
			if(order.cust.authType == '00'){
				$("#custAuthTypeName").html("客户密码：");
			} else {
				$("#custAuthTypeName").html("产品密码：");
			}
			var pCustIdentityCd = $("#p_cust_identityCd").val();
			if("1"==pCustIdentityCd){
				$('#authIDTD').attr("disabled",false);//身份鉴权的身份证在读卡时被禁用，此处启用
				easyDialog.open({
					container:'authID',
					callback : function(){
						order.uiCusts.queryForChooseUser = false; //关闭弹出框时重置标识位
					}
				});
			}else{
				easyDialog.open({
					container : 'auth',
					callback : function(){
						order.uiCusts.queryForChooseUser = false; //关闭弹出框时重置标识位
					}
				});
				
				_jumpAuth();
			}
			if(order.cust.jumpAuthflag=="0"){
				$("#jumpAuth").off('click').on('click', function(){
					order.cust.jumpAuth();
				});
				$("#jumpAuth").show();
				$("#jumpAuthID").show();
			}
			$("#authClose").off("click").on("click",function(event){
				easyDialog.close();
				$("#authPassword").val("");
			});
			$("#authIDClose").off("click").on("click",function(event){
				easyDialog.close();
				$("#authIDTD").val("");
			});
		} else{
			_custAuth(scope);
		}
		
	};
	
	//跳过验证权限
	var _jumpAuth = function() {
		
		//正常是要验证权限，这里就不需要了
//		if(order.cust.jumpAuthflag!="0"){
//			$.alert("提示","没有跳过校验权限！");
//			return;
//		}
		var param = _choosedCustInfo;
		param.authFlag="1";
		$.callServiceAsHtml(contextPath+"/cust/custAuthSub",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},"done" : function(response){
				if(response.code != 0) {
					_showPackageDialog("客户鉴权失败,稍后重试!");
					return;
				}
				
				if(!order.uiCusts.queryForChooseUser){
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
				// 注释后 才会显示下个请求的提示信息
//				$.unecOverlay();
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
		
		_btnQueryCustProdMore();
	};
	
	//点击已经订购业务开始start
	var _btnQueryCustProdMore=function(param){
		
		if(OrderInfo.cust.custId==-1){
			_showPackageDialog("新建客户无法查询已订购产品!");
			return;
		}
		
		var curPage=1;
		
		$("#prodDetail").hide();
		$("#prodInfo").hide();
		$("#prodList").hide();//原来是show的，这里不展示
		//$("#orderedprod").show();
		$("#orderContent").show();
		if(order.cust.orderBtnflag==""){//初次查询
			//隐藏菜单
			main.home.hideMainIco();
			_btnQueryCustProd(curPage);
			$("#orderedprod").hide();//原来是show的，这里不展示，改为hide
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
	
	//已订购业务第二步
	var _btnQueryCustProd=function(curPage){
		//收集参数
		var param={};
		if(_choosedCustInfo==null){
			param.custId="";
		}else{
			param.custId=_choosedCustInfo.custId;
			param.areaId =$("#area").attr("areaId");
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
		
		//获取查询号码new
			param.acctNbr=OrderInfo.acctNbr;

		if(document.getElementById("custPageSize")){
			param.pageSize=$.trim($("#custPageSize").val());
			if(!(/^[1-9]\d*$/.test(param.pageSize))&&(param.pageSize!="")){
				//页码格式不正确，必须为有效数字
				_showPackageDialog("获取页面信息失败,请稍后再试!");
				return false;
			}
			if(param.pageSize>15){
				//页数大小不能超过15
				_showPackageDialog("获取页面信息失败,请稍后再试!");
				return false;
			}
		}else {
			param.pageSize="";
		}
		param.curPage=curPage;
		param.DiffPlaceFlag=$("#DiffPlaceFlag").val();
		if(param.custId==null||param.custId==""){
			_showPackageDialog("无法查询已订购产品,查询失败!");
			//$.alert("提示","无法查询已订购产品");
			return;
		}
		
		//请求地址,查询产品列表
		var url = contextPath+"/cust/orderprodSub";//原地址是/cust/orderprod
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
					_showPackageDialog("查询信息失败,请稍后重试!");
					//$.alert("提示","查询失败,稍后重试");
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
	 * 已订购产品查询（选中产品）
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
		
		
		OrderInfo.busitypeflag=2
		$("#custInfo").hide();
		
		offerChange.init(); 
		//window.location.href=contextPath+"/app/main/common";
		
	};
	
	
	
	return {
		fromProvFlag : _fromProvFlag,
		custQuery : _custQuery,
		queryCallBack : _queryCallBack,
		btnQueryCustProd : _btnQueryCustProd,
		showCustAuth : _showCustAuth,
		orderInfo : _orderInfo,
		//packageInfo : _packageInfo,
		showPackageDialog : _showPackageDialog
	};
})();
$(function() {
//   order.cust.form_valid_init();
//   order.cust.initDic();
});
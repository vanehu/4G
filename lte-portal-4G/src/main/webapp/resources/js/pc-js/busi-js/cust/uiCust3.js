/**
 * 客户资料管理
 */
CommonUtils.regNamespace("order", "uiCustes");



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
order.uiCustes = (function(){
var _choosedCustInfo = {};
	
	var createCustInfo = {};
	var _orderInfo;
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
	
	var _choosedCustInfo = {};
	
	var _custQuery=function(){
		
	
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
		if(order.uiCustes.fromProvFlag == "1" || (identityCd!=-1 && CONST.getAppDesc()!=0)){
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
		areaId=$("#p_cust_areaId").val();
		if(areaId==undefined || areaId==null || areaId=="" || areaId=="null" || areaId=="undefined"){
			//改为使用参数中的地市进行定位
			areaId=$("#custAreaId_").val();
		}
		
		
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
		
		$.callServiceAsHtml(contextPath+"/token/pc/cust/queryCustSub2",param,{
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
		if(order.uiCustes.queryForChooseUser && _choosedCustInfo.segmentId != 1100){
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
						order.uiCustes.queryForChooseUser = false; //关闭弹出框时重置标识位
					}
				});
			}else{
				easyDialog.open({
					container : 'auth',
					callback : function(){
						order.uiCustes.queryForChooseUser = false; //关闭弹出框时重置标识位
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
				
				if(!order.uiCustes.queryForChooseUser){
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
	 * 
	 * */
	//订购销售品
	var _buyService = function(specId,price) {
	
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
			return;
		}
		var param = {
			"price":price,
			"specId" : specId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.soAreaId
		};
		
		if(OrderInfo.actionFlag == 2){  //套餐变更不做校验	
			order.uiCustes.opeSer(param);   
		}
	};
	/**
	 * */
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){	
		
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		if(OrderInfo.actionFlag == 2){ //套餐变更			
			var url=contextPath+"/token/pc/order/queryFeeType";
			$.ecOverlay("<strong>正在查询是否判断付费类型的服务中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {			
				if(response.data!=undefined){
					if("0"==response.data){			
						var is_same_feeType=false;
						if(order.prodModify.choosedProdInfo.feeType=="2100" && (offerSpec.feeType=="2100"||offerSpec.feeType=="3100"||offerSpec.feeType=="3101"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//预付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1200" && (offerSpec.feeType=="1200"||offerSpec.feeType=="3100"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//后付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1201" && (offerSpec.feeType=="1201"||offerSpec.feeType=="3101"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103")){
							is_same_feeType=true;//准实时预付费
						}
						if(!is_same_feeType){
							$.alert("提示","付费类型不一致,无法进行套餐变更。");
							return;
						}
					}
				}
			}
			order.uiCustes.offerChangeView();
			return;
		}
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var $tbody = $("#member_tbody");
		$tbody.html("");
		$("#main_title").text(OrderInfo.offerSpec.offerSpecName);
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			var $tr = $("<tr style='background:#f8f8f8;'></tr>");
			var $td = $('<td class="borderLTB" style="font-size:14px; padding:0px 0px 0px 12px"><span style="color:#518652; font-size:14px;">'
					+offerRole.offerRoleName+'</span>&nbsp;&nbsp;</td>');
			if(this.memberRoleCd == CONST.MEMBER_ROLE_CD.CONTENT){
				$tr.append($td).append($("<td colspan='3'></td>")).appendTo($tbody);
			}else{
				$tr.append($td).appendTo($tbody);
			}
			
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
				if(this.objType == CONST.OBJ_TYPE.PROD){
					if(offerRole.minQty == 0){ //加装角色
						this.minQty = 0;
						this.dfQty = 0;
					}
					var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
					$tr.append("<td align='left' colspan='3'>"+this.objName+" :<i id='plan_no' style='margin-top: 3px; display: inline-block; vertical-align: middle;'>"+
							"<a class='add' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'></a>"+
							"<input id='"+objInstId+"' type='text' value='"+this.dfQty+"' class='numberTextBox width22' readonly='readonly'>"+
							"<a class='add2' href='javascript:order.service.addNum(\""+objInstId+"\","+this.maxQty+",\""+offerRole.parentOfferRoleId+"\");'> </a>"+
							"</i>"+this.minQty+"-"+max+"（张） </td>");	
					iflag++;
				}
			});
			var $trServ = $("<tr></tr>");
			var i = 0;
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id	
				if(this.objType == CONST.OBJ_TYPE.SERV){  //是否有功能产品
					if(i%4==0){
						$trServ = $("<tr></tr>");
						$trServ.appendTo($tbody);
					}
					var $input = $('<input id="'+objInstId+'" name="'+offerRole.offerRoleId+'" type="checkbox">'+this.objName+'</input>');
					if(this.minQty == 0){
						if(this.dfQty>0){
							$input.attr("checked","checked");
						}
					}else if(this.minQty > 0){
						$input.attr("checked","checked");
						$input.attr("disabled","disabled");
					}
					var $td = $("<td></td>");
					$td.append($input).appendTo($trServ);
					i++;
					iflag++;
				}
			});
		});
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(iflag>1){
			easyDialog.open({
				container : "member_dialog"
			});
			$("#member_btn").off("click").on("click",function(){
				order.service.confirm(param);
			});
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};
	
	//套餐变更页面显示
	var _offerChangeView=function(){
		
		var oldLen = 0 ;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==2){
				oldLen++;
			}
		});
		var memberNum = 1; //判断是否多成员 1 单成员2多成员
		var viceNum = 0;
		if(oldLen>1){ //多成员角色，目前只支持主副卡
			memberNum = 2;
		}
		//把旧套餐的产品自动匹配到新套餐中
		if(!offerChange.setChangeOfferSpec(memberNum,viceNum)){  
			return;
		};
		//4g系统需要
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			if(!prod.uim.setProdUim()){ 
				return ;
			}
		}
		//初始化填单页面
		var prodInfo = order.prodModify.choosedProdInfo;
		var param = {
			boActionTypeCd : "S2" ,
			boActionTypeName : "套餐变更",
			actionFlag :"2",
			offerSpec : OrderInfo.offerSpec,
			prodId : prodInfo.prodInstId,
			offerMembers : OrderInfo.offer.offerMemberInfos,
			oldOfferSpecName : prodInfo.prodOfferName,
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc()
		};
		order.uiCustes.buildMainView(param);
	};
	var _buildMainView = function(param) {
		
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		if(!ec.util.isArray(OrderInfo.oldprodInstInfos)){
			if(OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
				var is_same_feeType=false;//
				if(param.feeTypeMain=="2100" && (OrderInfo.offerSpec.feeType=="2100"||OrderInfo.offerSpec.feeType=="3100"||OrderInfo.offerSpec.feeType=="3101"||OrderInfo.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1200" && (OrderInfo.offerSpec.feeType=="1200"||OrderInfo.offerSpec.feeType=="3100"||OrderInfo.offerSpec.feeType=="3102"||OrderInfo.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1201" && (OrderInfo.offerSpec.feeType=="1201"||OrderInfo.offerSpec.feeType=="3101"||OrderInfo.offerSpec.feeType=="3102"||OrderInfo.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}
				if(!is_same_feeType){
					$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
					return;
				}
			}
		}
		$.callServiceAsHtml(contextPath+"/token/pc/order/main",param,{
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
					
					order.uiCustes.fillOfferChange(response,param);
				}else if(OrderInfo.actionFlag == 21){//副卡换套餐
					order.memberChange.fillmemberChange(response,param);
				}else {
					_callBackBuildView(response,param);
				}
				if(CONST.getAppDesc()==1 && (OrderInfo.actionFlag==1 ||OrderInfo.actionFlag==14)){
					$("#li_is_activation").show();
				}
			},"always":function(){
				$.unecOverlay();
			}
		});
	};
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_fill_content").html(response.data);
		$("#fillNextStep").off("click").on("click",function(){
			SoOrder.submitOrder();
		});
		$("#fillLastStep").off("click").on("click",function(){
			order.main.lastStep();
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		//遍历主销售品构成
		var uimDivShow=false;//是否已经展示了
		var n=0;
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(ec.util.isArray(this.prodInsts)){
				$.each(this.prodInsts,function(){
					var prodId = this.prodInstId;
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
					//如果objId，objType，objType不为空才可以查询默认必须
					if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
						param.queryType = "1,2";
						param.objId = this.objId;
						param.objType = this.objType;
						param.memberRoleCd = this.roleCd;
						param.offerSpecId=OrderInfo.offerSpec.offerSpecId;
						//默认必须可选包
						var data = query.offer.queryDefMustOfferSpec(param);
						CacheData.parseOffer(data);
						//默认必须功能产品
						param.queryType = "1";//只查询必选，不查默认
						var data = query.offer.queryServSpec(param);
						CacheData.parseServ(data);
					}
					/*if(CONST.getAppDesc()==0 && prodInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){	//预校验
					}else{	
					}*/
					AttachOffer.showMainRoleProd(prodId); //显示新套餐构成
					AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
					if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
                     if(n==0){
                    	 $("#uimDiv_"+prodId).show();
                    	 n++;
                     }
                     else{
                    	 $("#uimDiv_"+prodId)[0].style.display = 'none';
                     }
                     
					}
				});
			}
		});
	
		order.dealers.initDealer(); //初始化发展人
		_initOrderProvAttr();//初始化省内订单属性
		
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){ //3G转4G需要校验
			
			offerChange.checkOfferProd();
		}
		_showOffer();   
		
	};
	
	
	
	//解析数据
	var _showOffer=function(){
        //清空发展人数据
		var array=new Array();
		var data=OrderInfo.data;
		var number=0;
		//进行进行数据解析工作,获取产品数据
		var custOrderList=data.orderList.custOrderList;
		
		var orderListInfo=data.orderList.orderListInfo;
		//购物车流水
		//OrderInfo.orderResult.olNbr=data.orderList.orderListInfo.soNbr;
		if(custOrderList!=null && custOrderList!=""){
			//获取下属的产品
			if(custOrderList!=null && custOrderList.length>0){
				$(custOrderList).each(function(i,custOrder) { 
					$(custOrder.busiOrder).each(function(i,busiOrder) { 
						//解析到具体的订购产品数据
						//获取产品操作类型
						var boActionTypeCd=busiOrder.boActionType.boActionTypeCd;
						
						//获取产品的操作状态,state,del-删除,add-添加
						var state="";
						
						var datas=busiOrder.data;
				
						var ooOwners;
						var boServs;
						
						// 7是已开通功能，状态的获取和其他类型获取不一样
						if(boActionTypeCd=="7"){
							boServs=datas.boServs;
							
							if(boServs!=null){
								$(boServs).each(function(i,boServ) { 
									state=boServ.state;
								});
							}
							
						}else{
							ooOwners=datas.ooOwners;
							if(ooOwners!=null){
								$(ooOwners).each(function(i,ooOwner) { 
									state=ooOwner.state;
									return false
								});
							}
						}
						
						var busiObj=busiOrder.busiObj;
					    
						
						
						//S2是已订购可选包
						if(boActionTypeCd=="S2" ){
							
							//获取唯一ID标识
							var instId=busiObj.instId;
							var offerTypeCd1=busiObj.offerTypeCd;
							$(datas.ooRoles).each(function(i,ooRole) { 
								var objInstId=ooRole.objInstId;
								state=ooRole.state;
								if(offerTypeCd1=="2"){
									if(state=="DEL"){

										_delOfferSub(objInstId,instId);
									}
								}
								
							});
						}else if(boActionTypeCd=="7"){
					
							//7是已开通功能产品
							//获取唯一ID标识
							
							var instId=busiObj.instId;
							
							var boServOrders=datas.boServOrders;
							
							$(datas.boServs).each(function(i,boServ) { 
								var servId=boServ.servId;
								var state=boServ.state;
								
								if(state=="DEL"){
									_closeServSub(instId,servId,state);
								}else if(state=="ADD"){
									$(boServOrders).each(function(i2,boServOrder) {
										var servSpecId=boServOrder.servSpecId;
										var servSpecName=boServOrder.servSpecName;
										
										_openServSpecSub(instId,servSpecId,servSpecName,'N');
									});
								}
							});
							
						}else if(boActionTypeCd=="S1"){
							
							//S1是订单中的已选可选包数据
							//获取唯一ID标识s
							var instid=busiObj.instId;
							var busiOrderAttrs=busiOrder.data.busiOrderAttrs;
							var ooRoles=busiOrder.data.ooRoles;
							var offerTypeCd=busiObj.offerTypeCd;
							var instid=busiObj.instId;
							var busiOrderAttrs=busiOrder.data.busiOrderAttrs;
							var ooRoles=busiOrder.data.ooRoles;
							var zdDatas=busiOrder.data;    //终端
						
				/*
							if(offerTypeCd==2){
								for(var i=0;i<ooRoles.length;i++){
									  if(ooRoles[i].state=="ADD"){
										 // _addOfferSpecSub(prodId,objId,ooRoles);
										  _addOfferSpecSub(ooRoles[i].objInstId,busiObj.objId,0);
			                            }
								}
							}
							*/
							if( busiOrder.boActionType.actionClassCd=="1200" && busiOrder.boActionType.boActionTypeCd=="S1" && busiOrder.busiObj.offerTypeCd=="2" ){
								
								var objId=busiObj.objId;
							
								var accessNumber=busiObj.accessNumber;
								var objName=busiObj.objName;
								var prodId=null;
								var ooRoles=datas.ooRoles;
								$(datas.ooRoles).each(function(i,ooRole) { 
									prodId=ooRole.prodId;
									return false;
								});
								
								
							//	_addAttachDealerSub(prodId+"_"+objId,accessNumber,objName);
								
								//重载订单中已经选择的服务
								_addOfferSpecSub(prodId,objId,ooRoles);
								
							}
							//解析终端串码
							if(busiOrder.boActionType.actionClassCd=="1200" && busiOrder.boActionType.boActionTypeCd=="S1" && busiOrder.busiObj.offerTypeCd=="2" ){
								if(zdDatas.bo2Coupons!=undefined){								
									//开始解析终端
                                     if(zdDatas.bo2Coupons.length==1){
                                    	 var bo2Coupons = zdDatas.bo2Coupons[0];
                                    	 var prodId=bo2Coupons.prodId;
                                    	 var offerSpecId=bo2Coupons.attachSepcId;
                                    	 var num="1";
                                    	 var flag="0";
                                    	 $("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+num).val(bo2Coupons.couponInstanceNumber);
                                    	 checkTerminalCode(prodId,offerSpecId,num,flag);
                                     }
                                     else{
                                    	  for(var i=0;i<zdDatas.bo2Coupons.length;i++){
                                    		   if(i==0){
                                    			 var bo2Coupons = zdDatas.bo2Coupons[0];
                                              	 var prodId=bo2Coupons.prodId;
                                              	 var offerSpecId=bo2Coupons.attachSepcId;
                                              	 var num="1";
                                              	 var flag="0";
                                              	 $("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+num).val(bo2Coupons.couponInstanceNumber);
                                              	 checkTerminalCode(prodId,offerSpecId,num,flag);
                                    		   }
                                    		   else{
                                    			   var bo2Coupons = zdDatas.bo2Coupons[i];
                                    			   var prodId=bo2Coupons.prodId;
                                                   var offerSpecId=bo2Coupons.attachSepcId;
                                                   var objInstId = prodId+"_"+offerSpecId;
                                    			   var $li=$("#ul_"+objInstId+" li");
                                    			   var length=$li.length-1;
                                    		       var num=length/2+1;
                                    		       var fag="0";
                                    		       var flag="0";
                                    			    //添加终端
                                    		        addAndDelTerminal(prodId,offerSpecId,fag);
                                    		        //赋值
                                    		        $("#terminalText_"+prodId+"_"+bo2Coupons.attachSepcId+"_"+num).val(bo2Coupons.couponInstanceNumber);
                                    		        //校验
                                    		        checkTerminalCode(prodId,offerSpecId,num,flag);
                                    		   }
                                    	  }

                                     }
								}
	
							}
						}
						else if(boActionTypeCd=="14"){
						    
							var bo2Coupons=busiOrder.data.bo2Coupons
							for(var i=0;i<bo2Coupons.length;i++){
								if(bo2Coupons[i].state=="ADD"){
									//uim卡号  //uim_txt_140029724038
									var card=bo2Coupons[i].couponInstanceNumber;
									//prodId
									var id=bo2Coupons[i].prodId;
									
									$("#uim_txt_"+id).val(card);//填充卡号
									order.uiCustes.checkUim(id,bo2Coupons[i]);
									
									 array[number]=id;
									 number++;
                                	 $("#uimDiv_"+id)[0].style.display = 'none';
								}
							}
						}
						
					});
				});
			}
		}
		
		//退订功能产品
		$.each(AttachOffer.openServList,function(){
			var openmap = this;
			$.each(this.servSpecList,function(){
				var offermap = this;
				var offerflag = false;
				var custOrderLists=custOrderList[0];
				$.each(custOrderLists.busiOrder,function(){
					var obj=this;
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
		
		//订单备注和模版等加载
		if(orderListInfo!=null && custOrderList!=null){
			var custOrderAttrs=orderListInfo.custOrderAttrs;
			var isTemplateOrder=orderListInfo.isTemplateOrder;
			var templateOrderName=orderListInfo.templateOrderName;
			
			$(custOrderAttrs).each(function(i,custOrderAttr) { 
				var itemSpecId=custOrderAttr.itemSpecId;
				
				//111111118是为备注的编码
				if(itemSpecId=="111111118"){
					var value=custOrderAttr.value;
					
					if(value!=null && value!=""){
						$("#order_remark").html(value);
					}
				}
			});
			
			//模版的操作
			if(isTemplateOrder=="Y"){
				$("#isTemplateOrder").click();//选中模版按钮
				
				SoOrder.showTemplateOrderName();//显示模版名称输入
				
				$("#templateOrderName").val(templateOrderName);//赋值模版名称
			}
		}
		for(var i=0;i<array.length;i++){
			if(i==0){
				$("#uimDiv_"+array[i])[0].style.display = 'block';
			}
			else{
				 $("#uimDiv_"+array[i])[0].style.display = 'none';
			}
		}
	};
	
	//添加可选包到缓存列表
	var _setSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);  //没有在已选列表里面
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			newSpec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
			if(!newSpec){
				return;
			}
			CacheData.setOfferSpec(prodId,newSpec);
		}
		return newSpec;
	};
	
	//二次加载附属业务数据信息 第一步
	var _addOfferSpecSub = function(prodId,offerSpecId,roles){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		
		_setServ2OfferSpecSub(prodId,newSpec);
		
		_checkOfferExcludeDependSub(prodId,newSpec);
			
	};
	//校验销售品的互斥依赖 第三步
	var _checkOfferExcludeDependSub = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			_paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
	};
	//关闭已开通功能产品(new)
	var _closeServSub = function(prodId,servId,state){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		if("13409244"==serv.servSpecId){//一卡双号虚号
			$.alert("提示","请通过“一卡双号退订”入口或者短信入口退订此功能");
		}else{ //关闭
			var uim = OrderInfo.getProdUim(prodId);
			if(serv.servSpecId=="280000020" && (OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23) && uim.cardTypeFlag=="1"){//补换卡补4G卡不能退订4G上网功能产品
				$.alert("提示","4G卡不能退订【4G（LTE）上网】功能产品");
				return;
			}

			$span.addClass("del");
			serv.isdel = "Y";
		}
	};
	//把选中的服务保存到销售品规格中 第二步
	var _setServ2OfferSpecSub = function(prodId,offerSpec,roles){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var nowProd=prodId+"_"+this.objId;
					
					$(roles).each(function(i,role) { 
						var oldProd=role.prodId+"_"+role.objId;
							
						if(nowProd==oldProd){
							this.selQty = 1;
							return false;
						}else{
							this.selQty = 2;
						}
					});
				});
			});
		}
	};
	
	//校验发展人类型,并获取发展人类型列表
	var _getDealerTypeSub = function(objInstId,objId){
		var dealerType = "";
		if(order.ysl!=undefined){
			OrderInfo.order.dealerTypeList = [{"PARTYPRODUCTRELAROLECD":40020005,"NAME":"第一发展人"},{"PARTYPRODUCTRELAROLECD":40020006,"NAME":"第二发展人"},{"PARTYPRODUCTRELAROLECD":40020007,"NAME":"第三发展人"}];
		}
		if(OrderInfo.order.dealerTypeList!=undefined && OrderInfo.order.dealerTypeList.length>0){ //发展人类型列表
			$.each(OrderInfo.order.dealerTypeList,function(){
				var dealerTypeId = this.PARTYPRODUCTRELAROLECD;
				var flag = true;
				$("select[name='dealerType_"+objInstId+"']").each(function(){ //遍历选择框
					if(dealerTypeId==$(this).val()){  //如果已经存在
						flag = false;
						return false;
					}
				});
				if(flag){ //如果发展人类型没有重复
					dealerType = dealerTypeId;
					return false;
				}
			});
		}else{
			$.alert("信息提示","没有发展人类型");
			return;
		}
		if(dealerType==undefined || dealerType==""){	
			$.alert("信息提示","每个业务发展人类型不能重复");
			return;
		}
		var $td = $('<td></td>'); //发展人类型
		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth250px" style="width:183px;" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		$.each(OrderInfo.order.dealerTypeList,function(){
			if(this.PARTYPRODUCTRELAROLECD==dealerType){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected='selected'>"+this.NAME+"</option>");
			}else{
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			}
		});
		$td.append($select);
		$td.append('<label class="f_red">*</label>');
		return $td;
	};
	
	//解析互斥依赖返回结果
	var _paserOfferData = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				defaultOffer : [], //默选的显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							var offerSpec=CacheData.getOfferSpec(prodId,subOfferSpec.offerSpecId);
							if(ec.util.isObj(offerSpec)){
								if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}
						}
					}
				}
			}
			//解析可选包默选组
			if(ec.util.isArray(defaultOffer)){
				for (var i = 0; i < defaultOffer.length; i++) {	
					content += "需要开通： " + defaultOffer[i].offerSpecName + "<br>";
					param.defaultOffer.push(defaultOffer[i].offerSpecId);
				}	
			}
		}
		var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		content=content+serContent;
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{	
			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
			$.confirm("订购： " + specName,content,{ 
				yes:function(){
					CacheData.setOffer2ExcludeOfferSpec(param);
				},
				yesdo:function(){
					AttachOffer.excludeAddattch(prodId,offerSpecId,param);
					AttachOffer.excludeAddServ(prodId,"",paramObj);
				},
				no:function(){
					
				}
			});
		}
	};
	//互斥依赖时添加
	var _excludeAddattch = function(prodId,specId,param){
		if(param.dependOffer.offerGrpInfos.length>0){  // 依赖组
			var dependOffer=param.dependOffer;
			for (var i = 0; i < dependOffer.offerGrpInfos.length; i++) {
				var offerGrpInfo = dependOffer.offerGrpInfos[i];
				var len  = offerGrpInfo.checkLen;
				if(len>=offerGrpInfo.minQty&&len<=offerGrpInfo.maxQty){
					$.each(offerGrpInfo.subOfferSpecInfos,function(){
						if(this.isCheck){
							AttachOffer.addOpenList(prodId,this.offerSpecId); 
						}
					});
				}else if(len<offerGrpInfo.minQty){
					$.alert("提示信息","依赖组至少选中"+offerGrpInfo.minQty+"个！");
					return;
				}else if(len>offerGrpInfo.maxQty){
					$.alert("提示信息","依赖组至多选中"+offerGrpInfo.maxQty+"个！");
					return;
				}else {
					$.alert("错误信息","依赖组选择出错！");
					return;
				}
			}
		}
		
		AttachOffer.addOpenList(prodId,specId); //添加开通附属
		if(param.excludeOffer.length>0){ //有互斥
			//删除已开通
			for (var i = 0; i < param.excludeOffer.length; i++) {
				var excludeSpecId = param.excludeOffer[i];
				var spec = CacheData.getOfferSpec(prodId,excludeSpecId);
				if(spec!=undefined){
					var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
					$("#terminalUl_"+prodId+"_"+excludeSpecId).remove();
				}
				var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
				if(offer!=undefined){
					var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
					$span.addClass("del");
					offer.isdel = "Y";
				}
			}
		}
		if(param.dependOffer.dependOffers.length>0){ // 依赖
			for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
				var offerSpecId = param.dependOffer.dependOffers[i];
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}
		}
		if(param.defaultOffer.length>0){ // 默选
			for (var i = 0; i < param.defaultOffer.length; i++) {
				var offerSpecId = param.defaultOffer[i];
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}
		}
		/*if(objType == "OFFER"){
			AttachOffer.addOpenList(prodId,specId); //添加开通附属
			if(param.excludeOffer.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeOffer.length; i++) {
					var excludeSpecId = param.excludeOffer[i];
					var spec = AttachOffer.getSpec(prodId,excludeSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var offer = AttachOffer.getOfferBySpecId(prodId,excludeSpecId);
					if(offer!=undefined){
						var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
						$span.addClass("del");
						offer.isdel = "Y";
					}
				}
			}
			if(param.dependOffer.dependOffers.length>0){ // 依赖
				for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
					var offerSpecId = param.dependOffer.dependOffers[i];
					AttachOffer.addOpenList(prodId,offerSpecId); 
				}
			}
		}else{
			AttachOffer.addOpenServList(prodId,specId); //添加开通功能
			if(param.excludeServ!=undefined && param.excludeServ.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeServ.length; i++) {
					var excludeServSpecId = param.excludeServ[i].servSpecId;
					var spec = CacheData.getServSpec(prodId,excludeServSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var serv = AttachOffer.getServ(prodId,excludeServSpecId);
					if(serv!=undefined){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
			if(param.dependServ!=undefined&&param.dependServ.length>0){ // 依赖
				for (var i = 0; i < param.dependServ.length; i++) {
					var servSpecId = param.dependServ[i].servSpecId;	
					var newSpec = {
						objId : servSpecId, //调用公用方法使用
						servSpecId : servSpecId,
						servSpecName : param.dependServ[i].servSpecName,
						ifParams : param.dependServ[i].ifParams,
						isdel : "C"   //加入到缓存列表没有做页面操作为C
					};
					var inPamam = {
						prodSpecId:servSpecId
					};
					if("Y"  == newSpec.ifParams){
						var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
						if(data==undefined || data.result==undefined){
							return;
						}
						newSpec.prodSpecParams = data.result.prodSpecParams;
					}
					CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
					AttachOffer.addOpenServList(prodId,servSpecId); 
				}
			}
		}*/
	};
	//查询销售品对象的互斥依赖连带的关系
	var _servExDepReByRoleObjs=function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		paramObj.excludeServ=[];//初始化
		paramObj.dependServ=[];//初始化
		paramObj.relatedServ=[];//初始化
		var globContent="";
		$.each(newSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				if(this.objType==4 && this.selQty==1){
						var servSpec = CacheData.getServSpec(prodId,this.objId); //在已选列表中查找
						if(servSpec==undefined){   //在可订购功能产品里面 
							var serv = CacheData.getServBySpecId(prodId,this.objId); //在已开通列表中查找
							if(serv==undefined){
								var newServSpec = {
										objId : this.objId, //调用公用方法使用
										servSpecId : this.objId,
										servSpecName : this.objName,
										ifParams : this.isCompParam,
										prodSpecParams : this.prodSpecParams,
										isdel : "C"   //加入到缓存列表没有做页面操作为C
								};
								CacheData.setServSpec(prodId,newServSpec); //添加到已开通列表里
								servSpec = newServSpec;
							}else{
								servSpec=serv;
							}
						}
						var servSpecId = servSpec.servSpecId;
						var param = CacheData.getExcDepServParam(prodId,servSpecId);
						if(param.orderedServSpecIds.length == 0){
//							AttachOffer.addOpenServList(prodId,servSpecId,servSpec.servSpecName,servSpec.ifParams);
						}else{
							var data=query.offer.queryExcludeDepend(param);//查询规则校验
							var content=paserServDataByObjs(data.result,prodId,servSpec,newSpec);
							if(content!=""){
								content=("开通【"+servSpec.servSpecName+"】功能产品：<br>"+content);
								globContent+=(content+"<br>");
							}
						}
				}
			});
		});
		return globContent;
	};
	//转换接口返回的互斥依赖
	var paramObj = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
	};
	var _queryOfferInst = function(param,callBackFun) {
		var url= contextPath+"/offer/queryOfferInst";
		if(typeof(callBackFun)=="function"){
			$.callServiceAsJsonGet(url,param,{
				"before":function(){
					$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询销售品实例失败,稍后重试");
					}
				}
			});	
		}else {
			$.ecOverlay("<strong>正在查询销售品实例中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data){
					return response.data;
				}
			}else if (response.code==-2){
				$.alertM(response.data);
			}else {
				$.alert("提示","查询销售品实例失败,稍后重试");
			}
		}
	};
	
	//点击确认，添加附属销售品发展人
	var _addAttachDealerSub = function(id,accessNumbe,objName){
		var prodId = id.split("_")[0];
		if($("#tr_"+id)[0]==undefined){ //没有添加过
			var objId = id+"_"+OrderInfo.SEQ.dealerSeq;
			var $tdType = _getDealerTypeSub(id,objId);
			if($tdType==undefined){
				return false;
			}
			var $tr = $("#atr_"+id);
			var $newTr = $('<tr name="tr_'+id+'"></tr>');
			$newTr.append("<td>"+accessNumbe+"</td>");
			$newTr.append("<td>"+objName+"</td>");
			$newTr.append($tdType);
			
			var dealer = $("#tr_"+prodId).find("input"); //产品协销人
			var staffId = 1;
			var staffName = "";
			if(dealer[0]==undefined){
				staffId = OrderInfo.staff.staffId;
				staffName = OrderInfo.staff.staffName;
			}else {
				staffId = dealer.attr("staffId");
				staffName = dealer.attr("value");
			}
			if(order.ysl!=undefined){
				var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'" class="inputWidth183px" style="margin-left:45px;"></input></td>');
			}else{
				var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'" class="inputWidth183px" readonly="readonly" style="margin-left:45px;"></input></td>');
			}
			$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');	
			$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>');
			$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,\''+id+'\')">添加</a><label class="f_red">*</label>');
			$newTr.append($td);
			$("#dealerTbody").append($newTr);
			OrderInfo.SEQ.dealerSeq++;
		}
	};
	
	//初始化省内订单属性
	var _initOrderProvAttr = function(){
		if($("#orderProvAttrIsale")){
			$("#orderProvAttrIsale").val(OrderInfo.provinceInfo.provIsale);
		}
		var url=contextPath+"/order/provOrderAttrFlag";
		$.ecOverlay("<strong>正在查询是否显示省内订单属性,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,{});	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data!=undefined){
				if("0"==response.data){
					$("#orderProvAttrDiv").show();
				}
			}
		}
	};
	
	//删除已订购可选包(new)
	var _delOfferSub = function(prodId,offerId){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = _getOffer(prodId,offerId);

			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offerId	
				};
				if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
							param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
						}
					}
				}else{
					param.acctNbr = OrderInfo.getAccessNumber(prodId);
				}
				var dataes = order.uiCustes.queryOfferInst(param);
				if(dataes==undefined){
					return;
				}
				//遍历附属的构成要和主套餐的构成实例要一致（兼容融合套餐）
				var offerMemberInfos=[];
				$.each(dataes.offerMemberInfos,function(){
					var prodInstId=this.objInstId;
					var flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objInstId==prodInstId){
							flag=true;
							return false;
						}
					});
					if(flag){
						offerMemberInfos.push(this);
					}
				});
				
				offer.offerMemberInfos = dataes.offerMemberInfos=offerMemberInfos;
				offer.offerSpec = dataes.offerSpec;
			}
			var content = "";
			if(offer.offerSpec!=undefined){
				content = CacheData.getOfferProdStr(prodId,offer,1);
			}
			//这里原先是有弹窗提示的，二次加载就不需要了，原方法：_delOffer
			offer.isdel = "Y";
			$span.addClass("del");
			delServByOffer(prodId,offer);
		}
	};
	//删除附属销售品带出删除功能产品
	var delServByOffer = function(prodId,offer){	
		$.each(offer.offerMemberInfos,function(){
			var servId = this.objInstId;
			if($("#check_"+prodId+"_"+servId).attr("checked")=="checked"){
				var serv = CacheData.getServ(prodId,servId);
				if(ec.util.isObj(serv)){
					serv.isdel = "Y";
					var $li = $("#li_"+prodId+"_"+servId);
					$li.removeClass("canshu").addClass("canshu2");
					$li.find("span").addClass("del"); //定位删除的附属
				}
			}
		});
	};
	//获取销售品实例构成new
	var _getOffer = function(prodId,offerId){
		
		var offerList = order.uiCustes.getOfferList(prodId);
		//$.alert(JSON.stringify(offerList));
		if(ec.util.isArray(offerList)){
			for ( var i = 0; i < offerList.length; i++) {
				if(offerList[i].offerId==offerId){
					return offerList[i];
				}
			}
		}
	};
	
	//开通功能产品
	var _openServ = function(prodId,serv){
		if(serv!=undefined){   //在可订购功能产品里面 
			if(serv.servSpecId==""){
				var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
				$span.removeClass("del");
				serv.isdel = "N";
			}else{
				AttachOffer.checkServExcludeDepend(prodId,serv);
			}
		}
	};
	
	//开通功能产品
	var _openServSpecSub = function(prodId,servSpecId,specName,ifParams){
		var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
		if(servSpec==undefined){   //在可订购功能产品里面 
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : specName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			if(servSpecId==CONST.YZFservSpecId){//翼支付助手根据付费类型改变默认值
				var feeType = $("select[name='pay_type_-1']").val();
				if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
				if(feeType == CONST.PAY_TYPE.AFTER_PAY){
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {
						var prodSpecParam = newSpec.prodSpecParams[j];
						prodSpecParam.setValue = "";
					}																			
				}else{
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {							
						var prodSpecParam = newSpec.prodSpecParams[j];
						if (prodSpecParam.value!="") {
							prodSpecParam.setValue = prodSpecParam.value;
						} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
							//默认值为空则取第一个
							prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
				}
			  }
			}
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			servSpec = newSpec;
		}
		
		_checkServExcludeDepend(prodId,servSpec);
	};
	//解析服务互斥依赖
	var paserServData = function(result,prodId,serv){
		var servSpecId = serv.servSpecId;
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
		};
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					//scontent += "需要关闭：   " + this.servSpecName + "<br>";
					param.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.dependServ.push(this);
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.relatedServ.push(this);
			});
		}
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{	
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
			AttachOffer.excludeAddServ(prodId,servSpecId,param);
		}
	};
	//校验服务的互斥依赖
	var _checkServExcludeDepend = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServData(data.result,prodId,serv);//解析数据
			}
		}
	};
	//通过产品id获取产品已开通附属实例列表
	var _getOfferList = function (prodId){
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			if(opened.prodId == prodId){
				return opened.offerList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	var _addOfferSpec = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		CacheData.setServ2OfferSpec(prodId,newSpec);
	};
	
	//uim卡
	
	//uim卡号校验
	var _checkUim = function(prodId,bo2Coupons){
	
		var phoneNumber = OrderInfo.getAccessNumber(prodId);
		var offerId = "-1"; //新装默认，主销售品ID
		/*
		if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14){ //新装需要选号
			if(phoneNumber==''){
				$.alert("提示","校验UIM卡前请先选号!");
				return false;
			}
		}
		*/
		if(OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23 || OrderInfo.actionFlag==6 ){ //可选包变更，补换卡，加装副卡
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//判断是否是纳入老用户
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==prodId){
						offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
					}
				});
			}else{
				offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
			}
		}
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		/*
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		*/
		var inParam = {
			"instCode" : cardNo,
			"phoneNum" : phoneNumber,
			"areaId"   : OrderInfo.getProdAreaId(prodId)
		};

		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var mktResCd="";
		if(CONST.getAppDesc()==0){
			if(getIsMIFICheck(prodId)){
				mktResCd =prod.uim.getMktResCd(CONST.PROD_SPEC_ID.MIFI_ID);
			}else{
				mktResCd = prod.uim.getMktResCd(prodSpecId);
			}
			if(ec.util.isObj(mktResCd)){
//				inParam.mktResCd = mktResCd;
			}else{
				//$.alert("提示","查询卡类型失败！");
				return;
			}
			if(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23){ //补换卡和异地补换卡
				if(prod.changeUim.is4GProdInst){ //如果已办理4G业务，则校验uim卡是否是4G卡
					inParam.onlyLTE = "1";
				}
			}
		}
		//var data = query.prod.checkUim(inParam);//校验uim卡
  
			var uimData = {
					prodId :  prodId, //产品ID
					isWireBusi : "",
					isWireUIM : false, //判断是否为无线上网卡
					wireType : 0, //1-普通上网卡 2-全球上网卡 0-默认
					uimCode  : bo2Coupons.couponInstanceNumber,//data.baseInfo.mktResInstCode,
					uimName  : ""//data.baseInfo.mktResName
			};
			/*
			$.each(data.attrList, function() {
				if (this.attrId == '60020007') {
					uimData.isWireUIM = true;
					uimData.wireType = this.attrValue;
					return false;
				}
			});
			*/
			if(uimData.isWireUIM){
				if (prodSpecId == CONST.PROD_SPEC.CDMA) {
					uimData.isWireBusi = 1; // 上网卡 - 移动电话业务
				}
			}else{
				if(prodSpecId == CONST.PROD_SPEC.DATA_CARD){
					uimData.isWireBusi = 2; // 普通卡 - 无线业务
				}
			}
			OrderInfo.clearCheckUimData(prodId);
			OrderInfo.checkUimData.push(uimData);
		//根据uim返回数据组织物品节点
		var couponNum = bo2Coupons.couponNum;//data.baseInfo.qty ;
		if(couponNum==undefined||couponNum==null){
			couponNum = 1 ;
		}
		var coupon = {
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "1",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :bo2Coupons.couponId, //data.baseInfo.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : couponNum, //物品数量
			storeId : bo2Coupons.storeId,//data.baseInfo.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : bo2Coupons.terminalCode,//data.baseInfo.mktResInstCode, //物品实例编码
			terminalCode : bo2Coupons.terminalCode,//data.baseInfo.mktResInstCode,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :  prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=bo2Coupons.cardTypeFlag;//UIM卡类型
		}
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		$("#uim_release_btn_"+prodId).attr("disabled",false);
		$("#uim_release_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
		$("#uim_txt_"+prodId).attr("disabled",true);
		if(getIsMIFICheck(prodId)){//判断是否通过MIFI 校验
			$("#isMIFI_"+prodId).val("yes");
		}else{
			$("#isMIFI_"+prodId).val("no");
		}
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
		if(OrderInfo.actionFlag==22 && bo2Coupons.cardTypeFlag==1 && order.prodModify.choosedProdInfo.productId != '280000000'){
		//	_queryAttachOffer();
		  AttachOffer.queryCardAttachOffer(bo2Coupons.cardTypeFlag);  //加载附属销售品
	    }
		// 办理上网卡套餐，UIM校验当卡为全球上网卡自动带出天翼宽带-国际及港澳台数据漫游
		if (OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14) {
			if (uimData.isWireUIM && uimData.wireType == '02'
					&& prodSpecId == CONST.PROD_SPEC.DATA_CARD) {
				// AttachOffer.openServSpec(prodId,13409441,'天翼宽带-国际及港澳台数据漫游','N');
				AttachOffer.addOpenServList(prodId,
						CONST.PROD_SPEC_ID.WIRE_GLOBAL, '天翼宽带-国际及港澳台数据漫游', 'N');
				var $li = $("#li_" + prodId + "_"
						+ CONST.PROD_SPEC_ID.WIRE_GLOBAL);
				if ($li.length > 0) {
					$li.find("dd").removeClass("delete").addClass("mustchoose")
							.attr("onclick", '');
				}
			}
		}
	};
	
	
	
	var getIsMIFICheck=function(prodId){
		var prodIdTmp=(Math.abs(prodId)-1);
		if(AttachOffer.openServList.length>prodIdTmp){
			var specList = AttachOffer.openServList[prodIdTmp].servSpecList;
			for (var j = 0; j < specList.length; j++) {
				var spec = specList[j];
				if(spec.isdel!="Y" && spec.isdel!="C"){
					if(spec.servSpecId==CONST.PROD_SPEC_ID.MIFI_ID && CONST.APP_DESC==0){
						return true ; 
					}
				}
			}
		}
		return false;
	};
	//判断同一个终端组里面是否串码有重复的
	var _checkData=function(objInstId,terminalCode){
		var $input=$("input[id^=terminalText_"+objInstId+"]");
		var num=0;
		$input.each(function(){//遍历页面上面的串码输入框，为的是跟缓存里面的串码进行比对
			var instCode=$.trim(this.value);//页面上面的串码
			if(ec.util.isObj(instCode)&&terminalCode==instCode){
				num++;
			}
		});
		if(num>=2){
			$.alert("信息提示","终端串码重复了，请填写不同的串码。");
			return true ; 
		}
		return false;
	};
	//添加终端
	var addAndDelTerminal=function(prodId,offerSpecId,fag){

		var newSpec;
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(ec.util.isObj(offer)){
			newSpec=offer;
		}else{
			newSpec = _setSpec(prodId,offerSpecId);
		}
		var objInstId = prodId+'_'+newSpec.offerSpecId;
		var maxNum=newSpec.agreementInfos[0].maxNum;
		var minNum=newSpec.agreementInfos[0].minNum;

		var $ul=$("#ul_"+objInstId);
		var $li=$("#ul_"+objInstId+" li");
		var length=$li.length-1;

		var isFastOffer = 0 ;
		if(ec.util.isArray(newSpec.extAttrParams)){
			$.each(newSpec.extAttrParams,function(){
				if(this.attrId == CONST.OFFER_FAST_FILL){
					isFastOffer = 1;
					return false;
				}
			});
		}
		if(fag==0){//添加终端
			if(AttachOffer.totalNums>=maxNum){
				$.alert("信息提示","终端数已经达到最大，不能再添加了。");
				return;
			}

			var $liTerminalAdd=$('<li><label>终端校验：</label><input id="terminalText_'+objInstId+'_'+(length/2+1)+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
					+'<input id="terminalBtn_'+objInstId+'_'+(length/2+1)+'" type="button" flag="'+isFastOffer+'" num="'+(length/2+1)+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)" value="校验" class="purchase" style="float:left"></input></li>');
			var $liAdd = $('<li id="terminalDesc_'+(length/2+1)+'" style="white-space:nowrap;"><label></label><label id="terminalName_'+(length/2+1)+'"></label></li>');
			
			$ul.append($liTerminalAdd).append($liAdd);
			AttachOffer.totalNums++;
		}else{//删除终端
			if(minNum==(length/2)){
				$.alert("信息提示","终端数已经达到最小，不能再删除了。");
				return;
			}
			$li.each(function(index){
				if(length-1==index){
					$(this).remove();
				}else if(length==index){
					_filterAttach2Coupons(prodId,offerSpecId,(index/2));
					$(this).remove();
				}
				
			});
			AttachOffer.totalNums--;
		}
	};
	//过滤 同一个串码输入框校验多次，如果之前有校验通过先清空
	var filterAttach2Coupons=function(prodId,offerSpecId,num){
		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
			var attach2Coupon = OrderInfo.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId&&attach2Coupon.num==num){
				OrderInfo.attach2Coupons.splice(i,1);
				$("#terminalName_"+num).html("");
				break;
			}
		}
	};
	var _checkTerminal = function(param){
		var url = contextPath+"/mktRes/terminal/checkTerminal";
		$.ecOverlay("<strong>终端校验中,请稍后....</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == -2) {
			$.alertM(response.data);
		}else if(response.data && response.data.code == 0) {
			return response.data;
		}else if( response.data.code == 1){
			$.alert("提示", response.data.message);
		}else{
			$.alert("提示","<br/>校验失败，请稍后重试！");
		}
	};
	//终端校验
	var checkTerminalCode = function(prodId,offerSpecId,num,flag){


		if(flag==undefined){
			flag = 0 ;
		}
		
		//清空旧终端信息
		filterAttach2Coupons(prodId,offerSpecId,num);
		
		var objInstId = prodId+"_"+offerSpecId;

		var resIdArray = [];
		var terminalGroupIdArray = [];
		$("#"+objInstId+"  option").each(function(){
			resIdArray.push($(this).val());
		});
		$("#group_"+objInstId+"  option").each(function(){
			terminalGroupIdArray.push($(this).val());
		});
		var resId = resIdArray.join("|"); //拼接可用的资源规格id
		var terminalGroupId = terminalGroupIdArray.join("|"); //拼接可用的资源终端组id
		if((resId==undefined || $.trim(resId)=="") && (terminalGroupId==undefined || $.trim(terminalGroupId)=="")){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+objInstId + "_"+num).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		if(_checkData(objInstId,instCode)){
			return;
		}
		var param = {
			instCode : instCode,
			flag : flag,
			mktResId : resId
	//		termGroup : terminalGroupId   update by huangjj #13336需求资源要求这个参数不传
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		var activtyType ="";
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && ec.util.isArray(spec.agreementInfos)){  //订购的附属销售品
                    if(spec.agreementInfos[0].activtyType == 2){
                    	activtyType = "2";
				    }
				}
			}
		}
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE || (data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2")){
			//$.alert("信息提示",data.message);

			var mktPrice=0;//营销资源返回的单位是元
			var mktColor="";
			if(ec.util.isArray(data.mktAttrList)){
				$.each(data.mktAttrList,function(){
					if(this.attrId=="65010058"){
						mktPrice=this.attrValue;
					}else if(this.attrId=="60010004"){
						mktColor=this.attrValue;
					}
				});
			}
			//$("#terminalName_"+num).html("终端规格："+data.mktResName+",终端颜色："+mktColor+",合约价格："+mktPrice+"元");
			$("#terminalDesc_"+num).css("display","block");

			var coupon = {
				couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : data.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : data.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : mktPrice, //物品价格,约定取值为营销资源的
				couponInstanceNumber : data.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId : prodId, //产品ID
				offerId : -1, //销售品实例ID
				attachSepcId : offerSpecId,
				state : "ADD", //动作
				relaSeq : "", //关联序列	
				num	: num //第几个串码输入框
			};
			if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2"){//“已销售未补贴”的终端串码可以办理话补合约
				coupon.couponSource ="2"; //串码话补标识
			}
			if(CONST.getAppDesc()==0){
				coupon.termTypeFlag=data.termTypeFlag;
			}
			OrderInfo.attach2Coupons.push(coupon);
		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
			$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
		}else{
			//$.alert("提示",data.message);
		}
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
		
		//order.prodModify.orderAttachOffer();
		//跳转到套餐更新页面
		
		OrderInfo.busitypeflag=2
		$("#custInfo").hide();
		OrderInfo.actionFlag = 2;
		
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		
		$("#custInfo").hide();
		
		var boInfos;
		
		var nowIs3G=order.prodModify.choosedProdInfo.is3G;
		
		if(nowIs3G=="Y"){
			boInfos=[{
				boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER,
				specId : CONST.PROD_SPEC.CDMA,
			},{
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER,
				specId : CONST.PROD_SPEC.CDMA,
			}];
		}else{
			boInfos=[{
				boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER,
				instId : prodInfo.prodInstId,
				specId : CONST.PROD_SPEC.CDMA,
				prodId : prodInfo.prodInstId
			},{
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER,
				instId : prodInfo.prodInstId,
				specId : CONST.PROD_SPEC.CDMA,
				prodId : prodInfo.prodInstId
			}];
		}
		
		//进行规则校验
		if(!rule.rule.ruleCheck(boInfos)){
			return;
		}
		
		//如果是二次加载 
		if(OrderInfo.reloadFlag=="N"){
			order.uiCustes.buyService(OrderInfo.offid,"");
		}else{
				order.service.buyService(OrderInfo.offid,"");
		}
	};

	return {
		openServ:_openServ,
	//	getIsMIFICheck:_getIsMIFICheck,
		fromProvFlag : _fromProvFlag,
		orderInfo : _orderInfo,
		custQuery : _custQuery,
		queryCallBack : _queryCallBack,
		btnQueryCustProd : _btnQueryCustProd,
		showCustAuth : _showCustAuth,
		showPackageDialog : _showPackageDialog,
		closeServSub:_closeServSub,
		getOfferList:_getOfferList,
		openServSpecSub:_openServSpecSub,
		getDealerTypeSub:_getDealerTypeSub,
		excludeAddattch:_excludeAddattch,
		paserOfferData:_paserOfferData,
		servExDepReByRoleObjs:_servExDepReByRoleObjs,
		checkOfferExcludeDependSub:_checkOfferExcludeDependSub,
		setServ2OfferSpecSub:_setServ2OfferSpecSub,
		setSpec:_setSpec,
		addOfferSpecSub:_addOfferSpecSub,
		addAttachDealerSub:_addAttachDealerSub,
		queryOfferInst:_queryOfferInst,
		getOffer:_getOffer,
		delOfferSub:_delOfferSub,
		showOffer:_showOffer,
		initOrderProvAttr:_initOrderProvAttr,
		fillOfferChange:_fillOfferChange,
		buildMainView:_buildMainView,
		offerChangeView:_offerChangeView,
		opeSer:_opeSer,
		buyService:_buyService,
		btnQueryCustProd : _btnQueryCustProd,
		checkUim:_checkUim
	};
})();

CommonUtils.regNamespace("order", "ysl");

order.ysl = (function(){
	var _yslbean={
		yslflag:"ysl"	
	}
	var _openList = [];
	var _paymentbean = [];
	var _realmoney = 0;
	var _CUST_ORDER_ID = "";
	var _CUST_SO_NUMBER = "";
	var _INVOICE_ID = "";
	
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(){
		$("#identidiesTypeCd").empty();
		$("#cCustIdCard").val("");
		var partyTypeCd = $("#partyTypeCd").val();
		cust.validatorForm();
		if(partyTypeCd=="1"){
			$("#identidiesTypeCd").append('<option value="1">身份证</option><option value="2">军官证</option><option value="22">警官证</option><option value="3">护照</option><option value="4">港澳台通行证</option><option value="99">其它有效证件</option>');
		}else if(partyTypeCd=="2"){
			$("#identidiesTypeCd").append('<option value="15">组织机构代码证</option><option value="6">工商执照</option><option value="99">其它有效证件</option>');
		}
		$.refresh($("#zjlx"));
		_identidiesTypeCdChoose($("#identidiesTypeCd").children(":first-child"));
	};
	//证件类型选择事件
	var _identidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==undefined){
			identidiesTypeCd=$("#div_cm_identidiesType  option:selected").val();
		}
		if(identidiesTypeCd==1){
			$("#cmCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#div-cmcustidcard").show();
			$("#div-cmcustidcard-none").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",false,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",true,null);
		}else if(identidiesTypeCd==2){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法军官证");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else if(identidiesTypeCd==3){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法护照");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else{
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法证件号码");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}
	};
	var _queryfeeitems = function (){
		var param = {"attrSpecCode":"ACCT_ITEM_TYPE"} ;
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						//$("#selpayitems").show();
						$("#payitems").hide();
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#selpayitems").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
						}
						$.refresh($("#feiyongitem"));
					}else{
						$("#selpayitems").next().hide();
						$("#payitems").show();
					}
				}else{
					$("#selpayitems").next().hide();
					$("#payitems").show();
				}
			}
		});
	};
	
	var _querybusitype = function(){
		var url=contextPath+"/app/order/querybusitype";
		var response = $.callServiceAsJson(url, {});
		if (response.code == -2) {
			$.alertM(response.data);
		}
		if (response.code == 1002) {
			$.alert("错误","查询业务类型无数据,请配置");
			return;
		}
		if(response.code==0){
			var data = response.data ;
			if(data!=undefined && data.length>0){
				for(var i=0;i<data.length;i++){
					var busiTypedate = data[i];
					$("#busitype").append("<option value='"+busiTypedate.busiTypeCd+"' >"+busiTypedate.busiTypeName+"</option>");
				}
				$("#busitype").addClass("styled-select");
			}
		}
	};
	
	var _busiactiontypeChoose = function(flag,fn){
		if(fn=="ysl"){
			$("#tcmc").html("套餐名称：");
			$("#tcuim").html("UIM卡号：");
			$("#tcuim").removeAttr("style");
			$("#tccphm").html("产品号码：");
			$("#tcname").show();
			$("#tcfflx").show();
			$("#tcbm").show();
			$("#tccpmm").show();
			$("#tccpgg").show();
			$("#tcxh").show();
			$("#tuim").show();
		}
		
		$("#busiactiontype").empty();
		var busitypecd = $(flag).val();
		if(busitypecd==""){
			return;
		}
		var params = {"busitypecd":busitypecd} ;
		var url=contextPath+"/app/order/querybusiactiontype";
		var response = $.callServiceAsJson(url, params);
		if(response.code==0){
			var data = response.data ;
			if(data!=undefined && data.length>0){
				for(var i=0;i<data.length;i++){
					var busiactionTypedate = data[i];
					$("#busiactiontype").append("<option value='"+busiactionTypedate.actionTypeCd+"' >"+busiactionTypedate.name+"</option>");
				}
			}else{
				$("#busiactiontype").append("<option value=''>请选择</option>");
			}
			$.refresh($("#ywdzc"));
			if(fn=="ysl"){
				$("#taocan").show();
				$("#fushu").show();
				$("#zhongduan").show();
				$("#dealerAidDiv").show();
				$("#beizhu").show();
				$("#feiyong").show();
				$("#tijiao").show();
				if(busitypecd=="3"){
					$("#tcmc").html("新套餐名称：");
					$("#tcuim").html("UIM卡号[3转4补换卡]：");
					$("#tcuim").css({'width':'140px','margin-left':'-50px'});
					$("#tccphm").html("原产品号码：");
					$("#tcfflx").hide();
					$("#tccpmm").hide();
//						$("#tccpgg").hide();
					$("#tcxh").hide();
					$("#zhongduan").hide();
				}else if (busitypecd=="4"){
					$("#tcuim").html("UIM卡号[3转4补换卡]：");
					$("#tcuim").css({'width':'140px','margin-left':'-50px'});
					$("#tccphm").html("原产品号码：");
					$("#tcname").hide();
					$("#tcfflx").hide();
					$("#tcbm").hide();
					$("#tccpmm").hide();
//						$("#tccpgg").hide();
					$("#tcxh").hide();
					$("#zhongduan").hide();
				}else if (busitypecd=="2"){
					$("#tcuim").html("新UIM卡号：");
					$("#tccphm").html("原产品号码：");
					$("#tcname").hide();
					$("#tcfflx").hide();
					$("#tcbm").hide();
					$("#tccpmm").hide();
					$("#tccpgg").hide();
					$("#tcxh").hide();
					$("#fushu").hide();
					$("#zhongduan").hide();
					$("#dealerAidDiv").hide();
				}else if (busitypecd=="5" || busitypecd=="6" || busitypecd=="7" || busitypecd=="8"){
					$("#tccphm").html("原产品号码：");
					$("#tcname").hide();
					$("#tcfflx").hide();
					$("#tuim").hide();
					$("#tcbm").hide();
					$("#tccpmm").hide();
					$("#tccpgg").hide();
					$("#tcxh").hide();
					$("#fushu").hide();
					$("#zhongduan").hide();
					$("#dealerAidDiv").hide();
				}
			}
		}
	};
	
	var _genRandPass6Input = function(){
		var pwd=$("#pwd").val();
		if(pwd=="******"){
			pwd = order.main.genRandPass6();
			$("#pwd").val(pwd);
		}
	};
	
	var _searchPack = function(){
		var qryStr = $("#qryStr").val();
		var params={"subPage":"","qryStr":qryStr,"pnLevelId":"","custId":"","PageIndex":1,"PageSize":10,"orderflag":"ysl"};
		order.service.queryData(params);
	};
	
	var _confirmoffer = function(id,name){
		$("#offer_spec_name").val(name);
		$("#offer_spec_cd").val(id);
		easyDialog.close();
		OrderInfo.actionFlag=1;
		OrderInfo.offerSpec.offerSpecId=id;
		OrderInfo.offerSpec.offerSpecName=name;
		var dealertr = $("#dealerTbody").find("tr");
		dealertr.each(function(){
			if($(this).children().eq(0).html()=="主套餐"){
				$(this).remove();
			}
		});
		order.dealer.initDealer();
	};
	
	var _addParam = function(){
		OrderInfo.order.soNbr = UUID.getDataId();
		OrderInfo.cust.custId = '-1';
		var prodSpecId = $("#prodSpecId").val();
		var offerSpecId = $("#offer_spec_cd").val();
//		if(offerSpecId==''){
//			$.alert("提示","请先查询套餐！");
//			return;
//		}
		AttachOffer.searchAttachOfferSpec('-1',offerSpecId,prodSpecId);
	};
	
	var _confirmAttachOffer = function(name,id,prodflag){
		$("#prod_spec_cd").val(id);
		$("#prod_spec_name").val(name);
//		$("#prodtype").val(prodflag);
		for(var i=0;i<document.getElementById("prodtype").options.length;i++){
	        if(document.getElementById("prodtype").options[i].value == prodflag){
	            document.getElementById("prodtype").options[i].selected=true;
	            break;
	        }
	    }
		$.refresh($("#ywlxc2"));
		$("#attach_div_-1").hide();
	};
	
	var _addprod = function(){
		var attid = $("#prod_spec_cd").val();
		var attname = $("#prod_spec_name").val();
		var atttype = $("#prodtype").val();
		var proactiontype = $("#proactiontype").val();
		if(attid=="" || attname==""){
			$.alert("提示","产品编码或名称不能为空！");
			return;
		}
		var addflag = "true";
		var $openkxbdiv = $("#openkxblist").find("a");
		var $opengncpdiv = $("#opengncplist").find("a");
		var $closekxbdiv = $("#closekxblist").find("a");
		var $closegncpdiv = $("#closegncplist").find("a");
		$openkxbdiv.each(function(){
			if($(this).attr("id")==attid){
				addflag = "false";
				$.alert("提示","已添加该产品！");
				return;
			}
		});
		$opengncpdiv.each(function(){
			if($(this).attr("id")==attid){
				addflag = "false";
				$.alert("提示","已添加该产品！");
				return;
			}
		});
		$closekxbdiv.each(function(){
			if($(this).attr("id")==attid){
				addflag = "false";
				$.alert("提示","已添加该产品！");
				return;
			}
		});
		$closegncpdiv.each(function(){
			if($(this).attr("id")==attid){
				addflag = "false";
				$.alert("提示","已添加该产品！");
				return;
			}
		});
		if(addflag == "false"){
			return;
		}
		var htmlStr="<a href=\"javascript:void(0);\"  id="+attid+" class=\"list-group-item\"> <h5 class=\"list-group-item-heading\">"+attname+"<span onclick=\"order.ysl.delprod('"+attid+"','"+attname+"','"+atttype+"','"+proactiontype+"')\" class=\"glyphicon glyphicon-remove pull-right\" aria-hidden=\"true\"></span></h5>";
		$("#myTab").find("li").removeClass("active");
		$("#myTabContent").find("div").removeClass("in");
		$("#myTabContent").find("div").removeClass("active");
		if(proactiontype=="ADD"){//开通
			$("#openfushu").addClass("active");
			if(atttype=="1"){//可选包
				$("#openkxblist").append(htmlStr);
				$("#openkxb").addClass("active");
				$("#openkxb").addClass("in");
			}else{//功能产品
				$("#opengncplist").append(htmlStr);
				$("#opengncp").addClass("active");
				$("#opengncp").addClass("in");
			}
		}else if(proactiontype=="DEL"){//关闭
			$("#closefushu").addClass("active");
			if(atttype=="1"){//可选包
				$("#closekxblist").append(htmlStr);
				$("#closekxb").addClass("active");
				$("#closekxb").addClass("in");
			}else{//功能产品
				$("#closegncplist").append(htmlStr);
				$("#closegncp").addClass("active");
				$("#closegncp").addClass("in");
			}
		}
		var open = {
			id : attid,
			name : attname,
			type:atttype,
			proactiontype:proactiontype
		};
		order.ysl.openList.push(open);
	};
	
	var _delprod = function(id,name,type,actiontype){
		var $button="<span onclick=\"order.ysl.delprod('"+id+"','"+name+"','"+type+"','"+actiontype+"')\" class=\"glyphicon glyphicon-remove pull-right\" aria-hidden=\"true\"></span>";
		var $span = $("#"+id).find("h5"); //定位删除的附属
		if($span.find("del")!=undefined&&$span.find("del")!=null&&$span.find("del").html()!=undefined){  //已经取消订购，再订购
			$span.html($span.find("del").html()+$button);
			var open = {
					id : id,
					name : name,
					type:type,
					proactiontype:actiontype
				};
			order.ysl.openList.push(open);
		}else { //取消订购
			$span.html("<del class=\"text-warning\">"+name+"</del>"+$button);
			for (var i = 0; i < order.ysl.openList.length; i++) {
				if(order.ysl.openList[i].id==id){
					order.ysl.openList.splice(i,1);
				}
			} 
			/*if(type=="1"){
				order.dealer.removeAttDealer("-1_"+id); //删除协销人
			}*/
		}
	};
	
	var _adddealer = function(sign){
		if(sign=="tc"){
			var name = $("#offer_spec_name").val();
			var id = $("#offer_spec_cd").val();
			if(id!="" && name !=""){
				OrderInfo.actionFlag=1;
				OrderInfo.offerSpec.offerSpecId=id;
				OrderInfo.offerSpec.offerSpecName=name;
				/*var dealertr = $("#dealerTbody").find("tr");
				dealertr.each(function(){
					if($(this).children().eq(0).html()=="主套餐"){
						$(this).remove();
					}
				});
				order.dealer.initDealer();*/
			}
		}else if(sign=="kxb"){
			var phoneNumber = $("#choosedNumSpan").val();
			var dealertr = $("#dealerTbody").find("tr");
			dealertr.each(function(){
				if($(this).attr("name").indexOf("tr_-1_")!=-1){
					var subnum = $(this).attr("name").substring(3);
					order.dealer.changeAccNbr(subnum,phoneNumber);
				}
			});
		}
	};
	
	var paytr = 0;
	var _addpayinfo = function(){
		var payitems = "";
		var payitemcd = "";
		var paymoney = $("#paymoney").val();
		if(document.getElementById("payitems").style.display=="none"){
			payitems = $("#selpayitems").find("option:selected").html();
			payitemcd = $("#selpayitems").val();
		}else{
			payitems = $("#payitems").val();
			payitemcd = "";
		}
		if(document.getElementById("payitems").style.display=="block"){
			if(payitems==""){
				$.alert("提示","费用项不能为空！");
				return;
			}
		}
		if(paymoney==""){
			$.alert("提示","金额不能为空！");
			return;
		}else{
			paymoney = parseFloat($("#paymoney").val()).toFixed(2);
		}
		var addflag = "true";
		var paytbody = $("#payTbody").find("tr");
		paytbody.each(function(){
			if($(this).children("td").eq(0).html()==payitems){
				addflag = "false";
				$.alert("提示","已添加该费用项！");
				return;
			}
		});
		if(addflag == "false"){
			return;
		}
		var paytype = $("#paytype").find("option:selected").html();
		var paytypecd = $("#paytype").val();
		paytr++;
		$("#payTbody").append("<tr id='paytr_"+paytr+"'><td acct_item_type_id='"+payitemcd+"'>"+payitems+"</td><td>"+paymoney+"</td><td paytypecd='"+paytypecd+"'>"+paytype+"</td><td><span class=\"glyphicon glyphicon-remove pull-right\" aria-hidden=\"true\" onclick=\"order.ysl.delpay('paytr_"+paytr+"')\"></span></td></tr>");
	};
	
	var _delpay = function(id){
		$("#"+id).remove();
	};
	
	var _suborderysl = function(){
		if($("#cmCustName").val()==""){
			$.alert("提示","客户姓名不能为空！","information");
			return;
		}
		var custIdCard="";
		if($("#identidiesTypeCd").val()==1){
			custIdCard=$("#cmCustIdCard").val();
		}else{
			custIdCard=$("#cmCustIdCardOther").val();
		}
		if(custIdCard==""){
			$.alert("提示","证件号码不能为空！","information");
			return;
		}
		if($("#cmAddressStr").val()==""){
			$.alert("提示","客户地址不能为空！","information");
			return;
		}
		var busitype = $("#busitype").val();
		if(busitype=="1" || busitype=="3"){
			if($("#offer_spec_name").val()==""){
				$.alert("提示","套餐名称不能为空！","information");
				return;
			}
			if($("#offer_spec_cd").val()==""){
				$.alert("提示","套餐编码不能为空！","information");
				return;
			}
		}
		if(busitype=="1" || busitype=="3" || busitype=="2"){
			if($("#uimcode").val()==""){
				$.alert("提示","UIM卡号不能为空！","information");
				return;
			}
		}
		if($("#choosedNumSpan").val()==""){
			$.alert("提示","产品号码不能为空！","information");
			return;
		}
		var pwd = $("#pwd").val();
		var prodSpecId = $("#prodSpecId").val();
		var payment_type_cd = $("#payment_type_cd").val();
		if(busitype=="1"){
			if(pwd==""){
				$.alert("提示","产品密码不能为空！","information");
				return;
			}
//			if($("#terminalcode").val()==""){
//				$.alert("提示","终端串码不能为空！","information");
//				return;
//			}
		}else{
			pwd = "";
			prodSpecId = "";
			payment_type_cd = "";
		}
//		if($("#prod_spec_cd").val()=="" && $("#prod_spec_name").val()!=""){
//			$.alert("提示","可选包/功能编码不能为空！","information");
//			return;
//		}
//		if($("#prod_spec_cd").val()!="" && $("#prod_spec_name").val()==""){
//			$.alert("提示","可选包/功能名称不能为空！","information");
//			return;
//		}
		
		var orderbean = {
				CUST_TYPE_CD:$("#partyTypeCd").val(),
				IDENTIDIES_TYPE_CD:$("#identidiesTypeCd").val(),
				IDENTITY_NUM:custIdCard,
				NAME:$("#cmCustName").val(),
				ADDRESS_STR:$("#cmAddressStr").val(),
				CONTACT_NO:$("#phonenumber").val(),
				BUSI_TYPE_CD:$("#busitype").val(),
				ACTION_TYPE_CD:$("#busiactiontype").val(),
				REMARKS:$("#order_remark").val(),
				PAYMENT_TYPE_CD:payment_type_cd,
				uimcode:$("#uimcode").val(),
				ACCESS_NBR:$("#choosedNumSpan").val(),
				PROD_PWD:pwd,
				PROD_SPEC_ID:prodSpecId,
				terminalcode:$("#terminalcode").val(),
				paytotal:0,
				openofferMap:{},
				dealerMap:{},
				paymentMap:{}
		};
		var prom = {
				id : $("#offer_spec_cd").val(),
				name : $("#offer_spec_name").val(),
				type:"0",
				proactiontype:"ADD"
		};
		order.ysl.openList.push(prom);
		orderbean.openofferMap = order.ysl.openList;
		
		/*var dealername = "true";
		var dealerbean = [];
		var dealertr = $("#dealerTbody").find("tr");
		dealertr.each(function(){
			var debean = {
					STAFF_ID:"",
					STAFF_NBR:"",
					SALE_NBR:"",
					SALE_NAME:"",
					DEVELOP_TYPE:"",
					detype:"",
					dename:""
			}
			debean.STAFF_ID = $(this).children("td").eq(3).children("input").attr("staffid");
			debean.STAFF_NBR = $("#qryStaffCode").val();
			debean.SALE_NBR = $("#qrySalesCode").val();
			debean.SALE_NAME = $(this).children("td").eq(3).children("input").val();
			debean.DEVELOP_TYPE = $(this).children("td").eq(2).children("select").val();
			debean.dename = $(this).children("td").eq(1).html().replace(/（包含接入产品）/,"");
			if(debean.SALE_NAME==""){
				dealername = "false";
				return;
			}
			if($(this).attr("name").indexOf("tr_-1_")!=-1){
				debean.detype = "1";
			}else{
				debean.detype = "0";
			}
			dealerbean.push(debean);
		});
		if(dealername=="false"){
			$.alert("提示","发展人不能为空！","information");
			return;
		}
		orderbean.dealerMap = dealerbean;*/
		
		
		var paytbody = $("#payTbody").find("tr");
		paytbody.each(function(){
			var paybean={
					ACCT_ITEM_TYPE_ID:"",
					ACCT_ITEM_TYPE:"",
					PAY_METHOD_CD:"",
					PAY_METHOD_TYPE:"",
					ACCT_ITEM_FEE:""
			};
			paybean.ACCT_ITEM_TYPE_ID = $(this).children("td").eq(0).attr("acct_item_type_id");
			paybean.ACCT_ITEM_TYPE = $(this).children("td").eq(0).html();
			paybean.ACCT_ITEM_FEE = $(this).children().eq(1).html();
			paybean.PAY_METHOD_CD = $(this).children("td").eq(2).attr("paytypecd");
			paybean.PAY_METHOD_TYPE = $(this).children("td").eq(2).html();
			orderbean.paytotal += parseInt(paybean.ACCT_ITEM_FEE);
			order.ysl.paymentbean.push(paybean);
		});
		orderbean.paymentMap = order.ysl.paymentbean;
		
		var url=contextPath+"/app/order/suborderysl";
		var response = $.callServiceAsJson(url, orderbean);
		if (response.code == -2) {
			$.alertM(response.data);
		}
		if (response.code == 1002) {
			$.alertM(response.data);
//			$.alert("错误","预受理订单提交失败","information");
			return;
		}
		if(response.code==0){
			order.ysl.CUST_SO_NUMBER = response.data.CUST_SO_NUMBER;
			order.ysl.CUST_ORDER_ID = response.data.CUST_ORDER_ID;
			order.ysl.INVOICE_ID = response.data.INVOICE_ID;
			$("#buyid").html("购物车流水号："+response.data.CUST_SO_NUMBER);
			$("#buynum").html("产品号码：："+$("#choosedNumSpan").val());
			$("#yslpage").hide();
//			$("#finishpage").show();   //打印发票，打印回执功能未开发 暂时屏蔽
			$("#tijiao").hide();
			order.ysl.realmoney=orderbean.paytotal*1;
			if (order.ysl.realmoney > 0) {
//				$("#printfp").show();
				$("#printfp").removeClass("btna_g");
				$("#printfp").addClass("btna_o");
				$("#printfp").attr("onclick","order.ysl.invoiceprint()");
			}
		}
	};
	
	var _invoiceprint = function(){
			if (CONST.getAppDesc() == 0) {
				var tempUrl = contextPath+"/print/getInvoiceTemplates";
				var tempParam = {
					'areaId' : OrderInfo.staff.areaId
				};
				var tempResp = $.callServiceAsJson(tempUrl, tempParam, {});
				if (tempResp.code == -2) {
					$.alertM(tempResp.data);
					return;
				} else if (tempResp.code != 0) {
					$.alert("提示",ec.util.defaultStr(tempResp.data, "获取打印模板出错"));
					return;
				} else {
					var tempData = tempResp.data;
					if (tempData.resultCode != 'POR-0000') {
						$.alert("提示",ec.util.defaultStr(tempData.resultMsg, "获取打印模板异常"));
						return;
					}
					if (tempData.length == 0) {
						$.alert("提示", "没有获取到可用的打印模板");
						return;
					}
					var tempHtml = "";
					var tempList = tempData.tempList;
					if (typeof tempList != undefined && tempList.length > 0) {
						tempHtml += "<option selected='selected' value="+tempList[0].templateId+">"+tempList[0].templateName+"</option>";
						for(var i = 1; i < tempList.length; i++){
							var template = tempList[i];
							tempHtml += "<option value="+template.templateId+">"+template.templateName+"</option>";
						}
					}
					$("#tempListSel").html(tempHtml);
				}
			} else {
				$("#tempListSel").parent().parent().hide();
			}
			
			
			//显示接入号
			var selHtml = "";
			var acceNbr = $("#choosedNumSpan").val();
//			var prodInfo = qccResp.data.prodInfo;
//			if (prodInfo != undefined && prodInfo.length > 0) {
//				selHtml+="<option selected='selected' value="+prodInfo[0].accessNumber+">"+prodInfo[0].accessNumber+"</option>";
//				for(var i=1;i<prodInfo.length;i++){
//					var prod = prodInfo[i];
					selHtml+="<option value="+acceNbr+">"+acceNbr+"</option>";
//				}
//				$("#acceNbrSel").data("prodInfo", prodInfo);
//			}
			$("#acceNbrSel").html(selHtml);
			
			
			//显示费用项
			var contHtml = "";
			contHtml+="<div id='invoiceContDiv' class='plan_second_list cashier_tr'>";
			contHtml+="  <table class='contract_list'>";
			contHtml+="  <thead>";
			contHtml+="    <tr>";
			contHtml+="      <td>是否打印</td><td>费用名称</td><td>费用(元)</td><td>付费方式</td>";
			contHtml+="    </tr>";
			contHtml+="  </thead>";
			contHtml+="  <tbody>";
//			var chargeItems = qccResp.data.chargeItems;
			for(var i=0;i<order.ysl.paymentbean.length;i++){
				var item = order.ysl.paymentbean[i];
				if (i == 0) {
					$("#invoiceTitleInp").val($("#cCustName").val());
				}
				contHtml+="<tr realAmount="+item.ACCT_ITEM_FEE+" payMethodName="+item.PAY_METHOD_CD+" acctItemTypeName="+item.ACCT_ITEM_TYPE+">";
//				if (_checkChargeItem(item)) {
					contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' checked='checked'/></td>";
//				} else {
//					contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' disabled='disabled'/></td>";
//				}
				contHtml+="      <td>"+item.ACCT_ITEM_TYPE+"</td>";
				contHtml+="      <td>"+item.ACCT_ITEM_FEE+"</td>";
				contHtml+="      <td>"+item.PAY_METHOD_TYPE+"</td>";
				contHtml+="    </tr>";
			}
			contHtml+="  </tbody>";
			contHtml+="  </table>";
			contHtml+="</div>";
			$("#invoiceItemsContDiv").html(contHtml);
			$("#ec-dialog-form-content").css("height", "auto");
			$("input[name=billType]").off("click").on("click",function(event){
				if ($("input[name=billType]:checked").val()=="0") {
					$("#invoiceNbrNumDl").show();
					$("#titleDt").html("发票抬头：");
					$("#tempDt").html("发票模板：");
//					param.billType = 0;
				} else {
					$("#invoiceNbrNumDl").hide();
					$("#titleDt").html("票据抬头：");
					$("#tempDt").html("票据模板：");
//					param.billType = 1;
				}
			});
			$("#billTypeVo").hide();
			$("#invoiceItemsConfirm").off("click").on("click",function(event){
//				if (common.print.oldInvoiceFlag != '0') {
//					$.alert("信息", "存在未作废发票，请先确定作废发票");
//					return;
//				}
				_saveInvoiceInfo();
			});
			
			ec.form.dialog.createDialog({
				"id":"-invoice-items",
				"width":580,
//				"height":450,
				"zIndex":1100,
				"initCallBack":function(dialogForm,dialog){
					common.print.dialogForm=dialogForm;
					common.print.dialog=dialog;
					$("#invoiceItemsConCancel").off("click").on("click",function(event){
						common.print.closePrintDialog();
					});
				},
				"submitCallBack":function(dialogForm,dialog){
				
				},
				"closeCallBack":function(dialogForm,dialog){
				
				}
			});
		};
		
		var _saveInvoiceInfo=function(){
			var invoiceInfos = [];
			var invoiceInfo = {
				"acctItemIds": [],
				"instanceType": 2,//根据过滤取值，优先为产品或销售品，2-产品，7-销售品
				"instanceId": 0,//根据过滤取值，优先为产品或销售品
				"invoiceType": "58B", //58A:电子发票；58B:纸币发票
				"staffId": OrderInfo.staff.staffId,
				"amount": 0,
				"realPay": 0,
				"tax": 0,//可为空，暂为0
				"invoiceNbr": 0,//发票代码，前台人工输入，票据时可为空
				"invoiceNum": "0",//发票号码，前台人工输入，票据时可为空
				"custOrderId": order.ysl.CUST_ORDER_ID,
				"custSoNumber": order.ysl.CUST_SO_NUMBER,
				"custId": "",
				"commonRegionId": OrderInfo.staff.areaId,
				"channelId": OrderInfo.staff.channelId,
				"bssOrgId": OrderInfo.staff.orgId,
				"acctNbr": 0,//接入号码，根据5.12接口返回展示，前台选择
				"paymethod": 100000,
				"busiName": "具体业务说明",//可为空
				"rmbUpper": "人民币大写",//固定此值
				"accountUpper": "零圆整",
				"account": 0,
				"billType": 0,//票据类型：0发票，1收据
				"printFlag": -1,//打印标记：0正常打印，1重打票据，2补打票据，-1未打印
				"invoiceId": order.ysl.INVOICE_ID,
				"boActionTypeName":$("#busitype option:selected").text()
			};
			//设置invoiceId
//			invoiceInfo.invoiceId = queryResult.invoiceInfos[0].invoiceId;
			//设置票据类型
			invoiceInfo.billType = $("input[name='billType']:checked").val();
			
//			var instanceFlag = false;
//			var sumFeeAmount = 0;
			var sumRealAmount = 0;
//			var sumTax = 0;
			var items = [];
			var payMethodName = "";
			//获取费用项和接入号的关系
//			var rela = _getAcceNbrBoIdRela(queryResult);
//			invoiceInfo.acctItemIds = [];
			$("#invoiceContDiv tbody input:checked").parent().parent().each(function(){
				//设置账单项ID
//				invoiceInfo.acctItemIds.push({"acctItemId": $(this).attr("acctItemId")});
				//设置实例id和类型，优先为产品或销售品，2-产品，7-销售品
//				if ($(this).attr("objType") == "2") {
//					invoiceInfo.instanceType = $(this).attr("objType");
//					invoiceInfo.instanceId = $(this).attr("objId");
//					invoiceInfo.paymethod = $(this).attr("payMethodCd");
//					instanceFlag = true;
//				} else if (!instanceFlag && $(this).attr("objType") == "7") {
//					invoiceInfo.instanceType = $(this).attr("objType");
//					invoiceInfo.instanceId = $(this).attr("objId");
//					invoiceInfo.paymethod = $(this).attr("payMethodCd");
//				}
				//计算金额
//				sumFeeAmount += parseInt($(this).attr("realAmount"));
				sumRealAmount += parseInt($(this).attr("realAmount"));
//				sumTax += parseInt($(this).attr("tax"));
//				var accessNumber = '';
//				var boId = $(this).attr("boId");
//				for (var i=0; i < rela.length; i++) {
//					if (boId == rela[i].boId) {
//						accessNumber = rela[i].accessNumber;
//					}
//				}
				
				items.push({
					"itemName" : $(this).attr("acctItemTypeName"),
					"charge" : parseInt($(this).attr("realAmount"))*100,
					"tax" : 0,
					"acceNumber" : $("#acceNbrSel option:selected").val()
				});
				payMethodName = $(this).attr("payMethodName");
			});
//			if(OrderInfo.actionFlag==11){
//				invoiceInfo.printFlag = 0;
//			}
			
			//设置金额
			invoiceInfo.amount = sumRealAmount;
			invoiceInfo.realPay = sumRealAmount;
//			invoiceInfo.tax = sumTax;
			invoiceInfo.account = sumRealAmount*100;
			invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount*100);
			//取实例ID和类型
			invoiceInfo.invoiceNbr = $("#invoiceNbrInp").val();
			invoiceInfo.invoiceNum = "" + $("#invoiceNumInp").val();
			//取接入号
			invoiceInfo.acctNbr = $("#acceNbrSel option:selected").val();
			invoiceInfo.busiName = $("#busitype option:selected").text();
			invoiceInfos.push(invoiceInfo);
			
			var invoiceParam = {
				"partyName" : $("#invoiceTitleInp").val(),
				"templateId" : $("#tempListSel :selected").val(),
				"prodInfo" : [],
				"items" : items,
				"payMethod" : $("#paytype option:selected").text(),
				"invoiceInfos" : invoiceInfos,
				"printflag":"true"
			};
			_printInvoice(invoiceParam);
			var url=contextPath+"/order/suborderysl";
			var response = $.callServiceAsJson(url, invoiceParam);
			//最终关闭窗口
			common.print.closePrintDialog();
			return;
		};
		
		var _printInvoice=function(invoiceParam){
			$("#invoiceForm").remove();
			if(_getCookie('_session_pad_flag')=='1'){
				var arr=new Array(3);
				if(ec.util.browser.versions.android){
					arr[0]='print/invoice';
				}else{
					arr[0]='print/iosInvoice';
				}
				arr[1]='invoiceParam';
				arr[2]=encodeURI(JSON.stringify(invoiceParam));
				MyPlugin.printShow(arr,
	                function(result) {
	                },
	                function(error) {
	                }
				);
			}else{
			    $("<form>", {
			    	id: "invoiceForm",
			    	style: "display:none;",
			    	target: "_blank",
			    	method: "POST",
			    	action: contextPath + "/print/invoice"
			    }).append($("<input>", {
			    	id : "invoiceParam",
			    	name : "invoiceParam",
			    	type: "hidden",
			    	value: encodeURI(JSON.stringify(invoiceParam))
			    })).appendTo("body").submit();
			}
//			$("#printfp").html("<a class=\"btna_g\"><span>打印发票</span></a>");
			$("#printfp").removeClass("btna_go");
			$("#printfp").addClass("btna_g");
			$("#printfp").attr("onclick","");
		};
		
		var _printVoucher = function(){
			var result = {
					"custInfo":{},
					"orderEvent":[],
					"feeInfos":{},
					"remarkInfos":[],
					"advInfos":[],
					"terminalInfos":[],
					"agreements":{},
					"orderListInfo":{},
					"chargeItems":[]
			};
			//客户信息
			var custInfoMap = {"norCustInfo":[]};
			var norCustInfo = [];
			if($("#identidiesTypeCd").val()==1){
				custIdCard=$("#cmCustIdCard").val();
			}else{
				custIdCard=$("#cmCustIdCardOther").val();
			}
			custInfoMap.norCustInfo.push({"itemName":"客户名称","itemValue":$("#cmCustName").val()});
			custInfoMap.norCustInfo.push({"itemName":"联系电话","itemValue":$("#phonenumber").val()});
			custInfoMap.norCustInfo.push({"itemName":"证件类型","itemValue":$("#identidiesTypeCd option:selected").text()});
			custInfoMap.norCustInfo.push({"itemName":"证件号码","itemValue":custIdCard});
			custInfoMap.norCustInfo.push({"itemName":"通信地址","itemValue":$("#cmAddressStr").val()});
			custInfoMap.norCustInfo.push({"itemName":"邮政编码","itemValue":"无"});
			custInfoMap.norCustInfo.push({"itemName":"电子邮箱","itemValue":"无"});
//			custInfoMap.norCustInfoMap = norCustInfo;
			result.custInfo = custInfoMap;
			//业务数据
//			if($("#busitype").val()=="1" || $("#busitype").val()=="3"){
				var orderEvent1 = {
						"orderEventType":"1",
						"orderEventTitle":{},
						"orderEventCont":{}
				};
				var orderEventTitleparem = {
						"attachOfferSpecName":"",
						"boActionTypeCd":$("#busiactiontype").val(),
						"boActionTypeName":$("#busiactiontype option:selected").text(),
						"effectRule":"立即生效",
						"prodSpecName":$("#offer_spec_name").val(),
						"summary":$("#offer_spec_name").val()
				};
				orderEvent1.orderEventTitle = orderEventTitleparem;
				var orderEventContparem = {
						"osAttachInfos":{},
						"osBaseInfo":[],
						"osOtherInfo":[],
						"osOutInfos":[],
						"userAcceNbrs":[]
				};
				var userAcceNbrsparem={
						"acceNbr":$("#choosedNumSpan").val(),
						"acceType":$("#prodSpecId option:selected").text(),
						"donateItems":[],
						"isAloneLine":"Y",
						"isBarCode":"Y",
						"itemParam":{},
						"memberRoleCd":"",
						"memberRoleName":"一般构成成员",
						"objId":$("#prodSpecId").val(),
						"offerProdAttr":[],
						"roleCd":"",
						"roleName":"一般构成成员",
						"userType":"新开户"
				};
				orderEventContparem.userAcceNbrs.push(userAcceNbrsparem);
				orderEvent1.orderEventCont = orderEventContparem;
				result.orderEvent.push(orderEvent1);
//			}
			
			if($("#busitype").val()=="1" || $("#busitype").val()=="3" || $("#busitype").val()=="4"){
				if(order.ysl.openList.length > 0){
					var orderEvent3 = {
							"orderEventType":"3",
							"orderEventTitle":{},
							"orderEventCont":[]
					};
					var orderEventTitleparem = {
							"boActionTypeCd":"7",
							"boActionTypeName":"变更",
							"prodSpecName":$("#prodSpecId option:selected").text()
					};
					for(var i=0;i<order.ysl.openList.length;i++){
						if(order.ysl.openList[i].type!="0"){
							var orderEventContparem3 = {
									"actionName":"",
									"effectRule":"立即生效",
									"isAloneLine":"Y",
									"itemName":"",
									"itemParam":"",
									"objId":"",
									"relaAcceNbr":$("#choosedNumSpan").val()
							};
							var actionName = "";
							if(order.ysl.openList[i].proactiontype=="ADD"){
								actionName="开通";
							}else if(order.ysl.openList[i].proactiontype=="DEL"){
								actionName="关闭";
							}
							orderEventContparem3.actionName=actionName;
							orderEventContparem3.itemName=order.ysl.openList[i].name;
							orderEventContparem3.objId=order.ysl.openList[i].id;
							orderEvent3.orderEventCont.push(orderEventContparem3);
							orderEvent3.orderEventTitle = orderEventTitleparem;
						}
					}
					result.orderEvent.push(orderEvent3);
				}
			}
			//费用信息
			if(order.ysl.paymentbean.length>0){
				var chargeItems = {"chargeItems":[]};
				var feeInfos = {"acctFeeInfos":[]};
				for (var j=0;j<order.ysl.paymentbean.length;j++){
					var chargeItemsparem = {
							"accNbr":$("#choosedNumSpan").val(),
							"acctItemId":"",
							"acctItemTypeId":order.ysl.paymentbean[j].ACCT_ITEM_TYPE_ID,
							"acctItemTypeName":order.ysl.paymentbean[j].ACCT_ITEM_TYPE,
							"amount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"areaId":OrderInfo.staff.areaId,
							"billId":"",
							"billingCycleId":"",
							"boActionTypeCd":"",
							"boActionTypeName":$("#busitype option:selected").text(),
							"boId":"",
							"createDate":"",
							"custId":"",
							"custName":$("#cCustName").val(),
							"invoiceNum":"",
							"modifyReasonCd":"",
							"objectName":"",
							"offerId":"",
							"offerInstId":"",
							"olId":"",
							"payMethodName":order.ysl.paymentbean[j].PAY_METHOD_TYPE,
							"payedState":"N",
							"paymentAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"paymentId":"",
							"paymentSeriaNbr":"-1",
							"perferCash":"",
							"perferReason":"",
							"prodInstId":"",
							"prodSpecId":$("#prodSpecId").val(),
							"readDate":"",
							"realAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"statusCd":"记录有效",
							"statusDate":""
					};
					chargeItems.chargeItems.push(chargeItemsparem);
					
					var chargeItemsparem1 = {
							"realAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"feeAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"paymentAmount":parseInt(order.ysl.paymentbean[j].ACCT_ITEM_FEE)*100,
							"acctItemTypeId":order.ysl.paymentbean[j].ACCT_ITEM_TYPE_ID,
							"objId":$("#prodSpecId").val(),
							"objType":"",
							"acctItemId":"",
							"boId":"",
							"prodId":"",
							"objInstId":"",
							"payMethodCd":order.ysl.paymentbean[j].PAY_METHOD_CD,
							"posSeriaNbr":"-1",
							"chargeModifyReasonCd":"1",
							"remark":"",
							"boActionType":""
					};
					result.chargeItems.push(chargeItemsparem1);
				}
				feeInfos.acctFeeInfos.push(chargeItems);
				result.feeInfos = feeInfos;
			}
			//UIM
			if($("#uimcode").val()!=""){
				var terminalInfosparem = {
						"isAloneLine":"Y",
						"tiName":"UIM卡",
						"tiParam":"个",
						"tiRemark":"UIM卡:"+$("#uimcode").val()
				};
				result.terminalInfos.push(terminalInfosparem);
			}
			//终端信息
			if($("#terminalcode").val()!=""){
				var terminalInfosparem = {
						"isAloneLine":"Y",
						"tiName":"终端",
						"tiParam":"个",
						"tiRemark":"终端串码:"+$("#terminalcode").val()
				};
				result.terminalInfos.push(terminalInfosparem);
			}
			//温馨提示
//			result.advInfos.push("为保障对您的及时服务提醒，您会收到以10021号码发送的U.友服务信息。");
//			result.advInfos.push("您可以登录网上营业厅www.uyou.com 或关注官方微信“U.友”，轻松享受网上自助服务。");
			//备注
			if($("#order_remark").val()!=""){
				result.remarkInfos.push($("#order_remark").val());
			}
			
			var voucherInfo = {
					"olId":order.ysl.CUST_ORDER_ID,
					"soNbr":order.ysl.CUST_SO_NUMBER,
					"busiType":"1",
					"chargeItems":"",
					"result":result
				};
			common.print.printVoucher(voucherInfo);
		};
	
		var _getCookie = function(name){
			var cookievalue = "";
			var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
			if(arr != null) {
				cookievalue = unescape(arr[2]);
			}
			return cookievalue;
		};
		
	var _custcreateButton = function() {
	    $('#custCreateForm').off().bind('formIsValid',function(event) {
//		_checkIdentity();
	     }).ketchup({bindElement:"createcustsussbtn"});
    };
    
    var _chooseArea = function(){
		order.area.chooseAreaTreeManger("report/cartMain","p_areaId_val","p_areaId",3);
	};
    
    var _queryyslinfos = function(pageIndex,scroller){
    	var _beginDate = $("#p_startDt").val();
		var _endDate = $("#p_endDt").val();
		if(_beginDate==""||_endDate==""){
			$.alert("提示","请先选择时间段再进行查询");
			return;
		}
		if(_beginDate.replace(/-/g,'')>_endDate.replace(/-/g,'')){
			$.alert("提示","开始时间不能晚于结束时间");
			return;
		}
    	var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
    	var param = {
    			"startDt":$("#p_startDt").val()+" 00:00:00",
				"endDt":$("#p_endDt").val()+" 23:59:59",
				"olNbr":$("#olNbr").val(),
				"busitype":$("#ywlxc").val(),
				"accnum":$("#accnum").val(),
				"custname":$("#custname").val(),
				"CustIdCard":$("#CustIdCard").val(),
				"nowPage":curPage,
				"pageSize":10
    	}
    	var areaId = "" ;
		if($("#p_channelId").val()&&$("#p_channelId").val()!=""){
//			areaId = $("#p_channelId").find("option:selected").attr("areaid");
			areaId = $("#p_channelId").attr("areaid");
//			if(areaId==null||areaId==""||areaId==undefined){
//				$.alert("提示","渠道地区为空，无法查询！");
//				return ;
//			}
			param["channelId"] = $("#p_channelId").val() ;
		}else{
			areaId = $("#p_areaId").val();
			if(areaId==null||areaId==""||areaId==undefined){
				$.alert("提示","请选择 '地区' 再查询");
				return ;
			}
			param["channelId"] = "" ;
		}
		param["areaId"] = areaId;
		
		$.callServiceAsHtmlGet(contextPath+"/app/order/queryyslList",param,{
			"before":function(){
				$.ecOverlay("购物车查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#ysl_search").hide();
					$("#ysl_list").html(response.data).show();
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
    }
    
    var _upOrderInfo = function(sonum,num){
    	var Param = {
				"cust_so_number" : sonum,
				"status_cd" : num,
				"queryflag":"true"
			};
			var url=contextPath+"/order/suborderysl";
			var response = $.callServiceAsJson(url, Param);
			_queryyslinfos(1);
    }
    
    var _queryYslDetail = function(cust_so_number,status_cd){
    	var param = {
    			"cust_so_number":cust_so_number,
    			"status_cd":status_cd,
    			"detail":"true"
    		};
		$.callServiceAsJson(contextPath+"/app/order/queryYslDetail",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#ysl_list").hide();
					$("#geren").hide();
					$("#feiyongcontainer").hide();
					$("#d_yslInfo").show();
					$("#tcmc").html("套餐名称：");
					$("#tcuim").html("UIM卡号：");
					$("#tcuim").removeAttr("style");
					$("#tccphm").html("产品号码：");
					$("#tcname").show();
					$("#tcfflx").show();
					$("#tcbm").show();
					$("#tccpmm").show();
					$("#tccpgg").show();
					$("#tcxh").show();
					$("#tuim").show();
					$("#taocan").show();
					$("#fushu").show();
					$("#zhongduan").show();
					$("#dealerAidDiv").show();
					$("#beizhu").show();
					$("#feiyong").show();
					order.ysl.certTypeByPartyType();
					var data = response.data ;
					var CUST_ITEM = data.CUST_ITEM;
					var CUST_ORDER = data.CUST_ORDER;
					var taocan = data.taocan;
					var PRODUCT_ITEM = data.PRODUCT_ITEM;
					var COUPON_ITEM = data.COUPON_ITEM;
					var ORDER_FEE = data.ORDER_FEE;
					var closelist = data.closelist;
					var openlist = data.openlist;
					var BUSI_STAFF_RELA = data.BUSI_STAFF_RELA;
					if(ec.util.isArray(CUST_ITEM)){
						for(var i=0;i<document.getElementById("partyTypeCd").options.length;i++){
					        if(document.getElementById("partyTypeCd").options[i].value == CUST_ITEM[0].CUST_TYPE_CD){
					            document.getElementById("partyTypeCd").options[i].selected=true;
					            break;
					        }
					    }
						for(var i=0;i<document.getElementById("identidiesTypeCd").options.length;i++){
					        if(document.getElementById("identidiesTypeCd").options[i].value == CUST_ITEM[0].IDENTIDIES_TYPE_CD){
					            document.getElementById("identidiesTypeCd").options[i].selected=true;
					            break;
					        }
					    }
						$("#cmCustName").val(CUST_ITEM[0].NAME);
						$("#cmCustIdCard").val(CUST_ITEM[0].IDENTITY_NUM);
						$("#phonenumber").val(CUST_ITEM[0].CONTACT_NO);
						$("#cmAddressStr").val(CUST_ITEM[0].ADDRESS_STR);
					}
					$("#busitype").empty();
					$("#busitype").append("<option value='"+CUST_ORDER[0].BUSI_TYPE_CD+"' >"+CUST_ORDER[0].BUSI_TYPE_NAME+"</option>");
					order.ysl.busiactiontypeChoose("#busitype",'detail');
//					$("#busiactiontype").empty();
//					$("#busiactiontype").append("<option value='"+CUST_ORDER[0].ACTION_TYPE_CD+"' >"+CUST_ORDER[0].NAME+"</option>");
					$("#order_remark").val(CUST_ORDER[0].REMARKS);
					$("#payTbody").empty();
					var paytr1 = 0;
					for(var i=0;i<ORDER_FEE.length;i++){
						$("#payTbody").append("<tr id=paytr_"+paytr1+"><td acct_item_type_id=\""+ORDER_FEE[i].ACCT_ITEM_TYPE_ID+"\">"+ORDER_FEE[i].ACCT_ITEM_TYPE+"</td><td>"+parseFloat(ORDER_FEE[i].ACCT_ITEM_FEE).toFixed(2)+"</td><td paytypecd="+ORDER_FEE[i].PAY_METHOD_CD+">"+ORDER_FEE[i].NAME+"</td><td></td></tr>");
						paytr1++;
					}
					var busitypecd = CUST_ORDER[0].BUSI_TYPE_CD;
//					if(busitypecd=="1"){
						$("#offer_spec_name").val(taocan[0].OFFER_SPEC_NAME);
						for(var i=0;i<document.getElementById("payment_type_cd").options.length;i++){
					        if(document.getElementById("payment_type_cd").options[i].value == PRODUCT_ITEM[0].PAYMENT_TYPE_CD){
					            document.getElementById("payment_type_cd").options[i].selected=true;
					            break;
					        }
					    }
						$("#offer_spec_cd").val(taocan[0].OFFER_SPEC_CD);
						$("#choosedNumSpan").val(PRODUCT_ITEM[0].ACCESS_NBR);
						for(var i=0;i<COUPON_ITEM.length;i++){
					        if(COUPON_ITEM[i].COUPON_TYPE_CD=="1"){
					        	$("#uimcode").val(COUPON_ITEM[i].COUPON_INST_NBR);
					        }else if(COUPON_ITEM[i].COUPON_TYPE_CD=="2"){
					        	$("#terminalcode").val(COUPON_ITEM[i].COUPON_INST_NBR);
					        }
					    }
						$("#pwd").val(PRODUCT_ITEM[0].PROD_PWD);
						for(var i=0;i<document.getElementById("prodSpecId").options.length;i++){
					        if(document.getElementById("prodSpecId").options[i].value == PRODUCT_ITEM[0].PROD_SPEC_ID){
					            document.getElementById("prodSpecId").options[i].selected=true;
					            break;
					        }
					    }
						$("#openprodhtml").empty();
						for(var i=0;i<openlist.length;i++){
							if(openlist[i].OFFER_TYPE_CD != undefined){
								$("#openprodhtml").append("<li id="+openlist[i].OFFER_SPEC_CD+"><dd class=\"delete\" onclick=\"order.ysl.delprod('"+openlist[i].OFFER_SPEC_CD+"','"+openlist[i].OFFER_SPEC_NAME+"','1','ADD')\"></dd><span>"+openlist[i].OFFER_SPEC_NAME+"</span></li>");
							}else{
								$("#openprodhtml").append("<li id="+openlist[i].PROD_SPEC_CD+"><dd class=\"delete\" onclick=\"order.ysl.delprod('"+openlist[i].PROD_SPEC_CD+"','"+openlist[i].PROD_SPEC_NAME+"','2','ADD')\"></dd><span>"+openlist[i].PROD_SPEC_NAME+"</span></li>");
							}
						}
						$("#closeprodhtml").empty();
						for(var i=0;i<closelist.length;i++){
							if(closelist[i].OFFER_TYPE_CD != undefined){
								$("#closeprodhtml").append("<li id="+closelist[i].OFFER_SPEC_CD+"><dd class=\"delete\" onclick=\"order.ysl.delprod('"+closelist[i].OFFER_SPEC_CD+"','"+closelist[i].OFFER_SPEC_NAME+"','1','DEL')\"></dd><span>"+closelist[i].OFFER_SPEC_NAME+"</span></li>");
							}else{
								$("#closeprodhtml").append("<li id="+closelist[i].PROD_SPEC_CD+"><dd class=\"delete\" onclick=\"order.ysl.delprod('"+closelist[i].PROD_SPEC_CD+"','"+closelist[i].PROD_SPEC_NAME+"','2','DEL')\"></dd><span>"+closelist[i].PROD_SPEC_NAME+"</span></li>");
							}
						}
						$("#adddealer").hide();
						$("#dealerTbody").empty();
						var kxrela="true";
						for(var i=0;i<BUSI_STAFF_RELA.length;i++){
							var objInstId = BUSI_STAFF_RELA[i].OFFER_SPEC_CD;
							var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
							var DEVELOP_NAME = "";
							if(BUSI_STAFF_RELA[i].DEVELOP_TYPE=="40020005"){
								DEVELOP_NAME="第一发展人";
							}else if(BUSI_STAFF_RELA[i].DEVELOP_TYPE=="40020006"){
								DEVELOP_NAME="第二发展人";
							}else if(BUSI_STAFF_RELA[i].DEVELOP_TYPE=="40020007"){
								DEVELOP_NAME="第三发展人";
							}
							if(i==0 && BUSI_STAFF_RELA[i].OFFER_TYPE_CD=="0"){
								$("#dealerTbody").append("<tr name='tr_"+objInstId+"' id='tr_"+objInstId+"'>" +
														 "<td>主套餐</td>" +
														 "<td>"+BUSI_STAFF_RELA[i].OFFER_SPEC_NAME+"（包含接入产品）</td>" +
														 '<td><select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)" disabled="disabled">'+
//														 		"<option value=\"40020005\">第一发展人</option>" +
//														 		"<option value=\"40020006\">第二发展人</option>" +
														 		"<option value=\""+BUSI_STAFF_RELA[i].DEVELOP_TYPE+"\">"+DEVELOP_NAME+"</option></select><label class=\"f_red\">*</label></td>" +
														 		'<td><input type="text" id="dealer_'+objId+'" staffId="'+BUSI_STAFF_RELA[i].STAFF_ID+'" value="'+BUSI_STAFF_RELA[i].SALE_NAME+'" class="inputWidth183px" readonly="readonly"></input>'+
//														 		'<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>' +
//														 		'<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>'+
														 		'</td>'+
														"</tr>");
							}else if(BUSI_STAFF_RELA[i].OFFER_TYPE_CD=="0" && i !=0){
								$("#dealerTbody").append("<tr name='tr_"+objInstId+"'>" +
														 "<td>主套餐</td>" +
														 "<td>"+BUSI_STAFF_RELA[i].OFFER_SPEC_NAME+"（包含接入产品）</td>" +
														 '<td><select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)" disabled="disabled">'+
//														 		"<option value=\"40020005\">第一发展人</option>" +
//														 		"<option value=\"40020006\">第二发展人</option>" +
														 		"<option value=\""+BUSI_STAFF_RELA[i].DEVELOP_TYPE+"\">"+DEVELOP_NAME+"</option></select><label class=\"f_red\">*</label></td>" +
														 		'<td><input type="text" id="dealer_'+objId+'" staffId="'+BUSI_STAFF_RELA[i].STAFF_ID+'" value="'+BUSI_STAFF_RELA[i].SALE_NAME+'" class="inputWidth183px" readonly="readonly"></input>'+
//														 		'<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>' +
//														 		'<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>'+
														 		'</td>'+
														"</tr>");
							}else if(BUSI_STAFF_RELA[i].OFFER_TYPE_CD=="1" && kxrela=="true"){
								$("#dealerTbody").append("<tr name='tr_-1_"+objInstId+"'>" +
														 "<td>"+PRODUCT_ITEM[0].ACCESS_NBR+"</td>" +
														 "<td>"+BUSI_STAFF_RELA[i].OFFER_SPEC_NAME+"</td>" +
														 '<td><select id="dealerType_-1_'+objId+'" name="dealerType_-1_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_-1_'+objInstId+'\',a)" disabled="disabled">'+
//														 		"<option value=\"40020005\">第一发展人</option>" +
//														 		"<option value=\"40020006\">第二发展人</option>" +
														 		"<option value=\""+BUSI_STAFF_RELA[i].DEVELOP_TYPE+"\">"+DEVELOP_NAME+"</option></select><label class=\"f_red\">*</label></td>" +
														 		'<td><input type="text" id="dealer_-1_'+objId+'" name="dealer_-1_'+objInstId+'" staffId="'+BUSI_STAFF_RELA[i].STAFF_ID+'" value="'+BUSI_STAFF_RELA[i].SALE_NAME+'" class="inputWidth183px"  readonly="readonly"></input>'+
//														 		'<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\'-1_'+objId+'\');">选择</a>' +
//														 		'<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>'+
//														 		'<a class="purchase" onclick="order.dealer.addProdDealer(this,\'-1'+objInstId+'\')">添加</a><label class="f_red">*</label>'+
														 		'</td>'+
														"</tr>");
								kxrela="false";
							}else if(BUSI_STAFF_RELA[i].OFFER_TYPE_CD=="1" && kxrela=="false"){
								$("#dealerTbody").append("<tr name='tr_-1_"+objInstId+"'>" +
										 "<td>"+PRODUCT_ITEM[0].ACCESS_NBR+"</td>" +
										 "<td>"+BUSI_STAFF_RELA[i].OFFER_SPEC_NAME+"</td>" +
										 '<td><select id="dealerType_-1_'+objId+'" name="dealerType_-1_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_-1_'+objInstId+'\',a)" disabled="disabled">'+
//										 		"<option value=\"40020005\">第一发展人</option>" +
//										 		"<option value=\"40020006\">第二发展人</option>" +
										 		"<option value=\""+BUSI_STAFF_RELA[i].DEVELOP_TYPE+"\">"+DEVELOP_NAME+"</option></select><label class=\"f_red\">*</label></td>" +
										 		'<td><input type="text" id="dealer_-1_'+objId+'" name="dealer_-1_'+objInstId+'" staffId="'+BUSI_STAFF_RELA[i].STAFF_ID+'" value="'+BUSI_STAFF_RELA[i].SALE_NAME+'" class="inputWidth183px" readonly="readonly"></input>'+
//										 		'<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\'-1_'+objId+'\');">选择</a>' +
//										 		'<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>'+
										 		'</td>'+
										"</tr>");
							}
//							for(var j=0;j<document.getElementById("dealerType_"+objId).options.length;j++){
//						        if(document.getElementById("dealerType_"+objId).options[j].value == BUSI_STAFF_RELA[i].DEVELOP_TYPE){
//						            document.getElementById("dealerType_"+objId).options[j].selected=true;
//						            break;
//						        }
//						    }
//							for(var j=0;j<document.getElementById("dealerType_-1_"+objId).options.length;j++){
//						        if(document.getElementById("dealerType_-1_"+objId).options[j].value == BUSI_STAFF_RELA[i].DEVELOP_TYPE){
//						            document.getElementById("dealerType_-1_"+objId).options[j].selected=true;
//						            break;
//						        }
//						    }
							OrderInfo.SEQ.dealerSeq++;
						}
//					}
					if(busitypecd=="3"){
						$("#tcmc").html("新套餐名称：");
						$("#tcuim").html("UIM卡号[3转4补换卡]：");
						$("#tcuim").css({'width':'140px','margin-left':'-50px'});
						$("#tccphm").html("原产品号码：");
						$("#tcfflx").hide();
						$("#tccpmm").hide();
						$("#tccpgg").hide();
						$("#tcxh").hide();
						$("#zhongduan").hide();
					}else if (busitypecd=="4"){
						$("#tcuim").html("UIM卡号[3转4补换卡]：");
						$("#tcuim").css({'width':'140px','margin-left':'-50px'});
						$("#tccphm").html("原产品号码：");
						$("#tcname").hide();
						$("#tcfflx").hide();
						$("#tcbm").hide();
						$("#tccpmm").hide();
						$("#tccpgg").hide();
						$("#tcxh").hide();
						$("#zhongduan").hide();
					}else if (busitypecd=="2"){
						$("#tcuim").html("新UIM卡号：");
						$("#tccphm").html("原产品号码：");
						$("#tcname").hide();
						$("#tcfflx").hide();
						$("#tcbm").hide();
						$("#tccpmm").hide();
						$("#tccpgg").hide();
						$("#tcxh").hide();
						$("#fushu").hide();
						$("#zhongduan").hide();
						$("#dealerAidDiv").hide();
					}else if (busitypecd=="5" || busitypecd=="6" || busitypecd=="7" || busitypecd=="8"){
						$("#tccphm").html("原产品号码：");
						$("#tcname").hide();
						$("#tcfflx").hide();
						$("#tuim").hide();
						$("#tcbm").hide();
						$("#tccpmm").hide();
						$("#tccpgg").hide();
						$("#tcxh").hide();
						$("#fushu").hide();
						$("#zhongduan").hide();
						$("#dealerAidDiv").hide();
					}
					
					$("#d_query").hide();
					$("#d_yslInfo").show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
    }
    
    var _showMain = function(){
		$("#d_yslInfo").hide();
		$("#d_query").show();
	};
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_queryyslinfos(scrollObj.scroll);
		}
	};
	
	//弹出套餐选择页面
	var _showPack = function (){
		var url=contextPath+"/app/order/yslPack";
		var param={};
		$.callServiceAsHtml(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='选套餐页面加载异常,稍后重试';
				}
				if(response.code != 0) {
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				$("#order").hide();
				//$("#order_prepare").hide();
				var content$=$("#packContent");
				content$.html(response.data).show();
			}
		});	
	};
	
	//初始化套餐选择页面
	var _initPack = function (){
		OrderInfo.order.step=1;
		OrderInfo.busitypeflag=2;
		OrderInfo.actionFlag = 2;
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询
		order.ysl.yslSearchPack();
	};
	
	//主套餐查询
	var _yslSearchPack = function(flag,scroller,subPage){
		var custId = OrderInfo.cust.custId;
		var qryStr=$("#qryStr").val();
//		var params={"qryStr":qryStr,"pnLevelId":"","custId":custId};
		var params={"subPage":flag,"qryStr":qryStr,"pnLevelId":"","custId":custId,"PageSize":10};
		if(flag){
			
			var priceVal = $("#select_price").val();
			if(ec.util.isObj(priceVal)){
				var priceArr = priceVal.split("-");
				if(priceArr[0]!=null&&priceArr[0]!=""){
					params.priceMin = priceArr[0] ;
				}
				if(priceArr[1]!=null&&priceArr[1]!=""){
					params.priceMax = priceArr[1] ;
				}
			}
			var influxVal = $("#select_invoice").val();
			if(ec.util.isObj(influxVal)){
				var influxArr = influxVal.split("-");
				if(influxArr[0]!=null&&influxArr[0]!=""){
					params.INFLUXMin = influxArr[0]*1024 ;
				}
				if(influxArr[1]!=null&&influxArr[1]!=""){
					params.INFLUXMax = influxArr[1]*1024 ;
				}
			}
			var invoiceVal = $("#select_influx").val();
			if(ec.util.isObj(invoiceVal)){
				var invoiceArr = invoiceVal.split("-");
				if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
					params.INVOICEMin = invoiceArr[0] ;
				}
				if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
					params.INVOICEMax = invoiceArr[1] ;
				}
			}
		}
		_yslQueryData(params,flag,scroller);
		
	};
	
	var _yslQueryData = function(params,flag,scroller) {
		if(OrderInfo.actionFlag==2){
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if(offerSpecId!=undefined){
				params.changeGradeProdOfferId = offerSpecId;
			}
			var prodSpecIds='';
			$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
				if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					if(this.objId!=undefined){
						prodSpecIds=prodSpecIds+","+this.objId;
					}
				}
			});
			if(prodSpecIds!=''){
				prodSpecIds=prodSpecIds.substring(1, prodSpecIds.length);
				params.prodSpecId=prodSpecIds;
			}
			params.actionFlag=2;
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		var url = contextPath+"/app/order/yslOfferSpecList";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
				$("#search-modal").modal('hide');
			},
			"done" : function(response){
				$("#search-modal").modal('hide');
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				var content$ = $("#offer-list");
				content$.html(response.data);
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
//				$.refresh(content$);
			},
			fail:function(response){
				$.unecOverlay();
				$("#search-modal").modal('hide');
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	//预受理套餐滚动页面入口
	var _yslScroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			if(scrollObj.page==1){
				_yslSearchPack(1,scrollObj.scroll);
			}else{
				var show_per_page = 10;
				var start_from = (scrollObj.page-2) * show_per_page;
				var end_on = start_from + show_per_page;
				//$('#ul_offer_list').append($('#div_all_data').children().slice(start_from, end_on)).listview("refresh");
				$('#div_all_data').children().slice(start_from, end_on).appendTo($('#div_offer_list'));
//				$('#ul_offer_list').listview("refresh");
//				$("#ul_offer_list li").off("tap").on("tap",function(){
//					$(this).addClass("pakeagelistlibg").siblings().removeClass("pakeagelistlibg");
//				});
				if(scrollObj.scroll && $.isFunction(scrollObj.scroll)) scrollObj.scroll.apply(this,[]);
			}
		}
	};
	
	var _yslSelectPack = function(packName,packCd){
		$("#offer_spec_name").val(packName);
		$("#offer_spec_cd").val(packCd);
		$("#packContent").hide();
		$("#order").show();
	};
	return {
		yslSelectPack:_yslSelectPack,
		yslSearchPack:_yslSearchPack,
		yslQueryData:_yslQueryData,
		yslScroll:_yslScroll,
		showPack:_showPack,
		initPack:_initPack,
		yslbean:_yslbean,
		openList:_openList,
		realmoney:_realmoney,
		CUST_ORDER_ID: _CUST_ORDER_ID,
		CUST_SO_NUMBER: _CUST_SO_NUMBER,
		INVOICE_ID: _INVOICE_ID,
		paymentbean:_paymentbean,
		certTypeByPartyType :_certTypeByPartyType,
		custcreateButton :_custcreateButton,
		querybusitype:_querybusitype,
		busiactiontypeChoose:_busiactiontypeChoose,
		genRandPass6Input:_genRandPass6Input,
		searchPack:_searchPack,
		confirmoffer:_confirmoffer,
		addParam:_addParam,
		confirmAttachOffer:_confirmAttachOffer,
		addprod:_addprod,
		delprod:_delprod,
		adddealer:_adddealer,
		addpayinfo:_addpayinfo,
		delpay:_delpay,
		suborderysl:_suborderysl,
		invoiceprint:_invoiceprint,
		saveInvoiceInfo:_saveInvoiceInfo,
		printInvoice:_printInvoice,
		printVoucher:_printVoucher,
		queryyslinfos:_queryyslinfos,
		chooseArea:_chooseArea,
		upOrderInfo:_upOrderInfo,
		queryYslDetail:_queryYslDetail,
		showMain:_showMain,
		queryfeeitems:_queryfeeitems,
		identidiesTypeCdChoose:_identidiesTypeCdChoose,
		scroll : _scroll
	};
})();

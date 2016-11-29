/**
 * 销账（欠费查询）
 */
CommonUtils.regNamespace("mktRes", "owingCharge");

mktRes.owingCharge = (function(){
	var _init = function(){
		$("#oc_qry_bt").off("click").on("click",function(){_queryOwingCharge();});
		
		$("input[name=invoiceOffer]").click(function(){
			_showInvoiceMsg();
		});
		
		$("#phoneNumber").focus(function(){
			if(this.value=="请输入接入号"){
				this.value="";
			}
		}); 
		$("#phoneNumber").blur(function(){
			if($.trim(this.value)==""){
				this.value="请输入接入号";
			}
		}); 
	};
	var currentPhoneNumber=null;//当前查询结果的phoneNumber。防止用户查询完后修改输入框中的号码引起的错误
	
	var _showInvoiceMsg = function(){
		switch($("input[name=invoiceOffer]:checked").attr("value")){
		  case "1":
		    $("#tr1").css("display","none");
		    $("#tr2").css("display","none");
		    $("#tr3").css("display","none");
		    $("#tr4").css("display","none");
		   break;
		  case "0":
			  $("#tr1").css("display","");
			  $("#tr2").css("display","");
			  $("#tr3").css("display","");
			  $("#tr4").css("display","");
		   break;
		  default:
		   break;
		 }
	};
	var _queryOwingCharge = function(num){
		
		var phoneNumber=$.trim($("#phoneNumber").val());		
		if(CONST.APP_DESC==0){
			if(!CONST.LTE_PHONE_HEAD.test(phoneNumber)){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}else{
			if(!CONST.MVNO_PHONE_HEAD.test(phoneNumber)){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}
		
	    var phoneNumber=$.trim($("#phoneNumber").val());
//		if(!/^\d{11}$/.test(phoneNumber)){
//			$.alert("提示","请正确填写号码后再查询");
//			return;
//		}
		currentPhoneNumber=phoneNumber;
		var destinationAttr=$("#destinationAttr").val();
		var param ={
				"destinationAttr":destinationAttr,
				"phoneNumber":phoneNumber
			};
		var url = contextPath+"/mktRes/getOweCharge";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("欠费信息查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>没有数据返回</strong></div>';
				}
				if(response.data=="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data=="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				var content$=$("#owing_details");
				content$.show().addClass("pageright").removeClass("in out").addClass("out");
				setTimeout(function(){
					//$("#foregiftcontent").hide();
					content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
					setTimeout(function(){
						content$.removeClass("pop in out");
					},500);
				},500);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _changeTab=function(obj){
		var num=0;
		$(obj).parent().children("li").each(function(i,o){
			$(o).removeClass("setcon");
			if(obj==o){
				num=i;
			}
		});
		$(obj).addClass("setcon");
		$(".acct_tab").each(function(idx,otab){
			if(num==idx){
				$(otab).show();
			}else{
				$(otab).hide();
			}
		});
		
	};
	var _payCharge=function(){
		if(currentPhoneNumber==null){
			$.alert("提示","请先查询（并选择）要交费的计费周期！");
			return ;
		}
		var owing_charge_div="";
		var billingCycleId="";
		$(".owing_box:checked").each(function(){//第一次遍历，取选中的要付费的计费周期。
			billingCycleId=this.value;
		});
		//查询可打印费用项成功，接下去查询模板组
		var tempUrl = contextPath+"/print/getInvoiceTemplates";
		var tempParam = {
			'areaId' : OrderInfo.staff.areaId,
			'busiType' : "102"
		};
		var tempResp = $.callServiceAsJson(tempUrl, tempParam, {});
		if (tempResp.code == -2) {
			$.alertM(tempResp.data);
			//return;
		} else if (tempResp.code != 0) {
			$.alert("提示",ec.util.defaultStr(tempResp.data, "获取打印模板出错"));
			//return;
		} else {
			var tempData = tempResp.data;
			if (tempData.resultCode != 'POR-0000') {
				$.alert("提示",ec.util.defaultStr(tempqccRespMsg, "获取打印模板异常"));
				//return;
			}
			if (tempData.length == 0) {
				$.alert("提示", "没有获取到可用的打印模板");
				//return;
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
		var paymentAmount=0;
	
		if(billingCycleId.length<=0){//如果没有选择计费周期，那么就是全额缴费
			billingCycleId="0";
			paymentAmount=$("#shouldCharge").val();
			if(paymentAmount<=0){
				$.alert("提示","应收金额为0，不需要缴费！");
				return;
			}
			owing_charge_div="应缴金额："+(paymentAmount/100)+"元";
			owing_charge_div+="<br/>缴费金额：<input id='paymentAmount'  class='inputWidth150px' value='"+(paymentAmount/100)+"'/>元";
		}else{
			$(".owing_box").each(function(){//注：为了防止checkbox不是按顺序排列，引起费用总额错误，将owing_box遍历两遍！！！
				if(this.value==billingCycleId){
					paymentAmount+=parseInt($(this).attr("acctItemCharge"));
				}
			});
			if(paymentAmount<=0){
				$.alert("提示","该账期应收金额为0，不需要缴费！");
				return;
			}
			paymentAmount+=parseInt($("#due").val());//加上滞纳金
			paymentAmount+=parseInt($("#derateDue").val());//加上滞纳金减免，负数
			owing_charge_div="应缴金额："+(paymentAmount/100)+"元";
			owing_charge_div+="<br/>缴费周期："+billingCycleId;
			owing_charge_div+="<br/>缴费金额：<input id='paymentAmount'  class='inputWidth150px' value='"+(paymentAmount/100)+"'/>元";
		}
		$("#owing_charge_div_content").html(owing_charge_div);
		
		ec.form.dialog.createDialog({
			"id":"-owing_charge_div",
			"initCallBack":function(dialogForm,dialog){
				$("#owing_charge_bt").click(function(){
					if($.trim($("#paymentAmount").val())==""){
		    			$.Zebra_Dialog("请添加缴费金额！", {
		    				'open_speed':0,
		    				'keyboard':false,
		                	'modal':true,
		                	'overlay_close':false,
		                	'overlay_opacity':.5,
		                    'type': 'warning',
		                    'title':    "信息",
		                    'buttons':  ['确定']
		    			});
		    			return false;
		    		}else{
		    			var invoiceOffer="";
		    			$(".invoiceOffer:checked").each(function(){
		    				invoiceOffer=this.value;
		    			});
		    			if(invoiceOffer=="0"){
		    				if (_chkInput()) {
		    					return;
		    				}
		    			}
		    			doCharge(billingCycleId);
		    			dialogForm.close(dialog);
		    		}
				});
			},
			"submitCallBack":function(dialogForm,dialog){
			},
			width:400,height:320
		});
	};
	var doCharge=function(billingCycleId){
		
		var invoiceOffer="";
		$(".invoiceOffer:checked").each(function(){
			invoiceOffer=this.value;
		});
		
		var param={
				phoneNumber:currentPhoneNumber,
				billingCycleId:billingCycleId,
				paymentAmount:$("#paymentAmount").val()*100,//单位是“分”
				paymentMethod:$("#paymentMethod").val(),
				invoiceOffer:invoiceOffer
		};
		$.callServiceAsJson(contextPath+"/mktRes/writeOffCash",param,{
			"before":function(){
				$.ecOverlay("正在缴费，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					if(invoiceOffer=="0"){
						_printParam(response.data);
					}else{
						$.alert("提示","销账成功！"); 
					}
					_queryOwingCharge();
				}else{
					$.alert("提示",response.data);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//可打印费用项查询
	var _queryComputeCharge=function(param) {
		$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
		var url=contextPath+"/bill/getInvoiceItems";
		var response = $.callServiceAsJson(url,param,{});
		$.unecOverlay();
		
		if(!response){
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return false;
		}
		if(response.code == -2) {
			$.alertM(response.data);
			return false;
		}
		if(response.code != 0) {
			$.alert("提示", response.data);
			return false;
		}
//		if(response.data.resultCode != '0') {
//			$.alert("提示", response.data.resultMsg);
//			return false;
//		}
		//判断是否有可打印费用项
		if (response.data.billingCycleGroup == undefined || response.data.billingCycleGroup.length==0) {
			$.alert("提示", "没有可打印的费用项");
			return false;
		}
		//判断是否有可打印费用项
//		if (response.data.count > 1 ) {
//			$.alert("提示", "发票已经打印");
//			return false;
//		}
		return response.data;
	};
	var _printParam=function(data){
		
		if(data&&data.result){
			
			var param={
					"paymentSerialNbr":data.result.paymentSerialNbr,
					"accNbr" : currentPhoneNumber,
					"receiptClass" : "0",
					"printFlag" : "0"
			};
			
			//可打印费用项查询
			var qccResp = _queryComputeCharge(param);
			if (!qccResp) {
     			return;
			}
			
			
//			$(qccResp.invioceInformationDetail).each(function(){
//				$(this.feeBillingCycle).each(function(){
//					var billingCycleId = this.billingCycleId;
//					$(this.invioceItemDetail).each(function(){
//						sumRealAmount += parseInt(this.invioceItemMoney);
//						items[count]={"billingCycleId": billingCycleId,"itemName":encodeURI(this.invioceItemName),"charge":this.invioceItemMoney};
//						count++;
//					});
//				});
//			});
		}else{
			$.alert("提示","销账成功！系统没有返回打印项！");
			return;
		}
		
		if ($("#tempListSel").val() == "") {
			$.alert("提示","销账成功！ 发票打印失败！ 原因 为 未获取到发票模版");
			return;
		}
		
		
		var invoiceInfos = [];
		var invoiceInfo = {
			    "itemsGroups": [],
				"invoiceType": "100", //目前阶段我们用到的是：100 普通发票和 200 收据。待后续有营改增需求后再 用其它类型。
				"billSerialNbr" : "",
				"acctId" : "",
				"acctName" : "",
				"acctNbr" : "",
				"paymentSerialNbr" : "",
				"previousChange" : "",
				"currentChange" : "",
				"balance" : "",
				"paymentAmount" : "",
				"shouldCharge" : "",
				"staffId": OrderInfo.staff.staffId,
				"invoiceNbr": 0,//发票代码，前台人工输入，票据时可为空
				"invoiceNum": "0",//发票号码，前台人工输入，票据时可为空
				"custOrderId": OrderInfo.orderResult.olId,
				"custSoNumber": OrderInfo.orderResult.olNbr,
				"custId": OrderInfo.cust.custId,
				"commonRegionId": OrderInfo.staff.areaId,
				"channelId": OrderInfo.staff.channelId,
				"bssOrgId": OrderInfo.staff.orgId,
				"acctNbr": 0,//接入号码，根据5.12接口返回展示，前台选择
				"rmbUpper": "人民币大写",//固定此值
				"accountUpper": "零圆整",
				"account": 0,
				"billType": 0,//票据类型：0发票，1收据
				"printFlag": 0//打印标记：0正常打印，1重打票据，2补打票据，-1未打印
		};
		
		var sumRealAmount = 0;
		var items=[];
		//var count=0;
		//$(data.result.invioceInformationDetail).each(function(){
			$(qccResp.billingCycleGroup).each(function(){
				var billingCycleId = this.billingCycleId;
				$(this.invioceItemDetail).each(function(){
				//	items[count]={"itemName":encodeURI(this.invioceItemName),"charge":this.invioceItemMoney};
				//	count++;
					sumRealAmount += parseInt(this.invoiceItemMoney);
		  			items.push({
		  				"billingCycleId" : billingCycleId,
		  				"itemName" : this.invoiceItemName,
		  				"charge" : this.invoiceItemMoney
		  			});
				});
				//invoiceInfo.itemsGroups.push({"billingCycleID": this.billingCycleId,"items" : items});
			});
			
		invoiceInfo.billSerialNbr = qccResp.billSerialNbr;
		//invoiceInfo.acctId = queryResult.acctId;
		//invoiceInfo.acctName = queryResult.acctName;
	//	invoiceInfo.acctNbr = queryResult.acctNbr;
		invoiceInfo.paymentSerialNbr = qccResp.paymentSerialNbr;
		invoiceInfo.previousChange = qccResp.previousChange;
		invoiceInfo.currentChange = qccResp.currentChange;
		
		
		//设置金额
		invoiceInfo.account = sumRealAmount;
		invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
		
		//取接入号
		invoiceInfo.acctNbr = currentPhoneNumber;
		
		invoiceInfo.invoiceNbr = $("#invoiceNbrInp").val();
		invoiceInfo.invoiceNum = "" + $("#invoiceNumInp").val();
		
		invoiceInfos.push(invoiceInfo);
		var invoiceParam = {
			"partyName" : $("#invoiceTitleInp").val(),
			"items" : items,
			"busiType" :  '102',
			"payMethod" : $("#paymentMethod").val(),
			"templateId" : $("#tempListSel :selected").val(),
			"invoiceInfos" : invoiceInfos
		};
//		var tempUrl = contextPath+"/print/getInvoiceTemplates";
//		var tempParam = {
//			"areaId" : OrderInfo.staff.areaId,
//			'busiType' : "102"
//		};
//		var tempResp = $.callServiceAsJson(tempUrl, tempParam, {});
//		if(tempResp.code==1){
//			$.alert("提示",tempResp.data);
//			return;
//		}
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
	};
	//校验发票抬头，发票代码，发票号码等
	var _chkInput=function(){
		try {
			    if ($("#invoiceNbrInp").val() == "") {
					$.alert("提示","请输入发票代码");
					return true;
				}
				//原17位发票代码，现12位
				if (!/^\d{0,12}$/.test($("#invoiceNbrInp").val())) {
					$.alert("提示","请输入正确的发票代码");
					return true;
				}
				if ($("#invoiceNumInp").val() == "") {
					$.alert("提示","请输入发票号码");
					return true;
				}
				//8位发票号码
				if (!/^\d{0,12}$/.test($("#invoiceNumInp").val())) {
					$.alert("提示","请输入正确的发票号码");
					return true;
				}
				if ($("#invoiceTitleInp").val() == "") {
					$.alert("提示","请输入发票抬头");
					return true;
				}
				
		} catch (e) {
			return true;
		}
		return false;
	};
	return {
		init:_init,
		changeTab:_changeTab,
		payCharge:_payCharge
	};
	
})();

//初始化
$(function(){
	mktRes.owingCharge.init();
});
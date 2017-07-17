/**
 * 打印方法-销账发票
 * 
 * @author wd
 */
CommonUtils.regNamespace("bill", "writeOffPrint");

bill.writeOffPrint = (function($){
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
	/**
	 * 填写打印发票信息
	 */
	var _prepareInvoiceInfo=function(paymentSerialNbr,accNbr,receiptClass,printFlag){
		
		var param={
				"paymentSerialNbr":paymentSerialNbr,
				"accNbr" : $("#t_phoneNumber").val(),
				"receiptClass" : receiptClass,
				"printFlag" : printFlag
		};
		//可打印费用项查询
		var qccResp = _queryComputeCharge(param);
		if (!qccResp) {
			return;
		}
		//查询可打印费用项成功，接下去查询模板组
			var tempUrl = contextPath+"/print/getInvoiceTemplates";
			var tempParam = {
				'areaId' : OrderInfo.staff.areaId,
				'busiType' :  $("#busiType").val()
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
		
		
		//显示接入号
		var selHtml = "<option value="+accNbr+">"+accNbr+"</option>";
		$("#acceNbrSel").html(selHtml);
		
		
		//显示费用项
//		var contHtml = "";
//		contHtml+="<div id='invoiceContDiv' class='plan_second_list cashier_tr'>";
//		contHtml+="  <table class='contract_list'>";
//		contHtml+="  <thead>";
//		
//		
//	//	var itemGroups = qccResp.data.itemGroups;
//		for(var j=0;j<1;j++){ // itemGroups.length
//			//var itemGroup = itemGroups[j];
//			
//			contHtml+="    <tr>";
//			contHtml+="      <td> "+ j +"</td>";
//			contHtml+="    </tr>";
//			
//			contHtml+="    <tr>";
//			contHtml+="      <td><input type='checkbox' name='invoiceGroupChkBox' id = 'invoiceGroupChkBox' value = '222'/></td><td>费用名称</td><td>费用(元)</td>";
//			contHtml+="    </tr>";
//			contHtml+="  </thead>";
//			contHtml+="  <tbody>";
//			
//          for(var i=0;i<1;i++){//itemGroups.chargeItems.length
//				//var item = chargeItems[i];
//				if (i == 0) {
//					//$("#invoiceTitleInp").val(item.acctName);
//					$("#invoiceTitleInp").val("AA");
//				}
//			//	contHtml+="    <tr billingCycleID="+ itemGroup.billingCycleID + "billItemName="+item.billItemName+" invioceItemMoney="+item.invioceItemMoney+" >";
//				
//				contHtml+="    <tr billingCycleID="+ 1 + "billItemName="+2+" invioceItemMoney="+3+" >";
//				
//				//if (_checkChargeItem(item)) {
//				contHtml+="      <td><input type='checkbox' name='cc' id='cc' value = '222' checked='checked'/></td>";
//				//} else {
//				//	contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' disabled='disabled'/></td>";
//				//}
//				//contHtml+="      <td>"+item.billItemName+"</td>";
//				//contHtml+="      <td>"+(item.invioceItemMoney / 100).toFixed(2)+"</td>";
//				contHtml+="      <td>"+1+"</td>";
//			    contHtml+="      <td>"+2+"</td>";
//				contHtml+="    </tr>";
//			}
//		}
//		contHtml+="  </tbody>";
//		contHtml+="  </table>";
//		contHtml+="</div>";
//		$("#invoiceItemsContDiv").html(contHtml);
		$("#ec-dialog-form-content").css("height", "auto");
		
		
		$("#billTypeVo").css("display", "none");
		$("#lb_billTypeVo").css("display", "none");
		
		$("input[name=billType]").off("click").on("click",function(event){
			if ($("input[name=billType]:checked").val()=="0") {
				$("#invoiceNbrNumDl").show();
				$("#titleDt").html("发票抬头：");
				$("#tempDt").html("发票模板：");
				param.billType = 0;
			} else {
				$("#invoiceNbrNumDl").hide();
				$("#titleDt").html("票据抬头：");
				$("#tempDt").html("票据模板：");
				param.billType = 1;
			}
		});
		$("#invoiceItemsConfirm").off("click").on("click",function(event){
			_printInvoiceInfo(param, {}); //qccResp.data
		});
		
		ec.form.dialog.createDialog({
			"id":"-invoice-items",
			"width":580,
//			"height":450,
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
		$("#invoiceGroupChkBox").click(function(){
			  if($(this).attr("checked") == 'checked'){ //check all
				$("input[@id='cc']:checkbox").each(function(){
				   $(this).attr("checked",'checked');
			    });
			   }else{
				   $("input[@id='cc']:checkbox").each(function(){
					   $(this).attr("checked",false);
				    });
			   }
		});
	};
	

	var _addParam=function(param, queryResult) {
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
		//设置票据类型
		invoiceInfo.billType = $("input[name='billType']:checked").val();
		//设置发票类型
		if (invoiceInfo.billType == '0') {
			invoiceInfo.invoiceType = '100';
		} else {
			invoiceInfo.invoiceType = '200';
		}
		var sumRealAmount = 0;
		
	//	if(queryResult.invioceInformationDetail){
			  var items=[];
			//var count=0;
			//$(data.result.invioceInformationDetail).each(function(){
				$(queryResult.billingCycleGroup).each(function(){
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
					invoiceInfo.itemsGroups.push({"billingCycleID": this.billingCycleId,"items" : items});
				});
				
			//});
	//	}
//		var itemGroups = qccResp.data.itemGroups;
//		var items = [];
//		for(var j=0;j<itemGroups.length;j++){ 
//			 var chargeItems = itemGroups.chargeItems;
//		     for(var i=0;i<chargeItems.length;i++){
//			    var chargeitem = chargeItems[i];
//		        sumRealAmount += chargeitem.invioceItemMoney;
//	  			items.push({
//	  				"itemName" : chargeitem.billItemName,
//	  				"charge" : chargeitem.invioceItemMoney
//	  			});
//	  		 }
//		     invoiceInfo.itemsGroups.push({"billingCycleID": ,"items" : items});
//		}
		
		invoiceInfo.billSerialNbr = queryResult.billSerialNbr;
		invoiceInfo.acctId = queryResult.acctId;
		invoiceInfo.acctName = queryResult.acctName;
		invoiceInfo.acctNbr = queryResult.acctNbr;
		invoiceInfo.paymentSerialNbr = queryResult.paymentSerialNbr;
		invoiceInfo.previousChange = queryResult.previousChange;
		invoiceInfo.currentChange = queryResult.currentChange;
		
		
		invoiceInfo.account = sumRealAmount;
		invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
		
		invoiceInfo.invoiceNbr = $("#invoiceNbrInp").val();
		invoiceInfo.invoiceNum = "" + $("#invoiceNumInp").val();
		
//		var sumRealAmount = 0;
//		var items = [];
//		//获取费用项和接入号的关系
//		//invoiceInfo.acctItemIds = [];
//		$("#invoiceContDiv tbody input:checked").parent().parent().each(function(){
//			sumRealAmount += parseInt($(this).attr("invioceItemMoney"));
//			items.push({
//				"itemName" : $(this).attr("acctItemTypeName"),
//				"charge" : parseInt($(this).attr("invioceItemMoney"))
//			});
//			invoiceInfo.itemsGroups.push({"billingCycleID": "","items" : items});
//		});
//		if(OrderInfo.actionFlag==11){
//			invoiceInfo.printFlag = 0;
//		}
		
		//设置金额
		invoiceInfo.account = sumRealAmount;
		invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
		
		//取接入号
		invoiceInfo.acctNbr = $("#acceNbrSel option:selected").val();
		
		invoiceInfos.push(invoiceInfo);
		var result = {
			"items" : items,
			"invoiceInfos" : invoiceInfos
		};
		return result;
	};
	
	var _printInvoiceInfo =function(param){ //queryResult
//		
//		if (common.print.chkInput(param)) {
//			return;
//		}
		
		var qccResp = _queryComputeCharge(param);
//		if (!qccResp) {
//			return;
//		}
		
//		if (!queryResult.invoiceInfos[0]) {
//			$.alert("提示","计费缺少发票信息，请确认。");
//			return;
//		}
		
		var result = _addParam(param,qccResp);
		var invoiceInfos = result.invoiceInfos;
		
		
		//调用受理后台结束，开始调用生成PDF
		var invoiceParam = {
			"partyName" : $("#invoiceTitleInp").val(),
			"templateId" : $("#tempListSel :selected").val(),
			"items" : result.items,
			"invoiceInfos" : invoiceInfos,
			'busiType' :  $("#busiType").val()
		};
		common.print.printInvoice(invoiceParam);
		//最终关闭窗口
		common.print.closePrintDialog();
		return;
		
	};

	return {
		prepareInvoiceInfo:_prepareInvoiceInfo,
		queryComputeCharge:_queryComputeCharge
	};
})(jQuery);

//初始化
$(function(){
	
});
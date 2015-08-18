/**
 * 月结发票打印
 * 
 * @author tangchen
 */
CommonUtils.regNamespace("print", "invoiceprintbymonth");

print.invoiceprintbymonth = (function(){
	var _printInvoice = function() {
		var accNbr =$.trim($("#phoneNumber").val());
		var billingCycleIdYear =$.trim($("#billingCycleIdYear").val());
		var phoneNumber=$.trim($("#phoneNumber").val());		
		if(CONST.APP_DESC==0){
			if(!CONST.LTE_PHONE_HEAD.test(accNbr)){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}else{
			if(!CONST.MVNO_PHONE_HEAD.test(accNbr)){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}
		if(billingCycleIdYear==""||billingCycleIdYear<2000){
			$.alert("提示","请输入正确年份！例如：2014");
			return ;
		}
		if(billingCycleIdYear>new Date().getFullYear().toString()){
			$.alert("提示","打印月结发票的账期不能超过当期年份。");
			return ;
		}
		var billingCycleIdMonth = $("#billingCycleIdMonth option:selected").val();
		var billingCycleId = billingCycleIdYear+billingCycleIdMonth+"01";
		var param={
				"accNbr" : accNbr,
				"receiptClass" : "0",
				"printFlag" : "0",	//0：普通发票   1：营改增凭证
				"billingCycleId" : billingCycleId,
				"query_Flag": "1"  //0：按帐户1：按用户  仅对预付费号码有效。当票据类型为1，仅提供按帐户打印
		};
		var qccResp = _queryComputeCharge(param);
		if (!qccResp&&!qccResp.invoice_Print_Count) {
//			$.alert("提示","!qccResp&&!qccResp.invoice_Print_Count = true!");
			return ;
		}
		if(qccResp.invoice_Print_Count!=1){	
			var Print_Count = qccResp.invoice_Print_Count-1;
			new $.Zebra_Dialog("该费用已打印过"+Print_Count+"次发票，是否确认重打!", {
        		'open_speed':0,
        		'keyboard':true,
        		'modal':true,
        		'overlay_close':false,
        		'overlay_opacity':.5,
        		'type':     false,
        		'title':    "提示",
        		"show_close_button" : true,
        		'buttons':  [   
        					      '确认',
        					      '返回'
        					],
        		'onClose':  function(caption) {
        			if(caption=="确认"){
        				_prepareInvoiceInfo(param);
        			}             
        			else 
        				return;
    			}
        	});    
//			ec.form.dialog.createDialog({
//				"id":"-invoiceReverse",
//				"initCallBack":function(dialogForm,dialog){						
//					$("#invoiceReverse_bt").off("click").on("click",function(event){
//					    if ($("#oldInvoiceNbrInp").val() == "") {
//							$.alert("提示","请输入发票代码");
//							return true;
//						}
//						//原17位发票代码，现12位
//						if (!/^\d{0,12}$/.test($("#oldInvoiceNbrInp").val())) {
//							$.alert("提示","请输入正确的发票代码");
//							return true;
//						}
//						if ($("#oldInvoiceNumInp").val() == "") {
//							$.alert("提示","请输入发票号码");
//							return true;
//						}
//						//8位发票号码
//						if (!/^\d{0,12}$/.test($("#oldInvoiceNumInp").val())) {
//							$.alert("提示","请输入正确的发票号码");
//							return true;
//						}  		
//					var oldInvoiceNbrInp = $("#oldInvoiceNbrInp").val();
//					var oldInvoiceNumInp = $("#oldInvoiceNumInp").val();
//					var InvoiceReverseParam_Vat_Item_Detail = {
//							"Vat_Item_Code" : oldInvoiceNbrInp,//发票代码
//							"Vat_Item_Number" : oldInvoiceNumInp//发票号码
//					};		
//					var invoiceReverseParam = {  //新票据回收通知入参
//							"AccNbr" : accNbr,
//							"Oper_Date" : "",
//							"Receipt_Class" : "0",//发票类型
//							"Vat_Item_Detail" :InvoiceReverseParam_Vat_Item_Detail
//					};
//					$.callServiceAsJson(contextPath+"/print/invoiceReverse",invoiceReverseParam,{
//		            "before":function(){
//		                $.ecOverlay("发票回收通知中，请稍等...");
//		            },
//		            "always":function(){
//		                $.unecOverlay();
//		            },
//		            "done" : function(response){
//		                if(response.code==0){
//		                    $.alert("提示","发票回收通知完成！开始重新打印！");
//		                    _prepareInvoiceInfo(param);
//		                    return;
//		                }else{
//		                    $.alert("提示","发票回收通知通知失败！"+response.data);
//		                    return;
//		                }
//		            },
//		            fail:function(response){
//		                $.unecOverlay();
//		                $.alert("提示","发票打印成功通知请求可能发生异常，请稍后再试！");
//		                return 
//		            }
//		        });					
//			});
//				},
//				"submitCallBack":function(dialogForm,dialog){
//				},
//			});
		}
		else{
			_prepareInvoiceInfo(param);
		}
	};
	/**
	 * 可打印费用项查询
	 */	
	var _queryComputeCharge=function(param) {
		$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
		var url = contextPath + "/bill/getNewInvoiceItems";
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
		if (response.data.vat_Item_Detail == undefined || response.data.vat_Item_Detail.length==0) {
			$.alert("提示", "没有可打印的费用项");
			return false;
		}
		return response.data;
	};
	
	
	
	_prepareInvoiceInfo =function(param) {
		var accNbr = param.accNbr;
		var tempUrl = contextPath+"/print/getInvoiceTemplates";
		var tempParam = {
			'areaId' : OrderInfo.staff.areaId,
			'busiType' :  "102"
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
		_PrintInvoiceInfo(param, {}); //qccResp.data
	});
	ec.form.dialog.createDialog({
		"id":"-invoice-items",
		"width":580,
//		"height":450,
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


var _PrintInvoiceInfo =function(param){ 
	if(_chkInput()){
		return;
	}
	var accNbr = param.accNbr;
	var qccResp = _queryComputeCharge(param);
	var result = _addParam(param,qccResp);
	var invoiceInfos = result.invoiceInfos;
	//调用受理后台结束，开始调用生成PDF
	var invoiceParam = {
		"partyName" : $("#invoiceTitleInp").val(),
		"templateId" : $("#tempListSel :selected").val(),
		"items" : result.items,
		"invoiceInfos" : invoiceInfos,
		'busiType' :  102
	};
	
	var Vat_Item_Detail = {
			"Invoice_Id" : qccResp.invoiceId,
			"Vat_Item_Code" :$("#invoiceNbrInp").val(),//发票代码
			"Vat_Item_Number" : $("#invoiceNumInp").val()//发票号码
	};		
	var invoiceNoticeParam = { //新票据成功打印通知入参
			"AccNbr" : accNbr,
			"Oper_Date" : "",
			"Receipt_Class" : "0",//发票类型
			"Invoice_Id" :  qccResp.invoiceId,
			"printFlag": 0,
			"Vat_Item_Detail" :Vat_Item_Detail
		};
	
	var InvoiceReverseParam_Vat_Item_Detail = {
			"Vat_Item_Code" : $("#invoiceNbrInp").val(),//发票代码
			"Vat_Item_Number" : $("#invoiceNumInp").val()//发票号码
	};		
	var invoiceReverseParam ={  //新票据回收通知入参
			"AccNbr" : accNbr,
			"Oper_Date" : "",
			"Receipt_Class" : "0",//发票类型
			"Vat_Item_Detail" :InvoiceReverseParam_Vat_Item_Detail
	};
	common.print.printInvoice(invoiceParam);
	//最终关闭窗口
	common.print.closePrintDialog();
	$.callServiceAsJson(contextPath+"/print/invoiceNotice",invoiceNoticeParam,{
        "before":function(){
            $.ecOverlay("票据登记中，请稍等...");
        },
        "always":function(){
            $.unecOverlay();
        },
        "done" : function(response){
            if(response.code==0){
//                $.alert("提示","发票打印成功通知完成！");
            	new $.Zebra_Dialog("打印机链接已经打开，预览页生成，默认发票已经打印成功，并已经在系统注册。请记录好发票代码及发票号码等信息，保存好发票！", {
            		'open_speed':0,
            		'keyboard':true,
            		'modal':true,
            		'overlay_close':false,
            		'overlay_opacity':.5,
            		'type':     false,
            		'title':    "打印确认",
            		"show_close_button" : true,
            		'buttons':  [   
            					      '确认',
            					      '返回'
            					],
            		'onClose':  function(caption) {
            			if(caption=="打印成功"){
            				return;
            			}             
            			else 
            				return;
//            				if(caption=="打印失败,作废发票"){									
//            				$.callServiceAsJson(contextPath+"/print/invoiceReverse",invoiceReverseParam,{
//            		            "before":function(){
//            		                $.ecOverlay("发票回收中，请稍等...");
//            		            },
//            		            "always":function(){
//            		                $.unecOverlay();
//            		            },
//            		            "done" : function(response){
//            		                if(response.code==0){
//            		                    $.alert("提示","发票回收完成！请开始重新打印！");
//            		                    return;
//            		                }else{
//            		                    $.alert("提示","发票回收通知通知失败！"+response.data);
//            		                    return;
//            		                }
//            		            },
//            		            fail:function(response){
//            		                $.unecOverlay();
//            		                $.alert("提示","发票回收请求可能发生异常，请稍后再试！");
//            		                return;
//            		            }
//            		        });	
//            				}								
            			}
            	});               
            }else{
                $.alert("提示","发票打印成功通知失败！"+response.data);
                return;
            }
        },
        fail:function(response){
            $.unecOverlay();
            $.alert("提示","发票打印成功通知请求可能发生异常，请稍后再试！");
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
			"billingCycleId" : param.billingCycleId,
			"acctName" : "",
			"acctNbr" : "",
			"paymentSerialNbr" : "",
			"previousChange" : "",
			"currentChange" : "",
			"balance" : "",
			"paymentAmount" : "0",
			"shouldCharge" : "0",
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
		$(queryResult.vat_Item_Detail).each(function(){
		//var count=0;
		//$(data.result.invioceInformationDetail).each(function(){
//			$(queryResult.billingCycleGroup).each(function(){
//				var billingCycleId = this.billingCycleId;
//				$(this.invioceItemDetail).each(function(){
				//	items[count]={"itemName":encodeURI(this.invioceItemName),"charge":this.invioceItemMoney};
				//	count++;
					sumRealAmount += parseInt(this.invoiceItemMoney);
		  			items.push({
		  				"billingCycleId" : param.billingCycleId,
		  				"itemName" : this.vat_Item_Name,
		  				"charge" : this.vat_Item_Amount
		  			});
//				invoiceInfo.itemsGroups.push({"billingCycleID": this.billingCycleId,"items" : items});
			});
			
		//});
//	}
//	var itemGroups = qccResp.data.itemGroups;
//	var items = [];
//	for(var j=0;j<itemGroups.length;j++){ 
//		 var chargeItems = itemGroups.chargeItems;
//	     for(var i=0;i<chargeItems.length;i++){
//		    var chargeitem = chargeItems[i];
//	        sumRealAmount += chargeitem.invioceItemMoney;
//  			items.push({
//  				"itemName" : chargeitem.billItemName,
//  				"charge" : chargeitem.invioceItemMoney
//  			});
//  		 }
//	     invoiceInfo.itemsGroups.push({"billingCycleID": ,"items" : items});
//	}
	invoiceInfo.billSerialNbr = queryResult.invoiceId;//票据总流水
//	invoiceInfo.billSerialNbr = queryResult.billSerialNbr;
	invoiceInfo.acctId = queryResult.accId;
	invoiceInfo.acctName = queryResult.acctName;
	invoiceInfo.acctNbr = queryResult.accNbr;
//	invoiceInfo.paymentSerialNbr = queryResult.paymentSerialNbr;
//	invoiceInfo.previousChange = queryResult.previousChange;
//	invoiceInfo.currentChange = queryResult.currentChange;
//	invoiceInfo.shouldCharge = queryResult.shouldCharge;
	invoiceInfo.account = sumRealAmount;
	invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
//	invoiceInfo.paymentAmount = queryResult.paymentAmount;
	invoiceInfo.invoiceNbr = $("#invoiceNbrInp").val();
	invoiceInfo.invoiceNum = "" + $("#invoiceNumInp").val();
	
//	var sumRealAmount = 0;
//	var items = [];
//	//获取费用项和接入号的关系
//	//invoiceInfo.acctItemIds = [];
//	$("#invoiceContDiv tbody input:checked").parent().parent().each(function(){
//		sumRealAmount += parseInt($(this).attr("invioceItemMoney"));
//		items.push({
//			"itemName" : $(this).attr("acctItemTypeName"),
//			"charge" : parseInt($(this).attr("invioceItemMoney"))
//		});
//		invoiceInfo.itemsGroups.push({"billingCycleID": "","items" : items});
//	});
//	if(OrderInfo.actionFlag==11){
//		invoiceInfo.printFlag = 0;
//	}	
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
		prepareInvoiceInfo:_prepareInvoiceInfo,
		queryComputeCharge:_queryComputeCharge,
		printInvoice: _printInvoice,
		chkInput : _chkInput
	};
})();
//初始化
$(function(){
	var today=new Date(); 
//	$.alert("提示",today.getFullYear().toString());
	$("#billingCycleIdYear").val(today.getFullYear().toString());	
});
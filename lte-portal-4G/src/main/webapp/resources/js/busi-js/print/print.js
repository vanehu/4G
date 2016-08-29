/**
 * 打印方法-回执、发票、押金票据
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("common", "print");
/**
 * 打印方法-回执、发票、押金票据
 */
common.print = (function($){
	var _voucherCommon=function(olId){
		var ifPrint = $('a[olId=' + olId + ']').attr("ifPrint");
		if (CONST.getAppDesc() == 0 && 'N' == ifPrint) {
			var trList = $("#tab_orderList tr[olId=" + olId + "]");
			var areaId = '';
			var instList = [];
			var newProdFlag = 'false';
			for (var i=0; i < trList.length; i++) {
				var tr = trList[i];
				var actionClass = $(tr).attr("actionClass");
				if (actionClass == '1600') {
					continue;
				}
				newProdFlag = $(tr).attr("newProdFlag");
				if (newProdFlag == 'true') {
					break;
				}
				var instId = $(tr).attr("objInstId");
				if (instId == undefined || instId == '') {
					$.alert("提示", "objInstId为空，请核查接口返回的数据！");
					return false;
				}
				var accessNumber = $(tr).attr("accessNumber");
				if (accessNumber == undefined || accessNumber == '') {
					$.alert("提示", "accessNumber为空，请核查接口返回的数据！");
					return false;
				}
			}
			for (var i=0; newProdFlag == 'false' && i < trList.length; i++) {
				var tr = trList[i];
				var actionClass = $(tr).attr("actionClass");
				if (actionClass == '1600') {
					continue;
				}
				var instId = $(tr).attr("objInstId");
				var accessNumber = $(tr).attr("accessNumber");
				if ($.inArray(instId, instList) >= 0) {
					continue;
				}
				areaId = $(tr).attr("areaId");
				OrderInfo.orderResult.olNbr = $(tr).attr("olNbr");
				var custId = '';
				OrderInfo.order.soNbr = UUID.getDataId();
				var param = {
						areaId : areaId,
						acctNbr : accessNumber,
						custId : custId,
						soNbr : OrderInfo.order.soNbr ,
						//queryType : "1,2,3,4,5",
						instId : instId,
						type : "2"
				};
				var loadInstFlag = query.offer.invokeLoadInst(param);
				if (!loadInstFlag) {
					$.alert("提示", "加载订单回执信息失败");
					return false;
				}
				instList.push(instId);
			}
			$('a[olId=' + olId + ']').attr("ifPrint", "Y");
		}
		if (OrderInfo.order.soNbr == undefined || OrderInfo.order.soNbr==''){
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		OrderInfo.orderResult.olId = olId;
		return true;
	};
	var _preSign=function(olId,chargeItems){
		_voucherCommon(olId);
		var voucherInfo = {
			"olId":OrderInfo.orderResult.olId,
			"soNbr": OrderInfo.order.soNbr
		};
		if(_getCookie('_session_pad_flag')=='1'){
			var arr=new Array(3);
			if(ec.util.browser.versions.android){
				arr[0]='order/sign/downVoucher';				
			}else{
				arr[0]='print/iosVoucher';				
			}
			arr[1]='voucherInfo';
			arr[2]=JSON.stringify(voucherInfo);
			MyPlugin.printShow(arr,
                function(result) {
                },
                function(error) {
                }
			);
		}else{
			$("<form>", {
		    	id: "voucherForm",
		    	style: "display:none;",
				target: "_blank",
				method: "POST",
				action: contextPath + "/order/sign/downVoucher"
		    }).append($("<input>", {
		    	id : "voucherInfo",
		    	name : "voucherInfo",
		    	type: "hidden",
		    	value: JSON.stringify(voucherInfo)
		    })).appendTo("body").submit();
		}
	};
	var _signVoucher=function(params){
		var PcFlag="0";
		if(_getCookie('_session_pad_flag')=='1'){
			PcFlag="1";
		}else{
			$.alert("提示","目前只支持客户端的数字签名,请在客户端登录!");
			return;
		}
		params.PcFlag=PcFlag;
		var url=contextPath+"/order/sign/previewForSign";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>生成回执预览的html,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				if (response.code == 0) {
					if(PcFlag=="1"){
						SignPlugin.datasign(response.data,JSON.stringify(params),function(){}, function(){});
					}
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					$.alert("提示","生成回执预览的html失败!");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	var _preVoucher=function(olId, chargeItems){
		if(!_voucherCommon(olId)){
			return;
		};
		var voucherInfo = {
			"olId":OrderInfo.orderResult.olId,
			"soNbr": OrderInfo.order.soNbr,
			"busiType":"1",
			"chargeItems":chargeItems
		};
		common.print.printVoucher(voucherInfo);
	};
	var _preVoucherLoc=function(olId,flag){
		if(!_voucherCommon(olId)){
			return;
		};
		var voucherInfo = {};
		if(OrderInfo.actionFlag==23){//针对异地补换卡，地区要和购物车areaId一致
			voucherInfo = {
					"olId":olId,
					"soNbr":OrderInfo.order.soNbr,
					"busiType":"1",
					"chargeItems":"",
					"flag":"1"   
				};
		}else{
			voucherInfo = {
					"olId":olId,
					"soNbr":OrderInfo.order.soNbr,
					"busiType":"1",
					"chargeItems":"",
					"areaId":OrderInfo.getAreaId(),
					"flag":"1"   //后台接口标志 
				};
		}
		if(_getCookie('_session_pad_flag')=='1'){
			common.print.signVoucher(voucherInfo);
		}else{
			if(_queryConstConfig(voucherInfo,1)){
				common.print.printVoucher(voucherInfo);
			}else{
				return;
			}
		}
	}
		
	var _printVoucher=function(voucherInfo){
	 $("#voucherForm").remove();
		if(_getCookie('_session_pad_flag')=='1'){
			var arr=new Array(3);
			if(ec.util.browser.versions.android){
				arr[0]='print/voucher';				
			}else{
				arr[0]='print/iosVoucher';				
			}
			arr[1]='voucherInfo';
			arr[2]=JSON.stringify(voucherInfo);
			MyPlugin.printShow(arr,
                function(result) {
                },
                function(error) {
                }
			);
		}else{
		    $("<form>", {
		    	id: "voucherForm",
		    	style: "display:none;",
				target: "_blank",
				method: "POST",
				action: contextPath + "/print/voucher"
		    }).append($("<input>", {
		    	id : "voucherInfo",
		    	name : "voucherInfo",
		    	type: "hidden",
		    	value: JSON.stringify(voucherInfo)
		    })).appendTo("body").submit();
		}
	};
	
	var _preInvoice=function(olId,olNbr, printFlag){
		var ifInvoice = $('a[olId=' + olId + ']').attr("ifInvoice");
		var areaId = $('a[olId=' + olId + ']').attr("areaId");
		if (CONST.getAppDesc() == 0 && 'N' == ifInvoice) {
			var trList = $("#tab_orderList tr[olId=" + olId + "]");
			var instList = [];
			var newProdFlag = 'false';
			for (var i=0; i < trList.length; i++) {
				var tr = trList[i];
				var actionClass = $(tr).attr("actionClass");
				if (actionClass == '1600') {
					continue;
				}
				newProdFlag = $(tr).attr("newProdFlag");
				if (newProdFlag == 'true') {
					break;
				}
				var instId = $(tr).attr("objInstId");
				if (instId == undefined || instId == '') {
					$.alert("提示", "objInstId为空，请核查接口返回的数据！");
					return ;
				}
				var accessNumber = $(tr).attr("accessNumber");
				if (accessNumber == undefined || accessNumber == '') {
					$.alert("提示", "accessNumber为空，请核查接口返回的数据！");
					return ;
				}
			}
			for (var i=0; newProdFlag == 'false' && i < trList.length; i++) {
				var tr = trList[i];
				var actionClass = $(tr).attr("actionClass");
				if (actionClass == '1600') {
					continue;
				}
				var instId = $(tr).attr("objInstId");
				var accessNumber = $(tr).attr("accessNumber");
				if ($.inArray(instId, instList) >= 0) {
					continue;
				}
				areaId = $(tr).attr("areaId");
				OrderInfo.orderResult.olNbr = $(tr).attr("olNbr");
				var custId = '';
				OrderInfo.order.soNbr = UUID.getDataId();
				var param = {
						areaId : areaId,
						acctNbr : accessNumber,
						custId : custId,
						soNbr : OrderInfo.order.soNbr ,
						//queryType : "1,2,3,4,5",
						instId : instId,
						type : "2"
				};
				var loadInstFlag = query.offer.invokeLoadInst(param);
				if (!loadInstFlag) {
					return;
				}
				instList.push(instId);
			}
			$('a[olId=' + olId + ']').attr("ifInvoice", "Y");
		}
		if (OrderInfo.order.soNbr == undefined || OrderInfo.order.soNbr==''){
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		OrderInfo.orderResult.olNbr = olNbr;
		OrderInfo.orderResult.olId = olId;
		var param = {
			"olId" : OrderInfo.orderResult.olId,
			"soNbr": OrderInfo.order.soNbr,
			"billType" : 0,
			"printFlag": printFlag,
			"areaId" : areaId,
			"acctItemIds":[]
		};
		common.print.prepareInvoiceInfo(param);
	};
	var _closePrintDialog=function(){
		if(common.print.dialogForm!=undefined&&common.print.dialog!=undefined){
			common.print.dialogForm.close(common.print.dialog);
		}
	};
	
	//可打印费用项查询
	var _queryComputeCharge=function(param) {
		$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
		var url=contextPath+"/print/getInvoiceItems";
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
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return false;
		}
		if(response.data.resultCode != '0') {
			$.alert("提示", response.data.resultMsg);
			return false;
		}
		//判断是否有可打印费用项
		if (response.data.chargeItems == undefined || response.data.chargeItems.length==0) {
			$.alert("提示", "没有可打印的费用项");
			return false;
		} else {
			var i = 0;
			for(; i < response.data.chargeItems.length; i++){
				var item = response.data.chargeItems[i];
				if (item.paymentAmount!=0) {
					break;
				}
			}
			if (i == response.data.chargeItems.length) {
				$.alert("提示", "没有可打印的费用项");
				return false;
			}
		}
		return response;
	};
	//发票代码、发票号码查询
	var _queryInvoiceInfo = function(sobillType) {
		var param = {
			"staffId" : OrderInfo.staff.staffId,
			"areaId" : OrderInfo.staff.areaId,
			"custSoNbr" : OrderInfo.orderResult.olNbr,
			"custOrderId" : OrderInfo.orderResult.olId,
			"invoiceType" : sobillType //目前阶段我们用到的是：100 普通发票和 200 收据。待后续有营改增需求后再 用其它类型。
		};
		var url=contextPath+"/print/getInvoiceInfo";
		var response = $.callServiceAsJson(url,param,{});
		if(!response){
//			$.alert("提示","<br/>查询发票代码发票号码失败，请稍后重试");
			return false;
		}
		if(response.code == -2) {
			$.alertM(response.data);
			return false;
		}
		if(response.code != 0) {
//			$.alert("提示","<br/>查询发票代码发票号码失败，请稍后重试");
			return false;
		}
		if (response.data.invoiceInfos != undefined && response.data.invoiceInfos instanceof Array && response.data.invoiceInfos.length > 0) {
		
		} else {
//			$.alert("提示","<br/>查询发票代码发票号码失败，返回结果中未获取到发票信息，请稍后重试");
			return false;
		}
		return response;
	};
	/**
	 * 填写打印发票信息
	 */
	var _prepareInvoiceInfo=function(param){
		
		//判断是否一般纳税人，如果是的话提示
		if (OrderInfo.cust.norTaxPayer == "Y") {
			$.alert("提示", "客户为一般纳税人，请到省份CRM系统打印专用增值税发票！");
			$.confirm("提示信息","客户为一般纳税人，专用增值税发票需要到省份CRM系统打印。是否只打印普通发票?", {
				yes : function(){
					_prepareInvoiceInfoCore(param);
				},
				no : function(){
					return;
				}
			}, "question");
		}else{
			_prepareInvoiceInfoCore(param);
		}
	}
	var _prepareInvoiceInfoCore=function(param){
		//根据开关设置普通发票的显示
		var onoff = initNinvoice();
		//根据开关设置电子发票的显示
		initEinvoice();
		//可打印费用项查询
		var qccResp = _queryComputeCharge(param);
		if (!qccResp) {
			return;
		}
		//发票代码、发票号码查询
		getInvoiceNumber(100);//默认查发票
		function getInvoiceNumber(billType) {
			var iiqResp = _queryInvoiceInfo(billType);
			if (iiqResp) {
				var iiqInfos = iiqResp.data.invoiceInfos;
				if (ec.util.isArray(iiqInfos[0].invoiceInfos)) {
					$("#invoiceNbrInp").val(iiqInfos[0].invoiceInfos[0].invoiceNbr);
					$("#invoiceNumInp").val(iiqInfos[0].invoiceInfos[0].invoiceNum);
				} else {
					$("#invoiceNbrInp").val(iiqInfos[0].invoiceNbr);
					$("#invoiceNumInp").val(iiqInfos[0].invoiceNum);
				}
			}
		}
		var invoiceInfos = qccResp.data.invoiceInfos;
		if (invoiceInfos != undefined && invoiceInfos instanceof Array && invoiceInfos.length > 0) {
			
		} else {
			//没有发票信息，需要进行初始化
			var initParam={
				"soNbr":OrderInfo.order.soNbr,
				"billType" : 0,
				"olId" : param.olId,
				"printFlag" : -1,
				"areaId" : OrderInfo.staff.areaId,
				"acctItemIds":[]
			};
			var initResult = common.print.initPrintInfo(initParam);
			if(!initResult) {
				return;
			}
			//提示到发票补打页面操作
			if (param.printFlag == 1) {
				$.alert("信息", "此购物车对应的发票未打印过，请到发票补打页面。");
				return;
			}
			//可打印费用项查询
			qccResp = _queryComputeCharge(param);
			if (!qccResp) {
				return;
			}
		}
		//判断是否是重打还是补打
		common.print.oldInvoiceFlag = '0';
		if (_checkCanReOrAdd(qccResp.data.invoiceInfos, param.printFlag)) {
			return;
		}
		
		
		//查询可打印费用项成功，接下去查询模板组
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
		
		
		//显示接入号
		var selHtml = "";
		var prodInfo = qccResp.data.prodInfo;
		if (prodInfo != undefined && prodInfo.length > 0) {
			selHtml+="<option selected='selected' value="+prodInfo[0].accessNumber+">"+prodInfo[0].accessNumber+"</option>";
			for(var i=1;i<prodInfo.length;i++){
				var prod = prodInfo[i];
				selHtml+="<option value="+prod.accessNumber+">"+prod.accessNumber+"</option>";
			}
		}
		$("#acceNbrSel").html(selHtml);
		
		
		//显示费用项
		var contHtml = "";
		contHtml+="<div id='invoiceContDiv' class='plan_second_list cashier_tr'>";
		contHtml+="  <table class='contract_list'>";
		contHtml+="  <thead>";
		contHtml+="    <tr>";
		contHtml+="      <td>是否打印</td><td>费用名称</td><td>费用(元)</td><td>税金(元)</td><td>付费方式</td>";
		contHtml+="    </tr>";
		contHtml+="  </thead>";
		contHtml+="  <tbody>";
		var chargeItems = qccResp.data.chargeItems;
		for(var i=0;i<chargeItems.length;i++){
			var item = chargeItems[i];
			if (i == 0) {
				$("#invoiceTitleInp").val(item.custName);
			}
			//if (item.paymentAmount==0) {
			//	continue;
			//}
			contHtml+="    <tr acctItemId="+item.acctItemId+" acctItemTypeId="+item.acctItemTypeId+" ";
			contHtml+="        acctItemTypeName='"+item.acctItemTypeName+"' boActionType='"+item.boActionType+"' ";
			contHtml+="        boActionType='"+item.boActionType+"' boId="+item.boId+" feeAmount="+item.feeAmount+" ";
			contHtml+="        invoiceId="+item.invoiceId+" objId="+item.objId+" objType="+item.objType+" ";
			contHtml+="        payMethodCd="+item.payMethodCd+" payMethodName="+item.payMethodName+" ";
			contHtml+="        realAmount="+item.realAmount + " ";
			contHtml+="        tax="+item.tax+" taxRate="+item.taxRate+" >";
			if (_checkChargeItem(item)) {
				contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' checked='checked'/></td>";
			} else {
				contHtml+="      <td><input type='checkbox' name='invoiceItemsChkBox' disabled='disabled'/></td>";
			}
			contHtml+="      <td>"+item.acctItemTypeName+"</td>";
			contHtml+="      <td>"+(item.realAmount / 100).toFixed(2)+"</td>";
			contHtml+="      <td>"+(item.tax / 100).toFixed(2)+"</td>";
			contHtml+="      <td>"+item.payMethodName+"</td>";
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
				$("#codeTitleDt").html("发票代码：");
				$("#numTitleDt").html("发票号码：");
				$("#tempDt").parent().show();
				param.billType = 0;
				getInvoiceNumber(100);
			} else if ($("input[name=billType]:checked").val()=="1") {
				$("#invoiceNbrNumDl").hide();
				$("#titleDt").html("票据抬头：");
				$("#tempDt").html("票据模板：");
				$("#codeTitleDt").html("票据代码：");
				$("#numTitleDt").html("票据号码：");
				$("#tempDt").parent().show();
				param.billType = 1;
				getInvoiceNumber(200);
			}else{
				$("#invoiceNbrNumDl").hide();
				$("#tempDt").parent().hide();
				$("#titleDt").html("电子发票：");
				param.billType = 2;
			}
		});
		if ("OFF" == onoff) {
			$("#billTypeVo").click();
		}else{
			$("#billTypeIn").click();
		}
		$("#invoiceItemsConfirm").off("click").on("click",function(event){
			if (common.print.oldInvoiceFlag != '0') {
				$.alert("信息", "存在未作废发票，请先确定作废发票");
				return;
			}
			_saveInvoiceInfo(param, qccResp.data);
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
	};
	var _initPrintInfo=function(param) {
		var url=contextPath+"/print/getInvoiceItems";
		var queryResult = $.callServiceAsJson(url,param);
		if(!queryResult){
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return;
		}
		if(queryResult.code == -2) {
			$.alertM(queryResult.data);
			return;
		}
		if(queryResult.code != 0) {
			$.alert("提示","<br/>查询可打印费用项失败，请稍后重试");
			return;
		}
		if(queryResult.data.resultCode != '0') {
			$.alert("提示", queryResult.data.resultMsg);
			return;
		}
		//判断是否有可打印费用项
		if (queryResult.data.chargeItems == undefined || queryResult.data.chargeItems.length==0) {
			$.alert("提示", "没有可打印的费用项");
			return;
		}
		var result = _prepareInitParam(param, queryResult.data);
		var invoiceInfos = result.invoiceInfos;
		
		var params={"invoiceInfos" : invoiceInfos};
		var smResp = _invokeSavingMethod(params, param.printFlag);
		if (smResp == false) {
			return false;
		}
		invoiceInfos = _setInvoiceId(invoiceInfos, smResp.data.invoiceIds, '0');
		return invoiceInfos;
	};
	
	var _getPrintState=function(printFlag) {
		if (printFlag == '-1') {
			return '初始打印';
		} else if (printFlag == '0') {
			return '正常打印';
		} else if (printFlag == '1') {
			return '重打';
		} else if (printFlag == '2') {
			return '补打';
		} else {
			return '未知操作';
		}
	};
	//判断是否能重打或补打  true - 限制 , false - 允许打印
	var _checkCanReOrAdd=function(invoiceInfos, printFlag) {
		if (invoiceInfos != undefined && invoiceInfos instanceof Array && invoiceInfos.length > 0) {
			for (var i=0; i < invoiceInfos.length; i++) {
				if (!invoiceInfos[i]) {
					$.alert("信息", "接口返回的发票信息不是有效值，请确认。");
					return true;
				}
				if (invoiceInfos[i].printFlag=='-1') {
					//未打印时，允许正常打印和补打
					if (printFlag == '0' || printFlag == '2') {
						
					} else {
						$.alert("信息", "此购物车对应的发票未打印过，请到发票补打页面。");
						return true;
					}
				} else if (invoiceInfos[i].printFlag == '0') {
					//如果是收据，就允许操作
					if (invoiceInfos[i].billType == '1') {
						return false;
					}
					//正常打印状态，允许重打
					if (printFlag == '1') {
						//弹出作废发票提示
						_invalidInvoice(invoiceInfos, printFlag);
					} else {
						$.alert("信息", "此购物车对应的发票正常打印过，只允许重打。");
						return true;
					}
				} else if (invoiceInfos[i].printFlag == '1' || invoiceInfos[i].printFlag == '2') {
					//重打或补打状态，允许重打
					if (printFlag == '1') {
						//弹出作废发票提示
						_invalidInvoice(invoiceInfos, printFlag);
					} else {
						$.alert("信息", "此购物车对应的发票已打印过，只允许重打。");
						return true;
					}
				} else {
					//默认不允许
					$.alert("信息", "发票信息中打印标识值不规范");
					return true;
				}
			}
			//走出循环，代表允许打印
			return false;
		} else {
			//没有发票信息，允许正常打印
			if (printFlag == '0') {
				return false;
			} else {
				$.alert("信息", "此购物车没有对应的发票信息，不能进行补打或重打");
				return true;
			}
		}
	};
	
	//判断是否已打印过发票，true-有旧发票需要作废,false-没有旧发票
	var _invalidInvoice=function(invoiceInfos, printFlag) {
		if (invoiceInfos != undefined && invoiceInfos instanceof Array && invoiceInfos.length > 0) {
			//筛选invoiceId，展示需要作废的发票代码和发票号码
			$('#invalidInvoiceDiv').remove();
			var html = '';
			html += '<div class="easyDialogdiv" style="width:481px;height:300px;" id="invalidInvoiceDiv">';
			html += '  <div class="easyDialogclose" id="invalidInvoiceClose"></div>';
			html += '  <h5 class="s_title">存在未作废发票，请先作废发票</h5>';
			html += '  <div class="form-content" id="infoDiv">';
			html += '  </div>';
			html += '  <div align="center" style="margin: 20px auto;">';
			html += '    <a id="invalidInvoiceConfirm" class="btna_o" href="javascript:void(0)"><span >确认</span></a>';
			html += '    <a id="invalidInvoiceCancel" class="btna_o" style="margin-left:20px;" href="javascript:void(0)"><span>取消</span></a>';
			html += '  </div>'; 
			html += '</div>';
			$('body').append(html);
			
			var infoHtml = '';
			var invoiceIds = [];
			for (var i=0; i < invoiceInfos.length; i++) {
				var info = invoiceInfos[i];
				if ($.inArray(info.invoiceId, invoiceIds) >= 0) {
					
				} else {
					infoHtml += '<div class="marginAndFont">发票代码：' + info.invoiceNbr + '; 发票号码：' + info.invoiceNum + '</div><br>';
					invoiceIds.push(info.invoiceId);
				}
			}
			if (invoiceIds.length > 0) {
				//需要作废发票
				common.print.oldInvoiceFlag = '1';
				$("#infoDiv").html(infoHtml);
				easyDialog.open({
					container : 'invalidInvoiceDiv'
				});
				$("#invalidInvoiceConfirm").off("click").on("click", function() {
					common.print.oldInvoiceFlag = '0';
					easyDialog.close();
				});
				$("#invalidInvoiceCancel").off("click").on("click", function() {
					easyDialog.close();
				});
			}
			return false;
		} else {
			return false;
		}
	};
	//校验费用项能否被打印，true-可以打印；false-不可打印
	var _checkChargeItem=function(item){
		var payMethodCd = item.payMethodCd;
		if (payMethodCd == CONST.PAYMETHOD_CD.ZHANG_WU_DAI_SHOU || item.limitPrint == "Y"||item.realAmount==0) {
			return false;
		}
		return true;
	};
	
	//校验发票抬头，发票代码，发票号码等
	var _chkInput=function(param){
		try {
			//发票的需要校验代码和号码
			if (param.billType == 0) {
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
			}
			if ($("#invoiceTitleInp").val() == "") {
				$.alert("提示","请输入发票抬头");
				return true;
			}
			
			if($("#invoiceContDiv tbody input:checked").length < 1) {
				$.alert("提示","请选择要打印的费用项");
				return true;
			}
		} catch (e) {
			return true;
		}
		return false;
	};
	var _prepareInitParam=function(param, queryResult) {
		var invoiceInfos =[];
		var invoiceInfo = {
			"acctItemIds": [],
			"instanceType": 2,//根据过滤取值，优先为产品或销售品，2-产品，7-销售品
			"instanceId": 0,//根据过滤取值，优先为产品或销售品
			"invoiceType": "100", //目前阶段我们用到的是：100 普通发票和 200 收据。待后续有营改增需求后再 用其它类型。
			"staffId": OrderInfo.staff.staffId,
			"amount": 0,
			"realPay": 0,
			"tax": 0,//可为空，暂为0
			"invoiceNbr": 0,//发票代码，前台人工输入，票据时可为空
			"invoiceNum": "0",//发票号码，前台人工输入，票据时可为空
			"custOrderId": OrderInfo.orderResult.olId,
			"custSoNumber": OrderInfo.orderResult.olNbr,
			"custId": OrderInfo.cust.custId,
			"commonRegionId": OrderInfo.staff.areaId,
			"channelId": OrderInfo.staff.channelId,
			"bssOrgId": OrderInfo.staff.orgId,
			"acctNbr": 0,//接入号码，根据5.12接口返回展示，前台选择
			"paymethod": 100000,
			"busiName": "具体业务说明",//可为空
			"rmbUpper": "人民币大写",//固定此值
			"accountUpper": "零圆整",
			"account": 0,
			"billType": param.billType,//票据类型：0发票，1收据
			"printFlag": param.printFlag,//打印标记：0正常打印，1重打票据，2补打票据，-1未打印
			"invoiceId": 0
		};
		
		var instanceFlag = false;
		var sumFeeAmount = 0;
		var sumRealAmount = 0;
		var sumTax = 0;
		var items = [];
		var payMethodName = "";
		var chargeItems = queryResult.chargeItems;
		for(var i=0;i<chargeItems.length;i++){
			var item = chargeItems[i];
			invoiceInfo.acctItemIds.push({"acctItemId": item.acctItemId});
			if (item.objType == "2") {
				invoiceInfo.instanceType = item.objType;
				invoiceInfo.instanceId = item.objId;
				invoiceInfo.paymethod = item.payMethodCd;
				instanceFlag = true;
			} else if (!instanceFlag && item.objType == "7") {
				invoiceInfo.instanceType =item.objType;
				invoiceInfo.instanceId = item.objId;
				invoiceInfo.paymethod = item.payMethodCd;
			}
			//计算金额
			sumFeeAmount += parseInt(item.feeAmount);
			sumRealAmount += parseInt(item.realAmount);
			sumTax += parseInt(item.tax);
			payMethodName = item.payMethodName;
		}
		
		//设置金额
		invoiceInfo.amount = sumFeeAmount;
		invoiceInfo.realPay = sumRealAmount;
		invoiceInfo.tax = sumTax;
		invoiceInfo.account = sumRealAmount;
		invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
		//取实例ID和类型
		invoiceInfo.invoiceNbr = 0;
		invoiceInfo.invoiceNum = "0";
		//取接入号
		var prodInfo = queryResult.prodInfo;
		if (prodInfo != undefined && prodInfo.length > 0) {
			invoiceInfo.acctNbr = prodInfo[0].accessNumber;
		}
		
		invoiceInfos.push(invoiceInfo);
		var result = {
			"payMethodName" : payMethodName,
			"items" : items,
			"invoiceInfos" : invoiceInfos
		};
		return result;
	};
	var _addParam=function(param, queryResult) {
		var invoiceInfos = [];
		var invoiceInfo = {
			"acctItemIds": [],
			"instanceType": 2,//根据过滤取值，优先为产品或销售品，2-产品，7-销售品
			"instanceId": 0,//根据过滤取值，优先为产品或销售品
			"invoiceType": "100", //目前阶段我们用到的是：100 普通发票和 200 收据。待后续有营改增需求后再 用其它类型。
			"staffId": OrderInfo.staff.staffId,
			"amount": 0,
			"realPay": 0,
			"tax": 0,//可为空，暂为0
			"invoiceNbr": 0,//发票代码，前台人工输入，票据时可为空
			"invoiceNum": "0",//发票号码，前台人工输入，票据时可为空
			"custOrderId": OrderInfo.orderResult.olId,
			"custSoNumber": OrderInfo.orderResult.olNbr,
			"custId": OrderInfo.cust.custId,
			"commonRegionId": OrderInfo.staff.areaId,
			"channelId": OrderInfo.staff.channelId,
			"bssOrgId": OrderInfo.staff.orgId,
			"acctNbr": 0,//接入号码，根据5.12接口返回展示，前台选择
			"paymethod": 100000,
			"busiName": "具体业务说明",//可为空
			"rmbUpper": "人民币大写",//固定此值
			"accountUpper": "零圆整",
			"account": 0,
			"billType": param.billType,//票据类型：0发票，1收据
			"printFlag": param.printFlag,//打印标记：0正常打印，1重打票据，2补打票据，-1未打印
			"invoiceId": 0
		};
		//设置invoiceId
		invoiceInfo.invoiceId = queryResult.invoiceInfos[0].invoiceId;
		//设置票据类型
		invoiceInfo.billType = $("input[name='billType']:checked").val();
		//设置发票类型
		if (invoiceInfo.billType == '0') {
			invoiceInfo.invoiceType = '100';
		} else if (invoiceInfo.billType == '1') {
			invoiceInfo.invoiceType = '200';
		} else {
			invoiceInfo.invoiceType = '130';
			invoiceInfo.printFlag = 3;
		}
		
		
		var instanceFlag = false;
		var sumFeeAmount = 0;
		var sumRealAmount = 0;
		var sumTax = 0;
		var items = [];
		var payMethodName = "";
		//获取费用项和接入号的关系
		var rela = _getAcceNbrBoIdRela(queryResult);
		invoiceInfo.acctItemIds = [];
		$("#invoiceContDiv tbody input:checked").parent().parent().each(function(){
			//设置账单项ID
			invoiceInfo.acctItemIds.push({"acctItemId": $(this).attr("acctItemId")});
			//设置实例id和类型，优先为产品或销售品，2-产品，7-销售品
			if ($(this).attr("objType") == "2") {
				invoiceInfo.instanceType = $(this).attr("objType");
				invoiceInfo.instanceId = $(this).attr("objId");
				invoiceInfo.paymethod = $(this).attr("payMethodCd");
				instanceFlag = true;
			} else if (!instanceFlag && $(this).attr("objType") == "7") {
				invoiceInfo.instanceType = $(this).attr("objType");
				invoiceInfo.instanceId = $(this).attr("objId");
				invoiceInfo.paymethod = $(this).attr("payMethodCd");
			}
			//计算金额
			sumFeeAmount += parseInt($(this).attr("feeAmount"));
			sumRealAmount += parseInt($(this).attr("realAmount"));
			sumTax += parseInt($(this).attr("tax"));
			var accessNumber = '';
			var boId = $(this).attr("boId");
			for (var i=0; i < rela.length; i++) {
				if (boId == rela[i].boId) {
					accessNumber = rela[i].accessNumber;
				}
			}
			
			items.push({
				"itemName" : $(this).attr("acctItemTypeName"),
				"charge" : parseInt($(this).attr("realAmount")),
				"tax" : parseInt($(this).attr("tax")),
				"acceNumber" : accessNumber
			});
			payMethodName = $(this).attr("payMethodName");
		});
		if(OrderInfo.actionFlag==11){
			invoiceInfo.printFlag = 0;
		}
		
		//设置金额
		invoiceInfo.amount = sumFeeAmount;
		invoiceInfo.realPay = sumRealAmount;
		invoiceInfo.tax = sumTax;
		invoiceInfo.account = sumRealAmount;
		invoiceInfo.accountUpper = ec.util.atoc(sumRealAmount);
		//取实例ID和类型
		invoiceInfo.invoiceNbr = $("#invoiceNbrInp").val();
		invoiceInfo.invoiceNum = "" + $("#invoiceNumInp").val();
		//取接入号
		invoiceInfo.acctNbr = $("#acceNbrSel option:selected").val();
		
		invoiceInfos.push(invoiceInfo);
		var result = {
			"payMethodName" : payMethodName,
			"items" : items,
			"invoiceInfos" : invoiceInfos
		};
		return result;
	};
	var _getAcceNbrBoIdRela=function(queryResult) {
		var rela = [];
		var chargeItems = queryResult.chargeItems;
		var prodInfo = queryResult.prodInfo;
		for (var i=0; i < chargeItems.length; i++) {
			var boId = chargeItems[i].boId;
			for(var j=0; j < prodInfo.length; j++) {
				var accessNumber = prodInfo[j].accessNumber;
				var busiOrders = prodInfo[j].busiOrders;
				for (var k=0; k < busiOrders.length; k++) {
					if (busiOrders[k].boId == boId) {
						var tmp = {
							"boId" : boId,
							"accessNumber" : accessNumber
						};
						rela.push(tmp);
					}
				}
			}
		}
		return rela;
	};
	
	var _saveInvoiceInfo=function(param, queryResult){
		
		if (_chkInput(param)) {
			return;
		}
		if (!queryResult.invoiceInfos[0]) {
			$.alert("提示","集团营业受理后台接口返回缺少发票信息，请确认。");
			return;
		}
		var result = _addParam(param, queryResult);
		var invoiceInfos = result.invoiceInfos;
		
		var params={"invoiceInfos" : invoiceInfos};
		var smResp = _invokeSavingMethod(params, param.printFlag);
		if (smResp == false) {
			return;
		}
		
		//调用受理后台结束，开始调用生成PDF
		var invoiceParam = {
			"partyName" : $("#invoiceTitleInp").val(),
			"templateId" : $("#tempListSel :selected").val(),
			"prodInfo" : queryResult.prodInfo,
			"items" : result.items,
			"payMethod" : result.payMethodName,
			"invoiceInfos" : invoiceInfos
		};
		//如果是电子发票不生成pdf
		if (param.billType == 2) {
			$.alert("提示","电子发票信息已经下发省份，请到营业受理>电子发票是查看！")
		} else {
			_printInvoice(invoiceParam);
		}
		//最终关闭窗口
		if (OrderInfo.cust.norTaxPayer != "Y") {
			common.print.closePrintDialog();
		}
		return;
	};
	var _invokeSavingMethod=function(params, printFlag){
		$.ecOverlay("<strong>正在提交中,请稍等会儿....</strong>");
		var response = $.callServiceAsJson(contextPath+"/print/saveInvoiceInfo",params);
		$.unecOverlay();
		if(response.code == -2) {
			$.alertM(response.data);
			return false;
		} else if(response.code != 0 || response.data.resultCode != "0") {
			$.alert("提示", _getPrintState(printFlag) + "：调用集团发票打印处理接口失败，"+response.data.resultMsg);
			return false;
		}
		return response;
	};
	var _setInvoiceId=function(invoiceInfos, invoiceIds, printFlag) {
		for(var i=0;i<invoiceInfos.length;i++){
			invoiceInfos[i].invoiceId = invoiceIds[i];
			invoiceInfos[i].printFlag = printFlag;
		}
		return invoiceInfos;
	};
	
	var _getCookie = function(name){
		var cookievalue = "";
		var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		if(arr != null) {
			cookievalue = unescape(arr[2]);
		}
		return cookievalue;
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
	};
	
	//以旧换新回执单打印
	var _printOld2new=function(areaId,relaId){
		var param = {
			"areaId" : areaId,
			"relaId" : relaId
		};
		$("<form>", {
			id: "old2newForm",
			style: "display:none;",
			target: "_blank",
			method: "POST",
			action: contextPath + "/print/old2new"
		}).append($("<input>", {
			id: "old2newInfo",
			name: "old2newInfo",
			type: "hidden",
			value: JSON.stringify(param)
		})).appendTo("body").submit();
	};
	
	//天翼高清机顶盒预约单回执打印
	var _STBReserveReceipt = function(_reserveId){
		var params = {
				reserveId : _reserveId
		};
		$("<form>", {
			id: "STBReserveReceiptForm",
			style: "display:none;",
			target: "_blank",
			method: "POST",
			action: contextPath + "/print/STBReserveReceipt"
		}).append($("<input>", {
			id: "STBReserveReceipt",
			name: "STBReserveReceipt",
			type: "hidden",
			value: JSON.stringify(params)
		})).appendTo("body").submit();
	};

	var _queryElInvoice=function(pageIndex){
		if (!$("#p_areaId_val").val() || $("#p_areaId_val").val() == "") {
			$.alert("提示", "请选择'地区'再查询");
			return;
		}
		var e_custOrderId = $.trim($("#e_custOrderId").val());
		var e_custSoNbr = $.trim($("#e_custSoNbr").val());
		if(!ec.util.isObj(e_custOrderId)&&!ec.util.isObj(e_custSoNbr)){
			$.alert("提示","购物车ID和购物车流水不能同时为空，至少包含一个查询条件！");
			return;
		}
		var areaId = $("#p_areaId").val();
		var url = contextPath + "/print/getEInvoiceInfo";
		var param = {
			pageNo: pageIndex,
			pageSize: 10,
			areaId: areaId,
			custOrderId:e_custOrderId,
			custSoNbr:e_custSoNbr
		};
		$.callServiceAsHtml(url, param, {
			"before": function () {
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always": function () {
				$.unecOverlay();
			},
			"done": function (response) {
				if (!response || response.code != 0) {
					response.data = '查询失败,稍后重试';
				}
				var content$ = $("#e_invoiceInfos");
				content$.html(response.data);
			},
			fail: function (response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	};
	//根据开关初始化电子发票类型
	function initEinvoice() {
		var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "EL_INVOICE_" + OrderInfo.staff.areaId.substr(0, 3)});
		if (response.code == "0") {
			if ("ON" == response.data) {
				$("#billTypeEl").show();
				$("#lb_billTypeEl").show();
			} else {
				$("#billTypeEl").hide();
				$("#lb_billTypeEl").hide();
			}
		}
	};
	//根据开关初始化普通发票类型
	function initNinvoice() {
		var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "NORMAL_INVOICE_" + OrderInfo.staff.areaId.substr(0, 3)});
		if (response.code == "0") {
			if ("ON" == response.data) {
				$("#billTypeIn").show();
				$("#billTypeIn").attr("checked", true);
				$("#lb_billTypeIn").show();
			} else {
				$("#billTypeIn").hide();
				$("#billTypeVo").attr("checked", true);
				$("#lb_billTypeIn").hide();
			}
		}
		return response.data;
	}
	var _queryConstConfig=function(voucherInfo,typeClass){
		var isProPrint=false;
		var param={
			typeClass:typeClass,
			queryType:1
		};
		var url=contextPath+"/print/queryConstConfig";
		$.ecOverlay("<strong>正在查询公共数据查询的服务中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data!=undefined){
				if("Y"==response.data.value){
					isProPrint=true;
				}
			}
		}else if (response.code==-2){
			$.alertM(response.data);
			return false;
		}else {
			$.alert("提示","查询公共数据查询的服务失败,稍后重试");
			return false;
		}
		if(isProPrint && voucherInfo!=null){//是否使用省里面打印
			voucherInfo.signFlag=3;
		}
		return true;
	};

	return {
		preVoucher:_preVoucher,
		printVoucher:_printVoucher,
		preInvoice:_preInvoice,
		initPrintInfo:_initPrintInfo,
		closePrintDialog : _closePrintDialog,
		prepareInvoiceInfo:_prepareInvoiceInfo,
		saveInvoiceInfo:_saveInvoiceInfo,
		chkInput : _chkInput,
		printInvoice : _printInvoice,
		preSign:_preSign,
		signVoucher:_signVoucher,
		printOld2new:_printOld2new,
		STBReserveReceipt : _STBReserveReceipt,
		queryElInvoice:_queryElInvoice,
		preVoucherLoc:_preVoucherLoc,
		queryConstConfig:_queryConstConfig
	};
})(jQuery);

//初始化
$(function(){
});
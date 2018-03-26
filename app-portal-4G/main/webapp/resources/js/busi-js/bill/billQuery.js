CommonUtils.regNamespace("bill", "query");

/**
 * 账单查询
 */
bill.query = (function(){
	
	//查询帐单
	var _queryBill = function(){
		
		var _phoneNumber = $.trim($("#phoneNumber").val());
		if(CONST.APP_DESC==0){
			if(!CONST.LTE_PHONE_HEAD.test(_phoneNumber)){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}else{
			if(!CONST.MVNO_PHONE_HEAD.test(_phoneNumber)){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}
		var param = {
				phoneNumber : _phoneNumber,
				queryFlag : $("#queryFlag input:radio:checked").val(),
				billingCycle : $("#billingDates input:radio:checked").val()
		};
		$.callServiceAsHtmlGet(contextPath+"/bill/queryBill", param, {
			"before":function(){
				$.ecOverlay("帐单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return, please try reload.</strong></div>';
				}
				if(response.data=="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data=="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#billList").html(response.data).show();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//详单查询
	var _queryDetail = function(page){
		
		var _phoneNumber = $.trim($("#phoneNumber").val());
		if(CONST.APP_DESC==0){
			if(!CONST.LTE_PHONE_HEAD.test(_phoneNumber)){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}else{
			if(!CONST.MVNO_PHONE_HEAD.test(_phoneNumber)){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}
		var _curPage = 1;
		if(page>0){
			_curPage = page;
		}
		
		var param = {
				phoneNumber : _phoneNumber,
				billingCycle : $("input:radio:checked").val(),
				billTypeCd : $("#billTypeCd").val(),
				curPage : page
		};
		if(param.billTypeCd==1){
			param.servType = "";//呼叫类型
		}
		$.callServiceAsHtmlGet(contextPath+"/bill/queryBillDetail", param, {
			"before":function(){
				$.ecOverlay("详单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return, please try reload.</strong></div>';
				}
				if(response.data=="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data=="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#billDetail").html(response.data).show();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _prePrintBill = function() {
		var billParam = {
			prePhoneNumber : $("#phoneNumber").val(),
			billingCycleChked : $("input[name='yuhou1']:checked").val()
		};
		$("#prePrintBillForm").remove();
	    $("<form>", {
	    	id: "prePrintBillForm",
	    	style: "display:none;",
	    	target: "_blank",
	    	method: "GET",
	    	action: contextPath + "/bill/prePrintBill"
	    }).append($("<input>", {
	    	id : "billParam",
	    	name : "billParam",
	    	type: "hidden",
	    	value: JSON.stringify(billParam)
	    })).appendTo("body").submit();
	};
	
	var _customizeBillPrint = function() {
		if(CONST.APP_DESC==0){
			if(!CONST.LTE_PHONE_HEAD.test($.trim($("#phoneNumber").val()))){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}else{
			if(!CONST.MVNO_PHONE_HEAD.test($.trim($("#phoneNumber").val()))){
				$.alert("提示","号码输入有误！");
			  	return;
			}
		}
		var billParam = {
			phoneNumber : $("#phoneNumber").val(),
			billingCycle : $("input[name='billingMonth']:checked").val(),
			queryFlag : $("input[name='query_flag']:checked").val()
		};
		$.callServiceAsJson(contextPath+"/bill/getBillPrintData", billParam,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if (!response) {
					$.alert("提示","<br/>查询失败,请稍后重试。");
					return;
				}
				if(response.code == -2) {
					$.alertM(response.data);
					return;
				} else if(response.code != 0) {
					$.alert("提示","<br/>查询失败,请稍后重试。");
					return;
				}
				var data = response.data;
				if (data.code != 0) {
					$.alert("提示",data.msg);
					return;
				}
				
				$("#customizeBillForm").remove();
			    $("<form>", {
			    	id: "customizeBillForm",
			    	style: "display:none;",
			    	target: "_blank",
			    	method: "POST",
			    	action: contextPath + "/bill/customizeBillPrint"
			    }).append($("<input>", {
			    	id : "billParam",
			    	name : "billParam",
			    	type: "hidden",
			    	value: encodeURI(JSON.stringify(billParam))
			    })).appendTo("body").submit();
			}
		});
	};
	
	return{
		queryBill : _queryBill,
		queryDetail : _queryDetail,
		prePrintBill:_prePrintBill,
		customizeBillPrint : _customizeBillPrint
	};
	
})();

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
				sccode :"010201",
				accNbr : 0,
				platform : "00000101",//接入平台
				accessMode :"00000110",//接入方式
				deviceType :"0000",//接入设备类型
				destinationAttr :2,//业务号码类型
				testFlag : "T",//业务测试标识
				billingCycle : $("#billingDates input:radio:checked").val()
		};
		$.callServiceAsHtmlGet(contextPath+"/bill/queryBill",param, {
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
				destinationId : _phoneNumber,//当选择用户查询时这个值是用户接入号，当选择账户查询（暂不支持）时这个值应该填账户标识
				billingCycle : $("input:radio:checked").val(),
				billTypeCd : $("#billTypeCd").val(),//详单类型，1：语音详单 2：短信详单 3：数据详单 4：增值业务详单
				queryFlag : 1, //目前页面还不支持选择按“用户”或"账户"查询，暂写死为1表示按"用户"查询
				curPage : _curPage,
				pageSize : 10,
				accNbr : 0,
				platform : "00000101",//接入平台
				accessMode :"00000110",//接入方式
				deviceType :"0000",//接入设备类型
				destinationAttr :2,//业务号码类型
				testFlag : "T",//业务测试标识
				beginDate : "",//查询起始时间
				endDate : "",//查询终结时间
				totalRecords : $("#totalRecords").val()
		};
		
		//当详单类型是语音，短信，数据时，入参加入事件类型
		if(param.billTypeCd==1 || param.billTypeCd==2 || param.billTypeCd==3){
			param.eventType = $("#eventType").val();
			//当详单类型是语音时还要加入呼叫类型
			if(param.billTypeCd==1){
				param.servType = $("#servType").val();
			}
		}
		//详单查询传入SCCODE编码
		if(param.billTypeCd==1){
	       param.sccode = "010101";
		}else if(param.billTypeCd==2){
		   param.sccode = "010103";
		}else if(param.billTypeCd==3){
		   param.sccode = "010102";
		}else if(param.billTypeCd==4){
		   param.sccode = "010104";
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

$(function() {
	//详单类型切换   
	$("#billTypeCd").change(function(){	
		$("#eventType").html("");
		var billTypeCd = $("#billTypeCd").val();
		//语音详单
		if(billTypeCd==1){
			$(".eventType").show();
			$(".servType").show();
			$("#eventType").append("<option value='10'>全部话单</option>");
			$("#eventType").append("<option value='11'>本地市话</option>");
			$("#eventType").append("<option value='12'>国内长途</option>");
			$("#eventType").append("<option value='13'>港澳台长途</option>");
			$("#eventType").append("<option value='14'>国际长途</option>");
		//短信详单
		}else if(billTypeCd==2){
			$(".eventType").show();
			$(".servType").hide();
			$("#eventType").append("<option value='20'>全部业务</option>");
			$("#eventType").append("<option value='21'>短信业务</option>");
			$("#eventType").append("<option value='22'>彩信业务</option>");
		//数据详单
		}else if(billTypeCd==3){
			$(".eventType").show();
			$(".servType").hide();
			$("#eventType").append("<option value='30'>全部数据业务</option>");
			$("#eventType").append("<option value='31'>手机上网</option>");
			$("#eventType").append("<option value='32'>WLAN上网</option>");
			$("#eventType").append("<option value='33'>有线上网</option>");
			$("#eventType").append("<option value='34'>其他数据业务</option>");
		//增值业务详单
		}else if(billTypeCd==4){
			$(".eventType").hide();
			$(".servType").hide();
		}
	});
	//初始化事件类型下拉框
	$("#billTypeCd").change();
	
});

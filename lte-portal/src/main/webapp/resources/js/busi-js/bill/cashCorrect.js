CommonUtils.regNamespace("bill", "correct");
//充值冲正准备
bill.correct = (function(){
	//页面初始化
	var _init = function(){
		$("#btn_paynotesQry").off("click").on("click",function(){_queryPayNotesList();});
	};
	
	//充值记录查询入参，冲正成功后将被用来刷新充值记录，以去除冲正成功的记录
	var _queryPayNotesParam = {
			phoneNumber :"",
			billingCycle : "",
			destinationAttr : "",
			areaName : "",
			areaCode : "",
			areaId : "",
			pageType : ""
	};
	
	//查询充值记录
	var _queryPayNotesList = function(){
		var _pageType = $("#pageType").attr("name");
		var _areaName = $("#queryArea").val();
		var _phoneNumber = $.trim($("#phoneNumber").val());
		if(CONST.APP_DESC==0){
			if(!CONST.LTE_PHONE_HEAD.test(_phoneNumber)){
				$.alert("提示","充值号码输入有误！");
			  	return;
			}
		}else{
			if(!CONST.MVNO_PHONE_HEAD.test(_phoneNumber)){
				$.alert("提示","充值号码输入有误！");
			  	return;
			}
		}
		var param ={
				phoneNumber : _phoneNumber,
				billingCycle : $("input:radio:checked").val(),
				destinationAttr : "2",
				areaName : _areaName,
				areaCode : $("#areaId").attr("areaCode"),
				areaId : $("#areaId").val(),
				pageType : _pageType
		};
		//如果是CRM充值冲正入口或CRM充值收据打印入口则添加标记，查询门户记录
		if(_pageType=="cashCorrect" || _pageType=="chargeReceipt"){
			param.doCashTypeCd = "1";
		}
		//保存充值记录查询入参
		bill.correct.queryPayNotesParam = param;
		
		$.callServiceAsHtmlGet(contextPath+"/bill/charge/correctList", param, {
			"before":function(){
				$.ecOverlay("充值缴费记录查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;">充值缴费记录查询失败！</strong></div>';
				}
				$("#paynoteslist").html(response.data);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//前往充值冲正
	var _goToCashCorrect = function( _areaCode, _areaId, _phoneNumber, _reqSerial, _cash){
		
		var params = {
				phoneNumber : _phoneNumber,
				areaCode : _areaCode,
				areaId : _areaId,
				reqSerial : _reqSerial,
				amount : _cash
		};
		$.callServiceAsHtmlGet(contextPath+"/bill/charge/doCashContent", params, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示"," 充值页面加载失败，请稍后重试");
					return;
				}
				var content$=$("#cashCharge");
				$("#correctQuery").hide();
				content$.html(response.data).show();
				$("#areaName").val(bill.correct.queryPayNotesParam.areaName);
				$("#btn_cash_back").off("click").on("click",function(){$("#correctQuery").show();$("#cashCharge").html('');});
			}
		});
	};
	
	//当推断用户可能使用接入号查询时重置起始时间最早为一个月以前
	var _setThisMonth=function(){
		$.calendar.setting.minDate= null;
		var accNbr = $.trim($("#accNbrInp").val());
		if(!CONST.MVNO_PHONE_HEAD.test(accNbr)){
			$("#TimeNote").css("display","none");			
			return false;
		}
		
		var today = new Date();
	    var cdt = new Date(today.getTime()-1000*60*60*24*30); 
		var minMonth = cdt.getMonth()+1;
		if (minMonth < 10) {
			minMonth = '0' + minMonth;
		}
		var  minDay = cdt.getDate();
		if(minDay<10){
			minDay = "0" + minDay;
		}
		var minYear = cdt.getFullYear();
//		if(minMonth==1){
//			minYear = minYear - 1;
//			minMonth = 12;
//		}
//		today.setDate(1);  
//		today.setMonth(today.getMonth()); 
//	    var minDay = cdt.getDate();
		var minDate = minYear + '-' + minMonth + '-' + minDay;
		$.calendar.setting.minDate= minDate;
		$("#TimeNote").css("display","inline");
		//$.alert("提示","当输入号码查询订单的时候，最多只能查询30天内的订单！查询的开始日期将不能选到当前30天前的日期！");
		if ($("#startDtInp").val().replace(/-/g,'').replace(/:/g,'').replace(/ /g,'') < minDate.replace(/-/g,'').replace(/:/g,'').replace(/ /g,'')) {
			$("#startDtInp").val(minDate);
		}
	};
	
	//充值订单查询 - 查询条件录入校验
	var _checkInp=function() {
		var accNbr = $.trim($("#accNbrInp").val());
		var reqSerial = $.trim($("#reqSerialInp").val());
		var chargeGroupId = $.trim($("#chargeGroupId").val());
		if (accNbr == "" && reqSerial == "" && chargeGroupId == "") {
			$.alert("提示","用户号码，充值流水号，批次号至少填一项！");
			return false;
		}
		if (accNbr != "") {
			if(!CONST.MVNO_PHONE_HEAD.test(accNbr)){
				$.alert("提示","用户号码输入有误！");
				return false;
			}
		}
		return true;
	};
	
	//充值订单查询
	var _queryChargeRecord=function(pageIndex){
		
		if (!_checkInp()) {
			return;
		}
		var accNbr = $.trim($("#accNbrInp").val());
		var reqSerial = $.trim($("#reqSerialInp").val());
		var chargeGroupId = $.trim($("#chargeGroupId").val());
		var qryType = 2;
		if(chargeGroupId != ""){
			qryType = 3;
		}
		if (reqSerial != "") {
			qryType = 1;
		}
		var qryFromTime = $("#startDtInp").val().replace(/-/g,'').replace(/:/g,'').replace(/ /g,'');
		var qryEndTime = $("#endDtInp").val().replace(/-/g,'').replace(/:/g,'').replace(/ /g,'');
		if (qryFromTime.length == 8) {
			qryFromTime = qryFromTime + "000000";
		}
		if (qryEndTime.length == 8) {
			qryEndTime = qryEndTime + "235959";
		}
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {
			"qryFromTime":qryFromTime,
			"qryEndTime":qryEndTime,
			"qryType":qryType,
			"accNbr":accNbr,
			"reqSerial":reqSerial,
			"chargeGroupId" : chargeGroupId,
			"olStatus":$("#olStatusCd").val(),
			"nowPage":curPage,
			"pageSize":10
		};
		$.callServiceAsHtmlGet(contextPath+"/bill/chargeRecord",param,{
			"before":function(){
				$.ecOverlay("查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#chargeRecDiv").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	return {
		init : _init,
		queryPayNotesParam : _queryPayNotesParam,		
		goToCashCorrect : _goToCashCorrect,
		queryChargeRecord:_queryChargeRecord,
		setThisMonth:_setThisMonth
	};
	
})();

$(function(){
	bill.correct.init();
});
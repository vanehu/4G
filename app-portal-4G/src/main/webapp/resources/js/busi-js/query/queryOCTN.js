CommonUtils.regNamespace("query", "queryOCTN");

/**
 *查询一卡双号信息
 */
query.queryOCTN = (function(){
	
	//查询一卡双号信息
	var _queryOCTNInfo = function(pageIndex){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var p_qryNumber1 = $.trim($("#p_qryNumber1").val());
		var p_qryNumber2 = $.trim($("#p_qryNumber2").val());
		var phoneReg = /^\d{11}$/; //查询时可能存在移动或联通的号码（携号转网）
		if (p_qryNumber1 == "") {
			if (p_qryNumber2 == "") {
				$.alert("提示", "请输入号码再查询。");
				return;
			} else {
				if (!phoneReg.test(p_qryNumber2)) {
					$.alert("提示", "虚号码输入有误！");
					return;
				}
			}
		} else {
			if (!phoneReg.test(p_qryNumber1)) {
				$.alert("提示", "主号码输入有误！");
				return;
			}
			if (!phoneReg.test(p_qryNumber2) && p_qryNumber2 != "") {
				$.alert("提示", "虚号码输入有误！");
				return;
			}
		}
		
		if($("#p_startDt").val()==""){
			$.alert("提示","请选择起止时间");
			return;
		}
		if($("#p_endDt").val()==""){
			$.alert("提示","请选择终止时间");
			return;
		}
		
		try {
			//yyyy-MM-dd
			var startDt = $("#p_startDt").val();
			var endDt = $("#p_endDt").val();
			var _sDate = new Date(
					parseInt(startDt.substring(0,4)),
					parseInt(startDt.substring(5,7)) - 1,
					parseInt(startDt.substring(8,10))
			);
			var _eDate = new Date(
					parseInt(endDt.substring(0,4)),
					parseInt(endDt.substring(5,7)) - 1,
					parseInt(endDt.substring(8,10))
			);
			if((_eDate.getTime() - _sDate.getTime())/1000/60/60/24 >= 31){
				$.alert("提示","时间范围不能超过31天，请重新选择起止时间");
				return;
			}
		} catch (e) {
		}
		
		var param = {
				    "startDate": $("#p_startDt").val(),
				    "endDate": $("#p_endDt").val(),
				    "mainAccNbr":p_qryNumber1,
				    "virtualAccNbr":p_qryNumber2,
					"orderState":$("#p_status").val(),
					"nowPage":curPage,
					"pageSize":5
		};
		$.callServiceAsHtmlGet(contextPath+"/report/queryOCTN",param,{
			"before":function(){
				$.ecOverlay("查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response.data && response.data.substring(0,4)!="<div"){
					$.alert("提示",response.data);
				}else{
					$("#cart_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _detailInfo = function(index){
		$("#OCTNtitle").text("一卡双号业务详情");
		$("[id='detailInfo_"+index+"']").show();
		$("#OCTNselectList").hide();
		$("#mainOCTN").hide();
	};
	var _detailInfoDesc = function(index,descIndex){
		$("#OCTNtitle").text("一卡双号业务返回描述详情");
		$("[id='detailInfo_"+index+"']").hide();
		$("[id='detailInfo_desc_"+index+"_"+descIndex+"']").show();
	};
	var _showMain = function(index){
		$("#OCTNtitle").text("一卡双号业务监控");
		$("[id='detailInfo_"+index+"']").hide();
		$("#OCTNselectList").show();
		$("#mainOCTN").show();
	};
	var _showDescInfo = function(index,descIndex){
		$("#OCTNtitle").text("一卡双号业务详情");
		$("[id='detailInfo_desc_"+index+"_"+descIndex+"']").hide();
		$("[id='detailInfo_"+index+"']").show();
	};
	return {
		queryOCTNInfo : _queryOCTNInfo,
		detailInfo:_detailInfo,
		detailInfoDesc:_detailInfoDesc,
		showMain:_showMain,
		showDescInfo:_showDescInfo
	};
})();
$(function(){
	$("#bt_cartQry").off("click").on("click",function(){query.queryOCTN.queryOCTNInfo(1);});	
	$("#p_startDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_startDt',maxDate:$("#p_endDt").val() });
	});
	$("#p_endDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_endDt',minDate:$("#p_startDt").val(),maxDate:'%y-%M-%d' });	
	});
});
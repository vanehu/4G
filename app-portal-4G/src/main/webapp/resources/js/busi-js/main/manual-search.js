
CommonUtils.regNamespace("manual", "search");

manual.search = (function(){
	
	//查询手册列表
	var _queryManualList = function(_pageIndex){
		
		var _beginDate = $("#beginDate").val();
		var _endDate = $("#endDate").val();
		if(_beginDate==null || _beginDate=="" || _endDate==null || _endDate=="" ){
			$.alert("提示", "请选择手册发布的时间段");
			return;
		}
		
		if(_pageIndex<1){
			_pageIndex = 1;
		}
		var _pageSize = 12;
		
		var params = {
				"pageIndex" : _pageIndex,
				"pageSize" : _pageSize,
				"beginDate" : _beginDate,
				"endDate" : _endDate
		};
		
		var _moduleSystem = $("#moduleSystem").val();
		if(_moduleSystem!=""){
			params.moduleSystem = _moduleSystem;
		}
		var _requestCode = $.trim($("#requestCode").val());
		if(_requestCode!=""){
			params.requestCode = _requestCode;
		}
		var _privateCode = $.trim($("#privateCode").val());
		if(_privateCode!=""){
			params.privateCode = _privateCode;
		}
		var _keyWords = $.trim($("#keyWords").val());
		if(_keyWords!=""){
			params.keyWords = _keyWords;
		}

		$.callServiceAsHtml(contextPath+"/main/queryManualList", params, {
			"before" : function(){
				$.ecOverlay("手册查询中，请稍等...");
			},
			"always" : function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					$("#manualList").html(response.data);
				}else if(response.code==-2){
					return;
				}
			},
			"fail" : function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	return {
		queryManualList : _queryManualList
	};
	
})();



$(function(){
	
	//绑定日期选择控件
	$("#beginDate").off("click").on("click", function(){
		$.calendar({ format:"yyyy-MM-dd HH:mm:ss", real:"#beginDate", maxDate:$("#endDate").val() });
	});
	$("#endDate").off("click").on("click", function(){
		$.calendar({ format:"yyyy-MM-dd HH:mm:ss", real:"#endDate", minDate:$("#beginDate").val(), maxDate:"%y-%M-%d" });	
	});
	
	//绑定查询按钮
	$("#bt_manualQuery").off("click").on("click", function(){
		manual.search.queryManualList(1);
	});
	
});
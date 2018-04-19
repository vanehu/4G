
CommonUtils.regNamespace("notice", "search");

/*公告检索*/
notice.search = (function(){
	
	//地区选择控件
	var _chooseArea = function(){
		order.area.chooseAreaTree("main/notice-search","p_areaId_val","p_areaId",3);
	};
	
	//查询公告列表
	var _queryNoticeList = function(_pageIndex){
		
		var _areaId = $("#p_areaId").val();
		if(_areaId==null || _areaId==""){
			$.alert("提示", "请选择公告发布的地区");
			return;
		}
		
		var _beginDate = $("#beginDate").val();
		var _endDate = $("#endDate").val();
		if(_beginDate==null || _beginDate=="" || _endDate==null || _endDate=="" ){
			$.alert("提示", "请选择公告发布的时间段");
			return;
		}
		
		if(_pageIndex<1){
			_pageIndex = 1;
		}
		var _pageSize = 12;
		
		var params = {
				"queryType" : "list",
				"pageIndex" : _pageIndex,
				"pageSize" : _pageSize,
				"areaId" : _areaId,
				"beginDate" : _beginDate,
				"endDate" : _endDate
		};
		
		var _noticeType = $("#noticeType").val();
		if(_noticeType!=""){
			params.noticeType = _noticeType;
		}
		var _issuer = $.trim($("#issuer").val());
		if(_issuer!=""){
			params.issuer = _issuer;
		}
		var _keyWords = $.trim($("#keyWords").val());
		if(_keyWords!=""){
			params.keyWords = _keyWords;
		}

		
		$.callServiceAsHtml(contextPath+"/main/notice", params, {
			"before" : function(){
				$.ecOverlay("公告查询中，请稍等...");
			},
			"always" : function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					$("#noticeList").html(response.data);
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
	
	//查询公告详情
	var _queryNoticeDetail = function(_bulletinId){
		
		var params = {
				"queryType" : "detail",
				"pageIndex" : 1,
				"pageSize" : 5,
				"bulletinId" : _bulletinId
		};
		
		$.callServiceAsHtml(contextPath+"/main/notice", params, {
			"before" : function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always" : function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					$("#noticeDetail").html(response.data);
					easyDialog.open({
						container : "ec-dialog-form-container-notice-items"
					});
					document.getElementById("ec-dialog-form-container-notice-items").setAttribute("style", "margin-top:40px;display: block;");
					$("#noticeItemsConCancel").click(function(){
						easyDialog.close();
					});
				}else if(response.code==-2){
					return;
				}
			},
			"fail" : function(response){
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	return {
		chooseArea : _chooseArea,
		queryNoticeList : _queryNoticeList,
		queryNoticeDetail : _queryNoticeDetail
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
	$("#bt_noticeQuery").off("click").on("click", function(){
		notice.search.queryNoticeList(1);
	});
	
});
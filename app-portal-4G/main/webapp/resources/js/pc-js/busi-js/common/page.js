
CommonUtils.regNamespace("common", "page");

/**
 * 前台分页组件
 * @requre jquery.js
 * @requre jquery.jevent.js
 */
common.page = (function(){
	
	/**
	 * 		pageSize : 5
	 */
	var page = {};
	var defaultPageSize = 5;
	var defaultListenerName = "changePage";
	var defaultPageId = "page";
	var objs = {};
	var name = "";
	var _pageDiv = {};
	var _prePage = {};
	var _nextPage = {};
	var _pageLabel = {};
	var _init = function(pageDivId,pageSize,pageId,listenerName,objList) {
		if (!pageSize || pageSize < 0) {
			page.pageSize = defaultPageSize;
		} else {
			page.pageSize = pageSize;
		}
		page.totalSize = objList.length;
		page.curPage = 1;
		if (!listenerName) {
			listenerName = defaultListenerName;
		}
		name = listenerName;
		objs = objList;
		var pageDiv = $("<div class='paging' id="+pageId+">" +
							"<span class='pageUpGray'>上一页</span>" +
							"<label></label>" +
							"<span class='nextPageGrayOrange'>下一页</span>" +
							"<label class='marginTop4'></label>" +
							"<label class='marginTop4'>跳转至</label>" +
							"<input type='text' class='inputW20H20'/>" +
							"<label class='marginTop4'>页</label>" +
						"<a class='determineBtn' href='#'>跳转</a>");
		$("#"+pageDivId).append(pageDiv);
		var totalPage = Math.ceil(page.totalSize / page.pageSize);
		if (totalPage > 0) {
			for (var i=0;i<totalPage;i++) {
				$("<a class='fontBlueB' href='#'>"+(i+1)+"</a>").appendTo(pageDiv.find("label:first"));
			}
		}
		page.totalPage = totalPage;
		_prePage = pageDiv.find("span:eq(0)");
		_prePage.click(function(){
			common.page.turnPrePage();
		});
		_nextPage = pageDiv.find("span:eq(1)");
		_nextPage.click(function(){
			common.page.turnNextPage();
		});
		_pageDiv = pageDiv;
		_pageLabel = _pageDiv.find("label:eq(0)");
		$.each(_pageLabel.find("a"),function(i,a){
			$(this).click(function(){
				common.page.turnToPage(parseInt($.trim($(this).text())));
			});
		});
		_pageDiv.find("a:last").click(function(){
			var pageNum = $.trim(_pageDiv.find("input").val());
			if (!/^\d+$/g.test(pageNum)) {
				$.alert("提示","请正确输入要跳转的页数");
				return;
			}
			if(pageNum<1 || pageNum>page.totalPage){
				$.alert("提示", "超过搜索范围");
				return;
			}
			common.page.turnToPage(parseInt(pageNum));
		});
		common.page.turnFirstPage();
	};
	//前往前一页
	var _turnPrePage = function() {
		if (page.curPage == 1) {
			$.alert("提示","已经到第一页");
			return;
		} else {
			$(this).dispatchJEvent(name, _getObjsByPage(--page.curPage));
			if (page.curPage == 1) {
				_prePage.removeClass("pageUpOrange").addClass("pageUpGray").attr("disabled","disabled");
			} else {
				_nextPage.removeClass("nextPageGray").addClass("nextPageGrayOrange").removeAttr("disabled");
			}
			_lightCurPage(page.curPage);
		}
	};
	//前往下一页
	var _turnNextPage = function() {
		if (page.curPage == page.totalPage) {
			$.alert("提示","已经到最后一页");
			_nextPage.removeClass("nextPageGrayOrange").addClass("nextPageGray");
			return;
		} else {
			$(this).dispatchJEvent(name, _getObjsByPage(++page.curPage));
			if (page.curPage == page.totalPage) {
				_nextPage.removeClass("nextPageGrayOrange").addClass("nextPageGray").attr("disabled","disabled");
			} else {
				_prePage.removeClass("pageUpGray").addClass("pageUpOrange").removeAttr("disabled");
			}
			_lightCurPage(page.curPage);
		}
	};
	//获取当前页信息列表
	var _getObjsByPage = function(curPage) {
		var objList = [];
		for (var i=(curPage-1)*page.pageSize+1;i<curPage*page.pageSize+1;i++) {
			if (i > page.totalSize) {
				break;
			}
			objList.push(objs[i-1]);
		}
		return objList;
	};
	//前往第一页
	var _turnFirstPage = function() {
		var objList = [];
		for (var i=1;i<page.pageSize+1;i++) {
			if (i>page.totalSize) {
				break;
			}
			objList.push(objs[i-1]);
		}
		_prePage.attr("disabled","disabled");
		$(this).dispatchJEvent(name,objList);
		_lightCurPage(1);
	};
	//当前页高亮
	var _lightCurPage = function(curPage) {
		$.each(_pageLabel.find("a"),function(i, a){
			if (curPage==parseInt($.trim($(this).text()))) {
				$(this).addClass("pagingSelect");
			} else {
				$(this).removeClass("pagingSelect");
			}
		});
	};
	//前往输入的页
	var _turnToPage = function(pageNum) {
		$(this).dispatchJEvent(name, _getObjsByPage(pageNum));
		_lightCurPage(pageNum);
		page.curPage = pageNum;
	};
	
	return {
		init : _init,
		turnPrePage : _turnPrePage,
		turnNextPage : _turnNextPage,
		turnFirstPage : _turnFirstPage,
		turnToPage : _turnToPage
	};
})();
CommonUtils.regNamespace("group", "main");

/**
 * 群成员查询.
 */
group.main = (function() {

	// 查询
	var _queryGroupMemberList = function(pageIndex) {
		var curPage = 1;
		if (pageIndex > 0) {
			curPage = pageIndex;
		}
		if(!ec.util.isObj($("#p_accessNbr").val())){
			$.alert("提示","群号不能为空！");
			return;
		}
		var param = {};
		param = {
			"accessNbr" : $("#p_accessNbr").val(),
			"areaId" : $("#p_areaId").val(),
			"curPage" : curPage,
			"queryType": CONST.GROUP_PROD_SPEC[parseInt($("#p_queryType").val())-1],
			"queryTypeTmp":$("#p_queryType").val(),
			"pageSize" : 10
		};
		$.callServiceAsHtml(contextPath + "/report/getGroupInfoList", param, {
			"before" : function() {
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if(response && response.code == -1){
					$.alert("提示",response.data);
				}else{
					$("#group_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};

	function _queryCartInfo(olId) {
		var param = {
			"olId" : olId
		};
		$.callServiceAsHtmlGet(contextPath + "/report/cartInfo", param, {
			"before" : function() {
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always" : function() {
				$.unecOverlay();
			},
			"done" : function(response) {
				if (response && response.code == -2) {
					return;
				} else if (response.data
						&& response.data.substring(0, 4) != "<div") {
					$.alert("提示", response.data);
				} else {
					$("#d_query").hide();
					$("#d_cartInfo").html(response.data).show();
				}
			},
			fail : function(response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	}

	var _chooseArea = function() {
		order.area.chooseAreaTreeManger("report/groupMembers", "p_areaId_val",
				"p_areaId", 3);
	};
	return {
		queryGroupMemberList : _queryGroupMemberList,
		queryCartInfo : _queryCartInfo,
		chooseArea : _chooseArea
	};

})();
// 初始化
$(function() {
	$("#bt_groupQry").off("click").on("click", function() {
		group.main.queryGroupMemberList(1);
	});
});
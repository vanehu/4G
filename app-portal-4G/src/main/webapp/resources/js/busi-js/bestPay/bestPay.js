CommonUtils.regNamespace("pay", "best");

/**
 * 翼支付.
 */
pay.best = (function(){
	var _init = function() {
		$("#bt_orderQry").off("click").on("click", function(){_queryOrderList(1);});
		$("#p_date").off("click").on("click", function() {
			$.calendar({ format:'yyyy年MM月dd日 ', real:'#p_date', maxDate:$("#p_date").val() });
		});
	};
	var _queryOrderList = function(pageIndex) {
		var olNbr = $("#p_olNbr").val();
		if (!olNbr || olNbr == "") {
			$.alert("提示", "请输入购物车流水");
			return ;
		}
		var date = $("#p_date").val();
		if (!date || date == "") {
			$.alert("提示", "请选择支付日期");
			return ;
		}
		var curPage = (pageIndex > 0) ? pageIndex : 1;
		var param = {
			"orderReqNo": olNbr,
			"orderDate": date.replace(/-/g,''),
			curPage: curPage,
			pageSize: 10
		};
		
		$.callServiceAsHtml(contextPath + "/bestpay/list", param, {
			"before":function(){
				$.ecOverlay("查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done": function(response) {
				if (response && response.code == -2) {
					return ;
				}
				if (response && response.data) {
					if (response.data == -1) {
						$.alert("提示", "查询异常！");
					} else {
						var content$ = $("#pay_order_list");
						content$.show().addClass("pageright").removeClass("in out").addClass("out");
						setTimeout(function() {
							content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
							setTimeout(function() {
								content$.removeClass("pop in out");
							}, 500);
						}, 500);
					}
				} else {
					$.alert("提示", "查询异常！");
				}
			},
			fail: function(response) {
				$.unecOverlay();
				$.alert("提示", "请求可能发生异常，请稍后再试！");
			}
		});
	};
	return {
		init:_init,
		queryOrderList: _queryOrderList
	};
})();
//初始化
$(function() {
	pay.best.init();
});

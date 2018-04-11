CommonUtils.regNamespace("bill", "paymentQuery");
/**
 * 翼销充值订单查询
 */
bill.paymentQuery = (function() {
	var _paymentQueryByAccNbr = function() {
		$("#paymentQueryBtn").on("click", function() {
			var accNbr = $.trim($("#accNbrInput").val());
			if (!(ec.util.isObj(accNbr) && CONST.LTE_PHONE_HEAD.test(accNbr))) {
				$.alert("提示", "请正确输入手机号。");
				return;
			}
			$.callServiceAsHtml(contextPath + "/app/bill/paymentQuery", {accNbr: accNbr}, {
				"before": function() {
					$.ecOverlay("请稍等...");
				},
				"done": function(response) {
					$.unecOverlay();
					if (response.code == 0) {
						$("#paymentQueryResult").html(response.data);
						$("#queryResultTab").click();
					} else if(response.code == 1202){
						$.alert("提示", response.errorsList);
					} else{
						$.alertM(response.data);
					}
				},
				"fail": function(response) {
					$.unecOverlay();
					$.alert("提示", "请求可能发生异常，请稍后再试！");
				}
			});
		});
	};
	var _init = function() {
		_paymentQueryByAccNbr();
	};
	
	return {
		init: _init
	};
})();
/**
 * UIN码查询号码信息
 * 
 */
CommonUtils.regNamespace("bill", "queryProdAccessNumByUim");

bill.queryProdAccessNumByUim = (function(){
	var _query = function(){
		var uimNumber = $.trim($("#uimNumber").val());
		var params = {
				"uimNbr":uimNumber
		};
		$.callServiceAsJson(contextPath+"/mktRes/queryNumByUim",params,{
			"before":function(){
				$("#uim_div").html("");
				$.ecOverlay("用户信息查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					var resHTML="";
					if(response.data&&response.data.acctNbr&&response.data.areaId&&response.data.areaName){
							resHTML+="<td align='center' width='416px' class='orange' style='font-size:18px'>用户号码："+response.data.acctNbr+"&nbsp;&nbsp;&nbsp;&nbsp;用户归属地区："+response.data.areaName+"  "+response.data.areaId+"</td>";
					}else{
						resHTML="<td align='center' width='116px'>没有查到用户号码信息！</td>";
					}
					$("#uim_div").html(resHTML);
				}else if(response.code==1){
					$("#uim_div").html("<td align='center' width='116px'>"+response.data+"</td>");
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	return {
		query:_query
	};
})();

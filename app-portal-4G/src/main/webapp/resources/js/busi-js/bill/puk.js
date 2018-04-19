/**
 * PUK码查询
 * 
 */
CommonUtils.regNamespace("bill", "puk");

bill.puk = (function(){
	var _queryPKU = function(){
		var areaId = $("#p_areaId").val();
		var phoneNumber = $.trim($("#phoneNumber").val());
		if(!/^\d{11}$/.test(phoneNumber)){
			$.alert("提示","请正确填写号码后再查询！");
			return;
		}
		var params = {
			prodSpecId:CONST.PROD_SPEC.CDMA,//产品规格
			accessNumber:phoneNumber,
			areaId:areaId
		};
		$.callServiceAsJson(contextPath+"/bill/queryPUK",params,{
			"before":function(){
				$("#puk_div").html("");
				$.ecOverlay("PUK码查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					var resHTML="";
					if(response.data.result&&response.data.result.attrList&&response.data.result.attrList.length>0){
						$(response.data.result.attrList).each(function(){
							resHTML+="<td align='right' width='116px'>"+this.attrName+"：</td><td align='left' class='orange' style='font-size:18px'>"+this.attrValue+"</td>";
						});
					}else{
						resHTML="<td align='center' width='116px'>没有查到PUK码信息！</td>";
					}
					$("#puk_div").html(resHTML);
				}else if(response.code==-2){
					$.alertM(response.data);
				}else if(response.code==1){
					$("#puk_div").html("<td align='center' width='116px'>"+response.data+"</td>");
				}else{
					$.alert("提示","PUK码查询异常");
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
		queryPKU:_queryPKU
	};
})();

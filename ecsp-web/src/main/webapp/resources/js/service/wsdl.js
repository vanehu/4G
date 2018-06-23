/**
 * @author 陈源龙
 */

var Wsdl = {};

Wsdl.f_query =function(){
	var url = $("#wsdl_url").val();
	var param = {url:url};
	$("#wsdl_operation").empty();
	$.mask();
	$.callServiceAsJson(contextPath + "/wsdl/wsdlQuery", param, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (data.code == "SM-0000") {
			    $.msgTip();
			    var list = data.list;
			    $("#wsdl_operation").append("<option value='0'>---请选择---</option>");
			    for(var i = 0; list!=null && i < list.length; i++){
			    	$("#wsdl_operation").append("<option>"+list[i]+"</option>");
			    }
			}else {
				$.msgTip("查询失败");
			}
		}
	}); 
}
Wsdl.f_select = function(){
	var param = {};
	param.url = $("#wsdl_url").val();
	param.name = $("#wsdl_operation").find("option:selected").text();
	if($("#wsdl_operation").val()=='0'){
		return;
	}
	$.mask();
	$.callServiceAsJson(contextPath + "/wsdl/optReqContent", param, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (data.code == "SM-0000") {
			   $.msgTip();
			   $("#wsdl_operation_selected").html(param.name);
			   $("#code_pre").html('<pre id="code_xml" class="brush: xml;"></pre><pre id="code_json" class="brush: js;"></pre>');
			   $("#code_xml").html(data.xml);
			   $("#code_xml").attr("class","brush: xml");
			   $("#code_json").html(data.json);
			   $("#code_json").attr("class","brush: js");
//			   SyntaxHighlighter.defaults['toolbar'] = true;
//			   SyntaxHighlighter.defaults['tab-size'] = 4;
			   SyntaxHighlighter.defaults['quick-code'] = false;
			   SyntaxHighlighter.highlight();
			}else {
				$.msgTip("查询失败");
			}
		}
	}); 
}
$(document).ready(function() {
	
});

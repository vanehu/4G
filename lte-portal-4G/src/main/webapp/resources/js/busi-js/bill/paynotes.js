/**
 * 押金管理
 * 
 * @author jiangrh
 */
CommonUtils.regNamespace("bill", "paynotesMgr");

bill.paynotesMgr = (function(){
	var _init = function(){

		$("#btn_paynotesQry").off("click").on("click",function(){_queryPayNotesList($("#bussType option:selected").val());});
	};
	var _chooseArea = function(){
		order.area.chooseAreaTree("bill/paynotestmain","p_areaId_val","p_areaId",3);
	};
	var _queryPayNotesList = function(num){
		var p_areaId=$("#p_areaId").val();
		var phoneNumber=$.trim($("#phoneNumber").val());
		var param ={
				"billingCycle":$("#billingCycle").val(),
				"areaCode":p_areaId,
				"phoneNumber":phoneNumber,
				"destinationAttr":$("#destinationAttr").val()
			};
		if($.trim(p_areaId)==""){
			$.alert("提示","请选择'地区'再查询");
			return;
		}
		if(!/^\d{11}$/.test(phoneNumber)){
			$.alert("提示","请正确填写号码后再查询");
			return;
		}
		var url = contextPath+"/bill/paynoteslist";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("充值缴费记录查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var content$=$("#paynoteslist");
				content$.show().addClass("pageright").removeClass("in out").addClass("out");
				setTimeout(function(){
					//$("#foregiftcontent").hide();
					content$.html(response.data).removeClass("cuberight in out").addClass("pop in");
					setTimeout(function(){
						content$.removeClass("pop in out");
					},500);
				},500);
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	return {
		init:_init,
		chooseArea:_chooseArea
	};
})();

//初始化
$(function(){
	bill.paynotesMgr.init();
});
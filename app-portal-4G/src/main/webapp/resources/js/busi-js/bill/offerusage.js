/**
 * 套餐余量查询
 * 
 * @author jiangrh
 */
CommonUtils.regNamespace("bill", "offerUsageMgr");

bill.offerUsageMgr = (function(){
	var _init = function(){

		$("#btn_offerUsageQry").off("click").on("click",function(){_queryOfferUsageList($("#bussType option:selected").val());});
	};
	var _queryOfferUsageList = function(num){
		var phoneNumber=$.trim($("#phoneNumber").val());
		if(!/^\d{11}$/.test(phoneNumber)){
			$.alert("提示","请正确填写号码后再查询");
			return;
		}
		var billingCycle;
		$(".billingCycle:checked").each(function(){
			billingCycle=$(this).val();
		});
		var param ={
				"billingCycle":billingCycle,
				"phoneNumber":phoneNumber
			};
		var url = contextPath+"/bill/offerusagelist";
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("套餐余量查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var content$=$("#offerUsagelist");
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
	var _changeTab=function(obj){
		var num=0;
		$(obj).parent().children("li").each(function(i,o){
			$(o).removeClass("setcon");
			if(obj==o){
				num=i;
			}
		});
		$(obj).addClass("setcon");
		$(".acct_tab").each(function(idx,otab){
			if(num==idx){
				$(otab).show();
			}else{
				$(otab).hide();
			}
		});
		
	};
	return {
		init:_init,
		changeTab:_changeTab
	};
})();

//初始化
$(function(){
	bill.offerUsageMgr.init();
});
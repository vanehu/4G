
CommonUtils.regNamespace("cart", "tfjcx");

/**
 * 停复机查询.
 */
cart.tfjcx = (function(){
	
	//查询
	var _queryCartList = function(pageIndex){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {
				"startDt":$("#p_startDt").val(),
				"endDt":$("#p_endDt").val(),
				"qryNumber":$.trim($("#p_qryNumber").val()),
				"boActionTypeCd":$("#p_boActionTypeCd").val(),
				nowPage:curPage,
				pageSize:10,
		};
		if(!$("#p_qryNumber").val()||$.trim($("#p_qryNumber").val())==""){
			$.alert("提示","请输入'接入号' 再查询");
			return ;
		}
		if(!CONST.MVNO_PHONE_HEAD.test($.trim($("#p_qryNumber").val()))){
			$.alert("提示","号码输入有误！");
		  	return;
		}
		if(!$("#p_startDt").val()||$("#p_startDt").val()==""){
			$.alert("提示","请选择'开始时间' 再查询");
			return ;
		}
		if(!$("#p_endDt").val()||$("#p_endDt").val()==""){
			$.alert("提示","请选择'结束时间' 再查询");
			return ;
		}
		$.callServiceAsHtmlGet(contextPath+"/report/tfjcxList",param,{
			"before":function(){
				$.ecOverlay("查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response.data && response.data.substring(0,6)!="<table"){
					$.alert("提示",response.data);
				}else{
					$("#cart_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	/*
	var _initDic = function(){
		var param = {"attrSpecCode":"EVT-0002"} ;
		$.callServiceAsJson(contextPath+"/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#p_busiStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
							$("#p_olStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
						}
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
	};
	*/
	
	return {
		queryCartList:_queryCartList
	};
	
})();
//初始化
$(function(){
	
	$("#bt_cartQry").off("click").on("click",function(){cart.tfjcx.queryCartList(1);});
	$("#p_startDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_startDt',maxDate:$("#p_endDt").val() });
	});
	$("#p_endDt").off("click").on("click",function(){
		$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_endDt',minDate:$("#p_startDt").val(),maxDate:'%y-%M-%d' });	
	});
	
});
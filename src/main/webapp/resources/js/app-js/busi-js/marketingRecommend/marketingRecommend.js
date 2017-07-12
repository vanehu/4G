
CommonUtils.regNamespace("marketingRecommend"); 

/**
 *资源释放
 */
marketingRecommend = (function(){
	
	var haveSearch = "N";
	
	var _init = function(){
		haveSearch = "N";
		$("#cust_name").text(OrderInfo.cust.partyName+"（"+OrderInfo.cust.accNbr+"）");
		if(OrderInfo.cust.accNbr == undefined || OrderInfo.cust.accNbr == ""){
			$.alert("提示","该客户无接入号");
			return;
		}
		queryMktCustList(1);
	}
	
	//营销推荐清单查询
	var queryMktCustList = function(curPage,scroller){
		var param = {
				"typeName":"终端推荐",
	            "objType": "3",
	            "objNbr":OrderInfo.cust.accNbr,
	            "pageIndex":curPage,
		        "pageSize":"5"
	        };
		$.callServiceAsHtmlGet(contextPath + "/app/marketingRecommend/queryMktCustList", param, {
        	"before":function(){
				$.ecOverlay("正在查询中，请稍后...");
			},
			"always":function(){
				$.unecOverlay();
			},
            "done": function(response) {
            	$.unecOverlay();
                if(response.code == 0) {
                	if(curPage == 1){
       	    		 $("#resList").html(response.data);
//   					$.refresh($("#phone-list"));
                	}else{
                		$("#res-list-all").append(response.data);
                	}
                	//回调刷新iscroll控制数据,控件要求
                	if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
                }else if (response.code == -2) {
                    $.alertM(response.data);
                    return;
                }else if(response.data!=""){
					$.alert("提示",response.data);
				}else{
                    $.alert("提示", "营销推荐清单查询服务调用失败!");
                    return;
                }
            },
            fail:function(response){
				$.unecOverlay();
				$.alert("提示","系统异常，请稍后再试！");
			}
        });
	}
	
	//营销标签查询服务
	var _queryProdInstStats = function(){
		if(OrderInfo.cust.accNbr == undefined || OrderInfo.cust.accNbr == ""){
			$.alert("提示","该客户无接入号");
			return;
		}
		if(haveSearch == "Y"){
			if($("#collapse01").hasClass("in")){
				$("#collapse01").removeClass("in");
				$("#res_list_wrapper").css("margin-top","0px")
			}else{
				$("#collapse01").addClass("in");
				$("#res_list_wrapper").css("margin-top",$("#collapse01").css("height")+"")
			}
		}else{
			var param = {
		            "attrType": "3",
		            "instId":OrderInfo.cust.accNbr
		        };
			$.callServiceAsJson(contextPath + "/app/marketingRecommend/queryProdInstStats", param, {
	        	"before":function(){
					$.ecOverlay("正在查询中，请稍后...");
				},
				"always":function(){
					$.unecOverlay();
				},
	            "done": function(response) {
	            	$.unecOverlay();
	                if(response.code == 0) {
	                	var stats = response.data.result.result.prodInstStats;
	                	for(var i=0;i<stats.length;i++){
	                		if(stats[i].statsAttrId=="2017050001"){
	                			var sa = stats[i].statsAttValue.split(".");
	                			if(sa[1].length==1 && sa[1]!="0") sa[1] = sa[1]+"0";
	                			stats[i].statsAttValue = sa[1]+"%";
	                		}
	                		$("#collapse01_p").append('<p class="font-white f-s-16">'+stats[i].attrName+'：'+stats[i].statsAttValue+'</p>');
	                	}
	                	haveSearch = "Y";
	                	$("#collapse01").addClass("in");
	                	$("#res_list_wrapper").css("margin-top",$("#collapse01").css("height")+"")
	                	
	                }else if (response.code == -2) {
	                    $.alertM(response.data);
	                    return;
	                }else if(response.data!=""){
						$.alert("提示",response.data);
					}else{
	                    $.alert("提示", "营销推荐清单查询服务调用失败!");
	                    return;
	                }
	            },
	            fail:function(response){
					$.unecOverlay();
					$.alert("提示","系统异常，请稍后再试！");
				}
	        });
		}
	}
	
	//营销任务（接触）反馈结果记录服务
	var _saveMktContactResult = function(mktmodelCode,targetObjNbr,resultNbr,activityId){
			var param = {
					"pushType":"3000",
		            "targetObjType": "3",
		            "mktmodelCode":mktmodelCode,
		            "targetObjType":"3",
		            "targetObjNbr":targetObjNbr,
		            "resultNbr":$("#"+resultNbr).val(),
		            "resultDes":$("#"+resultNbr).find("option:selected").text(),
		            "isContact":1,
		            "contactChlId":OrderInfo.staff.channelId,
		            "contactStaff":OrderInfo.staff.staffId,
		            "activityId":activityId
		        };
			$.callServiceAsJson(contextPath + "/app/marketingRecommend/saveMktContactResult", param, {
	        	"before":function(){
					$.ecOverlay("请稍后...");
				},
				"always":function(){
					$.unecOverlay();
				},
	            "done": function(response) {
	            	$.unecOverlay();
	                if(response.code == 0) {
	                	$("#btn_"+resultNbr).attr("disabled","disabled");
	                	$("#btn_"+resultNbr).text("已反馈");
	                }else if (response.code == -2) {
	                    $.alertM(response.data);
	                    return;
	                }else if(response.data!=""){
						$.alert("提示",response.data);
					}else{
	                    $.alert("提示", "反馈结果记录服务调用失败!");
	                    return;
	                }
	            },
	            fail:function(response){
					$.unecOverlay();
					$.alert("提示","系统异常，请稍后再试！");
				}
	        });
	}
	
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			queryMktCustList(scrollObj.page,scrollObj.scroll);
		}
	};
	
	return {
		init	:	_init,
		queryProdInstStats	:	_queryProdInstStats,
		saveMktContactResult	:	_saveMktContactResult,
		scroll		:	_scroll
	};
	
})();

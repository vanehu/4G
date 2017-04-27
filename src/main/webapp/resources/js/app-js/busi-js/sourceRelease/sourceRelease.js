
CommonUtils.regNamespace("sourceRelease"); 

/**
 *资源释放
 */
sourceRelease = (function(){
	
	var _init = function(){
	}
	
	//查询预占资源
	var _queryList = function(curPage,scroller){
		var flag = true;
		var param = {
	            "accNbrType": $("#cardType").val(),
	            "pageIndex":curPage,
	            "pageSize":"5"
	        };
		if($("#UIM_cardNumber").val().length>0){
			param.accNbr = $("#UIM_cardNumber").val();
		}else if($("#SJ_cardNumber").val().length>0){
			param.accNbr = $("#SJ_cardNumber").val();
		}else{
			param.beginDate = $("#p_startDt").val().replace("/","-").replace("/","-");
			param.endDate = $("#p_endDt").val().replace("/","-").replace("/","-");
			if(param.beginDate>param.endDate){
				$.alert("提示", "开始日期不能大于结束日期！");
				flag = false;
				return;
			}
		}
		if(flag){
			$.callServiceAsHtmlGet(contextPath + "/app/mktRes/phonenumber/queryReleaseNum", param, {
	            "before": function() {
	                $.ecOverlay("查询中，请稍等...");
	            },
	            "always": function() {
	                $.unecOverlay();
	            },
	            "done": function(response) {
	                if (response && response.code == 0) {
	                	$("#nav-tab-1").removeClass("active in");
	        	    	$("#nav-tab-2").addClass("active in");
	        	    	$("#tab1_li").removeClass("active");
	        	    	$("#tab2_li").addClass("active");
	        	    	if(curPage == 1){
	        	    		 $("#resList").html(response.data);
	    					$.refresh($("#phone-list"));
	    				}else{
	    					$("#res-list-all").append(response.data);
	    				}
	    				//回调刷新iscroll控制数据,控件要求
	    				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
	                    OrderInfo.order.step = 2;
	                } else {
	                	$.alert("提示", "查询失败，请稍后再试！");
	                    return;
	                }
	            },
	            fail: function(response) {
	                $.unecOverlay();
	                $.alert("提示", "系统异常，请稍后再试！");
	            }
	        });
		}
	}
	
	//释放预占资源
	var _release = function(numType,numValue) {
		var param = {
				"numType" : numType,
				"numValue" : numValue
		};
        $.callServiceAsJson(contextPath + "/app/mktRes/phonenumber/releaseErrorNum", param, {
        	"before":function(){
				$.ecOverlay("正在释放资源，请稍后...");
			},
//			"always":function(){
//				$.unecOverlay();
//			},
            "done": function(response) {
            	$.unecOverlay();
                if(response.code == 0) {
                	$.alert("提示", "释放成功！");
                	$("#"+numValue).remove();
                }else if (response.code == -2) {
                    $.alertM(response.data);
                    return;
                }else if(response.data!=""){
					$.alert("提示",response.data);
				}else{
                    $.alert("提示", "释放失败！");
                    return;
                }
            },
            fail:function(response){
				$.unecOverlay();
				$.alert("提示","系统异常，请稍后再试！");
			}
        });
    };
    
	var _changeType = function(type){
		$("#UIM_cardNumber").val("");
		$("#SJ_cardNumber").val("");
		if(type=="1"){
			$("#UIM_cardNumber").hide();
			$("#SJ_cardNumber").show();
		}else{
			$("#UIM_cardNumber").show();
			$("#SJ_cardNumber").hide();
		}
	}
	
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_queryList(scrollObj.page,scrollObj.scroll);
		}
	};
	
	return {
		init	:	_init,
		queryList	:	_queryList,
		changeType	:	_changeType,
		release		:	_release,
		scroll		:	_scroll
	};
	
})();

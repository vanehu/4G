
CommonUtils.regNamespace("order", "release");

/**
 * 异常单释放
 */
order.release = (function(){
	//页面初始化
	var _init = function(){
		
		$("#p_startTime").off("click").on("click",function(){
			$.calendar({ format:'yyyy-MM-dd ',real:'#p_startTime',maxDate:$("#p_endTime").val() });
		});
		$("#p_endTime").off("click").on("click",function(){
			$.calendar({ format:'yyyy-MM-dd ',real:'#p_endTime',minDate:$("#p_startTime").val() });
		});

		$("#numtype").find("option[value=1]").attr("selected","selected");
		$("#num").attr("placeHolder", "请输入有效的中国电信手机号");
		$("#num").attr("disabled", true);
		$("#p_startTime").attr("disabled", false);
		$("#p_endTime").attr("disabled", false);
		
		$("#accurate").change(function(){
			if($("#accurate").attr("checked")){
				$("#num").attr("disabled", false);
				$("#p_startTime").attr("disabled", true);
				$("#p_endTime").attr("disabled", true);
			}
			else{
				$("#num").attr("disabled", true);
				$("#p_startTime").attr("disabled", false);
				$("#p_endTime").attr("disabled", false);
			}
		});
		
		$("#numtype").change(function(){
			$("#num").val("");
			if($("#numtype").val()==1){
				$("#num").attr("placeHolder", "请输入有效的中国电信手机号");
			}
			else{
				$("#num").attr("placeHolder", "请输入有效的UIM卡号");
			}
		});
	};
	
	var queryParam = {};
	//查询待释放的号码资源
	var _queryReleaseNum = function(page){
		
		var _accNbrType = $("#numtype").val();
		var _pageIndex = 1;
		if(page>0){
			_pageIndex = page;
		}
		var _pageSize = 10;
		
		queryParam = {
				accNbrType : _accNbrType,
				pageIndex : _pageIndex,
				pageSize : _pageSize
		};
		
		if($("#accurate").attr("checked")){
			var _accNbr = $.trim($("#num").val());
			var check;
			if($("#numtype").val()==1){
				check = /^(180|189|133|134|153|181|108|170|177)\d{8}$/.test(_accNbr);
				if(check==false){
					$.alert("提示","若要进行精确查询，请输入有效的中国电信手机号");
					return;
				}			
			}
			else{
				check = /^[a-zA-Z0-9]{5,20}$/.test(_accNbr);
				if(check==false){
					$.alert("提示","若要进行精确查询，请输入有效的UIM卡号");
			        return;	
				}
			}
			queryParam.accNbr = _accNbr;
		}
		else{
			var _beginDate = $("#p_startTime").val();
			var _endDate = $("#p_endTime").val();
			if(_beginDate==""||_endDate==""){
				$.alert("提示","请先选择时间段再进行查询");
				return;
			}
			if(_beginDate.replace(/-/g,'')>_endDate.replace(/-/g,'')){
				$.alert("提示","开始时间不能晚于结束时间");
				return;
			}
			queryParam.beginDate = _beginDate;
			queryParam.endDate = _endDate;
		}				
		$.callServiceAsHtmlGet(contextPath+"/mktRes/phonenumber/queryReleaseNum", queryParam, {
			"before":function(){
				$.ecOverlay("号码查询中，请稍后...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(!response){
					response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
				}
				if(response.data =="fail\r\n"){
					$.alert("提示","查询失败，请稍后再试");
					return;
				}
				if(response.data =="error\r\n"){
					$.alert("提示","数据异常，请联系管理员");
					return;
				}
				$("#numlist").html(response.data).show();				
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//释放号码
	var _release = function(a){
		
		var _numType = $(a).attr("name");
		var _numValue = $(a).attr("id");
		
		var param = {
				numType : _numType,
				numValue : _numValue
		};
		
		$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param, {
			"before":function(){
				$.ecOverlay("正在释放号码，请稍后...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(response.code==0){
					if(_numType==1){
						$.alert("提示","成功释放号码："+_numValue);
					}
					else{
						$.alert("提示","成功释放UIM卡："+_numValue);
					}
					$.callServiceAsHtmlGet(contextPath+"/mktRes/phonenumber/queryReleaseNum", queryParam, {
						"done":function(response){
							if(!response){
								response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>no data return,please try reload.</strong></div>';					
							}
							if(response.data =="fail\r\n"){
								$.alert("提示","查询失败，请稍后再试");
								return;
							}
							if(response.data =="error\r\n"){
								$.alert("提示","数据异常，请联系管理员");
								return;
							}
							$("#numlist").html(response.data).show();				
						},
						fail:function(response){
							$.unecOverlay();
							$.alert("提示","请求可能发生异常，请稍后再试！");
						}
					});
				}
				else{
					if(response.code==-2){
						$.alertM(response.data);
					}
					if(response.data!=""){
						$.alert("提示",response.data);
					}
					else{
						$.alert("提示","号码释放失败，请稍后再试或联系管理员");
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
		
	return{
		init : _init,
		queryReleaseNum : _queryReleaseNum,
		release : _release
	};
	
})();

$(function(){
	order.release.init();
});
CommonUtils.regNamespace("cache", "main");

/**
 *刷缓存.
 */
cache.main = (function(){
	
	var _iplist = null;
	var _clearAllByArea = function(id,serviceName,type){
		_showIplist(id,serviceName);
		var list = cache.main.iplist[id];
		_clearAllByIpList(list,type);
	};
	var _clearAllByIpList = function(list,type){
		var _IntervalID = null;
		if(list.length==0){
			$.alert("提示","您未选择服务器，请先选择服务器后再刷新！");
			return;
		}		
		var param = {"list":list,"type":type};
		var purchaseUrl=contextPath+"/staff/cacheClear";
		$.callServiceAsJson(purchaseUrl, param, {
			"before":function(){
				_IntervalID=window.setInterval(
						function() {
							var par ={};
							$.callServiceAsJson(contextPath+"/staff/cacheClearSchedule", par, {
								"before":function(){
								},"always":function(){									
								},	
								"done" : function(response){									
									var resultlist =response.data.resultList;
									var content="";
									for(var i=0; i<resultlist.length; i++){
										content+="<tr><td><label>"+resultlist[i]+"</label></td></tr>";
									} 
									$("#clearInfo").html(content);
								},
								fail:function(response){
									$.alert("提示","请求可能发生异常，请稍后再试！");
								}
							});						
						}, 500);
			},"always":function(){
			},	
			"done" : function(response){			
				var resultlist =response.data.resultList;
				var content="";
				for(var i=0; i<resultlist.length; i++){
					content+="<tr><td><label>"+resultlist[i]+"</label></td></tr>";
				} 
				$("#clearInfo").html(content);
				window.clearInterval(_IntervalID);
				$.alert("提示",response.data.resultMsg);
			},
			fail:function(response){
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _showIplist = function(id,serviceName){
		$("#ipListTitle").text(serviceName);
		$("#ipListTitle").attr("areaCode",id);
		var list = cache.main.iplist[id];
		var content ="";
		if(list.length==0){
			content+="<tr><td width='50'></td><td>无本地区服务器信息</td></tr>";			
		}		
		for(var i=0; i<list.length; i++){
			content+="<tr><td width='50'><input name='iplist' type='checkbox' value='"+list[i]+"'/></td><td width='330'>"+list[i]+"</td></tr>";
		} 
		$("#ipListTbody").html(content);
		$("#ipListAllSelect").attr("checked", false);
		$("#ipListAllSelect").off("click").on("click",function(){  
	        if ($(this).attr("checked")) {  
	            $("#ipListTbody tr td input[name=iplist]").each(function() {  
	                $(this).attr("checked", true);  
	            });  
	        } else {  
	            $("#ipListTbody tr td input[name=iplist]").each(function() {  
	                $(this).attr("checked", false);  
	            });  
	        }  
	    });  
		$("#templateClear").off("click").on("click",function(){  
		        var list = new Array();  
		        $("#ipListTbody tr td input[name=iplist]").each(function() {  
		            if ($(this).attr("checked")) {  
		            	list.push($(this).val());  
		            }  
		        });
		        _clearAllByIpList(list,"template");
		    });  
		$("#jsClear").off("click").on("click",function(){  
	        var list = new Array();  
	        $("#ipListTbody tr td input[name=iplist]").each(function() {  
	            if ($(this).attr("checked")) {  
	            	list.push($(this).val());  
	            }  
	        });
	        _clearAllByIpList(list,"js");
	    });    
		$("#paramClear").off("click").on("click",function(){  
	        var list = new Array();  
	        $("#ipListTbody tr td input[name=iplist]").each(function() {  
	            if ($(this).attr("checked")) {  
	            	list.push($(this).val());  
	            }  
	        });
	        _clearAllByIpList(list,"param");
	    });  
		$("#clearInfo").html("<tr><td><label>暂无刷新信息！</label></td></tr>");
		easyDialog.open({
			container : 'cacheIpList'
		});
	};	
	return {
		iplist:_iplist,
		clearAllByArea:_clearAllByArea,
		showIplist:_showIplist,
		clearAllByIpList:_clearAllByIpList
	};
})();

$(function(){	
	var purchaseUrl=contextPath+"/staff/getIpList";
	$.callServiceAsJson(purchaseUrl, "", {
		"before":function(){
			$.ecOverlay("<strong>正在查询服务器列表,请稍等....</strong>");
		},"always":function(){
			$.unecOverlay();
		},	
		"done" : function(response){
			if (response.code == 0) {
				$.unecOverlay();
				var data = response.data;
				cache.main.iplist = data;
				$("#cacheClear .faster_ul_img").each(function(){
					var id = $(this).attr("id");
					var ipNum =id+"Num";
					var serviceName = $(this).parent().find("p").text();
					var obj=$(this);
					var serviceNum = data[ipNum];
					if(typeof(serviceNum)!= "undefined"){
						obj.find("span[class='num']").text(serviceNum);
						if(serviceNum>0){
							obj.find("a").find("img").off("click").on("click",function(){cache.main.showIplist(id,serviceName);});	
							if(id!="all"){
								obj.find("span[class='ref']").off("click").on("click",function(){cache.main.clearAllByArea(id,serviceName,"all");});										
							}else{
								var type = $(this).attr("type");
								obj.find("span[class='ref']").off("click").on("click",function(){cache.main.clearAllByArea(id,serviceName,type);});										
							}
						}else{
							obj.find("span[class='ref']").off("click").on("click",function(){$.alert("提示","该地区没有服务器，无法刷新!");});										
							obj.find("a").find("img").off("click").on("click",function(){$.alert("提示","该地区没有服务器，无法展示ip列表!");});	
						}
					}
				});
			}else{
				$.unecOverlay();
				$.alert("提示","查询服务器列表失败!");
			}
		},
		fail:function(response){
			$.unecOverlay();
			$.alert("提示","请求可能发生异常，请稍后再试！");
		}
	});		
});

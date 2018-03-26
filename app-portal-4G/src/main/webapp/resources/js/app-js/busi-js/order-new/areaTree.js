
CommonUtils.regNamespace("order", "area");

order.area = (function(){
	_initTree = function(){
		$.callServiceAsJson(contextPath + "/agent/orderQuery/area", {"areaType":"/app/order/prodoffer/prepare","areaLimit":""},{
			"before":function(){
				$.ecOverlay("地区加载中，请稍等...");
			},
			"done" : function(response){
//				$.unecOverlay();
				if(response && response.code==0){
					var result = response;
					if(result.data){
						var resData = result.data ;
						if(resData.errMsg){
							$.alert("提示",JSON.stringify(result.data));
						}else{
							if(resData.length<1){
								$.alert("提示","无地区数据");
							}else{
								$.each(resData, function (i, value) {
									_queryChildNode(i, this);
								});
							}
				 		}
					}else{
						if(typeof response == undefined){
							$.alert("提示","地区查询异常，可能原因服务停止或者数据解析异常");
						}else if (response.code == -2) {
							$.alert("提示",response.data);
						}else{
							var msg="";
							if(response.data!=undefined&&response.data.msg!=undefined){
								msg=response.data.msg;
							}else{
								msg="地区数据获取失败";
							}
							$.alert("提示","接口异常，可能原因:"+msg);
						}
					}
				}else{
					$.unecOverlay();
					$.alert("提示","接口异常，可能原因:"+response.mess);
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	};

	_queryChildNode = function(i, node){
		var treeList = '';
		if(i > 0 && node){
			var parentNodeId=node.commonRegionId;
			var parentNodeName = node.regionName;
			var parentId = node.parentId;
			var nodeLevel = node.areaLevel;
			var isChannelArea = node.isChannelArea;
			var parentNode=node;
			if(parentNodeId===null || parentNodeId===' ' || parentNodeId==='' ){//|| parentNodeName.indexOf("[受理渠道地区]")>0){
				return;
			}
			if(parentNode.children===null || parentNode.children===undefined){
				if(true){
					var params = {
							'leve': nodeLevel,
							'parentAreaId': parentNodeId,
							'areaType':'/app/order/prodoffer/prepare',
							"areaLimit":'',
							"isChannelArea":isChannelArea
					};
					$.callServiceAsJson(contextPath + "/orderQuery/commonRegionChilden", params,{
						"before":function(){
//							$.ecOverlay("正在努力加载中，请稍等...");
						},
						"done" : function(response){
							$.unecOverlay();
							if (response){
								var resData = response ;
								var list = resData.data ;
								if(list.length>0){
									var childrenNode=response.data;
									treeList += '<li><span>' + node.regionName + '</span><ul>'; 
									$.each(childrenNode, function (i, value) {
										treeList += '<li areaId="' + this.commonRegionId + '">' + this.regionName + '</li>'
									});
									treeList += '</ul></li>'; 
									$(".treelist").append(treeList);
									order.area.initAreaTree();
								}
							}
						},fail:function(response){
							$.unecOverlay();
							$.alert("提示","查询失败，请稍后再试！");
						}
					});
				}
			}	
		} else {
			$.unecOverlay();
			// 默认受理地区
			$("#defaultAreaName").val(node.regionName);
			treeList += '<li><span areaId="' + (node.commonRegionId).replace(/ch/, '') + '">' + node.regionName + '</span></li>';
			$(".treelist").append(treeList);
			order.area.initAreaTree();
		}
	};
	
	var _initAreaTree = function() {
		var i = Math.floor($('.treelist>li').length / 2);
		var j = Math.floor($('.treelist>li').eq(i).find('ul li').length / 2);  
		// Treelist demo initialization
		$('.treelist').mobiscroll().treelist({
			theme: "android-holo-light", // Specify theme like: theme: 'ios' or omit setting to use default 
			mode: "scroller", // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
			display: "bottom", // Specify display mode like: display: 'bottom' or omit setting to use default 
			lang: "zh", // Specify language like: lang: 'pl' or omit setting to use default 
			inputClass: "form-control",
			labels: ['省', '市'], // More info about labels: http://docs.mobiscroll.com/2-14-0/list#!opt-labels
			placeholder: $("#defaultAreaName").val(),
			defaultValue: [0,0],
			formatResult: function (array) { //返回自定义格式结果  
				var defaultArea = $('.treelist>li').eq(array[0]).children('span').attr("areaId");
				var areaId = $('.treelist>li').eq(array[0]).find('ul li').eq(array[1]).attr("areaId");
				if (ec.util.isObj(areaId)) {
					$("#p_cust_areaId").val(areaId);
				} else {
					$("#p_cust_areaId").val(defaultArea);
				}
				return $('.treelist>li').eq(array[0]).children('span').text() +' '+ $('.treelist>li').eq(array[0]).find('ul li').eq(array[1]).text().trim(' ');  
			}  

		});
	}
	
	return {
		initTree:_initTree,
		queryChildNode:_queryChildNode,
		initAreaTree:_initAreaTree
	};
	
})();


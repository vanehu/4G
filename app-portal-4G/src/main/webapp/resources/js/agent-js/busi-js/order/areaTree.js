
CommonUtils.regNamespace("order", "area");

order.area = (function(){
	_initTree = function(){
//		$.ecOverlay("地区加载中，请稍等...");
		var response = $.callServiceAsJson(contextPath + "/agent/orderQuery/area", {"areaType":"/app/order/prodoffer/prepare","areaLimit":""});
//		$.unecOverlay();
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
//							areaLevel: 3
//							commonRegionId: 8350000
//							isAllRegionFlag: "Y"
//							isChannelArea: "N"
//							parentId: "0"
//							regionCode: null
//							regionName: "福建省"
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
				$.alert("提示","接口异常，可能原因:"+response.mess);
			}
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
//			areaValSet(parentId,parentNodeName);
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
					var response = $.callServiceAsJson(contextPath + "/orderQuery/commonRegionChilden", params);
					if (response){
						var resData = response ;
						var list = resData.data ;
						if(list.length>0){
//							areaLevel: 4
//							commonRegionId: 8150600
//							isAllRegionFlag: "Y"
//							isChannelArea: "N"
//							parentId: "8150000"
//							regionCode: "0477"
//							regionName: "鄂尔多斯市"
							
							
							var childrenNode=response.data;
//							ztree.append(parentNode,childrenNode);
							treeList += '<li><span>' + node.regionName + '</span><ul>'; 
							$.each(childrenNode, function (i, value) {
								treeList += '<li areaId="' + this.commonRegionId + '">' + this.regionName + '</li>'
							});
							treeList += '</ul></li>'; 
							$(".treelist").append(treeList);
						}
					}
//					alert(_treeList);
//					$(".treelist").append(_treeList);
				}
			}	
		} else {
			// 默认受理地区
			$("#defaultAreaName").val(node.regionName);
			treeList += '<li><span areaId="' + (node.commonRegionId).replace(/ch/, '') + '">' + node.regionName + '</span></li>';
			$(".treelist").append(treeList);
		}
	};
	return {
		initTree:_initTree,
		queryChildNode:_queryChildNode
	};
	
})();


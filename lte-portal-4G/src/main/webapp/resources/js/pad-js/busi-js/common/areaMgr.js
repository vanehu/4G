/**
 *地区树选择
 */
CommonUtils.regNamespace("order.pad", "area");
order.pad.area = (function(){
	//首次初始化地区列表时,所输入参数用于后面取子节点判断
	var _area_param = {"areaType":"","areaId":"","areaName":"","areaLevel":3,"areaLimit":0}
	//获取查询类维度权限
	var _chooseAreaTreeManger = function(_areaType,_areaName,_areaId,_areaLevel,_areaLimit){
		_area_param.areaType = _areaType;
		_area_param.areaId = _areaId;
		_area_param.areaName = _areaName;
		_area_param.areaLevel = _areaLevel;
		_area_param.areaLimit = !_areaLimit?"":_areaLimit;
		_chooseAreaTreeMain(contextPath + '/orderQuery/areaTreeManger');
	};
	//获取业务类维度权限
	var _chooseAreaTree = function(_areaType,_areaName,_areaId,_areaLevel){
		_area_param.areaType = _areaType;
		_area_param.areaId = _areaId;
		_area_param.areaName = _areaName;
		_area_param.areaLevel = _areaLevel;
		_chooseAreaTreeMain(contextPath + '/orderQuery/area');
	};
	var _chooseAreaTreeMain = function(url){
		if(!login.windowpub.checkLogin()){
			return ;
		}
		
		$.callServiceAsJson(url , {"areaType":_area_param.areaType,"areaLeve":_area_param.areaLeve,"areaLimit":_area_param.areaLimit}, {
			"before":function(){
				$.ecOverlay("地区查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done": function(response){
				if(response && response.data && ec.util.getJSONValByKey(response,"code")==0){
					var data = response.data ;
					_showArea(data);
				}else{
					$.alertM(response.data);
				}
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//选择树中某一地区 ok 
	var _chooseArea = function(obj){
		var _this = $(obj);
		var _areaType = _area_param.areaType;
		var _isAllRegionFlag = _this.attr("isAllRegionFlag");
		var _regionCode = _this.attr("regionCode");
		var _areaId = _area_param.areaId;
		var _areaName = _area_param.areaName;
		var _areaNameVal = _this.attr("showAreaName");
		if(_isAllRegionFlag=="Y"){
			//余额查询/支取以及反销账，限制选择本地网，确保areaCode入参
			if(_areaType=="bill/preQueryBalance" || _areaType=="bill/prePayBalance" || _areaType=="bill/reversewriteoffcash"){
				if(!_regionCode || _regionCode==""){
					$.alert("提示", "请选择本地网（地市级）地区");
					return;
				}
			}
			var areaIdTemp = _this.attr("commonRegionId");
			areaIdTemp = (""+areaIdTemp).replace("ch","");
			$('#'+_areaId).val(areaIdTemp);
			$('#'+_areaId).attr("areaCode",_regionCode);
			var showAreaName= _this.attr("showAreaName");
			showAreaName = typeof showAreaName != undefined?showAreaName.replace("[受理渠道地区]","").replace("*",""):"请选择地区";
			$('#'+_areaName).val(showAreaName);
			$('#'+_areaName).attr("title",showAreaName);
			//
			OrderInfo.staff.soAreaId =areaIdTemp;
			OrderInfo.staff.soAreaCode =_regionCode;
			OrderInfo.staff.soAreaName=_areaNameVal;
			//产品通用查询页面更改地区时初始化查询条件
			if(_areaType=="prod/preProdQuery"){
				if(product.query.areaId!=$("#p_areaId").val()){
					if($("#custName").val()!="" || $("#num").val()!=""){
						$.alert("提示","地区已变更，请重新定位产品");
					}
					$("#prodList").html("");
					$("#custName").val("").attr("name", "");
					$("#num").val("");
					product.query.areaId = $("#p_areaId").val();	
				}
			}
			//帐户详情查询页面更改地区时初始化查询条件
			if(_areaType=="acct/preQueryAccount"){
				if(account.query.areaId!=$("#p_areaId").val()){
					if($("#custName").val()!="" || $("#num").val()!=""){
						$.alert("提示","地区已变更，请重新定位帐户");
					}
					$("#acctList").html("");
					$("#custName").val("").attr("name", "");
					$("#num").val("");
					account.query.areaId = $("#p_areaId").val();	
				}
			}
			$("#dlg-select-area").popup( "close" );
		}
	}
	//显示地区树 内部 ok
	var _showArea = function(data){
		var html = '';
		if(data && $.isArray(data) && data.length > 0){
			var showAreaName = "";
			for(var i=0;i<data.length;i++){			
			    showAreaName = data[i].regionName;
		    	if(data[i].isAllRegionFlag == 'Y'){
		    		html +='<ul data-role="listview"><li><a href="javascript:;" onclick="javascript:order.pad.area.chooseArea(this);" areaLevel="'
		    			+data[i].areaLevel+'" commonRegionId="'
		    			+data[i].commonRegionId+'" isAllRegionFlag="'
		    			+data[i].isAllRegionFlag+'" isChannelArea="'
		    			+data[i].isChannelArea+'" parentNodeId="'
		    			+data[i].parentNodeId+'" regionCode="'
		    			+data[i].regionCode+'" showAreaName="'
		    			+showAreaName+'" regionName="'
		    			+data[i].regionName+'" data-corners="false">'+data[i].regionName+'</a>';
		    			+'</li></ul>'
		    	}else{
		    		html+='<div data-role="collapsible" data-mini="true" data-corners="false">'
				        +'<h2 onclick="order.pad.area.getAreaChildren(this);" areaLevel="'
		    			+data[i].areaLevel+'" commonRegionId="'
		    			+data[i].commonRegionId+'" isAllRegionFlag="'
		    			+data[i].isAllRegionFlag+'" isChannelArea="'
		    			+data[i].isChannelArea+'" parentId="'
		    			+data[i].parentId+'" regionName="'
		    			+data[i].regionName+'" showAreaName="'
		    			+showAreaName+'" regionCode="'
		    			+data[i].regionCode+'">'+data[i].regionName+'</h2>'
				        +'<ul data-role="listview"></ul>'
				        +'</div>';
				}
			}		
		}else{
			html += '<ul data-role="listview"><li><a href="#" data-corners="false" >抱歉,没有找到相关地区信息.</a></li></ul>';
		}
		$("#dlg-select-area").find("div[data-role='content']").html(html).trigger('create');
		$("#dlg-select-area").popup("open");
	}
	//取子地区
	var _getAreaChildren = function(obj){
		var _this = $(obj);
		var collapsed = _this.parent().collapsible( "option", "collapsed" );
		if(_this && collapsed && !_area_param.cached){
			var parentNodeId=_this.attr("commonRegionId");
			var parentNodeName = _this.attr("regionName");
			var nodeLevel = _this.attr("areaLevel");
			var areaType = _area_param.areaType;
			var isChannelArea = _this.attr("isChannelArea");
			if(parentNodeId == 'undefined'){
				return;
			}
			if(nodeLevel <= _area_param.areaLevel){
				var params = {
					'leve': nodeLevel,
					'parentAreaId': parentNodeId,
					'areaType':areaType,
					"areaLimit":_area_param.areaLimit,
					"isChannelArea":isChannelArea
				};
				$.callServiceAsJson(contextPath + "/orderQuery/commonRegionChilden", params, {
					"before":function(){
						$.ecOverlay("地区查询中，请稍等...");
					},
					"always":function(){
						$.unecOverlay();
					},
					"done": function(response){
						var html ='';
						if(response && response.data && ec.util.getJSONValByKey(response,"code")==0 && $.isArray(response.data) && response.data.length > 0){
							var data = response.data;
							var showAreaName = _this.attr("showAreaName");
							showAreaName = typeof showAreaName=='undefined'?"":parentNodeName;
							var temp = "";
							for(var i=0;i<data.length;i++){			
								temp = showAreaName==''?data[i].regionName:showAreaName+ ' > '+data[i].regionName;
						    	if(data[i].isAllRegionFlag == 'Y'){
						    		html +='<li><a href="javascript:;" onclick="javascript:order.pad.area.chooseArea(this);" areaLevel="'
						    			+data[i].areaLevel+'" commonRegionId="'
						    			+data[i].commonRegionId+'" isAllRegionFlag="'
						    			+data[i].isAllRegionFlag+'" isChannelArea="'
						    			+data[i].isChannelArea+'" parentNodeId="'
						    			+data[i].parentNodeId+'" regionCode="'
						    			+data[i].regionCode+'" showAreaName="'
						    			+temp+'" regionName="'
						    			+data[i].regionName+'" data-corners="false">'+data[i].regionName+'</a></li>';
						    	}else{
						    		html+='<li><div data-role="collapsible" data-mini="true" data-corners="false">'
								        +'<h2 onclick="order.pad.area.getAreaChildren(this);" areaLevel="'
						    			+data[i].areaLevel+'" commonRegionId="'
						    			+data[i].commonRegionId+'" isAllRegionFlag="'
						    			+data[i].isAllRegionFlag+'" isChannelArea="'
						    			+data[i].isChannelArea+'" parentId="'
						    			+data[i].parentId+'" regionName="'
						    			+data[i].regionName+'" showAreaName="'
						    			+temp+'" regionCode="'
						    			+data[i].regionCode+'">'+data[i].regionName+'</h2>'
								        +'<ul data-role="listview"></ul>'
								        +'</div></li>';
								}
						    	temp = "";
							}
						}else{
							html += '<li><a href="#" data-corners="false">抱歉,没有找到相关地区信息.</a></li>';
						}
						_this.parent().find("ul").html(html).listview("refresh");
					}}
				);
			}
		}
	}
	//获取全部地区维度
	var _chooseAreaTreeAll = function(_areaName,_areaId,_areaLeve,_areaLimit){
		if(!login.windowpub.checkLogin()){
			return ;
		}
		var areaId = _areaId;
		var areaName = _areaName ;
		$.ligerDialog.open({
			width:350,
			height:350,
			title:'请选择地区',
			url:contextPath + '/orderQuery/areaTreeAll?areaLeve='+_areaLeve+"&areaLimit="+_areaLimit,
			buttons: [ { text: '确定', onclick: function (item, dialog) { 
						if(!ztree) {
							return;
						}
						var node=ztree.getSelected();
						if(node){
							if(node.data.isAllRegionFlag=="Y"){
								$('#'+areaId).val(node.data.commonRegionId);
								$('#'+areaId).attr("areaCode",node.data.regionCode);
								$('#'+areaName).val(areaNameVal);
								dialog.close();
							}else{
								alert("当前地区不可选！");
							}
						}else{
							alert("请选择地区！");
						}
					} },
			           { text: '取消', onclick: function (item, dialog) { dialog.close(); } } ] 	
		});
	};
	
	//获取计费功能地区维度与省份编码（原计费使用，已弃用）
	var _flatAreaPageDialog=null;
	var nameId;
	var valId;
	var _flatAreaPage = function(val_id,name_id){
		nameId=name_id;
		valId=val_id;
		_flatAreaPageDialog=$.ligerDialog.open({
			width:400,
			height:320,
			title:'请选择地区',
			url:contextPath + '/orderQuery/tree_flat',
			buttons: [ 
			   { text: '取消',onclick: function (item, dialog) { dialog.close(); } } ]
		});
	};
	var _areaChecked=function( val,name){
		if(_flatAreaPageDialog!=null){
			if(valId&&$("#"+valId)){
				$("#"+valId).val(val);
			}
			if(nameId&&$("#"+nameId)){
				$("#"+nameId).val(name);
			}
			_flatAreaPageDialog.close();
		}
	};
	
	return {
		areaChecked			: _areaChecked,
		flatAreaPage		: _flatAreaPage,
		chooseAreaTree		: _chooseAreaTree,
		chooseAreaTreeAll	: _chooseAreaTreeAll,
		chooseAreaTreeManger: _chooseAreaTreeManger,
		chooseArea			: _chooseArea,
		getAreaChildren		: _getAreaChildren
	};
	
})();


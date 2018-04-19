/**
 * 员工地区树加载
 * 
 * @author liusd
 */
CommonUtils.regNamespace("staff","area");

staff.area = (function(){
	
	/**********************根据地区ID加载地区树*************************/
	
	var _areaNodes = [];
	
	var _initAreaTree = function(){
		if(_areaNodes.length <= 0) {
			var param = {};
			$.callServiceAsJson(contextPath + "/staffMgr/getAreaByAreaId",param, {
				
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.code == 0) {
						if(response.data == "all") {
							staff.area.initAreaTreeAll();
						}else {
							_areaNodes = response.data;
							$.fn.zTree.init($("#areaTree"), _setting,response.data);
							var treeObj = $.fn.zTree.getZTreeObj("areaTree"); 
							treeObj.expandAll(true);
							var areaId = $("#areaId").val();
							if(areaId != "") {
								var node = treeObj.getNodeByParam("AREA_ID", areaId, null);
								treeObj.selectNode(node);
							}
						}
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}else {
			$.fn.zTree.init($("#areaTree"), _setting,_areaNodes);
			var treeObj = $.fn.zTree.getZTreeObj("areaTree"); 
			treeObj.expandAll(true);
			var areaId = $("#areaId").val();
			if(areaId != "") {
				var node = treeObj.getNodeByParam("AREA_ID", areaId, null);
				treeObj.selectNode(node);
			}
		}
	}
	
	var _onClick = function(event, treeId, treeNode) {
		var zTree = $.fn.zTree.getZTreeObj(treeId);
		//if(treeNode.isParent){
			//zTree.reAsyncChildNodes(treeNode, "refresh");
		//}else{
		if(treeNode.ifOption) {
			if(treeNode.ifOption != "1") {
				$("#areaId").val(treeNode.AREA_ID);
				$("#areaName").val(treeNode.NAME).blur();
			}
		}else {
			$("#areaId").val(treeNode.AREA_ID);
			$("#areaName").val(treeNode.NAME).blur();
		}
		//}
	};
	var _onDblClick = function(event, treeId, treeNode) {
		if(treeNode && !treeNode.isParent){
			$("#areaId").val(treeNode.AREA_ID);
			$("#areaName").val(treeNode.NAME).blur();
			_hideArea();
		}
	};
	var _showArea = function() {
		
		ec.form.dialog.createDialog({
			"id":"-current-area",
			"title":"选择归属地区",
			"width":630,
			"height":"250",
			"initCallBack":function(dialogForm,dialog){
				_initAreaTree();
				//var content = $("#areaContent").html();
				//$("#auth_range_info").html(content);
			},
			"submitCallBack":function(dialogForm,dialog){
				
			}
		});
		//var areaObj = $("#areaName");
		//var areaOffset = $("#areaName").offset();
		//$("#areaContent").css({left:areaOffset.left + "px", top:areaOffset.top + areaObj.outerHeight() + "px"}).slideDown("normal");
		//与输入框同宽 offsetWidth jquery为数组返回所以加[0]
		//$("#areaContent").width($("#areaName")[0].offsetWidth);
		//$("body").bind("mousedown", _onBodyDown);
	}
	var _hideArea = function() {
		$("#areaContent").slideUp("normal");
		$("body").unbind("mousedown", _onBodyDown);
	}
	var _onBodyDown = function(event) {
		if (!(event.target.id == "areaBtn" || event.target.id == "areaName" 
			|| event.target.id == "areaContent" 
			|| $(event.target).parents("#areaContent").length>0)) {
			_hideArea();
		}
	};
	var _setting = {
		view: {
			dblClickExpand: true,
			showLine: false,
			expandSpeed: "slow",
			selectedMulti: false,
			showIcon: true
		},
		data: {
			simpleData: {
				enable: true,
				idKey: "AREA_ID",
				pIdKey: "PARENT_AREA",
				rootPId: ""
			},
			key: {
				name: "NAME",
				ifOption:"ifOption"
			}
		},
		callback: {
			onClick: _onClick,
			onDblClick: _onDblClick
		}
	};
	
	
	/*********************加载全国*********************************/
	
	var _initAreaTreeAll = function(){
		$.fn.zTree.init($("#areaTree"), _settingAll);
	}
	//数据过虑处理
	var _dataFilter = function(treeId, parentNode, childNodes){
		if(childNodes){
			if(childNodes.code&&childNodes.code==1101){
//				$.Zebra_Dialog("会话过期,请重新的登陆.",{
//				    'type':     'warning',
//				    'title':    '提示',
//				    "animation_speed": 500,
//				    'buttons':  ['确定'],
//				    'auto_close': false,
//				    'overlay_opacity':0.5,
//				    'onClose':  function(caption) {
//				        window.self.location.href = contextPath+"/staff/login/logout";
//						return ;
//				    }
//				});
				login.windowpub.alertLoginWindow();
			}else{
				for(var i=0;l = childNodes.length,i < l;i++){
					childNodes[i].PARENT_AREA = ec.util.defaultStr(childNodes[i].PARENT_AREA);
					childNodes[i].isParent = childNodes[i].IS_PARENT=="1"?true:false;
				}
			}
		}
		return childNodes;
	}
	var _onClickAll = function(event, treeId, treeNode) {
		var zTree = $.fn.zTree.getZTreeObj(treeId);
		//if(treeNode.isParent){
		//zTree.reAsyncChildNodes(treeNode, "refresh");
		//}else{
		$("#areaId").val(treeNode.AREA_ID);
		$("#areaName").val(treeNode.NAME).blur();
		//}
	};
	var _onDblClickAll = function(event, treeId, treeNode) {
		if(treeNode && !treeNode.isParent){
			$("#areaId").val(treeNode.AREA_ID);
			$("#areaName").val(treeNode.NAME).blur();
			_hideAreaAll();
		}
	};
	var _showAreaAll = function() {
		var areaObj = $("#areaName");
		var areaOffset = $("#areaName").offset();
		$("#areaContent").css({left:areaOffset.left + "px", top:areaOffset.top + areaObj.outerHeight() + "px"}).slideDown("normal");
		//与输入框同宽 offsetWidth jquery为数组返回所以加[0]
		$("#areaContent").width($("#areaName")[0].offsetWidth);
		$("body").bind("mousedown", _onBodyDownAll);
	}
	var _hideAreaAll = function() {
		$("#areaContent").slideUp("normal");
		$("body").unbind("mousedown", _onBodyDownAll);
	}
	var _onBodyDownAll = function(event) {
		if (!(event.target.id == "areaBtn" || event.target.id == "areaName" 
			|| event.target.id == "areaContent" 
			|| $(event.target).parents("#areaContent").length>0)) {
			_hideAreaAll();
		}
	};
	var _settingAll = {
		view: {
			dblClickExpand: true,
			showLine: false,
			expandSpeed: "slow",
			selectedMulti: false,
			showIcon: true
		},
		async: {
			enable: true,
			type: "post",
			url: contextPath+"/staffMgr/getChildArea",
			autoParam:["AREA_ID=parentId"],
			dataFilter: _dataFilter
		},
		data: {
			simpleData: {
				enable: true,
				idKey: "AREA_ID",
				pIdKey: "PARENT_AREA",
				rootPId: ""
			},
			key: {
				name: "NAME"
			}
		},
		callback: {
			onClick: _onClickAll,
			onDblClick: _onDblClickAll
		}
	};
	return {
		showArea:_showArea,
		initAreaTree:_initAreaTree,
		showAreaAll:_showAreaAll,
		initAreaTreeAll:_initAreaTreeAll
	}
})();
$(function(){
	//staff.area.initAreaTree();
});


CommonUtils.regNamespace("order", "area");

var ztree=null;
var areaType = null ;
var areaNameVal = "" ;

/**
 *地区字典.
 */
order.area = (function(){
	
	//获取查询类维度权限
	var _chooseAreaTreeManger = function(_type,_areaName,_areaId,_areaLeve,_areaLimit){
		_chooseAreaTreeMain(_type,_areaName,_areaId,_areaLeve,contextPath + '/orderQuery/areaTreeManger',null,_areaLimit);
	};
	//获取业务类维度权限
	var _chooseAreaTree = function(_type,_areaName,_areaId,_areaLeve,callBackFun){
		_chooseAreaTreeMain(_type,_areaName,_areaId,_areaLeve,contextPath + '/orderQuery/areaTree',callBackFun);
	};
	//获取一卡双号查询维度权限
	var _chooseAreaTreeQueryManger = function(_type,_areaName,_areaId,_areaLeve,_areaLimit){
		_chooseAreaTreeMain(_type,_areaName,_areaId,_areaLeve,contextPath + '/orderQuery/areaTreeQueryManger',null,_areaLimit);
	};
	var _chooseAreaTreeMain = function(_type,_areaName,_areaId,_areaLeve,url,callBackFun,_areaLimit){
		if(!login.windowpub.checkLogin()){
			return ;
		}
		var areaId = _areaId;
		var areaName = _areaName ;
		var v_url = url + '?areaType='+_type+"&areaLeve="+_areaLeve+"&areaLimit="+_areaLimit;
		$.ligerDialog.open({
			width:350,
			height:350,
			title:'请选择地区(*不可选)',
			url:v_url,
			buttons: [ { text: '确定', onclick: function (item, dialog) { 
						if (!ztree) {
							//alert("无可选地区！");
							return;
						}
						var node=ztree.getSelected();
						if(node){
							if(node.data.isAllRegionFlag=="Y" ||_areaId == "p_password_areaId"){
								//余额查询/支取以及反销账，限制选择本地网，确保areaCode入参
								if(_type=="bill/preQueryBalance" || _type=="bill/prePayBalance" || _type=="bill/reversewriteoffcash"){
									if(!node.data.regionCode || node.data.regionCode==""){
										$.alert("提示", "请选择本地网（地市级）地区");
										return;
									}
								}
								var areaIdTemp = node.data.commonRegionId;
								areaIdTemp = (""+areaIdTemp).replace("ch","");
								$('#'+areaId).val(areaIdTemp);
								$('#'+areaId).attr("areaCode",node.data.regionCode);
								var areaNameVals=areaNameVal.split(">");
								if(areaNameVals.length>2){
									$('#'+areaName).val($.trim(areaNameVals[1])+" > "+$.trim(areaNameVals[2]));
								}else{
									$('#'+areaName).val(areaNameVal);
								}
								if(callBackFun){
									callBackFun(areaIdTemp,node.data.regionCode,areaNameVal);
								}
								dialog.close();
								obj=areaNameVal;
								//产品通用查询页面更改地区时初始化查询条件
								if(_type=="prod/preProdQuery"){
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
								if(_type=="acct/preQueryAccount"){
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
							}else{
								alert("当前地区不可选！");
								//alert("当前地区不可选！");
							}
						}else{
							alert("请选择地区！");
						}
					} },
			           { text: '取消', onclick: function (item, dialog) { dialog.close(); } } ] 	
		});
	};
	
	//获取全部地区维度
	var _chooseAreaTreeAll = function(_areaName,_areaId,_areaLeve,_areaLimit){
		if(_areaId!="p_password_areaId"){
			if(!login.windowpub.checkLogin()){
				return ;
			}
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
							if(node.data.isAllRegionFlag=="Y" ||_areaId == "p_password_areaId"){
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
	//获取制定地区(_currentAreaId)树
	var _chooseAreaTreeCurrent = function(_areaName,_areaId,_areaLeve,_areaLimit,_currentAreaId){
		if(!login.windowpub.checkLogin()){
			return ;
		}
		var areaId = _areaId;
		var areaName = _areaName ;
		$.ligerDialog.open({
			width:350,
			height:350,
			title:'请选择地区(*不可选)',
			url:contextPath + '/orderQuery/areaTreeAll?areaLeve='+_areaLeve+"&areaLimit="+_areaLimit+"&areaId="+_currentAreaId,
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
	var _dicInitEnd = function(){
		$.unecOverlay();
		$("#dic_mess").hide();
		//alert(111);
		$("#commonRegionTree").show();
	};
	
	return {
		areaChecked:_areaChecked,
		flatAreaPage:_flatAreaPage,
		chooseAreaTree:		_chooseAreaTree,
		chooseAreaTreeAll:	_chooseAreaTreeAll,
		chooseAreaTreeCurrent:	_chooseAreaTreeCurrent,//add by wd 2014/12/14  只 用于发展人选择 弹窗口中的地区选择  
		chooseAreaTreeManger:_chooseAreaTreeManger,
		dicInitEnd:_dicInitEnd,
		chooseAreaTreeQueryManger:_chooseAreaTreeQueryManger //用于一卡双号弹窗选择地区，可以选择全国省市
	};
	
})();


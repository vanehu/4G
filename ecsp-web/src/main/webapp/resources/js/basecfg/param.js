/**
 * @author 陈源龙
 */

/*global
	contextPath, initToggle
 */

var Param = {
	o_grid: null
};

Param.f_clear = function(){
	$("#param_add_page").find("input[type='text']").each(function(){
		$(this).val("");
	});
	$("#paramDesc").val("");
}

Param.f_add = function(){
	var params = {
		paramName:$("#paramName").val(),
		paramCode:$("#paramCode").val(),
		paramValue:$("#paramValue").val(),
		paramDesc:$("#paramDesc").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/param/paramAdd", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (data.code == "SM-0000") {
			    $.msgTip();
			    Param.f_clear();
			    var flag = $("#paramSaveOkClose").attr("checked");
			    if(flag){
			    	art.dialog.get("addSysParam").close();
			    }
				Param.o_grid.loadData();
			}else {
				
			}
		}
	}); 
}

Param.f_addDialog = function() {
	var myDialog = art.dialog({
		id:'addSysParam',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/param/paramAddPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#btnAddParamSave").click(function(){
	        	Param.f_add();
	        });
	        $("#btnAddParamCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};

Param.f_edit = function(data) {
	var params = {
		paramId:data.paramId,
		paramName:$("#paramName").val(),
		paramValue:$("#paramValue").val(),
		paramDesc:$("#paramDesc").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/param/paramEdit", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip();
			    art.dialog.get("editSysParam").close();
				Param.o_grid.loadData();
			}else {
				$.msgTip("修改失败");
			}
		}
	}); 
};


Param.f_editDialog = function() {
	var rowData = Param.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要修改的行！");
		return;
	}
	var myDialog = art.dialog({
		id:'editSysParam',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/param/paramEditPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#paramId").val(rowData.paramId);
	        $("#paramCode").val(rowData.paramCode);
	        $("#paramName").val(rowData.paramName);
	        $("#paramValue").val(rowData.paramValue);
	        $("#paramDesc").val(rowData.paramDesc);
	        $("#btnEditParamSave").click(function(){
	        	Param.f_edit(rowData);
	        });
	        $("#btnEditParamCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};


Param.f_del = function(data){
	var paramId = data.paramId;
	$.mask();
	$.callServiceAsJson(contextPath + "/param/paramDel", paramId, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip("删除成功！");
				Param.o_grid.deleteSelectedRow();
			}else {
				$.msgTip("删除失败！");
			}
		}
	}); 
}

Param.f_delDialog = function() {
	var rowData = Param.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要删除的行！");
		return;
	}
	$.ligerDialog.confirm("您确认要删除吗？", function(yes) {
		if (yes) {
			Param.f_del(rowData);
		}
	});
};


Param.f_query = function() {
	var params = [];
	Param.o_grid.set({parms: params});
	Param.o_grid.loadData();
};



$(document).ready(function() {
	//伸缩特效
	initToggle();
	if ($.ligerDefaults.GridString) {
		$.ligerDefaults.GridString.pageStatMessage = "每页{pagesize}条，总共{total}条。";
	}

	$("#toolbar").addClass("l-panel").css("margin-bottom", 0).toolBar({
		items: [
			{text: '新增', click: Param.f_addDialog, icon: 'add'},
			{text: '修改', click: Param.f_editDialog, icon: 'modify'},
			{text: '删除', click: Param.f_delDialog, icon: 'delete'}
		]
	});
	Param.o_grid = $("#maingrid").ligerGrid({
		headerRowHeight: 28,
		rowHeight: 28,
		detailColWidth: 53,
		checkbox: true,
		url: contextPath + '/param/paramQuery',
		height:370,
		columns: [
			{display: '参数ID', name: 'paramId', type: 'int', hide: true, isAllowHide: false},
		    {display: '参数名称', name: 'paramName'},
		    {display: '参数编码', name: 'paramCode'},
		    {display: '参数数值', name: 'paramValue'},
		    {display: '创建时间', name: 'addTime',width:150},
		    {display: '更新时间', name: 'updateTime',width:150},
		    {display: '参数描述', name: 'paramDesc',width:250}
		],
		onSelectRow:function(rowdata,rowindex){
			//单选
			var rows = this.getCheckedRows()
			for(var i=0;i<rows.length;i++){
				if(rows[i].__id != rowdata.__id){
					this.unselect(rows[i]);
				}
			}
		}
	});
	
	
//	$("#btQuery").click(Param.f_query);
});

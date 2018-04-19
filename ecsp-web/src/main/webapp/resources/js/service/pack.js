/**
 * @author 陈源龙
 */

/*global
	contextPath, initToggle
 */

var Pack = {
	o_grid: null
};

Pack.f_clear = function(){
	$("#pack_add_page").find("input[type='text']").each(function(){
		$(this).val("");
	});
	$("#packPath").val("");
}

Pack.f_add = function(){
	var params = {
		packName:$("#packName").val(),
		packCode:$("#packCode").val(),
		packPath:$("#packPath").val(),
		status:$("#status").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/pack/packAdd", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (data.code == "SM-0000") {
			    $.msgTip();
			    Pack.f_clear();
			    var flag = $("#packSaveOkClose").attr("checked");
			    if(flag){
			    	art.dialog.get("addPack").close();
			    }
				Pack.o_grid.loadData();
			}else {
				
			}
		}
	}); 
}

Pack.f_addDialog = function() {
	var myDialog = art.dialog({
		id:'addPack',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/pack/packAddPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#btnAddPackSave").click(function(){
	        	Pack.f_add();
	        });
	        $("#btnAddPackCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};

Pack.f_edit = function(data) {
	var params = {
		packId:data.packId,
		packName:$("#packName").val(),
		packPath:$("#packPath").val(),
		packCode:$("#packCode").val(),
		status:$("#status").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/pack/packEdit", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip();
			    art.dialog.get("editPack").close();
				Pack.o_grid.loadData();
			}else {
				$.msgTip("修改失败");
			}
		}
	}); 
};


Pack.f_editDialog = function() {
	var rowData = Pack.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要修改的行！");
		return;
	}
	var myDialog = art.dialog({
		id:'editPack',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/pack/packEditPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#packCode").val(rowData.packCode);
	        $("#packName").val(rowData.packName);
	        $("#packPath").val(rowData.packPath);
	        $("#status").val(rowData.status);
	        $("#btnEditPackSave").click(function(){
	        	Pack.f_edit(rowData);
	        });
	        $("#btnEditPackCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};


Pack.f_del = function(data){
	var packId = data.packId;
	$.mask();
	$.callServiceAsJson(contextPath + "/pack/packDel", packId, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip("删除成功！");
				Pack.o_grid.deleteSelectedRow();
			}else {
				$.msgTip("删除失败！");
			}
		}
	}); 
}

Pack.f_delDialog = function() {
	var rowData = Pack.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要删除的行！");
		return;
	}
	$.ligerDialog.confirm("您确认要删除吗？", function(yes) {
		if (yes) {
			Pack.f_del(rowData);
		}
	});
};




Pack.f_restartDialog = function() {
	var rowData = Pack.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要重启的包！");
		return;
	}
	var myDialog = art.dialog({
		id:'restartPack',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	
	jQuery.ajax({
	    url: contextPath + '/pack/packRestartPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $("#btnRestartPack").click(function(){
	        	Pack.f_restart(rowData);
	        });
	        $("#btnPackCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};


Pack.f_restart = function(data){
	var packCode = data.packCode;
	var baseUrl ="http://" + $("#addr_ip").val() + ":"+$("#addr_port").val();
	baseUrl += contextPath;;
	$.mask();
	$.callServiceAsJson(baseUrl + "/pack/packRestart", packCode, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip("重启成功！");
				Pack.o_grid.deleteSelectedRow();
			}else {
				$.msgTip("重启失败！");
			}
		}
	}); 
}


Pack.f_query = function() {
	var params = [];
	Pack.o_grid.set({parms: params});
	Pack.o_grid.loadData();
};



$(document).ready(function() {
	//伸缩特效
	initToggle();
	if ($.ligerDefaults.GridString) {
		$.ligerDefaults.GridString.pageStatMessage = "每页{pagesize}条，总共{total}条。";
	}

	$("#toolbar").addClass("l-panel").css("margin-bottom", 0).toolBar({
		items: [
			{text: '新增', click: Pack.f_addDialog, icon: 'add'},
			{text: '修改', click: Pack.f_editDialog, icon: 'modify'},
			{text: '删除', click: Pack.f_delDialog, icon: 'delete'},
			{text: '重启', click: Pack.f_restartDialog, icon: 'refresh'}
		]
	});
	Pack.o_grid = $("#maingrid").ligerGrid({
		headerRowHeight: 28,
		rowHeight: 28,
		detailColWidth: 53,
		checkbox: true,
		url: contextPath + '/pack/packQuery',
		height:370,
		columns: [
			{display: '服务包ID', name: 'packId', type: 'int', hide: true, isAllowHide: false},
		    {display: '服务包名称', name: 'packName'},
		    {display: '服务包编码', name: 'packCode'},
		    {display: '服务包路径', name: 'packPath'},
		    {display: '创建时间', name: 'creatTime',width:150},
		    {display: '更新时间', name: 'updateTime',width:150},
		    {display: '服务包状态', name: 'status',width:70}
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

});

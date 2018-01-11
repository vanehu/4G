/**
 * @author 陈源龙
 */

var IntfUrl = {
	o_grid: null
};

IntfUrl.f_clear = function(){
	$("#intfCode").val("");
	$("#intfUrl").val("");
	$("#intfDesc").val("");
	$("#intfName").val("");
}

IntfUrl.f_add = function(){
	var params = {
		intfCode:$("#intfCode").val(),
		intfUrl:$("#intfUrl").val(),
		intfName:$("#intfName").val(),
		intfDesc:$("#intfDesc").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/intf/intfAdd", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (data.code == "SM-0000") {
			    $.msgTip();
			    IntfUrl.f_clear();
			    var flag = $("#intfSaveOkClose").attr("checked");
			    if(flag){
			    	art.dialog.get("addIntfUrl").close();
			    }
				IntfUrl.o_grid.loadData();
			}else {
				$.msgTip("新增失败");
			}
		}
	}); 
}

IntfUrl.f_addDialog = function() {
	var myDialog = art.dialog({
		id:'addIntfUrl',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/intf/intfAddPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#btnAddIntfSave").click(function(){
	        	IntfUrl.f_add();
	        });
	        $("#btnAddIntfCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};

IntfUrl.f_edit = function(data) {
	var params = {
		intfId:data.intfId,
		intfDesc:$("#intfDesc").val(),
		intfName:$("#intfName").val(),
		intfUrl:$("#intfUrl").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/intf/intfEdit", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip();
			    art.dialog.get("editIntfUrl").close();
				IntfUrl.o_grid.loadData();
			}else {
				$.msgTip("修改失败");
			}
		}
	}); 
};


IntfUrl.f_editDialog = function() {
	var rowData = IntfUrl.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要修改的行！");
		return;
	}
	var myDialog = art.dialog({
		id:'editIntfUrl',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/intf/intfEditPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#intfCode").val(rowData.intfCode);
	        $("#intfUrl").val(rowData.intfUrl);
	        $("#intfDesc").val(rowData.intfDesc);
	        $("#btnEditIntfSave").click(function(){
	        	IntfUrl.f_edit(rowData);
	        });
	        $("#btnEditIntfCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};


IntfUrl.f_del = function(data){
	var intfId = data.intfId;
	$.mask();
	$.callServiceAsJson(contextPath + "/intf/intfDel", intfId, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip("删除成功！");
				IntfUrl.o_grid.deleteSelectedRow();
			}else {
				$.msgTip("删除失败！");
			}
		}
	}); 
}

IntfUrl.f_delDialog = function() {
	var rowData = IntfUrl.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要删除的行！");
		return;
	}
	$.ligerDialog.confirm("您确认要删除吗？", function(yes) {
		if (yes) {
			IntfUrl.f_del(rowData);
		}
	});
};


IntfUrl.f_init = function(){
	//伸缩特效
	initToggle();
	if ($.ligerDefaults.GridString) {
		$.ligerDefaults.GridString.pageStatMessage = "每页{pagesize}条，总共{total}条。";
	}

	$("#toolbar").addClass("l-panel").css("margin-bottom", 0).toolBar({
		items: [
			{text: '新增', click: IntfUrl.f_addDialog, icon: 'add'},
			{text: '修改', click: IntfUrl.f_editDialog, icon: 'modify'},
			{text: '删除', click: IntfUrl.f_delDialog, icon: 'delete'}
		]
	});
	IntfUrl.o_grid = $("#maingrid").ligerGrid({
		headerRowHeight: 28,
		rowHeight: 28,
		detailColWidth: 53,
		checkbox: true,
		url: contextPath + '/intf/intfQuery',
		height:370,
		columns: [
			{display: '接口地址序号', name: 'intfUrlId', type: 'int', hide: true, isAllowHide: false},
		    {display: '编码', name: 'intfCode'},
		    {display: '名称', name: 'intfName'},
		    {display: '接口地址', name: 'intfUrl',width:'450'},
		    {display: '描述', name: 'intfDesc',minColumnWidth:'150'}
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
}

$(document).ready(function() {
	IntfUrl.f_init();
});

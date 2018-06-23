/**
 * @author 陈源龙
 */

var Role = {
	o_grid: null
};

Role.f_clear = function(){
	$("#role_add_page").find("input[type='text']").each(function(){
		$(this).val("");
	});
}

Role.f_add = function(){
	var params = {
		roleCode:$("#roleCode").val(),
		roleName:$("#roleName").val(),
		usePortal:$("#usePortal").val(),
		status:$("#status").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/role/roleAdd", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (data.code == "SM-0000") {
			    $.msgTip();
			    Role.f_clear();
			    var flag = $("#roleSaveOkClose").attr("checked");
			    if(flag){
			    	art.dialog.get("addRole").close();
			    }
				Role.o_grid.loadData();
			}else {
				$.msgTip("新增失败");
			}
		}
	}); 
}

Role.f_addDialog = function() {
	var myDialog = art.dialog({
		id:'addRole',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/role/roleAddPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#btnAddRoleSave").click(function(){
	        	Role.f_add();
	        });
	        $("#btnAddRoleCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};

Role.f_edit = function(data) {
	var params = {
		roleId:data.roleId,
		roleName:$("#roleName").val(),
		usePortal:$("#usePortal").val(),
		status:$("#status").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/role/roleEdit", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip();
			    art.dialog.get("editRole").close();
				Role.o_grid.loadData();
			}else {
				$.msgTip("修改失败");
			}
		}
	}); 
};


Role.f_editDialog = function() {
	var rowData = Role.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要修改的行！");
		return;
	}
	var myDialog = art.dialog({
		id:'editRole',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/role/roleEditPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#roleCode").val(rowData.roleCode);
	        $("#roleName").val(rowData.roleName);
	        $("#usePortal").val(rowData.usePortal);
	        $("#status").val(rowData.status);
	        $("#btnEditRoleSave").click(function(){
	        	Role.f_edit(rowData);
	        });
	        $("#btnEditRoleCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};


Role.f_del = function(data){
	var roleId = data.roleId;
	$.mask();
	$.callServiceAsJson(contextPath + "/role/roleDel", roleId, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip("删除成功！");
				Role.o_grid.deleteSelectedRow();
			}else {
				$.msgTip("删除失败！");
			}
		}
	}); 
}

Role.f_delDialog = function() {
	var rowData = Role.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要删除的行！");
		return;
	}
	$.ligerDialog.confirm("您确认要删除吗？", function(yes) {
		if (yes) {
			Role.f_del(rowData);
		}
	});
};


Role.f_query = function() {
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
			{text: '新增', click: Role.f_addDialog, icon: 'add'},
			{text: '修改', click: Role.f_editDialog, icon: 'modify'},
			{text: '删除', click: Role.f_delDialog, icon: 'delete'}
		]
	});
	Role.o_grid = $("#maingrid").ligerGrid({
		headerRowHeight: 28,
		rowHeight: 28,
		detailColWidth: 53,
		checkbox: true,
		url: contextPath + '/role/roleQuery',
		height:370,
		columns: [
			{display: '角色序号', name: 'roleId', type: 'int', hide: true, isAllowHide: false},
		    {display: '角色名称', name: 'roleName'},
		    {display: '角色编码', name: 'roleCode'},
		    {display: '平台编码', name: 'usePortal'},
		    {display: '创建时间', name: 'creatTime',width:150},
		    {display: '角色状态', name: 'status'}
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

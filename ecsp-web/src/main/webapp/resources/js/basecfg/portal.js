/**
 * @author 陈源龙
 */

var Portal = {
	o_grid: null
};

Portal.f_clear = function(){
	$("#portal_add_page").find("input[type='text']").each(function(){
		$(this).val("");
	});
}

Portal.f_add = function(){
	var params = {
		portalName:$("#portalName").val(),
		portalCode:$("#portalCode").val(),
		password:$("#password").val(),
		status:$("#status").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/portal/portalAdd", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (data.code == "SM-0000") {
			    $.msgTip();
			    Portal.f_clear();
			    var flag = $("#portalSaveOkClose").attr("checked");
			    if(flag){
			    	art.dialog.get("addPortal").close();
			    }
				Portal.o_grid.loadData();
			}else {
				$.msgTip("新增失败");
			}
		}
	}); 
}

Portal.f_addDialog = function() {
	var myDialog = art.dialog({
		id:'addPortal',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/portal/portalAddPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#btnAddPortalSave").click(function(){
	        	Portal.f_add();
	        });
	        $("#btnAddPortalCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};

Portal.f_edit = function(data) {
	var params = {
		portalId:data.portalId,
		portalName:$("#portalName").val(),
		password:$("#password").val(),
		status:$("#status").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/portal/portalEdit", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip();
			    art.dialog.get("editPortal").close();
				Portal.o_grid.loadData();
			}else {
				$.msgTip("修改失败");
			}
		}
	}); 
};


Portal.f_editDialog = function() {
	var rowData = Portal.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要修改的行！");
		return;
	}
	var myDialog = art.dialog({
		id:'editPortal',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/portal/portalEditPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#portalCode").val(rowData.portalCode);
	        $("#portalName").val(rowData.portalName);
	        $("#password").val(rowData.password);
	        $("#status").val(rowData.status);
	        $("#btnEditPortalSave").click(function(){
	        	Portal.f_edit(rowData);
	        });
	        $("#btnEditPortalCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};


Portal.f_del = function(data){
	var portalId = data.portalId;
	$.mask();
	$.callServiceAsJson(contextPath + "/portal/portalDel", portalId, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip("删除成功！");
				Portal.o_grid.deleteSelectedRow();
			}else {
				$.msgTip("删除失败！");
			}
		}
	}); 
}

Portal.f_delDialog = function() {
	var rowData = Portal.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要删除的行！");
		return;
	}
	$.ligerDialog.confirm("您确认要删除吗？", function(yes) {
		if (yes) {
			Portal.f_del(rowData);
		}
	});
};


Portal.f_query = function() {
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
			{text: '新增', click: Portal.f_addDialog, icon: 'add'},
			{text: '修改', click: Portal.f_editDialog, icon: 'modify'},
			{text: '删除', click: Portal.f_delDialog, icon: 'delete'}
		]
	});
	Portal.o_grid = $("#maingrid").ligerGrid({
		headerRowHeight: 28,
		rowHeight: 28,
		detailColWidth: 53,
		checkbox: true,
		url: contextPath + '/portal/portalQuery',
		height:370,
		columns: [
			{display: '平台序号', name: 'portalId', type: 'int', hide: true, isAllowHide: false},
		    {display: '平台名称', name: 'portalName'},
		    {display: '平台编码', name: 'portalCode'},
		    {display: '平台密码', name: 'password'},
		    {display: '创建时间', name: 'creatTime',width:150},
		    {display: '平台状态', name: 'status'}
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

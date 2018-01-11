/**
 * @author 陈源龙
 */

var Service = {
	o_grid: null,
	o_roleList:null
};

Service.f_clear = function(){
	$("#serviceCode").val("");
	$("#serviceUrl").val("");
	$("#serviceDesc").val("");
	$("#serviceName").val("");
}

Service.f_add = function(){
	var params = {
		serviceName:$("#add_serviceName").val(),
		classPath:$("#add_classPath").val(),
		visitType:$("#add_visitType").val(),
		serviceCode:$("#add_serviceCode").val(),
		intfId:$("#add_intfId").val(),
		methodName:$("#add_methodName").val(),
		packId:$("#add_packId").val(),
		status:$("#add_status").val(),
		outParamType:$("#add_outParamType").val(),
		roleIds:$("#selRoleListVal").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/service/serviceAdd", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (data.code == "SM-0000") {
			    $.msgTip();
			    Service.f_clear();
			    var flag = $("#serviceSaveOkClose").attr("checked");
			    if(flag){
			    	art.dialog.get("addService").close();
			    }
				Service.o_grid.loadData();
			}else {
				$.msgTip("新增失败");
			}
		}
	}); 
}

Service.f_addDialog = function() {
	var myDialog = art.dialog({
		id:'addService',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/service/serviceAddPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#btnAddServiceSave").click(function(){
	        	Service.f_add();
	        });
	        $("#btnAddServiceCancle").click(function(){
	        	myDialog.close();
	        });
	        $("#selRoleListVal").remove();
	        $.ligerui.remove("selRoleList");//先执行销毁，不然会报，管理器id已经存在
	        $("#selRoleList").ligerComboBox({ 
	        	isShowCheckBox: true, 
	        	isMultiSelect: true,
                valueFieldID: 'selRoleListVal',
                data:Service.o_roleList
            }); 
	    }
	});
};



Service.f_edit = function(data) {
	var params = {
		serviceId:data.serviceId,
		serviceDesc:$("#serviceDesc").val(),
		serviceName:$("#serviceName").val(),
		serviceUrl:$("#serviceUrl").val()
	}
    $.mask();
	$.callServiceAsJson(contextPath + "/service/serviceEdit", params, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip();
			    art.dialog.get("editService").close();
				Service.o_grid.loadData();
			}else {
				$.msgTip("修改失败");
			}
		}
	}); 
};


Service.f_editDialog = function() {
	var rowData = Service.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要修改的行！");
		return;
	}
	var myDialog = art.dialog({
		id:'editService',
		lock:true,
		opacity:0.5,
		padding:'15px 5px'
	});
	jQuery.ajax({
	    url: contextPath + '/service/serviceEditPage',
	    success: function (data) {
	        myDialog.content(data);// 填充对话框内容
	        $(".aui_content").css("width","");
	        $("#serviceCode").val(rowData.serviceCode);
	        $("#serviceUrl").val(rowData.serviceUrl);
	        $("#serviceDesc").val(rowData.serviceDesc);
	        $("#btnEditIntfSave").click(function(){
	        	Service.f_edit(rowData);
	        });
	        $("#btnEditIntfCancle").click(function(){
	        	myDialog.close();
	        });
	    }
	});
};


Service.f_del = function(data){
	var serviceId = data.serviceId;
	$.mask();
	$.callServiceAsJson(contextPath + "/service/serviceDel", serviceId, {
		callback:function(response){
			$.unmask();
			var data = response.result;
			if (!!data && data.code == "SM-0000") {
			    $.msgTip("删除成功！");
				Service.o_grid.deleteSelectedRow();
			}else {
				$.msgTip("删除失败！");
			}
		}
	}); 
}

Service.f_delDialog = function() {
	var rowData = Service.o_grid.getSelectedRow();
	if(rowData==null){
		$.ligerDialog.warn("您未进行选择，请选择要删除的行！");
		return;
	}
	$.ligerDialog.confirm("您确认要删除吗？", function(yes) {
		if (yes) {
			Service.f_del(rowData);
		}
	});
};

Service.f_viewDetail = function(row){
	$("#serviceName").html(row.serviceName);
	$("#packName").html(row.packName);
	$("#classPath").html(row.classPath);
	$("#packCode").html(row.packCode);
	$("#packPath").html(row.packPath);
	$("#outParamType").html(row.outParamType);
	$("#intfName").html(row.intfName);
	$("#intfUrl").html(row.intfUrl);
	var roleName = "";
	for(var i = 0; i<row.serviceRoles.length; i++){
		roleName += row.serviceRoles[i].roleName + "  ";
	}
	$("#roleName").html(roleName);
//	$("#").html(row.); 
//	$("#").html(row.);
//	$("#").html(row.);
//	$("#").html(row.);
//	$("#").html(row.);
//	$("#").html(row.);
//	$("#").html(row.);
}

Service.f_init = function(){
	//伸缩特效
	initToggle();
	if ($.ligerDefaults.GridString) {
		$.ligerDefaults.GridString.pageStatMessage = "每页{pagesize}条，总共{total}条。";
	}

	$("#toolbar").addClass("l-panel").css("margin-bottom", 0).toolBar({
		items: [
			{text: '新增', click: Service.f_addDialog, icon: 'add'},
			{text: '修改', click: Service.f_editDialog, icon: 'modify'},
			{text: '删除', click: Service.f_delDialog, icon: 'delete'}
		]
	});
	Service.o_grid = $("#maingrid").ligerGrid({
		headerRowHeight: 28,
		rowHeight: 28,
		detailColWidth: 53,
		checkbox: true,
		url: contextPath + '/service/serviceQuery',
		height:370,
		columns: [
			{display: '序号', name: 'serviceId', type: 'int', hide: true, isAllowHide: false},
		    {display: '服务编码', name: 'serviceCode'},
		    {display: '服务名称', name: 'serviceName'},
		    {display: '接口名称', name: 'methodName'},
		    {display: '创建时间', name: 'creatTime',width:'150'},
		    {display: '服务状态', name: 'status',width:'70',render: function(row) {
				if (row.status == 'A') {
					return "在用";
				} else {
					return "停用";
				}
			}},
			{display: '访问方式', name: 'visitType',width:'70',render: function(row) {
				if (row.visitType == 'G') {
					return "通用";
				} else {
					return "定义";
				}
			}}
		],
		onSelectRow:function(rowdata,rowindex){
			//单选
			var rows = this.getCheckedRows()
			for(var i=0;i<rows.length;i++){
				if(rows[i].__id != rowdata.__id){
					this.unselect(rows[i]);
				}
			}
			Service.f_viewDetail(rowdata);
		}
	});
}

$(document).ready(function() {
	Service.f_init();
});

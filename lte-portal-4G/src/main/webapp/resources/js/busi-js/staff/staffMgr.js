/**
 * 员工管理
 * 
 * @author liusd
 */
CommonUtils.regNamespace("staff","info");
var curtPageNum = 1;
staff.info = (function(){
	var _staffData = {};
	
	var _putChangeData = function(obj){
		_staffData = obj;
	};
	var _getChangeData = function(){
		return _staffData;
	};
	
	//绑定验证
	var _initFormValidate = function(){
		
		//归属渠道
		$("#channelSelect").off("click").on("click",function(){
			var data = $("#channelId").val();
			_queryAuthRange("选择归属渠道","channel","1",data);
		});
		//管理渠道
		$("#rangeChannelSelect").off("click").on("click",function(){
			var data = $("#rangeChannelId").val();
			_queryAuthRange("选择受理渠道","channel","2",data);
		});
		//归属地区
		$("#areaBtn").off("click").on("click",function(){
			var data = $("#areaId").val();
			_queryAuthRange("选择归属地区","area","1",data);
		});
		//管理地区
		$("#rangeAreaBtn").off("click").on("click",function(){
			var data = $("#rangeAreaId").val();
			_queryAuthRange("选择管理地区","area","2",data);
		});
		//归属角色
		$("#rolesSelect").off("click").on("click",function(){
			var data = $("#postRoleIds").val();
			_queryAuthRange("选择归属角色","role","1",data);
		});
		//管理角色
		$("#rangeRolesSelect").off("click").on("click",function(){
			var data = $("#rangePostRoleIds").val();
			_queryAuthRange("选择管理角色","role","2",data);
		});
						
		//密码修改
		$('#staffPwdForm').on('formIsValid',function(event,form){
			$("#msg").html("");//先清空之前的错误信息
			$("#msg").hide();
			var _oldPwd = $("#password").val();
			_oldPwd = MD5(_oldPwd);		
			var _newPwd = $("#newPassword").val();
			_newPwd = MD5(_newPwd);
			var param = {
					oldPwd : _oldPwd,
					newPwd : _newPwd,
					actionType : "UPDATE"
			};
			$.callServiceAsJson(contextPath + "/staffMgr/staffPwd", param, {
				"before":function(){
					$.ecOverlay("数据提交中,请稍等...");
					ec.util.hideMsg("msg");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if (response.code == 0) {
						$.confirm("信息","密码修改成功，您需要重新登录！",
								{yes:function(){
									if(_getCookie('_session_pad_flag')!='1'){//表示客户端登录
										ec.util.back("/staff/login/logout");
									}else{
										var arr=[];
										MyPlugin.goLogin(arr,
								            function(result) {
								            },
								            function(error) {
								            }
										);
									}
								},no:""});
					}
					else if(response.code == -2){
						$.alertM(response.data);
					}
					else{
						$("#msg").show();
						ec.util.showMsg("msg", response.data);
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}).ketchup({
			bindElement:"btn_staffPwd_submit"
		});
		//密码重置
		$('#pwdResetForm').on('formIsValid',function(event,form){

			var param = {
					"staffCode" : $("#staffCode").val(),
					"actionType" : "RESET"
					};
			$.callServiceAsJson(contextPath + "/staffMgr/staffPwd",param, {
				"before":function(){
					$.ecOverlay("数据提交中,请稍等...");
					ec.util.hideMsg("msg");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if (response.code == 0) {
						$.alert("提示","密码重置成功");
					} else {
						$.alert("提示","密码重置失败，请稍后重试或确认工号是否存在");
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}).ketchup({
			bindElement:"btn_reset_pwd"
		});
		
		//员工信息修改提交
		$('#staffUpdateForm').on('formIsValid',function(event,form){
			var param;
			try{
				param = _buildStaffInParam("Update");
			}catch(error){
				$.alert("提示","内部错误，请联系管理员");
				return;
			}
			$.callServiceAsJson(contextPath + "/staffMgr/updateStaff",param, {
				"before":function(){
					$.ecOverlay("数据提交中,请稍等...");
					ec.util.hideMsg("update_msg");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if (response.code == 0) {
						ec.util.showMsg("update_msg","信息修改成功.");
						$("#btn_staff_update").attr("class","btna_g").off("click");
					} else {
						ec.util.showMsg("update_msg","信息修改失败，请稍后再试.");
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}).ketchup( {
			bindElement:"btn_staff_update"
		});
		//员工信息新增提交
		$('#staffAddForm').on('formIsValid',function(event,form){
			var param;
			try{
				param = _buildStaffInParam("Add");
			}catch(error){
				$.alert("提示","内部错误，请联系管理员");
				return;
			}
			$.callServiceAsJson(contextPath + "/staffMgr/addStaff",param, {
				"before":function(){
					$.ecOverlay("数据提交中,请稍等...");
					ec.util.hideMsg("add_msg");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if (response.code == 0) {
						ec.util.showMsg("add_msg","员工添加成功.");
						$("#btn_staff_add").attr("class","btna_g").off("click");
					} else if (response.code == 1) {
						ec.util.showMsg("add_msg",response.data);
					}else {
						ec.util.showMsg("add_msg","员工添加失败，请稍后再试.");
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}).ketchup( {
			bindElement:"btn_staff_add"
		});
		//角色查询
//		$("#rolesSelect").on("click",function(){
//			_queryRoles();
//		});
		//渠道查询
//		$("#channelSelect").on("click",function(){
//			var channelId = $("#curtChannelId").val();
//			_queryChildChannel(channelId,staff.info.curtPageNum);
//		});
		//员工查询
		$("#btn_staff_query").off("click").on("click",function(event){
			var param = {"staffCode":$("#input_tip").val()};
			$.callServiceAsHtmlGet(contextPath+"/staffMgr/list",param,{
				"before":function(){
					$.ecOverlay("人员查询中，请稍等...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(!response){
						 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
					}
					var content$=$("#staff_list");
					content$.show();
					content$.html(response.data);
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		});
		//地区事件
		$("#areaBtn2").on("click",function(){
			staff.area.showArea();
		});
		$("#input_tip").off("keypress").on("keypress",function(e) {
			var k = e.keyCode || e.which; 
			if (k == 13) {
				$("#btn_staff_query").click();
			}
		});
		
		
		//申请进度查询事件
		$("#btn_staff_apply_query").off("click").on("click",function(event){
			_realCheckParam();
			_queryStaffApply(1);
		});
		
//		//审核查询事件
		$("#btn_staff_check_query").off("click").on("click",function(event){
			_realCheckParam();
			_queryStaffCheck(1);
		});
		//清空事件
		$("#btn_reset").off("click").on("click",function(){
			$("#beginTime").val("");
			$("#endTime").val("");
			$("#begin_h_time").val("");
			$("#begin_r_time").val("");
			$("#end_h_time").val("");
			$("#end_r_time").val("");
			$("#areaName").val("");
			$("#areaCode").val("");
			$("#provinceId").val("");
			$("#areaId").val("");
			$("#areaId_h").val("");
			$("#status").val("");
			$("#status_h").val("");
			$("#batchNo").val("");
			$("#batchNo_h").val("");
			$("#staffCode").val("");
			$("#staffCode_h").val("");
			$("#channelName").val("");
			$("#channelId").val("");
			$("#channelId_h").val("");
		});
		
		//新增渠道IP关系
		$("#doChannelIpSubmit").off("click").on("click",function(){
			var ips = $.trim($("#ips").val());
			if(ips == "") {
				$.alert("提示","绑定IP不能为空");
				return;
			}
			var ipType = $("#ipType").val();
			var ipTypeName = $("#ipType option:selected").text();
			var channelId = $("#channelId").val();
			var channelName = $("#channelName").val();
			var desc = "渠道"+channelName+"对应"+ipTypeName;
			var param = {"ipType":ipType,"channelId":channelId,"channelName":channelName,"ips":ips,"desc":desc};			
			$.callServiceAsJson(contextPath + "/staffMgr/addChannelIp",param, {
				"before":function(){
					$.ecOverlay("数据提交中,请稍等...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if (response.code == 0) {
						$.alert("提示","绑定成功");
						$("#doChannelIpSubmit").attr("class","btna_g").off("click");
					} else if (response.code == 1) {
						$.alert("提示",response.data);
					}else {
						$.alert("提示","新增渠道IP绑定关系失败");
					}
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		});

	};
	//在页面赋值真实入参，防止点击下一页参数重置
	var _realCheckParam = function(){
		$("#status_h").val($("#status").val());
		$("#staffCode_h").val($("#staffCode").val().toUpperCase());
		var beginTime = $("#begin_h_time").val().replace(/-/g,'');
		var endTime = $("#end_h_time").val().replace(/-/g,'');
		$("#begin_r_time").val(beginTime);
		$("#end_r_time").val(endTime);
		$("#areaId_h").val($("#areaId").val());
		$("#channelId_h").val($("#channelId").val());
		$("#batchNo_h").val($("#batchNo").val());
		$("#actionType_h").val($("#actionType").val());
	};
	//申请进度查询
	var _queryStaffApply = function(pageIndex){
		//qryType p代表审核进度
		var qryType = "P";
		//qryMode s代表简单 d代表详细
		var qryMode = "D";
		var param = _bulidCheckParam(qryType,qryMode,pageIndex);
		$.callServiceAsHtmlGet(contextPath+"/staffMgr/apply/list",param,{
			"before":function(){
				$.ecOverlay("申请进度查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var content$=$("#staff_list");
				content$.html(response.data);
				content$.show();
					
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//审核查询
	var _queryStaffCheck = function(pageIndex){
		//qryType p代表审核进度
		var qryType = "A";
		//qryMode s代表简单
		var qryMode = "D";
		var param = _bulidCheckParam(qryType,qryMode,pageIndex);
		param["status"] = 6;
		$.callServiceAsHtmlGet(contextPath+"/staffMgr/check/list",param,{
			"before":function(){
				$.ecOverlay("审核信息查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				var content$=$("#staff_list");
				content$.html(response.data);
				content$.show();
					
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//绑定审核进度和审核信息入参
	var _bulidCheckParam = function(qryType,qryMode,pageIndex){
		var staffCode = $("#staffCode_h").val();
		var beginTime = $("#begin_r_time").val();
		var endTime = $("#end_r_time").val();
		var status = $("#status_h").val();
		var batchNo = $("#batchNo_h").val();
		var channelId = $("#channelId_h").val();
		var areaId = $("#areaId_h").val();
		var actionType = $("#actionType_h").val();
		return {
			"staffCode":staffCode,
			"beginTime":beginTime,
			"endTime":endTime,
			"status":status,
			"pageIndex":pageIndex,
			"batchNo":batchNo,
			"channelId":channelId,
			"areaId":areaId,
			"qryType":qryType,
			"qryMode":qryMode,
			"actionType":actionType
		};
	};
	
	//输入框提示
	var _initInputTip = function(){
		$("#input_tip").val()==""?$("#label_tip").css("visibility","visible"):$("#label_tip").css("visibility","hidden");
		$("#input_tip").on("blur",function(){
			$(this).val()==""?$("#label_tip").css("visibility","visible"):$("#label_tip").css("visibility","hidden");
			$("#label_tip").css("color","#666666");
		}).on("keyup",function(){
			$(this).val()==""?$("#label_tip").css("visibility","visible"):$("#label_tip").css("visibility","hidden");
			$("#label_tip").css("color","#CCCCCC");
		}).on("focus",function(){
			$("#label_tip").css("color","#CCCCCC");
		});
	};
		
	//绑定新增入参
	var _buildStaffInParam = function(action){
		var staffId = $("#staffId").val();
		var staffCode = $("#staffCode").val();
		var staffName = $("#staffName").val();
		var oldRoles = $.trim($("#oPostRoleIds").val());
		var oldRoleNames = $.trim($("#oPostRoleNames").val());
		var newRoles = $.trim($("#postRoleIds").val());
		var newRoleNames = $("#postRoleIdNames").val(); 
		var newRangeRoles = $("#rangePostRoleIds").val();
		var newRangeRoleNames = $("#rangePostRoleIdNames").val();
		var oRangeRoles = $("#oRangePostRoleIds").val();
		var oRangeRoleNames = $("#oRangePostRoleNames").val();
		var areaId = $("#areaId").val();
		var rangeAreaIds = $("#rangeAreaId").val();
		var rangeAreaNames = $("#rangeAreaName").val();
		var oRangeAreaIds = $("#oRangeAreaId").val();
		var oRangeAreaNames = $("#oRangeAreaName").val();
		var orgId = $("#orgId").val();
		var status = $("#status").val();
		var teleId = $("#teleId").val();
		var email = $("#email").val();
		var oldStatus = $("#oldStatus").val();
		var channelId = $("#channelId").val();
		var rangeChannelIds = $("#rangeChannelId").val();
		var rangeChannelNames = $("#rangeChannelName").val();
		var oRangeChannelIds = $("#oRangeChannelId").val();
		var oRangeChannelNames = $("#oRangeChannelName").val();
		//绑定IP
//		var wanIp = $("#wanIp").val();
//		var bindIpList = [];
//		for(var j=0,ips = wanIp.split(",");j<ips.length;j++){
//			bindIpList.push(ips[j]);
//		}
		//var remarks = $("#remarks").val();
		var roles = [];
		var roleAddRanges = [];
		var roleDelRanges = [];
		var areaAddRanges = [];
		var areaDelRanges = [];
		var channelAddRanges = [];
		var channelDelRanges = [];
		if(action=="Add"){
			//归属角色
			for(var i=0,nRoles = newRoles.split(","),nRoleNames = newRoleNames.split(",");i<nRoles.length;i++){
				roles[i] = {"roleId":nRoles[i],"action":"A","roleName":nRoleNames[i]}; 
			}
			//管理角色
			for(var i=0,nRoles = newRangeRoles.split(","),nRoleNames = newRangeRoleNames.split(",");i<nRoles.length;i++){
				roleAddRanges[i] = {"roleId":nRoles[i],"roleName":nRoleNames[i]}; 
			}
			//管理地区
			for(var i=0,nAreas = rangeAreaIds.split(","),nAreaNames = rangeAreaNames.split(",");i<nAreas.length;i++){
				areaAddRanges[i] = {"areaId":nAreas[i],"areaName":nAreaNames[i]};
			}
			//管理渠道
			for(var i=0,nChannels = rangeChannelIds.split(","),nChannelNames = rangeChannelNames.split(",");i<nChannels.length;i++){
				channelAddRanges[i] = {"channelId":nChannels[i],"channelName":nChannelNames[i]};
			}
			status = "1";
		}
		//归属角色、管理角色、管理渠道、管理地区关系更新逻辑:不在原角色中为新增，不在新角色中为删除,都在的不处理
		if(action=="Update"){
			var k = 0;
			//归属角色
			for(var i=0,nRoles = newRoles.split(","),nRoleNames = newRoleNames.split(",");i<nRoles.length;i++){
				if(oldRoles.indexOf(nRoles[i])==-1){
					roles[k] = {"roleId":nRoles[i],"action":"A","roleName":nRoleNames[i]};
					k++;
				}
			}
			for(var i=0,oRoles = oldRoles.split(","),oldRoleNames = oldRoleNames.split(",");i<oRoles.length;i++){
				if(newRoles.indexOf(oRoles[i])==-1){
					roles[k] = {"roleId":oRoles[i],"action":"D","roleName":oldRoleNames[i]};
					k++;
				}
			}
			k=0;
			//管理角色
			for(var i=0,nRoles = newRangeRoles.split(","),nRoleNames = newRangeRoleNames.split(",");i<nRoles.length;i++){
				if(oRangeRoles.indexOf(nRoles[i])==-1){
					roleAddRanges[k] = {"roleId":nRoles[i],"roleName":nRoleNames[i]};
					k++;
				}
			}
			k=0;
			for(var i=0,oRoles = oRangeRoles.split(","),oldRoleNames = oRangeRoleNames.split(",");i<oRoles.length;i++){
				if(newRangeRoles.indexOf(oRoles[i])==-1){
					roleDelRanges[k] = {"roleId":oRoles[i],"roleName":oldRoleNames[i]};
					k++;
				}
			}
			k=0;
			//管理地区
			for(var i=0,nAreas = rangeAreaIds.split(","),nAreaNames = rangeAreaNames.split(",");i<nAreas.length;i++){
				if(oRangeAreaIds.indexOf(nAreas[i])==-1){
					areaAddRanges[k] = {"areaId":nAreas[i],"areaName":nAreaNames[i]};
					k++;
				}
			}
			k=0;
			for(var i=0,oAreas = oRangeAreaIds.split(","),oAreaNames = oRangeAreaNames.split(",");i<oAreas.length;i++){
				if(rangeAreaIds.indexOf(oAreas[i])==-1){
					areaDelRanges[k] = {"areaId":oAreas[i],"areaName":oAreaNames[i]};
					k++;
				}
			}
			//管理渠道
			k=0;
			for(var i=0,nChannels = rangeChannelIds.split(","),nChannelNames = rangeChannelNames.split(",");i<nChannels.length;i++){
				if(oRangeChannelIds.indexOf(nChannels[i])==-1){
					channelAddRanges[k] = {"channelId":nChannels[i],"channelName":nChannelNames[i]};
					k++;
				}
			}
			k=0;
			for(var i=0,oChannels = oRangeChannelIds.split(","),oChannelNames = oRangeChannelNames.split(",");i<oChannels.length;i++){
				if(rangeChannelIds.indexOf(oChannels[i])==-1){
					channelDelRanges[k] = {"channelId":oChannels[i],"channelName":oChannelNames[i]};
					k++;
				}
			}
		}
		return {
			"staffId":staffId,
			"staffCode":staffCode,
			"staffName":staffName,
			"roles":roles,
			"roleAddRanges":roleAddRanges,
			"roleDelRanges":roleDelRanges,
			"areaId":areaId,
			"areaAddRanges":areaAddRanges,
			"areaDelRanges":areaDelRanges,
			"channelId":channelId,
			"channelAddRanges":channelAddRanges,
			"channelDelRanges":channelDelRanges,
			"orgId":orgId,
			"status":status,
			"teleId":teleId,
			"email":email,
			"oldStatus":oldStatus
			//"bindIpList":bindIpList
		};
	};
	//绑定状态
	var _bindStatus = function(val){
		$("#status option").each(function(){
			if ($(this).val() == val) {
				$(this).attr("selected","selected");
			}
		});
	};
	//查询渠道信息
	var _queryChildChannel = function(channelId,pageNum,channelNameObj){
		var param = {
				"channelId":channelId,
				"pageNum":pageNum
		};
		$.callServiceAsJsonGet(contextPath + "/staffMgr/getChildChannel",param,{
			"before":function(){
				$.ecOverlay("渠道信息查询中，请稍候...");		
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				//数据填写
				try{					
					if (response.code == 0) {
						if (!response.data || !response.data.child) {
							$.alert("提示","没有渠道信息返回,请重试。");
						} else {
							ec.form.dialog.createDialog({
								"id":"-channel",
								"initCallBack":function(){
									_initChannel(response.data);
								},
								"submitCallBack":function(dialogForm,dialog){
									//数据回填父表单
									_fillBackChannels(channelNameObj);
									dialogForm.close(dialog);
								}
							});
						}
					} else {
						$.alert("提示","渠道信息提取异常1，请稍后再试.");
					}
				} catch(e) {
					$.alert("提示","渠道信息提取异常2，请稍后再试.");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _queryChildChannel2 = function(channelId,pageNum,type,pageFlag){
		//弹出框高度自适应
		$(".ec-dialog-form-content").css("height","auto");
		var param = {
				"channelId":channelId,
				"pageNum":pageNum
		};
		$.callServiceAsJsonGet(contextPath + "/staffMgr/getChildChannel",param,{
			"before":function(){
				$.ecOverlay("渠道信息查询中，请稍候...");		
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				//数据填写
				try{					
					if (response.code == 0) {
						if (!response.data || !response.data.child) {
							$.alert("提示","没有渠道信息返回,请重试。");
						} else {
							_initChannels(response.data,type,pageFlag);
						}
					} else {
						$.alert("提示","渠道信息提取异常1，请稍后再试.");
					}
				} catch(e) {
					$.alert("提示","渠道信息提取异常2，请稍后再试.");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//初始化顶级渠道
	var _initChannel = function(data){
//		$("#pageNum").html("1/1");
		$("#page").css("display","none");
		$("#pageDown").attr("disabled","disabled");
		$("#pageUp").attr("disabled","disabled");
		if(data.child.length>0){
			$("#staff_channels").html(			
				"<input type='radio' value='"
						+ data.channelId + "' name='channelRadio' channelName='" + data.channelName + "'/><a href='javascript:void(0);' title='点击选择子渠道' onclick= 'javascript:staff.info.queryChildChannel2("+data.channelId+","+curtPageNum+",1,1);'>" + data.channelName + "</a><span><img src='"+contextPath +"/image/arrayIcon.gif'/></span><br/>");
		}else{
			$("#staff_channels").html(
					"<input type='radio' value='"
							+ data.channelId + "' name='channelRadio' channelName='" + data.channelName + "'/>" + data.channelName + "<br/>");	
		}				
	};
	//查询子渠道初始化
	var _initChannels = function(data,type,pageFlag){
		var channels = data.child;
		var pageNum = data.pageNum;
		var totalNum = data.totalNum;
		
		if(pageFlag=='1'){
			if(type==1){
				$("#nagiv").html(">><a href='javascript:void(0);'  title='点击选择子渠道' onclick= 'javascript:staff.info.queryChildChannel2("+data.channelId+",1,1,1);'>" + data.channelName + "</a>");			
			}else{
				curtPageNum = 1;
				$("#nagiv").append(">><a href='javascript:void(0);'  title='点击选择子渠道' onclick= 'javascript:staff.info.queryChildChannel2("+data.channelId+",1,2,1);'>" + data.channelName + "</a>");			
				$("#nagiv").find("a:last").removeAttr("onclick");
			}
		}
		$("#staff_channels").html("");
		for( var i = 0;i < channels.length;i++) {
			var channel = channels[i];
			if(channel.isLeaf == 'Y'){
				$("#staff_channels").append(
						"<input type='radio' value='"
								+ channel.channelId + "' name='channelRadio' channelName='" + channel.channelName + "'/>" + channel.channelName + "<br/>");
			}else{
				$("#staff_channels").append(
						"<input type='radio' value='"
								+ channel.channelId + "' name='channelRadio' channelName='" + channel.channelName + "'/><a href='javascript:void(0);' title='点击选择子渠道' onclick= 'javascript:staff.info.queryChildChannel2("+channel.channelId+","+curtPageNum+",2,1);'>" + channel.channelName + "</a><span><img src='"+contextPath +"/image/arrayIcon.gif'/></span><br/>");
			}
		}
		$("#page").css("display","block");
		$("#pageNum").html(pageNum.toString()+"/"+totalNum.toString());
		//下一页
		if(totalNum>pageNum){			
			$("#pageDown").removeAttr("disabled");
			$("#pageDown").unbind("click");
			$("#pageDown").on("click",function(){
				curtPageNum = curtPageNum+1;
				_queryChildChannel2(data.channelId,curtPageNum,1,2);
			});
		}else{
			$("#pageDown").attr("disabled","disabled"); 
			$("#pageDown").unbind("click");
		}
		//上一页
		if(pageNum>1){
			$("#pageUp").removeAttr("disabled");
			//清除绑定单击事件
			$("#pageUp").unbind("click");
			$("#pageUp").on("click",function(){
				curtPageNum = curtPageNum-1;
				_queryChildChannel2(data.channelId,curtPageNum,1,2);
			});
		}else{
			$("#pageUp").attr("disabled","disabled"); 
			$("#pageUp").unbind("click");
		}
	};
	//渠道信息回填
	var _fillBackChannels = function(channelNameObj){
		var val = $('input:radio[name="channelRadio"]:checked').val();
		var name = $('input:radio[name="channelRadio"]:checked').attr("channelName");
		$("#channelId").val(val);
		if(channelNameObj==null){
			$("#channelName").val(name);
		}else{
			$(channelNameObj).val(name);
		}
		
	};
	var _queryRoles = function(){
		$.callServiceAsJsonGet(contextPath + "/staffMgr/roles/list", {
			"before":function(){
				$.ecOverlay("角色信息提取中，请稍候...");		
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				//数据填写
				try {
					if (response.code == 0) {
						if (!response.data || !response.data.roles) {
							$.alert("提示","没有角色信息返回,请重试。");
						} else {
							ec.form.dialog.createDialog({
								"id":"-role",
								"initCallBack":function(){
									_initRoles(response.data);
								},
								"submitCallBack":function(dialogForm,dialog){
									//数据回填父表单
									_fillBackRoles();
									dialogForm.close(dialog);
								}
							});
						}
					} else {
						$.alert("提示","角色信息提取异常，请稍后再试.");
					}
				} catch(e) {
					$.alert("提示","角色信息提取异常，请稍后再试.");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//查询角色初始化
	var _initRoles = function(data){
		var json = data.roles;
		for( var i = 0;i < json.length;i++) {
			var role = json[i];
			$("#staff_roles").append(
					"<input type='checkbox' value='"
							+ role.postRoleId + "' name='" + role.name + "'/>" + role.name + "<br/>");
		}
	};
	//角色回填
	var _fillBackRoles = function(){
		var val = "";
		var name = "";
		$("#staff_roles input[type=checkbox]").each(function(){
			if ($(this).attr("checked") == "checked") {
				val += val == ""?$(this).val():"," + $(this).val();
				name += name == ""?$(this).attr("name"):"," + $(this).attr("name");
			}
		});
		$("#postRoleIds").val(val);
		$("#postRoleIdNames").val(name).blur();
	};
	
	//地区选择后，回填逻辑方法
	var _fillBackArea = function(){
		var area$ = $("#city_list").find("option:selected");
		var prov$ = $("#province_list").find("option:selected");
		$("#areaCode").val(area$.attr("zone_number"));
		$("#areaId").val($("#city_list").val());
		$("#provinceId").val(prov$.attr("zone_number"));
		$("#areaName").val(prov$.text()+area$.text());
	};
	
	//查询审核进度输入框提示
	var _initCheckInputTip = function(){
		
		$("#input_tip").val()==""?$("#label_tip").css("visibility","visible"):$("#label_tip").css("visibility","hidden");
		$("#input_tip").on("blur",function(){
			$(this).val()==""?$("#label_tip").css("visibility","visible"):$("#label_tip").css("visibility","hidden");
			$("#label_tip").css("color","#666666");
		}).on("keyup",function(){
			$(this).val()==""?$("#label_tip").css("visibility","visible"):$("#label_tip").css("visibility","hidden");
			$("#label_tip").css("color","#CCCCCC");
		}).on("focus",function(){
			$("#label_tip").css("color","#CCCCCC");
		});
	};
	
	//上传批量工号文件新增至服务器
	var _uploadStaffList = function(){
		var rightFileType = ["xls"];
		var fileName = $("#staff_list_file").val();
		var fileType = fileName.substring(fileName.lastIndexOf(".")+1);
		var fileBoolean = false;
		$.each(rightFileType,function(i,type){
			if(type == fileType) {
				fileBoolean = true;
				return false;
			}
		});
		if(fileBoolean){
			$("#imageLoading").show();
			$("#btn_upload").hide();
			$("#logInfo").html("");
			$("#uploadFile_form").submit();
		}else {
			$.alert("提示","只支持后缀名为xls文件上传，如果您的文件名为xlsx后缀，请打开文件另存为xls文件格式");
		}
	};
	
	//员工审核设置选中行变色
	var _trSelect = function(obj){
		//选中行变色
		var $tr = $(obj).parent("td").parent("tr");
		if($(obj).is(":checked")) {
			$tr.css({"background-color":"#E4E4E4"});
		}else {
			$tr.css({"background-color":""});
		}
		//设置全选按钮是否选中状态
		var $ckbCheck = $("input[name='ckb_staff']:checked");
		var checkLen = $ckbCheck.length;
		if(checkLen <= 0) {
			$("#ckb_all").attr("checked",false);
		}
		var $ckb = $("input[name='ckb_staff']");
		var ckbLen = $ckb.length;
		if(checkLen == ckbLen) {
			$("#ckb_all").attr("checked",true);
		}else {
			$("#ckb_all").attr("checked",false);
		}
	};
	
	//员工审核通过
	var _staffCheckOn = function(){
		var title = "请填写审核通过批注";
		var params = _bulidCheckSubmitParam(7);
		if(typeof(params) == "undefined" ){
			return;
		}
		_staffCheckRemark(params,title);
	};
	//员工审核不通过
	var _staffCheckNo = function(){
		var title = "请填写审核不通过批注";
		var params = _bulidCheckSubmitParam(8);
		if(typeof(params) == "undefined" ){
			return;
		}
		_staffCheckRemark(params,title);
	};
	//员工审核弹出备注框
	var _staffCheckRemark = function(params,title){
		var content = "<textarea id='remarks' rows='3' cols='30' onkeyup='this.value=this.value.substring(0,50)' onblur='this.value=this.value.substring(0,50)'></textarea>";
		new $.Zebra_Dialog(content, {
			'isDrag':true,
			'open_speed':true,
			'keyboard'	:false,
			'modal'		:true,
			'animation_speed':500,
			'overlay_close':false,
			'overlay_opacity':.5,
		    'type'		: false,
		    'vcenter_short_message':true,
		    'title'		: title,
		    'position' 	: ['left + 500', 'top + 180'],
		    'width'		: 300,
		    'buttons'	: ['提交','取消'],
		    'onClose'   :function(caption){
				if(caption == "提交"){
					var remarks = $.trim($("#remarks").val());
					if(remarks == "") {
						$.alert("提示","请填写审核批注！");
						return false;
					}else {
						var checkList = params["checkList"];
						$.each(checkList,function(i,obj){
							obj["remarks"] = remarks;
						});
						_staffCheckSubmit(params);
					}
				}
			}
		});
	};
	//员工审核提交
	var _staffCheckSubmit = function(params){
		$.callServiceAsJson(contextPath + "/staffMgr/check/submit",params, {
			"before":function(){
				$.ecOverlay("数据提交中,请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if (response.code == 0) {
					//alert("审核信息提交成功");
					$.confirm("信息","审核信息提交成功！"
							,{yes:function(
					){
						_queryStaffCheck(1);
					},no:""});
				} else if (response.code == 1) {
					$.unecOverlay();
					$.alert("提示",response.data);
				}else {
					$.unecOverlay();
					$.alert("提示","审核信息提交失败，请稍后再试.");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//绑定员工审核提交参数
	var _bulidCheckSubmitParam = function(status){
		var ckbSelect = $("input[name='ckb_staff']:checked");
		if(ckbSelect.length <= 0){
			$.alert("提示","请至少选择一个员工进行审核信息提交");
			return;
		}
		var params = [];
		$.each(ckbSelect,function(i,obj){
			//var staffCode = $(obj).val();
			var applyStaffSeq = $(obj).attr("applyStaffSeq");
			params[i] = {"applyStaffSeq":applyStaffSeq,"status":status};
		});
		return {"checkList":params};
	};
	
//	/查看员工审核单详情
	var _staffCheckDetail = function(staffCode){
		ec.form.dialog.createDialog({
			"id":"-check-detail",
			"width":630,
			"height":300,
			"initCallBack":function(dialogForm,dialog){
				$.each(_staffData,function(i,item){
					if(staffCode == item.APPLY_STAFF_SEQ){
						$("#d_staffCode").html(item.STAFF_NUM);
						$("#d_staffName").html(item.STAFF_NAME);
						$("#d_channelName").html(item.CHANNEL_NAME);
						$("#d_areaName").html(item.AREA_NAME);
						$("#d_staffEmail").html(item.EMAIL);
						if(item.STAFF_ROLE_REL){
						//赋值角色
							if($.isArray(item.STAFF_ROLE_REL)){
								var addRoleName = [];
								var delRoleName = [];
								$.each(item.STAFF_ROLE_REL,function(j,role){
									if(role.ACTION_TYPE == "A"){
										addRoleName.push(role.ROLE_NAME);
									}else if(role.ACTION_TYPE == "D") {
										delRoleName.push(role.ROLE_NAME);
									}
								});
								$("#d_addRoleName").html(addRoleName.join("、"));
								if(delRoleName.length > 0){
									$("#d_delRoleName").html(delRoleName.join("、"));
								}
							}else {
								if(item.STAFF_ROLE_REL.ACTION_TYPE == "A") {
									$("#d_addRoleName").html(item.STAFF_ROLE_REL.ROLE_NAME);
								}else if(item.STAFF_ROLE_REL.ACTION_TYPE == "D"){
									$("#d_delRoleName").html(item.STAFF_ROLE_REL.ROLE_NAME);
								}
								
							}
						}
						if(item.STAFF_RANGE_REL){
							if($.isArray(item.STAFF_RANGE_REL)){
								//处理管理渠道、管理地区、管理地区
								$.each(item.STAFF_RANGE_REL,function(j,staffRange){
									var ranges = staffRange.RANGE_LIST.RANGE;
									//管理渠道
									if(staffRange.DIM_RANGE == "CMLSD001") {
										_bulidRangeName(staffRange,ranges,"Channel");
									}
									//管理地区
									else if(staffRange.DIM_RANGE == "SMD1001") {
										_bulidRangeName(staffRange,ranges,"Area");
									}
									//管理角色
									else if(staffRange.DIM_RANGE == "SMD1003") {
										_bulidRangeName(staffRange,ranges,"Role");
									}
								});
							}else  {
								var ranges = item.STAFF_RANGE_REL.RANGE_LIST.RANGE;
								var staffRange = item.STAFF_RANGE_REL;
								//管理渠道
								if(staffRange.DIM_RANGE == "CMLSD001") {
									_bulidRangeName(staffRange,ranges,"Channel");
								}
								//管理地区
								else if(staffRange.DIM_RANGE == "SMD1001") {
									_bulidRangeName(staffRange,ranges,"Area");
								}
								//管理角色
								else if(staffRange.DIM_RANGE == "SMD1003") {
									_bulidRangeName(staffRange,ranges,"Role");
								}
							}
						}
						//处理审批展示
						var appFlow = item.APP_FLOW_LIST.APP_FLOW;
						var content = "";
						if($.isArray(appFlow)){
							$.each(appFlow,function(j,flow){
								if(flow.STATUS == 7 || flow.STATUS == 8) {
									content += "<tr><td></td><td>"+flow.APP_NODE+
										flow.OPR_STAFF_NUM+"于"+flow.APP_DT+flow.STATUS_NAME+
										"，批注为："+flow.APP_REMARKS+"</td></tr>";
								}else if(flow.STATUS == 6){
									content += "<tr><td></td><td>"+flow.APP_NODE+flow.STATUS_NAME+"</td></tr>";
								}
							});
						}else {
							content ="<tr><td></td><td>"+appFlow.APP_NODE+appFlow.STATUS_NAME+"</td></tr>";
						}
						$("#td_check_info").html(content);
						return false;
					}
				});
			},
			"submitCallBack":function(dialogForm,dialog){}
		});			
		
	};
	//展示管理渠道、地区、角色信息公共方法
	var _bulidRangeName = function(staffRange,ranges,id){
		if(staffRange.ACTION_TYPE == "A"){
			if($.isArray(ranges)){
				var names = [];
				$.each(ranges,function(m,range){
					names.push(range.NAME);
				});
				$("#d_rangeAdd"+id).html(names.join("、"));
			}else {
				$("#d_rangeAdd"+id).html(ranges.NAME);
			}
		}else if(staffRange.ACTION_TYPE == "D"){
			if($.isArray(ranges)){
				var names = [];
				$.each(ranges,function(m,range){
					names.push(range.NAME);
				});
				$("#d_rangeDel"+id).html(names.join("、"));
			}else {
				$("#d_rangeDel"+id).html(ranges.NAME);
			}
		}
	};
	
	
	
	
	//查询归属渠道、角色、地区和管理渠道、角色、地区公共方法
	/*
	 * title:弹出框显示的名称
	 * rangeType:查询类型，渠道(channel)，角色(role)或者地区(area)
	 * queryType:查询归属还是管理  1.归属 2.管理
	 * data:页面文本框中已选择的数据
	 */
	var _queryAuthRange = function(title,rangeType,queryType,data){
		var url  = contextPath + "/staffMgr/getAuthRange";
		var channelParam = {"rangeType":rangeType};
		var showName = "";    //需要显示的名字 渠道 角色还是地区
		var inputType = "";   //input标签类型，单选还是多选
		if(rangeType == "channel"){
			showName = "渠道";
		}else if(rangeType == "role"){
			showName = "角色";
		}else if(rangeType=="area"){
			showName = "地区";
		}
		if(queryType == "1") {
			inputType = "radio";
			if(rangeType == "role") {
				inputType = "checkbox";
			}
		}else if(queryType == "2"){
			inputType = "checkbox";
		}
		$.callServiceAsJsonGet(url,channelParam, {
			"before":function(){
				$.ecOverlay(showName+"信息加载中，请稍候...");		
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				try {
					if (response.code == 0) {
						if (!response.data || response.data.length <= 0) {
							$.alert("提示","没有"+showName+"信息返回,请重试。");
						} else {
							ec.form.dialog.createDialog({
								"id":"-auth-range",
								"title":title,
								"width":630,
								"height":"",
								"close":true,
								"initCallBack":function(dialogForm,dialog){
									var content = "";
									var datas = data.split(",");
									var dataObj = {};
									for(var i = 0;i<datas.length;i++){
										dataObj[datas[i]] = "";
									}
									if(inputType == "checkbox" && response.data.length > 1){
										content += "<div class='rangeInput' style='font-weight:bold;color:#E4812F;'><input type='checkbox' value='' name='range_all_check'/>全选</div>";
									}
//									else if(inputType == "radio" && rangeType == "channel") {
//										content += "<div class='rangeInput' style='font-weight:bold;color:#E4812F;'><input type='radio' value='' objname='' name='input_auth_range' rangeType='channel'/>无</div>";
//									}
									for( var i = 0;i < response.data.length;i++) {
										var obj = response.data[i];
										content +=
												"<div class='rangeInput' ><input type='"+inputType+"' value='"
														+ obj.ID + "' name='input_auth_range' objname='"+obj.NAME+"' rangeType='"+rangeType+"'";
										if(typeof(dataObj[obj.ID]) != "undefined") {
											content += "checked='checked'";
										}
										if(rangeType == "area") {
											content += " areacode='"+obj.AREA_CODE+"'";
										}else if(rangeType == "channel") {
											content += " areaid='"+obj.AREA_ID+"' " + "areacode='"+obj.AREA_CODE+"' " + "areaname='"+obj.AREA_NAME+"'";
										}
										content +="/>" + obj.NAME + "</div>";
									}
									$("#auth_range_info").html(content);
									if(inputType == "radio"){
										_putDialog(dialogForm,dialog);
										$("#ec-dialog-form-container-auth-range .ec-dialog-form-bottom-button").attr("ifshow","false");
										//alert($(".ec-dialog-form-bottom-button").is(":hidden"));
									}else {
										//是否显示底部button
										$("#ec-dialog-form-container-auth-range .ec-dialog-form-bottom-button").attr("ifshow","true");
										var checkLen = $("input[name='input_auth_range']:checkbox:checked").length;
										var allLen = $("input[name='input_auth_range']:checkbox").length;
										if(checkLen == allLen) {
											$("input[name='range_all_check']:checkbox").attr("checked",true);
										}
									}
									_bindInputCheck();
								},
								"submitCallBack":function(dialogForm,dialog){
									var $check = $("input[name='input_auth_range']:checked");
									if($check.length <= 0 && rangeType != "channel"){
										dialogForm.showError("请选择"+showName);
									}else {
										if(queryType == "1"){
											if(rangeType == "channel"){
												var channelId = $check.val();
												var channelName = $check.attr("objname");
												$("#channelId").val(channelId);
												$("#channelName").val(channelName);
											}else if(rangeType == "role"){
												var roleId = [];
												var roleName = [];
												$.each($check,function(i,obj){
													roleId.push($(obj).val());
													roleName.push($(obj).attr("objname"));
												});
												$("#postRoleIds").val(roleId.join(","));
												$("#postRoleIdNames").val(roleName.join(","));
											}else if(rangeType == "area"){
												var areaId = $check.val();
												var areaName = $check.attr("objname");
												$("#areaId").val(areaId);
												$("#areaName").val(areaName);
											}
										}else if(queryType == "2"){
											var id = "";
											var name = "";
											var ids = [];
											var names = [];
											var areaIds = [];
											var areaCodes = [];
											var areaNames = [];
											$check.each(function(){
												ids.push($(this).val());
												names.push($(this).attr("objname"));
												//如果是渠道则需要加载渠道对应的地区
												if(rangeType == "channel") {
													areaIds.push($(this).attr("areaid"));
													areaCodes.push($(this).attr("areacode"));
													areaNames.push($(this).attr("areaname"));
												}
											});
											//针对受理地区可能为重复的，去重
											var newAreaIds = [];
											var newAreaCodes = [];
											var newAreaNames = [];
											var n={};
											for(var k=0;k<areaIds.length;k++){
												if (!n[areaIds[k]]) //如果hash表中没有当前项
												{
													n[areaIds[k]] = true; //存入hash表
													newAreaIds.push(areaIds[k]); //把当前数组的当前项push到临时数组里面
													newAreaCodes.push(areaCodes[k]);
													newAreaNames.push(areaNames[k]);
												}
											}
 											id = ids.join(",");
											name = names.join(",");
											//如果是渠道则加载管理渠道对应的管理地区
											if(rangeType == "channel"){
												$("#rangeChannelId").val(id);
												$("#rangeChannelName").val(name);
												$("#rangeAreaId").val(newAreaIds.join(","));
												$("#rangeAreaName").val(newAreaNames.join(","));
											}else if(rangeType == "role"){
												$("#rangePostRoleIds").val(id);
												$("#rangePostRoleIdNames").val(name);
											}//else if(rangeType == "area"){
												//$("#rangeAreaId").val(id);
												//$("#rangeAreaName").val(name);
											//}
										}
										dialogForm.close(dialog);
									}
									
								}
							});			
						}
					} else {
						$.alert("提示",showName+"信息加载异常，请稍后再试.");
					}
				} catch(e) {
					$.alert("提示",showName+"信息加载异常，请稍后再试.");
				}
			},
			fail:function(){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _dialogForm;
	var _dialog;
	var _putDialog = function(dialogForm,dialog){
		_dialogForm = dialogForm;
		_dialog = dialog;
	};
	var _bindInputCheck = function(){
		$("#auth_range_info").on("click",function(e){
			//针对不同捕捉到的不同控件进行判断处理
			var $target = $(e.target);
			//如果点击的是checkBox控件则阻止外层div事件触发
			if($target.is("input:checkbox")) {
				//针对选中的为全选控件进行判断
				if($target.is("input[name='range_all_check']:checkbox")) {
					var checkState = $target.attr("checked");
					if(checkState == "checked") {
						$("input[name='input_auth_range']:checkbox").attr("checked",true);
					}else {
						$("input[name='input_auth_range']:checkbox").attr("checked",false);
					}
				}
				//如果提供了事件对象，则这是一个非IE浏览器
				if (e.stopPropagation){
					//因此它支持W3C的 stopPropagation()方法
					e.stopPropagation();
				} else{
					//否则，我们需要使用IE的方式来取消事件冒泡
					e.cancelBubble = true;
				}
				return;
			//如果点击的是radio控件
			}else if($target.is("input[name='input_auth_range']:radio")){
				$target.attr("checked",true);
				var id = $target.val();
				var name = $target.attr("objname");
				var rangeType = $target.attr("rangeType");
				if(rangeType == "channel"){
					$("#channelId").val(id);
					$("#channelName").val(name);
				}else if(rangeType == "area") {
					$("#areaId").val(id);
					$("#areaName").val(name);
				}
				_dialogForm.close(_dialog);
			//如果点击的是div控件
			}else {
				var $input = $target.find("input");
				//针对选中的为全选控件进行判断
				if($input.is("input[name='range_all_check']:checkbox")) {
					if($input.is(":checked")){
						$input.attr("checked",false);
					}else {
						$input.attr("checked",true);
					}
					var checkState = $input.attr("checked");
					if(checkState == "checked") {
						$("input[name='input_auth_range']:checkbox").attr("checked",true);
					}else {
						$("input[name='input_auth_range']:checkbox").attr("checked",false);
					}
				}else {
					if($input.attr("type") == "checkbox") {
						if($input.is(":checked")){
							$input.attr("checked",false);
							//如果取消选中某一个那么全选状态置为false
							$("input[name='range_all_check']:checkbox").attr("checked",false);
						}else {
							$input.attr("checked",true);
							//判断checkbox控件是否已经全部选中，如果全部选中则置全选状态为true
							var checkLen = $("input[name='input_auth_range']:checkbox:checked").length;
							var allLen = $("input[name='input_auth_range']:checkbox").length;
							if(checkLen == allLen) {
								$("input[name='range_all_check']:checkbox").attr("checked",true);
							}
						}
					}else {
						$input.attr("checked",true);
						var id = $input.val();
						var name = $input.attr("objname");
						var rangeType = $input.attr("rangeType");
						if(rangeType == "channel"){
							$("#channelId").val(id);
							$("#channelName").val(name);
						}else if(rangeType == "area") {
							$("#areaId").val(id);
							$("#areaName").val(name);
						}
						_dialogForm.close(_dialog);
					}
				}
			}
		});
	};
	
	//如果点击的是checkBox控件则阻止外层div事件触发
	var _checkStopPro = function(event) {
		event = event||window.event;
		//如果提供了事件对象，则这是一个非IE浏览器
		if (event.stopPropagation){
			//因此它支持W3C的 stopPropagation()方法
			event.stopPropagation();
		} else{
			//否则，我们需要使用IE的方式来取消事件冒泡
			event.cancelBubble = true;
		}
	};
	var _getCookie = function(name){
		var cookievalue = "";
		var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		if(arr != null) {
			cookievalue = unescape(arr[2]);
		}
		return cookievalue;
	};
	return {
		initFormValidate:_initFormValidate,
		bindStatus:_bindStatus,
	    initInputTip:_initInputTip,
	    initCheckInputTip:_initCheckInputTip,
	    queryChildChannel:_queryChildChannel,
	    queryChildChannel2:_queryChildChannel2,
	    initChannel:_initChannel,
	    uploadStaffList:_uploadStaffList,
	    queryStaffApply:_queryStaffApply,
	    queryStaffCheck:_queryStaffCheck,
	    fillBackArea:_fillBackArea,
	    trSelect:_trSelect,
	    staffCheckOn:_staffCheckOn,
	    staffCheckNo:_staffCheckNo,
	    staffCheckDetail:_staffCheckDetail,
	    putChangeData			:_putChangeData,
		getChangeData			:_getChangeData
	};
})();
$(function(){
	staff.info.initFormValidate();
});

/**
 * 页面头部菜单
 * 
 * @author tang
 */
CommonUtils.regNamespace("header", "menu");
/**
 *  页面头部菜单
 */

header.menu = (function(){
	
	var _moreMenu=function(){
		var more_nav_content$= $("#more_nav_content");
		var more_nav_btn$= $("#more_nav_btn");
		if(more_nav_content$.css("display")=="none"){
			more_nav_content$.slideDown(500);
			more_nav_btn$.addClass("more_nav_open").removeClass("more_nav_close");
		}else{
			more_nav_content$.slideUp(500);
			more_nav_btn$.addClass("more_nav_close").removeClass("more_nav_open");
		}
	};
	
	
	//切换渠道
	var _openChannel = function(){
		easyDialog.open({
			container : 'qudao'
		});
		$("#qudaoclose").off("click").on("click",function(event){easyDialog.close();});
	};
	
	var _chooseChannel= function(channelId){
		$.confirm("信息","您当前正在进行渠道切换的操作，点击确定按钮，将清除当前页所有数据！"
				,{yes:function(){
			//_dialogForm.close(_dialog);
			/*
			var channelId= $(self).attr("channelId");
			var channelName = $(self).attr("channelName");
			var agentTypeCd = $(self).attr("agentTypeCd");
			var areaId = $(self).attr("areaId");
			var areaCode = $(self).attr("areaCode");
			var areaName = $(self).attr("areaName");
			var operatorsId = $(self).attr("operatorsId");
			var operatorsName = $(self).attr("operatorsName");
			var operatorsNbr = $(self).attr("operatorsNbr");
			*/
			//var finalChannel = channelName;
			var setUrl  = contextPath + "/staffMgr/setCurrentChannel";
			var param = {"channelId":channelId};
			var response = $.callServiceAsJson(setUrl,param);
			if(response.code == 0){
				var channelData = response.data;
//				if(channelName.length > 8) {
//					finalChannel = channelName.substring(0,8)+"...";
//				}
				//alert("channelId=="+channelId+"  channelName="+channelName+"  areaId"+areaId);
				$("#_session_staff_info").html(channelData.name);
				$("#_session_staff_info").attr("channelId",channelData.id);
				$("#_session_staff_info").attr("channelName",channelData.name);
				$("#_session_staff_info").attr("areaId",channelData.areaId);
				$("#_session_staff_info").attr("areaCode",channelData.zoneNumber);
				$("#_session_staff_info").attr("areaName",channelData.areaName);
				$("#_session_staff_info").attr("areaAllName",channelData.areaAllName);
				$("#_session_staff_info").attr("operatorsId",channelData.operatorsId);
				$("#_session_staff_info").attr("operatorsName",channelData.operatorsName);
				$("#_session_staff_info").attr("operatorsNbr",channelData.operatorsNbr);
				$("#_session_staff_info").attr("channelType",channelData.Type);
				$("#_session_staff_info").attr("idType",channelData.idType);
				OrderInfo.staff={
						staffId : $("#_session_staff_info").attr("staffId"),
						channelId : channelData.id,
						channelName : channelData.name,
						areaId : channelData.areaId,
						areaCode : channelData.zoneNumber,
						areaName : channelData.areaName,
						areaAllName : channelData.areaAllName,
						operatorsId:channelData.operatorsId,
						operatorsName:channelData.operatorsName,
						operatorsNbr:channelData.operatorsNbr,
						soAreaId : channelData.areaId,
						soAreaCode : channelData.zoneNumber,
						channelType:channelData.Type,
						idType:channelData.idType
				};
//				window.localStorage.setItem("OrderInfo.staff",JSON.stringify(OrderInfo.staff));
				/*
				$("#_session_staff_info").val(channelId);
				$("#ft_range_channel").text(finalChannel);
				$("#ft_range_channel").attr("title",channelName);
				$("#ft_range_channel").attr("agenttypecd",agentTypeCd);
				$("#ft_range_area").val(areaId);
				$("#ft_range_area").attr("areacode",areaCode);
				$("#ft_range_area").attr("areaname",areaName);
				*/
				//window.location.href=contextPath+"/main/"+$("#homepage").val();
				//window.location.href=contextPath+"/main/home";
				easyDialog.close();
				window.location.reload();
			}else {
				alert("渠道设定异常，请稍后再试");
			}
		},no:function(){
			//_dialogForm.close(_dialog);
			easyDialog.close();
		}},"question");
	};
	
	
	var _dialogForm;
	var _dialog;
	
	var _putDialog = function(dialogForm,dialog){
		_dialogForm = dialogForm;
		_dialog = dialog;
	}
	
	var _turnreport = function(url){
		window.open(url);
		return;
	}
	
	return {
		moreMenu:_moreMenu,
		openChannel:_openChannel,
		chooseChannel:_chooseChannel,
		turnreport:_turnreport
	};
})();
$(function(){
	$(".allsort").hoverForIE6({current:"allsorthover",delay:0});
	$(".allsort .item").hoverForIE6({delay:0});
	/*
	if("LTE"==$("#d_user_menuType").attr("menuType")){
		init_head_nav();
	}
	*/
	OrderInfo.staff={
			staffId : $("#_session_staff_info").attr("staffId"),
			staffCode : $("#_session_staff_info").attr("staffCode"),
			staffName : $("#_session_staff_info").attr("staffName"),
			channelId : $("#_session_staff_info").attr("channelId"),
			channelName : $("#_session_staff_info").attr("channelName"),
			areaId : $("#_session_staff_info").attr("areaId"),
			areaCode : $("#_session_staff_info").attr("areaCode"),
			areaName : $("#_session_staff_info").attr("areaName"),
			areaAllName : $("#_session_staff_info").attr("areaAllName"),
			orgId : $("#_session_staff_info").attr("orgId"),
			distributorId : $("#_session_staff_info").attr("partnerId"),
			operatorsId : $("#_session_staff_info").attr("operatorsId"),
			operatorsName : $("#_session_staff_info").attr("operatorsName"),
			operatorsNbr : $("#_session_staff_info").attr("operatorsNbr"),
			soAreaId : $("#_session_staff_info").attr("areaId"),
			soAreaCode : $("#_session_staff_info").attr("areaCode"),
			soAreaName : $("#_session_staff_info").attr("areaName"),
			soAreaAllName : $("#_session_staff_info").attr("areaAllName"),
			channelType:$("#_session_staff_info").attr("channelType"),
			idType:$("#_session_staff_info").attr("idType")
	};
//	window.localStorage.setItem("OrderInfo.staff",JSON.stringify(OrderInfo.staff));
});

var _logout = false; //是否已调用退出登录

function sigleSignLogout(url){
	setTimeout("checkToLogout()", 10000); //10秒之后检查是否已退出（即如果调用省份接口10秒之后仍未响应，则调用4G退出登录）
	$("body").append("<iframe src='"+url+"' onload='doSigleSignLogout();'></iframe>"); //调用省份的退出登录接口，加载完成时调用4G的退出登录接口
}
function doSigleSignLogout(){
	_logout = true;
	window.location.href=contextPath+"/staff/login/logout";
}
function checkToLogout(){
	if(_logout === false){
		doSigleSignLogout();
	}
}
function callExit(){
	var params={};
	$.callServiceAsJson(contextPath+"/staff/login/padloginout", params, {
		"done" : function(response){
			if(response.code==0){					
				exitSystem();
			}
		},
		"fail" : function(response){
			exitSystem();
		}
	});
}
function exitSystem(){
	var arr=[];
	MyPlugin.exitSystem(arr,
        function(result) {
        },
        function(error) {
        }
	);
}

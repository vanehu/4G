/**
 * 省份翼销售调用
 * 
 * @author tang
 */
CommonUtils.regNamespace("provence");
/**
 * 省份翼销售调用
 */

var encodeRandom = "";
var serverAddress = "";
provence = (function(){
	
	var _getMenuList = function(urlstr){
//		alert(urlstr);
		$.ajax({
//        url: "http://123.150.141.129:8905/yxs_service/service/random?msg="+provence.encodeRandom,
			url: urlstr,
        cache: false,
        async: true,
        type: 'get',
        data: {},
        dataType: 'json',
        crossDomain: true,

        beforeSend:function()
         {
        	$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
        },                
        success: function (msg) 
        { 	msg = $.parseJSON(msg);
        	if(msg.resultCode!=0){
        		$.unecOverlay();
        		$("#prov_menuList").append('<p>省份菜单权限查询失败</P>');
//        		$.alert("提示","发送随机码失败");
        	}else{
        		$.unecOverlay();
        		var menuList = msg.menuList;
        		for(var i=0;i<menuList.length;i++){
        			var item = menuList[i];
        			var iconPic = "&#xe6d7";
        			if(item.iconPic!=undefined && item.iconPic.length>0){
        				iconPic = item.iconPic;
        			}
        			var menustr = '<li id="'+item.menulId+'" name="'+item.menuName+'" onclick="home.initData('+"'prov_menu'"+",0,'"+item.menuName+"','"+item.menulId+"','"+item.needCust+"')"+'" style="border: 1px solid #dedede;">';
        			menustr = menustr + '<i class="iconfont">'+iconPic+'</i>';
        			menustr = menustr + '<p>'+item.menuName+'</p>';
        			menustr = menustr + '</li>';
        			$("#prov_menuList").append(menustr);
//        			$("#prov_menuList").append('<li onclick="home.initData(prov_menu,0,'+item.menuName+','+item.menulId+')" style="border: 1px solid #dedede;">');
//            		$("#prov_menuList").append('<i class="iconfont">&#xe6d7</i>');
//            		$("#prov_menuList").append('<p>'+item.menuName+'</p>');
//            		$("#prov_menuList").append('</li>');
        			
        		}
//        		var listr = '<li onclick="home.initData('prov_menu',0,'${item.menuName}','${item.menulId}')" style="border: 1px solid #dedede;">';
        	}
//        	alert(JSON.stringify(msg));
        } 
        ,
        error: function (msg) 
        { 
        	$.unecOverlay();
        	$("#prov_menuList").append('<p>省份菜单权限查询失败</P>');
//        	$.alert("提示","获取省份菜单失败失败");
        },
        complete: function(msg)
        {   
//        	$.unecOverlay();
                //ajax请求完成时执行
            if(msg.status==1)
            {
//                alert(1);
            }
        }
       });
	}
	
	var _getRandom = function(){
		provence.encodeRandom = "";
		$.callServiceAsJson(contextPath+"/appInterfince/randomStaffMsg",{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
//				alert(JSON.stringify(response));
//				$.unecOverlay();
				if(response.code==0){
					provence.encodeRandom = response.data.encodeRandom;
					provence.serverAddress = response.data.serverAddress;
					provence.sendRandom();
				}else{
					$.alert("提示","获取随机数失败");
					$.unecOverlay();
				}
//				alert(JSON.stringify(response));
			},"always":function(){
//				$.unecOverlay();
			}
		});
	}
	
	var _sendRandom = function(){
		$.ajax({
//        url: "http://123.150.141.129:8905/yxs_service/service/random?msg="+provence.encodeRandom,
			url: provence.serverAddress+"random?msg="+provence.encodeRandom,
        cache: false,
        async: true,
        type: 'get',
        data: {},
        dataType: 'json',
        crossDomain: true,

        beforeSend:function()
         {
        	$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
        },                
        success: function (msg) 
        { 
        	if(msg.resultCode!=0){
        		$.unecOverlay();
        		if(msg.resultCode == 1 && msg.resultMsg != undefined){
        			$.alert("提示",msg.resultMsg);
        		}else{
        			$.alert("提示","发送随机码失败");
        		}
        	}else{
        		$.unecOverlay();
            	provence.getPage();
        	}
//        	alert(JSON.stringify(msg));
        } 
        ,
        error: function (msg) 
        { 
        	$.unecOverlay();
        	$.alert("提示","发送随机码失败");
        },
        complete: function(msg)
        {   
//        	$.unecOverlay();
                //ajax请求完成时执行
            if(msg.status==1)
            {
//                alert(1);
            }
        }
       });
	}
	
	//获取省份页面
	var _getPage=function(){
		var param = {};
//		alert(OrderInfo.cust.partyName);
		if(OrderInfo.cust.partyName!=null && OrderInfo.cust.partyName.length>0){
			param = {
					extCustId: OrderInfo.cust.extCustId,
					custId: OrderInfo.cust.custId,
					partyName: OrderInfo.cust.partyName,
					addressStr: OrderInfo.cust.addressStr,
					idCardNumber: OrderInfo.cust.idCardNumber,
					identityCd: OrderInfo.cust.identityCd,
					custFlag: OrderInfo.cust.custFlag
			};
			if(param.custId == undefined || param.custId == "-1" || param.custId == ""){
				param.custId = "-1";
				param.custFlag = "1100";
			}
		}
		param.menuId = home.menuData.menuId;
		param.menuName = home.menuData.menuName;
//		param.menuId = "3991";
//		param.menuName = "宽带新装";
		$.callServiceAsJson(contextPath+"/appInterfince/goProvPage",param,{
			"before":function(){
//				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				$.unecOverlay();
//				alert(JSON.stringify(response));
				if(response.data.resultCode != "0") {
					$.alert("提示","跳转到省份页面失败");
					return;
				}else{
//					window.location.href = "https://www.baidu.com";
//					window.location.href = "http://123.150.141.129:8905/yxs_service/service/gotoPage?msg="+response.data.msg;
					window.location.href = provence.serverAddress+"gotoPage?msg="+response.data.msg;
					
				}
			},"always":function(){
				$.unecOverlay();
			}
		});
	}
	return {
		getPage : _getPage,
		getRandom	: _getRandom,
		sendRandom	: _sendRandom,
		getMenuList	: _getMenuList
	};	
})();
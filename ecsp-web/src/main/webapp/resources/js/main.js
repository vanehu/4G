/**
 * @author linm
 */

var main = {
	tabManager: null
};
var indexdata = [
        {text: '服务平台管理', isexpand:true,children:[    
            {text: '系统管理', isexpand:true, children: [
	            {id: "portalStatus", text:"平台监控", url:""},
	            {id: "clusterStatus", text:"服务监控", url:""},
	            {id: "logManage", text:"日志管理", url:""}
	        ]},
	        {text: '基础配置', isexpand:true, children: [
	            {id: "paramManage", text:"系统参数", url:"param/paramIndexPage"},
	            {id: "roleManage", text:"角色管理", url:"role/roleIndexPage"},
	            {id: "portalManage", text:"平台管理", url:"portal/portalIndexPage"},
	            {id: "clusterManage", text:"集群配置", url:""}
	        ]},
	        {text: '服务管理', isexpand:true, children: [
	            {id: "packManage", text:"服务包管理", url:"pack/packIndexPage"},
	            {id: "serviceManage", text:"服务注册", url:"service/serviceIndexPage"},
	            {id: "intfManage", text:"接口地址管理", url:"intf/intfIndexPage"},
	            {id: "wsdlManage", text:"WSDL解析", url:"wsdl/wsdlIndexPage"},
	            {id: "simulatedData", text:"模拟数据", url:""}
	        ]}
        ]}
];
main.getId = function() {
	return this.tabManager.getSelectedTabItemID();
};

/**
 * 获得选中的TAB项.
 */
main.getSelectedTabItem = function() {
	var tabId = this.tabManager.getSelectedTabItemID();
	return $("#" + tabId).parent();
};

main.getSelectedTabName = function() {
	return $("li.l-selected a").text();
};

main.f_addTab = function(tabid, text, url) {
	url = contextPath + '/' + url;
	this.tabManager.addTabItem({tabid: tabid, text: text, url: url});
	$("#" + tabid).after('<iframe frameborder="0" style="display: none;"></iframe>');
};

main.f_back = function() {
	var tabItem = main.getSelectedTabItem();
	$("iframe:last", tabItem).attr("src", "").hide();
	$("iframe:first", tabItem).show();
};

main.f_load = function(url) {
	var tabItem = main.getSelectedTabItem();
	$("iframe:first", tabItem).hide();
	$("iframe:last", tabItem).attr("src", url).show();
};
main.showmenuThree=function(num,obj){
	if($("#menu_three_li"+num).is(":hidden")){
		$("#menu_three_li"+num).show();
		$("#menu_second_li"+num).addClass("menu_second_li");
		$("#menu_second_li"+num).removeClass("menu_second_li_up");
	}else{
		$("#menu_three_li"+num).hide();
		$("#menu_second_li"+num).removeClass("menu_second_li");
		$("#menu_second_li"+num).addClass("menu_second_li_up");
	}
};
$(document).ready(function() {
	var menuWidth = 220;
	var contentDiv = $("#framecenter");
	contentDiv.attr("position", "center");
	$("#accordion").attr("position", "left").width(menuWidth);

	$("#layout").ligerLayout({
		leftWidth: menuWidth,
		heightDiff: -44,
		space: 17,
		allowBottomResize: false,
		allowLeftResize: false
	});

	var height = $(".l-layout-center").height();

    //Tab
    main.tabManager = contentDiv.ligerTab({height: height});

    var treeHtml = "";
    if (indexdata.length > 0) {
    	treeHtml = '<ul>';
	    for (var i = 0; i < indexdata.length; i++) {
	    	treeHtml+='<li>';
	    	treeHtml+='<a href="javascript:void(0);" class="menu_first">'+indexdata[i].text+'</a>';
	    	treeHtml+='<div class="st-content">';
	    	if (indexdata[i].children !== null && indexdata[i].children !== undefined) {
	    		treeHtml+='<div class="menu_second_top"></div>';
	    		treeHtml+='<div class="menu_second_center">';
	    		treeHtml+='<ul>';
	    		var data1=indexdata[i].children;
	    		if(data1.length>0){
	    			for(var j=0;j<data1.length;j++){
	    				treeHtml+='<li class="menu_second_li" id="menu_second_li'+j+'" onclick="main.showmenuThree('+j+');">'+data1[j].text+'</li>';
	    				if(data1[j].children!==null&&data1[j].children!==undefined){
	    					var data2=data1[j].children;	    					
	    					if(data2.length>0){
	    						treeHtml+='<div id="menu_three_li'+j+'">';
	    						for(var k=0;k<data2.length;k++){
	    							var id="'"+data2[k].id+"'";
    								var text="'"+data2[k].text+"'";
    								var url="'"+data2[k].url+"'";
    								if(url!==''){
		    							if(k==data2.length-1){
		    								treeHtml+='<li style="margin-bottom:0px;" onclick="main.f_addTab('+id+','+text+','+url+');">'+data2[k].text+'</li>';
		    							}else{
		    								treeHtml+='<li onclick="main.f_addTab('+id+','+text+','+url+');">'+data2[k].text+'</li>';
		    							}
    								}else{
    									if(k==data2.length-1){
		    								treeHtml+='<li style="margin-bottom:0px;">'+data2[k].text+'</li>';
		    							}else{
		    								treeHtml+='<li>'+data2[k].text+'</li>';
		    							}
    								}
	    						}
	    						treeHtml+='</div>';
	    					}
	    				}
	    			}
	    		}
	    		treeHtml+='</ul>';
	    		treeHtml+='</div>';
	    		treeHtml+='<div class="menu_second_foot"></div>';
	    		treeHtml+='</div>';
	    	}
	    	treeHtml+='</div>';
	    	treeHtml+='</li>';
	    }
	    treeHtml+='</ul>';
    }
    $("#st-accordion").html(treeHtml);
	$('#st-accordion').accordion({
		autoHeight: true,
		collapsible:true
	});
	//$("#st-accordion").accordion( "option", "active", 0 );;
//	$("#st-accordion").accordion("option", "collapsible", true );
    $("#pageloading").hide();
});

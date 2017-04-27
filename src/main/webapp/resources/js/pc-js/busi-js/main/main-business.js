//初始化
CommonUtils.regNamespace("main","busiMenu");
main.busiMenu=(function(){
	var _getChildrenMenu=function(resouceid){
		var url = contextPath+"/menu/bussinthree";
		var param = "resouceid="+resouceid;
		$.callServiceAsHtmlGet(url,param,{
			"done":function(response){
				$("#tc_tab_content").html(response.data).show();
				$("#main_list").delegate("ul.main_list_ul","click",function(event){
					event.preventDefault();
					ec.agent.page.pageNewLoad($(this).attr("url"));
					event.stopPropagation();
				});	
			}
		});
	};

	return {
		getChildrenMenu:_getChildrenMenu
	};
})();
$(function(){
	var business_ul = $("#business_ul").find("li[class=current]").val();
	main.busiMenu.getChildrenMenu(business_ul);
});


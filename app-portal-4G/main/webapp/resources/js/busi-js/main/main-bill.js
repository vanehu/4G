//初始化
$(function(){
	$("#bill_list").delegate("ul.main_list_ul","click",function(event){
		event.preventDefault();
		ec.agent.page.pageNewLoad($(this).attr("url"));
		event.stopPropagation();
	});	
});

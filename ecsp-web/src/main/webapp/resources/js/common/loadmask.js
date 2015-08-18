(function($) {
	function __mask_opt(id){
		 $(".l-dialog-waittingdialog tr:first").remove();
		 var $obj =  $("#"+id).parent().parent();
	     $obj.css("width","100%");
	     $obj.css("border","2px solid #9BBBE6");
	     var $objTr = $obj.parent().parent();
	     $objTr.children("td:first").remove();
	     $objTr.children("td:last").remove();
	     $objTr.parent().children("tr:last").remove();
	};
	$.extend($,{
		mask : function(content) {
			if(!content){
				content = '数据提交中，请稍候 . . .';
			}
			var style = 'background:url(../css-pub/ligerUI/aqua/images/common/loading.gif) ';
			style    += 'no-repeat scroll 1px 2px white;';
			style    += 'padding: 5px 15px 5px 35px;';
	        var dlg =  $.ligerDialog.open({
	         	 title:'', cls:'l-dialog-waittingdialog', 
	         	 type: 'none', 
	         	 content: '<div id="__ecsp_mask__" style="'+style+'" >' + content + '</div>',
	         	 allowClose: false 
	         });
     	     __mask_opt("__ecsp_mask__");
     	     dlg.show();
		},
		unmask : function() {
			$.ligerDialog.closeWaitting();
		},
		
		msgTip :function(content){
			if(!content){
				content = '数据提交成功！';
			}
			var style = 'background: white;';
			style    += 'padding: 5px 15px 5px 15px;';
	        var dlg =  $.ligerDialog.open({
	         	 title:'', cls:'l-dialog-waittingdialog', 
	         	 type: 'none', 
	         	 content: '<div id="__ecsp_msgtip__" style="'+style+'" >' + content + '</div>',
	         	 allowClose: false 
	         });
     	     __mask_opt("__ecsp_msgtip__");
     	     dlg.show();
     	     setTimeout(function()
             {
                 dlg.close();
             }, 600);
		}
	});
})(jQuery);
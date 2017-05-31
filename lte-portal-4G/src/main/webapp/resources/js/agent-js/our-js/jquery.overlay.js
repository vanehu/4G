/**
 * 全局异步提示框
 * @author wuhb
 */
(function($) {
    $.extend($, {
    	ecOverlay:function(text){
    		$("#overlay-modal-content").html(text);
    		$("#overlay-modal").modal('show');
    		$("#overlay-modal").addClass("in");
    		$("#overlay-modal").css("display","block");
    	},
      	unecOverlay:function(){
      		$(".modal-backdrop").remove();
    		$("#overlay-modal").modal('hide');
    		$("#overlay-modal").removeClass("in");
    		$("#overlay-modal").css("display","none");
    	}
    });
})(jQuery, this);
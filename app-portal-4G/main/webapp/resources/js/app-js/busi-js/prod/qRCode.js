/**
 * 二维码登录绑定
 * 
 * @author yanghm
 * date 2016-06-22
 */
CommonUtils.regNamespace("prod","qRCode");
prod.qRCode = (function() {
	var _bindCode = function() {
		var url = contextPath + "/app/staffMgr/bindQrCode";
		var qrCodeId = "";
		qrCodeId = $("#qrCode").val().trim();
		if (qrCodeId == "") {
			$.alert("提示","请先扫描二维码！");
			return;
		}
		var params = {
			qrCodeId : qrCodeId
		}
		var response = $.callServiceAsJson(url, params);
		if(response.code==0){
			_showFinDialog("绑定成功!");
		}else if(response.code==1002){
			$.alert("提示",response.data);
		}
		else{
			$.alertM(response.data);
		}
	}
	
	var _showFinDialog=function(msg){
		var title='信息提示';
		$("#btn-dialog-ok").removeAttr("data-dismiss");
		$('#alert-modal').modal({backdrop: 'static', keyboard: false});
		$("#btn-dialog-ok").off("click").on("click",function(){
			$("#alert-modal").modal("hide");
			common.callCloseWebview();
		});
		$("#modal-title").html(title);
		$("#modal-content").html(msg);
		$("#alert-modal").modal();
	};

return {
	bindCode				: _bindCode,
};
})();


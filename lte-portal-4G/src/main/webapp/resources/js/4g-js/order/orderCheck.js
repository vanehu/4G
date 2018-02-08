/**
 * 订单相关校验
 */
CommonUtils.regNamespace("check","order");

check.order = (function() {
	
	/**
	 * 判断加装移动副卡是否全部勾选副卡预装
	 */
	var _isAllPreInstall = function(){
        var isAllPreInstallState = false;
        for(var i = 0;i < OrderInfo.boProdAns.length;i++){
            //获取每个加载号码的副卡预选状态
            var preInstallState = $("#isPreNumber_" + OrderInfo.boProdAns[i].prodId).attr("checked") == "checked";
            if(preInstallState){
                isAllPreInstallState = true;
            }else{
                isAllPreInstallState = false;
                break;
            }
        }
        return isAllPreInstallState;
    };
	
	return {
		isAllPreInstall:_isAllPreInstall
	};
})();
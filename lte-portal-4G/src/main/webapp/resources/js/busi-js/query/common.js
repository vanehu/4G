/**
 * 系统配置等通用信息查询
 * 没有任何业务逻辑
 * @author wukf
 * date 2014-07-29
 */
CommonUtils.regNamespace("query","common");

query.common = (function() {
	
	/**
	 * 查询门户层配置信息
	 * @String  configParamType 门户配置类型
	 * @callBackFun 回调函数
	 */
	var _queryApConfig = function(configParamType,callBackFun){
		var url= contextPath+"/order/queryApConf";
		var configParam={"CONFIG_PARAM_TYPE" : configParamType};
		if(typeof(callBackFun)=="function"){			
			$.callServiceAsJsonGet(url, configParam,{				
				"done" : function(response){
					$.unecOverlay();
					if (response.code==0) {
						if(response.data){
							callBackFun(response.data);
						}
					}else if (response.code==-2){
						$.alertM(response.data);
					}else {
						$.alert("提示","查询门户层配置信息失败,稍后重试");
					}
				}
			});
		}
	};

	return {
		queryApConfig			: _queryApConfig
	};
})();
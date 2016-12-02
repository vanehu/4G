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
	
	/**
	 * 根据权限编码查询工号的权限，入参key为权限编码，以boolean返回，有权限返回false；无权限或其他情况返回true
	 */
	var _checkOperateSpec = function(key){
		
		var resultFlag = true;
		
		if(key == null || key == undefined || key == ""){
			$.alert("提示","入参为空");
		} else{
			var response = $.callServiceAsJson(contextPath + "/common/checkOperateSpec", {"key": key});
			if (response.code == "0") {
				resultFlag = response.data;
			} else if (response.code == "1"){
				$.alert("提示","Error: 权限查询失败");
			}
		}
		
		return resultFlag;
	};
	
	/*
	 * 查询开关配置，返回boolean，开关为ON，返回true；开关查询失败或关闭，返回false
	 * 注：使用此函数查询开关配置，其开关必须为ON或者OFF状态，其他状态不支持使用此函数，建议使用_queryPropertiesValue
	 */
	var _queryPropertiesStatus = function(key){
		
		var resultFlag = false;
		
		if(key == null || key == undefined || key == ""){
			resultFlag = false;
			$.alert("提示","入参key为空");
		} else{
			var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": key});
			if (response.code == "0") {
				if ("ON" == response.data) {
					resultFlag = true;
				}
			}
		}
		
		return resultFlag;
	};
	
	/**
	 * 查询开关配置，返回开关具体配置的值，如果开关配置为ON，则返回"ON"；配置为OFF关闭则返回"OFF"，查询失败返回null
	 */
	var _queryPropertiesValue = function(key){
		
		var resultFlag = null;
		
		if(key == null || key == undefined || key == ""){
			$.alert("提示","入参key为空");
		} else{
			var response = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": key});
			if (response.code == "0") {
				resultFlag = response.data;
			} else if (response.code == "1"){
				$.alert("提示","Error: 配置查询失败");
			}
		}
		
		return resultFlag;
	};

	return {
		queryApConfig			: _queryApConfig,
		queryPropertiesValue	: _queryPropertiesValue,
		queryPropertiesStatus	: _queryPropertiesStatus
	};
})();
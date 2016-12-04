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
	 * 拍照仪驱动版本校验
	 * 入参param:{"versionSerial":"1.0.1",//*控件版本号 "venderId":"10000"//*厂商ID}
	 */
	var _checkCameraDriverVersion = function(param){
		
		var resultFlag = false;
		
		if(param != null){
			var versionSerial = param.versionSerial;
			var venderId = param.venderId;
			
			if(versionSerial == null || versionSerial == undefined || versionSerial == "" || venderId == null || venderId == undefined || venderId == ""){
				$.alert("错误","拍照仪驱动版本更新校验失败：入参为空！");
			} else{
				var response = $.callServiceAsJson(contextPath + "/common/checkCameraDriverVersion", param);
				if (response.code == 0) {
					var cameraDriverInfo = response.data;
					if(cameraDriverInfo.update){//需要更新驱动
						var alertMsg = "拍照仪驱动已更新，请点击“下载”更新驱动。驱动更新成功后您需要清除浏览器缓存、重启浏览器，以确保驱动及时生效。";
						$.downLoadConfirm("信息提示",alertMsg,{
							yesdo:function(){
								window.location.href = "https://crm.189.cn/portalstatic/assets/camera/DoccameraOcx.exe";
								resultFlag = true;
							},
							no:function(){
								alertMsg = "您稍后在拍照弹窗页面点击“下载控件”亦可进行驱动更新，拍照仪驱动未能及时更新，可能会影响到您的业务受理。";
								$.alert("提示", alertMsg);
								resultFlag = true;
							}
						});
					}
				} else if (response.code == 1){
					$.alert("错误",response.data);
				}
			}
		} else{
			$.alert("错误","拍照仪驱动版本更新校验失败：入参为空！");
		}

		return resultFlag;
	};

	return {
		queryApConfig			: _queryApConfig,
		checkCameraDriverVersion: _checkCameraDriverVersion
	};
})();
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

    /**
     * 查询MDA配置节点<const>中数据，以对象形式返回
     * @param key 要查询的MDA中的项
     * @returns {*} 此配置项的JSON对象
     */
    var _queryPropertiesObject = function (key) {

        if (ec.util.isObj(key)) {
            var response = $.callServiceAsJson(contextPath + "/properties/getObject", {"key": key});
            if (response.code == 0) {
                return response.data;
            } else if (response.code == 1) {
                $.alert("提示", "Error: 配置查询失败!");
            }
        } else {
            $.alert("提示", "入参key不能为空！");
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
	
	/**
	 * 根据权限编码查询工号的权限，入参key为权限编码，以boolean返回，有权限返回false；无权限或其他情况返回true
	 */
	var _checkOperateSpec = function(key){
		
		var resultFlag = true;
		
		if(key == null || key == undefined || key == ""){
//			$.alert("提示","入参为空");
		} else{
			var response = $.callServiceAsJson(contextPath + "/common/checkOperateSpec", {"key": key});
			if (response.code == "0") {
				resultFlag = response.data;
			} else if (response.code == "1"){
//				$.alert("提示","Error: 权限查询失败");
			}
		}
		
		return resultFlag;
	};
	
	/**
	 * 拍照仪驱动版本校验
	 * 入参param:{"versionSerial":"1.0.1",//*控件版本号 "venderId":"10000"//*厂商ID}
	 */
	var _checkCameraDriverVersion = function(){
		if(!ec.util.isObj(CONST.realNamePhotoFlag)){
    		CONST.realNamePhotoFlag = query.common.queryPropertiesValue("REAL_NAME_PHOTO_" + String(OrderInfo.staff.areaId).substr(0, 3));
    	}
    	try{
        	if (CONST.realNamePhotoFlag == "ON"){
        		//获取版本信息
        		var camVer = JSON.parse(capture.getVersion());
    	    	if(ec.util.isObj(camVer)){
    	    		if(camVer.resultFlag == 0){
    	    			_checkUpdate({
    	    				"versionSerial"	:camVer.versionSerial,
    	    				"venderId"		:camVer.venderId
    	    			});
    	    		}
    	    	}
        	}
		} catch(e) {
			throw new Error("拍照仪控件检查更新异常 : " + e);
		} finally{
			$("#camera_obj").remove();
		}
	};
	
	var _checkUpdate = function(param){
		var resultFlag = false;
		if(ec.util.isObj(param)){
			var versionSerial = param.versionSerial;
			var venderId = param.venderId;
			
			if(!(ec.util.isObj(versionSerial) && ec.util.isObj(venderId))){
				$.alert("错误","拍照仪驱动版本更新校验失败：入参为空！");
			} else{
				var response = $.callServiceAsJson(contextPath + "/common/checkCameraDriverVersion", param);
				if (response.code == 0) {
					var cameraDriverInfo = response.data;
					if(cameraDriverInfo.update){//需要更新驱动
						var alertMsg = "拍照仪驱动已更新[" + cameraDriverInfo.versionSerial + "]，请点击“下载”更新驱动。驱动更新成功后您需要清除浏览器缓存、重启浏览器，以确保驱动及时生效。";
						$.downLoadConfirm("信息提示",alertMsg,{
							yesdo:function(){
								window.location.href = cameraDriverInfo.downloadUrl;
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
				} else{
					$.alertM(response.data);
				}
			}
		} else{
			$.alert("错误","拍照仪驱动版本更新校验失败：入参为空！");
		}

		return resultFlag;
	};

	return {
		queryApConfig			: _queryApConfig,
		queryPropertiesValue	: _queryPropertiesValue,
		queryPropertiesObject	: _queryPropertiesObject,
		queryPropertiesStatus	: _queryPropertiesStatus,
		checkOperateSpec		: _checkOperateSpec,
		checkCameraDriverVersion: _checkCameraDriverVersion
	};
})();
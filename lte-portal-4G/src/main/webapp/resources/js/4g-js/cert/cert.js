CommonUtils.regNamespace("cert");

cert = (function() {
	/**
	 * 读取二代证
	 */
	var _readCert = function() {
	    if (CertCtl == null || CertCtl == undefined) {
	    	return {"resultFlag": -1, "errorMsg": "浏览器不支持读卡器"};
	    }
	    var conn = null;
	    try {
	    	var ret = CertCtl.connect();
	    	conn = JSON.parse(ret);
	    } catch(e) {
	    	conn = {"resultFlag": -1, "errorMsg": "连接读卡器失败，可能未安装驱动及控件"};
	    }
	    if (conn.resultFlag != 0) {
	    	//判断是否有设备接入
		    var jsonStr = null;
		    try {
		    	var jsonSt = CertCtl.getStatus();
		    	jsonStr = JSON.parse(jsonSt);
		    } catch(e) {
		    }
		    if (jsonStr != null && jsonStr.status != null && jsonStr.status == 1) {
		    	conn = {"resultFlag": -1, "errorMsg": "请确认已接入身份证识别仪"};
		    }
	        return conn;
	    }
	    var man = null;
	    if (undefined == conn.isCloud || 1 == conn.isCloud) {
	    	man = JSON.parse(CertCtl.readCert());
	    } else {
	    	man = _cloudReadCert();
	    }
	    try {
		    CertCtl.disconnect();
	    } catch(e) {
	    }
	    return man;
	};
	/**
	 * 云读卡
	 */
	var _cloudReadCert = function() {
		var url = contextPath + "/common/getCloudParam";
    	var params = {
    		teminalType: "PC"
    	};
    	$.ecOverlay("<strong>读卡中，请稍等...</strong>");
		var response = $.callServiceAsJson(url, params);
		if (0 == response.code) {
			var data = response.data;
			var jsonStr = CertCtl.cloudReadCert(data.appId, data.timestamp,
					data.nonce, data.businessExt, data.signature);
			man = JSON.parse(jsonStr);
			if (0 == man.resultFlag) {
				url = contextPath + "/common/decodeCert";
				params = {
					data: man.resultContent.certificate
				}
				response = $.callServiceAsJson(url, JSON.stringify(params));
				if (0 == response.code) {
					man = {"resultFlag": 0, "errorMsg": "读卡成功", "resultContent": response.data};
				} else {
					man = {"resultFlag": -1, "errorMsg": "读卡失败，请稍后重试！"};
				}
			}
		} else {
			man = {"resultFlag": -1, "errorMsg": "读卡失败，请稍后重试！"};
		}
		$.unecOverlay();
		return man;
	};
	return {
		readCert: _readCert
	};
})();

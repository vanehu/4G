CommonUtils.regNamespace("cert");

cert = (function(){
	/**
	 * 读取二代证
	 */
	function _readCert(){
	    if (CertCtl == null || CertCtl == undefined) {
	    	return {"resultFlag":-1,"errorMsg":"浏览器不支持读卡器"};
	    }
	    var conn = null;
	    try {
	    	var ret = CertCtl.connect();
	    	conn = JSON.parse(ret);
	    } catch(e) {
	    	conn = {"resultFlag":-1,"errorMsg":"连接读卡器失败，可能未安装驱动及控件"};
	    }
	    if (conn.resultFlag != 0) {
	    	//判断是否有设备接入
		    var jsonStr = null;
		    try {
		    	var jsonSt = CertCtl.getStatus();
		    	jsonStr = JSON.parse(jsonSt);
		    } catch(e) {
		    }
		    if(jsonStr!=null && jsonStr.status !=null && jsonStr.status == 1){
		    	conn = {"resultFlag":-1,"errorMsg":"请确认已接入身份证识别仪"};
		    }
	        return conn;
	    }
	    var man = JSON.parse(CertCtl.readCert());
	    try {
		    CertCtl.disconnect();
	    } catch(e) {
	    }
	    return man;
	}
	return {
		readCert:_readCert
	};
})();

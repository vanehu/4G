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

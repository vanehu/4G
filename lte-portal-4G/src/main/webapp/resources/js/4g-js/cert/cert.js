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
	    	if(man.resultFlag != 0){
	    		return man;
	    	}else{	    		
	    		var certInfo=man.resultContent;
		    	var param={};
		    	var url = contextPath + "/order/isOpenNewCert";
				var response = $.callServiceAsJson(url,JSON.stringify(param));
				var ver="";
				if (response.code == 0&&response.data=='ON') {
					if(man.venderId==undefined||man.signature==undefined){
						man = {"resultFlag": -1, "errorMsg": "读取设备厂家标识/签名信息错误,请安装新的驱动及控件"};
						return man;
					}else{
						try{
							ver = JSON.parse(CertCtl.getVersion());
						}catch(e){
							man = {"resultFlag": -1, "errorMsg": "读取设备版本号错误,请安装新的驱动及控件"};
							return man;
						}
			    		if(ver.resultFlag!=0){//版本读取错误
			    			return ver;
			    		}
			    		certInfo.signature=man.signature;
			    		certInfo.versionSerial=ver.versionSerial;
				    	certInfo.venderId=man.venderId;
					}
				}
	    		url = contextPath + "/order/certInfo";
				var response = $.callServiceAsJson(url,JSON.stringify(certInfo));
				if (response.code == 0) {
					man = {"resultFlag": 0, "errorMsg": "读卡成功", "resultContent": response.data};
				}else if(response.code == -3){
					man = {"resultFlag": 0, "errorMsg": "控件版本不一致,请下载新的控件","resultContent": response.data};
					$.confirm("信息确认","控件版本已更新，确认下载新的控件？",{
						yesdo:function(){
							$("<form>", {
						    	id: "downCardOcxForm",
						    	style: "display:none;",
								target: "_self",
								method: "POST",
								action: contextPath + "/order/downloadOCX"
						    }).appendTo("body");
							$("#downCardOcxForm").append($("<input>", {
						    	id : "fileUrl",
						    	name : "fileUrl",
						    	type: "hidden",
						    	value: response.data.fileUrl
						    }));
							$("#downCardOcxForm").append($("<input>", {
						    	id : "fileName",
						    	name : "fileName",
						    	type: "hidden",
						    	value: response.data.fileName
						    }));
							$("#downCardOcxForm").submit();
						},
						no:function(){
							return man;
						}
					});
				}else{
					man = {"resultFlag": -1, "errorMsg": response.data};
				}
	    	}
	    } else {
	    	man = _cloudReadCert();
	    }
	    try {
		    CertCtl.disconnect();
	    } catch(e) {
	    }
	    return man;
	};
	/*var _test=function(){
		var verStr="{\"resultFlag\":0,\"versionSerial\":\"1.0.3.1\"}";
		var readCert="{\"resultFlag\":0,\"venderId\":\"10000\",\"signature\":\"12312\",\"resultContent\":{\"partyName\":\"测试\",\"gender\":0,\"nation\":\"汉\",\"bornDay\":\"19850320\",\"certAddress\":\"测试地址\",\"certNumber\":\"350181198503202166\",\"certOrg\":\"123\",\"effDate\":\"20010102\",\"expDate\":\"20100102\",\"identityPic\":\"\"}}";
		var man = JSON.parse(readCert);
		var certInfo=man.resultContent;
		var param={};
		var url = contextPath + "/order/isOpenNewCert";
		var response = $.callServiceAsJson(url,JSON.stringify(param));
		var ver="";
		if (response.code == 0&&response.data=='ON') {
			if(man.venderId==undefined||man.signature==undefined||man.venderId==''||man.signature==''){
				man = {"resultFlag": -1, "errorMsg": "读取设备厂家标识/签名信息错误,请安装新的驱动及控件"};
				return man;
			}else{
				try{
					ver = JSON.parse(CertCtl.getVersion());
				}catch(e){
					man = {"resultFlag": -1, "errorMsg": "读取设备版本号错误,请安装新的驱动及控件"};
					return man;
				}
				ver = JSON.parse(verStr);
	    		if(ver.resultFlag!=0){//版本读取错误
	    			return ver;
	    		}
	    		certInfo.signature=man.signature;
	    		certInfo.versionSerial=ver.versionSerial;
		    	certInfo.venderId=man.venderId;
			}
		}
		url = contextPath + "/order/certInfo";
		var response = $.callServiceAsJson(url,JSON.stringify(certInfo));
		if (response.code == 0) {
			man = {"resultFlag": 0, "errorMsg": "读卡成功", "resultContent": response.data};
		}else if(response.code == -3){
			man = {"resultFlag": 0, "errorMsg": "控件版本不一致,请下载新的控件","resultContent": response.data};
			$.confirm("信息确认","控件版本已更新，确认下载新的控件？",{
				yesdo:function(){
					$("<form>", {
				    	id: "downCardOcxForm",
				    	style: "display:none;",
						target: "_self",
						method: "POST",
						action: contextPath + "/order/downloadOCX"
				    }).appendTo("body");
					$("#downCardOcxForm").append($("<input>", {
				    	id : "fileUrl",
				    	name : "fileUrl",
				    	type: "hidden",
				    	value: response.data.fileUrl
				    }));
					$("#downCardOcxForm").append($("<input>", {
				    	id : "fileName",
				    	name : "fileName",
				    	type: "hidden",
				    	value: response.data.fileName
				    }));
					$("#downCardOcxForm").submit();
				},
				no:function(){
					return man;
				}
			});
		}else{
			man = {"resultFlag": -1, "errorMsg": response.data};
		}
		 return man;
	};*/
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

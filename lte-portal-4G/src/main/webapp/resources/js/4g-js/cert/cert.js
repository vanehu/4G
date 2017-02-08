CommonUtils.regNamespace("cert");

cert = (function() {
	var createFlag = '';
	
	var _getBrowser = function(){
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
		var isOpera = userAgent.indexOf("Opera") > -1;
		if (isOpera) {
			return "Opera";
		}; //判断是否Opera浏览器
		if (userAgent.indexOf("Firefox") > -1) {
			return "FF";
		} //判断是否Firefox浏览器
		if (userAgent.indexOf("Chrome") > -1){
			return "Chrome";
		}
		if (userAgent.indexOf("Safari") > -1) {
			return "Safari";
		} //判断是否Safari浏览器
		if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
			return "IE";
		}; //判断是否IE浏览器
	};

	var _getDevices = function() {
		try {
			var ret = capture.getDevices();
			var json = JSON.parse(ret);
			if (json.resultFlag != 0) {
				return {
					"resultFlag" : -1,
					"errorMsg" : "初始化摄像头错误,请下载安装新的驱动及控件"
				};
			}
			var devicesArr = json.devices;
			var len = devicesArr.length;
			var deviceElement = document.getElementById("device");
			$("#device").html("");
			for ( var i = 0; i < len; i++) {
				var option = new Option();
				option.value = devicesArr[i].device;
				option.text = devicesArr[i].name;
				deviceElement.options.add(option);
			}
		} catch (e) {
			return {
				"resultFlag" : -1,
				"errorMsg" : "初始化设备异常,请下载安装新的驱动及控件，异常信息：" + e
			};
		}
	};
	
	var _createVideo = function() {
		try{
			var device = document.getElementById("device");   
			var dev=device.options[device.selectedIndex].value;
			var video = capture.createVideo(dev,width,height);
			return JSON.parse(video);
		}catch(e) {
	    	return {"resultFlag": -1, "errorMsg": "初始化视频异常, 请下载安装新的驱动及控件，异常信息：" + e};
	    }
	};

	var _createImage = function() {
	  try{
			var device = document.getElementById("device");   
			var dev=device.options[device.selectedIndex].value;
			var image = capture.createImage(dev);
			return JSON.parse(image);
		}catch(e) {
	    	return {"resultFlag": -1, "errorMsg": "拍照发生异常, 请下载安装新的驱动及控件，异常信息：" + e};
	    }
	};
	
	var _closeVideo = function() {
		return capture.closeVideo();
	};

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

				//经办人新建
				certInfo.createFlag = $('#createFlag').val();
				certInfo.jbrFlag = "Y";//添加经办人读卡标识
	    		url = contextPath + "/order/certInfo";
				var response = $.callServiceAsJson(url,JSON.stringify(certInfo));
				if (response.code == 0) {
					man = {"resultFlag": 0, "errorMsg": "读卡成功", "resultContent": response.data};
				}else if(response.code == -3){
					man = {"resultFlag": -3, "errorMsg": "控件版本不一致,请下载新的控件","resultContent": response.data};
					var info="您当前为 "+response.data.fileName+"读卡器,驱动版本号为 : "+ver.versionSerial+
					"，请更新升级到版本: "+response.data.mdaVersion+
					"。请下载新的控件。";
					$.confirm("信息确认",info,{
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
					data: man.resultContent.certificate,
					createFlag:createFlag
				};
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
		readCert	: _readCert,
		getBrowser 	: _getBrowser,
		getDevices	: _getDevices,
		createVideo	: _createVideo,
		createImage	: _createImage,
		closeVideo	: _closeVideo
	};
})();
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

	var _getDevices = function(deviceId) {
		try {
			var deviceDomId = "device";
		  	if(ec.util.isObj(deviceId)){
		  		deviceDomId = deviceId;
		  	}
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
			var deviceElement = document.getElementById(deviceDomId);
			$("#"+deviceDomId).html("");
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
	
	var _createVideo = function(deviceId) {
		try{
			var deviceDomId = "device";
		  	if(ec.util.isObj(deviceId)){
		  		deviceDomId = deviceId;
		  	}
			var device = document.getElementById(deviceDomId);   
			var dev=device.options[device.selectedIndex].value;
			var video = capture.createVideo(dev,width,height);
			return JSON.parse(video);
		}catch(e) {
	    	return {"resultFlag": -1, "errorMsg": "初始化视频异常, 请下载安装新的驱动及控件，异常信息：" + e};
	    }
	};

    var _createImage = function (deviceId, cp) {
        try {
            var deviceDomId = "device";
            if (ec.util.isObj(deviceId)) {
                deviceDomId = deviceId;
            }
            var device = document.getElementById(deviceDomId);
            var dev = device.options[device.selectedIndex].value;
            var cap = ec.util.isObj(cp) ? cp : capture;
            var image = cap.createImage(dev);
            return JSON.parse(image);
        } catch (e) {
            return {"resultFlag": -1, "errorMsg": "拍照发生异常, 请下载安装新的驱动及控件，异常信息：" + e};
        }
    };
	
	var _closeVideo = function() {
		return capture.closeVideo();
	};

	/**
	 * 读取二代证
	 */
	var _readCert = function(servCode) {
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
	    var ver=  null;
	    if (undefined == conn.isCloud || 1 == conn.isCloud) {
	    	man = JSON.parse(CertCtl.readCert());
	    	if(man.resultFlag != 0){
	    		return man;
	    	}else{
	    		var certUnifyFlag = query.common.queryPropertiesMapValue("CERT_SIGNATURE_UNIFY",String(OrderInfo.staff.areaId).substr(0, 3));
	    		if(certUnifyFlag == "ON"){// 统一控件
	    		    man.createFlag = $('#createFlag').val();
			        man.jbrFlag = "Y";// 添加经办人读卡标识
	    		    var url = contextPath + "/order/certUnifyInfo";
				    var response = $.callServiceAsJson(url,man);
				    if (response.code == 0) {
				    	// OrderInfo.pushCertReaderCustInfos(man.resultContent);
				    	man = {"resultFlag": 0, "errorMsg": "读卡成功", "resultContent": response.data};
				    }else if(response.code == -2){// 控件版本号不一致，统一控件更新
				        CertCtl.updateVersion();
				        man = {"resultFlag": -2, "errorMsg": response.data};
				    }else{
				    	man = {"resultFlag": -1, "errorMsg": response.data};
				    }
	    		}else{
	    			// USB读身份证老版本
	    		    var certInfo=man.resultContent;
		    	    var param={};
		    	    var url = contextPath + "/order/isOpenNewCert";
				    var response = $.callServiceAsJson(url,JSON.stringify(param));
				    if (response.code == 0&&response.data=='ON') {
					    if(man.venderId==undefined||man.signature==undefined){
					    	man = {"resultFlag": -1, "errorMsg": "读取设备厂家标识/签名信息错误,请安装新的驱动及控件"};
					    	return man;
					    }else{
						    try{
						    ver = JSON.parse(CertCtl.getVersion());
						    man.versionSerial=ver.versionSerial;
						    }catch(e){
							    man = {"resultFlag": -1, "errorMsg": "读取设备版本号错误,请安装新的驱动及控件"};
							    return man;
						    }
			    		    if(ver.resultFlag!=0){// 版本读取错误
			    			    return ver;
			    		    }
					    }
				    }
				    // 经办人新建
				    certInfo.createFlag = $('#createFlag').val();
				    certInfo.jbrFlag = "Y";// 添加经办人读卡标识
				    certInfo.signature=man.signature!=undefined&&man.signature!=null?man.signature:"";// 数字签名
	    		    certInfo.versionSerial=man.versionSerial!=undefined&&man.versionSerial!=null?man.versionSerial:"";// 版本号
		    	    certInfo.venderId=man.venderId!=undefined&&man.venderId!=null?man.venderId:"";// 厂商标识
		    	    certInfo.readCardReturnInfo=man!=null&&man!=undefined?JSON.stringify(man):"";// 读卡返回信息
		    	    certInfo.servCode=servCode!=null&&servCode!=undefined?servCode:"";// 业务场景编码
		    	    // 如果已经生成了portalId也一并存入
				    if(OrderInfo.order.portalId!=null&&OrderInfo.order.portalId!=undefined&&OrderInfo.order.portalId!=""){
				    	certInfo.portalId=OrderInfo.order.portalId;
			    	}
	    		    url = contextPath + "/order/certInfo";
				    var response = $.callServiceAsJson(url,JSON.stringify(certInfo));
				    if (response.code == 0) {
				    	// OrderInfo.pushCertReaderCustInfos(certInfo);
				    	man = {"resultFlag": 0, "errorMsg": "读卡成功", "resultContent": response.data};
				    }else if(response.code == -3){
				    	man = {"resultFlag": -3, "errorMsg": "控件版本不一致,您当前为"+response.data.fileName+"读卡器,驱动版本号为:"+ver.versionSerial+"请更新升级到版本:"+response.data.mdaVersion+"请下载新的控件","resultContent": response.data};
				        var info="您当前为 "+response.data.fileName+"读卡器,驱动版本号为 : "+ver.versionSerial+
					    "，请更新升级到版本: "+response.data.mdaVersion+"。请下载新的控件。";
					    $.confirm("信息确认",info,{
						    yesdo:function(){
							    // 如果二次点击不清除之前生成的，会导致后端入参字符串叠加异常
							    $("#downCardOcxForm").remove();
							    $("<form>", {
						    	    id: "downCardOcxForm",
						    	    style: "display:none;",
								    target: "_blank",
								    method: "POST",
								    action: contextPath + "/order/downloadOCX"
						        }).appendTo("body");
							    $("#downCardOcxForm").text("");
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
	    	}
	    } else {
	    	man = _cloudReadCert(servCode);
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
	var _cloudReadCert = function(servCode) {
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
				var certUnifyFlag = query.common.queryPropertiesMapValue("CERT_SIGNATURE_UNIFY",String(OrderInfo.staff.areaId).substr(0, 3));
				if(certUnifyFlag == "ON"){
					url = contextPath + "/common/decodeCertNew";	
				}
				params = {
					data: man.resultContent.certificate,
					createFlag:$('#createFlag').val()
				};
				response = $.callServiceAsJson(url, JSON.stringify(params));
				if (0 == response.code) {
					response.data.servCode = servCode;
					// OrderInfo.pushCertReaderCustInfos(response.data);
					man = {"resultFlag": 0, "errorMsg": "读卡成功", "resultContent": response.data};
				} else if(1 == response.code){
					man = {"resultFlag": -1, "errorMsg": response.data};
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
	
	var _setReaderAreaId = function(){
		var areaId = OrderInfo.staff.areaId;
		if(ec.util.isObj(areaId)){
			try{
				var result = CertCtl.setAreaId(parseInt(areaId));
				result = JSON.parse(result);
				if(result.resultFlag != 0){
					window.console && window.console.log && (console.log("%c读卡控件异常：" + result.errorMsg, "color:red"));
				}
			} catch(e){
				window.console && window.console.log && (console.log("%ccert reader driver is not installed correctly.", "color:red"));
			}
		} else{
			window.console && window.console.log && (console.log("%ccert reader driver is not installed correctly.", "color:red"));
//			areaId = "8990000";//是否给默认值
		}
	};
	
	//处理订单数据
	var _recordCertReaderCustInfos = function(){
		var resultFlag = false;
		
		if(ec.util.isArray(OrderInfo.certReaderCustInfos)){
			var param = {
				"certInfos":OrderInfo.certReaderCustInfos
			};
			try{
				var response= $.callServiceAsJson(contextPath + "/cert/recordCertReaderCustInfos", param);
				if(response.code == 0 && response.data){
					OrderInfo.certInfoKeys = [];
					var certResults = response.data.certResults;
					
					if(ec.util.isArray(certResults)){
						$.each(certResults, function(index, certResult){
							if(certResult.certInfoId != -1){
								_fillupOrderInfoCertReaderCustInfos();
								_fillupOrderInfoCertInfoKeys(certResult);
								resultFlag = true;
							} else{
								resultFlag = false;
								return resultFlag;
							}
						});
					}
					
					if(ec.util.isArray(OrderInfo.certInfoKeys)){
						OrderInfo.orderData.orderList.orderListInfo.certInfoKeys = OrderInfo.certInfoKeys;
					}
				}
			} catch(e){
				window.console && window.console.log && (console.log("%crecordCertReaderCustInfos异常：" + e, "color:red"));
			}
		}
		
		return resultFlag;
	};
	
	//OrderInfo.certReaderCustInfos补充数据
	var _fillupOrderInfoCertReaderCustInfos = function(){
		//填充客户的custId
		OrderInfo.fillupPartyId2CertReaderCustInfos(OrderInfo.cust.idCardNumber, OrderInfo.cust.custId);
		
		$.each(OrderInfo.certReaderCustInfos, function(index, certReaderCustInfo){
			if(!ec.util.isObj(certReaderCustInfo.partyId)){
				//没有partyId，使用报文中C1节点的虚拟客户ID替代
				$.each(OrderInfo.orderData.orderList, function(index, busiOrder){
					if(busiOrder.boActionType.boActionTypeCd == "C1"){
						if(busiOrder.data.boCustIdentities[0].identityNum == certReaderCustInfo.certNumber){
							certReaderCustInfo.partyId = busiOrder.busiObj.instId;
						}
					}
				});
			}
		});
	};
	//OrderInfo.certInfoKeys补充数据
	var _fillupOrderInfoCertInfoKeys = function(certResults){
		if(ec.util.isArray(OrderInfo.certReaderCustInfos)){
			$.each(OrderInfo.certReaderCustInfos, function(index, certReaderCustInfo){
				if(certResult.certNumber == certReaderCustInfo.certNumber){
					OrderInfo.certInfoKeys.push({
						"certInfoId":certResult.certInfoId,
						"partyId":certReaderCustInfo.partyId
					});
				}
			});
		}
	};
	
	return {
		readCert		: _readCert,
		getBrowser 		: _getBrowser,
		getDevices		: _getDevices,
		createVideo		: _createVideo,
		createImage		: _createImage,
		closeVideo		: _closeVideo,
		setReaderAreaId	:_setReaderAreaId,
		recordCertReaderCustInfos:_recordCertReaderCustInfos
	};
})();
$(function(){
	cert.setReaderAreaId();
});
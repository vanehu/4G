
CommonUtils.regNamespace("verify");

verify = (function(){
	var _upLoad_param={};//人证比对照片上传入参
	var _img_YS="";//水印压缩图片
	var _checkType = "";
	var countdown = 30;
	
	//跳转到人证比对拍照页面
	var _openVerify=function(isNeedCheck){
		var param = {"isNeedCheck":isNeedCheck};
		$.callServiceAsHtml(contextPath+"/app/realName/photoCheck/faceVerify",param,{
			"before":function(){
				$.ecOverlay("加载中请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				$("#prodofferPrepare").hide();
				$("#verifyPrepare").html(response.data).show();
				$("#jbr_pic").attr("src","data:image/jpeg;base64,"+OrderInfo.jbr.identityPic);
				
			},
			fail:function(){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	}
	
	//人证比对拍照
    var _goPhotograph = function(param) {
        var arr = new Array(1)
        arr[0] = '';
        var image_best = "";
        var image_water = "";
        MyPlugin.goPhotograph(arr, function(result) {
        	$("#img_artwork").attr("src","");
        	$("#img_watermark").attr("src","");
        	$("#img_best").attr("src","");
          //考虑新旧客户端
          //result 可能是字符串或json对象{artwork:'', watermark:''}
          //artwork表示原图
          //watermark表示加过水印的图
          //注：
          //XXX     用于暂存 原图
          //XXX 用于暂存 加过水印的图
          //image_best  压缩后的图片
          //image_water 压缩后的水印图片
          //人证比对的时候拿原图原图比对
          function isJSON(str) {
            if (typeof str == 'string') {
              try {
                JSON.parse(str);
                return true;
              } catch (e) {
                return false;
              }
            }
          }
          if (isJSON(result)) {
            var o = $.parseJSON(result);
            $("#img_artwork").attr("src","data:image/jpeg;base64,"+o.artwork);
//            verify.img_YS = o.watermark;
            $("#img_watermark").attr("src","data:image/jpeg;base64,"+o.watermark);
          //对原图进行压缩
            var scale = 0.4;
        	//目标尺寸
//        	var target = 800;
//        	var $img1 = $("#img_artwork");
//        	scale = getScale($img1[0].width,$img1[0].height,scale,target);
            compress('data:image/jpeg;base64,' + o.artwork, 0.2, scale, "img_artwork", function(dataUrl) {
            	image_best = dataUrl.split('data:image/jpeg;base64,')[1];
            	$("#img_best").attr("src","data:image/jpeg;base64,"+image_best);
            	//人证比对
            	verify_pic(image_best);
              });
        }
        });
      }
    
    //  base64图片字符串  quality压缩质量   scale缩放比例   text_id图片元素id
    var compress = function(base64, quality, scale, text_id, cb) {
    	var $img = $('<img/>').prop('src', base64);
//        var $img = $("#"+text_id);
        $img[0].onload = function() {
          var dataUrl;
          var width = $img[0].width;
          var height = $img[0].height;
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          canvas.width = width * scale;
          canvas.height = height * scale;

          var sx = 0;
          var sy = 0;
          var sWidth = width;
          var sHeight = height;
          var dx = 0;
          var dy = 0;
          var dWidth = width * scale;
          var dHeight = height * scale;
          context.drawImage($img[0], sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
          dataUrl = canvas.toDataURL('image/jpeg', quality); //品质0-1
          cb.call(this, dataUrl);
        }
      }
    //获取图片压缩比例  
    var getScale = function(widthdist,heightdist,scale,target){
    	if(widthdist>target || heightdist>target){
        	scale = target / widthdist;
        }
        return scale;
    }
    
    //调用人证比对
    var verify_pic = function(image_best){
    	if($("#jbr_pic").attr("src").length>50 && $("#verify_openFlag").val()=="ON"){
    		$("#bd").attr("disabled","disabled");
        	var cert_number = "";
        	if($("#identidiesType").val()=="1" && ((OrderInfo.actionFlag!="111" && cust.isSameOne) ||(OrderInfo.actionFlag=="111" && order.broadband.isSameOne))){
        		cert_number = $("#userid").val();
        	}else{
        		cert_number = OrderInfo.jbr.identityNum;
        	}
        	var param = {
        			"cert_address":OrderInfo.jbr.addressStr,
        			"cert_number":cert_number,
        			"cust_id":OrderInfo.cust.custId,
        			"party_name":OrderInfo.jbr.partyName,
        			"image_best":image_best,
        			"image_idcard":OrderInfo.jbr.identityPic
        			
        	}
        	$.callServiceAsJson(contextPath + "/appInterfince/pic/verify", param, {
                "before": function () {
                    $.ecOverlay("<strong>正在进行人证比对,请稍等...</strong>");
                }, "done": function (response) {
                	$.unecOverlay();
//                	alert(JSON.stringify(response));
                    if (response.code == 0) {
                    	$("#verify_msg").text("人证相符，相似度"+response.data.confidence+"%，拍摄成功");
                    	$("#bd").removeAttr("disabled");
                    	verify.checkType = response.data.checkType;
                    }else if (response.code == 1002) {
                    	$("#verify_msg").text(response.data.msg);
                    }else {
//                    	$("#bd").removeAttr("disabled");
                        $.alertM(response.data);
                    }
                }
            });
    	}else{
    		$.unecOverlay();
    		$("#bd").removeAttr("disabled");
    	}
    }
    
    var _verifyPass = function(){
    	if($("#pic_checkType").length>0 && $("#pic_checkType").val() == "2"){
    		verify.checkType = "2";
    		_upLoadPic();
    	}else if($("#pic_checkType").length>0 && $("#pic_checkType").val() == "1"){
    		verify.checkType = "1";
    		if($("#verify_smsCode").val().length>0){
    			_smsValid();
    		}else{
    			$.alert("提示","请输入验证码")
    			return;
    		}
    	}else{
    		_upLoadPic();
    	}
    }
    
    var _upLoadPic = function(){
    	//对水印图进行压缩
      var scale = 0.4;
    	compress( $("#img_watermark").attr("src"), 0.2, scale, "img_watermark", function(dataUrl) {
//        	image_best = dataUrl.split('data:image/jpeg;base64,')[1];
//        	$("#img_watermark").attr("src","data:image/jpeg;base64,"+image_best);
        	//照片上传
//    		alert(verify.upLoad_param.picturesInfo.length);
    		for(var i=0;i<verify.upLoad_param.picturesInfo.length;i++){
    			if(verify.checkType != "2"){
    				verify.upLoad_param.picturesInfo[i].checkType = verify.checkType;
    			}
    			if(verify.checkType.length>0){
    				verify.upLoad_param.picturesInfo[i].staffId = parseInt(OrderInfo.staff.staffId);
    			}
	    		if(verify.checkType == "1" || verify.checkType == "2"){
	    			if($("#check_staff").val().length>0){
	    				verify.upLoad_param.picturesInfo[i].staffId = parseInt($("#check_staff").val());
	    			}else{
	    				$.alert("提示","请选择审核人");
	    				return;
	    			}
	    		}
    			if(verify.upLoad_param.picturesInfo[i].picFlag == "D"){
    				verify.upLoad_param.picturesInfo[i].orderInfo = dataUrl.split('data:image/jpeg;base64,')[1];
    			}
    		}
    		if(OrderInfo.actionFlag=="111"){
    			verify.upLoad_param.olId = $("#TransactionID").val();
    		}
//    		verify.upLoad_param.checkType = verify.checkType;
//    		verify.upLoad_param.staffId = OrderInfo.staff.staffId;
//    		if(verify.checkType == "1" || verify.checkType == "2"){
//    			if($("#check_staff").val().length>0){
//    				verify.upLoad_param.staffId = $("#check_staff").val();
//    			}else{
//    				$.alert("提示","请选择审核人");
//    				return;
//    			}
//    		}
        	$.callServiceAsJson(contextPath + "/app/mktRes/upLoadPicturesFileToFtp", verify.upLoad_param, {
                "before": function () {
                    $.ecOverlay("<strong>照片上传中,请稍等...</strong>");
                }, "done": function (response) {
                	$.unecOverlay();
//                	alert(JSON.stringify(response));
                    if (response.code == 0) {
                    	OrderInfo.virOlId = response.data.reult.result.virOlId;
                    	if(OrderInfo.actionFlag!="111" && !($("#pic_checkType").length>0 && $("#pic_checkType").val() == "2")){
            				order.dealer.closeJBR();//拍完照片直接关闭经办人界面
        				}else if(OrderInfo.actionFlag=="111"){
        					var picturesInfo = [];
        					picturesInfo = response.data.reult.result.picturesInfo;
        					for(var i=0;i<picturesInfo.length;i++){//原生返回照片列表
        						if(picturesInfo[i].picFlag=="D"){//经办人拍照照片
        							order.broadband.jbrPictureName=picturesInfo[i].fileName;
        						}
        					}	
        					order.broadband.haveCallPhote=true;
        				}
                    	if($("#pic_checkType").length>0 && $("#pic_checkType").val() == "2"){
                    		$.confirm("图片上传成功","流水号："+response.data.reult.result.virOlId,{ 
        	 					yes:function(){	
        	 						_smsSend("2");
        	 					},
        						no:function(){	
        							_smsSend("2");
        						}
        	 				});
                    	}else{
                    		$("#prodofferPrepare").show();
            				$("#verifyPrepare").hide();
                    	}
                    } else {
                        $.alertM(response.data);
                    }
                }
            });
          });
    }
    
    var _changeCheckType = function(obj){
    	//.find("option:selected")
    	if($(obj).val()=="1"){
    		$("#div_sms_send").show();
    	}else $("#div_sms_send").hide();
    }
    
    var _smsSend = function(type){
    	var param = {
    			"checkType":type,
    			"number":$("#check_staff").find("option:selected").attr("phone"),
    			"areaId":OrderInfo.staff.areaId+""
    	};
    	if(type=="2"){
    		param.virOlId = OrderInfo.virOlId;
    	}
    	$.callServiceAsJson(contextPath + "/app/realName/photoCheck/smsSend", param, {
            "before": function () {
                $.ecOverlay("<strong>正在发送验证码,请稍等...</strong>");
            }, "done": function (response) {
            	$.unecOverlay();
//            	alert(JSON.stringify(response));
                if (response.code == 0) {
                	if(type=="2"){
                		$("#prodofferPrepare").show();
        				$("#verifyPrepare").hide();
        				if(OrderInfo.actionFlag!="111"){
            				order.dealer.closeJBR();//拍完照片直接关闭经办人界面
        				}
                	}else if(type=="1"){
                		settime();
                	}
                	
                } else {
                    $.alert("提示",response.data);
                }
            }
        });
    }
    
    var settime = function() { 
    	if (countdown == 0) { 
    		$("#verify_smsSend").removeAttr("disabled");
    		$("#verify_smsSend").text("重新发送");
    		countdown = 30; 
    	} else { 
    		$("#verify_smsSend").attr("disabled","disabled");
    		$("#verify_smsSend").text("重新发送(" + countdown + ")"); 
    		countdown--;
    		setTimeout(function() { 
    	    	settime();
    	    	},1000);
    	} 
    }
    	
    var _smsValid = function(type){
    	var param = {
    			"number":$("#check_staff").find("option:selected").attr("phone"),
    			"smspwd":$("#verify_smsCode").val()
    	};
    	$.callServiceAsJson(contextPath + "/app/realName/photoCheck/smsValid", param, {
            "before": function () {
                $.ecOverlay("<strong>验证码校验中,请稍等...</strong>");
            }, "done": function (response) {
            	$.unecOverlay();
//            	alert(JSON.stringify(response));
                if (response.code == 0) {
                	_upLoadPic();
                } else {
                    $.alert("提示",response.data);
                }
            }
        });
    }
    
	return {
		openVerify		:	_openVerify,
		goPhotograph	:	_goPhotograph,
		upLoad_param	:	_upLoad_param,
		img_YS			:	_img_YS,
		upLoadPic		:	_upLoadPic,
		changeCheckType	:	_changeCheckType,
		verifyPass		:	_verifyPass,
		smsSend			:	_smsSend,
		smsValid		:	_smsValid,
		checkType		:	_checkType
	};
	
})();


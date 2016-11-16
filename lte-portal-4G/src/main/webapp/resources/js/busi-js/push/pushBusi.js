/**
 * 双屏推送业务处理
 * 
 * @author tanzepeng
 */
CommonUtils.regNamespace("push","busi");

// 频道ID
var rid = null;
// 频道名称 : 发起方 from
var username = null;
// 频道名称 : 指向方 target
var target = null;
// 连接状态(已经进入频道)
var connStatus = false;
// 绑定状态(PC端与APP已绑定)
var bindStatus = false;
//服务端请求地址
var servUrl = null;

push.busi = (function($) {
	
	var isQRCreate = false;

	var protocolType = "http"; // 协议、默认http

	var a =  document.createElement('a');

	var host = ""; // 地址

	var port = ""; // 端口
	
	// 弹出二维码绑定窗口,供翼销售APP扫描
	var _bindApp = function(){
		_init();
	};
	
	/**
	 * 测试方法,通过脚本控制台测试
	 * 
	 * msg:回参
	 * pushType:推送类型
	 * busiType:业务类型
	 * prodId:可选
	 */
	var _testBind = function(msg,pushType,busiType,prodId){
		var rid1 = $("#_session_staff_info").attr("staffId")+$("#_session_staff_info").attr("channelId");
		var username1 = rid+"_app";
		
		if(null == servUrl || "" == servUrl){
			$.alert("提示","服务端地址查询失败,请检查配置是否正确.");
			return;
		}

		a.href = servUrl;
		if(null != a.protocol && "" != a.protocol){
			protocolType = a.protocol.replace(':','');
		}
		host = a.hostname;
		port = 80;
		if("" != a.port){
			port = a.port;
		}

		if(undefined == host || null == host || "" == host){
			$.alert("提示","服务端地址为空,请检查配置是否正确.");
			return;
		}
		if(undefined == port || null == port || "" == port){
			$.alert("提示","服务端端口为空,请检查配置是否正确.");
			return;
		}
		
		pomelo.init({
			host : host,
			port : port,
			log : true
		}, function() {
			var route = "connector.entryHandler.enter";
			pomelo.request(route, {
				username : username1,
				rid : rid1
			}, function(data) {
				if (data.error) {
					$.alert("提示",DUPLICATE_ERROR);
					return;
				}
				msg = {
					"partyName": 'zz',
					"identityPic": '',
					"certNumber": '432524',
					"certAddress": '湖南省',
					"signature":''
				};
				var param = {
					code : 0,
					result:msg,
					req:{
				 		"pushType":pushType,
						"busiType":busiType,
						"prodId":prodId
					}
				};
				push.busi.sendMsg(param);
			});
		});
	};
	
	var _init = function(){
		
		rid = $("#_session_staff_info").attr("staffId")+$("#_session_staff_info").attr("channelId");
		username = rid+"_web";
		target = rid+"_app";
		
		if(null == servUrl || "" == servUrl){
			$.alert("提示","服务端地址查询失败,请检查配置是否正确.");
			return;
		}
		
		a.href = servUrl;
		if(null != a.protocol && "" != a.protocol){
			protocolType = a.protocol.replace(':','');
		}
		host = a.hostname;
		port = 80;
		if("" != a.port){
			port = a.port;
		}
		if(undefined == host || null == host || "" == host){
			$.alert("提示","服务端地址为空,请检查配置是否正确.");
			return;
		}
		if(undefined == port || null == port || "" == port){
			$.alert("提示","服务端端口为空,请检查配置是否正确.");
			return;
		}
		
		pomelo.init({
			host : host,
			port : port,
			log : true
		}, function() {
			var route = "connector.entryHandler.enter";
			pomelo.request(route, {
				username : username,
				rid : rid
			}, function(data) {
				if (data.error) {
					$.alert("提示","工号已连接,请点击【取绑】取消连接!");
					return;
				}
				document.cookie = "STICKYID="+rid+";path=/; domain=.189.cn";
				connStatus = true;
				push.busi.jumpQrCode();
				$('#bindClick span').text("待绑定");
				$('#bindClick').off("click").on('click',function(){
					push.busi.jumpQrCode();
				});
			});
		});
	};

	/**
	 * 退出
	 * @private
	 */
	var _conQuit = function() {
		$.confirm("信息确认", "是否解除绑定?", {
			yesdo: function () {
				push.busi.quit(username);
			},
			no: function () {
			}
		});
	};

	var _quit = function(name){
		if(!name){
			name = username;
		}
		if("" == host || "" == port){
			$.alert("提示","请点击【绑定】进行连接.")
			return;
		}
		pomelo.init({
			host : host,
			port : port,
			log : true
		},function(){
			var route = "connector.entryHandler.kick";
			pomelo.request(route, {
				username: name,
				rid: rid
			}, function (data) {
				if (data.error) {
					return;
				}
				if ($('#qrCodeDialog').parent().css("display") != 'none') {
					easyDialog.close();
				}
				connStatus = false;
				push.busi.waitStyle();
			});
		});
	}

	/** 绑定样式 **/
	var _bindedStyle = function(){
		// 与APP端绑定
		bindStatus = true;
		saveSession({flag:'status',Status:'Y'});
		showOrHide();
		$('#bindClick span').text("已绑定");
		$('#bindClick span').css("background-color","#16C413");
		$("#bindClick").unbind("mouseenter").unbind("mouseleave");
		/*$('#bindClick').off("click").on("click",function(){
			_conQuit();
		});*/
		$('#bindClick').off("click");
	};
	
	/**
	 * 待绑定样式
	 * flag : 1--绑定 2--待绑定
	 */
	var _waitStyle = function(){
		if(bindStatus){
			bindStatus = false;
			saveSession({flag: 'status', Status: 'N'});
			showOrHide();
		}
		$('#bindClick span').text("待绑定");
		$('#bindClick span').css("background-color", "#d3d8d0");
		$('#bindClick').hover(function () {
			$('#bindClick span').css("background-color", "#16C413");
		}, function () {
			$('#bindClick span').css("background-color", "#d3d8d0");
		});
		if(connStatus) {
			$('#bindClick span').text("待绑定");
			$('#bindClick').off("click").on('click', function () {
				push.busi.jumpQrCode();
			});
		}else{
			$('#bindClick span').text("绑定");
			$('#bindClick').off("click").on('click', function () {
				_init();
			});
		}
	};
	
	var jumpQrCode = function(){
		if(!isQRCreate){
			$.ecOverlay("<strong>二维码生成中,请稍等会儿....</strong>");
			var response = $.callServiceAsJson(contextPath+"/staff/getRQCode",{flag:"bind",connStatus:connStatus})
			$.unecOverlay();
			if (response.code == 0) {
				$("#qrCodeDialog").find("span:eq(1)").text(username);
				$("#qgcode").html("");
				var html= '<img src="" id="img_qrcode"/>';
				$("#qgcode").html(html);
				$("#img_qrcode").attr("src",response.data);
			}else{
				$.alert("提示",response.data);
			}
			easyDialog.open({
				container : 'qrCodeDialog'
			});
			$("#qrCodeclose").off("click").on("click",function(event){easyDialog.close();});
			isQRCreate = true;
		}else{
			easyDialog.open({
				container : 'qrCodeDialog'
			});
		}
	};
	
	var _sendMsg = function(msg){
		
		if(!/^[a-zA-Z0-9]+_app$/.test(target)){
			$.alert("提示","Sorry,Send Object is error!");
			return;
		}
		
		var route = "chat.chatHandler.send";
		pomelo.request(route, {
			rid: rid,
			//content: JSON.stringify(msg),
			content: msg,
			from: username,
			target: target
		}, function(data) {
			//if(target != '*' && target != username) {
			//	addMessage(username, target, msg);
			//	$("#chatHistory").show();
			//}
			//alert("data===:"+JSON.stringify(data));
		});
	};
	
	var _receMsg = function(data){
		if(!data.req){
			$.alert("提示","标识信息APP端未返回.");
		}
		var inParam = data.req;
		var pushType = inParam.pushType;
		var busiType = inParam.busiType;
		
		var prodId = null;
		if(inParam.prodId && inParam.prodId != ""){
			prodId = inParam.prodId;
		}
		if(pushType == CONST.PUSH_TYPE.TYPE_IDCARD){
			_dealIDCardPush(busiType,data.result);
		}else if(pushType == CONST.PUSH_TYPE.TYPE_UIM){
			_dealUIMPush(busiType,data.result,prodId);
		}else if(pushType == CONST.PUSH_TYPE.TYPE_TERMINAL){
			_dealTerminalPush(busiType,data.result,prodId);
		}else{
			$.alert("提示","推送类型不存在,请确认是否推送类型为【身份证】、【UIM卡】、【终端串码】!");
			return;
		}
	};
	
	/**
	 * 请求分发
	 * 
	 * 类型：身份证、UIM卡、串码
	 * 
	 * 身份证：1.客户定位、2.新建客户、3.新建客户经办人、4.经办人、5.二次鉴权
	 * UIM卡：1.新装、主副卡新装、补换卡、3升4
	 * 串码：1.购手机、2.订购合约、3.分段受理
	 * 
	 * busiType:业务类型
	 * pushType:推送类型,1:身份证 2:UIM卡 3：终端串码
	 */
	var leftInvalidTime = 30;
	var interResend = null;
	var _reqDispatch = function(pushType,busiType,prodId){
		
		/** 处于Iframe中,调用父类JS **/
		if(!isParentFrame && (top.location != self.location)){
			rid = parent.rid;
			username = parent.username;
			target = parent.target;
			connStatus = parent.connStatus;
			
			parent.push.busi.reqDispatch(pushType,busiType,prodId);
			
			return;
		}
		
		if(!connStatus){
			$.alert("提示","Please connect the Channel!");
			return;
		}
		
		leftInvalidTime = 30;
		
		$.ecOverlay("<div id='loadingDialog' style='text-align:center;'>等待APP端扫描,<font style='color:red;' id='timeTick'>"+leftInvalidTime+"</font>秒后自动关闭<br/>" +
				"<div style='text-align:right;margin-top:10px;'><a class='purchase' id='closeOverlay' href='javascript:void(0)'>关闭</a></div</div>");
		
		$('#closeOverlay').off('click').on('click',function(){
			window.clearInterval(interResend);
			$.unecOverlay();
		});
		
		/*easyDialog.open({  
	        container : { 
	        	header :'请使用APP进行扫码',
	            content : '<div id="loadingDialog" style="text-align:center;">等待APP端扫描,<font style="color:red;" id="timeTick">'+leftInvalidTime+'</font>秒后自动关闭</div>'  
	        },  
	        //overlay : false
	        //autoClose : 10000  
	    });*/
		
		interResend=window.setInterval(function(){
			if(leftInvalidTime > 1){
				leftInvalidTime=leftInvalidTime-1;
				$("#timeTick").text(leftInvalidTime);
			}else{
				if(interResend!=null){
					window.clearInterval(interResend);
					//easyDialog.close();
					$.unecOverlay();
					return;
				}
			}
		},1000);
		
		var param = {
			pushType:pushType,
			busiType:busiType
		};
		
		if(prodId && prodId!=""){
			param.prodId = prodId;
		}
		
		push.busi.sendMsg(param);
	};
	
	// 身份证
	var _dealIDCardPush = function(busiType,data){
		
		switch(busiType){
			case 1: // 客户定位
				$('#p_cust_identityCd').val(1);//身份证类型
				order.cust.custidentidiesTypeCdChoose($("#p_cust_identityCd option:selected"),"p_cust_identityNum");
				$('#p_cust_identityNum').val(data.certNumber);
				break;
			case 2: // 新建客户
				order.cust.setValueForNewCust(data);
				saveSession({flag:'signature',signature:data.signature});
				break;
			case 3: // 新建客户-经办人
				order.cust.setValueForAgentSpan(data);
				break;
			case 4: // 经办人
				order.cust.setValueForAgentOrderSpan(data);
				break;
			case 5: // 二次鉴权
				$("#discernBtn_5").parent().find("input").val(data.certNumber);
				//$.callServiceAsJson(contextPath+"/cust/addSessionFlag",{certNumber:data.certNumber}, {});
				saveSession({flag:'cust',certNumber:data.certNumber});
				break;
			default:
				break;
		}
	};
	
	var saveSession = function(param){
		$.callServiceAsJson(contextPath+"/cust/addSessionFlag",param, {});
	};
	
	// UIM卡
	var _dealUIMPush = function(busiType,data,prodId){
		
		switch(busiType){
			case 1: // 新装,主副卡新装,3转4,补换卡
				$('#uim_txt_'+prodId).val(data);
				break;
			default:
				break;
		}
	};
	
	// 终端串码
	var _dealTerminalPush = function(busiType,data,prodId){
		
		switch(busiType){
			case 1: // 购手机
				$("#tsn").val(data);
				break;
			case 2: // 购合约
				$('#terminalText_'+prodId).val(data);
				break;
			default:
				break;
		}
	};
	
	var showOrHide = function(){
		// 多页签的时候,控制iFrame中元素
		var iframeFlag = false;
		var $if = $("#framecenter iframe");
		if($if.length > 0){
			iframeFlag = true;
		}
		if(!isParentFrame && (top.location != self.location)){
			bindStatus = parent.bindStatus;
		}
		
		if(bindStatus){
			if(iframeFlag){
				var $btn = null;
				$.each($if,function(){
					$btn = $(this).contents().find("#discernBtn_1");
					if($btn.length>0){
						$btn.show();
					}
					$btn = $(this).contents().find("#discernBtn_2");
					if($btn.length>0){
						$btn.show();
					}
					$btn = $(this).contents().find("#discernBtn_3");
					if($btn.length>0){
						$btn.show();
					}
					$btn = $(this).contents().find("#discernBtn_4");
					if($btn.length>0){
						$btn.show();
					}
					$btn = $(this).contents().find("#discernBtn_5");
					if($btn.length>0){
						$btn.show();
					}
					$btn = $(this).contents().find("#discernBtn_31");
					if($btn.length>0){
						$btn.show();
					}
					$btn = $(this).contents().find("#discernBtn_32");
					if($btn.length>0){
						$btn.show();
					}
					$btn = $(this).contents().find("#discernBtn_uim");
					if($btn.length>0){
						$btn.show();
					}
				});
			}
			$('#discernBtn_1').show();
			$('#discernBtn_2').show();
			$('#discernBtn_3').show();
			$('#discernBtn_4').show();
			$('#discernBtn_5').show();
			$('#discernBtn_31').show();
			$('#discernBtn_32').show();
			$('#discernBtn_uim').show();
		}else{
			if(iframeFlag){
				var $btn = null;
				$.each($if,function(){
					$btn = $(this).contents().find("#discernBtn_1");
					if($btn.length>0){
						$btn.hide();
					}
					$btn = $(this).contents().find("#discernBtn_2");
					if($btn.length>0){
						$btn.hide();
					}
					$btn = $(this).contents().find("#discernBtn_3");
					if($btn.length>0){
						$btn.hide();
					}
					$btn = $(this).contents().find("#discernBtn_4");
					if($btn.length>0){
						$btn.hide();
					}
					$btn = $(this).contents().find("#discernBtn_5");
					if($btn.length>0){
						$btn.hide();
					}
					$btn = $(this).contents().find("#discernBtn_31");
					if($btn.length>0){
						$btn.hide();
					}
					$btn = $(this).contents().find("#discernBtn_32");
					if($btn.length>0){
						$btn.hide();
					}
					$btn = $(this).contents().find("#discernBtn_uim");
					if($btn.length>0){
						$btn.hide();
					}
				});
			}
			$('#discernBtn_1').hide();
			$('#discernBtn_2').hide();
			$('#discernBtn_3').hide();
			$('#discernBtn_4').hide();
			$('#discernBtn_5').hide();
			$('#discernBtn_31').hide();
			$('#discernBtn_32').hide();
			$('#discernBtn_uim').hide();
		}
	};
	
	return {
		bindApp:_bindApp,
		jumpQrCode:jumpQrCode,
		bindedStyle:_bindedStyle,
		waitStyle:_waitStyle,
		sendMsg:_sendMsg,
		receMsg:_receMsg,
		reqDispatch:_reqDispatch,
		showOrHide:showOrHide,
		conQuit:_conQuit,
		quit:_quit,
		testBind:_testBind
	};
})(jQuery);
//初始化
$(function(){
	
	var response = $.callServiceAsJson(contextPath+"/common/queryPortalProperties",{propertiesKey : "PUSH_HOST_PORT"});
	if (response.code==0 && null != response.data) {
		servUrl = response.data;
	}

	$('#bindClick').off("click").on('click',function(){
		push.busi.bindApp();
	});
	$('#bindCancel').off("click").on('click',function(){
		push.busi.conQuit();
	});
	
	/** 处于Iframe中,调用父类JS **/
	if(!isParentFrame && (top.location != self.location)){
		pomelo = parent.pomelo;
	}
	// wait message from the server.
	pomelo.on('onChat', function(data) {
		// 只接收来自APP端的消息
		//if(/^[a-zA-Z0-9]+_app$/.test(data.from)){}
		if(data.from == target){
			$.unecOverlay();
			//var param =  JSON.parse(data.msg);
			var param =  data.msg;
			if(param.code == '0'){
				push.busi.receMsg(param);
			}else{
				$.alert("提示",param.msg);
			}
		}
	});

	// update user list
	pomelo.on('onAdd', function(data) {
		//alert("onadd");
		if(null != target && data.user == target){
			push.busi.bindedStyle();
			if($('#qrCodeDialog').css("display") != 'none') {
				easyDialog.close();
			}
		}
	});

	// update user list
	pomelo.on('onLeave', function(data) {
		if(null != target && data.user == target){
			push.busi.waitStyle();
		}
	});

	// handle disconect message, occours when the client is disconnect with
	// servers
	pomelo.on('disconnect', function(reason) {
		//push.busi.quit();
	});
});
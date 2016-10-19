/**
 * app 业务统一入口
 * 
 */
CommonUtils.regNamespace("common");
common = (function($) { 
	
	var _callOrderServer=function(staffInfos,custInfos,prodIdInfos,url){
//		var custInfosTemp = custInfos;
//		custInfosTemp.identityPic = "";
//		var custInfosParamsTemp=JSON.stringify(custInfosTemp);//客户定位信息
		var staffInfosParams=JSON.stringify(staffInfos);//登录信息
		var custInfosParams=JSON.stringify(custInfos);//客户定位信息
		var prodIdInfosParams=JSON.stringify(prodIdInfos);//选中产品信息
		var urlParams=$.parseJSON(JSON.stringify(url));//地址
		OrderInfo.actionFlag=urlParams.actionFlag;
		if(ec.util.isObj(prodIdInfos)){
			order.prodModify.choosedProdInfo=$.parseJSON(prodIdInfosParams);
		}
		if(ec.util.isObj(staffInfos)){
			OrderInfo.staff=$.parseJSON(staffInfosParams);
		}
		if(ec.util.isObj(custInfos)){
			OrderInfo.cust=$.parseJSON(custInfosParams);
			var custOther1 = OrderInfo.cust.custOther1;
			if(custOther1 && custOther1!=""){
			   OrderInfo.boPartyContactInfo = $.parseJSON(custOther1);
			}
		}
		var custParam = JSON.parse(custInfosParams);
		custParam.identityPic = "";
		var param={
			"staffInfos":staffInfosParams,
			"custInfos":JSON.stringify(custParam),
			"prodIdInfos":prodIdInfosParams
		};
		var enter = urlParams.enter;
		if(enter != undefined){
			param.enter = enter;
		}
		var method=urlParams.method;// /app/prodModify/custAuth
		$.callServiceAsHtml(contextPath+method,param,{
			"before":function(){
				$.ecOverlay("正在努力加载中，请稍等...");
			},
			"done" : function(response){
				$.unecOverlay();
				$("#load").hide();
				var pp =$("#content").html(response.data);
				$.refresh(pp);
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	};
	
	//客户定位后，回传客户信息
	var _callCustInfo = function(custInfos){
		var custInfosParams=JSON.stringify(custInfos);//客户定位信息
		if(ec.util.isObj(custInfos)){
			OrderInfo.cust=$.parseJSON(custInfosParams);
		}
	};
	
	//调用客户端的身份证识别方法       method：表示回调js方法 如：order.prodModify.getIDCardInfos
	var _callIDCardRec=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.getIDCardInfos(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的拍照方法       method：表示回调js方法 如：order.prodModify.getIDCardInfos
	var _callPhotos=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.takePhotos(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的二代证识别方法       method：表示回调js方法 如：order.prodModify.getIDCardInfos
	var _callGenerationRec=function(method,type){
		var arr=new Array(1);
		arr[0]=method;
		arr[1]=type;
		MyPlugin.getGenerationInfos(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//读取身份证后直接返回结果（用于和PC双屏互动）
	var _getGenerationInfos=function(name,idcard,address,identityPic,signature){
		$("#custname").val(""); //姓名
		$("#idcard").val("");//身份证号码
		$("#address").val("");//地址
		$("#identityPic").val("");//证件照片
		$("#signature").val("");//证件照片
		$("#custname").val(name); //姓名
		$("#idcard").val(idcard);//身份证号码
		$("#address").val(address);//地址
		$("#identityPic").val(identityPic);//证件照片
		$("#signature").val(signature);//信息签名
		$("#readCard").click();
	};
	
	var _saveCust = function(){
		var arr=new Array(1);
		arr[0]=JSON.stringify(OrderInfo.cust);
		MyPlugin.showCust(arr,
	            function(result) {
        },
        function(error) {
        }
        );
	};
	
	
	//调用客户端的关闭webview方法
	var _callCloseWebview=function(){
		if($("#alert-modal").length>0){
			$("#alert-modal").hide();
		}
		var arr=new Array(1);
		arr[0]="";
		MyPlugin.closeWebview(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的类似重定位去除客户缓存方法
	var _relocationCust=function(){
		if($("#alert-modal").length>0){
			$("#alert-modal").hide();
		}
		var arr=new Array(1);
		arr[0]="";
		MyPlugin.relocationCust(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	
	//调用客户端的数字签名板
	var _callDatasign=function(method){
		var arr=new Array(1);
		arr[0]=method;
		MyPlugin.datasign(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//调用客户端的扫描
	var _callScanning=function(method,prodId){
		var arr=new Array(1);
		arr[0]=method;
		arr[1]=prodId;
		MyPlugin.scanning(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	
	//扫描后直接返回结果（用于和PC双屏互动）
	var _scaningCallBack=function(terInfo,prodId){
		$("#channelId").val("");
		$("#number").val("");
		if(prodId=="-999"){
			$("#channelId").val(terInfo);
			$("#goRoom").click()
		}else if(prodId=="-888"){
			$("#number").val(terInfo);
			$("#senNum").click()
		}
//		return terInfo;
	};
	
	//调用客户端的日历
	var _callcalendar=function(time,format,method,textId){
		var arr=new Array(1);
		arr[0]=time;
		arr[1]=format;
		arr[2]=method;
		arr[3]=textId;
		MyPlugin.calendar(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	//时间框赋值
	var _setCalendar = function(time,textId){
		$("#"+textId).val(time);
	};
	
	//客户端调用此方法返回到上一页 1 为prepare页面  2为order-content（填单）页面 3为order-confirm（订单确认和收银台）页面 4为order-print（打印）页面
	var _callReturnBack=function(){
		//alert("OrderInfo.actionFlag="+OrderInfo.actionFlag+"---OrderInfo.order.step="+OrderInfo.order.step+"---OrderInfo.returnFlag="+OrderInfo.returnFlag);
		if($(".modal-backdrop").length>0 && $("#overlay-modal").length>0){
			$.unecOverlay();//网络出现故障或手机出现故障时按返回关闭“加载中”提示框
		}
		//如果收费成功  安卓手机返回按钮不可返回
		if($("#toCharge").length>0){
			if("disabled"==$("#toCharge").attr("disabled")){
				return;
			}
		}
		if(OrderInfo.actionFlag==1){
			if(OrderInfo.order.step==3){
				if(OrderInfo.returnFlag=="xgfy"){
					order.calcharge.close();
					OrderInfo.returnFlag="";
					return;
				}
			}
		}
		if(OrderInfo.actionFlag==4||OrderInfo.actionFlag==8){//客户新增和修改
			_callCloseWebview();
			return;
		}
		if(OrderInfo.actionFlag==40){
			cart.main.cartBack();
			return;
		}
		if(OrderInfo.actionFlag==140){
			order.calcharge.back();
			return;
		}
		if(OrderInfo.actionFlag==150){
			mktRes.terminal.back();
			return;
		}
		if(OrderInfo.returnFlag==2){
			order.phoneNumber.back(); 
			return;
		}
		if(OrderInfo.actionFlag==-999){//处理预受理查询 返回
			if(OrderInfo.order.step==2){
				OrderInfo.order.step = 1;
				$("#ysl_search").show();
				$("#ysl_list").hide();
			}
			if(OrderInfo.order.step==1){
				_callCloseWebview();
			}
			return;
		}
		if(OrderInfo.returnFlag=="tc"){ // 套餐 
			if(OrderInfo.actionFlag==14 && OrderInfo.order.step<3){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#div_offer").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#order-content").show();
//				$("#terminalMain").show();
				OrderInfo.returnFlag="";
				return;
			}
			if(OrderInfo.actionFlag==1){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#order-content").show();
				OrderInfo.returnFlag="";
				return;
			}
		}
		if(OrderInfo.returnFlag=="hm"){//号码
			if(OrderInfo.actionFlag==14 && OrderInfo.order.step<3){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#order-content").show();
//				$("#terminalMain").show();
				OrderInfo.returnFlag="";
				return;
			}
			if(OrderInfo.actionFlag==1){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#order-content").show();
				OrderInfo.returnFlag="";
				return;
			}
		}
		if(OrderInfo.order.step==1){
			//补换卡返回释放uim卡
			if(OrderInfo.actionFlag==22){
				$.confirm("确认","确定要取消该订单吗？",{
					yes:function(){
						var boProd2Tds = OrderInfo.boProd2Tds;
						//取消订单时，释放被预占的UIM卡
						if(boProd2Tds.length>0){
							for(var n=0;n<boProd2Tds.length;n++){
								var param = {
										numType : 2,
										numValue : boProd2Tds[n].terminalCode
								};
								$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
									"before":function(){
										$.ecOverlay("<strong>正在释放UIM卡,请稍等会儿....</strong>");
									},
									"always":function(){
										$.unecOverlay();
									},
									fail:function(response){
										$.unecOverlay();
										$.alert("提示","请求可能发生异常，请稍后再试！");
									},
									"done" : function(){
										//_callCloseWebview();
									}
								});
							}
						}
						_callCloseWebview();
						return;
					},no:function(){
					return;
				}},"question");
			}else{
			_callCloseWebview();
			}
		}else if(OrderInfo.order.step==2){
			if(OrderInfo.actionFlag==3||OrderInfo.actionFlag==9){
				_callCloseWebview();
				return;
			}
			order.main.lastStep(function(){
				$("#order_prepare").show();
				if(OrderInfo.actionFlag != 13 || OrderInfo.actionFlag != 14){
					if(OrderInfo.actionFlag == 1 && "1"==$("#enter").val()){
						order.service.searchPack(1);
						$("#pakeage").show();
						$("#pakeage").attr("class","tab-pane fade in active");
						$("#phone").attr("class","tab-pane fade medialist");
						$("#number").attr("class","tab-pane fade");
					}
					if(OrderInfo.actionFlag == 1 && "3"==$("#enter").val()){
						order.phoneNumber.initPhonenumber('number');
						$("#pakeage").attr("class","tab-pane fade");
						$("#phone").attr("class","tab-pane fade medialist");
						$("#number").attr("class","tab-pane fade in active");
					}
				}
				if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
					mktRes.terminal.btnQueryTerminal(1);
					$("#phone").show();
					$("#pakeage").hide();
					$("#number").hide();
					$("#pakeage").attr("class","tab-pane fade");
					$("#phone").attr("class","tab-pane fade medialist in active");
					$("#number").attr("class","tab-pane fade");
				}
				$("#order").hide();	
				if(OrderInfo.actionFlag==1){//新装的头部 要发生变化
						_callTitle(2);//2 头部为已定位客户
					}
				if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
					_callTitle(2);//2 头部为已定位客户
				}
					OrderInfo.order.step=1;
			});
		}else if(OrderInfo.order.step==3){
			//补换卡
			if(OrderInfo.actionFlag == 22){
				$.confirm("确认","确定要取消该订单吗？",{
					yes:function(){
						var boProd2Tds = OrderInfo.boProd2Tds;
						//取消订单时，释放被预占的UIM卡
						if(boProd2Tds.length>0){
							for(var n=0;n<boProd2Tds.length;n++){
								var param = {
										numType : 2,
										numValue : boProd2Tds[n].terminalCode
								};
								$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
									"before":function(){
										$.ecOverlay("<strong>正在释放UIM卡,请稍等会儿....</strong>");
									},
									"always":function(){
										$.unecOverlay();
										
									},
									fail:function(response){
										$.unecOverlay();
										$.alert("提示","请求可能发生异常，请稍后再试！");
									},
									"done" : function(){
										SoOrder.orderBack();
									}
								});
							}
						}
						$("#order-confirm").hide();
						$("#order_fill_content").show();
						$("#isCheck_Card").css("display","none");
						$("#btn_next_checkUim").show();
						OrderInfo.order.step = 1;
						_callCloseWebview();
					},no:function(){
					return;
				}},"question");
				//_callCloseWebview();
				//return;
			} else {
				// 可选包变更订单页面返回 释放UIM卡
				if (OrderInfo.actionFlag == 3) {
					var boProd2Tds = OrderInfo.boProd2Tds;
					// 取消订单时，释放被预占的UIM卡
					if (boProd2Tds.length > 0) {
						for (var n = 0; n < boProd2Tds.length; n++) {
							var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
							};
							$
									.callServiceAsJson(
											contextPath
													+ "/app/mktRes/phonenumber/releaseErrorNum",
											param, {
												"done" : function() {
												}
											});
						}
					}
//					_callCloseWebview();   2016年8月12日熊公正提出可选包订单确认返回同新装一样，退回 上一步
//					return;
				}
				SoOrder.orderBack();
				$("#order-content").show();
				$("#order-confirm").hide();
				$("#order-dealer").hide();
				if (OrderInfo.actionFlag == 13) {
					$("#terminalMain").show();
				}
				OrderInfo.order.step = 2;
			}
		}else if(OrderInfo.order.step==4){
			$("#order-confirm").show();
			$("#order-print").hide();
			OrderInfo.order.step=3;
		}else {
			_callCloseWebview();
		}
	};
	//调用客户端 改变头部的状态
	var _callTitle=function(str){

		var arr=new Array(1);
		arr[0]=str;
		MyPlugin.changeTitle(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	//调用客户端 通知会话已经失效了
	var _callSessionNotViald=function(olId){
		var arr=new Array(1);
		MyPlugin.sessionValid(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	var _callAgreePhoto=function(olId){
		var arr=new Array(1);
		arr[0]=olId;
		MyPlugin.protocolPhone(arr,
            function(result) {
            },
            function(error) {
            }
		);	
	};
	
	//调用客户端打开支付页面
	var _callOpenPay=function(payUrl){
		var arr=new Array(1);
		arr[0]=payUrl;
		MyPlugin.openPayWeb(arr,
            function(result) {
            },
            function(error) {
            }
		);
	};
	return {
		relocationCust		:	_relocationCust,
		setCalendar			:	_setCalendar,
		callcalendar		:	_callcalendar,
		callCloseWebview	:	_callCloseWebview,
		callCustInfo		:	_callCustInfo,
		callDatasign		:	_callDatasign,
		callGenerationRec	:	_callGenerationRec,
		getGenerationInfos	:	_getGenerationInfos,
		callIDCardRec		:	_callIDCardRec,
		callOrderServer		:	_callOrderServer,
		callPhotos			:	_callPhotos,
		callReturnBack		: 	_callReturnBack,
		callScanning		:	_callScanning,
		scaningCallBack		:	_scaningCallBack,
		callSessionNotViald	:	_callSessionNotViald,
		callTitle			:	_callTitle,
		saveCust			:	_saveCust,
		callAgreePhoto      :   _callAgreePhoto,
		callOpenPay         :   _callOpenPay
	};
})(jQuery);

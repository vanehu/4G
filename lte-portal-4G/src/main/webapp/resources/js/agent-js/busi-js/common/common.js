/**
 * app 业务统一入口
 * 
 */
CommonUtils.regNamespace("common");
common = (function($) { 
	
	var _callOrderServer=function(staffInfos,custInfos,prodIdInfos,url){
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
		}
		var param={
			"staffInfos":staffInfosParams,
			"custInfos":custInfosParams,
			"prodIdInfos":prodIdInfosParams
		};
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
//		alert("OrderInfo.returnFlag="+OrderInfo.returnFlag+"——OrderInfo.actionFlag="+OrderInfo.actionFlag+"——OrderInfo.order.step="+OrderInfo.order.step+"");
		$.unecOverlay();//网络出现故障或手机出现故障时按返回关闭“加载中”提示框
		//如果收费成功  安卓手机返回按钮不可返回
		if($("#toCharge").length>0){
			if("disabled"==$("#toCharge").attr("disabled")){
				if(OrderInfo.order.step==5){
					
				}else if(OrderInfo.order.step==4 && OrderInfo.actionFlag != 13 && OrderInfo.actionFlag != 14){
					
				}
				else return;
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
		if(OrderInfo.returnFlag=="fk"){ //副卡不可返回，只能确定或取消
			return;
		}
		if(OrderInfo.returnFlag=="sc"){ //收藏
			AttachOffer.cangBack();
			return;
		}
		if(OrderInfo.returnFlag=="fk"){ //副卡
			if(OrderInfo.actionFlag==14 && OrderInfo.order.step<3){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#terminalMain").show();
				OrderInfo.returnFlag="";
				return;
			}
			if(OrderInfo.actionFlag==1){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
				$("#order-content").show();
				OrderInfo.returnFlag="";
				return;
			}
		}
		if(OrderInfo.returnFlag=="tc"){ // 套餐 
			if(OrderInfo.actionFlag==14 && OrderInfo.order.step<3){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#div_offer").hide();
				$("#offer-prepare").hide();
				$("#order").show();
				$("#terminalMain").show();
				OrderInfo.returnFlag="";
				return;
			}
			if(OrderInfo.actionFlag==1){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
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
				$("#terminalMain").show();
				OrderInfo.returnFlag="";
				return;
			}
			if(OrderInfo.actionFlag==1){
				$("#order-memeber").hide();
				$("#phonenumberContent").hide();
				$("#offer-prepare").hide();
				$("#order-content").show();
				OrderInfo.returnFlag="";
				return;
			}
		}
		if(OrderInfo.order.step==1){
			//补换卡返回释放uim卡
			if(OrderInfo.actionFlag==22){
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/agent/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				_callCloseWebview();
				return;
			}
			//
			if(OrderInfo.actionFlag==1){
				order.main.lastStep(function(){
					_callCloseWebview();
				});
				return;
			}
			_callCloseWebview();
		}else if(OrderInfo.order.step==2){
			if(OrderInfo.actionFlag==3||OrderInfo.actionFlag==9){
				_callCloseWebview();
				return;
			}
			if(OrderInfo.actionFlag==1){
				$("#cust-content").hide();
				$("#order-content").show();
				OrderInfo.order.step = 1;
				return;
			}
			order.main.lastStep(function(){
				$("#order_prepare").show();
				if(OrderInfo.actionFlag != 13 || OrderInfo.actionFlag != 14){
					$("#pakeage").show();
				}
				if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
					if($("#phonenumberContent").length>0){
						$("#phonenumberContent").hide();
					}
					if($("#jbr").length>0){
						$("#jbr").hide();
					}
					if($("#zzfkym").length>0){
						$("#zzfkym").hide();
					}
					if($("#div_offer").length>0){
						$("#div_offer").hide();
					}
				}
				$("#order").hide();	
				if(OrderInfo.actionFlag==1){//新装的头部 要发生变化
					 _callTitle(2);//2 头部为已定位客户
					}
				if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
//					_callTitle(2);//2 头部为已定位客户
				}
					OrderInfo.order.step=1;
			});
		}else if(OrderInfo.order.step==3){
			//不换卡
			if(OrderInfo.actionFlag == 22){
				$("#order-confirm").hide();
				$("#order_fill_content").show();
				$("#isCheck_Card").css("display","none");
				$("#btn_next_checkUim").show();
				OrderInfo.order.step = 1;
				return;
			}
			//如果是购手机，返回购手机订单页
			if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
				$("#terminalMain").show();
//				$("#order-confirm").hide();
				$("#cust-content").hide();
				OrderInfo.order.step = 2;
				return;
			}
			if(OrderInfo.actionFlag == 1){
			//	$("#terminalMain").show();
				SoOrder.orderBack();
				$("#order-confirm").hide();
				$("#order-content").hide();
				$("#cust-content").show();
				OrderInfo.order.step = 2;
				return;
			}
			SoOrder.orderBack();
			$("#order-content").show();
			$("#order-confirm").hide();
			$("#order-dealer").hide();
			OrderInfo.order.step=2;
		}else if(OrderInfo.order.step==4){
			if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
				$("#order-confirm").empty();
				$("#cust-content").show();
				SoOrder.orderBack();
				OrderInfo.order.step=3;
				return;
			}
			if(OrderInfo.actionFlag ==1){
				//$("#cust-content").hide();
				$("#order-content").hide();
			}
			$("#order-confirm").show();
			$("#order-print").hide();
			OrderInfo.order.step=3;
		}else if(OrderInfo.order.step==5){
			if(OrderInfo.actionFlag == 13 || OrderInfo.actionFlag == 14){
				$("#order-print").hide();
				$("#order-confirm").show();
				OrderInfo.order.step=4;
				return;
			}
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
	var _callSessionNotViald=function(){
//		var arr=new Array(1);
//		MyPlugin.sessionValid(arr,
//            function(result) {
//            },
//            function(error) {
//            }
//		);
	};
	
	var _printEQCode = function(olId){
		var params = {
				"olId":olId
		};
		$.callServiceAsJson(contextPath+"/agent/order/getRQCode",JSON.stringify(params), {
			"before":function(){
				$.ecOverlay("<strong>生成二维码中，请稍等...</strong>");
			},"always":function(){
				
			},	
			"done" : function(response){
			    $.unecOverlay();
				if (response.code == 0) {
					$("#qrcode").css("display","block");
					$("#alertMessage").html("");
					var html= '<img src="" width="90%"  id="img_qrcode"/>'
				    $("#alertMessage").html(html);
					$("#img_qrcode").attr("src",response.data);
				}else{
					$.alert("失败",response.data);
				}
			}
		});
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
	
	return {
		relocationCust		:	_relocationCust,
		setCalendar			:	_setCalendar,
		callcalendar		:	_callcalendar,
		callCloseWebview	:	_callCloseWebview,
		callCustInfo		:	_callCustInfo,
		callDatasign		:	_callDatasign,
		callGenerationRec	:	_callGenerationRec,
		callIDCardRec		:	_callIDCardRec,
		callOrderServer		:	_callOrderServer,
		callPhotos			:	_callPhotos,
		callReturnBack		: 	_callReturnBack,
		callScanning		:	_callScanning,
		callSessionNotViald	:	_callSessionNotViald,
		callTitle			:	_callTitle,
		saveCust			:	_saveCust,
		printEQCode         :   _printEQCode,
		callAgreePhoto      :   _callAgreePhoto
	};
})(jQuery);

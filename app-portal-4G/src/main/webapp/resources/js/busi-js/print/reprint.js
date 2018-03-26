/**
 * 票据打印
 * @author wukf
 * @date 2013-07-09
 */
CommonUtils.regNamespace("common", "reprint");

common.reprint = (function(){
	var _init = function(){
		OrderInfo.actionTypeName = "重打回执";
		OrderInfo.actionFlag=11;
		//执行查询
		$("#bt_orderQry").off("click").on("click",function(){_queryOrderList(1);});
		$("#bt_area_config").off("click").on("click",function(){
			if($("#q_area4").val()){
				$("#p_areaId_val").val($("#q_area2 option:selected").text()+" >> "+$("#q_area3 option:selected").text()+" >> "+$("#q_area4 option:selected").text());
				$("#p_areaId").val($("#q_area4").val());
			}else if($("#q_area2").val()){
				$("#p_areaId_val").val($("#q_area2 option:selected").text()+" >> "+$("#q_area3 option:selected").text());
				$("#p_areaId").val($("#q_area3").val());
			}else if($("#q_area1").val()){
				$("#p_areaId_val").val($("#q_area2 option:selected").text());
				$("#p_areaId").val($("#q_area2").val());
			}
			easyDialog.close();
		});
		$("#p_areaId_val").off("click").on("click",function(event){
			easyDialog.open({
				container : 'd_area'
			});
		});
		$("#d_area_close").off("click").on("click",function(event){easyDialog.close();});
		$("#p_startTime").off("click").on("click",function(){$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_startTime' });});
		$("#p_endTime").off("click").on("click",function(){$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_endTime' });});
	};
	var _initArea = function(id,leve,parentId){
		$("#"+id+""+leve).empty();
		var param = {"parentAreaId":parentId,"leve":leve};
		$.callServiceAsHtml(contextPath+"/orderUndo/getArea",param,{
			"done" : function(response){
				var data = eval("(" + response.data + ")");
				if(data.code != 0&&data.code != "0") {
					//$.alert("提示","加载区划失败,请稍后重试");
					return;
				}else{
					var areaTree = data.areaTree ;
					$.each(areaTree,function(i, value){
						$("#"+id+""+leve).append("<option value='"+value.commonRegionId+"'>"+value.regionName+"</option>");
						if(leve<4&&i==0){
							_initArea(id,leve+1,value.commonRegionId);
						}
                    });
				}
			}
		});
	};
	
	//查询
	var _queryOrderList = function(pageIndex){
		/*
		var custdata = $("#partyName").html() ;
		if(custdata==null||custdata=="null"){
			$.alert("提示","请先定位客户再查询");
			return ;
		}
		*/
		if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
			$.alert("提示","请选择'地区'再查询");
			return ;
		}
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {"p_areaId":$("#p_areaId").val(),
				"p_startTime":$("#p_startTime").val().replace(/-/g,''),
				"p_endTime":$("#p_endTime").val().replace(/-/g,''),
				"p_channelId":$("#p_channelId").val(),
				"p_olNbr":$("#p_olNbr").val(),
				"p_hm":$("#p_hm").val(),
				"p_partyId":OrderInfo.cust.custId==undefined?"":OrderInfo.cust.custId,
				curPage:curPage,
				pageSize:10
		};
		
		$.callServiceAsHtmlGet(contextPath+"/print/list",param,{
			"before":function(){
				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				//alert(response.pageData);
				$("#reprint_list").html(response.data).show();
				$("#tab_orderList td:last-child a").off("click").on("click", function(event){
					$("#olId_inp").val($(this).attr("olid"));
					$("#chargeItems_inp").val("");
					$("#busiType_inp").val("1");
					$("#voucher_form").submit();
				});
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	var _showDetail = function(id,obj){
		var orderType=$(obj).attr("ordertype");
		var isNew=$(obj).attr("isNew");
		if(orderType=='backToSell'&&isNew=="false"){
			_showTitle(id,obj);
		}
		var html = $("#detail"+id).html();
		new $.Zebra_Dialog(html, {
			'open_speed':1000,
			'keyboard':false,
			'modal':true,
			'overlay_close':false,
			'overlay_opacity':.5,
			'type':     false,
			'title':    "订单详细",
			'buttons':  ['确定']
		});
	};

	var _showTitle = function(id,obj){
		var orderType=$(obj).attr("ordertype");
		var isNew=$(obj).attr("isNew");
		var titleHtml="<br>订单详细信息：<br>--------------<br>";
		var divHtml="";
		if(orderType=='backToSell'&&isNew=="false"){
			var newNo=$("#newOrder"+id).text().substr(6);
			if(newNo!=''&&newNo!=undefined){
				var param = {"OrderNo":newNo};
				var response = $.callServiceAsJsonGet(contextPath+"/order/mgr/queryOrderByNo",param);
				if(response.code == 0) {
					var orderList=response.data.orderList;
					var flag=false;
					if(orderList!=undefined){
						$.each(orderList,function(i,orderMap){
							flag=true;
							titleHtml=" \r订单详细信息： \r-------------- \r";
							divHtml="";
							var mapStr=JSON.stringify(orderMap);
							var order=$.parseJSON(mapStr);
							if(!checkVale(order.mhk)){
								if(!checkVale(order.mhk.UnitPrice)){
									titleHtml=titleHtml+"  终端信息： \r    名称："+order.mhk.MktResName+" \r    价格："+order.mhk.UnitPrice/100+" \r    颜色："+order.mhk.TermColor;
									divHtml=divHtml+'<div>终端信息</div><div style="margin-left: 20px"><div>终端名称：'+order.mhk.MktResName+'</div><div>终端价格：'+order.mhk.UnitPrice/100+'元</div><div>终端颜色：'+order.mhk.TermColor+'</div></div>';
								}else{
									titleHtml=titleHtml+"  终端信息： \r    名称："+order.mhk.MktResName+" \r    价格：--  \r    颜色："+order.mhk.TermColor;
									divHtml=divHtml+'<div>终端信息</div><div style="margin-left: 20px"><div>终端名称：'+order.mhk.MktResName+'</div><div>终端价格：--</div><div>终端颜色：'+order.mhk.TermColor+'</div></div>';
								}
							}
							if(!checkVale(order.uim)){
								titleHtml=titleHtml+" \r  ------- \r";
								titleHtml=titleHtml+"  智能卡信息 ： \r    卡类型："+order.uim.MktResName+" \r    ICCID："+order.uim.MktResInstCode+" ";
								divHtml=divHtml+'<div>智能卡信息</div><div style="margin-left: 20px"><div>卡类型：'+order.uim.MktResName+'</div><div>ICCID：'+order.uim.MktResInstCode+'</div></div>';
							}
							if(!checkVale(order.phoneNumber.AccNbr)){
								titleHtml=titleHtml+" \r  ------- \r";
								titleHtml=titleHtml+"  号码信息："+order.phoneNumber.AccNbr;
								divHtml=divHtml+'<div>号码信息 ：'+order.phoneNumber.AccNbr+'</div>';
							}
							if(!checkVale(order.offer)){
								titleHtml=titleHtml+" \r  ------- \r";
								titleHtml=titleHtml+"  套餐信息："+order.offer.ProdOfferName;
								divHtml=divHtml+'<div>套餐信息 ：'+order.offer.ProdOfferName+'</div>';
							}
							if(!checkVale(order.cust)){
								titleHtml=titleHtml+" \r  ------- \r";
								titleHtml=titleHtml+"  客户信息：  \r    姓    名："+order.cust.CustName+" \r    证件类型："+order.cust.CertTypeName+" \r    证件编码："+order.cust.CertNumber;
								divHtml=divHtml+'<div>客户信息 </div><div style="margin-left: 20px"><div>客户姓名：'+order.cust.CustName+'</div><div>证件类型：'+order.cust.CertTypeName+'</div><div>证件号码：'+order.cust.CertNumber+'</div></div>';
							}
							if(!checkVale(order.order)){
								titleHtml=titleHtml+" \r  ------- \r";
								titleHtml=titleHtml+"  订单其它信息： \r    订单类型："+order.order.OrderTypeName+ " \r    受理时间："+order.order.AcceptTime;
								divHtml=divHtml+'<div>订单其它信息：</div><div style="margin-left: 20px"><div>订单类型：'+order.order.OrderTypeName+'</div><div>受理时间：'+order.order.AcceptTime+'</div></div>';
							}
						});
					}
					if(flag){
						$("#detail"+id).html(divHtml);
						$(obj).parent().attr("title",titleHtml);
					} 
					$(obj).attr("isNew","true");
				}
			}
		}
	};


	var checkVale=function(obj){
		if(obj==undefined||obj==''){
			return true;
		}
		return false;
	};

	//受理回执单打印
	var _printReceipt = function(orderNo){
		var busiType = $("#busiType").val();
		var param = {
			"busiType":busiType,
			"startPage" :0,
			"endPage" :10,
			"orderNo":orderNo
		};
		
		var url = contextPath + "/order/print/queryReceiptPrint";
		//订单日志处理（不一定写日志），返回发票费用项
		$.ecOverlay("获取订单打印信息中，请稍等...");
		var response = $.callServiceAsJsonGet(url,param);
		if(response.code==0){
			var templateCode =response.data.TEMPLATE_CODE;
			var receiptInfo =response.data.RECEIPT_INFO;
			if("qr_order_back"==templateCode||"qr_term_ex"==templateCode||"qr_uim_ex"==templateCode||"qr_order_new"==templateCode){
				order.qrcode.genQrCode(eval("(" + receiptInfo + ")"));
				$.unecOverlay();
				return;
			}
			/*if("qr_order_back"==templateCode){ //订单返销二维码模板
		   		 
		   	}else if("qr_term_ex"==templateCode){ //终端换货二维码模板
		   		 
		   	}else if("qr_uim_ex"==templateCode){ //补换卡二维码模板
		   		 
		   	}else if("qr_order_new"==templateCode){ //苹果直营店新装二维码模板
		   		 
		   	}else */
			var strFrom = "";
			if("receipt_order_new"==templateCode){ //苹果直营店新装业务登记单模板
				strFrom = "pdfReceipt";
		   	}else if("receipt_term_ex"==templateCode){ //终端换货业务登记单模板
		   		strFrom = "pdfReceiptTermEx";
		   	}else if("receipt_uim_ex"==templateCode){ //补换卡业务登记单模板
		   		strFrom = "pdfReceiptUIMEx";
		   	}else if("receipt_order_back"==templateCode){ //订单返销业务登记单模板
		   		strFrom = "pdfReceiptOrderBack";
		   	}else if("protocol_ip4s_buy_terminal"==templateCode){ //入网协议-iphone4s-购机送费
		   		strFrom = "pdfNetProtocol";
		   	}else if("protocol_ip4s_buy_charge"==templateCode){   //入网协议-iphone4s-存费送机
		   		strFrom = "pdfNetProtocol";
		   	}else if("protocol_ip5_buy_terminal"==templateCode){  //入网协议-iphone5-购机送费
		   		strFrom = "pdfNetProtocol";
		   	}else if("protocol_ip5_buy_charge"==templateCode){    //入网协议-iphone5-存费送机
		   		strFrom = "pdfNetProtocol";
		   	}else if("protocol_ip5s_buy_terminal"==templateCode){ //入网协议-iphone5s-购机送费
		   		strFrom = "pdfNetProtocol";
		   	}else if("protocol_ip5s_buy_charge"==templateCode){   //入网协议-iphone5s-存费送机
		   		strFrom = "pdfNetProtocol";
		   	}
			$("#"+strFrom+"FormOrder").val(receiptInfo);
			$("#"+strFrom+"Form").submit();
		}else{
			alert("获取订单打印信息失败！");
		}
		$.unecOverlay();
	};
	
	return {
		init:_init,
		initArea:_initArea,
		queryOrderList:_queryOrderList,
		printReceipt:_printReceipt,
		showDetail:_showDetail,
		showTitle:_showTitle
	};
})();
//初始化
$(function(){
	common.reprint.init();
	common.reprint.initArea("q_area",2,"-1");
	
	$("#q_area2").off("change").on("change",function(){
		$("#q_area4").empty();
		common.reprint.initArea("q_area",3,$(this).val());
	});
	$("#q_area3").off("change").on("change",function(){
		common.reprint.initArea("q_area",4,$(this).val());
	});
});

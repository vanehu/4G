
CommonUtils.regNamespace("repair", "main"); 

/**
 *支付补单.
 */
repair.main = (function(){
	
	var _chargeItems = [];
	
	var _olId="";
	
	var _olNbr="";
	
	var _soNbr="";
	
	//查询
	var _queryCartList = function(pageIndex){
		if($("#alert-modal").length>0){
			$("#alert-modal").hide();
		}
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
//		if(pageIndex==1){
//			$("#islastPage").val(0);
//			$("#currentPage").val(1);
//		}
		var qryNumber=$("#p_qryNumber").val();
		var param = {
					"startDt":($("#p_start_input").val()).replace(/\//g,''),
					"endDt":($("#p_start_input").val()).replace(/\//g,''),
					"qryNumber":qryNumber,
					"olStatusCd":"100002",
					"busiStatusCd":"100002",
					"olNbr":$("#p_olNbr").val(),
					"qryBusiOrder":"",
					"channelId":$("#p_channelId").val(),
					"areaId":$("#p_channelId").attr("areaid"),
					nowPage:curPage,
					pageSize:10
			};
		$.callServiceAsHtmlGet(contextPath+"/app/pay/repair/cartList",param,{
			"before":function(){
				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
				//$.unecOverlay();
			},
			"done" : function(response){
				$.unecOverlay();
				if(response && response.code == -2){
					return ;
				}else{
					if(response.data==""||(response.data).indexOf("没有查询到结果")>=0){
						if(OrderInfo.order.step==1){
							$.alert("提示","没有查询到结果");
							return;
						}
										
					}
					OrderInfo.order.step=2;
					 $("#nav-tab-2").addClass("active in");
					 $("#tab2_li").addClass("active");
					 $("#nav-tab-1").removeClass("active in");
				 	 $("#tab1_li").removeClass("active");
					 $("#cartList").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};

	

	var _init = function(){
		OrderInfo.order.step=1;
		var param = {"attrSpecCode":"EVT-0002"} ;
		var $div =$('<i class="iconfont pull-left p-l-10">&#xe61d;</i>');
		var $div2 =$('<i class="iconfont pull-right p-r-10">&#xe66e;</i>');
		var $sel = $('<select id="p_olStatusCd" class="myselect select-option" data-role="none" ></select>');  
		var $defaultopt = $('<option value="" selected="selected">购物车状态</option>');
		$sel.append($defaultopt);
		$.callServiceAsJson(contextPath+"/app/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							 $option = $('<option value="'+busiStatus.attrValueCode+'">'+busiStatus.attrValueName+'</option>');				  		
							 $sel.append($option);
						}
					}
					$("#olStatusDiv").append($div).append($sel).append($div2);
					order.broadband.init_select();//刷新select组件，使样式生效
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("提示","调用主数据接口失败！");
					return;
				}
			}
		});
	};

var _queryPayStatus=function(index){
	var checkUrl = contextPath + "/app/order/getPayOrdStatus";
	_olId=$("#olId_"+index).val();
	_olNbr=$("#olNbr_"+index).val();
	_soNbr=$("#soNbr_"+index).val();
	if(_olId==undefined){
		$.alert("提示","购物车id为空！");
		return;
	}
	var checkParams = {
			"olId" : _olId
			
	};
	$.callServiceAsJson(checkUrl,checkParams, {
		"before":function(){
			$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
		},	
		"done" : function(response){
			$.unecOverlay();
			if (response.code == 0) {//支付成功的补下计费接口
				var payType=response.data.payCode;
				_chargeItems=response.data.chargeItems;
				for(var i=0;i<_chargeItems.length;i++){//费用项修改付费方式
					_chargeItems[i].payMethodCd=payType;
                    if(_chargeItems[i].posSeriaNbr==""){//将[]转为空
                    	_chargeItems[i].posSeriaNbr=""
                    }
				}
				//补下计费接口
				_chargeSave();
			}else if(response.code==1){//支付接口支付失败
				if(response.data.respCode=="POR-2004"){//支付平台支付失败，跳转支付平台重新支付
					var payType=response.data.payCode;
					_chargeItems=response.data.chargeItems;
					if(_chargeItems==null || _chargeItems==""){
						$.alert("提示","支付平台未进行收费，费用项为空，无法进行补收费！");
						
						return;
					}
					_getPayTocken(response.data.payAmount+"");
				}else if(response.data.respCode=="POR-2002"){//支付平台查询不到订单
					$.alert("提示","支付平台未查到该订单，无法进行补收费,您可以选择作废订单！");
					$("#button_"+index).attr("style","position:absolute; right:10px;background: #a5a3a2;");
//					$("#button_"+index).off("onclick").on("onclick",function(event){
//						repair.main.delOrder(index);
//					});
				}else{
					$.alert("提示","支付平台未进行收费,无法进行补收费！");
				}
				//_calchargeInit(olId,olNbr,soNbr);
			}else if(response.code==1002){
				$.alert("提示",response.data);
			}else{
				$.alertM(response.data);
			}
		}
	});
};

var _chargeSave = function(){
	var params={
			"olId":_olId,
			"soNbr":_soNbr,
			"areaId" : OrderInfo.staff.areaId,
			"chargeItems":_chargeItems
	};
	var msg="";
	SoOrder.getToken();
	var url=contextPath+"/app/order/chargeSubmit?token="+OrderInfo.order.token;
	$.callServiceAsJson(url,params, {
		"before":function(){
			$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
		},	
		"done" : function(response){
			$.unecOverlay();
			if (response.code == 0) {
				submit_success=true;
				msg="补收费成功";
				$("#toCharge").attr("disabled","disabled");				
				_showFinDialog(msg);
				return;
			}else if (response.code == -2) {
				$.alertM(response.data);
				//SoOrder.showAlertDialog(response.data);
			}else{
				if(response.data!=undefined){
					alert(response.data);
					//$.alert("提示",response.data);
				}else{
					$.alert("提示","费用信息提交失败!");
				}
			}
		}
	});
};



var _showFinDialog=function(msg){
	var title='受理结果';
	$("#btn-dialog-ok").removeAttr("data-dismiss");
	$('#alert-modal').modal({backdrop: 'static', keyboard: false});
	$("#btn-dialog-ok").off("click").on("click",function(){
		_queryCartList(1);
	});
	$("#modal-title").html(title);
	$("#modal-content").html(msg);
	$("#alert-modal").modal();
};



/**
 * 获取支付平台支付页面
 */
var _getPayTocken = function(charge){
	var busiUpType="1";
	order.calcharge.busiUpType="-1";//补标志
	var params={
			"olId":_olId,
			"soNbr":_olNbr,
			"busiUpType":busiUpType,
			"chargeItems":_chargeItems,
			"charge":charge
	};
	var url = contextPath+"/app/order/getPayUrl";
	var response = $.callServiceAsJson(url, params);
	if(response.code==0){
		payUrl=response.data;
		common.callOpenPay(payUrl);//打开支付页面
	}else if(response.code==1002){
		$.alert("提示",response.data);
	}
	else{
		$.alertM(response.data);
	}
};

/**
 * 获取支付平台返回订单状态
 */
var _queryPayOrdStatus1 = function(soNbr, status,type) {
	if ("1" == status) { // 原生返回成功，调用支付平台查询订单状态接口，再次确定是否成功，如果成功则调用收费接口
		var checkUrl = contextPath + "/app/order/getPayOrdStatus";
		var checkParams = {
				"olId" : soNbr
				
		};
		$.callServiceAsJson(checkUrl,checkParams, {
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {//支付成功的补下计费接口
					var payType=response.data.payCode;
					_chargeItems=response.data.chargeItems;
					for(var i=0;i<_chargeItems.length;i++){//费用项修改付费方式
						_chargeItems[i].payMethodCd=payType;
	                    if(_chargeItems[i].posSeriaNbr==""){//将[]转为空
	                    	_chargeItems[i].posSeriaNbr=""
	                    }
					}
					//补下计费接口
					_chargeSave();
				}else if(response.code==1){//支付接口支付失败
					//_calchargeInit(olId,olNbr,soNbr);
				}else if(response.code==1002){
					$.alert("提示",response.data);
				}else{
					$.alertM(response.data);
				}
			}
		});
	}
};

//作废购物车
var _delOrder = function(index){
	_olId=$("#olId_"+index).val();
	if(_olId!=0&&_olId!=undefined){  //作废购物车
		var param = {
			olId : _olId,
			areaId : OrderInfo.getAreaId()
		};
		$.callServiceAsJsonGet(contextPath+"/app/order/delOrder",param,{
			"before":function(){
				$.ecOverlay("<strong>正在处理中,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code==0) {
					if(response.data.resultCode==0){
						$.alert("提示","订单作废成功！");
						_queryCartList(1);
					}
				}else if (response.code==-2){
					$.alertM(response.data.errData);
				}else {
					$.alert("提示","订单作废失败！");
				}
			},
			fail:function(response){
				$.alert("提示","信息","请求可能发生异常，请稍后再试");
			}
		});
	}
};
	return {
		queryCartList			:_queryCartList,
		init				    :_init,
		queryPayStatus          :_queryPayStatus,
		chargeSave              :_chargeSave,
		getPayTocken            :_getPayTocken,
		queryPayOrdStatus1      :_queryPayOrdStatus1,
		delOrder                :_delOrder

	};
	
})();

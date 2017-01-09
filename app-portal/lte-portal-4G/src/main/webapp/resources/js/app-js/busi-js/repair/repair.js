
CommonUtils.regNamespace("repair", "main"); 

/**
 *支付补单.
 */
repair.main = (function(){
	
	var _chargeItems = [];
	//查询
	var _queryCartList = function(pageIndex){
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
						$.alert("提示","没有查询到结果");
						return;
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
	var olId=$("#olId_"+index).val();
	var soNbr=$("#soNbr_"+index).val();
	var checkParams = {
			"olId" : olId
			
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
				_chargeSave(olId,soNbr);
			}else if(response.code==1){//支付接口支付失败
				alert("支付失败,暂时无法进行补收费！");
			}else if(response.code==1002){
				$.alert("提示",response.data);
			}else{
				$.alertM(response.data);
			}
		}
	});
};

var _chargeSave = function(olId,soNbr){
	var params={
			"olId":olId,
			"soNbr":soNbr,
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

	return {
		queryCartList			:_queryCartList,
		init				    :_init,
		queryPayStatus          :_queryPayStatus,
		chargeSave              :_chargeSave

	};
	
})();

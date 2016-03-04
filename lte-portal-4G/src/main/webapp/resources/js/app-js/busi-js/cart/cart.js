
CommonUtils.regNamespace("cart", "main");

/**
 *订单查询.
 */
cart.main = (function(){
	
	//查询
	var _queryCartList = function(pageIndex,scroller){
		OrderInfo.actionFlag=40;
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var qryNumber=$("#p_qryNumber").val();
		var param = {} ;
		if($("#if_p_olNbr").is(':checked')){
			$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_olNbr",true,null);
			$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_qryNumber",false,null);
			$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_channelId",false,null);
			$('#cartFormdata').data('bootstrapValidator').validate();
			if(!$('#cartFormdata').data('bootstrapValidator').isValid()){
				return;
			}
			param = {"areaId":$("#p_areaId").val(),
					"olNbr":$("#p_olNbr").val(),
					"qryBusiOrder":$("#p_qryBusiOrder").val(),
					"startDt":"",
					"endDt":"",
					"qryNumber":"",
					"channelId":"",
					"olStatusCd":"",
					"busiStatusCd":"",
					nowPage:curPage,
					pageSize:10
			};
		}else{
			param = {
					"startDt":($("#p_startDt").val()).replace(/-/g,''),
					"endDt":($("#p_endDt").val()).replace(/-/g,''),
					"qryNumber":qryNumber,
					"olStatusCd":$("#p_olStatusCd").val(),
					"busiStatusCd":$("#p_busiStatusCd").val(),
					"olNbr":"",
					"qryBusiOrder":$("#p_qryBusiOrder").val(),
					"channelId":$("#p_channelId").val(),
					"areaId":$("#p_channelId").attr("areaid"),
					nowPage:curPage,
					pageSize:200
			};
//			$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_olNbr",false,null);
//			if(ec.util.isObj($("#p_qryNumber").val())){
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_qryNumber",true,null);
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_channelId",false,null);
//			}else if(ec.util.isObj($("#p_channelId").val())){
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_qryNumber",false,null);
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_channelId",true,null);
//				param["areaId"]=$("#p_channelId").find("option:selected").attr("areaid");
//			}else{
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_qryNumber",true,null);
//				$('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_channelId",true,null);
//			}
//			$('#cartFormdata').data('bootstrapValidator').validate();
//			if(!$('#cartFormdata').data('bootstrapValidator').isValid()){
//				return;
//			}
		} 
		$.callServiceAsHtmlGet(contextPath+"/app/report/cartList",param,{
			"before":function(){
				$.ecOverlay("购物车查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					OrderInfo.order.step=2;
					$("#cart_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
					
					if(curPage == 1){
							$("#cart_search").hide();
							$("#cart_list").html(response.data).show();
							$("#cart_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
						if(curPage > 1){
							$("#all_cart_list").append(response.data);
							$("#cart_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	//改变渠道-监听
	var _channelChange=function(){
		if($("#p_channelId").val()!=""){
			$("#p_areaId_val").attr("disabled", true) ;
		}else{
			$("#p_areaId_val").attr("disabled", false) ;
		}
	};
	
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_queryCartList(scrollObj.page,scrollObj.scroll);
		}
	};
	
	//购物车流水号选中与否
	var _olNbrChange=function(){
		if($("#if_p_olNbr").is(':checked')){
			$("#p_areaId_val").attr("disabled", false) ;
			$("#p_olNbr").attr("disabled", false) ;
			$(".form_date").datetimepicker('remove');
			$("#p_qryNumber").attr("disabled", true) ;
			$("#p_olStatusCd").attr("disabled", true) ;
			$("#p_busiStatusCd").attr("disabled", true) ;
			$("#p_channelId").attr("disabled", true) ;
		}else{
			$("#p_olNbr").attr("disabled", true) ;
			$(".form_date").datetimepicker({
		    	language:  'zh-CN',
		        weekStart: 1,
		        todayBtn:  1,
				autoclose: 1,
				todayHighlight: 1,
				startView: 2,
				minView: 2,
				forceParse: 0
		    });
			$("#p_qryNumber").attr("disabled", false) ;
			$("#p_olStatusCd").attr("disabled", false) ;
			$("#p_busiStatusCd").attr("disabled", false) ;
			$("#p_channelId").attr("disabled", false) ;
			if($("#p_channelId").val()!=""){
				$("#p_areaId_val").attr("disabled", true) ;
			}else{
				$("#p_areaId_val").attr("disabled", false) ;
			}
		}
		$("select").addClass("styled-select");
	};
	
	//校验表单提交
	var _validatorForm=function(){
		$('#cartFormdata').bootstrapValidator({
	        message: '无效值',
	        feedbackIcons: {
	            valid: 'glyphicon glyphicon-ok',
	            invalid: 'glyphicon glyphicon-remove',
	            validating: 'glyphicon glyphicon-refresh'
	        },
	        fields: {
	        	p_qryNumber: {
	        		trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '接入号和渠道不能同时为空'
	                    }
	                }
	            },
	            p_olNbr: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '购物车流水不能为空'
	                    }
	                }
	            },
	            p_channelId: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '接入号和渠道不能同时为空'
	                    }
	                }
	            }
	        }
	    });
	};
	
	//受理单详情查询
	var _queryCartInfo=function(olId){
		var param = {"olId":olId};
		param.areaId=$("#p_areaId").val();
		$.callServiceAsHtmlGet(contextPath+"/app/report/cartInfo",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#cart_list").hide();
					$("#cart_info").html(response.data).show();
					OrderInfo.order.step=3;
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//受理业务详情查询
	var _showOffer = function(obj){
		var param = {"olId":$(obj).attr("olid"),"boId":$(obj).attr("boid"),"offerId":$(obj).attr("offerid"),"prodId":$(obj).attr("prodid")};
		$.callServiceAsHtmlGet(contextPath+"/app/report/cartOfferInfo",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#cart_info").hide();
					$("#cart_item_detail").html(response.data).show();
					OrderInfo.order.step=4;
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	
	
	var _initDic = function(){
		OrderInfo.actionFlag=40;
		OrderInfo.order.step=1;
		var param = {"attrSpecCode":"EVT-0002"} ;
		$.callServiceAsJson(contextPath+"/app/staffMgr/getCTGMainData",param,{
			"done" : function(response){
				if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var busiStatus = data[i];
							$("#p_busiStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
							$("#p_olStatusCd").append("<option value='"+busiStatus.attrValueCode+"' >"+busiStatus.attrValueName+"</option>");
						}
						$("#p_busiStatusCd").addClass("styled-select");
						$("#p_olStatusCd").addClass("styled-select");
					}
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
	
	var _setCalendar = function(time){
		$("#p_start_input").val(time);
		$("#p_startDt").val(time);
	};
	
	//返回按钮调用
	var _cartBack = function(){
		if(OrderInfo.order.step==1){
			common.callCloseWebview();
		}else if(OrderInfo.order.step==2){
			$("#cart_search").show();
			$("#cart_list").hide();
			OrderInfo.order.step=1;
		}else if(OrderInfo.order.step==3){
			$("#cart_list").show();
			$("#cart_info").hide();
			OrderInfo.order.step=2;
		}else if(OrderInfo.order.step==4){
			$("#cart_info").show();
			$("#cart_item_detail").hide();
			OrderInfo.order.step=3;
		}else{
			common.callCloseWebview();
		}
	};
	return {
		cartBack				:			_cartBack,
		channelChange			:			_channelChange,
		queryCartList			:			_queryCartList,
		queryCartInfo			:			_queryCartInfo,
		initDic					:			_initDic,
		olNbrChange				:			_olNbrChange,
		scroll					:			_scroll,
		setCalendar				:			_setCalendar,
		showOffer				:			_showOffer,
		validatorForm			:			_validatorForm
	};
	
})();

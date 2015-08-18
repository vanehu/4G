/**
 * 押金管理
 * 
 * @author jiangrh
 */
CommonUtils.regNamespace("bill", "foregiftMgr");

bill.foregiftMgr = (function(){
	var _init = function(){
		_initTxt($("#bussType").val());
		$("#bussType").change(function(){_initTxt($(this).val());});
		$("#btn_foregiftQry").off("click").on("click",function(){_queryForegiftCustList($("#bussType option:selected").val());});
	};
	var _initTxt = function(num){
		if(num=='1'){
    		$('#p_hm').val('');
    		$('#typeval1').show();
    		$('#typename1').show();
    		$('#typename2').hide();
    		$('#typeval2').hide();
    	}else{
    		$('#identityNum').val('');
    		$('#typeval2').show();
    		$('#typename2').show();
    		$('#typename1').hide();
    		$('#typeval1').hide();
    	}
	}
	var saveParam = "";
	var _queryForegiftCustList = function(num){
		if(num==1&&!$("#identityNum").val()){
			$.alert("提示","请输入身份证号！");
			return ;
		}else if(num==2&&!$("#p_hm").val()){
			$.alert("提示","请输入接入号！");
			return ;
		}
		var param ={};
		var url = contextPath+"/bill/foregiftlist";
		if(num==1){
			param = {
				"acctNbr":"",
				"identityCd":"",
				"identityNum":$("#identityNum").val(),
				"partyName":"",
				"type":"cust"
			};
		}else{
			param = {
				"matchType":1,
				"value":$("#p_hm").val(),
				//"value":"18108880424",
				"curPage":1,
				"pageSize":10,
				"ifCancel":"Y",
				"type":"prod"
			};
		}
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
//				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
//				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				if(response.code==-2){
					return;
				}else if(response.code != 0){
					$.alert("提示","客户查询失败，请重新查询！");
					return;
				}
				$("#cust_list").html(response.data).removeClass("cuberight in out").addClass("pageright").show();
				$("#phoneNumList tr").off("click").on("click",function(event){
					$("#phoneNumList tr").filter(".plan_select").removeClass("bg plan_select");
					$(this).addClass("bg").addClass("plan_select");
					var selectedId = $(this).children(":last-child").text();
					var name = $(this).children(":first-child").text();
					saveParam = {
						type:num,
						id:selectedId,
						name:name
					};
					if(num==2){
						saveParam.accnbr = $(this).children().eq(1).text();
						saveParam.custId = $(this).children().eq(-2).text();
						saveParam.status = $(this).children().eq(-3).text();
					}
					_getForegiftInfo(num,selectedId);//获取押金列表
					_getForegiftHistoryDetail(num,selectedId);//获取押金历史
					//changeSaveForegiftInfo(type,selectedId);
				});
			},
			fail:function(response){
//				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var changeSaveForegiftInfo = function(type,id){
		var infohtml = "<div id='type'>"+type+"</div><div id='id'>"+id+"</div>";
		$("#saveinfo").html('').html(infohtml);
	};
	
	var returnfee = [];
	var _getForegiftInfo = function(num,custid){
		var param = {
			objType:num,
			objId:custid
			//areaId:8320100
		};
		$.callServiceAsHtmlGet(contextPath+"/bill/queryForegift",param,{
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
				if(response.code==-2){
					return;
				}else if(response.code!=0){
					$.alert("提示","查询押金列表失败，请重新查询！");
					return;
				}
				$("#foregiftlist").html(response.data).removeClass("cuberight in out").addClass("pageright").show();
				$("#foregiftcontent").show();
				$("#foregiftList tr").each(function(){
					$(this).off("click").on("click",function(event){
						$("#foregiftList tr").filter(".plan_select").removeClass("bg plan_select");
						$(this).addClass("bg").addClass("plan_select");
						var acctItemId = $(this).children().eq(-2).text();
						var id = $(this).children().eq(-1).text();
						var state = $(this).children().eq(5).text();
						var acctItemTypeId = $(this).children("#acctItemTypeId").text();
						returnfee = [{
							acctItemId:acctItemId,
						    id:id,
						    num:num,
						    custid:custid,
						    state:state,
						    acctItemTypeId:acctItemTypeId
						}];
					});
				});
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//退押金
	var _returnForegift = function(){
		if(returnfee.length==0){
			$.alert("提示","请选择需要退款的押金单！");
			return;
		}else{
			returnfee[0];
		}
		if(saveParam.type==2){
			if(saveParam.status!="1000"){
				$.alert("提示","当前产品状态不可用，无法做退费！");
				return ;
			}
		}
		var param = {
			id:returnfee[0].id,
			acctItemId:returnfee[0].acctItemId,
			objId:returnfee[0].custid,
			objType:returnfee[0].num,
			custId:returnfee[0].custid,
			acctItemTypeId:returnfee[0].acctItemTypeId
		};
		var state = returnfee[0].state;
		if(state=="失效"){
			$.alert("提示","该押金已失效，不能做退押金业务，请重新选择！");
			return;
		}
		$.callServiceAsJson(contextPath+"/bill/returnForegift",param,{
			"before":function(){
				$.ecOverlay("订单提交中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==0){
					$.alert("提示",response.data);
					_getForegiftInfo(returnfee[0].num,returnfee[0].custid);
					_getForegiftHistoryDetail(returnfee[0].num,returnfee[0].custid);
				}else if(response.code==-2){
					$.alertM(response.data);
				}else{
					$.alert("提示","退回押金失败，请联系管理员！");
					return;
				}
				
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//获取押金历史
	var _getForegiftHistoryDetail = function(num,custid){
		var param = {
			objType:num,
			objId:custid,
			id:""
		};
		$.callServiceAsHtmlGet(contextPath+"/bill/queryForegiftHistoryDetail",param,{
			"before":function(){
//				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
//				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;widht:100%,height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
				}
				if(response.code==-2){
					return;
				}else if(response.code!=0){
					$.alert("提示","查询历史押金列表失败，请重新查询！");
					return;
				}
				$("#foregift_history").html(response.data).removeClass("cuberight in out").addClass("pageright");
			},
			fail:function(response){
//				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	//收取押金
	var _showSaveForegift = function(){
		if(saveParam==""){
			$.alert("提示","请选择需要添加押金的客户或产品！");
			return;
		}else{
			$("#custinfo").html("客户名称：");
			$("#custval").show();
			$("#custval input").val(saveParam.name);
			var infohtml = "<div id='type'>"+saveParam.type+"</div><div id='id'>"+saveParam.id+"</div>";
			$("#saveinfo").html('').html(infohtml);
		}
		if(saveParam.type==2){
			if(saveParam.status!="1000"){
				$.alert("提示","当前产品状态不可用，无法做收费！");
				return ;
			}
		}
		bill.foregiftMgr.printFlag = false;
		ec.form.dialog.createDialog({
			"id":"-foregiftDialog",
			width:600,
			height:200,
			zIndex: 1037,
			onClose: true,
			"initCallBack":function(dialogForm,dialog){
				//var payMethod = busi.common.queryCTGMainData("OTC-0001");
				//if(payMethod.length>0){
				//	var paymenthodhtml = "";
				//	for(var i =0;i<payMethod.length;i++){
				//		paymenthodhtml+="<option value='"+payMethod[i].attrValueCode+"'>"+payMethod[i].attrValueName+"</option>";
				//	}
				//	$("#payMethodCd").html(paymenthodhtml);
				//}
				var type = $("#type").text();
				var id = $("#id").text();
				//$("#payMethodCd").change(function(){
			    //	if($(this).val()=='110100'||$(this).val()=='160200'){
			    //		$("#posname").show();
			    //		$("#posval").show();
			    //	}else{
			    //		$("#posname").hide();
			    //		$("#posval").hide();
			    //	}
			    //});
				$("#submitbtn").off("click").on("click",function(){
					var amount = $("#amount").val();
					if(amount==""){
						$.alert("提示","请输入收费金额！");
						return;
					}
				    if(!ec.util.isDecimals(amount)){
				    	$.alert("提示", "请输入正确的金额！");
						return;
				    }
				    if(amount<=0){
				    	$.alert("提示", "押金金额必须大于0，请重新输入！");
						return;
				    }
				    bill.foregiftMgr.printFlag = $("#print_checkbox").is(":checked");
				    var flag = saveForegift(saveParam);
				    bill.foregiftMgr.printFlag = bill.foregiftMgr.printFlag && !!flag;
					dialogForm.close(dialog);
				});
			},
			"submitCallBack":function(){},
			"afterClose":function(){
				if (bill.foregiftMgr.printFlag) {
					query.offer.loadInst(); //加载实例到缓存
			    	var param={
		    			"soNbr":OrderInfo.order.soNbr,
		    			"billType" : 1,
		    			"olId" : OrderInfo.orderResult.olId,
		    			"areaId" : OrderInfo.staff.areaId,
		    			"acctItemIds":[]
			    	};
			    	common.print.prepareInvoiceInfo(param);
			    }
			}
		});
	};
	
	var saveForegift = function(args){
		var param = {
			objType:args.type,
			objId:args.id,
			charge:$("#amount").val()*100,
			payMethodCd:"100000",
			posNbr:-1,
			acctItemTypeId:$("#acctItemType").val()
		};
		if(args.type==1){
			param.custId = args.id;
			param.prodId = "";
		}else{
			param.custId = args.custId;
			param.prodId = args.id;
		}
		
		var response = $.callServiceAsJson(contextPath+"/bill/saveForegift",param,{});
		if(response.code==0){
			OrderInfo.orderResult = response.data;
			var feeAmount = $("#amount").val();
			var invoiceNbr = $("#invoiceNbr").val();
			var invoiceNum = $("#invoiceNum").val();
			var acctItemName = $("#acctItemType option:selected").text();
			_getForegiftInfo(args.type,args.id);
			_getForegiftHistoryDetail(args.type,args.id);
			return true;
		}else if(response.code==-2){
			$.alertM(response.data);
		}else{
			$.alert("提示",response.data);
			_getForegiftInfo(args.type,args.id);
			_getForegiftHistoryDetail(args.type,args.id);
		}
		return false;
		
	};
	
	var _changeTab = function(num){
		if(num == 1){
			$("#foregift_list").show();
			$("#foregift_history").hide();
		}else{
			$("#foregift_list").hide();
			$("#foregift_history").show();
		}
	};
	
	var _showDetail = function(id){
		var param = {
			objType:"",
			objId:"",
			id:id
		};
		$.callServiceAsHtmlGet(contextPath+"/bill/queryForegiftHistoryDetail",param,{
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
				if(response.code==-2){
					return;
				}else if(response.code!=0){
					$.alert("提示","查询历史押金列表失败，请重新查询！");
					return;
				}
				$("#detailDiv").html(response.data).removeClass("cuberight in out").addClass("pageright");

				if(response.code==0){
					ec.form.dialog.createDialog({
						"id":"-foregiftDetailDialog",
						"initCallBack":function(dialogForm,dialog){
													},
						"submitCallBack":function(dialogForm,dialog){},
						width:1200,height:400
					});
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _queryBalance = function(){
		var param ={
			
		};
	};
	return {
		init:_init,
		returnForegift:_returnForegift,
		showSaveForegift:_showSaveForegift,
		changeTab:_changeTab,
		showDetail:_showDetail,
		queryBalance:_queryBalance
	};
})();

//初始化
$(function(){
	bill.foregiftMgr.init();
});
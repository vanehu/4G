CommonUtils.regNamespace("order", "pre");

order.pre = (function(){

	
	 var _querypreorderlist = function(){
    	var _beginDate = $("#p_startDt").val().replace(/\//g,'');
		var _endDate = $("#p_endDt").val().replace(/\//g,'');
		var _orderId = $("#orderId").val();
		if(_beginDate==""||_endDate==""){
			$.alert("提示","请先选择时间段再进行查询");
			return;
		}
		if(_beginDate.replace(/\//g,'')>_endDate.replace(/\//g,'')){
			$.alert("提示","开始时间不能晚于结束时间");
			return;
		}
		
    	var param = {
//    			"StartDt":$("#p_startDt").val()+" 00:00:00",
//				"EndDt":$("#p_endDt").val()+" 23:59:59",
//				"CustOrderId":$("#orderId").val()
    			"ContractRoot": {
    		        "SvcCont": {
    		            "PreOrderListParam": {
//    		                "CertType": "31",
//    		                "CertNumber": "320102198712203612",
    		                "CustOrderId": _orderId,
//    		                "ContactPhoneNum": "18102130789",
    		                "StartDt": _beginDate,
    		                "EndDt": _endDate,
    		                "AcceptRegionId": "",
    		                "ChannelNbr": ""
//    		                "StaffCode": "71001415"
//    		                "ServiceType": "31"，
//    		                "OrderType": "2"
    		            }
    		        },
    		        "TcpCont": {
    		            "AppKey": "1000000201",
    		            "Method": "qry.order.saleorderlist",
    		            "DstSysID":"1000000269",
    		            "TransactionID": "1000000201201112041000000011",
    		            "ReqTime": "20160912160527486",
    		            "Sign": "123",
    		            "Version": "V1.0"
    		        }
    		    }


    	}
		$.callServiceAsJson(contextPath+"/app/saleorder/querysaleorderlist",param,{
			"before":function(){
				$.ecOverlay("订单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					$.ecOverlay("订单查询失败...");
					return ;
				}else{
					$.unecOverlay();
					$('.tab-box ul .active').removeClass('active');
					$('.tab-2').addClass('active');
					$('.main-box .info-box').addClass('dis-none');
					$('.tab-2-box').removeClass('dis-none');
					var preOrderListInfos = response.data.reult.ResultObj.PreOrderListInfos;
					var $resultlist = $('#search_result');
					if(preOrderListInfos.length == 0){
						$resultlist.append('<span>未查询到订单信息</span>');
						return;
					} else {
						$resultlist.append('<dt> <span>姓名</span><span>宽带套餐</span></dt>');
						$.each(preOrderListInfos, function(i, preOrderListInfo){
							var preOrderNbr = preOrderListInfo.preOrderNbr.toString();
							var custName = preOrderListInfo.custName;
							var $list = "<dd id=\"detailresultlist_" + preOrderNbr + "\" onclick=\"order.pre.querypreorderdetail(\'" + preOrderNbr.toString() + "\')\">";
							$list +="<span><p class=\"glyphicon glyphicon-check\"></p>"+ custName +"</span><span></span>";
							$list +="<span class=\"glyphicon glyphicon-chevron-down\" aria-hidden=\"true\"></span>";
							$list += "<ul id=\"detailresult_" + preOrderNbr + "\"  style=\"margin-top: 0;\"></ul></dd>";
							$resultlist.append($list);
						});
					}
					
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
		
		
    };
	var _querypreorderdetail = function(preOrderNbr){
		var param = {
				"ContractRoot": {
			        "SvcCont": {
			            "PreOrderDetailParam": {
			            	"AcceptRegionId": "",
			            	"PreOrderNbr": preOrderNbr.toString()
			            }
			        },
			        "TcpCont": {
			            "AppKey": "1000000201",
			            "Method": "qry.order.orderdetail",
			            "DstSysID":"1000000269",
			            "TransactionID": "1000000201201112041000000022",
			            "ReqTime": "20160912101504000",
			            "Sign": "test",
			            "Version": "V1.0"
			        }
			    }

		}
		if($("#detailresultlist_"+ preOrderNbr).hasClass('active')){
	          $("#detailresultlist_"+ preOrderNbr).removeClass('active');
	      }
	    else{
	         $('.search-result-list .active').removeClass('active');
	         $("#detailresultlist_"+ preOrderNbr).addClass('active');
	         
	         if(!$('#detailresult_'+ preOrderNbr).hasClass('result-details-box')){
	        	 $.callServiceAsJson(contextPath+"/app/saleorder/querysaleorderdetail",param,{
	 	 			"before":function(){
	 	 				$.ecOverlay("订单详情查询中，请稍等...");
	 	 			},
	 	 			"always":function(){
	 	 				$.unecOverlay();
	 	 			},
	 	 			"done" : function(response){
	 	 				if(response && response.code == -2){
	 	 					$.ecOverlay("订单查询失败...");
	 	 					return ;
	 	 				}else{
	 	 				
	 	 				$.unecOverlay();
	 	 				var custInfo = response.data.reult.ResultObj.CustInfo;
	 	 				var $detailresult = $('#detailresult_'+preOrderNbr);
	 	 				var $detailcontent = "<li><span>联系电话</span><span>"+ custInfo.ContactInfos.ContactPhoneNum +"</span></li>";
	 	 				$detailcontent += "<li><span>受理营业厅</span><span></span></li>";
	 	 				$detailcontent += "<li><span>宽带套餐</span><span></span></li>";
	 	 				$detailcontent += "<li><span>接入方式</span><span></span></li>";
	 	 				$detailcontent += "<li><span>速率</span><span></span></li>";
	 	 				$detailresult.append($detailcontent);
	 	 				}
	 	 			},
	 	 			fail:function(response){
	 	 				$.unecOverlay();
	 	 				$.alert("提示","服务忙，请稍后再试！");
	 	 			}
	 	 		});
	        	$('#detailresult_'+ preOrderNbr).addClass('result-details-box');
	         }
	        
	      }
		
	};

	return {
		querypreorderlist : _querypreorderlist,
		querypreorderdetail : _querypreorderdetail
	};
})();

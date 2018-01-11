CommonUtils.regNamespace("order", "zdyy");

order.zdyy = (function(){
	
	var _init = function(){
        OrderInfo.terminalList = [];
		var queryParam ={
		    attrId : CONST.BUSI_ORDER_ATTR.DELIVERY_METHOD
		};
		var response = $.callServiceAsJson(contextPath+"/common/querySpecListByAttrID",queryParam); //提货方式查询
		if(response.code == 0 && null != response.data){
			$.each(response.data,function(){
			    $("#deliveryMethod").append("<option value='"+this.attrValue+"' >"+this.attrName+"</option>");
			});
		}else {
			$.alert("提示","查询离散值查询接口错误");
			return;
		};

		var params = {"partyTypeCd":"-1"} ;
		var url=contextPath+"/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
				}
	   if(response.code==0){
					var data = response.data ;
					if(data!=undefined && data.length>0){
						//去除重复的证件类型编码
						var uniData = [];
						for(var i=0;i<data.length;i++){
							var unique = true;
							for(var j=0;j<uniData.length;j++){
								unique = unique && data[i].certTypeCd != uniData[j].certTypeCd;
								if(!unique){
									break;
								}
							}
							uniData.push(data[i]);
						}
						
						for(var i=0;i<uniData.length;i++){
							var certTypedate = uniData[i];
							$("#identityCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
						}
					}
				}
	};
	
	var _chooseArea = function(){
		order.area.chooseAreaTreeManger("report/cartMain","p_areaId_val","p_areaId",3);
	};
	
    var _queryzdyyinfos = function(pageIndex){
    	var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
    	var param = {
    			"startDt":$("#p_startDt").val()+" 00:00:00",
				"endDt":$("#p_endDt").val()+" 23:59:59",
				"olNbr":$("#olNbr").val(),
				"olType":$("#olType").val(),
				"busitype":"9",
				"accnum":$("#accnum").val(),
				"custname":$("#custname").val(),
				"CustIdCard":$("#CustIdCard").val(),
				"nowPage":curPage,
				"pageSize":10
    	};
    	var areaId = null ;
		if($("#p_channelId").val()&&$("#p_channelId").val()!=""){
			areaId = $("#p_channelId").find("option:selected").attr("areaid");
			if(areaId==null||areaId==""||areaId==undefined){
				$.alert("提示","渠道地区为空，无法查询！");
				return ;
			}
			param["channelId"] = $("#p_channelId").val() ;
		}else{
			areaId = $("#p_areaId").val();
			if(areaId==null||areaId==""||areaId==undefined){
				$.alert("提示","请选择 '地区' 再查询");
				return ;
			}
			param["channelId"] = "" ;
		}
		param["areaId"] = areaId ;
		
		$.callServiceAsHtmlGet(contextPath+"/order/queryzdyyList",param,{
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
					$("#zdyy_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
    };
    
    var _upOrderInfo = function(sonum,soId,status){
    	var Param = {
				"cust_so_number" : sonum,
				"cust_order_id" : soId,
				"status_cd" : status
			};
			var url=contextPath+"/order/updateorderzdyy";
			var response = $.callServiceAsJson(url, Param);
			_queryzdyyinfos($("#ec-pagination").find(".pagingSelect").text());
    };
    var _queryZdyyDetail = function(cust_so_number,status_cd){
    	var param = {
    			"cust_so_number":cust_so_number,
    			"status_cd":status_cd,
    			"detail":"true"
    		};
		$.callServiceAsJson(contextPath+"/order/queryZdyyDetail",param,{
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
					var data=response.data;
					var CUST_ORDER=data.CUST_ORDER;
					var CUST_ORDER_ATTR=data.CUST_ORDER_ATTR;
					
					$("#attr_so_num").html(CUST_ORDER.CUST_SO_NUMBER);
					$("#attr_name").html(CUST_ORDER.NAME);
					$("#attr_num").html(CUST_ORDER.CONTACT_NO);
					$("#attr_area").html(CUST_ORDER.COMMON_REGION_NAME);
					$("#attr_channel").html(CUST_ORDER.CHANNEL_NAME);
					
					$.each(CUST_ORDER_ATTR,function(i){
						var item=CUST_ORDER_ATTR[i];
						var attr_id=item.ATTR_ID;
						switch(attr_id){
						case 1001:$("#attr_brand").html(item.VALUE);break;
						case 1002:$("#attr_type").html(item.VALUE);break;
						case 1003:$("#attr_color").html(item.VALUE);break;
						case 1004:$("#attr_yx_type").html(item.VALUE);break;
						case 1005:$("#attr_use_type").html(item.VALUE);break;
						case 1006:$("#attr_num3").html(item.VALUE);break;
						case 1007:$("#attr_num4").html(item.VALUE);break;
						default:break;
						}
					});
					
					$("#d_query").hide();
					$("#d_zdyyInfo").show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
    };
    
    var _showMain = function(){
		$("#d_zdyyInfo").hide();
		$("#d_query").show();
	};
    	
	var _backToInit = function(){
		$("#terminal_zdyydeatil").hide();
		$("#d_query").show();
	};
	
	var _showTerminalList = function(){
		var custId = OrderInfo.cust.custId;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在选终端之前请先进行客户定位或者新建客户！");
			return;
		}
		var param = {};
		$.callServiceAsHtmlGet(contextPath + "/mktRes/terminal/zdyyPrepare",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					response.data='';
				}
				$("#div_terminalList_dialog").html(response.data);
				
				easyDialog.open({
					container : "div_terminalList_dialog"
				});
				
			}
		});	

	};
	
	
	var _suborderzdyy = function(){
		if(OrderInfo.terminalList.length<1){
			$.alert("提示","请选择需要预约的终端！");
			return;
		}
		if($("#deliveryMethod").val()==null || $("#deliveryMethod").val() ==""){
			$.alert("提示","提货方式不能为空！");
			return;
		};
		if($("#deliveryAddress").val()==null || $("#deliveryAddress").val() ==""){
			$.alert("提示","提货地址不能为空！");
			return;
		};
		if($("#p_startDt").val()==null || $("#p_startDt").val() ==""){
			$.alert("提示","提货时间不能为空！");
			return;
		};
		var  nbrCheck = /^[1][0-9]\d{9}$/;
		if($("#p_nbr").val()==null || $("#p_nbr").val() ==""){
			$.alert("提示","提货信息的联系电话不能为空！");
			return;
		}else if(!nbrCheck.test($("#p_nbr").val())){
			$.alert("提示","提货信息的联系电话，请输入11位手机号码！");
			return;
		};
		var zdyyData = {};
		var deliveryMethod = {
			itemSpecId : CONST.BUSI_ORDER_ATTR.DELIVERY_METHOD,
			value : $("#deliveryMethod").val()
		};
		var deliveryAddress = {
			itemSpecId : CONST.BUSI_ORDER_ATTR.DELIVERY_ADDRESS,
			value : $("#deliveryAddress").val()
		};
		var deliveryTime = {
			itemSpecId : CONST.BUSI_ORDER_ATTR.DELIVERY_TIME,
			value : $("#p_startDt").val()
		};
		var deliveryNbr= {
			itemSpecId : CONST.BUSI_ORDER_ATTR.DELIVERY_NBR,
			value : $("#p_nbr").val()
		};
		
		var identityCd = OrderInfo.cust.identityCd;
		var oldIdentidiesTypeCd = {
			itemSpecId : CONST.BUSI_ORDER_ATTR.IDENTIDIES_TYPE_CD,
	        value : identityCd	
		};
		var oldIdentidiesNumber = {
			itemSpecId : CONST.BUSI_ORDER_ATTR.IDENTIDIES_NUMBER,
		    value : OrderInfo.cust.certNum,
		    isEncrypt : "Y"	
		};
		var newIdentidiesTypeCd = {
			itemSpecId : CONST.BUSI_ORDER_ATTR.IDENTIDIES_TYPE_CD,
		    value : $("#identidiesTypeCd").val()	
		};
		var newIdentidiesNumber = {
			itemSpecId : CONST.BUSI_ORDER_ATTR.IDENTIDIES_NUMBER,
	        value : OrderInfo.boCustIdentities.identityNum	
		};
		var custOrderAttrs = [];
		//老客户定位
		if(ec.util.isObj(identityCd)){
			custOrderAttrs.push(oldIdentidiesTypeCd);//证件类型
			custOrderAttrs.push(oldIdentidiesNumber);//证件号码
		}else{//新建客户
			custOrderAttrs.push(newIdentidiesTypeCd);//证件类型
			custOrderAttrs.push(newIdentidiesNumber);//证件号码
		}
		custOrderAttrs.push(deliveryMethod);
		custOrderAttrs.push(deliveryAddress);
		custOrderAttrs.push(deliveryTime);
		custOrderAttrs.push(deliveryNbr);
		zdyyData.custOrderAttrs = custOrderAttrs;
		zdyyData.terminalList = OrderInfo.terminalList;
		SoOrder.getTokenSynchronize();
		//订单提交
		SoOrder.submitOrder(zdyyData);
	};
	
	
	var _queryCouponReserve = function(pageIndex,ifTransfer){
    	var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		};
		var areaId = $("#p_areaId").val();
		if(areaId==null||areaId==""||areaId==undefined){
			$.alert("提示","请选择 '地区' 再查询");
			return ;
		}
		if(areaId.indexOf("0000")>0){
			$.alert("提示","您所选择地区为省级地区无法查询预约单,请您选择市级地区！");
			return;
		}
		if(!$("#channelId").val()||$("#channelId").val()==""){
			$.alert("提示","请选择'渠道'再查询");
			return ;
		}
		OrderInfo.staff.soAreaId = areaId;
		var param = {
				"areaId":areaId,
				"channelId":$("#channelId").val(),
				"curPage":curPage,
				"pageSize":10,
				"ifTransfer":ifTransfer
    	};
		var identityCd = $("#identityCd").val();
		var identityNum = $("#identityNum").val();
		var reserveCode = $("#reserveCode").val();
		if(null != reserveCode && ""!= reserveCode){
			param.reserveCode = reserveCode;
		}else if ((null != identityCd && ""!= identityCd) && (null != identityNum && ""!= identityNum)){
			param.identityCd = identityCd;
			param.identityNum = identityNum;
		}else{
			$.alert("提示","预约号码和证件号必须至少输入一个");
			return;
		}		
		$.callServiceAsHtmlGet(contextPath+"/order/queryCouponReserve",param,{
			"before":function(){
				$.ecOverlay("终端预约记录查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else{
					$("#zdyy_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
    };
    
    var _zdyyUnsubscribe = function(id){
    	//终端预约前置调用后台校验
    	if(!_terminalCancelRoadCheck(id)){
    		return ;
    	}
		OrderInfo.actionTypeName = "终端取消预约";
		OrderInfo.businessName = $("#"+id).attr("couponName");
		OrderInfo.actionFlag = 38; // 终端退货
		var custId = $("#zdyy_custId").val();
		var coupons = [{
			id: $("#"+id).attr("id"),
			couponUsageTypeCd : "3", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
			inOutTypeId : "2",  //出入库类型
			inOutStatusId : "1",  //未发送
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : $("#"+id).attr("couponId"), //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_RESERVATION_SALE, //物品费用项类型
			couponNum : 1, //物品数量
			storeId : "", //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : $("#"+id).attr("apCharge") / 100, //物品价格,20140706 退货时价格不再取反
			couponInstanceNumber : "", //物品实例编码
			ruleId : "", //物品规则ID
			partyId : custId, //客户ID
			prodId : 0, //产品ID
			offerId : 0, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列	
			isOld : "Y" //旧终端
		}];
		var boRelas =[{
			relaBoId : $("#"+id).attr("boId"),
			relaTypeCd :CONST.RELA_TYPE_CD.ZDYY
		}];
		var data = {};
		data.busiObj = {
			"instId": $("#"+id).attr("id"),
			"isComp": "N",
			"objId": $("#"+id).attr("couponId")
        };
		data.boActionType = {
			actionClassCd : CONST.ACTION_CLASS_CD.MKTRES_ACTION,
			boActionTypeCd : CONST.BO_ACTION_TYPE.RETURN_TERMINAL
		};
		data.boRelas = boRelas;
		data.coupons = coupons;
		SoOrder.getTokenSynchronize();
		//订单提交
		OrderInfo.busitypeflag = 46;
		SoOrder.submitOrder(data);
	};
	//终端预约取消-在途校验  
	var  _terminalCancelRoadCheck =function(id){
		var areaId=$.trim($("#p_areaId").val());
		var sourceId =$.trim(id);
	     if(""==sourceId){
	    	 $.alert("提示", "终端预约号不能为空！");
	    	 return false;
	     }
		var param={
				"areaId":areaId,
				"sourceId":sourceId
		}			
		OrderInfo.busitypeflag = 47;
		var url=contextPath+"/order/terminalCancelRoadCheck";
		var response=$.callServiceAsJson(url, param);
		if(response.code == 0){
			if(response.data!=null&&response.data.cnt=="0"){
				return true;
			}else {
				$.alert("提示", "当前终端预约取消存在在途单，请不要重复提交 ！");
				return false;
			}
		}
		else if (response.code == -2) {
				$.alertM(response.data);
				return false;
		} else if (response.code == 1002) {
				$.alert("错误", response.data);
				return false;
		}else{
				$.alert("错误", "服务异常！");
				return false;
		}
	}
	return {
		queryzdyyinfos:_queryzdyyinfos,
		chooseArea:_chooseArea,
		upOrderInfo:_upOrderInfo,
		queryZdyyDetail:_queryZdyyDetail,
		showMain:_showMain,
		showTerminalList:_showTerminalList,
		backToInit :_backToInit,
		init : _init,
		suborderzdyy : _suborderzdyy,
		queryCouponReserve : _queryCouponReserve,
		zdyyUnsubscribe : _zdyyUnsubscribe,
		terminalCancelRoadCheck:_terminalCancelRoadCheck
	};
})();
$(function() {
	    order.zdyy.init();
		$("#p_startDt").off("click").on("click",function(){
			$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_startDt',maxDate:$("#p_endDt").val() });
		});
		$("#p_endDt").off("click").on("click",function(){
			$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_endDt',minDate:$("#p_startDt").val(),maxDate:'%y-%M-%d' });	
		});
		$("#p_channelId").change(function(){
			if($(this).val()!=""){
				$("#p_areaId_val").css("background-color","#E8E8E8").attr("disabled", true) ;
			}else{
				$("#p_areaId_val").css("background-color","white").attr("disabled", false) ;
			}
		});
});

//8986031300571169411
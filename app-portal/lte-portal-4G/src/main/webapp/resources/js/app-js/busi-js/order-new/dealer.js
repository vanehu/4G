/**
 * 发展人管理
 * 
 * @author yanghm
 * date 2016 10-26
 */
CommonUtils.regNamespace("order","dealer");

/** 发展人对象*/
order.dealer = (function() {
	var _isChange = false;
	var  _accNbr;
	
	//初始化发展人
	var _initDealer = function() {
		OrderInfo.order.dealerTypeList = [ {
			"PARTYPRODUCTRELAROLECD" : "40020005",
			"NAME" : "第一发展人"
		}, {
			"PARTYPRODUCTRELAROLECD" : "40020006",
			"NAME" : "第二发展人"
		}, {
			"PARTYPRODUCTRELAROLECD" : "40020007",
			"NAME" : "第三发展人"
		} ];
		
		if (OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 2
				|| OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 112 || OrderInfo.actionFlag == 201) { // 新装业务，套餐变更需要主套餐发展人
			var objInstId = OrderInfo.offerSpec.offerSpecId;
			var objId = objInstId + "_" + OrderInfo.SEQ.dealerSeq;
			var $select = $("#dealerType");
			$.each(OrderInfo.order.dealerTypeList, function() {
				$select.append("<option value='" + this.PARTYPRODUCTRELAROLECD+ "' >" + this.NAME + "</option>");
			});
			$("#dealerName").html(OrderInfo.staff.staffName);
			$("#dealerName").attr("staffid",OrderInfo.staff.staffId);
			$("#dealerName").attr("value",OrderInfo.staff.staffName);
			
		}
		if (OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 2
				|| OrderInfo.actionFlag == 14){
			if(AttachOffer.addTerminal){
				var $ul = $("#tab-change-list2");
				if(ec.util.isObj(prodId)){
					var $li = $("#terminalDiv_"+prodId);
					AttachOffer.terminalDiv.appendTo($li);
					$li.show();
				}
				$('#tab-change-list2').css('height','4.62rem');
			}
			$("#orderIdentidiesTypeCd").empty();
			cust.jbrcertTypeByPartyType(1,"orderIdentidiesTypeCd");
			$("#deleteJbr").hide();
			if(ec.util.isObj(OrderInfo.jbr.partyName)){
				$("#jbrName").html(OrderInfo.jbr.partyName);
				$("#jbrName").removeClass("font-secondary");
				$("#deleteJbr").show();
			}
			try{
				if(!ec.util.isObj(OrderInfo.curIp)){
					common.getMobileIp("cust.getIp");
				}
			}catch(err){
					
			}
		}
//		 $('#tab-change-list2').height($('#tab-li2').height());
	};
	function _showDealer(){
		$("#diqu").empty();
		var ad = ""+OrderInfo.staff.areaId;
		var areaId = ad.substring(0,3)+'0000';
	    _queryChildNode(areaId);
	    $("#dealerModal").modal("show");
	}
	function _queryChildNode(upRegionId) {
		var params = {
			'upRegionId' : upRegionId,
			'areaLevel' : 3,
			"areaLimit" : 0
		};
		$.callServiceAsJson(contextPath + "/app/orderQuery/areaTreeAllChilden",
				params, {
					"before" : function() {
					//	$.ecOverlay("地区加载中，请稍等...");
					},
					"done" : function(response) {
						if (response.data) {
							var selectHtml = "";
							var list = response.data;
							if (list.length > 0) {
								for(var i=0;i<list.length;i++){
									var ari = ""+OrderInfo.staff.areaId;
									ari = ari.substring(0,5)+'00'
									if(list[i].commonRegionId==ari){
										selectHtml=selectHtml+"<option  selected='selected' value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
									}else{
										selectHtml=selectHtml+"<option value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
									}
								}
								$("#diqu").html(selectHtml);
								order.broadband.init_select();//刷新select组件，使样式生效
							}
						}
					}
				});
	}

	//发展人-查询
	function _queryStaff(){
		if($("#staffCode").val().trim() == "" && $("#salesCode").val().trim() == ""){
			$.alert("操作提示","工号和销售员编码不能都为空！");
			return;
		}
		var param = {
				"dealerId":"dealer",
				"areaId":$("#diqu").val(),
				"code":$("#staffCode").val().trim(),
				"salesCode":$("#salesCode").val().trim(),//销售员编码
				"pageIndex":1,
				"pageSize":1
		};
		
		$.callServiceAsJson(contextPath + "/app/staffMgr/getStaffList2",param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if(!response){
					response.data='';
				}
				if(response.code==0){
					if(response.data.length == 0){
						$.alert("操作提示","没有查询到该员工信息！");
					}else{
						$("#dealerName").html(response.data[0].staffName).attr("staffId", response.data[0].staffId);
						$("#dealerModal").modal("hide");
						
					}
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("信息提示",response.msg);
					return;
				}			
			}
		});	

	}
	
	function _showJbr(){
	    $("#jbr").modal("show");
	}
	
	function _closeJBR(){
		if(OrderInfo.preBefore.idPicFlag=="ON" && OrderInfo.actionFlag!=3){
			if(!OrderInfo.virOlId){
				common.callPhotos('cust.getPicture');
				return;
			}
		}
		if(ec.util.isObj(OrderInfo.jbr.partyName)){
			$("#jbrName").html(OrderInfo.jbr.partyName);
			$("#jbrName").removeClass("font-secondary");
			$("#deleteJbr").show();
		}
		$("#jbr").modal("hide");
	}
	
	function _deleteJbr(){
		if(ec.util.isObj(OrderInfo.jbr)){
			OrderInfo.jbr.custId = undefined;
			OrderInfo.jbr.partyName = undefined;
			OrderInfo.jbr.telNumber = undefined;
			OrderInfo.jbr.addressStr = undefined;
			OrderInfo.jbr.identityCd = undefined;
			OrderInfo.jbr.mailAddressStr = undefined;
			OrderInfo.jbr.identityPic = undefined;
			OrderInfo.jbr.identityNum = undefined;
		}
		cust.clearJbrForm();
		OrderInfo.virOlId = "";
		$("#deleteJbr").hide();
		$("#jbrName").html("无经办人");
		$("#jbrName").addClass("font-secondary");
		
	}
	//删除协销人
	var _removeDealer = function(obj){
		$(obj).parent().parent().parent().parent().parent().remove();
		$.refresh($("#dealerTbody"));
	};
	
	//删除协销人
	var _removeAttDealer = function(id){
		$("li[name^='tr_"+id+"']").each(function(){
			$(this).remove();
		});
		$.refresh($("#dealerTbody"));
	};
	
	
	return {
		initDealer 			: _initDealer,
		showDealer          : _showDealer,
		queryChildNode      : _queryChildNode,
		queryStaff          : _queryStaff,
		showJbr				:_showJbr,
		closeJBR			:_closeJBR,
		deleteJbr			:_deleteJbr,
		removeAttDealer		:_removeAttDealer,
		removeDealer		:_removeDealer
		
	};
})();
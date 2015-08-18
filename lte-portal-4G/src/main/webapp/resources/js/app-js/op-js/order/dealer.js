/**
 * 发展人管理
 * 
 * @author wukf
 * date 2014-01-20
 */
CommonUtils.regNamespace("order","dealer");

/** 发展人对象*/
order.dealer = (function() {
	//初始化发展人
	var _initDealer = function() {
		if(order.ysl!=undefined){
			OrderInfo.order.dealerTypeList = [{"PARTYPRODUCTRELAROLECD":"40020005","NAME":"第一发展人"},{"PARTYPRODUCTRELAROLECD":"40020006","NAME":"第二发展人"},{"PARTYPRODUCTRELAROLECD":"40020007","NAME":"第三发展人"}];
		}else{
			$.ecOverlay("<strong>正在查询发展人类型中,请稍后....</strong>");
			var response = $.callServiceAsJson(contextPath+"/app/order/queryPartyProfileSpecList",null); //发展人类型查询
			$.unecOverlay();
			if(response.code==0){
				OrderInfo.order.dealerTypeList = response.data;
			}else if(response.code==-2){
				$.alertM(response.data);
				return;
			}else{
				$.alert("信息提示",response.msg);
				return;
			}
		}
		$("#dealerTbody").empty();  
		if(OrderInfo.actionFlag!=3&&OrderInfo.actionFlag!=2){
			$("#head").text(OrderInfo.offerSpec.offerSpecName);  
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2 || OrderInfo.actionFlag==14){ //新装业务，套餐变更需要主套餐发展人
			var objInstId = OrderInfo.offerSpec.offerSpecId;
			var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"' href='#' class='list-group-item'></li>");
			$li.append("<h5 class='list-group-item-heading text-warning'>主套餐</h5>");
			$li.append("<p class='list-group-item-text'>"+OrderInfo.offerSpec.offerSpecName+"</p><p> </p>");
			var $p = $('<p> </p>');
			var $div = $('<div class="row"> </div>');
			var $div2 = $('<div class="col-xs-6"> </div>');
						//var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
//			if(order.ysl!=undefined){
//				$select.append("<option value='40020005'>第一发展人</option>");
//				$select.append("<option value='40020006'>第二发展人</option>");
//				$select.append("<option value='40020007'>第三发展人</option>");
//			}else{
				$.each(OrderInfo.order.dealerTypeList,function(){
					$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
				});
//			}
			$div2.append($select);
			$div.append($div2);
//			if(order.ysl!=undefined){
//				var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true"></input></dd>');
//				$dl.append($dd);
//			}else{
				var $td = $('<div class="col-xs-6"><input type="text" onclick="javascript:order.dealer.showDealer(0,\'dealer\',\''+objId+'\');" onChange="javascript:this.staffId=OrderInfo.staff.staffId;this.value=OrderInfo.staff.staffName" class="form-control" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" ></input></div>');
				$div.append($td);
//			}
			$li.append($div);
			$li.append($p);
			OrderInfo.SEQ.dealerSeq++;
			$("#dealerTbody").append($li);
			//新装二次业务加载
			if(OrderInfo.provinceInfo.reloadFlag=="N"){
				if(OrderInfo.reloadProdInfo.dealerlist.length>0){
					$.each(OrderInfo.reloadProdInfo.dealerlist,function(){
						if(this.role!=undefined){
							$("#dealerType_"+OrderInfo.reloadProdInfo.objInstId).find("option[value='"+this.role+"']").attr("selected","selected");
							$("#dealer_"+OrderInfo.reloadProdInfo.objInstId).val(this.staffname);
						}
					});
				}
				$("#order_remark").val(OrderInfo.reloadProdInfo.orderMark);//订单备注初始化
			}
			$.refresh($("#dealerTbody"));
		}
		if(OrderInfo.actionFlag==6 ){ //加装需要接入产发展人
			$.each(OrderInfo.offerSpec.offerRoles,function(){
	    		$.each(this.prodInsts,function(){
	    			var objInstId = this.prodInstId;
	    			var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"'></li>");
	    			var $dl= $("<dl></dl>");
	    			var $tdType = $('<dd></dd>');
	    			var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
	    			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
	    			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
	    			$.each(OrderInfo.order.dealerTypeList,function(){
	    				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
	    			});
	    			$field.append($select);
	    			$tdType.append($field);
					var accNbr = "未选号";
					if(this.accNbr!=undefined && this.accNbr!=""){
						accNbr = prodInst.accNbr;
					}
					$dl.append("<dd>"+accNbr+"</dd>");
					$dl.append("<dd>"+this.objName+"</dd>");
					$dl.append($tdType);
					var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true" readonly="readonly" ></input></dd>');
					$dl.append($dd);
					var $button='<dd class="ui-grid"><div class="ui-grid-a"><div class="ui-block-a">';
					$button+='<button data-mini="ture" onclick="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</button></div>';
					$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</button></div></div></dd>';
					$dl.append($button);
					$li.append($dl);
					OrderInfo.SEQ.dealerSeq++;
					$("#dealerTbody").append($li);
					$.jqmRefresh($("#dealerTbody"));
	    		});
	    	});
		}
		if(OrderInfo.actionFlag==13){ //裸机销售需要发展人
			var objInstId = $("#mktResId").val();
			var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"'></li>");
			var $dl= $("<dl></dl>");
			var $tdType = $('<dd></dd>');
			var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
			$.each(OrderInfo.order.dealerTypeList,function(){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			});
			$field.append($select);
			$tdType.append($field);
			$dl.append($tdType);
			var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true" readonly="readonly" ></input></dd>');
			$dl.append($dd);
			var $button='<dd class="ui-grid"><div class="ui-grid-a"><div class="ui-block-a">';
			$button+='<button data-mini="ture" onclick="javascript:order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
			$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</button></div></div></dd>';
			$dl.append($button);
			$li.append($dl);
			OrderInfo.SEQ.dealerSeq++;
			$("#dealerMktTbody").append($li);
			$.jqmRefresh($("#dealerMktTbody"));
		}
	};
	function _showDealer(qryPage,v_id,objInstId){
		$("#sel").empty();
		$("#diqu").empty();
		var areaId = OrderInfo.staff.areaId.substring(0,3)+'0000';
		var areaName = OrderInfo.staff.areaAllName.substring(0,OrderInfo.staff.areaAllName.indexOf('>'));
		var $sel = $('<select  class="selectpicker show-tick form-control" onChange="order.dealer.queryChildNode('+areaId+')">'); 
		var $opt = $('<option value="">'+areaName+'</option>');
		$sel.append($opt);
	    $("#sel").append($sel);
	    $sel.addClass("styled-select");
	    _queryChildNode(areaId);
	    
	//	$("#sheng").html("<option selected='selected' value=0>"+OrderInfo.staff.areaAllName.substring(0,OrderInfo.staff.areaAllName.indexOf('>'))+"</option>");
		$("#queryStaff").off("click").on("click",function(){
			_queryStaff(qryPage,v_id,objInstId);
		});
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
									if(list[i].commonRegionId==OrderInfo.staff.areaId.substring(0,5)+'00'){
										selectHtml=selectHtml+"<option  selected='selected' value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
									}else{
										selectHtml=selectHtml+"<option value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
									}
								}
								$("#diqu").html(selectHtml);
								$("#diqu").addClass("styled-select");
								$("#developModal").modal("show");
							}
						}
					}
				});
	}
	//协销人-修改
	function _setStaff(objInstId){
		var $staff = $("#staff_list_body .plan_select");
		$staff.each(function(){
			$("#dealer_"+objInstId).val($(this).attr("staffName")).attr("staffId", $(this).attr("staffId"));
		});
		if($staff.length > 0){
			easyDialog.close();
		}else{
			$.alert("操作提示","请选择 协销人！");
		}
	}
	
	//协销人-查询
	function _queryStaff(qryPage,v_id,objInstId){
//		if(qryPage == 0){
//			$("#p_staff_areaId").val("");
//			$("#p_staff_areaId_val").val("");
//		}
		if($("#staffName").val()=="" && $("#staffCode").val() == ""){
			$.alert("操作提示","请输入工号或者姓名！");
			return;
		}
		var param = {
				"dealerId":v_id,
				"areaId":$("#diqu").val(),
				//"currentAreaAllName":$("#p_staff_areaId_val").val(),
				"name":$("#staffName").val(),
				"code":$("#staffCode").val(),
				//"salesCode":$("#qrySalesCode").val(),
				"pageIndex":1,
				"objInstId":objInstId,
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
						$("#dealer_"+objInstId).text(response.data[0].staffName).attr("staffId", response.data[0].staffId);
						$("#developModal").modal("hide");
					}
				//	$("#developModal").hide();
				}else if(response.code==-2){
					$.alertM(response.data);
					return;
				}else{
					$.alert("信息提示",response.msg);
					return;
				}
				
//				$("#div_staff_dialog").html(response.data);
//				
//				$("#staff_list_body tr").each(function(){$(this).off("click").on("click",function(event){
//					_linkSelectPlan("#staff_list_body tr",this);
//					event.stopPropagation();
//					});});
//				easyDialog.open({
//					container : "div_staff_dialog"
//				});
				
			}
		});	

	}
	//修改发展人角色
	var _changeDealer = function(select,objInstId,value){
		var i = 0;
		$("select[name="+objInstId+"]").each(function(){
			if($(this).val() == $(select).val()){
				i++;
			}
		});
		if(i>1){
			$.alert("信息提示","每个业务的发展人类型不能重复");
			$(select).val(value);
		}
	};
	
	//点击确认，添加附属销售品发展人
	var _addAttachDealer = function(){
		$("input[name=attach_dealer]:checked").each(function(){	
			var id = $(this).attr("id");	
			var prodId = id.split("_")[0];
			if($("#tr_"+id)[0]==undefined){ //没有添加过
				var objId = id+"_"+OrderInfo.SEQ.dealerSeq;
				var $tdType = _getDealerType(id,objId);
				if($tdType==undefined){
					return false;
				}
				var $tr = $("#atr_"+id);
				var $li = $('<li name="tr_'+id+'"></li>');
				var $dl= $("<dl></dl>");
				$dl.append("<dd>"+$tr.children().eq(1).text()+"</dd>");
				$dl.append("<dd>"+$tr.children().eq(2).text()+"</dd>");
				$dl.append($tdType);
				
				var dealer = $("#tr_"+prodId).find("input"); //产品协销人
				var staffId = 1;
				var staffName = "";
				if(dealer[0]==undefined){
					staffId = OrderInfo.staff.staffId;
					staffName = OrderInfo.staff.staffName;
				}else {
					staffId = dealer.attr("staffId");
					staffName = dealer.attr("value");
				}
				if(order.ysl!=undefined){
					var $dd = $('<dd><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'"  data-mini="true"></input></dd>');
					$dl.append($dd);
				}else{
					var $dd = $('<dd><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'"  data-mini="true"  readonly="readonly"></input></dd>');
					$dl.append($dd);
				}
//				var $button='<dd class="ui-grid"><div class="ui-grid-b"><div class="ui-block-a">';
//				$button+='<button data-mini="ture" onclick="order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
//				$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,\''+id+'\')">添加</button></div>';
//				$button+=' <div class="ui-block-c"> <button data-mini="ture" onclick="order.dealer.removeDealer(this);">删除</button></div></div></dd>';			
//				$dl.append($button);
				$li.append($dl);
				$("#dealerTbody").append($li);
//				$.jqmRefresh($("#dealerTbody"));
				OrderInfo.SEQ.dealerSeq++;
			}	
		});
		$("#div_attach_choose").popup("close");
	};
	
	//添加一行产品协销人
	var _addProdDealer = function(obj,objInstId,type){
		
		
//		var objInstId = OrderInfo.offerSpec.offerSpecId;
//		var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"' href='#' class='list-group-item'></li>");
//		$li.append("<h5 class='list-group-item-heading text-warning'>"+accNbr+"（包含接入产品）</h5>");
//		$li.append("<p class='list-group-item-text'>"+OrderInfo.offerSpec.offerSpecName+"</p>");
//		var $p = $('<p> </p>');
//		var $div = $('<div class="row"> </div>');
//		var $div2 = $('<div class="col-xs-6"> </div>');
//					//var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
//		var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
//		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
//		if(order.ysl!=undefined){
//			$select.append("<option value='40020005'>第一发展人</option>");
//			$select.append("<option value='40020006'>第二发展人</option>");
//			$select.append("<option value='40020007'>第三发展人</option>");
//		}else{
//			$.each(OrderInfo.order.dealerTypeList,function(){
//				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
//			});$field
//		}
//		$div2.append($select);
//		$div.append($div2);
//		if(order.ysl!=undefined){
////			var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true"></input></dd>');
////			$dl.append($dd);
//		}else{
//			var $td = $('<div class="col-xs-6"><input type="text" onFocus="javascript:_queryStaff(\'dealer\',\''+objId+'\');"" class="form-control" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" readonly="readonly" ></input></div>');
//			$div.append($dd);
//		}
//		$p.append($div);
//		$li.append($p);
		
		
		var $oldTr = $(obj).parent().parent().parent().parent().parent();
		var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
		var $tdType = _getDealerType(objInstId,objId);
		if($tdType==undefined){
			return;
		}
		var $li = $('<li name="tr_'+objInstId+'"></li>');
		var $dl= $("<dl></dl>");
		if (OrderInfo.actionFlag != 13) {
			$dl.append("<dd>"+$oldTr.find("dd").eq(0).text()+"</dd>");
			$dl.append("<dd>"+$oldTr.find("dd").eq(1).text()+"</dd>");
		}
		$dl.append($tdType);
		if(order.ysl!=undefined){
			var $dd = $('<dd><input type="text" id="dealer_'+objId+'" name="dealer_'+objInstId+'" staffId="'+$oldTr.find("input").attr("staffId")+'" value="'+$oldTr.find("input").attr("value")+'"  data-mini="true"></input></dd>');
			$dl.append($dd);
		}else{
			var $dd = $('<dd><input type="text" id="dealer_'+objId+'" name="dealer_'+objInstId+'" staffId="'+$oldTr.find("input").attr("staffId")+'" value="'+$oldTr.find("input").attr("value")+'"  data-mini="true"  readonly="readonly"></input></dd>');
			$dl.append($dd);
		}
		var $button='<dd class="ui-grid"><div class="ui-grid-a"><div class="ui-block-a">';
		$button+='<button data-mini="ture" onclick="order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
		$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.removeDealer(this);">删除</button></div></div></dd>';			
		$dl.append($button);
		$li.append($dl);	
		$oldTr.after($li);
		$.jqmRefresh($("#dealerTbody"));
		OrderInfo.SEQ.dealerSeq++;
	};
	
	//改变发展人号码
	var _changeAccNbr = function(prodId,accNbr){
		$("li[name^='tr_"+prodId+"']").each(function(){
			$(this).find("dd").eq(0).text(accNbr);
		});
	};
	
	//校验发展人类型,并获取发展人类型列表
	var _getDealerType = function(objInstId,objId){
		
		
		var objInstId = OrderInfo.offerSpec.offerSpecId;
		var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"' href='#' class='list-group-item'></li>");
		$li.append("<h5 class='list-group-item-heading text-warning'>"+accNbr+"（包含接入产品）</h5>");
		$li.append("<p class='list-group-item-text'>"+OrderInfo.offerSpec.offerSpecName+"</p>");
		var $p = $('<p> </p>');
		var $div = $('<div class="row"> </div>');
		var $div2 = $('<div class="col-xs-6"> </div>');
					//var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
		var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		if(order.ysl!=undefined){
			$select.append("<option value='40020005'>第一发展人</option>");
			$select.append("<option value='40020006'>第二发展人</option>");
			$select.append("<option value='40020007'>第三发展人</option>");
		}else{
			$.each(OrderInfo.order.dealerTypeList,function(){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			});$field
		}
		$div2.append($select);
		$div.append($div2);
		if(order.ysl!=undefined){
//			var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true"></input></dd>');
//			$dl.append($dd);
		}else{
			var $td = $('<div class="col-xs-6"><input type="text" onFocus="javascript:order.dealer.queryStaff(\'dealer\',\''+objId+'\');"" class="form-control" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" readonly="readonly" ></input></div>');
			$div.append($td);
		}
		$p.append($div);
		$li.append($p);
		
		
		var dealerType = "";
		if(order.ysl!=undefined){
			OrderInfo.order.dealerTypeList = [{"PARTYPRODUCTRELAROLECD":40020005,"NAME":"第一发展人"},{"PARTYPRODUCTRELAROLECD":40020006,"NAME":"第二发展人"},{"PARTYPRODUCTRELAROLECD":40020007,"NAME":"第三发展人"}];
		}
		if(OrderInfo.order.dealerTypeList!=undefined && OrderInfo.order.dealerTypeList.length>0){ //发展人类型列表
			$.each(OrderInfo.order.dealerTypeList,function(){
				var dealerTypeId = this.PARTYPRODUCTRELAROLECD;
				var flag = true;
				$("select[name='dealerType_"+objInstId+"']").each(function(){ //遍历选择框
					if(dealerTypeId==$(this).val()){  //如果已经存在
						flag = false;
						return false;
					}
				});
				if(flag){ //如果发展人类型没有重复
					dealerType = dealerTypeId;
					return false;
				}
			});
		}else{
			$.alert("信息提示","没有发展人类型");
			return;
		}
		if(dealerType==undefined || dealerType==""){	
			$.alert("信息提示","每个业务发展人类型不能重复");
			return;
		}
		var $tdType = $('<dd></dd>');
		//var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
		var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  class="selectpicker show-tick form-control" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		$.each(OrderInfo.order.dealerTypeList,function(){
			if(this.PARTYPRODUCTRELAROLECD==dealerType){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected='selected'>"+this.NAME+"</option>");
			}else{
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			}
		});
	//	$field.append($select);
		$tdType.append($select);
		return $tdType;
	};
	
	//显示已经受理的业务列表
	var _showOfferList = function(){	
		$('#attach_pop').empty();
		//主销售品
		/*if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 2){
			var id = OrderInfo.offerSpec.offerSpecId;
			if($("tr[name='tr_"+id+"']")[0]==undefined){
				var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"></tr>');
				$tr.append('<td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td>');
				$tr.append('<td>主套餐</td><td>'+OrderInfo.offerSpec.offerSpecName+'</td>');
				$('#attach_tbody').append($tr);
			}
		}*/
		//接入产品
		/*if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 14){
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				$.each(this.prodInsts,function(){
					var accNbr = "未选号";
					if(this.accNbr!=undefined && this.accNbr!=""){
						accNbr = prodInst.accNbr;
					}
					var id = this.prodInstId;
					var accNbr = OrderInfo.getProdAn(id).accessNumber;
					if(accNbr==undefined || accNbr==""){ 
						accNbr = "未选号";
					}
					if($("tr[name='tr_"+id+"']")[0]==undefined){
						var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')">');
						$tr.append('<td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
						$tr.append('<td>'+accNbr+'</td><td>'+this.objName+'</td>');
						$('#attach_tbody').append($tr);
					}
				});
			});
		}*/
		
		
		
		  
		
		//可选包
//		var $pop=$('<div id="div_attach_choose"  data-role="popup" data-transition="slideup" data-corners="false" data-overlay-theme="b" class="popwindow" data-dismissible="false"></div>');
//		$pop.append('<div data-role="header" data-theme="t"> <a href="#" data-role="button" data-icon="back" data-rel="back" data-iconpos="notext" class="ui-btn-right">返回</a><h1>发展人管理</h1></div>');
		var $content=$('<div data-role="content"></div>');
		var $table=$('<table class="searchtable"></table>');
		$table.append('<tr><th>操作</th><th>号码</th><th>发展业务</th></tr>');
		$.each(AttachOffer.openList,function(){
			var prodId = this.prodId;
			var accNbr = OrderInfo.getAccessNumber(prodId);
			if(accNbr==undefined || accNbr==""){ 
				accNbr = "未选号";
			}
			$.each(this.specList,function(){
				var id = prodId+'_'+this.offerSpecId;
				if(this.isdel != "Y" && this.isdel != "C" && $("tr[name='tr_"+id+"']")[0]==undefined){  //订购的附属销售品	
					var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"></tr>');
					//var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"><td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
					$tr.append('<td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td>');
					$tr.append('<td>'+accNbr+'</td><td>'+this.offerSpecName+'</td>');
					$table.append($tr);
				};
			});
		});
		//预受理
		if(order.ysl!=undefined){
			if(order.ysl.yslbean.yslflag!=undefined){
				for (var j = 0; j < order.ysl.openList.length; j++) {
					if(order.ysl.openList[j].type=="1"){
						var prodId = "-1";
						var accNbr = $("#choosedNumSpan").val();
						if(accNbr==undefined || accNbr==""){ 
							accNbr = "未选号";
						}
						var dealerchecked = "N";
						var dealertr = $("#dealerTbody").find("tr");
						dealertr.each(function(){
							if($(this).attr("name")=="tr_-1_"+order.ysl.openList[j].id){
								dealerchecked = "Y";
							}else{
								dealerchecked = "N";
							}
						});
						if(dealerchecked=="N"){
							var id = prodId+'_'+order.ysl.openList[j].id;
							var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"></tr>');
							$tr.append('<td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td>');
							$tr.append('<td>'+accNbr+'</td><td>'+order.ysl.openList[j].name+'</td>');
							$table.append($tr);
						}
					}
				}
			}
		}
		//功能产品
		/*$.each(AttachOffer.openServList,function(){
			var prodId = this.prodId;
			var accNbr = OrderInfo.getAccessNumber(prodId);
			if(accNbr==undefined || accNbr==""){ 
				accNbr = "未选号";
			}
			$.each(this.servSpecList,function(){
				var id = prodId+'_'+this.servSpecId;
				if(this.isdel != "Y" && this.isdel != "C"  && $("tr[name='tr_"+id+"']")[0]==undefined){  //订购的附属销售品
					var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"><td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
					$tr.append('<td>'+accNbr+'</td><td>'+this.servSpecName+'</td>');
					$('#attach_tbody').append($tr);
				};
			});
		});*/
		$content.append($table);
		var $footer='<div data-role="footer" data-position="inline" data-tap-toggle="false" data-theme="n"> <button data-inline="true" data-icon="next" id="sureAdddealer">确定</button>';
		$footer+='<button data-inline="true" data-icon="back" data-rel="back" id="closeAdddealer">取消</button></div>';
		//$pop.append($content);
		//$pop.append($footer);
		$('#addBody').append($content);
		$("#addModel").modal("show");
		//$('#attach_pop').append($pop);
		//统一弹出框
//		var popup = $.popup("#div_attach_choose",$pop,{
//			width:800,
//			height:$(window).height(),
//			contentHeight:$(window).height()-120,
//			afterClose:function(){}
//		});
		$("#sureAdddealer").off("click").on("click",function(){_addAttachDealer();});
//		$("#closeAdddealer").off("tap").on("tap",function(){$("#div_attach_choose").popup("close");});
		
	};
	//勾选一个附属
	var _checkAttach = function(id){
		//var tr = $("#atr_"+id);
		var checkbox = $("#"+id);
		if(checkbox.attr("checked")=="checked"){
			//tr.removeClass("plan_select");
			checkbox.attr("checked", false);
		}else {
			//tr.addClass("plan_select");
			checkbox.attr("checked", true);
		}
	};
	
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
		changeAccNbr		: _changeAccNbr,
		showOfferList		: _showOfferList,
		addProdDealer		: _addProdDealer,
		addAttachDealer		: _addAttachDealer,
		checkAttach			: _checkAttach,
		removeDealer		: _removeDealer,
		removeAttDealer		: _removeAttDealer,
		changeDealer		: _changeDealer,
		queryStaff          : _queryStaff,
		showDealer          : _showDealer,
		queryChildNode      : _queryChildNode
	};
})();
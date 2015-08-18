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
	var _initDealer = function(prodInfo) {
		if(order.ysl!=undefined){
			OrderInfo.order.dealerTypeList = [{"PARTYPRODUCTRELAROLECD":"40020005","NAME":"第一发展人"},{"PARTYPRODUCTRELAROLECD":"40020006","NAME":"第二发展人"},{"PARTYPRODUCTRELAROLECD":"40020007","NAME":"第三发展人"}];
		}else{
			if(!ec.util.isArray(OrderInfo.order.dealerTypeList)){
				$.ecOverlay("<strong>正在查询发展人类型中,请稍后....</strong>");
				var response = $.callServiceAsJson(contextPath+"/order/queryPartyProfileSpecList",null); //发展人类型查询
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
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2 || OrderInfo.actionFlag==14){ //新装业务，套餐变更需要主套餐发展人
			var objInstId = OrderInfo.offerSpec.offerSpecId;
			var $tr = $("<tr id='tr_"+objInstId+"' name='tr_"+objInstId+"'></tr>");
			var $tdType = $('<td></td>');
			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
			if(order.ysl!=undefined){
				$select.append("<option value='40020005'>第一发展人</option>");
				$select.append("<option value='40020006'>第二发展人</option>");
				$select.append("<option value='40020007'>第三发展人</option>");
			}else{
				$.each(OrderInfo.order.dealerTypeList,function(){
					$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
				});
			}
			$tdType.append($select);
			$tdType.append('<label class="f_red">*</label>');
			var accNbr = "主套餐";
			$tr.append("<td>"+accNbr+"</td>");
			$tr.append("<td>"+OrderInfo.offerSpec.offerSpecName+"（包含接入产品）</td>");
			$tr.append($tdType);
			if(order.ysl!=undefined){
				var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px"></input></td>');
			}else{
				var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px" readonly="readonly" ></input></td>');
			}
			$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
			$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>');
			$tr.append($td);
			OrderInfo.SEQ.dealerSeq++;
			$("#dealerTbody").append($tr);
		}
		if(OrderInfo.actionFlag==6 ){ //加装需要接入产发展人
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){//纳入老用户的发展人
//				var prodInfo = OrderInfo.oldprodInstInfos;
//				var objInstId = prodInfo.prodInstId;
//    			var $tr = $("<tr id='tr_"+objInstId+"' name='tr_"+objInstId+"'></tr>");
//    			var $tdType = $('<td></td>');
//    			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
//    			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
//    			$.each(OrderInfo.order.dealerTypeList,function(){
//    				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
//    			});
//    			$tdType.append($select);
//				$tdType.append('<label class="f_red">*</label>');
//    			//$tr.append("<td>"+CONST.EVENT.PROD_NEW+"</td>");
//				var accNbr = "未选号";
//				if(prodInfo.accNbr!=undefined && prodInfo.accNbr!=""){
//					accNbr = prodInfo.accNbr;
//				}
//    			$tr.append("<td>"+accNbr+"</td>");
//				$tr.append("<td>移动电话（仅含本地语音）</td>");
//				$tr.append($tdType);
//				var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px" readonly="readonly" ></input></td>');
//				$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
//				$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>');
//				$tr.append($td);
//				OrderInfo.SEQ.dealerSeq++;
//				$("#dealerTbody").append($tr);
			}else{
				$.each(OrderInfo.offerSpec.offerRoles,function(){
		    		$.each(this.prodInsts,function(){
		    			var objInstId = this.prodInstId;
		    			var $tr = $("<tr id='tr_"+objInstId+"' name='tr_"+objInstId+"'></tr>");
		    			var $tdType = $('<td></td>');
		    			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
		    			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		    			$.each(OrderInfo.order.dealerTypeList,function(){
		    				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
		    			});
		    			$tdType.append($select);
						$tdType.append('<label class="f_red">*</label>');
		    			//$tr.append("<td>"+CONST.EVENT.PROD_NEW+"</td>");
						var accNbr = "未选号";
						if(this.accNbr!=undefined && this.accNbr!=""){
							accNbr = prodInst.accNbr;
						}
		    			$tr.append("<td>"+accNbr+"</td>");
						$tr.append("<td>"+this.objName+"</td>");
						$tr.append($tdType);
						var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px" readonly="readonly" ></input></td>');
						$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
						$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>');
						$tr.append($td);
						OrderInfo.SEQ.dealerSeq++;
						$("#dealerTbody").append($tr);
		    		});
		    	});
			}
		}
		if(OrderInfo.actionFlag==13){ //裸机销售需要发展人
			var objInstId = $("#mktResId").val();
			var $tr = $("<tr id='tr_"+objInstId+"' name='tr_"+objInstId+"'></tr>");
			var $tdType = $('<td></td>');
			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
			$.each(OrderInfo.order.dealerTypeList,function(){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			});
			$tdType.append($select);
			$tdType.append('<label class="f_red">*</label>');
			$tr.append($tdType);
			var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px" readonly="readonly" ></input></td>');
			$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
			$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>');
			$tr.append($td);
			OrderInfo.SEQ.dealerSeq++;
			$("#dealerMktTbody").append($tr);
		}
		if(OrderInfo.actionFlag==36){ //一卡双号订购发展人
			var objInstId = OrderInfo.orderAccNbr;
			var $tr = $("<tr id='tr_"+objInstId+"' name='tr_"+objInstId+"'></tr>");
			var $tdType = $('<td></td>');
			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
			if(order.ysl!=undefined){
				$select.append("<option value='40020005'>第一发展人</option>");
				$select.append("<option value='40020006'>第二发展人</option>");
				$select.append("<option value='40020007'>第三发展人</option>");
			}else{
				$.each(OrderInfo.order.dealerTypeList,function(){
					$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
				});
			}
			$tdType.append($select);
			$tdType.append('<label class="f_red">*</label>');
			var accNbr = OrderInfo.orderAccNbr;
			$tr.append("<td>"+accNbr+"</td>");
			$tr.append("<td>一卡双号订购</td>");
			$tr.append($tdType);
			if(order.ysl!=undefined){
				var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px"></input></td>');
			}else{
				var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px" readonly="readonly" ></input></td>');
			}
			$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
			$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>');
			$tr.append($td);
			OrderInfo.SEQ.dealerSeq++;
			$("#dTbody").append($tr);
		}
		if(OrderInfo.actionFlag==21){//副卡套餐变更
			if(ec.util.isArray(OrderInfo.viceOfferSpec)){
				$.each(OrderInfo.viceOfferSpec,function(){
					var objInstId = this.offerSpecId;
					var $tr = $("<tr id='tr_"+objInstId+"' name='tr_"+objInstId+"'></tr>");
					var $tdType = $('<td></td>');
					var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
					var flag = true;
					$.each(OrderInfo.order.dealerTypeList,function(){
						var dealerTypeId = this.PARTYPRODUCTRELAROLECD;
						$("select[name='dealerType_"+objInstId+"']").each(function(){ //遍历选择框
							if(dealerTypeId==$(this).val()){  //如果已经存在
								flag = false;
							}
						});
					});
					if(!flag){
						return;
					}
					var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
					if(order.ysl!=undefined){
						$select.append("<option value='40020005'>第一发展人</option>");
						$select.append("<option value='40020006'>第二发展人</option>");
						$select.append("<option value='40020007'>第三发展人</option>");
					}else{
						$.each(OrderInfo.order.dealerTypeList,function(){
							$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
						});
					}
					$tdType.append($select);
					$tdType.append('<label class="f_red">*</label>');
					var accNbr = "主套餐";
					$tr.append("<td>"+accNbr+"</td>");
					$tr.append("<td>"+this.offerSpecName+"（包含接入产品）</td>");
					$tr.append($tdType);
					if(order.ysl!=undefined){
						var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px"></input></td>');
					}else{
						var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" class="inputWidth183px" readonly="readonly" ></input></td>');
					}
					$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
					$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>');
					$tr.append($td);
					OrderInfo.SEQ.dealerSeq++;
					$("#dealerTbody").append($tr);
				});
			}
		}
	};
	
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
				var $newTr = $('<tr name="tr_'+id+'"></tr>');
				$newTr.append("<td>"+$tr.children().eq(1).text()+"</td>");
				$newTr.append("<td>"+$tr.children().eq(2).text()+"</td>");
				$newTr.append($tdType);
				
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
					var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'" class="inputWidth183px" style="margin-left:45px;"></input></td>');
				}else{
					var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+id+'" staffId="'+staffId+'" value="'+staffName+'" class="inputWidth183px" readonly="readonly" style="margin-left:45px;"></input></td>');
				}
				$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');	
				$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>');
				$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,\''+id+'\')">添加</a><label class="f_red">*</label>');
				$newTr.append($td);
				$("#dealerTbody").append($newTr);
				OrderInfo.SEQ.dealerSeq++;
			}	
		});
		easyDialog.close();
	};
	
	//添加一行产品协销人
	var _addProdDealer = function(obj,objInstId,type){
		var $oldTr = $(obj).parent().parent();
		var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
		var $tdType = _getDealerType(objInstId,objId);
		if($tdType==undefined){
			return;
		}
		var $tr = $('<tr name="tr_'+objInstId+'"></tr>');
		/*if(type==1){
			$tr.append("<td>"+CONST.EVENT.PROD_NEW+"</td>");
		}else{
			$tr.append("<td>"+CONST.EVENT.OFFER_BUY+"</td>");
		}*/
		if (OrderInfo.actionFlag != 13) {
			$tr.append("<td>"+$oldTr.find("td").eq(0).text()+"</td>");
			$tr.append("<td>"+$oldTr.find("td").eq(1).text()+"</td>");
		}
		$tr.append($tdType);
		if(order.ysl!=undefined){
			var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+objInstId+'" staffId="'+$oldTr.find("input").attr("staffId")+'" value="'+$oldTr.find("input").attr("value")+'" class="inputWidth183px" ></input></td>');
		}else{
			var $td = $('<td><input type="text" id="dealer_'+objId+'" name="dealer_'+objInstId+'" staffId="'+$oldTr.find("input").attr("staffId")+'" value="'+$oldTr.find("input").attr("value")+'" class="inputWidth183px" readonly="readonly" ></input></td>');
		}
		$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
		$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>');
		/*if(type==1){
			$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>');
		}else{
			$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>');
			$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+')">添加</a><label class="f_red">*</label>');
		}*/
		$tr.append($td);	
		$oldTr.after($tr);
		OrderInfo.SEQ.dealerSeq++;
	};
	
	//改变发展人号码
	var _changeAccNbr = function(prodId,accNbr){
		$("tr[name^='tr_"+prodId+"']").each(function(){
			$(this).find("td").eq(0).text(accNbr);
		});
	};
	
	//校验发展人类型,并获取发展人类型列表
	var _getDealerType = function(objInstId,objId){
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
		var $td = $('<td></td>'); //发展人类型
		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth250px" style="width:183px;" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		$.each(OrderInfo.order.dealerTypeList,function(){
			if(this.PARTYPRODUCTRELAROLECD==dealerType){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected='selected'>"+this.NAME+"</option>");
			}else{
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			}
		});
		$td.append($select);
		$td.append('<label class="f_red">*</label>');
		return $td;
	};
	
	//显示已经受理的业务列表
	var _showOfferList = function(){	
		$('#attach_tbody').empty();
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
		$.each(AttachOffer.openList,function(){
			var prodId = this.prodId;
			var accNbr = "";
			/*if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
				if(ec.util.isArray(OrderInfo.viceprodInstInfos) && OrderInfo.oldMvFlag){
					for(var i=0;i<OrderInfo.viceprodInstInfos.length;i++){
						if(prodId==OrderInfo.viceprodInstInfos[i].prodInstId){
							accNbr = OrderInfo.viceprodInstInfos[i].accNbr;
						}
					}
				}else{
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							accNbr = OrderInfo.oldprodInstInfos[i].accNbr;
						}
					}
				}
			}*/
			accNbr = OrderInfo.getAccessNumber(prodId);
			
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
					$('#attach_tbody').append($tr);
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
							$('#attach_tbody').append($tr);
						}
					}
				}
			}
		}
		//功能产品
		$.each(AttachOffer.openServList,function(){
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
		});
		easyDialog.open({
			container : "div_attach_dialog"
		});
	};
	
	//勾选一个附属
	var _checkAttach = function(id){
		var tr = $("#atr_"+id);
		var checkbox = $("#"+id);
		if(checkbox.attr("checked")=="checked"){
			tr.removeClass("plan_select");
			checkbox.attr("checked", false);
		}else {
			tr.addClass("plan_select");
			checkbox.attr("checked", true);
		}
	};
	
	//删除协销人
	var _removeDealer = function(obj){
		$(obj).parent().parent().remove();
	};
	
	//删除协销人
	var _removeAttDealer = function(id){
		$("tr[name^='tr_"+id+"']").each(function(){
			$(this).remove();
		});
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
		changeDealer		: _changeDealer
	};
})();
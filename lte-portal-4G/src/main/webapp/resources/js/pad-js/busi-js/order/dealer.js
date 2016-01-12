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
			if(!ec.util.isArray(OrderInfo.channelList)||OrderInfo.channelList.length==0){
				OrderInfo.getChannelList();
			}
		}		
		
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==2 || OrderInfo.actionFlag==14){ //新装业务，套餐变更需要主套餐发展人
			var objInstId = OrderInfo.offerSpec.offerSpecId;
			var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"'></li>");
			var $dl= $("<dl></dl>");
			var $tdType = $('<dd> </dd>');
			var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
			var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
			var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
			if(order.ysl!=undefined){
				$select.append("<option value='40020005'>第一发展人</option>");
				$select.append("<option value='40020006'>第二发展人</option>");
				$select.append("<option value='40020007'>第三发展人</option>");
			}else{
				$.each(OrderInfo.order.dealerTypeList,function(){
					$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
				});
			}
			$field.append($select);
			$tdType.append($field);
			var accNbr = "主套餐";
			$dl.append("<dd>"+accNbr+"</dd>");
			$dl.append("<dd>"+OrderInfo.offerSpec.offerSpecName+"（包含接入产品）</dd>");
			$dl.append($tdType);
			//判断是否
			if(OrderInfo.salesCode!=null && OrderInfo.salesCode!="" && OrderInfo.salesCode!="null" && OrderInfo.salesCode!=undefined){
				var param = {
						"dealerId":"",
						"areaId":"",
						"currentAreaAllName":"",
						"staffName":"",
						"staffCode":OrderInfo.salesCode,
						"staffCode2":OrderInfo.salesCode,
						"salesCode":"",
						"pageIndex":1,
						"objInstId":objInstId,
						"pageSize":10
				};
				var url=contextPath+"/token/pad/staffMgr/getStaffList";
				$.ecOverlay("<strong>正在查询发展人的服务中,请稍后....</strong>");
				var response = $.callServiceAsJson(url,param);	
				$.unecOverlay();
				var code=response.code;
                if(code==0){
                	var data=response.data.result;
                	OrderInfo.staff.staffId=data[0].staffId;
                	OrderInfo.staff.staffName=data[0].staffName;
                }
			}
			if(order.ysl!=undefined){
				var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true"></input></dd>');
				$dl.append($dd);
			}else{
				var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true" readonly="readonly" ></input></dd>');
				$dl.append($dd);
			}

			var $button='<dd class="ui-grid"><div class="ui-grid-a"><div class="ui-block-a">';
			$button+='<button data-mini="ture" onclick="javascript:order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
			$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</button></div></div></dd>';
			$dl.append($button);
			//发展渠道
			var $tdChannel = $('<dd></dd>');
			var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+objInstId+'" class="inputWidth183px" onclick=a=this.value;></select>');
			if(OrderInfo.provinceInfo.reloadFlag=="N"){
				//获取编码
				var busiOrders = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;
				var channelNbr="";
				for(var i=0;i<busiOrders.length;i++){
					if(busiOrders[i].boActionType.actionClassCd=="1200" && busiOrders[i].boActionType.boActionTypeCd=="S1" && busiOrders[i].busiObj.offerTypeCd=="1"){
						var busiOrderAttrs=busiOrders[i].data.busiOrderAttrs;
						for(var j=0;j<busiOrderAttrs.length;j++){
							if(busiOrderAttrs[j].channelNbr!=undefined){
								channelNbr=busiOrderAttrs[j].channelNbr;
								break;
							}
						}
					}
				}
				for(var i=0;i<OrderInfo.channelList.length;i++){
					if(OrderInfo.channelList[i].channelNbr==channelNbr){
						$channelSelect.append("<option value='"+OrderInfo.channelList[i].channelNbr+"' selected ='selected'>"+OrderInfo.channelList[i].channelName+"</option>");
					}
					else{
						$channelSelect.append("<option value='"+OrderInfo.channelList[i].channelNbr+"'>"+OrderInfo.channelList[i].channelName+"</option>");
					}
				}
			}
			else{
				$.each(OrderInfo.channelList,function(){
						if(this.isSelect==1)
							$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
						else
							$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
				
				});
			}
			$tdChannel.append($channelSelect);
			$tdChannel.append('<label class="f_red">*</label>');
			$dl.append($tdChannel);
			$li.append($dl);
			OrderInfo.SEQ.dealerSeq++;
			$("#dealerTbody").append($li);
			$.jqmRefresh($("#dealerTbody"));
		}
		if(OrderInfo.actionFlag==6 ){ //加装需要接入产发展人
			//判断是否
			if(OrderInfo.salesCode!=null && OrderInfo.salesCode!="" && OrderInfo.salesCode!="null" && OrderInfo.salesCode!=undefined){
				var param = {
						"dealerId":"",
						"areaId":"",
						"currentAreaAllName":"",
						"staffName":"",
						"staffCode":OrderInfo.salesCode,
						"staffCode2":OrderInfo.salesCode,
						"salesCode":"",
						"pageIndex":1,
						"objInstId":objInstId,
						"pageSize":10
				};
				var url=contextPath+"/token/pad/staffMgr/getStaffList";
				$.ecOverlay("<strong>正在查询发展人的服务中,请稍后....</strong>");
				var response = $.callServiceAsJson(url,param);	
				$.unecOverlay();
				var code=response.code;
                if(code==0){
                	var data=response.data.result;
                	OrderInfo.staff.staffId=data[0].staffId;
                	OrderInfo.staff.staffName=data[0].staffName;
                }
			}
			if(order.memberChange.newMemberFlag){
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
						$button+='<button data-mini="ture" onclick="javascript:order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
						$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</button></div></div></dd>';
						$dl.append($button);
						//发展渠道
						var $tdChannel = $('<dd></dd>');
						var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+objInstId+'" class="inputWidth183px" onclick=a=this.value;></select>');
						if(order.memberChange.reloadFlag=="N"){
							//获取编码
							var busiOrders = order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
							var channelNbr="";
							for(var i=0;i<busiOrders.length;i++){
								if(busiOrders[i].boActionType.actionClassCd=="1300" && busiOrders[i].boActionType.boActionTypeCd=="1"){
									var busiOrderAttrs=busiOrders[i].data.busiOrderAttrs;
									for(var j=0;j<busiOrderAttrs.length;j++){
										if(busiOrderAttrs[j].channelNbr!=undefined){
											channelNbr=busiOrderAttrs[j].channelNbr;
											break;
										}
									}
								}
							}
							for(var i=0;i<OrderInfo.channelList.length;i++){
								if(OrderInfo.channelList[i].channelNbr==channelNbr){
									$channelSelect.append("<option value='"+OrderInfo.channelList[i].channelNbr+"' selected ='selected'>"+OrderInfo.channelList[i].channelName+"</option>");
								}
								else{
									$channelSelect.append("<option value='"+OrderInfo.channelList[i].channelNbr+"'>"+OrderInfo.channelList[i].channelName+"</option>");
								}
							}
						}
						else{
							$.each(OrderInfo.channelList,function(){
								if(this.isSelect==1)
									$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
								else
									$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
							});
						}
						$tdChannel.append($channelSelect);
						$tdChannel.append('<label class="f_red">*</label>');
						$dl.append($tdChannel);
						$li.append($dl);
						OrderInfo.SEQ.dealerSeq++;
						$("#dealerTbody").append($li);
						$.jqmRefresh($("#dealerTbody"));
		    		});
		    	});
			}
			if(ec.util.isArray(OrderInfo.viceOfferSpec)){
				$.each(OrderInfo.viceOfferSpec,function(){
					var objInstId = this.offerSpecId;
	    			var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"'></li>");
	    			var $dl= $("<dl></dl>");
	    			var $tdType = $('<dd></dd>');
	    			var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
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
					
					var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
	    			if(order.ysl!=undefined){
						$select.append("<option value='40020005'>第一发展人</option>");
						$select.append("<option value='40020006'>第二发展人</option>");
						$select.append("<option value='40020007'>第三发展人</option>");
					}else{
						$.each(OrderInfo.order.dealerTypeList,function(){
							$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
						});
					}
				
	    			$field.append($select);
	    			$tdType.append($field);
	    			var accNbr = "主套餐";					
					$dl.append("<dd>"+accNbr+"</dd>");
					$dl.append("<dd>"+this.offerSpecName+"包含接入产品）</dd>");				
					$dl.append($tdType);
					if(order.ysl!=undefined){
						var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true"></input></dd>');
					}else{
						var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true" readonly="readonly"></input></dd>');
					}
					
					$dl.append($dd);
					var $button='<dd class="ui-grid"><div class="ui-grid-a"><div class="ui-block-a">';
					$button+='<button data-mini="ture" onclick="javascript:order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
					$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</button></div></div></dd>';
					$dl.append($button);
					//发展渠道
					var $tdChannel = $('<dd></dd>');
					var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+objInstId+'" class="inputWidth183px" onclick=a=this.value;></select>');
					$.each(OrderInfo.channelList,function(){
						if(this.isSelect==1)
							$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
						else
							$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
					});
					$tdChannel.append($channelSelect);
					$tdChannel.append('<label class="f_red">*</label>');
					$dl.append($tdChannel);
					$li.append($dl);
					OrderInfo.SEQ.dealerSeq++;
					$("#dealerTbody").append($li);				
					$.jqmRefresh($("#dealerTbody"));
				});
			}
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
		
		if(OrderInfo.actionFlag==21){//副卡套餐变更		
			if(ec.util.isArray(OrderInfo.viceOfferSpec)){
				$.each(OrderInfo.viceOfferSpec,function(){
					var objInstId = this.offerSpecId;
	    			var $li = $("<li id='tr_"+objInstId+"' name='tr_"+objInstId+"'></li>");
	    			var $dl= $("<dl></dl>");
	    			var $tdType = $('<dd></dd>');
	    			var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
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
					
					var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
	    			if(order.ysl!=undefined){
						$select.append("<option value='40020005'>第一发展人</option>");
						$select.append("<option value='40020006'>第二发展人</option>");
						$select.append("<option value='40020007'>第三发展人</option>");
					}else{
						$.each(OrderInfo.order.dealerTypeList,function(){
							$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
						});
					}
				
	    			$field.append($select);
	    			$tdType.append($field);
	    			var accNbr = "主套餐";					
					$dl.append("<dd>"+accNbr+"</dd>");
					$dl.append("<dd>"+this.offerSpecName+"包含接入产品）</dd>");				
					$dl.append($tdType);
					if(order.ysl!=undefined){
						var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true"></input></dd>');
					}else{
						var $dd = $('<dd><input type="text" id="dealer_'+objId+'" staffId="'+OrderInfo.staff.staffId+'" value="'+OrderInfo.staff.staffName+'" data-mini="true" readonly="readonly"></input></dd>');
					}
					
					$dl.append($dd);
					var $button='<dd class="ui-grid"><div class="ui-grid-a"><div class="ui-block-a">';
					$button+='<button data-mini="ture" onclick="javascript:order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
					$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</button></div></div></dd>';
					$dl.append($button);
					$li.append($dl);
					OrderInfo.SEQ.dealerSeq++;
					$("#dealerTbody").append($li);				
					$.jqmRefresh($("#dealerTbody"));
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
				var $button='<dd class="ui-grid"><div class="ui-grid-b"><div class="ui-block-a">';
				$button+='<button data-mini="ture" onclick="order.main.queryStaff(\'dealer\',\''+objId+'\');">选择</button></div>';
				$button+=' <div class="ui-block-b"> <button data-mini="ture" onclick="order.dealer.addProdDealer(this,\''+id+'\')">添加</button></div>';
				$button+=' <div class="ui-block-c"> <button data-mini="ture" onclick="order.dealer.removeDealer(this);">删除</button></div></div></dd>';			
				$dl.append($button);
				//发展渠道
				var $tdChannel = $('<dd></dd>');
				var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+id+'" class="inputWidth183px" onclick=a=this.value;></select>');
				$.each(OrderInfo.channelList,function(){
					if(this.isSelect==1)
						$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
					else
						$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
				});
				$tdChannel.append($channelSelect);
				$tdChannel.append('<label class="f_red">*</label>');
				$dl.append($tdChannel);
				$li.append($dl);
				$("#dealerTbody").append($li);
				$.jqmRefresh($("#dealerTbody"));
				OrderInfo.SEQ.dealerSeq++;
			}	
		});
		$("#div_attach_choose").popup("close");
	};
	
	//添加一行产品协销人
	var _addProdDealer = function(obj,objInstId,type){
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
		//发展渠道
		var $tdChannel = $('<dd></dd>');
		var selectChanne=$oldTr.find("dd select[name='dealerChannel_"+objInstId+"']").clone();
        $(selectChanne).attr("id","dealerChannel_"+objId);
		
		$(selectChanne).empty(); 
		var $channelListOptions ="";
		$($oldTr.find("dd select[name='dealerChannel_"+objInstId+"']")).find("option").each(function(){
			var $channelListOptionVal  = $(this).val() ; 
			var $channelListOptionName = $(this).html() ; 
			if(this.selected==true){
				$channelListOptions += "<option value='"+$channelListOptionVal+"' selected ='selected'>"+$channelListOptionName+"</option>";
			}else{
				$channelListOptions += "<option value='"+$channelListOptionVal+"'>"+$channelListOptionName+"</option>";
			}
		});
		$(selectChanne).append($channelListOptions);
		$tdChannel.append(selectChanne);
		$tdChannel.append('<label class="f_red">*</label>');
		$dl.append($tdChannel);
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
		var $field=$('<fieldset data-role="fieldcontain"></fieldset>');
		var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
		var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'"  data-mini="true" data-native-menu="false" data-icon="select" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
		$.each(OrderInfo.order.dealerTypeList,function(){
			if(this.PARTYPRODUCTRELAROLECD==dealerType){
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected='selected'>"+this.NAME+"</option>");
			}else{
				$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
			}
		});
		$field.append($select);
		$tdType.append($field);
		return $tdType;
	};
	
	//显示已经受理的业务列表
	var _showOfferList = function(){	
		$('#attach_pop').empty();
		
		//可选包
		var $pop=$('<div id="div_attach_choose"  data-role="popup" data-transition="slideup" data-corners="false" data-overlay-theme="b" class="popwindow" data-dismissible="false"></div>');
		$pop.append('<div data-role="header" data-theme="t"> <a href="#" id="order_dealer_btn" data-role="button" data-icon="back" data-rel="back" data-iconpos="notext" class="ui-btn-right">返回</a><h1>发展人管理</h1></div>');
		var $content=$('<div data-role="content"></div>');
		var $table=$('<table class="searchtable"></table>');
		$table.append('<tr><th>操作</th><th>号码</th><th>发展业务</th></tr>');
		
		$.each(AttachOffer.openList,function(){
			
			var prodId = this.prodId;
			var accNbr = OrderInfo.getAccessNumber(prodId);
			
//			if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
//				for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
//					if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
//						accNbr = OrderInfo.oldprodInstInfos[i].accNbr;
//					}
//				}
//			}else{
//				accNbr = OrderInfo.getAccessNumber(prodId);
//			}
			
			if(accNbr==undefined || accNbr==""){ 
				accNbr = "未选号";
			}
			
			$.each(this.specList,function(){
				var id = prodId+'_'+this.offerSpecId;
				if(this.isdel != "Y" && this.isdel != "C" && $("li[name='tr_"+id+"']")[0]==undefined){  //订购的附属销售品	
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
					$table.append($tr);
				};
			});
		});
		if(OrderInfo.actionFlag==2 || OrderInfo.actionFlag==3 || OrderInfo.actionFlag==22 ||OrderInfo.actionFlag==23){
			$.each(OrderInfo.boProd2Tds,function(){
				var prodId = this.prodId;
			    var accNbr = OrderInfo.getAccessNumber(prodId);
			    if(accNbr==undefined || accNbr==""){ 
				    accNbr = "未选号";
			    }
			    var id = accNbr;
			    if(this.isdel != "Y" && this.isdel != "C"  && $("tr[name='tr_"+id+"']")[0]==undefined){  //补换卡
				    var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"><td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
				    $tr.append('<td>'+accNbr+'</td><td>补换卡</td>');
				    $table.append($tr);
			    };
		    });
		}
		$content.append($table);
		var $footer='<div data-role="footer" data-position="inline" data-tap-toggle="false" data-theme="n"> <button data-inline="true" data-icon="next" id="sureAdddealer">确定</button>';
		$footer+='<button data-inline="true" data-icon="back" data-rel="back" id="closeAdddealer">取消</button></div>';
		$pop.append($content);
		$pop.append($footer);
		//$('#attach_pop').append($pop);
		//统一弹出框
		var popup = $.popup("#div_attach_choose",$pop,{
			width:800,
			height:$(window).height(),
			contentHeight:$(window).height()-120,
			afterClose:function(){}
		});
		$("#sureAdddealer").off("tap").on("tap",function(){_addAttachDealer();});
		$("#closeAdddealer").off("tap").on("tap",function(){$("#div_attach_choose").popup("close");});
		if(OrderInfo.provinceInfo!=undefined&&OrderInfo.provinceInfo.prodOfferId!=undefined&&OrderInfo.provinceInfo.prodOfferId!=""){
			$("#order_dealer_btn").tap(function(){$("#div_attach_choose").popup("close");});
		}
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
		$.jqmRefresh($("#dealerTbody"));
	};
	
	//删除协销人
	var _removeAttDealer = function(id){
		$("li[name^='tr_"+id+"']").each(function(){
			$(this).remove();
		});
		$.jqmRefresh($("#dealerTbody"));
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
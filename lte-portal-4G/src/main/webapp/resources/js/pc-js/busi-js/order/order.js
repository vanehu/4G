CommonUtils.regNamespace("order", "service");

order.service = (function(){
	var _offerprice=""; 
	
	var _newMemberFlag = false;
	var _oldMemberFlag = false;
	var _newAddList = [];
	var maxNum = 0;
	
	//主套餐
	var _searchPack = function(pageIndex){

		var custId =OrderInfo.cust.custId;
		var searchtext = $('#searchtext').val();
		if(searchtext=="请输入您要搜索的套餐名称或首字母简拼"){
			searchtext="";
		}
//		var phoneLevel=order.pdshoneNumber.boProdAn.level;
		var phoneLevel='';
		var numsubPage=$("#numsubflag").val();
		if((phoneLevel==undefined&&phoneLevel==null)||numsubPage=='number'){
			phoneLevel='';
		}
		var subPage=$("#subpageFlag").val();
		var params={"subPage":subPage,"qryStr":searchtext,"pnLevelId":phoneLevel,"custId":custId,"PageIndex":pageIndex,"PageSize":10};
		
		if($("#price_basic").css("display") != "none"){
			var priceVal = $("#price_basic a.selected").attr("val");
			if(priceVal!=null&&priceVal!=""){
				var priceArr = priceVal.split("-");
				if(priceArr[0]!=null&&priceArr[0]!=""){
					params.priceMin = priceArr[0] ;
				}
				if(priceArr[1]!=null&&priceArr[1]!=""){
					params.priceMax = priceArr[1] ;
				}
			}
		}
		if($("#influx_basic").css("display") != "none"){
			var influxVal = $("#influx_basic a.selected").attr("val");
			if(influxVal!=null&&influxVal!=""){
				var influxArr = influxVal.split("-");
				if(influxArr[0]!=null&&influxArr[0]!=""){
					params.INFLUXMin = influxArr[0]*1024 ;
				}
				if(influxArr[1]!=null&&influxArr[1]!=""){
					params.INFLUXMax = influxArr[1]*1024 ;
				}
			}
		}
		if($("#invoice_basic").css("display") != "none"){
			var invoiceVal = $("#invoice_basic a.selected").attr("val");
			if(invoiceVal!=null&&invoiceVal!=""){
				var invoiceArr = invoiceVal.split("-");
				if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
					params.INVOICEMin = invoiceArr[0] ;
				}
				if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
					params.INVOICEMax = invoiceArr[1] ;
				}
			}
		}
		
		//查询套餐列表数据信息
		_queryData(params);
		
	};
	
	var _searchPackById = function(prodOfferId){
		var params={"prodOfferId":prodOfferId,"pnLevelId":"","PageIndex":1,"PageSize":10};
		_queryData(params);
	};
	
	var _queryData = function(params) {
		if(OrderInfo.actionFlag==2){
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if(offerSpecId!=undefined){
				params.changeGradeProdOfferId = offerSpecId;
			}
			var prodSpecIds='';
			$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
				if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					if(this.objId!=undefined){
						prodSpecIds=prodSpecIds+","+this.objId;
					}
				}
			});
			if(prodSpecIds!=''){
				prodSpecIds=prodSpecIds.substring(1, prodSpecIds.length);
				params.prodSpecId=prodSpecIds;
			}
			//3G老套餐只能变更成4G新套餐，不支持3转3
//			var prodClass = order.prodModify.choosedProdInfo.prodClass;
//			if(prodClass==CONST.PROD_CLASS.THREE){
//				params.prodOfferFlag = "4G";
//			}
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		var url = contextPath+"/token/pc/order/offerSpecList";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				if(!response){
					response.data='<li><a href="#" class="ft">暂无套餐</a></li>';
				}
				if (response.code == -2) {
					return;
				}else if(response.code != 0) {
					$.alert("提示","response.code");
					return;
				}
				
				//判断是否二次加载，二次不展示套餐
				var nowReloadFalg=OrderInfo.newOrderInfo.isReloadFlag;
				
				if(nowReloadFalg!="N"){
					jQuery("#service_detial").html(response.data).fadeIn();
					
					var show_per_page = 10; //每页显示条数
					var number_of_items = $('#offerlistcont').children().size();
					if(number_of_items==0){
						//var noitems_html = "<div style='text-align:center;'>抱歉，没有找到相关的套餐。</div>";
						var noitems_html = "<img width='25' height='25' src='"+contextPath+"/image/icon/tip.png'>抱歉，没有找到相关的套餐。";
						$("#errinfo").html(noitems_html);
						$('#page_navigation').html("");
					}else{
						var number_of_pages = Math.ceil(number_of_items/show_per_page);
						$('#current_page').val(0);
						$('#show_per_page').val(show_per_page);
						var navigation_html = '<label><span class="pageUpGray" onclick="order.service.previous();">上一页</span></label><label>';
						var current_link = 0;
						while(number_of_pages > current_link){
							navigation_html += '<a class="page_link" href="javascript:order.service.go_to_page(' + current_link +')" longdesc="' + current_link +'">'+ (current_link + 1) +'</a>';
							current_link++;
						}
						navigation_html += '</label><label><span class="nextPageGrayOrange" onclick="order.service.next();">下一页</span></label>';
						$('#page_navigation').html(navigation_html);
						$('#page_navigation .page_link:first').addClass('pagingSelect');
						//$('#page_navigation .page_link:first').removeClass('page_link');
						$('#offerlistcont').children().css('display', 'none');
						$('#offerlistcont').children().slice(0, show_per_page).css('display', 'table-row');
						if($('.pagingSelect').next('.page_link').length==false){
							$('.nextPageGrayOrange').removeClass('nextPageGrayOrange').addClass('nextPageGray');
						}
					}	
				}
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	/**
	 * 根据合约规格编码aoId查询主销售品
	 */
	var _queryPackForTerm = function(aoId, agreementType, numLevel){
		var params={
			"aoId":aoId,
			"agreementType":agreementType,
			"numLevel":numLevel
		};
		var url = contextPath+"/order/queryPackForTerm";
		var response = $.callServiceAsJson(url,params, {});
		return response;
	};
	
	//订购销售品
	var _buyService = function(specId,price) {
		
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
			return;
		}
		var param = {
			"price":price,
			"specId" : specId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.soAreaId
		};
		
		if(OrderInfo.actionFlag == 2){  //套餐变更不做校验	
			order.service.opeSer(param);   
		}else {  //新装
			var boInfos = [{
	            boActionTypeCd: "S1",//动作类型
	            instId : "",
	            specId : specId //产品（销售品）规格ID
	        }];
	        if(rule.rule.ruleCheck(boInfos)){  //业务规则校验通过
	        	order.service.opeSer(param);   
	        }
		}
	};
	
	var _loadOfferChangeView = function(param, offerSpec){
		var feeTypeFlag = query.common.queryPropertiesValue("QUERYFEETYPE_"+OrderInfo.staff.areaId.substring(0,3));
				if("0"==feeTypeFlag){			
					var is_same_feeType=false;
					if(order.prodModify.choosedProdInfo.feeType=="2100" && (offerSpec.feeType=="2100"||offerSpec.feeType=="3100"||offerSpec.feeType=="3101"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
						is_same_feeType=true;//预付费
					}else if(order.prodModify.choosedProdInfo.feeType=="1200" && (offerSpec.feeType=="1200"||offerSpec.feeType=="3100"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
						is_same_feeType=true;//后付费
					}else if(order.prodModify.choosedProdInfo.feeType=="1201" && (offerSpec.feeType=="1201"||offerSpec.feeType=="3101"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103")){
						is_same_feeType=true;//准实时预付费
					}
					var show_change_fee = offerChange.queryPortalProperties("FEETYPE_"+OrderInfo.staff.soAreaId.substring(0,3));
					if(!is_same_feeType && show_change_fee !="ON"){
						$.alert("提示","付费类型不一致,无法进行套餐变更。");
						return;
					}
				}
		offerChange.offerChangeView();
		return;
	};
	
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldprodAcctInfos = [];
		OrderInfo.oldAddNumList = [];
		_newAddList = [];

		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}

        if (needCheck(offerSpec)) {
            if (OrderInfo.actionFlag == 2) {  //套餐变更不做校验
                order.cust.preCheckCertNumberRelQueryOnly(order.cust.getCustInfo415());//调用一证五号校验接口获取已有的数量
            } else if (!CacheData.isGov(OrderInfo.cust.custId == "-1" ? OrderInfo.boCustIdentities.identidiesTypeCd : OrderInfo.cust.identityCd)) {//政企客户新装不调用一证五号校验
                //一证五号校验
                if (!order.cust.preCheckCertNumberRel("-1", order.cust.getCustInfo415())) {
                    return;
                }
            }
        }

        if(OrderInfo.actionFlag == 2){//套餐变更
			OrderInfo.offer.initOfferCheckRule(offerSpec);
			var isOfferChangeAllowed = OrderInfo.offer.getResult();
			if(isOfferChangeAllowed){
				_loadOfferChangeView(param, offerSpec);
			}
			return;
        }
		// 销售品后处理
		offerSpecAfterDeal(offerSpec);
		
		//老号码新增内容
		var areaidflag = order.memberChange.areaidJurisdiction();
		
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var $tbody = $("#member_tbody");
		$tbody.html("");
		$("#main_title").text(OrderInfo.offerSpec.offerSpecName);
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			var $tr = $("<tr style='background:#f8f8f8;'></tr>");
			var $td = $('<td class="borderLTB" style="font-size:14px; padding:0px 0px 0px 12px"><span style="color:#518652; font-size:14px;">'
					+offerRole.offerRoleName+'</span>&nbsp;&nbsp;</td>');
			if(this.memberRoleCd == CONST.MEMBER_ROLE_CD.CONTENT){
				$tr.append($td).append($("<td colspan='3'></td>")).appendTo($tbody);
			}else{
				$tr.append($td).appendTo($tbody);
			}
			
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
				if(this.objType == CONST.OBJ_TYPE.PROD){
					if(offerRole.memberRoleCd=="401"){
						_newAddList.push(objInstId);
					}
					
					var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
					maxNum = max;
					var min = this.minQty;
					
					//新装判断是否有传主副卡信息
					if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""&&offerRole.memberRoleCd=="401"){
						var subPhoneNums = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
						var nums = subPhoneNums.length;
						this.dfQty = nums;
						this.minQty = nums;
						this.maxQty = nums;
						max = nums;
					}
					
					if(OrderInfo.newOrderNumInfo.mainPhoneNum!=""&&OrderInfo.newOrderNumInfo.newSubPhoneNum==""&&offerRole.memberRoleCd=="401"){
						this.maxQty = 0;
						max = 0;
					}
					
					$tr.append("<td align='left' colspan='3'>"+this.objName+" :<i id='plan_no' style='margin-top: 3px; display: inline-block; vertical-align: middle;'>"+
							"<a class='add' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'></a>"+
							"<input id='"+objInstId+"' type='text' value='"+this.dfQty+"' class='numberTextBox width22' readonly='readonly'>"+
							"<a class='add2' href='javascript:order.service.addNum(\""+objInstId+"\","+this.maxQty+",\""+offerRole.parentOfferRoleId+"\");'> </a>"+
							"</i>"+this.minQty+"-"+max+"（张） </td>");	
					
					iflag++;
				}
			});
			var $trServ = $("<tr></tr>");
			var i = 0;
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id	
				if(this.objType == CONST.OBJ_TYPE.SERV){  //是否有功能产品
					if(i%4==0){
						$trServ = $("<tr></tr>");
						$trServ.appendTo($tbody);
					}
					var $input = $('<input id="'+objInstId+'" name="'+offerRole.offerRoleId+'" type="checkbox">'+this.objName+'</input>');
					if(this.minQty == 0){
						if(this.dfQty>0){
							$input.attr("checked","checked");
						}
					}else if(this.minQty > 0){
						$input.attr("checked","checked");
						$input.attr("disabled","disabled");
					}
					var $td = $("<td></td>");
					$td.append($input).appendTo($trServ);
					i++;
					iflag++;
				}
			});
			
			if(offerRole.memberRoleCd=="401" && areaidflag!="" && areaidflag.net_vice_card=="0"){
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){					
						var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						var min = this.minQty;
						//获取老用户纳入号码
						var oldSubPhoneNums=OrderInfo.oldSubPhoneNum.oldSubPhoneNum;
						
						//如果最大个数为0，不展示老用户号码输入框
						if(this.maxQty!=0){
							var oldSubPhoneNum=OrderInfo.oldSubPhoneNum.oldSubPhoneNum;
							var oldTips = "注意：纳入老用户必须和主卡账户一致!";
							if(query.common.queryPropertiesStatus("ADD_OLD_USER_MOD_ACCT_"+OrderInfo.getAreaId().substring(0,3))){
								oldTips = "注意：您纳入加装的移动电话纳入后将统一使用主卡账户！";
							}
							var $trOldNbr = "<tr style='background:#f8f8f8;' id='oldnum_1' name='oldnbr'>" +
							"<td class='borderLTB' style='font-size:14px; padding:0px 0px 0px 12px'><span style='color:#518652; font-size:14px;'>已有移动电话</span></td>" +
							"<td align='left' colspan='3'><input value='' style='margin-top:10px' class='numberTextBox' id='oldphonenum_1' type='text' >" +
							"<a style='margin-top:15px' class='add2' href='javascript:order.memberChange.addNum("+max+",\"\");'> </a>"+min+"-"+max+"（张）</td></tr>"+	
							"<tr style='background:#f8f8f8;' name='oldnum_tips'><td align='left' colspan='4' style ='color: red; padding-left: 30px;'>"+oldTips+"</td></tr>";	
							$tbody.append($trOldNbr);
							
							if(oldSubPhoneNums!=null && oldSubPhoneNums!=""){
								//order.memberChange.addNum(3,"");
								var oldSubPhoneNum=oldSubPhoneNums.split(",");
								
								if(oldSubPhoneNum!=null && oldSubPhoneNum.length>0){
									for(var i=0;i<oldSubPhoneNum.length;i++){
										if(i==0){
											$("#oldphonenum_1").val(oldSubPhoneNum[i]);
										}else{
											//添加输入框
											order.memberChange.addNum(max,"");
											$("#oldphonenum_"+(i+1)).val(oldSubPhoneNum[i]);
										}
									}
								}
							}
						}
					}
				});
			}
		});
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(iflag>1){
			easyDialog.open({
				container : "member_dialog"
			});
			$("#member_btn").off("click").on("click",function(){
				order.service.confirm(param);
			});
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};

	var offerSpecAfterDeal = function(offerSpec){
		$.each(offerSpec.offerRoles, function () {
			$.each(this.roleObjs, function () {
				if (this.objType == CONST.OBJ_TYPE.PROD && this.objId == CONST.PROD_SPEC.PROD_CLOUD_OFFER) {
					order.phoneNumber.getVirtualNum();
				}
			});
		});
	}
	
	//选择完主套餐构成后确认
	var _confirm = function(param){
		order.memberChange.viceCartNum = 0;
		
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			this.prodInsts = [];
		});
		
		//新增内容
		var newnum = 0;
		$.each(_newAddList,function(){
			newnum=newnum+Number($("#"+this).val());
		});
		var oldnum = 0;
		$("#member_tbody").find("tr[name='oldnbr']").each(function(){
			var num = $.trim($(this).children("td").eq(1).children("input").val());
			if(ec.util.isObj(num)){
				oldnum++;
			}
		});
		
		if(!_setOfferSpec()){
			$.alert("错误提示","请选择一个接入产品");
			return;
		}
		
		if(newnum>0){
			order.service.newMemberFlag = true;
			param.newnum = newnum;
		}else{
			order.service.newMemberFlag = false;
		}
		
		if(oldnum>0){
			order.service.oldMemberFlag = true;
			if(!order.memberChange.queryofferinfo()){
				return;
			}
			param.oldprodInstInfos = OrderInfo.oldprodInstInfos;
			param.oldofferSpec = OrderInfo.oldofferSpec;
			param.oldoffer = OrderInfo.oldoffer;
			param.oldnum = oldnum;
		}else{
			order.service.oldMemberFlag = false;
		}
		
		if(parseInt(newnum)+parseInt(order.memberChange.viceCartNum)>maxNum){
			$.alert("提示","加装数量已经超过能加装的最大数量【"+maxNum+"】---!");
			return;
		}
		if((parseInt(newnum)+parseInt(ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,order.cust.getCustInfo415Flag(order.cust.getCustInfo415()))))>4){
            $.alert("提示","此用户下已经有"+ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,order.cust.getCustInfo415Flag(order.cust.getCustInfo415()))+"个号码，多余的副卡请选择其它使用人后继续办理业务！");
        }
		if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
			order.main.buildMainView(param);	
		}else{
			mktRes.terminal.newnum = newnum;
			mktRes.terminal.oldnum = oldnum;
		}
		
		//弹出框无法关闭修复wangjz5
		jQuery("#easyDialogBox").hide();
		
		jQuery("#overlay").hide();
			
	};
	
	//根据页面选择成员数量保存销售品规格构成 offerType为1是单产品
	var _setOfferSpec = function(offerType){
		var k = -1;
		var flag = false;  //判断是否选接入产品
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(offerRole.prodInsts==undefined){
				offerRole.prodInsts = [];
			}
			//offerRole.prodInsts = []; //角色对象实例
			$.each(this.roleObjs,function(){
				if(this.objType== CONST.OBJ_TYPE.PROD){  //接入类产品
					var num = 0;  //接入类产品数量选择
					if(offerType==1){  //单产品
						num = 1;
					}else{ //多成员销售品
						num = $("#"+offerRole.offerRoleId+"_"+this.objId).val();  //接入类产品数量选择
					}
					if(num==undefined || num==""){
						num = 0;
					}
					for ( var i = 0; i < num; i++) {
						var newObject = jQuery.extend(true, {}, this); 
						newObject.prodInstId = k--;
						if(num>1){ //同一个规格产品选择多个
							newObject.offerRoleName = offerRole.offerRoleName+(i+1);
						}else{
							newObject.offerRoleName = offerRole.offerRoleName;
						}
						newObject.memberRoleCd = offerRole.memberRoleCd;
						offerRole.prodInsts.push(newObject);   
						flag = true;
					}
					offerRole.selQty = num;
				}else{ //功能类产品
					if(this.minQty==0 && OrderInfo.actionFlag==1){
						if($("#"+offerRole.offerRoleId+"_"+this.objId).attr("checked")=="checked"){
							this.dfQty = 1;
						}else{
							this.dfQty = 0;
						}
					}
				}
			});
		});
		return flag;
	};
	
	//添加一个角色
	var _addNum = function(id,max,parentOfferRoleId){
		if(ec.util.isObj(parentOfferRoleId)){
			var viceNum = 0;
			var offerRoles = [];
			var parentMaxQty = 0;
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				var offerRole = this;
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
						if(ec.util.isObj(offerRole.parentOfferRoleId) && parentOfferRoleId==offerRole.parentOfferRoleId){
							offerRoles.push(offerRole);
							parentMaxQty = offerRole.parentMaxQty;
							viceNum += Number($("#"+objInstId).val());
						}
					}
				});
			});
			if(parentMaxQty>0){
				if(viceNum >= parentMaxQty){
					if(ec.util.isArray(offerRoles)){
						var str = "【";
						for ( var i = 0; i < offerRoles.length; i++) {
							var offerRole = offerRoles[i];
							str += offerRole.offerRoleName+",";
						}
						str = str.substr(0, str.lastIndexOf(','));
						str += "】角色成员数量总和不能超过"+parentMaxQty;
						$.alert("规则限制",str);
						return;
					}
				}
			}
		}
		var num = Number($("#"+id).val());
		if(max<0){
			num+=1;
			$("#"+id).val(num);
		}else{
			if(num<max){
				num+=1;
				$("#"+id).val(num);
			}
		}		
	};
	
	var _subNum = function(id,min){
		var num = Number($("#"+id).val());
		if(num>min){
			num-=1;
			$("#"+id).val(num);
		}		
	};
	
	var _addNumNoLim = function(id){
		var num = Number($("#"+id).val());
		num+=1;
		$("#"+id).val(num);		
	};
	
	var _subNumNoLim = function(id){
		var num = Number($("#"+id).val());
		num-=1;
		$("#"+id).val(num);		
	};
	
	var _previous= function(){
		new_page = parseInt($('#current_page').val()) - 1;
		if($('.pagingSelect').prev('.page_link').length==true){
			go_to_page(new_page);
		}
		
	};

	var _next=function(){
		new_page = parseInt($('#current_page').val()) + 1;
		if($('.pagingSelect').next('.page_link').length==true){
			go_to_page(new_page);
		}
		
	};
	
	var go_to_page = function(page_num){
		var show_per_page = parseInt($('#show_per_page').val());
		start_from = page_num * show_per_page;
		end_on = start_from + show_per_page;
		$('#offerlistcont').children().css('display', 'none').slice(start_from, end_on).css('display', 'table-row');
		$('.page_link[longdesc=' + page_num +']').addClass('pagingSelect').siblings('.pagingSelect').removeClass('pagingSelect');
		$('#current_page').val(page_num);
		if($('.pagingSelect').prev('.page_link').length==true){
			$('.pageUpGray').removeClass('pageUpGray').addClass('pageUpOrange');
		}else{
			$('.pageUpOrange').removeClass('pageUpOrange').addClass('pageUpGray');
		}
		
		if($('.pagingSelect').next('.page_link').length==true){
			$('.nextPageGray').removeClass('nextPageGray').addClass('nextPageGrayOrange');
		}else{
			$('.nextPageGrayOrange').removeClass('nextPageGrayOrange').addClass('nextPageGray');
		}
	};
	
	//订单取消时，释放已预占资源的入口标识。0：初始化状态，1：购机或选号入口，2：套餐入口
	var _releaseFlag = 0;
	//购机和选号入口的预占号码信息缓存
	var _boProdAn = {};

	var _initSpec = function(){
		$("#search").off("click").on("click",function(){order.service.searchPack();});
	};
	var _offerDialog=function(subPage){
		var param={};
		var url=contextPath+"/order/prodoffer/prepare?subPage="+subPage;
		$.callServiceAsHtmlGet(url,param,{
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(!response){
					 response.data='<div style="margin:2px 0 2px 0;width:100%,height:100%;text-align:center;"><strong>页面显示失败,稍后重试</strong></div>';
				}
				if(response.code != 0) {
					$.alert("提示","页面显示失败,稍后重试");
					return;
				}
				var content$=$("#offerspecContent");
				content$.html(response.data);
				order.prepare.backToInit();
				_initSpec();
				order.prodOffer.queryApConfig();
				order.service.searchPack();
				$("#chooseofferspecclose").click(function(){
					_closeChooseDialog();
				});
				easyDialog.open({
					container : 'chooseofferspec'
				});
			}
		});	
	};
	var _closeChooseDialog = function() {
		if (!$("#chooseofferspec").is(":hidden")){
			easyDialog.close();
		}
	};
	var _choosedOffer=function(id,specId,price,subpage,specName){
		var param={"offerSpecId":specId};
		var response = $.callServiceAsJson(contextPath+"/order/queryOfferSpec",param);
		if (response.code==0) {
			if(response.data){
				var offerRoleId="";
				var prodOfferSpec=response.data.offerSpec;
				if (prodOfferSpec && prodOfferSpec.offerRoles) {
					var offerRoles = prodOfferSpec.offerRoles;
					for (var i=0;i<offerRoles.length;i++){
						if (offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD
								|| offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.VICE_CARD) {
							if(offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
								offerRoleId=offerRoles[i].offerRoleId;
								break;
							}
						}else{
							offerRoleId=offerRoles[i].offerRoleId;
							break;
						}
					}
				}
				if(offerRoleId!=""){
					_closeChooseDialog();
					OrderInfo.offer.initOfferCheckRule(prodOfferSpec);
					var isOfferChangeAllowed = OrderInfo.offer.getResult();
					if(!isOfferChangeAllowed){
						return;
					}
					var prodId=$("#li_"+subpage).attr("objinstid");
					var accessnumber=$("#li_"+subpage).attr("accessnumber");
					for ( var i = 0; i < OrderInfo.viceOfferSpec.length; i++) {//清除旧数据
						var viceOfferSpec = OrderInfo.viceOfferSpec[i];
						if(prodId == viceOfferSpec.prodId){
							OrderInfo.viceOfferSpec.splice(i,1);
							break;
						}
					}
					prodOfferSpec.prodId=prodId;
					prodOfferSpec.accessnumber=accessnumber;
					OrderInfo.viceOfferSpec.push(prodOfferSpec);
					order.prodModify.chooseOfferForMember(specId,subpage,specName,offerRoleId);
				}else{
					$.alert("提示","无法选择套餐，套餐规格查询失败！");
				}
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","套餐详细加载失败，请稍后再试！");
		}
	};
	//二次加载部分
	//订购销售品
	var _buyServiceReload = function(specId,price,cardNum,callBack) {
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
			return;
		}
		var param = {
			"price":price,
			"specId" : specId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.soAreaId
		};
		
		if(OrderInfo.actionFlag == 2){  //套餐变更不做校验	
			order.service.opeSer(param);   
		}else {  //新装
			var boInfos = [{
	            boActionTypeCd: "S1",//动作类型
	            instId : "",
	            specId : specId //产品（销售品）规格ID
	        }];
	        if(rule.rule.ruleCheck(boInfos)){  //业务规则校验通过
	        	order.service.opeSerReload(param,cardNum);
	        	if(typeof callBack=="function"){
	        		callBack();
	        	}
	        }
		}
		
	};
	
	//获取销售品构成，并选择数量
	var _opeSerReload = function(inParam,cardNum){
	    
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		if(OrderInfo.actionFlag == 2){ //套餐变更			
			var url=contextPath+"/token/pc/order/queryFeeType";
			$.ecOverlay("<strong>正在查询是否判断付费类型的服务中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {			
				if(response.data!=undefined){
					if("0"==response.data){			
						var is_same_feeType=false;
						if(order.prodModify.choosedProdInfo.feeType=="2100" && (offerSpec.feeType=="2100"||offerSpec.feeType=="3100"||offerSpec.feeType=="3101"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//预付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1200" && (offerSpec.feeType=="1200"||offerSpec.feeType=="3100"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//后付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1201" && (offerSpec.feeType=="1201"||offerSpec.feeType=="3101"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103")){
							is_same_feeType=true;//准实时预付费
						}
						if(!is_same_feeType){
							$.alert("提示","付费类型不一致,无法进行套餐变更。");
							return;
						}
					}
				}
			}
			offerChange.offerChangeView();
			return;
		}
		//新装二次加载 主套餐名称
		if(OrderInfo.newOrderInfo.isReloadFlag=="N"){
			OrderInfo.newOrderInfo.prodOfferName=offerSpec.offerSpecName;
		}		
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var $tbody = $("#member_tbody");
		$tbody.html("");
		$("#main_title").text(OrderInfo.offerSpec.offerSpecName);
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			var $tr = $("<tr style='background:#f8f8f8;'></tr>");
			var $td = $('<td class="borderLTB" style="font-size:14px; padding:0px 0px 0px 12px"><span style="color:#518652; font-size:14px;">'
					+offerRole.offerRoleName+'</span>&nbsp;&nbsp;</td>');
			if(this.memberRoleCd == CONST.MEMBER_ROLE_CD.CONTENT){
				$tr.append($td).append($("<td colspan='3'></td>")).appendTo($tbody);
			}else{
				$tr.append($td).appendTo($tbody);
			}
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
				if(this.objType == CONST.OBJ_TYPE.PROD){
					if(offerRole.memberRoleCd=="401"){
						_newAddList.push(objInstId);
					}
					
					if(offerRole.minQty == 0){ //加装角色
						this.minQty = 0;
						this.dfQty = 0;
					}
					
					//如果是初始化副卡,则副卡数量直接固定
					if(cardNum && offerRole.memberRoleCd=="401"){
						this.dfQty = cardNum;
					}
					
					var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
					maxNum = max;
					var min = this.minQty;
					
					//新装判断是否有传主副卡信息
					if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""&&offerRole.memberRoleCd=="401"){
						var subPhoneNums = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
						var nums = subPhoneNums.length;
						this.dfQty = nums;
						this.minQty = nums;
						this.maxQty = nums;
						max = nums;
					}
					
					if(OrderInfo.newOrderNumInfo.mainPhoneNum!=""&&OrderInfo.newOrderNumInfo.newSubPhoneNum==""&&offerRole.memberRoleCd=="401"){
						this.maxQty = 0;
						max = 0;
					}
					
					$tr.append("<td align='left' colspan='3'>"+this.objName+" :<i id='plan_no' style='margin-top: 3px; display: inline-block; vertical-align: middle;'>"+
							"<a class='add' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'></a>"+
							"<input id='"+objInstId+"' type='text' value='"+this.dfQty+"' class='numberTextBox width22' readonly='readonly'>"+
							"<a class='add2' href='javascript:order.service.addNum(\""+objInstId+"\","+this.maxQty+",\""+offerRole.parentOfferRoleId+"\");'> </a>"+
							"</i>"+this.minQty+"-"+max+"（张） </td>");	
					
					iflag++;
				}
			});
			var $trServ = $("<tr></tr>");
			var i = 0;
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id	
				if(this.objType == CONST.OBJ_TYPE.SERV){  //是否有功能产品
					if(i%4==0){
						$trServ = $("<tr></tr>");
						$trServ.appendTo($tbody);
					}
					var $input = $('<input id="'+objInstId+'" name="'+offerRole.offerRoleId+'" type="checkbox">'+this.objName+'</input>');
					if(this.minQty == 0){
						if(this.dfQty>0){
							$input.attr("checked","checked");
						}
					}else if(this.minQty > 0){
						$input.attr("checked","checked");
						$input.attr("disabled","disabled");
					}
					var $td = $("<td></td>");
					$td.append($input).appendTo($trServ);
					i++;
					iflag++;
				}
			});
			
			//老号码新增内容
			var areaidflag = order.memberChange.areaidJurisdiction();
			
			if(offerRole.memberRoleCd=="401" && areaidflag!="" && areaidflag.net_vice_card=="0"){
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){						
						var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						var min = this.minQty;
						//获取老用户纳入号码
						var oldSubPhoneNums="";
						
						var result=OrderInfo.newOrderInfo.result;
						
						var busiOrders = result.orderList.custOrderList[0].busiOrder;
						
						$.each(busiOrders,function(index,busiOrder){
							//老用户纳入
							if(busiOrder.boActionType.actionClassCd==1200 && busiOrder.boActionType.boActionTypeCd=="S2" && busiOrder.busiObj.offerTypeCd=="1"){
								var oldnum=busiOrder.busiObj.accessNumber;
								OrderInfo.oldAddNumList.push({"accNbr":oldnum});
								oldSubPhoneNums+=oldnum+",";
							}
						});
						
						//如果最大个数为0，不展示老用户号码输入框
						if(this.maxQty!=0){
							var oldSubPhoneNum=OrderInfo.oldSubPhoneNum.oldSubPhoneNum;
							
							var $trOldNbr = "<tr style='background:#f8f8f8;' id='oldnum_1' name='oldnbr'>" +
							"<td class='borderLTB' style='font-size:14px; padding:0px 0px 0px 12px'><span style='color:#518652; font-size:14px;'>已有移动电话</span></td>" +
							"<td align='left' colspan='3'><input value='' style='margin-top:10px' class='numberTextBox' id='oldphonenum_1' type='text' >" +
							"<a style='margin-top:15px' class='add2' href='javascript:order.memberChange.addNum("+max+",\"\");'> </a>"+min+"-"+max+"（张）</td></tr>";	
							$tbody.append($trOldNbr);
													
							if(oldSubPhoneNums!=null && oldSubPhoneNums!=""){
								//order.memberChange.addNum(3,"");
								var oldSubPhoneNum=oldSubPhoneNums.split(",");
								
								if(oldSubPhoneNum!=null && oldSubPhoneNum.length>0){
									for(var i=0;i<oldSubPhoneNum.length;i++){
										if(oldSubPhoneNum[i]!=null && oldSubPhoneNum[i]!=""){
											if(i==0){
												$("#oldphonenum_1").val(oldSubPhoneNum[i]);
											}else{
												//添加输入框
												order.memberChange.addNum(max,"");
												$("#oldphonenum_"+(i+1)).val(oldSubPhoneNum[i]);
											}
										}
									}
								}
							}
						}
					}
				});
			}
		});
		
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(iflag>1){
			easyDialog.open({
				container : "member_dialog"
			});
			
			//直接调到填单界面
			//$("#member_btn").off("click").on("click",function(){
			order.service.confirm(param);
			//});
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};
	var _callBackBuildOrder=function(result,prodOfferId,prodOfferName){
			var busiOrders = result.orderList.custOrderList[0].busiOrder;
			//产品信息
			var acctCd="";
			var acctName = "";
			var acctId="";//帐户信息中帐户id
			var mailingType = "";
			var param1 = "";
			var param2 = "";
			var param3 = "";
			var param7 = "";
			var bankAcct = "";
			var bankId = "";
			var paymentMan = "";
			var paymentAcctTypeCd = "";
			
			//取缓存中的已选可选包和已选功能产品
			//处理在缓存中，却不在二次加载返回的参数中----已选可选包
			$.each(AttachOffer.openList,function(index,openList){
				$.each(openList.specList,function(i,specList){
					if(!order.service.compareOrder(busiOrders,specList.offerSpecId,openList.prodId)){
						AttachOffer.delOfferSpecReload(openList.prodId,specList.offerSpecId);
					}
				});				
			});
			//处理在缓存中，却不在二次加载返回的参数中----已选功能产品
			$.each(AttachOffer.openServList,function(index,openServList){
				$.each(openServList.servSpecList,function(i,servSpecList){
					var servSpecId = servSpecList.servSpecId;
					var servSpecName = servSpecList.servSpecName;
					if(!order.service.compareServOrder(busiOrders,servSpecId,openServList.prodId)){						
						AttachOffer.closeServSpecReload(openServList.prodId,servSpecId,servSpecName,servSpecList.ifParams)
					}
				});
			});
			
			$.each(busiOrders,function(index,busiOrder){
				//主副卡信息
				if(busiOrder.boActionType.actionClassCd==1300&&busiOrder.boActionType.boActionTypeCd=="1"){
					var prodId = busiOrder.busiObj.instId;
					var accessNumber = busiOrder.busiObj.accessNumber;//接入号
					var terminalCode = busiOrder.data.bo2Coupons[0].terminalCode;//uim卡号
					var feeType = busiOrder.data.boProdFeeTypes[0].feeType;//付费类型
					var prodPwTypeCd = busiOrder.data.boProdPasswords[0].prodPwTypeCd;
					var pwd = busiOrder.data.boProdPasswords[0].pwd;//产品密码
					//主卡才有是否信控
					var isCheckMask = "20";//默认信控
					if(busiOrder.data.boProdItems&&busiOrder.data.boProdItems[0].itemSpecId){
						var itemSpecId = busiOrder.data.boProdItems[0].itemSpecId;
						if(itemSpecId=="40010030"){//是否信控
							isCheckMask = busiOrder.data.boProdItems[0].value;
						}
						//是否信控放在OrderInfo.newOrderInfo.isCheckMask中				
						var checkMark = {};
						checkMark.itemSpecId = itemSpecId;
						checkMark.prodId = prodId;
						checkMark.isCheckMask = isCheckMask;
						OrderInfo.newOrderInfo.checkMaskList.push(checkMark);
						
						$("#"+itemSpecId+"_"+prodId+"").find("option[value='"+isCheckMask+"']").attr("selected","selected");
					}
					
					
					$("#nbr_btn_"+prodId).html(accessNumber+"<u></u>");
					var boProdAns={
							prodId : this.data.boProdAns[0].prodId, //从填单页面头部div获取
							accessNumber : this.data.boProdAns[0].accessNumber, //接入号
							anChooseTypeCd : this.data.boProdAns[0].anChooseTypeCd, //接入号选择方式,自动生成或手工配号，默认传2
							anId : this.data.boProdAns[0].anId, //接入号ID
							pnLevelId:this.data.boProdAns[0].pnLevelId,
							anTypeCd : this.data.boProdAns[0].anTypeCd, //号码类型
							state : this.data.boProdAns[0].state, //动作	,新装默认ADD	
							areaId:this.data.boProdAns[0].areaId,
							areaCode:this.data.boProdAns[0].areaCode,
							memberRoleCd:this.data.boProdAns[0].memberRoleCd,
							preStore:this.data.boProdAns[0].preStore,
							minCharge:this.data.boProdAns[0].minCharge
						};
					OrderInfo.boProdAns.push(boProdAns);
					order.dealer.changeAccNbr(this.data.boProdAns[0].prodId,this.data.boProdAns[0].accessNumber);//选号要刷新发展人管理里面的号码					
					//uim卡校验					
					$("#uim_txt_"+prodId).attr("disabled",true);
					$("#uim_txt_"+prodId).val(terminalCode);
					$("#uim_check_btn_"+prodId).attr("disabled",true);
					$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
					$("#uim_release_btn_"+prodId).attr("disabled",false);
					$("#uim_release_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
					var coupon = {
							couponUsageTypeCd : this.data.bo2Coupons[0].couponUsageTypeCd, //物品使用类型
							inOutTypeId : this.data.bo2Coupons[0].inOutTypeId,  //出入库类型
							inOutReasonId : this.data.bo2Coupons[0].inOutReasonId, //出入库原因
							saleId : this.data.bo2Coupons[0].saleId, //销售类型
							couponId : this.data.bo2Coupons[0].couponId, //物品ID
							couponinfoStatusCd : this.data.bo2Coupons[0].couponinfoStatusCd, //物品处理状态
							chargeItemCd : this.data.bo2Coupons[0].chargeItemCd, //物品费用项类型
							couponNum : this.data.bo2Coupons[0].couponNum, //物品数量
							storeId : this.data.bo2Coupons[0].storeId, //仓库ID
							storeName : this.data.bo2Coupons[0].storeName, //仓库名称
							agentId : this.data.bo2Coupons[0].agentId, //供应商ID
							apCharge : this.data.bo2Coupons[0].apCharge, //物品价格
							couponInstanceNumber : this.data.bo2Coupons[0].couponInstanceNumber, //物品实例编码
							terminalCode : this.data.bo2Coupons[0].terminalCode,//前台内部使用的UIM卡号
							ruleId : this.data.bo2Coupons[0].ruleId, //物品规则ID
							partyId : this.data.bo2Coupons[0].partyId, //客户ID
							prodId :  this.data.bo2Coupons[0].prodId, //产品ID
							offerId : this.data.bo2Coupons[0].offerId, //销售品实例ID
							state : this.data.bo2Coupons[0].state, //动作
							relaSeq : this.data.bo2Coupons[0].relaSeq //关联序列	
						};
					OrderInfo.clearProdUim(this.busiObj.instId);
					OrderInfo.boProd2Tds.push(coupon);
					
					var payTypeOptions = $("select[name='pay_type_"+prodId+"']");
					$(payTypeOptions).find("option[value='"+feeType+"']").attr("selected","selected");
					$("#pwd_"+prodId).val(pwd);
				}
				//取订购套餐的公共信息
				if(busiOrder.boActionType.actionClassCd==1100&&busiOrder.boActionType.boActionTypeCd=="A1"){
					if(busiOrder.data.boAccountInfos.length>0){
						acctCd=busiOrder.data.boAccountInfos[0].acctCd;
						acctName = busiOrder.data.boAccountInfos[0].acctName;
						//将账单投递方式保存到公共变量中
						OrderInfo.newOrderInfo.acctCd=acctCd;
						OrderInfo.newOrderInfo.acctName=acctName;
					}
					if(busiOrder.data.boAccountMailings&&busiOrder.data.boAccountMailings.length>0){
						mailingType = busiOrder.data.boAccountMailings[0].mailingType;
						param1 = busiOrder.data.boAccountMailings[0].param1;
						param2 = busiOrder.data.boAccountMailings[0].param2;
						param3 = busiOrder.data.boAccountMailings[0].param3;
						param7 = busiOrder.data.boAccountMailings[0].param7;
						OrderInfo.newOrderInfo.mailingType=mailingType;
						OrderInfo.newOrderInfo.param1=param1;
						OrderInfo.newOrderInfo.param2=param2;
						OrderInfo.newOrderInfo.param3=param3;
						OrderInfo.newOrderInfo.param7=param7;
					}
					if(busiOrder.data.boPaymentAccounts&&busiOrder.data.boPaymentAccounts.length>0){
						bankAcct = busiOrder.data.boPaymentAccounts[0].bankAcct;
						bankId = busiOrder.data.boPaymentAccounts[0].bankId;
						limitQty = busiOrder.data.boPaymentAccounts[0].limitQty;
						paymentMan = busiOrder.data.boPaymentAccounts[0].paymentMan;
						paymentAcctTypeCd = busiOrder.data.boPaymentAccounts[0].paymentAcctTypeCd;
						OrderInfo.newOrderInfo.bankAcct=bankAcct;
						OrderInfo.newOrderInfo.bankId=bankId;
						OrderInfo.newOrderInfo.limitQty=limitQty;
						OrderInfo.newOrderInfo.paymentMan=paymentMan;
						OrderInfo.newOrderInfo.paymentAcctTypeCd=paymentAcctTypeCd;
					}
				}else if(busiOrder.boActionType.actionClassCd=="1300" && busiOrder.boActionType.boActionTypeCd=="1"){//当二次加载帐户信息不为新增帐户时
					if(busiOrder.data.boAccountRelas&&busiOrder.data.boAccountRelas.length>0){
						acctCd=busiOrder.data.boAccountRelas[0].acctCd;
						acctId=busiOrder.data.boAccountRelas[0].acctId;
					}
				}else{
					acctCd="";
				}
				//取缓存中的已选可选包和已选功能产品
				var openLists = AttachOffer.openList;
				var cloneOpenLists = $.extend(true, [], AttachOffer.openList);
				var openServLists = AttachOffer.openServList;
				var cloneOpenServLists =  $.extend(true, [], AttachOffer.openServList);
				//将二次加载回参做解析
				var resOpenLists = [];
				var resOpenServLists = [];				
				//可选包和功能产品
				if(busiOrder.boActionType.actionClassCd=="1200" && busiOrder.boActionType.boActionTypeCd=="S1"){
					var offermap = busiOrder;
					$.each(AttachOffer.openList,function(){
						if(this.prodId==offermap.data.ooRoles[0].prodId){
							var offerflag = false;
							$.each(this.specList,function(){
								if(this.offerSpecId==offermap.busiObj.objId){
									offerflag = true;
									return false;
								}
							});
							if(!offerflag){
								AttachOffer.addOfferSpecReload(this.prodId,offermap.busiObj.objId);
								//AttachOffer.addOpenList(offermap.data.ooRoles[0].prodId,offermap.busiObj.objId);							
								if(offermap.data.bo2Coupons!=undefined){
									for(var i=0;i<offermap.data.bo2Coupons.length;i++){
										var bo2Coupons = offermap.data.bo2Coupons[i];
										if(i==0){
											$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
											AttachOffer.checkTerminalCodeReload($("#terminalBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num));
										}else{
											AttachOffer.addAndDelTerminal($("#terminalAddBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId));
											$("#terminalText_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num).val(bo2Coupons.couponInstanceNumber);
											AttachOffer.checkTerminalCodeReload($("#terminalBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num));
										}
										var coupon = {
												couponUsageTypeCd : bo2Coupons.couponUsageTypeCd, //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
												inOutTypeId : bo2Coupons.inOutTypeId,  //出入库类型
												inOutReasonId : bo2Coupons.inOutReasonId, //出入库原因
												saleId : bo2Coupons.saleId, //销售类型
												couponId : bo2Coupons.couponId, //物品ID
												couponinfoStatusCd : bo2Coupons.couponinfoStatusCd, //物品处理状态
												chargeItemCd : bo2Coupons.chargeItemCd, //物品费用项类型
												couponNum : bo2Coupons.couponNum, //物品数量
												storeId : bo2Coupons.storeId, //仓库ID
												storeName : bo2Coupons.storeName, //仓库名称
												agentId : bo2Coupons.agentId, //供应商ID
												apCharge : bo2Coupons.apCharge, //物品价格,约定取值为营销资源的
												couponInstanceNumber : bo2Coupons.couponInstanceNumber, //物品实例编码
												ruleId : bo2Coupons.ruleId, //物品规则ID
												partyId : bo2Coupons.partyId, //客户ID
												prodId : bo2Coupons.prodId, //产品ID
												offerId : bo2Coupons.offerId, //销售品实例ID
												attachSepcId : bo2Coupons.attachSepcId,
												state : bo2Coupons.state, //动作
												relaSeq : bo2Coupons.relaSeq, //关联序列	
												num	: bo2Coupons.num //第几个串码输入框
											};
											OrderInfo.attach2Coupons.push(coupon);
											//AttachOffer.checkTerminalCodeReload($("#terminalAddBtn_"+bo2Coupons.prodId+"_"+bo2Coupons.attachSepcId+"_"+bo2Coupons.num));
									}
								}/*else{
									AttachOffer.addOfferSpecReload(this.prodId,offermap.busiObj.objId);
								}*/
							}
						}
					});
					
					//老用户纳入
					if(offermap.data.ooRoles[0].prodId>0){
						AttachOffer.addOfferSpecReload(offermap.data.ooRoles[0].prodId,offermap.busiObj.objId);
					}
				}else if(busiOrder.boActionType.actionClassCd=="1300" && busiOrder.boActionType.boActionTypeCd=="7"){
					if(busiOrder.data.boServs[0].state=="ADD"){
						var offermap = busiOrder;
						$.each(AttachOffer.openServList,function(){
							if(this.prodId==offermap.busiObj.instId){
								var offerflag = false;
								$.each(this.servSpecList,function(){
									if(this.servSpecId==offermap.data.boServOrders[0].servSpecId){
										offerflag = true;
										return false;
									}
								});
								if(!offerflag){
									var ifParams = "N";
									if(offermap.data.boServItems!=undefined){
										ifParams = "Y";
									}
									AttachOffer.openServSpecReload(this.prodId,offermap.data.boServOrders[0].servSpecId,offermap.data.boServOrders[0].servSpecName,ifParams);
									/*if(ifParams=="Y"){
										var spec = CacheData.getServSpec(this.prodId,offermap.data.boServOrders[0].servSpecId);
										if(!!spec.prodSpecParams){
											for (var i = 0; i < spec.prodSpecParams.length; i++) {
												var param = spec.prodSpecParams[i];
												var itemSpec = CacheData.getServSpecParam(this.prodId,offermap.data.boServOrders[0].servSpecId,param.itemSpecId);
												$.each(offermap.data.boServItems,function(){
													if(itemSpec.itemSpecId==this.itemSpecId){
														itemSpec.setValue = this.value;
													}
												});
											}
										}
										$("#can_"+this.prodId+"_"+offermap.data.boServOrders[0].servSpecId,param.itemSpecId).removeClass("canshu").addClass("canshu2");
										var attchSpec = CacheData.getServSpec(this.prodId,offermap.data.boServOrders[0].servSpecId,param.itemSpecId);
										attchSpec.isset = "Y";
									}*/
								}
							}
						});
						
						//老用户纳入
						if(offermap.busiObj.instId>0){
							var ifParams = "N";
							if(offermap.data.boServItems!=undefined){
								ifParams = "Y";
							}
							AttachOffer.openServSpecReload(offermap.busiObj.instId,offermap.data.boServOrders[0].servSpecId,offermap.data.boServOrders[0].servSpecName,ifParams);
						}
						
					}
				}
				//帐户信息
				//$("#acctSelect").find("option[value='"+acctCd+"']").attr("selected","selected");
				if(acctCd!=""&&acctCd!=-1){
					var acctQueryParam = {
						"acctCd" : acctCd,
						"isServiceOpen":"Y"   //是否能力开放,Y-是,N-否
					};			
					$.callServiceAsJson(contextPath+"/token/pc/order/account", acctQueryParam, {
						"before":function(){
							$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
						},
						"always":function(){
							$.unecOverlay();
						},
						"done" : function(response){
							if(response.code==-2){
								$.alertM(response.data);
								return;
							}
							if(response.code==0){
								var accountInfo = response.data.accountInfos;
								var returnMap = response.data;
								var found = false;	
								if(returnMap.resultCode==0){
									if(returnMap.accountInfos && returnMap.accountInfos.length > 0){
										$("#accountDiv").find("label:eq(0)").text("主卡帐户：");
										//将对应的帐号添加进去
										$.each(response.data.accountInfos, function(i, custAcct){
											if(acctId==custAcct.acctId){
												accountInfo=custAcct;
												//创建节点
												$("<option>").text(custAcct.name+" : "+custAcct.accountNumber).attr("value",custAcct.acctId)
												.attr("acctcd",custAcct.accountNumber).appendTo($("#acctSelect"));
												
												//选中节点
												$("#acctSelect").find("option[value="+custAcct.acctId+"]").attr("selected","selected");
												found = true;
												return false;
											}
										});
										$("#accountDiv").find("a:eq(0)").hide();
										$("#acctSelect").find("option[value='-1']").remove();//将新增的选项进行删除
										$("#acctSelect").parent().find("a:eq(1)").show();//显示帐户信息按钮
										$("#defineNewAcct").hide();//隐藏新增帐户对应内容
									}else{//未查询到帐户信息
									    $.alert("提示","没有查询到帐户合同号对应的帐户信息");
									}
								}else{
									$.alertM(returnMap.resultMsg);
								}	
								
								$(this).dispatchJEvent("chooseAcct",accountInfo);
								//隐藏
								$("#defineNewAcct").hide();
							}
							else{
								$("<tr><td colspan=4>"+response.data+"</td</tr>").appendTo($("#acctListTab tbody"));
							}
							$("#acctListTab tr").off("click");				
						}			
					});
				}
				//账户投递信息在初始化完投递信息后处理 acctModiy.js中处理
				/*else{
					if(busiOrder.boActionType.actionClassCd==1100&&busiOrder.boActionType.boActionTypeCd=="A1"){
						$("#acctName").val(acctName);//帐户名称为客户名称
						$("#paymentType").find("option[value='"+paymentAcctTypeCd+"']").attr("selected","selected");
						$("#postType").find("option[value='"+mailingType+"']").attr("selected","selected");
						if(mailingType!=-1){
							//显示其他信息
							$("#postAddress").show();
							$(".billPost").show();
							$("#billContent").show();
							$("#postCycle").show();
							//账单投递地址
							$("#postAddress").val(param1);
							//账单内容
							$("#billContent").find("option[value='"+param7+"']").attr("selected", "selected");
							//投递周期
							$("#postCycle").find("option[value='"+param3+"']").attr("selected", "selected");
						}
					}
				};*/
				//获取订单信息和经办人信息
				var orderListInfo = result.orderList.orderListInfo;
				var isTemplateOrder = orderListInfo.isTemplateOrder;
				var custOrderAttrs = orderListInfo.custOrderAttrs;
				var orderRemark="";
				var orderAttrName="";
				var orderAttrPhoneNbr="";
				var orderPartyTypeCd = "1";//TODO 需要查询的客户信息中获取
				var orderIdentidiesTypeCd="";
				var orderAttrIdCard="";
				var orderAttrAddr="";
				$.each(custOrderAttrs,function(index,custOrderAttr){
					if(custOrderAttr.itemSpecId=="111111118"){
						//备注 
						orderRemark = custOrderAttr.value;
					}else if(custOrderAttr.itemSpecId=="30010020"){
						//经办人姓名 
						orderAttrName = custOrderAttr.value;
					}else if(custOrderAttr.itemSpecId=="30010025"){
						// 经办人联系人号码 
						orderAttrPhoneNbr = custOrderAttr.value;
					}else if(custOrderAttr.itemSpecId=="30010026"){
						// 经办人证件类型 
						orderIdentidiesTypeCd = custOrderAttr.value;
					}else if(custOrderAttr.itemSpecId=="30010021"){
						// 经办人证件号码 
						orderAttrIdCard = custOrderAttr.value;
					}else if(custOrderAttr.itemSpecId=="30010022"){
						//经办人证件地址 
						orderAttrAddr = custOrderAttr.value;
					}
				});
				$("#order_remark").val(orderRemark);//备注信息
				//判断是否需要模板
				if(isTemplateOrder=="Y"){
					$("#isTemplateOrder").css("checked",true);
					var templateOrderName = orderListInfo.templateOrderName;
					var templateType = orderListInfo.templateType;
					$(".template_info_name").show();
					$(".template_info_type").show();
					$("#isActivation").removeAttr("checked");
					$("#isActivation").attr("disabled","disabled");
					$("#templateOrderName").val(templateOrderName);
					$("#template_info_type").find("option[value='"+templateType+"']").attr("selected", true);
				};	
				
			//经办人
			$("#orderAttrName").val(orderAttrName);
			$("#orderPartyTypeCd").find("option[value='"+orderPartyTypeCd+"']").attr("selected", true);
			$("#orderAttrPhoneNbr").val(orderAttrPhoneNbr);
			$("#orderIdentidiesTypeCd").find("option[value='"+orderIdentidiesTypeCd+"']").attr("selected", true);
			$("#orderAttrIdCard").val(orderAttrIdCard);
			$("#orderAttrAddr").val(orderAttrAddr);
		});
		
		//管理属性 发展人
		$("#dealerTbody").empty();
		order.service.dealDevelopingPerson(busiOrders,OrderInfo.newOrderInfo.prodOfferId,OrderInfo.newOrderInfo.prodOfferName);
		//清空新装二次加载标识
		//OrderInfo.newOrderInfo.isReloadFlag="";
	}	
	//处理不在二次加载回参中的可选包
	var _compareOrder=function(busiOrders,specId,prodId){
		var flag = false;
		var ordersLength = busiOrders.length;
		var i=0;
		while(i<ordersLength){
			if(busiOrders[i].boActionType.actionClassCd==1200&&busiOrders[i].boActionType.boActionTypeCd=="S1"){
				if(busiOrders[i].data.ooRoles&&busiOrders[i].data.ooRoles.length>0&&busiOrders[i].data.ooRoles[0].prodId==prodId&&busiOrders[i].busiObj.objId==specId){
					return true;
				}
			}
			i++;
		}
		return flag;
	}
	//处理不在二次加载回参中的功能产品
	var _compareServOrder=function(busiOrders,servSpecId,prodId){
		var flag = false;
		var ordersLength = busiOrders.length;
		var i=0;
		while(i<ordersLength){
			if(busiOrders[i].boActionType.actionClassCd==1300&&busiOrders[i].boActionType.boActionTypeCd=="7"){
				if(busiOrders[i].busiObj.instId==prodId&&busiOrders[i].data.boServOrders[0].servSpecId==servSpecId){
					 return true;
				}
			}
			i++;
		}
		return flag;
	}
	//处理发展人
	var _dealDevelopingPerson=function(busiOrders,prodOfferId,prodOfferName){
		$.each(busiOrders,function(index,busiOrder){
			//过滤掉 1300 ,1 的产品发展人属性
			if(busiOrder.boActionType.actionClassCd!=1300&&busiOrder.boActionType.boActionTypeCd!="1"){
				//发展人
				if(busiOrder.data.busiOrderAttrs!=undefined){
					var dealerlist = [];
					var dealerMap1 = {};
					var dealerMap2 = {};
					var dealerMap3 = {};
					$.each(busiOrder.data.busiOrderAttrs,function(){
						if(this.role=="40020005"){
							dealerMap1.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap1.staffid = this.value;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap1.staffname = this.value;
							}
							if(busiOrder.boActionType.actionClassCd==1200&&busiOrder.boActionType.boActionTypeCd=="S1"&&busiOrder.busiObj.instId==-1){
								dealerMap1.prodId=busiOrder.busiObj.instId;
							}
						}else if(this.role=="40020006"){
							dealerMap2.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap2.staffid = this.value;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap2.staffname = this.value;
							}
							if(busiOrder.boActionType.actionClassCd==1200&&busiOrder.boActionType.boActionTypeCd=="S1"&&busiOrder.busiObj.instId==-1){
								dealerMap2.prodId=busiOrder.busiObj.instId;
							}
						}else if(this.role=="40020007"){
							dealerMap3.role = this.role;
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER){
								dealerMap3.staffid = this.value;
							}else if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.DEALER_NAME){
								dealerMap3.staffname = this.value;
							}
							if(busiOrder.boActionType.actionClassCd==1200&&busiOrder.boActionType.boActionTypeCd=="S1"&&busiOrder.busiObj.instId==-1){
								dealerMap3.prodId=busiOrder.busiObj.instId;
							}
						}
						
					});
					if(ec.util.isObj(dealerMap1.role)){
						dealerlist.push(dealerMap1);
					}
					if(ec.util.isObj(dealerMap2.role)){
						dealerlist.push(dealerMap2);
					}
					if(ec.util.isObj(dealerMap3.role)){
						dealerlist.push(dealerMap3);
					}
					var objInstId = "";
					if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1"){
						objInstId = this.data.ooRoles[0].prodId+"_"+this.busiObj.objId;
					}
					var dealeraccNbr = this.busiObj.accessNumber;
					for(var d=0;d<dealerlist.length;d++){
					  if(dealerlist[d].prodId&&dealerlist[d].prodId=="-1"){
						  	var objInstId = prodOfferId;
							var $tr = $("<tr id='tr_"+objInstId+"' name='tr_"+objInstId+"'></tr>");
							var $tdType = $('<td></td>');
							var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
							var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
							$.each(OrderInfo.order.dealerTypeList,function(){
								if(dealerlist[d].role==this.PARTYPRODUCTRELAROLECD){
									$select.append("<option selected='selected' value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
								}else{
									$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
								}
							});					
							$tdType.append($select);
							$tdType.append('<label class="f_red">*</label>');
							var accNbr = "主套餐";
							$tr.append("<td>"+accNbr+"</td>");
							$tr.append("<td>"+prodOfferName+"（包含接入产品）</td>");
							$tr.append($tdType);
							var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+dealerlist[d].staffid+'" value="'+dealerlist[d].staffname+'" class="inputWidth183px" readonly="readonly" ></input></td>');
							$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
							if(d==0){
								$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,'+objInstId+',1)">添加</a><label class="f_red">*</label>');
							}else{
								$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>');
							}					
							$tr.append($td);
							if(!ec.util.isArray(OrderInfo.channelList)||OrderInfo.channelList.length==0){
								OrderInfo.getChannelList();
							}
							var $tdChannel = $('<td></td>');
							var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+objInstId+'" class="inputWidth183px" onclick=a=this.value;></select>');
							$.each(OrderInfo.channelList,function(){
								if(dealerlist[d].channelNbr==this.channelNbr)
									$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
								else
									$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
							});
							$tdChannel.append($channelSelect);
							$tdChannel.append('<label class="f_red">*</label>');	
							$tr.append($tdChannel);
							OrderInfo.SEQ.dealerSeq++;
							$("#dealerTbody").append($tr);
					   }else{
							var $tr=$('<tr name="tr_'+objInstId+'"></tr>');
							var $tdType = $('<td></td>');
							var objId = objInstId+"_"+OrderInfo.SEQ.dealerSeq;
							var $select = $('<select id="dealerType_'+objId+'" name="dealerType_'+objInstId+'" class="inputWidth183px" onclick=a=this.value; onchange="order.dealer.changeDealer(this,\'dealerType_'+objInstId+'\',a)"></select>');
							$.each(OrderInfo.order.dealerTypeList,function(){
								if(dealerlist[d].role==this.PARTYPRODUCTRELAROLECD){
									$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' selected>"+this.NAME+"</option>");
								}else{
									$select.append("<option value='"+this.PARTYPRODUCTRELAROLECD+"' >"+this.NAME+"</option>");
								}
							});
							$tdType.append($select);
							$tdType.append('<label class="f_red">*</label>');
							$tr.append("<td>"+dealeraccNbr+"</td>");
							if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){
								$tr.append("<td>"+OrderInfo.offerSpec.offerSpecName+"（包含接入产品）</td>");
							}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1"){
								$tr.append("<td>"+this.busiObj.objName+"</td>");
							}
							$tr.append($tdType);
							var $td = $('<td><input type="text" id="dealer_'+objId+'" staffId="'+dealerlist[d].staffid+'" value="'+dealerlist[d].staffname+'" class="inputWidth183px" readonly="readonly" ></input></td>');
							$td.append('<a class="purchase" href="javascript:order.main.queryStaff(0,\'dealer\',\''+objId+'\');">选择</a>');
							if(d==0){
								$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a>');
								$td.append('<a class="purchase" onclick="order.dealer.addProdDealer(this,\''+objInstId+'\')">添加</a><label class="f_red">*</label>');
							}else{
								$td.append('<a class="purchase" onclick="order.dealer.removeDealer(this);">删除</a><label class="f_red">*</label>');
							}
							$tr.append($td);
							if(!ec.util.isArray(OrderInfo.channelList)||OrderInfo.channelList.length==0){
								OrderInfo.getChannelList();
							}
							var $tdChannel = $('<td></td>');
							var $channelSelect = $('<select id="dealerChannel_'+objId+'" name="dealerChannel_'+objInstId+'" class="inputWidth183px" onclick=a=this.value;></select>');
							$.each(OrderInfo.channelList,function(){
								if(dealerlist[d].channelNbr==this.channelNbr)
									$channelSelect.append("<option value='"+this.channelNbr+"' selected ='selected'>"+this.channelName+"</option>");
								else
									$channelSelect.append("<option value='"+this.channelNbr+"'>"+this.channelName+"</option>");
							});
							$tdChannel.append($channelSelect);
							$tdChannel.append('<label class="f_red">*</label>');	
							$tr.append($tdChannel);
							OrderInfo.SEQ.dealerSeq++;
							$("#dealerTbody").append($tr);
					   }
					}
				}
			}
		  });
		}

    /**
     * 判断某个销售品是否需要调用一证五号校验，如果为以下三种，需求调用一证五号校验，其它情况都不调用校验
     * 235010000 移动电话（仅含本地语音）
     * 280000000 天翼宽带-无线数据卡
     * 280000025 智机通
     * @param offerSpec 销售品实例数据
     */
    function needCheck(offerSpec) {
        var needCheck = false;
        OrderInfo.needCheckFlag = "N";
        if (ec.util.isObj(offerSpec) && ec.util.isObj(offerSpec.offerRoles) && offerSpec.offerRoles.length > 0) {
            $.each(offerSpec.offerRoles, function () {
                if (ec.util.isObj(this.roleObjs) && this.roleObjs.length > 0) {
                    $.each(this.roleObjs, function () {
                        if (this.objId == "235010000" || this.objId == "280000000" || this.objId == "280000025") {
                            needCheck = true;
                            OrderInfo.needCheckFlag = "Y";
                        }
                    })
                }
            });
        }
        return needCheck;
    }

	return {
		searchPack	:_searchPack,
		queryPackForTerm:_queryPackForTerm,
		addNum:_addNum,
		subNum:_subNum,
		addNumNoLim:_addNumNoLim,
		subNumNoLim:_subNumNoLim,
		opeSer : _opeSer,
		buyService :_buyService,
		previous:_previous,
		next:_next,
		go_to_page:go_to_page,
		releaseFlag:_releaseFlag,
		boProdAn:_boProdAn,
		offerprice:_offerprice,
		initSpec:_initSpec,
		searchPackById:_searchPackById,
		offerDialog:_offerDialog,
		choosedOffer:_choosedOffer,
		setOfferSpec:_setOfferSpec,
		confirm		: _confirm,
		queryData:_queryData,
		buyServiceReload:_buyServiceReload,
		opeSerReload:_opeSerReload,
		callBackBuildOrder:_callBackBuildOrder,
		compareOrder:_compareOrder,
		compareServOrder:_compareServOrder,
		dealDevelopingPerson:_dealDevelopingPerson,
		oldMemberFlag:_oldMemberFlag,
		newMemberFlag:_newMemberFlag
		
	};
})();

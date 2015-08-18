CommonUtils.regNamespace("order", "service");

order.service = (function(){
	var _offerprice=""; 
	
	//主套餐查询
	var _searchPack = function(pageIndex){
		var custId = OrderInfo.cust.custId;
		var segmentId = OrderInfo.cust.segmentId;
		var searchtext = $('#searchtext').val();
		if(searchtext=="请输入您要搜索的套餐名称或首字母简拼"){
			searchtext="";
		}
		var phoneLevel=order.phoneNumber.boProdAn.level;
		if(phoneLevel==undefined&&phoneLevel==null){
			phoneLevel='';
		}
		var subPage=$("#subpageFlag").val();
		var isV=$("#isV").val();
		var params={"isV":isV,"subPage":subPage,"qryStr":searchtext,"pnLevelId":phoneLevel,"custId":custId,"segmentId":segmentId,"PageIndex":pageIndex,"PageSize":10};
		
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
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		var url = contextPath+"/order/offerSpecList";
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
				$("#service_detial").html(response.data).fadeIn();
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
	var _buyService = function(segmentId,id,specId,price) {
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
			return;
		}
		if(OrderInfo.cust.segmentId!=segmentId && segmentId != "-9999"){
			$.alert("提示","该客户无权限订购此套餐！");
			return;
		}
		var param = {
			"price":price,
			"id" : id,
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
	
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){	
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
			//用户订购老套餐的付费类型不在新套餐的允许付费类型范围内，报错
			var oF = order.prodModify.choosedProdInfo.feeType;
			var nF = offerSpec.feeType;
			var valid = false;
			var oFC = "",nFC = "";
			if(oF == 2100){ //预付费
				valid = nF == 2100 || nF == 3100 || nF == 3101 || nF == 3103 || nF == 4102 || nF == 4104 || nF == 4105 || nF == 4107;
				oFC = "预付费";
				nFC = "后付费或准预付费实时信控";
			} else if(oF == 1202){ //准预付费实时信控
				valid = nF == 1202 || nF == 4101 || nF == 4102 || nF == 4103 || nF == 4104 || nF == 4105 || nF == 4106 || nF == 4107;
				oFC = "准预付费实时信控";
				nFC = "预付费或后付费";
			} else if(oF == 1200){ //后付费
				valid = nF == 1200 || nF == 3100 || nF == 3102 || nF == 3103 || nF == 4101 || nF == 4104 || nF == 4106 || nF == 4107;
				oFC = "后付费";
				nFC = "预付费或准预付费实时信控";
			}
			if(!valid){
				$.alert("提示","您当前的付费类型为"+oFC+"，不能进行"+nFC+"付费类型的套餐变更，请重新选择！");
				return;
			}
			offerChange.offerChangeView();
			return;
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
					if(offerRole.minQty == 0){ //加装角色
						this.minQty = 0;
						this.dfQty = 0;
					}
					var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
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
	
	//选择完主套餐构成后确认
	var _confirm = function(param){
		if(!_setOfferSpec()){
			$.alert("错误提示","请选择一个接入产品");
			return;
		}
		if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
			order.main.buildMainView(param);	
		}
		easyDialog.close();
	};
	
	//根据页面选择成员数量保存销售品规格构成 offerType为1是单产品
	var _setOfferSpec = function(offerType){
		var k = -1;
		var flag = false;  //判断是否选接入产品
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			offerRole.prodInsts = []; //角色对象实例
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
					if(this.minQty==0){
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
		queryData:_queryData
	};
})();

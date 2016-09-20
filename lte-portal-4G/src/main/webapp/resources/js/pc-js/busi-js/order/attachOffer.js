/**
 * 
 * 附属销售品受理对象
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("AttachOffer");

/** 附属销售品受理对象*/
AttachOffer = (function() {
	var _myFavoriteList = [];//保存我已收藏的销售品
	var _openList = []; //保存已经选择的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openedList = []; //已经订购的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openServList = []; //保存已经选择功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openedServList = []; //保存已经订购功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openAppList = []; //保存产品下增值业务
	
	var _changeList = []; //3g订购4g流量包订单提交预校验时，保存修改缓存列表的修改数据，用于订单确认页面返回的反向操作
	
	var _labelList = []; //标签列表
	
	var checkedReserveNbr = "";//已经校验过的终端预约号
	
	var checkedReserveCode = "";//已经校验过的终端预约码
	
	var checkedOfferSpec = []; //已经校验过的终端预约号对应的促销包
	
	var _orderedOfferSpecIds = [];//已订购销售品规格
	
	var _servSpecIds = [];//已订购功能产品规格
	
	var _offerSpecs = [];
	
	var _servSpecs = [];
	
//	var _terminalGroups=[];//终端组
	var totalNums=0;//记录总共添加了多少个终端输入框
	//初始化附属销售页面
	var _init = function(){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 3;
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		//规则校验入参
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		},{
			boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		}];
		if(!rule.rule.ruleCheck(boInfos)){ //规则校验失败
			return;
		}
		var param = {
			offerSpecId : prodInfo.prodOfferId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		if(ec.util.isObj(prodInfo.prodOfferId)){
			if(!query.offer.queryMainOfferSpec(param)){ //查询主套餐规格构成，并且保存
				return;
			}
		}else{
			OrderInfo.offerSpec = {};
		}
		if(CONST.getAppDesc()==0){ //4g系统需要
			if(!prod.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
				return;	
			}
		}
		AttachOffer.queryAttachOffer();
		_orderedOfferSpecIds = [];//已订购销售品规格
		_offerSpecs = [];
		_servSpecIds = [];//已订购功能产品规格
		_servSpecs = [];
	}; 
	
	//可订购的附属查询 
	var _queryAttachOfferSpec = function(param) {
		var data= query.offer.queryAttachSpec(param);
			if (data) {
				$("#attach_"+param.prodId).html(data);
				_showMainRoleProd(param.prodId); //通过主套餐成员显示角字
				//根据已选功能产品查询带出的可选包
				var servSpecIds = [];
				if(AttachOffer.openServList!=null&&AttachOffer.openServList!=undefined){
					$.each(AttachOffer.openServList,function(){
						if(this.prodId == param.prodId){
							var servSpecList = this.servSpecList;
							if(servSpecList!=null&&servSpecList!=undefined){
								$.each(servSpecList,function(){
									if(this.servSpecId!=null&&this.servSpecId!=undefined){
//										var servSpecListinfo = {
//												servSpecId : this.servSpecId
//										};
//										servSpecIds.push(servSpecListinfo);
										servSpecIds.push(this.servSpecId);
									}
									});
								}
						}
					});					
				}
				if(servSpecIds.length>0){
					param.servSpecIds = servSpecIds;
					var queryData = query.offer.queryServSpecPost(param);
					if(queryData!=null&&queryData.resultCode==0){
						if(queryData.result.offerList!=null&&queryData.result.offerList!=undefined){
							$.each(queryData.result.offerList,function(){
								AttachOffer.addOpenList(param.prodId,this.offerSpecId); 
							});
						}					
					}	
				}
				AttachOffer.changeLabel(param.prodId,param.prodSpecId,""); //初始化第一个标签附属
				if(param.prodId==-1 && OrderInfo.actionFlag==14){ //合约计划特殊处理
					AttachOffer.addOpenList(param.prodId,mktRes.terminal.offerSpecId);
				}
			}
	};
	
	//显示增值业务内容
	var _showApp = function(prodId){
		var appList = CacheData.getOpenAppList(prodId);
		var content = CacheData.getAppContent(prodId,appList);
		$.confirm("增值业务设置： ",content[0].innerHTML,{ 
			yes:function(){	
				$.each(appList,function(){
					if($("#"+prodId+"_"+this.objId).attr("checked")=="checked"){
						this.dfQty = 1;
					}else{
						this.dfQty = 0;
					}
				});
			},
			no:function(){
			}
		});
	};
	
	//获取产品实例
	var getProdInst = function(prodId){
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(ec.util.isArray(offerRole.prodInsts)){
				for ( var j = 0; j < offerRole.prodInsts.length; j++) {  //遍历产品实例列表
					if(offerRole.prodInsts[j].prodInstId==prodId){
						return offerRole.prodInsts[j];
					}
				}
			}
		}
	};
	
	//主销售品角色分解个每个接入产品
	var _showMainRoleProd = function(prodId){
		var prodInst = getProdInst(prodId);
		var app = {
			prodId:prodId,
			appList:[]
		};
		AttachOffer.openAppList.push(app);
		for (var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.CONTENT){ //增值业务角色
				for ( var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(roleObj.objType== CONST.OBJ_TYPE.SERV){
						if(prodInst.objId==roleObj.parentProdId && prodInst.componentTypeCd.substring(0,1)==roleObj.componentTypeCd.substring(0,1)){	
							app.appList.push(roleObj);
							if(roleObj.servSpecId==undefined){
								roleObj.servSpecId = roleObj.objId;
							}
							if(roleObj.servSpecName==undefined){
								roleObj.servSpecName = roleObj.objName;
							}
						}
					}
				}
				if(app.appList.length>0){
					var $li = $('<li id="li_'+prodId+'_'+offerRole.offerRoleId+'"></li>');
					$li.append('<dd class="mustchoose" ></dd>');	
					$li.append('<span>'+offerRole.offerRoleName+'</span>');
					$li.append('<dd id="can_'+prodId+'_'+offerRole.offerRoleId+'" class="gou2" onclick="AttachOffer.showApp('+prodId+');"></dd>');
					$("#open_app_ul_"+prodId).append($li);
				}
			}else{ 
				if(offerRole.prodInsts==undefined){
					continue;
				}
				$.each(offerRole.prodInsts,function(){  //遍历产品实例列表
					if(this.prodInstId==prodId){
						for (var k = 0; k < offerRole.roleObjs.length; k++) {
							var roleObj = offerRole.roleObjs[k];
							if(roleObj.objType==CONST.OBJ_TYPE.SERV){
								var servSpecId = roleObj.objId;
								var $oldLi = $('#li_'+prodId+'_'+servSpecId);
								var spec = CacheData.getServSpec(prodId,servSpecId);//从已选择功能产品中找
								if(spec != undefined){
									if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14){
										if(roleObj.dfQty == 0 && spec.ifDault==1){//在基础功能中没有选中的默认删除状态 
											var $span=$oldLi.find("span");
											$span.addClass("del");
											spec.isdel = "Y";
										}
									}
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								var serv = CacheData.getServBySpecId(prodId,servSpecId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								if(roleObj.dfQty > 0){ //必选，或者默选
									var servSpec=jQuery.extend(true, {}, roleObj);
									CacheData.setServSpec(prodId,servSpec); //添加到已开通列表里
									spec = servSpec;
									if(ec.util.isArray(spec.prodSpecParams)){
										spec.ifParams = "Y";
									}
									$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
									var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
									if(roleObj.minQty==0){
										$li.append('<dd class="delete" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+spec.servSpecName+'\',\''+spec.ifParams+'\')"></dd>');
									}else{
										$li.append('<dd class="mustchoose"></dd>');
									}
									$li.append('<span>'+spec.servSpecName+'</span>');
									if (spec.ifParams=="Y"){
										if(CacheData.setServParam(prodId,spec)){ 
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}else {
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}
									}
									$li.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									$("#open_serv_ul_"+prodId).append($li);
									spec.isdel = "N";
									_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
								}
							}
						}
					}
				});
			}
		}
	};
	
	var _showMainMemberRoleProd=function(prodId){
		for (var i = 0; i < OrderInfo.viceOfferSpec.length; i++) {//多张副卡同时进行套餐变更
			var offerSpec=OrderInfo.viceOfferSpec[i];
			if(prodId==offerSpec.prodId){
				for (var j = 0; j < offerSpec.offerRoles.length; j++) {
					var offerRole = offerSpec.offerRoles[j];
					if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){//主卡
						for (var k = 0; k < offerRole.roleObjs.length; k++) {
							var roleObj = offerRole.roleObjs[k];
							if(roleObj.objType==CONST.OBJ_TYPE.SERV){
								var servSpecId = roleObj.objId;
								var $oldLi = $('#li_'+prodId+'_'+servSpecId);
								var spec = CacheData.getServSpec(prodId,servSpecId);//从已选择功能产品中找
								if(spec != undefined){
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								var serv = CacheData.getServBySpecId(prodId,servSpecId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(roleObj.minQty==1){
										$oldLi.append('<dd class="mustchoose"></dd>');
									}
									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									continue;
								}
								if(roleObj.dfQty > 0){ //必选，或者默选
									var servSpec=jQuery.extend(true, {}, roleObj);
									CacheData.setServSpec(prodId,servSpec); //添加到已开通列表里
									spec = servSpec;
									if(ec.util.isArray(spec.prodSpecParams)){
										spec.ifParams = "Y";
									}
									$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
									var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
									if(roleObj.minQty==0){
										$li.append('<dd class="delete" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+spec.servSpecName+'\',\''+spec.ifParams+'\')"></dd>');
									}else{
										$li.append('<dd class="mustchoose"></dd>');
									}
									$li.append('<span>'+spec.servSpecName+'</span>');
									if (spec.ifParams=="Y"){
										if(CacheData.setServParam(prodId,spec)){ 
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}else {
											$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
										}
									}
									$li.append('<dd id="jue_'+prodId+'_'+servSpecId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
									$("#open_serv_ul_"+prodId).append($li);
									spec.isdel = "N";
									_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
								}
							}
						}
					}
				}
			}
		}
	};
	
	//查询附属销售品规格
	var _searchAttachOfferSpec = function(prodId,offerSpecId,prodSpecId) {
		var param = {   
			prodId : prodId,
		    prodSpecId : prodSpecId,
		    offerSpecIds : [offerSpecId],
		    ifCommonUse : "" 
		};
//		if(OrderInfo.actionFlag == 2){ //套餐变更		
//			param.offerSpecIds=[OrderInfo.offerSpec.offerSpecId];
//		}
		if(OrderInfo.actionFlag == 2){ //套餐变更		
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(ec.util.isArray(this.prodInsts)){
					$.each(this.prodInsts,function(){
						if(this.prodInstId==prodId){
							param.acctNbr = this.accessNumber;
							param.offerRoleId = this.offerRoleId;
							param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);	
							return false;
						}
					});
				}
			});
		}else if(OrderInfo.actionFlag == 3){  //可选包
			var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
			param.acctNbr = prodInfo.accNbr;
			if(!ec.util.isObj(prodInfo.prodOfferId)){
				prodInfo.prodOfferId = "";
			}
			var offerRoleId = CacheData.getOfferMember(prodInfo.prodInstId).offerRoleId;
			if(offerRoleId==undefined){
				offerRoleId = "";
			}
			param.offerRoleId = offerRoleId;
			param.offerSpecIds.push(prodInfo.prodOfferId);
		}else if(OrderInfo.actionFlag == 21){ //副卡套餐变更		
			$.each(OrderInfo.viceOfferSpec,function(){
				var offerSpecId=this.offerSpecId;
				var accessNumber=this.accessnumber;
				if(this.prodId==prodId){
					$.each(this.offerRoles,function(){
						if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD || this.memberRoleCd=="1"){
							$.each(this.roleObjs,function(){
								if(this.objType==CONST.OBJ_TYPE.PROD){
									param.acctNbr = accessNumber;
									param.offerRoleId = this.offerRoleId;
									param.offerSpecIds.push(offerSpecId);	
									return false;
								}
							});
						}
					});
				}
			});
		}else if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
			var oldoffer = {};
			for(var j=0;j<OrderInfo.oldoffer.length;j++){
				oldoffer = OrderInfo.oldoffer[j];
				for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
					var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
					if(offerMember.objInstId==prodId){
						param.acctNbr = offerMember.accessNumber;
						$.each(OrderInfo.oldofferSpec,function(){
							if(this.accNbr==oldoffer.accNbr){
								param.offerSpecIds.push(this.offerSpec.offerSpecId);	
								$.each(this.offerSpec.offerRoles,function(){
									if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
										param.offerRoleId = this.offerRoleId;
										return false;
									}
								});
							}
						});
					}
				}
			}
		}else { //新装
			param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
			var prodInst = OrderInfo.getProdInst(prodId);
			if(prodInst){
				param.offerRoleId = prodInst.offerRoleId;
			}
		}
		var offerSepcName = $("#search_text_"+prodId).val();
		if(offerSepcName.replace(/\ /g,"")==""){
			$.alert("提示","请输入查询条件！");
			return;
		}
		param.offerSpecName = offerSepcName;
		//获取已订购附属销售品，送到后端进行遍历过滤
		var attachOffersOrdered = CacheData.getOfferList(prodId);
		$.each(attachOffersOrdered,function(){
			//summary和offerSpecName两个节点包含大量文字，且这里不需要该节点，故遍历去除，以减少报文大小
			if(this.summary != null){
				this.summary = "";
			}
			if(this.offerSpecName != null){
				this.offerSpecName = "";
			}
		});
		param.attachOfferOrderedList = attachOffersOrdered;
		var data = query.offer.searchAttachOfferSpec(param);
		if(data!=undefined){
			$("#attach_div_"+prodId).html(data).show();
		}
	};
	
	//点击搜索出来的附属销售品
	var _selectAttachOffer = function(prodId,offerSpecId){
		$("#attach_div_"+prodId).hide();
		_addAttOffer(prodId,offerSpecId);
	};
	
	//点击搜索出来的功能产品
	var _selectServ = function(prodId,servSpecId,specName,ifParams){
		$("#attach_div_"+prodId).hide();
		_openServSpec(prodId,servSpecId,specName,ifParams);
	};
	
	//点击搜索出来的附属销售品
	var _closeAttachSearch = function(prodId){
		$("#attach_div_"+prodId).hide();
	};
	
	//已订购的附属销售品查询
	var _queryAttachOffer = function() {
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var prodId = prodInfo.prodInstId;
		var param = {
		    prodId : prodId,
		    prodSpecId : prodInfo.productId,
		    offerSpecId : prodInfo.prodOfferId,
		    acctNbr : prodInfo.accNbr
		};
		if(ec.util.isObj(prodInfo.prodBigClass)){
			param.prodBigClass = prodInfo.prodBigClass;
		}
		var data = query.offer.queryAttachOfferHtml(param);
		SoOrder.initFillPage();
		$("#order_fill_content").html(data).show();
		var member = CacheData.getOfferMember(prodId);
		//如果objId，objType，objType不为空才可以查询默认必须
		if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
			param.queryType = "1,2";
			param.objId = member.objId;
			param.objType = member.objType;
			param.offerRoleId = member.offerRoleId;
			param.memberRoleCd = member.roleCd;
			//默认必须可选包
			var data = query.offer.queryDefMustOfferSpec(param);
			CacheData.parseOffer(data);
			//默认必须功能产品
			var data = query.offer.queryServSpec(param);
			CacheData.parseServ(data);
		}
		if(ec.util.isArray(OrderInfo.offerSpec.offerRoles)){ //主套餐下的成员判断
			var member = CacheData.getOfferMember(prodId);
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
					var offerRole = this;
					$.each(this.roleObjs,function(){
						if(this.objType==CONST.OBJ_TYPE.SERV){
							var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
							if(serv!=undefined){ //不在已经开跟已经选里面
								var $oldLi = $('#li_'+prodId+'_'+serv.servId);
								if(this.minQty==1){
									$oldLi.append('<dd class="mustchoose"></dd>');
								}
								$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
							}
						}
					});
					return false;
				}
			});
		}
		AttachOffer.changeLabel(prodId, prodInfo.productId,""); //初始化第一个标签附属
		order.dealer.initDealer();
	};
	
	//删除附属销售品规格
	var _delOfferSpec = function(prodId,offerSpecId,reflag){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			if(reflag!=undefined && reflag=="reload"){//暂存单二次加载
				$span.addClass("del");
				spec.isdel = "Y";
				delServSpec(prodId,spec); //取消订购销售品时
				order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
				$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
				spec.isTerminal = 0;
			}else{
				var content = CacheData.getOfferProdStr(prodId,spec,2);
				$.confirm("信息确认",content,{ 
					yes:function(){
						$span.addClass("del");
						spec.isdel = "Y";
						delServSpec(prodId,spec); //取消订购销售品时
						order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
						$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
						spec.isTerminal = 0;
					},
					no:function(){
						
					}
				});
			}
		}
	};
	
	//直接删除附属销售品规格，不提示删除
	var _delOfferSpec2 = function(prodId,offerSpecId,reflag){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			if(reflag!=undefined && reflag=="reload"){//暂存单二次加载
				$span.addClass("del");
				spec.isdel = "Y";
				_delServSpec(prodId,spec); //取消订购销售品时
				order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
				$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
				spec.isTerminal = 0;
			}else{
				$span.addClass("del");
				spec.isdel = "Y";
				_delServSpec(prodId,spec); //取消订购销售品时
				order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
				$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
				spec.isTerminal = 0;
			}
		}
	};
	
	//删除附属销售品实例
	var _delOffer = function(prodId,offerId,reflag){
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = CacheData.getOffer(prodId,offerId);
			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offerId	
				};
				if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){
					var flag = false;
					for(var j=0;j<OrderInfo.oldoffer.length;j++){
						var oldOffer = OrderInfo.oldoffer[j];
						for ( var i = 0; i < oldOffer.offerMemberInfos.length; i++) {
							var oldOfferMember = oldOffer.offerMemberInfos[i];
							if(oldOfferMember.objInstId==prodId){
								param.acctNbr = oldOfferMember.accessNumber;
								flag = true;
								break;
							}
						}
						if(flag){
							for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
								if(offer.accNbr == OrderInfo.oldprodInstInfos[i].accNbr){
									param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
								}
							}
						}
					}
				}else{
					param.acctNbr = OrderInfo.getAccessNumber(prodId);
				}
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				//遍历附属的构成要和主套餐的构成实例要一致（兼容融合套餐）
				var offerMemberInfos=[];
				$.each(data.offerMemberInfos,function(){
					var prodInstId=this.objInstId;
					var flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){
						if(this.objInstId==prodInstId){
							flag=true;
							return false;
						}
					});
					if(flag){
						offerMemberInfos.push(this);
					}
				});
				
				offer.offerMemberInfos = data.offerMemberInfos=offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			if(reflag!=undefined && reflag=="reload"){//暂存单二次加载
				offer.isdel = "Y";
				$span.addClass("del");
				delServByOffer(prodId,offer);
			}else{
				var content = "";
				if(offer.offerSpec!=undefined){
					content = CacheData.getOfferProdStr(prodId,offer,1);
				}else {
					content = '退订【'+$span.text()+'】可选包' ;
				}
				$.confirm("信息确认",content,{ 
					yes:function(){
						offer.isdel = "Y";
						$span.addClass("del");
						delServByOffer(prodId,offer);
					},
					no:function(){	
					}
				});
			}
		}
	};
	
	//关闭服务规格
	var _closeServSpec = function(prodId,servSpecId,specName,ifParams){
		var $span = $("#li_"+prodId+"_"+servSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.openServSpec(prodId,servSpecId,specName,ifParams);
		}else { //退订			
			//退订的时候就提示需要退订其为必选成员的已选可选包
			var toDelOfferSpecList = [];
			var flag = true;
			var mustOfferSpecList = [];
			if(ec.util.isArray(AttachOffer.openList)){
				for ( var j = 0; j < AttachOffer.openList.length; j++) {
					if(prodId == AttachOffer.openList[j].prodId){
						if(ec.util.isArray(AttachOffer.openList[j].specList)){
							$.each(AttachOffer.openList[j].specList,function(){
								var offerSpec = this;
								if(this.isdel!="Y"){									
									$.each(offerSpec.offerRoles,function(){
										if(this.minQty>0){
											$.each(this.roleObjs,function(){
												if(servSpecId == this.objId&&this.minQty>0){
													if(offerSpec.ifDault==0){//必选
														mustOfferSpecList.push(offerSpec);
														flag = false;
													}
													toDelOfferSpecList.push(offerSpec);
												}
											});
										}
									});
								}
							});
						}
					}
				}
			}
			if(flag){
				var respnose = "";
				if(servSpecId !="" && servSpecId !=null){
					$("li[isdel='N']").each(function(){
						if($(this).attr('offerSpecId') !=""){
							_orderedOfferSpecIds.push($(this).attr('offerSpecId'));
						}
					});
					
					if(AttachOffer.openList.length>0){
						for(var j=0;j<AttachOffer.openList[0].specList.length;j++){
							var openedServ = AttachOffer.openList[0].specList[j];
							if(openedServ.isdel ==undefined || "Y"!= openedServ.isdel){
								_orderedOfferSpecIds.push(openedServ.offerSpecId);
							}
						}
					}
					$("li[name='product']").each(function(){
						if($(this).attr('servSpecId') !=""){
							_servSpecIds.push($(this).attr('servSpecId'));
						}
					});
					
					if(AttachOffer.openServList.length>0){
						for(var n=0;n<AttachOffer.openServList[0].servSpecList.length;n++){
							var opendServ = AttachOffer.openServList[0].servSpecList[n];
							if(opendServ.isdel ==undefined || "Y"!= opendServ.isdel){
								_servSpecIds.push(opendServ.servSpecId);
							}
						}
					}
					respnose = AttachOffer.queryOfferAndServDependForCancel("",servSpecId);
				}	
			var contentAppend = "";
			if(respnose !="" &&  respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.servSpec !=null && respnose.data.result.servSpec !=""){
				$.each(respnose.data.result.servSpec,function(){
					if(AttachOffer.openServList.length>0){
						for(var n=0;n<AttachOffer.openServList[0].servSpecList.length;n++){
							var opendServ = AttachOffer.openServList[0].servSpecList[n];
							if(this.servSpecId == opendServ.servSpecId){
								contentAppend = contentAppend + this.servSpecName +"<br>"; 
							}
						}
					}
				});
			}
			if(respnose !="" &&  respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec !=null && respnose.data.result.offerSpec !=""){
				$.each(respnose.data.result.offerSpec,function(){
					if(AttachOffer.openList.length>0){
						for(var n=0;n<AttachOffer.openList[0].specList.length;n++){
							var opendServ = AttachOffer.openList[0].specList[n];
							if(this.offerSpecId == opendServ.offerSpecId){
								contentAppend = contentAppend +this.offerSpecName+"<br>";  
							}
						}
					}
				});
			}
			var content= $span.text();
			if(contentAppend !=""){
				content = "【"+content  +"】功能产品，"+"与以下销售品或功能产品相依赖，系统会自动退订相关的依赖销售品。<br>"+contentAppend;
			}
				
			$.confirm("信息确认","取消开通"+content,{ 
				yesdo:function(){
					if(toDelOfferSpecList.length>0){
						var strInfo = "【"+$span.text()+"】功能产品为以下可选包的必选成员，取消开通将取消订购以下可选包，请确认是否取消订购？<br>";
						$.each(toDelOfferSpecList,function(){
							strInfo += "【"+this.offerSpecName+"】<br>";
						});
						$.confirm("信息确认",strInfo,{ 
							yesdo:function(){
								$.each(toDelOfferSpecList,function(){
									_delOfferSpec2(prodId,this.offerSpecId);
								});
								if(respnose !="" && respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec!=undefined ){
									_addOfferAndServDependOpen(respnose.data.result.servSpec,respnose.data.result.offerSpec,servSpecId,prodId);
								}
								_closeServSpecCallBack(prodId,servSpecId,$span);
							},
							no:function(){
							}
						});
					}else{
						if(respnose !="" && respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec!=undefined ){
							_addOfferAndServDependOpen(respnose.data.result.servSpec,respnose.data.result.offerSpec,servSpecId,prodId);
						}
						_closeServSpecCallBack(prodId,servSpecId,$span);
					}
				},
				no:function(){
				}
			});
			}else{				
				var strInfo = "【"+$span.text()+"】功能产品为可选包:<br>";
				$.each(toDelOfferSpecList,function(){
					strInfo += "<b>【"+this.offerSpecName+"】</b><br>";
				});
				strInfo += "的必选成员，且可选包为默认必选，不可取消。所以【"+$span.text()+"】功能产品无法取消订购!<br>";
				$.alert("提示",strInfo);
				return;
			}
		}
	};
	
	var _closeServSpecCallBack = function(prodId,servSpecId,$span){
		var spec = CacheData.getServSpec(prodId,servSpecId);
		if(spec == undefined){ //没有在已开通附属销售列表中
			return;
		}
		$span.addClass("del");
		spec.isdel = "Y";
		_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
		
		var serv = CacheData.getServBySpecId(prodId,servSpecId);
		order.dealer.removeAttDealer(prodId+"_"+servSpecId); //删除协销人
		if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
			$span.addClass("del");
			serv.isdel = "Y";
			//_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
		}
	};
	
	//关闭服务实例
	var _closeServ = function(prodId,servId,reflag){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		if($span.attr("class")=="del"){  //已经关闭，取消关闭
			var thisServSpecId =  $("#li_"+prodId+"_"+serv.servId).attr("servSpecId");
			_removeOfferAndServ(thisServSpecId,prodId);
			_openServ(prodId,serv);
		}else if("13409244"==serv.servSpecId){//一卡双号虚号
			$.alert("提示","请通过“一卡双号退订”入口或者短信入口退订此功能");
		}else{ //关闭
			var uim = OrderInfo.getProdUim(prodId);
			if(serv.servSpecId=="280000020" && (OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23) && uim.cardTypeFlag=="1"){//补换卡补4G卡不能退订4G上网功能产品
				$.alert("提示","4G卡不能退订【4G（LTE）上网】功能产品");
				return;
			}
			var respnose = "";
			if($("#del_"+prodId+"_"+servId).attr("servSpecId") !="" && $("#del_"+prodId+"_"+servId).attr("servSpecId") !=null){
				$("li[isdel='N']").each(function(){
					if($(this).attr('offerSpecId') !=""){
						_orderedOfferSpecIds.push($(this).attr('offerSpecId'));
					}
				});
				
				if(AttachOffer.openList.length>0){
					for(var j=0;j<AttachOffer.openList[0].specList.length;j++){
						var openedServ = AttachOffer.openList[0].specList[j];
						if(openedServ.isdel ==undefined || "Y"!= openedServ.isdel){
							_orderedOfferSpecIds.push(openedServ.offerSpecId);
						}
					}
				}
				$("li[name='product']").each(function(){
					if($(this).attr('servSpecId') !=""){
						_servSpecIds.push($(this).attr('servSpecId'));
					}
				});
				
				if(AttachOffer.openServList.length>0){
					for(var n=0;n<AttachOffer.openServList[0].servSpecList.length;n++){
						var opendServ = AttachOffer.openServList[0].servSpecList[n];
						if(opendServ.isdel ==undefined || "Y"!= opendServ.isdel){
							_servSpecIds.push(opendServ.servSpecId);
						}
					}
				}
				respnose = AttachOffer.queryOfferAndServDependForCancel("",$("#del_"+prodId+"_"+servId).attr("servSpecId"));
			}
			if(reflag!=undefined && reflag=="reload"){//暂存单二次加载
				$span.addClass("del");
				serv.isdel = "Y";
				if(respnose !="" && respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec!=undefined ){
					_addOfferAndServDepend(respnose.data.result.servSpec,respnose.data.result.offerSpec,$("#del_"+prodId+"_"+servId).attr("servSpecId"),prodId);
				}
			}else{
				var contentAppend = "";
				if(respnose !="" &&  respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.servSpec !=null && respnose.data.result.servSpec !=""){
					$.each(respnose.data.result.servSpec,function(){
						if(AttachOffer.openedServList.length>0){
							for(var n=0;n<AttachOffer.openedServList[0].servList.length;n++){
								var opendServ = AttachOffer.openedServList[0].servList[n];
								if(this.servSpecId == opendServ.servSpecId){
									contentAppend = contentAppend + this.servSpecName +"<br>"; 
								}
							}
						}
					});
				}
				if(respnose !="" &&  respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.servSpec !=null && respnose.data.result.servSpec !=""){
					$.each(respnose.data.result.servSpec,function(){
						if(AttachOffer.openServList.length>0){
							for(var n=0;n<AttachOffer.openServList[0].servSpecList.length;n++){
								var opendServ = AttachOffer.openServList[0].servSpecList[n];
								if(this.servSpecId == opendServ.servSpecId){
									contentAppend = contentAppend + this.servSpecName +"<br>"; 
								}
							}
						}
					});
				}
				if(respnose !="" &&  respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec !=null && respnose.data.result.offerSpec !=""){
					$.each(respnose.data.result.offerSpec,function(){
						if(AttachOffer.openedList.length>0){
							for(var n=0;n<AttachOffer.openedList[0].offerList.length;n++){
								var opendServ = AttachOffer.openedList[0].offerList[n];
								if(this.offerSpecId == opendServ.offerSpecId){
									contentAppend = contentAppend +this.offerSpecName+"<br>";  
								}
							}
						}
					});
				}
				var content= $span.text();
				if(contentAppend !=""){
					content = "【"+content  +"】功能产品，"+"与以下销售品或功能产品相依赖，系统会自动退订相关的依赖销售品。<br>"+contentAppend;
				}
				$.confirm("信息确认","关闭"+content,{ 
					yesdo:function(){
						$span.addClass("del");
						serv.isdel = "Y";
						if(respnose !="" && respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec!=undefined ){
							_addOfferAndServDepend(respnose.data.result.servSpec,respnose.data.result.offerSpec,$("#del_"+prodId+"_"+servId).attr("servSpecId"),prodId);
						}
					},
					no:function(){						
					}
				});
			}
		}
	};
	
	var _removeOfferAndServ = function(thisServSpecId,prodId){
		//update by huangjj3  61419 取消关闭，把依赖的销售品从开通的去除
		for(var i=0;i<_servSpecs.length;i++){
			var servSpecs = _servSpecs[i];
			if(thisServSpecId == servSpecs.servSpecId){
				for(var j=0;j<servSpecs.servSpe.length;j++){
					var servSpe = servSpecs.servSpe[j];
					if(AttachOffer.openedServList.length>0){
						for(var n=0;n<AttachOffer.openedServList[0].servList.length;n++){
								var opendServ = AttachOffer.openedServList[0].servList[n];
								if(servSpe.servSpecId == opendServ.servSpecId){
									opendServ.isdel = "N";
									$("#li"+prodId+"_"+opendServ.servId).find("span").removeClass("del");
									//AttachOffer.openedServList[0].servList.splice(n,1);//删除因为依赖加入的销售品
								}
						}
					}
					if(AttachOffer.openServList.length>0){
					   for(var n=0;n<AttachOffer.openServList[0].servSpecList.length;n++){
								var opendServ = AttachOffer.openServList[0].servSpecList[n];
								if(this.servSpecId == opendServ.servSpecId){
									opendServ.isdel = "Y";
							         	$("#li_"+prodId+"_"+openedServ.servId).find("span").addClass("del"); 
								}
					  }
					}
				}
			}
		}
		
		for(var i=0;i<_offerSpecs.length;i++){
			var servSpecs = _offerSpecs[i];
			if(thisServSpecId == servSpecs.servSpecId){
				for(var j=0;j<servSpecs.offerSpe.length;j++){
					var offerSpe = servSpecs.offerSpe[j];
					if(AttachOffer.openedList.length>0){
						for(var n=0;n<AttachOffer.openedList[0].offerList.length;n++){
							var opendServ = AttachOffer.openedList[0].offerList[n];
							if(offerSpe.offerId == opendServ.offerId){
								opendServ.isdel = "N";
								$("#li_"+prodId+"_"+opendServ.offerId).find("span").removeClass("del");
								//AttachOffer.openedList[0].offerList.splice(n,1);//删除因为依赖加入的销售品
							}
					}
					}
				}
			}
		}
		
		for(var i=0;i<_offerSpecs.length;i++){
			var servSpecs = _offerSpecs[i];
			if(thisServSpecId == servSpecs.servSpecId){
				_offerSpecs.slice(i, 1);
			}
		}
		
		for(var i=0;i<_servSpecs.length;i++){
			var servSpecs = _servSpecs[i];
			if(thisServSpecId == servSpecs.servSpecId){
				_servSpecs.slice(i, 1);
			}
		}
	};
	
	var _addOfferAndServDependOpen = function(reSrvSpec,reOfferSpec,OfferORServId,prodId){
		if(reSrvSpec !=""){
			var servSpec ={
					servSpecId:OfferORServId,
					servSpe:reSrvSpec,
					offerSpe:[]
			};
			_servSpecs.push(servSpec);
			
			$.each(reSrvSpec,function(){
					if(AttachOffer.openServList.length>0){
						for(var j=0;j<AttachOffer.openServList[0].servSpecList.length;j++){
							var openedServ = AttachOffer.openServList[0].servSpecList[j];
							if(this.servSpecId == openedServ.servSpecId){
								openedServ.isdel = "Y";
								$("#li_"+prodId+"_"+openedServ.servSpecId).find("span").addClass("del");
							}
						}
					}
			});
			
		}
		if(reOfferSpec !=""){
			var offerSpec ={
					servSpecId:OfferORServId,
					offerSpe:reOfferSpec,
					servSpe:[]
			};
			_offerSpecs.push(offerSpec);
			
			$.each(reOfferSpec,function(){
					if(AttachOffer.openList.length>0){
						for(var j=0;j<AttachOffer.openList[0].specList.length;j++){
							var openedServ = AttachOffer.openList[0].specList[j];
							if(this.offerSpecId  == openedServ.offerSpecId){
								openedServ.isdel = "Y";
								$("#li_"+prodId+"_"+openedServ.offerSpecId).find("span").addClass("del");
							}
						}
					}
			});
			
		}
	};
	
	var _addOfferAndServDependOpen = function(reSrvSpec,reOfferSpec,OfferORServId,prodId){
		if(reSrvSpec !=""){
			var servSpec ={
					servSpecId:OfferORServId,
					servSpe:reSrvSpec,
					offerSpe:[]
			};
			_servSpecs.push(servSpec);
			
			$.each(reSrvSpec,function(){
					if(AttachOffer.openServList.length>0){
						for(var j=0;j<AttachOffer.openServList[0].servSpecList.length;j++){
							var openedServ = AttachOffer.openServList[0].servSpecList[j];
							if(this.servSpecId == openedServ.servSpecId){
								openedServ.isdel = "Y";
								$("#li_"+prodId+"_"+openedServ.servSpecId).find("span").addClass("del");
							}
						}
					}
			});
			
		}
		if(reOfferSpec !=""){
			var offerSpec ={
					servSpecId:OfferORServId,
					offerSpe:reOfferSpec,
					servSpe:[]
			};
			_offerSpecs.push(offerSpec);
			
			$.each(reOfferSpec,function(){
					if(AttachOffer.openList.length>0){
						for(var j=0;j<AttachOffer.openList[0].specList.length;j++){
							var openedServ = AttachOffer.openList[0].specList[j];
							if(this.offerSpecId  == openedServ.offerSpecId){
								openedServ.isdel = "Y";
								$("#li_"+prodId+"_"+openedServ.offerSpecId).find("span").addClass("del");
							}
						}
					}
			});
			
		}
	};
	
	var _addOfferAndServDepend = function(reSrvSpec,reOfferSpec,OfferORServId,prodId){
		if(reSrvSpec !=""){
			var servSpec ={
					servSpecId:OfferORServId,
					servSpe:reSrvSpec,
					offerSpe:[]
			};
			_servSpecs.push(servSpec);
			
			$.each(reSrvSpec,function(){
					if(AttachOffer.openedServList.length>0){
						for(var j=0;j<AttachOffer.openedServList[0].servList.length;j++){
							var openedServ = AttachOffer.openedServList[0].servList[j];
							if(this.servSpecId == openedServ.servSpecId){
								openedServ.isdel = "Y";
								$("#li_"+prodId+"_"+openedServ.servId).find("span").addClass("del");
							}
						}
					}
					if(AttachOffer.openServList.length>0){
							for(var n=0;n<AttachOffer.openServList[0].servSpecList.length;n++){
								var opendServ = AttachOffer.openServList[0].servSpecList[n];
								if(this.servSpecId == opendServ.servSpecId){
									opendServ.isdel = "Y";
									$("#li_"+prodId+"_"+opendServ.servSpecId).find("span").addClass("del"); 
								}
							}
					}
			});
			
		}
		if(reOfferSpec !=""){
			var offerSpec ={
					servSpecId:OfferORServId,
					offerSpe:reOfferSpec,
					servSpe:[]
			};
			_offerSpecs.push(offerSpec);
			
			$.each(reOfferSpec,function(){
					if(AttachOffer.openedList.length>0){
						for(var j=0;j<AttachOffer.openedList[0].offerList.length;j++){
							var openedServ = AttachOffer.openedList[0].offerList[j];
							if(this.offerSpecId == openedServ.offerSpecId){
								openedServ.isdel = "Y";
								$("#li_"+prodId+"_"+openedServ.offerId).find("span").addClass("del");
							}
						}
					}
			});
			
		}
	};
	
	//开通功能产品
	var _openServSpec = function(prodId,servSpecId,specName,ifParams){
		$.confirm("信息确认","开通【"+specName+"】功能产品",{ 
			yesdo:function(){
				var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
				if(servSpec==undefined){   //在可订购功能产品里面 
					var newSpec = {
						objId : servSpecId, //调用公用方法使用
						servSpecId : servSpecId,
						servSpecName : specName,
						ifParams : ifParams,
						isdel : "C"   //加入到缓存列表没有做页面操作为C
					};
					var inPamam = {
						prodSpecId:servSpecId
					};
					if(ifParams == "Y"){
						var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
						if(data==undefined || data.result==undefined){
							return;
						}
						newSpec.prodSpecParams = data.result.prodSpecParams;
					if(servSpecId==CONST.YZFservSpecId){//翼支付助手根据付费类型改变默认值
						var feeType = $("select[name='pay_type_-1']").val();
						if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
						if(feeType == CONST.PAY_TYPE.AFTER_PAY){
							for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {
								var prodSpecParam = newSpec.prodSpecParams[j];
								prodSpecParam.setValue = "";
							}																			
						}else{
							for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {							
								var prodSpecParam = newSpec.prodSpecParams[j];
								if (prodSpecParam.value!="") {
									prodSpecParam.setValue = prodSpecParam.value;
								} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
									//默认值为空则取第一个
									prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
						}
					  }
					}
					}
					CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
					servSpec = newSpec;
				}
				_checkServExcludeDepend(prodId,servSpec);
			},
			no:function(){
			}
		});
	};
	
	//开通功能产品
	var _openServ = function(prodId,serv){
		$.confirm("信息确认","取消关闭【"+serv.servSpecName+"】功能产品",{ 
			yesdo:function(){
				if(serv!=undefined){   //在可订购功能产品里面 
					if(serv.servSpecId==""){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.removeClass("del");
						serv.isdel = "N";
					}else{
						_checkServExcludeDepend(prodId,serv);
					}
				}
			},
			no:function(){
			}
		});
	};
	
	//校验销售品的互斥依赖
	var _checkOfferExcludeDepend = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
//		if(param.orderedOfferSpecIds.length == 0 ){
////			AttachOffer.addOpenList(prodId,offerSpecId); 
//			paserOfferData("",prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
//		}else{
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
		}
//		}
		
		//获取销售品节点校验销售品下功能产品的互斥依赖
		/*var offerSpec = CacheData.getOfferSpec(offerSpecId);
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					var param = {
						prodId : prodId,
						servSpecId : this.objId,
						orderedServSpecIds : [] //功能产品互斥依赖查询入场数组
					};
					//已选销售品列表
					var offerSpecList = CacheData.getSpecList(prodId);
					if(ec.util.isArray(offerSpecList)){
						$.each(offerSpecList,function(){
							if(this.offerSpecId!=offerSpecId && this.isdel!="Y" && this.isdel!="C"){
								param.orderedOfferSpecIds.push(this.offerSpecId);
							}
						});
					}
					if(param.orderedServSpecIds.length == 0 ){
						AttachOffer.addOpenList(prodId,offerSpecId); 
					}else{
						datas.push(query.offer.queryServExcludeDepend(param));//查询规则校验
					}
				});
			});
		}*/
		//paserData(datas,prodId,offerSpecId,offer.offerSpecName,"OFFER"); //解析数据
		
		/*if(param.orderedOfferSpecIds.length == 0 ){
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserData(data.result,prodId,offerSpecId,offer.offerSpecName,"OFFER"); //解析数据
			}
		}*/
	};
	
	//校验服务的互斥依赖
	var _checkServExcludeDepend = function(prodId,serv,flag){
		var servSpecId = serv.servSpecId;
		var param = CacheData.getExcDepServParam(prodId,servSpecId);
		if(param.orderedServSpecIds.length == 0){
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			var data = query.offer.queryExcludeDepend(param);  //查询规则校验
			if(data!=undefined){
				paserServData(data.result,prodId,serv);//解析数据
			}
		}
	};
	
	//订购附属销售品
	var _addOfferSpec = function(prodId,offerSpecId){
		
		var newSpec = _setSpec(prodId,offerSpecId);
		
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		$.confirm("信息确认",content,{ 
			yes:function(){
				CacheData.setServ2OfferSpec(prodId,newSpec);
			},
			yesdo:function(){
				_checkOfferExcludeDepend(prodId,newSpec);
			},
			no:function(){
			}
		});
	};
	
	//根据预校验返回订购附属销售品
	var _addOfferSpecByCheck = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		$.confirm("信息确认",content,{ 
			yes:function(){
				CacheData.setServ2OfferSpec(prodId,newSpec);
			},
			yesdo:function(){
				_checkOfferExcludeDepend(prodId,newSpec);
			}
		});
	};
	
	//删除附属销售品带出删除功能产品
	var delServSpec = function(prodId,offerSpec){
		$.each(offerSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				var servSpecId = this.objId;
				if($("#check_"+prodId+"_"+servSpecId).attr("checked")=="checked"){
					var spec = CacheData.getServSpec(prodId,servSpecId);
					if(ec.util.isObj(spec)){
						spec.isdel = "Y";
						var $li = $("#li_"+prodId+"_"+servSpecId);
						$li.removeClass("canshu").addClass("canshu2");
						$li.find("span").addClass("del"); //定位删除的附属
						_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
					}
				}
			});
		});
	};
	
	//删除附属销售品带出删除功能产品
	var delServByOffer = function(prodId,offer){	
		$.each(offer.offerMemberInfos,function(){
			var servId = this.objInstId;
			if($("#check_"+prodId+"_"+servId).attr("checked")=="checked"){
				var serv = CacheData.getServ(prodId,servId);
				if(ec.util.isObj(serv)){
					serv.isdel = "Y";
					var $li = $("#li_"+prodId+"_"+servId);
					$li.removeClass("canshu").addClass("canshu2");
					$li.find("span").addClass("del"); //定位删除的附属
				}
			}
		});
	};
	
	//取消退订附属销售品
	var _addOffer = function(prodId,offerId){
		var specName = $("#li_"+prodId+"_"+offerId).find("span").text();
		$.confirm("信息确认","取消退订【"+specName+"】可选包",{ 
			yesdo:function(){
				var offer = CacheData.getOffer(prodId,offerId); //在已经开通列表中查找
				if(offer!=undefined){   //在可订购功能产品里面 
					if(offer.offerSpecId==""){
						var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
						$span.removeClass("del");
						offer.isdel = "N";
					}else{
						_checkOfferExcludeDepend(prodId,offer);
					}
				}
			},
			no:function(){
			}
		});
	};
	
	//确认订购附属销售品
	var _addAttOffer = function(prodId,offerSpecId,specName){
		_addOfferSpec(prodId,offerSpecId);
	};
	
	//解析互斥依赖返回结果
	var paserOfferData = function(result,prodId,offerSpecId,specName){
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
				excludeOffer : [],   //互斥依赖显示列表
				defaultOffer : [], //默选的显示列表
				dependOffer : {  //存放互斥依赖列表
					dependOffers : [],
					offerGrpInfos : []
				}
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			//解析可选包互斥依赖组
			if(ec.util.isArray(exclude)){
				for (var i = 0; i < exclude.length; i++) {
					var offerList = CacheData.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
						param.excludeOffer.push(exclude[i].offerSpecId);
					}
				}
			}
			if(depend!=undefined && ec.util.isArray(depend.offerInfos)){
				for (var i = 0; i < depend.offerInfos.length; i++) {	
					content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
				}	
			}
			if(depend!=undefined && ec.util.isArray(depend.offerGrpInfos)){
				for (var i = 0; i < depend.offerGrpInfos.length; i++) {
					var offerGrpInfo = depend.offerGrpInfos[i];
					param.dependOffer.offerGrpInfos.push(offerGrpInfo);
					content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
					if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
						for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
							var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
							var offerSpec=CacheData.getOfferSpec(prodId,subOfferSpec.offerSpecId);
							if(ec.util.isObj(offerSpec)){
								if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
								}
							}
						}
					}
				}
			}
			//解析可选包默选组
			if(ec.util.isArray(defaultOffer)){
				for (var i = 0; i < defaultOffer.length; i++) {	
					content += "需要开通： " + defaultOffer[i].offerSpecName + "<br>";
					param.defaultOffer.push(defaultOffer[i].offerSpecId);
				}	
			}
		}
		var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		content=content+serContent;
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{	
			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
			$.confirm("订购： " + specName,content,{ 
				yes:function(){
					CacheData.setOffer2ExcludeOfferSpec(prodId,param);
				},
				yesdo:function(){
					excludeAddattch(prodId,offerSpecId,param);
					excludeAddServ(prodId,"",paramObj);
				},
				no:function(){
					
				}
			});
		}
	};
	
	/*//解析互斥依赖返回结果
	var paserData = function(datas,prodId,offerSpecId,specName,objType){
		var exclude = result.offerSpec.exclude;
		var depend = result.offerSpec.depend;
		var servExclude = result.servSpec.exclude;
		var servDepend = result.servSpec.depend;

		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeOffer : [],   //互斥依赖显示列表
			dependOffer : {  //存放互斥依赖列表
				dependOffers : [],
				offerGrpInfos : []
			},
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [] //存放互斥依赖列表
		};
		
		//解析可选包互斥依赖组
		if(exclude!=undefined && exclude.length>0){
			for (var i = 0; i < exclude.length; i++) {
				var offerList = AttachOffer.getOfferList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(offerList!=undefined){
					for ( var j = 0; j < offerList.length; j++) {
						if(offerList[j].isdel=="Y"){
							if(offerList[j].offerSpecId == exclude[i].offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + exclude[i].offerSpecName + "<br>";
					param.excludeOffer.push(exclude[i].offerSpecId);
				}
			}
		}
		if(depend!=undefined && depend.offerInfos!=undefined && depend.offerInfos.length>0){
			for (var i = 0; i < depend.offerInfos.length; i++) {	
				content += "需要开通： " + depend.offerInfos[i].offerSpecName + "<br>";
				param.dependOffer.dependOffers.push(depend.offerInfos[i].offerSpecId);
			}	
		}
		if(depend!=undefined && depend.offerGrpInfos!=undefined && depend.offerGrpInfos.length>0){
			for (var i = 0; i < depend.offerGrpInfos.length; i++) {
				var offerGrpInfo = depend.offerGrpInfos[i];
				param.dependOffer.offerGrpInfos.push(offerGrpInfo);
				content += "需要开通： 开通" + offerGrpInfo.minQty+ "-" + offerGrpInfo.maxQty+ "个以下业务:<br>";
				if(offerGrpInfo.subOfferSpecInfos!="undefined" && offerGrpInfo.subOfferSpecInfos.length>0){
					for (var j = 0; j < offerGrpInfo.subOfferSpecInfos.length; j++) {
						var subOfferSpec = offerGrpInfo.subOfferSpecInfos[j];
						content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
					}
				}
			}
		}
		
		//解析功能产品互斥依赖组
		if(servExclude!=undefined && servExclude.length>0){
			$.each(servExclude,function(){
				if(this.offerSpecId == undefined || this.offerSpecId == ""){ //纯功能产品互斥
					var servList = AttachOffer.getServList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(servList!=undefined){
						for ( var i = 0; i < servList.length; i++) {
							if(servList[i].isdel=="Y"){
								if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + this.servSpecName + "<br>";
						param.excludeServ.push(this);
					}
				}else {  //可选包下功能产品互斥
					var offerList = AttachOffer.getOfferList(prodId); //互斥要去除已订购手动删除
					var flag = true;
					if(offerList!=undefined){
						for ( var j = 0; j < offerList.length; j++) {
							if(offerList[j].isdel=="Y"){
								if(offerList[j].offerSpecId == this.offerSpecId){  //返回互斥数组在已订购中删除，不需要判断
									flag = false;
									break;
								}
							}
						}
					}
					if(flag){
						content += "需要关闭：   " + this.offerSpecName + "<br>";
						param.excludeOffer.push(this.offerSpecId);
					}
				}
			});
		}
		if(servDepend!=undefined && servDepend.length>0){
			$.each(servDepend,function(){
				if(this.offerSpecId == undefined || this.offerSpecId == ""){ //纯功能产品依赖
					content += "需要开通：   " + this.servSpecName + "<br>";
					param.dependServ.push(this);
				}else {  //功能产品与可选包下功能产品依赖
					content += "需要开通：   " + this.offerSpecName + "<br>";
					param.dependOffer.dependOffers.push(this.offerSpecId);
				}
			});
		}
		
		if(content==""){ //没有互斥依赖
			if(objType == "OFFER"){
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}else {
				AttachOffer.addOpenServList(prodId,offerSpecId); 
			}
		}else{	
			$.confirm("开通： " + specName,content,{ 
				yesdo:function(){
					excludeAddattch(prodId,offerSpecId,param,objType);
				},
				no:function(){
					
				}
			});
		}
	};*/
	
	//解析服务互斥依赖
	var paserServData = function(result,prodId,serv){
		var servSpecId = serv.servSpecId;
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var servOfferList = result.servSpec.offerList; //带出的可选包
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [], //连带
			offerListServ : [] //带出的可选包
		};
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + this.servSpecName + "<br>";
					param.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.dependServ.push(this);
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				content += "需要开通：   " + this.servSpecName + "<br>";
				param.relatedServ.push(this);
			});
		}
		//解析带出的可选包，获取功能产品订购依赖互斥的接口返回的带出可选包拼接成字符串
		if(ec.util.isArray(servOfferList)){
			if(servOfferList.length>0){
				content += "需要订购：   <br>";
				$.each(servOfferList,function(){
					if(this.ifDault===0){
						content += '<input id="check_open_'+prodId+'_'+this.offerSpecId +'" type="checkbox" checked="checked" disabled="disabled">'+this.offerSpecName+'<br>'; 
					}else{
						content += '<input id="check_open_'+prodId+'_'+this.offerSpecId +'" type="checkbox" checked="checked">'+this.offerSpecName+'<br>'; 
					}
//					content += "需要订购：   " + this.offerSpecName + "<br>";
					param.offerListServ.push(this);
				});
			}
		}
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{
			if(OrderInfo.newOrderInfo.isReloadFlag=="N"){
				AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
				excludeAddServ(prodId,servSpecId,param);
			}else{
				$.confirm("开通： " + serv.servSpecName,content,{ 
					yes:function(){
						AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
						excludeAddServ(prodId,servSpecId,param);
					},
					no:function(){
					}
				});
			}

		}
	};
	
	//服务互斥依赖时带出添加跟删除
	var excludeAddServ = function(prodId,servSpecId,param){
		if(ec.util.isArray(param.excludeServ)){ //有互斥
			for (var i = 0; i < param.excludeServ.length; i++) { //删除已开通
				var excludeServSpecId = param.excludeServ[i].servSpecId;
				var spec = CacheData.getServSpec(prodId,excludeServSpecId);
				if(spec!=undefined){
					var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
				}else{
					var serv = CacheData.getServBySpecId(prodId,excludeServSpecId);
					if(serv!=undefined){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
		}
		if(ec.util.isArray(param.dependServ)){ // 依赖
			for (var i = 0; i < param.dependServ.length; i++) {
				var servSpec = param.dependServ[i];
				AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams); 
			}
		}
		if(ec.util.isArray(param.relatedServ)){ // 连带
			for (var i = 0; i < param.relatedServ.length; i++) {
				var servSpec = param.relatedServ[i];
				AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams); 
			}
		}
		if(ec.util.isArray(param.offerListServ)){//添加带出的可选包
			for (var i = 0; i < param.offerListServ.length; i++) {
				var servSpec = param.offerListServ[i];
				if($("#check_open_"+prodId+"_"+servSpec.offerSpecId).attr("checked")=="checked"){
					AttachOffer.addOpenList(prodId,servSpec.offerSpecId); 
				}
			}
		}
	};
	
	//互斥依赖时添加
	var excludeAddattch = function(prodId,specId,param){
		if(param.dependOffer.offerGrpInfos.length>0){  // 依赖组
			var dependOffer=param.dependOffer;
			for (var i = 0; i < dependOffer.offerGrpInfos.length; i++) {
				var offerGrpInfo = dependOffer.offerGrpInfos[i];
				var len  = offerGrpInfo.checkLen;
				if(len>=offerGrpInfo.minQty&&len<=offerGrpInfo.maxQty){
					$.each(offerGrpInfo.subOfferSpecInfos,function(){
						if(this.isCheck){
							AttachOffer.addOpenList(prodId,this.offerSpecId); 
						}
					});
				}else if(len<offerGrpInfo.minQty){
					$.alert("提示信息","依赖组至少选中"+offerGrpInfo.minQty+"个！");
					return;
				}else if(len>offerGrpInfo.maxQty){
					$.alert("提示信息","依赖组至多选中"+offerGrpInfo.maxQty+"个！");
					return;
				}else {
					$.alert("错误信息","依赖组选择出错！");
					return;
				}
			}
		}
		
		AttachOffer.addOpenList(prodId,specId); //添加开通附属
		if(param.excludeOffer.length>0){ //有互斥
			//删除已开通
			for (var i = 0; i < param.excludeOffer.length; i++) {
				var excludeSpecId = param.excludeOffer[i];
				var spec = CacheData.getOfferSpec(prodId,excludeSpecId);
				if(spec!=undefined){
					var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
					$span.addClass("del");
					spec.isdel = "Y";
					$("#terminalUl_"+prodId+"_"+excludeSpecId).remove();
				}
				var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
				if(offer!=undefined){
					var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
					$span.addClass("del");
					offer.isdel = "Y";
				}
			}
		}
		if(param.dependOffer.dependOffers.length>0){ // 依赖
			for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
				var offerSpecId = param.dependOffer.dependOffers[i];
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}
		}
		if(param.defaultOffer.length>0){ // 默选
			for (var i = 0; i < param.defaultOffer.length; i++) {
				var offerSpecId = param.defaultOffer[i];
				AttachOffer.addOpenList(prodId,offerSpecId); 
			}
		}
		/*if(objType == "OFFER"){
			AttachOffer.addOpenList(prodId,specId); //添加开通附属
			if(param.excludeOffer.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeOffer.length; i++) {
					var excludeSpecId = param.excludeOffer[i];
					var spec = AttachOffer.getSpec(prodId,excludeSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var offer = AttachOffer.getOfferBySpecId(prodId,excludeSpecId);
					if(offer!=undefined){
						var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
						$span.addClass("del");
						offer.isdel = "Y";
					}
				}
			}
			if(param.dependOffer.dependOffers.length>0){ // 依赖
				for (var i = 0; i < param.dependOffer.dependOffers.length; i++) {
					var offerSpecId = param.dependOffer.dependOffers[i];
					AttachOffer.addOpenList(prodId,offerSpecId); 
				}
			}
		}else{
			AttachOffer.addOpenServList(prodId,specId); //添加开通功能
			if(param.excludeServ!=undefined && param.excludeServ.length>0){ //有互斥
				//删除已开通
				for (var i = 0; i < param.excludeServ.length; i++) {
					var excludeServSpecId = param.excludeServ[i].servSpecId;
					var spec = CacheData.getServSpec(prodId,excludeServSpecId);
					if(spec!=undefined){
						var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
						$span.addClass("del");
						spec.isdel = "Y";
					}
					var serv = AttachOffer.getServ(prodId,excludeServSpecId);
					if(serv!=undefined){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("del");
						serv.isdel = "Y";
					}
				}
			}
			if(param.dependServ!=undefined&&param.dependServ.length>0){ // 依赖
				for (var i = 0; i < param.dependServ.length; i++) {
					var servSpecId = param.dependServ[i].servSpecId;	
					var newSpec = {
						objId : servSpecId, //调用公用方法使用
						servSpecId : servSpecId,
						servSpecName : param.dependServ[i].servSpecName,
						ifParams : param.dependServ[i].ifParams,
						isdel : "C"   //加入到缓存列表没有做页面操作为C
					};
					var inPamam = {
						prodSpecId:servSpecId
					};
					if("Y"  == newSpec.ifParams){
						var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
						if(data==undefined || data.result==undefined){
							return;
						}
						newSpec.prodSpecParams = data.result.prodSpecParams;
					}
					CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
					AttachOffer.addOpenServList(prodId,servSpecId); 
				}
			}
		}*/
	};
	
	//添加到开通列表
	var _addOpenList = function(prodId,offerSpecId){
		if(!_manyPhoneFilter(prodId,offerSpecId)){
			return;
		}
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(offer != undefined){ //在已开通中，需要取消退订
			if(offer.isdel!="Y"){
				var newSpec = _setSpec(prodId,offerSpecId);
				if(newSpec==undefined){ //没有在已开通附属销售列表中
					return;
				}
				if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
					offer.counts++;
					newSpec.counts=offer.counts;
					if(_ifOrderAgain(newSpec)){
						offer.counts--;
						return;
					}
					if(offer.counts<=2){
						var $li=$("#li_"+prodId+"_"+offer.offerId);
						$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.setParam('+prodId+','+offerSpecId+','+1+');"></dd>');
					}
				}
			}else{
				var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
				$span.removeClass("del");
				offer.isdel = "N";
			}
			return;
		}
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		if(newSpec.isdel=="C"){ //没有在已开通附属销售列表中，但是已经加载到缓存
			if(_ifOrderAgain(newSpec)){
				return;
			}
			var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			var $li = $('<li id="li_'+prodId+'_'+offerSpecId+'"></li>');
			if(newSpec.ifDault==0){ //必须
				$li.append('<dd class="mustchoose"></dd>');	
			}else {
				$li.append('<dd class="delete" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')"></dd>');	
			}
			$li.append('<span>'+newSpec.offerSpecName+'</span>');
			if(newSpec.ifParams){
				if(CacheData.setParam(prodId,newSpec)){ 
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}else {
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}
			}
			if(newSpec.ifShowTime=="Y"){
				$li.append('<dd class="time" id="time_'+prodId+'_'+offerSpecId+'" onclick="AttachOffer.showTime('+prodId+','+offerSpecId+',\''+newSpec.offerSpecName+'\');"></dd>');
			}
			if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
				$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" onclick="AttachOffer.setParam('+prodId+','+offerSpecId+');"></dd>');
			}
			$("#open_ul_"+prodId).append($li);
			newSpec.isdel = "N";
		}else if((newSpec.isdel=="Y")) { 
			var $span = $("#li_"+prodId+"_"+offerSpecId).find("span");
			$span.removeClass("del");
			newSpec.isdel = "N";
		}else if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
			newSpec.counts++;
			if(_ifOrderAgain(newSpec)){
				newSpec.counts--;
				return;
			}
//			if(newSpec.counts>=2){
//				var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
//				$spec.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.setParam('+prodId+','+offerSpecId+');"></dd>');
//			}
			
		}else {  //容错处理 //if((newSpec.isdel=="N")) 
			var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			var $li = $('<li id="li_'+prodId+'_'+offerSpecId+'"></li>');
			if(newSpec.ifDault==0){ //必须
				$li.append('<dd class="mustchoose"></dd>');	
			}else {
				$li.append('<dd class="delete" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')"></dd>');	
			}
			$li.append('<span>'+newSpec.offerSpecName+'</span>');
			if (newSpec.ifParams){
				if(CacheData.setParam(prodId,newSpec)){ 
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}else {
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"></dd>');
				}
			}
			if(newSpec.ifShowTime=="Y"){
				$li.append('<dd class="time" id="time_'+prodId+'_'+offerSpecId+'" onclick="AttachOffer.showTime('+prodId+','+offerSpecId+',\''+newSpec.offerSpecName+'\');"></dd>');
			}
			$("#open_ul_"+prodId).append($li);
		}
		
		//获取销售品节点校验销售品下功能产品的互斥依赖
		if(newSpec!=undefined){
			$.each(newSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.objType==4 && this.selQty!=2){
						var ifParams = "N";
						if(ec.util.isArray(this.prodSpecParams)){
							ifParams = "Y";
						}
						if(this.dfQty>0){//默认配置大于0就带出，添加到已选功能产品中
							_addOpenServList(prodId,this.objId,this.objName,ifParams);
						}
					}
				});
			});
		}
		if(ec.util.isArray(newSpec.agreementInfos)){ //合约销售品需要输入终端
			if(OrderInfo.actionFlag!=14){//非购机入口的
				totalNums=0;
//				OrderInfo.attach2Coupons.splice(0,OrderInfo.attach2Coupons.length);
//				OrderInfo.attach2Coupons=[];//清除串码组
				_removeAttach2Coupons(prodId,newSpec.offerSpecId);//清除串码组
//				AttachOffer.terminalGroups=[];//清除终端组缓存
//				$.each(newSpec.agreementInfos,function(){
//					AttachOffer.terminalGroups.push(this.terminalGroups);//兼容多个agreementInfos，一般不会有多个的。
//				});
				var objInstId = prodId+'_'+newSpec.offerSpecId;
				//一个终端对应一个ul
				var $ul = $('<ul id="terminalUl_'+objInstId+'" class="fillin show"></ul>');
				var $sel = $('<select id="terminalSel_'+objInstId+'"></select>');  
				var $li1 = $('<li class="full"><label style="width:auto; margin:0px 10px;"><span style="color:#71AB5A;font-size:16px">'+newSpec.offerSpecName+'</span></label></li>');
				
				var $li2 = $('<li style="display:none;"><label> 可选终端规格：</label></li>'); //隐藏
				$.each(newSpec.agreementInfos,function(){
					var $option = $('<option value="'+this.terminalModels+'" price="'+this.agreementPrice+'">'+this.terminalName+'</option>');
					$sel.append($option);
				});
				$li2.append($sel).append('<label class="f_red">*</label>');
				
				var minNum=newSpec.agreementInfos[0].minNum;
				var maxNum=newSpec.agreementInfos[0].maxNum;
				var $li3=$('<ul></ul>');
				var isFastOffer = 0 ;
				if(ec.util.isArray(newSpec.extAttrParams)){
					$.each(newSpec.extAttrParams,function(){
						if(this.attrId == CONST.OFFER_FAST_FILL){
							isFastOffer = 1;
							return false;
						}
					});
				}
				for(var i=0;i<newSpec.agreementInfos.length;i++){
					var agreementInfo=newSpec.agreementInfos[i];
//					for(var j=0;j<agreementInfo.terminalGroups.length;j++){
//						var terminalGroupId=agreementInfo.terminalGroups[j].terminalGroupId;//终端组
//						var terminalMinNum=agreementInfo.terminalGroups[j].terminalMinNum;
//						var terminalMaxNum=agreementInfo.terminalGroups[j].terminalMaxNum;
						var $ulGroups=$('<ul id="ul_'+objInstId+'" class="fillin show"></ul>');
						var $liGroups = $('<li class="full"><label> 终端：</label></li>');
						var $selTerms = $('<select style="display:none;" id="'+objInstId+'"></select>');
						var $selTermGroups = $('<select style="display:none;" id="group_'+objInstId+'"></select>');
						if(ec.util.isArray(agreementInfo.terminalGroups)){ //如果有配置终端组，则拼接终端组的规格ID和包含的终端规格ID
							for(var j=0;j<agreementInfo.terminalGroups.length;j++){
								var $optionTermGroups=$('<option value="'+agreementInfo.terminalGroups[j].terminalGroupId+'" terminalMaxNum="'+agreementInfo.terminalGroups[j].terminalMaxNum+'" terminalMinNum="'+agreementInfo.terminalGroups[j].terminalMinNum+'">'+agreementInfo.terminalGroups[j].terminalGroupId+'</option>');
								$selTermGroups.append($optionTermGroups);
								if(ec.util.isArray(agreementInfo.terminalGroups[j].terminalGroup)){
									$.each(agreementInfo.terminalGroups[j].terminalGroup,function(){
										var $optionTerms=$('<option value="'+this.terminalModels+'" price="'+this.terminalPrice+'">'+this.terminalName+'</option>');
										$selTerms.append($optionTerms);
									});
								}
							}
						}
						if(ec.util.isArray(agreementInfo.terminals)){ //如果是直接配置终端规格（旧数据），则拼接终端规格ID
							$.each(agreementInfo.terminals,function(){
								var $optionTerms=$('<option value="'+this.terminalModels+'" price="'+this.terminalPrice+'">'+this.terminalName+'</option>');
								$selTerms.append($optionTerms);
							});
						}
						
						$liGroups.append($selTerms).append($selTermGroups);
						if(maxNum>newSpec.agreementInfos[0].minNum){
							var $strAdd=$('<input id="terminalAddBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="0" onclick="AttachOffer.addAndDelTerminal(this)" value="添加" class="purchase" style="float:left"></input>');
							var $strDel=$('<input id="terminalDelBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="1" onclick="AttachOffer.addAndDelTerminal(this)" value="删除" class="purchase" style="float:left"></input>');
							$liGroups.append($strAdd).append($strDel);
						}
						$ulGroups.append($liGroups);
//						if(minNum<=0){
//							$li3.append($ulGroups);
//							break;
//						}
//						if(minNum<terminalMinNum){
//							terminalMinNum=minNum;
//						}
						 var minNumArray=new Array();
						for(var k=1;k<=minNum;k++){
							var id="terminalText_"+objInstId+'_'+k;
							minNumArray[k-1]=id;
							var $liTerminal=$('<li style="width:700px" name="terminalCodeCheckValidLi"><form name="terminalCodeCheckValidForm"><label>终端校验：</label><input id="terminalText_'+objInstId+'_'+k+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
									+'<input type="checkbox" id="if_p_reserveCode" onclick="AttachOffer.changereserveCode()"><label>使用预约码：</label><input type="text" class="inputWidth228px inputMargin0" id="reserveCode" value="" disabled="disabled" maxlength="20" placeholder="请输入预约码" style="width:160px;background-color: #E8E8E8;" />'
									+'<input id="terminalBtn_'+objInstId+'_'+k+'" name="terminalCodeCheckValidBtn" type="button" num="'+k+'" flag="'+isFastOffer+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="" value="校验" class="purchase" style="float:left"></input></form></li>');
							var	$li4 = $('<li id="terminalDesc_'+k+'" style="white-space:nowrap;width:700px;"><label></label><label id="terminalName_'+k+'"></label></li>');
							$ulGroups.append($liTerminal).append($li4);
						}
						$li3.append($ulGroups);
						totalNums+=minNum;
//					}
				}
				var $div = $("#terminalDiv_"+prodId);
				$ul.append($li1).append($li2).append($li3).appendTo($div);
				//
				var terminalCode="";
				if(OrderInfo.terminalCode!=null && OrderInfo.terminalCode!="" && OrderInfo.terminalCode!="null" && OrderInfo.reloadFlag!="N"){
					var	accessNum=OrderInfo.getAccessNumber(prodId);
					if(accessNum!="" && accessNum!=null && accessNum!= undefined){
						var terminalCodeArray=OrderInfo.terminalCode.split(",");
						for(var k=0;k<terminalCodeArray.length;k++){
							if(terminalCodeArray[k].indexOf(accessNum)!=-1){
								//取终端串码minNumArray
								terminalCode=terminalCodeArray[k].split("_")[1];
								//填值
								for(var z=0;z<minNumArray.length;z++){
									if(minNumArray[z].indexOf(prodId)!=-1){
										$("#"+minNumArray[z]).val(terminalCode);
			                             break;
									}
								}
							}
						}
					}
				}
			
				$div.show();
				$li3.find("li[name=terminalCodeCheckValidLi]").find("form[name=terminalCodeCheckValidForm]").each(function() {
					var terminalCodeCheckValidBtn =$(this).find("input[name=terminalCodeCheckValidBtn]");
					var terminalCodeCheckValidBtnId= terminalCodeCheckValidBtn.attr('id');
	                $(this).off('formIsValid').on('formIsValid',function(event,form){
	                	AttachOffer.checkTerminalCode(terminalCodeCheckValidBtn);
	                }).ketchup({bindElement:terminalCodeCheckValidBtnId});  
	            });  
//				$("#if_p_reserveCode").change(function(){
//					if($("#if_p_reserveCode").attr("checked")){
//						$("#reserveCode").css("background-color","white").attr("disabled", false) ;
//					}else{
//						$("#reserveCode").css("background-color","#E8E8E8").attr("disabled", true) ;
//					}
//				});	
				if(newSpec.agreementInfos[0].minNum>0){//合约里面至少要有一个终端
					newSpec.isTerminal = 1;
				}
			}else if(OrderInfo.actionFlag==14){
					var objInstId = prodId+'_'+newSpec.offerSpecId;
					var terminalUl=$("#terminalUl_"+objInstId);//如果有就不添加串码框了，防止重复
					if(terminalUl.length>0){
						return;
					}
					//一个终端对应一个ul
					var $ul = $('<ul id="terminalUl_'+objInstId+'" class="fillin show"></ul>');
					var $sel = $('<select id="terminalSel_'+objInstId+'"></select>');  
					var $li1 = $('<li class="full"><label style="width:auto; margin:0px 10px;"><span style="color:#71AB5A;font-size:16px">'+newSpec.offerSpecName+'</span></label></li>');
					var $li2 = $('<li style="display:none;"><label> 可选终端规格：</label></li>'); //隐藏
					$.each(newSpec.agreementInfos,function(){
						var $option = $('<option value="'+this.terminalModels+'" price="'+this.agreementPrice+'">'+this.terminalName+'</option>');
						$sel.append($option);
					});
					$li2.append($sel).append('<label class="f_red">*</label>');
					var $li3 = $('<li><label>终端校验：</label><input id="terminalText_'+objInstId+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
							+'<input id="terminalBtn_'+objInstId+'" type="button" onclick="AttachOffer.checkTerminalCode('+prodId+','+newSpec.offerSpecId+')" value="校验" class="purchase" style="float:left"></input></li>');	
					/*var $li4 = $('<li id="terRes_'+objInstId+'" class="full" style="display: none;" >'
							+'<label style="width:auto; margin:0px 10px;">终端名称：<span id="terName_'+objInstId+'" ></span></label>'
							+'<label style="width:auto; margin:0px 10px;">终端串码：<span id="terCode_'+objInstId+'" ></span></label>'
							+'<label style="width:auto; margin:0px 10px;">终端价格：<span id="terPrice_'+objInstId+'" ></span></label></li>');*/
					var $div = $("#terminalDiv_"+prodId);
					var $li4 = $('<li id="terminalDesc" style="display:none;white-space:nowrap;"><label> 终端规格：</label><label id="terminalName"></label></li>');
					$ul.append($li1).append($li2).append($li3).append($li4).appendTo($div);
					$div.show();
					newSpec.isTerminal = 1;
					
					for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
						var coupon = OrderInfo.attach2Coupons[i];
						if(prodId==coupon.prodId){
							$("#terminalSel_"+objInstId).val(coupon.couponId);
							$("#terminalSel_"+objInstId).attr("disabled",true);
							$("#terminalText_"+objInstId).val(coupon.couponInstanceNumber);
							$("#terminalText_"+objInstId).attr("disabled",true);
							$("#terminalBtn_"+objInstId).hide();
						}
					}
				}
			//}
		}
	};
	
	var _changereserveCode = function(){
		if($("#if_p_reserveCode").attr("checked")){
			$("#reserveCode").css("background-color","white").attr("disabled", false) ;
		}else{
			$("#reserveCode").css("background-color","#E8E8E8").attr("disabled", true) ;
		}
	}
	
	//终端校验
	var _checkTerminalCode = function(obj){
		var prodId=$(obj).attr("prodId");
		var offerSpecId=$(obj).attr("offerSpecId");
//		var terminalGroupId=$(obj).attr("terminalGroupId");
		var num=$(obj).attr("num");
		var flag=$(obj).attr("flag");
		if(flag==undefined){
			flag = 0 ;
		}
		OrderInfo.termReserveFlag ="";
		//清空旧终端信息
		_filterAttach2Coupons(prodId,offerSpecId,num);

		//清空旧终端信息
//		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
//			var attach2Coupon = OrderInfo.attach2Coupons[i];
//			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
//				OrderInfo.attach2Coupons.splice(i,1);
//				break;
//			}
//		}
		var objInstId = prodId+"_"+offerSpecId;
//		var resId = $("#terminalSel_"+objInstId+"_"+terminalGroupId).val();
		var resIdArray = [];
		var terminalGroupIdArray = [];
		$("#"+objInstId+"  option").each(function(){
			resIdArray.push($(this).val());
		});
		$("#group_"+objInstId+"  option").each(function(){
			terminalGroupIdArray.push($(this).val());
		});
		var resId = resIdArray.join("|"); //拼接可用的资源规格id
		var terminalGroupId = terminalGroupIdArray.join("|"); //拼接可用的资源终端组id
		if((resId==undefined || $.trim(resId)=="") && (terminalGroupId==undefined || $.trim(terminalGroupId)=="")){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+objInstId + "_"+num).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		if($("#if_p_reserveCode").attr("checked")){
			var reserveCode = $("#reserveCode").val();
			if(reserveCode ==""){
				$.alert("信息提示","请输入终端预约码！");
				return;
			}
		}else{
			$.each(checkedOfferSpec,function(){
				var offerSpec = this;
				var specList = CacheData.getOfferSpecList(prodId);
				$.each(specList,function(){
					if(offerSpec.offerSpecId == this.offerSpecId){
						var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
						this.isdel = "Y";
						_delServSpec(prodId,this); //取消订购销售品时
						order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
						$("#li_"+prodId+"_"+this.offerSpecId).remove();
					}
				});
			});
			checkedOfferSpec = [];
		}
		if(_checkData(objInstId,instCode)){
			return;
		}
		var newSpec = _setSpec(prodId,offerSpecId);
		var param = {
			instCode : instCode,
			flag : flag,
			mktResId : resId,
			offerSpecId: offerSpecId,
			offerSpecName:newSpec.offerSpecName,
			termGroup : terminalGroupId  //update by huangjj #13336需求资源要求这个参数不传
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		var activtyType ="";
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && ec.util.isArray(spec.agreementInfos)){  //订购的附属销售品
                    if(spec.agreementInfos[0].activtyType == 2){
                    	activtyType = "2";
				    }
				}
			}
		}
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE || (data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2")){
//			$("#terminalSel_"+objInstId).val(data.mktResId);
//			$("#terminalName").html(data.mktResName);
//			$("#terminalDesc").css("display","block");
//			var price = $("#terminalSel_"+objInstId).find("option:selected").attr("price");
			
			
			var mktPrice=0;//营销资源返回的单位是元
			var mktColor="";
			if(ec.util.isArray(data.mktAttrList)){
				$.each(data.mktAttrList,function(){
					if(this.attrId=="65010058"){
						mktPrice=this.attrValue;
					}else if(this.attrId=="60010004"){
						mktColor=this.attrValue;
					}
				});
			}
			$("#terminalName_"+num).html("终端规格："+data.mktResName+",终端颜色："+mktColor+",合约价格："+mktPrice+"元");
			$("#terminalDesc_"+num).css("display","block");
			
			/*$("#terRes_"+objInstId).show();
			$("#terName_"+objInstId).text(data.mktResName);
			$("#terCode_"+objInstId).text(data.instCode);	
			if(price!=undefined){
				$("#terPrice_"+objInstId).text(price/100 + "元");
			}*/
			var coupon = {
				couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : data.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : data.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : mktPrice, //物品价格,约定取值为营销资源的
				couponInstanceNumber : data.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId : prodId, //产品ID
				offerId : -1, //销售品实例ID
				attachSepcId : offerSpecId,
				state : "ADD", //动作
				relaSeq : "", //关联序列	
				num	: num, //第几个串码输入框
				attrList:data.mktAttrList //终端属性列表
			};
			if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2"){//“已销售未补贴”的终端串码可以办理话补合约
				coupon.couponSource ="2"; //串码话补标识
			}
			if(CONST.getAppDesc()==0){
				coupon.termTypeFlag=data.termTypeFlag;
			}
			if($("#if_p_reserveCode").attr("checked")){
				var custId = OrderInfo.cust.custId;
				var identityTypeCd  ="";
				var identityNum ="";
				if (custId == -1) {
					identityTypeCd = OrderInfo.boCustIdentities.identidiesTypeCd;
					identityNum =OrderInfo.boCustIdentities.identityNum;
				}
				var param = {
						reserveCode : reserveCode,
						couponId : data.mktResId,
						terminalPrice : mktPrice,
						custId : custId,
						identityTypeCd : identityTypeCd,
						identityNum : identityNum
				};
				var url = contextPath+"/mktRes/terminal/queryCouponReserveCodeCheck ";
				$.callServiceAsJson(url,param,{
					"before":function(){
//						$.ecOverlay("<strong>预约码校验中,请稍等...</strong>");
					},"always":function(){
//						$.unecOverlay();
					},
					"done" : function(response){
						if (response && response.code == -2) {
							$.each(checkedOfferSpec,function(){
								var offerSpec = this;
								var specList = CacheData.getOfferSpecList(prodId);
								$.each(specList,function(){
									if(offerSpec.offerSpecId == this.offerSpecId){
										var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
										this.isdel = "Y";
										_delServSpec(prodId,this); //取消订购销售品时
										order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
										$("#li_"+prodId+"_"+this.offerSpecId).remove();
									}
								});
							});
							checkedOfferSpec = [];
							$.alertM(response.data);
							return;
						} else if(response&&response.data&&response.data.code == 0) {
							if(response.data.buyFlag!=null && response.data.buyFlag=="Y"){
								var content = "您购买的终端和预约的终端不一致，请确认是否需要购买该终端？";
								$.confirm("信息确认",content,{ 
									yes:function(){
									},
									yesdo:function(){
										if(checkedReserveNbr!=response.data.couponInfo.reserveNbr){
											$.each(checkedOfferSpec,function(){
												var offerSpec = this;
												var specList = CacheData.getOfferSpecList(prodId);
												$.each(specList,function(){
													if(offerSpec.offerSpecId == this.offerSpecId){
														var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
														this.isdel = "Y";
														_delServSpec(prodId,this); //取消订购销售品时
														order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
														$("#li_"+prodId+"_"+this.offerSpecId).remove();
													}
												});
											});
										}
										checkedReserveNbr= response.data.couponInfo.reserveNbr;
										coupon.sourceId = checkedReserveNbr;
										OrderInfo.termReserveFlag = CONST.OL_TYPE_CD.ZDYY;
										OrderInfo.attach2Coupons.push(coupon);
										if(response.data.offerSpec.length>0){
											checkedOfferSpec = response.data.offerSpec;
											var content = '<form id="promotionForm"><table>';
											var selectStr = "";
											var optionStr = "";
											selectStr = selectStr+"<tr><td>可订购促销包: </td><td><select class='inputWidth183px' id="+checkedReserveNbr+"><br>"; 
											$.each(response.data.offerSpec,function(){
												var offerSpec = this;
												optionStr +='<option value="'+this.offerSpecId+'">'+this.offerSpecName+'</option>';
											});
											selectStr += optionStr + "</select></td></tr>"; 
											content +=selectStr;
											var offerSpecId;
											$.confirm("促销包选择",content,{ 
												yes:function(){	
													
												},
												no:function(){
													
												}
											});
											$('#promotionForm').bind('formIsValid', function(event, form) {
												offerSpecId = $('#'+checkedReserveNbr+' option:selected').val();
												$(".ZebraDialog").remove();
								                $(".ZebraDialogOverlay").remove();
								                AttachOffer.selectAttachOffer(prodId,offerSpecId);
											}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
											
										}
									},
									no:function(){
									}
								});
							}else{
								if(checkedReserveNbr!=response.data.couponInfo.reserveNbr){
									$.each(checkedOfferSpec,function(){
										var offerSpec = this;
										var specList = CacheData.getOfferSpecList(prodId);
										$.each(specList,function(){
											if(offerSpec.offerSpecId == this.offerSpecId){
												var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
												this.isdel = "Y";
												_delServSpec(prodId,this); //取消订购销售品时
												order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
												$("#li_"+prodId+"_"+this.offerSpecId).remove();
											}
										});
									});
								}
								checkedReserveNbr= response.data.couponInfo.reserveNbr;
								coupon.sourceId = checkedReserveNbr;
								OrderInfo.termReserveFlag = CONST.OL_TYPE_CD.ZDYY;
								OrderInfo.attach2Coupons.push(coupon);
								if(response.data.offerSpec.length>0){
									checkedOfferSpec = response.data.offerSpec;
									var content = '<form id="promotionForm"><table>';
									var selectStr = "";
									var optionStr = "";
									selectStr = selectStr+"<tr><td>可订购促销包: </td><td><select class='inputWidth183px' id="+checkedReserveNbr+"><br>"; 
									$.each(response.data.offerSpec,function(){
										var offerSpec = this;
										optionStr +='<option value="'+this.offerSpecId+'">'+this.offerSpecName+'</option>';
									});
									selectStr += optionStr + "</select></td></tr>"; 
									content +=selectStr;
									var offerSpecId;
									$.confirm("促销包选择",content,{ 
										yes:function(){	
											
										},
										no:function(){
											
										}
									});
									$('#promotionForm').bind('formIsValid', function(event, form) {
										offerSpecId = $('#'+checkedReserveNbr+' option:selected').val();
										$(".ZebraDialog").remove();
						                $(".ZebraDialogOverlay").remove();
						                AttachOffer.selectAttachOffer(prodId,offerSpecId);
									}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
									
								}else {
									$.alert("信息提示",data.message);
								}
							}
						}else if(response && response.data && response.data.message
								&& response.data.code == 1){
							$.each(checkedOfferSpec,function(){
								var offerSpec = this;
								var specList = CacheData.getOfferSpecList(prodId);
								$.each(specList,function(){
									if(offerSpec.offerSpecId == this.offerSpecId){
										var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
										this.isdel = "Y";
										_delServSpec(prodId,this); //取消订购销售品时
										order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
										$("#li_"+prodId+"_"+this.offerSpecId).remove();
									}
								});
							});
							checkedOfferSpec = [];
							$.alert("提示", response.data.message);
							return;
						}else{
							$.each(checkedOfferSpec,function(){
								var offerSpec = this;
								var specList = CacheData.getOfferSpecList(prodId);
								$.each(specList,function(){
									if(offerSpec.offerSpecId == this.offerSpecId){
										var $span = $("#li_"+prodId+"_"+this.offerSpecId).find("span"); //定位删除的附属
										this.isdel = "Y";
										_delServSpec(prodId,this); //取消订购销售品时
										order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
										$("#li_"+prodId+"_"+this.offerSpecId).remove();
									}
								});
							});
							checkedOfferSpec = [];
							$.alert("提示","<br/>终端预约码校验失败，请稍后重试！");
							return;
						}
					}
				});
			}else{
				$.alert("信息提示",data.message);
				OrderInfo.attach2Coupons.push(coupon);
			}
		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
			$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
		}else{
			$.alert("提示",data.message);
		}
	};
	
	//添加可选包到缓存列表
	var _setSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getOfferSpec(prodId,offerSpecId);  //没有在已选列表里面
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			newSpec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
			if(!newSpec){
				return;
			}
			CacheData.setOfferSpec(prodId,newSpec);
		}
		return newSpec;
	};
	
	//添加到开通列表
	var _addOpenServList = function(prodId,servSpecId,servSpecName,ifParams){
		//从已开通功能产品中找
		var serv = CacheData.getServBySpecId(prodId,servSpecId); 
		if(serv != undefined){
			$("#li_"+prodId+"_"+serv.servId).find("span").removeClass("del");
			serv.isdel = "N";
			return;
		}
		//从已选择功能产品中找
		var spec = CacheData.getServSpec(prodId,servSpecId);
//		if(OrderInfo.actionFlag==22){
//			spec = undefined;
//		}
		if(spec == undefined){
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : servSpecName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			spec = newSpec;
		} 
		if(spec.isdel == "C"){  //没有订购过
			$('#li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
			var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
			if(spec.ifDault==0){ //必须
				$li.append('<dd class="mustchoose"></dd>');	
			}else {
				$li.append('<dd class="delete" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+servSpecName+'\',\''+ifParams+'\')"></dd>');
			}
			$li.append('<span>'+spec.servSpecName+'</span>');
			if (spec.ifParams=="Y"){
				if(CacheData.setServParam(prodId,spec)){ 
					$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu2" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
				}else {
					$li.append('<dd id="can_'+prodId+'_'+servSpecId+'" class="canshu" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');"></dd>');
				}
			}
			$("#open_serv_ul_"+prodId).append($li);
		}else {
			$("#li_"+prodId+"_"+servSpecId).find("span").removeClass("del");
		}
		spec.isdel = "N";
		_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
	};
	
	//现在主销售品参数
	var _showMainParam = function(accessNumber){
		
		if(OrderInfo.actionFlag==6){
			if(!ec.util.isObj(accessNumber)){
				$.alert("提示","获取副卡号码失败，请刷新页面重试！");
				return;
			}
			var spec = {};
			if(ec.util.isArray(order.memberChange.viceparams)){
				for(var i = 0;i < order.memberChange.viceparams.length; i++){
					if(accessNumber==order.memberChange.viceparams[i].accessNumber){
						spec = order.memberChange.viceparams[i];
					}
				}
			}
			if(!ec.util.isObj(spec)){
				$.alert("提示","获取副卡新套餐参数失败，请刷新页面重试！");
				return;
			}
			var tempProdId = accessNumber;//用号码赋值prodID
			var content = CacheData.getParamContent(tempProdId,spec,0);
			$.confirm("参数设置： ",content,{ 
				yes:function(){	
				},
				no:function(){			
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form) {	
				//参数输入校验
				if(!paramInputCheck()){
					return;
				}	
				if(!!spec.offerSpecParams){
					for (var i = 0; i < spec.offerSpecParams.length; i++) {
						var itemSpec = spec.offerSpecParams[i];
						var newSpecParam = $.trim($("#"+tempProdId+"_"+itemSpec.itemSpecId).val());
						if(newSpecParam!=null){
							if(itemSpec.rule.isOptional=="N"&&newSpecParam=="") { //必填
								$.alert("提示","属性："+itemSpec.name+"  为必填属性，不能为空！");
								return;
							}
							itemSpec.setValue = newSpecParam;
							if (itemSpec.dateSourceTypeCd == "17") {//搜索框类型组件获取code属性中的值作为设置值
								itemSpec.setValue = $.trim($("#" + tempProdId + "_" + itemSpec.itemSpecId).attr("code"));
							}
							itemSpec.isSet = true;
						}else{
							itemSpec.isSet = false;
						}
					}
				}
				spec.isset ="Y"
				$("#mainOffer_"+accessNumber).removeClass("canshu").addClass("canshu2");
				$(".ZebraDialog").remove();
	            $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
		}
		else{
		var tempProdId = -1;//prodID赋值为-1
		var content = CacheData.getParamContent(tempProdId,OrderInfo.offerSpec,0);
		$.confirm("参数设置： ",content,{ 
			yes:function(){	
			},
			no:function(){			
			}
		});
		$('#paramForm').bind('formIsValid', function(event, form) {	
			//参数输入校验
			if(!paramInputCheck()){
				return;
			}
			var spec = OrderInfo.offerSpec;
			if(!!spec.offerSpecParams){
				for (var i = 0; i < spec.offerSpecParams.length; i++) {
					var itemSpec = spec.offerSpecParams[i];
					var newSpecParam = $.trim($("#"+tempProdId+"_"+itemSpec.itemSpecId).val());
					if(newSpecParam!=null){
						if(itemSpec.rule.isOptional=="N"&&newSpecParam=="") { //必填
							$.alert("提示","属性："+itemSpec.name+"  为必填属性，不能为空！");
							return;
						}
						itemSpec.setValue = newSpecParam;
						if (itemSpec.dateSourceTypeCd == "17") {//搜索框类型组件获取code属性中的值作为设置值
							itemSpec.setValue = $.trim($("#" + tempProdId + "_" + itemSpec.itemSpecId).attr("code"));
						}
						itemSpec.isSet = true;
					}else{
						itemSpec.isSet = false;
					}
				}
			}
			spec.isset ="Y"
			$("#mainOffer").removeClass("canshu").addClass("canshu2");
			$(".ZebraDialog").remove();
            $(".ZebraDialogOverlay").remove();
		}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
	  }
	};
	
	//显示参数
	var _showParam = function(prodId,offerSpecId,flag){	
		if(flag==1){ //显示已订购附属		
			var offer = CacheData.getOfferBySpecId(prodId,offerSpecId);
			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offer.offerId	
				};
				param.acctNbr = OrderInfo.getAccessNumber(prodId);
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				offer.offerMemberInfos = data.offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
			if(!offer.isGetParam){  //已订购附属没有参数，需要获取销售品参数
				var param = {   
				    offerTypeCd : "2",
				    offerId: offer.offerId,
				    offerSpecId : offer.offerSpecId
				};
				var offerParam = query.offer.queryOfferParam(param); //重新获取销售品参数
				if(offerParam==undefined){
					return;
				}else{
					offer.offerParamInfos = offerParam.offerParamInfos;
					offer.isGetParam = true;
				}
			}
			var content = CacheData.getParamContent(prodId,offer,flag);
			$.confirm("参数设置： ",content,{ 
				yes:function(){		
				},
				no:function(){
				}
			});
			order.protocolnbr.init();
			$('#paramForm').bind('formIsValid', function(event, form) {
				//参数输入校验
				if(!paramInputCheck()){
					return;
				}
				var isset = false;
				$.each(offer.offerSpec.offerSpecParams,function(){
					var itemInfo = CacheData.getOfferParam(prodId,offer.offerId,this.itemSpecId);
					if(itemInfo.itemSpecId == CONST.ITEM_SPEC.PROT_NUMBER){
						itemInfo.setValue = $("#select1").val();
					}else{
					    itemInfo.setValue = $("#"+prodId+"_"+this.itemSpecId).val();
					}
					if(itemInfo.value!=itemInfo.setValue){
						itemInfo.isUpdate = "Y";
						isset = true;
					}
				});
				if(isset){
					$("#can_"+prodId+"_"+offer.offerId).removeClass("canshu").addClass("canshu2");
					offer.isset = "Y";
					offer.update = "Y";
				}else{
					$("#can_"+prodId+"_"+offer.offerId).removeClass("canshu2").addClass("canshu");
					offer.isset = "N";
					offer.update = "N";
				}
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});		
		}else {
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			if(spec == undefined){  //未开通的附属销售品，需要获取销售品构成
				spec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
				if(!spec){
					return;
				}
			}
			var content = CacheData.getParamContent(prodId,spec,flag);	
			$.confirm("参数设置： ",content,{ 
				yes:function(){
				},
				no:function(){
				}
			});
			order.protocolnbr.init();
			$('#paramForm').bind('formIsValid', function(event, form){
				//参数输入校验
				if(!paramInputCheck()){
					return;
				}
				if(!!spec.offerSpecParams){
					for (var i = 0; i < spec.offerSpecParams.length; i++) {
						var param = spec.offerSpecParams[i];
						var itemSpec = CacheData.getSpecParam(prodId,offerSpecId,param.itemSpecId);
						if(itemSpec.itemSpecId == CONST.ITEM_SPEC.PROT_NUMBER){
							itemSpec.setValue = $("#select1").val();
						}else{
							itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
						}
					}
				}
				if(spec.offerRoles!=undefined && spec.offerRoles.length>0){
					for (var i = 0; i < spec.offerRoles.length; i++) {
						var offerRole = spec.offerRoles[i];
						for (var j = 0; j < offerRole.roleObjs.length; j++) {
							var roleObj = offerRole.roleObjs[j];
							if(!!roleObj.prodSpecParams){
								for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
									var prodParam = roleObj.prodSpecParams[k];
									var prodItem = CacheData.getProdSpecParam(prodId,offerSpecId,prodParam.itemSpecId);
									prodItem.value = $("#"+prodId+"_"+prodParam.itemSpecId).val();
								}
							}
						}
					}
				}
				$("#can_"+prodId+"_"+offerSpecId).removeClass("canshu").addClass("canshu2");
				var attchSpec = CacheData.getOfferSpec(prodId,offerSpecId);
				attchSpec.isset = "Y";
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});	
		}
	};
	
	//显示服务参数
	var _showServParam = function(prodId,servSpecId,flag){
		if(flag==1){ //显示已订购附属
			var serv = CacheData.getServBySpecId(prodId,servSpecId);
			var param = {
				prodId : serv.servId,
				ifServItem:"Y"
			};
			if(!serv.isGetParamSpec){  //已订购附属没有参数，需要获取销售品参数	
				param.prodSpecId = serv.servSpecId;
				var dataSepc = query.prod.prodSpecParamQuery(param); //重新获取销售品参数
				if(dataSepc==undefined){
					return;
				}else{
					serv.prodSpecParams = dataSepc.result.prodSpecParams;
					serv.isGetParamSpec = true;
				}
			}
			if(!serv.isGetParamInst){  //已订购附属没有参数，需要获取销售品参数
				var data = query.prod.prodInstParamQuery(param); //重新获取销售品参数
				if(data==undefined){
					return;
				}else{
					serv.prodInstParams = data.result.prodInstParams;
					serv.isGetParamInst = true;
				}
			}
			var content = CacheData.getParamContent(prodId,serv,3);
			
			if(OrderInfo.isGroupProSpecId(serv.servSpecId)){//群功能产品
				ec.form.dialog.createDialog({
					"id":"-group",
					"width":"370",
					"height":"440",
					"initCallBack":function(dialogForm,dialog){
						AttachOffer.dialogForm=dialogForm;
						AttachOffer.dialog=dialog;
						$("#div_group").empty();
						$("#div_group").append(content);
						$("#div_group_btn").empty();
						var str='<a href="javascript:void(0)" id="ok_btn" class="btn_h30"><span>确认</span></a>'
						+'<a href="javascript:void(0);" id="cancel_btn" class="btn_h30" style="margin-left:20px;"><span>取消</span></a>';
						$("#div_group_btn").append(str);
						//绑定确定按钮click事件
						$("#ok_btn").off("click").on("click",function(event){
							_groupInistOkBtn(prodId,servSpecId);
						});
						$("#cancel_btn").off("click").on("click",function(event){
							_closeDialog();
						});
					},
					"submitCallBack":function(dialogForm,dialog){
						
					},
					"closeCallBack":function(dialogForm,dialog){
					}
				});
				return;
			}
			
			$.confirm("参数设置： ",content,{ 
				yes:function(){	
					
				},
				no:function(){
					
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form) {
				var isset = false;
				$.each(serv.prodSpecParams,function(){
					var prodItem = CacheData.getServInstParam(prodId,serv.servId,this.itemSpecId);
					prodItem.setValue = $("#"+prodId+"_"+this.itemSpecId).val();	
					if(prodItem.value!=prodItem.setValue){
						prodItem.isUpdate = "Y";
						isset = true;
					}
				});
				if(isset){
					$("#can_"+prodId+"_"+serv.servId).removeClass("canshu").addClass("canshu2");
					serv.isset = "Y";
					serv.update = "Y";
				}else{
					$("#can_"+prodId+"_"+serv.servId).removeClass("canshu2").addClass("canshu");
					serv.isset = "N";
					serv.update = "N";
				}
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
		
		}else {
			var spec = CacheData.getServSpec(prodId,servSpecId);
			if(spec == undefined){  //未开通的附属销售品，需要获取销售品构成
				return;
			}
			var content = CacheData.getParamContent(prodId,spec,2);	
			
			if(OrderInfo.isGroupProSpecId(spec.servSpecId)){//群功能产品
				ec.form.dialog.createDialog({
					"id":"-group",
					"width":"370",
					"height":"440",
					"initCallBack":function(dialogForm,dialog){
						AttachOffer.dialogForm=dialogForm;
						AttachOffer.dialog=dialog;
						$("#div_group").empty();
						$("#div_group").append(content);
						$("#div_group_btn").empty();
						var str='<a href="javascript:void(0)" id="ok_btn" class="btn_h30"><span>确认</span></a>'
						+'<a href="javascript:void(0);" id="cancel_btn" class="btn_h30" style="margin-left:20px;"><span>取消</span></a>';
						$("#div_group_btn").append(str);
						//绑定确定按钮click事件
						$("#ok_btn").off("click").on("click",function(event){
							_groupOkBtn(prodId,servSpecId);
						});
						$("#cancel_btn").off("click").on("click",function(event){
							_closeDialog();
						});
					},
					"submitCallBack":function(dialogForm,dialog){
						
					},
					"closeCallBack":function(dialogForm,dialog){
					}
				});
				return;
			}
			
			$.confirm("参数设置： ",content,{ 
				yes:function(){
				},
				no:function(){	
				}
			});
			$('#paramForm').bind('formIsValid', function(event, form){
				if(!!spec.prodSpecParams){
					for (var i = 0; i < spec.prodSpecParams.length; i++) {
						var param = spec.prodSpecParams[i];
						var itemSpec = CacheData.getServSpecParam(prodId,servSpecId,param.itemSpecId);
						itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
					}
				}
				$("#can_"+prodId+"_"+servSpecId).removeClass("canshu").addClass("canshu2");
				var attchSpec = CacheData.getServSpec(prodId,servSpecId);
				attchSpec.isset = "Y";
				$(".ZebraDialog").remove();
                $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElementByClass:"ZebraDialog_Button1"});
		}
	};
	
	//已选群功能产品确定按钮
	var _groupOkBtn=function(prodId,servSpecId){
		var spec = CacheData.getServSpec(prodId,servSpecId);
		var flag=true;
		if(!!spec.prodSpecParams){
			for (var i = 0; i < spec.prodSpecParams.length; i++) {
				var param = spec.prodSpecParams[i];
				var itemSpec = CacheData.getServSpecParam(prodId,servSpecId,param.itemSpecId);
				itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
				if(!ec.util.isObj(itemSpec.setValue)){
					$.alert("信息提示",param.name+"不能为空");
					flag=false;
					break;
				}
			}
		}
		if(flag){
			$("#can_"+prodId+"_"+servSpecId).removeClass("canshu").addClass("canshu2");
			var attchSpec = CacheData.getServSpec(prodId,servSpecId);
			attchSpec.isset = "Y";
			easyDialog.close();
//			_closeDialog();
		}
	};
	
	//已订购群功能产品确定按钮
	var _groupInistOkBtn=function(prodId,servSpecId){
		var serv = CacheData.getServBySpecId(prodId,servSpecId);
		var isset = false;
		$.each(serv.prodSpecParams,function(){
			var prodItem = CacheData.getServInstParam(prodId,serv.servId,this.itemSpecId);
			prodItem.setValue = $("#"+prodId+"_"+this.itemSpecId).val();	
			if(prodItem.value!=prodItem.setValue){
				prodItem.isUpdate = "Y";
				isset = true;
			}
		});
			if(isset){
				$("#can_"+prodId+"_"+serv.servId).removeClass("canshu").addClass("canshu2");
				serv.isset = "Y";
				serv.update = "Y";
			}else{
				$("#can_"+prodId+"_"+serv.servId).removeClass("canshu2").addClass("canshu");
				serv.isset = "N";
				serv.update = "N";
			}
			_closeDialog();
	};
	
	var _closeDialog = function() {
		if(AttachOffer.dialogForm!=undefined&&AttachOffer.dialog!=undefined){
			AttachOffer.dialogForm.close(AttachOffer.dialog);
		}
	};
	
	//（销售品）参数输入校验（服务参数暂未使用）
	var paramInputCheck = function(){
		var pass = true;
		$("#paramForm").find("input[type=text]").each(function(){
			var mask = $(this).attr("mask");
			var maskmsg = $(this).attr("maskmsg");
			if(mask!=null && mask!="" && mask.substring(0,1)=="/" && mask.substring(mask.length-1,mask.length)=="/"){
				if(!eval(mask).test($(this).val())){
					$.alert("提示",maskmsg);
					pass = false;
					return false;
				}
			}
		});
		return pass;
	};
	
	//销售品生失效时间显示
	var _showTime = function(prodId,offerSpecId,offerSpecName){	
		var data = OrderInfo.getPrivilege("EFF_TIME");		
		$('#attachName').text(offerSpecName+"--生失效设置");
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		_initTime(spec);
		easyDialog.open({
			container : "div_time_dialog"
		});
		$("#timeSpan").off("click").on("click",function(){
			_setAttachTime(prodId,offerSpecId);
		});
		if(data==0){
			$("#startTimeTr").show();
			$("#endTimeTr").show();
		}else{
			$("#startTimeTr").hide();
			$("#endTimeTr").hide();
		}
	};
	
	//销售品生效时间显示
	var _showStartTime = function(){	
		var strDate =DateUtil.Format("yyyy年MM月dd日",new Date());
		var endDate = $("#endDt").val();
		if(endDate ==""){
			$.calendar({minDate:strDate});
		}else{
			$.calendar({minDate:strDate,maxDate:endDate});
		}
	};
	
	//销售品失效时间显示
	var _showEndTime = function(){	
		var strDate = $("#startDt").val();
		if(strDate==""){
			strDate =DateUtil.Format("yyyy年MM月dd日",new Date());
		}
		$.calendar({minDate:strDate});
	};
	
	//初始化时间设置页面
	var _initTime = function(spec){
		if(spec!=undefined && spec.ooTimes!=undefined){
			var ooTime = spec.ooTimes;
			$("input[name=startTimeType][value='"+ooTime.startType+"']").attr("checked","checked");
			$("input[name=endTimeType][value='"+ooTime.endType+"']").attr("checked","checked");
			$("#startDt").val("");
			$("#endDt").val("");
			$("#endTime").val("");
			if(ooTime.startType == 4){ //指定生效时间
				$("#startDt").val(ooTime.startDt);
			}
			if(ooTime.endType == 4){ //指定失效时间
				$("#endDt").val(ooTime.endDt);
			}else if(ooTime.endType == 5){  //有效时长
				$("#endTime").val(ooTime.effTime);
				$("#endTimeUnit").val(ooTime.effTimeUnitCd);
			}
		}else {
			$("input[name=startTimeType][value=1]").attr("checked","checked");
			$("input[name=endTimeType][value=1]").attr("checked","checked");
			$("#startDt").val("");
			$("#endDt").val("");
			$("#endTime").val("");
		}
	};
	
	//显示主套餐时间
	var _showOfferTime = function(){
		var data = OrderInfo.getPrivilege("EFF_TIME");		
		$('#attachName').text(OrderInfo.offerSpec.offerSpecName+"-生失效设置");
		_initTime(OrderInfo.offerSpec);
		easyDialog.open({
			container : "div_time_dialog"
		});
		$("#timeSpan").off("click").on("click",function(){
			_setMainTime();
		});
		if(data==0){
			$("#startTimeTr").show();
			$("#endTimeTr").show();
		}else{
			$("#startTimeTr").hide();
			$("#endTimeTr").hide();
		}
	};
	
	//显示主套餐构成
	var _showMainMember = function(){
		$('#memberName').text(OrderInfo.offerSpec.offerSpecName+"-构成");
		$("#main_member_div").empty();
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.memberRoleCd == CONST.MEMBER_ROLE_CD.CONTENT){
				var $ul = $('</div><ul id="serv_ul_'+prodId+'"></ul>');
				var $div = $('<div id="serv_div_'+prodId+'" class="fs_choosed"></div>');
				$("#main_member_div").append("<h4>"+this.offerRoleName+"</h4>").append($div.append($ul));
				$.each(offerRole.roleObjs,function(){
					var $li = $('<li id="li_'+prodId+'_'+this.objId+'">'+this.objName+'</li>');
					var $checkbox = $('<input type="checkbox" name="serv_check_'+prodId+'" servSpecId="'+this.objId+'"></input>');
					$ul.append($checkbox).append($li);
				});
				$("#main_member_div").append('<div class="clear"></div>');
			}else{
				$.each(offerRole.prodInsts,function(){
					var prodId = this.prodInstId;
					var $ul = $('</div><ul id="serv_ul_'+prodId+'"></ul>');
					var $div = $('<div id="serv_div_'+prodId+'" class="fs_choosed"></div>');
					$("#main_member_div").append("<h4>"+this.offerRoleName+"</h4>").append($div.append($ul));
					$.each(offerRole.roleObjs,function(){
						if(this.objType == CONST.OBJ_TYPE.SERV){
							var $li = $('<li id="li_'+prodId+'_'+this.objId+'">'+this.objName+'</li>');
							var $checkbox = $('<input type="checkbox" name="serv_check_'+prodId+'" servSpecId="'+this.objId+'"></input>');
							$ul.append($checkbox).append($li);		
						}
					});
					$("#main_member_div").append('<div class="clear"></div>');
				});
			}
		});
		easyDialog.open({
			container : "div_member_dialog"
		});
		
		$.each(OrderInfo.offerSpec.offerRoles,function(){  //自动勾选功能产品
			var offerRole = this;
			$.each(offerRole.prodInsts,function(){ //自动勾选接入产品已经选择的功能产品
				var prodInst = this;
				$.each(offerRole.roleObjs,function(){ //根据规格配置勾选默认的功能产品
					var servSpecId = this.objId;
					if(this.minQty>0){ //必选
						$("input[name='serv_check_"+prodInst.prodInstId+"']").each(function(){
							if(servSpecId==$(this).attr("servSpecId")){
								$(this).attr("checked","checked");
								$(this).attr("disabled","disabled");
							}
						});
					}
				});
				if(!!prodInst.servInsts){  
					$.each(prodInst.servInsts,function(){  //遍历产品实例下已经选择的功能产品
						var servSpecId = this.objId;
						$("input[name='serv_check_"+prodInst.prodInstId+"']").each(function(){
							if(servSpecId==$(this).attr("servSpecId")){
								$(this).attr("checked","checked");
							}
						});
					});
				}
			});
		});
		
		$("#memberSpan").off("click").on("click",function(){
			_setMainMember();
		});
	};
	
	//保存主销售品成员
	var _setMainMember = function(){
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			$.each(this.prodInsts,function(){
				var prodInst = this;
				prodInst.servInsts = [];
				$("input[name='serv_check_"+this.prodInstId+"']:checked").each(function(){
					var servSpecId = $(this).attr("servSpecId");
					$.each(offerRole.roleObjs,function(){
						if(this.objId==servSpecId){  //获取选择功能产品的构成
							prodInst.servInsts.push(this);	
						}
					});
				});
			});
		});
		easyDialog.close();
	};
	
	//获取ooTime节点
	var _getTime = function(){
		var ooTime = {
			state : "ADD" 
		};
		//封装生效时间
		var startRadio = $("input[name=startTimeType]:checked").attr("value");
		ooTime.startType = startRadio;
		if(startRadio==1){
			ooTime.isDefaultStart = "Y";
		}else if(startRadio==2){  //竣工生效，不传值
			
		}else if(startRadio==3){  //次月生效
			ooTime.startTime = 1;
			ooTime.startTimeUnitCd = 7;
			//ooTime.startDt = _getNextMonthFirstDate();
		}else if(startRadio==4){ //指定生效时间
			if($("#startDt").val()==""){
				$.alert("提示","指定生效时间不能为空!");
				return;
			}
			ooTime.startDt = $("#startDt").val();
		}
		//封装失效时间
		var endRadio = $("input[name=endTimeType]:checked").attr("value");	
		ooTime.endType = endRadio;
		if(endRadio==1){
			ooTime.isDefaultEnd = "Y";
		}else if(endRadio==4){
			if($("#endDt").val()==""){
				$.alert("提示","指定失效时间不能为空!");
				return;
			}
			ooTime.endDt = $("#endDt").val();
		}else if(endRadio==5){
			var end = $("#endTime").val();
			if(end==""){
				$.alert("提示","有效时长不能为空!");
				return;
			}
			if(isNaN(end)){
				$.alert("提示","有效时长必须为数字!");
				return;
			} 
			if(end<=0){
				$.alert("提示","有效时长必须大于0!");
				return;
			} 
			ooTime.effTime = end;
			ooTime.effTimeUnitCd = $("#endTimeUnit").val();
		}
		return ooTime;
	};
	
	//设置主销售品生失效时间设置
	var _setMainTime = function(){
		var ooTime = _getTime();
		if(ooTime==undefined){
			return;
		}
		OrderInfo.offerSpec.ooTimes = ooTime;
		$("#mainTime").removeClass("time").addClass("time2");
		easyDialog.close();
	};
	
	//设置附属销售品生失效时间设置
	var _setAttachTime = function(prodId,offerSpecId){
		var ooTime = _getTime();
		if(ooTime==undefined){
			return;
		}
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		spec.ooTimes = ooTime;
		$("#time_"+prodId+"_"+offerSpecId).removeClass("time").addClass("time2");
		easyDialog.close();
	};
	
	//获取下个月第一天
	/*var _getNextMonthFirstDate = function(){
		var d = new Date();
		var yyyy = 1900+d.getYear();    
		var MM = d.getMonth()+1;      
		var dd = "01";   
		if(MM==12){
			yyyy++;
			MM = "01";	
		}else if(MM<9){
			MM++;
			MM = "0"+MM;
		}else {
			MM++;
		}
		return yyyy+"-"+MM+"-"+dd; 
	};*/
	
	//切换标签
	var _changeLabel = function(prodId,prodSpecId,labelId){
		$.each(AttachOffer.labelList,function(){ //附属标签显示隐藏
			if(this.prodId==prodId){
				$.each(this.labels,function(){
					if(labelId==""){
						labelId = this.label;
						$("#tab_"+prodId+"_"+this.label).addClass("setcon");
					}else{
						if(labelId == this.label){
							$("#tab_"+prodId+"_"+this.label).addClass("setcon");
							$("#ul_"+prodId+"_"+this.label).show();
						}else{
							$("#tab_"+prodId+"_"+this.label).removeClass("setcon");
							$("#ul_"+prodId+"_"+this.label).hide();
						}
					}
				});
			}
		});
  $("#[id^=myfavorites_]").removeClass("setcon");
  $("#[id^=tab_myfavorites_]").hide();
//	  var id="div_label_"+prodId;
//	  $("#"+id+" ul").find("li").each(function () {
//	   $(this).removeClass("setcon");
//		});
//		$("#tab_"+prodId+"_"+labelId).addClass("setcon");
		var $ul = $("#ul_"+prodId+"_"+labelId); //创建ul
		if($ul[0]==undefined){ //没有加载过，重新加载  
			var queryType = "3";
			if(prodId>0){
				queryType = "";
			}
			if(labelId==CONST.LABEL.SERV){  //功能产品
				var param = {
					prodId : prodId,
					prodSpecId : prodSpecId,
					queryType : queryType,
					labelId : labelId
				};
				var data = query.offer.queryServSpec(param);
				var $ul = $('<ul id="ul_'+prodId+'_'+labelId+'"></ul>');
				if(data!=undefined && data.resultCode == "0"){
					if(ec.util.isArray(data.result.servSpec)){
						var servList = CacheData.getServList(prodId);//过滤已订购
						var servSpecList = CacheData.getServSpecList(prodId);//过滤已选择
						$.each(data.result.servSpec,function(){
							AttachOffer.allOfferList.push(this);
							var servSpecId = this.servSpecId;
							var flag = true;
							$.each(servList,function(){
								if(this.servSpecId==servSpecId&&this.isDel!="C"){
									flag = false;
									return false;
								}
							});
							$.each(servSpecList,function(){
								if(this.servSpecId==servSpecId){
									flag = false;
									return false;
								}
							});
							if(flag){
								var $li = $('<li id="li_'+prodId+'_'+this.servSpecId+'"></li>');
								var $dd = $('<dd class="canchoose" onclick="AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\')"></dd>');
								var $span = $('<span><a href="javascript:AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\')">'+this.servSpecName+'</a></span>');
								var $dd2 = $('<dd class="canshu2" onclick="AttachOffer.offerSpecDetail('+prodId+','+this.servSpecId+')"><img src="'+contextPath+'/image/common/more.png"/></dd>');
								$li.append($dd).append($span).append($dd2).appendTo($ul);
							}
						});
					}
				}
				$("#div_"+prodId).append($ul);
			}else{
				var param = {
					prodSpecId : prodSpecId,
					offerSpecIds : [],
					queryType : queryType,
					prodId : prodId,
					partyId : OrderInfo.cust.custId,
					labelId : labelId,
					ifCommonUse : ""			
				};
				if(OrderInfo.actionFlag == 2){ //套餐变更		
					param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
					var prodInst = OrderInfo.getProdInst(prodId);
					if(prodInst){
						param.offerRoleId = prodInst.offerRoleId;
					}
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
							$.each(OrderInfo.oldofferSpec,function(){
								if(this.accNbr==OrderInfo.oldprodInstInfos[i].accNbr){
									param.offerSpecIds.push(this.offerSpec.offerSpecId);	
									$.each(this.offerSpec.offerRoles,function(){
										if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
											param.offerRoleId = this.offerRoleId;
										}
									});
								}
							});
						}
					}
					$.each(OrderInfo.offerSpec.offerRoles,function(){
						if(ec.util.isArray(this.prodInsts)){
							$.each(this.prodInsts,function(){
								if(this.prodInstId==prodId){
									param.acctNbr = this.accessNumber;
									param.offerRoleId = this.offerRoleId;
									param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);	
									return false;
								}
							});
						}
					});
				}else if(OrderInfo.actionFlag == 3 || OrderInfo.actionFlag == 22){  //可选包
					var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
					param.acctNbr = prodInfo.accNbr;
					if(!ec.util.isObj(prodInfo.prodOfferId)){
						prodInfo.prodOfferId = "";
					}
					var offerRoleId = CacheData.getOfferMember(prodInfo.prodInstId).offerRoleId;
					if(offerRoleId==undefined){
						offerRoleId = "";
					}
					param.offerRoleId = offerRoleId;
					param.offerSpecIds.push(prodInfo.prodOfferId);
				}else if(OrderInfo.actionFlag == 21){ //副卡套餐变更		
					$.each(OrderInfo.viceOfferSpec,function(){
						var offerSpecId=this.offerSpecId;
						var accessNumber=this.accessnumber;
						if(this.prodId==prodId){
							$.each(this.offerRoles,function(){
								if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD || this.memberRoleCd=="1"){
									$.each(this.roleObjs,function(){
										if(this.objType==CONST.OBJ_TYPE.PROD){
											param.acctNbr = accessNumber;
											param.offerRoleId = this.offerRoleId;
											param.offerSpecIds.push(offerSpecId);	
											return false;
										}
									});
								}
							});
						}
					});
				}else if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){
					var oldoffer = {};
					for(var j=0;j<OrderInfo.oldoffer.length;j++){
						oldoffer = OrderInfo.oldoffer[j];
						for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
							var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
							if(offerMember.objInstId==prodId){
								param.acctNbr = offerMember.accessNumber;
								$.each(OrderInfo.oldofferSpec,function(){
									if(this.accNbr==oldoffer.accNbr){
										param.offerSpecIds.push(this.offerSpec.offerSpecId);	
										$.each(this.offerSpec.offerRoles,function(){
											if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
												param.offerRoleId = this.offerRoleId;
												return false;
											}
										});
									}
								});
							}
						}
					}
				}else { //新装
					param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
					var prodInst = OrderInfo.getProdInst(prodId);
					if(prodInst){
						param.offerRoleId = prodInst.offerRoleId;
					}
				}
				query.offer.queryCanBuyAttachSpec(param,function(data){
					var $ul = $('<ul id="ul_'+prodId+'_'+labelId+'"></ul>');
					if(data!=undefined && data.resultCode == "0"){
						if(ec.util.isArray(data.result.offerSpecList)){
							var offerList = CacheData.getOfferList(prodId); //过滤已订购
							var offerSpecList = CacheData.getOfferSpecList(prodId);//过滤已选择
							$.each(data.result.offerSpecList,function(){
								AttachOffer.allOfferList.push(this);
								var offerSpecId = this.offerSpecId;
								var flag = true;
								var ifOrderAgain=this.ifOrderAgain;//是否可以重复订购
								$.each(offerList,function(){
									if(this.offerSpecId==offerSpecId&&this.isDel!="C"&&ifOrderAgain!="Y"){
										flag = false;
										return false;
									}
								});
								$.each(offerSpecList,function(){
									if(this.offerSpecId==offerSpecId&&ifOrderAgain!="Y"){
										flag = false;
										return false;
									}
								});
								if(flag){
									var $li = $('<li id="li_'+prodId+'_'+this.offerSpecId+'"></li>');
									if(ec.util.isObj(ifOrderAgain)&&ifOrderAgain=="Y"){
										$li = $('<li id="li_'+prodId+'_'+this.offerSpecId+'_'+ifOrderAgain+'"></li>');
									}
									var $dd = $('<dd class="canchoose" onclick="AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')"></dd>');
									var $span = $('<span><a href="javascript:AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')" >'+this.offerSpecName+'</a></span>');
									var $dd2 = $('<dd class="canshu2" onclick="AttachOffer.offerSpecDetail('+prodId+','+this.offerSpecId+')"><img src="'+contextPath+'/image/common/more.png"/></dd>');
								//	var $dd3 = $('<dd class="canshu2" onclick="AttachOffer.addMyfavoriteSpec('+prodId+','+this.offerSpecId+')"><img src="'+contextPath+'/image/common/cang.png"/></dd>');
									var $dd3 = $("<dd class=\"canshu2\" onclick=\"AttachOffer.addMyfavoriteSpec("+prodId+","+this.offerSpecId+",'"+this.offerSpecName+"')\"><img src=\""+contextPath+"/image/common/cang.png\"/></dd>");
									$li.append($dd).append($span).append($dd2).append($dd3);
									$ul.append($li);
								}
							});
						}
					}
					$("#div_"+prodId).append($ul);
				});
			}
		}
	};
	//我的收藏
	var _initMyfavoriteSpec = function(prodId,prodSpecId){
		var id="div_label_"+prodId
		$("#"+id+" ul").find("li").each(function () {
			 $(this).removeClass("setcon");
		});
		
		$("#myfavorites_"+prodId).addClass("setcon");
		//$("#myfavorites_"+prodId).siblings().removeClass("setcon");
		
		var offerSpec = OrderInfo.offerSpec; //获取产品信息
        if(offerSpec.offerRoles != undefined  && offerSpec.offerRoles[0].prodInsts != undefined){
        	var prodInsts = offerSpec.offerRoles[0].prodInsts;
    		var param = {
    				prodSpecId : '',
    				offerSpecIds : [],
    				offerRoleId: '',
    				prodId : ''			
    		};
    		for ( var i = 0; i < prodInsts.length; i++) {
    			var prodInst = prodInsts[i];
    			if(prodInst.prodInstId == prodId){
    				param.prodSpecId = prodInst.objId;
    				param.offerRoleId = prodInst.offerRoleId;
    				param.prodId = prodInst.prodInstId;
    				param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
    			}else if(prodId == '-2'){
    				param.prodSpecId = prodSpecId;
    				param.offerRoleId = '';
    				param.prodId = prodId;
    				param.offerSpecIds = [];
    			}
    		}
        }else{
        	var param = {
    				prodSpecId : prodSpecId,
    				offerSpecIds : [],
    				offerRoleId: '',
    				prodId : prodId			
    		};
        }
		
		var data = query.offer.queryMyfavorite(param);
		//清空缓存中的收藏夹
		AttachOffer.myFavoriteList = [];
		var $ul = $('<ul id="tab_myfavorites_'+prodId+'"></ul>');
		if(data!=undefined && data.resultCode == "0"){
			if(ec.util.isArray(data.result.offerSpecList)){
				var offerList = CacheData.getOfferList(prodId); //过滤已订购
				var offerSpecList = CacheData.getOfferSpecList(prodId);//过滤已选择
				$.each(data.result.offerSpecList,function(){
					CacheData.setMyfavoriteSpec(prodId,this);//把我的收藏放在缓存里
					var offerSpecId = this.offerSpecId;
					var flag = true;
					var ifOrderAgain=this.ifOrderAgain;//是否可以重复订购
					$.each(offerList,function(){
						if(this.offerSpecId==offerSpecId&&this.isDel!="C"&&ifOrderAgain!="Y"){
							flag = false;
							return false;
						}
					});
					$.each(offerSpecList,function(){
						if(this.offerSpecId==offerSpecId&&ifOrderAgain!="Y"){
							flag = false;
							return false;
						}
					});
					if(flag){
						var $li = $('<li id="li_'+prodId+'_'+this.offerSpecId+'"></li>');
						if(ec.util.isObj(ifOrderAgain)&&ifOrderAgain=="Y"){
							$li = $('<li id="li_'+prodId+'_'+this.offerSpecId+'_'+ifOrderAgain+'"></li>');
						}
						var $dd = $('<dd class="canchoose" onclick="AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')"></dd>');
						var $span = $('<span><a href="javascript:AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')" >'+this.offerSpecName+'</a></span>');
						var $dd2 = $('<dd class="time2" onclick="AttachOffer.offerSpecDetail('+prodId+','+this.offerSpecId+')"><img src="'+contextPath+'/image/common/more.png"/></dd>');
						var $dd3 = $('<dd class="canshu2" onclick="AttachOffer.delMyfavoriteSpec('+prodId+','+prodSpecId+','+this.offerSpecId+',\''+this.offerSpecName+'\')"><img src="'+contextPath+'/image/common/deladd.png"/></dd>');
						if(this.ifReset=="N"){
							var $dd4 = $('<dd><img src="'+contextPath+'/image/common/no.png"/></dd>');
							$dd2.append($dd4);
						}
						$li.append($dd).append($span).append($dd2).append($dd3);
						$ul.append($li);
					}
				});
			}
		}
		$("#div_"+prodId).html($ul);
	};
	//添加可选包到缓存列表
	var _setMyfavoriteSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getFavoriteSpec(prodId,offerSpecId);  //没有在已收藏列表里面
		return newSpec;
	};
	//收藏销售品到我的收藏里
	var _addMyfavoriteSpec = function(prodId,offerSpecId,offerSpecName){
		//去重，和已收藏的销售品去重
		var newSpec = _setMyfavoriteSpec(prodId,offerSpecId);
		if(newSpec==undefined){
			var param = {   
					offerSpecId : offerSpecId
			};
			var content = '收藏【'+offerSpecName+'】' ;
			$.confirm("信息确认",content,{ 
				yes:function(){
				},
				yesdo:function(){
					query.offer.addMyfavorite(param);
					newSpec = query.offer.queryAttachOfferSpec(prodId,offerSpecId); //重新获取销售品构成
					CacheData.setMyfavoriteSpec(prodId,newSpec);
				},
				no:function(){
				}
			});
		}else{
			$.alert("提示","该销售品已收藏");
		}
	};
	
	var _delMyfavoriteSpec = function (prodId,prodSpecId,offerSpecId,offerSpecName){
		//去重，和已收藏的销售品去重
		//去重成功后，我的收藏重新加载，不调用服务，重缓存中去
		var param = {   
				offerSpecId : offerSpecId
		};
		var content = '取消收藏【'+offerSpecName+'】' ;
		$.confirm("信息确认",content,{ 
			yes:function(){
			},
			yesdo:function(){
				query.offer.delMyfavorite(param);
				_initMyfavoriteSpec(prodId,prodSpecId);
			},
			no:function(){
			}
		});
	};
	//开通跟取消开通功能产品时判断是否显示跟隐藏补换卡
	var _showHideUim = function(flag,prodId,servSpecId){
		if(CONST.getAppDesc()==0 && servSpecId == CONST.PROD_SPEC.PROD_FUN_4G){ //4G系统并且是开通或者关闭4g功能产品
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){//套餐变更
				prodClass = CacheData.getOfferMember(prodId).prodClass;
				if(prodClass==undefined && offerChange.oldMemberFlag){
					$.each(OrderInfo.oldoffer,function(){
						$.each(this.offerMemberInfos,function(){
							if(this.objInstId==prodId){
								prodClass = this.prodClass;
								return false;
							}
						});
					});
				}
			}else if(OrderInfo.actionFlag==6){
				for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
					if(prodId == OrderInfo.oldprodInstInfos[i].prodInstId){
						prodClass = OrderInfo.oldprodInstInfos[i].prodClass;
					}
				}
				$.each(OrderInfo.viceOfferSpec,function(){
					if(this.prodId==prodId){
						prodClass = CacheData.getOfferMember(prodId).prodClass;
					}
				});
			}
			
			if(flag==0){ //开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡需要补卡
					$("#title_"+prodId).show();
					$("#uimDiv_"+prodId).show();
					
					var actionFalg=OrderInfo.actionFlag;
					var instCode=OrderInfo.provinceInfo.mktResInstCode;
					var codeMsg=OrderInfo.provinceInfo.codeMsg;
					if(actionFalg=="3"  && order.uiCust.packageInfo.reloadFlag=="Y"){
						if(codeMsg!=null && codeMsg!=""){
							$.alert("提示",codeMsg);
						}else{
							if(instCode!=null && instCode!=""){
								$("#uim_txt_"+prodId).val(instCode);//将UIM卡信息放入
								$("#uim_check_btn_"+prodId).hide();
								$("#uim_release_btn_"+prodId).hide();
								$("#uim_txt_"+prodId).attr("disabled",true);
								
								var uimParam = {
									"instCode":instCode
								};
								
								var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
								
								if (response.code==0) {
									if(response.data.mktResBaseInfo){
										var statusCd=response.data.mktResBaseInfo.statusCd;
										if(statusCd=="1102"){
											var offerId="";
											if(OrderInfo.actionFlag==6){
												offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
												$.each(OrderInfo.oldprodInstInfos,function(){
													if(this.prodInstId==prodId){
														offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
													}
												});
											}else{
												offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
											}
											
											_packageCouponInfo(prodId,offerId,response,instCode);
										}else{
											$.alert("提示","UIM卡["+instCode+"]不是预占状态，当前为"+statusCd);
										}
									}else{
										$.alert("提示","查询不到UIM卡["+instCode+"]信息");
									}
								}else if (response.code==-2){
									$.alertM(response.data);
								}else {
									$.alert("提示","UIM信息查询接口出错,稍后重试");
								}
							}
						}
					}
					
					if((order.memberChange.mktResInstCode!="" && order.memberChange.reloadFlag=="Y")||(OrderInfo.mktResInstCode!="" && OrderInfo.reloadFlag=="Y")){
						var nbrlist = [];
						var nbrflag = true;
						var offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
						$.each(OrderInfo.oldprodInstInfos,function(){
							if(this.prodInstId==prodId){
								offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
							}
						});
						var mktResInstCodesize = "";
						if(OrderInfo.actionFlag==2){
							mktResInstCodesize = OrderInfo.mktResInstCode.split(",");
						}else if(OrderInfo.actionFlag==6){
							mktResInstCodesize = order.memberChange.mktResInstCode.split(",");
						}
						for(var u=0;u<mktResInstCodesize.length;u++){
							if(mktResInstCodesize[u]!=""&&mktResInstCodesize[u]!=null&&mktResInstCodesize[u]!="null" && order.memberChange.oldSubPhoneNum!=""){
								var nbrAndUimCode = mktResInstCodesize[u].split("_");
								var _accNbr = nbrAndUimCode[0];
								var _uimCode = nbrAndUimCode[1];
								var oldSubPhoneNumsize = order.memberChange.oldSubPhoneNum.split(",");
								var uimflag = false;
								$.each(nbrlist,function(){
									if(this==_accNbr){
										nbrflag = false;
										return false;
									}else{
										nbrflag = true;
									}
								});
								if(!nbrflag){
									$.alert("提示","UIM卡"+_uimCode+"对应的号码重复");
									return;
								}
								for(var n=0;n<oldSubPhoneNumsize.length;n++){
									if(oldSubPhoneNumsize[n]==_accNbr){
										nbrlist.push(oldSubPhoneNumsize[n]);
										uimflag = true;
										$.each(OrderInfo.oldoffer,function(){
											$.each(this.offerMemberInfos,function(){
												if(this.accessNumber==_accNbr){
													$("#uim_txt_"+this.objInstId).attr("disabled",true);
													var uimParam = {
															"instCode":_uimCode
													};
													var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
													if (response.code==0) {
														if(response.data.mktResBaseInfo){
															if(response.data.mktResBaseInfo.statusCd=="1102"){
																$("#uim_check_btn_"+this.objInstId).attr("disabled",true);
																$("#uim_check_btn_"+this.objInstId).removeClass("purchase").addClass("disablepurchase");
																$("#uim_release_btn_"+this.objInstId).attr("disabled",false);
																$("#uim_release_btn_"+this.objInstId).removeClass("disablepurchase").addClass("purchase");
																$("#uim_txt_"+this.objInstId).val(_uimCode);
																var coupon = {
																		couponUsageTypeCd : "3", //物品使用类型
																		inOutTypeId : "1",  //出入库类型
																		inOutReasonId : 0, //出入库原因
																		saleId : 1, //销售类型
																		couponId : response.data.mktResBaseInfo.mktResId, //物品ID
																		couponinfoStatusCd : "A", //物品处理状态
																		chargeItemCd : "3000", //物品费用项类型
																		couponNum : response.data.mktResBaseInfo.qty, //物品数量
																		storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
																		storeName : "1", //仓库名称
																		agentId : 1, //供应商ID
																		apCharge : 0, //物品价格
																		couponInstanceNumber : _uimCode, //物品实例编码
																		terminalCode :_uimCode,//前台内部使用的UIM卡号
																		ruleId : "", //物品规则ID
																		partyId : OrderInfo.cust.custId, //客户ID
																		prodId :  this.objInstId, //产品ID
																		offerId : offerId, //销售品实例ID
																		state : "ADD", //动作
																		relaSeq : "" //关联序列	
																	};
																OrderInfo.clearProdUim(this.objInstId);
																OrderInfo.boProd2Tds.push(coupon);
															}else{
																$.alert("提示","UIM卡不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
															}
														}else{
															$.alert("提示","查询不到UIM信息");
														}
													}else if (response.code==-2){
														$.alertM(response.data);
													}else {
														$.alert("提示","UIM信息查询接口出错,稍后重试");
													}
												}
											});
										})
									}
								}
								if(!uimflag){
									$.alert("提示","UIM卡"+_uimCode+"未匹配到接入号");
								}
							}
						}
					}
				}
			}else if(flag==1){//取消开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡，已经显示补卡,判断是否隐藏补卡
					$("#uimDiv_"+prodId).hide();
				}
			}
		}
	};
	
	/**组装UIM数据信息*/
	var _packageCouponInfo=function(prodId,offerId,response,instCode){
		var coupon = {
				couponUsageTypeCd : "3", //物品使用类型
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : response.data.mktResBaseInfo.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : "3000", //物品费用项类型
				couponNum : 1, //物品数量
				storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : 0, //物品价格
				couponInstanceNumber :instCode, //物品实例编码
				terminalCode : instCode,//前台内部使用的UIM卡号
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId :  prodId, //产品ID
				offerId : offerId, //销售品实例ID
				state : "ADD", //动作
				relaSeq : "" //关联序列	
		};
		
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
	}
	
	//判断是否需要补卡
	var _isChangeUim = function(objId){
		if(CONST.getAppDesc()==0){
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			var prodId = order.prodModify.choosedProdInfo.prodInstId;
			if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){//套餐变更
				var member = CacheData.getOfferMember(objId);
				if(member.objInstId==undefined && offerChange.oldMemberFlag){
					$.each(OrderInfo.oldoffer,function(){
						$.each(this.offerMemberInfos,function(){
							if(this.objInstId==objId){
								member = this;
								return false;
							}
						});
					});
				}
				prodClass = member.prodClass;
				prodId = member.objInstId;
			}else if(OrderInfo.actionFlag==6){
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==objId){
						prodClass = this.prodClass;
						prodId = this.prodInstId;
					}
				});
				$.each(OrderInfo.viceOfferSpec,function(){
					if(this.prodId==prodId){
						var member = CacheData.getOfferMember(objId);
						prodClass = member.prodClass;
						prodId = member.objInstId;
					}
				});
			}
			if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡，已经显示补卡,判断是否隐藏补卡
				var servSpec = CacheData.getServSpec(prodId,CONST.PROD_SPEC.PROD_FUN_4G);
				if(servSpec!=undefined && servSpec.isdel != "Y" && servSpec.isdel != "C"){ //有开通4G功能产品
					return true;
				}
			}
		}
		return false;
	};
	
	//获取附属销售品节点
	var _setAttachBusiOrder = function(busiOrders){
		//遍历已选功能产品列表
		$.each(AttachOffer.openServList,function(){
			var prodId = this.prodId;
			$.each(this.servSpecList,function(){
				if(this.isdel != "Y" && this.isdel != "C"){  //订购的功能产品  && _getRelaType(this.servSpecId)!="1000"
					SoOrder.createServ(this,prodId,0,busiOrders);
				}
			});
		});
		//遍历已订购功能产品列表
		$.each(AttachOffer.openedServList,function(){
			var prodId = this.prodId;
			$.each(this.servList,function(){
				if(this.isdel == "Y"){  //关闭功能产品
					SoOrder.createServ(this,prodId,1,busiOrders);
				}else {
					if(this.update=="Y"){  //变更功能产品
						SoOrder.createServ(this,prodId,2,busiOrders);
					}
				}
			});
		});
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C"){  //订购的附属销售品
					if(ec.util.isObj(spec.counts)){//组装重复订购的可选包
						for(var k=0;k<spec.counts;k++){
							SoOrder.createAttOffer(spec,open.prodId,0,busiOrders);
						}
					}else{
						SoOrder.createAttOffer(spec,open.prodId,0,busiOrders);
					}
				}
			}
		}
		//遍历已订购附属销售品列表
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			for ( var j = 0; j < opened.offerList.length; j++) {  //遍历当前产品下面的附属销售品
				var offer = opened.offerList[j];
				if(offer.isdel == "Y"){  //退订的附属销售品
					if(ec.util.isObj(offer.counts)){//组装重复订购的可选包
						for(var k=0;k<offer.orderCount;k++){
							offer.offerId=offer.offerIds[k];
							SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
						}
					}else{
						SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
					}
				}else if(offer.update=="Y"){//修改附属销售品
					SoOrder.createAttOffer(offer,opened.prodId,2,busiOrders);
				}else if(ec.util.isObj(offer.orderCount)&&ec.util.isObj(offer.counts)){
					if(offer.orderCount>offer.counts){//退订附属销售品
						for(var k=0;k<(offer.orderCount-offer.counts);k++){
							offer.offerId=offer.offerIds[k];
							SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
						}
					}else if(offer.orderCount<offer.counts){//订购附属销售品
						var spec = CacheData.getOfferSpec(opened.prodId,offer.offerSpecId);
						for(var k=0;k<(offer.counts-offer.orderCount);k++){
							SoOrder.createAttOffer(spec,opened.prodId,0,busiOrders);
						}
					}
					
				}
			}
		}
		
		//遍历已选增值业务
		$.each(AttachOffer.openAppList,function(){
			var prodId = this.prodId;
			$.each(this.appList,function(){
				if(this.dfQty==1){  //开通增值业务
					SoOrder.createServ(this,prodId,0,busiOrders);
				}
			});
		});
	};
	//把对比省预校验的后有变动的 功能产品和可选包 放入临时缓存列表中
	var _setChangeList=function(prodId){
		AttachOffer.changeList=[];//清空
		var prodInfos = offerChange.resultOffer.prodInfos;//预校验返回的功能产品
		if(ec.util.isArray(prodInfos)){
			$.each(prodInfos,function(){
//				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
//				var flag = true;
//				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
//					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
//						flag = false;
//						return false;
//					}
//				});
				if(prodId!=this.accProdInstId){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var param={
						prodInstId:prodId
					};
					var serv = CacheData.getServ(prodId,this.prodInstId);//在已开通的功能产品里面查找
					var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
					if(this.state=="DEL"){
						if(serv!=undefined && serv.isdel != "Y"){
							param.objId=this.prodInstId;
							param.status=(serv.isdel!=undefined?serv.isdel:"N");
							param.objIdType=1;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							serv.isdel = "Y";
							AttachOffer.changeList.push(param);
						}else if(servSpec!=undefined && servSpec.isdel !="Y" && servSpec.isdel !="C"){
							param.objId=this.productId;
							param.status=servSpec.isdel;
							param.objIdType=2;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							servSpec.isdel = "Y";
							AttachOffer.changeList.push(param);
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined && serv.isdel == "Y"){  //在已开通里面，修改不让关闭
							param.objId=this.prodInstId;
							param.status=serv.isdel;
							param.objIdType=1;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							serv.isdel = "N";
							AttachOffer.changeList.push(param);
						}else if(servSpec != undefined && servSpec.isdel =="Y"){
							param.objId=this.productId;
							param.status=servSpec.isdel;
							param.objIdType=2;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							servSpec.isdel = "N";
							AttachOffer.changeList.push(param);
						}else if(serv==undefined && servSpec==undefined){
							param.objId=this.productId;
							param.status="Y";
							param.objIdType=2;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
							AttachOffer.changeList.push(param);
							if(this.productId!=undefined && this.productId!=""){
//								AttachOffer.openServSpec(prodId,this.productId);
								var newSerSpec = {
										objId : this.productId,
										servSpecId : this.productId,
										servSpecName : this.productName,
										ifParams : "N",
										isdel : "N"  
									};
								CacheData.setServSpec(prodId,newSerSpec); //添加到已开通列表里
								var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
								servSpec.isdel="N";
							}
						}
					}
				}
			});
		}
		var offers = offerChange.resultOffer.prodOfferInfos;//省预校验返回的可选包
		if(ec.util.isArray(offers)){
			$.each(offers,function(){
				if(this.memberInfo==undefined){
					return true;
				}
				var flag = true;
				$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
					if(ec.util.isObj(this.accProdInstId)&&prodId == this.accProdInstId){
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				var param={
						prodInstId:prodId
					};
				var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
				var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已选里面查找
				if(this.state=="DEL"){
					if(offer!=undefined && offer.isdel != "Y"){
						param.objId=this.prodOfferInstId;
						param.status=(offer.isdel!=undefined?offer.isdel:"N");
						param.objIdType=3;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offer.isdel = "Y";
						AttachOffer.changeList.push(param);
					}else if(offerSpec!=undefined && offerSpec.isdel !="Y" && offerSpec.isdel !="C"){
						param.objId=this.prodOfferId;
						param.status=offerSpec.isdel;
						param.objIdType=4;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offerSpec.isdel = "Y";
						AttachOffer.changeList.push(param);
					}	
				}else if(this.state=="ADD"){
					if(offer!=undefined && offer.isdel == "Y"){  //在已开通里面，修改不让关闭
						param.objId=this.prodOfferInstId;
						param.status=offer.isdel;
						param.objIdType=3;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offer.isdel = "N";
						AttachOffer.changeList.push(param);
					}else if(offerSpec != undefined && offerSpec.isdel =="Y"){
						param.objId=this.prodOfferId;
						param.status=offerSpec.isdel;
						param.objIdType=4;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						offerSpec.isdel = "N";
						AttachOffer.changeList.push(param);
					}else if(offer==undefined && offerSpec==undefined){
						param.objId=this.prodOfferId;
						param.status="Y";
						param.objIdType=4;//1 、功能产品实例id 2、功能产品规格id 3、销售品实例id 4、销售品规格id
						AttachOffer.changeList.push(param);
						if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
//							AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
							var newOfferSpec=_setSpec(prodId,this.prodOfferId);
							newOfferSpec.isdel="N";
						}
					}
				}
			});
		}
	};
	//还原预校验前的缓存信息
	var _reductionChangList=function(prodId){
		$.each(AttachOffer.changeList,function(){
			if(this.prodInstId==prodId){
				if(this.objIdType==1){
					var serv = CacheData.getServ(prodId,this.objId);//在已开通的功能产品里面查找
					if(serv!=undefined){
						serv.isdel=this.status;
					}
				}else if(this.objIdType==2){
					var servSpec = CacheData.getServSpec(prodId,this.objId);//在已选的功能产品里面查找
					if(servSpec!=undefined){
						servSpec.isdel=this.status;
					}
				}else if(this.objIdType==3){
					var offer = CacheData.getOffer(prodId,this.objId); //已开通里面查找
					if(offer!=undefined){
						offer.isdel=this.status;
					}
				}else if(this.objIdType==4){
					var offerSpec = CacheData.getOfferSpec(prodId,this.objId); //已选里面查找
					if(offerSpec!=undefined){
						offerSpec.isdel=this.status;
					}
				}
			}
		});
	};
	//查询销售品对象的互斥依赖连带的关系
	var _servExDepReByRoleObjs=function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		paramObj.excludeServ=[];//初始化
		paramObj.dependServ=[];//初始化
		paramObj.relatedServ=[];//初始化
		var globContent="";
		$.each(newSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				if(this.objType==4 && this.selQty==1){
						var servSpec = CacheData.getServSpec(prodId,this.objId); //在已选列表中查找
						if(servSpec==undefined){   //在可订购功能产品里面 
							var serv = CacheData.getServBySpecId(prodId,this.objId); //在已开通列表中查找
							if(serv==undefined){
								var newServSpec = {
										objId : this.objId, //调用公用方法使用
										servSpecId : this.objId,
										servSpecName : this.objName,
										ifParams : this.isCompParam,
										prodSpecParams : this.prodSpecParams,
										isdel : "C"   //加入到缓存列表没有做页面操作为C
								};
								CacheData.setServSpec(prodId,newServSpec); //添加到已开通列表里
								servSpec = newServSpec;
							}else{
								servSpec=serv;
							}
						}
						var servSpecId = servSpec.servSpecId;
						var param = CacheData.getExcDepServParam(prodId,servSpecId);
						if(param.orderedServSpecIds.length == 0){
//							AttachOffer.addOpenServList(prodId,servSpecId,servSpec.servSpecName,servSpec.ifParams);
						}else{
							var data=query.offer.queryExcludeDepend(param);//查询规则校验
							var content=paserServDataByObjs(data.result,prodId,servSpec,newSpec);
							if(content!=""){
								content=("开通【"+servSpec.servSpecName+"】功能产品：<br>"+content);
								globContent+=(content+"<br>");
							}
						}
				}
			});
		});
		return globContent;
	};
	
	//转换接口返回的互斥依赖
	var paramObj = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
	};
	//解析服务互斥依赖
	var paserServDataByObjs = function(result,prodId,serv,newSpec){
		var servExclude = result.servSpec.exclude; //互斥
		var servDepend = result.servSpec.depend; //依赖
		var servRelated = result.servSpec.related; //连带
		var content = "";
		
		//解析功能产品互斥
		if(ec.util.isArray(servExclude)){
			$.each(servExclude,function(){
				var servList = CacheData.getServList(prodId); //互斥要去除已订购手动删除
				var flag = true;
				if(servList!=undefined){
					for ( var i = 0; i < servList.length; i++) {
						if(servList[i].isdel=="Y"){
							if(servList[i].servSpecId == this.servSpecId){  //返回互斥数组在已订购中删除，不需要判断
								flag = false;
								break;
							}
						}
					}
				}
				if(flag){
					content += "需要关闭：   " + this.servSpecName + "<br>";
					paramObj.excludeServ.push(this);
				}
			});
		}
		//解析功能产品依赖
		if(ec.util.isArray(servDepend)){
			$.each(servDepend,function(){
				if(!AttachOffer.filterServ(this.servSpecId,newSpec)){
					content += "需要开通：   " + this.servSpecName + "<br>";
					paramObj.dependServ.push(this);
				}
			});
		}
		//解析功能产品连带
		if(ec.util.isArray(servRelated)){
			$.each(servRelated,function(){
				if(!AttachOffer.filterServ(this.servSpecId,newSpec)){
					content += "需要开通：   " + this.servSpecName + "<br>";
					paramObj.relatedServ.push(this);
				}
			});
		}
		return content;
	};
	
	//去重，把互斥依赖里面的信息进行去重处理
	var _filterServ=function(servSpecId,newSpec){
		var flag=false;
		$.each(newSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				if(this.objType==4 && this.selQty==1){
					if(servSpecId==this.objId){
						flag=true;
						return false;
					}
				}
			});
		});
		if(!flag){
			if(ec.util.isArray(paramObj.dependServ)){
				for(var i=0;i<paramObj.dependServ.length;i++){
					if(servSpecId==paramObj.dependServ[i].servSpecId){
						flag=true;
						break;
					}
				}
			}
			if(!flag){
				if(ec.util.isArray(paramObj.relatedServ)){
					for(var i=0;i<paramObj.relatedServ.length;i++){
						if(servSpecId==paramObj.relatedServ[i].servSpecId){
							flag=true;
							break;
						}
					}
				}
			}
		}
		return flag;
	};
	
	//销售品角色成员对象是中 minQty大于0的话 就必须设置其为不能删除（暂定）
	var _minQtyFileter=function(prodId,servSpecId){
		//从已开通功能产品中找
		var serv = CacheData.getServBySpecId(prodId,servSpecId); 
		var $li;
		if(serv != undefined){
			$li=$("#li_"+prodId+"_"+serv.servId);
		}else{
			$li=$("#li_"+prodId+"_"+servSpecId);
		}
		if($li!=undefined){
			$li.find(".delete").remove();
			$li.append('<dd class="mustchoose"></dd>');	
		}
	};
	
	/**
	 * 判断 该合约是否满足被订购的条件：主套餐成员实例数据小于最小终端数，需要进行提示，不允许受理
	 */
	var _manyPhoneFilter=function(prodId,offerSpecId){
			if(OrderInfo.actionFlag==14){
				return true;
			}
			var newSpec;
			var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
			if(ec.util.isObj(offer)){
				newSpec=offer;
			}else{
				newSpec = _setSpec(prodId,offerSpecId);
			}
			if(newSpec==undefined){
				return false;
			}
			if(ec.util.isArray(newSpec.agreementInfos)){
				var num=0;
				if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag == 6){
					$.each(OrderInfo.offerSpec.offerRoles,function(){
					$.each(this.prodInsts,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD){
							num++;
						}
						});
					});
				}else if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3){
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							num++;
						}
					});
				}else if(OrderInfo.actionFlag == 21){
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD&&this.objInstId==prodId){  //接入类产品
							num++;
						}
					});
				}
				
				var minNum=newSpec.agreementInfos[0].minNum;
				var maxNum=newSpec.agreementInfos[0].maxNum;
				if(!ec.util.isObj(minNum)){
					$.alert("信息提示","销售品规格查询，未返回最小合约数，请后台确认。");
					return false;
				}
				if(num<minNum){
					$.alert("信息提示","该合约的最小合约数为"+minNum+"个，而该套餐的成员实例只有"+num+"个，故无法办理该合约。");
					return false;
				}
				if(maxNum>num){
					newSpec.agreementInfos[0].maxNum=num;//取最小的一个为最大终端数
				}
//				var terminalMinNum=0;
//				var terminalMaxNum=0;
//				$.each(newSpec.agreementInfos,function(){
//					$.each(this.terminalGroups,function(){
//						terminalMinNum+=this.terminalMinNum;
//						terminalMaxNum+=this.terminalMaxNum;
//					});
//				});
//				if(minNum>terminalMaxNum){
//					$.alert("信息提示","该合约的终端配置有问题，最小合约数大于组内最大值之和，请配置组核查。");
//					return false;
//				}
//				if(maxNum<terminalMinNum){
//					$.alert("信息提示","该合约的终端配置有问题，最大合约数小于组内最小值之和，请配置组核查。");
//					return false;
//				}
			}
		return true;
	};
	
	//添加终端
	var _addAndDelTerminal=function(obj){
		var prodId=$(obj).attr("prodId");
		var offerSpecId=$(obj).attr("offerSpecId");
		var fag=$(obj).attr("fag");
		var newSpec;
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(ec.util.isObj(offer)){
			newSpec=offer;
		}else{
			newSpec = _setSpec(prodId,offerSpecId);
		}
		var objInstId = prodId+'_'+newSpec.offerSpecId;
//		var terminalMaxNum=0;
//		var terminalMinNum=0;
//		$.each(newSpec.agreementInfos,function(){
//			$.each(this.terminalGroups,function(){
//				if(this.terminalGroupId==terminalGroupId){
//					terminalMaxNum=this.terminalMaxNum;
//					terminalMinNum=this.terminalMinNum;
//					return false;
//				}
//			});
//		});
		var maxNum=newSpec.agreementInfos[0].maxNum;
		var minNum=newSpec.agreementInfos[0].minNum;
//		$("li[id=^terminalDesc_"+terminalGroupId+"]");
//		var $ul=$(obj).parent().parent();ul_"'+objInstId+'
		var $ul=$("#ul_"+objInstId);
		var $li=$("#ul_"+objInstId+" li");
		var length=$li.length-1;
//		var $liPre=$("li[id=^terminalDesc_"+terminalGroupId+"]")
//		var length=$("li[id=^terminalDesc_"+terminalGroupId+"]").length;
		var isFastOffer = 0 ;
		if(ec.util.isArray(newSpec.extAttrParams)){
			$.each(newSpec.extAttrParams,function(){
				if(this.attrId == CONST.OFFER_FAST_FILL){
					isFastOffer = 1;
					return false;
				}
			});
		}
		if(fag==0){//添加终端
			if(totalNums>=maxNum){
				$.alert("信息提示","终端数已经达到最大，不能再添加了。");
				return;
			}
//			if(terminalMaxNum==(length/2)){
//				$.alert("信息提示","终端数已经达到最大，不能再添加了。");
//				return;
//			}
			var $liTerminalAdd=$('<li style="width:700px;"><label>终端校验：</label><input id="terminalText_'+objInstId+'_'+(length/2+1)+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
					+'<input id="terminalBtn_'+objInstId+'_'+(length/2+1)+'" type="button" flag="'+isFastOffer+'" num="'+(length/2+1)+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)" value="校验" class="purchase" style="float:left"></input></li>');
			var $liAdd = $('<li id="terminalDesc_'+(length/2+1)+'" style="white-space:nowrap;width:700px;"><label></label><label id="terminalName_'+(length/2+1)+'"></label></li>');
			
			$ul.append($liTerminalAdd).append($liAdd);
			totalNums++;
		}else{//删除终端
			if(minNum==(length/2)){
				$.alert("信息提示","终端数已经达到最小，不能再删除了。");
				return;
			}
			$li.each(function(index){
				if(length-1==index){
					$(this).remove();
				}else if(length==index){
					_filterAttach2Coupons(prodId,offerSpecId,(index/2));
					$(this).remove();
				}
				
			});
			totalNums--;
		}
	};
	
	//判断同一个终端组里面是否串码有重复的
	var _checkData=function(objInstId,terminalCode){
		var $input=$("input[id^=terminalText_"+objInstId+"]");
		var num=0;
		$input.each(function(){//遍历页面上面的串码输入框，为的是跟缓存里面的串码进行比对
			var instCode=$.trim(this.value);//页面上面的串码
			if(ec.util.isObj(instCode)&&terminalCode==instCode){
				num++;
			}
		});
		if(num>=2){
			$.alert("信息提示","终端串码重复了，请填写不同的串码。");
			return true ; 
		}
		return false;
	};
	
	//过滤 同一个串码输入框校验多次，如果之前有校验通过先清空
	var _filterAttach2Coupons=function(prodId,offerSpecId,num){
		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
			var attach2Coupon = OrderInfo.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId&&attach2Coupon.num==num){
				OrderInfo.attach2Coupons.splice(i,1);
				$("#terminalName_"+num).html("");
				break;
			}
		}
	};
	
	//清空同一个产品下的同一个销售品的串码缓存信息
	var _removeAttach2Coupons=function(prodId,offerSpecId){
		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
			var attach2Coupon = OrderInfo.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
				OrderInfo.attach2Coupons.splice(i,1);
				i--;
			}
		}
	};
	
	//判断是否是重复订购的逻辑
	var _ifOrderAgain=function(newSpec){
		if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
			if(parseInt(newSpec.orderCount)<newSpec.counts){
//				var $specAgain = $('#li_'+prodId+'_'+offerSpecId+'_'+newSpec.ifOrderAgain); //在已开通附属里面
//				$specAgain.remove();
				$.alert("信息提示","可选包："+newSpec.offerSpecName+"至多只能订购"+newSpec.orderCount+"次");
				return true;
			}
		}
	};
	
	//1表示从已订购那边过来的
	var _setParam=function(prodId,offerSpecId,flag){
		var newSpec = _setSpec(prodId,offerSpecId);  //没有在已选列表里面
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(flag==1){
			newSpec.counts=offer.counts;
		}
		var content = '<form id="paramForm">' ;
		content += "次数" + ' : <input id="text_'+prodId+'_'+offerSpecId  
		+'" class="inputWidth183px" type="text" value="'+newSpec.counts+'"><br>'; 
		content +='</form>' ;
		$.confirm("参数设置： ",content,{ 
			yes:function(){
			},
			no:function(){
			}
		});
		$('#paramForm').bind('formIsValid', function(event, form) {
			if(flag==1){
				var nums=$("#text_"+prodId+"_"+offerSpecId).val();
				var reg = /^\+?[0-9][0-9]*$/;//正整数
				if(!reg.test(nums)){
					$.alert("信息提示","次数输入有误。");
					return;
				}
			}else{
				var nums=$("#text_"+prodId+"_"+offerSpecId).val();
				var reg = /^\+?[1-9][0-9]*$/;//正整数
				if(!reg.test(nums)){
					$.alert("信息提示","次数只能是正整数。");
					return;
				}
			}
//			if(flag==1&&offer.orderCount>nums){
//				$.alert("信息提示","可选包【"+newSpec.offerSpecName+"】不允许退订！");
//				return;
//			}
			if(parseInt(newSpec.orderCount)<nums){
				$.alert("信息提示","可选包【"+newSpec.offerSpecName+"】至多只能订购"+newSpec.orderCount+"次");
				return;
			}
			if(flag==1 && offer!=undefined){
				if(offer.orderCount>nums){//退订附属销售品
					if(!ec.util.isArray(offer.offerMemberInfos)){//销售品实例查询	
						var param = {
								prodId:prodId,
								areaId: OrderInfo.getProdAreaId(prodId),
								offerId:offer.offerId	
						};
						param.acctNbr = OrderInfo.getAccessNumber(prodId);
						var data = query.offer.queryOfferInst(param);
						if(data==undefined){
							return;
						}
						offer.offerMemberInfos = data.offerMemberInfos;
						offer.offerSpec = data.offerSpec;
					}
				}
				offer.counts=nums;
			}else{
				newSpec.counts=nums;
			}
			$(".ZebraDialog").remove();
			$(".ZebraDialogOverlay").remove();
		}).ketchup({bindElementByClass:"ZebraDialog_Button1"});	
	};
	
	var _offerSpecDetail=function(prodId,offerSpecId){
		var offerSpecName ="";
		var summary = "";
		$.each(AttachOffer.allOfferList,function(){
			if(this.offerSpecId == offerSpecId){
				offerSpecName = this.offerSpecName;
				summary = this.summary;
			}else if(this.servSpecId == offerSpecId){
				offerSpecName = this.servSpecName;
				summary = this.summary;
			}
		});
		$('#detail_tbody').empty();
		var $tr = $('<tr></tr>');
		//var $tr = $('<tr id="atr_'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')"><td><input type="checkbox" id="'+id+'" onclick="order.dealer.checkAttach(\''+id+'\')" name="attach_dealer"/></td></tr>');
		$tr.append('<td>'+offerSpecName+'</td><td width="900">'+summary+'</td>');
		$('#detail_tbody').append($tr);
		easyDialog.open({
			container : "div_detail_dialog"
		});
	};
	//已订购的附属销售品查询
	var _queryCardAttachOffer = function(cardTypeFlag) {
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var prodId = prodInfo.prodInstId;
		var param = {
		    prodId : prodId,
		    prodSpecId : prodInfo.productId,
		    offerSpecId : prodInfo.prodOfferId,
		    acctNbr : prodInfo.accNbr
		};
		if(ec.util.isObj(prodInfo.prodBigClass)){
			param.prodBigClass = prodInfo.prodBigClass;
		}
		var data = query.offer.queryAttachOfferHtml(param);
	//	SoOrder.initFillPage();
		$("#attach").html(data).show();
		//var member = CacheData.getOfferMember(prodId);
		//如果objId，objType，objType不为空才可以查询默认必须
		//if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
            var temp = {   
				boActionTypeCd : '14',
				cardType : cardTypeFlag=="1"?"4G":"3G",
				accNbr: prodInfo.accNbr,
				prodInstId : prodId,
				prodId : prodId,
				prodSpecId : prodInfo.productId
			};
			//默认必须可选包和功能产品
			var data = query.offer.queryDefMustOfferSpecAndServ(temp);
			CacheData.parseOffer(data);
			CacheData.parseServ(data);
		//}
		if(ec.util.isArray(OrderInfo.offerSpec.offerRoles)){ //主套餐下的成员判断
			var member = CacheData.getOfferMember(prodId);
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
					var offerRole = this;
					$.each(this.roleObjs,function(){
						if(this.objType==CONST.OBJ_TYPE.SERV){
							var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
							if(serv!=undefined){ //不在已经开跟已经选里面
								var $oldLi = $('#li_'+prodId+'_'+serv.servId);
								if(this.minQty==1){
									$oldLi.append('<dd class="mustchoose"></dd>');
								}
								$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
							}
						}
					});
					return false;
				}
			});
		}
		//AttachOffer.changeLabel(prodId, prodInfo.productId,""); //初始化第一个标签附属
		//order.dealer.initDealer();
	};
	
	//新装二次加载部分
	//删除附属销售品规格
	var _delOfferSpecReload = function(prodId,offerSpecId){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			var content = CacheData.getOfferProdStr(prodId,spec,2);
			$span.addClass("del");
			spec.isdel = "Y";
			delServSpec(prodId,spec); //取消订购销售品时
			order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
			$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
			spec.isTerminal = 0;
		}
	};
	//关闭服务规格
	var _closeServSpecReload = function(prodId,servSpecId,specName,ifParams){
		var $span = $("#li_"+prodId+"_"+servSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.openServSpecReload(prodId,servSpecId,specName,ifParams);
		}else { //退订
			var spec = CacheData.getServSpec(prodId,servSpecId);
			if(spec == undefined){ //没有在已开通附属销售列表中
				return;
			}
			$span.addClass("del");
			spec.isdel = "Y";
			_showHideUim(1,prodId,servSpecId);   //显示或者隐藏			
			var serv = CacheData.getServBySpecId(prodId,servSpecId);
			if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
				$span.addClass("del");
				serv.isdel = "Y";
				//_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
			}
		}
	};
	//订购附属销售品
	var _addOfferSpecReload = function(prodId,offerSpecId){
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		CacheData.setServ2OfferSpec(prodId,newSpec);
		_checkOfferExcludeDepend(prodId,newSpec);
	};
	//开通功能产品
	var _openServSpecReload = function(prodId,servSpecId,specName,ifParams){
		var servSpec = CacheData.getServSpec(prodId,servSpecId); //在已选列表中查找
		if(servSpec==undefined){   //在可订购功能产品里面 
			var newSpec = {
				objId : servSpecId, //调用公用方法使用
				servSpecId : servSpecId,
				servSpecName : specName,
				ifParams : ifParams,
				isdel : "C"   //加入到缓存列表没有做页面操作为C
			};
			var inPamam = {
				prodSpecId:servSpecId
			};
			if(ifParams == "Y"){
				var data = query.prod.prodSpecParamQuery(inPamam);// 产品功能产品属性
				if(data==undefined || data.result==undefined){
					return;
				}
				newSpec.prodSpecParams = data.result.prodSpecParams;
			if(servSpecId==CONST.YZFservSpecId){//翼支付助手根据付费类型改变默认值
				var feeType = $("select[name='pay_type_-1']").val();
				if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
				if(feeType == CONST.PAY_TYPE.AFTER_PAY){
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {
						var prodSpecParam = newSpec.prodSpecParams[j];
						prodSpecParam.setValue = "";
					}																			
				}else{
					for ( var j = 0; j < newSpec.prodSpecParams.length; j++) {							
						var prodSpecParam = newSpec.prodSpecParams[j];
						if (prodSpecParam.value!="") {
							prodSpecParam.setValue = prodSpecParam.value;
						} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
							//默认值为空则取第一个
							prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
				}
			  }
			}
			}
			CacheData.setServSpec(prodId,newSpec); //添加到已开通列表里
			servSpec = newSpec;
		}
		_checkServExcludeDepend(prodId,servSpec);
	};
	//终端校验
	var _checkTerminalCodeReload = function(obj){
		var prodId=$(obj).attr("prodId");
		var offerSpecId=$(obj).attr("offerSpecId");
//		var terminalGroupId=$(obj).attr("terminalGroupId");
		var num=$(obj).attr("num");
		var flag=$(obj).attr("flag");
		if(flag==undefined){
			flag = 0 ;
		}
		
		//清空旧终端信息
		_filterAttach2Coupons(prodId,offerSpecId,num);
		
		//清空旧终端信息
//		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
//			var attach2Coupon = OrderInfo.attach2Coupons[i];
//			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
//				OrderInfo.attach2Coupons.splice(i,1);
//				break;
//			}
//		}
		var objInstId = prodId+"_"+offerSpecId;
//		var resId = $("#terminalSel_"+objInstId+"_"+terminalGroupId).val();
		var resIdArray = [];
		var terminalGroupIdArray = [];
		$("#"+objInstId+"  option").each(function(){
			resIdArray.push($(this).val());
		});
		$("#group_"+objInstId+"  option").each(function(){
			terminalGroupIdArray.push($(this).val());
		});
		var resId = resIdArray.join("|"); //拼接可用的资源规格id
		var terminalGroupId = terminalGroupIdArray.join("|"); //拼接可用的资源终端组id
		if((resId==undefined || $.trim(resId)=="") && (terminalGroupId==undefined || $.trim(terminalGroupId)=="")){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+objInstId + "_"+num).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		if(_checkData(objInstId,instCode)){
			return;
		}
		var param = {
			instCode : instCode,
			flag : flag,
			mktResId : resId,
			termGroup : terminalGroupId
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		var activtyType ="";
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && ec.util.isArray(spec.agreementInfos)){  //订购的附属销售品
                    if(spec.agreementInfos[0].activtyType == 2){
                    	activtyType = "2";
				    }
				}
			}
		}
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE || (data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2")){
			//$.alert("信息提示",data.message);
//			$("#terminalSel_"+objInstId).val(data.mktResId);
//			$("#terminalName").html(data.mktResName);
//			$("#terminalDesc").css("display","block");
//			var price = $("#terminalSel_"+objInstId).find("option:selected").attr("price");
			
			
			var mktPrice=0;//营销资源返回的单位是元
			var mktColor="";
			if(ec.util.isArray(data.mktAttrList)){
				$.each(data.mktAttrList,function(){
					if(this.attrId=="65010058"){
						mktPrice=this.attrValue;
					}else if(this.attrId=="60010004"){
						mktColor=this.attrValue;
					}
				});
			}
			$("#terminalName_"+num).html("终端规格："+data.mktResName+",终端颜色："+mktColor+",合约价格："+mktPrice+"元");
			$("#terminalDesc_"+num).css("display","block");
			
			/*$("#terRes_"+objInstId).show();
			$("#terName_"+objInstId).text(data.mktResName);
			$("#terCode_"+objInstId).text(data.instCode);	
			if(price!=undefined){
				$("#terPrice_"+objInstId).text(price/100 + "元");
			}*/
			var coupon = {
				couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
				inOutTypeId : "1",  //出入库类型
				inOutReasonId : 0, //出入库原因
				saleId : 1, //销售类型
				couponId : data.mktResId, //物品ID
				couponinfoStatusCd : "A", //物品处理状态
				chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
				couponNum : 1, //物品数量
				storeId : data.mktResStoreId, //仓库ID
				storeName : "1", //仓库名称
				agentId : 1, //供应商ID
				apCharge : mktPrice, //物品价格,约定取值为营销资源的
				couponInstanceNumber : data.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId : prodId, //产品ID
				offerId : -1, //销售品实例ID
				attachSepcId : offerSpecId,
				state : "ADD", //动作
				relaSeq : "", //关联序列	
				num	: num //第几个串码输入框
			};
			if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2"){//“已销售未补贴”的终端串码可以办理话补合约
				coupon.couponSource ="2"; //串码话补标识
			}
			if(CONST.getAppDesc()==0){
				coupon.termTypeFlag=data.termTypeFlag;
			}
			OrderInfo.attach2Coupons.push(coupon);
		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
			$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
		}else{
			$.alert("提示",data.message);
		}
	};
	
	//删除附属销售品带出删除功能产品
	var _delServSpec = function(prodId,offerSpec){
		$.each(offerSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				var servSpecId = this.objId;
				if($("#check_"+prodId+"_"+servSpecId).attr("checked")=="checked"){
					var spec = CacheData.getServSpec(prodId,servSpecId);
					if(ec.util.isObj(spec)){
						spec.isdel = "Y";
						var $li = $("#li_"+prodId+"_"+servSpecId);
						$li.removeClass("canshu").addClass("canshu2");
						$li.find("span").addClass("del"); //定位删除的附属
						_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
					}
				}
			});
		});
	};
	
	var _queryOfferAndServDependForCancel = function(offerSpecId,servSpecId){
		if(OrderInfo.order.soNbr==null || OrderInfo.order.soNbr==undefined || OrderInfo.order.soNbr==""){
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		var param={
				orderedOfferSpecIds : _orderedOfferSpecIds,
				servSpecIds : _servSpecIds,
				offerSpecId : offerSpecId,
				servSpecId : servSpecId,
				soNbr : OrderInfo.order.soNbr
		};
		var response = $.callServiceAsJson(contextPath+"/offer/queryOfferAndServDependForCancel",param); //依赖销售品查询
		return response;
	};
	
	return {
		excludeAddServ:excludeAddServ,
		addOffer 				: _addOffer,
		addOfferSpec 			: _addOfferSpec,
		addOpenList				: _addOpenList,
		addOpenServList			: _addOpenServList,
		addOfferSpecByCheck		: _addOfferSpecByCheck,
		addAndDelTerminal		: _addAndDelTerminal,
		closeAttachSearch 		: _closeAttachSearch,
		changeLabel				: _changeLabel,
		changeList				: _changeList,
		closeServ				: _closeServ,
		closeServSpec			: _closeServSpec,
		checkData				: _checkData,
		delOffer				: _delOffer,
		delOfferSpec			: _delOfferSpec,
		labelList				: _labelList,
		isChangeUim				: _isChangeUim,
		init					: _init,
		openList				: _openList,
		openedList				: _openedList,
		openServList			: _openServList,
		openedServList 			: _openedServList,
		openServSpec			: _openServSpec,
		openAppList				: _openAppList,
		queryAttachOffer 		: _queryAttachOffer,
		queryAttachOfferSpec 	: _queryAttachOfferSpec,
		queryCardAttachOffer    : _queryCardAttachOffer,
		showParam 				: _showParam,
		showServParam			: _showServParam,
		showTime				: _showTime,
		setAttachTime			: _setAttachTime,
		searchAttachOfferSpec   : _searchAttachOfferSpec,
		selectAttachOffer		: _selectAttachOffer,
		showOfferTime			: _showOfferTime,
		showMainParam			: _showMainParam,
		showMainMember			: _showMainMember,
		selectServ				: _selectServ,
		showStartTime			: _showStartTime,
		showEndTime			    : _showEndTime,
		setAttachBusiOrder		: _setAttachBusiOrder,
		showApp					: _showApp,
		showHideUim				: _showHideUim,
		showMainRoleProd		: _showMainRoleProd,
		checkTerminalCode		: _checkTerminalCode,
		checkOfferExcludeDepend	: _checkOfferExcludeDepend,
		checkServExcludeDepend	: _checkServExcludeDepend,
		servExDepReByRoleObjs	: _servExDepReByRoleObjs,
		setChangeList			: _setChangeList,
		reductionChangList		: _reductionChangList,
		filterServ				: _filterServ,
		setParam				: _setParam,
		showMainMemberRoleProd	: _showMainMemberRoleProd,
		offerSpecDetail         : _offerSpecDetail,
		delOfferSpecReload     :_delOfferSpecReload,
		closeServSpecReload    :_closeServSpecReload,
		addOfferSpecReload     :_addOfferSpecReload,
		openServSpecReload     :_openServSpecReload,
		checkTerminalCodeReload:_checkTerminalCodeReload,
		changereserveCode:_changereserveCode,
		delServSpec             : _delServSpec,
		setSpec:				_setSpec,
		queryOfferAndServDependForCancel : _queryOfferAndServDependForCancel,
		initMyfavoriteSpec:_initMyfavoriteSpec,
		addMyfavoriteSpec:_addMyfavoriteSpec,
		delMyfavoriteSpec:_delMyfavoriteSpec,
		myFavoriteList:_myFavoriteList
		
	};
})();
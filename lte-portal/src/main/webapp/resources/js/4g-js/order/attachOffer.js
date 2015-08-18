/**
 * 附属销售品受理对象
 * 
 * @author wukf
 * date 2013-08-22
 */
CommonUtils.regNamespace("AttachOffer");

/** 附属销售品受理对象*/
AttachOffer = (function() {

	var _openList = []; //保存已经选择的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openedList = []; //已经订购的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openServList = []; //保存已经选择功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openedServList = []; //保存已经订购功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openAppList = []; //保存产品下增值业务
	
	var _labelList = []; //标签列表
	
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
		if(!rule.rule.ruleCheck()){ //规则校验失败
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
		
	}; 
	
	//可订购的附属查询 
	var _queryAttachOfferSpec = function(param) {
		query.offer.queryAttachSpec(param,function(data){
			if (data) {
				$("#attach_"+param.prodId).html(data);
				_showMainRoleProd(param.prodId); //通过主套餐成员显示角字
				AttachOffer.changeLabel(param.prodId,param.prodSpecId,""); //初始化第一个标签附属
				if(param.prodId==-1 && OrderInfo.actionFlag==14){ //合约计划特殊处理
					AttachOffer.addOpenList(param.prodId,mktRes.terminal.offerSpecId);
				}
			}
		});
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
									if(roleObj.dfQty == 0){//在基础功能中没有选中的默认删除状态  
										var $span=$oldLi.find("span");
										$span.addClass("del");
										spec.isdel = "Y";
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
									CacheData.setServSpec(prodId,roleObj); //添加到已开通列表里
									spec = roleObj;
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
	
	//查询附属销售品规格
	var _searchAttachOfferSpec = function(prodId,offerSpecId,prodSpecId) {
		var param = {   
			prodId : prodId,
		    prodSpecId : prodSpecId,
		    offerSpecIds : [offerSpecId],
		    ifCommonUse : "" 
		};
		var offerSepcName = $("#search_text_"+prodId).val();
		if(offerSepcName.replace(/\ /g,"")==""){
			$.alert("提示","请输入查询条件！");
			return;
		}
		param.offerSpecName = offerSepcName;
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
	var _delOfferSpec = function(prodId,offerSpecId){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
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
	};
	
	//删除附属销售品实例
	var _delOffer = function(prodId,offerId){
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
				param.acctNbr = OrderInfo.getAccessNumber(prodId);
				var data = query.offer.queryOfferInst(param);
				if(data==undefined){
					return;
				}
				offer.offerMemberInfos = data.offerMemberInfos;
				offer.offerSpec = data.offerSpec;
			}
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
	};
	
	//关闭服务规格
	var _closeServSpec = function(prodId,servSpecId,specName,ifParams){
		var $span = $("#li_"+prodId+"_"+servSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="del"){  //已经退订，再订购
			AttachOffer.openServSpec(prodId,servSpecId,specName,ifParams);
		}else { //退订
			$.confirm("信息确认","取消开通【"+$span.text()+"】功能产品",{ 
				yesdo:function(){
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
				},
				no:function(){
				}
			});
		}
	};
	
	//关闭服务实例
	var _closeServ = function(prodId,servId){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		if($span.attr("class")=="del"){  //已经关闭，取消关闭
			_openServ(prodId,serv);
		}else { //关闭
			if(_canCloseServ(prodId,servId)){
				return;
			}
			$.confirm("信息确认","关闭【"+$span.text()+"】功能产品",{ 
				yesdo:function(){
					$span.addClass("del");
					serv.isdel = "Y";
				},
				no:function(){						
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
		if(param.orderedOfferSpecIds.length == 0 ){
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{
			var data = query.offer.queryExcludeDepend(param);//查询规则校验
			if(data!=undefined){
				paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
			}
		}
		
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
		
		var spec = CacheData.getOffer(prodId,offerId); //在已经开通列表中查找
		if(OrderInfo.isGroupOfferSpecId(spec.offerSpecId)){  //表示有虚拟VPN或是一点付费
			var content = CacheData.getOfferProdStr(prodId,spec.offerSpec,0);
			$.confirm("信息确认",content,{ 
				yes:function(){
					CacheData.setServ2OfferSpec(prodId,spec.offerSpec);
				},
				yesdo:function(){
					_checkOfferExcludeDepend(prodId,spec);
					$.each(spec.offerSpec.offerRoles,function(){
						$.each(this.roleObjs,function(){
							if(this.objType==4 && this.selQty==1){
								var ifParams = "N";
								if(ec.util.isArray(this.prodSpecParams)){
									ifParams = "Y";
								}
								_addOpenServList(prodId,this.objId,this.objName,ifParams);
							}
						});
					});
				},
				no:function(){
				}
			});
			return;
		}
		
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
		var exclude = result.offerSpec.exclude;
		var depend = result.offerSpec.depend;
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeOffer : [],   //互斥依赖显示列表
			dependOffer : {  //存放互斥依赖列表
				dependOffers : [],
				offerGrpInfos : []
			}
		};
		
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
						content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+subOfferSpec.offerSpecName+'</input><br>';
					}
				}
			}
		}
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{	
			$.confirm("开通： " + specName,content,{ 
				yesdo:function(){
					excludeAddattch(prodId,offerSpecId,param);
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
		var content = "";
		//转换接口返回的互斥依赖
		var param = {  
			excludeServ : [],  //互斥依赖显示列表
			dependServ : [], //存放互斥依赖列表
			relatedServ : [] //连带
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
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams);
		}else{	
			$.confirm("开通： " + serv.servSpecName,content,{ 
				yesdo:function(){
					AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
					excludeAddServ(prodId,servSpecId,param);
				},
				no:function(){
				}
			});
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
	};
	
	//互斥依赖时添加
	var excludeAddattch = function(prodId,specId,param){
		if(param.dependOffer.offerGrpInfos.length>0){  // 依赖组
			for (var i = 0; i < dependOffer.offerGrpInfos.length; i++) {
				var offerGrpInfo = dependOffer.offerGrpInfos[i];
				var $offerSpecs = $("input[name="+offerGrpInfo.grpId+"]:checked");
				var len  = $offerSpecs.length;
				if(len>=offerGrpInfo.minQty&&len<=offerGrpInfo.maxQty){
					$offerSpecs.each(function(index,spec){
						AttachOffer.addOpenList(prodId,spec.id); 
					});
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
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(offer != undefined){ //在已开通中，需要取消退订
			var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
			$span.removeClass("del");
			offer.isdel = "N";
			return;
		}
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		if(newSpec.isdel=="C"){ //没有在已开通附属销售列表中，但是已经加载到缓存
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
			$("#open_ul_"+prodId).append($li);
			newSpec.isdel = "N";
		}else if((newSpec.isdel=="Y")) { 
			var $span = $("#li_"+prodId+"_"+offerSpecId).find("span");
			$span.removeClass("del");
			newSpec.isdel = "N";
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
					if(this.objType==4 && this.selQty==1){
						var ifParams = "N";
						if(ec.util.isArray(this.prodSpecParams)){
							ifParams = "Y";
						}
						_addOpenServList(prodId,this.objId,this.objName,ifParams);
					}
				});
			});
		}
		if(ec.util.isArray(newSpec.agreementInfos)){ //合约销售品需要输入终端
			/*var $sel = $("#terminalSel_"+prodId);
			$sel.empty();
			$.each(newSpec.agreementInfos,function(){
				var $option = $('<option value="'+this.terminalModels+'">'+this.terminalName+'</option>');
				$sel.append($option);
			});
			$("#terminalDiv_"+prodId).show();
			AttachOffer.isTerminal = 1;*/
			//if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==14){
				var objInstId = prodId+'_'+newSpec.offerSpecId;
				//一个终端对应一个ul
				var $ul = $('<ul id="terminalUl_'+objInstId+'" class="fillin show"></ul>');
				var $sel = $('<select id="terminalSel_'+objInstId+'"></select>');  
				var $li1 = $('<li class="full"><label style="width:auto; margin:0px 10px;"><span style="color:#71AB5A;font-size:16px">'+newSpec.offerSpecName+'</span></label></li>');
				var $li2 = $('<li><label> 可选终端规格：</label></li>');
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
				$ul.append($li1).append($li2).append($li3).appendTo($div);
				$div.show();
				newSpec.isTerminal = 1;
				if(OrderInfo.actionFlag==14){
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
	
	//终端校验
	var _checkTerminalCode = function(prodId,offerSpecId){
		//清空旧终端信息
		for ( var i = 0; i < OrderInfo.attach2Coupons.length; i++) {
			var attach2Coupon = OrderInfo.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId){
				OrderInfo.attach2Coupons.splice(i,1);
				break;
			}
		}
		var objInstId = prodId+"_"+offerSpecId;
		var resId = $("#terminalSel_"+objInstId).val();
		if(resId==undefined || $.trim(resId)==""){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+objInstId).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		var param = {
			instCode : instCode,
			mktResId : resId
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE){
			$.alert("信息提示",data.message);
			var price = $("#terminalSel_"+objInstId).find("option:selected").attr("price");
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
				apCharge : price/100, //物品价格
				couponInstanceNumber : data.instCode, //物品实例编码
				ruleId : "", //物品规则ID
				partyId : OrderInfo.cust.custId, //客户ID
				prodId : prodId, //产品ID
				offerId : -1, //销售品实例ID
				attachSepcId : offerSpecId,
				state : "ADD", //动作
				relaSeq : "" //关联序列	
			};
			OrderInfo.attach2Coupons.push(coupon);
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
	var _showMainParam = function(){
		var content = CacheData.getParamContent(-1,OrderInfo.offerSpec,0);
		$.confirm("参数设置： ",content,{ 
			yes:function(){	
				
			},
			no:function(){
				
			}
		});
		$('#paramForm').bind('formIsValid', function(event, form) {
		}).ketchup({bindElement:"easyDialogYesBtn"});
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
			$('#paramForm').bind('formIsValid', function(event, form) {
				var isset = false;
				$.each(offer.offerSpec.offerSpecParams,function(){
					var itemInfo = CacheData.getOfferParam(prodId,offer.offerId,this.itemSpecId);
					itemInfo.setValue = $("#"+prodId+"_"+this.itemSpecId).val();	
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
			$('#paramForm').bind('formIsValid', function(event, form){
				if(!!spec.offerSpecParams){
					for (var i = 0; i < spec.offerSpecParams.length; i++) {
						var param = spec.offerSpecParams[i];
						var itemSpec = CacheData.getSpecParam(prodId,offerSpecId,param.itemSpecId);
						itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
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
//				easyDialog.open({
//					container : "div_group_dialog_set"
//				});
//				$("#delPhoneNumber .btna_o:last").click(function(){
//					_closeDialog();
//				});
				ec.form.dialog.createDialog({
					"id":"-group",
					"width":320,
					"height":120,
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
//				easyDialog.open({
//					container : "div_group_dialog_set"
//				});
//				$("#delPhoneNumber .btna_o:last").click(function(){
//					_closeDialog();
//				});
				ec.form.dialog.createDialog({
					"id":"-group",
					"width":320,
					"height":120,
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
	
	var _closeDialog = function() {
		if(AttachOffer.dialogForm!=undefined&&AttachOffer.dialog!=undefined){
			AttachOffer.dialogForm.close(AttachOffer.dialog);
		}
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
								$li.append($dd).append($span).appendTo($ul);
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
							var feeType=AttachOffer.obtainFeeType();
							$.each(data.result.offerSpecList,function(){
								var offerSpecId = this.offerSpecId;
								var flag = true;
								$.each(offerList,function(){
									if(this.offerSpecId==offerSpecId&&this.isDel!="C"){
										flag = false;
										return false;
									}
								});
								$.each(offerSpecList,function(){
									if(this.offerSpecId==offerSpecId){
										flag = false;
										return false;
									}
								});
								if(ec.util.isObj(feeType)){
									if(!AttachOffer.isEqualsFeeType(feeType,this.feeTypeCd)){
										flag = false;
									}
								}
								if(flag){
									var $li = $('<li id="li_'+prodId+'_'+this.offerSpecId+'"></li>');
									var $dd = $('<dd class="canchoose" onclick="AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')"></dd>');
									var $span = $('<span><a href="javascript:AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')" >'+this.offerSpecName+'</a></span>');
									$li.append($dd).append($span).appendTo($ul);
								}
							});
						}
					}
					$("#div_"+prodId).append($ul);
				});
			}
		}
	};
	
	//开通跟取消开通功能产品时判断是否显示跟隐藏补换卡
	var _showHideUim = function(flag,prodId,servSpecId){
		if(CONST.getAppDesc()==0 && servSpecId == CONST.PROD_SPEC.PROD_FUN_4G){ //4G系统并且是开通或者关闭4g功能产品
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			if(OrderInfo.actionFlag==2){//套餐变更
				prodClass = CacheData.getOfferMember(prodId).prodClass;
			}
			if(flag==0){ //开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡需要补卡
					$("#uimDiv_"+prodId).show();
				}
			}else if(flag==1){//取消开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡，已经显示补卡,判断是否隐藏补卡
					$("#uimDiv_"+prodId).hide();
				}
			}
		}
	};
	
	//判断是否需要补卡
	var _isChangeUim = function(objId){
		if(CONST.getAppDesc()==0){
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			var prodId = order.prodModify.choosedProdInfo.prodInstId;
			if(OrderInfo.actionFlag==2){//套餐变更
				var member = CacheData.getOfferMember(objId);
				prodClass = member.prodClass;
				prodId = member.objInstId;
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
					SoOrder.createAttOffer(spec,open.prodId,0,busiOrders);
				}
			}
		}
		//遍历已订购附属销售品列表
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			for ( var j = 0; j < opened.offerList.length; j++) {  //遍历当前产品下面的附属销售品
				var offer = opened.offerList[j];
				if(offer.isdel == "Y"){  //退订的附属销售品
					SoOrder.createAttOffer(offer,opened.prodId,1,busiOrders);
				}else {
					if(offer.update=="Y"){  //修改附属销售品
						SoOrder.createAttOffer(offer,opened.prodId,2,busiOrders);
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
	
	/**
	 * 获取付费类型(获取主数据的付费类型)
	 * <!-- 备注：此处付费类型的顺序不能随便变动，如需变动，请把order-product.html里面的付费类型的顺序改成跟这个一致！！ -->
	 */
	var _getFeeType=function(feeType){
		if(feeType==1200||feeType==1201||feeType==1202||feeType==2100){
			return feeType;
		}else if(feeType=="4101" || feeType=="4102" || feeType=="4103" || feeType=="4104" || feeType=="4105" || feeType=="4106" || feeType=="4107"){
			return "1202";//准预付费实时信控
		}else if(feeType=="3100" || feeType=="3101" || feeType=="3103" || feeType=="4102" || feeType=="4104" || feeType=="4105" || feeType=="4107"){
			return "2100";//预付费
		}else if(feeType=="3100" || feeType=="3102" || feeType=="3103" || feeType=="4101" || feeType=="4104" || feeType=="4106" || feeType=="4107"){
			return "1200";//后付费
		}else if(feeType=="3101" || feeType=="3102" || feeType=="3103" || feeType=="4103" || feeType=="4105" || feeType=="4106" || feeType=="4107"){
			return "1201";//准实时预付费
		}else{
			return "";
		}
	};
	
	/**
	 * 根据不同的场景获取不同的付费类型
	 */
	var _obtainFeeType=function(){
		var feeType="";
		if(ec.util.isObj(OrderInfo.offerSpec.feeType) && (OrderInfo.actionFlag==1 || OrderInfo.actionFlag==14)){
			feeType=AttachOffer.getFeeType(OrderInfo.offerSpec.feeType);//主套餐的付费类型,新装时候 付费类型单一 就不进行过滤
		}else if(OrderInfo.actionFlag==6 || OrderInfo.actionFlag==3){
			feeType=order.prodModify.choosedProdInfo.feeType;//副卡加装，由于副卡的付费类型和主卡必须一样，故取主卡的付费类型
		}else if(OrderInfo.actionFlag==2){
			if(offerChange.isChangeFeeType){
				feeType=OrderInfo.offerSpec.feeType;
			}else{
				feeType=order.prodModify.choosedProdInfo.feeType;
			}
		}
		
		return feeType;
	};
	
	/**
	 * 判断主销售品和可选包的付费类型是否一样
	 */
	var _isEqualsFeeType=function(feeTypeMain,feeType){
		var is_same_feeType=false;
		if(feeTypeMain=="2100" && (feeType=="2100"||feeType=="3100"||feeType=="3101"||feeType=="3103"||feeType=="4102"||feeType=="4104"||feeType=="4105"||feeType=="4107")){
			is_same_feeType=true;
		}else if(feeTypeMain=="1200" && (feeType=="1200"||feeType=="3100"||feeType=="3102"||feeType=="3103"||feeType=="4101"||feeType=="4104"||feeType=="4106"||feeType=="4107")){
			is_same_feeType=true;
		}else if(feeTypeMain=="1201" && (feeType=="1201"||feeType=="3101"||feeType=="3102"||feeType=="3103"||feeType=="4103"||feeType=="4105"||feeType=="4106"||feeType=="4107")){
			is_same_feeType=true;
		}else if(feeTypeMain=="1202" && (feeType=="1202"||feeType=="4101"||feeType=="4102"||feeType=="4103"||feeType=="4104"||feeType=="4105"||feeType=="4106"||feeType=="4107")){
			is_same_feeType=true;
		}
		return is_same_feeType;
	};
	
	/**
	 * 根据付费类型过滤附属销售品并展示
	 */
	var _showOfferSpecByFeeType=function(obj){
		if(OrderInfo.actionFlag==2){//套餐变更
			$.each(AttachOffer.labelList,function(){
				var prodId=this.prodId;
				$.each(this.labels,function(){
					var $ul = $("#ul_"+prodId+"_"+this.label); //创建ul
					if($ul!=undefined&&this.label!=CONST.LABEL.SERV){
						$ul.remove();
					}
				});
			});
			AttachOffer.openList=[];//清空
			var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
			//遍历主销售品构成
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(ec.util.isArray(this.prodInsts)){
					$.each(this.prodInsts,function(){
						var prodId = this.prodInstId;
						var param = {
							areaId : OrderInfo.getProdAreaId(prodId),
							channelId : OrderInfo.staff.channelId,
							staffId : OrderInfo.staff.staffId,
						    prodId : prodId,
						    prodSpecId : this.objId,
						    offerSpecId : prodInfo.prodOfferId,
						    offerRoleId : this.offerRoleId,
						    acctNbr : this.accessNumber
						};
						$("#open_ul_"+prodId+" li").remove();
						//如果objId，objType，objType不为空才可以查询默认必须
						if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
							param.queryType = "2";
							param.objId = this.objId;
							param.objType = this.objType;
							param.memberRoleCd = this.roleCd;
							param.offerSpecId=OrderInfo.offerSpec.offerSpecId;
							//默认必须可选包
							var data = query.offer.queryDefMustOfferSpec(param);
							CacheData.parseOffer(data);
						}
						AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
					});
				}
			});
			$("#dealerTbody tr").remove();
			order.dealer.initDealer(); //初始化发展人
			return;
		}
		//新装
		$.each(AttachOffer.labelList,function(){
			var prodId=this.prodId;
			var selectFeetype=$(obj).val();
			OrderInfo.offerSpec.feeType=selectFeetype;//当前的付费类型
			var offerSpecList = CacheData.getOfferSpecList(prodId);//过滤已选择
			$.each(offerSpecList,function(){
				var feeTypeCd=ec.util.isObj(this.feeType)?this.feeType:this.feeTypeCd;
				if(!ec.util.isObj(feeTypeCd)){
					return true;
				}
				if(this.isdel!="C"){
					if(!AttachOffer.isEqualsFeeType(selectFeetype,feeTypeCd)){
						$("#li_"+prodId+'_'+this.offerSpecId).hide();	
						this.isdel="Y";
					}else{
						$("#li_"+prodId+'_'+this.offerSpecId).show();	
						this.isdel="N";
					}
				}
			});
			$.each(this.labels,function(){
				var $ul = $("#ul_"+prodId+"_"+this.label); //创建ul
				if($ul!=undefined&&this.label!=CONST.LABEL.SERV){
					$ul.remove();
				}
			});
		});
		//遍历主销售品构成
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(ec.util.isArray(this.prodInsts)){
				$.each(this.prodInsts,function(){
					var prodId = this.prodInstId;
					AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
				});
			}
		});
		$("#dealerTbody tr").remove();
		order.dealer.initDealer(); //初始化发展人
	};
	
	//已选群功能产品确定按钮
	var _groupOkBtn=function(prodId,servSpecId){
		var spec = CacheData.getServSpec(prodId,servSpecId);
		var flag=true;
		if(!!spec.prodSpecParams){
			for (var i = 0; i < spec.prodSpecParams.length; i++) {
				var param = spec.prodSpecParams[i];
				var itemSpec = CacheData.getServSpecParam(prodId,servSpecId,param.itemSpecId);
				itemSpec.setValue = $("#"+prodId+"_"+servSpecId+"_"+param.itemSpecId).val();
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
//			easyDialog.close();
			_closeDialog();
		}
	};
	
	//已订购群功能产品确定按钮
	var _groupInistOkBtn=function(prodId,servSpecId){
		var serv = CacheData.getServBySpecId(prodId,servSpecId);
		var isset = false;
//		var flag=true;
		$.each(serv.prodSpecParams,function(){
			var prodItem = CacheData.getServInstParam(prodId,serv.servId,this.itemSpecId);
			prodItem.setValue = $("#"+prodId+"_"+servSpecId+"_"+this.itemSpecId).val();	
//			if(!ec.util.isObj(prodItem.setValue)){
//				$.alert("信息提示",prodItem.name+"不能为空");
//				flag=false;
//				return false;
//			}
			if(prodItem.value!=prodItem.setValue){
				prodItem.isUpdate = "Y";
				isset = true;
			}
		});
//		if(flag){
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
//		}
	};
	
	//判断是否可以关闭该功能产品
	var _canCloseServ=function(prodId,servId){
		var serv = CacheData.getServ(prodId,servId);
		if(OrderInfo.isGroupProSpecId(serv.servSpecId)){
			var offerSpecId=CONST.getGroupServOfferMap(serv.servSpecId);//功能产品对应的销售品
			var offer=CacheData.getOfferBySpecId(prodId,offerSpecId);
			if(ec.util.isObj(offer)){
				if(offer.isdel!="Y"&&offer.isdel!="C"){
					$.alert("信息提示","要关闭【"+serv.servSpecName+"】功能产品，请先退订【"+offer.offerSpecName+"】可选包");
					return true;
				}
			}else {
				var offerSpec=CacheData.getOfferSpec(prodId,offerSpecId);
				if(ec.util.isObj(offerSpec)&&offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
					$.alert("信息提示","要关闭【"+serv.servSpecName+"】功能产品，请先退订【"+offerSpec.offerSpecName+"】可选包");
					return true;
				}
			}
//		}else if(serv.servSpecId==CONST.PROD_SPEC_ID.LITTLE_PAY){
//			var offer=CacheData.getOfferBySpecId(prodId,CONST.OFFER_SPEC_ID.LITTLE_PAY);
//			if(ec.util.isObj(offer)){
//				if(offer.isdel!="Y"&&offer.isdel!="C"){
//					$.alert("信息提示","要关闭【"+serv.servSpecName+"】功能产品，请先退订【"+offer.offerSpecName+"】可选包");
//					return true;
//				}
//			}else {
//				var offerSpec=CacheData.getOfferSpec(prodId,CONST.OFFER_SPEC_ID.LITTLE_PAY);
//				if(ec.util.isObj(offerSpec)&&offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
//					$.alert("信息提示","要关闭【"+serv.servSpecName+"】功能产品，请先退订【"+offerSpec.offerSpecName+"】可选包");
//					return true;
//				}
//			}
		}
		return false;
	};
	
	return {
		addOffer 				: _addOffer,
		addOfferSpec 			: _addOfferSpec,
		addOpenList				: _addOpenList,
		addOpenServList			: _addOpenServList,
		addOfferSpecByCheck		: _addOfferSpecByCheck,
		closeAttachSearch 		: _closeAttachSearch,
		changeLabel				: _changeLabel,
		closeServ				: _closeServ,
		closeServSpec			: _closeServSpec,
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
		getFeeType				: _getFeeType,
		isEqualsFeeType			: _isEqualsFeeType,
		showOfferSpecByFeeType	: _showOfferSpecByFeeType,
		obtainFeeType			: _obtainFeeType
	};
})();
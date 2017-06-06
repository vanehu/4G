/**
 * 附属销售品受理对象,查询可订购和已选择可选包等入口
 * 
 * @author yanghm
 */
CommonUtils.regNamespace("AttachOffer"); 

/** 附属销售品受理对象*/
AttachOffer = (function() {

	var _openList = []; //保存已经选择的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openedList = []; //已经订购的附属销售品列表，保存附属销售品完整节点，以及参数值
	
	var _openServList = []; //保存已经选择功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openedServList = []; //保存已经订购功能产品列表，保存附属销售品完整节点，以及参数值
	
	var _openAppList = []; //保存产品下增值业务
	
	var _changeList = []; //3g订购4g流量包订单提交预校验时，保存修改缓存列表的修改数据，用于订单确认页面返回的反向操作
	
	var _labelList = []; //标签列表
	
	var totalNums=0;//记录总共添加了多少个终端输入框
	
	var _newViceParam = [];//用来保存副卡拆装新套餐的信息
	
	var _orderedOfferSpecIds = [];//已订购销售品规格
	
	var _servSpecIds = [];//已订购功能产品规格
	
	var _servSpecs = [];
	
	var _offerSpecs = [];
	
	var _offerSpecIds=[];//保存已选择可选包id
	
	var _addTerminal;//是否添加终端串码
	var _terminalDiv = "";
	var _addTerminalList = [];//添加终端串码页面
	
	//新增我的收藏
	var _myFavoriteList = [];//保存我已收藏的销售品
	
	var _myFavoriteOfferList = [];//保存我已收藏的主套餐
	
	var prodSpecId = "";
	var labelId = "";
	var _broadFlag=false; //是否宽带续约标志
	
	var _hasYzfTd=false;//二次业务是否已提示翼支付退订
	
	
	//初始化附属销售页面
	var _init = function(){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 3;
		OrderInfo.busitypeflag=14;
		query.offer.setOffer(function(){
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
				if(!product.uim.setProdUim()){ //根据UIM类型，设置产品是3G还是4G，并且保存旧卡
					return;	
				}
			}
			if(AttachOffer.broadFlag){//宽带续约包分支
				AttachOffer.queryAttachOffer2();
				//_changeLabel(prodInfo.prodInstId,prodInfo.productId,1);
			}else{//可选包变更，保持不变
				AttachOffer.queryAttachOffer();
			}	
			
			_orderedOfferSpecIds = [];//已订购销售品规格
		
		 	_servSpecIds = [];//已订购功能产品规格
		
			_servSpecs = [];
		
		 	_offerSpecs = [];
		});
//		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
//			return ;
//		}
		
	}; 
	
	//可订购的附属查询 
	var _queryAttachOfferSpec = function(param) {
		query.offer.queryAttachSpec(param,function(data){
			if (data) {
				query.offer.loadInst(); //加载实例到缓存
				//主套餐已选择和可订购可选包等展示
				if(OrderInfo.actionFlag==6){//加装副卡
					var id=-(param.prodId);
					$("#attachSecondary"+id).html(data);
					$("#cardNameSpan_"+param.prodId).html("副卡");
				}else{
					if(param.prodId=="-1"){//主卡促销滚动tab
						$("#attachMain").html(data);
						$("#cardNameSpan_"+param.prodId).html("主卡");
					}else{
						var id=-(param.prodId+1);
						$("#attachSecondary"+id).html(data);
						$("#cardNameSpan_"+param.prodId).html("副卡");
					}
				}				
				_showMainRoleProd(param.prodId); //展示必须功能产品或可选包
				//展示主套餐名称和是否有点参
				var spec = OrderInfo.offerSpec;
				$("#mainOfferName_"+param.prodId).html(spec.offerSpecName);
				if(OrderInfo.actionFlag!=6){//非新增副卡
					if(spec.ifParams&&spec.offerSpecParams!=null&&spec.offerSpecParams.length>0){  //销售参数节点					
						$("#mainOfferLi_-1").append('<button class="list-can absolute-right" onclick="AttachOffer.showMainParam()">参</button>');					
					}
				}
				if(OrderInfo.actionFlag==1){
					//为主套餐属性自动设置服务参数
					if(CacheData.setParam(-1,OrderInfo.offerSpec)){ 
					}
				}
				var phoneNum=OrderInfo.getAccessNumber(param.prodId);
				$("#phoneNumSpan_"+param.prodId).html(phoneNum);
				_initMyfavoriteSpec(param.prodId,1,0); //初始化第一个标签附属
				if(OrderInfo.actionFlag==112){//套餐入口选完套餐跳往选号
					$("#nav-tab-2").removeClass("active in");
			    	$("#nav-tab-3").addClass("active in");
			    	$("#tab2_li").removeClass("active");
			    	$("#tab3_li").addClass("active");
			    	$("#fk").removeClass("active");
					$("#cx").addClass("active");
					OrderInfo.order.step = 3;
//					$("#cx").click();
				}else if(OrderInfo.actionFlag==14){//合约购机
					if(param.prodId==-1){ //合约计划特殊处理
						AttachOffer.addOpenList(param.prodId,order.phone.offerSpecId);
					}
					//套餐副卡tab隐藏，促销tab显示
					 OrderInfo.order.step = 5;
					 $("#nav-tab-4").removeClass("active in");
			    	 $("#nav-tab-5").addClass("active in");
			    	 $("#tab4_li").removeClass("active");
			    	 $("#tab5_li").addClass("active");
				}else if(OrderInfo.actionFlag==6){//加装副卡
					OrderInfo.order.step = 2;
					 $("#nav-tab-1").removeClass("active in");
			    	 $("#nav-tab-2").addClass("active in");
			    	 $("#tab1_li").removeClass("active");
			    	 $("#tab2_li").addClass("active");
				}else if(order.service.enter=="3"){//选号入口选完套餐跳往副卡或促销
					//套餐副卡tab隐藏，促销tab显示
					 $("#nav-tab-2").removeClass("active in");
					 $("#nav-tab-3").removeClass("active in");
			    	 $("#nav-tab-4").addClass("active in");
			    	 $("#tab2_li").removeClass("active");
			    	 $("#tab3_li").removeClass("active");
			    	 $("#tab4_li").addClass("active");
				}else if(order.service.enter=="1"){//套餐入口选完套餐跳往副卡或促销
					 $("#nav-tab-2").removeClass("active in");
					 $("#nav-tab-3").removeClass("active in");
			    	 $("#nav-tab-4").addClass("active in");
			    	 $("#tab2_li").removeClass("active");
			    	 $("#tab3_li").removeClass("active");
			    	 $("#tab4_li").addClass("active");
				}
				 setTimeout(function () { 
					 var yzfFlag = $("#yzfFlag_" + param.prodId + "_"+CONST.YZFservSpecId1).val();
					 if(yzfFlag && yzfFlag == "1" && !cust.isCovCust(OrderInfo.cust.identityCd) &&!cust.isRealCust){
							if(parseInt(param.prodId) == -1){//主卡必做校验
								$.alert("提示","当前用户证件类型不符合实名规范，无开通翼支付及其相关功能产品权限，已自动退订！")
								AttachOffer.closeServSpec(param.prodId,CONST.YZFservSpecId1,'翼支付','N');
							} else if(parseInt(param.prodId) != -1){//副卡在使用人开关关闭时进行校验
								AttachOffer.closeServSpec(param.prodId,CONST.YZFservSpecId1,'翼支付','N');
							}
						} 
					 $("#yzfFlag_" + param.prodId + "_"+CONST.YZFservSpecId1).val("2")
				    },800);
			}
		});
	};
	
	//可选包入口展示我的收藏（初始化）
	var _initMyfavoriteSpec = function(prodId,isFavorate,first){		
		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var offerSpec = OrderInfo.offerSpec; //获取产品信息	
        if(offerSpec.offerRoles != undefined  && offerSpec.offerRoles[0].prodInsts != undefined){
        	var prodInsts = offerSpec.offerRoles[0].prodInsts;
        	if(prodId != -1){
        		prodInsts = offerSpec.offerRoles[1].prodInsts;
        	}
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
        if(OrderInfo.actionFlag==6){//加装副卡入参
        	$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
    			var offerRole = this;
    			for ( var i = 0; i < this.prodInsts.length; i++) {
    				var prodInst = this.prodInsts[i];
        			if(prodInst.prodInstId == prodId){
        				param.prodSpecId = prodInst.objId;
        				param.offerRoleId = prodInst.offerRoleId;
        				param.prodId = prodInst.prodInstId;
        				param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
        			}
    			}
        	});
        }
		var data = query.offer.queryMyfavorite(param);
		//清空缓存中的收藏夹
		AttachOffer.myFavoriteList = [];
		var $ul = $("#canChooseUl_"+prodId);	
		$("#canChooseUl_"+prodId).children("li:gt(0)").remove();//移除可选促销节点
		$ul.empty();
//		$("#canChooseUl_"+prodId).children().remove();//先清空再追加
//		var li='<li>';
//		li+='<div class="choice-box border-top-none">';
//		li+='<i class="iconfont pull-left">&#xe66c;</i><input placeholder="我的收藏/请输入查询条件" class="choice-input"><i class="iconfont pull-right absolute-right  open-list">&#xe66e;</i><i class="iconfont pull-right font-orange absolute-right m-r-40">&#xe647;</i></div></li>';
//		$ul.html(li);
		if(data!=undefined && data.resultCode == "0"){
			var html = '';
			var i = 0;
			if(ec.util.isArray(data.result.offerSpecList)){
				var isFavorite = true;
				
				var offerList = CacheData.getOfferList(prodId); //过滤已订购
				var offerSpecList = CacheData.getOfferSpecList(prodId);//过滤已选择
				$.each(data.result.offerSpecList,function(){
					
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
							html='<li id="_li_'+ prodId + '_'+ this.offerSpecId  +'" ><i class="iconfont pull-left active" onclick="AttachOffer.delMyfavoriteSpec('+prodId+',\''+'\','+this.offerSpecId+',\''+this.offerSpecName+'\',$(this)'+','+1+');">&#xe62b;</i>';
							html+='<span class="list-title">'+ this.offerSpecName +'</span>';
							html+='<div class="list-checkbox absolute-right"><div class="checkbox-box">';
							html+='<input type="checkbox" value="1" name="" id="input_'+ prodId + '_'+ this.offerSpecId  +'" onclick="javascript:{common.setBtnTimer(this);AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+');}"><label for="input_'+ prodId + '_'+ this.offerSpecId  +'" checked="checked" ></label></input></div></div>';
							//html+='<h5 class="list-group-item-heading" style="padding-left: 40px;" onclick="AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+')">'+ this.offerSpecName +'</h5>';
							html+='</li>';
							i++;
							$ul.append(html);
					}
				});
			}
			if(i==0){
				var html1 = '';
				html1+='<a href="javascript:void(0);" class="list-group-item"><span>没有收藏的销售品</span></a>';
				$ul.append(html1);
			} else {
			}
		}	
	};
	
	//收藏销售品到我的收藏里
	var _addMyfavoriteSpec = function(prodId,offerSpecId,offerSpecName,obj){
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
					$(obj).addClass("active");
					$(obj).attr("onclick","AttachOffer.delMyfavoriteSpec("+prodId+',\''+'\','+offerSpecId+',\''+offerSpecName+'\',$(this)'+");");
				},
				no:function(){
				}
			});
		}else{
			$.alert("提示","该销售品已收藏");
		}
	};
	
	
	//已订购的附属销售品查询
	var _queryAttachOffer = function() {
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var prodId = prodInfo.prodInstId;
		var param = {
		    prodId : prodId,
		    prodSpecId : prodInfo.productId,
		    offerSpecId : prodInfo.prodOfferId,
		    acctNbr : prodInfo.accNbr,
		    newFlag : 1
		};
		if(ec.util.isObj(prodInfo.prodBigClass)){
			param.prodBigClass = prodInfo.prodBigClass;
		}
		query.offer.queryAttachOfferHtml(param,function(data){
			SoOrder.initFillPage();
			$("#nav-tab-3").addClass("active in");
			$("#tab2_li").addClass("active");
			$("#order-content").html(data).show();
			OrderInfo.order.step=1;
			$("#fillNextStep").off("click").on("click",function(){
				if(!SoOrder.checkData()){ //校验通过
					return false;
				}
				$("#nav-tab-3").removeClass("active in");
				$("#nav-tab-4").addClass("active in");
				$("#tab2_li").removeClass("active");
				$("#tab3_li").addClass("active");
				order.dealer.initDealer();
				OrderInfo.order.step=3;
			});
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
				CacheData.parseOffer(data,prodId);
				//默认必须功能产品
				var data = query.offer.queryServSpec(param,prodId);
				CacheData.parseServ(data);
			}
			if(ec.util.isArray(OrderInfo.offerSpec.offerRoles)){ //主套餐下的成员判断
				var member = CacheData.getOfferMember(prodId);
				$.each(OrderInfo.offerSpec.offerRoles,function(){
					if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
						$.each(this.roleObjs,function(){
							if(this.objType==CONST.OBJ_TYPE.SERV){
								var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									var $oldLi = $('#li_'+prodId+'_'+serv.servId);
									if(this.minQty==1){
										$oldLi.removeAttr("onclick");
										var $span = $("#span_"+prodId+"_"+serv.servId);
										var $span_remove = $("#input_"+prodId+"_"+serv.servId);
										if(ec.util.isObj($span)){
											$span.removeClass("delete");
										}
										if(ec.util.isObj($span_remove)){
											$span_remove.hide();
										}
									}
//									$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
								}
							}
						});
						return false;
					}
				});
			}
			setTimeout(function () { 
				_checkYZFRight(prodId);
			}, 300);
//			AttachOffer.changeLabel(prodId, prodInfo.productId,""); //初始化第一个标签附属
			order.dealer.initDealer();
		});
	};
	//检测是否有开通翼支付功能权限－－二次业务
	var _checkYZFRight = function(prodId){
		var yzfFlag = $("#yzfFlag_" + prodId + "_"+CONST.YZFservSpecId1).val();
		if(yzfFlag && yzfFlag == "1"){
			var servId = $("#yzfFlag_" + prodId + "_"+CONST.YZFservSpecId1).attr("servId");
			if(!cust.isRealCust){
				if(!AttachOffer.hasYzfTd){//为提示过退订
					if(cust.isCovCust(OrderInfo.cust.identityCd) && OrderInfo.cust.userIdentityCd==undefined){
						$.alert("提示","当前政企客户未获取到使用人证件信息，不符合实名规范，无开通翼支付及其相关功能产品权限，已自动退订！")
					} else {
						$.alert("提示","当前用户证件类型不符合实名规范，无开通翼支付及其相关功能产品权限，已自动退订！")
					}
					AttachOffer.hasYzfTd=true;
				}
				AttachOffer.closeServ(prodId,servId);
			}
		}
		$("#yzfFlag_" + prodId + "_"+CONST.YZFservSpecId1).val("2")
	}
	
	var _delMyfavoriteSpec = function (prodId,prodSpecId,offerSpecId,offerSpecName,obj,isFavorite){
		if(prodSpecId==""){
			prodSpecId = OrderInfo.getProdSpecId(prodId);
		}
		var param = {   
				offerSpecId : offerSpecId
		};
		var content = '取消收藏【'+offerSpecName+'】' ;
		$.confirm("信息确认",content,{ 
			yes:function(){
				query.offer.delMyfavorite(param);
			},
			yesdo:function(){
				if(isFavorite == undefined || isFavorite==0){
					$(obj).removeClass("active");
					$(obj).attr("onclick","AttachOffer.addMyfavoriteSpec("+prodId+','+offerSpecId+',\''+offerSpecName+'\',$(this)'+");");
			
//					_initMyfavoriteSpec(prodId,0);
				} else {
					$(obj).removeClass("active");
					$(obj).attr("onclick","AttachOffer.addMyfavoriteSpec("+prodId+','+offerSpecId+',\''+offerSpecName+'\',$(this)'+");");
			
					_initMyfavoriteSpec(prodId,1);
				}
				
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
	
	//设置附属销售品节点
	var _setAttachBusiOrder = function(busiOrders){
		//遍历已选功能产品列表
		$.each(AttachOffer.openServList,function(){
			var prodId = this.prodId;
			var accNbr = OrderInfo.getAccessNumber(prodId);
			if(accNbr != ""){
				$.each(this.servSpecList,function(){
					if(this.isdel != "Y" && this.isdel != "C"){  //订购的功能产品
						SoOrder.createServ(this,prodId,0,busiOrders);
					}
				});
			}
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
				var prodId = open.prodId;
				var accNbr = OrderInfo.getAccessNumber(prodId);
				if(accNbr != ""){
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
	
	//订购附属销售品
	var _addOfferSpec = function(prodId,offerSpecId){
		$("#input_"+prodId+"_"+offerSpecId).attr("checked","checked");
		var newSpec = _setSpec(prodId,offerSpecId);
		if(newSpec==undefined){ //没有在已开通附属销售列表中
			return;
		}
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(offer != undefined && offer.ifDueOrderAgain != "Y"){//如果是合约，则跳过，执行下面代码
			var tipsContent = "您已订购 '"+newSpec.offerSpecName+"' 销售品 "+offer.counts+" 次，请确认是否继续订购";
			$.confirm("信息确认",tipsContent,{ 
				yes:function(){
				},
				yesdo:function(){
				    _addOfferSpecFunction(prodId,newSpec);
			    },
				no:function(){
				}
			});
		}else{
			_addOfferSpecFunction(prodId,newSpec);
		}
		
	};
	
	var _addOfferSpecFunction = function(prodId,newSpec){
		var content = CacheData.getOfferProdStr(prodId,newSpec,0);
		$.confirm("信息确认",content,{ 
			yes:function(){
				CacheData.setServForOfferSpec(prodId,newSpec);//把选中促销保存到销售品规格中
			},
			yesdo:function(){
				_checkOfferExcludeDepend(prodId,newSpec);
				
			},
			no:function(){
				$("#input_"+prodId+"_"+newSpec.offerSpecId).removeAttr("checked");
			}
		});
	};
	
	//添加可选包到缓存列表
	var _addAttachSpec = function(prodId,offerSpecId){
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
	
	//校验销售品的互斥依赖
	var _checkOfferExcludeDepend = function(prodId,offerSpec){
		var offerSpecId = offerSpec.offerSpecId;
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpec.offerSpecName); //解析数据
			if(OrderInfo.actionFlag==201){//橙分期
				//打开实名认证窗口
				$("#real_name").modal("show");
			}
		}else if(OrderInfo.actionFlag==201){//橙分期
			//打开实名认证窗口
			$("#real_name").modal("show");
		}
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
				},
				optDependOffer : []
		};
		if(result!=""){
			var exclude = result.offerSpec.exclude;
			var depend = result.offerSpec.depend;
			var defaultOffer=result.offerSpec.defaultList;
			var optDependOffer = result.offerSpec.optDependList;
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
									content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+ '<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+ '<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
								}
							}else{
								var offerSpec=CacheData.getOfferBySpecId(prodId,subOfferSpec.offerSpecId);
								if(ec.util.isObj(offerSpec)){
									if(offerSpec.isdel!="Y"&&offerSpec.isdel!="C"){
										content += '<input id="'+subOfferSpec.offerSpecId+'" checked="checked" disabled="disabled" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+ '<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
									}else{
										content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+'<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
									}
								}else{
									content += '<input id="'+subOfferSpec.offerSpecId+'" type="checkbox" name="'+offerGrpInfo.grpId+'" value="'+subOfferSpec.offerSpecId+'">'+ '<label for='+subOfferSpec.offerSpecId+'>'+ subOfferSpec.offerSpecName +'</label></input><br>';
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
			if (optDependOffer != undefined && ec.util.isArray(optDependOffer)) {
				for (var i = 0; i < optDependOffer.length; i++) {
					content += "可选订购：" + '<input id="'+optDependOffer[i].offerSpecId+'" type="checkbox" value="'+optDependOffer[i].offerSpecId+'"/>' + optDependOffer[i].offerSpecName + "<br>";
					param.optDependOffer.push(optDependOffer[i].offerSpecId);
				}
			}
		}
		var serContent=_servExDepReByRoleObjs(prodId,offerSpecId);//查询销售品构成成员的依赖互斥以及连带
		content=content+serContent;
		if(content==""){ //没有互斥依赖
			AttachOffer.addOpenList(prodId,offerSpecId); 
		}else{	
			content = "<div style='max-height:300px;overflow:auto;'>" + content + "</div>";
			$.unecOverlay();
			$.confirm("订购： " + specName,content,{ 
				yes:function(){
					CacheData.setOffer2ExcludeOfferSpec(param);
					if(specName.indexOf("合约计划")>=0){
						mktRes.terminal.hytcmc = specName;
						mktRes.terminal.hytcid = offerSpecId;
					}
				},
				yesdo:function(){
					excludeAddattch(prodId,offerSpecId,param);
					excludeAddServ(prodId,"",paramObj);
				},
				no:function(){
					$("#input_"+prodId+"_"+offerSpecId).removeAttr("checked");
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
//					$("#li_"+prodId+"_"+excludeServSpecId).remove();
					var $span = $("#li_"+prodId+"_"+excludeServSpecId).find("span");
					$("#input_"+prodId+"_"+excludeServSpecId).removeAttr("checked");
					$span.addClass("delete");
					spec.isdel = "Y";
				}else{
					var serv = CacheData.getServBySpecId(prodId,excludeServSpecId);
					if(serv!=undefined){
//						$("#li_"+prodId+"_"+serv.servId).remove();
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.addClass("delete");
						$("#input_"+prodId+"_"+serv.servId).removeAttr("checked");
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
					$("#input_"+prodId+"_"+specId).removeAttr("checked");
					$.alert("提示信息","依赖组至少选中"+offerGrpInfo.minQty+"个！");
					return;
				}else if(len>offerGrpInfo.maxQty){
					$("#input_"+prodId+"_"+specId).removeAttr("checked");
					$.alert("提示信息","依赖组至多选中"+offerGrpInfo.maxQty+"个！");
					return;
				}else {
					$("#input_"+prodId+"_"+specId).removeAttr("checked");
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
//					$("#li_"+prodId+"_"+excludeSpecId).remove();
					var $span = $("#li_"+prodId+"_"+excludeSpecId).find("span");
					$span.addClass("delete");
					$("#input_"+prodId+"_"+excludeSpecId).removeAttr("checked");
					spec.isdel = "Y";
					$("#terminalUl_"+prodId+"_"+excludeSpecId).remove();
				}
				var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
				if(offer!=undefined){
//					$("#li_"+prodId+"_"+excludeSpecId).remove();
					var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
					$span.addClass("delete");
					$("#input_"+prodId+"_"+excludeSpecId).removeAttr("checked");
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
		
	};
	
	//关闭服务实例
	var _closeServ = function(prodId,servId,reflag){
		var serv = CacheData.getServ(prodId,servId);
		var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
		if($span.attr("class")=="list-title delete"){  //已经关闭，取消关闭
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
			if($("#input_"+prodId+"_"+servId).attr("servSpecId") !="" && $("#input_"+prodId+"_"+servId).attr("servSpecId") !=null){
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
				if(AttachOffer.openedServList.length>0){
					for(var n=0;n<AttachOffer.openedServList[0].servList.length;n++){
						var opendServ = AttachOffer.openedServList[0].servList[n];
						if(opendServ.isdel ==undefined || "Y"!= opendServ.isdel){
							_servSpecIds.push(opendServ.servSpecId);
						}
					}
				}
				respnose = AttachOffer.queryOfferAndServDependForCancel("",$("#input_"+prodId+"_"+servId).attr("servSpecId"));
			}
			
			if(reflag!=undefined && reflag=="reload"){//暂存单二次加载
				$span.addClass("del");
				serv.isdel = "Y";
				if(respnose !="" && respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec!=undefined ){
					_addOfferAndServDepend(respnose.data.result.servSpec,respnose.data.result.offerSpec,$("#input_"+prodId+"_"+servId).attr("servSpecId"),prodId);
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
				var yzfFlag = $("#yzfFlag_" + prodId + "_"+CONST.YZFservSpecId1).val();
				var servSpecId = $("#input_"+prodId+"_"+servId).attr("servSpecId");
				if(servSpecId == CONST.YZFservSpecId1 && yzfFlag == "1"){
					$span.addClass("delete");
					serv.isdel = "Y";
					$("#input_"+prodId+"_"+servId).removeAttr("checked");
					if(respnose !="" && respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec!=undefined ){
						_addOfferAndServDepend(respnose.data.result.servSpec,respnose.data.result.offerSpec,$("#input_"+prodId+"_"+servId).attr("servSpecId"),prodId);
					}
				} else{
					$.confirm("信息确认","关闭"+content,{ 
						yesdo:function(){
							$span.addClass("delete");
							serv.isdel = "Y";
							$("#input_"+prodId+"_"+servId).removeAttr("checked");
							if(respnose !="" && respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec!=undefined ){
								_addOfferAndServDepend(respnose.data.result.servSpec,respnose.data.result.offerSpec,$("#input_"+prodId+"_"+servId).attr("servSpecId"),prodId);
							}
						},
						no:function(){		
							$("#input_"+prodId+"_"+serv.servId).attr("checked","checked");
						}
					});
				}
				
			}
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
				for(var m=0;m<AttachOffer.openedServList.length;m++){
					var mproid = AttachOffer.openedServList[m].prodId;
			    	if(prodId == mproid){
			    		for(var j=0;j<AttachOffer.openedServList[m].servList.length;j++){
							var openedServ = AttachOffer.openedServList[m].servList[j];
							if(this.servSpecId == openedServ.servSpecId){
								openedServ.isdel = "Y";
								$("#li_"+prodId+"_"+openedServ.servId).find("span").addClass("delete");
								$("#input_"+prodId+"_"+openedServ.servId).removeAttr("checked");
							}
						}
			    	}
				}
				for(var l=0;l<AttachOffer.openServList.length;l++){
					var mproid = AttachOffer.openServList[l].prodId;
					if(prodId == mproid){
						for(var n=0;n<AttachOffer.openServList[l].servSpecList.length;n++){
							var opendServ = AttachOffer.openServList[l].servSpecList[n];
							if(this.servSpecId == opendServ.servSpecId){
								opendServ.isdel = "Y";
								$("#li_"+prodId+"_"+openedServ.servId).find("span").addClass("delete");
								$("#input_"+prodId+"_"+openedServ.servId).removeAttr("checked");
							}
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
								$("#li_"+prodId+"_"+openedServ.offerId).find("span").addClass("delete");
								$("#input_"+prodId+"_"+openedServ.offerId).removeAttr("checked");
							}
						}
					}
			});
			
		}
	};
	
	//开通功能产品
	var _openServ = function(prodId,serv){
		if(!_checkUser(prodId,serv.servSpecId)){
			$("#input_"+prodId+"_"+serv.servId).removeAttr("checked");
			$.alert("提示","当前客户证件类型无权限开通翼支付及其相关功能产品!");
			return;
		}
		$.confirm("信息确认","取消关闭【"+serv.servSpecName+"】功能产品",{ 
			yesdo:function(){
				if(serv!=undefined){   //在可订购功能产品里面 
					if(serv.servSpecId==""){
						var $span = $("#li_"+prodId+"_"+serv.servId).find("span");
						$span.removeClass("delete");
						$("#input_"+prodId+"_"+serv.servId).attr("checked","checked");
						serv.isdel = "N";
						var thisServSpecId =  $("#input_"+prodId+"_"+serv.servId).attr("servSpecId");
						_removeOfferAndServ(thisServSpecId,prodId);
					}else{
						_checkServExcludeDepend(prodId,serv);
					}
				}
			},
			no:function(){
				$("#input_"+prodId+"_"+serv.servId).removeAttr("checked");
			}
		});
	};

	var _removeOfferAndServ = function(thisServSpecId,prodId){
		//update by huangjj3  61419 取消关闭，把依赖的销售品从开通的去除
		for(var i=0;i<_servSpecs.length;i++){
			var servSpecs = _servSpecs[i];
			if(thisServSpecId == servSpecs.servSpecId){
				for(var j=0;j<servSpecs.servSpe.length;j++){
					var servSpe = servSpecs.servSpe[j];
					for(m=0;m<AttachOffer.openedServList.length;m++){
						var mproid = AttachOffer.openedServList[m].prodId;
				    	if(prodId == mproid){
				    		for(var n=0;n<AttachOffer.openedServList[m].servList.length;n++){
								var opendServ = AttachOffer.openedServList[m].servList[n];
								if(servSpe.servSpecId == opendServ.servSpecId){
									opendServ.isdel = "N";
									$("#li_"+prodId+"_"+opendServ.servId).find("span").removeClass("delete");
									$("#input_"+prodId+"_"+opendServ.servId).attr("checked","checked");
								}
						}
				    	}
					}
					for(m=0;m<AttachOffer.openServList.length;m++){
						var mproid = AttachOffer.openServList[m].prodId;
				    	if(prodId == mproid){
				    	   for(var n=0;n<AttachOffer.openServList[m].servSpecList.length;n++){
									var opendServ = AttachOffer.openServList[m].servSpecList[n];
									if(this.servSpecId == opendServ.servSpecId){
										opendServ.isdel = "Y";
								         	$("#li_"+prodId+"_"+opendServ.servSpecId).find("span").addClass("delete");
								         	$("#input_"+prodId+"_"+opendServ.servSpecId).removeAttr("checked");
									}
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
					for(m=0;m<AttachOffer.openedList.length;m++){
						var mproid = AttachOffer.openedList[m].prodId;
						if(prodId == mproid){
							for(var n=0;n<AttachOffer.openedList[m].offerList.length;n++){
								var opendServ = AttachOffer.openedList[m].offerList[n];
								if(offerSpe.offerId == opendServ.offerId){
									opendServ.isdel = "N";
									$("#li_"+prodId+"_"+opendServ.offerId).find("span").removeClass("delete");
									$("#input_"+prodId+"_"+opendServ.offerId).attr("checked","checked");
						 		}
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
	
	//促销页改变促销标签展示不同类型可订购促销
	var _changeShowAttachOffer=function(prodId,prodSpecId){
		var specType = $("#specType_"+prodId+" option:selected").val();//功能分类
		if(specType=="99999"){//查询我的收藏
			_initMyfavoriteSpec(prodId,1);
		}else if(specType=="10000"){//查询功能产品
			_initServSpec(prodId,prodSpecId,specType);
		}else{//查询可选包、流量包等其他促销标签
			_initCanBuyAttachSpec(prodId,prodSpecId,specType);
		}
		//查询可订购促销分类
		if(specType=="1"){//已选可选包展示		
			$("#haveChooseUl").find("span").html("已选择可选包");
			$("#haveChooseOfferDiv_"+prodId).show();
			$("#haveChooseServDiv_"+prodId).hide();
		}else if(specType=="10000"){//已选功能产品展示
			$("#haveChooseUl").find("span").html("已选择功能产品");
			$("#haveChooseServDiv_"+prodId).show();
			$("#haveChooseOfferDiv_"+prodId).hide();
		}else{
			$("#haveChooseUl").find("span").html("已选择促销");
			$("#haveChooseOfferDiv_"+prodId).show();
			$("#haveChooseServDiv_"+prodId).hide();
		}
	};
	
	//促销页面展示可订购功能产品
	var _initServSpec=function(prodId,prodSpecId,labelId){
		var queryType = "3";
		if(prodId>0){
			queryType = "";
		}
		var param = {
				prodId : prodId,
				prodSpecId : prodSpecId,
				queryType : queryType,
				labelId : labelId
			};
		var data = query.offer.queryServSpec(param);
		var $ul = $("#canChooseUl_"+prodId);
		$("#canChooseUl_"+prodId).children("li:gt(0)").remove();//移除可选促销节点
		$ul.empty();
		if(data!=undefined && data.resultCode == "0"){
			if(ec.util.isArray(data.result.servSpec)){
				var servList = CacheData.getServList(prodId);//过滤已订购
				var servSpecList = CacheData.getServSpecList(prodId);//过滤已选择
				var i=0;
				var html='';
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
						if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3){
							html='<div class="panel-heading m-b-5" id="_li_'+prodId +'_'+this.servSpecId +'"><i class="iconfont pull-left p-l-10">&#xe635;</i>';
							html+='<h3 class="panel-title"><a id="li_'+ prodId +'_'+ this.servSpecId + '" class="accordion-toggle accordion-toggle-styled border-none"  data-toggle="collapse" data-parent="#accordion" href="#collapse01">'+this.servSpecName+'</a>';
							html+='</h3><div class="list-checkbox absolute-right"><div class="checkbox-box">';
							html+='<input type="checkbox" value="1" name="" id="input_'+ prodId + '_'+ this.servSpecId  +'" onclick="javascript:{common.setBtnTimer(this);AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\');}"/><label for="input_'+prodId+'_'+this.servSpecId+'" ></label></div></div></div>';
							$ul.append(html);
							i++;
						} else {
							var newSpec = _setMyfavoriteSpec(prodId,this.servSpecId);
							if(newSpec==undefined){
								html='<li id="_li_'+ prodId + '_'+ this.servSpecId  +'" >';
							} else {
								html='<li id="_li_'+ prodId + '_'+ this.servSpecId  +'" >';
							}
							html+='<span class="list-title">'+ this.servSpecName +'</span>';
							html+='<div class="list-checkbox absolute-right"><div class="checkbox-box">';
							html+='<input type="checkbox" value="1"" name="" id="input_'+prodId+'_'+this.servSpecId+'" onclick="javascript:{common.setBtnTimer(this);AttachOffer.openServSpec('+prodId+','+this.servSpecId+',\''+this.servSpecName+'\',\''+this.ifParams+'\');}"/><label for="input_'+prodId+'_'+this.servSpecId+'" ></label></div></div>';						
							html+='</li>';
							$ul.append(html);
							i++;
						}
					}
				});
				if(i==0){
					html='<a href="javascript:void(0);" class="list-group-item"><span>没有可订购的功能产品</span></a>';
					$ul.append(html);
				}
			}else{
				var html='<a href="javascript:void(0);" class="list-group-item"><span>没有可订购的功能产品</span></a>';
				$ul.append(html);
			}
		}
	};
	
	//促销页面展示可订购可选包、流量包等其他
	var _initCanBuyAttachSpec=function(prodId,prodSpecId,labelId){
		var queryType = "3";
		if(prodId>0){
			queryType = "";
		}
		var param = {
				prodSpecId : prodSpecId,
				offerSpecIds : [],
				queryType : queryType,
				prodId : prodId,
				partyId : OrderInfo.cust.custId,
				labelId : labelId,
				ifCommonUse : ""			
		    };
		param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
		var prodInst = OrderInfo.getProdInst(prodId);
		if(prodInst){
			param.offerRoleId = prodInst.offerRoleId;
		}
		query.offer.queryCanBuyAttachSpec(param,function(data){
			var $ul = $("#canChooseUl_"+prodId);		
			$("#canChooseUl_"+prodId).children("li:gt(0)").remove();//移除可选促销节点
			$ul.empty();
			if(data!=undefined && data.resultCode == "0"){
				if(ec.util.isArray(data.result.offerSpecList)){
					var offerList = CacheData.getOfferList(prodId); //过滤已订购
					var offerSpecList = CacheData.getOfferSpecList(prodId);//过滤已选择
					var i=0;
					var html='';
					var isFavorite = false;
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
						if(flag){
							if(OrderInfo.actionFlag == 1 || OrderInfo.actionFlag == 14 || OrderInfo.actionFlag == 112 || OrderInfo.actionFlag == 6){
								var newSpec = _setMyfavoriteSpec(prodId,this.offerSpecId);
								if(newSpec==undefined){
									html='<li id="_li_'+ prodId + '_'+ this.offerSpecId  +'" ><i class="iconfont pull-left" onclick="AttachOffer.addMyfavoriteSpec('+prodId+','+this.offerSpecId+',\''+this.offerSpecName+'\',$(this)'+');">&#xe62b;</i>';
								} else {
									html='<li id="_li_'+ prodId + '_'+ this.offerSpecId  +'" ><i class="iconfont pull-left active" onclick="AttachOffer.delMyfavoriteSpec('+prodId+','+this.offerSpecId+',\''+this.offerSpecName+'\',$(this)'+');">&#xe62b;</i>';
									
								}
								html+='<span class="list-title">'+ this.offerSpecName +'</span>';
								html+='<div class="list-checkbox absolute-right"><div class="checkbox-box">';
								html+='<input type="checkbox" value="1" name="" id="input_'+ prodId + '_'+ this.offerSpecId  +'" onclick="javascript:{common.setBtnTimer(this);AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+');}"/><label for="input_'+prodId+'_'+this.offerSpecId+'" ></label></div></div>';
								html+='</li>';
								$ul.append(html);
								i++;
							}
							if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3){
								html='<div class="panel-heading m-b-5" id="_li_'+prodId +'_'+this.offerSpecId +'"><i class="iconfont pull-left p-l-10">&#xe635;</i>';
								html+='<h3 class="panel-title"><a id="li_'+ prodId +'_'+ this.offerSpecId + '" class="accordion-toggle accordion-toggle-styled border-none"  data-toggle="collapse" data-parent="#accordion" href="#collapse01">'+this.offerSpecName+'</a>';
								html+='</h3><div class="list-checkbox absolute-right"><div class="checkbox-box">';
								html+='<input type="checkbox" value="1" name="" id="input_'+ prodId + '_'+ this.offerSpecId  +'" onclick="javascript:{common.setBtnTimer(this);AttachOffer.addOfferSpec('+prodId+','+this.offerSpecId+');}"/><label for="input_'+prodId+'_'+this.offerSpecId+'" ></label></div></div></div>';
								$ul.append(html);
								i++;
							}
						}
					});
					if(i==0){
						html='<a href="javascript:void(0);" class="list-group-item" ><span>没有可订购的可选包</span></a>';
						$ul.append(html);
					}
				}else{
					var html='<a href="javascript:void(0);" class="list-group-item"><span>没有可订购的可选包</span></a>';
					$ul.append(html);
				}
			}
		});
		
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
	
	//收藏主套餐
	var _addMainfavoriteSpec = function(offerSpecId,offerSpecName){
		var param = {   
				offerSpecId : offerSpecId,
				main : "Y"
		};
		var content = '收藏【'+offerSpecName+'】' ;
		$.confirm("信息确认",content,{ 
			yes:function(){
				query.offer.addMyfavorite(param);
			},
			yesdo:function(){
				order.service.searchPack(1);
			},
			no:function(){
			}
		});
	};

	//移除主套餐
	var _delMainfavoriteSpec = function (offerSpecId,offerSpecName){
		var param = {   
				offerSpecId : offerSpecId,
				main : "Y"
		};
		var content = '取消收藏【'+offerSpecName+'】' ;
		$.confirm("信息确认",content,{ 
			yes:function(){
				query.offer.delMyfavorite(param);
			},
			yesdo:function(){
				order.service.searchPack(1);
			},
			no:function(){
			}
		});
	};
	
	
	//获取我的收藏到缓存列表
	var _setMyfavoriteSpec = function(prodId,offerSpecId){
		var newSpec = CacheData.getFavoriteSpec(prodId,offerSpecId);  // 没有在已收藏列表里面
		return newSpec;
	};
	

	// 查询附属销售品规格
	var _searchAttachOfferSpec = function(prodId, offerSpecId, prodSpecId) {
		var param = {
			prodId : prodId,
			prodSpecId : prodSpecId,
			offerSpecIds : [ offerSpecId ],
			ifCommonUse : "",
			enter:"3"
		}
		// 新装
		param.offerSpecIds.push(OrderInfo.offerSpec.offerSpecId);
		var prodInst = OrderInfo.getProdInst(prodId);
		if (prodInst) {
			param.offerRoleId = prodInst.offerRoleId;
		}
		var offerSepcName = $("#search_text_" + prodId).val();
		if (offerSepcName.replace(/\ /g, "") == "") {
			$.alert("提示", "请输入查询条件！");
			return;
		}
		param.offerSpecName = offerSepcName;
		param.specIds = AttachOffer.offerSpecIds;
		query.offer.searchAttachOfferSpec(param, function(data) {
			if (data != undefined) {
				var $ul = $("#canChooseUl_"+prodId);		
				$("#canChooseUl_"+prodId).empty();//移除可选促销节点
				$("#canChooseUl_"+prodId).append(data);
			}
		});
	};
	
	//开通功能产品
	var _openServSpec = function(prodId,servSpecId,specName,ifParams){
		if(!_checkUser(prodId,servSpecId)){
			$("#input_"+prodId+"_"+servSpecId).removeAttr("checked");
			$.alert("提示","当前客户证件类型无权限开通翼支付及其相关功能产品!");
			return;
		} 
		$("#input_"+prodId+"_"+servSpecId).attr("checked","checked");
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
					if(ifParams == "Y"){//是否有参
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
				$("#input_"+prodId+"_"+servSpecId).removeAttr("checked");
			}
		});
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
					if(!$("#input_"+prodId+"_"+serv.servId)){
						_removeOfferAndServOpen(serv.servSpecId,prodId);
					} else {
						_removeOfferAndServ(serv.servSpecId,prodId);
					}
					$("#input_"+prodId+"_"+serv.servId).attr("checked","checked");
					AttachOffer.addOpenServList(prodId,servSpecId,serv.servSpecName,serv.ifParams); //添加开通功能
					excludeAddServ(prodId,servSpecId,param);
				},
				no:function(){
					$("#input_"+prodId+"_"+serv.servId).removeAttr("checked");
				}
			});
		}
	};
	var _checkUser = function(prodId,servSpecId){
		//开通翼支付功能产品时进行实名校验
		if(servSpecId == CONST.YZFservSpecId1 || servSpecId == CONST.YZFservSpecId){
			if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3){//套餐变更和可选包变更
			   if(!cust.isRealCust){//不管是公众还是个人非实名直接拦截
				   return false; 
			   }
			}else{
                if(cust.isCovCust(OrderInfo.cust.identityCd)){//政企客户
					return true;
				}else if(!cust.isCovCust(OrderInfo.cust.identityCd)){
					if(!cust.isRealCust){
						return false; 
					}
				}				
			}
		}
		return true;
	}
	
	//添加到开通列表
	var _addOpenServList = function(prodId,servSpecId,servSpecName,ifParams){
		if(!_checkUser(prodId,servSpecId)){
			$("#input_"+prodId+"_"+servSpecId).removeAttr("checked");
			$.alert("提示","当前客户证件类型无权限开通翼支付及其相关功能产品!");
		} else {
			AttachOffer.offerSpecIds.push(parseInt(servSpecId));//加入已选择缓存，用于过滤搜索
			//从已开通功能产品中找
			var serv = CacheData.getServBySpecId(prodId,servSpecId); 
			if(serv != undefined){
				$("#li_"+prodId+"_"+serv.servId).find("span").removeClass("delete");
				$("#input_"+prodId+"_"+servSpecId).attr("checked","checked");
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
			if(spec.isdel == "C"){
				//没有订购过
				$('#_li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
				var $li = $('<li id="li_'+prodId+'_'+servSpecId+'"></li>');
				var html ='<i class="iconfont pull-left active"></i>';
				html+='<span class="list-title">'+ spec.servSpecName +'</span>';
				html+='<div class="list-checkbox absolute-right"><div class="checkbox-box">';
				html+='<input type="checkbox" checked="checked" value="1" id="input_'+prodId+'_'+servSpecId+'" name="" onclick="javascript:{common.setBtnTimer(this);AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+servSpecName+'\',\''+ifParams+'\');}"><label for="input_'+prodId+'_'+servSpecId+'"></label></input></div></div>';	
				$li.append(html);
				
				if(spec.ifDault==0){ //必须
					$li.removeAttr("onclick");	
				}else {
					if(spec.ifParams=="Y"){ 
						if(CacheData.setParam(prodId,spec)){ 
							$li.append('<span id="can_'+prodId+'_'+servSpecId+'"  isset="N"  class="abtn01 btn-span"><button type="button" class="list-can absolute-right" data-toggle="modal" data-target="#setting" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');">参</button></span>');
						}else {
							$li.append('<span id="can_'+prodId+'_'+servSpecId+'" isset="Y"  class="abtn03 btn-span"><button type="button" class="list-can absolute-right" data-toggle="modal" data-target="#setting" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');">参</button></span>');
						}
					}else{
//						$li.append('<span id="input_'+prodId+'_'+servSpecId+'" class="glyphicon glyphicon-remove pull-right" aria-hidden="true" onclick="AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+servSpecName+'\',\''+ifParams+'\')"></span>');
					}
				}
				$("#open_serv_ul_"+prodId).append($li);
				spec.isdel = "N";
			}else if((spec.isdel=="Y")) { 
				var $span = $("#li_"+prodId+"_"+servSpecId).find("span");
				$span.removeClass("delete");
				$("#input_"+prodId+"_"+servSpecId).attr("checked","checked");
				spec.isdel = "N";
		}
			_showHideUim(0,prodId,servSpecId);//显示或者隐藏补换卡
		}
		
	};
	
	//开通跟取消开通功能产品时判断是否显示跟隐藏补换卡
	var _showHideUim = function(flag,prodId,servSpecId){
		if(CONST.getAppDesc()==0 && servSpecId == CONST.PROD_SPEC.PROD_FUN_4G){ //4G系统并且是开通或者关闭4g功能产品
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){//套餐变更
				prodClass = CacheData.getOfferMember(prodId).prodClass;
			}else if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){
				for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
					if(prodId == OrderInfo.oldprodInstInfos[i].prodInstId){
						prodClass = OrderInfo.oldprodInstInfos[i].prodClass;
					}
				}
			}
			if(flag==0){ //开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡需要补卡
					$("#title_"+prodId).show();
					$("#uimDiv_"+prodId).show();
				}
			}else if(flag==1){//取消开通功能产品
				if(prodClass==CONST.PROD_CLASS.THREE){ //3G卡，已经显示补卡,判断是否隐藏补卡
					$("#uimDiv_"+prodId).hide();
				}
			}
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
			$.confirm("参数设置： ",content,{ 
				yes:function(){	
					var isset = false;
					for(var i = 0;i<serv.prodSpecParams.length;i++){
					//$.each(serv.prodSpecParams,function(){
					var prodItem = CacheData.getServInstParam(prodId,serv.servId,serv.prodSpecParams[i].itemSpecId);
					if (prodItem.itemSpecId == CONST.YZFitemSpecId4 && "ON" != offerChange.queryPortalProperties("AGENT_" + (OrderInfo.staff.soAreaId+"").substring(0,3))) {
						continue;
					}
					prodItem.setValue = $("#"+prodId+"_"+serv.prodSpecParams[i].itemSpecId).val();	
						if(prodItem.value!=prodItem.setValue){
							prodItem.isUpdate = "Y";
							isset = true;
						}
					}
					if(isset){
						$("#can_"+prodId+"_"+serv.servId).removeClass("canshu").addClass("canshu2");
						serv.isset = "Y";
						serv.update = "Y";
					}else{
						$("#can_"+prodId+"_"+serv.servId).removeClass("canshu2").addClass("canshu");
						serv.isset = "N";
						serv.update = "N";
					}
				},
				no:function(){
					
				}
			});
		
		}else {
			//显示已订购功能产品
			var spec = CacheData.getServSpec(prodId,servSpecId);
			if(spec == undefined){  //未开通的附属销售品，需要获取销售品构成
				return;
			}
			var content = CacheData.getParamContent(prodId,spec,2);	
			$.confirm("参数设置： ",content,{ 
				yes:function(){
					if(!!spec.prodSpecParams){
						for (var i = 0; i < spec.prodSpecParams.length; i++) {
							var param = spec.prodSpecParams[i];
							var itemSpec = CacheData.getServSpecParam(prodId,servSpecId,param.itemSpecId);
							itemSpec.setValue = $("#"+prodId+"_"+param.itemSpecId).val();
						}
					}
					var attchSpec = CacheData.getServSpec(prodId,servSpecId);
					attchSpec.isset = "Y";
				},
				no:function(){	
				}
			});
		}
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
	//添加到开通列表
	var _addOpenList = function(prodId,offerSpecId){
		AttachOffer.offerSpecIds.push(parseInt(offerSpecId));//加入已选择缓存，用于过滤搜索
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
				$span.removeClass("delete");
				$("#input_"+prodId+"_"+offerSpecId).attr("checked","checked");
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
			var $spec = $('#_li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			var $li = $('<li id="li_'+prodId+'_'+offerSpecId+'"></li>');
			var html ="";
			if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3){
				html+='<i class="iconfont pull-left active">&#xe635;</i>';
			}
			html+='<span class="list-title">'+ newSpec.offerSpecName +'</span>';
			html+='<div class="list-checkbox absolute-right"><div class="checkbox-box">';
			html+='<input type="checkbox" checked="checked" value="1" id="input_'+prodId+'_'+offerSpecId+'" name="" onclick="javascript:{common.setBtnTimer(this);AttachOffer.delOfferSpec('+prodId+','+offerSpecId+');}"><label for="input_'+prodId+'_'+offerSpecId+'" ></label></input></div></div>';						
			
//			if(OrderInfo.actionFlag == 2){
//				var $li = $('<div class="panel-heading m-b-5" id="div_'+prodId+'_'+offerSpecId+'"></div>');
//				html='<i class="iconfont pull-left p-l-10">&#xe635;</i>';
//				html+='<h3 class="panel-title"><a id="li_'+ prodId +'_'+ offerSpecId + '" class="accordion-toggle accordion-toggle-styled border-none"  data-toggle="collapse" data-parent="#accordion" href="#collapse01">'+newSpec.offerSpecName+'</a>';
//				html+='</h3><div class="list-checkbox absolute-right"><div class="checkbox-box">';
//				html+='<input type="checkbox"  checked="checked" value="1" name="" id="input_'+ prodId + '_'+ offerSpecId  +'" onclick="javascript:{common.setBtnTimer(this);AttachOffer.delOfferSpec('+prodId+','+offerSpecId+');}"/><label for="input_'+prodId+'_'+offerSpecId+'" ></label></div></div>';
//				
//			} 
			$li.append(html);
			if(newSpec.ifDault==0){ //必须
				$li.removeAttr("onclick");	
			}else{
				if(newSpec.ifParams){ 
					if(CacheData.setParam(prodId,newSpec)){ 
						$li.append('<span id="can_'+prodId+'_'+offerSpecId+'"  isset="N"  class="abtn01 btn-span"><button type="button" class="list-can absolute-right" data-toggle="modal" data-target="#setting" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"><span style="color:red;">参</button></span>');
					}else {
						$li.append('<span id="can_'+prodId+'_'+offerSpecId+'" isset="Y"  class="abtn03 btn-span"><button type="button" class="list-can absolute-right"  data-toggle="modal" data-target="#setting" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');">参</button></span>');
					}
				}else if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
					$li.append('<span id="can_'+prodId+'_'+offerSpecId+'" isset="Y"  class="abtn03 btn-span"><button type="button" class="list-can absolute-right" data-toggle="modal" data-target="#setting" onclick="AttachOffer.setParam('+prodId+','+offerSpecId+');">参</button></span>');
				}else{
//					$li.append('<span id="input_'+prodId+'_'+offerSpecId+'" class="glyphicon glyphicon-remove pull-right" aria-hidden="true" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')"></span>');
				}
			}
			$("#open_ul_"+prodId).append($li);
			newSpec.isdel = "N";
		}else if((newSpec.isdel=="Y")) { 
			var $span = $("#li_"+prodId+"_"+offerSpecId).find("span");
			$span.removeClass("delete");
			$("#input_"+prodId+"_"+offerSpecId).attr("checked","checked");
			newSpec.isdel = "N";
			
		}else if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
			newSpec.counts++;
			if(_ifOrderAgain(newSpec)){
				newSpec.counts--;
				return;
			}			
		}else {  //容错处理 //if((newSpec.isdel=="N")) 
			var $spec = $('#li_'+prodId+'_'+offerSpecId); //在已开通附属里面
			$spec.remove();
			var $li = $('<li id="li_'+prodId+'_'+offerSpecId+'"></li>');
			var html ="";
			if(OrderInfo.actionFlag == 2 || OrderInfo.actionFlag == 3){
				html+='<i class="iconfont pull-left active">&#xe635;</i>';
			}
			html+='<span class="list-title">'+ newSpec.offerSpecName +'</span>';
			html+='<div class="list-checkbox absolute-right"><div class="checkbox-box">';
			html+='<input type="checkbox" value="1" checked="checked" id="input_'+prodId+'_'+offerSpecId+'" name="" onclick="javascript:{common.setBtnTimer(this);AttachOffer.delOfferSpec('+prodId+','+offerSpecId+');}"><label for="input_'+prodId+'_'+offerSpecId+'"></label></input></div></div>';						
			$li.append(html);
			
			if(newSpec.ifDault==0){ //必须
				$li.removeAttr("onclick");	
			}else{	
				if(newSpec.ifParams){      
					if(CacheData.setParam(prodId,newSpec)){ 
						$li.append('<span id="can_'+prodId+'_'+offerSpecId+'"  isset="N"  class="abtn01 btn-span"><button type="button" class="list-can absolute-right" data-toggle="modal" data-target="#setting" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');"><span style="color:red;">参</button></span>');
					}else {
						$li.append('<span id="can_'+prodId+'_'+offerSpecId+'" isset="Y"  class="abtn03 btn-span"><button type="button" class="list-can absolute-right"  data-toggle="modal" data-target="#setting" onclick="AttachOffer.showParam('+prodId+','+offerSpecId+');">参</button></span>');
					}
				}else{
//					$li.append('<span id="input_'+prodId+'_'+offerSpecId+'" class="glyphicon glyphicon-remove pull-right" aria-hidden="true" onclick="AttachOffer.delOfferSpec('+prodId+','+offerSpecId+')"></span>');
				}
			}
			if(newSpec.ifShowTime=="Y"){
				$li.append('<dd class="time" id="time_'+prodId+'_'+offerSpecId+'" onclick="AttachOffer.showTime('+prodId+','+offerSpecId+',\''+newSpec.offerSpecName+'\');"></dd>');
			}
			if(ec.util.isObj(newSpec.ifOrderAgain)&&newSpec.ifOrderAgain=="Y"){
				if($li.find("dd.canshu").length + $li.find("dd.canshu2").length > 0)
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" style="top:20px;" onclick="AttachOffer.setParam('+prodId+','+offerSpecId+');"></dd>');
				else
					$li.append('<dd id="can_'+prodId+'_'+offerSpecId+'" class="canshu2" onclick="AttachOffer.setParam('+prodId+','+offerSpecId+');"></dd>');
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
						_addOpenServList(prodId,this.objId,this.objName,ifParams);
						if(this.minQty>0){
							_minQtyFileter(prodId,this.objId);
						}
					}
				});
			});
		}
		if(OrderInfo.actionFlag!=201 && ec.util.isArray(newSpec.agreementInfos)){ //合约销售品需要输入终端
			if(OrderInfo.actionFlag!=14){//非购机入口的
				totalNums=0;
				_removeAttach2Coupons(prodId,newSpec.offerSpecId);//清除串码组
				var objInstId = prodId+'_'+newSpec.offerSpecId;
				//一个终端对应一个ul
				var $div = $('<div id="terminalUl_'+objInstId+'"</div>');				
				var minNum=newSpec.agreementInfos[0].minNum;
				var maxNum=newSpec.agreementInfos[0].maxNum;
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
						var $ulGroups=$('<ul id="ul_'+objInstId+'" class="choice-box m-t-10 border-none" style="display:none;""></ul>');
						var $liGroups = $('<li class="form-group" style="list-style-type:none; "><label> 终端：</label></li>');
						var $selTerms = $('<select class="myselect select-option" data-role="none" id="'+objInstId+'"></select>');
						var $selTermGroups = $('<select class="myselect select-option" data-role="none" id="group_'+objInstId+'"></select>');
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
							var $strAdd=$('<button id="terminalAddBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="0" onclick="AttachOffer.addAndDelTerminal(this)" value="添加" class="btn btn-default">添加</button>');
							var $strDel=$('<button id="terminalDelBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="1" onclick="AttachOffer.addAndDelTerminal(this)" value="删除" class="btn btn-default">删除</button>');
							$liGroups.append($strAdd).append($strDel);
						}
						$ulGroups.append($liGroups);
						for(var k=1;k<=minNum;k++){
							var $liTerminal = $('<div class="choice-box absolute-l-43 border-top-none">'
									+ '<input id="terminal_text" placeholder="终端校验，请先输入终端串号" maxlength="50"  oninput="showCheckTerminal('+ prodId +')" class="choice-input p-l-0 "'
									 + ' />');
							
							var $li1 = $('<i id="terminal_call" class="iconfont right-btn pull-right p-r-10 m-r-45"'
									+' onclick="common.callScanning(\'order.service.terminalScaningCallBack\','+prodId+')">&#xe641;</i>');
							var $li4 = $('<i id="terminal_check" class="iconfont right-btn pull-right p-r-10 m-r-45 dis-none"'
										+ ' num="'+k+'" flag="'+isFastOffer+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)">&#xe672;</i>');
							var $li2 = $('<i id="terminal_release" class="iconfont right-btn pull-right p-r-10 m-r-45 dis-none"'
										+ ' onclick="product.uim.releaseUim('+prodId+')">&#xe673;</i>')
//							var $liTerminal=$('<li class="form-group" style="list-style-type:none;"><label for="exampleInputPassword1">终端校验<span class="text-warning">*</span></label><div class="input-group"><input id="terminalText_'+objInstId+'_'+k+'" type="text" class="form-control" maxlength="50" placeholder="请先输入终端串号" />'
//									+'<span class="input-group-btn"><button id="terminalBtn_'+objInstId+'_'+k+'" type="button" num="'+k+'" flag="'+isFastOffer+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)" class="btn btn-info">校验</button></span></div></li>');
//							var	$li4 = $('<li id="terminalDesc_'+k+'" style="display:none;list-style-type:none;" ><label></label><label id="terminalName_'+k+'"></label></li>');
							
							$liTerminal.append($li1).append($li4).append($li2);
							
						}
						totalNums+=minNum;
				}
				var addTerminalId = {
						prodId : prodId,
				};
				AttachOffer.addTerminalList.push(addTerminalId);
				AttachOffer.terminalDiv = $liTerminal.append($ulGroups);
				var $li = $("#terminalDiv_"+prodId);
				$div.append($liTerminal);
////				$ul.append($li1).append($li2).append($li3).appendTo($div);
				$div.appendTo($li);
				$li.show();
				if(newSpec.agreementInfos[0].minNum>0){//合约里面至少要有一个终端
					newSpec.isTerminal = 1;
				}
			}else if(OrderInfo.actionFlag==14){				
					setTimeout(function () { 					
        				if(order.phone.isSelect=="N" && OrderInfo.actionFlag==14){//带出主套餐依赖
							AttachOffer.phone_checkOfferExcludeDepend(-1,order.phone.hytcid,order.phone.hytcmc);
							order.phone.isSelect="Y";
						}
    				}, 1000);
				}
			//}
		}
	};
	
	//购合约机选合约校验依赖
	var _phone_checkOfferExcludeDepend = function(prodId,offerSpecId,offerSpecName){
		var param = CacheData.getExcDepOfferParam(prodId,offerSpecId);
		var data = query.offer.queryExcludeDepend(param);//查询规则校验
		if(data!=undefined){
			paserOfferData(data.result,prodId,offerSpecId,offerSpecName); //解析数据
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
	//1表示从已订购那边过来的
	var _setParam=function(prodId,offerSpecId,flag){
		var newSpec = _setSpec(prodId,offerSpecId);  //没有在已选列表里面
		var offer = CacheData.getOfferBySpecId(prodId,offerSpecId); //从已订购数据中找
		if(flag==1){
			newSpec.counts=offer.counts;
		}
		var content = '<form id="paramForm">' ;
		if(ec.util.isObj(newSpec.labelId)){
			content += "重复订购次数" + ' : <input id="text_'+prodId+'_'+offerSpecId  
			+'" class="inputWidth183px" type="text" value="'+newSpec.counts+'"><br>'; 
		} else {
			content += "重复订购次数" + ' : <input id="text_'+prodId+'_'+offerSpecId  
			+'" class="inputWidth183px" type="text" disabled="disabled" value="'+newSpec.counts+'"><br>'; 
		}
		
		content +='</form>' ;
		$.confirm("参数设置： ",content,{ 
			yes:function(){
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
			},
			no:function(){
			}
		});
	};
	
	//关闭服务规格
	var _closeServSpec = function(prodId,servSpecId,specName,ifParams){
		var $span = $("#li_"+prodId+"_"+servSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="list-title delete"){  //已经退订，再订购
			AttachOffer.openServSpec(prodId,servSpecId,specName,ifParams);
//			_removeOfferAndServOpen(servSpecId,prodId);
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
					var yzfFlag = $("#yzfFlag_" + prodId + "_"+CONST.YZFservSpecId1).val();
					if(servSpecId == CONST.YZFservSpecId1 && yzfFlag == "1"){
									if(toDelOfferSpecList.length>0){
										var strInfo = "【"+$span.text()+"】功能产品为以下可选包的必选成员，取消开通将取消订购以下可选包，请确认是否取消订购？<br>";
										$.each(toDelOfferSpecList,function(){
											strInfo += "【"+this.offerSpecName+"】<br>";
										});
												$.each(toDelOfferSpecList,function(){
													_delOfferSpec2(prodId,this.offerSpecId);
												});
												if(respnose !="" && respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec!=undefined ){
													_addOfferAndServDependOpen(respnose.data.result.servSpec,respnose.data.result.offerSpec,servSpecId,prodId);
												}
												_closeServSpecCallBack(prodId,servSpecId,$span);
									}else{
										if(respnose !="" && respnose.data.resultCode == "0" && respnose.data.result.servSpec!=undefined && respnose.data.result.offerSpec!=undefined ){
											_addOfferAndServDependOpen(respnose.data.result.servSpec,respnose.data.result.offerSpec,servSpecId,prodId);
										}
										_closeServSpecCallBack(prodId,servSpecId,$span);
									}
									$("#input_"+prodId+"_"+servSpecId).removeAttr("checked");
									$("#yzfFlag_" + prodId + "_"+CONST.YZFservSpecId1).val("2");
							
					} else{
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
								$("#input_"+prodId+"_"+servSpecId).removeAttr("checked");
							},
							no:function(){
								$("#input_"+prodId+"_"+servSpecId).attr("checked","checked");
							}
						});
					}
					
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
	
	//直接删除附属销售品规格，不提示删除
	var _delOfferSpec2 = function(prodId,offerSpecId,reflag){
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="list-title delete"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
		}else { //取消订购
			var spec = CacheData.getOfferSpec(prodId,offerSpecId);
			if(reflag!=undefined && reflag=="reload"){//暂存单二次加载
				$span.addClass("delete");
				$("#input_"+prodId+"_"+offerSpecId).removeAttr("checked");
				spec.isdel = "Y";
				_delServSpec(prodId,spec); //取消订购销售品时
				order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
				$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
				spec.isTerminal = 0;
			}else{
				$span.addClass("delete");
				spec.isdel = "Y";
				$("#input_"+prodId+"_"+offerSpecId).removeAttr("checked");
				_delServSpec(prodId,spec); //取消订购销售品时
				order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
				$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
				spec.isTerminal = 0;
			}
		}
	};
	//删除附属销售品带出删除功能产品
	var _delServSpec = function(prodId,offerSpec){
		$.each(offerSpec.offerRoles,function(){
			$.each(this.roleObjs,function(){
				var servSpecId = this.objId;
				if($("#input_"+prodId+"_"+servSpecId).attr("checked")=="checked"){
					var spec = CacheData.getServSpec(prodId,servSpecId);
					if(ec.util.isObj(spec)){
						spec.isdel = "Y";
						var $li = $("#li_"+prodId+"_"+servSpecId);
						$li.removeClass("canshu").addClass("canshu2");
						$li.find("span").addClass("delete"); //定位删除的附属
						_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
					}
				}
			});
		});
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
				    for(var m=0;m<AttachOffer.openServList.length;m++){
				    	var mproid = AttachOffer.openServList[m].prodId;
				    	if(prodId == mproid){
				    		for(var j=0;j<AttachOffer.openServList[m].servSpecList.length;j++){
								var openedServ = AttachOffer.openServList[m].servSpecList[j];
								if(this.servSpecId == openedServ.servSpecId){
									openedServ.isdel = "Y";
									$("#li_"+prodId+"_"+openedServ.servSpecId).find("span").addClass("delete");
									$("#input_"+prodId+"_"+openedServ.servSpecId).removeAttr("checked");
								}
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
				for(var m=0;m<AttachOffer.openList.length;m++){
					var mproid = AttachOffer.openList[m].prodId;
			    	if(prodId == mproid){
			    		for(var j=0;j<AttachOffer.openList[m].specList.length;j++){
							var openedServ = AttachOffer.openList[m].specList[j];
							if(this.offerSpecId  == openedServ.offerSpecId){
								openedServ.isdel = "Y";
								$("#li_"+prodId+"_"+openedServ.offerSpecId).find("span").addClass("delete");
								$("#input_"+prodId+"_"+openedServ.offerSpecId).removeAttr("checked");
							}
						}
			    	}
				}
			});
			
		}
	};
	//删除附属销售品带出删除功能产品
	var delServByOffer = function(prodId,offer){	
		$.each(offer.offerMemberInfos,function(){
			var servId = this.objInstId;
			if($("#input_"+prodId+"_"+servId).attr("checked")=="checked"){
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
	
	var _closeServSpecCallBack = function(prodId,servSpecId,$span){
		var spec = CacheData.getServSpec(prodId,servSpecId);
		if(spec == undefined){ //没有在已开通附属销售列表中
			return;
		}
		$span.addClass("delete");
		spec.isdel = "Y";
		_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
		
		var serv = CacheData.getServBySpecId(prodId,servSpecId);
		order.dealer.removeAttDealer(prodId+"_"+servSpecId); //删除协销人
		if(ec.util.isObj(serv)){ //没有在已开通附属销售列表中
			$span.addClass("delete");
			serv.isdel = "Y";
			//_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
		}
		$("#input_"+prodId+"_"+servSpecId).removeAttr("checked");
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
					var isset = false;
					$.each(offer.offerSpec.offerSpecParams,function(){
						var itemInfo = CacheData.getOfferParam(prodId,offer.offerId,this.itemSpecId);
						itemInfo.setValue = $("#"+prodId+"_"+this.itemSpecId).val();
						if(itemInfo.itemSpecId == CONST.ITEM_SPEC.PROT_NUMBER){
							itemInfo.setValue = $("#select1").val();
						} else if (itemSpec.dateSourceTypeCd == "17") {//搜索框类型组件获取code属性中的值作为设置值
							itemSpec.setValue = $.trim($("#" + prodId + "_" + this.itemSpecId).attr("code"));
						} else {
						    itemInfo.setValue = $("#"+prodId+"_"+this.itemSpecId).val();
						}
						if(itemInfo.value!=itemInfo.setValue){
							itemInfo.isUpdate = "Y";
							isset = true;
						}
					});
					if(isset){
						$("#can_"+prodId+"_"+offer.offerId).removeClass("abtn03").addClass("abtn01");
						offer.isset = "Y";
						offer.update = "Y";
					}else{
						$("#can_"+prodId+"_"+offer.offerId).removeClass("abtn01").addClass("abtn03");
						offer.isset = "N";
						offer.update = "N";
					}
				},
				no:function(){
				}
			});
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
					$("#can_"+prodId+"_"+offerSpecId).removeClass("abtn03").addClass("abtn01");
					var attchSpec = CacheData.getOfferSpec(prodId,offerSpecId);
					attchSpec.isset = "Y";
				},
				no:function(){
				}
			});
		}
	};
	
	//销售品角色成员对象是中 minQty大于0的话 就必须设置其为不能删除（暂定）
	var _minQtyFileter=function(prodId,servSpecId){
		//从已开通功能产品中找
		var serv = CacheData.getServBySpecId(prodId,servSpecId); 
		var $li,$span,$span_remove;
		if(serv != undefined){
			$li=$("#li_"+prodId+"_"+serv.servId);
			$span = $("#span_"+prodId+"_"+serv.servId);
//			$span_remove = $("#input_"+prodId+"_"+serv.servId);
		}else{
			$li=$("#li_"+prodId+"_"+servSpecId);
			$span = $("#span_"+prodId+"_"+servSpecId);
//			$span_remove = $("#input_"+prodId+"_"+servSpecId);
		}
		if($li!=undefined){
			if(ec.util.isObj($span)){
				$span.removeClass("delete");
				$("#input_"+prodId+"_"+servSpecId).attr("checked","checked");
			}
//			if(ec.util.isObj($span_remove)){
//				$span_remove.hide();
//			}
			$li.removeAttr("onclick");	
			
		}
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
	//删除附属销售品规格
	var _delOfferSpec = function(prodId,offerSpecId){
		$("#input_"+prodId+"_"+offerSpecId).removeAttr("checked");
		var $span = $("#li_"+prodId+"_"+offerSpecId).find("span"); //定位删除的附属
		if($span.attr("class")=="list-title delete"){  //已经取消订购，再订购
			AttachOffer.addOfferSpec(prodId,offerSpecId);
			_removeOfferAndServOpen(offerSpecId,prodId);
		}else { //取消订购
		var spec = CacheData.getOfferSpec(prodId,offerSpecId);
		var content = CacheData.getOfferProdStr(prodId,spec,2);
//		$("#confirm-modal").modal('show');
//		$("#modal-confirm-content").html(content);
//		$("#btn-comfirm-dialog-ok").off("click").on("click",function(){
//			//$("#li_"+prodId+"_"+offerSpecId).remove();
//			$span.addClass("del");
//			spec.isdel = "Y";
//			delServSpec(prodId,spec); //取消订购销售品时
//			//order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
//			//$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
//			spec.isTerminal = 0;
//			$("#btn-comfirm-dialog-cancel").click();
//		});
		$.confirm("信息确认",content,{ 
			yes:function(){
//				$("#li_"+prodId+"_"+offerSpecId).remove();
				$span.addClass("delete");
				spec.isdel = "Y";
				$("#input_"+prodId+"_"+offerSpecId).removeAttr("checked");
//				$("#can_"+prodId+"_"+offerSpecId).find("button").addClass(); 
				delServSpec(prodId,spec); //取消订购销售品时
				order.dealer.removeAttDealer(prodId+"_"+offerSpecId); //删除协销人
//				$("#terminalUl_"+prodId+"_"+offerSpecId).remove();
				AttachOffer.addTerminalList = [];
				spec.isTerminal = 0;
			},
			no:function(){
				$("#input_"+prodId+"_"+offerSpecId).attr("checked","checked");
				
			}
		});
		}
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
					//	$li.remove();
					//	$li.removeClass("canshu").addClass("canshu2");
						$li.find("span").addClass("delete"); //定位删除的附属
						$("#input_"+prodId+"_"+servSpecId).removeAttr("checked");
						_showHideUim(1,prodId,servSpecId);   //显示或者隐藏
					}
				}
			});
		});
	};
	var _removeOfferAndServOpen = function(thisServSpecId,prodId){
		//update by huangjj3  61419 取消关闭，把依赖的销售品从开通的去除
		for(var i=0;i<_servSpecs.length;i++){
			var servSpecs = _servSpecs[i];
			if(thisServSpecId == servSpecs.servSpecId){
				for(var j=0;j<servSpecs.servSpe.length;j++){
					var servSpe = servSpecs.servSpe[j];
					if(AttachOffer.openServList.length>0){
						for(var n=0;n<AttachOffer.openServList[0].servSpecList.length;n++){
							var opendServ = AttachOffer.openServList[0].servSpecList[n];
							if(servSpe.servSpecId == opendServ.servSpecId){
								opendServ.isdel = "N";
								$("#li_"+prodId+"_"+opendServ.servSpecId).find("span").removeClass("delete");
								$("#input_"+prodId+"_"+servSpe.servSpecId).attr("checked","checked");
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
					if(AttachOffer.openList.length>0){
						for(var n=0;n<AttachOffer.openList[0].specList.length;n++){
							var opendServ = AttachOffer.openList[0].specList[n];
							if(offerSpe.offerId == opendServ.offerId){
								opendServ.isdel = "N";
								$("#li_"+prodId+"_"+opendServ.offerId).find("span").removeClass("delete");
								$("#input_"+prodId+"_"+opendServ.offerId).attr("checked","checked");
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
	
	var _checkTerminalVal = function(val){
		return (/(^([a-fA-F0-9]{14})$)|(^\d{15}$)/).test(val);
		
//		if(val.length>15 || val.length < 14)
//			return false;
//		if(val.length == 14){
//			return (/^[a-f0-9A-F]$/).test(val);
//		}else {
//			return (/^[0-9]$/).test(val);
//		}
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
		var instCode = $("#terminal_text").val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		if(!_checkTerminalVal($.trim(instCode))){
			$.alert("提示信息","请输入合法的终端串码<br/>-必须14位字母与数字组合或15位数字组合,不限大小写");
			return;
		}
		if(_checkData(objInstId,instCode)){
			return;
		}
		var param = {
			instCode : instCode,
			flag : flag,
		//	mktResId : resId,
			offerSpecId: offerSpecId,
			termGroup : terminalGroupId //606920 销售品构成查询接口超时 update by yanghm
			//termGroup : terminalGroupId  update by huangjj #13336需求资源要求这个参数不传
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
			$.alert("信息提示",data.message);
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
			$("#terminalInfo_li_"+prodId).show();
			$("#terminalInfo_"+prodId).html("终端规格："+data.mktResName+",终端颜色："+mktColor+",合约价格："+mktPrice+"元");			
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
			OrderInfo.attach2Coupons.push(coupon);
		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
			$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
		}else{
			$.alert("提示",data.message);
		}
	};
	
	//删除附属销售品实例
	var _delOffer = function(prodId,offerId){
		$("#input_"+prodId+"_"+offerId).removeAttr("checked");
		var $span = $("#li_"+prodId+"_"+offerId).find("span"); //定位删除的附属
		if($span.attr("class")=="list-title delete"){  //已经退订，再订购
			AttachOffer.addOffer(prodId,offerId,$span.text());
		}else { //退订
			var offer = CacheData.getOffer(prodId,offerId);
			if(!ec.util.isArray(offer.offerMemberInfos)){	
				var param = {
					prodId:prodId,
					areaId: OrderInfo.getProdAreaId(prodId),
					offerId:offerId	
				};
				if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						if(prodId==OrderInfo.oldprodInstInfos[i].prodInstId){
							param.areaId = OrderInfo.oldprodInstInfos[i].areaId;
							param.acctNbr = OrderInfo.oldprodInstInfos[i].accNbr;
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
			var content = "";
			if(offer.offerSpec!=undefined){
				content = CacheData.getOfferProdStr(prodId,offer,1);
			}else {
				content = '退订【'+$span.text()+'】可选包' ;
			}
			$.confirm("信息确认",content,{ 
				yes:function(){
					offer.isdel = "Y";
					$span.addClass("delete");
					delServByOffer(prodId,offer);
				},
				no:function(){	
					$("#input_"+prodId+"_"+offerId).attr("checked","checked");
				}
			});
		}
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
						$span.removeClass("delete");
						$("#input_"+prodId+"_"+offerId).attr("checked","checked");
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
	
	//依赖销售品查询
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
		var response = $.callServiceAsJson(contextPath+"/app/offer/queryOfferAndServDependForCancel",param); 
		return response;
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
	
	
	/**
	 * 判断 该合约是否满足被订购的条件：主套餐成员实例数据小于最小终端数，需要进行提示，不允许受理
	 */
	var _manyPhoneFilter=function(prodId,offerSpecId){
		   if(OrderInfo.actionFlag==201){//橙分期
			   return true;
		    }
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
			}
		return true;
	};
	
	//设置主销售品参数
	var _offer_showMainParam = function(accessNumber){
		if(OrderInfo.actionFlag == 21){//副卡换套餐,可能有多个主套餐参数，根据参数号码来区分\
			if(!ec.util.isObj(accessNumber)){
				$.alert("提示","获取副卡号码失败，请刷新页面重试！");
				return;
			}
			var spec = {};
			if(ec.util.isArray(AttachOffer.newViceParam)){
				for(var i = 0;i < AttachOffer.newViceParam.length; i++){
					if(accessNumber==AttachOffer.newViceParam[i].accessNumber){
						spec = AttachOffer.newViceParam[i];
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
//				$("#mainOffer_"+accessNumber).removeClass("canshu").addClass("canshu2");
//				$(".ZebraDialog").remove();
//	            $(".ZebraDialogOverlay").remove();
			}).ketchup({bindElement:"easyDialogYesBtn"});
		}else{
			var tempProdId = -1;//prodID赋值为-1
			var content = CacheData.getParamContent(tempProdId,OrderInfo.offerSpec,0);
			$.confirm("参数设置： ",content,{ 
				yes:function(){
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
				},
				no:function(){			
				}
			});
		}	
	};
	
	//判断是否需要补卡
	var _isChangeUim = function(objId){
		if(CONST.getAppDesc()==0){
			var prodClass = order.prodModify.choosedProdInfo.prodClass; //可选包变更
			var prodId = order.prodModify.choosedProdInfo.prodInstId;
			if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21){//套餐变更
				var member = CacheData.getOfferMember(objId);
				prodClass = member.prodClass;
				prodId = member.objInstId;
			}else if(OrderInfo.actionFlag==6 && ec.util.isArray(OrderInfo.oldprodInstInfos)){
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==objId){
						prodClass = this.prodClass;
						prodId = this.prodInstId;
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
	
	//现在主销售品参数
	var _showMainParam = function(){
		var tempProdId = -1;//prodID赋值为-1
		var content = CacheData.getParamContent(tempProdId,OrderInfo.offerSpec,0);
		$.confirm("参数设置： ",content,{ 
			yes:function(){
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
			},
			no:function(){			
			}
		});
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
	//礼包订购构成功能产品查询
	var _queryGiftServerSpec = function(param) {
		query.offer.queryGiftServerSpec(param,function(data){
			if (data) {
				query.offer.loadInst(); //加载实例到缓存
				//主套餐已选择和可订购可选包等展示
				if(param.prodId=="-1"){//主卡促销滚动tab
					$("#attachMain").html(data);
					$("#cardNameSpan_"+param.prodId).html("主卡");
				}else{
					var id=-(param.prodId+1);
					$("#attachSecondary"+id).html(data);
					$("#cardNameSpan_"+param.prodId).html("副卡");
				}			
				_showMainRoleProd(param.prodId); //展示必须功能产品
				//展示主套餐名称和是否有点参
				var spec = OrderInfo.offerSpec;
				$("#mainOfferName_"+param.prodId).html(spec.offerSpecName);
				if(OrderInfo.actionFlag!=6){//非新增副卡
					if(spec.ifParams&&spec.offerSpecParams!=null&&spec.offerSpecParams.length>0){  //销售参数节点					
						$("#mainOfferLi_-1").append('<button class="list-can absolute-right" onclick="AttachOffer.showMainParam()">参</button>');					
					}
				}
				if(OrderInfo.actionFlag==1){
					//为主套餐属性自动设置服务参数
					if(CacheData.setParam(-1,OrderInfo.offerSpec)){ 
					}
				}
				_initServSpec(param.prodId,param.prodSpecId,"10000"); //初始化功能产品
				var phoneNum=OrderInfo.getAccessNumber(param.prodId);
				$("#phoneNumSpan_"+param.prodId).html(phoneNum);
				 $("#nav-tab-2").removeClass("active in");
				 $("#nav-tab-3").removeClass("active in");
		    	 $("#nav-tab-4").addClass("active in");
		    	 $("#tab2_li").removeClass("active");
		    	 $("#tab3_li").removeClass("active");
		    	 $("#tab4_li").addClass("active");
		    	 setTimeout(function () { 
					 var yzfFlag = $("#yzfFlag_" + param.prodId + "_"+CONST.YZFservSpecId1).val();
					 if(yzfFlag && yzfFlag == "1" && !cust.isCovCust(OrderInfo.cust.identityCd) && !cust.isRealCust){
							if(parseInt(param.prodId) == -1){//主卡必做校验
								$.alert("提示","当前用户证件类型不符合实名规范，无开通翼支付及其相关功能产品权限，已自动退订！")
								AttachOffer.closeServSpec(param.prodId,CONST.YZFservSpecId1,'翼支付','N');
							} else if(parseInt(param.prodId) != -1){//副卡先进行校验，防止使用人为本人的情况，未进行关闭
								AttachOffer.closeServSpec(param.prodId,CONST.YZFservSpecId1,'翼支付','N');
							}
						} 
					 $("#yzfFlag_" + param.prodId + "_"+CONST.YZFservSpecId1).val("2")
				    },800);
			}
		});
	};

	//将必选或默认功能产品加入已选列表
	var _showMainRoleProd = function(prodId){
		var prodInst = getProdInst(prodId);
		for (var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.CONTENT){ //增值业务角色
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
									continue;
								}
								var serv = CacheData.getServBySpecId(prodId,servSpecId);//从已订购功能产品中找
								if(serv!=undefined){ //不在已经开跟已经选里面
									continue;
								}
								if(roleObj.dfQty > 0){ //必选，或者默选
									var servSpec=jQuery.extend(true, {}, roleObj);
									CacheData.setServSpec(prodId,servSpec); //添加到已开通列表里
									spec = servSpec;
									if(ec.util.isArray(spec.prodSpecParams)){
										spec.ifParams = "Y";
									}
									$('#_li_'+prodId+'_'+servSpecId).remove(); //删除可开通功能产品里面
									var $li = $('<li id="li_'+prodId+'_'+servSpecId+'" ></li>');
									html='<span class="list-title">'+ spec.servSpecName +'</span>';
									if(spec.ifParams){
										html+='<button type="button" id="can_'+prodId+'_'+spec.servSpecId+'" class="list-can absolute-right" onclick="AttachOffer.showServParam('+prodId+','+servSpecId+');">参</button>';
									}
									html+='<div class="list-checkbox absolute-right"><div class="checkbox-box">';
									html+='<input type="checkbox" checked="checked" value="1"" name="" id="input_'+prodId+'_'+servSpecId+'" onclick="javascript:{common.setBtnTimer(this);AttachOffer.closeServSpec('+prodId+','+servSpecId+',\''+spec.servSpecName+'\',\''+spec.ifParams+'\');}"/><label for="input_'+prodId+'_'+servSpecId+'" ></label></div></div>';						
									$li.append(html);
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

//创建合约终端div，用于其他页初始化时展示合约终端
 var _setTerminalDiv=function(prodId,newSpec){
		if(ec.util.isArray(newSpec.agreementInfos)){ //合约销售品需要输入终端
			if(OrderInfo.actionFlag!=14){//非购机入口的
				totalNums=0;
				_removeAttach2Coupons(prodId,newSpec.offerSpecId);//清除串码组
				var objInstId = prodId+'_'+newSpec.offerSpecId;
				//一个终端对应一个ul
				var $div = $('<div id="terminalUl_'+objInstId+'"</div>');				
				var minNum=newSpec.agreementInfos[0].minNum;
				var maxNum=newSpec.agreementInfos[0].maxNum;
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
						var $ulGroups=$('<ul id="ul_'+objInstId+'" class="choice-box m-t-10 border-none" style="display:none;""></ul>');
						var $liGroups = $('<li class="form-group" style="list-style-type:none; "><label> 终端：</label></li>');
						var $selTerms = $('<select class="myselect select-option" data-role="none" id="'+objInstId+'"></select>');
						var $selTermGroups = $('<select class="myselect select-option" data-role="none" id="group_'+objInstId+'"></select>');
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
							var $strAdd=$('<button id="terminalAddBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="0" onclick="AttachOffer.addAndDelTerminal(this)" value="添加" class="btn btn-default">添加</button>');
							var $strDel=$('<button id="terminalDelBtn_'+objInstId+'" type="button" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" fag="1" onclick="AttachOffer.addAndDelTerminal(this)" value="删除" class="btn btn-default">删除</button>');
							$liGroups.append($strAdd).append($strDel);
						}
						$ulGroups.append($liGroups);
						for(var k=1;k<=minNum;k++){
							var $liTerminal = $('<div class="choice-box absolute-l-43 border-top-none">'
									+ '<input id="terminal_text" placeholder="终端校验，请先输入终端串号" maxlength="50"  oninput="showCheckTerminal('+ prodId +')" class="choice-input p-l-0 "'
									 + ' />');
							
							var $li1 = $('<i id="terminal_call" class="iconfont right-btn pull-right p-r-10 m-r-45"'
									+' onclick="common.callScanning(\'order.service.terminalScaningCallBack\','+prodId+')">&#xe641;</i>');
							var $li4 = $('<i id="terminal_check" class="iconfont right-btn pull-right p-r-10 m-r-45 dis-none"'
										+ ' num="'+k+'" flag="'+isFastOffer+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)">&#xe672;</i>');
							var $li2 = $('<i id="terminal_release" class="iconfont right-btn pull-right p-r-10 m-r-45 dis-none"'
										+ ' onclick="product.uim.releaseUim('+prodId+')">&#xe673;</i>')
//							var $liTerminal=$('<li class="form-group" style="list-style-type:none;"><label for="exampleInputPassword1">终端校验<span class="text-warning">*</span></label><div class="input-group"><input id="terminalText_'+objInstId+'_'+k+'" type="text" class="form-control" maxlength="50" placeholder="请先输入终端串号" />'
//									+'<span class="input-group-btn"><button id="terminalBtn_'+objInstId+'_'+k+'" type="button" num="'+k+'" flag="'+isFastOffer+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" onclick="AttachOffer.checkTerminalCode(this)" class="btn btn-info">校验</button></span></div></li>');
//							var	$li4 = $('<li id="terminalDesc_'+k+'" style="display:none;list-style-type:none;" ><label></label><label id="terminalName_'+k+'"></label></li>');
							
							$liTerminal.append($li1).append($li4).append($li2);
							
						}
						totalNums+=minNum;
				}
				var addTerminalId = {
						prodId : prodId,
				};
				AttachOffer.addTerminalList.push(addTerminalId);
				AttachOffer.terminalDiv = $liTerminal.append($ulGroups);
				if(newSpec.agreementInfos[0].minNum>0){//合约里面至少要有一个终端
					newSpec.isTerminal = 1;
				}
			}
		}
 }
	return {
		openList				: _openList,
		openedList				: _openedList,
		openServList			: _openServList,
		openedServList 			: _openedServList,
		queryAttachOfferSpec    :_queryAttachOfferSpec,
		initMyfavoriteSpec      :_initMyfavoriteSpec,
		myFavoriteList          : _myFavoriteList,
		myFavoriteOfferList     : _myFavoriteOfferList,
		setAttachBusiOrder      :_setAttachBusiOrder,
		addOfferSpec            :_addOfferSpec,
		changeShowAttachOffer   :_changeShowAttachOffer,
		initServSpec            :_initServSpec,
		initCanBuyAttachSpec    :_initCanBuyAttachSpec,
		setSpec                 :_setSpec,
		addMainfavoriteSpec     :_addMainfavoriteSpec,
		delMainfavoriteSpec     :_delMainfavoriteSpec,
		addMyfavoriteSpec       :_addMyfavoriteSpec,
		delMyfavoriteSpec       :_delMyfavoriteSpec,
		setMyfavoriteSpec       :_setMyfavoriteSpec,
		searchAttachOfferSpec   :_searchAttachOfferSpec,
		openServSpec            :_openServSpec,
		checkServExcludeDepend  :_checkServExcludeDepend,
		showServParam           :_showServParam,
		addOpenList             :_addOpenList,
		addOpenServList         :_addOpenServList,
		manyPhoneFilter         :_manyPhoneFilter,
		isChangeUim             :_isChangeUim,
		filterServ				:_filterServ,
		addTerminal			:_addTerminal,
		terminalDiv			:_terminalDiv,
		checkTerminalCode	:_checkTerminalCode,
		delOfferSpec		:_delOfferSpec,
		checkOfferExcludeDepend :_checkOfferExcludeDepend,
		showParam			:_showParam,
		setParam			:_setParam,
		closeServSpec		:_closeServSpec,
		queryOfferAndServDependForCancel	:_queryOfferAndServDependForCancel,
		showMainRoleProd	:_showMainRoleProd,
		delOffer			:_delOffer,
		addOffer			:_addOffer,
		closeServ			:_closeServ,
		addTerminalList		:_addTerminalList,
		init				:_init,
		queryAttachOffer	:_queryAttachOffer,
		phone_checkOfferExcludeDepend       :_phone_checkOfferExcludeDepend,
		offer_showMainParam :_offer_showMainParam,
		showMainParam       :_showMainParam,
		offerSpecIds		:_offerSpecIds,
		queryGiftServerSpec :_queryGiftServerSpec,
		setTerminalDiv      :_setTerminalDiv,
		offerSpecIds		:_offerSpecIds,
		checkYZFRight		:_checkYZFRight,
		checkTerminalVal	:_checkTerminalVal,
		hasYzfTd            :_hasYzfTd
	};
})();
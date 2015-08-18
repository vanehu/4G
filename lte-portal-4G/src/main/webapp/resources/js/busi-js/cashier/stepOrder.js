CommonUtils.regNamespace("stepOrder", "main");

/**
 * 分段受理--订单还原
 * @author jinjian
 */
stepOrder.main = (function(){
	var _isStepOrder = false; //标识位，是否是分段受理
	var _funcIfCancel = null; //保存进入订单换还原时的回调函数，在退出时调用
	var _dataDestoryFuncs = []; //保存数据销毁时需要调用的函数，数组形式
	var _loadComplete = false; //是否正常加载完成
	var _delOrderOperate = false; //是否具有作废购物车的权限
	
	var _orderParam = {}; //保存订单ID,订单流水,购物车流程等入参
	var _areaId = null; //受理地区ID
	var _partyId = null; //客户ID
	var _busitypeflag = 0; //购物车业务动作类型  （订单属性）
	var _threeToFour = null; //3转4标识，Y/N  （订单属性） 
	var _orderRemark = null; //订单备注  （订单属性）
	
	var _planOfferSpec = null; //合约计划终端规格构成
	var _saveUimCount = 0; //需要校验补录UIM卡的数量
	var _saveTerminalCount = 0; //需要校验补录终端的数量
	var _tempProdInfos = []; //存放产品与接入号关系
	
	var _uimInfosToCheck = []; //保存需要校验的uim基本信息
	var _terminalInfosToCheck = []; //保存需要校验的终端基本信息
	var _attach2Coupons = []; //附属销售品需要的物品信息
	var _boProd2Tds = []; //UIM卡节点信息列表
	
	var _offer = null; //主销售品实例构成
	var _mainProdOfferInstInfos = null; //可选包变更，产品实例信息
	var _attachOffersS1 = []; //附属销售品订购信息，S1
	var _attachOffersS2 = []; //附属销售品退订信息，S2
	var _attachOffersS3 = []; //附属销售品修改信息，S3
	var _serv7 = []; //功能产品订购退订信息，7
	var activtyType = "";
	
	/**
	 * 分段受理的订单还原入口
	 * @param orderParam = {areaId:"",acctNbr:"",custId:"",soNbr:"",instId:"",olId:""}
	 * @param funcIfCancel "退出"时的回调函数,可为空
	 */
    var _orderReduction = function(orderParam,funcIfCancel){
    	try {
    		console.log(orderParam);
    		_dataDestory();
    	} catch (e) {
    	}
    	if(orderParam == null){
    		$.alert("提示","分段受理订单还原入参异常，无法继续受理！");
    		return false;
    	} else {
    		//必填入参
    		var paraNames = ["areaId","soNbr","olId"];
    		for(var i=0;i<paraNames.length;i++){
    			if(!orderParam[paraNames[i]]){
    				$.alert("提示","分段受理订单还原入参异常，无法继续受理！");
    	    		return false;
    			}
    		}
    	}
    	stepOrder.main.orderParam = $.extend({},stepOrder.main.orderParam,orderParam);
    	OrderInfo.order.soNbr = orderParam.soNbr;
    	if(funcIfCancel != null && typeof(funcIfCancel) == "function"){
    		_funcIfCancel = funcIfCancel;
    	}
    	
    	//1、调用数据抽取接口获取订单提交信息
    	var orderListInfo = _queryOrderListInfoByCustomerOrderId({"olId" : orderParam.olId , "customerOrderId" : orderParam.olId});
    	if(orderListInfo){
    		//2、根据报文初始化订单确认页面
    		var submitOutParam = _dataInjection(orderListInfo);
    		var returnData = _gotosubmitOrder(submitOutParam);
    		_loadComplete = _orderConfirm(returnData,orderListInfo);
    	}
    	if(!_loadComplete){
    		$.alert("提示","分段受理加载异常！");
    		$("#orderConfirmBtn").hide();
    		$("#div_tab_resources").hide();
    		$("#fill_resources").hide();
    	}
    };
	
    //数据抽取，根据olId查询订单提交信息
    var _queryOrderListInfoByCustomerOrderId = function(param){
    	if(param == null || !param.olId){
    		$.alert("提示","数据抽取入参异常，无法继续受理！");
    		try {
        		console.log(param);
    		} catch (e) {
    		}
    		return false;
    	}
    	var url = contextPath+"/order/queryOrderListInfoByCustomerOrderId";
		$.ecOverlay("<strong>正在抽取数据中，请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == 0) {
			return response.data;
		}else if (response.code == -2) {
			$.alertM(response.data);
			return false;
		}else{
			$.alert("提示","数据抽取查询失败，请稍后重试！");
			return false;
		}
    };
		
    //页面步骤,优化页面显示功能
	var _step = function(k,data){
		if(k==2){ //订单确认填写页面
			//修改客户按钮隐藏
            $("#custModifyId").attr("style","display: none;");
			$("#main_conetent").hide();
			$("#order_fill_content").hide();
			$("#order_tab_panel_content").hide();
			$("#order_quick_nav").hide();
			$("#custQryDiv").hide(); //客户定位
			$("#order_prepare").hide(); //填单部分
			$(".main_quick_div").hide(); //快捷操作栏
			$("#order_confirm").html(data).show();	
		}
		for (var i = 1; i < 4; i++) {
			$("#step"+i).hide();
		}
		$("#step"+k).show();
	};
	
	//跳转到分段受理订单确认页面
	var _gotosubmitOrder = function(orderdata){
		var url = contextPath+"/order/gotosubmitStepOrder";
		$.ecOverlay("<strong>订单加载中，请稍等...</strong>");
		var response = $.callServiceAsHtml(url,JSON.stringify(orderdata));
		$.unecOverlay();
		return response.data;
	};
	
	//订单确认
	var _orderConfirm = function(htmlData,submitInParam){
		_step(2,htmlData);
		//记录olId到cookie，用于取消订单
//		SoOrder.delOrderBegin();
		
		/* 抽取报文信息 */
		var _checkedUimInfos = []; //已校验的UIM卡信息
		var _checkedTerminalInfos = []; //已校验的终端信息
//		var _uimInfosToChangeCard = []; //补换卡动作，保存未校验UIM卡相关信息
		var _planOfferInfo = null; //未校验终端的合约计划信息
		var _mainOfferBusiOrder = null; //订单提交--主销售品节点
		var _mainOfferBusiOrderDel=null;//套餐变更的原套餐
		var _prodBusiOrder=[];//产品节点
		var _orderListInfo = submitInParam.result.orderList.orderListInfo;
		var _busiOrder = submitInParam.result.orderList.custOrderList[0].busiOrder;
		var _custOrderAttrs = _orderListInfo.custOrderAttrs; //订单属性
		stepOrder.main.areaId = _orderListInfo.areaId; //受理地区ID
		_partyId = _orderListInfo.partyId; //客户ID
		
		//遍历订单属性
		for(var i=0;i<_custOrderAttrs.length;i++){
			if(_custOrderAttrs[i].attrId == CONST.BUSI_ORDER_ATTR.BUSITYPE_FLAG){
				_busitypeflag = _custOrderAttrs[i].value;
			} else if(_custOrderAttrs[i].attrId == CONST.BUSI_ORDER_ATTR.THRETOFOUR_ITEM){
				_threeToFour = _custOrderAttrs[i].value;
			} else if(_custOrderAttrs[i].attrId == CONST.BUSI_ORDER_ATTR.REMARK){
				_orderRemark = _custOrderAttrs[i].value;
			}
		}
		
		$.each(_busiOrder,function(){
			var _actionClassCd = this.boActionType.actionClassCd;
			var _boActionTypeCd = this.boActionType.boActionTypeCd;
//			if (_boActionTypeCd == CONST.BO_ACTION_TYPE.BUY_OFFER && this.busiObj.instId == "700003866105") { //订购销售品
//				alert("sdssdddd");
//				activtyType = this.busiObj.activtyType;
//				activtyType = "2";
//				
//			}
			//订单确认业务动作展示，展示固定的动作类型，S1、S2、S3、7
			if (_actionClassCd == CONST.ACTION_CLASS_CD.OFFER_ACTION && _boActionTypeCd == CONST.BO_ACTION_TYPE.BUY_OFFER) { //订购销售品、退订销售品、变更销售品参数
				if(this.busiObj.offerTypeCd != "1"){ //非 主销售品订购
					_attachOffersS1.push(this);
				}
			} else if (_actionClassCd == CONST.ACTION_CLASS_CD.OFFER_ACTION && _boActionTypeCd == CONST.BO_ACTION_TYPE.DEL_OFFER) { //订购销售品、退订销售品、变更销售品参数
				_attachOffersS2.push(this);
			} else if (_actionClassCd == CONST.ACTION_CLASS_CD.OFFER_ACTION && _boActionTypeCd == CONST.BO_ACTION_TYPE.UPDATE_OFFER) { //订购销售品、退订销售品、变更销售品参数
				_attachOffersS3.push(this);
			} else if (_actionClassCd == CONST.ACTION_CLASS_CD.PROD_ACTION && _boActionTypeCd == CONST.BO_ACTION_TYPE.SERV_OPEN) { //订购销售品、退订销售品、变更销售品参数
				_serv7.push(this);
			}
			
//			if (_actionClassCd == CONST.ACTION_CLASS_CD.OFFER_ACTION
//					&& (_boActionTypeCd == CONST.BO_ACTION_TYPE.BUY_OFFER || _boActionTypeCd == CONST.BO_ACTION_TYPE.DEL_OFFER
//							|| _boActionTypeCd == CONST.BO_ACTION_TYPE.UPDATE_OFFER || _boActionTypeCd == CONST.BO_ACTION_TYPE.SERV_OPEN)) { //订购销售品、退订销售品、变更销售品参数
//				$("#chooseTable").append($('<tr><td width="50%">'+this.busiObj.name+'</td><td>'+this.boActionType.name+'</td></tr>'));
//			} else if(_actionClassCd == CONST.ACTION_CLASS_CD.PROD_ACTION && _boActionTypeCd == CONST.BO_ACTION_TYPE.SERV_OPEN){ //变更功能产品
//				var state = this.data.boServs[0].state;
//				$("#chooseTable").append($('<tr><td width="50%">'+this.data.boServOrders[0].servSpecName+'</td><td>'+(state=="ADD"?"开通功能产品":"关闭功能产品")+'</td></tr>'));
//			}
			
			//产品节点或补换卡节点，获取UIM卡信息NEW_PROD
			if (_actionClassCd == CONST.ACTION_CLASS_CD.PROD_ACTION && (_boActionTypeCd == CONST.BO_ACTION_TYPE.NEW_PROD || _boActionTypeCd == CONST.BO_ACTION_TYPE.CHANGE_CARD)) {
				var checkedUimInfo = null;
				if(this.data.bo2Coupons != undefined && this.data.bo2Coupons.length > 0){
					var accessNumber=this.busiObj.accessNumber;
					var name=this.busiObj.name;
					var boId=this.busiOrderInfo.boId;
					$.each(this.data.bo2Coupons,function(){
						if(this.state=="ADD"){
							checkedUimInfo = {
								"accessNumber" : accessNumber,
								"roleName" : name,
								"couponInstanceNumber" : this.couponInstanceNumber,
								"boId" : boId,
								"type" : "1" //1-uim，2-终端
							};
							_checkedUimInfos.push(checkedUimInfo);
						}
					});
				} 
				if(!checkedUimInfo){ //没有已校验的UIM卡,产品或补换卡动作没有ADD动作的UIM信息
					var _uimInfo = {
							"accessNumber" : this.busiObj.accessNumber,
							"roleName" : this.busiObj.name,
							"couponInstanceNumber" : "",
							"boId" : this.busiOrderInfo.boId,
							"busiOrder" : this,
							"type" : "1" //1-uim，2-终端
					};
					_uimInfosToCheck.push(_uimInfo);
				}
			}
			
			//销售品节点，合约信息
			if (_actionClassCd == CONST.ACTION_CLASS_CD.OFFER_ACTION && _boActionTypeCd == CONST.BO_ACTION_TYPE.BUY_OFFER) {
				//是否有合约计划
				if(this.busiObj.agreementAttr == "20020049"){
					var _prodInstId = null; //产品实例ID
					for(var i=0;i<this.data.ooRoles.length;i++){
						if(this.data.ooRoles[i].objType == CONST.OBJ_TYPE.PROD){ //接入类产品
							_prodInstId = this.data.ooRoles[i].objInstId;
							break;
						}
					}
					if(this.data.bo2Coupons != undefined && this.data.bo2Coupons.length > 0){
						for(var i=0;i<this.data.bo2Coupons.length;i++){
							var _terminalInfos = {
									"accessNumber" : this.busiObj.accessNumber,
									"roleName" : this.busiObj.name,
									"couponInstanceNumber" : this.data.bo2Coupons[i].couponInstanceNumber,
									"type" : "2", //1-uim，2-终端
									"boId" : this.busiOrderInfo.boId,
									"prodInstId" : _prodInstId
							};
							_checkedTerminalInfos.push(_terminalInfos);
						}
					} else {
						_planOfferInfo = {
							"accessNumber" : this.busiObj.accessNumber,
							"objId" : this.busiObj.objId,  //销售品规格ID
							"name" : this.busiObj.name,
							"boId" : this.busiOrderInfo.boId,
							"prodInstId" : _prodInstId
						}; 
					}
				}
			}
			//针对新装产品节点
			if (_actionClassCd == CONST.ACTION_CLASS_CD.PROD_ACTION && _boActionTypeCd == CONST.BO_ACTION_TYPE.NEW_PROD) {
				_prodBusiOrder.push(this);
			}
			
			//主销售品节点
			if(_mainOfferBusiOrder == null||_mainOfferBusiOrderDel==null){
				if(_actionClassCd == CONST.ACTION_CLASS_CD.OFFER_ACTION && _boActionTypeCd == CONST.BO_ACTION_TYPE.BUY_OFFER && this.busiObj.offerTypeCd == "1"){
					_mainOfferBusiOrder = this;
				}else if(_actionClassCd == CONST.ACTION_CLASS_CD.OFFER_ACTION && _boActionTypeCd == CONST.BO_ACTION_TYPE.DEL_OFFER && this.busiObj.offerTypeCd == "1"){
					_mainOfferBusiOrderDel=this;
				}
			}
			
		});

//		//不是新装、主副卡成员变更副卡新装(主副卡变更但没有产品节点) 的话全量查询
//		if(_busitypeflag && _busitypeflag != "1" && (_busitypeflag != "3" || ( _busitypeflag == "3" && !ec.util.isArray(_prodBusiOrder)))){
//			var param = {
//					areaId : stepOrder.main.orderParam.areaId,
//					acctNbr : stepOrder.main.orderParam.acctNbr,
//					custId : stepOrder.main.orderParam.custId,
//					soNbr : stepOrder.main.orderParam.soNbr,
//					instId : stepOrder.main.orderParam.instId,
//					type : "2"
//			};
//			if (!query.offer.invokeLoadInst(param)) {
//				return false;
//			}
//		}
		
		//显示订单备注
		if(_orderRemark){
			$("#order_remark").html(_orderRemark);
			$("#div_order_remark").show();
		}
		
		/*
		 * 1）如何判断要补录的uim卡数量及信息：
		 * 根据报文中的产品节点和补换卡节点下有无物品信息，无则需要补录；
		 * 由于在填单时完善报文信息，废除以下原有的判断逻辑：
		 * 根据报文中购物车业动作判断，
		 * 1.1）如果是可选包变更
		 * 根据订单属性中3转4标识，如果是3转4，且没有已校验的UIM卡信息，则需要补录UIM卡；
		 * 1.2）如果是套餐变更
		 * 且订单属性是3转4，先获取已校验的UIM卡数量n，获取主销售品的成员数量m，n<m时，需要遍历主销售品成员（ooRole），根据接入号及产品实例ID查询产品下终端实例数据（queryTerminalInfo），如果返回为3G卡，则需要补换卡；
		 * 1.3）如果是新装
		 * 先获取已校验的UIM卡数量n，获取主销售品的成员数量m，n<m时，需要遍历主销售品成员（ooRole），如果没有对应已校验UIM卡，则需要补录
		 * 1.4）如果是实物销售，暂时不需考虑，分段受理暂不支持从购机页面进入；
		 * 1.5）其他情况，没有UIM的输入，不需考虑；
		 */
		var maxTenimal=1;//可选包对应的主套餐的销售品角色
		if(_busitypeflag == "14"){ //可选包变更
			$("#tital").append("<span>订购/退订可选包与功能产品</span>");
			var param={
				areaId: ""+stepOrder.main.areaId,
				acctNbr: stepOrder.main.orderParam.acctNbr,
				custId: _partyId,
				curPage:"1",
				pageSize:"5"
			};
			var prodInfo=query.offer.queryProduct(param);
			if(prodInfo==undefined){
				return false;
			}else{
				for(var i=0;i<prodInfo.length;i++){
					if (prodInfo[i].accNbr == stepOrder.main.orderParam.acctNbr){
						var prodInstInfos = prodInfo[i];
						_mainProdOfferInstInfos = prodInstInfos.mainProdOfferInstInfos[0];
						var _param = {
							acctNbr : stepOrder.main.orderParam.acctNbr,
							offerId : _mainProdOfferInstInfos.prodOfferInstId,
							offerSpecId : _mainProdOfferInstInfos.prodOfferId,
							areaId : stepOrder.main.areaId
						};
						mainOfferInstMembers = query.offer.queryOfferInst(_param);
						if(mainOfferInstMembers==undefined){
							return false;
						}
						if(ec.util.isArray(mainOfferInstMembers.offerMemberInfos)){
							maxTenimal=mainOfferInstMembers.offerMemberInfos.length;
						}
						$("#orderTbody").append("<tr><td >套餐名称：</td><td>"+_mainProdOfferInstInfos.prodOfferName+"</td></tr>");
						$("#orderTbody").append("<tr><td >手机号码：</td><td>"+stepOrder.main.orderParam.acctNbr+"</td></tr>");
						break;
					}
				}
			}
//			if(_threeToFour == "Y"){
//				if(_uimInfosToChangeCard.length > 0){
//					//添加补录UIM卡
//					_uimInfosToCheck.push(_uimInfosToChangeCard[0]);
//				}
//			}
		} else if(_busitypeflag == "2") { //套餐变更
			$("#tital").append("<span>套餐变更</span>");
			$("#orderTbody").append("<tr><td >套餐名称：</td><td>"+_mainOfferBusiOrderDel.busiObj.name+"</td></tr>");
			$("#orderTbody").append("<tr><td >新套餐名称：</td><td>"+_mainOfferBusiOrder.busiObj.name+"</td></tr>");
//			if(_threeToFour == "Y"){
//				if(!_mainOfferBusiOrder || !_mainOfferBusiOrder.data){
//					$.alert("提示","套餐变更未返回主销售品订购信息，无法继续受理!");
//					return false;
//				}
//				var _ooRoles = _mainOfferBusiOrder.data.ooRoles;
//				if(!_ooRoles){
//					$.alert("提示","套餐变更未返回主销售品成员，无法继续受理!");
//					return false;
//				}
//				if(_checkedUimInfos.length < _ooRoles.length){
//					for(var i=0;i<_ooRoles.length;i++){
//						if(_ooRoles[i].objType == CONST.OBJ_TYPE.PROD){ //接入类产品
//							var hasCheckedUim = false;
//							for(var j=0;j<_checkedUimInfos.length;j++){
//								if(_ooRoles[i].accessNumber == _checkedUimInfos[j].accessNumber){
//									hasCheckedUim = true;
//									break;
//								}
//							}
//							if(!hasCheckedUim){
//								//没有包含已校验的UIM卡,判断产品下终端实例,是否为3G卡,是则需要补录UIM
//								var _params = {
//										prodId: _ooRoles[i].objInstId,
//										areaId: _mainOfferBusiOrder.areaId,
//										acctNbr: _ooRoles[i].accessNumber
//								};
//								var _prodUimInfo = _getTerminalInfo(_params);
//								if(uim == undefined){  //查询旧卡信息失败返回
//									return false;
//								}
//								if(_prodUimInfo.is4GCard == "N"){
//									//添加补录UIM卡
//									var _uimInfo = {
//											"accessNumber" : _ooRoles[i].accessNumber,
//											"roleName" : _ooRoles[i].name,
//											"couponInstanceNumber" : "",
//											"type" : "1" //1-uim，2-终端
//									};
//									_uimInfosToCheck.push(_uimInfo);
//								}
//							}
//						}
//					}
//				}
//			}
		} else if(_busitypeflag == "1") { //新装
			if(!_mainOfferBusiOrder || !_mainOfferBusiOrder.data){
				$.alert("提示","新装未返回主销售品订购信息，无法继续受理!");
				return false;
			}
			$("#orderTbody").append("<tr><td >套餐名称：</td><td>"+_mainOfferBusiOrder.busiObj.name+"</td></tr>");
			$.each(_prodBusiOrder,function(){
				var instId=this.busiObj.instId;
				var accessNumber=this.busiObj.accessNumber;
				$.each(_mainOfferBusiOrder.data.ooRoles,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						var objInstId=this.objInstId;
						var roleName=this.roleName;
						if(instId==objInstId){
							$("#orderTbody").append("<tr ><td>"+roleName+"号码：</td><td>"
									+accessNumber+"</td></tr> ");
						}
					}
				});
			});
			$("#tital").append("<span>订购</span>"+_mainOfferBusiOrder.busiObj.name+"<span class='showhide'></span>");
//			var _ooRoles = _mainOfferBusiOrder.data.ooRoles;
//			if(!_ooRoles){
//				$.alert("提示","新装未返回主销售品成员，无法继续受理!");
//				return false;
//			}
//			if(_checkedUimInfos.length < _ooRoles.length){
//				for(var i=0;i<_ooRoles.length;i++){
//					if(_ooRoles[i].objType == CONST.OBJ_TYPE.PROD){ //接入类产品
//						var hasCheckedUim = false;
//						for(var j=0;j<_checkedUimInfos.length;j++){
//							if(_ooRoles[i].accessNumber == _checkedUimInfos[j].accessNumber){
//								hasCheckedUim = true;
//								break;
//							}
//						}
//						if(!hasCheckedUim){
//							//添加补录UIM卡
//							var _uimInfo = {
//									"accessNumber" : _ooRoles[i].accessNumber,
//									"roleName" : _ooRoles[i].name,
//									"couponInstanceNumber" : "",
//									"type" : "1" //1-uim，2-终端
//							};
//							_uimInfosToCheck.push(_uimInfo);
//						}
//					}
//				}
//			}
		} else {
			$("#tital").append("<span>分段受理</span>");
		}
		
		/*
		 * 2）如何判断是否需要补录终端机以及多机处理：
		 * 遍历busiObj中agreementAttr ，不为空，表示在对应接入类产品下办理了合约计划，判断bo2Coupons如果为空，表示该合约计划未校验终端；
		 * 根据合约计划的销售品规格ID，以及主销售品的规格ID（主销售品订购节点objId），查询该销售品的规格构成，提取其中的终端类型，在终端校验时需要用到；
		 */
		if(_planOfferInfo != null){
			var mainOfferSpecId = null;
			if(_mainOfferBusiOrder){
				mainOfferSpecId = _mainOfferBusiOrder.busiObj.objId;
			} else if(_mainProdOfferInstInfos){
				mainOfferSpecId = _mainProdOfferInstInfos.prodOfferId;
			}
			if(!mainOfferSpecId){
				$.alert("提示","新装/套餐变更未获取到主套餐订购信息，或可选包变更未查询到产品实例信息！");
				return false;
			}
			var _param = {
				"areaId" : stepOrder.main.areaId,
				"mainOfferSpecId" : mainOfferSpecId,
				"offerSpecId" : _planOfferInfo.objId,
				"offerTypeCd" : 2,
				"partyId" : _partyId
			};
			_planOfferSpec = _queryOfferSpec(_param);
			if(!_planOfferSpec){
				return false;
			}
			if(!_planOfferSpec.agreementInfos || !_planOfferSpec.agreementInfos.length){
				$.alert("提示","查询合约规格构成未返回终端合约信息agreementInfos");
				return false;
			}
			activtyType=_planOfferSpec.agreementInfos[0].activtyType;
			var maxNum=_planOfferSpec.agreementInfos[0].maxNum;
			if(_busitypeflag == "1"){
				if(maxNum>_prodBusiOrder.length){
					_planOfferSpec.agreementInfos[0].maxNum=_prodBusiOrder.length;
				}
			}else if(_busitypeflag == "14"){
				if(_planOfferSpec.agreementInfos[0].maxNum>maxTenimal){
					_planOfferSpec.agreementInfos[0].maxNum=maxTenimal;
				}
			}
			//添加补录终端
			var _terminalInfo = {
				"accessNumber" : _planOfferInfo.accessNumber,
				"roleName" : "",
				"couponInstanceNumber" : "",
				"boId" : _planOfferInfo.boId,
				"type" : "2" //1-uim，2-终端
			};
			_terminalInfosToCheck.push(_terminalInfo);
		}
		
		if(_mainOfferBusiOrder&&_busitypeflag != "1"&& (_busitypeflag != "3" || ( _busitypeflag == "3" && ec.util.isArray(_prodBusiOrder)))){
			//查询主销售品实例构成，获取成员接入号
			var _param = {
				acctNbr : _mainOfferBusiOrder.busiObj.accessNumber,
				offerId : _mainOfferBusiOrder.busiObj.instId,
				offerSpecId : _mainOfferBusiOrder.busiObj.objId,
				areaId : _mainOfferBusiOrder.areaId
			};
			if(_busitypeflag=="2"){
				_param.acctNbr=_mainOfferBusiOrderDel.busiObj.accessNumber;
				_param.offerId=_mainOfferBusiOrderDel.busiObj.instId;
				_param.offerSpecId=_mainOfferBusiOrderDel.busiObj.objId;
				_param.areaId=_mainOfferBusiOrderDel.areaId;
			}
			var mainOfferInst = query.offer.queryOfferInst(_param);
			if(mainOfferInst==undefined){
				return false;
			}
			if(ec.util.isArray(mainOfferInst.offerMemberInfos)&&ec.util.isObj(_planOfferSpec)){
				if(_planOfferSpec.agreementInfos[0].maxNum>mainOfferInst.offerMemberInfos.length){
					_planOfferSpec.agreementInfos[0].maxNum=mainOfferInst.offerMemberInfos.length;
				}
			}
			for(var i=0;i<mainOfferInst.offerMemberInfos.length;i++){
				for(var j=0;j<_mainOfferBusiOrder.data.ooRoles.length;j++){
					if(_mainOfferBusiOrder.data.ooRoles[j].objInstId == mainOfferInst.offerMemberInfos[i].objInstId){
						_mainOfferBusiOrder.data.ooRoles[j].accessNumber = mainOfferInst.offerMemberInfos[i].accessNumber;
						_mainOfferBusiOrder.data.ooRoles[j].roleName = mainOfferInst.offerMemberInfos[i].roleName;
						_mainOfferBusiOrder.data.ooRoles[j].roleCd = mainOfferInst.offerMemberInfos[i].roleCd;
						break;
					}
				}
			}
			_offer = { //主销售品实例构成
				offerId : _mainOfferBusiOrder.busiObj.instId,
				offerSpecId : _mainOfferBusiOrder.busiObj.objId,
				offerMemberInfos : mainOfferInst.offerMemberInfos
			}; 
			var mainCard=false;
			$.each(_offer.offerMemberInfos,function(){
				if(!mainCard){
					$.each(_offer.offerMemberInfos,function(){
						if(this.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){
							$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.roleName+')</th><th>业务动作</th></tr>'));		
							_showMemberBusiItems(this);
							mainCard=true;
							return false;
						}
					});
				}
				if(this.roleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){
					$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.roleName+')</th><th>业务动作</th></tr>'));		
					_showMemberBusiItems(this);
				}
			});
			
		}else if(_mainOfferBusiOrder && (_busitypeflag == "1" || (_busitypeflag == "3" && ec.util.isArray(_prodBusiOrder)))){//新装和副卡新装从产品节点下面获取接入号
			var ooRoles=[];
			for(var j=0;j<_prodBusiOrder.length;j++){
				for(var i=0;i<_mainOfferBusiOrder.data.ooRoles.length;i++){
					if(_mainOfferBusiOrder.data.ooRoles[i].objInstId == _prodBusiOrder[j].busiObj.instId){
						_mainOfferBusiOrder.data.ooRoles[i].accessNumber = _prodBusiOrder[j].busiObj.accessNumber;
						ooRoles.push(_mainOfferBusiOrder.data.ooRoles[i]);
						break;
					}
				}
			}
			_mainOfferBusiOrder.data.ooRoles=ooRoles;//排序 按主副卡来排序
			_offer = { //主销售品实例构成
				offerId : _mainOfferBusiOrder.busiObj.instId,
				offerSpecId : _mainOfferBusiOrder.busiObj.objId,
				offerMemberInfos : ooRoles
			}; 
			
			$.each(_offer.offerMemberInfos,function(){
				$("#chooseTable").append($('<tr><th width="50%">业务名称('+this.roleName+')</th><th>业务动作</th></tr>'));		
				_showMemberBusiItems(this);
			});
		} else {
			$("#chooseTable").append($('<tr><th width="50%">业务名称</th><th>业务动作</th></tr>'));
			_showMemberBusiItems();
		}
		

		//不是【新装 或 主副卡成员变更副卡新装(主副卡变更且有产品节点)】 的话全量查询
		if(_busitypeflag && !(_busitypeflag == "1" || (_busitypeflag == "3" && ec.util.isArray(_prodBusiOrder)))){
			
			var vFlag = true;
			var param = {
					areaId : stepOrder.main.orderParam.areaId,
					acctNbr : stepOrder.main.orderParam.acctNbr,
					custId : stepOrder.main.orderParam.custId,
					soNbr : stepOrder.main.orderParam.soNbr,
					instId : stepOrder.main.orderParam.instId,
					type : "2"
			};
			//如果有主销售品实例构成,则取实例中成员分别查询全量
			if(_offer){
				$.each(_offer.offerMemberInfos,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						param.acctNbr = this.accessNumber;
						param.instId = this.objInstId;
						if (!query.offer.invokeLoadInst(param)) {
							vFlag = false;
						}
					}
				});
			} else {//否则使用订单还原入参查询全量
				if (!query.offer.invokeLoadInst(param)) {
					vFlag = false;
				}
			}
			if(!vFlag){
				return false;
			}
		}
		
		_showMemberRole(_checkedUimInfos,_checkedTerminalInfos,_uimInfosToCheck,_terminalInfosToCheck,_mainOfferBusiOrder);
		
		return true;
	};
	
	//显示指定产品下的业务信息，memberInfo为空时显示所有产品下的业务信息
	var _showMemberBusiItems = function(memberInfo){
		$.each(_attachOffersS1.concat(_attachOffersS2).concat(_attachOffersS3),function(){
			if(memberInfo){
				if(memberInfo.accessNumber == this.busiObj.accessNumber){
					$("#chooseTable").append($('<tr><td width="50%">'+this.busiObj.name+'</td><td>'+this.boActionType.name+'</td></tr>'));
				}
			} else {
				$("#chooseTable").append($('<tr><td width="50%">'+this.busiObj.name+'</td><td>'+this.boActionType.name+'</td></tr>'));
			}
		});
		$.each(_serv7,function(){
			var state = this.data.boServs[0].state == "ADD" ? "开通功能产品" : "关闭功能产品";
			if(memberInfo){
				if(memberInfo.accessNumber == this.busiObj.accessNumber){
					$("#chooseTable").append($('<tr><td width="50%">'+this.data.boServOrders[0].servSpecName+'</td><td>'+state+'</td></tr>'));
				}
			} else {
				$("#chooseTable").append($('<tr><td width="50%">'+this.data.boServOrders[0].servSpecName+'</td><td>'+state+'</td></tr>'));
			}
		});
	};
	
	//显示成员及已校验、补录的UIM和终端信息
	var _showMemberRole = function(checkedUimInfos,checkedTerminalInfos,uimInfosToCheck,terminalInfosToCheck,mainOfferBusiOrder){
		if(mainOfferBusiOrder){
			//tab标签
			var _ooRoles = mainOfferBusiOrder.data.ooRoles;
			if(!_ooRoles){
				return false;
			}
			for(var i=0;i<_ooRoles.length;i++){
				if(_ooRoles[i].objType == CONST.OBJ_TYPE.PROD){ //接入类产品
					var $li = $('<li id="tab_'+_ooRoles[i].accessNumber+'" onclick="stepOrder.main.changeLabel('+_ooRoles[i].accessNumber+')">'+_ooRoles[i].roleName+_ooRoles[i].accessNumber+'</li>');
					if(i == 0){
						$li.addClass("setcon");
					}
					$("#tab_resources").append($li);
					
					var $fillUl = $("#ul_fill_"+_ooRoles[i].accessNumber);
					if($fillUl[0]==undefined){
						$fillUl = $('<ul id="ul_fill_'+_ooRoles[i].accessNumber+'" class="fillin"></ul>');
						if(i != 0){
							$fillUl.css("display","none");
						}
						$("#fill_resources").append($fillUl);
					}
				}
			}
		}
		//已校验UIM卡内容标签
		for(var i=0;i<checkedUimInfos.length;i++){
			_checkToAddTabComp(checkedUimInfos[i].accessNumber);
			var $fillLi = $('<li id="li_'+checkedUimInfos[i].type+'_'+checkedUimInfos[i].accessNumber+'" class="full"></li>');
			$fillLi.append('<label>UIM卡号：</label><label style="width:160px;">'+checkedUimInfos[i].couponInstanceNumber+'</label>');
			$("#ul_fill_"+checkedUimInfos[i].accessNumber).append($fillLi);
		}
		//已校验终端内容标签
		for(var i=0;i<checkedTerminalInfos.length;i++){
			_checkToAddTabComp(checkedTerminalInfos[i].accessNumber);
			var $fillLi = $('<li id="li_'+checkedTerminalInfos[i].type+'_'+checkedTerminalInfos[i].accessNumber+'" class="full"></li>');
			$fillLi.append('<label>终端串码：</label><label style="width:160px;">'+checkedTerminalInfos[i].couponInstanceNumber+'</label>');
			$("#ul_fill_"+checkedTerminalInfos[i].accessNumber).append($fillLi);
		}
		//补录UIM卡内容标签
		if(uimInfosToCheck && uimInfosToCheck.length > 0){
			_saveUimCount = uimInfosToCheck.length;
			for(var i=0;i<uimInfosToCheck.length;i++){
				_addSaveUimComp(uimInfosToCheck[i]);
				//添加写卡弹出框标签
				_addWriteCardComp(uimInfosToCheck[i]);
			}
		}
		//补录终端内容标签
		if(terminalInfosToCheck && terminalInfosToCheck.length > 0){
			_saveTerminalCount = terminalInfosToCheck.length;
			for(var i=0;i<terminalInfosToCheck.length;i++){
				_addSaveTerminalComp(terminalInfosToCheck[i]);
			}
		}
	};
	
	//添加写卡弹出框标签，参考write-card.html
	var _addWriteCardComp = function(uimInfo,prodId){
		var prodId = uimInfo.accessNumber; //没写错，只是作为标识
		var html = "";
		html += '<OBJECT id="ocx'+prodId+'" style="height: 0px;width: 0px;" Classid="clsid:5e497bde-0e29-4ac0-bfb1-4af7b7940277" codeBase="${contextPath}/card/common.ocx#version=1.0.0.1"></OBJECT>';
		html += '<div style="display:none" id="ec-dialog-form-container-card'+prodId+'" class="ec-dialog-form-container">';
		html += '<div class="ec-dialog-form-top">';
		html += '<h1 class="ec-dialog-form-title">写卡</h1>';
		html += '</div>';
		html += '<div class="ec-dialog-form-content">';
		html += '<div class="ec-dialog-form-loading" style="display:none"></div>';
		html += '<div class="ec-dialog-form-message" style="display:none"></div>';
		html += '<div class="ec-dialog-form-form" >';
		html += '<form action="#" id="dialogForm">';
		html += '<div>';
		html += '<p class="pb" style="height: 30px;">';
		html += '<label class="w1">手机号码:</label>';
		html += '<input type="text"  id="write_card_phone_number'+prodId+'" class="txt2 inputDisabled" readonly="readonly" disabled="disabled" />';
		html += '</p>';
		html += '<p class="pb" id="dk_content">';
		html += '<label class="w1">卡序列号:</label>';
		html += '<input type="text" class="txt3" id="serialNum'+prodId+'"/>';
		html += '</p>';
		html += '</div>';
		html += '<div align="left" style="margin-left: 60px;">';
		html += '<a class="btna_o" href="javascript:void(0);" id="btnReadCard'+prodId+'"><span>读卡</span></a>&nbsp; <a class="btna_o" href="javascript:void(0);" id="btnWriteCard'+prodId+'"><span>写卡</span></a>';
		html += '</div>';
		html += '<input type="hidden" id="iccid" value=""/>';
		html += '<input type="hidden" id="imsi" value=""/>';
		html += '<a href = "${contextPath}/card/CardMan3x21_V1_1_1_0.exe">下载写卡器驱动</a>';
		html += '</form>';
		html += '</div>';
		html += '</div>';
		html += '<div class="ec-dialog-form-bottom"></div>';
		html += '</div>';
		$("#step_order_main_body").append(html);
		_tempProdInfos.push({
			prodId : prodId,
			accessNumber : uimInfo.accessNumber
		}); 
	};
	
	// 检查并添加tab标签组件
	var _checkToAddTabComp = function(ulIdKey){
		if($("#tab_"+ulIdKey).length == 0){
			var selected = $("#tab_resources li.setcon").length == 0;
			var $li = $('<li id="tab_'+ulIdKey+'" onclick="stepOrder.main.changeLabel('+ulIdKey+')">'+ulIdKey+'</li>');
			if(selected){
				$li.addClass("setcon");
			}
			$("#tab_resources").append($li);
			
			var $fillUl = $("#ul_fill_"+ulIdKey);
			if($fillUl[0]==undefined){
				$fillUl = $('<ul id="ul_fill_'+ulIdKey+'" class="fillin"></ul>');
				if(!selected){
					$fillUl.css("display","none");
				}
				$("#fill_resources").append($fillUl);
			}
		}
	};
	
	//tab切换
	var _changeLabel = function(ulIdKey){
		$("#tab_resources li").removeClass("setcon");
		$("#tab_"+ulIdKey).addClass("setcon");
		
		$("#fill_resources ul").css("display","none");
		$("#ul_fill_"+ulIdKey).css("display","block");
	};
	
	//添加UIM卡补录组件
	var _addSaveUimComp = function(uimInfo){
		_checkToAddTabComp(uimInfo.accessNumber);
		var $fillLi = $('<li id="li_'+uimInfo.type+'_'+uimInfo.accessNumber+'" class="full"></li>');
		$fillLi.append('<label>UIM卡号：</label>');
		$fillLi.append('<input type="text" class="inputWidth183px" value="" id="uim_txt_'+uimInfo.accessNumber+'">');
		$fillLi.append('<input type="button" onclick="stepOrder.main.checkUim('+uimInfo.accessNumber+','+uimInfo.boId+');" value="校验" class="purchase" id="uim_check_btn_'+uimInfo.accessNumber+'">');
		$fillLi.append('<input type="button" onclick="stepOrder.main.releaseUim('+uimInfo.accessNumber+','+uimInfo.boId+');" value="释放" disabled="disabled" class="disablepurchase" id="uim_release_btn_'+uimInfo.accessNumber+'">');
		$fillLi.append('<input type="button" onclick="order.writeCard.writeReadCard('+uimInfo.accessNumber+');" value="写卡" class="purchase" id="uim_write_btn_'+uimInfo.accessNumber+'">'); //将接入号作为标识,传入写卡逻辑中
		$fillLi.append('<input type="hidden" value="no" id="isMIFI_'+uimInfo.accessNumber+'">');
		$fillLi.append('<label class="f_red">*</label>');
		$("#ul_fill_"+uimInfo.accessNumber).append($fillLi);
	};
	
	//添加终端补录组件
	var _addSaveTerminalComp = function(terminalInfo){
		_checkToAddTabComp(terminalInfo.accessNumber);
		var $fillLi = $('<li id="li_'+terminalInfo.type+'_'+terminalInfo.accessNumber+'" class="full"></li>');
		$fillLi.append('<label> 终端：</label>');
		var minNum=_planOfferSpec.agreementInfos[0].minNum;
		var maxNum=_planOfferSpec.agreementInfos[0].maxNum;
		if(maxNum>minNum){
			var $strAdd=$('<input id="terminalAddBtn_'+terminalInfo.accessNumber+'" type="button" prodId="'+terminalInfo.prodInstId+'" offerSpecId="'+_planOfferSpec.offerSpecId+'" accessNumber="'+terminalInfo.accessNumber+'" boId="'+terminalInfo.boId+'" fag="0" onclick="stepOrder.main.addAndDelTerminal(this)" value="添加" class="purchase" style="float:left"></input>');
			var $strDel=$('<input id="terminalDelBtn_'+terminalInfo.accessNumber+'" type="button" prodId="'+terminalInfo.prodInstId+'" offerSpecId="'+_planOfferSpec.offerSpecId+'" accessNumber="'+terminalInfo.accessNumber+'" boId="'+terminalInfo.boId+'" fag="1" onclick="stepOrder.main.addAndDelTerminal(this)" value="删除" class="purchase" style="float:left"></input>');
			$fillLi.append($strAdd).append($strDel);
		}
		$("#ul_fill_"+terminalInfo.accessNumber).append($fillLi);
		
		//初始化最小数量的终端校验输入框
		for(var k=1;k<=minNum;k++){
			var $liTerminal=$('<li class="terminalCheckLi"><label>终端校验：</label><input id="terminalText_'+terminalInfo.accessNumber+'_'+k+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
					+'<input class="terminalDescLi purchase" id="terminalBtn_'+terminalInfo.accessNumber+'_'+k+'" type="button" num="'+k+'" prodId="'+terminalInfo.prodInstId+'" offerSpecId="'+_planOfferSpec.offerSpecId+'" accessNumber="'+terminalInfo.accessNumber+'" boId="'+terminalInfo.boId+'" onclick="stepOrder.main.checkTerminalCode(this)" value="校验" class="purchase" style="float:left"></input></li>');
			var	$li4 = $('<li class="terminalDescLi" id="terminalDesc_'+k+'" style="white-space:nowrap;"><label></label><label id="terminalName_'+k+'"></label></li>');
			$("#ul_fill_"+terminalInfo.accessNumber).append($liTerminal).append($li4);
		}
		_saveTerminalCount = minNum;
	};
	
	//uim卡号校验
	var _checkUim = function(accessNumber,boId){
		if(!accessNumber){
			$.alert("提示","接入号为空，无法校验UIM卡!");
			return false;
		}
		var offerId = "-1"; //新装默认，主销售品ID
		var prodId = "-1"; //TODO 确认资源补录时是否需要传入产品ID,均传入-1是否可行
		var cardNo =$.trim($("#uim_txt_"+accessNumber).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		var inParam = {
			"instCode" : cardNo,
			"phoneNum" : accessNumber + "", //营销资源入参需要字符串参数。。。
			"areaId"   : stepOrder.main.areaId + ""
		};
		var data = query.prod.checkUim(inParam);//校验uim卡
		if(data==undefined || data.baseInfo==undefined){
			return false;
		}
		//根据uim返回数据组织物品节点
		var couponNum = data.baseInfo.qty ;
		if(couponNum==undefined||couponNum==null){
			couponNum = 1 ;
		}
		var coupon = {
			boId : boId, //订单项ID，资源补录时必填参数
			accessNumber : accessNumber,	
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "1",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId : data.baseInfo.mktResId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : "3000", //物品费用项类型
			couponNum : couponNum, //物品数量
			storeId : data.baseInfo.mktResStoreId, //仓库ID
			storeName : "1", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : data.baseInfo.mktResInstCode, //物品实例编码
			terminalCode : data.baseInfo.mktResInstCode,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : _partyId, //客户ID
			prodId :  prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=data.baseInfo.cardTypeFlag;//UIM卡类型
		}
		$("#uim_check_btn_"+accessNumber).attr("disabled",true);
		$("#uim_check_btn_"+accessNumber).removeClass("purchase").addClass("disablepurchase");
		$("#uim_release_btn_"+accessNumber).attr("disabled",false);
		$("#uim_release_btn_"+accessNumber).removeClass("disablepurchase").addClass("purchase");
		$("#uim_txt_"+accessNumber).attr("disabled",true);
		//TODO MIFI卡校验
//		if(getIsMIFICheck(accessNumber)){//判断是否通过MIFI 校验
//			$("#isMIFI_"+accessNumber).val("yes");
//		}else{
//			$("#isMIFI_"+accessNumber).val("no");
//		}
		_clearProdUim(accessNumber);
		stepOrder.main.boProd2Tds.push(coupon);
	};
	
	//uim卡号释放
	var _releaseUim = function(accessNumber){	
		var cardNo =$.trim($("#uim_txt_"+accessNumber).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		//释放UIM并更新门户记录
		var param = {
				numType : 2,
				numValue : cardNo
		};
		var jr = $.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);			
		if(jr.code==-2){
			$.alertM(jr.data);
			return;
		}
		if(jr.code==-1){
			$.alert("提示",jr.data);
			return;
		}
		$.alert("提示","成功释放UIM卡："+cardNo);
		$("#uim_check_btn_"+accessNumber).attr("disabled",false);
		$("#uim_check_btn_"+accessNumber).removeClass("disablepurchase").addClass("purchase");
		$("#uim_release_btn_"+accessNumber).attr("disabled",true);
		$("#uim_release_btn_"+accessNumber).removeClass("purchase").addClass("disablepurchase");
		$("#uim_txt_"+accessNumber).attr("disabled",false);
		$("#uim_txt_"+accessNumber).val("");
		_clearProdUim(accessNumber);
	};
	
	//清空旧uim
	var _clearProdUim = function(accessNumber){
		for (var i = 0; i < stepOrder.main.boProd2Tds.length; i++) {
			var td = stepOrder.main.boProd2Tds[i];
			if(td.accessNumber == accessNumber){
				stepOrder.main.boProd2Tds.splice(i,1);
			}
		}
	};
	
	//获取接入号
	var _getAccessNumber = function(prodId){
		for (var i = 0; i < _tempProdInfos.length; i++) {
			var td = _tempProdInfos[i];
			if(td.prodId == prodId){
				return td.accessNumber;
			}
		}
		return "";
	};
	
	//添加终端
	var _addAndDelTerminal=function(obj){
		var prodId=$(obj).attr("prodId");
		var offerSpecId=$(obj).attr("offerSpecId");
		var accessNumber = $(obj).attr("accessNumber");
		var boId = $(obj).attr("boId");
		var fag=$(obj).attr("fag");
		var newSpec = _planOfferSpec; //合约计划
		var maxNum=newSpec.agreementInfos[0].maxNum;
		var minNum=newSpec.agreementInfos[0].minNum;
		var $ul=$("#ul_fill_"+accessNumber);
		var length=$("li.terminalCheckLi").length;
		if(fag==0){//添加终端
			if(_saveTerminalCount>=maxNum){
				$.alert("信息提示","终端数已经达到最大，不能再添加了。");
				return;
			}
			var $liTerminalAdd=$('<li class="terminalCheckLi"><label>终端校验：</label><input id="terminalText_'+accessNumber+'_'+(length+1)+'" type="text" class="inputWidth228px inputMargin0" data-validate="validate(terminalCodeCheck) on(keyup blur)" maxlength="50" placeholder="请先输入终端串号" />'
					+'<input id="terminalBtn_'+accessNumber+'_'+(length+1)+'" type="button" num="'+(length+1)+'" prodId="'+prodId+'" offerSpecId="'+newSpec.offerSpecId+'" accessNumber="'+accessNumber+'" boId="'+boId+'" onclick="stepOrder.main.checkTerminalCode(this)" value="校验" class="purchase" style="float:left"></input></li>');
			var $liAdd = $('<li class="terminalDescLi" id="terminalDesc_'+(length+1)+'" style="white-space:nowrap;"><label></label><label id="terminalName_'+(length+1)+'"></label></li>');
			
			$ul.append($liTerminalAdd).append($liAdd);
			_saveTerminalCount++;
		}else{//删除终端
			if(minNum==length){
				$.alert("信息提示","终端数已经达到最小，不能再删除了。");
				return;
			}
			$("li.terminalCheckLi").each(function(index){
				if(length-1 == index){
					_filterAttach2Coupons(prodId,offerSpecId,length);
					$(this).remove();
				}
			});
			$("li.terminalDescLi").each(function(index){
				if(length-1==index){
					$(this).remove();
				}
			});
			_saveTerminalCount--;
		}
	};
	
	//过滤 同一个串码输入框校验多次，如果之前有校验通过先清空
	var _filterAttach2Coupons=function(prodId,offerSpecId,num){
		for ( var i = 0; i < stepOrder.main.attach2Coupons.length; i++) {
			var attach2Coupon = stepOrder.main.attach2Coupons[i];
			if(offerSpecId == attach2Coupon.attachSepcId && prodId==attach2Coupon.prodId && attach2Coupon.num==num){
				stepOrder.main.attach2Coupons.splice(i,1);
				$("#terminalName_"+num).html("");
				break;
			}
		}
	};
	
	//终端校验
	var _checkTerminalCode = function(obj){
		var prodId=$(obj).attr("prodId");
		var offerSpecId=$(obj).attr("offerSpecId");
		var num=$(obj).attr("num");
		var accessNumber = $(obj).attr("accessNumber");
		var boId = $(obj).attr("boId");
		
		//清空旧终端信息
		_filterAttach2Coupons(prodId,offerSpecId,num);
		
//		var objInstId = prodId+"_"+offerSpecId;
		var resIdArray = [];
		var terminalGroupIdArray = [];
		if(ec.util.isArray(_planOfferSpec.agreementInfos[0].terminalGroups)){ //如果有配置终端组，则拼接终端组的规格ID和包含的终端规格ID
			$.each(_planOfferSpec.agreementInfos[0].terminalGroups,function(){
				terminalGroupIdArray.push(this.terminalGroupId);
				if(ec.util.isArray(this.terminalGroup)){
					$.each(this.terminalGroup,function(){
						resIdArray.push(this.terminalModels);
					});
				}
			});
		}
		if(ec.util.isArray(_planOfferSpec.agreementInfos[0].terminals)){  //如果是直接配置终端规格（旧数据），则拼接终端规格ID
			$.each(_planOfferSpec.agreementInfos[0].terminals,function(){
				resIdArray.push(this.terminalModels);
			});
		}
		
		var resId = resIdArray.join("|"); //拼接可用的资源规格id
		var terminalGroupId = terminalGroupIdArray.join("|"); //拼接可用的资源终端组id
		if((resId==undefined || $.trim(resId)=="") && (terminalGroupId==undefined || $.trim(terminalGroupId)=="")){
			$.alert("信息提示","终端规格不能为空！");
			return;
		}
		var instCode = $("#terminalText_"+accessNumber + "_"+num).val();
		if(instCode==undefined || $.trim(instCode)==""){
			$.alert("信息提示","终端串码不能为空！");
			return;
		}
		if(_checkData(accessNumber,instCode)){
			return;
		}
		var param = {
			instCode : instCode,
			mktResId : resId
			//termGroup : terminalGroupId update by huangjj3 #13336需求，资源要求这个参数要别传
		};
		var data = query.prod.checkTerminal(param);
		if(data==undefined){
			return;
		}
		if(data.statusCd==CONST.MKTRES_STATUS.USABLE || (data.statusCd==CONST.MKTRES_STATUS.HAVESALE && activtyType=="2")){
			$.alert("信息提示",data.message);
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
				boId : boId, //订单项ID，资源补录时必填参数
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
			stepOrder.main.attach2Coupons.push(coupon);
		}else if(data.statusCd==CONST.MKTRES_STATUS.HAVESALE){
			$.alert("提示","终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
		}else{
			$.alert("提示",data.message);
		}
	};
	
	//判断同一个终端组里面是否串码有重复的
	var _checkData=function(accessNumber,terminalCode){
		var $input=$("input[id^=terminalText_"+accessNumber+"]");
		var num=0;
		$input.each(function(){//遍历页面上面的串码输入框，为的是跟缓存里面的串码进行比对
			var instCode=this.value;//页面上面的串码
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
	
	/*
	 * 数据注入
	 * 1、使用订单提交的数据 为 需要在业务受理（订单确认、收银台）中使用的js变量 重新赋值；
	 * 2、返回订单提交之后的模拟回参报文
	 */
	var _dataInjection = function(submitInParam){
		//数据注入
		try {
			stepOrder.main.isStepOrder = true;
			OrderInfo.actionFlag = 35;
			OrderInfo.resetSeq(); //重置序列
			SoOrder.getToken();
			
			var submitOutParam = {
				"resultCode" : submitInParam.resultCode,
				"resultMsg" : submitInParam.resultMsg,
				"result" : {
					"olId" : submitInParam.result.orderList.orderListInfo.olId,
					"olNbr" : submitInParam.result.orderList.orderListInfo.olNbr
				}
			};
			
			return submitOutParam;
		} catch (e) {
			try {
				console.log(e);
			} catch (e2) {
			}
		}
		return false;
	};
	
	//数据销毁，退出或完成分段受理时销毁注入的数据
	var _dataDestory = function(){
		//数据销毁
		if(stepOrder.main.isStepOrder){
			try {
				if(_dataDestoryFuncs != null && _dataDestoryFuncs.length > 0){
					for(var i=_dataDestoryFuncs.length-1;i>=0;i--){
						_dataDestoryFuncs[i]();
					}
				}
			} catch (e) {
				try {
					console.log(e);
				} catch (e2) {
				}
			}
		}
		OrderInfo.resetSeq(); //重置序列
		OrderInfo.actionFlag = 0;
		stepOrder.main.attach2Coupons = [];
		stepOrder.main.boProd2Tds = [];
		stepOrder.main.orderParam = {};
		stepOrder.main.isStepOrder = false;
	};
	
	//退出
	var _orderBack = function(){
		//1、如果在订单确认页面有预占UIM卡，点击“退出”时释放该UIM卡
		if(stepOrder.main.boProd2Tds.length > 0){
			for(var n=0;n<stepOrder.main.boProd2Tds.length;n++){
				var param = {
						numType : 2,
						numValue : stepOrder.main.boProd2Tds[n].couponInstanceNumber
				};
				$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param);
			}
		}
		
		//2、隐藏订单确认页面，调用数据销毁方法
		$("#order_confirm").hide();
		_dataDestory();
//		SoOrder.showStep(1);
//		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = [];
//		SoOrder.delOrder();
//		_getToken(); //获取页面步骤
//		if(CONST.getAppDesc()!=0){
//			$("#custModifyId").show();
//		}
		
		//3、回调退出函数
		if(_funcIfCancel != null && typeof(_funcIfCancel) == "function"){
			_funcIfCancel();
    	}
	};
	
	/**
	 * 销售品规格构成查询 （单独查询附属销售品的规格构成时，其主销售品的规格ID不是必传，只有在查询可订购时必传；但是查询合约时需要传主销售品ID！）
	 * @param  offerSpecId 销售品规格ID
	 * @param  offerTypeCd 销售品类型,销售品主 1 ,附属2  
	 * @param  mainOfferSpecId  主套餐id
	 * @param  partyId  客户ID
	 */
	var _queryOfferSpec = function(param) {
//		param.areaId = OrderInfo.cust.areaId;
		var url= contextPath+"/offer/queryOfferSpec";
		$.ecOverlay("<strong>正在查询销售品规格构成中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data){
				return response.data.offerSpec;
			}
		}else if (response.code==-2){
			$.alertM(response.data);
		}else {
			$.alert("提示","查询销售品规格构成失败,稍后重试");
		}
	};
	
	/**
	 * 产品下终端实例数据查询
	 * @param  prodId 产品实例ID
	 * @param  accNbr 产品接入号
	 * @param  areaId  受理地区
	 * @callBackFun 回调函数
	 * @service/intf.soService/queryOfferCouponById
	 */
	var _getTerminalInfo = function(param){
//		var params = {
//			prodId: prod.prodInstId,
//			areaId: OrderInfo.getProdAreaId(prod.prodInstId),
//			acctNbr: prod.accNbr
//		};
		$.ecOverlay("<strong>正在查询产品下终端实例数据中,请稍后....</strong>");
		var response = $.callServiceAsJson(contextPath+"/order/queryTerminalInfo", param, {});
		$.unecOverlay();
		if(response.code == 0){
			return response.data;
		}else if (response.code == -2) {
			$.alertM(response.data);
		}else{
			$.alert("错误提示","接口未返回号码["+param.acctNbr+"]产品原UIM卡数据，无法继续受理！");
		}
	};
	
	//资源补录，包括UIM及终端
	var _saveResourceData = function(){
		try {
			//需要补录资源时,调用分段受理资源补录接口
			if(_saveUimCount > stepOrder.main.boProd2Tds.length){
				$.alert("提示","UIM卡信息为空");
				return false;
			}
			if(_saveTerminalCount > stepOrder.main.attach2Coupons.length){
				$.alert("提示","终端信息为空");
				return false;
			}
			if(stepOrder.main.boProd2Tds.length > 0 || stepOrder.main.attach2Coupons.length > 0){
				//参考订单提交报文
				var order = {
					orderList : {
						orderListInfo : { 
							isTemplateOrder : "N",   //是否批量
							templateType : "",  //模板类型: 1 新装；8 拆机；2 订购附属；3 组合产品纳入/退出
							staffId : OrderInfo.staff.staffId,
							channelId : OrderInfo.staff.channelId,  //受理渠道id
							areaId : OrderInfo.staff.soAreaId,
							partyId : _partyId,  //新装默认-1
							distributorId : "", //转售商标识
							olTypeCd : CONST.OL_TYPE_CD.FOUR_G,  //4g标识
							olId : stepOrder.main.orderParam.olId,
							olNbr : stepOrder.main.orderParam.olNbr,
							soNbr : stepOrder.main.orderParam.soNbr,
							custOrderAttrs : [] //订单属性(暂存单收费员工),放到收费建档时添加
						},
						custOrderList :[{busiOrder : []}]   //客户订购列表节点
					}
				};
				
				if(_busitypeflag == 1){  //新装
					order.orderList.orderListInfo.templateType = 1; 
				} else if(_busitypeflag == 14){ //可选包变更
					order.orderList.orderListInfo.templateType = 2;
				} else if(_busitypeflag == 3){ //主副卡成员变更
					order.orderList.orderListInfo.templateType = 3; 
				} else { //TODO 确认其他动作时templateType参数
					order.orderList.orderListInfo.templateType = 1;
				}
				
				//UIM卡补录
				for(var i=0;i<stepOrder.main.boProd2Tds.length;i++){
					var busiOrder = {
						areaId : stepOrder.main.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : {}, //业务对象节点  
						boActionType : { //动作节点
							actionClassCd : "",
							boActionTypeCd : ""
						}, 
						data:{
							bo2Coupons : []
						}
					};
					if(_busitypeflag == 1) { //新装
						busiOrder.busiObj = {
							accessNumber : stepOrder.main.boProd2Tds[i].accessNumber,
							instId : -1,
							isComp : "N",
							objId : CONST.PROD_SPEC.CDMA
						};
						busiOrder.boActionType = {
							actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.NEW_PROD
						};
						busiOrder.data.bo2Coupons.push(stepOrder.main.boProd2Tds[i]);
					} else { // 套餐变更、可选包变更，补换卡
						busiOrder.busiObj = {
							accessNumber : stepOrder.main.boProd2Tds[i].accessNumber,
							instId : -1,
							isComp : "N",
							objId : CONST.PROD_SPEC.CDMA
						};
						busiOrder.boActionType = {
							actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
						};
						busiOrder.data.bo2Coupons.push(stepOrder.main.boProd2Tds[i]);
					} 
					order.orderList.custOrderList[0].busiOrder.push(busiOrder);
				}
				
				//终端补录
				for(var i=0;i<stepOrder.main.attach2Coupons.length;i++){
					var busiOrder = {
						areaId : stepOrder.main.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							accessNumber : stepOrder.main.attach2Coupons[i].accessNumber,
							instId : -1,
							offerTypeCd : 2
						},   
						boActionType : { //动作节点
							actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
						}, 
						data:{
							bo2Coupons : [stepOrder.main.attach2Coupons[i]],
							ooOwners : [{
								partyId : -1,
								state : "ADD"
							}]
						}
					};
					order.orderList.custOrderList[0].busiOrder.push(busiOrder);
				}
				
				var url = contextPath+"/order/saveResourceData";
	//			if(OrderInfo.order.token!=""){
	//				url = contextPath+"/order/saveResourceData?token="+OrderInfo.order.token;
	//			}
				$.ecOverlay("<strong>资源补录提交中,请稍后....</strong>");
				var response = $.callServiceAsJson(url, order, {});
				$.unecOverlay();
				if(response.code == 0){
					stepOrder.main.attach2Coupons = []; //资源补录成功后置空，退出时不在释放资源
					stepOrder.main.boProd2Tds = [];
					return true;
				}else{
					$.alertM(response.data);
					return false;
				}
			}
			return true;
		} catch (e) {
			console.log(e); //for test
		}
	};
	
	//分段受理确认,资源补录后进入收银台页面
	var _stepOrderConfirm = function(){
		if(_isStepOrder && _loadComplete){
			$.alert("提示","分段受理加载异常，请稍后重试");
			return;
		}
		var response = _saveResourceData(); //资源补录
		if(response === true){
			_setDisabled(); //disable释放按钮
			//订单还原后重下校验单(资源补录之后)，将省份反馈的国际漫游免预存标识拼装到算费入参
			//下省校验,开始		
			var url=contextPath+"/order/checkRuleToProv";
			var paramsProv={
					"olId":stepOrder.main.orderParam.olId,
					"soNbr":stepOrder.main.orderParam.soNbr,
					"areaId" : OrderInfo.staff.areaId,
					"chargeItems":[]
			};
			var response = $.callServiceAsJson(url,paramsProv,{
				"before":function(){
					$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if (response.code == 0) {
						var data = response.data;
						if(data.checkResult!=undefined)
							OrderInfo.checkresult=data.checkResult; //获取到免预存标志
					}
					order.calcharge.calchargeInit(); //加载收银台
				}
			});		
			//下省校验,结束	
		}
	};
	
	//把UIM卡按钮设为不可用，防止在订单补录成功但收银失败时再被释放掉
	var _setDisabled=function(){
		 $('input[id^=uim_release_btn_]').each(function(){
			 $(this).attr("disabled","disabled"); 
			 $(this).removeClass("purchase");
			 $(this).addClass("disablepurchase");
		 });
		 $('input[id^=uim_write_btn_]').each(function(){
			 $(this).attr("disabled","disabled"); 
			 $(this).removeClass("purchase");
			 $(this).addClass("disablepurchase");
		 });
	};
	
	//订单取消
	var _orderCancel = function(){
		if(stepOrder.main.isStepOrder && stepOrder.main.delOrderOperate){ //具有订单取消的权限才能取消订单
			$("#order_confirm").hide(); //隐藏订单确认页面
			_delOrder(); //作废购物车
			_dataDestory(); //数据销毁，重新初始化
			
			//回调退出函数
			if(_funcIfCancel != null && typeof(_funcIfCancel) == "function"){
				_funcIfCancel();
			}
		}
	};
	
	//作废购物车
	var _delOrder = function(){
		if(stepOrder.main.delOrderOperate){
			if(stepOrder.main.orderParam.olId && stepOrder.main.areaId){  //作废购物车
				var param = {
						olId : stepOrder.main.orderParam.olId,
						areaId : stepOrder.main.areaId
				};
				var response = $.callServiceAsJsonGet(contextPath+"/order/delOrder",param);
				if (response.code==0) {
					if(response.data.resultCode==0){
						$.alert("提示","购物车作废成功！");
					}
				}else if (response.code==-2){
					$.alertM(response.data);
				}else {
					$.alert("提示","购物车作废失败！");
				}
			}
		}
	};
	
	return {
		orderReduction : _orderReduction,
		orderBack : _orderBack,
		isStepOrder : _isStepOrder,
		attach2Coupons : _attach2Coupons,
		boProd2Tds : _boProd2Tds,
		changeLabel : _changeLabel,
		addAndDelTerminal : _addAndDelTerminal,
		checkTerminalCode : _checkTerminalCode,
		checkUim : _checkUim,
		getAccessNumber : _getAccessNumber,
		orderParam : _orderParam,
		areaId : _areaId,
		releaseUim : _releaseUim,
		stepOrderConfirm : _stepOrderConfirm,
		delOrderOperate : _delOrderOperate,
		orderCancel : _orderCancel
	};
	
})();

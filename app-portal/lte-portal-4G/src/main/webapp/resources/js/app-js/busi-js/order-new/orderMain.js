/**
 * 选择套餐完加载页面等
 * 
 * @author yanghm
 */
CommonUtils.regNamespace("order", "main");

order.main = (function(){ 
	
	/**
	 * 填单页面展示
	 * param = {
	 * 		boActionTypeCd : S1,
	 * 		boActionTypeName : "订购",
	 *		offerSpecId : 1234,//销售品规格ID
	 *		offerSpecName : "乐享3G-129套餐",//销售品名称,
	 *		feeType : 2100,付费类型
	 *		viceCardNum : 2,//副卡数量
	 *		offerNum : 3,//销售品数量
	 *		type : 1,//1购套餐2购终端3选靓号
	 *		terminalInfo : {
	 *			terminalName : "iphone",
	 *			terminalCode : "2341234124"
	 *		},
	 *		offerRoles : [
	 *			{
	 *				offerRoleId : 1234,
	 *				offerRoleName : "主卡",
	 *				memberRoleCd : "0",
	 *				roleObjs : [{
	 *					offerRoleId : 1,
	 *					objId : ,
	 *					objName : "CDMA",
	 *					objType : 2
	 *				}]
	 *			},
	 *			{
	 *				offerRoleId : 2345,
	 *				offerRoleName : "副卡",
	 *				memberRoleCd : "1"
	 *			}
	 *		]
	 *	}
	 * 
	 */
	//加载促销tab
	var _buildMainView = function(param) {
		if(OrderInfo.actionFlag == 2){
			param.newFlag=1;
			$.callServiceAsHtml(contextPath+"/app/order/main",param,{
				"before":function(){
					$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
				},"done" : function(response){
					if(!response){
						$.unecOverlay();
						 response.data='查询失败,稍后重试';
					}
					if(response.code != 0) {
						$.unecOverlay();
						$.alert("提示","查询失败,稍后重试");
						return;
					}
					setTimeout(function () { 
						$.unecOverlay();
						offerChange.fillOfferChange(response,param);
					}, 800);
				}
			});
			return;
		}
		
		OrderInfo.order.step = 4;
		var num=order.phoneNumber.secondaryCarNum;//手动添加的副卡个数
		if(num==undefined || num==0){
			if(!order.service.setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
		}else{
			if(!order.service.setOfferSpec()){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
		}
		//构造副卡内容滚动页
		for(var i=1;i<=num;i++){//每个副卡一个滚动tab li
			$("#tab-change-list").append('<li class="tab-list" name="tab-li" id="attachSecondary'+i+'"></li>');
		}
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : OrderInfo.offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(OrderInfo.actionFlag==14){//合约购机
			param=order.phone.param;
		}
		if (param == undefined || !param) {
			return;
		}
//		OrderInfo.actionFlag=param.actionFlag;
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}	
		var boProdAns=OrderInfo.boProdAns;
		SoOrder.initFillPage(); //并且初始化订单数据	
		OrderInfo.boProdAns=boProdAns;
		//_initOfferLabel();//初始化主副卡标签
		_loadAttachOffer(param);//查询附属销售品，订购套餐带出可订购和已选可选包
	};
	

	
	var _initFeeType = function(param) {
		if (param.feeType != undefined && param.feeType && param.feeType != CONST.PAY_TYPE.NOLIMIT_PAY) {
			$("input[name^=pay_type_][value="+param.feeType+"]").attr("checked","checked");
			$("input[name^=pay_type_]").attr("disabled","disabled");
			order.broadband.init_select();//刷新select组件，使样式生效
		}
	};
	
	//加载产品属性、附属销售品等
	var _loadAttachOffer = function(param) {
		$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
			var offerRole = this;
			for ( var i = 0; i < this.prodInsts.length; i++) {
				var prodInst = this.prodInsts[i];
				var param = {   
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					prodSpecId : prodInst.objId,
					offerRoleId: prodInst.offerRoleId,
					prodId : prodInst.prodInstId,
					queryType : "1,2",
					objType: prodInst.objType,
					objId: prodInst.objId,
					memberRoleCd : prodInst.memberRoleCd
				};
				AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品()
			}			
		});
	};
	
	//加载其它tab页产品属性
	var _loadOtherParm = function(param){
		var param = {
				"boActionTypeCd" : "S1" ,
				"boActionTypeName" : "订购",
				"offerSpec" : OrderInfo.offerSpec,
				"actionFlag" :1,
				"type" : 1
			};
		if(OrderInfo.actionFlag==14){//合约购机
			param=order.phone.param;
		}
		param.enter=3;
		param.newFlag=1;
		$.callServiceAsHtml(contextPath+"/app/order/main",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					$.unecOverlay();
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.unecOverlay();
					$.alert("提示","查询失败,稍后重试");
					return;
				}
//				OrderInfo.actionFlag = param.actionFlag;
				$.unecOverlay();
				if(OrderInfo.actionFlag == 2){
					setTimeout(function () { 
						$.unecOverlay();
						offerChange.fillOfferChange(response,param);
				    }, 800);
				} else if(OrderInfo.actionFlag==112){
					 $("#nav-tab-4").html(response.data);//其他tab页信息填充
					 order.amalgamation.goConfirm();
				 }else{
					 $("#nav-tab-6").html(response.data);//其他tab页信息填充
				 }
				_initFeeType(param);//初始化付费方式
				$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
					var offerRole = this;
					for ( var i = 0; i < this.prodInsts.length; i++) {
						var prodInst = this.prodInsts[i];
						var obj = {
							div_id : "item_order_"+prodInst.prodInstId,
							prodId : prodInst.prodInstId,
							offerSpecId : OrderInfo.offerSpec.offerSpecId,
							compProdSpecId : "",
							prodSpecId : prodInst.objId,
							roleCd : offerRole.roleCd,
							offerRoleId : offerRole.offerRoleId,
							partyId : OrderInfo.cust.custId
						};
						order.main.loadSpecParam(obj); //加载产品属性，是否信控使用人等
					}			
				});
				 order.dealer.initDealer();
				 if(OrderInfo.actionFlag==112){
					 OrderInfo.order.step = 4;
					 $("#nav-tab-3").removeClass("active in");
					 $("#nav-tab-4").addClass("active in");
					 $("#tab3_li").removeClass("active");
					 $("#tab4_li").addClass("active");
					 $("#cx").removeClass("active");
					  $("#qt").addClass("active");
//					 $("#qt").click();
				 }else if(OrderInfo.actionFlag==14){//合约购机
					 OrderInfo.order.step = 6;
					 $("#nav-tab-5").removeClass("active in");
					 $("#nav-tab-6").addClass("active in");
					 $("#tab5_li").removeClass("active");
					 $("#tab6_li").addClass("active"); 
					 $("#terminalDiv").show();
					 $("#hySpan").html(order.phone.hyName);
					 var terminalCode=$("#terminalNum").val();
					 $("#terminalCodeInput").val("终端串码:"+terminalCode);					 
					 //终端信息展示					 
				 }else{
					 OrderInfo.order.step = 5;
					 $("#nav-tab-4").removeClass("active in");
					 $("#nav-tab-6").addClass("active in");
					 $("#tab4_li").removeClass("active");
					 $("#tab6_li").addClass("active");
				 }
			}
		});
	};
	
	function _loadSpecParam(param){
		var prodId=param.prodId;
		var cardphoneNum=OrderInfo.getAccessNumber(prodId);
		$("#phoneNumSpan2_"+param.prodId).html(cardphoneNum);
		if(prodId==-1){
			$("#cardNameSpan2_"+param.prodId).html("主卡");
		}else{
			$("#cardNameSpan2_"+param.prodId).html("副卡");
		}
		//企业云盘不需要uim卡，屏蔽
		if(order.service.isCloudOffer){
			$("#uimDiv_"+param.prodId).hide();
		}
		param.enter=3;
		$.callServiceAsHtmlGet(contextPath + "/app/order/orderSpecParam",param, {
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response && (response.data == 0||response.data == "0")){
					return;
				}
				$("#specParmDiv_"+param.prodId).html(response.data);
//				$("div[name='spec_params']").each(function(){
					$.refresh($(this));
//				});
				//判断使用人产品属性是否必填
				//_checkUsersProdAttr(param.prodId, $("#"+param.div_id));
				//$('#choose_user_btn_'+param.prodId).parent().parent().parent().hide();
				//只有在新装的时候才可编辑“是否信控”产品属性
				var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId);
				if(xkDom.length == 1){
					if(OrderInfo.actionFlag != 1 && OrderInfo.actionFlag != 14 && OrderInfo.actionFlag != 112){
						$(xkDom).attr("disabled","disabled");
					} else {
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value='']").remove(); //去除“请选择”空值选项
						$(xkDom).val("20"); //默认为“是”
						order.broadband.init_select();//刷新select组件，使样式生效
						if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
							$(xkDom).attr("disabled","disabled");
						}
					}
				}
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
	}
	
	//判断使用人产品属性是否必填，mantis 0147689: 关于政企单位用户实名制信息录入相关工作的要求 ；
	function _checkUsersProdAttr(prodId, dom){
		//1）新建客户新装，如果是政企客户，填单时必须填写使用人；
		//2）老客户新装，根据客户查询判断是政企客户（segmentId=1000）时，填单必须填写使用人；
		var itemId = CONST.PROD_ATTR.PROD_USER + '_' + prodId;
		
		if($('#'+itemId).length > 0){
			var isOptional = true;
			if(OrderInfo.cust && OrderInfo.cust.custId && OrderInfo.cust.custId != '-1'){ //老客户
				// 根据证件类型来判断
				if(cust.isCovCust(OrderInfo.cust.identityCd)){
					//政企客户
					isOptional = false;
				}
			} else { //新建客户
				if(OrderInfo.boCustInfos && OrderInfo.boCustInfos.partyTypeCd == '2'){ //政企客户
					isOptional = false;
				}
			}
			if(!isOptional){
				for(var i=0;i<OrderInfo.prodAttrs.length;i++){
					if(OrderInfo.prodAttrs[i].id == itemId){
						OrderInfo.prodAttrs[i].isOptional = 'N';
						break;
					}
				}			
			} else {
				//隐藏使用人
			}
		}
	};
	
	var _orderSubmit=function(){
		if(!SoOrder.checkData()){ //校验不通过
			return false;
		}
		SoOrder.submitOrder();//订单提交
	}

	var _genRandPass6 = function(){
		var str = "" ;
		var lastOneS = "" ;
		var thisOneS = "" ;
		var thisOneI = 0 ;
		for(var k=0;k<6;k++){
			do{
				if(str.length>0){
					lastOneS = str.substring(str.length-1,str.length) ;
				}
				thisOneI = parseInt(Math.random()*9+1);
				thisOneS = ""+thisOneI ;
				if(str.length==5){
					if(_checkIncreace6(str + thisOneS)){
						continue;
					}
				}
			}while(lastOneS==thisOneS);
			str = str + thisOneS ;
		}
		if(str.length!=6){
			return null ;
		}
		return str ;
	};

	//付费类型选项变更时级联更新相关的产品属性
	var _feeTypeCascadeChange = function(dom,prodId){
		var feeType = $(dom).val();
		var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId);
		//“是否信控”产品属性，预付费时默认为“是”且不可编辑，其他默认为“是”但可编辑
		if(feeType == CONST.PAY_TYPE.BEFORE_PAY){
			//增加付费方式对翼支付助手功能产品的限制
			if((OrderInfo.actionFlag==1||OrderInfo.actionFlag==3||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14)
					&&CacheData.getServSpec(-1,381000960)!=null){
				var yiPaySpec = CacheData.getServSpec(-1,381000960);
				if(yiPaySpec.isdel==undefined||yiPaySpec.isdel!="Y"){
					$.confirm("信息确认","您已选择开通【翼支付交费助手】功能产品，如果修改付费类型为预付费，其属性将赋为默认值！",{ 
						yesdo:function(){
							for ( var j = 0; j < yiPaySpec.prodSpecParams.length; j++) {							
								var prodSpecParam = yiPaySpec.prodSpecParams[j];
								if (CONST.YZFitemSpecId4 == obj.itemSpecId && "ON" != offerChange.queryPortalProperties("AGENT_" + (OrderInfo.staff.soAreaId+"").substring(0,3))) {
									prodSpecParam.setValue = "";
								} else {
									prodSpecParam.setValue = prodSpecParam.value;
								}	
								}
						},
						no:function(){
							$(dom).find("option[value='1200']").attr("selected",true);
							$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId).val("20").removeAttr("disabled");
						}
					});
				}				
			}
			$(xkDom).val("20");
			$(xkDom).attr("disabled", true);
		} else {
			if((OrderInfo.actionFlag==1||OrderInfo.actionFlag==3||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14)
					&&CacheData.getServSpec(-1,381000960)!=null){
				var yiPaySpec = CacheData.getServSpec(-1,381000960);
				if(yiPaySpec.isdel==undefined||yiPaySpec.isdel!="Y"){
					// #610119需求增加：托收的属性需要分省下发。
					var agentFlag = offerChange.queryPortalProperties("AGENT_" + (OrderInfo.staff.soAreaId+"").substring(0,3));
					$.confirm("信息确认","您已选择开通【翼支付交费助手】功能产品，如果修改付费类型为后付费，" + ("ON" == agentFlag ? "只可变更“翼支付托收”。" : "属性不可变更。"),{ 
						yesdo:function(){
							for ( var j = 0; j < yiPaySpec.prodSpecParams.length; j++) {							
								var prodSpecParam = yiPaySpec.prodSpecParams[j];
								if (CONST.YZFitemSpecId4 == prodSpecParam.itemSpecId && "ON" == offerChange.queryPortalProperties("AGENT_" + (OrderInfo.staff.soAreaId+"").substring(0,3))) {
									if (prodSpecParam.value!="") {
										prodSpecParam.setValue = prodSpecParam.value;
									} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
										//默认值为空则取第一个
										prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
								} else {
									prodSpecParam.setValue = "";
								}	
							}
						},
						no:function(){
							$(dom).find("option[value='2100']").attr("selected",true);
							$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId).val("20").attr("disabled","disabled");
						}
					});
				}				
			}
			$(xkDom).attr("disabled", false);
		}
		$(xkDom).addClass("styled-select");
	};
	
	var _checkIncreace6 = function(str){
		var newStr = "";
		if(str && str.length==6){
			var int0 = str[0];
			for(var i=0;i<str.length;i++){
				var int1 = parseInt(str.substring(i,i+1));
				newStr += Math.abs(int1-int0);
			}
			if("012345"==newStr||"543210"==newStr){
				return true ;
			}else{
				return false ;
			}
		}else{
			return false ;
		}
	};
	
	/*
	 * 经办人人填充返回信息
	 */
	function _showJbrInfo(custInfo){
		if(custInfo != null && custInfo.custId){
			//将客户信息作为使用人tmpChooseUserInfo，确认后保存到OrderInfo.choosedUserInfos
			cust.tmpJbrInfo = custInfo;
			cust.isOldCust = true;
			OrderInfo.jbr.custId = custInfo.custId;
			if(OrderInfo.jbr.identityCd != custInfo.identityCd || OrderInfo.jbr.identityNum != custInfo.idCardNumber){
				OrderInfo.jbr.identityCd = custInfo.identityCd;
				if(OrderInfo.jbr.identityCd==1){
					OrderInfo.jbr.identityNum = $('#sfzorderAttrIdCard').val();//证件号码
				}else{
					OrderInfo.jbr.identityNum = $('#orderAttrIdCard').val();//证件号码
				}
				OrderInfo.virOlId = "";
			}
//			order.cust.tmpChooseUserInfo.prodId = '';
			$('#orderAttrName').val(custInfo.partyName);
			$('#orderAttrAddr').val(custInfo.addressStr);
			$('#orderAttrPhoneNbr').val(custInfo.accNbr);
			OrderInfo.jbr.partyName = custInfo.partyName;
		} 
	};
	
	//经办人-查询
	function _queryJbr(){
		var validate=$("#jbrFormdata").Validform();
		var ch = validate.check();
		if(!validate.check()){
			return;
		}
		cust.isOldCust = false;
		var identityCd="";
		var idcard="";
		var diffPlace="";
		var acctNbr="";
		var identityNum="";
		var queryType="";
		var queryTypeValue="";
		identityCd=$("#orderIdentidiesTypeCd  option:selected").val();;
		if(identityCd==1){
			var identityNum = $('#sfzorderAttrIdCard').val();//证件号码
		}else{
			var identityNum = $('#orderAttrIdCard').val();//证件号码
		}
		authFlag="1"; // 不需要鉴权
		if(identityCd==-1){
			
			acctNbr=$("#orderAttrPhoneNbr").val();
			identityNum="";
			identityCd="";
		}
		diffPlace="local";
		areaId=OrderInfo.staff.areaId+"";
		// lte进行受理地区市级验证
		if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
			$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
			return;
		}
		var param = {
				"acctNbr":acctNbr,
				"identityCd":identityCd,
				"identityNum":identityNum,
				"partyName":"",
				"custQueryType":$("#custQueryType_choose").val(),
				"diffPlace":diffPlace,
				"areaId" : areaId,
				"queryType" :queryType,
				"queryTypeValue":queryTypeValue,
				"identidies_type":$("#orderIdentidiesTypeCd  option:selected").text()
		};
		$.callServiceAsHtml(contextPath+"/cust/queryCust",param, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中，请稍等...</strong>");
			},"always":function(){
				//$.unecOverlay();
			},	
			"done" : function(response){
				if (response.code == -2) {
					return;
				}
				if(response.data.indexOf("false") ==0) {
					$.unecOverlay();
					if(OrderInfo.cust.custId == -1 && OrderInfo.cust.identityCd == identityCd 
							&& OrderInfo.cust.identityNum == identityNum){
						OrderInfo.jbr.custId = OrderInfo.cust.custId;
						OrderInfo.jbr.partyName = OrderInfo.cust.partyName;
						OrderInfo.jbr.identityNum = identityNum;
						OrderInfo.jbr.identityCd = identityCd;
						if(OrderInfo.preBefore.idPicFlag == "ON"){
							common.callPhotos('cust.getPicture');
						}
						return;
					}
					cust.jbrSubmit();
					if(OrderInfo.preBefore.idPicFlag == "ON"){
						common.callPhotos('cust.getPicture');
					}
				    return;
				}else{
				$.unecOverlay();
				cust.jumpAuthflag = $(response.data).find('#jumpAuthflag').val();
				var custInfoSize = $(response.data).find('#custInfoSize').val();
				var custInfos = $(response.data).find('#custInfos');
				// 使用人定位时，存在多客户的情况
				if (custInfoSize == 1) {
					cust.showCustAuth($(response.data).find('#custInfos'),"jbr");
				} else if (custInfoSize > 1) {
					cust.showCustAuth(custInfos,"jbr");
				} else {
					cust.jbrSubmit();
				}
			}
				if(OrderInfo.preBefore.idPicFlag == "ON"){
					common.callPhotos('cust.getPicture');
				}
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});

	};
	
	//产品属性-校验单个属性
	function _check_parm_self(obj){
		//alert("---"+$(obj).val());
		if($(obj).attr("check_option")=="N"){
			if($(obj).val()==null||$(obj).val()==""){
				$(obj).next('.help-block').removeClass('hidden');
				$(obj).next('.help-block').html("不能为空");
				return false;
			}
		}
		
		if($(obj).attr("check_type")=="check"){
			var len = $(obj).attr("check_len");
			//alert($(this).val()+"--"+len);
			if(len>0){
				//alert($(this).val().length+"---"+len);
				if($(obj).val().length>len){
					$(obj).next('.help-block').removeClass('hidden');
					$(obj).next('.help-block').html("长度过长");
					return false;
				}
			}
			var mask = $(obj).attr("check_mask");
			if(mask!=null&&$(obj).val()!=null&&$(obj).val()!=""){
				//alert($(obj).val()+"---"+mask);
				//mask= "^[A-Za-z]+$";
				var pattern = new RegExp(mask) ;
				if(!pattern.test($(obj).val())){
					$(obj).next('.help-block').removeClass('hidden');
					$(obj).next('.help-block').html("校验失败"+$(obj).attr("check_mess"));					
					return false;
				}
			}
			var v_len = $(obj).val().length;
			if(v_len>0&&$(obj).attr("dataType")=="3"){//整数
				if(!/^[0-9]+$/.test($(obj).val())){
					$(obj).next('.help-block').removeClass('hidden');
					$(obj).next('.help-block').html("非数字，请修改");
					return false;
				}
			}else if(v_len>0&&$(obj).attr("dataType")=="5"){//小数
				if(!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test($(obj).val())){
					$(obj).next('.help-block').removeClass('hidden');
					$(obj).next('.help-block').html("非小数，请修改");
					return false;
				}
			}else if(v_len>0&&($(obj).attr("dataType")=="4"||$(obj).attr("dataType")=="16")){//日期
				/*
				if(/Invalid|NaN/.test(new Date($(obj).val().substring(0,10)))){
					$.alert("提示",$(obj).attr("check_name")+ " 非日期，请修改");
					return false;
				}
				*/
			}
		}
		return true ;
	}
	
	//去除校验红字提示
	function _clearCheckMsg(id){
		alert(id);
		if($("#"+id).val()!=null && ("#"+id).val().trim()!=""){
			var id2=$(obj).attr("id")+"_check";
			$("#"+id2).addClass("hidden");
		}		
	}

	return {
		buildMainView :	_buildMainView,
		initFeeType:_initFeeType,
		loadAttachOffer:_loadAttachOffer,
		loadSpecParam:_loadSpecParam,
		checkUsersProdAttr:_checkUsersProdAttr,
		loadOtherParm:_loadOtherParm,
		orderSubmit:_orderSubmit,
		genRandPass6 :_genRandPass6,
		checkIncreace6:_checkIncreace6,
		queryJbr:_queryJbr,
		showJbrInfo:_showJbrInfo,
		feeTypeCascadeChange:_feeTypeCascadeChange,
		check_parm_self     :_check_parm_self,
		clearCheckMsg       :_clearCheckMsg
	};
})();


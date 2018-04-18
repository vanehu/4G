/**
 * 橙分期管理
 * 
 * @author yanghm
 * date 2016-12-2
 */
CommonUtils.regNamespace("order","orange");

order.orange = (function() {
	
	var _orangeOfferList=null;//可订购橙分期合约包列表
	
	var _prodId=null;//选中产品实例的产品id
	
	var _orangeOfferSpecId=null;//橙分期合约包id
	
	var _orangeSpec;//选中的橙分期合约包
	
	var _mainOfferSpecId;//主套餐id
	//初始化页面
	var _initOrange=function(){
		_queryOrangeOffer();
		SoOrder.initFillPage(); //并且初始化订单数据
	};
	
	//橙分期合约套餐查询
	var _queryOrangeOffer= function() {
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		var prodId = prodInfo.prodInstId;
		var prodSpecId=prodInfo.productId;
		order.orange.prodId=prodId;
		order.orange.mainOfferSpecId=prodInfo.prodOfferId;
		var param = {
				prodSpecId : prodSpecId,
				offerSpecIds : [],
				queryType : "",
				prodId : prodId,
				partyId : OrderInfo.cust.custId,
				orangeEnt:"Y"
		};
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
		//param.offerSpecIds.push("81010");
		_queryCanOrangeOffer(param);
			
//			$("#fillNextStep").off("click").on("click",function(){
//				if(!SoOrder.checkData()){ //校验通过
//					return false;
//				}
//				$("#order-content").hide();
//				$("#order-dealer").show();
//				order.dealer.initDealer();
//			});
//			order.dealer.initDealer();
	};
	
	
	/**
	 * 橙分期合约包及其附属属性查询
	 */
	var _queryCanOrangeOffer = function(param) {
		addParam(param);  //添加基本参数
		var url = contextPath+"/app/orange/queryCanBuyOrange";
		var response = $.callServiceAsJson(url,param);
		if (response.code==0) {
			if(response.data){
				var orangeOfferList= response.data.result.offerSpecList;
//				var testOffer={
//						offerSpecId:"135010051",
//						offerSpecName:"50元预存充值"
//						
//				};
//				orangeOfferList.push(testOffer);
				_orangeOfferList=orangeOfferList;
				if(orangeOfferList[0]!=undefined){
					$.each(orangeOfferList,function(){
						var $div =$('<div class="panel-heading panel-title-multi m-b-5"></div>');
						var $i =$('<i class="iconfont pull-left p-l-10">&#xe635;</i>');
						var $h = $('<h3 class="panel-title"></h3>');
						var $a =$('<a class="accordion-toggle accordion-toggle-styled border-none" data-toggle="collapse" data-parent="#accordion" href="#collapse_'+this.offerSpecId+'">'+this.offerSpecName+'</a>');
						$h.append($a);
						$div.append($i).append($h);
						var $div2=$('<div class="list-checkbox pull-right"></div>');
						var $label=$('<label><div class="checkbox-box"><input type="radio" value="'+this.offerSpecId+'" id="checkbox_'+this.offerSpecId+'" name="meal" /><label for="checkbox_'+this.offerSpecId+'" class="label-radio"></label></div></label>');
						$div2.append($label);
						$div.append($div2);
						var $div3=$('<div id="collapse_'+this.offerSpecId+'" class="panel-collapse collapse"><div class="panel-body"><div class="panel-title"><h5>'+this.summary+'</h5></div></div></div>');
						$("#orangeOffer").append($div).append($div3);	
					});
					//SoOrder.initFillPage();
					var choosedProdInfo=order.prodModify.choosedProdInfo;
					var phoneNumber=choosedProdInfo.accNbr;	
					$("#phoneNumSpan").html(phoneNumber);
					$("#phoneNumInput").val(phoneNumber);
					order.broadband.init_select();//刷新select组件，使样式生
				}else{
					var title='信息提示';
					$("#btn-dialog-ok").removeAttr("data-dismiss");
					$('#alert-modal').modal({backdrop: 'static', keyboard: false});
					$("#btn-dialog-ok").off("click").on("click",function(){
						$("#alert-modal").modal("hide");
						common.callCloseWebview();
					});
					$("#modal-title").html(title);
					$("#modal-content").html("没有查询到橙分期合约，无法继续受理!");
					$("#alert-modal").modal();
				}
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			var title='信息提示';
			$("#btn-dialog-ok").removeAttr("data-dismiss");
			$('#alert-modal').modal({backdrop: 'static', keyboard: false});
			$("#btn-dialog-ok").off("click").on("click",function(){
				$("#alert-modal").modal("hide");
				common.callCloseWebview();
			});
			$("#modal-title").html(title);
			$("#modal-content").html("橙分期合约查询失败，请稍后再试！");
			$("#alert-modal").modal();
		}
				
	};
	
	//补充查询基本条件
	var addParam = function(param){
		//param.staffId = '1762126';
		param.staffId = OrderInfo.staff.staffId;
		//param.channelId = '1388783';
		param.channelId	= OrderInfo.staff.channelId;
		
		//param.areaId = '8320102';
		param.areaId = OrderInfo.getProdAreaId(param.prodId);
		param.partyId = OrderInfo.cust.custId;
		param.mainOfferSpecId=order.prodModify.choosedProdInfo.prodOfferId;
		if(ec.util.isObj(OrderInfo.order.soNbr)){  //缓存流水号
			param.soNbr = OrderInfo.order.soNbr;
		}
		else{
			param.soNbr = UUID.getDataId();
			OrderInfo.order.soNbr = UUID.getDataId();
		}
		if(order.ysl!=undefined){
			if(order.ysl.yslbean.yslflag!=undefined){
//				param.yslflag = order.ysl.yslbean.yslflag;
			}
		}
	};
	
	//橙分期参数查询
	var _queryOrangeParam = function(prodId,offSpecId,mainOfferSpecId) {
		//var orangeOffer=_getOrangeOfferByOfferSpecId(offSpecId);
		var param = {
				offerSpecId : offSpecId,
				offerTypeCd : "2",
				mainOfferSpecId:mainOfferSpecId,
				partyId: OrderInfo.cust.custId
		};
		var offerSpec=query.offer.queryOfferSpec(param);
		order.orange.orangeSpec= offerSpec;
		
	};

//根据规格id查找橙分期合约
var _getOrangeOfferByOfferSpecId=function(offerSpecId){
//	var orangeOffer;
//	if(_orangeOfferList!=null){
//		for(var i=0;i<_orangeOfferList.szie();i++){
//			var offer=_orangeOfferList.get(i);
//			if(offer.offerSpecId==offerSpecId){
//				orangeOffer=offer;
//				return orangeOffer;
//			}
//		}
//	}
 };
 
 //先进行橙分期合约包校验，校验通过弹出实名窗口
 var _showRealNameModel=function(){
	 order.orange.orangeOfferSpecId=$("input[name='meal']:checked").val();
	//橙分期校验
	 if(order.orange.orangeOfferSpecId==null){
			$.alert("提示","请选择橙分期合约包！");
			return;
	}
	if("135010051"!=order.orange.orangeOfferSpecId && mktRes.terminal.hasCheck==false){
		$.alert("提示","请先进行终端校验！");
		return;
	}
	AttachOffer.openList=[];//先清空
	CacheData.setOfferSpec(order.orange.prodId,order.orange.orangeSpec);
	CacheData.setServForOfferSpec(order.orange.prodId,order.orange.orangeSpec);//把选中促销保存到销售品规格中
	AttachOffer.checkOfferExcludeDepend(order.orange.prodId,order.orange.orangeSpec);
	//AttachOffer.addOfferSpec(order.orange.prodId,order.orange.orangeOfferSpecId);//开通橙分期合约包
		
 };
 
 //跳过实名认证
 var _jumpAuth=function(){	
	  $("#real_name").modal("hide");
	  $("#nav-tab-2").addClass("active in");
	  $("#tab2_li").addClass("active");
	  $("#nav-tab-1").removeClass("active in");
 	  $("#tab1_li").removeClass("active");
 	 OrderInfo.order.step=2;
 	  order.dealer.initDealer();//初始化发展人
 	  order.broadband.init_select();//刷新select组件，使样式生效
 	 
 };
 
 //实名认证
 var _realNameAuth=function(){
		//橙分期校验
      order.highRealName.highRealNameAuthenticate();
		
 };
 
 //读卡高级实名认证页面客户信息回填
 var _getHighRealInfo=function(name,idcard,address,identityPic){
		$("#userName").val(name);
		$("#certNumber").val(idcard);
		

	};
 
 //设置当前选中橙分期合约包id
 var _buyOrangeOfferSpec=function(offerSpecId){
	  order.orange.orangeOfferSpecId=offerSpecId;
	  //清空终端信息
	  mktRes.terminal.hasCheck=false;
	  $("#terminalNum").val("");
	  $("#terminalInfo").html("");
	  $("#terminal_check").addClass("dis-none");
	  $("#terminal_call").removeClass("dis-none");
 };
	return {
		    initOrange      :_initOrange,
		    orangeOfferList:_orangeOfferList,
		    queryOrangeParam:_queryOrangeParam,
		    getOrangeOfferByOfferSpecId:_getOrangeOfferByOfferSpecId,
		    showRealNameModel:_showRealNameModel,
		    jumpAuth         :_jumpAuth,
		    realNameAuth     :_realNameAuth,
		    orangeOfferSpecId:_orangeOfferSpecId,
		    prodId           :_prodId,
		    buyOrangeOfferSpec:_buyOrangeOfferSpec,
		    orangeSpec        :_orangeSpec,
		    mainOfferSpecId   :_mainOfferSpecId,
		    getHighRealInfo   :_getHighRealInfo
		    
	};
})();
/**
 * 销售品变更
 * 
 * @author wukf
 * date 2013-9-22
 */
CommonUtils.regNamespace("offerChange");

offerChange = (function() {
	
	var _resultOffer = {}; //预校验单接口返回
	var num=0;
	var maxNum = 0;
	var _newAddList = [];
	var _newMemberFlag = false;
	var _oldMemberFlag = false;
	//初始化套餐变更页面
	var _init = function (){
		
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 2;
		if(OrderInfo.provinceInfo.mergeFlag=="0"){
			if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
				return ;
			}
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
		
		//初始化套餐查询页面
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
	
		var response = $.callServiceAsHtmlGet(contextPath+"/token/pc/order/prodoffer/prepares",{});	
		$.unecOverlay();
		if(response.code != 0) {
			$.alert("提示","查询失败,稍后重试");
			return;
		}
		SoOrder.step(0,response.data); //订单准备
		$('#search').bind('click',function(){
			order.service.searchPack();
		});
		order.prodOffer.init();
		order.service.searchPack(); //查询可以变更套餐
	};
		
	//套餐变更页面显示
	var _offerChangeView=function(){
		_newAddList = [];
		offerChange.newMemberFlag = false;
		offerChange.oldMemberFlag = false;
		var oldLen = 0 ;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==2){
				oldLen++;
			}
		});
		var memberNum = 1; //判断是否多成员 1 单成员2多成员
		var viceNum = 0;
		if(oldLen>1){ //多成员角色，目前只支持主副卡
			memberNum = 2;
		}
		//把旧套餐的产品自动匹配到新套餐中
		if(!_setChangeOfferSpec(memberNum,viceNum)){  
			return;
		};
		/*//4g系统需要
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			if(!prod.uim.setProdUim()){ 
				return ;
			}
		}
		*/
		if(OrderInfo.actionFlag == 2){ //套餐变更	
			var newSubPhoneNumsize=[];
			var oldSubPhoneNumsize=[];
			if(order.memberChange.newSubPhoneNum!=""){
				newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
			}
			if(order.memberChange.oldSubPhoneNum!=""){
				oldSubPhoneNumsize = order.memberChange.oldSubPhoneNum.split(",");
			}
			var max = 0;
			var $tbody = $("#member_tbody");
			$tbody.html("");
			$("#main_title").text(OrderInfo.offerSpec.offerSpecName);
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				if(this.memberRoleCd=="401"){
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
							_newAddList.push(objInstId);
							if(offerRole.minQty == 0){ //加装角色
								this.minQty = 0;
								this.dfQty = 0;
							}
							var membernum = 0;
							$.each(OrderInfo.offer.offerMemberInfos,function(){
								if(this.roleCd=="401"){
									membernum++;
								}
							})
							max = this.maxQty<0?"不限制":this.maxQty-membernum;
							if(max<0){
								max = 0;
							}
							maxNum = max;
							$tr.append("<td align='left' colspan='3'>"+this.objName+" :<i id='plan_no' style='margin-top: 3px; display: inline-block; vertical-align: middle;'>"+
									"<a class='add' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'></a>"+
									"<input id='"+objInstId+"' type='text' value='"+newSubPhoneNumsize.length+"' class='numberTextBox width22' readonly='readonly'>"+
									"<a class='add2' href='javascript:order.service.addNum(\""+objInstId+"\","+max+",\""+offerRole.parentOfferRoleId+"\");'> </a>"+
									"</i>"+this.minQty+"-"+max+"（张） </td>");	
							if(max>0){
								if(oldSubPhoneNumsize.length==0){
									var olro = "<tr style='background:#f8f8f8;' id='oldnum_1' name='oldnbr'>" +
									"<td class='borderLTB' style='font-size:14px; padding:0px 0px 0px 12px'><span style='color:#518652; font-size:14px;'>已有移动电话</span></td>" +
									"<td align='left' colspan='3'><input value='' style='margin-top:10px' class='numberTextBox' id='oldphonenum_1' type='text' >" +
									"<a style='margin-top:15px' class='add2' href='javascript:order.memberChange.addNum("+max+",\"\");'> </a>"+this.minQty+"-"+max+"（张）</td></tr>"+
									"<tr style='background:#f8f8f8;' name='oldnum_tips'><td align='left' colspan='4' style ='color: red; padding-left: 30px;'>注意：您纳入加装的移动电话纳入后将统一使用主卡账户！</td></tr>";	
									$tr.after(olro);
								}else{
									for(var k=0;k<oldSubPhoneNumsize.length;k++){
										if(k==0){
											var olro = "<tr style='background:#f8f8f8;' id='oldnum_1' name='oldnbr'>" +
											"<td class='borderLTB' style='font-size:14px; padding:0px 0px 0px 12px'><span style='color:#518652; font-size:14px;'>已有移动电话</span></td>" +
											"<td align='left' colspan='3'><input value='"+oldSubPhoneNumsize[k]+"' style='margin-top:10px' class='numberTextBox' id='oldphonenum_1' type='text' >" +
											"<a style='margin-top:15px' class='add2' href='javascript:order.memberChange.addNum("+max+",\"\");'> </a>"+this.minQty+"-"+max+"（张）</td></tr>"+
											"<tr style='background:#f8f8f8;' name='oldnum_tips'><td align='left' colspan='4' style ='color: red; padding-left: 30px;'>注意：您纳入加装的移动电话纳入后将统一使用主卡账户！</td></tr>";	
											$tr.after(olro);
										}else{
											order.memberChange.addNum(max,oldSubPhoneNumsize[k]);
										}
									}
								}
							}
						}
					});
				}
			});
			easyDialog.open({
				container : "member_dialog"
			});
//			$("#member_btn").off("click").on("click",function(){
//				offerChangeConfirm();
//				easyDialog.close();
//			});
		}
	};
	
	var _offerChangeConfirm = function(){
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			if (order.prodModify.choosedProdInfo.productId != CONST.PROD_SPEC.PROD_CLOUD_OFFER) {
				//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
				if(!prod.uim.setProdUim()){ 
					return ;
				}
			}
		}
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldprodAcctInfos = [];
		OrderInfo.oldAddNumList = [];
		var newnum = 0;
		var oldnum = 0;
		order.memberChange.viceCartNum = 0;
		var delprodInsts = [];
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(this.memberRoleCd=="401"){
				if(this.prodInsts!=undefined){
					var oldprodInsts = this.prodInsts;
					for(var i=0;i<this.prodInsts.length;i++){
						var prodInstId = '"'+this.prodInsts[i].prodInstId+'"';
						if(prodInstId.indexOf("-")!=-1){
							delprodInsts.push(this.prodInsts[i]);
						}
					}
					$.each(delprodInsts,function(){
						var delprodInstId = this.prodInstId;
						$.each(oldprodInsts,function(j){
							if(this.prodInstId = delprodInstId){
								oldprodInsts.splice(j,1);
							}
						});
					});
				}
			}
		});
		
		$.each(_newAddList,function(){
			newnum=newnum+Number($("#"+this).val());
		});
		$("#member_tbody").find("tr[name='oldnbr']").each(function(){
			var num = $.trim($(this).children("td").eq(1).children("input").val());
			if(ec.util.isObj(num)){
				oldnum++;
			}
		});
		if(newnum>0){
			offerChange.newMemberFlag = true;
			order.service.setOfferSpec();
			if (!order.cust.preCheckCertNumberRel("-1", order.cust.getCustInfo415())) {
	            return;
	        }
		}
		if(oldnum>0){
			offerChange.oldMemberFlag = true;
			if(!order.memberChange.queryofferinfo()){
				return;
			}
		}
		if(parseInt(newnum)+parseInt(order.memberChange.viceCartNum)>maxNum){
			$.alert("提示","加装数量已经超过能加装的最大数量【"+maxNum+"】!");
			return;
		}
		if((parseInt(newnum)+parseInt(ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,order.cust.getCustInfo415Flag(order.cust.getCustInfo415()))))>5){
			var usedNum = ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,order.cust.getCustInfo415Flag(order.cust.getCustInfo415()));
			var tips = "每个证件在全国范围最多可加装5张移动号卡，您当前业务在本证件下新增"+newnum+"张号卡，合计超过5卡，请对于超出的号卡登记其他使用人";
        	if(usedNum>0){
        		tips = "每个证件在全国范围最多可加装5张移动号卡，此用户下已经有"+usedNum+"个号码，您当前业务在本证件下新增"+newnum+"张号卡，合计超过5卡，请对于超出的号卡登记其他使用人";
        	}
            $.alert("提示",tips);
        }
		//初始化填单页面
		var prodInfo = order.prodModify.choosedProdInfo;
		var param = {
			boActionTypeCd : "S2" ,
			boActionTypeName : "套餐变更",
			actionFlag :"2",
			offerSpec : OrderInfo.offerSpec,
			prodId : prodInfo.prodInstId,
			offerMembers : OrderInfo.offer.offerMemberInfos,
			oldOfferSpecName : prodInfo.prodOfferName,
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc(),
			areaId : order.prodModify.choosedProdInfo.areaId,
			newnum : parseInt(newnum),
			oldnum : parseInt(oldnum)
		};
		if(oldnum>0){
			param.oldprodInstInfos = OrderInfo.oldprodInstInfos;
			param.oldofferSpec = OrderInfo.oldofferSpec;
			param.oldoffer = OrderInfo.oldoffer;
		}
		//套餐变更（如果有号码新装，则经办人拍照必填；如果是老号码加入，且客户证件类型不是身份证，则经办人拍照必填；其他情况下，经办人拍照非必填。）
		param.isRequired = "N";
		if(newnum>0){
			param.isRequired = "Y";
		}else if(oldnum>0){
			for(var i=0;i<OrderInfo.oldoffer.length;i++){
				if(OrderInfo.oldoffer[i].custInfos[0].identityCd!="1"){
					param.isRequired = "Y";
					break;
				}
			}
		}
		order.main.buildMainView(param);
		$("#member_dialog").hide();
		$("#overlay").hide();
//		easyDialog.close();
	}
	
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_fill_content").html(response.data);
		order.main.initOrderAttr();//初始化经办人
		var orderAttrFlag = ec.util.defaultStr($("#orderAttrFlag").val());
		var orderAttrCustId = ec.util.defaultStr($("#orderAttrCustId").val());
		OrderInfo.orderAttrFlag = orderAttrFlag;
		OrderInfo.subHandleInfo.orderAttrCustId = orderAttrCustId;
		if(orderAttrFlag=="N"){//订单提交报文中经办人下省用
			$("#orderAttrDiv").hide();
		}
		$("#fillNextStep").off("click").on("click",function(){
			SoOrder.submitOrder();
		});
		$("#fillNextStep1").off("click").on("click",function(){
			//#1466473  纳入老用户判断主卡副卡账户是否一致，不一致提示修改副卡账户
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)){
				var acctIdFlag = false;//主副卡是否一致标识
				var acctNumberList = [];//副卡是否一致标识
				for(var a=0;a<OrderInfo.oldprodAcctInfos.length;a++){
					var oldacctId = OrderInfo.oldprodAcctInfos[a].prodAcctInfos[0].acctId;
					var mainacctid = $("#acctSelect option:selected").val();
					if(oldacctId!=mainacctid){
						acctIdFlag = true;
						acctNumberList.push(OrderInfo.oldprodAcctInfos[a].prodAcctInfos[0].accessNumber);
					}
				}
				if(acctIdFlag){
					var tips = "您当前纳入加装的号码[";
					for(var a=0;a<acctNumberList.length;a++){
						if(a==0){
							tips += acctNumberList[a];
						}else{
							tips += ","+acctNumberList[a];
						}
					}
					tips += "]，账户与主卡账户不一致，纳入后将统一使用主卡账户，是否确认修改？";
					
					$.confirm("确认",tips,{ 
						yesdo:function(){
							SoOrder.submitOrder();
						},
						no:function(){
						}
					});
				}else{
					SoOrder.submitOrder();
				}
			}else{
				SoOrder.submitOrder();
			}
		});
		$("#fillLastStep").off("click").on("click",function(){
			order.main.lastStep();
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		//遍历主销售品构成
		var uimDivShow=false;//是否已经展示了
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(ec.util.isArray(this.prodInsts)){
				$.each(this.prodInsts,function(){
					var _prodInstId = "'"+this.prodInstId+"'";
					if(_prodInstId.indexOf("-") == -1){
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
						//现在号码
						var nowPhoneNum=this.accessNumber;
						var res = query.offer.queryChangeAttachOffer(param);
						$("#attach_"+prodId).html(res);	
						//如果objId，objType，objType不为空才可以查询默认必须
						if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
							param.queryType = "1,2";
							param.objId = this.objId;
							param.objType = this.objType;
							param.memberRoleCd = this.roleCd;
							param.offerSpecId=OrderInfo.offerSpec.offerSpecId;
							//默认必须可选包
							var data = query.offer.queryDefMustOfferSpec(param);
							CacheData.parseOffer(data);
							//默认必须功能产品
							param.queryType = "1";//只查询必选，不查默认
							var data = query.offer.queryServSpec(param);
							CacheData.parseServ(data);
						}
						/*if(CONST.getAppDesc()==0 && prodInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){	//预校验
						}else{	
						}*/
						AttachOffer.showMainRoleProd(prodId); //显示新套餐构成
						//根据已选功能产品查询带出的可选包
						var servSpecIds = [];
						if(AttachOffer.openServList!=null&&AttachOffer.openServList!=undefined){
							$.each(AttachOffer.openServList,function(){
								if(this.prodId == param.prodId){
									var servSpecList = this.servSpecList;
									if(servSpecList!=null&&servSpecList!=undefined){
										$.each(servSpecList,function(){
											if(this.servSpecId!=null&&this.servSpecId!=undefined){
												servSpecIds.push(this.servSpecId);
											}
											});
										}
								}
							});					
						}
						if(servSpecIds.length>0){
							param.queryType = "1,2";//查询必选，默认
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
						AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
						if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
							//uim卡校验
							if(OrderInfo.mktResInstCode!=undefined && OrderInfo.mktResInstCode!="null" && OrderInfo.mktResInstCode!=null && OrderInfo.mktResInstCode!=""){
								var array=OrderInfo.mktResInstCode.split(",");
								if(array!=null && array.length>0){
									//首先进行UIM是否重复判断
									var checkPhone="";
									var checkUim="";
									var checkCode="0";
									for(var i=0;i<array.length;i++){
										var numAndUim=array[i].split("_");
										if(numAndUim!=null && numAndUim.length==2){
											var thisPhone=numAndUim[0];
											var thisUim=numAndUim[1]
											if(checkPhone!=null && checkPhone!=""){
												if(checkPhone==thisPhone || checkUim==thisUim){
													checkCode="1";
													break;
												}
											}else{
												checkPhone=thisPhone;
												checkUim=thisUim;
											}
										}
									}
									
									if(checkCode=="1"){
										$.alert("提示","传入的UIM参数中存在重复数据,参数为["+OrderInfo.mktResInstCode+"]");
									}else{
										//没有重复的数据再进行匹配
										var nowUim="";
										
										for(var i=0;i<array.length;i++){
											var numAndUim=array[i].split("_");
											if(numAndUim!=null && numAndUim.length==2){
												var phoneCode=numAndUim[0];
												var uimCode=numAndUim[1];
												
												if(phoneCode==nowPhoneNum){
													nowUim=uimCode;
												}
											}
										}
										
										if(nowUim!=null && nowUim!="" && nowUim!="null"){
											cleckUim(nowUim,prodId);
											$("#uim_check_btn_"+prodId).hide();
											$("#uim_release_btn_"+prodId).hide();
										}
									}
								}
							}
							
							num++;
							if(!uimDivShow){
								$("#uimDiv_"+prodId).show();
							}else{
								$("#uimDiv_"+prodId).hide();
							}
						}
						uimDivShow=true;
					}else{
						var prodInst = this;
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
						AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品
						var obj = {
							ul_id : "item_order_"+prodInst.prodInstId,
							prodId : prodInst.prodInstId,
							offerSpecId : OrderInfo.offerSpec.offerSpecId,
							compProdSpecId : "",
							prodSpecId : prodInst.objId,
							roleCd : offerRole.roleCd,
							offerRoleId : offerRole.offerRoleId,
							partyId : OrderInfo.cust.custId
						};
						order.main.spec_parm(obj); //加载产品属性
					}
				});
			}
		});
//		if(offerChange.newMemberFlag){
			order.main.initAcct(0);
//		}
		if(offerChange.oldMemberFlag){
			order.main.initAcct(1);//初始化副卡帐户列表
			order.main.loadAttachOffer();
		}
		$("#zhanghuclose").click(function(){
			easyDialog.close();
			//删除所有选择帐户监听
			$(document).removeJEventListener("queryAccount");
		});
		order.dealer.initDealer(); //初始化发展人
		_initOrderProvAttr();//初始化省内订单属性
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){ //3G转4G需要校验
			offerChange.checkOfferProd();
		}
		//主副卡纳入新用户选号
		var nbrlist = [];
		var nbrflag = true;
		if(order.memberChange.newSubPhoneNum!="" && OrderInfo.reloadFlag=="Y"){
			var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
			for(var n=0;n<newSubPhoneNumsize.length;n++){
				if(newSubPhoneNumsize[n]!=""&&newSubPhoneNumsize[n]!=null&&newSubPhoneNumsize[n]!="null"){
					$.each(nbrlist,function(){
						if(this==newSubPhoneNumsize[n]){
							nbrflag = false;
							return false;
						}else{
							nbrflag = true;
						}
					});
					if(nbrflag){
						nbrlist.push(newSubPhoneNumsize[n]);
						$("#nbr_btn_-"+(n+1)).removeAttr("onclick");
						$("#nbr_btn_-"+(n+1)).removeClass("selectBoxTwo");
						$("#nbr_btn_-"+(n+1)).addClass("selectBoxTwoOn");
						var param = {"phoneNum":newSubPhoneNumsize[n]};
						var data = order.phoneNumber.queryPhoneNumber(param);
						if(data.datamap.baseInfo){
							$("#nbr_btn_-"+(n+1)).html(newSubPhoneNumsize[n]+"<u></u>");
							var boProdAns={
									prodId : "-"+(n+1), //从填单页面头部div获取
									accessNumber : data.datamap.baseInfo.phoneNumber, //接入号
									anChooseTypeCd : "2", //接入号选择方式,自动生成或手工配号，默认传2
									anId : data.datamap.baseInfo.phoneNumId, //接入号ID
									pnLevelId : data.datamap.baseInfo.phoneLevelId,
									anTypeCd : data.datamap.baseInfo.pnTypeId, //号码类型
									state : "ADD", //动作	,新装默认ADD	
									areaId : data.datamap.baseInfo.areaId,
									areaCode:data.datamap.baseInfo.zoneNumber,
									memberRoleCd:CONST.MEMBER_ROLE_CD.VICE_CARD,
									preStore:data.datamap.baseInfo.prePrice,
									minCharge:data.datamap.baseInfo.pnPrice
								};
							OrderInfo.boProdAns.push(boProdAns);
							order.dealer.changeAccNbr("-"+(n+1),newSubPhoneNumsize[n]);//选号玩要刷新发展人管理里面的号码
						}
					}else{
						$.alert("提示","号码"+newSubPhoneNumsize[n]+"重复输入");
					}
				}
			}
		}
		//主副卡纳入新用户UIM卡
		if(OrderInfo.mktResInstCode!="" && OrderInfo.reloadFlag=="Y"){
			nbrlist = [];
			nbrflag = true;
			var offerId = "-1";
//			offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
//			$.each(OrderInfo.oldprodInstInfos,function(){
//				if(this.prodInstId==prodId){
//					offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
//				}
//			});
			var mktResInstCodesize = OrderInfo.mktResInstCode.split(",");
			for(var u=0;u<mktResInstCodesize.length;u++){
				if(mktResInstCodesize[u]!=""&&mktResInstCodesize[u]!=null&&mktResInstCodesize[u]!="null" && order.memberChange.newSubPhoneNum!=""){
					var nbrAndUimCode = mktResInstCodesize[u].split("_");
					var _accNbr = nbrAndUimCode[0];
					var _uimCode = nbrAndUimCode[1];
					var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
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
					for(var n=0;n<newSubPhoneNumsize.length;n++){
						if(newSubPhoneNumsize[n]==_accNbr){
							nbrlist.push(newSubPhoneNumsize[n]);
							uimflag = true;
							$("#uim_txt_-"+(n+1)).attr("disabled",true);
							var uimParam = {
									"instCode":_uimCode
							};
							var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
							if (response.code==0) {
								if(response.data.mktResBaseInfo){
									if(response.data.mktResBaseInfo.statusCd=="1102"){
										$("#uim_check_btn_-"+(n+1)).attr("disabled",true);
										$("#uim_check_btn_-"+(n+1)).removeClass("purchase").addClass("disablepurchase");
										$("#uim_release_btn_-"+(n+1)).attr("disabled",false);
										$("#uim_release_btn_-"+(n+1)).removeClass("disablepurchase").addClass("purchase");
										$("#uim_txt_-"+(n+1)).val(_uimCode);
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
												prodId :  -(n+1), //产品ID
												offerId : offerId, //销售品实例ID
												state : "ADD", //动作
												relaSeq : "" //关联序列	
											};
										OrderInfo.clearProdUim(-(n+1));
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
							break;
						}
					}
					if(!uimflag){
						$.alert("提示","UIM卡"+_uimCode+"未匹配到接入号");
					}
				}
			}
		}
		//发展人
		if(OrderInfo.provinceInfo.salesCode!=""&&OrderInfo.reloadFlag=="Y"){
			order.main.queryDealer();
		}
	};
	
	function cleckUim(uim,prodId){
		var uimParam = {"instCode":uim};
		var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
		if (response.code==0) {
			if(response.data.mktResBaseInfo){
				if(response.data.mktResBaseInfo.statusCd=="1102"){
				//	$("#uim_check_btn_-"+(n+1)).attr("disabled",true);
				//	$("#uim_check_btn_-"+(n+1)).removeClass("purchase").addClass("disablepurchase");
				//	$("#uim_release_btn_-"+(n+1)).attr("disabled",false);
				//	$("#uim_release_btn_-"+(n+1)).removeClass("disablepurchase").addClass("purchase");
					$("#uim_txt_"+prodId).val(uim);
					var coupon = {
							couponUsageTypeCd : "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
							inOutTypeId : "1",  //出入库类型
							inOutReasonId : 0, //出入库原因
							saleId : 1, //销售类型
							couponId :response.data.mktResBaseInfo.mktResId, //物品ID
							couponinfoStatusCd : "A", //物品处理状态
							chargeItemCd : CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
							couponNum : 1, //物品数量
							storeId : response.data.mktResBaseInfo.mktResStoreId, //仓库ID
							storeName : "1", //仓库名称
							agentId : 1, //供应商ID
							apCharge : 0, //物品价格
							couponInstanceNumber : uim, //物品实例编码
							ruleId : "", //物品规则ID
							partyId : OrderInfo.cust.custId, //客户ID
							prodId : prodId, //产品ID
							offerId : -1, //销售品实例ID
						//	attachSepcId : OrderInfo.offerSpec.offerSpecId,
							state : "ADD", //动作
							relaSeq : "" //关联序列	
						};
					OrderInfo.clearProdUim(prodId);
					OrderInfo.boProd2Tds.push(coupon);
				}else{
					$.alert("提示","UIM卡["+uim+"]不是预占状态，当前为"+response.data.mktResBaseInfo.statusCd);
				}
			}else{
				$.alert("提示","查询不到UIM卡["+uim+"]信息");
			}
		}else if (response.code==-2){
			$.alertM(response.data);
		}else {
			$.alert("提示","UIM信息查询接口出错,稍后重试");
		}
	}
	//套餐变更提交组织报文
	var _changeOffer = function(busiOrders){
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
		AttachOffer.setAttachBusiOrder(busiOrders);  //订购退订附属销售品
		if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
						if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
							var prod = {
								prodId : this.objInstId,
								prodSpecId : this.objId,
								accessNumber : this.accessNumber,
								isComp : "N",
								boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
							};
							var busiOrder = OrderInfo.getProdBusiOrder(prod);
							if(busiOrder){
								busiOrders.push(busiOrder);
							}
						}
					}
				});
			}
		}
	};
			
	//创建退订主销售品节点
	var _createDelOffer = function(busiOrders,offer){	
		offer.offerTypeCd = 1;
		offer.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		var prodInfo = order.prodModify.choosedProdInfo;
		OrderInfo.getOfferBusiOrder(busiOrders,offer, prodInfo.prodInstId);
	};
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders,offer) {
		var prod = order.prodModify.choosedProdInfo;
		var offerSpec = OrderInfo.offerSpec;
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				objName : offerSpec.offerSpecName,//业务名称
				objId : offerSpec.offerSpecId,  //业务规格ID
				offerTypeCd : "1", //1主销售品
				accessNumber : prod.accNbr  //接入号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
			}, 
			data:{
				ooRoles : [],
				ooOwners : [{
					partyId : OrderInfo.cust.custId, //客户ID
					state : "ADD" //动作
				}]
			}
		};
		//遍历主销售品构成
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.prodInsts!=undefined){
				$.each(this.prodInsts,function(){
					var prodInstId = '"'+this.prodInstId+'"';
					if(prodInstId.indexOf("-")==-1){
						var ooRoles = {
							objId : this.objId, //业务规格ID
							objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
							objType : this.objType, // 业务对象类型
							offerRoleId : offerRole.offerRoleId, //销售品角色ID
							state : "ADD" //动作
						};
						busiOrder.data.ooRoles.push(ooRoles);
					}
				});
			}
		});
		
		if(offerChange.oldMemberFlag){//纳入老用户
			var offerRoleId = "";
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
							offerRoleId = offerRole.offerRoleId;
							break;
				} 
			}
			for(var q=0;q<OrderInfo.oldprodInstInfos.length;q++){
				var oldprodInfo = OrderInfo.oldprodInstInfos[q];
				var oldbusiOrder = {
						areaId : oldprodInfo.areaId,  //受理地区ID
						busiOrderInfo : {
							seq : OrderInfo.SEQ.seq--
						}, 
						busiObj : { //业务对象节点
							objId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferId,  //业务规格ID
							instId : oldprodInfo.mainProdOfferInstInfos[0].prodOfferInstId, //业务对象实例ID
							accessNumber : oldprodInfo.accNbr, //业务号码
							isComp : "Y", //是否组合
							offerTypeCd : "1" //1主销售品
						},  
						boActionType : {
							actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
							boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER
						}, 
						data:{
							ooRoles : []			
						}
					};
					var memberid = -1;
					for ( var i = 0; i < OrderInfo.oldoffer.length; i++) {
						if(OrderInfo.oldoffer[i].accNbr==oldprodInfo.accNbr){
							$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
								if(this.objType==CONST.OBJ_TYPE.PROD){
									var ooRole = {
										objId : this.objId,
										objInstId : this.objInstId,
										objType : this.objType,
										offerMemberId : memberid,
										offerRoleId : offerRoleId,
										state : "ADD"
									};
									busiOrder.data.ooRoles.push(ooRole);
									var oldooRole = {
											objId : this.objId,
											objInstId : this.objInstId,
											objType : this.objType,
											offerMemberId : this.offerMemberId,
											offerRoleId : this.offerRoleId,
											state : "DEL"
										};
									oldbusiOrder.data.ooRoles.push(oldooRole);
									--memberid;
								}
							});
						}
					}
				busiOrders.push(oldbusiOrder);
			}
			if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
				for ( var i = 0; i < OrderInfo.oldoffer.length; i++) { //遍历主销售品构成
					$.each(OrderInfo.oldoffer[i].offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
							if(AttachOffer.isChangeUim(this.objInstId)&&(OrderInfo.boProd2Tds.length>0||OrderInfo.zcd_privilege==0)){
								var prod = {
									prodId : this.objInstId,
									prodSpecId : this.objId,
									accessNumber : this.accessNumber,
									isComp : "N",
									boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
								};
								var busiOrder = OrderInfo.getProdBusiOrder(prod);
								if(busiOrder){
									busiOrders.push(busiOrder);
								}
							}
						}
					});
				}
			}
		}
		if(offerChange.newMemberFlag){
			//遍历主销售品构成
			for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
				var offerRole = OrderInfo.offerSpec.offerRoles[i];
				if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD){ //副卡
					if(offerRole.prodInsts!=undefined && offerRole.prodInsts.length>0){
						for ( var j = 0; j < offerRole.prodInsts.length; j++) {
							var prodInst = offerRole.prodInsts[j];
							var instid = '"'+prodInst.prodInstId+'"';
							if(prodInst.memberRoleCd=="401" && instid.indexOf("-")!=-1){
								var ooRole = {
										objId : prodInst.objId,
										objInstId : prodInst.prodInstId,
										objType : prodInst.objType,
										offerMemberId : OrderInfo.SEQ.offerMemberSeq--,
										offerRoleId : prodInst.offerRoleId,
										state : "ADD"
									};
								busiOrder.data.ooRoles.push(ooRole);
								busiOrders.push(SoOrder.createProd(prodInst.prodInstId,prodInst.objId));	
							}
						}		
					}
				} 
			} 
		}

		//销售参数节点
		if(ec.util.isArray(offerSpec.offerSpecParams)){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				if(param.setValue==undefined || param.setValue==""){
					param.setValue = param.value;
				}
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.setValue,
	                state : "ADD"
	            };
	            busiOrder.data.ooParams.push(ooParam);
			}				
		}
		
		//销售生失效时间节点
		if(offerSpec.ooTimes !=undefined ){
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(offerSpec.ooTimes);
		}
		
		//发展人
		busiOrder.data.busiOrderAttrs = [];
		var $tr = $("tr[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid"),
					channelNbr : $(this).find("select[name ='dealerChannel_"+OrderInfo.offerSpec.offerSpecId+"']").val()
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
				var dealer_name = {
						itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER_NAME,
						role : $(this).find("select").val(),
						value : $(this).find("input").attr("value") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer_name);	
			});
		}
		busiOrders.push(busiOrder);
	};
	
	//填单页面切换
	var _changeTab = function(prodId) {
		$.each($("#tab_"+prodId).parent().find("li"),function(){
			$(this).removeClass("setcon");
			$("#attach_tab_"+$(this).attr("prodId")).hide();
			$("#uimDiv_"+$(this).attr("prodId")).hide();
			$("#change_"+$(this).attr("prodId")).hide();
			$("#newProd_"+$(this).attr("prodId")).hide();
		});
		$("#tab_"+prodId).addClass("setcon");
		$("#attach_tab_"+prodId).show();
		$("#change_"+prodId).show();
		if(AttachOffer.isChangeUim(prodId)){
			$("#title_"+prodId).show();
			$("#uimDiv_"+prodId).show();
		}
		if(OrderInfo.actionFlag == 1 ){
			$("#newProd_"+prodId).show();
		}
		
		if(OrderInfo.actionFlag == 6 || OrderInfo.actionFlag == 2){
			var viceChangeFlag = false;
			if(OrderInfo.actionFlag == 6){
				$.each(order.memberChange.viceparams,function(){
					if(this.objInstId == prodId){
						viceChangeFlag = true;
						return false;
					}
				});
			}
			if(OrderInfo.actionFlag == 2){
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objInstId == prodId){
						viceChangeFlag = true;
						return false;
					}
				});
			}
			if(viceChangeFlag){
				$("#accountDiv").hide();
				$("#orderProvAttrDiv").show();
			}else{
				$("#accountDiv").show();
				$("#orderProvAttrDiv").hide();
				var newProdId = "'"+prodId+"'";
				if(newProdId.indexOf("-")!= -1){
					$("#newProd_"+prodId).show();
				}else{
				}
			}
		}
	};
	
	//省里校验单
	var _checkOrder = function(prodId){
		if(OrderInfo.actionFlag==3){
			_getAttachOfferInfo();
		}else{
			_getChangeInfo();
		}
		
		//查预校验加省份流水开关
        var propertiesKey = "TOKORDERINFOFORCHECKFLAG_"+OrderInfo.staff.soAreaId.substring(0,3);
        var isPCF = offerChange.queryPortalProperties(propertiesKey);
        if(isPCF == "ON"){
        	var custOrderAttrs =[{
        		"itemSpecId": "40010029",
        		 "value": OrderInfo.provinceInfo.provIsale
        	}];
        	OrderInfo.orderData.orderList.orderListInfo.custOrderAttrs = custOrderAttrs;
        }
        
		var data = query.offer.updateCheckByChange(JSON.stringify(OrderInfo.orderData));
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = []; //校验完清空
		if(data==undefined){
			return false;
		}
		if(data.resultCode==0 && ec.util.isObj(data.result)){ //预校验成功
			offerChange.resultOffer = data.result;
		}else {
			$.alert("预校验规则限制",data.resultMsg);
			offerChange.resultOffer = {}; 
			return false;
		}
		return true;
	};
	
	//3G套餐订购4G流量包时预校验的入参封装
	var _getAttachOfferInfo=function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && spec.ifPackage4G=="Y"){  //订购的附属销售品
					spec.offerTypeCd = 2;
					spec.boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_OFFER;
					spec.offerId = OrderInfo.SEQ.offerSeq--; 
					OrderInfo.getOfferBusiOrder(busiOrders,spec,open.prodId);	
				}
			}
		}
		$.each(busiOrders,function(){
			this.busiObj.state="ADD";
		});
	};
	
	//把旧套餐的产品自动匹配到新套餐中，由于现在暂时只支持主副卡跟单产品，所以可以自动匹配
	var _setChangeOfferSpec = function(memberNum,viceNum){
		if(memberNum==1){ //单产品变更
			var offerRole = getOfferRole();
			if(offerRole==undefined){
				alert("错误提示","无法变更到该套餐");
				return false;
			}
			offerRole.prodInsts = [];
			var flag=false;
			$.each(offerRole.roleObjs,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){
					var roleObj = this;
					flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							if(roleObj.objId!=this.objId){
								$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+this.roleName+"】角色的规格ID【"+this.objId+"】不一样");
								flag=true;
								return false;
							}
							roleObj.prodInstId = this.objInstId;
							roleObj.accessNumber = this.accessNumber;
							roleObj.memberRoleCd = this.roleCd;
							offerRole.prodInsts.push(roleObj);
						}
					});
					if(flag){
						return false;
					}
				}
			});
			if(flag){
				return false;
			}
		}else{  //多成员角色
			for (var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				if(offerMember.objType==CONST.OBJ_TYPE.PROD){
					var flag = true;
					for (var j = 0; j < OrderInfo.offerSpec.offerRoles.length; j++) {
						var offerRole = OrderInfo.offerSpec.offerRoles[j];
						if(offerMember.roleCd==offerRole.memberRoleCd){ //旧套餐对应新套餐角色
							for (var k = 0; k < offerRole.roleObjs.length; k++) {
								var roleObj = offerRole.roleObjs[k];
								if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
									if(roleObj.objId!=offerMember.objId){
										$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+offerMember.roleName+"】角色的规格ID【"+offerMember.objId+"】不一样");
										return false;
									}
									if(!ec.util.isArray(offerRole.prodInsts)){
										offerRole.prodInsts = [];
									}
									var newObject = jQuery.extend(true, {}, roleObj); 
									newObject.prodInstId = offerMember.objInstId;
									newObject.accessNumber = offerMember.accessNumber;
									newObject.memberRoleCd = offerMember.roleCd;
									offerRole.prodInsts.push(newObject);
									if(offerRole.prodInsts.length>roleObj.maxQty){
										$.alert("规则限制","新套餐【"+offerRole.offerRoleName+"】角色最多可以办理数量为"+roleObj.maxQty+",而旧套餐数量大于"+roleObj.maxQty);
										return false;
									}
									break;
								}
							}
							flag = false;
							break;
						}
					}
					if(flag){
						$.alert("规则限制","旧套餐【"+offerMember.roleName+"】角色在新套餐中不存在，无法变更");
						return false;
					}
				}
			}
		}
		return true;
	};
	
	//获取单产品变更自动匹配的角色
	var getOfferRole = function(){
		//新套餐是主副卡,获取主卡角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){  //主卡
				return offerRole;
			}
		}
		//新套餐不是主副卡，返回第一个包含接入产品的角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			for (var j = 0; j < offerRole.roleObjs.length; j++) {
				var roleObj = offerRole.roleObjs[j];
				if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					return offerRole;
				}
			}
		}
	};
	
	//获取套餐变更节点
	var _getChangeInfo = function(){
		OrderInfo.getOrderData(); //获取订单提交节点
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.cust.areaId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
	};
	
	//根据省内返回的数据校验
	var _checkOfferProd = function(){
		if(offerChange.resultOffer==undefined){
			return;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			$.each(prodInfos,function(){
				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
				var flag = true;
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);
					if(this.state=="DEL"){
						if(serv!=undefined){
							var $span = $("#li_"+prodId+"_"+this.prodInstId).find("span");
							$span.addClass("del");
							serv.isdel = "Y";
							$("#del_"+prodId+"_"+this.prodInstId).hide();
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){  //在已开通里面，修改不让关闭
							$("#del_"+prodId+"_"+this.prodInstId).hide();
						}else{
							var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
							if(servSpec!=undefined){
								$("#del_"+prodId+"_"+this.productId).hide();
							}else {
								
								var productName=this.productName;
								if(this.productId!=undefined && this.productId!=""){
									//AttachOffer.addOpenServList(prodId,this.productId,this.prodName,this.ifParams);
									AttachOffer.openServSpec(prodId,this.productId,this.productName,this.ifParams);
								}
							}
						}
					}
				}
			});
		}
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){//多产品套餐
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					var prodId = this.objInstId;
					$.each(offers,function(){
						if(this.memberInfo==undefined){
							return true;
						}
						var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
						var flag = true;
						$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
							if(prodId == this.accProdInstId){		
								if(ec.util.isObj(offer)){
									this.prodId = this.accProdInstId;
//									offer.offerMemberInfos = [];
//									offer.offerMemberInfos.push(this);
								}
								flag = false;
								return false;
							}
						});
						if(flag){
							return true;
						}
						if(this.state=="DEL"){
							if(offer!=undefined){
								var $span = $("#li_"+prodId+"_"+this.prodOfferInstId).find("span");
								$span.addClass("del");
								offer.isdel = "Y";
								if(this.isRepeat!="Y"){//如果可选包下面有多个接入类产品，到时候只拼一个退订节点
									this.isRepeat="Y";
								}else{
									offer.isRepeat="Y";
								}
								$("#del_"+prodId+"_"+this.prodOfferInstId).hide();
							}	
						}else if(this.state=="ADD"){
							if(offer!=undefined){ //在已开通里面，修改不让关闭
								$("#del_"+prodId+"_"+this.prodOfferInstId).hide();
							}else{
								var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已开通里面查找
								if(offerSpec!=undefined){
									$("#del_"+prodId+"_"+this.prodOfferId).hide();
								}else {
									if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
										//AttachOffer.addOpenList(prodId,this.prodOfferId);			
										AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
									}
								}
							}
						}
					});
				});
			}
		}
	};
	
	//根据省内返回的数据校验拼成html
	var _checkAttachOffer = function(prodId){
		var content="";
		if(offerChange.resultOffer==undefined){
			return content;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			var str = "";
			$.each(prodInfos,function(){
//				var prodId = this.accProdInstId;
//				//容错处理，省份接入产品实例id传错
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
					var serv = CacheData.getServ(prodId,this.prodInstId);//已开通功能产品里面查找
					var servSpec = CacheData.getServSpec(prodId,this.productId);//已选功能产品里面查找
					if(this.state=="DEL"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span class="del">'+serv.servSpecName+'</span>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+servSpec.servSpecName+'</span>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+this.productName+'</span>'
									+'</li>';
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span>'+serv.servSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+servSpec.servSpecName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+this.productName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
								}
						}
					}
				}
			});
			if(str==""){
				content="";
			}else{
				content="<div class='fs_choosed'>订购4G流量包，需订购和取消如下功能产品：<br><ul>"+str+"</ul></div><br>";
			}
		}
		
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			var str="";
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
				var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已订购里面查找
				var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已选里面查找
				if(this.state=="DEL"){
					if(offer!=undefined){
						str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
								+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
								+'<span class="del">'+offer.offerSpecName+'</span>'
							+'</li>';
					}else{
						if(offerSpec!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span class="del">'+offerSpec.offerSpecName+'</span>'
								+'</li>';
						}else if(this.prodOfferName!=undefined && this.prodOfferName!=""){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span class="del">'+this.prodOfferName+'</span>'
								+'</li>';
						}
					}	
				}else if(this.state=="ADD"){
					if(offer!=undefined){
						str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
								+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
								+'<span>'+offer.offerSpecName+'</span>'
								+'<dd class="mustchoose"></dd>'
							+'</li>';
					}else{
						if(offerSpec!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span>'+offerSpec.offerSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else if(this.prodOfferName!=undefined && this.prodOfferName!=""){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span>'+this.prodOfferName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}
					}
				}
			});
			if(str!=""){
				content+="<div class='fs_choosed'>订购4G流量包，需开通和关闭如下可选包：<br><ul>"+str+"</ul></div>";
			}
		}
		
		return content;
	};
	
	//初始化省内订单属性
	var _initOrderProvAttr = function(){
		//var obj=$("#orderProvAttrIsale").val;
		if($("#orderProvAttrIsale")){
			$("#orderProvAttrIsale").val(OrderInfo.provinceInfo.provIsale);
		}
			
		
		var url=contextPath+"/order/provOrderAttrFlag";
		$.ecOverlay("<strong>正在查询是否显示省内订单属性,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,{});	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data!=undefined){
				if("0"==response.data){
					$("#orderProvAttrDiv").show();
					if(order.memberChange.reloadFlag=="N"){
						var custOrderAttrs = order.memberChange.rejson.orderList.orderListInfo.custOrderAttrs;
						$.each(custOrderAttrs,function(){
							//省内订单属性
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.PROV_ISALE){
								$("#orderProvAttrIsale").val(OrderInfo.provinceInfo.provIsale);
							}
						});
					}
				}
			}
		}
	};
	
	/**
	 * 查询portal.properties配置 省份配置
	 */
	var _queryPortalProperties = function(propertiesKey){
		var url= contextPath+"/common/queryPortalProperties";
		var propertiesParam={
			propertiesKey : propertiesKey
		};
		var response = $.callServiceAsJson(url,propertiesParam);	
		$.unecOverlay();
		if (response.code==0) {
			return response.data;
		}else {
			return "";
		}
	
	};
	
	return {
		init 					: _init,
		changeOffer 			: _changeOffer,
		offerChangeView			: _offerChangeView,
		changeTab				: _changeTab,
		checkOrder				: _checkOrder,
		checkAttachOffer		: _checkAttachOffer,
		fillOfferChange			: _fillOfferChange,
		resultOffer				: _resultOffer,
		checkOfferProd			: _checkOfferProd,
		getChangeInfo			: _getChangeInfo,
		initOrderProvAttr		: _initOrderProvAttr,
		setChangeOfferSpec		: _setChangeOfferSpec,
		offerChangeConfirm		: _offerChangeConfirm,
		queryPortalProperties   :_queryPortalProperties
	};
})();
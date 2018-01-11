/**
 * 销售品变更
 * 
 * @author wukf
 * date 2013-9-22
 */
CommonUtils.regNamespace("offerChange");

offerChange = (function() {
	
	var _resultOffer = {}; //预校验单接口返回
	var _newAddList = [];
	var _newMemberFlag = false;
	var _oldMemberFlag = false;
	var maxNum = 0;
	
	//初始化套餐变更页面
	var _init = function (){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 2;
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
		//初始化套餐查询页面
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsHtmlGet(contextPath+"/order/prodoffer/prepare",{});	
		$.unecOverlay();
		if(response.code != 0) {
			$.alert("提示","查询失败,稍后重试");
			return;
		}
		SoOrder.step(0,response.data); //订单准备
		//初始化销售品成员实例构成使用人信息
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			var param = {
				prodInstId : this.objInstId,
				acctNbr : this.accessNumber,
				prodSpecId : this.objId,
				areaId : OrderInfo.getAreaId()
			};
			order.cust.initUserInfos(param);
		});
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
		//4g系统需要
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}else{
				//查分省预校验开关
				var propertiesKey = "YJY-"+OrderInfo.staff.soAreaId.substring(0,3) + "0000";
				var isYJY = _queryPortalProperties(propertiesKey);
				//所有套餐变更省内校验单
				if(isYJY == "ON"){//预校验开关开着，预校验
					if(!offerChange.checkOrder()){ 
						return;
					}
				}
			}
			//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			if(!prod.uim.setProdUim()){ 
				return ;
			}
		}
		// 套餐变更纳入老用户作为副卡分省开关控制（在MDA配置）
		if(OrderInfo.actionFlag == 2 && "ON" == _queryPortalProperties("OLDMEMBER_" + OrderInfo.staff.soAreaId.substring(0,3))){ //套餐变更	
			var areaidflag = order.memberChange.areaidJurisdiction();
			var iflag = 0; //判断是否弹出副卡选择框 false为不选择
			var max = 0;
			var $tbody = $("#member_tbody");
			$tbody.html("");
			$("#main_title").text(OrderInfo.offerSpec.offerSpecName);
			var memberRoleCd = "";
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				memberRoleCd = this.memberRoleCd;
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
							if(this.minQty !=0){
                                this.minQty = this.minQty-membernum;
                                this.dfQty = this.dfQty-membernum;
                                if(this.minQty<0){
                                     this.minQty = 0;
                                }
                                if(this.dfQty<0){
                                     this.dfQty = 0;
                                }
                          }
							max = this.maxQty<0?"不限制":this.maxQty-membernum;
							if(max<0){
								max = 0;
							}
							maxNum = max;
							$tr.append("<td align='left' colspan='3'>"+this.objName+" :<i id='plan_no' style='margin-top: 3px; display: inline-block; vertical-align: middle;'>"+
									"<a class='add' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'></a>"+
									"<input id='"+objInstId+"' type='text' value='"+this.dfQty+"' class='numberTextBox width22' readonly='readonly'>"+
									"<a class='add2' href='javascript:order.service.addNum(\""+objInstId+"\","+this.maxQty+",\""+offerRole.parentOfferRoleId+"\");'> </a>"+
									"</i>"+this.minQty+"-"+max+"（张） </td>");	
							iflag++;
							if(max>0 && areaidflag!="" && areaidflag.net_vice_card=="0"){
								var oldTips = "注意：纳入老用户必须和主卡账户一致!";
								if(query.common.queryPropertiesStatus("ADD_OLD_USER_MOD_ACCT_"+OrderInfo.getAreaId().substring(0,3))){
									oldTips = "注意：您纳入加装的移动电话纳入后将统一使用主卡账户！";
								}
								var olro = "<tr style='background:#f8f8f8;' id='oldnum_1' name='oldnbr'>" +
								"<td class='borderLTB' style='font-size:14px; padding:0px 0px 0px 12px'><span style='color:#518652; font-size:14px;'>已有移动电话</span></td>" +
								"<td align='left' colspan='3'><input value='' style='margin-top:10px' class='numberTextBox' id='oldphonenum_1' type='text' >" +
								"<a style='margin-top:15px' class='add2' href='javascript:order.memberChange.addNum("+max+",\"\");'> </a>"+this.minQty+"-"+max+"（张）</td></tr>"+	
								"<tr style='background:#f8f8f8;' name='oldnum_tips'><td align='left' colspan='4' style ='color: red; padding-left: 30px;'>"+oldTips+"</td></tr>";	
								$tr.after(olro);
							}
						}
					});
				}
			});
			if(memberRoleCd ==1){
				offerChangeConfirm();
			}else{
				easyDialog.open({
					container : "member_dialog"
				});
			}
			$("#member_btn").off("click").on("click",function(){
				offerChangeConfirm();
				try {
					easyDialog.close();
				} catch (e) {
					$('#member_dialog').hide();
					$('#overlay').hide();
				}
			});
		}else{
			offerChangeConfirm();
		}
	};
	
	function offerChangeConfirm(){
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
			OrderInfo.isHandleCustNeeded = true;
			order.service.setOfferSpec();
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

        var usedNum=ec.util.mapGet(OrderInfo.oneCardFiveNum.usedNum,order.cust.getCustInfo415Flag(order.cust.getCustInfo415()));
        if(!ec.util.isObj(usedNum)){
            usedNum = 0;
        }
        if((parseInt(newnum)+parseInt(usedNum))>5){
            $.alert("提示","此用户下已经有"+usedNum+"个号码，多余的副卡请选择其它使用人后继续办理业务！");
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
			//#1476472初始化老用户使用人信息
			$.each(OrderInfo.oldprodInstInfos,function(){
				var param = {
					prodInstId : this.prodInstId,
					acctNbr : this.accNbr,
					prodSpecId : this.productId,
					areaId : this.areaId
				};
				order.cust.initUserInfos(param);
			});
		}
		order.main.buildMainView(param);
//		easyDialog.close();
	}
	
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_fill_content").html(response.data);
		$("#fillNextStep").off("click").on("click",function(){
			//#1466473纳入老用户判断主卡副卡账户是否一致，不一致提示修改副卡账户（分省开关控制）
			var addOldUserModAcctFalg = query.common.queryPropertiesStatus("ADD_OLD_USER_MOD_ACCT_"+OrderInfo.getAreaId().substring(0,3));
			if(ec.util.isArray(OrderInfo.oldprodInstInfos)&& addOldUserModAcctFalg){
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
							//根据查询默认必选返回可选包再遍历查询可选包规格构成，来支撑默认必选带出的可选包触发终端校验框加入 redmine 111364
							if(data.result!=null&&data.result!=undefined){
								if(data.result.offerSpec!=null&&data.result.offerSpec!=undefined){
									$.each(data.result.offerSpec,function(){
										var fullOfferSpec = query.offer.queryAttachOfferSpec(param.prodId,this.offerSpecId);
										for(var attr in fullOfferSpec){ //把可选包规格构成查询到的属性添加到原默认必选返回的规格中
											this[attr] = fullOfferSpec[attr];
											}  						
									});										
								}
							}
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
						//#1476472 营业厅翼支付开户IT流程优化 增加翼支付功能产品订购限制，不判断满足订购条件就退订
						if(!order.cust.canOrderYiPay(param.prodId,1)){
							var hasYiPayFlag = false;
							var yiPayServSpec = {};
							if(ec.util.isArray(AttachOffer.openServList)){
								for ( var j = 0; j < AttachOffer.openServList.length; j++) {
									if(param.prodId == AttachOffer.openServList[j].prodId){
										if(ec.util.isArray(AttachOffer.openServList[j].servSpecList)){
											for ( var k = 0; k < AttachOffer.openServList[j].servSpecList.length; k++) {
												if( AttachOffer.openServList[j].servSpecList[k].servSpecId == CONST.PROD_SPEC.YIPAY_SERVSPECID){
													hasYiPayFlag = true;
													yiPayServSpec = AttachOffer.openServList[j].servSpecList[k];
													break;
												}
											}
										}
									}
								}
							}
							if(hasYiPayFlag){
								AttachOffer.closeServSpec(param.prodId,yiPayServSpec.servSpecId,yiPayServSpec.aliasName,yiPayServSpec.ifParams,"Y");
								//给出拦截提示信息，在互斥依赖依赖退订提示取消
								var tips = "当前产权人或使用人证件类型不在【";
								for (var j = 0; j < CONST.YIPAY_IDENTITYCD.length; j ++) {
									if(j==0)
										tips += CONST.YIPAY_IDENTITYCD[j].NAME;
									else
										tips += ","+CONST.YIPAY_IDENTITYCD[j].NAME;
								}
								tips += "】中，不允许订购翼支付功能产品，系统会自动退订相关的依赖销售品！"
								$.alert("提示",tips);
							}
						}
						AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
						if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
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
						//#1476472 营业厅翼支付开户IT流程优化 增加翼支付功能产品订购限制，不判断满足订购条件就退订
						if(!order.cust.canOrderYiPay(param.prodId,1)){
							var hasYiPayFlag = false;
							var yiPayServSpec = {};
							if(ec.util.isArray(AttachOffer.openServList)){
								for ( var j = 0; j < AttachOffer.openServList.length; j++) {
									if(param.prodId == AttachOffer.openServList[j].prodId){
										if(ec.util.isArray(AttachOffer.openServList[j].servSpecList)){
											for ( var k = 0; k < AttachOffer.openServList[j].servSpecList.length; k++) {
												if( AttachOffer.openServList[j].servSpecList[k].servSpecId == CONST.PROD_SPEC.YIPAY_SERVSPECID){
													hasYiPayFlag = true;
													yiPayServSpec = AttachOffer.openServList[j].servSpecList[k];
													break;
												}
											}
										}
									}
								}
							}
							if(hasYiPayFlag){
								AttachOffer.closeServSpec(param.prodId,yiPayServSpec.servSpecId,yiPayServSpec.aliasName,yiPayServSpec.ifParams,"Y");
								//给出拦截提示信息，在互斥依赖依赖退订提示取消
								var tips = "当前产权人或使用人证件类型不在【";
								for (var j = 0; j < CONST.YIPAY_IDENTITYCD.length; j ++) {
									if(j==0)
										tips += CONST.YIPAY_IDENTITYCD[j].NAME;
									else
										tips += ","+CONST.YIPAY_IDENTITYCD[j].NAME;
								}
								tips += "】中，不允许订购翼支付功能产品，系统会自动退订相关的依赖销售品！"
								$.alert("提示",tips);
							}
						}
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
						if(OrderInfo.isGroupProSpec(prodInst.objId)){//综合办公群套餐
							   try{
									var url = contextPath+"/offer/querySeq";
									var param = {
										"acctNbr":"",
										"identityCd":"",
										"identityNum":"",
										"partyName":"",
										"diffPlace":"",
										"areaId":OrderInfo.getAreaId(),
										"prodId":prodInst.objId,
										"staffId":OrderInfo.staff.staffId,
										"lanId":OrderInfo.getAreaId(),
										"prodClass":"",
										"areaNbr":""
									};
									var response = $.callServiceAsJson(url,JSON.stringify(param));
									if(response.code == -2){
										$.alertM(response.data);
										return;
									}
									if (response.code == 0) {
										var data = response.data;
										if(data!=""&&data!=undefined){
											order.main.BIZID = data.result.BIZID;
											$("#10020047_-1").val(order.main.BIZID);
										}
									}
								}catch(e){
									
								}
						}
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
		//为主套餐属性自动设置服务参数
		if(CacheData.setParam(-1,OrderInfo.offerSpec)){ 
			$("#mainOffer").removeClass("canshu").addClass("canshu2");
		}
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){ //3G转4G需要校验
		    offerChange.checkOfferProd();
		}else{
			//查分省预校验开关
			var propertiesKey = "YJY-"+OrderInfo.staff.soAreaId.substring(0,3) + "0000";
			var isYJY = _queryPortalProperties(propertiesKey);
			if(isYJY == "ON"){ //预校验开关开着，预校验
				offerChange.checkOfferProd();
			}
		}
		
		//初始化 付费类型 和 是否信控 变更规则
		_initChangeProdAttrs();
	};
	
	//初始化 付费类型 和 是否信控
	var _initChangeProdAttrs = function(){
		if($('#offerChangeFeeTypeSelect').length > 0 && $('#offerChangeXinkongSelect').length > 0){
			var oldFeeType = order.prodModify.choosedProdInfo.feeType;
			var oldIsXinkongValue = $('#offerChangeXinkongSelect').attr('oldValue');
			$('#offerChangeFeeTypeSelect option[value="'+oldFeeType+'"]').attr('selected', 'selected');
			$('#offerChangeXinkongSelect option[value="'+oldIsXinkongValue+'"]').attr('selected', 'selected');
			order.prodModify.choosedProdInfo.isXinkongValue = oldIsXinkongValue; 
			
			//修改后的付费类型为后付费时，“是否信控”才可以修改。修改后的付费类型为预付费时，“是否信控”是固定的值“是”
			var changeFunction = function(){
				var newOfferFeeType = $('#offerChangeFeeTypeSelect').val();
				if(newOfferFeeType != CONST.PAY_TYPE.AFTER_PAY){
					if($('#offerChangeXinkongSelect option[value=""]').length < 1){
						$('#offerChangeXinkongSelect').append('<option value="">无</option>');
					}
					$('#offerChangeXinkongSelect').val("").attr('disabled', 'disabled');
					
					if(newOfferFeeType == CONST.PAY_TYPE.BEFORE_PAY){
						$('#offerChangeXinkongSelect').val(CONST.PROD_ATTR_VALUE.IS_XINKONG_YES); //是否信控 “是”选项的value为20
					}
				} else {
					$('#offerChangeXinkongSelect option[value=""]').remove();
					$('#offerChangeXinkongSelect').removeAttr('disabled'); //是否信控 “是”选项的value为20
				}
				
				OrderInfo.offerSpec.feeType = newOfferFeeType;
				offerChange.isChangeFeeType=true;
//				AttachOffer.showOfferSpecByFeeType();
			};
			$('#offerChangeFeeTypeSelect').off('change').on('change',changeFunction);
			changeFunction();
		}
	};
	
	//创建变更付费类型节点
	var _createChangeFeeType = function(busiOrders,offer){
		if($('#offerChangeFeeTypeSelect').length > 0 && $('#offerChangeXinkongSelect').length > 0){
			var oldOfferFeeType = order.prodModify.choosedProdInfo.feeType;
			var newOfferFeeType = $('#offerChangeFeeTypeSelect').val();
			var oldIsXinkongValue = order.prodModify.choosedProdInfo.isXinkongValue;
			var newIsXinkongValue = $('#offerChangeXinkongSelect').val();
			
			if($.trim(newOfferFeeType) != '' && $.trim(newIsXinkongValue) != ''){
				if(newOfferFeeType != oldOfferFeeType || newIsXinkongValue != oldIsXinkongValue){
					$.each(offer.offerMemberInfos, function(i, offerMember){
						if(offerMember.objType==2){//接入类产品作为需要更换付费方式的成员
							var busiOrder = {
									areaId : OrderInfo.getProdAreaId(offerMember.objInstId),
									busiOrderInfo : {
										seq : OrderInfo.SEQ.seq--
									},
									busiObj : { //业务对象节点
										instId : offerMember.objInstId, //业务对象实例ID
										objId : offerMember.objId,  //产品规格ID
										accessNumber : offerMember.accessNumber  //接入号码
									},
									boActionType : {
										actionClassCd : CONST.ACTION_CLASS_CD.PROD_ACTION,
										boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_FEE_TYPE
									},
									data:{}
							};
							if(newOfferFeeType != oldOfferFeeType){
								busiOrder.data.boProdFeeTypes = [ {
									feeType : oldOfferFeeType,
									state : "DEL"
								}, {
									feeType : newOfferFeeType,
									state : "ADD"
								} ];
							}
							if(oldIsXinkongValue != newIsXinkongValue){
								// 原先的是否信控 产品实例属性值为空的话，只需要一个ADD 不需要DEL
								busiOrder.data.boProdItems = [ {
									itemSpecId : CONST.PROD_ATTR.IS_XINKONG,
									state : "ADD",
									value : newIsXinkongValue
								} ];
								if($.trim(oldIsXinkongValue) != ''){
									busiOrder.data.boProdItems.push({
										itemSpecId : CONST.PROD_ATTR.IS_XINKONG,
										state : "DEL",
										value : oldIsXinkongValue
									});
								}
							}
							busiOrders.push(busiOrder);
						}
					});
				}
			}
		}
	};
	
	// 套餐变更提交组织报文
	var _changeOffer = function(busiOrders){
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
//		if(offerChange.newMemberFlag || offerChange.oldMemberFlag){
//			_createMainOrder(busiOrders);//纳入新老用户
//		}
		_createChangeFeeType(busiOrders,OrderInfo.offer); //变更付费类型
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

		var prodInfo = order.prodModify.choosedProdInfo;
		var offerBusiOrder = {};
		$.each(AttachOffer.openedList,function(){//共享套餐级可选包
			var mainCartOpenedList = this;
			$.each(this.offerList,function(){
				if(this.offerRoleId=="600"){
					offerBusiOrder = {
							areaId : prodInfo.areaId,  //受理地区ID
							busiOrderInfo : {
								seq : OrderInfo.SEQ.seq--
							}, 
							busiObj : { //业务对象节点
								objId : this.offerSpecId,  //业务规格ID
								instId : this.offerId, //业务对象实例ID
								accessNumber : OrderInfo.getAccessNumber(mainCartOpenedList.prodId), //业务号码
								offerTypeCd : "2"
							},  
							boActionType : {
								actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
								boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP
							}, 
							data:{
								ooRoles : []			
							}
						};
				}
			});
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
								//if((this.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD || this.roleCd=="1") && this.objType=="2"){
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
									if(ec.util.isObj(offerBusiOrder.areaId)){
										ooRole.offerRoleId = "601";
										offerBusiOrder.data.ooRoles.push(ooRole);
									}
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
			if(ec.util.isObj(offerBusiOrder.areaId)){
				busiOrders.push(offerBusiOrder);
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
								if(ec.util.isObj(offerBusiOrder.areaId)){
									ooRole.offerRoleId = "601";
									offerBusiOrder.data.ooRoles.push(ooRole);
								}
								busiOrders.push(SoOrder.createProd(prodInst.prodInstId,prodInst.objId));	
							}
						}		
					}
				} 
			} 
			if(ec.util.isObj(offerBusiOrder.areaId)){
				busiOrders.push(offerBusiOrder);
			}
		}
	

		//销售参数节点
		if(ec.util.isArray(offerSpec.offerSpecParams)){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				if(param.setValue==undefined){
					param.setValue = param.value;
				}
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.setValue,
	                state : "ADD"
	            };
				if (ec.util.isObj(param.setValue)) {
					busiOrder.data.ooParams.push(ooParam);
				}
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
		var newProdId = "'"+prodId+"'";
		if(newProdId.indexOf("-")!= -1){
			$("#newProd_"+prodId).show();
			$("#accountDiv").show();
		}else{
			$("#accountDiv").hide();
		}
	};
	
	//省里校验单
	var _checkOrder = function(prodId){
		if(OrderInfo.actionFlag==3){
			_getAttachOfferInfo();
		}else{
			_getChangeInfo();
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
									roleObj.maxQty == 2;
									if(offerRole.prodInsts.length>roleObj.maxQty){
										var offerRoleshowName = getMemberRoleNameByCd(offerRole.memberRoleCd);
										if(offerRoleshowName!=null)
											$.alert("规则限制","新套餐【"+offerRoleshowName+"】角色最多可以办理数量为"+roleObj.maxQty+",而旧套餐的成员数量大于"+roleObj.maxQty);
										else
											$.alert("规则限制","新套餐【"+offerRole.offerRoleName+"】角色最多可以办理数量为"+roleObj.maxQty+",而旧套餐的成员数量大于"+roleObj.maxQty);
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
						if(OrderInfo.offerSpec.offerRoles.length==1){
							$.alert("规则限制","原套餐为主副卡套餐，无法变更为单产品套餐，请进行主副卡成员变更!");
						}else{
							var offerRoleshowName = getMemberRoleNameByCd(offerMember.roleCd);
							if(offerRoleshowName!=null)
								$.alert("规则限制","旧套餐【"+offerRoleshowName+"】角色在新套餐中不存在，无法变更!");
							else
								$.alert("规则限制","旧套餐【"+offerMember.roleName+"】角色在新套餐中不存在，无法变更!");						
						}
						return false;
					}
				}
			}
		}
		return true;
	};
	
	//根据成员角色ID获取对应名称，redmine51273_20151118_tangchen
	var getMemberRoleNameByCd = function(roleCd){
		memberRoleList = CONST.MEMBER_ROLE_LIST;
		for (var k = 0; k < memberRoleList.length; k++) {
			if(memberRoleList[k].MEMBER_ROLE_CD ==roleCd)
				return memberRoleList[k].MEMBER_ROLE_NAME;
		}
		return null;
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
//		_createChangeFeeType(busiOrders,OrderInfo.offer); //变更付费类型
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
		AttachOffer.updateCheckList = [];
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
										var updateCheck = {
												prodId: prodId,
												prodOfferId: this.prodOfferId
										};
										AttachOffer.updateCheckList.push(updateCheck);
										//AttachOffer.addOpenList(prodId,this.prodOfferId);			
										//AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
									}
								}
							}
						}
					});
				});
				AttachOffer.addOfferSpecByCheckForUpdate(AttachOffer.updateCheckList);
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
		if(order.cust.fromProvFlag == "1" && ec.util.isObj(order.cust.provIsale)){
			$("#orderProvAttrIsale").val(order.cust.provIsale);
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
		queryPortalProperties  :_queryPortalProperties,
		setChangeOfferSpec		: _setChangeOfferSpec,
		newMemberFlag			: _newMemberFlag,
		oldMemberFlag			: _oldMemberFlag
	};
})();
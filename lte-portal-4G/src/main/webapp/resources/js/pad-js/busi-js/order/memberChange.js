CommonUtils.regNamespace("order", "memberChange");
order.memberChange = function(){
	var _offerProd={};
	var _memberAddList=[];
	var _ischooseOffer=false;
	var choosenum = 1;//纳入老用户数量
	var idnum = 1;
	var _reloadFlag = "";
	var _newSubPhoneNum;
	var _oldSubPhoneNum;
	var _newmembers = {};
	var _oldmembers = {
			objInstId:[]
	};
	var _delmembers = {
			accessNumbers:[]
	};
	var _changemembers = {
			accessNumbers:[]
	};
	var _rejson = {};
	
	//点击主副卡成员变更跳出一个div
	var _showOfferCfgDialog=function(){
		if(order.prodModify.choosedProdInfo.prodStateCd==CONST.PROD_STATUS_CD.STOP_PROD){
			$.alert("提示","停机产品不允许受理！");
			return;
		}
		_memberAddList=[];
		choosenum = 1;
		idnum = 1;
		OrderInfo.busitypeflag=3;
		OrderInfo.actionFlag=6;
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldprodAcctInfos = [];
		OrderInfo.oldAddNumList = [];
		OrderInfo.viceOfferSpec=[];
		
		//页面变动
		$("#order_fill_content").empty();
		OrderInfo.order.step=0;//订单初始页面
		order.prepare.hideStep();
		$("#orderedprod").show();
		$("#order_prepare").show();
		$("#order_confirm").hide();
		
		order.prepare.createorderlonger();
		//4G系统判断，如果是3g套餐不能做该业务
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G=="Y"){
			$.alert("提示","3G套餐不允许做主副卡成员变更业务！","information");
			return;
		}
		//根据省份来限制纳入老用户入口,开关在portal.properties
		var areaidflag = _areaidJurisdiction();		
				
		//查询销售品规格并且保存
		var param = {
			offerSpecId : order.prodModify.choosedProdInfo.prodOfferId, 
			offerTypeCd : 1,
			partyId : OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}		
		//根据销售品规格验证是否是主副卡套餐
		var flag = true;
		$.each(offerSpec.offerRoles,function(){
			if (this.memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {
				flag = false;
				return false;
			}
		});
		if(flag){
			$.alert("错误","你选择的套餐不是主副卡套餐，不能进行主副卡成员变更");
			return;
		}
		//查询销售品实例并且保存
		if(!query.offer.setOffer()){  
			return;
		}
		$("#main_title").text(OrderInfo.offerSpec.offerSpecName);		
		SoOrder.initFillPage();
		var data = query.offer.queryMemberHtml(param);//查询主副卡实例页面
		$("#dlg_cust_prod").popup("close");
		$("#navbar").slideUp(500);
		SoOrder.step(0,data); //订单准备
		$.jqmRefresh($("#order_tab_panel_content"));

		//基础移动电话
		_showBasicInfo(offerSpec,areaidflag);
	};

	
	function _showBasicInfo(offerSpec,areaidflag){
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var newSubPhoneNumsize=[];
		var oldSubPhoneNumsize=[];
		if(order.memberChange.newSubPhoneNum!="" && order.memberChange.newSubPhoneNum!=undefined){
			newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
		}
		if(order.memberChange.oldSubPhoneNum!="" && order.memberChange.oldSubPhoneNum!=undefined){
			oldSubPhoneNumsize = order.memberChange.oldSubPhoneNum.split(",");
		}

		$.each(offerSpec.offerRoles,function(index){
			var offerRole = this;
			if(index == 0){				
				$("#firstHtml").html("<label for=\"money\">"+offerRole.offerRoleName+"：</label>");
			}else if(index ==1){
				$("#secondHtml").html("<label for=\"recommend\">"+offerRole.offerRoleName+"：</label>");				
			}
			//主卡
			if (offerRole.memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {

				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						$("#objHtml").html(this.objName);
					}
				});
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.offerRoleId==offerRole.offerRoleId && this.objType==CONST.OBJ_TYPE.PROD){
						$("#accessNumberHtml").html(this.accessNumber);						
						return;
					}
				});
			
			}else{
				//副卡添加
				$.each(offerRole.roleObjs,function(){  //遍历副卡角色下的成员
					if(this.objType == CONST.OBJ_TYPE.PROD){
						this.minQty = 0;
						this.dfQty = 0;
						viceMinQty = 0;
						viceMaxQty = this.maxQty;
						numId = offerRole.offerRoleId+"_"+this.objId;//offerRole.memberRoleCd;
					}
				});
				var existViceCardNum = 0;//已有副卡数量
				//副卡个数
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.offerRoleId == offerRole.offerRoleId  && this.objType==CONST.OBJ_TYPE.PROD){
						existViceCardNum++;
					}
				});
				//副卡添加
				$.each(this.roleObjs,function(){
					var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
					if(this.objType == CONST.OBJ_TYPE.PROD){
						_memberAddList.push(objInstId);
						if(offerRole.minQty == 0){ //加装角色
							this.minQty = 0;
							this.dfQty = 0;
						}
						var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						max = max -existViceCardNum;
						if(max>0){						
							if(newSubPhoneNumsize.length==0 && oldSubPhoneNumsize.length==0){						
								$("#pointsHtml").html("<input type=\"range\" id=\""+objInstId+"\" value=\""+newSubPhoneNumsize.length+"\" min=\""+this.minQty+"\" max=\""+max+"\" readonly=\"readonly\">");
								$("#limitHtml").html("(仅含本地语音）"+this.minQty+"-"+max+"（张）")
							}else if(newSubPhoneNumsize.length>max){
								$.alert("规则限制","newSubPhoneNum的角色成员数量总和不能超过"+max);
								errorflag = false;
								return false;
							}							
						}
						iflag++;
					}
				});		
				
				if(areaidflag){
					//添加老用户
					var oldCardHtml = "";
					$.each(this.roleObjs,function(){
						if(this.objType == CONST.OBJ_TYPE.PROD){
							var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量						
							max = max - existViceCardNum;		
							if(max>0){
								var addNumpic = "";
								if(newSubPhoneNumsize.length==0 && oldSubPhoneNumsize.length==0){							
									oldCardHtml += "<div class=\"ui-block-a\">";
									oldCardHtml += "<div class=\"ui-grid-c\">";									
									oldCardHtml += "<div class=\"ui-block-a\">";
									oldCardHtml += "<label for=\"recommend\">已有移动电话：</label>";
									oldCardHtml += "</div>";
									oldCardHtml += "<div class=\"ui-block-b\">";
									oldCardHtml += "<input type=\"text\" id=\"oldphonenum_1\">";
									oldCardHtml += "</div>";
									oldCardHtml += "<div class=\"ui-block-c\">";
									oldCardHtml += "<button data-mini=\"ture\" onclick=\"order.memberChange.addNum('"+max+"','')\">+</button>";
									oldCardHtml += "</div>";
									oldCardHtml += "<div class=\"ui-block-d\">";
									oldCardHtml += "<button data-mini=\"ture\" onclick=\"order.memberChange.queryofferinfo()\">加装</button>";
									oldCardHtml += "</div>";								
									oldCardHtml += "</div>";
									oldCardHtml += "</div>";					
								}else if(oldSubPhoneNumsize.length>max){
									$.alert("规则限制","oldSubPhoneNum的角色成员数量总和不能超过"+max);
									errorflag = false;
									return false;
								}else{
									for(var k=0;k<oldSubPhoneNumsize.length;k++){
										if(k==0){										
											oldCardHtml += "<div class=\"ui-block-a\">";
											oldCardHtml += "<div class=\"ui-grid-c\">";									
											oldCardHtml += "<div class=\"ui-block-a\">";
											oldCardHtml += "<label for=\"recommend\">已有移动电话：</label>";
											oldCardHtml += "</div>";
											oldCardHtml += "<div class=\"ui-block-b\">";
											oldCardHtml += "<input type=\"text\" id=\"oldphonenum_1\" value='"+oldSubPhoneNumsize[k]+"' readonly=\"readonly\">";
											oldCardHtml += "</div>";
											oldCardHtml += "<div class=\"ui-block-c\">";
											oldCardHtml += "<button data-mini=\"ture\" onclick=\"order.memberChange.addNum('"+max+"','')\">+</button>";
											oldCardHtml += "</div>";
											oldCardHtml += "<div class=\"ui-block-d\">";
											oldCardHtml += "<button data-mini=\"ture\" onclick=\"order.memberChange.queryofferinfo()\">加装</button>";
											oldCardHtml += "</div>";								
											oldCardHtml += "</div>";
											oldCardHtml += "</div>";																	
										}else{
											order.memberChange.addNum(max,oldSubPhoneNumsize[k]);
										}
									}
								}
							}
						}
					});					
					$("#oldnum_1").html(oldCardHtml);
				}
				var $tipTr = $("<tr><td colspan='2' style='text-align:right;line-height:25px;'>" +
						"<font style='color:red;'>拆副卡：</font><br/><font font style='color:red;'>保留>>选择新套餐：</font></td>" +
						"<td colspan='2' style='text-align:left;line-height:25px;'>" +
						"<font style='color:red;'>副卡直接拆除销号</font><br/><font font style='color:red;'>保留副卡，只是更换套餐</font>" +
						"</td></tr>");
				//$tr.after($tipTr);
				var tipFlag = false;				
				//副卡成员
				var otherCardHtml = "";
				$.each(OrderInfo.offer.offerMemberInfos,function(){		
					if(this.offerRoleId == offerRole.offerRoleId  && this.objType==CONST.OBJ_TYPE.PROD){						 
						otherCardHtml += "<div class=\"ui-grid-a\" id=\"li_viceCard_new_"+this.accessNumber+"\" del=\"N\" knew=\"N\" objId=\""+this.objId+"\" objInstId=\""+this.objInstId+"\" " +
								" objType=\""+this.objType+"\" offerMemberId=\""+this.offerMemberId+"\" offerRoleId=\""+this.offerRoleId+"\" accessNumber=\""+this.accessNumber+"\">";
						otherCardHtml += "<div class=\"ui-block-a\">";
						otherCardHtml += "<div class=\"ui-grid-c\">";
						otherCardHtml += "<div class=\"ui-block-a\">";						
						otherCardHtml += "</div>";
						otherCardHtml += "<div class=\"ui-block-b\" id=\"label_viceCard_new_"+this.accessNumber+"\" style=\"height:53px;line-height:53px;padding-left:18px;\">";
						otherCardHtml += this.accessNumber;
						otherCardHtml += "</div>";
						otherCardHtml += "<div class=\"ui-block-c\">";
						otherCardHtml += "<button data-mini=\"ture\" id=\"button_viceCard_new_"+this.accessNumber+"\" accNbr=\""+this.accessNumber+"\" onclick=\"order.memberChange.removeOtherCard('"+this.accessNumber+"');\">拆副卡</button>";
						otherCardHtml += "</div>";						
						if(areaidflag){
							otherCardHtml += "<div class=\"ui-block-d\">";
							otherCardHtml += "<button data-mini=\"ture\" accNbr=\""+this.accessNumber+"\" onclick=\"order.service.offerDialog('viceCard_new_"+this.accessNumber+"')\">保留>>选择新套餐</button>";
							otherCardHtml += "</div>";
						}
						otherCardHtml += "</div>";
						otherCardHtml += "</div>";
						otherCardHtml += "<div class=\"ui-block-b\" style=\"height:53px;line-height:53px;padding-left:18px;\"><span id='viceCard_new_"+this.accessNumber+"'></span></div>";
						otherCardHtml += "</div>";	
						if(!tipFlag){
							$tr.after($tipTr);
							tipFlag = true;
						}
					}					
				});
				$("#other_member").html(otherCardHtml);
				$("#other_member").show();
			}			
		});		
		$.jqmRefresh($("#order_tab_panel_content"));
	};
	
	function _areaidJurisdiction(){
		var provid = OrderInfo.staff.soAreaId.substring(0,3) + "0000";
		var areaparam = {"areaid":provid};
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(contextPath+"/pad/offer/areaidJurisdiction",areaparam);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data=="ON"){
				return true;
			}else{
				return false;
			}
		}else {
			return false;
		}
	};
	
	var _addNum = function(max,addnum){
		if(choosenum>=max){
			return;
		}
		idnum++;
		choosenum++;	
		var olro = "<div class=\"ui-grid-a\" id='oldnum_"+idnum+"'>" + 
				   "<div class=\"ui-block-a\">" + 
				   "<div class=\"ui-grid-c\">" +
				   "<div class=\"ui-block-a\"><label for=\"recommend\">已有移动电话：</label></div>" +
				   "<div class=\"ui-block-b\"><input type=\"text\" id=\"oldphonenum_"+idnum+"\"></div>" + 
				   "<div class=\"ui-block-c\"><button data-mini=\"ture\" onclick=\"order.memberChange.delNum('oldnum_"+idnum+"')\">-</button></div>" +
				   "<div class=\"ui-block-d\"></div>" + 
				   "</div></div></div>";		
		$("#maincard_member_div").append(olro);
		$.jqmRefresh($("#order_tab_panel_content"));
	};
	
	var _delNum = function(id){	
		idnum--;
		choosenum--;
		$("#"+id).remove();		
	};

	var custinfolist = [];
	var _queryofferinfo = function(){
		OrderInfo.oldAddNumList = [];
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldAddNumList = [];
		custinfolist = [];
		
		var oldAddNumList_flag = true;
	//	alert("idnum:"+idnum);
		for(var i=1;i<=idnum;i++){
			var num = $.trim($("#oldphonenum_"+i).val());	
			if(ec.util.isObj(num)){
				if(ec.util.isArray(OrderInfo.oldAddNumList)){
					if(!oldAddNumList_flag){
						return false;
					}
					$.each(OrderInfo.oldAddNumList,function(){
						if(num==this.accNbr){
							oldAddNumList_flag = false;
							$.alert("提示",num+"重复，请重新输入！");
							return false;
						}
					});
					if(oldAddNumList_flag){
						OrderInfo.oldAddNumList.push({"accNbr":num});
					}
				}else{
					OrderInfo.oldAddNumList.push({"accNbr":num});
				}
			}
		}

		if(!oldAddNumList_flag){
			return;
		}
		if(OrderInfo.oldAddNumList.length==0){
			$.alert("提示","请输入手机号码!");
			return;
		}
		var custflag = true;
		for(var i=0;i<OrderInfo.oldAddNumList.length;i++){
			for(var v=0;v<OrderInfo.offer.offerMemberInfos.length;v++){
				if(OrderInfo.oldAddNumList[i].accNbr==OrderInfo.offer.offerMemberInfos[v].accessNumber){
					$.alert("提示",OrderInfo.oldAddNumList[i].accNbr+"号码重复，请重新输入！");
					custflag = false;
					return;
				}
			}
			var param = {
					"acctNbr":OrderInfo.oldAddNumList[i].accNbr,
					"identityCd":"",
					"identityNum":"",
					"partyName":"",
					"diffPlace":"local",
					"areaId" : $("#p_cust_areaId").val(),
					"queryType" :"",
					"queryTypeValue":""
			};
			var response = $.callServiceAsJson(contextPath+"/cust/queryoffercust", param, {"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			}});
			if (response.code == 0) {
				$.unecOverlay();
				if(response.data.custInfos.length==0){
					$.alert("提示","抱歉，没有定位到"+OrderInfo.oldAddNumList[i].accNbr+"客户，请尝试其他客户。");
					custflag = false;
					return;
				}
				var custId = response.data.custInfos[0].custId;
				// 主副卡客户校验取客户查询返回结果中的custId,旧的取order.prodModify.choosedProdInfo.custId
				if(custId!=OrderInfo.cust.custId){
					custflag = false;
					$.alert("提示",OrderInfo.oldAddNumList[i].accNbr+"和主卡的客户不一致！");
					return;
				}
				custinfolist.push({"accNbr":OrderInfo.oldAddNumList[i].accNbr,"custId":custId});
//				QueryofferCustProd(response.data);
			}else{
				custflag = false;
				$.unecOverlay();
				$.alertM(response.data);
				return;
			}
		}
		if(custflag){
			QueryofferCustProd();
		}
	};
	
	var QueryofferCustProd = function(){
		var orderflag = true;
		for(var i=0;i<custinfolist.length;i++){
			var param={};
			param.custId=custinfolist[i].custId;
			param.acctNbr=custinfolist[i].accNbr;
			param.areaId=$("#p_cust_areaId").val();	
			param.pageSize="";
			param.curPage="";
			param.DiffPlaceFlag="local";
			if(param.custId==null||param.custId==""){
				orderflag = false;
				$.alert("提示",custinfolist[i].accNbr+"无法查询已订购产品");
				return;
			}
			var response = $.callServiceAsJson(contextPath+"/cust/offerorderprod", param, {"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			}});
			if (response.code == 0) {
				$.unecOverlay();
				var list = response.data;
				for(var j=0;j<list.length;j++){
					if (list[j].accNbr == custinfolist[i].accNbr){
						var prodInstInfos = list[j];
						prodInstInfos.custId = custinfolist[i].custId;
						if(prodInstInfos.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
							orderflag = false;
							$.alert("提示",custinfolist[i].accNbr+"不是在用产品！");
							return;
						}
						if(prodInstInfos.feeType.feeType!=order.prodModify.choosedProdInfo.feeType){
							orderflag = false;
							$.alert("提示",custinfolist[i].accNbr+"和主卡的付费类型不一致！");
							return;
						}
						if(prodInstInfos.productId=="280000000"){
							$.alert("提示",custinfolist[i].accNbr+"是无线宽带，不能纳入！");
							return false;
						}
						OrderInfo.oldprodInstInfos.push(prodInstInfos);
						break;
					}
				}
			}else{
				orderflag = false;
				$.unecOverlay();
				$.alertM(response.data);
				return;
			}
		}
		if(orderflag){
			queryMainOfferSpec();
		}
	};
	
	var queryMainOfferSpec = function(){
		var specflag = true;
		for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
			var prodOfferId = OrderInfo.oldprodInstInfos[i].mainProdOfferInstInfos[0].prodOfferId;
			if(ec.util.isObj(prodOfferId)){
				var param = {
						offerSpecId : prodOfferId, 
						offerTypeCd : 1,
						partyId : OrderInfo.oldprodInstInfos[i].custId,
						accNbr : OrderInfo.oldprodInstInfos[i].accNbr
					};
				if(!query.offer.queryMainOfferSpec(param)){ //查询主套餐规格构成，并且保存
					specflag = false;
					return;
				}
			}
		}
		if(specflag){
			setOffer();
		}
	};
	
	var setOffer = function() {
		var offerflag = true;
		for(var z=0;z<OrderInfo.oldprodInstInfos.length;z++){
			var param = {
					offerId : OrderInfo.oldprodInstInfos[z].mainProdOfferInstInfos[0].prodOfferInstId,
					offerSpecId : OrderInfo.oldprodInstInfos[z].mainProdOfferInstInfos[0].prodOfferId,
					acctNbr : OrderInfo.oldprodInstInfos[z].accNbr,
					areaId : OrderInfo.oldprodInstInfos[z].areaId,
					distributorId : ""
			};
			var data = query.offer.queryOfferInst(param); //查询销售品实例构成
			if(data&&data.code == CONST.CODE.SUCC_CODE){
				var flag = true;
				if(ec.util.isArray(data.offerMemberInfos)){
					CacheData.sortOffer(data);
					var objTypeflag = 0;
					for ( var i = 0; i < data.offerMemberInfos.length; i++) {
						var member = data.offerMemberInfos[i];
						member.prodClass = OrderInfo.oldprodInstInfos[z].prodClass;
						if(member.objType==""){
							offerflag = false;
							$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
							return;
						}else if(member.objType==CONST.OBJ_TYPE.PROD){
							if(member.accessNumber==""){
								offerflag = false;
								$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
								return;
							}
							objTypeflag++;
						}
						if(member.objInstId==OrderInfo.oldprodInstInfos[z].prodInstId){
							flag = false;
						}
					}
					if(flag){
						offerflag = false;
						$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+OrderInfo.oldprodInstInfos[z].accNbr+"】，无法继续受理，请业务后台核实");
						return;
					}
					if(objTypeflag>1){
						offerflag = false;
						$.alert("提示",OrderInfo.oldprodInstInfos[z].accNbr+"不是单产品，不能纳入！");
						return;
					}
					var offerinfos = {
						"offerMemberInfos":	data.offerMemberInfos,
						"offerId":OrderInfo.oldprodInstInfos[z].mainProdOfferInstInfos[0].prodOfferInstId,
						"offerSpecId":OrderInfo.oldprodInstInfos[z].mainProdOfferInstInfos[0].prodOfferId,
						"offerSpecName":OrderInfo.oldprodInstInfos[z].mainProdOfferInstInfos[0].prodOfferName,
						"accNbr":OrderInfo.oldprodInstInfos[z].accNbr
					};
					OrderInfo.oldoffer.push(offerinfos);
				}else{//销售品成员实例为空
					offerflag = false;
					$.alert("提示",OrderInfo.oldprodInstInfos[z].accNbr+"查询销售品实例构成，没有返回成员实例无法继续受理");
					return;
				}
			}
		}
		if(offerflag){
			setProdUim();
		}
	};

	var setProdUim = function(){
		var produimflag = true;
		OrderInfo.boProd2OldTds = []; //清空旧卡
		for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
			var prod = OrderInfo.oldprodInstInfos[i]; 
			var uim = query.prod.getTerminalInfo(prod);
			if(uim == undefined){  //查询旧卡信息失败返回
				produimflag = false;
				return;
			}
			var prodOfferInstId = OrderInfo.oldprodInstInfos[i].mainProdOfferInstInfos[0].prodOfferInstId;
			var prodInstId = OrderInfo.oldprodInstInfos[i].prodInstId;
			setOldUim(prodOfferInstId,prodInstId,uim); //保存旧卡信息
			if(uim.is4GCard=="Y"){
				prod.prodClass = CONST.PROD_CLASS.FOUR;
			}else{
				prod.prodClass = CONST.PROD_CLASS.THREE;
			}
		}
		if(produimflag){
			var instflag = true;
			if(OrderInfo.order.soNbr==null || OrderInfo.order.soNbr==undefined || OrderInfo.order.soNbr==""){
				OrderInfo.order.soNbr = UUID.getDataId();			
			}
			for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
				var prod = OrderInfo.oldprodInstInfos[i];
				if(prod==undefined || prod.prodInstId ==undefined){
					instflag = false;
					$.alert("提示",OrderInfo.oldprodInstInfos[i].accNbr+"未获取到老用户产品相关信息，无法办理二次业务！");
					return;
				}
				var param = {
					areaId : prod.areaId,
					acctNbr : prod.accNbr,
					custId : prod.custId,
					soNbr : OrderInfo.order.soNbr,
					instId : prod.prodInstId,
					type : "2"
				};
				if(!loadInst(param,prod)){  //加载实例到缓存
					instflag = false;
					return;
				};
			}
			if(instflag){
				ruleCheck();
			}
//			loadInst();
		}
	};
	
	//保存旧卡
	var setOldUim = function(offerId ,prodId,uim){
		var oldUim={
			couponUsageTypeCd : "3", //物品使用类型
			inOutTypeId : "2",  //出入库类型
			inOutReasonId : 0, //出入库原因
			saleId : 1, //销售类型
			couponId :uim.couponId, //物品ID
			couponinfoStatusCd : "A", //物品处理状态
			chargeItemCd : CONST.ACCT_ITEM_TYPE.UIM_CHARGE_ITEM_CD, //物品费用项类型
			couponNum : 1, //物品数量
			//storeId : oldUimInfo.storeId, //仓库ID
			storeId : 1, //仓库ID
			storeName : "11", //仓库名称
			agentId : 1, //供应商ID
			apCharge : 0, //物品价格
			couponInstanceNumber : uim.couponInsNumber, //物品实例编码
			terminalCode : uim.couponInsNumber,//前台内部使用的UIM卡号
			ruleId : "", //物品规则ID
			partyId : OrderInfo.cust.custId, //客户ID
			prodId : prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "DEL", //动作
			relaSeq : "", //关联序列
			id:0,
			isOld : "T",  //旧卡
			is4GCard : uim.is4GCard
		};
		OrderInfo.boProd2OldTds.push(oldUim);
	};
	
	/**
	 * 加载实例
	 */
	var loadInst = function(param,prod){
			for(var j=0;j<OrderInfo.oldoffer.length;j++){
				if(OrderInfo.oldoffer[j].accNbr==prod.accNbr){
					if(ec.util.isArray(OrderInfo.oldoffer[j].offerMemberInfos)){ //遍历主销售品构成
						var flag = true;
						$.each(OrderInfo.oldoffer[j].offerMemberInfos,function(){
							if(this.objType == CONST.OBJ_TYPE.PROD && this.accessNumber==prod.accNbr){ //选中号码在销售品实例构成中，为了防止销售品实例缓存
								instflag = false;
								flag = false;
								return;
							}
						});
						if(flag){ //不在销售品实例缓存
							return query.offer.invokeLoadInst(param);
						}else{
							var vFlag = true;
							$.each(OrderInfo.oldoffer[j].offerMemberInfos,function(){
								if(this.objType == CONST.OBJ_TYPE.PROD){
									param.acctNbr = this.accessNumber;
									param.instId = this.objInstId;
									if (!query.offer.invokeLoadInst(param)) {
										vFlag = false;
										return false;
									}
								}
							});
							return vFlag;
						}
					}else{
						return query.offer.invokeLoadInst(param);
					}
				}
			}
	};
	
	//生成订单流水号，规则校验
	var ruleCheck = function(){
		rule.rule.init();
		var ruleflag = true;
		for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
			var prod = OrderInfo.oldprodInstInfos[i];
			var oldinfo = {
					boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
					instId : prod.mainProdOfferInstInfos[0].prodOfferInstId,
//					specId : OrderInfo.oldprodInstInfos.mainProdOfferInstInfos[0].prodOfferId,
					prodId : prod.prodInstId
				};
			if(prod.mainProdOfferInstInfos[0].prodOfferId!=""){
				oldinfo.specId = prod.mainProdOfferInstInfos[0].prodOfferId;
			}
			var boInfos = []; 
			boInfos.push(oldinfo);
			var inParam ={
					areaId : OrderInfo.staff.soAreaId,
					staffId : OrderInfo.staff.staffId,
					channelId : OrderInfo.staff.channelId,
					custId : prod.custId,
					soNbr : OrderInfo.order.soNbr,
					boInfos : boInfos,
					prodInfo : prod	
				};
				$.ecOverlay("<strong>客户级规则校验中，请稍等...</strong>");
				var response = $.callServiceAsJson(contextPath+"/rule/prepare",inParam); //调用规则校验
				$.unecOverlay();
				if(response!=undefined && response.code==0){
					var checkData = response.data;
					if(checkData == null){
						ruleflag = false;
						$.alert("提示","规则校验异常，请联系管理人员！");
						return;
					}
					if(checkData.ruleType == "portal"){  //门户层校验
						if (checkData.resultCode == "0"){  // 0为门户层校验为通过
							ruleflag = false;
							$.alert("提示",checkData.resultMsg);
							return;
						}
					}		
					var checkRuleInfo = checkData.result.resultInfo;  //业务规则校验
					if(checkRuleInfo!=undefined && checkRuleInfo.length > 0){
						_showRuleCreate();
						var ruleStr = "";
						$("#ruleTable").html("");
						$.each(checkRuleInfo, function(i, ruleInfo) {
							ruleStr += "<tr>";
							ruleStr += "<th>"+ruleInfo.resultCode+"</th>";
							ruleStr += "<th>"+ruleInfo.ruleDesc+"</th>";
							ruleStr += "<th>"+rule.rule.getRuleLevelName(ruleInfo.ruleLevel)+"</th>";
							ruleStr += "<th>"+rule.rule.getRuleImgClass(ruleInfo.ruleLevel)+"</th>";
							ruleStr += "</tr>";
						});	
						ruleflag = false;
						setTimeout(function(){
							$("#ruleTable").append(ruleStr);
							$.jqmRefresh($("#order_tab_panel_content"));
						},100);
						return;
					}
				}else{
					ruleflag = false;
					$.alertM(response.data);
					return;
				}
		}
		if(ruleflag){
			addOldSubmit();
		}
	};
	
	//创键客户 ok
	var _showRuleCreate = function() {	
		$.callServiceAsHtmlGet(contextPath+"/pad/order/rulecreate",{},{
			"done" : function(response){
				if (!response || !response.data) {
					return;
				}
				//统一弹出框
				var popup = $.popup("#div_rule_create",response.data,{
					cache:true,
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){}
				});				
			}});
	};
	
	var addOldSubmit = function(){
		//老用户纳入
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,6,
				CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
		var param = {
			memberChange : "Y",
			type : 1,
			boActionTypeName : "主副卡成员变更",
			viceCardNum : parseInt(OrderInfo.oldAddNumList.length),
			offerNum : 1,
			actionFlag:6,
			offerSpec:OrderInfo.oldofferSpec,
			prodInstInfos:OrderInfo.oldprodInstInfos,
			offer:OrderInfo.oldoffer,
			addflag:"ADD"
		};
//		order.service.setOfferSpec(); //把选择的主副卡数量保存
		var prod = order.prodModify.choosedProdInfo; 
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
			instId : prod.prodOfferInstId,
			specId : prod.prodOfferId,
			prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
		}];
		if(rule.rule.ruleCheck(boInfos)){  //业务规则校验
			order.main.buildMainView(param);	
		}
		order.memberChange.closeDialog();
	};
	
	var _submit = function() {
		OrderInfo.oldAddNumList = [];
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldprodAcctInfos = [];
		var num=0;		
		var lis = $("#maincard_member_tbody .othermember .ui-grid-a");			
		$.each(lis,function(){
			var accessnumber = $(this).attr("accessnumber");				
			if(order.memberChange.delmembers.flag){
				$.each(order.memberChange.delmembers.accessNumbers,function(){					
					if(this.nbr == accessnumber){
						$("#label_viceCard_new_"+accessnumber).attr({style:"height:53px;line-height:53px;padding-left:18px;text-decoration:line-through"});
						$("#li_viceCard_new_"+accessnumber).attr("del","Y").attr("knew","N");
						document.getElementById("button_viceCard_new_" + accessNumber).innerHTML = "不 拆";
					}
				});
			}			
			if(order.memberChange.changemembers.flag){
				$.each(order.memberChange.changemembers.accessNumbers,function(){
					if(this.nbr == accessnumber){
						order.service.choosedOffer('tcnum'+1,this.specId,'','viceCard_new_'+this.nbr,this.name);
					}
				});
			}			
		});	
		
		var ifRemoveProd = false;
		$.each(lis,function(){		
			if($(this).attr("del") == "Y" || $(this).attr("knew") == "Y"){				
				ifRemoveProd = true;
				return false;
			}
		});	
		
		$.each(_memberAddList,function(){			
			num=num+Number($("#"+this).val());		
		});
		
		//var num = $("#memeberChange ul:last h5 i input").val();
		/*if ((ifRemoveProd) && num> 0) {
			$.alert("提示","副卡拆机和副卡新装不能同时做，请分开两次操作");
			return;
		}*/
		if (!(ifRemoveProd) && num <=0) {
			$.alert("提示","没有对副卡进行操作。");
			return;
		}
		var prod = order.prodModify.choosedProdInfo; 
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
			instId : prod.prodOfferInstId,
			specId : prod.prodOfferId,
			prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
		}];
		
		var param = {};
		if(num>0){//新装副卡
			//查询主卡的产品属性并保存
			var param = {
				prodId : prod.prodInstId, // 产品实例id
				acctNbr : prod.accNbr, // 接入号
				prodSpecId : prod.productId, // 产品规格id
				areaId : prod.areaId // 地区id
			};
			var resData = query.offer.queryProdInstParam(param);
			if(resData && resData.prodSpecParams){
				OrderInfo.prodInstAttrs = resData.prodSpecParams;
			}
			
			OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,6,
					CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
			param = {
				memberChange : "Y",
				type : 1,
				boActionTypeName : "主副卡成员变更",
				viceCardNum : parseInt(num),
				feeTypeMain:prod.feeType,
				offerNum : 1,
				custId : OrderInfo.cust.custId,
				actionFlag:6,
				accessNumber:_offerProd.accessNumber,
				offerSpec: OrderInfo.offerSpec
			};
			order.service.setOfferSpec(); //把选择的主副卡数量保存
			if(rule.rule.ruleCheck(boInfos)){  //业务规则校验
				order.main.buildMainView(param);	
			}
			order.memberChange.closeDialog();
		}
	   if(ifRemoveProd){//保留副卡
		   var viceparam = [];
			$.each(lis,function(i, li){//所有副卡信息
				if ($(this).attr("knew") == "Y"||$(this).attr("del") == "Y") {
					viceparam.push({
						objId : $(this).attr("objId"),
						objInstId : $(this).attr("objInstId"),
						objType : $(this).attr("objType"),
						offerRoleId : $(this).attr("addRoleId"),
						offerSpecId :$(this).attr("addSpecId"),
						offerMemberId:$(this).attr("offerMemberId"),
						del : $(this).attr("del"),
						accessNumber : $(this).attr("accessNumber"),
						offerSpecName : $(this).attr("addSpecName"),
						roleName : "基础移动电话",
						knew : $(this).attr("knew")
					});
				}
			});
			var ooRoles = [];
			$.each(lis,function(i, li){
				if ($(this).attr("del") == "Y"||$(this).attr("knew") == "Y") {
					ooRoles.push({
						objId : $(this).attr("objId"),
						objInstId : $(this).attr("objInstId"),
						objType : $(this).attr("objType"),
						offerMemberId : $(this).attr("offerMemberId"),
						offerRoleId : $(this).attr("offerRoleId"),
						state:'DEL'
					});
				}
			});
			//params = {viceParam:viceparam,ooRoles:ooRoles};
		   OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,21,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
//		   var boInfos = [{
//				boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
//				instId : _offerProd.offerId,
//				specId : _offerProd.offerSpecId,
//				prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
//			}];
/*		   if(rule.rule.ruleCheck(boInfos)){  //业务规则校验
		   _removeAndAdd();
		   }*/
		   var submitFlag = "removeProd" ;
		   var boActionType=CONST.BO_ACTION_TYPE.ADDOREXIT_COMP;
			var callParam = {
				boActionTypeCd : boActionType,
				boActionTypeName : CONST.getBoActionTypeName(boActionType),
				//accessNumber : _choosedProdInfo.accNbr,
				submitFlag:submitFlag,
				viceParam:viceparam,
				ooRoles:ooRoles
			};
/*			OrderInfo.order.templateType=templateType;
			var v_actionFlag = 0 ;
			if(boActionType==CONST.BO_ACTION_TYPE.BUY_BACK){
				v_actionFlag =20;//OrderInfo.actionFlag
			}*/
			var param={
				areaId : OrderInfo.staff.areaId,
				staffId : OrderInfo.staff.staffId,
				channelId : OrderInfo.staff.channelId,
				custId : OrderInfo.cust.custId,
				boInfos : []
			};
			param.boInfos=boInfos;
			if(_getSimulateData()){			
				if(rule.rule.ruleCheck(boInfos)){  //业务规则校验
				//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
				if(!prodUimSetProdUim()){ 
					return ;
				}
				var prodInfo = order.prodModify.choosedProdInfo;
				var paramTmp = {
						boActionTypeCd : boActionType,
						boActionTypeName : CONST.getBoActionTypeName(boActionType),
						actionFlag :"21",
						prodId : prodInfo.prodInstId,
						offerMembers : OrderInfo.offer.offerMemberInfos,
						oldOfferSpecName : prodInfo.prodOfferName,
						prodClass : prodInfo.prodClass,
						appDesc : CONST.getAppDesc(),
						submitFlag:submitFlag,
						viceParam:viceparam,
						ooRoles:ooRoles
					};
					order.main.buildMainView(paramTmp);	
				}
			}else{
				//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,boActionType,v_actionFlag,CONST.getBoActionTypeName(boActionType),templateType);
				var flag = rule.rule.prepare(param,'order.prodModify.commonPrepare',callParam);
				if(flag) return;
			}
			order.memberChange.closeDialog();
	   }
	};
	

	var _closeDialog = function() {
		if(order.prodModify.dialogForm!=undefined&&order.prodModify.dialog!=undefined){
			order.prodModify.dialogForm.close(order.prodModify.dialog);
		}
	};
	
	//主卡不变副卡新装套餐
	var _removeAndAdd=function(date){
		var viceparam = [];
		var ooRoles =[];
		var params =[];
		viceparam=date.viceParam;
		ooRoles=date.ooRoles;
		params = {viceParam:viceparam,ooRoles:ooRoles,remark:$("#order_remark").val()};
		SoOrder.submitOrder(params);
		
	};
	
	//拆副卡
	var _removeOtherCard = function(accessNumber) {
		var obj = $("#li_viceCard_new_" + accessNumber);		
		if(obj.attr("del") == "N"){	
			$("#label_viceCard_new_"+accessNumber).attr({style:"height:53px;line-height:53px;padding-left:18px;text-decoration:line-through"});
			obj.attr("del","Y").attr("knew","N");
			document.getElementById("button_viceCard_new_" + accessNumber).innerHTML = "不 拆";
			$("#button_"+accessNumber).attr("accNbr",accessNumber);
		}else{
			$("#label_viceCard_new_"+accessNumber).attr({style:"height:53px;line-height:53px;padding-left:18px;text-decoration:''"});
			obj.attr("del","N").attr("knew","N");	
			document.getElementById("button_viceCard_new_" + accessNumber).innerHTML = "拆副卡";			
			$("#button_"+accessNumber).attr("accNbr","");
		}		
	};
	
	var prodUimSetProdUim=function(){
		return prod.uim.setProdUim();
	};
	
	/**
	 * 从缓存里面获取标识
	 */
	var _getSimulateData=function(){
		var param={
			code:"old_memberchange"
		};
		var url=contextPath+"/order/getSimulateData";
		$.ecOverlay("<strong>正在查询公共数据查询的服务中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,param);	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data!=undefined){
				if("Y"==response.data){
					return false;
				}
			}
		}
		return true;
	};
	
	var _lastStep = function() {
		$.confirm("信息","确定要取消吗？",{
			yes:function(){
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				
				
				/*$("#orderedprod").hide();
				$("#order_prepare").hide();
				$("#order_fill_content").hide();
				$("#ul_busi_area").hide();
				$("#order_fill_content").html(data).show();
				k++;
				$.jqmRefresh($("#order_fill_content"));*/
				
				
				/*$("#order_fill").empty();
				$("#order_prepare").show();
				$("#order_fill_content").empty();
				order.prepare.showOrderTitle();*/
				$("#order_tab_panel_content").hide();
				order.prepare.step(1);
			},no:function(){
				
			}},"question");
	};
	
	//省里校验单
	var _checkOrder = function(prodInfo,oldoffer){
		OrderInfo.getOrderData(); //获取订单提交节点
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		OrderInfo.orderData.orderList.orderListInfo.areaId = OrderInfo.cust.areaId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		_createDelOffer(busiOrders,oldoffer,prodInfo.prodInstId); //退订主销售品
		_createMainOffer(busiOrders,oldoffer,prodInfo); //订购主销售品	
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
	
	//创建退订主销售品节点
	var _createDelOffer = function(busiOrders,oldoffer,prodInstId){	
		oldoffer.offerTypeCd = 1;
		oldoffer.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		OrderInfo.getOfferBusiOrder(busiOrders,oldoffer,prodInstId);
	};
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders,offer,prod) {
		var offerSpec = OrderInfo.offerSpec;
		var offerRole = getOfferRole();
		if(offerRole==undefined){
			alert("错误提示","无法加装到该套餐");
			return false;
		}
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
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
		if(ec.util.isArray(offer.offerMemberInfos)){ //遍历主销售品构成
			busiOrder.data.ooRoles = [];
			$.each(offer.offerMemberInfos,function(){
				var ooRoles = {
					objId : this.objId, //业务规格ID
					objInstId : this.objInstId, //业务对象实例ID,新装默认-1
					objType : this.objType, // 业务对象类型
					offerRoleId : offerRole.offerRoleId, //销售品角色ID
					state : "ADD" //动作
				};
				if(this.objType != CONST.OBJ_TYPE.PROD){ //不是接入产品
					ooRoles.prodId = prodId;//业务对象实例ID
				}
				busiOrder.data.ooRoles.push(ooRoles);
			});
		}

		//销售参数节点
		if(ec.util.isArray(offerSpec.offerSpecParams)){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.value,
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
		var $tr = $("li[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid") 
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
	
	//根据省内返回的数据校验
	var _checkOfferProd = function(oldoffer){
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
				$.each(oldoffer.offerMemberInfos,function(){ //遍历旧套餐构成
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
									AttachOffer.openServSpec(prodId,this.productId);
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
	
	return {
		showOfferCfgDialog : _showOfferCfgDialog,			
		newSubPhoneNum: _newSubPhoneNum,
		oldSubPhoneNum: _oldSubPhoneNum,
		addNum:_addNum,
		delNum:_delNum,	
		queryofferinfo:_queryofferinfo,
		closeDialog:_closeDialog,
		submit : _submit,
		showRuleCreate:_showRuleCreate,
		newmembers:_newmembers,
		oldmembers:_oldmembers,
		delmembers:_delmembers,
		changemembers:_changemembers,
		rejson:_rejson,
		removeOtherCard:_removeOtherCard,
		getSimulateData : _getSimulateData,	
		removeAndAdd : _removeAndAdd,
		checkOrder:_checkOrder,
		checkOfferProd:_checkOfferProd
	};
}();

$(function(){
	$("#memeberChangeclose").click(function(){
		order.memberChange.closeDialog();
	});	
	$("#memeberChange .btna_o:last").click(function(){
		order.memberChange.closeDialog();
	});
});
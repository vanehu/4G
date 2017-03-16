CommonUtils.regNamespace("order", "memberChange");
order.memberChange = function(){
	var maxPhone=0;
	var _subPage="";
	var _offerProd={};
	var _memberAddList=[];
	var _ischooseOffer=false;
	var choosenum = 1;//纳入老用户数量
	var idnum = 1;
	var _reloadFlag="";//判断是否二次加载 
	var _newSubPhoneNum; //前台传入的参数
	var _oldSubPhoneNum; //前台传入的参数
	var _mktResInstCode;  //传入的uim卡
	var _newMemberFlag = false;
	var _oldMemberFlag = false;
	var _changeMemberFlag = false;
	//纳入新成员
	var _newmembers = {};
	//纳入老用户
	var _oldmembers = {
			objInstId:[]
	};
	var addMax=0;
	//拆副卡
	var _delmembers = {
			accessNumbers:[]
	};
	//副卡变更
	var _changemembers = {
			accessNumbers:[]
	};
	var _rejson = {};  // 暂存单 
	
	var offerDialog=function(subPage){
		_subPage = subPage;
		var param={};
		var url=contextPath+"/app/order/prodoffer/prepare?subPage="+subPage;
		$.callServiceAsHtml(url,param,{
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
				$("#member_prepare").hide();
				var content$=$("#offerspecContent");
				content$.html(response.data).show();
				$("#tentrance").show();
				$("#pentrance").hide();
				$("#nentrance").hide();
				$("#pakeage").attr("class","tab-pane fade in active");
				$("#tentrance").css("width","100%");

			}
		});	
	};
	
	var _init=function(){
		
		if(order.prodModify.choosedProdInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","当前产品状态不是【在用】,不允许受理该业务！");
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
		//order.prepare.hideStep();
		if(order.memberChange.reloadFlag=="N"){
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#member_prepare").hide();
			$("#content").hide();
		}
		else{
			$("#orderedprod").show();
			$("#order_prepare").show();
		}
		
		$("#order_confirm").hide();

		//order.prepare.createorderlonger();
		//4G系统判断，如果是3g套餐不能做该业务
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G=="Y"){
			$.alert("提示","3G套餐不允许做主副卡成员变更业务！","information");
			return;
		}
		//根据省份来限制纳入老用户入口,开关在portal.properties
		var areaidflag = _areaidJurisdiction();
		//暂存单二次加载
		
		
		var newSubPhoneNumsize="";
		var oldSubPhoneNumsize="";

		if(order.memberChange.newSubPhoneNum!=null && order.memberChange.newSubPhoneNum!="" && order.memberChange.newSubPhoneNum!=undefined){
			newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
		}
		if(order.memberChange.oldSubPhoneNum!=null && order.memberChange.oldSubPhoneNum!="" && order.memberChange.oldSubPhoneNum!=undefined){
			oldSubPhoneNumsize = order.memberChange.oldSubPhoneNum.split(",");
		}

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
		if(OrderInfo.provinceInfo.mergeFlag=="0"){
			if(!query.offer.setOffer()){  
				return;
			}
		}
		//改造中...
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
        var errorflag = true;
		$.each(offerSpec.offerRoles,function(){
		    var offerRole = this;
			var memberp = offerRole.offerRoleName;

			//销售品规格
			//主卡
			if (offerRole.memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD) {
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						memberp += "    " + this.objName;

					}
				});
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.offerRoleId==offerRole.offerRoleId && this.objType==CONST.OBJ_TYPE.PROD){

						memberp += ":" + this.accessNumber;
						return;
					}
				});
				$("#memberp").text(memberp);
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
						addMax=max;
						if(max>0){
                            if(newSubPhoneNumsize.length+oldSubPhoneNumsize.length>max){
                            	$.alert("规则限制","newSubPhoneNum和oldSubPhoneNumsize的角色成员数量总和不能超过"+max);
								errorflag = false;
								return false;
                            }
                            else{
                            	maxPhone=max;
                            	if(newSubPhoneNumsize.length==0){
                            		OrderInfo.objInstId=objInstId;
    								var $div = $("<div class='form-group'></div>");
    								var $div2 = $("<div class='input-group col-xs-6'>");  
    								var $label = $("<label>移动电话（仅含本地语音）"+this.objName + this.minQty+"-"+max+"（张）</label>");
    								var $span = $("<span class='input-group-btn'>");
    								$span.append("<button id='newSubNumBtn' class='btn btn-default' type='button' onClick='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'> - </button>");
    								$div2.append($span).appendTo($div);
    								var $text = $("<input id='"+objInstId+"' type='text' value='"+this.dfQty+"' class='form-control' readonly='readonly'>");
    								$div2.append($text);
    								$span.append("<button id='newAddNumBtn' class='btn btn-default' type='button' onClick='javascript:order.service.addNum(\""+objInstId+"\","+max+");'> + </button>");
    								$div2.append($span).appendTo($div);
    								$label.appendTo($div);
    								$div2.appendTo($div);
    								$("#form").append($div);
    							}
                            	else{
                            		
                            		OrderInfo.objInstId=objInstId;
                            		var $div = $("<div class='form-group'></div>");
        							var $div2 = $("<div class='input-group col-xs-6'>");  
        							var $label = $("<label>移动电话（仅含本地语音）"+this.objName + this.minQty+"-"+max+"（张）</label>");
        							var $span = $("<span class='input-group-btn'>");
        						//	$span.append("<button id='newSubNumBtn' class='btn btn-default' type='button' onClick='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'> - </button>");
        							$div2.append($span).appendTo($div);
        							var $text = $("<input id='"+objInstId+"' type='text' value='"+newSubPhoneNumsize.length+"' class='form-control' readonly='readonly'>");
        							$div2.append($text);
        						//	$span.append("<button id='newAddNumBtn' class='btn btn-default' type='button' onClick='javascript:order.service.addNum(\""+objInstId+"\","+max+");'> + </button>");
        							$div2.append($span).appendTo($div);
        							$label.appendTo($div);
        							$div2.appendTo($div);
        							$("#form").append($div);
                            		
                            	}
                            	
                            }
						}
						
						iflag++;
					}
				});
				if(areaidflag){
					//添加老用户
					$.each(this.roleObjs,function(){
						if(this.objType == CONST.OBJ_TYPE.PROD){
							var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
							max = max -existViceCardNum;
							if(max>0){
								var addNumpic = "";
								
								if(oldSubPhoneNumsize.length==0 ){
									var $div = $("<div class='form-group' id='oldnum_1'></div>");
									var $div2 = $("<div class='input-group'>");  
									var $label = $("<label>已有移动电话"+this.objName + this.minQty+"-"+max+"（张）</label>");
									var $text = $("<input name='oldphonenum' id='oldphonenum_1' class='form-control'>");
									$div2.append($text);
									
									var $span = $("<span class='input-group-btn'>");
									$span.append("<button class='btn btn-default' type='button' onClick='javascript:order.memberChange.addNum("+max+");'> + </button>");
									//$span.append("<button class='btn btn-default' type='button' onclick='order.memberChange.queryofferinfo()'> 加装    </button>");
									$span.append("<button class='btn btn-default' type='button' onClick='javascript:order.memberChange.delNum(\"oldnum_"+idnum+"\");'> - </button>");
									$div2.append($span).appendTo($div);
									$label.appendTo($div);
									$div2.appendTo($div);
									$("#form").append($div);
								}
								else if(oldSubPhoneNumsize.length>max){
									$.alert("规则限制","oldSubPhoneNum的角色成员数量总和不能超过"+max);
									errorflag = false;
									return false;
								}
								else{
								
									for(var k=0;k<oldSubPhoneNumsize.length;k++){
										if(k==0){
											var $div = $("<div class='form-group' id='oldnum_1'></div>");
											var $div2 = $("<div class='input-group'>");  
											var $label = $("<label>已有移动电话"+this.objName + this.minQty+"-"+max+"（张）</label>");
											var $text = $("<input name='oldphonenum'  id='oldphonenum_1' value='"+oldSubPhoneNumsize[k]+"'  readonly='readonly'   class='form-control'>");
											$div2.append($text);
											var $span = $("<span class='input-group-btn'>");
										//	$span.append("<button class='btn btn-default' type='button' onClick='javascript:order.memberChange.addNum("+max+");'> + </button>");
											//$span.append("<button class='btn btn-default' type='button' onclick='order.memberChange.queryofferinfo()'> 加装    </button>");
										//	$span.append("<button class='btn btn-default' type='button' onClick='javascript:order.memberChange.delNum(\"oldnum_"+idnum+"\");'> - </button>");
											$div2.append($span).appendTo($div);
											$label.appendTo($div);
											$div2.appendTo($div);
											$("#form").append($div);
										}else{
											addNumSub(max,oldSubPhoneNumsize[k]);
										}
									  }
								
								}	
							}
						}
					});
					//var addMvflag = _areaidJurisdiction(2);
					var addMvflag = false;
					if(addMvflag){
						var olmv = "<tr style='background:#f8f8f8;' id='mvCardNum'>" +
						"<td align='left' class='borderLTB' style='font-size:14px; padding:0px 0px 0px 12px'><span style='color:#518652; font-size:14px;'>已有主副卡</span></td>" +
						"<td align='left' colspan='3'><input style='margin-top:10px' class='numberTextBox' id='mvCardPhone' type='text'>" +
						"<a href='javascript:void(0)' class='purchase' onclick='order.memberChange.queryMVCard()'>查询</a>" +
						"<a href='javascript:void(0)' class='purchase' onclick='order.memberChange.addMvMember()'>加装主副卡</a></td></tr>";	
						$tr.after(olmv);
					}
				}
				var $tipTr = $("<tr><td colspan='2' style='text-align:right;line-height:25px;'>" +
						"<font style='color:red;'>拆副卡：</font><br/><font font style='color:red;'>保留>>选择新套餐：</font></td>" +
						"<td colspan='2' style='text-align:left;line-height:25px;'>" +
						"<font style='color:red;'>副卡直接拆除销号</font><br/><font font style='color:red;'>保留副卡，只是更换套餐</font>" +
						"</td></tr>");
				//$tr.after($tipTr);
				var tipFlag = false;

				//副卡成员
				//$Othertr.after($tr);
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					var $div = $("<div class='form-group'></div>");
					var $div2 = $("<div class='input-group'>"); 
					if(this.offerRoleId == offerRole.offerRoleId  && this.objType==CONST.OBJ_TYPE.PROD){
						
						var $text = $("<input del='N' knew='N' accessNumber='"+this.accessNumber+"' offerRoleId=" + this.offerRoleId + " offerMemberId=" + this.offerMemberId +" objType=" + this.objType + " objId=" + this.objId+ " objInstId=" + this.objInstId+ " id=\"li_viceCard_new_"+this.accessNumber+"\" value="+ this.accessNumber +" class='form-control' disabled >");
						var $text2 = $("<span id='viceCard_new_"+this.accessNumber+"' class='form-control' style='display:none'>");
						$div2.append($text);
						$div2.append($text2);
						
						var $span = $("<span class='input-group-btn'>");
						var btn = $("<button class='btn btn-default' accNbr='"+this.accessNumber+"' type='button'>拆副卡</button>");
						btn.click(function(){
							if ($("input[id^='li_viceCard_new_"+$(this).attr("accNbr")+"']").attr("del") == "N") {
								$("input[id^='li_viceCard_new_"+$(this).attr("accNbr")+"']").css("text-decoration","line-through").attr("del","Y").attr("knew","N");
								$("span[id^='viceCard_new_"+$(this).attr("accNbr")+"']").css("text-decoration","line-through").attr("del","Y").attr("knew","N");
								$(this).text("不 拆");
							} else {
								$("input[id^='li_viceCard_new_"+$(this).attr("accNbr")+"']").css("text-decoration","").attr("del","N").attr("knew","N");
								$("span[id^='viceCard_new_"+$(this).attr("accNbr")+"']").css("text-decoration","").attr("del","N").attr("knew","N");
								//$(this).css("text-decoration","").attr("del","N").attr("knew","N");
								$(this).text("拆副卡");
								$("#"+'viceCard_new_'+$(this).find("a").attr("accNbr")).html("");
							}
						});
						$span.append(btn);
						if(areaidflag){
							var btn2 = $("<button class='btn btn-default' accNbr='"+this.accessNumber+"' type='button'>保留>>选择新套餐 </button>");
							btn2.click(function(){
								order.service.offerDialog('viceCard_new_'+$(this).attr("accNbr"));
	//							$($("#plan_no")).parent().css("text-decoration","line-through").attr("del","Y");
							});	
						    $span.append(btn2);
						}
			
						$div2.append($span).appendTo($div);
						existViceCardNum++;
						if(!tipFlag){
							$("#form").after($tipTr);
							tipFlag = true;
						}

					}
					$div2.appendTo($div);
					$("#form").append($div);
				});
			}
		});
		
		if(order.memberChange.reloadFlag=="N"){
			var custOrderAttrs = order.memberChange.rejson.orderList.orderListInfo.custOrderAttrs;
			var busiTypeFlag = true;
			/*
			$.each(custOrderAttrs,function(){
				if(this.itemSpecId=="30010024"){
					if(this.value!="3"){
						busiTypeFlag = false;
						return false;
					}
				}
			});
			if(!busiTypeFlag){
				$.alert("提示","不是主副卡成员变更受理流水号，请重试！");
				return;
			}
			*/
			var custOrderList = order.memberChange.rejson.orderList.custOrderList[0].busiOrder;
			var newsplitflag = 1;
			var oldsplitflag = 1;
			var oldmember=1;
			order.memberChange.newSubPhoneNum="";
			order.memberChange.oldSubPhoneNum="";
			$.each(custOrderList,function(){
				//拆副卡
				if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="3"){
					OrderInfo.delViceCard="true";
					order.memberChange.delmembers.flag = true;
					order.memberChange.delmembers.accessNumbers.push({"nbr":this.busiObj.accessNumber});
					$("input[id^='li_viceCard_new_"+this.busiObj.accessNumber+"']").css("text-decoration","line-through").attr("del","Y").attr("knew","N");
					$("span[id^='viceCard_new_"+this.busiObj.accessNumber+"']").css("text-decoration","line-through").attr("del","Y").attr("knew","N");
					//$(this).text("不 拆");
				}else if(this.boActionType.actionClassCd=="1300" && this.boActionType.boActionTypeCd=="1"){
					//纳入新成员
					order.memberChange.newmembers.flag = true;
					OrderInfo.newClothes="true";
					if(newsplitflag==1){
						order.memberChange.newSubPhoneNum += this.busiObj.accessNumber;
						newsplitflag++;
					}else{
						order.memberChange.newSubPhoneNum += ","+this.busiObj.accessNumber;
					}
					var count=$("#"+OrderInfo.objInstId).val();
				
					$("#"+OrderInfo.objInstId).val((parseInt(count)+1));
				}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S2"){	
					//纳入老成员
					if(this.busiObj.offerTypeCd=="1"){
						
						order.memberChange.oldmembers.flag = true;
						if(oldsplitflag==1){
							order.memberChange.oldSubPhoneNum += this.busiObj.accessNumber;
							oldsplitflag++;
						}else{
							order.memberChange.oldSubPhoneNum += ","+this.busiObj.accessNumber;
						}
						if(oldmember==1){
							$("#oldphonenum_"+oldmember).val(this.busiObj.accessNumber);
						}
						else{
							memberChange.addNum(10);
							$("#oldphonenum_"+oldmember).val(this.busiObj.accessNumber);
						}
						
					}
					var objInstId = this.data.ooRoles[0].objInstId;
					var instId = this.busiObj.instId;
					order.memberChange.oldmembers.objInstId.push({"instId":instId,"objInstId":objInstId});
				}else if(this.boActionType.actionClassCd=="1200" && this.boActionType.boActionTypeCd=="S1" && this.busiObj.offerTypeCd=="1"){
					//保留选择新套
					order.memberChange.changemembers.flag = true;
					order.memberChange.changemembers.accessNumbers.push({"nbr":this.busiObj.accessNumber,"specId":this.busiObj.objId,"name":this.busiObj.objName});
					var specId=this.busiObj.objId;
					var nbr=this.busiObj.accessNumber;
					var name=this.busiObj.objName;
					order.service.choosedOffer('tcnum'+1,specId,'','viceCard_new_'+nbr,name);
				}
			});
	      	order.memberChange.submit();
		}
};
	
	function _areaidJurisdiction(type){
		var provid = OrderInfo.staff.soAreaId.substring(0,3) + "0000";
		var areaparam = {"areaid":provid};
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(contextPath+"/token/pc/offer/areaidJurisdiction",areaparam);	
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
	var addNumSub = function(max,addnum){
		if(choosenum>=max){
			return;
		}
		idnum++;
		choosenum++;
		
		
		var $div = $("<div class='form-group' id='oldnum_"+idnum+"'></div>");
		var $div2 = $("<div class='input-group'>");  
		var $label = $("<label>已有移动电话</label>");

		var $text = $("<input name='oldphonenum' input value='"+addnum+"'  readonly='readonly'  id='oldphonenum_"+idnum+"' class='form-control'>");
		$div2.append($text);
		
		var $span = $("<span class='input-group-btn'>");
		//$span.append("<button class='btn btn-default' type='button' onClick='javascript:order.memberChange.delNum(\"oldnum_"+idnum+"\");'> - </button>");
		$div2.append($span).appendTo($div);
		
		$label.appendTo($div);
		$div2.appendTo($div);
		$("#form").append($div);
	
	};
	
	
	var _addNum = function(max){
		if(choosenum>=max){
			return;
		}
		idnum++;
		choosenum++;
		
		
		var $div = $("<div class='form-group' id='oldnum_"+idnum+"'></div>");
		var $div2 = $("<div class='input-group'>");  
		var $label = $("<label>已有移动电话</label>");

		var $text = $("<input name='oldphonenum' id='oldphonenum_"+idnum+"' class='form-control'>");
		$div2.append($text);
		
		var $span = $("<span class='input-group-btn'>");
		$span.append("<button class='btn btn-default' type='button' onClick='javascript:order.memberChange.delNum(\"oldnum_"+idnum+"\");'> - </button>");
		$div2.append($span).appendTo($div);
		
		$label.appendTo($div);
		$div2.appendTo($div);
		$("#form").append($div);
	
	};
	
	var _delNum = function(id){
		choosenum--;
		$("#"+id).remove();
	};
	
	var custinfolist = [];
	// 根据号码查询主副卡号码
	var _queryMVCard = function(){
		var $phoneNum = $("#mvCardPhone");
		if ($phoneNum.length > 0) {
			var phoneNum = $.trim($phoneNum.val());
			custinfolist = [];
			var mvFlag = true;
			if (phoneNum == "") {
				$.alert("提示", "请输入电信手机号码!");
				return false;;
			} else if (!/^(180|189|133|134|153|181|108|170|177)\d{8}$/
					.test(phoneNum)) {
				$.alert("提示", "您输入的不是正确的电信号码,请重新输入！");
				return false;
			}else{
				for(var v=0;v<OrderInfo.offer.offerMemberInfos.length;v++){
					if(phoneNum==OrderInfo.offer.offerMemberInfos[v].accessNumber){
						$.alert("提示",phoneNum + "号码重复，请重新输入！");
						mvFlag = false;
						return false;
					}
				}
			}
			// 查询用户与已订购产品
			if (mvFlag) {
				if (queryoffercust(phoneNum, custinfolist)) {
					queryMemberRoles();
				}
			}
		}
	};
	
	var queryMemberRoles = function(){
		
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldMvFlag = false;
		
		var p_areaId = OrderInfo.staff.soAreaId;
		if($("#memberTr").length > 0 ){
			$("#memberTr").remove();
		}
		for ( var i = 0; i < custinfolist.length; i++) {
			var param = {
				areaId : p_areaId,
				acctNbr : custinfolist[i].accNbr,
				custId : custinfolist[i].custId,
				curPage : "1",
				pageSize : "5"
			};
			var prodInfo = query.offer.queryProduct(param);
			if (prodInfo == undefined) {
				$.alert("提示","产品信息查询失败,查询返回结果【"+prodInfo+"】,请后台核实！");
				return;
			} else {
				for ( var i = 0; i < prodInfo.length; i++) {
					if (prodInfo[i].accNbr == custinfolist[i].accNbr) {
						var prodInstInfos = prodInfo[i];
						OrderInfo.oldprodInstInfos.push(prodInstInfos);
						
						/** ============销售品实例构成================**/
						_mainProdOfferInstInfos = prodInstInfos.mainProdOfferInstInfos[0];
						var _param = {
							offerId : _mainProdOfferInstInfos.prodOfferInstId,
							offerSpecId : _mainProdOfferInstInfos.prodOfferId,
							acctNbr : prodInfo[i].accNbr,
							areaId : prodInfo[i].areaId
						};
						data = query.offer.queryOfferInst(_param);
						if (data == undefined) {
							return false;
						}
						var flag = true;
						if (ec.util.isArray(data.offerMemberInfos)) {
							CacheData.sortOffer(data);
							var oldLen = 0 ;
							var $memberTr = $("<tr id='memberTr'><td align='left' class='borderLTB' colspan='4'><div id='memberDiv'><ul></ul></div></td></tr>");
							for ( var k = 0; k < data.offerMemberInfos.length; k++) {
								var member = data.offerMemberInfos[k];
								if(member.objType==""){
									$.alert("提示","销售品实例构成 "+member.roleName+" 成员类型【objType】节点为空，无法继续受理,请营业后台核实");
									return false;
								}else if(member.objType==CONST.OBJ_TYPE.PROD){
									if(member.roleCd!=CONST.MEMBER_ROLE_CD.MAIN_CARD && member.accessNumber == prodInfo[i].accNbr){
										$.alert("提示","【"+member.accessNumber+"】不是主接入号,请重新输入!");
										return false;
									}
									if(member.objId==""){
										$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品规格【objId】节点为空，无法继续受理,请营业后台核实");
										return false;
									}
									if(member.accessNumber==""){
										$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
										return false;
									}
									oldLen++;
									$memberLi = $("<li><input type='checkbox' checked='true' value=\""+member.accessNumber+"\"><span>"+ 
														member.roleName + member.accessNumber + "</span></li>");
									$memberTr.find("ul").append($memberLi);
								}
								if(member.objInstId==prodInstInfos.prodInstId){
									flag = false;
								}
							}
							if(flag){
								$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+prodInfo[i].accNbr+"】，无法继续受理，请业务后台核实");
								return false;
							}else{
								if (oldLen > 1) { // 多成员角色
									OrderInfo.oldMvFlag = true;
								}
								if (OrderInfo.oldMvFlag) {
									$("#mvCardNum").after($memberTr);
								} else {
									$.alert("提示", custinfolist[i].accNbr + "不是多产品，请选择【已有移动电话】入口纳入!");
									return false;;
								}
								var offerinfos = {
										"offerMemberInfos":	data.offerMemberInfos,
										"offerId":_mainProdOfferInstInfos.prodOfferInstId,
										"offerSpecId":_mainProdOfferInstInfos.prodOfferId,
										"offerSpecName":_mainProdOfferInstInfos.prodOfferName
									};
								OrderInfo.oldoffer.push(offerinfos);
							}
						}else{//销售品成员实例为空
							$.alert("提示","查询销售品实例构成，没有返回成员实例无法继续受理");
							return false;
						}
						/** ==================== **/
						
						/** ============销售品规格================**/
						var prodOfferId = prodInstInfos.mainProdOfferInstInfos[0].prodOfferId;
						if(ec.util.isObj(prodOfferId)){
							var param = {
									offerSpecId : prodOfferId, 
									offerTypeCd : 1,
									partyId : prodInstInfos.mainProdOfferInstInfos[0].custId,
									accNbr : prodInfo[i].accNbr
								};
							if(!query.offer.queryMainOfferSpec(param)){ //查询主套餐规格构成，并且保存
								return;
							}
						}
						/** ==================== **/
					}
				}
			}
		}
	};
	var buildMainView = function(param) {
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		if(!ec.util.isArray(OrderInfo.oldprodInstInfos)){
		    if(OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
				var is_same_feeType=false;//
				if(param.feeTypeMain=="2100" && (param.offerSpec.feeType=="2100"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1200" && (param.offerSpec.feeType=="1200"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1201" && (param.offerSpec.feeType=="1201"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}
				if(!is_same_feeType){
					$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
					return;
				}
			}
		}
		$.callServiceAsHtml(contextPath+"/token/app/order/mainsub2",param,{
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
				OrderInfo.actionFlag = param.actionFlag;
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					setTimeout(function () { 
						$.unecOverlay();
						offerChange.fillOfferChange(response,param);
				    }, 800);
				}else if(OrderInfo.actionFlag == 21){//副卡换套餐
					order.memberChange.fillmemberChange(response,param);
				}else {
					$.unecOverlay();
					order.main.callBackBuildView(response,param);
				}
			}
		});
	};
	var _addMvMember = function(){
		OrderInfo.choosedNumList = [];
		OrderInfo.viceOffer = [];
		OrderInfo.viceprodInstInfos = [];
		OrderInfo.hasMainCarFlag = false;
		if ($("#memberTr").length > 0) {
			$("#memberTr").find("input[type='checkbox']:checked").each(function() {
				var memberNum = $(this).val();
				OrderInfo.choosedNumList.push({ "accNbr" : memberNum , "custId":custinfolist[0].custId});
			});
		}
		if(OrderInfo.choosedNumList.length == 0){
			$.alert("提示","请选择需要加装的号码！");
			return;
		};
		var choosedCardNum = OrderInfo.choosedNumList.length;
		
		// 判断选择号码是否超过能加装的最大数量
		var numFlag = checkCanAddNum(choosedCardNum);
		
		if(numFlag){
			for(var j=0;j<OrderInfo.oldoffer.length;j++){
				var memberInfos = OrderInfo.oldoffer[j];
				var data = [];
				$.each(memberInfos.offerMemberInfos,function(){
					if (this.objType == CONST.OBJ_TYPE.PROD) { // 接入类产品
						for ( var i = 0; i < OrderInfo.choosedNumList.length; i++) {
							if (this.accessNumber == OrderInfo.choosedNumList[i].accNbr) {
								if(this.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD || this.roleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
									OrderInfo.hasMainCarFlag = true;
								}
								data.push(this);
							}
						}
					}
				});
				var offerinfos = {
						"offerMemberInfos":	data,
						"offerId":memberInfos.offerId,
						"offerSpecId":memberInfos.offerSpecId,
						"offerSpecName":memberInfos.offerSpecName
					};
				OrderInfo.viceOffer.push(offerinfos);
			}
			
			if(QueryMvOfferCustProd()){
				setProdUim();
			}
		}
	};
	
	// 判断能加装的最大数量
	var checkCanAddNum = function(num){
		var flag = true;
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if (offerRole.memberRoleCd != CONST.MEMBER_ROLE_CD.MAIN_CARD) {
				var existViceCardNum = 0;//已有副卡数量
				//副卡个数
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.offerRoleId == offerRole.offerRoleId  && this.objType==CONST.OBJ_TYPE.PROD){
						existViceCardNum++;
					}
				});
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
						if(max > 0 && (max - existViceCardNum - num) < 0){
							$.alert("提示","加装数量已经超过能加装的最大数量【"+max+"】!");
							flag = false;
							return false;
						}
					}
				});
			}
		});
		return flag;
	};
	
	var _queryofferinfo = function(){
		var oldAddNumList_flag = true;
		//$("input[name=oldphonenum]")
		//$("input[id^='oldphonenum']").each(function(){
		$("input[name='oldphonenum']").each(function(){
			var num = $.trim($(this).val());
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
		});
		if(!oldAddNumList_flag){
			return false;
		}
		if(OrderInfo.oldAddNumList.length==0){
			$.alert("提示","请输入手机号码!");
			return false;
		}
		var custflag = true;
		for(var i=0;i<OrderInfo.oldAddNumList.length;i++){
			for(var v=0;v<OrderInfo.offer.offerMemberInfos.length;v++){
				if(OrderInfo.oldAddNumList[i].accNbr==OrderInfo.offer.offerMemberInfos[v].accessNumber){
					$.alert("提示",OrderInfo.oldAddNumList[i].accNbr+"号码重复，请重新输入！");
					custflag = false;
					return false;
				}
			}
			if(OrderInfo.provinceInfo.mergeFlag=="0"){
				custflag = queryoffercust(OrderInfo.oldAddNumList[i].accNbr,custinfolist);
				if(!custflag){
					break;
				}
			}else{
				var provCustAreaId = OrderInfo.staff.soAreaId;
				custflag = cust.queryCustCompreInfo(OrderInfo.oldAddNumList[i].accNbr,provCustAreaId,3,'OLD');
				if(!custflag){
					break;
				}
			}
		}
		if(custflag){
			if(OrderInfo.provinceInfo.mergeFlag=="0"){
				return QueryofferCustProd();
			}else{
				if(checkCanAddNum(order.memberChange.viceCartNum)){
					return queryMainOfferSpec();
				}
			}
		}
	};
	
	var queryoffercust = function(accNbr,custinfolist){
		var param = {
				"acctNbr":accNbr,
				"identityCd":"",
				"identityNum":"",
				"partyName":"",
				"diffPlace":"local",
				"areaId" : OrderInfo.staff.soAreaId,
				"queryType" :"",
				"queryTypeValue":"",
				"prodClass":"12"
		};
		var response = $.callServiceAsJson(contextPath+"/app/cust/queryoffercust", param, {"before":function(){
			$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		}});
		if (response.code == 0) {
			$.unecOverlay();
			if(response.data.custInfos.length==0){
				$.alert("提示","抱歉，没有定位到"+accNbr+"客户，请尝试其他客户。");
				return false;
			}
			var custId = response.data.custInfos[0].custId;
			// 主副卡客户校验取客户查询返回结果中的custId,旧的取order.prodModify.choosedProdInfo.custId
			
			if(custId!=OrderInfo.cust.custId){
				$.alert("提示",accNbr+"和主卡的客户不一致！");
				return false;
			}
			
			custinfolist.push({"accNbr":accNbr,"custId":custId});
		}else{
			$.unecOverlay();
			$.alertM(response.data);
			return false;
		}
		return true;
	};
	
	/*
	 * 查询主副卡加装所选号码
	 * 1. 已查询号码在所选号码中,不再重新查询
	 * 2. 已查询号码未在所选号码中,移除且查询所选号码产品信息
	 */ 
	var QueryMvOfferCustProd = function(){
		var orderflag = true;
		for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
			var prodInfos = OrderInfo.oldprodInstInfos[i];
			for ( var j = 0; j < OrderInfo.choosedNumList.length; j++) {
				var accNbr = OrderInfo.choosedNumList[j].accNbr;
				if ( prodInfos.accNbr == accNbr) { //在所选号码中
					OrderInfo.viceprodInstInfos.push(prodInfos);
				}else{  // 不在所选号码中,查询
					var param = {
							areaId : prodInfos.areaId,
							acctNbr : OrderInfo.choosedNumList[j].accNbr,
							custId : OrderInfo.choosedNumList[j].custId,
							curPage : "1",
							pageSize : "5"
					};
					var prodInstInfos = query.offer.queryProduct(param);
					if (prodInstInfos == undefined) {
						return;
					} else {
						for ( var k = 0; k < prodInstInfos.length; k++) {
							if (prodInstInfos[k].accNbr == accNbr) {
								var prodInfo = prodInstInfos[k];
								
								if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
									orderflag = false;
									$.alert("提示",OrderInfo.choosedNumList[k].accNbr+"不是在用产品！");
									return ;
								}
								if(prodInfo.feeType.feeType!=order.prodModify.choosedProdInfo.feeType){
									orderflag = false;
									$.alert("提示",OrderInfo.choosedNumList[k].accNbr+"和主卡的付费类型不一致！");
									return ;
								}
								if(prodInfo.productId==CONST.PROD_SPEC.DATA_CARD){
									orderflag = false;
									$.alert("提示",OrderInfo.choosedNumList[k].accNbr+"是无线宽带，不能纳入！");
									return ;
								}
								
								OrderInfo.viceprodInstInfos.push(prodInfo);
								break;
							}
						}
					}
				}
			}
		}
		return orderflag;
	};
	
	var QueryofferCustProd = function(){
		var orderflag = true;
		for(var i=0;i<custinfolist.length;i++){
			var param={};
			param.custId=custinfolist[i].custId;
			param.acctNbr=custinfolist[i].accNbr;
			param.areaId=OrderInfo.staff.soAreaId;
			param.pageSize="";
			param.curPage="";
			param.DiffPlaceFlag="local";
			if(param.custId==null||param.custId==""){
				orderflag = false;
				$.alert("提示",custinfolist[i].accNbr+"无法查询已订购产品");
				return false;
			}
			var response = $.callServiceAsJson(contextPath+"/app/cust/offerorderprod", param, {"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			}});
			if (response.code == 0) {
				$.unecOverlay();
				var list = response.data;
				if(!ec.util.isArray(list)){
					$.alert("提示",custinfolist[i].accNbr+"无法查询已订购产品");
					return false;
				}
				for(var j=0;j<list.length;j++){
					if (list[j].accNbr == custinfolist[i].accNbr){
						var prodInstInfos = list[j];
						prodInstInfos.custId = custinfolist[i].custId;
						//须要恢复
						
						if(prodInstInfos.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
							orderflag = false;
							$.alert("提示",custinfolist[i].accNbr+"不是在用产品！");
							return false;
						}
						if(prodInstInfos.feeType.feeType!=order.prodModify.choosedProdInfo.feeType){
							orderflag = false;
							$.alert("提示",custinfolist[i].accNbr+"和主卡的付费类型不一致！");
							return false;
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
				return false;
			}
		}
		if(orderflag){
			return setOffer();
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
					return false;
				}
			}
		}
		if(specflag){
			return setProdUim();
		}
	};
	
	var setOffer = function() {
		var offerflag = true;
		var addNum = 0; // 加装副卡数量
		var exitNum = [];
		for(var z=0;z<OrderInfo.oldprodInstInfos.length;z++){
			if(ec.util.isArray(exitNum)){
				for(var i in exitNum){
					if(OrderInfo.oldprodInstInfos[z].accNbr == exitNum[i].accessNumber){
						$.alert("提示","号码【"+OrderInfo.oldprodInstInfos[z].accNbr+"】与【"+exitNum[i].accNbr+"】为同一套餐下的实例成员，不能重复加装!");
						return false;
					}
				}
			}
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
							return false;
						}else if(member.objType==CONST.OBJ_TYPE.PROD){
							if(member.accessNumber==""){
								offerflag = false;
								$.alert("提示","销售品实例构成 "+member.roleName+" 接入产品号码【accessNumber】节点为空，无法继续受理,请营业后台核实");
								return false;
							}
							objTypeflag++;
							addNum++;
							exitNum.push({"accNbr":OrderInfo.oldprodInstInfos[z].accNbr,"accessNumber":member.accessNumber});
						}
						if(member.objInstId==OrderInfo.oldprodInstInfos[z].prodInstId){
							flag = false;
						}
					}
					if(flag){
						offerflag = false;
						$.alert("提示","销售品实例构成中 没有包含选中接入号码【"+OrderInfo.oldprodInstInfos[z].accNbr+"】，无法继续受理，请业务后台核实");
						return false;
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
					return false;
				}
			}
		}
		if(offerflag && checkCanAddNum(addNum)){
			return queryMainOfferSpec();
		}
	};
	
	var setProdUim = function(){
		var produimflag = true;
		OrderInfo.boProd2OldTds = []; //清空旧卡
		if ( ec.util.isArray(OrderInfo.viceprodInstInfos) && OrderInfo.oldMvFlag) { // 加装主副卡
			var prod = {};
			for ( var i = 0; i < OrderInfo.viceOffer.length; i++) {
				$.each(OrderInfo.viceOffer[i].offerMemberInfos, function() {
					if (this.objType == CONST.OBJ_TYPE.PROD) { // 接入类产品
						prod.prodInstId = this.objInstId;
						prod.accNbr = this.accessNumber;
						var uim = query.prod.getTerminalInfo(prod);
						if (uim == undefined) { // 查询旧卡信息失败返回
							produimflag = false;
							return false;
						}
						setOldUim(this.offerId, this.objInstId, uim); // 保存旧卡信息
						if (uim.is4GCard == "Y") {
							this.prodClass = CONST.PROD_CLASS.FOUR;
						} else {
							this.prodClass = CONST.PROD_CLASS.THREE;
						}
					}
				});
			}
		} else {

			$.each(OrderInfo.oldoffer,function(){
				var oldoffer = this;
				var prod = {};
				$.each(oldoffer.offerMemberInfos,function(){
					if (this.objType == CONST.OBJ_TYPE.PROD) { // 接入类产品
						prod.prodInstId = this.objInstId;
						prod.accNbr = this.accessNumber;
						var uim = query.prod.getTerminalInfo(prod);
						if (uim == undefined) { // 查询旧卡信息失败返回
							produimflag = false;
							return false;
						}
						setOldUim(this.offerId, this.objInstId, uim); // 保存旧卡信息
						if (uim.is4GCard == "Y") {
							this.prodClass = CONST.PROD_CLASS.FOUR;
						} else {
							this.prodClass = CONST.PROD_CLASS.THREE;
						}
					}
				});
			});
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
					return false;
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
					return false;
				};
			}
			if(instflag){
				return ruleCheck();
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
		if (ec.util.isArray(OrderInfo.viceprodInstInfos) && OrderInfo.oldMvFlag) { // 加装主副卡,查询已选号码全量查询
			for ( var i = 0; i < OrderInfo.viceOffer.length; i++) {
				if (ec.util.isArray(OrderInfo.viceOffer[i].offerMemberInfos)) {
					var flag = true;
					$.each(OrderInfo.viceOffer[i].offerMemberInfos, function() {
						if (this.objType == CONST.OBJ_TYPE.PROD
								&& this.accessNumber == prod.accNbr) { // 选中号码在销售品实例构成中，为了防止销售品实例缓存
							instflag = false;
							flag = false;
							return;
						}
					});
					if (flag) { // 不在销售品实例缓存
						return query.offer.invokeLoadInst(param);
					} else {
						var vFlag = true;
						$.each(OrderInfo.viceOffer[i].offerMemberInfos,function() {
							if (this.objType == CONST.OBJ_TYPE.PROD) {
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
				} else {
					$.alert("提示", "没有选择需要加装的副卡,全量查询失败！");
					return false;
				}
			}
		}else{
		
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
//							if(!query.offer.invokeLoadInst(param)){
//								instflag = false;
//								return;
//							}
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
//									var loadinstflag = query.offer.invokeLoadInst(param);
//									if(!loadinstflag){
////									if (!query.offer.invokeLoadInst(param)) {
//										instflag = false;
//										return;
//									}
								}
							});
							return vFlag;
						}
					}else{
						return query.offer.invokeLoadInst(param);
//						if(!query.offer.invokeLoadInst(param)){
//							instflag = false;
//							return;
//						}
					}
				}
			}
		}
//		}
//		if(instflag){
//			ruleCheck();
//		}
	};
	
	//生成订单流水号，规则校验
	var ruleCheck = function(){
	//	rule.rule.init();
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
						return false;
					}
					if(checkData.ruleType == "portal"){  //门户层校验
						if (checkData.resultCode == "0"){  // 0为门户层校验为通过
							ruleflag = false;
							$.alert("提示",checkData.resultMsg);
							return false;
						}
					}		
					var checkRuleInfo = checkData.result.resultInfo;  //业务规则校验
					if(checkRuleInfo!=undefined && checkRuleInfo.length > 0){
						$.each(checkRuleInfo, function(i, ruleInfo) {
							$("<tr><td>"+ruleInfo.resultCode+"</td>" +
									"<td>"+ruleInfo.ruleDesc+"</td>" +
									"<td>"+rule.rule.getRuleLevelName(ruleInfo.ruleLevel)+"</td>" +
									"<td><div style='display:block;margin-left:30px;' class='"+rule.rule.getRuleImgClass(ruleInfo.ruleLevel)+"'></div></td>" +
							"</tr>").appendTo($("#ruleBody"));
						});
						easyDialog.open({
							container : 'ruleDiv'
						});
						ruleflag = false;
						return false;
					}
				}else{
					ruleflag = false;
					$.alertM(response.data);
					return false;
				}
		}
		if(ruleflag){
			return true;
		}
	};
	
	var addOldSubmit = function(){
		/*
		//老用户纳入
		OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,6,
				CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
		var param = {};
		if(ec.util.isArray(OrderInfo.viceprodInstInfos) && OrderInfo.oldMvFlag ){
			 param = {
					memberChange : "Y",
					type : 1,
					boActionTypeName : "主副卡成员变更",
					viceCardNum : parseInt(OrderInfo.choosedNumList.length),
					offerNum : 1,
					actionFlag:6,
					offerSpec:OrderInfo.oldofferSpec,
					//prodInstInfos:OrderInfo.oldprodInstInfos,
					offer:OrderInfo.viceOffer,
					oldMvFlag:OrderInfo.oldMvFlag,
					addflag:"ADD"
				};
		}else{
			 param = {
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
		}
//		order.service.setOfferSpec(); //把选择的主副卡数量保存
		var prod = order.prodModify.choosedProdInfo; 
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
			instId : prod.prodOfferInstId,
			specId : prod.prodOfferId,
			prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
		}];
		
		
		rule.rule.ruleCheck(boInfos,function(checkData){//业务规则校验通过
			if(ec.util.isObj(checkData)){
				$("#order_prepare").hide();
				var content$ = $("#order").html(checkData).show();
				$.refresh(content$);
			}else{
				order.main.buildMainView(param);
			}
		});
		
		order.memberChange.closeDialog();
		*/
	};

	var _submit = function() {
	 
		OrderInfo.actionFlag==6;
	    OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldAddNumList = [];
		OrderInfo.oldMvFlag = false;
		OrderInfo.hasMainCarFlag = true;
		custinfolist = [];
		OrderInfo.oldprodAcctInfos = [];
		OrderInfo.choosedNumList = [];
		var lis = $("input[id^='li_viceCard_new']");
		var ifRemoveProd = false;
		for (var i=0;i<lis.length;i++) {
			if ($(lis[i]).attr("del") == "Y"||$(lis[i]).attr("knew") == "Y") {
				ifRemoveProd = true;
				break;
			}
		}
		var num=0; 
		$.each(_memberAddList,function(){
			num=num+Number($("#"+this).val());
		});
        //判断是否超过副卡最大数
		var oldnum=0;
		$("input[name='oldphonenum']").each(function(){
			if(this.value!=null && this.value!="" && this.value.length==11){
				oldnum+=1;
			}
		});
		
		var newnum=Number($("#"+OrderInfo.objInstId).val());
		if(oldnum+newnum>maxPhone){
			$.alert("提示","加装副卡和纳入老成员数量超过最大值"+maxPhone);
			return;
		}
		if(newnum>0){
			if (!cust.preCheckCertNumberRel("-1", cust.getCustInfo415())) {
	            return;
	        }
			if((parseInt(newnum)+parseInt(ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,cust.getCustInfo415Flag(cust.getCustInfo415()))))>5){
	            $.alert("提示","此用户下已经有"+ec.util.mapGet(OrderInfo.oneCardFiveNO.usedNum,cust.getCustInfo415Flag(cust.getCustInfo415()))+"个号码，工信部要求支撑全国实名制一证五卡验证！");
	            return;
	        } 
		}
		if (!(ifRemoveProd) && num <=0 && oldnum<=0) {
			$.alert("提示","没有对副卡进行操作。");
			return;
		}
		
		//公共参数
	    var param={
	    	type : 1,
	    	boActionTypeName : "主副卡成员变更",       
	    	offerNum : 1,
	    	actionFlag:6
        };
	    
		//新装副卡
		if(num>0){//新装副卡
			OrderInfo.newClothes="true";
			var prod = order.prodModify.choosedProdInfo; 
			var boInfos = [{
				boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
				instId : prod.prodOfferInstId,
				specId : prod.prodOfferId,
				prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
			}];
			
			var p = {
				prodId : prod.prodInstId, // 产品实例id
				acctNbr : prod.accNbr, // 接入号
				prodSpecId : prod.productId, // 产品规格id
				areaId : prod.areaId // 地区id
			};
			var resData = query.offer.queryProdInstParam(p);
			if(resData && resData.prodSpecParams){
				OrderInfo.prodInstAttrs = resData.prodSpecParams;
			}
			
			OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,6,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
		
			//添加新装的入参
			param.newviceCardNum=parseInt(num);
			param.feeTypeMain=prod.feeType;
			param.custId=OrderInfo.cust.custId;
			param.access=_offerProd.accessNumber;
			param.newofferSpec=OrderInfo.offerSpec;
			param.newClothes="true";
			order.memberChange.newMemberFlag = true;
			order.service.setOfferSpec(); //把选择的主副卡数量保存
			if(rule.rule.ruleCheck(boInfos)){	
			}
			else{
				$.alert("提示：","规则校验不通过");
				return ;
			}
			//order.memberChange.closeDialog();
		}else{
			param.newClothes="false";
			order.memberChange.newMemberFlag = false;
		}
		
		//纳入老成员
		if(oldnum>0){
			 OrderInfo.oldMember="true";
			order.memberChange.queryofferinfo();
			//老用户纳入
			OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,6,
					CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
			
			param.oldviceCardNum=parseInt(OrderInfo.oldAddNumList.length);   //纳入老成员参数
			param.oldofferSpec=OrderInfo.oldofferSpec;
			param.prodInstInfos=OrderInfo.oldprodInstInfos;
			param.offer=OrderInfo.oldoffer;
            param.oldMember="true";     //纳入老成员动作
           
			var prod = order.prodModify.choosedProdInfo; 
			var boInfos = [{
				boActionTypeCd : CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,
				instId : prod.prodOfferInstId,
				specId : prod.prodOfferId,
				prodId : _offerProd.objInstId//纳入产品成员这些动作时出入宿主产品实例ID
			}];
			
            if(rule.rule.ruleCheck(boInfos)){
				
            }else{
				$.alert("提示：","规则校验不通过");
				return ;
			}
		}else{
			param.oldMember="false";  
		}
		  //到填单页面
		// order.main.buildMainView(param);
	    // order.memberChange.closeDialog();
	    // return ;
		//拆副卡保留新套餐
	   if(ifRemoveProd){//保留副卡
		   OrderInfo.delViceCard="true";
		   param.delViceCard="true";
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
		   if(OrderInfo.newClothes=="false" && OrderInfo.oldMember=="false"){
		   OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.ADDOREXIT_COMP,6,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.ADDOREXIT_COMP),"3");
		   }
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

			var paramTmp={
				areaId : OrderInfo.staff.areaId,
				staffId : OrderInfo.staff.staffId,
				channelId : OrderInfo.staff.channelId,
				custId : OrderInfo.cust.custId,
				boInfos : []
			};
			paramTmp.boInfos=boInfos;
			if(_getSimulateData()){
				//业务规则校验
				 if(rule.rule.ruleCheck(boInfos)){
					//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
						if(!prodUimSetProdUim("delViceCard")){ 
							return ;
						}
						var prodInfo = order.prodModify.choosedProdInfo;
						param.boActionTypeCd=boActionType;
						//套餐名称
						param.delViceCardboActionTypeName=CONST.getBoActionTypeName(boActionType);
						param.prodId=prodInfo.prodInstId;
						param.offerMembers=OrderInfo.offer.offerMemberInfos;
						param.oldOfferSpecName=prodInfo.prodOfferName;
						param.prodClass=prodInfo.prodClass;
						param.appDesc =CONST.getAppDesc();
						param.submitFlag=submitFlag;
						param.viceParam=viceparam;
						param.ooRoles=ooRoles;
					}
					else{
						$.alert("提示：","规则校验不通过");
						return ;
					}
			
			}else{
				//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,boActionType,v_actionFlag,CONST.getBoActionTypeName(boActionType),templateType);
				var flag = rule.rule.prepare(paramTmp,'order.prodModify.commonPrepare',callParam);
				if(flag) return;
			}
			//order.memberChange.closeDialog();
	   }
	   else{
		   param.delViceCard="false";
	   }
	   
	   //到填单页面
	 order.main.buildMainView(param);
     order.memberChange.closeDialog();
    
	};
	
	var prodUimSetProdUim=function(action){
		return prod.uim.setProdUim(action);
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
	
	var _fillmemberChange=function(response,param,action,sign){
		
		if(OrderInfo.oldMember=="true" || OrderInfo.newClothes=="true"){
			$("#member_prepare").hide();
			if(OrderInfo.delViceCard=="true"){
				$("#offerspecContent").show();
			}
		}
		else{
			$("#member_prepare").show();
			//$("#offerspecContent").show();
			SoOrder.initFillPage(); //并且初始化订单数据
			$("#member_prepare").html(response.data);
		}
	
		$("#fillNextStep").off("click").on("click",function(){
			OrderInfo.viceParam = param;
			if(!SoOrder.checkData()){ //校验通过
				return false;
			}
			$("#order-content").hide();
			$("#order-dealer").show();
			order.dealer.initDealer();
		});
		$("#fillNextStepSub").off("click").on("click",function(){
			_removeAndAdd(param);
		
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		//遍历主销售品构成
		var uimDivShow=false;//是否已经展示了
		$.each(param.viceParam,function(){
			var prodId = this.objInstId;
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
			var res = query.offer.queryChangeAttachOffer(param,action,sign);
			$("#attach_"+prodId).html(res);	
			//如果objId，objType，objType不为空才可以查询默认必须
			if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
				param.queryType = "1,2";
				param.objId = this.objId;
				param.objType = this.objType;
				param.memberRoleCd = "400";
				param.offerSpecId=this.offerSpecId;
				//默认必须可选包
				var data = query.offer.queryDefMustOfferSpec(param,action,"sign");
				CacheData.parseOffer(data,prodId);
				//默认必须功能产品
				var data = query.offer.queryServSpec(param,action,"sign");
				CacheData.parseServ(data,prodId,"delViceCard");
			}
			AttachOffer.showMainMemberRoleProd(prodId); //显示新套餐构成
			AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
			if(AttachOffer.isChangeUim(prodId,"delViceCard")){ //需要补换卡
				if(!uimDivShow){
					//自动填入uim卡 
					$("#uimDiv_"+prodId).show();
					var member = CacheData.getOfferMember(prodId);
					if(member!=null && member!=undefined && member!="" && member!="null"){
					if(OrderInfo.mktResInstCode!=null && OrderInfo.mktResInstCode!="" && OrderInfo.mktResInstCode!=undefined && OrderInfo.mktResInstCode!="null"){
						var mktResInstCodesize = OrderInfo.mktResInstCode.split(",");
						for(var u=0;u<mktResInstCodesize.length;u++){
							if(mktResInstCodesize[u]!=""&&mktResInstCodesize[u]!=null&&mktResInstCodesize[u]!="null"){
								var nbrAndUimCode = mktResInstCodesize[u].split("_");
								var _accNbr = nbrAndUimCode[0];
								var _uimCode = nbrAndUimCode[1];
								//var newSubPhoneNumsize = order.memberChange.newSubPhoneNum.split(",");
							
									if(member==_accNbr){
										$("#uim_txt_"+prodId).attr("disabled",true);
										var uimParam = {
												"instCode":_uimCode
										};
										var response = $.callServiceAsJsonGet(contextPath+"/token/pc/mktRes/qrymktResInstInfo",uimParam);
										if (response.code==0) {
											if(response.data.mktResBaseInfo){
												if(response.data.mktResBaseInfo.statusCd=="1102"){
													$("#uim_check_btn_"+prodId).attr("disabled",true);
													$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
													$("#uim_release_btn_"+prodId).attr("disabled",false);
													$("#uim_release_btn_"+prodId).removeClass("disablepurchase").addClass("purchase");
													$("#uim_txt_"+prodId).val(_uimCode);
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
													OrderInfo.clearProdUim(prodId);
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
								
							}
						}
					}
				  }
				}else{
					$("#uimDiv_"+prodId).hide();
				}
			}
			uimDivShow=true;
		});
		order.dealer.initDealer(2); //初始化发展人
	//	offerChange.initOrderProvAttr();//初始化省内订单属性
		if(OrderInfo.newClothes=="true" || OrderInfo.oldMember=="true"){
			$("#member_prepare").hide();
		}
		else{
			$("#member_prepare").show();
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
	function queryReOrder(){
		
		var provTransId = OrderInfo.provinceInfo.provIsale;
		var areaparam = {"provTransId":provTransId};
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(contextPath+"/accessToken/queryOrderInfos",areaparam);	
		$.unecOverlay();
		if (response.code==0) {
			order.memberChange.rejson = response.data;
			return true;
		}else if(response.code==1002){
			$.alert("错误",response.data);
			return false;
		}else{
			$.alertM(response.data);
			return false;
		}
	}
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
		var $tr = $("tr[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
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
	
	//生成订单流水号，加载实例到缓存,规则校验,callBack 回调函数
	var ruleCheck = function(boInfos,callBack){
		//_init();
		if(!query.offer.loadInst()){  //生成订单流水号，加载实例到缓存，如果失败
			return false;
		};
		if(boInfos==undefined){  //没有传，表示不做业务规则校验
			return true;
		}
		var inParam ={
			areaId : OrderInfo.staff.soAreaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			boInfos : boInfos,
			prodInfo : order.prodModify.choosedProdInfo	
		};
		
		$.callServiceAsHtml(contextPath+"/app/rule/prepare", inParam, {
			"before":function(){
				$.ecOverlay("<strong>客户级规则校验中，请稍等...</strong>");
			},	
			"done" : function(response){
				setTimeout(function () { 
					$.unecOverlay();
					var checkData = response.data;
					if(typeof(callBack)=="function"){
						callBack(checkData);
					}
			    }, 800);
			}
		});

	};	
	
	
	/**
	 * 加装副卡
	 * */
	var addViceCard=function (num){
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
				access:_offerProd.accessNumber,
				offerSpec: OrderInfo.offerSpec
			};
			order.service.setOfferSpec(); //把选择的主副卡数量保存
			
			rule.rule.ruleCheck(boInfos,function(checkData){//业务规则校验通过
				
				order.main.buildMainView(param);
			});
			
			//order.memberChange.closeDialog();
		}
	};
	var getMktResCd = function(prodSpecId){
		var param={
			"prodSpecId":prodSpecId
		};
		var url = contextPath+"/mktRes/uim/getMktResCd";
		$.ecOverlay("<strong>获取产品规格中,请稍等...</strong>");
		var response = $.callServiceAsJson(url,param);
		$.unecOverlay();
		if (response.code == "0") {
			return response.data;
		}else{
			return "";
		}
	};
	/*
	 * 是否是MIFI卡类型校验
	 */
	var getIsMIFICheck=function(prodId){
		var prodIdTmp=(Math.abs(prodId)-1);
		if(AttachOffer.openServList.length>prodIdTmp){
			var specList = AttachOffer.openServList[prodIdTmp].servSpecList;
			for (var j = 0; j < specList.length; j++) {
				var spec = specList[j];
				if(spec.isdel!="Y" && spec.isdel!="C"){
					if(spec.servSpecId==CONST.PROD_SPEC_ID.MIFI_ID && CONST.APP_DESC==0){
						return true ; 
					}
				}
			}
		}
		return false;
	};
	/****
	 * uim卡校验
	 **action  
	 * */
	//uim卡号校验
	var _checkUim = function(prodId,action,sign){
		var phoneNumber = OrderInfo.getAccessNumber(prodId,action,sign);
		var offerId = "-1"; //新装默认，主销售品ID
		if(OrderInfo.actionFlag==1||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14){ //新装需要选号
			if(phoneNumber==''){
				$.alert("提示","校验UIM卡前请先选号!");
				return false;
			}
		}
		if(OrderInfo.actionFlag==6 ){ //可选包变更，补换卡，加装副卡

			if(action!=undefined  && action =="oldmember"){//判断是否是纳入老用户
				$.each(OrderInfo.oldprodInstInfos,function(){
					if(this.prodInstId==prodId){
						offerId = this.mainProdOfferInstInfos[0].prodOfferInstId;
					}
				});
			}
			else if(action!=undefined  && action =="newmember"){
				offerId = order.prodModify.choosedProdInfo.prodOfferInstId;
			}
		}
		var cardNo =$.trim($("#uim_txt_"+prodId).val());
		if(cardNo==undefined || cardNo==''){
			$.alert("提示","UIM卡不能为空!");
			return false;
		}
		var inParam = {
			"instCode" : cardNo,
			"phoneNum" : phoneNumber,
			"areaId"   : OrderInfo.getProdAreaId(prodId)
//			"areaId"   : '8320102'
		};

		var prodSpecId = OrderInfo.getProdSpecId(prodId);
		var mktResCd="";
		if(CONST.getAppDesc()==0){
			if(getIsMIFICheck(prodId)){
				mktResCd =getMktResCd(CONST.PROD_SPEC_ID.MIFI_ID);
			}else{
				mktResCd = getMktResCd(prodSpecId);
			}
			if(ec.util.isObj(mktResCd)){
//				inParam.mktResCd = mktResCd;
			}else{
				$.alert("提示","查询卡类型失败！");
				return;
			}
			if(OrderInfo.actionFlag==22 || OrderInfo.actionFlag==23){ //补换卡和异地补换卡
				if(prod.changeUim.is4GProdInst){ //如果已办理4G业务，则校验uim卡是否是4G卡
					inParam.onlyLTE = "1";
				}
			}
		}
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
			partyId : OrderInfo.cust.custId, //客户ID
			prodId :  prodId, //产品ID
			offerId : offerId, //销售品实例ID
			state : "ADD", //动作
			relaSeq : "" //关联序列	
		};
		if(CONST.getAppDesc()==0){
			coupon.cardTypeFlag=data.baseInfo.cardTypeFlag;//UIM卡类型
		}
		$("#uim_check_btn_"+prodId).attr("disabled",true);
		//$("#uim_check_btn_"+prodId).removeClass("purchase").addClass("disablepurchase");
		$("#uim_release_btn_"+prodId).attr("disabled",false);
//		$("#uim_release_btn_"+prodId).removeClass("disabled");
		$("#uim_txt_"+prodId).attr("disabled",true);
		if(getIsMIFICheck(prodId)){//判断是否通过MIFI 校验
			$("#isMIFI_"+prodId).val("yes");
		}else{
			$("#isMIFI_"+prodId).val("no");
		}
		OrderInfo.clearProdUim(prodId);
		OrderInfo.boProd2Tds.push(coupon);
		if(OrderInfo.actionFlag==22 && data.baseInfo.cardTypeFlag==1){
		//	_queryAttachOffer();
		  AttachOffer.queryCardAttachOffer(data.baseInfo.cardTypeFlag);  //加载附属销售品
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
		init : _init,
		mktResInstCode:_mktResInstCode,
		queryMVCard:_queryMVCard,
		addMvMember:_addMvMember,
		closeDialog : _closeDialog,
		submit : _submit,
		offerProd:_offerProd,
		ischooseOffer :_ischooseOffer,
		removeAndAdd :_removeAndAdd,
		queryofferinfo:_queryofferinfo,
		addNum:_addNum,
		checkOrder:_checkOrder,
		checkOfferProd:_checkOfferProd,
		getSimulateData : _getSimulateData,
		fillmemberChange : _fillmemberChange,
		delNum:_delNum,
		reloadFlag: _reloadFlag,
		newSubPhoneNum: _newSubPhoneNum,
		oldSubPhoneNum: _oldSubPhoneNum,
		newmembers:_newmembers,
		oldmembers:_oldmembers,
		delmembers:_delmembers,
		changemembers:_changemembers,
		rejson:_rejson,
		subPage:_subPage,
		checkUim:_checkUim,
		newMemberFlag:_newMemberFlag,
		oldMemberFlag:_oldMemberFlag,
		changeMemberFlag:_changeMemberFlag,
	};
}();
$(function(){
	$("#memeberChangeclose").click(function(){
		order.memberChange.closeDialog();
	});
	$("#memeberChange .btna_o:first").click(function(){
		$("#memeberChange .btna_o:first").removeClass("btna_o").addClass("btna_g");
		order.memberChange.submit();
		$("#memeberChange .btna_g:first").removeClass("btna_g").addClass("btna_o");
	});
	$("#memeberChange .btna_o:last").click(function(){
		order.memberChange.closeDialog();
	});
});
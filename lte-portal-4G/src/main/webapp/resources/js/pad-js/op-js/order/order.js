CommonUtils.regNamespace("order", "service");

order.service = (function(){
	var _offerprice=""; 
	var idnum = 1;
	var maxNum = 0;
	var choosenum = 1;//纳入老用户数量

	var objInsterId="";
	//主套餐查询
	var _searchPack = function(pageIndex,scroller){
		var custId = OrderInfo.cust.custId;
		var searchtext = $('#searchtext').val();
		if(searchtext=="请输入您要搜索的套餐名称或首字母简拼"){
			searchtext="";
		}
		var phoneLevel="";//order.phoneNumber.boProdAn.level;
		if(phoneLevel==undefined&&phoneLevel==null){
			phoneLevel='';
		}
		//var subPage=$("#subpageFlag").val(); "subPage":subPage,
		var params={"qryStr":searchtext,"pnLevelId":phoneLevel,"custId":custId};
		//解析价格范围条件
		var price = $.trim($("#select_price").val());
		if(ec.util.isObj(price)){
			var priceArr = price.split("-");
			if(priceArr[0]!=null&&priceArr[0]!=""){
				params.priceMin = priceArr[0] ;
			}
			if(priceArr[1]!=null&&priceArr[1]!=""){
				params.priceMax = priceArr[1] ;
			}
		}
		//解析流量范围条件
		var influx = $.trim($("#select_influx").val());
		if(ec.util.isObj(influx)){
			var influxArr = influx.split("-");
			if(influxArr[0]!=null&&influxArr[0]!=""){
				params.INFLUXMin = influxArr[0]*1024;
			}
			if(influxArr[1]!=null&&influxArr[1]!=""){
				params.INFLUXMax = influxArr[1]*1024;
			}
		}
		//解析语音范围条件
		var invoice = $.trim($("#select_invoice").val());
		if(ec.util.isObj(invoice)){
			var invoiceArr = invoice.split("-");
			if(invoiceArr[0]!=null&&invoiceArr[0]!=""){
				params.INVOICEMin = invoiceArr[0] ;
			}
			if(invoiceArr[1]!=null&&invoiceArr[1]!=""){
				params.INVOICEMax = invoiceArr[1] ;
			}
		}
		_queryData(params,scroller);
		
	};
	
	var _searchPackById = function(prodOfferId){
		var params={"prodOfferId":prodOfferId,"pnLevelId":"","PageIndex":1,"PageSize":10};
		_queryData(params);
	};
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			if(scrollObj.page==1){
				_searchPack(1,scrollObj.scroll);
			}else{
				var show_per_page = 10;
				var start_from = (scrollObj.page-2) * show_per_page;
				var end_on = start_from + show_per_page;
				//$('#ul_offer_list').append($('#div_all_data').children().slice(start_from, end_on)).listview("refresh");
				$('#div_all_data').children().slice(start_from, end_on).appendTo($('#ul_offer_list'));
				$('#ul_offer_list').listview("refresh");
				$("#ul_offer_list li").off("tap").on("tap",function(){
					$(this).addClass("pakeagelistlibg").siblings().removeClass("pakeagelistlibg");
				});
				if(scrollObj.scroll && $.isFunction(scrollObj.scroll)) scrollObj.scroll.apply(this,[]);
			}
		}
	};
	var _queryData = function(params,scroller) {
		if(OrderInfo.actionFlag==2){
			var offerSpecId = order.prodModify.choosedProdInfo.prodOfferId;
			if(offerSpecId!=undefined){
				params.changeGradeProdOfferId = offerSpecId;
			}
		}else if(CONST.getAppDesc()==0){
			params.prodOfferFlag = "4G";
		}
		var url = contextPath+"/token/pad/order/offerSpecList";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code != 0) {
					$.alert("提示","<br/>查询失败,稍后重试");
					return;
				}
				var content$ = $("#div_offer_list");
				content$.html(response.data);
				//刷新jqm控件
				$.jqmRefresh(content$);
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				//绑定选中单个套餐事件
				$("#ul_offer_list li").off("tap").on("tap",function(){
					$(this).addClass("pakeagelistlibg").siblings().removeClass("pakeagelistlibg");
				});
				if(OrderInfo.busitypeflag==1){
					$("#btn_enter_prev").show();
					$("#btn_enter_prev").off("tap").on("tap",function(){
						$("#ul_busi_area").show();
						$("#order_prepare").empty();
					});
				}
				//绑定选中套餐后下一步操作功能
				$("#btn_enter_offerlist_next").off("tap").on("tap",function(){
					if($("#ul_offer_list .pakeagelistlibg").length==1){
						var $dl = $("#ul_offer_list .pakeagelistlibg").find("dl");
						order.uiCusts.buyService($dl.attr("offerSpecId"),$dl.attr("price"));
					}else{
						$.alert("提示","请先选择一个套餐,再进入下一步操作.");
					}
				});
				/*
				if(OrderInfo.provinceInfo.prodOfferId!=undefined && OrderInfo.provinceInfo.prodOfferId!=null && OrderInfo.provinceInfo.prodOfferId!="" && OrderInfo.provinceInfo.prodOfferId!="null"){
					
				}
				*/
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","套餐加载失败，请稍后再试！");
			}
		});
	};
	
	/**
	 * 根据合约规格编码aoId查询主销售品
	 */
	var _queryPackForTerm = function(aoId, agreementType, numLevel){
		var params={
			"aoId":aoId,
			"agreementType":agreementType,
			"numLevel":numLevel
		};
		var url = contextPath+"/order/queryPackForTerm";
		var response = $.callServiceAsJson(url,params, {});
		return response;
	};
	
	//订购销售品
	var _buyService = function(id,specId,price) {
		var custId = OrderInfo.cust.custId;
		offerprice = price;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在订购套餐之前请先进行客户定位！");
			return;
		}
		var param = {
			"price":price,
			"id" : id,
			"specId" : specId,
			"custId" : OrderInfo.cust.custId,
			"areaId" : OrderInfo.staff.soAreaId
		};
		if(OrderInfo.actionFlag == 2){  //套餐变更不做校验
			order.service.opeSer(param);   
		}else {  //新装
			var boInfos = [{
	            boActionTypeCd: "S1",//动作类型
	            instId : "",
	            specId : specId //产品（销售品）规格ID
	        }];
	        if(rule.rule.ruleCheck(boInfos)){
	        	 //业务规则校验通过
	        	if(OrderInfo.actionFlag==1){
	        		
	        		 if(OrderInfo.provinceInfo.reloadFlag=="N"){
	        			 $("#dlg-memberRole-num").css("display","none");
	    				 $("#dlg-memberRole-num").popup("close");
	    				 $("#dlg-memberRole-num").popup("close");
	        			 var p = {
	        						offerSpecId : param.specId,
	        						offerTypeCd : 1,
	        						partyId: OrderInfo.cust.custId
	        					};
	        			 var offerSpec = query.offer.queryMainOfferSpec(p); //查询主销售品构成
	        			 var newnum=0;
	        			 var oldnum=0;
	        			 var custOrderList = OrderInfo.reloadOrderInfo.orderList.custOrderList[0].busiOrder;	
	        			 for(var i=0;i<custOrderList.length;i++){
	        				 //新装 
	        				 if(custOrderList[i].boActionType.actionClassCd=="1300" && custOrderList[i].boActionType.boActionTypeCd=="1" && custOrderList[i].busiObj.instId!="-1"){
	        					 newnum++;
	        				 }
	        				 //纳入老用户 
	        				 if(custOrderList[i].boActionType.actionClassCd=="1200" && custOrderList[i].boActionType.boActionTypeCd=="S2" && custOrderList[i].busiObj.offerTypeCd=="1"){
	        					 oldnum++;
	        					
	        				 }
	        				
	        			 }
	        			 _confirmSub(newnum,oldnum,offerSpec);
	        			 
	        		 }
	        		 else{
	        			 _opeSerSub(param);  
	        		 }
	        		
	        		
	        	}
	        	else{
	        		order.service.opeSer(param);   
	        	}
	        	
	        }
		}
	};
	
	
	//获取销售品构成，并选择数量  --新装
	var _opeSerSub = function(inParam){
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		var newSubPhoneNumsize=[];
		var oldSubPhoneNumsize=[];
	
		if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=null && OrderInfo.newOrderNumInfo.oldSubPhoneNum!=""){
			newSubPhoneNumsize = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
		}
		if(OrderInfo.newOrderNumInfo.oldSubPhoneNum!=null && OrderInfo.newOrderNumInfo.oldSubPhoneNum!=""){
			oldSubPhoneNumsize = OrderInfo.newOrderNumInfo.oldSubPhoneNum.split(",");
		}
		var iflag = 1; //判断是否弹出副卡选择框 false为不选择
		var htmlStr='<div id="dlg-memberRole-num" data-role="popup" data-transition="slideup" data-corners="false" data-overlay-theme="b" class="popwindow" data-dismissible="false">'+
		'<div data-role="header" data-position="inline" data-tap-toggle="false" data-theme="t">'+
			'<a href="#" data-role="button" data-icon="back" data-rel="back" data-iconpos="notext" class="ui-btn-right">返回</a>'+
			'<h1>'+OrderInfo.offerSpec.offerSpecName+'</h1>'+
		'</div>';
		var $con=$('<div></div>');
		var $content=$('<div style="height: 400px;" data-role="content"></div>');
		var $ul=$('<ul id="ul1" data-role="listview" class="develist"></ul>'); 
		var max=0;
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
				if(objInsterId==""){
					objInsterId=objInstId;
				}
				if(this.objType == CONST.OBJ_TYPE.PROD){
					if(offerRole.minQty == 0){ //加装角色
						this.minQty = 0;
						this.dfQty = 0;
					}
					if(OrderInfo.provinceInfo.reloadFlag=="N"&&offerRole.memberRoleCd=="401"){
						this.dfQty = OrderInfo.reloadProdInfo.cardNum;
					}
					 max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
					//新装判断是否有传主副卡信息
					if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""&&offerRole.memberRoleCd=="401"){
						var subPhoneNums = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
						var nums = subPhoneNums.length;
						if(nums>max){
							$.alert("规则限制","newSubPhoneNum的角色成员数量总和不能超过"+max);
							errorflag = false;
							return false;
						}
						/*
						this.dfQty = nums;
						this.minQty = nums;
						this.maxQty = nums;
						max = nums;
						*/
					}
					
					/*
					if(OrderInfo.newOrderNumInfo.mainPhoneNum!=""&&OrderInfo.newOrderNumInfo.newSubPhoneNum==""&&offerRole.memberRoleCd=="401"){
						this.maxQty = 0;
						max = 0;
					}
					*/
					var $li=$('<li></li>');
					var $dl= $('<dl></dl>');
					$dl.append("<dd></dd><dd><span style='color: #5a9203;'>"+offerRole.offerRoleName+" :</span>"+this.objName+" :</dd>"+
							"<dd><div class='ui-grid-b addnum'> <div class='ui-block-a' align='center'>" +
							"<a class='abtn01' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'>-</a></div>"+
							"<div class='ui-block-b'><input id='"+objInstId+"' type='text' value='"+this.dfQty+"' style='width:22px' readonly='readonly'></div>"+
							"<div class='ui-block-c' align='center'><a class='abtn01'  href='javascript:order.service.addNum(\""+objInstId+"\","+this.maxQty+",\""+offerRole.parentOfferRoleId+"\");'>+</a></div>"+
							"</div></dd><dd>"+this.minQty+"-"+max+"（张） </dd>");	
					$li.append($dl);
					$ul.append($li);
					iflag++;
				}
			});
		});
		
		//老成员
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
		 if(offerRole.memberRoleCd != CONST.MEMBER_ROLE_CD.MAIN_CARD){
		$.each(this.roleObjs,function(){
			var offerRole = this;
			if(this.objType == CONST.OBJ_TYPE.PROD){
				if(OrderInfo.provinceInfo.reloadFlag=="N"&&offerRole.memberRoleCd=="401"){
					this.dfQty = OrderInfo.reloadProdInfo.cardNum;
				}
				var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
				if(max>0){
				if(newSubPhoneNumsize.length==0 && oldSubPhoneNumsize.length==0){							
					var $li=$('<li id="li'+idnum+'"></li>');
					var $dl= $('<dl></dl>');
					var str="<dd></dd>";
					str+="<dd><span style='color: #5a9203;'>已有移动电话 :</span>移动电话（仅含本地语音） :</dd>"
					str += "<dd style=\"width:150px;\">";
					str += "";									
					str += "";
					str += "</div>";
					str += "<div class=\"\">";
					str += "<input  name=\"oldphonenum\" type=\"text\" id=\"oldphonenum_1\">";
					str += "</div>";
					str += "<div class=\"\">";
					str+="</dd>";
					str+="<dd>"
					str += "<button data-mini=\"ture\" onclick=\"order.service.addLi("+max+")\">+</button>";
					str += "</div>";
					str += "<div class=\"ui-block-d\">";
					str += "</div>";								
					str += "</div>";
					str += "</div></dd>";				
					$dl.append(str);
					$li.append($dl);
					$ul.append($li);
				}
				else if(oldSubPhoneNumsize.length>max){
					$.alert("规则限制","oldSubPhoneNum的角色成员数量总和不能超过"+max);
					errorflag = false;
					return false;
				}
				else{
					for(var k=0;k<oldSubPhoneNumsize.length;k++){
						var id="li"+idnum;
						var $li=$('<li id="'+id+'"></li>');
						var $dl= $('<dl></dl>');
						var str="<dd></dd>";
						str+="<dd><span style='color: #5a9203;'>已有移动电话 :</span>移动电话（仅含本地语音） :</dd>"
						str += "<dd style=\"width:150px;\">";
						str += "";									
						str += "";
						str += "</div>";
						str += "<div class=\"\">";
						str += "<input type=\"text\" value=\""+oldSubPhoneNumsize[k]+"\" name=\"oldphonenum\" id=\"oldphonenum_1\" readonly=\"readonly\">";
						str += "</div>";
						str += "<div class=\"\">";
						str+="</dd>";
						str+="<dd>"
						//str += "<button data-mini=\"ture\" onclick=\"order.uiCusts.delLi("+idnum+")\">-</button>";
						str += "</div>";
						str += "<div class=\"ui-block-d\">";
						str += "</div>";								
						str += "</div>";
						str += "</div></dd>";				
						$dl.append(str);
						$li.append($dl);
						$ul.append($li);
						$.jqmRefresh($("#dlg-memberRole-num"));
					}
				}
			 }
			}
			
		});
		 }
		});
		
		var foot=' <div data-role="footer" data-position="inline" data-tap-toggle="false" data-theme="n">'+
     	'<button id="memberRoleNumConfirm"  data-inline="true"  data-icon="check">确认</button>'+
		'<button id="memberRoleNumCancel"  data-inline="true" data-icon="back">取消</button>'+
		'</div>';
		$content.append($ul);
		$content.append(foot);
		$con.append($content);
		//$con.append(foot);
		htmlStr+=$con.html()+"</div>";
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(iflag >=1){
			 if(OrderInfo.provinceInfo.reloadFlag=="N"){
				 var popup = $.popup("#dlg-memberRole-num",htmlStr,{
					    width:800,
						height:450,
						contentHeight:400,
						afterClose:function(){}
					});
				 $("#dlg-memberRole-num").css("display","none");
				 $("#dlg-memberRole-num").popup("close");
				// $("#dlg-memberRole-num").popup("close");
				// order.service.confirm(param);
			 }else{
					var popup = $.popup("#dlg-memberRole-num",htmlStr,{
						width:800,
						height:450,
						contentHeight:400,
						afterClose:function(){}
					});
					
				
				
				
				if(OrderInfo.provinceInfo.prodOfferId!=""){
					$("#memberRoleNumCancel").css("display","none");
				}else{
					$("#memberRoleNumCancel").off("click").on("tap",function(){
						$("#dlg-memberRole-num").popup("close");
					});
				}
				$("#memberRoleNumConfirm").off("tap").on("tap",function(){
					var newnum=$("#"+objInsterId).val();
				    newnum=newnum*1;
				    var oldnum=0;
				    $("input[name='oldphonenum']").each(function(){
						if(this.value!=null && this.value!="" && this.value.length==11){
							oldnum+=1;
						}
					});
				    if((newnum+oldnum)>max){
						$.alert("提示","新装副卡和纳入老成员数量超过最大值"+max);
						return
					}
					
					$("#dlg-memberRole-num").popup("close");
                          _confirmSub(newnum,oldnum,offerSpec);
				});
			 }
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};
	var _delLi=function (id){
		id="li"+id;
		$("ul li[id="+id+"]").remove();
		 choosenum --;//纳入老用户数量
		 idnum --;
		//$.jqmRefresh($("#dlg-memberRole-num"));
	};
	//动态添加一个li
	var _addLi=function (max){
		if(choosenum>=max){
			return;
		}
		idnum++;
		choosenum++;
		var id="li"+idnum;
		var $li=$('<li class="ui-li-static ui-body-inherit ui-last-child" id="'+id+'"></li>');
		var $dl= $('<dl></dl>');
		var str="<dd></dd>";
		str+="<dd><span style='color: #5a9203;'>已有移动电话 :</span>移动电话（仅含本地语音） :</dd>"
		str += "<dd style=\"width:150px;\">";
		str += "";									
		str += "";
		str += "</div>";
		str += "<div class=\"\">";
		str += "<input name=\"oldphonenum\" type=\"text\" id=\"oldphonenum_"+idnum+"\">";
		str += "</div>";
		str += "<div class=\"\">";
		str+="</dd>";
		str+="<dd>"
		str += "<button data-mini=\"ture\" onclick=\"order.service.delLi("+idnum+")\">-</button>";
		str += "</div>";
		str += "<div class=\"ui-block-d\">";
		str += "</div>";								
		str += "</div>";
		str += "</div></dd>";				
		$dl.append(str);
		$li.append($dl);
		$("#ul1").append($li);
		
		$.jqmRefresh($("#dlg-memberRole-num"));
	};
	//获取销售品构成，并选择数量
	var _opeSer = function(inParam){
		var param = {
			offerSpecId : inParam.specId,
			offerTypeCd : 1,
			partyId: OrderInfo.cust.custId
		};
		var offerSpec = query.offer.queryMainOfferSpec(param); //查询主销售品构成
		if(!offerSpec){
			return;
		}
		if(OrderInfo.actionFlag == 2){ //套餐变更
			var url=contextPath+"/order/queryFeeType";
			$.ecOverlay("<strong>正在查询是否判断付费类型的服务中,请稍后....</strong>");
			var response = $.callServiceAsJsonGet(url,param);	
			$.unecOverlay();
			if (response.code==0) {
				if(response.data!=undefined){
					if("0"==response.data){
						var is_same_feeType=false;
						if(order.prodModify.choosedProdInfo.feeType=="2100" && (offerSpec.feeType=="2100"||offerSpec.feeType=="3100"||offerSpec.feeType=="3101"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//预付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1200" && (offerSpec.feeType=="1200"||offerSpec.feeType=="3100"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103"||offerSpec.feeType=="1202"||offerSpec.feeType=="2101")){
							is_same_feeType=true;//后付费
						}else if(order.prodModify.choosedProdInfo.feeType=="1201" && (offerSpec.feeType=="1201"||offerSpec.feeType=="3101"||offerSpec.feeType=="3102"||offerSpec.feeType=="3103")){
							is_same_feeType=true;//准实时预付费
						}
						if(!is_same_feeType){
							$.alert("提示","付费类型不一致,无法进行套餐变更。");
							return;
						}
					}
				}
			}
			offerChange.offerChangeView();
			return;
		}
		var iflag = 0; //判断是否弹出副卡选择框 false为不选择
		var htmlStr='<div id="dlg-memberRole-num" data-role="popup" data-transition="slideup" data-corners="false" data-overlay-theme="b" class="popwindow" data-dismissible="false">'+
		'<div data-role="header" data-position="inline" data-tap-toggle="false" data-theme="t">'+
			'<a href="#" data-role="button" data-icon="back" data-rel="back" data-iconpos="notext" class="ui-btn-right">返回</a>'+
			'<h1>'+OrderInfo.offerSpec.offerSpecName+'</h1>'+
		'</div>';
		var $con=$('<div></div>');
		var $content=$('<div data-role="content"></div>');
		var $ul=$('<ul data-role="listview" class="develist"></ul'); 
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			$.each(this.roleObjs,function(){
				var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
				if(this.objType == CONST.OBJ_TYPE.PROD){
					if(offerRole.minQty == 0){ //加装角色
						this.minQty = 0;
						this.dfQty = 0;
					}
					if(OrderInfo.provinceInfo.reloadFlag=="N"&&offerRole.memberRoleCd=="401"){
						this.dfQty = OrderInfo.reloadProdInfo.cardNum;
					}
					var max = this.maxQty<0?"不限制":this.maxQty;//主卡的最大数量
					//新装判断是否有传主副卡信息
					if(OrderInfo.newOrderNumInfo.newSubPhoneNum!=""&&offerRole.memberRoleCd=="401"){
						var subPhoneNums = OrderInfo.newOrderNumInfo.newSubPhoneNum.split(",");
						var nums = subPhoneNums.length;
						this.dfQty = nums;
						this.minQty = nums;
						this.maxQty = nums;
						max = nums;
					}
					if(OrderInfo.newOrderNumInfo.mainPhoneNum!=""&&OrderInfo.newOrderNumInfo.newSubPhoneNum==""&&offerRole.memberRoleCd=="401"){
						this.maxQty = 0;
						max = 0;
					}
					var $li=$('<li></li>');
					var $dl= $('<dl></dl>');
					$dl.append("<dd></dd><dd><span style='color: #5a9203;'>"+offerRole.offerRoleName+" :</span>"+this.objName+" :</dd>"+
							"<dd><div class='ui-grid-b addnum'> <div class='ui-block-a' align='center'>" +
							"<a class='abtn01' href='javascript:order.service.subNum(\""+objInstId+"\","+this.minQty+");'>-</a></div>"+
							"<div class='ui-block-b'><input id='"+objInstId+"' type='text' value='"+this.dfQty+"' style='width:22px' readonly='readonly'></div>"+
							"<div class='ui-block-c' align='center'><a class='abtn01'  href='javascript:order.service.addNum(\""+objInstId+"\","+this.maxQty+",\""+offerRole.parentOfferRoleId+"\");'>+</a></div>"+
							"</div></dd><dd>"+this.minQty+"-"+max+"（张） </dd>");	
					$li.append($dl);
					$ul.append($li);
					iflag++;
				}
			});
		});
		/*var foot='<div class="ui-grid-c"><div class="ui-block-a">&nbsp;</div><div class="ui-block-b">&nbsp;</div>'+
     	'<div class="ui-block-c"><button id="memberRoleNumConfirm" data-theme="g" data-inline="true"  data-icon="check">确认</button></div>'+
		'<div class="ui-block-d"><button id="memberRoleNumCancel" data-theme="g" data-inline="true" data-icon="back">取消</button></div>'+
		'</div>;*/
		var foot=' <div data-role="footer" data-position="inline" data-tap-toggle="false" data-theme="n">'+
     	'<button id="memberRoleNumConfirm"  data-inline="true"  data-icon="check">确认</button>'+
		'<button id="memberRoleNumCancel"  data-inline="true" data-icon="back">取消</button>'+
		'</div>';
		$content.append($ul);
		$content.append(foot);
		$con.append($content);
		//$con.append(foot);
		htmlStr+=$con.html()+"</div>";
		//页面初始化参数
		var param = {
			"boActionTypeCd" : "S1" ,
			"boActionTypeName" : "订购",
			"offerSpec" : offerSpec,
			"actionFlag" :1,
			"type" : 1
		};
		if(iflag >1){
			 if(OrderInfo.provinceInfo.reloadFlag=="N"){
				 var popup = $.popup("#dlg-memberRole-num",htmlStr,{
						width:720,
						height:250,
						contentHeight:250,
						afterClose:function(){}
					});
				 $("#dlg-memberRole-num").css("display","none");
				 $("#dlg-memberRole-num").popup("close");
				 $("#dlg-memberRole-num").popup("close");
				 order.service.confirm(param);
			 }else{
					var popup = $.popup("#dlg-memberRole-num",htmlStr,{
						width:720,
						height:250,
						contentHeight:250,
						afterClose:function(){}
					});
				if(OrderInfo.provinceInfo.prodOfferId!=""){
					$("#memberRoleNumCancel").css("display","none");
				}else{
					$("#memberRoleNumCancel").off("click").on("tap",function(){
						$("#dlg-memberRole-num").popup("close");
						$("#dlg-memberRole-num").popup("close");
					});
				}
				$("#memberRoleNumConfirm").off("tap").on("tap",function(){
					$("#dlg-memberRole-num").popup("close");
					$("#dlg-memberRole-num").popup("close");
					order.service.confirm(param);
				});
			 }
			
		}else{
			if(!_setOfferSpec(1)){
				$.alert("错误提示","请选择一个接入产品");
				return;
			}
			if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
				order.main.buildMainView(param);	
			}
		}
	};
	
	//选择完主套餐构成后确认
	var _confirm = function(param){
		if(!_setOfferSpec()){
			$.alert("错误提示","请选择一个接入产品");
			return;
		}
		if(OrderInfo.actionFlag!=14){ //合约套餐不初始化
			order.main.buildMainView(param);	
		}
		$("#dlg-memberRole-num").popup("close");
	};
	
	//新装选择完主套餐构成后确认
	var _confirmSub = function(newnum,oldnum,offerSpec){
		var param = {
				"boActionTypeCd" : "S1" ,
				"boActionTypeName" : "订购",
				"offerSpec" : offerSpec,
				"actionFlag" :1,
				"type" : 1,
				"oldnum":oldnum
			};
		OrderInfo.oldprodInstInfos = [];
		OrderInfo.oldofferSpec = [];
		OrderInfo.oldoffer = [];
		OrderInfo.oldAddNumList = [];
		order.memberChange.viceCartNum = 0;
		var delprodInsts = [];
		
		if(!_setOfferSpec("",newnum)){
			$.alert("错误提示","请选择一个接入产品");
			return;
		}
           if(oldnum>0){
        	
        	order.memberChange.idnum=oldnum;
			offerChange.oldMemberFlag = true;
			order.memberChange.oldMemberFlag=true;
			if(!order.memberChange.queryofferinfoSub()){
				return;
			}
			
		}
        if(oldnum>0){
   			param.oldprodInstInfos = OrderInfo.oldprodInstInfos;
   			param.oldofferSpec = OrderInfo.oldofferSpec;
   			param.oldoffer = OrderInfo.oldoffer;
   		}
		if(OrderInfo.actionFlag==1){ //合约套餐不初始化
			order.main.buildMainView(param);	
		}
		$("#dlg-memberRole-num").popup("close");
	};
	
	
	//根据页面选择成员数量保存销售品规格构成 offerType为1是单产品
	var _setOfferSpec = function(offerType,newnum){
		var k = -1;
		var flag = false;  //判断是否选接入产品
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			var offerRole = this;
			if(offerRole.prodInsts==undefined){
				offerRole.prodInsts = [];
			}
			$.each(this.roleObjs,function(){
				if(this.objType== CONST.OBJ_TYPE.PROD){  //接入类产品
					var num = 0;  //接入类产品数量选择
					if(offerType==1){  //单产品
						num = 1;
					}else if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD && OrderInfo.actionFlag!=2){//主卡的接入类产品数量
						num = 1;
					}else{ //多成员销售品
						if(OrderInfo.actionFlag==1 && OrderInfo.provinceInfo.reloadFlag=="N"){
							num=newnum;
						}
						else{
							num = $("#"+offerRole.offerRoleId+"_"+this.objId).val();  //接入类产品数量选择
						}
						
					}
					if(num==undefined || num==""){
						num = 0;
					}
					for ( var i = 0; i < num; i++) {
						var newObject = jQuery.extend(true, {}, this); 
						newObject.prodInstId = k--;
						if(num>1){ //同一个规格产品选择多个
							newObject.offerRoleName = offerRole.offerRoleName+(i+1);
						}else{
							newObject.offerRoleName = offerRole.offerRoleName;
						}
						newObject.memberRoleCd = offerRole.memberRoleCd;
						offerRole.prodInsts.push(newObject);   
						flag = true;
					}
					offerRole.selQty = num;
				}else{ //功能类产品
					if(this.minQty==0){
						this.dfQty = 1;
					}
				}
			});
		});
		return flag;
	};
	
	//添加一个角色
	var _addNum = function(id,max,parentOfferRoleId){
		if(ec.util.isObj(parentOfferRoleId)){
			var viceNum = 0;
			var offerRoles = [];
			var parentMaxQty = 0;
			$.each(OrderInfo.offerSpec.offerRoles,function(){
				var offerRole = this;
				$.each(this.roleObjs,function(){
					if(this.objType == CONST.OBJ_TYPE.PROD){
						var objInstId = offerRole.offerRoleId+"_"+this.objId;//角色id+产品规格id
						if(ec.util.isObj(offerRole.parentOfferRoleId) && parentOfferRoleId==offerRole.parentOfferRoleId){
							offerRoles.push(offerRole);
							parentMaxQty = offerRole.parentMaxQty;
							viceNum += Number($("#"+objInstId).val());
						}
					}
				});
			});
			if(parentMaxQty>0){
				if(viceNum >= parentMaxQty){
					if(ec.util.isArray(offerRoles)){
						var str = "【";
						for ( var i = 0; i < offerRoles.length; i++) {
							var offerRole = offerRoles[i];
							str += offerRole.offerRoleName+",";
						}
						str = str.substr(0, str.lastIndexOf(','));
						str += "】角色成员数量总和不能超过"+parentMaxQty;
						$.alert("规则限制",str);
						return;
					}
				}
			}
		}
		var num = Number($("#"+id).val());
		if(max<0){
			num+=1;
			$("#"+id).val(num);
		}else{
			if(num<max){
				num+=1;
				$("#"+id).val(num);
			}
		}		
	};
	
	var _subNum = function(id,min){
		var num = Number($("#"+id).val());
		if(num>min){
			num-=1;
			$("#"+id).val(num);
		}		
	};
	
	//订单取消时，释放已预占资源的入口标识。0：初始化状态，1：购机或选号入口，2：套餐入口
	var _releaseFlag = 0;
	//购机和选号入口的预占号码信息缓存
	var _boProdAn = {};
	var _offerDialog=function(subPage){
		var param={};
		var url=contextPath+"/order/prodoffer/prepare?subPage="+subPage;
		$.callServiceAsHtmlGet(url,param,{
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
				var content$=$("#offerspecContent");
				content$.html(response.data);
				order.prepare.backToInit();
				_initSpec();
				order.prodOffer.queryApConfig();
				order.service.searchPack();
				$("#chooseofferspecclose").click(function(){
					_closeChooseDialog();
				});
				easyDialog.open({
					container : 'chooseofferspec'
				});
			}
		});	
	};
	var _closeChooseDialog = function() {
		if (!$("#chooseofferspec").is(":hidden")){
			easyDialog.close();
		}
	};
	var _choosedOffer=function(id,specId,price,subpage,specName){
		var param={"offerSpecId":specId};
		var response = $.callServiceAsJson(contextPath+"/order/queryOfferSpec",param);
		if (response.code==0) {
			if(response.data){
				var offerRoleId="";
				var prodOfferSpec=response.data.offerSpec;
				if (prodOfferSpec && prodOfferSpec.offerRoles) {
					var offerRoles = prodOfferSpec.offerRoles;
					for (var i=0;i<offerRoles.length;i++){
						if (offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD
								|| offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.VICE_CARD) {
							if(offerRoles[i].memberRoleCd == CONST.MEMBER_ROLE_CD.MAIN_CARD){
								offerRoleId=offerRoles[i].offerRoleId;
								break;
							}
						}else{
							offerRoleId=offerRoles[i].offerRoleId;
							break;
						}
					}
				}
				if(offerRoleId!=""){
					_closeChooseDialog();
					order.prodModify.chooseOfferForMember(specId,subpage,specName,offerRoleId);
				}else{
					$.alert("提示","无法选择套餐，套餐规格查询失败！");
				}
			}
		}else if(response.code == -2){
			$.alertM(response.data);
		}else{
			$.alert("提示","套餐详细加载失败，请稍后再试！");
		}
	};
	return {
		searchPack	:_searchPack,
		queryPackForTerm:_queryPackForTerm,
		addNum:_addNum,
		subNum:_subNum,
		opeSer : _opeSer,
		buyService :_buyService,
		releaseFlag:_releaseFlag,
		boProdAn:_boProdAn,
		offerprice:_offerprice,
		searchPackById:_searchPackById,
		offerDialog:_offerDialog,
		choosedOffer:_choosedOffer,
		setOfferSpec:_setOfferSpec,
		confirm		: _confirm,
		queryData:_queryData,
		scroll:_scroll,
		addLi:_addLi,
		delLi:_delLi
	};
})();

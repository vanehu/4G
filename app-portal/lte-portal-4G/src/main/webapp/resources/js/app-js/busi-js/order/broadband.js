/**
 * 对缓存数据操作
 * 
 *
 * date 2014-01-15
 */

CommonUtils.regNamespace("order", "broadband");

order.broadband = (function(){
	
	var _ResInfoList = [];
	
	var _ProdOfferInfo = [];
	
	var _feeInfos = [];
	
	var _chargeItems = [];
	
	var _print_chargeItems = [];
	
	var DstSysID = "";
	
	var payType;
	
	var ysfy = 0;//总应收费用
	
	var ssfy = 0;//总实收费用
	
	var upRange = []//上行速率
	
	var dwRange = [];//下行速率
	
	var _alldownRateList = [];//套餐速率
	
	var _myFlag=false;//是否开启调用支付平台
	
	var _isNeedJbr=false;//是否要填写经办人
	
	var _isSameOne=true;//客户和经办人是否是同一人
	
	var _jbrPictureName;//经办人拍照照片名称
	
	var _canCallPhote=false;//经办人是否可以拍照
	
	var _haveCallPhote=false;//是否已经拍照
	
	var _resetId=false;//是否已重置订单ID
	
	var _isOldCust=false;//经办人是否老客户
	
	//地址查询
	var _searchADD = function(){
		var url = "/app/order/broadband/searchADD";
		var param = {};
		$.callServiceAsHtml(contextPath+url,param,{
			"before":function(){
				$.ecOverlay("正在努力加载中，请稍等...");
			},
			"done" : function(response){
				$.unecOverlay();
				OrderInfo.returnFlag = "add";
				$("#orderContent").hide();
				$("#searchADD").html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	}
	
	//客户定位页面
	var _cust = function(){
		if($("#prodName").val().length<1){
			$.alert("提示","请选择套餐！");
			return;
		}
//		if($("#upslList").val()=="" || $("#upslList").val()==null){
//			$.alert("提示","请选择 上行速率！");
//			return;
//		}
//		if($("#dwslList").val()=="" || $("#dwslList").val()==null){
//			$.alert("提示","请选择 下行速率！");
//			return;
//		}
		$("#orderContent").hide();
		$("#cust").show();
		OrderInfo.order.step = 2;
		$("#zy").removeClass("active");
		$("#zy_1").addClass("dis-none");
		$("#kh").addClass("active");
		$("#kh_1").removeClass("dis-none");
		//已定位 直接显示客户信息
		if(OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != ""){
			_showCust();
		}
	}
	
	//根据省份id获取市级
	var _getCity = function(obj) {
		$("#city").empty();
		$("#area").empty();
		var params = {
			"leve":3,
			"parentAreaId":$(obj).val(),
			"areaType":"/app/order/prodoffer/prepare",
			"isChannelArea" : "N"
		};
		var url=contextPath+"/app/orderQuery/commonRegionChilden";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					var cityList = response.data;
					if(cityList!=null && cityList.length>0){
						for(var i=0;i<cityList.length;i++){
							$("#city").append("<option value='"+cityList[i].commonRegionId+"' >"+cityList[i].regionName+"</option>");
						}
						_getArea($("#city"));
					}
				}else{
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
//		order.broadband.init_select();
	};
	
	//根据市id获取区级
	var _getArea = function(obj) {
		$("#area").empty();
		var params = {
			"leve":4,
			"parentAreaId":$(obj).val(),
			"areaType":"/app/order/prodoffer/prepare",
			"isChannelArea" : "N"
		};
		var url=contextPath+"/app/orderQuery/commonRegionChilden";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					var cityList = response.data;
					if(cityList!=null && cityList.length>0){
						for(var i=0;i<cityList.length;i++){
							$("#area").append("<option value='"+cityList[i].commonRegionId+"' >"+cityList[i].regionName+"</option>");
						}
					}
					order.broadband.init_select();
				}else{
					$.unecOverlay();
					$.alert("提示","查询失败，请稍后再试！");
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	};
	
	//搜索资源
	var _searchRes = function(prodType) {
		if(prodType!=undefined && prodType.length>0){
			prodType = "_" + prodType;
		}else{
			prodType = "";
		}
		if($.trim($("#resKey"+prodType).val()).length<1){
			$.alert("提示","请输入关键字进行搜索！");
			return false;
		}
		$("#resList"+prodType).empty();
		//MDA获取省份CRM系统编码
		var propertiesKey = "PROVCODE_"+$("#city"+prodType).val().substring(0,3);
	    var PROVCODE = offerChange.queryPortalProperties(propertiesKey);
	    if(PROVCODE!=undefined && PROVCODE.length>0){
	    	DstSysID = PROVCODE;
	    }
		var params = {
				"ContractRoot":{
					"SvcCont":{
//						"AddressName":"区",
						"PageSize":"50",
						"AddressName":$.trim($("#resKey"+prodType).val()),
						"RegionCode":$("#city"+prodType).val(),
						"RegionId":$("#area"+prodType).val()
//						"RegionCode":"8450100",//广西
//						"RegionId":"8450101"
//						"RegionCode":"8410100",//河南
//						"RegionId":"8410101"
//						"RegionCode":"8210100",//辽宁
//						"RegionId":"8210101"
					},
					"TcpCont":{
//						"AppKey":"1000000201",
						"DstSysID":DstSysID,
//						"DstSysID":"6003020001",//广西
//						"DstSysID":"6099040001",//河南
//						"DstSysID":"6099050001",//辽宁
//						"DstSysID":"6004020001",//贵州
						"Method":"qry.res.standaddress",
//						"ReqTime":"20130817200202123",
						"Sign":"123",
//						"TransActionID":"1000000201201112041000000011",
						"Version":"V1.0"
					}
				}

		};
		var url=contextPath+"/app/mktRes/standaddress";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
//					alert(JSON.stringify(response.data.result.AddressInfo));
					if("null"!=JSON.stringify(response.data.result)){
						var resList = response.data.result.AddressInfo;
						if(resList!=null && resList.length>0){
							for(var i=0;i<resList.length;i++){
								$("#resList"+prodType).append('<p><label style="border: none;"><input type="radio" name="address" id="'+resList[i].AddressId+'" RegionCode="'+resList[i].RegionCode+'" ExchId="'+resList[i].ExchId+'" ExchName="'+resList[i].ExchName+'" value="'+resList[i].DetailAddress+'">'+ resList[i].DetailAddress+'</label></p>');
							}
							$("#rescode"+prodType).modal("show");
						}else{
							$.alert("提示","没有查询到资源");
						}
					}
					else{
						$.alert("提示","没有查询到资源");
					}
				}else{
					$.unecOverlay();
					$.alertM(response.data);
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	};
	
	//资源预判
	var _rescapability = function(prodType) {
		if(prodType!=undefined && prodType.length>0){
			prodType = "_" + prodType;
		}else{
			prodType = "";
		}
		if($('#resList'+prodType+' input:radio[name=address]:checked').length<1){
			$.alert("提示","请选择一个资源地址！");
			return;
		}
		$("#jrfsList"+prodType).empty();
		$("#kdkxk"+prodType).hide();
		$("#AdFreeNum"+prodType).val("");
		$("#ghkxk"+prodType).hide();
		$("#PstnFreeNum"+prodType).val("");
		$("#PONsx"+prodType).hide();
		$("#IsPon"+prodType).val("");
		var params = {
				"ContractRoot":{
					"SvcCont":{
						"RegionCode":$('#resList'+prodType+' input:radio[name=address]:checked').attr("RegionCode"),
						"AddressId":$('#resList'+prodType+' input:radio[name=address]:checked').attr("id")
//						"RegionCode":"8450100",
//						"AddressId":"8450100"
//						"RegionCode":"8411400",
//						"AddressId":"99744458"
//						"RegionCode":"8210100",//辽宁
//						"AddressId":"1000000248454"
						
					},
					"TcpCont":{
//						"AppKey":"1000000201",
						"DstSysID":DstSysID,
//						"DstSysID":"6003020001",//广西
//						"DstSysID":"6099040001",//河南
//						"DstSysID":"6099050001",//辽宁
						"Method":"qry.res.rescapability",
						"Sign":"123",
						"Version":"V1.0"
					}
				}
		};
		var ExchId = $('#resList'+prodType+' input:radio[name=address]:checked').attr("ExchId")
		if(ExchId!=undefined && ExchId.length>0){
			params.ContractRoot.SvcCont.ExchId = ExchId;
		}
		var url=contextPath+"/app/mktRes/rescapability";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					if("null"!=JSON.stringify(response.data.result)){
						var resList = response.data.result.ResInfo;
						order.broadband.ResInfoList = resList;
//						alert(JSON.stringify(response.data.result.AddressInfo[0]));
						if(resList!=null && resList.length>0){
							for(var i=0;i<resList.length;i++){
								$("#jrfsList"+prodType).append("<option value='"+resList[i].AccessModeId+"' >"+resList[i].AccessModeName+"</option>");
							}
						}
						if(!_setSl($("#jrfsList"+prodType),prodType)){
							return;
						}
						$("#addressName"+prodType).val($('#resList'+prodType+' input:radio[name=address]:checked').val());
						$("#addressId"+prodType).val($('#resList'+prodType+' input:radio[name=address]:checked').attr("id"));
						$("#ExchId"+prodType).val($('#resList'+prodType+' input:radio[name=address]:checked').attr("ExchId"));
						$("#ExchName"+prodType).val($('#resList'+prodType+' input:radio[name=address]:checked').attr("ExchName"));
						OrderInfo.returnFlag = "";
						$("#dzbz"+prodType).show();
						$("#jrfs"+prodType).show();
//						$("#sl").show();
						$("#tcxz"+prodType).show();
						if(OrderInfo.actionFlag == 111){
							$("#orderContent").show();
						}else{
							$("#page-add"+prodType).show();
						}
						$("#searchADD"+prodType).hide();
					}
					else{
						$.alert("提示","没有查询到资源");
					}
				}else{
					$.unecOverlay();
					$.alertM(response.data);
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	};
	
	//加载速率
	var _setSl = function(obj,prodType) {
		if(prodType!=undefined && prodType.length>0){
//			prodType = "_" + prodType;
		}else{
			prodType = "";
		}
		$("#prodName"+prodType).val("");
		var List = order.broadband.ResInfoList;
		for(var i=0;i<List.length;i++){
			if(List[i].AccessModeId == $(obj).val()){
				if(OrderInfo.actionFlag == 111 || OrderInfo.actionFlag == 112){
					if(List[i].AdFreeNum != undefined){
//						if(parseInt(List[i].AdFreeNum) > 0){
							$("#kdkxk"+prodType).show();
							$("#AdFreeNum"+prodType).val(List[i].AdFreeNum);
//						}else if(parseInt(List[i].AdFreeNum) == 0){
//							$.alert("提示","该宽带资源空闲口为0！");
//							return false;
//						}
					}
				}
				if(List[i].Ispon != undefined && List[i].Ispon.length > 0){
					$("#PONsx"+prodType).show();
					$("#IsPon"+prodType).val(List[i].IsPon);
				}
				$("#jrfs_name"+prodType).val(List[i].AccessModeName);
				$("#AccessModeId"+prodType).val(List[i].AccessModeId);
				$("#TerminalId"+prodType).val(List[i].TerminalId);
				$("#MaxRate"+prodType).val(List[i].MaxRate);
				$("#ExchId"+prodType).val($('#resList'+prodType+' input:radio[name=address]:checked').attr("ExchId"));
				$("#ExchName"+prodType).val($('#resList'+prodType+' input:radio[name=address]:checked').attr("ExchName"));
//				$("#slList").append("<option value='"+List[i].MaxRate+"' >"+List[i].MaxRate+"</option>");
			}
		}
		order.broadband.init_select();
		return true;
	};
	//选择套餐
	var _searchProd = function(){
		var url = "/app/order/broadband/searchProd";
		var param = {
				"downRate":$("#MaxRate").val()
				};
		$.callServiceAsHtml(contextPath+url,param,{
			"before":function(){
				$.ecOverlay("正在努力加载中，请稍等...");
			},
			"done" : function(response){
				$.unecOverlay();
				OrderInfo.returnFlag = "tc";
				$("#orderContent").hide();
				$("#searchADD").hide();
				$("#searchProd").html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	}
	
	//套餐初始化
	var _initProd=function(){ 
		OrderInfo.order.step=1;
//		OrderInfo.busitypeflag=1;
		//获取初始化查询的条件
		order.service.queryApConfig();
		//初始化主套餐查询 
		order.service.searchPack();
	};
	
	//订购套餐
	var _buyService = function(obj,price) {
		order.broadband.ProdOfferInfo[0] = {
				"OfferProdRelInfo":[{"ProdInstId":"-1","RoleCd":$(obj).attr("compTypeCd"),"RoleName":""}],
				"ProdOfferInstId":"-1",
				"ProdOfferNbr":$(obj).attr("offerNbr")
				};
		OrderInfo.returnFlag = "";
		$("#orderContent").show();
		$("#upsl").show();
		$("#dwsl").show();
		$("#submite-box-1").show();
		$("#searchProd").hide();
		$("#prodName").val($(obj).attr("name"));
		$("#objId").val($(obj).attr("objId"));
		$("#prodId").val($(obj).attr("id"));
		$("#offerNbr").val($(obj).attr("offerNbr"));
		$("#prodNbr").val($(obj).attr("prodNbr"));
		$("#price").val(price);
		
//		param.areaId = OrderInfo.cust.areaId;
		var params = {
				"areaId" : OrderInfo.staff.areaId,
				"channelId" : OrderInfo.staff.channelId,
				"staffId" : OrderInfo.staff.staffId,
				"offerRoleId":$(obj).attr("roleCd"),
				"offerSpecId":$(obj).attr("id"),
				"prodSpecId":$(obj).attr("objId")
		};
		upRange = [];
		dwRange = [];
		var url= contextPath+"/app/prod/prodSpecParamQuery";
		$.callServiceAsJsonGet(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询产品属性中,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code==0) {
					if(response.data.result.prodSpecParams!=undefined){
						$("#upslList").empty();
						for(var k=0;k<response.data.result.prodSpecParams.length;k++){
							if(response.data.result.prodSpecParams[k].itemSpecId==10010130){
								upRange = response.data.result.prodSpecParams[k].valueRange
							}else if(response.data.result.prodSpecParams[k].itemSpecId==10010131){
								dwRange = response.data.result.prodSpecParams[k].valueRange
							}
						}
						for(var i=0;i<upRange.length;i++){
							$("#upslList").append("<option value='"+upRange[i].value+"' >"+upRange[i].text+"</option>");
						}
						order.broadband.init_select();
						
						$("#dwslList").empty();
						for(var i=0;i<dwRange.length;i++){
							var rlist = order.broadband.alldownRateList[$(obj).attr("index")];
							for(var j=0;j<rlist.length;j++){
								if(dwRange[i].text == "512K"){
									dwRange[i].text = "0.5M"
								}
								if(dwRange[i].text.replace("M","") == rlist[j].rateRelVal){
									$("#dwslList").append("<option value='"+dwRange[i].value+"' >"+dwRange[i].text+"</option>");
								}
							}
						}
						order.broadband.init_select();
					}
				}else{
					$.alertM(response.data);
				}
			},
			"always":function(){
				$.unecOverlay();
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询产品属性失败,稍后重试");
			}
		});
	};
	
	//订单确认
	var _confirm = function() {
		order.broadband.haveCallPhote=false;
		order.broadband.resetId=false;
		if(OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != ""){
			var kdobjid = $("#objId").val();
			var tcprodId = $("#prodId").val();
			if($("#prodName").val().length==0){
				kdobjid = "-11111111111";
				tcprodId = "-11111111111";
			}
			var url = "/app/order/broadband/confirm";
			var param = {"objectInfos": [
			                             {
			                                 "boActionType": "1",
			                                 "objId": kdobjid,//100101000003,
			                                 "objType": 2
			                             },
			                             {
			                                 "boActionType": "S1",
			                                 "objId": tcprodId,
			                                 "objType": 7
			                             }
			                         ]};
			$.callServiceAsHtml(contextPath+url,param,{
				"before":function(){
					$.ecOverlay("正在努力加载中，请稍等...");
				},
				"done" : function(response){
					$.unecOverlay();
					OrderInfo.order.step = 3;
					$("#orderContent").hide();
					$("#searchADD").hide();
					$("#searchProd").hide();
					$("#cust").hide();
//					$("#confirm").show();
					$("#confirm").html(response.data).show();
					
					$("#kh").removeClass("active");
					$("#kh_1").addClass("dis-none");
					$("#jd").addClass("active");
					$("#jd_1").removeClass("dis-none");
					
					$("#prod_confirm").text($("#prodName").val());
					$("#jrfs_confirm").text($("#jrfs_name").val());
					$("#sl_confirm").text($("#slList").val()+"M");
//					alert(JSON.stringify(OrderInfo.cust));
					if(OrderInfo.cust.custId == -1){
						$("#userName").val(OrderInfo.cust.custOther1.contactName);
						$("#userPhone").val(OrderInfo.cust.custOther1.mobilePhone);
					}else{
						if(OrderInfo.cust.contactInfos[0].contactName != undefined && OrderInfo.cust.contactInfos[0].contactName != ""){
							$("#userName").val(OrderInfo.cust.contactInfos[0].contactName);
						}
						if(OrderInfo.cust.contactInfos[0].contactMobilePhone != undefined && OrderInfo.cust.contactInfos[0].contactMobilePhone != ""){
							$("#userPhone").val(OrderInfo.cust.contactInfos[0].contactMobilePhone);
						}
					}
				},fail:function(response){
					$.unecOverlay();
					$.alert("提示","费用信息查询失败，请稍后再试！");
				}
			});
		}else{
			$.alert("提示","请完成客户定位！");
		}
	};
	
	var _searchMd = function(obj){
		$("#map").empty();
		$("#mdName").hide();
		if($(obj).val()==1){
			$("#mdName").hide();
			_showMap("1");
		}else if($(obj).val()==2){
			$("#mdName").hide();
			_showMap("2");
		}else if($(obj).val()==3){
			$("#mdName").show();
		}
	}
	
	//选择套餐
	var _selectYYT = function(){
		$("#map").empty();
		var url = "/app/order/broadband/selectYYT";
		var param = {"enter":1};
		$.callServiceAsHtml(contextPath+url,param,{
			"before":function(){
				$.ecOverlay("正在努力加载中，请稍等...");
			},
			"done" : function(response){
				$.unecOverlay();
				OrderInfo.returnFlag = "yyt";
				$("#confirm").hide();
				$("#selectYYT").html(response.data).show();
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
	}
	
	//地图展示
	var _showMap = function(enter) {
		$("#map").empty();
			var url = "/app/order/broadband/baiduMap";
			var param = {"enter":enter};
			param.channelClass = "10";
			param.sysId = "1";
			if(enter == "1"){//根据坐标定位门店
				$.ecOverlay("正在努力加载中，请稍等...");
				var geolocation = new BMap.Geolocation();
				geolocation.getCurrentPosition(function(r){
					if(this.getStatus() == BMAP_STATUS_SUCCESS){
						param.longitude = r.point.lng;
						param.latitude = r.point.lat;
						param.radius = "500";
						$.callServiceAsHtml(contextPath+url,param,{
							"before":function(){
//								$.ecOverlay("正在努力加载中，请稍等...");
							},
							"done" : function(response){
								$.unecOverlay();
								$("#map").html(response.data).show();
								$.refresh(map);
							},fail:function(response){
								$.unecOverlay();
								$.alert("提示","查询失败，请稍后再试！");
							}
						});
//						alert('您的位置：'+r.point.lng+','+r.point.lat);
					}
					else {
						alert('failed'+this.getStatus());
					}        
				})
			}else if(enter == "3"){//根据名称模糊搜索定位门店
				param.queryType = "1";
				param.queryValue = $("#queryValue").val()
				$.callServiceAsHtml(contextPath+url,param,{
					"before":function(){
						$.ecOverlay("正在努力加载中，请稍等...");
					},
					"done" : function(response){
						$.unecOverlay();
						$("#map").html(response.data).show();
						$("#MD").modal("show");
					},fail:function(response){
						$.unecOverlay();
						$.alert("提示","查询失败，请稍后再试！");
					}
				});
			}else if(enter == "2"){//根据当前渠道位置定位门店
				$.ecOverlay("正在努力加载中，请稍等...");
				param.radius = "500";
				var geolocation = new BMap.Geolocation();
				geolocation.getCurrentPosition(function(r){
					if(this.getStatus() == BMAP_STATUS_SUCCESS){
						param.longitude = r.point.lng;
						param.latitude = r.point.lat;
//						alert(param.longitude);
						$.callServiceAsHtml(contextPath+url,param,{
							"before":function(){
//								$.ecOverlay("正在努力加载中，请稍等...");
							},
							"done" : function(response){
								$.unecOverlay();
								$("#map").html(response.data).show();
								$.refresh(map);
							},fail:function(response){
								$.unecOverlay();
								$.alert("提示","查询失败，请稍后再试！");
							}
						});
//						alert('您的位置：'+r.point.lng+','+r.point.lat);
					}
					else {
						alert('failed'+this.getStatus());
					}        
				})
			}
	};
	
	//关闭地图
	var _closeMap = function(type) {
		if(type==3){
			$("#MDname").val($('input:radio[name=MDradio]:checked').attr("channelName"));
			$("#MDId").val($('input:radio[name=MDradio]:checked').attr("id"));
			$("#MDadd").val($('input:radio[name=MDradio]:checked').val());
		}else{
			$("#MDId").val($("#channelId").text());
			$("#MDname").val($("#channelName").text());
			$("#MDadd").val($("#address").text());
		}
		OrderInfo.returnFlag = "";
		$("#confirm").show();
		$("#selectYYT").hide();
	};
	
	//回执
	var _printVoucher = function() {
		if(!_submitParam()){
			return ;
		}
		var prtprodId = $("#prodId").val();
		if($("#prodName").val().length==0){
			prtprodId = "-1111111111";
		}
		var params = {
			"offerSpecId":prtprodId
		};
		var CertNumber = "";
		if(OrderInfo.cust.custId == -1){
			CertNumber = OrderInfo.cust.identityNum;
		}else CertNumber = OrderInfo.cust.idCardNumber;
		
//		var voucherInfo = {
//				"olId":"700000995719",
//				"soNbr":"1472177241927685",
//				"busiType":"1",
//				"chargeItems":[{"realAmount":"3000","feeAmount":"3000","paymentAmount":"3000","acctItemTypeId":"2014000","objId":"235010000","objType":"2","acctItemId":"700000567982","boId":"700007289964","prodId":"700019420660","objInstId":"700019420660","terminalNo":"","posSeriaNbr":"","remark":"","boActionType":"1"}],
//				"areaId":"8510101",
//				"custName":"张强富"
//			};
		
//		var voucherInfo = {
//				"result":{
//					"advInfos":[
//						"一号通行：您的天翼手机号码就是天翼宽带（4G/3G、WiFi、有线）帐号、也是189邮箱帐号、易信帐号，可上网、登录网掌厅、使用翼支付等功能。易信客户端下载：通过天翼空间、苹果商店、易信网站（yixin.im）等下载。",
//						"WiFi时长卡：中国电信WiFi网络标识“ChinaNet”，使用WiFi客户端，购买WiFi时长卡，快捷WiFi上网。客户端下载：通过天翼空间、苹果商店等搜索“天翼WiFi”。"
////						"电子帐单：将按月发送到您的189邮箱，邮箱帐号：手机号@189.cn，初始密码将通过短信发送给您，如忘记密码，请使用189邮箱手机客户端重新设置密码。客户端下载：通过天翼空间、苹果商店搜索“189邮箱”。",
////						"适用于流量当月不清零服务的月套餐、包月流量包及按月促销赠送的流量，当月未使用完的可结转至次月使用，次月仍未使用完的不再结转。转赠流量不可结转。套餐变更、用户过户、销户、携号转网当月，原套餐内剩余流量不结转；退订可选包当月、促销到期当月，剩余流量不结转；欠费停机、停机保号、挂失、因故强制停机时，套餐月费未成功扣交费的，剩余流量不结转。每月初上月结转流量到帐后，同类流量优先扣减结转流量，后扣减当月流量。"
//					],
//					"custInfo":{
//						"norCustInfo":[
//							{
//								"itemName":"客户名称",
//								"itemValue":OrderInfo.cust.partyName
//							},
//							{
//								"itemName":"联系电话",
//								"itemValue":$.trim($('#userPhone').val())
//							},
//							{
//								"itemName":"证件类型",
//								"itemValue":"居民身份证"
//							},
//							{
//								"itemName":"证件号码",
//								"itemValue":CertNumber
//							},
//							{
//								"itemName":"通信地址",
//								"itemValue":"无"
//							},
//							{
//								"itemName":"邮政编码",
//								"itemValue":""
//							},
//							{
//								"itemName":"电子邮箱",
//								"itemValue":"无"
//							}
//						]
//					},
//					"feeInfos":{
//						"acctFeeInfos":[
//							{
//								"chargeItems":[]
//							},
//							{
//								"acctPayNumber":700000542206,
//								"bankCollInfo":{
//									"bankCustName":"",
//									"bankName":"",
//									"bankNumber":""
//								},
//								"custName":"张强富",
//								"payMethodId":"100000",
//								"payMethodName":"现金",
//								"relaAcceNbr":$.trim($('#userPhone').val()),
//								"relaAcctInfo":"接入号："+$.trim($('#userPhone').val())
//							}
//						]
//					},
//					"orderEvent":[{
//						"orderEventCont":{
//							"osBaseInfo":[{
//								"detailCd":110102,
//								"detailName":"套餐月基本费："+$("#price").val()+"元。",
//								"detailValue":"",
//								"isNewline":"N",
//								"remark":"",
//								"seqId":2,
//								"statusCd":1000
//							}],
//							"osOrderInfo":[{
//								"bizReportDetailDescDto":[],
//								"bizReportDetailId":66003706,
//								"bizReportDetailItemDto":[],
//								"bizReportItemId":66003701,
//								"createDate":"2015-11-09 09:05:13.0",
//								"detailCd":120104,
//								"detailName":"安装完成当月资费："+$("#price").val()+"元。",
//								"detailValue":"",
//								"isNewline":"N",
//								"remark":"",
//								"seqId":3,
//								"statusCd":1000
//							}],
//							"osOtherInfo":[{
//								"bizReportDetailDescDto":[],
//								"bizReportDetailId":66018106,
//								"bizReportDetailItemDto":[],
//								"bizReportItemId":66018089,
//								"createDate":"2015-12-08 16:47:22.0",
//								"detailCd":110105,
//								"detailName":"新开户，下行速率：10M。",
//								"detailValue":"",
//								"isNewline":"N",
//								"remark":"",
//								"seqId":1,
//								"statusCd":1000
//							}]
//						},
//						"orderEventTitle":{
//							"attachOfferPkg":"Y",
//							"boActionTypeCd":"S1",
//							"boActionTypeName":"订购",
//							"effectRule":"立即生效",
//							"offerTypeName":"套餐",
//							"price":null,
//							"prodSpecName":$("#prodName").val(),
//							"summary":""
//						},
//						"orderEventType":1,
//						"seq":1
//					}],
//					"orderListInfo":{
//						"areaId":8510101,
//						"areaName":"市辖区",
//						"channelId":2046872,
//						"channelName":"成都市移动业务部内部员工渠道",
//						"extCustOrderId":null,
//						"olId":700000995719,
//						"olNbr":"72016082600000579123",
//						"olType":"15",
//						"orderDesc":null,
//						"soDate":"2016-08-26  10:14:37",
//						"staffId":3053296,
//						"staffName":"曾倩(移动)",
//						"staffNumber":"2650017"
//					},
//					"remarkInfos":["为保障对您的及时服务提醒，您会收到以10000、10001、118xx号码发送的中国电信服务信息。","test为保障对您的及时服务提醒，您会收到以10000、10001、118xx号码发送的中国电信服务信息。"]
//				},
//				"resultCode":"0",
//				"resultMsg":"处理成功!",
//				"busiType":"1",
//				"olId":$("#TransactionID").val().substring(18)
//			};
		
		var voucherInfo = {
				"result":{
					"advInfos":[
//					    "一号通行：您的天翼手机号码就是天翼宽带（4G/3G、WiFi、有线）帐号、也是189邮箱帐号、易信帐号，可上网、登录网掌厅、使用翼支付等功能。易信客户端下载：通过天翼空间、苹果商店、易信网站（yixin.im）等下载。",
//						"WiFi时长卡：中国电信WiFi网络标识“ChinaNet”，使用WiFi客户端，购买WiFi时长卡，快捷WiFi上网。客户端下载：通过天翼空间、苹果商店等搜索“天翼WiFi”。"
					],
					"custInfo":{
						"norCustInfo":[
							{
								"itemName":"客户名称",
								"itemValue":OrderInfo.cust.partyName
							},
							{
								"itemName":"联系电话",
								"itemValue":$.trim($('#cust_phone').val())
							},
							{
								"itemName":"证件类型",
								"itemValue":"居民身份证"
							},
							{
								"itemName":"证件号码",
								"itemValue":CertNumber
							},
							{
								"itemName":"证件地址",
								"itemValue":OrderInfo.cust.addressStr
							}
						]
					},
					"feeInfos":{
						"acctFeeInfos":[
							{
								"chargeItems":_print_chargeItems
							}
//							,
//							{
//								"acctPayNumber":700000542206,
//								"bankCollInfo":{
//									"bankCustName":"",
//									"bankName":"",
//									"bankNumber":""
//								},
//								"custName":"张强富",
//								"payMethodId":"100000",
//								"payMethodName":"现金",
//								"relaAcceNbr":$.trim($('#userPhone').val()),
//								"relaAcctInfo":"接入号："+$.trim($('#userPhone').val())
//							}
						]
					},
					"orderEvent":[{
						"orderEventCont":{
							"userAcceNbrs":[],
							"osBaseInfo":[],
							"osOrderInfo":[],
							"osOtherInfo":[]
//								[{
//								"detailName":"新开户，下行速率："+$("#slList").val(),
//								"detailValue":"",
//								"isNewline":"N",
//								"remark":"",
//								"seqId":1,
//								"statusCd":1000
//							}],
						},
						"orderEventTitle":{
							"attachOfferPkg":"Y",
							"boActionTypeCd":"S1",
							"boActionTypeName":"订购",
							"effectRule":"立即生效",
							"offerTypeName":"套餐",
							"price":null,
							"prodSpecName":$("#prodName").val(),
							"summary":""
						},
						"orderEventType":1,
						"seq":1
					}],
					"orderListInfo":{
//						"areaId":8510101,
//						"areaName":"市辖区",
//						"channelId":2046872,
//						"channelName":"成都市移动业务部内部员工渠道",
//						"extCustOrderId":null,
//						"olId":700000995719,
						"olNbr":$("#TransactionID").val(),
						"olType":"15",
//						"orderDesc":null,
//						"soDate":"2016-08-26  10:14:37",
//						"staffId":3053296,
//						"staffName":"曾倩(移动)",
//						"staffNumber":"2650017"
					},
					"remarkInfos":[
					               "业务联系人："+$.trim($('#userName').val())+"，联系电话："+$.trim($('#userPhone').val()),
					               "装机地址："+$("#addressName").val()+"（"+$.trim($("#addbeizhu").val())+"）"
					               ]
				},
				"resultCode":"0",
				"resultMsg":"处理成功!",
				"busiType":"1",
				"olId":$("#TransactionID").val()
			};
		
		var url=contextPath+"/order/sign/broadband_prodInfoForSign";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>生成回执预览的html,请稍等会儿....</strong>");
			},
			"done" : function(response){
//				$.unecOverlay();
				if (response.code == 0) {
//					alert(JSON.stringify(response.data.result));
					if(response.data.result.result.advInfos!=undefined){
						voucherInfo.result.advInfos = response.data.result.result.advInfos;
					}
					if(response.data.result.result.bizReportDetail!=undefined){
						for(var n=0;n<response.data.result.result.bizReportDetail.length;n++){
							if(response.data.result.result.bizReportDetail[n].detailCd == 110101){
								if(response.data.result.result.bizReportDetail[n].bizReportDetailItemDto!=undefined && response.data.result.result.bizReportDetail[n].bizReportDetailItemDto.length>0){
									var dowslstr = response.data.result.result.bizReportDetail[n].bizReportDetailItemDto[0].itemValue;
//									dowslstr = dowslstr.substring(dowslstr.indexOf("，")+1,dowslstr.length);
									dowslstr = dowslstr.replace("${accountNo}","*").replace("${accessNo}","*").replace("${accountStatus}","*");
									response.data.result.result.bizReportDetail[n].bizReportDetailItemDto[0].itemValue = dowslstr;
								}
								voucherInfo.result.orderEvent[0].orderEventCont.userAcceNbrs[0] = response.data.result.result.bizReportDetail[n];
							}
							else if(response.data.result.result.bizReportDetail[n].detailCd == 110102){
								voucherInfo.result.orderEvent[0].orderEventCont.osBaseInfo[0] = response.data.result.result.bizReportDetail[n];
							}
							else if(response.data.result.result.bizReportDetail[n].detailCd == 110104){
								voucherInfo.result.orderEvent[0].orderEventCont.osOrderInfo[0] = response.data.result.result.bizReportDetail[n];
							}
							else if(response.data.result.result.bizReportDetail[n].detailCd == 110105){
								voucherInfo.result.orderEvent[0].orderEventCont.osOtherInfo[0] = response.data.result.result.bizReportDetail[n];
							}
						}
					}
					if(response.data.result.result.effectRule!=undefined){
						voucherInfo.result.orderEvent[0].orderEventTitle.effectRule = response.data.result.result.effectRule;
					}
//					voucherInfo.result.orderEvent[0].orderEventCont.osOtherInfo[0] = response.data.result.result.bizReportDetail[2];
					if(response.data.result.result.aliasName!=undefined){
						voucherInfo.result.orderEvent[0].orderEventTitle.prodSpecName = response.data.result.result.aliasName;
					}
					if($("#prodName").val().length==0){
						voucherInfo.result.orderEvent[0].orderEventTitle = {};
					}
					_signVoucher(voucherInfo);
					
				}else{
					$.unecOverlay();
					$.alertM(response.data);
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","查询失败，请稍后再试！");
			}
		});
//		_signVoucher(voucherInfo);
	}
	
	//点击打印回执预览回执内容
	var _signVoucher=function(params){
		var PcFlag="1";
		params.PcFlag=PcFlag;
		var url=contextPath+"/order/sign/broadband_previewHtmlForSign";
		$.callServiceAsHtml(url, params, {
			"before":function(){
//				$.ecOverlay("<strong>生成回执预览的html,请稍等会儿....</strong>");
			},"always":function(){
				$.unecOverlay();
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					OrderInfo.order.step = 4;
					$("#confirm").hide();
					$("#print").html(response.data).show();
//					OrderInfo.order.step=4;
					$("#broadband_datasignBtn").off("click").on("click",function(){
						common.callDatasign("common.print.showDataSign");
					});
					$("#broadband_photoPrint").off("click").on("click",function(){
						common.callAgreePhoto(params.olId);
					});
				
					$("#broadband_print_ok").off("click").on("click",function(){
						if(!ec.util.isObj($("#signinput").val())){
							$.alert("提示","请先进行签名，然后再保存！");
						}else{
							_saveHtml2Pdf();
						}
					});
				}else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					$.alert("提示","生成回执预览的html失败!");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","服务忙，请稍后再试！");
			}
		});
	};
	
var _saveHtml2Pdf=function(){
		var accNbr="";
//		if(OrderInfo.actionFlag==1 ||OrderInfo.actionFlag==14){ //新装
//			accNbr=OrderInfo.getAccessNumber(-1);
//		}else if(OrderInfo.actionFlag==13 || OrderInfo.actionFlag==17 || OrderInfo.actionFlag==18){ //裸机销售		
//		}else{//二次业务
//			accNbr=order.prodModify.choosedProdInfo.accNbr;
//		}
//		var certType=OrderInfo.cust.identityCd;
//		if(certType==undefined||certType==null||certType==''){
//			certType=OrderInfo.boCustIdentities.identidiesTypeCd;
//		}
		var CertNumber = "";
		if(OrderInfo.cust.custId == -1){
			CertNumber = OrderInfo.cust.identityNum;
		}else CertNumber = OrderInfo.cust.idCardNumber;
		
		var params={
			olId:$("#TransactionID").val(),
			signFlag:"5",
			busiType:"9",
			sign:_splitBaseforStr($("#signinput").val()),
			srcFlag:"APP",
			custName:OrderInfo.cust.partyName,
			certType:"1",
			certNumber:CertNumber,
			accNbr:"15280612345"
		};
		var url=contextPath+"/order/sign/saveSignPdfForApp";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在保存回执,请稍等会儿....</strong>");
			},	
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					$(".item_fee").each(function(){
                    	$(this).attr("onclick","");
                    });
					$("#printVoucherA").attr("disabled","disabled");//回执保存成功后  回执按钮改为灰色不可操作
					$("#jbrDiv").attr("onclick","");//回执保存成功后，经办人不可更改
					var msg="保存回执成功！";
					$("#btn-dialog-ok").removeAttr("data-dismiss");
					$('#alert-modal').modal({backdrop: 'static', keyboard: false});
					$("#btn-dialog-ok").off("click").on("click",function(){
						$("#alert-modal").modal("hide");
						$("#confirm").show();
						$("#print").hide();
//						$("#showPdf").show();
						OrderInfo.order.step=3;
//						common.callCloseWebview();
					});
					$("#modal-title").html("信息提示");
					$("#modal-content").html(msg);
					$("#alert-modal").modal();
				}
				else if (response.code == -2) {
					$.alertM(response.data);
				}else{
					var error=response.data.errData!=null?response.data.errData:"保存回执失败!";
					$.alert("提示",error);
				}
			}
		});
		
	};
	
	var _splitBaseforStr = function(str){
		var re=new RegExp("=","g");
		str=str.replace(re,"(p/)");
		return str;
	};
	
	//客户定位
	var _goCust = function(){
//		if(OrderInfo.cust.custId != undefined && OrderInfo.cust.custId != ""){
//			order.broadband.confirm();
//			return;
//		}
		common.callCustLocation('common.callCustInfo');
	}
	//客户定位
	var _showCust = function(){
//		alert(OrderInfo.cust.contactInfos[0].contactName);
		$("#cust_name").val(OrderInfo.cust.partyName);
		$("#cust_add").val(OrderInfo.cust.addressStr);
		$("#cust_phone").val(OrderInfo.cust.accNbr);
	}
	
	var _orderSubmit = function(){
		if($("#userName").val().length<1){
			$.alert("提示","请填写联系人！");
			return;
		}
		if($("#userPhone").val().length<1){
			$.alert("提示","请填写联系电话！");
			return;
		}
//		if($("#printVoucherA").attr("disabled") == undefined || "disabled" != $("#printVoucherA").attr("disabled")){
//			$.alert("提示","请先打印回执！");
//			return;
//		}
		if(!_submitParam()){
			return ;
		}
		if(order.broadband.isNeedJbr){//经办人是否必须
			var jbrName=$("#jbrName").val();
			if(jbrName==""){
				$.alert("提示","请填写经办人信息！");
				return;
			}
		}
		var orderInfo = {};
		var ContractRoot = {};
		var SvcCont = {};
		var TcpCont = {};
		
		var CertNumber = "";
		if(OrderInfo.cust.custId == -1){
			CertNumber = OrderInfo.cust.identityNum;
		}else CertNumber = OrderInfo.cust.idCardNumber;
//		alert(CertNumber);
		var CustInfo = [];
		var cust={};
		var address="";
		if(OrderInfo.cust.address!=undefined){
			address=OrderInfo.cust.address;
		}
		var certNum="";
		if(OrderInfo.cust.certNum!=undefined){
			certNum=OrderInfo.cust.certNum;
		}
		cust.CertInfo = {
				"CertAddress": OrderInfo.cust.addressStr,
				"CertNumber": CertNumber,
				"CertType": OrderInfo.cust.identityCd,
				"Address":address.replace(/=/g,"&#61"),//加密证件地址
				"Number":certNum.replace(/=/g,"&#61")  //加密证件号码
		};
		cust.ContactInfos = {
				"ContactName": $.trim($('#userName').val()),
				"ContactPhoneNum": $.trim($('#userPhone').val())
		};
		cust.CustAddress = OrderInfo.cust.addressStr;
		if(OrderInfo.cust.custId == -1){
			cust.CustId = OrderInfo.cust.custId+"";
		}else{
			cust.CustId = OrderInfo.cust.extCustId+"";
		}
		cust.CustName = OrderInfo.cust.partyName;
		var CN="";
		if(OrderInfo.cust.CN!=undefined){
			CN=OrderInfo.cust.CN;
		}
		var ifEncoded=OrderInfo.cust.ifEncoded;
		cust.Name = CN.replace(/=/g,"&#61");//加密客户名称
		cust.Address=address.replace(/=/g,"&#61");//加密客户地址
		cust.IsEncrypt=ifEncoded;//是否加密标志
		CustInfo.push(cust);
		if(order.broadband.isNeedJbr && order.broadband.isSameOne==false && order.broadband.isOldCust==false){//经办人必须且不为本人，且为新客户则custInfo添加经办人节点
			var cust2={};
			cust2.CertInfo = {
				    "CertAddress": OrderInfo.jbr.addressStr,
					"CertNumber": OrderInfo.jbr.identityNum,
					"CertType": OrderInfo.jbr.identityCd	
			};
			cust2.ContactInfos = {
					"ContactName": OrderInfo.jbr.partyName,
					"ContactPhoneNum": OrderInfo.jbr.telNumber
			};
			cust2.CustAddress = OrderInfo.jbr.addressStr;
			cust2.CustName = OrderInfo.jbr.partyName;
			cust2.CustId = OrderInfo.jbr.custId+"";
			CustInfo.push(cust2);
		}
		SvcCont.CustInfo = CustInfo;
		var CustOrderInfo = {};
		var AttrInfos=[];
		if(OrderInfo.actionFlag == 112){
//			var AttrInfos = [];
			var AttrInfos_rh = {
					"AttrSpecId":"40010037",
					"AttrValue":$("#TransactionID").val()
			};
			AttrInfos.push(AttrInfos_rh);
		}
		CustOrderInfo.FeeInfos = _chargeItems;
//		[
//		                          {
//				"AcctItemId":"130002",
//				"Amount":"0.1",
//				"PaymentMethodCd":payType,
//				"PaymentSerialNbr":"",
//				"RealAmount":"0.1",
//				"Tax":"12",
//				"TaxRate":"12"
//		}
//		                          ];
		CustOrderInfo.OrderSource = "1001"; //订单来源
		CustOrderInfo.OrderType = "3";
		CustOrderInfo.Remarks = $("#order_remark").val();
		CustOrderInfo.ServiceType = "32";  //31	固话新装,32宽带新装,33ITV新装,34融合业务新装
		if(OrderInfo.actionFlag == 112){
			CustOrderInfo.ServiceType = "34";
		}
		CustOrderInfo.SendChannelNbr = $('#MDId').val();
		CustOrderInfo.SendChannelAddress = $('#MDadd').val();//甩单地址
        if(order.broadband.isNeedJbr){//需要经办人
        	if(OrderInfo.cust.custId == -1){
        		CustOrderInfo.CustId=OrderInfo.cust.custId+"";
			}else{
				CustOrderInfo.CustId=OrderInfo.cust.extCustId+"";
			}
        	if(!order.broadband.isSameOne){//非本人需要添加经办人HandleCustId节点
        			CustOrderInfo.HandleCustId=OrderInfo.jbr.custId+"";
        	}      	
        	var AttrInfos_jbr = {
    				"AttrSpecId":"40010039",
    				"AttrValue":order.broadband.jbrPictureName
    		};
        	AttrInfos.push(AttrInfos_jbr);
        }
        CustOrderInfo.AttrInfos = AttrInfos;
//		CustOrderInfo.StaffCode = "1001";
		SvcCont.CustOrderInfo = CustOrderInfo;
		var ProdInfo = [];
		if(OrderInfo.actionFlag == 112){
			if($("#addressName_kd").val().length>0){
				ProdInfo.push(
							{
//									"AccNum":"02589978980",
								"AddressId":$("#addressId_kd").val(),
//									"AttrInfos":[],
								"DetailAddr":$("#addressName_kd").val()+"（"+$.trim($("#addbeizhu_kd").val())+"）",
								"FormatAddr":$("#addressName_kd").val(),
								"ProdInstId":"-1",
								"ProductNbr":$("#prodNbr_kd").val(),//"00102005000000000000",
								"AccessModeId":$("#AccessModeId_kd").val(),
								"AccessModeName":$("#jrfs_name_kd").val(),
								"ExchId":$("#ExchId_kd").val(),
								"ExchName":$("#ExchName_kd").val()
							}
						);
			}
			if($("#addressName_gh").val().length>0){
				ProdInfo.push(
							{
//									"AccNum":"02589978980",
								"AddressId":$("#addressId_gh").val(),
//									"AttrInfos":[],
								"DetailAddr":$("#addressName_gh").val()+"（"+$.trim($("#addbeizhu_gh").val())+"）",
								"FormatAddr":$("#addressName_gh").val(),
								"ProdInstId":"-1",
								"ProductNbr":$("#prodNbr_gh").val(),//"00102005000000000000",
								"AccessModeId":$("#AccessModeId_gh").val(),
								"AccessModeName":$("#jrfs_name_gh").val(),
								"ExchId":$("#ExchId_gh").val(),
								"ExchName":$("#ExchName_gh").val()
							}
						);
			}
			if($("#addressName_gc").val().length>0){
				ProdInfo.push(
							{
//									"AccNum":"02589978980",
								"AddressId":$("#addressId_gc").val(),
//									"AttrInfos":[],
								"DetailAddr":$("#addressName_gc").val()+"（"+$.trim($("#addbeizhu_gc").val())+"）",
								"FormatAddr":$("#addressName_gc").val(),
								"ProdInstId":"-1",
								"ProductNbr":$("#prodNbr_gc").val(),//"00102005000000000000",
								"AccessModeId":$("#AccessModeId_gc").val(),
								"AccessModeName":$("#jrfs_name_gc").val(),
								"ExchId":$("#ExchId_gc").val(),
								"ExchName":$("#ExchName_gc").val()
							}
						);
			}
		}else if($("#addressName").val().length>0){
			ProdInfo = [
						{
//								"AccNum":"02589978980",
							"AddressId":$("#addressId").val(),
//								"AttrInfos":[],
							"DetailAddr":$("#addressName").val()+"（"+$.trim($("#addbeizhu").val())+"）",
							"FormatAddr":$("#addressName").val(),
							"ProdInstId":"-1",
							"ProductNbr":$("#prodNbr").val(),//"00102005000000000000",
							"AccessModeId":$("#AccessModeId").val(),
							"AccessModeName":$("#jrfs_name").val(),
							"ExchId":$("#ExchId").val(),
							"ExchName":$("#ExchName").val()
						}
					];
		}
		var AttrInfos_prod = new Array();
		if(OrderInfo.actionFlag == 112){
			if($("#prodName_kd").val().length>0){
				if($("#upslList_kd").val()!="" && $("#upslList_kd").val()!=null){
					var up = {
							"AttrSpecId":"10010130",
							"AttrValue":$("#upslList_kd").val()
						};
					AttrInfos_prod.push(up);
				}
				if($("#dwslList_kd").val()!="" && $("#dwslList_kd").val()!=null){
					var dw = {
							"AttrSpecId":"10010131",
							"AttrValue":$("#dwslList_kd").val()
						};
					AttrInfos_prod.push(dw);
				}
			}
			if($("#prodName_gh").val().length>0){
				if($("#upslList_gh").val()!="" && $("#upslList_gh").val()!=null){
					var up = {
							"AttrSpecId":"10010130",
							"AttrValue":$("#upslList_gh").val()
						};
					AttrInfos_prod.push(up);
				}
				if($("#dwslList_gh").val()!="" && $("#dwslList_gh").val()!=null){
					var dw = {
							"AttrSpecId":"10010131",
							"AttrValue":$("#dwslList_gh").val()
						};
					AttrInfos_prod.push(dw);
				}
			}
			if($("#prodName_gc").val().length>0){
				if($("#upslList_gc").val()!="" && $("#upslList_gc").val()!=null){
					var up = {
							"AttrSpecId":"10010130",
							"AttrValue":$("#upslList_gc").val()
						};
					AttrInfos_prod.push(up);
				}
				if($("#dwslList_gc").val()!="" && $("#dwslList_gc").val()!=null){
					var dw = {
							"AttrSpecId":"10010131",
							"AttrValue":$("#dwslList_gc").val()
						};
					AttrInfos_prod.push(dw);
				}
			}
		}else if($("#prodName").val().length>0){
			if($("#upslList").val()!="" && $("#upslList").val()!=null){
				var up = {
						"AttrSpecId":"10010130",
						"AttrValue":$("#upslList").val()
					};
				AttrInfos_prod.push(up);
			}
			if($("#dwslList").val()!="" && $("#dwslList").val()!=null){
				var dw = {
						"AttrSpecId":"10010131",
						"AttrValue":$("#dwslList").val()
					};
				AttrInfos_prod.push(dw);
			}
		}
		if(ProdInfo.length>0 && AttrInfos_prod.length>0){
			ProdInfo[0].AttrInfos = AttrInfos_prod;
		}
		SvcCont.ProdInfo = ProdInfo;
		
		if(OrderInfo.actionFlag == 112){
			order.broadband.ProdOfferInfo = [];
			order.broadband.ProdOfferInfo.push({
				"OfferProdRelInfo":[{"ProdInstId":"-1","RoleCd":$("#compTypeCd_kd").val(),"RoleName":""}],
				"ProdOfferInstId":"-1",
				"ProdOfferNbr":$("#offerNbr_kd").val()
				});
			order.broadband.ProdOfferInfo.push({
				"OfferProdRelInfo":[{"ProdInstId":"-2","RoleCd":$("#compTypeCd_gh").val(),"RoleName":""}],
				"ProdOfferInstId":"-2",
				"ProdOfferNbr":$("#offerNbr_gh").val()
				});
			order.broadband.ProdOfferInfo.push({
				"OfferProdRelInfo":[{"ProdInstId":"-2","RoleCd":$("#compTypeCd_gc").val(),"RoleName":""}],
				"ProdOfferInstId":"-3",
				"ProdOfferNbr":$("#offerNbr_gc").val()
				});
		}
		SvcCont.ProdOfferInfo = order.broadband.ProdOfferInfo;
		
		TcpCont = {
//				"AppKey":"1000000201",
				"DstSysID":"1000000269",
				"Method":"order.prod.salesorder",
//				"ReqTime":"20130817200202123",
				"Sign":"123",
//				"TransActionID":"1000000201201112041000000011",
				"Version":"V1.0"
			};
		
		ContractRoot.SvcCont = SvcCont;
		ContractRoot.TcpCont = TcpCont;
		orderInfo.ContractRoot = ContractRoot;
		var params = orderInfo;
		params.TransactionID = $("#TransactionID").val();
		var url=contextPath+"/app/order/broadband/orderSubmit";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"done" : function(response){
//				alert(JSON.stringify(response.data));
				$.unecOverlay();
				if(response.code == 0) {
					$("#toCharge").attr("disabled","disabled");
					$(".item_fee").each(function(){
                    	$(this).attr("onclick","");
                    });
					var msg="订单提交成功，订单流水号：" + response.data.TransactionID;
					$("#btn-dialog-ok").removeAttr("data-dismiss");
					$('#alert-modal').modal({backdrop: 'static', keyboard: false});
					$("#btn-dialog-ok").off("click").on("click",function(){
						$("#alert-modal").modal("hide");
						common.callCloseWebview();
					});
					$("#modal-title").html("信息提示");
					$("#modal-content").html(msg);
					$("#alert-modal").modal();
//					$.confirm("订单提交成功","订单流水号："+response.data.TransactionID,{ 
//	 					yes:function(){	
//	 						common.callCloseWebview();
//	 					}
//	 				});
//					$.alert("提示","订单提交成功!流水号："+response.data.flowId);
//					var resList = response.data.result.ResInfo;
				}else{
					$.unecOverlay();
//					$.alert("提示","订单提交成功!流水号："+response.data.flowId);
					$.alertM(response.data);
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","订单提交失败！");
			}
		});
	}
	
	/**
	 * 获取支付平台支付页面
	 */
	var _getPayTocken = function(){
		var dis=$("#printVoucherA").attr("disabled");//回执按钮置灰收费不可点击
		if("disabled"!=dis){
			$.alert("提示","请先保存回执");
			return;
		}
		if(!order.broadband.myFlag){//支付开关关闭，直接提交
			_orderSubmit();
			return;
		}
		if(order.broadband.isNeedJbr){//经办人是否必须
			var jbrName=$("#jbrName").val();
			if(jbrName==""){
				$.alert("提示","请填写经办人信息！");
				return;
			}
		}
		if($("#userName").val().length<1){
			$.alert("提示","请填写联系人！");
			return;
		}
		if($("#userPhone").val().length<1){
			$.alert("提示","请填写联系电话！");
			return;
		}
		var busiUpType="2";
		order.calcharge.busiUpType="2";
		var params={
				"olId":$("#TransactionID").val(),
				"soNbr":$("#TransactionID").val(),
				"busiUpType":busiUpType,
				"charge":ssfy*100+""//"1"
		};
		var url = contextPath+"/app/order/getPayUrl";
		$.callServiceAsJson(url, params, {
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},
			"done" : function(response){
//				alert(JSON.stringify(response.data));
				$.unecOverlay();
				if(response.code == 0) {
					payUrl=response.data;
					common.callOpenPay(payUrl);//打开支付页面
				}else if(response.code==1002){
//					$.alert("提示","接口异常，请稍后再试！");
					$.alertM(response.data);
				}
			},fail:function(response){
				$.unecOverlay();
				$.alert("提示","系统异常，请稍后再试！");
			}
		});
//		if(response.code==0){
//			payUrl=response.data;
//			common.callOpenPay(payUrl);//打开支付页面
//		}else if(response.code==1002){
//			$.alert("提示","接口异常，请稍后再试！");
//		}
//		else{
//			$.alertM(response.data);
//		}
	};
	
	/**
	 * 获取支付平台返回订单状态
	 */
	var _queryPayOrdStatus = function(soNbr, status,type) {
		if ("1" == status) { // 原生返回成功，调用支付平台查询订单状态接口，再次确定是否成功，如果成功则调用收费接口
			var params = {
				"olId" : soNbr
				
			};
			var url = contextPath + "/app/order/getPayOrdStatus";
			$.callServiceAsJson(url, params,{
				"before":function(){
					$.ecOverlay("<strong>查询订单支付状态中,请稍等...</strong>");
				},
				"done" : function(response){
					$.unecOverlay();
					if(response.code == 0) {
						payType=type;
						_orderSubmit();
					}else if(response.code==1){//支付接口支付失败
						
					}else if(response.code==1002){
						$.alert("提示",response.data);
					}else{
						$.alertM(response.data);
					}
				},fail:function(response){
					$.unecOverlay();
					$.alert("提示","系统异常，请稍后再试！");
				}
			});
//			if (response.code == 0) {//支付成功，调用订单提交
//				payType=type;
//				_orderSubmit();
//
//			} else if (response.status == 1002) {
//				$.alert("提示","支付失败"); // 支付失败
//			} else {
//				$.alertM(response.data);// 调用接口异常
//			}
		}
	};
	
	
	//收费参数封装
	var _submitParam=function(){
//		var remakrFlag = true ;
//		var posLenFlag = true ;
//		var posNvlFlag = true ;
//		$("#calChangeTab tr").each(function() {
			var val = $(this).attr("id");
//			if(val!=undefined&&val!=''){
//				val=val.substr(5,val.length);
//				var chargeModifyReasonCd=$("#chargeModifyReasonCd_"+val).val();
//				if(chargeModifyReasonCd=="1"){
//					if($("#remark_"+val).val()==undefined||$("#remark_"+val).val()==null||$("#remark_"+val).val()==''){
//						remakrFlag = false ;
//					}
//				}
//				var payMethodCd=$("#payMethodCd_"+val).val();
//				var terminalNumber=$("#terminalNumber").val();
//				var serialNumber=$("#serialNumber").val();
//				if(payMethodCd == '110101'){
//					if(terminalNumber==undefined || $.trim(terminalNumber)==""){
//						posNvlFlag = false;
//					}
//					if(serialNumber==undefined || $.trim(serialNumber)==""){
//						posNvlFlag = false;
//					}
//					
//					if(terminalNumber.length >100){
//						posLenFlag = false;
//					}
//					if(serialNumber.length >100){
//						posLenFlag = false;
//					}
//				}
//			}
//		});
//		if(!remakrFlag){
//			$.alert("提示信息","请填写修改原因");
//			return false ;
//		}
//		if(!posNvlFlag){
//			$.alert("提示信息","pos流水号或者终端号不能为空，请重新输入！");
//			return false ;
//		}
//		if(!posLenFlag){
//			$.alert("提示信息","pos流水号或者终端号长度超过100位，请重新输入！");
//			return false ;
//		}
		
		_chargeItems=[];
		_buildChargeItems();
		return true ;
	};
	//费用项封装
	var _buildChargeItems = function(){
		_print_chargeItems = []
		ssfy = 0;
		ysfy = 0;
		$("#calChangeTab tr").each(function() {
			var val = $(this).attr("id");
			if(val!=undefined&&val!=''){
//				val=val.substr(5,val.length);
				var realmoney=($("#realhidden_"+val).val())*100+'';
				var amount=$("#feeAmount_"+val).val()*100+'';
				ssfy = ssfy + $("#realhidden_"+val).val();
				ysfy = ysfy + $("#feeAmount_"+val).val();
				var feeAmount="";
				if(amount!=undefined&&amount!=''){
					feeAmount=amount+'';
				}else{
					feeAmount=realmoney;
				}
				var acctItemTypeId=$("#acctItemTypeId_"+val).val();
//				var objId=$("#objId_"+val).val();
//				var objType=$("#objType_"+val).val();
//				var acctItemId=$("#acctItemId_"+val).val();
//				var boId=$("#boId_"+val).val();
				var payMethodCd=10000;//$(".shouyintai_payType").val();
//				var objInstId=$("#objInstId_"+val).val();
//				var prodId=$("#prodId_"+val).val();
//				var boActionType=$("#boActionType_"+val).val();
//				var paymentAmount = $("#paymentAmount_"+val).val();
				var chargeModifyReasonCd = 1 ;
				var remark="";
				//if($("#chargeModifyReasonCd_"+val).parent(".ui-select").parent().is(":hidden")){
				if($("#chargeModifyReasonCd_"+val).is(":hidden")){
					if(feeAmount!=realmoney){
						remark="其他";
					}
				}else{
					chargeModifyReasonCd = $("#chargeModifyReasonCd_"+val).val();
					remark=$('#chargeModifyReasonCd_'+val).find("option:selected").text();
					if(chargeModifyReasonCd=="1"){
						remark = $("#remark_"+val).val();
					}
				}
				if(feeAmount!=realmoney&&remark==""){
					remark="其他";
				}
				var terminalNumber = "";
				var serialNumber = "";
				if(payMethodCd == '110101'){
					 terminalNumber=$("#terminalNumber").val();
					 serialNumber=$("#serialNumber").val();
				}
				if(order.calcharge.myFlag){//开启调用支付平台
					payMethodCd=payType;
				}
				var param={
						"RealAmount":realmoney,
						"Amount":feeAmount,
//						"paymentAmount":paymentAmount,
//						"AcctItemId":acctItemTypeId,
//						"objId":objId,
//						"objType":objType,
						"AcctItemId":acctItemTypeId,
//						"boId":boId,
//						"prodId":prodId,
//						"objInstId":objInstId,
						"PaymentMethodCd":payMethodCd//,
//						"terminalNo":terminalNumber,
//						"posSeriaNbr":serialNumber,
//						"chargeModifyReasonCd":chargeModifyReasonCd,
//						"remark":remark,
//						"boActionType":boActionType
				};
				var print_param={
						"realAmount":realmoney,
						"amount":feeAmount,
						"paymentAmount":feeAmount,
//						"AcctItemId":acctItemTypeId,
//						"objId":objId,
//						"objType":objType,
						"acctItemId":acctItemTypeId,
//						"boId":boId,
//						"prodId":prodId,
//						"objInstId":objInstId,
						"PaymentMethodCd":payMethodCd,
						"payMethodName":"现金"//,
//						"terminalNo":terminalNumber,
//						"posSeriaNbr":serialNumber,
//						"chargeModifyReasonCd":chargeModifyReasonCd,
//						"remark":remark,
//						"boActionType":boActionType
				};
				_chargeItems.push(param);
				_print_chargeItems.push(print_param);
			}
		});
	};
	
	var _showEditPage = function(obj){
		var trid = $(obj).attr("id");
		var params = {"trid":trid} ;
		var url = contextPath+"/app/order/broadbandgetEditPage";
		$.callServiceAsHtmlGet(url,params, {
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				$("#confirm").hide();
				var content$ = $("#calEdit");
				content$.html(response.data).show();
				OrderInfo.returnFlag = "xgfy";
				$("#pnumber").text($(obj).attr("acctItemTypeName"));
				$("#realAmount_"+trid).val($("#realhidden_"+trid).val());
				$("#realAmount_"+trid).removeAttr("disabled").css("border","1px solid #DCDCDC").focus();
				$("#chargeModifyReasonCdDiv_"+trid).show();
			},
			fail:function(response){
			     $.alert("提示","显示费用编辑页面失败，请稍后再试！");
			}
		});
		
	};
	
	//查询修改费用项维度权限
	var _queryAuthenticDataRange = function(trid){
		var params={};
		var url=contextPath+"/app/order/queryAuthenticDataRange";
		$.callServiceAsJson(url, params,{
			"before":function(){
				$.ecOverlay("<strong>正在查询费用修改权限中,请稍等...</strong>");
			},
			"done" : function(response){
				$.unecOverlay();
				if (response.code == 0) {
					var dataRanges = response.data;
					var flag = false;
					for(var j=0;j<order.broadband.feeInfos.length;j++){
						for(var i=0;i<dataRanges.length;i++){
							if($("#acctItemTypeId_"+j).val()==dataRanges[i].dataDimensionName){
								$("#"+j).attr("onclick","order.broadband.showEditPage(this)");
//								flag = true;
//								$("#realAmount_"+trid).removeAttr("disabled").css("border","1px solid #DCDCDC").focus();
//								$("#chargeModifyReasonCdDiv_"+trid).show();
//								break;
							}else{
//								flag = false;
							}
						}
					}
					
					if(flag){
//						return true;
					}else{
//						$.alert("提示","修改当前费用项权限不足!");
//						return false;
					}
				}else if (response.code != 0) {
//					$.alert("提示",response.data);
//					return false ;
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","权限数据范围查询失败!");
				return false ;
			}
		});
	};
	
	var _confirmcal = function(trid){
		_editMoney($("#realAmount_"+trid).val(),trid,'old');
		OrderInfo.returnFlag = "";
	};
	
	var _closecal = function(accessNumber,trid,realAmount){
		$("#confirm").show();
		$("#calEdit").hide();
		OrderInfo.returnFlag = "";
	};
	
	//修改金额效果
	var _editMoney=function(obj,val,str){//obj:对象,val:id,str:类型
		var cash = ''; //实收费用
		if(typeof obj =="object"){
		    cash=$.trim($(obj).val());//当前费用
	    }
		else{
			cash = obj;
			if(cash=='') cash = "0";
//			$("#realhidden_"+val).val(cash);
//			$("#ssfy_"+val).html(cash);
		}
		if(cash==''){
			$(obj).val('0');
			order.calcharge.reflashTotal();
		}else{
			if(str=="old"){//修改费用
				var amount=$("#feeAmount_"+val).val();
				var check = true ;
				if(cash<0){
					$.alert("提示","实收费用金额不能小于0！");
					check = false ;
					return;
				}else if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){
			  		$.alert("提示","费用金额请输入数字，最高留两位小数！");
			  		check = false ;
			  		return;
				}else if((cash*100>amount*100)&&amount>0){
					$.alert("提示","实收费用金额不能高于应收金额！");
					check = false ;
					return;
				}else if((cash*100<amount*100)&&amount<0){
					$.alert("提示","实收费用金额不能低于应收金额！");
					check = false ;
					return;
				}
				if(check){
					var real=(cash)*100;
		  			if(real!=amount*100){
		  				$("#chargeModifyReasonCdDiv_"+val).show();
					}else{
						$("#chargeModifyReasonCdDiv_"+val).hide();
					//	$("#chargeModifyReasonCdDiv_"+val).next(".edit").hide();
					}
		  			if(typeof obj !="object"){
		  				$("#confirm").show();
		  				$("#calEdit").hide();
					}
//					_reflashTotal();//动态刷新页面信息
				}else{
					if(money!=''){
			  			//$(obj).val(money);
			  		}
			  		money="";
				}
			}else if(str=="undo"){//退费：撤单和返销
				var check = true ;
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){//金额非数字，恢复金额
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		check = false ;
			  		return;
				}else{
					if(cash<0){//退费金额 不能填负值
						$.alert("提示","退费金额不能为负值！");
						check = false ;
						return;
					}else{
						var amount=$("#realhidden_"+val).val();
						var v_cash = cash*-1 ;
						if(v_cash<amount*1){//要退-100，不能退120
							$.alert("提示","退费金额不能高于实收金额！");
							check = false ;
							return;
						}
					}
				}
				if(check){
					var real=($(obj).val())*-1;
					if(real!=0){
						$("#chargeModifyReasonCdDiv_"+val).show();
					}else{
						$("#chargeModifyReasonCdDiv_"+val).hide();
						$("#chargeModifyReasonCdDiv_"+val).next(".edit").hide();
					}
					if(typeof obj !="object"){
						$("#cal_main_content").show();
						$("#edit_content").hide();
					}
					_reflashTotal();
				}else{
					if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
				}
			}else if(str=="new"){//新增费用
				if(!/^(-)?[0-9]+([.]\d{1,2})?$/.test(cash)){
			  		$.alert("提示","费用金额请输入数字，最高保留两位小数！");
			  		if(money!=''){
			  			$(obj).val(money);
			  		}
			  		money="";
			  		return;
				}else if(cash<0){//
					$.alert("提示","实收费用金额不能为负值！");
					return;
				}else{
					if(typeof obj !="object"){
						$("#cal_main_content").show();
						$("#edit_content").hide();
					}
					_reflashTotal();
				}
			}
		}
		
		$("#realhidden_"+val).val(cash);
		$("#ssfy_"+val).html(cash);
		payMethod = $("#changeMethod_"+val).val();  //付费方式
		//alert(payMethod);
		reason = $("#chargeModifyReasonCd_"+val).val();//修改原因
		remark = $("#remark_"+val).val();//备注
		
	};
	//刷新页面select内容
	var _init_select = function() {
        // Select demo initialization
        $('.myselect').mobiscroll().select({
          theme: "android-holo-light", // Specify theme like: theme: 'ios' or omit setting to use default 
          mode: "scroller", // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
          display: "bottom", // Specify display mode like: display: 'bottom' or omit setting to use default 
          lang: "zh", // Specify language like: lang: 'pl' or omit setting to use default 
          inputClass: "form-control",
        });
      }

//显示经办人窗口
	var _showJbr = function(){
		//先清空
		OrderInfo.returnFlag="jbr";
		$("#confirm").hide();
		$("#jbr").show();
		if(!order.broadband.haveCallPhote){//未拍过照片，默认本人
			order.broadband.jbrInfoFillIn();//经办人信息默认本人
			order.broadband.isSameOne=true;
			$('#orderAttrName').val("");
//			$('#orderAttrPhoneNbr').val("");
			$('#orderAttrAddr').val("");
			$('#sfzorderAttrIdCard').val("");
			$('#orderAttrIdCard').val("");//证件号码
			//经办人信息回填，确保信息正确
//			var custIdentidiesTypeCd=OrderInfo.cust.identityCd;//客户证件类型
//			var custNumber=OrderInfo.cust.idCardNumber;//客户证件号码
//			if(custIdentidiesTypeCd==1){//身份证
//				$('#sfzorderAttrIdCard').val(custNumber);//证件号码
//			}else{
//				$('#orderAttrIdCard').val(custNumber);//证件号码
//			}
//			$('#orderAttrName').val(OrderInfo.cust.partyName);
//			$('#orderAttrPhoneNbr').val(OrderInfo.cust.accNbr);
//			$('#orderAttrAddr').val(OrderInfo.cust.addressStr);
	  }
	};
	
   var _closeJbr=function(){
	   if(!order.broadband.isSameOne){
		   var validate=$("#jbrFormdata").Validform();
			if(!validate.check()){
				return;
			}
	   }
	   if(!order.broadband.haveCallPhote){
		   
		   if(order.broadband.isNeedJbr){
				common.callPhotos2('cust.getPicture2');
			}
			return;
	   }
	   $("#confirm").show();
	   $("#jbr").hide();
	   var jbrName=$("#orderAttrName").val();
	   if(order.broadband.isSameOne){
		   jbrName=OrderInfo.cust.partyName;
	   }
	   $("#jbrName").val(jbrName);
   };

//客户和经办人不是同一个人时需要查询经办人
var _queryJbr=function(idcard){
	if(!ec.util.isObj(idcard) && !order.broadband.isSameOne){
		var validate=$("#jbrFormdata").Validform();
		if(!validate.check()){
			return;
		}
	}
		
	var custIdentidiesTypeCd=OrderInfo.cust.identityCd;//客户证件类型
	var custNumber=OrderInfo.cust.idCardNumber;//客户证件号码
	var jbrIdentidiesTypeCd=$("#orderIdentidiesTypeCd  option:selected").val();//经办人证件类型
	var jbrIdentityNum;
	if(jbrIdentidiesTypeCd==1){
		jbrIdentityNum = $('#sfzorderAttrIdCard').val();//证件号码
		if(!ec.util.isObj(idcard)){	
			idcard = jbrIdentityNum;
		}
	}else{
		jbrIdentityNum = $('#orderAttrIdCard').val();//证件号码
	}
//	if(jbrIdentityNum==""){
//		$.alert("提示","证件号码为空，无法进行查询！");
//		return;
//	}
	order.broadband.isSameOne=false;
	if(custIdentidiesTypeCd==jbrIdentidiesTypeCd && custNumber==jbrIdentityNum){//经办人为本人,无需查询
		order.broadband.isSameOne=true;
	}
	
	order.broadband.searchJbr(idcard);
};

//经办人-查询
function _searchJbr(sfzidcard){
	
	order.broadband.canCallPhote=false;//查询通过方能拍照
	var identityCd="";
	var idcard="";
	var diffPlace="";
	var acctNbr="";
	var identityNum="";
	var queryType="";
	var queryTypeValue="";
	identityCd=$("#orderIdentidiesTypeCd  option:selected").val();;
	if(identityCd==1){
//		var identityNum = $('#sfzorderAttrIdCard').val();//证件号码
		var identityNum = sfzidcard;
	}else{
		var identityNum = $('#orderAttrIdCard').val();//证件号码
	}
	diffPlace="local";
	areaId=OrderInfo.staff.areaId;
	// lte进行受理地区市级验证
	if(CONST.getAppDesc()==0&&(areaId+"").indexOf("0000")>0){
		$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
		return;
	}
	var param = {
			"acctNbr":acctNbr,
			"identityCd":identityCd,
			"identityNum":identityNum,
			"partyName":"",
			"custQueryType":"",
			"diffPlace":diffPlace,
			"areaId" : areaId+"",
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
//				$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
				

				order.broadband.canCallPhote=true;
				order.broadband.isOldCust=false;
				_getJbrInfo(OrderInfo.SEQ.instSeq--);
//				var validate=$("#jbrFormdata").Validform();
//				if(!validate.check()){
//					return;
//				}
				if(order.broadband.isNeedJbr){
					common.callPhotos2('cust.getPicture2');
				}
					
			}else{
			order.broadband.canCallPhote=true;
			$.unecOverlay();
			var custInfoSize = $(response.data).find('#custInfoSize').val();
			var custInfos = $(response.data).find('#custInfos');
			var custId = $(custInfos).attr("custId");
			var extCustId=$(custInfos).attr("extCustId");
			var partyName=$(custInfos).attr("partyName");
			var addressStr=$(custInfos).attr("addressStr");//地址
			var accNbr=$(custInfos).attr("accNbr");//联系方式
			//经办人信息回填，确保信息正确
			$('#orderAttrName').val(partyName);
			if(accNbr!=null && accNbr!=""){
			 $('#orderAttrPhoneNbr').val(accNbr);
			}
			$('#orderAttrAddr').val(addressStr);
			if (custInfoSize >= 1) {
				order.broadband.isOldCust=true;
				_getJbrInfo(extCustId);
			} else {
				order.broadband.isOldCust=false;
				_getJbrInfo(OrderInfo.SEQ.instSeq--);
			}
//			var validate=$("#jbrFormdata").Validform();
//			if(!validate.check()){
//				return;
//			}
			if(order.broadband.isNeedJbr){
				common.callPhotos2('cust.getPicture2');
			}
		}
		},
		"fail":function(response){
			$.unecOverlay();
			$.alert("提示","查询失败，请稍后再试！");
		}
	});

};

var _getJbrInfo=function(custId){
	OrderInfo.jbr.custId=custId;
	OrderInfo.jbr.partyName = $('#orderAttrName').val();//经办人名称
	OrderInfo.jbr.areaId = OrderInfo.staff.areaId;//经办人地区
	OrderInfo.jbr.telNumber = $('#orderAttrPhoneNbr').val();//联系电话
	OrderInfo.jbr.addressStr = $('#orderAttrAddr').val();//经办人地址
	OrderInfo.jbr.identityCd = $('#orderIdentidiesTypeCd').val();//证件类型
	if(OrderInfo.jbr.identityCd==1){
		OrderInfo.jbr.identityNum = $('#sfzorderAttrIdCard').val();//证件号码
	}else{
		OrderInfo.jbr.identityNum = $('#orderAttrIdCard').val();//证件号码
	}
};

//改变证件号码重设未拍照
var _setNoPhoto=function(){
	var partyName = $('#orderAttrName').val().trim();//经办人名称
	var addressStr = $('#orderAttrAddr').val().trim();//经办人地址
	var identityNum = $('#orderAttrIdCard').val();//非身份证证件号码
	if(partyName!="" || addressStr!="" || identityNum!=""){
		order.broadband.isSameOne=false;
		order.broadband.canCallPhote=false;
		order.broadband.haveCallPhote=false;
	}	
};
//经办人信息校验
	var _checkJbrParam=function(){
		var orderAttrName = $.trim($("#orderAttrName").val()); //经办人姓名
		var orderIdentidiesTypeCd = $("#orderIdentidiesTypeCd  option:selected").val(); //证件类型
		var orderAttrIdCard = $.trim($("#orderAttrIdCard").val());; //证件号码
		if("1"==orderIdentidiesTypeCd){
			orderAttrIdCard =$.trim($("#sfzorderAttrIdCard").val()); //身份证号码
		}
		var orderAttrAddr = $.trim($("#orderAttrAddr").val()); //地址
		var orderAttrPhoneNbr = $.trim($("#orderAttrPhoneNbr").val()); //联系人号码	
	};
	
	//翼销售-经办人-客户证件类型和其他信息填充
	var _jbrInfoFillIn = function(){
		 $("#myType").empty();
		var _obj = $("#orderIdentidiesTypeCd");
		_obj.empty();
		var partyTypeCd= "1";//个人
		var custCertTypeCd=1;//客户证件类型
		var params = {"partyTypeCd":partyTypeCd} ;
		var url=contextPath+"/app/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
					$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
					return;
				}
	   var currentCT = $("#currentCT").val();//渠道类型
	   if(response.code==0){
		           var $label =$('<label style="display: none;" for="orderIdentidiesTypeCd">证件类型</label><i class="iconfont pull-left absolute-left">&#xe616;</i>');
		           var $sel = $('<select id="orderIdentidiesTypeCd" class="myselect select-option dw-hsel" onchange="cust.jbridentidiesTypeCdChoose(this,sfzorderAttrIdCard)"></select>');
					var data = response.data ;
					if(data!=undefined && data.length>0){
						//去除重复的证件类型编码
						var uniData = [];
						for(var i=0;i<data.length;i++){
							var unique = true;
							var certTypeCd = data[i].certTypeCd;
							for(var j=0;j<uniData.length;j++){
								unique = unique && data[i].certTypeCd != uniData[j].certTypeCd;
								if(!unique){
									break;
								}
							}
							
						    //只有定义的渠道类型新建客户的时候可以选择非身份证类型,其他的渠道类型只能选择身份证类型。
							var isAllowChannelType = false;
							if(currentCT==CONST.CHANNEL_TYPE_CD.ZQZXDL || currentCT==CONST.CHANNEL_TYPE_CD.GZZXDL
									|| currentCT==CONST.CHANNEL_TYPE_CD.HYKHZXDL || currentCT==CONST.CHANNEL_TYPE_CD.SYKHZXDL
									|| currentCT==CONST.CHANNEL_TYPE_CD.XYKHZXDL || currentCT==CONST.CHANNEL_TYPE_CD.GZZXJL
									|| currentCT==CONST.CHANNEL_TYPE_CD.ZYOUT || currentCT==CONST.CHANNEL_TYPE_CD.ZYINGT
									|| currentCT==CONST.CHANNEL_TYPE_CD.WBT){
								isAllowChannelType = true;
							}
							if(!isAllowChannelType && certTypeCd == "1"){
								isAllowChannelType= true;
							}
							if(unique && isAllowChannelType){
								uniData.push(data[i]);
							}
						}					
						for(var i=0;i<uniData.length;i++){
							var certTypedate = uniData[i];
							var $option = "";
							if(custCertTypeCd==certTypedate.certTypeCd){
								$option = $('<option value="'+certTypedate.certTypeCd+'" selected="selected">'+certTypedate.name+'</option>');
							}else{
							    $option = $('<option value="'+certTypedate.certTypeCd+'">'+certTypedate.name+'</option>');
							}
							$sel.append($option);
						}
					}
					$("#myType").append($label).append($sel);
					if(custCertTypeCd==1){
						$("#jbrsfz").show();
						$("#jbrsfz_i").show();
						$("#qtzj").hide();
						$("#orderAttrName").attr("readonly","readonly");
						$("#orderAttrAddr").attr("readonly","readonly");
						$("#orderAttrIdCard").attr("readonly","readonly");
						$("#orderAttrIdCard").attr("type","hidden");
						$("#sfzorderAttrIdCard").removeAttr("type");
//						$("#queryJbr").hide();
						$("#queryJbr").attr("disabled","disabled");
//						if((OrderInfo.cust.identityCd == 1) && ($("#sfzorderAttrIdCard").val() == OrderInfo.cust.idCardNumber)){
//							OrderInfo.jbr.identityPic = OrderInfo.cust.identityPic;
//							OrderInfo.jbr.custId = OrderInfo.cust.custId;
//						}
						OrderInfo.jbr.custId ="";
						cust.clearJbrForm();
						OrderInfo.virOlId = "";
						OrderInfo.jbr.identityPic = undefined;
//						$('#jbrFormdata').data('bootstrapValidator').enableFieldValidators("orderAttrIdCard",true,"sfzorderAttrIdCard");
					}else{
						$("#jbrsfz").hide();
						$("#jbrsfz_i").hide();
						$("#qtzj").show();
						$("#orderAttrName").removeAttr("readonly");
						$("#orderAttrAddr").removeAttr("readonly");
						$("#orderAttrIdCard").removeAttr("readonly");
						$("#sfzorderAttrIdCard").attr("type","hidden");
						$("#orderAttrIdCard").removeAttr("type");
//						$("#queryJbr").show();
						$("#queryJbr").removeAttr("disabled");
						OrderInfo.virOlId = "";
						OrderInfo.jbr.custId ="";
						cust.clearJbrForm();
						OrderInfo.jbr.identityPic = undefined;
//						$('#jbrFormdata').data('bootstrapValidator').enableFieldValidators("orderAttrIdCard",true,"orderAttrIdCard");
					}
					order.broadband.init_select();
				}
	};
	return {
		searchADD : _searchADD,
		getCity  : _getCity,
		getArea  : _getArea,
		searchRes	: _searchRes,
		rescapability	: _rescapability,
		ResInfoList	: _ResInfoList,
		setSl	: _setSl,
		searchProd	: _searchProd,
		initProd	: _initProd,
		buyService	: _buyService,
		confirm	: _confirm,
		showMap	: _showMap,
		closeMap	: _closeMap,
		printVoucher	: _printVoucher,
		searchMd	: _searchMd,
		selectYYT	: _selectYYT,
		saveHtml2Pdf	: _saveHtml2Pdf,
		goCust	: _goCust,
		ProdOfferInfo	: _ProdOfferInfo,
		orderSubmit		: _orderSubmit,
		feeInfos	: _feeInfos,
		init_select	: _init_select,
		cust	: _cust,
		showCust	: _showCust,
		getPayTocken   :_getPayTocken,
		queryPayOrdStatus:_queryPayOrdStatus,
		showEditPage	: _showEditPage,
		confirmcal	: _confirmcal,
		closecal	: _closecal,
		queryAuthenticDataRange	: _queryAuthenticDataRange,
		alldownRateList	: _alldownRateList,
		myFlag          :_myFlag,
		showJbr         :_showJbr,
		closeJbr        :_closeJbr,
		isNeedJbr       :_isNeedJbr,
		checkJbrParam   :_checkJbrParam,
		isSameOne       :_isSameOne,
		queryJbr        :_queryJbr,
		searchJbr       :_searchJbr,
		jbrPictureName  :_jbrPictureName,
		canCallPhote    :_canCallPhote,
		getJbrInfo      :_getJbrInfo,
		haveCallPhote   :_haveCallPhote,
		resetId   :_resetId,
		jbrInfoFillIn   :_jbrInfoFillIn,
		isOldCust       :_isOldCust,
		setNoPhoto      :_setNoPhoto
	}
})()
/**
 * 订单准备
 * 
 * @author tang
 */
CommonUtils.regNamespace("cust");
/**
 * 订单准备
 */
cust = (function(){
	var _clearCustForm = function(){
		$('#cmCustName').val("");
		$('#cmAddressStr').val("");
		$('#telNumber').val("");
		$('#mailAddressStr').val("");
		$('#cmCustIdCard').val("");
		$('#cmCustIdCardOther').val("");
		cust.validatorForm();
	};
	
	//客户新增提交
	var _newCustSubmit = function(){
		$('#custFormdata').data('bootstrapValidator').validate();
		if($('#custFormdata').data('bootstrapValidator').isValid()){
			/*var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}*/
			_checkIdentity();
		}
	};
	
	
	var _custSubmit = function(){
		//从页面信息读取到cust缓存
		OrderInfo.cust.custId = -1;//客户地区
		OrderInfo.cust.partyName = $('#cmCustName').val();//客户名称
		OrderInfo.cust.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.cust.telNumber = $('#telNumber').val();//联系电话
		OrderInfo.cust.addressStr = $('#cmAddressStr').val();//客户地址
		OrderInfo.cust.mailAddressStr = $('#mailAddressStr').val();//通信地址
		OrderInfo.cust.identityCd = $('#cm_identidiesTypeCd').val();//证件类型
		if(OrderInfo.cust.identityCd==1){
			OrderInfo.cust.identityNum = $('#cmCustIdCard').val();//证件号码
		}else{
			OrderInfo.cust.identityNum = $('#cmCustIdCardOther').val();//证件号码
		}
		var flag=$("#flag").val();
		if(ec.util.isObj(flag)){//有值代表是实名制创建客户页面
			var data = {
				boCustInfos : [],
				boCustIdentities : []	
			};
			_getCustInfo();
			data.boCustInfos.push(OrderInfo.boCustInfos);
			data.boCustIdentities.push(OrderInfo.boCustIdentities);
			SoOrder.submitOrder(data);
		}else{
			
			common.saveCust();
		}
	};
	
	//拼接客户信息跟客户属性从cust节点解析到boCustInfos，boCustIdentities
	var _getCustInfo = function(){
		OrderInfo.boCustInfos.name = OrderInfo.cust.partyName;//客户名称
		OrderInfo.boCustInfos.areaId = OrderInfo.staff.areaId;//客户地区
		OrderInfo.boCustInfos.partyTypeCd = 1 ;//客户类型
		OrderInfo.boCustInfos.defaultIdType = 1 ;//证件类型
		OrderInfo.boCustInfos.addressStr= OrderInfo.cust.addressStr;//客户地址
		OrderInfo.boCustInfos.telNumber = OrderInfo.cust.telNumber;//联系电话
		OrderInfo.boCustInfos.mailAddressStr = OrderInfo.cust.mailAddressStr;//通信地址
		OrderInfo.boCustInfos.state = "ADD";
		
		OrderInfo.boCustIdentities.identidiesTypeCd = OrderInfo.cust.identityCd;//证件类型
		OrderInfo.boCustIdentities.identityNum = OrderInfo.cust.identityNum;//证件号码
		OrderInfo.boCustIdentities.isDefault = "Y";
		OrderInfo.boCustIdentities.state = "ADD";
	};
	
	
	//客户修改提交
	var _updateCustSubmit = function(){
		$('#custFormdata').data('bootstrapValidator').validate();
		if($('#custFormdata').data('bootstrapValidator').isValid()){
			/*var url=contextPath+"/order/createorderlonger";
			var response = $.callServiceAsJson(url, {});
			if(response.code==0){
				OrderInfo.custorderlonger=response.data;
			}
			_checkIdentity();*/
			
			var data = {};
			data.boCustInfos = [{
				areaId : OrderInfo.cust.areaId,
				name : $("#boCustIdentities").attr("partyName"),
				norTaxPayerId : "0",
				partyTypeCd : $("#boCustIdentities").attr("partyTypeCd"),
				addressStr :$("#boCustIdentities").attr("addressStr"),
				state : "DEL"
			},{
				areaId : OrderInfo.cust.areaId,
				name : modifyCustInfo.custName,
				norTaxPayerId : "0",
				partyTypeCd : $("#cmPartyTypeCd").val(),
				addressStr :modifyCustInfo.addressStr,
				state : "ADD"
			}];
			if(!ec.util.isObj(OrderInfo.cust.idCardNumber)){
				data.boCustIdentities = [{
					identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
					identityNum : modifyCustInfo.custIdCard,
					isDefault : "Y",
					state : "ADD"
				}];	
			}else{
				data.boCustIdentities = [{
					identidiesTypeCd :OrderInfo.cust.identityCd,
					identityNum : OrderInfo.cust.idCardNumber,
					isDefault : "Y",
					state : "DEL"
				},{
					identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
					identityNum : modifyCustInfo.custIdCard,
					isDefault : "Y",
					state : "ADD"
				}];
			}
			SoOrder.submitOrder(data);
		}
	};
	
    
	//验证证件号码是否存在
	var _checkIdentity = function() {
		var areaId = OrderInfo.staff.areaId;
		if(areaId==null||areaId==""){
			areaId=OrderInfo.staff.areaId;
		}
		var custName=$("#p_cust_areaId_val").val();
		createCustInfo = {
			cAreaId : areaId,
			cAreaName : custName,
			cCustName : $.trim($("#cCustName").val()),
			cCustIdCard :  $.trim($("#cCustIdCard").val()),
			cPartyTypeCd : $.trim($("#partyTypeCd  option:selected").val()),
			cIdentidiesTypeCd : $.trim($("#identidiesTypeCd  option:selected").val()),
			cAddressStr :$.trim($("#cAddressStr").val())
		};
		diffPlace=$("#DiffPlaceFlag").val();
		var params = {
			"acctNbr":"",
			"identityCd":createCustInfo.cIdentidiesTypeCd,
			"identityNum":createCustInfo.cCustIdCard,
			"partyName":"",
			"custQueryType":$("#custQueryType").val(),
			"diffPlace":diffPlace,
			"areaId" : createCustInfo.cAreaId
		};
		var url=contextPath+"/app/cust/checkIdentity";
		var response = $.callServiceAsJson(url, params, {"before":function(){
			$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
		}});
		var msg="";
		if (response.code == 0) {
			$.unecOverlay();
			$.confirm("确认","此证件号码已存在,是否确认新建?",{ 
				yes:function(){	
					_custSubmit();
				},
				no:function(){
					
				}
			});
		}else{
			$.unecOverlay();
			_custSubmit();
		}
	};
	
	var _form_custInfomodify_btn = function() {
		//修改客户下一步确认按钮
		$('#custInfoModifyBtn').off("click").on("click",function(event) {
			$('#custFormdata').data('bootstrapValidator').validate();
			if($('#custFormdata').data('bootstrapValidator').isValid()){
				var modifyCustInfo={};
				modifyCustInfo = {
						custName : $.trim($("#cmCustName").val()),
						identidiesTypeCd :  $("#div_cm_identidiesType  option:selected").val(),
						custIdCard :  $.trim($("#cmCustIdCard").val()),
						addressStr: $.trim($("#cmAddressStr").val())
				};
				var data = {};
				data.boCustInfos = [{
					areaId : OrderInfo.cust.areaId,
					name : $("#boCustIdentities").attr("partyName"),
					norTaxPayerId : "0",
					partyTypeCd : $("#boCustIdentities").attr("partyTypeCd"),
					addressStr :$("#boCustIdentities").attr("addressStr"),
					state : "DEL"
				},{
					areaId : OrderInfo.cust.areaId,
					name : modifyCustInfo.custName,
					norTaxPayerId : "0",
					partyTypeCd : $("#cmPartyTypeCd").val(),
					addressStr :modifyCustInfo.addressStr,
					state : "ADD"
				}];
				if(!ec.util.isObj(OrderInfo.cust.idCardNumber)){
					data.boCustIdentities = [{
						identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
						identityNum : modifyCustInfo.custIdCard,
						isDefault : "Y",
						state : "ADD"
					}];	
				}else{
					data.boCustIdentities = [{
						identidiesTypeCd :OrderInfo.cust.identityCd,
						identityNum : OrderInfo.cust.idCardNumber,
						isDefault : "Y",
						state : "DEL"
					},{
						identidiesTypeCd :modifyCustInfo.identidiesTypeCd,
						identityNum : modifyCustInfo.custIdCard,
						isDefault : "Y",
						state : "ADD"
					}];
				}
//				//客户联系人
				data.boPartyContactInfo=[];
				var _boPartyContactInfoOld = {
						contactId : $("#contactIdOld").val(),//参与人联系信息的唯一标识
						statusCd : "100001",
						contactName : $("#contactNameOld").val(),//参与人的联系人名称
						headFlag :  $("#headFlagOld").val(),//是否首选联系人
						state : "DEL"//状态
				};
				var _boPartyContactInfo = {
						contactAddress : $.trim($("#contactAddress").val()),//参与人的联系地址
						contactId : "",//参与人联系信息的唯一标识
						contactName : $.trim($("#contactName").val()),//参与人的联系人名称
						headFlag :  $("#headFlag").val(),//是否首选联系人
						staffId : OrderInfo.staff.staffId,//员工ID
						state : "ADD",//状态
						statusCd : "100001"//订单状态
				};
				if(ec.util.isObj(_boPartyContactInfoOld.contactId)){
					data.boPartyContactInfo.push(_boPartyContactInfoOld);
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}else if(ec.util.isObj($.trim($("#contactName").val()))&&ec.util.isObj($.trim($("#contactAddress").val()))){
					data.boPartyContactInfo.push(_boPartyContactInfo);
				}
					
				SoOrder.submitOrder(data);
			}
		});
	};
    //客户类型选择事件
	var _partyTypeCdChoose = function(scope) {
		var partyTypeCd=$(scope).val();
		//_partyType(partyTypeCd);
		$("#cm_identidiesTypeCd").empty();
		//客户类型关联证件类型下拉框
		_certTypeByPartyType(partyTypeCd);
		//证件类型选择事件
		_identidiesTypeCdChoose($("#div_cm_identidiesType").children(":first-child"));

	};
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd){
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
		   			$.alert("错误","根据员工类型查询员工证件类型无数据,请配置");
					return;
				}
	   if(response.code==0){
					var data = response.data ;
					var currentCT = $("#currentCT").val();//渠道类型
					//只有定义的渠道类型新建客户的时候可以选择非身份证类型,其他的渠道类型只能选择身份证类型。
					var isAllowChannelType = false;
					if (currentCT == CONST.CHANNEL_TYPE_CD.ZQZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXDL
						|| currentCT == CONST.CHANNEL_TYPE_CD.HYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.SYKHZXDL
						|| currentCT == CONST.CHANNEL_TYPE_CD.XYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXJL
						|| currentCT == CONST.CHANNEL_TYPE_CD.ZYOUT || currentCT == CONST.CHANNEL_TYPE_CD.ZYINGT
						|| currentCT == CONST.CHANNEL_TYPE_CD.WBT) { // || _partyTypeCd != "1" //新建政企客户时同样有这个限制
						isAllowChannelType = true;
					}
					if(data!=undefined && data.length>0){
						for(var i=0;i<data.length;i++){
							var certTypedate = data[i];
							if (certTypedate.certTypeCd == "1") {//身份证
									$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
								}else if(isAllowChannelType){//如果自有渠道，开放所有
									$("#cm_identidiesTypeCd").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
								}
						}
					}
				}
	};
	//证件类型选择事件
	var _identidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
		if(identidiesTypeCd==undefined){
			identidiesTypeCd=$("#div_cm_identidiesType  option:selected").val();
		}
		$("#cmCustName").removeAttr("readonly");
		$("#cmCustIdCard").removeAttr("readonly");
		$("#cmAddressStr").removeAttr("readonly");
		if(identidiesTypeCd==1){
			$("#cmCustIdCard").attr("placeHolder","请输入合法身份证号码");
			$("#div-cmcustidcard").show();
			$("#div-cmcustidcard-none").hide();
			
			$("#cmCustName").attr("readonly","readonly");
			$("#cmCustIdCard").attr("readonly","readonly");
			$("#cmAddressStr").attr("readonly","readonly");
			
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",false,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",true,null);
		}else if(identidiesTypeCd==2){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法军官证");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else if(identidiesTypeCd==3){
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法护照");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}else{
			$("#cmCustIdCardOther").attr("placeHolder","请输入合法证件号码");
			$("#div-cmcustidcard-none").show();
			$("#div-cmcustidcard").hide();
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCardOther",true,null);
			$('#custFormdata').data('bootstrapValidator').enableFieldValidators("cmCustIdCard",false,null);
		}
		_form_custInfomodify_btn();
	};
	
	//校验表单提交
	var _validatorForm=function(){
		$('#custFormdata').bootstrapValidator({
	        message: '无效值',
	        feedbackIcons: {
	            valid: 'glyphicon glyphicon-ok',
	            invalid: 'glyphicon glyphicon-remove',
	            validating: 'glyphicon glyphicon-refresh'
	        },
	        fields: {
	        	cmCustName: {
	        		trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '客户姓名不能为空'
	                    }
	                }
	            },
	            cmCustIdCard: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '身份证号码不能为空'
	                    },
	                    regexp: {
	                        regexp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
	                        message: '请输入合法身份证号码'
	                    }
	                }
	            },
	            cmCustIdCardOther: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '证件号码不能为空'
	                    },
	                    regexp: {
	                        regexp: /^[0-9a-zA-Z]*$/g,
	                        message: '证件号码只能为数字或字母'
	                    }
	                }
	            },
	            cmAddressStr: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '证件地址不能为空'
	                    }
	                }
	            },
	            phonenumber: {
	            	trigger: 'blur',
	                validators: {
	                    notEmpty: {
	                        message: '手机号码不能为空'
	                    }
	                }
	            }
	        }
	    });
	};
	
	//获取证件类型以及初始化
	var _getIdentidiesTypeCd=function(){
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		//取客户证件类型
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
		
		OrderInfo.busitypeflag=12;
        var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.ACTIVERETURN;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,9,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");
		SoOrder.initFillPage();
	};
	
	//初始化新增客户
	var _initNewCust = function(){
		cust.validatorForm();
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		//取客户证件类型
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
	
		$('#newCustBtn').off("click").on("click",_newCustSubmit);
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUST_CREATE;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,8,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");

		SoOrder.initFillPage();
	};
	
	//初始化新增客户
	var _initUpdateCust = function(){
		cust.validatorForm();
		//根据客户类型查询证件类型
		_partyTypeCdChoose("#cmPartyTypeCd");
		//证件类型选中
		$("#cm_identidiesTypeCd").find("option[value="+$("#zjlx").val()+"]").attr("selected","selected");
		//取客户证件类型
		$("#cm_identidiesTypeCd option[value='"+$("#boCustIdentities").attr("identidiesTypeCd")+"']").attr("selected", true);
		//根据证件类型对行添加校验
		_identidiesTypeCdChoose($("#cm_identidiesTypeCd option[selected='selected']"));
	
		$('#updateCustBtn').off("click").on("click",_updateCustSubmit);
		var BO_ACTION_TYPE=CONST.BO_ACTION_TYPE.CUSTINFOMODIFY;
		OrderInfo.initData(CONST.ACTION_CLASS_CD.CUST_ACTION,BO_ACTION_TYPE,4,CONST.getBoActionTypeName(BO_ACTION_TYPE),"");

		/*OrderInfo.staff = { //员工登陆信息
			staffId : sessionStaff.staffId,  //员工id
			channelId : sessionStaff.currentChannelId,   //受理渠道id
			channelName: "",
			areaId : 0,    //受理地区id
			areaCode : 0,
			soAreaId : sessionStaff.currentAreaId,    //新装受理地区id
			soAreaCode : 0, 
			distributorId : "" //转售商标识
		};*/
		SoOrder.initFillPage();
	};
	
	var _getIDCardInfos=function(name,idcard,address,photosBase64){
		$("#cmCustName").val(name);
		$("#cm_identidiesTypeCd").val("1");
		$("#cm_identidiesTypeCd").change();
		$("#cmCustIdCard").val(idcard);
		$("#cmAddressStr").val(address);
		$("#photos").attr("src","data:image/jpg;base64,"+photosBase64);
	};
	
	var _getPicture=function(photosBase64){
		$("#photos").attr("src","data:image/jpg;base64,"+photosBase64);
	};
	
	var _getGenerationInfos=function(name,idcard,address){
		$("#cmCustName").val(name);
		$("#cm_identidiesTypeCd").val("1");
		$("#cm_identidiesTypeCd").change();
		$("#cmCustIdCard").val(idcard);
		$("#cmAddressStr").val(address);
	};
	
	//新增客户订单查询页面
	var _custQueryAdd=function(){
		var param = {};
		$.callServiceAsHtml(contextPath+"/app/cust/custQueryAdd",param,{
			"before":function(){
				$.ecOverlay("加载中请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				$("#order-content").hide();
				$("#cust").html(response.data).show();
			},
			fail:function(){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	}
	//新增客户订单查询列表页面
	var _custQueryAddList=function(pageIndex,scroller){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var startDt = $("#p_startDt").val().replace(/-/g,'');
		var endDt = $("#p_endDt").val().replace(/-/g,'');
		if(startDt>endDt){
			$.alert("提示","起始时间不能大于结束时间！");
			return;
		}else{
			param = {
						"startDt":($("#p_startDt").val()).replace(/-/g,''),
						"endDt":($("#p_endDt").val()).replace(/-/g,''),
						nowPage:curPage,
						pageSize:10
				};
			$.callServiceAsHtml(contextPath+"/app/cust/custQueryAddList",param,{
				"before":function(){
					$.ecOverlay("查询中请稍等...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done" : function(response){
					if(response && response.code == -2){
						return ;
					}else{
						if(curPage == 1){
							$("#cust_search").hide();
							$("#cust_list").html(response.data).show();
							$("#cust_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
						if(curPage > 1){
							$("#all_cust_list").append(response.data);
							$("#cust_list_scroller").css("transform","translate(0px, -40px) translateZ(0px)");
							if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
						}
					}
				},
				fail:function(){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		}
	}
	
	//滚动页面入口
	var _scroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_custQueryAddList(scrollObj.page,scrollObj.scroll);
		}
	};
	
	return {
		scroll 						: 		_scroll,
		custQueryAddList 			: 		_custQueryAddList,
		custQueryAdd 				: 		_custQueryAdd,
		getIdentidiesTypeCd 		: 		_getIdentidiesTypeCd,
		identidiesTypeCdChoose		:		_identidiesTypeCdChoose,
		validatorForm				:		_validatorForm,
		initNewCust					:		_initNewCust,
		initUpdateCust				:		_initUpdateCust,
		clearCustForm				:		_clearCustForm,
		getCustInfo					:		_getCustInfo,
		getGenerationInfos			:		_getGenerationInfos,
		getIDCardInfos				: 		_getIDCardInfos,
		getPicture					:		_getPicture
	};	
})();

//$(document).ready(function() {
//	order.prodModify.validatorForm();
//	order.prodModify.getIdentidiesTypeCd();//初始化证件类型
//});
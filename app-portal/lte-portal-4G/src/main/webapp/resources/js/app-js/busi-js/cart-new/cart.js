CommonUtils.regNamespace("cart", "main");
/**
 *订单查询.
 */
cart.main = (function() {
	var _checkOlId;//待审核的虚拟订单号
    //查询
    var _queryCartList = function(pageIndex, scroller) {
        OrderInfo.actionFlag = 40;
        var curPage = 1;
        if (pageIndex > 0) {
            curPage = pageIndex;
        }
        if (pageIndex == 1) {
            $("#islastPage").val(0);
            $("#currentPage").val(1);
        }
        var qryNumber = $("#p_qryNumber").val();
        var param = {};
        var endDate=$("#p_endDt").val();
        if(endDate==""){
        	endDate=$("#p_startDt").val();
        }
        if ($("#if_p_olNbr").is(':checked')) {
            $('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_olNbr", true, null);
            $('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_qryNumber", false, null);
            $('#cartFormdata').data('bootstrapValidator').enableFieldValidators("p_channelId", false, null);
            $('#cartFormdata').data('bootstrapValidator').validate();
            if (!$('#cartFormdata').data('bootstrapValidator').isValid()) {
                return;
            }
            param = {
                "areaId": $("#p_areaId").val(),
                "olNbr": $("#p_olNbr").val(),
                "qryBusiOrder": $("#p_qryBusiOrder").val(),
                "startDt": "",
                "endDt": "",
                "qryNumber": "",
                "channelId": "",
                "olStatusCd": "",
                "busiStatusCd": "",
                nowPage: curPage,
                pageSize: 10
            };
        } else {
            param = {
                "startDt": ($("#p_startDt").val()).replace(/\//g, ''),
                "endDt": endDate.replace(/\//g, ''),
                "qryNumber": qryNumber,
                "olStatusCd": $("#p_olStatusCd").val(),
                "busiStatusCd": $("#p_busiStatusCd").val(),
                "olNbr": "",
                "qryBusiOrder": $("#p_qryBusiOrder").val(),
                "channelId": $("#p_channelId").val(),
                "areaId": $("#p_channelId").attr("areaid"),
                nowPage: curPage,
                pageSize: 10
            };
            if($("#p_endDt").val() != undefined && $("#p_endDt").val() != ""){
            	var validate=$("#cartStatFormdata").Validform();
        		if(!$("#cartStatFormdata").Validform().check()){
        			return;
        		}
            	param.endDt = ($("#p_endDt").val()).replace(/\//g, '');
            }
        }
        param.newFlag="1";
        $.callServiceAsHtmlGet(contextPath + "/app/report/cartList", param, {
            "before": function() {
                $.ecOverlay("购物车查询中，请稍等...");
            },
            "always": function() {
                //$.unecOverlay();
            },
            "done": function(response) {
                $.unecOverlay();
                if (response && response.code == -2) {
                    return;
                } else {
                    OrderInfo.order.step = 2;
                    if (response.data == "" || (response.data).indexOf("没有查询到结果") >= 0) {
                        $("#islastPage").val(1);
                        $("#currentPage").val(Number(curPage) - 1);
                        $.alert("提示", "没有查询到结果");
                        return;
                    }
                    $("#nav-tab-1").removeClass("active in");
        	    	$("#nav-tab-2").addClass("active in");
        	    	$("#tab1_li").removeClass("active");
        	    	$("#tab2_li").addClass("active");
                   
                    if (curPage == 1) {
                    	 $("#nav-tab-2").children('.list-box').html(response.data);
                         $('a[href="#nav-tab-2"]').click();
                    } else {
                    	$("#order-list-all").empty();
                        $("#order-list-all").append(response.data);
                        $.refresh($("#order-list-all"));
                    }
                    
                    //回调刷新iscroll控制数据,控件要求
                    if (scroller && $.isFunction(scroller)) scroller.apply(this, []);
                }
            },
            fail: function(response) {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        });
    };
    //改变渠道-监听
    var _channelChange = function() {
        if ($("#p_channelId").val() != "") {
            $("#p_areaId_val").attr("disabled", true);
        } else {
            $("#p_areaId_val").attr("disabled", false);
        }
    };
    //滚动页面入口
    var _scroll = function(scrollObj) {
        if (scrollObj && scrollObj.page && scrollObj.page >= 1) {
            _queryCartList(scrollObj.page, scrollObj.scroll);
        }
    };
    //购物车流水号选中与否
    var _olNbrChange = function() {
        if ($("#if_p_olNbr").is(':checked')) {
            $("#p_areaId_val").attr("disabled", false);
            $("#p_olNbr").attr("disabled", false);
            $(".form_date").datetimepicker('remove');
            $("#p_qryNumber").attr("disabled", true);
            $("#p_olStatusCd").attr("disabled", true);
            $("#p_busiStatusCd").attr("disabled", true);
            $("#p_channelId").attr("disabled", true);
        } else {
            $("#p_olNbr").attr("disabled", true);
            $(".form_date").datetimepicker({
                language: 'zh-CN',
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                minView: 2,
                forceParse: 0
            });
            $("#p_qryNumber").attr("disabled", false);
            $("#p_olStatusCd").attr("disabled", false);
            $("#p_busiStatusCd").attr("disabled", false);
            $("#p_channelId").attr("disabled", false);
            if ($("#p_channelId").val() != "") {
                $("#p_areaId_val").attr("disabled", true);
            } else {
                $("#p_areaId_val").attr("disabled", false);
            }
        }
        $("select").addClass("styled-select");
    };
    //校验表单提交
    var _validatorForm = function() {
        $('#cartFormdata').bootstrapValidator({
            message: '无效值',
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                p_qryNumber: {
                    trigger: 'blur',
                    validators: {
                        notEmpty: {
                            message: '接入号和渠道不能同时为空'
                        }
                    }
                },
                p_olNbr: {
                    trigger: 'blur',
                    validators: {
                        notEmpty: {
                            message: '购物车流水不能为空'
                        }
                    }
                },
                p_channelId: {
                    trigger: 'blur',
                    validators: {
                        notEmpty: {
                            message: '接入号和渠道不能同时为空'
                        }
                    }
                }
            }
        });
    };
    
    var _statValidatorForm = function(){
    	var cartStatFormdata = $("#cartStatFormdata").Validform({
			btnSubmit:"bt_cartQry",
			ignoreHidden:true,
			tiptype:function(msg,o,cssctl){
				
				//msg：提示信息;
				//o:{obj:*,type:*,curform:*}, obj指向的是当前验证的表单元素（或表单对象），type指示提示的状态，值为1、2、3、4， 1：正在检测/提交数据，2：通过验证，3：验证失败，4：提示ignore状态, curform为当前form对象;
				//cssctl:内置的提示信息样式控制函数，该函数需传入两个参数：显示提示信息的对象 和 当前提示的状态（既形参o中的type）;
				if(!o.obj.is("form")){//验证表单元素时o.obj为该表单元素，全部验证通过提交表单时o.obj为该表单对象;
					if(o.type == 3){
						var objtip=o.obj.siblings(".Validform_checktip");
						cssctl(objtip,o.type);
						objtip.text(msg);
					}
					if(o.type == 2){
						var objtip=o.obj.siblings(".Validform_checktip");
						cssctl(objtip,o.type);
						objtip.text("");
					}
				}
			}
		});
    	cartStatFormdata.addRule([
			{
			    ele:"#p_startDt",
			    datatype:"*",
			    nullmsg:"起始时间不能为空"
			},
			{
				ele:"#p_endDt",
			    datatype:"*",
			    nullmsg:"结束时间不能为空"
			}       
		]);
    };
    
    //受理单详情查询
    var _queryCartInfo = function(olId) {
        var param = {
            "olId": olId
        };
        param.areaId = $("#p_areaId").val();
        param.newFlag="1";
        $.callServiceAsHtmlGet(contextPath + "/app/report/cartInfo", param, {
            "before": function() {
                $.ecOverlay("详情查询中，请稍等...");
            },
            "always": function() {
                $.unecOverlay();
            },
            "done": function(response) {
                if (response && response.code == -2) {
                    return;
                } else {
                    $("#cart_list_div").hide();
                    $("#cart_info").html(response.data);
                    //针对jquery.overlay.js中unecOverlay()方法的bug，做的修复处理
                    setTimeout(function(){$('#cart_info_modal').modal('show');},500);
                }
            },
            fail: function(response) {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        });
    };
    //受理业务详情查询
    var _showOffer = function(obj) {
        var param = {
            "olId": $(obj).attr("olid"),
            "boId": $(obj).attr("boid"),
            "offerId": $(obj).attr("offerid"),
            "prodId": $(obj).attr("prodid")
        };
        $.callServiceAsHtmlGet(contextPath + "/app/report/cartOfferInfo", param, {
            "before": function() {
                $.ecOverlay("详情查询中，请稍等...");
            },
            "always": function() {
                $.unecOverlay();
            },
            "done": function(response) {
                if (response && response.code == -2) {
                    return;
                } else {
                    $("#cart_info").hide();
                    $("#cart_item_detail").html(response.data).show();
                    OrderInfo.order.step = 4;
                }
            },
            fail: function(response) {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        });
    };
    var _initDic = function() {
        OrderInfo.actionFlag = 40;
        OrderInfo.order.step = 1;
        var param = {
            "attrSpecCode": "EVT-0002"
        };
        $.callServiceAsJson(contextPath + "/app/staffMgr/getCTGMainData", param, {
            "done": function(response) {
                if (response.code == 0) {
                    var data = response.data;
                    if (data != undefined && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var busiStatus = data[i];
                            $("#p_busiStatusCd").append("<option value='" + busiStatus.attrValueCode + "' >" + busiStatus.attrValueName + "</option>");
                            $("#p_olStatusCd").append("<option value='" + busiStatus.attrValueCode + "' >" + busiStatus.attrValueName + "</option>");
                        }
                        $("#p_busiStatusCd").addClass("styled-select");
                        $("#p_olStatusCd").addClass("styled-select");
                    }
                } else if (response.code == -2) {
                    $.alertM(response.data);
                    return;
                } else {
                    $.alert("提示", "调用主数据接口失败！");
                    return;
                }
            }
        });
    };
    var _setCalendar = function(time) {
        $("#p_start_input").val(time);
        $("#p_startDt").val(time);
    };
    //返回按钮调用
    var _cartBack = function() {
        if (OrderInfo.order.step == 1) {
            common.callCloseWebview();
        } else if (OrderInfo.order.step == 2) {
            $("#cart_search").show();
            $("#cart_list_div").hide();
            $("#nav-tab-2").removeClass("active in");
	    	$("#nav-tab-1").addClass("active in");
	    	$("#tab2_li").removeClass("active");
	    	$("#tab1_li").addClass("active");
            OrderInfo.order.step = 1;
        }
    };
   
	//终端销售 滚动页面入口
	var _termSaleScroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_btnQueryTerminalSale(scrollObj.page,scrollObj.scroll);
		}
	};
	//查询
	var _btnQueryTerminalSale = function(pageIndex,scroller){
		OrderInfo.actionFlag=150;
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex;
		}
		if(pageIndex==1){
			$("#islastPage").val(0);
			$("#currentPage").val(1);
		}
		var param = {} ;
		param = {
					"startDate":($("#p_startDt").val()).replace(/-/g,''),
					"endDate":($("#p_endDt").val()).replace(/-/g,''),
					"channelId":$("#p_channelId").val(),
					"areaId":$("#p_channelId").attr("areaid"),
					pageIndex:curPage,
					pageSize:10
		};
		param.newFlag="1";
        $.callServiceAsHtmlGet(contextPath+"/app/report/terminalSalesList",param,{
			"before":function(){
				$.ecOverlay("终端销售详情查询中，请稍等...");
			},
			"always":function(){
				//$.unecOverlay();
			},
			"done" : function(response){
				$.unecOverlay();
				if(response && response.code == -2){
					return ;
				}else{
					if(response.data==""||(response.data).indexOf("没有查询到结果")>=0){
						$("#islastPage").val(1);
						$("#currentPage").val(Number(curPage)-1);
						$.alert("提示","没有查询到结果");
						return;
					}
					OrderInfo.order.step=2;
					$("#nav-tab-1").removeClass("active in");
        	    	$("#nav-tab-2").addClass("active in");
        	    	$("#tab1_li").removeClass("active");
        	    	$("#tab2_li").addClass("active");
                   
                    if (curPage == 1) {
                    	 $("#nav-tab-2").children('.list-box').html(response.data);
                         $('a[href="#nav-tab-2"]').click();
                    } else {
                    	 $("#order-list-all").empty();
                        $("#order-list-all").append(response.data);
                        $.refresh($("#order-list-all"));
                    }
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
    //受理单查询上一页
    var _upPage = function() {
        var currentPage = Number($("#currentPage").val());
        if (currentPage == 1) {
            $.alert("提示", "当前已经是第一页");
            return;
        } else {
            currentPage = currentPage - 1;
        }
        $("#islastPage").val(0);
        $("#currentPage").val(currentPage);
        _queryCartList(currentPage)
    };
    //受理单查询下一页
    var _nextPage = function() {
        var currentPage = Number($("#currentPage").val());
        var isLastPage = $("#islastPage").val();
        if (isLastPage == 1) {
            $.alert("提示", "已经到最后一页!");
            return;
        }
        currentPage = currentPage + 1;
        $("#currentPage").val(currentPage);
        _queryCartList(currentPage)
    };
    
    //终端销售查询上一页
    var _upPage2 = function() {
        var currentPage = Number($("#currentPage").val());
        if (currentPage == 1) {
            $.alert("提示", "当前已经是第一页");
            return;
        } else {
            currentPage = currentPage - 1;
        }
        $("#islastPage").val(0);
        $("#currentPage").val(currentPage);
        _btnQueryTerminalSale(currentPage)
    };
    //终端销售查询下一页
    var _nextPage2 = function() {
        var currentPage = Number($("#currentPage").val());
        var isLastPage = $("#islastPage").val();
        if (isLastPage == 1) {
            $.alert("提示", "已经到最后一页!");
            return;
        }
        currentPage = currentPage + 1;
        $("#currentPage").val(currentPage);
        _btnQueryTerminalSale(currentPage)
    };
    
    //费用详情查询上一页
    var _upPage3 = function() {
        var currentPage = Number($("#currentPage").val());
        if (currentPage == 1) {
            $.alert("提示", "当前已经是第一页");
            return;
        } else {
            currentPage = currentPage - 1;
        }
        $("#islastPage").val(0);
        $("#currentPage").val(currentPage);
        _btnQueryfee(currentPage)
    };
    //费用详情查询下一页
    var _nextPage3 = function() {
        var currentPage = Number($("#currentPage").val());
        var isLastPage = $("#islastPage").val();
        if (isLastPage == 1) {
            $.alert("提示", "已经到最后一页!");
            return;
        }
        currentPage = currentPage + 1;
        $("#currentPage").val(currentPage);
        _btnQueryfee(currentPage)
    };
    
    
	//终端销售 滚动页面入口
	var _feeScroll = function(scrollObj){
		if(scrollObj && scrollObj.page && scrollObj.page >= 1){
			_btnQueryfee(scrollObj.page,scrollObj.scroll);
		}
	};
	//查询
	var _btnQueryfee = function(pageIndex,scroller){
		OrderInfo.actionFlag=140;
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		if(pageIndex==1){
			$("#islastPage").val(0);
			$("#currentPage").val(1);
		}
		var param = {} ;
		param = {
					"startDate":($("#p_startDt").val()).replace(/-/g,''),
					"endDate":($("#p_endDt").val()).replace(/-/g,''),
					"channelId":$("#p_channelId").val(),
					"areaId":$("#p_channelId").attr("areaid"),
					pageIndex:curPage,
					pageSize:10
		};
		param.newFlag="1";
        $.callServiceAsHtmlGet(contextPath+"/app/report/freeInfoList",param,{
			"before":function(){
				$.ecOverlay("终端销售详情查询中，请稍等...");
			},
			"always":function(){
			  //$.unecOverlay();
			},
			"done" : function(response){
				$.unecOverlay();
				if(response && response.code == -2){
					return ;
				}else{
					if((response.data).indexOf("没有查询到结果")>=0){
						$("#islastPage").val(1);
						$("#currentPage").val(Number(curPage)-1);
						$.alert("提示","没有查询到结果");
						return;
					}
					OrderInfo.order.step=2;
					$("#nav-tab-1").removeClass("active in");
        	    	$("#nav-tab-2").addClass("active in");
        	    	$("#tab1_li").removeClass("active");
        	    	$("#tab2_li").addClass("active");
                   
                    if (curPage == 1) {
                    	 $("#nav-tab-2").children('.list-box').html(response.data);
                         $('a[href="#nav-tab-2"]').click();
                    } else {
                    	$("#order-list-all").empty();
                        $("#order-list-all").append(response.data);
                        $.refresh($("#order-list-all"));
                    }
					if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};

//远程审核根据虚拟订单号获取经办人实名制照片
 var _getjbrPhotos = function(){
	 if($("#p_qry_olId").val().trim()==""){
		 $.alert("提示", "虚拟订单号不能为空");
		 return;
	 }
    //调用后台接口下载经办人身份证照片和拍照照片
	 var params={
			 areaId		: $("#p_channelId").attr("areaid"),
			 srcFlag	: "REAL",
			 olId		: $("#p_qry_olId").val().trim()
	 }
	 _checkOlId=params.olId;
	 $.callServiceAsJson(contextPath+"/app/realName/photoCheck/downloadCustCertificate", params, {
			"before":function(){
				$.ecOverlay("<strong>正在获取实名审核信息中, 请稍等...</strong>");
			},
			"done" : function(response){
				if (response.code == 0 && response.data) {
					$.unecOverlay();
					for(var i=0; i<response.data.photographs.length;i++){
						if(response.data.photographs[i].picFlag == "C"){
							var _identidiesPic = response.data.photographs[i].photograph;
						}else if(response.data.picturesInfo[i].picFlag == "D"){
							var _custPhoto = response.data.photographs[i].photograph;
						}
					}
					$("#img_photo_show1").attr("src", "data:image/jpeg;base64," + _identidiesPic);
					$("#img_photo_show2").attr("src", "data:image/jpeg;base64," + _custPhoto);
					$("#check_btn").css("display","block");//审核按钮显示
				}else if(response.code == 1 && response.data){
					$.unecOverlay();
					$.alert("错误", "经办人实名照片获取失败，错误原因：" + response.data);
					return;
				}else if(response.code == -2 && response.data){
					$.unecOverlay();
					$.alertM(response.data);
					return;
				}else{
					$.unecOverlay();
					$.alert("错误", "经办人实名制照片获取发生未知异常，请稍后重试。错误信息：" + response.data);
					return;
				}
			},
			"always":function(){
				$("#check_photo").slideDown();
			}
		});
	};
	
	//远程审核
	 var _checkjbrPhotos = function(){
//		 if($("#p_qry_olId").val().trim()!=_checkOlId){
//			 $.alert("提示", "你已修改了虚拟订单号,请重新查询后审核");
//			 return;
//		 }
		 var params = {
				    "areaId"		:$("#p_channelId").attr("areaid"),
					"olId"          :$("#p_qry_olId").val().trim(),
					"checkType"     :"2",
					"srcFlag"       :"REAL",
					"staffId"       :OrderInfo.staff.staffId+""
				};
		$.callServiceAsJson(contextPath + "/app/realName/photoCheck/savePhotographReviewRecord", params, {
			"before" : function() {
				$.ecOverlay("<strong>正在确认审核信息, 请稍等...</strong>");
			},
			"done" : function(response) {
				if(response.code == 0 && response.data){
					if(ec.util.isObj(response.data)){
						$.unecOverlay();
						$.alert("信息", response.data);
					} else{
						$.unecOverlay();
						$.alert("信息", "审核成功");
					}
				}else if(response.code == 1 && response.data){
					$.unecOverlay();
					$.alert("错误", "审核确认信息发送失败，错误原因：" + response.data);
					return false;
				}else if(response.code == -2 && response.data){
					$.unecOverlay();
					$.alertM(response.data);
					return false;
				}else{
					$.unecOverlay();
					$.alert("错误", "审核确认信息发生未知异常，请稍后重试。错误信息：" + response.data);
					return false;
				}
			},
			"fail" : function(response) {
				$.unecOverlay();
				$.alert("错误","审核确认信息发生未知异常：" + response.data);
				return false;
			},
			"always" : function() {
				
			}
		});
	 };
	 
		//测试
	var _testUrl = function(){
		var requestParams = {};		
		$.callServiceAsJson(contextPath + "/app/realName/photoCheck/qryOperateSpecStaffList", requestParams, {
			"before" : function() {
				$.ecOverlay("<strong>正在查询审核人员信息, 请稍等...</strong>");
			},
			"done" : function(response) {
				if(response.code == 0 && response.data){
//					response.data= [{
//							phone:"18099999999",
//							staffCode:"905899",
//							staffId:30034129612,
//							staffName:"李志华",
//							statusCd:"1000"
//						}];
//					_setOperateSpecStaffList(response.data);
//					OrderInfo.handleInfo.staffList = response.data;
					alert(JSON.stringify(response.data));
				}else if(response.code == 1 && response.data){
					$.alert("错误", "查询审核人员失败，错误原因：" + response.data);
					return null;
				}else if(response.code == -2 && response.data){
					$.alertM(response.data);
					return null;
				}else{
					$.alert("错误", "查询审核人员发生未知异常，请稍后重试。错误信息：" + response.data);
					return null;
				}
			},
			"fail" : function(response) {
				$.alert("错误","查询审核人员信息发生未知异常：" + response.data);
				return null;
			},
			"always" : function() {
				$.unecOverlay();
			}
		});
	};
    return {
        cartBack: _cartBack,
        channelChange: _channelChange,
        queryCartList: _queryCartList,
        queryCartInfo: _queryCartInfo,
        initDic: _initDic,
        olNbrChange: _olNbrChange,
        scroll: _scroll,
        setCalendar: _setCalendar,
        showOffer: _showOffer,
        validatorForm: _validatorForm,
        upPage: _upPage,
        nextPage: _nextPage,
        upPage2: _upPage2,
        nextPage2: _nextPage2,
        upPage3: _upPage3,
        nextPage3: _nextPage3,
        statValidatorForm	:_statValidatorForm,
        btnQueryTerminalSale:_btnQueryTerminalSale,
        btnQueryfee         :_btnQueryfee,
        termSaleScroll      :_termSaleScroll,
        feeScroll           :_feeScroll,
        getjbrPhotos        :_getjbrPhotos,
        checkjbrPhotos      :_checkjbrPhotos,
        testUrl             :_testUrl
    };
})();

/**
 * 终端入口
 */
CommonUtils.regNamespace("mktRes", "terminal");
mktRes.terminal = (function() {
    var _offerSpecId = ""; //保存合约附属ID，合约套餐使用
    var pageSize = 10;
    var termInfo = {};
    var hytcmc = ""; //合约名称
    var hytcid = ""; //合约id
    var isSelect = "N"; //是否已经选择合约依赖
    var _hasCheck = false; //是否终端校验过
    /**
     * 橙分期终端串号校验
     */
    var _checkTerminalCode = function() {
        order.orange.orangeOfferSpecId = $("input[name='meal']:checked").val();
        //橙分期校验
        if (order.orange.orangeOfferSpecId == null) {
            $.alert("提示", "请选择橙分期合约包！");
            return;
        }
        
        var param = {
            offerSpecId: order.orange.orangeOfferSpecId,
            offerTypeCd: "2",
            mainOfferSpecId: order.orange.mainOfferSpecId,
            partyId: OrderInfo.cust.custId
        };
        query.offer.queryOfferSpec(param, function() {
            _callBackTerminal();
        });
    };
    /**
     * 橙分期查询完销售品构成后回调
     */
    var _callBackTerminal = function() {
            var offerSpec = order.orange.orangeSpec;
            termInfo = {};
            var terminalNum = $("#terminalNum").val();
            if (terminalNum == "") return;
            if(!AttachOffer.checkTerminalVal($.trim(terminalNum))){
    			$.alert("提示信息","请输入合法的终端串码<br/>-必须14位十六进制或15位十进制数值,不限大小写");
    			return;
    		}
            $.ecOverlay("<strong>终端校验中,请稍后....</strong>");
            var param = {
                instCode: terminalNum,
                flag: "0",
                //	mktResId : resId,
                offerSpecId: order.orange.orangeOfferSpecId
            };
            if (ec.util.isArray(offerSpec.agreementInfos)) { //终端信息
                var terminalGroups = offerSpec.agreementInfos[0].terminalGroups;
                if (ec.util.isArray(terminalGroups)) { //如果有配置终端组，则拼接终端组的规格ID和包含的终端规格ID
                    var termGroup = "";
                    for (var j = 0; j < terminalGroups.length - 1; j++) {
                        termGroup += terminalGroups[j].terminalGroupId + "|";
                    }
                    termGroup += terminalGroups[terminalGroups.length - 1].terminalGroupId;
                    param.termGroup = termGroup;
                }
            }
            var data = query.prod.checkTerminal(param);
            if (data == undefined) {
                return;
            }
            var activtyType = "";
            var spec = order.orange.orangeSpec;
            if (spec.agreementInfos[0] != undefined && spec.agreementInfos[0].activtyType == 2) {
                activtyType = "2";
            }
            if (data.statusCd == CONST.MKTRES_STATUS.USABLE || (data.statusCd == CONST.MKTRES_STATUS.HAVESALE && activtyType == "2")) {
                $.alert("信息提示", data.message);
                var mktPrice = 0; //营销资源返回的单位是元
                var mktColor = "";
                if (ec.util.isArray(data.mktAttrList)) {
                    $.each(data.mktAttrList, function() {
                        if (this.attrId == "65010058") {
                            mktPrice = this.attrValue;
                        } else if (this.attrId == "60010004") {
                            mktColor = this.attrValue;
                        }
                    });
                }
                $("#terminalInfo").html("终端规格：" + data.mktResName + ",终端颜色：" + mktColor + ",合约价格：" + mktPrice + "元");
                mktRes.terminal.hasCheck = true;
                var coupon = {
                    couponUsageTypeCd: "5", //物品使用类型,1-其他，2-赠送，3-销售，4-活动，5-租机
                    inOutTypeId: "1", //出入库类型
                    inOutReasonId: 0, //出入库原因
                    saleId: 1, //销售类型
                    couponId: data.mktResId, //物品ID
                    couponinfoStatusCd: "A", //物品处理状态
                    chargeItemCd: CONST.CHARGE_ITEM_CD.COUPON_SALE, //物品费用项类型
                    couponNum: 1, //物品数量
                    storeId: data.mktResStoreId, //仓库ID
                    storeName: "1", //仓库名称
                    agentId: 1, //供应商ID
                    apCharge: mktPrice, //物品价格,约定取值为营销资源的
                    couponInstanceNumber: data.instCode, //物品实例编码
                    ruleId: "", //物品规则ID
                    partyId: OrderInfo.cust.custId, //客户ID
                    prodId: order.orange.prodId, //产品ID
                    offerId: -1, //销售品实例ID
                    attachSepcId: order.orange.orangeOfferSpecId,
                    state: "ADD", //动作
                    relaSeq: "", //关联序列	
                    num: "1", //第几个串码输入框
                    attrList: data.mktAttrList //终端属性列表
                };
                if (data.statusCd == CONST.MKTRES_STATUS.HAVESALE && activtyType == "2") { //“已销售未补贴”的终端串码可以办理话补合约
                    coupon.couponSource = "2"; //串码话补标识
                }
                if (CONST.getAppDesc() == 0) {
                    coupon.termTypeFlag = data.termTypeFlag;
                }
                OrderInfo.attach2Coupons = [];
                OrderInfo.attach2Coupons.push(coupon);
            } else if (data.statusCd == CONST.MKTRES_STATUS.HAVESALE) {
                $.alert("提示", "终端当前状态为已销售为补贴[1115],只有在办理话补合约时可用");
            } else {
                $.alert("提示", data.message);
            }
        }
        /**
         * 终端串号校验
         */
    var _checkTerminal = function(param) {
        var url = contextPath + "/app/mktRes/terminal/checkTerminal";
        var response = $.callServiceAsJson(url, param);
        $.unecOverlay();
        if (response.code == -2) {
            $.alertM(response.data);
        } else if (response.data && response.data.code == 0) {
            alert(response.data);
            return response.data;
        } else if (response.data.code == 1) {
            $.alert("提示", response.data.message);
        } else {
            $.alert("提示", "<br/>校验失败，请稍后重试！");
        }
    };
    var _showCheckTermianl = function() {
        var terminalNum = $("#terminalNum").val().trim();
        if (terminalNum != "") {
            $("#terminal_call").addClass("dis-none");
            $("#terminal_check").removeClass("dis-none");
        } else {
            $("#terminal_call").removeClass("dis-none");
            $("#terminal_check").addClass("dis-none");
        }
    };
    /**
     * 获取搜索条件
     */
    var _queryApConfig = function() {
        var configParam = {
            "CONFIG_PARAM_TYPE": "TERMINAL_AND_PHONENUMBER"
        };
        var qryConfigUrl = contextPath + "/app/order/queryApConf";
        $.callServiceAsJsonGet(qryConfigUrl, configParam, {
            "done": call_back_success_queryApConfig
        });
    };
    /**
     * 成功获取搜索条件后展示
     */
    var call_back_success_queryApConfig = function(response) {
        var dataLength = response.data.length;
        var _phone_brand;
        var _phone_price_area;
        var _phone_type;
        for (var i = 0; i < dataLength; i++) {
            if (response.data[i].PHONE_BRAND) {
                var _obj = $("#select_brand");
                _phone_brand = response.data[i].PHONE_BRAND;
                for (var m = 0; m < _phone_brand.length; m++) {
                    var phoneBrand = (_phone_brand[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
                    _obj.append("<option value='" + phoneBrand + "'>" + phoneBrand + "</option>");
                }
            }
            if (ec.util.isArray(response.data[i].PHONE_PRICE_AREA)) {
                _phone_price_area = response.data[i].PHONE_PRICE_AREA;
                var phonePriceArea = (_phone_price_area[0].COLUMN_VALUE_NAME).replace(/\"/g, "");
                var phonePriceAreaArry = phonePriceArea.split("-");
                var minPrice = "";
                var maxPrice = "";
                var rang = "";
                if (phonePriceAreaArry.length != 1) {
                    minPrice = phonePriceAreaArry[0];
                } else {
                    phonePriceAreaArry = phonePriceAreaArry.toString();
                    minPrice = phonePriceAreaArry.substring(0, phonePriceAreaArry.length - 2);
                }
                phonePriceArea = (_phone_price_area[_phone_price_area.length - 1].COLUMN_VALUE_NAME).replace(/\"/g, "");
                phonePriceAreaArry = phonePriceArea.split("-");
                if (phonePriceAreaArry.length != 1) {
                    maxPrice = phonePriceAreaArry[1];
                    rang = maxPrice;
                } else {
                    phonePriceAreaArry = phonePriceAreaArry.toString();
                    rang = phonePriceAreaArry.substring(0, phonePriceAreaArry.length - 2);
                    maxPrice = "";
                }
                $(".noUiSliderd").noUiSlider({
                    range: [parseInt(minPrice), parseInt(rang)],
                    start: [parseInt(minPrice), parseInt(rang)],
                    step: 10,
                    slide: function() {
                        var values = $(this).val();
                        $("#phonePrice_numd01").val(values[0]);
                        if (parseInt(values[0]) >= parseInt(rang) && maxPrice == "") {
                            $("#phonePrice_numd02").val("");
                        } else {
                            $("#phonePrice_numd02").val(values[1]);
                        }
                    }
                });
            }
            if (response.data[i].PHONE_TYPE) {
                var _obj = $("#select_phone_type");
                _phone_type = response.data[i].PHONE_TYPE;
                for (var m = 0; m < _phone_type.length; m++) {
                    var phoneType = (_phone_type[m].COLUMN_VALUE_NAME).replace(/\"/g, "");
                    _obj.append("<option value=" + phoneType + ">" + phoneType + "</option>");
                }
            }
            var content = $("#phoneModal");
            $.refresh(content);
        };
    };
    //滚动页面入口
    var _terminalMainPushScroll = function(scrollObj) {
        if (scrollObj && scrollObj.page && scrollObj.page >= 1) {
            _btnQueryTerminal(scrollObj.page, scrollObj.scroll);
        }
    };
    /**
     * 按钮查询
     */
    var _btnQueryTerminal = function(curPage, scroller) {
        $("#phoneModal").modal("hide");
        //隐藏选套餐模块
        if ($("#phonelist").length > 0) {
            $("#phonelist").hide();
        }
        if ($("#pakeage").length > 0) {
            $("#pakeage").hide();
        }
        //请求地址
        var url = contextPath + "/app/mktRes/terminalQueryList";
        //收集参数
        var param = _buildInParam(curPage);
        $.callServiceAsHtml(url, param, {
            "before": function() {
                if (curPage == 1) $.ecOverlay("<strong>查询中,请稍等...</strong>");
            },
            "always": function() {
                if (curPage == 1) $.unecOverlay();
            },
            "done": function(response) {
                $.unecOverlay();
                if (response.code != 0) {
                    $.alert("提示", "<br/>查询失败,稍后重试");
                    return;
                }
                if (curPage == 1) {
                    $("#phone-list").html(response.data);
                    $.refresh($("#phone-list"));
                } else {
                    $("#phone-list-all").append(response.data);
                    $.refresh($("#phone-list-all"));
                }
                //回调刷新iscroll控制数据,控件要求
                if (scroller && $.isFunction(scroller)) scroller.apply(this, []);
            }
        });
    };
    //页面初始化数据
    var _initPhone_mainPush = function() {
        var curPage = 1;
        OrderInfo.actionFlag = 101;
        OrderInfo.order.step = 1;
        OrderInfo.busitypeflag = 1;
        mktRes.terminal.queryApConfig();
        $("#phoneModal").modal("hide");
        //请求地址
        var url = contextPath + "/app/mktRes/terminalQueryList";
        //收集参数
        var param = _buildInParam(1);
        $.callServiceAsHtml(url, param, {
            "before": function() {
                if (curPage == 1) $.ecOverlay("<strong>查询中,请稍等...</strong>");
            },
            "always": function() {
                if (curPage == 1) $.unecOverlay();
            },
            "done": function(response) {
                if (response.code != 0) {
                    $.alert("提示", "<br/>查询失败,稍后重试");
                    return;
                }
                $("#phone-list").html(response.data);
                $.refresh($("#phone-list"));
            }
        });
    };
    /**
     * 构造手机查询条件
     */
    var _buildInParam = function(curPage) {
        var brand = ec.util.defaultStr($("#select_brand").val());
        var phoneType = ec.util.defaultStr($("#select_phone_type").val());
        var minPrice = ec.util.defaultStr($("#phonePrice_numd01").val());
        var maxPrice = ec.util.defaultStr($("#phonePrice_numd02").val());
        //var contractFlag = ec.util.defaultStr($("#select_by_type").val());
        var commCond = $("#input_phone_name").val();
        if (minPrice != "") {
            minPrice = parseInt(minPrice) * 100;
        }
        if (maxPrice != "") {
            maxPrice = parseInt(maxPrice) * 100;
        }
        var attrList = [];
        if (brand != "" && brand != "无限") {
            var attr = {
                "attrId": CONST.TERMINAL_SPEC_ATTR_ID.BRAND,
                "attrValue": brand
            };
            attrList.push(attr);
        }
        if (phoneType != "" && phoneType != "无限") {
            var attr = {
                "attrId": CONST.TERMINAL_SPEC_ATTR_ID.PHONE_TYPE,
                "attrValue": phoneType
            };
            attrList.push(attr);
        }
        return {
            "mktResCd": "",
            "mktResName": commCond,
            "mktResType": "",
            "minPrice": minPrice,
            "maxPrice": maxPrice,
            "newFlag":1,
            "moduleId":1000,
            //"contractFlag":contractFlag,
            "pageInfo": {
                "pageIndex": curPage,
                "pageSize": pageSize
            },
            "attrList": attrList
        };
    };
    /**
     * 主推终端 推荐功能
     */
    var _mainPush = function(obj) {
        var repeatFlag = false;
        var mktResId = $(obj).attr("mktresid");
            //多余4个选项，跳出
        if ($("#mainPushList_Div").find("li[data-mktresid]").size() >= 4) {
            $.ecOverlay("<strong style='color:red;'>不能多于4项</strong>");
            setTimeout(function() {
                $.unecOverlay()
            }, 1000)
            return;
        }
        //判断否重复，返回repeatFlag
        $("#mainPushList_Div").find("li[data-mktresid]").each(function() {
            if ($(this).data('mktresid') == mktResId) {
                repeatFlag = true;
                $.ecOverlay("<strong style='color:red;'>已添加</strong>");
                setTimeout(function() {
                    $.unecOverlay()
                }, 1000)
                return false;
            }
        })
        if (repeatFlag == true) {
            return
        }
        //显示面板
        $('#mainPushList_Div').parent('.hidden').removeClass('hidden');
        var mktName = $(obj).attr("mktname");
        var mktPrice = $(obj).attr("mktprice");
        mktPrice = mktPrice / 100;
        var curNum = $("#mainPushList_Div").find("li[data-mktresid]").size() + 1;
        //
        var tmpl = '<li data-mktresid="' + mktResId + '"> <span class="pull-left serial">' + curNum + '</span> <span class="list-title"> <span class="title-lg">' + mktName + '</span> <span class="subtitle font-orange">' + mktPrice + '</span> </span> <i class="iconfont absolute-right font-default" onClick="mktRes.terminal.delMainPush(this)"></i> </li>';
        $("#mainPushList_Div").find('li[data-role]').before(tmpl);
    };
    var _delMainPush = function(obj){
        $(obj).closest('li[data-mktresid]').remove();
        //没记录时隐藏面板
        if($("#mainPushList_Div").find("li[data-mktresid]").size()==0){
        	$('#mainPushList_Div').parent('.fixed-bottom-box').addClass('hidden');
        }
        $("#mainPushList_Div").find("li[data-mktresid]").each(function(index){
        	$(this).find('.serial').html(index+1);
        })
    }
    var _buildInParamSort = function() {
        var mktResList = [];
        $("#mainPushList_Div").find("li[data-mktresid]").each(function() {
            var numSort = $(this).find('.serial').html();
            var mktResId = $(this).data('mktresid');
            var attr = {
                "mktResId": mktResId,
                "sortId": numSort
            };
            mktResList.push(attr);
        });
        return {
            "mktResList": mktResList
        };
    };
    /**
     * 主推终端 (已推荐)提交
     */
    var _mainPushSubmit = function() {
        //请求地址
        var url = contextPath + "/app/mktRes/termSort";
        //收集参数
        var param = _buildInParamSort();
        $.ecOverlay("<strong>正在推送终端,请稍后....</strong>");
        var response = $.callServiceAsJson(url, param);
        $.unecOverlay();
        if (response.code == 0) {
            $("#mainPushList_Div").find('li[data-mktresid]').remove();
            $("#mainPushList_Div").parent('.fixed-bottom-box').addClass('hidden');
            _initPhone_mainPush();
            $.alert("提示", "推送终端成功");
        } else {
            if (typeof response == undefined) {
                $.alert("提示", "推送终端请求调用失败，可能原因服务停止或者数据解析异常");
            } else if (response.code == 1) {
                $.alert("提示", response.data);
            } else {
                $.alert("提示", response.data);
            }
        }
    };
    
    var _showFinDialog=function(){
		var title='推送成功';
		$("#btn-dialog-ok").removeAttr("data-dismiss");
		$('#alert-modal').modal({backdrop: 'static', keyboard: false});
		$("#btn-dialog-ok").off("click").on("click",function(){
			common.relocationCust();
		});
		$("#modal-title").html(title);
		$("#modal-content").html("终端推送成功！");
		$("#alert-modal").modal();
	};
    return {
        hasCheck: _hasCheck,
        checkTerminalCode: _checkTerminalCode,
        checkTerminal: _checkTerminal,
        showCheckTermianl: _showCheckTermianl,
        queryApConfig: _queryApConfig,
        terminalMainPushScroll: _terminalMainPushScroll,
        btnQueryTerminal: _btnQueryTerminal,
        initPhone_mainPush: _initPhone_mainPush,
        mainPush: _mainPush,
        delMainPush: _delMainPush,
        mainPushSubmit: _mainPushSubmit
    };
})();

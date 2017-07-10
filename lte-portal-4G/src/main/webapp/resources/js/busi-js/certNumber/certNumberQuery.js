CommonUtils.regNamespace("oneFive", "certNumberQuery");

/**
 * 一证五号业务-归属省查询
 */
oneFive.certNumberQuery = (function () {

    /**
     *  首页初始化
     * @private
     */
    var _init = function () {

        //开始时间结束时间初始化
        $("#p_startDt").off("click").on("click", function () {
            var maxDate = new Date(Date.parse($("#p_endDt").val()));
            var minDate = new Date(maxDate.getFullYear(), maxDate.getMonth() - 1, maxDate.getDate());
            var strMinDate = DateUtil.Format('yyyy-MM-dd', minDate);
            $.calendar({minDate: strMinDate, maxDate: $("#p_endDt").val()});
        });
        $("#p_endDt").off("click").on("click", function () {
            var minDate = new Date(Date.parse($("#p_startDt").val()));
            var nowDate = Date.now();
            var maxDate = new Date(minDate.getFullYear(), minDate.getMonth() + 1, minDate.getDate());
            var strMaxDate = DateUtil.Format('yyyy-MM-dd', maxDate);
            if(maxDate>nowDate){
                strMaxDate = DateUtil.Format('yyyy-MM-dd', nowDate);
            }
            $.calendar({minDate: $("#p_startDt").val(), maxDate: strMaxDate});
        });

        // 勾选流水号事件绑定
        $("#if_p_olNbr").change(function () {
            if ($("#if_p_olNbr").attr("checked")) {
                $("#p_olNbr").css("background-color", "white").attr("disabled", false);
                $("#p_startDt").css("background-color", "#E8E8E8").attr("disabled", true);
                $("#p_endDt").css("background-color", "#E8E8E8").attr("disabled", true);
                $("#p_telNumber").css("background-color", "#E8E8E8").attr("disabled", true);
                $("#p_certNumber").css("background-color", "#E8E8E8").attr("disabled", true);
            } else {
                $("#p_olNbr").css("background-color", "#E8E8E8").attr("disabled", true);
                $("#p_startDt").css("background-color", "white").attr("disabled", false);
                $("#p_endDt").css("background-color", "white").attr("disabled", false);
                $("#p_telNumber").css("background-color", "white").attr("disabled", false);
                $("#p_certNumber").css("background-color", "white").attr("disabled", false);
            }
        });

        // 查询按钮事件绑定
        $("#bt_15handleQry").off("click").on("click", function () {
            oneFive.certNumberQuery.queryOneFiveList(1);
        });
    };

    /**
     * 地区选择
     * @private
     */
    var _chooseArea = function () {
        order.area.chooseAreaTreeManger("report/cartMain", "p_areaId_val", "p_areaId", 3);
    };


    /**
     * 查询一证五卡受理订单列表
     * @param pageIndex
     * @private
     */
    var _queryOneFiveList = function (pageIndex) {
        var curPage = 1;
        if (pageIndex > 0) {
            curPage = pageIndex;
        }
        var param = {};

        if(DateUtil.differDays(new Date(Date.parse($("#p_startDt").val())),new Date(Date.parse($("#p_endDt").val())))>31){
            $.alert("提示","日期跨度太长，超过一个月，请重新选择");
            return;
        }

        if ($("#if_p_olNbr").attr("checked")) {

            var areaId = $("#p_areaId_val").val();
            var orderNbr = $.trim($("#p_olNbr").val());

            if (!ec.util.isObj(orderNbr)) {
                $.alert("提示", "请先输入【流水号】再查询");
                return;
            }
            if (!ec.util.isObj(areaId)) {
                $.alert("提示", "请选择 '地区' 再查询");
                return;
            }

            param = {
                "collectType": "2",
                "areaId": $("#p_areaId").val(),
                "orderNbr": $("#p_olNbr").val(),
                "nowPage": curPage,
                "pageSize": 10
            };
        } else {
            var areaId = $("#p_areaId").val();
            var telNumber = $("#p_telNumber").val();
            var certNumber = $("#p_certNumber").val();
            if (!ec.util.isObj(areaId)) {
                $.alert("提示", "请选择【地区】再查询");
                return;
            }
            var startDt = $("#p_startDt").val().replace(/-/g, '');
            var endDt = $("#p_endDt").val().replace(/-/g, '');
            if ($("#p_startDt").val() == "") {
                $.alert("提示", "请选择受理时间");
                return;
            }

            if (ec.util.isObj(telNumber) && (!/^1\d{10}$/.test(telNumber))) {
                $.alert("提示", "请输入正确的手机号！");
                return;
            }

            if (ec.util.isObj(certNumber) && certNumber != $.ketchup.helpers.isGB116431999.apply(this, [certNumber])) {
                $.alert("提示", "请输入正确的身份证号！");
                return;
            }


            param = {
                "collectType": "2",
                "areaId": areaId,
                "startDt": startDt,
                "endDt": endDt,
                "nowPage": curPage,
                "pageSize": 10
            };
        }
        param.ifFilterAreaId = "Y";
        param.ifFilterItem = "N";
        if (ec.util.isObj(telNumber) || ec.util.isObj(certNumber)) {
            if (ec.util.isObj(telNumber)) {
                param.telNumber = telNumber;
            }
            if (ec.util.isObj(certNumber)) {
                param.certNumber = certNumber;
            }
        } else {
            param.staffId = OrderInfo.staff.staffId;
        }
        $.callServiceAsHtmlGet(contextPath + "/certNumber/queryOneFiveOrderList", param, {
            "before": function () {
                $.ecOverlay("一证五卡订单查询中，请稍等...");
            },
            "always": function () {
                $.unecOverlay();
            },
            "done": function (response) {
                if (response && response.code == -2) {
                    return;
                } else if (response.data && response.data.substring(0, 6) != "<table") {
                    $.alert("提示", response.data);
                } else {
                    $("#cart_list").html(response.data).show();
                }
            },
            fail: function () {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        });
    };

    /**
     * 返回主页面
     * @private
     */
    var _showMain = function () {
        $("#d_detailInfo").hide();
        $("#d_query").show();
    };

    /**
     * 查询订单详情
     * @param scope 当前详情按钮对象
     * @private
     */
    var _queryDetail = function (orderId) {
        var param = {"orderId": orderId, "areaId": $("#p_areaId").val(), "ifFilterAreaId": "N"};
        $.callServiceAsHtmlGet(contextPath + "/certNumber/queryOneFiveOrderItemDetailAll", param, {
            "before": function () {
                $.ecOverlay("详情查询中，请稍等...");
            },
            "always": function () {
                $.unecOverlay();
            },
            "done": function (response) {
                if (response && response.code == -2) {
                    return;
                } else if (response.data && response.data.substring(0, 4) != "<div") {
                    $.alert("提示", response.data);
                } else {
                    $("#d_query").hide();
                    $("#d_detailInfo").html(response.data).show();
                }
            },
            fail: function () {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        });
    };

    /**
     * 查询附件信息
     * @private
     */
    var _queryAttachment = function (soNbr, areaId) {
        var param = {
            "soNbr": soNbr,
            "areaId": areaId
        };
        $.callServiceAsJson(contextPath + "/certNumber/downAttachment", param, {
            "before": function () {
                $.ecOverlay("附件查询中，请稍等...");
            },
            "always": function () {
                $.unecOverlay();
            },
            "done": function (response) {
                if (response.code == 0) {
                    $("#attachmentInfos").empty();
                    if (ec.util.isObj(response.data) && ec.util.isObj(response.data.picturesInfo) && ec.util.isObj(response.data.picturesInfo.length > 0)) {
                        var files = response.data.picturesInfo;

                        $("#attachmentInfos").append(createAttachmentHtml(files, "回执内容", "F,E4"));
                        $("#attachmentInfos").append(createAttachmentHtml(files, "正面照", "E1"));
                        $("#attachmentInfos").append(createAttachmentHtml(files, "反面照", "E2"));
                        $("#attachmentInfos").append(createAttachmentHtml(files, "经办人照", "E3"));
                        $("#attachmentInfos").append(createAttachmentHtml(files, "其它", "E"));

                        $("#attachmentInfos").show();

                    } else {
                        $.alert("提示", "没有附件");
                    }
                } else {
                    $.alertM("提示", response.data);
                }
            },
            fail: function () {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        });

    };

    /**
     * 获取附件展示html
     * @param files 所有附件数组
     * @param title 展示小标题，【回执内容，正面照，反面照，经办人照，其它】
     *                               ||        ||      ||        ||     ||
     * @param type 文件类型      "F,E4",    "E1",   "E2",     "E3",   "E4"
     */
    function createAttachmentHtml(files, title, type) {
        var attachmentHtml = $("<div></div>").append($("<h5 class='s_title'>").append(title));
        $.each(files, function () {
            if ($.inArray(this.picFlag, type.split(',')) != -1) {
                if (this.picFlag == 'F') {
                    $(attachmentHtml).append($("<div></div>").append("<embed style='width: 800px;height: 600px;' src='" + "data:application/pdf;base64," + this.orderInfo + "'/>"));
                } else {
                    $(attachmentHtml).append($("<div></div>").append("<img style='width: auto;height: auto;'src='" + "data:application/jpeg;base64," + this.orderInfo + "'/>"));
                }
            }
        });
        return attachmentHtml;
    }

    return {
        init: _init,
        chooseArea: _chooseArea,
        queryOneFiveList: _queryOneFiveList,
        showMain: _showMain,
        queryDetail: _queryDetail,
        queryAttachment: _queryAttachment
    }
})();


//初始化
$(function () {
    oneFive.certNumberQuery.init();
});
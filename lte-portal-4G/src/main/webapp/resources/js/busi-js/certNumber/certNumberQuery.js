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
            var nowDate = new Date();
            var minDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, nowDate.getDate());
            var strMinDate = DateUtil.Format('yyyy-MM-dd', minDate);
            $.calendar({minDate: strMinDate, maxDate: $("#p_endDt").val()});
        });
        $("#p_endDt").off("click").on("click", function () {
            $.calendar({format: 'yyyy年MM月dd日 ', real: '#p_endDt', minDate: $("#p_startDt").val(), maxDate: '%y-%M-%d'});
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
                "staffId": OrderInfo.staff.staffId,
                "pageSize": 10
            };
        }
        param.ifFilterAreaId = "Y";
        param.ifFilterItem = "N";
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
                        var src = "";
                        $.each(files, function () {
                            if (this.picFlag == "F") {
                                src = "data:application/pdf;base64," + this.orderInfo;
                                $("#attachmentInfos").append($("<div>").append("<embed style='width: 800px;height: 600px;' src='" + src + "'/>"));
                            } else if (this.picFlag == "E") {
                                src = "data:application/jpeg;base64," + this.orderInfo;
                                $("#attachmentInfos").append($("<div>").append("<img style='width: auto;height: auto;'src='" + src + "'/>"));
                            }
                        });

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
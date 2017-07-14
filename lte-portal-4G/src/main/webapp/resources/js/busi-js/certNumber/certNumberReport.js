CommonUtils.regNamespace("oneFive", "certNumberReport");

/**
 * 一证五号业务-归属省查询
 */
oneFive.certNumberReport = (function () {

    /**
     *  首页初始化
     * @private
     */
    var _init = function () {

        //开始时间结束时间初始化
        $("#p_startDt").off("click").on("click", function () {
            $.calendar({maxDate: $("#p_endDt").val()});
        });
        $("#p_endDt").off("click").on("click", function () {
            $.calendar({minDate: $("#p_startDt").val(), maxDate: DateUtil.Format('yyyy-MM-dd', Date.now())});
        });

        // 查询按钮事件绑定
        $("#bt_15reportQry").off("click").on("click", function () {
            oneFive.certNumberReport.queryOneFiveReportList();
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
     * 查询一证五卡报表列表
     * @param pageIndex
     * @private
     */
    var _queryOneFiveReportList = function () {

        if (DateUtil.differDays(new Date(Date.parse($("#p_startDt").val())), new Date(Date.parse($("#p_endDt").val()))) > 6) {
            $.alert("提示", "日期跨度太长，超过一周，请重新选择");
            return;
        }

        var areaId = $("#p_areaId").val();
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

        var param = {
            "areaId": areaId,
            "startDt": startDt,
            "endDt": endDt
        };

        $.callServiceAsHtmlGet(contextPath + "/certNumber/queryOneFiveReportList", param, {
            "before": function () {
                $.ecOverlay("一证五卡报表查询中，请稍等...");
            },
            "always": function () {
                $.unecOverlay();
            },
            "done": function (response) {
                if (response && response.code == -2) {
                    return;
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


    return {
        init: _init,
        chooseArea: _chooseArea,
        queryOneFiveReportList: _queryOneFiveReportList
    }
})();


//初始化
$(function () {
    oneFive.certNumberReport.init();
});
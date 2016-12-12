/**高级实名制认证
 * @author liuteng
 */
CommonUtils.regNamespace("order", "highRealNameA");
order.highRealNameA = (function () {
    var certInfo = {
        userName: "",
        certNumber: ""
    };
    /**
     * 高级实名制认证
     * @private
     */
    var _highRealNameAuthenticate = function () {
        var number = $("#hrn_number").val();
        if (!CONST.LTE_PHONE_HEAD.test(number)) {
            $.alert("提示", "若要进行精确查询，请输入有效的中国电信手机号！");
            return;
        }
        if (!(ec.util.isObj(certInfo.userName) && ec.util.isObj(certInfo.certNumber))) {
            $.alert("提示", "请先进行读卡再进行认证！");
            return;
        }
        var param = {
            "number": number,
            "userName": certInfo.userName,
            "idType": "01",
            "certNumber": certInfo.certNumber,
            "areaId": $("#p_hrn_areaId").val(),
            "soNbr": UUID.getDataId(),
            "channelCode": OrderInfo.staff.channelCode,
            "channelName": OrderInfo.staff.channelName
        };

        var url = contextPath + "/order/highRealNameAuthenticate";
        $.callServiceAsJson(url, param, {
            "before": function () {
                $.ecOverlay("<strong>高级实名认证中,请稍等...</strong>");
            },
            "always": function () {
                $.unecOverlay();
            },
            "done": function (response) {
                if (response.code == 0) {
                    $.alert("信息提示", response.data.sspPay.body.rspInfo);
                } else if(response.code == 1){
                    $.alert("信息提示", response.data.certCheckInfo);
                } else if(response.code == -2){
                    $.alert("信息提示", "翼支付账户资料信息中证件类型不是身份证！");
                } else {
                    $.alertM(response.data);
                }
                _InitData();
            },
            fail: function () {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
                _InitData();
            }
        });
    };

    /**
     * 高实认证身份证读卡
     * @private
     */
    var _readCert = function () {
        var man = cert.readCert();
        if (man.resultFlag != 0) {
            $.alert("提示", man.errorMsg);
            return;
        }
        $("#hrn_userName").text(man.resultContent.partyName);
        $("#hrn_certNumber").text(man.resultContent.certNumber);
        certInfo.userName = man.resultContent.partyName;
        certInfo.certNumber = man.resultContent.certNumber;
        // $("#hrn_userName").text("test");
        // $("#hrn_certNumber").text("test");
        // certInfo.userName = "test";
        // certInfo.certNumber = "test";
    };

    /**
     * 初始化数据
     * @private
     */
    var _InitData = function () {
        certInfo = {
            userName: "",
            certNumber: ""
        };
        $("#hrn_userName").text("");
        $("#hrn_certNumber").text("");
        $("#hrn_number").val("");
    };

    return {
        highRealNameAuthenticate: _highRealNameAuthenticate,
        readCert: _readCert,
        hrnInitData: _InitData
    };
})();
//初始化
$(function () {

});
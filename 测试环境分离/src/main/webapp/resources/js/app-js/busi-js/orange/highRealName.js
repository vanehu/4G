/**高级实名制认证
 * @author liuteng
 */
CommonUtils.regNamespace("order", "highRealName");
order.highRealName = (function () {
    var _LTE_PHONE_HEAD = /^(180|189|133|134|153|181|108|170|173|177|139|185)\d{8}$/;
    
    var _flag=false;
    /**
     * 高级实名制认证
     * @private
     */
    var _highRealNameAuthenticate = function () {
        var number = $("#phoneNumInput").val();
        if (!order.highRealName.LTE_PHONE_HEAD.test(number)) {
            $.alert("提示", "请输入有效的中国电信手机号！");
            return;
        }
        var userName=$("#userName").val();
        var certNumber=$("#certNumber").val();
        if (!(ec.util.isObj(userName) && ec.util.isObj(certNumber))) {
            $.alert("提示", "请先进行读卡再进行认证！");
            return;
        }
        var param = {
            "number": number,
            "userName": userName,
            "idType": "01",
            "certNumber": certNumber,
            "areaId": OrderInfo.staff.areaId,
            "soNbr": UUID.getDataId(),
            "channelCode": OrderInfo.staff.channelCode,
            "channelName": OrderInfo.staff.channelName
        };

        var url = contextPath + "/app/orange/highRealNameAuthenticate";
        $.callServiceAsJson(url, param, {
            "before": function () {
                $.ecOverlay("<strong>高级实名认证中,请稍等...</strong>");
            },
            "always": function () {
//                $.unecOverlay();
            },
            "done": function (response) {
            	if (response.code == 0) {
            		 $.unecOverlay();
                    $.alert("信息提示", response.data.sspPay.body.rspInfo);
                    OrderInfo.order.step=2;
            		$("#real_name").modal("hide");
            		order.dealer.initDealer();
            	    order.broadband.init_select();//刷新select组件，使样式生效
            		$("#nav-tab-2").addClass("active in");
            		$("#tab2_li").addClass("active");
            		$("#nav-tab-1").removeClass("active in");
            	 	$("#tab1_li").removeClass("active");
                } else if(response.code == 1){
                	 $.unecOverlay();
                    $.alert("信息提示", response.data.certCheckInfo);
                } else if(response.code == 1002){
                	 $.unecOverlay();
                    $.alert("信息提示", "翼支付账户资料信息中证件类型不是身份证！");
                } else {
                	 $.unecOverlay();
                    $.alertM(response.data);
                }
            },
            fail: function () {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
                _InitData();
            }
        });
    };



    return {
    	LTE_PHONE_HEAD           :_LTE_PHONE_HEAD,
        highRealNameAuthenticate :_highRealNameAuthenticate,
        flag:_flag
    };
})();
//初始化
$(function () {

});
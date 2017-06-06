CommonUtils.regNamespace("oneFive", "certNumber");

/**
 * 一证五号业务
 */
oneFive.certNumber = (function () {

    /**
     * 选中号码列表
     * @type {Array}
     */
    var selectList = [];

    /**
     * 本次文件上传数量
     * @type {number}
     */
    var fileNumbers = 0;

    /**
     * 业务流水号
     * @type {string}
     */
    var soNbr = "";

    /**
     * 身份证读卡数据
     * @type {{}}
     */
    var idCardInfo = {};

    /**
     * 是否上传过附件
     * @type {boolean}
     */
    var isUploadAttachment = false;

    /**
     * 一证五卡标识字符串
     * @type {string}
     */
    var OneFiveFlag = "";

    /**
     * 是否有手工输入权限
     * @type {string}
     */
    var isHand = "-1";

    /**
     * 初始化代码
     * @private
     */
    var _init = function () {
        isHand = $("#isHand").val();
        $('#certNumRelForm').off().on('formIsValid', function () {
            selectList = [];//初始化选中号码列表
            if ($.trim($("#identidiesTypeCd" + " option:selected").val()) == "1" && !ec.util.isObj($('#certNumber').val())) {
                $.alert("提示", "请先读卡");
                return;
            }
            _queryCertNumRelList(1);
        }).ketchup({bindElement: "bt_Qry"});

        //初始化证件类型默认为身份证
        var scope = $("#identidiesTypeCd");
        scope.val("1");
        _identidiesTypeCdChoose(scope, "certNumber");
        fileNumbers = 0;
    };

    /**
     * 身份证读卡
     */
    var _readCard = function () {
        var man = cert.readCert();
        if (man.resultFlag != 0) {
            if (man.resultFlag == -3) {
                //版本需要更新特殊处理 不需要提示errorMsg
                return;
            }
            $.alert("提示", man.errorMsg);
            return;
        }
        $("#certNumber").val(man.resultContent.certNumber);
        idCardInfo = man.resultContent;
    };

    /**
     * 创建客户证件类型选择事件
     */
    var _identidiesTypeCdChoose = function (scope, id) {
        $("#" + id).removeAttr("disabled");
        $("#" + id).val("");
        $("#" + id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9]/ig,'')");
        var identidiesTypeCd = $(scope).val();
        $("#" + id).attr("maxlength", "100");
        $("#certNumberReadCertBtn").hide();
        if (identidiesTypeCd == 1) {
            $("#" + id).removeAttr("data-validate");
            $("#" + id).attr("placeHolder", "请点击右面读卡按钮，进行读卡操作！");
            if (isHand == "-1") {
                $("#certNumber").attr("disabled", "disabled");
            }
            $("#certNumberReadCertBtn").show();
        } else if (identidiesTypeCd == 2) {
            $("#" + id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9\u4e00-\u9fa5]/ig,'')");
            $("#" + id).attr("placeHolder", "请输入合法军官证");
            $("#" + id).attr("data-validate", "validate(required:请准确填写军官证) on(blur)");
        } else if (identidiesTypeCd == 3) {
            $("#" + id).attr("placeHolder", "请输入合法护照");
            $("#" + id).attr("data-validate", "validate(required:请准确填写护照) on(blur)");
        } else if (identidiesTypeCd == 15) {
            $("#" + id).attr("onkeyup", "value=value.replace(/[^A-Za-z0-9-]/ig,'')");
            $("#" + id).attr("placeHolder", "请输入合法证件号码");
            $("#" + id).attr("data-validate", "validate(required:请准确填写证件号码) on(blur)");
            $("#" + id).attr("maxlength", "20");
        } else {
            $("#" + id).attr("placeHolder", "请输入合法证件号码");
            $("#" + id).attr("data-validate", "validate(required:请准确填写证件号码) on(blur)");
        }
    };

    /**
     * 查询证号关系数据
     * @param pageIndex
     * @private
     */
    var _queryCertNumRelList = function (pageIndex) {
        var curPage = 1;
        if (pageIndex > 0) {
            curPage = pageIndex;
        }

        var param = {
            "ContractRoot": {
                "SvcCont": {
                    "certType": $("#identidiesTypeCd").val(),
                    "certNum": $("#certNumber").val(),
                    curPage: curPage,
                    pageSize: 10

                },
                "TcpCont": {}
            }
        };

        $.callServiceAsHtmlGet(contextPath + "/certNumber/queryCmRelList", {paramStr: JSON.stringify(param)}, {
            "before": function () {
                $.ecOverlay("订单查询中，请稍等...");
            },
            "always": function () {
                $.unecOverlay();
            },
            "done": function (response) {

                if (!response) {
                    response.data = '<div style="margin:2px 0 2px 0;width:100%;height:100%;text-align:center;"><strong>not data return,please try reload again.</strong></div>';
                }
                if (response.code == -2) {
                    $.alertM(response.data);
                    return;
                }
                var content$ = $("#certNumberlist");
                content$.html(response.data);
                reviewData();
            },
            fail: function () {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        });
    };

    /**
     * 选中数据重现
     */
    function reviewData() {
        var tbody = $("#certNumberlist").find("table>tbody input");
        var total = 0;
        $.each(tbody, function () {
            var parentTR = $(this).parent().parent();
            var parent = this;
            $.each(selectList, function () {
                if ($(this).find("td:eq(4)").text() == $(parentTR).find("td:eq(4)").text()) {
                    parent.checked = true;
                    total++;
                }
            });
        });
        if (total == tbody.length) {
            $("#tab_orderList").find("thead").find("tr").find("td").find("input").attr("checked", true);//总数与选中数相同，选择中全选
        }
    }

    /**
     * 复选框选中事件
     * @private
     */
    function indexOfInput(selectList, selectInput) {
        var index = selectList.length == 0 ? -1 : 0;
        var selectTR = $(selectInput).parent().parent();
        $.each(selectList, function () {
            if ($(this).find("td:eq(4)").text() == $(selectTR).find("td:eq(4)").text()) {
                return false;
            }
            index++;
        });
        return index;
    }

    /**
     * 复选框选中事件
     * @private
     */
    var _selectItem = function (selectInput) {
        var selectTR = $(selectInput).parent().parent();
        var index = indexOfInput(selectList, selectInput);//查找输入框在选中数组中的位置
        if (selectInput.checked) {
            if (index == -1 || index == selectList.length) {//如果不在数组中，执行添加操作
                selectList.push(selectTR);
            }
        } else {
            if (index != -1 && index != selectList.length) {//如果在数组中，执行删除操作
                selectList.splice(index, 1);
            }
        }
    };

    /**
     * 当前页面全选
     * @private
     */
    var _selectAll = function (allSelectInput) {
        var tbody = $("#certNumberlist").find("table").find("tbody").find("input");
        $.each(tbody, function () {
            this.checked = allSelectInput.checked;
            _selectItem(this);
        });
    };

    /**
     * 选择确认
     * @private
     */
    var _selectConfirm = function () {
        resetCustInfo();//重置客户信息
        resetAttachment();//重置附件
        resetFileNumbers();//重置已经上传文件数量

        if (selectList.length > 0) {
            var selectTbody = $("#tab_selectConfirmList").find("tbody");
            selectTbody.empty();
            $.each(selectList, function () {
                var newTR = $(this).clone();
                newTR.find("td:first-child").remove();//删除第一个td元素
                newTR.find("td:last-child").remove();//删除最后一个td元素
                selectTbody.append(newTR);
            });
            easyDialog.open({
                container: "selectConfirmDivMain"
            });
            $("#uploadAttachment").find("#soNbr").val(_getOneFiveSoNbr());
            $("#tab_custInfoList").find("#soNbr").text(soNbr);
        } else {
            $.alert("提示", "未选中任何号码！");
        }
        isUploadAttachment = false;
    };

    //一证五号回执单打印
    var _oneCertFiveNumberPrint = function () {

        //客户信息
        var phoneNumber = $("#tab_custInfoList").find("#phoneNumber").val();
        var certType = $("#certNumRelForm").find("#identidiesTypeCd").find("option:selected").text();
        var certNumber = $("#certNumRelForm").find("#certNumber").val();

        if (!ec.util.isObj(phoneNumber)) {
            $.alert("提示", "请输入客户联系方式！");
            return;
        } else if (!/^1\d{10}$/.test(phoneNumber)) {
            $.alert("提示", "请输入正确的手机号！");
            return;
        }

        disabledCustInfo();

        var custInfo = {
            "custName": idCardInfo.partyName,
            "phoneNumber": phoneNumber,
            "certType": certType,
            "certNumber": certNumber
        };

        //号码信息
        var numbers = [];
        if (selectList.length > 0) {
            $.each(selectList, function () {
                var number = $(this).find("td:eq(4)").text();
                var province = $(this).find("td:eq(1)").text();
                var city = $(this).find("td:eq(3)").text();
                var numberInfo = number + "（" + province + city + "）";
                numbers.push(numberInfo);
            });
        } else {
            $.alert("提示", "没有选中的号码，无可打印内容！");
            return;
        }

        if (!ec.util.isObj(soNbr)) {
            $.alert("提示", "订单编号不能为空！");
            return;
        }

        var param = {
            "custInfo": custInfo,
            "numbers": numbers,
            "olNbr": soNbr
        };
        $("<form>", {
            id: "oneCertFiveNumberForm",
            style: "display:none;",
            target: "_blank",
            method: "POST",
            action: contextPath + "/print/oneCertFiveNumber"
        }).append($("<input>", {
            id: "oneCertFiveNumber",
            name: "oneCertFiveNumber",
            type: "hidden",
            value: JSON.stringify(param)
        })).appendTo("body").submit();


    };

    /**
     * 多文件上传控制选择事件
     * @param uploadFiles
     * @private
     */
    var _selectUploadFiles = function (uploadFiles) {
        var $tbody = $("#tab_oneFiveFileUpload").find("tbody");
        $tbody.empty();
        if (isLowIE10()) {
            var tmpTR = $("<tr>").append($("<td>").append(uploadFiles.value)).append($("<td>").append("未知"));
            $tbody.append(tmpTR);
        } else {
            $.each(uploadFiles.files, function () {
                var tmpTR = $("<tr>").append($("<td>").append(this.name)).append($("<td>").append((this.size / 1024).toFixed(2) + "KB"));
                $tbody.append(tmpTR);
            });
        }
    };

    /**
     * 将错误信息列表转成字符串
     * @param errorList
     */
    function getErrorListStr(errorList) {
        var head = "存在非法文件（请上传1M以内的jpg或pdf文件）：<br/>";
        var body = "";
        $.each(errorList, function () {
            body += "文件名：" + this.fileName + "，文件类型：" + this.fileType + "，大小：" + (parseInt(this.fileSize) / 1024 / 1024).toFixed(2) + "MB<br/>";
        });
        return head + body;
    }

    /**
     * 上传附件
     * @private
     */
    var _uploadAttachment = function () {
        var files = $("#mFileUpload").get(0).files;
        var isTooLarge = false;
        var isZero = false;
        if (isLowIE10()) {
            if (!ec.util.isObj($("#mFileUpload").val())) {
                $.alert("提示", "请先选择要上传的附件（IE10以下只能单选）！");
                return;
            }
            if (fileNumbers > 4) {
                $.alert("提示", "最多只能上传5个附件");
                return;
            }
        } else if (ec.util.isObj(files) && files.length > 0) {
            if (files.length > 5) {
                $.alert("提示", "最多同时上传5个附件");
                return;
            }
            $.each(files, function () {
                if (this.size > CONST.MAX_FILE_SIZE) {
                    isTooLarge = true;
                }
                if (this.size == 0) {
                    isZero = true;
                }
            });
            if (isTooLarge) {
                $.alert("提示", "上传的附件过大，单个文件的大小不得超出1M！");
                return;
            }
            if (isZero) {
                $.alert("提示", "上传的附件无效，单个文件的大小为零！");
                return;
            }
        } else {
            $.alert("提示", "请先选择要上传的附件（支持多选）！");
        }

        var options = {
            type: 'post',
            dataType: 'json',
            url: 'uploadAttachment',
            beforeSubmit: function () {
                $.ecOverlay("<strong>正在上传文件,请稍等...</strong>");
            },
            success: function (response) {
                $.unecOverlay();
                if (response.code == 0) {
                    $.alert("提示", "附件上传完成！");
                    isUploadAttachment = true;
                    $("#tab_custInfoList").find("#fileNumbers").text(isLowIE10() ? ++fileNumbers : files.length);
                    resetAttachment();
                } else if (response.code == -2) {
                    $.alert("提示", getErrorListStr(response.data.errorList));
                    resetAttachment();
                } else {
                    $.alertM(response.data);
                }
            },
            error: function () {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        };
        $('#uploadAttachment').ajaxSubmit(options);

    };

    /**
     * 订单确认
     * @private
     */
    var _orderSubmit = function () {
        if (isUploadAttachment) {

            var orderNum = _getOneFiveSoNbr();//本次流水号

            //采集单提交节点
            var orderList = {};

            //采集单基本信息
            orderList.collectionOrderInfo = {
                "collectType": "2",//跨省一证五号采集
                "expDate": "3000-01-01 00:00:00",
                "sysFlag": CONST.OL_TYPE_CD.FOUR_G,
                "areaId": OrderInfo.staff.areaId,
                "channelId": OrderInfo.staff.channelId,
                "staffId": OrderInfo.staff.staffId,
                "orderNum": orderNum,
                "transactionId": orderNum
            };

            //采集单客户信息
            var custInfos = [];
            //采集单客户序列
            var seq = 1;
            $.each(selectList, function () {
                var number = {
                    "addressStr": idCardInfo.certAddress,
                    "certNumber": idCardInfo.certNumber,
                    "certType": "1",
                    "certTypeName": "身份证",
                    "contactAddress": "",
                    "custName": idCardInfo.partyName,
                    "lanId": $(this).find("td:eq(2)").text(),
                    "maxQuantity": 0,
                    "partyRoleCd": "0",//产权人
                    "partyTypeCd": "1",//个人
                    "remarks": "",
                    "seq": seq++,
                    "telNumber": $(this).find("td:eq(4)").text()
                };
                custInfos.push(number);
            });

            orderList.collectionCustInfos = custInfos;
            $.callServiceAsJson(contextPath + "/order/custCltSubmit", {collectionOrderList: orderList}, {
                "before": function () {
                    $.ecOverlay("<strong>正在提交中,请稍等...</strong>");
                }, "done": function (response) {
                    if (response.code == 0) {
                        window.location.href = contextPath + "/certNumber/preCertNumber";
                    } else {
                        $.alertM(response.data);
                    }
                }, "fail": function (response) {

                }, "always": function () {
                    $.unecOverlay();
                }
            });

        } else {
            $.alert("提示", "请选上传相关附件！");
        }
    };

    /**
     * 获取本次业务的唯一标识字符串
     */
    function _getOneFiveSoNbr() {
        var numbers = [];
        var numbersStr = "";
        var certNum = $("#certNumber").val();
        $.each(selectList, function () {
            numbers.push($(this).find("td:eq(4)").text());
        });
        numbers.sort();
        $.each(numbers, function () {
            numbersStr += this;
        });
        var flagStr = MD5(certNum + numbersStr);
        if (flagStr != OneFiveFlag) {
            OneFiveFlag = flagStr;
            soNbr = OrderInfo.staff.areaId + UUID.getDataId();
        }
        return soNbr;
    }

    /**
     * 重置附件
     * @private
     */
    function resetAttachment() {
        $("#uploadAttachment").get(0).reset();
        $("#tab_oneFiveFileUpload").find("tbody").empty();
    }

    /**
     * 重置已经上传文件数量
     * @private
     */
    function resetFileNumbers() {
        fileNumbers = 0;
        $("#tab_custInfoList").find("#fileNumbers").text("");
    }

    /**
     * 打印后禁用客户信息输入
     */
    function disabledCustInfo() {
        $("#tab_custInfoList").find("#phoneNumber").attr("disabled", true);
    }

    /**
     * 是否为低于10的IE版本
     */
    function isLowIE10() {
        if (CommonUtils.isIE() && $.browser.version < 10.0)
            return true;
        else
            return false;
    }

    /**
     * 重置客户信息
     */
    function resetCustInfo() {
        var phoneNumber = $("#tab_custInfoList").find("#phoneNumber");
        phoneNumber.val("");
        phoneNumber.removeAttr("disabled");
    }

    return {
        init: _init,
        getOneFiveSoNbr: _getOneFiveSoNbr,
        orderSubmit: _orderSubmit,
        uploadAttachment: _uploadAttachment,
        selectUploadFiles: _selectUploadFiles,
        oneCertFiveNumberPrint: _oneCertFiveNumberPrint,
        queryCertNumRelList: _queryCertNumRelList,
        readCard: _readCard,
        identidiesTypeCdChoose: _identidiesTypeCdChoose,
        selectItem: _selectItem,
        selectAll: _selectAll,
        selectConfirm: _selectConfirm
    }
})();

//初始化
$(function () {
    oneFive.certNumber.init();
});
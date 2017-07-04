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
     * 经办人拍照照片
     * @type {string}
     */
    var jbr_picture = "";

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
     * 类型常量定义
     * @type {{Pdf: string, Front: string, Back: string, Other: string}}
     */
    var TYPES = {
        "Pdf": "回执",
        "Front": "正面",
        "Back": "反面",
        "Jbr": "经办",
        "Other": "其它"
    };

    /**
     * 类型常量定义
     * @type {number}
     * 各标识位含义，从右往左，依次为：回执上传，正面照上传，反面照上传，经办人照，其它
     * 默认回执上传，正面照上传，反面照上传三个必须上传，标识符如下
     * 0B00000111（二进制表示）
     */
    var uploadFlagsBytes = 7;

    /**
     * 当前上传标识位
     * @type {number}
     */
    var uploadFlag = 0;

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
        $("#certCustName").val(man.resultContent.partyName);
        $("#certAddress").val(man.resultContent.certAddress);
        idCardInfo = man.resultContent;
        $("#img_Cert15").attr("src", "data:image/jpeg;base64," + man.resultContent.identityPic);
        _showCameraView();
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
        var custName = $("#certCustName").val();
        var address = $("#certAddress").val();

        if (!ec.util.isObj(custName)) {
            $.alert("提示", "请输入证件姓名！");
            return;
        }

        if (!ec.util.isObj(address)) {
            $.alert("提示", "请输入证件地址信息！");
            return;
        }

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
            $("#uploadAttachmentPdf").find("#soNbr").val(_getOneFiveSoNbr());
            $("#uploadAttachmentPdf").find("#type").val("Pdf");
            $("#uploadAttachmentFront").find("#soNbr").val(_getOneFiveSoNbr());
            $("#uploadAttachmentFront").find("#type").val("Front");
            $("#uploadAttachmentBack").find("#soNbr").val(_getOneFiveSoNbr());
            $("#uploadAttachmentBack").find("#type").val("Back");
            if (ec.util.isObj(jbr_picture)) {
                $("#uploadAttachmentJbr").find("#jbr_info").text("已拍照");
            } else {
                $("#uploadAttachmentJbr").find("#jbr_info").text("未拍照");
            }
            $("#uploadAttachmentJbr").find("#soNbr").val(_getOneFiveSoNbr());
            $("#uploadAttachmentJbr").find("#type").val("Jbr");
            $("#uploadAttachmentOther").find("#soNbr").val(_getOneFiveSoNbr());
            $("#uploadAttachmentOther").find("#type").val("Other");
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
            "custName": isHand == -1 ? idCardInfo.partyName : $("#certCustName").val(),
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
    var _selectUploadFiles = function (uploadFiles, type) {
        //清空上次文件名
        var $trs = $("#tab_oneFiveFileUpload").find("tbody").find("tr");
        $.each($trs, function () {
            if (type == $(this).find("td:eq(2)").text()) {
                $(this).remove();
            }
        });

        var $tbody = $("#tab_oneFiveFileUpload").find("tbody");
        if (isLowIE10()) {
            var tmpTR = $("<tr>").append($("<td>").append(uploadFiles.value)).append($("<td>").append("未知")).append($("<td>").append(type));
            $tbody.append(tmpTR);
        } else {
            $.each(uploadFiles.files, function () {
                var tmpTR = $("<tr>").append($("<td>").append(this.name)).append($("<td>").append((this.size / 1024).toFixed(2) + "KB")).append($("<td>").append(type));
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
    var _uploadAttachment = function (id) {
        var files = $("#uploadAttachment" + id).find("#mFileUpload").get(0).files;
        var isTooLarge = false;
        var isZero = false;
        if (isLowIE10()) {
            if (!ec.util.isObj($("#uploadAttachment" + id).find("#mFileUpload").val())) {
                $.alert("提示", "请先选择要上传的附件（IE10以下只能单选）！");
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
            $.alert("提示", "请先选择要上传的附件（上传其它可支持多选[IE10+]）！");
            return;
        }

        //设置流水号和上传类型
        $("#uploadAttachment" + id).find("#soNbr").val(_getOneFiveSoNbr());
        $("#uploadAttachment" + id).find("#type").val(id);

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
                    updateUploadFlags(id);
                    $("#tab_custInfoList").find("#fileNumbers").text(isLowIE10() ? ++fileNumbers : (fileNumbers += files.length));
                    resetAttachment(id);
                } else if (response.code == -1) {
                    $.alert("提示", getErrorListStr(response.data.errorList));
                    resetAttachment(id);
                } else {
                    $.alertM(response.data);
                }
            },
            error: function () {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        };
        $('#uploadAttachment' + id).ajaxSubmit(options);

    };


    /**
     * 上传经办人照片附件
     * @private
     */
    var _uploadJbrAttachment = function (id) {

        var certImg = idCardInfo.identityPic;//身份证读卡照片数据

        if (ec.util.isObj(certImg)) {
            $("#uploadAttachmentJbr").find("#certImg").val(certImg);
        }

        if (ec.util.isObj(jbr_picture)) {
            if (jbr_picture.length > CONST.MAX_FILE_SIZE) {
                $.alert("提示", "上传的附件过大，单个文件的大小不得超出1M！");
                return;
            }
            $("#uploadAttachmentJbr").find("#photograph").val(jbr_picture);
        } else {
            $.alert("提示", "若要上传经办人照片，请先拍照！");
            return;
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
                    updateUploadFlags(id);
                    $("#tab_custInfoList").find("#fileNumbers").text(ec.util.isObj(certImg) ? fileNumbers = fileNumbers + 2 : ++fileNumbers);
                    resetAttachment(id);
                } else if (response.code == -1) {
                    $.alert("提示", getErrorListStr(response.data.errorList));
                    resetAttachment(id);
                } else {
                    $.alertM(response.data);
                }
            },
            error: function () {
                $.unecOverlay();
                $.alert("提示", "请求可能发生异常，请稍后再试！");
            }
        };
        $('#uploadAttachment' + id).ajaxSubmit(options);

    };

    /**
     * 订单确认
     * @private
     */
    var _orderSubmit = function () {
        var phoneNumber = $("#tab_custInfoList").find("#phoneNumber").val();

        if (!ec.util.isObj(phoneNumber)) {
            $.alert("提示", "请输入客户联系方式！");
            return;
        } else if (!/^1\d{10}$/.test(phoneNumber)) {
            $.alert("提示", "请输入正确的手机号！");
            return;
        }

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
                "telNbr": phoneNumber,
                "transactionId": orderNum
            };

            //采集单客户信息
            var custInfos = [];
            //采集单客户序列
            var seq = 1;
            $.each(selectList, function () {
                var number = {
                    "addressStr": isHand == -1 ? idCardInfo.certAddress : $("#certAddress").val(),
                    "certNumber": isHand == -1 ? idCardInfo.certNumber : $("#certNumber").val(),
                    "certType": "1",
                    "certTypeName": "身份证",
                    "contactAddress": "",
                    "custName": isHand == -1 ? idCardInfo.partyName : $("#certCustName").val(),
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
    function resetAttachment(id) {
        if (ec.util.isObj(id)) {
            $("#uploadAttachment" + id).get(0).reset();
            var $trs = $("#tab_oneFiveFileUpload").find("tbody").find("tr");
            $.each($trs, function () {
                if (TYPES[id] == $(this).find("td:eq(2)").text()) {
                    $(this).remove();
                }
            })
        } else {
            $("#uploadAttachmentPdf").get(0).reset();
            $("#uploadAttachmentFront").get(0).reset();
            $("#uploadAttachmentBack").get(0).reset();
            $("#uploadAttachmentOther").get(0).reset();
            $("#tab_oneFiveFileUpload").find("tbody").empty();
        }
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

    /**
     * 经办人拍照弹出窗口关闭事件
     */
    function _close() {
        try {
            cert.closeVideo();
        } catch (e) {
            throw new Error("camera driver (DoccameraOcx.exe) is not installed correctly.");
        } finally {
            easyDialog.close();
            $(".ZebraDialogOverlay").remove();
            $(".ZebraDialog").remove();
        }
    }

    /**
     * 更新上传标识位
     */
    function updateUploadFlags(id) {
        var flagNum = 0;
        if ("Pdf" == id) {
            flagNum = 1;
        } else if ("Front" == id) {
            flagNum = 2;
        } else if ("Back" == id) {
            flagNum = 4;
        } else if ("Jbr" == id) {
            flagNum = 8;
        } else {
            flagNum = 16;
        }
        uploadFlag = uploadFlag | flagNum;
        if (uploadFlagsBytes == (uploadFlag & uploadFlagsBytes)) {
            isUploadAttachment = true;
        }
    }

    /**
     * 展示拍照弹出加载摄像头
     */
    var _showCameraView = function () {
        //没有看错，确实是open->close->open
        easyDialog.open({
            container: "ec-dialog-one-five-photo-graph"
        });
        easyDialog.close();
        easyDialog.open({
            container: "ec-dialog-one-five-photo-graph"
        });
        $("#img_Cert15")[0].height = 258;
        $("#img_Cert15")[0].width = 200;
        //初始化页面
        $("#device15").empty();
        $("#startPhotos15").show();
        $("#startPhotos15").off("click").on("click", function () {
            createVideo();
        });
        $("#tips15").empty();
        $("#img_Photo15")[0].src = "";
        $("#img_Photo15")[0].height = 0;
        $("#img_Photo15")[0].width = 0;
        //按钮灰话，不绑定事件
        $("#takePhotos15").removeClass("btna_o").addClass("btna_g");
        $("#rePhotos15").removeClass("btna_o").addClass("btna_g");
        $("#confirmAgree15").removeClass("btna_o").addClass("btna_g");
        $("#takePhotos15").off("click");
        $("#rePhotos15").off("click");
        $("#confirmAgree15").off("click");
        $("#auditStaffTips15").empty();
        $("#photographReviewDiv15").show();
        getCameraInfo();
    };


    /**
     * 加载拍照设备列表，获取摄像头信息
     */
    function getCameraInfo() {

        var device = capture15.getDevices();
        device = JSON.parse(device);
        if (device == null || device == undefined) {
            $("#tips15").html("提示：请检查是否正确安装插件");
            return;
        }
        if (device.resultFlag == 0) {
            $.each(device.devices, function () {
                $("#device15").append("<option value='" + this.device + "' >" + this.name + "</option>");
            });
            $("#startPhotos15").off("click").on("click", function () {
                createVideo();
            });
        } else {
            $("#tips15").html("提示：" + device.errorMsg);
            return;
        }
    }

    /**
     * 创建视频(点击重新拍照也是这里)
     */
    function createVideo() {
        var device = $("#device15").val();
        if (device != null && device != "") {
            var createVideo = JSON.parse(capture15.createVideo(device, 1280, 720));//创建视频
            if (createVideo.resultFlag == 0) {
                $("#startPhotos15").hide();
                OrderInfo.isCreateVideo = "Y";
                $("#capture15")[0].style.visibility = 'visible';
                $("#takePhotos15").removeClass("btna_g").addClass("btna_o");
                $("#takePhotos15").off("click").on("click", function () {
                    createImage();
                });
            } else {
                $("#tips15").html("提示：" + createVideo.errorMsg);
                return;
            }
        } else {
            $("#startPhotos15").show();
            $("#tips15").html("提示：请选择一个摄像头设备");
            return;
        }
    }

    /**
     * 拍照(点击确认拍照)
     */
    function createImage() {
        $("#tips15").empty();

        var createImage = cert.createImage("device15", capture15);
        if (createImage && createImage.resultFlag != 0) {
            $("#tips15").html("提示：" + createImage.errorMsg);
            return false;
        }

        //针对IE8需要压缩照片
        var browser = CommonUtils.validateBrowser();
        var photograph = ((browser.indexOf("IE8") >= 0) || (browser.indexOf("IE7") >= 0)) ? createImage.compImage : createImage.image;

        $("#takePhotos15").removeClass("btna_o").addClass("btna_g").off("click");
        $("#img_Photo15").attr("src", "data:image/jpeg;base64," + photograph);
        $("#img_Photo15").attr("width", 640);
        $("#img_Photo15").attr("height", 360);

        $("#img_Photo15").data("identityPic", createImage.image);
        $("#img_Photo15").data("signature", createImage.signature);
        $("#img_Photo15").data("venderId", createImage.venderId);
        //拍照后置灰按钮，取消绑定事件
        $("#takePhotos15").off("click");
        $("#takePhotos15").removeClass("btna_o").addClass("btna_g");
        $("#rePhotos15").removeClass("btna_g").addClass("btna_o");
        $("#rePhotos15").off("click").on("click", function () {
            rePhotos();
        });
        $("#confirmAgree15").removeClass("btna_g").addClass("btna_o");
        $("#confirmAgree15").off("click").on("click", function () {
            saveImg(photograph);
        });

        try {
            var obj = cert.closeVideo();
            var json = JSON.parse(obj);
            if (json && json.resultFlag != 0) {
                $("#tips15").html("提示：" + json.errorMsg);
            }
        } catch (e) {
            throw new Error("camera driver (DoccameraOcx.exe) is not installed correctly.");
        }
    }


    /**
     * 重新拍照
     */
    function rePhotos() {
        //初始化页面
        $("#tips15").html("");
        $("#img_Photo15")[0].src = "";
        $("#img_Photo15")[0].height = 0;
        $("#img_Photo15")[0].width = 0;
        //拍照后置灰按钮，取消绑定事件
        $("#rePhotos15").off("click");
        $("#rePhotos15").removeClass("btna_o").addClass("btna_g");
        $("#confirmAgree15").removeClass("btna_o").addClass("btna_g");
        $("#confirmAgree15").off("click");
        $("#takePhotos15").off("click").on("click", function () {
            createImage();
        });
        $("#takePhotos15").removeClass("btna_g").addClass("btna_o");
        createVideo();
    }

    /**
     * 缓存照片数据
     * @param imgData 拍摄的照片数据
     */
    function saveImg(imgData) {
        jbr_picture = imgData;
        _close();
    }

    return {
        init: _init,
        getOneFiveSoNbr: _getOneFiveSoNbr,
        orderSubmit: _orderSubmit,
        uploadAttachment: _uploadAttachment,
        uploadJbrAttachment: _uploadJbrAttachment,
        selectUploadFiles: _selectUploadFiles,
        oneCertFiveNumberPrint: _oneCertFiveNumberPrint,
        queryCertNumRelList: _queryCertNumRelList,
        readCard: _readCard,
        identidiesTypeCdChoose: _identidiesTypeCdChoose,
        selectItem: _selectItem,
        selectAll: _selectAll,
        selectConfirm: _selectConfirm,
        close: _close,
        showCameraView: _showCameraView
    }
})();

//初始化
$(function () {
    oneFive.certNumber.init();
});
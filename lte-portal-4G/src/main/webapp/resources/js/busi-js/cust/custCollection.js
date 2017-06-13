/**
 * 实名信息采集单
 */
CommonUtils.regNamespace("cust", "collection");

cust.collection = (function(){
	
	//--------------------------------实名信息采集单-----------------------------------------------
	var _custInfo = {};//采集客户信息
	var _userList = [];//采集的使用人信息列表
	var _userSeq = 0;//使用人序列
	var _printData = {};//打印数据
	
	/*
	 * 初始化采集单信息
	 */
	var _init = function(){
		$("#p_expDt").off("click").on("click",function(){
			$.calendar({ format:'yyyy年MM月dd日 ',real:'#p_expDt',minDate:$("#p_startDt").val(),maxDate:$("#p_endDt").val()});
		});
		//定义，客户定位区分政企客户，客户定位信息保存，经办人查询信息保存
		OrderInfo.actionFlag = 45;
	};
	
	/*
	 * 添加使用人
	 */
	var _addUserDialog = function(){
		if(!_checkCust()){
			return;
		}
		//初始化添加页面，删除原始信息
		// 设置隐藏域的表单数据
		$('#orderUserAttrName').val("");//姓名
		$('#orderUserAttrIdCard').val("");//设置身份证号
		$('#orderUserAttrAddr').val("");//地址
		$('#orderUserAttrIdPic').val();//证件照
		$('#orderUserAttrPhoneNbr').val("");//联系人号码
		$('#orderUserAttrCardNum').val(1);//办理数量
		$('#orderUserPicture').val("");//联系人号码
		$('#order_user_remark').val("");//说明
		// 设置文本显示
		$("#li_order_name span").text("");
		$("#li_order_card span").text("");
		$("#li_order_addr span").text("");

		easyDialog.open({
			container : "add_user_dialog"
		});
		$("#takePhotoDiv").hide();
		$("#addUserDiv").show();
		$("#photoTakeBtn span").text("拍照");
		$("#photoTakeBtn").off("click").on("click",function(){_takePhoto();});
	};
	
	/*
	 * 添加使用人读卡
	 */
	var _readUserCert = function() {
		var servCode="实名信息采集单使用人";
		$("#userTips").empty();
		man = cert.readCert(CONST.CERT_READER_CUST_COLLECTION_USER);
		if (man.resultFlag != 0){
			if(man.resultFlag==-3){
				//版本需要更新特殊处理 不需要提示errorMsg
				return ;
			}
			$("#userTips").html("提示："+ man.errorMsg);
			//$.alert("提示", man.errorMsg);
			return;
		}
		// 设置隐藏域的表单数据
		$('#orderUserAttrName').val(man.resultContent.partyName);//姓名
		$('#orderUserAttrIdCard').val(man.resultContent.certNumber);//设置身份证号
		$('#orderUserAttrAddr').val(man.resultContent.certAddress);//地址
		$('#orderUserAttrIdPic').val(man.resultContent.identityPic);//证件照
		// 设置文本显示
		$("#li_order_name span").text(man.resultContent.partyName);
		$("#li_order_card span").text(man.resultContent.certNumber);
		$("#li_order_addr span").text(man.resultContent.certAddress);
	};
	
	/*
	 * 使用人拍照
	 */
	var _takePhoto = function(){
		
		var orderUserAttrTypeCd = $('#orderUserAttrTypeCd').val();//证件类型
		var orderUserAttrName = $('#orderUserAttrName').val();//姓名
		var orderUserAttrIdCard = $('#orderUserAttrIdCard').val();//身份证号
		var orderUserAttrAddr = $('#orderUserAttrAddr').val();//地址
		var orderUserAttrIdPic = $('#orderUserAttrIdPic').val();//地址
		var orderUserAttrPhoneNbr = $('#orderUserAttrPhoneNbr').val();//联系人号码
		
		//判断证件信息获取，不能为空
		if(!(ec.util.isObj(orderUserAttrName)&&ec.util.isObj(orderUserAttrIdCard)
				&&ec.util.isObj(orderUserAttrAddr)&&ec.util.isObj(orderUserAttrIdPic))){
			if(ec.util.isObj(orderUserAttrName)){
				$.alert("提示", "获取用户信息失败，请重新读卡.");
			}else{
				$.alert("提示", "请先进行身份证读卡.");
			}
			return;
		};
		
		$("#takePhotos_user span").text("拍照");
		$("#addUserDiv").hide();
		$("#takePhotoDiv").show("slow");
		
		order.cust.loadCameraObj($("#b_obj"),{style:""});
		//初始化页面
		$("#device_user").empty(); 
		
		$("#startPhotos_user").show().off("click").on("click",function(){_createVideo();});
		$("#tips_user").html("");
		$("#img_Photo_user")[0].src="";
		$("#img_Photo_user")[0].height=0;
		$("#img_Photo_user")[0].width=0;
		//按钮灰话，不绑定事件
		$("#takePhotos_user").removeClass("btna_o").addClass("btna_g");
		$("#rePhotos_user").removeClass("btna_o").addClass("btna_g");
		$("#takePhotos_user").off("click");
		$("#rePhotos_user").off("click");
		_getCameraInfo();
	};
	
	/*
	 *	创建视频
	 */
	var _createVideo = function(){
		var device = $("#device_user").val();
		if(device!=null && device != ""){
			var createVideo = JSON.parse(capture.createVideo(device,1280,720));//创建视频
			if(createVideo.resultFlag == 0){
				$("#startPhotos_user").hide();
//				OrderInfo.isCreateVideo = "Y";
				$("#capture")[0].style.visibility = 'visible';
				$("#takePhotos_user").removeClass("btna_g").addClass("btna_o");
				$("#takePhotos_user").off("click").on("click",function(){_createImage();});
			}else{
				$("#tips_user").html("提示："+createVideo.errorMsg);
				return;
			}
		}else{
			$("#startPhotos_user").show();
			$("#tips_user").html("提示：请选择一个摄像头设备"); 
			return;
		}
	};
	
	/*
	 *	获取驱动列表
	 */
	var _getCameraInfo = function(){
		var device = capture.getDevices();
	    device = JSON.parse(device);
		if (device == null || device == undefined) {
			$("#tips_user").html("提示：请检查是否正确安装插件");
			return;
	    }
		if(device.resultFlag == 0){
			$.each(device.devices,function(){
			    $("#device_user").append("<option value='"+this.device+"' >"+this.name+"</option>");
			});
			$("#startPhotos_user").off("click").on("click",function(){_createVideo();});
		}else{
			$("#tips_user").html("提示："+device.errorMsg);
			return;
		}
	};
	
	/*
	 * 拍照(点击确认拍照)
	 */ 
	var _createImage = function() {
		$("#tips_user").empty();
		if(!$('#img_Photo_user').is(":hidden")){}
		var createImage = cert.createImage("device_user");
		if (createImage && createImage.resultFlag != 0){
			$("#tips_user").html("提示："+ createImage.errorMsg);
			return false;
		}
		//针对IE8需要压缩照片
		var browser = CommonUtils.validateBrowser();
		var param = {
			"photograph":((browser.indexOf("IE8") >= 0) || (browser.indexOf("IE7") >= 0)) ? encodeURIComponent(createImage.compImage) : encodeURIComponent(createImage.image),
			"venderId":createImage.venderId
		};
		$.ecOverlay("<strong>正在处理中, 请稍等...</strong>");
		var response= $.callServiceAsJson(contextPath + "/cust/preHandleCustCertificate", param);
		$.unecOverlay();
		if(response.code == 0 && response.data){
			$("#img_Photo_user").attr("src", "data:image/jpeg;base64," + response.data.photograph);
			$("#img_Photo_user").attr("width", 640);
			$("#img_Photo_user").attr("height", 360);
			
			$("#img_Photo_user").attr("src", "data:image/jpeg;base64," + response.data.photograph);
			$("#img_Photo_user").attr("width", 640);
			$("#img_Photo_user").attr("height", 360);

			$("#img_Photo_user").data("identityPic", createImage.image);
			$("#orderUserPicture").val(createImage.image);
			$("#img_Photo_user").data("signature", createImage.signature);
			$("#img_Photo_user").data("venderId", createImage.venderId);
			//拍照后置灰按钮，取消绑定事件
			$("#rePhotos_user").removeClass("btna_g").addClass("btna_o");
			$("#rePhotos_user").off("click").on("click",function(){_rePhotos();});
			$("#takePhotos_user span").text("确认拍照");
			$("#takePhotos_user").off("click").on("click",function(){
				$("#photoTakeBtn span").text("查看");
				$("#photoTakeBtn").off("click").on("click",function(){_photoShow();})
				$("#takePhotoDiv").hide();
				$("#addUserDiv").show();
			});
		}else{
			$.alertM(response.data);
			$("#tips_user").html("提示："+response.data);
		}

		try{
			var obj = cert.closeVideo();
			var json = JSON.parse(obj);
			if (json && json.resultFlag != 0){
				$("#tips_user").html("提示：" + json.errorMsg);
			}
		}catch(e) {
			$.alert("错误" + "关闭视频连接发生异常：" + e);
			throw new Error("Close!Video!Exception : " + e);
		}
	};
	
	/*
	 * 重新拍照
	 */
	var _rePhotos = function(resultContent){
		//初始化页面
		$("#tips_user").html("");
		$("#img_Photo_user")[0].height=0;
		$("#img_Photo_user")[0].width=0;
		//拍照后置灰按钮，取消绑定事件
		$("#rePhotos_user").off("click");
		$("#rePhotos_user").removeClass("btna_o").addClass("btna_g");
		$("#takePhotos_user span").text("拍照");
		$("#takePhotos_user").off("click").on("click",function(){_createImage();});
		_createVideo();
	};
		
	/*
	 * 使用人拍照再次展示，预览
	 */
	var _photoShow = function(){
		
		$("#tips_user").html("");
		$("#img_Photo_user").attr("width", 640);
		$("#img_Photo_user").attr("height", 360);
		$("#rePhotos_user").removeClass("btna_g").addClass("btna_o");
		$("#rePhotos_user").off("click").on("click",function(){_rePhotos();});
		$("#addUserDiv").hide();
		$("#takePhotoDiv").show("slow");
		
		order.cust.loadCameraObj($("#b_obj"),{style:""});
		//初始化页面
		$("#device_user").empty(); 

		//按钮灰话，不绑定事件
		$("#takePhotos_user").removeClass("btna_o").addClass("btna_g");
		$("#takePhotos_user").off("click");
		_getCameraInfo();
	};
	
	/*
	 * 使用人拍照返回
	 */
	var _takePhotoBack = function(){
		$("#takePhotoDiv").hide();
		$("#addUserDiv").show();
		try{
			var obj = cert.closeVideo();
			var json = JSON.parse(obj);
			if (json && json.resultFlag != 0){
				$("#tips_user").html("提示：" + json.errorMsg);
			}
		}catch(e) {
			$.alert("错误" + "关闭视频连接发生异常：" + e);
			throw new Error("Close!Video!Exception : " + e);
		}
	};
	
	/*
	 * 添加使用人
	 */
	var _addUser = function(){
		var orderUserAttrTypeCd = $('#orderUserAttrTypeCd').val();//证件类型
		var orderUserAttrName = $('#orderUserAttrName').val();//姓名
		var orderUserAttrIdCard = $('#orderUserAttrIdCard').val();//身份证号
		var orderUserAttrAddr = $('#orderUserAttrAddr').val();//地址
		var orderUserAttrIdPic = $('#orderUserAttrIdPic').val();//证件照
		var orderUserAttrPhoneNbr = $.trim($('#orderUserAttrPhoneNbr').val());//联系人号码
		var orderUserAttrCardNum = $('#orderUserAttrCardNum').val();//办理数量
		var orderUserPicture = $('#orderUserPicture').val();//拍照照片
		var signature = $("#img_Photo_user").data("signature");//拍照厂商
		var orderRemark = $('#order_user_remark').val();//订单备注
		
		//判断证件信息获取，不能为空
		if(!(ec.util.isObj(orderUserAttrName)&&ec.util.isObj(orderUserAttrIdCard)
				&&ec.util.isObj(orderUserAttrAddr)&&ec.util.isObj(orderUserAttrIdPic))){
			if(ec.util.isObj(orderUserAttrName)){
				$.alert("提示", "获取用户信息失败，请重新读卡.");
			}else{
				$.alert("提示", "请先进行身份证读卡");
			}
			return;
		};
		
	    var pictures = [];

		pictures.push({
            "photograph": encodeURIComponent(orderUserAttrIdPic),
            "flag": "C", 
            "signature" :""
		}); 
		if(ec.util.isObj(orderUserPicture)){
			pictures.push({
	            "photograph": encodeURIComponent(orderUserPicture),
	            "flag": "D",
	            "signature" : signature
			});
		}
		
		$.ecOverlay("<strong>正在处理中, 请稍等...</strong>");
		var response = $.callServiceAsJson(contextPath + "/cust/uploadCustCertificate", {
			accNbr		: "",
			areaId		: OrderInfo.getAreaId(),
			srcFlag		: "REAL",
			certType	: orderUserAttrTypeCd,//证件类型
			extSystem	: "1000000206",
			certNumber	: orderUserAttrIdCard, //证件号码
			photographs	: pictures,
			collection 	: "true",
			venderId  	: $("#img_Photo_user").data("venderId")
	    });
		
		$.unecOverlay();
		if(response.code == 0 && response.data){
			var userInfo = {
					name : orderUserAttrName,
					idCard : orderUserAttrIdCard,
					idTypeCd : orderUserAttrTypeCd,
					addr : orderUserAttrAddr,
					idPic : orderUserAttrIdPic,
					phoneNbr : orderUserAttrPhoneNbr,
					cardNum : orderUserAttrCardNum,
					picture : orderUserPicture,
					virOlId : response.data.virOlId,
					remark : orderRemark
			};
			//判断是否已经添加
			for(var i=0;i<_userList.length;i++){
				if(userInfo.idTypeCd == _userList[i].idTypeCd&&userInfo.idCard == _userList[i].idCard){
					$.alert("错误", "该使用人已在列表之中，请确认后再添加。");
					return;
				}
			}
			userInfo.seq = ++_userSeq;//添加序列标识，用于删改
			_userList.push(userInfo);//添加到JS缓存
			//拼接添加表格
			var $tr = $("<tr id='tr_"+userInfo.seq+"' name='tr_"+userInfo.seq+"'></tr>");
			$tr.append("<td>"+userInfo.name+"</td>");
			$tr.append("<td>居民身份证</td>");
			$tr.append("<td>"+userInfo.idCard+"</td>");
			$tr.append("<td>"+userInfo.cardNum+"张</td>");
//			if(ec.util.isObj(userInfo.picture)){
//				$tr.append("<td>是</td>");
//			}else{
//				$tr.append("<td>否</td>");
//			}
			if(ec.util.isObj(userInfo.phoneNbr)){
				$tr.append("<td>"+userInfo.phoneNbr+"</td>");
			}else{
				$tr.append("<td>无</td>");
			}
			
			if(ec.util.isObj(userInfo.remark)){
				$tr.append("<td>"+userInfo.remark+"</td>");
			}else{
				$tr.append("<td>无</td>");
			}
			$tr.append("<td>"+/*"<a class='btn_h30' href='javascript:void(0)' onclick = 'cust.collection.modfiyUser("+userInfo.seq+")'><span>修改</span></a>"+*/
						   "<a class='btn_h30' href='javascript:void(0)'onclick = 'cust.collection.delUser("+userInfo.seq+")'><span >删除</span></a></td>");
			$("#custCltUserInfoTbody").append($tr);
			easyDialog.close();
		}else if(response.code == 1 && response.data){
			$.alert("错误", "拍照上传失败，错误原因：" + response.data);
			return;
		}else if(response.code == -2 && response.data){
			$.alertM(response.data);
			return;
		}else {
			$.alert("错误", "拍照上传发生未知异常，请稍后重试。错误信息：" + response.data);
			return;
		}
	};
	
	/*
	 * 修改使用人
	 */
	var _modfiyUser = function(seqId){
		
	};
	
	/*
	 * 删除使用人
	 */
	var _delUser = function(seqId){
		for(var i=0;i<_userList.length;i++){
			if(_userList[i].seq == seqId){
				_userList.splice(i,1);
				break;
			}
		}
		$("#tr_"+seqId).remove();
	};
	
	/*
	 * 打印采集单
	 */
	var _print = function(){
		//客户定位拦截
		if(!_checkCust()){
			return;
		}
		
		//使用人信息拦截
		if(_userList.length<1){
			$.alert("提示", "当前采集单未添加使用人，为无效采集单，请先添加使用人后再进行打印!");
			return;
		}
		
		//有效期拦截
		if(!ec.util.isObj($("#p_expDt").val())){
			$.alert("提示", "当前采集单有效期为空，为无效采集单，请先选择有效期后再进行打印!");
			return;
		}
		
		//经办人信息拦截
		var orderAttrName = $.trim($("#orderAttrName").val()); //经办人姓名
		var orderAttrIdCard = $.trim($("#orderAttrIdCard").val()); //证件号码
		var orderAttrAddr = $.trim($("#orderAttrAddr").val()); //地址
		
		//若页面上填写了经办人信息，但没有进行拍照，则拦截提示，不管权限不权限
		if(!ec.util.isObj(orderAttrName) || !ec.util.isObj(orderAttrIdCard) || !ec.util.isObj(orderAttrAddr)||!ec.util.isObj(OrderInfo.virOlId)){
			$.alert("提示","未填写经办人信息或未进行经办人拍照，在订单提交之前，请点击【读卡】或者【查询】按钮进行拍照以确认是否“人证相符”。");
			return false ;
		}
		
		//新建经办人中不允许出现脱敏等非法字符
		if(OrderInfo.ifCreateHandleCust){
			if (OrderInfo.bojbrCustInfos.name.match(/[*]/ig) != null
					|| OrderInfo.bojbrCustInfos.addressStr.match(/[*]/ig) != null
					|| OrderInfo.bojbrCustIdentities.identityNum.match(/[*]/ig) != null) {
				$.alert("错误","经办人信息中包含非法字符（*），请确认填写是否正确！");
				return false ;
			}
			
			if(ec.util.isObj(OrderInfo.bojbrCustInfos.telNumber)){
				if(OrderInfo.bojbrPartyContactInfo.mobilePhone.match(/[*]/ig) != null){
					$.alert("错误","经办人信息中包含非法字符（*），请确认填写是否正确！");
					return false ;
				}
			}
		}
			
		//采集单提交节点
		var orderList = {};
		
		
		
		//采集单信息
		orderList.collectionOrderInfo = {
            "collectType": "1",
            "expDate": $("#p_expDt").val()+" 23:59:59",
            "sysFlag": CONST.OL_TYPE_CD.FOUR_G,
            "remarks": $.trim($("#order_remark").val()),
            "areaId": cust.collection.custInfo.queryAreaId,
            "transactionId" :UUID.getDataId()
        };
		
		//采集单客户信息
		var custInfos = [];
		//采集单客户序列
		var seq = 1;
		//OrderInfo.cust; 客户定位客户信息
		_custInfo = {
            "addressStr":OrderInfo.cust.addressStr,
            "certNumber": OrderInfo.cust.idCardNumber,
            "certType": OrderInfo.cust.identityCd,
            "certTypeName": OrderInfo.cust.identityName,
            "contactAddress": "",
            "custName": OrderInfo.cust.partyName,
            "lanId": cust.collection.custInfo.queryAreaId,
            "maxQuantity": 0,
            "partyRoleCd": "0",//产权人
            "partyTypeCd": "2",//政企
            "remarks": JSON.stringify(cust.collection.custInfo),
            "seq": seq++,
            "telNumber": ""
        };
		custInfos.push(_custInfo);
		
		//填充经办人信息
		var _jbrInfo = OrderInfo.bojbrCustIdentities;//经办人信息
		var _jbrPartyInfo = {
            "addressStr": _jbrInfo.addressStr,
            "certNumber": _jbrInfo.identityNum,
            "certType": "1",//只可用居民身份证，写死
            "certTypeName": "居民身份证",
            "contactAddress": "",
            "custName": _jbrInfo.name,
            "lanId": cust.collection.custInfo.queryAreaId,
            "fileOrderId" : OrderInfo.virOlId,
            "maxQuantity": 0,
            "partyRoleCd": "3",//经办人
            "partyTypeCd": "1",//个人
            "remarks": "",
            "seq": seq++,
            "telNumber": $.trim($("#orderAttrPhoneNbr").val())
		};
		custInfos.push(_jbrPartyInfo);
		
		//使用人信息
		var printSeq = 1;
		for(var i = 0;i<_userList.length;i++){
			var _userInfo = {
                "addressStr": _userList[i].addr,
                "certNumber": _userList[i].idCard,
                "certType": "1",
             	"certTypeName": "居民身份证",
                "contactAddress": "",
                "custName": _userList[i].name,
                "fileOrderId": _userList[i].virOlId,
                "lanId": cust.collection.custInfo.queryAreaId,
                "maxQuantity": _userList[i].cardNum,
                "partyRoleCd": "1",//使用人
                "partyTypeCd": "1",//个人用户
                "remarks": _userList[i].remark,
                "seq" : seq++,
                "telNumber" : _userList[i].phoneNbr,
                "printSeq" :printSeq++
			}
			custInfos.push(_userInfo);
		};
		orderList.collectionCustInfos = custInfos;
    	$.callServiceAsJson(contextPath + "/order/custCltSubmit", {collectionOrderList:orderList}, {
            "before": function () {
                $.ecOverlay("<strong>正在提交打印中,请稍等...</strong>");
            }, "done": function (response) {
                if (response.code == 0) {
            		_printData = response.data;
            		common.print.custCltReceipt(_printData);
            		$.confirm("打印确认","实名信息采集单["+response.data.orderNbr+"]已打印，请核对信息，确认已正常打印？",{ 
            			names:["是","否"],
            			yesdo:function(){
            				$("#custCltCommit").removeClass("btna_g").addClass("btna_o");
            	    		$("#custCltCommit").off("click").on("click",function(){_submit(response.data)});
            			},
            			no:function(){}
            		});
                } else {
                    $.alertM(response.data);
                }
            }, "fail": function (response) {
            	
            }, "always": function () {
                $.unecOverlay();
            }
        });
	};
	
	/*
	 * 采集单确认
	 */
	var _submit = function(param){
		if(!_checkCust()){
			return;
		}
		$.callServiceAsJson(contextPath + "/order/custCltCommit", param, {
            "before": function () {
                $.ecOverlay("<strong>正在确认中,请稍等...</strong>");
            }, "done": function (response) {
                if (response.code == 0) {
            		$.confirm("确认","实名信息采集单["+param.orderNbr+"]已经受理成功，是否继续受理？",{ 
            			names:["是","否"],
            			yesdo:function(){
            				_orderReset();            			},
            			no:function(){}
            		});
                } else {
                    $.alertM(response.data);
                }
            }, "fail": function (response) {
            	
            }, "always": function () {
                $.unecOverlay();
            }
        });
	};
	
	/*
	 * 提取方法，拦截没定位客户操作
	 */
	var _checkCust = function(){
		var custId = OrderInfo.cust.custId;
		if(OrderInfo.cust==undefined || custId==undefined || custId==""){
			$.alert("提示","在确认采集单之前请先进行客户定位或者新建客户！");
			return false;
		}else{
			return true;
		}
	};
	
	/*
	 * 限制字数
	 */
	var _textareaCheck = function(obj,num){
		var str = $(obj).val(); 
		if (str.length>num){ 
			$(obj).val(str.substr(0,num)); 
		}  
	};
	
	/*
	 * 取消实名信息采集单（重置）
	 */
	var _orderReset = function(){
		location.reload();
	};
	
	//--------------------------------采集单查询---------------------------------------------
	
	/*
	 * 查询列表
	 */
	var _queryCartList = function(pageIndex){
		var curPage = 1 ;
		if(pageIndex>0){
			curPage = pageIndex ;
		}
		var param = {};
		if($("#if_p_olNbr").attr("checked")){
			if(!$("#p_olNbr").val()||$.trim($("#p_olNbr").val())==""){
				$.alert("提示","请输入 '采集单号' 再查询");
				return ;
				if(!$("#p_areaId_val").val()||$("#p_areaId_val").val()==""){
					$.alert("提示","请选择 '地区' 再查询");
					return ;
				}
			}
			param = {
					"areaId":$("#p_areaId").val(),
					"olNbr":$("#p_olNbr").val(),
					"qryBusiOrder":$("#p_qryBusiOrder").val(),
					"startDt":"",
					"endDt":"",
					"staffId":"",//员工ID(主键)
					"nowPage":curPage,
					"pageSize":10,
					"channelId":""
			};
		}else{
			var channelId = $("#p_channelId").val();
			if(channelId==null||channelId==""||channelId==undefined){
				$.alert("提示","渠道地区为空，无法查询！");
				return ;
			}
			var areaId = $("#p_areaId").val();
			if(areaId==null||areaId==""||areaId==undefined){
				$.alert("提示","请选择 '地区' 再查询");
				return ;
			}
			if($("#p_startDt").val()==""){
				$.alert("提示","请选择受理时间");
				return;
			}
			param = {
					"areaId":areaId,
					"startDt":$("#p_startDt").val().replace(/-/g,''),
					"endDt":$("#p_endDt").val().replace(/-/g,''),
					"staffId":$("#p_staffId").val(),//员工ID(主键)
					"channelId":channelId,
					"nowPage":curPage,
					"pageSize":10
			};
		}
		$.callServiceAsHtmlGet(contextPath+"/order/queryCustCollectionList",param,{
			"before":function(){
				$.ecOverlay("采集单查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response.data && response.data.substring(0,6)!="<table"){
					$.alert("提示",response.data);
				}else{
					$("#cart_list").html(response.data).show();
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	/*
	 * 采集单详情查询
	 */
	var _queryOrderDetail = function(orderId){
		var param = {
				"orderId":orderId,
				"areaId":$("#p_areaId").val()
		};
		_queryDetail(param,function(data){
			$("#d_query").hide();
			$("#d_cartInfo").html(data).show();
		});
	};
	
	/*
	 * 跳转到订单受理
	 */
	var _acceptOrder = function(orderId){
		//判断是否打开，定义一个iframe用于实名信息采集单受理，在iframe中调用父页面中定义的方法
		if(parent.main.home.tabManager.isTabItemExist("main_tab_clt_order")){
			$.alert("提示","您正在进行“实名信息采集单受理”，无法同时再次受理，如确认需要受理，请先关闭“实名信息采集单受理”菜单后再进行操作!");
			return;
		}
		var param = {
				"orderId":orderId,
				"areaId":$("#p_areaId").val(),
				"acceptOrder": "Y"
		};
		_queryDetail(param,function(){
			parent.main.home.addTab('main_tab_clt_order','实名信息采集单受理',contextPath+'/order/cltPrepare');
		});
	};
	
	/*
	 * 跳转到订单受理
	 */
	var _queryDetail = function(param,callback){
		$.callServiceAsHtmlGet(contextPath+"/order/queryCustCollectionInfo",param,{
			"before":function(){
				$.ecOverlay("详情查询中，请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response && response.code == -2){
					$.alertM("错误",response.data);
					return ;
				}else if(response.data && response.code != 0){
					$.alert("提示",response.data);
				}else{
					callback.call(this,response.data);
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	return {
		init : _init,
		addUserDialog : _addUserDialog,
		addUser : _addUser,
		readUserCert : _readUserCert,
		modfiyUser : _modfiyUser,
		delUser : _delUser,
		takePhotoBack : _takePhotoBack,
		print : _print,
		submit : _submit,
		userList :_userList,
		textareaCheck : _textareaCheck,
		orderReset : _orderReset,
		queryCartList : _queryCartList,
		queryOrderDetail : _queryOrderDetail,
		acceptOrder : _acceptOrder
	};
})();
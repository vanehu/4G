/**
 * 对缓存数据操作
 * 
 * 
 * @author wukf
 * date 2014-01-15
 */
CommonUtils.regNamespace("CacheData");

/** 缓存数据对象*/
CacheData = (function() {
	
	//把销售品规格保存到开通列表里面
	var _setOfferSpec = function(prodId,offerSpec){
		offerSpec.isdel="C";
		offerSpec.counts=1;
		var flag = true ; 
		for (var i = 0; i < AttachOffer.openList.length; i++) { //没有开通任何附属
			var open = AttachOffer.openList[i];
			if(open.prodId==prodId){
				flag = false;
				break;
			}
		} 
		if(flag){
			var open = {
				prodId : prodId,
				specList : []
			};
			AttachOffer.openList.push(open);
		}
		CacheData.getOfferSpecList(prodId).push(offerSpec);//添加到已开通列表里
	};
	
	//添加功能产品到缓存列表
	var _setServSpec = function(prodId,spec){
		spec.isdel="C";
		if(spec.servSpecId==undefined){
			spec.servSpecId = spec.objId;
		}
		if(spec.servSpecName==undefined){
			spec.servSpecName = spec.objName;
		}
		var flag = true ; 
		for (var i = 0; i < AttachOffer.openServList.length; i++) { //没有开通任何附属
			var open = AttachOffer.openServList[i];
			if(open.prodId==prodId){
				flag = false;
				break;
			}
		} 
		if(flag){
			var open = {
				prodId : prodId,
				servSpecList : []
			};			
			AttachOffer.openServList.push(open);
		}
		CacheData.getServSpecList(prodId).push(spec);//添加到已开通列表里
	};
	//设置鉴权日志id
	var _setRecordId = function (id) {
		recordId = id;
	};
	//把选中的服务保存到销售品规格中
	var _setServ2OfferSpec = function(prodId,offerSpec){
		if(offerSpec!=undefined){
			$.each(offerSpec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if($("#check_"+prodId+"_"+this.objId).attr("checked")=="checked"){
						this.selQty = 1;
					}else{
						this.selQty = 2;//未选中
					}
				});
			});
		}
	};
	
	//把选中的销售品保存到依赖或互斥的销售品规格中
	var _setOffer2ExcludeOfferSpec = function(prodId,param){
		if(param.dependOffer.offerGrpInfos.length>0){  // 依赖组
			var dependOffer=param.dependOffer;
			for (var i = 0; i < dependOffer.offerGrpInfos.length; i++) {
				var offerGrpInfo = dependOffer.offerGrpInfos[i];
				var $offerSpecs = $("input[name="+offerGrpInfo.grpId+"]:checked");
				var len  = $offerSpecs.length;
				dependOffer.offerGrpInfos[i].checkLen=len;
				for(var j=0;j<offerGrpInfo.subOfferSpecInfos.length;j++){
					var subOfferSpecInfo=offerGrpInfo.subOfferSpecInfos[j];
					$offerSpecs.each(function(){
						if($(this).val()==subOfferSpecInfo.offerSpecId){
							subOfferSpecInfo.isCheck=true;
						}
					});
				}
			}
		}
		/**
		 * 	可选依赖包遍历optDependOffer
		 * 	defaultOffer	默认，默认打钩，钩可以去掉，
		 *	dependOffer 	依赖，默认打钩，钩不能去掉，
		 *	excludeOffer	互斥，用来和已订购的销售品对比，如果有互斥中的，就退订，
		 *	optDependOffer	可选依赖
		 */
		if(param.optDependOffer &&  param.optDependOffer.length > 0){
			var optDependOffers = param.optDependOffer;
			for (var i = 0; i < optDependOffers.length; i++) {
				if($("#"+optDependOffers[i]+"").attr("checked") == "checked"){
					AttachOffer.addOpenList(prodId,optDependOffers[i]);
				}
			}
		}
	};
	
	//把我已收藏的销售品保存到开通列表里面
	var _setMyfavoriteSpec = function(prodId,offerSpec){
		var flag = true ; 
		for (var i = 0; i < AttachOffer.myFavoriteList.length; i++) { //没有收藏
			var favorite = AttachOffer.myFavoriteList[i];
			if(favorite.prodId==prodId){
				flag = false;
				break;
			}
		} 
		if(flag){
			var favorite = {
				prodId : prodId,
				favoriteList : []
			};
			AttachOffer.myFavoriteList.push(favorite);
		}
		CacheData.getMyfavoriteSpecList(prodId).push(offerSpec);//添加到我已收藏的销售品列表中
	};
	
	//通过产品id获取产品已收藏的销售品列表
	var _getMyfavoriteSpecList = function (prodId){
		for ( var i = 0; i < AttachOffer.myFavoriteList.length; i++) {
			var favorite = AttachOffer.myFavoriteList[i];
			if(favorite.prodId == prodId){
				return favorite.favoriteList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	
	//获取参数内容
	var _getParamContent = function(prodId,spec,flag){
		var content = '<form id="paramForm"><table>' ;
		if(flag==2){  //功能产品规格参数
			if(ec.util.isArray(spec.prodSpecParams)){ //拼接功能产品规格参数
				for (var i = 0; i < spec.prodSpecParams.length; i++) { 
					var param = spec.prodSpecParams[i];
					if(param.value==undefined){
						param.value = "";
					}
					content += _getStrByParam(prodId,param,spec.servSpecId,param.itemSpecId,param.value);
				}
			}
		}else if(flag==3){ //功能产品实例参数
			if(ec.util.isArray(spec.prodSpecParams)){ //拼接功能产品规格参数
				for (var i = 0; i < spec.prodSpecParams.length; i++) { 
					var param = spec.prodSpecParams[i];
					if(ec.util.isArray(spec.prodInstParams)){ //拼接功能产品实例参数
						$.each(spec.prodInstParams,function(){
							if(this.itemSpecId==param.itemSpecId){
								param.value = this.value;
							}
						});
					}
					if(param.value==undefined){
						param.value = "";
					}
					content += _getStrByParam(prodId,param,spec.servSpecId,param.itemSpecId,param.value);
				}
			}
		} else if(flag==1){  //销售品实例参数
			if(spec.offerSpec!=undefined){
				if(ec.util.isArray(spec.offerSpec.offerSpecParams)){
					var offerSpecParams = spec.offerSpec.offerSpecParams;//sortParam(spec.offerSpec.offerSpecParams);
					$.each(offerSpecParams,function(){
						var param = this;
						if(ec.util.isArray(spec.offerParamInfos)){ //销售品实例参数
							$.each(spec.offerParamInfos,function(){  
								if(this.itemSpecId==param.itemSpecId){
									param.value = this.value;
								}
							});
						}
						content += _getStrByParam(prodId,this,spec.servSpecId,this.itemSpecId,this.value);
					});
				}
			}
		}else {  //销售品规格参数
			if(ec.util.isArray(spec.offerSpecParams)){
				var offerSpecParams = spec.offerSpecParams;
				$.each(offerSpecParams,function(){
					content += _getStrByParam(prodId,this,spec.servSpecId,this.itemSpecId,this.value);
				});
			}
			/*if(spec.offerRoles!=undefined && spec.offerRoles.length>0){
				for (var i = 0; i < spec.offerRoles.length; i++) {
					var offerRole = spec.offerRoles[i];
					for (var j = 0; j < offerRole.roleObjs.length; j++) {
						var roleObj = offerRole.roleObjs[j];
						if(roleObj.prodSpecParams !=undefined && roleObj.prodSpecParams.length>0){
							for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
								content += _getStrByParam(prodId,roleObj.prodSpecParams[k],roleObj.prodSpecParams[k].itemSpecId,flag);
							}
						}
					}
				}
			}*/
		}
		content +='</table></form>';
		return content;
	};
	
	//获取增值业务内容
	var _getAppContent = function(prodId,appList){
		var $form = $('<form id="appForm"></form>');
		if(!!appList && appList.length>0){ //下拉框
			$.each(appList,function(){
				var $input = $('<input id="'+prodId+'_'+this.objId+'" name="'+prodId+'" type="checkbox">'+this.objName+'</input></br>');
				if(this.minQty == 0){
					if(this.dfQty>0){
						$input.attr("checked","checked");
					}
				}else if(this.minQty > 0){
					$input.attr("checked","checked");
					$input.attr("disabled","disabled");
				}
				$form.append($input);
			});
		}
		return $form;
	};
	
	//根据参数获取字符串
	var _getStrByParam = function(prodId,param,specId){
		var itemSpecId = param.itemSpecId;
		if(param.setValue==undefined){  //没有设置过参数
			param.setValue = param.value; //赋值成默认值
		}
		var paramVal = param.setValue;
		var selectStr = ""; //返回字符串
		var optionStr = "";
		if(!!param.valueRange && itemSpecId == 11251741){ //可编辑下拉框（11251741 为政企协议编码 ） 这段 仅仅最为 临时处理 后续优化
			//if(param.rule.isConstant=='Y'){ //不可修改
		//		selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>"; 
		//	}else {
		//		if(param.rule.isOptional=="N") { //必填
			      //  selectStr = selectStr + '<script src="${contextPath}/js/busi-js/order/test.js?${jsversion}" type="text/javascript"></script>';
			       
					selectStr = selectStr + param.name + ": <input id='input1' name='input1' type='text' class='cssINPUT'  style='height: 19px; display: block; float: left; position: absolute; border-right: 0px;'><label class='f_red'>*</label><br>";
					selectStr = selectStr + "<select id='select1'  name='select1' class='cssINPUT' data-validate='validate(required:请在下拉框中选择协议编码) on(blur)' style='float: left;display: none; height: 27PX; position: absolute; cursor: pointer; margin-left: 2px;  padding: 0px;'>"; 
					
		//		}else{
		//			selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+"><br>"; 
				    optionStr +='<option style="display:none" value=""></option>';  //不是必填可以不选
		//		}
		//	}
			for ( var j = 0; j < param.valueRange.length; j++) {
				var valueRange = param.valueRange[j];
				if(valueRange.value== param.setValue){
					optionStr +='<option value="'+valueRange.value+'" selected="selected" >'+valueRange.text+'</option>';
				}else {
					optionStr +='<option value="'+valueRange.value+'">'+valueRange.text+'</option>';
				}
			}
			selectStr += optionStr + "</select><br>"; 
			selectStr = selectStr + "<div id='div1' style='position: absolute;top:77px;'></div>";
			return selectStr;
		}
		if(!!param.valueRange && (itemSpecId == CONST.YZFitemSpecId1||itemSpecId ==  CONST.YZFitemSpecId2||itemSpecId ==  CONST.YZFitemSpecId3)){ //可编辑下拉框（10020034,10020035,10020036 为翼支付交费助手的三属性）
			//缴费助手的属性值,如果是预付费的，则属性中展示默认值，且必填，如果是后付费的，属性为空，且不可填
		var feeType = $("select[name='pay_type_-1']").val();
		if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
		if(feeType == CONST.PAY_TYPE.BEFORE_PAY){
			if(param.rule.isConstant=='Y'){ //不可修改
				selectStr = selectStr+"<tr><td>"+param.name + ": </td><td><select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>"; 
			}else {
				if(param.rule.isOptional=="N") { //必填
					selectStr = selectStr+"<tr><" +
							"td>"+param.name + ": </td><td><select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" data-validate='validate(required,reg:"
							  + param.rule.maskMsg+"("+param.rule.mask+")) on(blur)'><label class='f_red'>*</label><br>"; 
				}else{
					selectStr = selectStr+"<tr><td>"+param.name + ": </td><td><select class='inputWidth183px' id="+prodId+"_"+itemSpecId+"><br>"; 
				}
			}
			for ( var j = 0; j < param.valueRange.length; j++) {
				var valueRange = param.valueRange[j];
				if(valueRange.value== param.setValue){
					optionStr +='<option value="'+valueRange.value+'" selected="selected" >'+valueRange.text+'</option>';
				}else {
					optionStr +='<option value="'+valueRange.value+'">'+valueRange.text+'</option>';
				}
			}
			selectStr += optionStr + "</select></td></tr>"; 
			return selectStr;
		}
			else if(feeType == CONST.PAY_TYPE.AFTER_PAY){
				selectStr =selectStr+"<tr><td>"+ param.name + ":</td><td> <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>";
				optionStr +='<option value="" selected="selected">不可选</option>';
				selectStr += optionStr + "</select></td></tr>"; 
				return selectStr;
			}
		}
		//可编辑下拉框 20030115 征信合约征信业务类型属性
		if(!!param.valueRange && itemSpecId == CONST.ZXYWLX){
			if(OrderInfo.preliminaryInfo.businessType == CONST.BUS_TYPE.ADD_SINGLE || OrderInfo.preliminaryInfo.businessType == CONST.BUS_TYPE.ADD_FUSE || OrderInfo.preliminaryInfo.businessType == CONST.BUS_TYPE.ADD_OTHER_FUSE){//单手机业务 1000
				selectStr =selectStr+"<tr><td>"+ param.name + ":</td><td> <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>";
				optionStr +='<option value="1000">单手机业务</option>';
				selectStr += optionStr + "</select></td></tr>"; 
			}else {//融合业务 1001
				selectStr =selectStr+"<tr><td>"+ param.name + ":</td><td> <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>";
				optionStr +='<option value="1001">融合业务</option>';
				selectStr += optionStr + "</select></td></tr>"; 
			}
			return selectStr;
		}
		//不可编辑文本框 20030116 征信合约征信平台工单编号属性
		if(itemSpecId == CONST.ZXPTGDBMH){
			selectStr += '<tr><td>'+param.name + ': </td><td><input id="'+prodId+'_'+itemSpecId
			+'" class="inputWidth183px" type="text" disabled="disabled" value="'+OrderInfo.preliminaryInfo.bzjOrderNo+'" >';
		    selectStr+='</td></tr>';
		    return selectStr;
		};
		if(ec.util.isArray(param.valueRange)){ //下拉框
			var agentResponse = $.callServiceAsJson(contextPath + "/properties/getValue", {"key": "AGENT_" + OrderInfo.staff.areaId.substr(0, 3)});
			var agentFlag = "OFF";
			if (agentResponse.code == "0") {
				agentFlag = agentResponse.data;
			}
			if (itemSpecId ==  CONST.YZFitemSpecId4 && agentFlag == "OFF") {
				return selectStr;
			}
			if(param.rule.isConstant=='Y'){ //不可修改
				selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>"; 
			}else {
				if(param.rule.isOptional=="N") { //必填
					selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" data-validate='validate(required,reg:"
							  + param.rule.maskMsg+"("+param.rule.mask+")) on(blur)'><label class='f_red'>*</label><br>"; 
				}else{
					selectStr = param.name + ": <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+"><br>"; 
					optionStr +='<option value="" >请选择</option>';  //不是必填可以不选
				}
			}
			if(itemSpecId == CONST.YZFitemSpecId4 && OrderInfo.actionFlag != 1){//#658051 账户托收退订特殊权限的需求
				var isYZFTS = "";
				var url = contextPath+"/common/checkOperate";
				var params = {
					operatSpecCd : "ZHTS_TD_QS" //账户托收退订权限
				};
				var response = $.callServiceAsJson(url,params);
				$.unecOverlay();
				if(response.code == 0){
					isYZFTS = response.data;
				}
				for ( var j = 0; j < param.valueRange.length; j++) {
					var valueRange = param.valueRange[j];
					if(isYZFTS != "0" && valueRange.value=="10"){
						continue;
					}
					if(valueRange.value== param.setValue){
					    optionStr +='<option value="'+valueRange.value+'" selected="selected" >'+valueRange.text+'</option>';
					}else {
						optionStr +='<option value="'+valueRange.value+'">'+valueRange.text+'</option>';
					}
				}
				selectStr += optionStr + "</select></td></tr>";
				return selectStr;
			}
			for ( var j = 0; j < param.valueRange.length; j++) {
				var valueRange = param.valueRange[j];
				if(valueRange.value== param.setValue){
					optionStr +='<option value="'+valueRange.value+'" selected="selected" >'+valueRange.text+'</option>';
				}else {
					optionStr +='<option value="'+valueRange.value+'">'+valueRange.text+'</option>';
				}
			}
			selectStr += optionStr + "</select><br>"; 
		}else { 
			 if(param.dataTypeCd==1){  //文本框
				if(param.rule==undefined){
					selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId +'" class="inputWidth183px" type="text" value="'+paramVal+'" ><br>'; 
				}else {
					if(param.rule.isConstant=='Y'){ //不可修改
						selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId
						+'" class="inputWidth183px" type="text" disabled="disabled" value="'+paramVal+'" >';
						if(ec.util.isObj(specId)&&ec.util.isObj(CONST.getGroupServProdMap(specId,itemSpecId))){//是否是群功能产品
							var type=CONST.getGroupServProdMap(specId,itemSpecId);
							var id=prodId+'_'+specId+'_'+itemSpecId;
							selectStr+='<a class="purchase" href="javascript:order.main.queryGroup('+type+',0,\''+id+'\');">选择</a>';
						}
						selectStr+='<br>';
					}else {
						if(param.rule.isOptional=="N") { //必填
							if(OrderInfo.isGroupProSpecId(specId)){//群功能产品
								selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
								+'" class="inputWidth183px" type="text" mask="'+param.rule.mask+'" maskmsg="'+param.rule.maskMsg+'" value="'+paramVal+'" ><label style="color: #ff0000;float:right;margin-right:40px;">*</label><br>';
							}else{
								selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
								+'" class="inputWidth183px" type="text" mask="'+param.rule.mask+'" maskmsg="'+param.rule.maskMsg+'" value="'+paramVal+'" ><label class="f_red">*</label><br>';//data-validate="validate(required,reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)"
							}
						}else{
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="text" mask="'+param.rule.mask+'" maskmsg="'+param.rule.maskMsg+'" value="'+paramVal+'" ><br>';//data-validate="validate(reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)"
						}
					}
				}
			} else if(param.dataTypeCd==8){  //密码框
				if(param.rule==undefined){
					selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId +'" class="inputWidth183px" type="password" value="'+paramVal+'" ><br>'; 
				}else{
					if(param.rule.isConstant=='Y'){
						selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId
						+'" class="inputWidth183px" type="password"  disabled="disabled" value="'+paramVal+'" ><br>';
					}else {
						if(param.rule.isOptional=="N") {
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="password" data-validate="validate(required,reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><label class="f_red">*</label><br>'; 
						}else{
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="password" data-validate="validate(reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ><br>'; 
						}
					}
				}
			}else if(param.dataTypeCd==4){ //日期，暂时不写
			
			
			}
		}
		return selectStr;
	};
	
	//获取销售品下的功能产品拼接成字符串
	var _getOfferProdStr = function(prodId,spec,flag){
		var content = '<form id="paramForm">' ;
		var str = "";
		if(flag==0){  //订购可选包
			$.each(spec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.objType==4){
						if(this.minQty==0 && this.maxQty>0 && this.dfQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked">'+this.objName+'<br>'; 
						}else if(this.minQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'"  type="checkbox" checked="checked" disabled="disabled">'+this.objName+'<br>';
						}else if(this.minQty==0 && this.maxQty>0 && this.dfQty==0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox">'+this.objName+'<br>'; 
						}
					}
				});
			});
			if(str==""){
				content = '订购【'+spec.offerSpecName+'】可选包' ;
			}else{
				content = '订购【'+spec.offerSpecName+'】可选包，需要开通以下勾选的功能产品：<br>' +str;
			}
		}else if(flag==1) { //退订可选包
			$.each(spec.offerMemberInfos,function(){  //退订时候spec当成serv
				var offerMember = this;
				$.each(spec.offerSpec.offerRoles,function(){
					$.each(this.roleObjs,function(){
						if(offerMember.objId==this.objId && this.relaTypeCd==CONST.RELA_TYPE_CD.SELECT){ //优惠构成关系
							var servId = offerMember.objInstId;
							if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CLOSE&&this.minQty<=0){
								str += '<input id="check_'+prodId+'_'+servId+'" type="checkbox" checked="checked" disabled="disabled">'+this.objName+'<br>'; 
							}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE&&this.minQty<=0){
								str += '<input id="check_'+prodId+'_'+servId+'" type="checkbox" checked="checked">'+this.objName+'<br>';
							}
						}
					});
				});
			});
			if(str==""){
				content = '退订【'+spec.offerSpecName+'】可选包' ;
			}else{
				content = '退订【'+spec.offerSpecName+'】可选包，需要关闭以下勾选的功能产品：<br>' +str;
			}
		}else if(flag==2) { //取消订购可选包
			$.each(spec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.relaTypeCd==CONST.RELA_TYPE_CD.SELECT){ //优惠构成关系
						if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CLOSE&&this.minQty<=0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked" disabled="disabled">'+this.objName+'<br>'; 
						}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE&&this.minQty<=0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked">'+this.objName+'<br>';
						}
					}
				});
			});
			if(str==""){
				content = '取消订购【'+spec.offerSpecName+'】可选包' ;
			}else{
				content = '取消订购【'+spec.offerSpecName+'】可选包，需要取消开通以下勾选的功能产品：<br>' +str;
			}
		}
		content +='</form>';
		return content;
	};
	
	//自动设置参数
	var _setParam = function(prodId,offerSpec){
		//自动设置销售品参数
		if(ec.util.isArray(offerSpec.offerSpecParams)){
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				if(ec.util.isArray(param.valueRange)){ //不是下拉框
					if(param.value==undefined || param.value==""){ //必须手工填写
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}else{
					if(param.value==undefined || param.value==""){
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}
			}
		}
		//自动设置服务参数
		/*if(!!offerSpec.offerRoles){
			for (var i = 0; i < offerSpec.offerRoles.length; i++) {
				var offerRole = offerSpec.offerRoles[i];
				for (var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(!!roleObj.prodSpecParams){
						for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
							var param = roleObj.prodSpecParams[k];
							if(param.valueRange.length == 0){ //不是下拉框
								if(param.value===""){ //必须手工填写
									return false;
								}
							}else{
								if(param.value==undefined || param.value==""){
									param.value = param.valueRange[0].value; 
								}
							}
						}
					}
				}
			}
		}*/
		offerSpec.isset = "Y";
		return true;
	};

	//自动设置服务参数
	var _setServParam = function(prodId,servSpec){
		if(ec.util.isArray(servSpec.prodSpecParams)){
			for (var k = 0; k < servSpec.prodSpecParams.length; k++) {
				var param = servSpec.prodSpecParams[k];
				if(ec.util.isArray(param.valueRange)){ //下拉框
					if(param.value==undefined || param.value==""){ //必须手工填写
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}else{
					if(param.value==undefined || param.value==""){
						if(param.rule.isOptional=="N"){ //必填
							return false;
						}
					}
				}
			}
		}
		servSpec.isset = "Y";
		return true;
	};
	
	//通过产品id获取产品已开通附属规格列表
	var _getOfferSpecList = function (prodId){
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			if(open.prodId == prodId){
				return open.specList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//通过产品id,跟销售品规格id获取销售品构成
	var _getOfferSpec = function(prodId,offerSpecId){
		var specList = _getOfferSpecList(prodId);
		if(specList!=undefined){
			for ( var i = 0; i < specList.length; i++) {
				if(specList[i].offerSpecId==offerSpecId){
					return specList[i];
				}
			}
		}
	};
	
	//获取某个销售品规格参数  
	var _getSpecParam = function(prodId,offerSpecId,itemSpecId){
		var spec = _getOfferSpec(prodId,offerSpecId);
		if(ec.util.isObj(spec)){
			for ( var i = 0; i < spec.offerSpecParams.length; i++) {
				if(spec.offerSpecParams[i].itemSpecId==itemSpecId){
					return spec.offerSpecParams[i];
				}
			}
		}
	};
	
	//获取销售品下某个功能产品参数  
	var _getProdSpecParam = function(prodId,offerSpecId,itemSpecId){
		var spec = _getOfferSpec(prodId,offerSpecId);
		if(!!spec.offerRoles){
			for (var i = 0; i < spec.offerRoles.length; i++) {
				var offerRole = spec.offerRoles[i];
				for (var j = 0; j < offerRole.roleObjs.length; j++) {
					var roleObj = offerRole.roleObjs[j];
					if(roleObj.prodSpecParams !=undefined && roleObj.prodSpecParams.length>0){
						for (var k = 0; k < roleObj.prodSpecParams.length; k++) {
							if(roleObj.prodSpecParams[k].itemSpecId==itemSpecId){
								return roleObj.prodSpecParams[k];
							}
						}
					}
				}
			}
		}
	};
	
	//通过产品id获取产品已开通附属实例列表
	var _getOfferList = function (prodId){
		for ( var i = 0; i < AttachOffer.openedList.length; i++) {
			var opened = AttachOffer.openedList[i];
			if(opened.prodId == prodId){
				return opened.offerList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//获取销售品实例构成
	var _getOffer = function(prodId,offerId){
		var offerList = _getOfferList(prodId);
		if(ec.util.isArray(offerList)){
			for ( var i = 0; i < offerList.length; i++) {
				if(offerList[i].offerId==offerId){
					return offerList[i];
				}
			}
		}
	};
	
	//根据规格ID获取销售品实例构成
	var _getOfferBySpecId = function(prodId,offerSpecId){
		var offerList = _getOfferList(prodId);
		if(ec.util.isArray(offerList)){
			for ( var i = 0; i < offerList.length; i++) {
				if(offerList[i].offerSpecId==offerSpecId){
					return offerList[i];
				}
			}
		}
	};
	
	//获取某个销售品参数  
	var _getOfferParam = function(prodId,offerId,itemSpecId){
		var offer = _getOffer(prodId,offerId);
		if(ec.util.isArray(offer.offerSpec.offerSpecParams)){
			for ( var i = 0; i < offer.offerSpec.offerSpecParams.length; i++) {
				if(offer.offerSpec.offerSpecParams[i].itemSpecId==itemSpecId){
					return offer.offerSpec.offerSpecParams[i];
				}
			}
		}
		/*if(offer.offerParamInfos!=undefined){
			for ( var i = 0; i < offer.offerParamInfos.length; i++) {
				if(offer.offerParamInfos[i].offerParamId==offerParamId){
					return offer.offerParamInfos[i];
				}
			}
		}*/
	};
	
	//获取某个实例功能产品参数  
	var _getProdInstParam = function(prodId,offerId,itemSpecId){
		var offer = _getOffer(prodId,offerId);
		if(ec.util.isArray(offer.offerMembers)){
			for (var i = 0; i < offer.offerMembers.length; i++) {
				var offerMember = offer.offerMembers[i];
				for (var j = 0; j < offerMember.prodParamInfos.length; j++) {
					for (var k = 0; k < offerMember.prodParamInfos.length; k++) {
						var prodParam = offerMember.prodParamInfos[k];
						if(prodParam.itemSpecId==itemSpecId){
							return prodParam;
						}
					}
				}
			}
		}
	};
	
	//通过产品id获取产品已选功能产品规格列表
	var _getServSpecList = function(prodId){
		for ( var i = 0; i < AttachOffer.openServList.length; i++) {
			var open = AttachOffer.openServList[i];
			if(open.prodId == prodId){
				return open.servSpecList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//根据产品id,跟规格ID获取功能产品
	var _getServSpec = function(prodId,servSpecId){
		var servSpecList = _getServSpecList(prodId);
		if(servSpecList != undefined){
			for ( var i = 0; i < servSpecList.length; i++) {
				if(servSpecList[i].servSpecId==servSpecId){
					return servSpecList[i];
				}
			}
		}
	};
	
	//获取某个功能产品一个参数  
	var _getServSpecParam = function(prodId,servSpecId,itemSpecId){
		var servSpec = _getServSpec(prodId,servSpecId);
		if(ec.util.isArray(servSpec.prodSpecParams)){
			for (var i = 0; i < servSpec.prodSpecParams.length; i++) {
				if(servSpec.prodSpecParams[i].itemSpecId==itemSpecId){
					return servSpec.prodSpecParams[i];
				}
			}
		}
	};
	
	//通过产品id获取产品已选功能产品实例列表
	var _getServList = function(prodId){
		for ( var i = 0; i < AttachOffer.openedServList.length; i++) {
			var opened = AttachOffer.openedServList[i];
			if(opened.prodId == prodId){
				return opened.servList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//通过功能产品id获取功能产品
	var _getServ = function(prodId,servId){
		var servList = _getServList(prodId);
		if(ec.util.isArray(servList)){
			for ( var i = 0; i < servList.length; i++) {
				if(servList[i].servId==servId){
					return servList[i];
				}
			}
		}
	};
	
	//通过功能产品id获取功能产品
	var _getServBySpecId = function(prodId,servSpecId){
		var servList = _getServList(prodId);
		if(ec.util.isArray(servList)){
			for ( var i = 0; i < servList.length; i++) {
				if(servList[i].servSpecId==servSpecId){
					return servList[i];
				}
			}
		}
	};
	
	//获取某个实例功能产品参数  
	var _getServInstParam = function(prodId,servId,itemSpecId){
		var serv = _getServ(prodId,servId);
		if(ec.util.isArray(serv.prodSpecParams)){
			for ( var i = 0; i < serv.prodSpecParams.length; i++) {
				var servParam = serv.prodSpecParams[i];
				if(servParam.itemSpecId==itemSpecId){
					return servParam;
				}
			}
		}
		/*if(ec.util.isArray(serv.prodInstParams)){
			for ( var i = 0; i < serv.prodInstParams.length; i++) {
				var servParam = serv.prodInstParams[i];
				if(servParam.itemSpecId==itemSpecId){
					return servParam;
				}
			}
		}*/
	};
	
	//获取增值业务列表
	var _getOpenAppList = function(prodId){
		for ( var i = 0; i < AttachOffer.openAppList.length; i++) {
			var open = AttachOffer.openAppList[i];
			if(open.prodId == prodId){
				return open.appList;
			} 
		}
		return []; //如果没值返回空数组
	};
	
	//根据产品id获取销售品成员
	var _getOfferMember = function(prodId){
		if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //销售品实例构成
			for ( var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				if(offerMember.objInstId==prodId){
					return offerMember;
				}
			}
		}
		return {};
	};
	
	//根据产品id获取销售品成员
	var _getOldOfferMember = function(prodId){
		for(var j=0;j<OrderInfo.oldoffer.length;j++){
			for ( var i = 0; i < OrderInfo.oldoffer[j].offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.oldoffer[j].offerMemberInfos[i];
				if(offerMember.objInstId==prodId){
					return offerMember;
				}
			}
		}
		return {};
	};
	
	//获取功能产品互斥依赖参数
	var _getExcDepServParam = function(prodId,servSpecId){
		//互斥依赖入参
		var param = { 
			servSpecId:servSpecId,
			prodId:prodId,
			orderedServSpecIds : [] //销售品互斥依赖查询入场数组
		};
		//遍历已选功能产品
		var servSpecList = CacheData.getServSpecList(prodId);
		if(ec.util.isArray(servSpecList)){
			$.each(servSpecList,function(){ //遍历已选择功能产品
				if(this.servSpecId!=servSpecId && this.isdel!="Y" && this.isdel!="C"){
					param.orderedServSpecIds.push(this.servSpecId);
				}
			});
		}
		//遍历已选功能产品
		var servList = CacheData.getServList(prodId);
		if(ec.util.isArray(servList)){
			$.each(servList,function(){ //遍历已选择功能产品
				if(this.servSpecId!=servSpecId && this.isdel!="Y" && this.isdel!="C"){
					param.orderedServSpecIds.push(this.servSpecId);
				}
			});
		}
		return param;
	};
	
	//获取可选包互斥依赖参数
	var _getExcDepOfferParam = function(prodId,offerSpecId){
		//互斥依赖入参
		var param = {
			prodId : prodId,
			offerSpecId : offerSpecId,
			objType : CONST.OBJ_TYPE.PROD,
			orderedOfferSpecIds : [] //可选包互斥依赖查询入场数组
		};
//		if(OrderInfo.actionFlag == 2){ //套餐变更		
//			$.each(OrderInfo.offerSpec.offerRoles,function(){
//				if(ec.util.isArray(this.prodInsts)){
//					$.each(this.prodInsts,function(){
//						if(this.prodInstId==prodId){
//							param.objId=this.objId;
//							return false;
//						}
//					});
//				}
//			});
//		}else if(OrderInfo.actionFlag == 3){  //可选包
//			param.objId=order.prodModify.choosedProdInfo.productId;
//		}else { //新装
//			var prodInst = OrderInfo.getProdInst(prodId);
//			if(prodInst){
//				param.objId=prodInst.objId;
//			}
//		}
		var offerSpec=CacheData.getOfferSpec(prodId,offerSpecId);
		if(ec.util.isObj(offerSpec)){
			if(ec.util.isArray(offerSpec.offerRoles)){
				$.each(offerSpec.offerRoles,function(){
					if(ec.util.isArray(this.roleObjs)){
						$.each(this.roleObjs,function(){
							if(this.objType==CONST.OBJ_TYPE.PROD){
								param.offerRoleId = this.offerRoleId;
								param.objId=this.objId;
								return false;
							}
						});
					}
				});
			}
		}else{
			var offer=CacheData.getOfferBySpecId(prodId,offerSpecId);
			if(ec.util.isObj(offer)){
				param.offerRoleId = offer.offerRoleId;
				if(ec.util.isArray(offer.offerMemberInfos)){
					$.each(offer.offerMemberInfos,function(){
						if(this.objType==CONST.OBJ_TYPE.PROD){
							param.objId=this.objId;
							return false;
						}
					});
				}
			}
		}
		//已开通销售品列表(和后台约定，前台不传已订购的附属销售品，防止影响续约的)
//		var offerList = CacheData.getOfferList(prodId); 
//		if(ec.util.isArray(offerList)){
//			$.each(offerList,function(){
//				if(this.offerSpecId!=offerSpecId && this.isdel!="Y"  && this.isdel!="N"){
//					if(this.offerSpecId!=undefined){
//						param.orderedOfferSpecIds.push(this.offerSpecId);
//					}
//				}
//			});
//		}
		//已选销售品列表
		var offerSpecList = CacheData.getOfferSpecList(prodId); 
		if(ec.util.isArray(offerSpecList)){
			$.each(offerSpecList,function(){
				if(this.offerSpecId!=offerSpecId && this.isdel!="Y"){
					if(this.offerSpecId!=undefined){
						param.orderedOfferSpecIds.push(this.offerSpecId);
					}
				}
			});
		}
		return param;
	};
	
	//二次业务把必须功能产品改成不能删除
	var _parseServ = function(data,objInstId){
		if(ec.util.isObj(data)){
			if(ec.util.isArray(data.result.servSpec)){
				if(ec.util.isObj(objInstId)){
					prodId=objInstId;
				}
				for (var i = 0; i < data.result.servSpec.length; i++) {
					var servSpec = data.result.servSpec[i];
					var serv = CacheData.getServBySpecId(prodId,servSpec.servSpecId); //已开通里面查找
					var newSpec = CacheData.getServSpec(prodId,servSpec.servSpecId); //已选里面查找
					if(servSpec.ifDault==0 || servSpec.ifCanCancelDoublePackage=="N"){
						if(ec.util.isObj(serv)){
							var $dd = $("#del_"+prodId+"_"+serv.servId);
							if(ec.util.isObj($dd)){
								$dd.removeClass("delete").addClass("mustchoose");
								$dd.removeAttr("onclick");
								serv.isdel = "N";
							}
						}	
						else if(ec.util.isObj(newSpec)){
							var $dd = $("#del_"+prodId+"_"+newSpec.servSpecId);
							if(ec.util.isObj($dd)){
								$dd.removeClass("delete").addClass("mustchoose");
								$dd.removeAttr("onclick");
								newSpec.isdel = "N";
							}
						}else {
							if(OrderInfo.actionFlag==2){//套餐变更
								servSpec.isdel = "C";
								CacheData.setServSpec(prodId,servSpec);
								AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams);
								//AttachOffer.checkServExcludeDepend(prodId,servSpec);
							}
						}
					}else if((OrderInfo.actionFlag==2||OrderInfo.actionFlag==21 ||OrderInfo.actionFlag==22 )&&servSpec.ifDault==1){//套餐变更需要展示默认的功能产品
						if(ec.util.isObj(serv)){
							var $dd = $("#del_"+prodId+"_"+serv.servId);
							if(ec.util.isObj($dd)){
								serv.isdel = "N";
							}
						}	
						else if(ec.util.isObj(newSpec)){
							var $dd = $("#del_"+prodId+"_"+newSpec.servSpecId);
							if(ec.util.isObj($dd)){
								newSpec.isdel = "N";
							}
						}else {
							servSpec.isdel = "C";
							CacheData.setServSpec(prodId,servSpec);
							AttachOffer.addOpenServList(prodId,servSpec.servSpecId,servSpec.servSpecName,servSpec.ifParams);
							//AttachOffer.checkServExcludeDepend(prodId,servSpec);
						}
					}
				}
			}
		}
	};
	
	//二次业务把必须可选包改成不能删除
	var _parseOffer = function(data,objInstId){
		if(ec.util.isObj(data)){
			if(ec.util.isArray(data.result.offerSpec)){
				if(ec.util.isObj(objInstId)){
					prodId=objInstId;
				}
				for (var i = 0; i < data.result.offerSpec.length; i++) {
					var offerSpec = data.result.offerSpec[i];
					if(offerSpec.ifDault==0 || offerSpec.ifCanCancelDoublePackage=="N"){
						var offer = CacheData.getOfferBySpecId(prodId,offerSpec.offerSpecId); //已开通里面查找
						if(ec.util.isObj(offer)){
							var $dd = $("#del_"+prodId+"_"+offer.offerId);
							if(ec.util.isObj($dd)){
								$dd.removeClass("delete").addClass("mustchoose");
								$dd.removeAttr("onclick");
								offer.isdel = "N";
							}
							continue;
						}	
						var newSpec = CacheData.getOfferSpec(prodId,offerSpec.offerSpecId); //已开通里面查找
						if(ec.util.isObj(newSpec)){
							var $dd = $("#del_"+prodId+"_"+newSpec.offerSpecId);
							if(ec.util.isObj($dd)){
								$dd.removeClass("delete").addClass("mustchoose");
								$dd.removeAttr("onclick");
								newSpec.isdel = "N";
							}
						}else {
							if(OrderInfo.actionFlag==2||OrderInfo.actionFlag==21 ||OrderInfo.actionFlag==22){
								offerSpec.isdel = "C";
								CacheData.setOfferSpec(prodId,offerSpec);
								var param = CacheData.getExcDepOfferParam(prodId,offerSpec.offerSpecId);
								AttachOffer.addOpenList(prodId,offerSpec.offerSpecId); 
								if(param.orderedOfferSpecIds.length > 0 ){
									var dataExcludeDepend = query.offer.queryExcludeDepend(param);//查询规则校验
									if(dataExcludeDepend!=undefined && dataExcludeDepend.result!=undefined){
										var excludes = dataExcludeDepend.result.offerSpec.exclude;
										if(ec.util.isArray(excludes)){ //有互斥
											//删除已开通
											for (var i = 0; i < excludes.length; i++) {
												var excludeSpecId = excludes[i];
												var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
												if(offer!=undefined){
													var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
													$span.addClass("del");
													offer.isdel = "Y";
													var $dd = $("#del_"+prodId+"_"+offer.offerId);
													if(ec.util.isObj($dd)){
														$dd.removeClass("delete").addClass("mustchoose");
														$dd.removeAttr("onclick");
													}
												}
											}
										}
									}
								}
							}
						}
					}
					else if(OrderInfo.actionFlag==22){
						offerSpec.isdel = "C";
						CacheData.setOfferSpec(prodId,offerSpec);
						AttachOffer.addOpenList(prodId,offerSpec.offerSpecId);
					}
				}
			}
		}
	};
	
	//获取产品对应的角色
	var _getOfferRoleId = function(prodId){
		var offerRoleId = "";
		if(prodId>0){ //二次业务
			if(OrderInfo.offer.offerMemberInfos!=undefined){
				$.each(OrderInfo.offer.offerMemberInfos,function(i){
					if(this.objInstId == prodId){
						offerRoleId = this.offerRoleId;  //角色ID
						return false;
					}
				});
			}
		}else if(prodId<0){ //新装
			if(OrderInfo.offerSpec.offerRoles!=undefined){
				$.each(OrderInfo.offerSpec.offerRoles,function(i){
					var roleId = this.offerRoleId;  //角色ID
					if(this.prodInsts!=undefined){
						$.each(this.prodInsts,function(){
							if(this.prodInstId == prodId){
								offerRoleId = roleId;
								return false;
							}
						});
					}
				});
			}
		}
		return offerRoleId;
	};
	
	//重新排列offerMemberInfos 把按顺序把主卡角色提前
	var _sortOffer = function(data){
		var tmpOfferMemberInfos = [];
		for ( var i = 0; i < data.offerMemberInfos.length; i++) {
			var offerMember = data.offerMemberInfos[i];
			if(offerMember.roleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){ //主卡
				tmpOfferMemberInfos.push(offerMember);
			}
		}
		for ( var i = 0; i < data.offerMemberInfos.length; i++) {
			var offerMember = data.offerMemberInfos[i];
			if(offerMember.roleCd!=CONST.MEMBER_ROLE_CD.MAIN_CARD){
				tmpOfferMemberInfos.push(offerMember);
			}
		}
		data.offerMemberInfos = tmpOfferMemberInfos;
	};
	//通过产品id,跟销售品规格id获取销售品构成
	var _getFavoriteSpec = function(prodId,offerSpecId){
		var favoriteList = _getMyfavoriteSpecList(prodId);
		if(favoriteList!=undefined){
			for ( var i = 0; i < favoriteList.length; i++) {
				if(favoriteList[i].offerSpecId==offerSpecId){
					return favoriteList[i];
				}
			}
		}
	};
	/**
	 * 根据证件id判断是否是政企客户
	 * @param certTypeId 证件id
	 * @returns {*} 布尔值
	 * @private
	 */
	var _isGov = function (certTypeId) {
		return "-1"!=$.inArray(certTypeId, _getGovCertType());
	};
	// 获取政企客户证件类型
	var govCertTyteArr = [];
	var _getGovCertType = function() {
		if (govCertTyteArr.length == 0) {
			var params = {"partyTypeCd": 2} ;
			var url=contextPath+"/token/pc/cust/queryCertType";
			var response = $.callServiceAsJson(url, params, {});
			if (response.code == -2) {
				$.alertM(response.data);
			}
			if (response.code == 1002) {
				$.alert("错误","根据员工类型查询员工证件类型无数据,请配置","information");
				return;
			}
			if(response.code==0){
				var data = response.data ;
				if(data!=undefined && data.length>0){
					for (var i=0; i<data.length; i++) {
						govCertTyteArr[i] = data[i].certTypeCd;
					}
				}
			}
		}
		return govCertTyteArr;
	};
	
	//获取浏览器类型和版本
	var _getBrowserTypeVersion =function(){
		var userAgentStr = window.navigator.userAgent.toLowerCase();
		//ie
		if (userAgentStr.indexOf("msie") >= 0) {
			var ver = userAgentStr.match(/msie ([\d.]+)/)[1];
			return "IE:" + ver;
		}
		//firefox
		else if (userAgentStr.indexOf("firefox") >= 0) {
			var ver = userAgentStr.match(/firefox\/([\d.]+)/)[1];
			return "Firefox:" + ver;
		}
		//Chrome
		else if (userAgentStr.indexOf("chrome") >= 0) {
			var ver = userAgentStr.match(/chrome\/([\d.]+)/)[1];
			return "Chrome:" + ver;
		}
		//Opera
		else if (userAgentStr.indexOf("opera") >= 0) {
			var ver = userAgentStr.match(/opera.([\d.]+)/)[1];
			return "Opera:" + ver;
		}
		//Safari
		else if (userAgentStr.indexOf("Safari") >= 0) {
			var ver = userAgentStr.match(/version\/([\d.]+)/)[1];
			return "Safari:" + ver;
		}
		//Other
		else {
			return "Other";
		}
	};
    //证件类型校验规则
    var checkRules = null;
    var _getCheckRules = function () {
        if (!ec.util.isObj(checkRules)) {
            checkRules = query.common.queryPropertiesObject("CHECK_RULES");
        }
        return checkRules;
    };
    /**
     * 根据证件类型id获取对应的证件校验规则
     * @param typeCd 证件类型id
     * @param key 规则对象中的key 如果key不传，返回整条规则对象，否则返回指定的key所对应的值。
     * @returns {*} 规则对象或规则对象下的key值
     */
    var _getCheckRuleByKey = function (typeCd,key) {
        var rules = _getCheckRules();
        var rule;
        for(var i in rules){
            if(rules[i].certTypeCd==typeCd){
                rule= rules[i];
            }
        }
        if(ec.util.isObj(rule)&&ec.util.isObj(key)){
            return rule[key];
        }else{
            return rule;
        }
    };
    /**
     * 判断指定的证件类型是否在校验规则列表中
     * @param typeCd 证件类型id
     * @returns {boolean} 是否存在
     */
    var _isInCheckRuleByTypeCd = function (typeCd) {
        var isExist = false;
        var rules = _getCheckRules();
        for(var i in rules) {
            if(rules[i].certTypeCd==typeCd) {
                isExist = true;
            }
        }
        return isExist;
    };
	
	return {
		setParam				: _setParam,
		setServParam			: _setServParam,
		setOfferSpec			: _setOfferSpec,
		setServSpec				: _setServSpec,
		setServ2OfferSpec		: _setServ2OfferSpec,
		sortOffer				: _sortOffer,
		setOffer2ExcludeOfferSpec	:_setOffer2ExcludeOfferSpec,
		getParamContent			: _getParamContent,
		getOfferSpecList		: _getOfferSpecList,
		getOfferSpec			: _getOfferSpec,
		getSpecParam			: _getSpecParam,
		getOfferList			: _getOfferList,
		getOffer				: _getOffer,
		getOfferParam			: _getOfferParam,
		getOfferBySpecId		: _getOfferBySpecId,
		getServList				: _getServList,
		getServ					: _getServ,
		getServBySpecId			: _getServBySpecId,
		getServSpec				: _getServSpec,
		getServSpecList			: _getServSpecList,
		getProdInstParam		: _getProdInstParam,
		getProdSpecParam		: _getProdSpecParam,
		getServInstParam		: _getServInstParam,
		getServSpecParam		: _getServSpecParam,
		getOfferProdStr			: _getOfferProdStr,
		getOpenAppList			: _getOpenAppList,
		getAppContent			: _getAppContent,
		getOfferMember			: _getOfferMember,
		getExcDepServParam		: _getExcDepServParam,
		getExcDepOfferParam		: _getExcDepOfferParam,
		getOfferRoleId 			: _getOfferRoleId,
		parseServ				: _parseServ,
		parseOffer				: _parseOffer,
		getOldOfferMember		: _getOldOfferMember,
		getGovCertType          : _getGovCertType,
		setRecordId:_setRecordId,
		setMyfavoriteSpec:_setMyfavoriteSpec,
		getMyfavoriteSpecList:_getMyfavoriteSpecList,
		getFavoriteSpec:_getFavoriteSpec,
		getBrowserTypeVersion:_getBrowserTypeVersion,
        getCheckRules			: _getCheckRules,
        getCheckRuleByKey		: _getCheckRuleByKey,
        isInCheckRuleByTypeCd   :_isInCheckRuleByTypeCd,
        isGov                   :_isGov
	};
})();
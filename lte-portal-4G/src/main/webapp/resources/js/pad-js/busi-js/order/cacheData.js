/**
 * 对缓存数据操作
 * 
 * @author wukf
 * date 2014-01-15
 */
CommonUtils.regNamespace("CacheData");

/** 缓存数据对象*/
CacheData = (function() {
	//设置鉴权日志id
	var _setRecordId = function (id) {
		recordId = id;
	};
	//把销售品规格保存到开通列表里面
	var _setOfferSpec = function(prodId,offerSpec){
		offerSpec.isdel="C";
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
	
	//获取参数内容
	var _getParamContent = function(prodId,spec,flag){
		var content = '<form id="paramForm">' ;
		if(flag==2){  //功能产品规格参数
			if(ec.util.isArray(spec.prodSpecParams)){ //拼接功能产品规格参数
				for (var i = 0; i < spec.prodSpecParams.length; i++) { 
					var param = spec.prodSpecParams[i];
					if(param.value==undefined){
						param.value = "";
					}
					content += _getStrByParam(prodId,param,param.itemSpecId,param.value);
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
					content += _getStrByParam(prodId,param,param.itemSpecId,param.value);
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
						content += _getStrByParam(prodId,this,this.itemSpecId,this.value);
					});
				}
			}
		}else {  //销售品规格参数
			if(ec.util.isArray(spec.offerSpecParams)){
				var offerSpecParams = spec.offerSpecParams;
				$.each(offerSpecParams,function(){
					content += _getStrByParam(prodId,this,this.itemSpecId,this.value);
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
		content +='</form>' ;
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
	var _getStrByParam = function(prodId,param){
		var itemSpecId = param.itemSpecId;
		if(param.setValue==undefined){  //没有设置过参数
			param.setValue = param.value; //赋值成默认值
		}
		var paramVal = param.setValue;
		var selectStr = ""; //返回字符串
		if(ec.util.isArray(param.valueRange)){ //下拉框
			var optionStr = "";
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
						+'" class="inputWidth183px" type="text" disabled="disabled" value="'+paramVal+'" ><br>';
					}else {
						if(param.rule.isOptional=="N") { //必填
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="text" mask="'+param.rule.mask+'" maskmsg="'+param.rule.maskMsg+'" value="'+paramVal+'" ><label class="f_red">*</label><br>'; 
						}else{
							selectStr += param.name + ' : <input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" type="text" mask="'+param.rule.mask+'" maskmsg="'+param.rule.maskMsg+'" value="'+paramVal+'" ><br>'; 
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
						if(this.minQty==0 && this.maxQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked">'+this.objName+'<br>'; 
						}else if(this.minQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'"  type="checkbox" checked="checked" disabled="disabled">'+this.objName+'<br>';
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
							if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CLOSE){
								str += '<input id="check_'+prodId+'_'+servId+'" type="checkbox" checked="checked" disabled="disabled">'+this.objName+'<br>'; 
							}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE){
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
						if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CLOSE){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked" disabled="disabled">'+this.objName+'<br>'; 
						}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE){
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
			orderedOfferSpecIds : [] //可选包互斥依赖查询入场数组
		};
		//已开通销售品列表
		var offerList = CacheData.getOfferList(prodId); 
		if(ec.util.isArray(offerList)){
			$.each(offerList,function(){
				if(this.offerSpecId!=offerSpecId && this.isdel!="Y"  && this.isdel!="N"){
					if(this.offerSpecId!=undefined){
						param.orderedOfferSpecIds.push(this.offerSpecId);
					}
				}
			});
		}
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
					if(servSpec.ifDault==0){
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
					}else if((OrderInfo.actionFlag==2||OrderInfo.actionFlag==21)&&servSpec.ifDault==1){//套餐变更需要展示默认的功能产品
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
	var _parseOffer = function(data){
		if(ec.util.isObj(data)){
			if(ec.util.isArray(data.result.offerSpec)){
				for (var i = 0; i < data.result.offerSpec.length; i++) {
					var offerSpec = data.result.offerSpec[i];
					if(offerSpec.ifDault==0){
						var offer = CacheData.getOfferBySpecId(prodId,offerSpec.offerSpecId); //已开通里面查找
						if(ec.util.isObj(offer)){
							var $dd = $("#del_"+prodId+"_"+offerSpec.offerId);
							if(ec.util.isObj($dd)){
								$dd.removeClass("delete").addClass("mustchoose");
								$dd.removeAttr("onclick");
								offer.isdel = "N";
							}
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
							if(OrderInfo.actionFlag==2 || OrderInfo.actionFlag==6){
								offerSpec.isdel = "C";
								CacheData.setOfferSpec(prodId,offerSpec);
								var param = CacheData.getExcDepOfferParam(prodId,offerSpec.offerSpecId);
								AttachOffer.addOpenList(prodId,offerSpec.offerSpecId); 
								if(param.orderedOfferSpecIds.length > 0 ){
									var data = query.offer.queryExcludeDepend(param);//查询规则校验
									if(data!=undefined && data.result!=undefined){
										var excludes = data.result.offerSpec.exclude;
										if(ec.util.isArray(excludes)){ //有互斥
											//删除已开通
											for (var i = 0; i < excludes.length; i++) {
												var excludeSpecId = excludes[i];
												var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
												if(offer!=undefined){
													var $div = $("#li_span_"+prodId+"_"+offerId).parent();
													//var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
													$div.addClass("deldiv");
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
				}
			}
		}
	};
	var _parseOffer = function(data,prodId){
		if(ec.util.isObj(data)){
			if(ec.util.isArray(data.result.offerSpec)){
				for (var i = 0; i < data.result.offerSpec.length; i++) {
					var offerSpec = data.result.offerSpec[i];
					if(offerSpec.ifDault==0){
						var offer = CacheData.getOfferBySpecId(prodId,offerSpec.offerSpecId); //已开通里面查找
						if(ec.util.isObj(offer)){
							var $dd = $("#del_"+prodId+"_"+offerSpec.offerId);
							if(ec.util.isObj($dd)){
								$dd.removeClass("deldiv").addClass("mustchoose");
								$dd.removeAttr("onclick");
								offer.isdel = "N";
							}
						}	
						var newSpec = CacheData.getOfferSpec(prodId,offerSpec.offerSpecId); //已开通里面查找
						if(ec.util.isObj(newSpec)){
							var $dd = $("#del_"+prodId+"_"+newSpec.offerSpecId);
							if(ec.util.isObj($dd)){
								$dd.removeClass("deldiv").addClass("mustchoose");
								$dd.removeAttr("onclick");
								newSpec.isdel = "N";
							}
						}else {
							if(OrderInfo.actionFlag==2 || OrderInfo.actionFlag==6){
								offerSpec.isdel = "C";
								CacheData.setOfferSpec(prodId,offerSpec);
								var param = CacheData.getExcDepOfferParam(prodId,offerSpec.offerSpecId);
								AttachOffer.addOpenList(prodId,offerSpec.offerSpecId); 
								if(param.orderedOfferSpecIds.length > 0 ){
									var ruleData = query.offer.queryExcludeDepend(param);//查询规则校验
									if(ruleData!=undefined && ruleData.result!=undefined){
										var excludes = ruleData.result.offerSpec.exclude;
										if(ec.util.isArray(excludes)){ //有互斥
											//删除已开通
											for (var i = 0; i < excludes.length; i++) {
												var excludeSpecId = excludes[i];
												var offer = CacheData.getOfferBySpecId(prodId,excludeSpecId);
												if(offer!=undefined){
													var $div = $("#li_span_"+prodId+"_"+offerId).parent();
													//var $span = $("#li_"+prodId+"_"+offer.offerId).find("span");
													$div.addClass("deldiv");
													offer.isdel = "Y";
													var $dd = $("#del_"+prodId+"_"+offer.offerId);
													if(ec.util.isObj($dd)){
														$dd.removeClass("deldiv").addClass("mustchoose");
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
	
	//把选中的销售品保存到依赖或互斥的销售品规格中
	var _setOffer2ExcludeOfferSpec = function(param){
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
		if(param.optDependOffer.length > 0){
			var optDependOffers = param.optDependOffer;
			for (var i = 0; i < optDependOffers.length; i++) {
				if($("#"+optDependOffers[i]+"").attr("checked") == "checked"){
					AttachOffer.addOpenList(prodId,optDependOffers[i]);
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
			var url=contextPath+"/cust/queryCertType";
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
	return {
		setParam				: _setParam,
		setServParam			: _setServParam,
		setOfferSpec			: _setOfferSpec,
		setServSpec				: _setServSpec,
		setServ2OfferSpec		: _setServ2OfferSpec,
		sortOffer				: _sortOffer,
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
		setOffer2ExcludeOfferSpec : _setOffer2ExcludeOfferSpec,
		setRecordId:_setRecordId,
		isGov                   :_isGov
	};
})();
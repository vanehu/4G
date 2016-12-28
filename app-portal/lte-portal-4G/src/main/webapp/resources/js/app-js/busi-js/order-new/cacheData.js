/**
 * js缓存
 * 
 * @author yanghm
 * date 2016 10-27
 */
CommonUtils.regNamespace("CacheData");

/** 缓存数据对象*/
CacheData = (function() {
	
	//促销保存到开通列表里面
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
	
	//通过产品id和销售品规格id获取销售品构成（促销）
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
	//通过产品id和销售品规格id获取销售品实例构成
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
	
	//订购促销时获取关联的功能产品拼接成字符串给予提示
	var _getOfferProdStr = function(prodId,spec,flag){
		var content = '<form id="paramForm">' ;
		var str = "";
		if(flag==0){  //订购可选包
			$.each(spec.offerRoles,function(){
				$.each(this.roleObjs,function(){
					if(this.objType==4){
						if(this.minQty==0 && this.maxQty>0 && this.dfQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>'; 
						}else if(this.minQty>0){
							str += '<input id="check_'+prodId+'_'+this.objId +'"  type="checkbox" checked="checked" disabled="disabled">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>';
						}else if(this.minQty==0 && this.maxQty>0 && this.dfQty==0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>'; 
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
								str += '<input id="check_'+prodId+'_'+servId+'" type="checkbox" checked="checked" disabled="disabled">'+'<label for=check_'+prodId+'_'+this.servId +'>'+ this.objName +'</label><br>'; 
							}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE&&this.minQty<=0){
								str += '<input id="check_'+prodId+'_'+servId+'" type="checkbox" checked="checked">'+'<label for=check_'+prodId+'_'+this.servId +'>'+ this.objName +'</label><br>';
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
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked" disabled="disabled">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>'; 
						}else if(this.unssProcessMode==CONST.UNSS_PROCESS_MODE.CHOOSE&&this.minQty<=0){
							str += '<input id="check_'+prodId+'_'+this.objId +'" type="checkbox" checked="checked">'+'<label for=check_'+prodId+'_'+this.objId +'>'+ this.objName +'</label><br>';
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
	
	
	//把选中的促销保存到销售品规格中
	var _setServForOfferSpec = function(prodId,offerSpec){
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
	
	//获取促销互斥依赖的参数
	var _getExcDepOfferParam = function(prodId,offerSpecId){
		//互斥依赖入参
		var param = {
			prodId : prodId,
			offerSpecId : offerSpecId,
			objType : CONST.OBJ_TYPE.PROD,
			orderedOfferSpecIds : [] //可选包互斥依赖查询入场数组
		};
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
		if(param.optDependOffer && param.optDependOffer.length > 0){
			var optDependOffers = param.optDependOffer;
			for (var i = 0; i < optDependOffers.length; i++) {
				if($("#"+optDependOffers[i]).is(':checked') == true){
					AttachOffer.addOpenList(prodId,optDependOffers[i]);
				}
			}
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
		}
		content +='</form>' ;
		return content;
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
	
	//根据参数获取字符串(点参跳出窗口);
	var _getStrByParam = function(prodId,param,specId){
		var itemSpecId = param.itemSpecId;
		if(param.setValue==undefined){  //没有设置过参数
			param.setValue = param.value; //赋值成默认值
		}
		var paramVal = param.setValue;
		var selectStr = ""; //返回字符串
		var optionStr = "";
		if(!!param.valueRange && (itemSpecId == CONST.YZFitemSpecId1||itemSpecId ==  CONST.YZFitemSpecId2 || itemSpecId ==  CONST.YZFitemSpecId3)){ //可编辑下拉框（10020034,10020035,10020036 为翼支付交费助手的三属性）需求（开发） #610119
			var feeType = $("select[name='pay_type_-1']").val();
			if(feeType==undefined) feeType = order.prodModify.choosedProdInfo.feeType;
			if(feeType == CONST.PAY_TYPE.BEFORE_PAY){
				selectStr = selectStr+'<div class="form-group pack-pro-box"><label for="exampleInputPassword1">' + param.name + ': </label>';
				if(param.rule.isConstant=='Y'){ //不可修改
					selectStr =selectStr+ "<select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>"; 
				}else {
					if(param.rule.isOptional=="N") { //必填
						selectStr =selectStr+ " <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" data-validate='validate(required,reg:"
						  + param.rule.maskMsg+"("+param.rule.mask+")) on(blur)'><label class='f_red'>*</label><br>";
					}else{
						selectStr =  selectStr+ "<select class='inputWidth183px' id="+prodId+"_"+itemSpecId+">"; 
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
				selectStr += optionStr + "</select></td></tr>"; 
				return selectStr;
			} else if(feeType == CONST.PAY_TYPE.AFTER_PAY){
				selectStr = selectStr+'<div class="form-group pack-pro-box"><label for="exampleInputPassword1">' + param.name + ': </label>';
				selectStr =selectStr+ "<select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>"; 
				optionStr +='<option value="" selected="selected">不可选</option>';
				selectStr += optionStr + "</select></div>"; 
				return selectStr;
			} 
		}
		if (ec.util.isArray(param.valueRange) && param.dateSourceTypeCd == "17") {//带搜索功能输入组件
			var id=prodId+'_'+itemSpecId;
			if(ec.util.isObj(specId)){
				id=prodId+'_'+specId+'_'+itemSpecId;
			}
			selectStr = selectStr + '<div class="form-group pack-pro-box"><label for="exampleInputPassword1">' + param.name + ': </label>';
			CacheData.setSearchs(param.valueRange);
			if(ec.util.isObj(paramVal)){
				selectStr = selectStr + '<div class="input-group" style="width: 100%;">'
				+'<input id="'+id+'" code="'+paramVal+'" value="'+CacheData.getSearchName(paramVal)+'" placeholder="请输入学校名称" data-validate="validate(required,reg:()) on(blur)" class="inputWidth183px" style="width: 100%;" type="text" />'
				+'<span class="input-group-btn">'
				+'<button class="btn btn-default"  onclick="AttachOffer.searchSchools(\''+id+'\');" type="button">搜索</button></span></div></div>'
			}else{
				selectStr = selectStr  + '<div class="input-group" style="width: 100%;">'
				+ '<input id="'+id+'" placeholder="请输入学校名称" data-validate="validate(required,reg:()) on(blur)" class="inputWidth183px" style="width: 100%;" type="text" />'
				+'<span class="input-group-btn">'
				+'<button class="btn btn-default"  onclick="AttachOffer.searchSchools(\''+id+'\');" type="button">搜索</button></span></div></div>'
			}
		} else if(ec.util.isArray(param.valueRange)){ //下拉框
			var flag=offerChange.queryPortalProperties("AGENT_" + (OrderInfo.staff.soAreaId+"").substring(0,3));
			if (itemSpecId ==  CONST.YZFitemSpecId4 && "ON" != flag) {
				return selectStr;
			}
			selectStr = selectStr+'<div class="form-group pack-pro-box"><label for="exampleInputPassword1">' + param.name + ': </label>';
			if(param.rule.isConstant=='Y'){ //不可修改
				selectStr =selectStr+ "<select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" disabled='disabled'>"; 
			}else {
				if(param.rule.isOptional=="N") { //必填
					selectStr =selectStr+ " <select class='inputWidth183px' id="+prodId+"_"+itemSpecId+" data-validate='validate(required,reg:"
							  + param.rule.maskMsg+"("+param.rule.mask+")) on(blur)'><label class='f_red'>*</label><br>"; 
				}else{
					selectStr =  selectStr+ "<select class='inputWidth183px' id="+prodId+"_"+itemSpecId+">"; 
					optionStr +='<option value="" >请选择</option>';  //不是必填可以不选
				}
			}
			if(itemSpecId == CONST.YZFitemSpecId4){//#658051 账户托收退订特殊权限的需求
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
				selectStr += optionStr + "</select>" + "</div>";
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
			selectStr += optionStr + "</select></div>"; 
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
							selectStr += '<div class="form-group pack-pro-box"><label style="display: block;width: 100%;text-align: left;" for="exampleInputPassword1">'+param.name + ' : </label><input id="'+prodId+'_'+itemSpecId  
							+'" class="inputWidth183px" style="width: 100%;" type="text" data-validate="validate(reg:'+param.rule.maskMsg+'('+param.rule.mask+')) on(blur)" value="'+paramVal+'" ></div>'; 
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
	return {
		setOfferSpec        :_setOfferSpec,
		getOfferSpec        :_getOfferSpec,
		getOfferSpecList    :_getOfferSpecList,
		getOfferBySpecId    :_getOfferBySpecId,
		getOfferList        :_getOfferList,
		getOfferProdStr     :_getOfferProdStr,
		setServForOfferSpec :_setServForOfferSpec,
		getServSpec         :_getServSpec,
		getServList         :_getServList,
		getServSpecList     :_getServSpecList,
		getFavoriteSpec     :_getFavoriteSpec,
		getMyfavoriteSpecList:_getMyfavoriteSpecList,
		setMyfavoriteSpec    :_setMyfavoriteSpec,
		setServSpec          :_setServSpec,
		getExcDepOfferParam  :_getExcDepOfferParam,
		getExcDepServParam   :_getExcDepServParam,
		getServBySpecId      :_getServBySpecId,
		getParamContent      :_getParamContent,
		getServSpecParam     :_getServSpecParam,
		getStrByParam        :_getStrByParam,
		getOfferMember       :_getOfferMember,
		setServ2OfferSpec	 :_setServ2OfferSpec,
		setOffer2ExcludeOfferSpec		:_setOffer2ExcludeOfferSpec,
		setParam			:_setParam
	};
})();
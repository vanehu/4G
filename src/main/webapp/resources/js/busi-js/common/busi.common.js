/**
 * 公共业务逻辑脚本
 * @author liusd
 * @date 2012-09-25
 */
CommonUtils.regNamespace("busi","common");

busi.common = (function(){
	/**
	 * 地区查询公共函数
	 * 页面显示模块需相同的ID
	 * @param {Object} formId 地区选择窗口ID
	 * @param {Object} callBackFunc 回填函数
	 * @memberOf {TypeName} 
	 * @exception {TypeName} 
	 */
	var _queryAllArea=function(){
		_queryArea('',2);
	};
	var _load_area_data=function(response){
		var $areaSelectList;
		var selectHtml="";
		var resJson = response.data;
		var provId = $("#province_list").val();
		if("" == provId){
			if(resJson.length>0){
				$("#province_list").off("change").on("change",function(){_queryArea($("#province_list").val(),3);});
				$areaSelectList=$("#province_list").html("");
				var current_provId=($("#p_current_area").val()).substr(0,3)+"0000";
				for(var i=0;i<resJson.length;i++){
					if(resJson[i].commonRegionId==current_provId){
						selectHtml=selectHtml+"<option  selected='selected' value='" +resJson[i].commonRegionId + "' zone_number='" +resJson[i].zoneNumber +"' name='" +resJson[i].regionName + "'>" + resJson[i].regionName + "</option>";
					}else{
						selectHtml=selectHtml+"<option value='" +resJson[i].commonRegionId + "' zone_number='" +resJson[i].zoneNumber +"' name='" +resJson[i].regionName + "'>" + resJson[i].regionName + "</option>";
					}
				}
				$areaSelectList.html(selectHtml);
				provId= $("#province_list").val();
				if(provId!=""){
					_queryArea($("#province_list").val(),3);
				}
			}
		}else{
			$areaSelectList=$("#city_list").html("");
			if(resJson.length>0){
				var current_areaId=$("#p_current_area").val();
				for(var i=0;i<resJson.length;i++){
					if(resJson[i].commonRegionId==current_areaId){
						selectHtml=selectHtml+"<option  selected='selected' value='" +resJson[i].commonRegionId + "' zone_number='" +resJson[i].zoneNumber +"' name='" +resJson[i].regionName + "'>" + resJson[i].regionName + "</option>";
					}else{
						selectHtml=selectHtml+"<option value='" +resJson[i].commonRegionId + "' zone_number='" +resJson[i].zoneNumber +"' name='" +resJson[i].regionName + "'>" + resJson[i].regionName + "</option>";
					}
				}
				$areaSelectList.html(selectHtml);
				$("#city_list").show();
			}else{
				$("#city_list").hide();
			}
		}
	};
	//查询地区
	var _queryArea = function(provId,areaLevel){		
		var params = {
			'upRegionId': provId,
			'areaLevel': areaLevel
		};
		$.callServiceAsJson(contextPath + "/orderQuery/areaTreeAllChilden", params, {
			"before":function(){
				$.ecOverlay("地区信息加载中，请稍候...");		
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				try {
					if (response.code == 0) {
						if (!response.data) {
							$.alert("提示","没有地区信息返回,请重试。");
						} else {
							_load_area_data(response);							
						}
					} else {
						$.alert("提示","地区信息加载异常，请稍后再试.");
					}
				} catch(e) {
					$.alert("提示","地区信息加载异常，请稍后再试.");
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	/**
	 * 管理地区、渠道查询公共函数
	 * 页面显示模块需相同的ID
	 * @param {Object} rangeType 查询数据范围 "area"地区 "channel"渠道 
	 * @param {Object} formId 地区选择窗口ID
	 * @param {Object} callBackFunc 回填函数
	 * 窗口ec-dialog-form示例：
	 * 	<div style="display:none" id="ec-dialog-form-container(+formId)" class="ec-dialog-form-container">
	 *		<div class="ec-dialog-form-top">
	 *			<h1 class="ec-dialog-form-title"></h1>
	 *		</div>
	 *		<div class="ec-dialog-form-content">
	 *			<div class="ec-dialog-form-loading" style="display:none"></div>
	 *			<div class="ec-dialog-form-message" style="display:none"></div>
	 *			<div class="ec-dialog-form-form" >
	 *				<form id="dialogForm">
	 *					<div id="range_data" class="rangeDiv"></div>
	 *				</form>
	 *			</div>
	 *			<div class="ec-dialog-form-bottom-button">
	 *		    	<input type="button"  id="dialogFormSubmit" class="ec-dialog-form-send ec-dialog-form-button" tabindex="1007" value="确认"/>
	 *		    	<input type="button" class="ec-dialog-form-cancel ec-dialog-form-button simplemodal-close" tabindex="1008"  value="取消"/>
	 *			</div>
	 *		</div>
	 *		<div class="ec-dialog-form-bottom"></div>
	 *	</div>
	 * 回填函数样例：var $input = $("input[name='rdo_range_data']:checked");
	 *	            $("#testDataId").val($input.val());
	 *	            $("#testDataName").val($input.attr("rangename"));
	 *				--如果查询的是地区 则存在areacode
	 *				$("#testAreaCode").val($input.attr("areacode"));
	 * @memberOf {TypeName} 
	 * @exception {TypeName} 
	 */
	var _qryRangeData = function(rangeType,formId,callBackFunc){
		if(typeof callBackFunc =="undefined" && !$.isFunction(callBackFunc)){
 			throw new Error("无效的回调函数");
 		}
		var rangeTitle = "";
		if(rangeType == "area") {
			rangeTitle = "地区";
		}else if(rangeType == "channel") {
			rangeTitle = "渠道";
		}else {
			$.alert("提示","数据异常");
			return;
		}
		var params = {"rangeType":rangeType};
		var paramUrl=contextPath + "/staffMgr/getAuthRange";
		$.callServiceAsJsonGet(paramUrl,params, {
			"before":function(){
				$.ecOverlay(rangeTitle+"信息加载中，请稍候...");		
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				try {
					if (response.code == 0) {
						if (!response.data) {
							$.alert("提示","没有"+rangeTitle+"信息返回,请重试。");
						} else {
							ec.form.dialog.createDialog({
								"id":formId,
								"title":"选择"+rangeTitle,
								"width":630,
								"height":"",
								"initCallBack":function(dialogForm,dialog){
									$("#ec-dialog-form-container"+formId+" .ec-dialog-form-bottom-button").attr("ifshow","false");
									_putDialog(dialogForm,dialog);
									_load_range_data(response,rangeType);
									_bind_range_data(callBackFunc);
								},
								"submitCallBack":function(dialogForm,dialog){
									
								}
							});			
						}
					} else {
						$.alert("提示",rangeTitle+"信息加载异常，请稍后再试.")
					}
				} catch(e) {
					$.alert("提示",rangeTitle+"信息加载异常，请稍后再试.")
				}
			},
			fail:function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	}
	//赋值
	var _dialogForm;
	var _dialog;
	var _putDialog = function(dialogForm,dialog){
		_dialogForm = dialogForm;
		_dialog = dialog;
	}
	//初始化加载当前工号管理地区
	var _load_range_data = function(response,rangeType) {
		var data = response.data;
		var content = "";
		for( var i = 0;i < data.length;i++) {
			var range = data[i];
			content +=
					"<div class='rangeInput'><input type='radio' value='"
							+ range.ID + "' name='rdo_range_data' rangename='"+range.NAME+"' ";
			if(rangeType == "area") {
				content +=  "areacode='"+range.AREA_CODE+"'";
			}
			content += "/>" + range.NAME + "</div>";
		}
		$("#range_data").html(content);
	}
	//使用代理绑定事件
	var _bind_range_data = function(callBackFunc){
		$("#range_data").on("click",function(e){
			var $target = $(e.target);
			$target.find("input[name='rdo_range_data']").attr("checked",true);
			callBackFunc.apply(this);
			_dialogForm.close(_dialog);
		});
	}
	
	/**
	 * 共用主数据查询
	 * @param {Object} attrSpecCode 主数据编码
	 * @memberOf {TypeName} 
	 * @exception {TypeName} 
	 */
	var _queryCTGMainData = function(attrSpecCode){
		param = {
			attrSpecCode:attrSpecCode
		};
		var paramUrl=contextPath + "/staffMgr/getCTGMainData";
		var responsedata = $.callServiceAsJson(paramUrl,param, {});
		if(responsedata.code==0){
			return responsedata.data;
		}else if(responsedata.code==-2){
			$.alertM(responsedata.data);
			return;
		}else{
			$.alert("提示","调用主数据接口失败！");
			return;
		}
	};
	return {
		queryAllArea:_queryAllArea,
		qryRangeData:_qryRangeData,
		queryCTGMainData:_queryCTGMainData
	}
})();

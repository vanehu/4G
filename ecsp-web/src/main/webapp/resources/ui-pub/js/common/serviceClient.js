/**
 * servName,服务名 param.入参 callback回调函数,timeout 请求超时时间设置，默认60秒
 * <p>
 * sample: 
 * var params={"key1":"value1","key2":"value2"}; 
 * $.callServiceAsJson("/cust/login",params,function(response));
 * response 格式如　{code:"编码",msg:"提示信息",result:"返回的结果数据"};
 * <P>
 *  有回调函数则为异步请求，若没有回调函数，则为同步，直接把结果返回
 * <p>
 */

(function($) {
	var default_options = {
		dataType : "json",
		type : "POST",
		contentType :"application/json",
		timeout : 60000 //默认60秒超时
	};
	var defalut_param_options = {
  		callback : null, //回调函数
  		type : "POST",
  		timeout : 60000 //请求超时时限
  	};
	var _callService = function(servName, params, datatype, param_options) {
					if (!(!!servName && !!params)) {
						alert("请求服务或参数必须填写！");
						return;
					}
					var paramOptions = $.extend({}, defalut_param_options, param_options || {});

					var asyncs = true; //默认为异步请求
					if (!$.isFunction(paramOptions.callback)) {
						asyncs = false; //同步请求
					}
					params = JSON.stringify(params);

					var response = {code : "", msg : "", result : ""};
					var req = $.extend({},default_options, {
								async : asyncs,
								url : servName,
								data : params,
								dataType : datatype,
								timeout : paramOptions.timeout,
								type : paramOptions.type
							}, {
							success: function(data, status, xhr) {
								//response.code = xhr.getResponseHeader("respCode");
								//response.msg = decodeURIComponent(xhr.getResponseHeader("respMsg"));
								response.result = data;
								if (asyncs) {
									paramOptions.callback.apply(this, [response]);
								}
							},
							error: function(xhr, textStatus) {
								/*
								if(xhr.status=="500"){
								    var showHtml=xhr.response;
										easyDialog.open({
											container : {
												header : xhr.status,
											    content : showHtml
											  },
											 fixed : true
										});
								}
								*/
								if (!!textStatus) {
									response.code = textStatus;
									response.msg = "请求异常!";
								} else {
									response.code = 404;
									response.msg = "请求异常404!";
								}

								if (asyncs) {
									paramOptions.callback.apply(this, [response]);
								}
							 },
							 beforeSend : function(xhr) {
								  /***
									$.each(headers, function(key, value) {
												xhr.setRequestHeader(key,value);
									});
								  ****/
							 },
							 complete:function(xhr){
								
							 }
						});
					 $.ajax(req);
					 if (!asyncs) {
						 return response;
					}
		};

	$.extend($, {
				callServiceAsJson : function(servName, params, options) {
					return _callService(servName, params, "json", options);
				},
				callServiceAsXml : function(servName, params, options) {
					return _callService(servName, params, "xml", options);
				},
				callServiceAsHtml : function(servName, params, options) {
					return _callService(servName, params, "html", options);
				},
				callServiceAsText : function(servName, params, options) {
					return _callService(servName, params, "text", options);
				}
			});

})(jQuery);

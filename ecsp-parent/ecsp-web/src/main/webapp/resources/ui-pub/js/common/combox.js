/**
 * 下拉框数据生成工具.
 * @author chenhr
 * Version 1.0.0
 * 
 * <p>
 * 例子: $("#orgType").comboBox({url:"type/get"});
 * 参数说明：
 * url：请求的URL，字符串，必填项
 * params：请求的参数，对象，可选项（该项不填时，默认用GET方式，填写将自动改为POST方式）
 * textField：text对应绑定的数据字段，字符串，可选项（默认为"text"）
 * valueField：value对应绑定的数据字段，字符串，可选项（默认为"id"）
 * initText：初始文本，字符串，可选项（默认为"--请选择--"）
 * initValue：初始值，字符串，可选项（默认为"-1"）
 * value：选中项的值，字符串，可选项（默认为"-1"）
 * </p>
 */

(function($) {
	$.fn.comboBox = function(options) {
		var _ajax_options = {
			async: true,
			dataType: "json",
			type: "GET",
			contentType: "application/json",
			timeout: 60000 //默认60秒超时
		};

		var _options = {
			url: "",
			params: {},
			textField: "text",
			valueField: "id",
			initText: "----- 请选择 -----",
			initValue: "-1",
			value: "-1"
		};

		var opts = $.extend({}, _options, options || {});

		return this.each(function() {
			var $this = $(this);
			var htmlStr = '<option value="' + opts.initValue + '">';
			htmlStr += opts.initText + '</option>';
			if (opts.url) {
				var ajaxOpts = {
					url: opts.url
				};
				if (!$.isEmptyObject(opts.params)) {
					var params = JSON.stringify(opts.params);
					$.extend(ajaxOpts, {
						data: params,
						type: "POST"
					});
				}
				
				var req = $.extend({}, _ajax_options, ajaxOpts, {
					success: function(data, status){
						if (data) {
							$.each(data, function(index, item) {
								htmlStr += '<option value="' + item[opts.valueField];
								htmlStr += '">' + item[opts.textField] + "</option>";
							});
							$this.html(htmlStr);
							$this.val(opts.value);
						}
					}
				});
				$.ajax(req);
			}

			$this.html(htmlStr);
		});
	};
})(jQuery);

/**
 * jquery扩展工具方法.
 * 说明：此JS需要引入json2.js和jsonpath.js.
 * @author chenhr
 * Version 1.0.0
 */

(function($) {
	var _callService = function(servName, params, dataType, options) {
		var default_options = {
			dataType: "json",
			type: "POST",
			contentType: "application/json; charset=UTF-8",
			timeout: 60000 //默认60秒超时
		};
		var defalut_param_options = {
  			callback: null, //回调函数
  			type: "POST",
  			timeout: 60000 //请求超时时限
  		};
		if (!(!!servName && !!params)) {
			alert("请求服务或参数必须填写！");
			return;
		}
		var paramOptions = $.extend({}, defalut_param_options, options || {});

		var asyncs = true; //默认为异步请求
		if (!$.isFunction(paramOptions.callback)) {
			asyncs = false; //同步请求
		}
		if (!($.isEmptyObject(params) && paramOptions.type.toUpperCase() === "GET")) {
			params = JSON.stringify(params);
			$.extend(default_options, {data: params});
		}

		var response = {code: null, result: null};
		var req = $.extend({}, default_options, {
			async: asyncs,
			url: servName,
			dataType: dataType,
			timeout: paramOptions.timeout,
			type: paramOptions.type
		}, {
			success: function(data, status, xhr) {
				response.code = status;
				response.result = data;
				if (typeof data.successed !== "undefined" || (data.successed !== null)) {
					if (data.code == 302) {
						top.location = top.contextPath;
						return;
					}
					if ((data.code == 401) || (data.code == 500)) {
						self.location = response.result.data;
						return;
					}
				}

				if (asyncs) {
					paramOptions.callback.apply(this, [response]);
				}
			},
			error: function(xhr, textStatus) {
				if (!!textStatus) {
					response.code = textStatus;
				} else {
					response.code = 404;
				}

				if (asyncs) {
					paramOptions.callback.apply(this, [response]);
				}
			}
		});
		$.ajax(req);
		if (!asyncs) {
			return response;
		}
	};

	$.extend($, {
		callServiceAsJson: function(servName, params, options) {
			return _callService(servName, params, "json", options);
		},
		callServiceAsXml: function(servName, params, options) {
			return _callService(servName, params, "xml", options);
		},
		callServiceAsHtml: function(servName, params, options) {
			return _callService(servName, params, "html", options);
		},
		callServiceAsText: function(servName, params, options) {
			return _callService(servName, params, "text", options);
		}
	});

	/**
	 * 下拉框组件.
	 * 例子: $("#orgType").comboBox({url:"type/get"});
 	 * 参数说明：
 	 * url：请求的URL，字符串，必填项
 	 * params：请求的参数，对象，可选项（该项不填时，默认用GET方式，填写将自动改为POST方式）
	 * textField：text对应绑定的数据字段，字符串，可选项（默认为"text"）
 	 * valueField：value对应绑定的数据字段，字符串，可选项（默认为"id"）
 	 * initText：初始文本，字符串，可选项（默认为"--请选择--"）
 	 * initValue：初始值，字符串，可选项（默认为"-1"）
 	 * value：选中项的值，字符串，可选项（默认为"-1"）
	 * @param {Object} options
	 */
	$.fn.comboBox = function(options) {
		var _ajax_options = {
			type: "GET"
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

		if (!$.isEmptyObject(opts.params)) {
			$.extend(_ajax_options, {type: "POST"});
		}

		return this.each(function() {
			var $this = $(this);
			var htmlStr = '<option value="' + opts.initValue + '">';
			htmlStr += opts.initText + '</option>';

			if (opts.url) {
				$.callServiceAsJson(opts.url, opts.params, {
					type: _ajax_options.type,
					callback: function(response) {
						if (response.result.successed) {
							var data = response.result.data;
							if (data) {
								$.each(data, function(index, item) {
									if ($.trim(item[opts.valueField]) !== "") {
										htmlStr += '<option value="' + item[opts.valueField];
										htmlStr += '">' + item[opts.textField] + "</option>";
									}
								});
								$this.html(htmlStr);
								$this.val(opts.value);
							}
						}
					}
				});
			}

			$this.html(htmlStr);
		});
	};

	/**
	 * 上下文路径.
	 * 示例：
	 * 无参数 $('#guidePath').guidePath();
	 * 有参数 $('#guidePath').guidePath({moduleUri:'/org/manage'});
	 * 有参数时只有moduleUri一个参数.
	 */
	$.fn.guidePath = function() {
		var contextPath = top.contextPath;
		var options = arguments.length > 0 ? arguments[0] : {};
		var _options = $.extend({}, options || {});
		var response = $.callServiceAsJson(contextPath + "/guideInfo/get", _options, {});
		return this.each(function() {
			if (response.result.successed) {
				var data = response.result.data;
				if (data.length > 0) {
					var html = '';
					$.each(data, function(i, row) {
						if (i === 0) {
							html += '<span style="color:#727272">当前位置：' + row + '</span>&gt;';
						} else {
							if (i != (data.length - 1)) {
								html += '<span style="color:#727272">' + row + '</span>&gt;';
							} else {
								html += '<span>' + row + '</span>';
							}
						}
					});
					$(this).append(html);
				}
			}
		});
	};

	/**
	 * 提示框组件.
	 */
	$.fn.hideTip = function() {
		return this.each(function() {
			var objId = $(this).attr("id") + "Tip";
			$("#" + objId).remove();
		});
	};
	/**
	 * 用法：$(选择器).tip()或$(选择器).tip({content:提示内容,width:宽度})
	 * 说明：属性content和width为可选项，可不填写或选择填写
	 * @param {Object} options 可选项
	 */
	$.fn.tip = function(options) {
		var _options = {
			content: '必填项'
		};
		var tipDiv = '<div class="tips" style="display: none; z-index: 1;">';
		tipDiv += '<div class="l-verify-tip">';
		tipDiv += '<div class="l-verify-tip-corner"></div>';
		tipDiv += '<div class="l-verify-tip-content"></div>';
		tipDiv += '</div></div>';

		var _opt = $.extend({}, _options, options || {});

		return this.each(function() {
			var tip = null;
			var objId = $(this).attr("id") + "Tip";
			var tips = $(".tips");
			if (tips.length) {
				tips.each(function() {
					if ($(this).attr("id") === objId) {
						tip = $(this);
						return false;
					}
				});
			}
			if (tip === null) {
				tip = $(tipDiv);
				var px = $(this).offset().left + $(this).width();
				var py = $(this).offset().top;
				tip.css({left: px, top: py}).attr("id", objId).appendTo("body");
			}
			if (_opt.width) {
				$(".l-verify-tip:first", tip).width(_opt.width);
			} else {
				if (_opt.content === _options.content) {
					$(".l-verify-tip:first", tip).width(95);
				}
			}
			$(".l-verify-tip-content:first", tip).text(_opt.content);
			tip.show();
		});
	};

	/**
	 * 
	 * @param {Object} options
	 */
	$.fn.tab = function(options) {
		var _options = {
			//默认首个TAB项选中
			selectedTab: 1,
			onSelectTabItem: null
		};
		var _opt = $.extend({}, _options, options || {});
		var selectedIndex = _opt.selectedTab - 1;
		return this.each(function() {
			var tabLinks = $('<div class="l-tab-links"><ul></ul></div>');
			$(this).wrapInner('<div class="l-tab-content">').prepend(tabLinks);
			var tabContent = $("div.l-tab-content", $(this));
			tabContent.children("div").each(function(i) {
				$(this).css("padding", 10);
				var li = $('<li style="border-right:0px">');
				$("ul", tabLinks).append(li);
				var tabId = $(this).attr("id");
				if (tabId == "undefined") {
					tabId = "tabid" + i;
				}
				var tabName = $(this).attr("title");
				if (tabName) {
					$(this).removeAttr("title");
				}
				li.attr("tabid", tabId).append("<a>" + tabName + "</a>").click(function() {
					$("li", tabLinks).removeClass();
					$(this).addClass("l-selected");
					$(".l-tab-content-item", tabContent).hide();
					$(".l-tab-content-item:eq(" + i + ")", tabContent).show();
					if (_opt.onSelectTabItem) {
						_opt.onSelectTabItem(tabId);
					}
				});
				$(this).addClass("l-tab-content-item").attr("tabid", tabId).hide();
			});

			//设置内容高度
			if (_opt.height) {
				tabContent.height(_opt.height);
			}

			//设置选中项
			$("li:eq(" + selectedIndex + ")", tabLinks).addClass("l-selected");
			$(".l-tab-content-item:eq(" + selectedIndex + ")", tabContent).show();

			//最后的TAB项加上右边框
			$("li:last", tabLinks).removeAttr("style");
		});
	};

	/**
	 * 工具栏组件.
	 * 示例：
	 * 无参数 $('#toolbar').toolBar();
	 * 有参数 $('#toolbar').toolBar({moduleUri:'/org/manage'});
	 * 有参数时只有moduleUri一个参数.
	 * return Array
	 */
	$.fn.toolBar = function() {
		var contextPath = top.contextPath;
		var options = arguments.length > 0 ? arguments[0] : {};
		var _options = $.extend({}, options || {});
		var menuTools = [];
		var otherFunc = [];
		var response = $.callServiceAsJson(contextPath + "/toolBar/get", _options, {});
		if (response.result.successed) {
			var data = response.result.data;
			if (data.length > 0) {
				$.each(data, function(i, row){
					var obj = {};
					if (row.manName !== '') {
						obj.id = row.manName;
					}
					obj.text = row.funcName;
					obj.icon = row.iconUri;
					obj.type = row.funcTypeId + "";
					if (row.funcTypeId == '2') {//工具条
						obj.click = row.funcJsPath + "()";
						menuTools.push(obj);
					} else {
						obj.click = row.funcJsPath;
						otherFunc.push(obj);
					}
				});
				if(menuTools.length>0){
					var toolbar = $('<div class="l-panel-topbar l-toolbar">');
					$(this).append(toolbar);
					$.each(menuTools, function(index, item){
						var menuItem = '<div class="l-toolbar-item l-panel-btn l-toolbar-item-hasicon">';
						menuItem += '<table width="100%" height="90%" border="0" cellspacing="0" cellpadding="0">';
						if (item.icon) {
							menuItem += '<tr><td align="center"><div class="l-icon l-icon-';
							menuItem += item.icon + '"></div></td></tr>';
						}
						if (item.text) {
							menuItem += '<tr><td><span class="form_menu">';
							menuItem += item.text + '</span></td></tr>';
						}
						menuItem += '</table></div>';
						
						var menu = $(menuItem);
						toolbar.append(menu);
						if (item.id) {
							menu.attr('toolbarid', item.id);
						}
						if (item.click) {
							menu.click(function(){
								window.eval(item.click);
							});
						}
					});
				}
			}
		}

		return otherFunc;
	};

})(jQuery);

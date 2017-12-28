CommonUtils.regNamespace("question", "term");
question.term = (function() {
	var myd = {};
	myd.term = {};
	myd.question = [];
	myd.notsatisfy_option = [];
	myd.option = [];
	myd.system_id;
	myd.term_id;
	myd.staff_code;
	myd.area_id;
	// 设置状态位，避免重复提交
	myd.submitFlag = 0;

	// 获取问卷
	myd.get_term = function() {
		$.ajaxSettings.async = false;
		var URL = contextPath + "/user/questionnaire/queryTerm";
		$.getJSON(URL,
				function(data) {
					if (data.successed) {

						// 以下信息通过接口获得
						myd.term = data.data.term;
						myd.notsatisfy_option = data.data.notsatisfy_option;
						myd.option = data.data.option;
						myd.question = data.data.question;
						myd.system_id = data.data.term.system_id;
						myd.term_id = data.data.term.term_id;
						// 以下信息请源系统设置
						myd.staff_code = $("#_session_staff_info").attr(
								"staffCode");
						myd.area_id = $("#_session_staff_info").attr("areaId");
						myd.staff_name = $("#_session_staff_info").attr(
								"staffName");
						myd.phone_number = $("#_session_staff_info").attr(
								"inPhoneNum");
						// 以下信息请源系统提交到后台后进行设置
						myd.timestamp = '';
						myd.token = '';
						$.ajaxSettings.async = true;
					} else {
						$.alert('错误');
					}
				});
	};

	// 设置标题和欢迎词
	myd.set_term_head = function() {
		$('#head').html(myd.term.term_name);
		$('#welcome').html(myd.term.term_welcome);
	};

	// 创建问题
	myd.create_question = function() {
		for (var i = 0; i < myd.question.length; i++) {
			if (myd.question[i].parent_question_id == 0) {
				var question_id = myd.question[i].question_id;
				var dom_start = "<div class='row'><div class='col-md-2'></div><div class='col-md-8' style='background-color: #FFFFFF'>";
				var dom_is_request = "";
				if (myd.question[i].is_request == 1) {
					dom_is_request = "<a style='color:red;margin-left: 5px;font-size:15px;'>*</a>";
				}
				var dom_qeustion = "<h4><strong id='" + question_id
						+ "'  question_type='" + myd.question[i].question_type
						+ "' is_request='" + myd.question[i].is_request
						+ "' question_name='" + myd.question[i].question_name
						+ "'  >" + myd.question[i].question_name
						+ dom_is_request + "</strong></h4><div id='q"
						+ question_id + "'></div>";
				var dom_end = "<div  class='col-md-2'></div></div>";
				var dom = dom_start + dom_qeustion + dom_end;
				$('#btn').before(dom);
				myd.create_sub_question(question_id);
			}

		}
	};

	// 递归创建子问题
	myd.create_sub_question = function(parent_question_id) {
		for (var i = 0; i < myd.question.length; i++) {
			if (myd.question[i].parent_question_id == parent_question_id) {
				var question_id = myd.question[i].question_id;
				var dom_is_request = "";
				if (myd.question[i].is_request == 1) {
					dom_is_request = "<a style='color:red;margin-left: 5px;font-size:15px;'>*</a>";
				}
				var dom = "<h5><Strong id='" + question_id + "' textType='"
						+ myd.question[i].question_type + "' is_request='"
						+ myd.question[i].is_request + "' question_name='"
						+ myd.question[i].question_name + "'  >"
						+ myd.question[i].question_name + dom_is_request
						+ "</Strong></h5><div id='q" + question_id + "'></div>";
				$('#q' + parent_question_id).before(dom);
				myd.create_sub_question(question_id);
			}
		}

	};

	// 创建选项
	myd.create_option = function() {
		for (var i = 0; i < myd.option.length; i++) {
			var option = myd.option[i];
			// 确定是单选还是多选
			var question_type = 0;
			for (var j = 0; j < myd.question.length; j++) {
				if (myd.option[i].question_id == myd.question[j].question_id) {
					question_type = myd.question[j].question_type;
				}
			}
			// 生成选项唯一的id
			var option_key = option.question_id + '-' + option.option_id;
			// 单选框处理
			if (question_type == 2) {
				var dom = "<div  class='radio'><label><input type='radio' not_satisfy='"
						+ option.not_satisfy
						+ "' question_id='"
						+ option.question_id
						+ "' option_id='"
						+ option.option_id
						+ "' name='"
						+ option.question_id
						+ "' option_key='"
						+ option_key
						+ "' option_name='"
						+ option.option_name
						+ "'>"
						+ option.option_name
						+ "</label></div>";
			}
			// 复选框处理
			if (question_type == 3) {
				var dom = "<div class='checkbox'><label><input type='checkbox' question_id='"
						+ option.question_id
						+ "' option_id='"
						+ option.option_id
						+ "' name='"
						+ option.question_id
						+ "' id='"
						+ option_key
						+ "' option_name='"
						+ option.option_name
						+ "'>"
						+ option.option_name
						+ "</label></div>";
			}
			$('#q' + option.question_id).before(dom);
		}
	};

	// 创建不满意选项
	myd.create_notsatisfy = function() {
	    //增加其他原因填写
	    for (var i = 0; i < myd.option.length; i++) {
	        var option = myd.option[i];
	        var option_key = option.question_id + '-' + option.option_id;
	        if (option.not_satisfy == 1) {
	            var dom_text = "<form class='form-inline'><div class='form-group notsatisfy' style='padding-left:10%;display:none;'>其他：<input type='text' question_id='" + option.question_id + "' parent_option_key='" + option_key + "' class='form-control' style='width:80%'></div></form>";
	            var target = $("[option_key='" + option_key + "']").parents('.radio');
	            target.after(dom_text);
	        }
	    }
	    //增加不满意选项
	    for (var i = myd.notsatisfy_option.length - 1; i >= 0; i--) {
	        var not_option = myd.notsatisfy_option[i];
	        //生成选项唯一的id
	        var not_option_key = not_option.question_id + '-' + not_option.option_id + '-' + not_option.notsatisfy_option_id;
	        //生成上级选项的id
	        var option_key = not_option.question_id + '-' + not_option.option_id;
	        //先隐藏
	        var dom_checkbox = "<div class='checkbox notsatisfy'  style='padding-left:8%;display:none;'><label><input type='checkbox' question_id='" + not_option.question_id + "' option_id='" + not_option.option_id + "' notsatisfy_option_id='" + not_option.notsatisfy_option_id + "' parent_option_key='" + option_key + "' id='" + not_option_key + "'>" + not_option.notsatisfy_option_name + "</label></div>";
	        var target = $("[option_key='" + option_key + "']").parents('.radio');
	        target.after(dom_checkbox);
	    }
	};

	// 绑定radio点击不满意的事件
	//绑定radio点击不满意的事件 --20171208修改
	myd.radio_click = function() {
	    $(".radio,label,ins").on('click',
	    function() {
	        var target = $(this).parents('.radio').find('input:radio');
	        if (target.length == 0) {
	            return;
	        };
	        var question_id = target.attr('question_id');
	        var option_key = target.attr('option_key');
	        if (target.attr('not_satisfy') == 1) {
	            $("input:checkbox[question_id='" + question_id + "'],input:text[question_id='" + question_id + "']").parents('.notsatisfy').css('display', 'none');
	            $("input:checkbox[parent_option_key='" + option_key + "'],input:text[parent_option_key='" + option_key + "']").parents('.notsatisfy').css('display', 'block');
	        };
	        if (target.attr('not_satisfy') == 0) {
	            $("input:checkbox[question_id='" + question_id + "'],input:text[question_id='" + question_id + "']").parents('.notsatisfy').css('display', 'none');
	        };
	    });
	};

	// 创建纯文本框
	myd.create_textarea = function() {
		for (var i = 0; i < myd.question.length; i++) {
			var question_id = myd.question[i].question_id;
			if (myd.question[i].question_type == 4) {
				var dom = "<textarea class='form-control' question_id='"
						+ question_id
						+ "'  rows='3' style='width: 80%'></textarea><br><br>";
				$('#q' + question_id).before(dom);
			}
		}
	};

	// 初始化radio和checkbox样式
	//初始化radio和checkbox样式 --20171208修改
	myd.startICheck = function() {
	    $('input').iCheck({
	        checkboxClass: 'icheckbox_square-blue',
	        radioClass: 'iradio_square-blue',
	        increaseArea: '20%' // optional
	    });

	    //$("input[not_satisfy='1']").parents('.radio').css('margin-bottom', '-10px');

	};

	// 初始化点击样式
	myd.setBackgroudColor = function() {
		$('.col-md-8').on('click', function(argument) {
			$('.col-md-8').css('background-color', '#FFFFFF');
			$(this).css('background-color', '#EAF5F5');
			$('.nobgcolor').css('background-color', '#FFFFFF');
		});

		$('ins,label').on('click', function(argument) {
			$('.col-md-8').css('background-color', '#FFFFFF');
			$(this).parents('.col-md-8').css('background-color', '#EAF5F5');
			$('.nobgcolor').css('background-color', '#FFFFFF');
		});
	};

	// 弹窗插件
	myd.alert = function(info) {
		art.dialog({
			lock : true,
			content : info,
			ok : true,
			// fixed : true,
			top : '1%'
		});
	};

	// 提交
	myd.submit = function() {
		if (myd.submitFlag == 1) {
			return false;
		}
		myd.submitFlag = 1;
		var valueArray = myd.getAllValue();

		if (myd.check(valueArray)) {
			var result = {};
			// 时间戳和token预留位置，在后台算好后进行字符串替换
			result.system_id = myd.system_id;
			result.timestamp = myd.timestamp;
			result.token = myd.token;

			// 格式化问卷答案
			var base_info = {};
			base_info.staff_name = myd.staff_name;
			base_info.phone_number = myd.phone_number;
			base_info.term_id = myd.term_id;
			base_info.Term_id = myd.term_id;
			base_info.staff_code = myd.staff_code;
			base_info.area_id = myd.area_id;

			result.base_info = base_info;
			var option = [];
			var notsatisfy_option = [];
			for (var i = 0; i < valueArray.length; i++) {
				// 格式化选答案
				if (valueArray[i].notsatisfy_option_id == undefined) {
					var option_obj = {};
					option_obj.question_id = valueArray[i].question_id;
					option_obj.option_name = valueArray[i].option_name;
					option_obj.is_satisfy = "是";
					if (valueArray[i].option_id != undefined) {
						option_obj.option_id = valueArray[i].option_id;
					}
					if (valueArray[i].textvalue != undefined) {
						option_obj.text_value = valueArray[i].textvalue;
					}
					option.push(option_obj);
				}
				// 格式化不满意选项答案
				if (valueArray[i].notsatisfy_option_id != undefined) {

					var notsatisfy_option_obj = {};
					notsatisfy_option_obj.is_satisfy = "否";
					notsatisfy_option_obj.question_id = valueArray[i].question_id;
					notsatisfy_option_obj.option_id = valueArray[i].option_id;
					notsatisfy_option_obj.option_name = valueArray[i].option_name;
					notsatisfy_option_obj.notsatisfy_option_id = valueArray[i].notsatisfy_option_id;
					notsatisfy_option.push(notsatisfy_option_obj);
				}
			}

			// 对于问题的处理
			var question = [];

			for (var i = 0; i < myd.question.length; i++) {
				var question_obj = {};
				question_obj.question_id = myd.question[i].question_id;
				question_obj.question_name = myd.question[i].question_name;
				question_obj.question_type = myd.question[i].question_type;
				question_obj.is_request = myd.question[i].is_request;
				question_obj.parent_question_id = myd.question[i].parent_question_id;
				question_obj.parent_questionId = myd.question[i].parent_question_id;
				question.push(question_obj);
			}

			result.option = option;
			result.notsatisfy_option = notsatisfy_option;
			result.question = question;
			result.areaId = myd.area_id;
			// 调用回写接口
			var question_params = JSON.stringify(result);
			console.log(question_params);
			var url = contextPath + "/user/questionnaire/returnResult";

			$.callServiceAsJson(url, question_params, {
				"before" : function() {
					$.ecOverlay("<strong>正在提交数据中,请稍等会儿....</strong>");
				},
				"always" : function() {
					$.unecOverlay();
				},
				"done" : function(response) {
					if (response.code == 0) {
						// $.alert("提示", "提交成功");
						// _queryUserInfo();
						window.location.href = contextPath
								+ "/user/questionnaire/forwardSuccess";
					} else if (response.code == -2) {
						$.alertM(response.data);
					} else {
						if (response.data) {
							$.alert("提示", response.data);
						} else {
							$.alert("提示", "提交失败!");
						}

					}
				},
				fail : function(response) {
					$.unecOverlay();
					$.alert("提示", "请求可能发生异常，请稍后再试！");
				}
			});

			// myd.alert('提交成功，参数：' + JSON.stringify(result));
			// $.alert("提示", "已成功提交");
			myd.submitFlag = 0;
		} else {
			myd.submitFlag = 0;
		}
		;

	};

	// 检查必填项
	myd.check = function(valueArray) {
		for (var i = 0; i < myd.question.length; i++) {
			if (myd.question[i].is_request == 1) {
				var cnt = 0;
				for (var j = 0; j < valueArray.length; j++) {
					if (myd.question[i].question_id == valueArray[j].question_id) {
						cnt = cnt + 1;
					}
				}
				if (cnt == 0) {

					$.alert('提示', '【' + myd.question[i].question_name
							+ '】为必填，请检查！');

					return false;
				}
			}
		}
		return true;
	};

	// 抽取问卷答案
	myd.getAllValue = function() {
		var valueArray = [];
		// 单选框
		var radioList = $("input:radio:checked");
		radioList.each(function() {
			var target = $(this);
			var param = {};
			param.question_id = target.attr('question_id');
			param.option_id = target.attr('option_id');
			param.option_key = target.attr('option_key');
			param.option_name = target.attr('option_name');
			valueArray.push(param);
		});
		// 复选框
		var checkList = $("input:checkbox:checked");

		checkList.each(function() {
			var target = $(this);
			var parent_option_key = target.attr('parent_option_key');
			// 检查不满意选项是否是选了不满意
			if (parent_option_key != undefined) {
				for (var i = 0; i < valueArray.length; i++) {
					if (valueArray[i].option_key == parent_option_key) {
						var param = {};
						param.question_id = target.attr('question_id');
						param.option_id = target.attr('option_id');
						param.option_name = target.attr('option_name');
						param.notsatisfy_option_id = target
								.attr('notsatisfy_option_id');

						valueArray.push(param);
					}
				}
			}
			// 不是不满意选项的直接录入
			if (parent_option_key == undefined) {
				var param = {};
				param.question_id = target.attr('question_id');
				param.option_id = target.attr('option_id');
				param.option_name = target.attr('option_name');
				valueArray.push(param);
			}
		});

		// 不满意手工填写
		var textList = $("input:text");

		textList.each(function() {
			var target = $(this);
			var textvalue = target.val();
			if (textvalue != '') {
				var parent_option_key = target.attr('parent_option_key');

				for (var i = 0; i < valueArray.length; i++) {
					if (valueArray[i].option_key == parent_option_key) {
						var param = {};
						valueArray[i].textvalue = textvalue.replace(/%/g,
								'*01*').replace(/'/g, '*02*').replace(/"/g,
								'*03*').replace(/&/g, '*04*').replace(/{/g,
								'*05*').replace(/}/g, '*06*');
					}
				}

			}
		});

		var textareaList = $("textarea");
		textareaList.each(function() {
			var target = $(this);
			var textvalue = target.val();
			if (textvalue != '') {
				var param = {};
				param.question_id = target.attr('question_id');
				param.textvalue = textvalue.replace(/%/g, '*01*').replace(/'/g,
						'*02*').replace(/"/g, '*03*').replace(/&/g, '*04*')
						.replace(/{/g, '*05*').replace(/}/g, '*06*');
				valueArray.push(param);
			}
		});

		return valueArray;
	}

	return {
		myd : myd
	};

})();
// 初始化
$(function() {
	question.term.myd.get_term();
	// 设置标题和欢迎词
	question.term.myd.set_term_head();
	// 创建问题
	question.term.myd.create_question();
	// 创建选项
	question.term.myd.create_option();
	// 创建不满意选项
	question.term.myd.create_notsatisfy();
	// 创建存文本框
	question.term.myd.create_textarea();
	// 初始化radio和checkbox样式
	question.term.myd.startICheck();
	// 初始化点击样式
	question.term.myd.setBackgroudColor();
	// 绑定radio点击不满意的事件
	question.term.myd.radio_click();
});

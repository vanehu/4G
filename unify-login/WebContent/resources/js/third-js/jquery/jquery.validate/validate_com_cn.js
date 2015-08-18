/*
 * Translated default messages for the jQuery validation plugin.
 * Locale: CN
 */
 (function($) {
 
	// http://docs.jquery.com/Plugins/Validation/validate
 	var defaults = {
 		tip:true,//是否 tooltip提示
 		tipTitle:"",
		errorClass:"tooltipinputerr",
		validClass:"tooltipinputok"
	}
 
	jQuery.fn.tip_validate = function(options) {
			var options = jQuery.extend({},defaults,options);
		 	jQuery.validator.setDefaults({ 
		    success: function(label) {
		 		if(!!label){
	    			var tooltipname = $(label).attr('for');
					if(!tooltipname){
						if(options.tip && typeof ($(label).attr("v_ti_p")) !="undefined" && $(label).attr("v_ti_p")=='true') {
						$(label).qtip('hide');
						$(label).removeAttr("v_ti_p");
						$(label).qtip('destroy');
						$(label).removeClass(options.errorClass).addClass(options.validClass);
						}
				  } else {
					  $(label).removeClass(options.errorClass).addClass(options.validClass);
				  }
    		}
				
			},
			errorPlacement:function(label, element){
				if(!!label){
					if(element.next("label") && element.next("label").length>0){
						label.insertAfter(element.next("label"));
					} else {
						 label.insertAfter(element);
					}
				}
			},
		    ignoreTitle:true,
		   highlight: function(element, errorClass) {//动态显示错误提示
				if($(element.id).length){
					$("label[for=" + element.id + "]").fadeOut(function() {
			       	$("label[for=" + element.id + "]").fadeIn();
			     	})
				}

		    }
			
		 	});
		 	var messages_zh_cn ={
			        required: "必选字段",
					remote: "请修正该字段",
					email: "请输入正确格式的电子邮件",
					url: "请输入合法的网址",
					date: "请输入合法的日期",
					dateISO: "请输入合法的日期 (ISO).",
					number: "请输入合法的数字",
					digits: "只能输入整数",
					creditcard: "请输入合法的信用卡号",
					equalTo: "请再次输入相同的值",
					accept: "请输入拥有合法后缀名的字符串",
					maxlength: jQuery.validator.format("请输入一个长度最多是 {0} 的字符串"),
					minlength: jQuery.validator.format("请输入一个长度最少是 {0} 的字符串"),
					rangelength: jQuery.validator.format("请输入一个长度介于 {0} 和 {1} 之间的字符串"),
					range: jQuery.validator.format("请输入一个介于 {0} 和 {1} 之间的值"),
					max: jQuery.validator.format("请输入一个最大为 {0} 的值"),
					min: jQuery.validator.format("请输入一个最小为 {0} 的值")
			};
		 	jQuery.extend(jQuery.validator.messages, messages_zh_cn);
			var validator = this.validate(options);
			 return validator;
	};

 })(jQuery);
 

//添加自定义的方法
jQuery.validator.addMethod("byteRangeLength", function(value, element, param) { 
    var length = value.length; 
    for(var i = 0; i < value.length; i++){ 
        if(value.charCodeAt(i) > 127){ 
            length++; 
        } 
    } 
});

// 中文字两个字节
jQuery.validator.addMethod("byteRangeLength", function(value, element, param) {
    var length = value.length;
    for(var i = 0; i < value.length; i++){
        if(value.charCodeAt(i) > 127){
            length++;
        }
    }
  return this.optional(element) || ( length >= param[0] && length <= param[1] );    
}, $.validator.format("请确保输入的值在{0}-{1}个字节之间(一个中文字算2个字节)"));

// 邮政编码验证    
jQuery.validator.addMethod("isZipCode", function(value, element) {    
    var tel = /^\d{6}$/;
    return this.optional(element) || (tel.test(value));
}, "请正确填写您的邮政编码");

jQuery.validator.addMethod("contain", function(value, element,param) { 
	if(typeof(param.length) !="undefined") {
	 	var length = param.length;
	    for(var i = 0; i < param.length; i++){
	     	if(param[i]== value) {
	     		return this.optional(element) || true;
	     	}
	     }
	     
	}
    return this.optional(element) || false;
});
jQuery.validator.addMethod("notcontain", function(value, element,param) { 
	if(typeof(param.length) !="undefined") {
	 	var length = param.length;
	    for(var i = 0; i < param.length; i++){
	     	if(param[i]== value) {
	     		return this.optional(element) || false;
	     	}
	     }
	     
	}
    return this.optional(element) || true;
});
jQuery.validator.addMethod("fileType", function(value, element,param) {
	var fileType ="";
	if(typeof value =="string" && value.length > 2) {
		fileType = value.substring(value.lastIndexOf(".")+1);
	} else {
		return this.optional(element) || false;
	}
	if(typeof(param.length) !="undefined") {
	 	var length = param.length;
	    for(var i = 0; i < param.length; i++){
	     	if(param[i]==  fileType.toLowerCase()) {
	     		return this.optional(element) || true;
	     	}
	     }
	     
	}
    return this.optional(element) || false;
});


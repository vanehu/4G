jQuery.ketchup
.validation('required', '该字段必填.', function(form, el, value,other) {
	var nodeName=el.get(0).nodeName.toLowerCase();
	if(nodeName=="select"){
		if(other){
			return (value !=other);
		}
		return (value != "");
	} else {
		var type = el.attr('type').toLowerCase();
		if(type == 'checkbox' || type == 'radio') {
			return (el.attr('checked') == true);
		} else {
			return (value.length != 0);
		}
	}
})

.validation('reg', '{arg1}', function(form, el, value, mark) {
  	return new RegExp(mark).test(value);
})

.validation('minlength', '该字段最短长度至少 {arg1}.', function(form, el, value, min) {
  return (value.length >= +min);
})

.validation('maxlength', '该字段最长长度至多 {arg1}.', function(form, el, value, max) {
  return (value.length <= +max);
})

.validation('rangelength', '该字段长度范围必须 在 {arg1} 和 {arg2}之间.', function(form, el, value, min, max) {
  return (value.length >= min && value.length <= max);
})
.validation('mask', '该字段必须匹配 {arg2}.', function(form, el, value, pattern) {
  return this.mask(pattern,value);
})
.validation('decimalTwo', '必须为大于0的有效数字,最小保留2位小数.', function(form, el, value) {
	var pattern = /^(([1-9]{1}\d*(\.\d{1,2})?)|(0\.\d[1-9])|(0\.[1-9]\d?))$/;
  	return this.mask(pattern,value);
})
.validation('min', '最小值为 {arg1}.', function(form, el, value, min) {
  return (this.isNumber(value) && +value >= +min);
})

.validation('max', '最大值不能超过 {arg1}.', function(form, el, value, max) {
  return (this.isNumber(value) && +value <= +max);
})

.validation('range', '数字值范围在 {arg1} 和 {arg2} 之间.', function(form, el, value, min, max) {
  return (this.isNumber(value) && +value >= +min && +value <= +max);
})

.validation('number', '必须是数字.', function(form, el, value) {
  return this.isNumber(value);
})

.validation('digits', '必须是整数.', function(form, el, value) {
  return /^\d+$/.test(value);
})

.validation('contactTel', '联系电话必须为手机号或固话.', function(form, el, value) {
  return /^((1\d{10})|((0\d{2,3}\-?)?[2-9]\d{6,7}))$/.test(value);
})

.validation('isTelecomSection', '必须为有效的中国电信手机号码.', function(form, el, value) {
  return /^(180|189|133|134|153|181|108|170|177)\d{8}$/.test(value);
})

.validation('isMVNOSection','请输入正确的手机号码', function(form, el, value){
	return /^(170)\d{8}$/.test(value);
})

.validation('isTelecomOridCardCheck', '必须为有效的中国电信手机号码或输入合法身份证号码，', function(form, el, value) {
  return (/^(180|189|133|134|153|181|108|170|177)\d{8}$/.test(value))||(this.idCardCheck(value));
})
.validation('isStaffCode', '4-16位字符,可由英文、数字及"_"、"-"组成.', function(form, el, value) {
  return /^[a-zA-Z\d][\w-]{2,14}[a-zA-Z\d]$/.test(value);
})
.validation('email', '必须是合法的E-Mail.', function(form, el, value) {
  return this.isEmail(value);
})

.validation('url', '必须是合法的 URL.', function(form, el, value) {
  return this.isUrl(value);
})

.validation('username', '必须是用户名.', function(form, el, value) {
  return this.isUsername(value);
})

.validation('match', '必须等于 {arg1}.', function(form, el, value, word) {
  return (el.val() == word);
})

.validation('pwdMatch', '{arg1}.', function(form, el, value, word) {
  return (el.val() == $("#"+word).val());
})

.validation('contain', '必须含有 {arg1}', function(form, el, value, word) {
  return this.contains(value, word);
})

.validation('date', '必须是合法的日期 .', function(form, el, value) {
  return this.isDate(value);
})

.validation('minselect', '至少选 {arg1} 项.', function(form, el, value, min) {
  return (min <= this.inputsWithName(form, el).filter(':checked').length);
}, function(form, el) {
  this.bindBrothers(form, el);
})

.validation('maxselect', '最多选 {arg1} 项.', function(form, el, value, max) {
  return (max >= this.inputsWithName(form, el).filter(':checked').length);
}, function(form, el) {
  this.bindBrothers(form, el);
})

.validation('rangeselect', '必须选 {arg1} 和 {arg2} 项之间.', function(form, el, value, min, max) {
  var checked = this.inputsWithName(form, el).filter(':checked').length;
  
  return (min <= checked && max >= checked);
}, function(form, el) {
  this.bindBrothers(form, el);
})
.validation('idCardCheck', '请输入合法身份证号码', function(form, el, value) {
	return this.idCardCheck(value);
})
.validation('idCardCheck18', '请输入合法身份证号码', function(form, el, value) {
	return this.idCardCheck18(value);
})
.validation('terminalCodeCheck', '请输入合法的终端串码<br/>&nbsp;&nbsp;&nbsp;必须5到20位字母或数字组合,不限大小写', function(form, el, value) {
	return this.terminalCodeCheck(value);
})
.validation('idCardCheck4Target', '请输入合法身份证号码', function(form, el, value,targetId,targetVal) {
	if($("#"+targetId).val()==targetVal){
		return this.idCardCheck(value);
	}else{
		return true;
	}
	
})
.validation('checkLength', '密码必须为{arg3}位数，且不能过于简单', function(form, el, value,targetId,targetVal,len) {
	if($("#"+targetId).val()==targetVal){
		return value.length==len;
	}else{
		return true;
	}
	
})

.validation('simple_password_num1', '密码必须为{arg1}位数字，且不可有连续的相同数字，不可连续递增递减', function(form, el,value,len) {
	//targetId 如果为空，判断第一个密码 不能为空
	//targetId 不为空[target是第一个密码的id]，判断第二个密码与第一个密码是否相等
	if(value==null){
		//$.alert("提示","密码不可为空！");
		return false ;
	}else if((value).length!=6){
		//$.alert("提示","密码包含非数字或长度不是6位！");
		return false ;
	}
	var accNbr = order.prodModify.choosedProdInfo.accNbr;
	if(accNbr!=null && accNbr.indexOf(value)>=0){
		//$.alert("提示","密码不能与接入号中的信息重复，请修改！");
		return false ;
	}
	for(var k=0;k<5;k++){
		lastOneS = value.substring(k,k+1) ;
		thisOneS = value.substring(k+1,k+2) ;
		if(lastOneS==thisOneS){
			//$.alert("提示","密码中包含连续相同数字，请修改！");
			return false ;
		}
	}
	if(order.main.checkIncreace6(value)){
		//$.alert("提示","密码不可是连续6位数字，请修改！");
		return false ;
	}
	return true ;
})

.validation('simple_password_eql1', '两次密码不一致', function(form, el,value,targetId) {
	//targetId 如果为空，判断第一个密码 不能为空
	//targetId 不为空[target是第一个密码的id]，判断第二个密码与第一个密码是否相等
	var val2 = $("#"+targetId).val() ;
	if(value!=null&&value!=""){
		if(val2!=null&&val2!=""&&value!=val2){
			return false ;
		}
	}
	return true ;
})


.validation('simple_password_num2', '两次密码不一致', function(form, el,value,targetId) {
	//targetId 如果为空，判断第一个密码 不能为空
	//targetId 不为空[target是第一个密码的id]，判断第二个密码与第一个密码是否相等
	var val1 = $("#"+targetId).val() ;
	if(val1==null||val1==""){
		if(value==null||value==""){
			return true ;
		}
	}
	if(val1==value){
		return true ;
	}
	return false ;
})

.validation('equ_notnull', '两次密码不一致', function(form, el, value,targetId) {
	
})

.validation('checkLen', '密码必须为{arg1}位数', function(form, el, value,len) {
	if(value!=null&&value!=""){
		return value.length==len;
	}
})

.validation('checkLen', '密码必须为{arg1}位数', function(form, el, value,len) {
	if(value!=null&&value!=""){
		return value.length==len;
	}
})

.validation('checkCertOfficer', '请填写合法军官证号', function(form, el, value,targetId,targetVal) {
	if($("#"+targetId).val()==targetVal){
		return value!="";
	}else{
		return true;
	}
})
.validation('checkPassport', '请填写合法护照号', function(form, el, value,targetId,targetVal) {
	if($("#"+targetId).val()==targetVal){
		return value!="";
	}else{
		return true;
	}
})
.validation('depEq', '必须等于 {arg1}.', function(form, el, value,targetId) {
	if($("#"+targetId).val()!=null&&$("#"+targetId).val()!=""){
		return $("#"+targetId).val()==value;
	}
	return true ;
})

.validation('isSimplePwdNum', '非数字或过于简单', function(form, el, value) {
	if(this.isNumber(value)){
		var v = check_computeComplex(value);
		return v>1?true:false;
	}
	return false;
})

.validation('isSimplePwd', '密码强度太低.', function(form, el, value,targetId) {
//	if(value.length < 6){
//		return false;
//	}
//	//判断是否全部为一样
//	if(value.length % 2 == 0) {
//		var a = value.substring(0,value.length/2);
//		var b = value.substring(value.length/2,value.length);
//		if(a == b){
//			return false;
//		}
//	}else {
//		var a = value.substring(0,(value.length-1)/2);
//		var b = value.substring((value.length-1)/2,value.length-1);
//		if(a == b){
//			var lastStr = value.charAt(value.length-1);
//			if(lastStr == a.charAt(0)) {
//				return false;
//			}
//		}
//		
//	}
//	//判断是否为递增或递减字符串
//	var result = 0;
//	for(var i =0;i<value.length;i++) {
//		if((i+1) != value.length){
//			var a = parseInt(value.charCodeAt(i),10);
//			var b = parseInt(value.charCodeAt(i+1),10);
//			if(b-a == 1) {
//				result++;
//			}
//			else if(b-a==-1){
//				result++;
//			}
//			else {
//				result = 0;
//			}
//		}
//	}
//	if(result == (value.length-1)) {
//		return false;
//	}
//	return true;
	
	//判断是否为单一字符，例如全部为数字或小写字母，必须为组合密码
	Modes=0; 
	for (i=0;i<value.length;i++){ 
		var sChar = 0;
		var iN = value.charCodeAt(i)
		if (iN>=48 && iN <=57) //数字 
		sChar= 1; 
		if (iN>=65 && iN <=90) //大写字母 
		sChar= 2; 
		if (iN>=97 && iN <=122) //小写 
		sChar= 4; 
		else 
		sChar= 8; //特殊字符
		//测试每一个字符的类别并统计一共有多少种模式. 
		Modes=Modes|sChar; 
	} 
	var S_level = 0;
	for (i=0;i<4;i++){ 
		if (Modes & 1) S_level++; 
		Modes>>>=1; 
	} 
	if(S_level == 0 || S_level == 1) {
		return false;
	}
	return true;
});



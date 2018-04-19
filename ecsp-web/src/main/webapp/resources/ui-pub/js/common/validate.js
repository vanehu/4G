function isNull(temp){
	if(temp==null||temp==""||temp=="null"){
		return true ;
	}else{
		return false ;
	}
}
function isNotNull(temp){
	if(temp!=null&&temp!=""&&temp!="null"){
		return true ;
	}else{
		return false ;
	}
}
//只能输入数字 文本事件用法：onkeyup="NumClear1(this)"
function NumClear1(obj){   
	obj.value = obj.value.replace(/\D/g,"");
}
//只能输入数字 文本事件用法：onkeyup="NumClear1(this,num)"
function NumClear1(obj,num){   
	obj.value = obj.value.replace(/\D/g,"");
	if(obj.value.length>num){
		obj.value = obj.value.substring(0,num);
	}
}
//小数过滤：只保留数字和小数点。文本事件用法：onkeyup="NumClear2(this)"
function NumClear2(obj){   
	obj.value = obj.value.replace(/[^\d.]/g,"");  //清除“数字”和“.”以外的字符  
	obj.value = obj.value.replace(/^\./g,"");  //验证第一个字符是数字而不是. 
	obj.value = obj.value.replace(/\.{2,}/g,"."); //只保留第一个. 清除多余的.   
	obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
}
//小数过滤，精确到小数点后 几位？：只保留数字和小数点。文本事件用法：onkeyup="NumClear3(this,2)"
function NumClear3(obj,num){   
	obj.value = obj.value.replace(/[^\d.]/g,"");  //清除“数字”和“.”以外的字符  
	obj.value = obj.value.replace(/^\./g,"");  //验证第一个字符是数字而不是. 
	obj.value = obj.value.replace(/\.{2,}/g,"."); //只保留第一个. 清除多余的.   
	obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
	if(obj.value.indexOf(".")>-1&&obj.value.length-(obj.value.indexOf(".")+1)>num){//精确到小数点后两位
		obj.value = obj.value.substring(0,obj.value.indexOf(".")+1+num);
	}
}


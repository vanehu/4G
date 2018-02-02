package com.al.lte.portal.common;

public class Const {
	
	//令牌加密解密key   正式：$token@KEY!2015      测试：TOKEN@GROUP%!
	public static final String TOKEN_KEY="$token@KEY!2015";
	//省份公共秘钥key   正式：#public@2015$KEY      测试：PUBLIC_TOKEN_KEY
	public static final String TOKEN_PROVINCE_KEY="#public@2015$KEY";
	
	public static final String UNIFY_LOGIN_AREA_SIGN = "_UNIFY_LOGIN_AREA_SIGN";
	
	public static final String STAFF_LOGIN_AREA_SIGN = "_STAFF_LOGIN_AREA_SIGN";
	
	public static final String DEFALUT_ENCODE = "UTF-8";
	
	public static final String AREA_ID_REGEXP = "^8\\d{6}?$";
}

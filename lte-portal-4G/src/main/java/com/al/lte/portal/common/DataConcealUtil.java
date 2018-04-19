package com.al.lte.portal.common;
/**
 * 脱敏工具类
 * 
 * 1:姓名脱敏
 * 2：身份证号码脱敏
 * 3：手机号码脱敏
 * @author yudp
 *
 */
public class DataConcealUtil {
	
	public static String SYMBOL = "*";
	
	/**
	 * 1:姓名脱敏
	 * 2：身份证号码脱敏
	 * 3：手机号码脱敏 
	 * @param str 脱敏目标对象
	 * @param type 脱敏目标对象类型
	 * @return
	 */
	public static String toConceal(String str,String type) {
		
		StringBuffer result = new StringBuffer();
		 
		if(null  == str || "".equals(str)) 
			
			return str;
		
		if("1".equals(type)){
			for(int i=0;i<str.length();i++){
				if(i>0){
					result.append(SYMBOL);
				}else{
					result.append(str.charAt(i));
				}
			}
			
		}else if("2".equals(type)){
			for(int i=0;i<str.length();i++){
				if(i<6||i>13){
					result.append(str.charAt(i));
				}else{
					result.append(SYMBOL);
				}
			}
		}else if("3".equals(type)){
			for(int i=0;i<str.length();i++){
				if(i<5||i>8){
					result.append(str.charAt(i));
				}else{
					result.append(SYMBOL);
				}
			}
		}else{
			result.append(str);
		}
		
		return result.toString();
	}
	
	
}

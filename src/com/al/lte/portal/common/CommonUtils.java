package com.al.lte.portal.common;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;

/**
 * 通用工具类
 * @author ZhangYu
 * @since 2017-06-03
 */
public class CommonUtils {

	/**
	 * 参数非空校验<br>
	 * 空字符串""、null都将返回false，校验成功返回true
	 * @param args
	 * @return
	 */
	public static boolean checkParam(String... args){
		boolean result = true;
		
		if(args == null || ArrayUtils.isEmpty(args)){
			result = false;
		} else{
			for(int i = 0; i < args.length && result; i++){
				result = StringUtils.isNotBlank(args[i]);
			}
		}
		
		return result;
	}
}

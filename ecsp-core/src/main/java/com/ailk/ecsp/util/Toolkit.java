package com.ailk.ecsp.util;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.apache.commons.lang.StringUtils;
import org.slf4j.helpers.FormattingTuple;
import org.slf4j.helpers.MessageFormatter;
public class Toolkit {

	/**
	 * 判断字串是否空字串
	 * @param str
	 * @return
	 */
	public static boolean isEmptyStr(String str){
		
		if (str == null) {
			return true;
		}else if ("".equals(str)) {
			return true;
		}else {
			if ("null".equals(str.trim())) {
				return true;
			}
			return false;
		}
	}
	
	/**
	 * 生成随机码
	 * @param m
	 * @return
	 */
	public static String getRandomNuber(int m){
		
		Random rd = new Random();
		
		String randomnumber = "";
		
		int number =  1;
		for (int i = 0; i < m -1; i++) {
			number *=10;
		}
		randomnumber = String.valueOf(rd.nextInt(number))+ number;
		
		return randomnumber.substring(0, m);
		
	}
	
	
	
	/**
	 * 生成服务流水
	 * @return
	 */
	public static String getServiceSerialNumber(){
		
		return "SP"+DateUtil.nowDate("yyyyMMddHHmmssSSS")+getRandomNuber(4);
		
	}
	
	/**
	 * 生成业务流水
	 * @param protal_code
	 * @return
	 */
	public static String getBusiSerialNumber(String protal_code){
		
		return protal_code+DateUtil.nowDate("yyyyMMddHHmmssSSS")+getRandomNuber(4);
	}
	
	/**
	 * 生成操作流水
	 * @param protal_code
	 * @return
	 */
	public static String getOperationSerialNumber(String protal_code){
		
		return "OP"+protal_code+DateUtil.nowDate("yyyyMMddHHmmssSSS")+getRandomNuber(4);
	}
	
	public static void printMsg(Object obj){
		System.err.println("[服务平台信息] " + obj );
	}

	public static void printMsg(String msg,Object ...objs ){
		FormattingTuple ft = MessageFormatter.arrayFormat(msg, objs);
		System.err.println("[服务平台信息] " + ft.getMessage());
	}
	

}

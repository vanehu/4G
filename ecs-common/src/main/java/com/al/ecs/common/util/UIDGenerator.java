package com.al.ecs.common.util;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;


/**
 * 序列号生成,生成唯一的号.
 * 
 * @author tang
 */
public class UIDGenerator {

	/** 对象锁 */
	private static final UIDGenerator LOCK = new UIDGenerator();
	/** 随机数类 */
	private static String randomClass = SecureRandom.class.getName();
	/** 数:4 */
	private static final  int INT_4= 4;
	/** 数:8 */
	private static final  int INT_8= 8;
	/** 数:8 */
	private static final  int INT_6= 6;
	/** 数:10 */
	private static final  int INT_10= 10;
	/** 数:10000 */
	private static final  int INT_10000 = 10000;
	/** 数:0xf0 */
	private static final  int HEX_0XF0= 0xf0;
	/** 数:0x0f */
	private static final  int HEX_0X0F= 0x0f;
	/** 数:262144 */
	private static final  int INT_262144 = 262144;
	


	/**
	 *  UUID.randomUUID 36位数,含有_.
	 *  @return  String 36位数
	 */
	public static String generatorUUID() {
		UUID uuid = UUID.randomUUID();
		return uuid.toString();
	}
	/**
	 *  UUID.randomUUID 42位数,含有_.
	 *  @return  String 42位数
	 */
	public static String generatorUUIDYMD() {
		StringBuilder uid = new StringBuilder(DateFormatUtils.format(new Date(), "yyMMdd"));
		uid.append(UUID.randomUUID().toString());
		return uid.toString();
	}

	/**
	 *  UUID.randomUUID 32位数,没有有_.
	 *  @return  String 32位数
	 */
	public static String generatorUID() {
		UUID uuid = UUID.randomUUID();
		return uuid.toString().replaceAll("-", "");
	}

	/**
	 *  UUID.randomUUID 41位数,没有_.
	 *  @return  String 41位数
	 */
	public static String generatorUIDYMD() {
		StringBuilder uid = new StringBuilder(DateFormatUtils.format(new Date(), "yyMMdd"));
		uid.append(generatorUID());
		return uid.toString();
	}
	/**
	 * 16位数, yyMMdd-HHmmss-3位随机数.
	 * @return  String 16位数
	 */
	public static String getUIDByTime() {
		synchronized (LOCK) {
			String time = DateFormatUtils.format(new Date(), "yyMMdd-HHmmss-");
			return time + String.valueOf((int) (Math.random() * INT_10000));
		}
	}
	
	/**
	 * 18位数, yyMMdd-HHmmss-3位随机数.
	 * @return  String 18位数
	 */
	public static String getUUIDByTime() {
		synchronized (LOCK) {
			String time = DateFormatUtils.format(new Date(), "yyyyMMdd-HHmmss-");
			return time + String.valueOf((int) (Math.random() * INT_10000));
		}
	}
	
	/**
	 * 18位数, yyMMdd-HHmmss-3位随机数.
	 * @return  String 18位数
	 */
	public static String getUIDByTimeRand() {
		synchronized (LOCK) {
			String time = DateFormatUtils.format(new Date(), "yyMMddHHmmssSSS");
			return time + String.valueOf((int) (Math.random() * INT_10000));
		}
	}
	
	/**
	 * 15位日期加8位随机数<br>
	 * 日期格式yyMMddHHmmssSSS
	 * @return
	 */
	public static String getRand() {
		synchronized (LOCK) {
			String time = DateFormatUtils.format(new Date(), "yyMMddHHmmssSSS");
			return time + RandomStringUtils.randomNumeric(INT_8);
		}
	}

	/**
	 * 生成门户业务流水号.
	 * <P>
	 * 一个操作流水号，可对多个业务流水号
	 *  平台编码+服务编码 code+date+4位随机正整数
	 * <P>
	 * @param platform 平台编码
	 * @param code 服务编码 code+date+4位随机正整数
	 * @return String 门户操作流水号
	 */
	public static String generaFlowNum(String platform,String code) {
		StringBuffer returnStr = new StringBuffer(platform);
		returnStr.append(code);
		String date = DateUtil.getNow(DateUtil.DATE_FORMATE_STRING_K);
		returnStr.append(date);
		return returnStr.toString();
	}
	
	/**
	 * 生成门户业务流水号.
	 * <P>
	 * 一个操作流水号，可对多个业务流水号
	 *  操作编码 code+date+4位随机正整数
	 * <P>
	 * @param code 服务编码 code+date+4位随机正整数
	 * @return String 门户操作流水号
	 */
	public static String generaFlowNum(String code) {
		StringBuffer returnStr = new StringBuffer(code);
		returnStr.append("_");
		String date = DateUtil.getNow(DateUtil.DATE_FORMATE_STRING_K);
		returnStr.append(date);
		return returnStr.toString();
	}
	
	/**
	 * Generate a once time token (nonce) for authenticating subsequent
	 * requests. This will also add the token to the session. The nonce
	 * generation is a simplified version of ManagerBase.generateSessionId().
	 * @return String 坠机数，类似session id随机数据,16位
	 * @throws ClassNotFoundException 
	 * @throws IllegalAccessException 
	 * @throws InstantiationException 
	 * 
	 */
	public static  String generateNonce() throws ClassNotFoundException,
	InstantiationException, IllegalAccessException {
		// Render the result as a String of hexadecimal digits
		StringBuilder buffer = new StringBuilder();
		Class<?> clazz = Class.forName(randomClass);
		Random randomSource = (Random) clazz.newInstance();
		byte[] randomBytes = new byte[INT_8];
		randomSource.nextBytes(randomBytes);
		for (int j = 0; j < randomBytes.length; j++) {
			byte bO = (byte) ((randomBytes[j] & HEX_0XF0) >> INT_4);
			byte bT = (byte) (randomBytes[j] & HEX_0X0F);
			if (bO < INT_10){
				buffer.append((char) ('0' + bO));
			}else{
				buffer.append((char) ('A' + (bO - INT_10)));
			}
			if (bT < INT_10){
				buffer.append((char) ('0' + bT));
			}else{
				buffer.append((char) ('A' + (bT - INT_10)));
			}
		}

		return buffer.toString();
	}
	
	/**
	 * 16进制数的产生
	 * @param length 长度,偶数,非偶数，以低一位偶数
	 * @return String 坠机数，类似session id随机数据
	 */
	public static  String generateNonceYmd(int length) {
		StringBuilder uid = new StringBuilder(DateFormatUtils.format(new Date(), "yyMMdd"));
		uid.append(generateNonce(length));
		return uid.toString();
	}
	/**
	 * 16进制数的产生
	 * @param length 长度,偶数,非偶数，以低一位偶数
	 * @return String 坠机数，类似session id随机数据
	 */
	public static  String generateNonce(int length) {
		// Render the result as a String of hexadecimal digits
		StringBuilder buffer = new StringBuilder();
		Class<?> clazz=null;
		try {
			clazz = Class.forName(randomClass);
		} catch (ClassNotFoundException e) {
			return getUIDByTimeRand();
		}
		Random randomSource=null;
		try {
			randomSource = (Random) clazz.newInstance();
		} catch (InstantiationException e) {
			return getUIDByTimeRand();
		} catch (IllegalAccessException e) {
			return getUIDByTimeRand();
		}
		byte[] randomBytes = new byte[length/2];
		randomSource.nextBytes(randomBytes);
		for (int j = 0; j < randomBytes.length; j++) {
			byte bO = (byte) ((randomBytes[j] & HEX_0XF0) >> INT_4);
			byte bT = (byte) (randomBytes[j] & HEX_0X0F);
			if (bO < INT_10){
				buffer.append((char) ('0' + bO));
			}else{
				buffer.append((char) ('A' + (bO - INT_10)));
			}
			if (bT < INT_10){
				buffer.append((char) ('0' + bT));
			}else{
				buffer.append((char) ('A' + (bT - INT_10)));
			}
		}

		return buffer.toString();
	}
	/**
	 * 1十进制数的产生
	 * @param length 长度,偶数,非偶数，以低一位偶数
	 * @return String 坠机数，类似session id随机数据
	 */
	public static  String generateDigitNonce(int length) {
		// Render the result as a String of hexadecimal digits
		StringBuilder buffer = new StringBuilder();
		Class<?> clazz=null;
		try {
			clazz = Class.forName(randomClass);
		} catch (ClassNotFoundException e) {
			return getUIDByTimeRand();
		}
		Random randomSource=null;
		try {
			randomSource = (Random) clazz.newInstance();
		} catch (InstantiationException e) {
			return getUIDByTimeRand();
		} catch (IllegalAccessException e) {
			return getUIDByTimeRand();
		}
		byte[] randomBytes = new byte[length/2];
		randomSource.nextBytes(randomBytes);
		for (int j = 0; j < randomBytes.length; j++) {
			byte bO = (byte) ((randomBytes[j] & HEX_0XF0) >> INT_4);
			byte bT = (byte) (randomBytes[j] & HEX_0X0F);
			if (bO < INT_10){
				buffer.append((char) ('0' + bO));
			}else{
				buffer.append((char) ('0' +bO - INT_10));
			}
			if (bT < INT_10){
				buffer.append((char) ('0' + bT));
			}else{
				buffer.append((char) ('0' +bT - INT_10));
			}
		}

		return buffer.toString();
	}
	
	/**
	 * 15位日期加6位随机数<br>
	 * 日期格式yyMMddHHmmssSSS
	 * @return
	 */
	public static String getReqNo() {
		synchronized (LOCK) {
			String time = DateFormatUtils.format(new Date(), "yyyyMMddHHmmss");
			return time + RandomStringUtils.randomNumeric(INT_6);
		}
	}

	public static void main(String[] args) {
		List<String> list = new ArrayList<String>();
		boolean flag = false;
		long beginTime = System.currentTimeMillis();
		for (int i = 0; i < 100000; i++) {
			list.add(getRand());
		}
		long usedTime = System.currentTimeMillis() - beginTime;
		System.out.println(usedTime);
		for (int i = 0; i < 100000; i++) {
			if (RandomStringUtils.randomNumeric(8).length() < 8) {
				flag = true;
				break;
			}
		}
		System.out.println(flag);
	}
}

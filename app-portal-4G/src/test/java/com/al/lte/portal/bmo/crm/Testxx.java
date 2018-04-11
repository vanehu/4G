package com.al.lte.portal.bmo.crm;

import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Calendar;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jfree.util.Log;

import com.al.ecs.common.util.CryptoUtils;
import com.ibm.icu.text.SimpleDateFormat;

public class Testxx {

	/** des加密解密所需要的秘钥. */
	private static final byte[] keyBytes = { 64, 100, -32, 117, -3, -39, 22,
			-63, 79, 76, 52, -3, 7, -116, -53, -65, 64, 100, -32, 117, -3, -39,
			22, -63 };

	public static void main(String[] args) {
		//test4();
		String xxx = "����ͻ�";
		toConvert(xxx);
	}

	public static void test1() {
		Date dateNew = new Date();
		System.out.println("DateNow = " + dateNew);
		SimpleDateFormat f = new SimpleDateFormat("yyyyMMddHHmmss");

		Date date = new Date();
		String dateStr = f.format(date);
		System.out.println("DateStr = " + dateStr);

		Calendar darNew = Calendar.getInstance();
		System.out.println("Darnew = " + darNew);

		Calendar c = Calendar.getInstance();
		SimpleDateFormat ff = new SimpleDateFormat("yyyyMMddHHmmss");
		String endTime = ff.format(c.getTime());
		System.out.println("EndTime = " + endTime);

		System.out.println("Time:" + System.currentTimeMillis());
	}

	public static void test2() {
		String IP = null;
		String host = null;

		try {
			InetAddress ia = InetAddress.getLocalHost();
			host = ia.getHostName();// 获取计算机主机名
			IP = ia.getHostAddress();// 获取计算机IP
		} catch (UnknownHostException e) {
			Log.error(e);
		}

		System.out.println(host);
		System.out.println(IP);
	}

	public static void test3() {
		String regex = "(.*?)/";
		Pattern p = Pattern.compile(regex);
		String url = "127.0.0.1:8080/ltePortal/";
		// String url = "crm.189.cn/ltePortal/";
		Matcher m = p.matcher(url);
		while (m.find()) {
			System.out.println(m.group(1));
			// System.out.println(m.group(2));
		}
	}

	public static void test4() {
		String cookieStaffCode = CryptoUtils
				.desEdeDecryptFromHex(
						"6877adda9fc3e298c514a8b204e8e80e1f39687a858af4dcb5e7e511bd7a9dfb5b539356c2ba1528",
						keyBytes);
		System.out.println(cookieStaffCode);
		cookieStaffCode = cookieStaffCode.substring(
				cookieStaffCode.indexOf("_") + 1, cookieStaffCode.length());
		System.out.println(cookieStaffCode);
	}
	
	public static void toConvert(String str){ 
		byte[] bytes = str.getBytes();
		String testStr = null;
		try {
			testStr = new String(bytes,"UTF-8");
			System.out.println(testStr);
		} catch (UnsupportedEncodingException e) {
			Log.error(e);
		}
	}
}

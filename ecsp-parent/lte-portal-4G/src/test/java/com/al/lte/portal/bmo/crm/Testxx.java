package com.al.lte.portal.bmo.crm;

import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Calendar;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.al.ecs.common.util.CryptoUtils;
import com.al.ecs.common.util.MD5Utils;
import com.ibm.icu.text.SimpleDateFormat;

public class Testxx {

	/** des加密解密所需要的秘钥. */
	public static final byte[] keyBytes = { 64, 100, -32, 117, -3, -39, 22,
			-63, 79, 76, 52, -3, 7, -116, -53, -65, 64, 100, -32, 117, -3, -39,
			22, -63 };

	public static void main(String[] args) {
		//test4();
//		String xxx = "����ͻ�";
//		toConvert(xxx);
		String str  = "171025-094715-2683{\"orderList\":{\"orderListInfo\":{\"isTemplateOrder\":\"N\",\"templateType\":1,\"shareArea\":\"\",\"staffId\":\"5176843\",\"channelId\":\"1385688\",\"areaId\":\"8320400\",\"partyId\":\"700000644752\",\"olTypeCd\":11,\"actionFlag\":3,\"custOrderAttrs\":[{\"itemSpecId\":\"800000036\",\"value\":\"1300\"},{\"itemSpecId\":\"8000066\",\"value\":\"1508896031257677\"},{\"itemSpecId\":\"111111199\",\"value\":\"N\"},{\"itemSpecId\":\"111111113\",\"value\":\"2017-10-25 09:46:46\"},{\"itemSpecId\":\"800000046\",\"value\":\"Firefox:49.0\"},{\"itemSpecId\":\"800000047\",\"value\":\"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0\"},{\"itemSpecId\":\"800000048\",\"value\":130000061102},{\"itemSpecId\":\"30010024\",\"value\":14},{\"itemSpecId\":\"30010050\",\"value\":\"2017-10-25 09:46:24\"},{\"itemSpecId\":\"111111196\",\"value\":\"1508896031233826\"}],\"soNbr\":\"1508896031233826\"},\"custOrderList\":[{\"busiOrder\":[{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-3},\"busiObj\":{\"instId\":-3,\"objId\":83032,\"offerTypeCd\":2,\"objName\":\"4G包月流量包201504 100元\",\"accessNumber\":\"17712755267\"},\"boActionType\":{\"actionClassCd\":1200,\"boActionTypeCd\":\"S1\"},\"data\":{\"ooOwners\":[{\"partyId\":\"700000644752\",\"state\":\"ADD\"}],\"ooRoles\":[{\"prodId\":700022219734,\"offerRoleId\":34157,\"objId\":235010000,\"objType\":2,\"relaType\":\"1000\",\"state\":\"ADD\",\"objInstId\":700022219734},{\"prodId\":700022219734,\"offerRoleId\":34157,\"objId\":235010008,\"objType\":4,\"relaType\":\"1001\",\"state\":\"ADD\",\"objInstId\":\"700022220148\"},{\"prodId\":700022219734,\"offerRoleId\":34157,\"objId\":235010003,\"objType\":4,\"relaType\":\"1001\",\"state\":\"ADD\",\"objInstId\":\"700022220138\"}]}},{\"areaId\":\"8320400\",\"busiOrderInfo\":{\"seq\":-4},\"busiObj\":{\"instId\":-4,\"objId\":83129,\"offerTypeCd\":2,\"objName\":\"买一赠一流量包促销2015年5月-促销\",\"accessNumber\":\"17712755267\"},\"boActionType\":{\"actionClassCd\":1200,\"boActionTypeCd\":\"S1\"},\"data\":{\"ooOwners\":[{\"partyId\":\"700000644752\",\"state\":\"ADD\"}],\"ooRoles\":[{\"prodId\":700022219734,\"offerRoleId\":34296,\"objId\":235010000,\"objType\":2,\"relaType\":\"1000\",\"state\":\"ADD\",\"objInstId\":700022219734},{\"prodId\":700022219734,\"offerRoleId\":34296,\"objId\":235010008,\"objType\":4,\"relaType\":\"1001\",\"state\":\"ADD\",\"objInstId\":\"700022220148\"},{\"prodId\":700022219734,\"offerRoleId\":34296,\"objId\":235010003,\"objType\":4,\"relaType\":\"1001\",\"state\":\"ADD\",\"objInstId\":\"700022220138\"}]}}]}]},\"token\":\"\",\"sign\":\"\"}";
		String s = "1@!@!@!@e3ewdsd3\"{\":设计大赛";
		String strs = MD5Utils.encode(str);
		System.out.println(strs.toUpperCase());
		//regTest();
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
			e.printStackTrace();
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
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private static void regTest(){
		String reg = "^8\\d{6}?$";
		System.err.println(Pattern.matches(reg, "1330000"));
		System.err.println(Pattern.matches(reg, "833000a"));
		System.err.println(Pattern.matches(reg, "833000"));
		System.err.println(Pattern.matches(reg, ""));
	}
}

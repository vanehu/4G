package com.al.lte.portal.common;


import java.security.Key;

import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESedeKeySpec;
import javax.crypto.spec.IvParameterSpec;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import com.al.ecs.qrcode.QrCodeImageGen;

public class ThreeDesUtil {
	private int type;
	private String keyStr;
	private String data;
	private String result;
	
	//加密
	public static String encode(String str,String keyString) throws Exception{
//		byte[] key=new BASE64Decoder().decodeBuffer("UWJjZGViZ9hjhgasbW5vcHKyc3R3dad4");
		byte[] key=new BASE64Decoder().decodeBuffer(keyString);
		byte[] data=str.getBytes("UTF-8");
		byte[] str3 = des3EncodeECB(key,data);
		return new BASE64Encoder().encode(str3);
	}
	
	//解密
	public static String decode(String str,String keyString) throws Exception{
		byte[] key=new BASE64Decoder().decodeBuffer(keyString);
		BASE64Decoder base64decoder = new BASE64Decoder(); 
		byte[] encodeByte = base64decoder.decodeBuffer(str); 
		byte[] str4 = ees3DecodeECB(key,encodeByte);
		return new String(str4, "UTF-8");
	}
	
	/**
	 * ECB加密,不要IV
	 * @param key 密钥
	 * @param data 明文
	 * @return Base64编码的密文
	 * @throws Exception
	 */
	public static byte[] des3EncodeECB(byte[] key, byte[] data)
			throws Exception {
		Key deskey = null;
		DESedeKeySpec spec = new DESedeKeySpec(key);
		SecretKeyFactory keyfactory = SecretKeyFactory.getInstance("desede");
		deskey = keyfactory.generateSecret(spec);
		Cipher cipher = Cipher.getInstance("desede" + "/ECB/PKCS5Padding");
		cipher.init(Cipher.ENCRYPT_MODE, deskey);
		byte[] bOut = cipher.doFinal(data);
		return bOut;
	}

	/**
	 * ECB解密,不要IV
	 * @param key 密钥
	 * @param data Base64编码的密文
	 * @return 明文
	 * @throws Exception
	 */
	public static byte[] ees3DecodeECB(byte[] key, byte[] data)
			throws Exception {
		Key deskey = null;
		DESedeKeySpec spec = new DESedeKeySpec(key);
		SecretKeyFactory keyfactory = SecretKeyFactory.getInstance("desede");
		deskey = keyfactory.generateSecret(spec);
		Cipher cipher = Cipher.getInstance("desede" + "/ECB/PKCS5Padding");
		cipher.init(Cipher.DECRYPT_MODE, deskey);
		byte[] bOut = cipher.doFinal(data);
		return bOut;
	}

	/**
	 * CBC加密
	 * @param key 密钥
	 * @param keyiv IV
	 * @param data 明文
	 * @return Base64编码的密文
	 * @throws Exception
	 */
	public static byte[] des3EncodeCBC(byte[] key, byte[] keyiv, byte[] data)
			throws Exception {

		Key deskey = null;
		DESedeKeySpec spec = new DESedeKeySpec(key);
		SecretKeyFactory keyfactory = SecretKeyFactory.getInstance("desede");
		deskey = keyfactory.generateSecret(spec);

		Cipher cipher = Cipher.getInstance("desede" + "/CBC/PKCS5Padding");
		IvParameterSpec ips = new IvParameterSpec(keyiv);
		cipher.init(Cipher.ENCRYPT_MODE, deskey, ips);
		byte[] bOut = cipher.doFinal(data);

		return bOut;
	}

	/**
	 * CBC解密
	 * @param key 密钥
	 * @param keyiv IV
	 * @param data Base64编码的密文
	 * @return 明文
	 * @throws Exception
	 */
	public static byte[] des3DecodeCBC(byte[] key, byte[] keyiv, byte[] data)
			throws Exception {

		Key deskey = null;
		DESedeKeySpec spec = new DESedeKeySpec(key);
		SecretKeyFactory keyfactory = SecretKeyFactory.getInstance("desede");
		deskey = keyfactory.generateSecret(spec);

		Cipher cipher = Cipher.getInstance("desede" + "/CBC/PKCS5Padding");
		IvParameterSpec ips = new IvParameterSpec(keyiv);

		cipher.init(Cipher.DECRYPT_MODE, deskey, ips);

		byte[] bOut = cipher.doFinal(data);

		return bOut;

	}

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}

	public String getKeyStr() {
		return keyStr;
	}

	public void setKeyStr(String keyStr) {
		this.keyStr = keyStr;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}
	
	public static void main(String[] args) throws Exception {

		byte[] key=new BASE64Decoder().decodeBuffer("UWJjZGViZ9hjhgasbW5vcHKyc3R3dad4");
		byte[] keyiv = { 1, 2, 3, 4, 5, 6, 7, 8 };

		byte[] data="CTCT01{NO:8002235,SN:6153024,DP:20151121,FN:孙清,LN:孙清,CT:C,AT:N,BN:10825430045,TN:10825430045,IM:898611142651000,IC:8986111426510000109,VP:8511011000170104,VD:乐享4G合约计划201412 59元30%话补24个月-促销,VM:59,TE:24,PP:Post,SU:N,PR:6088,DI:6088,HP:0,CP:0,CM:6088,TM:6088,CU:RMB}".getBytes("UTF-8");
         String dd = "CTCT01{NO:8002235,SN:6153024,DP:20151121,FN:孙清,LN:孙清,CT:C,AT:N,BN:10825430045,TN:10825430045,IM:898611142651000,IC:8986111426510000109,VP:8511011000170104,VD:乐享4G合约计划201412 59元30%话补24个月-促销,VM:59,TE:24,PP:Post,SU:N,PR:6088,DI:6088,HP:0,CP:0,CM:6088,TM:6088,CU:RMB}";
		System.out.println("ECB加密解密");
		Long start = System.currentTimeMillis();
		System.out.println(start);
		byte[] str3 = des3EncodeECB(key,data );
		Long mod = System.currentTimeMillis();
		System.out.println("-----加密时间："+(mod-start));
		byte[] str4 = ees3DecodeECB(key, str3);
		Long end = System.currentTimeMillis();
		System.out.println("-----解密密时间："+(end-mod));
		System.out.println("-----总时间："+(end-start));
		String a = new BASE64Encoder().encode(str3);
		try {
			//new QrCodeImageGen().encoderQRCode(a,"C:/Michael_QRCode.png","png", 15);
			String RQCode = new QrCodeImageGen().encoderQRCodeToBase64(a,"png", 20);
			System.out.println("data:image/png;base64,"+RQCode);
		} catch (Exception e) {
			System.out.println("sss");
			e.printStackTrace();
		}
		
		
		/*System.out.println();

		System.out.println("CBC加密解密");
		byte[] str5 = des3EncodeCBC(key, keyiv, data);
		byte[] str6 = des3DecodeCBC(key, keyiv, str5);
		System.out.println(new BASE64Encoder().encode(str5));
		System.out.println(new String(str6, "UTF-8"));*/
	}
}
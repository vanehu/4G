package com.al.lte.portal.common;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.KeyGenerator;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import com.al.ecs.log.Log;

public class AESUtil {
	private final static Log log = Log.getLog(AESUtil.class);
	static final public String KEY_VI = "1234567812345678";
	public static final String bm = "UTF-8";
	private static String WAYS = "AES";

	/**
	 * 生成一个固定密钥
	 * 
	 * @param password
	 *            长度必须是16的倍数
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	private static SecretKeySpec toKey(String password)
			throws UnsupportedEncodingException {
		try {
			KeyGenerator kgen = KeyGenerator.getInstance(WAYS);
			kgen.init(128, new SecureRandom(password.getBytes()));
			SecretKey secretKey = kgen.generateKey();
			byte[] enCodeFormat = secretKey.getEncoded();
			return new SecretKeySpec(enCodeFormat, WAYS);
		} catch (Exception e) {
			log.error(e);
		}
		return null;
	}
	
	public static String encryptToString(String cleartext,String dataPassword) {
		try {
			if (dataPassword == null || cleartext == null) {
				return null;
			}
			IvParameterSpec zeroIv = new IvParameterSpec(KEY_VI.getBytes());
			SecretKeySpec key =new SecretKeySpec(dataPassword.getBytes(), "AES");
			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
			cipher.init(Cipher.ENCRYPT_MODE, key, zeroIv);
			byte[] encryptedData = cipher.doFinal(cleartext.getBytes(bm));
			return new String(parseByte2HexStr(encryptedData));
		} catch (NoSuchAlgorithmException e) {
			log.error(e);
		} catch (NoSuchPaddingException e) {
			log.error(e);
		} catch (InvalidKeyException e) {
			log.error(e);
		} catch (UnsupportedEncodingException e) {
			log.error(e);
		} catch (IllegalBlockSizeException e) {
			log.error(e);
		} catch (BadPaddingException e) {
			log.error(e);
		} catch (InvalidAlgorithmParameterException e) {
			log.error(e);
		}
		return null;
	}

	public static String decryptToString(String encrypted,String dataPassword) throws Exception {
		try {
			byte[] byteMi = parseHexStr2Byte(encrypted);
			IvParameterSpec zeroIv = new IvParameterSpec(KEY_VI.getBytes());
			SecretKeySpec key = new SecretKeySpec(dataPassword.getBytes(), "AES");
			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
			cipher.init(Cipher.DECRYPT_MODE, key, zeroIv);
			byte[] decryptedData = cipher.doFinal(byteMi);
			return new String(decryptedData, bm);
		} catch (NoSuchAlgorithmException e) {
			log.error(e);
		} catch (NoSuchPaddingException e) {
			log.error(e);
		} catch (InvalidKeyException e) {
			log.error(e);
		} catch (UnsupportedEncodingException e) {
			log.error(e);
		} catch (IllegalBlockSizeException e) {
			log.error(e);
		} catch (BadPaddingException e) {
			log.error(e);
		} catch (InvalidAlgorithmParameterException e) {
			log.error(e);
		}
		return null;
	}

	/**
	 * 将16进制转换为二进制
	 * 
	 * @param hexStr
	 * @return
	 */
	public static byte[] parseHexStr2Byte(String hexStr) {
		if (hexStr.length() < 1) {
			return null;
		}
		byte[] result = new byte[hexStr.length() / 2];
		for (int i = 0; i < hexStr.length() / 2; i++) {
			int high = Integer.parseInt(hexStr.substring(i * 2, i * 2 + 1), 16);
			int low = Integer.parseInt(hexStr.substring(i * 2 + 1, i * 2 + 2), 16);
			result[i] = (byte) (high * 16 + low);
		}
		return result;
	}

	/**
	 * 将二进制转换成16进制
	 * 
	 * @param buf
	 * @return
	 */
	public static String parseByte2HexStr(byte buf[]) {
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < buf.length; i++) {
			String hex = Integer.toHexString(buf[i] & 0xFF);
			if (hex.length() == 1) {
				hex = '0' + hex;
			}
			sb.append(hex.toUpperCase());
		}
		return sb.toString();
	}

	public static void main(String[] a) throws Exception {
		String content = "crm";
		String password = "FACEKEY_20170210";
		String encryptStr = AESUtil.encryptToString(content,password);
		System.out.println("加密后密文：" + encryptStr);
		String decryptStr = AESUtil.decryptToString(encryptStr,password);
		System.out.println("解密后明文：" + decryptStr);
	}
}
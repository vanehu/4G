package com.al.ecs.common.util;

import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * @author cym
 * @date 2015-10-08
 */
public class MD5Utils {
	/**
	 * Logger for this class
	 */
	// private static final Logger logger = Logger.getLogger(MD5Utils.class);

	/**
	 * MD5 32为加密 与CryptoJS.MD5(CryptoJS.enc.Hex)加密算法对应
	 * 
	 * @param content
	 * @return
	 */
	public static String encode(String content) {
		return encode(content.getBytes());
	}

	/**
	 * MD5 32为加密 与CryptoJS.MD5(CryptoJS.enc.Hex)加密算法对应
	 * 
	 * @param content
	 * @return
	 */
	public static String encode(byte[] data) {
		try {
			MessageDigest digest = MessageDigest.getInstance("MD5");
			digest.update(data);
			return getEncode32(digest);
		} catch (Exception e) {
			// logger.error(e);
		}
		return null;
	}

	/**
	 * HmacMD5 加密与CryptoJS.HmacMD5(CryptoJS.enc.Hex)加密算法对应
	 * 
	 * @param content
	 *            加密字符串
	 * @param salt
	 *            密盐
	 * @return
	 */
	public static String hmacEncode(String content, String salt) {
		try {
			return hmacDigest(content.getBytes("UTF-8"), salt.getBytes("UTF-8"), "HmacMD5");
		} catch (UnsupportedEncodingException e) {
			// logger.error(e);
			throw new RuntimeException(e);
		}
	}

	/**
	 * Hmac 加密
	 * 
	 * @param content
	 *            加密字符串
	 * @param salt
	 *            密盐
	 * @param algo
	 *            hmac类型 -默认HmacMD5
	 * @return
	 */
	public static String hmacEncode(String content, String salt, String algo) {
		return hmacDigest(content.getBytes(), salt.getBytes(), algo);
	}

	/**
	 * 32位加密
	 * 
	 * @param digest
	 * @return
	 */
	private static String getEncode32(MessageDigest digest) {
		StringBuilder builder = new StringBuilder();
		for (byte b : digest.digest()) {
			builder.append(Integer.toHexString((b >> 4) & 0xf));
			builder.append(Integer.toHexString(b & 0xf));
		}
		return builder.toString();
	}

	/**
	 * Hmac 加密
	 * 
	 * @param data
	 *            加密字符串
	 * @param salt
	 *            密盐
	 * @param algo
	 *            hmac类型 -默认HmacMD5
	 * @return
	 */
	private static String hmacDigest(byte[] data, byte[] salt, String algo) {
		if (algo == null || "".equals(algo.trim())) {
			algo = "HmacMD5";
		}
		String digest = null;
		try {
			SecretKeySpec key = new SecretKeySpec(salt, algo);
			Mac mac = Mac.getInstance(algo);
			mac.init(key);

			byte[] bytes = mac.doFinal(data);

			StringBuffer hash = new StringBuffer();
			for (int i = 0; i < bytes.length; i++) {
				String hex = Integer.toHexString(0xFF & bytes[i]);
				if (hex.length() == 1) {
					hash.append('0');
				}
				hash.append(hex);
			}
			digest = hash.toString();
		} catch (InvalidKeyException e) {
			// logger.error(e);
		} catch (NoSuchAlgorithmException e) {
			// logger.error(e);
		}
		return digest;
	}

}

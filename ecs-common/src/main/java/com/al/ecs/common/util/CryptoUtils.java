package com.al.ecs.common.util;

import java.security.GeneralSecurityException;
import java.util.Arrays;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import javax.crypto.spec.DESedeKeySpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * 支持HMAC-SHA1消息签名 及 DES/AES,RSA对称加密的工具类.
 * <BR>
 * 支持Hex与Base64两种编码方式.
 * <P>
 * @author tangzhengyu
 * @version V1.0 2011-12-22
 * @createDate 2011-12-22 下午11:31:00
 * @modifyDate	 tang  2011-12-22<BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class CryptoUtils {

	/** DES key 8位.  */
	private static final String DES = "DES";
	/** DESede key 24位.  */
	private static final String DES_EDE = "DESede";
	/** DESede key 16位.  */
	private static final String AES = "AES";
	/** HmacSHA1 key 20位.  */
	private static final String HMACSHA1 = "HmacSHA1";

	/** RFC2401 160位.  */
	private static final int DEFAULT_HMACSHA1_KEYSIZE = 160;
	/** AES 128位.  */
	private static final int DEFAULT_AES_KEYSIZE = 128;
	/** DES 56位.  */
	private static final int DEFAULT_DES_KEYSIZE = 56;
	/** DESEDE 112或168位.  */
	private static final int DEFAULT_DESEDE_KEYSIZE = 112;
	//-- HMAC-SHA1 funciton --//
	/**
	 * 使用HMAC-SHA1进行消息签名, 返回字节数组,长度为20字节.
	 * <P>
	 * @param input 原始输入字符串
	 * @param keyBytes HMAC-SHA1密钥
	 * @return byte[] 回参
	 */
	public static byte[] hmacSha1(String input, byte[] keyBytes) {
		try {
			SecretKey secretKey = new SecretKeySpec(keyBytes, HMACSHA1);
			Mac mac = Mac.getInstance(HMACSHA1);
			mac.init(secretKey);
			return mac.doFinal(input.getBytes());
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Security exception", e);
		}
	}

	/**
	 * 使用HMAC-SHA1进行消息签名, 返回Hex编码的结果,长度为40字符.
	 *	<P>
	 * @param input 原始输入字符串
	 * @param keyBytes HMAC-SHA1密钥
	 * @see #hmacSha1(String, byte[])
	 * @return String 回参
	 */
	public static String hmacSha1ToHex(String input, byte[] keyBytes) {
		byte[] macResult = hmacSha1(input, keyBytes);
		return EncodeUtils.hexEncode(macResult);
	}

	/**
	 * 使用HMAC-SHA1进行消息签名, 返回Base64编码的结果.
	 * <P>
	 * @param input 原始输入字符串
	 * @param keyBytes HMAC-SHA1密钥
	 * @see #hmacSha1(String, byte[])
	 * @return String 回参
	 */
	public static String hmacSha1ToBase64(String input, byte[] keyBytes) {
		byte[] macResult = hmacSha1(input, keyBytes);
		return EncodeUtils.base64Encode(macResult);
	}

	/**
	 * 使用HMAC-SHA1进行消息签名, 返回Base64编码的URL安全的结果.
	 * <P>
	 * @param input 原始输入字符串
	 * @param keyBytes HMAC-SHA1密钥
	 * @see #hmacSha1(String, byte[])
	 * @return String 回参
	 */
	public static String hmacSha1ToBase64UrlSafe(String input, byte[] keyBytes) {
		byte[] macResult = hmacSha1(input, keyBytes);
		return EncodeUtils.base64UrlSafeEncode(macResult);
	}

	/**
	 * 校验Hex编码的HMAC-SHA1签名是否正确.
	 * <P>
	 * @param hexMac Hex编码的签名
	 * @param input 原始输入字符串
	 * @param keyBytes 密钥
	 * @return boolean true:正确
	 */
	public static boolean isHexMacValid(String hexMac, String input, byte[] keyBytes) {
		byte[] expected = EncodeUtils.hexDecode(hexMac);
		byte[] actual = hmacSha1(input, keyBytes);

		return Arrays.equals(expected, actual);
	}

	/**
	 * 校验Base64/Base64URLSafe编码的HMAC-SHA1签名是否正确.
	 * <P>
	 * @param baseMac Base64/Base64URLSafe编码的签名
	 * @param input 原始输入字符串
	 * @param keyBytes 密钥
	 * @return boolean true:正确
	 */
	public static boolean isBase64MacValid(String baseMac, String input,
			byte[] keyBytes) {
		byte[] expected = EncodeUtils.base64Decode(baseMac);
		byte[] actual = hmacSha1(input, keyBytes);

		return Arrays.equals(expected, actual);
	}

	/**
	 * 生成HMAC-SHA1密钥,返回字节数组,长度为160位(20字节).
	 * <BR>
	 * HMAC-SHA1算法对密钥无特殊要求, RFC2401建议最少长度为160位(20字节).
	 * <P>
	 * @return byte[]  HMAC-SHA1密钥
	 */
	public static byte[] generateMacSha1Key() {
		try {
			KeyGenerator keyGenerator = KeyGenerator.getInstance(HMACSHA1);
			keyGenerator.init(DEFAULT_HMACSHA1_KEYSIZE);
			SecretKey secretKey = keyGenerator.generateKey();
			return secretKey.getEncoded();
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Security exception", e);
		}
	}

	/**
	 * 生成HMAC-SHA1密钥, 返回Hex编码的结果,长度为40字符. 
	 * <P>
	 * @see #generateMacSha1Key()
	 * @return byte[]  HMAC-SHA1密钥
	 */
	public static String generateMacSha1HexKey() {
		return EncodeUtils.hexEncode(generateMacSha1Key());
	}

	//-- DES function --//
	/**
	 * 使用DES加密原始字符串, 返回Hex编码的结果.
	 * <P>
	 * @param input 原始输入字符串
	 * @param keyBytes 符合DES要求的密钥
	 * @return String  加密原始字符串
	 */
	public static String desEncryptToHex(String input, byte[] keyBytes) {
		byte[] encryptResult = des(input.getBytes(), keyBytes, Cipher.ENCRYPT_MODE);
		return EncodeUtils.hexEncode(encryptResult);
	}

	/**
	 * 使用DES加密原始字符串, 返回Base64编码的结果.
	 * <P>
	 * @param input 原始输入字符串
	 * @param keyBytes 符合DES要求的密钥
	 * @return String 解密
	 */
	public static String desEncryptToBase64(String input, byte[] keyBytes) {
		byte[] encryptResult = des(input.getBytes(), keyBytes, Cipher.ENCRYPT_MODE);
		return EncodeUtils.base64Encode(encryptResult);
	}

	/**
	 * 使用DES解密Hex编码的加密字符串, 返回原始字符串.
	 * <P>
	 * @param input Hex编码的加密字符串
	 * @param keyBytes 符合DES要求的密钥
	 * @return String 解密
	 */
	public static String desDecryptFromHex(String input, byte[] keyBytes) {
		byte[] decryptResult = des(EncodeUtils.hexDecode(input), keyBytes, Cipher.DECRYPT_MODE);
		return new String(decryptResult);
	}

	/**
	 * 使用DES解密Base64编码的加密字符串, 返回原始字符串.
	 * <P>
	 * @param input Base64编码的加密字符串
	 * @param keyBytes 符合DES要求的密钥
	 * @return 解密
	 */
	public static String desDecryptFromBase64(String input, byte[] keyBytes) {
		byte[] decryptResult = des(EncodeUtils.base64Decode(input), keyBytes, Cipher.DECRYPT_MODE);
		return new String(decryptResult);
	}

	/**
	 * 使用DES加密或解密无编码的原始字节数组, 返回无编码的字节数组结果.
	 * <P>
	 * @param inputBytes 原始字节数组
	 * @param keyBytes 符合DES要求的密钥
	 * @param mode Cipher.ENCRYPT_MODE 或 Cipher.DECRYPT_MODE
	 * @return byte[] 无编码的字节数组结果
	 */
	private static byte[] des(byte[] inputBytes, byte[] keyBytes, int mode) {
		try {
			DESKeySpec desKeySpec = new DESKeySpec(keyBytes);
			SecretKeyFactory keyFactory = SecretKeyFactory.getInstance(DES);
			SecretKey secretKey = keyFactory.generateSecret(desKeySpec);

			Cipher cipher = Cipher.getInstance(DES);
			cipher.init(mode, secretKey);
			return cipher.doFinal(inputBytes);
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Security exception", e);
		}
	}

	//-- DESEde function --//
	/**
	 * 使用DESEde加密原始字符串, 返回Hex编码的结果.
	 * 
	 * @param input 原始输入字符串
	 * @param keyBytes 符合DESEde要求的密钥
	 * @return String  Hex编码的结果
	 */
	public static String desEdeEncryptToHex(String input, byte[] keyBytes) {
		byte[] encryptResult = desEde(input.getBytes(), keyBytes, Cipher.ENCRYPT_MODE);
		return EncodeUtils.hexEncode(encryptResult);
	}

	/**
	 * 使用DESEde加密原始字符串, 返回Base64编码的结果.
	 * <P>
	 * @param input 原始输入字符串
	 * @param keyBytes 符合DES要求的密钥
	 * @return String  Base64编码的结果
	 */
	public static String desEdeEncryptToBase64(String input, byte[] keyBytes) {
		byte[] encryptResult = desEde(input.getBytes(), keyBytes, Cipher.ENCRYPT_MODE);
		return EncodeUtils.base64Encode(encryptResult);
	}

	/**
	 * 使用DESEde解密Hex编码的加密字符串, 返回原始字符串.
	 * <P>
	 * @param input Hex编码的加密字符串
	 * @param keyBytes 符合DES要求的密钥
	 * @return String 原始字符串
	 */
	public static String desEdeDecryptFromHex(String input, byte[] keyBytes) {
		byte[] decryptResult = desEde(EncodeUtils.hexDecode(input), keyBytes, Cipher.DECRYPT_MODE);
		return new String(decryptResult);
	}

	/**
	 * 使用DESEde解密Base64编码的加密字符串, 返回原始字符串.
	 * <P>
	 * @param input Base64编码的加密字符串
	 * @param keyBytes 符合DES要求的密钥
	 * @return String 原始字符串
	 */
	public static String desEdeDecryptFromBase64(String input, byte[] keyBytes) {
		byte[] decryptResult = desEde(EncodeUtils.base64Decode(input), keyBytes, Cipher.DECRYPT_MODE);
		return new String(decryptResult);
	}
	/**
	 * 使用3DESede加密或解密无编码的原始字节数组, 返回无编码的字节数组结果.
	 * <P>
	 * @param inputBytes 原始字节数组
	 * @param keyBytes 符合3DES要求的密钥
	 * @param mode Cipher.ENCRYPT_MODE 或 Cipher.DECRYPT_MODE
	 * @return byte[] 无编码的字节数组结果
	 */
	private static byte[] desEde(byte[] inputBytes, byte[] keyBytes, int mode) {
		try {
			DESedeKeySpec desKeySpec = new DESedeKeySpec(keyBytes);
			SecretKeyFactory keyFactory = SecretKeyFactory.getInstance(DES_EDE);
			SecretKey secretKey = keyFactory.generateSecret(desKeySpec);

			Cipher cipher = Cipher.getInstance(DES_EDE);
			cipher.init(mode, secretKey);
			return cipher.doFinal(inputBytes);
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Security exception", e);
		}
	}
	/**
	 * 生成符合DES要求的密钥, 长度为64位(8字节).
	 * <P>
	 * @return byte[] 长度为64位(8字节)
	 */
	public static byte[] generateDesKey() {
		try {
			KeyGenerator keyGenerator = KeyGenerator.getInstance(DES);
			keyGenerator.init(DEFAULT_DES_KEYSIZE);
			SecretKey secretKey = keyGenerator.generateKey();
			return secretKey.getEncoded();
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Security exception", e);
		}
	}
	/**
	 * 生成符合DES EDE要求的密钥, 长度为112位(14字节).
	 * <P>
	 * @return byte[] 长度为112位(14字节).
	 */
	public static byte[] generateDesEdeKey() {
		try {
			KeyGenerator keyGenerator = KeyGenerator.getInstance(DES_EDE);
			keyGenerator.init(DEFAULT_DESEDE_KEYSIZE);
			SecretKey secretKey = keyGenerator.generateKey();
			return secretKey.getEncoded();
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Security exception", e);
		}
	}

	/**
	 * 生成符合DES要求的Hex编码密钥, 长度为16字符.
	 * <P>
	 *  @return byte[] 长度为6字符
	 */
	public static String generateDesHexKey() {
		return EncodeUtils.hexEncode(generateDesKey());
	}

	//-- AES funciton --//
	/**
	 * 使用AES加密原始字符串, 返回Hex编码的结果.
	 * <P>
	 * @param input 原始输入字符串
	 * @param keyBytes 符合AES要求的密钥
	 * @return String Hex编码的结果.
	 */
	public static String aesEncryptToHex(String input, byte[] keyBytes) {
		byte[] encryptResult = aes(input.getBytes(), keyBytes, Cipher.ENCRYPT_MODE);
		return EncodeUtils.hexEncode(encryptResult);
	}

	/**
	 * 使用AES加密原始字符串, 返回Base64编码的结果.
	 * <P>
	 * @param input 原始输入字符串
	 * @param keyBytes 符合AES要求的密钥
	 * @return String Base64编码的结果.
	 */
	public static String aesEncryptToBase64(String input, byte[] keyBytes) {
		byte[] encryptResult = aes(input.getBytes(), keyBytes, Cipher.ENCRYPT_MODE);
		return EncodeUtils.base64Encode(encryptResult);
	}

	/**
	 * 使用AES解密Hex编码的加密字符串, 返回原始字符串.
	 * <P>
	 * @param input Hex编码的加密字符串
	 * @param keyBytes 符合AES要求的密钥
	 * @return String 结果.
	 */
	public static String aesDecryptFromHex(String input, byte[] keyBytes) {
		byte[] decryptResult = aes(EncodeUtils.hexDecode(input), keyBytes, Cipher.DECRYPT_MODE);
		return new String(decryptResult);
	}

	/**
	 * 使用AES解密Base64编码的加密字符串, 返回原始字符串.
	 * <P>
	 * @param input Base64编码的加密字符串
	 * @param keyBytes 符合AES要求的密钥
	 * @return String 结果.
	 */
	public static String aesDecryptFromBase64(String input, byte[] keyBytes) {
		byte[] decryptResult = aes(EncodeUtils.base64Decode(input), keyBytes, Cipher.DECRYPT_MODE);
		return new String(decryptResult);
	}

	/**
	 * 使用AES加密或解密无编码的原始字节数组, 返回无编码的字节数组结果.
	 * <P>
	 * @param inputBytes 原始字节数组
	 * @param keyBytes 符合AES要求的密钥
	 * @param mode Cipher.ENCRYPT_MODE 或 Cipher.DECRYPT_MODE
	 * @return byte[] 无编码的字节数组结果
	 */
	private static byte[] aes(byte[] inputBytes, byte[] keyBytes, int mode) {
		try {
			SecretKey secretKey = new SecretKeySpec(keyBytes, AES);
			Cipher cipher = Cipher.getInstance(AES);
			cipher.init(mode, secretKey);
			return cipher.doFinal(inputBytes);
		} catch (Exception e) {
			throw new IllegalStateException("Security exception", e);
		}
	}

	/**
	 * 生成AES密钥,返回字节数组,长度为128位(16字节).
	 * <P>
	 * @return byte[] 密钥
	 */
	public static byte[] generateAesKey() {
		try {
			KeyGenerator keyGenerator = KeyGenerator.getInstance(AES);
			keyGenerator.init(DEFAULT_AES_KEYSIZE);
			SecretKey secretKey = keyGenerator.generateKey();
			return secretKey.getEncoded();
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Security exception", e);
		}
	}

	/**
	 * 生成AES密钥, 返回Hex编码的结果,长度为32字符. 
	 * <P>
	 * @see #generateMacSha1Key()
	 * @return String
	 */
	public static String generateAesHexKey() {
		return EncodeUtils.hexEncode(generateAesKey());
	}
}

package com.al.lte.portal.common;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.Security;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.KeyGenerator;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

/**
 * 
 * <b>项目名称：</b>servicePack-EssCore<br>
 * <b>类名称：</b>com.linkage.custportal.service.common.AESUtils<br>
 * <b>类描述：</b>AES加密解密工具类<br>
 * <b>创建人：</b>Chenly<br>
 * <b>创建时间：</b>2013-10-12-上午9:54:42<br>
 * <b>@Copyright:</b>2013-亚联
 * 
 */
public class AESUtils {

	/**
	 * AES可以使用128、192、和256位密钥
	 */
	private static int keySize = 128;
	
	private final static String encoding = "UTF-8"; 

	/**
	 * AES+BASE64加密
	 * 
	 * @param content
	 * @param password
	 * @return
	 */
	public static String encryptAES(String content, String password) {
		byte[] encryptResult = encryptToByte(content, password);
		String encryptResultStr = parseByte2HexStr(encryptResult);
		// BASE64位加密
		encryptResultStr = ebotongEncrypto(encryptResultStr);
		return encryptResultStr;
	}

	/**
	 * AES+BASE64解密
	 * 
	 * @param encryptResultStr
	 * @param password
	 * @return
	 */
	public static String decryptAES(String encryptResultStr, String password) {
		// BASE64位解密
		String decrpt = ebotongDecrypto(encryptResultStr);
		byte[] decryptFrom = parseHexStr2Byte(decrpt);
		byte[] decryptResult = decryptToByte(decryptFrom, password);
		return new String(decryptResult);
	}

	/**
	 * 加密字符串
	 */
	public static String ebotongEncrypto(String str) {
		BASE64Encoder base64encoder = new BASE64Encoder();
		String result = str;
		if (str != null && str.length() > 0) {
			try {
				byte[] encodeByte = str.getBytes(encoding);
				result = base64encoder.encode(encodeByte);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		// base64加密超过一定长度会自动换行 需要去除换行符
		return result.replaceAll("\r\n", "").replaceAll("\r", "").replaceAll("\n", "");
	}

	/**
	 * 解密字符串
	 */
	public static String ebotongDecrypto(String str) {
		BASE64Decoder base64decoder = new BASE64Decoder();
		try {
			byte[] encodeByte = base64decoder.decodeBuffer(str);
			return new String(encodeByte);
		} catch (IOException e) {
			e.printStackTrace();
			return str;
		}
	}


	/**
	 * 
	 * <b>方法描述：</b>加密，返回byte[]类型数据<br>
	 * 
	 * @param content
	 *            加密内容
	 * @param password
	 *            加密密码
	 * @return
	 * @since 1.0.0
	 */
	public static byte[] encryptToByte(String content, String password) {
		try {
			if (password == null || content == null) {
				return null;
			}
			KeyGenerator kgen = KeyGenerator.getInstance("AES");
			// 防止linux下 随机生成key
			Security.addProvider(new sun.security.provider.Sun());
			SecureRandom secureRandom = SecureRandom.getInstance("SHA1PRNG",new sun.security.provider.Sun());
			secureRandom.setSeed(password.getBytes());
			kgen.init(keySize, secureRandom);
			SecretKey secretKey = kgen.generateKey();
			byte[] enCodeFormat = secretKey.getEncoded();
			SecretKeySpec key = new SecretKeySpec(enCodeFormat, "AES");
			Cipher cipher = Cipher.getInstance("AES");// 创建密码器
			byte[] byteContent = content.getBytes("utf-8");
			cipher.init(Cipher.ENCRYPT_MODE, key);// 初始化
			byte[] result = cipher.doFinal(byteContent);
			return result; // 加密
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		} catch (NoSuchPaddingException e) {
			e.printStackTrace();
		} catch (InvalidKeyException e) {
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (IllegalBlockSizeException e) {
			e.printStackTrace();
		} catch (BadPaddingException e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 
	 * <b>方法描述：</b>加密，返回String类型数据<br>
	 * 
	 * @param content
	 *            加密内容
	 * @param password
	 *            加密密码
	 * @return
	 * @since 1.0.0
	 */
	public static String encryptToString(String content, String password) {
		try {
			if (password == null || content == null) {
				return null;
			}
			KeyGenerator kgen = KeyGenerator.getInstance("AES");
			// 防止linux下 随机生成key
			Security.addProvider(new sun.security.provider.Sun());
			SecureRandom secureRandom = SecureRandom.getInstance("SHA1PRNG",new sun.security.provider.Sun());
			secureRandom.setSeed(password.getBytes());
			kgen.init(keySize, secureRandom);
			SecretKey secretKey = kgen.generateKey();
			byte[] enCodeFormat = secretKey.getEncoded();
			SecretKeySpec key = new SecretKeySpec(enCodeFormat, "AES");
			Cipher cipher = Cipher.getInstance("AES");// 创建密码器
			byte[] byteContent = content.getBytes("utf-8");
			cipher.init(Cipher.ENCRYPT_MODE, key);// 初始化
			byte[] result = cipher.doFinal(byteContent);
			return parseByte2HexStr(result); // 加密转字符串
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		} catch (NoSuchPaddingException e) {
			e.printStackTrace();
		} catch (InvalidKeyException e) {
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (IllegalBlockSizeException e) {
			e.printStackTrace();
		} catch (BadPaddingException e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 
	 * <b>方法描述：</b>解密，返回byte[]类型数据<br>
	 * 
	 * @param content
	 *            解密内容
	 * @param password
	 *            解密密码
	 * @return
	 * @since 1.0.0
	 */
	public static byte[] decryptToByte(byte[] content, String password) {
		try {
			if (password == null || content == null) {
				return null;
			}

			KeyGenerator kgen = KeyGenerator.getInstance("AES");
			// 需要自己手动设置
			Security.addProvider(new sun.security.provider.Sun());
			SecureRandom random = SecureRandom.getInstance("SHA1PRNG",new sun.security.provider.Sun());
			random.setSeed(password.getBytes());
			kgen.init(keySize, random);
			SecretKey secretKey = kgen.generateKey();
			byte[] enCodeFormat = secretKey.getEncoded();
			SecretKeySpec key = new SecretKeySpec(enCodeFormat, "AES");
			Cipher cipher = Cipher.getInstance("AES");// 创建密码器
			cipher.init(Cipher.DECRYPT_MODE, key);// 初始化
			byte[] result = cipher.doFinal(content);
			return result; // 加密
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		} catch (NoSuchPaddingException e) {
			e.printStackTrace();
		} catch (InvalidKeyException e) {
			e.printStackTrace();
		} catch (IllegalBlockSizeException e) {
			e.printStackTrace();
		} catch (BadPaddingException e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 
	 * <b>方法描述：</b>解密，返回String类型数据<br>
	 * 
	 * @param content
	 *            解密内容
	 * @param password
	 *            解密密码
	 * @return
	 * @since 1.0.0
	 */
	public static String decryptToString(String content, String password) {
		try {
			if (password == null || content == null) {
				return null;
			}

			KeyGenerator kgen = KeyGenerator.getInstance("AES");
			// 需要自己手动设置
			Security.addProvider(new sun.security.provider.Sun());
			SecureRandom random = SecureRandom.getInstance("SHA1PRNG",new sun.security.provider.Sun());
			random.setSeed(password.getBytes());
			kgen.init(keySize, random);
			SecretKey secretKey = kgen.generateKey();
			byte[] enCodeFormat = secretKey.getEncoded();
			SecretKeySpec key = new SecretKeySpec(enCodeFormat, "AES");
			Cipher cipher = Cipher.getInstance("AES");// 创建密码器
			cipher.init(Cipher.DECRYPT_MODE, key);// 初始化
			byte[] decryptFrom = parseHexStr2Byte(content);
			byte[] result = cipher.doFinal(decryptFrom);
			return new String(result); // 加密
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		} catch (NoSuchPaddingException e) {
			e.printStackTrace();
		} catch (InvalidKeyException e) {
			e.printStackTrace();
		} catch (IllegalBlockSizeException e) {
			e.printStackTrace();
		} catch (BadPaddingException e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 将二进制转换成16进制
	 * 
	 * @param buf
	 * @return
	 */
	public static String parseByte2HexStr(byte buf[]) {
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < buf.length; i++) {
			String hex = Integer.toHexString(buf[i] & 0xFF);
			if (hex.length() == 1) {
				hex = '0' + hex;
			}
			sb.append(hex.toUpperCase());
		}
		return sb.toString();
	}

	/**
	 * 将16进制转换为二进制
	 * 
	 * @param hexStr
	 * @return
	 */
	public static byte[] parseHexStr2Byte(String hexStr) {
		if (hexStr.length() < 1)
			return null;
		byte[] result = new byte[hexStr.length() / 2];
		for (int i = 0; i < hexStr.length() / 2; i++) {
			int high = Integer.parseInt(hexStr.substring(i * 2, i * 2 + 1), 16);
			int low = Integer.parseInt(hexStr.substring(i * 2 + 1, i * 2 + 2), 16);
			result[i] = (byte) (high * 16 + low);
		}
		return result;
	}

	public static void main(String[] args) {

		//String content = "{\"staffCode\":\"HUANGYI\",\"staffName\":\"测试\",\"areaId\":\"8330100\",\"areaCode\":\"\",\"areaName\":\"\",\"cityName\":\"杭州市\",\"cityCode\":\"\",\"provinceName\":\"浙江省\",\"provinceCode\":\"8110000\",\"channelCode\":\"89461\",\"systemId\":\"systemId\"}";
		String content = "{\"fromProvFlag\":\"0\",\"provIsale\":\"provIsale\",\"provCustIdentityCd\":\"1\",\"custNumber\":\"custNumber\",\"provCustIdentityNum\":\"352222201505151234\",\"provCustAreaId\":\"provCustAreaId\",\"mainProdOfferId\":\"mainProdOfferId\",\"actionFlag\":\"1\",\"reloadFlag\":\"Y\",\"redirectUri\":\"http://sh.189.cn/redirect\",\"mainPhoneNum\":\"18989898989\",\"newSubPhoneNum\":\"18912345678\",\"oldSubPhoneNum\":\"18911223344,18922334455\",\"isFee\":\"1\"}";
		String password = "TOKEN_8110000_KEY";
		//加密
//		String encryptStr = AESUtils.encryptToString(content, password);
//		System.out.println("加密后密文："+encryptStr);
		String decryptStr = AESUtils.decryptToString("1D2450FFB281EFBEBC9F29FB8475BB0B5B8C7CE51628556B34C45E27E8FB6990FBF1808BD8EDE5AD1C24B20F88827B1C3671C0044619B1F1CC129D4F4A5F46AE5A20CA1E1CC0B1E44C8350E5CE098F8C94486B2F1844A6C1E4031AEEA395E6131FA6A450918CFDE3DFD31B10CBF23EBDF8D6C2A8F65BBEF31627D13713393A3E34A2FBBC6C9F47F1E57CB156E579661563F179DFCAE49828D6C2B42473F9B45D35084FF56EBF1303E329A6F95D4928538E55868EA799E5C37CC9883534866D00DDE5CEF00C28E739129CB8CC8ED6A3A014A3803384C7C3127A53167AF1184A8EED689EBFECC727B88732AB854623AFFB740DA0F5FCBACFEB8B66F7F0CCD14682D2665591010026ABA2C1C5E0EDF84148A4079C5277B02A524C16176690C7893796C46B7C01E3752B6BAF9E03418FB61AAE8DCFE3B0993ED8645E9A99E3A4FF116E788DDC65169826C8C78783120E296DC07E99C0E391630FC369261F8F420CEA0C7E3730CD6E2BFEAF9AA2A126F0773D88047A7637FA30F9AB6B7C4A78650887D8251AF1C15AAE9D2C5E736489E818DA", password);
		System.out.println("解密后明文："+decryptStr);

	}
}

package com.linkage.portal.service.lte;



import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;

public class HexUtil {

	private static final Logger logger = Logger.getLogger(HexUtil.class);

	private static final char[] hexChar = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e',
			'f' };

	private static final String hexStr = "0123456789abcdef";

	private static final Map<Character, Character> hexMap = new HashMap<Character, Character>();

	/**
	 * 判断目标字符串是否为HEX(16进制)编码
	 */
	public static boolean isHexString(String hexString) {
		hexString = hexString.trim();
		String desHex = new String(hexString.toLowerCase());
		if (hexMap.isEmpty()) {
			synchronized (HexUtil.class) {
				if (hexMap.isEmpty()) {
					for (int h = 0; h < hexStr.length(); h++) {
						hexMap.put(hexStr.charAt(h), hexStr.charAt(h));
					}
				}
			}

		}

		for (int i = 0; i < desHex.length(); i++) {
			if (hexMap.get(desHex.charAt(i)) == null) {
				logger.warn("第[" + i + "]字符[" + desHex.charAt(i) + "]不合法!完整内容[" + hexString + "],hexMap[" + hexMap
						+ "]");
				return false;
			}
		}

		return true;
	}

	/**
	 * 单字节转HEX(16进制)字符串
	 */
	public static String byteToHex(byte b) {
		return String.valueOf(hexChar[(b >> 4) & 0xf]).concat(String.valueOf(hexChar[(b) & 0xf]));
	}

	/**
	 * ascii字符串转HEX(16进制)字符串
	 */
	public static String convertAsciiToHexString(String data, String encode) throws UnsupportedEncodingException {
		if (encode == null) {
			return conventBytesToHexString(data.getBytes());
		} else {
			return conventBytesToHexString(data.getBytes(encode));
		}
	}

	/**
	 * 字节数组转HEX(16进制)字符串
	 */
	public static String conventBytesToHexString(byte[] data) {
		return convertBytesToHexString(data, 0, data.length);
	}

	/**
	 * 指定字节数组转HEX(16进制)字符串
	 */
	private static String convertBytesToHexString(byte[] data, int offset, int length) {
		StringBuffer sBuf = new StringBuffer();
		for (int i = offset; i < length; i++) {
			sBuf.append(hexChar[(data[i] >> 4) & 0xf]);
			sBuf.append(hexChar[data[i] & 0xf]);
		}
		return sBuf.toString();
	}

	/**
	 * HEX(16进制)字符串转字节数组
	 */
	public static byte[] convertHexStringToBytes(String hexString) {
		return convertHexStringToBytes(hexString, 0, hexString.length());
	}

	/**
	 * HEX(16进制)字符串转字节数组(指定编码)
	 */
	public static String convertHexToAsciiString(String hexString, String encode) throws UnsupportedEncodingException {
		return new String(convertHexStringToBytes(hexString, 0, hexString.length()), encode);
	}

	/**
	 * 指定长度HEX(16进制)字符串转字节数组
	 */
	private static byte[] convertHexStringToBytes(String hexString, int offset, int endIndex) {
		byte[] data;
		String realHexString = hexString.substring(offset, endIndex).toLowerCase();
		if ((realHexString.length() % 2) == 0)
			data = new byte[realHexString.length() / 2];
		else
			data = new byte[(int) Math.ceil(realHexString.length() / 2d)];

		int j = 0;
		char[] tmp;
		for (int i = 0; i < realHexString.length(); i += 2) {
			try {
				tmp = realHexString.substring(i, i + 2).toCharArray();
			} catch (StringIndexOutOfBoundsException siob) {
				tmp = (realHexString.substring(i) + "0").toCharArray();
			}
			data[j] = (byte) ((Arrays.binarySearch(hexChar, tmp[0]) & 0xf) << 4);
			data[j++] |= (byte) (Arrays.binarySearch(hexChar, tmp[1]) & 0xf);
		}

		for (int i = realHexString.length(); i > 0; i -= 2) {

		}
		return data;
	}
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		try {
			System.out.println(convertAsciiToHexString("d7f0beb4b5c4d4b1b9a4a3acc4fab5c4b9a4bac5c3dcc2ebcac7313233343536a3acbda8d2e9c4fad4dab5dad2bbb4ceb5c7c2bccab1d0deb8c4c4fab5c4c3dcc2eba3acb2a2cdd7c9c6b1a3b4e6a3acd0bbd0bba3a1a3a85858d4cbd3aac9cca3a9", "gbk"));
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}

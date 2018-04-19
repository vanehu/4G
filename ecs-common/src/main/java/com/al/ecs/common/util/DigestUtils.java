/**
 * Copyright (c) 2005-2009 springside.org.cn
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * 
 * $Id: DigestUtils.java 799 2009-12-31 15:34:10Z calvinxiu $
 */
package com.al.ecs.common.util;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;

/**
 * 支持SHA-1/MD5消息摘要的工具类.
 * <BR>
 * 支持Hex与Base64两种编码方式.
 * <P>
 * @author tangzhengyu
 */
public class DigestUtils {

	/** SHA1. */
	private static final String SHA1 = "SHA-1";
	/** MD5. */
	private static final String MD5 = "MD5";

	//-- String Hash function --//
	/**
	 * 对输入字符串进行sha1散列, 返回Hex编码的结果.
	 * <P>
	 * @param input 输入字符串
	 * @return  String  输出字符串
	 */
	public static String sha1ToHex(String input) {
		byte[] digestResult = digest(input, SHA1);
		return EncodeUtils.hexEncode(digestResult);
	}

	/**
	 * 对输入字符串进行sha1散列, 返回Base64编码的结果.
	 * <P>
	 * @param input 输入字符串
	 * @return  String  输出字符串
	 */
	public static String sha1ToBase64(String input) {
		byte[] digestResult = digest(input, SHA1);
		return EncodeUtils.base64Encode(digestResult);
	}

	/**
	 * 对输入字符串进行sha1散列, 返回Base64编码的URL安全的结果.
	 * <P>
	 * @param input 输入字符串
	 * @return  String  输出字符串
	 */
	public static String sha1ToBase64UrlSafe(String input) {
		byte[] digestResult = digest(input, SHA1);
		return EncodeUtils.base64UrlSafeEncode(digestResult);
	}
	
	/**
	 * 对字符串进行散列, 支持md5与sha1算法.
	 * <P>
	 * @param input 输入字符串
	 * @param algorithm 算法
	 * @return  byte[]  输出字符串
	 */
	private static byte[] digest(String input, String algorithm) {
		try {
			MessageDigest messageDigest = MessageDigest.getInstance(algorithm);
			return messageDigest.digest(input.getBytes());
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Security exception", e);
		}
	}

	//-- File Hash function --//
	/**
	 * 对文件进行md5散列,返回Hex编码结果.
	 * <P>
	 * @param input 输入字符串
	 * @return  String  输出字符串
	 */
	public static String md5ToHex(InputStream input) throws IOException {
		return digest(input, MD5);
	}

	/**
	 * 对文件进行sha1散列,返回Hex编码结果.
	 * <P>
	 * @param input 输入字符串
	 * @return  String  输出字符串
	 */
	public static String sha1ToHex(InputStream input) throws IOException {
		return digest(input, SHA1);
	}

	/**
	 * 对文件进行散列, 支持md5与sha1算法.
	 * <P>
	 * @param input 输入字符串
	 * @param algorithm 算法
	 * @return  String  输出字符串
	 */
	private static String digest(InputStream input, String algorithm) throws IOException {
		try {
			MessageDigest messageDigest = MessageDigest.getInstance(algorithm);
			int bufferLength = 1024;
			byte[] buffer = new byte[bufferLength];
			int read = input.read(buffer, 0, bufferLength);

			while (read > -1) {
				messageDigest.update(buffer, 0, read);
				read = input.read(buffer, 0, bufferLength);
			}

			return EncodeUtils.hexEncode(messageDigest.digest());

		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Security exception", e);
		}
	}
	
	/**
	 * 生成加密的密码
	 */
	public static String encryptPassword(String password){
		String returnString = null;
		try {
			byte[] digestc = null;
			java.security.MessageDigest algc = java.security.MessageDigest.getInstance("MD5");
			algc.update(password.getBytes());
			digestc = algc.digest();
			returnString = EncodeUtils.hexEncode(digestc);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return returnString;
	}
}

package com.al.lte.portal.common;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.net.util.Base64;

import com.al.common.exception.BaseException;

public class AESDecUtil {
	static final String AES_KEY_STR = new String("2016SO-niubility");// AES秘钥
	static final String AES_CBS_IV_PARAM = new String("SO IS NIUBILITY!");// IV向量参数

	/**
	 * AES解密
	 * 
	 * @author Zeusier
	 * @param sSrc
	 * @return
	 */
	public static String aesDecrypt(String sSrc) {
		String sKey = AES_KEY_STR;
		try {
			if (sKey == null || sKey.length() != 16) {
				throw new BaseException("秘钥为空或者长度不对!");// AES加密，秘钥长度需为16
			}
			byte[] raw = sKey.getBytes();
			SecretKeySpec skeySpec = new SecretKeySpec(raw, "AES");
			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");// "算法/模式/补码方式"
			IvParameterSpec iv = new IvParameterSpec(AES_CBS_IV_PARAM.getBytes());// 使用CBC模式，需要一个向量iv，可增加加密算法的强度
			cipher.init(Cipher.DECRYPT_MODE, skeySpec, iv);
			byte[] sSrcBytes = Base64.decodeBase64(sSrc);// Base64解码
			byte[] encrypted = cipher.doFinal(sSrcBytes);
			return new String(encrypted, "UTF-8");
		} catch (InvalidKeyException e) {
			throw new BaseException("解密异常:", e);
		} catch (NoSuchAlgorithmException e) {
			throw new BaseException("解密异常:", e);
		} catch (NoSuchPaddingException e) {
			throw new BaseException("解密异常:", e);
		} catch (InvalidAlgorithmParameterException e) {
			throw new BaseException("解密异常:", e);
		} catch (IllegalBlockSizeException e) {
			throw new BaseException("解密异常:", e);
		} catch (BadPaddingException e) {
			throw new BaseException("解密异常:", e);
		} catch (UnsupportedEncodingException e) {
			throw new BaseException("解密异常:", e);
		}
	}

}

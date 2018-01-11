package com.al.lte.portal.common;

import com.al.common.exception.BaseException;
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

public class AESDecUtil {
	static final String AES_KEY_STR = new String("2016SO-niubility");
	static final String AES_CBS_IV_PARAM = new String("SO IS NIUBILITY!");

	public static String aesDecrypt(String sSrc) {
		String sKey = AES_KEY_STR;
		try {
			if ((sKey == null) || (sKey.length() != 16)) {
				throw new BaseException("秘钥为空或者长度不对!");
			}
			byte[] raw = sKey.getBytes();
			SecretKeySpec skeySpec = new SecretKeySpec(raw, "AES");
			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
			IvParameterSpec iv = new IvParameterSpec(AES_CBS_IV_PARAM.getBytes());
			cipher.init(2, skeySpec, iv);
			byte[] sSrcBytes = Base64.decodeBase64(sSrc);
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

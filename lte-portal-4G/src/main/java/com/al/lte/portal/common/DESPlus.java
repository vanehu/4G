package com.al.lte.portal.common;

import java.io.UnsupportedEncodingException;
import java.security.Key;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.digest.DigestUtils;

/**
 * DES加密
 * @author chenfeng
 *
 */
public class DESPlus
{
  private static String strDefaultKey = "national";
  private Cipher encryptCipher = null;
  private Cipher decryptCipher = null;

  public DESPlus()
    throws Exception
  {
    this(strDefaultKey);
  }

  public DESPlus(String strKey)
  {
    try
    {
      Key key = getKey(strKey.getBytes());
      this.encryptCipher = Cipher.getInstance("DES");
      this.encryptCipher.init(1, key);
      this.decryptCipher = Cipher.getInstance("DES");
      this.decryptCipher.init(2, key);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private Key getKey(byte[] arrBTmp)
  {
    byte[] arrB = new byte[8];

    for (int i = 0; (i < arrBTmp.length) && (i < arrB.length); i++) {
      arrB[i] = arrBTmp[i];
    }

    Key key = new SecretKeySpec(arrB, "DES");
    return key;
  }

  public static String byteArr2HexStr(byte[] arrB)
  {
    int iLen = arrB.length;

    StringBuffer sb = new StringBuffer(iLen * 2);
    for (int i = 0; i < iLen; i++) {
      int intTmp = arrB[i];

      while (intTmp < 0) {
        intTmp += 256;
      }

      if (intTmp < 16) {
        sb.append("0");
      }
      sb.append(Integer.toString(intTmp, 16));
    }
    return sb.toString();
  }

  public static byte[] hexStr2ByteArr(String strIn)
  {
    byte[] arrB = strIn.getBytes();
    int iLen = arrB.length;

    byte[] arrOut = new byte[iLen / 2];
    for (int i = 0; i < iLen; i += 2) {
      String strTmp = new String(arrB, i, 2);
      arrOut[(i / 2)] = ((byte)Integer.parseInt(strTmp, 16));
    }
    return arrOut;
  }

  public byte[] encrypt(byte[] arrB)
  {
    byte[] s = (byte[])null;
    try {
      s = this.encryptCipher.doFinal(arrB);
    } catch (IllegalBlockSizeException e) {
      e.printStackTrace();
    } catch (BadPaddingException e) {
      e.printStackTrace();
    }
    return s;
  }

  public String encrypt(String strIn)
  {
    return byteArr2HexStr(encrypt(strIn.getBytes()));
  }

  public byte[] decrypt(byte[] arrB)
  {
    byte[] s = (byte[])null;
    try {
      s = this.decryptCipher.doFinal(arrB);
    } catch (IllegalBlockSizeException e) {
      e.printStackTrace();
    } catch (BadPaddingException e) {
      e.printStackTrace();
    }
    return s;
  }

  public String decrypt(String strIn)
  {
	 byte[] bs = decrypt(hexStr2ByteArr(strIn));
	 String result = null;
	 try {
		 result = new String(bs,"UTF-8");
	} catch (UnsupportedEncodingException e) {
		e.printStackTrace();
	}
     return result;
  }

  public static void main(String[] args) {
    try {
    	//有三个分隔符
    	//des(原文分隔符1原文md5值)
    	//原文 =   项目1 分隔符2 项目2
    	//项目1 = 项目名 分隔符3  项目值
      DESPlus des = new DESPlus(DataSignTool.DES_KEY);
      String item1="aa";
      String item2="bb";
      String a=DataSignTool.SIGN_DATA+DataSignTool.SPLIT_3+item1;
      String b=DataSignTool.COMPANY_SALE+DataSignTool.SPLIT_3+item2;
      String c=a+DataSignTool.SPLIT_2+b;
      String d=c+DataSignTool.SPLIT_1+DigestUtils.md5Hex(c);
      String e=des.encrypt(d);
      System.out.println(e);
      DataSignResultModel ml=DataSignTool.isRightData(e);
      System.out.println(ml.isParseSuccess());
      System.out.println(ml.getItemMap().get(DataSignTool.SIGN_DATA));
      System.out.println(ml.getItemMap().get(DataSignTool.COMPANY_SALE));
      /*String[] nameAndValues = "signdata&-&-aa".split(SSOContext.SPLIT_3);
      System.out.println(nameAndValues[0]);
      System.out.println(nameAndValues[1]);*/
       //ml.setItemMap(ml.getItemMap());
    }
    catch (Exception e) {
      e.printStackTrace();
    }
  }
}
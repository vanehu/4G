package com.al.ecs.common.util;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESedeKeySpec;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

/** 
 * IOS java互通加密方案
 * @author liusd  
 * @date 2013-06-25
 */
@SuppressWarnings("restriction")
public class Des3ForPad {
    //密钥外传，不固定到类中,方便修改
    //private final static String secretKey = "2013%Linkage#Asiainfo123";
    /** 
     * 加密入口
     * @param src 加密原文
     * @param key 密钥
     * @return 
     * @throws Exception  
     */
    public static String encryptThreeDESECB(String src, String key) throws Exception {
        DESedeKeySpec dks = new DESedeKeySpec(key.getBytes("UTF-8"));
        SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DESede");
        SecretKey securekey = keyFactory.generateSecret(dks);

        Cipher cipher = Cipher.getInstance("DESede/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, securekey);
        byte[] b = cipher.doFinal(src.getBytes());

        BASE64Encoder encoder = new BASE64Encoder();
        String mi = encoder.encode(b).replaceAll("\r", "").replaceAll("\n", "");
        mi = mi.replace("=", "dddeeefff");
        mi = mi.replace("+", "aaabbbccc");
        return mi;

    }

    /** 
     * 解密入口
     *  
     * @param encryptText 解密文本
     * @param secretKey 密钥
     * @param iv 密钥
     * @return 
     * @throws Exception 
     */
    public static String decryptThreeDESECB(String src, String key) throws Exception {
        src = src.replace("dddeeefff", "=");
        src = src.replace("aaabbbccc", "+");
        //--通过base64,将字符串转成byte数组
        BASE64Decoder decoder = new BASE64Decoder();
        byte[] bytesrc = decoder.decodeBuffer(src);
        //--解密的key
        DESedeKeySpec dks = new DESedeKeySpec(key.getBytes("UTF-8"));
        SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DESede");
        SecretKey securekey = keyFactory.generateSecret(dks);

        //--Chipher对象解密
        Cipher cipher = Cipher.getInstance("DESede/ECB/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, securekey);
        byte[] retByte = cipher.doFinal(bytesrc);
        //加入编码解决中文问题
        return new String(retByte,"UTF-8");
    }
    public static void main(String[] args) {
        try{
            String key = "2013%Linkage#Asiainfo123";
            String ming = "{\"brand\":\"苹果\"}";
            //String ming ="身份证";
            String mi = Des3ForPad.encryptThreeDESECB(ming, key);
            System.out.println("加密前："+ming);
            String aming = Des3ForPad.decryptThreeDESECB("CXxiR9hr/bA8lgn3WgWp8RzHDJaaabbbcccSCBW5",key);
            System.out.println("加密后："+mi);
            System.out.println(ming.equals(aming));
            System.out.println("---"+aming);
            
        }catch(Exception e){
            e.printStackTrace();
        }
        
        
    }
}

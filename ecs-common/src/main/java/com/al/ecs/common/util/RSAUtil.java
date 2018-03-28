package com.al.ecs.common.util;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.Cipher;

import org.apache.commons.codec.binary.Base64;
public class RSAUtil {
    public static final String KEY_ALGORITHM = "RSA";
    /** 貌似默认是RSA/NONE/PKCS1Padding，未验证 */
    public static final String CIPHER_ALGORITHM = "RSA/ECB/PKCS1Padding";
    public static final String PUBLIC_KEY = "publicKey";
    public static final String PRIVATE_KEY = "privateKey";
    /** RSA密钥长度必须是64的倍数，在512~65536之间。默认是1024 */
    public static final int KEY_SIZE = 1024;
    public static final String PLAIN_TEXT = "PRO_PAY_8310000";
    /*public static void main(String[] args) {
        Map<String, byte[]> keyMap = generateKeyBytes();
        // 加密
        PublicKey publicKey = restorePublicKey(keyMap.get(PUBLIC_KEY));
        String keyStr=byte2hex(keyMap.get(PUBLIC_KEY));
        System.out.println("PUBLIC_KEY: " + keyStr);
        publicKey = restorePublicKey(hex2byte(keyStr));
        byte[] encodedText = RSAEncode(publicKey, PLAIN_TEXT.getBytes());
        System.out.println("RSA encoded: " + Base64.encodeBase64String(encodedText));
        // 解密
        PrivateKey privateKey = restorePrivateKey(keyMap.get(PRIVATE_KEY));
        String keyStr2=byte2hex(keyMap.get(PRIVATE_KEY));
        System.out.println("PRIVATE_KEY: " + keyStr2);
        System.out.println("RSA decoded: "
                + RSADecode(privateKey, encodedText));
    }*/
//    public static void main(String[] args) {
//        Map<String, byte[]> keyMap = generateKeyBytes();
//
//        // 加密        
//        PrivateKey privateKey = restorePrivateKey(keyMap.get(PRIVATE_KEY));
//        String keyStr2=byte2hex(keyMap.get(PRIVATE_KEY));
//        System.out.println("PRIVATE_KEY: " + keyStr2.trim());
//        byte[] encodedText = RSAEncodeByPri(privateKey, PLAIN_TEXT.getBytes());
//        System.out.println("RSA encoded: " + Base64.encodeBase64String(encodedText));
//        
//        // 解密
//        PublicKey publicKey = restorePublicKey(keyMap.get(PUBLIC_KEY));
//        String keyStr=byte2hex(keyMap.get(PUBLIC_KEY));
//        System.out.println("PUBLIC_KEY: " + keyStr.trim());
//        System.out.println("RSA decoded: "  + RSADecodeByPub(publicKey, encodedText));
//    }
    /*public static void main(String[] args) {
		//集团翼销售退款加密
    	String provinceCode = "8120000";
    	String gKey = "305c300d06092a864886f70d0101010500034b003048024100e738c688e669084e9a523c31b179748db82426ca3295b4797bcf9537de62273c417f5e8f69e305f17e77d1943fdea949345474cecd1b5c63c7ed84ea9bcbef0b0203010001";
		PublicKey publicKey = RSAUtil.restorePublicKey(RSAUtil.hex2byte(gKey));
		byte[] encodedText = RSAUtil.RSAEncode(publicKey, provinceCode.getBytes());
        String proKey = Base64.encodeBase64String(encodedText);
        System.out.println("proKey===>>>"+proKey);

        //省份翼销售退款加密
        String reqPlatForm = "YXS8120000";
        String sKey = "30820276020100300d06092a864886f70d0101010500048202603082025c02010002818100a4db3a328b996c62790e994a7e85e757f53b2a282969736acd1f0af74123c60d90033410eb247de1aa3f0409525049d4c15d6cc117cf0f0bbaa81e582035a70e240d3693775619638987f48ffdf2c986d3dba5eec3ac977c1b522c1a55b89e6c9fca6d2319d06fc79f78521086a5eba1b2588c7ccceb911a15b290cd71c388a5020301000102818028c3607f910f2dc2a7a659771713eb214fad027e8dc6da58254230c6f49f70e077a4a3222fd28521e0a3d64eabc0d890b8036ed9cc1651e517916c7763f78047d309c8636ea8161ba55669004bbfd600dc88cc2411bca56e9dc6ec09d87282e72bc63ebcb24d0507af40a92a87a80f6d158969dd3faa0ffaf904ab068de7623d024100efb50a94af181f8f5c2036ba3a51a472501e216dcc50b56f6bc7b396995b951b4bdfd5b8abc28bc0220159974ab81a420f80e2226b1234bdc6d99900c6875967024100b00fc3c66e74c80e0972f3d5f9367bc0219456a131fcffff658956145ae705d8e45ced2673c70886c0446d6f99b1b4eb7a1bbf29f03e604f363989b7e56b2a130240309ddb63848fb3f6f38c650d283edec780905bdf550d197f5bb0c92fc632d8ef0c587d9452e1c64e5597488072db1c1841e4b5f89d16b833b55cf4b73f8cbc090240224a2fbb09f03cb65f28c04cc048d8394750f8be545a0e11d3d8b7a7273d2f6a5aafae907aa41d090191522f162402348a87b4e79a1ecbeb21887b4611ac99790241008b606a9ef5456430b34f823f6079e2ad4261a5aa628c4226913c11b41d14a519cbdf44abd82a6df1af295d6d0ce4b2b0e936a5d5d3a1def44d994733c1ce1c54";
		PrivateKey privateKey = RSAUtil.restorePrivateKey(RSAUtil.hex2byte(sKey));
        byte[] encodedText = RSAUtil.RSAEncodeByPri(privateKey, reqPlatForm.getBytes());
        String proKey = Base64.encodeBase64String(encodedText);
        System.out.println("proKey===>>>"+proKey);
    }*/
    
    public static void main(String[] args) {
    	String gKey = "305c300d06092a864886f70d0101010500034b003048024100e738c688e669084e9a523c31b179748db82426ca3295b4797bcf9537de62273c417f5e8f69e305f17e77d1943fdea949345474cecd1b5c63c7ed84ea9bcbef0b0203010001";
    	String sKey = "30820157020100300d06092a864886f70d0101010500048201413082013d020100024100e738c688e669084e9a523c31b179748db82426ca3295b4797bcf9537de62273c417f5e8f69e305f17e77d1943fdea949345474cecd1b5c63c7ed84ea9bcbef0b0203010001024100dae165177d3e1a4e064a288f4618da5bb9e007144b746a06c24c8c4df9e762891c3ad9092f14b67d4b9bf37cc5ce351cd8f65a0965ab780701aebc27ccfef7d1022100f3ca3bf0cedca65f226133665f6c4f79bb258bfd56ced2d95b2f7de2b9f04803022100f2cd65c8038d5596ff576f80894be26fc08a7781de54c44209305f271b3ba259022100b445e1992a7ec39029ce12c22ae1decb3776865429f2fabbbbd01c98a1c26a9d022100b55ba682d7e461e1ffa817a932e473a67572f8011148cfaf639db5f547ea2b410221008ddda67d8f5bdd3b9754e62f1db7b878f90a8bfcbe502d4f2c2548da8ac3e4f1";
    	String result = "FXzdoVmv+N09fd638HAWG9Vv3h/jq8gLsIO49YwaYgwRQ+Yhho5uIYi0U3+v/THcKeiC80scGhXk4uwjY3r2IA==";
    	PublicKey publicKey = restorePublicKey(hex2byte(gKey));
    	
    	byte[] encodedText = RSAEncode(publicKey, "8320000".getBytes());
        System.out.println("RSA encoded111: " + Base64.encodeBase64String(encodedText));
    	
    	 PrivateKey privateKey = restorePrivateKey(hex2byte(sKey));
    	 System.out.println("RSA decoded: " + RSADecode(privateKey, Base64.decodeBase64(result)));
	}
    // 字符串转二进制
    public static byte[] hex2byte(String str) { 
      if (str == null){
       return null;
      }
      str = str.trim();
      int len = str.length();
      if (len == 0 || len % 2 == 1){
       return null;
      }
      byte[] b = new byte[len / 2];
      try {
    	   for (int i = 0; i < str.length(); i += 2) {
    	    	b[i / 2] = (byte) Integer.decode("0X" + str.substring(i, i + 2)).intValue();
    	   }
    	   return b;
      } catch (Exception e) {
       return null;
      }
    }
 // 二进制转字符串
    public static String byte2hex(byte[] b) 
    {
       StringBuffer sb = new StringBuffer();
       String stmp = "";
       for (int i = 0; i < b.length; i++) {
        stmp = Integer.toHexString(b[i] & 0XFF);
        if (stmp.length() == 1){
        	sb.append("0" + stmp);
        }else{
        	sb.append(stmp);
        }
       }
       return sb.toString();
    }
    /**
     * 生成密钥对。注意这里是生成密钥对KeyPair，再由密钥对获取公私钥
     * 
     * @return
     */
    public static Map<String, byte[]> generateKeyBytes() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator
                    .getInstance(KEY_ALGORITHM);
            keyPairGenerator.initialize(KEY_SIZE);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();
            RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
            RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
            Map<String, byte[]> keyMap = new HashMap<String, byte[]>();
            keyMap.put(PUBLIC_KEY, publicKey.getEncoded());
            keyMap.put(PRIVATE_KEY, privateKey.getEncoded());
            return keyMap;
        } catch (NoSuchAlgorithmException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
    /**
     * 还原公钥，X509EncodedKeySpec 用于构建公钥的规范
     * 
     * @param keyBytes
     * @return
     */
    public static PublicKey restorePublicKey(byte[] keyBytes) {
        X509EncodedKeySpec x509EncodedKeySpec = new X509EncodedKeySpec(keyBytes);
        try {
            KeyFactory factory = KeyFactory.getInstance(KEY_ALGORITHM);
            PublicKey publicKey = factory.generatePublic(x509EncodedKeySpec);
            return publicKey;
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
    /**
     * 还原私钥，PKCS8EncodedKeySpec 用于构建私钥的规范
     * 
     * @param keyBytes
     * @return
     */
    public static PrivateKey restorePrivateKey(byte[] keyBytes) {
        PKCS8EncodedKeySpec pkcs8EncodedKeySpec = new PKCS8EncodedKeySpec(
                keyBytes);
        try {
            KeyFactory factory = KeyFactory.getInstance(KEY_ALGORITHM);
            PrivateKey privateKey = factory
                    .generatePrivate(pkcs8EncodedKeySpec);
            return privateKey;
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
    /**
     * 公钥加密，三步走。
     * 
     * @param key
     * @param plainText
     * @return
     */
    public static byte[] RSAEncode(PublicKey key, byte[] plainText) {
        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            return cipher.doFinal(plainText);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
    /**
     * 私钥解密，三步走。
     * 
     * @param key
     * @param encodedText
     * @return
     */
    public static String RSADecode(PrivateKey key, byte[] encodedText) {
        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);
            return new String(cipher.doFinal(encodedText));
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
    public static byte[] RSAEncodeByPri(PrivateKey key, byte[] plainText) {
        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            return cipher.doFinal(plainText);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
    public static String RSADecodeByPub(PublicKey key, byte[] encodedText) {
        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);
            return new String(cipher.doFinal(encodedText));
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
}
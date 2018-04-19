package com.linkage.portal.service.lte;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Node;

/**
 * 现场写卡工具类
 * @author  
 */
public class WriteCardUtil {
    //现场写卡常量定义
    public static final String DLL_KEY_DECRIPT_KEY = "DLL_KEY_DECRIPT_KEY";//组件鉴权密钥解密密钥
    public static final String AUTH_INFO_ENCRIPT_KEY = "AUTH_INFO_ENCRIPT_KEY";//资源鉴权加密解密密钥
    public static final String CARD_DATA_ENCRIPT_KEY = "CARD_DATA_ENCRIPT_KEY";//资源数据加密解密密钥
    public static final String WRITE_DATA_ENCRIPT_KEY = "WRITE_DATA_ENCRIPT_KEY";//写卡数据加密解密密钥
    public static final String LMC_WRITE_CARD_EVENT_BOWRITE = "2";//受理现场写卡事件
    public static final String LMC_WRITE_CARD_EVENT_INDEPWRITE = "1";//独立写卡事件
    public static final String LMC_WRITE_CARD_EVENT_SALEOUT = "4";//卡片售出
    public static final String LMC_WRITE_CARD_EVENT_BACKCOUPON = "5";//卡片售出后退卡

    public static final String LMC_WRITE_CARD_SCENE_BOWRITE = "1";//受理现场写卡场景
    public static final String LMC_WRITE_CARD_SCENE_INDEPWRITE = "0";//独立写卡场景
    public static final String LMC_WRITE_CARD_EVENT_STATUS_SUCCESS = "S";//写卡成功
    public static final String LMC_WRITE_CARD_EVENT_STATUS_FAIL = "F";//写卡失败

    public static final String RSP_TYPE_SUCCESS = "0"; //省中心下发动态链接库更新-成功
    public static final String RSP_TYPE_FAILURE = "1"; //省中心下发动态链接库更新-失败   
    public static final String DLL_STATUS_WAIT = "0"; //待启用
    public static final String DLL_STATUS_EFFECT = "1";//在用
    public static final String DLL_STATUS_EXP = "2"; //已经废弃

    public static final Integer REMOTE_STORE = -1000;//异地仓库
    public static final String COUPON_DEALER_AID_INFO_STATUS_CD_EFFECT = "12";//有效

    /**
     * ECB模式的3DES算法
     * @param  key  加解密密钥(16字节) 3DES算法即DESede密钥长度无限制
     *      在3DES加密过程中的DES加密使用左8字节密钥，DES解密使用右8字节密钥
     * @param  data 待加/解密数据(长度必须是8的倍数)
     *      如果用 ECB/NoPadding，加密時要自己將明文補成8的倍數，否則會有錯，
     *      而且你需要自己定義Padding的rule，否則解密回來會不知道如何截取明文(因為解密出來長度都是8的倍數，但明文長度不一定是8的倍數)
     * @param  mode 0-加密，1-解密
     * @return String  加解密后的数据 为null表示操作失败
     */
    public static String desECB(String data, String key, int mode) throws Exception {
        try {
            int opmode = (mode == 0) ? Cipher.ENCRYPT_MODE : Cipher.DECRYPT_MODE;

            //根据给定的字节数组构造一个密钥
            SecretKey keySpec = new SecretKeySpec(str2bytes(key + key.substring(0, 16)), "DESede"); //3des是24个字节,需要补足24=key(16)+key(8)

            //返回实现指定转换DESede/ECB/NoPadding 的 Cipher 对象
            //JDK 1.5 DESede = DESede/ECB/PKCS5Padding 
            //JDK 1.4 DESede = DESede/ECB/NoPadding 
            //在ECB mode下，每個加解密的 block(8 byte 為 1 block)，互相獨立
            Cipher enc = Cipher.getInstance("DESede/ECB/NoPadding");

            //初始化加、解密 Cipher 相当于创建该 Cipher 的一个新实例并将其初始化
            enc.init(opmode, keySpec);

            //加/解密,将结果存在字节数组中 
            return bytesToHexString(enc.doFinal(str2bytes(data)));

        } catch (Exception e) {
            throw new Exception("WriteCardUtil.desECB异常：", e);
        }
    }

    /**
     * ECB模式的DES算法-天宇提供算法
     * add by zzd 2009-10-12
     * @param key 加解密密钥(8字节)
     * @param data 待加/解密数据(逗号分割的个人化数据)
     * @param mode 0-加密，1-解密
     * @return 加解密后的数据 为null表示操作失败
     */
    public static String singleDesEcb(String data, String key, int mode) throws Exception {
        try {
            int opmode = (mode == 0) ? Cipher.ENCRYPT_MODE : Cipher.DECRYPT_MODE;
            SecretKey keySpec = new SecretKeySpec(str2bytes(key), "DES");
            Cipher enc = Cipher.getInstance("DES/ECB/NoPadding");
            enc.init(opmode, keySpec);
            return (bytesToHexString(enc.doFinal(str2bytes(padding00(data))))).toUpperCase();
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("WriteCardUtil.singleDesEcb ECB模式的DES算法异常：", e);
        }
    }

    /**  xuejuan 单des
      * 加密--ECB-DES 现场写卡注入的数据就是用此加密方法加密
      * @param   data：加密数据
      * @param   key： 加密密钥 
      * @author  zzd
      * @version 2009-10-12
      */
    public static String encodeDataByDES(String data, String key) throws Exception {
        String result = "";
        try {
            //1.UCS2编码
            byte[] dataByte = ucs2Encode(data);

            //2.转换HEX后的数据,将byte数组转换成16进制组成的字符串 例如 一个byte数组 b[0]=0x07;b[1]=0x10;...b[5]=0xFB
            String dataStr = bytesToHexString(dataByte);

            //3.填充00数据，如果结果数据块是8的倍数，不再进行追加,如果不是,追加0x00到数据块的右边，直到数据块的长度是8的倍数
            /*String dataPadding = padding00(dataStr);
              result = desecb1(key,dataPadding,0);*/
            //4.加密后返回数据--ECB模式的DES算法
            result = singleDesEcb(dataStr, key, 0);

        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("WriteCardUtil.encodeDataBy3DES异常：", e);
        }
        return result;
    }

    /** xuejuan 单des
     * 解密--ECB-DES  现场写卡注入的数据就是用此加密方法解密
     * @param   data：解密数据
     * @param   key： 解密密钥	 
     * @author  zzd
     * @version 2009-10-12
     */
    public static String deEncodeDESData(String data, String key) throws Exception {
        String result = "";
        try {
            singleDesEcb(data, key, 1); //ECB模式的DES算法
        } catch (Exception e) {
            throw new Exception("WriteCardUtil.unEncode3DESData异常：", e);
        }
        return result;
    }

    /**
     * 填充00数据，如果结果数据块是8的倍数，不再进行追加,如果不是,追加0x00到数据块的右边，直到数据块的长度是8的倍数。
     * @param data 待填充00的数据
     * @return
     */
    public static String padding00(String data) {
        int padlen = 8 - (data.length() / 2) % 8;
        if (padlen != 8) {
            String padstr = "";
            for (int i = 0; i < padlen; i++)
                padstr += "00";
            data += padstr;
            return data;
        } else {
            return data;
        }
    }

    /**
     * ************************************************************** 描述：
     * 判断是否ascii编码的字符串 参数： src,字符串 返回： true,false
     * ****************************************************************
    */
    public static boolean isAcsiiEncode(String src) {
        if (src == null || src.length() == 0) {
            return false;
        }
        try {
            byte[] btsrc = src.getBytes("UTF-16BE");
            if (btsrc.length % 2 != 0) {
                return false;
            }
            for (int i = 0; i < btsrc.length; i += 2) {
                if (!(btsrc[i] == 0x0 && btsrc[i + 1] < 0x7f)) {
                    return false;
                }
            }
            return true;
        } catch (UnsupportedEncodingException ex) {
            return false;
        }
    }

    /**描述： UCS2编码-天喻提供算法
     * ************************************************************** 
     * 参数： src,字符串 返回： 返回byte数组,或者null
     * ****************************************************************
    */
    public static byte[] ucs2Encode(String src) {
        if (src == null || src.length() == 0) {
            return null;
        }
        byte[] btdest = null;

        try {
            if (!isAcsiiEncode(src)) {
                byte[] btsrc = src.getBytes("UTF-16BE");
                btdest = new byte[btsrc.length + 1];
                btdest[0] = (byte) 0x80;
                System.arraycopy(btsrc, 0, btdest, 1, btsrc.length);
            } else {
                return src.getBytes();
            }
        } catch (UnsupportedEncodingException ex) {}
        return btdest;
    }

    /**
     * 将16进制组成的字符串转换成byte数组 例如 hex2Byte("0710BE8716FB"); 将返回一个byte数组
     * b[0]=0x07;b[1]=0x10;...b[5]=0xFB;
     * 
     * @param src 待转换的16进制字符串
     * @return
     */
    public static byte[] str2bytes(String src) {
        if (src == null || src.length() == 0 || src.length() % 2 != 0) {
            return null;
        }
        int nSrcLen = src.length();
        byte byteArrayResult[] = new byte[nSrcLen / 2];
        StringBuffer strBufTemp = new StringBuffer(src);
        String strTemp;
        int i = 0;
        while (i < strBufTemp.length() - 1) {
            strTemp = src.substring(i, i + 2);
            byteArrayResult[i / 2] = (byte) Integer.parseInt(strTemp, 16);
            i += 2;
        }
        return byteArrayResult;
    }

    /**
     * 将byte数组转换成16进制组成的字符串 例如 一个byte数组 b[0]=0x07;b[1]=0x10;...b[5]=0xFB;
     * byte2hex(b); 将返回一个字符串"0710BE8716FB"
     * @param bytes 待转换的byte数组
     * @return
     */
    public static String bytesToHexString(byte[] bytes) {
        if (bytes == null) {
            return "";
        }
        StringBuffer buff = new StringBuffer();
        int len = bytes.length;
        for (int j = 0; j < len; j++) {
            if ((bytes[j] & 0xff) < 16) {
                buff.append('0');
            }
            buff.append(Integer.toHexString(bytes[j] & 0xff));
        }
        return buff.toString();
    }

    /**
     * 转换资源xml数据为写卡数据字符串--逗号隔开
     * @param   xml
     * @param   param 需要强行替换的数据
     * @param   type  0:独立写卡校验   1：受理写卡校验
     * @author  hts
     * @version 2009-9-28
     */
   
    @SuppressWarnings("unchecked")
    public static String generateWriteCardString(String xml, Map param, String type) throws Exception {
        String result = "";
        try {

            Document dom = DocumentHelper.parseText(xml);

            String flag = dom.selectSingleNode("ContractRoot/SvcCont/ResultCode").getText();
            String info = dom.selectSingleNode("ContractRoot/SvcCont/ResultMessage").getText();

            // 校验返回类型：受理写卡校验
            String checkType = "PersonalData";

            if (flag != null && flag.equals("00000000")) {
                String iccid = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/ICCID").getText();
                String imsi = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/IMSI").getText();
                String uimid = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/UIMID").getText();
                String sid = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/SID").getText();
                String accolc = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/ACCOLC").getText();
                String nid = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/NID").getText();
                String akey = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/AKEY").getText();
                String pin1 = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/PIN1").getText();
                String pin2 = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/PIN2").getText();
                String puk1 = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/PUK1").getText();
                String puk2 = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/PUK2").getText();
                String adm = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/ADM").getText();

                //黑莓手机写卡需要替换uimid
                if (param.containsKey("uimid") && param.get("uimid") != null && !"".equals(param.get("uimid").toString())) {
                    uimid = (String) param.get("uimid");
                }

                String hrpdupp = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/HRPDUPP").getText();
                String hrpdss = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/HRPDSS").getText();

                // -- 多值---
                //SIPUPP
                List<Node> sipupp = dom.selectNodes("ContractRoot/SvcCont/" + checkType + "/SIPUPP");
                String sipuppData = "";
                for (Node d : sipupp) {
                    sipuppData += ";" + d.selectSingleNode("SIPUPPData").getText();
                }
                if (sipuppData.length()>0)
                	sipuppData = sipuppData.substring(1);
                //sipss
                List<Node> sipss = dom.selectNodes("ContractRoot/SvcCont/" + checkType + "/SIPSS");
                String sipssData = "";
                for (Node d : sipss) {
                    sipssData += ";" + d.selectSingleNode("SIPSSData").getText();
                }
                if (sipssData.length()>0)
                	sipssData = sipssData.substring(1);
                //MIPUPP
                List<Node> miPupp = dom.selectNodes("ContractRoot/SvcCont/" + checkType + "/MIPUPP");
                String miPuppDate = "";
                for (Node d : miPupp) {
                    miPuppDate += ";" + d.selectSingleNode("MIPUPPData").getText();
                }
                if (miPuppDate.length()>0)
                	miPuppDate = miPuppDate.substring(1);
                //MNHASS
                List<Node> mnHaSs = dom.selectNodes("ContractRoot/SvcCont/" + checkType + "/MNHASS");
                String MNHASSData = "";
                for (Node d : mnHaSs) {
                    MNHASSData += ";" + d.selectSingleNode("MNHASSData").getText();
                }
                if (MNHASSData.length()>0)
                	MNHASSData = MNHASSData.substring(1);
                //MNAAASS
                List<Node> mnAaaSs = dom.selectNodes("ContractRoot/SvcCont/" + checkType + "/MNAAASS");
                String MNAAASSData = "";
                for (Node d : mnAaaSs) {
                    MNAAASSData += ";" + d.selectSingleNode("MNAAASSData").getText();
                }
                if (MNAAASSData.length()>0)
                	MNAAASSData = MNAAASSData.substring(1);

                //  --多值---

                String acc = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/ACC").getText();
                String imsiG = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/IMSIG").getText();
                String ki = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/KI").getText();
                String smsp = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/SMSP").getText();

                //4G新增字段
                String opc = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/OPC_G")==null?"":dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/OPC_G").getText();
                String imsilte = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/IMSI_LTE")==null?"":dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/IMSI_LTE").getText();
                String acclte = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/ACC_LTE")==null?"":dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/ACC_LTE").getText();
                String kilte = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/KI_LTE")==null?"":dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/KI_LTE").getText();
                String opclte = dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/OPC_LTE")==null?"":dom.selectSingleNode("ContractRoot/SvcCont/" + checkType + "/OPC_LTE").getText();
                
                StringBuffer stringBuffer = new StringBuffer(iccid);

                stringBuffer.append("," + imsi);
                stringBuffer.append("," + uimid);
                stringBuffer.append("," + sid);
                stringBuffer.append("," + accolc);
                stringBuffer.append("," + nid);
                stringBuffer.append("," + akey);
                stringBuffer.append("," + pin1);
                stringBuffer.append("," + pin2);
                stringBuffer.append("," + puk1);
                stringBuffer.append("," + puk2);
                stringBuffer.append("," + adm);

                stringBuffer.append("," + hrpdupp);
                stringBuffer.append("," + hrpdss);

                //多值
                stringBuffer.append("," + sipuppData);
                stringBuffer.append("," + sipssData);
                stringBuffer.append("," + miPuppDate);
                stringBuffer.append("," + MNHASSData);
                stringBuffer.append("," + MNAAASSData);

                stringBuffer.append("," + imsiG);
                stringBuffer.append("," + acc);
                stringBuffer.append("," + ki);
                stringBuffer.append("," + smsp);
                
                //4G新增字段
                stringBuffer.append("," + opc);
                stringBuffer.append("," + imsilte);
                stringBuffer.append("," + acclte);
                stringBuffer.append("," + kilte);
                stringBuffer.append("," + opclte);
                
                result = stringBuffer.toString();
            } else {
                throw new Exception("资源校验返回数据失败：" + info);
            }
        } catch (DocumentException e) {
            throw new Exception("WriteCardUtil.transXmlToBean异常：", e);
        }
        return result;
    }

    /**
    * ECB模式中的DES/3DES/TDES算法(数据不需要填充),支持8、16、24字节的密钥
    * 说明：3DES/TDES解密算法 等同与 先用前8个字节密钥DES解密 再用中间8个字节密钥DES加密 最后用后8个字节密钥DES解密 一般前8个字节密钥和后8个字节密钥相同
    * 
    * @param key 加解密密钥(8字节:DES算法 16字节:3DES/TDES算法 24个字节:3DES/TDES算法,一般前8个字节密钥和后8个字节密钥相同)
    * @param data 待加/解密数据(长度必须是8的倍数)
    * @param mode 0-加密，1-解密
    * @return 加解密后的数据 为null表示操作失败
    */
    public static String desecb1(String key, String data, int mode) {
        try {

            //判断加密还是解密
            int opmode = (mode == 0) ? Cipher.ENCRYPT_MODE : Cipher.DECRYPT_MODE;

            SecretKey keySpec = null;

            Cipher enc = null;

            //判断密钥长度
            if (key.length() == 16) {
                //生成安全密钥
                keySpec = new SecretKeySpec(str2bytes(key), "DES");//key

                //生成算法
                enc = Cipher.getInstance("DES/ECB/NoPadding");
            } else if (key.length() == 32) {
                //计算加解密密钥，即将16个字节的密钥转换成24个字节的密钥，24个字节的密钥的前8个密钥和后8个密钥相同,并生成安全密钥
                keySpec = new SecretKeySpec(str2bytes(key + key.substring(0, 16)), "DESede");//将key前8个字节复制到keyecb的最后8个字节

                //生成算法
                enc = Cipher.getInstance("DESede/ECB/NoPadding");
            } else if (key.length() == 48) {
                //生成安全密钥
                keySpec = new SecretKeySpec(str2bytes(key), "DESede");//key

                //生成算法
                enc = Cipher.getInstance("DESede/ECB/NoPadding");
            } else {
                return null;
            }

            //初始化
            enc.init(opmode, keySpec);

            //返回加解密结果
            return (bytesToHexString(enc.doFinal(str2bytes(data)))).toUpperCase();//开始计算
        } catch (Exception e) {}
        return null;
    }

    /** 
     * java-BASE64编码
     * @throws IOException 
     */
    public static byte[] encodeDataByBASE64(String data) throws IOException {
        if (data == null) {
            return null;
        }
        return new sun.misc.BASE64Decoder().decodeBuffer(data.trim());
    }

    /** 
    * java-BASE64解码
     * @throws IOException 
    */
    public static byte[] decodeBASE64Data(String data) throws IOException {
        if (data == null) {
            return null;
        }
        return new sun.misc.BASE64Decoder().decodeBuffer(data.trim());
    }

    public static void main(String args[]) throws Exception {

        //加密
        System.out.println("zzd-ECB模式的3DES算法加密结果==>>>>"
                + desECB("6F29421BC18DDFB1", "41DD64F2AA08AFDB24B11C1747B195CA", 0));
        //解密
        System.out.println("zzd-ECB模式的3DES算法解密结果==>>>>"
                + desECB("fcc60a662d2f5f3c", "41DD64F2AA08AFDB24B11C1747B195CA", 1));

        System.out
                .println("zzd-ECB模式的DES算法加密结果==>>>>"
                        + encodeDataByDES(
                                "89860309705270988382,454048502191500,665E3FBAF5447DCF,1234,92175168,82145231,94012121,7302FA03,E55FC6F4,376A,FFFF,454048502191500@mycdma.Cn,03173BDA19D0147C,454048502191500@mycdma.cn,DA97711E51399E8F,B0666DA90106062E,0EFA7A09F0BDBF40,E0E4FD89F96117C6,3C217DA4F2C5294F,454048502191500@mycdma.cn,16F73664943C28CE,5EF588DA5F805974,4A594F5F34B1488F,D07D3556961EF6A6,BCD2FCDB7A5EE6C1,04DF4E4136921667,EEA50802D81925F6,2AE2883DD16D287F,1CDDFBACD92190F5,5A60181DC9D83917,,,",
                                "3237343839343837"));
        System.out
                .println("zzd-ECB模式的DES算法解密结果==>>>>"
                        + deEncodeDESData(
                                "EB93E51E9C4863F06185DA9104512D350AC8B92A2C1B4EFA43D03D439C4FFB9AB7ED2619F683B77EB401E24007135CDC307D630D084FC7E64E08250E8EF66B142732563E8875C193F3EDEE8D54ACB1DC58CA1285D4A1D9F698CDB75D32F09A75A8F5D8A04B45F2FFD75F94D591CDA01C0BCDF8C4E3BD3E29DDAB204C65712A1854425D81767598E38CB085B855DA5A6C7A5E70367C076BBF2EC407B656EB478143D03D439C4FFB9A5AB786CEA59283F6F57919863E338B66791FB6DBFB471F5C4F8AAAB7384039B40E3B37DC7D8B636C341C83133762CBB36050DE7A3434A73000CACF02D970A2243E04DEE0C98A473C76971910FA9CC053F1A3DFDB70FAA1CB7DA773F848830AFA3CF63E1BA25BE07EFA2714A50B3E8A9C81D0FA0150FA4A02A5E3596C555C99BE2348B7C2E2D21C6286C227E765C2E6F5D70E98ED6AB9D02E20140B0DF7BF8B62761DEFA1A1D0B847B27F4FE8AEBB423B3C87850B1F911E1390BFA628A71848D2E7C19987352B42F45A980F69B9DE76163697BA91A10F5933C9FF31E1E685490DBD51806E84E6D5CA70F048A0CCE202637D92D5C5A543126C619FDFB806700D6425EB92261D21CC1EE9B323813B7D1453D5DF56A1DA8941F1B7870D3F19C6BC0E275C6B015B7E017C443951A31EDDDF8E",
                                "3237343839343837"));
    }
}

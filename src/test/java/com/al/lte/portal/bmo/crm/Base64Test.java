package com.al.lte.portal.bmo.crm;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.apache.commons.codec.binary.Base64;
import org.jfree.util.Log;

public class Base64Test {
    public static void main(String[] args) {
        String strImg = GetImageStr();

        System.out.println(strImg);
       // GenerateImage(strImg);
    }

    //图片转化成base64字符串  
    public static String GetImageStr() {//将图片文件转化为字节数组字符串，并对其进行Base64编码处理  
        String imgFile = "d://2013-05-06_225703.jpg";//待处理的图片  
        InputStream in = null;
        byte[] data = null;
        //读取图片字节数组  
        try {
            in = new FileInputStream(imgFile);
            data = new byte[in.available()];
            int count = 0;
            while ((count = in.read(data)) > 0) {
            	in.read(data);
            }
            in.close();
        } catch (IOException e) {
           Log.error(e);
        }
        //对字节数组Base64编码
        Base64 base64 = new Base64();
        return base64.encodeToString(data);//返回Base64编码过的字节数组字符串
    }

    //base64字符串转化成图片  
    public static boolean GenerateImage(String imgStr) { //对字节数组字符串进行Base64解码并生成图片  
        if (imgStr == null) //图像数据为空  
            return false;
        Base64 base64 = new Base64();
        try {
            //Base64解码  
            byte[] b = base64.decode(imgStr);
            for (int i = 0; i < b.length; ++i) {
                if (b[i] < 0) {//调整异常数据  
                    b[i] += 256;
                }
            }
            //生成jpeg图片  
            String imgFilePath = "d://logo1.gif";//新生成的图片  
            OutputStream out = new FileOutputStream(imgFilePath);
            out.write(b);
            out.flush();
            out.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

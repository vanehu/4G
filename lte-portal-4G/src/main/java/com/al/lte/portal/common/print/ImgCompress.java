package com.al.lte.portal.common.print;

import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.imageio.ImageIO;
/** 
 * 图片压缩处理 
 * @author linmei
 */  
public class ImgCompress {  
    private Image img;  
    private int width;  
    private int height;  
    /** 
     * 构造函数 
     */  
    public ImgCompress(byte[] b) throws IOException {  
    	ByteArrayInputStream in = new ByteArrayInputStream(b);  
        img = ImageIO.read(in);      // 构造Image对象  
        width = img.getWidth(null);    // 得到源图宽  
        height = img.getHeight(null);  // 得到源图长  
    }  
    /** 
     * 按照宽度还是高度进行压缩 
     * @param w int 最大宽度 
     * @param h int 最大高度 
     */  
    public byte[] resizeFix(int w, int h) throws IOException {  
        if (width / height > w / h) {  
            return resizeByWidth(w);  
        } else {  
        	return resizeByHeight(h);  
        }  
    }  
    /** 
     * 以宽度为基准，等比例放缩图片 
     * @param w int 新宽度 
     */  
    public byte[] resizeByWidth(int w) throws IOException {  
        int h = (int) (height * w / width);  
        return resize(w, h);  
    }  
    /** 
     * 以高度为基准，等比例缩放图片 
     * @param h int 新高度 
     */  
    public byte[] resizeByHeight(int h) throws IOException {  
        int w = (int) (width * h / height);  
        return resize(w, h);  
    }  
    /** 
     * 强制压缩/放大图片到固定的大小 
     * @param w int 新宽度 
     * @param h int 新高度 
     */  
    public byte[] resize(int w, int h) throws IOException {  
        // SCALE_SMOOTH 的缩略算法 生成缩略图片的平滑度的 优先级比速度高 生成的图片质量比较好 但速度慢  
        BufferedImage image = new BufferedImage(w, h,BufferedImage.TYPE_INT_RGB );   
        //image.getGraphics().drawImage(img, 0, 0, w, h, null); // 绘制缩小后的图  
        image.getGraphics().drawImage(img.getScaledInstance(w, h,Image.SCALE_SMOOTH), 0, 0, null);
        ByteArrayOutputStream out = new ByteArrayOutputStream(); // 输出到文件流  
        ImageIO.write(image,"JPG",out);
        byte[] outByte=out.toByteArray();
        out.close();  
        return outByte;
    }  
    public static void main(String[] args) {
    	try{
    		ImgCompress press=new ImgCompress(PdfUtils.File2byte("d:/temp/IMAG0053.jpg"));
    		PdfUtils.byte2File(press.resizeFix(595,859), "d:/temp/", "test.jpg");
    	}catch(Exception e){
    		
    	}
	}
}  

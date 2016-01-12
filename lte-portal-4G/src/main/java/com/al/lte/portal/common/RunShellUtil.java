package com.al.lte.portal.common;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader; 
import java.awt.image.*;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;

import org.apache.commons.lang.StringUtils;

import com.sun.image.codec.jpeg.*;

public class RunShellUtil {
	
    public  String soDec(String dir , String name){
    	String result = "";
        try {  
        	String shpath ="chmod 777 "+dir+"wlt2bmp";
        	Process ps = Runtime.getRuntime().exec(shpath);  
            ps.waitFor();  
        	shpath = dir+"wlt2bmp "+dir+name+".wlt "+dir+name+".bmp"; 
            ps = Runtime.getRuntime().exec(shpath);  
            ps.waitFor();  
            BufferedReader br = new BufferedReader(new InputStreamReader(ps.getInputStream()));  
            StringBuffer sb = new StringBuffer();  
            String line;  
            while ((line = br.readLine()) != null) {  
                sb.append(line).append("\n");  
            }  
            result = sb.toString();   
            }   
        	catch (Exception e) {  
        		e.printStackTrace();  
            }  
    	return result;
    }
    
    /**
     * 把文件流保存成物理文件
     * @param content
     * @param outputFile
     * @return
     */
    public  File getFileFromBytes(final byte[] content, final String outputFile)
    {
        BufferedOutputStream stream = null;
        File file = null;
        try
        {
            file = new File(outputFile);
            final FileOutputStream fstream = new FileOutputStream(file);
            stream = new BufferedOutputStream(fstream);
            stream.write(content);//调试到文件已经生成这里
        }
        catch (final Exception e)
        {
            e.printStackTrace();
        }
        finally
        {
            if (stream != null)
            {
                try
                {
                    stream.close();
                }
                catch (final IOException e)
                {
                    e.printStackTrace();
                }
            }
        }
        return file;
    }
    
    /**
     * 把文件转成二进制流
     * @param content
     * @param outputFile
     * @return
     */
    public  byte[] getByteFromFile(String dri) throws IOException {
    	File srcFile = new File(dri);
		if (srcFile.isDirectory() )
			return null;// 判断是否是文件
		FileInputStream fis = new FileInputStream(srcFile);
		ByteArrayOutputStream out = new ByteArrayOutputStream(1024);
		int readLen = 0;
		byte[] buf = new byte[1024];
		while ((readLen = fis.read(buf)) != -1) {
			out.write(buf, 0, readLen);
		}
		fis.close();
		out.close();
		return out.toByteArray();
	}

    /** 
     * 删除单个文件 
     *  
     * @param fileName 
     *            要删除的文件的文件名 
     * @return 单个文件删除成功返回true，否则返回false 
     */  
    public  boolean deleteFile(String fileName) {  
     File file = new File(fileName);  
     // 如果文件路径所对应的文件存在，并且是一个文件，则直接删除  
     if (file.exists() && file.isFile()) {  
      if (file.delete()) {  
       System.out.println("删除单个文件" + fileName + "成功！");  
       return true;  
      } else {  
       System.out.println("删除单个文件" + fileName + "失败！");  
       return false;  
      }  
     } else {  
      System.out.println("删除单个文件失败：" + fileName + "不存在！");  
      return false;  
     }  
    }  
          
    //生成压缩的jpg
    public  boolean compressPic(String srcFilePath, String descFilePath) throws Exception  
    {  
        File file = null;  
        BufferedImage src = null;  
        FileOutputStream out = null;  
        ImageWriter imgWrier;  
        ImageWriteParam imgWriteParams;  
  
        // 指定写图片的方式为 jpg  
        imgWrier = ImageIO.getImageWritersByFormatName("jpg").next();  
        imgWriteParams = new javax.imageio.plugins.jpeg.JPEGImageWriteParam(null);  
        // 要使用压缩，必须指定压缩方式为MODE_EXPLICIT  
        imgWriteParams.setCompressionMode(imgWriteParams.MODE_EXPLICIT);  
        // 这里指定压缩的程度，参数qality是取值0~1范围内，  
        imgWriteParams.setCompressionQuality((float)0.8);  
        imgWriteParams.setProgressiveMode(imgWriteParams.MODE_DISABLED);  
        ColorModel colorModel = ColorModel.getRGBdefault();  
        // 指定压缩时使用的色彩模式  
        imgWriteParams.setDestinationType(new javax.imageio.ImageTypeSpecifier(colorModel, colorModel  
                .createCompatibleSampleModel(16, 16)));  
  
        try  
        {  
            if(StringUtils.isBlank(srcFilePath))  
            {  
                return false;  
            }  
            else  
            {  
                file = new File(srcFilePath);  
                src = ImageIO.read(file);  
                out = new FileOutputStream(descFilePath);  
  
                imgWrier.reset();  
                // 必须先指定 out值，才能调用write方法, ImageOutputStream可以通过任何 OutputStream构造  
                imgWrier.setOutput(ImageIO.createImageOutputStream(out));  
                // 调用write方法，就可以向输入流写图片  
                imgWrier.write(null, new IIOImage(src, null, null), imgWriteParams);  
                out.flush();  
                out.close();  
            }  
        }  
        catch(Exception e)  
        {  
            throw e;
 
        }  
        return true;  
    }  
    //生成压缩的二进制流
    public byte[] commressPic (byte[] data ) {
        ByteArrayInputStream is = new ByteArrayInputStream(data);  
        BufferedImage src = null;  
        ByteArrayOutputStream out = null;  
        ImageWriter imgWrier;  
        ImageWriteParam imgWriteParams;  
          
        // 指定写图片的方式为 jpg  
        imgWrier = ImageIO.getImageWritersByFormatName("jpg").next();  
        imgWriteParams = new javax.imageio.plugins.jpeg.JPEGImageWriteParam(null);  
        // 要使用压缩，必须指定压缩方式为MODE_EXPLICIT  
        imgWriteParams.setCompressionMode(imgWriteParams.MODE_EXPLICIT);  
        // 这里指定压缩的程度，参数qality是取值0~1范围内，  
        imgWriteParams.setCompressionQuality((float)0.1/data.length);  
                           
        imgWriteParams.setProgressiveMode(imgWriteParams.MODE_DISABLED);  
        ColorModel colorModel = ColorModel.getRGBdefault();  
        // 指定压缩时使用的色彩模式  
        imgWriteParams.setDestinationType(new javax.imageio.ImageTypeSpecifier(colorModel, colorModel  
                .createCompatibleSampleModel(16, 16)));  
          
        try  
        {  
            src = ImageIO.read(is);  
            out = new ByteArrayOutputStream(data.length);  
          
            imgWrier.reset();  
            // 必须先指定 out值，才能调用write方法, ImageOutputStream可以通过任何 OutputStream构造  
            imgWrier.setOutput(ImageIO.createImageOutputStream(out));  
            // 调用write方法，就可以向输入流写图片  
            imgWrier.write(null, new IIOImage(src, null, null), imgWriteParams);  
              
            out.flush();  
            out.close();  
            is.close();  
            data = out.toByteArray();
        }  
        catch(Exception e)  
        {  
            e.printStackTrace();  
        }
		return data;  
    }
    
}

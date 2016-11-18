package com.al.ecs.common.util;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Component;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.MediaTracker;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;
import javax.swing.ImageIcon;

import com.sun.image.codec.jpeg.JPEGCodec;
import com.sun.image.codec.jpeg.JPEGEncodeParam;
import com.sun.image.codec.jpeg.JPEGImageEncoder;

/**
 * 图像压缩工具.
 * @author liusd
 */
@SuppressWarnings("restriction")
public class ImageUtil {

    private static final int BUFFERSIZE = 1024;

    private static final MediaTracker TRACKER = new MediaTracker(new Component() {
        private static final long serialVersionUID = -5147018377651299879L;
    });

    /**
     * @param originalFile 原图像
     * @param resizedFile 压缩后的图像
     * @param width 图像宽
     * @param format 图片格式 jpg, png, gif(非动画)
     * @throws IOException
     */
    public static void resize(File originalFile, File resizedFile, int width, String format) throws IOException {
        if (format != null && "gif".equals(format.toLowerCase())) {
            resize(originalFile, resizedFile, width, 1);
            return;
        }
        FileInputStream fis = new FileInputStream(originalFile);
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        int readLength = -1;
        int bufferSize = BUFFERSIZE;
        byte[] bytes = new byte[bufferSize];
        while ((readLength = fis.read(bytes, 0, bufferSize)) != -1) {
            byteStream.write(bytes, 0, readLength);
        }
        byte[] in = byteStream.toByteArray();
        fis.close();
        byteStream.close();

        Image inputImage = Toolkit.getDefaultToolkit().createImage(in);
        waitForImage(inputImage);
        int imageWidth = inputImage.getWidth(null);
        if (imageWidth < 1) {
            throw new IllegalArgumentException("image width " + imageWidth + " is out of range");
        }
        int imageHeight = inputImage.getHeight(null);
        if (imageHeight < 1) {
            throw new IllegalArgumentException("image height " + imageHeight + " is out of range");
        }

        // Create output image.
        int height = -1;
        double scaleW = (double) imageWidth / (double) width;
        double scaleY = (double) imageHeight / (double) height;
        if (scaleW >= 0 && scaleY >= 0) {
            if (scaleW > scaleY) {
                height = -1;
            } else {
                width = -1;
            }
        }
        Image outputImage = inputImage.getScaledInstance(width, height, java.awt.Image.SCALE_DEFAULT);
        checkImage(outputImage);
        encode(new FileOutputStream(resizedFile), outputImage, format);
    }

    /** Checks the given image for valid width and height. 
     *  @param image 图片对象
     * */
    private static void checkImage(Image image) {
        waitForImage(image);
        int imageWidth = image.getWidth(null);
        if (imageWidth < 1) {
            throw new IllegalArgumentException("image width " + imageWidth + " is out of range");
        }
        int imageHeight = image.getHeight(null);
        if (imageHeight < 1) {
            throw new IllegalArgumentException("image height " + imageHeight + " is out of range");
        }
    }

    /**
     * Waits for given image to load. Use before querying image
     * height/width/colors.
     * @param image 图片对象
     */
    private static void waitForImage(Image image) {
        try {
            TRACKER.addImage(image, 0);
            TRACKER.waitForID(0);
            TRACKER.removeImage(image, 0);
        } catch (InterruptedException e) {
            throw new IllegalArgumentException("image object is invalid.");
        }
    }

    /** Encodes the given image at the given quality to the output stream. 
     * 
     * @param outputStream 
     * @param outputImage 
     * @param format 
     * */
    private static void encode(OutputStream outputStream, Image outputImage, String format) throws java.io.IOException {
        int outputWidth = outputImage.getWidth(null);
        if (outputWidth < 1) {
            throw new IllegalArgumentException("output image width " + outputWidth + " is out of range");
        }
        int outputHeight = outputImage.getHeight(null);
        if (outputHeight < 1) {
            throw new IllegalArgumentException("output image height " + outputHeight + " is out of range");
        }

        // Get a buffered image from the image.
        BufferedImage bi = new BufferedImage(outputWidth, outputHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D biContext = bi.createGraphics();
        biContext.drawImage(outputImage, 0, 0, null);
        ImageIO.write(bi, format, outputStream);
        outputStream.flush();
    }

    /**
     * 缩放gif图片.
     * @param originalFile 原图片
     * @param resizedFile 缩放后的图片
     * @param newWidth 宽度
     * @param quality 缩放比例 (等比例)
     * @throws IOException
     */
    private static void resize(File originalFile, File resizedFile, int newWidth, float quality) throws IOException {
        if (quality < 0 || quality > 1) {
            throw new IllegalArgumentException("Quality has to be between 0 and 1");
        }
        ImageIcon ii = new ImageIcon(originalFile.getCanonicalPath());
        Image i = ii.getImage();
        Image resizedImage = null;
        int iWidth = i.getWidth(null);
        int iHeight = i.getHeight(null);
        if (iWidth > iHeight) {
            resizedImage = i.getScaledInstance(newWidth, (newWidth * iHeight) / iWidth, Image.SCALE_SMOOTH);
        } else {
            resizedImage = i.getScaledInstance((newWidth * iWidth) / iHeight, newWidth, Image.SCALE_SMOOTH);
        }
        // This code ensures that all the pixels in the image are loaded.
        Image temp = new ImageIcon(resizedImage).getImage();
        // Create the buffered image.
        BufferedImage bufferedImage = new BufferedImage(temp.getWidth(null), temp.getHeight(null),
                BufferedImage.TYPE_INT_RGB);
        // Copy image to buffered image.
        Graphics g = bufferedImage.createGraphics();
        // Clear background and paint the image.
        g.setColor(Color.white);
        g.fillRect(0, 0, temp.getWidth(null), temp.getHeight(null));
        g.drawImage(temp, 0, 0, null);
        g.dispose();
        // Soften.
        float softenFactor = 0.05f;
        float[] softenArray = { 0, softenFactor, 0, softenFactor, 1 - (softenFactor * 4), softenFactor, 0,
                softenFactor, 0 };
        Kernel kernel = new Kernel(3, 3, softenArray);
        ConvolveOp cOp = new ConvolveOp(kernel, ConvolveOp.EDGE_NO_OP, null);
        bufferedImage = cOp.filter(bufferedImage, null);
        // Write the jpeg to a file.
        FileOutputStream out = new FileOutputStream(resizedFile);
        // Encodes image as a JPEG data stream
        JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(out);
        JPEGEncodeParam param = encoder.getDefaultJPEGEncodeParam(bufferedImage);
        param.setQuality(quality, true);
        encoder.setJPEGEncodeParam(param);
        encoder.encode(bufferedImage);
    }

    /**
     * 创建图片缩略图.
     * @param src 源图片文件完整路径
     * @param dist 目标图片文件完整路径
     * @param width 缩放的宽度
     * @param height 缩放的高度
     */
    public static void createThumbnail(String src, String dist, float width, float height) {

        try {
            File srcfile = new File(src);
            if (!srcfile.exists()) {
                return;
            }

            BufferedImage image = ImageIO.read(srcfile);

            // 计算新的图面宽度和高度
            int newWidth = (int) width;
            int newHeight = (int) height;

            BufferedImage bfImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
            bfImage.getGraphics().drawImage(image.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH), 0, 0,
                    null);

            FileOutputStream os = new FileOutputStream(dist);
            JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(os);
            encoder.encode(bfImage);
            os.close();
        } catch (Exception e) {
            throw new IllegalArgumentException("createThumbnail failed :" + e.getMessage());
        }
    }

    /**
     * 创建图片缩略图(等比缩放).
     * @param src 源图片文件完整路径
     * @param dist 目标图片文件完整路径
     * @param width 缩放的宽度
     */
    public static void createThumbnail(String src, String dist, float width) {
        try {
            File srcfile = new File(src);
            if (!srcfile.exists()) {
                return;
            }
            //解决转换后变少
            width = width + 1;
            BufferedImage image = ImageIO.read(srcfile);
            // 等比高度
            float height = width / image.getWidth() * image.getHeight();

            // 获得缩放的比例
            double ratio = 1.0;
            // 判断如果高、宽都不大于设定值，则不处理
            if (image.getHeight() > height || image.getWidth() > width) {
                if (image.getHeight() > image.getWidth()) {
                    ratio = height / image.getHeight();
                } else {
                    ratio = width / image.getWidth();
                }
            }
            // 计算新的图面宽度和高度
            int newWidth = (int) (image.getWidth() * ratio);
            int newHeight = (int) (image.getHeight() * ratio);

            BufferedImage bfImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
            bfImage.getGraphics().drawImage(image.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH), 0, 0,
                    null);

            FileOutputStream os = new FileOutputStream(dist);
            JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(os);
            encoder.encode(bfImage);
            os.close();
        } catch (Exception e) {
            throw new IllegalArgumentException("createThumbnail failed :" + e.getMessage());
        }
    }

    /**
     * 添加文字水印
     * @param text 水印内容
     * @param srcImage 原图
     * @param imgType 图片的后缀名
     * @return 以byte数组返回加水印后的图片
     * @throws IOException
     */
	public static byte[] addTextWatermark(String context, byte[] srcImage, String imgType) throws IOException {
        OutputStream os = null;
        InputStream bis = null;
        try {
            bis = new ByteArrayInputStream(srcImage);
//            ImageInputStream iis = ImageIO.createImageInputStream(bis);
            BufferedImage sourceImage = ImageIO.read(bis);
            Graphics2D g2d = (Graphics2D) sourceImage.getGraphics();

            // initializes necessary graphic properties
            AlphaComposite alphaChannel = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.3f);//0.4
            g2d.setComposite(alphaChannel);
            g2d.setColor(Color.BLUE);

            //原图长宽
            int srcImageWidth = sourceImage.getWidth();
            int srcImageHeight = sourceImage.getHeight();

            //按比率设置字体与水印间隔
            int fontSize = srcImageWidth / 20;//24
            int pos = srcImageHeight / 2;//10
            g2d.setFont(new Font("黑体", Font.BOLD, fontSize));
            //2400 102 300
            //2000 76 200
            //水印旋转 弧度
            double degree = -35;
            g2d.rotate(Math.toRadians(degree), (double) sourceImage.getWidth() / 2, (double) sourceImage.getHeight() / 2);
            // calculates the coordinate where the String is painted
            int widthT = fontSize * getTextLength(context);
            int heightT = fontSize;

            //从图片外面开始设置，， 这里是先把图片旋转了，不是直接旋转文字
            int x = -srcImageWidth / 8;//2
            int y = -srcImageHeight / 8;//2
            //固定打水印 起始的范围 从左上角开始
            while (x < srcImageWidth * 1.5) {//1.5
                y = -srcImageHeight / 8;//2
                int k = 0;
                while (y < srcImageHeight * 1.5) {
                    if (k % 2 == 0){
                    	g2d.drawString(context, x, y);
                    } else{
                    	g2d.drawString(context, x + pos / 2, y);
                    }
                    y += heightT + pos;
                    k++;
                }
                x += widthT + pos * 1.5;
            }

            os = new ByteArrayOutputStream();
            ImageIO.write(sourceImage, imgType, os);
            byte[] b = ((ByteArrayOutputStream) os).toByteArray();
            g2d.dispose();
            os.flush();
            return b;
        } catch (IOException ex) {
            throw ex;
        } finally {
            if (os != null)
                os.close();
            if (bis != null)
                bis.close();
        }
    }
	
	/**
	 * 从Base64ImageStr中获取图片格式(后缀名)
	 * @param base64ImageStr
	 * @return image format (like jpg or png...)，<strong>null</strong> is returned if there's no head infos in base64ImageStr
	 */
	public static String getImageFormat(String base64ImageStr) {
		if(base64ImageStr != null){
			Pattern pattern = Pattern.compile("data:image/(.*);base64,");
	        Matcher matcher = pattern.matcher(base64ImageStr);
	        if (matcher.find()) {
	            return matcher.group(1);
	        }
	        return null;
		} else{
			return null;
		}
    }
    
	/**
	 * 过滤base64图片字符串的头信息,返回base64的图片内容
	 * @param base64ImageStr
	 * @param imageFormat
	 * @return replace head infos in base64ImageStr with "", if there's head infos , the param base64ImageStr is returned.
	 */
	public static String filterBase64ImageStr(String base64ImageStr, String imageFormat) {
		if(imageFormat != null && !"".equals(imageFormat)){
			return base64ImageStr.replace("data:image/" + imageFormat + ";base64,", "");
		} else{
			return base64ImageStr;
		}
    }
	
	/**
	 * 获取水印文字内容的长度
	 * @param text
	 * @return
	 */
	private static int getTextLength(String text) {
        //计算文本内容的长度，中文占两个字节，英文要再加1
        int length = text.length();
        for (int i = 0; i < text.length(); i++) {
            String s = String.valueOf(text.charAt(i));
            if (s.getBytes().length > 1) {
                length++;
            }
        }
        length = length % 2 == 0 ? length / 2 : length / 2 + 1;
        return length;
    }

}

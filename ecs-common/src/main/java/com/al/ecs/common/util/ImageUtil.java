package com.al.ecs.common.util;

import java.awt.Color;
import java.awt.Component;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.MediaTracker;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

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
    /*
    public static void main(String[] args) {
        File originalFile = new File("d:\\dd\\aa.jpg");
        File resizedFile = new File("d:\\dd\\a1.png");
        try {
            // resize(originalFile, resizedFile, 200, "jpg");
            createThumbnail("d:\\html\\Vista_green_1019.jpg", "D:\\html\\310-310.jpg", 310, 310);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    */
}

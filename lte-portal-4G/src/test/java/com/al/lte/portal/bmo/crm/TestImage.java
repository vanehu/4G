package com.al.lte.portal.bmo.crm;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import org.apache.commons.codec.binary.Base64;

import com.al.ecs.common.util.ImageUtil;
import com.al.lte.portal.model.Photograph;

public class TestImage {

	public static String base64ImageStr = "=";
//	public static String base64ImageStr = "data:image/jpeg;base64,";
	
	public static void main(String[] args){
//		testResize();
//		saveImage(base64ImageStr);
	}
	
	public static void testResize(){
		try {
			Photograph photograph = Photograph.getInstance();
			photograph.setPhotograph(base64ImageStr);
			byte[] scaledImageBytes = Base64.decodeBase64(photograph.imageResize("jpeg", 300, 400));
		    OutputStream out = new FileOutputStream("D:\\image\\image.jpg");
		    out.write(scaledImageBytes);
		    out.flush();
		    out.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public static void saveImage(String base64ImageStr){
		byte[] imageBytes = Base64.decodeBase64(base64ImageStr);
		try {
            OutputStream out = new FileOutputStream("D:\\image\\imageOrigin.jpg");
            out.write(imageBytes);
            out.flush();
            out.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public static void test(){
		Photograph photograph = Photograph.getInstance();
		String venderId = "10000";
		String imageFormat = ImageUtil.getImageFormat(base64ImageStr);
		if(imageFormat != null){
			base64ImageStr = ImageUtil.filterBase64ImageStr(base64ImageStr, imageFormat);
		} else{
//			imageFormat = MDA.VENDER_SIGNATURE.get(venderId).get("imageFormat");
			imageFormat = "jpg";
		}
		photograph.setPhotograph(base64ImageStr);
		photograph.setSignature("3B94FB7DD489732691A4AC1C205222BC7CEF5EB2");
		boolean result = photograph.verifySignature(venderId);

		try {
			byte[] resultImage = photograph.addTextWatermark(venderId);
            OutputStream out = new FileOutputStream("D:\\image\\image." + imageFormat);
            out.write(resultImage);
            out.flush();
            out.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
//		result = Base64Test.GenerateImage(base64ImageStr);
	}
}

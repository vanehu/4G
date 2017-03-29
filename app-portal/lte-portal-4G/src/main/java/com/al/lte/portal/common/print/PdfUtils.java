package com.al.lte.portal.common.print;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.codec.binary.Base64;

import com.lowagie.text.Document;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfCopy;
import com.lowagie.text.pdf.PdfImportedPage;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfStamper;
import com.lowagie.text.pdf.PdfWriter;
public class PdfUtils {
	/**
	 * 给pdf追加图片
	 * @param imgStr
	 * @param pdfStr
	 * @param lx
	 * @param ly
	 * @param ux
	 * @param uy
	 * @return
	 * @throws Exception
	 */
	public static byte[] sign(String imgStr,String pdfStr,int lx,int ly,int ux,int uy) throws Exception{
		byte[] pdfFile = Base64.decodeBase64(pdfStr);
		byte[] imgData= Base64.decodeBase64(imgStr);
		// Creating the reader and the stamper
        PdfReader reader = new PdfReader(pdfFile);
        //设置页数
        int page= reader.getNumberOfPages();
        ByteArrayOutputStream output = new ByteArrayOutputStream();

        PdfStamper stamper = new PdfStamper(reader, output);
        Image image = Image.getInstance(imgData);
        // 图片位置
        //200, 100, 200 + 109, 100 + 57
        image.setAbsolutePosition(lx, ly);
        image.scaleToFit(ux / 2, uy / 2);//大小 

        PdfContentByte under = stamper.getUnderContent(page);
        under.addImage(image);
        stamper.close();
        reader.close();
        byte[] outByte=output.toByteArray();
        output.flush();
        output.close();
		return outByte;
	}

//	public static int getPercent2(float h, float w) {
//		int p = 0;
//		float p2 = 0.0f;
//		p2 = 530 / w * 100;
//		p = Math.round(p2);
//		return p;
//	}
	/**
	 * 图片合成pdf
	 * @param list
	 * @return
	 * @throws Exception
	 */
	public static String imgMerageToPdf(List<String> list,String pdfStr)
			throws Exception {
		byte[] pdfFile = Base64.decodeBase64(pdfStr);
		Image image =null;
		PdfReader reader = new PdfReader(pdfFile);
	    int page= reader.getNumberOfPages();
		Document document=new Document(new Rectangle(reader.getPageSize(page).getWidth(), reader.getPageSize(page).getHeight()));
		float w=document.getPageSize().getWidth();
		float h=document.getPageSize().getHeight();
		ByteArrayOutputStream out=new ByteArrayOutputStream();
		PdfWriter pdfWr = PdfWriter.getInstance(document, out);
		document.open();
		for(int i=0;i<list.size();i++){
			byte[] b =org.bouncycastle.util.encoders.Base64.decode(list.get(i));
			image = Image.getInstance(b);
			ImgCompress imgCom = new ImgCompress(b);  
			float ww=image.getWidth();
			float hh=image.getHeight();
			if(ww>w){
				ww=w;
			}
			if(hh>h){
				hh=h;
			}
		    b=imgCom.resizeFix((int)ww, (int)hh); 
			image = Image.getInstance(b);
			document.newPage();
			image.setAlignment(Image.MIDDLE);  			
			//image.scaleToFit(ww, hh / 2);//大小 
			//image.scaleAbsolute(ww,hh);//控制图片大小
			//int percent=getPercent2(ww,hh);
			//image.scalePercent(percent);//表示是原来图像的比例;
			//image.setAbsolutePosition((w-ww)/2,k);
			document.add(image);
		}
		document.close();
		pdfWr.close();
		byte[] outByte=out.toByteArray();
		out.flush();
		out.close();
		List<String> liststr = new ArrayList<String>();
		liststr.add(pdfStr);
		liststr.add(Base64.encodeBase64String(outByte));
//		String[] files=new String[2];
//		files[0]=pdfStr;
//		files[1]=Base64.encodeBase64String(outByte);
		Map<String,Object> obj=mergePdfFiles(liststr);
		return obj.get("byte").toString();
	}
	/**
	 * pdf合并
	 * @param files
	 * @return
	 */
	public static Map<String,Object> mergePdfFiles(List<String> files)throws Exception {
		Map<String,Object> obj=new HashMap<String,Object>();
		Document document = new Document(
				new PdfReader(Base64.decodeBase64(files.get(0))).getPageSize(1));
		ByteArrayOutputStream out=new ByteArrayOutputStream();
		PdfCopy copy = new PdfCopy(document, out);
		document.open();
		int k=0;
		obj.put("allfileCount",files.size());
		for (int i = 0; i < files.size(); i++) {
			byte[] file=Base64.decodeBase64(files.get(i));
			PdfReader reader = new PdfReader(file);
			int n = reader.getNumberOfPages();
			k+=n;
			obj.put("page"+i,k);
			for (int j = 1; j <= n; j++) {
				document.newPage();
				PdfImportedPage page = copy.getImportedPage(reader, j);
				copy.addPage(page);
			}
		}
		document.close();
		obj.put("byte", Base64.encodeBase64String(out.toByteArray()));
		out.flush();
		out.close();
		return obj;
	}
	/**
	 * 根据文件路径String 转为 byte[]
	 *
	 * @param filePath
	 * @return
	 */
	public static byte[] File2byte(String filePath) {
		byte[] buffer = null;
		FileInputStream fis=null;
		ByteArrayOutputStream bos=null;
		try {
			File file = new File(filePath);
			fis = new FileInputStream(file);
			bos = new ByteArrayOutputStream();
			byte[] b = new byte[1024];
			int n;
			while ((n = fis.read(b)) != -1) {
				bos.write(b, 0, n);
			}
			buffer = bos.toByteArray();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}finally{
			try {
				if(fis!=null){
					fis.close();
				}
				if(bos!=null){
					bos.close();
				}
			} catch (Exception e2) {
				e2.printStackTrace();
			}
		}
		return buffer;
	}
	public static void byte2File(byte[] buf, String filePath, String fileName) {
		BufferedOutputStream bos = null;
		FileOutputStream fos = null;
		File file = null;
		try {
			File dir = new File(filePath);
			if (!dir.exists() && dir.isDirectory()) {
				dir.mkdirs();
			}
			file = new File(filePath + File.separator + fileName);
			fos = new FileOutputStream(file);
			bos = new BufferedOutputStream(fos);
			bos.write(buf);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (bos != null) {
				try {
					bos.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			if (fos != null) {
				try {
					fos.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}
	public static void main(String[] args) {
		String pdfStr=Base64.encodeBase64String(File2byte("D:/temp/demo-htmlfile1.pdf"));
//		String imgStr=Base64.encodeBase64String(File2byte("D:/temp/qianm.png"));
//		try{
//			byte2File(sign(imgStr,pdfStr,100, 70, 100 + 109, 100 + 57),"D:/temp/","test2.pdf");
//		}catch(Exception e){
//			System.out.println(e.getMessage());
//		}
		String imgStr=Base64.encodeBase64String(File2byte("D:/temp/IMG_20160501_114704.jpg"));
		try{
			List<String> list=new LinkedList<String>();
			list.add(imgStr);
			list.add(imgStr);
			String ss=imgMerageToPdf(list,pdfStr);
			byte2File(Base64.decodeBase64(ss),"D:/temp/","test33.pdf");
		}catch(Exception e){
			System.out.println(e.getMessage());
		}
	}
}
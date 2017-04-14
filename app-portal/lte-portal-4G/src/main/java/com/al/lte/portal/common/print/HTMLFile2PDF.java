package com.al.lte.portal.common.print;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.xhtmlrenderer.pdf.ITextFontResolver;
import org.xhtmlrenderer.pdf.ITextRenderer;

import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.MDA;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.tool.xml.XMLWorkerFontProvider;
import com.itextpdf.tool.xml.XMLWorkerHelper;

/**
 * HTML文件转换为PDF
 *
 * @author &lt;a href="http://www.micmiu.com"&gt;Michael Sun&lt;/a&gt;
 */
public class HTMLFile2PDF {

	/**
	 * @param args
	 */
	public static void main(String[] args) throws Exception {
		
//    	String htmls="<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">";
//    	htmls+="<html>";
//    	htmls+="<head>";
//    	htmls+="<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />";
//    	htmls+="</head>";
//    	htmls+="<body style='font-family:SimSun;  font-size:14px; '>";
//    	htmls+="<p>";
//    	htmls+="14.1 甲方办理各类业务所签署的业务登记单、表单、补充协议等均自动成为本协议的组成部分。业务登记单等文件内容与本协议条款内容冲突时，以该等文件为准。";
//    	htmls+="</p>";
//    	htmls+="</body>";
//    	htmls+="</html>";
//    	System.out.println(createPdfToByte(htmls).length);
		// 直接把HTML文件转为PDF文件
		String pdfFile = "d:/temp/demo-htmlfile.pdf";
		String htmlFile = "D:/temp/test2.html";
    	Map<String,Object> param=new HashMap<String,Object>();
    	param.put("areaName", "海南");
    	param.put("dateYear", DateUtil.nowYear());
    	param.put("dateMonth", DateUtil.nowMonth());
    	param.put("dateDay", DateUtil.nowDayOfMonth());
    	param.put("totalPage",3);
		createPdf(pdfFile,htmlFile,param);
		pdfFile = "d:/temp/demo-htmlfile1.pdf";
		htmlFile = "D:/temp/test1.html";
		param.put("prettyNbr", "17708980987");
		param.put("preStore", "90");
		param.put("minCharge", "12");
		param.put("protocolPeriod", "2");
		param.put("areaName", "海南");
    	param.put("dateYear", DateUtil.nowYear());
    	param.put("dateMonth", DateUtil.nowMonth());
    	param.put("dateDay", DateUtil.nowDayOfMonth());
    	param.put("totalPage",1);
    	createPdf(pdfFile,htmlFile,param);
	}

	/**
     * 测试html转成pdf
     * @param file
     * @throws IOException
     * @throws DocumentException
     */
    public static void createPdf(String file,String htmlFile,Map<String,Object> param) throws IOException, DocumentException {
        // step 1
        Document document = new Document();
        // step 2
        PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(file));
        HeaderFooter header=new HeaderFooter(param);
        writer.setPageEvent(header);
        // step 3
        document.open();
        
        // step 4
        XMLWorkerHelper.getInstance().parseXHtml(writer, document,
                new FileInputStream(htmlFile), Charset.forName("UTF-8"));

        // step 5
        document.close();
    }
    /**
     * XMLWorkerHelper方式html转成pdf
     * @param file
     * @throws IOException
     * @throws DocumentException
     */
    public static byte[] createPdfToByte(String html,Map<String,Object> param,HttpServletRequest request) throws IOException, DocumentException {
     	ByteArrayOutputStream out=new ByteArrayOutputStream();
        // step 1
        Document document = new Document();
        // step 2
        PdfWriter writer = PdfWriter.getInstance(document, out);
        //添加签字盖章的页脚
        HeaderFooter header=new HeaderFooter(param);
        writer.setPageEvent(header);
        // step 3
        document.open();
        // step 4
        InputStream in=new ByteArrayInputStream(html.getBytes());
        Charset charset = Charset.forName("UTF-8");
        String fontPath = MDA.WORD_FONT;
        XMLWorkerFontProvider fontProvider = new XMLWorkerFontProvider(fontPath);
//        XMLWorkerFontProvider fontProvider = new XMLWorkerFontProvider("E:\\apache-tomcat-6.0.29\\webapps\\ltePortal\\resources\\image\\gongz\\fonts\\");
        XMLWorkerHelper.getInstance().parseXHtml(writer, document, in, charset, fontProvider);
//        XMLWorkerHelper.getInstance().parseXHtml(writer, document,
//        		new StringReader(html));
        // step 5
        document.close();
        byte[] tt=out.toByteArray();
        document.close();
        out.flush();
        out.close();
        return tt;
    }
    /**
     * ITextFontResolver方式html转pdf
     * @param html
     * @return
     * @throws Exception
     */
	public static byte[] convertHtmlToPdf(String html)throws Exception {
		ByteArrayOutputStream os=new ByteArrayOutputStream();
        ITextRenderer renderer = new ITextRenderer();
        renderer.setDocumentFromString(html);
        renderer.layout();
        renderer.createPDF(os);
        byte[] tt=os.toByteArray();
        os.flush();
        os.close();
        return tt;
	}
	public static String replaceForSign(String html){
		html=html.replaceAll("\t|\r|\n","");
		html=html.replaceAll(">  <", "><");
		StringBuffer htmlStr1=new StringBuffer();
		htmlStr1.append("<tr valign=\"top\">");
		htmlStr1.append("<td colspan=\"5\" style=\"width: 83pt; height: 14pt;\"></td>");
		htmlStr1.append("<td colspan=\"3\" style=\"width: 130pt; word-wrap: break-word; \"><p style=\"overflow: hidden; line-height: 1.0; text-indent: 0px; \"><span style=\"font-family: 宋体; color: #000000; font-size: 10pt; font-weight: bold;\">申请人/经办人(签字)： </span></p></td>");
		String str1=htmlStr1.toString().replaceAll("\t|\r|\n","");
		String appHtml="</table><table style=\"width: 595pt; border-collapse: collapse; empty-cells: show\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"white\" id=\"ywSign\">";		
		if(html.indexOf(str1)>0){
			html=html.replace(str1, appHtml.replaceAll("\t|\r|\n","")+str1);
		}
		StringBuffer htmlStr2=new StringBuffer();
		htmlStr2.append("<tr valign=\"top\">");
		htmlStr2.append("<td colspan=\"6\" style=\"width: 83pt; height: 14pt;\"></td>");
		htmlStr2.append("<td colspan=\"5\" style=\"width: 130pt; word-wrap: break-word; \"><p style=\"overflow: hidden; line-height: 1.0; text-indent: 0px; \"><span style=\"font-family: 宋体; color: #000000; font-size: 10pt; font-weight: bold;\">申请人/经办人(签字)： </span></p></td>");
		String str2=htmlStr2.toString().replaceAll("\t|\r|\n","");
		if(html.indexOf(str2)>0){
			html=html.replace(str2, appHtml.replaceAll("\t|\r|\n","")+str2);
		}
		StringBuffer htmlStr3=new StringBuffer();
		htmlStr3.append("<tr valign=\"top\">");
		htmlStr3.append("<td colspan=\"4\" style=\"width: 83pt; height: 14pt;\"></td>");
		htmlStr3.append("<td colspan=\"3\" style=\"width: 130pt; word-wrap: break-word; \"><p style=\"overflow: hidden; line-height: 1.0; text-indent: 0px; \"><span style=\"font-family: 宋体; color: #000000; font-size: 10pt; font-weight: bold;\">申请人/经办人(签字)： </span></p></td>");
		String str3=htmlStr3.toString().replaceAll("\t|\r|\n","");
		if(html.indexOf(str3)>0){
			html=html.replace(str3, appHtml.replaceAll("\t|\r|\n","")+str3);
		}
		return html;
	}
    /**
     * 预览的html添加签字盖章的页脚
     * @param param
     * @return
     */
    public static String doWithHtml(Map<String,Object> param,String id){
    	StringBuffer htmlStr=new StringBuffer();
    	htmlStr.append(" <div  style=\"width:94%;layout-grid:15.6pt;margin: 0 auto;\">");
    	htmlStr.append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin-top:11pt;\" id=\""+id+"\">");
    	if("llhsign".equals(id)){
    		htmlStr.append("<tr>");
        	htmlStr.append("<td valign=\"top\"><p class=\"style12\">甲方签字：</p></td>");
        	htmlStr.append("<td align=\"center\" valign=\"top\" width=\"50%\"><p class=\"style12\">乙方盖章：</p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">（签字或盖章）</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\">（签字或盖章）</p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">时间："+param.get("dateYear")+"年 "+param.get("dateMonth")+"月"+param.get("dateDay")+"日</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\">时间："+param.get("dateYear")+"年 "+param.get("dateMonth")+"月"+param.get("dateDay")+"日</p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td valign=\"top\"><p class=\"style12\">经办人签字：</p></td>");
        	htmlStr.append("<td align=\"center\" valign=\"top\" width=\"50%\"><p class=\"style12\">乙方业务代办人（代理商）盖章：</p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">（签字或盖章）</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\">（签字或盖章）</p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td valign=\"top\"><p class=\"style12\">审核人：</p></td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\"></p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">（签字或盖章）</p> </td>");
        	htmlStr.append("</tr>");
    	}else if("rwsign".equals(id)){
    		htmlStr.append("<tr>");
        	htmlStr.append("<td valign=\"top\"><p class=\"style12\">用户签字：</p></td>");
        	htmlStr.append("<td align=\"center\" valign=\"top\" width=\"50%\"><p class=\"style12\"></p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">（签字或盖章）</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\"></p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">时间："+param.get("dateYear")+"年 "+param.get("dateMonth")+"月"+param.get("dateDay")+"日</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\"></p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td valign=\"top\"><p class=\"style12\">客户服务热线10000</p></td>");
        	htmlStr.append("<td align=\"center\" valign=\"top\" width=\"50%\"><p class=\"style12\"></p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">Customer Hotline</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\">网上营业厅：www.189.cn</p></td>");
        	htmlStr.append("</tr>");
    	}else if("ydrwsign".equals(id)){
    		htmlStr.append("<tr>");
        	htmlStr.append("<td valign=\"top\"><p class=\"style12\">甲方：</p></td>");
        	htmlStr.append("<td align=\"center\" valign=\"top\" width=\"50%\"><p class=\"style12\">乙方：中国电信股份有限公司"+param.get("areaName")+"分公司</p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">（签字或盖章）</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\">（签字或盖章）</p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">时间："+param.get("dateYear")+"年 "+param.get("dateMonth")+"月"+param.get("dateDay")+"日</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\">时间："+param.get("dateYear")+"年 "+param.get("dateMonth")+"月"+param.get("dateDay")+"日</p></td>");
        	htmlStr.append("</tr>");
    	}else{
    		htmlStr.append("<tr>");
        	htmlStr.append("<td valign=\"top\"><p class=\"style12\">甲方：</p></td>");
        	htmlStr.append("<td align=\"center\" valign=\"top\" width=\"50%\"><p class=\"style12\">乙方：中国电信股份有限公司"+param.get("areaName")+"分公司</p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">（签字或盖章）</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\">（签字或盖章）</p></td>");
        	htmlStr.append("</tr>");
        	htmlStr.append("<tr>");
        	htmlStr.append("<td><p class=\"style12\">时间："+param.get("dateYear")+"年 "+param.get("dateMonth")+"月"+param.get("dateDay")+"日</p> </td>");
        	htmlStr.append("<td align=\"center\"><p class=\"style12\">时间："+param.get("dateYear")+"年 "+param.get("dateMonth")+"月"+param.get("dateDay")+"日</p></td>");
        	htmlStr.append("</tr>");
    	}
    	htmlStr.append("</table>");
    	htmlStr.append("</div>");
    	return htmlStr.toString();
    }
}
package com.al.lte.portal.common.print;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.al.ecs.common.util.MDA;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfPageEventHelper;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.tool.xml.XMLWorkerFontProvider;

public class HeaderFooter extends PdfPageEventHelper{
	private Map<String,Object> param=null;
    public HeaderFooter(Map<String,Object> inparam) {
    	param=inparam;
	}
	public void onEndPage (PdfWriter writer, Document document) {
        try{
        	String fontPath = MDA.WORD_FONT;
        	if(writer.getPageNumber()==Integer.parseInt(param.get("totalPage").toString())){
//        		Font fontDetail = new XMLWorkerFontProvider("E:\\apache-tomcat-6.0.29\\webapps\\ltePortal\\resources\\image\\gongz\\fonts\\").getFont("微软雅黑", 10.2f, BaseColor.BLACK);
        		Font fontDetail = new XMLWorkerFontProvider(fontPath).getFont("微软雅黑", 10.2f, BaseColor.BLACK);
		        ColumnText.showTextAligned(writer.getDirectContent(),
		                Element.ALIGN_LEFT,  new Phrase("甲方:",fontDetail),
		                35f, 100f, 0);
		        ColumnText.showTextAligned(writer.getDirectContent(),
		                Element.ALIGN_LEFT,  new Phrase("乙方：中国电信股份有限公司"+param.get("areaName")+"分公司 ",fontDetail),
		                320f, 100f, 0);
		        ColumnText.showTextAligned(writer.getDirectContent(),
		                Element.ALIGN_LEFT,  new Phrase("（签字或盖章） ",fontDetail),
		                35f, 75f, 0);
		        ColumnText.showTextAligned(writer.getDirectContent(),
		                Element.ALIGN_LEFT,  new Phrase("（签字或盖章） ",fontDetail),
		                380f, 75f, 0);
		        ColumnText.showTextAligned(writer.getDirectContent(),
		                Element.ALIGN_LEFT,  new Phrase(param.get("dateYear")+"年"+param.get("dateMonth")+"月"+param.get("dateDay")+"日",fontDetail),
		                35f, 50f, 0);
		        ColumnText.showTextAligned(writer.getDirectContent(),
		        		 Element.ALIGN_LEFT,  new Phrase(param.get("dateYear")+"年"+param.get("dateMonth")+"月"+param.get("dateDay")+"日",fontDetail),
		                380f, 50f, 0);
        	}
        }catch(Exception e){
        	
        }
    }
}
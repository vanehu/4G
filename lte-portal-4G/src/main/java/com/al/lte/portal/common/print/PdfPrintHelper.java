package com.al.lte.portal.common.print;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.org.eclipse.jdt.core.dom.ThisExpression;

import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JREmptyDataSource;
import net.sf.jasperreports.engine.JRExporterParameter;
import net.sf.jasperreports.engine.JRPrintPage;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.JRHtmlExporter;
import net.sf.jasperreports.engine.export.JRHtmlExporterParameter;

import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.StringUtil;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.SysConstant;
import com.itextpdf.text.pdf.PdfStructTreeController.returnType;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfStamper;
import com.lowagie.text.pdf.PdfWriter;

public class PdfPrintHelper {
	private final Log log = Log.getLog(PdfPrintHelper.class);
	
    String m_vJasperFileName = "";//打印模板流
    boolean m_vAutoPrint = true;//是否自动打印标志
    byte[] byteJasperFile = null;
    int pageWidth = 0;  //打印模板宽度
    int pageHeigth = 0; //打印模板高度
    
    /**
     * 构造Helper类
     * 
     * @param strJasperFileName --- pdf模板路径名称
     * @param pageWidth 自定义打印宽度 小于等于0忽略
     * @param pageHeight 自定义打印高度 小于等于0忽略
     * @throws Exception
     */
    public PdfPrintHelper(String strJasperFileName,boolean isAutoPrint, int pageWidth, int pageHeight) throws Exception{
        m_vJasperFileName = strJasperFileName;
        m_vAutoPrint = isAutoPrint;
        byteJasperFile = FileHandle.readJasper(strJasperFileName);//缓存Jasper模板
        this.pageWidth = pageWidth;
        this.pageHeigth = pageHeight;
    }
    
    public PdfPrintHelper(){
        
    }
    
    /**
     * 转换转换Parameters到Pdf数据流
     * 
     * @param inputStream
     * @param hasParameters
     * @return
     * @throws Exception
     */
    public byte[] getPdfStreamWithOnlyParameters(Map<String, Object> hasParameters) throws Exception {
        String strMsg = "";
        if(m_vJasperFileName == null || "".equals(m_vJasperFileName)){
            throw new Exception("异常：请先传入[pdf模板路径名称]来初始化本PdfPrintHelper类!");
        }
        
        byte[] bytes = null;
        boolean bConvertOK = false;
        boolean bAppend = false;
        
        ByteArrayInputStream inputStream = null;
        try {
            //InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream(m_vJasperFileName);
            inputStream = new ByteArrayInputStream(byteJasperFile);
            
            bytes = runReportToPdf(inputStream, hasParameters, new JREmptyDataSource(), pageWidth, pageHeigth, null, null);
            bConvertOK = true;//转换成功
            
            bytes = appendPrintControlScript(bytes);
            bAppend = true;//追加打印控制脚步成功
        } catch (Exception exp) {
        	exp.printStackTrace();
            strMsg = exp.getMessage();
            exp.printStackTrace();
        }finally{
            if(inputStream != null){
                inputStream.close();
            }
            
            if(bConvertOK == false){
                throw new Exception("异常：转换Parameters到Pdf数据流错误，请检查转换参数是否正确！" + strMsg);
            }
            else if(bAppend == false){
                throw new Exception("异常：为Pdf数据流[Parameters]追加打印控制参数错误，请检查转换参数是否正确！" + strMsg);
            }
        }
        return bytes;
    }
    
    /**
     * 转换Parameters和Fields到Pdf数据流
     * 
     * @param inputStream
     * @param hasParameters
     * @param lstFields
     * @return
     * @throws Exception
     */
    public byte[] getPdfStreamWithParametersAndFields(Map<String, Object> hasParameters, Collection<Map<String, Object>> lstFields, String busitypeFlag, String currentAreaId) throws Exception {
    	String strMsg = "";
        if(m_vJasperFileName == null || "".equals(m_vJasperFileName)){
            throw new Exception("异常：请先传入[pdf模板路径名称]来初始化本PdfPrintHelper类!");
        }
        
        byte[] bytes = null;
        boolean bConvertOK = false;
        boolean bAppend = false;
        ByteArrayInputStream inputStream = null;
        try {
            inputStream = new ByteArrayInputStream(byteJasperFile);
            
            bytes = runReportToPdf(inputStream, hasParameters, new ListDataSource(lstFields), pageWidth, pageHeigth, null, null);
            bConvertOK = true;//转换成功
            
            bytes = appendPrintControlScript(bytes);
            bAppend = true;//追加打印控制脚步成功
        } catch (Exception exp) {
        	exp.printStackTrace();
            strMsg = exp.getMessage();
        } catch (Throwable t) {
        	this.log.debug("java heap space size={}", Runtime.getRuntime().maxMemory()/(1024*1024)+"M");
        	t.printStackTrace();
        	strMsg = t.getMessage();
        }finally{
            if(inputStream != null){
                inputStream.close();
            }
            
            if(bConvertOK == false){
                throw new Exception("异常：转换Parameters和Fields到Pdf数据流错误，请检查转换参数是否正确！" + strMsg);
            }
            else if(bAppend == false){
                throw new Exception("异常：为Pdf数据流[Parameters和Fields]追加打印控制参数错误，请检查转换参数是否正确！" + strMsg);
            }
        }
        return bytes;
    }
    
    /**
     * 转换Parameters和Fields到Pdf数据流,没有添加打印脚本
     * 
     * @param inputStream
     * @param hasParameters
     * @param lstFields
     * @return
     * @throws Exception
     */
    public byte[] getPdfStreamWithParametersAndFieldsByNoScript(Map<String, Object> hasParameters, Collection<Map<String, Object>> lstFields) throws Exception {
    	String strMsg = "";
        if(m_vJasperFileName == null || "".equals(m_vJasperFileName)){
            throw new Exception("异常：请先传入[pdf模板路径名称]来初始化本PdfPrintHelper类!");
        }
        
        byte[] bytes = null;
        boolean bConvertOK = false;
        ByteArrayInputStream inputStream = null;
        try {
            inputStream = new ByteArrayInputStream(byteJasperFile);
            
            bytes = runReportToPdf(inputStream, hasParameters, new ListDataSource(lstFields), pageWidth, pageHeigth, null, null);
            bConvertOK = true;//转换成功
            
        } catch (Exception exp) {
        	exp.printStackTrace();
            strMsg = exp.getMessage();
        } catch (Throwable t) {
        	this.log.debug("java heap space size={}", Runtime.getRuntime().maxMemory()/(1024*1024)+"M");
        	t.printStackTrace();
        	strMsg = t.getMessage();
        }finally{
            if(inputStream != null){
                inputStream.close();
            }
            
            if(bConvertOK == false){
                throw new Exception("异常：转换Parameters和Fields到Pdf数据流错误，请检查转换参数是否正确！" + strMsg);
            }
        }
        return bytes;
    }
    
    public String getHtmlStrWithParametersAndFields(Map<String, Object> hasParameters, Collection<Map<String, Object>> lstFields) throws Exception {
        String strMsg = "";
        if(m_vJasperFileName == null || "".equals(m_vJasperFileName)){
            throw new Exception("异常：请先传入[pdf模板路径名称]来初始化本PdfPrintHelper类!");
        }
        
        boolean bConvertOK = false;
        boolean bAppend = false;
        ByteArrayInputStream inputStream = null;
        String returnStr="";
        try {
            inputStream = new ByteArrayInputStream(byteJasperFile);
            
            JasperPrint jasperPrint = JasperFillManager.fillReport(inputStream,hasParameters, new ListDataSource(lstFields));
            ByteArrayOutputStream ouputStream = new ByteArrayOutputStream(); 
            JRHtmlExporter htmlExporter = new JRHtmlExporter();
            
            htmlExporter.setParameter(JRExporterParameter.JASPER_PRINT, jasperPrint);
            htmlExporter.setParameter(JRExporterParameter.OUTPUT_STREAM, ouputStream);
            htmlExporter.setParameter(JRHtmlExporterParameter.SIZE_UNIT, "pt");
            htmlExporter.setParameter(JRHtmlExporterParameter.IS_USING_IMAGES_TO_ALIGN, Boolean.FALSE);
            htmlExporter.setParameter(JRHtmlExporterParameter.IS_REMOVE_EMPTY_SPACE_BETWEEN_ROWS, Boolean.FALSE);
            htmlExporter.setParameter(JRHtmlExporterParameter.IS_WRAP_BREAK_WORD, Boolean.TRUE);
            htmlExporter.setParameter(JRHtmlExporterParameter.IS_OUTPUT_IMAGES_TO_DIR, Boolean.FALSE);

            htmlExporter.exportReport();
            ouputStream.close();
            returnStr= ouputStream.toString();
            bConvertOK = true;//转换成功
            bAppend = true;//追加打印控制脚步成功
        } catch (Exception exp) {
            strMsg = exp.getMessage();
            exp.printStackTrace();
            returnStr="";
        }finally{
            if(inputStream != null){
                inputStream.close();
            }
            
            if(bConvertOK == false){
            	returnStr="";
                throw new Exception("异常：转换Parameters和Fields到Html数据流错误，请检查转换参数是否正确！" + strMsg);
            }
            else if(bAppend == false){
            	returnStr="";
                throw new Exception("异常：为Html数据流[Parameters和Fields]追加打印控制参数错误，请检查转换参数是否正确！" + strMsg);
            }
        }
        return returnStr;
    }
    public void getHtmlStreamWithParametersAndFields(HttpServletResponse response,Map<String, Object> hasParameters, Collection<Map<String, Object>> lstFields) throws Exception {
        String strMsg = "";
        if(m_vJasperFileName == null || "".equals(m_vJasperFileName)){
            throw new Exception("异常：请先传入[pdf模板路径名称]来初始化本PdfPrintHelper类!");
        }
        
        boolean bConvertOK = false;
        boolean bAppend = false;
        ByteArrayInputStream inputStream = null;
        try {
            inputStream = new ByteArrayInputStream(byteJasperFile);
            
            JasperPrint jasperPrint = JasperFillManager.fillReport(inputStream,hasParameters, new ListDataSource(lstFields));
            //jasperPrint.setPageWidth(1024);
            //jasperPrint.setPageHeight(768);
            response.reset();
            ServletOutputStream ouputStream = response.getOutputStream();
            
            JRHtmlExporter htmlExporter = new JRHtmlExporter();
            
            htmlExporter.setParameter(JRExporterParameter.JASPER_PRINT, jasperPrint);
            htmlExporter.setParameter(JRExporterParameter.OUTPUT_STREAM, ouputStream);
            htmlExporter.setParameter(JRHtmlExporterParameter.SIZE_UNIT, "pt");
            htmlExporter.setParameter(JRHtmlExporterParameter.IS_USING_IMAGES_TO_ALIGN, Boolean.FALSE);
            htmlExporter.setParameter(JRHtmlExporterParameter.IS_REMOVE_EMPTY_SPACE_BETWEEN_ROWS, Boolean.FALSE);
            htmlExporter.setParameter(JRHtmlExporterParameter.IS_WRAP_BREAK_WORD, Boolean.TRUE);
            htmlExporter.setParameter(JRHtmlExporterParameter.IS_OUTPUT_IMAGES_TO_DIR, Boolean.FALSE);

            htmlExporter.exportReport();
            ouputStream.flush();
            ouputStream.close();
            bConvertOK = true;//转换成功
            bAppend = true;//追加打印控制脚步成功
        } catch (Exception exp) {
            strMsg = exp.getMessage();
            exp.printStackTrace();
        }finally{
            if(inputStream != null){
                inputStream.close();
            }
            
            if(bConvertOK == false){
                throw new Exception("异常：转换Parameters和Fields到Html数据流错误，请检查转换参数是否正确！" + strMsg);
            }
            else if(bAppend == false){
                throw new Exception("异常：为Html数据流[Parameters和Fields]追加打印控制参数错误，请检查转换参数是否正确！" + strMsg);
            }
        }
    }
    /**
     * 为pdf数据流添加打印控制参数
     * 
     * chenyk2:2009-02-18
     * @param pdfStream
     * @return
     * @throws Exception
     */
    public byte[] appendPrintControlScript(byte[] pdfStream) throws Exception {
        
        PdfReader reader = new PdfReader(pdfStream);
 
        StringBuffer script = new StringBuffer();
        script.append("    var pp = this.getPrintParams();\r\n");
        script.append("    var fv = pp.constants.flagValues;");
        script.append("    pp.pageHandling = pp.constants.handling.none;");//不要缩进
        //script.append("    pp.pageHandling = pp.constants.handling.shrink;");

        if(m_vAutoPrint){
            script.append("    pp.interactive = pp.constants.interactionLevel.automatic;\r\n");//自动打印，不弹出打印机选项,去掉的话会弹出默认打印机
        }
        
        script.append("    pp.flags |= (fv.suppressCenter | fv.suppressRotate );\r\n");
        script.append("    this.print(pp);\r\n");
        //script.append("    this.closeDoc();\r\n");//导出的pdf文件：支持自动打印，但是不要关闭自己
 
        ByteArrayOutputStream bos = new ByteArrayOutputStream(pdfStream.length);
        PdfStamper stamp = new PdfStamper(reader, bos);
        
        if(m_vAutoPrint){//如果自动打印，则不要显示pdf控制栏，提高页面展示速度
            stamp.setViewerPreferences(PdfWriter.HideMenubar | PdfWriter.HideToolbar | PdfWriter.HideWindowUI);
        }
        stamp.addJavaScript(script.toString());
        stamp.close();
        
        return bos.toByteArray();        
    }
    
    /**
     * Fills a report and returns byte array object containing the report in PDF
     * format. The intermediate JasperPrint object is not saved on disk.
     * <p>接管Jasper工具类，自定义高度和宽度 这样就可以针对那种卡孔的发票进行连打了，即一个pdf中有多张发票或回执，可以连打出来。
     */
    public static byte[] runReportToPdf(InputStream inputStream,
    		Map<String, Object> parameters, JRDataSource jrDataSource, int pageWidth, int pageHeigth, String busiTypeFlag, String currentAreaId) throws Exception  {
    	JasperPrint jasperPrint ;
        jasperPrint = JasperFillManager.fillReport(inputStream, parameters, jrDataSource);
        
        PdfPrintHelper.appendPdf(jasperPrint, busiTypeFlag, currentAreaId);
        
        if(pageWidth>0){
            jasperPrint.setPageWidth(pageWidth);
        }
        if(pageHeigth>0){
            jasperPrint.setPageHeight(pageHeigth);
        }
                
        //JasperExportManager.exportReportToPdfFile(jasperPrint,"e:\\NewTestPrint.pdf");
        
		return JasperExportManager.exportReportToPdf(jasperPrint);
    }
    
    /**
     * 针对海南新装增加入网协议打印
     * @param jasperPrint
     * @param busiTypeFlag
     * @return
     * @throws Exception
     */
	private static JasperPrint appendPdf(JasperPrint jasperPrint, String busiTypeFlag, String currentAreaId) throws Exception {

		if (StringUtils.isNotBlank(busiTypeFlag) && StringUtils.isNotBlank(currentAreaId)) {
			Map<String, String> provConfig = MapUtils.getMap(MDA.PDF_PRINT_CONFIG, "PDF_PRINT_CONFIG_" + currentAreaId.substring(0, 3));
			String jasperName = MapUtils.getString(provConfig, busiTypeFlag, "");
			if (StringUtils.isNotBlank(jasperName)) {
				String jasperFile = SysConstant.P_MOD_BASE_DIR + SysConstant.P_MOD_SUB_CTG_PDF + jasperName;
				byte[] appendJasper = FileHandle.readJasper(jasperFile);
				InputStream inputStream = new ByteArrayInputStream(appendJasper);
				JasperPrint appendJasperPrint = JasperFillManager.fillReport(inputStream, null);
				List<JRPrintPage> jrPrintPages = appendJasperPrint.getPages();
				for (JRPrintPage page : jrPrintPages) {
					jasperPrint.addPage(page);
				}
			}
		}

		return jasperPrint;
	}
    
    public static void main(String[] args) throws Exception {
    	
    	String baseDir = "";
    	String printTypeDir = "D:\\temp\\invoice\\8120000_TianJin\\";
    	String fileName = "invoiceGroup.jasper";
    	String outFileName = printTypeDir + "NewTestPrint.pdf";
    	String strJasperFileName = "file:///" + printTypeDir + fileName;
    	int pageWidth = 0;
    	int pageHeight = 0;
    	Map<String, Object> parameters = new HashMap<String, Object>();
    	parameters.put("SUBREPORT_DIR", printTypeDir);
    	Map<String, Object> printData = new HashMap<String, Object>();
    	List<Map<String, Object>> chargeItems = new ArrayList<Map<String, Object>>();
    	Calendar calendar = Calendar.getInstance();
//    	printData.put("invoiceTitle", invoiceTitle);
		printData.put("invoiceNbr", "211001360120");
		printData.put("invoiceNum", "07339943");
		printData.put("year", calendar.get(Calendar.YEAR));
		printData.put("month", calendar.get(Calendar.MONTH));
		printData.put("day", calendar.get(Calendar.DATE));
		printData.put("invoiceDate", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd"));
		printData.put("soDate", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd"));
		printData.put("invoiceTime", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd hh24:mm:ss"));
		printData.put("partyName", "联创亚信科技（南京）有限公司");
		printData.put("acceNumber", "18976543210");
		printData.put("custOrderId", "370000000077");
		printData.put("custOrderNbr", "37201311070000000077");
		printData.put("chargeItems", chargeItems);
		printData.put("payMethod", "现金");
		printData.put("sumCharge", "6999.0");
		printData.put("sumChargeRMB", "陆仟玖佰玖拾玖元整");
		printData.put("staffName", "测试工号");
		printData.put("staffNumber", "C00298");
		printData.put("channelName", "北京市测试渠道");
		printData.put("prodId", "430000055847");
		printData.put("acctNumber", "37000000000000320");
		printData.put("boActionTypeName", "新装");
    	Collection<Map<String, Object>> inFields = new ArrayList<Map<String, Object>>();
		inFields.add(printData);
    	JRDataSource jrDataSource = new ListDataSource(inFields);
		PdfPrintHelper pdfPrintHelper = new PdfPrintHelper(strJasperFileName, false, pageWidth, pageHeight);
		InputStream inputStream = new ByteArrayInputStream(pdfPrintHelper.byteJasperFile);
		JasperPrint jasperPrint ;
        jasperPrint = JasperFillManager.fillReport(inputStream, parameters, jrDataSource);
        if(pageWidth>0){
            jasperPrint.setPageWidth(pageWidth);
        }
        if(pageHeight>0){
            jasperPrint.setPageHeight(pageHeight);
        }
        
        JasperExportManager.exportReportToPdfFile(jasperPrint, outFileName);
		
	}
}

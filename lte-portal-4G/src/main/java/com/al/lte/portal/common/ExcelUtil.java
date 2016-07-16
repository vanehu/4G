package com.al.lte.portal.common;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;

/**
 * Excel工具类
 * @author ZhangYu 2016-05-13
 *
 */
public class ExcelUtil {

	/**
	 * 以Excel文件形式导出数据，该方法导出的Excel格式为<strong>.xls</strong><br/>
	 * 使用该方法，需要将参数填充，方法将直接返回二进制文件数据流，浏览器将会弹出保存文件对话框，进行保存操作
	 * @param title
	 * <br/>title是浏览器弹出保存文件对话框时默认的文件名，但是这里title不推荐使用中文（如果没有强制要求），否则容易出现文件名乱码问题
	 * @param headers
	 * <br/>headers是导出Excel里的第一行（表头），它是一个二维字符串数组，维度一（headers[0]）需要填写的是数据列的key值，通常是后台接口回参中resultList的key值，表示一列数据；
	 * 维度二（headers[1]）要填写的是列名，将展示在Excel的第一行
	 * @param dataList
	 * <br/>dataList是数据列表，导出Excel的数据来自于这个列表
	 * @param response
	 * <br/>从HttpServletResponse对象获取输出流outputStream
	 * @param transferInfo
	 * <br/>transferInfo用于转义dataList的一些参数，例如{"statusCd":"PC"}，PC表示“派发成功”，展示在Excel里的应当是“派发成功”而不是“PC”。所以，这样封装：
	 * {"statusCd":{"PC":"派发成功"}}，如果不需要转义，则该参数传入<strong>null</strong>即可
	 * @throws BusinessException
	 * @author ZhangYu 2016-05-13
	 */
	@SuppressWarnings("unchecked")
	public static void exportExcelXls(String title, String[][] headers, final List<Map<String, Object>> dataList, HttpServletResponse response, Map<String, Object> transferInfo) throws Exception {
		
		String paramHeaders[] = headers[0];
		String paramNameHeaders[] = headers[1];
		
		response.addHeader("Content-Disposition", "attachment;filename="+new String( title.getBytes("gb2312"), "ISO8859-1" )+".xls");
		response.setContentType("application/binary;charset=utf-8");					 
		ServletOutputStream  outputStream = response.getOutputStream();
		
		//工作簿
		HSSFWorkbook workbook = new HSSFWorkbook();
		//表单
		HSSFSheet sheet = workbook.createSheet(title);
		//列宽度
		sheet.setDefaultColumnWidth(20);
		//标题样式
		HSSFCellStyle headersStyle = workbook.createCellStyle();
		headersStyle.setFillForegroundColor(HSSFColor.SEA_GREEN.index);
		headersStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		headersStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		headersStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		//标题字体
		HSSFFont headersFont = workbook.createFont();
		headersFont.setColor(HSSFColor.BLACK.index);
		headersFont.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
		//应用样式
		headersStyle.setFont(headersFont);
		//内容样式
		HSSFCellStyle contentStyle = workbook.createCellStyle();
		contentStyle.setFillForegroundColor(HSSFColor.LIGHT_YELLOW.index);
		contentStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		contentStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		contentStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		contentStyle.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
		//内容字体
		HSSFFont contentFont = workbook.createFont();
		contentFont.setBoldweight(HSSFFont.BOLDWEIGHT_NORMAL);
		//应用样式
		contentStyle.setFont(contentFont);
		//填充标题行
		HSSFRow rowOfExcel = sheet.createRow(0);
		for(int i = 0; i < paramNameHeaders.length; i++){
			HSSFCell cell = rowOfExcel.createCell(i);
			cell.setCellStyle(headersStyle);
			cell.setCellValue(new HSSFRichTextString(paramNameHeaders[i]));
		}
		
		//填充单元格		
		for (int i = 0; i < dataList.size(); i++) {
			LinkedHashMap<String,Object> dataMap = (LinkedHashMap<String, Object>) dataList.get(i);
			rowOfExcel = sheet.createRow(i+1);
			int k = 0;
			for(String key : paramHeaders){
				if(transferInfo != null && transferInfo.containsKey(key)){
					Map<String, Object> transferInfoMap = (Map<String, Object>) transferInfo.get(key);
					String infoStr = transferInfoMap.get(dataMap.get(key)).toString();
					rowOfExcel.createCell(k++).setCellValue(null == infoStr ? "" : infoStr);
				} else{
					rowOfExcel.createCell(k++).setCellValue(null == dataMap.get(key) ? "" : dataMap.get(key).toString());
				}			
			}
		}

		try {
			workbook.write(outputStream);
		} catch (IOException e) {
			throw new BusinessException(ErrorCode.BATCH_EXPORTEXCEL_ERROR, null, null, e);
		} finally{
			outputStream.close();
		}
	}
	
	/**
	 * 导出Excel为xlsx格式
	 * <br/>使用方法同：
	 * {@link com.al.lte.portal.common.ExcelUtil#exportExcelXls(String, String[][], List, HttpServletResponse, Map)}
	 * @see com.al.lte.portal.common.ExcelUtil#exportExcelXls(String, String[][], List, HttpServletResponse, Map)
	 * @author ZhangYu 2016-05-14
	 */
	@SuppressWarnings("unchecked")
	public static void exportExcelXlsx(String title, String[][] headers, final List<Map<String, Object>> dataList, HttpServletResponse response, Map<String, Object> transferInfo) throws Exception {
		String paramHeaders[] = headers[0];
		String paramNameHeaders[] = headers[1];
		
		response.addHeader("Content-Disposition", "attachment;filename="+new String( title.getBytes("gb2312"), "ISO8859-1" )+".xlsx");
		response.setContentType("application/binary;charset=utf-8");
		ServletOutputStream  outputStream = response.getOutputStream();
		
		XSSFWorkbook workbook = new XSSFWorkbook();
		XSSFSheet sheet = workbook.createSheet(title);
		sheet.setDefaultColumnWidth(20);
		
		//标题样式
		XSSFCellStyle headersStyle = workbook.createCellStyle();
		headersStyle.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND);
		headersStyle.setFillForegroundColor(IndexedColors.GREEN.index);
		headersStyle.setBorderBottom(XSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderLeft(XSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderRight(XSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderTop(XSSFCellStyle.BORDER_THIN);
		headersStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER);
		
		//标题字体
		XSSFFont headersFont = workbook.createFont();
		headersFont.setBoldweight(XSSFFont.BOLDWEIGHT_BOLD);
		headersFont.setColor(Font.COLOR_NORMAL);
		//应用样式
		headersStyle.setFont(headersFont);
		//内容样式
		XSSFCellStyle contentStyle = workbook.createCellStyle();
		//内容字体
		XSSFFont contentFont = workbook.createFont();
		contentFont.setBoldweight(HSSFFont.BOLDWEIGHT_NORMAL);
		//应用样式
		contentStyle.setFont(contentFont);
		
		//填充标题
		XSSFRow rowOfExcel = sheet.createRow(0);
		for(int i = 0; i < paramNameHeaders.length; i++){
			XSSFCell cell = rowOfExcel.createCell(i);
			cell.setCellStyle(headersStyle);
			cell.setCellValue(new XSSFRichTextString(paramNameHeaders[i]));
		}	
		//填充表格
		for (int i = 0; i < dataList.size(); i++) {
			LinkedHashMap<String,Object> dataMap = (LinkedHashMap<String, Object>) dataList.get(i);
			rowOfExcel = sheet.createRow(i+1);
			int k = 0;
			for(String key : paramHeaders){
				if(transferInfo != null && transferInfo.containsKey(key)){
					Map<String, Object> transferInfoMap = (Map<String, Object>) transferInfo.get(key);
					String infoStr = transferInfoMap.get(dataMap.get(key)).toString();
					rowOfExcel.createCell(k++).setCellValue(null == infoStr ? "N/A" : infoStr);
				} else{
					rowOfExcel.createCell(k++).setCellValue(null == dataMap.get(key) ? "N/A" : dataMap.get(key).toString());
				}
			}
		}
		
		try {
			workbook.write(outputStream);
		} catch (IOException e) {
			throw new BusinessException(ErrorCode.BATCH_EXPORTEXCEL_ERROR, null, null, e);
		} finally{
			outputStream.flush();
			outputStream.close();
		}
	}
}

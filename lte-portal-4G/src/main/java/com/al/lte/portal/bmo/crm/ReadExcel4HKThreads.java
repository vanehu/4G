package com.al.lte.portal.bmo.crm;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.CountDownLatch;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

import com.al.ecs.log.Log;

/**
 * 通过多线程<strong>同步</strong>执行解析Excel，以加快解析Excel速度，提高性能
 * @author ZhangYu 2016-04-10
 *
 */
public class ReadExcel4HKThreads implements Runnable {

	private static Log log = Log.getLog(ReadExcel4HKThreads.class);
	
	BatchBmoImpl batchBmoImpl = new BatchBmoImpl();
	volatile String message = "";
	volatile String code = "-1";
	final int columns = 8;//在批开活卡Excel中共有8列数据
	volatile Map<String, Object> returnMap = new HashMap<String, Object>();
	volatile StringBuffer errorData = new StringBuffer();//封装错误信息
	volatile Set<Object> accessNumberSets = new TreeSet<Object>();//号码集合，用于去重校验
	volatile Set<Object> uimSets = new TreeSet<Object>();//UIM卡号集合，用于去重校验
	
	Workbook workbook = null;
	CountDownLatch countDownLatch;
	
	volatile Sheet sheet = null;//这是一个表单
	volatile int totalRows = 0;//一个表单的总行数
	volatile Row row = null;//Excel的一行
	volatile boolean cellIsNull = true;//用于跳过Excel没有数据的空行
	volatile String cellValue = "";//单元格的值
	volatile Cell cellTemp = null;//这是一个单元格，用于跳过Excel没有数据的空行
	volatile Cell cell = null;//这是一个单元格
	volatile int i = 1;//循环遍历行
	volatile int j = 0;
	volatile int k = 0;

	/**
	 * *******尽量不要将上面的变量定义到循环体里面，当Excel数据上W条时，会引起内存溢出同时也不便使用多线程************************
	 */
	
	// 封装Excel的列名称，用于返回错误提示信息时告知用户是哪一列
	Map<Integer, Object> errorData2ShowUser = new HashMap<Integer, Object>() {
		private static final long serialVersionUID = 1L;
		{
			put(0, "客户ID");//Excel第一列对应的内容是客户ID，如该列有错误，将提示对应列的信息，下同
			put(1, "帐户ID");//Excel的第二列
			put(2, "主接入号");//...
			put(3, "UIM卡号");
			put(4, "租机串码");
			put(5, "区号");
			put(6, "联系人");
			put(7, "联系电话");
		}
	};
	
	/**
	 * ReadExcel4HKThreads构造器，这里需要实例化workbook和countDownLatch
	 * @param workbook
	 * @param countDownLatch
	 */
	public ReadExcel4HKThreads(Workbook workbook, CountDownLatch countDownLatch) {
		this.workbook = workbook;
		this.countDownLatch = countDownLatch;
	}

	//synchronized
	public synchronized void run() {
		// 循环读取每个sheet中的数据放入list集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			// 得到当前页sheet
			sheet = workbook.getSheetAt(sheetIndex);
			// 得到Excel的行数
			totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				i = 1;
				for (; i < totalRows; i++) {
					log.debug("*************************read Excel for {} row...", i);
					row = sheet.getRow(i);
					if (null != row) {
						cellIsNull = true;
						k = 0;
						for (; k < columns; k++) {
							cellTemp = row.getCell(k);
							if (null != cellTemp) {
								cellValue = batchBmoImpl.checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;//如果当前行的每一列不为空，则遍历，否则跳过该行
								}
							}
						}
						if (cellIsNull) {
							continue;
						}
						
						//开始循环遍历当前行的每一列数据
						j = 0;
						for(; j < columns; j++){
							cell = row.getCell(j);
							if(j == 0 || j == 1 || j == 2 || j == 3|| j == 5){//第1列、第2列、第3列、第4列、第6列必填
								if(cell != null){
									cellValue = batchBmoImpl.checkExcelCellValue(cell);
									if (cellValue == null || "".equals(cellValue)) {
										errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】单元格为空或单元格格式不正确");
										break;
									} else if (j == 2) {// 第3行接入号
										if (batchBmoImpl.checkAccessNbrReg(cellValue)) {// 接入号去重校验
											if (!accessNumberSets.add(cellValue)) {
												errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "【" + cellValue + "】重复，请检查 ");
												break;
											}
										} else {// 接入号正则校验
											errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "【" + cellValue + "】" + "不符合电信号码规格");
											break;
										}
									} else if (j == 3) {// 第4行UIM卡号
										if (!uimSets.add(cellValue)) {
											errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "【" + cellValue + "】重复，请检查 ");
											break;
										}
									}
								} else{
									errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】单元格为空或单元格格式不正确");
									break;
								}
							}
						}
					}
				}
			} else {
				message = "批量导入出错:导入数据为空";
			}
		}
		this.countDownLatch.countDown();
	}
	
	/**
	 * 所有线程解析Excel完毕后，获取执行结果
	 * @return
	 */
	public Map<String, Object> getReadExcelResult(){
		
		if ("".equals(errorData.toString())) {
			code = "0";
		}

		returnMap.put("errorData", errorData.toString());
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", accessNumberSets.size());//取accessNumberSets的大小，排除重复项(即实际有效行数)

		return returnMap;
	}
}

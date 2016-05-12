package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 批量业务处理类<br/>
 * 主要包含针对各个批量业务场景的Excel解析的方法
 * @author ZhangYu 2016-03-10
 *
 */
@Service("com.al.lte.portal.bmo.crm.BatchBmo")
public class BatchBmoImpl implements BatchBmo {

	private static Log log = Log.getLog(BatchBmoImpl.class);
	
	/**中国电信手机号段正则表达式^(149|133|153|173|177|180|181|189)\\d{8}$*/
	private final String ltePhoneHeadRegExp = ((PropertiesUtils) SpringContextUtil.getBean("propertiesUtils")).getMessage("LTEPHONEHEAD");

	/**
	 * 批量新装解析excle<br/>
	 * #13802，批量新装的时候门户批量新装的模版去掉客户列，调用服务传的custID为定位的客户信息<br/>
	 * 批量新装，Excel模板新增一列“使用人custNumber”，校验客户类型：当客户为政企客户(政企证件)，“使用人custNumber”一列不能为空；公众证件置空
	 * @param workbook
	 * @param batchType
	 * @param str
	 * @return
	 */
	public Map<String, Object> readExcel4NewOrder(final Workbook workbook, final String batchType, String str, final SessionStaff sessionStaff) {
		
		String message = "";
		String code = "-1";
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();//封装错误提示信息
		boolean custFlag;//政企客户(政企证件)：false；个人账户(公众证件)：true	
		
		String segmentId = sessionStaff.getCustSegmentId();
		if("1000".equals(segmentId))//政企客户
			custFlag = false;
		else if("1100".equals(segmentId))//公众客户
			custFlag = true;
		else{
			code = "-1";
			message = "无法获取客户定位的客户分群标识segmentId("+ segmentId +")";
			errorData.append(message);
			returnMap.put("errorData", errorData.toString());
			returnMap.put("code", code);
			returnMap.put("message", message);

			return returnMap;
		}

		// 封装Excel的列名称，用于返回错误提示信息时告知用户是哪一列
		Map<Integer, Object> errorData2ShowUser = new HashMap<Integer, Object>() {
			private static final long serialVersionUID = 1L;
			{
				put(0, "帐户ID");//Excel第一列对应的内容是帐户ID，如该列有错误，将提示对应列的信息，下同
				put(1, "主接入号");//Excel的第二列
				put(2, "UIM卡号");//...
				put(3, "租机串码");
				put(4, "区号");
				put(5, "联系人");
				put(6, "联系电话");
				put(7, "使用人");
			}
		};
		
		final int columns = 8;//在新装Excel中共有8列数据
		Set<Object> accessNumberSets = new TreeSet<Object>();//对接入号进行去重校验
		Set<Object> UIMSets = new TreeSet<Object>();//对UIM卡号进行去重校验
		Sheet sheet = null;//这是一个表单
		int totalRows = 0;//Excel中的当前表单下的总行数
		Row row = null;//Excel中的一行
		Cell cellTemp = null;//这是一个单元格，用于跳过空行
		boolean cellIsNull = true;//用于跳过空行
		String cellValue = "";//单元格的值
		Cell cell = null;//这也是一个单元格，用于获取单元格内容
		int i = 1;
		int k = 0;
		int j = 0;
		
		/**
		 * *******尽量不要将上面的变量定义到循环体里面，当Excel数据上W条时，会引起内存溢出同时也不便使用多线程************************
		 */
		
		// 循环读取每个sheet中的数据放入dataOfExcelList集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex ++) {
			// 得到当前页sheet
			sheet = workbook.getSheetAt(sheetIndex);
			// 得到当前表单的总行数
			totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {//Excel第一行不读取
				i = 1;
				for (; i < totalRows; i++) {
					row = sheet.getRow(i);//获取当前表单的一行
					if (null != row) {
						cellIsNull = true;
						k = 0;
						for (; k < columns; k++) {
							cellTemp = row.getCell(k);
							if (null != cellTemp) {
								cellValue = this.checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;
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
							if(j == 0 || j == 1 || j == 2 || j == 4){//第1列、第2列、第3列、第5列必填
								if(cell != null){
									cellValue = this.checkExcelCellValue(cell);
									if (cellValue == null || "".equals(cellValue)) {
										errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】"+ errorData2ShowUser.get(j) +"单元格为空或单元格格式不正确");
										break;
									} else if (j == 1) {// 第2行接入号
										if (this.checkAccessNbrReg(cellValue)) {// 接入号去重校验
											if (!accessNumberSets.add(cellValue)) {
												errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "【" + cellValue + "】重复，请检查 !");
												break;
											}
										} else {// 接入号正则校验
											errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "【" + cellValue + "】" + "不符合电信号码规格");
											break;
										}
									} else if (j == 2) {// 第3行UIM卡号
										if (!UIMSets.add(cellValue)) {
											errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "【" + cellValue + "】重复，请检查 ");
											break;
										}
									}
								} else{
									errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】"+ errorData2ShowUser.get(j) +"单元格为空或单元格格式不正确");
									break;
								}
							} else if(j == 7 && !custFlag){//第7列使用人，政企客户必填，公众客户非必填
								if(cell != null){
									if (cellValue == null || cellValue.length() == 0) {
										errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】单元格为空或单元格格式不对，政企客户使用人一列不可为空");
										break;
									}
								} else{
									errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】单元格为空或单元格格式不对，政企客户使用人一列不可为空");
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
		
		if ("".equals(errorData.toString())) {
			code = "0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", accessNumberSets.size());//Excel中有效的数据的总行数，排除Excel中的空白行

		return returnMap;
	}

	/**
	 * 批开活卡解析Excel(多线程)
	 * @author ZhangYu 2016-04-10
	 */
	public Map<String, Object> readExcel4HKUseThreads(final Workbook workbook, final String batchType) {
		
		int threadNum = 1;//启用多线程的数量
		CountDownLatch countDownLatch = new CountDownLatch(threadNum);//这个用作使线程同步执行，所有由自己发起的线程执行结束后才开始执行后面的任务
		ReadExcel4HKThreads readExcel4HKThreads = new ReadExcel4HKThreads(workbook, countDownLatch);//创建线程执行的对象
		ExecutorService cachedThreadPool = Executors.newCachedThreadPool();//创建一个线程池

		for(int i = 0; i < threadNum; i++){
			
			/*ReadExcel4HKThreads readExcel4HKThreads = new ReadExcel4HKThreads(workbook, countDownLatch);
			readExcel4HKThreads.run();*/
			
			cachedThreadPool.execute(readExcel4HKThreads);
			
			/*Thread thread = new Thread(readExcel4HKThreads);
			thread.start();*/
		}
		
		try {
			countDownLatch.await();//等待所有由自己发起的线程执行完毕
		} catch (InterruptedException e) {
			//应该做些什么...
		}
		
		cachedThreadPool.shutdown();//关闭线程池
		
		return readExcel4HKThreads.getReadExcelResult();
	}
	
	/**
	 * 批开活卡解析Excel(单线程)
	 * @author ZhangYu 2016-03-10
	 */
	public Map<String, Object> readExcel4HK(final Workbook workbook, final String batchType) {
		
		String message = "";
		String code = "-1";
		final int columns = 8;//在批开活卡Excel中共有8列数据
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();//封装错误信息
		Set<Object> accessNumberSets = new TreeSet<Object>();//号码集合，用于去重校验
		Set<Object> uimSets = new TreeSet<Object>();//UIM卡号集合，用于去重校验
				
		Sheet sheet = null;//这是一个表单
		int totalRows = 0;//一个表单的总行数
		Row row = null;//Excel的一行
		boolean cellIsNull = true;//用于跳过Excel没有数据的空行
		String cellValue = "";//单元格的值
		Cell cellTemp = null;//这是一个单元格，用于跳过Excel没有数据的空行
		Cell cell = null;//这是一个单元格
		int i = 1;
		int k = 0;
		int j = 0;
		
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
								cellValue = this.checkExcelCellValue(cellTemp);
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
							if(j == 0 || j == 1 || j == 2 || j == 3 || j == 5){//第1列、第2列、第3列、第4列、第6列必填
								if(cell != null){
									cellValue = this.checkExcelCellValue(cell);
									if (cellValue == null || "".equals(cellValue)) {
										errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】单元格为空或单元格格式不正确");
										break;
									} else if (j == 2) {// 第3行接入号
										if (this.checkAccessNbrReg(cellValue)) {// 接入号去重校验
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
		
		if ("".equals(errorData.toString())) {
			code = "0";
		}

		returnMap.put("errorData", errorData.toString());
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", accessNumberSets.size());//取accessNumberSets的大小，排除重复项(即实际有效行数)

		return returnMap;
	}

	/**
	 * 批量拆机(8)、批量订购/退订附属(2)、批量在用拆机(14)、批量未激活拆机(15)解析Excel
	 * @param workbook
	 * @return
	 */
	public Map<String, Object> readExcel4Common(final Workbook workbook) {
		
		String message = "";
		String code = "-1";
		final int columns = 2;//在批量拆机、批量订购退订附属Excel中共有2列数据
		
		Map<String,Object> returnMap=new HashMap<String,Object>();
		StringBuffer errorData = new StringBuffer();//封装错误信息
		Set<Object> accessNumberSets = new TreeSet<Object>();//号码集合，用于去重校验
		
		Cell cell = null;//这个一个单元格
		String cellValue = "";//单元格的值
		boolean cellIsNull = true;//用来跳过没有数据的空行
		Row row = null;//这是Excel的一行
		Cell cellTemp = null;//一个单元格
		Sheet sheet = null;//一个表单
		int totalRows = 0;//Excel下一个表单的总行数
		int i = 1;
		int k = 0;
		int j = 0;
		
		/**
		 * *******尽量不要将上面的变量定义到循环体里面，当Excel数据上W条时，会引起内存溢出同时也不便使用多线程************************
		 */
		
		// 封装Excel的列名称，用于返回错误提示信息时告知用户是哪一列
		Map<Integer, Object> errorData2ShowUser = new HashMap<Integer, Object>() {
			private static final long serialVersionUID = 1L;
			{
				put(0, "主接入号");// Excel第一列对应的内容是客户ID，如该列有错误，将提示对应列的信息，下同
				put(1, "区号");// Excel的第二列
			}
		};
		
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			// 得到一个sheet
			sheet = workbook.getSheetAt(sheetIndex);
			// 得到Excel的行数
			totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				i = 1;
				for (; i < totalRows; i++) {
					row = sheet.getRow(i);
					if (null != row) {
						//判断该行的每一列是否为空
						cellIsNull = true;
						k = 0;
						for (; k < columns; k++) {
							cellTemp = row.getCell(k);
							if (null != cellTemp) {
								cellValue = checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;//如果当前行的每一列不为空，则遍历，否则跳过该行
								}
							}
						}
						//如果该行每列为空，则跳过该行
						if (cellIsNull) {
							continue;
						}
						
						//开始循环遍历当前行的每一列数据
						j = 0;
						for(; j < columns; j++){
							cell = row.getCell(j);
							if (cell != null) {
								cellValue = this.checkExcelCellValue(cell);
								if (cellValue == null && "".equals(cellValue)) {
									errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "单元格为空或单元格式不正确");
									break;
								} else {
									if(j == 0){
										//第一列的接入号要进行去重校验和正则校验
										if (this.checkAccessNbrReg(cellValue)) {
											if (!accessNumberSets.add(cellValue)) {
												errorData.append("<br/>接入号【" + cellValue + "】重复，请检查");
												break;
											}
										} else {
											errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】接入号【" + cellValue + "】" + "不符合电信号码规格");
											break;
										}
									}
								}
							}else{
								errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "单元格为空或单元格式不正确");
								break;
							}
						}
					}
				}
			}
		}
		
		if("".equals(errorData.toString())){
			code = "0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", accessNumberSets.size());
		
		return returnMap;
	}

	/**
	 * 批量修改发展人(9)解析Excel
	 * @param workbook
	 * @return
	 */
	public Map<String, Object> readExcel4ExtendCust(final Workbook workbook) {
		String message="";
		String code="-1";
		Map<String,Object> returnMap=new HashMap<String,Object>();
		// 得到第一个sheet
		Sheet sheet = workbook.getSheetAt(0);
		// 得到Excel的行数
		int totalRows = sheet.getPhysicalNumberOfRows();
		StringBuffer errorData = new StringBuffer();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Map<String, Object> item = null;
		for (int i = 1; i < totalRows; i++) {
			item = new HashMap<String, Object>();
			Row row = sheet.getRow(i);
			if (null != row) {
				Cell cell = row.getCell(0);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("<br/>【第" + (i + 1) + "行,第1列】单元格格式不正确");
						break;
					} else if (!"".equals(cellValue)) {
						item.put("accessNumber", cellValue);
					}else{
						errorData.append("<br/>【第" + (i + 1) + "行,第1列】主接入号不能为空");
						break;
					}
				}else{
					errorData.append("<br/>【第" + (i + 1) + "行,第1列】数据读取异常");
					break;
				}
				cell = row.getCell(1);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("<br/>【第" + (i + 1) + "行,第2列】单元格格式不正确");
						break;
					} else if (!"".equals(cellValue)) {
						item.put("zoneNumber", cellValue);
					}else{
						errorData.append("<br/>【第" + (i + 1) + "行,第2列】区号不能为空");
						break;
					}
				}else{
					errorData.append("<br/>【第" + (i + 1) + "行,第2列】数据读取异常");
					break;
				}
				String maindata="";
				cell = row.getCell(2);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("<br/>【第" + (i + 1) + "行,第3列】单元格格式不对");
						break;
					} else if (!"".equals(cellValue)) {
						String maindata1="";
						maindata1=cellValue;
						String[] data1=maindata1.split("@");
						if(data1.length!=4){
							errorData.append("<br/>【第" + (i + 1) + "行,第3列】产品发展人数据格式应为:1@111@222@333");
							break;
						}else{
							boolean ff=false;
							for(int ii=0;ii<data1.length;ii++){
								if("".equals(data1[ii])){
									ff=true;
									errorData.append("<br/>【第" + (i + 1) + "行,第4列】产品发展人数据格式应为:1@111@222@333");
									break;
								}
							}
							if(ff){
								break;
							}
							maindata=maindata1;
						}
					}
				}else{
					errorData.append("<br/>【第" + (i + 1) + "行,第3列】数据读取异常");
					break;
				}
				cell = row.getCell(3);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("<br/>【第" + (i + 1) + "行,第4列】单元格格式不对");
						break;
					} else if (!"".equals(cellValue)) {
						String maindata2="";
						maindata2=cellValue;
						String[] data2=maindata2.split("@");
						if(data2.length!=4){
							errorData.append("<br/>【第" + (i + 1) + "行,第4列】销售品发展人数据格式应为:2@111@222@333");
							break;
						}else{
							boolean ff = false;
							for(int ii = 0; ii < data2.length; ii++){
								if("".equals(data2[ii])){
									ff = true;
									errorData.append("<br/>【第" + (i + 1) + "行,第4列】销售品发展人数据格式应为:2@111@222@333");
									break;
								}
							}
							if(ff){
								break;
							}
							if("".equals(maindata)){
								maindata=maindata2;
							}else{
								maindata=maindata+","+maindata2;
							}
						}
					}
				}else{
					errorData.append("<br/>【第" + (i + 1) + "行,第4列】数据读取异常");
					break;
				}
				if("".equals(maindata)){
					errorData.append("<br/>【第" + (i + 1) + "行】,产品发展人和销售品发展人信息不能同时为空");
					break;
				}else{
					item.put("attr", maindata);
				}
			}
			if (item.size() > 0) {
				list.add(item);
			}
		}
		
		if("".equals(errorData.toString())){
			code="0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("list", list);
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", list.size());
		
		return returnMap;
	}

	/**
	 * 批量订购裸终端Excel解析
	 * @param workbook
	 * @return Map<String,Object>
	 */
	public Map<String, Object> readOrderTerminalExcel(Workbook workbook) {
		
		String message = "";
		String code = "-1";
		final int columns = 3;//在批量订购裸终端Excel中共有3列数据
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();
		List<String> mktResCodeList = null; //保存Excel中串码列，用于去重校验
		Map<String, Object> dataOfRowMap = null;// 记录Excel中的一行数据
		List<Map<String, Object>> dataOfExcelList = new ArrayList<Map<String, Object>>();
		
		//循环读取每个sheet中的数据放入list集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			//获取当前页sheet
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			//获取Excel的行数
			int totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				for (int i = 1; i < totalRows; i++) {
					dataOfRowMap = new HashMap<String, Object>();
					mktResCodeList = new ArrayList<String>(); 
					Row row = sheet.getRow(i);
					if (null != row) {
						boolean cellIsNull = true;
						for (int k = 0; k < columns; k++) {
							Cell cellTemp = row.getCell(k);
							if (null != cellTemp) {
								String cellValue = checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;//如果当前行的每一列不为空，则遍历，否则跳过该行
								}
							}
						}
						if (cellIsNull) {
							continue;
						}
						Cell cell = row.getCell(0);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第1列】单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								dataOfRowMap.put("mktResCode", cellValue);
								if(mktResCodeList.contains(cellValue)){
									errorData.append("<br/>【第" + (i + 1) + "行,第1列】串码【"+cellValue+"】"+"重复");
									break;
								}
								mktResCodeList.add(cellValue);
							}else{
								errorData.append("<br/>【第" + (i + 1) + "行,第1列】串码不能为空");
								break;
							}
						}else{
							errorData.append("<br/>【第" + (i + 1) + "行,第1列】数据读取异常");
							break;
						}
						cell = row.getCell(1);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第2列】单元格格式不正确");
								break;
							} else if (!"".equals(cellValue)) {
								dataOfRowMap.put("salePrice", cellValue);
								if(!this.checkSalePriceReg(cellValue)){
									errorData.append("<br/>【第" + (i + 1) + "行,第2列】价格【"+cellValue+"】输入错误");
									break;
								}
							}else{
								errorData.append("<br/>【第" + (i + 1) + "行,第2列】价格不能为空");
								break;
							}
						}else{
							errorData.append("<br/>【第" + (i + 1) + "行,第2列】数据读取异常");
							break;
						}
						cell = row.getCell(2);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第3列】单元格格式不正确");
								break;
							} else {
								dataOfRowMap.put("dealer", cellValue);
							}
						}else{
							dataOfRowMap.put("dealer", "");
						}
					}
					if (dataOfRowMap.size() > 0) {
						dataOfExcelList.add(dataOfRowMap);
					}
				}
			}
		}

		if("".equals(errorData.toString())){
			code="0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("data", dataOfExcelList);
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", mktResCodeList.size());
		
		return returnMap;
	}
	
	/**
	 * 批量换档、批量换卡Excel解析
	 * @param workbook
	 * @param batchType
	 * @param str
	 * @return returnMap
	 * @author ZhangYu 2016-03-31
	 */
	public Map<String, Object> readExcelBatchChange(final Workbook workbook, final String batchType) {
		
		String message = "";
		String code = "-1";
		final int columns = 2;//在换卡、换档Excel中共有2列数据
		
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();//封装错误提示信息
		Set<String> accessNumberSets = new TreeSet<String>();//接入号去重使用
		Set<String> UIMSets = new TreeSet<String>();//UIM卡号去重使用
		
		Sheet sheet = null;//这是一个表单
		int totalRows = 0;//Excel中一个表单下的总行数
		Row row = null;//这是Excel的一行
		boolean cellIsNull = true;//跳过没有数据的空行
		String cellValue = "";//一个单元格值
		Cell cellTemp = null;//一个单元格
		Cell cell = null;//一个单元格
		int k = 0;
		
		/**
		 * *******尽量不要将上面的变量定义到循环体里面，当Excel数据上W条时，会引起内存溢出同时也不便使用多线程************************
		 */
		
		// 循环读取每个sheet中的数据放入list集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			// 获取当前页sheet
			sheet = workbook.getSheetAt(sheetIndex);
			// 获取Excel的行数
			totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				for (int i = 1; i < totalRows; i++) {
					log.debug("*************************read Excel for {} row...", i);
					row = sheet.getRow(i);
					if (row != null) {
						cellIsNull = true;
						k = 0;
						for (; k < columns; k++) {
							cellTemp = row.getCell(k);
							if (null != cellTemp) {
								cellValue = checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;
								}
							}
						}
						if (cellIsNull) {
							continue;
						}
						// 读取该行第一列数据
						cell = row.getCell(0);
						if(cell != null){
							cellValue = checkExcelCellValue(cell);
							if (cellValue == null || "".equals(cellValue)) {
								errorData.append("<br/>【第" + (i + 1) + "行】【第1列】接入号单元格为空或单元格格式不正确");
								break;
							} else{
								if (this.checkAccessNbrReg(cellValue)) {
									if (!accessNumberSets.add(cellValue)) {
										errorData.append("<br/>接入号【" + cellValue + "】重复，请检查 !");
										break;
									}
								} else {
									errorData.append("<br/>【第" + (i + 1) + "行】【第1列】接入号【" + cellValue + "】" + "不符合电信号码规格");
									break;
								}
							}
						}
						
						// 读取该行第二列数据
						cell = row.getCell(1);
						if(cell != null){
							cellValue = checkExcelCellValue(cell);
							if (cellValue == null || "".equals(cellValue)) {
								if (SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
									errorData.append("<br/>【第" + (i + 1) + "行】【第2列】换档套餐规格ID为空或格式不正确");
								if (SysConstant.BATCHCHANGEUIM.equals(batchType))
									errorData.append("<br/>【第" + (i + 1) + "行】【第2列】UIM卡号为空或格式不正确");
								break;
							} else {
								if (SysConstant.BATCHCHANGEUIM.equals(batchType)) {
									if (!UIMSets.add(cellValue)) {
										errorData.append("<br/>UIM卡号【" + cellValue + "】重复，请检查 !");
										break;
									}
								}
							}
						} else{
							if (SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
								errorData.append("<br/>【第" + (i + 1) + "行】【第2列】换档套餐规格ID为空或格式不正确");
							if (SysConstant.BATCHCHANGEUIM.equals(batchType))
								errorData.append("<br/>【第" + (i + 1) + "行】【第2列】UIM卡号为空或格式不正确");
							break;
						}
					}
				}
			} else {
				message = "批量导入异常:导入数据为空 !";
			}
		}// 循环读取每个sheet中的数据--end

		if ("".equals(errorData.toString())) {
			code = "0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", accessNumberSets.size());//Excel中有效的数据的总行数，排除Excel中的空白行

		return returnMap;
	}
	
	/* @see com.al.lte.portal.bmo.crm.BatchBmo#readExcel4EcsBatch(org.apache.poi.ss.usermodel.Workbook, java.lang.String)
	 * 批量终端领用(16)、批量终端领用回退(17)、批量终端销售(18)Excel解析
	 * @param workbook
	 * @param batchType
	 * @return returnMap
	 * @author ZhangYu 2016-04-21
	 */
	public Map<String, Object> readExcel4EcsBatch(final Workbook workbook, final String batchType) {
		
		String message = "";
		String code = "-1";
		final int columns = 1;//在批量终端领用、批量终端领用回退、批量终端销售Excel中共有1列数据
		
		Map<String,Object> returnMap=new HashMap<String,Object>();
		StringBuffer errorData = new StringBuffer();//封装错误信息
		Set<Object> instCodeSets = new TreeSet<Object>();//终端串码集合，用于去重校验
		
		Cell cell = null;//这个一个单元格
		String cellValue = "";//单元格的值
		boolean cellIsNull = true;//用来跳过没有数据的空行
		Row row = null;//这是Excel的一行
		Cell cellTemp = null;//一个单元格
		Sheet sheet = null;//一个表单
		int totalRows = 0;//Excel下一个表单的总行数
		int k = 0;
		int j = 0;
		
		/**
		 * *******尽量不要将上面的变量定义到循环体里面，当Excel数据上W条时，会引起内存溢出同时也不便使用多线程************************
		 */
		
		// 封装Excel的列名称，用于返回错误提示信息时告知用户是哪一列
		Map<Integer, Object> errorData2ShowUser = new HashMap<Integer, Object>() {
			private static final long serialVersionUID = 1L;
			{
				put(0, "终端串码");
			}
		};
		
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			// 得到一个sheet
			sheet = workbook.getSheetAt(sheetIndex);
			// 得到Excel的行数
			totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				for (int i = 1; i < totalRows; i++) {
					row = sheet.getRow(i);
					if (null != row) {
						//判断该行的每一列是否为空
						cellIsNull = true;
						k = 0;
						for (; k < columns; k++) {
							cellTemp = row.getCell(k);
							if (null != cellTemp) {
								cellValue = checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;//如果当前行的每一列不为空，则遍历，否则跳过该行
								}
							}
						}
						//如果该行每列为空，则跳过该行
						if (cellIsNull) {
							continue;
						}
						
						//开始循环遍历当前行的每一列数据
						j = 0;
						for(; j < columns; j++){
							cell = row.getCell(j);
							if (cell != null) {
								cellValue = this.checkExcelCellValue(cell);
								if (cellValue == null && "".equals(cellValue)) {
									errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "单元格为空或单元格式不正确");
									break;
								} else {
									if (!instCodeSets.add(cellValue)) {
										errorData.append("<br/>" + errorData2ShowUser.get(j) + "【" + cellValue + "】重复，请检查");
										break;
									}
								}
							}else{
								errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "单元格为空或单元格式不正确");
								break;
							}
						}
					}
				}
			}
		}
		
		if(instCodeSets.size() > 10000){
			errorData.append("<br/>导入有效的总记录不能超过10000条（实际有效总记录数为" + instCodeSets.size() + "条）");
		}
		
		if("".equals(errorData.toString())){
			code = "0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", instCodeSets.size());
		
		return returnMap;
	}

	/**
	 * 进度查询下的导入Excel方法<br/>
	 * 该方法将查询该批次下的所有记录，并以Excel文件形式导出
	 * @param title
	 * @param headers
	 * @param dataList
	 * @param out
	 * @author ZhangYu
	 * @throws BusinessException 
	 */
	public void exportExcel(String title, String[] headers, List<Map<String, Object>> dataList, OutputStream outputStream) throws BusinessException {
		//定义工作簿
		HSSFWorkbook workbook = new HSSFWorkbook();
		//定义表单
		HSSFSheet sheet = workbook.createSheet(title);
		//设置表格默认列宽度
		sheet.setDefaultColumnWidth(20);
		//设置标题样式
		HSSFCellStyle headersStyle = workbook.createCellStyle();
		headersStyle.setFillForegroundColor(HSSFColor.SEA_GREEN.index);
		headersStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		headersStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		headersStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		//字体
		HSSFFont headersFont = workbook.createFont();
		headersFont.setColor(HSSFColor.BLACK.index);
		headersFont.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
		//把字体应用到当前的样式
		headersStyle.setFont(headersFont);
		//设置内容样式
		HSSFCellStyle contentStyle = workbook.createCellStyle();
		contentStyle.setFillForegroundColor(HSSFColor.LIGHT_YELLOW.index);
		contentStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		contentStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		contentStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		contentStyle.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
		//生成字体
		HSSFFont contentFont = workbook.createFont();
		contentFont.setBoldweight(HSSFFont.BOLDWEIGHT_NORMAL);
		//把字体应用到当前的样式
		contentStyle.setFont(contentFont);
		//产生表格标题行
		HSSFRow row = sheet.createRow(0);
		for(int i = 0; i < headers.length; i++){
			HSSFCell cell = row.createCell(i);
			cell.setCellStyle(headersStyle);
			cell.setCellValue(new HSSFRichTextString(headers[i]));
		}
		//填充表格数据内容
		for (int i = 0; i < dataList.size(); i++) {
			Map<String,Object> map = (Map<String, Object>) dataList.get(i);
			row = sheet.createRow(i+1);
			int j = 0;
			row.createCell(j++).setCellValue(null == map.get("groupId") ? "" : map.get("groupId").toString());
			row.createCell(j++).setCellValue("".equals(map.get("boProdAn").toString()) ? map.get("accessNumber").toString() : map.get("boProdAn").toString());
			row.createCell(j++).setCellValue(null == map.get("boProd2Td") ? "" : map.get("boProd2Td").toString());//uim卡号
			row.createCell(j++).setCellValue(null == map.get("genOlDt") ? "" : map.get("genOlDt").toString());//受理时间
			
			String statusCdStr;
			if(null == map.get("statusCd")){
				statusCdStr = "无状态信息";
			} else{
				String statusCd = map.get("statusCd").toString();
				if("PC".equals(statusCd))
					statusCdStr = "派发成功";
				else if("PD".equals(statusCd))
					statusCdStr = "派发失败";
				else if("Q".equals(statusCd))
					statusCdStr = "导入成功";
				else if("S".equals(statusCd))
					statusCdStr = "购物车生成成功";
				else if("X".equals(statusCd))
					statusCdStr = "购物车生成失败";
				else if("PW".equals(statusCd))
					statusCdStr = "正在派发中";
				else if("C".equals(statusCd))
					statusCdStr = "发送后端成功";
				else if("PE".equals(statusCd))
					statusCdStr = "等待重新派发";
				else if("F".equals(statusCd))
					statusCdStr = "发送后端失败";
				else if("DL".equals(statusCd))
					statusCdStr = "受理处理中";
				else if("RC".equals(statusCd))
					statusCdStr = "返销成功";
				else
					statusCdStr = "无状态信息";
			}
			
			row.createCell(j++).setCellValue(statusCdStr);
			row.createCell(j++).setCellValue(map.get("msgInfo") == null ? "" : map.get("msgInfo").toString());
			row.createCell(j++).setCellValue(map.get("orderStatusName") == null ? "" : map.get("orderStatusName").toString());
			row.createCell(j++).setCellValue(map.get("transactionId") == null ? "" : map.get("transactionId").toString());//下省流水
			row.createCell(j++).setCellValue(map.get("custSoNumber") == null ? "" : map.get("custSoNumber").toString());//购物车流水
		}
			
		try {
			workbook.write(outputStream);
		} catch (IOException e) {
			throw new BusinessException(ErrorCode.BATCH_EXPORTEXCEL_ERROR, null, null, e);
		}
	}
	
	public void exportExcelEcs(String title, String[] headers, List<Map<String, Object>> dataList, OutputStream outputStream) throws BusinessException {
		//定义工作簿
		HSSFWorkbook workbook = new HSSFWorkbook();
		//定义表单
		HSSFSheet sheet = workbook.createSheet(title);
		//设置表格默认列宽度
		sheet.setDefaultColumnWidth(20);
		//设置标题样式
		HSSFCellStyle headersStyle = workbook.createCellStyle();
		headersStyle.setFillForegroundColor(HSSFColor.SEA_GREEN.index);
		headersStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		headersStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		headersStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		//字体
		HSSFFont headersFont = workbook.createFont();
		headersFont.setColor(HSSFColor.BLACK.index);
		headersFont.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
		//把字体应用到当前的样式
		headersStyle.setFont(headersFont);
		//设置内容样式
		HSSFCellStyle contentStyle = workbook.createCellStyle();
		contentStyle.setFillForegroundColor(HSSFColor.LIGHT_YELLOW.index);
		contentStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		contentStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		contentStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		contentStyle.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
		//生成字体
		HSSFFont contentFont = workbook.createFont();
		contentFont.setBoldweight(HSSFFont.BOLDWEIGHT_NORMAL);
		//把字体应用到当前的样式
		contentStyle.setFont(contentFont);
		//产生表格标题行
		HSSFRow row = sheet.createRow(0);
		for(int i = 0; i < headers.length; i++){
			HSSFCell cell = row.createCell(i);
			cell.setCellStyle(headersStyle);
			cell.setCellValue(new HSSFRichTextString(headers[i]));
		}
		//填充表格数据内容
		for (int i = 0; i < dataList.size(); i++) {
			Map<String,Object> map = (Map<String, Object>) dataList.get(i);
			row = sheet.createRow(i+1);
			int j = 0;
			row.createCell(j++).setCellValue(null == map.get("STORE_NAME") ? "" : map.get("STORE_NAME").toString());
			row.createCell(j++).setCellValue(null == map.get("AREA_NAME") ? "" : map.get("AREA_NAME").toString());
			row.createCell(j++).setCellValue(null == map.get("STATUS_NAME") ? "" : map.get("STATUS_NAME").toString());
			row.createCell(j++).setCellValue(null == map.get("CREATE_DATE") ? "" : map.get("CREATE_DATE").toString());		
			row.createCell(j++).setCellValue(map.get("UPDATE_DATE") == null ? "" : map.get("UPDATE_DATE").toString());
			row.createCell(j++).setCellValue(map.get("LOG_DESC") == null ? "" : map.get("LOG_DESC").toString());
			row.createCell(j++).setCellValue(map.get("REMARK") == null ? "" : map.get("REMARK").toString());
		}
			
		try {
			workbook.write(outputStream);
		} catch (IOException e) {
			throw new BusinessException(ErrorCode.BATCH_EXPORTEXCEL_ERROR, null, null, e);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void exportExcelUtil(String title, String[] headers, List<Map<String, Object>> dataList, OutputStream outputStream, Map<Integer, Object> transferInfo) throws BusinessException {
		//定义工作簿
		HSSFWorkbook workbook = new HSSFWorkbook();
		//定义表单
		HSSFSheet sheet = workbook.createSheet(title);
		//设置表格默认列宽度
		sheet.setDefaultColumnWidth(20);
		//设置标题样式
		HSSFCellStyle headersStyle = workbook.createCellStyle();
		headersStyle.setFillForegroundColor(HSSFColor.SEA_GREEN.index);
		headersStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		headersStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		headersStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		//字体
		HSSFFont headersFont = workbook.createFont();
		headersFont.setColor(HSSFColor.BLACK.index);
		headersFont.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
		//把字体应用到当前的样式
		headersStyle.setFont(headersFont);
		//设置内容样式
		HSSFCellStyle contentStyle = workbook.createCellStyle();
		contentStyle.setFillForegroundColor(HSSFColor.LIGHT_YELLOW.index);
		contentStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		contentStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		contentStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		contentStyle.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
		//生成字体
		HSSFFont contentFont = workbook.createFont();
		contentFont.setBoldweight(HSSFFont.BOLDWEIGHT_NORMAL);
		//把字体应用到当前的样式
		contentStyle.setFont(contentFont);
		//产生表格标题行
		HSSFRow rowOfExcel = sheet.createRow(0);
		for(int i = 0; i < headers.length; i++){
			HSSFCell cell = rowOfExcel.createCell(i);
			cell.setCellStyle(headersStyle);
			cell.setCellValue(new HSSFRichTextString(headers[i]));
		}
		//填充表格数据内容
		
		for (int i = 0; i < dataList.size(); i++) {
			Map<String,Object> dataMap = (Map<String, Object>) dataList.get(i);
			Set<String> keySet = dataMap.keySet();
			rowOfExcel = sheet.createRow(i+1);
			int k = 0;
			for(String key : keySet){
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
		}
	}
	
	/**
	 * 文件上传成功通知服务<br/>
	 * 批量导入的Excel文件上传成功后，调后台接口，完成两件事：1.通知后台(SO)文件上传完成；2.从后台获取批次号(groupId)
	 * @param requestParamMap
	 * @return resultMap
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException
	 * @author ZhangYu 2016-03-11
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getGroupIDfromSOAfterUpload(Map<String, Object> requestParamMap, SessionStaff sessionStaff) throws BusinessException, InterfaceException, IOException, Exception{
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(requestParamMap,PortalServiceCode.INTF_BATCH_FILEUPLOADSUCCESSNOTICE, null, sessionStaff);

		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = (Map<String, Object>)db.getReturnlmap().get("result");
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.batchOrderService/fileUpLoadSuccessNotice服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_IMP_SUBMIT, requestParamMap, db.getReturnlmap(), e);
		}	
		return resultMap;
	}

	/**
	 * 文件上传成功通知服务<br/>
	 * 批量导入的Excel文件上传成功后，调资源(ECS)接口，完成两件事：1.通知资源文件上传完成；2.从资源获取批次号(groupId)
	 * @param requestParamMap
	 * @return resultMap
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException
	 * @author ZhangYu 2016-04-21
	 * @see com.al.lte.portal.bmo.crm.BatchBmo#getEcsNoticedAfterUpload(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	public Map<String, Object> getEcsNoticedAfterUpload(Map<String, Object> requestParamMap, String batchType, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		String portalServiceCode = null;
		
		if(SysConstant.ECSBATCHRECEIVE.equals(batchType)){
			//批量终端领用接口
			portalServiceCode = PortalServiceCode.INTF_BATCH_ECSBATCHRECEIVE;
		} else if(SysConstant.ECSBATCHBACK.equals(batchType)){
			//批量终端领用回退接口
			portalServiceCode = PortalServiceCode.INTF_BATCH_ECSBATCHBACK;
		} else if(SysConstant.ECSBATCHSALE.equals(batchType)){
			//批量终端销售接口
			portalServiceCode = PortalServiceCode.INTF_BATCH_ECSBATCHSALE;
		} else{
			throw new Exception("批量业务受理类型错误[batchType="+batchType+"]");
		}
		
		DataBus db = InterfaceClient.callService(requestParamMap, portalServiceCode, null, sessionStaff);

		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = (Map<String, Object>)db.getReturnlmap();
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("营销资源的" + portalServiceCode + "服务返回的数据异常", e);
			throw new BusinessException(this.getErrorCode2Ecs(batchType), requestParamMap, db.getReturnlmap(), e);
		}
		
		return resultMap;
	}
	

	/**
	 * 0--批开活卡<br/>
	 * 1--批量新装<br/>
	 * 2--批量订购/退订附属<br/>
	 * 3--组合产品纳入退出<br/>
	 * 4--批量修改产品属性<br/>
	 * 5--批量换档(废弃)<br/>
	 * 8--拆机<br/>
	 * 9--批量修改发展人<br/>
	 * 10--批量订购裸终端<br/>
	 * 11--批量换档<br/>
	 * 12--批量换卡
	 * 13--批量一卡双号黑名单
	 * @param templateType 上述0~12
	 * @return 批量业务类型名称，以字符串返回
	 */
	public String getTypeNames(String templateType){		
		return SysConstant.templateTypeMap.get(templateType);
	}

	/**
	 * 获取未来5天的时间列表，精确到“时”，以实现未来5天的预约时间。该方法目前用于批开活卡、批量新装、批量裸机销售等批量受理。
	 * @return 时间列表
	 * @author ZhangYu
	 */
	public List<Map<String, Object>> getTimeListIn5Days() {
		
		String startDate = "";
		String startDateStr = "";
		String hourStr = "";
		
		Map<String, Object> dataMap = null;
		List<Map<String, Object>> timeList = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		int hour = calendar.get(Calendar.HOUR_OF_DAY) + 1;// 小时
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMdd");
		
		// 用于标识获取未来几天的时间列表，当reserveFlag=1时，获取两天时间列表（即预约时间为两天之内）；当reserveFlag=4时，获取五天时间列表（即预约时间为五天之内）。
		 final int reserveFlag = 4;
		for (int i = hour; i < (hour + 24 * reserveFlag); i++) {
			dataMap = new HashMap<String, Object>();
			if (i > (23 + 24 * 3) && i <= (23 + 24 * 4)) {
				hourStr = "00".substring(String.valueOf(i - 24 * 4).length()) + String.valueOf(i - 24 * 4);
				startDateStr = "第五日" + String.valueOf(i - 24 * 4) + "时";
				if (i == (23 + 24 * 3) + 1) {
					calendar.add(Calendar.DAY_OF_MONTH, 1);
				}
			} else if (i > (23 + 24 * 2) && i <= (23 + 24 * 3)) {
				hourStr = "00".substring(String.valueOf(i - 24 * 3).length()) + String.valueOf(i - 24 * 3);
				startDateStr = "第四日" + String.valueOf(i - 24 * 3) + "时";
				if (i == (23 + 24 * 2) + 1) {
					calendar.add(Calendar.DAY_OF_MONTH, 1);
				}
			} else if (i > (23 + 24 * 1) && i <= (23 + 24 * 2)) {
				hourStr = "00".substring(String.valueOf(i - 24 * 2).length()) + String.valueOf(i - 24 * 2);
				startDateStr = "第三日" + String.valueOf(i - 24 * 2) + "时";
				if (i == (23 + 24 * 1) + 1) {
					calendar.add(Calendar.DAY_OF_MONTH, 1);
				}
			} else if (i > 23 && i <= (23 + 24 * 1)) {
				hourStr = "00".substring(String.valueOf(i - 24 * 1).length()) + String.valueOf(i - 24 * 1);
				startDateStr = "次日" + String.valueOf(i - 24 * 1) + "时";
				if (i == 23 + 1) {
					calendar.add(Calendar.DAY_OF_MONTH, 1);
				}
			} else {
				hourStr = "00".substring(String.valueOf(i).length()) + String.valueOf(i);
				startDateStr = "当日" + String.valueOf(i) + "时";
			}
			startDate = simpleDateFormat.format(calendar.getTime()) + hourStr + "0000";
			dataMap.put("date", startDate);
			dataMap.put("dateStr", startDateStr);
			timeList.add(dataMap);
		}
		return timeList;
	}
	
	public List<Map<String,Object>> getTimeList(){
		List<Map<String,Object>> time=new ArrayList<Map<String,Object>>(); 
    	Calendar ca = Calendar.getInstance();
		int hour=ca.get(Calendar.HOUR_OF_DAY)+1;//小时 
		String startDate="";
		String startDateStr="";
		String hourStr="";
    	SimpleDateFormat sp=new SimpleDateFormat("yyyyMMdd");
    	int flag=0;
    	HashMap<String,Object> map=null;
    	for(int i=hour;i<hour+24;i++){
    		map=new HashMap<String,Object>();
    		if(i>23){
    			hourStr="00".substring(String.valueOf(i-24).length())+String.valueOf(i-24);
    			startDateStr="次日"+String.valueOf(i-24)+"时";
    			if(flag==0){
    				ca.add(Calendar.DAY_OF_MONTH, 1);
    				flag++;
    			}
        	}else{
        		hourStr="00".substring(String.valueOf(i).length())+String.valueOf(i);
        		startDateStr="当日"+String.valueOf(i)+"时";
        	}
        	startDate=sp.format(ca.getTime())+hourStr+"0000";
        	map.put("date", startDate);
        	map.put("dateStr", startDateStr);
        	time.add(map);
    	}
    	return time;
	}
	
	/**
	 * Excel单元格校验<br/>
	 * 入参cell不可为null，否则抛异常<br/>
	 * 单元格为空或者不是文本(字符串)格式，则返回""空字符串，不会返回null<br/>
	 * Updated by ZhangYu 2016-04-01
	 * @param cell
	 * @return cellValue
	 */
	protected String checkExcelCellValue(Cell cell) {
		String cellValue = null;
		if(cell.getCellType() == Cell.CELL_TYPE_BLANK){
			cellValue = "";
		}else if (cell.getCellType() == Cell.CELL_TYPE_STRING) {
			cellValue = cell.getStringCellValue();
		}
		if(cellValue != null){
			cellValue = cellValue.trim();
		}
		return cellValue;
	}
	
	/**
	 * 正则校验：批量换卡、换档套餐ID是否为数字(目前没有提出需求，暂时未使用)
	 * @param cellValue
	 * @return 校验成功返回<strong>true</strong>，否则返回<strong>false</strong>
	 * @author ZhangYu
	 */
	protected boolean checkOfferSpecIdReg(String cellValue){
		return Pattern.matches("^[1-9]\\d*|0$", cellValue);//匹配整数
		
	}
	
	/**
	 * 号码正则校验：判断是否符合电信手机号码规格   
	 * @param cellValue
	 * @return 校验成功返回<strong>true</strong>，否则返回<strong>false</strong>
	 * @author ZhangYu
	 */
	protected boolean checkAccessNbrReg(String cellValue){
//		"^(149|133|153|173|177|180|181|189)\\d{8}$"
		return Pattern.matches(this.ltePhoneHeadRegExp, cellValue);
		
	}
	
	/**
	 * UIM卡号正则校验
	 * @param cellValue
	 * @return 校验成功返回<strong>true</strong>，否则返回<strong>false</strong>
	 * @author ZhangYu
	 */
	/*private boolean checkUIMReg(String cellValue){
		return Pattern.matches("^$", cellValue);
		
	}*/
	
	/**
	 * 正则校验：批量订购裸终端Excel中的价格列
	 * @param cellValue
	 * @return 校验成功返回<strong>true</strong>，否则返回<strong>false</strong>
	 */
	private boolean checkSalePriceReg(String cellValue){
		/*Pattern pattern = Pattern.compile("^[0-9]+(.[0-9]{1,2})?$");
		Matcher matcher = pattern.matcher(cellValue);
		if(!matcher.matches()){
			errorData.append("【第" + (i + 1) + "行,第2列】价格输入错误");
			break;
		}*/
		return Pattern.matches("^[0-9]+(.[0-9]{1,2})?$", cellValue);
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售拼装参数
	 * @param batchType
	 * @param fromRepositoryID
	 * @param destRepositoryID
	 * @param destStatusCd
	 * @return resultMap
	 */
	public Map<String, Object> getParam2Ecs(String batchType, String fromRepositoryID, String destRepositoryID, String destStatusCd){
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		if (SysConstant.ECSBATCHRECEIVE.equals(batchType)) {// 批量终端领用
			if(!(destRepositoryID == null || "".equals(destRepositoryID))){
				resultMap.put("toStoreId", destRepositoryID);
			}
		} else if(SysConstant.ECSBATCHBACK.equals(batchType)) {// 批量终端领用回退
			if(!(fromRepositoryID == null || "".equals(fromRepositoryID))){
				resultMap.put("fromStoreId", fromRepositoryID);
			}
		} else if(SysConstant.ECSBATCHSALE.equals(batchType)) {// 批量终端销售
			if(fromRepositoryID == null || "".equals(fromRepositoryID)){
			} else if(destStatusCd == null || "".equals(destStatusCd)){
			} else{
				resultMap.put("fromStoreId", fromRepositoryID);
				resultMap.put("toStatusCd", destStatusCd);
			}
		}
		
		resultMap.put("batchType", batchType);
		
		return resultMap;
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售获取错误编码ErrorCode
	 * @param batchType
	 * @return
	 */
	public ErrorCode getErrorCode2Ecs(String batchType){
		
		ErrorCode errorCode = null;		
		
		if (SysConstant.ECSBATCHRECEIVE.equals(batchType)) {// 批量终端领用
			errorCode = ErrorCode.BATCH_ECS_RECEIVE;
		} else if(SysConstant.ECSBATCHBACK.equals(batchType)) {// 批量终端领用回退
			errorCode = ErrorCode.BATCH_ECS_BACK;
		} else if(SysConstant.ECSBATCHSALE.equals(batchType)) {// 批量终端销售
			errorCode = ErrorCode.BATCH_ECS_SALE;
		}
		
		return errorCode;
	}
	
	/**
	 * 批量一卡双号Excel解析
	 * @param workbook
	 * @return Map<String,Object>
	 */
	public Map<String, Object> readBlacklistTerminalExcel(Workbook workbook) {
		
		String message = "";
		String code = "-1";
		final int columns = 5;//在批量一卡双号Excel中共有5列数据
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();
		List<String> BlackList = null; //保存Excel中串码列，用于去重校验
		Map<String, Object> dataOfRowMap = null;// 记录Excel中的一行数据
		List<Map<String, Object>> dataOfExcelList = new ArrayList<Map<String, Object>>();
		
		//循环读取每个sheet中的数据放入list集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			//获取当前页sheet
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			//获取Excel的行数
			int totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				for (int i = 1; i < totalRows; i++) {
					dataOfRowMap = new HashMap<String, Object>();
					BlackList = new ArrayList<String>(); 
					Row row = sheet.getRow(i);
					if (null != row) {
						boolean cellIsNull = true;
						for (int k = 0; k < columns; k++) {
							Cell cellTemp = row.getCell(k);
							if (null != cellTemp) {
								String cellValue = checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;//如果当前行的每一列不为空，则遍历，否则跳过该行
								}
							}
						}
						if (cellIsNull) {
							continue;
						}
						
						Cell cell = row.getCell(0);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第1列】单元格格式不正确");
								break;
							} else {
								dataOfRowMap.put("mainAreaId", cellValue);
							}
						}else{
							dataOfRowMap.put("mainAreaId", "");
						}
						cell = row.getCell(1);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第2列】单元格格式不正确");
								break;
							} else if (!"".equals(cellValue)) {
								dataOfRowMap.put("mainAccNbr", cellValue);
								if(!this.checkAccessNbrReg(cellValue)){
									errorData.append("<br/>【第" + (i + 1) + "行,第2列】主号号码【"+cellValue+"】输入错误");
									break;
								}
							}else{
								errorData.append("<br/>【第" + (i + 1) + "行,第2列】主号号码不能为空");
								break;
							}
						}else{
							errorData.append("<br/>【第" + (i + 1) + "行,第2列】数据读取异常");
							break;
						}
						cell = row.getCell(2);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第3列】单元格格式不正确");
								break;
							} else {
								dataOfRowMap.put("virtualAreaId", cellValue);
							}
						}else{
							dataOfRowMap.put("virtualAreaId", "");
						}
						cell = row.getCell(3);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第4列】单元格格式不正确");
								break;
							} else if (!"".equals(cellValue)) {
								dataOfRowMap.put("virtualAccNbr", cellValue);
								if(!this.checkAccessNbrReg(cellValue)){
									errorData.append("<br/>【第" + (i + 1) + "行,第4列】虚号号码【"+cellValue+"】输入错误");
									break;
								}
							}else{
								errorData.append("<br/>【第" + (i + 1) + "行,第4列】虚号号码不能为空");
								break;
							}
						}else{
							errorData.append("<br/>【第" + (i + 1) + "行,第4列】数据读取异常");
							break;
						}
						cell = row.getCell(4);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第5列】单元格格式不正确");
								break;
							} else {
								dataOfRowMap.put("reason", cellValue);
							}
						}else{
							dataOfRowMap.put("reason", "");
						}
					}
					if (dataOfRowMap.size() > 0) {
						dataOfExcelList.add(dataOfRowMap);
					}
				}
			}
		}

		if("".equals(errorData.toString())){
			code="0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("data", dataOfExcelList);
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", BlackList.size());
		
		return returnMap;
	}

	/* 批量终端领用、批量终端领用回退、批量终端销售批次查询
	 * @see com.al.lte.portal.bmo.crm.BatchBmo#queryEcsBatchOrder(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryEcsBatchOrderList(Map<String, Object> qryParamMap, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, Exception {		
		
		if(qryParamMap.get("mktResBatchType") == null || "".equals(qryParamMap.get("mktResBatchType"))) {
			//ErrorCode.PORTAL_INPARAM_ERROR
			throw new IOException("入参中缺失mktResBatchType");
		}
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(qryParamMap, PortalServiceCode.INTF_BATCH_QRYECSBATCHORDER, optFlowNum, sessionStaff);		
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//数据返回正常					
					List<Map<String, Object>> resultList = null;
					if(returnData.get("resultList") != null){
						resultList = (List<Map<String, Object>>) returnData.get("resultList");
					} else{
						resultList = new ArrayList<Map<String, Object>>();
					}
					resultMap.put("resultList", resultList);
					resultMap.put("totalResultNum", returnData.get("totalResultNum"));
					resultMap.put("code", ResultCode.R_SUCCESS);
				}
			} else{
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("资源营销的SRHttpServiceWeb/service/EcsTerminalService/queryEcsBatchInfo服务返回数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_ECS_QUERY, qryParamMap, db.getReturnlmap(), e);
		}	
		return resultMap;
	}

	/*批量终端领用、批量终端领用回退、批量终端销售批次详情查询
	 * @see com.al.lte.portal.bmo.crm.BatchBmo#queryEcsBatchOrderDetail(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryEcsBatchOrderDetailList(Map<String, Object> qryParamMap, String optFlowNum, SessionStaff sessionStaff) throws BusinessException, InterfaceException, Exception {
		
		if(qryParamMap.get("batchId") == null || "".equals(qryParamMap.get("batchId"))) {
			//ErrorCode.PORTAL_INPARAM_ERROR
			throw new IOException("入参中缺失batchId");
		}
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(qryParamMap, PortalServiceCode.INTF_BATCH_QRYECSBATCHORDERDETAIL, optFlowNum, sessionStaff);		
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//数据返回正常					
					List<Map<String, Object>> resultList = null;
					if(returnData.get("resultList") != null){
						resultList = (List<Map<String, Object>>) returnData.get("resultList");
					} else{
						resultList = new ArrayList<Map<String, Object>>();
					}
					resultMap.put("resultList", resultList);
					resultMap.put("totalResultNum", returnData.get("totalResultNum"));
					resultMap.put("code", ResultCode.R_SUCCESS);
				}
			} else{
				resultMap.put("code",  ResultCode.R_EXCEPTION);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("资源营销的SRHttpServiceWeb/service/EcsTerminalService/queryEcsBatchLogDetail服务返回数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_ECS_QUERYDETAIL, qryParamMap, db.getReturnlmap(), e);
		}	
		return resultMap;
	}

	/* 根据staffId向营销资源查询仓库列表
	 * @see com.al.lte.portal.bmo.crm.BatchBmo#queryEcsRepositoryByStaffID(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryEcsRepositoryByStaffID(Map<String, Object> qryParamMap, String optFlowNum, SessionStaff sessionStaff) throws BusinessException, InterfaceException, Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(qryParamMap, PortalServiceCode.INTF_BATCH_QRYECSBATCHREPOSITORY, optFlowNum, sessionStaff);		
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//数据返回正常					
					List<Map<String, Object>> resultList = null;
					if(returnData.get("resultList") != null){
						resultList = (List<Map<String, Object>>) returnData.get("resultList");
					} else{
						resultList = new ArrayList<Map<String, Object>>();
					}
					resultMap.put("resultList", resultList);
					resultMap.put("totalResultNum", returnData.get("totalResultNum"));
					resultMap.put("code", ResultCode.R_SUCCESS);
				}
			} else{
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("资源营销的SRHttpServiceWeb/service/EcsTerminalService/queryEcsStoreByStaffId服务返回数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_ECS_REPOSITORY, qryParamMap, db.getReturnlmap(), e);
		}	
		return resultMap;
	}
}
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

	/**
	 * 批量新装解析excle<br/>
	 * #13802，批量新装的时候门户批量新装的模版去掉客户列，调用服务传的custID为定位的客户信息<br/>
	 * 批量新装，Excel模板新增一列“使用人custNumber”，校验客户类型：当客户为政企客户(政企证件)，“使用人custNumber”一列不能为空；公众证件置空
	 * @param workbook
	 * @param batchType
	 * @param str
	 * @return
	 */
	public Map<String, Object> readExcel4NewOrder(Workbook workbook, String batchType, String str, SessionStaff sessionStaff) {
		
		String message = "";
		String code = "-1";
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();
		boolean custFlag;//政企客户(政企证件)：false；个人账户(公众证件)：true	
		final int columns = 8;//在新装Excel中共有8列数据
		
		String segmentId = sessionStaff.getCustSegmentId();
		if("1000".equals(segmentId))//政企客户
			custFlag = false;
		else if("1100".equals(segmentId))//公众客户
			custFlag = true;
		else{
			code = "-1";
			message = "无法获取客户定位的客户分群标识segmentId";
			errorData.append(message);
			returnMap.put("errorData", errorData.toString());
			returnMap.put("code", code);
			returnMap.put("message", message);

			return returnMap;
		}
		
		List<Map<String, Object>> dataOfExcelList = new ArrayList<Map<String, Object>>();//Excel所有读取到的数据
		List<Map<String, Object>> accessNumberList = new ArrayList<Map<String, Object>>();//记录Excel所有读取到的接入号
		List<Map<String, Object>> uimList = new ArrayList<Map<String, Object>>();//记录Excel所有读取到的UIM卡号
		Set<Object> phoneSets = new TreeSet<Object>();//对所有读取到的接入号进行去重校验
		Set<Object> uimSets = new TreeSet<Object>();//对所有读取到的UIM卡号进行去重校验
		Map<String, Object> dataOfRowMap = null;//Excel中一行数据
		Map<String, Object> accessNumberMap = null;//记录每行数据中的接入号
		Map<String, Object> uimMap = null;//记录每行数据中的UIM卡号
		
		// 循环读取每个sheet中的数据放入dataOfExcelList集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex ++) {
			// 得到当前页sheet
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			// 得到当前表单的总行数
			int totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {//Excel第一行不读取
				for (int i = 1; i < totalRows; i++) {
					dataOfRowMap = new HashMap<String, Object>();
					accessNumberMap = new HashMap<String, Object>();
					uimMap = new HashMap<String, Object>();
					Row row = sheet.getRow(i);//获取当前表单的一行
					if (null != row) {
						boolean cellIsNull = true;
						for (int k = 0; k < columns; k++) {
							Cell cellTemp = row.getCell(k);
							if (null != cellTemp) {
								String cellValue = this.checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;
								}
							}
						}
						if (cellIsNull) {
							continue;
						}
						dataOfRowMap.put("custId", str);
						Cell cell = row.getCell(0);
						if (null != cell) {
							String cellValue = this.checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第1列】单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								dataOfRowMap.put("accountId", cellValue);
							} else {
								errorData.append("<br/>【第" + (i + 1) + "行,第1列】帐户ID不能为空");
								break;
							}
						} else {
							errorData.append("<br/>【第" + (i + 1) + "行,第1列】帐户ID不能为空");
							break;
						}
						cell = row.getCell(1);
						if (null != cell) {
							String cellValue = this.checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第2列】单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								dataOfRowMap.put("accessNumber", cellValue);
								accessNumberMap.put("phoneNum", cellValue);
							} else {
								errorData.append("<br/>【第" + (i + 1) +  "行,第2列】主接入号不能为空");
								break;
							}
						} else {
							errorData.append("<br/>【第" + (i + 1) + "行,第2列】主接入号不能为空");
							break;
						}
						cell = row.getCell(2);
						if (null != cell) {
							String cellValue = this.checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第3列】单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								dataOfRowMap.put("uim", cellValue);
								uimMap.put("instCode", cellValue);
								accessNumberMap.put("mktResInstCode", cellValue);
							} else {
								errorData.append("<br/>【第" + (i + 1) + "行,第3列】UIM卡号不能为空");
								break;
							}
						} else {
							errorData.append("<br/>【第" + (i + 1) + "行,第3列】UIM卡号不能为空");
							break;
						}
						cell = row.getCell(3);
						if (null != cell) {
							String cellValue = this.checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第4列】单元格格式不对");
								break;
							} else {
								if ("".equals(cellValue)) {
									cellValue = "0";
								}
								dataOfRowMap.put("rentCoupon", cellValue);
							}
						} else {
							dataOfRowMap.put("rentCoupon", "0");
						}
						cell = row.getCell(4);
						if (null != cell) {
							String cellValue = this.checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行,第5列】单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								dataOfRowMap.put("zoneNumber", cellValue);
							} else {
								errorData.append("<br/>【第" + (i + 1) + "行,第5列】区号不能为空");
								break;
							}
						} else {
							errorData.append("<br/>【第" + (i + 1) + "行,第5列】区号不能为空");
							break;
						}
						if (batchType.equals(SysConstant.BATCHNEWORDER) || batchType.equals(SysConstant.BATCHHUOKA)) {
							cell = row.getCell(5);
							if (null != cell) {
								String cellValue = this.checkExcelCellValue(cell);
								if (cellValue == null) {
									errorData.append("<br/>【第" + (i + 1) + "行,第6列】单元格格式不对");
									break;
								} else {
									dataOfRowMap.put("linkman", cellValue);
								}
							} else {
								dataOfRowMap.put("linkman", "");
							}
							cell = row.getCell(6);
							if (null != cell) {
								String cellValue = this.checkExcelCellValue(cell);
								if (cellValue == null) {
									errorData.append("<br/>【第" + (i + 1) + "行,第7列】单元格格式不对");
									break;
								} else {
									dataOfRowMap.put("linknumber", cellValue);
								}
							} else {
								dataOfRowMap.put("linknumber", "");
							}
						} else {
							dataOfRowMap.put("linkman", "");
							dataOfRowMap.put("linknumber", "");
						}
						//校验“批量新装”新增的一列“使用人” ZhangYu 2015-09-07
						if (SysConstant.BATCHNEWORDER.equals(batchType)) {
							cell = row.getCell(7);
							if (null != cell && !custFlag) {
								String cellValue = this.checkExcelCellValue(cell);
								if (cellValue == null || cellValue.length() == 0) {
									errorData.append("<br/>【第" + (i + 1) + "行,第8列】单元格格式不对，政企客户使用人一列不可为空。");
									break;
								} else {
									dataOfRowMap.put("custNumber", cellValue);//Excel中第8列“使用人”
								}
							} else if(!custFlag && null == cell){
								errorData.append("<br/>【第" + (i + 1) + "行,第8列】单元格格式不对，政企客户使用人一列不可为空。");
								break;								
							} else{
								dataOfRowMap.put("custNumber", "");
							}
						}
					}
					if (dataOfRowMap.size() > 0) {
						dataOfExcelList.add(dataOfRowMap);
					}
					if (accessNumberMap.size() > 0) {
						accessNumberList.add(accessNumberMap);
					}
					if (uimMap.size() > 0) {
						uimList.add(uimMap);
					}
				}

			} else {
				message = "批量导入出错:导入数据为空";
			}
		}

		// 循环完成再做号码和号卡去重判断
		for (Map<String, Object> phoneMap : accessNumberList) {
			Object phoneNum = phoneMap.get("phoneNum");
			if (!phoneSets.add(phoneNum)) {
				errorData.append("<br/>接入号【" + phoneNum + "】重复，请检查!");
				break;
			}
		}
		for (Map<String, Object> uimVariableMap : uimList) {
			Object uimObj = uimVariableMap.get("instCode");
			if (!uimSets.add(uimObj)) {
				errorData.append("<br/>UIM卡【" + uimObj + "】重复，请检查!");
				break;
			}
		}
		
		if ("".equals(errorData.toString())) {
			code = "0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("mktResInstList", accessNumberList);
		returnMap.put("list", dataOfExcelList);
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", phoneSets.size());//Excel中有效的数据的总行数，排除Excel中的空白行

		return returnMap;
	}

	/**
	 * 批开活卡解析Excel
	 * @author ZhangYu 2016-03-10
	 */
	public Map<String, Object> readExcel4HK(Workbook workbook, String batchType) {
		
		log.debug("*************************start to reading Excel...{}", System.currentTimeMillis());
		
		String message = "";
		String code = "-1";
		final int columns = 8;//在批开活卡Excel中共有8列数据
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();
		
		Map<String, Object> dataOfRowMap = null;//记录Excel的一行数据
		Map<String, Object> accessNumberMap = null;//记录每一列的号码，一行读取完毕后，封装到accessNumberList中用于去重校验
		Map<String, Object> uimMap = null;//记录每一列的UIM卡号，一行读取完毕后，封装到uimList中用于去重校验
		List<Map<String, Object>> accessNumberList = new ArrayList<Map<String, Object>>();//记录Excel的号码列，用于去重校验
		List<Map<String, Object>> uimList = new ArrayList<Map<String, Object>>();//记录Excel的UIM卡号列，用于去重校验
		List<Map<String, Object>> dataOfExcelList = new ArrayList<Map<String, Object>>();//记录Excel的每行数据
		Set<Object> accessNumberSets = new TreeSet<Object>();//号码集合，用于去重校验
		Set<Object> uimSets = new TreeSet<Object>();//UIM卡号集合，用于去重校验
		
		//封装请求参数
		Map<Integer, Object> requestParamMap = new HashMap<Integer, Object>(){
			/**
			 * 这行代码作用是？
			 */
			private static final long serialVersionUID = 1L;

			{
			 put(0, "custId");//Excel第一列对应的请求参数是客户ID:custId，下同
			 put(1, "accountId");//Excel的第二列
			 put(2, "accessNumber");//...
			 put(3, "uim");
			 put(4, "rentCoupon");
			 put(5, "zoneNumber");
			 put(6, "linkman"); 
			 put(7, "linknumber"); 
			 }
		};
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
		
		log.debug("*************************int params ended...{}", System.currentTimeMillis());
		
		// 循环读取每个sheet中的数据放入list集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			// 得到当前页sheet
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			// 得到Excel的行数
			int totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				log.debug("*************************totalRows of Excel...{}", totalRows);
				for (int i = 1; i < totalRows; i++) {
					log.debug("*************************read Excel for {} row...", i);
					dataOfRowMap = new HashMap<String, Object>();
					accessNumberMap = new HashMap<String, Object>();
					uimMap = new HashMap<String, Object>();
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
						//开始循环遍历当前行的每一列数据
						for(int j = 0; j < columns; j++){
							Cell cell = row.getCell(j);
							if(j == 4 || j == 6 || j == 7){//第5列、第7列、第8列非必填
								if (null != cell) {
									String cellValue = checkExcelCellValue(cell);
									if (cellValue == null) {
										errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】单元格格式不正确");
										break;
									} else {
										if ("".equals(cellValue)) {
											cellValue = "";
										}
										dataOfRowMap.put(requestParamMap.get(j).toString(), cellValue);
									}
								} else {
									dataOfRowMap.put(requestParamMap.get(j).toString(), "");
								}
							} else{//第1列、第2列、第3列、第4列、第6列必填
								if (null != cell) {
									String cellValue = checkExcelCellValue(cell);
									if (cellValue == null) {
										errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】单元格格式不正确");
										break;
									} else if (!"".equals(cellValue)) {
										dataOfRowMap.put(requestParamMap.get(j).toString(), cellValue);
										switch(j){
											case 2:accessNumberMap.put(requestParamMap.get(j).toString(), cellValue);break;//封装主接入号用于去重校验
											case 3:uimMap.put(requestParamMap.get(j).toString(), cellValue);break;//封装UIM用于去重校验
											default:;
										}
									} else {
										errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "不能为空");
										break;
									}
								} else {
									errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "不能为空");
									break;
								}
							}
							
						}
					}
										
					if (dataOfRowMap.size() > 0) {
						dataOfExcelList.add(dataOfRowMap);
					}
					if (accessNumberMap.size() > 0) {
						accessNumberList.add(accessNumberMap);
					}
					if (uimMap.size() > 0) {
						uimList.add(uimMap);
					}
					
					if(i % 1000 == 0){
						System.gc();
					}
				}
			} else {
				message = "批量导入出错:导入数据为空";
			}

		}
		
		log.debug("*************************check repetition now {}...", System.currentTimeMillis());

		// 循环完成再做号码、号卡去重判断
		for (Map<String, Object> phoneMap : accessNumberList) {
			Object phoneNum = phoneMap.get("accessNumber");
			if (!accessNumberSets.add(phoneNum)) {
				errorData.append("<br/>接入号【" + phoneNum + "】重复，请检查!");
				break;
			}
		}
		for (Map<String, Object> uMap : uimList) {
			Object uim = uMap.get("uim");
			if (!uimSets.add(uim)) {
				errorData.append("<br/>UIM卡【" + uim + "】重复!");
				break;
			}
		}
		
		if ("".equals(errorData.toString())) {
			code = "0";
		}
		
		log.debug("*************************read Excel ended now {}...", System.currentTimeMillis());

		returnMap.put("errorData", errorData.toString());
		returnMap.put("list", dataOfExcelList);
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", accessNumberSets.size());//取accessNumberSets的大小，排除重复项(即实际有效行数)

		return returnMap;
	}

	/**
	 * 批量拆机(8)、批量订购/退订附属(2)解析Excel
	 * @param workbook
	 * @return
	 */
	public Map<String, Object> readExcel4Common(Workbook workbook) {
		
		String message="";
		String code="-1";
		final int columns = 2;//在批量拆机、批量订购退订附属Excel中共有2列数据
		Map<String,Object> returnMap=new HashMap<String,Object>();
		StringBuffer errorData = new StringBuffer();
		Map<String, Object> dataOfRowMap = null;//记录Excel的一行数据
		List<Map<String, Object>> dataOfExcelList = new ArrayList<Map<String, Object>>();//记录Excel的每行数据
		Set<Object> accessNumberSets = null;//号码集合，用于去重校验
		
		// 封装请求参数
		Map<Integer, Object> requestParamMap = new HashMap<Integer, Object>() {
			private static final long serialVersionUID = 1L;

			{
				put(0, "accessNumber");// Excel第一列对应的请求参数是客户ID:custId，下同
				put(1, "zoneNumber");// Excel的第二列
			}
		};
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
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			// 得到Excel的行数
			int totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				for (int i = 1; i < totalRows; i++) {
					dataOfRowMap = new HashMap<String, Object>();
					accessNumberSets = new TreeSet<Object>();
					Row row = sheet.getRow(i);
					if (null != row) {
						//判断该行的每一列是否为空
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
						//如果该行每列为空，则跳过该行不读取数据
						if (cellIsNull) {
							continue;
						}
						//开始循环遍历当前行的每一列数据
						for(int j = 0; j < columns; j++){
							Cell cell = row.getCell(j);
							if (null != cell) {
								String cellValue = checkExcelCellValue(cell);
								if (cellValue == null) {
									errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "单元格格式不正确");
									break;
								} else if (!"".equals(cellValue)) {
									dataOfRowMap.put(requestParamMap.get(j).toString(), cellValue);
								}else{
									errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "不能为空");
									break;
								}
							}else{
								errorData.append("<br/>【第" + (i + 1) + "行,第" + (j + 1) + "列】" + errorData2ShowUser.get(j) + "数据读取异常");
								break;
							}
							dataOfRowMap.put("custId", "");
							dataOfRowMap.put("accountId", "");
							dataOfRowMap.put("uim", "");
							dataOfRowMap.put("rentCoupon", "0");
						}
					}
					if (dataOfRowMap.size() > 0) {
						dataOfExcelList.add(dataOfRowMap);
					}
				}
			}
		}
		
		for (Map<String, Object> phoneMap : dataOfExcelList) {
			Object phoneNum = phoneMap.get("accessNumber");
			if (!accessNumberSets.add(phoneNum)) {
				errorData.append("<br/>接入号【" + phoneNum + "】重复，请检查!");
				break;
			}
		}
		
		if("".equals(errorData.toString())){
			code="0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("list", dataOfExcelList);
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
	public Map<String, Object> readExcel4ExtendCust(Workbook workbook) {
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
	 * @author ZhangYu
	 */
	public Map<String, Object> readExcelBatchChange(Workbook workbook, String batchType) {
		
		String message = "";
		String code = "-1";
		final int columns = 2;//在换卡、换档Excel中共有2列数据
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();
		List<Map<String, Object>> orderLists = new ArrayList<Map<String, Object>>();
		Set<Object> accessNumberSets = new TreeSet<Object>();
		Map<String, Object> dataOfRowMap = null;//记录Excel中的一行数据
		
		// 循环读取每个sheet中的数据放入list集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			// 获取当前页sheet
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			// 获取Excel的行数
			int totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				for (int i = 1; i < totalRows; i++) {
					dataOfRowMap = new HashMap<String, Object>();
					Row row = sheet.getRow(i);
					if (null != row) {
						boolean cellIsNull = true;
						for (int k = 0; k < columns; k++) {
							Cell cellTemp = row.getCell(k);
							if (null != cellTemp) {
								String cellValue = checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;
								}
							}
						}
						if (cellIsNull) {
							continue;
						}
						//读取该行第一列数据
						Cell cell = row.getCell(0);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行】【第1列】单元格格式不正确");
								break;
							} else if (!"".equals(cellValue)) {
								if(checkAccessNbrReg(cellValue)){
									dataOfRowMap.put("accessNumber", cellValue);//接入号码
								} else{
									errorData.append("<br/>【第" + (i + 1) + "行】【第1列】接入号【"+cellValue+"】"+"不符合电信号码规格");
									break;
								}	
							} else {
								errorData.append("<br/>【第" + (i + 1) + "行】【第1列】接入号不能为空");
								break;
							}
						} else {
							errorData.append("<br/>【第" + (i + 1) + "行】【第1列】接入号不能为空");
							break;
						}
						//读取该行第二列数据
						cell = row.getCell(1);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("<br/>【第" + (i + 1) + "行】【第2列】单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								if(checkOfferSpecIdReg(cellValue)){
									if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
										dataOfRowMap.put("offerSpecId", cellValue);//批量换档套餐
									if(SysConstant.BATCHCHANGEUIM.equals(batchType))
										dataOfRowMap.put("newUim", cellValue);//新UIM卡号
								} else{
									if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
										errorData.append("<br/>【第" + (i + 1) + "行】【第2列】换档套餐规格ID：【"+cellValue+"】"+"格式不正确");
									if(SysConstant.BATCHCHANGEUIM.equals(batchType))
										errorData.append("<br/>【第" + (i + 1) + "行】【第2列】UIM卡号：【"+cellValue+"】"+"格式不正确");
									break;
								}
								
							} else {
								if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
									errorData.append("<br/>【第" + (i + 1) + "行】【第2列】换档套餐规格ID：【"+cellValue+"】"+"格式不正确");
								if(SysConstant.BATCHCHANGEUIM.equals(batchType))
									errorData.append("<br/>【第" + (i + 1) + "行】【第2列】UIM卡号：【"+cellValue+"】"+"格式不正确");
								break;
							}
						} else {
							if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
								errorData.append("<br/>【第" + (i + 1) + "行】【第2列】换档套餐规格ID不能为空");
							if(SysConstant.BATCHCHANGEUIM.equals(batchType))
								errorData.append("<br/>【第" + (i + 1) + "行】【第2列】新UIM卡号不能为空");
							break;
						}
					}
					if (dataOfRowMap.size() > 0) {
						orderLists.add(dataOfRowMap);
					}
				}
			} else {
				message = "批量导入异常:导入数据为空 !";
			}
		}//循环读取每个sheet中的数据放入list集合中--end

		// 循环完成再做资源去重判断
		for (Map<String, Object> orderList : orderLists) {
			Object accessNumber = orderList.get("accessNumber");
			if (!accessNumberSets.add(accessNumber)) {
				errorData.append("<br/>接入号【" + accessNumber + "】重复，请检查 !");
				break;
			}
		}
		
		if ("".equals(errorData.toString())) {
			code = "0";
		}
		
		returnMap.put("errorData", errorData.toString());
		returnMap.put("orderLists", orderLists);
		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("totalDataSize", accessNumberSets.size());//Excel中有效的数据的总行数，排除Excel中的空白行

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
	
	/**
	 * 文件上传成功通知服务<br/>
	 * 批量导入的Excel文件上传成功后，调后台接口，完成两件事：1.通知后台(SO)文件上传完成；2.从后台获取批次号(groupId)
	 * @param requestParamMap
	 * @return
	 * @author ZhangYu 2016-03-11
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException 
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
	 * @param templateType 上述0~12
	 * @return 批量业务类型名称，以字符串返回，若templateType不为null且没有匹配类型，则默认templateType为"0"，返回"批开活卡"。
	 */
	public String getTypeNames(String templateType){
		
		Map<String,String> templateTypeMap = new HashMap<String,String>();
		
		templateTypeMap.put("0", "批开活卡");
		templateTypeMap.put("1", "批量新装");
		templateTypeMap.put("2", "批量订购/退订附属");
		templateTypeMap.put("3", "组合产品纳入退出");
		templateTypeMap.put("4", "批量修改产品属性");
		templateTypeMap.put("5", "批量换档");//在完成#18397时，遇到5和11均表示“批量换档”的问题，经与后台沟通，仍使用11，5不会影响。
		templateTypeMap.put("8", "拆机");
		templateTypeMap.put("9", "批量修改发展人");
		templateTypeMap.put("10", "批量订购裸终端");
		templateTypeMap.put("11", "批量换档");
		templateTypeMap.put("12", "批量换卡");
		
		if(templateTypeMap.get(templateType) != null){
			return templateTypeMap.get(templateType);
		}else{
			return templateTypeMap.get("0");
		}
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
	 * Excel单元格校验
	 * @param cell
	 * @return
	 */
	private String checkExcelCellValue(Cell cell) {
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
	 * 正则校验：批量换卡、换档套餐ID是否为数字
	 * @param cellValue
	 * @return 校验成功返回<strong>true</strong>，否则返回<strong>false</strong>
	 * @author ZhangYu
	 */
	private boolean checkOfferSpecIdReg(String cellValue){
		return Pattern.matches("^[1-9]\\d*|0$", cellValue);//匹配整数
		
	}
	
	/**
	 * 正则校验：手机号码是否以1开头的11位数字   
	 * @param cellValue
	 * @return 校验成功返回<strong>true</strong>，否则返回<strong>false</strong>
	 * @author ZhangYu
	 */
	private boolean checkAccessNbrReg(String cellValue){
//		return Pattern.matches("1\\d{10}", cellValue);
		return Pattern.matches("^(149|133|153|173|177|180|181|189)\\d{8}$", cellValue);
		
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
}
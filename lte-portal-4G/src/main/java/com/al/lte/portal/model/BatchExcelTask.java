package com.al.lte.portal.model;

import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.TreeSet;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Workbook;

import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.CommonUtils;
import com.al.lte.portal.common.ExcelUtil;
import com.al.lte.portal.common.StringUtil;

/**
 * 批量多线程解析Excel任务类，该类为多线程共用，记录每个线程的执行结果并返回Excel解析结果
 * @author ZhangYu
 * @since 2017-03-13
 */
public class BatchExcelTask {
	private static Log log = Log.getLog(BatchExcelTask.class);

	private volatile String code 					= "-1";
	private volatile String message 				= "";
	private volatile boolean redLigth 				= false;
	private volatile int successDataCount 			= 0;
	private volatile StringBuffer errorData 		= new StringBuffer();	// 封装错误信息
	private volatile Map<Integer, TreeSet<String>> fruitsBucket = new HashMap<Integer, TreeSet<String>>();
	
	private final String batchType;
	private final Workbook workbook;
	private final SessionStaff sessionStaff;
	private volatile AtomicInteger errorDataCount;

	private volatile CountDownLatch countDownLatch;
	private volatile BatchRuleConfigs batchRuleConfigs;
	
	public BatchExcelTask(final Workbook workbook, CountDownLatch countDownLatch, String batchType, SessionStaff sessionStaff){
		this.redLigth			= false;
		this.workbook			= workbook;
		this.batchType			= batchType;
		this.errorDataCount		= new AtomicInteger(0);
		this.countDownLatch		= countDownLatch;
		this.batchRuleConfigs	= new BatchRuleConfigs(batchType);
		this.sessionStaff		= sessionStaff;
	}
	
	/**
	 * 所有线程解析Excel完毕后，获取执行结果
	 */
	public Map<String, Object> getReadExcelResult(){
		Map<String, Object> returnMap = new HashMap<String, Object>();
		int totalDataSize = 0;
		
		if (StringUtils.isBlank(this.getErrorData())) {
			//没有任何错误，说明成功
			code = "0";
			//计算Excel实际有效行数
			Collection<TreeSet<String>> fruits = this.fruitsBucket.values();
			Iterator<TreeSet<String>> iterator = fruits.iterator();
			TreeSet<String> pineapple = null;
			if(iterator.hasNext()){
				pineapple = (TreeSet<String>) iterator.next();
				totalDataSize = pineapple.size();
			}
			//判断是否解析了空Excel
			if(totalDataSize <= 0){
				code = "-1";
				message = "批量导入出错：<br/>导入数据为空，没有解析到有效数据，您可能导入了空Excel。";
				this.setErrorData(message);
			}
		}

		returnMap.put("code", code);
		returnMap.put("message", message);
		returnMap.put("batchType", this.batchType);
		returnMap.put("errorData", this.getErrorData());
		returnMap.put("totalDataSize", totalDataSize);//排除重复项取实际有效行数
		
		log.debug("portalBatch-多线程解析Excel结果={}", JsonUtil.toString(returnMap));

		return returnMap;
	}
	
	/**
	 * 获取Excel总列数
	 * @return
	 */
	public int getTotalColumns() {
		return this.batchRuleConfigs.getTotalColumns();
	}
	
	
	/**
	 * 获取Excel某一列的名称
	 * @param column Excel的第几列，从0起始
	 * @return
	 */
	public String getColumnName(int column) {
		return this.batchRuleConfigs.getNameColumns().get(column);
	}
	
	/**
	 * Excel单元格校验<br/>
	 * @param 单元格cell
	 */
	public String checkExcelCellValue(Cell cell) {
		return ExcelUtil.checkExcelCellValue(cell);
	}
	
	/**
	 * 校验Excel单元格是否具有有效数据，单元格的有效数据必须是文本类型，合法有效返回true；null、""、非文本格式等均返回false<br/>
	 * @param 单元格cell
	 */
	public boolean checkExcelCellValid(Cell cell) {
		return ExcelUtil.checkExcelCellValid(cell);
	}
	
	/**
	 * 判断该列的单元格是否需要正则校验
	 * @param column Excel的第几列，从0起始
	 * @return true：需要正则校验；false：不需要正则校验
	 */
	public boolean ifNeedRegExpCheck(int column){
		return batchRuleConfigs.getRegexpStr(column) != null ? true : false;
	}
	
	/**
	 * 判断该列的单元格是否需要进行重复校验
	 * @param column Excel的第几列，从0起始
	 * @return true：需要正则校验；false：不需要正则校验
	 */
	public boolean ifNeedRepeatCheck(int column){
		return batchRuleConfigs.getRepeatCheckList().contains(column) ? true : false;
	}
	
	/**
	 * 判断该列的单元格是否需要针对政企进行校验
	 * @param column Excel的第几列，从0起始
	 * @return true：需要正则校验；false：不需要正则校验
	 */
	public boolean ifNeedGovEntCheck(int column){
		//批量新装
		if("1".equals(this.batchType)){
			//客户定位是政企客户
			if(batchRuleConfigs.getGovEntCheckList().contains(column) && this.ifGovEntCust(this.sessionStaff)){
				return true;
			} else{
				return false;
			}
		} else{
			return false;
		}
	}
	
	 /** 
	  * 根据证件类型判断是否政企客户
	 * 	@return ture: 政企客户<br/> false:公众客户(非政企客户)
	 */
	private boolean ifGovEntCust(final SessionStaff sessionStaff){
		Map<String, Object> newCustInfoMap = new HashMap<String, Object>();
		newCustInfoMap.put("identityCd", sessionStaff.getCardType());
		return CommonUtils.isGovCust(null, newCustInfoMap, sessionStaff);
	}
	
	/**
	 * 判断该列的单元格是否必填
	 * @param column Excel的第几列，从0起始
	 * @return true：需要正则校验；false：不需要正则校验
	 */
	public boolean ifNeedStrictCheck(int column){
		return this.batchRuleConfigs.getStrictColumns().contains(column) ? true : false;
	}
	
	/**
	 * 对单元格正则校验   
	 * @param column
	 * @param cellValue
	 * @return 校验成功返回<strong>true</strong>，否则返回<strong>false</strong>
	 */
	public boolean checkCellValueRegExp(int column, String cellValue){
		if(cellValue != null && !"".equals(cellValue)){
			return StringUtil.checkRegExp(batchRuleConfigs.getRegexpStr(column), cellValue);
		} else{
			return false;
		}
	}
	
	/**
	 * 重复校验
	 * @param column
	 * @param cellValue
	 * @return 若重复返回<strong>true</strong>，否则返回<strong>false</strong>
	 */
	public synchronized boolean ifRepeat(int column, String cellValue){
		boolean ifRepeat = false;
		
		if(this.fruitsBucket.get(column) == null){
			TreeSet<String> littleBucket = new TreeSet<String>();
			littleBucket.add(cellValue);
			this.fruitsBucket.put(column, littleBucket);
		} else{
			ifRepeat = !this.fruitsBucket.get(column).add(cellValue);
		}
		
		return ifRepeat;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getErrorData() {
		return errorData.toString();
	}

	public void setErrorData(Object errorData) {
		if(this.errorDataCount.get() >= this.batchRuleConfigs.getErrorDataMaxCount()){
			this.redLigth = true;
			log.debug("portalBatch-errorData缓存已达上限redLigth={},errorDataCount={},errorDataMaxCount={}", this.redLigth, this.errorDataCount.get(), this.batchRuleConfigs.getErrorDataMaxCount());
		} else{
			this.errorData.append(errorData == null ? "" : errorData.toString());
			this.errorDataCount.getAndIncrement();
		}
	}

	public CountDownLatch getCountDownLatch() {
		return countDownLatch;
	}

	public void setCountDownLatch(CountDownLatch countDownLatch) {
		this.countDownLatch = countDownLatch;
	}

	public Workbook getWorkbook() {
		return workbook;
	}

	public BatchRuleConfigs getBatchRuleConfigs() {
		return batchRuleConfigs;
	}

	public void setBatchRuleConfigs(BatchRuleConfigs batchRuleConfigs) {
		this.batchRuleConfigs = batchRuleConfigs;
	}

	public boolean isRedLigth() {
		return redLigth;
	}

	public void setRedLigth(boolean redLigth) {
		this.redLigth = redLigth;
	}

	public String getBatchType() {
		return batchType;
	}

	public int getSuccessDataCount() {
		return successDataCount;
	}

	public void setSuccessDataCount(int successDataCount) {
		this.successDataCount = successDataCount;
	}

	public SessionStaff getSessionStaff() {
		return sessionStaff;
	}
}
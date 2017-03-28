package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Sheet;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.BatchExcelTask;
import com.al.lte.portal.model.SessionStaff;

/**
 * 批量业务处理类
 * @author ZhangYu 2016-03-10
 *
 */
@Service("com.al.lte.portal.bmo.crm.BatchBmo")
public class BatchBmoImpl implements BatchBmo {
	private static Log log = Log.getLog(BatchBmoImpl.class);

	public Map<String, Object> readExcel(BatchExcelTask batchExcelTask){
		String code = "-1";
		String message = "";
		Map<String, Object> returnMap = new HashMap<String, Object>();
		
		if(batchExcelTask.getBatchRuleConfigs().isThreadsFlagOn()){
			//多线程解析Excel
			returnMap = this.readExcelByThreads(batchExcelTask);
		} else{
			//单线程解析Excel
			returnMap = this.readExcelNormal(batchExcelTask);
		}
		
		if(returnMap.get("totalDataSize") != null && ((Integer)returnMap.get("totalDataSize") <= 0)){
			message = "批量导入出错：<br/>导入数据为空，没有解析到有效数据，您可能导入了空Excel。";
			returnMap.put("code", code);
			returnMap.put("errorData", message);
			returnMap.put("message", message);
		} else{
			if(returnMap.get("errorData") != null && (returnMap.get("errorData").toString()).length() > 0){
				returnMap.put("code", code);
				returnMap.put("errorData", returnMap.get("errorData").toString());
				returnMap.put("message", returnMap.get("errorData").toString());
			}
		}
		
		log.debug("portalBatch-批量解析Excel结果={}", JsonUtil.toString(returnMap));

		return returnMap;
	}
	
	/**
	 * 单线程解析Excel
	 */
	public Map<String, Object> readExcelNormal(BatchExcelTask batchExcelTask) {
		return null;
	}
	/**
	 * 多线程解析Excel
	 */
	public Map<String, Object> readExcelByThreads(BatchExcelTask batchExcelTask) {
		
		int sheetsNum = batchExcelTask.getWorkbook().getNumberOfSheets();
		Sheet sheet = null;
		ExecutorService cachedThreadPool = Executors.newCachedThreadPool();//创建线程池
		int threshold = batchExcelTask.getBatchRuleConfigs().getThreshold();
		int shiftLeft = batchExcelTask.getBatchRuleConfigs().getShiftLeft();
		int totalThreadNum = 0;
		int totalRowsAllSheets = 0;
		Map<Integer,Integer> sheetThreads = new HashMap<Integer,Integer>();
		Map<Integer,Integer> sheetRows = new HashMap<Integer,Integer>();
		
		//第一次循环计算线程总数
		for (int sheetIndex = 0; sheetIndex < sheetsNum; sheetIndex++) {
			sheet = batchExcelTask.getWorkbook().getSheetAt(sheetIndex);
			int totalRowsOfSheet = sheet.getPhysicalNumberOfRows();
			int threadNumOfSheet = (int) totalRowsOfSheet / threshold;
			threadNumOfSheet = totalRowsOfSheet % threshold == 0 ? threadNumOfSheet : threadNumOfSheet + 1;
			totalThreadNum = totalThreadNum + threadNumOfSheet;
			sheetThreads.put(sheetIndex, threadNumOfSheet);
			sheetRows.put(sheetIndex, totalRowsOfSheet);
			totalRowsAllSheets = totalRowsAllSheets + totalRowsOfSheet;
			log.debug("portalBatch-批量解析Excel表单总行数={}，该表单线程数={}", totalRowsOfSheet, threadNumOfSheet);
		}
		
		if(totalRowsAllSheets > batchExcelTask.getBatchRuleConfigs().getMaxRows()){
			batchExcelTask.setCode("-1");
			batchExcelTask.setErrorData("您导入的Excel数据总量是："+totalRowsAllSheets+"，已超过50000条数据，请分批次进行。");
			log.error("portalBatch-用户一次性导入的Excel数据总量是={}，已超过50000条数据", totalRowsAllSheets);
		} else{
			//控制同步
			CountDownLatch countDownLatch = new CountDownLatch(totalThreadNum);
			batchExcelTask.setCountDownLatch(countDownLatch);
			log.debug("portalBatch-批量解析Excel线程总数={}", totalThreadNum);

			//第二次循环创建线程
			for (int sheetIndex = 0; sheetIndex < sheetsNum; sheetIndex++) {
				int threadNumOfSheet = sheetThreads.get(sheetIndex);
				int rowsOfSheet = sheetRows.get(sheetIndex);
				
				for(int i = 0; i < threadNumOfSheet; i++){
					int fromIndex = i << shiftLeft;//每个线程从哪一行开始解析Excel
					int toIndex = ((i + 1) << shiftLeft) - 1;//每个线程解析到哪一行结束
					
					if(toIndex > rowsOfSheet){
						toIndex = rowsOfSheet;
					}
					
					cachedThreadPool.execute(new BatchReadExcelImpl(batchExcelTask, fromIndex, toIndex, sheetIndex));
				}
			}
			
			try {
				countDownLatch.await();//等待所有线程执行完毕
			} catch (InterruptedException e) {
				batchExcelTask.setCode("-1");
				batchExcelTask.setErrorData("批量解析Excel异常，线程未能正确执行完毕。");
				log.error("portalBatch-批量解析Excel异常，线程未能正确执行完毕，异常信息={}", e);
			} finally{
				cachedThreadPool.shutdown();//关闭线程池
			}
		}
		
		return batchExcelTask.getReadExcelResult();
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
		
		if(SysConstant.BATCH_TYPE.ECS_RECEIVE.equals(batchType)){
			//批量终端领用接口
			portalServiceCode = PortalServiceCode.INTF_BATCH_ECSBATCHRECEIVE;
		} else if(SysConstant.BATCH_TYPE.ECS_BACK.equals(batchType)){
			//批量终端领用回退接口
			portalServiceCode = PortalServiceCode.INTF_BATCH_ECSBATCHBACK;
		} else if(SysConstant.BATCH_TYPE.ECS_SALE.equals(batchType)){
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
	
	@SuppressWarnings("unchecked")
	public String getTypeNames(String batchType){
		Map<String, Object> batchConfigs = MapUtils.getMap(MDA.BATCH_CONFIGS, batchType, null);
		if(batchConfigs != null){
			return MapUtils.getString(batchConfigs, "batchTypeName", "未知批量业务类型[batchType="+batchType+"]");
		} else{
			return "未知批量业务类型[batchType="+batchType+"]";
		}
	}
	
	@SuppressWarnings("unchecked")
	public String getTemplateType(String batchType){
		Map<String, Object> batchConfigs = MapUtils.getMap(MDA.BATCH_CONFIGS, batchType, null);
		if(batchConfigs != null){
			return MapUtils.getString(batchConfigs, "templateType", "未知批量业务类型[batchType="+batchType+"]");
		} else{
			return "未知批量业务类型[batchType="+batchType+"]";
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
	 * 批量终端领用、批量终端领用回退、批量终端销售拼装参数
	 * @param batchType
	 * @param fromRepositoryID
	 * @param destRepositoryID
	 * @param destStatusCd
	 * @return resultMap
	 */
	public Map<String, Object> getParam2Ecs(String batchType, String fromRepositoryID, String destRepositoryID, String destStatusCd){
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		if (SysConstant.BATCH_TYPE.ECS_RECEIVE.equals(batchType)) {// 批量终端领用
			if(!(destRepositoryID == null || "".equals(destRepositoryID))){
				resultMap.put("toStoreId", destRepositoryID);
			}
		} else if(SysConstant.BATCH_TYPE.ECS_BACK.equals(batchType)) {// 批量终端领用回退
			if(!(fromRepositoryID == null || "".equals(fromRepositoryID))){
				resultMap.put("fromStoreId", fromRepositoryID);
			}
		} else if(SysConstant.BATCH_TYPE.ECS_SALE.equals(batchType)) {// 批量终端销售
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
		
		if (SysConstant.BATCH_TYPE.ECS_RECEIVE.equals(batchType)) {// 批量终端领用
			errorCode = ErrorCode.BATCH_ECS_RECEIVE;
		} else if(SysConstant.BATCH_TYPE.ECS_BACK.equals(batchType)) {// 批量终端领用回退
			errorCode = ErrorCode.BATCH_ECS_BACK;
		} else if(SysConstant.BATCH_TYPE.ECS_SALE.equals(batchType)) {// 批量终端销售
			errorCode = ErrorCode.BATCH_ECS_SALE;
		}
		
		return errorCode;
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
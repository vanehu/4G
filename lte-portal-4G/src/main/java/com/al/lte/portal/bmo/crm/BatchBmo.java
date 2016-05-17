package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Workbook;

import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 批量业务处理类
 * @author ZhangYu 2016-03-10
 *
 */
public interface BatchBmo {

	/**
	 * 批量新装(1)解析Excel
	 * @param workbook
	 * @param batchType
	 * @param str
	 * @return
	 */
	public Map<String, Object> readExcel4NewOrder(Workbook workbook, String batchType, String str, SessionStaff sessionStaff);
	
	/**
	 * 批开活卡解析Excel(多线程)
	 * @author ZhangYu 2016-04-10
	 */
	public Map<String, Object> readExcel4HKUseThreads(Workbook workbook, String batchType);	
	
	/**
	 * 批开活卡(0)解析Excel
	 * @param workbook
	 * @param batchType
	 * @return
	 */
	public Map<String, Object> readExcel4HK(Workbook workbook, String batchType);
	
	/**
	 * 批量拆机(8)、批量订购/退订附属(2)、批量在用拆机(14)、批量未激活拆机(15)解析Excel
	 * @param workbook
	 * @return
	 */
	public Map<String,Object> readExcel4Common(Workbook workbook);
	
	/**
	 * 批量修改发展人(9)解析Excel
	 * @param workbook
	 * @return
	 */
	public Map<String,Object> readExcel4ExtendCust(Workbook workbook);
	
	/**
	 * 批量订购裸终端解析(10)Excel
	 * @param workbook
	 * @return Map<String,Object>
	 */
	public Map<String,Object> readOrderTerminalExcel(Workbook workbook);
	
	/**
	 * 批量换档(11)、批量换卡(12)Excel解析
	 * @param workbook
	 * @param batchType
	 * @param str
	 * @return returnMap
	 * @author ZhangYu
	 */
	public Map<String, Object> readExcelBatchChange(Workbook workbook, String batchType);
	
	/**
	 * 批量终端领用(16)、批量终端领用回退(17)、批量终端销售(18)Excel解析
	 * @param workbook
	 * @param batchType
	 * @param str
	 * @return returnMap
	 * @author ZhangYu
	 */
	public Map<String, Object> readExcel4EcsBatch(Workbook workbook, String batchType);
		
	/**
	 * 获取未来5天的时间列表，精确到“时”，以实现未来5天的预约时间。该方法目前用于批开活卡、批量新装、批量裸机销售等批量受理。
	 * @return 时间列表
	 * @author ZhangYu 
	 */
	public List<Map<String, Object>> getTimeListIn5Days();
	
	public List<Map<String,Object>> getTimeList();
	
	public String getTypeNames(String templateType);
	
	/**
	 * 文件上传成功通知服务</br>
	 * 批量导入的Excel文件上传成功后，调后台接口，完成两件事：1.通知后台(SO)文件上传完成；2.从后台获取批次号(groupId)
	 * @param requestParamMap
	 * @return
	 * @author ZhangYu 2016-03-11
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException 
	 */
	public Map<String, Object> getGroupIDfromSOAfterUpload(Map<String, Object> requestParamMap, SessionStaff sessionStaff) throws BusinessException, InterfaceException, IOException, Exception;
	
	/**
	 * 文件上传成功通知服务<br/>
	 * 批量导入的Excel文件上传成功后，调资源(ECS)接口，完成两件事：1.通知资源文件上传完成；2.从资源获取批次号(groupId)
	 * @param requestParamMap
	 * @return resultMap
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException
	 * @author ZhangYu 2016-04-21
	 */
	public Map<String, Object> getEcsNoticedAfterUpload(Map<String, Object> requestParamMap,String batchType, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception;

	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售拼装参数
	 * @param batchType
	 * @param fromRepositoryID
	 * @param destRepositoryID
	 * @param destStatusCd
	 * @return resultMap
	 */
	public Map<String, Object> getParam2Ecs(String batchType, String fromRepositoryID, String destRepositoryID, String destStatusCd);

	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售获取错误编码ErrorCode
	 * @param batchType
	 * @return
	 */
	public ErrorCode getErrorCode2Ecs(String batchType);
	
	/**
	 * 批量一卡双号黑名单(14)Excel
	 * @param workbook
	 * @return Map<String,Object>
	 */
	public Map<String,Object> readBlacklistTerminalExcel(Workbook workbook);
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售批次查询
	 * @param qryParamMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException 
	 * @throws Exception 
	 * @throws InterfaceException 
	 * @author ZhangYu 2016-05-04
	 */
	public Map<String, Object> queryEcsBatchOrderList(Map<String, Object> qryParamMap, String optFlowNum, SessionStaff sessionStaff) throws BusinessException, InterfaceException, Exception;
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售具体一个批次详情查询
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException 
	 * @throws Exception 
	 * @throws InterfaceException 
	 * @author ZhangYu 2016-05-04
	 */
	public Map<String, Object> queryEcsBatchOrderDetailList(Map<String, Object> qryParamMap, String optFlowNum, SessionStaff sessionStaff) throws BusinessException, InterfaceException, Exception;

	/**
	 * 根据staffId向营销资源查询仓库列表
	 * @param qryParamMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 * @throws InterfaceException 
	 */
	public Map<String, Object> queryEcsRepositoryByStaffID(Map<String, Object> qryParamMap, String optFlowNum, SessionStaff sessionStaff) throws BusinessException, InterfaceException, Exception;
}
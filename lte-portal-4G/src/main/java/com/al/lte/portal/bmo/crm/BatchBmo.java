package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Workbook;

import com.al.ecs.exception.BusinessException;
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
	 * 批开活卡(0)解析Excel
	 * @param workbook
	 * @param batchType
	 * @return
	 */
	public Map<String, Object> readExcel4HK(Workbook workbook, String batchType);
	
	/**
	 * 批量拆机(8)、批量订购/退订附属(2)解析Excel
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
	 * 批量换挡(11)、批量换卡(12)Excel解析
	 * @param workbook
	 * @param batchType
	 * @param str
	 * @return returnMap
	 * @author ZhangYu
	 */
	public Map<String, Object> readExcelBatchChange(Workbook workbook, String batchType);
	
	/**
	 * 进度查询下的导入Excel方法</br>
	 * 该方法将查询该批次下的所有记录，并以Excel文件形式导出
	 * @param title
	 * @param headers
	 * @param dataList
	 * @param out
	 * @author ZhangYu
	 * @throws BusinessException 
	 */
	public void exportExcel(String title, String[] headers, List<Map<String, Object>> dataList, OutputStream outputStream) throws BusinessException;
	
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
}
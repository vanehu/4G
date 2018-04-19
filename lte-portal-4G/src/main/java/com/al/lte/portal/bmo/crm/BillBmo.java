package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.util.Map;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 计费管理业务操作接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface BillBmo {
	/**
	 * 查询押金
	 * @param paramMap
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> queryForegift(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 退押金
	 * @param paramMap
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> updateBamObjForegiftForReturn(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 收押金
	 * @param paramMap
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> saveBamObjForegift(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 押金历史查询
	 * @param paramMap
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> queryForegiftHistoryDetail(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 余额查询
	 * @param param
	 * @return
	 */
	public Map<String, Object> getBalance(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 帐单查询
	 * @param dataBusMap
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> queryBill(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception;
	
	/**
	 * 现金充值
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> doCash(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff)throws Exception;
	/**
	 * 充值缴费记录查询
	 * @param param
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public DataBus queryPayNotes(Map<String, Object> param,
			String flowNum, SessionStaff sessionStaff) throws BusinessException;
/**
 * 查询套餐余量
 * @param param
 * @param flowNum
 * @param sessionStaff
 * @return
 */
	public DataBus queryOfferUsage(Map<String, Object> param, String flowNum,
			SessionStaff sessionStaff) throws BusinessException;
	
	/**
	 * 详单查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryBillDetail(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception;
	/**
	 * 根据接入号查询终端资源信息过滤属性
	 * @param params
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 * @throws IOException 
	 * @throws InterfaceException 
	 */
	public Map<String, Object> queryMktResInfoByAccessNum(
			Map<String, Object> params, String flowNum,
			SessionStaff sessionStaff) throws Exception;
	
	public Map<String, Object> payBalance(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception;
	
	/**
	 * 销帐查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryWriteOffCash(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception;
	
	/**
	 * 反销帐
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> reverseWriteOffCash(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception;
	
	/**
	 * 客户化账单打印
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> getCustomizeBillData(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception;
	
	/**
	 * 反销账 记录 - 打印发票
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> getInvoiceItems(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
	
	public Map<String, Object> chargeRecord(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff);
}

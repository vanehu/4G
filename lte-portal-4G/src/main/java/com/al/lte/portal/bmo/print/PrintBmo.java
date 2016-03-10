package com.al.lte.portal.bmo.print;

import java.util.Collection;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;


/**
 * 业务接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface PrintBmo {
	Map<String, Object> printVoucher(Map<String, Object> paramMap, String optFlowNum,
		HttpServletRequest request, HttpServletResponse response) throws Exception;
	Map<String, Object> printVoucherForAgent(Map<String, Object> paramMap, String optFlowNum,
			HttpServletRequest request, HttpServletResponse response) throws Exception;
	Map<String, Object> getInvoiceItems(Map<String, Object> paramMap, String optFlowNum,
		SessionStaff sessionStaff) throws Exception;
	Map<String, Object> getInvoiceTemplates(Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;
	Map<String, Object> saveInvoiceInfo(Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;
	Map<String, Object> printOld2New(Map<String, Object> paramMap, String optFlowNum,
			HttpServletRequest request, HttpServletResponse response,
			 Map<String, Object> templateInfoMap) throws Exception;
	Map<String, Object> printInvoice(Map<String, Object> paramMap, String optFlowNum,
			HttpServletRequest request, HttpServletResponse response,
			Map<String, Object> templateInfoMap) throws Exception;
	Map<String, Object> invalidInvoices(Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;
	Map<String, Object> printChargeReceipt(Map<String, Object> paramMap, String optFlowNum,
			HttpServletRequest request, HttpServletResponse response, 
			Map<String, Object> templateInfoMap)throws Exception;
	Map<String, Object> queryConstConfig(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	Map<String, Object> getInvoiceInfo(Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;
	Map<String, Object> getEQCodeInfo(Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 天翼高清机顶盒预约单回执打印
	 */
	public String printSTBReserveReceipt(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff, HttpServletResponse response) throws Exception;
}

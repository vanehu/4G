package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.lte.portal.model.SessionStaff;

/**
 * 帐户管理业务操作接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface AcctBmo {
	/**
	 * 银行详情查询
	 * @param param
	 * @return
	 */
	public Map<String, Object> queryBankInfo(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 银行详情保存
	 * @param param
	 * @return
	 */
	public Map<String, Object> saveBank(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 银行详情更新
	 * @param param
	 * @return
	 */
	public Map<String, Object> updateBank(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 查询帐户资料
	 * @param param
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> queryAccount(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 查询帐户详情
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> queryAcctDetail(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 获取账户信用额度默认值
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> defaultCreditLimit(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
}

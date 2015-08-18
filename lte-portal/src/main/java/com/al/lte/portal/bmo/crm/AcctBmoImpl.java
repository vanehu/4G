package com.al.lte.portal.bmo.crm;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;


/**
 * 帐户管理业务操作类 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.AcctBmo")
public class AcctBmoImpl implements AcctBmo {
	
	protected final Log log = Log.getLog(getClass());
	/*
	 * 银行详情查询
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryBankInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_QUERY_BANK_INFO, optFlowNum, sessionStaff);
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			Map<String, Object> returnMap = db.getReturnlmap();
			if(returnMap.get("resultCode").equals("0")){
				result = (Map<String, Object>)returnMap.get("result");
			}
		}catch(Exception e){
			log.error("门户处理营业受理的queryBankInfo服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_BANKINFO, dataBusMap, db.getReturnlmap(), e);
		}
		return result;
	}

	/*
	 * 银行详情保存
	 * (non-Javadoc) 
	 * @see com.al.lte.portal.bmo.crm.BankBmo#saveBank(java.util.Map)
	 */
	public Map<String, Object> saveBank(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_SAVE_BANK,
				optFlowNum, sessionStaff);
		Map<String, Object> dbMap=new HashMap<String, Object>();
		try {
			if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
				dbMap = db.getReturnlmap();

			} else {
				dbMap.put("code", ResultCode.R_FAIL);
				dbMap.put("msg", "银行详情保存接口调用失败");
			}
			return dbMap;
		} catch (Exception e) {
			log.error("门户处理营业受理的saveBank服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.SAVE_BANK, dataBusMap, dbMap, e);
		}
	}
	
	/*
	 * 银行详情更新
	 * (non-Javadoc) 
	 * @see com.al.lte.portal.bmo.crm.BankBmo#updateBank(java.util.Map)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> updateBank(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_UPDATE_BANK,
				optFlowNum, sessionStaff);
		Map<String, Object> dbMap=new HashMap<String, Object>();
		try {
			if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
				dbMap = db.getReturnlmap();

			} else {
				dbMap.put("code", ResultCode.R_FAIL);
				dbMap.put("msg", "银行详情更新接口调用失败");
			}
			return dbMap;
		} catch (Exception e) {
			log.error("门户处理营业受理的updateBank服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.UPDATE_BANK, dataBusMap, dbMap, e);
		}
	}
	
	/*
	 * 帐户资料查询
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.AcctBmo#queryAccount(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	public Map<String, Object> queryAccount(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_QUERY_ACCOUNT_INFO, optFlowNum, sessionStaff);
		
		try{
			Map<String, Object> returnMap = db.getReturnlmap();
			return returnMap;
		}catch(Exception e){
			log.error("门户处理营业受理后台的queryExistAcctByCond服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_ACCT, dataBusMap, db.getReturnlmap(), e);
		}			
	}
	
	/*
	 * 帐户详情查询
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.AcctBmo#queryAcctDetail(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	public Map<String, Object> queryAcctDetail(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_QUERY_ACCT_DETAIL, optFlowNum, sessionStaff);
		
		try{
			Map<String, Object> returnMap = db.getReturnlmap();
			return returnMap;
		}catch(Exception e){
			log.error("门户处理营业受理后台的queryAcctDetailInfo服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_ACCT_DETAIL, dataBusMap, db.getReturnlmap(), e);
		}			
	}
	
	/*
	 * 查询账户信用额度默认值
	 */
	public Map<String, Object> defaultCreditLimit(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_DEFAULT_CREDIT_LIMIT, optFlowNum, sessionStaff);
		
		try{
			Map<String, Object> returnMap = db.getReturnlmap();
			return returnMap;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_ACCT_DETAIL, dataBusMap, db.getReturnlmap(), e);
		}
	}
	
}

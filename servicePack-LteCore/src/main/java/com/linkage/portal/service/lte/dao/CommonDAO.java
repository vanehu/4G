package com.linkage.portal.service.lte.dao;

import java.util.List;
import java.util.Map;

/**
 * <P>
 * @author xuj
 * @version V1.0 2013-12-16
 * @createDate 2013-12-16 下午5:21:40
 * @modifyDate	 xuj 2013-12-16 <BR>
 * @copyRight 亚信联创电信EC研发部
 */
public interface CommonDAO{
	/**
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public List queryInvoiceTemplate(Map param,String dbKeyWord)  throws Exception;
	
	public void insertCashChargeLog(Map<String,Object> logMap,String dbKeyWord) throws Exception;

	public void updateCashChargeLog(Map<String,Object> logMap,String dbKeyWord) throws Exception;

	public List queryCashChargeLog(Map<String,Object> logMap,String dbKeyWord) throws Exception;
	
	public List querybusitype(Map<String,Object> logMap,String dbKeyWord) throws Exception;
	
	public List querybusiactiontype(Map<String,Object> logMap,String dbKeyWord) throws Exception;
	
	public Map insertorderyslinfo(Map<String,Object> logMap,String dbKeyWord) throws Exception;
	
	public Map queryorderyslinfo(Map<String,Object> logMap,String dbKeyWord) throws Exception;
	
	public Map updateorderzdyyinfo(Map<String,Object> logMap,String dbKeyWord) throws Exception;
	
	public Map queryorderzdyyinfo(Map<String,Object> logMap,String dbKeyWord) throws Exception;
	
	public long GetTranId(Map<String,Object> logMap,String dbKeyWord) throws Exception;
	
	public List insertloginsession(Map<String,Object> logMap) throws Exception;
	
	public List GetOLpos(Map<String,Object> logMap) throws Exception;
	
	public void insert_sp_busi_run_log(Map<String,Object> logMap) throws Exception;
	
	//查询蓝牙密钥
	public Map queryBlueToothKey(Map<String,Object> paramMap) throws Exception;

	int insertPayOrder(Map<?, ?> paramMap) throws Exception;
	
	//查询认证借口
    public List queryWechatToken(Map<String,Object> paramMap) throws Exception;
    
    public int updateWechatToken(Map<?, ?> paramMap) throws Exception ;

}

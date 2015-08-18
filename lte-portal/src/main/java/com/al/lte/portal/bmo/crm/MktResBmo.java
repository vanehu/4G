package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.util.Map;

import org.dom4j.DocumentException;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 营销资源业务操作接口 .
 * <P>
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface MktResBmo {
	 /**
	  * 号码预占与释放
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String, Object> prePhoneNumber(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;
	 /**
	  * 号码查询
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String, Object> queryPhoneNumber(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;
	 /**
	  * 身份证查询预占号码信息
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String,Object> queryNumberByIdentityId(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;
	 /**
	  * UIM卡校验预占与释放
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String, Object> uimCheck(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;
	 
	 /**
	  * 查询号池
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	 public Map<String, Object> queryNbrPool(Map<String, Object> dataBusMap, String optFlowNum,
	            SessionStaff sessionStaff) throws Exception;

	/**
	 * 查询待释放的号码资源
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> queryReleaseNum(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 释放异常单的号码资源
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> releaseErrorNum(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 更新已释放的号码状态
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> updateNumStatus(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
     * 查询终端信息列表
     * 
     * @param dataBusMap
     *            查询入参
     * @param optFlowNum
     *            平台编码，用于记录日志
     * @param sessionStaff
     *            员工Session对象
     * @return Map<String, Object> 查询终端信息列表
     * @throws BusinessException
     */
    public Map<String, Object> queryMktResInfo(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;

	public Map<String, Object> queryNewInfoMktRes(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
    
    
    /**
     * 终端串号校验
     * @param map 入参
     * @param optFlowNum 操作流水
     * @param sessionStaff 会话对象
     * @return 操作结果
     * @throws BusinessException
     */
    public Map<String, Object> checkTerminalCode(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;
    
    
    public Map<String, Object> queryOfferByMtkResCd(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
    		throws Exception;
    
    /**
	 * 获取卡组件信息
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> getCardDllInfoJson(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException;
    /**
	 * 获取动态链接库密钥
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> getAuthCode(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException;
    /**
	 * 获取写卡信息（经过加密，卡管系统获取）
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> getCardInfo(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException;
    /**
	 * 写卡完成后上报
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
     * @throws DocumentException 
     * @throws IOException 
     * @throws InterfaceException 
	 */
	public Map<String, Object> submitUimCardInfo(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
    /**
     * 4.23	根据终端串码查询终端信息（如果是合约同时返回绑定的产品销售品信息）
     * @param map 入参
     * @param optFlowNum 操作流水
     * @param sessionStaff 会话对象
     * @return 操作结果
     * @throws BusinessException
     */
    public Map<String, Object> queryCoupon(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;

	/**
	 * 产品实例与号码关系查询接口
	 * @param param
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public Map<String, Object> queryProdInstAccNbr(Map<String, Object> param,
			String flowNum, SessionStaff sessionStaff) throws Exception;
	/**
	 * 查询手机欠费。
	 * @param param
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 */
    public Map<String, Object> getOweCharge(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws Exception;
    
    /**
	 * 查询手机欠费账目。
	 * @param param
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 */
    public Map<String, Object> getOweAccountCharge(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws Exception;
    
    /**
     * 销账
     * @param param
     * @param flowNum
     * @param sessionStaff
     * @return
     */
    public DataBus writeOffCash(Map<String, Object> param, String flowNum, SessionStaff sessionStaff);
    /**
     * 营销资源--号码等级查询
     * @param param
     * @param flowNum
     * @param sessionStaff
     * @return
     */
    public DataBus qryPhoneNbrLevelInfoList(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws  Exception;

    public Map<String, Object> queryPnLevelProdOffer(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;

    public Map<String, Object> insertbusirecord(Map<String, Object> dataBusMap, String optFlowNum,SessionStaff sessionStaff) throws Exception;
    
    /**
	 * uim卡号查询号码信息
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryNumByUim(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)throws Exception;
	
}

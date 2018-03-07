package com.al.lte.portal.bmo.crm;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;


/**
 * 购物车业务操作类 .
 * <P>
 * @author bianxw
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
public interface CartBmo {
	
	/**
	  * 查询购物车列表
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	public Map<String, Object> queryCarts(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	  * 查询购物车详情
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	public Map<String, Object> queryCartOrder(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	  * 受理单详情
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	public Map<String, Object> queryCartOrderInfo(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 购物车环节查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public Map<String, Object> queryCartLink(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 购物车失败环节重发
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> resendCustOrder(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 施工单状态查询
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryConstructionState(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 查询一卡双号信息
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryOCTN(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	  * 查询购物车订单状态
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	public Map<String, Object> queryOrderStatus(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	  * 实名信息采集单列表
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	public Map<String, Object> queryCltCarts(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	public void cacheParamsInSession(HttpServletRequest request, Map<String, Object> param, String businessFlag);
	
	public Map<String, Object> getCachedParamsInSession(HttpServletRequest request, Map<String, Object> param, String businessFlag);
	/**
	  * 实名信息采集单详情
	  * @param dataBusMap
	  * @param optFlowNum
	  * @param sessionStaff
	  * @return
	  * @throws BusinessException
	  */
	public Map<String, Object> queryCltCartOrder(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception;

    /**
     * 采集单项查询
     *
     * @param dataBusMap
     * @param optFlowNum
     * @param sessionStaff
     * @return
     * @throws BusinessException
     */
    public Map<String, Object> queryCltCartOrderItems(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
}

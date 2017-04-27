package com.al.lte.portal.bmo.crm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.CompareObject;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.model.SessionStaff;
import org.apache.commons.lang.StringUtils;

/**
 * 购物车 实现类
 * <P>
 * 
 * @author bianxw
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.CartBmo")
public class CartBmoImpl implements CartBmo{
	
	protected final Log log = Log.getLog(getClass());
	
	/*
	 * 购物车列表查询 (non-Javadoc)
	 */
	public Map<String, Object> queryCarts(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.SHOPPING_CART_LIST, optFlowNum, sessionStaff);
		try{
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", 1);
				result.put("mess", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					result = (Map)returnMap.get("result");
					result.put("code", 0);
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.CUST_ORDER,dataBusMap,db.getReturnlmap(), e);
		}
	}
	
	/*
	 * 查询购物车详情 (non-Javadoc)
	 */
	public Map<String, Object> queryCartOrder(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.SHOPPING_CART_INFO, optFlowNum, sessionStaff);
		try{
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				result = db.getReturnlmap();
				result.put("code", 1);
				result.put("mess", result.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(result.get("resultCode"))){
					if(result.get("orderListInfo")!=null){
						result.put("code", 0);
					}
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.CUST_ORDER_DETAIL,dataBusMap,db.getReturnlmap(), e);
		}
	}
	
	/*
	 * 受理单详情 (non-Javadoc)
	 */
	public Map<String, Object> queryCartOrderInfo(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.SHOPPING_CART_DETAIL, optFlowNum, sessionStaff);
		try{
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", 1);
				result.put("mess", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					result = (Map)returnMap.get("result");
					result.put("code", 0);
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.CUST_ITEM_DETAIL,dataBusMap,db.getReturnlmap(), e);
		}
	}
	

	/*
	 * 购物车环节查询
	 */
	public Map<String, Object> queryCartLink(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_CART_LINK, optFlowNum, sessionStaff);
		try{
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", 1);
				result.put("mess", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					Object objList = returnMap.get("result");
					if(objList instanceof List){
						List listTemp = (List)objList;
						
						CompareObject comparator=new CompareObject();
						comparator.setType("cartLinkTime");
						Collections.sort(listTemp, comparator);
						
						result.put("list",listTemp);
						result.put("code", 0);
					}else{
						result.put("list",new ArrayList());
						result.put("code", 1);
						result.put("mess", MapUtils.getMap(db.getReturnlmap(), "resultMsg"));
					}
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_CART_LINK,dataBusMap,db.getReturnlmap(), e);
		}
	}
	
	/*
	 * 购物车失败环节重发
	 */
	public Map<String, Object> resendCustOrder(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.RESEND_CUST_ORDER, optFlowNum, sessionStaff);
		try{
			return db.getReturnlmap();
		}catch(Exception e){
			throw new BusinessException(ErrorCode.RESEND_CUST_ORDER, dataBusMap, db.getReturnlmap(), e);
		}
	}
	
	/*
	 * 施工单状态查询
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryConstructionState(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_CONSTRUCTION_STATE, optFlowNum, sessionStaff);
		
		try{
			Map<String, Object> returnMap = new HashMap<String, Object>();
			Map<String, Object> resultMap = db.getReturnlmap();
			if(resultMap.get("resultCode").equals("0")){
				returnMap.put("resultCode", "0");
				Map<String, Object> result = (Map<String, Object>)resultMap.get("result");
				ArrayList<Map<String, Object>> workOrderInfos = (ArrayList<Map<String, Object>>)result.get("workOrderInfos");
				returnMap.put("resultList", workOrderInfos);
			}
			else{
				returnMap.put("resultCode", 1);
				returnMap.put("resultMsg", resultMap.get("resultMsg"));
			}
			return returnMap;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_CONSTRUCTION_STATE, dataBusMap, db.getReturnlmap(), e);
		}
	}
	/**
	 * 查询一卡双号信息
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryOCTN(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_OCTN, optFlowNum, sessionStaff);
		try{
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", 1);
				result.put("mess", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					result = (Map<String, Object>)returnMap.get("data");
					result.put("code", 0);
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_OCTN,dataBusMap,db.getReturnlmap(), e);
		}
	}
	
	/*
	 * 购物车订单状态查询 
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryOrderStatus(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.QUERY_ORDER_STATUS, optFlowNum, sessionStaff);
		try{
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap() ;				
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					result = (Map<String, Object>)returnMap.get("custOrder");
					result.put("code", 0);
					result.put("mess", returnMap.get("resultMsg"));
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.CUST_ORDER_DETAIL,dataBusMap,db.getReturnlmap(), e);
		}
	}
	
	/*
	 * 实名信息采集单列表查询 (non-Javadoc)
	 */
	public Map<String, Object> queryCltCarts(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.CLT_ORDER_QUERY, optFlowNum, sessionStaff);
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
			return resultMap ;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.CLTORDER_LIST, dataBusMap, resultMap, e);
		}
	}
	
	/*
	 * 查询实名信息采集单详情 (non-Javadoc)
	 */
	public Map<String, Object> queryCltCartOrder(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.CLT_ORDER_Detail, optFlowNum, sessionStaff);
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
			return resultMap ;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.CLTORDER_DETAIL, dataBusMap, resultMap, e);
		}

	}
	/**
	 * 查询采集单项
	 */
	public Map<String, Object> queryCltCartOrderItems(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.CLT_ORDER_ITEMS, optFlowNum, sessionStaff);
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
			return resultMap ;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.CLT_ORDER_ITEMS, dataBusMap, resultMap, e);
		}

	}
}

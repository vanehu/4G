package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.al.crm.log.sender.ILogSender;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.bmo.log.LogContainer;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.staff.StaffBmoImpl;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 订单管理业务实现
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.OrderBmo")
public class OrderBmoImpl implements OrderBmo {

	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
    private CommonBmo commonBmo;

	@Autowired
    PropertiesUtils propertiesUtils;

	protected final static Log log = Log.getLog(OrderBmoImpl.class);
	
	private static ILogSender logSender = (ILogSender) SpringContextUtil.getBean("defaultLogSender");
	
	private static HttpServletRequest request = null;

	/*
	 * 销售品查询 (non-Javadoc)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryMainOfferSpecList(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_MAIN_OFFER, optFlowNum, sessionStaff);
		try {
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				Map<String, Object> result = (Map<String, Object>) resultMap
						.get("result");
				log.debug("result={}", result);
				List<Map<String, Object>> tempList = (List<Map<String, Object>>) result
						.get("prodOfferInfos");
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("prodOfferInfos", tempList);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
			return returnMap;
		} catch (Exception e) {
			log.error("门户处理营业受理的service/intf.prodOfferService/queryMainOfferSpecList服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_MAIN_OFFER,dataBusMap,db.getReturnlmap(), e);
		}
		
	}

	/*
	 * 销售品详细 (non-Javadoc)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryOfferSpecParamsBySpec(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_OFFER_SPEC, optFlowNum, sessionStaff);
		try {
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				Map<String, Object> result = (Map<String, Object>) resultMap
						.get("result");
				Map<String, Object> tempmap = (Map<String, Object>) result
						.get("offerSpec");
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("offerSpec", tempmap);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
			return returnMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_OFFER_SPEC,dataBusMap,db.getReturnlmap(), e);
		}
		
	};

   //  费用详情查询 (手机客户端)
	public Map<String, Object> qryFeeInfoList(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.INTF_QUERY_FREE_INFO_LIST;
    	DataBus db = InterfaceClient.callService(param,serviceCode,optFlowNum, sessionStaff);
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			Map<String, Object> datamap = (Map<String, Object>) resultMap
					.get("result");
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", db.getResultMsg());
		}
		return returnMap;
	}
	
    //  订单量，费用总和，已竣工量，总段销售量查询 (手机客户端)
	public Map<String, Object> qryCountInfoList(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.INTF_QUERY_COUNT_INFO_LIST;
    	DataBus db = InterfaceClient.callService(param,serviceCode,optFlowNum, sessionStaff);
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			//Map<String, Object> datamap = (Map<String, Object>) resultMap
			//		.get("result");
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(resultMap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", db.getResultMsg());
		}
		return returnMap;
	}
	
    //查询在途数量
	public Map<String, Object> qryCount(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.INTF_QUERY_COUNT;
    	DataBus db = InterfaceClient.callService(param,serviceCode,optFlowNum, sessionStaff);
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			Map<String, Object> datamap = (Map<String, Object>) resultMap
					.get("result");
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", db.getResultMsg());
		}
		return returnMap;
	}
	/*
	 * 订单算费 (non-Javadoc)
	 * 
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#queryChargeList(java.util.Map,
	 * java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryChargeList(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_QUERY_CHARGE_LIST, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				Map<String, Object> datamap = new HashMap<String, Object>();
				Object result = resultMap.get("result");
				if (result instanceof List) {
					List<Map<String, Object>> tempList = (List<Map<String, Object>>) result;
					datamap = tempList.get(0);
				} else {
					datamap = (Map<String, Object>) result;
				}
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.putAll(datamap);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "费用查询接口调用失败");
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.chargeService/saveComputeChargeJson服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CHARGE_LIST, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	@SuppressWarnings("unchecked")
	public Map<String, Object> queryAddChargeItems(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_QUERY_CHARGE_ADDITEM, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				List<Map<String, Object>> datamap = null;
				Map<String, Object> res = (Map<String, Object>) resultMap
						.get("result");
				Object result = res.get("chargeItems");
				if (result instanceof List) {
					datamap = (List<Map<String, Object>>) result;
				} else {
					Map<String, Object> temp = (Map<String, Object>) result;
					datamap = new ArrayList<Map<String, Object>>();
					datamap.add(temp);
				}
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("list", datamap);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "费用查询接口调用失败");
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.acctService/queryAcctTypeForObj服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CHARGE_ADDITEM, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryPayMethodByItem(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_QUERY_PAYMETHOD, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				List<Map<String, Object>> datamap = null;
				Map<String, Object> res = (Map<String, Object>) resultMap
						.get("result");
				Object result = res.get("acctItemTypeInfo");
				if (result instanceof List) {
					datamap = (List<Map<String, Object>>) result;
				} else {
					Map<String, Object> temp = (Map<String, Object>) result;
					datamap = new ArrayList<Map<String, Object>>();
					datamap.add(temp);
				}
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("list", datamap);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "费用项可支持付费方式查询接口调用失败");
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.chargeService/queryAvilablePayMethodCdByAcctItemTypeCd服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CHARGE_PAYMETHOD, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	public Map<String, Object> chargeSubmit(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_SUBMIT_CHARGE, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				if(db.getReturnlmap()!=null){
					returnMap = db.getReturnlmap();
				}
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg()==null?"收费失败，集团营业后台未返回resultMsg【resultMsg=null】":db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.soService/updateCompleteOrderList服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CHARGE_SUBMIT, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	public Map<String, Object> queryAgentPortalConfig(
			Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> rMap = new HashMap<String, Object>();
		// Cache cache = ehCacheManager.getCache("otherCahce");
		// StringBuffer cacheKey = new StringBuffer("otherCahce");
		// if (MapUtils.isNotEmpty(paramMap)) {
		// Iterator iter = paramMap.entrySet().iterator();
		// while (iter.hasNext()) {
		// Map.Entry entry = (Map.Entry) iter.next();
		// Object val = entry.getValue();
		// cacheKey.append("_");
		// cacheKey.append(val);
		// }
		// }
		//
		// if (null != cache.get(cacheKey.toString())) {
		// rMap = (Map<String, Object>) cache.get(cacheKey.toString()).get();
		// }
		// if (MapUtils.isNotEmpty(rMap)) {
		// return rMap;
		// } else {
		// rMap = new HashMap<String, Object>();
		// }
		 DataBus db = ServiceClient.callService(paramMap,
		 PortalServiceCode.QUERY_AGENT_PORTAL_CONFIG, optFlowNum,
		 sessionStaff);
//		DataBus db = InterfaceClient.callService(paramMap,
//				PortalServiceCode.INTF_QUERY_AP_CONFIG, optFlowNum,
//				sessionStaff);
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			rMap = db.getReturnlmap();
			if (ResultCode.R_SUCCESS.equals(StringUtils
					.defaultString((String) rMap.get("code")))) {
				// if (MapUtils.isNotEmpty(rMap)) {
				// cache.put(cacheKey.toString(), rMap);
				// }
				return rMap;
			}
		}
		return rMap;
	}

	/*
	 * 产品规格属性 (non-Javadoc)
	 * 
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#orderSpecParam(java.util.Map,
	 * java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> orderSpecParam(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
    	throws Exception{

		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(map,PortalServiceCode.ORDER_PARAM_QUERY, optFlowNum,sessionStaff);	
		try{
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", 1);
				result.put("mess", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					result = (Map)returnMap.get("result");
					List<Map<String, Object>> list = null ;
					if(result.get("prodSpecParams")!=null){
						list = (List<Map<String, Object>>) result.get("prodSpecParams");
						if(list!=null&&list.size()>0){
							result.put("code", 0);
							result.put("prodSpecParams", list);
						}else{
							result.put("code", 1);
							result.put("mess", MapUtils.getMap(db.getReturnlmap(), "resultMsg"));
						}
					}
					result.put("code", 0);
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.ORDER_PROD_ITEM,map,db.getReturnlmap(), e);
		}
	}
	/*
	 * 产品实例属性(non-Javadoc)
	 * 
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#orderSpecParam(java.util.Map,
	 * java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> orderSpecParamChange(Map<String, Object> map1,Map<String, Object> map2, String optFlowNum, SessionStaff sessionStaff)
    throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("code", -1);
		result.put("mess", "未获取到产品属性");
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Map<String, Object> tempMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(map2,PortalServiceCode.PRODUCT_PARAM_QUERY, optFlowNum,sessionStaff);
		try{
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap() ;
				result.put("code", 1);
				result.put("mess", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					Map<String, Object> data = (Map<String, Object>)returnMap.get("result");
					if(data.get("prodInstParams")!=null){
						list = (List<Map<String, Object>>) data.get("prodInstParams");
						//将实例放入map中，然后查询规格，如果规格中有实例中没有，将规格放入实例，补充没有的属性。
						for(Map<String, Object> map:list){
							if(map.get("itemSpecId")!=null&&!map.get("itemSpecId").equals("")&&!map.get("itemSpecId").equals("null")){
								tempMap.put(map.get("itemSpecId").toString(), 1);
							}
						}
					}
				}
			}
		}catch(Exception e){
			//如果产品实例接口失败，不抛出异常，继续调用产品规格属性
			//throw new BusinessException(ErrorCode.ORDER_PROD_INST_C, "门户处理营业受理系统service/intf.prodInstService/queryProdInstItemsById服务返回的数据异常",map2,db.getReturnlmap(), e);
		}
		
		DataBus db1 = InterfaceClient.callService(map1,PortalServiceCode.ORDER_PARAM_QUERY, optFlowNum,sessionStaff);
		try{
			if(list==null||list.size()<1){
				result.put("mess", db1.getResultMsg());
			}
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db1.getResultCode()))) {
				Map<String, Object> data2 = MapUtils.getMap(db1.getReturnlmap(), "result");
				if(list==null||list.size()<1){
					result.put("code", 1);
					result.put("mess", data2.get("resultMsg"));
				}
				List<Map<String, Object>> list2 = null ;
				if(data2!=null&&data2.get("prodSpecParams")!=null){
					list2 = (List<Map<String, Object>>) data2.get("prodSpecParams");
					for(Map<String, Object> tempMap2:list2){
						String itemSpecId = tempMap2.get("itemSpecId")==null?"":tempMap2.get("itemSpecId").toString();
						if(tempMap.get(itemSpecId)==null){
							tempMap2.put("value", "");
							tempMap2.put("prodInstParamId",tempMap2.get("prodSpecParamId"));
							tempMap2.put("addtype", "1");
							list.add(tempMap2);
						}
					}
				}
			}
		}catch(Exception e){
			if(list==null||list.size()<1){
				throw new BusinessException(ErrorCode.QUERY_COMPSPEC,map2,db.getReturnlmap(), e);
			}
		}
		if(list!=null&&list.size()>0){
			result.put("code", 0);
			result.put("mess", "成功");
			result.put("prodSpecParams", list);
		}
		return result;
	 }

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.al.lte.portal.bmo.crm.OrderBmo#removeProd(java.util.Map)
	 */
	public Map<String, Object> removeProd(Map<String, Object> param) {
		// TODO Auto-generated method stub
		return null;
	}




	//帐户资料查询
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public Map<String, Object> queryAccountInfo(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.INTF_QUERY_ACCOUNT_INFO, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{			
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map rtnMap = db.getReturnlmap();
				if (ResultCode.R_SUCC.equals(rtnMap.get("resultCode").toString())) {
					List<Map> list = (List<Map>) ((Map) rtnMap.get("result")).get("acctItems");
					resultMap.put("resultCode", ResultCode.R_SUCC);
					resultMap.put("accountInfos", list);
				} else {
					resultMap.put("resultCode", ResultCode.R_FAILURE);
					resultMap.put("resultMsg", rtnMap.get("resultMsg").toString());
				}
			} else {
				resultMap.put("resultCode", "1");
				resultMap.put("resultMsg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的queryExistAcctByCond服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_ACCT, param, db.getReturnlmap(), e);
		}	
		return resultMap;
	}

	public Map<String, Object> orderSubmit(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.ORDER_SUBMIT, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的commitOrderListAndBusOrder服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ORDER_SUBMIT, paramMap, resultMap, e);
		}
		return resultMap;
	}
	public Map<String, Object> orderSubmit4iot(Map<String, Object> paramMap,String optFlowNum,
			SessionStaff sessionStaff)throws Exception {
		DataBus db = ServiceClient.callService(paramMap,
				PortalServiceCode.IOT_SERVICE_TRANSFER_ARCHIVE, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
				resultMap = db.getReturnlmap();
		} catch (Exception e) {
			log.error("门户处理营业后台的commitOrderListAndBusOrder服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.IOT_TRANSFER_ARCHIVE, paramMap, resultMap, e);
		}
		return resultMap;
	}
	public Map<String, Object> orderSubmitComplete(Map<String, Object> paramMap,String optFlowNum,
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.ORDER_SUBMIT_COMPLETE, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的commitOrderListAndBusOrderComplete服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ORDER_SUBMIT, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> batchExcelImport(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
//		long startTime = System.currentTimeMillis();
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_BATCH_IMPORT, optFlowNum, sessionStaff);
//		long endTime = System.currentTimeMillis();
//		System.out.println("******************后台导入数据******************共耗时/ms : " + (endTime - startTime));
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = (Map<String, Object>)db.getReturnlmap().get("result");
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.batchOrderService/saveBatchOrderImport服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_IMP_SUBMIT, param, db.getReturnlmap(), e);
		}	
		return resultMap;
	}
	public Map<String, Object> batchCheckPhoneAndUim(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
//		long startTime = System.currentTimeMillis();
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_PNUIMBATCHVAL_SERVICE, optFlowNum, sessionStaff);
//		long endTime = System.currentTimeMillis();
//		System.out.println("******************号码预占******************共耗时/ms : " + (endTime - startTime));
		Map<String, Object> resultMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
			resultMap.put("code", ResultCode.R_SUCCESS);
			if("E".equals(param.get("actionType")))//batchId只有在号码预占时才会返回
				resultMap.put("batchId", db.getReturnlmap().get("batchId"));//号码批量预占批次号
		} else {
			resultMap.put("code",  ResultCode.R_FAIL);
			resultMap.put("result", db.getReturnlmap().get("result"));
			resultMap.put("msg", db.getResultMsg());
			if("E".equals(param.get("actionType")))//batchId只有在号码预占时才会返回
				resultMap.put("batchId", db.getReturnlmap().get("batchId"));//号码批量预占批次号
		}
		return resultMap;
	}
	public Map<String,Object> qryOrderList(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
	throws Exception{

		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.QUERY_ORDER_LIST, optFlowNum, sessionStaff);
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
			throw new BusinessException(ErrorCode.ORDER_QUERY,param,db.getReturnlmap(), e);
		}
	}
	@SuppressWarnings("unchecked")
	public Map<String, Object> batchExcelQuery(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_BATCH_IMPORTQUERY, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData!=null&&returnData.get("result")!=null){
					//{"reslut":{"totalSize":0,"objList":[]},"resultCode":"0","resultMsg":"成功"}
					if(returnData.get("result") instanceof Map){
						resultMap = (Map<String, Object>)returnData.get("result") ;
						resultMap.put("code", ResultCode.R_SUCCESS);
					}
				}
			} 
			if(!(resultMap!=null&&ResultCode.R_SUCCESS.equals(resultMap.get("code")))){
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.batchOrderService/queryBatchOrderList服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_IMP_LIST, param, db.getReturnlmap(), e);
		}	
		return resultMap;
	}
	@SuppressWarnings("unchecked")
	public Map<String, Object> batchOrderQuery(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_BATCH_ORDERQUERY, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData!=null&&returnData.get("result")!=null){
					//{"reslut":{"totalSize":0,"objList":[]},"resultCode":"0","resultMsg":"成功"}
					if(returnData.get("result") instanceof Map){
						resultMap = (Map<String, Object>)returnData.get("result") ;
						resultMap.put("code", ResultCode.R_SUCCESS);
					}
				}
			} 
			if(!(resultMap!=null&&ResultCode.R_SUCCESS.equals(resultMap.get("code")))){
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.batchOrderService/queryBatchOrderTemplageList服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_ORDER_LIST, param, db.getReturnlmap(), e);
		}
		return resultMap;
	}

	public Map<String, Object> batchOrderDel(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_BATCH_ORDERDEL, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.batchOrderService/updateOrderListForCustOrderDel服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_ORDER_DEL, param, db.getReturnlmap(), e);
		}
		return resultMap;
	}
	
	
	//查询产品下的帐户信息
	public Map<String, Object> queryProdAcctInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_PROD_ACCT_INFO, optFlowNum, sessionStaff);
		try{
			Map<String, Object> resultMap = db.getReturnlmap();
			
			if(resultMap.get("resultCode").equals(ResultCode.R_SUCC)){

				return resultMap;
			}
			else{
				return null;
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的queryBoAccountRelasByProdId服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_PROD_ACCT, dataBusMap, db.getReturnlmap(), e);
		}	
	}
	
	//产品下终端实例数据查询
	public Map<String, Object> queryOfferCouponById(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_OFFER_COUPON_BY_ID, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = db.getReturnlmap();
		try {
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> result = (Map<String, Object>) resultMap.get("result");
				resultMap.put("code", ResultCode.R_SUCCESS);
				resultMap.put("result", result);
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
			return resultMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_OFFER_SPEC,dataBusMap,db.getReturnlmap(), e);
		}
	}
	
	//查询帐户详情
	public Map<String, Object> queryAcctDetailInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_QUERY_ACCT_DETAIL, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = db.getReturnlmap();
		return resultMap;
	}

	public Map<String, Object> delOrder(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.DEL_ORDER, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("resultCode", "1");
				resultMap.put("resultMsg", db.getResultMsg());
			}
			return resultMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.DEL_ORDER,paramMap,db.getReturnlmap(), e);
		}
	}

	public Map<String, Object> queryCompProdMemberByAn(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.QUERY_COMPPRODMEMBER_LIST, optFlowNum, sessionStaff);
		try {
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
			return resultMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_COMPPRODMEMBER,param,db.getReturnlmap(), e);
		}
		
	}
	/*
	 * 短号查询(non-Javadoc)
	 * 
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#orderSpecParam(java.util.Map,
	 * java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> shortnum_query(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.SHORTNUM_QUERY, optFlowNum, sessionStaff);
		
		try{
			int shortnum_num = -1 ;//是否包含短号节点，是否多个短号【select多个】
			
			result.put("code", -1);
			result.put("mess", db.getResultMsg());
			result.put("shortnum_num", shortnum_num);
			String shortnum_code = MySimulateData.getInstance().getParam(sessionStaff.getDbKeyWord(),SysConstant.ORDER_SHORTNUM_CODE);
			List<Map> offerProdComps_list = new ArrayList<Map>();
			
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", 1);
				result.put("mess", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					shortnum_num = 0 ;
					result.put("shortnum_num", shortnum_num);
					
					Map<String, Object> data = (Map)returnMap.get("result");
					if(data.get("offerProdComps")!=null){
						List<Map> list_offerProdComps = (List<Map>)data.get("offerProdComps");
						for(Map row_offerProdComps:list_offerProdComps){
							if(row_offerProdComps.get("offerProdCompItems")!=null){
								List<Map> list_offerProdCompItems = (List<Map>)row_offerProdComps.get("offerProdCompItems");
								for(Map map_offerProdCompItems:list_offerProdCompItems){
									Object itemSpecId=map_offerProdCompItems.get("itemSpecId");
									if(shortnum_code!=null&&itemSpecId!=null&&shortnum_code.equals(itemSpecId.toString())){
										shortnum_num ++ ;
										offerProdComps_list.add(row_offerProdComps);
										break;
									}
								}
							}
						}
						result.put("offerProdComps", offerProdComps_list);
						result.put("shortnum_code", shortnum_code);
						result.put("shortnum_num", shortnum_num);
						result.put("code", 0);
					}
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.ORDER_COMP_PROD_INST,dataBusMap,db.getReturnlmap(), e);
		}
	}

	public Map<String, Object> queryCompPspecGrpsBySpecId(
			Map<String, Object> param, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.QUERY_COMPSPEC_BY_SPECID, optFlowNum, sessionStaff);
		try {
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
			return resultMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_COMPSPEC,param,db.getReturnlmap(), e);
		}
	}

	public Map<String, Object> queryCompProdInstByProdId(
			Map<String, Object> param, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.QUERY_COMPPRODINST_BY_PRODID, optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
			resultMap.put("code", ResultCode.R_SUCCESS);
		} else {
			resultMap.put("code",  ResultCode.R_FAIL);
			resultMap.put("msg", db.getResultMsg());
		}
		return resultMap;
	}
	//add by xuj
	public Map<String, Object> checkProdRule(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		Map<String, Object> rMap = new HashMap<String, Object>();
		Map<String, Object> pMap = new HashMap<String, Object>();
		List<?> ruleList = null;
		boolean rtFlag = false;
		String boActionTypeCd = MapUtils.getString(paramMap, "boActionTypeCd");
		String prodStateCd = MapUtils.getString(paramMap, "prodStateCd");
		String stopRecordCd = MapUtils.getString(paramMap, "stopRecordCd");	
		String columnValue = "";
		pMap.put("tableName", "RULE");
		pMap.put("columnName", "PROD_RULE");
		rMap = queryAgentPortalConfig(pMap, flowNum, sessionStaff);
		columnValue = getAgentPortalConfigColumnValue(rMap,"PROD_RULE");
		ruleList = JsonUtil.toObject(columnValue, List.class);
		if (!(ruleList==null)){
			for (int k = 0; k< ruleList.size(); k++){
				//停机规则
				Map stopMap = new HashMap();
				//产品状态规则
				Map prodStateMap = new HashMap();
				//全量规则
				Map ruleMap = (Map)ruleList.get(k);
				String msg = MapUtils.getString(ruleMap, "message");
				if (boActionTypeCd.equals(MapUtils.getString(ruleMap, "boActionTypeCd"))){
					prodStateMap = MapUtils.getMap(ruleMap, "prodState");
					if (MapUtils.isNotEmpty(prodStateMap)){
						//标志0为直接限制规则，1为反选限制规则
						if ("0".equals(MapUtils.getString(prodStateMap, "flag"))){
							if (isCompriseStringArray(prodStateCd,MapUtils.getString(prodStateMap, "cd"),",")){
								if (StringUtils.isNotBlank(stopRecordCd)){
									stopMap = MapUtils.getMap(ruleMap, "stopRecord");
									if (MapUtils.isNotEmpty(stopMap)){
										//标志0为直接限制规则，1为反选限制规则
										if ("0".equals(MapUtils.getString(stopMap, "flag"))){
											rtFlag = isCompriseStringArray(stopRecordCd,MapUtils.getString(stopMap, "cd"),",");
										}else{
											rtFlag = isNotCompriseStringArray(stopRecordCd,MapUtils.getString(stopMap, "cd"),",");
										}
									}
								}else{
									if (MapUtils.isEmpty(stopMap)){
										rtFlag = true;
									}
								}
							}
						}else{
							if (isNotCompriseStringArray(prodStateCd,MapUtils.getString(prodStateMap, "cd"),",")){
								if (StringUtils.isNotBlank(stopRecordCd)){
									stopMap = MapUtils.getMap(ruleMap, "stopRecord");
									if (MapUtils.isNotEmpty(stopMap)){
										//标志0为直接限制规则，1为反选限制规则
										if ("0".equals(MapUtils.getString(stopMap, "flag"))){
											rtFlag = isCompriseStringArray(stopRecordCd,MapUtils.getString(stopMap, "cd"),",");
										}else{
											rtFlag = isNotCompriseStringArray(stopRecordCd,MapUtils.getString(stopMap, "cd"),",");
										}
									}
								}else{
									if (MapUtils.isEmpty(stopMap)){
										rtFlag = true;
									}
								}
							}
						}
					}
				}
				if (rtFlag == true){
					resultMap.put("ruleType", "portal");
					resultMap.put("resultMsg", msg);
					resultMap.put("resultCode", ResultCode.R_SUCC);
					rtFlag = false;
				}
			}
		}
		return resultMap;
	}
	private String getAgentPortalConfigColumnValue(Map<String, Object> paramMap,String key){
		String columnValue= "";
		Object o = MapUtils.getObject(paramMap, "result");
		if (o instanceof List){
			List lt = (List)o;
			for (int i = 0; i<lt.size(); i++){
				Map mp = (Map)lt.get(i);
				Object oo = MapUtils.getObject(mp, key);
				List ltt = (List)oo;
				for (int j = 0; j<ltt.size(); j++){
					Map mpp = (Map)ltt.get(j);
					columnValue = MapUtils.getString(mpp, "COLUMN_VALUE");
				}
			}
		}

		return columnValue;
	}
	//str1 数组包含在str2数组中的判断，例如{1,2}包含在{1,2,3,4}之中,计数器循环判断
	private static boolean isCompriseStringArray(String str1,String str2,String character){
		String strArray1[] = str1.split(character);
		String strArray2[] = str2.split(character);
		boolean flag = false;
		int count = 0;
		for (int i = 0 ; i < strArray1.length ; i++ ){
			for (int j = 0 ; j < strArray2.length ; j++ ){
				if (strArray1[i].equals(strArray2[j])){
					count++;
				}
			}
		}
		if (count == strArray1.length){
			flag = true;
		}
		return flag;
	}
	//str1 数组不包含在str2数组中的判断，例如{1,2}不包含在{2,3,4}之中,计数器循环判断
	private static boolean isNotCompriseStringArray(String str1,String str2,String character){
		String strArray1[] = str1.split(character);
		String strArray2[] = str2.split(character);
		boolean flag = false;
		int count = 0;
		for (int i = 0 ; i < strArray1.length ; i++ ){
			for (int j = 0 ; j < strArray2.length ; j++ ){
				if (strArray1[i].equals(strArray2[j])){
					count++;
				}
			}
		}
		if (count == 0){
			flag = true;
		}
		return flag;
	}
	@SuppressWarnings("unchecked")
	public Map<String,Object> queryOrderInfoById(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
	throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.ORDER_DETAIL_INFO, optFlowNum, sessionStaff);
		if(db.getReturnlmap()!=null){
			Map<String,Object> returnMap = db.getReturnlmap();
			if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
				resultMap = (Map<String,Object>)returnMap.get("result");
				resultMap.put("code", 0);
			}else{
				resultMap.put("code", 1);
			}
		}else{
			resultMap.put("code", 2);
		}
		return resultMap;
	}
	public Map<String, Object> updateInvoiceInvalid(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
	throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_INVALID_INVOICE, flowNum, sessionStaff);
		try{
			if(db.getReturnlmap()!=null){
				Map<String,Object> returnMap = db.getReturnlmap();
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode").toString())){
					resultMap.put("code", "0");
				}else{
					resultMap.put("code", "1");
				}
			}else{
				resultMap.put("code", "2");
			}
			return resultMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.INVOICE_INVALID,dataBusMap,db.getReturnlmap(), e);
		}
	}

	public Map<String, Object> groupShortNbrQuery(
			Map<String, Object> dataBusMap, String flowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_GROUPSHORTNBR, flowNum, sessionStaff);
		try {
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap.put("code", ResultCode.R_SUCCESS);
				resultMap.put("msg", db.getResultMsg());
			}else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
			return resultMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.SHORT_NUM_CHECK,dataBusMap,db.getReturnlmap(), e);
		}
		
	}
	
	
	public Map<String, Object> updateCheckByChange(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff) throws Exception{
		DataBus db = InterfaceClient.callService(paramMap, PortalServiceCode.INTF_QUERY_CHECKBYCHANGE, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			resultMap = db.getReturnlmap();
		} catch (Exception e) {
			log.error("门户处理营业后台的updateCheckByChange服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_CHECKBYCHANGE, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/*
	 * 发展人类型 (non-Javadoc)
	 * 
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#orderSpecParam(java.util.Map,
	 * java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	public Map<String, Object> assistantTypeQuery(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("code", "1");
		resultMap.put("mess", "接口调用异常");
		
		//获取发展人常量，判断是否需要调用接口
		Object data= Const.ASSISTANT_TYPE;
		
		if(data!=null && data instanceof List){
			resultMap.put("code", "0");
			resultMap.put("data", data);
			resultMap.put("mess", "获取数据成功");
		}else{
			DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_PARTY_TWO_PRODU_ROLE, flowNum, sessionStaff);
			if(db.getReturnlmap()!=null){
				Map<String,Object> returnMap = db.getReturnlmap();
				if(returnMap!=null){
					if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
						if(returnMap.get("result")!=null && returnMap.get("result") instanceof List){
							resultMap.put("code", "0");
							resultMap.put("data",returnMap.get("result"));
							resultMap.put("mess", "调用数据成功");
							Const.ASSISTANT_TYPE=returnMap.get("result");
						}else{
							resultMap.put("code", "1");
							resultMap.put("mess", returnMap.get("resultMsg")==null?"":returnMap.get("resultMsg").toString());
						}
					}else{
						resultMap.put("code", "1");
						resultMap.put("mess", returnMap.get("resultMsg")==null?"":returnMap.get("resultMsg").toString());
					}
				}
			}
		}
		
		return resultMap;
	}

    public  Map<String, Object> updateArchivedAuto(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap=new HashMap<String, Object>();
        DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.UPDATE_ARCHIVED_AUTO, flowNum, sessionStaff);
        try {
            String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
            returnMap.put("resultCode", resultCode);
            returnMap.put("resultMsg", MapUtils.getString(db.getReturnlmap(), "resultMsg", ""));
            if (ResultCode.R_SUCC.equals(resultCode)) {
                returnMap.putAll(MapUtils.getMap(db.getReturnlmap(), "result", new HashMap<String, Object>()));
            } else {
                returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
            }
            return returnMap;
        } catch (Exception e) {
            log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.STAFF_LOGIN, dataBusMap, returnMap, e);
        }
    }
    
    public Map<String, Object> orderUndoCheck(Map<String, Object> paramMap,String flowNum,SessionStaff sessionStaff)throws Exception{
    	Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.ORDER_UNDO_CHECK, flowNum,sessionStaff);	
		try{
			result.put("code", -1);
			result.put("mess", "门户调用后台接口异常！");
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", 1);
				result.put("mess", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					result = (Map)returnMap.get("result");
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.ORDER_UNDO_CHECK,paramMap,db.getReturnlmap(), e);
		}
    }

    /**
     * 下省校验单
     */
	public Map<String, Object> checkRuleToProv(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.CHECK_RULE_TO_PROV, optFlowNum, sessionStaff);
		
		try{
			return db.getReturnlmap();
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.soService/checkRuleToProv服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CHECK_RULETOPRO, dataBusMap, db.getReturnlmap(), e);
		}
	}
    
    public  Map<String, Object> querybusitype(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap=new HashMap<String, Object>();
        DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_QUERY_BUSITYPE, flowNum, sessionStaff);
        try {
            String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
            Map remap = db.getReturnlmap();
            returnMap.put("resultCode", resultCode);
            returnMap.put("resultMsg", MapUtils.getString(db.getReturnlmap(), "resultMsg", ""));
            if (ResultCode.R_SUCCESS.equals(resultCode)) {
            	List relist = (List)remap.get("result");
                returnMap.put("result", relist);
            } else {
                returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
            }
            return returnMap;
        } catch (Exception e) {
//            log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.QRY_BUSITYPE, dataBusMap, returnMap, e);
        }
    }
    
    public  Map<String, Object> querybusiactiontype(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap=new HashMap<String, Object>();
        DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_QUERY_BUSIACTIONTYPE, flowNum, sessionStaff);
        try {
            String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
            Map remap = db.getReturnlmap();
            returnMap.put("resultCode", resultCode);
            returnMap.put("resultMsg", MapUtils.getString(db.getReturnlmap(), "resultMsg", ""));
            if (ResultCode.R_SUCCESS.equals(resultCode)) {
            	List relist = (List)remap.get("result");
                returnMap.put("result", relist);
            } else {
                returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
            }
            return returnMap;
        } catch (Exception e) {
//            log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.QRY_BUSIACTIONTYPE, dataBusMap, returnMap, e);
        }
    }
    
    public  Map<String, Object> suborderysl(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap=new HashMap<String, Object>();
        DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_INSERT_ORDERYSLINFO, flowNum, sessionStaff);
        try {
            String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
            returnMap.put("resultCode", resultCode);
            returnMap.put("resultMsg", db.getResultMsg());
            if (ResultCode.R_SUCCESS.equals(resultCode)) {
            	returnMap.put("INVOICE_ID", MapUtils.getString(db.getReturnlmap(), "INVOICE_ID", ""));
            	returnMap.put("CUST_ORDER_ID", MapUtils.getString(db.getReturnlmap(), "CUST_ORDER_ID", ""));
            	returnMap.put("CUST_SO_NUMBER", MapUtils.getString(db.getReturnlmap(), "CUST_SO_NUMBER", ""));
            } else {
                returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
            }
            return returnMap;
        } catch (Exception e) {
//            log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.INSERT_ORDERYSL, dataBusMap, returnMap, e);
        }
    }
    
    public  Map<String, Object> updateorderzdyy(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap=new HashMap<String, Object>();
        DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_UPDATE_ORDERZDYYINFO, flowNum, sessionStaff);
        try {
            String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
            returnMap.put("resultCode", resultCode);
            returnMap.put("resultMsg", db.getResultMsg());
            if (ResultCode.R_SUCCESS.equals(resultCode)) {
            	returnMap.put("cust_order_id", MapUtils.getString(db.getReturnlmap(), "cust_order_id", ""));
            } else {
                returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
            }
            return returnMap;
        } catch (Exception e) {
//            log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.UPDATE_ORDERZDYY, dataBusMap, returnMap, e);
        }
    }
    
    public  Map<String, Object> queryyslList(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap=new HashMap<String, Object>();
        DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_QUERY_ORDERYSLINFO, flowNum, sessionStaff);
        try {
            String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
            returnMap.put("resultCode", resultCode);
            returnMap.put("resultMsg", MapUtils.getString(db.getReturnlmap(), "resultMsg", ""));
            if (ResultCode.R_SUCCESS.equals(resultCode)) {
            	return db.getReturnlmap();
            } else {
                returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
            }
            return returnMap;
        } catch (Exception e) {
//            log.error("门户处理系统管理的staffLogin服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.QUERY_ORDERYSL, dataBusMap, returnMap, e);
        }
    }
    
    public  Map<String, Object> queryzdyyList(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap=new HashMap<String, Object>();
        DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_QUERY_ORDERZDYYINFO, flowNum, sessionStaff);
        try {
            String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
            returnMap.put("resultCode", resultCode);
            returnMap.put("resultMsg", MapUtils.getString(db.getReturnlmap(), "resultMsg", ""));
            if (ResultCode.R_SUCCESS.equals(resultCode)) {
            	return db.getReturnlmap();
            } else {
                returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
            }
            return returnMap;
        } catch (Exception e) {
//            TODO
            throw new BusinessException(ErrorCode.QUERY_ORDERZDYY, dataBusMap, returnMap, e);
        }
    }
    
    public  Map<String, Object> queryzdyyDetail(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception {
    	Map<String, Object> returnMap=new HashMap<String, Object>();
    	DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_QUERY_ORDERZDYYINFO, flowNum, sessionStaff);
    	try {
    		String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
    		returnMap.put("resultCode", resultCode);
    		returnMap.put("resultMsg", MapUtils.getString(db.getReturnlmap(), "resultMsg", ""));
    		if (ResultCode.R_SUCCESS.equals(resultCode)) {
    			return db.getReturnlmap();
    		} else {
    			returnMap.put("errorNum", MapUtils.getString(db.getReturnlmap(), "errorNum", "11"));
    		}
    		return returnMap;
    	} catch (Exception e) {
//            TODO
    		throw new BusinessException(ErrorCode.QUERY_ORDERZDYY, dataBusMap, returnMap, e);
    	}
    }
    
    public Map<String, Object> updateChargeInfoForCheck(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.UPDATE_CHARGEINFO_FORCHECK, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg()==null?"收费校验失败，集团营业后台未返回resultMsg【resultMsg=null】":db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.soService/checkRuleToProv服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CHARGE_SUBMIT, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}
    
    public  Map<String, Object> createorderlonger(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap=new HashMap<String, Object>();
        DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.CREATE_ORDERLONGER, flowNum, sessionStaff);
        try {
            Map remap = db.getReturnlmap();
            return remap;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.CREATE_ORDERLONGER, dataBusMap, returnMap, e);
        }
    }
    
    @SuppressWarnings("unchecked")
	public Map<String, Object> queryAuthenticDataRange(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.QUERY_AUTHENTICDATARANGE, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				returnMap.put("result", db.getReturnlmap().get("result"));
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的queryAuthenticDataRange服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_AUTHENTICDATARANGE, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}
    
    @SuppressWarnings("unchecked")
	public Map<String, Object> GetOLpos(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = ServiceClient.callService(dataBusMap,PortalServiceCode.GET_OLPOS, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if ("POR-0000".equals(db.getResultCode().toString())) {
				returnMap.put("result", db.getReturnlmap().get("rList"));
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的com.linkage.portal.service.lte.core.resources.GetOLpos服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_AUTHENTICDATARANGE, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}
    
    /*
     * 实例订单查询接口
     */
    @SuppressWarnings("unchecked")
	public Map<String, Object> queryOrderItemDetailForResale(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.INTF_QUERY_ORDER_RESALE, optFlowNum, sessionStaff);
    	
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				returnMap.put("result", db.getReturnlmap().get("orderListInfo"));
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的queryOrderItemDetailForResale服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.INTF_QUERY_ORDER_RESALE, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	public Map<String, Object> queryOrderListInfoByCustomerOrderId(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.QUERY_ORDER_LIST_INFO_BY_ORDER_ID, optFlowNum, sessionStaff);
    	
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				returnMap.put("result", db.getReturnlmap().get("result"));
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的queryOrderListInfoByCustomerOrderId服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_ORDER_LIST_INFO_BY_ORDER_ID, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	public Map<String, Object> saveResourceData(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.SAVE_RESOURCE_DATA, optFlowNum, sessionStaff);
    	
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				returnMap.put("result", db.getReturnlmap().get("result"));
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的saveResourceData服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.SAVE_RESOURCE_DATA, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}
	
	
	public Map<String, Object> queryAccNbrList(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_CARDNBLIST, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.RES_SUCCESS.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的一卡双号订购校验接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_CARDNBLIST, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> exchangeAccNbr(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.EXCHANGE_ACCNBR, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.RES_SUCCESS.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的一卡双号订购正式单接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.EXCHANGE_ACCNBR, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> queryVirtualInfo(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_VIRTUALINFO, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.RES_SUCCESS.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的一卡双号退订查序号接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_VIRTUALINFO, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * 产品实例属性(non-Javadoc)
	 * 
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#orderSpecParam(java.util.Map,
	 * java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> prodInstParam(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
    throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("resultCode", ResultCode.R_FAILURE);
		resultMap.put("resultMsg", "未获取到产品属性");
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.PRODUCT_PARAM_QUERY, optFlowNum,sessionStaff);
		try{
			resultMap.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap() ;
//				resultMap.put("resultCode", 1);
				resultMap.put("resultMsg", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					Map<String, Object> data = (Map<String, Object>)returnMap.get("result");
					if(data.get("prodInstParams")!=null){
						list = (List<Map<String, Object>>) data.get("prodInstParams");
					}
				}
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.ORDER_PROD_INST,param,db.getReturnlmap(), e);
		}
		
		if(list!=null&&list.size()>0){
			resultMap.put("resultCode", ResultCode.R_SUCC);
			resultMap.put("resultMsg", "成功");
			resultMap.put("prodSpecParams", list);
		}
		return resultMap;
	 }
	
	public Map<String, Object> cardProgressQuery(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.CARD_PROGRESS_QUERY, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的自助换卡查询进度接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CARD_PROGRESS_QUERY, paramMap, resultMap, e);
		}
		return resultMap;
	}

	/*
	 * 终端预约记录查询 
	 */
	public Map<String, Object> queryCouponReserve(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.QUERY_COUPON_RESERVE, optFlowNum, sessionStaff);
		try{
			result.put("code", ResultCode.R_EXCEPTION);
			result.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map returnMap = db.getReturnlmap() ;
				result.put("code", ResultCode.R_FAILURE);
				result.put("mess", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					result = (Map)returnMap.get("result");
					result.put("code", ResultCode.R_SUCC);
				}
			}
			return result ;
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_COUPON_RESERVE,dataBusMap,db.getReturnlmap(), e);
		}
	}
	/*
	 * 终端预约在途单查询
	 */

	public Map<String, Object> queryCouponRoadReserve(Map<String, Object> dataBusMap,
			String optFlowNum,SessionStaff sessionStaff) throws Exception {
			Map<String, Object> result = new HashMap<String, Object>();
			DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.QUERY_COUPON_ROAD_RESERVR, optFlowNum, sessionStaff);
			try{
				result.put("code", ResultCode.R_EXCEPTION);
				result.put("mess", db.getResultMsg());
				if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
					Map returnMap = db.getReturnlmap() ;
					result.put("code", ResultCode.R_FAILURE);
					result.put("mess", returnMap.get("resultMsg"));
					if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
						result = (Map)returnMap.get("result");
						result.put("code", ResultCode.R_SUCC);
					}
				}
				return result ;
			}catch(Exception e){
				throw new BusinessException(ErrorCode.QUERY_COUPON_ROAD_RESERVE,dataBusMap,db.getReturnlmap(), e);
			}
		}

	public Map<String, Object> queryConfigData(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("resultCode", ResultCode.R_FAILURE);
		resultMap.put("resultMsg", "未获取到配置数据");
		List<Map<String, Object>> data = null;
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.CONFIG_DATA_QUERY, optFlowNum,sessionStaff);
		try{
			resultMap.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap() ;
//				resultMap.put("resultCode", 1);
				resultMap.put("resultMsg", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					data = (List<Map<String, Object>>)returnMap.get("result");
				}
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.CONFIG_DATA_QUERY,param,db.getReturnlmap(), e);
		}
		
		if(data!=null){
			resultMap.put("resultCode", ResultCode.R_SUCC);
			resultMap.put("resultMsg", "成功");
			resultMap.put("result", data);
		}
		return resultMap;
	}

	public Map<String, Object> queryCouponAttrValue(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("resultCode", ResultCode.R_FAILURE);
		resultMap.put("resultMsg", "未获取到配置数据");
		List<Map<String, Object>> data = null;
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.QUERY_COUPON_ATTR_VALUE, optFlowNum,sessionStaff);
		try{
			resultMap.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap() ;
//				resultMap.put("resultCode", 1);
//				resultMap.put("resultMsg", returnMap.get("resultMsg"));
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
//					data = (List<Map<String, Object>>)returnMap.get("result");
					Map<String, Object> result = (Map<String, Object>)returnMap.get("result");
					if(result != null){
						data = (List<Map<String, Object>>) result.get("couponAttrList");
					}
				}
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_COUPON_ATTR_VALUE,param,db.getReturnlmap(), e);
		}
		
		if(data!=null && data.size()>0){
			resultMap.put("resultCode", ResultCode.R_SUCC);
			resultMap.put("resultMsg", "成功");
			resultMap.put("result", data);
		}
		return resultMap;
	}

	public Map<String, Object> queryOldCouponDiscountPriceByAttrs(
			Map<String, Object> param, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("resultCode", ResultCode.R_FAILURE);
		resultMap.put("resultMsg", "以旧换新回购价格查询出错");
		Map<String, Object> data = null;
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.QUERY_OLD_COUPON_DISCOUNT_PRICE, optFlowNum,sessionStaff);
		try{
			resultMap.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap() ;
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					data = (Map<String, Object>)returnMap.get("result");
				}
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_OLD_COUPON_DISCOUNT_PRICE,param,db.getReturnlmap(), e);
		}
		
		if(data!=null){
			resultMap.put("resultCode", ResultCode.R_SUCC);
			resultMap.put("resultMsg", "成功");
			resultMap.put("result", data);
		}
		return resultMap;
	}

	public Map<String, Object> checkNewOldCouponRel(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("resultCode", ResultCode.R_FAILURE);
		resultMap.put("resultMsg", "以旧换新旧串码校验出错");
		Map<String, Object> data = null;
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.CHECK_NEW_OLD_COUPON_REL, optFlowNum,sessionStaff);
		try{
			resultMap.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap() ;
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					data = (Map<String, Object>)returnMap.get("result");
				}
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.CHECK_NEW_OLD_COUPON_REL,param,db.getReturnlmap(), e);
		}
		
		if(data!=null && data.size()>0){
			resultMap.put("resultCode", ResultCode.R_SUCC);
			resultMap.put("resultMsg", "成功");
			resultMap.put("result", data);
		}
		return resultMap;
	}

	public Map<String, Object> saveNewOldCouponRelInfo(
			Map<String, Object> param, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("resultCode", ResultCode.R_FAILURE);
		resultMap.put("resultMsg", "以旧换新旧新旧串码关系保存出错");
		Map<String, Object> data = null;
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.SAVE_NEW_OLD_COUPON_RELINFO, optFlowNum,sessionStaff);
		try{
			resultMap.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap() ;
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					data = (Map<String, Object>)returnMap.get("result");
				}
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.SAVE_NEW_OLD_COUPON_RELINFO,param,db.getReturnlmap(), e);
		}
		
		if(data!=null && data.size()>0){
			resultMap.put("resultCode", ResultCode.R_SUCC);
			resultMap.put("resultMsg", "成功");
			resultMap.put("result", data);
		}
		return resultMap;
		
	}
	
	/**
	 * 主套餐可选付费类型查询
	 */
	public Map<String, Object> queryOfferFeeType(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff)
		    throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("resultCode", ResultCode.R_FAILURE);
		resultMap.put("resultMsg", "主套餐可选付费类型查询出错");
		Map<String, Object> data = null;
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.QUERY_OFFER_FEE_TYPE, optFlowNum,sessionStaff);
		try{
			resultMap.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap() ;
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					data= (Map<String, Object>)returnMap.get("result");
				}
			}
		}catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_OFFER_FEE_TYPE,param,db.getReturnlmap(), e);
		}
		
		if(data!=null){
			resultMap.put("resultCode", ResultCode.R_SUCC);
			resultMap.put("resultMsg", "成功");
			resultMap.put("result", data);
		}
		return resultMap;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> saveOrderAttrs(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.SAVE_ORDER_ATTRS, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				returnMap.put("result", db.getReturnlmap().get("result"));
				returnMap.put("code", ResultCode.R_SUCCESS);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的saveOrderAttrs服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.SAVE_ORDER_ATTRS, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	/**
	 * 批量受理结果查询
	 * @param param 入参需包含批次号groupId(必填)和地区commonRegionId(非必填)
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 * @author ZhangYu
	 */
	public Map<String, Object> batchStatusQuery(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff) throws BusinessException, Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_BATCH_ORDERSTATUSQUERY, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//接口调用成功
					Map<String, Object> returnData = db.getReturnlmap();
					if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//后台数据返回正常
						if(returnData.get("result") instanceof Map){
							returnMap = (Map<String, Object>)returnData.get("result") ;
							returnMap.put("code", ResultCode.R_SUCCESS);
						}
					} else{
						returnMap.put("code", returnData.get("resultCode"));
						returnMap.put("msg", returnData.get("resultMsg"));
					}			
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的queryGroupBatchOrder服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_IMP_LIST, param, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	/**
	 * 批次信息查询下的删除和修改
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException 
	 * @author ZhangYu
	 */
	public Map<String, Object> batchOperate(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_BATCH_ORDEROPERATE, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//接口调用成功
					Map<String, Object> returnData = db.getReturnlmap();
					if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//后台数据返回正常
						if("cancel".equals(param.get("dealFlag"))){
							returnMap.put("result", returnData.get("result"));
							returnMap.put("code", ResultCode.R_SUCCESS);
							returnMap.put("msg", returnData.get("resultMsg"));
						} else{
							//returnMap = (Map<String, Object>)returnData.get("result");//由于此处不需要用到result且后台返回result为空，故暂不解析result
							returnMap.put("code", ResultCode.R_SUCCESS);
							returnMap.put("msg", returnData.get("resultMsg"));
						}
						
					} else{
						returnMap.put("code", returnData.get("resultCode"));
						returnMap.put("msg", returnData.get("resultMsg"));
						
					}			
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.batchOrderService/dealBatchQueueProgress服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_IMP_LIST, param, db.getReturnlmap(), e);
		}
		return returnMap;
	}
	
	/**
	 * 进度查询下的“取消”和“删除”
	 * @param param  = {"areaId":"登录员工的areaId","batchId":"批次号","action":"cancel或者retry","statusCd":"批次状态", "staffId":"登录员工的staffId","channelId":"登录员工的channelId"}
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return {"resultCode":"0或者1""resultMsg":"重发成功/取消成功"}
	 * @throws InterfaceException
	 * @throws IOException
	 * @throws Exception
	 * @author ZhangYu
	 */
	public Map<String, Object> batchReprocess(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_BATCH_BATCHREPROCESS, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//接口调用成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode")))//后台数据返回正常
					returnMap.put("code", ResultCode.R_SUCCESS);
				else
					returnMap.put("code", returnData.get("resultCode"));
				returnMap.put("msg", returnData.get("resultMsg"));
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.batchOrderService/cancelOrRetrySingleBatch服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_IMP_LIST, param, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	/**
	 * 批次信息查询下的进度查询
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException
	 * @author ZhangYu 
	 */
	public Map<String, Object> batchProgressQuery(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_BATCH_IMPORTQUERY, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData!=null&&returnData.get("result")!=null){
					if(returnData.get("result") instanceof Map){
						resultMap = (Map<String, Object>)returnData.get("result") ;
						resultMap.put("code", ResultCode.R_SUCCESS);
					}
				}
			} 
			if(!(resultMap!=null&&ResultCode.R_SUCCESS.equals(resultMap.get("code")))){
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.batchOrderService/queryBatchOrderList服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_IMP_LIST, param, db.getReturnlmap(), e);
		}	
		return resultMap;
	}

	/**
	 * 批次信息查询
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 * @author ZhangYu
	 */
	public Map<String, Object> batchOrderQueryList(Map<String, Object> param, String optFlowNum, SessionStaff sessionStaff) throws Exception {

		DataBus db = InterfaceClient.callService(param,PortalServiceCode.INTF_BATCH_ORDERQUERYLIST, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//后台数据返回正常
					if(returnData.get("result") instanceof Map){
						resultMap = (Map<String, Object>)returnData.get("result") ;
						resultMap.put("code", ResultCode.R_SUCCESS);
					}
				}
			} else{
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.batchOrderService/batchOrderQueryList服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.BATCH_IMP_LIST, param, db.getReturnlmap(), e);
		}	
		return resultMap;
	}
	
	public Map<String, Object> queryOrderBusiHint(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_ORDER_BUSI_HINT, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("result",db.getReturnlmap().get("result"));
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				String msg = "提示信息，下省查询获取提醒信息失败。";
				if(db.getResultMsg()!=null){
					if(!db.getResultMsg().trim().equals("")){
						msg = db.getResultMsg().trim();
					}
				}
				returnMap.put("msg", msg);
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.soService/queryOrderBusiHint服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_ORDERBUSIHINT, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	public Map<String, Object> reducePoingts(Map<String, Object> param,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.REDUCE_POINGTS, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//后台数据返回正常
					resultMap.put("code", ResultCode.R_SUCCESS);
				}
			} else{
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的biz-service/intf.custService/reducePoingts服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.REDUCE_POINGTS, param, db.getReturnlmap(), e);
		}	
		return resultMap;
	}

	public Map<String, Object> queryIntegral(Map<String, Object> paramMap,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.QUERY_INTEGRAL, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//后台数据返回正常
					if(returnData.get("result") instanceof Map){
						resultMap = (Map<String, Object>)returnData.get("result") ;
						resultMap.put("code", ResultCode.R_SUCCESS);
						resultMap.put("resultCode",returnData.get("resultCode"));
					}
				}
			} else{
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的biz-service/intf.custService/queryIntegral服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_INTEGRAL, paramMap, db.getReturnlmap(), e);
		}	
		return resultMap;
	}

	public Map<String, Object> queryStarHisList(Map<String, Object> param,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.QUERY_STARBONUSHIS, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//后台数据返回正常
					if(returnData.get("result") instanceof Map){
						resultMap = (Map<String, Object>)returnData.get("result") ;
						resultMap.put("code", ResultCode.R_SUCCESS);
						resultMap.put("resultCode",returnData.get("resultCode"));
					}
				}
			} else{
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的biz-service/intf.custService/queryBonusIntegralhis服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_STARBONUSHIS, param, db.getReturnlmap(), e);
		}	
		return resultMap;
	}

	public Map<String, Object> queryStarConsumeHisList(
			Map<String, Object> param, String flowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.QUERY_STARBONUSHIS, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//后台数据返回正常
					if(returnData.get("result") instanceof Map){
						resultMap = (Map<String, Object>)returnData.get("result") ;
						resultMap.put("code", ResultCode.R_SUCCESS);
						resultMap.put("resultCode",returnData.get("resultCode"));
					}
				}
			} else{
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的biz-service/intf.custService/queryBonusIntegralhis服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_STARBONUSHIS, param, db.getReturnlmap(), e);
		}	
		return resultMap;
	}

	public Map<String, Object> urgentOpen(Map<String, Object> param,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(param,PortalServiceCode.EMERGENCYBOOT, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {//调接口成功
				Map<String, Object> returnData = db.getReturnlmap();
				if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//后台数据返回正常
					if(returnData.get("result") instanceof Map){
						resultMap = (Map<String, Object>)returnData.get("result") ;
						resultMap.put("code", ResultCode.R_SUCCESS);
					}
				}
			} else{
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的biz-service/intf.soService/emergencyBoot服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.EMERGENCYBOOT, param, db.getReturnlmap(), e);
		}	
		return resultMap;
	}
	
	public Map<String, Object> queryMainInfo(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_MAININFO, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的一卡双号根据虚号查询主号接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_MAININFO, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> addBlackUserInfo(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.ADD_BLACK_USERINFO, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的一卡双号黑名单新增服务接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_MAININFO, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> queryBlackUserInfo(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_BLACK_USERINFO, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的一卡双号黑名单查询接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_BLACK_USERINFO, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
    /**
     * 渠道可支持的付费方式查询接口
     */
    public Map<String, Object> queryAvilablePayMethodCdByChannelId(Map<String, Object> paramMap, String optFlowNum,SessionStaff sessionStaff) throws Exception {
        DataBus db = InterfaceClient.callService(paramMap,
                PortalServiceCode.QUERY_AVILABLE_PAYMETHODCD, optFlowNum, sessionStaff);
        Map<String, Object> resultMap = new HashMap<String, Object>();
        try{
            // 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
            if (ResultCode.R_SUCC.equals(db.getResultCode())) {
                resultMap = db.getReturnlmap();
                resultMap.put("resultCode", ResultCode.R_SUCC);
            } else {
                resultMap.put("resultCode", ResultCode.R_FAILURE);
                resultMap.put("resultMsg", db.getResultMsg());
            }
        } catch (Exception e) {
            log.error("门户处理营业后台的一卡双号黑名单查询接口服务返回的数据异常", e);
            throw new BusinessException(ErrorCode.QUERY_BLACK_USERINFO, paramMap, resultMap, e);
        }
        return resultMap;
    }

	public Map<String, Object> savePayRecords(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap = new HashMap<String, Object>();
        DataBus db = ServiceClient.callService(dataBusMap,
                PortalServiceCode.PAY_SERVICE_SAVE_RECORDS, optFlowNum, sessionStaff);
        String resultCode = StringUtils.defaultString(db.getResultCode());
        if (ResultCode.R_SUCCESS.equals(resultCode)) {
            returnMap.put("code", ResultCode.R_SUCC);
            returnMap.put("result", db.getReturnlmap());
        } else {
            if (ResultCode.R_ERROR_PARAM.equals(resultCode)) {
                returnMap.put("code", ResultCode.R_EXCEPTION);
            } else {
                returnMap.put("code", ResultCode.R_FAILURE);
            }
        }
        returnMap.put("msg", db.getResultMsg());

        return returnMap;
    }

    public Map<String, Object> updatePayRecords(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception {
        Map<String, Object> returnMap = new HashMap<String, Object>();
        DataBus db = ServiceClient.callService(dataBusMap,
                PortalServiceCode.PAY_SERVICE_UPDATE_RECORDS, optFlowNum, sessionStaff);
        if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
            returnMap.put("code", ResultCode.R_SUCC);
        } else {
            returnMap.put("code", ResultCode.R_FAILURE);
        }
        returnMap.put("msg", db.getResultMsg());

        return returnMap;
    }

	/**
	 * 电子档案查询
	 */
	public Map<String, Object> queryElecRecordList(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_ELEC_RECORD_LIST, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = (Map<String, Object>) db.getReturnlmap().get("result");
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_ELEC_RECORD, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * 电子档案下载
	 */
	public Map<String, Object> downLoadElecRecordPdf(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.DOWN_LOAD_ELEC_RECORD, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = (Map<String, Object>) db.getReturnlmap().get("result");
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.DOWN_LOAD_ELEC_RECORD, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * 根据员工信息返回一个支付方式的权限列表<br/>
	 * 该方法主要根据sessionStaff从系管查询该员工是否具有“网银代收”和“账务托收”权限，
	 * 如果具有对应的权限，则以ArrayList返回对应的权限编码送与后台
	 * @param sessionStaff
	 * @return operatSpecList
	 * @throws IOException 
	 * @throws InterfaceException 
	 * @throws Exception
	 */
	public List<Map<String, String>> getAvilablePayMethodCdList(SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {
		Map<String, String> operatSpecMap = null;
		List<Map<String, String>> operatSpecList = new ArrayList<Map<String, String>>();
		StaffBmo staffBmo = new StaffBmoImpl();
		
		if("0".equals(staffBmo.checkOperatBySpecCd(SysConstant.OPERATSPEC_EBANK, sessionStaff))){
			operatSpecMap = new HashMap<String, String>();
			operatSpecMap.put("rightCode", SysConstant.OPERATSPEC_EBANK);
			operatSpecList.add(operatSpecMap);
		}
		if("0".equals(staffBmo.checkOperatBySpecCd(SysConstant.OPERATSPEC_BILLACCT, sessionStaff))){
			operatSpecMap = new HashMap<String, String>();
			operatSpecMap.put("rightCode", SysConstant.OPERATSPEC_BILLACCT);
			operatSpecList.add(operatSpecMap);
		}
				
		return operatSpecList;
	}
	
	/*
	 * 失效黑名单
	 */
	public Map<String, Object> blackListInvalid(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception{
		
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.BLACKLIST_INVALID, optFlowNum, sessionStaff);
		try{
			return db.getReturnlmap();
		}catch(Exception e){
			throw new BusinessException(ErrorCode.INVALID_BLACKLIST, dataBusMap, db.getReturnlmap(), e);
		}
	}

	public Map<String, Object> queryPayTocken(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> paramMap2 = new HashMap<String, Object>();
		Random rand = new Random();
		int k = rand.nextInt(89999)+10000;//支付流水随机码
		String reqPlatForm="1000000244";
//		String provinceCode="8310000";
//		String cityCode = "8310001";
//		String channelId = "1001";
		String provinceCode="";
		String cityCode = sessionStaff.getCurrentAreaId();
		if(cityCode!=null && !cityCode.equals("")){
			provinceCode=cityCode.substring(0,3)+"0000";
		}
		String channelId=sessionStaff.getCurrentChannelId();
		String reqNo = paramMap.get("olId").toString()+k;//业务流水号
		String detail = URLEncoder.encode("翼销售支付", "utf-8");   
		String customerId = "";
		String customerName="";
		String olId = paramMap.get("olId").toString();
		String olNbr = paramMap.get("soNbr").toString();
		String olNumber = sessionStaff.getStaffId();
		paramMap2.put("olId",  olId);//购物车id
		paramMap2.put("olNbr",  olNbr);//购物车流水
		paramMap2.put("reqNo", reqNo);//传给支付平台的业务流水号要保证不同
		String payAmount = paramMap.get("chargeItems").toString(); 
		String busiUpType=paramMap.get("busiUpType").toString();//业务类型，默认1手机业务
//		try {
//			List<Map<String, Object>> chargeItems = new ArrayList<Map<String, Object>>();
//			chargeItems = (List<Map<String, Object>>) paramMap
//					.get("chargeItems");
//			for (Map<String, Object> chargeItem : chargeItems) {
//				payAmount += Long.parseLong(chargeItem.get("realAmount")
//						.toString());
//			}
//		} catch (Exception e) {
//			payAmount = 0;
//		}
		paramMap2.put("provinceCode", provinceCode);
		paramMap2.put("cityCode", cityCode);//areaId
		paramMap2.put("channelId", channelId);//areaId
		paramMap2.put("payAmount", payAmount);// 金额，单位分
		paramMap2.put("olNumber", olNumber);// 工号
		paramMap2.put("customerId", customerId);// 
		paramMap2.put("customerName", customerName);
		paramMap2.put("detail", detail);// 详情描述
		paramMap2.put("busiUpType", busiUpType);// 业务类型：1，手机业务2宽带甩单。
		String paramStr = "provinceCode=" + provinceCode + "&cityCode=" + cityCode + "&channelId=" + channelId + 
				"&reqNo=" + reqNo + "&payAmount=" + payAmount +"&detail="+detail+"&olId="+olId+"&olNumber="+olNumber+"&busiUpType="+busiUpType;
		String sign = AESUtils.encryptToString(paramStr, "YXS_KEY_2016");
		paramMap2.put("sign", sign);
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("reqPlatForm", reqPlatForm);//请求平台
		dataBusMap.put("params", paramMap2);
		Map<String, Object> dataBusMap2 = new HashMap<String, Object>();
		dataBusMap2.put("proot", dataBusMap);
		DataBus db = InterfaceClient.callService(dataBusMap2,
				PortalServiceCode.PAY_TOCKEN, null, sessionStaff);
		return db.getReturnlmap();
	}

	public Map<String, Object> queryPayOrderStatus(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> paramMap2 = new HashMap<String, Object>();
		String reqPlatForm="1000000244";
		String provinceCode="";
		String cityCode = sessionStaff.getCurrentAreaId();
		if(cityCode!=null && !cityCode.equals("")){
			provinceCode=cityCode.substring(0,3)+"0000";
		}
		String olId = paramMap.get("olId").toString();//业务订单号
		String reqPayType = "1";//支付
		String paramStr = "provinceCode=" + provinceCode + "&olId=" + olId+"&reqPayType="+reqPayType;
		String sign = AESUtils.encryptToString(paramStr, "YXS_KEY_2016");
		paramMap2.put("provinceCode", provinceCode);
		paramMap2.put("olId", olId);
		paramMap2.put("reqPayType", reqPayType);
		paramMap2.put("sign", sign);
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		Map<String, Object> dataBusMap2 = new HashMap<String, Object>();
		dataBusMap.put("reqPlatForm", reqPlatForm);//请求平台
		dataBusMap.put("params", paramMap2);
		dataBusMap2.put("proot", dataBusMap);
		DataBus db = InterfaceClient.callService(dataBusMap2,
				PortalServiceCode.PAY_QUERY, null, sessionStaff);
		return db.getReturnlmap();
	}
	
	public Map<String, Object> preCheckBeforeOrde(Map<String, Object> paramMap,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		// TODO Auto-generated method stub
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.PRE_CHECK_ORDER, flowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的前置校验接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.PRE_CHECK_ORDER, paramMap, resultMap, e);
		}
		return resultMap;
	}

	public Map<String, Object> unityOrderUnder(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callServiceMiddleSys(param, 
				PortalServiceCode.BORAD_BAND_UNITY_ORDER,
				optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			resultMap = db.getReturnlmap();
			Map<String, Object> datamap = resultMap;
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.put("reult",datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "商机单下发接口调用失败");
		}
		return returnMap;				
	}

	public Map<String, Object> salesOrderUnder(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callServiceMiddleSys(param, 
				PortalServiceCode.BORAD_BAND_SALES_ORDER,
				optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			resultMap = db.getReturnlmap();
			Map<String, Object> datamap = resultMap;
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.put("reult",datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "销售单下发接口调用失败");
		}
		return returnMap;				
	}

	public Map<String, Object> queryInstallTime(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callServiceMiddleSys(param, 
				PortalServiceCode.BORAD_BAND_TIME_QRY,
				optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			resultMap = db.getReturnlmap();
			Map<String, Object> datamap = resultMap;
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.put("reult",datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "预约装机时间查询接口调用失败");
		}
		return returnMap;				
	}

	public Map<String, Object> queryOrderDetail(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callServiceMiddleSys(param, 
				PortalServiceCode.BORAD_BAND_ORDER_DETAIL,
				optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			resultMap = db.getReturnlmap();
			Map<String, Object> datamap = resultMap;
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.put("reult",datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "订单列表查询接口调用失败");
		}
		return returnMap;				
	}
	
	public Map<String, Object> querySaleOrderList(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callServiceMiddleSys(param, 
				PortalServiceCode.QUERY_SALES_ORDER_LIST,
				optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			resultMap = db.getReturnlmap();
			Map<String, Object> datamap = resultMap;
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.put("reult",datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "订单详情查询接口调用失败");
		}
		return returnMap;				
	}
	
	public Map<String, Object> querySaleOrderDetail(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callServiceMiddleSys(param, 
				PortalServiceCode.QUERY_SALES_ORDER_DETAIL,
				optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			resultMap = db.getReturnlmap();
			Map<String, Object> datamap = resultMap;
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.put("reult",datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "订单详情查询接口调用失败");
		}
		return returnMap;				
	}
	
	public Map<String, Object> queryChannelByCoords(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.BORAD_BAND_QUERYCHANNEL_BYCOORDS;
    	DataBus db = InterfaceClient.callService(param,serviceCode,optFlowNum, sessionStaff);
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(db.getReturnlmap());
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", db.getResultMsg());
		}
		return returnMap;
	}
	
	public Map<String, Object> queryChannel(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.BORAD_BAND_QUERYCHANNEL;
    	DataBus db = InterfaceClient.callService(param,serviceCode,optFlowNum, sessionStaff);
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(db.getReturnlmap());
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", db.getResultMsg());
		}
		return returnMap;
	}
	
	public Map<String, Object> queryChannelListById(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.BORAD_BAND_QUERYCHANNEL_LISTBYID;
    	DataBus db = InterfaceClient.callService(param,serviceCode,optFlowNum, sessionStaff);
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(db.getReturnlmap());
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", db.getResultMsg());
		}
		return returnMap;
	}
	
	public Map<String, Object> saleOrderCommit(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.BORAD_BAND_SALES_ORDER;
    	DataBus db = InterfaceClient.callServiceMiddleSys(param,serviceCode,optFlowNum, sessionStaff);
    	Map<String, Object> returnMap = new HashMap<String, Object>();
    	
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			returnMap = db.getReturnlmap();
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(returnMap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", db.getResultMsg());
			returnMap.put("flowId", db.getBusiFlowId());
		}
		return returnMap;
	}
	
	public Map<String, Object> queryChargeConfig(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.BORAD_BAND_QUERYCHARGECONFIG;
    	DataBus db = InterfaceClient.callService(param,serviceCode,optFlowNum, sessionStaff);
    	Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(db.getReturnlmap());
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", db.getResultMsg());
		}
		return returnMap;
	}
	
	public Map<String, Object> insertCertInfo(Map<String, Object> param,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		try{
			String dbKeyWord = sessionStaff == null ? null : sessionStaff.getDbKeyWord();
//			if(StringUtils.isBlank(dbKeyWord)){
//				dbKeyWord = MapUtils.getString(dataBusMap, DATABUS_DBKEYWORD,"");
//				dataBusMap.remove(DATABUS_DBKEYWORD);
//			}
			DataBus db = new DataBus();
			db = ServiceClient.initDataBus(sessionStaff);
			long beginTime = System.currentTimeMillis();
			String rawRetn = "";
			String logSeqId = "";
			rawRetn = JsonUtil.toString(param);
			if (sessionStaff != null) {
				callServiceLog(logSeqId, dbKeyWord, db, flowNum, "readCert", "readCert", sessionStaff, "", rawRetn, beginTime, System.currentTimeMillis());
			}
		}catch(Exception e){
			log.error("门户处理身份证信息插入日志服务返回的数据异常", e);
			//throw new BusinessException(ErrorCode.EMERGENCYBOOT, param, db.getReturnlmap(), e);
		}	
		return null;
	}
	/**
	 * 调用服务层日志记录
	 * @param dbKeyWord2 
	 * 
	 * @param db
	 *            DataBus
	 * @param busiFlowNum
	 *            服务层流水号
	 * @param optFlowNum
	 *            门户层操作流水号
	 * @param serviceCode
	 *            服务编码
	 * @param startTime
	 *            开始 时间
	 * @param endTime
	 *            结束 时间
	 */
	public static void callServiceLog(String logSeqId, String dbKeyWord, DataBus db, String optFlowNum, 
			String serviceCode, String intfUrl, SessionStaff sessionStaff, String paramString, String rawRetn, long beginTime, long endTime) {
		long startTime = System.currentTimeMillis();
		// 开始调用
		request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
		try {
//			String log_flag = MySimulateData.getInstance().getParam(dbKeyWord,prefix+"-"+serviceCode);
//			if(!"1".equals(log_flag)){
//				if("2".equals(log_flag)){
//					if(ResultCode.R_SUCC.equals(db.getResultCode()) || ResultCode.R_SUCCESS.equals(db.getResultCode())|| ResultCode.RES_SUCCESS.equals(db.getResultCode())){
//						return;
//					}
//				}else{
//					return;
//				}
//			}
			String olIdRemark="";
			String ol_id = "";
			String so_nbr = "";
//			if(PortalServiceCode.ORDER_SUBMIT.equals("biz-"+serviceCode)){//订单提交接口
//				Map<String, Object> paramMap = new HashMap<String, Object>();
//				paramMap = JsonUtil.toObject(retnJson, Map.class);
//				if(!paramMap.isEmpty() && ResultCode.R_SUCC.equals(db.getResultCode())){
//					Map<String, Object> map=new HashMap<String, Object>();
//					map=(Map<String, Object>)paramMap.get("result");
//					olIdRemark=map.get("olId")!=null?map.get("olId").toString():"";
//					olIdRemark="olId:"+olIdRemark;
//					ol_id=map.get("olId")!=null?map.get("olId").toString():"";
//					so_nbr=map.get("olNbr")!=null?map.get("olNbr").toString():"";
//				}
//			}else if(PortalServiceCode.INTF_SUBMIT_CHARGE.equals("biz-"+serviceCode)||PortalServiceCode.CHECK_RULE_TO_PROV.equals("biz-"+serviceCode)||PortalServiceCode.INTF_QUERY_CHARGE_LIST.equals("biz-"+serviceCode)){//收费建档接口，下省校验接口,费用项
//				Map<String, Object> map = new HashMap<String, Object>();
//				map = JsonUtil.toObject(paramJson, Map.class);
//				if(!map.isEmpty()){
//					olIdRemark="olId:"+map.get("olId");
//					ol_id=map.get("olId")!=null?map.get("olId").toString():"";
//					so_nbr=map.get("olNbr")!=null?map.get("olNbr").toString():"";
//				}
//			}
//			
			// 新增错误标识，0 成功  1  错误  2  异常
			String errorCode = "";
//			if(ResultCode.R_SUCC.equals(db.getResultCode()) || ResultCode.R_SUCCESS.equals(db.getResultCode()) || ResultCode.RES_SUCCESS.equals(db.getResultCode())){
//				errorCode = "0";
//			} else if (ResultCode.R_FAIL.equals(db.getResultCode()) || ResultCode.R_FAILURE.equals(db.getResultCode()) || ResultCode.R_QUERY_FAIL.equals(db.getResultCode())) {
//				errorCode = "1";
//			} else {
//				errorCode = "2";
//			} 
//			String write_asynchronous_flag = MySimulateData.getInstance().getParam(dbKeyWord,SysConstant.WRITE_ASYNCHRONOUS_FLAG);
//			if (SysConstant.ON.equals(write_asynchronous_flag)) {
				/*try{
					request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
				}catch (Exception e) {
					// TODO: handle exception
				}*/
				Map<String, Object> logObj = new HashMap<String, Object>();
//				String logId = UUID.randomUUID().toString();
//				logObj.put("LOG_ID", logId);
				logObj.put("SERVICE_CODE", serviceCode);
				logObj.put("PORTAL_CODE", db.getPortalCode() == null ? "" : db.getPortalCode());
				logObj.put("ROLE_CODE", db.getRoleCode() == null ? "" : db.getRoleCode());
				String serviceSerial = "SP"+DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS")+RandomStringUtils.randomNumeric(4);
				logObj.put("SERV_RUN_NBR", serviceSerial);
				HttpSession session = ServletUtils.getSession(request);
				String log_busi_run_nbr = (String)session.getAttribute(SysConstant.LOG_BUSI_RUN_NBR);
				logObj.put("BUSI_RUN_NBR", log_busi_run_nbr);
				Date beginDate = new Date(beginTime);
				Date endDate = new Date(endTime);
				String st = DateFormatUtils.format(beginDate, "yyyy/MM/dd HH:mm:ss");
				String et = DateFormatUtils.format(endDate, "yyyy/MM/dd HH:mm:ss");
				logObj.put("START_TIME", st);
				logObj.put("END_TIME", et);
				
				long useTime = endDate.getTime()-beginDate.getTime();
				if (useTime>1000000000){
					useTime = 1000000000;
				}
				logObj.put("USE_TIME", Long.toString(useTime));
				logObj.put("RESULT_CODE", db.getResultCode());
				logObj.put("TRANS_ID", MapUtils.getString(db.getParammap(), "transactionId", ""));
				logObj.put("AREA_ID", sessionStaff.getCurrentAreaId() == null ? "" : sessionStaff.getCurrentAreaId());
				
				if(request!=null){
					logObj.put("REMOTE_ADDR", request.getRemoteAddr());
					logObj.put("REMOTE_PORT", String.valueOf(request.getRemotePort()));
					logObj.put("LOCAL_ADDR", request.getLocalAddr());
					logObj.put("LOCAL_PORT", String.valueOf(request.getLocalPort()));
				}else{
					logObj.put("REMOTE_ADDR", "");
					logObj.put("REMOTE_PORT", "");
					logObj.put("LOCAL_ADDR", "");
					logObj.put("LOCAL_PORT", "");
				}
				logObj.put("INTF_URL", intfUrl);
				logObj.put("INTF_METHOD", serviceCode);
				logObj.put("STAFF_ID", sessionStaff.getStaffId() == null ? "" : sessionStaff.getStaffId());
				logObj.put("STAFF_NAME", sessionStaff.getStaffCode() == null ? "" : sessionStaff.getStaffCode());
				logObj.put("CHANNEL_NAME", sessionStaff.getCurrentChannelName() == null ? "" : sessionStaff.getCurrentChannelName());
				logObj.put("CHANNEL_ID", sessionStaff.getCurrentChannelId() == null ? "" : sessionStaff.getCurrentChannelId());
				logObj.put("REMARK", "");
				logObj.put("OL_ID", ol_id);
				logObj.put("SO_NBR", so_nbr);
				logObj.put("BUSI_TYPE", "");
				// 新增日志ID
				logObj.put("LOG_SEQ_ID", logSeqId);
				// 新增错误标识，0 成功  1  错误  2  异常
				logObj.put("ERROR_CODE", errorCode);
				Map<String, Object> logClobObj = new HashMap<String, Object>();
				logClobObj.put("IN_PARAM", paramString);						
				logClobObj.put("OUT_PARAM", rawRetn);
				log.error("身份证读卡日志记录，主表入参：={}", JSONObject.fromObject(logObj));
                log.error("身份证读卡日志记录，副表入参：={}", JSONObject.fromObject(logClobObj));
                logSender.sendLog2DB(SysConstant.PORTAL_SERVICE_LOG_Y, logObj, logClobObj);
                log.error("身份证读卡日志记录，PORTAL_SERVICE_LOG_Y表已记录日志(sendLog2DB)");
//		    }
			String writelogFlag = MySimulateData.getInstance().getParam(dbKeyWord,SysConstant.WRITE_LOG_FLAG);
			if (SysConstant.OFF.equals(writelogFlag)) {
				return;
			}
			String writeDetailFlag = MySimulateData.getInstance().getParam(dbKeyWord,SysConstant.WRITE_LOG_DETAIL);
			if (StringUtils.isEmpty(writeDetailFlag)) {
				writeDetailFlag = SysConstant.LOG_PS;
			}
			
			if (SysConstant.LOG_PS.equals(writeDetailFlag)) {
				Map<String, Object> logMap = new HashMap<String, Object>();
				
				logMap.put("intfMethod", serviceCode);
				logMap.put("logSeqId", logSeqId);
				logMap.put("errorCode", errorCode);
				logMap.put("intfUrl", intfUrl);
				logMap.put("beginDate", "" + beginTime);
				logMap.put("endDate", "" + endTime);
				logMap.put("remark", olIdRemark);
				logMap.put("inParam", paramString);						
				logMap.put("outParam", rawRetn);
				
				LogContainer.getInstance().addServiceLog(logMap, optFlowNum, sessionStaff);
				
			} else if (SysConstant.LOG_UNILOG.equals(writeDetailFlag)) {
				// UNILOG情况下，先记录一般日志到SP_SERVICE_RUN_LOG表，
				// 再把包含CLOB字段的内容发往日志服务器
				String logId = DateFormatUtils.format(new Date(), "yyMMddSSS") + RandomStringUtils.randomNumeric(9);
				
				Map<String, Object> logMap = new HashMap<String, Object>();
				logMap.put("logId", logId);
				logMap.put("intfMethod", serviceCode);
				logMap.put("intfUrl", intfUrl);
				logMap.put("beginDate", "" + beginTime);
				logMap.put("endDate", "" + endTime);
				logMap.put("remark", olIdRemark);
				logMap.put("inParam", null);
				logMap.put("outParam", null);
				LogContainer.getInstance().addServiceLog(logMap, optFlowNum, sessionStaff);
				
				
				logObj = new HashMap<String, Object>();
				logObj.put("logId", Long.parseLong(logId));
				logObj.put("staffNbr", sessionStaff.getStaffId() == null ? "" : sessionStaff.getStaffId());
				logObj.put("areaId", sessionStaff.getCurrentAreaId() == null ? "" : sessionStaff.getCurrentAreaId());
				logObj.put("channelId", sessionStaff.getCurrentChannelId() == null ? "" : sessionStaff.getCurrentChannelId());
				logObj.put("transactionId", MapUtils.getString(db.getParammap(), "transactionId", ""));
				logObj.put("apiName", serviceCode);
				logObj.put("beginTime", beginTime);
				logObj.put("endTime", endTime);
				logObj.put("usedTime", endTime < beginTime ? 0L : endTime - beginTime);//endTime小于beginTime则设置为0
//				String olId = MapUtils.getString(db.getParammap(), "olId", "");
//				String olNbr = MapUtils.getString(db.getParammap(), "olNbr", "");
//				String acctNbr = MapUtils.getString(db.getParammap(), "acctNbr", "");
//				if (MapUtils.isNotEmpty(db.getReturnlmap())) {
//					Object resultObj = db.getReturnlmap().get("result");
//					if (resultObj instanceof Map) {
//						if (StringUtils.isEmpty(olId)) {
//							olId = MapUtils.getString((Map<String, Object>) resultObj, "olId", "");
//						}
//						if (StringUtils.isEmpty(olNbr)) {
//							olNbr = MapUtils.getString((Map<String, Object>) resultObj, "olNbr", "");
//						}
//						if (StringUtils.isEmpty(acctNbr)) {
//							acctNbr = MapUtils.getString((Map<String, Object>) resultObj, "acctNbr", "");
//						}
//					}
//				}
//				logObj.put("olId", olId);
//				logObj.put("olNbr", olNbr);
//				logObj.put("acctNbr", acctNbr);
				logObj.put("inParam", paramString);						
				logObj.put("outParam", rawRetn);
				
				logSender.sendLog(SysConstant.LOG_TYPE, logObj);
				
			} else  if (SysConstant.LOG_NONE.equals(writeDetailFlag)) {
				Map<String, Object> logMap = new HashMap<String, Object>();
				logMap.put("logSeqId", logSeqId);
				logMap.put("errorCode", errorCode);
				logMap.put("intfMethod", serviceCode);
				logMap.put("intfUrl", intfUrl);
				logMap.put("beginDate", "" + beginTime);
				logMap.put("endDate", "" + endTime);
				logMap.put("inParam", null);
				logMap.put("outParam", null);
				LogContainer.getInstance().addServiceLog(logMap, optFlowNum, sessionStaff);
			}
			useTime = System.currentTimeMillis() - startTime;
			log.debug("addServiceLog use time : {} ms", useTime);
		} catch (Exception e) {
			log.error("门户处理身份证信息插入日志服务返回的数据异常", e);
			log.error("日志记录异常", e);
		}
	}
	
	public Map<String, Object> queryIfLteNewInstall(
			Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_IF_LTE_NEW_INSTALL, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的判断是否集团新装业务接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_LTE_NEW_INSTALL, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * 调后台接口下载拍照证件
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> downloadCustCertificate(Map<String, Object> param, SessionStaff sessionStaff) throws BusinessException{	
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = new DataBus();
		try{
			db = InterfaceClient.callService(param, PortalServiceCode.INTF_DOWNLOAD_IMAGE, null, sessionStaff);
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = (Map<String, Object>)db.getReturnlmap();
				ArrayList<HashMap<String, Object>> photographs = (ArrayList<HashMap<String, Object>>) resultMap.get("picturesInfo");
				for(int i = 0; i < photographs.size(); i++){
					HashMap<String, Object> photographsMap = photographs.get(i);
					photographsMap.remove("orderInfo");
					photographsMap.put("photograph", photographsMap.get("orderInfo").toString());
					photographs.add(i, photographsMap);
				}
				resultMap.put("photographs", photographs);
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.fileOperateService/downLoadPicturesFileFromFtp服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.DOWNLOAD_CUST_CERTIFICATE, param, db.getReturnlmap(), e);
		}
		return resultMap;
	}

	/**
	 * 订单提交校验客户身份证信息<br/>
	 * checkCustCertificateComprehensive方法针对经办人拍照进行客户证件相关的校验；checkCustCertificate方法保持改造前的校验逻辑
	 * @return true:校验成功; false:校验失败
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public boolean verifyCustCertificate(Map<String, Object> param, HttpServletRequest request, SessionStaff sessionStaff) throws Exception{
    	boolean resultFlag = false;
    	
    	Object sessionHandleCustFlag = ServletUtils.getSessionAttribute(request, SysConstant.TGJBRBTQX );
    	boolean isHandleCustNeeded = sessionHandleCustFlag == null ? true : (Boolean) sessionHandleCustFlag;//是否具有跳过经办人权限
		Object realNameFlag =  MDA.REAL_NAME_PHOTO_FLAG.get("REAL_NAME_PHOTO_"+sessionStaff.getCurrentAreaId().substring(0, 3));
    	boolean isRealNameFlagOn  = realNameFlag == null ? false : "ON".equals(realNameFlag.toString()) ? true : false;//实名制拍照开关是否打开
    	Object sessionActionFlagLimited = ServletUtils.getSessionAttribute(request, SysConstant.IS_ACTION_FLAG_LIMITED);
    	boolean isActionFlagLimited = sessionActionFlagLimited == null ? false : (Boolean) sessionActionFlagLimited;//是否限制经办人必填的业务类型
		
    	Map<String, Object> orderList = (Map<String, Object>) param.get("orderList");
        Map<String, Object> orderListInfo = (Map<String, Object>) orderList.get("orderListInfo");
        int actionFlag = MapUtils.getIntValue(orderListInfo, "actionFlag", 0);
        int busitypeflag = MapUtils.getIntValue(orderListInfo, "busitypeflag", 0);
        boolean isCheckCertificateComprehensive = (
    		(actionFlag == 1  && isActionFlagLimited) || //办套餐选号码入口做新装
			actionFlag == 14  || 						 //购手机入口做新装
			(actionFlag == 22 && busitypeflag == 21)  || //补卡(换卡busitypeflag是22)
			(actionFlag == 23 && busitypeflag == 13)  || //异地补换卡
			(actionFlag == 6  && isActionFlagLimited) || //主副卡成员变更:加装新号码,加装已有号码,且客户证件为非身份证
			(actionFlag == 2  && isActionFlagLimited) || //套餐变更:加装新号码,加装已有号码,且客户证件为非身份证
			actionFlag == 43  //返档
    	);
      
        /*if(isRealNameFlagOn && isHandleCustNeeded && isCheckCertificateComprehensive){
    		resultFlag = this.checkCustCertificateComprehensive(param, request);
    	} else{
    		resultFlag = this.checkCustCertificate(param, request);
    	}*/
        resultFlag = this.checkCustCertificate(param, request);//新建客户身份证读卡校验
    	
    	return resultFlag;
	}
	
	/**
	 * 新装，证件类型为身份证时，校验是否读卡
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	private boolean checkCustCertificate(Map<String, Object> param, HttpServletRequest request) throws Exception{
        Map<String, Object> orderList = (Map<String, Object>) param.get("orderList");
        Map<String, Object> orderListInfo = (Map<String, Object>) orderList.get("orderListInfo");
        String actionFlag = MapUtils.getString(orderListInfo, "actionFlag");
        if ("1".equals(actionFlag)) { //新装
            List<Map<String, Object>> custOrderList = (List<Map<String, Object>>) orderList.get("custOrderList");
            for (Map<String, Object> custOrder : custOrderList) {
                List<Map<String, Object>> busiOrderList = (List<Map<String, Object>>) custOrder.get("busiOrder");
                for (Map<String, Object> busiOrder : busiOrderList) {
                    Map<String, Object> boActionType = (Map<String, Object>) busiOrder.get("boActionType");
                    String boActionTypeCd = (String) boActionType.get("boActionTypeCd");
                    if ("C1".equalsIgnoreCase(boActionTypeCd)) { //新建客户
                        Map<String, Object> data = (Map<String, Object>) busiOrder.get("data");
                        Map<String, Object> identities = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustIdentities")).get(0);
                        String identidiesTypeCd = MapUtils.getString(identities, "identidiesTypeCd");
                        if ("1".equals(identidiesTypeCd)) { //身份证
                        	Map<String, Object> custInfo = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustInfos")).get(0);
                        	Object s_sig = null;
                        	if(!"Y".equals(MapUtils.getString(custInfo, "jbrFlag"))){//若该C1动作节点是新建经办人
                            	s_sig = ServletUtils.getSessionAttribute(request, Const.SESSION_SIGNATURE);
                        	} else{
                        		continue;
                        	}
	                        if(null == s_sig){
	                            return false;
	                        }
	                        String token = s_sig.toString();
                            if (StringUtils.isNotBlank(token) && token.trim().length() > Const.RANDOM_STRING_LENGTH) {
                                String partyName = MapUtils.getString(custInfo, "name");
                                String certNumber = MapUtils.getString(identities, "identityNum");
                                String certAddress = MapUtils.getString(custInfo, "addressStr");
                                String identityPic = MapUtils.getString(identities, "identidiesPic");
                                String appSecret = propertiesUtils.getMessage("APP_SECRET"); //appId对应的加密密钥
                                String nonce = StringUtils.substring(token, 0, Const.RANDOM_STRING_LENGTH);
                                String signature = commonBmo.signature(partyName, certNumber, certAddress, identityPic, nonce, appSecret);
                                if (token.trim().equals(signature)) {
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
	}
	
	/**
	 * 所有业务，证件类型为身份证时，校验是否读卡(例如新建客户、新建使用人、新建经办人等)
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	private boolean checkCustCertificateComprehensive (Map<String, Object> param, HttpServletRequest request) throws Exception{
        Map<String, Object> orderList = (Map<String, Object>) param.get("orderList");
        Map<String, Object> orderListInfo = (Map<String, Object>) orderList.get("orderListInfo");
        List<Map<String, Object>> custOrderList = (List<Map<String, Object>>) orderList.get("custOrderList");
        List<Map<String, String>> custOrderAttrs = (List<Map<String, String>>) orderListInfo.get("custOrderAttrs");
        String virOlId = null;//订单提交报文中的virOlId
        boolean isSuccessed = false;
        int C1Count = 0;//所有C1动作、且证件类型为身份证的节点数
        int successCount = 0;//所有C1动作、证件类型为身份证、且身份证校验成功数
        
        //循环找出每次订单提交的virOlId
        for (Map<String, String> custOrderAttr : custOrderAttrs) {
        	if("810000000".equals(custOrderAttr.get("itemSpecId").toString())){
        		virOlId = custOrderAttr.get("value");
        	}
        }

        //先判断经办人证件、拍照是否上传成功，再进行身份证读卡信息校验
        Map<String, Object> sessionVirOlId = (Map<String, Object>) ServletUtils.getSessionAttribute(request, Const.SESSION_UPLOAD_VIR_OLID);
        if(sessionVirOlId != null){
        	 Object sessionKey = sessionVirOlId.get(virOlId + "upload");
             boolean isHandleCustCertificateUpload = sessionKey == null ? false : (Boolean) sessionKey;
             if(!isHandleCustCertificateUpload){
             	return false;
             }
        } else{
        	return false;
        }

        for (Map<String, Object> custOrder : custOrderList) {
            List<Map<String, Object>> busiOrderList = (List<Map<String, Object>>) custOrder.get("busiOrder");
            for (Map<String, Object> busiOrder : busiOrderList) {
                Map<String, Object> boActionType = (Map<String, Object>) busiOrder.get("boActionType");
                String boActionTypeCd = (String) boActionType.get("boActionTypeCd");
                if ("C1".equalsIgnoreCase(boActionTypeCd)) { //新建客户
                    Map<String, Object> data = (Map<String, Object>) busiOrder.get("data");
                    Map<String, Object> identities = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustIdentities")).get(0);
                    String identidiesTypeCd = MapUtils.getString(identities, "identidiesTypeCd");
                    if ("1".equals(identidiesTypeCd) ) { //身份证
                    	C1Count++;//使用身份证新建客户+1
                    	Map<String, Object> custInfo = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustInfos")).get(0);
                    	Object s_sig =  null;
                    	if("Y".equals(MapUtils.getString(custInfo, "jbrFlag"))){//若该C1动作节点是新建经办人
                    		s_sig =  ServletUtils.getSessionAttribute(request, Const.SESSION_SIGNATURE_HANDLE_CUST);
                    	} else if("Y".equals(MapUtils.getString(custInfo, "userCustFlag"))){//若该C1动作节点是新建使用人
                    		//暂时不校验使用人，万一来个一拖八，每个使用人都是不同的身份证...
                    	}else{//辣么该C1动作节点肯定是新建客户
                    		s_sig =  ServletUtils.getSessionAttribute(request, Const.SESSION_SIGNATURE);
                    	}
                        if(null == s_sig){
                            return false;
                        }
                        String token = s_sig.toString();
                        if ((StringUtils.isNotBlank(token) && token.trim().length() > Const.RANDOM_STRING_LENGTH)) {
                            String partyName = MapUtils.getString(custInfo, "name");
                            String certNumber = MapUtils.getString(identities, "identityNum");
                            String certAddress = MapUtils.getString(custInfo, "addressStr");
                            String identityPic = MapUtils.getString(identities, "identidiesPic");
                            String appSecret = propertiesUtils.getMessage("APP_SECRET"); //appId对应的加密密钥
                            String nonce = StringUtils.substring(token, 0, Const.RANDOM_STRING_LENGTH);
                            String signature = commonBmo.signature(partyName, certNumber, certAddress, identityPic, nonce, appSecret);
                            if (token.trim().equals(signature)) {
                            	successCount++;
                            }
                        } else {
                            return false;
                        }
                    }
                }
            }
        }
        
        //循环遍历完所有busiOrder下的C1动作节点，校验C1Count是否与successCount相等，否则即为校验失败
        if(C1Count == successCount){
        	isSuccessed = true;
        }
        
        return isSuccessed; 
	}
	
	/**
	 * 与翼支付消费金融平台--高级实名认证
	 * @param paramMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> highRealNameAuthenticate(
			Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.HIGH_REAL_NAME_AUTHENTICATE, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的高级实名认证接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.HIGH_REAL_NAME_AUTHENTICATE, paramMap, resultMap, e);
		}
		return resultMap;
	}
	/**
	 * 与翼支付消费金融平台--撤销鉴权
	 * @param paramMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> revokeAuthentication(
			Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.REVOKE_AUTHENTICATION, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的撤销鉴权接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.REVOKE_AUTHENTICATION, paramMap, resultMap, e);
		}
		return resultMap;
	}

	/**
	 * 橙分期业务标识
	 * @param paramMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryAgreementType(Map<String, Object> paramMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_AGREEMENTTYPE, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
				resultMap.put("resultCode", ResultCode.R_SUCC);
			} else {
				resultMap.put("resultCode", ResultCode.R_FAILURE);
				resultMap.put("resultMsg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的橙分期业务标识查询接口服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_AGREEMENTTYPE, paramMap, resultMap, e);
		}
		return resultMap;
	}
}

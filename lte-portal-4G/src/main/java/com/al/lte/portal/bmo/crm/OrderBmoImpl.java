package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.security.PublicKey;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.codec.binary.Base64;
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
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.DigestUtils;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.RSAUtil;
import com.al.ecs.common.util.UIDGenerator;
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
import com.al.lte.portal.model.Photograph;
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
	
	public Map<String, Object> cltOrderSubmit(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.CLT_ORDER_SUBMIT, optFlowNum, sessionStaff);
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
			log.error("门户处理营业后台的"+PortalServiceCode.CLT_ORDER_SUBMIT+"服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CLTORDER_SUBMIT, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> cltOrderCommit(Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.CLT_ORDER_COMMIT, optFlowNum, sessionStaff);
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
			throw new BusinessException(ErrorCode.CLTORDER_COMMIT, paramMap, resultMap, e);
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
				PortalServiceCode.PAY_TOKEN, null, sessionStaff);
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
	public Map<String, Object> downloadCustCertificate(Map<String, Object> param, SessionStaff sessionStaff, boolean isIE8) throws Exception{	
		Map<String, Object> resultMap = new HashMap<String, Object>();
		String olId = MapUtils.getString(param, "olId");
		String srcFlag = MapUtils.getString(param, "srcFlag");
		Photograph photograph = Photograph.getNewInstance();
		
		if(StringUtils.isBlank(olId) || StringUtils.isBlank(srcFlag)){
			resultMap.put("code",  ResultCode.R_FAIL);
			resultMap.put("msg", "无效入参，请输入正确查询参数。");
			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, param, resultMap, null);
		}
		
		param.put(SysConstant.STAFF_ID, sessionStaff.getStaffId());
		param.put(SysConstant.AREA_ID, MapUtils.getString(param, SysConstant.AREA_ID, sessionStaff.getCurrentAreaId()));
		
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.INTF_DOWNLOAD_IMAGE, null, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				boolean isHanleCustCertImage = false;
				boolean isHanleCustPhotograph = false;
				resultMap = (Map<String, Object>)db.getReturnlmap().get("result");
				ArrayList<HashMap<String, Object>> photographs = (ArrayList<HashMap<String, Object>>) resultMap.get("picturesInfo");
				for(int i = 0; i < photographs.size(); i++){
					HashMap<String, Object> photographsMap = photographs.get(i);
					if("D".equals(MapUtils.getString(photographsMap, "picFlag", ""))){
						isHanleCustPhotograph = true;
						if(isIE8){
							photograph.setPhotograph(MapUtils.getString(photographsMap, "orderInfo"));
							photographsMap.put("photograph", photograph.imageResize());
						} else{
							photographsMap.put("photograph", MapUtils.getString(photographsMap,"orderInfo"));
						}
					} else if("C".equals(MapUtils.getString(photographsMap, "picFlag", ""))){
						isHanleCustCertImage = true;
						photographsMap.put("photograph", MapUtils.getString(photographsMap,"orderInfo"));
					}
					photographsMap.remove("orderInfo");
				}
				if(!isHanleCustCertImage){
					HashMap<String, Object> certImage = new HashMap<String,Object>();
					certImage.put("picFlag", "noC");
					photographs.add(certImage);
				}
				if(!isHanleCustPhotograph){
					HashMap<String, Object> photo = new HashMap<String,Object>();
					photo.put("picFlag", "noD");
					photographs.add(photo);
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
        
        //循环找出每次订单提交的virOlId
        List<Map<String, Object>> custOrderAttrs = (List<Map<String, Object>>) orderListInfo.get("custOrderAttrs");
        if(custOrderAttrs != null){
        	for (Map<String, Object> custOrderAttr : custOrderAttrs) {
            	if("810000000".equals(MapUtils.getString(custOrderAttr, "itemSpecId", ""))){
            		//既然有该属性，说明已经拍照，则必然存在handleCustId
            		if("".equals(MapUtils.getString(orderListInfo, "handleCustId", ""))){
            			return false;
            		}
            	}
            }
        	String faceVerifyFlag= "";
        	Map<String, Object> fzConfig = (HashMap<String, Object>) MDA.FACE_VERIFY_FLAG
    				.get("FACE_VERIFY_" + sessionStaff.getCurrentAreaId().substring(0, 3));
        	String fz = MapUtils.getString(fzConfig, "FZ", "0");
        	for (Map<String, Object> custOrderAttr : custOrderAttrs) {
	        	if("40010049".equals(MapUtils.getString(custOrderAttr, "itemSpecId", ""))){
	        		try{
	        			if (!custOrderAttr.get("value").equals(ServletUtils.getSessionAttribute(request, Const.SESSION_CONFIDENCES))) {
							   return false;
		        		}
	        			String temp = (String)custOrderAttr.get("value");
		        		if (temp.compareTo(fz) > 0) {
			        		faceVerifyFlag ="Y";
						} else {
							faceVerifyFlag = "N";
						}
		        		if(!faceVerifyFlag.equals(ServletUtils.getSessionAttribute(request,Const.SESSION_FACEVERIFYFLAG))){
	        				return false;
	        			}	
                    }catch(Exception e){}
	        	}
	        	
	        	if("40010050".equals(MapUtils.getString(custOrderAttr, "itemSpecId", ""))){
	        		try{
		        		if(!custOrderAttr.get("value").equals(ServletUtils.getSessionAttribute(request,Const.SESSION_FACEVERIFYFLAG))){
	        				return false;
	        			}
	        		}catch(Exception e){}
	        	}
        	}
        	//#2164871 门户新版本，订单提交提示信息被篡改，订单提交时候返回修改session被清掉会报错，不清除session
//        	ServletUtils.removeSessionAttribute(request, Const.SESSION_CONFIDENCES);
//        	ServletUtils.removeSessionAttribute(request, Const.SESSION_FACEVERIFYFLAG);
        	
//        	for (Map<String, Object> custOrderAttr : custOrderAttrs) {
//	        	if("40010049".equals(MapUtils.getString(custOrderAttr, "itemSpecId", ""))){
//	        		try{
//	        			if (new  BigDecimal((Double)custOrderAttr.get("value")).compareTo(new  BigDecimal((Double)ServletUtils.getSessionAttribute(request, Const.SESSION_CONFIDENCES))) !=0) {
//							   return false;
//		        		}
//	        		}catch(Exception e){}
//	        		
//	        	}
//        	}
        }
      
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
							// 临时处理,不对责任人身份证读卡校验
							if("Y".equals(MapUtils.getString(custInfo, "ignore"))){
								continue;
							}
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
        List<Map<String, Object>> custOrderAttrs = (List<Map<String, Object>>) orderListInfo.get("custOrderAttrs");
        String virOlId = null;//订单提交报文中的virOlId
        boolean isSuccessed = false;
        int C1Count = 0;//所有C1动作、且证件类型为身份证的节点数
        int successCount = 0;//所有C1动作、证件类型为身份证、且身份证校验成功数
        
        //循环找出每次订单提交的virOlId
        if(custOrderAttrs != null){
        	for (Map<String, Object> custOrderAttr : custOrderAttrs) {
            	if("810000000".equals(MapUtils.getString(custOrderAttr, "itemSpecId", ""))){
            		virOlId = MapUtils.getString(custOrderAttr, "value", "noVirOlIdFound");
            	}
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
						// 临时处理,不对责任人身份证读卡校验
						if("Y".equals(MapUtils.getString(custInfo, "ignore"))){
							C1Count--;
						}
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
	public Map<String, Object> orderLog(Map<String, Object> paramMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		  String resultCode= "";
		  String resultMsg ="";
		try{
			String dbKeyWord = sessionStaff == null ? null : sessionStaff.getDbKeyWord();
		  
			DataBus db = new DataBus();
			db = ServiceClient.initDataBus(sessionStaff);
			db.setResultCode(ResultCode.R_SUCC);
			db.setParammap(paramMap);
			long beginTime = System.currentTimeMillis();
			String logSeqId = "";
			String paramString=JsonUtil.toString(paramMap);
			if (sessionStaff != null) {
				InterfaceClient.callServiceLog(logSeqId, dbKeyWord, db, optFlowNum,"portalOrderLog","portalOrderLog", sessionStaff,paramString, paramString, beginTime, beginTime,"",optFlowNum, "portal");
			}
			resultCode= ResultCode.R_SUCC;
			resultMsg= db.getResultMsg();
		}catch(Exception e){
			resultCode= ResultCode.R_FAILURE;
			resultMsg= "订单信息插入失败!"+e;
			log.error("订单信息插入日志服务异常", e);
			
		}	
		resultMap.put("resultCode", resultCode);
		resultMap.put("resultMsg", resultMsg);
		return resultMap;
	}

	@Override
    @SuppressWarnings("unchecked")
	public Map<String, Object> cltOrderCheck(Map<String, Object> param, HttpServletRequest request,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		String resultCode = ResultCode.R_FAIL;
		String resultMsg = "实名信息采集单受理信息校验失败，信息被篡改或不存在，请按正常流程重新受理！";
		resultMap.put("resultCode", resultCode);
		
		/**
		 * 采集单信息
		 */
		Map<String, Object> cltOrderInfo = (Map<String, Object>) request.getSession().getAttribute(SysConstant.CLT_ORDER_INFO);
		Map<String, Object> collectionOrderList = (Map<String, Object>) cltOrderInfo.get("collectionOrderList");
        Map<String, Object> collectionOrderInfo = (Map<String, Object>) collectionOrderList.get("collectionOrderInfo");	
		String orderId = collectionOrderInfo.get("orderId")+"";//采集单号
		ArrayList<Map<String, Object>> custInfos = (ArrayList<Map<String, Object>>) collectionOrderList.get("collectionCustInfos");
		ArrayList<Map<String, Object>> userListInfos = new ArrayList<Map<String, Object>>();
		String cltVirolId = "";//经办人拍照上传虚拟购物车ID
		for(Map<String, Object> custInfo:custInfos){
			String partyRoleCd = MapUtils.getString(custInfo,"partyRoleCd");
			if(!StringUtils.isEmpty(partyRoleCd)){
				//0为产权人
				if("0".equals(partyRoleCd)){

				//3为经办人
				}else if("3".equals(partyRoleCd)){
					cltVirolId = (String) custInfo.get("fileOrderId");
				}else{
					userListInfos.add(custInfo);//使用人列表信息
				}
			}
		}
        
        /**
         * 订单提交信息
         */
		Map<String, Object> orderList = (Map<String, Object>) param.get("orderList");
		List<Map<String, Object>> custOrderList = (List<Map<String, Object>>) orderList.get("custOrderList");
        Map<String, Object> orderListInfo = (Map<String, Object>) orderList.get("orderListInfo");
        
        /**
         * 1、校验有效期，操作有效期的不能提交
         */
		String expDateStr = (String) collectionOrderInfo.get("expDate");
    	Date expDate = DateUtil.getDateFromString(expDateStr,"yy-MM-dd HH:mm:ss");
    	if(new Date().after(expDate)){
			resultMsg += "校验失败原因：该采集单已经超出有效期，不能继续受理业务。";
			resultMap.put("resultMsg", resultMsg);
			return resultMap;
		}
    	
    	/**
    	 *	2、校验采集单号 订单属性 以及经办人实名制拍照属性（不同于普通受理属性ID）
    	 */    	
        List<Map<String, Object>> custOrderAttrs = (List<Map<String, Object>>) orderListInfo.get("custOrderAttrs");
        Object realNameFlag =  MDA.REAL_NAME_PHOTO_FLAG.get("REAL_NAME_PHOTO_"+sessionStaff.getCurrentAreaId().substring(0, 3));
    	boolean isRealNameFlagOn  = realNameFlag == null ? false : "ON".equals(realNameFlag.toString()) ? true : false;//实名制拍照开关是否打开
    	boolean hasCltOrderIdItem = false;
    	boolean hasCltVirolIdItem = false;
    	for(Map<String, Object> custOrderAttr:custOrderAttrs){
    		String itemSpecId = (String)custOrderAttr.get("itemSpecId");
    		if(SysConstant.CLTORDERID.equals(itemSpecId)){
    			String itemValue = custOrderAttr.get("value")+"";
    			if(StringUtils.isEmpty(orderId)||StringUtils.isEmpty(itemValue)||!orderId.equals(itemValue)){
    				resultMsg += "校验失败原因： 该订单采集客户订单号订单属性不存在或与受理采集单不同，请确认后重试。";
					resultMap.put("resultMsg", resultMsg);
					return resultMap;
    			}
    			hasCltOrderIdItem = true;
    		}
    		if(SysConstant.CLTVIROLID.equals(itemSpecId)){
    			String itemValue = (String)custOrderAttr.get("value");
    			//属性ID存在必为Session采集单ID
    			if(StringUtils.isEmpty(itemValue)||StringUtils.isEmpty(cltVirolId)||!cltVirolId.equals(itemValue)){
    				resultMsg += "校验失败原因： 该订单采集单经办人拍照订单ID订单属性不存在或与受理采集单不同，请确认后重试。";
					resultMap.put("resultMsg", resultMsg);
					return resultMap;
    			}
    			hasCltVirolIdItem = true;
    		}
    	}
    	//经办人开关开了，必传属性ID
        if(isRealNameFlagOn&&!hasCltVirolIdItem){
			resultMsg += "校验失败原因： 该订单采集单经办人拍照订单ID订单属性不存在，请确认后重试。";
			resultMap.put("resultMsg", resultMsg);
			return resultMap;
        } 
        
    	//必传采集单号属性ID
        if(!hasCltOrderIdItem){
			resultMsg += "校验失败原因： 该订单采集客户订单号订单属性不存在，请确认后重试。";
			resultMap.put("resultMsg", resultMsg);
			return resultMap;
        } 

    	/**
    	 *	3、使用人信息属性ID结点存在，且校验可新装数目是否大于最大值
    	 *	4、新装结点校验发展人是否为采集单受理人员
    	 */ 
		for (Map<String, Object> custOrder : custOrderList) {
			List<Map<String, Object>> busiOrderList = (List<Map<String, Object>>) custOrder.get("busiOrder");
			for (int i = 0; i < busiOrderList.size(); i++) {
				Map<String, Object> busiOrder = busiOrderList.get(i);
				HashMap<String, Object> boActionType = (HashMap<String, Object>) busiOrder.get("boActionType");
				// 遍历新装结点
				if ("1".equalsIgnoreCase(MapUtils.getString(boActionType, "boActionTypeCd", ""))) {
					boolean hasCltUserIdItem = false;
					boolean hasDealerItem = false;
					Map<String, Object> data = (Map<String, Object>) busiOrder.get("data");
					List<Map<String, Object>> busiOrderAttrs = (List<Map<String, Object>>) data.get("busiOrderAttrs");
					for(Map<String, Object> busiOrderAttr:busiOrderAttrs){
						String itemSpecId = (String)busiOrderAttr.get("itemSpecId");
						if(SysConstant.CLTUSERID.equals(itemSpecId)){
			    			String itemValue = (String)busiOrderAttr.get("value");
							boolean inCltUserList = false;
			    			for(Map<String, Object> userListInfo:userListInfos){
			    				String collectionItemId = userListInfo.get("collectionItemId")+"";
			    				if(!StringUtils.isEmpty(collectionItemId)&&collectionItemId.equals(itemValue)){
			    					//本次订单新装数目
			    					Integer orderUseNum = (Integer) userListInfo.get("orderUseNum");
			    					if(orderUseNum != null){
			    						userListInfo.put("orderUseNum",orderUseNum+1);
			    					}else{
			    						userListInfo.put("orderUseNum",1);
			    					}
			    					inCltUserList = true;
			    				}
			    			}
			    			//使用人信息属性值在缓存使用人列表中不存在
			    			if(!inCltUserList){
			    				resultMsg += "校验失败原因：新装结点使用人信息产品属性值不在采集单使用人列表中。";
								resultMap.put("resultMsg", resultMsg);
								return resultMap;
			    			}
							hasCltUserIdItem = true;
						}else if(SysConstant.DEALER.equals(itemSpecId)){
			    			String itemValue = (String)busiOrderAttr.get("value");
			    			String staffId = collectionOrderInfo.get("staffId")+"";
			    			if(StringUtils.isEmpty(itemValue)||!staffId.equals(itemValue)){
								resultMsg += "校验失败原因：新装结点发展人信息产品属性不存在，或发展人不为采集单受理人员，请确认发展人后重试。";
								resultMap.put("resultMsg", resultMsg);
								return resultMap;
			    			}
							hasDealerItem = true;
						}
					}
					//使用人信息属性属性ID不存在
					if(!hasCltUserIdItem){
						resultMsg += "校验失败原因：新装结点使用人信息产品属性不存在。";
						resultMap.put("resultMsg", resultMsg);
						return resultMap;
					}
					
					//使用人信息属性属性ID不存在
					if(!hasDealerItem){
						resultMsg += "校验失败原因：新装结点发展人信息产品属性不存在。";
						resultMap.put("resultMsg", resultMsg);
						return resultMap;
					}
				}
			}
			//校验新装数目是否大于最大值
			for(Map<String, Object> userListInfo:userListInfos){
				//本次订单新装数目
				Integer orderUseNum = (Integer) userListInfo.get("orderUseNum");
				if(orderUseNum==null){
					orderUseNum= 0;
				}
				Integer maxQuantity = (Integer) userListInfo.get("maxQuantity");
				Integer realQuantity = (Integer) userListInfo.get("realQuantity");
				if(maxQuantity<orderUseNum+realQuantity){
					resultMsg += "校验失败原因：使用人"+userListInfo.get("custName")+"办理好卡数目大于期望办理号卡数值。";
					resultMap.put("resultMsg", resultMsg);
					return resultMap;
				}
			}
		}
		//校验通过
		resultMap.put("resultCode", ResultCode.R_SUCC);
		return resultMap;
	}
	
	public Map<String, Object> qryPreliminaryInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QRY_PRELININARY_INFO, optFlowNum, sessionStaff);
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
			log.error("获取初审信息接口qryPreliminaryInfo服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QRY_PRELININARY_INFO, dataBusMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * 实名审核记录接口
	 * @param params <br/>olId和checkType必传，否则抛BusinessException；<br>areaId和staffId若为空，则以session替代；<br>srcFlag若为空，则以"REAL"替代
	 * @param sessionStaff
	 * @return
	 * @throws InterfaceException
	 * @throws IOException
	 * @throws BusinessException
	 * @throws Exception
	 */
	public Map<String, Object> savePhotographReviewRecord(Map<String, Object> params, SessionStaff sessionStaff) throws InterfaceException, IOException, BusinessException, Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		
		String olId = MapUtils.getString(params, "olId", "");
		String checkType = MapUtils.getString(params, "checkType", "");
		
		if(StringUtils.isBlank(olId) || StringUtils.isBlank(checkType)){
			returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
			returnMap.put(SysConstant.RESULT_MSG, "无效的入参olId、checkType。");
			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, params, returnMap, null);
		}
		
		params.put("srcFlag", MapUtils.getString(params, "srcFlag", "REAL"));
		params.put(SysConstant.STAFF_ID, MapUtils.getString(params, SysConstant.STAFF_ID, sessionStaff.getStaffId()));
		params.put(SysConstant.AREA_ID, MapUtils.getString(params, SysConstant.AREA_ID, sessionStaff.getCurrentAreaId()));
		
		DataBus db = InterfaceClient.callService(params, PortalServiceCode.SAVE_PHOTOGRAPH_REVIEW_RECORD, null, sessionStaff);
		try {
			String resultCode = StringUtils.defaultString(db.getResultCode(), "1");
			if (ResultCode.R_SUCC.equals(resultCode)) {
				returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_SUCC);
			} else {
				returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
			}
			//resultCode为0或1时，都从resultMsg获取信息
			returnMap.put(SysConstant.RESULT_MSG, db.getResultMsg());
		} catch (Exception e) {
			log.error("门户处理后台的的service/intf.fileOperateService/saveRealCheckRecord服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.SAVE_PHOTOGRAPH_REVIEW_RECORD, params, db.getReturnlmap(), e);
		}
		
		return returnMap;
	}
	public Map<String, Object> queryPayOrderStatus(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> paramMap2 = new HashMap<String, Object>();
		String reqPlatForm = SysConstant.CSB_SRC_SYS_ID_LTE;
		String provinceCode="";
		String cityCode = "";
		cityCode = sessionStaff.getCurrentAreaId();
		if(StringUtils.isNotBlank(cityCode)){
			provinceCode=cityCode.substring(0,3)+"0000";
		}
		String olId = paramMap.get("olId") + "";//业务订单号
		String reqPayType = MapUtils.getString(paramMap, "reqPayType","1");//支付
		String reqNo = "";
		String paramStr = "reqPlatForm="+reqPlatForm+"&provinceCode=" + provinceCode + "&olId=" + olId+"&reqNo=" + reqNo+"&reqPayType="+reqPayType;
		String sign = AESUtils.encryptToString(paramStr, MDA.PAY_AES_KEY);
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
	public Map<String, Object> queryPayToken(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> paramMap2 = new HashMap<String, Object>();
		//Random rand = new Random();
		//int k = rand.nextInt(89999)+10000;//支付流水随机码
		String reqPlatForm=SysConstant.CSB_SRC_SYS_ID_LTE; 
		String provinceCode="";
		String cityCode = sessionStaff.getCurrentAreaId();
		if(StringUtils.isNotBlank(cityCode)){
			provinceCode=cityCode.substring(0,3)+"0000";
		}
		String channelId=sessionStaff.getCurrentChannelId();
		//String reqNo = paramMap.get("olId") + ""+k;//业务流水号
		String reqNo = reqPlatForm+UIDGenerator.getReqNo();
		String detail = MapUtils.getString(paramMap, "actionTypeName","电信业务受理");
		String customerId = "";
		String customerName="";
		String olId = paramMap.get("olId") + "";
		String olNbr = paramMap.get("soNbr")+ "";
		String staffCode = sessionStaff.getStaffCode();
		if(paramMap.get("chargeCheck")!=null){
			String chargeCheck=paramMap.get("chargeCheck")+"";
			paramMap2.put("chargeCheck", chargeCheck);//代理商保证金校验结果，0展示现金，其他不展示
		}
		paramMap2.put("olId",  olId);//购物车id
		paramMap2.put("olNbr",  olNbr);//购物车流水
		paramMap2.put("reqNo", reqNo);//传给支付平台的业务流水号要保证不同
		String payAmount = paramMap.get("charge")+""; 
		String busiUpType= "0".equals(paramMap.get("busiUpType")+"")? "1":paramMap.get("busiUpType")+"";//业务类型
		//if ("4".equals(busiUpType)) {
		//	paramMap2.put("accNbr", MapUtils.getString(paramMap, "accNbr"));
		//}
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> chargeItems2 = (List<Map<String, Object>>) paramMap.get("chargeItems");
		JSONArray chargeItems = JSONArray.fromObject(chargeItems2);
		if(paramMap.get("chargeItems")!=null && chargeItems2.size()>0){
			paramMap2.put("chargeItems", chargeItems);
		}
		paramMap2.put("provinceCode", provinceCode);
		
		paramMap2.put("frontUrl", paramMap.get("frontUrl"));
		paramMap2.put("cityCode", cityCode);
		paramMap2.put("channelId", channelId);
		paramMap2.put("payAmount", payAmount);// 金额，单位分
		paramMap2.put("olNumber", staffCode);// 工号
		paramMap2.put("customerId", customerId);// 
		paramMap2.put("customerName", customerName);
		paramMap2.put("detail", detail);// 详情描述
		paramMap2.put("busiUpType", busiUpType);// 业务类型：
		String paramStr = "provinceCode=" + provinceCode + "&cityCode=" + cityCode + "&channelId=" + channelId + 
				"&reqNo=" + reqNo + "&payAmount=" + payAmount +"&detail="+detail+"&olId="+olId+"&olNumber="+staffCode+"&busiUpType="+busiUpType;
		String sign = AESUtils.encryptToString(paramStr, MDA.PAY_AES_KEY); 
		paramMap2.put("sign", sign);
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("reqPlatForm", reqPlatForm);//请求平台
		dataBusMap.put("params", paramMap2);
		Map<String, Object> dataBusMap2 = new HashMap<String, Object>();
		dataBusMap2.put("proot", dataBusMap);
		DataBus db = InterfaceClient.callService(dataBusMap2,
				PortalServiceCode.PAY_TOKEN, null, sessionStaff);
		db.getReturnlmap().put("reqNo", reqNo);
		return db.getReturnlmap();
	}
	/**
	 * 支付平台退款接口
	 */
	
	public Map<String, Object> payRefundOrder(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> paramMap2 = new HashMap<String, Object>();
		String reqPlatForm= SysConstant.CSB_SRC_SYS_ID_LTE;
		String provinceCode="";
		String cityCode = sessionStaff.getCurrentAreaId();
		if(StringUtils.isNotBlank(cityCode)){
			provinceCode=cityCode.substring(0,3)+"0000";
		}
		//省份秘钥
	    String signKey = propertiesUtils.getMessage("PRO_PAY_KEY_"+provinceCode);
	    String timeStamp = String.valueOf(DateUtil.dateToLong(new Date()));
		String olId = MapUtils.getString(paramMap, "olId");//业务订单号
		String remark = MapUtils.getString(paramMap, "remark","电信营业退款"); // 退款原因
		//Random rand = new Random();
		//int k = rand.nextInt(89999)+10000;//退款流水随机码
		//String newNbr=olId+k;
		String payAmount = MapUtils.getString(paramMap, "payAmount");; //退款金额
		
		String reqNo= MapUtils.getString(paramMap, "reqNo");  
		if(StringUtils.isBlank(reqNo)){
			reqNo= reqPlatForm+UIDGenerator.getReqNo();
		}
		paramMap2.put("reqNo", reqNo);
		
		paramMap2.put("oldId", olId);
		
		if(StringUtils.isNotBlank(paramMap.get("newId")+"") && !"null".equals(paramMap.get("newId")+"")){
			paramMap2.put("newNbr", paramMap.get("newId")+"");
		}
		
		paramMap2.put("records", JsonUtil.toObject((String)paramMap.get("order"), List.class) );
		
		String paramStr = "reqPlatForm="+reqPlatForm+"&provinceCode=" + provinceCode + "&oldId=" + olId+"&newId="+paramMap2.get("newNbr")+ "&reqNo="+reqNo+"&timeStamp="+timeStamp;
		String sign = AESUtils.encryptToString(paramStr, signKey);
		paramMap2.put("provinceCode", provinceCode);
		paramMap2.put("reqPlatForm", reqPlatForm);
		//paramMap2.put("oldNbr", olId);
		paramMap2.put("payAmount", payAmount);
		//paramMap2.put("newNbr", newNbr);
		
		paramMap2.put("timeStamp", timeStamp);
		paramMap2.put("remark", remark);
		paramMap2.put("sign", sign);
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		Map<String, Object> dataBusMap2 = new HashMap<String, Object>();
		dataBusMap.put("params", paramMap2);
		//省份编码rsa加密
		String gKey = MDA.PAY_RSA_KEY;
		PublicKey publicKey = RSAUtil.restorePublicKey(RSAUtil.hex2byte(gKey));
		byte[] encodedText = RSAUtil.RSAEncode(publicKey, provinceCode.getBytes());
        String proKey = Base64.encodeBase64String(encodedText);
        dataBusMap.put("proKey", proKey);//用RSA对省份编码进行加密
		dataBusMap2.put("proot", dataBusMap);
		
		DataBus db = InterfaceClient.callService(dataBusMap2,
				PortalServiceCode.PAY_REFUND, null, sessionStaff);
		if (db.getReturnlmap() != null && ResultCode.R_SUCCESS.equals(db.getReturnlmap().get("respCode"))) {
//			try{
//				Map<String,Object> param = new HashMap<String,Object>();
//				Map<String,Object> orderPaymentRecord = new HashMap<String,Object>();
//				orderPaymentRecord.put("paymentTransId", reqNo);
//				orderPaymentRecord.put("paymentMethodCd",   MapUtils.getString(param, "payCode",""));
//				orderPaymentRecord.put("operationType",  "1100");
//				orderPaymentRecord.put("amount",  payAmount);
//				orderPaymentRecord.put("staffId", sessionStaff.getStaffId());
//				orderPaymentRecord.put("custOrderIdz", olId);
//				param.put("areaId", sessionStaff.getAreaId());
//				param.put("orderId", MapUtils.getString(param, "newId",""));
//				param.put("orderPaymentRecord", orderPaymentRecord);
////				rMap = saveOrderPaymentRecord(param, null, sessionStaff);
////				if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
////			    	
////			    }
//			}catch(Exception e){
//			    log.error("支付交易信息保存接口服务出错", e);
//			}
		}
		return db.getReturnlmap();
	}
}

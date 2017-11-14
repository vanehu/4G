package com.al.lte.portal.bmo.crm;
import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.common.utils.DateUtil;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;


/**
 * 销售品相关业务操作类  .
 * <P>
 * 
 * @author wukf
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.OfferBmo")
public class OfferBmoImpl implements OfferBmo {
	
	protected final Log log = Log.getLog(getClass());

	public Map<String, Object> queryCanBuyAttachSpec(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_ATTACH_SPEC, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryCanBuyAttachOfferSpec服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ATTACH_OFFER, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * 从查询可订购附属销售品的回参中，去除当月到期且到期不可重复订购的附属销售品<br/>
	 * 分别循环遍历可订购附属列表和已订购附属列表，其中已订购列表拼装在查询入参中。该方法目前用于可订购附属销售品的搜索框。
	 * @author ZhangYu 2016-03-27
	 * @throws ParseException
	 */
	@SuppressWarnings({ "unchecked"})
	public Map<String, Object> removeAttachOfferExpired(Map<String, Object> paramMap, Map<String, Object> resultMap) throws ParseException{
		
		//已订购附属销售品
		List<Map<String, Object>> attachOfferOrderedList = new ArrayList<Map<String, Object>>();
		//可订购附属销售品
		List<Map<String, Object>> offerSpecCanBuyList = new ArrayList<Map<String, Object>>();
		//中间变量，为获取可订购附属销售品回参中的offerSpecList
		Map<String, Object> offerSpecMap = new HashMap<String, Object>();
		
		attachOfferOrderedList = (List<Map<String, Object>>) paramMap.get("attachOfferOrderedList");
		offerSpecMap = (Map<String, Object>) resultMap.get("result");
		if(offerSpecMap.size() > 0){
			if(null!=offerSpecMap.get("offerSpecList") && ((List<Map<String, Object>>) offerSpecMap.get("offerSpecList")).size()>0){
				offerSpecCanBuyList = (List<Map<String, Object>>) offerSpecMap.get("offerSpecList");
			}else if(null !=offerSpecMap.get("agreementOfferList") && ((List<Map<String, Object>>) offerSpecMap.get("agreementOfferList")).size()>0){
				offerSpecCanBuyList = (List<Map<String, Object>>) offerSpecMap.get("agreementOfferList");
			}
			
		}
		if(attachOfferOrderedList.size() > 0 && offerSpecCanBuyList.size() > 0){
			//获取两个Calendar实例，一个表示当前时间，一个表示到期时间
			Calendar NowCalendar = Calendar.getInstance();
			Calendar expireCalendar = Calendar.getInstance();
			//循环遍历可订购附属销售品
			for(int i = 0; i < offerSpecCanBuyList.size(); i++){				
				Map<String, Object> offerSpecCanBuy = offerSpecCanBuyList.get(i);				
				String offerSpecId = MapUtils.getString(offerSpecCanBuy, "offerSpecId", "N/A");
				//是否可重复订购
//				String ifOrderAgain = MapUtils.getString(offerSpecCanBuy, "ifOrderAgain", "N/A");
				//两层含义：1. 表示合约；2. 6个月之内的有效期是否可重复订购(即续约标识)，Y为可续约，其他不可续约或非合约
				String ifDueOrderAgain = MapUtils.getString(offerSpecCanBuy, "ifDueOrderAgain", "iamabug");
				//循环遍历已订购附属销售品
				for(int j = 0, length = attachOfferOrderedList.size(); j < length; j++){
					Map<String, Object> attachOfferOrdered = attachOfferOrderedList.get(j);
					//如果已订购附属在可订购附属列表中
					if(offerSpecId.equals(attachOfferOrdered.get("offerSpecId").toString())){
						//获取已订购的附属销售品的失效时间
						String expireDateStr = MapUtils.getString(attachOfferOrdered, "expDate", "iamnotabug");
						//先确定是合约
						if("Y".equals(ifDueOrderAgain)){
							if(!("iamnotabug".equals(expireDateStr) || "".equals(expireDateStr))){
								//如果expireDateStr不是yyyyMMddHHmmss14位会ParseException抛异常
								Date expireDate = DateUtil.getDateFromString(expireDateStr, DateUtil.DATE_FORMATE_STRING_DEFAULT);
								expireCalendar.setTime(expireDate);
								if(NowCalendar.compareTo(expireCalendar) < 0){
									//如果当前时间在到期前
									expireCalendar.add(Calendar.MONTH, -6);
									if(NowCalendar.compareTo(expireCalendar) < 0){
										//如果当前时间在到期前的6个月之内
										offerSpecCanBuyList.remove(i);
									}
								} else{
									offerSpecCanBuyList.remove(i);
								}
							} else{
								//如果是合约，但失效时间未返回，则过滤
								offerSpecCanBuyList.remove(i);
							}
						}
					}
				}
			}
		}
		
		//返回新的resultMap
		offerSpecMap.put("offerSpecList", offerSpecCanBuyList);
		resultMap.put("result", offerSpecMap);
		
		return resultMap;
	}
	
	public Map<String, Object> queryMustAttOffer(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.ATTACH_MUST_OFFER,optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryDefaultAndRequiredOfferSpec服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_MUST_OFFER, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> queryMustAttOfferServ(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.ATTACH_MUST_OFFER_SERV,optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryDefaultAndRequiredOfferSpec服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_MUST_OFFER_SERV, paramMap, resultMap, e);
		}
		return resultMap;
	}
	public Map<String, Object> queryServSpec(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.QUERY_SERV_SPEC,optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryDefaultAndRequiredServSpec服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_MUST_OFFER, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> queryAttachOffer(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.QUERY_ATTACH_OFFER, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = db.getReturnlmap();
				this.filterRepeat(resultMap);
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryAttachOfferByProdId服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_ATTACH_OFFER, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * 将报文的重复的销售品合并为一个节点
	 */
	@SuppressWarnings("unchecked")
	private void filterRepeat(Map<String, Object> resultMap){
		Map<String, Object> result=(Map<String, Object>)resultMap.get("result");
		Object offerLists=result.get("offerLists");
		List<Map<String, Object>> offers=new ArrayList<Map<String, Object>>();
		if(offerLists instanceof List){
			offers=(ArrayList<Map<String, Object>>)offerLists;
		}else if(offerLists instanceof Map){
			offers.add((Map<String, Object>)offerLists);
		}
		for (int i = 0; i < offers.size(); i++) {
			Map<String, Object> maps=offers.get(i);
			if(maps.get("offerSpecId")!=null){
				String offerSpecIdI=maps.get("offerSpecId").toString();
				List<String> list=new ArrayList<String>();
				int counts=1;
				maps.put("counts", counts);
				maps.put("orderCount", counts);
				list.add(maps.get("offerId").toString());
				if(StringUtils.isNotBlank(offerSpecIdI)){
					for (int j = (i+1); j < offers.size(); j++) {
						Map<String, Object> map=offers.get(j);
						if(map.get("offerSpecId")!=null){
							String offerSpecIdJ=map.get("offerSpecId").toString();
							if(offerSpecIdI.equals(offerSpecIdJ)){
								counts++;
								offers.remove(j);
								j--;
								maps.put("counts", counts);
								maps.put("orderCount", counts);
								list.add(map.get("offerId").toString());
							}
						}
					}
				}
				maps.put("offerIds", list);
			}
		}
		result.put("offerLists", offers);
	}
	
	public Map<String, Object> queryExcludeDepend(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,PortalServiceCode.QUERY_OFFER_EXCLUDE_DEPEND, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryOfferExcludeDepend服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_OFFER_PARAM, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryOfferInst(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap, PortalServiceCode.INTF_OFFER_INST_QUERY, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryOfferMemberById服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_OFFER_PARAM, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	public Map<String, Object> queryOfferParam(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(paramMap, PortalServiceCode.QUERY_OFFER_PARAM, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryOfferParam服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_OFFER_PARAM, paramMap, resultMap, e);
		}
		return resultMap;
	}

	@SuppressWarnings("unchecked")
	public Map<String, Object> queryOfferSpecParamsBySpec(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_OFFER_SPEC, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				Map<String, Object> resultMap = db.getReturnlmap();
				Map<String, Object> result = (Map<String, Object>) resultMap
						.get("result");
				Map<String, Object> tempmap = (Map<String, Object>) result
						.get("offerSpec");
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.put("offerSpec", tempmap);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "调用查询接口失败");
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryOfferSpecParamsBySpec服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_OFFER_SPEC, dataBusMap, returnMap, e);
		}
		return returnMap;
	}

	public Map<String, Object> queryLabel(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_LABLE, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				return db.getReturnlmap();
			} else {
				resMap.put("code", ResultCode.R_FAIL);
				resMap.put("msg", "调用查询接口失败");
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryLabelByAreaId服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_OFFER_SPEC, dataBusMap, resMap, e);
		}
		return resMap;
	}

	public Map<String, Object> loadInst(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.LOAD_INST, optFlowNum, sessionStaff);
		Map<String, Object> resMap = new HashMap<String, Object>();
		try{
			resMap.put("code", db.getResultCode());
			resMap.put("msg", db.getReturnlmap());
			resMap.put("result", db.getResultMsg());
		} catch (Exception e) {
			log.error("门户处理营业后台的queryLabelByAreaId服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_OFFER_SPEC, dataBusMap, resMap, e);
		}
		return resMap;
	}
	
	public Map<String, Object> newLoadInst(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.QUERY_LOAD_INSTIDS, optFlowNum, sessionStaff);
		Map<String, Object> resMap = new HashMap<String, Object>();
		try{
			resMap.put("code", db.getResultCode());
			resMap.put("msg", db.getReturnlmap());
			resMap.put("result", db.getResultMsg());
		} catch (Exception e) {
			log.error("门户处理营业后台的queryLabelByAreaId服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_OFFER_SPEC, dataBusMap, resMap, e);
		}
		return resMap;
	}

	public Map<String, Object> queryCanBuyServ(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_SERV_SPEC, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryDefaultAndRequireServSpec服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ATTACH_OFFER, paramMap, resultMap, e);
		}
		return resultMap;
	}

	public Map<String, Object> queryServExcludeDepend( Map<String, Object> paramMap, 
			String optFlowNum,SessionStaff sessionStaff) throws Exception {
		
		return null;
	}

	public Map<String, Object> prodOfferChange(Map<String, Object> paramMap,String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap, PortalServiceCode.INTF_PRODOFFER_CHANGE, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {		
				resultMap = db.getReturnlmap();				
				resultMap.put("code", ResultCode.R_SUCCESS);				
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的prodOfferChange服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_OFFER_PARAM, paramMap, resultMap, e);
		}	
		return resultMap;
	}

	public Map<String, Object> queryTemporaryOrder(Map<String, Object> paramMap, String optFlowNum,SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap, PortalServiceCode.INTF_TEMPORARYORDER_QUERY, optFlowNum, sessionStaff);
		try{
			resultMap = db.getReturnlmap();
		} catch (Exception e) {
			log.error("门户处理营业后台的queryTemporaryOrder服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_OFFER_PARAM, paramMap, resultMap, e);
		}
		return resultMap;
	};	
	/**
	 * 群号查询
	 * 
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryGroupList(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// 返回值
		Map<String, Object> retnMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_BIZ_CUSTINFO_FROM_PROV, optFlowNum, sessionStaff);
		try{
			retnMap.put("code", -1);
			retnMap.put("mess", db.getResultMsg());
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> returnMap = db.getReturnlmap();
				if (ResultCode.R_SUCC.equals(StringUtils
						.defaultString((String) returnMap.get("resultCode")))) {
					if(returnMap.get("result")!=null){
						retnMap = (Map<String, Object>)returnMap.get("result");
					}
					retnMap.put("code", 0);
				}
			}
			return retnMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.QUERY_GROUP_BASIC_INFO,dataBusMap,db.getReturnlmap(), e);
		}
	}
	
	public Map<String, Object> querySeq(Map<String, Object> paramMap,String optFlowNum, 
			SessionStaff sessionStaff)throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_BIZ_ID_FROM_PROV, optFlowNum, sessionStaff);
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
			log.error("门户处理营业后台的querySeq服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_SEQ, paramMap, resultMap, e);
		}
		return resultMap;
	}

	public Map<String, Object> queryMyfavorite(Map<String, Object> paramMap,
		 String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_PRODOFFER_FAVORITE, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryProdOfferFavorites服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_MY_FAVORITE, paramMap, resultMap, e);
		}
		return resultMap;
	}

	public Map<String, Object> addMyfavorite(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.COLLECT_PRODOFFER_FAVORITE, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", db.getResultCode());
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的collectProdOfferIntoFavorites服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.ADD_MY_FAVORITE, paramMap, resultMap, e);
		}
		return resultMap;
	}

	public Map<String, Object> delMyfavorite(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.CANCEL_PRODOFFER_FAVORITE, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的cancelProdOfferFromFavorite服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.DEL_MY_FAVORITE, paramMap, resultMap, e);
		}
		return resultMap;
	}

	public Map<String, Object> queryOfferAndServDependForCancel(
			Map<String, Object> paramMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.QUERY_SERVDEPEND_FORCANCEL, optFlowNum, sessionStaff);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = db.getReturnlmap();
			} else {
				resultMap.put("code", ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的queryOfferAndServDependForCancel服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_SERVDEPEND_FORCANCEL, paramMap, resultMap, e);
		}
		return resultMap;
	}
	
	/**
	 * 销售品已订购次数查询
	 */
	public Map<String, Object> queryOfferOrderedTimes(Map<String, Object> params, SessionStaff sessionStaff) throws InterfaceException, IOException, BusinessException, Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		
		String accNbr = MapUtils.getString(params, "accNbr", "");
		String areaId = MapUtils.getString(params, "areaId", "");
		
		if(StringUtils.isBlank(accNbr) || StringUtils.isBlank(areaId)){
			returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
			returnMap.put(SysConstant.RESULT_MSG, "无效的入参accNbr、areaId。");
			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, params, returnMap, null);
		}
		
//		params.put(SysConstant.STAFF_ID, MapUtils.getString(params, SysConstant.STAFF_ID, sessionStaff.getStaffId()));
//		params.put(SysConstant.AREA_ID, MapUtils.getString(params, SysConstant.AREA_ID, sessionStaff.getCurrentAreaId()));
		
		DataBus db = InterfaceClient.callService(params, PortalServiceCode.QRY_OFFER_ORDERED_TIMES, null, sessionStaff);
		try {
			boolean isRequestSuccess = ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode(), "1"));
			if (isRequestSuccess) {
				boolean isQuerySuccess = ResultCode.R_SUCC.equals(MapUtils.getString(db.getReturnlmap(), SysConstant.RESULT_CODE, ""));
				if(isQuerySuccess){
					returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_SUCC);
					returnMap.put(SysConstant.RESULT_MSG, MapUtils.getMap(db.getReturnlmap(), "result"));
				} else{
					returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
					returnMap.put(SysConstant.RESULT_MSG, MapUtils.getString(db.getReturnlmap(), SysConstant.RESULT_MSG));
					returnMap.put("transactionID", MapUtils.getString(db.getReturnlmap(), "transactionID"));
				}
			} else {
				returnMap.put(SysConstant.RESULT_CODE, ResultCode.R_FAILURE);
				returnMap.put(SysConstant.RESULT_MSG, db.getResultMsg());
				returnMap.put("transactionID", MapUtils.getString(db.getReturnlmap(), "transactionID"));
			}
		} catch (Exception e) {
			log.error("门户处理后台的的service/intf.prodOfferInstSerivce/queryProdOfferOrderTimes服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QRY_OFFER_ORDERED_TIMES, params, db.getReturnlmap(), e);
		}
		
		return returnMap;
	}
	
}

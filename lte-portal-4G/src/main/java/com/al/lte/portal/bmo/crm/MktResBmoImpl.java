package com.al.lte.portal.bmo.crm;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils; 
import org.apache.commons.lang.StringUtils;
import org.dom4j.DocumentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;


/**
 * 营销资源业务操作类 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.MktResBmo")
public class MktResBmoImpl implements MktResBmo {
	
	protected final Log log = Log.getLog(getClass());
	
	@Autowired
	PropertiesUtils propertiesUtils;
	/*
	 * 号码查询 (non-Javadoc)
	 * 
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#queryPhoneNumber(java.util.Map,
	 * java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryPhoneNumber(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		log.debug("dataBusMap={}",JsonUtil.toString(dataBusMap));
		DataBus db = InterfaceClient
				.callService(dataBusMap,
						PortalServiceCode.INTF_QUERY_PHONENUMBER_LIST,
						optFlowNum, sessionStaff);
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
			returnMap.put("msg", "号码查询接口调用失败");
		}
		return returnMap;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> phoneNumInfoQry(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		log.debug("dataBusMap={}",JsonUtil.toString(dataBusMap));
		DataBus db = InterfaceClient
				.callService(dataBusMap,
						PortalServiceCode.PHONENUMINFOQRY_SERVICE,
						optFlowNum, sessionStaff);
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
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.al.lte.portal.bmo.crm.OrderBmo#queryNumberByIdentityId(java.util.Map,
	 * java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryNumberByIdentityId(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_QUERY_RESERVENUMBER, optFlowNum, sessionStaff);
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
			returnMap.put("msg", "号码查询接口调用失败");
		}
		return returnMap;
	}

	
	/*
	 * 号码预占与释放 (non-Javadoc)
	 * 
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#prePhoneNumber(java.util.Map,
	 * java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> prePhoneNumber(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> rMap = new HashMap<String, Object>();
		String oldPhoneNumber = null;
		String newPhoneNumber = String.valueOf(dataBusMap.get("phoneNumber"));
		String newAnTypeCd = String.valueOf(dataBusMap.get("anTypeCd"));
		String oldAnTypeCd = null;
		DataBus db = null;
		// 同一个订单多次预占号码的时候，先释放旧号码，再预占新号码(可能生成多个订单)
		String service = PortalServiceCode.INTF_RESERVE_PHONENUMBER;
		Map<String, Object> interMap = new HashMap<String, Object>();
		interMap.putAll(dataBusMap);
		if (interMap.containsKey("oldPhoneNumber")) {
			interMap.remove("oldPhoneNumber");
			interMap.remove("oldAnTypeCd");
		}
		if (interMap.containsKey("newPhoneNumber")) {
		    newPhoneNumber=String.valueOf(dataBusMap.get("newPhoneNumber"));
			interMap.remove("newPhoneNumber");
			interMap.remove("newAnTypeCd");
		}
		if (dataBusMap.containsKey("oldPhoneNumber")) {
			oldPhoneNumber = String.valueOf(dataBusMap.get("oldPhoneNumber"));
			oldAnTypeCd = String.valueOf(dataBusMap.get("oldAnTypeCd"));
			interMap.put("actionType", "F");
			interMap.put("phoneNumber", oldPhoneNumber);
			interMap.put("anTypeCd", oldAnTypeCd);
			db = InterfaceClient.callService(interMap, service, optFlowNum,
					sessionStaff);
			if(ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))){
				//旧号码释放成功，更改服务层记录
				Map<String, Object> param = new HashMap<String, Object>();
				param.put("accNbr", dataBusMap.get("oldPhoneNumber"));
				param.put("accNbrType", "1");
				param.put("action", "UPDATE");
				updateNumStatus(param, optFlowNum, sessionStaff);
				//TODO 状态更改成功与否并无提示
			}
			if (!dataBusMap.containsKey("newPhoneNumber")) {
				if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
						.getResultCode()))) {
					rMap = (Map<String, Object>) db.getReturnlmap().get(
							"result");
					rMap.put("code", ResultCode.R_SUCCESS);
				} else {
					rMap.put("code", ResultCode.R_FAIL);
					rMap.put("msg", oldPhoneNumber + "号码释放失败");
				}
				return rMap;
			}
			newPhoneNumber = String.valueOf(dataBusMap.get("newPhoneNumber"));
			newAnTypeCd = String.valueOf(dataBusMap.get("newAnTypeCd"));
		}
		interMap.put("actionType", "E");
		interMap.put("phoneNumber", newPhoneNumber);
		interMap.put("anTypeCd", newAnTypeCd);
		db = InterfaceClient.callService(interMap, service, optFlowNum, sessionStaff);
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			rMap = (Map<String, Object>) db.getReturnlmap().get("result");
			rMap.put("code", ResultCode.R_SUCCESS);
			
			//号码预占成功，服务层记录新增
			modifyNumToRelease(interMap,newPhoneNumber, "1", sessionStaff, optFlowNum);
		} else {
			rMap.put("code", ResultCode.R_FAIL);
			rMap.put("msg", db.getResultMsg());
		}
		return rMap;
	}

	/* uim卡校验与释放
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.BusiBmo#uimCheck(java.util.Map, java.lang.String, com.al.lte.portal.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> uimCheck(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> rMap = new HashMap<String, Object>();
		String oldInstCode = null;
		String newInstCode = String.valueOf(dataBusMap.get("instCode"));
		DataBus db = null;
		//同一个订单多次校验的时候，先释放旧uim卡，再校验新uim卡.(可能生成多个订单)
		String service=PortalServiceCode.INTF_RESERVE_UIM;
		Map<String,Object> interMap=new HashMap<String,Object>();
		interMap.putAll(dataBusMap);
		if(interMap.containsKey("oldInstCode")){
			interMap.remove("oldInstCode");
		}
		if(interMap.containsKey("newInstCode")){
			interMap.remove("newInstCode");
		}
		interMap.remove("phoneNum");
		interMap.remove("selUimType");
		interMap.remove("serialNumberCode");
		interMap.put("areaId", dataBusMap.get("areaId"));
		if (dataBusMap.containsKey("oldInstCode")) {
			oldInstCode = String.valueOf(dataBusMap.get("oldInstCode"));
			interMap.put("actionType", "F");
			interMap.put("instCode", oldInstCode);
			db = InterfaceClient.callService(interMap,PortalServiceCode.INTF_RELEASE_UIM,
					optFlowNum, sessionStaff);
			if(ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))){
				//旧UIM卡释放成功，更改服务层记录
				Map<String, Object> param = new HashMap<String, Object>();
				param.put("accNbr", dataBusMap.get("oldInstCode"));
				param.put("accNbrType", "2");
				param.put("action", "UPDATE");
				updateNumStatus(param, optFlowNum, sessionStaff);
				//TODO 状态更改成功与否并无提示
			}
			if (!dataBusMap.containsKey("newInstCode")) {
				if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
					rMap.put("code", ResultCode.R_SUCCESS);
					rMap.put("msg", newInstCode + "uim释放成功");
				} else {
					rMap.put("code", ResultCode.R_FAIL);
					rMap.put("msg", oldInstCode + "uim释放失败");
				}
				return rMap;
			}
			newInstCode = String.valueOf(dataBusMap.get("newInstCode"));
		}
		interMap.put("actionType", "E");
		interMap.put("instCode", newInstCode);
		interMap.put("phoneNum", dataBusMap.get("phoneNum"));
		if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(propertiesUtils.getMessage(SysConstant.APPDESC))){
			interMap.put("onlyLTE", "0");
		}
//		else{
//			interMap.put("onlyLTE", "1"); //非转售环境下，onlyLTE = 1 表示营销资源将校验该UIM卡是否4G可用
//		}
		db = InterfaceClient.callService(interMap,service,
				optFlowNum, sessionStaff);
		if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
			rMap = (Map<String,Object>)db.getReturnlmap().get("result");
			rMap.put("code", ResultCode.R_SUCCESS);
			//UIM卡预占成功，记录新增
			String selUimType = MapUtils.getString(dataBusMap, "selUimType", "1"); // 强商没有卡类型 所以设置默认值为1 预制卡
			if("1".equals(selUimType)){//2表示预制卡
				modifyNumToRelease(interMap, newInstCode, "2", sessionStaff, optFlowNum);
			}else{//3表示空白卡
				String serialNumberCode = MapUtils.getString(dataBusMap, "serialNumberCode", "");
				modifyNumToRelease(interMap, serialNumberCode, "3", sessionStaff, optFlowNum);
			}
			
		} else {
			rMap.put("code", ResultCode.R_FAIL);
			rMap.put("msg", db.getResultMsg());
		}
		return rMap;
	}
	//查询待释放的号码资源
	public Map<String, Object> queryReleaseNum(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception{		
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.QUERY_RELEASE_NUM, optFlowNum, sessionStaff);
		
		try{
			Map<String, Object> resultMap = db.getReturnlmap();
			return resultMap;
		}catch(Exception e){
			log.error("服务层QueryAccNbrToRelease服务回参异常", e);
			throw new BusinessException(ErrorCode.QUERY_RES_RELEASE, dataBusMap, db.getReturnlmap(), e);
		}		
	}
	
	//释放异常单的号码资源
	public Map<String, Object> releaseErrorNum(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception{
		
		DataBus db = new DataBus();
		
		if(dataBusMap.get("phoneNumber")!=null){
			db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_RESERVE_PHONENUMBER, optFlowNum, sessionStaff);
		}
		else{
			db = InterfaceClient.callService(dataBusMap, PortalServiceCode.INTF_RELEASE_UIM, optFlowNum, sessionStaff);
		}
		try{
			Map<String, Object> resultMap = db.getReturnlmap();
			return resultMap;
		}catch(Exception e){
			if(dataBusMap.get("phoneNumber")!=null){
				log.error("门户处理营销资源的PnReserveService服务返回的数据异常", e);
				throw new BusinessException(ErrorCode.PHONENUM_E_F_C, dataBusMap, db.getReturnlmap(), e);
			}
			else{
				log.error("门户处理营销资源的UIMReleaseService服务返回的数据异常", e);
				throw new BusinessException(ErrorCode.UIM_E_F, dataBusMap, db.getReturnlmap(), e);
			}			
		}					
	}
	
	//更新已释放的号码状态
	public Map<String, Object> updateNumStatus(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception{		
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.UPDATE_RELEASE_NUM_STATUS, optFlowNum, sessionStaff);
		
		try{
			Map<String, Object> returnMap = db.getReturnlmap();
			return returnMap;
		}catch(Exception e){
			log.error("服务层的ModifyAccNbrToRelease服务回参异常", e);
			throw new BusinessException(ErrorCode.UPDATE_RES_STATE, dataBusMap, db.getReturnlmap(), e);
		}		
	}
		
	private void modifyNumToRelease(Map<String, Object> interMap, String num, String accNbrType, SessionStaff sessionStaff, String optFlowNum) {
		Map<String, Object> recordMap = new HashMap<String, Object>();
		recordMap.put("accNbr", num);
		recordMap.put("accNbrType", accNbrType);
		recordMap.put("action", "ADD");
		recordMap.put("channelId", sessionStaff.getCurrentChannelId());
		if (StringUtils.isBlank(MapUtils.getString(interMap, "areaId", ""))) {
			recordMap.put("areaId", sessionStaff.getCurrentAreaId());
		} else {
			recordMap.put("areaId", interMap.get("areaId"));
		}
		recordMap.put("provinceCode", sessionStaff.getProvinceCode());
		//TODO 如果协议中把参数改为staffCode，这里也要相应修改
		recordMap.put("staffId", sessionStaff.getStaffCode());
		DataBus recordDb = ServiceClient.callService(recordMap,
				PortalServiceCode.UPDATE_RELEASE_NUM_STATUS, optFlowNum,
				sessionStaff);
		log.debug("modify num to release record ={}", recordDb.getReturnlmap());
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryMktResInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// 终端列表信息
		List<Map<String, Object>> mktResInfoList = new ArrayList<Map<String, Object>>();
		Map<String, Object> resultMap = new HashMap<String, Object>();
        String serviceCode = PortalServiceCode.INTF_TERM_QUERY_SERVICE;
//        if(null!=dataBusMap.get("pageType") && !("").equals(dataBusMap.get("pageType")) && ("zdyy").equals(dataBusMap.get("pageType"))){
//        	serviceCode = PortalServiceCode.INTF_TERM_ATTR_QUERY_SERVICE;
//        }
		DataBus db = InterfaceClient.callService(dataBusMap,serviceCode, optFlowNum,sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> rMap = MapUtils.getMap(db.getReturnlmap(), "result");
			Object obj = MapUtils.getObject(rMap, "mktResInfos");
			if (obj instanceof List) {
				mktResInfoList = (ArrayList<Map<String, Object>>) obj;
			} else if (obj instanceof Map) {
				mktResInfoList.add((Map<String, Object>) obj);
			}
			Map<String, Object> pageInfo = MapUtils.getMap(rMap, "pageInfo");
			resultMap.put("mktResList", mktResInfoList);
			resultMap.put("mktPageInfo", pageInfo);
		}
		return resultMap;
	}

	/**
	 * 根据终端串码查询机型信息
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryMktResInfoByCode(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {

		// 终端信息
		Map<String, Object> resultMap = new HashMap<String, Object>();

		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.TERM_INFO_QUERY_SERVICE, optFlowNum,
				sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> rMap = MapUtils.getMap(db.getReturnlmap(), "result");
			Map<String,Object> baseInfoMap=MapUtils.getMap(rMap,"baseInfo");
			List<Map<String, Object>> attrMapList = (List<Map<String, Object>>) MapUtils.getObject(rMap, "attrList");
			resultMap.put("mktResBaseInfo", baseInfoMap);
			resultMap.put("mktResAttrList", attrMapList);
		}
		return resultMap;
	}
	
	/**
	 * 根据终端串码查询机型信息2
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> queryMktResInfoByCode2(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {

		// 终端信息
		Map<String, Object> resultMap = new HashMap<String, Object>();

		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.TERM_INFO_QUERY_SERVICE, optFlowNum,
				sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> rMap = MapUtils.getMap(db.getReturnlmap(), "result");
			Map<String,Object> baseInfoMap=MapUtils.getMap(rMap,"baseInfo");
			List<Map<String, Object>> attrMapList = (List<Map<String, Object>>) MapUtils.getObject(rMap, "attrList");
			resultMap.put("mktResBaseInfo", baseInfoMap);
			resultMap.put("mktResAttrList", attrMapList);
		}else{
			String msg = StringUtils.defaultString(db.getResultMsg());
			resultMap.put("resultMsg", msg);
		}
		return resultMap;
	}

	@SuppressWarnings("unchecked")
	public Map<String, Object> queryNewInfoMktRes(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// 终端列表信息
		List<Map<String, Object>> mktResInfoList = new ArrayList<Map<String, Object>>();
		Map<String, Object> resultMap = new HashMap<String, Object>();

		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_TERM_QUERY_SERVICE, optFlowNum,
				sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			Map<String, Object> rMap = MapUtils.getMap(db.getReturnlmap(), "result");
			Object obj = MapUtils.getObject(rMap, "mktResInfos");
			if (obj instanceof List) {
				mktResInfoList = (ArrayList<Map<String, Object>>) obj;
			} else if (obj instanceof Map) {
				mktResInfoList.add((Map<String, Object>) obj);
			}
			Map<String, Object> pageInfo = MapUtils.getMap(rMap, "pageInfo");
			resultMap.put("mktResList", mktResInfoList);
			resultMap.put("mktPageInfo", pageInfo);
		}
		return resultMap;
	}
	

	/**
	 * @see com.al.ecs.portal.agent.bmo.crm.BusiBmo#checkTerminalCode(java.util.Map,
	 *      java.lang.String, com.al.ecs.portal.agent.model.SessionStaff)
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> checkTerminalCode(Map<String, Object> map,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// 终端校验信息
		Map<String, Object> resultMap = new HashMap<String, Object>();

		DataBus db = InterfaceClient.callService(map, 
				PortalServiceCode.INTF_TERM_VALIDATE,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
			List<Map<String, Object>> mktAttrList=new ArrayList<Map<String, Object>>();
			Object obj = MapUtils.getObject(MapUtils.getMap(db.getReturnlmap(), "result"), "mktAttrList");
			if (obj instanceof List) {
				mktAttrList = (ArrayList<Map<String, Object>>) obj;
			} else if (obj instanceof Map) {
				mktAttrList.add((Map<String, Object>) obj);
			}
			resultMap = MapUtils.getMap(resultMap, "baseInfo");
			resultMap.put("mktAttrList", mktAttrList);
			resultMap.put("code", "0");
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端串号失败。"));
		} else {
			resultMap.put("code", "1");
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端串号失败。"));
		}
		return resultMap;
	}
	
	/**
	 * 能力开放终端串码校验
	 * */
	public Map<String, Object> checkTerminalCodeSub(Map<String, Object> map, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		// 终端校验信息
		Map<String, Object> resultMap = new HashMap<String, Object>();

		DataBus db = InterfaceClient.callService(map, 
				PortalServiceCode.INTF_TERM_RECEIVE,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
			List<Map<String, Object>> mktAttrList=new ArrayList<Map<String, Object>>();
			Object obj = MapUtils.getObject(MapUtils.getMap(db.getReturnlmap(), "result"), "mktAttrList");
			if (obj instanceof List) {
				mktAttrList = (ArrayList<Map<String, Object>>) obj;
			} else if (obj instanceof Map) {
				mktAttrList.add((Map<String, Object>) obj);
			}
			resultMap = MapUtils.getMap(resultMap, "baseInfo");
			resultMap.put("mktAttrList", mktAttrList);
			resultMap.put("code", "0");
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端串号失败。"));
		} else {
			resultMap.put("code", "1");
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端串号失败。"));
		}
		return resultMap;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryOfferByMtkResCd(
			Map<String, Object> dataBusMap, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> rMap = null;
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_QUERY_OFFER_BY_MKT_RESCD, optFlowNum,
				sessionStaff);
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			rMap = db.getReturnlmap();
		}
		return rMap;
	}
	
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> getCardDllInfoJson(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(param, PortalServiceCode.GET_CARD_DLL_INFO, optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
			resultMap.putAll(db.getReturnlmap());
		} else {
			resultMap.put("code",  ResultCode.R_FAIL);
			resultMap.put("message", db.getResultMsg());
		}
		return resultMap;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> getAuthCode(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(param, PortalServiceCode.GET_AUTH_CODE, optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
			resultMap.putAll(db.getReturnlmap());
		} else {
			resultMap.put("code",  ResultCode.R_FAIL);
			resultMap.put("message", db.getResultMsg());
		}
		return resultMap;
	}
	@SuppressWarnings("unchecked")
	public Map<String, Object> getCardInfo(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws BusinessException {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		param.put("mvnoCode", sessionStaff.getPartnerCode());
		DataBus db = ServiceClient.callService(param, PortalServiceCode.GET_UIM_CARD_INFO, optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
			resultMap.putAll(db.getReturnlmap());
			Map<String, Object> TcpCont = new HashMap<String, Object>();
			TcpCont = (Map<String, Object>) db.getParammap().get("TcpCont");
			resultMap.put("TransactionID",TcpCont.get("TransactionID"));
		} else {
			resultMap.put("code",  ResultCode.R_FAIL);
			resultMap.put("message", db.getResultMsg());
		}
		return resultMap;
	}

	public Map<String, Object> getUimCardType(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> rMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.INTF_TERM_UIM_CARD_TYPE_VALIDATE,optFlowNum, sessionStaff);
		if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
			Map remap = db.getReturnlmap();
			List<Map<String,Object>> result = (List<Map<String, Object>>) remap.get("result");
			rMap.put("result", result);
			rMap.put("code", ResultCode.R_SUCCESS);
		} else {
			rMap.put("code", ResultCode.R_FAIL);
			rMap.put("msg", db.getResultMsg());
		}
		return rMap;
	}

	@SuppressWarnings("unchecked")
	public Map<String, Object> submitUimCardInfo(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(param, PortalServiceCode.SUBMIT_UIM_CARD_INFO, optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
			if ((MapUtils.getString(db.getReturnlmap(), "code").equals(ResultCode.R_SUCCESS))){
				Map paramMap = new HashMap();
				Map inoutInfoMap = new HashMap();
				String resultCode = MapUtils.getString(param, "resultCode");
				if ("00000000".equals(resultCode)){
					paramMap = MapUtils.getMap(param, "srInParam");
					inoutInfoMap = (Map) paramMap.get("InoutInfo");
					inoutInfoMap.put("StaffId", sessionStaff.getStaffId());
					DataBus db2 = InterfaceClient.callService(paramMap, 
							PortalServiceCode.INTF_UIM_CARD_INPUT,
							optFlowNum, sessionStaff);
					Map<String, Object> rtMap = new HashMap<String, Object>();
					rtMap.put("mktStoreId", MapUtils.getString(db2.getReturnlmap(), "mktStoreId"));
					rtMap.put("mktResId", MapUtils.getString(db2.getReturnlmap(), "mktResId"));
					
					resultMap.put("code",  MapUtils.getString(db2.getReturnlmap(), "resultCode"));
					resultMap.put("message", MapUtils.getString(db2.getReturnlmap(), "returnMsg"));
					resultMap.put("result", rtMap);
				}else{
					resultMap.putAll(db.getReturnlmap());
				}

			}else{
				resultMap.putAll(db.getReturnlmap());
			}
		} else {
			resultMap.put("code",  db.getResultCode());
			resultMap.put("message", db.getResultMsg());
		}
		return resultMap;
	}
	
	public Map<String, Object> queryCoupon(Map<String, Object> map,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// 终端校验信息
		Map<String, Object> resultMap = new HashMap<String, Object>();

		DataBus db = InterfaceClient.callService(map, 
				PortalServiceCode.INTF_QUERY_COUPON,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			Object o = MapUtils.getObject(db.getReturnlmap(), "result");
			if (o instanceof List){
				if (((List) o).size() > 0) {
					resultMap = (Map)(((List)o).get(0));
				}
			}else if(o instanceof Map){
				resultMap = (Map)o;
			}
			if (MapUtils.isEmpty(resultMap)) {
				resultMap = new HashMap<String, Object>();
				resultMap.put("code", "3");
				resultMap.put("msg", "根据串号获取终端信息返回为空。");
				resultMap.put("transcationId", db.getBusiFlowId());
				return resultMap;
			}
			// 判断 result 中的 inOutNbr 是否为 -1 ，是的话进行提示
			if ("-1".equals(resultMap.get("inOutNbr"))) {
				resultMap = new HashMap<String, Object>();
				resultMap.put("code", "4");
				resultMap.put("msg", "该终端不可退换货。");
				resultMap.put("transcationId", db.getBusiFlowId());
				return resultMap;
			}
			resultMap.put("transcationId", db.getBusiFlowId());
			resultMap.put("code", "0");
		} else {
			resultMap.put("code", "1");
			if (StringUtils.isBlank(db.getResultMsg())) {
				resultMap.put("msg", "根据串号获取终端信息没有对应信息。");
			} else {
				resultMap.put("msg", db.getResultMsg());
			}
			resultMap.put("transcationId", db.getBusiFlowId());
		}
		return resultMap;
	}
	
/**
 * 产品实例与号码关系查询接口
 * @throws IOException 
 * @throws InterfaceException 
 */
	public Map<String, Object> queryProdInstAccNbr(Map<String, Object> param,
			String flowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> rMap = null;
		DataBus db = InterfaceClient.callService(param,
				PortalServiceCode.QUERY_PROD_INST_ACCNBR, flowNum,
				sessionStaff);
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
				.getResultCode()))) {
			rMap = db.getReturnlmap();
		}else {
		    rMap=new HashMap();
		    rMap.put("code",  db.getResultCode());
		    rMap.put("message", db.getResultMsg());
        }
		return rMap;
	}
    /**
     * 销账：欠费查询
     * @param param
     * @param flowNum
     * @param sessionStaff
     * @return
     */
    public Map<String, Object> getOweCharge(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws Exception{
    	
        DataBus db = ServiceClient.callService(param,PortalServiceCode.GET_OWE_CHARGE, flowNum, sessionStaff);
        try{
        	if(db.getResultCode().equals("POR-0000")){
				Map<String, Object> returnMap = db.getReturnlmap();
				return returnMap;
			}
			else{
				Map<String, Object> returnMap = new HashMap<String, Object>();
				returnMap.put("code", db.getResultCode());
				returnMap.put("message", db.getResultMsg());
				return returnMap;
			}
        }catch(Exception e){
			throw new BusinessException(ErrorCode.QUERY_OVERDUE, param, db.getReturnlmap(), e);
		}		       
    }
    /**
     * 销账
     */
    public DataBus writeOffCash(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) {
        DataBus recordDb = ServiceClient.callService(param,PortalServiceCode.WRITE_OFF_CASH, flowNum, sessionStaff);
        return recordDb;
    }
/**
 * 营销资源--号码等级查询
 * @throws DocumentException 
 * @throws IOException 
 * @throws InterfaceException 
 */
    public DataBus qryPhoneNbrLevelInfoList(Map<String, Object> param, String flowNum, SessionStaff sessionStaff) throws  Exception {
        DataBus db = InterfaceClient.callService(param,
                PortalServiceCode.QRY_PHONENBRLEVELINFO_LIST, flowNum,
                sessionStaff);
        return db;
    }

    public Map<String, Object> queryNbrPool(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception {
    	Map<String, Object> rMap = new HashMap<String, Object>();
    	DataBus db = null;
    	//String service=PortalServiceCode.INTF_RESERVE_UIM;
    	String service="res-PnPoolQryService";
    	db = InterfaceClient.callService(dataBusMap,service,optFlowNum, sessionStaff);
    	if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
    		rMap = (Map<String,Object>)db.getReturnlmap().get("result");
    		rMap.put("code", ResultCode.R_SUCCESS);
    	} else {
    		rMap.put("code", ResultCode.R_FAIL);
    		rMap.put("msg", db.getResultMsg());
    	}
    	return rMap;
    }
    
    public Map<String, Object> queryPnLevelProdOffer(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception {
    	Map<String, Object> rMap = new HashMap<String, Object>();
    	DataBus db = null;
    	//String service=PortalServiceCode.INTF_RESERVE_UIM;
    	String service=PortalServiceCode.QRY_PHONENBRLEVELINFO_LIST;
    	db = InterfaceClient.callService(dataBusMap,service,optFlowNum, sessionStaff);
    	if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
    		Map remap = (Map<String,Object>)db.getReturnlmap();
			Map resultMap= (Map) remap.get("result");
    		List result = (List)resultMap.get("phoneNbrLevelList");
//    		rMap = (Map<String,Object>)db.getReturnlmap().get("result");
    		rMap.put("result", result);
    		rMap.put("code", ResultCode.R_SUCCESS);
    	} else {
    		rMap.put("code", ResultCode.R_FAIL);
    		rMap.put("msg", db.getResultMsg());
    	}
    	return rMap;
    }
    public Map<String, Object> reserveSubmit(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff)
    		throws Exception{
    	String serviceCode=PortalServiceCode.RESERVE_PHONE;
    	Map<String,Object> rMap=new HashMap<String,Object>();
    	DataBus db = InterfaceClient.callService(param,serviceCode,optFlowNum, sessionStaff);
    	if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
    		rMap.put("code", ResultCode.R_SUCCESS);
    	} else {
    		rMap.put("code", ResultCode.R_FAIL);
    		rMap.put("msg", db.getResultMsg());
    	}
    	return rMap;
    }
    
    public Map<String, Object> reserveBatchSubmit(Map<String, Object> param,String optFlowNum, SessionStaff sessionStaff)
    		throws Exception{
    	String serviceCode=PortalServiceCode.BATCHRESERVE_PHONE;
    	Map<String,Object> rMap=new HashMap<String,Object>();
    	DataBus db = InterfaceClient.callService(param,serviceCode,optFlowNum, sessionStaff);
    	if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
    		rMap.put("code", ResultCode.R_SUCCESS);
    	} else {
    		rMap.put("code", ResultCode.R_FAIL);
    		rMap.put("msg", db.getResultMsg());
    	}
    	return rMap;
    }

	public Map<String, Object> reserveQuery(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.RESERVE_PHONE_QUERY;
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
	//  终端销售详情查询 (手机客户端)
	public Map<String, Object> qryTermSalesInfoList(Map<String, Object> param,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		String serviceCode=PortalServiceCode.INTF_QUERY_TERM_SALES_INFO_LIST;
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
	
	/**
     * 终端领用_仓库查询
     */
	public Map<String, Object> getTermianlStore(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> rMap = new HashMap<String, Object>();
		DataBus db = null; 
    	String service="res-ITermReceiveService/queryStoreByStaff";
    	db = InterfaceClient.callService(dataBusMap,service,optFlowNum, sessionStaff);
    	if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
    		Map remap = (Map<String,Object>)db.getReturnlmap();
    		HashMap map = (HashMap)remap.get("rspInfo");
    		List storeList = (ArrayList)map.get("storeList");
     		rMap.put("result", storeList);
    		rMap.put("code", ResultCode.R_SUCCESS);
    	} else {
    		rMap.put("code", ResultCode.R_FAIL);
    		rMap.put("msg", db.getResultMsg());
    	}
    	return rMap;
	}
	/**
     * 终端领用_终端校验
     */
	public Map<String, Object> checkTermianl(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> rMap = new HashMap<String, Object>();
		DataBus db = null;
    	String service="res-ITermReceiveService/termVal";
    	db = InterfaceClient.callService(dataBusMap,service,optFlowNum, sessionStaff);
    	if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
    		Map remap = (Map<String,Object>)db.getReturnlmap();
    		rMap.put("result", remap.get("rspInfo"));
    		rMap.put("code", ResultCode.R_SUCCESS);
    	} else {
    		rMap.put("code", ResultCode.R_FAIL);
    		rMap.put("msg", db.getResultMsg());
    	}
    	return rMap;
	}
	/**
     * 终端领用_终端领用
     */
	public Map<String, Object> termianlUse(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		Map<String, Object> rMap = new HashMap<String, Object>();
		DataBus db = null;
		String service="res-ITermReceiveService/termReceive";
    	db = InterfaceClient.callService(dataBusMap,service,optFlowNum, sessionStaff);
    	if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
    		Map remap = (Map<String,Object>)db.getReturnlmap();
    		//List result = (List)remap.get("result");
   		    rMap.put("result", remap);
    		rMap.put("code", ResultCode.R_SUCCESS);
    	} else {
    		rMap.put("code", ResultCode.R_FAIL);
    		rMap.put("msg", db.getResultMsg());
    	}
    	return rMap;
	}
	
	public Map<String, Object> termOrderQuery(Map<String, Object> dataBusMap,String optFlowNum, SessionStaff sessionStaff) throws Exception {
    	Map<String, Object> rMap = new HashMap<String, Object>();
    	DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.TERM_ORDER_QUERY_SERVICE,optFlowNum, sessionStaff);
    	if ("0".equals(StringUtils.defaultString(db.getResultCode()))) {
    		Map remap = (Map<String,Object>)db.getReturnlmap();
    		Map result = (Map)remap.get("result");
    		rMap.put("result", result);
    		rMap.put("code", ResultCode.R_SUCCESS);
    	} else {
    		rMap.put("code", ResultCode.R_FAIL);
    		rMap.put("msg", db.getResultMsg());
    	}
    	return rMap;
    }
	
	/*
	 * 终端配置查询
	 */
	public Map<String, Object> queryCouponConfig(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
	throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("code", ResultCode.R_FAILURE);
		resultMap.put("mess", "终端配置查询接口调用异常");
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_COUPON_CONFIG, flowNum, sessionStaff);
		if(db.getReturnlmap()!=null){
			Map<String,Object> returnMap = db.getReturnlmap();
			if(returnMap!=null){
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					Map<String,Object> couponInfos =  new HashMap<String, Object>();
					if(returnMap.get("result")!=null){
						couponInfos =  (Map<String, Object>) returnMap.get("result");
						if(couponInfos!=null && !couponInfos.isEmpty()){
							resultMap.put("code", ResultCode.R_SUCC);
							resultMap.put("data", couponInfos);
							resultMap.put("mess", "终端配置查询接口调用成功");
						}else{
							resultMap.put("code", ResultCode.R_FAILURE);
							resultMap.put("mess", returnMap.get("resultMsg")==null?"":returnMap.get("resultMsg").toString());
						}
					}else{
						resultMap.put("code", ResultCode.R_FAILURE);
						resultMap.put("mess", returnMap.get("resultMsg")==null?"":returnMap.get("resultMsg").toString());
					}
				}else{
					resultMap.put("code", ResultCode.R_FAILURE);
					resultMap.put("mess", returnMap.get("resultMsg")==null?"":returnMap.get("resultMsg").toString());
				}
			}
		}
		return resultMap;
	}

	public Map<String, Object> checkTerminalCodeBack(Map<String, Object> map,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		// TODO Auto-generated method stub
		// 调用后台终端校验信息
		Map<String, Object> resultMap = new HashMap<String, Object>();

		DataBus db = InterfaceClient.callService(map, 
				PortalServiceCode.INTF_COUPONGRPFORCHECK_QUERY,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap.put("code", "0");
		} else {
			resultMap.put("code", "1");
			resultMap.put("message", db.getResultMsg());
		}
		return resultMap;		
	}
	
	/**
	 * 预约码校验
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryCouponReserveCodeCheck(Map<String, Object> map,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		// 终端校验信息
		Map<String, Object> resultMap = new HashMap<String, Object>();

		DataBus db = InterfaceClient.callService(map, 
				PortalServiceCode.QUERY_COUPON_RESERVE_CODE_CHECK,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
			resultMap.put("code", ResultCode.R_SUCC);
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端预约码失败。"));
		} else {
			resultMap.put("code", ResultCode.R_FAILURE);
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端预约码失败。"));
		}
		return resultMap;
	}
 
	/**
	 * 写白卡成功后，卡号入库
	 */
	public void intakeSerialNumber(Map<String, Object> param,
			String newInstCode, String string, SessionStaff sessionStaff,
			String flowNum) throws Exception {
		// TODO Auto-generated method stub
		modifyNumToRelease(param, newInstCode, string, sessionStaff, flowNum);
	}
    /**
     * 写卡入库
     */
	public void intcardNubInfoLog(Map<String, Object> param, String flowNum,
			SessionStaff sessionStaff) throws Exception {
		// TODO Auto-generated method stub
		InterfaceClient.callService(param, PortalServiceCode.SUBMIT_UIM_CARD_INFOLOG, flowNum, sessionStaff);
	}

	/**
	 * 终端规格排序
	 * @param dataBusMap
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 * @throws IOException 
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> termSort(Map<String, Object> dataBusMap, String flowNum, SessionStaff sessionStaff) throws Exception{
		/**
		 * {
		 *      "resultMsg": "成功",
			    "resultCode": "0",
			    "rspInfo": {
			        "tranId": "1000000045201111231150000263",
			        "rspTime": "20151203192821"
			    }
			}
		 */
		log.debug("dataBusMap={}",JsonUtil.toString(dataBusMap));
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.INTF_TERMSORT,flowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			Map<String, Object> datamap = (Map<String, Object>) resultMap.get("rspInfo");
			returnMap.put("resultCode", db.getResultCode());
			returnMap.put("resultMsg",db.getResultMsg());
			returnMap.putAll(datamap);
		} else {
			returnMap.put("resultCode", db.getResultCode());
			returnMap.put("resultMsg",db.getResultMsg());
		}
		return returnMap;
	}
    /**
     * 终端查询
     */
	public Map<String, Object> termQuery(Map<String, Object> dataBusMap, String flowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,PortalServiceCode.INTF_TERMSORT,flowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
			Map<String, Object> resultMap = db.getReturnlmap();
			Map<String, Object> datamap = (Map<String, Object>) resultMap.get("rspInfo");
			returnMap.put("code", ResultCode.R_SUCCESS);
			returnMap.putAll(datamap);
		} else {
			returnMap.put("code", ResultCode.R_FAIL);
			returnMap.put("msg", "号码查询接口调用失败");
		}
		return returnMap;
	}
	
	/**
	 * 客户证件校验接口
	 * @param checkIdMap
	 * @param flowNum
	 * @param sessionStaff
	 * @throws Exception
	 */
	public Map<String, Object> checkIdCardNumber(Map<String, Object> map, String flowNum,
			SessionStaff sessionStaff) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(map, 
				PortalServiceCode.CHECK_IDCARDNUMBER,
				flowNum, sessionStaff);
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap.put("code", ResultCode.R_SUCC);
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "客户证件校验失败。"));
		} else {
			resultMap.put("code", ResultCode.R_FAILURE);
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "客户证件校验失败。"));
		}
		return resultMap;
	}

	public Map<String, Object> checkTerminalCodeForAgent(Map<String, Object> map, String optFlowNum,
			SessionStaff sessionStaff) throws Exception {
		// 终端校验信息
		Map<String, Object> resultMap = new HashMap<String, Object>();

		DataBus db = InterfaceClient.callService(map, 
				PortalServiceCode.INTF_TERM_RECEIVE,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
			List<Map<String, Object>> mktAttrList=new ArrayList<Map<String, Object>>();
			Object obj = MapUtils.getObject(MapUtils.getMap(db.getReturnlmap(), "result"), "mktAttrList");
			if (obj instanceof List) {
				mktAttrList = (ArrayList<Map<String, Object>>) obj;
			} else if (obj instanceof Map) {
				mktAttrList.add((Map<String, Object>) obj);
			}
			resultMap = MapUtils.getMap(resultMap, "baseInfo");
			resultMap.put("mktAttrList", mktAttrList);
			resultMap.put("code", "0");
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端串号失败。"));
		} else {
			resultMap.put("code", "1");
			resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端串号失败。"));
		}
		return resultMap;
	}

	public Map<String, Object> checkTermCompVal(Map<String, Object> map,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		// TODO Auto-generated method stub
		// 终端校验信息
				Map<String, Object> resultMap = new HashMap<String, Object>();

				DataBus db = InterfaceClient.callService(map, 
						PortalServiceCode.INTF_TERM_RECEIVE,
						optFlowNum, sessionStaff);
				// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
				if (ResultCode.R_SUCC.equals(db.getResultCode())) {
					resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
					List<Map<String, Object>> mktAttrList=new ArrayList<Map<String, Object>>();
					Object obj = MapUtils.getObject(MapUtils.getMap(db.getReturnlmap(), "result"), "mktAttrList");
					if (obj instanceof List) {
						mktAttrList = (ArrayList<Map<String, Object>>) obj;
					} else if (obj instanceof Map) {
						mktAttrList.add((Map<String, Object>) obj);
					}
					resultMap = MapUtils.getMap(resultMap, "baseInfo");
					resultMap.put("mktAttrList", mktAttrList);
					resultMap.put("code", "0");
					resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端串号失败。"));
				} else {
					resultMap.put("code", "1");
					resultMap.put("message", MapUtils.getString(db.getReturnlmap(), "resultMsg", "校验终端串号失败。"));
				}
				return resultMap;
	}
	
	/**
	 * 终端信息统计查询(精品渠道终端进销存汇总报表(实时数据))
	 * @param requstParamMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception 
	 * @throws InterfaceException 
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> terminalStatisticQueryList(Map<String, Object> requstParamMap, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map<String, Object> returnData = null;
		
		DataBus db = InterfaceClient.callService(requstParamMap, PortalServiceCode.INTF_TERMSTATISIICSERVICE, optFlowNum, sessionStaff);
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {//接口调用成功
			returnData = db.getReturnlmap();
			if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//返回数据成功
				HashMap<String, Object> resultMap = (HashMap<String, Object>) returnData.get("result");				
				ArrayList<Map<String, Object>> returnList = (ArrayList<Map<String, Object>>) resultMap.get("statisticsInfo");
				returnMap.put("resultList", returnList);
				returnMap.put("code", "0");
			} else{
				returnMap.put("code", "1");
				returnMap.put("message", MapUtils.getString(returnData, "resultMsg", "营销资源MktResInstInfoQryService/termStatisticService服务异常"));
			}
		} else {
			returnMap.put("code", "1");
			returnMap.put("message", MapUtils.getString(returnData, "resultMsg", "营销资源MktResInstInfoQryService/termStatisticService服务异常"));
		}
		
		return returnMap;
	}
	
	/**
	 * 终端销售信息明细统计查询: 精品渠道终端进销存明细报表(当日实时数据)和 精品渠道终端进销存(库存量)明细报表(当日实时数据)
	 * @param requstParamMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws IOException 
	 * @throws InterfaceException 
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> terminalStatisticDetailQueryList(Map<String, Object> requstParamMap, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {
		
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map<String, Object> returnData = null;
		
		DataBus db = InterfaceClient.callService(requstParamMap, PortalServiceCode.INTF_TERMDETAILSTATISTICSERVICE, optFlowNum, sessionStaff);
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {//接口调用成功
			returnData = db.getReturnlmap();
			if(returnData != null && ResultCode.R_SUCC.equals(returnData.get("resultCode"))){//返回数据成功
/*				//用于分页的总记录数于后期添加，防止出错，这里多做一些校验处理
				String totalResultNum = null;
				if(returnData.get("totalResultNum") != null){
					totalResultNum = returnData.get("totalResultNum").toString();
					if("".equals(totalResultNum)){
						totalResultNum = "10";
					}
				} else{
					totalResultNum = "10";
				}*/
				//封装数据列表
				HashMap<String, Object> resultMap = (HashMap<String, Object>) returnData.get("result");
				ArrayList<Map<String, Object>> returnStatisticInfoList = (ArrayList<Map<String, Object>>) resultMap.get("statisticsInfo");
				returnMap.put("resultList", returnStatisticInfoList);
				returnMap.put("totalResultNum", returnData.get("totalResultNum"));
				returnMap.put("code", "0");
			} else{
				returnMap.put("code", "1");
				returnMap.put("message", MapUtils.getString(returnData, "resultMsg", "营销资源MktResInstInfoQryService/termStatisticService服务异常"));
			}
		} else {
			returnMap.put("code", "1");
			returnMap.put("message", MapUtils.getString(returnData, "resultMsg", "营销资源MktResInstInfoQryService/termDetailStatisticService服务异常"));
		}
		
		return returnMap;
	}
}

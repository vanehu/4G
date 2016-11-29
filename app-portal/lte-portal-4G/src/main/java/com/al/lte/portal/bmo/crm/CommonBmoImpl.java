package com.al.lte.portal.bmo.crm;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.al.crm.log.sender.ILogSender;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 公用业务操作类 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.crm.CommonBmo")
public class CommonBmoImpl implements CommonBmo {

	protected final Log log = Log.getLog(getClass());

	@Autowired
    private ILogSender logSender;

	public boolean checkToken(HttpServletRequest request, String token){
		try{
			HttpSession session = ServletUtils.getSession(request);
			String tokenAttr = (String)session.getAttribute(SysConstant.ORDER_SUBMIT_TOKEN);
			if(tokenAttr!=null && tokenAttr.equals(request.getParameter("token"))){  //验证订单
				session.removeAttribute(SysConstant.ORDER_SUBMIT_TOKEN);
				return true;
			}else {
				return false;
			}
		}catch(Exception e){
			log.error(e);
			return false;
		}
	}

	/**
	 * 释放资源
	 */
	public Map<String, Object> updateResState(ArrayList paramList,String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map resMap = new HashMap();
		if(paramList!=null&&paramList.size()>0){
			Map inMap = new HashMap();
			inMap.put("param", paramList);
			inMap.put("batchFlag", "0");
			DataBus db = ServiceClient.callService(inMap,
					PortalServiceCode.UPDATE_RELEASE_NUM_STATUS, optFlowNum,sessionStaff);
			resMap = db.getReturnlmap();
		}
		return resMap;
	}

	/**
	 * 实例查询 规则校验 全量查询
	 * @param param
	 * 实例构成入参：var param = {
			offerId : prod.prodOfferInstId,
			offerSpecId : prod.prodOfferId,
			acctNbr : prod.accNbr,
			areaId : prod.areaId,
			distributorId : ""
		};
	 * 全量查询var param = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),
			acctNbr : prod.accNbr,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			instId : prod.prodInstId,
			type : "2"
		};
	 * 客户级规则校验var inParam ={
			areaId : OrderInfo.staff.soAreaId,
			staffId : OrderInfo.staff.staffId,
			channelId : OrderInfo.staff.channelId,
			custId : OrderInfo.cust.custId,
			soNbr : OrderInfo.order.soNbr,
			boInfos : boInfos,
			prodInfo : order.prodModify.choosedProdInfo	
		};
	 * @return
	 */
	public Map<String, Object> validatorRule(Map<String, Object> param, String optFlowNum,
			HttpServletRequest request) throws Exception {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request,
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> resultMap=new HashMap<String, Object>();
		List<HashMap<String, Object>> offerMemberInfos=new ArrayList<HashMap<String, Object>>();
		
		
		Map<String, Object> prodIdInfoMap=new HashMap<String, Object>();
		Map<String, Object> custInfoMap=new HashMap<String, Object>();
//		Map<String, Object> staffInfoMap=new HashMap<String, Object>();
		prodIdInfoMap=(Map<String, Object>)param.get("prodIdInfoMap");
		custInfoMap=(Map<String, Object>)param.get("custInfoMap");
//		staffInfoMap=(Map<String, Object>)param.get("staffInfoMap");

		/**主销售品实例构成查询--------------------------开始**/
//		if(param.get("actionFlag")!=null&&Const.OFFERCHANGE_FLAG.equals(param.get("actionFlag"))){
//			Map<String, Object> offerInstParam=new HashMap<String, Object>();
//			offerInstParam.put("offerId", prodIdInfoMap.get("prodOfferInstId"));
//			offerInstParam.put("offerSpecId",prodIdInfoMap.get("prodOfferId"));
//			offerInstParam.put("acctNbr", prodIdInfoMap.get("accNbr"));
//			offerInstParam.put("areaId", prodIdInfoMap.get("areaId"));
//			offerInstParam.put("distributorId", "");
//			offerInstParam.put("staffId", sessionStaff.getStaffId());
//			Map<String, Object> offerInst = new HashMap<String, Object>();
//			
//			DataBus db = InterfaceClient.callService(offerInstParam, PortalServiceCode.INTF_OFFER_INST_QUERY, optFlowNum, sessionStaff);
//			try{
//				if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
//					offerInst = MapUtils.getMap(db.getReturnlmap(), "result");
//					offerMemberInfos=(List<HashMap<String, Object>>)offerInst.get("offerMemberInfos");
//					resultMap.put("offerInst", offerInst);//实例构成信息
//				} else {
//					resultMap.put("code",  ResultCode.R_FAIL);
//					resultMap.put("msg", db.getResultMsg());
//					return resultMap;
//				}
//			} catch (Exception e) {
//				log.error("门户处理营业后台的queryOfferMemberById服务返回的数据异常", e);
//				throw new BusinessException(ErrorCode.QUERY_OFFER_PARAM, offerInstParam, resultMap, e);
//			}
//		}
		/**全量查询---------------------------------开始**/
		Map<String, Object> instParam=new HashMap<String, Object>();
		if(prodIdInfoMap!=null){
			instParam.put("areaId", prodIdInfoMap.get("areaId"));
			instParam.put("acctNbr", prodIdInfoMap.get("accNbr"));
			instParam.put("custId", custInfoMap.get("custId"));
			instParam.put("soNbr", param.get("soNbr"));
			instParam.put("instId", prodIdInfoMap.get("prodInstId"));
			instParam.put("type", "2");
		}

		Map<String, Object> inst=new HashMap<String, Object>();
        try {
        	if(offerMemberInfos.size()>0){
        		boolean flag=true;
        		for (HashMap<String, Object> offerMemberInfo: offerMemberInfos) {
        			if(Const.OBJ_TYPE_PROD.equals(offerMemberInfo.get("objType"))&&offerMemberInfo.get("accessNumber").equals(instParam.get("acctNbr"))){
        				flag=false;
        				break;
        			}
        		}
        		if(flag){
        			inst = this.loadInst(instParam,optFlowNum,sessionStaff);//加载实例	
        			if(ResultCode.R_SUCC.equals(inst.get("code"))){
        				resultMap.put("inst", inst.get("result"));
        			}else{
        				resultMap.put("code",  ResultCode.R_FAIL);
    					resultMap.put("msg",inst.get("msg"));
    					return resultMap;
        			}
        		}else{
        			for (HashMap<String, Object> offerMemberInfo: offerMemberInfos) {
            			if(Const.OBJ_TYPE_PROD.equals(offerMemberInfo.get("objType"))){
            				instParam.put("acctNbr", offerMemberInfo.get("accessNumber"));
            				instParam.put("instId", offerMemberInfo.get("objInstId"));
            				inst = this.loadInst(instParam,optFlowNum,sessionStaff);//加载实例	
            				if(ResultCode.R_SUCC.equals(inst.get("code"))){
                				resultMap.put("inst", inst.get("result"));
                			}else{
                				resultMap.put("code",  ResultCode.R_FAIL);
            					resultMap.put("msg",inst.get("msg"));
            					return resultMap;
                			}
            			}
            		}
        		}
        	}else {
        		inst = this.loadInst(instParam,optFlowNum,sessionStaff);//加载实例	
        		if(ResultCode.R_SUCC.equals(inst.get("code"))){
    				resultMap.put("inst", inst.get("result"));
    			}else{
    				resultMap.put("code",  ResultCode.R_FAIL);
					resultMap.put("msg",inst.get("msg"));
					return resultMap;
    			}
			}
        } catch (BusinessException be) {
        	log.error("门户处理营业后台的queryProdInfoFromProv服务返回的数据异常", be);
			throw new BusinessException(ErrorCode.LOAD_INST, instParam, resultMap, be);
        } 
		/**业务规则校验------------------------------开始**/
        Map<String, Object> ruleParam=new HashMap<String, Object>();
        ruleParam.put("areaId", sessionStaff.getCurrentAreaId());
        if("20".equals(sessionStaff.getIsStrBusi())){
        	ruleParam.put("olTypeCd", "16");
        }
        else ruleParam.put("olTypeCd", "15");
        ruleParam.put("staffId", sessionStaff.getStaffId());
        ruleParam.put("channelId", sessionStaff.getCurrentChannelId());
        ruleParam.put("custId", custInfoMap.get("custId"));
        ruleParam.put("soNbr", param.get("soNbr"));
        List<Map<String, Object>> boInfos=new ArrayList<Map<String, Object>>();
        if(param.get("actionFlag")!=null&&Const.OFFERCHANGE_FLAG.equals(param.get("actionFlag"))){
        	Map<String, Object> boInfo=new HashMap<String, Object>();
        	boInfo.put("boActionTypeCd", Const.BO_ACTION_TYPE_BUY_OFFER);
        	boInfo.put("instId", prodIdInfoMap.get("prodInstId"));
        	boInfo.put("prodId", prodIdInfoMap.get("prodInstId"));
        	boInfo.put("specId", Const.PROD_SPEC_CDMA);
        	boInfos.add(boInfo);
        	Map<String, Object> boInfo2=new HashMap<String, Object>();
        	boInfo2.put("boActionTypeCd", Const.BO_ACTION_TYPE_DEL_OFFER);
        	boInfo2.put("instId", prodIdInfoMap.get("prodInstId"));
        	boInfo2.put("prodId", prodIdInfoMap.get("prodInstId"));
        	boInfo2.put("specId", Const.PROD_SPEC_CDMA);
        	boInfos.add(boInfo2);
        }else if(param.get("actionFlag")!=null&&Const.ACTIVERETURN_FLAG.equals(param.get("actionFlag"))){
        	Map<String, Object> boInfo=new HashMap<String, Object>();
        	boInfo.put("boActionTypeCd", Const.BO_ACTION_TYPE_ACTIVERETURN);
        	boInfo.put("instId", prodIdInfoMap.get("prodInstId"));
        	boInfo.put("prodId", prodIdInfoMap.get("prodInstId"));
        	boInfo.put("specId", Const.PROD_SPEC_CDMA);
        	boInfos.add(boInfo);
        }
        
        ruleParam.put("boInfos", boInfos);
        ruleParam.put("prodInfo", prodIdInfoMap);
        Map<String,Object> ruleMap=new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(ruleParam, PortalServiceCode.CHECK_RULE_PREPARE, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				ruleMap = MapUtils.getMap(db.getReturnlmap(), "result");
				resultMap.put("ruleMap", ruleMap);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
				ruleMap = MapUtils.getMap(db.getReturnlmap(), "result");
				resultMap.put("ruleMap", ruleMap);
				return resultMap;
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的check4GRuleSoPrepare服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CHECK_RULE, ruleParam, resultMap, e);
		}
		resultMap.put("code", ResultCode.R_SUCCESS);
		return resultMap;	
	}
	
	public Map<String, Object> validatorRuleSub(Map<String, Object> param, String optFlowNum,HttpServletRequest request) throws Exception {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request,SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> resultMap=new HashMap<String, Object>();
		List<HashMap<String, Object>> offerMemberInfos=new ArrayList<HashMap<String, Object>>();
		
		Map<String, Object> prodIdInfoMap=new HashMap<String, Object>();
		Map<String, Object> custInfoMap=new HashMap<String, Object>();
		prodIdInfoMap=(Map<String, Object>)param.get("prodIdInfoMap");
		custInfoMap=(Map<String, Object>)param.get("custInfoMap");
		
		/**业务规则校验------------------------------开始**/
        Map<String, Object> ruleParam=new HashMap<String, Object>();
        ruleParam.put("areaId", sessionStaff.getCurrentAreaId());
        ruleParam.put("staffId", sessionStaff.getStaffId());
        ruleParam.put("channelId", sessionStaff.getCurrentChannelId());
        ruleParam.put("custId", custInfoMap.get("custId"));
        ruleParam.put("soNbr", param.get("soNbr"));
        List<Map<String, Object>> boInfos=new ArrayList<Map<String, Object>>();
        if(param.get("actionFlag")!=null&&Const.OFFERCHANGE_FLAG.equals(param.get("actionFlag"))){
        	Map<String, Object> boInfo=new HashMap<String, Object>();
        	boInfo.put("boActionTypeCd", Const.BO_ACTION_TYPE_BUY_OFFER);
        	boInfo.put("instId", prodIdInfoMap.get("prodInstId"));
        	boInfo.put("prodId", prodIdInfoMap.get("prodInstId"));
        	boInfo.put("specId", Const.PROD_SPEC_CDMA);
        	boInfos.add(boInfo);
        	Map<String, Object> boInfo2=new HashMap<String, Object>();
        	boInfo2.put("boActionTypeCd", Const.BO_ACTION_TYPE_DEL_OFFER);
        	boInfo2.put("instId", prodIdInfoMap.get("prodInstId"));
        	boInfo2.put("prodId", prodIdInfoMap.get("prodInstId"));
        	boInfo2.put("specId", Const.PROD_SPEC_CDMA);
        	boInfos.add(boInfo2);
        }else if(param.get("actionFlag")!=null&&Const.ACTIVERETURN_FLAG.equals(param.get("actionFlag"))){
        	Map<String, Object> boInfo=new HashMap<String, Object>();
        	boInfo.put("boActionTypeCd", Const.BO_ACTION_TYPE_ACTIVERETURN);
        	boInfo.put("instId", prodIdInfoMap.get("prodInstId"));
        	boInfo.put("prodId", prodIdInfoMap.get("prodInstId"));
        	boInfo.put("specId", Const.PROD_SPEC_CDMA);
        	boInfos.add(boInfo);
        }
        
        ruleParam.put("boInfos", boInfos);
        ruleParam.put("prodInfo", prodIdInfoMap);
        Map<String,Object> ruleMap=new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(ruleParam, PortalServiceCode.CHECK_RULE_PREPARE, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				ruleMap = MapUtils.getMap(db.getReturnlmap(), "result");
				resultMap.put("ruleMap", ruleMap);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
				ruleMap = MapUtils.getMap(db.getReturnlmap(), "result");
				resultMap.put("ruleMap", ruleMap);
				return resultMap;
			}
		} catch (Exception e) {
			log.error("门户处理营业后台的check4GRuleSoPrepare服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.CHECK_RULE, ruleParam, resultMap, e);
		}
		resultMap.put("code", ResultCode.R_SUCCESS);
		return resultMap;	
	}
	
	private Map<String, Object> loadInst(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.LOAD_INST, optFlowNum, sessionStaff);
		Map<String, Object> resMap = new HashMap<String, Object>();
		try{
			resMap.put("code", db.getResultCode());
			resMap.put("msg", db.getReturnlmap());
			resMap.put("result", db.getResultMsg());
		} catch (Exception e) {
			log.error("门户处理营业后台的queryProdInfoFromProv服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.LOAD_INST, dataBusMap, resMap, e);
		}
		return resMap;
	}
	
	
	/*
	 * 离散值类型查询
	 */
	public Map<String, Object> querySpecListByAttrID(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
	throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("code", ResultCode.R_FAILURE);
		resultMap.put("mess", "离散值接口调用异常");
		DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.QUERY_SPECLIST_BY_ATTRID, flowNum, sessionStaff);
		if(db.getReturnlmap()!=null){
			Map<String,Object> returnMap = db.getReturnlmap();
			if(returnMap!=null){
				if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
					if(returnMap.get("result")!=null && returnMap.get("result") instanceof List){
						resultMap.put("code", ResultCode.R_SUCC);
						resultMap.put("data", returnMap.get("result"));
						resultMap.put("mess", "离散值接口调用成功");
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
	/**
	 * 记录页面操作的动作和页面内容等，根据具体需要添加到入参字段
	 * @param param
	 * @param model
	 * @param response
	 * @param optFlowNum
	 * @return
	 */
	public Map<String, Object> portalActonLog(Map<String, Object> dataBusMap,String flowNum,SessionStaff sessionStaff)
	throws Exception{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try{
			DataBus db = InterfaceClient.callService(dataBusMap, PortalServiceCode.PORTA_ACTION_LOG, flowNum, sessionStaff);
		} catch (Exception e) {
			log.error("门户页面记录操作：", dataBusMap);
		}	
		return resultMap;
	}

	/*
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.CommonBmo
	 * #signature(java.lang.String, java.lang.String, java.lang.String,
	 * java.lang.String, java.lang.String, java.lang.String)
	 */
	public String signature(String partyName, String certNumber, String certAddress,
        String identityPic, String nonce, String secret) throws Exception {
	    Map<String, String> map = new HashMap<String, String>();
        map.put("partyName", partyName.trim());
        map.put("certNumber", certNumber.trim());
        map.put("certAddress", certAddress.trim());
        map.put("nonce", nonce.trim());
        if (StringUtils.isNotBlank(identityPic)) {
            map.put("identityPic", identityPic.trim());
        }
        String signature = signatureForSha(map, secret);
        StringBuffer sbData = new StringBuffer();
        sbData.append(nonce).append(signature);
        return sbData.toString();
	}

	/*
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.CommonBmo
	 * #signatureForSha(java.util.Map, java.lang.String)
	 */
	public String signatureForSha(Map<String, String> map, String secret) throws Exception {
	    if (null == map || map.isEmpty()) {
	        return "";
	    }
	    MapUtils.safeAddToMap(map, "secret", secret);
	    Map<?, ?> orderedMap = MapUtils.orderedMap(map);
	    StringBuffer sbData = new StringBuffer();
	    for (Entry<?, ?> entry : orderedMap.entrySet()) {
	        sbData.append(entry.getValue());
	    }
	    return DigestUtils.shaHex(sbData.toString());
	}

	/*
	 * (non-Javadoc)
	 * @see com.al.lte.portal.bmo.crm.CommonBmo
	 * #sendLog(java.util.Map, javax.servlet.http.HttpServletRequest)
	 */
	public void sendLog(Map<String, Object> param, HttpServletRequest request) throws Exception {
	    String flag = MapUtils.getString(param, "flag");
        long startTime = MapUtils.getLongValue(param, "startTime");
        long endTime = MapUtils.getLongValue(param, "endTime");
        long useTime = endTime - startTime;
        String inParams = MapUtils.getString(param, "inParams");
        String outParams = MapUtils.getString(param, "outParams");
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request,
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String areaId = StringUtils.defaultIfBlank(sessionStaff.getCurrentAreaId(), "");
        String staffId = StringUtils.defaultIfBlank(sessionStaff.getStaffId(), "");
        String staffCode = StringUtils.defaultIfBlank(sessionStaff.getStaffCode(), "");
        String channelName = StringUtils.defaultIfBlank(sessionStaff.getCurrentChannelName(), "");
        String channelId = StringUtils.defaultIfBlank(sessionStaff.getCurrentChannelId(), "");
        Map<String, Object> logObj = new HashMap<String, Object>();
        logObj.put("SERVICE_CODE", "common/saveCloudLog");
        logObj.put("PORTAL_CODE", "");
        logObj.put("ROLE_CODE", "");
        String serviceSerial = "SP" + DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS") + RandomStringUtils.randomNumeric(4);
        logObj.put("SERV_RUN_NBR", serviceSerial);
        HttpSession session = ServletUtils.getSession(request);
        String log_busi_run_nbr = (String) session.getAttribute(SysConstant.LOG_BUSI_RUN_NBR);
        logObj.put("BUSI_RUN_NBR", log_busi_run_nbr);
        String beginDate = DateFormatUtils.format(new Date(startTime), "yyyy/MM/dd HH:mm:ss");
        String endDate = DateFormatUtils.format(new Date(endTime), "yyyy/MM/dd HH:mm:ss");
        logObj.put("START_TIME", beginDate);
        logObj.put("END_TIME", endDate);
        logObj.put("USE_TIME", Long.toString(useTime));
        logObj.put("RESULT_CODE", "0".equals(flag) ? "0" : "");
        logObj.put("TRANS_ID", "");
        logObj.put("AREA_ID", areaId);
        logObj.put("REMOTE_ADDR", request.getRemoteAddr());
        logObj.put("REMOTE_PORT", String.valueOf(request.getRemotePort()));
        logObj.put("LOCAL_ADDR", request.getLocalAddr());
        logObj.put("LOCAL_PORT", String.valueOf(request.getLocalPort()));
        logObj.put("INTF_URL", "");
        logObj.put("INTF_METHOD", "cloudReadCert");
        logObj.put("STAFF_ID", staffId);
        logObj.put("STAFF_NAME", staffCode);
        logObj.put("CHANNEL_NAME", channelName);
        logObj.put("CHANNEL_ID", channelId);
        logObj.put("REMARK", "");
        logObj.put("OL_ID", "");
        logObj.put("SO_NBR", "");
        logObj.put("BUSI_TYPE", "");
        // 新增日志ID
        logObj.put("LOG_SEQ_ID", "");
        // 新增错误标识，0成功  1错误  2异常
        logObj.put("ERROR_CODE", flag);

        Map<String, Object> logClobObj = new HashMap<String, Object>();
        logClobObj.put("IN_PARAM", inParams);                        
        logClobObj.put("OUT_PARAM", outParams);

        logSender.sendLog2DB("PORTAL_SERVICE_LOG", logObj, logClobObj);
	}

}

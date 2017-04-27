package com.al.lte.portal.bmo.crm;

import java.util.*;
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
	
	
	/**
	 * 订单提交报文过滤多余的节点<br/>
	 * (1)由于同一个客户办理业务时可能同时使用人新建、经办人新建、客户新建等，在此过滤掉重复的C1节点，同一个客户新建应当只有一个C1节点<br/>
	 * (2)后期可能添加其他过滤，暂留
	 * @param param 订单提交入参
	 * @return true：过滤成功；false：过滤失败
	 */
	@SuppressWarnings("unchecked")
	public boolean orderSubmitFilter(Map<String, Object> param) throws Exception{
		boolean resultFlag = true;
		Set<String> c1BoActionType = new HashSet<String>();
        Map<String, Object> orderList = (Map<String, Object>) param.get("orderList");
        List<Map<String, Object>> custOrderList = (List<Map<String, Object>>) orderList.get("custOrderList");
        
        //第一次循环记录新建客户的C1节点
        for (Map<String, Object> custOrder : custOrderList) {
            List<Map<String, Object>> busiOrderList = (List<Map<String, Object>>) custOrder.get("busiOrder");
            for (int i = 0; i < busiOrderList.size(); i++) {
            	Map<String, Object> busiOrder = busiOrderList.get(i);
            	HashMap<String, Object> boActionType = (HashMap<String, Object>) busiOrder.get("boActionType");
                if ("C1".equalsIgnoreCase(MapUtils.getString(boActionType, "boActionTypeCd", ""))) {
                    Map<String, Object> data = (Map<String, Object>) busiOrder.get("data");
                	Map<String, Object> custInfo = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustInfos")).get(0);
                    Map<String, Object> custIdentities = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustIdentities")).get(0);
                    String identidiesTypeCd = MapUtils.getString(custIdentities, "identidiesTypeCd", "");//证件类型
                    String identityNum = MapUtils.getString(custIdentities, "identityNum", "");//证件号
                    if("".equals(identidiesTypeCd) || "".equals(identityNum)){
                    	return false;
                    } else if(!("Y".equals(MapUtils.getString(custInfo, "jbrFlag", "")) || 
                    		"Y".equals(MapUtils.getString(custInfo, "userCustFlag", "")))){//排除新建经办人和使用人节点
                    	if(!c1BoActionType.add(identityNum + identidiesTypeCd)){//若没有将新建经办人、新建客户区分开，则只能随机过滤
                    		busiOrderList.remove(i--);
                    	}
                    }
                }
            }
        }

        //第二次循环针对新建客户以外的C1节点(新建使用人、新建经办人)进行过滤
        for (Map<String, Object> custOrder : custOrderList) {
            List<Map<String, Object>> busiOrderList = (List<Map<String, Object>>) custOrder.get("busiOrder");
            for (int i = 0; i < busiOrderList.size(); i++) {
            	Map<String, Object> busiOrder = busiOrderList.get(i);
            	HashMap<String, Object> boActionType = (HashMap<String, Object>) busiOrder.get("boActionType");
                if ("C1".equalsIgnoreCase(MapUtils.getString(boActionType, "boActionTypeCd", ""))) {
                    Map<String, Object> data = (Map<String, Object>) busiOrder.get("data");
                	Map<String, Object> custInfo = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustInfos")).get(0);
                    Map<String, Object> custIdentities = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustIdentities")).get(0);
                    String identidiesTypeCd = MapUtils.getString(custIdentities, "identidiesTypeCd", "");//证件类型
                    String identityNum = MapUtils.getString(custIdentities, "identityNum", "");//证件号
                    if("Y".equals(MapUtils.getString(custInfo, "jbrFlag", "")) || 
                    		"Y".equals(MapUtils.getString(custInfo, "userCustFlag", ""))){
                    	if(!c1BoActionType.add(identityNum + identidiesTypeCd)){//针对新建经办人和使用人节点进行过滤
                    		busiOrderList.remove(i--);
                    	}
                    }
                }
            }
        }
        
        return resultFlag;
	}

	/**
	 * 订单提交报文过滤多余的节点后修正<br/>
	 * (1)由于同一个客户办理业务时可能同时使用人新建、经办人新建、客户新建等，在此过滤掉重复的C1节点，同一个客户新建应当只有一个C1节点<br/>
	 * (2)后期可能添加其他过滤，暂留
	 * @param param 订单提交入参
	 * @return map param:回参 resultFlag:true 成功 false 失败
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> orderSubmitUpdate(Map<String, Object> param) throws Exception{
		Map<String,Object> tmpParam = param;
		Map<String,Object> resutltMap = new HashMap<String,Object>();
		resutltMap.put("resultFlag","0");
		List<Map<String,Object>> cacheCustInfo = new ArrayList<Map<String,Object>>(); // 缓存与之前缓存数据全不一样的C1客户的证件类型和证件号
		Map<String, Object> orderList = (Map<String, Object>) tmpParam.get("orderList");
		List<Map<String, Object>> custOrderList = (List<Map<String, Object>>) orderList.get("custOrderList");

		// 第一次遍历保证新建客户已保存在缓存中
		for (Map<String, Object> custOrder : custOrderList) {
			List<Map<String, Object>> busiOrderList = (List<Map<String, Object>>) custOrder.get("busiOrder");
			for (int i = 0; i < busiOrderList.size(); i++) {
				Map<String, Object> busiOrder = busiOrderList.get(i);
				HashMap<String, Object> boActionType = (HashMap<String, Object>) busiOrder.get("boActionType");
				if ("C1".equalsIgnoreCase(MapUtils.getString(boActionType, "boActionTypeCd", ""))) {
					Map<String, Object> data = (Map<String, Object>) busiOrder.get("data");
					Map<String, Object> custInfo = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustInfos")).get(0);
					if(null == custInfo.get("jbrFlag") && null == custInfo.get("custType")){ // 新建客户
						cacheCustInfo.add(busiOrder);
					}
				}
			}
		}

		// 第二次遍历从经办人、使用人、责任人等从缓存中对比数据处理,并对订单做修正,以第一个C1客户为主
		for (Map<String, Object> custOrder : custOrderList) {
			List<Map<String, Object>> busiOrderList = (List<Map<String, Object>>) custOrder.get("busiOrder");
			for (int i = 0; i < busiOrderList.size(); i++) {
				Map<String, Object> busiOrder = busiOrderList.get(i);
				HashMap<String, Object> boActionType = (HashMap<String, Object>) busiOrder.get("boActionType");
				if ("C1".equalsIgnoreCase(MapUtils.getString(boActionType, "boActionTypeCd", ""))) {
					Map<String, Object> data = (Map<String, Object>) busiOrder.get("data");
					Map<String, Object> custInfo = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustInfos")).get(0);
					// C1动作区分 经办人:jbrFlag,责任人(2)、使用人(1):servType
					if("Y".equals(MapUtils.getString(custInfo, "jbrFlag", ""))){ // 新建经办人
						if(!eachListIsExist(cacheCustInfo, busiOrder)){ //不存在则缓存
							cacheCustInfo.add(busiOrder);
						}else{
							tmpParam = dealCustRelation(tmpParam, cacheCustInfo,busiOrder);
							busiOrder.put("delFlag", "Y");
						}
					} else if(SysConstant.USER_CUST_TYPE.equals(MapUtils.getString(custInfo, "custType", ""))) { // 新建使用人
						if(!eachListIsExist(cacheCustInfo, busiOrder)){ //不存在则缓存
							cacheCustInfo.add(busiOrder);
						}else{
							tmpParam = dealCustRelation(tmpParam, cacheCustInfo,busiOrder);
							busiOrder.put("delFlag", "Y");
						}
					} else if(SysConstant.RESP_CUST_TYPE.equals(MapUtils.getString(custInfo, "custType", ""))){ // 新建责任人
						if(!eachListIsExist(cacheCustInfo, busiOrder)){ //不存在则缓存
							cacheCustInfo.add(busiOrder);
						}else{
							tmpParam = dealCustRelation(tmpParam, cacheCustInfo,busiOrder);
							busiOrder.put("delFlag", "Y");
						}
					}
				}
			}

			Map<String, Object> orderList0 = (Map<String, Object>) tmpParam.get("orderList");
			List<Map<String, Object>> custOrderList0 = (List<Map<String, Object>>) orderList0.get("custOrderList");
			// 第一次遍历保证新建客户已保存在缓存中
			for (Map<String, Object> custOrder0 : custOrderList0) {
				List<Map<String, Object>> busiOrderList0 = (List<Map<String, Object>>) custOrder0.get("busiOrder");
				// 删除操作
				Iterator<Map<String,Object>> it = busiOrderList0.iterator();
				while(it.hasNext()){
					Map<String,Object> busiOrder = it.next();
					if(busiOrder.containsKey("delFlag")){
						it.remove();
					}
				}
			}

		}
		resutltMap.put("tmpParam",tmpParam);
		return resutltMap;
	}

	/**
	 * 传入当前C1动作，校验客户是否已存在List中
	 * true:存在->获取当前C1动作匹配的关系,从缓存中
	 * false:不存在->刷入缓存中,关系不做处理
	 *
	 * @param cachelist 缓存集
	 * @param busiOrder 当前C1动作
	 */
	private boolean eachListIsExist(List<Map<String, Object>> cachelist, Map<String, Object> busiOrder) {

		Map<String, Object> data = (Map<String, Object>) busiOrder.get("data");
		Map<String, Object> custIdentities = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustIdentities")).get(0);
		String identidiesTypeCd = MapUtils.getString(custIdentities, "identidiesTypeCd", "");//证件类型
		String identityNum = MapUtils.getString(custIdentities, "identityNum", "");//证件号

		Boolean existFlag = false;
		for (int i = 0; i < cachelist.size(); i++) {
			 if(checkExist(cachelist.get(i),identidiesTypeCd,identityNum)){
				 existFlag = true;
			 }
		}
		return existFlag;
	}

	private boolean checkExist(Map<String, Object> cachebBusiOrder,String identidiesTypeCd,String identityNum){
		Map<String, Object> cacheData = (Map<String, Object>) cachebBusiOrder.get("data");
		Map<String, Object> cacheCustIdentities = (Map<String, Object>) ((List<Map<String, Object>>) cacheData.get("boCustIdentities")).get(0);

		if (MapUtils.getString(cacheCustIdentities, "identidiesTypeCd", "").equals(identidiesTypeCd)
				&& MapUtils.getString(cacheCustIdentities, "identityNum", "").equals(identityNum)) {
			return true;
		}
		return false;
	}

	/**
	 * 处理客户关系
	 * @return
	 */
	private Map<String,Object>  dealCustRelation(Map<String,Object> param,List<Map<String,Object>> cacheList,Map<String,Object> busiOrder){

		Map<String,Object> tmpParam = param;

		Map<String, Object> orderList = (Map<String, Object>) tmpParam.get("orderList");
		Map<String, Object> orderListInfo = (Map<String, Object>) orderList.get("orderListInfo");
		List<Map<String, Object>> custOrderList = (List<Map<String, Object>>) orderList.get("custOrderList");

		// 获取原C1动作节点，根据原点的类型，归属产品是关联新装节点，并从缓存的节点中取实例ID做覆盖
		Map<String, Object> data = (Map<String, Object>) busiOrder.get("data");
		Map<String, Object> custInfo = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustInfos")).get(0);
		Map<String, Object> busiObj = (Map<String, Object>) busiOrder.get("busiObj");
		Map<String, Object> custIdentities = (Map<String, Object>) ((List<Map<String, Object>>) data.get("boCustIdentities")).get(0);
		String identidiesTypeCd = MapUtils.getString(custIdentities, "identidiesTypeCd", "");//证件类型
		String identityNum = MapUtils.getString(custIdentities, "identityNum", "");//证件号

		for(Map<String,Object> cacheBusiOrder: cacheList) {
			Map<String, Object> cacheBusiObj = (Map<String, Object>) cacheBusiOrder.get("busiObj");
			if(checkExist(cacheBusiOrder,identidiesTypeCd,identityNum)) {
				if ("Y".equals(MapUtils.getString(custInfo, "jbrFlag", ""))) {
					if (orderListInfo.containsKey("handleCustId")) {
						orderListInfo.put("handleCustId", MapUtils.getString(cacheBusiObj, "instId", ""));
					}
				} else if (SysConstant.USER_CUST_TYPE.equals(MapUtils.getString(custInfo, "custType", ""))) { // 产品属性修正
					// 获取产品属性，根据归属产品ID替换使用人值
					String ownerProdId = MapUtils.getString(custInfo, "ownerProd", "");
					if (StringUtils.isNotBlank(ownerProdId)) {
						// 获取新装节点
						for (Map<String, Object> custOrder : custOrderList) {
							List<Map<String, Object>> busiOrderList = (List<Map<String, Object>>) custOrder.get("busiOrder");
							for (int i = 0; i < busiOrderList.size(); i++) {
								Map<String, Object> prodNode = busiOrderList.get(i);
								HashMap<String, Object> boActionType = (HashMap<String, Object>) busiOrderList.get(i).get("boActionType");
								if ("1".equalsIgnoreCase(MapUtils.getString(boActionType, "boActionTypeCd", ""))) {
									//Map<String, Object> prodBusiObj = (Map<String, Object>) prodNode.get("busiObj");
									//if (ownerProdId.equals(MapUtils.getString(prodBusiObj, "instId", ""))) {
										List<Map<String, Object>> boProdItems = (List<Map<String, Object>>) ((Map<String, Object>) prodNode.get("data")).get("boProdItems");
										boProdItems = dealBoProdItems(boProdItems,MapUtils.getString(busiObj, "instId", ""), MapUtils.getString(cacheBusiObj, "instId", ""));
										((Map<String, Object>) prodNode.get("data")).put("boProdItems", boProdItems);
									//}
								}
							}
						}
					}
				} else if (SysConstant.RESP_CUST_TYPE.equals(MapUtils.getString(custInfo, "custType", ""))) { // 客户产品关系修正
					// 获取客户产品关系，修改责任人值
					String ownerProdId = MapUtils.getString(custInfo, "ownerProd", "");
					if (StringUtils.isNotBlank(ownerProdId)) {
						// 获取新装节点
						for (Map<String, Object> custOrder : custOrderList) {
							List<Map<String, Object>> busiOrderList = (List<Map<String, Object>>) custOrder.get("busiOrder");
							for (int i = 0; i < busiOrderList.size(); i++) {
								Map<String, Object> prodNode = busiOrderList.get(i);
								HashMap<String, Object> boActionType = (HashMap<String, Object>) busiOrderList.get(i).get("boActionType");
								if ("1".equalsIgnoreCase(MapUtils.getString(boActionType, "boActionTypeCd", ""))) {
									//Map<String, Object> prodBusiObj = (Map<String, Object>) prodNode.get("busiObj");
									//if (ownerProdId.equals(MapUtils.getString(prodBusiObj, "instId", ""))) {
										List<Map<String, Object>> boCusts = (List<Map<String, Object>>) ((Map<String, Object>) prodNode.get("data")).get("boCusts");
										boCusts = dealBoCusts(boCusts,MapUtils.getString(busiObj, "instId", ""), MapUtils.getString(cacheBusiObj, "instId", ""));
										((Map<String, Object>) prodNode.get("data")).put("boCusts", boCusts);
									//}
								}
							}
						}
					}
				}
			}
		}
		return tmpParam;
	}

	private List<Map<String,Object>> dealBoProdItems(List<Map<String,Object>> prodItems,String oldInstId,String instId){
		List<Map<String,Object>> boProdItems = prodItems;
		for(Map<String,Object> prodItem:prodItems){
			if(SysConstant.PROD_ITEM_SPEC_ID_USER.equals(prodItem.get("itemSpecId")) && oldInstId.equals(MapUtils.getString(prodItem,"value",""))){ // 使用人产品属性
				prodItem.put("value",instId);
			}
		}
		return boProdItems;
	}
	private List<Map<String,Object>> dealBoCusts(List<Map<String,Object>> custs,String oldInstId,String instId){
		List<Map<String,Object>> boCusts = custs;
		for(Map<String,Object> boCust:boCusts){
			if(SysConstant.RESP_CUST_TYPE.equals(boCust.get("partyProductRelaRoleCd")) && oldInstId.equals(MapUtils.getString(boCust, "partyId", ""))){ // 责任人产权客户
				boCust.put("partyId",instId);
			}
		}
		return boCusts;
	}
}

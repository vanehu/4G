package com.linkage.portal.service.lte.core.resources;



import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.intf.webservice.WSClient;
import com.ailk.ecsp.intf.webservice.WSConfig;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.MapUtil;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;
import com.linkage.json.JacksonUtil;
import com.linkage.portal.service.lte.LteConstants;
import com.linkage.portal.service.lte.dao.SoWriteCardDAOImpl;
import com.linkage.portal.service.lte.dto.TcpCont;
/**
 * 卡资源下发到省
 * @author xuj
 */
public class SubmitUimCardInfo extends Service {
    
	private final Logger log = LoggerFactory.getLogger(this.getClass());

	@SuppressWarnings("unchecked")
    @Override
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		String areaId = (String)dataMap.getInParam("areaId");
		String imsi = String.valueOf(dataMap.getInParam("imsi"));
		String iccserial = String.valueOf(dataMap.getInParam("iccserial"));
		String iccid = String.valueOf(dataMap.getInParam("iccid"));
		String phoneNumber = String.valueOf(dataMap.getInParam("phoneNumber"));

		String rCode = String.valueOf(dataMap.getInParam("resultCode"));
		String rMessage = String.valueOf(dataMap.getInParam("resultMessage"));
		//入参设置
		Map<String,Object> submitInfo = new HashMap<String,Object>();
		Map<String,Object> inParamMap = new HashMap<String,Object>();
		//inParamMap.put("AreaCode", areaCode);
		submitInfo.put("phoneNumber", phoneNumber);
		submitInfo.put("imsi", imsi);
		submitInfo.put("iccserial", iccserial);
		submitInfo.put("iccid", iccid);
		submitInfo.put("resultCode", rCode);
        submitInfo.put("resultMessage", rMessage);
        
        Map cardMap = new HashMap();
        cardMap.put("serviceSerial", serviceSerial);
        Map lmcEventMap = new HashMap();
        Map logInfo = new HashMap();
        String state = "F";
        if("0".equals(rCode)){
        	state = "S";
        }
        lmcEventMap.put("EVENT_TYPE", dataMap.getInParam().get("eventType"));
        lmcEventMap.put("ICCID",iccid);
        lmcEventMap.put("CARD_NO",iccserial);
        lmcEventMap.put("CARD_TYPE",dataMap.getInParam().get("cardType"));
        lmcEventMap.put("CARD_AREA",areaId);
        lmcEventMap.put("CHANNEL_ID",dataMap.getChannelId());
        lmcEventMap.put("STAFF_ID",dataMap.getStaffId());
        lmcEventMap.put("STATE",state);
        logInfo.put("INTF_TYPE", "1");
        logInfo.put("STATE",state);
		
		inParamMap.put("submitInfo",submitInfo);
		inParamMap.put("dataMap", dataMap);
		inParamMap.put(IConstant.CON_DB_KEY_WORD, MapUtils.getString(dataMap.getInParam(), IConstant.CON_DB_KEY_WORD));
        
		String inXML = TcpCont.parseTemplate(inParamMap, "SubmitUimCardInfo");
		if(StringUtils.isBlank(inXML)){
			dataMap.setResultCode(ResultCode.R_PARAM_WRONG);
			dataMap.setResultMsg("参数解析异常，请确认你的入参是否正确！");
			log.error("参数解析异常，请确认你的入参是否正确！");
			return dataMap;
		}
    	String url = DataRepository.getInstence().getSysParamValue(LteConstants.CN2_CON_CSB_URL_KEY,SysConstant.CON_SYS_PARAM_GROUP_INTF_URL);
    	log.debug("url:"+url);
		Map<String,Object> inMap = new HashMap<String,Object>();
    	inMap.put("in0", inXML);
    	WSConfig config = new WSConfig();
		config.setUrl(url);//接口地址
		config.setMethodName("exchange"); //请求的接口名称
		config.setOutParamType(IConstant.CON_OUT_PARAM_TYPE_TO_MAP);
		config.setInParams(inMap);
		
		try{
			Map<String, Object> resMap = WSClient.getInstance().callWS(config);
			//记录接口日志
			dataMap.put("inIntParam", inXML);
			dataMap.put("outIntParam", MapUtils.getString(resMap, "resultParam"));

			Map<String, Object> returnMap = new HashMap<String, Object>();
			//Map<String, Object> phoneNumberMap = new HashMap<String, Object>();
			Map<String, Object> retMap = (Map<String, Object>)MapUtil.path(resMap, "result");
			Map personalDataMap = (Map)MapUtil.path(retMap, "SvcCont");
			String resultCode = (String)MapUtil.path(retMap,"TcpCont/Response/RspCode");
			String transactionID = (String)MapUtil.path(retMap,"TcpCont/TransactionID");
			String message = (String)MapUtil.path(retMap,"TcpCont/Response/RspDesc");
			String messageStr = MapUtils.getString(resMap, "resultMsg");
			String code = ResultCode.R_FAIL;
			if ("0000".equals(resultCode)){
				code = ResultCode.R_SUCCESS;
				returnMap.putAll(personalDataMap);
			}
			if(message==null){
				message = messageStr;
			}
			returnMap.put("code", code);
			returnMap.put("message", message);
			dataMap.setOutParam(returnMap);
			dataMap.setResultCode(ResultCode.R_SUCCESS);
			
	        cardMap.put("TRANSACTION_ID", transactionID);
	        logInfo.put("RES_PARAM", JacksonUtil.getInstance().getObjectMapper().writeValueAsString(resMap));
		}catch (Exception e) {
			e.printStackTrace();
			dataMap.setResultCode(ResultCode.R_FAIL);
			dataMap.setResultMsg("接口调用失败！");
		}
		cardMap.put("LmcEvent", lmcEventMap);
	    cardMap.put("LogInfo", logInfo);
//	    SoWriteCardDAOImpl dao = new SoWriteCardDAOImpl();
//	    dao.writeWriteCardLog(cardMap);
		return dataMap;
	}

}

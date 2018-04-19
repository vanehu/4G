package com.linkage.portal.service.lte.core.charge;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.intf.webservice.WSClient;
import com.ailk.ecsp.intf.webservice.WSConfig;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.SoapUtil;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.LteConstants;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;
import com.linkage.portal.service.lte.dto.TcpCont;

/**
 * 销账
 */
public class WriteOffCash extends Service {
	
	@SuppressWarnings("unchecked")
	@Override
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		
		dataMap.addInParam("channelId", dataMap.getChannelId());
		dataMap.addInParam("staffId", dataMap.getStaffId());
		
		Calendar calendar = Calendar.getInstance();
		java.util.Date now = calendar.getTime();
		SimpleDateFormat dbFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
		SimpleDateFormat intfFormat = new SimpleDateFormat("yyyyMMddHHmmss");
		String dbOperTime = dbFormat.format(now);
		String intfOperTime= intfFormat.format(now);
		
		dataMap.addInParam("operTime", intfOperTime);
		dataMap.addInParam("dbOperTime", dbOperTime);
		
		String[] params = { "phoneNumber", "paymentAmount", "billingCycleId", "invoiceOffer", "channelId", "staffId" };
		dataMap = DataMapUtil.checkParam(dataMap, params);
		if (StringUtils.isNotBlank(dataMap.getResultCode())) {
			return dataMap;
		}
		
		String inXML = TcpCont.parseTemplate(dataMap.getInParam(), getClass().getSimpleName());
		if (StringUtils.isBlank(inXML)) {
			return DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTF_PARAM_FAIL);
		}
		
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map<String, Object> inMap = new HashMap<String, Object>();

		try {
            inMap.put("in0", inXML);
	    	String url = DataRepository.getInstence().getSysParamValue(LteConstants.CON_CSB_URL_KEY,SysConstant.CON_SYS_PARAM_GROUP_INTF_URL);
			WSConfig config = new WSConfig();
			config.setUrl(url);	
			config.setMethodName("exchange");
			config.setOutParamType(IConstant.CON_OUT_PARAM_TYPE_TO_MAP);
			config.setInParams(inMap);
			Map<String, Object> resMap = WSClient.getInstance().callWS(config);
			//记录接口日志
			dataMap.put("inIntParam", inXML);
			dataMap.put("outIntParam", MapUtils.getString(resMap, "resultParam"));

			if (ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(resMap, "resultCode"))){
				String resXml = TcpCont.buildInParam(MapUtils.getMap(resMap, "result"), getClass().getSimpleName()+"Res");
				returnMap = SoapUtil.xmlToMap(resXml);
				dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
				dataMap.setOutParam(returnMap);
				this.logWriteOffCash(dataMap);
			}else{
				returnMap = resMap;
				dataMap.setResultCode(MapUtils.getString(resMap, "resultCode"));
			}
			dataMap.setOutParam(returnMap);
		} catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
			return dataMap;
		}

//		String rxml = TcpCont.buildInParam(null, "simulate_"
//				+ getClass().getSimpleName() + "Res");
//		String resXml = TcpCont.buildInParam(SoapUtil.xmlToMap(rxml),
//				getClass().getSimpleName() + "Res");
//		returnMap = SoapUtil.xmlToMap(resXml);
//		dataMap = DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_POR_SUCCESS);
//		dataMap.setOutParam(returnMap);
		return dataMap;
	}
    private void logWriteOffCash(DataMap dataMap) throws Exception {
        String dbKeyWord = MapUtils.getString(dataMap.getInParam(), IConstant.CON_DB_KEY_WORD);
    	CommonDAO commonDAO = new CommonDAOImpl();
        //构造入参
        Map<String, Object> logMap = new HashMap<String, Object>();
        logMap.put("ACCT_NBR97", "");
        logMap.put("AREA_CODE", MapUtils.getString(dataMap.getInParam(), "areaCode",""));
        logMap.put("ACC_NBR", MapUtils.getString(dataMap.getInParam(), "phoneNumber",""));
        logMap.put("AMOUNT", MapUtils.getLongValue(dataMap.getInParam(), "payAmount",-1));
        logMap.put("PAY_AMOUNT", MapUtils.getLongValue(dataMap.getInParam(), "paymentAmount",-1));
        logMap.put("PAY_TYPE", LteConstants.CON_PAY_TYPE_WRITE_OFF_CASH);
        logMap.put("USER_CODE", StringUtils.defaultIfEmpty(dataMap.getStaffId(),""));
        logMap.put("PRE_BALANCE", MapUtils.getLongValue(dataMap.getInParam(), "paymentAmount",-1));
        logMap.put("PAY_SERIAL_NBR", MapUtils.getString(dataMap.getInParam(), "transactionID"));
        logMap.put("AREA_ID", MapUtils.getString(dataMap.getInParam(), "areaId"));
        logMap.put("CHANNEL_ID", dataMap.getChannelId());
        logMap.put("CHANNEL_NAME", dataMap.getChannelName());
        logMap.put("STAFF_NUMBER", MapUtils.getString(dataMap.getInParam(), "staffCode"));
        logMap.put("STAFF_ID", dataMap.getStaffId());
        logMap.put("CREATE_DATE", MapUtils.getString(dataMap.getInParam(), "dbOperTime",""));
        if (MapUtils.getString(dataMap.getOutParam(), "code").equals(ResultConstant.R_POR_SUCCESS.getCode())){
            logMap.put("PAY_STATUS", LteConstants.CON_PAY_STATUS_SUCESS);
        }else{
        	logMap.put("PAY_STATUS", LteConstants.CON_PAY_STATUS_FAIL);
        }

        logMap.put("LOGIN_TYPE", MapUtils.getString(logMap, "LOGIN_TYPE",""));
        logMap.put("LOGIN_NBR", StringUtils.defaultIfEmpty(dataMap.getStaffName(),""));
        logMap.put("AGENT_ID", StringUtils.defaultIfEmpty(dataMap.getChannelId(),""));
        logMap.put("CURR_DATE", MapUtils.getString(dataMap.getInParam(), "doCash_CurrDate",""));
        logMap.put("RESULT_CODE", MapUtils.getString(dataMap.getInParam(), "doCash_ResultCode",""));

        commonDAO.insertCashChargeLog(logMap,dbKeyWord);
    }

}

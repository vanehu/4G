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
import com.al.ecs.log.Log;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.LteConstants;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;
import com.linkage.portal.service.lte.dto.TcpCont;

/**
 * 现金充值
 */
public class DoCash extends Service {
	private final Log log = Log.getLog(this.getClass());

	@SuppressWarnings("unchecked")
	@Override
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		
		dataMap.addInParam("channelId", dataMap.getChannelId());
		dataMap.addInParam("staffId", dataMap.getStaffId());
		dataMap.addInParam("staffCode", dataMap.getStaffName());
		dataMap.addInParam("channelName", dataMap.getChannelName());
		
		Calendar calendar = Calendar.getInstance();
		java.util.Date now = calendar.getTime();
		SimpleDateFormat dbFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
		SimpleDateFormat intfFormat = new SimpleDateFormat("yyyyMMddHHmmss");
		String dbOperTime = dbFormat.format(now);
		String intfOperTime= intfFormat.format(now);
		
		dataMap.addInParam("operTime", intfOperTime);
		
		Map<String, Object> logMap = new HashMap<String, Object>();
		String doCashTypeCd = MapUtils.getString(dataMap.getInParam(), "doCashTypeCd", "");
		logMap.put("ACC_NBR", MapUtils.getString(dataMap.getInParam(), "phoneNumber",""));
        logMap.put("PAY_TYPE", doCashTypeCd);
        if(LteConstants.CON_PAY_TYPE_DO_CASH.equals(doCashTypeCd)){
        	logMap.put("PAY_AMOUNT", MapUtils.getLongValue(dataMap.getInParam(), "feeAmount",-1));
        }else if(LteConstants.CON_PAY_TYPE_R_DO_CASH.equals(doCashTypeCd)){
        	logMap.put("PAY_AMOUNT", MapUtils.getLongValue(dataMap.getInParam(), "feeAmount",-1)*(-1));
        	logMap.put("OLD_PAY_SERIAL_NBR", MapUtils.getString(dataMap.getInParam(), "reqSerial",  ""));
        }
        logMap.put("AREA_ID", MapUtils.getString(dataMap.getInParam(), "areaId"));
        logMap.put("CHANNEL_ID", dataMap.getChannelId());
        logMap.put("CHANNEL_NAME", dataMap.getChannelName());
        logMap.put("STAFF_NUMBER", dataMap.getStaffName());
        logMap.put("STAFF_ID", dataMap.getStaffId());
        logMap.put("CREATE_DATE", dbOperTime);
        logMap.put("dbKeyWord", MapUtils.getString(dataMap.getInParam(), IConstant.CON_DB_KEY_WORD));
		
		try {
			String[] params = { "phoneNumber", "feeAmount", "channelId", "staffId" };
			dataMap = DataMapUtil.checkParam(dataMap, params);
			if (StringUtils.isNotBlank(dataMap.getResultCode())) {
				return dataMap;
			}
	        String templateName = "DoCash";
	        if (LteConstants.CON_PAY_TYPE_DO_CASH.equals(doCashTypeCd)){
	        	templateName = "DoCash";
			}else if (LteConstants.CON_PAY_TYPE_R_DO_CASH.equals(doCashTypeCd)){
				templateName = "ReDoCash";
			}
	        Map inParamMap = new HashMap();
	        inParamMap = TcpCont.parseTemplateMap(dataMap.getInParam(), templateName);
	        String inXML = MapUtils.getString(inParamMap, "requestXml");
	        logMap.put("PAY_SERIAL_NBR", MapUtils.getString(inParamMap, "transactionID"));
	        
			if (StringUtils.isBlank(inXML)) {
				return DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTF_PARAM_FAIL);
			}
			
			Map<String, Object> returnMap = new HashMap<String, Object>();
			Map<String, Object> inMap = new HashMap<String, Object>();

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
				String resXml = TcpCont.buildInParam(MapUtils.getMap(resMap, "result"), templateName+"Res",true);
				returnMap = SoapUtil.xmlToMap(resXml);
				dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
				dataMap.setOutParam(returnMap);
			}else{
				returnMap = resMap;
				dataMap.setResultCode(MapUtils.getString(resMap, "resultCode"));
				dataMap.setOutParam(returnMap);
			}
	        if (LteConstants.CON_PAY_TYPE_DO_CASH.equals(doCashTypeCd)){
		        if (MapUtils.getString(dataMap.getOutParam(), "code").equals(ResultConstant.R_POR_SUCCESS.getCode())){
		            logMap.put("PAY_STATUS", LteConstants.CON_PAY_STATUS_PROGRESSING);
		        }else{
		        	logMap.put("PAY_STATUS", LteConstants.CON_PAY_STATUS_FAIL);
		        }
			}else if (LteConstants.CON_PAY_TYPE_R_DO_CASH.equals(doCashTypeCd)){
		        if (MapUtils.getString(dataMap.getOutParam(), "code").equals(ResultConstant.R_POR_SUCCESS.getCode())){
		            logMap.put("PAY_STATUS", LteConstants.CON_PAY_STATUS_SUCESS);
		        }else{
		        	logMap.put("PAY_STATUS", LteConstants.CON_PAY_STATUS_FAIL);
		        }
		    }
		} catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
		this.logDoCash(logMap);
		return dataMap;
	}
    /**
     * 缴费日志记录
     * @param dataBus
     * @param transactionID
     * @throws Exception 
     * @see
     */
    private void logDoCash(Map logMap) throws Exception {
    	CommonDAO commonDAO = new CommonDAOImpl();
        String dbKeyWord = MapUtils.getString(logMap, "dbKeyWord");
        commonDAO.insertCashChargeLog(logMap,dbKeyWord);
        String doCashTypeCd = MapUtils.getString(logMap, "PAY_TYPE");
        if (LteConstants.CON_PAY_TYPE_R_DO_CASH.equals(doCashTypeCd)&&(MapUtils.getString(logMap, "PAY_STATUS", "").equals(LteConstants.CON_PAY_STATUS_SUCESS))){
        	Map<String, Object> map = new HashMap();
        	map.put("PAY_TYPE", doCashTypeCd);
        	map.put("PAY_STATUS", LteConstants.CON_PAY_STATUS_BUY_BACK);
        	map.put("PAY_SERIAL_NBR", MapUtils.getString(logMap, "OLD_PAY_SERIAL_NBR"));
        	commonDAO.updateCashChargeLog(map, dbKeyWord);
        }
    }
}

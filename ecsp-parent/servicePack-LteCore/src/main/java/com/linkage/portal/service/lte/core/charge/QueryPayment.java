package com.linkage.portal.service.lte.core.charge;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
 * 查询缴费充值记录.
 * @createDate 2013-11-19
 * @author xuj
 */
public class QueryPayment extends Service {

    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
	    	String[] params = { "phoneNumber", "billingCycle" };
			dataMap = DataMapUtil.checkParam(dataMap, params);
			if (StringUtils.isNotBlank(dataMap.getResultCode())) {
				return dataMap;
			}
			Map<String, Object> returnMap = new HashMap<String, Object>();
	        String dbKeyWord = MapUtils.getString(dataMap.getInParam(), IConstant.CON_DB_KEY_WORD);
	        String doCashTypeCd = MapUtils.getString(dataMap.getInParam(), "doCashTypeCd");
	        if (LteConstants.CON_PAY_TYPE_R_DO_CASH.equals(doCashTypeCd)){
		        CommonDAO commonDAO = new CommonDAOImpl();
		    	List list = commonDAO.queryCashChargeLog(dataMap.getInParam(), dbKeyWord);
		    	Map retMap = new HashMap();
		    	retMap.put("paymentRecordInfo", list);
		    	returnMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
		    	returnMap.put("message", ResultConstant.R_POR_SUCCESS.getMsg());
		    	returnMap.put("recordInfo", retMap);
		    	dataMap.setOutParam(returnMap);
				dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
				dataMap.setResultMsg(ResultConstant.R_POR_SUCCESS.getMsg());
			}else{
				return querPaymentFromInterface(dataMap);
			}
		}catch(Exception e){
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION,ExceptionUtils.getMessage(e));
		}
		return dataMap;
    }
    private DataMap querPaymentFromInterface(DataMap dataMap) throws Exception {
        String inXML = TcpCont.parseTemplate(dataMap.getInParam(), getClass().getSimpleName());

        if (StringUtils.isBlank(inXML)) {
			return DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTF_PARAM_FAIL);
        }
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map<String, Object> inMap = new HashMap<String, Object>();
		try{
            inMap.put("in0", inXML);
	    	String url = DataRepository.getInstence().getSysParamValue(LteConstants.CON_CSB_URL_KEY,SysConstant.CON_SYS_PARAM_GROUP_INTF_URL);
			WSConfig config = new WSConfig();
			config.setUrl(url);	
			config.setMethodName("exchange"); //请求的接口名称
			config.setOutParamType(IConstant.CON_OUT_PARAM_TYPE_DOM_TEMPLATE);//输出参数格式
			config.setInParams(inMap);
			Map<String, Object> resMap = WSClient.getInstance().callWS(config);
			//记录接口日志
			dataMap.put("inIntParam", inXML);
			dataMap.put("outIntParam", MapUtils.getString(resMap, "resultParam"));

			if (ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(resMap, "resultCode"))){
				String resXml = TcpCont.buildInParam(MapUtils.getMap(resMap, "result"), getClass().getSimpleName()+"Res");
				returnMap = SoapUtil.xmlToMap(resXml);
				dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
			}else{
				returnMap = resMap;
				dataMap.setResultCode(MapUtils.getString(resMap, "resultCode"));
			}
			dataMap.setOutParam(returnMap);
		}catch (Exception e) { 
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION,ExceptionUtils.getMessage(e));
		}
		return dataMap;
    }
}

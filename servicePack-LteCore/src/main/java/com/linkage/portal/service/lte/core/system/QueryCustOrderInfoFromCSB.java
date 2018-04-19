package com.linkage.portal.service.lte.core.system;

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
import com.linkage.portal.service.lte.dto.TcpCont;


/**
 * 从CSB侧查询订单报文信息
 * @author Tim LX
 *
 */
public class QueryCustOrderInfoFromCSB extends Service{
	
	private final Log log = Log.getLog(this.getClass());
	
	@SuppressWarnings("unchecked")
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception{
		String[] params = { "qryTransactionId" };
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
			}else{
				returnMap = resMap;
				dataMap.setResultCode(MapUtils.getString(resMap, "resultCode"));
			}
			dataMap.setOutParam(returnMap);

        } catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
			return dataMap;
        }
//		String rxml = TcpCont.buildInParam(null, "simulate_"+getClass().getSimpleName()+"Res");
//		String resXml = TcpCont.buildInParam(SoapUtil.xmlToMap(rxml), getClass().getSimpleName()+"Res");
//		returnMap = SoapUtil.xmlToMap(resXml);
//		dataMap = DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_POR_SUCCESS);
//		dataMap.setOutParam(returnMap);
        return dataMap;
	}

}

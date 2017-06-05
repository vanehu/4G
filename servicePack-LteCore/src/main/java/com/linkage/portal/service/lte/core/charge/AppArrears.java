package com.linkage.portal.service.lte.core.charge;

import java.io.IOException;
import java.util.Map;

import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.xml.sax.SAXException;

import com.ailk.ecsp.intf.httpclient.HttpClient;
import com.ailk.ecsp.intf.webservice.WSConfig;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.SoapUtil;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.common.util.MDA;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.dto.TcpCont;

public class AppArrears extends Service {
	
	@Override
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try {
	        String inXML = createInXML(dataMap);
	        if (StringUtils.isBlank(inXML)) {
				return DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTF_PARAM_FAIL);
	        }
	        Map<String, Object> resMap = httpCall(inXML);
			setDataMap(dataMap, inXML, resMap);
        } catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION, ExceptionUtils.getFullStackTrace(e));
			return dataMap;
        }
        return dataMap;
	}
	
	private Map<String, Object> httpCall(String inXML) {
		WSConfig config = new WSConfig();
		config.setOutParamType(IConstant.CON_OUT_PARAM_TYPE_TO_MAP);
		// 发送HTTP请求
		Map<String, Object> resMap = HttpClient.getInstance().callByHttpClient(inXML, MDA.BILL_CSB_HTTP_URL, config);
		return resMap;
	}

	private String createInXML(DataMap dataMap) throws Exception {
		// 解析map生成xml入参
		String inXML = TcpCont.parseTemplate(dataMap.getInParam(), getClass().getSimpleName());
		// 数字签名
		inXML = TcpCont.createSign(inXML);
		return inXML;
	}
	
	@SuppressWarnings("unchecked")
	private void setDataMap(DataMap dataMap, String inXML,
			Map<String, Object> resMap) throws SAXException, IOException,
			ParserConfigurationException {
		Map<String, Object> returnMap;
		//记录接口日志
		dataMap.put("inIntParam", inXML);
		dataMap.put("outIntParam", MapUtils.getString(resMap, "resultParam"));
		// 回参解析封装
		if (ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(resMap, "resultCode"))){
			String resXml = TcpCont.buildInParam(MapUtils.getMap(resMap, "result"), getClass().getSimpleName()+"Res");
			returnMap = SoapUtil.xmlToMap(resXml);
			dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
		}else{
			returnMap = resMap;
			dataMap.setResultCode(MapUtils.getString(resMap, "resultCode"));
		}
		dataMap.setOutParam(returnMap);
	}
}

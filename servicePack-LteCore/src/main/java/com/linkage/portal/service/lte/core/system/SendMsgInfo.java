package com.linkage.portal.service.lte.core.system;



import java.util.HashMap;
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
import com.ailk.ecsp.util.DateUtil;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.SoapUtil;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.json.JacksonUtil;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.HexUtil;
import com.linkage.portal.service.lte.LteConstants;
import com.linkage.portal.service.lte.dto.TcpCont;

/**
 * 短信发送.
 * 
 */
public class SendMsgInfo extends Service {
	private final Logger log = LoggerFactory.getLogger(this.getClass());

	@SuppressWarnings("unchecked")
    @Override
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		try{
			String[] params = { "phoneNumber", "message", "key","areaId"};
			if (StringUtils.isNotBlank(dataMap.getAreaId())){
				dataMap.addInParam("areaId", dataMap.getAreaId());	
			}
			dataMap = DataMapUtil.checkParam(dataMap, params);
			if (StringUtils.isNotBlank(dataMap.getResultCode())) {
				return dataMap;
			}
			Map<String, Object> paramMap = new HashMap<String, Object>();
			Map<String, Object> returnMap = new HashMap<String, Object>();		
			String phoneNumber = MapUtils.getString(dataMap.getInParam(), "phoneNumber", "");
			String areaId = MapUtils.getString(dataMap.getInParam(), "areaId", "");
			String message = HexUtil.convertAsciiToHexString(String.valueOf(dataMap.getInParam("message")), "gbk");
			String MsgNumber = MapUtils.getString(dataMap.getInParam(), "MsgNumber", "");
			String key = null;

			if("5590".equals(MsgNumber)){
			//4位验证码+2位随机序列号
			 key = HexUtil.convertAsciiToHexString(String.valueOf("{\"Password\":"+"\""+ dataMap.getInParam("key")+"\""+","+"\"Number\":"+"\""+ dataMap.getInParam("randomCode"))+"\"}", "gbk");
			
			}else if("5011".equals(MsgNumber)){
			// 6位随机验证码
			 key = HexUtil.convertAsciiToHexString(String.valueOf("{\"Password\":"+"\""+ dataMap.getInParam("key"))+"\"}", "gbk");
			}
			String sendflag = MapUtils.getString(dataMap.getInParam(), "sendflag", "");
			paramMap.put("phoneNumber", phoneNumber);
			paramMap.put("message", message);
			paramMap.put("key", key);
			paramMap.put("areaId", areaId);
			paramMap.put("businessId", MsgNumber);
			paramMap.put("nowDate", DateUtil.nowDate(DateUtil.FMT_DATE));
			paramMap.put("nowDateTime", DateUtil.getFormatDate());
			paramMap.put("channelName", dataMap.getChannelName());
			paramMap.put("staffName", dataMap.getStaffName());
			String inXML = "";
			if(!"".equals(sendflag) && sendflag!=null){
				Map ma = new HashMap();
				ma.put("SrcSysID", "1000000200");
				paramMap.put("TcpCont", ma);
				inXML = TcpCont.parseTemplate(paramMap, "SendterMsgInfo");
			}else{
				inXML = TcpCont.parseTemplate(paramMap, getClass().getSimpleName());
			}
			if(StringUtils.isBlank(inXML)){
				return DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTF_PARAM_FAIL);
			}
			Map<String,Object> inMap = new HashMap<String,Object>();
	    	inMap.put("in0", inXML);
	    	String url = DataRepository.getInstence().getSysParamValue(LteConstants.CON_CSB_URL_KEY,SysConstant.CON_SYS_PARAM_GROUP_INTF_URL);
	    	WSConfig config = new WSConfig();	
			config.setUrl(url);//接口地址
			//config.setUrl("http://10.128.25.2:10101/LTE-CSB/services/DEPService?wsdl");//接口地址
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
		log.debug("dataMap:{}",JacksonUtil.getInstance().ObjectTojson(dataMap));
		return dataMap;
	}

}

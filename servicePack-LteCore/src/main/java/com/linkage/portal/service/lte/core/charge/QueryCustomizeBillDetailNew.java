package com.linkage.portal.service.lte.core.charge;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
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
import com.al.ecs.common.util.MapUtil;
import com.al.ecs.exception.ResultConstant;
import com.linkage.json.JacksonUtil;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.LteConstants;
import com.linkage.portal.service.lte.client.JsonUtil;
import com.linkage.portal.service.lte.dto.TcpCont;


/**
 * 查询详单.
 * @createDate 2015-02-5
 * @author huangsj
 */
public class QueryCustomizeBillDetailNew extends Service {

    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
    	
		String[] params = { "destinationId", "billingCycle", "billTypeCd", "queryFlag"};
		dataMap = DataMapUtil.checkParam(dataMap, params);
		if (StringUtils.isNotBlank(dataMap.getResultCode())) {
			return dataMap;
		}
        String billTypeCd = MapUtils.getString(dataMap.getInParam(), "billTypeCd");
        String templateName = "";
        String rspName = "";
        if ("1".equals(billTypeCd)){
        	//语音
        	templateName = "QueryVoiceInfoNew";
        	rspName = "VoiceUDRQueryRsp";
        }else if ("2".equals(billTypeCd)){
        	//短信
        	templateName = "QuerySmsInfoNew";
        	rspName = "SMSUDRQueryRsp";
        }else if ("3".equals(billTypeCd)){
        	//数据
        	templateName = "QueryDataInfoNew";
        	rspName = "DataUDRQueryRsp";
        }else if ("4".equals(billTypeCd)){
        	//增值
        	templateName = "QuerySpInfoNew";
        	rspName = "SPUDRQueryRsp";
        }
        String inXML = TcpCont.parseTemplate(dataMap.getInParam(), templateName);

        if (StringUtils.isBlank(inXML)) {
			return DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTF_PARAM_FAIL);
        }
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map<String, Object> inMap = new HashMap<String, Object>();
		List list = new ArrayList();
		Map mp = new HashMap();
		try{
            inMap.put("in0", inXML);
	    	String url = DataRepository.getInstence().getSysParamValue(LteConstants.CON_CSB_URL_KEY,SysConstant.CON_SYS_PARAM_GROUP_INTF_URL);
			WSConfig config = new WSConfig();
			config.setUrl(url);
			config.setMethodName("exchange"); //请求的接口名称
			config.setOutParamType(IConstant.CON_OUT_PARAM_TYPE_DOM_TEMPLATE);//输出参数格式
			config.setInParams(inMap);
			String dataXml = "";
			String count = "0";
			String totalRecords = "";
			String sumCharge ="";
			//BigDecimal sumCharge = new BigDecimal(0);
			Map<String, Object> resMap = WSClient.getInstance().callWS(config);
			//记录接口日志
			dataMap.put("inIntParam", inXML);
			dataMap.put("outIntParam", MapUtils.getString(resMap, "resultParam"));
			log.debug("dataMap:{}",JacksonUtil.getInstance().ObjectTojson(dataMap));
			try{
				Object dataO=MapUtil.path(resMap, "result/SvcCont/Service_Information").toString();
				if (dataO instanceof String){
					dataXml = (String)dataO;
				}
            }catch (Exception e) { 
    			e.printStackTrace();
    			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_RESP_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
    		}
			Map<String, Object> resMap1 = (Map<String, Object>) resMap.get("result");
			if (StringUtils.isNotBlank(dataXml)){
				Map<String, Object> resMap2 = (Map<String, Object>) resMap1.get("SvcCont");
				Map<String, Object> resMap3 = (Map<String, Object>) resMap2.get("Service_Information");
				//Document dom = DocumentHelper.parseText(dataXml);
				count = resMap3.get("TotalPage")==null?"0":(String) resMap3.get("TotalPage");
				if((String) resMap3.get("TotalCount")!=null){//仅当请求页是第一页时计费返回分页信息
					totalRecords = (String) resMap3.get("TotalCount");
				}
				if (Integer.valueOf(count) > 0){
					String fields = (String) resMap3.get("Field");
					String datas = (String) resMap3.get("Result_Data");
					fields = fields.substring(1, fields.lastIndexOf("]"));
					//datas = datas.substring(2, datas.lastIndexOf("]]"));
					String key[] = fields.split("\\]\\[");
					String data[] = datas.split(",");
					for (int k = 0 ; k < data.length ; k++){
						String value[] = data[k].split("\\^");
						Map map = new HashMap();
						for (int i = 0 ; i < key.length ; i++){
							String itemValue = "";
							if (i<value.length){
								itemValue = value[i].replaceAll("\\]|\\[", "");
							}
							map.put(key[i], itemValue);
//							if (key[i].equals("费用（元）")){
//								if (!StringUtils.isBlank(itemValue)){
//									sumCharge = sumCharge.add(new BigDecimal(itemValue));
//								}
//							}
						}
						list.add(map);
					}
				}
				String Total_Info = (String)resMap3.get("Total_Info");
				if(null!=Total_Info && !"".equals(Total_Info)){
					int index = Total_Info.indexOf(",");
					int feeindex = Total_Info.indexOf("FEE");
					if(feeindex > index){
						sumCharge = Total_Info.substring(feeindex+4, Total_Info.lastIndexOf("}"));
					}else {
						sumCharge = Total_Info.substring(feeindex+4, index);
					}
				}
			}

			if (ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(resMap, "resultCode"))){
				resMap = MapUtils.getMap(resMap, "result");
				resMap.put("list", list);
				resMap.put("totalRecords", totalRecords);
				resMap.put("count", count);
				resMap.put("sumCharge", sumCharge);
				String resXml = TcpCont.buildInParam(resMap, templateName+"Res");
				returnMap = SoapUtil.xmlToMap(resXml);
				dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
			}else{
				returnMap = resMap;
				dataMap.setResultCode(MapUtils.getString(resMap, "resultCode"));
			}
			dataMap.setOutParam(returnMap);
		}catch (Exception e) { 
			e.printStackTrace();
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION,ExceptionUtils.getFullStackTrace(e));
		}
		log.debug("dataMap:{}",JacksonUtil.getInstance().ObjectTojson(dataMap));
		return dataMap;
    }
}
       
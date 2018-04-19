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
import com.linkage.portal.service.lte.dto.TcpCont;


/**
 * 查询详单.
 * @createDate 2013-12-9
 * @author xuj
 */
public class QueryCustomizeBillDetail extends Service {

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
        	templateName = "QueryVoiceInfo";
        	rspName = "VoiceUDRQueryRsp";
        }else if ("2".equals(billTypeCd)){
        	//短信
        	templateName = "QuerySmsInfo";
        	rspName = "SMSUDRQueryRsp";
        }else if ("3".equals(billTypeCd)){
        	//数据
        	templateName = "QueryDataInfo";
        	rspName = "DataUDRQueryRsp";
        }else if ("4".equals(billTypeCd)){
        	//增值
        	templateName = "QuerySpInfo";
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
			BigDecimal sumCharge = new BigDecimal(0);
			Map<String, Object> resMap = WSClient.getInstance().callWS(config);
			//记录接口日志
			dataMap.put("inIntParam", inXML);
			dataMap.put("outIntParam", MapUtils.getString(resMap, "resultParam"));

			Object dataO=MapUtil.path(resMap, "result/SvcCont/"+rspName+"/DataTableSimpleRow");
			if (dataO instanceof String){
				dataXml = (String)dataO;
			}
			if (StringUtils.isNotBlank(dataXml)){
				Document dom = DocumentHelper.parseText(dataXml);
				count = dom.selectSingleNode("Respone/Respcount").getText().replaceAll("\\]|\\[", "");
				if(dom.selectSingleNode("Respone/TotalCount")!=null){//仅当请求页是第一页时计费返回分页信息
					totalRecords = dom.selectSingleNode("Respone/TotalCount").getText().replaceAll("\\]|\\[", "");
				}
				if (Integer.valueOf(count) > 0){
					String fields = dom.selectSingleNode("Respone/Field").getText();
					String datas = dom.selectSingleNode("Respone/Data").getText();
					fields = fields.substring(1, fields.lastIndexOf("]"));
					datas = datas.substring(2, datas.lastIndexOf("]]"));
					String key[] = fields.split("\\]\\[");
					String data[] = datas.split(",");
					for (int k = 0 ; k < data.length ; k++){
						String value[] = data[k].split("\\]\\[");
						Map map = new HashMap();
						for (int i = 0 ; i < key.length ; i++){
							String itemValue = "";
							if (i<value.length){
								itemValue = value[i].replaceAll("\\]|\\[", "");
							}
							map.put(key[i], itemValue);
							if (key[i].equals("费用(元)")){
								if (!StringUtils.isBlank(itemValue)){
									sumCharge = sumCharge.add(new BigDecimal(itemValue));
								}
							}
						}
						list.add(map);
					}
				}	
			}

			if (ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(resMap, "resultCode"))){
				resMap = MapUtils.getMap(resMap, "result");
				resMap.put("list", list);
				resMap.put("totalRecords", totalRecords);
				resMap.put("count", count);
				resMap.put("sumCharge", sumCharge.setScale(2, BigDecimal.ROUND_HALF_UP).toPlainString());
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

package com.linkage.portal.service.lte.core.system;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

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
import com.linkage.portal.service.lte.dto.TcpCont;
/**
 * 单点登录，验证登录。由门户调用，转发cbs下省验证登录。
 * @author dy
 *
 */
public class CheckLogin  extends Service {
    //private final Logger log = LoggerFactory.getLogger(this.getClass());
    @Override
    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
        try {
            String[] params = { "token" };
            dataMap = DataMapUtil.checkParam(dataMap, params);
            if("true".equals(dataMap.getInParam("lteflag"))){
            	dataMap.put("remark", dataMap.getInParam("token").toString());
            	Map rm = new HashMap();
            	rm.put("rexml", dataMap.getInParam("outparam").toString());
            	dataMap.setOutParam(rm);
            	return dataMap;
            }
            if (StringUtils.isNotBlank(dataMap.getResultCode())) {
                return dataMap;
            }
            String inXML = TcpCont.parseTemplate(dataMap.getInParam(), getClass()
                    .getSimpleName());
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
            config.setOutParamType(IConstant.CON_INTERFACE_RES_ROOT_NAME);
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
                //this.logDoCash(dataMap);
            }else{
                returnMap = resMap;
                dataMap.setResultCode(MapUtils.getString(resMap, "resultCode"));
                dataMap.setOutParam(returnMap);
            }
            
        } catch (Exception e) {
            DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION,e.getMessage());
            return dataMap;
        }
        dataMap.put("remark", dataMap.getInParam("token").toString());
        return dataMap;
    }
}

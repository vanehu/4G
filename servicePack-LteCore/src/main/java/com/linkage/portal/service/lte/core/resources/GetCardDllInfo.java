package com.linkage.portal.service.lte.core.resources;



import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.common.util.ObjectUtil;
import com.al.ecs.common.util.StringUtil;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.dao.SoWriteCardDAO;
import com.linkage.portal.service.lte.dao.SoWriteCardDAOImpl;


/**
 * 读卡服务，根据厂商编码获取读卡控制动态链接库信息
 * @author xuj
 */
public class GetCardDllInfo extends Service {

    //private final Logger log = LoggerFactory.getLogger(this.getClass());

    @Override
    public DataMap exec(DataMap dataBus, String serviceSerial) throws Exception {
        
        try {
            String fc = (String) dataBus.getInParam("factoryCode");
            
            SoWriteCardDAO swc = new SoWriteCardDAOImpl();
            Map<String, Object> map = new HashMap<String, Object>();
            Map<String, Object> retnMap = new HashMap<String, Object>();
            String dbKeyWord = MapUtils.getString(dataBus.getInParam(), IConstant.CON_DB_KEY_WORD);
            if (StringUtils.isBlank(dbKeyWord)){
                DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
            }
            map = swc.getCardDllInfo(fc);
            dataBus.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
            retnMap.put("code",ResultConstant.R_POR_SUCCESS.getCode());
            retnMap.put("cardDllInfo", ObjectUtil.transforKeyLowerCase(map));
            dataBus.setOutParam(retnMap);
            return dataBus;
        } catch (Exception e) {
            dataBus.setResultCode(ResultConstant.R_POR_FAIL.getCode());
            dataBus.setResultMsg(e.getMessage());
            //log.error("", e);
        }
        //log.debug("out dataBus:{}", JacksonUtil.getInstance().ObjectTojson(dataBus));
        return dataBus;
    }

}

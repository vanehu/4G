package com.linkage.portal.service.lte.core.system;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.common.util.StringUtil;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.linkage.json.JacksonUtil;
import com.linkage.portal.service.lte.dao.AreaDAO;
import com.linkage.portal.service.lte.dao.AreaDAOImpl;


/**
 * 根据查询子节点查询对应上级地区信息.
 * @createDate 2013-09-27
 * @author xuj
 */
public class QueryAreaTreeByParentAreaId extends Service {

	private final Log log = Log.getLog(this.getClass());

    public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
        try {
            List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
            List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();

            Map<String, Object> map = new HashMap<String, Object>();
            Map<String, Object> returnMap = new HashMap<String, Object>();
            AreaDAO areaDAO = new AreaDAOImpl();
            list = areaDAO.findChildArea(dataMap.getInParam());
            for (Map<String, Object> mp : list){
            	Map<String, Object> tmpMap = new HashMap<String, Object>();
                for (Entry<String, Object> entry: mp.entrySet()) {
                    String key = StringUtil.transforLowerCase(entry.getKey());
                    tmpMap.put(key, entry.getValue());
                }
                returnList.add(tmpMap);
            }


            dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
            map.put("areaTree", returnList);
            returnMap.put("result", map);
            returnMap.put("code", ResultConstant.R_POR_SUCCESS.getCode());
            dataMap.setOutParam(returnMap);
        } catch (Exception e) {
            dataMap.setResultCode(ResultConstant.R_POR_FAIL.getCode());
            dataMap.setResultMsg("地区数据提取异常");
            this.log.error("", e);
        }
        this.log.debug("--dataMap:{}", JacksonUtil.getInstance().ObjectTojson(dataMap));
        return dataMap;
    }

}

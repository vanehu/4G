package com.al.ecs.common.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.al.ecs.log.Log;

/**
 * object工具包，支持路径.
 * @author xuj
 */
public class ObjectUtil {

    private static Log log = Log.getLog(ObjectUtil.class);

    public static Map transforKeyLowerCase(Map<String, Object> map) {
    	Map<String, Object> rtMap = new HashMap<String, Object>();
        for (Entry<String, Object> entry: map.entrySet()) {
            String key = StringUtil.transforLowerCase(entry.getKey());
            rtMap.put(key, entry.getValue());
        }
		return rtMap;
    }
    
    public static List<Map<String, Object>> transforKeyLowerCase(List<Map<String, Object>> list) {
    	List<Map<String, Object>> rtList = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> map: list) {
        	rtList.add(transforKeyLowerCase(map));
        }
		return rtList;
    }
}

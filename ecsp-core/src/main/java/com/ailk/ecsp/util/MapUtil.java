package com.ailk.ecsp.util;

import java.util.List;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Map工具包，支持路径.
 * @author chylg
 */
public class MapUtil {

    private static Logger log = LoggerFactory.getLogger(MapUtil.class);

    public static String asStr(Map map, String key) {
        if (map == null || map.isEmpty() || StringUtils.isBlank(key)) {
            return "";
        }
        Object obj = map.get(key);
        return obj == null ? "" : obj.toString();
    }

    public static Object val(Map map, String key) {
        if (map == null || map.isEmpty() || StringUtils.isBlank(key)) {
            return null;
        }
        return map.get(key);
    }

    public static Map map(Map map, String key) {
        Object obj = val(map, key);
        if (obj instanceof Map) {
            return (Map) obj;
        }
        return null;
    }

    public static List list(Map map, String key) {
        Object obj = val(map, key);
        if (obj instanceof List) {
            return (List) obj;
        }
        return null;
    }

    public static Integer asInt(Map map, String key) {
        if (map == null || map.isEmpty() || StringUtils.isBlank(key)) {
            return null;
        }
        Object obj = map.get(key);
        try {
        	Double d = Double.parseDouble(obj.toString());
            return d.intValue();
        } catch (Exception e) {
            log.error("", e);
        }
        return null;
    }
    
    public static int asInt(Map map, String key,int defaultValue) {
        if (map == null || map.isEmpty() || StringUtils.isBlank(key)) {
            return defaultValue;
        }
        Object obj = map.get(key);
        try {
        	Double d = Double.parseDouble(obj.toString());
            return d.intValue();
        } catch (Exception e) {
            log.error("", e);
        }
        return defaultValue;
    }

    public static boolean copy(Map dest, Map src, String key) {
        if (dest == null || dest.isEmpty() || src == null || src.isEmpty() || StringUtils.isBlank(key)) {
            return false;
        }
        dest.put(key, val(src, key));
        return true;
    }

    /**
     * eg: key1/key2[i][j]/key3.
     *  map
     *  path
     * 
     *  chylg
     */
    public static Object path(Map map, String path) {
        if (map == null || map.isEmpty() || StringUtils.isBlank(path)) {
            return null;
        }
        if (path.startsWith("/")) {
            path = path.substring(1, path.length());
        }
        String[] keys = path.split("/");
        Object obj = map;
        int len = keys.length;
        for (int i = 0; i < len; i++) {
            if (isArrayKey(keys[i])) {
                obj = array((Map) obj, keys[i]);
            } else {
                obj = val((Map) obj, keys[i]);
            }
        }
        return obj;
    }

    private static boolean isArrayKey(String key) {
        if(StringUtils.isBlank(key)){
            return false;
        }
        if (key.endsWith("]")) {
            return true;
        }
        return false;
    }

    @SuppressWarnings("unchecked")
    private static Object array(Map map, String key) {
        if(map==null || map.isEmpty() || StringUtils.isBlank(key)){
            return null;
        }
        String[] keys = StringUtils.split(key, "][");
        int st = keys[0].indexOf("[");
        List lst = list(map, keys[0]);
        Object obj = null;
        int index = -1;
        int len = keys.length;
        for (int i = 1; i < len; i++) {
            index = Integer.parseInt(keys[i]);
            obj = lst.get(index);
            if (obj instanceof List) {
                lst = (List) obj;
            } else if (i == len - 1) {
                return obj;
            } else {
                return null;
            }
        }
        return obj;
    }

    public static String pathStr(Map map, String path) {
        Object obj = path(map, path);
        if (obj == null) {
            return "";
        }
        return obj.toString();
    }

}

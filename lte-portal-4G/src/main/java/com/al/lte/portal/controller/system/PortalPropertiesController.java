package com.al.lte.portal.controller.system;

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.controller.BaseController;
import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.lang.reflect.Field;
import java.util.Map;

/**
 * 配置文件控制器
 *
 * @author liuteng
 * @version V1.0 2016-03-04
 * @createDate 2016-03-04 11:29:45
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.system.PortalPropertiesController")
@RequestMapping("/properties/*")
public class PortalPropertiesController extends BaseController {
    @Autowired
    PropertiesUtils propertiesUtils;

    /**
     * 用于获取配置文件中某一个配置项
     *
     * @param param 配置项key
     * @return 配置项value
     */
    @RequestMapping(value = "/getValue", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getValue(@RequestBody Map<String, Object> param) {
        JsonResponse jsonResponse;
        try {
            String value = propertiesUtils.getMessage(MapUtils.getString(param, "key", ""));
            jsonResponse = super.successed(value, ResultConstant.SUCCESS.getCode());
        } catch (Exception e) {
            return super.failed("", ResultConstant.FAILD.getCode());
        }
        return jsonResponse;
    }

    /**
     * 用于获取MDA配置文件中某一个<const/>标签中的对象数据
     *
     * @param param 配置项key
     * @return 配置项Object
     */
    @RequestMapping(value = "/getObject", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getObject(@RequestBody Map<String, Object> param) {
        JsonResponse jsonResponse;
        try {
            String key = MapUtils.getString(param, "key", "");
            Object o = null;
            Field[] fields = MDA.class.getDeclaredFields();
            for (Field field : fields) {
                if (key.equals(field.getName())) {
                    try {
                        o = field.get(new MDA());
                    } catch (IllegalArgumentException e) {
                        e.printStackTrace();
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    }
                }
            }
            jsonResponse = super.successed(o, ResultConstant.SUCCESS.getCode());
        } catch (Exception e) {
            return super.failed("", ResultConstant.FAILD.getCode());
        }
        return jsonResponse;
    }
}

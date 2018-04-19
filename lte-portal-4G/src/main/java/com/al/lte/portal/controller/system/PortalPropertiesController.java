package com.al.lte.portal.controller.system;

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.Cert;
import com.al.lte.portal.model.SessionStaff;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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

    protected final Log log = Log.getLog(getClass());
    
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
        	if(MDA.SENSITIVE_KEYS.contains(MapUtils.getString(param, "key", ""))){
            	return super.failed("forbidden", ResultConstant.FAILD.getCode());
            }
            String value = propertiesUtils.getMessage(MapUtils.getString(param, "key", ""));
            jsonResponse = super.successed(value, ResultConstant.SUCCESS.getCode());
        } catch (Exception e) {
            return super.failed("", ResultConstant.FAILD.getCode());
        }
        return jsonResponse;
    }
    
    /**
     * 用于获取配置文件中某一个配置项
     */
    @RequestMapping(value = "/getMapValue", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getMapValue(@RequestBody Map<String, Object> param) {
        JsonResponse jsonResponse;
        try {
        	if(MDA.SENSITIVE_KEYS.contains(MapUtils.getString(param, "mapName", ""))){
            	return super.failed("forbidden", ResultConstant.FAILD.getCode());
            }
        	String mapName = (String) param.get("mapName");
        	String key = (String) param.get("key");
        	Map<String, Object> o = new HashMap<String, Object>();
            Field[] fields = MDA.class.getDeclaredFields();
            for (Field field : fields) {
                if (mapName.equals(field.getName())) {
                    try {
                        o = (Map<String, Object>) field.get(new MDA());
                    } catch (IllegalArgumentException e) {
                        e.printStackTrace();
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    }
                }
            }
           jsonResponse = super.successed(o.get(key), ResultConstant.SUCCESS.getCode());
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
            if(MDA.SENSITIVE_KEYS.contains(key)){
            	return super.failed("forbidden", ResultConstant.FAILD.getCode());
            }
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
    
    /**
     * 二代证读卡密钥更新服务，供外围调用
     * @param secretParam 加密参数(必须)
     * @param versionId	版本号(必须)
     * @param error 错误标识(unifyLogin)
     * @param response 加密报文
     */
    @RequestMapping(value = "/getCtrlSecret")
    public void getCtrlSecret(HttpServletRequest request, HttpServletResponse response) {
    	try {
    		//读卡相关请求全部统一转移到CertController
    		request.getRequestDispatcher("/cert/getCtrlSecret").forward(request, response);
		} catch (ServletException e) {
			log.error("转发cert/getCtrlSecret请求异常", e);
			response.setStatus(500);
    		return;
		} catch (IOException e) {
			log.error("转发cert/getCtrlSecret请求异常", e);
			response.setStatus(500);
    		return;
		}
    }
}

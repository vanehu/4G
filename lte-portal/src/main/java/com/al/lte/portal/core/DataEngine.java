package com.al.lte.portal.core;

import java.net.MalformedURLException;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.servlet.ServletContext;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.context.ServletContextAware;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.Compressor;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
@Component
@Lazy(value=false)
public class DataEngine implements ServletContextAware{
	
	private static Log log = Log.getLog(DataEngine.class);
	
    private ServletContext servletContext;
    @Autowired
	PropertiesUtils propertiesUtils;
    
	@PostConstruct
	public void contextInitialized() {
		//系统启动时强制刷新缓存参数
		Map<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("action", "REF_SYS");
		try {
            setAllCommonParam(servletContext.getResource("/").toString(), paramMap);
        } catch (MalformedURLException e) {
            log.error(e);
        }
		
		//设置全局APP_DESC， LTE为0，MVNO为1
		setAppDesc();
		
		//设置js缓存版本号
		setjsversion();
		
		//压缩JS文件
		compressFile();
	}
	
	
	private static Map<String, Object> getAllCommonParam(Map map){
		Map<String, Object> allCommonParam = new HashMap<String, Object>();
		DataBus db = null;
		try {
			db = ServiceClient.callService(map,
					 PortalServiceCode.GET_SYS_PARAM, "",
					 null);
			allCommonParam = MapUtils.getMap(db.getReturnlmap(), "result");
		} catch (Exception e) {
			log.error(e);
		}
		return allCommonParam;
	}
	
	public static void setAllCommonParam(String contextPath, Map<String, Object> paramMap){
		Map<String, Object> allCommonParam = getAllCommonParam(paramMap);
		if (MapUtils.isEmpty(allCommonParam)){
			DataRepository.getInstence().addAllParam("bootFlag","FALSE");
		}else{
			if (StringUtils.isNotBlank(contextPath) 
					&& contextPath.length() > 1
					&& allCommonParam.containsKey("url.biz." + contextPath.substring(1))) {
				allCommonParam.put("url.biz", allCommonParam.get("url.biz." + contextPath.substring(1)));
			}
//			if (contextPath.equals("/mvnoPortal")){
//				allCommonParam.remove("url.biz.ltePortal");
//			}else{
//				allCommonParam.remove("url.biz");
//				String value = MapUtils.getString(allCommonParam, "url.biz.ltePortal");
//				allCommonParam.put("url.biz", value);
//			}
			DataRepository.getInstence().setAllCommonParam(allCommonParam);
			DataRepository.getInstence().addAllParam("bootFlag","TRUE");
		}
		DataRepository.getInstence().addAllParam("contextPath",contextPath);
	}
	
	
	public static int resetAllCommonParam(){
		Map map = new HashMap();
		map.put("action", "REF");
		int result = 0;
		String bootFlag = "TRUE";
		Map<String, Object> allCommonParam = getAllCommonParam(map);
		if (MapUtils.isEmpty(allCommonParam)) {
			bootFlag = "FALSE";
			result = 1;
		}
		DataRepository.getInstence().setAllCommonParam(allCommonParam);
		DataRepository.getInstence().addAllParam("bootFlag", bootFlag);
		return result;
	}
	
	//清空发票模板组缓存，下一次获取模板时会重新请求服务层模板数据
	public static void resetTemplateList() {
		DataRepository.getInstence().clearTemplate();
	}
    public void setServletContext(ServletContext servletContext) {
        this.servletContext=servletContext;
    }

    public ServletContext getServletContext() {
        return servletContext;
    }
    
    public void setAppDesc() {
    	String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
    	String value = "";
    	if (SysConstant.APPDESC_LTE.equals(appDesc)) {
    		value = "0";
    	} else if (SysConstant.APPDESC_MVNO.equals(appDesc)) {
    		value = "1";
    	}
    	servletContext.setAttribute(SysConstant.APPDESC, value);
    }
    
    public void compressFile() {
    	String level = propertiesUtils.getMessage(SysConstant.COMPRESS_JS_LEVEL);
    	String baseVersion = propertiesUtils.getMessage(SysConstant.BASE_VERSION);
    	String busiVersion = propertiesUtils.getMessage(SysConstant.BUSI_VERSION);
    	if (SysConstant.LEVEL_BUSI.equals(level)) {
    		try {
    			int baseResult = Compressor.compressBaseJs(baseVersion);
    			if (baseResult == 0) {
    				servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BASE);
    			}
        		int busiResult = Compressor.compressBusiJs(busiVersion);
        		if (busiResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		servletContext.setAttribute(SysConstant.BASE_VERSION, baseVersion);
        		servletContext.setAttribute(SysConstant.BUSI_VERSION, busiVersion);
    		} catch (Exception e) {
    			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_NONE);
    		}
    		
    	} else if (SysConstant.LEVEL_BASE.equals(level)) {
    		try {
    			int baseResult = Compressor.compressBaseJs(baseVersion);
    			if (baseResult == 0) {
    				servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BASE);
    			}
        		servletContext.setAttribute(SysConstant.BASE_VERSION, baseVersion);
    		} catch (Exception e ) {
    			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_NONE);
    		}
    		
    	} else {
    		servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_NONE);
    	}
    }
    
    public void setjsversion() {
    	Calendar calendar = Calendar.getInstance();
    	String value = DateUtil.getFormatTimeString(calendar.getTime(), "yyyyMMddHHmm");
    	servletContext.setAttribute(SysConstant.JSVERSION, value);
    }
}

package com.al.lte.portal.core;

import java.net.MalformedURLException;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.annotation.PostConstruct;
import javax.servlet.ServletContext;

import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.xml.XmlBeanDefinitionReader;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.context.ServletContextAware;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.Compressor;
import com.al.lte.portal.common.FilterBaseData;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.RedisUtil;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.filter.GetCompressFileFilter;
@Component
@Lazy(value=false)
public class DataEngine implements ServletContextAware{
	
	private static Log log = Log.getLog(DataEngine.class);
	
	private static volatile boolean initComplete = false; //临时方案，原先启动时服务层会加载两次，判断只加载一次
	
    private static ServletContext servletContext;
    @Autowired
	PropertiesUtils propertiesUtils;
    
	@PostConstruct
	public void contextInitialized() {
		if(initComplete){
			return;
		}
		//系统启动时强制刷新缓存参数
		Map<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("action", addRefActionFromProperties("REF_SYS",true));
		//刷新多个数据源的配置数据
		paramMap.put("multiDataSource", "Y");
		paramMap.put("dbKeyWords", getRefDKeyWords());
		//TODO 启动时不加载所有配置数据
//		try {
//            setAllCommonParam(servletContext.getResource("/").toString(), paramMap);
//        } catch (MalformedURLException e) {
//            log.error(e);
//        }
		
		//设置全局APP_DESC， LTE为0，MVNO为1
		setAppDesc();
		
		//设置js缓存版本号
		setjsversion();
		
		//压缩JS文件
		compressFile();
		
		initComplete = true;
	}
	
	
	private static Map<String, HashMap<String,String>> getMultiCommonParam(Map map){
		Map<String, HashMap<String,String>> allCommonParam = new HashMap<String, HashMap<String,String>> ();
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
		Map<String, HashMap<String,String>> allCommonParam = getMultiCommonParam(paramMap);
		if (MapUtils.isEmpty(allCommonParam)){
			DataRepository.getInstence().addParam(DataSourceManager.DEFAULT_DATASOURCE_KEY,"bootFlag","FALSE");
		}else{
//			if (StringUtils.isNotBlank(contextPath) 
//					&& contextPath.length() > 1
//					&& allCommonParam.containsKey("url.biz." + contextPath.substring(1))) {
//				allCommonParam.put("url.biz", allCommonParam.get("url.biz." + contextPath.substring(1)));
//			}
			
			DataRepository.getInstence().setAllCommonParam(allCommonParam);
			DataRepository.getInstence().addParam(DataSourceManager.DEFAULT_DATASOURCE_KEY,"bootFlag","TRUE");
			resetFilterLevel();
			resetFilterWhiteList();
			resetRedisEnable();
			resetForbiddenFilterConfig();
		}
		DataRepository.getInstence().addParam(DataSourceManager.DEFAULT_DATASOURCE_KEY,"contextPath",contextPath);
	}
	
	
	public static int resetAllCommonParam(){
		Map map = new HashMap();
		map.put("action", addRefActionFromProperties("REF",true));
		//刷新多个数据源的配置数据
		map.put("multiDataSource", "Y");
		map.put("dbKeyWords", getRefDKeyWords());
		int result = 0;
		String bootFlag = "TRUE";
		Map<String, HashMap<String,String>> allCommonParam = getMultiCommonParam(map);
		if (MapUtils.isEmpty(allCommonParam)) {
			bootFlag = "FALSE";
			result = 1;
		}
		DataRepository.getInstence().setAllCommonParam(allCommonParam);
		DataRepository.getInstence().addParam(DataSourceManager.DEFAULT_DATASOURCE_KEY,"bootFlag", bootFlag);
		resetFilterLevel();
		resetFilterWhiteList();
		resetRedisEnable();
		resetForbiddenFilterConfig();
		return result;
	}
	
	public static int resetCommonParam(String dbKeyWord){
		if(dbKeyWord == null || dbKeyWord.trim().length() == 0){
			dbKeyWord = DataSourceManager.DEFAULT_DATASOURCE_KEY;
		}
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("action", addRefActionFromProperties("REF",true));
		//刷新多个数据源的配置数据
		map.put("multiDataSource", "Y");
		map.put("dbKeyWords", dbKeyWord);
		int result = 0;
		String bootFlag = "TRUE";
		Map<String, HashMap<String,String>> commonParam = getMultiCommonParam(map);
		if (MapUtils.isEmpty(commonParam)) {
			bootFlag = "FALSE";
			result = 1;
		} else {
			DataRepository.getInstence().setCommonParam(dbKeyWord, commonParam.get(dbKeyWord));
			resetProvConfig(dbKeyWord);
		}
		DataRepository.getInstence().addParam(dbKeyWord,"bootFlag", bootFlag);
		return result;
	}
	
	public static void resetjsversion(){
		GetCompressFileFilter.clearCompressFileMap(); //删除js压缩文件，在下次请求时重新生成
		setjsversion(); //重新设置js缓存版本号
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
    			//PC版本能力开放JS
    			int busiPCResult = Compressor.compressBusiPCJs(busiVersion);
        		if (busiPCResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		//APP版本能力开放JS
        		int busiAPPResult = Compressor.compressBusiAPPJs(busiVersion);
        		if (busiAPPResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		//APP版本能力开放主副卡变更独立压缩JS
        		int memAPPResult = Compressor.compressBusiAppMemJs(busiVersion);
        		if (memAPPResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		//APP版本能力开放主副卡变更独立压缩JS
        		int memAPPResult = Compressor.compressBusiAppMemJs(busiVersion);
        		if (memAPPResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		//PAD版本能力开放JS
        		int busiPADResult = Compressor.compressBusiPADJs(busiVersion);
        		if (busiPADResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		//APP版本能力开放第三方公共JS
        		int thirdAPPResult = Compressor.compressThirdJs(baseVersion);
        		if (thirdAPPResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BASE);
    			}
        		
        		int thirdPADResult = Compressor.compressThirdPADJs(baseVersion);
        		if (thirdPADResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BASE);
    			}
    			
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
    			int busiPCResult = Compressor.compressBusiPCJs(busiVersion);
        		if (busiPCResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		//APP版本能力开放JS
        		int busiAPPResult = Compressor.compressBusiAPPJs(busiVersion);
        		if (busiAPPResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		//APP版本能力开放主副卡变更独立压缩JS
        		int memAPPResult = Compressor.compressBusiAppMemJs(busiVersion);
        		if (memAPPResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		//APP版本能力开放主副卡变更独立压缩JS
        		int memAPPResult = Compressor.compressBusiAppMemJs(busiVersion);
        		if (memAPPResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		int busiPADResult = Compressor.compressBusiPADJs(busiVersion);
        		if (busiPADResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BUSI);
    			}
        		
        		//APP版本能力开放第三方公共JS
        		int thirdAPPResult = Compressor.compressThirdJs(baseVersion);
        		if (thirdAPPResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BASE);
    			}
        		
        		int thirdPADResult = Compressor.compressThirdPADJs(baseVersion);
        		if (thirdPADResult == 0) {
        			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BASE);
    			}
        		
    			int baseResult = Compressor.compressBaseJs(baseVersion);
    			if (baseResult == 0) {
    				servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_BASE);
    			}
    			
    			servletContext.setAttribute(SysConstant.BASE_VERSION, baseVersion);
        		servletContext.setAttribute(SysConstant.BUSI_VERSION, busiVersion);
    		} catch (Exception e ) {
    			servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_NONE);
    		}
    	} else {
    		servletContext.setAttribute(SysConstant.COMPRESS_JS_LEVEL, SysConstant.LEVEL_NONE);
    	}
    }
    
    public static void setjsversion() {
    	Calendar calendar = Calendar.getInstance();
    	String value = DateUtil.getFormatTimeString(calendar.getTime(), "yyyyMMddHHmmss");
    	servletContext.setAttribute(SysConstant.JSVERSION, value);
    }
    
    private static String addRefActionFromProperties(String action,boolean reloadProperties){
    	if(action == null){
    		action = "";
    	}
    	action += SysConstant.CON_REF_PARAM_ACTION_GROUP + getRefWriteLogConfig(reloadProperties);
    	return action;
    }
    
    //获取dbKeyWords参数
    private static String getRefDKeyWords(){
    	String dbKeyWords = "";
    	try {
    		DataSourceManager dataSourceManager = null;
    		//没有加载bean则手动加载
    		if(SpringContextUtil.getApplicationContext() != null && (DataSourceManager) SpringContextUtil.getBean("dataSourceManager") != null){
    			dataSourceManager = (DataSourceManager) SpringContextUtil.getBean("dataSourceManager");
    		} else {
    			DefaultListableBeanFactory reg = new DefaultListableBeanFactory();
    			XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(reg);
    			reader.loadBeanDefinitions(new ClassPathResource("spring/portal-configed-datasource.xml"));
    			dataSourceManager = (DataSourceManager) reg.getBean("dataSourceManager");
    		}
    		if(dataSourceManager != null){
    			dbKeyWords = dataSourceManager.getDbKeyWords();
    		}
		} catch (Exception e) {
			e.printStackTrace();
		}
    	return dbKeyWords;
    }
    
    
    public static String getRefWriteLogConfig(boolean reloadProperties) {
    	try {
    		String writeLogFlag = null;
    		if(!reloadProperties){
    			PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
    			writeLogFlag= propertiesUtils.getMessage(SysConstant.WRITE_LOG_FLAG);
    		} else {
    			Properties properties = MySimulateData.getProperties("/portal/portal.properties");
    			writeLogFlag = properties.getProperty(SysConstant.WRITE_LOG_FLAG);
    		}
    		if (SysConstant.OFF.equals(writeLogFlag)) {
    			return "REF_LOG_OFF";
    		} else {
    			return "REF_LOG_ON";
    		}
		} catch (Exception e) {
			log.error(e);
		}
    	return "";
    }
    
    private static void resetProvConfig(String dbKeyWord){
    	//重新设置过滤器的过滤级别
    	String level = DataRepository.getInstence().getCommonParam(dbKeyWord, SysConstant.PORTAL_FILTER_LEVEL);
		if((level+"").matches("\\d")){
			FilterBaseData.getInstance().setFilterLevel(dbKeyWord, Integer.parseInt(level));
		}
		
    	Map<String, HashMap<String,String>> allCommonParam = DataRepository.getInstence().getAllCommonParam();
    	if(allCommonParam != null){
    		//重新设置敏感信息过滤器的白名单
    		Set<String> whiteList = new HashSet<String>();
			for(String key : allCommonParam.get(dbKeyWord).keySet()){
    			if(key != null && key.startsWith(SysConstant.PORTAL_SENSITIVE_INFO_FILTER_WHITE_LIST)){
    				whiteList.add(allCommonParam.get(dbKeyWord).get(key));
    			}
    		}
    		FilterBaseData.getInstance().setSensitiveInfoFilterWhiteList(dbKeyWord, whiteList);
    		
    		
    		//重新设置redis功能开关
			RedisUtil.setEnableByDbRouter(dbKeyWord, "Y".equals(DataRepository.getInstence().getCommonParam(dbKeyWord, SysConstant.ONE_USER_ONE_LOGIN)));
			
			//重新设置屏蔽关键字过滤器配置数据
			String forKeyStr = DataRepository.getInstence().getCommonParam(dbKeyWord, SysConstant.FORBIDDEN_VALUE_KEYWORD);
			Set<String> forKeys = new HashSet<String>();
			if(forKeyStr != null){
				for(String forKey : forKeyStr.split(SysConstant.FORBIDDEN_VALUE_KEYWORD_SEP)){
					forKeys.add(forKey.toLowerCase());
				}
			}
			FilterBaseData.getInstance().setForbiddenKeyWords(dbKeyWord, forKeys);
    	}
    }
    
    //重新设置过滤器的过滤级别
    private static void resetFilterLevel(){
    	Map<String, HashMap<String,String>> allCommonParam = DataRepository.getInstence().getAllCommonParam();
    	if(allCommonParam != null){
    		Map<String,Integer> filterLevels = new HashMap<String, Integer>();
    		for(String dbKeyWord : allCommonParam.keySet()){
    			String level = DataRepository.getInstence().getCommonParam(dbKeyWord, SysConstant.PORTAL_FILTER_LEVEL);
    			if((level+"").matches("\\d")){
    				filterLevels.put(dbKeyWord, Integer.parseInt(level));
    			}
    		}
    		FilterBaseData.getInstance().setFilterLevels(filterLevels);
    	}
    }
    
    //重新设置敏感信息过滤器的白名单
    private static void resetFilterWhiteList(){
    	Map<String, HashMap<String,String>> allCommonParam = DataRepository.getInstence().getAllCommonParam();
    	if(allCommonParam != null){
    		Map<String, Set<String>> sensitiveInfoFilterWhiteLists = new HashMap<String, Set<String>>();
    		Set<String> whiteList = new HashSet<String>();
    		
    		for(String dbKeyWord : allCommonParam.keySet()){
    			for(String key : allCommonParam.get(dbKeyWord).keySet()){
        			if(key != null && key.startsWith(SysConstant.PORTAL_SENSITIVE_INFO_FILTER_WHITE_LIST)){
        				whiteList.add(allCommonParam.get(dbKeyWord).get(key));
        			}
        		}
    			sensitiveInfoFilterWhiteLists.put(dbKeyWord, whiteList);
    		}
    		FilterBaseData.getInstance().setAllSensitiveInfoFilterWhiteList(sensitiveInfoFilterWhiteLists);
    	}
    }
    
    //重新设置redis功能开关
    private static void resetRedisEnable(){
    	Map<String, HashMap<String,String>> allCommonParam = DataRepository.getInstence().getAllCommonParam();
    	if(allCommonParam != null){
    		Map<String,Boolean> enableByDbRouter = new HashMap<String, Boolean>();
    		for(String dbKeyWord : allCommonParam.keySet()){
    			if ("Y".equals(DataRepository.getInstence().getCommonParam(dbKeyWord, SysConstant.ONE_USER_ONE_LOGIN))) {
    				enableByDbRouter.put(dbKeyWord, true);
    			} else {
    				enableByDbRouter.put(dbKeyWord, false);
    			}
    			RedisUtil.setEnableByDbRouter(enableByDbRouter);
    		}
    	}
    }
    
    //重新设置屏蔽关键字过滤器配置数据
	private static void resetForbiddenFilterConfig(){
		Map<String, HashMap<String,String>> allCommonParam = DataRepository.getInstence().getAllCommonParam();
		if(allCommonParam != null){
			Map<String, Set<String>> forbiddenMap = new HashMap<String, Set<String>>();
			for(String dbKeyWord : allCommonParam.keySet()){
				String forKeyStr = DataRepository.getInstence().getCommonParam(dbKeyWord, SysConstant.FORBIDDEN_VALUE_KEYWORD);
				Set<String> forKeys = new HashSet<String>();
				if(forKeyStr != null){
					for(String forKey : forKeyStr.split(SysConstant.FORBIDDEN_VALUE_KEYWORD_SEP)){
						forKeys.add(forKey.toLowerCase());
					}
				}
				forbiddenMap.put(dbKeyWord, forKeys);
			}
			FilterBaseData.getInstance().setAllForbiddenKeyWords(forbiddenMap);
		}
	}
    
}

package com.al.lte.portal.common;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.log.Log;
import com.al.lte.portal.bmo.portal.AuthUrlBmo;

/**
 * 存储UrlFilter基础数据
 * @author jinjian
 *
 */
public class FilterBaseData {

	private static Log log = Log.getLog(FilterBaseData.class);
	private static FilterBaseData filterBaseData = null;
	private static Object lock = new Object();
	private ConcurrentHashMap<String, Set<String>> provAuthUrlMap = null; //需要鉴权的地址列表，每个省一个
	public static final String DEFAULT_LOAD_AUTH_PROV = "8110000"; //默认加载的省份:北京
	private Map<String, Set<String>> sensitiveInfoFilterWhiteLists = null;  //门户敏感信息过滤器,地址白名单
	private Map<String, Set<String>> forbiddenKeyWords = null;
	
	 /** 过滤级别，0：不过滤 */
    public static final int FILTER_LEVEL_NONE = 0;
    /** 过滤级别，1：登录后员工必须有渠道 ，默认的级别*/
	public static final int FILTER_LEVEL_CHANNEL = 1; 
	/** 过滤级别，2：替换提交到服务器端的敏感信息（staffId，staffCode等） */
	public static final int FILTER_LEVEL_SENSITIVE_INFO = 2;
	/** 过滤级别，3：对需要鉴权的访问地址进行鉴权 */
	public static final int FILTER_LEVEL_AUTH_URL = 3; 
	/** 过滤级别，4：屏蔽报文（value）中包含已配置关键字的访问 */
	public static final int FILTER_LEVEL_FORBIDDEN_KEY_WORD = 4;
	/** 默认过滤级别，1：登录后员工必须有渠道 */
	public static final int DEFALUT_FILTER_LEVEL = FILTER_LEVEL_CHANNEL;
	
	private Map<String,Integer> filterLevels = null;
	
	private AuthUrlBmo authUrlBmo;
	
	public static FilterBaseData getInstance(){
		if(filterBaseData == null){
			synchronized(lock){
				if(filterBaseData == null){
					filterBaseData = new FilterBaseData();
				}
			}
		}
		return filterBaseData;
	}
	
	private FilterBaseData(){
		provAuthUrlMap = new ConcurrentHashMap<String, Set<String>>(32);
		sensitiveInfoFilterWhiteLists = new HashMap<String, Set<String>>();
		filterLevels = new HashMap<String, Integer>();
		forbiddenKeyWords = new HashMap<String, Set<String>>();
	}
	
	public AuthUrlBmo getAuthUrlBmo() {
		if(authUrlBmo == null){
			authUrlBmo = (AuthUrlBmo) SpringContextUtil.getBean("com.al.lte.portal.bmo.portal.AuthUrlBmo");
		}
		return authUrlBmo;
	}

	/**
	 * 获取指定省份的鉴权url列表，如果未包含该省的配置则加载
	 * @param provId 7位数字，以0000结尾
	 * @return
	 */
	public Set<String> getProvAuthUrl(String provId){
		if(provId != null && provId.matches("\\d{7}")){
			provId = provId.substring(0, 3) + "0000";
			addProvAuthUrlIfNotExist(provId);
			return provAuthUrlMap.get(provId);
		}
		return null;
	}
	
	/**
	 * 获取默认省份的鉴权url列表
	 * @return
	 */
	public Set<String> getDefaultProvAuthUrl(){
		return getProvAuthUrl(DEFAULT_LOAD_AUTH_PROV);
	}
	
	private void addProvAuthUrlIfNotExist(String provId){
		if(!provAuthUrlMap.containsKey(provId)){
			addProvAuthUrl(provId);
		}
	}
	
	private boolean addProvAuthUrl(String provId){
		try {
			Map<String, Object> param = new HashMap<String,Object>();
			param.put("areaId", provId);
			param.put("platformId", SysConstant.PLATFORM_ID_TO_SYS);
			log.debug("addProvAuthUrl inParam:{}", param);
			List<String> resultMap = getAuthUrlBmo().queryAuthUrlList(param, null, null);
			log.debug("addProvAuthUrl outParam:{}", resultMap);
			if(resultMap != null){
				Set<String> urls = new HashSet<String>();
				for(String url : resultMap){
					urls.add(url);
				}
				provAuthUrlMap.put(provId, urls);
				return true;
			}
		} catch (Exception e) {
			log.error(e);
		}
		return false;
	}

	public Set<String> getSensitiveInfoFilterWhiteList(String dbKeyWord) {
		if(dbKeyWord != null){
			return sensitiveInfoFilterWhiteLists.get(dbKeyWord);
		}
		return null;
	}

	public void setAllSensitiveInfoFilterWhiteList(
			Map<String, Set<String>> sensitiveInfoFilterWhiteList) {
		this.sensitiveInfoFilterWhiteLists = sensitiveInfoFilterWhiteList;
	}
	
	public void setSensitiveInfoFilterWhiteList(String key, Set<String> sensitiveInfoFilterWhiteList) {
		if(sensitiveInfoFilterWhiteLists != null){
			sensitiveInfoFilterWhiteLists.put(key, sensitiveInfoFilterWhiteList);
		}
	}

	public Set<String> getForbiddenKeyWords(String dbKeyWord) {
		if(dbKeyWord != null){
			return forbiddenKeyWords.get(dbKeyWord);
		}
		return null;
	}

	public void setAllForbiddenKeyWords(Map<String, Set<String>> forbiddenKeyWords) {
		this.forbiddenKeyWords = forbiddenKeyWords;
	}
	
	public void setForbiddenKeyWords(String key, Set<String> forbiddenKeyWords) {
		if(this.forbiddenKeyWords != null){
			this.forbiddenKeyWords.put(key, forbiddenKeyWords);
		}
	}

	public Map<String, Integer> getFilterLevels() {
		return filterLevels;
	}

	public void setFilterLevels(Map<String, Integer> filterLevels) {
		this.filterLevels = filterLevels;
	}
	
	public void setFilterLevel(String key, Integer filterLevel) {
		if(this.filterLevels != null){
			this.filterLevels.put(key, filterLevel);
		}
	}

	public int getFilterLevel(String dbKeyWord) {
		if(filterLevels.containsKey(dbKeyWord)){
			return filterLevels.get(dbKeyWord);
		} else {
			return DEFALUT_FILTER_LEVEL;
		}
//		String level = DataRepository.getInstence().getCommonParam(dbKeyWord, SysConstant.PORTAL_FILTER_LEVEL);
//		if((level + "").matches("\\d")){
//			return Integer.parseInt(level);
//		}
//		return FILTER_LEVEL_CHANNEL;
	}

	public boolean isFilterNone(String dbKeyWord) {
		return getFilterLevel(dbKeyWord) == FILTER_LEVEL_NONE;
	}
	
	public boolean isFilterChannel(String dbKeyWord){
		return getFilterLevel(dbKeyWord) >= FILTER_LEVEL_CHANNEL;
	}
	
	public boolean isFilterSensitiveInfo(String dbKeyWord){
		return getFilterLevel(dbKeyWord) >= FILTER_LEVEL_SENSITIVE_INFO;
	}
	
	public boolean isFilterAuthUrl(String dbKeyWord){
		return getFilterLevel(dbKeyWord) >= FILTER_LEVEL_AUTH_URL;
	}
	
	public boolean isFilterForbiddenKeyWord(String dbKeyWord){
		return getFilterLevel(dbKeyWord) >= FILTER_LEVEL_FORBIDDEN_KEY_WORD;
	}
	
	/**
	 * 清除鉴权地址列表，下次请求时重新加载
	 */
	public void clearAuthUrlMap(){
		provAuthUrlMap.clear();
	}
	
}

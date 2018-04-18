package com.al.lte.portal.common;

import java.util.HashMap;
import java.util.Map;

import org.jfree.util.Log;

import com.al.crm.nosql.cache.ICache;
import com.al.ecs.common.web.SpringContextUtil;

public class RedisUtil {
	/** redis客户端（直接连接方式，或代理连接方式） */
	private static ICache redisCache;
	/** 存入redis缓存的超时时间，单位：秒 */
	private static int expireTime = 8 * 60 * 60;
	/** redis功能开关,保存不同数据源的开关配置 */
	private static Map<String,Boolean> enableByDbRouter = new HashMap<String, Boolean>();
	/** redis客户端是否初始化完成 */
	private static boolean initComplete;
	/** 默认功能开关设置，关闭 */
	private static final boolean DEFAULT_ENABLE = false;
	
	private static ICache getRedisInstance(){
		if(!initComplete && redisCache == null){
			try {
				redisCache = (ICache) SpringContextUtil.getBean("cacheClient");
			} catch (Exception e) {
				disableRedisFunction(); //获取spring实例异常时关闭redis功能
				Log.error(e);
			}
			initComplete = true;  //只加载一次
		}
		return redisCache;
	}
	
	public static String get(String dbKeyWord,String key) {
		if(isEnable(dbKeyWord) && getRedisInstance() != null){
			try {
				return (String) redisCache.get(getPortalKey(key));
			} catch (Exception e) {
				Log.error(e);
			}
		}
		return null;
	}
	public static Object get(String key) {
		if(getRedisInstance() != null){
			try {
				return redisCache.get(getPortalKey(key));
			} catch (Exception e) {
				Log.error(e);
			}
		}
		return null;
	}
	public static void set(String dbKeyWord,String key, String value) {
		if(isEnable(dbKeyWord) && getRedisInstance() != null){
			try {
				redisCache.put(getPortalKey(key), value, expireTime);
			} catch (Exception e) {
				Log.error(e);
			}
		}
	}
	public static void set(String key, Object value) {
		if(getRedisInstance() != null){
			try {
				redisCache.put(getPortalKey(key), value, expireTime);
			} catch (Exception e) {
				Log.error(e);
			}
		}
	}
	public static boolean remove(String dbKeyWord,String key) {
		if(isEnable(dbKeyWord) && getRedisInstance() != null){
			try {
				return redisCache.remove(getPortalKey(key));
			} catch (Exception e) {
				Log.error(e);
			}
		}
		return false;
	}
	public static boolean remove(String key) {
		if(getRedisInstance() != null){
			try {
				return redisCache.remove(getPortalKey(key));
			} catch (Exception e) {
				Log.error(e);
			}
		}
		return false;
	}
	/**
	 * 获取含平台编码的key
	 * 
	 * @param key
	 * @return 包含平台编码key
	 */
	private static String getPortalKey(String key) {
		return PortalServiceCode.SERVICE_PORTAL_CODE + "-" + key.toUpperCase();
	}
	
	public static Map<String, Boolean> getEnableByDbRouter() {
		return enableByDbRouter;
	}

	public static void setEnableByDbRouter(Map<String, Boolean> enableByDbRouter) {
		RedisUtil.enableByDbRouter = enableByDbRouter;
	}
	
	public static void setEnableByDbRouter(String key, Boolean enable) {
		if(RedisUtil.enableByDbRouter != null){
			RedisUtil.enableByDbRouter.put(key, enable);
		}
	}

	public static boolean isEnable(String dbKeyWord) {
		if(enableByDbRouter.containsKey(dbKeyWord)){
			return enableByDbRouter.get(dbKeyWord);
		}
		return DEFAULT_ENABLE;
	}
	
	public static void disableRedisFunction(){
		if(enableByDbRouter != null){
			for(String key : enableByDbRouter.keySet()){
				enableByDbRouter.put(key, false);
			}
		}
	}
	
	public static int getExpireTime() {
		return expireTime;
	}

	public static void setExpireTime(int expireTime) {
		RedisUtil.expireTime = expireTime;
	}

}

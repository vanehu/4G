package com.al.ecs.common.util;

import java.util.Locale;

import org.springframework.context.NoSuchMessageException;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

import com.al.ecs.log.Log;

/**
 * properties 属性文件值读取
 * <P>
 * 该属性文件可以配置多个，在　portalAll-spring.xml　文件 <BR>
 * bean id="sysPropertiesMessage".... 配置属性文件
 * <P>
 * 
 * @author tang zhengyu
 * @version V1.0 2011-5-6
 * @CreateDate 2011-5-6 上午12:08:38
 * @ModifyDate tang 2011-5-6
 * @CopyRight 亚信联创电信CRM部
 */
public class PropertiesUtils {
	Log log = Log.getLog(PropertiesUtils.class);
	/** bean name: messageSource */
	private ReloadableResourceBundleMessageSource message;

	public void setMessage(ReloadableResourceBundleMessageSource message) {
		this.message = message;
	}
	
	public void clear() {
		this.message.clearCache();
	}

	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @param args
	 *            按顺序替换的参数 sample:${0}代表被第一个参数替换
	 * @param locale
	 *            国际化
	 * @return String
	 */
	public String getMessage(String code, Object[] args, Locale locale) {
		try {
			return message.getMessage(code, args, locale);
		} catch (NoSuchMessageException e) {
			log.error("properties key不存在", e);
			return null;
		}
	}

	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @param args
	 *            按顺序替换的参数 sample:${0}代表被第一个参数替换
	 * @return String
	 */
	public String getMessage(String code, Object[] args) {
		try {
			return message.getMessage(code, args, null);
		} catch (NoSuchMessageException e) {
			log.error("properties key不存在", e);
			return null;
		}
	}

	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @return String
	 */
	public String getMessage(String code) {
		try {
			return message.getMessage(code, null, null);
		} catch (NoSuchMessageException e) {
			//把ERROR级别改为INFO级别,忽略未配置的键值对
			// 20140403 ignore this exception
			//log.info("properties key不存在("+code+")", e);
			return null;
		}
	}
	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @return String
	 */
	public int getMessageAsInt(String code) {
		String msg=getMessage(code);
		if(msg!=null){
			return Integer.parseInt(msg);
		}
		return 0;
	}
	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @return String
	 */
	public long getMessageAsLong(String code) {
		String msg=getMessage(code);
		if(msg!=null){
			return Long.parseLong(msg);
		}
		return 0;
	}
	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @param locale
	 *            国际化
	 * @return String
	 */
	public String getMessage(String code, Locale locale) {
		try {
			return message.getMessage(code, null, locale);
		} catch (NoSuchMessageException e) {
			log.error("properties key不存在", e);
			return null;
		}
	}

	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @param args
	 *            按顺序替换的参数 sample:${0}代表被第一个参数替换
	 * @param defaultMessage
	 *            找不到key,默认的值
	 * @param locale
	 *            国际化
	 * @return String
	 */
	public String getMessage(String code, Object[] args, String defaultMessage,
			Locale locale) {
		try {
			return message.getMessage(code, args, defaultMessage, locale);
		} catch (NoSuchMessageException e) {
			log.error("properties key不存在", e);
			return null;
		}
	}

	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @param args
	 *            按顺序替换的参数 sample:${0}代表被第一个参数替换
	 * @param defaultMessage
	 *            找不到key,默认的值
	 * @return String
	 */
	public String getMessage(String code, Object[] args, String defaultMessage) {
		try {
			return message.getMessage(code, args, defaultMessage, null);
		} catch (NoSuchMessageException e) {
			log.error("properties key不存在", e);
			return null;
		}
	}

	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @param defaultMessage
	 *            找不到key,默认的值
	 * @return String
	 */
	public String getMessage(String code, String defaultMessage) {
		try {
			return message.getMessage(code, null, defaultMessage, null);
		} catch (NoSuchMessageException e) {
			log.error("properties key不存在", e);
			return null;
		}
	}

	/**
	 * 获取properties key 对应的值
	 * 
	 * @param code
	 *            key
	 * @param defaultMessage
	 *            找不到key,默认的值
	 * @param locale
	 *            国际化
	 * @return String
	 */
	public String getMessage(String code, String defaultMessage, Locale locale) {
		try {
			return message.getMessage(code, null, defaultMessage, locale);
		} catch (NoSuchMessageException e) {
			log.error("properties key不存在", e);
			return null;
		}
	}
}

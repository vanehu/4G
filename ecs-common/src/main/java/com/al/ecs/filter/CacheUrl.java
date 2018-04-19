package com.al.ecs.filter;

import java.io.Serializable;

/**
 * TODO 类 概述 .
 * <BR>
 *  <cache>
 * 		<url pattern="/css/**" cache="yes"   contenType=""  excludedCodes="" desc="" maxAge=10/>
 * </cache>
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-7-10
 * @createDate 2012-7-10 上午11:39:47
 * @modifyDate tang zheng yu 2012-7-10 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class CacheUrl  implements Serializable {
	/**
	 * url，支持正则表达式
	 */
	private String pattern;
	/**
	 * 是否缓存
	 */
	private boolean cache=false;
	/**
	 * 缓存时间，单位秒
	 */
	private long maxAge =0;

	/**
	 * 该路径下，返回哪些文档类型需要操作
	 */
	private String contentType="";
	/**
	 * 返回哪些编码不需要缓存
	 */
	private String exculdedCodes;
	
	public String getPattern() {
		return pattern;
	}
	public void setPattern(String pattern) {
		this.pattern = pattern;
	}
	public boolean isCache() {
		return cache;
	}
	public void setCache(boolean cache) {
		this.cache = cache;
	}
	public String getContentType() {
		return contentType;
	}
	public void setContentType(String contentType) {
		this.contentType = contentType;
	}
	public String getExculdedCodes() {
		return exculdedCodes;
	}
	public void setExculdedCodes(String exculdedCodes) {
		this.exculdedCodes = exculdedCodes;
	}

	public long getMaxAge() {
		return maxAge;
	}
	public void setMaxAge(long maxAge) {
		this.maxAge = maxAge;
	}
}

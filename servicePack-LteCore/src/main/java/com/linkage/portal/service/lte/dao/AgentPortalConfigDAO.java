package com.linkage.portal.service.lte.dao;

import java.util.List;
import java.util.Map;

/**所有DAO统一加上keyWord用来支持分库
 * AgentPortalConfig配置 .
 * <P>
 * @author lianld
 * @version V1.0 2012-6-26
 * @createDate 2012-6-26 下午5:21:40
 * @modifyDate	 lianld 2012-6-26 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public interface AgentPortalConfigDAO{
	/**
	 * 查询配置信息
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public List query(Map param,String dbKeyWord)  throws Exception;
	
	/**
	 * 查询配置匹配信息
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public int queryCountByParam(Map param,String dbKeyWord) throws Exception;
	
	/**
	 * 根据参数绑定渠道和外网IP关系
	 * @param param
	 * @throws Exception
	 */
	public void insert(Map param) throws Exception;
	
}

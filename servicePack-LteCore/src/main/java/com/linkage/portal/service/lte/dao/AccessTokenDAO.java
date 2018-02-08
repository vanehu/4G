package com.linkage.portal.service.lte.dao;

import java.util.List;
import java.util.Map;

import com.linkage.portal.service.lte.core.resources.model.AccessToken;

public interface AccessTokenDAO {
    
    /**
     * 令牌信息入库
     * @param accessToken
     * @throws Exception 
     */
	public int insertAccessToken(AccessToken accessToken) throws Exception;
	
	/**
	 * 获取令牌信息
	 * @param param
	 * @return
	 */
	public List<Map<String, Object>> getAccessTokenList(Map<String,Object> param);
	
	/**
	 * 获取令牌信息
	 * @param param
	 * @return
	 */
	public List<Map<String, Object>> queryAccessToken(Map<String,Object> param);
	
	/**
	 * 历史令牌信息入库
	 * @param tokenId
	 * @throws Exception 
	 */
	public void insertAccessTokenOld(long tokenId) throws Exception;
	
	/**
	 * 删除令牌信息
	 * @param tokenId
	 * @throws Exception 
	 */
	public int deleteAccessToken(long tokenId) throws Exception;
  
}

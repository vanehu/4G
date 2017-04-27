package com.al.lte.portal.bmo.crm;

import java.util.Map;
import com.al.lte.portal.model.SessionStaff;

public interface TokenBmo {
	/**
	 * 生成令牌
	 * @param paramMap
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public Map<String, Object> getAppToken(Map<String,Object> paramMap,String flowNum,SessionStaff sessionStaff);
	
	/**
	 *  查询令牌信息
	 * @param paramMap
	 * @param flowNum
	 * @param sessionStaff
	 * @return
	 */
	public Map<String, Object> QueryAccessToken(Map<String,Object> paramMap,String flowNum,SessionStaff sessionStaff);
}
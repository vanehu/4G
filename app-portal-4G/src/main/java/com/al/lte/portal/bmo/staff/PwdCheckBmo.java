package com.al.lte.portal.bmo.staff;

import java.util.Map;

import com.al.lte.portal.model.SessionStaff;

/**
 * 密码检查是否需要修改
 * <P>
 * 
 * @author gongr
 * @version V1.0 2013-03-06
 * @copyRight 亚信联创电信ECS电子渠道
 */
public interface PwdCheckBmo {
	/**
	 * 返回用户登录成功次数
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public int queryLoginSuccessCount(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	/**
	 * 返回用户是否需要进行密码修改
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public int queryStaffPwdUpdate(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
}

package com.al.lte.portal.bmo.staff;

import java.io.IOException;
import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 用户受理渠道 .
 * <P>
 * 
 * @author bianxw
 * @version V1.0 2012-8-17
 * @createDate 2012-8-17 下午13:53:52
 * @modifyDate bianxw 2012-8-17 bianxw 2012-8-17 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public interface StaffChannelBmo {
	
	public Map<String, Object> qryChannelByStaff(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	public Map<String, Object> qryCurrentChannelByStaff(SessionStaff staff,String defaultId) throws Exception;
	
	/**
	 * 根据条件查询渠道列表(目前用于受理单查询页面的渠道查询)
	 * @param dataBusMap
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return 渠道列表
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException 
	 * @createDate 2015-7-30
	 */
	public Map<String, Object> qryChannelListByCond(Map dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception;
	
	
}

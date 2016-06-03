package com.al.lte.portal.bmo.staff;

import java.util.List;
import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.lte.portal.model.SessionStaff;

/**
 * 员工登录 .
 * <P>
 * 
 * @author lianld
 * @version V1.0 2012-4-17
 * @createDate 2012-4-17 下午13:53:52
 * @modifyDate lianld 2012-4-17 liusd 2012-5-25 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public interface StaffBmo {
	Map<String, Object> loginCheck(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	Map<String, Object> sendMsgInfo(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;
	
	Map<String,Object> updateStaffStatus(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;
	
	public Map<String, Object> queryStaffList(Map<String, Object> dataBusMap, String optFlowNum,
            SessionStaff sessionStaff) throws Exception;
	
	public Map<String, Object> updateStaffPwd(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;
	
	Map<String,Object> queryCTGMainData(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
    throws Exception;
	
	public String checkAuthority(String authorityCode,SessionStaff sessionStaff) throws Exception;
	
	public String checkOperatSpec(String operatSpecCd,SessionStaff sessionStaff) throws Exception;
	
	public List<Map<String, Object>> areaTreeAllQuery(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception ;

	Map queryStaffByStaffCode4Login(String staffCode, String commonRegionId) throws Exception;
			
	
	public void loginInlog(Long time, String optFlowNum, SessionStaff sessionStaff,String padVersion);
	
	public void loginOutlog(String optFlowNum, SessionStaff sessionStaff);
	
	public void userSearchbtn(String locateDate , String optFlowNum, SessionStaff sessionStaff);
	
	public void insert_sp_busi_run_log(Map<String, Object> logmap,String flowNum,SessionStaff sessionStaff) throws Exception;

	public  String cacheClear(String url);

	public Map<String, Object> checkIsAccessByStaffId(Map<String, Object> dataBusMap,SessionStaff sessionStaff) throws Exception;

	public void lockUser(Map<String, Object> paramMap, String string,SessionStaff sessionStaff)throws Exception;

	public String checkByAreaId(String ydbhk, SessionStaff sessionStaff)throws Exception;
	
	/**
	 * 根据权限编码(opsManageCode)和员工ID(staffId)查询工号是否有权限
	 * @param operatSpecCd
	 * @param sessionStaff
	 * @return
	 * @throws BusinessException
	 */
	public String checkOperatBySpecCd(String operatSpecCd, SessionStaff sessionStaff) throws BusinessException;
	
}

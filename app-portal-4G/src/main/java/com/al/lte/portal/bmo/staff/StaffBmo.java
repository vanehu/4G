package com.al.lte.portal.bmo.staff;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
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
	
	Map<String, Object> sendMessageCommonService(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
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
	
	Map queryStaffByStaffCode4Login(String staffCode, String commonRegionId,String session) throws Exception;		
	
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
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException 
	 */
	public String checkOperatBySpecCd(String operatSpecCd, SessionStaff sessionStaff) throws BusinessException, InterfaceException, IOException, Exception;
	
	public Map<String, Object> qrLoginCheck(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff) throws Exception;
	
	/**
	 * 二维码登录绑定
	 * @param paramMap
	 * @param string
	 * @param sessionStaff
	 * @throws Exception
	 */
	public Map<String, Object> bindQrCode(Map<String, Object> paramMap, String string,SessionStaff sessionStaff)throws Exception;

	/**
	 * 查询某权限下的员工列表
	 * @param operatSpecCd 权限编码 <br>若入参中不指定具体的权限编码，则默认根据SysConstant.RXSH权限进行查询
	 * @param sessionStaff
	 * @return 员工列表List
	 * @throws InterfaceException
	 * @throws IOException
	 * @throws BusinessException
	 */
	public Map<String, Object> qryOperateSpecStaffList(String operatSpecCd, SessionStaff sessionStaff) throws InterfaceException, IOException, BusinessException, Exception;

	public Map<String, Object> checkStaffMessage(Map<String, Object> dataBusMap, String optFlowNum, SessionStaff sessionStaff)
			throws Exception;

	public  Map<String, Object> updatePassword(Map<String, Object> param,  String optFlowNum, SessionStaff sessionStaff)throws Exception;
	
}

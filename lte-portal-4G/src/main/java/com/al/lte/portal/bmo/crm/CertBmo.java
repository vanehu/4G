package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.model.SessionStaff;

public interface CertBmo {

	/**
	 * 读卡客户信息记录（后台记录完整读卡数据）
	 * @param param
	 * @param sessionStaff
	 * @return
	 * @throws InterfaceException
	 * @throws IOException
	 * @throws Exception
	 */
	public Map<String, Object> recordCertReaderCustInfos(Map<String, Object> param, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception;
	
	/**
	 * 是否读卡成功
	 * @param param
	 * @return 读卡信息不为空返回true，若任一项为空返回false
	 */
	public boolean isReadCertSucess(Map<String, Object> param);
	
	/**
	 * 读身份证插入日志
	 * @param param
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	public void insertCertInfo(Map<String, Object> param, String flowNum,SessionStaff sessionStaff);
	
	/**
	 * USB二代证读卡校验
	 * @param param
	 * @param request
	 * @param sessionStaff
	 * @return
	 */
	public Map<String, Object> certReaderVerify(Map<String, Object> param, HttpServletRequest request, SessionStaff sessionStaff);
	
	/**
	 * 校验读卡是否被绕过
	 * @param queryCustParam
	 * @param request
	 * @param queryType 区分：客户定位、经办人查询、使用人查询等
	 * @return
	 */
	public Map<String, Object> isReadCertBypassed(Map<String, Object> queryCustParam, HttpServletRequest request, String queryType);
}

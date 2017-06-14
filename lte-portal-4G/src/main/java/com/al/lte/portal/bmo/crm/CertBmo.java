package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.util.Map;

import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.model.SessionStaff;

public interface CertBmo {

	/**
	 * 读卡客户信息记录（记录完整读卡数据）
	 * @param param
	 * @param sessionStaff
	 * @return
	 * @throws InterfaceException
	 * @throws IOException
	 * @throws Exception
	 */
	public Map<String, Object> recordCertReaderCustInfos(Map<String, Object> param, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception;
	
}

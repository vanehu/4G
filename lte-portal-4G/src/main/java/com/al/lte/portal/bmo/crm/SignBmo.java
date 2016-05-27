package com.al.lte.portal.bmo.crm;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.al.lte.portal.model.SessionStaff;

/**
 * 数字签名服务接口
 */
public interface SignBmo {
	public Map<String, Object> querySignInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff) throws Exception;

	public Map<String,Object> setPrintInfos(Map<String, Object> resultMap, 
			HttpServletRequest request, Map<String, Object> paramMap)
			throws Exception;

	public void commonPdfPrint(String flag, Map<String, Object> paramMap,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception;
}

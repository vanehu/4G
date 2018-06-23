package com.al.lte.portal.bmo.portal;

import java.util.List;
import java.util.Map;

import com.al.lte.portal.model.SessionStaff;

public interface AuthUrlBmo {

	/**
	 * 查询需要鉴权的url列表
	 * @param map
	 * @param optFlowNum
	 * @param sessionStaff
	 * @return
	 * @throws Exception
	 */
	List<String> queryAuthUrlList(Map<String, Object> map, String optFlowNum, SessionStaff sessionStaff)
            throws Exception;
}

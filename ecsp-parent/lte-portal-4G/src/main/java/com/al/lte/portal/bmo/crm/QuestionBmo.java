package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.lte.portal.model.SessionStaff;

/**
 * 用户满意度调查问卷统一接口
 * 
 * @author ynhuang
 * @date 2017-07-07
 * @version 1.0v
 */
public interface QuestionBmo {

	// 问卷调查员工查询接口
	public Map<String, Object> queryStaff(Map<String, Object> param, SessionStaff sessionStaff) throws Exception;

	// 问卷调查题目查询接口
	public Map<String, Object> queryTerm(Map<String, Object> param) throws Exception;

	// 问卷结果回写接口
	public Map<String, Object> return_result(Map<String, Object> param, SessionStaff sessionStaff) throws Exception;

}

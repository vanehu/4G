package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.lte.portal.model.SessionStaff;
/**
 * 一证五号 相关接口
 * @author wangdan6
 *
 */
public interface CmBmo {

	//查询一证五号数据
	public  Map<String, Object> queryRepairList(
			Map<String, Object> param, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;
	
	//查询一证五号关系数据
	public  Map<String, Object> queryCertNumRelList(
				Map<String, Object> param, String optFlowNum,
				SessionStaff sessionStaff) throws Exception;
    //查询省里列表
	public  Map<String, Object> queryProvUserList(
			Map<String, Object> param, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;

	//修复一证五号数据
	public  Map<String, Object> updateUserInfo(
			Map<String, Object> param, String optFlowNum,
			SessionStaff sessionStaff) throws Exception;

}
package com.al.lte.portal.bmo.crm;

import java.util.Map;

import com.al.lte.portal.model.SessionStaff;

public interface RepairBmo {

	//查询一证五号数据
	public  Map<String, Object> queryRepairList(
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
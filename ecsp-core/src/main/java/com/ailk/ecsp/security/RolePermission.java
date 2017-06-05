package com.ailk.ecsp.security;

import java.util.List;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.exception.BaseSecurityException;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.service.Service;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;


/**
 * =========================================================
 * 亚信联创 电信CRM研发部
 * 于2012-1-9重构by陈源龙
 * @author 李茂君
 * @date 2011-4-22 下午04:39:08
 * @Description: TODO(角色安全校验)
 * @version V1.0
 * =========================================================
 * update date                update author     Description
 * 2011-4-22                    李茂君                               创建文件
 */
public class RolePermission implements Permission {


	public void validate(DataMap dataMap) throws BaseSecurityException {
		
		String resultcode;
		String resultmsg;
		String resultname;
		
		ServiceRole rm = DataRepository.getInstence().getRole(dataMap.getRoleCode());
		if (null == rm) {
			resultcode = ResultCode.R_SERV_NO_COMPETENCE;
			resultname = "角色不存在";
			resultmsg = "角色不存在";
			throw new BaseSecurityException(resultcode,resultname,resultmsg);
		}
		
		if (!Service.STATUS_NORMAL.equals(rm.getStatus())) {
			resultcode = ResultCode.R_SERV_NO_COMPETENCE;
			resultname = "角色不可用";
			resultmsg = "请确认当前角色状态可用";
			throw new BaseSecurityException(resultcode,resultname,resultmsg);
		}
		
		List<String> list = DataRepository.getInstence().getRoleToService(dataMap.getRoleCode());
		if (null != list && list.size() >=1 ) {
			if (!list.contains(dataMap.getServiceCode())) {
				resultcode = ResultCode.R_SERV_NO_COMPETENCE;
				resultname = "无服务使用权限";
				resultmsg = "当前角色没有该服务的使用权限";
				throw new BaseSecurityException(resultcode,resultname,resultmsg);
			}
		}else {
			resultcode = ResultCode.R_SERV_NO_COMPETENCE;
			resultname = "角色对应服务列表不存在";
			resultmsg = "请确认当前角色有可用服务";
			throw new BaseSecurityException(resultcode,resultname,resultmsg);
		}
	}

}

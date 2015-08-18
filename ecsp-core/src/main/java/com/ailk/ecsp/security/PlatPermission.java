package com.ailk.ecsp.security;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.exception.BaseSecurityException;
import com.ailk.ecsp.mybatis.model.Portal;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ec.serviceplatform.client.ResultCode;


public class PlatPermission implements Permission {

	public void validate(DataMap dataMap) throws BaseSecurityException{
		
		
		String resultcode;
		String resultmsg;
		String resultname;
		Portal pm =  DataRepository.getInstence().getPortal(dataMap.getPortalCode());
		if (null == pm) {
			resultcode = ResultCode.R_PORTAL_NO_REGIST;
			resultname = "门户未注册";
			resultmsg = "找不到该门户信息，请确认该门户已在本平台注册";
			throw new BaseSecurityException(resultcode,resultname,resultmsg);
			
		}else{
			if (SysConstant.PORTAL_STATUS_A.equals(pm.getStatus())) {
				if (!pm.getPassword().equals(dataMap.getPassword())) {
					resultcode = ResultCode.R_PORTAL_PWD_WRONG;
					resultname = "门户密码错误";
					resultmsg = "密码校验失败，请确认该密码输入正确";
					throw new BaseSecurityException(resultcode,resultname,resultmsg);
				}
			}else {
				resultcode = ResultCode.R_PORTAL_PAUSE;
				resultname = "门户不可用";
				resultmsg = "当前门户不能使用，请确认当前门户状态可用";
				throw new BaseSecurityException(resultcode,resultname,resultmsg);
			}
		}
	}

}

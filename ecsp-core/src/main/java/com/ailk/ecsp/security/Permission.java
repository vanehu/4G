package com.ailk.ecsp.security;

import com.ailk.ecsp.exception.BaseSecurityException;
import com.al.ec.serviceplatform.client.DataMap;

/**
 * =========================================================
 * 亚信联创 电信CRM研发部
 * @author CancerJun
 * @date 2011-4-22 下午04:40:37
 * @Description: TODO(安全校验管理接口，所有安全校验类需实现这个接口)
 * @version V1.0
 * =========================================================
 * update date                update author     Description
 * 2011-4-22                    CancerJun           创建文件
 */
public interface Permission {

	public void validate(DataMap dataMap) throws BaseSecurityException;
	
}

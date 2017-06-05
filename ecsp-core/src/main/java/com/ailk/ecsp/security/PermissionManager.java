package com.ailk.ecsp.security;

import java.util.ArrayList;
import java.util.List;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.exception.BaseSecurityException;
import com.al.ec.serviceplatform.client.DataMap;


public class PermissionManager {
	
	private List<Permission> permissionList;
	
	public PermissionManager(){
		permissionList = new ArrayList<Permission>();
	}
	
	
	public List<Permission> getPermissionList() {
		return permissionList;
	}

	public void setPermissionList(List<Permission> permissionList) {
		this.permissionList = permissionList;
	}
	
	public void addPermission(Permission permission) {
		permissionList.add(permission);
	}

	/**
	 * 安全权限校验
	 */
	public void checkPermission(DataMap dataMap) throws BaseSecurityException {
		String check = DataRepository.getInstence().getWebParam().getCheckPermission();
		if("yes".equalsIgnoreCase(check) || "y".equalsIgnoreCase(check)){
			for(int i=0; i<permissionList.size(); i++) {
				permissionList.get(i).validate(dataMap);
			}
		}
	}
	
}

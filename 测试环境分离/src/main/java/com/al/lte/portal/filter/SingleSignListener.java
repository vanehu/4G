
package com.al.lte.portal.filter;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.apache.commons.lang.StringUtils;

import com.al.lte.portal.common.MySessionInterceptor;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.model.SessionStaff;
/**
 * 单点登录session监听，当本地session注销后，将本地保存的用户登录标记清除。
 * @author 戴瑜
 *
 */
public class SingleSignListener implements HttpSessionListener {
	public static final String SINGLE_SING_USER_TOKEN="_single_sign_user_token";

	/* (non-Javadoc)
	 * @see javax.servlet.http.HttpSessionListener#sessionCreated(javax.servlet.http.HttpSessionEvent)
	 */
	public void sessionCreated(HttpSessionEvent se) {
	}

	/* (non-Javadoc)
	 * @see javax.servlet.http.HttpSessionListener#sessionDestroyed(javax.servlet.http.HttpSessionEvent)
	 */
	public void sessionDestroyed(HttpSessionEvent se) {
		String token=(String) se.getSession().getAttribute(SINGLE_SING_USER_TOKEN);
		if(StringUtils.isNotBlank(token)){
			SessionStaff sessionStaff=new SessionStaff();
			sessionStaff=(SessionStaff)MySessionInterceptor.checkToken(token);
			SessionStaff sessionStaffTmp=new SessionStaff();
			sessionStaffTmp.setAreaId(sessionStaff.getAreaId());
			Map dataBusMap = new HashMap();
			dataBusMap.put("TOKEN", token);
			dataBusMap.put("FLAG", "update");
			ServiceClient.callService(dataBusMap, PortalServiceCode.INSERT_LOGINSESSION, null, sessionStaffTmp);
			MySessionInterceptor.removeToken(token);
		}
	}
}

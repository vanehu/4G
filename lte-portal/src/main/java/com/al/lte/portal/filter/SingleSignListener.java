
package com.al.lte.portal.filter;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import com.al.lte.portal.common.MySessionInterceptor;
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
		MySessionInterceptor.removeToken((String) se.getSession().getAttribute(SINGLE_SING_USER_TOKEN));
	}
}

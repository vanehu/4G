package com.al.lte.portal.common;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DelCookie {
	
	public static void delCookie(HttpServletResponse response, String key, String domain, String path,
            HttpServletRequest request) {
        Cookie[] cooks = request.getCookies();
        //为NULL
        if (cooks == null) {
            return;
        }
        for (int i = 0; i < cooks.length; i++) {
            Cookie cook = cooks[i];
            String name = cook.getName()==null?"":cook.getName();	
            String nameU = name.toUpperCase();
            if(nameU.indexOf(key)>=0) {
                cook.setMaxAge(0);
                if (domain != null) {
                    cook.setDomain(domain);
                }
                if (path != null) {
                    cook.setPath(path);
                }
                response.addCookie(cook);
            }
        }
    }

}

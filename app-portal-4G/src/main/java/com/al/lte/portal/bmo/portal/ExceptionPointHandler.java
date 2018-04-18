package com.al.lte.portal.bmo.portal;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.servlet.ThemeResolver;


import com.al.ecs.spring.exception.ExceptionPoint;
import com.al.lte.portal.common.PortalUtils;

/**
 * TODO 类 概述 .
 * <BR>
 *  TODO 要点概述.
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-9-27
 * @createDate 2012-9-27 下午8:40:49
 * @modifyDate tang zheng yu 2012-9-27 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class ExceptionPointHandler implements ExceptionPoint{
	 @Autowired  
	 @Qualifier("themeResolver")
	  private ThemeResolver themeResolver;
	 
	public Map<String, Object> before(HttpServletRequest request, HttpServletResponse response,
			Object handler, Exception ex) {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		String theme=themeResolver.resolveThemeName(request);
		PortalUtils.getTheme(request,theme);
		if(theme==null || PortalUtils.THEME_DEFAULT.equals(theme) ){
			returnMap.put("theme", ""); 
		}else{
			returnMap.put("theme", "_pc"); 
		}
		return returnMap;
	}

}

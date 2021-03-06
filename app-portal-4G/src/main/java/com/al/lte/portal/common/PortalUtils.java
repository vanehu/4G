package com.al.lte.portal.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.springframework.web.util.WebUtils;

import com.al.ecs.log.Log;

/**
 * TODO 类 概述 .
 * <BR>
 *  TODO 要点概述.
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-9-24
 * @createDate 2012-9-24 上午10:01:09
 * @modifyDate tang zheng yu 2012-9-24 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class PortalUtils {
    protected static  Log log=Log.getLog(PortalUtils.class);
	 /** 默认主题 */
    public static final String THEME_DEFAULT = "default";
    /** pc主题 */
    public static final String THEME_PC = "pc";
    /** 主题列表 */
    public static final List<String> THEME_LIST = new ArrayList<String>();
    /** 模板列表 */
    public static final Map<String,String> TPL_MAP = new HashMap<String,String>();
    static {
    	THEME_LIST.add(THEME_DEFAULT);
    	THEME_LIST.add(THEME_PC);
    }
    static {
    	TPL_MAP.put("/main-home.html",THEME_DEFAULT);
    	TPL_MAP.put("/main-template.html",THEME_DEFAULT);
    	TPL_MAP.put("/main-pc-template.html","pc");
    }
    
	public static final String THEME_SESSION_ATTRIBUTE_NAME = PortalUtils.class.getName() + ".THEME";

	/**
	 * forwad 跳转路径到不同步皮肤下
	 * <P>
	 * 根据cookie 和session来加载主题,
	 * 先判断session，再判断cookie，若session有,则以session为主
	 * <P>
	 * @param path 以/开头的路径
	 * @return String themeName+path
	 */
	 public static String forwardToTheme(String path,HttpServletRequest request,String cookietheme){
		String theme=(String)WebUtils.getSessionAttribute(request, THEME_SESSION_ATTRIBUTE_NAME);
		//session有值，以session为主
		if(StringUtils.isNotEmpty(theme)){
			if(THEME_DEFAULT.equals(theme) || !THEME_LIST.contains(theme)){
				return path; 
			}else{
				return new StringBuffer("/").append(theme).append(path).toString();
			}
		}
		theme=cookietheme;
		if(theme==null || THEME_DEFAULT.equals(theme) || !THEME_LIST.contains(theme)){
			return path;
		}else{
			return new StringBuffer("/").append(theme).append(path).toString();
		}
	}
	 
	 public static String getTheme(HttpServletRequest request,String cookietheme){
		String theme=(String)WebUtils.getSessionAttribute(request, THEME_SESSION_ATTRIBUTE_NAME);
		//session有值，以session为主
		if(StringUtils.isNotEmpty(theme)){
			if(THEME_DEFAULT.equals(theme) || !THEME_LIST.contains(theme)){
				return THEME_DEFAULT; 
			}else{
				return theme;
			}
		}
		theme=cookietheme;
		if(theme==null || THEME_DEFAULT.equals(theme) || !THEME_LIST.contains(theme)){
			return THEME_DEFAULT;
		}else{
			return theme;
		}
	}
	 /**
	  * 获取操作系统类型
	  * 目前支持WINDOWS,LINUX,HP-UX,AIX,MAC,SOLARIS
	  * @return
	  * @see
	  */
	 public static String getOSName(){
	     Properties prop = System.getProperties();
	     String os = StringUtils.defaultIfBlank(prop.getProperty("os.name"), "");
	     if (os.startsWith("Windows"))
	         return "WINDOWS";
	     else if(os.startsWith("Linux"))
	         return "LINUX";
	     else if(os.startsWith("HP-UX"))
	         return "HP-UX";
	     else if(os.startsWith("AIX"))
	         return "AIX";
	     else if(os.startsWith("Solaris"))
	         return "SOLARIS";
	     else if(os.startsWith("Mac"))
	         return "MAC";
	     else if(os.startsWith("SunOS"))
	         return "SUNOS";
	     else
	         return "UNKNOW";
	 }
	 
	 /**
	 * 判断是否启用分省域名</br>
	 * @author ZhangYu
	 * @param headerHost http request header请求头里的域名属性，测试或本地可以使用HOST属性，生产建议使用X-Forwarded-Host属性
	 * @return <strong>true</strong>:分省域名(二级域名*.crm.189.cn:93/94)<br/>
	 * 		   <strong>false</strong>:非二级域名形式
	 */
	public static boolean isSecondLevelDomain(String headerHost) {
		boolean flag = false;
		if (headerHost != null) {
			try {
				String port = headerHost.substring(headerHost.indexOf(":") + 1, headerHost.length());
				if (("93".equals(port) || "94".equals(port)) && (headerHost.indexOf("crm") > -1)) {
					flag = true;
				}
			} catch (IndexOutOfBoundsException e) {
				log.error("isSecondLevelDomain判断二级域名发生异常[headerHost : " + headerHost + "]", e);
				flag = false;
			}
		}
		return flag;
	}
}

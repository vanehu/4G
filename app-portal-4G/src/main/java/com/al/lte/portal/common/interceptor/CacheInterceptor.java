package com.al.lte.portal.common.interceptor;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.log.Log;
import com.al.lte.portal.core.DataEngine;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.core.DataSourceManager;

public class CacheInterceptor extends HandlerInterceptorAdapter {
	
	private Log log = Log.getLog(CacheInterceptor.class);
	
	
	@Resource(name = "com.al.lte.portal.core.DataEngine")
	private DataEngine dataEngine;

	@SuppressWarnings("static-access")
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
	    throws Exception {
		/*Map<String, HashMap<String, String>> allCommonParam = DataRepository.getInstence().getAllCommonParam();
		if (MapUtils.isEmpty(allCommonParam) || "FALSE".equals(DataRepository.getInstence().getCommonParam(DataSourceManager.DEFAULT_DATASOURCE_KEY, "bootFlag"))) {
			//系统启动时强制刷新缓存参数
			Map<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("action", dataEngine.addRefActionFromProperties("REF_SYS",true));
			//刷新多个数据源的配置数据
			paramMap.put("multiDataSource", "Y");
			paramMap.put("dbKeyWords", dataEngine.getRefDKeyWords());
			try {
				dataEngine.setAllCommonParam(request.getSession().getServletContext().getResource("/").toString(), paramMap);
	        } catch (MalformedURLException e) {
	            log.error("拦截器加载缓存失败",e);
	        }
		}*/
		
		return true;
	}


	/**
	 * This implementation is empty.
	 */
	public void postHandle(
			HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView)
			throws Exception {
	}

	/**
	 * This implementation is empty.
	 */
	public void afterCompletion(
			HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
				
	}
	
	@SuppressWarnings({ "rawtypes", "unused" })
	private String getURL(HttpServletRequest request) {
		String path = request.getContextPath();
		String nowUrl = request.getServletPath();
		String basePath = (new StringBuilder(
				String.valueOf(request.getScheme()))).append("://")
				.append(request.getServerName()).append(":")
				.append(request.getServerPort()).append(path).append(nowUrl)
				.toString();
		StringBuilder strb = new StringBuilder();
		Map requestMap = request.getParameterMap();
		if (!requestMap.isEmpty()) {
			strb.append("?");
			String key;
			String[] value;
			Iterator it;
			for (it = requestMap.keySet().iterator(); it.hasNext();) {
				key = (String) it.next();
				value = (String[]) requestMap.get(key);
				strb.append((new StringBuilder(String.valueOf(key)))
						.append("=").append(value[0]).append("&").toString());
			}
			basePath = (new StringBuilder(String.valueOf(basePath))).append(
					strb.toString()).toString();
		}
		return basePath;
	}
	
	public boolean filterSuff(String url) {
		String[] aryFilter = { ".jpg", ".gif", ".swf", ".pdf", ".png", ".txt" };
		boolean flag = false;
		for (int i = 0; i < aryFilter.length; i++) {
			if (url.indexOf(aryFilter[i]) != -1) {
				flag = true;
				return flag;
			}
		}
		return flag;
	}
	
	public void addHeadInfo(HttpServletResponse response){
		ServletUtils.setNoCacheHeader(response);		 
	}
	
	public boolean dealInterceptor(HttpServletRequest request, HttpServletResponse response,String resultCode){
		try{
			String requestType = request.getHeader("X-Requested-With");
			if("XMLHttpRequest".equals(requestType)){
				try {
					 PrintWriter pw = response.getWriter();
					 response.setCharacterEncoding("UTF-8");
				     response.setContentType("text/html;charset=UTF-8");
				     Map<String,Object> resultMap = new HashMap<String,Object>();
				     resultMap.put("resultCode", resultCode);
				     resultMap.put("resultMsg", getErrorMsg(resultCode));					
				     pw.print(JsonUtil.toString(resultMap));
				     pw.flush();
					 pw.close();						
				} catch (IOException e) {
					log.error("拦截失败:",e);					
				}
				 return false;
			}else{
				addHeadInfo(response);
				String redirectPath = request.getContextPath() + "/accessToken/error?flag=" + resultCode;
				log.error("如果被拦截，则转向：" + redirectPath);
				response.sendRedirect(redirectPath);
				return false;			
			}
		}catch(Exception ex){
			log.error("处理拦截信息异常",ex);
			return false;
		}			
	}
	
	public static String getErrorMsg(String code){
		int errorCode = Integer.parseInt(code);
		String errorMsg = "";
		switch (errorCode) {
		case 1:
			errorMsg = "会话失效,请重试获取。";
			break;
		case 2:
			errorMsg = "工号信息不一致。";
			break;
		case 3:
			errorMsg = "令牌失效。";
			break;
		case 4:
			errorMsg = "令牌丢失。";
			break;
		default:
			errorMsg = "无权限访问该模块。";
		}
		return errorMsg;		
	}
}

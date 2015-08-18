package com.al.lte.portal.common.interceptor;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.TokenBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.staff.StaffChannelBmo;
import com.al.lte.portal.bmo.system.MenuBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.CommonUtils;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.RedisUtil;
import com.al.lte.portal.common.StringUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

public class AuthorityInterceptor extends HandlerInterceptorAdapter {
	
		private Log log = Log.getLog(AuthorityInterceptor.class);
		
		@Resource(name = "com.al.lte.portal.bmo.crm.TokenBmoImpl")
		private TokenBmo tokenBmo;	
		
		@Autowired
		@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
		private StaffBmo staffBmo;
		
		@Autowired
		@Qualifier("com.al.lte.portal.bmo.staff.StaffChannelBmo")
		private StaffChannelBmo staffChannelBmo;
		
		@Autowired
		@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
		private OfferBmo offerBmo;
		
		@Autowired
		PropertiesUtils propertiesUtils;
		
		@Autowired
		@Qualifier("com.al.lte.portal.bmo.system.MenuBmo")
		private MenuBmo menuBmo;
	
		public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
		    throws Exception {
			
			String url = getURL(request);
			String accessTokenSub = request.getParameter("accessToken");//获取到的凭证		
			HttpSession session = request.getSession(true);
			//4G暂存单标识
			String saveOrderFlag = (String) session.getAttribute("saveOrder");
			if(saveOrderFlag!=null && !"null".equals(saveOrderFlag) && saveOrderFlag!="" && "true".equals(saveOrderFlag)){
				return true;
			}
			
			SessionStaff sessionStaff = (SessionStaff) session.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
			//首先判断是否存在session
			log.error("请求地址：" + url);
			String accessToken="";
			if(!StringUtils.isBlank(accessTokenSub) || sessionStaff==null || StringUtils.isBlank(sessionStaff.getAccessToken()) || "null".equals(sessionStaff.getAccessToken())){
				//如果session令牌丢失，执行以下代码
				if(StringUtil.isEmptyStr(accessTokenSub)){					
					session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
					return dealInterceptor(request,response,"4");
				}
				
				String tokenKey = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(request,SysConstant.SESSION_DATASOURCE_KEY),"token.key");//令牌key
				log.error("令牌key："+tokenKey);
				String jmAccessToken = AESUtils.decryptToString(accessTokenSub, tokenKey);
				if(StringUtil.isEmptyStr(jmAccessToken)){				
					session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
					return dealInterceptor(request,response,"4");
				}
				String[] accessTokenStr = jmAccessToken.split("#");
				if(accessTokenStr.length != 3){
					session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
					return dealInterceptor(request,response,"5");
				}	
				
				Map<String,Object> paramMap = new HashMap<String,Object>();
				paramMap.put("accessToken", accessTokenSub);
				paramMap.put("staffCode", accessTokenStr[0]);
				paramMap.put("areaId", accessTokenStr[1]);
				paramMap.put("randowCode", accessTokenStr[2]);
				log.error("令牌校验参数："+paramMap.toString());
				Map<String, Object> resultMap = tokenBmo.QueryAccessToken(paramMap, null, sessionStaff);
				log.error("令牌校验结果："+resultMap.toString());
				if(!ResultCode.R_SUCCESS.equals(resultMap.get("resultCode"))){			
					session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
					return dealInterceptor(request,response,"5");
				}
				String staffCode = String.valueOf(resultMap.get("staffCode"));
				String areaId = String.valueOf(resultMap.get("areaId"));
				String provinceCode = String.valueOf(resultMap.get("provinceCode"));
				String channelCode = String.valueOf(resultMap.get("channelCode"));	
				Map<String,Object> staffInfo = staffBmo.queryStaffByStaffCode4Login(staffCode, areaId);
				log.error("获取员工信息："+staffInfo.toString());
				if(staffInfo.get("resultCode") != null){				
					session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
					return dealInterceptor(request,response,"6");
				}
				staffInfo.put("accessToken", accessTokenSub);
				staffInfo.put("staffProvCode", provinceCode);
				staffInfo.put("channelCode", channelCode);
				sessionStaff = SessionStaff.setStaffInfoFromMap(staffInfo);		
				initSessionStaff(sessionStaff, request.getSession());
				accessToken = accessTokenSub;
			}else{
				accessToken = sessionStaff.getAccessToken();
			}
			
			if(StringUtil.isEmptyStr(accessToken)){					
				session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
				return dealInterceptor(request,response,"4");
			}
			
			String tokenKey = MySimulateData.getInstance().getParam((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY),"token.key");//令牌key				
			String jmAccessToken = AESUtils.decryptToString(accessToken, tokenKey);
			String[] accessTokenStr = jmAccessToken.split("#");
			String staffCode = sessionStaff.getStaffCode();			
			if(!staffCode.equals(accessTokenStr[0])){
				session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
				return dealInterceptor(request,response,"2");
			}
			Map<String,Object> paramMap = new HashMap<String,Object>();
			paramMap.put("accessToken", accessToken);
			paramMap.put("staffCode", accessTokenStr[0]);
			paramMap.put("areaId", accessTokenStr[1]);
			paramMap.put("randowCode", accessTokenStr[2]);
			Map<String,Object> resultMap = tokenBmo.QueryAccessToken(paramMap, null, sessionStaff);
			if(!ResultCode.R_SUCCESS.equals(resultMap.get("resultCode"))){
				session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
				return dealInterceptor(request,response,"3");
			}
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
		
		@SuppressWarnings("rawtypes")
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
			case 5:
				errorMsg = "解密异常";
				break;
			case 6:
				errorMsg = "员工信息校验失败";
				break;
			default:
				errorMsg = "无权限访问该模块。";
			}
			return errorMsg;		
		}
		
		@SuppressWarnings("unchecked")
		public void initSessionStaff(SessionStaff sessionStaff, HttpSession session) {
			// 取渠道信息
			// Map chanelMap = getChannelByStaff(sessionStaff, null);
			Map<String,Object> chanelMap = null;
			try {
				chanelMap = staffChannelBmo.qryCurrentChannelByStaff(sessionStaff,"NL");
			} catch (InterfaceException ie) {
			    ie.printStackTrace();
			} catch (Exception e) {
				log.error("门户/staff/login/loginValid方法异常", e);
			}
			sessionStaff.setCurrentChannelId(MapUtils.getString(chanelMap, "id",""));
			sessionStaff.setCurrentChannelName(MapUtils.getString(chanelMap,"name", ""));
			sessionStaff.setCurrentAreaId(MapUtils.getString(chanelMap, "areaId",""));
			sessionStaff.setCurrentAreaCode(MapUtils.getString(chanelMap,"zoneNumber", ""));
			sessionStaff.setCurrentAreaName(MapUtils.getString(chanelMap,"areaName", ""));
			sessionStaff.setCurrentAreaAllName(MapUtils.getString(chanelMap,"areaAllName", ""));
			sessionStaff.setOperatorsId(MapUtils.getString(chanelMap, "operatorsId", ""));
			// 存到session中
			session.setAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
			RedisUtil.set((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY),sessionStaff.getStaffId(),session.getId());
			session.setAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL,(List<Map<String,Object>>) chanelMap.get("channelList"));
			session.setAttribute(SysConstant.SESSION_KEY_PORTAL_TYPE, propertiesUtils.getMessage(SysConstant.APPDESC));
			session.setAttribute(SysConstant.SERVER_IP,CommonUtils.getSerAddrPart());

			Map<String, Object> dataBusMap = new HashMap<String, Object>();
			dataBusMap.put("staffId", sessionStaff.getStaffId());
			dataBusMap.put("platformCode", SysConstant.SM_PLATFORM_CODE);// 旧：dataBusMap.put("systemPlatformId",
													// 1);
			dataBusMap.put("areaId", sessionStaff.getAreaId());
			try {
				Map<String, Object> map = menuBmo.menuQryAll(dataBusMap, null,sessionStaff);
				session.setAttribute(SysConstant.SESSION_KEY_MENU_LIST,map.get("menuList"));
				session.setAttribute(SysConstant.SESSION_KEY_MENU_AUTH_URL_LIST, EhcacheUtil.getAuthUrlInMenuList(map.get("menuList")));
			} catch (Exception e) {
				log.error("加载菜单异常", e);
			}
		}
}

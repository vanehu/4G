package com.al.lte.portal.filter;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.common.web.HttpUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.log.Log;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.staff.StaffBmoImpl;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;
/**
 * 
 * @author huangjj3
 * 过频操作过滤器
 *
 */
public class OverFrequencyFilter extends OncePerRequestFilter{
	
	private static Log log = Log.getLog(OverFrequencyFilter.class);
	private static Set<String> defaultExcludeUrls = null; //需要过滤的链接
	private UrlPathHelper urlPathHelper = new UrlPathHelper();
	/** JSON格式的content type */
	private static final String JSON_CONTENT_TYPE = "application/json";
	/** response的默认编码 */
	private static final String DEFULT_ENCODING = "UTF-8";
	private StaffBmo staffBmo = new StaffBmoImpl();
	
	/**
	 * 初始化需要过滤的url
	 */
	static {
        defaultExcludeUrls = new HashSet<String>(10);
        defaultExcludeUrls.add("/cust/queryCust");
        defaultExcludeUrls.add("/mktRes/phonenumber/list");
        defaultExcludeUrls.add("/mktRes/phonenumber/purchase");
        defaultExcludeUrls.add("/mktRes/phonenumber/releaseErrorNum");
    }
	
	
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
	        //判断是不是不需要进行过滤的url
	        String path = urlPathHelper.getOriginatingRequestUri(request).substring(request.getContextPath().length());
	        log.debug("path={}", path);
	        for (String u : defaultExcludeUrls) {
	            if (path.startsWith(u)) {
	                return false;
	            }
	        }
	        return true;
	    }

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		long start = System.currentTimeMillis();
		request = filterOverFrequency(request,response);
		log.debug("OrderInfoFilter use time:{} ms", System.currentTimeMillis() - start);
		
		filterChain.doFilter(request, response);
	}

	private HttpServletRequest filterOverFrequency(HttpServletRequest request,
			HttpServletResponse response) {
		// TODO Auto-generated method stub
		String path = urlPathHelper.getOriginatingRequestUri(request).substring(request.getContextPath().length());
		String type = "";
		if(path.startsWith("/cust/queryCust")){
			type = "custType";
		}else if(path.startsWith("/mktRes/phonenumber/list")){
			type = "phoneType";
		}else if(path.startsWith("/mktRes/phonenumber/releaseErrorNum")){
			type = "release";
		}else if(path.startsWith("/mktRes/phonenumber/purchase")){
			type = "purchase";
		}
		
		long endTime = System.currentTimeMillis();
		long beginTime = 0;
		HttpSession httpSession = request.getSession();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request,
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		if(httpSession.getAttribute(sessionStaff.getStaffCode()+type+"time")!=null){
			beginTime = (Long) httpSession.getAttribute(sessionStaff.getStaffCode()+type+"time");
		}
		if(beginTime!=0){
			Date beginDate = new Date(beginTime);
			Date endDate = new Date(endTime);
			long useTime = endDate.getTime()-beginDate.getTime();
			
			try {
				long limit_time = Long.parseLong(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(request,SysConstant.SESSION_DATASOURCE_KEY),"OF_TIME"));
				int limit_count = Integer.parseInt(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(request,SysConstant.SESSION_DATASOURCE_KEY),"OF_COUNT"));
				if (useTime<=limit_time){
					int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+type+"count")+1;
					if(count<limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+type+"count", count);
					}else if(count==limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+type+"count", count);
					}else if(count>limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+type+"count", count);
						if(httpSession.getAttribute(sessionStaff.getStaffCode()+type+"count")!=null){
							response.setContentType("text/html;charset=utf-8");
							response.getWriter().println("errCode=405");
							response.getWriter().close();
							//更改工号状态
							Map<String, Object> paramMap = new HashMap<String, Object>();
							paramMap.put("statusCd", "1020");
							staffBmo.lockUser(paramMap, "", sessionStaff);
							Map<String, Object> logmap = new HashMap<String, Object>();
							logmap.put("STAFF_CODE", sessionStaff.getStaffCode());
							logmap.put("STAFF_ID", sessionStaff.getStaffId());
							logmap.put("SALES_CODE", sessionStaff.getSalesCode());
							logmap.put("HOST_IP", HttpUtils.getHostIpAddress());
							logmap.put("SESSIONINFO", "");
							if("custType".equals(type)){
								logmap.put("STATUS_CD", "客户定位次数超过阀值"+limit_count);
							}else if("phoneType".equals(type)){
								logmap.put("STATUS_CD", "号码查询次数超过阀值"+limit_count);
							}else{
								logmap.put("STATUS_CD", "超过阀值"+limit_count);
							}
							logmap.put("INTF_URL", type);
							logmap.put("IDENTIDIES_TYPE", " ");
							logmap.put("IDENTITY_NUM", " ");
							logmap.put("OPERATION_PLATFORM", SysConstant.APPDESC_LTE);
							logmap.put("ACTION_IP", ServletUtils.getIpAddr(request));
							logmap.put("CHANNEL_ID", sessionStaff.getCurrentChannelId());
							logmap.put("OPERATORS_ID", sessionStaff.getOperatorsId());
							logmap.put("IN_PARAM", " ");
							logmap.put("AREA_ID", sessionStaff.getCurrentAreaId());
							staffBmo.insert_sp_busi_run_log(logmap,"",sessionStaff);
							ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
						}
					}
				}else{
					httpSession.setAttribute(sessionStaff.getStaffCode()+type+"time", endTime);
					httpSession.setAttribute(sessionStaff.getStaffCode()+type+"count", 1);
				}
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} 
		}else{
			httpSession.setAttribute(sessionStaff.getStaffCode()+type+"time", endTime);
			httpSession.setAttribute(sessionStaff.getStaffCode()+type+"count", 1);
		}
		return request;
	}
	

}

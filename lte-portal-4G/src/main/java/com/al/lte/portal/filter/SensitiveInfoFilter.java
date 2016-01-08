package com.al.lte.portal.filter;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Vector;
import java.util.regex.Pattern;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.log.Log;
import com.al.lte.portal.common.FilterBaseData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 过滤请求参数中的敏感信息
 * 
 * @author jinjian
 * 
 */
public class SensitiveInfoFilter extends OncePerRequestFilter {

	private static Log log = Log.getLog(SensitiveInfoFilter.class);
	private final static String STAFF_ID = "staffId"; 
	private final static String STAFF_CODE = "staffCode";
	private final static String CUR_STAFF_ID_EXPR = "#sessionStaff.staffId#";  //使用sessionStaff中的staffId替换  
	private final static String CUR_STAFF_CODE_EXPR = "#sessionStaff.staffCode#"; //使用sessionStaff中的staffCode替换 
	private UrlPathHelper urlPathHelper = new UrlPathHelper();
	private static Set<String> defaultExcludeUrls = null; //如果参数表中未配置，默认不需要过滤的链接
	private static List<RegexAndReplacement> regexAndReplacements = null; //正则表达式和替换后的字符串
	private static final String DEFAULT_ENCODING = "UTF-8";
	/** JSON格式的content type */
	private static final String JSON_CONTENT_TYPE = "application/json";
	static {
		defaultExcludeUrls = new HashSet<String>(11);
		defaultExcludeUrls.add("/staff/");
		defaultExcludeUrls.add("/main/limit");
		defaultExcludeUrls.add("/image/");
		defaultExcludeUrls.add("/css/");
		defaultExcludeUrls.add("/js/");
		defaultExcludeUrls.add("/file/");
		defaultExcludeUrls.add("/card/");
		defaultExcludeUrls.add("/skin/");
		defaultExcludeUrls.add("/merge/");
		defaultExcludeUrls.add("/mktRes/reservenumber/queryList"); //根据工号查询号码预约
		defaultExcludeUrls.add("/order/batchOrder/batchImport");//批量提交，入参中带文件过滤会乱码
		defaultExcludeUrls.add("/order/batchOrder/batchOrderVerify");//批量提交，入参中带文件过滤会乱码
		
		regexAndReplacements = new ArrayList<RegexAndReplacement>(10);
//		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"[sS][tT][aA][fF][fF][iI][dD]\""), "\""+STAFF_ID+"\"")); //大小写转换
//		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"[sS][tT][aA][fF][fF][cC][oO][dD][eE]\""), "\""+STAFF_CODE+"\""));
//		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\""+STAFF_ID+"\"\\s*:\\s*\"[-\\.\\w]*\""), "\""+STAFF_ID+"\":\""+CUR_STAFF_ID_EXPR+"\"")); // "staffId" : "01test"
//		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\""+STAFF_ID+"\"\\s*:[-\\.\\w]*,"), "\""+STAFF_ID+"\":"+CUR_STAFF_ID_EXPR+",")); // "staffId" : 01test ,
//		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\""+STAFF_ID+"\"\\s*:[-\\.\\w]*}"), "\""+STAFF_ID+"\":"+CUR_STAFF_ID_EXPR+"}")); // "staffId" : 01test }
//		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\""+STAFF_CODE+"\"\\s*:\\s*\"[-\\.\\w]*\""), "\""+STAFF_CODE+"\":\""+CUR_STAFF_CODE_EXPR+"\"")); // "staffCode" : "01test"
//		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\""+STAFF_CODE+"\"\\s*:[-\\.\\w]*,"), "\""+STAFF_CODE+"\":"+CUR_STAFF_CODE_EXPR+",")); // "staffCode" : 01test ,
//		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\""+STAFF_CODE+"\"\\s*:[-\\.\\w]*}"), "\""+STAFF_CODE+"\":"+CUR_STAFF_CODE_EXPR+"}")); // "staffCode" : 01test }
		
		//不进行大小写转换
		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"([sS][tT][aA][fF][fF][iI][dD])\"\\s*:\\s*\"[-\\.\\w]*\""), "\"$1\":\""+CUR_STAFF_ID_EXPR+"\"")); // "staffId" : "01test"
		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"([sS][tT][aA][fF][fF][iI][dD])\"\\s*:[-\\.\\w]*,"), "\"$1\":"+CUR_STAFF_ID_EXPR+",")); // "staffId" : 01test ,
		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"([sS][tT][aA][fF][fF][iI][dD])\"\\s*:[-\\.\\w]*}"), "\"$1\":"+CUR_STAFF_ID_EXPR+"}")); // "staffId" : 01test }
		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"([sS][tT][aA][fF][fF][cC][oO][dD][eE])\"\\s*:\\s*\"[-\\.\\w]*\""), "\"$1\":\""+CUR_STAFF_CODE_EXPR+"\"")); // "staffCode" : "01test"
		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"([sS][tT][aA][fF][fF][cC][oO][dD][eE])\"\\s*:[-\\.\\w]*,"), "\"$1\":"+CUR_STAFF_CODE_EXPR+",")); // "staffCode" : 01test ,
		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"([sS][tT][aA][fF][fF][cC][oO][dD][eE])\"\\s*:[-\\.\\w]*}"), "\"$1\":"+CUR_STAFF_CODE_EXPR+"}")); // "staffCode" : 01test }
	}
	
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request)
			throws ServletException {
		if(!FilterBaseData.getInstance().isFilterSensitiveInfo((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY))){
			return true;
		}
		
		//判断是不是不需要进行过滤的url
		String uri = urlPathHelper.getOriginatingRequestUri(request);
		String path = uri.substring(request.getContextPath().length());
		log.debug("uri={}", uri);
		log.debug("path={}", path);
		Set<String> excludeUrls = FilterBaseData.getInstance().getSensitiveInfoFilterWhiteList((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY));
		if(excludeUrls == null || excludeUrls.size() == 0){
			excludeUrls = defaultExcludeUrls;
		}
		for(String u : excludeUrls){
			if (path.startsWith(u)) {
				return true;
			}
		}
		
		//非json格式不过滤(批量业务)
		String contentType = request.getContentType();
		if(contentType == null || contentType.indexOf("JSON_CONTENT_TYPE") == -1)
			return true;
		
		return false;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		long start = System.currentTimeMillis();
		request = filterStaffInfo(request);
		log.debug("SensitiveInfoFilter use time:{} ms", System.currentTimeMillis() - start);
		
		filterChain.doFilter(request, response);
	}
	
	//过滤敏感员工信息，返回重新封装后的request
	private HttpServletRequest filterStaffInfo(HttpServletRequest request) throws IOException{
		
		SessionStaff sessionStaff = (SessionStaff) request.getSession()
				.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		//1、过滤参数中的员工信息
		Map<String,Object> newParams = replaceStaffInfoOfRequestParameter(request, sessionStaff);
		
		//2、过滤json中的员工信息
		String newJsonBody = replaceStaffInfoOfRequestBody(request, sessionStaff);

		//3、使用过滤后的信息,重新封装request
		return new ParameterRequestWrapper(request, newParams, newJsonBody.getBytes(DEFAULT_ENCODING));
	}
	
	/*
	 * 过滤跟在url后的参数信息或者作为表单提交信息 的员工信息
	 */
	private Map<String,Object> replaceStaffInfoOfRequestParameter(HttpServletRequest request, SessionStaff sessionStaff){
		String staffId_value = sessionStaff == null ? "" : sessionStaff.getStaffId();
		String staffCode_value = sessionStaff == null ? "" : sessionStaff.getStaffCode();
		Map<String,Object> newParams = new HashMap<String,Object>(request.getParameterMap());
		for(String paramName : newParams.keySet()){
			if(STAFF_ID.equalsIgnoreCase(paramName + "")){
				newParams.put(paramName, new String[]{staffId_value});
			} else if(STAFF_CODE.equalsIgnoreCase(paramName + "")){
				newParams.put(paramName, new String[]{staffCode_value});
			}
		}
		return newParams;
	}
	
	/*
	 * 过滤作为报文体中的员工信息：
	 * 读取报文体信息中的json后，有两种方式过滤敏感信息：
	 * 1、将序列化的json转化为json对象， 然后递归遍历json对象中的属性名，并重新赋值；
	 * 2、使用正则表达式替换敏感信息；
	 * 这里使用第二种方式。
	 */
	private String replaceStaffInfoOfRequestBody(HttpServletRequest request, SessionStaff sessionStaff) throws IOException{
		BufferedReader br = request.getReader();
		StringBuilder sb = new StringBuilder();
		String s = null;
		while((s = br.readLine()) != null){
			sb.append(s);
		}
		br.close();
//		JSONObject json = JSONObject.fromObject(sb.toString());
		String newJson = sb.toString();
		if(newJson != null && newJson.trim().length() != 0){
			
			String contentType = request.getContentType();
			if(contentType != null && contentType.indexOf(JSON_CONTENT_TYPE) >= 0){
				log.debug("before filter, jsondata:{}", newJson);
				
				String staffId_value = sessionStaff == null ? "" : sessionStaff.getStaffId();
				String staffCode_value = sessionStaff == null ? "" : sessionStaff.getStaffCode();
				
				for(RegexAndReplacement regexAndReplacement : regexAndReplacements){
					newJson = regexAndReplacement.getPattern().matcher(newJson).replaceAll(regexAndReplacement.getReplacement().replaceAll(CUR_STAFF_ID_EXPR, staffId_value).replaceAll(CUR_STAFF_CODE_EXPR, staffCode_value));
				}
				
				log.debug("after filter, jsondata:{}", newJson);
			}
		}
		
		return newJson;
	}
	
	class ParameterRequestWrapper extends HttpServletRequestWrapper {
		public static final int DEFAULT_BUFFER_SIZE = 2048;
		private Map<String, Object> params;
		private final byte[] body;
		private ServletInputStream servletInputStream;
		private BufferedReader bufferedReader;

		public ParameterRequestWrapper(HttpServletRequest request,
				Map<String, Object> newParams,byte[] newBody) throws IOException {
			super(request);
			this.params = newParams;
			// RequestDispatcher.forward parameter
			renewParameterMap(request);
//			body = getBytes(request.getInputStream());
			body = newBody;
			
			final ByteArrayInputStream bais = new ByteArrayInputStream(body);
			servletInputStream = new ServletInputStream() {
				@Override
				public int read() throws IOException {
					return bais.read();
				}
			};
			bufferedReader = new BufferedReader(new InputStreamReader(servletInputStream));
		}
			

		private byte[] getBytes(InputStream input) throws IOException{
			ByteArrayOutputStream result = new ByteArrayOutputStream();
			byte[] buf = new byte[DEFAULT_BUFFER_SIZE];
			int bytesRead = input.read(buf);
			while (bytesRead != -1) {
				result.write(buf, 0, bytesRead);
				bytesRead = input.read(buf);
			}
			result.flush();
		    result.close();
		    return result.toByteArray();
		}
		
		@Override
		public String getParameter(String name) {
			String result = "";
			Object v = params.get(name);
			if (v == null) {
				result = null;
			} else if (v instanceof String[]) {
				String[] strArr = (String[]) v;
				if (strArr.length > 0) {
					result =  strArr[0];
				} else {
					result = null;
				}
			} else if (v instanceof String) {
				result = (String) v;
			} else {
				result =  v.toString();
			}
			return result;
		}

		@Override
		public Map getParameterMap() {
			return params;
		}

		@Override
		public Enumeration getParameterNames() {
			return new Vector(params.keySet()).elements();
		}

		@Override
		public String[] getParameterValues(String name) {
			String[] result = null;
			Object v = params.get(name);
			if (v == null) {
				result =  null;
			} else if (v instanceof String[]) {
				result =  (String[]) v;
			} else if (v instanceof String) {
				result =  new String[] { (String) v };
			} else {
				result =  new String[] { v.toString() };
			}
			return result;
		}

		private void renewParameterMap(HttpServletRequest req) {
			String queryString = req.getQueryString();
			if (queryString != null && queryString.trim().length() > 0) {
				String[] params = queryString.split("&");

				for (int i = 0; i < params.length; i++) {
					int splitIndex = params[i].indexOf("=");
					if (splitIndex == -1) {
						continue;
					}
					String key = params[i].substring(0, splitIndex);
					if (!this.params.containsKey(key)) {
						if (splitIndex < params[i].length()) {
							String value = params[i].substring(splitIndex + 1);
							this.params.put(key, new String[] { value });
						}
					}
				}
			}
		}
		
		@Override
		public BufferedReader getReader() throws IOException {
			return bufferedReader;
		}

		@Override
		public ServletInputStream getInputStream() throws IOException {
			return servletInputStream;
		}

	}
	
	static class RegexAndReplacement{
		private Pattern pattern;
		private String replacement;
		public RegexAndReplacement(Pattern pattern, String replacement) {
			this.pattern = pattern;
			this.replacement = replacement;
		}
		public Pattern getPattern() {
			return pattern;
		}
		public void setPattern(Pattern pattern) {
			this.pattern = pattern;
		}
		public String getReplacement() {
			return replacement;
		}
		public void setReplacement(String replacement) {
			this.replacement = replacement;
		}
	}


}

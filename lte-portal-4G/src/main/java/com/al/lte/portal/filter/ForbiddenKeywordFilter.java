package com.al.lte.portal.filter;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpStatus;
import org.codehaus.jackson.JsonNode;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.FilterBaseData;
import com.al.lte.portal.common.SysConstant;

/**
 * 屏蔽报文中包含已配置关键字的访问
 * 
 * @author jinjian
 * 
 */
public class ForbiddenKeywordFilter extends OncePerRequestFilter {

	private static Log log = Log.getLog(ForbiddenKeywordFilter.class);
	private UrlPathHelper urlPathHelper = new UrlPathHelper();
	/** JSON格式的content type */
	private static final String JSON_CONTENT_TYPE = "application/json";
	/** response的默认编码 */
	private static final String DEFULT_ENCODING = "UTF-8";
	/** 是否只校验value而忽略parameter或json属性的name，否则校验全部报文 */
	private static final boolean onlyValidateValue = true;
	private static Set<String> defaultExcludeUrls = null; //默认不需要过滤的链接
	static {
		defaultExcludeUrls = new HashSet<String>(10);
		defaultExcludeUrls.add("/staff/");
		defaultExcludeUrls.add("/main/limit");
		defaultExcludeUrls.add("/image/");
		defaultExcludeUrls.add("/css/");
		defaultExcludeUrls.add("/js/");
		defaultExcludeUrls.add("/file/");
		defaultExcludeUrls.add("/card/");
		defaultExcludeUrls.add("/skin/");
		defaultExcludeUrls.add("/merge/");
	}

	/** 屏蔽的关键字集合，小写 */
	public static final String ATTR_FORBIDDEN_KEYWORDS = "_forbiddenKeyWords";
	/** 功能开关，是否需要过滤并屏蔽 */
	public static final String ATTR_IS_FILTER_FORBIDDEN = "_isFilterForbidden";
	
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request)
			throws ServletException {
		//判断是不是不需要进行过滤的url
		String path = urlPathHelper.getOriginatingRequestUri(request).substring(request.getContextPath().length());
		log.debug("path={}", path);
		for(String u : defaultExcludeUrls){
			if (path.startsWith(u)) {
				return true;
			}
		}
		
		//根据数据路由获取对应的配置数据：功能开关及要屏蔽的关键字
		String dbKey = (String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
		boolean isFilterForbidden = FilterBaseData.getInstance().isFilterForbiddenKeyWord(dbKey);
		request.setAttribute(ATTR_IS_FILTER_FORBIDDEN, isFilterForbidden);
		if(!isFilterForbidden){
			return true;
		}
		Set<String> forbiddenKeyWords = FilterBaseData.getInstance().getForbiddenKeyWords(dbKey);
		if(forbiddenKeyWords == null || forbiddenKeyWords.size() == 0){
			return true;
		}
		request.setAttribute(ATTR_FORBIDDEN_KEYWORDS, forbiddenKeyWords);
		
		return false;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		//1、判断是否需要屏蔽访问；
		long start = System.currentTimeMillis();
		ForbiddenCheckInfo checkInfo = checkRequestForForbidden(request);
		log.debug("ForbiddenKeywordFilter use time:{} ms", System.currentTimeMillis() - start);
		
		//2、如果需要屏蔽，根据提示信息设置返回json格式response，否则获取封装后的request转发给下一个过滤器；
		if(checkInfo.isForbidden()){
			response.setStatus(HttpStatus.SC_OK);
			response.setContentType(JSON_CONTENT_TYPE);
			response.setCharacterEncoding(DEFULT_ENCODING);
			PrintWriter pw = response.getWriter();
			pw.write(JsonUtil.toString(forbiddenInfo(checkInfo)));
			pw.flush();
			pw.close();
		} else {
			if(checkInfo.getRequestBodyWrapper() != null){
				request = checkInfo.getRequestBodyWrapper();
			}
			filterChain.doFilter(request, response);
		}
	}
	
	/*
	 * 1、判断是否需要屏蔽访问，获取提示信息
	 * 1.1、读取parameter的value，如果包含关键字，则返回true，及parameter；
	 * 1.2、如果报文体格式为json，读取报文，将输入流重新封装到request，并将报文体转义json对象，递归遍历json对象的value，如果包含关键字，则返回true，及json报文体；
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	private ForbiddenCheckInfo checkRequestForForbidden(HttpServletRequest request) throws IOException{
		Set<String> forbiddenKeyWords = (Set<String>) request.getAttribute(ATTR_FORBIDDEN_KEYWORDS);
		ForbiddenCheckInfo checkInfo = new ForbiddenCheckInfo();
		checkInfo.setUrl(request.getRequestURI());
		
		Enumeration params = request.getParameterNames();
		while(params.hasMoreElements()){
			String paraName = params.nextElement().toString();
			String[] paraValues = request.getParameterValues(paraName);
			if(paraValues != null){
				for(String value : paraValues){
					if(hasForbiddenValue(value, forbiddenKeyWords)){
						checkInfo.setForbidden(true);
						checkInfo.setParameters(paraName + "=" + value);
						return checkInfo;
					}
				}
			}
		}
		
		String contentType = request.getContentType();
		if(contentType != null && contentType.indexOf(JSON_CONTENT_TYPE) >= 0){
			byte[] body = getBytes(request.getInputStream());
			String bodyString = new String(body, DEFULT_ENCODING);
			
			checkInfo.setContent(bodyString);
			//读取输入流之后重新封装requestBody的输入流，使后续读取inputStream或reader仍有效
			checkInfo.setRequestBodyWrapper(new RequestBodyWrapper(request, body));
			boolean forbidden = false;
			if(bodyString.trim().length() != 0){
				if(onlyValidateValue){
					try {
						forbidden = hasForbiddenValue(JsonUtil.getNormal().getJsonNode(bodyString), forbiddenKeyWords);
					} catch (Exception e) {
						e.printStackTrace();
						forbidden = false;
					}
				} else {
					forbidden = hasForbiddenValue(bodyString, forbiddenKeyWords);
				}
			}
			checkInfo.setForbidden(forbidden);
		}
		
		return checkInfo;
	}
	
	private byte[] getBytes(InputStream input) throws IOException {
		ByteArrayOutputStream result = new ByteArrayOutputStream();
		byte[] buf = new byte[2048];
	    int bytesRead = input.read(buf);
	    while (bytesRead != -1) {
	    	result.write(buf, 0, bytesRead);
	    	bytesRead = input.read(buf);
	    }
	    result.flush();
		result.close();
		return result.toByteArray();
	}
	
	/*
	 * 判断json节点的值是否包含指定关键字
	 */
	private boolean hasForbiddenValue(JsonNode jsonNode, Set<String> forbiddenKeyWords){
		Iterator<JsonNode> it = jsonNode.getElements();
		while(it.hasNext()){
			JsonNode node = it.next();
			if(node.isContainerNode() && hasForbiddenValue(node, forbiddenKeyWords)){
				return true;
			} else if(node.isTextual() && hasForbiddenValue(node.getTextValue(), forbiddenKeyWords)){
				return true;
			}
		}	
		return false;
	}
	
	/*
	 * 判断字符串是否包含指定关键字
	 */
	private boolean hasForbiddenValue(String text, Set<String> forbiddenKeyWords){
		text = text.toLowerCase();
		for(String key : forbiddenKeyWords){
			if(text.indexOf(key) >= 0){
				return true;
			}
		}
		return false;
	}
	
	/*
	 * 根据checkInfo获取json格式的屏蔽提示信息response
	 */
	private JsonResponse forbiddenInfo(ForbiddenCheckInfo checkInfo) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		ErrorCode error = ErrorCode.FORBIDDEN_REQUEST;
		retnMap.put("errCode", error.getCode());
		retnMap.put("errMsg", error.getName());
		retnMap.put("errData", error.getName());
		
		Map<String, Object> paramMap = new HashMap<String, Object>();
		if(checkInfo.getUrl() != null){
			paramMap.put("url", checkInfo.getUrl());
		}
		if(checkInfo.getParameters() != null){
			paramMap.put("parameters", checkInfo.getParameters());
		}
		if(checkInfo.getContent() != null){
			paramMap.put("content", checkInfo.getContent());
		}
		retnMap.put("paramMap", JsonUtil.toString(paramMap));
		
		JsonResponse jsonResp = new JsonResponse();
		jsonResp.setSuccessed(false);
		jsonResp.setData(retnMap);
		jsonResp.setCode(-2);
		return jsonResp;
	}
	
	/*
	 * 内部类，重新封装requestBody
	 */
	private class RequestBodyWrapper extends HttpServletRequestWrapper {
		private final byte[] body;
		private ServletInputStream servletInputStream;
		private BufferedReader bufferedReader;

		public RequestBodyWrapper(HttpServletRequest request,byte[] newBody) throws IOException {
			super(request);
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

		@Override
		public BufferedReader getReader() throws IOException {
			return bufferedReader;
		}

		@Override
		public ServletInputStream getInputStream() throws IOException {
			return servletInputStream;
		}

	}
	
	protected class ForbiddenCheckInfo{
		private boolean isForbidden;
		private String url;
		private String parameters;
		private String content;
		private RequestBodyWrapper requestBodyWrapper;
		public boolean isForbidden() {
			return isForbidden;
		}
		public void setForbidden(boolean isForbidden) {
			this.isForbidden = isForbidden;
		}
		public String getUrl() {
			return url;
		}
		public void setUrl(String url) {
			this.url = url;
		}
		public String getParameters() {
			return parameters;
		}
		public void setParameters(String parameters) {
			this.parameters = parameters;
		}
		public String getContent() {
			return content;
		}
		public void setContent(String content) {
			this.content = content;
		}
		public RequestBodyWrapper getRequestBodyWrapper() {
			return requestBodyWrapper;
		}
		public void setRequestBodyWrapper(RequestBodyWrapper requestBodyWrapper) {
			this.requestBodyWrapper = requestBodyWrapper;
		}
	}
	
}

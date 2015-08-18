package com.al.ecs.filter;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.MDC;
import org.springframework.util.ClassUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.al.ecs.common.util.PortalConstant;
import com.al.ecs.common.web.AjaxUtils;
import com.al.ecs.common.web.ServletUtils;

/**
 * 编码设置过虑器.
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-1-9
 * @createDate 2012-1-9 下午5:27:08
 * @modifyDate tang 2012-1-9 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class CharacterAndFileEncodingFilter extends OncePerRequestFilter {

	/**
	 * 判断是否含有setCharacterEncoding方法.
	 */
	private static final boolean RESPONSE_SET_CHARACTER_ENCODING_AVAILABLE = ClassUtils
			.hasMethod(javax.servlet.http.HttpServletResponse.class,
					"setCharacterEncoding", new Class[] { String.class });

	/** 编码. */
	private String encoding;
	/** 是否强制编码. */
	private boolean forceEncoding;
	/** 文件编码. */
	private boolean fileEncoding;
	/** 资源文件. */
	private final Set<String> resourceTypes = new HashSet<String>();
	/** 设置是否允许该网页被IFRAMAE嵌入*/
	private String xframeOptions;
	/**
	 *  DENY ：该页无法显示在一个框架中.
  		SAMEORIGIN ：页面只能显示在页面本网站的框架中. 
	 * @param xframeOptions
	 */
	public void setXframeOptions(String xframeOptions) {
		this.xframeOptions = xframeOptions;
	}
	/**
	 * 构造函数，默认都不强制编码.
	 */
	public CharacterAndFileEncodingFilter() {
		this.forceEncoding = false;
		this.fileEncoding = false;
	}

	/**
	 * 设置编码.
	 * 
	 * @param encoding
	 *            编码
	 */
	public void setEncoding(String encoding) {
		this.encoding = encoding;
	}

	/**
	 * 设置是否强制编码.
	 * 
	 * @param forceEncoding
	 *            是否强制编码
	 */
	public void setForceEncoding(boolean forceEncoding) {
		this.forceEncoding = forceEncoding;
	}

	/**
	 * 设置文件编码.
	 * 
	 * @param fileEncoding
	 *            文件编码
	 */
	public void setFileEncoding(boolean fileEncoding) {
		this.fileEncoding = fileEncoding;
	}

	public void setResourceTypes(String resourceType) {
		String[] values = resourceType.split(",");
		for (String value : values) {
			this.resourceTypes.add(value.trim());
		}
	}
	
	@Override
	public void initFilterBean() throws ServletException {
		if(resourceTypes.isEmpty()) {
			resourceTypes.add("js");
			resourceTypes.add("css");
			resourceTypes.add("jpg");
			resourceTypes.add("jpeg");
			resourceTypes.add("png");
			resourceTypes.add("gif");
			resourceTypes.add("bmp");
			resourceTypes.add("swf");
			resourceTypes.add("flv");
			resourceTypes.add("xls");
			resourceTypes.add("xlsx");
			resourceTypes.add("doc");
			resourceTypes.add("docx");
			resourceTypes.add("txt");
			resourceTypes.add("rar");
			resourceTypes.add("zip");
			resourceTypes.add("gz");
			resourceTypes.add("pdf");
		}
	}
	/**
	 * 执行过虑器方法.
	 * 
	 * @param request
	 *            HttpServletRequest
	 * @param response
	 *            HttpServletResponse
	 * @param filterChain
	 *            FilterChain
	 * @exception ServletException
	 *                ServletException
	 * @exception IOException
	 *                IOException
	 */
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		if ((this.encoding != null)
				&& (((this.forceEncoding) || (request.getCharacterEncoding() == null)))) {
			request.setCharacterEncoding(this.encoding);
			if (this.forceEncoding && RESPONSE_SET_CHARACTER_ENCODING_AVAILABLE) {
				response.setCharacterEncoding(this.encoding);
			}
		}
		if ((this.encoding != null) && this.fileEncoding) {
			System.setProperty("file.encoding", this.encoding);
		}

		// skip non-http requests
		if (!(request instanceof HttpServletRequest)) {
			filterChain.doFilter(request, response);
			return;
		}
		// clear session if session id in URL
		if (request.isRequestedSessionIdFromURL()) {
			HttpSession session = request.getSession();
			if (session != null) {
				session.invalidate();
			}
		}
		String uri = request.getRequestURI();
		boolean isResourceUrl = false;
		if (uri.lastIndexOf(".") > 0) {
			String resourceType = uri.substring(uri.lastIndexOf(".")+1);
			int paramIndex=resourceType.indexOf("?");
			if(paramIndex > 0) {
				resourceType=resourceType.substring(0,paramIndex);
			}
			isResourceUrl = resourceTypes.contains(resourceType);
		}
		MDC.put(PortalConstant.MDC_IS_RESOURCE_URL, String.valueOf(isResourceUrl));
		// 对于图片等与日志开关无关的内容
		if (!isResourceUrl) {
			// 获得客户的网络地址
			String address = ServletUtils.getIpAddr(request);
			// 把网络地址放入MDC中. 那么在在layout pattern 中通过使用 % mdc 或
			// %mdc{user_ip}，就可在每条日之中增加网络地址的信息.
			MDC.put(PortalConstant.MDC_USER_IP, address == null ? "" : address);	
		}
		try {
			//只有允许来自同个origin iframe访问
			if(xframeOptions !=null) {
				response.addHeader("X-Frame-Options", xframeOptions);
			}
			filterChain.doFilter(request,response);
			
		} finally {
			if (!isResourceUrl) {
				// 从MDC的堆栈中删除网络地址.
				MDC.remove(PortalConstant.MDC_USER_IP);
			}
			MDC.remove(PortalConstant.MDC_IS_RESOURCE_URL);
		}

	}
}

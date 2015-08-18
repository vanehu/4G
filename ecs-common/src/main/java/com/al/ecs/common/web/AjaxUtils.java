package com.al.ecs.common.web;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.context.request.WebRequest;

/**
 * Ａjax 工具类. <BR>
 * １.判断请求是否是AJAX请求<BR>
 * ２.是否是ajax上传，针对html5.
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-1-9
 * @createDate 2012-1-9 下午5:27:08
 * @modifyDate tang 2012-1-9 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public final class AjaxUtils {

	/**
	 * 判断是否是Ajax请求.
	 * <P>
	 * @param webRequest
	 *            WebRequest
	 * @return boolean true:是
	 */
	public static boolean isAjaxRequest(WebRequest webRequest) {
		String requestedWith = webRequest.getHeader("X-Requested-With");
		return requestedWith != null ? "XMLHttpRequest".equals(requestedWith)
				: false;
	}

	/**
	 * 判断是否是Ajax请求.
	 * <P>
	 * @param request
	 *            HttpServletRequest
	 * @return boolean true:是
	 */
	public static boolean isAjaxRequest(HttpServletRequest request) {
		String requestedWith = request.getHeader("X-Requested-With");
		return requestedWith != null ? "XMLHttpRequest".equals(requestedWith)
				: false;
	}

	/**
	 * 判断是否是Ajax上传.
	 * <P>
	 * @param webRequest
	 *            WebRequest
	 * @return boolean true:是
	 */
	public static boolean isAjaxUploadRequest(WebRequest webRequest) {
		return webRequest.getParameter("ajaxUpload") != null;
	}

}

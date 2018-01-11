/**
 * Copyright (c) 2005-2009 springside.org.cn
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * 
 * $Id: JCaptchaFilter.java 863 2010-01-11 16:46:32Z calvinxiu $
 */
package com.al.ecs.filter;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.imageio.ImageIO;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;

import com.al.ecs.common.entity.JsonError;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.AjaxUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.octo.captcha.service.CaptchaService;
import com.octo.captcha.service.CaptchaServiceException;

/**
 * 集成JCaptcha验证码的Filter.
 * 
 * 可通过配置与SpringSecurity相同的登录表单处理URL与身份验证失败URL,实现与SpringSecurity的集成.
 * 另本filter主要演示与SpringSecurity的集成方式，用户可参考其他验证码方案的集成.
 * 
 * 在web.xml中配置的参数包括：
 * 1.failureUrl -- 身份验证失败后跳转的URL, 需与SpringSecurity中的配置保持一致, 无默认值必须配置.
 * 2.filterProcessesUrl -- 登录表单处理URL, 需与SpringSecurity中的配置一致, 默认为"/j_spring_security_check".
 * 3.captchaServiceId -- captchaService在Spring ApplicationContext中的bean id,默认为"captchaService".
 * 4.captchaParamter -- 登录表单中验证码Input框的名称, 默认为"j_captcha".
 * 5.autoPassValue -- 用于自动化功能测试的自动通过值, 默认该值不存在.
 * 
 * 
 * 具体应用参考showcase示例的web.xml与login.jsp.
 * 
 * @author calvin
 */
public class JCaptchaFilter implements Filter {
	protected Log log=Log.getLog(JCaptchaFilter.class);
	//web.xml中的参数名定义
	public static final String PARAM_CAPTCHA_PARAMTER_NAME = "validateCodeImgParamterName";
	public static final String PARAM_FILTER_PROCESSES_URL = "filterProcessesUrl";
	public static final String PARAM_FAILURE_URL = "failureUrl";
	public static final String PARAM_CAPTCHA_IS_VALID_KEY = "isValid";
	public static final String PARAM_CAPTCHA_VALID_METHOD_KEY = "method";
	/** SESSION_KEY_CAPTCHA_IS_VALID 的值等于 SysConstant.SESSION_KEY_IMAGE_CODE */
	public static final String SESSION_KEY_CAPTCHA_IS_VALID = "is_valid_imagecode_session_key";
	/** 等于什么值才验证 */
	public static final String SESSION_KEY_CAPTCHA_VALID_VAL = "valid_val";
	//默认值定义
	public static final String DEFAULT_FILTER_PROCESSES_URL = "/security_check";
	public static final String DEFAULT_CAPTCHA_PARAMTER_NAME = "validatecode";
	private String failureUrl;
	private String filterProcessesUrl = DEFAULT_FILTER_PROCESSES_URL;
	/** 是否第一次就开始验证,默认是,用于第一次密码验证失败时,提示验证码校验 */
	private boolean isValid=true;
	/** 默认等于1验证 */
	private String validVal="1";
	/** 默认验证是 POST */
	private String validMethod="POST";
	private String captchaParamterName = DEFAULT_CAPTCHA_PARAMTER_NAME;
	private static final String  CAPTCHA_SESSIONID="_captcha_session_id";
	private CaptchaService captchaService;

	/**
	 * Filter回调初始化函数.
	 */
	public void init(final FilterConfig fConfig) throws ServletException {
		initParameters(fConfig);
		initCaptchaService(fConfig);
	}

	/**
	 * 初始化web.xml中定义的filter init-param.
	 */
	protected void initParameters(final FilterConfig fConfig) {
	
		failureUrl = fConfig.getInitParameter(PARAM_FAILURE_URL);
		if (StringUtils.isNotBlank(fConfig.getInitParameter(PARAM_FILTER_PROCESSES_URL))) {
			filterProcessesUrl = fConfig.getInitParameter(PARAM_FILTER_PROCESSES_URL).trim();
		}
		if (StringUtils.isNotBlank(fConfig.getInitParameter(PARAM_CAPTCHA_PARAMTER_NAME))) {
			captchaParamterName = fConfig.getInitParameter(PARAM_CAPTCHA_PARAMTER_NAME).trim();
		}
		if (StringUtils.isNotBlank(fConfig.getInitParameter(PARAM_CAPTCHA_IS_VALID_KEY))) {
			isValid = Boolean.parseBoolean(fConfig.getInitParameter(PARAM_CAPTCHA_IS_VALID_KEY).trim());
		}
		if (StringUtils.isNotBlank(fConfig.getInitParameter(SESSION_KEY_CAPTCHA_VALID_VAL))) {
			validVal = fConfig.getInitParameter(SESSION_KEY_CAPTCHA_VALID_VAL).trim();
		}
		if (StringUtils.isNotBlank(fConfig.getInitParameter(PARAM_CAPTCHA_VALID_METHOD_KEY))) {
			validMethod = fConfig.getInitParameter(PARAM_CAPTCHA_VALID_METHOD_KEY).trim().toUpperCase();
		}

	}

	/**
	 * 从ApplicatonContext获取CaptchaService实例.
	 */
	protected void initCaptchaService(final FilterConfig fConfig) {
		captchaService = (CaptchaService) SpringContextUtil.getBean("captchaService");
	}

	/**
	 * Filter回调退出函数.
	 */
	public void destroy() {
	}

	/**
	 * Filter回调请求处理函数.
	 */
	public void doFilter(final ServletRequest theRequest, final ServletResponse theResponse, final FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) theRequest;
		HttpServletResponse response = (HttpServletResponse) theResponse;
		String path = request.getServletPath();
		if (request.getPathInfo() != null) {
			path = path + request.getPathInfo();
		}
		//符合filterProcessesUrl为验证处理请求,其余为生成验证图片请求.
		if (path.startsWith(filterProcessesUrl)) {
			if(request.getMethod().toUpperCase().indexOf(validMethod)>=0){
				boolean validated = validateCaptchaChallenge(request);
				if (validated) {
					chain.doFilter(request, response);
				} else {
					if(AjaxUtils.isAjaxRequest(request)){
						ajaxfailure(response);
					} else {
						redirectFailureUrl(request, response);
					}
				}
			}else{
				chain.doFilter(request, response);
			}
		} else if(request.getMethod().toUpperCase().equals("GET")) {
			genernateCaptchaImage(request, response);
		} else {
			chain.doFilter(request, response);
		}
	}

	/**
	 * 生成验证码图片.
	 */
	protected void genernateCaptchaImage(final HttpServletRequest request, final HttpServletResponse response)
			throws IOException {

		ServletUtils.setNoCacheHeader(response);
		response.setContentType("image/jpeg");
		ServletOutputStream out = response.getOutputStream();
		try {
			String captchaId = request.getSession(true).getId();
			request.getSession().setAttribute(CAPTCHA_SESSIONID,captchaId);//防止集群各服务的sessionId不一样
			BufferedImage challenge = (BufferedImage) captchaService.getChallengeForID(captchaId, request.getLocale());
			ImageIO.write(challenge, "jpg", out);
			out.flush();
		} catch (CaptchaServiceException e) {
			log.warn("验证码校验异常!", e);
		} finally {
			out.close();
		}
	}

	
	/**
	 * 验证验证码.
	 * @param request HttpServletRequest
	 * @return boolean true:验证通过
	 */
	protected boolean validateCaptchaChallenge(final HttpServletRequest request) {
		try {
			if(!isValid){
				Object obj=request.getSession(true).getAttribute(SESSION_KEY_CAPTCHA_IS_VALID);
				if(obj ==null ||
						Integer.parseInt(validVal)>=Integer.parseInt(String.valueOf(obj))) {
					return true;
				}
			}
			String captchaID = (String)request.getSession().getAttribute(CAPTCHA_SESSIONID);
			request.getSession().removeAttribute(CAPTCHA_SESSIONID);
			String challengeResponse = request.getParameter(captchaParamterName);
			return captchaService.validateResponseForID(captchaID, challengeResponse);
		} catch (CaptchaServiceException e) {
			//logger.error(e.getMessage(), e);
			e.printStackTrace();
			return false;
		}
	}
	
	/**
	 * 输出ajax验证失败信息.
	 * @param response HttpServletResponse
	 */
	protected void ajaxfailure(final HttpServletResponse response)
			throws IOException {

		ServletUtils.setNoCacheHeader(response);
		response.setContentType(ServletUtils.JSON_TYPE);
		response.setCharacterEncoding("UTF-8");
		JsonResponse jsonRep = new JsonResponse();
		jsonRep.setSuccessed(false);
		jsonRep.setCode(ResultConstant.IMAGE_CODE_INVALID.getCode());
		List<JsonError> errorList = new ArrayList<JsonError>();
		errorList.add(new JsonError(captchaParamterName,ResultConstant.IMAGE_CODE_INVALID.getMsg()));
		jsonRep.setErrorsList(errorList);
		PrintWriter writer=response.getWriter();
		try{
			writer.print(JsonUtil.buildNormal().objectToJson(jsonRep));
		}finally{
			if(writer!=null){
				writer.flush();
				writer.close();
			}
		}
		
	}
	/**
	 * 跳转到失败页面.
	 * 
	 * 可在子类进行扩展, 比如在session中放入SpringSecurity的Exception.
	 * @param request HttpServletRequest
	 * @param response HttpServletResponse
	 */
	protected void redirectFailureUrl(final HttpServletRequest request, final HttpServletResponse response)
			throws IOException {
		response.sendRedirect(request.getContextPath() + failureUrl);
	}

}

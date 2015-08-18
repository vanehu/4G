package com.al.ecs.spring.exception;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.SimpleMappingExceptionResolver;

import com.al.ecs.common.util.JacksonUtil;
import com.al.ecs.common.util.StringUtil;
import com.al.ecs.common.web.AjaxUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.DataAccessException;
import com.al.ecs.exception.PortalCheckedException;
import com.al.ecs.exception.SessionException;
import com.al.ecs.log.Log;

/**
 * 统一的异常日志处理.
 * <P>
 * 统一异常视图或返回前台处理类
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2011-12-23
 * @createDate 2011-12-23 上午12:34:09
 * @modifyDate tang 2011-12-23<BR>
 * @copyRight 亚信联创电信CRM研发部
 */

public class PortalHandlerExceptionResolver extends
		SimpleMappingExceptionResolver {
	/** 日志. */
	protected static Log log = Log.getLog(PortalHandlerExceptionResolver.class);

	/** 返回前台日志简单级别模式. */
	protected static final String EXCEPTION_MODEL_SIMPLE = "simple";
	/** 返回前台日志详细级别模式. */
	protected static final String EXCEPTION_MODEL_DETAIL = "detail";

	/** 级别模式:默认简单. */
	private String level = EXCEPTION_MODEL_SIMPLE;
	/** 过虑掉哪些不用把异常信息带到前台 */
	private List<String> filterExceptionList = new ArrayList<String>();

	/**
	 * 返回前台属性名.
	 */
	private String exceptionAttribute = DEFAULT_EXCEPTION_ATTRIBUTE;

	public ExceptionPoint exceptionPoint;
	public void setExceptionPoint(ExceptionPoint exceptionPoint) {
		this.exceptionPoint = exceptionPoint;
	}

	/**
	 * 设置模式.
	 * 
	 * @param level
	 *            模式:simple,detail,normal,直接用model作为提示信息
	 */
	public void setLevel(String level) {
		this.level = level;
	}

	/**
	 * 设置哪些不用把异常信息带到前台.
	 * 
	 * @param filterExceptionList
	 *            异常 key
	 */
	public void setFilterExceptionList(List<String> filterExceptionList) {
		this.filterExceptionList = filterExceptionList;
	}

	/**
	 * Set the name of the model attribute as which the exception should be
	 * exposed. Default is "exception".
	 * <p>
	 * This can be either set to a different attribute name or to
	 * <code>null</code> for not exposing an exception attribute at all.
	 * 
	 * @see #DEFAULT_EXCEPTION_ATTRIBUTE
	 * @param exceptionAttribute
	 *            属性名
	 */
	public void setExceptionAttribute(String exceptionAttribute) {
		this.exceptionAttribute = exceptionAttribute;
	}

	@Override
	public ModelAndView resolveException(HttpServletRequest request,
			HttpServletResponse response, Object handler, Exception ex) {
		Map map=null;
		if(exceptionPoint!=null)
			 map=exceptionPoint.before(request,response,handler,ex);
		if (!filterExceptionList.contains(ex.getClass().getName())) {
			log.error("系统异常", ex);
		}
		// Expose ModelAndView for chosen error view.
		String viewName = determineViewName(ex, request);
		if (viewName != null) {
			// Apply HTTP status code for error views, if specified.
			// Only apply it if we're processing a top-level request.
			Integer statusCode = determineStatusCode(request, viewName);
			if (statusCode != null) {
				applyStatusCodeIfPossible(request, response, statusCode);
			}
			if(map==null){
				map = new HashMap();
			}
			if (AjaxUtils.isAjaxRequest(request)) {
				if (ex instanceof SessionException || ex instanceof AuthorityException) {
					return null;
				} else {
					map.put("ajax", "_ajax");
				}
			}
			viewName=StringUtil.format(viewName, map, "");
			return getModelAndView(viewName, ex, request);
		} else {
			return null;
		}
	}

	/**
	 * Return a ModelAndView for the given view name and exception.
	 * <p>
	 * The default implementation adds the specified exception attribute. Can be
	 * overridden in subclasses.
	 * 
	 * @param viewName
	 *            the name of the error view
	 * @param ex
	 *            the exception that got thrown during handler execution
	 * @return the ModelAndView instance
	 * @see #setExceptionAttribute
	 */
	protected ModelAndView getModelAndView(String viewName, Exception ex) {
		ModelAndView mv = new ModelAndView(viewName);
		if (this.exceptionAttribute != null) {
			if (logger.isDebugEnabled()) {
				logger.debug("Exposing Exception as model attribute '"
						+ this.exceptionAttribute + "'");
			}
			/** 简单级别提示 */
			if (EXCEPTION_MODEL_SIMPLE.equals(level)) {
				if (!filterExceptionList.contains(ex.getClass().getName())) {
					mv.addObject(this.exceptionAttribute, ex);
				}
				/** 详细提示 */
			} else if (EXCEPTION_MODEL_DETAIL.equals(level)) {
				if (!filterExceptionList.contains(ex.getClass().getName())) {
					if (ex instanceof BusinessException) {
						mv.addObject(this.exceptionAttribute,
								((BusinessException) ex).toXmlString());
					} else if (ex instanceof PortalCheckedException) {
						mv.addObject(this.exceptionAttribute,
								((PortalCheckedException) ex).toXmlString());
					} else if (ex instanceof DataAccessException) {
						mv.addObject(this.exceptionAttribute,
								((DataAccessException) ex).toXmlString());
					} else if (ex instanceof SessionException) {
						// Session异常，不带异常信息
						log.debug("用户未登录!={}",
								((SessionException) ex).toXmlString());
					} else if (ex instanceof AuthorityException) {
						// 权限异常，不带异常信息
						log.debug("没有权限访问!={}",
								((AuthorityException) ex).toXmlString());
					} else {
						ByteArrayOutputStream buf = new ByteArrayOutputStream();
						ex.printStackTrace(new PrintWriter(buf, true));
						String expMessage = buf.toString();
						mv.addObject(this.exceptionAttribute, expMessage);
					}

				}
				/** 自定义提示 */
			} else {
				if (!filterExceptionList.contains(ex.getClass().getName())) {
					mv.addObject(this.exceptionAttribute, level);
				}
			}

		}
		return mv;
	}
}

package com.al.ecs.spring.view;

import java.net.URL;
import java.util.Locale;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;


import org.springframework.context.MessageSource;
import org.springframework.util.ClassUtils;
import org.springframework.util.ResourceUtils;
import org.springframework.web.servlet.support.JstlUtils;
import org.springframework.web.servlet.support.RequestContext;
import org.springframework.web.servlet.view.InternalResourceView;


/**
 * 扩展Jstlview .
 * <BR>
 *  扩展Jstlview，增加 checkResource方法，判断视图文件是否存在
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-12-7
 * @createDate 2012-12-7 下午1:30:05
 * @modifyDate tang zheng yu 2012-12-7 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class JstlView extends InternalResourceView {

	private MessageSource messageSource;


	/**
	 * Constructor for use as a bean.
	 * @see #setUrl
	 */
	public JstlView() {
	}

	/**
	 * Create a new JstlView with the given URL.
	 * @param url the URL to forward to
	 */
	public JstlView(String url) {
		super(url);
	}

	/**
	 * Create a new JstlView with the given URL.
	 * @param url the URL to forward to
	 * @param messageSource the MessageSource to expose to JSTL tags
	 * (will be wrapped with a JSTL-aware MessageSource that is aware of JSTL's
	 * <code>javax.servlet.jsp.jstl.fmt.localizationContext</code> context-param)
	 * @see JstlUtils#getJstlAwareMessageSource
	 */
	public JstlView(String url, MessageSource messageSource) {
		this(url);
		this.messageSource = messageSource;
	}


	/**
	 * Wraps the MessageSource with a JSTL-aware MessageSource that is aware
	 * of JSTL's <code>javax.servlet.jsp.jstl.fmt.localizationContext</code>
	 * context-param.
	 * @see JstlUtils#getJstlAwareMessageSource
	 */
	@Override
	protected void initServletContext(ServletContext servletContext) {
		if (this.messageSource != null) {
			this.messageSource = JstlUtils.getJstlAwareMessageSource(servletContext, this.messageSource);
		}
		super.initServletContext(servletContext);
	}

	/**
	 * Exposes a JSTL LocalizationContext for Spring's locale and MessageSource.
	 * @see JstlUtils#exposeLocalizationContext
	 */
	@Override
	protected void exposeHelpers(HttpServletRequest request) throws Exception {
		if (this.messageSource != null) {
			JstlUtils.exposeLocalizationContext(request, this.messageSource);
		}
		else {
			JstlUtils.exposeLocalizationContext(new RequestContext(request, getServletContext()));
		}
	}
	
	/**
	 * Check whether the underlying resource that the configured URL points to
	 * actually exists.
	 * @param locale the desired Locale that we're looking for
	 * @return <code>true</code> if the resource exists (or is assumed to exist);
	 * <code>false</code> if we know that it does not exist
	 * @throws Exception if the resource exists but is invalid (e.g. could not be parsed)
	 */
	public boolean checkResource(Locale locale) throws Exception {

		// Check that we can get the template, even if we might subsequently get it again.
		if (super.getUrl().startsWith(ResourceUtils.CLASSPATH_URL_PREFIX)) {
			String path = super.getUrl().substring(ResourceUtils.CLASSPATH_URL_PREFIX.length());
			URL url = ClassUtils.getDefaultClassLoader().getResource(path);
			if (url == null) {
				if (logger.isDebugEnabled()) {
					logger.debug("No Jsp view found for URL: " + getUrl());
				}
				return false;
			}
			return true;
		}else{
			URL url=super.getServletContext().getResource(super.getUrl());
			if(url!=null){
				return true;
			}else{
				if (logger.isDebugEnabled()) {
					logger.debug("No Jsp view found for URL: " + getUrl());
				}
				return false;
			}
		}
	}


}

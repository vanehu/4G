package com.al.ecs.spring.annotation.session;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Session是否登录校验拦截 .
 * <P>
 * 针对 Controller 类和方法级别
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-2-23
 * @createDate 2012-2-23 下午11:39:52
 * @modifyDate	 tang 2012-2-23 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Target(value={ElementType.ANNOTATION_TYPE,ElementType.METHOD,ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface SessionValid {
	/**
	 * 是否强制Seesion验证
	 * @return boolean true:验证，false不验证
	 */
	boolean value() default true;
}

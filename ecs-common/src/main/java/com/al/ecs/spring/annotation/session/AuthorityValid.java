package com.al.ecs.spring.annotation.session;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 权限验证注解 .
 * <BR>
 *  可自定义权限实例编码，主要用于Controller方法上
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-8-7
 * @createDate 2012-8-7 下午3:38:21
 * @modifyDate tang zheng yu 2012-8-7 <BR>
 * @copyRight 亚信联创EC研发部
 */
@Target(value={ElementType.ANNOTATION_TYPE,ElementType.METHOD,ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AuthorityValid {
	/**
	 * 默认为类路径加方法名编码,否则自定义
	 * <P>
	 * @param value 格式 package.classname/mehtod:Get
	 */
	String value() default "";

	/**
	 * 是否验证，默认都不验证
	 * @return boolean　true:验证
	 */
	boolean isCheck() default false;
	
	/**
	 * 数据权限是否验证，默认都不验证
	 * @return boolean　true:验证
	 */
	boolean isDataCheck() default false;

}

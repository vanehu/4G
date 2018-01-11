package com.al.ecs.spring.annotation.valid;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 需要JSON 格式校验方法注解,使其校验拦截生效
 * <BR>
 *  放在方法上面,有该注解,就进行拦截
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-1-11
 * @createDate 2012-1-11 下午2:23:29
 * @modifyDate	 tang 2012-1-11 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Target(value={ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface JsonValidMethod {
}

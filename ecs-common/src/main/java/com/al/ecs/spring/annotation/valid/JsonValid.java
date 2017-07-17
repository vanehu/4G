package com.al.ecs.spring.annotation.valid;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;


/**
 * 指定方法入参JSON参数校验注解
 * <BR>
 *  参数有该注解,就进行拦截校验,支持参数类型为String,Map,List<BR>
 *  校验错误,抛出异常类 <BR>
 *  com.al.ecs.validator.exception.MethodNotJsonValidException
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-1-11
 * @createDate 2012-1-11 下午2:23:29
 * @modifyDate	 tang 2012-1-11 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Target(value={ElementType.ANNOTATION_TYPE,ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface JsonValid {
	/**
	 * 方法名,与validator form name对应 .
	 * <P>
	 * @param value  form name
	 */
	String value();
	
	/**
	 * 验证规则配置XML 文件路径.<BR>
	 * 默认是当前类名路径.文件名 类名-validator.xml<BR>
	 * 定义路径:classpath路径下读取,必须是/开头 文件全路径
	 * <P>
	 * @param path 规则配置XML 文件路径
	 */
	String path() default "";
	
	/**
	 * 是否只把有错误的校验字段返回 .
	 * @return boolean　true:只把有错误校验字段返回
	 */
	boolean isOnlyReturnErrors() default true;
}

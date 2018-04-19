package com.al.ecs.spring.annotation.log;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.al.ecs.common.entity.LevelLog;
import com.al.ecs.common.entity.Switch;


/**
 * 控制层日志输入和输出拦截
 * <BR>
 * 输出必须用Model ,ModelMap,或返回Responsebody和String
 * 输入支持所有
 * 入参含有 LogOperatorAnn 注解,代表流水号
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-1-11
 * @createDate 2012-1-11 下午2:23:29
 * @modifyDate	 tang 2012-1-11 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Target(value={ElementType.ANNOTATION_TYPE,ElementType.METHOD,ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface LogOperatorAnn {
	/**
	 * 开关.
	 * on off
	 * <P>
	 */
	Switch switchs() default Switch.ON;
	
	/**
	 * 功能编号.
	 * <P>
	 */
	String code() default "";
	
	/**
	 * 日志功能描述.
	 * <P>
	 */
	String desc() default "";
	
	/**
	 * 日志级别.
	 * <P>
	 */
	LevelLog level() default LevelLog.DEBUG;

}

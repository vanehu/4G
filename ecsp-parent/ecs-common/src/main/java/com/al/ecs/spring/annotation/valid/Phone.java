package com.al.ecs.spring.annotation.valid;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import java.lang.annotation.RetentionPolicy;

import javax.validation.Constraint;
import javax.validation.Payload;


/** 
 *  注解:用来判断 手机号码，或固话格式是否正确.
 *<P>
 * @author			tang zheng yu
 * @version			V1.0 2011-12-24 
 * @createDate	2011-12-24 下午10:17:00
 * @modifyDate	tang  2011-12-24<BR>
 * @copyRight	亚信联创电信CRM研发部
 */

@Target(value={ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE,ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {PhoneValidator.class})
@Documented
public @interface Phone {
	String message() default "号码格式不正确";
	Type type() default Type.MOBILE;
	String pattern() default "";
	
	/**
	 * 话号类型，支持移动和固定电话.
	 * @author tang
	 */
	public enum Type {
		/** 移动. */
		MOBILE,
		/** 固话. */
		FIXED
	}
	
	Class<?>[] groups() default {};
	Class<? extends Payload>[] payload() default {};
}

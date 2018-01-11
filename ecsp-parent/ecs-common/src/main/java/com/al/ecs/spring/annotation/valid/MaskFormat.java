package com.al.ecs.spring.annotation.valid;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
/** 
 *  注解:用来判断 字符串格式是否正确.
 *<P>
 *  sample : @MaskFormat("(###) ###-####")
 *<P>
 * @author			tang zheng yu
 * @version			V1.0 2011-12-24 
 * @createDate	2011-12-24 下午10:17:00
 * @modifyDate	tang  2011-12-24<BR>
 * @copyRight	亚信联创电信CRM研发部
 */

@Target(value={ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface MaskFormat {
	/** 表达式. */
	String value();
}

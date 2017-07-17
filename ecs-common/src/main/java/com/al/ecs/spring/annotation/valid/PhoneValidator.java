package com.al.ecs.spring.annotation.valid;

import java.util.regex.Pattern;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.al.ecs.spring.annotation.valid.Phone.Type;

/** 
 *  用来判断 手机号码，或固话格式是否正确功能实现类.
 *<P>
 * @author			tang zheng yu
 * @version			V1.0 2011-12-24 
 * @createDate	2011-12-24 下午10:18:54
 * @modifyDate	tang  2011-12-24
 * @copyRight	亚信联创电信CRM研发部
 */

public class PhoneValidator  implements ConstraintValidator<Phone, String>{
	private String pattern;
	private Type type;
	
	public void initialize(Phone constraintAnnotation) {
		this.pattern=constraintAnnotation.pattern();
		this.type=constraintAnnotation.type();
	}

	
	public boolean isValid(String value, ConstraintValidatorContext constraintContext) {
		//没有值则不判断，通过
		if(value==null) {
			return true;
		}
		//没有值，为都正确
		if(this.pattern==null || this.pattern.trim().length()==0) {
			 if(type==Type.MOBILE) {
				 this.pattern="^\\d{11}$";
			 } else {
				 this.pattern="^(0\\d{2,3})?\\d{7,8}$";
			 }
		}
		Pattern pattern=Pattern.compile(this.pattern);
		return pattern.matcher(value).matches();
		
	}

}

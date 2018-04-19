package com.al.ecs.spring.convert;

import java.beans.PropertyEditorSupport;
import java.text.ParseException;
import java.text.SimpleDateFormat;

import org.springframework.util.StringUtils;

/**
 * 日期转换，用于前台到后台日期自动转换.
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2011-12-24
 * @createDate 2011-12-24 下午1:57:06
 * @copyRight 亚信联创电信CRM研发部
 */
public class DateConvertEditor  extends PropertyEditorSupport {
	/** 日期长度为10:yyyy-MM-dd . */
	public static final int YMD_LENGTH_10 = 10;
	/** 日期长度为19:yyyy-MM-dd HH:mm:ss . */
	public static final int YMD_LENGTH_19 = 19;
    private SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");  
    private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");  
  
    public void setAsText(String text) throws IllegalArgumentException {  
        if (StringUtils.hasText(text)) {  
            try {
                if (text.indexOf(":") == -1 && text.length() == YMD_LENGTH_10) {  
                    setValue(this.dateFormat.parse(text));  
                } else if (text.indexOf(":") > 0 && text.length() == YMD_LENGTH_19) {  
                    setValue(this.datetimeFormat.parse(text));  
                }else{  
                    throw new IllegalArgumentException("Could not parse date, date format is error ");  
                }  
            } catch (ParseException ex) {  
                IllegalArgumentException iae = new IllegalArgumentException(
                		"Could not parse date: " + ex.getMessage());  
                iae.initCause(ex);  
                throw iae;  
            }  
        } else {  
            setValue(null);  
        }  
    }  

}

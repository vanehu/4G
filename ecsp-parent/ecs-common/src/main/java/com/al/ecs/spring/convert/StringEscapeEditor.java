package com.al.ecs.spring.convert;

import java.beans.PropertyEditorSupport;

import org.apache.commons.lang.StringEscapeUtils;
import org.springframework.util.StringUtils;


/**
 * 对字符串提交的一些字符进行转义 <BR>
 * 字符如HTML,JAVASCRIPT,SQL
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-3-28
 * @createDate 2012-3-28 下午3:07:53
 * @modifyDate tang 2012-3-28 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class StringEscapeEditor extends PropertyEditorSupport {
	/** escape HTML */
	private boolean escapeHTML = true;
	/** escape JavaScript */
	private boolean escapeJavaScript = true;
	/** escape SQL */
	private boolean escapeSQL = true;

	public void setEscapeHTML(boolean escapeHTML) {
		this.escapeHTML = escapeHTML;
	}

	public void setEscapeJavaScript(boolean escapeJavaScript) {
		this.escapeJavaScript = escapeJavaScript;
	}

	public void setEscapeSQL(boolean escapeSQL) {
		this.escapeSQL = escapeSQL;
	}

	@Override
	public void setAsText(String text) {
		if (StringUtils.hasText(text)) {
			String value = text;
			if (escapeHTML) {
				value = StringEscapeUtils.escapeHtml(value);
			}
			if (escapeJavaScript) {
				value = StringEscapeUtils.escapeJavaScript(value);
			}
			if (escapeSQL) {
				value = StringEscapeUtils.escapeSql(value);
			}
			setValue(value);
		} else {
			setValue(null);
		}
	}
	@Override
	public void setValue(Object value){
		super.setValue(value);
	}
	
	
}

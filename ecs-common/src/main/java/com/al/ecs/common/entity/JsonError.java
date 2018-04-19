package com.al.ecs.common.entity;
/**
 * 返回前台json 错误实体类 .
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-1-9
 * @createDate 2012-1-9 下午5:30:53
 * @modifyDate	 tang 2012-1-9 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class JsonError {

	/** 元素名，与页面元素名或 id 一致. */
	private String element="";
	/** 错误信息. */
	private String message="";

	/**
	 * 构造函数.
	 * @param element 元素名称
	 * @param message 错误信息描述
	 */
	public JsonError(String element, String message) {
		this.element=element;
		this.message=message;
	}
	/**
	 * 返回元素名称.
	 * @return	String 元素名称
	 */
	public String getElement() {
		return element;
	}
	/**
	 * 设置元素名称.
	 * @param element 元素名称
	 */
	public void setElement(String element) {
		this.element = element;
	}
	/**
	 * 返回错误提示信息.
	 * @return String 错误提示信息
	 */
	public String getMessage() {
		return message;
	}
	/**
	 * 设置错误提示信息.
	 * @param message 错误提示信息
	 */
	public void setMessage(String message) {
		this.message = message;
	}
	
}

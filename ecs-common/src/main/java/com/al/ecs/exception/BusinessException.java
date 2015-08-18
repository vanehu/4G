package com.al.ecs.exception;

import java.io.PrintStream;
import java.io.PrintWriter;
import java.util.Map;

/**
 * 业务逻辑层，service 层 抛出 check 异常.
 * <P>
 * @author			tang zheng yu
 * @version			V1.0 2011-12-23 
 * @CreateDate	2011-12-23 上午11:32:28
 * @CopyRight	亚信联创电信CRM研发部
 */
public class BusinessException extends Exception {
	private static final long serialVersionUID = 1L;

	private ErrorCode error;
	private Map<String, Object> paramMap;
	private Map<String, Object> resultMap;
	
	
	/**
	 * 构造方法.
	 * <P>
	 */
	public BusinessException(ErrorCode error, Map<String, Object> paramMap, Map<String, Object> resultMap, Throwable cause) {
		super(cause);
		this.error = error;
		this.paramMap = paramMap;
		this.resultMap = resultMap;
	}


	public ErrorCode getError() {
		return error;
	}


	public void setError(ErrorCode error) {
		this.error = error;
	}


	public Map<String, Object> getParamMap() {
		return paramMap;
	}
	
	public Map<String, Object> getResultMap() {
		return resultMap;
	}
	
	/**
	 * 异常 XML格式.
	 * <P>
	 * @return String 异常XML格式
	 */
	public String toXmlString() {
		StringBuilder sb = new StringBuilder();
		sb.append("<exception>");
		sb.append("<code>");
		sb.append(getError().getCode());
		sb.append("</code>");
		sb.append("<msg>");
		sb.append(getError().getErrMsg());
		sb.append("</msg>");
		sb.append("<exceptionTrace>");
		sb.append(getMessage());
		sb.append("</exceptionTrace>");
		sb.append("<exception/>");
		return sb.toString();
	}
}

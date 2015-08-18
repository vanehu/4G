package com.al.ecs.exception;

import java.util.Map;

public class InterfaceException extends Exception{

	private static final long serialVersionUID = -5678256434432122165L;

	/**
	 * OPPOSITE - 对端异常
	 * CATCH    - 已封装异常
	 * PORTAL   - 门户异常
	 * ECSP     - 服务层异常
	 * CSB      - CSB返回异常
	 */
	public enum ErrType {OPPOSITE, CATCH, PORTAL, ECSP, CSB};
	private ErrType errType;
	private String errCode;
	private String errStack;
	private String errorInstNbr;
	private String method;
	private String msg;
	private Map<String, Object> paramMap;
	private String paramString;
	// 发生异常时需要将日志标识ID返回给页面显示
	private String logSeqId;
	
	/**
	 * 不含有logSeqId
	 */
	public InterfaceException(ErrType errType, String method, String paramString, Throwable t) {
		super(t);
		this.errType = errType;
		this.method = method;
		this.paramString = paramString;
	}
	
	/**
	 * 含有logSeqId
	 */
	public InterfaceException(ErrType errType, String method, String paramString, Throwable t, String logSeqId) {
		super(t);
		this.errType = errType;
		this.method = method;
		this.paramString = paramString;
		this.logSeqId = logSeqId;
	}
	
	/**
	 * 不含有logSeqId
	 */
	public InterfaceException(ErrType errType, String method, String errStack, String paramString) {
		this.errType = errType;
		this.method = method;
		this.errStack = errStack;
		this.paramString = paramString;
	}
	
	/**
	 * 含有logSeqId
	 */
	public InterfaceException(ErrType errType, String method, String errStack, String paramString, String logSeqId) {
		this.errType = errType;
		this.method = method;
		this.errStack = errStack;
		this.paramString = paramString;
		this.logSeqId = logSeqId;
	}
	
	/**
	 * 不含有errorInstNbr
	 */
	public InterfaceException(ErrType errType, String method, String resultMsg, String errCode, String errStack, String paramString) {
		this.errType = errType;
		this.method = method;
		this.msg = resultMsg;
		this.errCode = errCode;
		this.errStack = errStack;
		this.paramString = paramString;
	}
	
	/**
	 * 含有errorInstNbr logSeqId
	 */
	public InterfaceException(ErrType errType, String method, String resultMsg, String errCode, String errStack, String errorInstNbr, String paramString, String logSeqId) {
		this.errType = errType;
		this.method = method;
		this.msg = resultMsg;
		this.errCode = errCode;
		this.errStack = errStack;
		this.errorInstNbr = errorInstNbr;
		this.paramString = paramString;
		this.logSeqId = logSeqId;
	}
	
	/**
	 * 含有errorInstNbr
	 */
	public InterfaceException(ErrType errType, String method, String resultMsg, String errCode, String errStack, String errorInstNbr, String paramString) {
		this.errType = errType;
		this.method = method;
		this.msg = resultMsg;
		this.errCode = errCode;
		this.errStack = errStack;
		this.errorInstNbr = errorInstNbr;
		this.paramString = paramString;
	}
	
	public String getMethod() {
		return this.method;
	}
	
	public String getMsg() {
		return this.msg;
	}
	
	public ErrType getErrType() {
		return this.errType;
	}
	
	public String getErrCode() {
		return this.errCode;
	}
	
	public void setErrCode(String errCode) {
		this.errCode = errCode;
	}
	
	public String getErrStack() {
		return this.errStack;
	}

	public Map<String, Object> getParamMap() {
		return paramMap;
	}

	public void setParamMap(Map<String, Object> paramMap) {
		this.paramMap = paramMap;
	}

	public String getParamString() {
		return paramString;
	}

	public void setParamString(String paramString) {
		this.paramString = paramString;
	}

	public String getErrorInstNbr() {
		return errorInstNbr;
	}

	public void setErrorInstNbr(String errorInstNbr) {
		this.errorInstNbr = errorInstNbr;
	}

	public String getLogSeqId() {
		return logSeqId;
	}

	public void setLogSeqId(String logSeqId) {
		this.logSeqId = logSeqId;
	}
	
}

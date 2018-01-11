package com.ailk.ecsp.exception;

public class BaseRuntimeException extends Throwable {

	private static final long serialVersionUID = 1L;
	private String result_code;
	private String result_msg;
	private String result_name;
	
	public BaseRuntimeException() {
		this.result_code = "POR-1999";
		this.result_name = "服务层运行未知异常";
		this.result_msg  = "服务层运行未知异常";
	}
	
	public BaseRuntimeException(String resultcode,String resultname,String resultmsg) {
		this.result_code = resultcode;
		this.result_msg = resultmsg;
		this.result_name = resultname;
	}
	
	
	public String getResult_code() {
		return result_code;
	}
	public String getResult_msg() {
		return result_msg;
	}
	public String getResult_name() {
		return result_name;
	}
	
	
}

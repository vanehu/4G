package com.ailk.ecsp.exception;

public class BaseSecurityException  extends Throwable{

	private static final long serialVersionUID = 1L;
	private String result_code;
	private String result_msg;
	private String result_name;
	
	public BaseSecurityException(String resultcode,String resultname,String resultmsg) {
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

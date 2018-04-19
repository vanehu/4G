package com.ailk.ecsp.sm.common;

import java.util.HashMap;

public class ResultMap extends HashMap<String, Object>{
	private static final long serialVersionUID = 1231857780762184679L;
	public static String CODE_SUCCESS = "SM-0000";
	public static String CODE_FAIL = "SM-9999";
	public static String RESULT_CODE_KEY = "code";
	public static String RESULT_MSG_KEY = "msg";
	public void setSuccess(){
		this.put(RESULT_CODE_KEY, CODE_SUCCESS);
	}
	
	public void setSuccess(String msg){
		this.setSuccess();
		this.setMsg(msg);
	}
	
	public void setFail(){
		this.put(RESULT_CODE_KEY, CODE_FAIL);
	}
	
	public void setFail(String msg){
		this.setFail();
		this.setMsg(msg);
	}
	
	public void setFail(String code,String msg){
		this.setCode(code);
		this.setMsg(msg);
	}
	
	public void setMsg(String msg){
		this.put(RESULT_MSG_KEY, msg);
	}
	
	public void setCode(String code){
		this.put(RESULT_CODE_KEY, code);
	}
	
	public boolean isSuccess(){
		String code = (String)this.get(RESULT_CODE_KEY);
		if(CODE_SUCCESS.equals(code)){
			return true;
		}
		return false;
	}
	
	public boolean isFail(){
		if(isSuccess()){
			return false;
		}
		return true;
	}
	
	public String getCode(){
		return (String)this.get(RESULT_CODE_KEY);
	}
	
	public String getMsg(){
		return (String)this.get(RESULT_MSG_KEY);
	}
}

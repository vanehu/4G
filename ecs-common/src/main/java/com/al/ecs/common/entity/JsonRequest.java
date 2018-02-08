package com.al.ecs.common.entity;

/**
 * 请求参数统一格式注解检查
 * @param <T> Map or List类型
 * @author tang
 */
public class JsonRequest<T> {

	/** 请求流水号 */
	private String requestSerial= null;

	/** 请求入参数据 Map or List类型  */
	private T data = null;

	public String getRequestSerial() {
		return requestSerial;
	}
	public void setRequestSerial(String requestSerial) {
		this.requestSerial = requestSerial;
	}

	public T getData() {
		return data;
	}
	public void setData(T data) {
		this.data = data;
	}
}

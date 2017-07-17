package com.ailk.ecsp.intf.httpinvoker;

import java.lang.reflect.Proxy;
/**
 * 代理工厂.
 * @author chenyl
 */
public class HttpInvokerFactory {
	public static <T> T getService(Class<T> clazz,String serviceUrl) {
		try {
			T f = (T) Proxy.newProxyInstance(clazz.getClassLoader(), new Class[] { clazz }, new HttpInvokerHandler<T>(clazz,serviceUrl));
			return f;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
}

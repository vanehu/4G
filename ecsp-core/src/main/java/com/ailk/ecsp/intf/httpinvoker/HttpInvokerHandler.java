package com.ailk.ecsp.intf.httpinvoker;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

import org.springframework.remoting.httpinvoker.HttpInvokerProxyFactoryBean;

/**
 * HttpInvoker.
 * @author chenyl
 * @param <T>
 */
public class HttpInvokerHandler<T> implements InvocationHandler {
	private Class<T> clazz;
	private String serviceUrl;
//	public HttpInvokerHandler(Class<T> clazz) {
//		this.clazz = clazz;
//	}
	
	public HttpInvokerHandler(Class<T> clazz,String serviceUrl) {
		this.clazz = clazz;
		this.serviceUrl = serviceUrl;
	}

	public Object invoke(final Object proxy, Method method, Object[] args) throws Throwable {
		HttpInvokerProxyFactoryBean bean = new HttpInvokerProxyFactoryBean() {
			@Override
			public Class getServiceInterface() {
				try {
//					return Class.forName(clazz.getName());
					return Class.forName(clazz.getName(),true,clazz.getClassLoader());
				} catch (ClassNotFoundException e) {
					e.printStackTrace();
				}
				return super.getServiceInterface();
			}

			@Override
			public String getServiceUrl() {
				return serviceUrl;
			}
		};
		bean.setBeanClassLoader(clazz.getClassLoader());
		bean.afterPropertiesSet();
		T service = (T) bean.getObject();
		return method.invoke(service, args);
	}
}

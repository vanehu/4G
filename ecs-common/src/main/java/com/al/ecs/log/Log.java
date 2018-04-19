package com.al.ecs.log;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
/**
 * 对日志类的封装.
 * <P>
 * 增加输出员工号等其他额外信息
 * <P>
 * @author tang
 *
 */
public final class Log {
	private  org.slf4j.Logger logger =null;
	private Log(Logger logger){
		this.logger= logger;
	}
	public static Log getLog(String name) {
		return  new Log(LoggerFactory.getLogger(name));
	}
	
	public static Log getLog(Class<?> clazz){
		return new  Log(LoggerFactory.getLogger(clazz));
	}
	
	public void debug(String message, Object... args) {
			if(isDebugEnabled()){
				logger.debug(message,args);
			}
	}
	

	public void info(String message, Object... args) {
		if(isInfoEnabled()){
				logger.info(message,args);
		}
	}

	public void warn(String message, Object... args) {
		if(isWarnEnabled()){
				logger.warn(message,args);
		}
	}

	public void trace(String message, Object... args) {
		if(isTraceEnabled()){
				logger.trace(message,args);
		}
	}

	public void error(String message, Object... args) {
		logger.error(message,args);
	}

	public void error(String message, Throwable e) {
				logger.error(message,e);
	}
	public void error(Throwable e) {
		logger.error("ERROR EXCEPTION ",e);
}
	public boolean isDebugEnabled() {
		if (logger == null){
			return false;
		}
		return logger.isDebugEnabled();
	}

	public boolean isErrorEnabled() {
		if (logger == null){
			return false;
		}
		return logger.isErrorEnabled();
	}

	public boolean isInfoEnabled() {
		if (logger == null){
			return false;
		}
		return logger.isInfoEnabled();
	}

	public boolean isTraceEnabled() {
		if (logger == null){
			return false;
		}
		return logger.isTraceEnabled();
	}

	public boolean isWarnEnabled() {
		if (logger == null){
			return false;
		}
		return logger.isWarnEnabled();
	}
}

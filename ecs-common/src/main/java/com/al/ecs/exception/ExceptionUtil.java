package com.al.ecs.exception;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;



/**
 * 异常处理工具类.
 *  <P>
 * @author			tang zheng yu
 * @version			V1.0 2011-12-23 
 * @CreateDate	2011-12-23 上午11:32:28
 * @CopyRight	亚信联创电信CRM研发部
 */
public class ExceptionUtil {

	/**
	 * 创建异常堆栈信息.
	 * @param message 堆栈信息
	 * @param cause Throwable
	 * @return String 异常堆栈信息
	 */
	public static String buildMessage(String message, Throwable cause) {
		if (cause != null) {
			StringBuilder buf = new StringBuilder();
			if (message != null) {
				buf.append(message).append("; ");
			}
			buf.append("nested exception is ").append(cause);
			return buf.toString();
		} else {
			return message;
		}
	}
	
	/**
	 * 创建异常堆栈信息.
	 * @param message 堆栈信息
	 * @param ex Exception
	 * @return String 异常堆栈信息
	 */
	public static String buildMessage(String message, Exception ex) {
		if (ex != null) {
			StringBuilder buf = new StringBuilder();
			if (message != null) {
				buf.append(message).append("; ");
			}
			ByteArrayOutputStream   bufe   =   new   ByteArrayOutputStream(); 
			ex.printStackTrace(new   PrintWriter(bufe,   true)); 
			String   expMessage   =   bufe.toString();
			buf.append("nested exception is ").append(expMessage);
			return buf.toString();
		} else {
			return message;
		}
	}
	

}

package com.al.ecs.exception;

import java.io.PrintStream;
import java.io.PrintWriter;


/**
 * 无权限访问异常.
 * <P>
 * 抛出异常时，请一定要返回一个错误编码到前台。
 *  <P>
 * @author			tang zheng yu
 * @version			V1.0 2011-12-23 
 * @CreateDate	2011-12-23 上午11:32:28
 * @CopyRight	亚信联创电信CRM研发部
 *
 */
public class AuthorityException extends Exception {

	private static final long serialVersionUID = -2988941253019291077L;
	private Result result;
	private boolean isAjax;

	/**
	 * 构造方法.
	 * @param result 返回值
	 * @param cause  异常堆栈
	 */
	public AuthorityException(Result result, Throwable cause) {
		super(result.getMsg(), cause);
		this.result = result;
	}

	/**
	 * 构造方法.
	 * @param code 返回码
	 * @param msg  错误消息
	 */
	public AuthorityException(int code, String msg) {
		super(msg);
		this.result = new Result(code, msg);
	}

	/**
	 * 构造方法.
	 * result 为 code:1101,用户未登录
	 * @param isAjax 是否是ajax提交

	 */
	public AuthorityException(boolean isAjax) {
		super(ResultConstant.ACCESS_NOT_AUTHORITY_URL.getMsg());
		this.result = ResultConstant.ACCESS_NOT_AUTHORITY_URL;
		this.isAjax=isAjax;
	}
	
	/**
	 * 构造方法.
	 * @param result 返回值
	 * @param isAjax 是否是ajax提交

	 */
	public AuthorityException(Result result, boolean isAjax) {
		super(result.getMsg());
		this.result = new Result(result.getCode(), result.getMsg());
		this.isAjax=isAjax;
	}
	
	/**
	 * 构造方法.
	 * @param result 返回值
	 * @param detail 具体的返回消息

	 */
	public AuthorityException(Result result, String detail) {
		super(result.getMsg() + "," + detail);
		this.result = new Result(result.getCode(), result.getMsg() + "," + detail);
	}

	/**
	 * 构造方法.
	 * @param result 返回值
	 * @param detail 具体的返回消息
	 * @param cause  异常堆栈
	 */
	public AuthorityException(Result result, String detail, Throwable cause) {
		super(result.getMsg() + "," + detail, cause);
		this.result = new Result(result.getCode(), result.getMsg() + "," + detail);
	}

	/**
	 * 构造方法.
	 * @param code	返回码
	 * @param msg	返回消息
	 * @param cause 异常堆栈
	 */
	public AuthorityException(int code, String msg, Throwable cause) {
		super(msg, cause);
		this.result = new Result(code, msg);
	}

	/**
	 * 构造方法.
	 * @param code	返回码
	 * @param cause	异常堆栈
	 */
	public AuthorityException(int code, Throwable cause) {
		super(cause);
		this.result = new Result(code, null);
	}

	/**
	 * 返回异常消息.
	 * @return 异常消息
	 */
	@Override
	public String getMessage() {
		return ExceptionUtil.buildMessage(super.getMessage(), getCause());
	}
	/**
	 * 异常.
	 * @return String 异常
	 */
	public String toXmlString() {
		StringBuilder sb = new StringBuilder();
		sb.append("<exception>");
		
		if (getResult() != null) {
			sb.append(result.toString());
		}
		sb.append("<exceptionTrace>");
		sb.append(getMessage());
		sb.append("</exceptionTrace>");
		
		sb.append("<exception/>");
		return sb.toString();
	}

	@Override
	public void printStackTrace(PrintStream ps) {
		ps.print("<exception>");
		if (getResult() != null) {
			ps.print(result.toString());
		} 
		ps.append("<exceptionTrace>");
		
		Throwable cause = getCause();
		if (cause == null) {
			super.printStackTrace(ps);
		} else {
			ps.println(this);
			ps.print("Caused by: ");
			cause.printStackTrace(ps);
		}
		ps.append("</exceptionTrace>");
		ps.println("</exception>");
	}

	@Override
	public void printStackTrace(PrintWriter pw) {
		pw.print("<exception>");
		if (getResult() != null) {
			pw.print(result.toString());
		} 
		pw.append("<exceptionTrace>");
		
		Throwable cause = getCause();
		if (cause == null) {
			super.printStackTrace(pw);
		} else {
			pw.println(this);
			pw.print("Caused by: ");
			cause.printStackTrace(pw);
		}
		pw.append("</exceptionTrace>");
		pw.println("</exception>");
	}

	/**
	 * 返回异常值.
	 * <P>
	 * @return	Result 异常值对象
	 */
	public Result getResult() {
		return result;
	}

	/**
	 * 设置结果. 
	 * @param result 结果
	 */
	public void setResult(Result result) {
		this.result = result;
	}

	/**
	 * 返回是否是ajax提交.
	 * @return boolean true:是ajax提交
	 */
	public boolean isAjax() {
		return isAjax;
	}

}

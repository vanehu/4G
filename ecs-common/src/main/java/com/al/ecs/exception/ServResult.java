package com.al.ecs.exception;

import java.io.Serializable;


/**
 * 错误编码集.
 * <P>
 * 服务层系统系统共用的错误编码,<BR>
 * 返回到前台，只能用如下几种编码<BR>
 *  四位数年0,1,-9开头的为内部保留编码,其他子系统不可使用 <BR>
 *  <P>
 * @author			xuj
 * @version			V1.0 2013-11-23 
 * @CreateDate	2013-11-23 上午11:32:28
 * @CopyRight	亚信联创电信EC研发部
 */
public class ServResult implements Serializable {	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String code = "POR-0000";
	private String msg = "成功";

	/**
	 * Result构造函数.
	 * @param code 编码
	 * @param msg 提示信息
	 */
	public ServResult(String code, String msg) {
		this.code = code;
		this.msg = msg;
	}

	/**
	 * Result构造函数.
	 * @param result Result 对象
	 */
	public ServResult(ServResult result) {
		this.code = result.getCode();
		this.msg = result.getMsg();
	}

	/**
	 * 编码.
	 * @return String code
	 */
	public String getCode() {
		return code;
	}

	/**
	 * 设置编码.
	 * @param  code 编码
	 */
	public void setCode(String code) {
		this.code = code;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	/**
	 * 只要错误编码相同,就认为两个对象相同.
	 * @param r 对象
	 * @return boolean true:相等
	 */
	@Override
	public boolean equals(Object r) {
		boolean b = false;
		if (r instanceof ServResult) {
			if (getCode() == ((ServResult) r).getCode()) {
				b = true;
			} else {
				b = false;
			}
		} else {
			b = super.equals(r);
		}
		return b;
	}
	@Override
	public int hashCode(){
		return super.hashCode();
	}
	/**
	 * 返回Result对象的toString字符串.
	 * @return String Result对象的toString字符串
	 */
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("<code>");
		sb.append(getCode());
		sb.append("</code>");
		sb.append("<msg>");
		sb.append(getMsg());
		sb.append("</msg>");
		return sb.toString();
	}
}

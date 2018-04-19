package com.al.ecs.common.entity;
/**
 * 操作日志监控 .
 * <BR>
 *  记录前台送过来的入参和后台回参,操作账号,对应类,方法.操作类型.
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-3-28
 * @createDate 2012-3-28 上午10:33:24
 * @modifyDate	 tang 2012-3-28 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class OperatorLog {
	/** 操作流水号 */
	private String optSerial;
	/** 操作工号 */
	private String staffCode;
	/** 操作编码 */
	private String optCode;
	/** 入参 */
	private String inParam;
	/** 回参 */
	private String outParam;
	/** 类方法 */
	private String classMethod;
	/** 描述 */
	private String desc;
	/** ip地址 */
	private String ip;
	/** 耗时:单位毫秒 */
	private long time;
	/** 日志级别 */
	private LevelLog levelLog;
	
	public LevelLog getLevelLog() {
		return levelLog;
	}
	public void setLevelLog(LevelLog levelLog) {
		this.levelLog = levelLog;
	}
	public String getOptSerial() {
		return optSerial;
	}
	public void setOptSerial(String optSerial) {
		this.optSerial = optSerial;
	}

	public long getTime() {
		return time;
	}
	public void setTime(long time) {
		this.time = time;
	}
	public String getStaffCode() {
		return staffCode;
	}
	public void setStaffCode(String staffCode) {
		this.staffCode = staffCode;
	}
	public String getOptCode() {
		return optCode;
	}
	public void setOptCode(String optCode) {
		this.optCode = optCode;
	}
	public String getInParam() {
		return inParam;
	}
	public void setInParam(String inParam) {
		this.inParam = inParam;
	}
	public String getOutParam() {
		return outParam;
	}
	public void setOutParam(String outParam) {
		this.outParam = outParam;
	}
	public String getClassMethod() {
		return classMethod;
	}
	public void setClassMethod(String classMethod) {
		this.classMethod = classMethod;
	}
	public String getDesc() {
		return desc;
	}
	public void setDesc(String desc) {
		this.desc = desc;
	}
	public String getIp() {
		return ip;
	}
	public void setIp(String ip) {
		this.ip = ip;
	}
}

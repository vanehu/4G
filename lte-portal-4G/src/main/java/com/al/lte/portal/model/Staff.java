package  com.al.lte.portal.model;

import org.hibernate.validator.constraints.NotEmpty;

import  com.al.ecs.spring.annotation.valid.LengthCN;

/**
 * 代理商员工表单对象 .
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-3-27
 * @createDate 2012-3-27 下午4:11:16
 * @modifyDate	 tang 2012-3-27 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class Staff {

	@NotEmpty(message = "工号不能为空")
	//@LengthCN(max = 20, message = "工号长度不能超过{max}")
	private String staffCode;
	//@LengthCN(min=0,max = 12, message = "密码长度范围为{min}和{max}之间")
	private String password;
	
	private String staffProvCode;
	
	private String lanIp;
	
	private String connectiontime;
	
	private String sendtime;
	
	private String waitingtime;
	
	private String accepttime;
	
	private String macStr;
	
	private String fingerprint;
	
	public String getStaffCode() {
		return staffCode;
	}
	public String getStaffProvCode() {
		return staffProvCode;
	}
	public void setStaffProvCode(String staffProvCode) {
		this.staffProvCode = staffProvCode;
	}
	public void setUsername(String staffCode) {
		this.staffCode = staffCode;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	
	public String getLanIp() {
		return lanIp;
	}
	public void setLanIp(String lanIp) {
		this.lanIp = lanIp;
	}
	
	public String getconnectiontime() {
		return connectiontime;
	}
	public void setconnectiontime(String connectiontime) {
		this.connectiontime = connectiontime;
	}
	
	public String getsendtime() {
		return sendtime;
	}
	public void setsendtime(String sendtime) {
		this.sendtime = sendtime;
	}
	
	public String getwaitingtime() {
		return waitingtime;
	}
	public void setwaitingtime(String waitingtime) {
		this.waitingtime = waitingtime;
	}
	
	public String getaccepttime() {
		return accepttime;
	}
	public void setaccepttime(String accepttime) {
		this.accepttime = accepttime;
	}
	public String getMacStr() {
		return macStr;
	}
	public void setMacStr(String macStr) {
		this.macStr = macStr;
	}
	public String getFingerprint() {
		return fingerprint;
	}
	public void setFingerprint(String fingerprint) {
		this.fingerprint = fingerprint;
	}
}

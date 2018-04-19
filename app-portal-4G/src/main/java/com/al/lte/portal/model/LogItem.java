package  com.al.lte.portal.model;

import java.io.Serializable;
import java.util.Date;

/**
 * 用户操作日志
 * @author tang
 */
public class LogItem implements Serializable {
	private static final long serialVersionUID = 1L;
	private Long id;
	/** 渠道ID */
	private String channel_id;
	/** 接入平台ID */
	private String platform_id;
	/** 登录客户ID */
	private String staff_id;
	/** 登录客户帐号 */
	private String login_account;
	/** 被操作客户ID */
	private String opt_staff_id;
	/** 被操作客户产品ID */
	private String opt_prod_id;
	/** 登录客户区号 */
	private String area_code;
	/** 被操作的客户区号 */
	private String opt_area_code;
	/** 请求服务ID */
	private String xrainbow_service_id;
	/** IP地址 */
	private String ip_address;
	/** 访问开始时间 */
	private Date start_visit_dt;
	/** 访问结束时间 */
	private Date end_visit_dt;
	/** 入参 */
	private String in_param;
	/** 回参 */
	private String out_param;
	/** 接入平台设备识别码，手机为IMEI */
	private String terminal_id;
	/** 返回客户结果码:0成功 */
	private String resultCode;
	/** 返回客户结果描述 */
	private String resultMsg;
	/** 操作流水号，调用门户层的 */
	private String optFlowNum;
	/** 业务运行流水号，调用服务层的 */
	private String busiRunNbr;
	/** 调用服务层时间间隔，单位毫秒 */
	private String duration;
	/** 调用服务层业务编码 */
	private String serviceCode;
	
	public String getServiceCode() {
		return serviceCode;
	}
	public void setServiceCode(String serviceCode) {
		this.serviceCode = serviceCode;
	}
	public String getBusiRunNbr() {
		return busiRunNbr;
	}
	public void setBusiRunNbr(String busiRunNbr) {
		this.busiRunNbr = busiRunNbr;
	}
	public String getDuration() {
		return duration;
	}
	public void setDuration(String duration) {
		this.duration = duration;
	}
	public String getOptFlowNum() {
		return optFlowNum;
	}
	public void setOptFlowNum(String optFlowNum) {
		this.optFlowNum = optFlowNum;
	}
	public String getResultMsg() {
		return resultMsg;
	}
	public void setResultMsg(String resultMsg) {
		this.resultMsg = resultMsg;
	}
	public String getOpt_staff_id() {
		return opt_staff_id;
	}
	public void setOpt_staff_id(String optStaffId) {
		opt_staff_id = optStaffId;
	}
	public String getLogin_account() {
		return login_account;
	}
	public void setLogin_account(String loginAccount) {
		login_account = loginAccount;
	}
	public String getResultCode() {
		return resultCode;
	}
	public void setResultCode(String resultCode) {
		this.resultCode = resultCode;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getPlatform_id() {
		return platform_id;
	}
	public void setPlatform_id(String platformId) {
		platform_id = platformId;
	}
	public String getStaff_id() {
		return staff_id;
	}
	public void setStaff_id(String staffId) {
		staff_id = staffId;
	}
	public String getOpt_prod_id() {
		return opt_prod_id;
	}
	public void setOpt_prod_id(String optProdId) {
		opt_prod_id = optProdId;
	}
	public String getArea_code() {
		return area_code;
	}
	public void setArea_code(String areaCode) {
		area_code = areaCode;
	}
	public String getOpt_area_code() {
		return opt_area_code;
	}
	public void setOpt_area_code(String optAreaCode) {
		opt_area_code = optAreaCode;
	}
	public String getXrainbow_service_id() {
		return xrainbow_service_id;
	}
	public void setXrainbow_service_id(String xrainbowServiceId) {
		xrainbow_service_id = xrainbowServiceId;
	}
	public String getIp_address() {
		return ip_address;
	}
	public void setIp_address(String ipAddress) {
		ip_address = ipAddress;
	}
	public Date getStart_visit_dt() {
		return start_visit_dt;
	}
	public void setStart_visit_dt(Date startVisitDt) {
		start_visit_dt = startVisitDt;
	}
	public Date getEnd_visit_dt() {
		return end_visit_dt;
	}
	public void setEnd_visit_dt(Date endVisitDt) {
		end_visit_dt = endVisitDt;
	}
	public String getIn_param() {
		return in_param;
	}
	public void setIn_param(String inParam) {
		in_param = inParam;
	}
	public String getOut_param() {
		return out_param;
	}
	public void setOut_param(String outParam) {
		out_param = outParam;
	}
	public String getTerminal_id() {
		return terminal_id;
	}
	public void setTerminal_id(String terminalId) {
		terminal_id = terminalId;
	}
	public String getChannel_id() {
		return channel_id;
	}
	public void setChannel_id(String channelId) {
		channel_id = channelId;
	}
}

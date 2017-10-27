package  com.al.lte.portal.model;

import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.time.DateFormatUtils;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ecs.common.web.HttpUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;

/**
 * 日志模型类(日志平台表模型)
 * @author ZhangYu
 * @since 2017-06-02
 */
public class ServiceLog{
	
	private final Log log = Log.getLog(ServiceLog.class);
	
	private String logSeqId;
	
	private String prefix;
	
	private String serviceCode;
	
	private String intfUrl;
	
	private String paramStr;
	
	private String returnStr;
	
	private String beginTime;
	
	private String endTime;
	
	private DataBus DataBus;
	
	private HttpServletRequest request;
	
	private String areaId;
	
	private String mac;
	
	//门户订单ID
	private String portalId;
	
	//业务场景
	private String servCode;
	
	//菜单信息
	private String menuInfo;
	
	private String soNbr;
	
	private String olId;
	
	private String remark;
	
	private String ip;
	
	private String errorCode;
	
	private String localAddr;
	
	private String localPort;
	
	private String remoteAddr;
	
	private String remotePort;
	
	private String transId;
	
	private String useTime;
	
	private String busiType;
	
	private String servRunNbr;
	
	private String busiRunNbr;
	
	private SessionStaff sessionStaff;
	
	private static ServiceLog serviceLog;
	
	private final String DEFAULT_TIME_FORMAT = "yyyy/MM/dd HH:mm:ss";
	
	static {
		serviceLog = new ServiceLog();
	}
	
	public static ServiceLog getInstance(){
		return serviceLog;
	}
	
	public static ServiceLog getNewInstance(){
		return new ServiceLog();
	}
	
	public DataBus initDataBus(DataBus db, SessionStaff sessionStaff){
		db.setPortalCode(PortalServiceCode.SERVICE_PORTAL_CODE);
		db.setRoleCode(PortalServiceCode.SERVICE_PORTAL_ROLE_CODE);
		db.setPassword(PortalServiceCode.SERVICE_PORTAL_PASSWORD);
		
		if(sessionStaff != null){
			db.setOperatStaff(sessionStaff.getStaffCode());
			db.setOperatChannel(sessionStaff.getCurrentChannelId());
			db.setProvinceCode(sessionStaff.getProvinceCode());
			db.setOperater(sessionStaff.getStaffCode());
			db.setOperatStaffID(sessionStaff.getStaffId());
			db.setOperatStaffName(sessionStaff.getStaffName());
			db.setOperaterArea(sessionStaff.getCurrentAreaId());
			db.setOperatChannelName(sessionStaff.getCurrentChannelName());
		}
		
		return db;
	}
	
	public void saveLog(){
		InterfaceClient.saveLog(serviceLog);
	}
	
	/**
	 * how to save log asynchronously？
	 */
	public void saveLogAsyn(){
		InterfaceClient.saveLog(serviceLog);
	}

	public String getLogSeqId() {
		return logSeqId;
	}

	public void setLogSeqId(String logSeqId) {
		this.logSeqId = logSeqId;
	}

	public String getPrefix() {
		return prefix;
	}

	public void setPrefix(String prefix) {
		this.prefix = prefix;
	}

	public String getServiceCode() {
		return serviceCode;
	}

	public void setServiceCode(String serviceCode) {
		this.serviceCode = serviceCode;
	}

	public String getIntfUrl() {
		return intfUrl;
	}

	public void setIntfUrl(String intfUrl) {
		this.intfUrl = intfUrl;
	}

	public String getParamStr() {
		return paramStr;
	}

	public void setParamStr(String paramStr) {
		this.paramStr = paramStr;
	}

	public String getReturnStr() {
		return returnStr;
	}

	public void setReturnStr(String returnStr) {
		this.returnStr = returnStr;
	}

	public String getBeginTime() {
		return beginTime;
	}

	public void setBeginTime(Date beginDate) {
		this.beginTime = DateFormatUtils.format(beginDate, this.DEFAULT_TIME_FORMAT);
	}

	public String getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endDate) {
		this.endTime = DateFormatUtils.format(endDate, this.DEFAULT_TIME_FORMAT);
	}

	public HttpServletRequest getRequest() {
		return request;
	}

	public void setRequest(HttpServletRequest request) {
		this.request = request;
	}

	public String getAreaId() {
		return areaId;
	}

	public void setAreaId(String areaId) {
		this.areaId = areaId;
	}

	public String getMac() {
		return mac;
	}

	public void setMac(String mac) {
		this.mac = mac;
	}

	public String getPortalId() {
		return portalId;
	}

	public void setPortalId(String portalId) {
		this.portalId = portalId;
	}

	public String getServCode() {
		return servCode;
	}

	public void setServCode(String servCode) {
		this.servCode = servCode;
	}

	public String getMenuInfo() {
		return menuInfo;
	}

	public void setMenuInfo(String menuInfo) {
		this.menuInfo = menuInfo;
	}

	public String getSoNbr() {
		return soNbr;
	}

	public void setSoNbr(String soNbr) {
		this.soNbr = soNbr;
	}

	public String getOlId() {
		return olId;
	}

	public void setOlId(String olId) {
		this.olId = olId;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public SessionStaff getSessionStaff() {
		return sessionStaff;
	}

	public void setSessionStaff(SessionStaff sessionStaff) {
		this.sessionStaff = sessionStaff;
	}
	
	public String getStaffId() {
		 if(this.sessionStaff != null){
			 return this.sessionStaff.getStaffId();
		 } else{
			 return null;
		 }
	}
	
	public String getChannelId() {
		 if(this.sessionStaff != null){
			 return this.sessionStaff.getChannelId();
		 } else{
			 return null;
		 }
	}
	
	public String getStaffName() {
		 if(this.sessionStaff != null){
			 return this.sessionStaff.getStaffName();
		 } else{
			 return null;
		 }
	}
	
	public String getChannelName() {
		 if(this.sessionStaff != null){
			 return this.sessionStaff.getChannelName();
		 } else{
			 return null;
		 }
	}
	
	public String getCurrentAreaId() {
		 if(this.sessionStaff != null){
			 return this.sessionStaff.getCurrentAreaId();
		 } else{
			 return null;
		 }
	}
	
	public String getCurrentChannelId() {
		 if(this.sessionStaff != null){
			 return this.sessionStaff.getCurrentChannelId();
		 } else{
			 return null;
		 }
	}
	
	public String getSessionId() {
		 if(this.request != null){
			 return ServletUtils.getSession(this.request).getId();
		 } else{
			 return null;
		 }
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public DataBus getDataBus() {
		return DataBus;
	}

	public void setDataBus(DataBus dataBus) {
		DataBus = dataBus;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}

	public String getLocalAddr() {
		if(this.localAddr == null){
			this.localAddr = HttpUtils.getHostIpAddress();
		}
		return this.localAddr;
	}

	public void setLocalAddr(String localAddr) {
		this.localAddr = localAddr;
	}

	public String getLocalPort() {
		if(this.localPort == null){
			if(this.request != null){
				this.localPort = String.valueOf(this.request.getLocalPort());
			}
		}
		
		return this.localPort;
	}

	public void setLocalPort(String localPort) {
		this.localPort = localPort;
	}

	public String getRemoteAddr() {
		if(this.remoteAddr == null){
			if(this.request != null){
				this.remoteAddr =  ServletUtils.getIpAddr(this.request);
			}
		}
		
		return this.remoteAddr;
	}

	public void setRemoteAddr(String remoteAddr) {
		this.remoteAddr = remoteAddr;
	}

	public String getRemotePort() {
		if(this.remotePort == null){
			if(this.request != null){
				this.remotePort = String.valueOf(this.request.getRemotePort());
			}
		}
		
		return this.remotePort;
	}

	public void setRemotePort(String remotePort) {
		this.remotePort = remotePort;
	}

	public String getTransId() {
		if(this.DataBus != null){
			this.transId = MapUtils.getString(this.DataBus.getParammap(), "transactionId", "");
		}
		
		return this.transId;
	}

	public void setTransId(String transId) {
		this.transId = transId;
	}

	public String getUseTime() {
		this.useTime = Long.toString(0);
		return this.useTime;
	}

	public void setUseTime(String useTime) {
		this.useTime = useTime;
	}

	public String getBusiType() {
		return busiType;
	}

	public void setBusiType(String busiType) {
		this.busiType = busiType;
	}

	public String getServRunNbr() {
		return servRunNbr;
	}

	public void setServRunNbr(String servRunNbr) {
		this.servRunNbr = servRunNbr;
	}

	public String getBusiRunNbr() {
		return busiRunNbr;
	}

	public void setBusiRunNbr(String busiRunNbr) {
		this.busiRunNbr = busiRunNbr;
	}
	
}

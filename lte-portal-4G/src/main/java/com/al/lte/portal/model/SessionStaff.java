package  com.al.lte.portal.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;

import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.SysConstant;

/**
 * 存储Session的工号会话信息 .
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午3:18:32
 * @modifyDate	 tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class SessionStaff implements Serializable {
	private static final long serialVersionUID = 6280564674602051144L;
	/** 工号编码 */
	private String staffId;
	/** 工号或者是登录账号 */
	private String staffCode;
	/** 销售员编码 */
	private String salesCode;
	/** 工号名 */
	private String staffName;
	/** 归属地区ID */
	private String areaId;
	/** 归属区号 */
	private String areaCode;
	/** 地区名称 */
	private String regionName;
	/** 所属上级省份名称 */
	private String upProvinName;
	/** 归属城市名*/
	private String cityName;
	/** 归属区县名 */
	private String countryName;
	/** 受理渠道 ID  */
	private String channelId;
	/** 归属渠道名  */
	private String channelName;
	/** 受理渠道 编码  */
	private String channelCode;
	/** 绑定手机号 */
	private String bindNumber;
	/** 组织ID */
	private String orgId;
	/** 组织名称 */
	private String orgName;
	/** 转售商Id */
	private String partnerId;
	/** 转售商编码 */
	private String partnerCode;
	/** 转售商名称 */
	private String partnerName;
	/** 是否发送短信标识 Y-发送 N-不发送*/
	private String smsPassFlag;
	/** 登录连接时间**/
	private String connectiontime;
	/** 发送时间**/
	private String sendtime;
	/** 等待时间**/
	private String waitingtime;
	/** 接受时间**/
	private String accepttime;
	/** mac地址**/
	private String macStr;
	/**客户名字**/
	private String partyName;
	/**大连锁经营主体Id**/
	private String operatorsId;
	/**身份证类型开关idType**/
	private String idType;
	/**UI页面集成令牌**/
	private String accessToken;
		
	/** 提示信息编码
	 * 0：正常；
	 * 1：修改初始密码提示；
	 * 2：密码将到期提示
	 */
	private String hintCode;
	
	/** 受理渠道ID  */
	private String currentChannelId;
	/** 受理渠道名  */
	private String currentChannelName;
	/** 受理渠道编码  */
	private String currentChannelCode;
	/** 受理地区ID*/
	private String currentAreaId;
	/** 受理地区区号*/
	private String currentAreaCode;
	/** 受理地区名称*/
	private String currentAreaName;
	private String currentAreaAllName;
	/** 省份编码，从登录入参中获取 */
	private String provinceCode;
	/** 当前登录IP地址 */
	private String ip;
	/** 登录日期 */
	private Date loginDate;
	/** 上次登录时间 */
	private String lastLoginDate;
	/**短信验证码*/
	private String mesKey;
	/**token*/
	private String token;
	/**实例客户ID*/
	private String custId;
	/**证件类型编码*/
	private String cardType;
	/**证件号码*/
	private String cardNumber;
	/**接入号码*/
	private String inPhoneNum;
	/** 数据路由关键字 */
	private String dbKeyWord;
	/** 受理渠道大类  */
	private String currentChannelType;
	/**是否使用精品渠道终端销售系统key：isUseGTS value：null（否）、10（ 否）、20 （是）*/
	private String isUseGTS;
	/** 手机信息  */
	private String phoneModel;
	/** 手机mac地址 */
	private String macAddr;
	/** 浏览器指纹 */
	private String fingerPrint;
	/**客户定位的客户分群标识，1100：公众客户；1000：政企客户*/
	private String custSegmentId;
	/**强商agent标识*/
	private String isStrBusi;
	/**订单提交返回报文*/
	private Map<String, Object> orderData;
	/**星级服务开关*/
	private String poingtType;
	/**证件类型编码*/
	private String custType;
	/**客户编码*/
	private String custCode;
	/**记录service/intf.custService/queryCust中的CN节点*/
	private String CN;
	/**ESS系统session*/
	private Map<String, Object> essSession;
	/**登录地区名*/
	private String loginAreaName;
	/**
	 * 用记录session来源的登录方式，tokenLogin 为能力开放，loginMH为4G
	 */
	private String logintype ;
	
	/**该工号具有的所有权限*/
	private ArrayList<String> privileges;
	
	public String getCustType() {
		return custType;
	}


	public void setCustType(String custType) {
		this.custType = custType;
	}


	public String getCustCode() {
		return custCode;
	}


	public void setCustCode(String custCode) {
		this.custCode = custCode;
	}


	public String getIsStrBusi() {
		return isStrBusi;
	}


	public void setIsStrBusi(String isStrBusi) {
		this.isStrBusi = isStrBusi;
	}

	public String getCustSegmentId() {
		return custSegmentId;
	}


	public void setCustSegmentId(String custSegmentId) {
		this.custSegmentId = custSegmentId;
	}


	public String getPhoneModel() {
		return phoneModel;
	}


	public void setPhoneModel(String phoneModel) {
		this.phoneModel = phoneModel;
	}


	public String getMacAddr() {
		return macAddr;
	}


	public void setMacAddr(String macAddr) {
		this.macAddr = macAddr;
	}


	public String getDbKeyWord() {
		return dbKeyWord;
	}


	public void setDbKeyWord(String dbKeyWord) {
		this.dbKeyWord = dbKeyWord;
	}


	public String getStaffId() {
		return staffId;
	}


	public void setStaffId(String staffId) {
		this.staffId = staffId;
	}


	public String getStaffCode() {
		return staffCode;
	}


	public void setStaffCode(String staffCode) {
		this.staffCode = staffCode;
	}


	public String getStaffName() {
		return staffName;
	}


	public void setStaffName(String staffName) {
		this.staffName = staffName;
	}


	public String getAreaId() {
		return areaId;
	}


	public void setAreaId(String areaId) {
		this.areaId = areaId;
	}


	public String getAreaCode() {
		return areaCode;
	}


	public void setAreaCode(String areaCode) {
		this.areaCode = areaCode;
	}


	public String getRegionName() {
		return regionName;
	}


	public void setRegionName(String regionName) {
		this.regionName = regionName;
	}


	public String getUpProvinName() {
		return upProvinName;
	}


	public void setUpProvinName(String upProvinName) {
		this.upProvinName = upProvinName;
	}


	public String getCityName() {
		return cityName;
	}


	public void setCityName(String cityName) {
		this.cityName = cityName;
	}


	public String getCountryName() {
		return countryName;
	}


	public void setCountryName(String countryName) {
		this.countryName = countryName;
	}


	public String getChannelId() {
		return channelId;
	}


	public void setChannelId(String channelId) {
		this.channelId = channelId;
	}
	
	public String getchannelCode() {
		return channelCode;
	}


	public void setchannelCode(String channelCode) {
		this.channelCode = channelCode;
	}

	public String getChannelName() {
		return channelName;
	}


	public void setChannelName(String channelName) {
		this.channelName = channelName;
	}


	public String getBindNumber() {
		return bindNumber;
	}


	public void setBindNumber(String bindNumber) {
		this.bindNumber = bindNumber;
	}


	public String getOrgId() {
		return orgId;
	}


	public void setOrgId(String orgId) {
		this.orgId = orgId;
	}


	public String getOrgName() {
		return orgName;
	}


	public void setOrgName(String orgName) {
		this.orgName = orgName;
	}


	public String getPartnerId() {
		return partnerId;
	}


	public void setPartnerId(String partnerId) {
		this.partnerId = partnerId;
	}


	public String getPartnerCode() {
		return partnerCode;
	}


	public void setPartnerCode(String partnerCode) {
		this.partnerCode = partnerCode;
	}


	public String getPartnerName() {
		return partnerName;
	}


	public void setPartnerName(String partnerName) {
		this.partnerName = partnerName;
	}


	public String getSmsPassFlag() {
		return smsPassFlag;
	}


	public void setSmsPassFlag(String smsPassFlag) {
		this.smsPassFlag = smsPassFlag;
	}


	public String getHintCode() {
		return hintCode;
	}


	public void setHintCode(String hintCode) {
		this.hintCode = hintCode;
	}


	public String getCurrentChannelId() {
		return currentChannelId;
	}


	public void setCurrentChannelId(String currentChannelId) {
		this.currentChannelId = currentChannelId;
	}
	
	public void setCurrentChannelCode(String currentChannelCode) {
		this.currentChannelCode = currentChannelCode;
	}
	
	public String getCurrentChannelCode() {
		return currentChannelCode;
	}


	public String getCurrentChannelName() {
		return currentChannelName;
	}


	public void setCurrentChannelName(String currentChannelName) {
		this.currentChannelName = currentChannelName;
	}


	public String getCurrentAreaId() {
		return currentAreaId;
	}


	public void setCurrentAreaId(String currentAreaId) {
		this.currentAreaId = currentAreaId;
	}


	public String getCurrentAreaCode() {
		return currentAreaCode;
	}


	public void setCurrentAreaCode(String currentAreaCode) {
		this.currentAreaCode = currentAreaCode;
	}


	public String getCurrentAreaName() {
		return currentAreaName;
	}


	public void setCurrentAreaName(String currentAreaName) {
		this.currentAreaName = currentAreaName;
	}


	public String getProvinceCode() {
		return provinceCode;
	}


	public void setProvinceCode(String provinceCode) {
		this.provinceCode = provinceCode;
	}


	public String getIp() {
		return ip;
	}


	public void setIp(String ip) {
		this.ip = ip;
	}


	public Date getLoginDate() {
		return loginDate;
	}


	public void setLoginDate(Date loginDate) {
		this.loginDate = loginDate;
	}


	public String getLastLoginDate() {
		return lastLoginDate;
	}


	public void setLastLoginDate(String lastLoginDate) {
		this.lastLoginDate = lastLoginDate;
	}


	public String getConnectiontime() {
		return connectiontime;
	}


	public void setConnectiontime(String connectiontime) {
		this.connectiontime = connectiontime;
	}


	public String getSendtime() {
		return sendtime;
	}


	public void setSendtime(String sendtime) {
		this.sendtime = sendtime;
	}


	public String getWaitingtime() {
		return waitingtime;
	}


	public void setWaitingtime(String waitingtime) {
		this.waitingtime = waitingtime;
	}


	public String getAccepttime() {
		return accepttime;
	}


	public void setAccepttime(String accepttime) {
		this.accepttime = accepttime;
	}


	public String getMacStr() {
		return macStr;
	}


	public void setMacStr(String macStr) {
		this.macStr = macStr;
	}


	/**
	 * 
	 * @param staffInfoMap
	 * @return
	 */
	public static SessionStaff setStaffInfoFromMap(Map<String, Object> staffInfoMap) {
		SessionStaff sessionStaff = new SessionStaff();
		//从系统管理接口返回
		sessionStaff.setStaffId(MapUtils.getString(staffInfoMap, "staffId", ""));
		sessionStaff.setStaffCode(MapUtils.getString(staffInfoMap, "staffCode",""));
		sessionStaff.setStaffName(MapUtils.getString(staffInfoMap, "staffName",""));
		sessionStaff.setSalesCode(MapUtils.getString(staffInfoMap, "salesCode",""));
		sessionStaff.setAreaId(MapUtils.getString(staffInfoMap, "areaId", ""));
		sessionStaff.setAreaCode(MapUtils.getString(staffInfoMap, "areaCode",""));
		sessionStaff.setRegionName(MapUtils.getString(staffInfoMap, "regionName",""));
		sessionStaff.setUpProvinName(MapUtils.getString(staffInfoMap, "upProvinName", ""));
		sessionStaff.setCityName(MapUtils.getString(staffInfoMap, "cityName",""));
		sessionStaff.setCountryName(MapUtils.getString(staffInfoMap, "countryName",""));
		sessionStaff.setChannelId(MapUtils.getString(staffInfoMap, "channelId",""));
		sessionStaff.setchannelCode(MapUtils.getString(staffInfoMap, "channelCode",""));
		sessionStaff.setChannelName(MapUtils.getString(staffInfoMap, "channelName", ""));
		sessionStaff.setBindNumber(MapUtils.getString(staffInfoMap, "bindNumber", ""));
		sessionStaff.setOrgId(MapUtils.getString(staffInfoMap, "orgId", ""));
		sessionStaff.setOrgName(MapUtils.getString(staffInfoMap, "orgName", ""));
		sessionStaff.setPartnerId(MapUtils.getString(staffInfoMap, "partnerId",""));
		sessionStaff.setPartnerCode(MapUtils.getString(staffInfoMap, "partnerCode", ""));
		sessionStaff.setPartnerName(MapUtils.getString(staffInfoMap, "partnerName", ""));
		sessionStaff.setHintCode(MapUtils.getString(staffInfoMap, "hintCode", ""));
		sessionStaff.setSmsPassFlag(MapUtils.getString(staffInfoMap, "smsPassFlag", ""));
		//非系统管理接口返回
		sessionStaff.setIp(MapUtils.getString(staffInfoMap, "ip", ""));
		sessionStaff.setAccepttime(MapUtils.getString(staffInfoMap, "accepttime", ""));
		sessionStaff.setSendtime(MapUtils.getString(staffInfoMap, "sendtime", ""));
		sessionStaff.setConnectiontime(MapUtils.getString(staffInfoMap, "connectiontime", ""));
		sessionStaff.setWaitingtime(MapUtils.getString(staffInfoMap, "waitingtime", ""));
		sessionStaff.setMacStr(MapUtils.getString(staffInfoMap, "macStr", ""));
		sessionStaff.setProvinceCode(MapUtils.getString(staffInfoMap, "staffProvCode", ""));
		sessionStaff.setMesKey(MapUtils.getString(staffInfoMap, "mesKey", ""));
		sessionStaff.setToken(MapUtils.getString(staffInfoMap, "token", ""));
		sessionStaff.setAccessToken(MapUtils.getString(staffInfoMap, "accessToken", ""));
		sessionStaff.setPhoneModel(MapUtils.getString(staffInfoMap, "phoneModel", ""));
		sessionStaff.setMacAddr(MapUtils.getString(staffInfoMap, "macAddr", ""));
		sessionStaff.setFingerprint(MapUtils.getString(staffInfoMap, "fingerPrint", ""));
		
		//增加星级服务开关
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		sessionStaff.setPoingtType(propertiesUtils.getMessage(SysConstant.POINGTTYPE+"-"+MapUtils.getString(staffInfoMap, "areaId","").substring(0,3)+"0000"));
		return sessionStaff;
	}
	
	public static SessionStaff setChannelInfoFromMap(SessionStaff sessionStaff, Map<String, Object> paramMap, Map<String, Object> mapSession) {
		sessionStaff.setCurrentChannelId(MapUtils.getString(paramMap, "id", ""));
		sessionStaff.setCurrentChannelName(MapUtils.getString(paramMap, "name", ""));
		sessionStaff.setCurrentChannelCode(MapUtils.getString(paramMap, "chnNbr", ""));
		sessionStaff.setCurrentAreaId(MapUtils.getString(paramMap, "areaId", ""));
		sessionStaff.setCurrentAreaCode(MapUtils.getString(paramMap, "zoneNumber", ""));
		sessionStaff.setCurrentAreaName(MapUtils.getString(paramMap, "areaName", ""));
		sessionStaff.setCurrentAreaAllName(MapUtils.getString(paramMap, "areaAllName", ""));
		sessionStaff.setCurrentChannelType(MapUtils.getString(paramMap, "type", ""));
		sessionStaff.setIsUseGTS(MapUtils.getString(paramMap, "isUseGTS", ""));
		sessionStaff.setOperatorsId(MapUtils.getString(paramMap, "operatorsId", ""));
		//身份证类型开发
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		String idTypeAreaId = "";
		if(MapUtils.getString(paramMap, "areaId")!= null && !"".equals(MapUtils.getString(paramMap, "areaId"))){
			idTypeAreaId = MapUtils.getString(paramMap, "areaId", "").substring(0,3);
		}
		sessionStaff.setIdType(propertiesUtils.getMessage(SysConstant.IDTYPE+"-"+idTypeAreaId+"0000"));
		CommonMethods.setloginArea2BusinessArea(sessionStaff, mapSession, false);
		
		return sessionStaff;
	}
	
	public static SessionStaff setCurrentChannelInfoFromMap(SessionStaff sessionStaff, Map<String, Object> paramMap, Map<String, Object> mapSession) {
		sessionStaff.setCurrentChannelId(MapUtils.getString(paramMap, "id", ""));
		sessionStaff.setCurrentChannelName(MapUtils.getString(paramMap, "name", ""));
		sessionStaff.setCurrentChannelCode(MapUtils.getString(paramMap, "chnNbr", ""));
		sessionStaff.setCurrentAreaId(MapUtils.getString(paramMap, "areaId", ""));
		sessionStaff.setCurrentAreaCode(MapUtils.getString(paramMap, "zoneNumber", ""));
		sessionStaff.setCurrentAreaName(MapUtils.getString(paramMap, "areaName", ""));
		sessionStaff.setCurrentAreaAllName(MapUtils.getString(paramMap, "areaAllName", ""));
		sessionStaff.setCurrentChannelType(MapUtils.getString(paramMap, "type", ""));
		sessionStaff.setIsUseGTS(MapUtils.getString(paramMap, "isUseGTS", ""));
		//身份证类型开发
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		sessionStaff.setIdType(propertiesUtils.getMessage(SysConstant.IDTYPE+"-"+MapUtils.getString(paramMap, "areaId", "").substring(0,3)+"0000"));
		CommonMethods.setloginArea2BusinessArea(sessionStaff, mapSession, false);
		
		return sessionStaff;
	}
	
	
	
	public String getCurrentAreaAllName() {
		return currentAreaAllName;
	}


	public void setCurrentAreaAllName(String currentAreaAllName) {
		this.currentAreaAllName = currentAreaAllName;
	}


	public static long getSerialversionuid() {
		return serialVersionUID;
	}


	public String getMesKey() {
		return mesKey;
	}


	public void setMesKey(String mesKey) {
		this.mesKey = mesKey;
	}


	public String getToken() {
		return token;
	}


	public void setToken(String token) {
		this.token = token;
	}


	public String getCustId() {
		return custId;
	}


	public void setCustId(String custId) {
		this.custId = custId;
	}


	public String getCardType() {
		return cardType;
	}


	public void setCardType(String cardType) {
		this.cardType = cardType;
	}


	public String getCardNumber() {
		return cardNumber;
	}


	public void setCardNumber(String cardNumber) {
		this.cardNumber = cardNumber;
	}


	public String getInPhoneNum() {
		return inPhoneNum;
	}


	public void setInPhoneNum(String inPhoneNum) {
		this.inPhoneNum = inPhoneNum;
	}


	public String getPartyName() {
		return partyName;
	}


	public void setPartyName(String partyName) {
		this.partyName = partyName;
	}

	public String getCurrentChannelType() {
		return currentChannelType;
	}

	public String getOperatorsId(){
		return operatorsId;
	}
	
	public void setOperatorsId(String operatorsId){
		this.operatorsId = operatorsId;
	}

	public void setCurrentChannelType(String currentChannelType) {
		this.currentChannelType = currentChannelType;
	}


	public String getIdType() {
		return idType;
	}


	public void setIdType(String idType) {
		this.idType = idType;
	}


	public String getAccessToken() {
		return accessToken;
	}


	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	public String getFingerprint() {
		return fingerPrint;
	}

	public void setFingerprint(String fingerPrint) {
		this.fingerPrint = fingerPrint;
	}


	public void setOrderData(Map<String, Object> orderData) {
		this.orderData = orderData;
	}


	public Map<String, Object> getOrderData() {
		return orderData;
	}


	public String getPoingtType() {
		return poingtType;
	}


	public void setPoingtType(String poingtType) {
		this.poingtType = poingtType;
	}


	public void setSalesCode(String salesCode) {
		this.salesCode = salesCode;
	}


	public String getSalesCode() {
		return salesCode;
	}


	public String getCN() {
		return CN;
	}

	public void setCN(String cN) {
		CN = cN;
	}


	public void setEssSession(Map<String, Object> essSession) {
		this.essSession = essSession;
	}


	public Map<String, Object> getEssSession() {
		return essSession;
	}


	public String getLoginAreaName() {
		return loginAreaName;
	}


	public void setLoginAreaName(String loginAreaName) {
		this.loginAreaName = loginAreaName;
	}


	public String getIsUseGTS() {
		return isUseGTS;
	}


	public void setIsUseGTS(String isUseGTS) {
		this.isUseGTS = isUseGTS;
	}


	public String getLogintype() {
		return logintype;
	}


	public void setLogintype(String logintype) {
		this.logintype = logintype;
	}

	public ArrayList<String> getPrivileges() {
		return privileges;
	}


	public void setPrivileges(ArrayList<String> privileges) {
		this.privileges = privileges;
	}	
	
	/**
	 * 判断登录员工是否具有某特定权限
	 * @param operatSpecCd 权限编码
	 * @return <strong>true：</strong>具有operatSpecCd该权限，或者说系管返回了该权限<br>
	 * <strong>false：</strong>operatSpecCd为空、工号没有operatSpecCd权限等其他情况
	 */
	public boolean isHasOperatSpecCd(String operatSpecCd) {
		return this.isHasPrivilege(operatSpecCd);
	}
	
	/**
	 * 判断登录员工是否具有某特定权限
	 * @param operatSpecCd 权限编码
	 * @return 如果具有operatSpecCd权限则返回operatSpecCd，否则返回null
	 */
	public String checkOperatSpecCd(String operatSpecCd) {
		if(this.isHasPrivilege(operatSpecCd)){
			return operatSpecCd;
		} else{
			return null;
		}
	}
	
	private boolean isHasPrivilege(String operatSpecCd){
		boolean result =  false;
		if(StringUtils.isNotBlank(operatSpecCd)){
			if(this.privileges != null && !this.privileges.isEmpty()){
				result = this.privileges.contains(operatSpecCd) ? true : false;
			}
		}
		return result;
	}
}

package  com.al.lte.portal.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.SpringContextUtil;
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
	/**身份证类型开关idType**/
	private String idType;
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
		sessionStaff.setAreaId(MapUtils.getString(staffInfoMap, "areaId", ""));
		sessionStaff.setAreaCode(MapUtils.getString(staffInfoMap, "areaCode",""));
		sessionStaff.setRegionName(MapUtils.getString(staffInfoMap, "regionName",""));
		sessionStaff.setUpProvinName(MapUtils.getString(staffInfoMap, "upProvinName", ""));
		sessionStaff.setCityName(MapUtils.getString(staffInfoMap, "cityName",""));
		sessionStaff.setCountryName(MapUtils.getString(staffInfoMap, "countryName",""));
		sessionStaff.setChannelId(MapUtils.getString(staffInfoMap, "channelId",""));
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
		sessionStaff.setProvinceCode(MapUtils.getString(staffInfoMap, "staffProvCode", ""));
		//身份证类型开发
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		sessionStaff.setIdType(propertiesUtils.getMessage(SysConstant.IDTYPE));
		return sessionStaff;
	}
	
	public static SessionStaff setChannelInfoFromMap(SessionStaff sessionStaff, Map<String, Object> paramMap) {
		sessionStaff.setCurrentChannelId(MapUtils.getString(paramMap, "id", ""));
		sessionStaff.setCurrentChannelName(MapUtils.getString(paramMap, "name", ""));
		sessionStaff.setCurrentAreaId(MapUtils.getString(paramMap, "areaId", ""));
		sessionStaff.setCurrentAreaCode(MapUtils.getString(paramMap, "zoneNumber", ""));
		sessionStaff.setCurrentAreaName(MapUtils.getString(paramMap, "areaName", ""));
		sessionStaff.setCurrentAreaAllName(MapUtils.getString(paramMap, "areaAllName", ""));
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

	public String getIdType() {
		return idType;
	}

	public void setIdType(String idType) {
		this.idType = idType;
	}
}

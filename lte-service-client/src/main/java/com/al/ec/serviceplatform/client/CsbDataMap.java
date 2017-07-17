package com.al.ec.serviceplatform.client;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.jdom.Document;
import org.jdom.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.al.common.utils.XMLUtil;
import com.al.ecs.common.util.XmlUtil;
import com.al.uniconfig.util.JsonUtil;

public class CsbDataMap{
	private static Logger log = LoggerFactory.getLogger(CsbDataMap.class);
	private String keyContractRoot = "ContractRoot";
	private String keyTcpCont = "TcpCont";
	private String keySvcCont = "SvcCont";
    private String keyBusCode = "BusCode";
    private String keyServiceCode = "ServiceCode";
    private String keyServiceContractVer = "ServiceContractVer";
    private String keyActionCode= "ActionCode";
    private String keyTransactionID = "TransactionID";
    private String keyServiceLevel= "ServiceLevel";
    private String keySrcOrgID = "SrcOrgID";
    private String keySrcSysID = "SrcSysID";
    private String keySrcSysSign = "SrcSysSign";
    private String keyDstOrgID = "DstOrgID";
    private String keyDstSysID = "DstSysID";
	private String keyReqTime = "ReqTime";
	private String keyPackageGroup = "PackageGroup";
	private String keyTotalPackageNum = "TotalPackageNum";
	private String keyTranIdSeq = "TranIdSeq";
    private Map contractRoot = new HashMap();
    private Map tcpCont = new HashMap();
    private Map svcCont = new HashMap();
    
    
	public String getJson() throws IOException {
		Map rootMap = new HashMap();
		setTransactionID(getTranID(getSrcSysID()));
		setReqTime(DateFormatUtils.format(new Date(), "yyyyMMddHHmmss"));
		rootMap.put(keyContractRoot, getContractRoot());
		return JsonUtil.getJsonConverter().toJson(rootMap);
	}
	public String getXml() throws IOException {
		Map rootMap = new HashMap();
		setTransactionID(getTranID(getSrcSysID())+getTranIdSeq());
		setReqTime(DateFormatUtils.format(new Date(), "yyyyMMddHHmmss"));
		//新增PackageGroup 和 TotalPackageNum
		setPackageGroup(getTransactionID());
		setTotalPackageNum("1");
		rootMap.put(keyContractRoot, getContractRoot());
		return XmlUtil.getXMLFromMap(rootMap, 0);
	}
	
	private Map getContractRoot() {
		contractRoot.put(keyTcpCont, tcpCont);
		contractRoot.putAll(svcCont);
		return contractRoot;
	}
	private void setContractRoot(Map contractRoot) {
		contractRoot = contractRoot;
	}
	private Map getTcpCont() {
		return tcpCont;
	}
	private void setTcpCont(Map tcpCont) {
		tcpCont = tcpCont;
	}
	public String getBusCode() {
		return MapUtils.getString(tcpCont, keyBusCode);
	}
	public void setBusCode(String busCode) {
		tcpCont.put(keyBusCode , busCode);
	}
	public String getServiceCode() {
		return MapUtils.getString(tcpCont, keyServiceCode);
	}
	public void setServiceCode(String serviceCode) {
		tcpCont.put(keyServiceCode , serviceCode);
	}
	public String getServiceContractVer() {
		return MapUtils.getString(tcpCont, keyServiceContractVer);
	}
	public void setServiceContractVer(String serviceContractVer) {
		tcpCont.put(keyServiceContractVer , serviceContractVer);
	}
	public String getActionCode() {
		return MapUtils.getString(tcpCont, keyActionCode);
	}
	public void setActionCode(String actionCode) {
		tcpCont.put(keyActionCode , actionCode);
	}
	public String getTransactionID() {
		return MapUtils.getString(tcpCont, keyTransactionID);
	}
	public void setTransactionID(String transactionID) {
		tcpCont.put(keyTransactionID , transactionID);
	}
	public String getServiceLevel() {
		return MapUtils.getString(tcpCont, keyServiceLevel);
	}
	public void setServiceLevel(String serviceLevel) {
		tcpCont.put(keyServiceLevel , serviceLevel);
	}
	public String getSrcOrgID() {
		return MapUtils.getString(tcpCont, keySrcOrgID);
	}
	public void setSrcOrgID(String srcOrgID) {
		tcpCont.put(keySrcOrgID , srcOrgID);
	}
	public String getSrcSysID() {
		return MapUtils.getString(tcpCont, keySrcSysID);
	}
	public void setSrcSysID(String srcSysID) {
		tcpCont.put(keySrcSysID , srcSysID);
	}
	public String getSrcSysSign() {
		return MapUtils.getString(tcpCont, keySrcSysSign);
	}
	public void setSrcSysSign(String srcSysSign) {
		tcpCont.put(keySrcSysSign , srcSysSign);
	}
	public String getDstOrgID() {
		return MapUtils.getString(tcpCont, keyDstOrgID);
	}
	public void setDstOrgID(String dstOrgID) {
		tcpCont.put(keyDstOrgID , dstOrgID);
	}
	public String getDstSysID() {
		return MapUtils.getString(tcpCont, keyDstSysID);
	}
	public void setDstSysID(String dstSysID) {
		tcpCont.put(keyDstSysID , dstSysID);
	}
	public String getReqTime() {
		return MapUtils.getString(tcpCont, keyReqTime);
	}
	public void setReqTime(String reqTime) {
		tcpCont.put(keyReqTime , reqTime);
	}
	public String getTotalPackageNum() {
		return MapUtils.getString(tcpCont, keyTotalPackageNum);
	}
	public void setTotalPackageNum(String totalPackageNum) {
		tcpCont.put(keyTotalPackageNum, totalPackageNum);
	}
	public String getPackageGroup() {
		return MapUtils.getString(tcpCont, keyPackageGroup);
	}
	public void setPackageGroup(String packageGroup) {
		tcpCont.put(keyPackageGroup, packageGroup);
	}
	public String getSvcCont() {
		return MapUtils.getString(svcCont, keySvcCont);
	}
	public void setSvcCont(Object svcContMap) {
		svcCont.put(keySvcCont , svcContMap);
	}
	public String getTranIdSeq() {
		return MapUtils.getString(svcCont, keyTranIdSeq);
	}
	public void setTranIdSeq(String TranId) {
		svcCont.put(keyTranIdSeq , TranId);
	}
	public static String getTranID(String id) {
		// 【10位系统/平台编码代码】+【8位日期编码YYYYMMDD】＋【10位流水号】
		StringBuffer sb = new StringBuffer();
		sb.append(id).append(DateFormatUtils.format(new Date(), "yyyyMMdd"));
//				.append(getHourInMillis())
//				.append(RandomStringUtils.randomNumeric(2));
		Calendar.getInstance().getTimeInMillis();
		return sb.toString();
	}
	public static String getHourInMillis() {
		long h = Calendar.getInstance().get(Calendar.HOUR_OF_DAY) * 60 * 60 * 1000;
		long m = Calendar.getInstance().get(Calendar.MINUTE) * 60 * 1000;
		long s = Calendar.getInstance().get(Calendar.SECOND) * 1000;
		long ms = Calendar.getInstance().get(Calendar.MILLISECOND);
		return StringUtils.leftPad(String.valueOf(h + m + s + ms), 8, '0');
	}
}

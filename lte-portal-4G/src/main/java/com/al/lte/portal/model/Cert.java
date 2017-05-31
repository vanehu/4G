package com.al.lte.portal.model;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
<<<<<<< HEAD
import java.util.Date;
=======
>>>>>>> deffc947... #1471834 身份证读卡器安全方案-----营业门户--徐旭张宇
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import net.sf.json.xml.XMLSerializer;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.ArrayUtils;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.XmlUtil;
<<<<<<< HEAD
import com.al.ecs.common.web.ServletUtils;
=======
>>>>>>> deffc947... #1471834 身份证读卡器安全方案-----营业门户--徐旭张宇
import com.al.ecs.log.Log;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;

/**
 * 二代证读卡
 * @author ZhangYu
 * @since 2017-05-19
 */
public class Cert {
	
	private Log log = Log.getLog(Cert.class);

	private String appId;
	
	private String appSecret;
	
	private String versionId;
	
	private String serectParam;
	
	private String decryptedParam;

	private String currentAppId;
	
	private String currentAppSecret;
	
	private String current3desSecret;
	
	private String newVersionId;
		
	private String new3desSecret;
	
	private String newAesSecret;
	
	private String effectTime;
	
	private String createTime;

	private ArrayList<String> hashVal;
		
	private HashMap<String, Object> secretConfig;
	
	private HashMap<String, Object> isVersionIdNeedUpdate;
	
	private static Cert cert;
	
	private XMLSerializer xmlSerializer;
	
	private StringBuffer errorMsg;
	
	private boolean isSaveLog;
	
	private SessionStaff sessionStaff;
	
	private List<String> specialNodeList;
<<<<<<< HEAD
	
	private String mac;
=======
>>>>>>> deffc947... #1471834 身份证读卡器安全方案-----营业门户--徐旭张宇
		
	public static Cert getInstance(){
		if(cert == null){
			synchronized(Cert.class){
				if(cert == null){
					cert = new Cert();
				}
			}
		}
		
		return cert;
	}
	
	@SuppressWarnings("unchecked")
	private Cert(){
		this.appId 			= MapUtils.getString(MDA.CERT_SIGNATURE_UNIFY, "appId", "");
		this.hashVal		= (ArrayList<String>) MDA.CERT_SIGNATURE_UNIFY.get("hashVal");
		this.appSecret		= MapUtils.getString(MDA.CERT_SIGNATURE_UNIFY, "appSecret", "");
		this.secretConfig	= (HashMap<String, Object>) MapUtils.getMap(MDA.CERT_SIGNATURE_UNIFY, "secretConfig", new HashMap<String, Object>());
		
		this.errorMsg 		= new StringBuffer();
		this.isSaveLog 		= true;
		this.xmlSerializer	= new XMLSerializer();
		this.specialNodeList= Arrays.asList("3desSecret", "aesSecret");
		this.isVersionIdNeedUpdate = new HashMap<String, Object>();
	}

	/**
	 * 解密入参
	 * @param versionId
	 * @param serectParam
		private String new3desSecret;
		private String newAesSecret;
	 */
	@SuppressWarnings("unchecked")
	private boolean handleSecretparam(String versionId, String serectParam){
		this.errorMsg.setLength(0);
		boolean result = false;
		
		//根据versionId取密钥
		Map<String, Object> subsecretConfig = MapUtils.getMap(this.secretConfig, versionId);
		if(subsecretConfig == null){
			log.error("非法versionId，versionId={}", versionId);
			this.setErrorMsg("非法versionId，versionId=");
			this.setErrorMsg(versionId);
			this.setErrorMsg("，serectParam=");
			this.setErrorMsg(serectParam);
			return result;
		}
		
		String aesSecret = MapUtils.getString(subsecretConfig, "aesSecret");
		if(StringUtils.isBlank(aesSecret)){
			log.error("集团CtrlSecret服务的配置异常，请检查配置");
			this.setErrorMsg("集团CtrlSecret服务的配置异常，请检查配置");
			return result;
		}
		
		//解密serectParam
		String decryptedParamXml = this.decryptAes(serectParam, aesSecret);
		if(StringUtils.isNotBlank(decryptedParamXml)){
			this.decryptedParam = decryptedParamXml;
			String decryptedParamJsonStr = this.xmlSerializer.read(decryptedParamXml).toString();
			Map<String, String> decryptedParam = JsonUtil.toObject(decryptedParamJsonStr, Map.class);
			if(MapUtils.isNotEmpty(decryptedParam)){
<<<<<<< HEAD
				this.mac				= MapUtils.getString(decryptedParam, "macAddress", "未获取到macAddress");
				this.currentAppId 		= MapUtils.getString(decryptedParam, "appId", "未获取到appId");
				this.currentAppSecret	= MapUtils.getString(decryptedParam, "appSecret", "未获取到appSecret");
				this.current3desSecret	= MapUtils.getString(decryptedParam, "now3desSecret", "未获取到now3desSecret");
=======
				this.currentAppId 		= MapUtils.getString(decryptedParam, "appId", "");
				this.currentAppSecret	= MapUtils.getString(decryptedParam, "appSecret", "");
				this.current3desSecret	= MapUtils.getString(decryptedParam, "now3desSecret", "");
>>>>>>> deffc947... #1471834 身份证读卡器安全方案-----营业门户--徐旭张宇
				result = true;
			} else{
				log.error("入参serectParam格式化失败，versionId={}，serectParam={}", versionId, serectParam);
				this.setErrorMsg("入参serectParam格式化失败，versionId=");
				this.setErrorMsg(versionId);
				this.setErrorMsg("，serectParam=");
				this.setErrorMsg(serectParam);
			}
		} else{
			log.error("入参serectParam解密失败，versionId={}，serectParam={}", versionId, serectParam);
			this.setErrorMsg("入参serectParam解密失败，versionId=");
			this.setErrorMsg(versionId);
			this.setErrorMsg("，serectParam=");
			this.setErrorMsg(serectParam);
		}
		
		return result;
	}
	
	/**
	 * 1.校验appId和appSecret<br>
	 * 2.校验versionId是否合法
	 * @return 校验成功返回true，其他返回false
	 */
	public boolean verify(){
		boolean result = false;
		
		if(StringUtils.isNotBlank(this.appId) && StringUtils.isNotBlank(this.appSecret)){
			if(this.appId.equals(this.currentAppId) && this.appSecret.equals(this.currentAppSecret)){
				if(MapUtils.isNotEmpty(MapUtils.getMap(this.secretConfig, this.versionId))){
					result = true;
				}
			}
		}
		
		return result;
	}

	@SuppressWarnings("unchecked")
	public boolean isNeedUpdate(){
		this.errorMsg.setLength(0);
		boolean result = false;
		Calendar currentCalendar = Calendar.getInstance();
		Calendar configCalendar = Calendar.getInstance();
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Map<String, Object> secretConfig = MapUtils.getMap(this.secretConfig, this.versionId);
		String effectTimeStr = MapUtils.getString(secretConfig, "effectTime", "");
		
		if(this.isVersionIdNeedUpdate.get(this.versionId) != null){
			result = MapUtils.getBooleanValue(this.isVersionIdNeedUpdate, this.versionId, false);
		} else{
			if(StringUtils.isNotBlank(effectTimeStr)){
				try {
					configCalendar.setTime(simpleDateFormat.parse(effectTimeStr));
					int compareResult = currentCalendar.compareTo(configCalendar);
					if(compareResult >= 0){
						//当前时间等于或超过effectTime，即为失效
						result = true;
					}
				} catch (ParseException e) {
					HashMap<String, Object> err = new HashMap<String, Object>();
					err.put("versionId", this.versionId);
					err.put("serectParam", this.serectParam);
					err.put("effectTimeStr", effectTimeStr);
					err.put("secretConfig", this.secretConfig);
					err.put("configCalendar", simpleDateFormat.format(configCalendar.getTime()));
					err.put("currentCalendar", simpleDateFormat.format(currentCalendar.getTime()));
					log.error("密钥更新检查异常，计算失效时间出错，错误信息={}", JsonUtil.toString(err));
					this.setErrorMsg("密钥更新检查异常，错误信息=" + e.getMessage());
				}
			}
		}
		
		this.isVersionIdNeedUpdate.put(this.versionId, result);
		
		return result;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, String> getNewVersion(){
		Map<String, String> result = null;
		Calendar calendar = Calendar.getInstance();
		
		if(MapUtils.getBooleanValue(this.isVersionIdNeedUpdate, this.versionId, false)){
			result = new HashMap<String, String>();
			Set<String> keySet = this.secretConfig.keySet();
			Iterator<String> iterator = keySet.iterator();
			while(iterator.hasNext()){
				String key = iterator.next();
				if(this.versionId.equals(key)){
					continue;
				} else{
					SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
					HashMap<String, Object> subSecretConfig = (HashMap<String, Object>) MapUtils.getMap(this.secretConfig, key);
					boolean isLastVerFlag = "Y".equals(MapUtils.getString(subSecretConfig, "lastVerFlag", ""));
					
					if(isLastVerFlag){
						this.createTime 	= simpleDateFormat.format(calendar.getTime());//时间戳
						this.effectTime 	= MapUtils.getString(subSecretConfig, "effectTime", "");
						this.newVersionId 	= key;
						this.newAesSecret 	= MapUtils.getString(subSecretConfig, "aesSecret", "");
						this.new3desSecret	= MapUtils.getString(subSecretConfig, "3desSecret", "");
						
					}
				}
			}

			result.put("createTime", 	this.createTime);
			result.put("effectTime", 	this.effectTime);
			result.put("versionId", 	this.newVersionId);
			result.put("aesSecret", 	this.newAesSecret);
			result.put("3desSecret",	this.new3desSecret);
		}
		
		return result;
	}
	
	private String parseMap2XmlStr(Map<String, Object> parseXmlMap){
		String logId = UUID.randomUUID().toString().replaceAll("-", "");
		
		if(MapUtils.isEmpty(parseXmlMap)){
			this.setErrorMsg("内部异常：转换XML入参无效，入参parseXmlMap为空");
			
			parseXmlMap = new HashMap<String, Object>();
			parseXmlMap.put(SysConstant.RESULT_FLAG, ResultCode.FAIL_ON);
			parseXmlMap.put(SysConstant.ERROR_MSG, this.getErrorMsg());
			
			log.error(this.getErrorMsg());
		}
		
		String resultXmlStr = XmlUtil.getXMLFromMap(this.createResponseMap(parseXmlMap, logId), 0);
		String encryptedResultXmlStr = this.encryptAes(resultXmlStr, this.versionId);

		if(this.isSaveLog){
			this.saveLogAsyn(resultXmlStr, encryptedResultXmlStr, logId);
		}
		
		return encryptedResultXmlStr;
	}
	
	private Map<String, Object> createResponseMap (Map<String, Object> param, String logId){
		Map<String, Object> rootNode = new HashMap<String, Object>();
		
		for(String key : this.specialNodeList){
			if(StringUtils.isNotBlank(MapUtils.getString(param, key))){
				param.put(key, "<![CDATA[" + MapUtils.getString(param, key) + "]]>");
			}
		}
		
		param.put("logId", logId);
		rootNode.put("response", param);
		
		return rootNode;
	}
	
	public String getResponseXml(){
		Map<String, Object> returnMap = new HashMap<String, Object>();
		
		//1.初始化或请求过滤是否正常
		if(StringUtils.isNotBlank(this.getErrorMsg())){
			returnMap.put(SysConstant.RESULT_FLAG, ResultCode.FAIL_ON);
			returnMap.put(SysConstant.ERROR_MSG, this.getErrorMsg());
			return this.parseMap2XmlStr(returnMap);
		}
		
		//2.请求参数校验
		if(!this.verify()){
			this.errorMsg.setLength(0);
			this.setErrorMsg("非法入参，versionId=");
			this.setErrorMsg(this.versionId);
			this.setErrorMsg("，serectParam=");
			this.setErrorMsg(this.serectParam);
			returnMap.put(SysConstant.RESULT_FLAG, ResultCode.FAIL);
			returnMap.put(SysConstant.ERROR_MSG, this.getErrorMsg());
			return this.parseMap2XmlStr(returnMap);
		}
		
		//3.是否需要更新
		if(this.isNeedUpdate()){
			//3.1有更新
			//4.获取新版本
			returnMap.putAll(this.getNewVersion());
			returnMap.put(SysConstant.RESULT_FLAG, ResultCode.SUCCESS);
			return this.parseMap2XmlStr(returnMap);
		} else if(StringUtils.isNotBlank(this.getErrorMsg())){
			//3.2有错误
			returnMap.put(SysConstant.RESULT_FLAG, ResultCode.FAIL_ON);
			returnMap.put(SysConstant.ERROR_MSG, this.getErrorMsg());
			return this.parseMap2XmlStr(returnMap);
		} else{
			//3.3无需更新
			returnMap.put(SysConstant.RESULT_FLAG, ResultCode.SUCCESS_TW);
			return this.parseMap2XmlStr(returnMap);
		}
	}
	
	public String getResponseXml(String msg, int code) throws IllegalArgumentException{
		Map<String, Object> returnMap = new HashMap<String, Object>();
		returnMap.put(SysConstant.RESULT_FLAG, Integer.valueOf(code));
		returnMap.put(SysConstant.ERROR_MSG, StringUtils.isNotBlank(msg) ? msg : "未知异常");
		return this.parseMap2XmlStr(returnMap);
	}
	
	public boolean isParamInvalid(String... params){
		boolean result = false;
		
		if(params == null || ArrayUtils.isEmpty(params)){
			result = true;
		} else{
			for(int i = 0; i < params.length && !result; i++){
				result = StringUtils.isBlank(params[i]);
			}
		}
		
		return result;
	}
	
	public String encryptAes(String param, String versionId){
		String aesSecret = MapUtils.getString(MapUtils.getMap(this.secretConfig, versionId), "aesSecret");
<<<<<<< HEAD
		return AESUtils.encryptAesToString(param, aesSecret);
	}
	
	public String decryptAes(String param, String aesSecret){
		return AESUtils.decryptAesToString(param, aesSecret);
=======
		return AESUtils.encryptToString(param, aesSecret);
	}
	
	public String decryptAes(String param, String aesSecret){
		return AESUtils.decryptToString(param, aesSecret);
>>>>>>> deffc947... #1471834 身份证读卡器安全方案-----营业门户--徐旭张宇
	}
	
	public String encrypt3des(String param, String versionId){
		return "";
	}
	
	public String decrypt3des(String param, String versionId){
		return "";
	}
	
<<<<<<< HEAD
	/**
	 * 暂未使用
	 * @param httpServletRequest
	 * @return
	 */
	public boolean requestFilter(HttpServletRequest httpServletRequest){
		this.errorMsg.setLength(0);
		boolean result = true;
//		boolean isRequestFilterOn = "ON".equals(MapUtils.getString(MDA.CERT_SIGNATURE_UNIFY, "requestFilter", "ON")) ? true : false;
		
		return result;
	}

	public void saveLogAsyn(String resultXmlStr, String encryptedResultXmlStr, String logId){
		Map<String, Object> param = new HashMap<String, Object>();
		Map<String, Object> returnMap = new HashMap<String, Object>();
		ServiceLog serviceLog = ServiceLog.getNewInstance();
		DataBus db = new DataBus();
		Date date = new Date();
		
		param.put("logId", logId);
		param.put("mac", this.mac);
=======
	public boolean requestFilter(HttpServletRequest httpServletRequest){
		this.errorMsg.setLength(0);
		boolean result = true;
		
//		httpServletRequest.getHeader("");
//		
//		//1.判断是否登录
//		if(httpServletRequest != null){
//			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(httpServletRequest, SysConstant.SESSION_KEY_LOGIN_STAFF);
//			if(sessionStaff != null){
//				result = true;
//				//2.判断请求次数
////				String clientIp = ServletUtils.getIpAddr(httpServletRequest);
////				Calendar calendar = Calendar.getInstance();
////				Map<String, Object> requestFilter = new HashMap<String, Object>();
////				requestFilter.put(sessionId, calendar);
//			} else{
//				this.setErrorMsg("非法请求");
//			}
//		} else{
//			this.setErrorMsg("非法请求");
//		}

		return result;
	}

	/**
	 * how can i save log asynchronously？
	 * @param resultXmlStr
	 * @param encryptedResultXmlStr
	 * @param logId
	 */
	public void saveLogAsyn(String resultXmlStr, String encryptedResultXmlStr, String logId){
		Map<String, Object> param = new HashMap<String, Object>();
		Map<String, Object> returnMap = new HashMap<String, Object>();
		
		param.put("logId", logId);
>>>>>>> deffc947... #1471834 身份证读卡器安全方案-----营业门户--徐旭张宇
		param.put("serectParam", this.serectParam);
		param.put("decryptedParam", this.decryptedParam);
		returnMap.put("logId", logId);
		returnMap.put("resultXmlStr", resultXmlStr);
		returnMap.put("encryptedResultXmlStr", encryptedResultXmlStr);
		
<<<<<<< HEAD
		serviceLog.initDataBus(db, null);
		db.setResultCode(ResultCode.R_SUCC);
		db.setParammap(param);
		db.setReturnlmap(returnMap);
				
		String paramString = JsonUtil.toString(param);
		String rawRetn = JsonUtil.toString(returnMap);
		
		log.debug("密钥更新服务，入参={}\n-密钥更新服务，回参={}", paramString, rawRetn);

		serviceLog.setDataBus(db);
		serviceLog.setParamStr(paramString);
		serviceLog.setReturnStr(rawRetn);
		serviceLog.setPrefix("portal");
		serviceLog.setServCode("ctrlSecret");
		serviceLog.setServiceCode("ctrlSecret");
		serviceLog.setLogSeqId(logId);
		serviceLog.setBeginTime(date);
		serviceLog.setEndTime(date);
		serviceLog.setRemark("密钥更新服务，mac：" + this.getMac());
		
		serviceLog.saveLogAsyn();
=======
		String paramString = JsonUtil.toString(param);
		String rawRetn = JsonUtil.toString(returnMap);
		
		
		log.debug("密钥更新服务，入参={}\n-密钥更新服务，回参={}", paramString, rawRetn);
		
		if(this.sessionStaff != null){
			DataBus db = new DataBus();
			db = ServiceClient.initDataBus(this.sessionStaff);
			db.setResultCode("0");
			db.setParammap(param);
			db.setReturnlmap(returnMap);
			long beginTime = System.currentTimeMillis();
			
			String dbKeyWord = this.sessionStaff.getDbKeyWord();
			InterfaceClient.callServiceLog(logId, dbKeyWord, db, null,
				"ctrlSecret", "ctrlSecret", this.sessionStaff, paramString, rawRetn, beginTime, beginTime, "", "", "portal");
		}
>>>>>>> deffc947... #1471834 身份证读卡器安全方案-----营业门户--徐旭张宇
	}

	public String getNewAesSecret() {
		return newAesSecret;
	}

	public String getNew3desSecret() {
		return new3desSecret;
	}

	public ArrayList<String> getHashVal() {
		return hashVal;
	}

	public HashMap<String, Object> getSecretConfig() {
		return secretConfig;
	}

	public String getAppId() {
		return appId;
	}

	public String getAppSecret() {
		return appSecret;
	}

	public String getVersionId() {
		return versionId;
	}
	
	public void setVersionId(String versionId) {
		this.versionId = StringUtils.isNotBlank(versionId) ? versionId : null;
		if(this.serectParam != null && this.versionId != null){
			this.handleSecretparam(this.versionId, this.serectParam);
		}
	}

	public String getSerectParam() {
		return serectParam;
	}

	public void setSerectParam(String serectParam) {
		this.serectParam = StringUtils.isNotBlank(serectParam) ? serectParam : null;
		if(this.serectParam != null && this.versionId != null){
			this.handleSecretparam(this.versionId, this.serectParam);
		}
	}

	public String getCurrentAppId() {
		return currentAppId;
	}

	public String getCurrentAppSecret() {
		return currentAppSecret;
	}

	public String getCurrent3desSecret() {
		return current3desSecret;
	}

	public String getNewVersionId() {
		return newVersionId;
	}

	public String getEffectTime() {
		return effectTime;
	}

	public String getCreateTime() {
		return createTime;
	}

	public String getErrorMsg() {
		if(errorMsg != null){
			return errorMsg.toString();
		} else{
			return "";
		}
	}

	public void setErrorMsg(String errorMsg) {
		this.errorMsg.append(errorMsg);
	}

	public boolean isSaveLog() {
		return isSaveLog;
	}

	public void setSaveLog(boolean isSaveLog) {
		this.isSaveLog = isSaveLog;
	}

	public SessionStaff getSessionStaff() {
		return sessionStaff;
	}

	public void setSessionStaff(SessionStaff sessionStaff) {
		this.sessionStaff = sessionStaff;
	}

	public String getDecryptedParam() {
		return decryptedParam;
	}
<<<<<<< HEAD

	public String getMac() {
		return mac;
	}
=======
>>>>>>> deffc947... #1471834 身份证读卡器安全方案-----营业门户--徐旭张宇
}
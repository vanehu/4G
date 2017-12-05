package com.al.lte.portal.bmo.crm;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.DigestUtils;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.Cert;
import com.al.lte.portal.model.SessionStaff;


@Service("com.al.lte.portal.bmo.crm.CertBmo")
public class CertBmoImpl implements CertBmo {

	private Log log = Log.getLog(getClass());
	
	private StringBuffer strBuffer = new StringBuffer();

	@SuppressWarnings("unchecked")
	public Map<String, Object> recordCertReaderCustInfos(Map<String, Object> param, SessionStaff sessionStaff) throws InterfaceException, IOException, Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		
		param.put("areaId", sessionStaff.getCurrentAreaId());
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.RECORD_CERT_READER_CUST_INFOS, null, sessionStaff);
		
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> resultMap = new HashMap<String, Object>();
				resultMap = MapUtils.getMap(db.getReturnlmap(), SysConstant.RESULT, null);
				if(MapUtils.isNotEmpty(resultMap)){
					returnMap.putAll(resultMap);
					returnMap.put(SysConstant.RESULT_CODE, ResultCode.SUCCESS);
				} else{
					returnMap.put(SysConstant.RESULT_CODE,  ResultCode.FAIL);
					returnMap.put(SysConstant.RESULT_MSG, "后台saveCertInfoFromIdentification服务返回非空结果集");
					log.error("后台intf.soService/saveCertInfoFromIdentification服务返回非空结果集={}", JsonUtil.toString(db.getReturnlmap()));
				}
			} else {
				returnMap.put(SysConstant.RESULT_CODE,  ResultCode.FAIL);
				returnMap.put(SysConstant.RESULT_MSG, db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.soService/saveCertInfoFromIdentification服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.UPLOAD_CUST_CERTIFICATE, param, db.getReturnlmap(), e);
		}
		
		return returnMap;
	}
	
	public boolean isReadCertSucess(Map<String, Object> param){
		String partyName = MapUtils.getString(param, "partyName");// 姓名
		String gender = MapUtils.getString(param, "gender");// 性别
		String nation = MapUtils.getString(param, "nation");// 民族
		String bornDay = MapUtils.getString(param, "bornDay");// 出生日期
		String certAddress = MapUtils.getString(param, "certAddress");// 地址
		String certNumber = MapUtils.getString(param, "certNumber");// 身份证号码
		String certOrg = MapUtils.getString(param, "certOrg");// 签发机关
		String effDate = MapUtils.getString(param, "effDate");// 起始有效期
		String expDate = MapUtils.getString(param, "expDate");// 终止有效期

		boolean isCertInfoBlank = (
			StringUtils.isBlank(partyName) || StringUtils.isBlank(gender)
	        || StringUtils.isBlank(nation) || StringUtils.isBlank(bornDay)
	        || StringUtils.isBlank(certNumber) || StringUtils.isBlank(certAddress)
	        || StringUtils.isBlank(certOrg) || StringUtils.isBlank(effDate)
	        || StringUtils.isBlank(expDate)
		);
		
        if (isCertInfoBlank){
            return false;
        } else{
        	return true;
        }
	}
	
	public void insertCertInfo(Map<String, Object> param, String flowNum, SessionStaff sessionStaff){
		try{
			if (sessionStaff != null) {
				param.put("readCertFlag", "readCert");
				String dbKeyWord = sessionStaff == null ? null : sessionStaff.getDbKeyWord();
				DataBus db = new DataBus();
				db = ServiceClient.initDataBus(sessionStaff);
				db.setResultCode("0");
				db.setParammap(param);
				long beginTime = System.currentTimeMillis();
				String rawRetn = "";
				String logSeqId = "";
				rawRetn = JsonUtil.toString(param);
				InterfaceClient.callServiceLog(logSeqId, dbKeyWord, db, flowNum,"readCert","readCert", sessionStaff,rawRetn, rawRetn, beginTime, beginTime,"","", "portal");
			}
		}catch(Exception e){
			log.error("二代证读卡日志记录异常，异常信息={}", e);
            log.error("二代证读卡日志记录异常，入参信息={}", JsonUtil.toString(param));
		}
	}
	
	/**
	 * USB二代证读卡校验
	 * @param param
	 * @param request
	 * @param sessionStaff
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> certReaderVerify(Map<String, Object> param, HttpServletRequest request, SessionStaff sessionStaff){
		
		log.debug("二代证读卡校验-开始，staffId={}， paramStr={}", sessionStaff.getStaffId(), JsonUtil.toString(param));
		
		Map<String, Object> returnMap = new HashMap<String, Object>();
		returnMap.put(SysConstant.RESULT_CODE, ResultCode.SUCCESS);
		
		String venderId = MapUtils.getString(param, "venderId", "");// 厂商标识
		String signature = MapUtils.getString(param, "signature", "");// 数字签名
		String versionSerial = MapUtils.getString(param, "versionSerial", "");// 版本号
		String partyName = MapUtils.getString(param, "partyName", "");// 姓名
		String gender = MapUtils.getString(param, "gender", "");// 性别
		String nation = MapUtils.getString(param, "nation", "");// 民族
		String bornDay = MapUtils.getString(param, "bornDay", "");// 出生日期
		String certAddress = MapUtils.getString(param, "certAddress", "");// 地址
		String certNumber = MapUtils.getString(param, "certNumber", "");// 身份证号码
		String certOrg = MapUtils.getString(param, "certOrg", "");// 签发机关
		String effDate = MapUtils.getString(param, "effDate", "");// 起始有效期
		String expDate = MapUtils.getString(param, "expDate", "");// 终止有效期
		String identityPic = MapUtils.getString(param, "identityPic", "");// 照片
		
		int result = expDate.compareTo(DateUtil.getNowII());
	    if(result < 0 ){
			returnMap.put(SysConstant.RESULT_CODE, ResultCode.FAIL_ON);
			returnMap.put(SysConstant.RESULT_MSG, "身份证已过期，无法办理业务");
			return returnMap;
		}
		
		Map<String, Object> noticeInfos = (HashMap<String, Object>) MDA.CERT_SIGNATURE.get(SysConstant.NOTICE_INFOS);
		Map<String, Object> certConfigsOfTheProv = (HashMap<String, Object>) MDA.CERT_SIGNATURE.get(SysConstant.CERT_SIGNATURE_PROV + sessionStaff.getCurrentAreaId().substring(0, 3));
        //身份证阅读器省份开关 ON：开启校验  OFF不校验
		boolean isValidate  = "ON".equals(MapUtils.getString(certConfigsOfTheProv, SysConstant.USB_SIGNATURE_CHECK, ""));
        
		if (isValidate) {
			//分省开关开启
			if (StringUtils.isBlank(venderId)) {
				returnMap.put(SysConstant.RESULT_CODE, ResultCode.FAIL_ON);
				returnMap.put(SysConstant.RESULT_MSG, MapUtils.getString(noticeInfos, "venderIdInvalid", "读卡器控件版本过低，请联系厂商升级驱动版本"));
			} else {
				Map<String, Object> vendors = MapUtils.getMap(certConfigsOfTheProv, "VENDORS");
				Map<String, Object> vendorConfigs = MapUtils.getMap(vendors, venderId);
				if (vendorConfigs == null) {
					//未在集约 CRM 许可范围内
					returnMap.put(SysConstant.RESULT_CODE, ResultCode.FAIL_ON);
					returnMap.put(SysConstant.RESULT_MSG, MapUtils.getString(noticeInfos, "venderInvalid", "读卡器未在集约 CRM 许可范围内，请联系厂商升级驱动"));
				} else {
					if ("ON".equals(MapUtils.getString(vendorConfigs, "isOpen", ""))){
						// 启用新规范控件校验
						String mdaVersion = MapUtils.getString(vendorConfigs, "version", "");
						if (StringUtils.isBlank(signature) || StringUtils.isBlank(versionSerial)){
							returnMap.put(SysConstant.RESULT_CODE, ResultCode.FAIL_ON);
							returnMap.put(SysConstant.RESULT_MSG, MapUtils.getString(noticeInfos, "versionInvalid", "读卡器控件版本过低，请联系厂商升级驱动版本"));
						} else {
							if (versionSerial.equals(mdaVersion)) {// 校验版本号
								String appSecret = MapUtils.getString(vendorConfigs, "appSecret", "");
								this.strBuffer.setLength(0);
								this.strBuffer.append(partyName)
									.append(gender)
									.append(nation)
									.append(bornDay)
									.append(certAddress)
									.append(certNumber)
									.append(certOrg)
									.append(effDate)
									.append(expDate)
									.append(identityPic)
									.append(appSecret);
								String sha1Str = DigestUtils.sha1ToHex(this.strBuffer.toString());
								if (!signature.equals(sha1Str)) {
									// 信息被篡改
									returnMap.put(SysConstant.RESULT_CODE, ResultCode.FAIL_TW);
									returnMap.put(SysConstant.RESULT_MSG, MapUtils.getString(noticeInfos, "signatureInvalid", "证件信息被篡改，请确认按照正确流程操作"));
								}
							} else {
								param.clear();
								param.put("fileUrl", venderId + "_" + mdaVersion);
								param.put("mdaVersion", mdaVersion);
								param.put("fileName", MapUtils.getString(vendorConfigs, "name", ""));

								returnMap.put(SysConstant.RESULT_CODE,ResultCode.FAIL_TH);
							}
						}
					} else {
						String noticeInfoStr = MapUtils.getString(noticeInfos, "isOpenInvalid", "");
						if ("".equals(noticeInfoStr)) {
							noticeInfoStr = "读卡器驱动未通过集团 CRM 验证，请联系" + MapUtils.getString(vendorConfigs, "name", "") + "厂商升级驱动";
						} else {
							noticeInfoStr = StringUtils.replace(noticeInfoStr, "%", MapUtils.getString(vendorConfigs, "name", ""));
						}
						
						returnMap.put(SysConstant.RESULT_CODE, ResultCode.FAIL_ON);
						returnMap.put(SysConstant.RESULT_MSG, noticeInfoStr);
					}
				}
			}
		}
	    
		log.debug("二代证读卡校验-结束，staffId={}，resultStr={}", sessionStaff.getStaffId(), JsonUtil.toString(returnMap));
        return returnMap;
	}
	
	public Map<String, Object> isReadCertBypassed(Map<String, Object> queryCustParam, HttpServletRequest request, String queryType){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		returnMap.put(SysConstant.RESULT_CODE, ResultCode.SUCCESS);
		String identityCd = MapUtils.getString(queryCustParam, "identityCd");

		//1.证件类型是否必须读卡
		if(MDA.CERTIFICATES_MUST_READ_CERT.contains(identityCd)){
			boolean isReadCertBypassed = false;
			String identityNum = MapUtils.getString(queryCustParam, "identityNum");

			//2.是否已经读卡
			Object isReadCert = ServletUtils.getSessionAttribute(request, identityNum);
			isReadCertBypassed = !Boolean.parseBoolean(String.valueOf(isReadCert));
			
			//3.读卡已被绕过
			if(isReadCertBypassed){
				this.strBuffer.setLength(0);
				this.strBuffer.append("您选择的证件类型必须读卡，请勿非法操作。");
				this.strBuffer.append("（工号： ");
				this.strBuffer.append(sessionStaff.getStaffCode());
				this.strBuffer.append("，操作： ");
				this.strBuffer.append(queryType);
				this.strBuffer.append("） 。");
				log.error("读卡绕过已被拦截，操作={}，工号={}，入参={}", queryType, sessionStaff.getStaffCode(), queryCustParam);
				returnMap.put(SysConstant.RESULT_CODE, ResultCode.FAIL);
				returnMap.put(SysConstant.RESULT_MSG,  this.strBuffer.toString());
				//4.记录日志
				Cert.saveCertLog(queryCustParam, returnMap, null, sessionStaff);
			}
			
			//5.校验一次清一次
			ServletUtils.removeSessionAttribute(request, identityNum);
		}
		
		return returnMap;
	}
}

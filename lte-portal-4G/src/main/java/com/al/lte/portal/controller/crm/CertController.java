package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.FtpUtils;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CertBmo;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.Des33;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.Cert;
import com.al.lte.portal.model.SessionStaff;

import net.sf.json.xml.XMLSerializer;

/**
 * 读卡控制器<br>
 * 二代证读卡相关业务日益复杂，云读卡、USB传统读卡相关请求，建议归于此类统一处理，否则过于分散难于维护
 * @since 2017-06-10
 */
@Controller("com.al.lte.portal.controller.crm.CertController")
@RequestMapping("/cert/*")
public class CertController extends BaseController {

	protected final Log log = Log.getLog(getClass());
	
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CertBmo")
    private CertBmo certBmo;
	
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
    private OrderBmo orderBmo;
	
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
    private CommonBmo commonBmo;
	
	/**
	 * 读卡客户信息记录（记录完整读卡数据）
	 */
	@RequestMapping(value = "/recordCertReaderCustInfos", method = {RequestMethod.POST})
	@ResponseBody
    public JsonResponse recordCertReaderCustInfos(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum, HttpServletResponse response) {
        Map<String, Object> result = null;
        JsonResponse jsonResponse = null;
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        
        try {
        	result = certBmo.recordCertReaderCustInfos(param, sessionStaff);
            if (result != null && ResultCode.SUCCESS == MapUtils.getIntValue(result, SysConstant.RESULT_CODE, 1)) {
                jsonResponse = super.successed(result, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(MapUtils.getString(result, SysConstant.RESULT_MSG, "未知错误"), ResultConstant.FAILD.getCode());
            }
        } catch (BusinessException be) {
        	jsonResponse = super.failed(be);
        } catch (InterfaceException ie) {
        	jsonResponse = super.failed(ie, param, ErrorCode.UPLOAD_CUST_CERTIFICATE);
		} catch (IOException ioe) {
			jsonResponse = super.failed(ErrorCode.UPLOAD_CUST_CERTIFICATE, ioe, param);
		} catch (Exception e) {
			jsonResponse = super.failed(ErrorCode.UPLOAD_CUST_CERTIFICATE, e, param);
		}
        
        return jsonResponse;
    }
	
    /**
     * 二代证读卡密钥更新服务，供外围调用
     * @param secretParam 加密参数(必须)
     * @param versionId	版本号(必须)
     * @param error 错误标识(unifyLogin)
     * @param response 加密报文
     */
    @RequestMapping(value = "/getCtrlSecret")
    public void getCtrlSecret(HttpServletRequest request, HttpServletResponse response) {
    	try {
    		if("GET".equalsIgnoreCase(request.getMethod())){
        		//do Get
        		request.getRequestDispatcher("/cert/getCtrlSecretGet").forward(request, response);
        	} else{
        		//do Post
        		request.getRequestDispatcher("/cert/getCtrlSecretPost").forward(request, response);
        	}
		} catch (ServletException e) {
			response.setStatus(500);
    		return;
		} catch (IOException e) {
			response.setStatus(500);
    		return;
		}
    }
    
    @RequestMapping(value = "/getCtrlSecretPost", method = {RequestMethod.POST})
    public void getCtrlSecretPost(@RequestBody Map<String, Object> param, HttpServletResponse response) {
    	String versionId = null;
    	String secretParam = null;

    	if(MapUtils.isNotEmpty(param)){
    		versionId = MapUtils.getString(param, "versionId");
        	secretParam = MapUtils.getString(param, "param");
        	
    		if(StringUtils.isBlank(versionId) || StringUtils.isBlank(secretParam)){
        		response.setStatus(403);
        		return;
        	}
    	} else{
    		response.setStatus(403);
    		return;
    	}
    	
    	this.doCtrlSecretRequest(versionId, secretParam, super.getRequest(), response);
    }
    
    @RequestMapping(value = "/getCtrlSecretGet", method = {RequestMethod.GET})
    public void getCtrlSecretGet(@RequestParam(value="param", required=false) String secretParam,
    		@RequestParam(value="versionId", required= false) String versionId,
    		@RequestParam(value="error", required = false) String error,
    		HttpServletResponse response) {

    	if("1".equals(error) || StringUtils.isBlank(versionId) || StringUtils.isBlank(secretParam)){
    		response.setStatus(403);
    		return;
    	}
    	
    	this.doCtrlSecretRequest(versionId, secretParam, super.getRequest(), response);
    	
    }
    
    private void doCtrlSecretRequest(String versionId, String secretParam, HttpServletRequest request, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
    	PrintWriter printWriter = null;
    	String returnStr = null;
    	Cert cert = Cert.getInstance();
    	cert.setSaveLog(true);
    	cert.setSessionStaff(sessionStaff);

        try {
        	printWriter = response.getWriter();

    		if(cert.requestFilter(request)){
    			if(cert.isParamInvalid(versionId, secretParam)){
    				response.setStatus(403);
//            		returnStr = cert.getResponseXml("参数验证失败", 1);
            	} else{
            		cert.setVersionId(versionId);
            		cert.setSerectParam(secretParam);
            		returnStr = cert.getResponseXml();
            	}
        	} else {
        		response.setStatus(403);
//        		returnStr = cert.getResponseXml();
        	}
    	
        	printWriter.print(returnStr);
        } catch (Exception e) {
        	log.error("getCtrlSecret服务异常，异常信息={}", e);
        	returnStr = cert.getResponseXml("服务异常：" + e.getMessage(), -1);
        	printWriter.print(returnStr);
        } finally{
        	printWriter.flush();
        	printWriter.close();
        }
    }
    
    @ResponseBody
    @AuthorityValid(isCheck = false)
    @RequestMapping(value = "/certInfo", method = RequestMethod.POST)
    public JsonResponse cacheCertInfo(@RequestBody Map<String, Object> param, HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);

        if (!certBmo.isReadCertSucess(param)){
            return super.failed("读卡失败，没有获取到有效读卡信息，读卡数据为空", -1);
        }
        
        //优化 新增业务场景编码、会话id 等
  		param.put("sessionId", ServletUtils.getSession(request, true).getId());
  		
  		//二代证校验读卡日志记录
        certBmo.insertCertInfo(param, null, sessionStaff);
        
    	try {
            //二代证校验
            Map<String, Object> verifyResult = certBmo.certReaderVerify(param, request, sessionStaff);
            if(MapUtils.getIntValue(verifyResult, SysConstant.RESULT_CODE) == ResultCode.FAIL_ON){
            	return super.failed(MapUtils.getString(verifyResult, SysConstant.RESULT_MSG, ""), ResultCode.FAIL_ON);
            } else if(MapUtils.getIntValue(verifyResult, SysConstant.RESULT_CODE) == ResultCode.FAIL_TW){
            	return super.failed(MapUtils.getString(verifyResult, SysConstant.RESULT_MSG, ""), ResultCode.FAIL_TW);
            } else if(MapUtils.getIntValue(verifyResult, SysConstant.RESULT_CODE) == ResultCode.FAIL_TH){
            	return super.failed(param, ResultCode.FAIL_TH);
            }
            
            String certAddress = MapUtils.getString(param, "certAddress", "");// 地址
    		String certNumber = MapUtils.getString(param, "certNumber", "");// 身份证号码
    		String partyName = MapUtils.getString(param, "partyName", "");// 姓名
    		String identityPic = MapUtils.getString(param, "identityPic");// 照片
      		String createFlag = MapUtils.getString(param, "createFlag");
            
            //二代证读卡session缓存
            String nonce = RandomStringUtils.randomAlphanumeric(Const.RANDOM_STRING_LENGTH); //随机字符串
            String signature1 = commonBmo.signature(partyName, certNumber, certAddress, identityPic, nonce, MDA.APP_SECRET);
            param.put("signature", signature1);
            
            //增加
            if("1".equals(createFlag)){                
                ServletUtils.removeSessionAttribute(request, Const.SESSION_SIGNATURE);
            	ServletUtils.setSessionAttribute(request, Const.SESSION_SIGNATURE, signature1);
            } else if("Y".equals(MapUtils.getString(param, "jbrFlag"))){
            	//经办人跟随主卡，即使加装副卡，一个单子只有一个经办人            	
            	ServletUtils.removeSessionAttribute(request, Const.SESSION_SIGNATURE_HANDLE_CUST);
            	ServletUtils.setSessionAttribute(request, Const.SESSION_SIGNATURE_HANDLE_CUST, signature1);
            }
            
            ServletUtils.setSessionAttribute(request, Const.CACHE_CERTINFO, certNumber);
            ServletUtils.setSessionAttribute(request, Const.CACHE_CERTINFO_PARAM, param);
            ServletUtils.setSessionAttribute(request, new String(certNumber), true);
            
            return super.successed(param, ResultConstant.SUCCESS.getCode());//信息校验通过
        } catch (Exception e) {
        	log.error("读卡失败发生未知异常", e);
            return super.failed("读卡失败发生未知异常", -1);
        }
    }
    
    @ResponseBody
    @AuthorityValid(isCheck = false)
    @RequestMapping(value = "/isOpenNewCert", method = RequestMethod.POST)
    public JsonResponse isOpenNewCert(@RequestBody Map<String, Object> param,
            HttpServletRequest request) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);
    	JsonResponse jsonResponse = null;
		try {
			Map<String, Object> certConfigsOfTheProv = (HashMap<String, Object>) MDA.CERT_SIGNATURE.get(SysConstant.CERT_SIGNATURE_PROV + sessionStaff.getCurrentAreaId().substring(0, 3));
			jsonResponse = super.successed(MapUtils.getString(certConfigsOfTheProv, SysConstant.USB_SIGNATURE_CHECK, ""), ResultConstant.SUCCESS.getCode());//信息校验通过
            return jsonResponse;
        } catch (Exception e) {
            return super.failed("读取身份证省份配置开关失败", -1);
        }
    }
    
	@ResponseBody
    @AuthorityValid(isCheck = false)
    @RequestMapping(value = "/certUnifyInfo", method = RequestMethod.POST)
    public JsonResponse certUnifyInfo(@RequestBody Map<String, Object> param, HttpServletRequest request) {
		HttpSession session =request.getSession();
		String sessionId=session.getId();//会话ID
		param.put("sessionId", sessionId);
		String versionId= MapUtils.getString(param, "versionId");//控件版本号ID
		String hashVal = MapUtils.getString(param, "hashVal");// 驱动主文件的md5值
		String resultContentXml = MapUtils.getString(param, "resultContent");// 二代身份证内容密文返回
		String createFlag = MapUtils.getString(param, "createFlag");
        if (StringUtils.isBlank(versionId) || StringUtils.isBlank(hashVal)
            || StringUtils.isBlank(resultContentXml)){
            return super.failed("读卡失败,读卡统一控件返回信息有误。", ResultCode.INTERFACE_EXCEPTION);
        }
        try {
        	//先验证versionId（版本号ID）是否和后台配置的最新版本号一致
        	Map<String, Object> secretConfigs  = (Map<String, Object>) MDA.CERT_SIGNATURE_UNIFY.get("secretConfig");
        	if(secretConfigs.get(versionId) == null){
        		return super.failed("读卡失败,读卡统一控件返回'控件版本号ID'不在MDA配置中。",ResultCode.FAIL_TW);
        	}
        	//根据versionId获取密钥对hashVal进行解密，并将解密后的值与后台配置的值对比
        	Map<String, Object> versionInfo  = (Map<String, Object>) secretConfigs.get(versionId);
        	String desSecret3 = (String) versionInfo.get("3desSecret");
        	String hashValDec = Des33.decode1(hashVal,desSecret3);
        	List hashVals = (List) MDA.CERT_SIGNATURE_UNIFY.get("hashVal");
        	if(!hashVals.contains(hashValDec)){
        		return super.failed("读卡失败,读卡统一控件返回'驱动主文件的md5值'不在MDA配置中。",ResultCode.FAIL);
        	}
        	//校验都一致，则解密身份证信息（使用versionId对应的密钥），身份证信息明文缓存在服务端，并返回客户端展示
            XMLSerializer xmlSerializer = new XMLSerializer();
            String resultContentXmlDec = Des33.decode1(resultContentXml,desSecret3);
    		String ResqjsonStr = xmlSerializer.read(resultContentXmlDec).toString();
            Map<String, Object> certificateInfo = JsonUtil.toObject(ResqjsonStr, Map.class);
            if(certificateInfo == null){
            	return super.failed("读卡失败,读卡统一控件返回'二代身份证内容为空'。",ResultCode.FAIL);
            }
            //二代证校验读卡日志记录
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
            param.putAll(certificateInfo);
            certBmo.insertCertInfo(param, null, sessionStaff);
            //二代证读卡session缓存
            
//            String appSecret1 = propertiesUtils.getMessage("APP_SECRET"); //appId对应的加密密钥
            String nonce = RandomStringUtils.randomAlphanumeric(Const.RANDOM_STRING_LENGTH); //随机字符串
            String partyName = (String) certificateInfo.get("partyName");
            String certNumber = (String) certificateInfo.get("certNumber");
            String certAddress = (String) certificateInfo.get("certAddress");
            String identityPic = (String) certificateInfo.get("identityPic");
            String signature1 = commonBmo.signature(partyName, certNumber, certAddress, identityPic, nonce, MDA.APP_SECRET);
            param.put("signature", signature1);
            //增加
            if("1".equals(createFlag)){
                request.getSession().setAttribute(Const.SESSION_SIGNATURE, signature1);
            }else if("Y".equals(MapUtils.getString(param, "jbrFlag"))){
            	//经办人跟随主卡，即使加装副卡，一个单子只有一个经办人
            	request.getSession().setAttribute(Const.SESSION_SIGNATURE_HANDLE_CUST, signature1);
            }
            request.getSession().setAttribute(Const.CACHE_CERTINFO, certNumber);
            ServletUtils.setSessionAttribute(request, new String(certNumber), true);

            param.remove("resultContent");
            return super.successed(param, ResultConstant.SUCCESS.getCode());//信息校验通过
        } catch (Exception e) {
            return super.failed("读卡失败信息异常",ResultCode.INTERFACE_EXCEPTION);
        }
    }
	
	@RequestMapping(value = "/downloadOCX", method = {RequestMethod.POST})
	public void downloadFile(@RequestParam("fileUrl") String fileUrl, 
			@RequestParam("fileName") String fileName,
			HttpServletResponse response) throws IOException {		
			ServletOutputStream outputStream = response.getOutputStream();
			boolean hasDowned = false;
			String msg = "下载失败，未知原因！";
		try {
			FtpUtils ftpUtils = new FtpUtils();
			String newFileName = fileUrl+".exe";
			String filePath = MDA.CARD_FILEPATH;
			fileName=fileName+".exe";
			//2.获取FTP服务器的具体登录信息
			//3.根据服务器映射获取对应的FTP服务器配置信息
			String ftpServiceConfig ="";
			if(MDA.CLUSTERFLAG.equals("OFF")){
				ftpServiceConfig=MDA.FTPSERVICECONFIG;
			}else{
				ftpServiceConfig=MDA.FTPServiceConfigs.get(MDA.CARD_FTPCONFIG);
			}
			String[] ftpServiceConfigs = ftpServiceConfig.split(",");
			String remoteAddress = ftpServiceConfigs[0];//FTP服务器地址(IP)
			String remotePort = ftpServiceConfigs[1];//FTP服务器端口
			String userName = ftpServiceConfigs[2];//FTP服务器用户名
			String password = ftpServiceConfigs[3];//FTP服务器密码
			
			boolean isConnected = ftpUtils.connectFTPServer(remoteAddress,remotePort,userName,password);
			if(isConnected){
				boolean isFileExist = ftpUtils.isFileExist(newFileName,filePath);
				if(isFileExist){
					boolean isChangeWorkingDirectory = ftpUtils.changeWorkingDirectory(filePath);
					if(isChangeWorkingDirectory){
						response.setContentType("application/x-msdownload;");
						response.addHeader("Content-Disposition", "attachment;filename="+new String(fileName.getBytes("gb2312"), "ISO8859-1"));
//						boolean gg=ftpUtils.downloadFileByPath(newFileName, outputStream);
						hasDowned = true;
						msg = "下载成功！";
					}else{
						msg = "下载失败：切换服务器目录失败；";
					}
				}else{
					msg = "下载失败：文件不存在；";
				}
			}else{
				msg = "下载失败：链接FTP服务器失败；";
			}
			if(!hasDowned){
		        this.log.error("{},文件目录：{}，ftp信息为：{}",msg,filePath+newFileName,ftpServiceConfig);
		        response.setContentType("text/html;charset=UTF-8");
		        outputStream.write(msg.getBytes());
			}
		}catch (Exception e) {
			e.printStackTrace();
			this.log.error(e);
			msg += "，异常信息："+e;
	        response.setContentType("text/html;charset=UTF-8");
	        outputStream.write(msg.getBytes());
		}finally {
			if (outputStream != null){
				outputStream.close();
			}
		}
	}
}

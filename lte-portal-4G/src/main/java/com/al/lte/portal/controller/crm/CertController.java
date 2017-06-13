package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
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
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CertBmo;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.Cert;
import com.al.lte.portal.model.SessionStaff;

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
}

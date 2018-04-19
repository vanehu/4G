package com.al.lte.portal.controller.system;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.common.utils.StringUtil;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.octo.captcha.service.CaptchaService;

/**
 * 忘记密码
 * @author  wd
 *
 */
@Controller("com.al.lte.portal.controller.system.PasswordMgrController")
@RequestMapping("/passwordMgr/*")
public class PasswordMgrController extends BaseController {
	@Autowired
	PropertiesUtils propertiesUtils;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	private CaptchaService captchaService;
	private String captchaParamterName = "validatecode";
	private static final String  CAPTCHA_SESSIONID="_captcha_session_id";
	
	
    
    @RequestMapping(value = "/smsValid", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse smsValidate(@RequestBody Map<String, Object> param,
			HttpServletRequest request ,HttpServletResponse response) {
    	String smsPwd = (String) param.get("smsPwd");
		this.log.debug("smsPwd={}", smsPwd);
		JsonResponse jsonResponse = new JsonResponse();
		// 验证码内容
		String smsPwdSession = (String) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_SMS);
		if(StringUtil.isEmpty(smsPwdSession)){
			return super.failed("短信过期失效，请重新发送!", ResultConstant.FAILD.getCode());
		}
		ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS);
		//ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS);
		// 登陆后，服务层返回的认证后用户信息
		
		//String smsPassFlag = MapUtils.getString(mapSession, "smsPassFlag", "Y");
		// 系统参数表中的是否发送校验短信标识，1不发送不验证， 其他发送并验证
		//String msgCodeFlag = MySimulateData.getInstance().getParam(SysConstant.MSG_CODE_FLAG);
		// 已过期,需要重新校验登录
		//if (smsPwdSession == null ) {
		//	return super.failed("短信过期失败!", ResultConstant.ACCESS_NOT_NORMAL.getCode());
		try{
			if (smsPwdSession.equals(smsPwd)) {
				jsonResponse.setCode(0);
	        	jsonResponse.setSuccessed(true);
	        	request.getSession().setAttribute(SysConstant.SESSION_KEY_SMS_RESULT, true);//短信校验结果
	        	//短信校验成功，同步发送新密码短信以及调用系管重置接口
	        	param.remove("smsPwd");
	        /*	//随机生成密码
	        	String pwd = getRandomString(8);
	        	System.out.println(pwd);
	        	MessageDigest messageDigest = MessageDigest.getInstance("MD5");
	        	messageDigest.update(pwd.getBytes("UTF-8")); 
	        	byte[] byteArray = messageDigest.digest();  
	        	  
	            StringBuffer md5StrBuff = new StringBuffer();  
	      
	            for (int i = 0; i < byteArray.length; i++) {              
	                if (Integer.toHexString(0xFF & byteArray[i]).length() == 1)  
	                    md5StrBuff.append("0").append(Integer.toHexString(0xFF & byteArray[i]));  
	                else  
	                    md5StrBuff.append(Integer.toHexString(0xFF & byteArray[i]));  
	            }  */
	        	param.put("actionType", "PWD_RESET");
	        	param.put("staffId", request.getSession().getAttribute("staffId"));
	        	Map returnMap = staffBmo.updatePassword(param, null, null);
	        	if(ResultCode.R_SUCC.equals(returnMap.get("code"))){
	        		//发送新密码：
	        		sendMsg(request,(String)request.getSession().getAttribute("mobilePhone"),
	        				(String)param.get("areaId"),"PWDRESET_SMS_PWD_CONTENT",(String)request.getSession().getAttribute("pwd")); // 发短信 。。。
				}else{
					Map<String, Object> failData = new HashMap<String, Object>();
					failData.put("message", returnMap.get("msg"));
					jsonResponse = super.failed(failData, ResultConstant.FAILD.getCode());
					return jsonResponse;
				}
	        } else{
	        	request.getSession().setAttribute(SysConstant.SESSION_KEY_SMS_RESULT, false);//短信校验结果
	        	return super.failed("短信码输入错误！", ResultConstant.FAILD.getCode());
			}
		}catch(BusinessException be){
			super.failed(be);
		}catch(InterfaceException ie){
			super.failed(ie, param, ErrorCode.UPDATE_STAFF_PWD);
		}catch(Exception e){
			super.failed(ErrorCode.UPDATE_STAFF_PWD, e, param);
		}
		return jsonResponse;
    }
    //跳转至忘记修改密码页面
    @RequestMapping(value = "/updatePwd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String preUpdatePwd(HttpSession session,Model model) throws AuthorityException {
    	model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"passwordMgr/updatePwd"));
    	return "/staff/staff-forget-pwd";
    }
    //重发校验码
    @RequestMapping(value = "/reSend", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse reSend(HttpSession session,Model model ,@RequestBody Map<String, Object> param,HttpServletRequest request) {
    	JsonResponse jsonResponse = new JsonResponse();
    	Integer totalSize = 0;
    	List list = new ArrayList();
    	String areaId = param.get("areaId")==null?"":param.get("areaId").toString();
    	String staffCode = param.get("code")==null?"":param.get("code").toString();
    	Integer iAreaId = areaId==null?0:Integer.parseInt(areaId);
    	String pageIndex = param.get("pageIndex")==null?"":param.get("pageIndex").toString();
    	String pageSize = param.get("pageSize")==null?"":param.get("pageSize").toString();
    	int iPage = 1;
    	int iPageSize = 10 ;
    	Map staffParm = new HashMap(param);
    	try{
    		iPage = Integer.parseInt(pageIndex);
    		iPageSize = Integer.parseInt(pageSize) ;
    		if(iPage>0){
    			staffParm.put("areaId", iAreaId);
    			staffParm.put("staffCode", staffCode);
    			Map returnMap = staffBmo.queryStaffList(staffParm, null, null);
            	if(returnMap.get("totalNum")!=null){
            		totalSize = Integer.parseInt(returnMap.get("totalNum").toString());
            	}
        		jsonResponse.setCode(0);
            	jsonResponse.setSuccessed(true);
            	jsonResponse.setData(totalSize);
            	if(totalSize < 1){
        	    	return super.failed("该工号不存在", ResultConstant.FAILD.getCode());
        	    }
            	ArrayList<Map<String, Object>> staffInfos = (ArrayList<Map<String, Object>>)returnMap.get("result");
            	if(staffInfos!=null&&staffInfos.size()>0 && (staffInfos.get(0).get("mobilePhone") == null ||staffInfos.get(0).get("mobilePhone") == ""||staffInfos.get(0).get("mobilePhone") == "null")){
					return super.failed("该工号未绑定手机号码,无法找回密码。请绑定手机，再进行操作!", ResultConstant.FAILD.getCode());
				}
    			sendMsg(request,(String)staffInfos.get(0).get("mobilePhone"),areaId); // 发短信 。。。
   			}
    	}catch(BusinessException be){
			super.failed(be);
		}catch(InterfaceException ie){
			super.failed(ie, staffParm, ErrorCode.QUERY_STAFF_INFO);
		}catch(Exception e){
			super.failed(ErrorCode.QUERY_STAFF_INFO, e, staffParm);
		}
    	return jsonResponse;
    }
    //员工查询
    @RequestMapping(value = "/getStaff", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getStaff(HttpSession session,Model model ,@RequestBody Map<String, Object> param,HttpServletRequest request) {
    	JsonResponse jsonResponse = new JsonResponse();
    	Integer totalSize = 0;
    	List list = new ArrayList();
    	String areaId = param.get("areaId")==null?"":param.get("areaId").toString();
    	String staffCode = param.get("code")==null?"":param.get("code").toString();
    	Integer iAreaId = areaId==null?0:Integer.parseInt(areaId);
    	String pageIndex = param.get("pageIndex")==null?"":param.get("pageIndex").toString();
    	String pageSize = param.get("pageSize")==null?"":param.get("pageSize").toString();
    	int iPage = 1;
    	int iPageSize = 10 ;
    	Map staffParm = new HashMap(param);
    	try{
    		iPage = Integer.parseInt(pageIndex);
    		iPageSize = Integer.parseInt(pageSize) ;
    		if(iPage>0){
    			staffParm.put("areaId", iAreaId);
    			staffParm.put("staffCode", staffCode);
    			Map returnMap = staffBmo.queryStaffList(staffParm, null, null);
            	if(returnMap.get("totalNum")!=null){
            		totalSize = Integer.parseInt(returnMap.get("totalNum").toString());
            	}
        		jsonResponse.setCode(0);
            	jsonResponse.setSuccessed(true);
            	jsonResponse.setData(totalSize);
            	if(totalSize < 1){
        	    	return super.failed("该工号不存在", ResultConstant.FAILD.getCode());
        	    }
            	ArrayList<Map<String, Object>> staffInfos = (ArrayList<Map<String, Object>>)returnMap.get("result");
            	if(staffInfos!=null&&staffInfos.size()>0 && (staffInfos.get(0).get("mobilePhone") == null ||staffInfos.get(0).get("mobilePhone") == ""||staffInfos.get(0).get("mobilePhone") == "null")){
					return super.failed("该工号未绑定手机号码,无法找回密码。请绑定手机，再进行操作!", ResultConstant.FAILD.getCode());
				}
    			sendMsg(request,(String)staffInfos.get(0).get("mobilePhone"),areaId); // 发短信 。。。
   			}
    	}catch(BusinessException be){
			super.failed(be);
		}catch(InterfaceException ie){
			super.failed(ie, staffParm, ErrorCode.QUERY_STAFF_INFO);
		}catch(Exception e){
			super.failed(ErrorCode.QUERY_STAFF_INFO, e, staffParm);
		}
    	return jsonResponse;
    }

	// 短信发送
	public Map<String, Object> sendMsg(HttpServletRequest request,String phoneNumber, String areaId)
			throws Exception {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		String smsPwd = UIDGenerator.generateDigitNonce(6);
		this.log.debug("短信验证码：{}", smsPwd);
		Map<String, Object> msgMap = new HashMap<String, Object>();
		msgMap.put("MsgNumber", SysConstant.MSG_NUMBER); //6位
		msgMap.put("phoneNumber", phoneNumber);
		msgMap.put("key", smsPwd);
		msgMap.put("message", propertiesUtils.getMessage("SMS_CODE_CONTENT",
				new Object[] { smsPwd }));

		if (!"00".equals(areaId.substring(5))) {
			areaId = areaId.substring(0, 5) + "00";
		}
		msgMap.put("areaId", areaId);
		retnMap = staffBmo.sendMsgInfo(msgMap, null, null);
		request.getSession().removeAttribute(SysConstant.SESSION_KEY_LOGIN_SMS);
		request.getSession().setAttribute(SysConstant.SESSION_KEY_LOGIN_SMS, smsPwd);
		return retnMap;
	}
    
    
    
    /**
     * 员工修改/重置密码
     * @param param 
     * @return
     */
	@RequestMapping(value = "/staffPwd", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse staffPwd(@RequestBody Map<String, Object> param, HttpServletRequest request,HttpServletResponse response, @LogOperatorAnn String flowNum){
		    
			boolean checkSmsPwd = (Boolean) (ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_SMS_RESULT)==null?"":ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_SMS_RESULT));
			if(!checkSmsPwd){
					return super.failed("非法请求!", ResultConstant.ACCESS_NOT_NORMAL.getCode());
			}
			String areaId = param.get("areaId")==null?"":param.get("areaId").toString();
	    	String staffCode = param.get("code")==null?"":param.get("code").toString();
	    	Integer iAreaId = areaId==null?0:Integer.parseInt(areaId);
	    	Map staffParm = new HashMap(param);
	    	Map staffPasswordParm = new HashMap();
	    	try{
	    		    staffParm.put("pageIndex", 1);
	    		    staffParm.put("pageSize", 10);
	    			staffParm.put("staffCode", staffCode);
					if(staffParm.get("newPwd")!=null&&"".equals(staffParm.get("newPwd"))){
	        			staffParm.remove("newPwd");
	        		}
	        		if(staffParm.get("actionType")!=null&&"".equals(staffParm.get("actionType"))){
	        			staffParm.remove("actionType");
	        		}
	        		Map returnMap = staffBmo.queryStaffList(staffParm, null, null);
	        		ArrayList<Map<String, Object>> staffInfos = (ArrayList<Map<String, Object>>)returnMap.get("result");
	            	if(staffInfos!=null&&staffInfos.size()>0){
	            		param.put("staffId", staffInfos.get(0).get("staffId"));
					}
	    	}catch(BusinessException be){
				super.failed(be);
			}catch(InterfaceException ie){
				super.failed(ie, staffParm, ErrorCode.QUERY_STAFF_INFO);
			}catch(Exception e){
				super.failed(ErrorCode.QUERY_STAFF_INFO, e, staffParm);
			}   	
	    	param.put("areaId", iAreaId);
			try{			
				Map<String, Object> resultMap = staffBmo.updateStaffPwd(param, flowNum, null);
				int code = (Integer)resultMap.get("code");
				String message = (String)resultMap.get("message");
				return successed(message, code); 
				
			}catch(BusinessException be){
				return super.failed(be);
			}catch(InterfaceException ie){
				return super.failed(ie, param, ErrorCode.UPDATE_STAFF_PWD);
			}catch(Exception e){
				return super.failed(ErrorCode.UPDATE_STAFF_PWD, e, param);
			}
	}
	//员工校验
    @RequestMapping(value = "/checkStaffMessage", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkStaffMessage(HttpSession session,Model model ,@RequestBody Map<String, Object> param,HttpServletRequest request) {
    	JsonResponse jsonResponse = new JsonResponse();
    	//首先进行验证码校验
    	initCaptchaService();
		String captchaID = (String)request.getSession().getAttribute(CAPTCHA_SESSIONID);
		request.getSession().removeAttribute(CAPTCHA_SESSIONID);
		String challengeResponse = request.getParameter(captchaParamterName);
		if(captchaID !=null && !captchaService.validateResponseForID(captchaID, challengeResponse)){
			Map<String, Object> failData = new HashMap<String, Object>();
			failData.put("message", "验证码错误");
			jsonResponse = super.failed(failData, ResultConstant.IMAGE_CODE_INVALID.getCode());
			return jsonResponse;
		}
		//校验工号
		try {
			Map returnMap = staffBmo.checkStaffMessage(param, null, null);
			//发送短信
			//生成短信验证码：
			String smsPwd = UIDGenerator.generateDigitNonce(6);
			if(ResultCode.R_SUCC.equals(returnMap.get("resultCode"))){
				Map<String, Object> successedData = new HashMap<String, Object>();
				//随机生成密码
	        	String pwd = getRandomString(8);
	        	System.out.println(pwd);
				successedData.put("pwd", pwd);
				request.getSession().setAttribute("pwd", pwd);
				request.getSession().setAttribute("staffId", returnMap.get("staffId"));
			    request.getSession().setAttribute("mobilePhone", param.get("mobilePhone"));
				sendMsg(request,(String)param.get("mobilePhone"),(String)param.get("areaId"),"PWDRESET_SMS_CODE_CONTENT",smsPwd); // 发短信 。。。
				jsonResponse = super.successed(successedData);
			}else{
				Map<String, Object> failData = new HashMap<String, Object>();
				failData.put("message", returnMap.get("msg"));
				jsonResponse = super.failed(failData, ResultConstant.FAILD.getCode());
				return jsonResponse;
			}
		} catch(BusinessException be){
			return super.failed(be);
		}catch(InterfaceException ie){
			return super.failed(ie, param, ErrorCode.CHECK_MESSAGE);
		}catch(Exception e){
			return super.failed(ErrorCode.CHECK_MESSAGE, e, param);
		}
    	return jsonResponse; 
    }
    /**
   	 * 从ApplicatonContext获取CaptchaService实例.
   	 */
   	protected void initCaptchaService() {
   		captchaService = (CaptchaService) SpringContextUtil.getBean("captchaService");
   	}
   	
 // 短信发送
 	public Map<String, Object> sendMsg(HttpServletRequest request,String phoneNumber, String areaId,String smsType,String smsCode)
 			throws Exception {
 		Map<String, Object> retnMap = new HashMap<String, Object>();
 		//String smsPwd = UIDGenerator.generateDigitNonce(6);
 		this.log.debug("短信验证码：{}", smsCode);
 		Map<String, Object> msgMap = new HashMap<String, Object>();
 		msgMap.put("MsgNumber", SysConstant.MSG_NUMBER); //6位
 		msgMap.put("phoneNumber", phoneNumber);
 		msgMap.put("key", smsCode);
 		String randomCode = UIDGenerator.generateDigitNonce(2);
 		randomCode = UIDGenerator.generateDigitNonce(2);
		for(;randomCode == ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CHANGEUIM_RANDONCODE);)
		{
			randomCode = UIDGenerator.generateDigitNonce(2);
		}
 		msgMap.put("message", propertiesUtils.getMessage(smsType,
 				new Object[] { smsCode,randomCode }));

 		if (!"00".equals(areaId.substring(5))) {
 			areaId = areaId.substring(0, 5) + "00";
 		}
 		msgMap.put("areaId", areaId);
 		retnMap = staffBmo.sendMsgInfo(msgMap, null, null);
 		request.getSession().removeAttribute(SysConstant.SESSION_KEY_LOGIN_SMS);
 		request.getSession().setAttribute(SysConstant.SESSION_KEY_LOGIN_SMS, smsCode);
 		return retnMap;
 	}
 	
 	//重发校验码
    @RequestMapping(value = "/reSendPwd", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse reSendPwd(HttpSession session,Model model ,@RequestBody Map<String, Object> param,HttpServletRequest request) {
    	JsonResponse jsonResponse = new JsonResponse();
    	Integer totalSize = 0;
    	List list = new ArrayList();
    	String areaId = param.get("areaId")==null?"":param.get("areaId").toString();
    	String staffCode = param.get("code")==null?"":param.get("code").toString();
    	Integer iAreaId = areaId==null?0:Integer.parseInt(areaId);
    	String pageIndex = param.get("pageIndex")==null?"":param.get("pageIndex").toString();
    	String pageSize = param.get("pageSize")==null?"":param.get("pageSize").toString();
    	int iPage = 1;
    	int iPageSize = 10 ;
    	Map staffParm = new HashMap(param);
    	try{
    		iPage = Integer.parseInt(pageIndex);
    		iPageSize = Integer.parseInt(pageSize) ;
    		if(iPage>0){
    			staffParm.put("areaId", iAreaId);
    			staffParm.put("staffCode", staffCode);
    			Map returnMap = staffBmo.queryStaffList(staffParm, null, null);
            	if(returnMap.get("totalNum")!=null){
            		totalSize = Integer.parseInt(returnMap.get("totalNum").toString());
            	}
        		jsonResponse.setCode(0);
            	jsonResponse.setSuccessed(true);
            	jsonResponse.setData(totalSize);
            	if(totalSize < 1){
        	    	return super.failed("该工号不存在", ResultConstant.FAILD.getCode());
        	    }
            	ArrayList<Map<String, Object>> staffInfos = (ArrayList<Map<String, Object>>)returnMap.get("result");
            	if(staffInfos!=null&&staffInfos.size()>0 && (staffInfos.get(0).get("mobilePhone") == null ||staffInfos.get(0).get("mobilePhone") == ""||staffInfos.get(0).get("mobilePhone") == "null")){
					return super.failed("该工号未绑定手机号码,无法找回密码。请绑定手机，再进行操作!", ResultConstant.FAILD.getCode());
				}
            	//生成短信验证码：
    			String smsPwd = UIDGenerator.generateDigitNonce(6);
    			sendMsg(request,(String)staffInfos.get(0).get("mobilePhone"),(String)param.get("areaId"),"PWDRESET_SMS_CODE_CONTENT",smsPwd); // 发短信 。。。
   			}
    	}catch(BusinessException be){
			super.failed(be);
		}catch(InterfaceException ie){
			super.failed(ie, staffParm, ErrorCode.QUERY_STAFF_INFO);
		}catch(Exception e){
			super.failed(ErrorCode.QUERY_STAFF_INFO, e, staffParm);
		}
    	return jsonResponse;
    }
    public  String getRandomString(int length) { //length表示生成字符串的长度  
        String base = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*0123456789";     
        Random random = new Random();     
        StringBuffer sb = new StringBuffer();     
        for (int i = 0; i < length; i++) {     
            int number = random.nextInt(base.length());     
            sb.append(base.charAt(number));     
        }     
        return sb.toString();     
     }     
    
}

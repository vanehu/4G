package com.al.lte.portal.controller.system;

import java.net.InetAddress;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ThemeResolver;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonError;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.LevelLog;
import com.al.ecs.common.entity.Switch;
import com.al.ecs.common.util.CryptoUtils;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.PortalCheckedException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.SessionValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.ecs.spring.interceptor.SessionInterceptor;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.staff.StaffChannelBmo;
import com.al.lte.portal.bmo.system.MenuBmo;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.MySessionInterceptor;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalUtils;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.common.print.PrintHelperMgnt;
import com.al.lte.portal.core.DataEngine;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.filter.SingleSignListener;
import com.al.lte.portal.model.SessionStaff;
import com.al.lte.portal.model.Staff;

/**
 * 登录控制器 . <BR>
 * <P>
 * @author dujb3
 * @version V1.0 2013-08-06
 * @createDate 2013-08-06 上午4:14:12
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Controller("com.al.lte.portal.controller.system.LoginController")
@RequestMapping("/staff/*")
public class LoginController extends BaseController {

	private final Log log = Log.getLog(getClass());

	/** 验证多少失败,出现图片验证码. */
	public static final int MAX_IMAGE_COUNT = 2;
	/** 登录验证错误次数上限. */
	public static final int MAX_LOGIN_CHECK_ERROR_COUNT = 10;
	/** des加密解密所需要的秘钥. */
	public static final byte[] keyBytes = {64, 100, -32, 117, -3, -39, 22,
			-63, 79, 76, 52, -3, 7, -116, -53, -65, 64, 100, -32, 117, -3, -39,
			22, -63};
	/** des加密后储存的cookie名称 */
	public static final String desKey = "cookieUser";
	/** */
	public static final String IMAGE_CODE = "image_code";
	/** 短信验证前，登陆会话临时ID */
	public static final String SESSION_KEY_TEMP_LOGIN_STAFF = "_session_key_tenm_sms";
	/***/
	@Autowired
	PropertiesUtils propertiesUtils;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	@Autowired
	@Qualifier("themeResolver")
	private ThemeResolver themeResolver;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffChannelBmo")
    private StaffChannelBmo staffChannelBmo;
    
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.system.MenuBmo")
    private MenuBmo menuBmo;
    
	/**
	 * consumes="text/plain",produces="application/json 接受的请求的header中的
	 * Content-Type为text/plain; Accept为application/json
	 * 
	 * RequestResponseBodyMethodProcessor
	 * 
	 * @param session
	 * @param model
	 * @return
	 */
	@LogOperatorAnn(switchs = Switch.OFF)
	@RequestMapping(value = "/login/page", method = RequestMethod.GET)
	public String login(HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		session.setAttribute(SysConstant.SERVER_NAME,getSerName());
		session.setAttribute(SysConstant.SERVER_IP,getSerAddrPart());
		// 已经登录
		if (sessionStaff != null) {
			String lastUrl = ServletUtils.getCookieValue(request, "_last_url");
			if (lastUrl != null) {
				lastUrl = lastUrl.substring(lastUrl.indexOf("/", 2));
				ServletUtils.delCookie(response, "_last_url", "/", request);
				return "redirect:" + lastUrl;
			} else {
				return super.redirect("/main/home");
			}
		}
		Cookie aCookie=ServletUtils.getCookie(request, SysConstant.SESSION_KEY_PAD_FLAG);
		if(aCookie!=null&&StringUtils.isNotBlank(aCookie.getValue())&&aCookie.getValue().equals("1")){
			model.addAttribute("serviceCall","0");
			return "/staff/padlogin";
		}else{
			String countStr = (String) session.getAttribute(SysConstant.SESSION_KEY_IMAGE_CODE);
			if (countStr != null && Integer.parseInt(countStr) >= MAX_IMAGE_COUNT) {
				model.addAttribute(IMAGE_CODE, 1);
			} else {
				model.addAttribute(IMAGE_CODE, 0);
			}
			return "/staff/login";
		}
	}
	@LogOperatorAnn(switchs = Switch.OFF)
	@RequestMapping(value = "/padlogin/page", method = RequestMethod.GET)
	public String padlogin(HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response) {
		model.addAttribute("serviceCall","1");
		return "/staff/padlogin";
	}
	
	/**
	 * 前台弹出登录框验证是否已经登录过，是则直接登录，否则跳到首页重新验证登录
	 * @param staff
	 * @param request
	 * @param flowNum
	 * @return JsonResponse
	 * @throws PortalCheckedException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/login/loginValid",method = RequestMethod.POST)
	@LogOperatorAnn(switchs = Switch.OFF)
	@ResponseBody
	public JsonResponse loginValid(@Valid @RequestBody Map<String, Object> paramMap,
			HttpServletRequest request, HttpServletResponse response, 
			@LogOperatorAnn String flowNum)
			throws PortalCheckedException {
		JsonResponse jsonResponse = new JsonResponse();
		String staffCode = MapUtils.getString(paramMap, "staffCode", "");
		String password = MapUtils.getString(paramMap, "password", "");
		String staffProvCode = MapUtils.getString(paramMap, "staffProvCode", "");
		String lanIp = MapUtils.getString(paramMap, "lanIp", "");
		String currentChannelId = MapUtils.getString(paramMap, "channelId", "");
		Staff staff = new Staff();
		staff.setUsername(staffCode);
		staff.setPassword(password);
		staff.setStaffProvCode(staffProvCode);
		staff.setLanIp(lanIp);
		try{
			//获取cookie
			String cookieStaffCode = ServletUtils.getCookieValue(request, desKey);
			if(cookieStaffCode == null) {
				//1444:用户需重新验证
				return super.failed("登录用户需重新验证，将返回首页", 1444);
			}
			//解密cookie
			cookieStaffCode = CryptoUtils.desEdeDecryptFromHex(cookieStaffCode, keyBytes);
			cookieStaffCode = cookieStaffCode.substring(cookieStaffCode.indexOf("_") + 1,cookieStaffCode.length());
			//判断是否相同，是则调用登录，否则返回
			if(!staffCode.toUpperCase().equals(cookieStaffCode.toUpperCase())) {
				return super.failed("登录用户需重新验证，将返回首页", 1444);
			}
			Cookie aCookie=ServletUtils.getCookie(request, SysConstant.SESSION_KEY_PAD_FLAG);
			String padFlag="0";
			if(aCookie!=null&&StringUtils.isNotBlank(aCookie.getValue())&&aCookie.getValue().equals("1")){
				padFlag="1";
				jsonResponse = padlogindo(paramMap, request, response, flowNum, "N");
			}else{
			//登录方法
				jsonResponse = login(staff, request, response, flowNum, "N");
			}
			
			if(jsonResponse.getCode() == 0) {
				// 登陆后，服务层返回的认证后用户信息
				Map<String, Object> mapSession = (Map<String, Object>) ServletUtils
						.getSessionAttribute(request, SESSION_KEY_TEMP_LOGIN_STAFF);
				SessionStaff sessionStaff = new SessionStaff();
				if (mapSession != null) {
					sessionStaff = SessionStaff.setStaffInfoFromMap(mapSession);
					
					JsonResponse channelResp = queryChannel(sessionStaff, currentChannelId);
					//如果查询渠道失败
					if (!channelResp.isSuccessed()) {
						return channelResp;
					}
					Map<String, Object> channelResultMap = (Map<String, Object>) channelResp.getData();
					
					JsonResponse menuResp = queryMenu(sessionStaff);
					//如果查询菜单失败
					if (!menuResp.isSuccessed()) {
						return menuResp;
					}
					Map<String, Object> menuResultMap = (Map<String, Object>) menuResp.getData();
					
					// 换新sessionId ,让会话失效时间由sessin-config生效
					request.getSession().invalidate();
					HttpSession session = request.getSession(true);
					session.setAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
					session.setAttribute(PortalUtils.THEME_SESSION_ATTRIBUTE_NAME, super.getTheme());
					
					session.setAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL,(List) channelResultMap.get("channelList"));
					session.setAttribute(SysConstant.SESSION_KEY_PORTAL_TYPE, propertiesUtils.getMessage(SysConstant.APPDESC));
					session.setAttribute(SysConstant.SERVER_NAME,getSerName());
					session.setAttribute(SysConstant.SESSION_KEY_MENU_LIST, menuResultMap.get("menuList"));
					
					session.getServletContext().setAttribute(sessionStaff.getStaffCode(),session.getId());
					//对登录成功用户名进行加密储存至cookie
					staffCode = new Date().toString() + "_" + staffCode;
					String desStaffCode = CryptoUtils.desEdeEncryptToHex(staffCode, keyBytes);
					ServletUtils.addCookie(response, "/", ServletUtils.ONE_WEEK_SECONDS, desKey, desStaffCode);
					if(padFlag.equals("1")){				
						ServletUtils.addCookie(response,"/",ServletUtils.ONE_WEEK_SECONDS,SysConstant.SESSION_KEY_PAD_FLAG,"1");
						session.setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "1");
					}else{
						ServletUtils.addCookie(response,"/",ServletUtils.ONE_WEEK_SECONDS,SysConstant.SESSION_KEY_PAD_FLAG,"0");
						session.setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "0");
					}
				}
			}
			return jsonResponse;
		//} catch (BusinessException be) {
			
			//return super.failed(be);
		//} catch (InterfaceException ie) {

			//return super.failed(ie, paramMap, "STAFF_LOGIN");
		} catch (Exception e) {
			log.error("门户/staff/login/loginValid方法异常", e);
			return super.failed(ErrorCode.STAFF_LOGIN, e, paramMap);
		}
	}
	@RequestMapping(value = "/login/padloginout",method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse padloginout(HttpSession session, HttpServletResponse response,HttpServletRequest request){
		if(session.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF)!=null){
			session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
			session.invalidate();
		}
		ServletUtils.delCookie(response,  SysConstant.SESSION_KEY_PAD_FLAG, "/", request);
		return super.successed("");
	}
	/**
	 * pad客户端登录
	 * @param paramMap
	 * @param request
	 * @param flowNum
	 * @return JsonResponse
	 * @throws PortalCheckedException
	 */
	@RequestMapping(value = "/login/padlogindo",method = RequestMethod.POST)
	@LogOperatorAnn(switchs = Switch.OFF)
	@ResponseBody
	public JsonResponse padlogindo(@Valid @RequestBody Map<String, Object> paramMap,
			HttpServletRequest request, HttpServletResponse response, 
			@LogOperatorAnn String flowNum,String loginValid)
			throws PortalCheckedException {
		paramMap.put("platformCode", SysConstant.SM_PLATFORM_CODE);
		Map<String, Object> map = null;
		try {
			map = staffBmo.loginCheck(paramMap, flowNum, new SessionStaff());
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)) {
				request.getSession().setAttribute(
						SESSION_KEY_TEMP_LOGIN_STAFF, map);
				// 工号绑定手机号码判断
//				String bindNumber = MapUtils.getString(map, "bindNumber");
//				if (StringUtils.isBlank(bindNumber)) {
//					return super.failed("该工号未绑定手机号码", ResultConstant.FAILD.getCode());
//				} else if (!GenericValidator.matchRegexp(bindNumber, "^1\\d{10}$")) {
//					return super.failed("该工号绑定手机号码有误", ResultConstant.FAILD.getCode());
//				}
				
				//判断是否需要发送短信校验码
				String retnStr = null;
				if ("N".equals(loginValid)) {
					retnStr = "登录成功!";
				} else {
					Map<String, Object> msgMap = sendMsg(request, flowNum);
					if (ResultCode.R_FAILURE.equals(msgMap.get("resultCode"))) {
						//如果发送短信异常
						return super.failed(msgMap.get("resultMsg"), 3);
					}
					retnStr = "短信校验码发送成功!";
				}
				String staffProvCode = MapUtils.getString(paramMap, "staffProvCode", "");
				ServletUtils.addCookie(response, "/", ServletUtils.ONE_WEEK_SECONDS, "login_area_id", staffProvCode);
				request.getSession().setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "1");
				String smsPassFlag = MapUtils.getString(map, "smsPassFlag", "Y");
				String msgCodeFlag = MySimulateData.getInstance().getParam(SysConstant.MSG_CODE_FLAG);
				//如果全局开关设定为不发送，或者员工信息表明不发送，或者当前是重新登录不发送短信
				if ("1".equals(msgCodeFlag) || "N".equals(smsPassFlag) || "N".equals(loginValid)) {
					return super.successed("N");
				}
				return super.successed("Y");
			}else{
				String message = (String) map.get("resultMsg");
				return super.failed(message,-1);
			}
		} catch (Exception e) {
			log.error("门户/staff/login/loginValid方法异常", e);
			return super.failed(ErrorCode.STAFF_LOGIN, e, paramMap);
		}
	}
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/login/logindo", method = RequestMethod.POST)
	// @LogOperatorAnn(desc = "员工登录校验", code = "LOGIN", level = LevelLog.DB)
	@LogOperatorAnn(switchs = Switch.OFF)
	@ResponseBody
	public JsonResponse login(@Valid @RequestBody Staff staff,
			HttpServletRequest request, HttpServletResponse response, 
			@LogOperatorAnn String flowNum,
			String loginValid) throws PortalCheckedException {
		this.log.debug("java heap space size={}", Runtime.getRuntime().maxMemory()/(1024*1024)+"M");
		this.log.debug("userMap={}", staff);
		String staffCode = staff.getStaffCode();
		String password = staff.getPassword();
		String staffProvCode = staff.getStaffProvCode();
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("staffCode", staffCode);
		dataBusMap.put("password", password);
		dataBusMap.put("staffProvCode", staffProvCode);
		dataBusMap.put("platformCode", SysConstant.SM_PLATFORM_CODE);
		String ip = "";
		try {
			ip = ServletUtils.getIpAddr(request);
			if (StringUtils.isNotEmpty(ip)) {
				dataBusMap.put("wanIp", ip);
//				UdpGetClientMacAddr addr = new UdpGetClientMacAddr(ip);
//				dataBusMap.put("mac", addr.GetRemoteMacAddr());
//				dataBusMap.put("mac", "");
			}
		} catch (Exception e) {
			log.error("门户/staff/login/logindo服务获取ip异常", e);
		}
		
		Map<String, Object> map = null;
		try {
			map = staffBmo.loginCheck(dataBusMap, flowNum, new SessionStaff());
			
			// 调用返回服务调用结果code
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)) {
				ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_KEY_IMAGE_CODE);
				if (StringUtils.isNotEmpty(ip)) {
					map.put("ip", ip);
				}
				map.put("password", password);
				map.put("staffProvCode", staffProvCode);
				request.getSession().setAttribute(
						SESSION_KEY_TEMP_LOGIN_STAFF, map);
				//存入并取出session中的TEMP_LOGIN_STAFF
				Map<String, Object> mapSession = (Map<String, Object>) request
						.getSession().getAttribute(SESSION_KEY_TEMP_LOGIN_STAFF);
				
				// 工号绑定手机号码判断
				//部分10000号上班无法使用手机，注释该判断
//				String bindNumber = MapUtils.getString(map, "bindNumber");
//				if (StringUtils.isBlank(bindNumber)) {
//					return super.failed("该工号未绑定手机号码", ResultConstant.FAILD.getCode());
//				} else if (!GenericValidator.matchRegexp(bindNumber, "^1\\d{10}$")) {
//					return super.failed("该工号绑定手机号码有误", ResultConstant.FAILD.getCode());
//				}
				
				//判断是否需要发送短信校验码
				String retnStr = null;
				if ("N".equals(loginValid)) {
					retnStr = "登录成功!";
				} else {
					Map<String, Object> msgMap = sendMsg(request, flowNum);
					if (ResultCode.R_FAILURE.equals(msgMap.get("resultCode"))) {
						//如果发送短信异常
						return super.failed(msgMap.get("resultMsg"), 3);
					}
					retnStr = "短信校验码发送成功!";
				}
				//获取渠道信息
//				ServletUtils.addCookie(response, "/", ServletUtils.ONE_WEEK_SECONDS, "login_area_id", staffProvCode);
				request.getSession().setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "0");
				//往数据中填充
				String smsPassFlag = MapUtils.getString(map, "smsPassFlag", "Y");
				String msgCodeFlag = MySimulateData.getInstance().getParam(SysConstant.MSG_CODE_FLAG);
				//如果全局开关设定为不发送，或者员工信息表明不发送，或者当前是重新登录不发送短信
				if ("1".equals(msgCodeFlag) || "N".equals(smsPassFlag) || "N".equals(loginValid)) {
					return super.successed("N");
				}
				return super.successed("Y");
			} else {
				Map<String, Object> failData = new HashMap<String, Object>();
				String imageCode = (String) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_IMAGE_CODE);
				// 用户登录失败次数
				String errorNum = MapUtils.getString(map, "errorNum", "11");
				int errorInt = Integer.parseInt(errorNum);
				if (errorInt >= MAX_IMAGE_COUNT) {
					//image_code 为 1 则出现校验码
					failData.put("image_code", 1);
					ServletUtils.setSessionAttribute(request, SysConstant.SESSION_KEY_IMAGE_CODE, errorNum);
				} else if (StringUtils.isNotEmpty(imageCode)) {
					//image_code 为 1 则出现校验码
					failData.put("image_code", 1);
					ServletUtils.setSessionAttribute(request, SysConstant.SESSION_KEY_IMAGE_CODE, "" + MAX_IMAGE_COUNT);
				}
				// 返回信息
				failData.put("message", MapUtils.getString(map, "resultMsg", "员工登录失败，未得到报错信息"));
				JsonResponse jsonResponse = super.failed(failData, ResultConstant.DATA_NOT_VALID_FAILTURE.getCode());
				return jsonResponse;
			}
		} catch (BusinessException be) {
			
			return super.failed(be);
		} catch (InterfaceException ie) {

			return super.failed(ie, dataBusMap, ErrorCode.STAFF_LOGIN);
		} catch (Exception e) {
			
			log.error("门户登录/staff/login/logindo方法异常", e);
			return super.failed(ErrorCode.STAFF_LOGIN, e, dataBusMap);
		}
	}


	@RequestMapping(value = "/login/reSend", method = RequestMethod.GET)
	@LogOperatorAnn(desc = "短信校验码发送", code = "LOGIN", level = LevelLog.DB)
	@ResponseBody
	public JsonResponse reSend(HttpServletRequest request, @LogOperatorAnn String flowNum) {
		try {
			Long sessionTimeL = (Long) request.
					getSession().getAttribute(SysConstant.SESSION_KEY_TEMP_SMS_TIME);
			if (sessionTimeL != null) {
				long sessionTime = sessionTimeL;
				long nowTime = (new Date()).getTime();
				long inteval = 28 * 1000;//比30秒提前2秒
				if (nowTime - sessionTime > inteval) {
					
					sendMsg(request, flowNum);
					
				} else {
					log.debug("time inteval:{}", nowTime - sessionTime);
					return super.failed("短信验证码发送时间有误!", 
							ResultConstant.ACCESS_LIMIT_FAILTURE.getCode());
				}
			} else {
				request.getSession().removeAttribute(
						SysConstant.SESSION_KEY_TEMP_SMS_TIME);
				request.getSession().setAttribute(
						SysConstant.SESSION_KEY_TEMP_SMS_TIME, (new Date()).getTime());
				return super.failed("短信验证码发送时间有误!", 
						ResultConstant.ACCESS_LIMIT_FAILTURE.getCode());
			}
			
		} catch (BusinessException be) {
			this.log.error("错误信息:{}", be);
			return super.failed(be);
		} catch (InterfaceException ie) {

			return super.failed(ie, new HashMap<String, Object>(), ErrorCode.STAFF_LOGIN);
		} catch (Exception e) {
			
			log.error("门户登录/staff/login/logindo方法异常", e);
			return super.failed(ErrorCode.STAFF_LOGIN, e, new HashMap<String, Object>());
		}
		return super.successed("短信验证码发送成功!", ResultConstant.SUCCESS.getCode());

	}

	// 短信发送
	@SuppressWarnings("unchecked")
	public Map<String, Object> sendMsg(HttpServletRequest request, String flowNum)
			throws Exception {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		Map<String, Object> mapSession = (Map<String, Object>) request.getSession().getAttribute(
				SESSION_KEY_TEMP_LOGIN_STAFF);

		if (mapSession != null) {
			String smsPwd = UIDGenerator.generateDigitNonce(6);
			this.log.debug("短信验证码：{}", smsPwd);
			String smsPassFlag = MapUtils.getString(mapSession, "smsPassFlag", "Y");
			
			// 系统参数表中的是否发送校验短信标识，1不发送不验证， 其他发送并验证
			String msgCodeFlag = MySimulateData.getInstance().getParam(SysConstant.MSG_CODE_FLAG);
			
			if (!"1".equals(msgCodeFlag) && !"N".equals(smsPassFlag)) {
				SessionStaff sessionStaff = SessionStaff.setStaffInfoFromMap(mapSession);
				Map<String, Object> msgMap = new HashMap<String, Object>();
				msgMap.put("phoneNumber", mapSession.get("bindNumber"));
				msgMap.put("key", smsPwd);
				msgMap.put("message", propertiesUtils.getMessage(
						"SMS_CODE_CONTENT", new Object[] { smsPwd }));
				msgMap.put("areaId", sessionStaff.getAreaId());
				
				retnMap = staffBmo.sendMsgInfo(msgMap, flowNum, sessionStaff);

			}

			request.getSession().removeAttribute(SysConstant.SESSION_KEY_LOGIN_SMS);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_LOGIN_SMS, smsPwd);
			//短信发送时间间隔
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_TEMP_SMS_TIME);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_SMS_TIME, (new Date()).getTime());

		} else {
			this.log.error("错误信息:登录会话失效，请重新登录!");
		}
		return retnMap;
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/login/smsValid", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse smsValidate(@RequestParam("smspwd") String smsPwd,
			HttpServletRequest request ,HttpServletResponse response) throws Exception {
		this.log.debug("smsPwd={}", smsPwd);
		
		long l_start = Calendar.getInstance().getTimeInMillis();
		
		// 验证码内容
		String smsPwdSession = (String) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_SMS);
		ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS);
		// 登陆后，服务层返回的认证后用户信息
		Map<String, Object> mapSession = (Map<String, Object>) ServletUtils
				.getSessionAttribute(request, SESSION_KEY_TEMP_LOGIN_STAFF);
		String smsPassFlag = MapUtils.getString(mapSession, "smsPassFlag", "Y");
		// 系统参数表中的是否发送校验短信标识，1不发送不验证， 其他发送并验证
		String msgCodeFlag = MySimulateData.getInstance().getParam(SysConstant.MSG_CODE_FLAG);
		// 已过期,需要重新校验登录
		if (smsPwdSession == null||mapSession==null) {
			return super.failed("短信过期失败!", ResultConstant.ACCESS_NOT_NORMAL.getCode());
		
		} else if (smsPwdSession.equals(smsPwd) || "1".equals(msgCodeFlag) || "N".equals(smsPassFlag)) {
			SessionStaff sessionStaff = SessionStaff.setStaffInfoFromMap(mapSession);
			
			JsonResponse channelResp = queryChannel(sessionStaff, "");
			//如果查询渠道失败
			if (!channelResp.isSuccessed()) {
				return channelResp;
			}
			Map<String, Object> channelResultMap = (Map<String, Object>) channelResp.getData();
			
			JsonResponse menuResp = queryMenu(sessionStaff);
			//如果查询菜单失败
			if (!menuResp.isSuccessed()) {
				return menuResp;
			}
			Map<String, Object> menuResultMap = (Map<String, Object>) menuResp.getData();
			
            String padFlag=(String)ServletUtils.getSessionAttribute(
					request, SysConstant.SESSION_KEY_PAD_FLAG);
			// 换新sessionId ,让会话失效时间由sessin-config生效
			request.getSession().invalidate();
			HttpSession session=request.getSession(true);
			session.setAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
			session.setAttribute(PortalUtils.THEME_SESSION_ATTRIBUTE_NAME, super.getTheme());

			session.getServletContext().setAttribute(sessionStaff.getStaffCode(),session.getId());
			
			session.setAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL,(List) channelResultMap.get("channelList"));
			session.setAttribute(SysConstant.SESSION_KEY_PORTAL_TYPE, propertiesUtils.getMessage(SysConstant.APPDESC));
			
			session.setAttribute(SysConstant.SESSION_KEY_MENU_LIST, menuResultMap.get("menuList"));
			session.setAttribute(SysConstant.SERVER_NAME,getSerName());
			session.setAttribute(SysConstant.SERVER_IP,getSerAddrPart());
			//对登录成功用户名进行加密储存至cookie
			String staffCode = sessionStaff.getStaffCode();
			staffCode = (new Date()).toString() + "_" + staffCode;
			String desStaffCode = CryptoUtils.desEdeEncryptToHex(staffCode, keyBytes);
			ServletUtils.addCookie(response, "/", ServletUtils.ONE_WEEK_SECONDS, desKey, desStaffCode);
			Map<String,String> resData=new HashMap<String,String>();
			if(padFlag!=null&&padFlag.equals("1")){				
				ServletUtils.addCookie(response,"/",ServletUtils.ONE_WEEK_SECONDS,SysConstant.SESSION_KEY_PAD_FLAG,"1");
				session.setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "1");
				resData.put("menus", JsonUtil.toString(menuResultMap.get("menuList")));
			}else{
				ServletUtils.addCookie(response,"/",ServletUtils.ONE_WEEK_SECONDS,SysConstant.SESSION_KEY_PAD_FLAG,"0");
				session.setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "0");
			}
			resData.put("msg", "短信验证成功.");
			resData.put("areaId", sessionStaff.getAreaId());
			
			String param= MySimulateData.getInstance().getParam("do_single_sign");
			boolean needSingleSign = 	BooleanUtils.toBoolean(param);
			if (needSingleSign) {//查看是否需要单点登录，配置项在simulate.property文件或者系统参数表中
				String token=UUID.randomUUID().toString();//生成唯一的uuid标记
				String areaId=sessionStaff.getAreaId();
				addCookie(areaId,token,response,request);//保存本地cookie
				singleSignAttr(sessionStaff,token,request);//保存单点登录session信息
				try {
				  //设置省份url访问省份系统，设置用户单点登录标记
                    String loginUrl=MySimulateData.getInstance().getNeeded(InterfaceClient.CHECK_LOGIN+"-login-"+ sessionStaff.getAreaId(), "url");
                    if(StringUtils.isNotBlank(loginUrl)){
                    	resData.put("url",loginUrl);
                    }
                  //单点登录同步退出
                    String logoutUrl=MySimulateData.getInstance().getNeeded(InterfaceClient.CHECK_LOGIN+"-logout-"+ sessionStaff.getAreaId(), "url");
                    if(StringUtils.isNotBlank(logoutUrl)){
                        session.setAttribute("_logoutUrl", logoutUrl);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
				
				resData.put("token", token);
			} 
			
			long l_end = Calendar.getInstance().getTimeInMillis();
			staffBmo.loginInlog(l_end-l_start, null, sessionStaff);//登錄日誌bianxw
			
			return super.successed(resData);
		} else {
			return super.failed("短信验证码出错!", ResultConstant.FAILD.getCode());
		}
	}
	

	@RequestMapping(value = "/login/logout", method = RequestMethod.GET)
	@SessionValid
	public String logout(HttpSession session, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		/*
		if (sessionStaff != null) {
			EhcacheUtil.evictByPrefixkey(ehCacheManager, sessionStaff
					.getStaffCode());
		}
		*/
		staffBmo.loginOutlog(null, sessionStaff);//登錄日誌bianxw
		String theme = PortalUtils.getTheme(super.getRequest(), super
				.getTheme());
		session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		session.invalidate();
		themeResolver.setThemeName(super.getRequest(), response, theme);
		return super.redirect("/staff/login/page");
	}
	/**
	 * 后台验证是否登录超时
	 * @param request
	 * @param response
	 * @param flowNum
	 * @return JsonResponse
	 * @throws PortalCheckedException
	 */
	@RequestMapping(value = "/login/isLogin",method = RequestMethod.POST)
	@LogOperatorAnn(switchs = Switch.OFF)
	@ResponseBody
	public JsonResponse isLogin(
			HttpServletRequest request, HttpServletResponse response, 
			@LogOperatorAnn String flowNum)
			throws PortalCheckedException {
		JsonResponse jsonResponse = new JsonResponse();
		try{
			HttpSession session = request.getSession(true);
			boolean successed = false;
			String data = "";
			int code = 1;
			//获取当前登录人信息
			SessionStaff sessionStaff = (SessionStaff)session.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
			if(sessionStaff != null) {
				//根据工号获取当前储存在服务器上的sessionID
				String sessionId = (String)session.getServletContext().getAttribute(sessionStaff.getStaffCode());
				if(sessionId == null) {
					successed = true;
					code = 0;
				}else {
					//判断当前登录的工号是否在其它地方登录，是则踢掉对方
					if(!sessionId.equals(session.getId())){
						session.invalidate();
						successed = false;
						code = 1;
						data = "*当前工号已经在其它地方登录，请重新登录";
					}else {
						successed = true;
						code = 0;
					}
				}
				//jsonResponse.setSuccessed(true);
				//jsonResponse.setCode(0);
			}else {
				successed = false;
				code = 1;
				//jsonResponse.setSuccessed(false);
				//jsonResponse.setCode(1);
			}
			jsonResponse.setSuccessed(successed);
			jsonResponse.setCode(code);
			jsonResponse.setData(data);
		}catch(Exception e) {
			jsonResponse.setSuccessed(false);
			jsonResponse.setCode(1);
			log.error("获取session错误",e);
		}
		return jsonResponse;
	}
	
	
	@RequestMapping(value = "/login/getAppDesc", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getAppDesc(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum) {
		try {
			//是LTE返回0，是MVNO返回1，无法区分返回-1
			if (SysConstant.APPDESC_LTE.equals(propertiesUtils.getMessage(SysConstant.APPDESC))) {
				return super.successed(0);
			} else if (SysConstant.APPDESC_MVNO.equals(propertiesUtils.getMessage(SysConstant.APPDESC))){
				return super.successed(1);
			} else {
				return super.successed(-1);
			}
		} catch (Exception e) {
			return super.successed(-1);
		}
	}
	
	
	/**
     * 重置 系统常量
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/resetAllCommonParam", method = RequestMethod.GET)
	public String resetAllCommonParam(HttpServletRequest request,Model model) throws AuthorityException {
		String checkCode = request.getParameter("code") ;
		if("DV82KN".equals(checkCode)){
			int result = DataEngine.resetAllCommonParam();
			String msg = "SP_SYS_PARAM数据表缓存刷新成功。";
			if (result  != 0) {
				msg = "SP_SYS_PARAM数据表缓存刷新失败！！";
			}
			//顺便清除apConfig缓存
			DataRepository.getInstence().getApConfigMap().clear();
			model.addAttribute("success", msg);
			return "/common/success";
		}else{
			model.addAttribute("success", "未授权的访问！");
			return "/common/success";
		}
    }
	
	/**
     * 重置 系统常量
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/resetTemplateList", method = RequestMethod.GET)
	public String resetTemplateList(HttpServletRequest request,Model model) throws AuthorityException {
		String checkCode = request.getParameter("code") ;
		if("DV82KN".equals(checkCode)){
			DataEngine.resetTemplateList();
			//重置jasper缓存
			PrintHelperMgnt.resetPrintHelperMgnt();
			model.addAttribute("success", "发票模板缓存刷新成功。");
			return "/common/success";
		}else{
			model.addAttribute("success", "未授权的访问！");
			return "/common/success";
		}
    }
	
	/**
     * 重置 系统配置文件
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/resetProperties", method = RequestMethod.GET)
	public String resetProperties(HttpServletRequest request,Model model) throws AuthorityException {
		String checkCode = request.getParameter("code") ;
		if("DV82KN".equals(checkCode)){
			propertiesUtils.clear();
			model.addAttribute("success", "portal.properties配置文件缓存刷新成功。");
			return "/common/success";
		}else{
			model.addAttribute("success", "未授权的访问！");
			return "/common/success";
		}
    }
	
	
	
	@RequestMapping(value = "/logout", method = {RequestMethod.POST,RequestMethod.GET})
	@ResponseBody
	public Object logoutService(HttpSession session,HttpServletResponse response,HttpServletRequest request){
	    SessionStaff sessionStaff = (SessionStaff) ServletUtils
                .getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_LOGIN_STAFF);
        try {//……
            staffBmo.loginOutlog(null, sessionStaff);//登錄日誌bianxw
        } catch (Exception e) {
            e.printStackTrace();
        }
		session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		session.invalidate();
		Map<String,Object> map=new HashMap<String,Object>();
		Cookie aCookie=ServletUtils.getCookie(request, SessionInterceptor.SINGLE_SIGN_COOKIE_TOKEN);
		if(aCookie!=null&&StringUtils.isNotBlank(aCookie.getValue())){
			String token=aCookie.getValue();
			MySessionInterceptor.removeToken(token);
			map.put("resultCode", "0");
			map.put("resultMsg", "登录会话注销成功");
		}else{
			map.put("resultCode", "1");
			map.put("resultMsg", "登录会话注销失败");
		}
		ServletUtils.delCookie(response,  SessionInterceptor.SINGLE_SIGN_COOKIE_AREA,"/", request);
		ServletUtils.delCookie(response,  SessionInterceptor.SINGLE_SIGN_COOKIE_TOKEN,"/", request);
		return  JsonUtil.toString(map);
	}
	/**
	 * 设置登录cookie
	 * @param request
	 * @param response
	 */
	@RequestMapping(value = "/login/setLoginCookie", method = {RequestMethod.POST,RequestMethod.GET})
	@ResponseBody
	public Object setLoginCookie(  HttpServletRequest request,HttpServletResponse response) {
		String areaId=request.getParameter("areaId");
		String token=request.getParameter("token");
		Map<String,Object> map=new HashMap<String,Object>();
		if(StringUtils.isNotBlank(areaId)&&StringUtils.isNotBlank(token)){
			addCookie(areaId,token,response,request);
			map.put("resultCode", "0");
			map.put("resultMsg", "Cookie设置成功");
		
		}else{
			map.put("resultCode", "1");
			map.put("resultMsg", "Cookie设置失败！token或areaId参数为空！");
			map.put("errorCode", "1101");
			map.put("errorStack", "");
		}
	
		return JsonUtil.toString(map);
	}
	/**
	 * 验证登录
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/login/checkSessionStaff",  method = {RequestMethod.POST,RequestMethod.GET})
	@ResponseBody
	public Object checkLogin(HttpServletRequest request,HttpServletResponse response) {
		String token=request.getParameter("token");
		Map<String,Object> map=new HashMap<String,Object>();
		if(StringUtils.isNotBlank(token)){
			Object val=MySessionInterceptor.checkToken(token);
			if(val!=null){
				map.put("resultCode", "0");
				map.put("resultMsg", "验证成功");
				SessionStaff sessionStaff=(SessionStaff) val;
				Map<String,String> resultmap=new HashMap<String ,String>();
				resultmap.put("staffCode",sessionStaff.getStaffCode());
				resultmap.put("staffName",sessionStaff.getStaffName());
				resultmap.put("areaId", sessionStaff.getAreaId());
				resultmap.put("areaCode", sessionStaff.getAreaCode());
				resultmap.put("areaName", sessionStaff.getRegionName());
				resultmap.put("cityName", sessionStaff.getCityName());
				resultmap.put("provinceName", sessionStaff.getUpProvinName());
				map.put("result", resultmap);
			}else{
				map.put("resultCode", "-1");
				map.put("resultMsg", "验证失败！没有检查到给定的token");
				map.put("errorCode", "1101");
			}
		}else{
			map.put("resultCode", "-1");
			map.put("resultMsg", "验证失败！参数token为空！");
			map.put("errorCode", "1101");
		}
		return  JsonUtil.toString(map);
	}
	/**
	 * 设置单点登录标记
	 * @param request
	 * @param response
	 */
	public static void singleSignAttr(Object obj,String token,HttpServletRequest request){
		//在Context中保存标记，供其他系统访问验证。本地标记会在session注销时自动移除该标记
		MySessionInterceptor.addToken(token, obj);
		request.getSession().setAttribute(SingleSignListener.SINGLE_SING_USER_TOKEN, token);
	}
	/**
	 * 添加本地单点登录cookie
	 * @param areaId
	 * @param token
	 * @param response
	 */
	private void addCookie(String areaId,String token, HttpServletResponse response,HttpServletRequest request){
	    response.addHeader("P3P", "CP=CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR");
		//向cookie中添加标记
		if(StringUtils.isNotBlank(areaId)){
			ServletUtils.delCookie(response,  SessionInterceptor.SINGLE_SIGN_COOKIE_AREA, request);
			ServletUtils.addCookie(response, "/", 24*60*60, SessionInterceptor.SINGLE_SIGN_COOKIE_AREA,areaId);
		}
		if(StringUtils.isNotBlank(token)){
			ServletUtils.delCookie(response,  SessionInterceptor.SINGLE_SIGN_COOKIE_TOKEN, request);
			ServletUtils.addCookie(response, "/", 24*60*60, SessionInterceptor.SINGLE_SIGN_COOKIE_TOKEN,token);
		}
	}
	
	
	private JsonResponse queryChannel(SessionStaff sessionStaff, String currentChannelId) {
		Map<String, Object> channelResultMap = new HashMap<String, Object>();
		Map<String, Object> channelParamMap = new HashMap<String, Object>();
		channelParamMap.put("staffId", sessionStaff.getStaffId());
		channelParamMap.put("dbRouteLog", sessionStaff.getPartnerId());
		channelParamMap.put("reqType", "chn");
		channelParamMap.put("relaType", "10");
		if(SysConstant.APPDESC_LTE.equals(propertiesUtils.getMessage(SysConstant.APPDESC))){
			channelParamMap.put("chnLog", "all");//原定 lte
		}else{
			channelParamMap.put("chnLog", "all");
		}
		try{
			channelResultMap = staffChannelBmo.qryCurrentChannelByStaff(sessionStaff, currentChannelId);
			
			SessionStaff.setChannelInfoFromMap(sessionStaff, channelResultMap);
		} catch (InterfaceException ie) {

			return super.failed(ie, channelParamMap, ErrorCode.QUERY_CHANNEL);
		} catch (Exception e) {
			log.error("门户/staff/login/queryChannel方法异常", e);
			return super.failed(ErrorCode.QUERY_CHANNEL, e, channelParamMap);
		}
		
		return super.successed(channelResultMap);
	}
	
	private JsonResponse queryMenu(SessionStaff sessionStaff) {
		Map<String,Object> resultMap = new HashMap<String,Object>();
		Map<String,Object> paramMap = new HashMap<String,Object>();
		paramMap.put("staffId", sessionStaff.getStaffId());
		paramMap.put("platformCode", SysConstant.SM_PLATFORM_CODE);//旧：dataBusMap.put("systemPlatformId", 1);
		paramMap.put("areaId", sessionStaff.getAreaId());
        try {
        	resultMap = menuBmo.menuQryAll(paramMap, null, sessionStaff);
        } catch (InterfaceException ie) {

			return super.failed(ie, paramMap, ErrorCode.QUERY_MENU_INFO);
		} catch (Exception e) {
			log.error("门户/staff/login/queryMenu方法异常", e);
			return super.failed(ErrorCode.QUERY_MENU_INFO, e, paramMap);
		}
        return super.successed(resultMap);
	}
	
	public String getSerName(){
		String result = "" ;
		String sIP = "" ;
		try{
            InetAddress address = InetAddress.getLocalHost();  
            sIP = ""+ address.getHostAddress();  
            result = "服务器IP：" + sIP + ",机器名："+address.getHostName()+",";
    	}catch(Exception e){
    		log.error("获取服务当前IP失败");
    		//e.printStackTrace();
    	}
		
		String str=System.getProperty("sun.java.command");
		String nodeName=null;
		String serverName=null;
		if(str!=null){
			String[] s=str.split("\\s+");
			nodeName="节点名："+s[s.length-2];
			serverName="服务名："+s[s.length-1];
			result = result + nodeName+","+serverName;
		}else{
			result = "";
		} 
		//System.out.println("当前应用信息："+result);
		return result;
	}
	
	public String getSerAddrPart(){
		String sIP = "" ;
		try{
            InetAddress address = InetAddress.getLocalHost();  
            sIP = ""+ address.getHostAddress();//10.128.21.56
            String[] sIPS = sIP.split("\\.");
            if(sIPS.length>3){
            	sIP = sIPS[2]+"."+sIPS[3];
            }
    	}catch(Exception e){
    		log.error("获取服务当前IP失败");
    		//e.printStackTrace();
    	}
		return sIP ;
	}
	
	
}

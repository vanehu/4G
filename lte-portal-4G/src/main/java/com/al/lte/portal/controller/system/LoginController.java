package com.al.lte.portal.controller.system;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import com.al.lte.portal.common.*;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
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

import com.al.common.Constant;
import com.al.common.utils.MD5Helper;
import com.al.common.utils.StringUtil;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.sm.MDA;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.LevelLog;
import com.al.ecs.common.entity.Switch;
import com.al.ecs.common.util.CryptoUtils;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.HttpUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.PortalCheckedException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.ecs.qrcode.QrCodeImageGen;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.annotation.session.SessionValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.ecs.spring.interceptor.SessionInterceptor;
import com.al.lte.portal.bmo.crm.SignBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.staff.StaffChannelBmo;
import com.al.lte.portal.bmo.system.MenuBmo;
import com.al.lte.portal.common.print.PrintHelperMgnt;
import com.al.lte.portal.core.DataEngine;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.filter.SingleSignListener;
import com.al.lte.portal.model.QRCode;
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
	/** */
	public static  List<String> CACHE_CLEAR_RESULT = new ArrayList<String>();
	/** 短信验证前，登陆会话临时ID */
	public static final String SESSION_KEY_TEMP_LOGIN_STAFF = "_session_key_tenm_sms";
	/** 补换卡短信验证号码 */
	public static final String SESSION_CHANGEUIM_SMS_MUNBER = "_changeUim_sms_munber";
	/** 补换卡短信验证地区 */
	public static final String SESSION_CHANGEUIM_SMS_AREAID = "_changeUim_sms_areaId";
	/** 客户鉴权短信验证号码 */
	public static final String SESSION_CUSTAUTH_SMS_MUNBER = "_custauth_sms_munber";
	/** 人证相符审核短信验证号码 */
	public static final String SESSION_CONFIRMAGREE_SMS_NUMBER = "_confirmAgree_sms_number";
	/** 人证相符审核短信验证地区 */
	public static final String SESSION_CONFIRMAGREE_SMS_AREAID = "_confirmAgree_sms_areaId";
	/** 人证相符审核员工ID */
	public static final String SESSION_CONFIRMAGREE_SMS_STAFFID = "_confirmAgree_sms_staffId";
	/** 人证相符审核员工工号 */
	public static final String SESSION_CONFIRMAGREE_SMS_STAFFCODE = "_confirmAgree_sms_staffCode";
	/** 人证相符审核员工姓名*/
	public static final String SESSION_CONFIRMAGREE_SMS_STAFFNAME = "_confirmAgree_sms_staffName";
	/** 人证相符审核类型*/
	public static final String SESSION_CONFIRMAGREE_SMS_CHECKTYPE = "_confirmAgree_sms_checkType";
	/** 人证相符审核实名制传虚拟订单号 */
	public static final String SESSION_CONFIRMAGREE_SMS_OLID = "_confirmAgree_sms_olId";
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
			HttpServletRequest request, HttpServletResponse response,@RequestParam Map<String, Object> userMap) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);	
		session.setAttribute(SysConstant.SERVER_NAME,getSerName());
		session.setAttribute(SysConstant.SERVER_IP,HttpUtils.getSimplifyHostIpAddress());

		String aesFlag = MapUtils.getString(userMap,"aesFlag","");
		if("Y".equals(aesFlag)){
			String param = MapUtils.getString(userMap,"param","");
			String encryptStr = AESUtils.decryptToString(param, SysConstant.TOKEN_PROVINCE_KEY);
			userMap = JsonUtil.toObject(encryptStr, HashMap.class);
		}
		// 已经登录
		if (sessionStaff != null && !("tokenLogin".equals(sessionStaff.getLogintype()))) {
			String lastUrl = ServletUtils.getCookieValue(request, "_last_url");
			if (lastUrl != null) {
				lastUrl = lastUrl.substring(lastUrl.indexOf("/", 2));
				ServletUtils.delCookie(response, "_last_url", "/", request);
				return "redirect:" + lastUrl;
			} else {
				String flag = "";
				try {
					String dbKeyWord = (String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
					flag = MySimulateData.getInstance().getParam(dbKeyWord,"UNIFYLOGIN");
				} catch (UnsupportedEncodingException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (InterfaceException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				String headerHost = request.getHeader(SysConstant.HTTP_REQUEST_HEADER_HOST);
				String defaultDomain= propertiesUtils.getMessage("DEFAULTDOMAIN");
				int port = request.getLocalPort();
				String domainNameONOFF = propertiesUtils.getMessage("DOMAINNAMEONOFF");
				if(PortalUtils.isSecondLevelDomain(headerHost) && "ON".equals(domainNameONOFF)){
					//#591478 若启用分省域名，应重定向到*.crm.189.cn:port
					return super.redirect("https://" + headerHost + "/provPortal/main/home");
				}else{
					if((port==10101 || port==10102 || port==10103) && "ON".equals(flag)){
						return super.redirect("https://"+defaultDomain+":83/provPortal/main/home");
					}else if((port==10151 || port==10152 || port==10153) && "ON".equals(flag)){
						return super.redirect("https://"+defaultDomain+":84/provPortal/main/home");
					}else{
						return super.redirect("/main/home");
					}
				}
			}
		}
		Cookie aCookie=ServletUtils.getCookie(request, SysConstant.SESSION_KEY_PAD_FLAG);
		Cookie appCookie=ServletUtils.getCookie(request, SysConstant.SESSION_KEY_APP_FLAG);
		if(aCookie!=null&&StringUtils.isNotBlank(aCookie.getValue())&&aCookie.getValue().equals("1")){
			model.addAttribute("serviceCall","0");
			return "/staff/padlogin";
		}else if(appCookie!=null&&StringUtils.isNotBlank(appCookie.getValue())&&appCookie.getValue().equals("1")){
			model.addAttribute("code", "{data:\"\",successed:0,code:-9999}");
			return "/app/staff/loginout";
		}else{
			String countStr = (String) session.getAttribute(SysConstant.SESSION_KEY_IMAGE_CODE);
			if (countStr != null && Integer.parseInt(countStr) >= MAX_IMAGE_COUNT) {
				model.addAttribute(IMAGE_CODE, 1);
			} else {
				model.addAttribute(IMAGE_CODE, 0);
			}
			model.addAttribute("user", userMap);
			model.addAttribute("userJson", JsonUtil.buildNormal().objectToJson(userMap));
			String currentAreaId = MapUtils.getString(userMap, "areaId", "");
			model.addAttribute("XUA", propertiesUtils.getMessage("XUA_" + ((currentAreaId != null && currentAreaId.length() == 7) ? currentAreaId.substring(0, 3) : "")));
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
		String flag=MapUtils.getString(paramMap, "flag", "");
		Staff staff = new Staff();
		staff.setUsername(staffCode);
		staff.setPassword(password);
		staff.setStaffProvCode(staffProvCode);
		staff.setLanIp(lanIp);
		staff.setaccepttime("");
		staff.setconnectiontime("");
		staff.setMacStr("");
		staff.setsendtime("");
		staff.setwaitingtime("");
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
				if(flag.equals("1")){//新版客户端
					padFlag="2";
				}else{
					padFlag="1";
				}
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
					
					JsonResponse channelResp = queryChannel(sessionStaff, currentChannelId, mapSession);
					//如果查询渠道失败
					if (!channelResp.isSuccessed()) {
						return channelResp;
					}
					Map<String, Object> channelResultMap = (Map<String, Object>) channelResp.getData();
					
					JsonResponse menuResp = queryMenu(sessionStaff,padFlag);
					//如果查询菜单失败
					if (!menuResp.isSuccessed()) {
						return menuResp;
					}
					Map<String, Object> menuResultMap = (Map<String, Object>) menuResp.getData();
					
					// 换新sessionId ,让会话失效时间由sessin-config生效
					String dbKeyWord = (String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
					request.getSession().invalidate();
					HttpSession session = request.getSession(true);
					session.setAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
					session.setAttribute(SysConstant.SESSION_DATASOURCE_KEY, dbKeyWord);
					session.setAttribute(PortalUtils.THEME_SESSION_ATTRIBUTE_NAME, super.getTheme());
					
					session.setAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL,(List) channelResultMap.get("channelList"));
					session.setAttribute(SysConstant.SESSION_KEY_PORTAL_TYPE, propertiesUtils.getMessage(SysConstant.APPDESC));
					session.setAttribute(SysConstant.SERVER_NAME,getSerName());
					session.setAttribute(SysConstant.SESSION_KEY_MENU_LIST, menuResultMap.get("menuList"));
					session.setAttribute(SysConstant.SESSION_KEY_MENU_AUTH_URL_LIST, EhcacheUtil.getAuthUrlInMenuList(menuResultMap.get("menuList")));
					session.setAttribute(SysConstant.SERVER_IP,HttpUtils.getSimplifyHostIpAddress());
					
					RedisUtil.set((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),sessionStaff.getStaffId(),session.getId());
					//对登录成功用户名进行加密储存至cookie
					staffCode = new Date().toString() + "_" + staffCode;
					String desStaffCode = CryptoUtils.desEdeEncryptToHex(staffCode, keyBytes);
					ServletUtils.addCookie(response, "/", ServletUtils.ONE_WEEK_SECONDS, desKey, desStaffCode);
					if(padFlag.equals("1")||padFlag.equals("2")){				
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
			SessionStaff sessionStaff = (SessionStaff) ServletUtils
			.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
			RedisUtil.remove((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),sessionStaff.getStaffId());
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
		String padVersions=MapUtils.getString(paramMap, "padVersions", "0");
		if(padVersions.equals("1")){
			paramMap.put("platformCode", SysConstant.SM_PADPLATFORM_CODE);
		}else{
			paramMap.put("platformCode", SysConstant.SM_PADPLATFORM_ANDROID_CODE);
		}
		Map<String, Object> map = null;
		try {
			SessionStaff staffSession= new SessionStaff();
			staffSession.setCurrentAreaId(MapUtils.getString(paramMap, "staffProvCode", ""));
			String flag=MapUtils.getString(paramMap, "flag", "");
			String ip=MapUtils.getString(paramMap, "lanIp", "");
			if (StringUtils.isNotEmpty(ip)) {
				paramMap.put("wanIp", ip);
			}	
			paramMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
			map = staffBmo.loginCheck(paramMap, flowNum, staffSession);
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)) {
				if (StringUtils.isNotEmpty(ip)) {
					map.put("ip", ip);
				}
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
				request.getSession().setAttribute("padLogin_area", staffProvCode);
				request.getSession().setAttribute("appLogin_area", staffProvCode);
				if(flag.equals("1")){//新版客户端
					request.getSession().setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "2");
				}else{
					request.getSession().setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "1");
				}
				request.getSession().setAttribute(SysConstant.SESSION_KEY_PADVERSION_FLAG, padVersions);
				String smsPassFlag = MapUtils.getString(map, "smsPassFlag", "Y");
				String msgCodeFlag = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_CODE_FLAG);
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
	
	/**
	 * 手机客户端登录
	 * @param paramMap
	 * @param request
	 * @param flowNum
	 * @return JsonResponse
	 * @throws PortalCheckedException
	 */
	@RequestMapping(value = "/login/applogindo",method = RequestMethod.POST)
	@LogOperatorAnn(switchs = Switch.OFF)
	@ResponseBody
	public JsonResponse applogindo(@Valid @RequestBody Map<String, Object> paramMap,
			HttpServletRequest request, HttpServletResponse response, 
			@LogOperatorAnn String flowNum,String loginValid)
			throws PortalCheckedException {
		paramMap.put("platformCode", SysConstant.SM_APPPLATFORM_CODE);
		Map<String, Object> map = null;
		try {
			SessionStaff staffSession= new SessionStaff();
			staffSession.setCurrentAreaId(MapUtils.getString(paramMap, "staffProvCode", ""));
			String ip = "";
			try {
				ip = ServletUtils.getIpAddr(request);
			} catch (Exception e) {
				log.error("门户/staff/login/applogindo服务获取ip异常", e);
			}
			//获取app登录标识app_login_flag, o:打头 说明是公网登录    i:打头 说明是内网登录
			Properties properties = MySimulateData.getProperties("/portal/portal.properties");
			String app_login_flag = properties.getProperty(SysConstant.APP_LOGIN_FLAG);
			paramMap.put("wanIp", app_login_flag+ip);
			paramMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
			map = staffBmo.loginCheck(paramMap, flowNum, staffSession);
			map.put("ifSend", paramMap.get("ifSend"));  //是否发送短信
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)) {
				map.put("macAddr", paramMap.get("macAddr"));
				map.put("phoneModel", paramMap.get("phoneModel"));
				request.getSession().setAttribute(SESSION_KEY_TEMP_LOGIN_STAFF, map);
				request.getSession().setAttribute(SysConstant.SESSION_KEY_APP_FLAG, "1");   //表示手机登陆		
				String smsPassFlag = MapUtils.getString(map, "smsPassFlag", "Y");
				String msgCodeFlag = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_CODE_FLAG);
				String msgnumber = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_NUMBERS);
				Map<String, Object> resMap = new HashMap<String, Object>();
				resMap.put("staff", map);
				
				//如果全局开关设定为不发送，或者员工信息表明不发送，或者当前是重新登录不发送短信
				if ("1".equals(msgCodeFlag) || "N".equals(smsPassFlag) || "N".equals(loginValid)) {
					resMap.put("ifSend", "N");
					return super.successed(resMap);
				}else{
					//发送短信验证码
					Map<String, Object> msgMap = sendMsg(request, flowNum);
					if (ResultCode.R_FAILURE.equals(msgMap.get("resultCode"))) {
						return super.failed(msgMap.get("resultMsg"), 3); //如果发送短信异常
					}
					resMap.put("ifSend", "Y");
					resMap.put("msgnumber", msgnumber);
					//发送4位验证码
					if("5590".equals(msgnumber)){
						resMap.put("randomCode", request.getSession().getAttribute(SysConstant.SESSION_KEY_LOGIN_RANDONCODE));
					}else if("5011".equals(msgnumber)){
						resMap.put("randomCode", request.getSession().getAttribute(SysConstant.SESSION_KEY_LOGIN_SMS));
					}
					return super.successed(resMap);
				}
			}else{
				String message = (String) map.get("resultMsg");
				return super.failed(message,-1);
			}
		} catch (Exception e) {
			log.error("门户/staff/login/loginValid方法异常", e);
			return super.failed(ErrorCode.STAFF_LOGIN, e, paramMap);
		}
	}
	
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
		//update by yuansq 增加会话id
		String sessionId=request.getSession().getId();
		String staffCode = staff.getStaffCode();
		String password = staff.getPassword();
		String staffProvCode = staff.getStaffProvCode();
		String loginAreaName = staff.getLoginAreaName();
		//update by huangjj3 为了防止同一个浏览器登录了不同工号
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		if (staffCode !=null && sessionStaff !=null && !("tokenLogin".equals(sessionStaff.getLogintype())) && sessionStaff.getStaffCode()!=null &&  !staffCode.toUpperCase().equals(sessionStaff.getStaffCode().toUpperCase())) {
			Map<String, Object> failData = new HashMap<String, Object>();
			failData.put("message", "您好，您已登录了工号"+sessionStaff.getStaffCode()+"，请先登出工号"+sessionStaff.getStaffCode()+"再登录，谢谢！");
			JsonResponse jsonResponse = super.failed(failData, ResultConstant.DATA_NOT_VALID_FAILTURE.getCode());
			return jsonResponse;
		}
		
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("staffCode", staffCode);
		dataBusMap.put("password", password);
		dataBusMap.put("staffProvCode", staffProvCode);
		dataBusMap.put("loginAreaName", loginAreaName);
		dataBusMap.put("platformCode", SysConstant.SM_PLATFORM_CODE);
		dataBusMap.put("sessionId", sessionId);
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
			SessionStaff staffSession= new SessionStaff();
			staffSession.setCurrentAreaId(staffProvCode);
			dataBusMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
			map = staffBmo.loginCheck(dataBusMap, flowNum, staffSession);
			// 调用返回服务调用结果code
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)) {
				List<Map<String, Object>> attrList = (List<Map<String, Object>>) MapUtils.getObject(map, "attrList", new ArrayList<Map<String, Object>>());
				boolean staffRealNameFlag = false;
				// 工号实名制校验
				if ("ON".equals(com.al.ecs.common.util.MDA.STAFF_AUTH_FLAG)) {
					for (Map<String, Object> attrMap : attrList) {
						if (SysConstant.STAFF_AUTH_ATTR_ID.equals(MapUtils.getString(attrMap, "ATTRID")) && SysConstant.STAFF_AUTH_ATTR_VAL_TRUE.equals(MapUtils.getString(attrMap, "ATTRVALUE"))) {
							staffRealNameFlag = true;
							break;
						}
					} 
					if (!staffRealNameFlag) {
						return super.failed("该工号未实名登记，不允许进行受理操作，请进行身份证实名登记！", Integer.parseInt(SysConstant.STAFF_AUTH_ATTR_VAL_FALSE));
					}
				}
				ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_KEY_IMAGE_CODE);
				if (StringUtils.isNotEmpty(ip)) {
					map.put("ip", ip);
				}
				map.put("password", password); 
				map.put("staffProvCode", staffProvCode);
				map.put("loginAreaName", loginAreaName);
				map.put("connectiontime", staff.getconnectiontime());
				map.put("sendtime", staff.getsendtime());
				map.put("waitingtime", staff.getwaitingtime());
				map.put("accepttime", staff.getaccepttime());
				map.put("macStr", staff.getMacStr());
				//浏览器指纹
				if(ServletUtils.getCookieValue(request, "FINGERPRINT")!=null){
					map.put("fingerPrint",ServletUtils.getCookieValue(request, "FINGERPRINT"));
				}else{
					String uuid = UUID.randomUUID().toString();
					ServletUtils.addCookie(response, "/", ServletUtils.ONE_DAY_SECONDS, "FINGERPRINT",uuid);
					map.put("fingerPrint",staff.getFingerprint()+":"+uuid);
				}
				//add by huangjj3 图片验证码不生效，session被注销从session中取不到图片验证码的生成信息，所以没有验证，现在登录成功后注销
				String dbKeyWord =  (String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
			    request.getSession().invalidate();
			   if(dbKeyWord !=null || !"".equals(dbKeyWord)){
			    	request.getSession().setAttribute(SysConstant.SESSION_DATASOURCE_KEY, dbKeyWord);
			    }
				request.getSession().setAttribute(SESSION_KEY_TEMP_LOGIN_STAFF, map);
				//存入并取出session中的TEMP_LOGIN_STAFF
//				Map<String, Object> mapSession = (Map<String, Object>) request
//						.getSession().getAttribute(SESSION_KEY_TEMP_LOGIN_STAFF);
				// 工号绑定手机号码判断
				//部分10000号上班无法使用手机，注释该判断
//				String bindNumber = MapUtils.getString(map, "bindNumber");
//				if (StringUtils.isBlank(bindNumber)) {
//					return super.failed("该工号未绑定手机号码", ResultConstant.FAILD.getCode());
//				} else if (!GenericValidator.matchRegexp(bindNumber, "^1\\d{10}$")) {
//					return super.failed("该工号绑定手机号码有误", ResultConstant.FAILD.getCode());
//				}
				//判断是否需要发送短信校验码
//				String retnStr = null;
				if ("N".equals(loginValid)) { 
//					retnStr = "登录成功!";
				} else {
					Map<String, Object> msgMap = sendMsg(request, flowNum); 
					if (ResultCode.R_FAILURE.equals(msgMap.get("resultCode"))) {
						//如果发送短信异常
						return super.failed(msgMap.get("resultMsg"), 3);
					}
//					retnStr = "短信校验码发送成功!";
				}
				//获取渠道信息
//				ServletUtils.addCookie(response, "/", ServletUtils.ONE_WEEK_SECONDS, "login_area_id", staffProvCode);
				request.getSession().setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "0");
				//往数据中填充
				String smsPassFlag = MapUtils.getString(map, "smsPassFlag", "Y");
				String msgCodeFlag = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_CODE_FLAG);
				String msgnumber = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_NUMBERS);
				Map<String, Object> successedData = new HashMap<String, Object>();
				//如果全局开关设定为不发送，或者员工信息表明不发送，或者当前是重新登录不发送短信
				if ("1".equals(msgCodeFlag) || "N".equals(smsPassFlag) || "N".equals(loginValid)) {
					successedData.put("data", "N");
					successedData.put("hintCode", map.get("hintCode"));
					return super.successed(successedData);
				}
				successedData.put("data", "Y");
				successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_RANDONCODE));
				successedData.put("msgnumber", msgnumber);
				return super.successed(successedData);
			}  else if(SysConstant.R_PW_SIMLE.equals(resultCode)||SysConstant.R_PW_UPDATE.equals(resultCode)){
				String tipMessage = "";
				if(SysConstant.R_PW_UPDATE.equals(resultCode)){
					tipMessage = "您已超过90天未修改密码，帐号已锁，请修改密码后解锁才能登录。";
				}else{
					tipMessage = "您的密码为初始密码，为了您的帐号安全，必须修改才能登录。请您修改密码！";
				}
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
				failData.put("staffId", MapUtils.getString(map, "staffId", ""));
				failData.put("message", MapUtils.getString(map, "resultMsg", "员工登录失败，未得到报错信息"));
				failData.put("tipMessage",tipMessage);
				JsonResponse jsonResponse = super.failed(failData, Integer.parseInt(resultCode));
				return jsonResponse;
				
			}else {
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
	@LogOperatorAnn(desc = "短信校验码重新发送", code = "LOGIN", level = LevelLog.DB)
	@ResponseBody
	public JsonResponse reSend(@RequestParam Map<String, Object> paramMap,HttpServletRequest request, @LogOperatorAnn String flowNum) {
		try {
			Long sessionTimeL = (Long) request.
					getSession().getAttribute(SysConstant.SESSION_KEY_TEMP_SMS_TIME);
			if (sessionTimeL != null) {
				long sessionTime = sessionTimeL;
				long nowTime = (new Date()).getTime();
				long inteval = 28 * 1000;//比30秒提前2秒
				int smsErrorCount = Integer.parseInt((String) paramMap.get("smsErrorCount"));
				if (nowTime - sessionTime > inteval || smsErrorCount>=3) {
					
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
		Map<String, Object> successedData = new HashMap<String, Object>();
		successedData.put("data", "短信验证码发送成功!");
		//successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS));
		successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_RANDONCODE));
		return super.successed(successedData, ResultConstant.SUCCESS.getCode());
	}
	@RequestMapping(value = "/login/changeUimCheck" ,method = RequestMethod.GET)
	@LogOperatorAnn(desc = "补换卡短信校验码验证", code = "CHANGEUIM", level = LevelLog.DB)
	@ResponseBody
	public JsonResponse changeUimMsgSend(@RequestParam Map<String, Object> paramMap,HttpServletRequest request, @LogOperatorAnn String flowNum) {
		try {
			String munber = (String) paramMap.get("munber");
			String areaId = (String) paramMap.get("areaId");
			String isSecond = (String) paramMap.get("isSecond");
			String flag = (String) paramMap.get("flag");
			request.getSession().setAttribute(SESSION_CHANGEUIM_SMS_MUNBER, munber);
			request.getSession().setAttribute(SESSION_CHANGEUIM_SMS_AREAID, areaId);
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			String operatSpecCd = SysConstant.CHANGEUIMSMS_CODE;
			if(flag.equals("actionFlag")){
				operatSpecCd = SysConstant.HKDDDXYZ_CODE;
			}
			String changeUimMsgValid  = staffBmo.checkOperatSpec(operatSpecCd, sessionStaff);
			//当前工号无免补换卡短信验证权限!
			if("0".equals(changeUimMsgValid)||SysConstant.STR_Y.equals(isSecond)){
				//短信发送时间间隔,10秒内重复发送，会被拦截！
				Long sessionTimeL = (Long) request.getSession().getAttribute(SysConstant.SESSION_KEY_TEMP_CHANGEUIM_SMS_TIME);
				if (sessionTimeL != null) {
					long sessionTime = sessionTimeL;
					long nowTime = (new Date()).getTime();
					long inteval = 10 * 1000;//间隔10秒
					if (nowTime - sessionTime > inteval ) {		
						Map<String, Object> msgMap = changeUimSendMsg(request, flowNum); 
						if (ResultCode.R_FAILURE.equals(msgMap.get("resultCode"))|msgMap.size()==0|msgMap==null) {
							//如果发送短信异常
							return super.failed(msgMap.get("resultMsg"), 3);
						}
					}else{
						return super.successed("验证码发送中，请稍后再操作进行验证！", 1003);
					}
				}else{
					Map<String, Object> msgMap = changeUimSendMsg(request, flowNum); 
					if (ResultCode.R_FAILURE.equals(msgMap.get("resultCode"))|msgMap.size()==0|msgMap==null) {
						//如果发送短信异常
						return super.failed(msgMap.get("resultMsg"), 3);
					}
				}
			}else{
				//该工号有免补换卡短信验证权限!
				return super.successed("该工号有免补换卡短信验证权限!", 1002);
			}		
		} catch (BusinessException be) {
			this.log.error("错误信息:{}", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, new HashMap<String, Object>(), ErrorCode.CHANGEUIM_MSG_SEND);
		} catch (Exception e) {			
			log.error("门户登录/staff//login/ChangUimSend方法异常", e);
			return super.failed(ErrorCode.CHANGEUIM_MSG_SEND, e, new HashMap<String, Object>());
		}
		Map<String, Object> successedData = new HashMap<String, Object>();
		successedData.put("data", "短信验证码发送成功!");
		//successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS));
		successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CHANGEUIM_RANDONCODE));
		return super.successed(successedData, ResultConstant.SUCCESS.getCode());
	}
	
	@RequestMapping(value = "/login/changeUimReSend", method = RequestMethod.GET)
	@LogOperatorAnn(desc = "补换卡短信校验码重新发送", code = "CHANGEUIM", level = LevelLog.DB)
	@ResponseBody
	public JsonResponse changeUimMsgReSend(@RequestParam Map<String, Object> paramMap,HttpServletRequest request, @LogOperatorAnn String flowNum) {
		try {
			String number = (String)paramMap.get("munber");
			String checkNumber = (String)request.getSession().getAttribute("checkNumber");
			List<Map> accNbrInfos = (List<Map>)request.getSession().getAttribute("accNbrInfos");
			List<String> checkList = new ArrayList<String>();
			if(accNbrInfos != null && accNbrInfos.size() > 0){
				for(int i=0;i<accNbrInfos.size();i++){
					String numberC = (String) ((Map)accNbrInfos.get(i)).get("accNbr");
					checkList.add(numberC);
					
				}
			}
			if((number != null && number.equals(checkNumber))||(checkList != null && checkList.contains(number))){
				
				Long sessionTimeL = (Long) request.
						getSession().getAttribute(SysConstant.SESSION_KEY_TEMP_CHANGEUIM_SMS_TIME);
				if (sessionTimeL == null) {
					request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_CHANGEUIM_SMS_TIME, (new Date()).getTime());
					sessionTimeL = 0L;
				}
				long sessionTime = sessionTimeL;
				long nowTime = (new Date()).getTime();
				long inteval = 28 * 1000;//比30秒提前2秒
				int smsErrorCount = MapUtils.getIntValue(paramMap, "smsErrorCount", 0);
				if (nowTime - sessionTime > inteval || smsErrorCount >= 3) {
					changeUimSendMsg(request, flowNum);
				} else {
					log.debug("time inteval:{}", nowTime - sessionTime);
					return super.failed("短信验证码发送时间有误!请求太过频烦,请稍后再重发！",
							ResultConstant.ACCESS_LIMIT_FAILTURE.getCode());
				}
			}else{
				return super.failed("参数被非法篡改!", ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException be) {
			this.log.error("错误信息:{}", be);
			return super.failed(be);
		} catch (Exception e) {			
			log.error("门户补换卡短信验证/staff/login/changeUimReSend方法异常", e);
			return super.failed(ErrorCode.CHANGEUIM_MSG_SEND, e, new HashMap<String, Object>());
		}
		Map<String, Object> successedData = new HashMap<String, Object>();
		successedData.put("data", "短信验证码发送成功!");
		//successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS));
		successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CHANGEUIM_RANDONCODE));
		return super.successed(successedData, ResultConstant.SUCCESS.getCode());
	}
	
	// 补换卡短信发送短信
	@SuppressWarnings("unchecked")
	public Map<String, Object> changeUimSendMsg(HttpServletRequest request, String flowNum)
			throws Exception {
		String munber = (String)request.getSession().getAttribute(SESSION_CHANGEUIM_SMS_MUNBER);
		String areaId = (String)request.getSession().getAttribute(SESSION_CHANGEUIM_SMS_AREAID);
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		String isSecond=request.getParameter("isSecond");
		String accNbr=request.getParameter("munber");
		Map<String, Object> retnMap = new HashMap<String, Object>();
		if(SysConstant.STR_Y.equals(isSecond)&&StringUtils.isNotBlank(accNbr)){
			munber = accNbr;
			areaId = sessionStaff.getCurrentAreaId();
		}else if(request.getSession().getAttribute(SESSION_CHANGEUIM_SMS_MUNBER) ==null){
			retnMap.put("resultCode",ResultCode.R_FAILURE );
			retnMap.put("resultMsg","短信验证号码获取失败，系统异常！请刷新重试!");
			return retnMap;
		}else if(request.getSession().getAttribute(SESSION_CHANGEUIM_SMS_AREAID) ==null){
			retnMap.put("resultCode",ResultCode.R_FAILURE );
			retnMap.put("resultMsg","短信验证号码所属地区获取失败，系统异常！请刷新重试!");
			return retnMap;
		}
		if(StringUtils.isBlank(munber)){
			retnMap.put("resultCode",ResultCode.R_FAILURE );
			retnMap.put("resultMsg","短信验证号码为空，系统异常！请刷新重试!");
			return retnMap;
		}
		if (sessionStaff != null) {
			String smsPwd = null;
			String randomCode =null;
			//发送4位验证码
			smsPwd = UIDGenerator.generateDigitNonce(4);
			randomCode = UIDGenerator.generateDigitNonce(2);
			for(;randomCode == ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CHANGEUIM_RANDONCODE);)
			{
				randomCode = UIDGenerator.generateDigitNonce(2);
			}
			this.log.debug("业务受理短信验证码：{}", smsPwd);
			Map<String, Object> msgMap = new HashMap<String, Object>();
			msgMap.put("phoneNumber", munber);
			msgMap.put("key", smsPwd);
			msgMap.put("MsgNumber", "5871");
			if(randomCode != null){
			msgMap.put("randomCode", randomCode);
			msgMap.put("message", propertiesUtils.getMessage(
					"CHANGEUIM_SMS_CODE_CONTENT", new Object[] { smsPwd,randomCode }));
			}else{
				msgMap.put("message", propertiesUtils.getMessage(
							"CHANGEUIM_SMS_CODE_CONTENT", new Object[] { smsPwd }));	
			}
			if(!"00".equals(areaId.substring(5))){
				areaId = areaId.substring(0, 5) + "00";
			}
			msgMap.put("areaId", areaId);
			msgMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
			retnMap = staffBmo.sendMsgInfo(msgMap, flowNum, sessionStaff);
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_CHANGEUIM_SMS);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_CHANGEUIM_SMS, smsPwd);
			request.getSession().setAttribute(SESSION_CUSTAUTH_SMS_MUNBER, munber);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_CHANGEUIM_RANDONCODE, randomCode);
			//短信发送时间间隔
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_TEMP_CHANGEUIM_SMS_TIME);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_CHANGEUIM_SMS_TIME, (new Date()).getTime());
		} else {
			this.log.error("错误信息:登录会话失效，请重新登录!");
		}
		return retnMap;
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/login/changeUimSmsValid", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse changeUimSmsValidate(@RequestParam("smspwd") String smsPwd,@RequestParam("number") String number,
			HttpServletRequest request ,HttpServletResponse response) throws Exception {
		this.log.debug("changeUimsmsPwd={}", smsPwd);
		//移除相关的session信息
		request.getSession().removeAttribute("dxState");
		String smsPwdSession = (String) ServletUtils.getSessionAttribute(
					request, SysConstant.SESSION_KEY_CHANGEUIM_SMS);
		// 对应的手机号
		String numberSession = (String) ServletUtils.getSessionAttribute(
					request, SESSION_CUSTAUTH_SMS_MUNBER);
		//如果不需要发送短信，验证码就为空，不提示短信过期失效
		if(StringUtil.isEmpty(smsPwdSession)){
			request.getSession().setAttribute("dxState", "N");
			request.getSession().setAttribute("JUMPRESULT", "N");
			return super.failed("短信过期失效，请重新发送!", ResultConstant.FAILD.getCode());
		}
		if (smsPwdSession.equals(smsPwd)&&numberSession.equals(number)) {
			Map<String,Object> resData=new HashMap<String,Object>();
			resData.put("msg", "短信验证成功.");
			//设置session返回是否成功的状态
			request.getSession().setAttribute("dxState", "Y");
			request.getSession().setAttribute("JUMPRESULT", "Y");
			request.getSession().removeAttribute("VALIDATERESULT");
			return super.successed(resData);
		}else {
			request.getSession().setAttribute("VALIDATERESULT","N");
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_CHANGEUIM_SMS);
			request.getSession().removeAttribute(SESSION_CUSTAUTH_SMS_MUNBER);
			request.getSession().setAttribute("dxState", "N");
			request.getSession().setAttribute("JUMPRESULT", "N");
			return super.failed("短信验证码错误!", ResultConstant.FAILD.getCode());
		}
		
	}
	

	// 短信发送
	@SuppressWarnings("unchecked")
	public Map<String, Object> sendMsg(HttpServletRequest request, String flowNum)
			throws Exception {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		Map<String, Object> mapSession = (Map<String, Object>) request.getSession().getAttribute(
				SESSION_KEY_TEMP_LOGIN_STAFF);

		if (mapSession != null) {
			String MSG_NUMBER  = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_NUMBERS);
			String smsPwd = null;
			String randomCode =null;
			//发送4位验证码
			if("5590".equals(MSG_NUMBER)){
				 smsPwd = UIDGenerator.generateDigitNonce(4);
				 randomCode = UIDGenerator.generateDigitNonce(2);
				if(randomCode == ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_RANDONCODE)){
				randomCode = UIDGenerator.generateDigitNonce(2);
				}
			}else if("5011".equals(MSG_NUMBER)){
				//发送6位验证码
				smsPwd = UIDGenerator.generateDigitNonce(6);
			}
			this.log.debug("短信验证码：{}", smsPwd);
			String smsPassFlag = MapUtils.getString(mapSession, "smsPassFlag", "Y");
			// 系统参数表中的是否发送校验短信标识，1不发送不验证， 其他发送并验证
			String msgCodeFlag = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_CODE_FLAG);

			if (!"1".equals(msgCodeFlag) && !"N".equals(smsPassFlag)) {
				SessionStaff sessionStaff = SessionStaff.setStaffInfoFromMap(mapSession);
				Map<String, Object> msgMap = new HashMap<String, Object>();
				msgMap.put("phoneNumber", mapSession.get("bindNumber"));
				msgMap.put("key", smsPwd);
				msgMap.put("MsgNumber", MSG_NUMBER);
				if(randomCode != null){
				msgMap.put("randomCode", randomCode);
				msgMap.put("message", propertiesUtils.getMessage(
						"SMS_CODE_CONTENT", new Object[] { smsPwd,randomCode }));
				}else{
					msgMap.put("message", propertiesUtils.getMessage(
							"SMS_CODE_CONTENT", new Object[] { smsPwd }));	
				}

				String areaId = sessionStaff.getAreaId();
				if(!"00".equals(areaId.substring(5))){
					areaId = areaId.substring(0, 5) + "00";
				}
				msgMap.put("areaId", areaId);
				msgMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
				retnMap = staffBmo.sendMsgInfo(msgMap, flowNum, sessionStaff);

		}

			request.getSession().removeAttribute(SysConstant.SESSION_KEY_LOGIN_SMS);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_LOGIN_SMS, smsPwd);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_LOGIN_RANDONCODE, randomCode);
			
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
	public JsonResponse smsValidate(@RequestParam("smspwd") String smsPwd,@LogOperatorAnn String flowNum,
			HttpServletRequest request ,HttpServletResponse response) throws Exception {
		this.log.debug("smsPwd={}", smsPwd);
		//手机版本使用
		Object appFlag = ServletUtils.getSessionAttribute(request,SysConstant.SESSION_KEY_APP_FLAG);
		// 系统参数表中的是否发送校验短信标识，1不发送不验证， 其他发送并验证
		String msgCodeFlag = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_CODE_FLAG);
		// 登陆后，服务层返回的认证后用户信息
		Map<String, Object> mapSession = (Map<String, Object>) ServletUtils.getSessionAttribute(request, SESSION_KEY_TEMP_LOGIN_STAFF);
		String smsPassFlag = MapUtils.getString(mapSession, "smsPassFlag", "Y");
		long l_start = Calendar.getInstance().getTimeInMillis();	
		// 验证码内容
		String smsPwdSession = (String) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS);
		//如果不需要发送短信，验证码就为空，不提示短信过期失效
		System.out.println("msgCode="+"主机ip="+HttpUtils.getSimplifyHostIpAddress()+"+随机数"+ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_RANDONCODE)+" + 短信内容" +smsPwdSession + " 客户端请求短信="+smsPwd);
		if(!("1".equals(msgCodeFlag) || "N".equals(smsPassFlag)) && StringUtil.isEmpty(smsPwdSession)){
			return super.failed("短信过期失效，请重新发送!", ResultConstant.FAILD.getCode());
		}
		ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS);
		if ("1".equals(msgCodeFlag) || "N".equals(smsPassFlag) || smsPwdSession.equals(smsPwd)) {
			SessionStaff sessionStaff = SessionStaff.setStaffInfoFromMap(mapSession);
			
			JsonResponse channelResp = queryChannel(sessionStaff, "", mapSession);
			//如果查询渠道失败
			if (!channelResp.isSuccessed()) {
				return channelResp;
			}
			Map<String, Object> channelResultMap = (Map<String, Object>) channelResp.getData();
			
			List channelList = (List) channelResultMap.get("channelList");
			for(int i=0;i<channelList.size();i++){
				Map<String, Object> map = (Map<String, Object>) channelList.get(i);
				String pic_ctrl = "";
				if(channelResultMap.get("areaId")!=null && channelResultMap.get("areaId").toString()!=""){
					String provinceID = channelResultMap.get("areaId").toString().substring(0, 3)+"0000";
					//获取实名制身份证图片读取开关pic_省份编码
					Properties properties = MySimulateData.getProperties("/portal/portal.properties");
					pic_ctrl = properties.getProperty("pic_"+provinceID);
				}
				map.put("pic_ctrl", pic_ctrl);
				channelList.set(i, map);
			}
			channelResultMap.put("channelList", channelList);
			String version=null;
            String padFlag=(String)ServletUtils.getSessionAttribute(
					request, SysConstant.SESSION_KEY_PAD_FLAG);
            String padVersion=(String)ServletUtils.getSessionAttribute(
					request, SysConstant.SESSION_KEY_PADVERSION_FLAG);
            if(appFlag!=null&&appFlag.equals("1")){
            	padFlag="3";//phone取菜单
            }
            if(padVersion!=null){//pad
            	version=padVersion;
            }else if(appFlag!=null&&appFlag.equals("1")){//phone-android
            	version="3";
            }
			JsonResponse menuResp = queryMenu(sessionStaff,padFlag);
			//如果查询菜单失败
			if (!menuResp.isSuccessed()) {
				return menuResp;
			}
			Map<String, Object> menuResultMap = (Map<String, Object>) menuResp.getData();
			
			// 换新sessionId ,让会话失效时间由sessin-config生效
			String dbKeyWord = (String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
			request.getSession().invalidate();
			HttpSession session=request.getSession(true);
			session.setAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
			session.setAttribute(MDA.SESSION_KEY_LOGIN_USER, sessionStaff);
			session.setAttribute(SysConstant.SESSION_DATASOURCE_KEY, dbKeyWord);
			session.setAttribute(PortalUtils.THEME_SESSION_ATTRIBUTE_NAME, super.getTheme());
			
			RedisUtil.set((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),sessionStaff.getStaffId(),session.getId());
			
			session.setAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL,(List) channelResultMap.get("channelList"));
			session.setAttribute(SysConstant.SESSION_KEY_PORTAL_TYPE, propertiesUtils.getMessage(SysConstant.APPDESC));
			
			session.setAttribute(SysConstant.SESSION_KEY_MENU_LIST, menuResultMap.get("menuList"));
			session.setAttribute(SysConstant.SESSION_KEY_MENU_AUTH_URL_LIST, EhcacheUtil.getAuthUrlInMenuList(menuResultMap.get("menuList")));
			
			session.setAttribute(SysConstant.SERVER_NAME,getSerName());
			session.setAttribute(SysConstant.SERVER_IP,HttpUtils.getSimplifyHostIpAddress());
			//对登录成功用户名进行加密储存至cookie
			String staffCode = sessionStaff.getStaffCode();
			staffCode = (new Date()).toString() + "_" + staffCode;
			String desStaffCode = CryptoUtils.desEdeEncryptToHex(staffCode, keyBytes);
			ServletUtils.addCookie(response, "/", ServletUtils.ONE_WEEK_SECONDS, desKey, desStaffCode);
			Map<String,Object> resData=new HashMap<String,Object>();
			if(padFlag!=null&&padFlag.equals("1")){				
				ServletUtils.addCookie(response,"/",ServletUtils.ONE_WEEK_SECONDS,SysConstant.SESSION_KEY_PAD_FLAG,"1");
				session.setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "1");
				List<Map<String,Object>> ll=(List<Map<String,Object>>)menuResultMap.get("menuList");
				//菜单过滤(工作支持中的服务台)
				if(ll!=null&&ll.size()>0){
					boolean find=false;
					for(int i=0;i<ll.size();i++){
						if(ll.get(i).get("childMenuResources")!=null){
							List<Map<String,Object>> l2=(List<Map<String,Object>>)ll.get(i).get("childMenuResources");
							for(int j=0;j<l2.size();j++){
								if(l2.get(j).get("menuPath").toString().indexOf("staffMgr/toitms")!=-1){
									l2.remove(j);
									find=true;
									break;
								}
							}
							if(find){
								if(l2.size()==0){
									ll.remove(i);
								}else{
									ll.get(i).put("childMenuResources", l2);
								}
								break;
							}
						}
					}
				}
				resData.put("menus", JsonUtil.toString(ll));
				resData.put("indexPage", "main/home");
			}else if(padFlag!=null&&padFlag.equals("2")){
				List<Map<String,Object>> ll=(List<Map<String,Object>>)menuResultMap.get("menuList");
				ServletUtils.addCookie(response,"/",ServletUtils.ONE_WEEK_SECONDS,SysConstant.SESSION_KEY_PAD_FLAG,"1");
				session.setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, padFlag);
				resData.put("menus", JsonUtil.toString(ll));
				resData.put("indexPage","pad/main/home");
			}else{
				ServletUtils.addCookie(response,"/",ServletUtils.ONE_WEEK_SECONDS,SysConstant.SESSION_KEY_PAD_FLAG,"0");
				session.setAttribute(SysConstant.SESSION_KEY_PAD_FLAG, "0");
			}
			//发短信
			if("ON".equals(com.al.ecs.common.util.MDA.MESSAGE_TAG.get("MESSAGE_FLAG"))){
				Calendar cal = Calendar.getInstance();
	            Map<String,Object> loginMsgMap = new HashMap<String,Object>();
	            String bindNumber = sessionStaff.getBindNumber();
	            String areaId = sessionStaff.getAreaId();
	            String nowTime = cal.get(Calendar.HOUR_OF_DAY)+"时"+cal.get(Calendar.MINUTE)+"分";
	            Object [] array = new Object[]{sessionStaff.getStaffCode(),nowTime};
	            loginMsgMap.put("phoneNumber", bindNumber);
	            loginMsgMap.put("MsgNumber", "5487");
	            loginMsgMap.put("key", "123");
	            loginMsgMap.put("areaId", areaId);
	            loginMsgMap.put("sendflag", "MessageTag");
	            loginMsgMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
	            String msg = MessageFormat.format(com.al.ecs.common.util.MDA.MESSAGE_TAG.get("LOGIN_SUCCESS"), array);
	            loginMsgMap.put("message", msg);
	            staffBmo.sendMsgInfo(loginMsgMap, flowNum, sessionStaff);
			}
			resData.put("msg", "短信验证成功.");
			resData.put("areaId", sessionStaff.getAreaId());
			//短信验证成功后记录短信验证码
			if("1".equals(msgCodeFlag)){
				sessionStaff.setMesKey("");
				}else{
				sessionStaff.setMesKey(smsPwdSession);	
				}
			String param= MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),"do_single_sign");
			boolean needSingleSign = 	BooleanUtils.toBoolean(param);
			if (needSingleSign) {//查看是否需要单点登录，配置项在simulate.property文件或者系统参数表中
				String token=UUID.randomUUID().toString();//生成唯一的uuid标记
				String areaId = sessionStaff.getAreaId();
				String Provinceid = sessionStaff.getAreaId().substring(0, 3)+"0000";
				addCookie(areaId,token,response,request);//保存本地cookie
				Map dataBusMap = new HashMap();
				dataBusMap.put("TOKEN", token);
				dataBusMap.put("STAFFID", sessionStaff.getStaffId());
				dataBusMap.put("STAFFCODE", sessionStaff.getStaffCode());
				dataBusMap.put("STAFFNAME", sessionStaff.getStaffName());
				dataBusMap.put("AREAID", sessionStaff.getAreaId());
				dataBusMap.put("AREACODE", sessionStaff.getAreaCode()!=""?sessionStaff.getAreaCode():"0");
				dataBusMap.put("AREANAME", sessionStaff.getCurrentAreaId());//暂时存放当前渠道的areadId
				dataBusMap.put("CITYNAME", sessionStaff.getCityName());
				dataBusMap.put("PROVINCENAME", "");
				dataBusMap.put("FLAG", "insert");
				singleSignAttr(sessionStaff,token,request);//保存单点登录session信息
				Map reportmap = new HashMap();
				reportmap.put("Token", token);
				reportmap.put("areaId", Provinceid);
				session.setAttribute(SysConstant.SESSION_KEY_REPORT_CHECK, reportmap);
				try {
					SessionStaff sessionStaffTmp=new SessionStaff();
					sessionStaffTmp.setAreaId(areaId);
					ServiceClient.callService(dataBusMap, PortalServiceCode.INSERT_LOGINSESSION, null, sessionStaffTmp);
					if(!"".equals(sessionStaff.getAreaId())){
						String setLoginCookie="setLoginCookie";
						String logout="logout";
						if(!CommonMethods.isOINet(request)){
							setLoginCookie+="O";
							logout+="O";
						}
						//设置省份url访问省份系统，设置用户单点登录标记
						String loginUrl=MySimulateData.getInstance().getNeeded((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),InterfaceClient.CHECK_LOGIN+"-"+ sessionStaff.getAreaId().substring(0, 3)+"0000", setLoginCookie);
						if(StringUtils.isNotBlank(loginUrl)){
//							resData.put("url",loginUrl);
							session.setAttribute("_loginUrl", loginUrl+"?token="+token+"&areaId="+areaId.substring(0, 3)+"0000");
						}
						//单点登录同步退出
						String logoutUrl=MySimulateData.getInstance().getNeeded((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),InterfaceClient.CHECK_LOGIN+"-"+ sessionStaff.getAreaId().substring(0, 3)+"0000", logout);
						if(StringUtils.isNotBlank(logoutUrl)){
							session.setAttribute("_logoutUrl", logoutUrl);
						}
					}
                } catch (Exception e) {
                    e.printStackTrace();
                }
				
				resData.put("token", token);
			} 
			long l_end = Calendar.getInstance().getTimeInMillis();
			staffBmo.loginInlog(l_end-l_start, null, sessionStaff,version);//登錄日誌bianxw
			log.debug("resData={}", JsonUtil.toString(resData));

			if("1".equals(appFlag)){ //手机登陆特殊处理
				resData.put("channelList", channelResultMap);
				resData.put("menuList", menuResultMap.get("menuList"));
				session.setAttribute(SysConstant.SESSION_KEY_APP_FLAG, appFlag);
				ServletUtils.addCookie(response,"/",ServletUtils.ONE_WEEK_SECONDS,SysConstant.SESSION_KEY_APP_FLAG,"1");
			}
			return super.successed(resData);
		} else if (smsPwdSession == null||mapSession==null) { // 已过期,需要重新校验登录
			return super.failed("短信过期失败!", ResultConstant.ACCESS_NOT_NORMAL.getCode());
		}else {
			//发短信
			if("ON".equals(com.al.ecs.common.util.MDA.MESSAGE_TAG.get("MESSAGE_FLAG"))){
				SessionStaff sessionStaff = SessionStaff.setStaffInfoFromMap(mapSession);
	            Calendar cal = Calendar.getInstance();
	            Map<String,Object> loginMsgMap = new HashMap<String,Object>();
	            String bindNumber = sessionStaff.getBindNumber();
	            String areaId = sessionStaff.getAreaId();
	            String staffCode = sessionStaff.getStaffCode();
	            String nowTime = cal.get(Calendar.HOUR_OF_DAY)+"时"+cal.get(Calendar.MINUTE)+"分";
	            Object [] array = new Object[]{staffCode,nowTime};
	            loginMsgMap.put("phoneNumber", bindNumber);
	            loginMsgMap.put("MsgNumber", "5487");
	            loginMsgMap.put("key", "123");
	            loginMsgMap.put("areaId", areaId);
	            loginMsgMap.put("sendflag", "MessageTag");
	            loginMsgMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
	            String msg = MessageFormat.format(com.al.ecs.common.util.MDA.MESSAGE_TAG.get("LOGIN_FAILED"), array);
	            loginMsgMap.put("message", msg);
	            staffBmo.sendMsgInfo(loginMsgMap, flowNum, sessionStaff);
			}
			return super.failed("短信验证码出错!", ResultConstant.FAILD.getCode());
		}
	}
	
	@RequestMapping(value = "/login/custAuthSmsSend", method = RequestMethod.GET)
	@LogOperatorAnn(desc = "客户鉴权短信校验码发送", code = "CHANGEUIM", level = LevelLog.DB)
	@ResponseBody
	public JsonResponse custAuthSmsSend(@RequestParam Map<String, Object> paramMap,HttpServletRequest request, @LogOperatorAnn String flowNum) {
		Map ret = new HashMap();
		try {
			Long sessionTimeL = (Long) request.
					getSession().getAttribute(SysConstant.SESSION_KEY_TEMP_CUSTAUTH_SMS_TIME);
			if (sessionTimeL != null) {
				long sessionTime = sessionTimeL;
				long nowTime = (new Date()).getTime();
				long inteval = 28 * 1000;//比30秒提前2秒
				String phoneNum = (String) paramMap.get("phoneNum");
				if (nowTime - sessionTime > inteval) {					
					ret = custAuthSmsSendMsg(request, flowNum,phoneNum);				
				} else {
					log.debug("time inteval:{}", nowTime - sessionTime);
					return super.failed("短信验证码发送时间有误!请求太过频烦,请稍后再重发！", 
							ResultConstant.ACCESS_LIMIT_FAILTURE.getCode());
				}
			} else {
				String phoneNum = (String) paramMap.get("phoneNum");
				ret = custAuthSmsSendMsg(request, flowNum,phoneNum);
			}		
		} catch (BusinessException be) {
			this.log.error("错误信息:{}", be);
			return super.failed(be);
		} catch (Exception e) {			
			log.error("门户补换卡短信验证/staff/login/custAuthSMSSend方法异常", e);
			return super.failed(ErrorCode.CHANGEUIM_MSG_SEND, e, new HashMap<String, Object>());
		}
		if ("0".equals(ret.get("resultCode"))){
			Map<String, Object> successedData = new HashMap<String, Object>();
			successedData.put("data", "短信验证码发送成功!");
			successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CUSTAUTH_RANDONCODE));
			return super.successed(successedData, ResultConstant.SUCCESS.getCode());			
		}else{
			return super.failed(ErrorCode.CHANGEUIM_MSG_SEND, ret, new HashMap<String, Object>());	
		}

	}	
	
	// 用户短信鉴权
	@SuppressWarnings("unchecked")
	public Map<String, Object> custAuthSmsSendMsg(HttpServletRequest request, String flowNum,String phoneNum)
			throws Exception {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);

		if (sessionStaff != null) {
			String smsPwd = null;
			String randomCode =null;
			//发送4位验证码
			smsPwd = UIDGenerator.generateDigitNonce(4);
			randomCode = UIDGenerator.generateDigitNonce(2);
			for(;randomCode == ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CHANGEUIM_RANDONCODE);)
			{
			randomCode = UIDGenerator.generateDigitNonce(2);
			}
			
			
			this.log.debug("用户短信鉴权验证码：{}", smsPwd);
			Map<String, Object> msgMap = new HashMap<String, Object>();
			msgMap.put("phoneNumber", phoneNum);
			msgMap.put("key", smsPwd);
			msgMap.put("MsgNumber", "5871");
			
			if(randomCode != null){
				msgMap.put("randomCode", randomCode);
				msgMap.put("message", propertiesUtils.getMessage(
				"CUSTAUTH_SMS_CODE_CONTENT", new Object[] { smsPwd,randomCode }));
			}else{
				msgMap.put("message", propertiesUtils.getMessage(
				"CUSTAUTH_SMS_CODE_CONTENT", new Object[] { smsPwd }));
			}

			msgMap.put("areaId", sessionStaff.getAreaId());
			msgMap.put(InterfaceClient.DATABUS_DBKEYWORD, (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_DATASOURCE_KEY));
			retnMap = staffBmo.sendMsgInfo(msgMap, flowNum, sessionStaff);
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_CUSTAUTH_SMS);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_CUSTAUTH_SMS, smsPwd);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_CUSTAUTH_RANDONCODE, randomCode);

			//短信发送时间间隔
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_TEMP_CUSTAUTH_SMS_TIME);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_CUSTAUTH_SMS_TIME, (new Date()).getTime());
		} else {
			this.log.error("错误信息:登录会话失效，请重新登录!");
		}
		return retnMap;
	}	
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/login/custAuthSmsValid", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse custAuthSmsValid(@RequestParam("smspwd") String smsPwd,
			HttpServletRequest request ,HttpServletResponse response) throws Exception {
		this.log.debug("changeUimsmsPwd={}", smsPwd);
		// 验证码内容
		String smsPwdSession = (String) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_CUSTAUTH_SMS);
		//如果不需要发送短信，验证码就为空，不提示短信过期失效
		if(StringUtil.isEmpty(smsPwdSession)){
			return super.failed("短信过期失效，请重新发送!", ResultConstant.FAILD.getCode());
		}
		if (smsPwdSession.equals(smsPwd)) {
			Map<String,Object> resData=new HashMap<String,Object>();
			resData.put("msg", "短信验证成功.");
			return super.successed(resData);
		}else {
			return super.failed("短信验证码错误!", ResultConstant.FAILD.getCode());
		}
	}		
	

	@RequestMapping(value = "/login/logout", method = RequestMethod.GET)
	@SessionValid
	public String logout(HttpSession session, HttpServletResponse response, HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		/*
		if (sessionStaff != null) {
			EhcacheUtil.evictByPrefixkey(ehCacheManager, sessionStaff
					.getStaffCode());
		}
		*/
		if (sessionStaff != null) {
			staffBmo.loginOutlog(null, sessionStaff);//登錄日誌bianxw
			RedisUtil.remove((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),sessionStaff.getStaffId());
		}
		String theme = PortalUtils.getTheme(super.getRequest(), super
				.getTheme());
		String dbKeyWord = (String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
		session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		session.removeAttribute(MDA.SESSION_KEY_LOGIN_USER);
		session.invalidate();
		
		themeResolver.setThemeName(super.getRequest(), response, theme);
		String url = "";
		try {
			String defaultDomain= propertiesUtils.getMessage("DEFAULTDOMAIN");
			String newDomain = propertiesUtils.getMessage("NEWDOMAIN");
			String domainNameONOFF = propertiesUtils.getMessage("DOMAINNAMEONOFF");
			String flag = MySimulateData.getInstance().getParam(dbKeyWord,"UNIFYLOGIN");
			if("ON".equals(domainNameONOFF) && "ON".equals(flag)){
				url = "https://"+newDomain+"/ltePortal/";
			}else if(!"ON".equals(domainNameONOFF) && "ON".equals(flag)){
				url = "https://"+defaultDomain+"/ltePortal/";
			}else{
				url = "/staff/login/page";
			}
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InterfaceException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return super.redirect(url);
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
				String sessionId = (String)RedisUtil.get((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),sessionStaff.getStaffId());
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
	
	@RequestMapping(value = "/logout", method = {RequestMethod.POST,RequestMethod.GET})
	@ResponseBody
	public Object logoutService(HttpSession session,HttpServletResponse response,HttpServletRequest request){
	    SessionStaff sessionStaff = (SessionStaff) ServletUtils
                .getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_LOGIN_STAFF);
        try {//……
        	if(sessionStaff != null){
        		staffBmo.loginOutlog(null, sessionStaff);//登錄日誌bianxw
        	}
        } catch (Exception e) {
            e.printStackTrace();
        }
        Map<String,Object> map=new HashMap<String,Object>();
        try {
        	String dbKeyWord = (String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY);
        	session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
        	session.invalidate();
        	if(sessionStaff != null){
        		RedisUtil.remove(dbKeyWord,sessionStaff.getStaffId());
        	}
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
		} catch (Exception e) {
			e.printStackTrace();
			map.put("resultCode", "1");
			map.put("resultMsg", "登录会话注销异常："+e.getMessage());
		}
		return  JsonUtil.toString(map);
	}
	/**
	 * 设置登录cookie
	 * @param request
	 * @param response
	 */
	@RequestMapping(value = "/login/setLoginCookie", method = {RequestMethod.POST,RequestMethod.GET})
	@ResponseBody
	public void setLoginCookie(  HttpServletRequest request,HttpServletResponse response) {
		HttpSession session = request.getSession();
		session.removeAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
    	session.invalidate();
		String areaId=request.getParameter("areaId");
		String token=request.getParameter("token");
		Map<String,Object> map=new HashMap<String,Object>();
		if(areaId.endsWith("0000") && areaId.length()==7){
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
		}else{
			map.put("resultCode", "1");
			map.put("resultMsg", "Cookie设置失败！areaId参数不正确！");
			map.put("errorCode", "1101");
			map.put("errorStack", "");
		}
		try {
			response.setContentType("text/html;charset=utf-8");
			response.getWriter().println(JsonUtil.toString(map));
			response.getWriter().close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
//		return JsonUtil.toString(map);
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
		BufferedReader reader = null;
		String line;
        StringBuffer json = new StringBuffer();
		try {
			reader = request.getReader();
			while((line = reader.readLine()) != null) {
			    json.append(line);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String xmlStr = json.toString();
		String TransactionID=xmlStr.substring(xmlStr.indexOf("<TransactionID>")+"<TransactionID>".length(), xmlStr.lastIndexOf("</TransactionID>"));
		String token=xmlStr.substring(xmlStr.indexOf("<TOKEN>")+"<TOKEN>".length(), xmlStr.lastIndexOf("</TOKEN>"));
		String SrcOrgID=xmlStr.substring(xmlStr.indexOf("<SrcOrgID>")+"<SrcOrgID>".length(), xmlStr.lastIndexOf("</SrcOrgID>"));
		String areaId=CommonMethods.provIdToProvAreaId(SrcOrgID);
		SessionStaff sessionStaff=new SessionStaff();
		sessionStaff.setAreaId(areaId);
//		String token=request.getParameter("token");
		Map<String,Object> map=new HashMap<String,Object>();
		Calendar calendar = Calendar.getInstance();
		StringBuffer xml=new StringBuffer();
		xml.append("<ContractRoot>");
		xml.append("<TcpCont>");
		xml.append("<TransactionID>"+TransactionID+"</TransactionID>");
		xml.append("<ActionCode>1</ActionCode>");
		xml.append("<RspTime>"+DateUtil.getFormatTimeString(calendar.getTime(), "yyyyMMddHHmmss")+"</RspTime>");
		xml.append("<Response>");
		xml.append("<RspType>0</RspType>");
		xml.append("<RspCode>0000</RspCode>");
		xml.append("<RspDesc>成功</RspDesc>");
		xml.append("</Response>");
		xml.append("</TcpCont>");
		xml.append("<SvcCont>");
		xml.append("<SOO type=\"CHECK_LOGIN_INFO_RES_TYPE\">");
		if(StringUtils.isNotBlank(token)){
//			Object val=MySessionInterceptor.checkToken(token);
			Map dataBusMap = new HashMap();
			dataBusMap.put("FLAG", "select");
			dataBusMap.put("TOKEN", token);
			DataBus db =ServiceClient.callService(dataBusMap, PortalServiceCode.INSERT_LOGINSESSION, null, sessionStaff);
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> retMap=db.getReturnlmap();
				if(!retMap.isEmpty()){
					Map<String, Object> returnMap=new HashMap<String, Object>();
					if(retMap.get("rList") instanceof List){
						if(((List<Map<String, Object>>)retMap.get("rList")).size()>0){
							returnMap=((List<Map<String, Object>>)retMap.get("rList")).get(0);
						}
					}
					if(!returnMap.isEmpty()){
						xml.append("<PUB_RES>");
						xml.append("<SOO_ID>1</SOO_ID>");
						xml.append("<RspType>0</RspType>");
						xml.append("<RspCode>0000</RspCode>");
						xml.append("<RspDesc>成功</RspDesc>");
						xml.append("</PUB_RES>");
						xml.append("<STAFF_LOGIN_INFO>");
						xml.append("<SYSTEM_USER_CODE>"+MapUtils.getString(returnMap, "STAFFCODE", "")+"</SYSTEM_USER_CODE>");
						xml.append("<SALES_CODE></SALES_CODE>");
						xml.append("<STAFF_NAME>"+MapUtils.getString(returnMap, "STAFFNAME", "")+"</STAFF_NAME>");
						xml.append("<COMMON_REGION_ID>"+MapUtils.getString(returnMap, "AREANAME", "")+"</COMMON_REGION_ID>");
						xml.append("<AREAID>"+MapUtils.getString(returnMap, "AREAID", "")+"</AREAID>");
						xml.append("<AREACODE>"+MapUtils.getString(returnMap, "AREACODE", "")+"</AREACODE>");
						xml.append("<CITYNAME>"+MapUtils.getString(returnMap, "CITYNAME", "")+"</CITYNAME>");
						xml.append("<PROVINCENAME>"+MapUtils.getString(returnMap, "PROVINCENAME", "")+"</PROVINCENAME>");
						xml.append("</STAFF_LOGIN_INFO>");
						
						map.put("resultCode", "0");
						map.put("resultMsg", "验证成功");
						Map<String,String> resultmap=new HashMap<String ,String>();
						resultmap.put("staffCode",MapUtils.getString(returnMap, "STAFFCODE", ""));
						resultmap.put("staffName",MapUtils.getString(returnMap, "STAFFNAME", ""));
						resultmap.put("areaId", MapUtils.getString(returnMap, "AREAID", ""));
						resultmap.put("areaCode", MapUtils.getString(returnMap, "AREACODE", ""));
						resultmap.put("areaName", MapUtils.getString(returnMap, "AREANAME", ""));
						resultmap.put("cityName", MapUtils.getString(returnMap, "CITYNAME", ""));
						resultmap.put("provinceName", MapUtils.getString(returnMap, "PROVINCENAME", ""));
						map.put("result", resultmap);
					}else{
						xml.append("<PUB_RES>");
						xml.append("<SOO_ID>1</SOO_ID>");
						xml.append("<RspType>1</RspType>");
						xml.append("<RspCode>1089</RspCode>");
						xml.append("<RspDesc>验证失败！没有检查到给定的token</RspDesc>");
						xml.append("</PUB_RES>");
						
						map.put("resultCode", "-1");
						map.put("resultMsg", "验证失败！没有检查到给定的token");
						map.put("errorCode", "1101");
					}
				}else{
					xml.append("<PUB_RES>");
					xml.append("<SOO_ID>1</SOO_ID>");
					xml.append("<RspType>1</RspType>");
					xml.append("<RspCode>1089</RspCode>");
					xml.append("<RspDesc>验证失败！没有检查到给定的token</RspDesc>");
					xml.append("</PUB_RES>");
					
					map.put("resultCode", "-1");
					map.put("resultMsg", "验证失败！没有检查到给定的token");
					map.put("errorCode", "1101");
				}
			}else{
				xml.append("<PUB_RES>");
				xml.append("<SOO_ID>1</SOO_ID>");
				xml.append("<RspType>1</RspType>");
				xml.append("<RspCode>1089</RspCode>");
				xml.append("<RspDesc>"+db.getResultMsg()+"</RspDesc>");
				xml.append("</PUB_RES>");
				
				map.put("resultCode", "-1");
				map.put("resultMsg", db.getResultMsg());
				map.put("errorCode", "1101");
			}
		}else{
			xml.append("<PUB_RES>");
			xml.append("<SOO_ID>1</SOO_ID>");
			xml.append("<RspType>1</RspType>");
			xml.append("<RspCode>1089</RspCode>");
			xml.append("<RspDesc>验证失败！参数token为空！</RspDesc>");
			xml.append("</PUB_RES>");
			
			map.put("resultCode", "-1");
			map.put("resultMsg", "验证失败！参数token为空！");
			map.put("errorCode", "1101");
		}
		xml.append("</SOO>");
		xml.append("</SvcCont>");
		xml.append("</ContractRoot>");
//		xml.toString().replaceAll("\"", "");
		Map dataBusMap = new HashMap();
		dataBusMap.put("token", token);
		dataBusMap.put("inparam", xmlStr);
		dataBusMap.put("outparam", xml);
		dataBusMap.put("lteflag", "true");
		DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SIGLE_SIGN_CHECK_LOGIN, null, sessionStaff);
		return xml.toString();
	}
	
	/**
	 * 报表验证登录
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/login/checkReportStaff",  method = {RequestMethod.POST,RequestMethod.GET})
	@ResponseBody
	public Object checkReportStaff(HttpServletRequest request,HttpServletResponse response) {
		String token = request.getParameter("Token");
		String staffId = request.getParameter("staffId");
		Map<String,Object> map=new HashMap<String,Object>();
		if(StringUtils.isNotBlank(token)){
			Map dataBusMap = new HashMap();
			dataBusMap.put("FLAG", "report");
			dataBusMap.put("TOKEN", token);
			dataBusMap.put("STAFFID", staffId);
			DataBus db =ServiceClient.callService(dataBusMap, PortalServiceCode.INSERT_LOGINSESSION, null, null);
			if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> retMap=db.getReturnlmap();
				if(((List<Map<String, Object>>)retMap.get("rList")).size()>0){
					map.put("resultCode", "0");
					map.put("resultMsg", "验证成功");
				}else{
					map.put("resultCode", "1");
					map.put("resultMsg", "验证失败！没有检查到给定的token");
				}
			}else{
				map.put("resultCode", "1");
				map.put("resultMsg", db.getResultMsg());
			}
		}else{
			map.put("resultCode", "1");
			map.put("resultMsg", "验证失败！参数token为空！");
		}
		return map;
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
	
	
	private JsonResponse queryChannel(SessionStaff sessionStaff, String currentChannelId, Map<String, Object> mapSession) {
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
			if(channelResultMap != null && ResultCode.R_SUCC.equals(channelResultMap.get("code"))){
				SessionStaff.setChannelInfoFromMap(sessionStaff, channelResultMap, mapSession);
				String isStrBusi = "";
				if(channelResultMap.get("isStrBusi")!=null && channelResultMap.get("isStrBusi").toString()!=""){
					isStrBusi = channelResultMap.get("isStrBusi").toString();
				}
				sessionStaff.setIsStrBusi(isStrBusi);
			}else{
				return super.failed(channelResultMap, ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (InterfaceException ie) {

			return super.failed(ie, channelParamMap, ErrorCode.QUERY_CHANNEL);
		} catch (Exception e) {
			log.error("门户/staff/login/queryChannel方法异常", e);
			return super.failed(ErrorCode.QUERY_CHANNEL, e, channelParamMap);
		}
		
		return super.successed(channelResultMap);
	}
	
	private JsonResponse queryMenu(SessionStaff sessionStaff,String padFlag) {
		Map<String,Object> resultMap = new HashMap<String,Object>();
		Map<String,Object> paramMap = new HashMap<String,Object>();
		paramMap.put("staffId", sessionStaff.getStaffId());
		if(padFlag!=null&&padFlag.equals("2")){
			paramMap.put("platformCode", SysConstant.SM_PADPLATFORM_CODE);
		}else if(padFlag!=null&&padFlag.equals("3")){
			if("20".equals(sessionStaff.getIsStrBusi())){
				paramMap.put("platformCode", SysConstant.SM_AGENT_PLATFORM_CODE);
			}else paramMap.put("platformCode", SysConstant.SM_APPPLATFORM_CODE);
		}else{
			paramMap.put("platformCode", SysConstant.SM_PLATFORM_CODE);//旧：dataBusMap.put("systemPlatformId", 1);
		}
//		paramMap.put("platformCode", SysConstant.SM_PLATFORM_CODE);
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
		try{
            result = "服务器IP：" + HttpUtils.getHostIpAddress() + ",机器名："+HttpUtils.getHostName()+",";
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

	/**
     * 员工修改/重置密码
     * @param param 
     * @return
     */
	@RequestMapping(value = "/staffPwd", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse staffPwd(@RequestBody Map<String, Object> param, HttpServletResponse response, @LogOperatorAnn String flowNum){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		try{			
			param.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
			Map<String, Object> resultMap = staffBmo.updateStaffPwd(param, flowNum, sessionStaff);
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
	
	@Autowired
	@Resource(name = "com.al.lte.portal.bmo.crm.SignBmo")
    private SignBmo signBmo;
    /**
	 * 获取回执信息给省份
	 * @param request
	 * @param response
	 */
	@RequestMapping(value = "/getVoucherToPrv", method = {RequestMethod.POST,RequestMethod.GET})
	@ResponseBody
	public Object getVoucherToPrv(HttpServletRequest request,HttpServletResponse response) {
		String custOrderId=request.getParameter("CUST_ORDER_ID");
		String areaId=request.getParameter("areaId");
		String lanId=request.getParameter("LAN_ID");
		String token=request.getParameter("token");
		Map<String, Object> paramMap = new HashMap<String, Object>();
		Map<String,Object> map=new HashMap<String,Object>();
		try {
			if(StringUtils.isNotBlank(areaId)&&StringUtils.isNotBlank(token)){
				Map dataBusMap = new HashMap();
				dataBusMap.put("FLAG", "select");
				dataBusMap.put("TOKEN", token);
				SessionStaff sessionStaffTmp=new SessionStaff();
				sessionStaffTmp.setAreaId(areaId);
				DataBus db =ServiceClient.callService(dataBusMap, PortalServiceCode.INSERT_LOGINSESSION, null, sessionStaffTmp);
				if (ResultCode.R_SUCCESS.equals(StringUtils.defaultString(db.getResultCode()))) {
					Map<String, Object> retMap=db.getReturnlmap();
					if(!retMap.isEmpty()){
						Map<String, Object> returnMap=new HashMap<String, Object>();
						if(retMap.get("rList") instanceof List){
							if(((List<Map<String, Object>>)retMap.get("rList")).size()>0){
								returnMap=((List<Map<String, Object>>)retMap.get("rList")).get(0);
							}
						}
						if(!returnMap.isEmpty()){
							SessionStaff sessionStaff=new SessionStaff();
							sessionStaff.setAreaCode(MapUtils.getString(returnMap, "AREACODE", ""));
							sessionStaff.setAreaId(MapUtils.getString(returnMap, "AREAID", ""));
							sessionStaff.setStaffCode(MapUtils.getString(returnMap, "STAFFCODE", ""));
							sessionStaff.setStaffName(MapUtils.getString(returnMap, "STAFFNAME", ""));
							sessionStaff.setCurrentAreaId(MapUtils.getString(returnMap, "AREANAME", ""));
							
							paramMap.put("olId", custOrderId);
							paramMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
							Map<String, Object> resultMap = signBmo.querySignInfo(paramMap, "",sessionStaff);
							if (resultMap!=null&& ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
								Integer offerId=MapUtils.getInteger(resultMap, "SERVICE_OFFER_ID", 0);
								map.put("resultCode", "0");
								map.put("resultMsg", "成功");
								Map<String, Object> result=new HashMap<String, Object>(); 
								result.put("orderInfo", resultMap.get("orderInfo"));
								result.put("type", "0");
								result.put("CUST_NAME", resultMap.get("CUST_NAME"));
								result.put("CERT_TYPE", resultMap.get("CERT_TYPE"));
								result.put("CERT_NUMBER", resultMap.get("CERT_NUMBER"));
								if(SysConstant.itemType.length>offerId){
									result.put("SERVICE_OFFER_ID", SysConstant.itemType[offerId]);
								}else{
									result.put("SERVICE_OFFER_ID", "");
								}
								result.put("ACC_NBR", resultMap.get("ACCNBR")!=null?resultMap.get("ACCNBR"):"");
								result.put("CHANNEL_NBR", resultMap.get("CHANNEL_NBR"));
								result.put("REMARK", resultMap.get("REMARK")!=null?resultMap.get("REMARK"):"");
								result.put("olNbr", resultMap.get("olNbr"));
								map.put("result", result);
							} else {
								map.put("resultCode", "1");
								map.put("resultMsg", resultMap.get("msg")+"有可能该购物车ID找不到对应的回执文件");
							}
						}else{
							map.put("resultCode", "-1");
							map.put("resultMsg", "验证失败！没有检查到给定的token");
							map.put("errorCode", "1101");
						}
					}else{
						map.put("resultCode", "-1");
						map.put("resultMsg", "验证失败！没有检查到给定的token");
						map.put("errorCode", "1101");
					}
				}else{
					map.put("resultCode", "-1");
					map.put("resultMsg", db.getResultMsg());
					map.put("errorCode", "1101");
				}
			}else{
				map.put("resultCode", "1");
				map.put("resultMsg", "token为空或者地区Id为空");
			}
		} catch (BusinessException e) {
			this.log.error("电子回执下载服务异常", e);
			try {
				map.put("resultCode", "-1");
				map.put("resultMsg", "电子回执下载服务调用失败");
				map.put("errorCode", "1101");
				map.put("errorStack", e.getMessage());
			} catch (Exception e1) {
				
			}
		} catch (InterfaceException ie) {
			log.error(ie);
			try {
				map.put("resultCode", "-1");
				map.put("resultMsg", "电子回执下载服务调用失败");
				map.put("errorCode", "1101");
				map.put("errorStack", ie.getMessage());
			} catch (Exception e1) {
				
			}
		} catch (Exception e) {
			log.error(e);
			try {
				map.put("resultCode", "-1");
				map.put("resultMsg", "电子回执下载服务调用失败");
				map.put("errorCode", "1101");
				map.put("errorStack", e.getMessage());
			} catch (Exception e1) {
				
			}
		}
	
		return JsonUtil.toString(map);
	}
	
	/**
     * 设置javascript开发者模式，可以浏览原始javascript代码，并且在实际引入时也使用原始javascript代码
     * @param param
     * staff/setJavascriptDeveloperModel?code=DV82KN
     */
	@RequestMapping(value = "/setJavascriptDeveloperModel", method = RequestMethod.GET)
	public String setJavascriptDeveloperModel(HttpServletRequest request,Model model) throws AuthorityException {
		String checkCode = request.getParameter("code") ;
		if("DV82KN".equals(checkCode)){
			request.getSession().setAttribute(SysConstant.ATTR_JAVASCRIPT_DEVELOPER, SysConstant.IS_JAVASCRIPT_DEVELOPER);
			String msg = "javascript开发者模式设置成功";
			model.addAttribute("success", msg);
			return "/common/success";
		}else{
			model.addAttribute("success", "未授权的访问！");
			return "/common/success";
		}
    }
	
	@RequestMapping(value = "/cache", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String cache() throws AuthorityException {	
		return "/cache/cache";
    }
	
	@RequestMapping(value = "/getIpList", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getIpList(HttpServletRequest request,Model model) {
		try {
			Map<String ,Object> iplist = getIpList(request);
			return super.successed(iplist);
		} catch (Exception e) {
			return super.successed(-1);
		}
	}
	
	
	/**
     * 重新加载门户层portal.properties配置文件、重新从服务层加载系统参数表、刷新服务层日志开关
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/resetAllCommonParam", method = RequestMethod.GET)
	public String resetAllCommonParamAndProperties(HttpServletRequest request,Model model) throws AuthorityException {
		String checkCode = request.getParameter("code") ;
		if("DV82KN".equals(checkCode)){
			int result = DataEngine.resetAllCommonParam();
			String msg = "SP_SYS_PARAM数据表缓存刷新成功。";
			if (result  != 0) {
				msg = "SP_SYS_PARAM数据表缓存刷新失败！！";
			}
			
			//清除能力开放缓存数据
			resetTokenParams();
			
			propertiesUtils.clear();
			msg += "portal.properties配置文件缓存刷新成功。";
			//顺便清除apConfig缓存
			DataRepository.getInstence().getApConfigMap().clear();
			model.addAttribute("success", msg);
			return "/common/success";
		}else{
			model.addAttribute("success", "未授权的访问！");
			return "/common/success";
		}
    }	
	
	/**清空能力开放缓存数据*/
	public int resetTokenParams(){
		int data=0;
		
		Const.ASSISTANT_TYPE=null;
		Const.ID_CARD_TYPE=null;
		
		return data;
	}
		
	/**
     * 重置 发票模版缓存
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
     * 重置 js版本号
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/resetJsVersion" ,method = {RequestMethod.POST,RequestMethod.GET})
	public String resetJsVersion(HttpServletRequest request,Model model) throws AuthorityException {
		String jsonpCallback = request.getParameter("jsonpCallback") ;
		model.addAttribute("jsonpCallback", jsonpCallback);
		String checkCode = request.getParameter("code") ;
		if("DV82KN".equals(checkCode)){
			DataEngine.resetjsversion();
			try {
				Thread.sleep(10000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			String level = propertiesUtils.getMessage(SysConstant.COMPRESS_JS_LEVEL);
	    	String baseVersion = propertiesUtils.getMessage(SysConstant.BASE_VERSION);
	    	String busiVersion = propertiesUtils.getMessage(SysConstant.BUSI_VERSION);
			DataEngine.compressNLFile(level,baseVersion,busiVersion);
			model.addAttribute("success", "js版本号重置成功。");
			return "/common/success";
		}else{
			model.addAttribute("success", "未授权的访问！");
			return "/common/success";
		}
    }	
	
	/**
     * 重置 js版本号，发票模版缓存，portal.properties配置文件缓存，SP_SYS_PARAM数据表缓存
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/resetAll", method = {RequestMethod.POST,RequestMethod.GET})
	public String resetAll(HttpServletRequest request,Model model) throws AuthorityException {
		String checkCode = request.getParameter("code") ;
		if("DV82KN".equals(checkCode)){
			int result = DataEngine.resetAllCommonParam();
			String msg = "SP_SYS_PARAM数据表缓存刷新成功。";
			if (result  != 0) {
				msg = "SP_SYS_PARAM数据表缓存刷新失败！！";
			}
			propertiesUtils.clear();
			msg += "portal.properties配置文件缓存刷新成功。";
			//顺便清除apConfig缓存
			DataEngine.resetjsversion();
			msg += "js版本号重置成功。";
			DataEngine.resetTemplateList();
			//重置jasper缓存
			PrintHelperMgnt.resetPrintHelperMgnt();
			msg += "发票模板缓存刷新成功。";
			DataRepository.getInstence().getApConfigMap().clear();
			model.addAttribute("success", msg);
			return "/common/success";
		}else{
			model.addAttribute("success", "未授权的访问！");
			return "/common/success";
		}
    }
	
	/**
     * 根据iplist 和typelist清理缓存
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/cacheClear",method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse cacheClear(@RequestBody Map<String, Object> param,HttpSession session, HttpServletResponse response,
			HttpServletRequest request){
		CACHE_CLEAR_RESULT = new ArrayList();
		Map<String, Object> rMap = new HashMap<String,Object>();
		JsonResponse jsonResponse = null;
		String resultList= null;
    	List iplist = (List) param.get("list");
    	String type = (String) param.get("type");    	
		if("js".endsWith(type)){
			type = "/resetJsVersion";
		}else if("param".endsWith(type)){
			type = "/resetAllCommonParam";
		}else if("template".endsWith(type)){
			type = "/resetTemplateList";
		}else if("all".endsWith(type)){
			type = "/resetAll";
		}
		try{
		CacheClear c = new CacheClear(iplist,type);
		int threadNum = 20;//最多并行进程数，如果ip数小于20，则进程数为ip数
		if(threadNum>iplist.size()){
			threadNum = iplist.size();
		}
		for(int i=0;i<threadNum;i++)
			new Thread(c).start();		
		for(;c.getIndex2()<c.getIplistleng();){
			Thread.sleep(500);
		}
		rMap.put("resultMsg","缓存刷新完毕！");	  
		rMap.put("resultList",CACHE_CLEAR_RESULT);
		return super.successed(rMap);
		} catch (Exception e) {
			log.error("门户/staff/cacheClear方法异常", e);
			return super.failed(ErrorCode.CACHE_CLEAR, e, param);
		}
	}
	
	/**
     * 查询缓存清理进度
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/cacheClearSchedule",method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse cacheClearSchedule(@RequestBody Map<String, Object> param,HttpSession session, HttpServletResponse response,
			HttpServletRequest request){
		Map<String, Object> rMap = new HashMap<String,Object>();
		rMap.put("resultList",CACHE_CLEAR_RESULT);
 		return super.successed(rMap);
	}
	
	/**
	 * 判断浏览器版本属于推荐还是告警还是禁止
	 * @param browserVersion
	 * @return List<Map>
	 */
	@RequestMapping(value = "/browserValid", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse browserValid(@RequestParam("browserVersion") String browserVersion) {
		Map<String, Object> rMap = new HashMap<String,Object>();
		try {
			String recBroStr = (propertiesUtils.getMessage(SysConstant.RECOMMEND_BROWSERS) == null ? "" : propertiesUtils.getMessage(SysConstant.RECOMMEND_BROWSERS));
			String warnBroStr = (propertiesUtils.getMessage(SysConstant.WARNING_BROWSERS) == null ? "" : propertiesUtils.getMessage(SysConstant.WARNING_BROWSERS));
			String forbBroStr = (propertiesUtils.getMessage(SysConstant.FORBIDDEN_BROWSERS) == null ? "" : propertiesUtils.getMessage(SysConstant.FORBIDDEN_BROWSERS));
			String[] recBroArr = recBroStr.split(",");
			String[] warnBroArr = warnBroStr.split(",");
			String[] forbBroArr = forbBroStr.split(",");
			rMap.put("recBroStr", recBroStr);
			browserVersion = browserVersion.replace(".0", "");
			for (String recBro : recBroArr) {
				recBro = recBro.replace(".0", "");
				if (recBro.equals(browserVersion)) {
					rMap.put("level", "1");
					return super.successed(rMap);
				}
			}
			for (String warnBro : warnBroArr) {
				warnBro = warnBro.replace(".0", "");
				if (warnBro.equals(browserVersion)) {
					rMap.put("level", "2");
					return super.successed(rMap);
				}
			}
			for (String forbBro : forbBroArr) {
				forbBro = forbBro.replace(".0", "");
				if (forbBro.equals(browserVersion)) {
					rMap.put("level", "3");
					return super.successed(rMap);
				}
			}
		} catch (Exception e) {
			log.error("门户/staff/browserValid方法异常", e);
			if (!rMap.containsKey("recBroStr")) {
				rMap.put("recBroStr", "");
			}
		}
		rMap.put("level", "1");
		return super.successed(rMap);
	}
	
	   private  Map<String ,Object> getIpList(HttpServletRequest request){
		   Map<String ,Object> ipList = new HashMap<String ,Object>();
		   try {
	            SAXReader reader = new SAXReader();
	            String logoPathDir = "WEB-INF/classes/cache/iplist.xml";
	            /** 得到文件保存目录的真实路径* */
	 		   	String logoRealPathDir = request.getSession().getServletContext().getRealPath(logoPathDir);
//	            String path = request.getContextPath();
//	            String filePath = path+"WEB-INF/classes/";
	            File file = new File(logoRealPathDir);
	            if (file.exists()) {
                    List alliplist = new ArrayList();
                    int allIpNum = 0;
	                Document document = reader.read(file);// 读取XML文件
	                Element root = document.getRootElement();// 得到根节点
	                for (Iterator i = root.elementIterator("ipList"); i.hasNext();) {
	                    Element list = (Element) i.next();
	                    String areaCode = list.attributeValue("code");
	                    List iplist = new ArrayList();
	                    int k = 0;
		                for (Iterator j = list.elementIterator("ip"); j.hasNext();) {		                	
		                	String ip = ((Element) j.next()).getText();
		                	iplist.add(ip);
		                	alliplist.add(ip);
		                	k++;
		                	allIpNum++;
		                }
		                ipList.put(areaCode+"Num",k);
		                ipList.put(areaCode, iplist);
	                }
	                ipList.put("allNum",allIpNum);
	                ipList.put("all", alliplist);
	            } else {
	            	log.error("iplist.xml文件不存在！ ");
	            }
	        } catch (Exception e) {
	            e.printStackTrace();
	        }
	    	return ipList;
	    }
	   
	
	class CacheClear implements Runnable{
		private List iplist;
		private String type ;
		//生产物理端口，"10101","10102","10103"为A版本，"10151","10152","10153"为B版本。
		private String[] portList = {"10101","10102","10103","10151","10152","10153"};
		private int iplistleng;
		//进行到第几个
		private int index;
		//进行完第几个
		private int index2;
		public CacheClear(){
		}
		public CacheClear(List iplist ,String type){
			this.iplist = iplist;
			this.type = type;					
			this.iplistleng = iplist.size();
			this.index = 0;
			this.index2 = 0;
		}
		public List getIplist() {
			return iplist;
		}
		public void setIplist(List iplist) {
			this.iplist = iplist;
		}
		public String getType() {
			return type;
		}
		public void setType(String type) {
			this.type = type;
		}
		public int getIplistleng() {
			return iplistleng;
		}
		public void setIplistleng(int iplistleng) {
			this.iplistleng = iplistleng;
		}
		public int getIndex() {
			return index;
		}
		public void setIndex(int index) {
			this.index = index;
		}
		public int getIndex2() {
			return index2;
		}
		public void setIndex2(int index2) {
			this.index2 = index2;
		}
		public void run(){
			for(int i = 0;index<iplistleng;){
				i =++index;				
				String ip = (String) iplist.get(i-1);
				for(int j=0;j<portList.length;j++){
					String url = "http://"+ip+":"+portList[j]+"/provPortal/staff"+type+"?code=DV82KN";
					String result = staffBmo.cacheClear(url);
					result=ip+":"+portList[j]+" ： "+result;	
					CACHE_CLEAR_RESULT.add(result);
				}
				index2++;
		  }
	   }
	}
	
	/**
	 * 配置
	 */
	@RequestMapping(value = "/querySwithFromMDA", method ={ RequestMethod.POST, RequestMethod.GET})
    public @ResponseBody String querySwithFromMDA(@RequestParam Map<String, Object> param) {
		
		return CommonUtils.getSwithFromMDA(param.get("areaId").toString(),param.get("key").toString());
    }
	
	/**
	 * 二维码扫描登录-获取二维码信息
	 * 唯一标识：UUID+当前时间戳
	 * 
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 * @throws Exception
	 */
    @RequestMapping(value = "/getRQCode", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getRQCode(@RequestBody Map<String, Object> param,
    		@LogOperatorAnn String flowNum,
    		HttpServletRequest request,
            HttpServletResponse response) throws Exception {
	    JsonResponse jsonResponse = null;
	    String flag = param.get("flag").toString();
	    String qrData = "";
	    try {
	    	if("login".equals(flag)){
				String areaId = param.get("areaId").toString();
		    	// 二维码唯一标识 UUID+timestamp
		    	String download_addr = com.al.ecs.common.util.MDA.DOWNLOAD_ADDR+"?id=";
		    	StringBuffer sb_uuid =  new StringBuffer();
				sb_uuid.append(UUID.randomUUID().toString().replace("-", ""));
				sb_uuid.append(System.currentTimeMillis());
				String qr_uuid = sb_uuid.toString();
				qrData = download_addr+qr_uuid+"&areaId="+areaId;
				request.getSession().setAttribute(SysConstant.SESSION_QRCODE_UUID,qr_uuid);
	    	}else if("bind".equals(flag)){
	    		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	    				SysConstant.SESSION_KEY_LOGIN_STAFF);
	    		if(null == sessionStaff){
	    			return super.failed("生成二维码失败,员工已退出", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
	    		}
	    		qrData = sessionStaff.getStaffId()+sessionStaff.getCurrentChannelId();
	    	}
			String RQCode = "data:image/png;base64,"+new QrCodeImageGen().encoderQRCodeToBase64(qrData,"png",6);
			jsonResponse = super.successed(RQCode, ResultConstant.SUCCESS.getCode());	
		} catch (Exception e) {
			Object qr_uuid = request.getSession().getAttribute(SysConstant.SESSION_QRCODE_UUID);
			if(null !=qr_uuid &&  !qr_uuid.toString().equals("")){
				request.getSession().removeAttribute(SysConstant.SESSION_QRCODE_UUID);
			}
			jsonResponse = super.failed("生成二维码失败", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}
        return jsonResponse;
    }
    
    /**
     * 二维码扫码-轮训请求
     * @param flowNum
     * @param response
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/loopGet", method = RequestMethod.POST)
    @LogOperatorAnn(switchs = Switch.OFF)
    @ResponseBody
    public JsonResponse loop(@RequestBody Staff staff,
    		@LogOperatorAnn String flowNum,
    		HttpServletRequest request,
            HttpServletResponse response,
            String loginValid) throws Exception {
    	JsonResponse jsonResponse = null;
	    try {
	    	String qr_uuid =  (String) request.getSession().getAttribute(SysConstant.SESSION_QRCODE_UUID);
	    	/** session 中二维码标识不存在,则已经失效 **/
	    	if(null == qr_uuid){
	    		return super.successed(QRCode.INVALID.getMsg(), QRCode.INVALID.getCode());		
	    	}else{
	    		/** 超过指定时间,失效 **/
	    		long createTime = Long.parseLong(qr_uuid.substring(32,qr_uuid.length()));
	    		long invalidTime = 1;
	    		try{
	    			invalidTime = Long.parseLong(com.al.ecs.common.util.MDA.INVALID_TIME);
	    		}catch(Exception e){
	    			e.printStackTrace();
	    			invalidTime = 30 * 1000;
	    		}
		    	if( System.currentTimeMillis() - createTime >= invalidTime ){
		    		ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_QRCODE_UUID);
		    		return super.successed(QRCode.INVALID.getMsg(), QRCode.INVALID.getCode());	
		    	}
		    	/** 已扫描,调用系管通过,待手机端授权 ,暂去掉**/
		    	/*if(true){
		    		return super.successed(QRCode.STARTED.getMsg(), QRCode.STARTED.getCode());
		    	}*/
		    	
		    	jsonResponse = qrLoginCheck(staff,request,flowNum,loginValid);
		    	int code = jsonResponse.getCode();
		    	switch(code){
		    		case 0:
		    			return super.successed(jsonResponse, QRCode.SUCCESS.getCode());
					case 1:
						ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_QRCODE_UUID);
			    		return super.successed(QRCode.INVALID.getMsg(), QRCode.INVALID.getCode());
		    		case -1:
		    			ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_QRCODE_UUID);
			    		return super.successed(QRCode.INVALID.getMsg(), QRCode.INVALID.getCode());
		    		case -2:
		    			ServletUtils.removeSessionAttribute(request, SysConstant.SESSION_QRCODE_UUID);
			    		return super.successed(jsonResponse, QRCode.SUCCESS.getCode());
		    		default:
		    			return super.successed(QRCode.NOSTART.getMsg(), QRCode.NOSTART.getCode());
		    	}
		    	//return super.successed(QRCode.NOSTART.getMsg(), QRCode.NOSTART.getCode());
	    	}
		} catch (Exception e) {
			return super.successed(QRCode.INVALID.getMsg(), QRCode.INVALID.getCode());
		}
    }
    
    private JsonResponse qrLoginCheck(Staff staff,
			HttpServletRequest request, 
			String flowNum,
			String loginValid) throws PortalCheckedException {

    	String qr_uuid = (String) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_QRCODE_UUID);
		String staffProvCode = staff.getStaffProvCode();
		
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("code",qr_uuid);
		//dataBusMap.put("staffCode", "KFNJ30685");
		//dataBusMap.put("password", MD5Helper.getMD5Str("123qwe"));
		dataBusMap.put("areaId", staff.getStaffProvCode());
		dataBusMap.put("platformCode", SysConstant.SM_PLATFORM_CODE);
		
		String ip = "";
		try {
			ip = ServletUtils.getIpAddr(request);
			if (StringUtils.isNotEmpty(ip)) {
				dataBusMap.put("wanIp", ip);
			}
		} catch (Exception e) {
		}
		
		Map<String, Object> map = null;
		try {
			SessionStaff staffSession= new SessionStaff();
			staffSession.setCurrentAreaId(staffProvCode);
			dataBusMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
			map = staffBmo.qrLoginCheck(dataBusMap, flowNum, staffSession);
			// 调用返回服务调用结果code
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)) {
				if (StringUtils.isNotEmpty(ip)) {
					map.put("ip", ip);
				}
				map.put("staffProvCode", staffProvCode);
				map.put("connectiontime", staff.getconnectiontime());
				map.put("sendtime", staff.getsendtime());
				map.put("waitingtime", staff.getwaitingtime());
				map.put("accepttime", staff.getaccepttime());
				map.put("macStr", staff.getMacStr());
				request.getSession().setAttribute(SESSION_KEY_TEMP_LOGIN_STAFF, map);
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
				//往数据中填充
				String smsPassFlag = MapUtils.getString(map, "smsPassFlag", "Y");
				String msgCodeFlag = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_CODE_FLAG);
				String msgnumber = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),SysConstant.MSG_NUMBERS);
				Map<String, Object> successedData = new HashMap<String, Object>();
				//如果全局开关设定为不发送，或者员工信息表明不发送，或者当前是重新登录不发送短信
				if ("1".equals(msgCodeFlag) || "N".equals(smsPassFlag) || "N".equals(loginValid)) {
					successedData.put("data", "N");
					successedData.put("hintCode", map.get("hintCode"));
					return super.successed(successedData);
				}
				successedData.put("data", "Y");
				successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_RANDONCODE));
				successedData.put("msgnumber", msgnumber);
				return super.successed(successedData);
			} else {
				Map<String, Object> failData = new HashMap<String, Object>();
				// 返回信息
				failData.put("code", resultCode);
				failData.put("message", MapUtils.getString(map, "resultMsg", "员工登录失败，未得到报错信息"));
				JsonResponse jsonResponse = super.failed(failData, ResultConstant.DATA_NOT_VALID_FAILTURE.getCode());
				return jsonResponse;
			}
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, dataBusMap, ErrorCode.STAFF_LOGIN);
		} catch (Exception e) {
			return super.failed(ErrorCode.STAFF_LOGIN, e, dataBusMap);
		}
	}
    
    //经办人拍照人证相符短信校验码验证
    @RequestMapping(value = "/login/confirmAgreeCheck" ,method = RequestMethod.GET)
	@LogOperatorAnn(desc = "经办人拍照人证相符短信校验码验证", code = "CHANGEUIM", level = LevelLog.DB)
	@ResponseBody
	public JsonResponse confirmAgreeCheck(@RequestParam Map<String, Object> paramMap,HttpServletRequest request, @LogOperatorAnn String flowNum) {
		String number = MapUtils.getString(paramMap, "number");
    	
    	try {
			String areaId = (String) paramMap.get("areaId");
			String virOlId = (String) paramMap.get("virOlId");
			String checkType = (String) paramMap.get("checkType");
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_NUMBER, number);
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_AREAID, areaId);
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_OLID, virOlId);
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_CHECKTYPE, checkType);
			//短信发送时间间隔,10秒内重复发送，会被拦截！
			Long sessionTimeL = (Long) request.getSession().getAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME);
			if (sessionTimeL != null) {
				long sessionTime = sessionTimeL;
				long nowTime = (new Date()).getTime();
				long inteval = 10 * 1000;//间隔10秒
				if (nowTime - sessionTime > inteval ) {		
					Map<String, Object> msgMap = confirmAgreeSendMsg(request, flowNum); 
					if (ResultCode.R_FAILURE.equals(msgMap.get("resultCode"))|msgMap.size()==0|msgMap==null) {
						//如果发送短信异常
						return super.failed(msgMap.get("resultMsg"), 3);
					}
				}else{
					return super.successed("验证码发送中，请稍后再操作进行验证！", 1003);
				}
			}else{
				Map<String, Object> msgMap = confirmAgreeSendMsg(request, flowNum); 
				if (ResultCode.R_FAILURE.equals(msgMap.get("resultCode"))|msgMap.size()==0|msgMap==null) {
					//如果发送短信异常
					return super.failed(msgMap.get("resultMsg"), 3);
				}
			}
			
		} catch (BusinessException be) {
			this.log.error("错误信息:{}", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, new HashMap<String, Object>(), ErrorCode.CONFIRMAGREE_MSG_SEND);
		} catch (Exception e) {			
			log.error("门户登录/staff//login/confirmAgreeSendMsg方法异常", e);
			return super.failed(ErrorCode.CONFIRMAGREE_MSG_SEND, e, new HashMap<String, Object>());
		}
		Map<String, Object> successedData = new HashMap<String, Object>();
		successedData.put("data", "短信验证码发送成功!");
		successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CONFIRMAGREE_RANDONCODE));
		return super.successed(successedData, ResultConstant.SUCCESS.getCode());
	}
    
    // 经办人拍照人证相符审核短信发送短信
	public Map<String, Object> confirmAgreeSendMsg(HttpServletRequest request, String flowNum) throws Exception {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> retnMap = new HashMap<String, Object>();
		
		if (sessionStaff != null) {
			String staffName = sessionStaff.getStaffName();
			String staffCode = sessionStaff.getStaffCode();
			String number = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_NUMBER);
			String areaId = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_AREAID);
			String virOlId = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_OLID);
			String checkType = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_CHECKTYPE);
			String isSecond=request.getParameter("isSecond");
			String accNbr=request.getParameter("number");
			
			if(SysConstant.STR_Y.equals(isSecond)&&StringUtils.isNotBlank(accNbr)){
				number = accNbr;
				areaId = sessionStaff.getCurrentAreaId();
			}else if(request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_NUMBER) ==null){
				retnMap.put("resultCode",ResultCode.R_FAILURE );
				retnMap.put("resultMsg","短信验证号码获取失败，系统异常！请刷新重试!");
				return retnMap;
			}else if(request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_AREAID) ==null){
				retnMap.put("resultCode",ResultCode.R_FAILURE );
				retnMap.put("resultMsg","短信验证号码所属地区获取失败，系统异常！请刷新重试!");
				return retnMap;
			}
			if(StringUtils.isBlank(number)){
				retnMap.put("resultCode",ResultCode.R_FAILURE );
				retnMap.put("resultMsg","短信验证号码为空，系统异常！请刷新重试!");
				return retnMap;
			}
			Map<String, Object> checkResult = EhcacheUtil.photographReviewTamperInterceptor(number, request);
	    	if(ResultCode.SUCCESS != MapUtils.getIntValue(checkResult, SysConstant.RESULT_CODE, 1)){
	    		retnMap.put("resultCode",ResultCode.R_FAILURE );
				retnMap.put("resultMsg",MapUtils.getString(checkResult, SysConstant.RESULT_MSG));
				return retnMap;
	    	}
			
			String smsPwd = null;
			String randomCode =null;
			//发送4位验证码
			smsPwd = UIDGenerator.generateDigitNonce(4);
			randomCode = UIDGenerator.generateDigitNonce(2);
			for(;randomCode == ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CONFIRMAGREE_RANDONCODE);)
			{
				randomCode = UIDGenerator.generateDigitNonce(2);
			}
			this.log.debug("业务受理短信验证码：{}", smsPwd);
			Map<String, Object> msgMap = new HashMap<String, Object>();
			msgMap.put("phoneNumber", number);
			msgMap.put("key", smsPwd);
			msgMap.put("MsgNumber", "5487");
			
			if(checkType.equals(SysConstant.CHECKTYPE_LOCAL)){//本地审核
				msgMap.put("randomCode", randomCode);
				msgMap.put("message", propertiesUtils.getMessage(
						"PHOTOGRAPH_REVIEW_SMS_CONTENT_LOCAL", new Object[] {staffName,staffCode,smsPwd}));
			}else{//远程审核
				msgMap.put("randomCode", randomCode);
				msgMap.put("message", propertiesUtils.getMessage(
						"PHOTOGRAPH_REVIEW_SMS_CONTENT_DIFF", new Object[] {staffName,staffCode,virOlId}));
			}
			if(!"00".equals(areaId.substring(5))){
				areaId = areaId.substring(0, 5) + "00";
			}
			msgMap.put("areaId", areaId);
			msgMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
			msgMap.put("sendflag", "handleCustPhotographReviewMessage");
			retnMap = staffBmo.sendMsgInfo(msgMap, flowNum, sessionStaff);
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_CONFIRMAGREE_SMS);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_CONFIRMAGREE_SMS, smsPwd);
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_NUMBER, number);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_CONFIRMAGREE_RANDONCODE, randomCode);
			//短信发送时间间隔
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME, (new Date()).getTime());
		} else {
			this.log.error("错误信息:登录会话失效，请重新登录!");
			retnMap.put("resultCode",ResultCode.R_FAILURE );
			retnMap.put("resultMsg","错误信息:登录会话失效，请重新登录!");
			return retnMap;
		}
		
		return retnMap;
	}
	
	@RequestMapping(value = "/login/confirmAgreeSmsResend", method = RequestMethod.GET)
	@LogOperatorAnn(desc = "经办人拍照人证相符审核短信校验码重新发送", code = "CHANGEUIM", level = LevelLog.DB)
	@ResponseBody
	public JsonResponse confirmAgreeSmsResend(@RequestParam Map<String, Object> paramMap,HttpServletRequest request, @LogOperatorAnn String flowNum) {
		try {
			Long sessionTimeL = (Long) request.
					getSession().getAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME);
			if (sessionTimeL == null) {
				request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME, (new Date()).getTime());
				sessionTimeL = 0L;
			}
			long sessionTime = sessionTimeL;
			long nowTime = (new Date()).getTime();
			long inteval = 28 * 1000;//比30秒提前2秒
			int smsErrorCount = MapUtils.getIntValue(paramMap, "smsErrorCount", 0);
			if (nowTime - sessionTime > inteval || smsErrorCount >= 3) {
				confirmAgreeSendMsg(request, flowNum);
			} else {
				log.debug("time inteval:{}", nowTime - sessionTime);
				return super.failed("短信验证码发送时间有误!请求太过频烦,请稍后再重发！",
						ResultConstant.ACCESS_LIMIT_FAILTURE.getCode());
			}
		} catch (BusinessException be) {
			this.log.error("错误信息:{}", be);
			return super.failed(be);
		} catch (Exception e) {			
			log.error("门户补换卡短信验证/staff/login/confirmAgreeSmsResend方法异常", e);
			return super.failed(ErrorCode.CONFIRMAGREE_MSG_SEND, e, new HashMap<String, Object>());
		}
		Map<String, Object> successedData = new HashMap<String, Object>();
		successedData.put("data", "短信验证码发送成功!");
		//successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS));
		successedData.put("randomCode", ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CONFIRMAGREE_RANDONCODE));
		return super.successed(successedData, ResultConstant.SUCCESS.getCode());
	}
	
	@RequestMapping(value = "/login/confirmAgreeSmsValid", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse confirmAgreeSmsValid(@RequestParam("smspwd") String smsPwd,@RequestParam("number") String number,
			HttpServletRequest request ,HttpServletResponse response) throws Exception {
		this.log.debug("confirmAgreeSmsValidsmsPwd={}，number={}", smsPwd, number);
		// 验证码内容
		String smsPwdSession = (String) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_CONFIRMAGREE_SMS);
		// 对应的手机号
		String numberSession = (String) ServletUtils.getSessionAttribute(
				request, SESSION_CONFIRMAGREE_SMS_NUMBER);
		//如果不需要发送短信，验证码就为空，不提示短信过期失效
		if(StringUtil.isEmpty(smsPwdSession)){
			return super.failed("短信过期失效，请重新发送!", ResultConstant.FAILD.getCode());
		}
		if (smsPwdSession.equals(smsPwd)&&numberSession.equals(number)) {
			Map<String,Object> resData=new HashMap<String,Object>();
			resData.put("msg", "短信验证成功.");
			return super.successed(resData);
		}else {
			return super.failed("短信验证码错误!", ResultConstant.FAILD.getCode());
		}
	}
}

package com.al.lte.portal.common;

import java.io.UnsupportedEncodingException;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.method.HandlerMethod;

import com.al.ec.entity.StaffInfo;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.sm.MDA;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.ecs.spring.interceptor.ISessionInterceptor;
import com.al.ecs.spring.interceptor.SessionInterceptor;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.staff.StaffChannelBmo;
import com.al.lte.portal.bmo.system.MenuBmo;
import com.al.lte.portal.controller.system.LoginController;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

public class MySessionInterceptor implements ISessionInterceptor {

	private static final Log log = Log.getLog(MySessionInterceptor.class);

	public static final String SESSION_CODE = "sessionCode";
	@Autowired
	PropertiesUtils propertiesUtils;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffChannelBmo")
	private StaffChannelBmo staffChannelBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.system.MenuBmo")
	private MenuBmo menuBmo;
	private static Map<String, Object> tokens = new HashMap<String, Object>();

	public static void addToken(String token, Object values) {
		tokens.put(token, values);
	}

	public static Object checkToken(String token) {
		return tokens.get(token);
	}

	public static void removeToken(String token) {
		tokens.remove(token);
	}

	public boolean checkSession(HttpServletRequest request,HttpServletResponse response, HandlerMethod handler, String url) {
		String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);// 获取系统类别，是LTE还是转售
		if (SysConstant.APPDESC_LTE.equals(appDesc)) {// LTE走单点登录
			return lteLoginCheck(request, response, url);
		} else if (SysConstant.APPDESC_MVNO.equals(appDesc)) {// 转售走集中会话
			return centralizedSession(request, response);
		} else if (SysConstant.APPDESC_DEV.equals(appDesc)) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * LTE登录验证
	 * @param request
	 * @param response
	 * @return
	 */
	private boolean lteLoginCheck(HttpServletRequest request,HttpServletResponse response, String url) {
		HttpSession session = request.getSession(true);
		SessionStaff sessionStaff = (SessionStaff) session.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		if (sessionStaff != null) {// 如果本地已经登录
			if ("Y".equals(DataRepository.getInstence().getCommonParam("", SysConstant.ONE_USER_ONE_LOGIN)))
				return oneAccountOneUser(session, response);
			else
				return true;
		} else {// 如果本地没有登录
			String param="false";
            try {
                param = MySimulateData.getInstance().getParam((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),"do_single_sign");
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            } catch (InterfaceException e) {
                e.printStackTrace();
            }
			boolean needSingleSign = 	BooleanUtils.toBoolean(param);
			if (needSingleSign) {//查看是否需要单点登录，配置项在simulate.property文件或者系统参数表中
				return singleSign(request,response,session);
			} else {// 不需要单点登录，直接去验证
				return false;
			}
		}
	}
	/**
	 * 单点登录处理
	 * @param request
	 * @param session
	 * @return
	 */
	public boolean singleSign(HttpServletRequest request,HttpServletResponse response,HttpSession session) {
	    String token=request.getParameter("token");
	    String areaId=request.getParameter("areaId");
		// 先从cookie中取到登录标记。
		Cookie ck = ServletUtils.getCookie(request,SessionInterceptor.SINGLE_SIGN_COOKIE_TOKEN);
		Cookie areack = ServletUtils.getCookie(request,SessionInterceptor.SINGLE_SIGN_COOKIE_AREA);
		 if((ck != null && areack != null)||(token != null && areaId != null)){// 如果省市已经登录，那么跳转到页面进行登录验证
			Map<String, Object> dataBusMap = new HashMap<String, Object>();
			if(org.apache.commons.lang3.StringUtils.isBlank(token)){
			    token= ck.getValue();
			}
			if(org.apache.commons.lang3.StringUtils.isBlank(areaId)){
			    areaId=areack.getValue();
            }
			 String dstSysID="";
			 String dstOrgID="";
			try {
                 dstSysID=MySimulateData.getInstance().getNeeded((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY),"pvc-"+areaId, "DstSysID");
                 dstOrgID=MySimulateData.getInstance().getNeeded((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY),"pvc-"+areaId, "DstOrgID");
            } catch (Exception e1) {
                log.error( "缺少指定areaId的dstSysID或者dstOrgID的配置（没有加载到缓存？），没有取到dstSysID或者dstOrgID，dstSysID="+dstSysID+"   dstOrgID="+dstOrgID+"，areaId="+areaId+"，token="+token, e1);
            }
            if(dstSysID==null || dstOrgID==null){
            	return false;
            }
			dataBusMap.put("DstSysID", dstSysID);
			dataBusMap.put("DstOrgID", dstOrgID);
			dataBusMap.put("token", token);
			SessionStaff sessionStaff=new SessionStaff();
			sessionStaff.setAreaId(areaId);
			try {
			    long l_start = Calendar.getInstance().getTimeInMillis();
				// 调用服务验证是否登录
                DataBus db = ServiceClient.callService(dataBusMap, PortalServiceCode.SIGLE_SIGN_CHECK_LOGIN, null, sessionStaff);
                Map resMap = db.getReturnlmap();
                if (resMap != null && resMap.get("code").equals("POR-0000")) {// 到省的服务调用成功
                    String resultJSON =ObjectUtils.toString(resMap.get("resultJSON"), "{}") ;
					Map dataMap=JsonUtil.toObject(resultJSON, HashMap.class);
					if (dataMap != null&&"0".equals(dataMap.get("resultCode"))) {//省份token验证成功
					    Map result=(Map) dataMap.get("result");
						String staffCode = MapUtils.getString(result, "staffCode");
						String commonRegionId = MapUtils.getString(result, "areaId");
						if (StringUtils.isNotBlank(staffCode) && StringUtils.isNotBlank(commonRegionId)) {
							try {
								Map staffInfo = staffBmo .queryStaffByStaffCode4Login(staffCode, commonRegionId);
								if(staffInfo.get("resultCode")!=null){
									return false;
								}
								staffInfo.put("token", token);
								SessionStaff newSessionStaff ;
								newSessionStaff=copyMapAttr(staffInfo);
								initSessionStaff(newSessionStaff, session);
								LoginController.singleSignAttr(newSessionStaff, token, request);
								addToken(token, newSessionStaff);// 验证登录成功后，在本地保存登录信息，供其他系统来验证
								//集团单点省份写省份cookie
								String provtoken=UUID.randomUUID().toString();//生成唯一的uuid标记
								String Provinceid = newSessionStaff.getAreaId().substring(0, 3)+"0000";
//								LoginController.addCookie(areaId,provtoken,response,request);//保存本地cookie
								Map paramap = new HashMap();
								paramap.put("TOKEN", provtoken);
								paramap.put("STAFFID", newSessionStaff.getStaffId());
								paramap.put("STAFFCODE", newSessionStaff.getStaffCode());
								paramap.put("STAFFNAME", newSessionStaff.getStaffName());
								paramap.put("AREAID", newSessionStaff.getAreaId());
								paramap.put("AREACODE", newSessionStaff.getAreaCode()!=""?newSessionStaff.getAreaCode():"0");
								paramap.put("AREANAME", newSessionStaff.getCurrentAreaId());//暂时存放当前渠道的areadId
								paramap.put("CITYNAME", newSessionStaff.getCityName());
								paramap.put("PROVINCENAME", "");
								paramap.put("FLAG", "insert");
//								LoginController.singleSignAttr(newSessionStaff,provtoken,request);//保存单点登录session信息
								Map reportmap = new HashMap();
								reportmap.put("Token", provtoken);
								reportmap.put("areaId", Provinceid);
								session.setAttribute(SysConstant.SESSION_KEY_REPORT_CHECK, reportmap);
								try {
//									SessionStaff sessionStaffTmp=new SessionStaff();
//									sessionStaffTmp.setAreaId(areaId);
									ServiceClient.callService(paramap, PortalServiceCode.INSERT_LOGINSESSION, null, newSessionStaff);
									if(!"".equals(newSessionStaff.getAreaId())){
										String setLoginCookie="setLoginCookie";
										String logout="logout";
										if(!CommonMethods.isOINet(request)){
											setLoginCookie+="O";
											logout+="O";
										}
										//设置省份url访问省份系统，设置用户单点登录标记
										String loginUrl=MySimulateData.getInstance().getNeeded((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY),InterfaceClient.CHECK_LOGIN+"-"+ sessionStaff.getAreaId().substring(0, 3)+"0000", setLoginCookie);
										if(StringUtils.isNotBlank(loginUrl)){
											session.setAttribute("_loginUrl", loginUrl+"?token="+provtoken+"&areaId="+areaId.substring(0, 3)+"0000");
										}
										//单点登录同步退出
										String logoutUrl=MySimulateData.getInstance().getNeeded((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY),InterfaceClient.CHECK_LOGIN+"-"+ sessionStaff.getAreaId().substring(0, 3)+"0000", logout);
										if(StringUtils.isNotBlank(logoutUrl)){
											session.setAttribute("_logoutUrl", logoutUrl);
										}
									}
				                } catch (Exception e) {
				                    e.printStackTrace();
				                }
								
								long l_end = Calendar.getInstance().getTimeInMillis();
					            staffBmo.loginInlog(l_end-l_start, null, newSessionStaff,null);//登錄日誌
								return true;
							} catch (Exception e) {
								log.error( "调用系统管理smService/sysManager/queryStaffByStaffCode4Login接口异常，不能初始化员工信息！", e);
								return false;
							}
						} else {// 没有返回员工编号和地区ID
							return false;
						}
					} else {// 省份验证Token失败
						return false;
					}
				} else {//  到省的服务调用不成功
					return false;
				}
			} catch (Exception e) {
			    log.error( "调用系统管理smService/sysManager/queryStaffByStaffCode4Login接口异常，不能初始化员工信息！", e);
				return false;
			}
		}else{// 如果没有省市登录的地区标记，那么认为省市没有登录。
		    return false;
		}
	}

	/**
	 * 集中会话处理
	 * 
	 * @param request
	 * @return
	 */
	private boolean centralizedSession(HttpServletRequest request, HttpServletResponse response) {
		HttpSession session = request.getSession(true);
		SessionStaff sessionStaff = (SessionStaff) session .getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		StaffInfo staffInfo = (StaffInfo) session .getAttribute(MDA.SESSION_KEY_LOGIN_USER);
		if (staffInfo != null) {// 如果集中会话中有用户信息
			if (sessionStaff != null) {// 如果本地也登录了用户信息
				if (ObjectUtils.toString(staffInfo.getStaffId()).equals( sessionStaff.getStaffId())) {// 如果本地和集中会话中用户信息相同
					boolean flag = oneAccountOneUser(session, response);
					if (!flag) {
						log.error("!!!!! sessionStaff and staffInfo are not equal One ");
					}
					return flag;
				} else {// 如果本地和集中会话中用户信息不相同
					SessionStaff newSessionStaff = new SessionStaff();
					copyStaffInfoAttr(staffInfo, newSessionStaff);
					initSessionStaff(newSessionStaff, session);
					boolean flag = oneAccountOneUser(session, response);
					if (!flag) {
						log.error("!!!!! sessionStaff and staffInfo are not equal Two");
					}
					return flag;
				}
			} else {// 如果本地没有用户登录信息，那么以集中会话的信息为准
				SessionStaff newSessionStaff = new SessionStaff();
				copyStaffInfoAttr(staffInfo, newSessionStaff);
				initSessionStaff(newSessionStaff, session);
				boolean flag = oneAccountOneUser(session, response);
				if (!flag) {
					log.error("!!!!! sessionStaff and staffInfo are not equal Three");
				}
				return flag;
			}
		} else {// 如果集中会话中没有用户信息，那么直接登录
			log.error("!!!!! staffInfo not found. id key is :" + session.getId());
			return false;
		}
	}

	/**
	 * 一个账户只允许一个用户使用。
	 * 
	 * @param session
	 * @param response
	 * @return
	 */
	private boolean oneAccountOneUser(HttpSession session, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) session .getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		String sessionId = (String) RedisUtil.get((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY),sessionStaff.getStaffId());
		if (StringUtils.isNotBlank(sessionId)&&!session.getId().equals(sessionId)) {
			log.error("!!!!! sessionId not equal. id key is :" + session.getId() + ", my sessionId is" + sessionId);
			response.setHeader(SESSION_CODE, String.valueOf(ResultConstant.SESSION_INVALID.getCode()));
			session.invalidate();
			return false;
		} else {
			return true;
		}
	}

	/**
	 * 将staffInfo中的属性copy到sessionStaff中
	 * 
	 * @param staffInfo
	 * @param sessionStaff
	 */
	private void copyStaffInfoAttr(StaffInfo staffInfo, SessionStaff sessionStaff) {
		sessionStaff.setStaffId(ObjectUtils.toString(staffInfo.getStaffId()));
		sessionStaff.setStaffCode(StringUtils.defaultString(staffInfo.getStaffCode()));
		sessionStaff.setStaffName(StringUtils.defaultString(staffInfo.getStaffName()));
		sessionStaff.setAreaId(ObjectUtils.toString(staffInfo .getCommonRegionId()));
		sessionStaff.setAreaCode(StringUtils.defaultString(staffInfo .getAreaCode()));
		sessionStaff.setRegionName(StringUtils.defaultString(staffInfo .getRegionName()));
		sessionStaff.setUpProvinName(StringUtils.defaultString(staffInfo.getUpProvinName()));
		sessionStaff.setCityName(StringUtils.defaultString(staffInfo.getCityName()));
		sessionStaff .setChannelId(ObjectUtils.toString(staffInfo.getChannelId()));
		sessionStaff.setChannelName(StringUtils.defaultString(staffInfo.getChannelName()));
		sessionStaff.setBindNumber(StringUtils.defaultString(staffInfo.getContactTele()));
		sessionStaff.setOrgId(ObjectUtils.toString(staffInfo.getOrgId()));
		sessionStaff.setOrgName(StringUtils.defaultString(staffInfo.getOrgName()));
		sessionStaff.setPartnerId(StringUtils.defaultString(staffInfo.getPartnerId()));
		sessionStaff.setPartnerCode(StringUtils.defaultString(staffInfo.getPartnerCode()));
		sessionStaff.setPartnerName(StringUtils.defaultString(staffInfo.getPartnerName()));
	}

	/**
	 * 将Map中的属性copy到sessionStaff中
	 * 
	 * @param staffInfo
	 * @param sessionStaff
	 */
	private SessionStaff copyMapAttr(Map staffInfoMap) {
		return SessionStaff.setStaffInfoFromMap(staffInfoMap);
	}

	/**
	 * 初始化session中用户信息
	 * 
	 * @param staffInfo
	 * @param session
	 */
	private void initSessionStaff(SessionStaff sessionStaff, HttpSession session) {
		// 取渠道信息
		// Map chanel_map = getChannelByStaff(sessionStaff, null);
		Map chanel_map = null;
		try {
			chanel_map = staffChannelBmo.qryCurrentChannelByStaff(sessionStaff,
					null);
		} catch (InterfaceException ie) {
		    ie.printStackTrace();
		} catch (Exception e) {
			log.error("门户/staff/login/loginValid方法异常", e);
		}
		sessionStaff.setCurrentChannelId(MapUtils.getString(chanel_map, "id",""));
		sessionStaff.setCurrentChannelName(MapUtils.getString(chanel_map,"name", ""));
		sessionStaff.setCurrentAreaId(MapUtils.getString(chanel_map, "areaId",""));
		sessionStaff.setCurrentAreaCode(MapUtils.getString(chanel_map,"zoneNumber", ""));
		sessionStaff.setCurrentAreaName(MapUtils.getString(chanel_map,"areaName", ""));
		sessionStaff.setCurrentAreaAllName(MapUtils.getString(chanel_map,"areaAllName", ""));
		sessionStaff.setOperatorsId(MapUtils.getString(chanel_map, "operatorsId", ""));
		sessionStaff.setCurrentChannelType(MapUtils.getString(chanel_map, "type", ""));
		//身份证类型开发
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		sessionStaff.setIdType(propertiesUtils.getMessage(SysConstant.IDTYPE+"-"+MapUtils.getString(chanel_map, "areaId","").substring(0,3)+"0000"));
		sessionStaff.setPoingtType(propertiesUtils.getMessage(SysConstant.POINGTTYPE+"-"+MapUtils.getString(chanel_map, "areaId","").substring(0,3)+"0000"));
		
		CommonMethods.setloginArea2BusinessArea(sessionStaff, null, true);
		
		// 存到session中
		session.setAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
		RedisUtil.set((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY),sessionStaff.getStaffId(),session.getId());
		session.setAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL,(List) chanel_map.get("channelList"));
		session.setAttribute(SysConstant.SESSION_KEY_PORTAL_TYPE, propertiesUtils.getMessage(SysConstant.APPDESC));
		session.setAttribute(SysConstant.SERVER_IP,CommonUtils.getSerAddrPart());

		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("staffId", sessionStaff.getStaffId());
		dataBusMap.put("platformCode", SysConstant.SM_PLATFORM_CODE);// 旧：dataBusMap.put("systemPlatformId",
												// 1);
		dataBusMap.put("areaId", sessionStaff.getAreaId());
		try {
			Map<String, Object> map = menuBmo.menuQryAll(dataBusMap, null,sessionStaff);
			session.setAttribute(SysConstant.SESSION_KEY_MENU_LIST,map.get("menuList"));
			session.setAttribute(SysConstant.SESSION_KEY_MENU_AUTH_URL_LIST, EhcacheUtil.getAuthUrlInMenuList(map.get("menuList")));
		} catch (Exception e) {
			log.error("加载菜单异常", e);
		}
	}
}

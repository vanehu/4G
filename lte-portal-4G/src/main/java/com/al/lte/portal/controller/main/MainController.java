package com.al.lte.portal.controller.main;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.FtpUtils;
import com.al.ecs.common.util.MD5Utils;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.QuestionBmo;
import com.al.lte.portal.bmo.portal.NoticeBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.CommonUtils;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;
import com.octo.captcha.service.CaptchaService;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.net.ftp.FTPClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.al.lte.portal.common.Base64;

/**
 * 登录后,首页控制器 . <BR>
 * TODO 要点概述.
 * <P>
 * 
 * @author tang zheng yu
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午3:29:40
 * @modifyDate tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Controller("com.al.lte.portal.controller.main.MainController")
@RequestMapping("/main/*")
@AuthorityValid(isCheck = false)
// 20130808 跳过校验 bxw
// @SessionValid(value = false)
public class MainController extends BaseController {

	@Autowired
	@Qualifier("com.al.ecs.portal.agent.bmo.portal.NoticeBmo")
	private NoticeBmo noticeBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.QuestionBmo")
	private QuestionBmo questionBmo;

	@Autowired
	PropertiesUtils propertiesUtils;

	private CaptchaService captchaService;

	@RequestMapping(value = "/home", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
	public String main(@RequestParam(value = "current", required = false, defaultValue = "home") String current,
			@RequestParam(value = "fromProvFlag", required = false, defaultValue = "0") String fromProvFlag,
			@RequestParam(value = "provIsale", required = false, defaultValue = "") String isale,
			@RequestParam(value = "provCustIdentityCd", required = false, defaultValue = "") String identityCd,
			@RequestParam(value = "provCustIdentityNum", required = false, defaultValue = "") String identityNum,
			@RequestParam(value = "provCustAreaId", required = false, defaultValue = "") String areaId, Model model,
			HttpSession session, HttpServletRequest request,HttpServletResponse resp) throws AuthorityException {
		model.addAttribute("current", "home");

		// 省份单点登录后，甩单到集团crm，使用带入的客户信息自动定位客户
		model.addAttribute("fromProvFlag", fromProvFlag);
		model.addAttribute("provIsale", isale);
		model.addAttribute("provIdentityCd", identityCd);
		model.addAttribute("provIdentityNum", identityNum);
		model.addAttribute("provAreaId", areaId);

		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		ServletUtils.removeSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_NUMBER + "_" + sessionStaff.getStaffId());
		ServletUtils.removeSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_TERMINAL + "_" + sessionStaff.getStaffId());
		ServletUtils.removeSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_AGREEMENT + "_" + sessionStaff.getStaffId());
		ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.IS_ACTION_FLAG_LIMITED);
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		dataBusMap.put("objCatgName", "recommendOffer,recommendTerminal,hotSaleOffer");
		if ("tokenLogin".equals(sessionStaff.getLogintype())) {
			return super.redirect("/staff/login/page");
		}
		String channelId = sessionStaff.getCurrentChannelId();
		if (channelId == null || channelId.equals("") || channelId.equals("null")) {
			dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
			dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
		} else {
			dataBusMap.put("areaId", sessionStaff.getAreaId());
			dataBusMap.put("channelId", sessionStaff.getChannelId());
		}

		Map<String, Object> param = new HashMap<String, Object>();
		param.put("areaId", sessionStaff.getCurrentAreaId());
		param.put("pageIndex", "1");
		param.put("pageSize", "10");
		Map<String, Object> reqMap = new HashMap<String, Object>();
		reqMap.put("staffId", sessionStaff.getStaffId());
		param.put("reqInfo", reqMap);

		ServletUtils.setSessionAttribute(request, SysConstant.QRCODE_SWITH,
				CommonUtils.getSwithFromMDA(sessionStaff.getAreaId().substring(0, 3), "QRCODE_LOGIN_SWITCH"));
		ServletUtils.setSessionAttribute(request, SysConstant.BIND_STATUS, "N");
		String CARD_NEW_DLL = propertiesUtils.getMessage(SysConstant.CARD_NEW_DLL);
		model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "order/prepare"));
		model.addAttribute("DiffPlaceFlag", "local");
		model.addAttribute("writeCardNewDLL", CARD_NEW_DLL);
		if (null == sessionStaff.getHintCode() || "".equals(sessionStaff.getHintCode())) {
			model.addAttribute("hintCode", "0");
		} else {
			model.addAttribute("hintCode", sessionStaff.getHintCode());
		}
		
		//2017-08-31设置开关cookies值
		//X周岁以下办理任何电信业务，必须填写经办人,增加全国级开关，非分省
				String nowAreaId = sessionStaff.getAreaId();
				Cookie cookieLessS = new Cookie("switchC",com.al.ecs.common.util.MDA.LESS_THAN_SEVENTEEN);
				cookieLessS.setMaxAge(60*60*24);
				cookieLessS.setPath("/");
				resp.addCookie(cookieLessS);
				//经办人必须是Y周岁以上的成年人,增加分省开关
				for (Map.Entry<String, String> entry : com.al.ecs.common.util.MDA.LESS_THAN_EIGHT.entrySet()) {  
					System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue()); 
					String less= "LESS_THAN_EIGHT_"+nowAreaId.substring(0, 3);
					if((entry.getKey()).toString().equals(less)){
						String value1 = entry.getValue();
						Cookie cookieLessE = new Cookie("switchE",value1);
						cookieLessE.setMaxAge(60*60*24);
						cookieLessE.setPath("/");
						resp.addCookie(cookieLessE);
						break;
					}
				 } 
				//现有的军人身份证件、武装警察身份证件不能作为实名登记有效证件，不允许新增客户,增加全国级开关，非分省
				Cookie cookieLessSP = new Cookie("switchSP",com.al.ecs.common.util.MDA.CHECK_SOLDIER_POLICE);
				cookieLessS.setMaxAge(60*60*24);
				cookieLessS.setPath("/");
				resp.addCookie(cookieLessSP);
				
				//户口簿仅限于16周岁以下的人员使用,增加全国级开关，非分省。
				Cookie cookieLessSIX = new Cookie("switchSIX",com.al.ecs.common.util.MDA.LESS_THAN_SIX);
				cookieLessSIX.setMaxAge(60*60*24);
				cookieLessSIX.setPath("/");
				resp.addCookie(cookieLessSIX);
				
				//外国人居住证，要求读卡
				Cookie cookieLessFOR = new Cookie("switchFOR",com.al.ecs.common.util.MDA.FOREGIN_LIVE);
				cookieLessSIX.setMaxAge(60*60*24);
				cookieLessSIX.setPath("/");
				resp.addCookie(cookieLessFOR);
				
				Map<String,Object> newMap = new HashMap();
				newMap.put("areaId", sessionStaff.getAreaId());
				newMap.put("queryType", "3");
				newMap.put("typeClass", "18");
				DataBus db;
				try {
					db = InterfaceClient.callService(newMap, PortalServiceCode.REAL_NAME_SERVICE, "", sessionStaff);
					Map<String, Object> mapOne = db.getReturnlmap();
					if(((List)((Map)mapOne.get("result")).get("soConstConfigs")).size()!= 0){
						String valueE = (String)((Map)((List)((Map)mapOne.get("result")).get("soConstConfigs")).get(0)).get("value");
						Cookie ageE = new Cookie("ageE",valueE);
						cookieLessSIX.setMaxAge(60*60*24);
						cookieLessSIX.setPath("/");
						resp.addCookie(ageE);
						request.getSession().setAttribute("valueAgeE", valueE);
						//17岁
						newMap.put("typeClass", "17");
						db = InterfaceClient.callService(newMap, PortalServiceCode.REAL_NAME_SERVICE, "", sessionStaff);
						Map<String, Object> mapTwo = db.getReturnlmap();
						String valueS = (String)((Map)((List)((Map)mapTwo.get("result")).get("soConstConfigs")).get(0)).get("value");
						Cookie ageS = new Cookie("ageS",valueS);
						cookieLessSIX.setMaxAge(60*60*24);
						cookieLessSIX.setPath("/");
						resp.addCookie(ageS);
						request.getSession().setAttribute("valueAgeS", valueS);
					}
				} catch (InterfaceException e2) {
					e2.printStackTrace();
				} catch (IOException e2) {
					e2.printStackTrace();
				} catch (Exception e2) {
					e2.printStackTrace();
				}
				

		// 查询是否有问卷调查这个菜单
		try {
			String question_menu = staffBmo.checkOperatBySpecCd(SysConstant.QUESTION_MUNE, sessionStaff);
			// 表示有问卷菜单的访问权限
			if ("0".equals(question_menu)) {
				if (SysConstant.ON.equals(MDA.IS_QUESTION_MENU)) {
					// 查询用户答题的状态
					String system_id = SysConstant.QESTION_SYS_ID;
					SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
					java.util.Date date = new java.util.Date();
					String timestamp = sdf.format(date);
					String token = Base64.encode(MD5Utils.encode(system_id + timestamp + MDA.QESTION_KEY).getBytes());

					Map<String, Object> userList = new HashMap<String, Object>();
					Map<String, Object> paramMap = new HashMap<String, Object>();
					param.put("staff_code", sessionStaff.getStaffCode());
					param.put("system_id", system_id);
					param.put("timestamp", timestamp);
					param.put("token", token);

					userList = questionBmo.queryStaff(param, sessionStaff);
					// 此处0表示用户需要进行答题
					if ("0".equals(userList.get("state").toString())) {
						model.addAttribute("isQuestion", "0");
					} else {
						// 表示用户已经答题或者不需要答题
						model.addAttribute("isQuestion", "1");
					}

				} else {
					model.addAttribute("isQuestion", "2");
				}

			} else {
				// 表示系统可能出现其他问题，无需提示
				model.addAttribute("isQuestion", "1");
			}
		} catch (BusinessException e1) {
			e1.printStackTrace();
		} catch (InterfaceException e1) {
			e1.printStackTrace();
		} catch (IOException e1) {
			e1.printStackTrace();
		} catch (Exception e1) {
			e1.printStackTrace();
		}

		String currentAreaId = sessionStaff.getCurrentAreaId();
		model.addAttribute("XUA", propertiesUtils.getMessage("XUA_"
				+ ((currentAreaId != null && currentAreaId.length() == 7) ? currentAreaId.substring(0, 3) : "")));

		// 加载权限
		try {
			CommonMethods.getInstance().initStaffAllPrivileges(staffBmo, sessionStaff);
		} catch (Exception e) {
			log.error("系管权限查询接口queryPrivilegeInfos异常：", e);
		} finally {
			ServletUtils.setSessionAttribute(request, SysConstant.RXSHGN,
					sessionStaff.isHasOperatSpecCd(SysConstant.RXSHGN));
			ServletUtils
					.setSessionAttribute(super.getRequest(), SysConstant.PHOTOGRAPH_REVIEW_FLAG,
							MapUtils.getString(MDA.PHOTOGRAPH_REVIEW_FLAG,
									"PHOTOGRAPH_REVIEW_"
											+ StringUtils.substring(new String(sessionStaff.getCurrentAreaId()), 0, 3),
									""));
		}

		// 测试卡权限
		String specialtestauth = sessionStaff.isHasOperatSpecCd(SysConstant.SPECIALTESTQX) ? "0" : "-1";
		// 党政军备案卡权限
		String dzjbakqx = sessionStaff.isHasOperatSpecCd(SysConstant.DZJBAKQX) ? "0" : "-1";

		model.addAttribute("specialtestauth", specialtestauth);
		model.addAttribute("dzjbakqx", dzjbakqx);
		return "/main/main";
	}

	@RequestMapping(value = "/limit", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
	public String limit(@RequestParam(value = "current", required = false, defaultValue = "home") String current,
			Model model, HttpServletRequest request) throws AuthorityException {
		if (request.getParameter("current") != null && !request.getParameter("current").equals("")) {
			model.addAttribute("current", request.getParameter("current"));
		} else {
			model.addAttribute("current", "home");
		}
		return "/main/main-limit";
	}

	@RequestMapping(value = "/head_nav", method = RequestMethod.GET)
	public String head_nav(HttpSession session, HttpServletRequest request, Model model,
			@RequestParam(value = "current", required = false, defaultValue = "home") String current) {
		model.addAttribute("current", current);
		return "/main-header-nav";
	}

	/**
	 * 公告查询（三种方式：首页置顶，公告检索，公告详情）
	 * 
	 * @param session
	 * @param model
	 * @param params
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/notice", method = RequestMethod.POST)
	public String notice(HttpSession session, Model model, @RequestBody Map<String, Object> params) {

		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);

		String areaId = MapUtils.getString(params, "areaId", "");
		if ("".equals(areaId)) {
			params.put("areaId", sessionStaff.getCurrentAreaId());
		}
		String queryType = MapUtils.getString(params, "queryType", "");// 查询方式

		try {
			Map<String, Object> resultMap = noticeBmo.getNoticeList_WEB(params, null, sessionStaff);
			if (ResultCode.R_SUCC.equals(MapUtils.getString(resultMap, "resultCode", ResultCode.R_FAIL))) {
				List<Map<String, Object>> noticeList = (List<Map<String, Object>>) resultMap.get("result");
				if (noticeList != null && noticeList.size() > 0) {
					// 查询公告详情
					if ("detail".equals(queryType)) {
						model.addAttribute("bulletinName", noticeList.get(0).get("bulletinName"));
						model.addAttribute("createDate", noticeList.get(0).get("createDate"));
						model.addAttribute("issuer",
								noticeList.get(0).get("issuerName") + "(" + noticeList.get(0).get("issuer") + ")");
						model.addAttribute("bulletinText", noticeList.get(0).get("bulletinText"));
						if (noticeList.get(0).get("attachs") != null) {
							List<Map<String, Object>> attachslist = (List<Map<String, Object>>) noticeList.get(0)
									.get("attachs");
							model.addAttribute("name", attachslist.get(0).get("name"));
							// String notice_url =
							// propertiesUtils.getMessage(SysConstant.NOTICE_URL);
							String notice_url = (String) attachslist.get(0).get("noticeurl");
							notice_url = notice_url + "," + attachslist.get(0).get("name");
							model.addAttribute("noticeurl",
									AESUtils.encryptToString(notice_url, SysConstant.BLACK_USER_URL_PWD));
						}
					}
					// 查询首页置顶公告
					else if ("focus".equals(queryType)) {
						// 抽取最新的弹窗公告
						for (Map<String, Object> notice : noticeList) {
							if ("Y".equals(MapUtils.getString(notice, "popNotice", "N"))) {
								model.addAttribute("popNotice", notice);
								break;
							}
						}
						model.addAttribute("noticeList", noticeList);
					}
					// 查询所有上架公告（公告检索）
					else if ("list".equals(queryType)) {
						Map<String, Object> page = MapUtils.getMap(resultMap, "page", new HashMap<String, Object>());
						int pageNo = MapUtils.getInteger(page, "pageIndex", 1);
						int pageSize = MapUtils.getInteger(page, "pageSize", 12);
						int totalRecords = MapUtils.getInteger(page, "totalCount", 12);
						PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, pageSize,
								totalRecords < 1 ? 1 : totalRecords, noticeList);
						model.addAttribute("pageModel", pm);
					}
				}
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, params, ErrorCode.BULLET_IN_INFO);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.BULLET_IN_INFO, e, params);
		}
		if ("focus".equals(queryType)) {
			return "/main/main-notice";// 首页置顶公告
		} else if ("list".equals(queryType)) {
			return "/main/notice-list";// 公告检索
		} else {
			return "/main/notice-detail";// 公告详情
		}
	}

	/**
	 * 公告附件下载
	 * 
	 * @param response
	 * @param model
	 * @param params
	 * @return
	 */
	@RequestMapping(value = "/downloadNoticeAttach", method = { RequestMethod.POST })
	@ResponseBody
	public JsonResponse downloadFile(Model model, @RequestParam("param") String fileUrl, HttpServletResponse response)
			throws IOException {

		try {
			FtpUtils ftpUtils = new FtpUtils();
			// 解密url
			fileUrl = AESUtils.decryptToString(fileUrl, SysConstant.BLACK_USER_URL_PWD);
			String[] fileUrls = fileUrl.split(",");
			String filePath = fileUrls[0];
			String fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
			filePath = filePath.substring(0, filePath.lastIndexOf("/") + 1);

			String downName = fileUrls[1];

			// 2.获取FTP服务器的具体登录信息
			// 3.根据服务器映射获取对应的FTP服务器配置信息
			String ftpServiceConfig = MDA.NOTICE_FTP_SERVICE_CONFIGS;
			String[] ftpServiceConfigs = ftpServiceConfig.split(",");
			String remoteAddress = ftpServiceConfigs[0];// FTP服务器地址(IP)
			String remotePort = ftpServiceConfigs[1];// FTP服务器端口
			String userName = ftpServiceConfigs[2];// FTP服务器用户名
			String password = ftpServiceConfigs[3];// FTP服务器密码

			ftpUtils.connectFTPServer(remoteAddress, remotePort, userName, password);
			String path = filePath + new String(fileName.getBytes(), FTPClient.DEFAULT_CONTROL_ENCODING);
			boolean isFileExist = ftpUtils.isFileExist(path);
			if (isFileExist) {
				ServletOutputStream outputStream = response.getOutputStream();
				response.addHeader("Content-Disposition",
						"attachment;filename=" + new String(downName.getBytes("gb2312"), "ISO8859-1"));
				response.setContentType("application/binary;charset=utf-8");
				ftpUtils.downloadFileByPath(outputStream, filePath + fileName);
				return super.successed("下载成功！");
			} else {
				return super.failed("下载文件不存在，请联系管理员。", ResultConstant.FAILD.getCode());
			}
		} catch (Exception e) {
			return super.failed("下载文件异常：<br/>" + e, ResultConstant.FAILD.getCode());
		}
	}

	// /**
	// * 取得滚动时间
	// * @param model
	// * @param flowNum
	// * @param sessionStaff
	// */
	// private void getApConfigMap(Model model, String flowNum,
	// SessionStaff sessionStaff) {
	// String tableName = "SYSTEM";
	// String columnItem = "NOITIC_INTERVAL_TIME";
	// List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
	// try {
	// Object obj =
	// DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItem);
	// if (obj != null && obj instanceof List) {
	// rList = (List<Map<String, Object>>) obj;
	// } else {
	// Map<String, Object> pMap = new HashMap<String, Object>();
	// pMap.put("tableName", tableName);
	// pMap.put("columnName", columnItem);
	// rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap,
	// flowNum, sessionStaff).get("result");
	// DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItem,
	// rList);
	// }
	// ArrayList<Map<String, Object>> al =
	// (ArrayList)rList.get(0).get("NOITIC_INTERVAL_TIME");
	// model.addAttribute("intervalTime", al.get(0).get("COLUMN_VALUE"));
	// } catch (BusinessException e) {
	// this.log.error("查询配置信息服务出错", e);
	// } catch (InterfaceException ie) {
	//
	// } catch (Exception e) {
	//
	// }
	// }

	// 验证码验证
	@RequestMapping(value = "/checkVerificationcode", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse checkVerificationcode(HttpServletRequest request, HttpServletResponse response,
			HttpSession httpSession) {
		JsonResponse jsonResponse = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			captchaService = (CaptchaService) SpringContextUtil.getBean("captchaService");
			String captchaID = (String) request.getSession().getAttribute("_captcha_session_id");
			request.getSession().removeAttribute("_captcha_session_id");
			String challengeResponse = request.getParameter("validatecode");
			Boolean flag = captchaService.validateResponseForID(captchaID, challengeResponse);
			if (flag) {
				httpSession.removeAttribute(sessionStaff.getStaffCode() + "custtime");
				httpSession.removeAttribute(sessionStaff.getStaffCode() + "custcount");
				httpSession.removeAttribute(sessionStaff.getStaffCode() + "nbrtime");
				httpSession.removeAttribute(sessionStaff.getStaffCode() + "nbrcount");
				httpSession.removeAttribute(sessionStaff.getStaffCode() + "reservenumbertime");
				httpSession.removeAttribute(sessionStaff.getStaffCode() + "reservenumbercount");
				jsonResponse = super.successed("0", ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.successed("1", ResultConstant.FAILD.getCode());
			}
		} catch (Exception e) {
			log.error("门户/main/checkVerificationcode服务验证异常", e);
		}
		return jsonResponse;
	}

	/**
	 * “公告检索”页面入口
	 */
	@RequestMapping(value = "/noticeSearchEntrance", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
	public String noticeSearchEntrance(Model model) {

		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);

		String defaultAreaId = sessionStaff.getCurrentAreaId();
		String defaultAreaName = sessionStaff.getCurrentAreaAllName();

		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String defaultEndDate = f.format(c.getTime());
		c.add(Calendar.DATE, -1);
		String defaultBeginDate = f.format(c.getTime());

		model.addAttribute("defaultAreaId", defaultAreaId);
		model.addAttribute("defaultAreaName", defaultAreaName);
		model.addAttribute("defaultBeginDate", defaultBeginDate);
		model.addAttribute("defaultEndDate", defaultEndDate);

		return "/main/notice-search";
	}

	/**
	 * “操作手册”页面入口
	 */
	@RequestMapping(value = "/manualSearchEntrance", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
	public String manualSearchEntrance(Model model) {

		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String defaultEndDate = f.format(c.getTime());
		c.add(Calendar.DATE, -1);
		String defaultBeginDate = f.format(c.getTime());

		model.addAttribute("defaultBeginDate", defaultBeginDate);
		model.addAttribute("defaultEndDate", defaultEndDate);

		return "/main/manual-search";
	}

	/**
	 * 查询操作手册列表
	 * 
	 * @param params
	 * @param model
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryManualList", method = RequestMethod.POST)
	public String queryManualList(@RequestBody Map<String, Object> params, Model model) {

		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);

		try {
			params.put("areaId", sessionStaff.getCurrentAreaId());
			Map<String, Object> resultMap = noticeBmo.getManualList(params, null, sessionStaff);
			if (ResultCode.R_SUCC.equals(MapUtils.getString(resultMap, "resultCode", ResultCode.R_FAIL))) {
				List<Map<String, Object>> resultList = (List<Map<String, Object>>) resultMap.get("result");
				if (resultList != null && resultList.size() > 0) {
					Map<String, Object> page = MapUtils.getMap(resultMap, "page", new HashMap<String, Object>());
					int pageNo = MapUtils.getInteger(page, "pageIndex", 1);
					int pageSize = MapUtils.getInteger(page, "pageSize", 12);
					int totalRecords = MapUtils.getInteger(page, "totalCount", 12);

					List<Map<String, Object>> manualList = new ArrayList<Map<String, Object>>();
					String manual_url = propertiesUtils.getMessage(SysConstant.MANUAL_URL);
					for (Map<String, Object> manualInfo : resultList) {
						String attachmentUrl = manual_url + MapUtils.getString(manualInfo, "attachmentId", "");
						manualInfo.put("attachmentUrl", attachmentUrl);
						manualList.add(manualInfo);
					}
					PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, pageSize,
							totalRecords < 1 ? 1 : totalRecords, manualList);
					model.addAttribute("pageModel", pm);
				}
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, params, ErrorCode.BULLET_IN_INFO);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.BULLET_IN_INFO, e, params);
		}
		return "/main/manual-list";
	}

}

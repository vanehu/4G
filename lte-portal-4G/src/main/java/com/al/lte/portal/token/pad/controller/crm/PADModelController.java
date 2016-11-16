package com.al.lte.portal.token.pad.controller.crm;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.TokenBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.staff.StaffChannelBmo;
import com.al.lte.portal.bmo.system.MenuBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.CommonUtils;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalUtils;
import com.al.lte.portal.common.RedisUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;
import com.al.lte.portal.common.StringUtil;

@Controller("com.al.lte.portal.token.pad.controller.crm.PADModelController")
@RequestMapping("/mode/pad")
public class PADModelController extends BaseController {
	private static Logger log = LoggerFactory.getLogger(PADModelController.class.getName());
	
	@Resource(name = "com.al.lte.portal.bmo.crm.TokenBmoImpl")
	private TokenBmo tokenBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffChannelBmo")
	private StaffChannelBmo staffChannelBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.system.MenuBmo")
	private MenuBmo menuBmo;

	@SuppressWarnings("unchecked")
	@RequestMapping
	public String index(HttpServletRequest request,HttpServletResponse response,Model model){
		Map<String,Object> resultMap = new HashMap<String,Object>();
		try{			
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			String accessToken = request.getParameter("accessToken");//获取到的凭证		
			String params = request.getParameter("params");//json参数集合	
			log.error("获取的令牌："+accessToken);
			log.error("获取的参数集："+params);
			if(StringUtil.isEmptyStr(accessToken)){					
				model.addAttribute("errorMsg", "token丢失，请重新获取。");		
				return "/common/error";
			}
			if(StringUtil.isEmptyStr(params)){
				model.addAttribute("errorMsg", "参数集合为空");
				return "/common/error";
			}
			String tokenKey = MySimulateData.getInstance().getParam("TOKENKEY",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"token.key");//令牌key
			log.error("令牌key："+tokenKey);
			String jmAccessToken = AESUtils.decryptToString(accessToken, tokenKey);
			if(StringUtil.isEmptyStr(jmAccessToken)){				
				model.addAttribute("errorMsg", "令牌信息解密异常");
				return "/common/error";
			}
			String[] accessTokenStr = jmAccessToken.split("#");
			if(accessTokenStr.length != 3){
				model.addAttribute("errorMsg", "令牌信息异常");
				return "/common/error";
			}	
			
			Map<String,Object> paramMap = new HashMap<String,Object>();
			paramMap.put("accessToken", accessToken);
			paramMap.put("staffCode", accessTokenStr[0]);
			paramMap.put("areaId", accessTokenStr[1]);
			paramMap.put("randowCode", accessTokenStr[2]);
			log.error("令牌校验参数："+paramMap.toString());
			resultMap = tokenBmo.QueryAccessToken(paramMap, null, sessionStaff);
			log.error("令牌校验结果："+resultMap.toString());
			if(!ResultCode.R_SUCCESS.equals(resultMap.get("resultCode"))){			
				model.addAttribute("errorMsg", resultMap.get("resultMsg"));
				return "/common/error";
			}
			String staffCode = String.valueOf(resultMap.get("staffCode"));
			String areaId = String.valueOf(resultMap.get("areaId"));
			String provinceCode = String.valueOf(resultMap.get("provinceCode"));
			String channelCode = String.valueOf(resultMap.get("channelCode"));	
			Map<String,Object> staffInfo = staffBmo.queryStaffByStaffCode4Login(staffCode, areaId);
			log.error("获取员工信息："+staffInfo.toString());
			if(staffInfo.get("resultCode") != null){				
				model.addAttribute("errorMsg", "获取员工信息异常");
				return "/common/error";
			}
			staffInfo.put("accessToken", accessToken);
			staffInfo.put("staffProvCode", provinceCode);
			staffInfo.put("channelId", channelCode);
			sessionStaff = SessionStaff.setStaffInfoFromMap(staffInfo);		
			initSessionStaff(sessionStaff, request.getSession());
			
			String privateKey = MySimulateData.getInstance().getParam("token."+provinceCode+".key",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"token."+provinceCode+".key");
			log.error("省份私钥："+privateKey);
			if(StringUtil.isEmptyStr(privateKey)){		
				model.addAttribute("errorMsg", "私钥为空");
				return "/common/error";
			}
			String jmParams = AESUtils.decryptToString(params, privateKey);
			if(StringUtil.isEmptyStr(jmParams)){			
				model.addAttribute("errorMsg", "参数解密异常");
				return "/common/error";
			}
			Map<String,Object> paramsMap = JsonUtil.toObject(jmParams, HashMap.class);
			if(paramsMap == null || paramsMap.size() <= 0){		
				model.addAttribute("errorMsg", "参数解析异常");
				return "/common/error";
			}
			log.error("解析后的参数集："+paramsMap.toString());
			String mainProdOfferId = String.valueOf(paramsMap.get("mainProdOfferId"));//主套餐内部ID 对应Ext_Prod_Offer_Id
			if(!StringUtil.isEmptyStr(mainProdOfferId)){	
				Map<String,Object> offerMap = new HashMap<String,Object>();
				offerMap.put("areaId", areaId);
				offerMap.put("extProdOfferId", mainProdOfferId);
				log.error("销售品转换参数："+offerMap.toString());
				Map<String,Object> changeMap = offerBmo.prodOfferChange(offerMap, null, sessionStaff);
				log.error("销售品转换结果："+changeMap.toString());
				if(changeMap != null && changeMap.size() <= 0){
					model.addAttribute("errorMsg", "销售品编码转换异常");
					return "/common/error";
				}
				if(!ResultCode.R_SUCCESS.equals(String.valueOf(changeMap.get("code")))){
					model.addAttribute("errorMsg", "销售品编码转换失败");
					return "/common/error";
				}
				List<Map<String, Object>> resultList = (List<Map<String, Object>>) changeMap.get("result");
				if(resultList == null || resultList.size() <= 0){
					model.addAttribute("errorMsg", "销售品编码转换结果为空");
					return "/common/error";
				}				
				paramsMap.put("prodOfferId", resultList.get(0).get("prodOfferId"));
				paramsMap.put("offerNbr", resultList.get(0).get("offerNbr"));
				paramsMap.put("prodOfferName", resultList.get(0).get("prodOfferName"));								
			}
			String actionFlag = String.valueOf(paramsMap.get("actionFlag"));//业务类型
			if(StringUtil.isEmptyStr(actionFlag)){	
				model.addAttribute("errorMsg", "业务类型为空");
				return "/common/error";
			}
			String provIsale = String.valueOf(paramsMap.get("provIsale"));//单点登录流水
			if(StringUtil.isEmptyStr(provIsale)){	
				model.addAttribute("errorMsg", "省份业务流水为空");
				return "/common/error";
			}
			String redirectUri = String.valueOf(paramsMap.get("redirectUri"));//回调URL地址
			if(!StringUtil.isEmptyStr(redirectUri)){
				request.getSession().setAttribute("PAD.BACKURI"+provIsale,redirectUri);
			}		
			
			//获取客户端编码redmine979958
			HttpSession session = request.getSession();
			session.setAttribute(SysConstant.SESSION_CLIENTCODE+"_PAD", null);//清空session中该节点
			List<Map<String, Object>> attrList = new ArrayList<Map<String, Object>>();
			if(paramsMap.get("attrInfos")!=null){
				 Object obj = paramsMap.get("attrInfos");
                 if (obj instanceof List) {
                	 attrList = (List<Map<String, Object>>) obj;
                 } else {
                	 attrList = new ArrayList<Map<String, Object>>();
                	 attrList.add((Map<String, Object>) obj);
                 }
                 for(Map<String, Object> mapAttr : attrList){
                	 if(SysConstant.CLIENTCODE.equals(String.valueOf(mapAttr.get("attrSpecId"))) && !StringUtil.isEmptyStr(String.valueOf(mapAttr.get("attrValue")))){
                		 session.setAttribute(SysConstant.SESSION_CLIENTCODE+"_PAD", String.valueOf(mapAttr.get("attrValue")));
                	 }else if(SysConstant.CLIENTCODE.equals(String.valueOf(mapAttr.get("AttrSpecId"))) && !StringUtil.isEmptyStr(String.valueOf(mapAttr.get("AttrValue")))){
                		 session.setAttribute(SysConstant.SESSION_CLIENTCODE+"_PAD", String.valueOf(mapAttr.get("AttrValue")));//兼顾省份传大写
                	 }
                 }
			}
			
			String modelUrl = MySimulateData.getInstance().getParam("pad."+actionFlag+".url",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"pad."+actionFlag+".url");//业务跳转地址
			log.error("业务跳转地址："+modelUrl);
			if(StringUtil.isEmptyStr(modelUrl)){	
				model.addAttribute("errorMsg", "业务跳转地址为空");
				return "/common/error";
			}
			String commonParamKey = MySimulateData.getInstance().getParam("COMMON_PARAM_KEY",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");//公共参数加密KEY
			log.error("公共参数加密KEY："+commonParamKey);
			StringBuilder strb = new StringBuilder();
			strb.append("?params="+ AESUtils.encryptToString(JsonUtil.toString(paramsMap), commonParamKey)).append("&accessToken="+accessToken);
			modelUrl = (new StringBuilder(String.valueOf(modelUrl))).append(strb.toString()).toString();
			log.error("回调地址："+modelUrl);
			
			String dbKeyWord = (String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
			String flag = MySimulateData.getInstance().getParam("UNIFYLOGIN",dbKeyWord,"UNIFYLOGIN");
			int port = request.getLocalPort();
			log.warn("服务端口[LocalPort]："+port);
			// Host:crm.189.cn:83 Host:mo.crm.189.cn:93 Host:10.128.86.10:8101
			String headerHost = request.getHeader(SysConstant.HTTP_REQUEST_HEADER_HOST);
			
			if(PortalUtils.isSecondLevelDomain(headerHost)){
				//#591478 若启用分省域名，应重定向到*.crm.189.cn:port
				return super.redirect("https://" + headerHost + "/provPortal" + modelUrl);
			} else{
				//否则，走原来的老逻辑
				if((port==10101 || port==10102 || port==10103) && "ON".equals(flag)){
					return super.redirect("https://crm.189.cn:83/provPortal"+modelUrl);
				}else if((port==10151 || port==10152 || port==10153) && "ON".equals(flag)){
					return super.redirect("https://crm.189.cn:84/provPortal"+modelUrl);
				}else{
					return super.redirect(modelUrl);
				}			
			}
		}catch(Exception ex){
			log.error("PAD单点页面集成接口异常:",ex);
			model.addAttribute("errorMsg", "服务异常。");
			return "/common/error";
		}		
	}

	@SuppressWarnings("unchecked")
	public void initSessionStaff(SessionStaff sessionStaff, HttpSession session) {
		// 取渠道信息
		// Map chanelMap = getChannelByStaff(sessionStaff, null);
		Map<String,Object> chanelMap = null;
		try {
			chanelMap = staffChannelBmo.qryCurrentChannelByStaff(sessionStaff,"NL");
		} catch (InterfaceException ie) {
		    ie.printStackTrace();
		} catch (Exception e) {
			log.error("门户/staff/login/loginValid方法异常", e);
		}
		sessionStaff.setCurrentChannelId(MapUtils.getString(chanelMap, "id",""));
		sessionStaff.setCurrentChannelName(MapUtils.getString(chanelMap,"name", ""));
		sessionStaff.setCurrentAreaId(MapUtils.getString(chanelMap, "areaId",""));
		sessionStaff.setCurrentAreaCode(MapUtils.getString(chanelMap,"zoneNumber", ""));
		sessionStaff.setCurrentAreaName(MapUtils.getString(chanelMap,"areaName", ""));
		sessionStaff.setCurrentAreaAllName(MapUtils.getString(chanelMap,"areaAllName", ""));
		sessionStaff.setOperatorsId(MapUtils.getString(chanelMap, "operatorsId", ""));
		//渠道大类
	    sessionStaff.setCurrentChannelType(MapUtils.getString(chanelMap, "type", ""));
		// 存到session中
		session.setAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
		RedisUtil.set((String) session.getAttribute(SysConstant.SESSION_DATASOURCE_KEY),sessionStaff.getStaffId(),session.getId());
		session.setAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL,(List<Map<String,Object>>) chanelMap.get("channelList"));
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
	
	@RequestMapping("/backProvince")
	@ResponseBody
	public JsonResponse backProvince(HttpServletRequest request,HttpServletResponse response,@RequestParam Map<String, Object> paramMap, Model model){
		JsonResponse jr = new JsonResponse();		
		try{
			String provIsale = String.valueOf(paramMap.get("provIsale"));//省内订单流水号	
			String extCustOrderID = String.valueOf(paramMap.get("extCustOrderID"));//集团订单流水号
			String resultCode = String.valueOf(paramMap.get("resultCode"));//受理结果
			String redirectUri = String.valueOf(paramMap.get("redirectUri"));//回调地址		
			if(StringUtil.isEmptyStr(provIsale)){
				jr = failed("省内订单流水号为空！", 1);				
				return jr;
			}
			if(StringUtil.isEmptyStr(extCustOrderID)){
				jr = failed("集团订单流水号为空！", 1);				
				return jr;				
			}
			if(StringUtil.isEmptyStr(resultCode)){
				jr = failed("受理结果为空！", 1);				
				return jr;				
			}
			if(StringUtil.isEmptyStr(redirectUri)){
				jr = failed("回调地址为空！", 1);				
				return jr;				
			}
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			if(sessionStaff != null){
				String provinceCode = sessionStaff.getProvinceCode();
				if(StringUtil.isEmptyStr(provinceCode)){
					jr = failed("省份编码为空！", 1);				
					return jr;					
				}
				String backUrl = MySimulateData.getInstance().getParam("pad.uri."+provinceCode,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"pad.uri."+provinceCode);//省份回调地址
				if(StringUtil.isEmptyStr(backUrl)){
					jr = failed("省份回调地址未配置！", 1);				
					return jr;					
				}	
				
				//如果库中存在多个回调地址时
				String urls[]=backUrl.split(",");
				
				String domainName=GetDomainName(redirectUri);
				
				if(StringUtil.isEmptyStr(domainName)){
					jr = failed("回调地址格式错误", 1);				
					return jr;				
				}
				
				boolean isRight=false;
				
				if(urls!=null && urls.length>0){
					if(sessionStaff.getCurrentAreaId() !=null && 
							!SysConstant.ON.equals(propertiesUtils.getMessage("ISCALLBACK_"+sessionStaff.getCurrentAreaId().substring(0, 3)))){
						isRight=true;
					}else {
						if(urls.length==1){
							isRight=urls[0].equals(domainName);
						}else{
							for(String url:urls){
								if(url.equals(domainName)){
									isRight=true;
									break;
								}
							}
						}
					}
				}else{
					jr = failed("省份回调地址未配置！", 1);				
					return jr;
				}
				
				if(isRight){
					Map<String,Object> map = new HashMap<String,Object>();
					map.put("provIsale", provIsale);
					map.put("extCustOrderID", extCustOrderID);
					map.put("resultCode", resultCode);
					String privateKey = MySimulateData.getInstance().getParam("token."+provinceCode+".key",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"token."+provinceCode+".key");
					String params = AESUtils.encryptToString(JacksonUtil.objectToJson(map), privateKey);
					String[] urlSplit = redirectUri.split("[?]");
					if(urlSplit.length > 1){//带参数
						jr = successed(redirectUri+"&params="+params, 0);
					}else{
						jr = successed(redirectUri+"?params="+params, 0);
					}
				}else{
					jr = failed("回调地址不一致！", 1);				
					return jr;				
				}
			}else{
				jr = failed("用户信息丢失！", 1);				
				return jr;				
			}
		}catch(Exception ex){		
			log.error("PAD回调省份页面异常:",ex);
			jr = failed("PAD回调省份页面异常！", 1);				
			return jr;	
		}
		return jr;
	}
	
	public static String GetDomainName(String url){
		try {
			if (url == null){
				return "";
			}
			URL newUrl = new URL(url);
			return newUrl.getHost();		
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			log.error("域名解析异常",e);
			return "";
		} 
   }
	
	public static void main(String[] args) {
		Map<String,Object> map = new HashMap<String,Object>();
		map.put("provIsale", "1111111111");
		map.put("extCustOrderID", "222222222222222");
		map.put("resultCode", "0");
		String commonParamKey = "KEY@COMMON#$3YT";//公共参数加密KEY
		String params = AESUtils.encryptToString(JacksonUtil.objectToJson(map), commonParamKey);
		System.out.println("http://localhost:8090/ltePortal/test/getProvincePage?params="+params);
	}
}

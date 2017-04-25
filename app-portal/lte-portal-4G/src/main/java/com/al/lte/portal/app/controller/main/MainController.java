package com.al.lte.portal.app.controller.main;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONArray;

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

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.Switch;
import com.al.ecs.common.util.FtpUtils;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.annotation.session.SessionValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.portal.NoticeBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 登录后,首页控制器 .
 * <BR>
 *  TODO 要点概述.
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午3:29:40
 * @modifyDate	 tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Controller("com.al.lte.portal.app.controller.main")
@RequestMapping("/app/main/*")
@AuthorityValid(isCheck = false)
public class MainController extends BaseController {
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;
	
	@LogOperatorAnn(switchs = Switch.OFF)
	@RequestMapping(value = "/common", method = RequestMethod.GET)
	public String padlogin(HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response) {
		model.addAttribute("menu", request.getParameter("menu"));
		model.addAttribute("app_flag", session.getAttribute(SysConstant.SESSION_KEY_APP_FLAG));
		String actionFlag=request.getParameter("actionFlag");
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		String propertiesKey = "NEWUIFLAG_"+ (sessionStaff.getCurrentAreaId() + "").substring(0, 3);//新ui开关
		// 新UI开关
		String newUIFlag = propertiesUtils.getMessage(propertiesKey);
		if("112".equals(actionFlag) || "113".equals(actionFlag) || "201".equals(actionFlag) || "301".equals(actionFlag) || "150".equals(actionFlag) || "160".equals(actionFlag)){//直接进入新UI
			return "/public/app-resource";
		}
		if(actionFlag!=null && "ON".equals(newUIFlag)){
			return "/public/app-resource";
		}
		//全部跳转新
		return "/public/app-unify-entrance";
	}
	
	@RequestMapping(value = "/test", method = RequestMethod.GET)
	@SessionValid(false)
	public String test(HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response) {
		return "/public/app-unify";
	}
	
	/**
	 * 手机客户端-规则校验
	 * @param params
	 * @param model
	 * @param optFlowNum
	 * @param response
	 * @param httpSession
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/rulecheck", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String rulecheck(@RequestBody Map<String, Object> params, Model model, @LogOperatorAnn String optFlowNum, HttpSession httpSession) throws BusinessException {
		String result = null;
		Map<String, Object> param = new HashMap<String, Object>();
		try {
			String prodIdInfos=params.get("prodIdInfos").toString().replace("\\", "");
			String custInfos=params.get("custInfos").toString().replace("\\", "");
			String staffInfos=params.get("staffInfos").toString().replace("\\", "");
			param=CommonMethods.getParams(prodIdInfos, custInfos, staffInfos, getRequest());
			param.put("actionFlag", Const.OFFERCHANGE_FLAG);
			param.put("olTypeCd", "15");
			Map<String, Object> validatoResutlMap=commonBmo.validatorRule(param, optFlowNum, super.getRequest());
			if(!ResultCode.R_SUCCESS.equals(validatoResutlMap.get("code"))){
				model.addAttribute("validatoResutlMap", validatoResutlMap);
//				return "/app/rule/rulecheck";
				result = "/app/rule/rulecheck";
			}
			model.addAttribute("flag", Const.OFFERCHANGE_FLAG);
			model.addAttribute("soNbr", param.get("soNbr"));
		} catch (BusinessException e) {
			return super.failedStr(model, e);
		} catch (InterfaceException ie) {
        	return super.failedStr(model, ie, param, null);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.LOAD_INST, e,
					param);
		}
		
		return result;
    }
	/**
	 * 手机客户端-菜单首页入口
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 * @throws BusinessException 
	 */
	@RequestMapping(value = "/home", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String home(@RequestBody Map<String, Object> params, HttpServletRequest request,Model model, @LogOperatorAnn String optFlowNum,HttpSession session) throws BusinessException {
		String result = rulecheck(params,model,optFlowNum,session);
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String channelCode =sessionStaff.getCurrentChannelCode();
    	String channelName=sessionStaff.getCurrentChannelName();
    	String areaName=sessionStaff.getCurrentAreaName();
    	model.addAttribute("channelCode", channelCode);
    	model.addAttribute("channelName", channelName);
    	model.addAttribute("areaName", areaName);
		if(result != null){
			return result;
		}else return "/public/app-menu-home";
    }
	/**
	 * 手机客户端-首页
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 * @throws BusinessException 
	 */
	@SuppressWarnings("unused")
	@RequestMapping(value = "/app_home", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String app_home(@RequestBody Map<String, Object> params, HttpServletRequest request,Model model, @LogOperatorAnn String optFlowNum,HttpSession session) throws BusinessException 
	{
		

//		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);

		List menu =  (List) ServletUtils.getSessionAttribute(request,SysConstant.SESSION_KEY_MENU_LIST);
		List channelList = (List) ServletUtils.getSessionAttribute(request,SysConstant.SESSION_KEY_STAFF_CHANNEL);
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		System.out.println(sessionStaff.getStaffName());
		Map channel = null;
		if (channelList.size()>0){
			channel = (Map)channelList.get(0);
		}
		
//		System.out.println(List);
		boolean isCanOrder = false; 
		List pageSecondaryBusinessMenuArra = new ArrayList();
		Map<String, Object> resultMsg = new HashMap<String, Object>();
		if(menu==null){
			resultMsg.put("code", -2);
			resultMsg.put("Msg", "该工号未配置菜单信息");
			return super.failedStr(model, ErrorCode.QUERY_MENU_INFO, resultMsg, params);
// 	       return "";
		}
		for (int i=0; i< menu.size(); i++) 
		{
			Map oneMap = (Map)menu.get(i);
			
			if(oneMap.get("childMenuResources")==null)
			{
				continue;
			}
			
			List twoArray = (List)oneMap.get("childMenuResources");
			
			 for (int j=0; j<twoArray.size(); j++)
			 {
				Map twoMap = (Map)twoArray.get(j);
	    			
	    		if(twoMap.get("parentResourceId")==null)
	    		{
	    			continue;
	    		}
	            
	    		String isMainMenu = (String)twoMap.get("isMainMenu");
	    		if(isMainMenu.equals("N"))
	    		{
	    			//二次业务菜单按钮存放
	    			pageSecondaryBusinessMenuArra = (List)twoMap.get("childMenuResources");
	    		}
	    		else
	    		{
	    			List pageSecondaryBusinessMenuArraY = (List)twoMap.get("childMenuResources");
	    			if(pageSecondaryBusinessMenuArraY == null || pageSecondaryBusinessMenuArraY.size() == 0)
	    			{
	    				String menuPath = (String)twoMap.get("menuPath");
	    				if (menuPath.equals(SysConstant.prodoffer))
	    				{
	    					//判断是否有受理权限，默认0，没有isCreateCust,isCanOrder
	    					isCanOrder = true;
	    				}
	    				
	    			}
	    			else
	    			{
	    				for(Map menuItem : (List<Map>)pageSecondaryBusinessMenuArraY)
	    				{
	    					String menuPath = (String)menuItem.get("menuPath");
	    					if (menuPath.equals(SysConstant.prodoffer))
		    				{
		    					//判断是否有受理权限，默认0，没有isCreateCust,isCanOrder
	    						isCanOrder = true;
	    						break;
		    				}
	    				}
	    			}
	    		}	
             }
		}
		
		List pagePowerMenuArray = new ArrayList();
		List pageFunctionMenuArray = new ArrayList();
		
		pagePowerMenuArray = PowerMenuInit(isCanOrder);
		
		for(Map menuItem : (List<Map>)pageSecondaryBusinessMenuArra)
		{
			pageFunctionMenuArray.add(menuItem);
		}
		
		List<List> tempArray = getPageMenu_More(getPageMenu(menu), pagePowerMenuArray, pageFunctionMenuArray);
        
		if(tempArray.size()>0)
		{
			pagePowerMenuArray = tempArray.get(0);
		}
		if(tempArray.size()>1)
		{
			pageFunctionMenuArray = tempArray.get(1);
		}
		if(menu==null){
    	       return "";
    	}
		
		System.out.println(menu.size());
		pagePowerMenuArray = setMenuPic(pagePowerMenuArray);
		pageFunctionMenuArray = setMenuPic(pageFunctionMenuArray);
    	model.addAttribute("pagePowerMenuArray", pagePowerMenuArray);
    	model.addAttribute("pageFunctionMenuArray", pageFunctionMenuArray);
    	if (channel != null){
    		model.addAttribute("channel", channel);
    	}
    	model.addAttribute("staff", sessionStaff);
		return "/app/home/app-menu-home";
    }
	/**
	 * 手机客户端-首页菜单数据初始化
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 * @throws BusinessException 
	 */
	
	private List PowerMenuInit(boolean isCanOrder)
	{
		List pagePowerMenuArray = new ArrayList();
		if(isCanOrder)
		{
			Map<String , String> pMenuMap1 = new HashMap<String , String>(){{
				put("resourceId", "setMeal");
			    put("resourceName", "选套餐");
			    //.... some other put() code
			    put("menuPath", SysConstant.prodoffer);
			}};
			Map<String , String> pMenuMap2 = new HashMap<String , String>(){{
				put("resourceId", "buyPhone");
			    put("resourceName", "购手机");
			    //.... some other put() code
			    put("menuPath", SysConstant.prodoffer);

			}};
			Map<String , String> pMenuMap3 = new HashMap<String , String>(){{
				put("resourceId", "selectNumber");
			    put("resourceName", "选号码");
			    //.... some other put() code
			    put("menuPath", SysConstant.prodoffer);
			}};
			
			pagePowerMenuArray.add(pMenuMap1);
			pagePowerMenuArray.add(pMenuMap2);
			pagePowerMenuArray.add(pMenuMap3);
			
		}
	  
		return pagePowerMenuArray;
	}
	/**
	 * 手机客户端-首页菜单过滤办业务
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 * @throws BusinessException 
	 */
	
	private List getPageMenu_More(List<Object> pageCurrentArray,List<Object> powerMenuArray,List<Object> functionArray)
	{
		List<List> array = new ArrayList<List>();
		for (int i = 0;i<pageCurrentArray.size();i++)
		{
			Map pMap = (Map)pageCurrentArray.get(i);
			List childMenuResources = (List)pMap.get("childMenuResources");
			if(pMap.get("childMenuResources")==null||childMenuResources.size()==0)
			{
				if(pMap.containsKey("resourceName"))
				{
					String resourceName = (String)pMap.get("resourceName");
					if(resourceName.indexOf("宽带新装")!= -1)
					{
						powerMenuArray.add(pMap);
					}
					else
					{
						functionArray.add(pMap);
					}
				}
			}
			else
			{
				String resourceName = (String)pMap.get("resourceName");
				if(resourceName.equals("二次业务"))
				{
					continue;
				}
				List<Object> currentArray = (List<Object>)pMap.get("childMenuResources");
				List<List> tempArray = getPageMenu_More(currentArray, powerMenuArray, functionArray);
		        
				if(tempArray.size()>0)
				{
					powerMenuArray = tempArray.get(0);
				}
				if(tempArray.size()>1)
				{
					functionArray = tempArray.get(1);
				}
				
			}
		}
		array.add(powerMenuArray);
		array.add(functionArray);
		return array;
	}
	
	/**
	 * 手机客户端-首页
	 * 在菜单项中过滤掉办业务，因为在tabViewController中已经显示，不需要再添加快捷菜单
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 * @throws BusinessException 
	 */
	
	private List<Object> getPageMenu(List<Object> pageCurrentArray)
	{
		List<Object> array = new ArrayList<Object>();
		for (int i = 0; i < pageCurrentArray.size(); i++)
		{
			Map<Object,Object> pMap = (Map<Object,Object>)pageCurrentArray.get(i);
			String isMainMenu = (String)pMap.get("isMainMenu");
			if(isMainMenu.equals("N")&&isMainMenu!=null)
			{
				continue;
			}
			List childMenuResources = (List)pMap.get("childMenuResources");
			if (pMap.get("childMenuResources")!=null || childMenuResources.size() == 0)
			{
				if(SysConstant.prodoffer.equals(pMap.get("menuPath")))
				{
					continue;
				}
				array.add(pMap);
				continue;
			}
			String resourceName = (String)pMap.get("resourceName");
			if(resourceName!=null && resourceName.equals("二次业务"))
			{
				continue;
			}
			String resourceId = (String)pMap.get("resourceId");
			if(resourceId!=null && resourceId.equals("5031"))
			{
				continue;
			}
			List<Object> arrayChildMenuResources = getPageMenu((List<Object>)pMap.get("childMenuResources"));
			if(arrayChildMenuResources != null && arrayChildMenuResources.size() > 0)
			{
				array.addAll(arrayChildMenuResources);
			}
		}
		return array;
	}
	/**
	 * 手机客户端-首页
	 * 菜单添加图标字段
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 * @throws BusinessException 
	 */
	
	private List<Object> setMenuPic(List<Object> pageCurrentArray)
	{
		List<Object> array = new ArrayList<Object>();
		for (int i = 0; i < pageCurrentArray.size(); i++)
		{
			Map<Object,Object> pMap = (Map<Object,Object>)pageCurrentArray.get(i);
			String resourceName = (String)pMap.get("resourceName");
			String menuPath = (String)pMap.get("menuPath");
			String iconPic = "";
			if (resourceName.indexOf("选套餐") >= 0)
			{
				iconPic = "&#xe6da";
			}
			else if (resourceName.indexOf("选号码") >= 0)
			{
				iconPic = "&#xe61d";
			}
			else if (resourceName.indexOf("购手机") >= 0)
			{
				iconPic = "&#xe6c8";
			}
			else if ("/app/order/broadband/prepare".equals(menuPath))//宽带甩单
			{
				iconPic = "&#xe6d7";
			}
			else if ("/app/order/prodoffer/offerchange/prepare".equals(menuPath))//套餐变更
			{
				iconPic = "&#xe6cb";
			}
			else if ("/app/order/attachoffer/prepare".equals(menuPath))//可选包变更
			{
				iconPic = "&#xe6cc";
			}
			else if ("/app/prodModify/prepare".equals(menuPath))//客户返档
			{
				iconPic = "&#xe677";
			}
			else if ("/app/order/attachoffer/prepare".equals(menuPath))//终端
			{
				iconPic = "&#xe639";
			}
			else if ("/app/cust/create".equals(menuPath))//客户新增
			{
				iconPic = "&#xe643";
			}
			else if ("/app/order/queryOrderYsl".equals(menuPath))//预受理查询
			{
				iconPic = "&#xe6d6";
			}
			else if ("/app/order/inOrderYsl".equals(menuPath))//预受理
			{
				iconPic = "&#xe65f";
			}
			else if ("/app/prodModify/toCheckUimUI".equals(menuPath))//补换卡
			{
				iconPic = "&#xe6d0";
			}
			else if ("/app/order/prodoffer/memberchange/prepare".equals(menuPath))//主副卡成员
			{
				iconPic = "&#xe6de";
			}
			else if ("/app/push/enter".equals(menuPath))//双屏胡互动
			{
				iconPic = "&#xe6d4";
			}
			else if ("/app/order/attachBroadband/prepare".equals(menuPath))//宽带续约
			{
				iconPic = "&#xe6ca";
			}
			else if ("/app/staffMgr/toBindQrCode".equals(menuPath))//扫码登录
			{
				iconPic = "&#xe641";
			}
			else if ("/app/orange/orange-offer".equals(menuPath))//质押租机
			{
				iconPic = "&#xe6c7";
			}
			else if ("/app/cfq/prepare".equals(menuPath))//芝麻信用
			{
				iconPic = "&#xe730";
			}
			else if ("/app/amalgamation/prepare".equals(menuPath))//融合新装
			{
				iconPic = "&#xe6d2";
			}
//			else if (resourceName == "/app/order/attachBroadband/prepare")//宽带续约
//			{
//				iconPic = "&#xe6ca";
//			}
//			else if (resourceName == "/app/order/attachBroadband/prepare")//宽带续约
//			{
//				
//			}
//			else if (resourceName == "/app/order/attachBroadband/prepare")//宽带续约
//			{
//				
//			}
			else
			{
				iconPic = "&#xe600";
			}
//		    NSRange range7 = [resourceName rangeOfString:@"终端"];
//		    NSRange range8 = [resourceName rangeOfString:@"客户信息"];
//		    NSRange range13 = [resourceName rangeOfString:@"新增客户订单查询"];
//		    NSRange range23 = [resourceName rangeOfString:@"甩单查询"];
			pMap.put("iconPic", iconPic);
			array.add(pMap);
		}
		return array;
	}
	@Autowired
    @Qualifier("com.al.ecs.portal.agent.bmo.portal.NoticeBmo")
    private NoticeBmo noticeBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	@RequestMapping(value = "/notice", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse notice(@RequestBody Map<String, Object> param,HttpServletRequest request,
            HttpServletResponse response,@LogOperatorAnn String flowNum) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        String   bulletinId = (String) param.get("bulletinId"); 
        if(bulletinId != null && !bulletinId.equals("") && !bulletinId.equals("null")){
        	dataBusMap.put("bulletinId", param.get("bulletinId"));
        }
        dataBusMap.put("areaId", sessionStaff.getAreaId());
        dataBusMap.put("pageIndex", 1);
        dataBusMap.put("pageSize", 10);
        List<Map<String, Object>> list = null;
        JsonResponse jsonResponse = null;
        Map<String, Object> mapList=new HashMap<String, Object>();
        try {
            list = noticeBmo.getNoticeList(dataBusMap, null, sessionStaff);
            if (list != null && list.size() > 0) {
            	if(bulletinId != null && bulletinId !=""){
            		 Map<String, Object> mapdetail=new HashMap<String, Object>();
            		 mapdetail.put("bulletinName", list.get(0).get("bulletinName"));
            		 mapdetail.put("createDate", list.get(0).get("createDate"));
            		 mapdetail.put("bulletinText", list.get(0).get("bulletinText"));
	        		 if(list.get(0).get("attachs")!=null){
	        			 List<Map<String, Object>> attachslist =  (List<Map<String, Object>>) list.get(0).get("attachs");
	        			 List<Map<String, Object>> attchsList2=new ArrayList<Map<String, Object>>();
	        			 List<Map<String, Object>> urlList=new ArrayList<Map<String, Object>>();
	        			 Map<String, Object> nameMap=new HashMap<String, Object>();
     				    Map<String, Object> urlMap=new HashMap<String, Object>();
	        			 for(Map<String, Object> map2:attachslist){
	        				    Map<String, Object> myMap=new HashMap<String, Object>();
	        				    myMap.put("name", map2.get("name"));
	        					 String id="";
	        					 if(map2.get("id")!=null){
	        					   id=(String) map2.get("id");
	        					 }
	        					 String notice_url = (String) attachslist.get(0).get("noticeurl");
	        					 notice_url = notice_url +","+ attachslist.get(0).get("name");
	    	            		 myMap.put("noticeurl", AESUtils.encryptToString(notice_url, SysConstant.BLACK_USER_URL_PWD));
	    	            		 attchsList2.add(myMap);
	        			 }
	        			 JSONArray attachsArray= JSONArray.fromObject(attchsList2);
	        			 mapdetail.put("attachs", attachsArray);
	        		 }
//	        		 if(list.get(0).get("attachs")!=null){
//	        			 List<Map<String, Object>> attachslist =  (List<Map<String, Object>>) list.get(0).get("attachs");
//	        			 mapdetail.put("name", attachslist.get(0).get("name"));
//	            		 String notice_url = propertiesUtils.getMessage(SysConstant.NOTICE_URL);
//	            		 notice_url = notice_url+attachslist.get(0).get("id");
//	            		 mapdetail.put("noticeurl", notice_url);
//	        		 }
	        		 jsonResponse=super.successed(mapdetail, ResultConstant.SUCCESS.getCode());
            		 return jsonResponse;
            	}
            	mapList.put("infoList", list);
            }
            getApConfigMap(mapList,null,sessionStaff);
            jsonResponse=super.successed(mapList, ResultConstant.SUCCESS.getCode());
		}catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.BULLET_IN_INFO);
        } catch (Exception e) {
            return super.failed(ErrorCode.BULLET_IN_INFO, e, param);
        }
        return jsonResponse;
    }
	
	   /**
     * 公告附件下载
     * @param response
     * @param model
     * @param params
     * @return
     */
	@RequestMapping(value = "/downloadNoticeAttach", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse downloadFile(Model model,@RequestParam("fileUrl") String fileUrl,
			HttpServletResponse response) throws IOException {
		try {
			FtpUtils ftpUtils = new FtpUtils();
			// 解密url
			fileUrl = AESUtils.decryptToString(fileUrl, SysConstant.BLACK_USER_URL_PWD);
			String[] fileUrls = fileUrl.split(",");
			String filePath = fileUrls[0];
			String fileName =  filePath.substring(filePath.lastIndexOf("/") + 1);
			filePath = filePath.substring(0,filePath.lastIndexOf("/") + 1);
			
			String downName = fileUrls[1];
			
			//2.获取FTP服务器的具体登录信息
			//3.根据服务器映射获取对应的FTP服务器配置信息
			String ftpServiceConfig = MDA.NOTICE_FTP_SERVICE_CONFIGS;
			String[] ftpServiceConfigs = ftpServiceConfig.split(",");
			String remoteAddress = ftpServiceConfigs[0];//FTP服务器地址(IP)
			String remotePort = ftpServiceConfigs[1];//FTP服务器端口
			String userName = ftpServiceConfigs[2];//FTP服务器用户名
			String password = ftpServiceConfigs[3];//FTP服务器密码
			
			ftpUtils.connectFTPServer(remoteAddress,remotePort,userName,password);
			String path = filePath + new String(fileName.getBytes(), FTPClient.DEFAULT_CONTROL_ENCODING);
			boolean isFileExist = ftpUtils.isFileExist(path);
			if(isFileExist){
				ServletOutputStream  outputStream = response.getOutputStream();
				response.addHeader("Content-Disposition", "attachment;filename="+new String(downName.getBytes("gb2312"), "ISO8859-1"));
				response.setContentType("application/octet-stream;charset=utf-8");
				ftpUtils.getFileInputStreamByPath(outputStream ,filePath+fileName);
				return super.successed("下载成功！");
			}else{
				return super.failed("下载文件不存在，请联系管理员。", ResultConstant.FAILD.getCode());
			}
		} catch (Exception e) {
			return super.failed("下载文件异常：<br/>" + e, ResultConstant.FAILD.getCode());
		}		
	}
	
	/**
     * 取得滚动时间
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
	private void getApConfigMap(Map<String, Object> mapList, String flowNum,
			SessionStaff sessionStaff) {
		String tableName = "SYSTEM";
		String columnItem = "NOITIC_INTERVAL_TIME";   
		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
		try {
			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItem);
			if (obj != null && obj instanceof List) {
				rList = (List<Map<String, Object>>) obj;
			} else {
				Map<String, Object> pMap = new HashMap<String, Object>();
				pMap.put("tableName", tableName);
				pMap.put("columnName", columnItem);
				rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItem, rList);
			}
			ArrayList<Map<String, Object>> al = (ArrayList)rList.get(0).get("NOITIC_INTERVAL_TIME"); 
			mapList.put("intervalTime", al.get(0).get("COLUMN_VALUE"));
		} catch (BusinessException e) {
		  this.log.error("查询配置信息服务出错", e);
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
	}
	
	/**
     * 获取APP自动更新标识（0：不提示更新   1：强制更新   2：提示更新）
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
	@RequestMapping(value = "/appUpdateFlag", method = { RequestMethod.POST })
    @ResponseBody
    @SessionValid(false)
    public JsonResponse appUpdateFlag(@RequestBody Map<String, Object> param,HttpServletRequest request,
            HttpServletResponse response) {
        JsonResponse jsonResponse = null;
        String appUpdateFlag = "0";
        if(MDA.APP_UPDATE_FLAG.toString()!=null && MDA.APP_UPDATE_FLAG.toString().length()>0){
        	appUpdateFlag = MDA.APP_UPDATE_FLAG.toString();
        }
        Map<String, Object> mapList=new HashMap<String, Object>();
        mapList.put("appUpdateFlag", appUpdateFlag);
        jsonResponse=super.successed(mapList, ResultConstant.SUCCESS.getCode());
        return jsonResponse;
    }
	
	 /**
     * 根据id获取公告下载地址
     * @param session
     * @param model
     * @param params
     * @return
     */
	@SuppressWarnings({ "unchecked" })
	@RequestMapping(value = "/getNoticeUrl", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse getNoticeUrl(@RequestBody Map<String, Object> param,HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        String   id = (String) param.get("id"); //公告id
        dataBusMap.put("areaId", sessionStaff.getAreaId());
        dataBusMap.put("pageIndex", 1);
        dataBusMap.put("pageSize", 10);
        List<Map<String, Object>> list = null;
        JsonResponse jsonResponse = null;
        try {
            list = noticeBmo.getNoticeList(dataBusMap, null, sessionStaff);
            if (list != null && list.size() > 0) {
            	for(Map<String,Object> map:list){
            		 Map<String, Object> mapdetail=new HashMap<String, Object>();
	        		 if(map.get("attachs")!=null){
	        			 List<Map<String, Object>> attachslist =  (List<Map<String, Object>>) map.get("attachs");
	        			 for(Map<String, Object> map2:attachslist){
	        				if(id.equals(map2.get("id"))){
	        					 mapdetail.put("name", map2.get("name"));
	    	            		 String notice_url = propertiesUtils.getMessage(SysConstant.NOTICE_URL);
	    	            		 notice_url = notice_url+id;
	    	            		 mapdetail.put("noticeurl", notice_url);
	    	            		 break;
	        				}
	        			 }
	        		 }
	        		 jsonResponse=super.successed(mapdetail, ResultConstant.SUCCESS.getCode());
            	}
            	return jsonResponse;
            }
		}catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.BULLET_IN_INFO);
        } catch (Exception e) {
            return super.failed(ErrorCode.BULLET_IN_INFO, e, param);
        }
        return jsonResponse;
    }
}

package com.al.lte.portal.controller.system;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.system.MenuBmo;
import com.al.lte.portal.common.PortalUtils;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 登录后,首页控制器 .
 * <BR>
 *  TODO 要点概述.
 * <P>
 * @author wukf
 * @version V1.0 2013-08-06
 * @createDate 2013-08-06 上午4:14:12
 * @modifyDate 
 * @copyRight 亚信联创电信CRM研发部
 */
@Controller("com.al.lte.portal.controller.system.MenuController")
@RequestMapping("/menu/*")
@AuthorityValid(isCheck = false)
public class MenuController extends BaseController {

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.system.MenuBmo")
    private MenuBmo menuBmo;
    
    /**
     * 已设置的快捷菜单查询
     * @param session
     * @param model
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/mainshortcut", method = RequestMethod.GET)
    public String queryMainshortcut(@RequestParam Map<String, Object> param, Model model, 
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        if (sessionStaff != null) {
        	if(sessionStaff.getStaffId()!=null && !sessionStaff.getStaffId().trim().equals("")){
        		dataBusMap.put("staffId",Long.parseLong(sessionStaff.getStaffId()));
        		//dataBusMap.put("staffId", Integer.parseInt(sessionStaff.getStaffId()));
        	}
        	else{
        		dataBusMap.put("staffId", null);
        	}
        	if(sessionStaff.getAreaId()!=null && !sessionStaff.getAreaId().trim().equals("")){
        		dataBusMap.put("areaId", Integer.parseInt(sessionStaff.getAreaId()));
        	} 
        	else{
        		dataBusMap.put("areaId", null);
        	}
    		dataBusMap.put("platFormCode", SysConstant.SM_PLATFORM_CODE);
            Map<String, Object> result = null ;
            List<Map<String, Object>> list = null;
            try {
            	result = menuBmo.preShortCut(dataBusMap , null, sessionStaff);
            	list = (List<Map<String, Object>>)result.get("menuResources");
                if (list != null && list.size() > 0) {
                    model.addAttribute("menuList", list);
                } else {
                    super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
                }
            } catch (BusinessException be) {
            	return super.failedStr(model, be);
            } catch (InterfaceException ie) {
    			return super.failedStr(model, ie, dataBusMap, ErrorCode.QUERY_SHORTCUT);
    		} catch (Exception e) {
    			return super.failedStr(model, ErrorCode.QUERY_SHORTCUT, e, dataBusMap);
    		}
            if(param.get("setShortcut")!=null){
            	//快捷菜单设置
            	return "/menu/main-query-shortcut";
            }
            //首页
            return "/menu/main-shortcut";
        } else {
            this.log.error("登录会话不存在，菜单加载失败{}");
            return "redircet:/staff/login/page";
        }
    }
    
    /*
    @RequestMapping(value = "/prepare", method = RequestMethod.GET)
    public String prepare(@RequestParam(value = "current", required = false, defaultValue = "0") String current,
            HttpSession session, Model model, @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        log.debug("current={}", current);
        model.addAttribute("current", current);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        if (sessionStaff != null) {
            dataBusMap.put("staffId", sessionStaff.getStaffId());
            dataBusMap.put("channel", "1");
            List<Map<String, Object>> list = null;
            try {
                list = menuBmo.preMainMenu(dataBusMap, flowNum, sessionStaff);
                if (list != null && list.size() != 0) {
                    model.addAttribute("menuList", list);
                } else {
                    super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
                }
            } catch (BusinessException e) {
                this.log.error("加载一级菜单失败", e);
                super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
            }

        }
        return "/menu/main-header-nav";
    }
	*/
    
    /**
     * 快捷菜单设置中查询第一层菜单(下部分左侧导航)
     * @param session
     * @param request
     * @param model
     * @param flowNum
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/inquireLv1", method = RequestMethod.GET)
    public String menuInquireLv1(HttpSession session, HttpServletRequest request, Model model,
    		@LogOperatorAnn String flowNum){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	if(sessionStaff!=null){
   			
    		ArrayList<Map<String, Object>> menuList = (ArrayList<Map<String, Object>>)session.getAttribute(SysConstant.SESSION_KEY_MENU_LIST);    			
    		this.log.debug("--menu{}", menuList);
    		model.addAttribute("lv1", menuList);      		
    		return "/menu/main-query-parents";      	
    	}
    	else {
            this.log.error("登录会话不存在，菜单加载失败{}");
            return "redircet:/staff/login/page";
        }   		 	   		
    }
    
    /**
     * 快捷菜单设置中查询第二层菜单(下部分右侧选项)
     * @param param
     * @param request
     * @param model
     * @param flowNum
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/inquireLv2", method = RequestMethod.GET)
    public String menuInquireLv2(@RequestParam Map<String, Object> param, HttpSession session, HttpServletRequest request, Model model,
    		@LogOperatorAnn String flowNum){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	int parentId;
    	if(param.get("parentId")!=null && !param.get("parentId").toString().trim().equals("")){
    		parentId = Integer.parseInt(param.get("parentId").toString());
    	}
    	else{
    		parentId = -1;
    	}  	
    	if(sessionStaff!=null){
    			
    		ArrayList<Map<String, Object>> newList1 = (ArrayList<Map<String, Object>>)session.getAttribute(SysConstant.SESSION_KEY_MENU_LIST);    			
    		for(Map<String, Object> lv1:newList1){    				
    			if(lv1.get("resourceId").equals(parentId)){    					
    				ArrayList<Map<String, Object>> newList2 = (ArrayList<Map<String, Object>>)lv1.get("childMenuResources");     					
    				model.addAttribute("lv2", newList2);    				
    			}    			
    		}    		
    		return "/menu/main-query-son";    	
    	}
    	else {
            this.log.error("登录会话不存在，菜单加载失败{}");
            return "redircet:/staff/login/page";
        }       	
    }
    
    /**
     * 快捷菜单设置中查询第三层菜单(下部分右侧选项)
     * @param param
     * @param request
     * @param model
     * @param flowNum
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/inquireLv3", method = RequestMethod.GET)
    public String menuInquireLv3(@RequestParam Map<String, Object> param,HttpSession session, HttpServletRequest request, Model model,
    		@LogOperatorAnn String flowNum){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	int grandParentId;
    	int parentId;
    	if(param.get("grandParentId")!=null && !param.get("grandParentId").toString().trim().equals("")){
    		grandParentId = Integer.parseInt(param.get("grandParentId").toString());       	
    	}
    	else{
    		grandParentId = -1;   		
    	}
    	if(param.get("parentId")!=null && !param.get("parentId").toString().trim().equals("")){
    		parentId = Integer.parseInt(param.get("parentId").toString());
    	}
    	else{
    		parentId = -1;
    	}
    	if(sessionStaff!=null){
    			    			    		
    		ArrayList<Map<String, Object>> newList1 = (ArrayList<Map<String, Object>>)session.getAttribute(SysConstant.SESSION_KEY_MENU_LIST);    			
    		for(Map<String, Object> lv1:newList1){    				
    			if(lv1.get("resourceId").equals(grandParentId)){    					
    				ArrayList<Map<String, Object>> newList2 = (ArrayList<Map<String, Object>>)lv1.get("childMenuResources");    					
    				for(Map<String, Object> lv2:newList2){    					
    					if(lv2.get("resourceId").equals(parentId)){    							
    						ArrayList<Map<String, Object>> newList3 = (ArrayList<Map<String, Object>>)lv2.get("childMenuResources");    			    							
    						model.addAttribute("lv3", newList3);   				
    					}    				
    				}   			
    			}    		
    		}    			    			
    		model.addAttribute("grandParentId", grandParentId);
    		return "/menu/main-query-son";
    	}
    	else {
            this.log.error("登录会话不存在，菜单加载失败{}");
            return "redircet:/staff/login/page";
        }          	
    }
    
//    @RequestMapping(value = "/setShortcut", method = RequestMethod.GET)
//    @AuthorityValid(isCheck = false)
//    public String preSetShortcut(Model model) throws AuthorityException {
//    	return "/menu/main-query-shortcut";
//    }
    
    /**
     * 快捷菜单增删
     * @param param
     * @param request
     * @param response
     * @param flowNum
     * @return
     */
    @RequestMapping(value = "/setShortcut", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse setShortcut(@RequestBody Map<String, Object> param, HttpServletRequest request,
    		HttpServletResponse response, @LogOperatorAnn String flowNum){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
//    	String dispOrder = "";
//    	if(param.get("actionType").equals("ADD")){
//    		dispOrder = param.get("dispOrder").toString();
//    	}    	   	    		
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	    	    
    	if(param.get("resourceId")!=null && !param.get("resourceId").toString().trim().equals("")){    		   
    		int resourceId = Integer.parseInt(param.get("resourceId").toString());    		   
    		dataBusMap.put("resourceId", resourceId);    	  
    	}    	  
    	else{    		  
    		dataBusMap.put("resourceId", null);    	   
    	}    	  
    	if(param.get("actionType")!=null && !param.get("actionType").toString().trim().equals("")){    		   
    		dataBusMap.put("actionType", param.get("actionType").toString());    	   
    	}    	   
    	else{    		  
    		dataBusMap.put("actionType", null);    	   
    	}   
    	if(sessionStaff!=null){   
    		if(sessionStaff.getStaffId()!=null && !sessionStaff.getStaffId().trim().equals("")){   
    			dataBusMap.put("staffId", Integer.parseInt(sessionStaff.getStaffId()));    
    		}    
    		else{    
    			dataBusMap.put("staffId", null);    
    		}    
    		if(sessionStaff.getAreaId()!=null && !sessionStaff.getAreaId().trim().equals("")){    
    			dataBusMap.put("areaId", Integer.parseInt(sessionStaff.getAreaId()));    
    		}     
    		else{    
    			dataBusMap.put("areaId", null);   
    		}    	
    	}
    	else{
    		return  failed("登陆会话失效，请重新登陆", -1);	
    	}
//    	dataBusMap.put("systemPlatformId", SysConstant.SM_PLATFORM_CODE);   
//    	dataBusMap.put("dispOrder", dispOrder);    	        	
    	try{    		 
    		int flag = menuBmo.setShortcut(dataBusMap, flowNum, sessionStaff);    
    		return  successed("", flag);        
    	}catch(BusinessException be){			        
    		return super.failed(be);
    	}catch(InterfaceException ie){
			return super.failed(ie, dataBusMap, ErrorCode.SET_SHORTCUT);
		}catch(Exception e){
			return super.failed(ErrorCode.SET_SHORTCUT, e, dataBusMap);
		}        
    }
}
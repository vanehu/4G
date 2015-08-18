package com.al.lte.portal.controller.main;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.portal.NoticeBmo;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.PortalUtils;
import com.al.lte.portal.common.SysConstant;
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
@Controller("com.al.lte.portal.controller.main.MainController")
@RequestMapping("/main/*")
@AuthorityValid(isCheck = false)
//20130808 跳过校验 bxw
//@SessionValid(value = false)
public class MainController extends BaseController {
	
    @Autowired
    @Qualifier("com.al.ecs.portal.agent.bmo.portal.NoticeBmo")
    private NoticeBmo noticeBmo;
    
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
    private MktResBmo mktResBmo;
    
    @RequestMapping(value = "/home", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(@RequestParam(value = "current", required = false, defaultValue = "home") String current,
            Model model,HttpSession session,HttpServletRequest request) throws AuthorityException {
    	model.addAttribute("current", "home");
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
    	
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	dataBusMap.put("objCatgName", "recommendOffer,recommendTerminal,hotSaleOffer");
    	
    	String channelId = sessionStaff.getCurrentChannelId();
    	if(channelId==null||channelId.equals("")||channelId.equals("null")){
    		dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
            dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
    	}else{
    		dataBusMap.put("areaId", sessionStaff.getAreaId());
            dataBusMap.put("channelId", sessionStaff.getChannelId());
    	}
    	Map<String, Object> mapHotProd = new HashMap<String, Object>();
       
        try {
        	mapHotProd = noticeBmo.getHotProd(dataBusMap, null, sessionStaff);
        } catch (BusinessException e) {
            this.log.error("加载热卖失败", e);
        } catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
		model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session,"order/prepare"));
        model.addAttribute("hotMap", mapHotProd);
        model.addAttribute("DiffPlaceFlag", "local");
        return "/main/main";
    }
    
    @RequestMapping(value = "/limit", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String limit(@RequestParam(value = "current", required = false, defaultValue = "home") String current,
            Model model,HttpServletRequest request) throws AuthorityException {
    	if(request.getParameter("current")!=null&&!request.getParameter("current").equals("")){
    		model.addAttribute("current", request.getParameter("current"));
    	}else{
    		model.addAttribute("current", "home");
    	}
    	return "/main/main-limit";
    }
    
   
    @RequestMapping(value = "/head_nav", method = RequestMethod.GET)
    public String head_nav(HttpSession session,HttpServletRequest request,Model model,
    		@RequestParam(value = "current", required = false, defaultValue = "home") String current) {
    	model.addAttribute("current", current);
        return "/main-header-nav";
    }
    
    
    @RequestMapping(value = "/notice", method = RequestMethod.GET)
    public String notice(HttpSession session,Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        dataBusMap.put("staffId", sessionStaff.getStaffId());
        dataBusMap.put("areaId", sessionStaff.getAreaId());
        dataBusMap.put("pageIndex", 1);
        dataBusMap.put("pageSize", 10);
        //dataBusMap.put("bulletinId", null);
        List<Map<String, Object>> list = null;
        try {
            list = noticeBmo.getNoticeList(dataBusMap, null, sessionStaff);
            if (list != null && list.size() > 0) {
                model.addAttribute("infoList", list);
            }
		} catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, dataBusMap, ErrorCode.BULLET_IN_INFO);
		} catch (Exception e) {
			log.error("公告查询/main/notice方法异常", e);
			return super.failedStr(model, ErrorCode.BULLET_IN_INFO, e, dataBusMap);
		}
        return "/main/main-notice";
    }
    
    
}

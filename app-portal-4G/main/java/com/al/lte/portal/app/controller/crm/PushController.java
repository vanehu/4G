package com.al.lte.portal.app.controller.crm;

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

import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 双屏推送控制器 .
 * <BR>
 *  TODO 要点概述.
 * <P>
 * @author yangms
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午3:29:40
 * @modifyDate	 tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Controller("com.al.lte.portal.app.controller.PushController")
@RequestMapping("/app/push/*")
@AuthorityValid(isCheck = false)
public class PushController extends BaseController {
	
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
    private CommonBmo commonBmo;
	
	@Autowired
    PropertiesUtils propertiesUtils;
	
	@RequestMapping(value = "/enter", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	public String enter(@RequestBody Map<String, Object> paramMap,HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String name  = sessionStaff.getStaffId()+sessionStaff.getCurrentChannelId()+"_app";
		String serUrl = MDA.PUSH_HOST_PORT.toString();
		model.addAttribute("name", name);
		model.addAttribute("serUrl", serUrl);
//		model.addAttribute("app_flag", session.getAttribute(SysConstant.SESSION_KEY_APP_FLAG));
		return "/app/push/app-push";
	}
	
	@RequestMapping(value = "/room", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	public String room(@RequestBody Map<String, Object> paramMap,HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response, @LogOperatorAnn String flowNum) {
		model.addAttribute("name", paramMap.get("name"));
		model.addAttribute("channel", paramMap.get("channel"));
		return "/app/push/app-push-room";
	}
	
}

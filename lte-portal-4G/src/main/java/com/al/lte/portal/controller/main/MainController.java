package com.al.lte.portal.controller.main;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ecs.common.entity.JsonResponse;
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
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.portal.NoticeBmo;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;
import com.octo.captcha.service.CaptchaService;

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
    
    @Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
    
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
    		@RequestParam(value = "provCustAreaId", required = false, defaultValue = "") String areaId,
            Model model,HttpSession session,HttpServletRequest request) throws AuthorityException {
    	model.addAttribute("current", "home");
    	
    	//省份单点登录后，甩单到集团crm，使用带入的客户信息自动定位客户
    	model.addAttribute("fromProvFlag", fromProvFlag);
    	model.addAttribute("provIsale", isale);
    	model.addAttribute("provIdentityCd", identityCd);
    	model.addAttribute("provIdentityNum", identityNum);
    	model.addAttribute("provAreaId", areaId);
    	
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
    public String notice(HttpSession session,Model model,@RequestParam Map<String, Object> param) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
//        dataBusMap.put("staffId", sessionStaff.getStaffId());
        String   bulletinId = (String) param.get("bulletinId"); 
        if(bulletinId != null && !bulletinId.equals("") && !bulletinId.equals("null")){
        	dataBusMap.put("bulletinId", param.get("bulletinId"));
        }
        dataBusMap.put("areaId", sessionStaff.getAreaId());
        dataBusMap.put("pageIndex", 1);
        dataBusMap.put("pageSize", 10);
        //dataBusMap.put("bulletinId", null);
        List<Map<String, Object>> list = null;
        try {
            list = noticeBmo.getNoticeList(dataBusMap, null, sessionStaff);
            if (list != null && list.size() > 0) {
            	if(bulletinId != null && bulletinId !=""){
            		 model.addAttribute("bulletinName", list.get(0).get("bulletinName"));
            		 model.addAttribute("createDate", list.get(0).get("createDate"));
            		 model.addAttribute("bulletinText", list.get(0).get("bulletinText"));
            		 if(list.get(0).get("attachs")!=null){
            			 List<Map<String, Object>> attachslist =  (List<Map<String, Object>>) list.get(0).get("attachs");
                		 model.addAttribute("name", attachslist.get(0).get("name"));
                		 String notice_url = propertiesUtils.getMessage(SysConstant.NOTICE_URL);
                		 notice_url = notice_url+attachslist.get(0).get("id");
                		 model.addAttribute("noticeurl", notice_url);
            		 }
            		 return "/main/notice-detail";
            	}
            	model.addAttribute("infoList", list);
            }
            getApConfigMap(model,null,sessionStaff);
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
    
    
    /**
     * 取得滚动时间
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
	private void getApConfigMap(Model model, String flowNum,
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
			model.addAttribute("intervalTime", al.get(0).get("COLUMN_VALUE"));
		} catch (BusinessException e) {
		  this.log.error("查询配置信息服务出错", e);
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
	}
	
	//验证码验证
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/checkVerificationcode", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse checkVerificationcode(HttpServletRequest request, HttpServletResponse response,HttpSession httpSession){
		JsonResponse jsonResponse = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			captchaService = (CaptchaService) SpringContextUtil.getBean("captchaService");
			String captchaID = (String)request.getSession().getAttribute("_captcha_session_id");
			request.getSession().removeAttribute("_captcha_session_id");
			String challengeResponse = request.getParameter("validatecode");
			Boolean flag = captchaService.validateResponseForID(captchaID, challengeResponse);
			if(flag){
				httpSession.removeAttribute(sessionStaff.getStaffCode()+"custtime");
				httpSession.removeAttribute(sessionStaff.getStaffCode()+"custcount");
				httpSession.removeAttribute(sessionStaff.getStaffCode()+"nbrtime");
				httpSession.removeAttribute(sessionStaff.getStaffCode()+"nbrcount");
	        	jsonResponse = super.successed("0",ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.successed("1",ResultConstant.FAILD.getCode());
			}
		} catch (Exception e) {
			log.error("门户/main/checkVerificationcode服务验证异常", e);
		}
		return jsonResponse;
	}
}

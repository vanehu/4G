package com.al.lte.portal.controller.main;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
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
import com.al.ecs.common.entity.PageModel;
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
import com.al.lte.portal.bmo.portal.NoticeBmo;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
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
        Map<String, Object> param = new HashMap<String, Object>();
        Map<String, Object> rMap = new HashMap<String, Object>();
        param.put("areaId", sessionStaff.getCurrentAreaId());
        Map<String, Object> reqMap= new HashMap<String, Object>();
        reqMap.put("staffId", sessionStaff.getStaffId());
        param.put("reqInfo", reqMap);
        Integer total = 0;
		try {
			rMap = orderBmo.qryCount(param, null, sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCCESS.equals(rMap.get("code")
							.toString())) {
				total = (Integer)rMap.get("totalSize");
			}
        } catch (BusinessException be) {
			this.log.error("加载总量失败", be);
		} catch (InterfaceException ie) {
			this.log.error("加载总量失败", ie);
		} catch (Exception e) {
			
		}
		model.addAttribute("total",total);
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
    
    /**
     * 公告查询（三种方式：首页置顶，公告检索，公告详情）
     * @param session
     * @param model
     * @param params
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/notice", method = RequestMethod.POST)
    public String notice(HttpSession session, Model model, @RequestBody Map<String, Object> params){
    	
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        
        String areaId = MapUtils.getString(params, "areaId", "");
        if("".equals(areaId)){
        	params.put("areaId", sessionStaff.getCurrentAreaId());
        }
        String queryType = MapUtils.getString(params, "queryType", "");//查询方式
        
        try {
        	Map<String, Object> resultMap = noticeBmo.getNoticeList_WEB(params, null, sessionStaff);
        	if(ResultCode.R_SUCC.equals(MapUtils.getString(resultMap, "resultCode", ResultCode.R_FAIL))){
        		List<Map<String, Object>> noticeList = (List<Map<String, Object>>) resultMap.get("result");
        		if (noticeList!=null && noticeList.size()>0){
        			//查询公告详情
        			if("detail".equals(queryType)){
        				model.addAttribute("bulletinName", noticeList.get(0).get("bulletinName"));
        				model.addAttribute("createDate", noticeList.get(0).get("createDate"));
        				model.addAttribute("issuer", noticeList.get(0).get("issuerName")+"("+noticeList.get(0).get("issuer")+")");
        				model.addAttribute("bulletinText", noticeList.get(0).get("bulletinText"));
        				if(noticeList.get(0).get("attachs")!=null){
        					List<Map<String, Object>> attachslist = (List<Map<String, Object>>) noticeList.get(0).get("attachs");
        					model.addAttribute("name", attachslist.get(0).get("name"));
        					String notice_url = propertiesUtils.getMessage(SysConstant.NOTICE_URL);
        					notice_url = notice_url + attachslist.get(0).get("id");
        					model.addAttribute("noticeurl", notice_url);
        				}
        			}
        			//查询首页置顶公告
        			else if("focus".equals(queryType)){
        				//抽取最新的弹窗公告
        				for(Map<String, Object> notice : noticeList){
        					if("Y".equals(MapUtils.getString(notice, "popNotice", "N"))){
        						model.addAttribute("popNotice", notice);
        						break;
        					}
        				}
        				model.addAttribute("noticeList", noticeList);
        			}
        			//查询所有上架公告（公告检索）
        			else if("list".equals(queryType)){
        				Map<String, Object> page = MapUtils.getMap(resultMap, "page", new HashMap<String, Object>());
                    	int pageNo = MapUtils.getInteger(page, "pageIndex", 1);
        				int pageSize = MapUtils.getInteger(page, "pageSize", 12);
        				int totalRecords = MapUtils.getInteger(page, "totalCount", 12);
        				PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, pageSize, totalRecords<1?1:totalRecords, noticeList);
        				model.addAttribute("pageModel", pm);
        			}
        		}
            }
		}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, params, ErrorCode.BULLET_IN_INFO);
		}catch (Exception e){
			return super.failedStr(model, ErrorCode.BULLET_IN_INFO, e, params);
		}
        if("focus".equals(queryType)){
        	return "/main/main-notice";//首页置顶公告
        }else if("list".equals(queryType)){
        	return "/main/notice-list";//公告检索
        }else{
        	return "/main/notice-detail";//公告详情
        }
    }
    
//    /**
//     * 取得滚动时间
//     * @param model
//     * @param flowNum
//     * @param sessionStaff
//     */
//	private void getApConfigMap(Model model, String flowNum,
//			SessionStaff sessionStaff) {
//		String tableName = "SYSTEM";
//		String columnItem = "NOITIC_INTERVAL_TIME";   
//		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
//		try {
//			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItem);
//			if (obj != null && obj instanceof List) {
//				rList = (List<Map<String, Object>>) obj;
//			} else {
//				Map<String, Object> pMap = new HashMap<String, Object>();
//				pMap.put("tableName", tableName);
//				pMap.put("columnName", columnItem);
//				rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
//				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItem, rList);
//			}
//			ArrayList<Map<String, Object>> al = (ArrayList)rList.get(0).get("NOITIC_INTERVAL_TIME"); 
//			model.addAttribute("intervalTime", al.get(0).get("COLUMN_VALUE"));
//		} catch (BusinessException e) {
//		  this.log.error("查询配置信息服务出错", e);
//		} catch (InterfaceException ie) {
//			
//		} catch (Exception e) {
//			
//		}
//	}
	
	//验证码验证
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
				httpSession.removeAttribute(sessionStaff.getStaffCode()+"reservenumbertime");
				httpSession.removeAttribute(sessionStaff.getStaffCode()+"reservenumbercount");
	        	jsonResponse = super.successed("0",ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.successed("1",ResultConstant.FAILD.getCode());
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
	public String noticeSearchEntrance(Model model){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
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
	public String manualSearchEntrance(Model model){
		
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
	 * @param params
	 * @param model
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryManualList", method = RequestMethod.POST)
	public String queryManualList(@RequestBody Map<String, Object> params, Model model){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		try{
			params.put("areaId", sessionStaff.getCurrentAreaId());
			Map<String, Object> resultMap = noticeBmo.getManualList(params, null, sessionStaff);
			if(ResultCode.R_SUCC.equals(MapUtils.getString(resultMap, "resultCode", ResultCode.R_FAIL))){
				List<Map<String, Object>> resultList = (List<Map<String, Object>>) resultMap.get("result");
				if (resultList!=null && resultList.size()>0){
					Map<String, Object> page = MapUtils.getMap(resultMap, "page", new HashMap<String, Object>());
                	int pageNo = MapUtils.getInteger(page, "pageIndex", 1);
    				int pageSize = MapUtils.getInteger(page, "pageSize", 12);
    				int totalRecords = MapUtils.getInteger(page, "totalCount", 12);
    				
    				List<Map<String, Object>> manualList = new ArrayList<Map<String, Object>>();
    				String manual_url = propertiesUtils.getMessage(SysConstant.MANUAL_URL);
    				for(Map<String, Object> manualInfo : resultList){
    					String attachmentUrl = manual_url + MapUtils.getString(manualInfo, "attachmentId", "");
    					manualInfo.put("attachmentUrl", attachmentUrl);
    					manualList.add(manualInfo);
    				}
    				PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, pageSize, totalRecords<1?1:totalRecords, manualList);
    				model.addAttribute("pageModel", pm);
				}
			}
		}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, params, ErrorCode.BULLET_IN_INFO);
		}catch (Exception e){
			return super.failedStr(model, ErrorCode.BULLET_IN_INFO, e, params);
		}
		return "/main/manual-list";
	}
	
}

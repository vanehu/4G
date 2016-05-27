package com.al.lte.portal.app.controller.main;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.io.filefilter.FalseFileFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.entity.StaffInfo;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.Switch;
import com.al.ecs.common.util.JsonUtil;
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
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.portal.NoticeBmo;
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
	
	@LogOperatorAnn(switchs = Switch.OFF)
	@RequestMapping(value = "/common", method = RequestMethod.GET)
	public String padlogin(HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response) {
		model.addAttribute("menu", request.getParameter("menu"));
		model.addAttribute("app_flag", session.getAttribute(SysConstant.SESSION_KEY_APP_FLAG));
		return "/public/app-unify-entrance";
	}
	
	@RequestMapping(value = "/test", method = RequestMethod.GET)
	@SessionValid(false)
	public String test(HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response) {
		return "/public/app-unify";
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
	        			 mapdetail.put("name", attachslist.get(0).get("name"));
	            		 String notice_url = propertiesUtils.getMessage(SysConstant.NOTICE_URL);
	            		 notice_url = notice_url+attachslist.get(0).get("id");
	            		 mapdetail.put("noticeurl", notice_url);
	        		 }
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
}

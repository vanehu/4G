package com.al.lte.portal.agent.controller.system;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
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
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.system.MenuBmo;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 登录后,首页控制器 .
 * @author liusd
 * @version V1.0 2014-08-08
 * @createDate 2013-08-08 上午10:14:12
 * @modifyDate 
 * @copyRight 亚信电信EC研发部
 */
@Controller("com.al.lte.portal.agent.controller.system.MenuController")
@RequestMapping("/agent/menu/*")
@AuthorityValid(isCheck = false)
public class MenuController extends BaseController {

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.system.MenuBmo")
    private MenuBmo menuBmo;

    /**
     * 递归提取所有子级下叶子菜单
     * @param pList
     * @param resultList
     */
    @SuppressWarnings("unchecked")
    private void findLeafOfMenu(List<Map<String, Object>> pList, List<Map<String, Object>> resultList) {
        for (Map<String, Object> map : pList) {
            if (MapUtils.getString(map, "isMainMenu", "").equals("Y")) {//排除二次业务
                List<Map<String, Object>> childList = (List<Map<String, Object>>) MapUtils.getObject(map,
                        "childMenuResources", new ArrayList<Map<String, Object>>());
                if (CollectionUtils.isNotEmpty(childList)) {
                    this.findLeafOfMenu(childList, resultList);
                } else {
                    resultList.add(map);
                }
            }
        }
    }

    /**
     * 查询已配置菜单调用入口
     * @param dataBusMap
     * @param sessionStaff
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> findPreShortCut(Map<String, Object> dataBusMap, SessionStaff sessionStaff)
            throws Exception {
        if (StringUtils.isNotBlank(sessionStaff.getStaffId())) {
            dataBusMap.put("staffId", Long.parseLong(sessionStaff.getStaffId()));
        } else {
            dataBusMap.put("staffId", null);
        }
        if (StringUtils.isNotBlank(sessionStaff.getAreaId())) {
            dataBusMap.put("areaId", Integer.parseInt(sessionStaff.getAreaId()));
        } else {
            dataBusMap.put("areaId", null);
        }
        dataBusMap.put("platFormCode", SysConstant.SM_PADPLATFORM_CODE);
        Map<String, Object> result = this.menuBmo.preShortCut(dataBusMap, null, sessionStaff);
        return (List<Map<String, Object>>) result.get("menuResources");
    }

    /**
     * 已设置的快捷菜单查询
     * @param model
     * @return
     */
    @RequestMapping(value = "/mainShortcut", method = RequestMethod.GET)
    public String queryMainshortcut(Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        List<Map<String, Object>> list = null;
        try {
            list = this.findPreShortCut(dataBusMap, sessionStaff);
            if (CollectionUtils.isNotEmpty(list)) {
                model.addAttribute("preSetShortCut", list);
            }
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, dataBusMap, ErrorCode.QUERY_SHORTCUT);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_SHORTCUT, e, dataBusMap);
        }
        //首页
        return "/app/menu/main-shortcut";
    }

    /**
     * 快捷菜单配置入口
     * 查询已配置与所有已有权限的末级菜单,不分二三级
     * @param session
     * @param request
     * @param model
     * @param flowNum
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/configPrepare", method = RequestMethod.GET)
    public String configPrepare(HttpSession session, HttpServletRequest request, Model model,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        List<Map<String, Object>> list = null;
        try {
            list = this.findPreShortCut(dataBusMap, sessionStaff);
            if (CollectionUtils.isNotEmpty(list)) {
                model.addAttribute("preSetShortCut", list);
            }
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, dataBusMap, ErrorCode.QUERY_SHORTCUT);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_SHORTCUT, e, dataBusMap);
        }
        //所有菜单
        List<Map<String, Object>> allList = (ArrayList<Map<String, Object>>) session
                .getAttribute(SysConstant.SESSION_KEY_MENU_LIST);
        List<Map<String, Object>> retnList = new ArrayList<Map<String, Object>>();
        this.findLeafOfMenu(allList, retnList);
        model.addAttribute("allLeafMenu", retnList);
        return "/app/menu/main-shortcut-config";
    }

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
            HttpServletResponse response, @LogOperatorAnn String flowNum) {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> dataBusMap = new HashMap<String, Object>();

        if (StringUtils.isNotBlank(MapUtils.getString(param,"resourceId"))) {
            int resourceId = Integer.parseInt(MapUtils.getString(param,"resourceId"));
            dataBusMap.put("resourceId", resourceId);
        } else {
            dataBusMap.put("resourceId", null);
        }
        if (StringUtils.isNotBlank(MapUtils.getString(param,"actionType"))) {
            dataBusMap.put("actionType", MapUtils.getString(param,"actionType"));
        } else {
            dataBusMap.put("actionType", null);
        }
        if (sessionStaff != null) {
            if (StringUtils.isNotBlank(sessionStaff.getStaffId())) {
                dataBusMap.put("staffId", Integer.parseInt(sessionStaff.getStaffId()));
            } else {
                dataBusMap.put("staffId", null);
            }
            if (StringUtils.isNotBlank(sessionStaff.getAreaId())) {
                dataBusMap.put("areaId", Integer.parseInt(sessionStaff.getAreaId()));
            } else {
                dataBusMap.put("areaId", null);
            }
        } else {
            return failed("登陆会话失效，请重新登陆", -1);
        } 	        	
        try {
            int flag = this.menuBmo.setShortcut(dataBusMap, flowNum, sessionStaff);
            return successed("", flag);
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, dataBusMap, ErrorCode.SET_SHORTCUT);
        } catch (Exception e) {
            return super.failed(ErrorCode.SET_SHORTCUT, e, dataBusMap);
        }
    }
}

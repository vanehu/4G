package com.al.lte.portal.pad.controller.main;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
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
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.portal.NoticeBmo;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 4G pad首页控制器
 * 
 * @author liusd
 * @version V1.0
 * @createDate 2014-7-4 上午11:19:15
 * @modifyDate
 * @copyRight 亚信科技电信EC研发部
 */
@Controller("com.al.lte.portal.pad.controller.main.MainController")
@RequestMapping("/pad/main/*")
@AuthorityValid(isCheck = false)
public class MainController extends BaseController {

    @Resource(name = "com.al.ecs.portal.agent.bmo.portal.NoticeBmo")
    private NoticeBmo noticeBmo;

    @Resource(name = "com.al.lte.portal.bmo.crm.OrderBmo")
    private OrderBmo orderBmo;

    @RequestMapping(value = "/home", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(@RequestParam(value = "current", required = false, defaultValue = "home") String current,
            @RequestParam(value = "fromProvFlag", required = false, defaultValue = "0") String fromProvFlag,
            @RequestParam(value = "provIsale", required = false, defaultValue = "") String isale,
            @RequestParam(value = "provCustIdentityCd", required = false, defaultValue = "") String identityCd,
            @RequestParam(value = "provCustIdentityNum", required = false, defaultValue = "") String identityNum,
            @RequestParam(value = "provCustAreaId", required = false, defaultValue = "") String areaId, Model model,
            HttpSession session, HttpServletRequest request) throws AuthorityException {
        model.addAttribute("current", "home");

        //省份单点登录后，甩单到集团crm，使用带入的客户信息自动定位客户
        model.addAttribute("fromProvFlag", fromProvFlag);
        model.addAttribute("provIsale", isale);
        model.addAttribute("provIdentityCd", identityCd);
        model.addAttribute("provIdentityNum", identityNum);
        model.addAttribute("provAreaId", areaId);

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        dataBusMap.put("objCatgName", "recommendOffer,recommendTerminal,hotSaleOffer");

        String channelId = sessionStaff.getCurrentChannelId();
        if (channelId == null || channelId.equals("") || channelId.equals("null")) {
            dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
            dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
        } else {
            dataBusMap.put("areaId", sessionStaff.getAreaId());
            dataBusMap.put("channelId", sessionStaff.getChannelId());
        }
        Map<String, Object> mapHotProd = new HashMap<String, Object>();

        model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "order/prepare"));
        model.addAttribute("hotMap", mapHotProd);
        model.addAttribute("DiffPlaceFlag", "local");
        return "/pad/main/index";
    }

    /**
     * 
     * 提取公告信息,包括单条数据
     * @param session
     * @param model
     * @param param
     * @return
     */
    @RequestMapping(value = "/notice", method = RequestMethod.GET)
    public String notice(HttpSession session, Model model, @RequestParam Map<String, Object> param) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        //传人员id只能查看到本人所在地区公告,其它地区查不到,包括公告范围在上一级的
        //dataBusMap.put("staffId", sessionStaff.getStaffId());
        String bulletinId = MapUtils.getString(param, "bulletinId");
        if (StringUtils.isNotBlank(bulletinId)) {
            dataBusMap.put("bulletinId", bulletinId);
        }
        dataBusMap.put("areaId", sessionStaff.getAreaId());
        dataBusMap.put("pageIndex", 1);
        dataBusMap.put("pageSize", 10);
        List<Map<String, Object>> list = null;

        try {
            list = this.noticeBmo.getNoticeList(dataBusMap, null, sessionStaff);
            if (CollectionUtils.isNotEmpty(list)) {
                if (StringUtils.isNotBlank(bulletinId)) {
                    model.addAttribute("bulletinName", list.get(0).get("bulletinName"));
                    model.addAttribute("createDate", list.get(0).get("createDate"));
                    model.addAttribute("bulletinText", list.get(0).get("bulletinText"));
                }
                model.addAttribute("infoList", list);
            }
            getApConfigMap(model, null, sessionStaff);
        } catch (BusinessException be) {
            this.log.error("公告查询/main/notice方法异常", be);
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            this.log.error("公告查询/main/notice方法异常", ie);
            return super.failedStr(model, ie, dataBusMap, ErrorCode.BULLET_IN_INFO);
        } catch (Exception e) {
            this.log.error("公告查询/main/notice方法异常", e);
            return super.failedStr(model, ErrorCode.BULLET_IN_INFO, e, dataBusMap);
        }
        if (StringUtils.isNotBlank(bulletinId)) {
            return "/pad/main/notice-detail";
        } else {
            return "/pad/main/main-notice";
        }
    }

    /**
     * 取得滚动时间
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
    @SuppressWarnings("unchecked")
    private void getApConfigMap(Model model, String flowNum, SessionStaff sessionStaff) {
        String tableName = "SYSTEM";
        String columnItem = "NOITIC_INTERVAL_TIME";
        List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
        try {
            Object obj = DataRepository.getInstence().getApConfigMap().get(tableName + "-" + columnItem);
            if (obj != null && obj instanceof List) {
                rList = (List<Map<String, Object>>) obj;
            } else {
                Map<String, Object> pMap = new HashMap<String, Object>();
                pMap.put("tableName", tableName);
                pMap.put("columnName", columnItem);
                rList = (List<Map<String, Object>>) this.orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff)
                        .get("result");
                DataRepository.getInstence().getApConfigMap().put(tableName + "-" + columnItem, rList);
            }
            ArrayList<Map<String, Object>> al = (ArrayList) rList.get(0).get("NOITIC_INTERVAL_TIME");
            model.addAttribute("intervalTime", al.get(0).get("COLUMN_VALUE"));
        } catch (BusinessException e) {
            this.log.error("查询配置信息服务出错", e);
        } catch (InterfaceException ie) {

        } catch (Exception e) {

        }
    }
}

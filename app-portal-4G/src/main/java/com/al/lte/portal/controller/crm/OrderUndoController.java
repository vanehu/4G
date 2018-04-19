package com.al.lte.portal.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

import com.al.ecs.common.util.DateUtil;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 撤单功能
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.crm.OrderUndoController")
@RequestMapping("/orderUndo/*")
public class OrderUndoController extends BaseController {

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
    private OrderBmo orderBmo;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;

    @RequestMapping(value = "/main", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String main(@RequestParam(value = "current", required = false, defaultValue = "business") String current,
            Model model, HttpSession session, @LogOperatorAnn String flowNum) throws AuthorityException {
        model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "orderUndo/main"));
        session.removeAttribute("ValidateAccNbr");

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Calendar c = Calendar.getInstance();
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
        String endTime = f.format(c.getTime());
        String startTime = f.format(c.getTime());
        Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);

        model.addAttribute("p_startTime", "");
        model.addAttribute("p_endTime", endTime);
        model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
        model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
        //model.addAttribute("dic_orderStatus", orderStatus);
        //获取员工权限
        String permissionsType = CommonMethods.checkStaffOperatSpec(staffBmo, super.getRequest(), sessionStaff);
        model.addAttribute("permissionsType", permissionsType);
        return "/orderUndo/order-undo-main";
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public String list(HttpSession session, Model model, WebRequest request) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        Map param = new HashMap();
        int dimensionValue = 0;
        try {
            param.put("operatSpecCd", "CD");
            param.put("dataDimensionCd", "DIM_CD_CDFJSL");
            param.put("staffId", sessionStaff.getStaffId());
            param.put("areaId", sessionStaff.getCurrentAreaId());
            rMap = orderBmo.queryAuthenticDataRange(param, null, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                List result = (List) rMap.get("result");
                Map remap = (Map) result.get(0);
                List<Map<String, Object>> dataRanges = (List) remap.get("dataRanges");
                if (dataRanges != null && dataRanges.size() > 0) {
                    int max = Integer.parseInt((String) dataRanges.get(0).get("dimensionValue"));
                    for (int i = 1; i < dataRanges.size(); i++) {
                        String isNotStr = (String) dataRanges.get(i).get("isNot");
                        if (isNotStr.equals("false")) {
                            max = max > Integer.parseInt((String) dataRanges.get(i).get("dimensionValue")) ? max
                                    : Integer.parseInt((String) dataRanges.get(i).get("dimensionValue"));
                        }
                    }
                    dimensionValue = max;
                }
            } else {

            }
        } catch (Exception e) {

        }

        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        dataBusMap.put("dimensionValue", dimensionValue);//

        Map pageData = new HashMap();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer curPage = 1;
        Integer pageSize = 10;
        Integer totalSize = 0;

        String partyId = request.getParameter("p_partyId");
        String areaId = request.getParameter("p_areaId");

        String startDt = request.getParameter("p_startTime");
        String endDt = request.getParameter("p_startTime");

        String channelId = request.getParameter("p_channelId");

        String olNbr = request.getParameter("p_olNbr");
        String accessNumber = request.getParameter("p_hm");
        String permissionsType = request.getParameter("permissionsType");

        dataBusMap.put("areaId", areaId);
        //add by liusd 20151103 防止SQL injection 
        if (StringUtils.isNotBlank(startDt) && startDt.length()<=8 && DateUtil.isRightDate(startDt, "yyyyMMdd")) {
            dataBusMap.put("startDt", startDt);
        }else{
        	//获取当前日期以及当前日期前/后N天的日期 需要两种格式日期，一个为yyyy年MM月dd日 一个为yyyy-MM-dd
            String beginDate = DateUtil.nearDay("yyyyMMdd",-7);
            dataBusMap.put("startDt", beginDate);
            SimpleDateFormat f = new SimpleDateFormat("yyyyMMdd");
            Calendar c = Calendar.getInstance();
            String endTime = f.format(c.getTime());
            String startTime = f.format(c.getTime());
        	dataBusMap.put("endDt", startTime);
        }
        if (StringUtils.isNotBlank(endDt) && startDt.length()<=8 && DateUtil.isRightDate(endDt, "yyyyMMdd")) {
            dataBusMap.put("endDt", endDt);
        }
        if (StringUtils.isNotBlank(partyId) && !partyId.equals("null") && NumberUtils.isNumber(partyId)) {
            dataBusMap.put("partyId", partyId);
        }
        if (StringUtils.isNotBlank(channelId) && !channelId.equals("null") && NumberUtils.isNumber(channelId)) {
            dataBusMap.put("channelId", channelId);
        }
        if (olNbr != null && !olNbr.equals("") && !olNbr.equals("null")) {
            dataBusMap.put("olNbr", olNbr);
        }
        if (accessNumber != null && !accessNumber.equals("") && !accessNumber.equals("null")) {
            dataBusMap.put("accessNumber", accessNumber);
        }
        //个人权限需要传工号
        if (permissionsType.equals("personal")) {
            dataBusMap.put("staffId", sessionStaff.getStaffId());
        }

        dataBusMap.put("unComFlag", "Y");//Y未竣工
        dataBusMap.put("flag", "1");
        Map map = null;
        try {
            curPage = Integer.parseInt(request.getParameter("curPage"));
            pageSize = Integer.parseInt(request.getParameter("pageSize"));
            dataBusMap.put("curPage", curPage);
            dataBusMap.put("pageSize", pageSize);

            map = orderBmo.qryOrderList(dataBusMap, null, sessionStaff);
            if (map != null && map.get("orderListDetailInfo") != null) {
                Map orderListDetailInfo = (Map) map.get("orderListDetailInfo");
                if (orderListDetailInfo != null) {
                    list = (List) orderListDetailInfo.get("orderListInfo");
                    Map mapPageInfo = (Map) orderListDetailInfo.get("page");
                    curPage = (Integer) mapPageInfo.get("curPage");
                    totalSize = (Integer) mapPageInfo.get("totalSize");
                }
            }
            PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(curPage, pageSize, totalSize < 1 ? 1
                    : totalSize, list);
            model.addAttribute("pageModel", pm);
            model.addAttribute("code", map.get("code"));
            model.addAttribute("mess", map.get("mess"));
        } catch (BusinessException be) {

            return super.failedStr(model, be);
        } catch (InterfaceException ie) {

            return super.failedStr(model, ie, dataBusMap, ErrorCode.ORDER_QUERY);
        } catch (Exception e) {
            log.error("撤单查询/orderUndo/list方法异常", e);
            return super.failedStr(model, ErrorCode.ORDER_QUERY, e, dataBusMap);
        }
        return "/orderUndo/order-undo-list";
    }

    //    @RequestMapping(value = "/orderSubmit", method = RequestMethod.POST)
    //	public String orderSubmit(@RequestBody Map<String, Object> param,Model model,HttpServletResponse response) throws BusinessException{
    //    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
    //                SysConstant.SESSION_KEY_LOGIN_STAFF);
    //		Map<String, Object> mapSubmit = null;
    //		try {
    //			//mapSubmit = orderBmo.orderSubmit(orderData,null,sessionStaff);
    //			mapSubmit = orderBmo.orderSubmit(param,null,sessionStaff);
    //			model.addAttribute("resMap",mapSubmit);
    //		} catch (BusinessException be) {			
    //			return super.failedStr(model,be);
    //		} catch (InterfaceException ie) {
    //			return super.failedStr(model,ie, param, ErrorCode.ORDER_SUBMIT);
    //		} catch (Exception e) {
    //			log.error("撤单提交/orderUndo/orderSubmit方法异常", e);
    //			return super.failedStr(model,ErrorCode.ORDER_SUBMIT, e, param);
    //		}
    //		return "/orderUndo/order-confirm";
    //    }
    @ResponseBody
    @RequestMapping(value = "/orderSubmit", method = RequestMethod.POST)
    public JsonResponse orderSubmit(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response)
            throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse = null;
        try {
            Map orderList = (Map) param.get("orderList");
            Map orderListInfo = (Map) orderList.get("orderListInfo");
            orderListInfo.put("staffId", sessionStaff.getStaffId()); //防止前台修改
            //mapSubmit = orderBmo.orderSubmit(orderData,null,sessionStaff);
            Map<String, Object> resMap = orderBmo.orderSubmit(param, null, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                Map result = (Map) resMap.get("result");
                String olId = (String) result.get("olId");
                String soNbr = (String) orderListInfo.get("soNbr");
                if (result.get("ruleInfos") == null) {
                    resMap.put("rolId", olId);
                    resMap.put("rsoNbr", soNbr);
                    resMap.put("checkRule", "checkRule");
                } else {
                    boolean ruleflag = false;
                    List rulelist = (List) result.get("ruleInfos");
                    for (int i = 0; i < rulelist.size(); i++) {
                        Map rulemap = (Map) rulelist.get(i);
                        String ruleLevel = rulemap.get("ruleLevel").toString();
                        if ("4".equals(ruleLevel)) {
                            ruleflag = true;
                            break;
                        }
                    }
                    if (!ruleflag) {
                        resMap.put("rolId", olId);
                        resMap.put("rsoNbr", soNbr);
                        resMap.put("checkRule", "checkRule");
                    }
                }
                jsonResponse = super.successed(resMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(resMap.get("resultMsg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (BusinessException be) {
            jsonResponse = super.failed(be);
        } catch (InterfaceException ie) {
            jsonResponse = super.failed(ie, param, ErrorCode.ORDER_SUBMIT);
        } catch (Exception e) {
            log.error("撤单提交/orderUndo/orderSubmit方法异常", e);
            jsonResponse = super.failed("撤单提交异常", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        }
        return jsonResponse;
    }

    //如果后台校验失败，但省内校验成功，接受orderController订单提交返回的信息，继续拼装订单确认页面
    @RequestMapping(value = "/orderSubmit2", method = RequestMethod.POST)
    public String orderSubmit2(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response)
            throws BusinessException {
        try {
            model.addAttribute("resMap", param);
        } catch (Exception e) {
            log.error("撤单提交/orderUndo/orderSubmit2方法异常", e);
            return super.failedStr(model, ErrorCode.ORDER_SUBMIT, e, param);
        }
        return "/orderUndo/order-confirm";
    }

    @ResponseBody
    @RequestMapping(value = "orderUndoCheck", method = RequestMethod.POST)
    public JsonResponse orderUndoCheck(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response)
            throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse = null;
        Map<String, Object> paramMap = new HashMap<String, Object>();
        paramMap.put("areaId", param.get("areaId"));
        paramMap.put("custOrderId", param.get("custOrderId"));
        paramMap.put("orderItemId", param.get("orderItemId"));
        paramMap.put("ifRepealAll", param.get("ifRepealAll"));
        try {
            Map<String, Object> result = orderBmo.orderUndoCheck(paramMap, null, sessionStaff);
            jsonResponse = super.successed(result, ResultConstant.SUCCESS.getCode());
        } catch (InterfaceException ie) {
            jsonResponse = super.failed(ie, param, ErrorCode.ORDER_UNDO_CHECK);
        } catch (Exception e) {
            this.log.error("撤单校验异常", e);
            jsonResponse = super.failed("撤单校验异常", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        }
        return jsonResponse;
    }
}

package com.al.lte.portal.controller.crm;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CartBmo;
import com.al.lte.portal.bmo.crm.CmBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OneFiveBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.Base64;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * 一证五号业务受理控制器
 *
 * @author liuteng
 * @version 2017-04-18
 * @copyRight 亚信科技EC产品二部
 */
@Controller("com.al.lte.portal.controller.crm.OneCertFiveNumber")
@RequestMapping("/certNumber/*")
public class OneCertFiveNumberController extends BaseController {

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CmBmo")
    private CmBmo cmBmo;
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
    private CustBmo custBmo;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CartBmo")
    private CartBmo cartBmo;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.OneFiveBmo")
    private OneFiveBmo oneFiveBmo;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
    private OrderBmo orderBmo;

    /**
     * 跨省一证五卡受理，受理省入口
     */
    @RequestMapping(value = "/preCertNumber", method = RequestMethod.GET)
    public String preCertNumber(HttpServletRequest request, Model model) {

        Map<String, Object> param = new HashMap();
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
        param.put("partyTypeCd", "1");//查询个人证件类型
        Map<String, Object> rMap;
        try {
            rMap = custBmo.queryCertType(param, "", sessionStaff);
            List<Map<String, Object>> list = (List<Map<String, Object>>) rMap.get("result");
            model.addAttribute("list", list);
        } catch (Exception e) {
        	log.error(e);
        }
        return "/certNumber/certNumber-prepare";
    }

    /**
     * 跨省一证五卡处理，归属省入口
     */
    @RequestMapping(value = "/afterCertNumber", method = RequestMethod.GET)
    public String afterCertNumber(Model model) {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
            SysConstant.SESSION_KEY_LOGIN_STAFF);

        Calendar c = Calendar.getInstance();
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
        String endTime = f.format(c.getTime());
        String startTime = f.format(c.getTime());
        Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);

        model.addAttribute("p_startDt", startTime);
        model.addAttribute("p_endDt", endTime);
        model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
        model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
        model.addAttribute("pageType", "detail");
        return "/certNumber/certNumber-handle-main";
    }

    /**
     * 跨省一证五卡订单列表
     */
    @RequestMapping(value = "/queryOneFiveOrderList", method = RequestMethod.GET)
    public String queryOneFiveOrderList(Model model, @RequestParam Map<String, Object> param) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
            SysConstant.SESSION_KEY_LOGIN_STAFF);
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer totalSize = 0;
        int nowPage = MapUtils.getIntValue(param, "nowPage", 1);
        try {
            param.put("statusCd", SysConstant.ONE_FIVE_NUMBER_STATUS_INIT);
            Map<String, Object> resMap = cartBmo.queryCltCarts(param, null, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                Map<String, Object> map = (Map<String, Object>) resMap.get("result");
                if (map != null && map.get("collectionOrderLists") != null) {
                    list = (List<Map<String, Object>>) map.get("collectionOrderLists");
                    totalSize = MapUtils.getInteger(map, "totalCnt", 1);
                }
                PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(nowPage, 10, totalSize < 1 ? 1
                    : totalSize, list);
                model.addAttribute("pageModel", pm);
                model.addAttribute("code", "0");

            } else {
                model.addAttribute("code", resMap.get("resultCode"));
                model.addAttribute("mess", resMap.get("resultMsg"));
            }
            return "/certNumber/certNumber-handle-list";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.CLTORDER_LIST);
        } catch (Exception e) {
            log.error("采集单查询/order/queryCustCollectionList方法异常", e);
            return super.failedStr(model, ErrorCode.CLTORDER_LIST, e, param);
        }
    }

    /**
     * 跨省一证五卡订单列表详情
     */
    @RequestMapping(value = "/queryOneFiveOrderItemDetail", method = RequestMethod.GET)
    public String queryOneFiveOrderItemDetail(Model model, HttpSession session, @RequestParam Map<String, Object> paramMap) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        try {
            paramMap.put("statusCd", SysConstant.ONE_FIVE_NUMBER_STATUS_INIT);
            Map<String, Object> resMap = cartBmo.queryCltCartOrder(paramMap, null, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                Map<String, Object> cartInfo = (Map<String, Object>) resMap.get("result");

                Map<String, Object> orderList = (Map<String, Object>) cartInfo.get("collectionOrderList");
                model.addAttribute("orderList", orderList);
                model.addAttribute("code", ResultCode.R_SUCC);
            } else {
                model.addAttribute("code", resMap.get("resultCode"));
                model.addAttribute("mess", resMap.get("resultMsg"));
            }
            return "/certNumber/certNumber-handle-detail";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, paramMap, ErrorCode.CLTORDER_DETAIL);
        } catch (Exception e) {
            log.error("购物车详情/order/queryCustCollectionInfo方法异常", e);
            return super.failedStr(model, ErrorCode.CLTORDER_DETAIL, e, paramMap);
        }
    }

    /**
     * 查询证件号码关系清单
     *
     * @param model   模型
     * @param request 请求
     * @return 关系清单
     */
    @RequestMapping(value = "/queryCmRelList", method = RequestMethod.GET)
    public String queryCmRelList(@RequestParam("paramStr") String param,
                                 Model model, @LogOperatorAnn String flowNum,
                                 HttpServletResponse response, HttpServletRequest request) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);

        String curPage = "1";
        String pageSize = "10";
        String totalSize = "0";

        Map<String, Object> map;
        List<Map<String, Object>> list = new ArrayList();
        Map<String, Object> paramMap = JsonUtil.toObject(param, Map.class);
        try {
            List<String> handlingNumbers = new ArrayList<String>();
            map = cmBmo.queryCertNumRelList(paramMap, flowNum, sessionStaff);
            if (ResultCode.R_SUCCESS.equals(map.get("code"))) {
                if (map.get("certPhoneNumRel") != null) {
                    list = (List<Map<String, Object>>) map.get("certPhoneNumRel");

                    Map<String, Object> paramMap2 = new HashMap<String, Object>();
                    Map<String, Object> crMap = MapUtils.getMap(paramMap, "ContractRoot");
                    if (crMap != null) {
                        Map<String, Object> scMap = MapUtils.getMap(crMap, "SvcCont");
                        if (scMap != null) {
                            paramMap2.put("certType", MapUtils.getString(scMap, "certType"));
                            paramMap2.put("certNumber", MapUtils.getString(scMap, "certNum"));
                            paramMap2.put("statusCd", SysConstant.ONE_FIVE_NUMBER_STATUS_INIT);
                        }
                    }
                    for (Map<String, Object> item : list) {
                        paramMap2.put("areaId", MapUtils.getString(item, "lanId", ""));
                        Map<String, Object> resMap = cartBmo.queryCltCartOrderItems(paramMap2, null, sessionStaff);
                        if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                            Map<String, Object> resultMap = MapUtils.getMap(resMap, "result");
                            if (null != resultMap) {
                                List<Map<String, Object>> collectionCustInfos = (List<Map<String, Object>>) MapUtils.getObject(resultMap, "collectionCustInfos");
                                if (null != collectionCustInfos && collectionCustInfos.size() > 0) {
                                    for (Map<String, Object> info : collectionCustInfos) {
                                        handlingNumbers.add(MapUtils.getString(info, "telNumber"));
                                    }
                                }
                            }
                        }
                    }


                    for (Map<String, Object> item : list) {
                        String phoneNum = MapUtils.getString(item, "phoneNum", "");
                        if (handlingNumbers.contains(phoneNum)) {
                            item.put("handleStatus", SysConstant.ONE_FIVE_NUMBER_STATUS_INIT);
                        } else {
                            item.put("handleStatus", "");
                        }
                    }

                    Map<String, Object> mapPageInfo = (Map<String, Object>) map.get("pageRes");
                    curPage = (String) mapPageInfo.get("pageIndex");
                    totalSize = (String) map.get("usedNum");
                    model.addAttribute("totalNumber", totalSize);
                }
            } else {
                return super.failedStr(model, ErrorCode.QUERY_CERT_NUM_REL, map, paramMap);
            }
        } catch (BusinessException e) {
            this.log.error("查询信息失败", e);
            super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CERT_NUM_REL);
        } catch (Exception e) {
            log.debug("异常信息", e);
            return super.failedStr(model, ErrorCode.QUERY_CERT_NUM_REL, e, paramMap);
        }
        PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
            Integer.valueOf(curPage),
            Integer.valueOf(pageSize),
            Integer.valueOf(totalSize) < 1 ? 1 : Integer.valueOf(totalSize),
            list);
        model.addAttribute("pageModel", pm);
        return "/certNumber/certNumber-list";
    }


    /**
     * 附件信息上传
     *
     * @param files 附件数组
     * @param soNbr 流水号
     * @return
     */
    @RequestMapping(value = "/uploadAttachment", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse uploadAttachment(@RequestParam(value = "mFileUpload") CommonsMultipartFile[] files,
                                         @RequestParam(value = "soNbr") String soNbr) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        Map<String, Object> retMap = new HashMap<String, Object>();
        List<Map<String, String>> fileInfos = new ArrayList<Map<String, String>>();
        JsonResponse jsonResponse = null;
        param.put("areaId", sessionStaff != null ? sessionStaff.getCurrentAreaId() : "");
        param.put("soNbr", soNbr);
        param.put("olId", soNbr);
        param.put("srcFlag", SysConstant.ONE_FIVE_SRC_FLAG_REAL);
        for (CommonsMultipartFile file : files) {
            Map<String, String> fileInfo = new HashMap<String, String>();
            String fileName = file.getFileItem().getName();
            String fileType = file.getFileItem().getContentType();
            String picFlag = "";
            long fileSize = file.getSize();
            String fileStr = Base64.encode(file.getBytes());
            fileInfo.put("orderInfo", fileStr);

            if (fileType.startsWith("image")) {
                picFlag = SysConstant.ONE_FIVE_FILE_TYPE_JPG;
            } else if (fileType.endsWith("pdf")) {
                picFlag = SysConstant.ONE_FIVE_FILE_TYPE_PDF;
            }
            fileInfo.put("picFlag", picFlag);
            fileInfos.add(fileInfo);
        }
        param.put("picturesInfo", fileInfos);
        try {
            Map<String, Object> returnMap = oneFiveBmo.uploadFile(param, sessionStaff);
            if (null != returnMap) {
                retMap = MapUtils.getMap(returnMap, "result");
            } else {
                retMap.put("resultCode", ResultCode.R_RULE_EXCEPTION);
            }
            jsonResponse = successed(retMap);
        } catch (InterfaceException e) {
            jsonResponse = failed(e, param, ErrorCode.UPLOAD_FILE);
        } catch (Exception e) {
        	log.error(e);
        }
        return jsonResponse;
    }

    /**
     * 附件信息下载
     *
     * @param paramMap 入参主要为流水号
     * @return
     */
    @RequestMapping(value = "/downAttachment", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse downAttachment(@RequestBody Map<String, Object> paramMap) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> retMap = new HashMap<String, Object>();
        JsonResponse jsonResponse = null;
        paramMap.put("srcFlag", SysConstant.ONE_FIVE_SRC_FLAG_REAL);
        try {
            Map<String, Object> returnMap = oneFiveBmo.downFile(paramMap, sessionStaff);
            if (null != returnMap) {
                retMap = MapUtils.getMap(returnMap, "result");
            } else {
                retMap.put("resultCode", ResultCode.R_RULE_EXCEPTION);
            }
            jsonResponse = successed(retMap);
        } catch (InterfaceException e) {
            jsonResponse = failed(e, paramMap, ErrorCode.DOWN_FILE);
        } catch (Exception e) {
        	log.error(e);
        }
        return jsonResponse;
    }


    /**
     * 一证五卡归属省订单确认
     */
    @ResponseBody
    @RequestMapping(value = "/oneFiveAfterOrderSubmit", method = {RequestMethod.POST})
    public JsonResponse oneFiveAfterOrderSubmit(@RequestBody Map<String, Object> param) throws Exception {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse;
        try {
            Map<String, Object> resMap = orderBmo.cltOrderCommit(param, null, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                jsonResponse = super.successed(ResultConstant.SUCCESS);
            } else {
                jsonResponse = super.failed(resMap.get("resultMsg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.CLTORDER_COMMIT);
        } catch (Exception e) {
            return super.failed(ErrorCode.CLTORDER_COMMIT, e, param);
        }
        return jsonResponse;
    }


    /**
     * 一证五卡归属省订单确认预校验
     */
    @ResponseBody
    @RequestMapping(value = "/oneFiveAfterOrderPreCheck", method = {RequestMethod.POST})
    public JsonResponse oneFiveAfterOrderPreCheck(@RequestBody Map<String, Object> param) throws Exception {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse;
        Map<String, Object> csbParam = MapUtils.getMap(param, "csbParam");
        String telNumber = MapUtils.getString(param, "telNumber", "");
        try {
            Map<String, Object> map = cmBmo.queryCertNumRelList(csbParam, null, sessionStaff);
            Map<String, Object> resultMap = new HashMap();
            boolean isExist = false;
            if (ResultCode.R_SUCCESS.equals(map.get("code"))) {
                if (map.get("certPhoneNumRel") != null) {
                    List<Map<String, Object>> list = (List<Map<String, Object>>) map.get("certPhoneNumRel");
                    for (Map<String, Object> item : list) {
                        if (StringUtils.isNotBlank(telNumber) && telNumber.equals(MapUtils.getString(item, "phoneNum", ""))) {
                            isExist = true;
                        }
                    }
                }
            }
            resultMap.put("isExist", isExist);
            jsonResponse = successed(resultMap);
        } catch (BusinessException e) {
            return failed(e);
        } catch (InterfaceException ie) {
            return failed(ie, param, ErrorCode.CLTORDER_COMMIT);
        } catch (Exception e) {
            return failed(ErrorCode.CLTORDER_COMMIT, e, param);
        }
        return jsonResponse;
    }


}

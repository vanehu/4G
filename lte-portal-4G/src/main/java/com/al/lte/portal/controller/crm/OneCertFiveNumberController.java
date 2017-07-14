package com.al.lte.portal.controller.crm;

import com.al.ecs.common.util.DateUtil;
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
import com.al.lte.portal.bmo.staff.StaffBmo;
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

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;

    /**
     * 跨省一证五卡受理，受理省入口
     */
    @RequestMapping(value = "/preCertNumber", method = RequestMethod.GET)
    public String preCertNumber(HttpServletRequest request, Model model) {

        Map<String, Object> param = new HashMap();
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
        param.put("partyTypeCd", "1");//查询个人证件类型
        String isHand = "-1";
        Map<String, Object> rMap;
        try {
            rMap = custBmo.queryCertType(param, "", sessionStaff);
            List<Map<String, Object>> list = (List<Map<String, Object>>) rMap.get("result");
            model.addAttribute("list", list);

            isHand = staffBmo.checkOperatSpec(SysConstant.YWCLSSSFZ, sessionStaff);
        } catch (Exception e) {
            e.printStackTrace();
        }
        model.addAttribute("isHand", isHand);
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
        return "/certNumber/certNumber-handle-main";
    }

    /**
     * 跨省一证五卡查询入口
     */
    @RequestMapping(value = "/certNumberQuery", method = RequestMethod.GET)
    public String certNumberQuery(Model model) {

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
        return "/certNumber/certNumber-query-main";
    }

    /**
     * 跨省一证五卡报表
     */
    @RequestMapping(value = "/certNumberReport", method = RequestMethod.GET)
    public String certNumberReport(Model model) {

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
        return "/certNumber/certNumber-report-main";
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
        String ifFilterOwnAccNbr = MapUtils.getString(param, "ifFilterOwnAccNbr", "");
        if (SysConstant.STR_Y.equals(ifFilterOwnAccNbr)) {
            param.put("handleStaffId", sessionStaff.getStaffId());
        }
        try {
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
            if (SysConstant.ONE_FIVE_NUMBER_STATUS_INIT.equals(MapUtils.getString(param, "statusCd", ""))) {
                return "/certNumber/certNumber-handle-list";
            } else {
                return "/certNumber/certNumber-query-list";
            }
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
     * 跨省一证五卡报表列表
     */
    @RequestMapping(value = "/queryOneFiveReportList", method = RequestMethod.GET)
    public String queryOneFiveReportList(Model model, @RequestParam Map<String, Object> param) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        List<Map<String, Object>> resultlist = new ArrayList<Map<String, Object>>();
        Integer totalSize = 0;
        try {
            Calendar startDate = Calendar.getInstance();
            Calendar endDate = Calendar.getInstance();
            startDate.setTime(DateUtil.getDateFromString(MapUtils.getString(param, "startDt", DateUtil.getNow(DateUtil.DATE_FORMATE_STRING_H)), DateUtil.DATE_FORMATE_STRING_H));
            endDate.setTime(DateUtil.getDateFromString(MapUtils.getString(param, "endDt", DateUtil.getNow(DateUtil.DATE_FORMATE_STRING_H)), DateUtil.DATE_FORMATE_STRING_H));

            Map<String, Object> resMap = oneFiveBmo.queryReport(param, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                Map<String, Object> map = (Map<String, Object>) resMap.get("result");
                if (map != null && map.get("cntInfo") != null) {
                    list = (List<Map<String, Object>>) map.get("cntInfo");
                    totalSize = list.size();
                    while (startDate.before(endDate) || startDate.equals(endDate)) {
                        String currentDateStr = DateUtil.formatDate(startDate.getTime(), DateUtil.DATE_FORMATE_STRING_H);
                        boolean exist = false;
                        for (Map<String, Object> item : list) {
                            String acceptDate = MapUtils.getString(item, "acceptDate");
                            if (currentDateStr.equals(acceptDate)) {
                                resultlist.add(item);
                                exist = true;
                            }
                        }
                        if (!exist) {
                            Map<String, Object> emptyItem = new HashMap<String, Object>();
                            emptyItem.put("acceptDate", currentDateStr);
                            emptyItem.put("initialOrderCnt", 0);
                            emptyItem.put("doingOrderCnt", 0);
                            emptyItem.put("cancelOrderCnt", 0);
                            emptyItem.put("finishOrderCnt", 0);
                            emptyItem.put("totalCnt", 0);
                            resultlist.add(emptyItem);
                        }
                        startDate.add(Calendar.DATE, 1);
                    }
                    if (resultlist.size() > 1) {
                        Map<String, Object> totalCount = new HashMap<String, Object>();
                        totalCount.put("acceptDate", MapUtils.getString(param, "startDt", DateUtil.getNow(DateUtil.DATE_FORMATE_STRING_H)) + "/" + MapUtils.getString(param, "endDt", DateUtil.getNow(DateUtil.DATE_FORMATE_STRING_H)));
                        Long initialOrderCnt = 0L;
                        Long doingOrderCnt = 0L;
                        Long cancelOrderCnt = 0L;
                        Long finishOrderCnt = 0L;
                        for (Map<String, Object> rMap : resultlist) {
                            initialOrderCnt += MapUtils.getLong(rMap, "initialOrderCnt", 0L);
                            doingOrderCnt += MapUtils.getLong(rMap, "doingOrderCnt", 0L);
                            cancelOrderCnt += MapUtils.getLong(rMap, "cancelOrderCnt", 0L);
                            finishOrderCnt += MapUtils.getLong(rMap, "finishOrderCnt", 0L);
                        }
                        totalCount.put("initialOrderCnt", initialOrderCnt);
                        totalCount.put("doingOrderCnt", doingOrderCnt);
                        totalCount.put("cancelOrderCnt", cancelOrderCnt);
                        totalCount.put("finishOrderCnt", finishOrderCnt);
                        totalCount.put("totalCnt", initialOrderCnt + doingOrderCnt + cancelOrderCnt + finishOrderCnt);
                        resultlist.add(totalCount);
                    }
                }
                PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(1, totalSize, totalSize < 1 ? 1
                        : totalSize, resultlist);
                model.addAttribute("pageModel", pm);
                model.addAttribute("code", "0");

            } else {
                model.addAttribute("code", resMap.get("resultCode"));
                model.addAttribute("mess", resMap.get("resultMsg"));
            }
            return "/certNumber/certNumber-report-list";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.CLTORDER_LIST);
        } catch (Exception e) {
            log.error("采集单报表查询service/intf.detailService/queryCollectionOrderItemCount方法异常", e);
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
     * 跨省一证五卡订单列表详情
     */
    @RequestMapping(value = "/queryOneFiveOrderItemDetailAll", method = RequestMethod.GET)
    public String queryOneFiveOrderItemDetailAll(Model model, @RequestParam Map<String, Object> paramMap) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        try {
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
            return "/certNumber/certNumber-query-detail";
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
    public JsonResponse uploadAttachment(@RequestParam(value = "mFileUpload", required = false) CommonsMultipartFile[] files,
                                         @RequestParam(value = "certImg", required = false) String certImg,
                                         @RequestParam(value = "photograph", required = false) String photograph,
                                         @RequestParam(value = "type") String type,
                                         @RequestParam(value = "soNbr") String soNbr) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, String>> errorList = new ArrayList<Map<String, String>>();
        Map<String, Object> retMap = new HashMap<String, Object>();
        List<Map<String, String>> fileInfos = new ArrayList<Map<String, String>>();
        JsonResponse jsonResponse = null;
        param.put("areaId", sessionStaff != null ? sessionStaff.getCurrentAreaId() : "");
        param.put("soNbr", soNbr);
        param.put("olId", soNbr);
        param.put("operateStaffId", sessionStaff.getStaffId());
        param.put("srcFlag", SysConstant.ONE_FIVE_SRC_FLAG_REAL);


        if (StringUtils.isNotBlank(photograph)) {
            if (StringUtils.isNotBlank(certImg)) {
                if (checkFiles(SysConstant.ONE_FIVE_FILE_TYPE_IMAGE, SysConstant.ONE_FIVE_FILE_TYPE_JPG_JBR, errorList, certImg.length(), "经办人身份证读卡照片", null)) {
                    buildFileInfo(certImg, SysConstant.ONE_FIVE_FILE_TYPE_JPG_JBR, fileInfos);
                }
            }
            if (checkFiles(SysConstant.ONE_FIVE_FILE_TYPE_IMAGE, SysConstant.ONE_FIVE_FILE_TYPE_JPG_JBR, errorList, photograph.length(), "经办人拍照照片", null)) {
                buildFileInfo(photograph, SysConstant.ONE_FIVE_FILE_TYPE_JPG_JBR, fileInfos);
            }
        } else {
            for (CommonsMultipartFile file : files) {
                String fileType = file.getFileItem().getContentType();//文件类型
                if (checkFiles(type, getPicFlag(type, fileType), errorList, 0, "", file)) {
                    buildFileInfo(Base64.encode(file.getBytes()), getPicFlag(type, fileType), fileInfos);
                }
            }
        }
        param.put("picturesInfo", fileInfos);
        if (errorList.size() > 0) {
            retMap.put("errorList", errorList);
            return failed(retMap, -1);
        }
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
            e.printStackTrace();
        }
        return jsonResponse;
    }

    /**
     * 构建文件信息对象
     *
     * @param imgInfo   照片信息
     * @param picFlag   文件标识
     * @param fileInfos 文件信息列表
     */
    private void buildFileInfo(String imgInfo, String picFlag, List<Map<String, String>> fileInfos) {
        Map<String, String> fileInfo = new HashMap<String, String>();
        fileInfo.put("orderInfo", imgInfo);
        fileInfo.put("picFlag", picFlag);
        fileInfos.add(fileInfo);

    }

    /**
     * 文件校验
     *
     * @param fileType
     * @param picFlag
     * @param errorList
     * @param file
     * @return
     */
    private boolean checkFiles(String fileType, String picFlag, List<Map<String, String>> errorList, long fileSize, String fileName, CommonsMultipartFile file) {

        Map<String, String> errorMap = new HashMap<String, String>();
        fileSize = ((null != file) ? file.getSize() : fileSize);//文件大小校验
        if (fileSize > SysConstant.DEFAULT_FILE_SIZE) {
            errorMap.put("fileSize", String.valueOf(fileSize));
            errorMap.put("fileType", fileType);
        }
        if (StringUtils.isBlank(picFlag)) {//文件类型校验
            errorMap.put("fileType", fileType);
            errorMap.put("fileSize", String.valueOf(fileSize));
        }
        if (errorMap.isEmpty()) {
            return true;
        } else {
            errorMap.put("fileName", ((null != file) ? file.getFileItem().getName() : fileName));//文件名
            errorList.add(errorMap);
        }
        return false;
    }

    /**
     * 获取文件标识
     *
     * @param type     上传类型
     * @param fileType 文件类型
     * @return 文件标识
     */
    private String getPicFlag(String type, String fileType) {
        String picFlag = "";
        if (SysConstant.ONE_FIVE_FILE_TYPE_Pdf.equals(type)) {
            if (fileType.startsWith("image")) {
                picFlag = SysConstant.ONE_FIVE_FILE_TYPE_JPG;
            } else if (fileType.endsWith("pdf")) {
                picFlag = SysConstant.ONE_FIVE_FILE_TYPE_PDF;
            }
        } else if (SysConstant.ONE_FIVE_FILE_TYPE_Front.equals(type)) {
            picFlag = SysConstant.ONE_FIVE_FILE_TYPE_JPG_FRONT;
        } else if (SysConstant.ONE_FIVE_FILE_TYPE_Back.equals(type)) {
            picFlag = SysConstant.ONE_FIVE_FILE_TYPE_JPG_BACK;
        } else if (SysConstant.ONE_FIVE_FILE_TYPE_Jbr.equals(type)) {
            picFlag = SysConstant.ONE_FIVE_FILE_TYPE_JPG_JBR;
        } else {
            picFlag = SysConstant.ONE_FIVE_FILE_TYPE_JPG_OTHER;
        }
        return picFlag;
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
            e.printStackTrace();
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
            param.put("channelId", sessionStaff.getCurrentChannelId());
            param.put("staffId", sessionStaff.getStaffId());
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

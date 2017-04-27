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
import com.al.lte.portal.common.Base64;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;
import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
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

    /**
     * 实名信息采集单入口
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
            e.printStackTrace();
        }
        return "/certNumber/certNumber-prepare";
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
            map = cmBmo.queryCertNumRelList(paramMap, flowNum, sessionStaff);
            if (ResultCode.R_SUCCESS.equals(map.get("code"))) {
                if (map.get("certPhoneNumRel") != null) {
                    list = (List<Map<String, Object>>) map.get("certPhoneNumRel");

                    Map<String, Object> paramMap2 = new HashMap<>();
                    Map<String, Object> crMap = MapUtils.getMap(paramMap, "ContractRoot");
                    if (crMap != null) {
                        Map<String, Object> scMap = MapUtils.getMap(crMap, "SvcCont");
                        if (scMap != null) {
                            paramMap2.put("certType", MapUtils.getString(scMap, "certType"));
                            paramMap2.put("certNumber", MapUtils.getString(scMap, "certNum"));
                            paramMap2.put("areaId", sessionStaff != null ? sessionStaff.getCurrentAreaId() : "");
                            paramMap2.put("statusCd", SysConstant.ONE_FIVE_NUMBER_STATUS_INIT);
                        }
                    }
                    Map<String, Object> resMap = cartBmo.queryCltCartOrderItems(paramMap2, null, sessionStaff);
                    List<String> handlingNumbers = new ArrayList<>();
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


    @RequestMapping(value = "/uploadAttachment", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse uploadAttachment(Model model, @RequestParam(value = "mFileUpload") CommonsMultipartFile[] files,
                                         @RequestParam(value = "soNbr") String soNbr) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<>();
        Map<String, Object> retMap = new HashMap<>();
        List<Map<String, String>> fileInfos = new ArrayList<>();
        JsonResponse jsonResponse = null;
        param.put("areaId", sessionStaff != null ? sessionStaff.getCurrentAreaId() : "");
        param.put("soNbr", soNbr);
        param.put("srcFlag", SysConstant.ONE_FIVE_SRC_FLAG_REAL);
        for (CommonsMultipartFile file : files) {
            Map<String, String> fileInfo = new HashMap<>();
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
            e.printStackTrace();
        }
        return jsonResponse;
    }
}

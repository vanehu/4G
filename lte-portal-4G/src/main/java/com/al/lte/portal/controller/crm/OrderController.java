package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
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

import com.al.common.utils.StringUtil;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.DigestUtils;
import com.al.ecs.common.util.EncodeUtils;
import com.al.ecs.common.util.FtpUtils;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CartBmo;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.ProdBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 订单受理控制层 主要受理，新装，变更，附属变更
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.crm.OrderController")
@RequestMapping("/order/*")
public class OrderController extends BaseController {

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
    private OrderBmo orderBmo;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
    private CustBmo custBmo;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.print.PrintBmo")
    private PrintBmo printBmo;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
    private CommonBmo commonBmo;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.ProdBmo")
    private ProdBmo prodBmo;
    
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CartBmo")
    private CartBmo cartBmo;

    @Autowired
    PropertiesUtils propertiesUtils;

    /** 短信验证前，登陆会话临时ID */
    public static final String SESSION_KEY_TEMP_LOGIN_STAFF = "_session_key_tenm_sms";

    @RequestMapping(value = "/orderSubmitComplete", method = RequestMethod.POST)
    public @ResponseBody
    JsonResponse orderSubmitComplete(@RequestBody Map<String, Object> reqMap, HttpServletResponse response,
            HttpServletRequest request) {
        JsonResponse jsonResponse = null;
        if (commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)) {
            try {
                SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_LOGIN_STAFF);

                Map<String, Object> resMap = orderBmo.orderSubmitComplete(reqMap, null, sessionStaff);
                if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                    jsonResponse = super.successed(resMap, ResultConstant.SUCCESS.getCode());
                } else {
                    throw new InterfaceException(ErrType.CATCH, PortalServiceCode.ORDER_SUBMIT, String.valueOf(resMap
                            .get("resultMsg")), JsonUtil.toString(reqMap));
                }
            } catch (BusinessException be) {
                this.log.error("订单一点提交失败", be);
                return super.failed(be);
            } catch (InterfaceException ie) {
                return super.failed(ie, reqMap, ErrorCode.ORDER_SUBMIT);
            } catch (Exception e) {
                log.error("订单一点提交失败方法异常", e);
                return super.failed(ErrorCode.ORDER_SUBMIT, e, reqMap);
            }
            return jsonResponse;
        } else {
            log.error("订单提交失败");
            return jsonResponse;
        }
    }

    /**
     * 暂存单查询，“取消”按钮触发该操作请求
     * @param reqMap
     * @param model
     * @return
     */
    @RequestMapping(value = "/delOrder", method = { RequestMethod.GET })
    public @ResponseBody
    JsonResponse delOrder(@RequestParam Map<String, Object> reqMap, Model model) {
        JsonResponse jsonResponse = null;
        try {
        	//从会话中获取缓存的订单数据(购物车ID和订单类型),对于能力开放和界面集成的单子限制其在集团CRM进行受理
            Map<String, Object> orderListsInfo = (Map<String, Object>) ServletUtils.getSessionAttribute(super.getRequest(), "orderListsInfo");
          //会话中不存在orderListsInfo说明不是暂存单或者分段受理单，则不做限制
            if(orderListsInfo != null && orderListsInfo.size() > 0){
            	Map<String, Object> saveOrderLists = (Map<String, Object>) orderListsInfo.get("saveOrderLists");
            	//会话中不存在saveOrderLists说明不是暂存单或者分段受理单，则不做限制
            	if(saveOrderLists != null && saveOrderLists.size() > 0){
            		String olId = reqMap.get("olId").toString();
                    if(saveOrderLists.containsKey(olId)){//客户端请求中的olId在会话中存在
                    	String olTypeCd = saveOrderLists.get(olId).toString();//获取订单类型
                    	if("8".equals(olTypeCd)){//界面集成订单(前台UI暂存订单)
                			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, reqMap, null, new Throwable("订单号["+olId+"]为界面集成订单(UI暂存订单)，不可以在集团CRM进行受理，请不要非法操作."));
                    	} else if("9".equals(olTypeCd)){//能力开放订单(API接口暂存订单)
                			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, reqMap, null, new Throwable("订单号["+olId+"]为能力开放订单(API接口暂存订单)，不可以在集团CRM进行受理，请不要非法操作."));
                    	}
                    } else{//会话中不存在客户端请求中的olId，可能有非正常请求，例如前端js的限制被篡改
//            			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, reqMap, null, new Throwable("订单号["+olId+"]数据异常，当前会话中不存在该订单号，请刷新页面再尝试."));
                    }
            	}
            }
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
            Map<String, Object> resMap = orderBmo.delOrder(reqMap, null, sessionStaff);
            jsonResponse = super.successed(resMap, ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
            this.log.error("作废购物车失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {

            return super.failed(ie, reqMap, ErrorCode.DEL_ORDER);
        } catch (Exception e) {
            log.error("作废购物车/order/delOrder方法异常", e);
            return super.failed(ErrorCode.DEL_ORDER, e, reqMap);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/prodoffer/prepare", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(@RequestParam(value = "current", required = false, defaultValue = "home") String current,
            Model model, HttpServletRequest request) throws AuthorityException {

        String prodOfferId = request.getParameter("prodOfferId");
        String subPage = request.getParameter("subPage");
        String numsubflag = request.getParameter("numsubflag");
        if (prodOfferId != null && !prodOfferId.equals("") && !prodOfferId.equals("null")) {
            model.addAttribute("prodOfferId", prodOfferId);
        }
        if (subPage != null && !subPage.equals("") && !subPage.equals("null")) {
            model.addAttribute("subPage", subPage);
        }
        if (numsubflag != null && !numsubflag.equals("") && !numsubflag.equals("null")) {
            model.addAttribute("numsubflag", numsubflag);
        }
        return "/order/order-search";
    }

    @RequestMapping(value = "/preparep", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String preparep(@RequestParam Map<String, Object> mktRes, HttpServletRequest request, Model model,
            HttpSession session) {
        model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "order/prepare"));
        //mktRes.put("mktResName", MapUtil.asStr(param, "mktName"));
        //mktRes.put("salePrice", MapUtil.asStr(param, "mktPrice"));
        //mktRes.put("mktPicA", MapUtil.asStr(param, "mktPicA"));
        //mktRes.put("channelId", sessionStaff.getCurrentChannelId());
        model.addAttribute("mktRes", mktRes);
        model.addAttribute("DiffPlaceFlag", "local");
        return "/order/order-prepare";
    }

    @RequestMapping(value = "/preparedp", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String preparedp(@RequestParam Map<String, Object> mktRes, HttpServletRequest request, Model model,
            HttpSession session) {
        //model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/prepare"));
        model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "order/prepare"));
        //mktRes.put("mktResName", MapUtil.asStr(param, "mktName"));
        //mktRes.put("salePrice", MapUtil.asStr(param, "mktPrice"));
        //mktRes.put("mktPicA", MapUtil.asStr(param, "mktPicA"));
        //mktRes.put("channelId", sessionStaff.getCurrentChannelId());
        session.setAttribute(SysConstant.SESSION_KEY_DIFFPLACEFLAG, "diff");
        model.addAttribute("DiffPlaceFlag", "diff");
        return "/order/order-prepare";
    }
    /**
     * 改客户资料返档入口
     * 
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/prepareCustfd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String prepareCustFanDang(@RequestParam Map<String, Object> mktRes, HttpServletRequest request, Model model,
            HttpSession session) {
        model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "order/prepare"));
        model.addAttribute("menuName", SysConstant.GKHZLFD);
        model.addAttribute("DiffPlaceFlag", "local");
        return "/order/order-prepare";
    }
    /**
     * 过户返档入口
     * 
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/preparefd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String preparCustFanDang(@RequestParam Map<String, Object> mktRes, HttpServletRequest request, Model model,
            HttpSession session) {
        model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "order/prepare"));
        model.addAttribute("menuName", SysConstant.GHFD);
        model.addAttribute("DiffPlaceFlag", "local");
        return "/order/order-prepare";
    }

    /**
     * ?flowStep=order_tab_panel_offer-10011,5000000901100003#step1 第一个参数是入口TAB
     * 
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/prepare", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String prepare(@RequestParam Map<String, Object> param, HttpSession session, Model model) {
        //model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/prepare"));
        model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "order/prepare"));
        log.debug("prepare.param={}", param);
        model.addAttribute("mktRes", param);
        model.addAttribute("DiffPlaceFlag", "local");
        //		String[] params = param.split("-");
        //		if (params.length > 0) {
        //			model.addAttribute("flowStep", params[0]);
        //		} else {
        //			model.addAttribute("flowStep", "order_tab_panel_terminal");
        //		}
        //		if (params.length > 1) {
        //			model.addAttribute("flowStepParam", params[1]);
        //		} else {
        //			model.addAttribute("flowStepParam", "");
        //		}
        return "/order/order-prepare";
    }

    /**
     * 与翼支付消费金融平台--高级实名认证
     * @param session
     * @param model
     * @return 高级实名认证页面
     */
    @RequestMapping(value = "/highRealName", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String highRealName(HttpSession session, Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);

        model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "/order/highRealName"));
        model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
        model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));

         return "/order/high-real-name-authenticate";
    }

    /**
     * 与翼支付消费金融平台--高级实名认证
     * @param session
     * @return 高级实名认证结果
     */
    @RequestMapping(value = "/highRealNameAuthenticate", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse highRealNameAuthenticate(@RequestBody Map<String, Object> param, @LogOperatorAnn String optFlowNum, HttpSession session) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> retMap=new HashedMap();
        Map<String, Object> custInfo;
        Map<String, Object> paramMap = new HashedMap();
        try {
            String sessionCertNumber = (String) ServletUtils.getSessionAttribute(getRequest(), Const.CACHE_CERTINFO);
            ServletUtils.removeSessionAttribute(getRequest(),Const.CACHE_CERTINFO);
            String tmpIdCardNumber = MapUtils.getString(param, "certNumber", "");
            if(!tmpIdCardNumber.equals(sessionCertNumber)) {
                retMap.put("certCheckInfo", "非正常读卡数据，信息可能被窜改，此操作将被记录！");
                return super.failed(retMap, ResultConstant.FAILD.getCode());
            }


            paramMap.put("identityCd", "");
            paramMap.put("areaId", MapUtils.getString(param, "areaId", ""));
            paramMap.put("acctNbr", MapUtils.getString(param, "number", ""));
            paramMap.put("soNbr", MapUtils.getString(param, "soNbr", ""));
            paramMap.put("staffId", sessionStaff.getStaffId());
            boolean isCertUser = false;
            custInfo = custBmo.queryCustInfo(paramMap,
                    optFlowNum, sessionStaff);
            if(null!=custInfo){
                List<Map<String, Object>> custInfos = (List<Map<String, Object>>) MapUtils.getObject(custInfo, "custInfos", null);
                if(null!=custInfos&&custInfos.size()==1){
                    Map<String, Object> cust = custInfos.get(0);
                    if(null!=cust){
                        String identityCd = MapUtils.getString(cust, "identityCd", "");
                        if("1".equals(identityCd)){
                            isCertUser = true;
                        }
                    }
                }
            }
            if (isCertUser) {
                String areaId = MapUtils.getString(param, "areaId", "");
                Map<String, Object> hrnParam = new HashedMap();

                Map<String, Object> body = new HashedMap();
                body.put("userName", MapUtils.getString(param, "userName", ""));
                body.put("idType", MapUtils.getString(param, "idType", ""));
                body.put("idNumber", MapUtils.getString(param, "certNumber", ""));
                body.put("accountNumber", MapUtils.getString(param, "number", ""));
                body.put("acceptAreaCode", (StringUtils.isNotBlank(areaId) && areaId.length() == 7) ? MapUtils.getString(param, "areaId", "").substring(1, 3) + "0000" : "");
                body.put("acceptCityCode", (StringUtils.isNotBlank(areaId) && areaId.length() == 7) ? MapUtils.getString(param, "areaId", "").substring(1) : "");
                body.put("superMerchantCode", MapUtils.getString(param, "channelCode", ""));
                body.put("superMerchantName", MapUtils.getString(param, "channelName", ""));

                hrnParam.put("body", body);

                Map<String, Object> returnMap = orderBmo.highRealNameAuthenticate(hrnParam, optFlowNum, sessionStaff);
                if (null != returnMap) {
                    retMap = MapUtils.getMap(returnMap, "result");
                }
            } else {
                retMap.put("resultCode", ResultCode.R_RULE_EXCEPTION);
            }
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.HIGH_REAL_NAME_AUTHENTICATE);
        } catch (Exception e) {
            log.error("门户调用后台高级实名制认证接口service/intf.acctService/highRealNameAuthenticate方法异常", e);
            return super.failed(ErrorCode.HIGH_REAL_NAME_AUTHENTICATE, e, param);
        }
        return super.successed(retMap);
    }

   /**
     * 与翼支付消费金融平台--撤销鉴权
     * @param session
     * @return 高级实名认证结果
     */
    @RequestMapping(value = "/revokeAuthentication", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse revokeAuthentication(@RequestBody Map<String, Object> param, @LogOperatorAnn String optFlowNum, HttpSession session) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> retMap = new HashedMap();
        try {

            Map<String, Object> body = new HashedMap();
            body.put("mobilePhone", MapUtils.getString(param, "mobilePhone", ""));
            body.put("busiType", "2");//1：冻结业务2：预冻结撤销
            body.put("superMerchantCode", MapUtils.getString(param, "channelCode", ""));
            body.put("superMerchantName", MapUtils.getString(param, "channelName", ""));

            Map<String, Object> rnParam = new HashedMap();
            rnParam.put("body", body);

            Map<String, Object> returnMap = orderBmo.revokeAuthentication(rnParam, optFlowNum, sessionStaff);
            if (null != returnMap) {
                retMap = MapUtils.getMap(returnMap, "result");
            } else {
                retMap.put("resultCode", ResultCode.R_RULE_EXCEPTION);
            }
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.HIGH_REAL_NAME_AUTHENTICATE);
        } catch (Exception e) {
            log.error("门户调用后台撤销鉴权接口service/intf.acctService/highRealNameAuthenticate方法异常", e);
            return super.failed(ErrorCode.HIGH_REAL_NAME_AUTHENTICATE, e, param);
        }
        return super.successed(retMap);
    }

    /**
     *
     *
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/preInstalled", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String preInstall(@RequestParam Map<String, Object> param, HttpSession session, Model model) {
        model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "order/preInstalled"));
        log.debug("preInstall.param={}", param);
        model.addAttribute("mktRes", param);
        model.addAttribute("DiffPlaceFlag", "local");
        return "/order/order-prepare-preinstall";
    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/queryApConf", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse queryAgentPortalConfig(@RequestParam Map<String, Object> param, Model model,
            @LogOperatorAnn String flowNum, HttpServletResponse response) {
        //		Map<String, Object> map = new HashMap<String, Object>();
        JsonResponse jsonResponse = null;
        List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String configParamType = String.valueOf(param.get("CONFIG_PARAM_TYPE"));
        String tableName = null;
        String columnItems = "";
        if ("TERMINAL_AND_PHONENUMBER".equals(configParamType)) {
            columnItems = "PHONE_NUMBER_PRESTORE,PHONE_NUMBER_SEGMENT,PHONE_NUMBER_FEATURE,PHONE_BRAND,PHONE_PRICE_AREA,PHONE_TYPE";
            tableName = "SYSTEM";
        } else if ("PROD_AND_OFFER".equals(configParamType)) {
            columnItems = "OFFER_PRICE,OFFER_INFLUX,OFFER_INVOICE";
            tableName = "SYSTEM";
        } else if ("BILL_POST".equals(configParamType)) {
            columnItems = "BILL_POST_TYPE,BILL_POST_CONTENT,BILL_POST_CYCLE";
            tableName = "SYSTEM";
        }
        try {
            Object obj = DataRepository.getInstence().getApConfigMap().get(tableName + "-" + columnItems);
            if (obj != null && obj instanceof List) {
                rList = (List<Map<String, Object>>) obj;
            } else {
                Map<String, Object> pMap = new HashMap<String, Object>();
                pMap.put("tableName", tableName);
                pMap.put("columnName", columnItems);
                rList = (List<Map<String, Object>>) orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get(
                        "result");
                DataRepository.getInstence().getApConfigMap().put(tableName + "-" + columnItems, rList);
            }
            jsonResponse = super.successed(rList, ResultConstant.SUCCESS.getCode());
        } catch (BusinessException e) {
            this.log.error("查询配置信息服务出错", e);
            jsonResponse = super.failed("查询配置信息服务出错", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        } catch (InterfaceException ie) {

        } catch (Exception e) {

        }
        return jsonResponse;
    }

    @RequestMapping(value = "/prodModifyCommon", method = { RequestMethod.POST })
    public String removeProd(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        if (!MapUtils.isEmpty(param)) {
            //添加一些属性
            param.put("offerNum", 1);
            model.addAttribute("main", param);
        }
        return "/order/order-modify-common";
    }

    @RequestMapping(value = "/remove/submit", method = { RequestMethod.POST })
    public String removeSubmit(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        return "";//return general order submit url
    }

    @RequestMapping(value = "/remove/cancel", method = { RequestMethod.POST })
    public String callRemove(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        return "";//return general order cancel url
    }

    @RequestMapping(value = "/entrance", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String entrance(Model model) {
        model.addAttribute("code", "0");
        return "/order/order-entrance";
    }

    /*bxw产品规格属性*/
    @RequestMapping(value = "/orderSpecParam", method = RequestMethod.GET)
    public String orderSpecParam(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        String ul_id = request.getParameter("ul_id");
        String prodId = request.getParameter("prodId");
        String offerSpecId = request.getParameter("offerSpecId");
        String prodSpecId = request.getParameter("prodSpecId");
        String compProdSpecId = request.getParameter("compProdSpecId");
        String partyId = request.getParameter("partyId");
        String offerRoleId = request.getParameter("offerRoleId");
        String roleCd = request.getParameter("roleCd");

        dataBusMap.put("offerSpecId", offerSpecId);
        dataBusMap.put("prodSpecId", prodSpecId);//379
        if (compProdSpecId != null && !compProdSpecId.equals("") && !compProdSpecId.equals("null")) {
            dataBusMap.put("compProdSpecId", compProdSpecId);//80000101
        }
        dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());//20
        dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
        dataBusMap.put("staffId", sessionStaff.getStaffId());
        dataBusMap.put("partyId", partyId);
        dataBusMap.put("offerRoleId", offerRoleId);
        dataBusMap.put("roleCd", roleCd);//2

        Map result = null;
        List<Map<String, Object>> list = null;
        try {
            result = orderBmo.orderSpecParam(dataBusMap, null, sessionStaff);
            if ("0".equals(result.get("code").toString())) {
                list = (List<Map<String, Object>>) result.get("prodSpecParams");
                model.addAttribute("prodSpecParams", list);
                model.addAttribute("ul_id", ul_id);
                model.addAttribute("prodId", prodId);
                model.addAttribute("offerSpecId", offerSpecId);
                model.addAttribute("prodSpecId", offerSpecId);
                model.addAttribute("compProdSpecId", compProdSpecId);
                model.addAttribute("partyId", partyId);
                model.addAttribute("offerRoleId", offerRoleId);
                model.addAttribute("roleCd", roleCd);
                //String payMethodCode = MySimulateData.getInstance().getParam(SysConstant.PAY_METHOD_CODE) ;
                //model.addAttribute("payMethodCode", payMethodCode==null?"error":payMethodCode);
                model.addAttribute("code", 0);
            } else {
                model.addAttribute("code", 1);
            }
        } catch (BusinessException be) {

            return super.failedStr(model, be);
        } catch (InterfaceException ie) {

            return super.failedStr(model, ie, dataBusMap, ErrorCode.ORDER_PROD_ITEM);
        } catch (Exception e) {
            log.error("加载产品规格属性/order/orderSpecParam方法异常", e);
            return super.failedStr(model, ErrorCode.ORDER_PROD_ITEM, e, dataBusMap);
        }
        return "/order/order-spec-param";
    }

    /*bxw产品实例属性*/
    @RequestMapping(value = "/orderSpecParamChange", method = RequestMethod.GET)
    public String orderSpecParamChange(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String prodId = request.getParameter("prodInstId");
        String offerSpecId = request.getParameter("offerSpecId");
        String prodSpecId = request.getParameter("prodSpecId");
        String partyId = request.getParameter("partyId");
        String acctNbr = request.getParameter("acctNbr");
        String areaId = request.getParameter("areaId");
        Map<String, Object> dataBusMap1 = new HashMap<String, Object>();//规格
        Map<String, Object> dataBusMap2 = new HashMap<String, Object>();//实例

        dataBusMap1.put("offerSpecId", offerSpecId);
        dataBusMap1.put("prodSpecId", prodSpecId);
        dataBusMap1.put("areaId", areaId);//20
        dataBusMap1.put("channelId", sessionStaff.getCurrentChannelId());
        dataBusMap1.put("staffId", sessionStaff.getStaffId());
        dataBusMap1.put("partyId", partyId);

        dataBusMap2.put("prodId", prodId);
        dataBusMap2.put("acctNbr", acctNbr);
        dataBusMap2.put("prodSpecId", prodSpecId);
        dataBusMap2.put("areaId", areaId);//20

        Map result = null;
        List<Map<String, Object>> list = null;
        try {
            result = orderBmo.orderSpecParamChange(dataBusMap1, dataBusMap2, null, sessionStaff);
            model.addAttribute("orderSpec", result);
            //String payMethodCode = MySimulateData.getInstance().getParam(SysConstant.PAY_METHOD_CODE) ;
            //model.addAttribute("payMethodCode", payMethodCode==null?"error":payMethodCode);
            String slimitParams = MySimulateData.getInstance().getParam(
                    (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_DATASOURCE_KEY),
                    SysConstant.ORDER_PARAMS_LIMIT_IDS);
            List<String> limitParams = new ArrayList<String>();
            if (slimitParams != null && !slimitParams.equals("null")) {
                String[] strLimitS = slimitParams.split(",");
                for (String str : strLimitS) {
                    limitParams.add(str);
                }
            }
            model.addAttribute("limitParams", limitParams);
        } catch (BusinessException be) {

            return super.failedStr(model, be);
        } catch (InterfaceException ie) {

            return super.failedStr(model, ie, dataBusMap2, ErrorCode.ORDER_PROD_INST);
        } catch (Exception e) {
            log.error("加载产品规格属性/order/orderSpecParamChange方法异常", e);
            return super.failedStr(model, ErrorCode.ORDER_PROD_INST, e, dataBusMap2);
        }
        return "/order/order-spec-param-change";
    }

    /**
     * 产品实例属性查询，修改使用人
     * @param resquestMap : {
     * prodId : "", //产品实例id
     * acctNbr : "", //接入号
     * prodSpecId : "", //产品规格id
     * areaId : "" //地区id
     * }
     */
    @RequestMapping(value = "/orderSpecParamUserChange", method = RequestMethod.GET)
    public String orderSpecParamUserChange(Model model, HttpServletRequest request) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> resquestMap = new HashMap<String, Object>();
        resquestMap.put("prodId", request.getParameter("prodInstId"));
        resquestMap.put("acctNbr", request.getParameter("acctNbr"));
        resquestMap.put("prodSpecId", request.getParameter("prodSpecId"));
        resquestMap.put("areaId", request.getParameter("areaId"));
        try {
            Map responseMap = orderBmo.prodInstParam(resquestMap, null, sessionStaff);
            if (responseMap != null && ResultCode.R_SUCC.equals(responseMap.get("resultCode"))) {
                List<Map<String, Object>> prodInstParams = (List<Map<String, Object>>) responseMap
                        .get("prodSpecParams");
                if (prodInstParams != null) {
                    List<Map<String, Object>> filteredProdInstParams = new ArrayList<Map<String, Object>>();
                    String custId = null;
                    if (prodInstParams != null && prodInstParams.size() > 0) {
                        for (Map<String, Object> prodInstParam : prodInstParams) {
                            if (prodInstParam != null
                                    && SysConstant.PROD_ITEM_SPEC_ID_USER.equals(prodInstParam.get("itemSpecId") + "")) {
                                filteredProdInstParams.add(prodInstParam);
                                custId = (String) prodInstParam.get("value");
                                break;
                            }
                        }
                    }
                    responseMap.put("prodSpecParams", filteredProdInstParams); //查询未返回使用人属性节点则页面报错

                    if (StringUtils.isNotBlank(custId)) { //返回属性值为空字符串时不查询客户详情
                        Map<String, Object> paramMap = new HashMap<String, Object>();
                        paramMap.put("partyId", custId);
                        paramMap.put("useCustId", custId); //客户详情查询，useCustId表示省内客户ID，后台取该字段后转为集团实例ID并查询
                        paramMap.put("areaId", request.getParameter("areaId"));
                        try {
                            Map datamap = custBmo.queryCustDetail(paramMap, null, sessionStaff);
                            if (ResultCode.R_SUCC.equals(datamap.get("resultCode"))) {
                                Map<String, Object> userInfoDetail = MapUtils.getMap(datamap, "result");
                                model.addAttribute("userInfo", userInfoDetail);
                            }
                        } catch (BusinessException be) {
                            return super.failedStr(model, be);
                        } catch (InterfaceException ie) {
                            return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CUST_EXINFO);
                        } catch (Exception e) {
                            return super.failedStr(model, ErrorCode.QUERY_CUST_EXINFO, e, paramMap);
                        }
                    }
                }
                model.addAttribute("orderSpec", responseMap);
            }
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, resquestMap, ErrorCode.ORDER_PROD_INST);
        } catch (Exception e) {
            log.error("查询产品实例属性", e);
            return super.failedStr(model, ErrorCode.ORDER_PROD_INST, e, resquestMap);
        }
        return "/order/order-spec-param-user-change";
    }

    /**
     * 产品实例属性变更，修改付费类型、是否信控
     * @param resquestMap : {
     * prodId : "", //产品实例id
     * acctNbr : "", //接入号
     * prodSpecId : "", //产品规格id
     * areaId : "" //地区id
     * }
     */
    @RequestMapping(value = "/orderSpecParamFeeTypeChange", method = RequestMethod.GET)
    public String orderSpecParamFeeTypeChange(Model model, HttpServletRequest request) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String prodId = request.getParameter("prodInstId");
        String acctNbr = request.getParameter("acctNbr");
        String offerSpecId = request.getParameter("offerSpecId");
        String areaId = request.getParameter("areaId");

        //1、查询当前产品实例的 是否信控 属性值
        String isXinkongValue = null; //套餐变更时，变更是否信控需要用到
        Map<String, Object> prodDetailQueryParam = new HashMap<String, Object>();
        Map<String, Object> prodDetailQueryResult = null;
        try {
            prodDetailQueryParam.put("prodId", prodId);
            prodDetailQueryParam.put("acctNbr", acctNbr);
            prodDetailQueryParam.put("areaId", areaId);
            //{"_":1419651037445,"acctNbr":17705164069,"prodId":"700019514770","areaId":"8320100"}
            prodDetailQueryResult = prodBmo.prodDetailQuery(prodDetailQueryParam, null, sessionStaff);
            if (MapUtils.getString(prodDetailQueryResult, "resultCode", "").equals("0")) {
                if (!MapUtils.getMap(prodDetailQueryResult, "result", new HashMap<String, Object>()).isEmpty()) {
                    Map<String, Object> result = (Map<String, Object>) prodDetailQueryResult.get("result");
                    List<Map<String, Object>> offerProdItems = (List<Map<String, Object>>) result.get("offerProdItems"); //产品属性
                    if (offerProdItems != null) {
                        for (Map<String, Object> offerProdItem : offerProdItems) {
                            if (offerProdItem != null
                                    && SysConstant.IS_XINKONG_SPEC_ID.equals(offerProdItem.get("attrId"))) { //是否信控 产品属性值
                                isXinkongValue = (String) offerProdItem.get("value");
                                break;
                            }
                        }
                    }
                }
            }
            if (isXinkongValue != null) {
                model.addAttribute("isXinkongValue", isXinkongValue);
            }
            //原先的是否信控 产品实例属性值为空的话，只需要一个ADD 不需要DEL，不需要报错
            //			else {
            //				throw new InterfaceException(ErrType.OPPOSITE, PortalServiceCode.INTF_QUERY_PROD_DETAIL, "查询是否信控产品实例属性返回为空。\n	" + JsonUtil.toString(prodDetailQueryResult), JsonUtil.toString(prodDetailQueryParam));
            //			}
        } catch (BusinessException e) {
            return super.failedStr(model, e);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, prodDetailQueryParam, ErrorCode.PROD_INST_DETAIL);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.PROD_INST_DETAIL, e, prodDetailQueryParam);
        }

        //2、套餐变更/二次业务 时查询是否信控可选项
        Map<String, Object> queryConfigDataParam = new HashMap<String, Object>();
        Map<String, Object> queryConfigDataParamResult = null;
        try {
            queryConfigDataParam.put("attrId", SysConstant.IS_XINKONG_SPEC_ID);
            queryConfigDataParamResult = orderBmo.queryConfigData(queryConfigDataParam, null, sessionStaff);
            if (queryConfigDataParamResult != null
                    && ResultCode.R_SUCC.equals(queryConfigDataParamResult.get("resultCode"))) {
                model.addAttribute("xinkongAttrs", queryConfigDataParamResult.get("result"));
            } else {
                throw new InterfaceException(ErrType.OPPOSITE, PortalServiceCode.CONFIG_DATA_QUERY, "查询是否信控可选项返回为空。\n"
                        + JsonUtil.toString(queryConfigDataParamResult), JsonUtil.toString(queryConfigDataParam));
            }
        } catch (BusinessException e) {
            return super.failedStr(model, e);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, queryConfigDataParam, ErrorCode.CONFIG_DATA_QUERY);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.CONFIG_DATA_QUERY, e, queryConfigDataParam);
        }
        //3、套餐变更/二次业务 时查询 新/旧 套餐的付费类型可选项
        Map<String, Object> queryOfferFeeTypeParam = new HashMap<String, Object>();
        Map<String, Object> queryOfferFeeTypeResult = null;
        try {
            queryOfferFeeTypeParam.put("prodOfferId", offerSpecId);
            queryOfferFeeTypeResult = orderBmo.queryOfferFeeType(queryOfferFeeTypeParam, null, sessionStaff);
            if (queryOfferFeeTypeResult != null && ResultCode.R_SUCC.equals(queryOfferFeeTypeResult.get("resultCode"))
                    && queryOfferFeeTypeResult.get("result") != null) {
                List payments = (List) ((Map<String, Object>) queryOfferFeeTypeResult.get("result")).get("payments");
                if (payments == null || payments.size() == 0) {
                    throw new InterfaceException(ErrType.OPPOSITE, PortalServiceCode.QUERY_OFFER_FEE_TYPE,
                            "查询套餐付费类型可选项返回为空。\n" + JsonUtil.toString(queryOfferFeeTypeResult), JsonUtil
                                    .toString(queryOfferFeeTypeParam));
                }
                model.addAttribute("newOfferFeeTypes", payments);
            } else {
                throw new InterfaceException(ErrType.OPPOSITE, PortalServiceCode.QUERY_OFFER_FEE_TYPE,
                        "查询套餐付费类型可选项返回为空。\n" + JsonUtil.toString(queryOfferFeeTypeResult), JsonUtil
                                .toString(queryOfferFeeTypeParam));
            }
        } catch (BusinessException e) {
            return super.failedStr(model, e);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, queryOfferFeeTypeParam, ErrorCode.QUERY_OFFER_FEE_TYPE);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_OFFER_FEE_TYPE, e, queryOfferFeeTypeParam);
        }
        return "/order/order-spec-param-fee-type-change";
    }

    /*bxw产品密码修改*/
    @RequestMapping(value = "/orderPasswordChange", method = RequestMethod.GET)
    public String orderPasswordChange(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
        String flag = "false";
        String accNbr = request.getParameter("accNbr");
        if (accNbr != null && session.getAttribute("ValidateAccNbr") != null
                && accNbr.equals(session.getAttribute("ValidateAccNbr"))) {
            Object password_session = session.getAttribute("ValidateProdPwd");
            if (password_session != null && !password_session.equals("") && !password_session.equals("null")) {
                model.addAttribute("password_session", password_session);
                flag = "true";
            }
        }
        model.addAttribute("ValidateAccNbrFlag", flag);
        return "/order/order-password-change";
    }

    /*bxw产品密码重置*/
    @RequestMapping(value = "/orderPasswordReset", method = RequestMethod.GET)
    public String orderPasswordReset(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
        return "/order/order-password-reset";
    }

    /*bxw产品密码校验*/
    @RequestMapping(value = "/orderPasswordCheck", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse orderPasswordCheck(HttpSession session, @RequestBody Map<String, Object> param,
            @LogOperatorAnn String flowNum//,Model model,HttpServletResponse response
    ) throws BusinessException {
        JsonResponse jsonResponse = null;

        String password_old = param.get("password_old") == null ? "" : param.get("password_old").toString();
        String accessNumber = param.get("accessNumber") == null ? "" : param.get("accessNumber").toString();
        String areaId = param.get("areaId") == null ? "" : param.get("areaId").toString();
        if (session.getAttribute("ValidateAccNbr") != null
                && accessNumber.equals(session.getAttribute("ValidateAccNbr"))) {
            Object password_session = session.getAttribute("ValidateProdPwd");
            if (password_session != null && password_session.equals(password_old)) {
                jsonResponse = super.successed("产品密码鉴权成功", ResultConstant.SUCCESS.getCode());
                return jsonResponse;
            }
        }
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map map = null;
        Map paramMap = new HashMap();
        /*{accessNumber:'11969577',areaId:21,prodPwd:'000000'}*/
        paramMap.put("accessNumber", accessNumber);
        paramMap.put("areaId", areaId);
        paramMap.put("prodPwd", password_old);
        try {
            map = custBmo.custAuth(paramMap, "", sessionStaff);
            String isValidateStr = null;
            if (map.get("isValidate") != null) {
                isValidateStr = map.get("isValidate").toString();
            } else if (map.get("result") != null) {
                Map<String, Object> tmpMap = MapUtils.getMap(map, "result");
                isValidateStr = MapUtils.getString(tmpMap, "isValidate");
            }
            if ("true".equals(isValidateStr)) {
                session.setAttribute("ValidateAccNbr", accessNumber);
                session.setAttribute("ValidateProdPwd", password_old);
                jsonResponse = super.successed("产品密码鉴权成功", ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed("产品密码鉴权失败", ResultConstant.FAILD.getCode());
            }
            return jsonResponse;

        } catch (BusinessException be) {

            return super.failed(be);
        } catch (InterfaceException ie) {

            return super.failed(ie, paramMap, ErrorCode.CUST_AUTH);
        } catch (Exception e) {
            log.error("产品密码鉴权/order/orderPasswordCheck方法异常", e);
            return super.failed(ErrorCode.CUST_AUTH, e, paramMap);
        }

    }

    /*bxw修改短号*/
    @RequestMapping(value = "/orderShortnumChange", method = RequestMethod.GET)
    public String orderShortnumChange(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String areaId = sessionStaff.getCurrentAreaId();
        String prodId = request.getParameter("prodId");
        String acctNbr = request.getParameter("acctNbr");
        Map qry = new HashMap();
        qry.put("areaId", areaId);
        qry.put("prodId", prodId);//123015734675
        qry.put("acctNbr", acctNbr);
        Map shortnum_data = null;
        try {
            shortnum_data = orderBmo.shortnum_query(qry, null, sessionStaff);
            model.addAttribute("shortnum_data", shortnum_data);
        } catch (BusinessException be) {

            return super.failedStr(model, be);
        } catch (InterfaceException ie) {

            return super.failedStr(model, ie, qry, ErrorCode.ORDER_COMP_PROD_INST);
        } catch (Exception e) {
            log.error("加载短号/order/orderShortnumChange方法异常", e);
            return super.failedStr(model, ErrorCode.ORDER_COMP_PROD_INST, e, qry);
        }
        return "/order/order-shortnum-change";
    }
    @RequestMapping(value = "/offerSpecList", method = RequestMethod.GET, produces = "text/html;charset=UTF-8")
    public String getOfferSpecList(@RequestParam Map<String, Object> params, Model model, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        params.put("channelId", sessionStaff.getCurrentChannelId());
        params.put("areaId", sessionStaff.getCurrentAreaId());
        params.put("staffId", sessionStaff.getStaffId());
        params.put("operatorsId", sessionStaff.getOperatorsId() != "" ? sessionStaff.getOperatorsId() : "99999");
        params.put("pageSize", SysConstant.PAGE_SIZE);
        if (sessionStaff != null) {
            Map<String, Object> map = null;
            try {
                //add by liusd 20151103 防止SQL injection 
                if (StringUtils.isNotBlank(MapUtils.getString(params, "INVOICEMin"))
                        && !NumberUtils.isNumber(MapUtils.getString(params, "INVOICEMin"))) {
                    throw new Exception("INVOICEMin data format invalid");
                }
                if (StringUtils.isNotBlank(MapUtils.getString(params, "priceMin"))
                        && !NumberUtils.isNumber(MapUtils.getString(params, "priceMin"))) {
                    throw new Exception("priceMin data format invalid");
                }
                if (StringUtils.isNotBlank(MapUtils.getString(params, "priceMax"))
                        &&!NumberUtils.isNumber(MapUtils.getString(params, "priceMax"))) {
                    throw new Exception("priceMax data format invalid");
                }
                if (StringUtils.isNotBlank(MapUtils.getString(params, "INVOICEMax"))
                        &&!NumberUtils.isNumber(MapUtils.getString(params, "INVOICEMax"))) {
                    throw new Exception("INVOICEMax data format invalid");
                }
                if (StringUtils.isNotBlank(MapUtils.getString(params, "INFLUXMin"))
                        &&!NumberUtils.isNumber(MapUtils.getString(params, "INFLUXMin"))) {
                    throw new Exception("INFLUXMin data format invalid");
                }
                if (StringUtils.isNotBlank(MapUtils.getString(params, "INFLUXMax"))
                        &&!NumberUtils.isNumber(MapUtils.getString(params, "INFLUXMax"))) {
                    throw new Exception("INFLUXMax data format invalid");
                }
                map = orderBmo.queryMainOfferSpecList(params, null, sessionStaff);
                if (ResultCode.R_SUCCESS.equals(map.get("code"))) {
                    //拼装前台显示的套餐详情
                    if (!map.isEmpty()) {
                        List prodOfferInfosList = (List) map.get("prodOfferInfos");
                        for (int i = 0; i < prodOfferInfosList.size(); i++) {
                            Map exitParam = new HashMap();
                            exitParam = (Map) prodOfferInfosList.get(i);
                            List<Map<String, Object>> inhtmllist = new ArrayList<Map<String, Object>>();//组装套餐属性
                            if (exitParam.containsKey("price")) {
                                Map<String, Object> inhtmlmap = new HashMap<String, Object>();
                                inhtmlmap.put("name", "价格");
                                inhtmlmap.put("value", exitParam.get("price"));
                                inhtmllist.add(inhtmlmap);
                            }
                            if (exitParam.containsKey("inFlux")) {
                                Map<String, Object> inhtmlmap = new HashMap<String, Object>();
                                float influx = 0;
                                String influx_str = "";
                                /*
                                 判断返回的流量是否大于1024M，如果大于1024M，显示的单位是G，否则显示的单位是M
                                 */
                                if (exitParam.get("inFlux") != null) {
                                    try {
                                        influx = Float.parseFloat(exitParam.get("inFlux").toString());
                                        if (influx < 1024) {
                                            influx_str = influx + "";
                                            if (influx_str.indexOf(".") > 0) {
                                                influx_str = influx_str.replaceAll("0+?$", "");//去掉多余的0  
                                                influx_str = influx_str.replaceAll("[.]$", "");//如最后一位是.则去掉  
                                            }
                                            influx_str = influx_str + "M";
                                        } else {
                                            influx_str = influx / 1024 + "";
                                            if (influx_str.indexOf(".") > 0) {
                                                influx_str = influx_str.replaceAll("0+?$", "");//去掉多余的0  
                                                influx_str = influx_str.replaceAll("[.]$", "");//如最后一位是.则去掉  
                                            }
                                            influx_str = influx_str + "G";
                                        }
                                    } catch (Exception e) {
                                        this.log.error("WIFI", e);
                                    }
                                }
                                inhtmlmap.put("name", "流量");
                                inhtmlmap.put("value", influx_str);
                                inhtmllist.add(inhtmlmap);
                            }
                            if (exitParam.containsKey("inVoice")) {
                                Map<String, Object> inhtmlmap = new HashMap<String, Object>();
                                inhtmlmap.put("name", "语音分钟数");
                                inhtmlmap.put("value", exitParam.get("inVoice"));
                                inhtmllist.add(inhtmlmap);
                            }
                            if (exitParam.containsKey("inWIFI")) {
                                Map<String, Object> inhtmlmap = new HashMap<String, Object>();
                                inhtmlmap.put("name", "WIFI时长");
                                inhtmlmap.put("value", exitParam.get("inWIFI"));
                                inhtmllist.add(inhtmlmap);
                            }
                            if (exitParam.containsKey("inSMS")) {
                                Map<String, Object> inhtmlmap = new HashMap<String, Object>();
                                inhtmlmap.put("name", "点对点短信");
                                inhtmlmap.put("value", exitParam.get("inSMS"));
                                inhtmllist.add(inhtmlmap);
                            }
                            if (exitParam.containsKey("inMMS")) {
                                Map<String, Object> inhtmlmap = new HashMap<String, Object>();
                                inhtmlmap.put("name", "点对点彩信");
                                inhtmlmap.put("value", exitParam.get("inMMS"));
                                inhtmllist.add(inhtmlmap);
                            }
                            if (exitParam.containsKey("outFlux")) {
                                Map<String, Object> inhtmlmap = new HashMap<String, Object>();
                                inhtmlmap.put("name", "套餐外流量");
                                inhtmlmap.put("value", exitParam.get("outFlux"));
                                inhtmllist.add(inhtmlmap);
                            }
                            if (exitParam.containsKey("outVoice")) {
                                Map<String, Object> inhtmlmap = new HashMap<String, Object>();
                                inhtmlmap.put("name", "套餐外通话分钟数");
                                inhtmlmap.put("value", exitParam.get("outVoice"));
                                inhtmllist.add(inhtmlmap);
                            }
                            inhtmllist.clear();
                            if (exitParam.containsKey("summary")) {
                                Map<String, Object> inhtmlmap = new HashMap<String, Object>();
                                Object summary = exitParam.get("summary");
                                inhtmlmap.put("name", "套餐信息");
                                inhtmlmap.put("value", summary);
                                if (summary != null && !"".equals(summary)) {
                                    inhtmlmap.put("value", summary.toString().length() > 60 ? summary.toString()
                                            .substring(0, 60)
                                            + "..." : summary);
                                }
                                inhtmllist.add(inhtmlmap);
                            }
                            exitParam.put("htmlvallist", inhtmllist);
                        }
                    }
                    model.addAttribute("resultlst", map.get("prodOfferInfos"));
                }
                model.addAttribute("pnLevelId", params.get("pnLevelId"));
                if (!"".equals(params.get("subPage"))) {
                    model.addAttribute("subPage", params.get("subPage"));
                }
                if (null != (params.get("orderflag"))) {
                    model.addAttribute("orderflag", params.get("orderflag"));
                }
            } catch (BusinessException be) {
                this.log.error("查询号码信息失败", be);
                return super.failedStr(model, be);
            } catch (InterfaceException ie) {
                return super.failedStr(model, ie, params, ErrorCode.QUERY_MAIN_OFFER);
            } catch (Exception e) {
                return super.failedStr(model, ErrorCode.QUERY_MAIN_OFFER, e, params);
            }
        } else {
            this.log.error("登录会话不存在，套餐加载失败{}");
        }

        return "/order/order-services";
    }

    @RequestMapping(value = "/queryPackForTerm", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse queryPackForTerm(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum)
            throws BusinessException {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> retnMap = new HashMap<String, Object>();
        String aoId = (String) param.get("aoId");
        String pnLevelId = (String) param.get("numLevel");
        //20140219 新增agreementType，合约类型(1-机补，2-话补)，用于后台过滤合约对应的销售品
        String agreementType = MapUtils.getString(param, "agreementType");
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        if (sessionStaff != null) {
            dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
            dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
            dataBusMap.put("staffId", sessionStaff.getStaffId());
            dataBusMap.put("agreementOfferSpecId", aoId);
            dataBusMap.put("agreementType", agreementType);
            dataBusMap.put("pnLevelId", pnLevelId);
            dataBusMap.put("pageSize", SysConstant.PAGE_SIZE);
            try {
                retnMap = orderBmo.queryMainOfferSpecList(dataBusMap, flowNum, sessionStaff);
            } catch (BusinessException e) {
                this.log.error("查询主套餐服务接口失败", e);
                return super.failed("查询主套餐服务接口失败", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            } catch (InterfaceException ie) {
                return super.failed(ie, dataBusMap, ErrorCode.QUERY_MAIN_OFFER);
            } catch (Exception e) {
                log.error("门户/order/queryPackForTerm方法异常", e);
                return super.failed(ErrorCode.QUERY_MAIN_OFFER, e, dataBusMap);
            }
        } else {
            this.log.error("登录会话不存在，套餐加载失败{}");
            return super.failed("登录会话不存在，套餐加载失败", ResultConstant.FAILD.getCode());
        }

        return super.successed(retnMap);
    }

    @RequestMapping(value = "/queryOfferSpec", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse queryOfferSpec(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum)
            throws BusinessException {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> retnMap = new HashMap<String, Object>();
        String offerSpecId = param.get("offerSpecId").toString();
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        if (sessionStaff != null) {
            dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
            dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
            dataBusMap.put("staffId", sessionStaff.getStaffId());
            dataBusMap.put("offerTypeCd", 1);
            dataBusMap.put("offerSpecId", offerSpecId);
            dataBusMap.put("partyId", -1);

            try {
                retnMap = orderBmo.queryOfferSpecParamsBySpec(dataBusMap, null, sessionStaff);

            } catch (BusinessException be) {
                return super.failed(be);
            } catch (InterfaceException ie) {
                return super.failed(ie, dataBusMap, ErrorCode.QUERY_OFFER_SPEC);
            } catch (Exception e) {
                log.error("门户查询销售品构成/order/serviceDetial方法异常", e);
                return super.failed(ErrorCode.QUERY_OFFER_SPEC, e, dataBusMap);
            }
        } else {
            this.log.error("登录会话不存在，套餐加载失败{}");
            return super.failed("登录会话不存在，套餐加载失败", ResultConstant.FAILD.getCode());
        }

        return super.successed(retnMap);
    }

    @RequestMapping(value = "/serviceDetial", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getServiceDetial(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String offerSpecId = param.get("specId").toString();
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        JsonResponse jsonResponse = null;
        if (sessionStaff != null) {
            dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
            dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
            dataBusMap.put("staffId", sessionStaff.getStaffId());
            dataBusMap.put("offerTypeCd", 1);
            dataBusMap.put("offerSpecId", offerSpecId);
            dataBusMap.put("partyId", param.get("custId").toString());
            Map<String, Object> map = null;
            try {
                map = orderBmo.queryOfferSpecParamsBySpec(dataBusMap, flowNum, sessionStaff);
                if (map != null && ResultCode.R_SUCCESS.equals(map.get("code").toString())) {
                    jsonResponse = super.successed(map.get("offerSpec"), ResultConstant.SUCCESS.getCode());
                } else {
                    jsonResponse = super.failed(map.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE
                            .getCode());
                }
            } catch (BusinessException be) {
                return super.failed(be);
            } catch (InterfaceException ie) {
                return super.failed(ie, dataBusMap, ErrorCode.QUERY_OFFER_SPEC);
            } catch (Exception e) {
                log.error("门户查询销售品构成/order/serviceDetial方法异常", e);
                return super.failed(ErrorCode.QUERY_OFFER_SPEC, e, dataBusMap);
            }
        } else {
            this.log.error("登录会话不存在，套餐加载失败{}");
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/main", method = RequestMethod.POST)
    public String main(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        String forward = "";
        SessionStaff sessionStaff2 = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_NUMBER + "_"
                + sessionStaff2.getStaffId());
        ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_TERMINAL + "_"
                + sessionStaff2.getStaffId());
        ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AGREEMENT + "_"
                + sessionStaff2.getStaffId());
        if ("2".equals(String.valueOf(param.get("actionFlag")))) { //套餐变更
            if (MapUtils.isNotEmpty(param)) {
                model.addAttribute("main", param);

                //功能开关，套餐变更时是否显示付费类型变更选项（分省开关改造，移至mda）
                String showChangeFeeTypeInput = propertiesUtils.getMessage(SysConstant.SHOW_CHANGE_FEETYPE_INPUT + sessionStaff2.getAreaId().substring(0, 3));
                model.addAttribute("showChangeFeeTypeInput", showChangeFeeTypeInput);
                if (SysConstant.ON.equals(showChangeFeeTypeInput)) {
                    SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                            SysConstant.SESSION_KEY_LOGIN_STAFF);
                    String areaId = (String) param.get("areaId");

                    //1、查询当前产品实例的 是否信控 属性值
                    String isXinkongValue = null; //套餐变更时，变更是否信控需要用到
                    Map<String, Object> prodDetailQueryParam = new HashMap<String, Object>();
                    try {
                        String prodId = (String) param.get("prodId");
                        String acctNbr = null;
                        List<Map<String, Object>> offerMembers = (List<Map<String, Object>>) param.get("offerMembers");
                        if (offerMembers != null) {
                            for (Map<String, Object> offerMember : offerMembers) {
                                if (offerMember != null && "2".equals(offerMember.get("objType"))
                                        && "400".equals(offerMember.get("roleCd"))) {
                                    acctNbr = (String) offerMember.get("accessNumber");
                                    break;
                                }
                            }
                        }
                        prodDetailQueryParam.put("areaId", areaId);
                        prodDetailQueryParam.put("prodId", prodId);
                        prodDetailQueryParam.put("acctNbr", acctNbr);
                        //{"_":1419651037445,"acctNbr":17705164069,"prodId":"700019514770","areaId":"8320100"}
                        Map<String, Object> resultMap = new HashMap<String, Object>();
                        resultMap = prodBmo.prodDetailQuery(prodDetailQueryParam, null, sessionStaff);
                        if (MapUtils.getString(resultMap, "resultCode", "").equals("0")) {
                            if (!MapUtils.getMap(resultMap, "result", new HashMap<String, Object>()).isEmpty()) {
                                Map<String, Object> result = (Map<String, Object>) resultMap.get("result");
                                List<Map<String, Object>> offerProdItems = (List<Map<String, Object>>) result
                                        .get("offerProdItems"); //产品属性
                                if (offerProdItems != null) {
                                    for (Map<String, Object> offerProdItem : offerProdItems) {
                                        if (offerProdItem != null
                                                && SysConstant.IS_XINKONG_SPEC_ID.equals(offerProdItem.get("attrId"))) { //是否信控 产品属性值
                                            isXinkongValue = (String) offerProdItem.get("value");
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (isXinkongValue != null) {
                            model.addAttribute("isXinkongValue", isXinkongValue);
                        }
                    } catch (BusinessException e) {
                        return super.failedStr(model, e);
                    } catch (InterfaceException ie) {
                        return super.failedStr(model, ie, prodDetailQueryParam, ErrorCode.PROD_INST_DETAIL);
                    } catch (Exception e) {
                        return super.failedStr(model, ErrorCode.PROD_INST_DETAIL, e, prodDetailQueryParam);
                    }

                    //2、套餐变更/二次业务 时查询是否信控可选项
                    Map<String, Object> queryConfigDataParam = new HashMap<String, Object>();
                    try {
                        queryConfigDataParam.put("areaId", areaId);
                        queryConfigDataParam.put("attrId", SysConstant.IS_XINKONG_SPEC_ID);
                        Map<String, Object> queryConfigDataParamResult = orderBmo.queryConfigData(queryConfigDataParam,
                                null, sessionStaff);
                        if (queryConfigDataParamResult != null
                                && ResultCode.R_SUCC.equals(queryConfigDataParamResult.get("resultCode"))) {
                            model.addAttribute("xinkongAttrs", queryConfigDataParamResult.get("result"));
                        }
                    } catch (BusinessException e) {
                        return super.failedStr(model, e);
                    } catch (InterfaceException ie) {
                        return super.failedStr(model, ie, queryConfigDataParam, ErrorCode.CONFIG_DATA_QUERY);
                    } catch (Exception e) {
                        return super.failedStr(model, ErrorCode.CONFIG_DATA_QUERY, e, queryConfigDataParam);
                    }
                    //3、套餐变更/二次业务 时查询 新/旧 套餐的付费类型可选项
                    Map<String, Object> queryOfferFeeTypeParam = new HashMap<String, Object>();
                    try {
                        Map<String, Object> offerSpec = (Map<String, Object>) param.get("offerSpec");
                        if (offerSpec != null && offerSpec.get("offerSpecId") != null) {
                            queryOfferFeeTypeParam.put("areaId", areaId);
                            queryOfferFeeTypeParam.put("prodOfferId", offerSpec.get("offerSpecId"));
                            Map<String, Object> queryOfferFeeTypeResult = orderBmo.queryOfferFeeType(
                                    queryOfferFeeTypeParam, null, sessionStaff);
                            if (queryOfferFeeTypeResult != null
                                    && ResultCode.R_SUCC.equals(queryOfferFeeTypeResult.get("resultCode"))
                                    && queryOfferFeeTypeResult.get("result") != null) {
                                model.addAttribute("newOfferFeeTypes", ((Map<String, Object>) queryOfferFeeTypeResult
                                        .get("result")).get("payments"));
                            }
                        }
                    } catch (BusinessException e) {
                        return super.failedStr(model, e);
                    } catch (InterfaceException ie) {
                        return super.failedStr(model, ie, queryOfferFeeTypeParam, ErrorCode.QUERY_OFFER_FEE_TYPE);
                    } catch (Exception e) {
                        return super.failedStr(model, ErrorCode.QUERY_OFFER_FEE_TYPE, e, queryOfferFeeTypeParam);
                    }
                }

            }
            forward = "/offer/offer-change";
        } else if ("21".equals(String.valueOf(param.get("actionFlag")))) {
            if (MapUtils.isNotEmpty(param)) {
                model.addAttribute("main", param);
            }
            forward = "/offer/member-change";
        } else if ("3".equals(String.valueOf(param.get("actionFlag")))) {
            if (MapUtils.isNotEmpty(param)) {
                //重新拼接参数
                if (param.containsKey("offerRoles")) {
                    List<Map> offerRoles = (List<Map>) param.get("offerRoles");
                    if (CollectionUtils.isNotEmpty(offerRoles)) {
                        for (Map map : offerRoles) {
                            String offerRoleId = map.get("offerRoleId").toString();
                            String offerRoleName = map.get("offerRoleName").toString();
                            String typeCd = map.get("memberRoleCd").toString();
                            if (SysConstant.MAIN_OFFER_ROLE_TYPE.equals(typeCd)) {
                                param.put("mainOfferRoleId", offerRoleId);
                                param.put("mainOfferRoleName", offerRoleName);
                            } else if (SysConstant.VICE_OFFER_ROLE_TYPE.equals(typeCd)) {
                                param.put("viceOfferRoleId", offerRoleId);
                                param.put("viceOfferRoleName", offerRoleName);
                            } else {
                                param.put("mainOfferRoleId", offerRoleId);
                            }
                        }
                    }
                }
                if (!param.containsKey("offerNum") || param.get("offerNum") == null) {
                    param.put("offerNum", 1);
                }
                model.addAttribute("main", param);
            }
            forward = "/offer/offer-change";
        } else {
            if (MapUtils.isNotEmpty(param)) {
                if (!param.containsKey("offerNum") || param.get("offerNum") == null) {
                    param.put("offerNum", 1);
                }
                model.addAttribute("main", param);
            }
            forward = "/order/order-main-template";
        }
        String iseditOperation = "-1";
		try {
			iseditOperation = this.staffBmo.checkOperatSpec(SysConstant.YCZJQX_TEST, sessionStaff2);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        model.addAttribute("newCard", iseditOperation);
        return forward;
    }

    @RequestMapping(value = "/checkOperate", method = RequestMethod.GET)
    public @ResponseBody
    String checkOperate(@LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String isAddOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.EFF_TIME
                + "_" + sessionStaff.getStaffId());
        try {
            if (isAddOperation == null) {
                isAddOperation = staffBmo.checkOperatSpec(SysConstant.EFF_TIME, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.EFF_TIME + "_"
                        + sessionStaff.getStaffId(), isAddOperation);
            }
        } catch (BusinessException e) {
            isAddOperation = "1";
        } catch (InterfaceException ie) {
            isAddOperation = "1";
        } catch (Exception e) {
            isAddOperation = "1";
        }
        return isAddOperation;
    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/getChargeList", method = RequestMethod.GET)
    public String getChargeList(@RequestParam Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response, HttpServletRequest request) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        try {
        	Map<String, Object> orderData =sessionStaff.getOrderData();
        	if(orderData!=null){
        		Map result = (Map) orderData.get("result");
                String olId = (String) result.get("olId");
                if(olId.equals(param.get("olId")) && result.get("ruleInfos") != null){
                	 model.addAttribute("resMap", orderData);
                     model.addAttribute("resMapJson", JsonUtil.buildNormal().objectToJson(orderData));
                     return "/order/order-confirm";
                }
        	}
            if (commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)) {
                if (param.get("actionFlag") != null) {
                    String actionFlag = (String) param.get("actionFlag");
                    model.addAttribute("actionFlag", actionFlag);
                    param.remove("actionFlag");
                }
                if (param.get("refundType") != null) {
                    String refundType = (String) param.get("refundType");
                    model.addAttribute("refundType", Integer.parseInt(refundType));
                    param.remove("refundType");
                }
                if (param.containsKey("businessName")) {
                    String businessName = MapUtils.getString(param, "businessName", "");
                    businessName = EncodeUtils.urlDecode(businessName);
                    model.addAttribute("businessName", businessName);
                    param.remove("businessName");
                }
                if (param.containsKey("actionTypeName")) {
                    String actionTypeName = MapUtils.getString(param, "actionTypeName", "");
                    actionTypeName = EncodeUtils.urlDecode(actionTypeName);
                    model.addAttribute("actionTypeName", actionTypeName);
                    param.remove("actionTypeName");
                }
                if (param.get("olNbr") != null) {
                    String olNbr = (String) param.get("olNbr");
                    model.addAttribute("olNbr", olNbr);
                    param.remove("olNbr");
                }
                param.put("areaId", sessionStaff.getCurrentAreaId());
                String checkResultlist = (String) param.get("checkResult");
                if (!"[]".equals(checkResultlist) && StringUtils.isNotEmpty(checkResultlist)) {
                    //         		String checkResult = (String)param.get("checkResult");
                    List list = JsonUtil.toObject(checkResultlist, List.class);
                    //         		param.remove("checkResult");
                    param.put("checkResult", list);
                } else {
                    param.remove("checkResult");
                    List list = new ArrayList();
                    param.put("checkResult", list);
                }
                Map<String, Object> datamap = this.orderBmo.queryChargeList(param, flowNum, sessionStaff);
                if (datamap != null) {
                    String code = (String) datamap.get("code");
                    if (ResultCode.R_SUCCESS.equals(code)) {
                        List<Map<String, Object>> templist = null;
                        if (datamap.get("chargeItems") != null) {
                            Object obj = datamap.get("chargeItems");
                            if (obj instanceof List) {
                                templist = (List<Map<String, Object>>) obj;
                            } else {
                                templist = new ArrayList<Map<String, Object>>();
                                templist.add((Map<String, Object>) obj);
                            }
                            model.addAttribute("chargeItems", templist);
                        }
                        boolean checkFlag = false;//标识判断是否查权益
                        HttpSession session = request.getSession();
                        int sumAmount = 0;
                        if (templist != null && templist.size() != 0) {
                            for (Map<String, Object> item : templist) {
                                if (item != null) {
                                    int realAmount = (Integer) item.get("realAmount");
                                    sumAmount = sumAmount + realAmount;
                                    //遍历订单项，查看订单项是否有补换卡，国漫等业务，如果有查询用户的权益   
                                    //首先判断省份开关是否打开
                                    if(SysConstant.ON.equals(sessionStaff.getPoingtType())){
                                    	 String boActionType = (String) item.get("boActionType");
                                    	 if(item.get("objId") != null){
                                    		 int objId = (Integer)item.get("objId");//业务对象ID
                                             if("14".equals(boActionType) || objId==13409281){//补换卡   //国际及港澳台漫游电话（包含语音及短信）
                                             	checkFlag = true;
                                             }
                                    	 }
                                    }
                                }
                            }
                        }
                        
                        if(checkFlag){//查询权益
                        	Map<String, Object> paramMap = new HashMap<String, Object>();
                        	paramMap.put("identityCd", sessionStaff.getCardType());
                        	paramMap.put("identityNum", sessionStaff.getCardNumber());
                        	paramMap.put("queryType", sessionStaff.getCustType());
                        	String areaId = (String) session.getAttribute("pointareaId");
                			if(!"".equals(areaId) && areaId !=null){
                				paramMap.put("areaId",areaId);
                			}
                        	if("11".equals(sessionStaff.getCustType())){
                        		paramMap.put("queryTypeValue", sessionStaff.getInPhoneNum());
                        	}else{
                        		paramMap.put("queryTypeValue", sessionStaff.getCustCode());
                        	}
                        	try {//catch 异常，即使出错，单子继续做下去
	                        	Map<String, Object> returnMap = orderBmo.queryIntegral(paramMap, flowNum, sessionStaff);
	                            List<Map<String, Object>> pointInfolist = null;
	                            Map<String, Object> pointInfoMap = null;
	                            if(returnMap.get("pointInfo") !=null){
	                            	Object objPointInfo = returnMap.get("pointInfo");
	    	                        if (objPointInfo instanceof Map) {
	    	                        	pointInfoMap = (Map<String, Object>) objPointInfo;
	    	                        } else {
	    	                        	pointInfoMap = new HashMap<String, Object>();
	    	                        	pointInfoMap.putAll((Map<String, Object>) objPointInfo);
	    	                        }
	    	                        
	    	                        Object obj = pointInfoMap.get("pointitems");
	                                if (obj instanceof List) {
	                                	pointInfolist = (List<Map<String, Object>>) obj;
	                                } else {
	                                	pointInfolist = new ArrayList<Map<String, Object>>();
	                                	pointInfolist.add((Map<String, Object>) obj);
	                                }
	                                for(Map<String, Object> pointInfo : pointInfolist){
	                                	Date date = new Date();
	                                	String pointItemValueStr = (String) ("".equals(pointInfo.get("pointItemValue"))?"0":pointInfo.get("pointItemValue"));
	                                	int pointItemValue = Integer.parseInt(pointItemValueStr);
	                        			String pointItemTime = (String) pointInfo.get("pointItemTime");
	                        			String serviceEffectTime = (String) pointInfo.get("serviceEffectTime");
	                        			//如果返回时间为空，就直接
	                        			if(!StringUtil.isEmpty(pointItemTime) && !StringUtil.isEmpty(serviceEffectTime)){
	                        				SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");
	                            			Date pointItemDate = sdf1.parse(pointItemTime);
	                            			SimpleDateFormat sdf2 = new SimpleDateFormat("yyyyMMddHHmmss");
	                            			Date serviceEffectDate = sdf2.parse(serviceEffectTime);
	                            			if(pointItemValue>=1 && (serviceEffectDate.compareTo(date)<0) && date.compareTo(pointItemDate)<0){//true 表示有权益
	                            				//补换卡权益
	                                        	if("100300".equals(pointInfo.get("pointItemID"))){
	                                        		session.setAttribute(SysConstant.INTEREST_BHK+sessionStaff.getCardNumber(), "true");
	                                        		model.addAttribute("INTEREST_BHK", "have");
	                                        	}
	                                        	//国漫权益 100800 国漫免预存
	                                        	if("100800".equals(pointInfo.get("pointItemID"))){
	                                        		session.setAttribute(SysConstant.INTEREST_GM+sessionStaff.getCardNumber(), "true");
	                                        		model.addAttribute("INTEREST_GM", "have");
	                                        	}
	                                        	//紧急开机 100600 
	                                        	if("100600".equals(pointInfo.get("pointItemID"))){
	                                        		session.setAttribute(SysConstant.INTEREST_JJKJ+sessionStaff.getCardNumber(), "true");
	                                        		model.addAttribute("INTEREST_JJKJ", "have");
	                                        	}
	                        			   }
	                        			}
	                                }
	                            }
	                            
	                        }catch (BusinessException e) {
	                        } catch (InterfaceException ie) {
	                        } catch (Exception e) {
	                        }
                        }
                        session.setAttribute(SysConstant.SESSION_KEY_SUMAMOUNT, sumAmount);
                        templist = null;
                        if (datamap.get("prodInfo") != null) {
                            Object obj1 = datamap.get("prodInfo");
                            if (obj1 instanceof List) {
                                templist = (List<Map<String, Object>>) obj1;
                            } else {
                                templist = new ArrayList<Map<String, Object>>();
                                templist.add((Map<String, Object>) obj1);
                            }
                            model.addAttribute("prodInfo", templist);
                        }
                    }
                }
                String iseditOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_EDITCHARGE + "_" + sessionStaff.getStaffId());
                try {
                    if (iseditOperation == null) {
                        iseditOperation = staffBmo.checkOperatSpec(SysConstant.EDITCHARGE_CODE, sessionStaff);
                        ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_EDITCHARGE + "_"
                                + sessionStaff.getStaffId(), iseditOperation);
                    }
                } catch (BusinessException e) {
                    iseditOperation = "1";
                } catch (InterfaceException ie) {
                    iseditOperation = "1";
                } catch (Exception e) {
                    iseditOperation = "1";
                }
                String isAddOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_ADDCHARGE + "_" + sessionStaff.getStaffId());
                try {
                    if (isAddOperation == null) {
                        isAddOperation = staffBmo.checkOperatSpec(SysConstant.ADDCHARGE_CODE, sessionStaff);
                        ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_ADDCHARGE + "_"
                                + sessionStaff.getStaffId(), isAddOperation);
                    }
                } catch (BusinessException e) {
                    isAddOperation = "1";
                } catch (InterfaceException ie) {
                    isAddOperation = "1";
                } catch (Exception e) {
                    isAddOperation = "1";
                }

                String isEditAdjustOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_EDITADJUSTCHARGE + "_" + sessionStaff.getStaffId());
                //String isEditAdjustOperation= "0";
                try {
                    if (isEditAdjustOperation == null) {
                        isEditAdjustOperation = staffBmo.checkOperatSpec(SysConstant.EDITADJUST_CODE, sessionStaff);
                        ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_EDITADJUSTCHARGE
                                + "_" + sessionStaff.getStaffId(), isEditAdjustOperation);
                    }
                } catch (BusinessException e) {
                    isEditAdjustOperation = "1";
                } catch (InterfaceException ie) {
                    isEditAdjustOperation = "1";
                } catch (Exception e) {
                    isEditAdjustOperation = "1";
                }
                //String iseditOperation="0";
                model.addAttribute("iseditOperation", iseditOperation);
                model.addAttribute("isEditAdjustOperation", isEditAdjustOperation);
                //String iseditOperation="0";
                model.addAttribute("isAddOperation", isAddOperation);
                model.addAttribute("olId", param.get("olId"));
                model.addAttribute("showCancelBtn", ServletUtils.getSessionAttribute(super.getRequest(),
                        SysConstant.STEP_ORDER_CANCEL_OPER_FLAG));
                getApConfigMap(model, flowNum, sessionStaff);
                //查找菜单中有无翼支付绑卡菜单，有则添加菜单ID和URL生成翼支付绑卡菜单按钮
                String yizhifu = "0";
                String yizhifuResourceId = "0";
                String yizhifuResourceUrl = "";
                Object menuList = request.getSession().getAttribute(SysConstant.SESSION_KEY_MENU_LIST);
                if (menuList != null && menuList instanceof List) {
                    Set<String> authUrls = new HashSet<String>();
                    List<Map> list1 = (List<Map>) menuList;
                    for (Map rowTemp1 : list1) {
                        List<Map> list2 = (List<Map>) rowTemp1.get("childMenuResources");
                        for (Map rowTemp2 : list2) {
                            List<Map> list3 = (List<Map>) rowTemp2.get("childMenuResources");
                            for (Map rowTemp3 : list3) {
                                String resourceName = (String) rowTemp3.get("resourceName");
                                if ("翼支付绑卡".equals(resourceName)) {
                                    yizhifu = "1";
                                    if (rowTemp3.get("resourceId") != null)
                                        yizhifuResourceId = rowTemp3.get("resourceId") + "";
                                    if ((String) rowTemp3.get("menuPath") != null)
                                        yizhifuResourceUrl = (String) rowTemp3.get("menuPath");
                                    break;
                                }
                            }
                            if ("1".equals(yizhifu))
                                break;
                        }
                        if ("1".equals(yizhifu))
                            break;
                    }
                }
                model.addAttribute("isYiPayBoundCard", yizhifu);
                ;
                model.addAttribute("yiPayBoundCardId", yizhifuResourceId);
                model.addAttribute("yiPayBoundCardUrl", yizhifuResourceUrl);
            } else {
                super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
            }
        } catch (BusinessException e) {
            return super.failedStr(model, e);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.CHARGE_LIST);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.CHARGE_LIST, e, param);
        }
        return "/order/order-cal-charge";
    }

    /**
     * 取得租金费用项
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
    private void getApConfigMap(Model model, String flowNum, SessionStaff sessionStaff) {
        String tableName = "SYSTEM";
        String columnItem = "PENALTY_FREE_ITEM";
        List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
        try {
            Object obj = DataRepository.getInstence().getApConfigMap().get(tableName + "-" + columnItem);
            if (obj != null && obj instanceof List) {
                rList = (List<Map<String, Object>>) obj;
            } else {
                Map<String, Object> pMap = new HashMap<String, Object>();
                pMap.put("tableName", tableName);
                pMap.put("columnName", columnItem);
                rList = (List<Map<String, Object>>) orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get(
                        "result");
                DataRepository.getInstence().getApConfigMap().put(tableName + "-" + columnItem, rList);
            }
            ArrayList<Map<String, Object>> al = (ArrayList) rList.get(0).get("PENALTY_FREE_ITEM");
            model.addAttribute("acctItemTypeId", al.get(0).get("COLUMN_VALUE"));
        } catch (BusinessException e) {
            this.log.error("查询配置信息服务出错", e);
        } catch (InterfaceException ie) {

        } catch (Exception e) {

        }
    }

    @RequestMapping(value = "/getChargeAddByObjId", method = RequestMethod.POST)
    public String getChargeAddByObjId(@RequestBody Map<String, Object> param, Model model,
            @LogOperatorAnn String flowNum, HttpServletResponse response) {
        try {
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                    SysConstant.SESSION_KEY_LOGIN_STAFF);
            Map<String, Object> interMap = new HashMap<String, Object>();
            interMap.put("areaId", sessionStaff.getCurrentAreaId());
            interMap.put("boActionTypeCd", param.get("boActionTypeCd"));
            interMap.put("objId", param.get("objId"));
            interMap.put("objType", param.get("objType"));
            Map<String, Object> datamap = this.orderBmo.queryAddChargeItems(interMap, flowNum, sessionStaff);
            if (datamap != null) {
                String code = (String) datamap.get("code");
                if (ResultCode.R_SUCCESS.equals(code)) {
                    model.addAttribute("items", datamap.get("list"));
                    model.addAttribute("param", param);
                }
            }
        } catch (BusinessException e) {
            return super.failedStr(model, e);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.CHARGE_ADDITEM);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.CHARGE_ADDITEM, e, param);
        }
        return "/order/order-cal-additem";
    }

    @RequestMapping(value = "/queryPayMethodByItem", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryPayMethodByItem(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        
        //查询工号具有的收费权限，并将权限编码拼装送与后台
        try {
			param.put("rights", orderBmo.getAvilablePayMethodCdList(sessionStaff));
		} catch (BusinessException be) {
			return super.failed(be);
		}
        
        try {
            param.put("areaId", sessionStaff.getCurrentAreaId());           
            rMap = orderBmo.queryPayMethodByItem(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                jsonResponse = super.successed(rMap.get("list"), ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.CHARGE_PAYMETHOD);
        } catch (Exception e) {
            return super.failed(ErrorCode.CHARGE_PAYMETHOD, e, param);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/chargeSubmit", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse chargeSubmit(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response, HttpServletRequest request) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        //判断工号， 如果有“免短信验证权限”同时 有“限制提交权限维度”，则 不允许在 收银台界面点收费 提交按钮。
        String smsPassFlag = (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SMS_PASS_OPSCD
                + "_" + sessionStaff.getStaffId());
        try {
            if (smsPassFlag == null) {
                smsPassFlag = staffBmo.checkOperatSpec(SysConstant.SMS_PASS_OPSCD, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SMS_PASS_OPSCD + "_"
                        + sessionStaff.getStaffId(), smsPassFlag);
            }
        } catch (BusinessException e) {
            smsPassFlag = "1";
        } catch (InterfaceException ie) {
            smsPassFlag = "1";
        } catch (Exception e) {
            smsPassFlag = "1";
        }
        String isLimitSubmit = (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.LIMIT_SUBMIT
                + "_" + sessionStaff.getStaffId());
        try {
            if (isLimitSubmit == null) {
                isLimitSubmit = staffBmo.checkOperatSpec(SysConstant.LIMIT_SUBMIT, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.LIMIT_SUBMIT + "_"
                        + sessionStaff.getStaffId(), isLimitSubmit);
            }
        } catch (BusinessException e) {
            isLimitSubmit = "1";
        } catch (InterfaceException ie) {
            isLimitSubmit = "1";
        } catch (Exception e) {
            isLimitSubmit = "1";
        }
        if (smsPassFlag == "0" && isLimitSubmit == "0") {
            jsonResponse = super.failed("您的工号有“免短信验证权限”同时有“限制提交权限维”，不允许在收银台界面点收费提交按钮!",
                    ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            return jsonResponse;
        }
        boolean checkFlag = false;
        try {
            if (commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)) {
                log.debug("param={}", JsonUtil.toString(param));
                param.put("areaId", sessionStaff.getCurrentAreaId());

                //去除chargeItems中的重复项，根据acctItemId判断
                List<Map<String, String>> chargeItems = (List<Map<String, String>>) param.get("chargeItems");
                List<Map<String, String>> checkedChargeItems = new ArrayList<Map<String, String>>();
                if (chargeItems != null && chargeItems.size() != 0) {
                    for (Map<String, String> item : chargeItems) {
                        if (item != null) {
                            String acctItemId = item.get("acctItemId");
                            if (acctItemId != null) {
                                boolean exist = false;
                                for (Map<String, String> checkedItem : checkedChargeItems) {
                                    if (acctItemId.equals(checkedItem.get("acctItemId"))) {
                                        exist = true;
                                        break;
                                    }
                                }
                                if (!exist) {
                                    checkedChargeItems.add(item);
                                }
                            }
                            String boActionType = (String) item.get("boActionType");
                            String objId = (String) item.get("objId");
                            if("14".equals(boActionType) || "13409281".equals(objId)){//补换卡   //国际及港澳台漫游电话（包含语音及短信）
                            	checkFlag = true;
                            }
                        }
                    }
                    param.put("chargeItems", checkedChargeItems);
                }
                int sumAmount = 0;
                if (checkedChargeItems != null && checkedChargeItems.size() != 0) {
                    for (Map<String, String> item : checkedChargeItems) {
                        if (item != null) {
                            String realAmount = item.get("realAmount");
                            int rlAmount = Integer.parseInt(realAmount);
                            sumAmount = sumAmount + rlAmount;
                        }
                    }
                }
                HttpSession session = request.getSession();
                int amount = (Integer) session.getAttribute(SysConstant.SESSION_KEY_SUMAMOUNT);
                if (amount != sumAmount) {
                    Map<String, Object> paramMap = new HashMap<String, Object>();
                    paramMap.put("operatSpecCd", "OPSCD_FYJM");
                    paramMap.put("dataDimensionCd", "DIM_CD_JMFYX");
                    paramMap.put("staffId", sessionStaff.getStaffId());
                    paramMap.put("areaId", sessionStaff.getCurrentAreaId());
                    rMap = orderBmo.queryAuthenticDataRange(paramMap, flowNum, sessionStaff);
                    if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                        List result = (List) rMap.get("result");
                        Map remap = (Map) result.get(0);
                        List dataRanges = (List) remap.get("dataRanges");
                        if (!(dataRanges.size() > 0)) {
                        	//首先判断可有积分权益扣减
                        	if(checkFlag){//表示//补换卡   //国际及港澳台漫游电话（包含语音及短信）
                        		String checkJFKJ = (String) session.getAttribute(SysConstant.JFKJCG+"_"+sessionStaff.getInPhoneNum());
                        		if(!"Y".equals(checkJFKJ)){
                        			jsonResponse = super.failed("您的工号没有修改费用权限，请核对费用！", ResultConstant.SERVICE_RESULT_FAILTURE
                                            .getCode());
                                    return jsonResponse;
                        		}
                        	}
                        }
                    } else {
                    	if(checkFlag){//表示//补换卡   //国际及港澳台漫游电话（包含语音及短信）
                    		String checkJFKJ = (String) session.getAttribute(SysConstant.JFKJCG+"_"+sessionStaff.getInPhoneNum());
                    		if(!"Y".equals(checkJFKJ)){
                    			jsonResponse = super.failed("您的工号没有修改费用权限，请核对费用！", ResultConstant.SERVICE_RESULT_FAILTURE
                                        .getCode());
                                return jsonResponse;
                    		}
                    	}
                    }
                   //如果金额不一致判断是否有星级权益和修改费用权限
                   /* String iseditOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                            SysConstant.SESSION_KEY_EDITCHARGE + "_" + sessionStaff.getStaffId());
                    if(iseditOperation !="0" && "是否扣减积分权益"=="" ){
                    	jsonResponse = super.failed("您的工号没有修改费用权限，请核对费用！", ResultConstant.SERVICE_RESULT_FAILTURE
                                .getCode());
                        return jsonResponse;
                    }*/
                }
                
                
                rMap = orderBmo.chargeSubmit(param, flowNum, sessionStaff);
                log.debug("return={}", JsonUtil.toString(rMap));
                if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                	//受理成功清空session中的虚拟购物车ID(virOlId)
                	ServletUtils.removeSessionAttribute(super.getRequest(), Const.SESSION_UPLOAD_VIR_OLID);
                    jsonResponse = super.successed("收费成功", ResultConstant.SUCCESS.getCode());
                } else {
                    jsonResponse = super.failed(rMap.get("msg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
                    if(rMap.get("invalidOrder")!=null && rMap.get("invalidOrder").equals("Y")){
                    	jsonResponse = super.failed(rMap.get("msg"), ResultConstant.FAILD.getCode());
    				}
                }
            } else {
                jsonResponse = super.failed("订单已经建档成功,不能重复操作!", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.CHARGE_SUBMIT);
        } catch (Exception e) {
            return super.failed(ErrorCode.CHARGE_SUBMIT, e, param);
        }
        return jsonResponse;
    }

    /**
     * 帐户资料查询（新装与改帐务定制关系时查询已有帐户）
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/account", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryAccountInfo(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        JsonResponse jr = null;

        try {
            if (param.get("areaId") == null) {
                param.put("areaId", sessionStaff.getCurrentAreaId());
            }
            Map<String, Object> resultMap = orderBmo.queryAccountInfo(param, flowNum, sessionStaff);
            if (MapUtils.isNotEmpty(resultMap)) {
                jr = successed(resultMap, 0);
            } else {
                jr = failed("返回数据异常，请联系管理员", 1);
            }
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QUERY_ACCT);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_ACCT, e, param);
        }
        return jr;
    }

    /**
     * 产品鉴权
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/prodAuth", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse prodAuth(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        JsonResponse jr = null;
        try {
            Map<String, Object> returnMap = custBmo.custAuth(param, flowNum, sessionStaff);
            String isValidateStr = null;
            if (returnMap.get("isValidate") != null) {
                isValidateStr = returnMap.get("isValidate").toString();
            } else if (returnMap.get("result") != null) {
                Map<String, Object> tmpMap = MapUtils.getMap(returnMap, "result");
                isValidateStr = MapUtils.getString(tmpMap, "isValidate");
            }
            if ("true".equals(isValidateStr)) {
                jr = successed("", 0);
            } else {
                jr = failed("鉴权未通过，请确认接入号与产品密码的正确性", 1);
            }
        } catch (BusinessException be) {
            this.log.error("产品鉴权失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.CUST_AUTH);
        } catch (Exception e) {
            return super.failed(ErrorCode.CUST_AUTH, e, param);
        }
        return jr;
    }

    /**
     * 查询群组成员
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/queryCompmenber", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse addComp(@RequestBody Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        dataBusMap.put("compProdId", param.get("compProdId").toString());
        dataBusMap.put("accessNumber", param.get("accessNumber").toString());
        dataBusMap.put("areaId", sessionStaff.getCurrentAreaId().toString());
        Map<String, Object> datamap = null;
        JsonResponse jr = null;
        try {
            datamap = orderBmo.queryCompProdMemberByAn(dataBusMap, flowNum, sessionStaff);
            if (datamap != null && ResultCode.R_SUCCESS.equals(datamap.get("code").toString())) {
                jr = super.successed(datamap.get("compProdMemberInfos"), ResultConstant.SUCCESS.getCode());
            } else {
                jr = super.failed(datamap.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
            return jr;
        } catch (BusinessException be) {
            this.log.error("群组产品实例成员信息查询失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, dataBusMap, ErrorCode.QUERY_COMPPRODMEMBER);
        } catch (Exception e) {
            log.error("门户/order/queryCompmenber方法异常", e);
            return super.failed(ErrorCode.QUERY_COMPPRODMEMBER, e, dataBusMap);
        }
    }

    /**
     * 加入群组
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/addComp", method = { RequestMethod.POST })
    public String addComp(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        return "/order/order-addcomp";
    }

    /**
     * 退出群组
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/removeComp", method = { RequestMethod.POST })
    public String removeComp(@RequestBody Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        return "/order/order-removecomp";
    }

    /**
     * 产品构成查询
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/compPspecGrps", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse queryCompPspecGrpsBySpecId(@RequestBody Map<String, Object> param, Model model,
            @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        dataBusMap.put("prodSpecId", param.get("productId").toString());
        dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
        dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
        Map<String, Object> returnMap = null;
        List<Map<String, Object>> list = null;
        JsonResponse jr = null;
        try {
            returnMap = orderBmo.queryCompPspecGrpsBySpecId(dataBusMap, flowNum, sessionStaff);
            if (MapUtils.isNotEmpty(returnMap)) {
                if (returnMap.get("code").equals(ResultCode.R_SUCCESS)) {
                    Map<String, Object> prodSpec = (Map<String, Object>) returnMap.get("prodSpec");
                    jr = super.successed(prodSpec.get("compPspecCompGrps"), ResultConstant.SUCCESS.getCode());
                } else {
                    jr = failed(returnMap.get("msg"), 1);
                }
            } else {
                jr = failed("数据返回异常，请联系管理员", 1);
            }
            return jr;
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QUERY_COMPSPEC);
        } catch (Exception e) {
            log.error("门户/order/compPspecGrps方法异常", e);
            return super.failed(ErrorCode.QUERY_COMPSPEC, e, param);
        }

    }

    /**
     * 产品下终端实例数据查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/queryTerminalInfo", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryTerminalInfo(@RequestBody Map<String, Object> param, String flowNum,
            HttpServletResponse response) {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        dataBusMap.put("prodId", MapUtils.getString(param, "prodId", ""));
        dataBusMap.put("acctNbr", MapUtils.getString(param, "acctNbr", ""));
        dataBusMap.put("areaId", MapUtils.getString(param, "areaId", ""));
        dataBusMap.put("prodBigClass", MapUtils.getString(param, "prodBigClass", ""));
        JsonResponse jr = new JsonResponse();
        try {
            Map<String, Object> resultMap = orderBmo.queryOfferCouponById(dataBusMap, flowNum, sessionStaff);
            String couponTypeCd = MySimulateData.getInstance().getParam(
                    (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_DATASOURCE_KEY), "couponTypeCd");
            String transactionID = MapUtils.getString(resultMap, "transactionID", "未获取到流水号transactionID");
            if (resultMap != null && ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
                Map<String, Object> result = (Map<String, Object>) resultMap.get("result");
                List<Map<String, Object>> offerCoupon = (List<Map<String, Object>>) result.get("offerCoupon");
                Map returnMap = new HashMap();
                if (offerCoupon.isEmpty()) {
                    jr = super.failed("未查询到旧卡物品信息(流水号："+transactionID+")", ResultConstant.FAILD.getCode());
                } else {
                    for (int i = 0; i < offerCoupon.size(); i++) {
                        String currentCouponTypeCd = offerCoupon.get(i).get("couponTypeCd").toString();
                        if (null != couponTypeCd && couponTypeCd.equals(currentCouponTypeCd)) {
                            returnMap = (Map) offerCoupon.get(i);
                        }
                    }
                    if (returnMap.isEmpty()) {
                        jr = super.failed("旧卡物品信息未找到匹配的UIM类型数据(流水号："+transactionID+")", ResultConstant.FAILD.getCode());
                    } else {
                        jr = super.successed(returnMap, ResultConstant.SUCCESS.getCode());
                    }
                }
            } else {
                jr = super.failed(resultMap.get("msg").toString()+"(流水号“"+transactionID+")", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
            return jr;
        } catch (BusinessException be) {
            this.log.error("获取产品帐户信息失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, dataBusMap, ErrorCode.ORDER_OFFERCOUPON);
        } catch (Exception e) {
            log.error("门户/order/queryTerminalInfo方法异常", e);
            return super.failed(ErrorCode.ORDER_OFFERCOUPON, e, dataBusMap);
        }
    }

    /**
     * 产品下帐户信息查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/queryProdAcctInfo", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryProdAcctInfo(@RequestBody Map<String, Object> param, String flowNum,
            HttpServletResponse response) {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        dataBusMap.put("prodId", MapUtils.getString(param, "prodId"));
        dataBusMap.put("acctNbr", MapUtils.getString(param, "acctNbr"));
        dataBusMap.put("areaId", MapUtils.getString(param, "areaId"));

        JsonResponse jr = new JsonResponse();

        try {
            Map<String, Object> resultMap = orderBmo.queryProdAcctInfo(dataBusMap, flowNum, sessionStaff);

            if (resultMap != null) {
                Map<String, Object> result = (Map<String, Object>) resultMap.get("result");
                ArrayList<Map<String, Object>> prodAcctInfos = (ArrayList<Map<String, Object>>) result
                        .get("prodAcctInfos");
                jr = successed(prodAcctInfos, 0);
            } else {
                jr = failed("", 1);
            }
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, dataBusMap, ErrorCode.QUERY_PROD_ACCT);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_PROD_ACCT, e, dataBusMap);
        }
        return jr;
    }

    /**
     * 转至改付费帐户页面
     * @param prodAcctInfos
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/preChangeAccount", method = RequestMethod.POST)
    public String preChangeAccount(@RequestBody ArrayList<Map<String, Object>> prodAcctInfos, Model model,
            @LogOperatorAnn String flowNum) {

        model.addAttribute("prodAcctInfos", prodAcctInfos);

        return "/order/order-change-account";
    }

    /* bxw作废发票*/
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/invaideInvoice", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse invaideInvoice(WebRequest request, String flowNum, HttpServletResponse response) {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jr = new JsonResponse();

        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        dataBusMap.put("olId", request.getParameter("olId"));
        dataBusMap.put("soNbr", request.getParameter("soNbr"));
        dataBusMap.put("areaId", sessionStaff.getCurrentAreaId().toString());

        try {
            List<Object> listId = new ArrayList<Object>();
            int bInvoice = -1;
            Map<String, Object> resultMap = printBmo.getInvoiceItems(dataBusMap, flowNum, sessionStaff);
            if (resultMap != null) {
                if (resultMap.get("invoiceInfos") != null) {
                    Object invoiceInfos = resultMap.get("invoiceInfos");
                    if (invoiceInfos instanceof List) {
                        List<Object> list = (List<Object>) invoiceInfos;
                        if (list != null && list.size() > 0) {
                            for (Object obj : list) {
                                if (obj != null && !obj.equals("null") && obj instanceof Map) {
                                    Map invoiceInfo = (Map) obj;
                                    listId.add(invoiceInfo.get("invoiceId"));
                                    bInvoice = 1;
                                }
                            }
                            if (bInvoice == -1) {
                                bInvoice = 0;
                            }
                        } else {
                            bInvoice = 0;
                        }
                    }
                }
            }
            if (bInvoice > 0) {//bInvoice费用接口调用成功，如果有list数据，调用作废接口，否则？？？？	
                Map<String, Object> parms = new HashMap<String, Object>();
                parms.put("invoiceIds", listId);
                parms.put("areaId", sessionStaff.getCurrentAreaId().toString());
                Map<String, Object> resultInvalid = orderBmo.updateInvoiceInvalid(parms, flowNum, sessionStaff);
                if (resultInvalid.get("code") != null && resultInvalid.get("code").equals("0")) {
                    jr = successed("发票作废成功！", 0);
                } else {
                    jr = failed("发票作废失败！", 1);
                }
            } else if (bInvoice == 0) {
                jr = failed("未获取到发票信息！", 2);
            } else {
                jr = failed("获取发票信息失败！", 3);
            }
        } catch (BusinessException be) {
            this.log.error("发票作废失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {

            return super.failed(ie, dataBusMap, ErrorCode.INVOICE_INVALID);
        } catch (Exception e) {
            log.error("发票作废/order/invaideInvoice方法异常", e);
            return super.failed(ErrorCode.INVOICE_INVALID, e, dataBusMap);
        }
        return jr;
    }

    @RequestMapping(value = "/checkGroupShortNum", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse groupShortNbrQuery(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        Map<String, Object> releaseMap = null;
        JsonResponse jsonResponse = null;
        String groupShortNbr = param.get("shortNbr").toString();
        param.remove("shortNbr");
        try {
            param.put("lanId", sessionStaff.getCurrentAreaId());
            boolean isBothExecute = param.containsKey("oldnum");
            if (isBothExecute) {
                String oldnum = param.get("oldnum").toString();
                param.remove("oldnum");
                param.put("groupShortNbr", oldnum);
                param.put("statusCd", "1000");
                releaseMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
                param.remove("groupShortNbr");
                param.put("groupShortNbr", groupShortNbr);
                param.put("statusCd", "1102");
                rMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
                if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                    jsonResponse = super.successed("校验成功！", ResultConstant.SUCCESS.getCode());
                } else {
                    jsonResponse = super.failed(rMap.get("msg"), ResultConstant.FAILD.getCode());
                }
            } else {
                param.put("groupShortNbr", groupShortNbr);
                rMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
                if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                    jsonResponse = super.successed(rMap.get("msg"), ResultConstant.SUCCESS.getCode());
                } else {
                    jsonResponse = super.failed(rMap.get("msg"), ResultConstant.FAILD.getCode());
                }
            }
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("短号校验服务出错", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.SHORT_NUM_CHECK);
        } catch (Exception e) {
            log.error("门户/order/checkGroupShortNum方法异常", e);
            return super.failed(ErrorCode.SHORT_NUM_CHECK, e, param);
        }

    }

    /*bxw短号修改：校验*/
    @RequestMapping(value = "/checkReleaseShortNum", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkReleaseShortNum(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse = null;

        String checkNbr = param.get("checkNbr") == null ? "" : param.get("checkNbr").toString();
        String groupShortNbr = param.get("groupShortNbr") == null ? "" : param.get("groupShortNbr").toString();
        if (groupShortNbr == null || groupShortNbr.equals("") || groupShortNbr.equals("null")) {
            jsonResponse = super.failed("请输入新的短号再检查！", ResultConstant.FAILD.getCode());
        } else if (groupShortNbr.equals(checkNbr)) {
            jsonResponse = super.failed("新旧短号相同，请修改再提交！", ResultConstant.FAILD.getCode());
        }
        try {
            param.remove("checkNbr");
            if (checkNbr != null && !checkNbr.equals("") && !checkNbr.equals("null")) {
                param.put("groupShortNbr", checkNbr);
                param.put("statusCd", "1000");
                Map releaseMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
                //releaseMap.get("code");
            }
            param.put("groupShortNbr", groupShortNbr);
            param.put("statusCd", "1102");
            Map releaseMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
            if (releaseMap != null && ResultCode.R_SUCCESS.equals(releaseMap.get("code").toString())) {
                jsonResponse = super.successed(releaseMap.get("msg"), ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(releaseMap.get("msg"), ResultConstant.FAILD.getCode());
            }

        } catch (BusinessException be) {

            return super.failed(be);
        } catch (InterfaceException ie) {

            return super.failed(ie, param, ErrorCode.SHORT_NUM_CHECK);
        } catch (Exception e) {
            log.error("短号校验/order/checkReleaseShortNum方法异常", e);
            return super.failed(ErrorCode.SHORT_NUM_CHECK, e, param);
        }
        return jsonResponse;
    }

    /*bxw发展人类型*/
    @RequestMapping(value = "/queryPartyProfileSpecList", method = RequestMethod.POST)
    public @ResponseBody
    Map<String, Object> queryPartyProfileSpecList(HttpSession session, WebRequest request) throws Exception {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String areaId = sessionStaff.getCurrentAreaId();
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("areaId", areaId);
        Map<String, Object> result = orderBmo.assistantTypeQuery(param, null, sessionStaff);
        return result;
    }

    /**
     * 跳转手动归档页面
     * @return
     */
    @RequestMapping(value = "/autoArchivedMain", method = { RequestMethod.POST, RequestMethod.GET })
    public String autoArchivedMain() {
        return "/order/order-update-archived";
    }

    /**
     * {olNbr:"", olId :"" ,distributorId : ""}
     * olNbr购物车流水号
     * olId订单id
     * distributorId转售商id
     * 执行手动归档
     * @param request
     * @return
     */
    @RequestMapping(value = "/updateArchivedAuto", method = { RequestMethod.POST, RequestMethod.GET })
    @ResponseBody
    public JsonResponse updateArchivedAuto(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            WebRequest request) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> res = new HashMap<String, Object>();
        try {
        	param.put("flag", "1");//1代表门户
        	param.put("staffId", sessionStaff.getStaffId());
            res = orderBmo.updateArchivedAuto(param, flowNum, sessionStaff);
            return super.successed(res);
        } catch (BusinessException be) {

            return super.failed(be);
        } catch (InterfaceException ie) {

            return super.failed(ie, param, ErrorCode.UPDATE_ARCHIVED_AUTO);
        } catch (Exception e) {
            log.error("执行手动归档方法异常/order/updateArchivedAuto", e);
            return super.failed(ErrorCode.STAFF_LOGIN, res, param);
        }
    }

    /**
     * 下省校验单
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/checkRuleToProv", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkRuleToProv(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse = null;
        try {
            param.put("areaId", sessionStaff.getCurrentAreaId());
            param.put("portalFlag", "Y");
            Map<String, Object> resultMap = orderBmo.checkRuleToProv(param, flowNum, sessionStaff);
            Map<String, Object> returnMap = new HashMap<String, Object>();

            String provCheckCode = MapUtils.getString(resultMap, "returnCode", "0000");//下省校验结果编码
            String provCheckMsg = MapUtils.getString(resultMap, "resultMsg", "未返回校验结果信息");//下省校验结果信息

            //下省校验成功
            if ("0000".equals(provCheckCode)) {
                if (resultMap.get("checkResult") != null) {
                    List<Map<String, String>> checkResult = new ArrayList<Map<String, String>>();
                    List<Map<String, String>> list = (List<Map<String, String>>) resultMap.get("checkResult");
                    for (Map<String, String> map : list) {
                        if (SysConstant.REDUCE_PRESTORE_STATE.equals(map.get("code"))) {
                            checkResult.add(map);
                        }
                    }
                    returnMap.put("returnCode", "0000");
                    returnMap.put("checkResult", checkResult);
                }
                jsonResponse = super.successed(returnMap, ResultConstant.SUCCESS.getCode());
            }
            //下省校验有错误
            else {
                //省内校验欠费的错误编码，判断当前工号有否带欠费受理的权限酌情处理
                if (SysConstant.PROV_CHECK_OVERDUE_1.equals(provCheckCode)
                        || SysConstant.PROV_CHECK_OVERDUE_2.equals(provCheckCode)) {
                    String canDoOverdueBusi = staffBmo.checkOperatSpec(SysConstant.OVERDUE_BUSI_CODE, sessionStaff);
                    //当前工号有继续受理的权限
                    if ("0".equals(canDoOverdueBusi)) {
                        if (resultMap.get("checkResult") != null) {
                            List<Map<String, String>> checkResult = new ArrayList<Map<String, String>>();
                            List<Map<String, String>> list = (List<Map<String, String>>) resultMap.get("checkResult");
                            for (Map<String, String> map : list) {
                                if (SysConstant.REDUCE_PRESTORE_STATE.equals(map.get("code"))) {
                                    checkResult.add(map);
                                }
                            }
                            returnMap.put("returnCode", provCheckCode);
                            returnMap.put("checkResult", checkResult);
                        }
                        jsonResponse = super.successed(returnMap, ResultConstant.SUCCESS.getCode());
                    }
                    //当前工号没有继续受理的权限，返回错误信息
                    else {
                        returnMap.put("errCode", provCheckCode);
                        returnMap.put("errMsg", provCheckMsg);
                        jsonResponse = super.failed(returnMap, ResultConstant.FAILD.getCode());
                    }
                }
                //其他错误编码，直接返回错误信息
                else {
                    returnMap.put("errCode", provCheckCode);
                    returnMap.put("errMsg", provCheckMsg);
                    jsonResponse = super.failed(returnMap, ResultConstant.FAILD.getCode());
                }
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.CHECK_RULETOPRO);
        } catch (Exception e) {
            return super.failed(ErrorCode.CHECK_RULETOPRO, e, param);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/inOrderYsl", method = { RequestMethod.POST, RequestMethod.GET })
    public String inOrderYsl() {
        return "/order/order-ysl";
    }

    @RequestMapping(value = "/queryOrderYsl", method = { RequestMethod.POST, RequestMethod.GET })
    @AuthorityValid(isCheck = true)
    public String queryOrderYsl(Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Calendar c = Calendar.getInstance();
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
        String endTime = f.format(c.getTime());
        c.add(Calendar.DATE, -7);
        String startTime = f.format(c.getTime());
        Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);

        model.addAttribute("p_startDt", startTime);
        model.addAttribute("p_endDt", endTime);
        model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
        model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
        return "/orderQuery/query-order-ysl";
    }

    /**
     * 终端预约
     * @param model
     * @return
     */
    @RequestMapping(value = "/queryOrderZdyy", method = { RequestMethod.POST, RequestMethod.GET })
    public String queryOrderZdyy(Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Calendar c = Calendar.getInstance();
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
        String endTime = f.format(c.getTime());
        c.add(Calendar.DATE, -7);
        String startTime = f.format(c.getTime());
        Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);

        model.addAttribute("p_startDt", startTime);
        model.addAttribute("p_endDt", endTime);
        model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
        model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
        return "/orderQuery/query-zdyy-order";
    }

    /*预受理业务类型*/
    @RequestMapping(value = "/querybusitype", method = { RequestMethod.POST, RequestMethod.GET })
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse querybusitype(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        String resultList = null;
        try {
            rMap = this.orderBmo.querybusitype(param, null, sessionStaff);
            resultList = rMap.get("result").toString();
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())
                    && !"[]".equals(resultList)) {
                jsonResponse = super.successed(rMap.get("result"), ResultConstant.SUCCESS.getCode());
            } else if ("[]".equals(resultList)) {
                jsonResponse = super.failed("查询业务类型无数据", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("resultMsg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("查询业务类型失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QRY_BUSITYPE);
        } catch (Exception e) {
            log.error("门户/order/querybusitype方法异常", e);
            return super.failed(ErrorCode.QRY_BUSITYPE, e, param);
        }
    }

    /*预受理业务动作*/
    @RequestMapping(value = "/querybusiactiontype", method = { RequestMethod.POST, RequestMethod.GET })
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse querybusiactiontype(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        String resultList = null;
        try {
            rMap = this.orderBmo.querybusiactiontype(param, null, sessionStaff);
            // 			resultList =rMap.get("result").toString();
            // 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())&&!"[]".equals(resultList)) {
            jsonResponse = super.successed(rMap.get("result"), ResultConstant.SUCCESS.getCode());
            // 			}else if("[]".equals(resultList)) {
            // 				jsonResponse = super.failed("查询业务动作无数据",
            // 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            // 			} else {
            // 				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
            // 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            // 			}		
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("查询业务动作失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QRY_BUSIACTIONTYPE);
        } catch (Exception e) {
            log.error("门户/order/querybusiactiontype方法异常", e);
            return super.failed(ErrorCode.QRY_BUSIACTIONTYPE, e, param);
        }
    }

    /*预受理订单提交*/
    @RequestMapping(value = "/suborderysl", method = { RequestMethod.POST, RequestMethod.GET })
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse suborderysl(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response, @LogOperatorAnn String flowNum) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String STAFF_ID = sessionStaff.getStaffId();
        String staff_nbr = sessionStaff.getStaffCode();
        String STAFF_NAME = sessionStaff.getStaffName();
        String CHANNEL_ID = sessionStaff.getCurrentChannelId();
        String channel_name = sessionStaff.getCurrentChannelName();
        String areaid = sessionStaff.getCurrentAreaId();
        String areaname = sessionStaff.getCurrentAreaName();
        String org_id = sessionStaff.getOrgId();
        String org_name = sessionStaff.getOrgName();
        String CUST_SO_NUMBER = "YSL" + DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS")
                + RandomStringUtils.randomNumeric(3);

        param.put("STAFF_ID", STAFF_ID);
        param.put("staff_nbr", staff_nbr);
        param.put("STAFF_NAME", STAFF_NAME);
        param.put("CHANNEL_ID", CHANNEL_ID);
        param.put("channel_name", channel_name);
        param.put("areaid", areaid);
        param.put("areaname", areaname);
        param.put("CUST_SO_NUMBER", CUST_SO_NUMBER);
        param.put("org_id", org_id);
        param.put("org_name", org_name);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = this.orderBmo.suborderysl(param, null, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())) {
                if ("9".equals(param.get("BUSI_TYPE_CD"))) {
                    String sendterminal = (String) param.get("sendterminal");
                    String phoneNumber = (String) param.get("CONTACT_NO");
                    String cust_so_number = (String) rMap.get("CUST_SO_NUMBER");
                    Map<String, Object> msgMap = sendMsg(request, flowNum, sendterminal, phoneNumber, cust_so_number);
                }
                // 				rMap.put("CUST_SO_NUMBER", CUST_SO_NUMBER);
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_INSERT_ORDERYSLINFO, String
                        .valueOf(rMap.get("resultMsg")), JsonUtil.toString(param));
                // 				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
                // 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("预受理订单提交失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.INSERT_ORDERYSL);
        } catch (Exception e) {
            log.error("门户/order/suborderysl方法异常", e);
            return super.failed(ErrorCode.INSERT_ORDERYSL, e, param);
        }
    }

    /*终端预约状态更新*/
    @RequestMapping(value = "/updateorderzdyy", method = { RequestMethod.POST, RequestMethod.GET })
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse updateorderzdyy(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String staff_id = sessionStaff.getStaffId();
        String staff_nbr = sessionStaff.getStaffCode();
        String staff_name = sessionStaff.getStaffName();
        String channel_id = sessionStaff.getCurrentChannelId();
        String channel_name = sessionStaff.getCurrentChannelName();
        String areaid = sessionStaff.getCurrentAreaId();
        String areaname = sessionStaff.getCurrentAreaName();
        String org_id = sessionStaff.getOrgId();
        String org_name = sessionStaff.getOrgName();

        param.put("staff_id", staff_id);
        param.put("staff_nbr", staff_nbr);
        param.put("staff_name", staff_name);
        param.put("channel_id", channel_id);
        param.put("channel_name", channel_name);
        param.put("areaid", areaid);
        param.put("areaname", areaname);
        param.put("org_id", org_id);
        param.put("org_name", org_name);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = this.orderBmo.updateorderzdyy(param, null, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())) {
                rMap.put("cust_so_number", param.get("cust_so_number"));
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_UPDATE_ORDERZDYYINFO, String
                        .valueOf(rMap.get("resultMsg")), JsonUtil.toString(param));
            }
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("终端预约状态更新失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.INSERT_ORDERYSL);
        } catch (Exception e) {
            log.error("门户/order/updateorderzdyy方法异常", e);
            return super.failed(ErrorCode.UPDATE_ORDERZDYY, e, param);
        }
    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/queryyslList", method = RequestMethod.GET)
    public String queryyslList(HttpSession session, Model model, WebRequest request) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1;
        Integer upPage = 1;
        Integer downPage = 10;
        Integer pageSize = 10;
        Integer totalSize = 0;

        param.put("startDt", request.getParameter("startDt"));
        param.put("endDt", request.getParameter("endDt"));
        param.put("areaId", request.getParameter("areaId"));
        param.put("busitype", request.getParameter("busitype"));
        param.put("channelId", request.getParameter("channelId"));
        param.put("accnum", request.getParameter("accnum"));
        param.put("custname", request.getParameter("custname"));
        param.put("CustIdCard", request.getParameter("CustIdCard"));
        param.put("olNbr", request.getParameter("olNbr"));
        try {
            nowPage = Integer.parseInt(request.getParameter("nowPage").toString());
            pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
            if (nowPage != 1) {
                upPage = (nowPage - 1) * pageSize + 1;
                downPage = pageSize * nowPage;
            }
            param.put("nowPage", upPage);
            param.put("pageSize", downPage);

            Map<String, Object> map = orderBmo.queryyslList(param, null, sessionStaff);
            if (map != null && map.get("orderLists") != null) {
                list = (List<Map<String, Object>>) map.get("orderLists");
                totalSize = (Integer) map.get("totalCnt");
            }
            PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(nowPage, pageSize, totalSize < 1 ? 1
                    : totalSize, list);
            model.addAttribute("pageModel", pm);
            model.addAttribute("code", map.get("code"));
            model.addAttribute("mess", map.get("message"));

            return "/orderQuery/order-ysl-list";
        } catch (BusinessException be) {

            return super.failedStr(model, be);
        } catch (InterfaceException ie) {

            return super.failedStr(model, ie, param, ErrorCode.QUERY_ORDERYSL);
        } catch (Exception e) {
            log.error("预受理订单查询/queryyslList方法异常", e);
            return super.failedStr(model, ErrorCode.QUERY_ORDERYSL, e, param);
        }
    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/queryzdyyList", method = RequestMethod.GET)
    public String queryzdyyList(HttpSession session, Model model, WebRequest request) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1;
        Integer upPage = 1;
        Integer downPage = 10;
        Integer pageSize = 10;
        Integer totalSize = 0;

        param.put("startDt", request.getParameter("startDt"));
        param.put("endDt", request.getParameter("endDt"));
        param.put("areaId", request.getParameter("areaId"));
        param.put("busitype", request.getParameter("busitype"));
        param.put("channelId", request.getParameter("channelId"));
        param.put("accnum", request.getParameter("accnum"));
        param.put("custname", request.getParameter("custname"));
        param.put("CustIdCard", request.getParameter("CustIdCard"));
        param.put("olNbr", request.getParameter("olNbr"));
        param.put("olType", request.getParameter("olType"));
        try {
            nowPage = Integer.parseInt(request.getParameter("nowPage").toString());
            pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
            if (nowPage != 1) {
                upPage = (nowPage - 1) * pageSize + 1;
                downPage = pageSize * nowPage;
            }
            param.put("nowPage", upPage);
            param.put("pageSize", downPage);

            Map<String, Object> map = orderBmo.queryzdyyList(param, null, sessionStaff);
            if (map != null && map.get("orderLists") != null) {
                list = (List<Map<String, Object>>) map.get("orderLists");
                totalSize = (Integer) map.get("totalCnt");
            }
            PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(nowPage, pageSize, totalSize < 1 ? 1
                    : totalSize, list);
            model.addAttribute("pageModel", pm);
            model.addAttribute("code", map.get("code"));
            model.addAttribute("mess", map.get("message"));
            model.addAttribute("countInfo", map.get("countInfo"));

            return "/orderQuery/order-zdyy-list";
        } catch (BusinessException be) {

            return super.failedStr(model, be);
        } catch (InterfaceException ie) {

            return super.failedStr(model, ie, param, ErrorCode.QUERY_ORDERYSL);
        } catch (Exception e) {
            log.error("预受理订单查询/queryyslList方法异常", e);
            return super.failedStr(model, ErrorCode.QUERY_ORDERYSL, e, param);
        }
    }

    @RequestMapping(value = "/queryYslDetail", method = { RequestMethod.POST, RequestMethod.GET })
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse queryYslDetail(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        String status_cd = (String) param.get("status_cd");
        try {
            rMap = orderBmo.queryyslList(param, null, sessionStaff);
            rMap.put("status_cd", status_cd);
            jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("查询业务类型失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QRY_BUSITYPE);
        } catch (Exception e) {
            log.error("预受理订单详情/queryYslDetail方法异常", e);
            return super.failed(ErrorCode.QUERY_ORDERYSL, e, param);
        }
    }

    @RequestMapping(value = "/queryZdyyDetail", method = { RequestMethod.POST, RequestMethod.GET })
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse queryZdyyDetail(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        String status_cd = (String) param.get("status_cd");
        try {
            rMap = orderBmo.queryzdyyList(param, null, sessionStaff);
            rMap.put("status_cd", status_cd);
            jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("查询业务类型失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QRY_BUSITYPE);
        } catch (Exception e) {
            log.error("预受理订单详情/queryYslDetail方法异常", e);
            return super.failed(ErrorCode.QUERY_ORDERZDYY, e, param);
        }
    }

    @RequestMapping(value = "/updateChargeInfoForCheck", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse updateChargeInfoForCheck(@RequestBody Map<String, Object> param,
            @LogOperatorAnn String flowNum, HttpServletRequest request, HttpServletResponse response,
            HttpSession session) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        String iseditOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_DEPOSIT + "_" + sessionStaff.getStaffId());
        try {
            if (iseditOperation == null) {
                iseditOperation = staffBmo.checkOperatSpec(SysConstant.DEPOSIT_CODE, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_DEPOSIT + "_"
                        + sessionStaff.getStaffId(), iseditOperation);
            }
        } catch (BusinessException e) {
            iseditOperation = "1";
        } catch (InterfaceException ie) {
            iseditOperation = "1";
        } catch (Exception e) {
            iseditOperation = "1";
        }

        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        if ("0".equals(iseditOperation)) {
            try {
                param.put("areaId", sessionStaff.getCurrentAreaId());
                rMap = orderBmo.updateChargeInfoForCheck(param, flowNum, sessionStaff);
                if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                    String olposurl = "";
                    if (!"".equals(sessionStaff.getAreaId())) {
                        String pos = "pos";
                        if (!CommonMethods.isOINet(request)) {
                            pos += "O";
                            log.debug("在线pos==============", pos);
                        }
                        olposurl = MySimulateData.getInstance().getNeeded(
                                (String) ServletUtils.getSessionAttribute(super.getRequest(),
                                        SysConstant.SESSION_DATASOURCE_KEY),
                                InterfaceClient.CHECK_LOGIN + "-" + sessionStaff.getAreaId().substring(0, 3) + "0000",
                                pos);
                        log.debug("在线olposurl==============", olposurl);
                        Map<String, Object> map = new HashMap<String, Object>();
                        map.put("olId", param.get("olId"));
                        map.put("olNbr", param.get("soNbr"));
                        map.put("typeclass", "");
                        map.put("result", "");
                        map.put("message", "");
                        JSONObject jsonObj = JSONObject.fromObject(param);
                        map.put("param", jsonObj.toString());
                        map.put("FLAG", "insert");
                        Map posmap = orderBmo.GetOLpos(map, flowNum, sessionStaff);
                        //							session.setAttribute(sessionStaff.getStaffId(), param);
                    }
                    jsonResponse = super.successed(olposurl, ResultConstant.SUCCESS.getCode());
                } else {
                    jsonResponse = super.failed(rMap.get("msg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
                }
            } catch (BusinessException e) {
                return super.failed(e);
            } catch (InterfaceException ie) {
                return super.failed(ie, param, ErrorCode.CHARGEINFO_CHECK);
            } catch (Exception e) {
                return super.failed(ErrorCode.CHARGEINFO_CHECK, e, param);
            }
        } else if ("1".equals(iseditOperation)) {
            jsonResponse = super.failed("签权接口异常", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        } else {
            try {
                String olposurl = "";
                if (!"".equals(sessionStaff.getAreaId())) {
                    String pos = "pos";
                    if (!CommonMethods.isOINet(request)) {
                        pos += "O";
                        this.log.debug("在线pos================", pos);
                    }
                    olposurl = MySimulateData.getInstance().getNeeded(
                            (String) ServletUtils.getSessionAttribute(super.getRequest(),
                                    SysConstant.SESSION_DATASOURCE_KEY),
                            InterfaceClient.CHECK_LOGIN + "-" + sessionStaff.getAreaId().substring(0, 3) + "0000", pos);
                    this.log.debug("在线olposurl================", olposurl);
                    //						session.setAttribute(sessionStaff.getStaffId(), param);
                    Map<String, Object> map = new HashMap<String, Object>();
                    map.put("olId", param.get("olId"));
                    map.put("olNbr", param.get("soNbr"));
                    map.put("typeclass", "");
                    map.put("result", "");
                    map.put("message", "");
                    JSONObject jsonObj = JSONObject.fromObject(param);
                    map.put("param", jsonObj.toString());
                    map.put("FLAG", "insert");
                    Map posmap = orderBmo.GetOLpos(map, flowNum, sessionStaff);
                }
                jsonResponse = super.successed(olposurl, ResultConstant.SUCCESS.getCode());
            } catch (Exception e) {
                // TODO: handle exception
            }
        }
        return jsonResponse;
    }

    /*订单时长*/
    @RequestMapping(value = "/createorderlonger", method = { RequestMethod.POST, RequestMethod.GET })
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse createorderlonger(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = this.orderBmo.createorderlonger(param, null, sessionStaff);
            jsonResponse = super.successed(rMap.get("time"), ResultConstant.SUCCESS.getCode());
            return jsonResponse;
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.CREATE_ORDERLONGER);
        } catch (Exception e) {
            return super.failed(ErrorCode.CREATE_ORDERLONGER, e, param);
        }
    }

    @RequestMapping(value = "/gotosubmitOrder", method = RequestMethod.POST)
    public String gotosubmitOrder(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response,
            HttpServletRequest request) {
        model.addAttribute("resMap", param);
        model.addAttribute("resMapJson", JsonUtil.buildNormal().objectToJson(param));
        return "/order/order-confirm";
    }

    /**
     * 4GWEB订单提交
     */
    @RequestMapping(value = "/orderSubmit", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse orderSubmit(@RequestBody Map<String, Object> param, HttpServletResponse response, HttpServletRequest request) throws Exception {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    	JsonResponse jsonResponse = null;
        Object realNameFlag =  MDA.REAL_NAME_PHOTO_FLAG.get("REAL_NAME_PHOTO_"+sessionStaff.getCurrentAreaId().substring(0, 3));
    	boolean isRealNameFlagOn  = realNameFlag == null ? false : "ON".equals(realNameFlag.toString()) ? true : false;//实名制拍照开关是否打开
    	if (commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)) {
            try {
                if(orderBmo.verifyCustCertificate(param, request ,sessionStaff)){
                	if(commonBmo.orderSubmitFilter(param)){
                        Map<String, Object> orderList = (Map<String, Object>) param.get("orderList");
                        Map<String, Object> orderListInfo = (Map<String, Object>) orderList.get("orderListInfo");
                        orderListInfo.put("staffId", sessionStaff.getStaffId()); //防止前台修改
                        orderListInfo.put("channelId", sessionStaff.getCurrentChannelId()); //防止前台修改
                        
                        //过滤订单属性
                        List<Map<String, Object>> custOrderAttrs = (List<Map<String, Object>>) orderListInfo.get("custOrderAttrs");
                        //添加客户端IP地址到订单属性
                        Map<String, Object> IPMap = new HashMap<String, Object>();
                        if(isRealNameFlagOn){
                        	IPMap.put("itemSpecId", SysConstant.ORDER_ATTRS_IP);
                        } else{
                        	IPMap.put("itemSpecId", SysConstant.ORDER_ATTRS_IP_TEM);
                        }
                        IPMap.put("value", ServletUtils.getIpAddr(request));
                        if (custOrderAttrs == null){
                        	custOrderAttrs = new ArrayList<Map<String, Object>>();
                        }
                        custOrderAttrs.add(IPMap);
                        orderListInfo.put("custOrderAttrs", custOrderAttrs);

                        String isAddOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.FDSL + "_" + sessionStaff.getStaffId());
                        //没有暂存单权限的员工不能添加暂存单订单属性
                        if (!"0".equals(isAddOperation)) {
                            if (custOrderAttrs != null && custOrderAttrs.size() != 0) {
                                List<Map<String, Object>> filterCustOrderAttrs = new ArrayList<Map<String, Object>>();
                                for (Map<String, Object> custOrderAttr : custOrderAttrs) {
                                    if (custOrderAttr != null
                                            && !SysConstant.FDSL_ORDER_ATTR_SPECID.equals(custOrderAttr.get("itemSpecId"))) {
                                        filterCustOrderAttrs.add(custOrderAttr);
                                    }
                                }
                                orderListInfo.put("custOrderAttrs", filterCustOrderAttrs);
                            }
                        }
                        
                        Map<String, Object> resMap = orderBmo.orderSubmit(param, null, sessionStaff);
                        if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                            Map<String, Object> result = (Map<String, Object>) resMap.get("result");
                            String olId = (String) result.get("olId");
                            String soNbr = (String) orderListInfo.get("soNbr");
//                            String olTypeCd = orderListInfo.get("olTypeCd").toString();
                            String actionFlag = orderListInfo.get("actionFlag") != null ? orderListInfo.get("actionFlag").toString() : "";
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
                                        sessionStaff.setOrderData(resMap);
                                        break;
                                    }
                                }
                                if (!ruleflag) {
                                    resMap.put("rolId", olId);
                                    resMap.put("rsoNbr", soNbr);
                                    resMap.put("checkRule", "checkRule");
                                }
                            }
                            if (actionFlag.equals("37") || actionFlag.equals("38")) {
                                resMap.put("checkRule", "notCheckRule");
                            }
                            jsonResponse = super.successed(resMap, ResultConstant.SUCCESS.getCode());
                        } else {
                            jsonResponse = super.failed(resMap.get("resultMsg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
                        }
                	} else{
                    	return super.failed(ErrorCode.PORTAL_INPARAM_ERROR, "订单提交入参过滤发生异常，新建客户、经办人或使用人时证件信息不可为空，请清空浏览器缓存后重新尝试，请不要进行非法提交、多窗口同时提交受理业务。", param);
                	}
                } else{
                	return super.failed(ErrorCode.PORTAL_INPARAM_ERROR, "订单提交时客户证件数据校验失败，经办人必须拍照，政企客户使用人必填，请不要进行非法提交、多窗口同时提交受理业务。", param);
                }
            } catch (BusinessException e) {
                return super.failed(e);
            } catch (InterfaceException ie) {
                return super.failed(ie, param, ErrorCode.ORDER_SUBMIT);
            } catch (Exception e) {
                return super.failed(ErrorCode.ORDER_SUBMIT, e, param);
            }
        } else {
            super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
        }
        return jsonResponse;
    }


    @RequestMapping(value = "/orderSubmit4iot", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse orderSubmit4iot(@RequestBody Map<String, Object> param, HttpServletResponse response,
            HttpServletRequest request) throws Exception {
        JsonResponse jsonResponse = null;
            try {
                SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_LOGIN_STAFF);
                Map<String,Object> custOrderInfo = (Map) param.get("custOrderInfo");

                custOrderInfo.put("staffCode", sessionStaff.getStaffCode()); //防止前台修改
                custOrderInfo.put("channelNbr", sessionStaff.getCurrentChannelCode());
                custOrderInfo.put("commonRegionId", sessionStaff.getAreaId());
                custOrderInfo.put("busiType", "1");//校验单
                custOrderInfo.put("transationNbr", UIDGenerator.getRand());

                Map<String, Object> resMap = orderBmo.orderSubmit4iot(param, null, sessionStaff);
                boolean isCheckOrder=true;
                if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                    custOrderInfo.put("busiType", "0");//正式单
                    resMap = orderBmo.orderSubmit4iot(param, null, sessionStaff);
                    jsonResponse = super.successed(resMap, ResultConstant.SUCCESS.getCode());
                    isCheckOrder=false;
                }
                if (isCheckOrder) {
                    if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                        Map result = (Map) resMap.get("result");
                        if (result.get("ruleInfos") == null) {
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
                                resMap.put("checkRule", "checkRule");
                            }
                        }
                        jsonResponse = super.successed(resMap, ResultConstant.SUCCESS.getCode());
                    } else {
                        jsonResponse = super.failed(resMap.get("resultMsg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
                    }
                }
            } catch (BusinessException e) {
                return super.failed(e);
            } catch (InterfaceException ie) {
                return super.failed(ie, param, ErrorCode.IOT_TRANSFER_ARCHIVE);
            } catch (Exception e) {
                return super.failed(ErrorCode.IOT_TRANSFER_ARCHIVE, e, param);
            }
        return jsonResponse;
    }

    @RequestMapping(value = "/queryAuthenticDataRange", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryAuthenticDataRange(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            param.put("operatSpecCd", "OPSCD_FYJM");
            param.put("dataDimensionCd", "DIM_CD_JMFYX");
            param.put("staffId", sessionStaff.getStaffId());
            param.put("areaId", sessionStaff.getCurrentAreaId());
            rMap = orderBmo.queryAuthenticDataRange(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                List result = (List) rMap.get("result");
                Map remap = (Map) result.get(0);
                List dataRanges = (List) remap.get("dataRanges");
                jsonResponse = super.successed(dataRanges, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QUERY_AUTHENTICDATARANGE);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_AUTHENTICDATARANGE, e, param);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/GetOLpos", method = { RequestMethod.POST, RequestMethod.GET })
    public String GetOLpos(@LogOperatorAnn String flowNum, HttpServletRequest request, HttpServletResponse response,
            Model model, HttpSession session) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String olId = request.getParameter("olId");
        String olNbr = request.getParameter("olNbr");
        String typeclass = request.getParameter("typeclass");
        String result = request.getParameter("result");
        String message = request.getParameter("message");//成功-0，失败-1，取消-2
        if ("0".equals(message)) {
            message = "调用POS机缴费成功!";
        } else if ("1".equals(message)) {
            message = "调用POS机缴费失败!";
        } else if ("2".equals(message)) {
            message = "取消POS缴费!";
        }
        //		try {
        //			message = new String(request.getParameter("message").toString().getBytes("ISO-8859-1"),"UTF-8");
        //		} catch (UnsupportedEncodingException e1) {
        //			// TODO Auto-generated catch block
        //			e1.printStackTrace();
        //		}
        Map rMap = new HashMap();
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("olId", olId);
        map.put("olNbr", olNbr);
        map.put("typeclass", typeclass);
        map.put("result", result);
        map.put("message", message);
        map.put("FLAG", "update");
        try {
            rMap = orderBmo.GetOLpos(map, flowNum, sessionStaff);
        } catch (BusinessException e) {
            return super.failedStr(model, e);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, map, ErrorCode.CHARGE_SUBMIT);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.CHARGE_SUBMIT, e, map);
        }
        if ("0".equals(result)) {
            //			Map param = (Map)session.getAttribute(sessionStaff.getStaffId());
            List list = (List) rMap.get("result");
            Map aa = (Map) list.get(0);
            Object obj = (Object) aa.get("PARAM");
            Map<String, Object> param = JsonUtil.toObject((String) obj, Map.class);
            try {
                Map charMap = orderBmo.chargeSubmit(param, flowNum, sessionStaff);
                if (charMap != null && ResultCode.R_SUCCESS.equals(charMap.get("code").toString())) {
                    //					session.removeAttribute(sessionStaff.getStaffId());
                    model.addAttribute("code", "0");
                    model.addAttribute("param", param);
                } else {
                    model.addAttribute("code", charMap.get("code"));
                    model.addAttribute("msg", charMap.get("msg"));
                    Map ma = new HashMap();
                    ma.put("custId", "");
                    ma.put("olId", "");
                    ma.put("soNbr", "");
                    model.addAttribute("param", ma);
                }
            } catch (BusinessException e) {
                return super.failedStr(model, e);
            } catch (InterfaceException ie) {
                return super.failedStr(model, ie, map, ErrorCode.CHARGE_SUBMIT);
            } catch (Exception e) {
                return super.failedStr(model, ErrorCode.CHARGE_SUBMIT, e, map);
            }
        } else {
            model.addAttribute("code", result);
            model.addAttribute("msg", message);
            Map ma = new HashMap();
            ma.put("custId", "null");
            ma.put("olId", "null");
            ma.put("soNbr", "null");
            model.addAttribute("param", ma);
        }
        return "/order/order-charge-back";
    }

    @RequestMapping(value = "/queryFeeType", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse queryFeeType(@RequestParam Map<String, Object> paramMap, Model model) {
        JsonResponse jsonResponse = null;
        String feeTypeFag = "1";//1表示不用判断，0表示要判断
        try {
            feeTypeFag = MySimulateData.getInstance().getParam(
                    (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_DATASOURCE_KEY),
                    "query_fee_type");
            if (StringUtils.isBlank(feeTypeFag)) {
                feeTypeFag = "1";
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (InterfaceException e) {
            e.printStackTrace();
        }
        jsonResponse = super.successed(feeTypeFag, ResultConstant.SUCCESS.getCode());
        return jsonResponse;
    }

    /**
     * 查询配置，是否显示省内订单属性
     * @param paramMap
     * @param model
     * @return
     */
    @RequestMapping(value = "/provOrderAttrFlag", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse provOrderAttrFlag(@RequestParam Map<String, Object> paramMap, Model model) {
        JsonResponse jsonResponse = null;
        String provOrderAttrFlag = "1";//0-打开，1-关闭
        try {
            //根据所属渠道ID查询
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                    SysConstant.SESSION_KEY_LOGIN_STAFF);
            String areaId = sessionStaff.getCurrentAreaId();
            if (areaId != null && areaId.length() > 3) {
                areaId = areaId.substring(0, 3) + "0000";
            }
            provOrderAttrFlag = MySimulateData.getInstance().getParam(
                    (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_DATASOURCE_KEY),
                    SysConstant.PROV_ORDER_ATTR_FLAG + areaId);
            if (StringUtils.isBlank(provOrderAttrFlag)) {
                provOrderAttrFlag = "1";
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (InterfaceException e) {
            e.printStackTrace();
        }
        jsonResponse = super.successed(provOrderAttrFlag, ResultConstant.SUCCESS.getCode());
        return jsonResponse;
    }

    // 短信发送
    @SuppressWarnings("unchecked")
    public Map<String, Object> sendMsg(HttpServletRequest request, String flowNum, String sendterminal,
            String phoneNumber, String cust_so_number) throws Exception {
        Map<String, Object> retnMap = new HashMap<String, Object>();
        //		Map<String, Object> mapSession = (Map<String, Object>) ServletUtils.getSessionAttribute(request, SESSION_KEY_TEMP_LOGIN_STAFF);
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        if (sessionStaff != null) {
            String msg = "尊敬的客户，您好！您已成功预约" + sendterminal + "，预约号为" + cust_so_number + "。" + sendterminal
                    + "终端到货后我们将及时通知您，届时您可携带预约短信或预约单及本人有效证件前往指定营业厅办理，感谢您对中国电信的支持。";
            this.log.debug("短信验证码：{}", msg);
            //			String smsPassFlag = MapUtils.getString(mapSession, "smsPassFlag", "Y");
            // 系统参数表中的是否发送校验短信标识，1不发送不验证， 其他发送并验证
            //			String msgCodeFlag = MySimulateData.getInstance().getParam(SysConstant.MSG_CODE_FLAG);
            //			if (!"1".equals(msgCodeFlag) && !"N".equals(smsPassFlag)) {
            //				SessionStaff sessionStaff = SessionStaff.setStaffInfoFromMap(mapSession);
            Map<String, Object> msgMap = new HashMap<String, Object>();
            msgMap.put("phoneNumber", phoneNumber);
            msgMap.put("key", msg);
            msgMap.put("message", msg);
            msgMap.put("sendflag", "terminal");

            String areaId = sessionStaff.getAreaId();
            if (!"00".equals(areaId.substring(5))) {
                areaId = areaId.substring(0, 5) + "00";
            }
            msgMap.put("areaId", areaId);

            retnMap = staffBmo.sendMsgInfo(msgMap, flowNum, sessionStaff);
            //			}
            request.getSession().removeAttribute(SysConstant.SESSION_KEY_LOGIN_SMS);
            request.getSession().setAttribute(SysConstant.SESSION_KEY_LOGIN_SMS, msg);
            //短信发送时间间隔
            request.getSession().removeAttribute(SysConstant.SESSION_KEY_TEMP_SMS_TIME);
            request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_SMS_TIME, (new Date()).getTime());
        } else {
            this.log.error("错误信息:登录会话失效，请重新登录!");
        }
        return retnMap;
    }

    @RequestMapping(value = "/reserveTerminal", method = { RequestMethod.POST, RequestMethod.GET })
    public String reserveTerminal(Model model) {
        model.addAttribute("terflag", "9");
        Calendar c = Calendar.getInstance();
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
        String startTime = f.format(c.getTime());
        model.addAttribute("p_startDt", startTime);
        return "/order/order-zdyy";
    }

    /*终端预约证件号码限制*/
    @RequestMapping(value = "/checkIdentityCard", method = { RequestMethod.POST, RequestMethod.GET })
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse checkIdentityCard(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = orderBmo.queryyslList(param, null, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                jsonResponse = super.successed(rMap.get("sqlcount"), ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("resultMsg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("证件号码查询失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QUERY_ORDERYSL);
        } catch (Exception e) {
            log.error("门户/order/checkIdentityCard方法异常", e);
            return super.failed(ErrorCode.QUERY_ORDERYSL, e, param);
        }
    }

    @RequestMapping(value = "/queryOrderItemDetailForResale", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse queryOrderItemDetailForResale(@RequestParam Map<String, Object> param, Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        //		param.put("areaId", "8320200");
        //		param.put("objInstId", "700019382849");
        try {
            rMap = orderBmo.queryOrderItemDetailForResale(param, null, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                Map orderListInfo = (Map) rMap.get("result");

                List orderList = (List) orderListInfo.get("list");
                jsonResponse = super.successed(orderList, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.INTF_QUERY_ORDER_RESALE);
        } catch (Exception e) {
            return super.failed(ErrorCode.INTF_QUERY_ORDER_RESALE, e, param);
        }
        return jsonResponse;
    }

    /*
     * 数据抽取，根据订单ID查询订单提交的报文
     */
    @RequestMapping(value = "/queryOrderListInfoByCustomerOrderId", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryOrderListInfoByCustomerOrderId(@RequestBody Map<String, Object> param, Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = orderBmo.queryOrderListInfoByCustomerOrderId(param, null, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                //分段受理,如果受理工号和收费工号不是同一个,不展示"订单取消"按钮
                String oriStaffId = ((Map) ((Map) ((Map) rMap.get("result")).get("orderList")).get("orderListInfo"))
                        .get("staffId")
                        + "";
                int showCancelBtn = 0;
                if (sessionStaff.getStaffId().equals(oriStaffId)) {
                    showCancelBtn = 1;
                }
                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.STEP_ORDER_CANCEL_OPER_FLAG,
                        showCancelBtn);

                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QUERY_ORDER_LIST_INFO_BY_ORDER_ID);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_ORDER_LIST_INFO_BY_ORDER_ID, e, param);
        }
        return jsonResponse;
    }

    /*
     * 资源补录，补充在订单提交时未填写的资源信息（分段受理）
     */
    @RequestMapping(value = "/saveResourceData", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse saveResourceData(@RequestBody Map<String, Object> param, Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        //		param.put("areaId", "8320200");
        //		param.put("objInstId", "700019382849");
        try {
            rMap = orderBmo.saveResourceData(param, null, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.SAVE_RESOURCE_DATA);
        } catch (Exception e) {
            return super.failed(ErrorCode.SAVE_RESOURCE_DATA, e, param);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/gotosubmitStepOrder", method = RequestMethod.POST)
    public String gotosubmitStepOrder(@RequestBody Map<String, Object> param, Model model,
            HttpServletResponse response, HttpServletRequest request) {
        model.addAttribute("resMap", param);
        model.addAttribute("resMapJson", JsonUtil.buildNormal().objectToJson(param));
        return "/cashier/step-order-confirm";
    }

    /**
     * 分段受理--订单还原入口
     * @param param orderParam = {areaId:"",accNbr:"",custId:"",soNbr:"",prodInstId:"",olId:"",channelId:""}
     * @param model
     * @param response
     * @param request
     * @return
     */
    @RequestMapping(value = "/orderReduction", method = RequestMethod.GET)
    public String orderReduction(@RequestParam Map<String, Object> param, Model model, HttpServletResponse response,
            HttpServletRequest request) {
        model.addAttribute("orderParam", JsonUtil.buildNormal().objectToJson(param));
        log.debug("orderReduction.param={}", param);
        
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);

        try {
        	//从会话中获取缓存的订单数据(购物车ID和订单类型),对于能力开放和界面集成的单子限制其在集团CRM进行受理
            Map<String, Object> orderListsInfo = (Map<String, Object>) ServletUtils.getSessionAttribute(super.getRequest(), "orderListsInfo");
            Map<String, Object> reductionOrderLists = (Map<String, Object>) orderListsInfo.get("reductionOrderLists");
            String olId = param.get("olId").toString();
            if(reductionOrderLists.containsKey(olId)){//客户端请求中的olId在会话中存在
            	String olTypeCd = reductionOrderLists.get(olId).toString();//订单类型
            	if("8".equals(olTypeCd)){//界面集成订单(前台UI暂存订单)
        			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, param, null, new Throwable("订单号["+olId+"]为界面集成订单(UI暂存订单)，不可以在集团CRM进行受理，请不要非法操作."));
            	} else if("9".equals(olTypeCd)){//能力开放订单(API接口暂存订单)
        			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, param, null, new Throwable("订单号["+olId+"]为能力开放订单(API接口暂存订单)，不可以在集团CRM进行受理，请不要非法操作."));
            	}
            } else{//会话中不存在客户端请求中的olId，可能有非正常请求，例如前端js的限制被篡改
    			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, param, null, new Throwable("订单号["+olId+"]数据异常，当前会话中不存在该订单号，请刷新页面再尝试."));
            }
            
            //分段受理暂存单“还原”时，门户后端判断，如果没有“收银台查询权限”，获取该订单对应的渠道id，如果不在该工号已分配的渠道范围内，则不能还原，并提示异常。
        	String qryChannelAuth = (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.CASHIER_CHANNEL_QUERY+"_"+sessionStaff.getStaffId());;
        	if(!"0".equals(qryChannelAuth)){
        		boolean invalidChannel = true;
        		String channelId = (String) param.get("channelId");
        		if(channelId == null || channelId.trim().length() == 0){
        			//后台查询购物车详情接口，没有在orderListInfo中返回channelId，取订单项orderLists中的首个节点channelId，如果没有订单项，则为空；此验证方式待改造，不应从前端获取channelId
	        		Map<String, Object> paramMap = new HashMap<String, Object>();
	        		paramMap.put("areaId", param.get("areaId"));
	        		paramMap.put("olId", param.get("olId"));
	        		Map cartInfo = cartBmo.queryCartOrder(paramMap, null, sessionStaff);
	        		if(cartInfo != null && cartInfo.get("orderLists") != null){
	        			channelId = (String)(((Map)(((List)(((Map)(((List)(cartInfo.get("orderLists"))).get(0))).get("list"))).get(0))).get("channelId"));
	        		}
        		}
        		if(channelId == null || channelId.trim().length() == 0){
        			invalidChannel = true;
        		} else {
        			List<Map> channelList = (List<Map>)request.getSession().getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL);
        			for(Map channelRow : channelList){
        				String id = MapUtils.getString(channelRow, "id", "");
        				if(id.equals(channelId)){
        					invalidChannel = false;
        					break;
        				}
        			}
        		}
        		if(invalidChannel){
        			throw new BusinessException(ErrorCode.CUST_ORDER, param, null, new Throwable("分段受理暂存单还原异常，未分配收银台查询权限，不能受理未分配的渠道订单"));
        		}
        	}
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.CUST_ORDER_DETAIL);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.CUST_ORDER_DETAIL, e, param);
        }
        
        return "/cashier/step-order-main";
    }

    /**
     * 获取暂存权限
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/getCheckOperatSpec", method = { RequestMethod.POST, RequestMethod.GET })
    public @ResponseBody
    String checkOperatSpec(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response, HttpServletRequest request) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String isAddOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.FDSL + "_"
                + sessionStaff.getStaffId());
        try {
            if (isAddOperation == null) {
                isAddOperation = staffBmo.checkOperatSpec(SysConstant.FDSL, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(),
                        SysConstant.FDSL + "_" + sessionStaff.getStaffId(), isAddOperation);
            }
        } catch (BusinessException e) {
            isAddOperation = "1";
        } catch (InterfaceException ie) {
            isAddOperation = "1";
        } catch (Exception e) {
            isAddOperation = "1";
        }
        return isAddOperation;
    }

    /**
     * 一卡双号展示
     */
    @RequestMapping(value = "/cardNumberOrder", method = { RequestMethod.POST })
    public String cardNumberOrder(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        if (!MapUtils.isEmpty(param)) {
            //添加一些属性
            param.put("offerNum", 1);
            Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
            model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
            model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
            param.put("boActionTypeName", "一卡双号订购");
            model.addAttribute("main", param);
        }
        return "/order/order-card-number";
    }

    /**
     * 一卡双号校验单接口
     */
    @RequestMapping(value = "/queryAccNbrList", method = { RequestMethod.POST })
    public String queryAccNbrList(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String extCustOrderId = UIDGenerator.getRand();
        param.put("extCustOrderId", extCustOrderId);
        param.put("soChannelId", sessionStaff.getCurrentChannelId());
        param.put("staffId", sessionStaff.getStaffId());
        try {
            Map<String, Object> resMap = orderBmo.queryAccNbrList(param, null, sessionStaff);
            ArrayList accNbrList = new ArrayList();
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                ArrayList dataList = (ArrayList) resMap.get("data");
                Map<String, Object> accNbrMap = (Map<String, Object>) dataList.get(0);
                accNbrList = (ArrayList) accNbrMap.get("accNbrList");
            }
            model.addAttribute("resMap", resMap);
            model.addAttribute("param", param);
            model.addAttribute("accNbrList", accNbrList);
            return "/order/order-cardnbr-list";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.QUERY_CARDNBLIST);
        } catch (Exception e) {
            log.error("一卡双号校验单接口/order/queryAccNbrList方法异常", e);
            return super.failedStr(model, ErrorCode.QUERY_CARDNBLIST, e, param);
        }
    }

    /**
     * 一卡双号订购退订正式单接口
     */
    @RequestMapping(value = "/exchangeAccNbr", method = { RequestMethod.POST })
    public String exchangeAccNbr(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        param.put("soChannelId", sessionStaff.getCurrentChannelId());
        param.put("staffId", sessionStaff.getStaffId());
        if(param.get("pageType")!=null && param.get("pageType").equals("unOrderVirtualAccNber")){
        	String extCustOrderId = UIDGenerator.getRand();
            param.put("extCustOrderId", extCustOrderId);
        }
        try {
            Map<String, Object> resMap = orderBmo.exchangeAccNbr(param, null, sessionStaff);
            model.addAttribute("param", param);
            model.addAttribute("resMap", resMap);
            return "/order/order-cardnbr-confirm";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.EXCHANGE_ACCNBR);
        } catch (Exception e) {
            log.error("一卡双号正式单接口方法异常", e);
            return super.failedStr(model, ErrorCode.EXCHANGE_ACCNBR, e, param);
        }
    }

    /**
     * 一卡双号退订查询虚号接口
     */
    @RequestMapping(value = "/queryVirtualInfo", method = { RequestMethod.POST })
    public String queryVirtualInfo(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String extCustOrderId = UIDGenerator.getRand();
        param.put("extCustOrderId", extCustOrderId);
        try {
            Map<String, Object> resMap = orderBmo.queryVirtualInfo(param, null, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                ArrayList dataList = (ArrayList) resMap.get("data");
                Map<String, Object> accNbrMap = (Map<String, Object>) dataList.get(0);
                model.addAttribute("accNbrMap", accNbrMap);
            }
            model.addAttribute("resMap", resMap);
            model.addAttribute("param", param);
            return "/orderUndo/order-undo-cardnbr";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.QUERY_VIRTUALINFO);
        } catch (Exception e) {
            log.error("一卡双号退订查虚号方法异常", e);
            return super.failedStr(model, ErrorCode.QUERY_VIRTUALINFO, e, param);
        }
    }

    /**
     * 查询产品实例属性
     * @param resquestMap : {
     * prodId : "", //产品实例id
     * acctNbr : "", //接入号
     * prodSpecId : "", //产品规格id
     * areaId : "" //地区id
     * }
     */
    @RequestMapping(value = "/prodInstParam", method = { RequestMethod.POST })
    public @ResponseBody
    JsonResponse prodInstParam(@RequestBody Map<String, Object> resquestMap, Model model, HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse = null;
        Map responseMap = null;
        try {
            responseMap = orderBmo.prodInstParam(resquestMap, null, sessionStaff);
            if (responseMap != null && ResultCode.R_SUCC.equals(responseMap.get("resultCode"))) {
                jsonResponse = super.successed(responseMap, ResultConstant.SUCCESS.getCode());
            } else {
                throw new InterfaceException(ErrType.CATCH, PortalServiceCode.PRODUCT_PARAM_QUERY, String
                        .valueOf(responseMap.get("resultMsg")), JsonUtil.toString(resquestMap));
            }
        } catch (BusinessException be) {
            this.log.error("查询产品实例属性", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, resquestMap, ErrorCode.ORDER_PROD_INST);
        } catch (Exception e) {
            log.error("查询产品实例属性", e);
            return super.failed(ErrorCode.ORDER_PROD_INST, e, resquestMap);
        }
        return jsonResponse;
    }

    /**
     * 从缓存里面获取标识
     */
    @RequestMapping(value = "/getSimulateData", method = { RequestMethod.GET })
    @ResponseBody
    public JsonResponse getSimulateData(@RequestParam Map<String, Object> resquestMap, Model model,
            HttpServletRequest request, HttpServletResponse response) {
        String code = (String) resquestMap.get("code");
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse = null;
        try {
            String param = MySimulateData.getInstance().getParam(
                    (String) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_DATASOURCE_KEY),
                    code);
            jsonResponse = super.successed(param, ResultConstant.SUCCESS.getCode());
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (InterfaceException e) {
            e.printStackTrace();
        }
        return jsonResponse;
    }

    /**
     * 终端预约记录列表查询
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/queryCouponReserve", method = RequestMethod.GET)
    public String list(HttpSession session, Model model, WebRequest request) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer curPage = 1;
        Integer pageSize = 10;
        Integer totalSize = 0;

        String reserveCode = request.getParameter("reserveCode") == null ? "" : request.getParameter("reserveCode")
                .toString();
        String identityNum = request.getParameter("identityNum") == null ? "" : request.getParameter("identityNum")
                .toString();
        param.put("areaId", request.getParameter("areaId"));
        param.put("channelId", request.getParameter("channelId"));
        param.put("reserveCode", reserveCode);
        param.put("identityCd", request.getParameter("identityCd") == null ? "" : request.getParameter("identityCd"));
        param.put("identityNum", identityNum);
        try {
            curPage = Integer.parseInt(request.getParameter("curPage").toString());
            pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
            param.put("curPage", curPage);
            param.put("pageSize", pageSize);

            Map<String, Object> map = orderBmo.queryCouponReserve(param, null, sessionStaff);
            if (map.get("custInfos") != null) {
                model.addAttribute("custInfos", map.get("custInfos"));
            }
            if (map != null && map.get("orderListInfo") != null) {
                list = (List<Map<String, Object>>) map.get("orderListInfo");
                totalSize = MapUtils.getInteger(map, "totalCnt", 1);
            }
            PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(curPage, pageSize, totalSize < 1 ? 1
                    : totalSize, list);
            model.addAttribute("pageModel", pm);
            model.addAttribute("code", map.get("code"));
            model.addAttribute("mess", map.get("mess"));
            model.addAttribute("pageType", request.getParameter("pageType")); //link:环节显示 detail:详情显示

            String refundFlag = request.getParameter("refundFlag");
            return "/orderQuery/coupon-zdyylist";
        } catch (BusinessException be) {

            return super.failedStr(model, be);
        } catch (InterfaceException ie) {

            return super.failedStr(model, ie, param, ErrorCode.QUERY_COUPON_RESERVE);
        } catch (Exception e) {
            log.error("终端预约记录查询/order/queryCouponReserve方法异常", e);
            return super.failedStr(model, ErrorCode.QUERY_COUPON_RESERVE, e, param);
        }
    }

    /**
     * 以旧换新页面入口
     */
    @RequestMapping(value = "/toOldChangeNewPage", method = { RequestMethod.GET })
    public String toOldChangeNewPage(@RequestParam Map<String, Object> resquestMap, Model model,
            HttpServletResponse response) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        try {
            model.addAttribute("param", resquestMap);
            resquestMap.put("attrId", SysConstant.SPEC_ID_COUPON_CONFIG);
            Map<String, Object> resMap = orderBmo.queryCouponAttrValue(resquestMap, null, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                List dataList = (List) resMap.get("result");
                model.addAttribute("configInfos", dataList);
            }
            return "/oldToNew/oldToNew";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, resquestMap, ErrorCode.QUERY_COUPON_ATTR_VALUE);
        } catch (Exception e) {
            log.error("以旧换新, 查询配置数据异常", e);
            return super.failedStr(model, ErrorCode.QUERY_COUPON_ATTR_VALUE, e, resquestMap);
        }
    }

    /**
     * 以旧换新回购价格查询
     */
    @RequestMapping(value = "/queryOldCouponDiscountPrice", method = { RequestMethod.POST })
    public @ResponseBody
    JsonResponse queryOldCouponDiscountPrice(@RequestBody Map<String, Object> resquestMap, Model model,
            HttpServletRequest request, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse = null;
        Map responseMap = null;
        try {
            responseMap = orderBmo.queryOldCouponDiscountPriceByAttrs(resquestMap, null, sessionStaff);
            if (responseMap != null && ResultCode.R_SUCC.equals(responseMap.get("resultCode"))) {
                jsonResponse = super.successed(responseMap, ResultConstant.SUCCESS.getCode());
            } else {
                throw new InterfaceException(ErrType.PORTAL, PortalServiceCode.QUERY_OLD_COUPON_DISCOUNT_PRICE, String
                        .valueOf(responseMap.get("resultMsg")), JsonUtil.toString(resquestMap));
            }
        } catch (BusinessException be) {
            this.log.error("以旧换新回购价格查询", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, resquestMap, ErrorCode.QUERY_OLD_COUPON_DISCOUNT_PRICE);
        } catch (Exception e) {
            log.error("以旧换新回购价格查询", e);
            return super.failed(ErrorCode.QUERY_OLD_COUPON_DISCOUNT_PRICE, e, resquestMap);
        }
        return jsonResponse;
    }

    /**
     * 以旧换新旧串码校验（是否可以办理以旧换新）
     */
    @RequestMapping(value = "/checkNewOldCoupon", method = { RequestMethod.POST })
    public @ResponseBody
    JsonResponse checkNewOldCoupon(@RequestBody Map<String, Object> resquestMap, Model model,
            HttpServletRequest request, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse = null;
        Map responseMap = null;
        try {
            responseMap = orderBmo.checkNewOldCouponRel(resquestMap, null, sessionStaff);
            if (responseMap != null && ResultCode.R_SUCC.equals(responseMap.get("resultCode"))) {
                jsonResponse = super.successed(responseMap, ResultConstant.SUCCESS.getCode());
            } else {
                throw new InterfaceException(ErrType.PORTAL, PortalServiceCode.CHECK_NEW_OLD_COUPON_REL, String
                        .valueOf(responseMap.get("resultMsg")), JsonUtil.toString(resquestMap));
            }
        } catch (BusinessException be) {
            this.log.error("以旧换新旧串码校验（是否可以办理以旧换新）", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, resquestMap, ErrorCode.CHECK_NEW_OLD_COUPON_REL);
        } catch (Exception e) {
            log.error("以旧换新旧串码校验（是否可以办理以旧换新）", e);
            return super.failed(ErrorCode.CHECK_NEW_OLD_COUPON_REL, e, resquestMap);
        }
        return jsonResponse;
    }

    /**
     * 以旧换新旧新旧串码关系保存
     */
    @RequestMapping(value = "/saveNewOldCouponInfos", method = { RequestMethod.POST })
    public @ResponseBody
    JsonResponse saveNewOldCouponInfos(@RequestBody Map<String, Object> resquestMap, Model model,
            HttpServletRequest request, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        JsonResponse jsonResponse = null;
        Map responseMap = null;
        try {
            Map orderListInfo = (Map) resquestMap.get("orderListInfo");
            orderListInfo.put("staffId", sessionStaff.getStaffId());
            orderListInfo.put("areaId", sessionStaff.getCurrentAreaId());
            orderListInfo.put("channelId", sessionStaff.getCurrentChannelId());

            responseMap = orderBmo.saveNewOldCouponRelInfo(resquestMap, null, sessionStaff);
            if (responseMap != null && ResultCode.R_SUCC.equals(responseMap.get("resultCode"))) {
                Map result = (Map) responseMap.get("result");
                result.put("areaId", sessionStaff.getCurrentAreaId());
                jsonResponse = super.successed(responseMap, ResultConstant.SUCCESS.getCode());
            } else {
                throw new InterfaceException(ErrType.PORTAL, PortalServiceCode.SAVE_NEW_OLD_COUPON_RELINFO, String
                        .valueOf(responseMap.get("resultMsg")), JsonUtil.toString(resquestMap));
            }
        } catch (BusinessException be) {
            this.log.error("以旧换新旧新旧串码关系保存", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, resquestMap, ErrorCode.SAVE_NEW_OLD_COUPON_RELINFO);
        } catch (Exception e) {
            log.error("以旧换新旧新旧串码关系保存", e);
            return super.failed(ErrorCode.SAVE_NEW_OLD_COUPON_RELINFO, e, resquestMap);
        }
        return jsonResponse;
    }

    //收费界面保存暂存单
    @RequestMapping(value = "/saveOrderAttrs", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse saveOrderAttrs(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = orderBmo.saveOrderAttrs(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
            	//暂存成功清空session中的虚拟购物车ID(virOlId)
            	ServletUtils.removeSessionAttribute(super.getRequest(), Const.SESSION_UPLOAD_VIR_OLID);
                jsonResponse = super.successed("", ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.SAVE_ORDER_ATTRS);
        } catch (Exception e) {
            return super.failed(ErrorCode.SAVE_ORDER_ATTRS, e, param);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/queryCustAndProd", method = RequestMethod.GET)
    public String queryCustAndProd(@RequestParam Map<String, Object> params, @LogOperatorAnn String flowNum,
            HttpServletRequest request, Model model, HttpSession session) throws AuthorityException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String areaId = "";
        String custId = "";
        String provIsale = "";
        String redirectUri = "";
        String isFee = "";
        boolean querycustflag = false;
        try {
            if ("1".equals(params.get("busitypeflag").toString())) {
                return "/orderUndo/order-search-reload";
            }
            //客户定位
            Map custparamMap = new HashMap();
            custparamMap.put("acctNbr", params.get("acctNbr").toString());
            custparamMap.put("areaId", params.get("areaId").toString());
            custparamMap.put("diffPlace", "local");
            custparamMap.put("identityCd", "");
            custparamMap.put("identityNum", "");
            custparamMap.put("partyName", "");
            custparamMap.put("queryType", "");
            custparamMap.put("queryTypeValue", "");
            custparamMap.put("staffId", sessionStaff.getStaffId());
            Map resultMap = custBmo.queryCustInfo(custparamMap, flowNum, sessionStaff);
            List custInfos = new ArrayList();
            if (MapUtils.isNotEmpty(resultMap)) {
                custInfos = (List<Map<String, Object>>) resultMap.get("custInfos");
                if (!custparamMap.get("queryTypeValue").equals("") && !custparamMap.get("queryType").equals("")) {
                    sessionStaff.setCardNumber(String.valueOf(custparamMap.get("queryTypeValue")));
                    sessionStaff.setCardType(String.valueOf(custparamMap.get("queryType")));
                } else if (!custparamMap.get("identityNum").equals("") && !custparamMap.get("identityCd").equals("")) {
                    sessionStaff.setCardNumber(String.valueOf(custparamMap.get("identityNum")));
                    sessionStaff.setCardType(String.valueOf(custparamMap.get("identityCd")));
                }
                sessionStaff.setInPhoneNum(String.valueOf(custparamMap.get("acctNbr")));
                if (custInfos.size() > 0) {
                    Map custInfo = (Map) custInfos.get(0);
                    String idCardNumber = (String) custInfo.get("idCardNumber");
                    sessionStaff.setCustId(String.valueOf(custInfo.get("custId")));
                    sessionStaff.setCardNumber(idCardNumber);
                    sessionStaff.setCardType(String.valueOf(custInfo.get("identityCd")));
                    sessionStaff.setPartyName(String.valueOf(custInfo.get("partyName")));
                    if (idCardNumber != null && idCardNumber.length() == 18) {
                        String preStr = idCardNumber.substring(0, 6);
                        String subStr = idCardNumber.substring(14);
                        idCardNumber = preStr + "********" + subStr;
                    } else if (idCardNumber != null && idCardNumber.length() == 15) {
                        String preStr = idCardNumber.substring(0, 5);
                        String subStr = idCardNumber.substring(13);
                        idCardNumber = preStr + "********" + subStr;
                    }
                    areaId = (String) custInfo.get("areaId");
                    custId = String.valueOf(custInfo.get("custId"));
                    querycustflag = true;
                    model.addAttribute("addressStr", (String) custInfo.get("idCardNumber"));
                    model.addAttribute("areaId", (String) custInfo.get("areaId"));
                    model.addAttribute("areaName", (String) custInfo.get("areaName"));
                    model.addAttribute("custFlag", (String) custInfo.get("custFlag"));
                    model.addAttribute("custId", String.valueOf(custInfo.get("custId")));
                    model.addAttribute("idCardNumber", idCardNumber);
                    model.addAttribute("identityCd", (String) custInfo.get("identityCd"));
                    model.addAttribute("identityName", (String) custInfo.get("identityName"));
                    model.addAttribute("norTaxPayer", (String) custInfo.get("norTaxPayer"));
                    model.addAttribute("partyName", (String) custInfo.get("partyName"));
                    model.addAttribute("segmentId", (String) custInfo.get("segmentId"));
                    model.addAttribute("segmentName", (String) custInfo.get("segmentName"));
                    model.addAttribute("vipLevel", (String) custInfo.get("vipLevel"));
                    model.addAttribute("vipLevelName", (String) custInfo.get("vipLevelName"));
                    model.addAttribute("querycustflag", "0");
                } else {
                    model.addAttribute("querycustflag", "1");
                }
            } else {
                model.addAttribute("querycustflag", "1");
            }
        } catch (Exception e) {
            model.addAttribute("querycustflag", "-1");
            log.error("客户资料查询异常:", e);
        }
        //查询已订购
        if (querycustflag && !"1".equals(params.get("busitypeflag").toString())) {
            try {
                Map orderparamMap = new HashMap();
                orderparamMap.put("acctNbr", params.get("acctNbr").toString());
                orderparamMap.put("areaId", areaId);
                orderparamMap.put("curPage", "1");
                orderparamMap.put("custId", custId);
                orderparamMap.put("pageSize", "5");
                Map<String, Object> datamap = this.custBmo.queryCustProd(orderparamMap, flowNum, sessionStaff);
                String code = (String) datamap.get("resultCode");
                if (ResultCode.R_SUCC.equals(code)) {
                    Map<String, Object> temMap = (Map) datamap.get("result");
                    List<Map<String, Object>> list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
                    if (list == null) {
                        model.addAttribute("queryorderflag", "1");
                    } else {
                        model.addAttribute("queryorderflag", "0");
                        Map ordermap = list.get(0);
                        Map feeType = (Map) ordermap.get("feeType");
                        List prodStopRecords = (List) ordermap.get("prodStopRecords");
                        Map prodStopRecordsmap = (Map) prodStopRecords.get(0);
                        List mainProdOfferInstInfos = (List) ordermap.get("mainProdOfferInstInfos");
                        Map mainProdOfferInstInfosmap = (Map) mainProdOfferInstInfos.get(0);
                        model.addAttribute("accNbr", ordermap.get("accNbr").toString());
                        model.addAttribute("productName", ordermap.get("productName").toString());
                        model.addAttribute("prodStateName", ordermap.get("prodStateName").toString());
                        model.addAttribute("feeTypeName", feeType.get("feeTypeName"));
                        model.addAttribute("prodInstId", ordermap.get("prodInstId").toString());
                        model.addAttribute("extProdInstId", ordermap.get("extProdInstId").toString());
                        model.addAttribute("corProdInstId", ordermap.get("corProdInstId").toString());
                        model.addAttribute("prodStateCd", ordermap.get("prodStateCd").toString());
                        model.addAttribute("productId", ordermap.get("productId").toString());
                        model.addAttribute("feeType", feeType.get("feeType").toString());
                        model.addAttribute("prodClass", ordermap.get("prodClass").toString());
                        model.addAttribute("stopRecordCd", prodStopRecordsmap.get("stopRecordCd").toString());
                        model.addAttribute("stopRecordName", prodStopRecordsmap.get("stopRecordName").toString());
                        model.addAttribute("prodOfferName", mainProdOfferInstInfosmap.get("prodOfferName").toString());
                        model.addAttribute("custName", mainProdOfferInstInfosmap.get("custName").toString());
                        model.addAttribute("startDt", mainProdOfferInstInfosmap.get("startDt").toString());
                        model.addAttribute("endDt", mainProdOfferInstInfosmap.get("endDt").toString());
                        model.addAttribute("prodOfferId", mainProdOfferInstInfosmap.get("prodOfferId").toString());
                        model.addAttribute("prodOfferInstId", mainProdOfferInstInfosmap.get("prodOfferInstId")
                                .toString());
                        model.addAttribute("custId", mainProdOfferInstInfosmap.get("custId").toString());
                        model.addAttribute("is3G", mainProdOfferInstInfosmap.get("is3G").toString());
                        model.addAttribute("zoneNumber", ordermap.get("zoneNumber").toString());
                        model.addAttribute("areaId", ordermap.get("areaId").toString());
                    }
                } else {
                    model.addAttribute("queryorderflag", "1");
                }
            } catch (BusinessException be) {
                model.addAttribute("queryorderflag", "-1");
                model.addAttribute("errMsg", be.getError().getErrMsg());
            } catch (InterfaceException ie) {
                model.addAttribute("queryorderflag", "-1");
                model.addAttribute("errMsg", ie.getMsg());
            } catch (Exception e) {
                model.addAttribute("queryorderflag", "-1");
                model.addAttribute("errMsg", ErrorCode.ORDER_PROD.getErrMsg());
            }
        }
        String url = "";
        if ("3".equals(params.get("busitypeflag").toString())) {
            url = "/orderUndo/member-change";
        } else if ("14".equals(params.get("busitypeflag").toString())) {
            url = "/orderUndo/order-cust";
        } else if ("2".equals(params.get("busitypeflag").toString())) {
            url = "/orderUndo/order-offer-main";
        }
        return url;
    }

    @RequestMapping(value = "/queryOrderBusiHint", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryOrderBusiHint(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            log.debug("param={}", JsonUtil.toString(param));
            param.put("areaId", sessionStaff.getCurrentAreaId());
            rMap = orderBmo.queryOrderBusiHint(param, flowNum, sessionStaff);
            log.debug("return={}", JsonUtil.toString(rMap));
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("msg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.CHECK_RULETOPRO);
        } catch (Exception e) {
            return super.failed(ErrorCode.CHECK_RULETOPRO, e, param);
        }
        return jsonResponse;
    }

    @ResponseBody
    @AuthorityValid(isCheck = false)
    @RequestMapping(value = "/certInfo", method = RequestMethod.POST)
    public JsonResponse cacheCertInfo(@RequestBody Map<String, Object> param,
            HttpServletRequest request) {
    	JsonResponse jsonResponse = null;
		try {
			String venderId = MapUtils.getString(param, "venderId");// 厂商标识
			String signature = MapUtils.getString(param, "signature");// 数字签名
			String versionSerial = MapUtils.getString(param, "versionSerial");// 版本号
			String partyName = MapUtils.getString(param, "partyName");// 姓名
			String gender = MapUtils.getString(param, "gender");// 性别
			String nation = MapUtils.getString(param, "nation");// 民族
			String bornDay = MapUtils.getString(param, "bornDay");// 出生日期
			String certAddress = MapUtils.getString(param, "certAddress");// 地址
			String certNumber = MapUtils.getString(param, "certNumber");// 身份证号码
			String certOrg = MapUtils.getString(param, "certOrg");// 签发机关
			String effDate = MapUtils.getString(param, "effDate");// 起始有效期
			String expDate = MapUtils.getString(param, "expDate");// 终止有效期
			String identityPic = MapUtils.getString(param, "identityPic");// 照片
            if (StringUtils.isBlank(partyName) || StringUtils.isBlank(gender)
                || StringUtils.isBlank(nation) || StringUtils.isBlank(bornDay)
                || StringUtils.isBlank(certNumber) || StringUtils.isBlank(certAddress)
                || StringUtils.isBlank(certOrg) || StringUtils.isBlank(effDate)
                || StringUtils.isBlank(expDate)){
                return super.failed("读卡失败信息有误", -1);
            }
            String createFlag = MapUtils.getString(param, "createFlag");
            
//			param.put("venderId", "11");
//			param.put("signature", "11");
//			param.put("versionSerial", "11");
//			param.put("partyName", "11");
//			param.put("gender", "11");
//			param.put("nation", "11");
//			param.put("bornDay", "11");
//			param.put("certAddress", "11");
//			param.put("certNumber", "11");
//			param.put("certOrg", "11");
//			param.put("effDate", "11");
//			param.put("expDate", "11");
//			param.put("identityPic", "11");
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                    SysConstant.SESSION_KEY_LOGIN_STAFF);
            Map<String, Object> rMap = null;
            param.put("readCertFlag", "readCert");
            try {
                 orderBmo.insertCertInfo(param, null, sessionStaff);
            } catch (BusinessException e) {
               // return super.failed(e);
            } catch (InterfaceException ie) {
               // return super.failed(ie, param, ErrorCode.INSERT_CARD_INFO);
            } catch (Exception e) {
               // return super.failed(ErrorCode.INSERT_CARD_INFO, e, param);
            }
            
           if(!StringUtils.isBlank(venderId)){
            	if(MDA.USBVERSION_SIGNATURE.get(venderId)==null){
            		return super.failed("身份证阅读器设备未在集约CRM系统授权范围内，不允许接入", -1);
            	}
            	if(MDA.USBVERSION_SIGNATURE.get(venderId).get("isOpen").equals("ON")){//启用新规范控件校验
	    			String mdaVersion = MDA.USBVERSION_SIGNATURE.get(venderId).get("version");
	            	if(StringUtils.isBlank(signature)||StringUtils.isBlank(versionSerial)){
		        		 return super.failed("读卡失败信息有误", -1);
		        	}
		            if(versionSerial.equals(mdaVersion)){//校验版本号
		            	String appSecret=MDA.USBVERSION_SIGNATURE.get(venderId).get("appSecret");
		            	String ss=partyName+gender+nation+bornDay+certAddress+certNumber+certOrg+effDate+expDate+identityPic+appSecret;
		            	String sha1Str=DigestUtils.sha1ToHex(ss);
		            	if(!signature.equals(sha1Str)){
		            		jsonResponse = super.failed("证件信息被篡改", -2);//信息被篡改
		            		return jsonResponse;
		            	}
		            }else{
		            	param.put("signature", "");
		            	Set<String> s = param.keySet();//获取KEY集合
		            	for (String str : s) {
		            		if(param.get(str)instanceof String){
		            			param.put(str,"");
		            		}else{
		            			param.put(str,0);
		            		}
		            	}
		            	String fileUrl="FTPSERVICECONFIG"+","+venderId+"_"+mdaVersion+".exe"+","+MDA.CARD_FILEPATH;
		            	param.put("fileUrl", fileUrl);
		            	param.put("fileName", MDA.USBVERSION_SIGNATURE.get(venderId).get("name")+".exe");
		            	jsonResponse = super.failed(param, -3);//版本有误
		            	return jsonResponse;
		            }
            	}
            	else{
            		return super.failed("身份证阅读器设备未在集约CRM系统授权范围内，不允许接入", -1);
            	}
            }
            String appSecret1 = propertiesUtils.getMessage("APP_SECRET"); //appId对应的加密密钥
            String nonce = RandomStringUtils.randomAlphanumeric(Const.RANDOM_STRING_LENGTH); //随机字符串
            String signature1 = commonBmo.signature(partyName, certNumber, certAddress, identityPic, nonce, appSecret1);
            param.put("signature", signature1);
            if("1".equals(createFlag)){
            	request.getSession().removeAttribute(Const.SESSION_SIGNATURE);
                request.getSession().setAttribute(Const.SESSION_SIGNATURE, signature1);
            } else if("Y".equals(MapUtils.getString(param, "jbrFlag"))){
            	//经办人跟随主卡，即使加装副卡，一个单子只有一个经办人
            	request.getSession().removeAttribute(Const.SESSION_SIGNATURE_HANDLE_CUST);
            	request.getSession().setAttribute(Const.SESSION_SIGNATURE_HANDLE_CUST, signature1);
            }
            
            request.getSession().setAttribute(Const.CACHE_CERTINFO, certNumber);
    		jsonResponse = super.successed(param, ResultConstant.SUCCESS.getCode());//信息校验通过
            return jsonResponse;
        } catch (Exception e) {
            return super.failed("读卡失败信息异常", -1);
        }
    }
    @ResponseBody
    @AuthorityValid(isCheck = false)
    @RequestMapping(value = "/isOpenNewCert", method = RequestMethod.POST)
    public JsonResponse isOpenNewCert(@RequestBody Map<String, Object> param,
            HttpServletRequest request) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);
    	JsonResponse jsonResponse = null;
		try {
			Long areaId = Long.valueOf(StringUtils.substring(sessionStaff.getCurrentAreaId(), 0, 3)+ "0000");
			String isopen = MDA.USBSIGNATURE.get("SIGNATURE_"+areaId);
			jsonResponse = super.successed(isopen, ResultConstant.SUCCESS.getCode());//信息校验通过
            return jsonResponse;
        } catch (Exception e) {
            return super.failed("读取身份证省份配置开关失败", -1);
        }
    }
	@RequestMapping(value = "/downloadOCX", method = {RequestMethod.POST})
	public void downloadFile(@RequestParam("fileUrl") String fileUrl, 
			@RequestParam("fileName") String fileName,
			HttpServletResponse response) throws IOException {		
		ServletOutputStream  outputStream = response.getOutputStream();
		try {
			FtpUtils ftpUtils = new FtpUtils();
//			String fileUrl = (String) param.get("fileUrl");
//			String fileName = (String) param.get("fileName");
			String[] fileUrls = fileUrl.split(",");
			String ftpMapping = fileUrls[0];
			String newFileName = fileUrls[1];
			String filePath = fileUrls[2];
			
			//2.获取FTP服务器的具体登录信息
			//3.根据服务器映射获取对应的FTP服务器配置信息
			PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
			String ftpServiceConfig = propertiesUtils.getMessage(ftpMapping);
			String[] ftpServiceConfigs = ftpServiceConfig.split(",");
			String remoteAddress = ftpServiceConfigs[0];//FTP服务器地址(IP)
			String remotePort = ftpServiceConfigs[1];//FTP服务器端口
			String userName = ftpServiceConfigs[2];//FTP服务器用户名
			String password = ftpServiceConfigs[3];//FTP服务器密码
			response.setContentType("application/x-msdownload;");
			response.addHeader("Content-Disposition", "attachment;filename="+new String(fileName.getBytes("gb2312"), "ISO8859-1"));
			ftpUtils.connectFTPServer(remoteAddress,remotePort,userName,password);
			boolean isFileExist = ftpUtils.isFileExist(newFileName,filePath);
			if(isFileExist){
				ftpUtils.changeWorkingDirectory(filePath);
				boolean gg=ftpUtils.downloadFileByPath(newFileName, outputStream);
			}
		}catch (Exception e) {
			e.printStackTrace();
		}finally {
			if (outputStream != null){
				outputStream.close();
			}
		}	
	}
	
	@RequestMapping(value = "/reducePoingts", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse reducePoingts(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response, HttpServletRequest request) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        String acctItemId = (String) param.get("acctItemId");
        String state = (String) param.get("state");
        String orderNbr = (String) param.get("orderNbr");
        if(orderNbr !=null && orderNbr.length()<12){
        	orderNbr = "0"+orderNbr;
        }else if(orderNbr !=null && orderNbr.length()>12){
        	orderNbr = orderNbr.substring(orderNbr.length()-12, orderNbr.length());
        }
        Calendar c = Calendar.getInstance();
        SimpleDateFormat f = new SimpleDateFormat("yyyyMMddHHmmss");
        String dealTime = f.format(c.getTime());
        //生成省份需要的格式orderNbr由门户传，28位  10位平台编码（1000000200）+6位日期（160302）+加2位序号（01,02,03）+购物车流水（20位）后10位
        orderNbr = "1000000200" + dealTime.substring(2, 8)+orderNbr;
        param.put("orderNbr",orderNbr);
        HttpSession session = request.getSession();
        //首先判断可有积分扣减的权益
        String bhk = (String) session.getAttribute(SysConstant.INTEREST_BHK+sessionStaff.getCardNumber());
		String gm = (String) session.getAttribute(SysConstant.INTEREST_GM+sessionStaff.getCardNumber());
		String jjkj = (String) session.getAttribute(SysConstant.INTEREST_JJKJ+sessionStaff.getCardNumber());
		String jfgj = (String) session.getAttribute(SysConstant.JFKJCG+"_"+acctItemId+sessionStaff.getInPhoneNum());
		if("ADD".equals(state)){
			if(!"Y".equals(jfgj)){
				jsonResponse = super.failed("非法请求", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				return jsonResponse;
			}
			param.put("orderNbr", session.getAttribute(SysConstant.JFKJCG+"_oldNbr"+acctItemId+sessionStaff.getInPhoneNum()));//替换入参
		}else{
			if("100300".equals(acctItemId)){//免费换卡
				if(!"true".equals(bhk)){
					jsonResponse = super.failed("非法请求", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
					return jsonResponse;
				}	
				
			}else if("100600".equals(acctItemId)){//紧急开机
				if(!"true".equals(jjkj)){
					jsonResponse = super.failed("非法请求", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
					return jsonResponse;
				}
			}else if("100800".equals(acctItemId)){//国漫
				if(!"true".equals(gm)){
					jsonResponse = super.failed("非法请求", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
					return jsonResponse;
				}
			}
		}
        try {
        	String areaId = (String) session.getAttribute("pointareaId");
    		if(!"".equals(areaId) && areaId !=null){
    			param.put("areaId",areaId);
    		}
            param.put("identityNum", sessionStaff.getCardNumber());
            param.put("queryType", sessionStaff.getCustType());
            param.put("accessNbr", sessionStaff.getInPhoneNum());
            param.put("channelNbr", sessionStaff.getCurrentChannelId());
            param.put("staffCode", sessionStaff.getStaffCode());
            param.put("queryTypeValue", sessionStaff.getInPhoneNum());
            
            param.put("dealTime", dealTime);
            param.put("createDt", dealTime);
            
            rMap = orderBmo.reducePoingts(param, flowNum, sessionStaff);
            log.debug("return={}", JsonUtil.toString(rMap));
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                jsonResponse = super.successed("积分操作成功", ResultConstant.SUCCESS.getCode());
                //扣减成功了要记录下来
                if("DEL".equals(state)){
                	session.setAttribute(SysConstant.JFKJCG+"_"+acctItemId+sessionStaff.getInPhoneNum(), "Y");
                	session.setAttribute(SysConstant.JFKJCG+"_"+sessionStaff.getInPhoneNum(), "Y");
                	session.setAttribute(SysConstant.JFKJCG+"_oldNbr"+acctItemId+sessionStaff.getInPhoneNum(), param.get("orderNbr"));//把订单记录下来用于扣减的入参
                }else{
                	session.setAttribute(SysConstant.JFKJCG+"_"+acctItemId+sessionStaff.getInPhoneNum(), "N");
                	session.setAttribute(SysConstant.JFKJCG+"_"+sessionStaff.getInPhoneNum(), "N");
                }
            } else {
                jsonResponse = super.failed(rMap.get("msg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }    
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
        	String errStack  = ie.getErrStack();
        	jsonResponse = super.failed(errStack, ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            //return super.failed(ie, param, ErrorCode.REDUCE_POINGTS);
        } catch (Exception e) {
            return super.failed(ErrorCode.REDUCE_POINGTS, e, param);
        }
        return jsonResponse;
    }
	 
    /**
     *积分查询，获取是否有紧急开机权限
    **/
    @RequestMapping(value = "/goUrgentOpen", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse goUrgentOpen(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response, HttpServletRequest request) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String flag = "no";
    	Map<String, Object> paramMap = new HashMap<String, Object>();
    	paramMap.put("identityCd", sessionStaff.getCardType());
    	paramMap.put("identityNum", sessionStaff.getCardNumber());
    	paramMap.put("queryType", sessionStaff.getCustType());
    	HttpSession session = request.getSession();
    	String areaId = (String) session.getAttribute("pointareaId");
		if(!"".equals(areaId) && areaId !=null){
			paramMap.put("areaId",areaId);
		}
    	if("11".equals(sessionStaff.getCustType())){
    		paramMap.put("queryTypeValue", sessionStaff.getInPhoneNum());
    	}else{
    		paramMap.put("queryTypeValue", sessionStaff.getCustCode());
    	}
    	Map<String, Object> returnMap;
    	Map<String, Object> pointInfoMap = null;
    	JsonResponse jsonResponse = null;
    	Map<String, Object> rMap = new HashMap<String, Object>();
		try {
			returnMap = orderBmo.queryIntegral(paramMap, flowNum, sessionStaff);
			List<Map<String, Object>> pointInfolist = null;
	        if(returnMap.get("pointInfo") !=null){
	        	Object objPointInfo = returnMap.get("pointInfo");
	        	if (objPointInfo instanceof Map) {
                	pointInfoMap = (Map<String, Object>) objPointInfo;
                } else {
                	pointInfoMap = new HashMap<String, Object>();
                	pointInfoMap.putAll((Map<String, Object>) objPointInfo);
                }
                
                Object obj = pointInfoMap.get("pointitems");
	            if (obj instanceof List) {
	            	pointInfolist = (List<Map<String, Object>>) obj;
	            } else {
	            	pointInfolist = new ArrayList<Map<String, Object>>();
	            	pointInfolist.add((Map<String, Object>) obj);
	            }
	            for(Map<String, Object> pointInfo : pointInfolist){
	            	Date date = new Date();
                	String pointItemValueStr = (String) ("".equals(pointInfo.get("pointItemValue"))?"0":pointInfo.get("pointItemValue"));
                	int pointItemValue = Integer.parseInt(pointItemValueStr);
        			String pointItemTime = (String) pointInfo.get("pointItemTime");
        			String serviceEffectTime = (String) pointInfo.get("serviceEffectTime");
        			//如果返回时间为空，就直接
        			if(!StringUtil.isEmpty(pointItemTime) && !StringUtil.isEmpty(serviceEffectTime)){
        				SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");
    	    			Date pointItemDate = sdf1.parse(pointItemTime);
    	    			SimpleDateFormat sdf2 = new SimpleDateFormat("yyyyMMddHHmmss");
    	    			Date serviceEffectDate = sdf2.parse(serviceEffectTime);
    	    			if(pointItemValue>=1 && (serviceEffectDate.compareTo(date)<0) && date.compareTo(pointItemDate)<0){//true 表示有权益
    	                	//紧急开机 100600 
    	                	if("100600".equals(pointInfo.get("pointItemID"))){
    	                		rMap.put("urgentFlag", "Y");
    	                		session = request.getSession();
    	                		session.setAttribute(SysConstant.INTEREST_JJKJ+sessionStaff.getCardNumber(), "true");
    	                	}
    	    			}
        			}
	            }
	        }
		}catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, paramMap, ErrorCode.QUERY_INTEGRAL);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_INTEGRAL, e, paramMap);
        }
        jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
    	return jsonResponse;
    }
    
    @RequestMapping(value = "/urgentOpen", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse urgentOpen(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response, HttpServletRequest request) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        String orderNbr = (String) param.get("orderNbr");
        param.remove("orderNbr");
        try {
			rMap = orderBmo.urgentOpen(param, flowNum, sessionStaff);
			 if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				 jsonResponse = super.successed("紧急开机成功", ResultConstant.SUCCESS.getCode());
                 //扣取紧急开机权益
				 Map<String, Object> pointInfos = new HashMap<String, Object>();
				 pointInfos.put("recordType", "1");
				 pointInfos.put("serviceNo", "1");
				 pointInfos.put("serviceCodeA", "21");
				 pointInfos.put("serviceCodeB", "100600");
				 pointInfos.put("serviceName", "紧急开机");
				 pointInfos.put("amount", 1);
				 pointInfos.put("price", "0");
				 pointInfos.put("serviceScore", "0");
				 pointInfos.put("state", "ADD");
				 Map<String, Object> paramMap = new HashMap<String, Object>();
				 paramMap.put("acctItemId", "100600");
				 paramMap.put("orderNbr", orderNbr);
				 paramMap.put("areaId", sessionStaff.getCurrentAreaId());
				 paramMap.put("identityNum", sessionStaff.getCardNumber());
				 paramMap.put("queryType", sessionStaff.getCustType());
				 paramMap.put("accessNbr", sessionStaff.getInPhoneNum());
				 paramMap.put("pointInfos", pointInfos);
				 rMap = orderBmo.reducePoingts(param, flowNum, sessionStaff);
				 if (!(rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString()))) {
					 jsonResponse = super.successed("紧急开机成功积分扣减失败！", ResultConstant.SUCCESS.getCode());
				 }
             } else {
                 jsonResponse = super.failed(rMap.get("msg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
             }
		} catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.EMERGENCYBOOT);
        } catch (Exception e) {
            return super.failed(ErrorCode.EMERGENCYBOOT, e, param);
        }
        return jsonResponse;
    }
    
    /**
     * 手机紧急开机 积分扣减
    **/
    @RequestMapping(value = "/reduceIntegral", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse reduceIntegral(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response, HttpServletRequest request) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        //先判断是否有手机积分扣减权益
        HttpSession session = request.getSession();
		String jjkj = (String) session.getAttribute(SysConstant.INTEREST_JJKJ+sessionStaff.getCardNumber());
		jjkj = "Y";
		if(!"Y".equals(jjkj)){
        	return super.failed("该用户无紧急开机的权益！", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        }
        Calendar c = Calendar.getInstance();
        SimpleDateFormat f = new SimpleDateFormat("yyyyMMddHHmmss");
        String dealTime = f.format(c.getTime());
        String olId = (String)param.get("olId");
        //生成省份需要的格式orderNbr由门户传，28位  10位平台编码（1000000200）+6位日期（160302）+加2位序号(这边写死 01)+购物车流水（20位）后10位
        String olNbr = (String)param.get("olNbr");
        String orderNbr = "1000000200" + dealTime.substring(2, 8)+"01"+olNbr.substring(10, 20);
        try {
        	 Map<String, Object> pointInfos = new HashMap<String, Object>();
			 pointInfos.put("recordType", "1");
			 pointInfos.put("serviceNo", "1");
			 pointInfos.put("serviceCodeA", "21");
			 pointInfos.put("serviceCodeB", "100600");
			 pointInfos.put("serviceName", "手机紧急开机");
			 pointInfos.put("amount", 1);
			 pointInfos.put("price", "0");
			 pointInfos.put("serviceScore", "0");
			 List pointInfoList = new ArrayList();
			 pointInfoList.add(pointInfos);
			 Map<String, Object> paramMap = new HashMap<String, Object>();
			 paramMap.put("accessNbr", sessionStaff.getInPhoneNum());
			 paramMap.put("amount", "0");
			 String areaId = (String) session.getAttribute("pointareaId");
	    		if(!"".equals(areaId) && areaId !=null){
	    			paramMap.put("areaId",areaId);
	    		}
			 paramMap.put("channelNbr", sessionStaff.getCurrentChannelId());
			 paramMap.put("dealTime", dealTime);
			 paramMap.put("createDt", dealTime);
			 paramMap.put("olId", olId);
			 paramMap.put("orderNbr", orderNbr);
			 paramMap.put("queryType","11");
			 paramMap.put("queryTypeValue",sessionStaff.getInPhoneNum());
			 paramMap.put("staffCode", sessionStaff.getStaffCode());
			 paramMap.put("state", "DEL");
			 paramMap.put("totalScore", "0");
			 paramMap.put("pointInfos", pointInfoList);
			 rMap = orderBmo.reducePoingts(paramMap, flowNum, sessionStaff);
			 if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				 jsonResponse = super.successed("手机紧急开机积分扣减成功！", ResultConstant.SUCCESS.getCode());
			 }else {
                 jsonResponse = super.failed(rMap.get("msg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
             }
		} catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.REDUCE_POINGTS);
        } catch (Exception e) {
            return super.failed(ErrorCode.REDUCE_POINGTS, e, param);
        }
        return jsonResponse;
    }
    
    /**
     * 一卡双号黑名单管理
     */
    @RequestMapping(value = "/manageBlacklist", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String manageBlacklist(Model model, HttpSession session) throws AuthorityException {
        model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "order/manageBlacklist"));

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        return "/order/blacklist-manage-main";
    }
    /**
     * 一卡双号黑名单查询分页
     */
    @RequestMapping(value = "/queryBlackUserInfo", method = { RequestMethod.POST })
    public String queryBlackUserInfo(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Integer totalSize = 0;
        
        Integer nowPage = Integer.parseInt(param.get("nowPage").toString());
        Integer pageSize = Integer.parseInt(param.get("pageSize").toString());
        String state = param.get("state").toString();
        try {
        	//判别用户是否具有【黑名单失效】的权限
            String isBlackInvalid = null;
            if("0".equals(state)){
	            try {
	                if (isBlackInvalid == null) {
	                	isBlackInvalid = staffBmo.checkOperatSpec(SysConstant.IS_BLACKLIST_INVALID_AUTH, sessionStaff);
	                }
	            } catch (Exception e) {
	            	isBlackInvalid = "1";
	            }
            }
        	
            Map<String, Object> resMap = orderBmo.queryBlackUserInfo(param, null, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode")) && resMap.get("data")!=null) {
                list =  (List<Map<String, Object>>) resMap.get("data");
                // 对暴露的ftp下载地址进行加密
                for (Map<String, Object> map : list) {
					if (map.containsKey("fileUrl")) {
						map.put("fileUrl", AESUtils.encryptToString(MapUtils.getString(map, "fileUrl", ""), SysConstant.BLACK_USER_URL_PWD));
					}
				}
                totalSize = MapUtils.getInteger(resMap, "totalCnt", 1);
            }
            PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(nowPage, pageSize, totalSize < 1 ? 1
                    : totalSize, list);
            model.addAttribute("pageModel", pm);
            model.addAttribute("code", resMap.get("resultCode"));
            model.addAttribute("mess", resMap.get("resultMsg"));
            model.addAttribute("resMap", resMap);
            model.addAttribute("param", param);
            model.addAttribute("state", state);
            model.addAttribute("isBlackInvalid", isBlackInvalid);
            return "/order/blackList-list";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.QUERY_BLACK_USERINFO);
        } catch (Exception e) {
            log.error("一卡双号黑名单查询接口方法异常", e);
            return super.failedStr(model, ErrorCode.QUERY_BLACK_USERINFO, e, param);
        }
    }
    
    @RequestMapping(value = "/queryBlackList", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryBlackList(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            log.debug("param={}", JsonUtil.toString(param));
            rMap =  orderBmo.queryBlackUserInfo(param, flowNum, sessionStaff);
            log.debug("return={}", JsonUtil.toString(rMap));
            if (rMap != null && ResultCode.R_SUCC.equals(rMap.get("resultCode"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("resultMsg"), ResultConstant.FAILD.getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QUERY_BLACK_USERINFO);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_BLACK_USERINFO, e, param);
        }
        return jsonResponse;
    }
    
    /**
     * 返档入口
     */
    @RequestMapping(value = "/preparReturnBlock", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String preparReturnBlock(@RequestParam Map<String, Object> mktRes, HttpServletRequest request, Model model,
            HttpSession session) {
        model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "order/prepare"));
        model.addAttribute("menuName", SysConstant.FD);
        model.addAttribute("DiffPlaceFlag", "local");
        return "/order/order-prepare";
    }
    
    /**
     * 未激活拆机
     */
    @RequestMapping(value="/prepareRemoveProd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String prepareRemoveProd(HttpServletRequest request,Model model,HttpSession session){
    	 model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session, "order/prepare"));
         model.addAttribute("menuName", SysConstant.WJHCJ);
         model.addAttribute("DiffPlaceFlag", "local");
    	return "/order/order-prepare";
    }

    /**
     * 黑名单失效接口
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/blackListInvalid", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse blackListInvalid(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        param.put("invalidStaffCode", sessionStaff.getStaffCode());
        try {
            rMap =  orderBmo.blackListInvalid(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCC.equals(rMap.get("resultCode"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("resultMsg"), ResultConstant.FAILD.getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.INVALID_BLACKLIST);
        } catch (Exception e) {
            return super.failed(ErrorCode.INVALID_BLACKLIST, e, param);
        }
        return jsonResponse;
    }

    /**
	 * 主副卡角色互换：主套餐及产品等信息不变，仅主副卡角色发生变化
	 */
    @RequestMapping(value = "/roleExchange", method = { RequestMethod.POST })
    public String roleExchange(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
    	model.addAttribute("param", param);
        return "/order/order-modify-roleExchange";
    }
    
    /**
     * 终端预约在途单校验
     */
    @ResponseBody
    @RequestMapping(value = "/terminalCancelRoadCheck", method = { RequestMethod.POST })
    public JsonResponse terminalCancelRoadCheck(@RequestBody Map<String, Object> paramMap,@LogOperatorAnn String flowNum){
        JsonResponse jsonResponse = null;
        try {
            log.debug("param={}", JsonUtil.toString(paramMap));
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                    SysConstant.SESSION_KEY_LOGIN_STAFF);
            Map<String, Object> resultMap = orderBmo.queryCouponRoadReserve(paramMap, flowNum, sessionStaff);
            log.debug("return={}", JsonUtil.toString(resultMap));
            if (null != resultMap && ResultCode.R_SUCC.equals(resultMap.get("code").toString())) {
                jsonResponse = super.successed(resultMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(resultMap.get("msg"), ResultConstant.FAILD.getCode());
            }
        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, paramMap, ErrorCode.QUERY_COUPON_ROAD_RESERVE);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_COUPON_ROAD_RESERVE, e, paramMap);
        }
        
        return jsonResponse;
    }
    
    /**
     * 实名制客户身份证件下载
     */
    @RequestMapping(value = "/downloadCustCertificate", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse downloadCustCertificate(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> result = null;
        JsonResponse jsonResponse = null;
        try {
        	result = orderBmo.downloadCustCertificate(param, sessionStaff);
            if (result != null && ResultCode.R_SUCCESS.equals(result.get("code").toString())) {
                jsonResponse = super.successed(result, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(result.get("msg").toString(), ResultConstant.FAILD.getCode());
            }
        } catch (BusinessException be) {
            return super.failed(be);
        }
        return jsonResponse;
    }
}

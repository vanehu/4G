package com.al.lte.portal.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
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

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.EncodeUtils;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.EhcacheUtil;
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
	private PropertiesUtils propertiesUtils;
	
	@RequestMapping(value = "/orderSubmit", method = RequestMethod.POST)
	public String orderSubmit(@RequestBody Map<String, Object> param,Model model
			,HttpServletResponse response,HttpServletRequest request){
		if(commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)){
			try {
				SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                    SysConstant.SESSION_KEY_LOGIN_STAFF);
				Map orderList = (Map)param.get("orderList");
				Map orderListInfo = (Map)orderList.get("orderListInfo");
				orderListInfo.put("staffId", sessionStaff.getStaffId()); //防止前台修改
				orderListInfo.put("distributorId", sessionStaff.getPartnerId());
				
				Map<String, Object> resMap = orderBmo.orderSubmit(param,null,sessionStaff);
				if(ResultCode.R_SUCC.equals(resMap.get("resultCode"))){
					model.addAttribute("resMap",resMap);
					model.addAttribute("resMapJson", JsonUtil.buildNormal().objectToJson(resMap));	
				}else{
					throw new InterfaceException(ErrType.CATCH, PortalServiceCode.ORDER_SUBMIT, String.valueOf(resMap.get("resultMsg")), JsonUtil.toString(param));
				}
	        } catch (BusinessException e) {
	            this.log.error("订单提交失败", e);
	            super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
	        } catch (InterfaceException ie) {
				return super.failedStr(model, ie, param, ErrorCode.ORDER_SUBMIT);
			} catch (Exception e) {
				return super.failedStr(model, ErrorCode.ORDER_SUBMIT, e, param);
			}
			return "/order/order-confirm";
		}else {
			log.error("订单提交失败");
            super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
            return "";
		}
	}
	@RequestMapping(value = "/querySeq", method = RequestMethod.POST)
    @ResponseBody
	public JsonResponse querySeq(@RequestBody Map<String, Object> param,
			HttpServletResponse response,HttpServletRequest request){
		JsonResponse jsonResponse = null;
		try {
				SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                    SysConstant.SESSION_KEY_LOGIN_STAFF);
				Map<String, Object> resMap = orderBmo.querySeq(param,null,sessionStaff);
				if(ResultCode.R_SUCC.equals(resMap.get("resultCode"))){
					jsonResponse = super.successed(resMap,
							ResultConstant.SUCCESS.getCode());
				}else{
					jsonResponse = super.failed(resMap.get("resultMsg"),
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			} catch (BusinessException e) {
				return super.failed(e);
			} catch (InterfaceException ie) {
				return super.failed(ie, param, ErrorCode.QUERY_SEQ);
			} catch (Exception e) {
				return super.failed(ErrorCode.QUERY_SEQ, e, param);
			}
		return jsonResponse;
	}
	@RequestMapping(value = "/orderSubmitComplete", method = RequestMethod.POST)
	public @ResponseBody JsonResponse orderSubmitComplete(@RequestBody Map<String, Object> reqMap,
			HttpServletResponse response,HttpServletRequest request){
		JsonResponse jsonResponse = null;
		if(commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)){
			try {
				SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                    SysConstant.SESSION_KEY_LOGIN_STAFF);
				
				Map<String, Object> resMap = orderBmo.orderSubmitComplete(reqMap,null,sessionStaff);
				if(ResultCode.R_SUCC.equals(resMap.get("resultCode"))){
		        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
				}else{
					throw new InterfaceException(ErrType.CATCH, PortalServiceCode.ORDER_SUBMIT, String.valueOf(resMap.get("resultMsg")), JsonUtil.toString(reqMap));
				}
	        }  catch (BusinessException be) {
				this.log.error("订单一点提交失败", be);
				return super.failed(be);
			} catch (InterfaceException ie) {
				return super.failed(ie, reqMap, ErrorCode.ORDER_SUBMIT);
			} catch (Exception e) {
				log.error("订单一点提交失败方法异常", e);
				return super.failed(ErrorCode.ORDER_SUBMIT, e, reqMap);
			}
			return jsonResponse;
		}else {
			log.error("订单提交失败");
            return jsonResponse;
		}
	}
	
	@RequestMapping(value = "/delOrder", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse delOrder(@RequestParam Map<String, Object> reqMap,Model model){
		JsonResponse jsonResponse = null;
        try {
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                    SysConstant.SESSION_KEY_LOGIN_STAFF);
        	Map<String, Object> resMap = orderBmo.delOrder(reqMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());	
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
    public String main(@RequestParam(value = "current", required = false,defaultValue = "home") String current,
            Model model,@LogOperatorAnn String flowNum,HttpServletRequest request) throws AuthorityException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
		.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		String prodOfferId = request.getParameter("prodOfferId") ;
		String subPage= request.getParameter("subPage") ;
		String isV= request.getParameter("isV") ;
		if(prodOfferId!=null&&!prodOfferId.equals("")&&!prodOfferId.equals("null")){
			model.addAttribute("prodOfferId",prodOfferId);
		}
		if(subPage!=null&&!subPage.equals("")&&!subPage.equals("null")){
			model.addAttribute("subPage",subPage);
		}
		if(isV!=null&&!isV.equals("")&&!isV.equals("null")){
			model.addAttribute("isV",isV);
		}
		try {
			Map param = new HashMap();
			param.put("busitype", "办套餐");
			Map<String, Object> mktResMap = orderBmo.insertbusirecord(param, flowNum, sessionStaff);
		} catch (Exception e) {
			// TODO Auto-generated catch block
//			e.printStackTrace();
		}
       return "/order/order-search";
    }
	
	@RequestMapping(value = "/preparep", method = RequestMethod.POST)
	public String preparep(@RequestParam Map<String, Object> mktRes, HttpServletRequest request,Model model,HttpSession session) {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/prepare"));
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
	public String preparedp(@RequestParam Map<String, Object> mktRes, HttpServletRequest request,Model model,HttpSession session) {
		//model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/prepare"));
		model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session,"order/prepare"));
		//mktRes.put("mktResName", MapUtil.asStr(param, "mktName"));
		//mktRes.put("salePrice", MapUtil.asStr(param, "mktPrice"));
		//mktRes.put("mktPicA", MapUtil.asStr(param, "mktPicA"));
		//mktRes.put("channelId", sessionStaff.getCurrentChannelId());
		model.addAttribute("DiffPlaceFlag", "diff");
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
	public String prepare(@RequestParam Map<String, Object> param, HttpSession session,Model model) {
		//model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/prepare"));
		model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session,"order/prepare"));
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
	
	
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryApConf", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse queryAgentPortalConfig(
			@RequestParam Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
//		Map<String, Object> map = new HashMap<String, Object>();
		JsonResponse jsonResponse = null;
		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String configParamType = String.valueOf(param.get("CONFIG_PARAM_TYPE"));
		String tableName = null;
		String columnItems = "";
		if ("TERMINAL_AND_PHONENUMBER".equals(configParamType)) {
			columnItems = "PHONE_NUMBER_PRESTORE,PHONE_NUMBER_SEGMENT,PHONE_NUMBER_FEATURE,PHONE_BRAND,PHONE_PRICE_AREA,PHONE_TYPE";
			tableName = "SYSTEM";
		}else if("PROD_AND_OFFER".equals(configParamType)) {
			columnItems = "OFFER_PRICE,OFFER_INFLUX,OFFER_INVOICE";
			tableName = "SYSTEM";
		}else if("BILL_POST".equals(configParamType)){
			columnItems = "BILL_POST_TYPE,BILL_POST_CONTENT,BILL_POST_CYCLE";
			tableName = "SYSTEM";
		}
		try {
			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItems);
			if (obj != null && obj instanceof List) {
				rList = (List<Map<String, Object>>) obj;
			} else {
				Map<String, Object> pMap = new HashMap<String, Object>();
				pMap.put("tableName", tableName);
				pMap.put("columnName", columnItems);
				rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItems, rList);
			}
			jsonResponse = super.successed(rList,
					ResultConstant.SUCCESS.getCode());
		} catch (BusinessException e) {
			this.log.error("查询配置信息服务出错", e);
			jsonResponse = super.failed("查询配置信息服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
		return jsonResponse;
	}
	
	@RequestMapping(value = "/prodModifyCommon", method = {RequestMethod.POST})
	public String removeProd(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		if (!MapUtils.isEmpty(param)) {
			//添加一些属性
			param.put("offerNum", 1);
			model.addAttribute("main", param);
		}
		return "/order/order-modify-common";
	}
	
	@RequestMapping(value = "/remove/submit", method = {RequestMethod.POST})
	public String removeSubmit(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		//TODO call bmo
		return "";//return general order submit url
	}
	
	@RequestMapping(value = "/remove/cancel", method = {RequestMethod.POST})
	public String callRemove(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		//TODO call bmo
		return "";//return general order cancel url
	}
	
    @RequestMapping(value = "/entrance", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
	public String entrance(Model model){
    	model.addAttribute("code","0");
	    return "/order/order-entrance";
	}
    
    /*bxw产品规格属性*/
    @RequestMapping(value = "/orderSpecParam", method = RequestMethod.GET)
    public String orderSpecParam(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
    	
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
        if(compProdSpecId!=null&&!compProdSpecId.equals("")&&!compProdSpecId.equals("null")){
        	dataBusMap.put("compProdSpecId", compProdSpecId);//80000101
        }
        dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());//20
        dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
        dataBusMap.put("staffId", sessionStaff.getStaffId());
        dataBusMap.put("partyId", partyId);
        dataBusMap.put("offerRoleId", offerRoleId);
        dataBusMap.put("roleCd", roleCd);//2
        
        Map result = null ;
        List<Map<String, Object>> list = null;
		try {
			result = orderBmo.orderSpecParam(dataBusMap, null, sessionStaff);
			//查询权限
			String isAvoidStop  = checkIsAvoidStop();
			String isAvoidCall  = checkIsAvoidCall();
			String isAvoidRemind = checkIsAvoidRemind();
			model.addAttribute("isAvoidStop", isAvoidStop);
			model.addAttribute("isAvoidCall", isAvoidCall);
			model.addAttribute("isAvoidRemind", isAvoidRemind);
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
				//获取当前转售商实名认证开关状态
				String realNameReg = propertiesUtils.getMessage(SysConstant.BUSI_REAL_NAME_REG_SWITCH+"_"+sessionStaff.getPartnerId());
				if(!"ON".equals(realNameReg) && !"OFF".equals(realNameReg)){
					realNameReg = "ON";//默认开启
				}
				model.addAttribute("realNameReg", realNameReg);
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
    
    /**
     * 获取政企客户实名制开关状态
     * @param params
     * @param flowNum
     * @param response
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/checkRealNameSwitch", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkRealNameSwitch(@RequestBody Map<String, Object> params, @LogOperatorAnn String flowNum, HttpServletResponse response) 
    		throws BusinessException {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String realNameReg = propertiesUtils.getMessage(SysConstant.BUSI_REAL_NAME_REG_SWITCH+"_"+sessionStaff.getPartnerId());
    	return successed(realNameReg, 0);
    }
    
    //查询是否免停权限
	private String checkIsAvoidRemind() {
		// TODO Auto-generated method stub

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
	    String isAvoidRemind= (String)ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_ISAVOID_REMIND+"_"+sessionStaff.getStaffId());
	    try{
		    if(isAvoidRemind==null){
		    	isAvoidRemind=staffBmo.checkOperatSpec(SysConstant.ISAVOID_REMIND,sessionStaff);
			    ServletUtils.setSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_ISAVOID_REMIND+"_"+sessionStaff.getStaffId(), isAvoidRemind);
		    }
	    } catch (BusinessException e) {
	    	isAvoidRemind="1";
	    } catch (InterfaceException ie) {
	    	isAvoidRemind="1";
	    } catch (Exception e) {
	    	isAvoidRemind="1";
	    }
		return  isAvoidRemind;
	}
	//查询是否免停催缴权限
	private String checkIsAvoidCall() {
		// TODO Auto-generated method stub

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
	    String isAvoidCall= (String)ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_ISAVOID_CALL+"_"+sessionStaff.getStaffId());
	    try{
		    if(isAvoidCall==null){
		    	isAvoidCall=staffBmo.checkOperatSpec(SysConstant.ISAVOID_CALL,sessionStaff);
			    ServletUtils.setSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_ISAVOID_CALL+"_"+sessionStaff.getStaffId(), isAvoidCall);
		    }
	    } catch (BusinessException e) {
	    	isAvoidCall="1";
	    } catch (InterfaceException ie) {
	    	isAvoidCall="1";
	    } catch (Exception e) {
	    	isAvoidCall="1";
	    }
		return  isAvoidCall;
	}
	
	//查询是否免提醒权限
	private String checkIsAvoidStop() {
		// TODO Auto-generated method stub

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
	    String isAvoidStop= (String)ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_ISAVOID_STOP+"_"+sessionStaff.getStaffId());
	    try{
		    if(isAvoidStop==null){
		    	isAvoidStop=staffBmo.checkOperatSpec(SysConstant.ISAVOID_STOP,sessionStaff);
			    ServletUtils.setSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_ISAVOID_STOP+"_"+sessionStaff.getStaffId(), isAvoidStop);
		    }
	    } catch (BusinessException e) {
	    	isAvoidStop="1";
	    } catch (InterfaceException ie) {
	    	isAvoidStop="1";
	    } catch (Exception e) {
	    	isAvoidStop="1";
	    }
		return  isAvoidStop;
	}

	/*bxw产品实例属性*/
    @RequestMapping(value = "/orderSpecParamChange", method = RequestMethod.GET)
    public String orderSpecParamChange(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
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
        
        Map result = null ;
        List<Map<String, Object>> list = null;
        try {
        	result = orderBmo.orderSpecParamChange(dataBusMap1 ,dataBusMap2, null, sessionStaff);
        	//查询权限
			String isAvoidStop  = checkIsAvoidStop();
			String isAvoidCall  = checkIsAvoidCall();
			String isAvoidRemind = checkIsAvoidRemind();
			model.addAttribute("isAvoidStop", isAvoidStop);
			model.addAttribute("isAvoidCall", isAvoidCall);
			model.addAttribute("isAvoidRemind", isAvoidRemind);
			
        	model.addAttribute("orderSpec", result);
        	//获取当前转售商实名认证开关状态
    		String realNameReg = propertiesUtils.getMessage(SysConstant.BUSI_REAL_NAME_REG_SWITCH+"_"+sessionStaff.getPartnerId());
    		if(!"ON".equals(realNameReg) && !"OFF".equals(realNameReg)){
    			realNameReg = "ON";//默认开启
    		}
    		model.addAttribute("realNameReg", realNameReg);
        	
        	List<Map<String, Object>> prodInstParams = (List<Map<String, Object>>) result.get("prodSpecParams");
        	
        	if(prodInstParams != null){
				List<Map<String, Object>> filteredProdInstParams = new ArrayList<Map<String,Object>>();
				String custId = null;
				if(prodInstParams != null && prodInstParams.size() > 0){
					for(Map<String, Object> prodInstParam : prodInstParams){
						if(prodInstParam != null && SysConstant.PROD_ITEM_SPEC_ID_USER.equals(prodInstParam.get("itemSpecId")+"")){
							filteredProdInstParams.add(prodInstParam);
							custId = (String) prodInstParam.get("value");
							break;
						}
					}
				}
				
				if(StringUtils.isNotBlank(custId)){ //返回属性值为空字符串时不查询客户详情
					Map<String, Object> paramMap=new HashMap<String, Object>();
			    	paramMap.put("partyId", custId);
			    	paramMap.put("useCustId", custId); //客户详情查询，useCustId表示省内客户ID，后台取该字段后转为集团实例ID并查询
			    	paramMap.put("areaId", request.getParameter("areaId"));
			    	try{
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
        	
        	
        	//String payMethodCode = MySimulateData.getInstance().getParam(SysConstant.PAY_METHOD_CODE) ;
			//model.addAttribute("payMethodCode", payMethodCode==null?"error":payMethodCode);
			String slimitParams = MySimulateData.getInstance().getParam(SysConstant.ORDER_PARAMS_LIMIT_IDS) ;
			List<String> limitParams = new ArrayList<String>();
			if(slimitParams!=null&&!slimitParams.equals("null")){
				String[] strLimitS = slimitParams.split(",");
				for(String str:strLimitS){
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
    /*bxw产品密码修改*/
    @RequestMapping(value = "/orderPasswordChange", method = RequestMethod.GET)
    public String orderPasswordChange(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	String flag = "false";
    	String accNbr = request.getParameter("accNbr");
    	if(accNbr!=null&&session.getAttribute("ValidateAccNbr")!=null&&accNbr.equals(session.getAttribute("ValidateAccNbr"))){
    		Object password_session = session.getAttribute("ValidateProdPwd");
    		if(password_session!=null&&!password_session.equals("")&&!password_session.equals("null")){
    			model.addAttribute("password_session", password_session);
    			flag = "true" ;
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
    public JsonResponse orderPasswordCheck(HttpSession session, @RequestBody Map<String, Object> param 
    		,@LogOperatorAnn String flowNum//,Model model,HttpServletResponse response
    		) throws BusinessException{
    	JsonResponse jsonResponse = null;
    	
    	String password_old = param.get("password_old")==null?"":param.get("password_old").toString() ;
    	String accessNumber = param.get("accessNumber")==null?"":param.get("accessNumber").toString() ;
    	String areaId = param.get("areaId")==null?"":param.get("areaId").toString() ;
    	if(session.getAttribute("ValidateAccNbr")!=null&&accessNumber.equals(session.getAttribute("ValidateAccNbr"))){
    		Object password_session = session.getAttribute("ValidateProdPwd");
    		if(password_session!=null&&password_session.equals(password_old)){
    			jsonResponse = super.successed("产品密码鉴权成功",
    					ResultConstant.SUCCESS.getCode());
        		return jsonResponse;
    		}
    	}
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
    	Map map = null;
		Map paramMap = new HashMap();
		/*{accessNumber:'11969577',areaId:21,prodPwd:'000000'}*/
		paramMap.put("accessNumber", accessNumber);
		paramMap.put("areaId", areaId);
		paramMap.put("prodPwd", password_old);
		try {
			map = custBmo.custAuth(paramMap,
					"", sessionStaff);
			String isValidateStr = null ;
			if(map.get("isValidate")!=null){
				isValidateStr = map.get("isValidate").toString() ;
			}else if(map.get("result")!=null){
				Map<String, Object> tmpMap = MapUtils.getMap(map, "result");
				isValidateStr = MapUtils.getString(tmpMap, "isValidate");
			}
			if ("true".equals(isValidateStr)){
				session.setAttribute("ValidateAccNbr", accessNumber);
				session.setAttribute("ValidateProdPwd", password_old);
				jsonResponse = super.successed("产品密码鉴权成功",
    					ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed("产品密码鉴权失败",
    					ResultConstant.FAILD.getCode());
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
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
    	String areaId = sessionStaff.getCurrentAreaId();
    	String prodId = request.getParameter("prodId");
    	String acctNbr = request.getParameter("acctNbr");
    	Map qry = new HashMap();
    	qry.put("areaId", areaId);
    	qry.put("prodId", prodId);//123015734675
    	qry.put("acctNbr", acctNbr);
    	Map shortnum_data = null ;
		try {
			shortnum_data = orderBmo.shortnum_query(qry,null, sessionStaff);
        	model.addAttribute("shortnum_data", shortnum_data);
		} catch (BusinessException be) {
			
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {

			return super.failedStr(model,ie, qry, ErrorCode.ORDER_COMP_PROD_INST);
		} catch (Exception e) {
			log.error("加载短号/order/orderShortnumChange方法异常", e);
			return super.failedStr(model,ErrorCode.ORDER_COMP_PROD_INST, e, qry);
		}
    	return "/order/order-shortnum-change";
    }

    @RequestMapping(value = "/offerSpecList", method = RequestMethod.GET, produces = "text/html;charset=UTF-8")
    public String getOfferSpecList(@RequestParam Map<String, Object> prams,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);	
		prams.put("channelId", sessionStaff.getCurrentChannelId());
		prams.put("areaId", sessionStaff.getCurrentAreaId());
		prams.put("staffId", sessionStaff.getStaffId());
		prams.put("pageSize", 500);
		if (sessionStaff != null) {
            Map<String, Object> map = null;
            try {
            	map = orderBmo.queryMainOfferSpecList(prams,null, sessionStaff);
            	if(ResultCode.R_SUCCESS.equals(map.get("code"))){
            		//拼装前台显示的套餐详情
            		if(!map.isEmpty()){
            			List prodOfferInfosList = (List) map.get("prodOfferInfos");
            			for(int i=0;i<prodOfferInfosList.size();i++){
            				Map exitParam = new HashMap();
            				exitParam = (Map) prodOfferInfosList.get(i);
            				List<Map<String,Object>> inhtmllist = new ArrayList<Map<String,Object>>();//组装套餐属性
            				if(exitParam.containsKey("price")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "价格");
            					inhtmlmap.put("value", exitParam.get("price"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inFlux")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					float influx = 0 ;
            					String influx_str ="";
            					/*
            					 判断返回的流量是否大于1024M，如果大于1024M，显示的单位是G，否则显示的单位是M
            					 */
            					if(exitParam.get("inFlux")!=null){
            						try{
            							influx = Float.parseFloat(exitParam.get("inFlux").toString());
            							if(influx<1024){
            								influx_str = influx+"";
            								if(influx_str.indexOf(".") > 0){  
                        						influx_str = influx_str.replaceAll("0+?$", "");//去掉多余的0  
                        						influx_str = influx_str.replaceAll("[.]$", "");//如最后一位是.则去掉  
                        			        } 
            								influx_str = influx_str+"M";
            							}else{
            								influx_str = influx/1024+"";
            								if(influx_str.indexOf(".") > 0){  
                        						influx_str = influx_str.replaceAll("0+?$", "");//去掉多余的0  
                        						influx_str = influx_str.replaceAll("[.]$", "");//如最后一位是.则去掉  
                        			        } 
            								influx_str = influx_str +"G";
            							}
            						}catch(Exception e){
            							this.log.error("WIFI", e);
            						}
            					}
            					inhtmlmap.put("name", "流量");
            					inhtmlmap.put("value", influx_str);
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inVoice")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "语音分钟数");
            					inhtmlmap.put("value", exitParam.get("inVoice"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inWIFI")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "WIFI时长");
            					inhtmlmap.put("value", exitParam.get("inWIFI"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inSMS")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "点对点短信");
            					inhtmlmap.put("value", exitParam.get("inSMS"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inMMS")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "点对点彩信");
            					inhtmlmap.put("value", exitParam.get("inMMS"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("outFlux")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "套餐外流量");
            					inhtmlmap.put("value", exitParam.get("outFlux"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("outVoice")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "套餐外通话分钟数");
            					inhtmlmap.put("value", exitParam.get("outVoice"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(SysConstant.APPDESC_MVNO.equals(propertiesUtils.getMessage(SysConstant.APPDESC))){
            					inhtmllist.clear();
            					if(exitParam.containsKey("summary")){
            						Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            						Object summary=exitParam.get("summary");
            						inhtmlmap.put("name", "套餐信息");
            						inhtmlmap.put("value", summary);
            						if(summary!=null&&!"".equals(summary)){
            							inhtmlmap.put("value", summary.toString().length()>60?summary.toString().substring(0, 60)+"...":summary);
            						}
            						inhtmllist.add(inhtmlmap);
            					}
            					exitParam.put("ismvno", "true");
            					exitParam.put("htmlvallist", inhtmllist);
            				}else{
            					exitParam.put("ismvno", "false");
            					exitParam.put("htmlvallist", inhtmllist);
            				}
            			}
            		}
            		model.addAttribute("resultlst", map.get("prodOfferInfos"));
            	}
            	model.addAttribute("pnLevelId", prams.get("pnLevelId"));
            	if(!"".equals(prams.get("subPage"))){
            		model.addAttribute("subPage", prams.get("subPage"));
            	}
            	if(!"".equals(prams.get("isV"))){
            		model.addAttribute("isV", prams.get("isV"));
            	}
            	if(null!=(prams.get("orderflag"))){
            		model.addAttribute("orderflag", prams.get("orderflag"));
            	 }
            } catch (BusinessException be) {
    			this.log.error("查询号码信息失败", be);
    			return super.failedStr(model, be);
    		} catch (InterfaceException ie) {
    			return super.failedStr(model, ie, prams, ErrorCode.QUERY_MAIN_OFFER);
    		} catch (Exception e) {
    			return super.failedStr(model, ErrorCode.QUERY_MAIN_OFFER, e, prams);
    		}
        } else {
            this.log.error("登录会话不存在，套餐加载失败{}");
        }
		
		return "/order/order-services";
    }

	@RequestMapping(value = "/queryPackForTerm", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryPackForTerm(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum) throws BusinessException {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
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
			dataBusMap.put("pageSize", 10);
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
			return super.failed("登录会话不存在，套餐加载失败",
					ResultConstant.FAILD.getCode());
		}

		return super.successed(retnMap);
	}
	
	@RequestMapping(value = "/queryOfferSpec", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryOfferSpec(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum) throws BusinessException {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
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
				retnMap = orderBmo.queryOfferSpecParamsBySpec(dataBusMap,null, sessionStaff);
				
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
			return super.failed("登录会话不存在，套餐加载失败",
					ResultConstant.FAILD.getCode());
		}

		return super.successed(retnMap);
	}
	
	@RequestMapping(value = "/serviceDetial", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getServiceDetial(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
   	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
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
            	map = orderBmo.queryOfferSpecParamsBySpec(dataBusMap,flowNum, sessionStaff);
            	if (map != null&& ResultCode.R_SUCCESS.equals(map.get("code").toString())) {
    				jsonResponse = super.successed(map.get("offerSpec"),
    						ResultConstant.SUCCESS.getCode());
    			} else {
    				jsonResponse = super.failed(map.get("msg").toString(),
    						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
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
    public String main(@RequestBody Map<String, Object> param, Model model,  HttpServletResponse response) {
    	String forward = "" ;
    	if("2".equals(String.valueOf(param.get("actionFlag")))){  //套餐变更
    		if (MapUtils.isNotEmpty(param)) {
        		model.addAttribute("main", param);
        	}
    		forward = "/offer/offer-change";
    	}else if("3".equals(String.valueOf(param.get("actionFlag")))){
    		if (MapUtils.isNotEmpty(param)) {
        		//重新拼接参数
        		if (param.containsKey("offerRoles")) {
        			List<Map> offerRoles = (List<Map>)param.get("offerRoles");
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
        		if (!param.containsKey("offerNum")||param.get("offerNum")==null) {
        			param.put("offerNum", 1);
        		}
        		model.addAttribute("main", param);
        	}
    		forward = "/offer/offer-change";
    	}else {
    		if (MapUtils.isNotEmpty(param)) {
        		if (!param.containsKey("offerNum")||param.get("offerNum")==null) {
        			param.put("offerNum", 1);
        		}
        		model.addAttribute("main", param);
        	}
    		forward = "/order/order-main-template";
    	}
    	return forward;
    }
    @RequestMapping(value = "/checkOperate", method = RequestMethod.GET)
    public @ResponseBody String checkOperate(@LogOperatorAnn String flowNum,
  			HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String isAddOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
			SysConstant.EFF_TIME+"_"+sessionStaff.getStaffId());
		try{
			if(isAddOperation==null){
				isAddOperation=staffBmo.checkOperatSpec(SysConstant.EFF_TIME,sessionStaff);
				ServletUtils.setSessionAttribute(super.getRequest(),
						SysConstant.EFF_TIME+"_"+sessionStaff.getStaffId(), isAddOperation);
			}
		} catch (BusinessException e) {
			isAddOperation="1";
		} catch (InterfaceException ie) {
			isAddOperation="1";
		} catch (Exception e) {
			isAddOperation="1";
		}
		return isAddOperation;
    }
    
    @SuppressWarnings("unchecked")
 	@RequestMapping(value = "/getChargeList", method = RequestMethod.GET)
     public String getChargeList(@RequestParam Map<String, Object> param, Model model,
 			@LogOperatorAnn String flowNum,HttpServletResponse response){
     	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_LOGIN_STAFF);
     	try {
     		if(param.get("actionFlag")!=null){
         		String actionFlag=(String)param.get("actionFlag");
         		model.addAttribute("actionFlag", actionFlag);
         		param.remove("actionFlag");
     		}
     		if(param.get("refundType")!=null){
         		String refundType=(String)param.get("refundType");
         		model.addAttribute("refundType", Integer.parseInt(refundType));
         		param.remove("refundType");
     		}
     		if(param.containsKey("businessName")){
     			String businessName = MapUtils.getString(param, "businessName", "");
     			businessName = EncodeUtils.urlDecode(businessName);
         		model.addAttribute("businessName", businessName);
         		param.remove("businessName");
     		}
     		if(param.containsKey("actionTypeName")){
     			String actionTypeName = MapUtils.getString(param, "actionTypeName", "");
     			actionTypeName = EncodeUtils.urlDecode(actionTypeName);
     			model.addAttribute("actionTypeName", actionTypeName);
     			param.remove("actionTypeName");
     		}
     		if(param.get("olNbr")!=null){
         		String olNbr=(String)param.get("olNbr");
         		model.addAttribute("olNbr", olNbr);
         		param.remove("olNbr");
     		}
     		param.put("areaId", sessionStaff.getCurrentAreaId());
     		Map<String, Object> datamap = this.orderBmo.queryChargeList(param,flowNum, sessionStaff);
 			if (datamap != null) {
 	    		String code = (String) datamap.get("code");
 				if (ResultCode.R_SUCCESS.equals(code)) {
 	    			List<Map<String,Object>> templist=null; 
 	    			if(datamap.get("chargeItems")!=null){
 	    				Object obj=datamap.get("chargeItems");
 	    				if (obj instanceof List) {
 	    					templist=(List<Map<String,Object>>)obj;
 	    				}else{
 	    					templist=new ArrayList<Map<String,Object>>();
 	    					templist.add((Map<String,Object>)obj);
 	    				}
 	    				model.addAttribute("chargeItems", templist);
 	    			}
 	    			templist=null;
 	    			if(datamap.get("prodInfo")!=null){
 	    				Object obj1=datamap.get("prodInfo");
 	    				if (obj1 instanceof List) {
 	    					templist=(List<Map<String,Object>>)obj1;
 	    				}else{
 	    					templist=new ArrayList<Map<String,Object>>();
 	    					templist.add((Map<String,Object>)obj1);
 	    				}
 	    				model.addAttribute("prodInfo", templist);
 	    			}
 				}
     		}
 			String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_EDITCHARGE+"_"+sessionStaff.getStaffId());
 			try{
	 			if(iseditOperation==null){
	 				iseditOperation=staffBmo.checkOperatSpec(SysConstant.EDITCHARGE_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_EDITCHARGE+"_"+sessionStaff.getStaffId(), iseditOperation);
	 			}
 			} catch (BusinessException e) {
 				iseditOperation="1";
 	 		} catch (InterfaceException ie) {
 	 			iseditOperation="1";
 			} catch (Exception e) {
 				iseditOperation="1";
 			}
 			String isAddOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_ADDCHARGE+"_"+sessionStaff.getStaffId());
 			try{
	 			if(isAddOperation==null){
	 				isAddOperation=staffBmo.checkOperatSpec(SysConstant.ADDCHARGE_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_ADDCHARGE+"_"+sessionStaff.getStaffId(), isAddOperation);
	 			}
 			} catch (BusinessException e) {
 				isAddOperation="1";
 	 		} catch (InterfaceException ie) {
 	 			isAddOperation="1";
 			} catch (Exception e) {
 				isAddOperation="1";
 			}
 			
 			String isEditAdjustOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_EDITADJUSTCHARGE+"_"+sessionStaff.getStaffId());
 			//String isEditAdjustOperation= "0";
 			try{
	 			if(isEditAdjustOperation==null){
	 				isEditAdjustOperation=staffBmo.checkOperatSpec(SysConstant.EDITADJUST_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_EDITADJUSTCHARGE+"_"+sessionStaff.getStaffId(), isEditAdjustOperation);
	 			}
 			} catch (BusinessException e) {
 				isEditAdjustOperation="1";
 	 		} catch (InterfaceException ie) {
 	 			isEditAdjustOperation="1";
 			} catch (Exception e) {
 				isEditAdjustOperation="1";
 			}
 			//String iseditOperation="0";
 			model.addAttribute("iseditOperation", iseditOperation);
 			model.addAttribute("isEditAdjustOperation", isEditAdjustOperation);
 			//String iseditOperation="0";
 			model.addAttribute("iseditOperation", iseditOperation);
 			model.addAttribute("isAddOperation", isAddOperation);
 			model.addAttribute("olId", param.get("olId"));
 			getApConfigMap(model, flowNum, sessionStaff);
     	} catch (BusinessException e) {
     		return super.failedStr(model,e);
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
	private void getApConfigMap(Model model, String flowNum,
			SessionStaff sessionStaff) {
		String tableName = "SYSTEM";
		String columnItem = "PENALTY_FREE_ITEM";
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
			ArrayList<Map<String, Object>> al = (ArrayList)rList.get(0).get("PENALTY_FREE_ITEM"); 
			model.addAttribute("acctItemTypeId", al.get(0).get("COLUMN_VALUE"));
		} catch (BusinessException e) {
		    this.log.error("查询配置信息服务出错", e);
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
	}
     @RequestMapping(value = "/getChargeAddByObjId", method = RequestMethod.POST)
     public String getChargeAddByObjId(@RequestBody Map<String, Object> param, Model model,
 			@LogOperatorAnn String flowNum,HttpServletResponse response){
     	try {
     		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 					SysConstant.SESSION_KEY_LOGIN_STAFF);
     		Map<String,Object> interMap=new HashMap<String,Object>();
     		interMap.put("areaId", sessionStaff.getCurrentAreaId());
     		interMap.put("boActionTypeCd", param.get("boActionTypeCd"));
     		interMap.put("objId", param.get("objId"));
     		interMap.put("objType", param.get("objType"));
     		Map<String, Object> datamap = this.orderBmo.queryAddChargeItems(interMap,flowNum, sessionStaff);
     		if (datamap != null) {
 	    		String code = (String) datamap.get("code");
 				if (ResultCode.R_SUCCESS.equals(code)) {
 					model.addAttribute("items", datamap.get("list"));
 					model.addAttribute("param", param);
 				}
     		}
     	} catch (BusinessException e) {
     		return super.failedStr(model,e);
 		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.CHARGE_ADDITEM);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.CHARGE_ADDITEM, e, param);
		}
     	return "/order/order-cal-additem";
     }
     @RequestMapping(value = "/queryPayMethodByItem", method = RequestMethod.POST)
     @ResponseBody
     public JsonResponse queryPayMethodByItem(@RequestBody Map<String, Object> param,
 			@LogOperatorAnn String flowNum,HttpServletResponse response){
    	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
 				.getSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_LOGIN_STAFF);
 		Map<String, Object> rMap = null;
 		JsonResponse jsonResponse = null;
 		try {
 			param.put("areaId", sessionStaff.getCurrentAreaId());
 			rMap = orderBmo.queryPayMethodByItem(param, flowNum, sessionStaff);
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
 				jsonResponse = super.successed(rMap.get("list"),
 						ResultConstant.SUCCESS.getCode());
 			} else {
 				jsonResponse = super.failed(rMap.get("msg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
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
     public JsonResponse chargeSubmit(@RequestBody Map<String, Object> param,
 			@LogOperatorAnn String flowNum,HttpServletResponse response,HttpServletRequest request){
    	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
 				.getSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_LOGIN_STAFF);
 		Map<String, Object> rMap = null;
 		JsonResponse jsonResponse = null;
 		try {
 			if(commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)){
	 			log.debug("param={}", JsonUtil.toString(param));
	 			param.put("areaId", sessionStaff.getCurrentAreaId());
	 			rMap = orderBmo.chargeSubmit(param, flowNum, sessionStaff);
	 			log.debug("return={}", JsonUtil.toString(rMap));
	 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
	 				jsonResponse = super.successed("收费成功",
	 						ResultConstant.SUCCESS.getCode());
	 			} else {
	 				jsonResponse = super.failed(rMap.get("msg"),
	 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
	 			}
 			}else{
 				jsonResponse = super.failed("订单已经建档成功,不能重复操作!",
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
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
    		if (param.get("areaId")==null) {
    			param.put("areaId", sessionStaff.getCurrentAreaId());
    		}
  			Map<String, Object> resultMap = orderBmo.queryAccountInfo(param, flowNum, sessionStaff);
  			if(MapUtils.isNotEmpty(resultMap)){
  				jr = successed(resultMap, 0);
  			}
  			else{
  				jr = failed("返回数据异常，请联系管理员", 1);
  			}
  		}catch(BusinessException be){
  			return super.failed(be);
  		}catch(InterfaceException ie){
			return super.failed(ie, param, ErrorCode.QUERY_ACCT);
		}catch(Exception e){
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
 			String isValidateStr = null ;
 			if(returnMap.get("isValidate")!=null){
				isValidateStr = returnMap.get("isValidate").toString() ;
			}else if(returnMap.get("result")!=null){
				Map<String, Object> tmpMap = MapUtils.getMap(returnMap, "result");
				isValidateStr = MapUtils.getString(tmpMap, "isValidate");
			}
			if ("true".equals(isValidateStr)){
				jr = successed("", 0);
			}else{
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
    public JsonResponse addComp(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
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
			if (datamap != null&& ResultCode.R_SUCCESS.equals(datamap.get("code").toString())) {
				jr = super.successed(datamap.get("compProdMemberInfos"),
						ResultConstant.SUCCESS.getCode());
			} else {
				jr = super.failed(datamap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
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
    public String addComp(@RequestBody Map<String, Object> param, Model model,HttpServletResponse response) { 
    	return "/order/order-addcomp";
    }
    
    /**
     * 退出群组
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/removeComp", method = { RequestMethod.POST })
    public String removeComp(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
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
    public JsonResponse queryCompPspecGrpsBySpecId(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
    		HttpServletResponse response) { 
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
 				if(returnMap.get("code").equals(ResultCode.R_SUCCESS)){
 					Map<String, Object> prodSpec = (Map<String, Object>) returnMap.get("prodSpec");
 					jr = super.successed(prodSpec.get("compPspecCompGrps"),
    						ResultConstant.SUCCESS.getCode());
 				}
 				else{
 					jr = failed(returnMap.get("msg"), 1);
 				}
 			}
 			else{
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
    public JsonResponse queryTerminalInfo(@RequestBody Map<String, Object> param, String flowNum, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	dataBusMap.put("prodId", MapUtils.getString(param, "prodId", ""));
    	dataBusMap.put("acctNbr", MapUtils.getString(param, "acctNbr", ""));
    	dataBusMap.put("areaId", MapUtils.getString(param, "areaId", ""));
    	JsonResponse jr = new JsonResponse();
    	try{
    		Map<String, Object> resultMap = orderBmo.queryOfferCouponById(dataBusMap, flowNum, sessionStaff);
    		String couponTypeCd = MySimulateData.getInstance().getParam("couponTypeCd");
        	if (resultMap != null&& ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
        		Map<String, Object> result = (Map<String, Object>) resultMap.get("result");
        		List<Map<String, Object>> offerCoupon = (List<Map<String, Object>>)result.get("offerCoupon");
        		Map returnMap = new HashMap();
        		if(offerCoupon.isEmpty()){
					jr = super.failed("未查询到旧卡物品信息",ResultConstant.FAILD.getCode());
				}else{
					for (int i=0;i<offerCoupon.size();i++){
						String currentCouponTypeCd = offerCoupon.get(i).get("couponTypeCd").toString();
						if(couponTypeCd.equals(currentCouponTypeCd)){
							returnMap = (Map) offerCoupon.get(i);
						}
					}
					if(returnMap.isEmpty()){
						jr = super.failed("旧卡物品信息未找到匹配的UIM类型数据",ResultConstant.FAILD.getCode());
					}else{
						jr = super.successed(returnMap,ResultConstant.SUCCESS.getCode());
					}
				}
			} else {
				jr = super.failed(resultMap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
        	return jr;
   		}catch (BusinessException be) {
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
    public JsonResponse queryProdAcctInfo(@RequestBody Map<String, Object> param, String flowNum, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
      	
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	dataBusMap.put("prodId", MapUtils.getString(param, "prodId"));
    	dataBusMap.put("acctNbr", MapUtils.getString(param, "acctNbr"));
   	    dataBusMap.put("areaId", MapUtils.getString(param, "areaId"));
    	    	
    	JsonResponse jr = new JsonResponse();
    	
    	try{
    		Map<String, Object> resultMap = orderBmo.queryProdAcctInfo(dataBusMap, flowNum, sessionStaff);
    		    		
    		if(resultMap!=null){
    			Map<String, Object> result = (Map<String, Object>)resultMap.get("result");
    			ArrayList<Map<String, Object>> prodAcctInfos = (ArrayList<Map<String, Object>>)result.get("prodAcctInfos");
    			jr = successed(prodAcctInfos, 0);
    		}
    		else{
    			jr = failed("", 1);
    		}
   		}catch (BusinessException be) {
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
    public String preChangeAccount(@RequestBody ArrayList<Map<String, Object>> prodAcctInfos, Model model, @LogOperatorAnn String flowNum){
    	   	
    	model.addAttribute("prodAcctInfos", prodAcctInfos);
    	
    	return "/order/order-change-account";
    }
    
    /* bxw作废发票*/
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/invaideInvoice", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse invaideInvoice(WebRequest request, String flowNum, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
    	JsonResponse jr = new JsonResponse();
    	
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	dataBusMap.put("olId", request.getParameter("olId"));
    	dataBusMap.put("soNbr", request.getParameter("soNbr"));
    	dataBusMap.put("areaId", sessionStaff.getCurrentAreaId().toString());
    	
    	try{
    		List<Object> listId = new ArrayList<Object>();
    		int bInvoice = -1 ;
    		Map<String, Object> resultMap = printBmo.getInvoiceItems(dataBusMap, flowNum, sessionStaff);	
    		if(resultMap!=null){
    			if(resultMap.get("invoiceInfos")!=null){
    				Object invoiceInfos = resultMap.get("invoiceInfos");
    				if(invoiceInfos instanceof List){
    					List<Object> list = (List<Object>)invoiceInfos;
    					if(list!=null&&list.size()>0){
    						for(Object obj:list){
    							if(obj!=null&&!obj.equals("null")&&obj instanceof Map){
    								Map invoiceInfo = (Map)obj ;
    								listId.add(invoiceInfo.get("invoiceId"));
    								bInvoice = 1 ;
    							}
        					}
    						if(bInvoice==-1){
    							bInvoice = 0 ;
    						}
    					}else{
    						bInvoice = 0 ;
    					}
    				}
    			}
    		}
    		if(bInvoice>0){//bInvoice费用接口调用成功，如果有list数据，调用作废接口，否则？？？？	
    			Map<String, Object> parms = new HashMap<String, Object>();
				parms.put("invoiceIds", listId);
				parms.put("areaId", sessionStaff.getCurrentAreaId().toString());
				Map<String, Object> resultInvalid = orderBmo.updateInvoiceInvalid(parms, flowNum, sessionStaff);	
				if(resultInvalid.get("code")!=null&&resultInvalid.get("code").equals("0")){
					jr = successed("发票作废成功！", 0);
				}else{
					jr = failed("发票作废失败！", 1);
				}
    		}else if(bInvoice==0){
    			jr = failed("未获取到发票信息！", 2);
    		}else{
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
	public JsonResponse groupShortNbrQuery(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		Map<String, Object> releaseMap = null;
		JsonResponse jsonResponse = null;
		String groupShortNbr = param.get("shortNbr").toString();
		param.remove("shortNbr");
		try {
			param.put("lanId", sessionStaff.getCurrentAreaId());
			boolean isBothExecute = param.containsKey("oldnum");
			if(isBothExecute){
				String oldnum = param.get("oldnum").toString();
				param.remove("oldnum");
				param.put("groupShortNbr", oldnum);
				param.put("statusCd", "1000");
				releaseMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
				param.remove("groupShortNbr");
				param.put("groupShortNbr", groupShortNbr);
				param.put("statusCd", "1102");
				rMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
				if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					jsonResponse=super.successed("校验成功！", ResultConstant.SUCCESS.getCode());
				}else {
					jsonResponse = super.failed(rMap.get("msg"),ResultConstant.FAILD.getCode());
				}
			}else{
				param.put("groupShortNbr", groupShortNbr);
				rMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
				if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					jsonResponse=super.successed(rMap.get("msg"), ResultConstant.SUCCESS.getCode());
				}else{
					jsonResponse = super.failed(rMap.get("msg"),ResultConstant.FAILD.getCode());
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
	public JsonResponse checkReleaseShortNum(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		
		String checkNbr = param.get("checkNbr")==null?"":param.get("checkNbr").toString();
		String groupShortNbr = param.get("groupShortNbr")==null?"":param.get("groupShortNbr").toString();
		if(groupShortNbr==null||groupShortNbr.equals("")||groupShortNbr.equals("null")){
			jsonResponse = super.failed("请输入新的短号再检查！",
					ResultConstant.FAILD.getCode());
		}else if(groupShortNbr.equals(checkNbr)){
			jsonResponse = super.failed("新旧短号相同，请修改再提交！",
					ResultConstant.FAILD.getCode());
		}
		try{
			param.remove("checkNbr");
			if(checkNbr!=null&&!checkNbr.equals("")&&!checkNbr.equals("null")){
				param.put("groupShortNbr", checkNbr);
				param.put("statusCd", "1000");
				Map releaseMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
				//releaseMap.get("code");
			}
			param.put("groupShortNbr", groupShortNbr);
			param.put("statusCd", "1102");
			Map releaseMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
			if (releaseMap != null&& ResultCode.R_SUCCESS.equals(releaseMap.get("code").toString())) {
				jsonResponse = super.successed(releaseMap.get("msg"), ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(releaseMap.get("msg"),ResultConstant.FAILD.getCode());
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
	@RequestMapping(value="/queryPartyProfileSpecList", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> queryPartyProfileSpecList(HttpSession session,WebRequest request) throws Exception {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId = sessionStaff.getCurrentAreaId() ;
		Map<String,Object> param = new HashMap<String,Object>();
		param.put("areaId", areaId);
		Map<String, Object> result = orderBmo.assistantTypeQuery(param, null, sessionStaff);
		return result;
	}
	/**
	 * 跳转手动归档页面
	 * @return
	 */
	@RequestMapping(value="/autoArchivedMain", method ={ RequestMethod.POST, RequestMethod.GET})
	public String autoArchivedMain(){
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
	@RequestMapping(value="/updateArchivedAuto", method ={ RequestMethod.POST, RequestMethod.GET})
	@ResponseBody
    public  JsonResponse  updateArchivedAuto(@RequestBody Map<String, Object> param,@LogOperatorAnn String flowNum,WebRequest request){
	    SessionStaff sessionStaff = (SessionStaff) ServletUtils
                .getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_LOGIN_STAFF);
	    Map<String, Object> res=new HashMap<String, Object>();
	    try {
	        res=orderBmo.updateArchivedAuto( param,flowNum,sessionStaff);
	        return super.successed(res);
        }  catch (BusinessException be) {
            
            return super.failed(be);
        } catch (InterfaceException ie) {

            return super.failed(ie, param, ErrorCode.UPDATE_ARCHIVED_AUTO);
        } catch (Exception e) {
            log.error("执行手动归档方法异常/order/updateArchivedAuto", e);
            return super.failed(ErrorCode.STAFF_LOGIN, res, param);
        }
    }
	
	@RequestMapping(value = "/checkRuleToProv", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkRuleToProv(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
   	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			log.debug("param={}", JsonUtil.toString(param));
			param.put("areaId", sessionStaff.getCurrentAreaId());
			rMap = orderBmo.checkRuleToProv(param, flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(rMap));
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse = super.successed("收费校验成功",
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg"),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
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
	
	@RequestMapping(value="/inOrderYsl", method ={ RequestMethod.POST, RequestMethod.GET})
	public String inOrderYsl(){
	    return "/order/order-ysl";
	}
	
	@RequestMapping(value="/queryOrderYsl", method ={ RequestMethod.POST, RequestMethod.GET})
	public String queryOrderYsl(Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String endTime = f.format(c.getTime());
		c.add(Calendar.DATE, -7);
		String startTime = f.format(c.getTime());
		
		model.addAttribute("p_startDt", startTime);
		model.addAttribute("p_endDt", endTime);

		String p_areaId = sessionStaff.getCurrentAreaId();
		String p_areaId_val = sessionStaff.getCurrentAreaAllName();
		model.addAttribute("p_areaId", p_areaId);
		model.addAttribute("p_areaId_val", p_areaId_val);
	    return "/orderQuery/query-order-ysl";
	}
	
	/*预受理业务类型*/
	@RequestMapping(value = "/querybusitype", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse querybusitype(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		String resultList= null;
		try{		
 			rMap = this.orderBmo.querybusitype(param, null, sessionStaff);
 			resultList =rMap.get("result").toString();
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())&&!"[]".equals(resultList)) {
 				jsonResponse = super.successed(rMap.get("result"),
 						ResultConstant.SUCCESS.getCode());
 			}else if("[]".equals(resultList)) {
 				jsonResponse = super.failed("查询业务类型无数据",
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			} else {
 				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
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
	@RequestMapping(value = "/querybusiactiontype", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse querybusiactiontype(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		String resultList= null;
		try{		
 			rMap = this.orderBmo.querybusiactiontype(param, null, sessionStaff);
 			resultList =rMap.get("result").toString();
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())&&!"[]".equals(resultList)) {
 				jsonResponse = super.successed(rMap.get("result"),
 						ResultConstant.SUCCESS.getCode());
 			}else if("[]".equals(resultList)) {
 				jsonResponse = super.failed("查询业务动作无数据",
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			} else {
 				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
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
	@RequestMapping(value = "/suborderysl", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse suborderysl(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
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
		String CUST_SO_NUMBER = "YSL"+DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS")+RandomStringUtils.randomNumeric(3);
		
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
		try{		
 			rMap = this.orderBmo.suborderysl(param, null, sessionStaff);
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())) {
 				rMap.put("CUST_SO_NUMBER", CUST_SO_NUMBER);
 				jsonResponse = super.successed(rMap,
 						ResultConstant.SUCCESS.getCode());
 			} else {
 				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("预受理订单提交失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.INSERT_ORDERYSL);
		} catch (Exception e) {
			log.error("门户/order/suborderysl方法异常", e);
			return super.failed(ErrorCode.INSERT_ORDERYSL, e, param);
		}
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryyslList", method = RequestMethod.GET)
    public String queryyslList(HttpSession session,Model model,WebRequest request) throws BusinessException{
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1 ;
        Integer upPage = 1 ;
        Integer downPage = 10 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        
        param.put("startDt", request.getParameter("startDt"));
		param.put("endDt", request.getParameter("endDt"));
		param.put("areaId", request.getParameter("areaId"));
		param.put("busitype", request.getParameter("busitype"));
		param.put("channelId", request.getParameter("channelId"));
		param.put("accnum", request.getParameter("accnum"));
		param.put("custname", request.getParameter("custname"));
		param.put("CustIdCard", request.getParameter("CustIdCard"));
		param.put("olNbr", request.getParameter("olNbr"));
        try{
    		nowPage = Integer.parseInt(request.getParameter("nowPage").toString());
    		pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
    		if(nowPage!=1){
    			upPage = (nowPage-1)*pageSize+1;
    			downPage = pageSize*nowPage;
    		}
    		param.put("nowPage", upPage);
    		param.put("pageSize", downPage);
    		
    		Map<String, Object> map = orderBmo.queryyslList(param, null, sessionStaff);
        	if(map!=null&&map.get("orderLists")!=null){
        		list =(List<Map<String, Object>>)map.get("orderLists");
        		totalSize = (Integer)map.get("totalCnt");
         	}
        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
            		nowPage,
            		pageSize,
            		totalSize<1?1:totalSize,
    				list);
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
	
	@RequestMapping(value = "/queryYslDetail", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryYslDetail(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		String status_cd = (String) param.get("status_cd");
		try{		
 			rMap = orderBmo.queryyslList(param, null, sessionStaff);
 			rMap.put("status_cd", status_cd);
			jsonResponse = super.successed(rMap,ResultConstant.SUCCESS.getCode());
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("查询业务类型失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QRY_BUSITYPE);
		} catch (Exception e) {
			log.error("预受理订单详情/queryYslDetail方法异常", e);
			return super.failed(ErrorCode.QUERY_ORDERYSL, e, param);
		}
	}

	/*订单时长*/
	@RequestMapping(value = "/createorderlonger", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse createorderlonger(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try{		
 			rMap = this.orderBmo.createorderlonger(param, null, sessionStaff);
			jsonResponse = super.successed(rMap.get("time"),ResultConstant.SUCCESS.getCode());
 			return jsonResponse;
		}catch(BusinessException be){
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.CREATE_ORDERLONGER);
		} catch (Exception e) {
			return super.failed(ErrorCode.CREATE_ORDERLONGER, e, param);
		}
	}

}

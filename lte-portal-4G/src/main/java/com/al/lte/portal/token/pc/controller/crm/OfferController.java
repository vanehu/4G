package com.al.lte.portal.token.pc.controller.crm;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 销售品控制层
 */
@Controller("com.al.lte.portal.token.pc.controller.crm.OfferController")
@RequestMapping("/token/pc/offer/*")
public class OfferController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	private OrderController orderController;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	
	/**
	 * 获取销售品规格构成
	 * @param reqMap
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/queryOfferSpec", method = RequestMethod.GET)
	@ResponseBody
    public JsonResponse queryOfferSpec(@RequestParam Map<String, Object> paramMap,Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		paramMap.put("channelId", sessionStaff.getCurrentChannelId());
		paramMap.put("staffId", sessionStaff.getStaffId());
        Map<String, Object> resMap = null;
        JsonResponse jsonResponse = null;
        try {
        	resMap = offerBmo.queryOfferSpecParamsBySpec(paramMap,null, sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_SPEC);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_SPEC, e, paramMap);
		}
		return jsonResponse;
    }	
    
	/**
	 * 获取销售品实例构成
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryOfferInst", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse queryOfferInst(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> resMap = new HashMap<String, Object>();
		JsonResponse jsonResponse = null;
		try {
			paramMap.put("staffId", sessionStaff.getStaffId());
			resMap = offerBmo.queryOfferInst(paramMap,null, sessionStaff);			
			jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_PARAM);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_PARAM, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取销售品实例参数
	 * @param reqMap
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/queryOfferParam", method = RequestMethod.GET)
	@ResponseBody
    public JsonResponse queryOfferParam(@RequestParam Map<String, Object> paramMap,Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		paramMap.put("channelId", sessionStaff.getCurrentChannelId());
		paramMap.put("staffId", sessionStaff.getStaffId());
        Map<String, Object> resMap = null;
        JsonResponse jsonResponse = null;
        try {
        	resMap = offerBmo.queryOfferParam(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_PARAM);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_PARAM, e, paramMap);
		}
		return jsonResponse;
    }
	
	/**
	 * 获取互斥依赖
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryExcludeDepend", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryExcludeDepend(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
        	Map<String, Object> resMap = offerBmo.queryExcludeDepend(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_EXCLUDE_DEPEND);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_EXCLUDE_DEPEND, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取功能产品互斥依赖
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryServExcludeDepend", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryServExcludeDepend(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
        	Map<String, Object> resMap = offerBmo.queryServExcludeDepend(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_EXCLUDE_DEPEND);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_EXCLUDE_DEPEND, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取附属销售品实例页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryAttachOffer", method = RequestMethod.GET)
	public String queryAttachOffer(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  null;	
		try{	
			paramMap =  JsonUtil.toObject(param, Map.class);
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute("labelMap",labelMap);
			model.addAttribute("labelMapJson", JsonUtil.buildNormal().objectToJson(labelMap));
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute("openMap",openMap);
			model.addAttribute("openMapJson", JsonUtil.buildNormal().objectToJson(openMap));
			model.addAttribute("prodId",paramMap.get("prodId"));
			model.addAttribute("param",paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
	 	return "/offer/attach-offer-change";
	}
	
	/**
	 * 查询已订购销售品和功能产品
	 * @param param
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryOpenedAttachAndServ", method = RequestMethod.GET)
	public @ResponseBody JsonResponse queryOpenedAttachAndServ(@RequestParam("strParam") String param){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  null;	
		JsonResponse jsonResponse = null;
        try {
        	paramMap = JsonUtil.toObject(param, Map.class);
        	Map<String, Object> resMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 套餐变更附属销售品页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryChangeAttachOffer", method = RequestMethod.GET)
	public String queryChangeAttachOffer(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  JsonUtil.toObject(param, Map.class);
		try{
			//已订购附属销售品查询
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute("openMap",openMap);
			model.addAttribute("openMapJson", JsonUtil.buildNormal().objectToJson(openMap));
			
			//可订购附属标签查询
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute("labelMap",labelMap);
			model.addAttribute("labelMapJson", JsonUtil.buildNormal().objectToJson(labelMap));
			
			model.addAttribute("prodId",paramMap.get("prodId"));
			model.addAttribute("param",paramMap);
		} catch (BusinessException e) {
			log.error("获取附属销售品变更页面失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
	 	return "/pctoken/offer/attach-offer";
	}
	
	/**
	 * 获取附属销售品规格页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/queryAttachSpec", method = RequestMethod.GET)
	public String queryAttachSpec(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		Map<String, Object> paramMap = new HashMap();
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);	
			paramMap =  JsonUtil.toObject(param, Map.class);
			
			//默认必开功能产品
			Map<String, Object> openServMap = offerBmo.queryServSpec(paramMap,null,sessionStaff);
			model.addAttribute("openServMap",openServMap);
			model.addAttribute("openServMapJson", JsonUtil.buildNormal().objectToJson(openServMap));
			
			//默认必开附属销售品
			paramMap.remove("queryType");
			paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
			Map<String, Object> openMap = offerBmo.queryMustAttOffer(paramMap,null,sessionStaff);
			model.addAttribute("openMap",openMap);
			model.addAttribute("openMapJson", JsonUtil.buildNormal().objectToJson(openMap));
			
			//可订购附属标签查询
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute("labelMap",labelMap);
			model.addAttribute("labelMapJson", JsonUtil.buildNormal().objectToJson(labelMap));
			
			model.addAttribute("prodId",paramMap.get("prodId"));	
			model.addAttribute("param",paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
	 	return "/pctoken/offer/attach-spec";
	}

	/**
	 * 查询默认必须附属销售品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryDefaultAndRequiredOfferSpec", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryDefaultAndRequiredOfferSpec(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
        	Map<String, Object> resMap = offerBmo.queryMustAttOffer(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 查询可订购附属销售品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryCanBuyAttachSpec", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryCanBuyAttachSpec(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
        	Map<String, Object> resMap = offerBmo.queryCanBuyAttachSpec(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.ATTACH_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 查询功能产品规格,(默认1，必须2，可订购3)
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryServSpec", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryServSpec(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = offerBmo.queryCanBuyServ(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.ATTACH_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取附属销售品查询页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/searchAttachOfferSpec", method = RequestMethod.GET)
	public String searchAttachOfferSpec(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		Map<String, Object> paramMap = new HashMap();
        try {
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);	
        	paramMap =  JsonUtil.toObject(URLDecoder.decode(param,"utf-8"), Map.class);
        	
        	//搜索可订购销售品
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
    		Map<String, Object> offerMap = offerBmo.queryCanBuyAttachSpec(paramMap,null,sessionStaff);
    		model.addAttribute("offerMap",offerMap);
    		
        	//搜索可订购功能产品
    		paramMap.put("matchString", paramMap.get("offerSpecName"));
    		Map<String, Object> servMap = offerBmo.queryCanBuyServ(paramMap,null,sessionStaff);
    		model.addAttribute("servMap",servMap);
    		
        	model.addAttribute("param",paramMap);
    		model.addAttribute("prodId",paramMap.get("prodId"));
    		if(paramMap.get("yslflag")!=null){
    			model.addAttribute("yslflag",paramMap.get("yslflag"));
    		}
        } catch (BusinessException be) {
        	return super.failedStr(model,be);
        } catch (InterfaceException ie) {
        	return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
		return "/offer/attach-offer-list";
	}
	
	/**
	 * 加载实例
	 * @param param
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/loadInst", method = {RequestMethod.GET})
	@ResponseBody
	public JsonResponse loadInst(@RequestParam Map<String, Object> paramMap,Model model) {
		JsonResponse jsonResponse = null;
		Map resMap = new HashMap();
        try {
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);	
        	resMap = offerBmo.loadInst(paramMap,null,sessionStaff);//加载实例		
        	if(ResultCode.R_SUCC.equals(resMap.get("code"))){
        		jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());	
        	}else{
        		jsonResponse = super.failed(resMap,ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        	}
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.LOAD_INST);
		} catch (Exception e) {
			return super.failed(ErrorCode.LOAD_INST, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取主副卡纳入老用户权限
	 */
	@RequestMapping(value = "/areaidJurisdiction", method = RequestMethod.GET)
	@ResponseBody
    public JsonResponse areaidJurisdiction(@RequestParam Map<String, Object> paramMap){
        JsonResponse jsonResponse = null;
			try {
				String flag = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),paramMap.get("areaid").toString());
				jsonResponse = super.successed(flag,ResultConstant.SUCCESS.getCode());
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			} catch (InterfaceException e) {
				e.printStackTrace();
			}
		return jsonResponse;
    }
	/**
	 * 获取附属销售品实例页面 (补换卡专用)
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryAttachOffer2", method = RequestMethod.GET)
	public String queryAttachOffer2(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  null;	
		try{	
			paramMap =  JsonUtil.toObject(param, Map.class);
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute("labelMap",labelMap);
			model.addAttribute("labelMapJson", JsonUtil.buildNormal().objectToJson(labelMap));
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute("openMap",openMap);
			model.addAttribute("openMapJson", JsonUtil.buildNormal().objectToJson(openMap));
			model.addAttribute("prodId",paramMap.get("prodId"));
			model.addAttribute("param",paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
	 	return "/offer/card-attach-offer-change";
	}
	/**
	 * 查询默认必须附属销售品  + 功能产品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryDefaultAndRequiredOfferSpecAndServ", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryDefaultAndRequiredOfferSpecAndServ(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
        	Map<String, Object> resMap = offerBmo.queryMustAttOfferServ(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_MUST_OFFER_SERV);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_MUST_OFFER_SERV, e, paramMap);
		}
		return jsonResponse;
	}
	
	//群号查询
//    @RequestMapping(value = "/getGroupList", method = RequestMethod.POST)
//    public String getGroupList(HttpSession session,Model model ,@RequestBody Map<String, Object> param) {
//    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
//                SysConstant.SESSION_KEY_LOGIN_STAFF);
//    	
//    	Integer totalSize = 1;
//    	List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
//    	String pageIndex = param.get("curPage")==null?"":param.get("curPage").toString();
//    	String pageSize = param.get("pageSize")==null?"":param.get("pageSize").toString();
//    	int iPage = 1;
//    	int iPageSize = 10 ;
//    	Map<String, Object> groupParm = new HashMap<String, Object>(param);
//    	try{
//    		iPage = Integer.parseInt(pageIndex);
//    		iPageSize = Integer.parseInt(pageSize) ;
//    		if(iPage>0){
//        		Map returnMap = offerBmo.queryGroupList(groupParm, null, sessionStaff);
//            	if(returnMap.get("totalSize")!=null){
//            		totalSize = Integer.parseInt(returnMap.get("totalSize").toString());
//            		if(totalSize>0){
//            			list = (List<Map<String, Object>>)returnMap.get("groupList");
//            		}
//            	}
//    		}
//    		PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
//        			iPage,
//        			iPageSize,
//        			totalSize<1?1:totalSize,
//        					list);
//        	model.addAttribute("pageModel", pm);
//    		model.addAttribute("pageParam", param);
//            return "/order/order-dialog-group";
//    	}catch(BusinessException be){
//    		return super.failedStr(model, be);
//		}catch(InterfaceException ie){
//			return super.failedStr(model, ie, param, ErrorCode.QUERY_GROUP_BASIC_INFO);
//		}catch(Exception e){
//			return super.failedStr(model, ErrorCode.QUERY_GROUP_BASIC_INFO, e, param);
//		}
//    	
//    }
	
	
	
	/**
	 * 可选包/服务变更
	 * @param params
	 * @param request
	 * @param httpSession
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/changePackageAndService", method = RequestMethod.GET)
    public String changePackageAndService(@RequestParam Map<String, Object> params, HttpServletRequest request,HttpSession httpSession,Model model,HttpSession session) throws AuthorityException {
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			
			String commonParamKey = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");//公共参数加密KEY
			
			String paramsJson=request.getParameter("params");
			
			//String paramsJson=(String) params.get("params");
			
			if(paramsJson==null){
				//参数为空，扔公共提示页面
				model.addAttribute("errorMsg", "参数丢失，请重试。");
				return "/common/error";
			}
			
			String jmParamsJson = AESUtils.decryptToString(paramsJson, commonParamKey);
			
			Map<String,Object> paramsMap = JsonUtil.toObject(jmParamsJson, HashMap.class);
			
			if(paramsMap == null || paramsMap.size() <= 0){		
				model.addAttribute("errorMsg", "参数丢失，请重试。");
				return "/common/error";
			}

//			paramsMap.put("provIsale","20150527001011");
//			paramsMap.put("provCustIdentityCd","1212");
//			paramsMap.put("custNumber","12");
//			paramsMap.put("provCustIdentityNum","10");
//			paramsMap.put("provCustAreaId","8330100");
//			paramsMap.put("actionFlag","14");
//			paramsMap.put("reloadFlag","Y");
//			paramsMap.put("isFee","1");
			
			//进行非空判断
			if(!checkParams(paramsMap)){
				model.addAttribute("errorMsg", "参数丢失，请重试");
				return "/common/error";
			}
			
			String provIsale=String.valueOf(paramsMap.get("provIsale"));
			String redirectUri=String.valueOf(paramsMap.get("redirectUri"));
			String isFee=String.valueOf(paramsMap.get("isFee"));
			String reloadFlag=String.valueOf(paramsMap.get("reloadFlag"));
			String provCustAreaId=String.valueOf(paramsMap.get("provCustAreaId"));
			
			//如果是二次加载，调用接口获取暂存单数据信息
			if("N".equals(reloadFlag)){
				Map<String,Object> paramMap = new HashMap<String,Object>();
				paramMap.put("provTransId", provIsale);
				paramMap.put("areaId",provCustAreaId);
				paramMap.put("backFlag","Y");
				Map<String, Object> orderMap = offerBmo.queryTemporaryOrder(paramMap, null, sessionStaff);
	
				if(orderMap!=null){
					String resultCode=String.valueOf(orderMap.get("resultCode"));
					
					if("2".equals(resultCode) || "-1".equals(resultCode)){
						model.addAttribute("errorMsg",orderMap.get("resultMsg"));
						return "/common/error";
					}
					
					String orderJson=JacksonUtil.objectToJson(orderMap);
					
					model.addAttribute("orderJson_", orderJson);
				}else{
					model.addAttribute("errorMsg", "获取暂存单信息失败!");
					return "/common/error";
				}
			}else{
				model.addAttribute("orderJson_", "{}");
			}
			
			//回调用页面中，初始化到JS中供订单使用
			model.addAttribute("acrNum", paramsMap.get("mainPhoneNum"));
			model.addAttribute("phoneNum_", paramsMap.get("mainPhoneNum"));
			model.addAttribute("provIsale_",provIsale);
			model.addAttribute("redirectUri_", redirectUri);
			model.addAttribute("isFee_",isFee);
			model.addAttribute("reloadFlag_",paramsMap.get("reloadFlag"));
			model.addAttribute("mktResInstCode_", paramsMap.get("mktResInstCode"));
			
			//放入流水作为唯一标识码
			session.setAttribute("provIsale_"+provIsale, provIsale);
			session.setAttribute("isFee_"+provIsale,isFee);
			
		}catch (BusinessException be) {
			log.error("可选包/业务变更服务加载异常：",be);
			model.addAttribute("errorMsg", super.failed(be));
			return "/common/error";
		} catch (InterfaceException ie) {
			log.error("可选包/业务变更服务加载异常：",ie);
			model.addAttribute("errorMsg", super.failed(ie, null, ErrorCode.QUERY_ORDERINFOS));
			return "/common/error";
		} catch (Exception e) {
			log.error("可选包/业务变更服务加载异常：",e);
			model.addAttribute("errorMsg", super.failed(ErrorCode.QUERY_ORDERINFOS, e, null));
			return "/common/error";
		}
		
		return "/pctoken/order/order-cust";
    }
	
	public Boolean checkParams(Map<String,Object> infoMap){
		boolean result=false;
		
		if(infoMap!=null && infoMap.size()!=0){
			Object provIsale=infoMap.get("provIsale");
			Object provCustIdentityCd=infoMap.get("provCustIdentityCd");
			Object custNumber=infoMap.get("custNumber");
			Object provCustIdentityNum=infoMap.get("provCustIdentityNum");
			Object provCustAreaId=infoMap.get("provCustAreaId");
			Object actionFlag=infoMap.get("actionFlag");
			Object reloadFlag=infoMap.get("reloadFlag");
			Object mainPhoneNum=infoMap.get("mainPhoneNum");
			Object isFee=infoMap.get("isFee");
			
			if(provIsale==null || provCustIdentityCd==null || custNumber==null || provCustIdentityNum==null || provCustAreaId==null
					|| actionFlag==null || reloadFlag==null || mainPhoneNum==null || isFee==null
			){
				return result;
			}else{
				result=true;
			}
		}
		
		return result;
	}
	
	public String custCreate(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession httpSession) throws BusinessException {
		Map map = new HashMap();
		Map resultMap = new HashMap();
		resultMap.put("isValidate", "true");
		map.put("result", resultMap);
		map.put("custInfo", param);
		model.addAttribute("custAuth", map);
		return "/cust/cust-info";
	}
	
	
	/**获取用户套餐等信息*/
	@SuppressWarnings("unchecked")
	public Map<String, Object> orderProd(Map<String, Object> param,String flowNum,SessionStaff sessionStaff) throws Exception {
		Map<String,Object> resultMap=new HashMap<String, Object>();
		resultMap.put("resultCode", ResultCode.R_FAIL);
		
		List<Map<String, Object>> list = null;
		
		//???不知道什么用途
		if (param.containsKey("isPurchase")) {
			param.remove("isPurchase");
		}
		
		//获取地市，如果空则获取用户身份地市
		String areaId=(String) param.get("areaId");
		
		if(areaId==null||areaId.equals("")){
			areaId=sessionStaff.getCurrentAreaId();
		}
		
		//调用接口，获取实例信息
		Map<String, Object> datamap = this.custBmo.queryCustProd(param,flowNum,sessionStaff);
		
		log.debug("调用实例返回信息为:", JsonUtil.toString(datamap));
		
		//获取返回信息编码
		String code = (String) datamap.get("resultCode");
		
		if (ResultCode.R_SUCC.equals(code)) {
			Map<String, Object> temMap=(Map<String, Object>) datamap.get("result");
			
			//获取具体的
			list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
					
			if (list!= null && list.size()!=0) {
				resultMap.put("resultCode", ResultCode.R_SUCC);
				resultMap.put("resultMsg", list.get(0));
			}
		}
			
		return resultMap;
	}
	
	/**
	 * 获取附属销售品实例页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryAttachOfferSub", method = RequestMethod.GET)
	public String queryAttachOfferSub(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  null;	
		try{	
			paramMap =  JsonUtil.toObject(param, Map.class);
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute("labelMap",labelMap);
			model.addAttribute("labelMapJson", JsonUtil.buildNormal().objectToJson(labelMap));
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute("openMap",openMap);
			model.addAttribute("openMapJson", JsonUtil.buildNormal().objectToJson(openMap));
			model.addAttribute("prodId",paramMap.get("prodId"));
			model.addAttribute("param",paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
	 	return "/pctoken/order/order-package-change";
	}
	
}

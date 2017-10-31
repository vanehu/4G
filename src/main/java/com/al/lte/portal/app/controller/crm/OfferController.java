package com.al.lte.portal.app.controller.crm;

import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
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
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 销售品控制层
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.app.controller.crm.OfferController")
@RequestMapping("/app/offer/*")
public class OfferController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
	private MktResBmo mktResBmo;
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	private String offerListUrl="/app/offer/attach-offer-list";
	
	private String newOfferListUrl="/app/order_new/attach-offer-list";
	
	private String ID_99999="99999";
	
	private String OFFER_IDS="OfferIds";
	
	private String AREA_ID="areaId";
	
	private String CHANNEL_ID="channelId";
	
	private String ENTER="enter";
	
	private String LABEL_MAP="labelMap";
	
	private String LABEL_MAP_JSON="labelMapJson";
	
	private String OFFER_SPEC_ID="offerSpecId";
	
	private String OFFER_SPEC_LIST="offerSpecList";
	
	private String OPEN_MAP="openMap";
	
	private String OPEN_MAP_JSON="openMapJson";
	
	private String OPERATORS_ID="operatorsId";
	
	private String PARAM="param";
	
	private String PROD_ID="prodId";
	
	private String QUERY_TYPE="queryType";
	
	private String RESULT="result";
	
	private String SPEC_IDS="specIds";
	
	private String STAFF_ID="staffId";
	
	private String SYS_FLAG="sysFlag";
	
	private String YSL_FLAG="yslflag";
	
	private String OPEN_SERV_MAP="openServMap";
	
	private String OPEN_SERV_MAP_JSON="openServMapJson";
	
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
		paramMap.put(AREA_ID, sessionStaff.getCurrentAreaId());
		paramMap.put(CHANNEL_ID, sessionStaff.getCurrentChannelId());
		paramMap.put(STAFF_ID, sessionStaff.getStaffId());
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
	@RequestMapping(value = "/queryOfferInst", method = {RequestMethod.GET,RequestMethod.POST})
	@ResponseBody
	public JsonResponse queryOfferInst(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> resMap = new HashMap<String, Object>();
		JsonResponse jsonResponse = null;
		try {
			paramMap.put(STAFF_ID, sessionStaff.getStaffId());
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
		paramMap.put(AREA_ID, sessionStaff.getCurrentAreaId());
		paramMap.put(CHANNEL_ID, sessionStaff.getCurrentChannelId());
		paramMap.put(STAFF_ID, sessionStaff.getStaffId());
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
        	paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
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
			model.addAttribute(LABEL_MAP,labelMap);
			model.addAttribute(LABEL_MAP_JSON, JsonUtil.buildNormal().objectToJson(labelMap));
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_MAP,openMap);
			model.addAttribute(OPEN_MAP_JSON, JsonUtil.buildNormal().objectToJson(openMap));
			model.addAttribute(PROD_ID,paramMap.get(PROD_ID));
			model.addAttribute(PARAM,paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
		String propertiesKey = "NEWUIFLAG_"+ (sessionStaff.getCurrentAreaId() + "").substring(0, 3);//新ui开关
		// 新UI开关
		String newUIFlag = propertiesUtils.getMessage(propertiesKey);
		if(("ON".equals(newUIFlag)|| newUIFlag==null) && paramMap.get("newFlag") != null){
			return "/app/order_new/attach-offer-change";
		}
	 	return "/app/offer/attach-offer-change";
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
			paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
			//已订购附属销售品查询
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_MAP,openMap);
			model.addAttribute(OPEN_MAP_JSON, JsonUtil.buildNormal().objectToJson(openMap));
			
			//可订购附属标签查询
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute(LABEL_MAP,labelMap);
			model.addAttribute(LABEL_MAP_JSON, JsonUtil.buildNormal().objectToJson(labelMap));
			
			model.addAttribute(PROD_ID,paramMap.get(PROD_ID));
			model.addAttribute(PARAM,paramMap);
		} catch (BusinessException e) {
			log.error("获取附属销售品变更页面失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
		String propertiesKey = "NEWUIFLAG_"+ (sessionStaff.getCurrentAreaId() + "").substring(0, 3);//新ui开关
		// 新UI开关
		String newUIFlag = propertiesUtils.getMessage(propertiesKey);
		if(("ON".equals(newUIFlag) || newUIFlag==null) && paramMap.get("newFlag") != null){
			return "/app/order_new/attach-offer";
		}
	 	return "/app/offer/attach-offer";
	}
	
	/**
	 * 套餐变更附属销售品页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryChangeAttachOfferSub", method = RequestMethod.GET)
	public String queryChangeAttachOfferSub(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  JsonUtil.toObject(param, Map.class);
		try{
			paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
			//默认必开功能产品
			Map<String, Object> openServMap = offerBmo.queryServSpec(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_SERV_MAP,openServMap);
			model.addAttribute(OPEN_SERV_MAP_JSON, JsonUtil.buildNormal().objectToJson(openServMap));
			
			//已订购附属销售品查询
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_MAP,openMap);
			model.addAttribute(OPEN_MAP_JSON, JsonUtil.buildNormal().objectToJson(openMap));
			
			//可订购附属标签查询
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute(LABEL_MAP,labelMap);
			model.addAttribute(LABEL_MAP_JSON, JsonUtil.buildNormal().objectToJson(labelMap));
			
			model.addAttribute(PROD_ID,paramMap.get(PROD_ID));
			model.addAttribute(PARAM,paramMap);
		} catch (BusinessException e) {
			log.error("获取附属销售品变更页面失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
	 	//return "/app/offer/attach-offer";
		return "/app/offer/attach-spec";
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
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);	
			
			paramMap =  JsonUtil.toObject(param, Map.class);
			paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
			//默认必开功能产品
			Map<String, Object> openServMap = offerBmo.queryServSpec(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_SERV_MAP,openServMap);
			model.addAttribute(OPEN_SERV_MAP_JSON, JsonUtil.buildNormal().objectToJson(openServMap));
			
			//默认必开附属销售品
			paramMap.remove(QUERY_TYPE);
			Map<String, Object> openMap = offerBmo.queryMustAttOffer(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_MAP,openMap);
			model.addAttribute(OPEN_MAP_JSON, JsonUtil.buildNormal().objectToJson(openMap));
			
			//可订购附属标签查询
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute(LABEL_MAP,labelMap);
			model.addAttribute(LABEL_MAP_JSON, JsonUtil.buildNormal().objectToJson(labelMap));
			
			model.addAttribute(PROD_ID,paramMap.get(PROD_ID));	
			model.addAttribute(PARAM,paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
		if(paramMap.get(ENTER)!=null){
			return "/app/order_new/attach-spec-new";
		}
	 	return "/app/offer/attach-spec";
	}
	
	/**
	 * 预受理-可选包查询页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/queryYslKxb",  method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	public String queryYslKxb(@RequestBody Map<String, Object> paramMap,Model model,HttpServletResponse response){
		//Map<String, Object> paramMap = new HashMap();
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);	
			paramMap.put(STAFF_ID, sessionStaff.getStaffId());
			paramMap.put(CHANNEL_ID, sessionStaff.getCurrentChannelId());
			paramMap.put(AREA_ID, sessionStaff.getCurrentAreaId());
			paramMap.put("partyId", sessionStaff.getCustId());
			paramMap.put(QUERY_TYPE, "1,2");
			paramMap.put("objType", "2");
			paramMap.put("objId", paramMap.get("prodSpecId"));
			//paramMap =  JsonUtil.toObject(param, Map.class);
			
			//查询销售品角色
			Map<String, Object> retnMap = new HashMap<String, Object>();
			
			//默认必开功能产品
			Map<String, Object> openServMap = offerBmo.queryServSpec(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_SERV_MAP,openServMap);
			model.addAttribute(OPEN_SERV_MAP_JSON, JsonUtil.buildNormal().objectToJson(openServMap));
			
			//默认必开附属销售品
			paramMap.remove(QUERY_TYPE);
			Map<String, Object> openMap = offerBmo.queryMustAttOffer(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_MAP,openMap);
			model.addAttribute(OPEN_MAP_JSON, JsonUtil.buildNormal().objectToJson(openMap));
			
			//可订购附属标签查询
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute(LABEL_MAP,labelMap);
			model.addAttribute(LABEL_MAP_JSON, JsonUtil.buildNormal().objectToJson(labelMap));
			
			model.addAttribute(PROD_ID,paramMap.get(PROD_ID));
			model.addAttribute(PARAM,paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
	 	return "/app/order/ysl-kxb";
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
		paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
        try {
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
        	paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
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
	@SuppressWarnings({ "rawtypes", "unchecked" })
	@RequestMapping(value = "/searchAttachOfferSpec", method = RequestMethod.GET)
	public String searchAttachOfferSpec(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		Map<String, Object> paramMap = new HashMap();
        try {
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
    				SysConstant.SESSION_KEY_LOGIN_STAFF);
        	paramMap =  JsonUtil.toObject(URLDecoder.decode(param,"utf-8"), Map.class);
        	//搜索可订购销售品
        	paramMap.put(OPERATORS_ID, sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():ID_99999);
        	paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
    		Map<String, Object> offerMap = offerBmo.queryCanBuyAttachSpec(paramMap,null,sessionStaff);
    		List<Integer> specIds=new ArrayList<Integer>(); //存放已选择可选包或功能id
    		if(paramMap.get(SPEC_IDS)!=null){
    			specIds=(List) paramMap.get(SPEC_IDS);
    		}
			if (offerMap != null) {
				Map result = (Map) offerMap.get(RESULT);
				if (result != null) {
					List<Map> offerSpecList = (List<Map>) result.get(OFFER_SPEC_LIST);
					List<Map> offerSpecList2 = new ArrayList<Map>();
					for (Map offerSpec : offerSpecList) {
						boolean flag=true;//未在已选择列表标志
						for (int id : specIds) {
							if ((id+"").equals(offerSpec.get(OFFER_SPEC_ID).toString())) {
								flag=false;
								break;
							}
						}
						if (flag) {
							offerSpecList2.add(offerSpec);
						}
					}
					result.put(OFFER_SPEC_LIST, offerSpecList2);
					offerMap.put(RESULT, result);
				}
				model.addAttribute("offerMap", offerMap);
			}
        	//搜索可订购功能产品
    		paramMap.put("matchString", paramMap.get("offerSpecName"));
    		Map<String, Object> servMap = offerBmo.queryCanBuyServ(paramMap,null,sessionStaff);
			if (servMap != null) {
				Map result = (Map) servMap.get(RESULT);
				if (result != null) {
					List<Map> serverSpecList = (List<Map>) result.get("servSpec");
					List<Map> serverSpecList2 = new ArrayList<Map>();
					for (Map serverSpec : serverSpecList) {
						boolean flag=true;//未在已选择列表标志
						for (int id : specIds) {
							if ((id+"").equals(serverSpec.get("servSpecId").toString())) {
								flag=false;
								break;
							}
						}
						if (flag) {
							serverSpecList2.add(serverSpec);
						}
					}
					result.put("servSpec", serverSpecList2);
					servMap.put(RESULT, result);
				}
				model.addAttribute("servMap", servMap);
			}		
        	model.addAttribute(PARAM,paramMap);
    		model.addAttribute(PROD_ID,paramMap.get(PROD_ID));
    		if(paramMap.get(YSL_FLAG)!=null){
    			model.addAttribute(YSL_FLAG,paramMap.get(YSL_FLAG));
    		}
        } catch (BusinessException be) {
        	return super.failedStr(model,be);
        } catch (InterfaceException ie) {
        	return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
        if(paramMap.get(ENTER)!=null){//新版ui
        	return newOfferListUrl;
        }
		return offerListUrl;
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
			paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
			Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
			model.addAttribute(LABEL_MAP,labelMap);
			model.addAttribute(LABEL_MAP_JSON, JsonUtil.buildNormal().objectToJson(labelMap));
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_MAP,openMap);
			model.addAttribute(OPEN_MAP_JSON, JsonUtil.buildNormal().objectToJson(openMap));
			model.addAttribute(PROD_ID,paramMap.get(PROD_ID));
			model.addAttribute(PARAM,paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
	 	return "/offer/card-attach-offer-change";
	}
	
	@RequestMapping(value = "/queryOfferAndServDependForCancel", method = {RequestMethod.POST})
	public @ResponseBody JsonResponse queryOfferAndServDependForCancel(@RequestBody Map<String, Object> paramMap) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		paramMap.put(OPERATORS_ID, sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():ID_99999);
		paramMap.put(CHANNEL_ID, sessionStaff.getCurrentChannelId());
		paramMap.put(AREA_ID, sessionStaff.getAreaId());
		paramMap.put(STAFF_ID, sessionStaff.getStaffId());
		
        try {
			//已订购附属销售品查询
        	Map<String, Object> openMap = offerBmo.queryOfferAndServDependForCancel(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(openMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_SERVDEPEND_FORCANCEL);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_SERVDEPEND_FORCANCEL, e, paramMap);
		}
		return jsonResponse;
	}

	
	/**
	 * 查询宽带续约可订购包
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryCanBuyAttachBroad", method = {RequestMethod.GET})
	public String queryCanBuyAttachBroad(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
        	Map<String, Object> resMap = offerBmo.queryCanBuyAttachSpec(paramMap,null,sessionStaff);
        	model.addAttribute(PARAM,paramMap);
        	model.addAttribute("canMap",resMap);
        	model.addAttribute(PROD_ID,paramMap.get(PROD_ID));
        } catch (BusinessException be) {
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.ATTACH_OFFER, e, paramMap);
		}
	 	return "/app/offer/attach-broad-change";
	}

	/**
	 * 收藏销售品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/addMyfavorite", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse addMyfavorite(@RequestParam Map<String, Object> paramMap,Model model,HttpSession httpSession) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = offerBmo.addMyfavorite(paramMap,null,sessionStaff);
        	if(ResultCode.R_SUCC.equals(resMap.get("resultCode")+"")){
        		if(paramMap.get("main")!=null){//刷新收藏的主套餐ids
        			String ids = httpSession.getAttribute(OFFER_IDS).toString();
        			ids += paramMap.get(OFFER_SPEC_ID).toString()+",";
        			httpSession.setAttribute(OFFER_IDS, ids);
        		}
				jsonResponse = super.successed(resMap,
						ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(resMap.get("msg"),
						Integer.parseInt(resMap.get("code").toString()));
			}
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ADD_MY_FAVORITE);
		} catch (Exception e) {
			return super.failed(ErrorCode.ADD_MY_FAVORITE, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 删除收藏夹中销售品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/delMyfavorite", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse delMyfavorite(@RequestParam Map<String, Object> paramMap,Model model,HttpSession httpSession) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = offerBmo.delMyfavorite(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        	if(paramMap.get("main")!=null){//刷新收藏的主套餐ids
    			String ids = httpSession.getAttribute(OFFER_IDS).toString();
    			String id = paramMap.get(OFFER_SPEC_ID).toString()+",";
    			ids = ids.replace(id,"");
    			httpSession.setAttribute(OFFER_IDS, ids);
    		}
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.DEL_MY_FAVORITE);
		} catch (Exception e) {
			return super.failed(ErrorCode.DEL_MY_FAVORITE, e, paramMap);
		}
		return jsonResponse;
	}

	 /* 查询我的收藏
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryMyfavorite", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryMyfavorite(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
        	paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
        	paramMap.put(OPERATORS_ID, sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():ID_99999);
        	Map<String, Object> resMap = offerBmo.queryMyfavorite(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_MY_FAVORITE);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_MY_FAVORITE, e, paramMap);
		}
		return jsonResponse;
	}

	/**
	 * 查询合约
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	@RequestMapping(value = "/queryAgreementAttachOfferSpec", method = RequestMethod.GET)
	public String queryAgreementAttachOfferSpec(@RequestParam("strParam") String param,Model model,HttpServletResponse response,@LogOperatorAnn String flowNum){
		Map<String, Object> paramMap = new HashMap();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);	
		try {
			paramMap =  JsonUtil.toObject(URLDecoder.decode(param,"utf-8"), Map.class);
			paramMap.put("receiveFlag","1");
			paramMap.put("channelName",sessionStaff.getCurrentChannelName());
			Map<String, Object> mktRes = mktResBmo.checkTermCompVal(
					paramMap, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(mktRes) && ResultCode.R_SUCC.equals(mktRes.get("code"))) {
				paramMap.put("mktResCd",mktRes.get("mktResId"));
			}else{
				if(paramMap.get(ENTER)!=null){//新版ui
		        	return newOfferListUrl;
		        }
				return offerListUrl;
			}
		} catch (BusinessException be) {
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.CHECK_TERMINAL);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.CHECK_TERMINAL, e, paramMap);
		}
        try {
			paramMap.put("agreementType","");
			Map<String, Object> offerByMtkResCdMap = mktResBmo.queryOfferByMtkResCd(paramMap, flowNum, sessionStaff);
			if(paramMap.get(YSL_FLAG)!=null){
    			model.addAttribute(YSL_FLAG,paramMap.get(YSL_FLAG));
    		}
			List<Integer> specIds=new ArrayList<Integer>(); //存放已选择可选包或功能id
    		if(paramMap.get(SPEC_IDS)!=null){
    			specIds=(List) paramMap.get(SPEC_IDS);
    		}
			if (offerByMtkResCdMap != null) {
				Map result = (Map) offerByMtkResCdMap.get(RESULT);
				if (result != null) {
					List<Map> offerSpecList = (List<Map>) result.get("agreementOfferList");
					List<Map> offerSpecList2 = new ArrayList<Map>();
					for (Map offerSpec : offerSpecList) {
						boolean flag=true;//未在已选择列表标志
						for (int id : specIds) {
							if ((id+"").equals(offerSpec.get(OFFER_SPEC_ID).toString())) {
								flag=false;
								break;
							}
						}
						if (flag) {
							offerSpecList2.add(offerSpec);
						}
					}
					result.put(OFFER_SPEC_LIST, offerSpecList2);
					offerByMtkResCdMap.put(RESULT, result);
				}
				model.addAttribute("offerByMtkResCdMap", offerByMtkResCdMap);
			}
        } catch (BusinessException be) {
        	return super.failedStr(model,be);
        } catch (InterfaceException ie) {
        	return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
        if(paramMap.get(ENTER)!=null){//新版ui
        	return newOfferListUrl;
        }
		return offerListUrl;
	}

	/**
	 * 获取礼包成员规格构成
	 * @param reqMap
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/queryGiftPackageSpec", method = RequestMethod.GET)
	@ResponseBody
    public JsonResponse queryGiftPackageSpec(@RequestParam Map<String, Object> paramMap,Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		paramMap.put(AREA_ID, sessionStaff.getCurrentAreaId());
		paramMap.put(CHANNEL_ID, sessionStaff.getCurrentChannelId());
		paramMap.put(STAFF_ID, sessionStaff.getStaffId());
        Map<String, Object> resMap = null;
        JsonResponse jsonResponse = null;
        try {
        	resMap = orderBmo.queryGiftPackageMemberList(paramMap,null, sessionStaff);
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
	 * 获取礼包订购功能产品页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/queryOfferServerSpec", method = RequestMethod.GET)
	public String queryOfferServerSpec(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		Map<String, Object> paramMap = new HashMap();
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);	
			
			paramMap =  JsonUtil.toObject(param, Map.class);
			paramMap.put(SYS_FLAG, Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
			//默认必开功能产品
			Map<String, Object> openServMap = offerBmo.queryServSpec(paramMap,null,sessionStaff);
			model.addAttribute(OPEN_SERV_MAP,openServMap);
			model.addAttribute(OPEN_SERV_MAP_JSON, JsonUtil.buildNormal().objectToJson(openServMap));			
			model.addAttribute(PROD_ID,paramMap.get(PROD_ID));	
			model.addAttribute(PARAM,paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
	 	return "/app/order_new/gift-server-new";
	}
	
	/* 已订购销售品次数下省查询接口
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryProdOfferOrderTimes", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse queryProdOfferOrderTimes(@RequestBody Map<String, Object> param,HttpServletResponse response,HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		HttpSession session = request.getSession();
		List<Map> channelList = (List<Map>)session.getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL);
		for(int i=0;i<channelList.size();i++){
			Map cl = channelList.get(i);
			if(sessionStaff.getCurrentChannelId().equals(cl.get("id").toString())){
				param.put("areaId", cl.get("areaId").toString());
			}
		}
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = offerBmo.queryProdOfferOrderTimes(param,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, param, ErrorCode.QUERY_PROD_OFFER_TIMES);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_PROD_OFFER_TIMES, e, param);
		}
		return jsonResponse;
	}
}

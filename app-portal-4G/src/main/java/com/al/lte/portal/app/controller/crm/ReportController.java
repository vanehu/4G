package com.al.lte.portal.app.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
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
import org.springframework.web.context.request.WebRequest;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.lte.portal.bmo.crm.CartBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.StringUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.app.controller.crm.ReportController")
@RequestMapping("/app/report/*")
public class ReportController extends com.al.lte.portal.controller.crm.ReportController {
	@Autowired
	PropertiesUtils propertiesUtils;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CartBmo")
	private CartBmo cartBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	 @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
    private MktResBmo mktResBmo;
	private String dateFormat = "yyyy/MM/dd";
	/**
	 * 订单查询页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/cartMain", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String main(@RequestBody Map<String, Object> param,HttpServletRequest request,Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/cartMain"));
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat(dateFormat);
		String startTime = f.format(c.getTime());
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
		model.addAttribute("p_startDt", startTime);
		model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
		model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
		model.addAttribute("p_channelId", sessionStaff.getCurrentChannelId());
		if(param.get("newFlag")!=null){				
			return "/app/cart_new/cart-main";	//新版ui
		} 
		return "/app/cart/cart-main";		
	}
	

	 /**
		 * 转至费用详情查询页面  -手机客户端  
		 * @param model
		 * @param session
		 * @param flowNum
		 * @return
		 * @throws AuthorityException
		 */
		@RequestMapping(value = "/freeInfoMain", method = RequestMethod.POST)
	    public String freeInfoMain(@RequestBody Map<String, Object> param,Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
			model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/cartMain"));
			
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
			
			Calendar c = Calendar.getInstance();
			SimpleDateFormat f = new SimpleDateFormat(dateFormat);
			String endTime = f.format(c.getTime());
			c.add(Calendar.DATE, -7);
			String startTime = f.format(c.getTime());
			Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
			
			model.addAttribute("p_startDt", startTime);
			model.addAttribute("p_endDt", endTime);
			model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
			model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
			model.addAttribute("p_channelId", sessionStaff.getCurrentChannelId());
			if(param.get("newFlag")!=null){				
				return "/app/cart_new/order-fee-main";	//新版ui
			} 
			return "/app/order/order-fee-main";
		}
			
	    @SuppressWarnings("unchecked")
		@RequestMapping(value = "/freeInfoList", method = RequestMethod.GET)
	    public String freeInfoList(HttpSession session,Model model,WebRequest request) throws BusinessException{
	        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                SysConstant.SESSION_KEY_LOGIN_STAFF);
	        Map<String, Object> param = new HashMap<String, Object>();
	        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
	        Integer pageIndex = 1 ;
	        Integer pageSize = 10 ;
	        Integer totalSize = 0 ;
	        
	        param.put("startDate", request.getParameter("startDate") + "000000");
	        param.put("endDate", request.getParameter("endDate") + "235959");
	        
	        
	        
//			param.put("endDt", request.getParameter("endDt"));
//			param.put("areaId", request.getParameter("areaId"));
//			param.put("qryBusiOrder", request.getParameter("qryBusiOrder"));
//			
//			param.put("channelId", request.getParameter("channelId"));
//			param.put("busiStatusCd", request.getParameter("busiStatusCd"));
//			param.put("olStatusCd", request.getParameter("olStatusCd"));
//			param.put("qryNumber", request.getParameter("qryNumber"));
//			param.put("olNbr", request.getParameter("olNbr"));
//			
//			//param.put("qryBusiOrder", "1");
//			param.put("qryCnt", "Y");
//			param.put("qryTime", "1");
			
	        try{
	        	pageIndex = Integer.parseInt(request.getParameter("pageIndex").toString());
	    		pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
	    		param.put("pageIndex", pageIndex);
	    		param.put("pageSize", pageSize);
	    		
	    		Map<String, Object> map = orderBmo.qryFeeInfoList(param, null, sessionStaff);
	        	if(map!=null&&map.get("feeInfoList")!=null){
	        		list =(List<Map<String, Object>>)map.get("feeInfoList");
	        		//totalSize = (Integer)map.get("totalCnt");
	        		totalSize = 0;
	        		
	        		// 将应收金额和实收金额格式化为以元为单位
	        		for (Map<String, Object> it : list) {
	        			it.put("receivableAmount", StringUtil.transformToYuan((String) it.get("receivableAmount")));
	        			it.put("realAmount", StringUtil.transformToYuan((String) it.get("realAmount")));
	        		}
	        	}
	        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
	        			pageIndex,
	            		pageSize,
	            		totalSize<1?1:totalSize,
	    				list);
	    		model.addAttribute("pageModel", pm);
	    		model.addAttribute("code", map.get("code"));
				model.addAttribute("mess", map.get("mess"));
				if(request.getParameter("newFlag")!=null){
					return "/app/cart_new/order-fee-list";//新版ui
				}
				return "/app/order/order-fee-list";
		    } catch (BusinessException be) {
	           return super.failedStr(model, be);
			} catch (InterfaceException ie) {
	            return super.failedStr(model, ie, param, ErrorCode.QURYTE_FEE_INFO);
			} catch (Exception e) {
				return super.failedStr(model, ErrorCode.QURYTE_FEE_INFO, e, param);
			}
	    }
	    
	    /**
		 * 转至终端销售查询页面  -手机客户端  
		 * @param model
		 * @param session
		 * @param flowNum
		 * @return
		 * @throws AuthorityException
		 */
		@RequestMapping(value = "/terminalSalesMain", method = RequestMethod.POST)
	    public String terminalSalesMain(@RequestBody Map<String, Object> param,Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
			model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/cartMain"));
			
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
			
			Calendar c = Calendar.getInstance();
			SimpleDateFormat f = new SimpleDateFormat(dateFormat);
			String endTime = f.format(c.getTime());
			c.add(Calendar.DATE, -7);
			String startTime = f.format(c.getTime());
			Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
			
			model.addAttribute("p_startDt", startTime);
			model.addAttribute("p_endDt", endTime);
			model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
			model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
			model.addAttribute("p_channelId", sessionStaff.getCurrentChannelId());
			if(param.get("newFlag")!=null){//跳转新ui
				return "/app/cart_new/terminal-sales-main";
			}
			return "/app/mktRes/terminal-sales-main";
		}
			
	    @SuppressWarnings("unchecked")
		@RequestMapping(value = "/terminalSalesList", method = RequestMethod.GET)
	    public String terminalSalesList(HttpSession session,Model model,WebRequest request) throws BusinessException{
	        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                SysConstant.SESSION_KEY_LOGIN_STAFF);
	        Map<String, Object> param = new HashMap<String, Object>();
	        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
	        Integer pageIndex = 1 ;
	        Integer pageSize = 10 ;
	        Integer totalSize = 0 ;
	        
	        param.put("startDate", request.getParameter("startDate") + "000000");
	        param.put("endDate", request.getParameter("endDate") + "235959");
			param.put("areaId", request.getParameter("areaId"));
			//param.put("qryBusiOrder", request.getParameter("qryBusiOrder"));
			param.put("channelId", request.getParameter("channelId"));
			//param.put("busiStatusCd", request.getParameter("busiStatusCd"));
			//param.put("olStatusCd", request.getParameter("olStatusCd"));
			//param.put("qryNumber", request.getParameter("qryNumber"));
			//param.put("olNbr", request.getParameter("olNbr"));
			
			//param.put("qryBusiOrder", "1");
			//param.put("qryCnt", "Y");
			//param.put("qryTime", "1");
			
	        try{
	        	pageIndex = Integer.parseInt(request.getParameter("pageIndex").toString());
	    		pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
	    		param.put("pageIndex", pageIndex);
	    		param.put("pageSize", pageSize);
	    		
	    		Map<String, Object> map = mktResBmo.qryTermSalesInfoList(param, null, sessionStaff);
	        	if(map!=null&&map.get("termSalesInfoList")!=null){
	        		list =(List<Map<String, Object>>)map.get("termSalesInfoList");
	        		//totalSize = (Integer)map.get("totalCnt");
	        		totalSize = 0;
	        	}
	        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
	        			pageIndex,
	            		pageSize,
	            		totalSize<1?1:totalSize,
	    				list);
	    		model.addAttribute("pageModel", pm);
	    		model.addAttribute("code", map.get("code"));
				model.addAttribute("mess", map.get("mess"));
				if(request.getParameter("newFlag")!=null){
					return "/app/cart_new/terminal-sales-list";//新版ui
				}
				return "/app/mktRes/terminal-sales-list";
		    } catch (BusinessException be) {
	           return super.failedStr(model, be);
			} catch (InterfaceException ie) {
	            return super.failedStr(model, ie, param, ErrorCode.QURYTE_TRMSALES_INFO);
			} catch (Exception e) {
				return super.failedStr(model, ErrorCode.QURYTE_TRMSALES_INFO, e, param);
			}
	    }
	/**
	 * 统计-受理订单查询
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/statisticsCartMain", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String statisticsCartMain(@RequestBody Map<String, Object> param,Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/statisticsCartMain"));
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat(dateFormat);
		String endTime = f.format(c.getTime());
		c.add(Calendar.DATE, -7);
		String startTime = f.format(c.getTime());
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
		model.addAttribute("p_startDt", startTime);
		model.addAttribute("p_endDt", endTime);
		model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
		model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
		model.addAttribute("p_channelId", sessionStaff.getCurrentChannelId());
		model.addAttribute("queryType", "tj");//表示统计
		if(param.get("newFlag")!=null){//跳转新ui
			return "/app/cart_new/cart-main";
		}
		return "/app/cart/statistics-cart-main";		
	}
	/**
	 * 统计-竣工订单查询
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/statisticsCompleteCartMain", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String statisticsCompleteCartMain(@RequestBody Map<String, Object> param,Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/statisticsCartMain"));
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat(dateFormat);
		String endTime = f.format(c.getTime());
		c.add(Calendar.DATE, -7);
		String startTime = f.format(c.getTime());
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
		model.addAttribute("p_startDt", startTime);
		model.addAttribute("p_endDt", endTime);
		model.addAttribute("status", "301200"); // 竣工状态
		model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
		model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
		model.addAttribute("p_channelId", sessionStaff.getCurrentChannelId());
		model.addAttribute("queryType", "tj");//表示统计
		if(param.get("newFlag")!=null){//跳转新ui
			return "/app/cart_new/cart-main";
		}
		return "/app/cart/statistics-cart-main";		
	}
	
	/**
	 * 总量查询 - 手机客户端
	 * 
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/qryCountInfoList", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse qryCountInfoList(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = new JsonResponse();
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyyMMdd");
		String endTime = f.format(c.getTime());
		// c.add(Calendar.DATE, );
		String startTime = f.format(c.getTime());
		param.put("startDate", startTime +"000000");
		param.put("endDate", endTime +"235959");
		param.put("pageIndex", 1);
		param.put("pageSize", 10);
		try {
			rMap = orderBmo.qryCountInfoList(param, flowNum, sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCC.equals(rMap.get("resultCode")
							.toString())) {
				jsonResponse = super.successed(rMap.get("result"),
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap, 1);
			}

		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QURYTE_COUNT_INFO);
		} catch (Exception e) {
			return super.failed(ErrorCode.QURYTE_COUNT_INFO, e, param);
		}
		return jsonResponse;
	}

	/**
	 * 受理单列表查询
	 * @param session
	 * @param model
	 * @param request
	 * @return
	 * @throws BusinessException
	 */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/cartList", method = RequestMethod.GET)
    public String list(HttpSession session,Model model,WebRequest request) throws BusinessException{
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        
        param.put("startDt", request.getParameter("startDt"));
		param.put("endDt", request.getParameter("endDt"));
		param.put("areaId", request.getParameter("areaId"));
		param.put("qryBusiOrder", request.getParameter("qryBusiOrder"));
		
		param.put("channelId", request.getParameter("channelId"));
		param.put("busiStatusCd", request.getParameter("busiStatusCd"));
		param.put("olStatusCd", request.getParameter("olStatusCd"));
		param.put("qryNumber", request.getParameter("qryNumber"));
		param.put("olNbr", request.getParameter("olNbr"));
		param.put("olTypeCd", Const.OL_TYPE_CD);
		param.put("qryCnt", "Y");
		param.put("qryTime", "1");
		
        try{
    		nowPage = Integer.parseInt(request.getParameter("nowPage").toString());
    		pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
    		param.put("nowPage", nowPage);
    		param.put("pageSize", pageSize);
    		
    		Map<String, Object> map = cartBmo.queryCarts(param, null, sessionStaff);
        	if(map!=null&&map.get("orderLists")!=null){
        		list =(List<Map<String, Object>>)map.get("orderLists");
        		totalSize = (Integer)map.get("totalCnt");
        		//判断某个购物车是否为新装，取订购销售品节点的subBusiOrders，判断是否有产品新装
        		for (int i = 0; list != null && i < list.size(); i++) {
        			Map<String, Object> cartMap = list.get(i);
        			List<Map<String, Object>> orderList = (List<Map<String, Object>>) cartMap.get("list");
        			boolean newProdFlag = false;
        			cartMap.put("newProdFlag", "false");
        			for (int j = 0; orderList != null && j < orderList.size(); j++) {
        				Map<String, Object> orderMap = orderList.get(j);
        				String actionClass = MapUtils.getString(orderMap, "actionClass", "");
        				String boActionTypeCd = MapUtils.getString(orderMap, "boActionTypeCd", "");
        				if ("1200".equals(actionClass) && "S1".equals(boActionTypeCd)) {
        					List<Map<String, Object>> subList = (List<Map<String, Object>>) orderMap.get("subBusiOrders");
        					for (int k = 0; subList != null && k < subList.size(); k++) {
        						Map<String, Object> subMap = subList.get(k);
        						String subActionClass = MapUtils.getString(subMap, "actionClass", "");
                				String subBoActionTypeCd = MapUtils.getString(subMap, "boActionTypeCd", "");
                				if ("1300".equals(subActionClass) && "1".equals(subBoActionTypeCd)) {
                					newProdFlag = true;
                					break;
                				}
        					}
        				}
        				if (newProdFlag) {
        					break;
        				}
        			}
        			if (newProdFlag) {
        				cartMap.put("newProdFlag", "true");
        				list.set(i, cartMap);
        			}
        		}
        		
         	}
        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
            		nowPage,
            		pageSize,
            		totalSize<1?1:totalSize,
    				list);
    		model.addAttribute("pageModel", pm);
    		model.addAttribute("code", map.get("code"));
			model.addAttribute("mess", map.get("mess"));
			
			
			if(request.getParameter("newFlag")!=null){
				return "/app/cart_new/cart-list";//新版ui
			}
        	return "/app/cart/cart-list";
        } catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.CUST_ORDER);
		} catch (Exception e) {
			log.error("购物车查询/app/report/cartList方法异常", e);
			return super.failedStr(model, ErrorCode.CUST_ORDER, e, param);
		}
    }
    
    @RequestMapping(value = "/cartInfo", method = RequestMethod.GET)
    public String orderDetail(WebRequest request,Model model,HttpSession session,@RequestParam Map<String, Object> paramMap) throws BusinessException{
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	paramMap.put("user", "");
    	Map cartInfo = null;
		try {
			cartInfo = cartBmo.queryCartOrder(paramMap, null, sessionStaff);
			model.addAttribute("cart", cartInfo);
			model.addAttribute("code", cartInfo.get("code"));
			model.addAttribute("mess", cartInfo.get("mess"));
			model.addAttribute("olId", MapUtils.getString(paramMap, "olId", ""));
			if(request.getParameter("newFlag")!=null){
				return "/app/cart_new/cart-info";//新版ui
			}
	    	return "/app/cart/cart-info";
	    	
		} catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, paramMap, ErrorCode.CUST_ORDER_DETAIL);
		} catch (Exception e) {
			log.error("购物车详情/report/cartInfo方法异常", e);
			return super.failedStr(model, ErrorCode.CUST_ORDER_DETAIL, e, paramMap);
		}
    }
    /**
     * 订单详情查询
     * @param request
     * @param model
     * @param session
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/cartOfferInfo", method = RequestMethod.GET)
    public String cartDetail(HttpServletRequest request,Model model,HttpSession session) throws BusinessException{
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	Map param = new HashMap();
    	String olId = request.getParameter("olId");
    	String boId = request.getParameter("boId");
    	String offerId = request.getParameter("offerId");
    	String prodId = request.getParameter("prodId");
    	
    	param.put("olId", olId);
    	param.put("boId", boId);
    	param.put("offerId", offerId);
    	param.put("prodId", prodId);
    	//param.put("rela_type_cd", "");
    	param.put("user", "so");
    	
    	Map order = null;
		try {
			order = cartBmo.queryCartOrderInfo(param, null, sessionStaff);
			String isViewOperation = EhcacheUtil.getOperatCode(SysConstant.VIEWSENSI_CODE,SysConstant.SESSION_KEY_VIEWSENSI,request, sessionStaff);
			model.addAttribute("isViewOperation", isViewOperation);
			model.addAttribute("order", order);
			model.addAttribute("code", order.get("code"));
			model.addAttribute("mess", order.get("mess"));
			model.addAttribute("boId", boId);
	    	return "/app/cart/order-item-detail";
		} catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.CUST_ITEM_DETAIL);
		} catch (Exception e) {
			log.error("购物车详情/report/cartOfferInfo方法异常", e);
			return super.failedStr(model, ErrorCode.CUST_ITEM_DETAIL, e, param);
		}
    }
    
	/**
	 * 受理单列表查询
	 * @param session
	 * @param model
	 * @param request
	 * @return
	 * @throws BusinessException
	 */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/cartListTj", method = RequestMethod.GET)
    public String cartListTj(HttpSession session,Model model,WebRequest request) throws BusinessException{
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        String startDt=request.getParameter("startDt");
        String endDt=request.getParameter("endDt");
        if(startDt!=null){
        	startDt=startDt.replaceAll("-", "")+"000000";
        }
        if(endDt!=null){
        	endDt=endDt.replaceAll("-", "")+"235959";
        }
        param.put("startDt", startDt);
		param.put("endDt", endDt);
		param.put("areaId", request.getParameter("areaId"));
		param.put("qryBusiOrder", request.getParameter("qryBusiOrder"));
		
		param.put("channelId", request.getParameter("channelId"));
		param.put("busiStatusCd", request.getParameter("busiStatusCd"));
		param.put("olStatusCd", request.getParameter("olStatusCd"));
		param.put("qryNumber", request.getParameter("qryNumber"));
		param.put("olNbr", request.getParameter("olNbr"));
		param.put("olTypeCd", Const.OL_TYPE_CD);
		param.put("qryCnt", "Y");
		param.put("qryTime", "1");
		param.put("pageType", "monitor");
		
        try{
    		nowPage = Integer.parseInt(request.getParameter("nowPage").toString());
    		pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
    		param.put("nowPage", nowPage);
    		param.put("pageSize", pageSize);
    		
    		Map<String, Object> map = cartBmo.queryCartsForTj(param, null, sessionStaff);
        	if(map!=null&&map.get("orderList")!=null){
        		list =(List<Map<String, Object>>)map.get("orderList");
        		totalSize = (Integer)map.get("totalCnt");       		
         	}
        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
            		nowPage,
            		pageSize,
            		totalSize<1?1:totalSize,
    				list);
    		model.addAttribute("pageModel", pm);
    		model.addAttribute("code", map.get("code"));
			model.addAttribute("mess", map.get("mess"));			
		    return "/app/cart_new/cart-list-tj";//新版ui
        } catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.CUST_ORDER);
		} catch (Exception e) {
			log.error("购物车查询/app/report/cartList方法异常", e);
			return super.failedStr(model, ErrorCode.CUST_ORDER, e, param);
		}
    }
}

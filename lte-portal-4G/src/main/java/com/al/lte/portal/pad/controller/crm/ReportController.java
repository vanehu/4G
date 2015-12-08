package com.al.lte.portal.pad.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.context.request.WebRequest;

import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CartBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.ReportBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.pad.controller.crm.ReportController")
@RequestMapping("/pad/report/*")
public class ReportController extends  BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.ReportBmo")
	private ReportBmo reportBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CartBmo")
	private CartBmo cartBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	/**
	 * 转至受理订单查询页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/cartMain", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(@RequestParam("strParam") String param,Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/cartMain"));
		
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
		model.addAttribute("pageType", "detail");
		
		return "/pad/cart/cart-main";		
	}
	/**
	 * 购物车列表查询
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
		
		//param.put("qryBusiOrder", "1");
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
			model.addAttribute("pageType", request.getParameter("pageType")); //link:环节显示 detail:详情显示
			
			String refundFlag=request.getParameter("refundFlag");
			if(refundFlag!=null&&"refund".equals(refundFlag)){
	        	return "/charge/order-refund-list";
	        }else{
	        	return "/pad/cart/cart-list";
	        }
        } catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.CUST_ORDER);
		} catch (Exception e) {
			log.error("购物车查询/report/cartList方法异常", e);
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
	    	return "/pad/cart/cart-info";
	    	
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
	    	return "/pad/cart/order-item-detail";
		} catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.CUST_ITEM_DETAIL);
		} catch (Exception e) {
			log.error("购物车详情/report/cartOfferInfo方法异常", e);
			return super.failedStr(model, ErrorCode.CUST_ITEM_DETAIL, e, param);
		}
    }
}

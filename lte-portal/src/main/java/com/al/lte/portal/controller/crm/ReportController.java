package com.al.lte.portal.controller.crm;

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

import com.al.common.utils.EncodeUtils;
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
import com.al.lte.portal.bmo.crm.CartBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.ReportBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;


/**
 * 统计报表控制层
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.crm.ReportController")
@RequestMapping("/report/*")
public class ReportController extends BaseController {

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
    @AuthorityValid(isCheck = true)
    public String main(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
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
		
		return "/cart/cart-main";
	}
		
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
	        	return "/cart/cart-list";
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
    public String orderDetail(WebRequest request,Model model,HttpSession session) throws BusinessException{
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	Map param = new HashMap();
    	String olId = request.getParameter("olId");
    	param.put("olId", olId);
    	param.put("user", "");
    	Map cartInfo = null;
		try {
			cartInfo = cartBmo.queryCartOrder(param, null, sessionStaff);
			model.addAttribute("cart", cartInfo);
			model.addAttribute("code", cartInfo.get("code"));
			model.addAttribute("mess", cartInfo.get("mess"));
			model.addAttribute("olId", olId);
	    	return "/cart/cart-info";
	    	
		} catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.CUST_ORDER_DETAIL);
		} catch (Exception e) {
			log.error("购物车详情/report/cartInfo方法异常", e);
			return super.failedStr(model, ErrorCode.CUST_ORDER_DETAIL, e, param);
		}
    }

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
	    	return "/cart/order-item-detail";
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
	 * 转至受理流程查询页面
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/preCartLink", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
	public String preCartLink(Model model, HttpSession session)throws  AuthorityException{
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/preCartLink"));
		
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
		model.addAttribute("pageType", "link");
		
		return "/cart/cart-main";		
	}
	
	
	/**
	 * 转至回执打印页面
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/cartForVoucher", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String cartForVoucher(Model model, HttpSession session)throws  AuthorityException{
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/preCartLink"));
		
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
		model.addAttribute("pageType", "voucher");
		
		return "/cart/cart-main";		
	}
	
	
	/**
	 * 重打发票
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/cartForReInvoice", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String cartForReInvoice(Model model, HttpSession session)throws  AuthorityException{
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/preCartLink"));
		
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
		model.addAttribute("pageType", "reInvoice");
		
		return "/cart/cart-main";		
	}
	
	/**
	 * 补打发票
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/cartForAddInvoice", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String cartForInvoice(Model model, HttpSession session)throws  AuthorityException{
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/preCartLink"));
		
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
		model.addAttribute("pageType", "addInvoice");
		
		return "/cart/cart-main";		
	}
    
    /**
     * 查询购物车环节
     * @param param
     * @param flowNum
     * @param session
     * @param model
     * @return
     * @throws BusinessException
     */
	@RequestMapping(value = "/cartLink", method = RequestMethod.GET)
    public String queryCartLink(@RequestParam Map<String, Object> param, @LogOperatorAnn String flowNum, HttpSession session, Model model)throws BusinessException{
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	try{
    		Map<String, Object> resultMap = cartBmo.queryCartLink(param, flowNum, sessionStaff);
    		model.addAttribute("link", resultMap);
			model.addAttribute("olNbr", param.get("olNbr"));
			model.addAttribute("areaId", param.get("areaId"));
			model.addAttribute("channelId", param.get("channelId"));
			return "/cart/cart-link-list";
    	}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, param, ErrorCode.QUERY_CART_LINK);
		}catch(Exception e){
			log.error("购物车环节详情/report/cartLink方法异常", e);
			return super.failedStr(model, ErrorCode.QUERY_CART_LINK, e, param);
		}    	
    }
	
	/**
	 * 工单状态查询
	 */
	@RequestMapping(value = "/constructionState", method = RequestMethod.GET)
	public String queryConstructionState(@RequestParam Map<String, Object> param, @LogOperatorAnn String flowNum, 
			HttpSession session, HttpServletResponse response, Model model)throws BusinessException{
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		try{
			Map<String, Object> resultMap = cartBmo.queryConstructionState(param, flowNum, sessionStaff);
			if(resultMap.get("resultCode").equals("0")){
				model.addAttribute("flag", 0);
				model.addAttribute("resultList", resultMap.get("resultList"));
			}
			else{
				response.addHeader("respCode", "1");
				response.addHeader("respMsg", EncodeUtils.urlEncode(MapUtils.getString(resultMap, "resultMsg", "工单查询失败，且获取不到错误信息"), "UTF-8"));
				model.addAttribute("flag", 1);
			}
			return "/cart/construction-state";
		}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, param, ErrorCode.QUERY_CONSTRUCTION_STATE);
		}catch(Exception e){
			log.error("施工单状态查询/report/constructionState方法异常", e);
			return super.failedStr(model, ErrorCode.QUERY_CONSTRUCTION_STATE, e, param);
		}
	}

	
	/**
	 * 转至7、群成员查询页面
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/groupMembers", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
	public String groupMembers(Model model, HttpSession session)throws  AuthorityException{
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"report/groupMembers"));
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
//		Calendar c = Calendar.getInstance();
//		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
//		String endTime = f.format(c.getTime());
//		c.add(Calendar.DATE, -7);
//		String startTime = f.format(c.getTime());
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
//		model.addAttribute("p_startDt", startTime);
//		model.addAttribute("p_endDt", endTime);
		model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
		model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
		
		return "/cart/group-mian";		
	}
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;

    //群详细信息查询
    @RequestMapping(value = "/getGroupInfoList", method = RequestMethod.POST)
	public String getGroupInfoList(HttpSession session,Model model ,@RequestBody Map<String, Object> param) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	Integer totalSize = 1;
    	List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
    	String pageIndex = param.get("curPage")==null?"":param.get("curPage").toString();
    	String pageSize = param.get("pageSize")==null?"":param.get("pageSize").toString();
    	int iPage = 1;
    	int iPageSize = 10 ;
    	Map<String, Object> groupParm = new HashMap<String, Object>(param);
    	Map<String, Object> prodInst=new HashMap<String, Object>();
    	try{
    		iPage = Integer.parseInt(pageIndex);
    		iPageSize = Integer.parseInt(pageSize) ;
    		Map returnMap = offerBmo.queryGroupInfoList(groupParm, null, sessionStaff);
        	if(returnMap.get("totalSize")!=null){
        		totalSize = Integer.parseInt(returnMap.get("totalSize").toString());
        		if(totalSize>0){
        			list = (List<Map<String, Object>>)returnMap.get("list");
        			prodInst=(Map<String, Object>)returnMap.get("prodInst");
        		}
        	}
        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
        			iPage,
        			iPageSize,
        			totalSize<1?1:totalSize,
        					list);
        	model.addAttribute("pageModel", pm);
        	model.addAttribute("prodInst", prodInst);
        	model.addAttribute("code", returnMap.get("code"));
			model.addAttribute("mess", returnMap.get("mess"));
    	}catch(BusinessException be){
			super.failed(be);
		}catch(InterfaceException ie){
			super.failed(ie, groupParm, ErrorCode.QUERY_GROUP_INFO);
		}catch(Exception e){
			super.failed(ErrorCode.QUERY_GROUP_INFO, e, groupParm);
		}
		model.addAttribute("pageParam", param);
        return "/cart/group-list";
    }
	
	/**
	 * 转至停复机查询页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/tfjcxMain", method = RequestMethod.GET)
//    @AuthorityValid(isCheck = true)
    public String toTfjcxMain(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String endTime = f.format(c.getTime());
//		c.add(Calendar.DATE, -7);
		String startTime = f.format(c.getTime());
		
		model.addAttribute("p_startDt", startTime);
		model.addAttribute("p_endDt", endTime);
		
		return "/orderQuery/query-tfjcx-main";
	}
	
	@SuppressWarnings("unchecked")	
	@RequestMapping(value = "/tfjcxList", method = RequestMethod.GET)
    public String tfjcxList(HttpSession session,Model model,WebRequest request) throws BusinessException{
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        
        param.put("createDt", request.getParameter("startDt"));
		param.put("completeDt", request.getParameter("endDt"));
		param.put("boActionTypeCd", request.getParameter("boActionTypeCd"));
		param.put("accessNumber", request.getParameter("qryNumber"));
		
        try{
    		nowPage = Integer.parseInt(request.getParameter("nowPage").toString());
    		pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
    		param.put("pageIndex", nowPage);
    		param.put("pageSize", pageSize);
    		
    		Map<String, Object> map = cartBmo.queryTfjCarts(param, null, sessionStaff);
        	if(map!=null&&map.get("saDealRecords")!=null){
        		list =(List<Map<String, Object>>)map.get("saDealRecords");
        		totalSize = list.size();
        		
         	}
        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
            		nowPage,
            		pageSize,
            		totalSize<1?1:totalSize,
    				list);
    		model.addAttribute("pageModel", pm);
    		model.addAttribute("code", map.get("code"));
			model.addAttribute("mess", map.get("mess"));
			
        	return "/orderQuery/query-tfjcx-list";
        } catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.QUERY_SA_DEAL_RECORDS);
		} catch (Exception e) {
			log.error("购物车查询/report/tfjcxList方法异常", e);
			return super.failedStr(model, ErrorCode.QUERY_SA_DEAL_RECORDS, e, param);
		}
    }

}

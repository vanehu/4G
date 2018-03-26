package com.al.lte.portal.pad.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import org.springframework.web.context.request.WebRequest;

import com.al.ecs.common.entity.JsonResponse;
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
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 撤单功能
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.pad.controller.crm.OrderUndoController")
@RequestMapping("/pad/orderUndo/*")
public class OrderUndoController extends BaseController {
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@RequestMapping(value = "/main", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(@RequestParam(value = "current", required = false, defaultValue = "business") String current,
            Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"orderUndo/main"));
		session.removeAttribute("ValidateAccNbr");
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String endTime = f.format(c.getTime());
		String startTime = f.format(c.getTime());
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
		model.addAttribute("p_startTime", startTime);
		model.addAttribute("p_endTime", endTime);
		model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
		model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
		//model.addAttribute("dic_orderStatus", orderStatus);
		
		return "/pad/orderUndo/order-undo-main";
    }
	
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public String list(HttpSession session,Model model,WebRequest request) throws BusinessException{
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>(); 
        
        Map pageData = new HashMap();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer curPage = 1 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;

        String partyId = request.getParameter("p_partyId") ;
    	String areaId = request.getParameter("p_areaId") ;
    	
    	String startDt = request.getParameter("p_startTime") ;
    	String endDt = request.getParameter("p_endTime") ;
    	
    	String channelId = request.getParameter("p_channelId") ;
    	
    	String olNbr = request.getParameter("p_olNbr") ;
    	String accessNumber = request.getParameter("p_hm") ;
    	
    	dataBusMap.put("areaId", areaId);
    	dataBusMap.put("startDt", startDt);
    	dataBusMap.put("endDt", endDt);
    	if(partyId!=null&&!partyId.equals("")&&!partyId.equals("null")){
    		dataBusMap.put("partyId", partyId);
    	}
    	if(channelId!=null&&!channelId.equals("")&&!channelId.equals("null")){
    		dataBusMap.put("channelId", channelId);
    	}
    	if(olNbr!=null&&!olNbr.equals("")&&!olNbr.equals("null")){
    		dataBusMap.put("olNbr", olNbr);
    	}
    	if(accessNumber!=null&&!accessNumber.equals("")&&!accessNumber.equals("null")){
    		dataBusMap.put("accessNumber", accessNumber);
    	}
    	dataBusMap.put("unComFlag", "Y");//Y未竣工
    	Map map = null;
		try {
			curPage = Integer.parseInt(request.getParameter("curPage")) ;
	    	pageSize = Integer.parseInt(request.getParameter("pageSize")) ;
	    	dataBusMap.put("curPage", curPage);
	    	dataBusMap.put("pageSize", pageSize);
	    	
			map = orderBmo.qryOrderList(dataBusMap, null, sessionStaff);
			if(map!=null&&map.get("orderListDetailInfo")!=null){
        		Map orderListDetailInfo =(Map)map.get("orderListDetailInfo");
        		if(orderListDetailInfo!=null){
        			list = (List)orderListDetailInfo.get("orderListInfo");
        			Map mapPageInfo = (Map)orderListDetailInfo.get("page");
        			curPage = (Integer)mapPageInfo.get("curPage");
        			totalSize = (Integer)mapPageInfo.get("totalSize");
        		}
         	}
			PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
	        		curPage,
	        		pageSize,
	        		totalSize<1?1:totalSize,
					list);
			model.addAttribute("pageModel", pm);
			model.addAttribute("code", map.get("code"));
			model.addAttribute("mess", map.get("mess"));
		} catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, dataBusMap, ErrorCode.ORDER_QUERY);
		} catch (Exception e) {
			log.error("撤单查询/orderUndo/list方法异常", e);
			return super.failedStr(model, ErrorCode.ORDER_QUERY, e, dataBusMap);
		}
        return "/pad/orderUndo/order-undo-list";
    }
	

    @RequestMapping(value = "/orderSubmit", method = RequestMethod.POST)
	public String orderSubmit(@RequestBody Map<String, Object> param,Model model,HttpServletResponse response) throws BusinessException{
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	//Map result = new HashMap();
    	//Map orderData = new HashMap();
    	/*
		Map orderListInfo = new HashMap();
    	//orderListInfo.put("olId", "1");//不传
    	orderListInfo.put("olTypeCd", "11");//表示是门户层从过去的数据
    	orderListInfo.put("areaId", sessionStaff.getCurrentAreaId());
    	orderListInfo.put("staffId", sessionStaff.getStaffId());
    	orderListInfo.put("channelId", sessionStaff.getCurrentChannelId());
    	param.put("orderListInfo", orderListInfo);
    	*/
    	//orderData.put("orderList", param);
		Map<String, Object> mapSubmit = null;
		try {
			Map orderList = (Map)param.get("orderList");
			Map orderListInfo = (Map)orderList.get("orderListInfo");
	    	orderListInfo.put("areaId", sessionStaff.getCurrentAreaId());
	    	orderListInfo.put("channelId", sessionStaff.getCurrentChannelId());			
			orderListInfo.put("staffId", sessionStaff.getStaffId()); //防止前台修改
			//mapSubmit = orderBmo.orderSubmit(orderData,null,sessionStaff);
			mapSubmit = orderBmo.orderSubmit(param,null,sessionStaff);
			model.addAttribute("resMap",mapSubmit);
		} catch (BusinessException be) {
			
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {

			return super.failedStr(model,ie, param, ErrorCode.ORDER_SUBMIT);
		} catch (Exception e) {
			log.error("撤单提交/orderUndo/orderSubmit方法异常", e);
			return super.failedStr(model,ErrorCode.ORDER_SUBMIT, e, param);
		}
		return "/pad/orderUndo/order-confirm";
    }
    
    @ResponseBody
    @RequestMapping(value = "orderUndoCheck", method = RequestMethod.POST)
	public JsonResponse orderUndoCheck(@RequestBody Map<String, Object> param,Model model,HttpServletResponse response) throws BusinessException{
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	JsonResponse jsonResponse = null;
    	Map<String,Object> paramMap = new HashMap<String,Object>();
    	paramMap.put("areaId", param.get("areaId"));
    	paramMap.put("custOrderId", param.get("custOrderId"));
    	paramMap.put("orderItemId", param.get("orderItemId"));
    	paramMap.put("ifRepealAll", param.get("ifRepealAll"));
    	try {
			Map<String, Object> result = orderBmo.orderUndoCheck(paramMap, null, sessionStaff);
			jsonResponse = super.successed(result,ResultConstant.SUCCESS.getCode());
    	} catch (InterfaceException ie){
    		jsonResponse = super.failed(ie,param,ErrorCode.ORDER_UNDO_CHECK);
		} catch (Exception e) {
			this.log.error("撤单校验异常", e);
			jsonResponse = super.failed("撤单校验异常",ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}
    	return jsonResponse;
    }
}

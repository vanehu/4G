package com.al.lte.portal.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

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
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;


/**
 * 天翼高清机顶盒相关业务控制层
 */
@Controller("com.al.lte.portal.controller.crm.STBController")
@RequestMapping("/STB/*")
public class STBController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.STBBmo")
	private com.al.lte.portal.bmo.crm.STBBmo STBBmo;
	
	/**
	 * 天翼高清机顶盒预约 - 进入订单页面
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/reserve/order", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String reserveOrder(Model model, HttpSession session) throws AuthorityException {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("areaId", sessionStaff.getCurrentAreaId());
		params.put("qryType", "1");
		
		try {
			Map<String, Object> resultMap = STBBmo.querySTBReserveSpecInfo(params, null, sessionStaff);
			if(ResultCode.R_SUCC.equals(MapUtils.getString(resultMap, "resultCode"))){
				Map<String, Object> result = MapUtils.getMap(resultMap, "result", new HashMap<String, Object>());
				ArrayList<Map<String, Object>> specList = (ArrayList<Map<String, Object>>) result.get("itemSpec");
				ArrayList<Map<String, Object>> reserveCustInfo = new ArrayList<Map<String, Object>>();
				ArrayList<Map<String, Object>> reserveTerminalInfo = new ArrayList<Map<String, Object>>();
				ArrayList<Map<String, Object>> pickUpInfo = new ArrayList<Map<String, Object>>();
				for(Map<String, Object> specItem : specList){
					String businessTypeCd = MapUtils.getString(specItem, "businessTypeCd");
					if("1004".equals(businessTypeCd)){
						reserveCustInfo.add(specItem);
					}else if("1005".equals(businessTypeCd)){
						reserveTerminalInfo.add(specItem);
					}else if("1006".equals(businessTypeCd)){
						pickUpInfo.add(specItem);
					}
				}
				model.addAttribute("reserveCustInfo", reserveCustInfo);//预约人信息
				model.addAttribute("reserveTerminalInfo", reserveTerminalInfo);//预约终端信息
				model.addAttribute("pickUpInfo", pickUpInfo);//取货信息
				model.addAttribute("flag", "0");
			}else{
				model.addAttribute("flag", "1");
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, params, ErrorCode.QUERY_STB_RESERVE_SPEC_INFO);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_STB_RESERVE_SPEC_INFO, e, params);
		}
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "STB/reserve/order"));
		return "/STB/reserve-order";
    }
	
	/**
	 * 天翼高清机顶盒预约 - 订单提交
	 * @param attrList
	 * @param flowNum
	 * @param response
	 * @return
	 */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/reserve/commitOrder", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse reserveOrderCommit(@RequestBody Map<String, Object> params, @LogOperatorAnn String flowNum, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
		try {
			params.put("areaId", sessionStaff.getCurrentAreaId());
			params.put("staffId", sessionStaff.getStaffId());
			params.put("channelId", sessionStaff.getCurrentChannelId());
			dataBusMap.put("orderInfo", params);
			
			Map<String, Object> resultMap = STBBmo.commitSTBReserveInfo(dataBusMap, flowNum, sessionStaff);
			
			if(ResultCode.R_SUCC.equals(MapUtils.getString(resultMap, "resultCode"))){
				Map<String, Object> result = MapUtils.getMap(resultMap, "result");
				String reservId = MapUtils.getString(result, "reservId");
				return super.successed(reservId, ResultConstant.SUCCESS.getCode());
			}else{
				return super.failed(MapUtils.getString(resultMap, "resultMsg", "预约单提交保存失败，接口未返回错误信息"), ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, dataBusMap, ErrorCode.COMMIT_STB_RESERVE_INFO);
		} catch (Exception e) {
			return super.failed(ErrorCode.COMMIT_STB_RESERVE_INFO, e, dataBusMap);
		}
    }
    
    /**
     * 进入预约单查询页面
     * @param model
     * @param session
     * @return
     * @throws AuthorityException
     */
    @RequestMapping(value = "/preQueryReserveOrders", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String preQueryReserveOrders(Model model, HttpSession session) throws AuthorityException {
    	
    	 SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    	 
    	 Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
    	 Calendar c = Calendar.getInstance();
         SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
         String defaultEndDate = f.format(c.getTime());
         c.add(Calendar.DAY_OF_MONTH, -7);
         String defaultStartDate = f.format(c.getTime());
         
         model.addAttribute("defaultStartDate", defaultStartDate);
         model.addAttribute("defaultEndDate", defaultEndDate);
         model.addAttribute("defaultAreaId", defaultAreaInfo.get("defaultAreaId"));
         model.addAttribute("defaultAreaName", defaultAreaInfo.get("defaultAreaName"));
    	
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "STB/preQueryReserveOrders"));
		return "/STB/reserve-query";
    }
    
    /**
     * 天翼高清机顶盒预约单查询
     * @param params
     * @param flowNum
     * @param model
     * @return
     * @throws BusinessException
     */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryReserveOrders", method = RequestMethod.GET)
	public String queryReserveOrders(@RequestParam Map<String, Object> params, @LogOperatorAnn String flowNum, Model model)throws BusinessException{
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    	try{
    		Map<String, Object> resultMap = STBBmo.querySTBReserveInfo(params, flowNum, sessionStaff);
			
    		if(ResultCode.R_SUCC.equals(MapUtils.getString(resultMap, "resultCode"))){
    			Map<String, Object> result = MapUtils.getMap(resultMap, "result");
    			
    			ArrayList<Map<String, Object>> reserveOrders = new ArrayList<Map<String, Object>>();
    			
    			ArrayList<Map<String, Object>> orderList = (ArrayList<Map<String, Object>>) result.get("orderList");
    			for(Map<String, Object> reserveOrder : orderList){
    				ArrayList<Map<String, Object>> attrList = (ArrayList<Map<String, Object>>) reserveOrder.get("attrList");
    				for(Map<String, Object> attrItem : attrList){
    					String attrSpecId = MapUtils.getString(attrItem, "itemSpecId");
    					String attrValue = MapUtils.getString(attrItem, "value");
    					String attrContent = MapUtils.getString(attrItem, "valueName");
    					if("800000057".equals(attrSpecId)){
    						reserveOrder.put("reserveFee", attrValue);//预约金额
    					}else if("800000058".equals(attrSpecId)){
    						reserveOrder.put("deliverWay", attrContent);//提货方式
    					}else if("800000059".equals(attrSpecId)){
    						reserveOrder.put("deliverTime", attrValue);//取货时间
    					}else if("800000060".equals(attrSpecId)){
    						reserveOrder.put("deliverAddr", attrValue);//寄送地址
    					}else if("800000061".equals(attrSpecId)){
    						reserveOrder.put("payType", attrContent);//付款方式
    					}
    				}
    				reserveOrder.remove("attrList");
    				reserveOrders.add(reserveOrder);
    			}
    			model.addAttribute("reserveOrders", reserveOrders);
    			model.addAttribute("flag", "0");
    		}else{
    			model.addAttribute("flag", "1");
    		}
    	} catch(BusinessException be) {
			return super.failedStr(model, be);
		} catch(InterfaceException ie) {
			return super.failedStr(model, ie, params, ErrorCode.QUERY_STB_RESERVE_INFO);
		} catch(Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_STB_RESERVE_INFO, e, params);
		}
    	return "/STB/reserve-orders-table";
    }
 	
}

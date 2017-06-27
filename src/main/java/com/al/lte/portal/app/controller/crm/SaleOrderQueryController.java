package com.al.lte.portal.app.controller.crm;

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
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 宽带甩单－订单查询 .
 * <BR>
 *  TODO 要点概述.
 * <P>
 * @author leilj
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午3:29:40
 * @modifyDate	 tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Controller("com.al.lte.portal.app.controller.PreOrderController")
@RequestMapping("/app/saleorder/*")
@AuthorityValid(isCheck = false)
public class SaleOrderQueryController extends BaseController {
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
    private CommonBmo commonBmo;
	
	@Autowired
    PropertiesUtils propertiesUtils;
	
	/**
	 * 销售单列表查询页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/queryorderlist", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String main(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"saleorder/queryorderlist"));
		
		
		return "/app/saleOrderQuery/saleOrderQuery";		
	}
	
	
	/**
	 * 销售品单列表查询
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/querysaleorderlist", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse querySaleOrderList(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
        	Map<String,Object> ContractRoot = (Map<String, Object>) param.get("ContractRoot");
    		Map<String,Object> SvcCont = (Map<String, Object>) ContractRoot.get("SvcCont");
    		Map<String,Object> PreOrderListParam = (Map<String, Object>) SvcCont.get("PreOrderListParam");
    		PreOrderListParam.put("AcceptRegionId", sessionStaff.getCurrentAreaId());
            rMap = orderBmo.querySaleOrderList(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.ORDER_DETAIL, rMap, param);
            }
        } catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.ORDER_DETAIL, e, param);
        }
        return jsonResponse;
	}
	
	/**
	 * 销售品详情查询
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/querysaleorderdetail", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse querySaleOrderDetail(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
        	Map<String,Object> ContractRoot = (Map<String, Object>) param.get("ContractRoot");
    		Map<String,Object> SvcCont = (Map<String, Object>) ContractRoot.get("SvcCont");
    		Map<String,Object> PreOrderListParam = (Map<String, Object>) SvcCont.get("PreOrderListParam");
    		PreOrderListParam.put("AcceptRegionId", sessionStaff.getCurrentAreaId());
            rMap = orderBmo.querySaleOrderDetail(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.ORDER_DETAIL, rMap, param);
            }
        } catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.ORDER_DETAIL, e, param);
        }
        return jsonResponse;
	}
	
}

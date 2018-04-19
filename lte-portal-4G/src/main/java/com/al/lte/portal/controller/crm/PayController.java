package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
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
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.RedisUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

import net.sf.json.JSONArray;

/**
 * call 支付平台 及 支付平台回调地址
 * 
 * @author wangdan6
 *
 */
@Controller("com.al.lte.portal.controller.crm.PayController")
@RequestMapping("/pay/*")
public class PayController extends BaseController {
	/** 订单提交成功后返回的olId */
	public static final String SESSION_PAY_OL_ID = "PAY_OL_ID";

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	/**
	 * 支付平台前端回调接口(二次确认) - 提供url给支付平台，支付平台跳转到如下页面。pay.html
	 */
	@RequestMapping(value = "getPayResult", method = RequestMethod.GET)
	public String getPayResult2(HttpServletRequest request, HttpServletResponse response, Model model)
			throws IOException {
		String params = request.getParameter("params");// xml参数集合
		log.debug("获取的参数集合:" + params);
        model.addAttribute("params", params);
		return "/pay/pay-init";
	 };

	
	/**
	 * 获取订单支付状态
	 * 
	 * @param param
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/getPayOrdStatus", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getPayOrdStatus(@RequestBody Map<String, Object> param,
			Model model, HttpSession session, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap;
		JsonResponse jsonResponse;
		String olId=param.get("olId")+"";
		try {
			rMap = getChargeItems(param, flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(rMap));
			if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("respCode"))) {
				String payCode="";
				//String payAmount="";
				//查询成功，接口同时返回支付方式编码，存入session，用于下计费时校验
				if(rMap.get("payCode")!=null){
				   payCode=rMap.get("payCode")+"";
				   session.setAttribute(olId+"_payCode", payCode);
				}
//				if(rMap.get("payAmount")!=null){
//					 payAmount=rMap.get("payAmount")+"";//用于金额校验
//				}
				 jsonResponse = super.successed(rMap,ResultConstant.SUCCESS.getCode());
			} else{
				jsonResponse = super.successed(rMap, ResultConstant.FAILD.getCode());
			}
			return jsonResponse;
		} catch (BusinessException be) {
			this.log.error("支付平台/查询订单方法异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.PAY_QUERY);
		} catch (Exception e) {
			log.error("支付平台/查询订单方法异常", e);
			return super.failed(ErrorCode.PAY_QUERY, e, param);
		}

	}
	@SuppressWarnings("unchecked")
	private Map<String, Object> getChargeItems(Map<String, Object> param, String flowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> rMap = orderBmo.queryPayOrderStatus(param, flowNum, sessionStaff);
		if(rMap.get("chargeItems")!=null){
			List<Map<String, Object>> chargeItems2 = new ArrayList<Map<String, Object>>();
			chargeItems2 = (List<Map<String, Object>>) rMap.get("chargeItems");
			if(chargeItems2.size()>0 && chargeItems2.get(0)!=null){
				JSONArray chargeItems = JSONArray.fromObject(chargeItems2);	
				rMap.put("chargeItems", chargeItems);	
			}			
		}
		return rMap;
	}
	
	/**
	 * 从redis缓存获取支付平台是否支付成功
	 * 
	 * @param param
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/queryOrdStatusFromRedis", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryPayOrdStatusFromRedis(@RequestBody Map<String, Object> param, Model model,
			HttpSession session, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		String olId = param.get("olId") + "";
		// 先从redis中获取支付状态和支付方式，若支付状态不存在或redis异常，则调支付平台订单查询接口获取
		try {
			if (RedisUtil.get("app_status_" + olId) != null && RedisUtil.get("app_payCode_" + olId) != null
					&& RedisUtil.get("app_payAmount_" + olId) != null) {
				String payStatus = RedisUtil.get("app_status_" + olId)+"";
				String payCode = RedisUtil.get("app_payCode_" + olId)+"";
				String payAmount = RedisUtil.get("app_payAmount_" + olId)+"";
				if ("0".equals(payStatus)) {
					rMap = new HashMap<String, Object>();
					rMap.put("payCode", payCode);
					rMap.put("payAmount", payAmount);
					return super.successed(rMap, ResultConstant.SUCCESS.getCode());
				}
			}
		} catch (Exception be) {
		}

		try {
			rMap = orderBmo.queryPayOrderStatus(param, flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(rMap));
			if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("respCode"))) {
				jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.successed(rMap, ResultConstant.FAILD.getCode());
			}
			return jsonResponse;
		} catch (BusinessException be) {
			this.log.error("调用主数据接口失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.PAY_QUERY);
		} catch (Exception e) {
			log.error("支付平台/查询订单方法异常", e);
			return super.failed(ErrorCode.PAY_QUERY, e, param);
		}
	}

	/**
	 * 订单建档失败时，调用支付平台退费接口
	 * 
	 * @param param
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/payRefund", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse payRefund(@RequestBody Map<String, Object> param, Model model, HttpSession session,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		//String resultCode = "";
		String dbKeyWord = sessionStaff == null ? null : sessionStaff.getDbKeyWord();
		if (StringUtils.isBlank(dbKeyWord)) {
			dbKeyWord = "";
		}
		try {
			
			if(MapUtils.isEmpty(param)){
				return jsonResponse = super.failed("参数缺失",
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
			if(StringUtils.isEmpty(MapUtils.getString(param, "olId"))){
				return jsonResponse = super.failed("参数缺失",
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		
			param.put("reqNo", super.getRequest().getSession().getAttribute(Const.SESSION_REFUND_REQ_NO));
		    rMap = orderBmo.payRefundOrder(param, flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(rMap));
			if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("respCode"))) {
				jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
//				session.removeAttribute(MapUtils.getString(param, "olId", "")+"-"+SysConstant.SESSION_KEY_REFUND_OLD_ID);
//				session.removeAttribute(MapUtils.getString(param, "olId", "")+"-"+SysConstant.SESSION_KEY_OLD_ID);
//				session.removeAttribute(MapUtils.getString(param, "olId", "")+"-"+SysConstant.SESSION_KEY_AMOUNT);
//				session.removeAttribute(MapUtils.getString(param, "olId", "")+"-"+SysConstant.SESSION_KEY_RESULT_CODE);
			} else {
				jsonResponse = super.failed(rMap.get("respMsg"),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
			return jsonResponse;
		} catch (BusinessException be) {
			this.log.error("调用支付平台退费失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.PAY_REFUND_ORDER);
		} catch (Exception e) {
			log.error("支付平台退费方法异常", e);
			return super.failed(ErrorCode.PAY_REFUND_ORDER, e, param);
		}
	}

	/**
	 * 取支付页面（url+token）
	 * 
	 * @param param
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/getPayUrl", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getPayUrl(@RequestBody Map<String, Object> param, Model model, HttpSession session,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = new HashMap<String, Object>();
		JsonResponse jsonResponse = new JsonResponse();
		try {
			param.put("frontUrl", ServletUtils.getRealPath(super.getRequest())+"/pay/getPayResult");
			rMap = orderBmo.queryPayToken(param, flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(rMap));
			if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("respCode"))) {
				jsonResponse = super.successed(MDA.PAY_URL + "payToken=" + rMap.get("payToken"),
						ResultConstant.SUCCESS.getCode());
				
				session.setAttribute(Const.SESSION_PAY_REQ_NO, rMap.get("reqNo"));
				// 保存金额到session
				session.setAttribute(Const.SESSION_PAY_CHARGE_AMOUNT, MapUtils.getString(param, "charge", ""));
			} else {
				jsonResponse = super.failed(rMap.get("respMsg"),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
			return jsonResponse;
		} catch (BusinessException be) {
			this.log.error("调用主数据接口失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.PAY_TOKEN);
		} catch (Exception e) {
			log.error("支付平台/token方法异常", e);
			return super.failed(ErrorCode.PAY_TOKEN, e, param);
		}
   }

}

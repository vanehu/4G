package com.al.lte.portal.controller.ess;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.ess.EssOrderBmo;
import com.al.lte.portal.common.AESSecurity;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * ess订单管理控制层
 */
@Controller("com.al.lte.portal.controller.ess.essOrderController")
@RequestMapping("/ess/order/*")
public class essOrderController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.ess.EssOrderBmo")
	private EssOrderBmo essOrderBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
	private MktResBmo mktResBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;

	/**
	 * 转至ESS订单查询页面
	 */
	@RequestMapping(value = "/orderQuery", method = RequestMethod.GET)
	public String orderQuery(Model model, HttpServletRequest request,
			HttpSession session) {
		return "/ess/ess-order-query-main";
	}

	/**
	 * ESS订单查询
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/orderListQry", method = { RequestMethod.POST })
	public String orderListQry(@RequestBody Map<String, Object> param,
			Model model, HttpServletResponse response) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String pageFlag = (String) param.get("pageFlag");
		Integer totalSize = 0;
		param.put("staffId", sessionStaff.getStaffId());
		Integer nowPage = Integer.parseInt(param.get("nowPage").toString());
		Integer pageSize = Integer.parseInt(param.get("pageSize").toString());
		try {
			Map<String, Object> resMap = essOrderBmo.orderListQry(param, null,
					sessionStaff);
			if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))
					&& resMap.get("result") != null) {
				Map<String, Object> result = (Map<String, Object>) resMap
						.get("result");
				list = (List<Map<String, Object>>) result.get("orderList");
				totalSize = MapUtils.getInteger(resMap, "totalCnt", 1);
				Map<String, Object> essSession = new HashMap<String, Object>();
				essSession.put("essOrderList", list);
				sessionStaff.setEssSession(essSession);
			}
			PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
					nowPage, pageSize, totalSize < 1 ? 1 : totalSize, list);
			model.addAttribute("pageModel", pm);
			model.addAttribute("code", resMap.get("resultCode"));
			model.addAttribute("mess", resMap.get("resultMsg"));
			model.addAttribute("resMap", resMap);
			model.addAttribute("param", param);
			if (pageFlag.equals("terminalInfoPage")) {// 终端回填
				return "/ess/ess-terminal-info-list";
			} else if (pageFlag.equals("writeCardPage")) {// 远程写卡
				return "/ess/ess-write-cart-list";
			} else if (pageFlag.equals("invoicePrintPage")) {// 回执打印
				return "/ess/ess-invoice-print-list";
			} else if (pageFlag.equals("partnerAssitPage")) {// 第三方辅助功能
				return "/ess/ess-partner-assit-list";
			} else if (pageFlag.equals("repeatWriteCardPage")) {// 二次写卡
				return "/ess/ess-repeat-write-card-list";
			} else {// 订单查询
				return "/ess/ess-order-query-list";
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param,
					ErrorCode.ESS_QUERY_ORDER_LIST);
		} catch (Exception e) {
			log.error("ESS订单列表查询接口方法异常", e);
			return super.failedStr(model, ErrorCode.ESS_QUERY_ORDER_LIST, e,
					param);
		}
	}

	/**
	 * 显示历史订单
	 */
	@RequestMapping(value = "/showOrderEvent", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	public String showOrderEvent(@RequestBody Map<String, Object> param,
			Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> essSession = sessionStaff.getEssSession();
		List<Map<String, Object>> list = (List<Map<String, Object>>) essSession
				.get("essOrderList");
		String paramOlId = (String) param.get("olId");
		Map<String, Object> orderInfo = new HashMap<String, Object>();
		for (int i = 0; i < list.size(); i++) {
			String olId = (String) list.get(i).get("olId");
			if (paramOlId.equals(olId)) {
				orderInfo = list.get(i);
			}
		}
		model.addAttribute("orderInfo", orderInfo);
		return "/ess/ess-order-event";
	}

	/**
	 * 订单详情查询
	 */
	@RequestMapping(value = "/queryOrderInfo", method = RequestMethod.GET)
	public String orderDetail(WebRequest request, Model model,
			HttpSession session, @RequestParam Map<String, Object> paramMap)
			throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> cartInfo = null;
		try {
			cartInfo = essOrderBmo.queryOrderInfo(paramMap, null, sessionStaff);
			model.addAttribute("code", cartInfo.get("code"));
			model.addAttribute("mess", cartInfo.get("mess"));
			if (ResultCode.R_SUCC.equals(cartInfo.get("code"))) {
				List<Map<String, Object>> orderLists = (List<Map<String, Object>>) cartInfo
						.get("orderLists");
				if (orderLists.size() == 1) {
					cartInfo = orderLists.get(0);
				} else if (orderLists.size() > 1) {// 只有套餐变更且有补换卡时候才需要合单：主单为套餐变更，副单为补换卡；把副单的物品信息节点和业务动作列表节点合加入到主单中
					Map<String, Object> subOrderList = new HashMap<String, Object>();
					if ("2".equals(orderLists.get(0).get("custOrderType"))) {// 订单类型：2套餐变更
						cartInfo = orderLists.get(0);
						subOrderList = orderLists.get(1);
					} else {
						cartInfo = orderLists.get(1);
						subOrderList = orderLists.get(0);
					}
					List<Map<String, Object>> mainCouponInfo = (List<Map<String, Object>>) cartInfo
							.get("custOrderList");
					List<Map<String, Object>> subCouponInfo = (List<Map<String, Object>>) subOrderList
							.get("custOrderList");
					cartInfo.remove("couponInfo");
					mainCouponInfo.addAll(subCouponInfo);
					cartInfo.put("couponInfo", mainCouponInfo);

					List<Map<String, Object>> mainCustOrderList = (List<Map<String, Object>>) cartInfo
							.get("custOrderList");
					List<Map<String, Object>> subCustOrderList = (List<Map<String, Object>>) subOrderList
							.get("custOrderList");
					cartInfo.remove("custOrderList");
					mainCustOrderList.addAll(subCustOrderList);
					cartInfo.put("custOrderList", mainCustOrderList);
				}
			}
			model.addAttribute("cart", cartInfo);
			return "/ess/ess-order-detail";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap,
					ErrorCode.QUERY_ORDER_DETAIL);
		} catch (Exception e) {
			log.error("订单详情查询/ess/order/queryOrderInfo方法异常", e);
			return super.failedStr(model, ErrorCode.QUERY_ORDER_DETAIL, e,
					paramMap);
		}
	}
	
	/**
	 * 号卡发货渠道、终端发货渠道查询
	 */
	@RequestMapping(value = "/queryAuthenticDataRange", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryAuthenticDataRange(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			param.put("areaId", sessionStaff.getCurrentAreaId());
			param.put("staffId", sessionStaff.getStaffId());
			rMap = orderBmo.queryAuthenticDataRange(param, flowNum,
					sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				List result = (List) rMap.get("result");
				Map remap = (Map) result.get(0);
				List dataRanges = (List) remap.get("dataRanges");
				jsonResponse = super.successed(dataRanges,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_AUTHENTICDATARANGE);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_AUTHENTICDATARANGE, e, param);
		}
		return jsonResponse;
	}
	
	/**
	 * 订单类型、订单状态查询
	 */
	@RequestMapping(value = "/orderStatusAndTypeQuery", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse orderStatusAndTypeQuery(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = essOrderBmo.orderStatusAndTypeQuery(param, flowNum,
					sessionStaff);
			if (ResultCode.R_SUCC.equals(rMap.get("resultCode"))
					&& rMap.get("result") != null) {
				Map<String, Object> result = (Map<String, Object>) rMap
						.get("result");
				jsonResponse = super.successed(result,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.ESS_STATUS_TYPE_QUERY);
		} catch (Exception e) {
			return super.failed(ErrorCode.ESS_STATUS_TYPE_QUERY, e, param);
		}
		return jsonResponse;
	}

	
	/**
	 * 转至终端回填页面
	 */
	@RequestMapping(value = "/terminalBackfill", method = RequestMethod.GET)
	public String terminalBackfill(Model model, HttpServletRequest request,
			HttpSession session) {
		return "/ess/ess-terminal-backfill-main";
	}

	/**
	 * 终端录入页面
	 */
	@RequestMapping(value = "/showTerminalBackfill", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	public String showTerminalBackfill(@RequestBody Map<String, Object> param,
			Model model) {
		String extCustOrderId = (String) param.get("extCustOrderId");
		String commonRegionId = (String) param.get("commonRegionId");
		String channelId = (String) param.get("channelId");
		model.addAttribute("extCustOrderId", extCustOrderId);
		model.addAttribute("commonRegionId", commonRegionId);
		model.addAttribute("channelId", channelId);
		return "/ess/ess-terminal-show";
	}

	/**
	 * 终端回填
	 */
	@RequestMapping(value = "/mktResInstMakeUp", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse mktResInstMakeUp(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			param.put("receiveFlag", "1");
			param.put("staffId", sessionStaff.getStaffId());
			rMap = mktResBmo.checkTermCompVal(param, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(rMap)) {
				if (ResultCode.R_SUCC.equals(MapUtils.getString(rMap, "code"))) {
					String statusCd = MapUtils.getString(rMap, "statusCd");
					if (statusCd.equals("1001")) {

					} else {
						return super.failed("校验终端串号失败,串码状态：" + statusCd,
								ResultConstant.SERVICE_RESULT_FAILTURE
										.getCode());
					}
				} else {
					return super.failed(MapUtils.getString(rMap, "message"),
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			} else {
				return super.failed("校验终端串号失败",
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.CHECK_TERMINAL);
		} catch (Exception e) {
			return super.failed(ErrorCode.CHECK_TERMINAL, e, param);
		}
		Map<String, Object> inParam = new HashMap<String, Object>();
		inParam.put("extCustOrderId", param.get("extCustOrderId"));
		inParam.put("commonRegionId", param.get("commonRegionId"));
		inParam.put("staffId", sessionStaff.getStaffId());
		try {
			Map<String, Object> mktResInst = new HashMap<String, Object>();
			mktResInst.put("mktResCd", rMap.get("mktResId"));
			mktResInst.put("mktResInstCode", param.get("instCode"));
			mktResInst.put("mktResStoreId", rMap.get("mktResStoreId"));
			mktResInst.put("mktResType", rMap.get("mktResTypeCd"));
			List<Map<String, Object>> attrs = new ArrayList<Map<String, Object>>();
			Map<String, Object> attr = new HashMap<String, Object>();
			attr.put("attrId", "60010005"); // 属性：存货编码，写死为空
			attr.put("attrVal", "");
			attrs.add(attr);
			mktResInst.put("attr", attrs);
			inParam.put("mktResInst", mktResInst);
			rMap = essOrderBmo.mktResInstMakeUp(inParam, flowNum, sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCC.equals(rMap.get("resultCode")
							.toString())) {
				jsonResponse = super.successed(rMap,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, inParam, ErrorCode.ESS_MKTRES_MAKEUP);
		} catch (Exception e) {
			return super.failed(ErrorCode.ESS_MKTRES_MAKEUP, e, inParam);
		}
		return jsonResponse;
	}

	/**
	 * 转至远程写卡页面
	 */
	@RequestMapping(value = "/remoteWriteCard", method = RequestMethod.GET)
	public String remoteWriteCard(Model model, HttpServletRequest request,
			HttpSession session) {
		return "/ess/ess-remote-writecard-main";
	}
	/**
	 * 远程写卡
	 */
	@RequestMapping(value = "/writeCardMakeUp", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse writeCardMakeUp(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = essOrderBmo.mktResInstMakeUp(param, flowNum, sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCC.equals(rMap.get("resultCode")
							.toString())) {
				jsonResponse = super.successed(rMap,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.ESS_MKTRES_MAKEUP);
		} catch (Exception e) {
			return super.failed(ErrorCode.ESS_MKTRES_MAKEUP, e, param);
		}
		return jsonResponse;
	}
	/**
	 * 实名制认证单独登录
	 */
	@RequestMapping(value = "/toRealNameAuth", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse toRealNameAuth(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		StringBuilder url = new StringBuilder();
		try {
			url.append(MySimulateData.getInstance().getNeeded(
					(String) ServletUtils.getSessionAttribute(
							super.getRequest(),
							SysConstant.SESSION_DATASOURCE_KEY), "RNU", "url"));
			String extCustOrderId = (String) param.get("extCustOrderId");
			String reqTime = (String) param.get("reqTime");
			String accessToken = (String) param.get("accessToken");
			url.append("?ExtCustOrderId=").append(extCustOrderId)
					.append("&ReqTime=").append(reqTime)
					.append("&AccessToken=").append(accessToken);
			JsonResponse jsonResponse = super.successed(url,
					ResultConstant.SUCCESS.getCode());
			return jsonResponse;
		} catch (Exception e) {
			log.error("实名制认证单独登录获取url配置异常", e);
			return super.failed(e,
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}
	}
	
	/**
	 * 转至回执打印页面
	 */
	@RequestMapping(value = "/printReceipt", method = RequestMethod.GET)
	public String printReceipt(Model model, HttpServletRequest request,
			HttpSession session) {
		return "/ess/ess-print-receipt-main";
	}
	
	/**
	 * 转至第三方合作商订单管理页面
	 */
	@RequestMapping(value = "/partnerOrderManage", method = RequestMethod.GET)
	public String partnerOrderManage(Model model, HttpServletRequest request,
			HttpSession session) {
		return "/ess/ess-partner-order-main";
	}
	
	/**
	 * 订单下发接口（终端退货、终端换货、撤单）
	 */
	@RequestMapping(value = "/orderRepeal", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse orderRepeal(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = essOrderBmo.orderRepeal(param, flowNum,
					sessionStaff);
			if (ResultCode.R_SUCC.equals(rMap.get("resultCode"))
					&& rMap.get("result") != null) {
				Map<String, Object> result = (Map<String, Object>) rMap
						.get("result");
				jsonResponse = super.successed(result,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.ESS_STATUS_TYPE_QUERY);
		} catch (Exception e) {
			return super.failed(ErrorCode.ESS_STATUS_TYPE_QUERY, e, param);
		}
		return jsonResponse;
	}
	
	/**
	 * 订单查询返回json
	 */
	@RequestMapping(value = "/orderQry", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse orderQry(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		try {
			Map<String, Object> rMap = essOrderBmo.orderListQry(param, null,
					sessionStaff);
			if (ResultCode.R_SUCC.equals(rMap.get("resultCode"))
					&& rMap.get("result") != null) {
				Map<String, Object> result = (Map<String, Object>) rMap
						.get("result");
				jsonResponse = super.successed(result,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.ESS_QUERY_ORDER_LIST);
		} catch (Exception e) {
			return super.failed(ErrorCode.ESS_QUERY_ORDER_LIST, e, param);
		}
		return jsonResponse;
	}
	
	/**
	 * 转至二次写卡页面
	 */
	@RequestMapping(value = "/repeatWriteCard", method = RequestMethod.GET)
	public String repeatWriteCard(Model model, HttpServletRequest request,
			HttpSession session) {
		return "/ess/ess-repeat-writeCard-main";
	}
	
	/**
	 * 终端换货填串码
	 */
	@RequestMapping(value = "/showExchangeGoods", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	public String showExchangeGoods(@RequestBody Map<String, Object> param,
			Model model) {
		String extCustOrderId = (String) param.get("extCustOrderId");
		String accNbr = (String) param.get("accNbr");
		String mktResCdName = (String) param.get("mktResCdName");
		String salesPrice = (String) param.get("salesPrice");
		String mktResInstCode = (String) param.get("mktResInstCode");
		String brand = (String) param.get("brand");
		String modelStr = (String) param.get("model");
		String color = (String) param.get("color");
		model.addAttribute("extCustOrderId", extCustOrderId);
		model.addAttribute("accNbr", accNbr);
		model.addAttribute("mktResCdName", mktResCdName);
		model.addAttribute("salesPrice", salesPrice);
		model.addAttribute("mktResInstCode", mktResInstCode);
		model.addAttribute("brand", brand);
		model.addAttribute("modelStr", modelStr);
		model.addAttribute("color", color);
		return "/ess/ess-exchange-show";
	}
	
	
}

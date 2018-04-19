package com.al.lte.portal.token.pc.controller.crm;

import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.BusiBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 发票回执打印控制层 .
 * @copyRight ailk ctc ec pso.
 */
@Controller("com.al.lte.portal.token.pc.controller.crm.PrintController")
@RequestMapping("/token/pc/print/*")
public class PrintController extends BaseController {
    private Log log = Log.getLog(PrintController.class);
    
    @Autowired
	PropertiesUtils propertiesUtils;
    
    @Resource(name = "com.al.lte.portal.bmo.crm.BusiBmo")
    private BusiBmo busiBmo;
    @Resource(name = "com.al.lte.portal.bmo.crm.OrderBmo")
    private OrderBmo orderBmo;
    @Resource(name = "com.al.lte.portal.bmo.print.PrintBmo")
    private PrintBmo printBmo;
    @Resource(name = "com.al.lte.portal.bmo.print.WriteOffPrintBmoImpl")
    private PrintBmo writeOffPrintBmoImpl;
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/iosVoucher", method = RequestMethod.POST)
   	public String printIosVoucher(@RequestParam("voucherInfo") String voucherInfo, 
   			@LogOperatorAnn String flowNum, Model model,
   			HttpServletRequest request, HttpServletResponse response) {
    	Map<String, Object> paramMap = new HashMap<String, Object>();
		paramMap = JsonUtil.toObject(voucherInfo, Map.class);
		if(paramMap.get("busiType")!=null){
			model.addAttribute("signFlag", "0");
		}else{
			model.addAttribute("signFlag", "1");
		}
    	model.addAttribute("voucherInfo", voucherInfo);
    	model.addAttribute("absolutePath", propertiesUtils.getMessage(super.getRequest().getContextPath().substring(1)));
    	//String path=request.getRequestURL();
    	return "/print/printIosVoucher";
    }
    @RequestMapping(value = "/iosInvoice", method = RequestMethod.POST)
    public String printIosInvoice(@RequestParam("invoiceParam") String invoiceParam, 
   			@LogOperatorAnn String flowNum, Model model,
   			HttpServletRequest request, HttpServletResponse response) {
    	model.addAttribute("invoiceParam", invoiceParam);
    	model.addAttribute("absolutePath", propertiesUtils.getMessage(super.getRequest().getContextPath().substring(1)));
    	return "/print/printIosInvoice";
    }
    @RequestMapping(value = "/voucher", method = RequestMethod.POST)
	public void printVoucher(@RequestParam("voucherInfo") String voucherInfo, 
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		long beginTime = System.currentTimeMillis();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try {
			paramMap = JsonUtil.toObject(voucherInfo, Map.class);
			
			if(paramMap.get("result")!=null){
				Calendar calendar = Calendar.getInstance();
				Map result = (Map) paramMap.get("result");
				Map orderListInfo = (Map)result.get("orderListInfo");
				orderListInfo.put("areaId", sessionStaff.getCurrentAreaId());
				orderListInfo.put("areaName", sessionStaff.getCurrentAreaName());
				orderListInfo.put("channelId", sessionStaff.getCurrentChannelId());
				orderListInfo.put("channelName", sessionStaff.getCurrentChannelName());
				orderListInfo.put("olId", paramMap.get("olId"));
				orderListInfo.put("olNbr", paramMap.get("soNbr"));
				orderListInfo.put("soDate", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy-MM-dd HH:mm:ss"));
				orderListInfo.put("staffId", sessionStaff.getStaffId());
				orderListInfo.put("staffName", sessionStaff.getStaffName());
				orderListInfo.put("staffNumber", sessionStaff.getStaffCode());
			}
			String printVoucher="";
			if(!"".equals(sessionStaff.getAreaId())){
				String printVouchers="printVoucher";
				if(!CommonMethods.isOINet(request)){
					printVouchers+="O";
				}
				printVoucher=MySimulateData.getInstance().getNeeded((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),InterfaceClient.CHECK_LOGIN+"-"+ sessionStaff.getAreaId().substring(0, 3)+"0000", printVouchers);
				if(StringUtils.isBlank(printVoucher)){
					paramMap.remove("signFlag");
				}
			}else {
				paramMap.remove("signFlag");
			}
			Map<String, Object> resultMap = printBmo.printVoucher(paramMap, flowNum,
					super.getRequest(), response);
			if (MapUtils.isNotEmpty(resultMap)) {
				String signFlag = MapUtils.getString(paramMap, "signFlag");
				if("3".equals(signFlag)){
					if(printVoucher.indexOf("?")!=-1){
						printVoucher=printVoucher+"&olId="+paramMap.get("olId");
					}else{
						printVoucher=printVoucher+"?olId="+paramMap.get("olId");
					}
					response.sendRedirect(printVoucher);
				}
//				return super.successed(resultMap);
			} else {
				//试试转到错误页面
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
//				return super.failed("打印回执失败", ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("打印回执异常", e);
			try {
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
			} catch (Exception e1) {
			}
		} catch (InterfaceException ie) {
			log.error(ie);
			try {
				JsonResponse jsonResponse = failed(ie, paramMap, ErrorCode.PRINT_VOUCHER);
				Map<String, Object> errorMap = new HashMap<String, Object>();
				errorMap.put("code", "-2");
				errorMap.put("data", jsonResponse.getData());
				String errorJson = JsonUtil.toString(errorMap);
				request.setAttribute("errorJson", errorJson);
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
//				response.sendRedirect(request.getContextPath() + "/error/500.jsp");
			} catch (Exception e1) {
				
			}
		} catch (Exception e) {
			log.error(e);
			DataBus db = new DataBus();
			db.setParammap(paramMap);
			String msg = "打印回执报错";
			//主动记录日志
//			InterfaceClient.writeErrorLog(msg, "", e.getMessage(), db, null, PortalServiceCode.PRINT_INVOICE, "", sessionStaff, "", beginTime);
			try {
				JsonResponse jsonResponse = failed(ErrorCode.PRINT_VOUCHER, e, paramMap);
				Map<String, Object> errorMap = new HashMap<String, Object>();
				errorMap.put("code", "-2");
				errorMap.put("data", jsonResponse.getData());
				String errorJson = JsonUtil.toString(errorMap);
				request.setAttribute("errorJson", errorJson);
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
//				response.sendRedirect(request.getContextPath() + "/error/500.jsp");
			} catch (Exception e1) {
				
			}
		}
	}
    
    
//    @RequestMapping(value = "/reprint", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String reprint(String paramString, Model model,
    		HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"print/reprint"));
		
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String endTime = f.format(c.getTime());
		c.add(Calendar.DATE, -7); // 时间范围初始化为7天内
		String startTime = f.format(c.getTime());
		
		model.addAttribute("startTime", startTime);
		model.addAttribute("endTime", endTime);
		
		return "/print/reprint-preview";
    }
    
	@RequestMapping(value = "/list", method = RequestMethod.POST)
	public String list(@RequestBody Map<String, Object> param, Model model, 
			HttpServletRequest request, @LogOperatorAnn String flowNum)
			throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Integer curPage = MapUtils.getInteger(param, "curPage", 1);
		Integer pageSize = MapUtils.getInteger(param, "pageSize", 10);
		Integer totalSize = 0;
		try {
			Map<String, Object> resultMap = orderBmo.qryOrderList(param, flowNum, sessionStaff);
			
			if (resultMap != null && resultMap.containsKey("orderListDetailInfo")) {
				resultMap = (Map<String, Object>) resultMap.get("orderListDetailInfo");
				list = (List) resultMap.get("orderListInfo");
				resultMap = (Map<String, Object>) resultMap.get("page");
				curPage = MapUtils.getInteger(resultMap, "curPage", 1);
				totalSize = MapUtils.getInteger(resultMap, "totalSize", 0);
			}
			
		} catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.ORDER_QUERY);
		} catch (Exception e) {
			
			log.error("门户重打回执时订单查询/print/list方法异常", e);
			return super.failedStr(model, ErrorCode.ORDER_QUERY, e, param);
		}
		
		PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(curPage, pageSize, totalSize < 1 ? 1 : totalSize, list);
		model.addAttribute("pageModel", pm);

		return "/print/reprint-list";
	}
    
    /**
     * @param paramMap
     * @param flowNum
     * @param request
     * @param response
     */
    @RequestMapping(value = "/getInvoiceItems", method = RequestMethod.POST)
    @ResponseBody
	public JsonResponse getInvoiceItems(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			
			Map<String, Object> resultMap = printBmo.getInvoiceItems(paramMap, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(resultMap)) {
				return super.successed(resultMap);
			} else {
				return super.failed("获取可打印费用项失败", ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException be) {
			this.log.error("门户/print/getInvoiceItems方法be异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.GET_INVOICE_ITEMS);
		} catch (Exception e) {
			log.error("门户/print/getInvoiceItems方法异常", e);
			return super.failed(ErrorCode.GET_INVOICE_ITEMS, e, paramMap);
		}
    }
    
    @RequestMapping(value = "/getInvoiceTemplates", method = RequestMethod.POST)
    @ResponseBody
	public JsonResponse getInvoiceTemplates(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			Map<String, Object> resultMap =new HashMap();
			String busiType = MapUtils.getString(paramMap,"busiType","101");
			//再从缓存中获取全部模板，如果没有，则调接口查询
			List<Map<String, Object>> allList = DataRepository.getInstence().getTemplateList(sessionStaff.getAreaId(),busiType,sessionStaff.getPartnerId());
			if (allList == null || allList.size() == 0) {
				resultMap = printBmo.getInvoiceTemplates(new HashMap<String, Object>(), flowNum, sessionStaff);
				if (MapUtils.isEmpty(resultMap)) {
					return super.failed("获取打印模板失败", ResultConstant.FAILD.getCode());
				}
				allList = DataRepository.getInstence().getTemplateList(sessionStaff.getAreaId(),busiType,sessionStaff.getPartnerId());
			}
			if (allList != null && allList.size() > 0) {
                resultMap.put("resultCode", ResultCode.R_SUCCESS);
                resultMap.put("resultMsg", "success");
                resultMap.put("length", allList.size());
                resultMap.put("tempList", allList);
                return super.successed(resultMap);
            } else {
                return super.failed("没有获取到可用的打印模板", ResultConstant.FAILD.getCode());
            }
		} catch (BusinessException be) {
			this.log.error("门户/print/getInvoiceTemplates方法be异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.GET_INVOICE_TEMPLATES);
		} catch (Exception e) {
			log.error("门户/print/getInvoiceTemplates方法异常", e);
			return super.failed(ErrorCode.GET_INVOICE_TEMPLATES, e, paramMap);
		}
    }
    
    @RequestMapping(value = "/saveInvoiceInfo", method = RequestMethod.POST)
    @ResponseBody
	public JsonResponse saveInvoiceInfo(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			
			Map<String, Object> resultMap = printBmo.saveInvoiceInfo(
					paramMap, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(resultMap)) {
				return super.successed(resultMap);
			} else {
				return super.failed("发票打印处理失败", ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException be) {
			this.log.error("门户/print/saveInvoiceInfo方法be异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.SAVE_INVOICE_INFO);
		} catch (Exception e) {
			log.error("门户/print/saveInvoiceInfo方法异常", e);
			return super.failed(ErrorCode.SAVE_INVOICE_INFO, e, paramMap);
		}
    }
    
    @RequestMapping(value = "/invoice", method = RequestMethod.POST)
	public void printInvoice(@RequestParam("invoiceParam") String invoiceParam, 
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		long beginTime = System.currentTimeMillis();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try {
			String invoiceDec = URLDecoder.decode(invoiceParam, "UTF-8");
//			invoiceDec = URLDecoder.decode(invoiceDec, "UTF-8");
			paramMap = JsonUtil.toObject(invoiceDec, Map.class);
			
			//判断模板是否存在
			Map<String, Object> templateInfoMap = null;
			//List<Map<String, Object>> tempList = (List<Map<String, Object>>) ServletUtils.getSessionAttribute(request, SysConstant.TEMPLATE_LIST);
			String busiType = MapUtils.getString(paramMap, "busiType", "101");
			List<Map<String, Object>> tempList = DataRepository.getInstence().getTemplateList(sessionStaff.getAreaId(),busiType,sessionStaff.getPartnerId());
			int templateId = MapUtils.getIntValue(paramMap, "templateId", -1);
			for (int i = 0; tempList != null && i < tempList.size(); i++) {
				templateInfoMap = tempList.get(i);
				if (templateId == MapUtils.getIntValue(templateInfoMap, "templateId", -2)) {
					break;
				}
				templateInfoMap = null;
			}
			//如果templateInfoMap为空，则不存在模板，返回失败
			if (templateInfoMap == null &&
					SysConstant.APPDESC_LTE.equals(propertiesUtils.getMessage(SysConstant.APPDESC))) {
				request.setAttribute("errorMsg", "找不到对应的发票模板");
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
				return;
			}
			
			Map<String, Object> resultMap = new HashMap();
			if("103".equals(busiType)){//充值票据打印
				resultMap = printBmo.printChargeReceipt(paramMap, flowNum, 
						super.getRequest(), response, templateInfoMap);
			}else if("102".equals(busiType)){//月结销账发票打印
				resultMap = writeOffPrintBmoImpl.printInvoice(paramMap, flowNum, 
						super.getRequest(), response, templateInfoMap);
			}else{//一次性费用（受理类）发票打印
			    resultMap = printBmo.printInvoice(paramMap, flowNum,
						super.getRequest(), response, templateInfoMap);
			}
			if (MapUtils.isNotEmpty(resultMap)) {
				return ;
			} else {
				//试试转到错误页面
				response.sendRedirect(request.getContextPath() + "/error/500.jsp");
//				return super.failed("打印回执失败", ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("打印发票异常", e);
			try {
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
			} catch (Exception e1) {
			}
		} catch (InterfaceException ie) {
			log.error(ie);
			try {
				JsonResponse jsonResponse = failed(ie, paramMap, ErrorCode.PRINT_INVOICE);
				Map<String, Object> errorMap = new HashMap<String, Object>();
				errorMap.put("code", "-2");
				errorMap.put("data", jsonResponse.getData());
				String errorJson = JsonUtil.toString(errorMap);
				request.setAttribute("errorJson", errorJson);
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
//				response.sendRedirect(request.getContextPath() + "/error/500.jsp");
			} catch (Exception e1) {
				
			}
		} catch (Exception e) {
			log.error(e);
			DataBus db = new DataBus();
			db.setParammap(paramMap);
			String msg = "打印发票报错";
			//主动记录日志
//			InterfaceClient.writeErrorLog(msg, "", ExceptionUtils.getFullStackTrace(e), db, null, PortalServiceCode.PRINT_INVOICE, "", sessionStaff, "", beginTime);
			try {
				JsonResponse jsonResponse = failed(ErrorCode.PRINT_INVOICE, e, paramMap);
				Map<String, Object> errorMap = new HashMap<String, Object>();
				errorMap.put("code", "-2");
				errorMap.put("data", jsonResponse.getData());
				String errorJson = JsonUtil.toString(errorMap);
				request.setAttribute("errorJson", errorJson);
//				request.setAttribute("errorMsg", e.getMessage());
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
//				response.sendRedirect(request.getContextPath() + "/error/500.jsp");
			} catch (Exception e1) {
				
			}
		}
	}
    
    /**
     * @param paramMap
     * @param flowNum
     * @param request
     * @param response
     */
    @RequestMapping(value = "/invalidInvoices", method = RequestMethod.POST)
    @ResponseBody
	public JsonResponse invalidInvoices(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			
			Map<String, Object> resultMap = printBmo.invalidInvoices(paramMap, flowNum, sessionStaff);
			return super.successed(resultMap);
			
		} catch (BusinessException be) {
			this.log.error("门户/print/invalidInvoices方法be异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.INVOICE_INVALID);
		} catch (Exception e) {
			log.error("门户/print/invalidInvoices方法异常", e);
			return super.failed(ErrorCode.INVOICE_INVALID, e, paramMap);
		}
    }
    
    
    @RequestMapping(value = "/getInvoiceInfo", method = RequestMethod.POST)
    @ResponseBody
	public JsonResponse getInvoiceInfo(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			
			Map<String, Object> resultMap = printBmo.getInvoiceInfo(paramMap, flowNum, sessionStaff);
			return super.successed(resultMap);
			
		} catch (BusinessException be) {
			this.log.error("门户/print/getInvoiceInfo方法be异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.GET_INVOICE_INFO);
		} catch (Exception e) {
			log.error("门户/print/getInvoiceInfo方法异常", e);
			return super.failed(ErrorCode.GET_INVOICE_INFO, e, paramMap);
		}
    }
    
    @RequestMapping(value = "/queryConstConfig", method = RequestMethod.GET)
    @ResponseBody
	public JsonResponse queryConstConfig(@RequestParam Map<String, Object> paramMap,Model model) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			
			String paramSingle= MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"do_single_sign");
			boolean needSingleSign = BooleanUtils.toBoolean(paramSingle);
			Map<String, Object> resultMap=new HashMap<String, Object>();
			if(needSingleSign){
				resultMap=printBmo.queryConstConfig(paramMap, "", sessionStaff);
			}
			return super.successed(resultMap);
			
		} catch (BusinessException be) {
			this.log.error("门户处理营业受理的service/intf.soService/querySoConstConfigByConditions服务返回的数据异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.QUERY_CONST_CONFIG);
		} catch (Exception e) {
			log.error("门户处理营业受理的service/intf.soService/querySoConstConfigByConditions服务返回的数据异常", e);
			return super.failed(ErrorCode.QUERY_CONST_CONFIG, e, paramMap);
		}
    }
}

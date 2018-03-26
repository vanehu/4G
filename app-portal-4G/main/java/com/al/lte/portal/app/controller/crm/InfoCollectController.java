package com.al.lte.portal.app.controller.crm;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.common.utils.StringUtil;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.SignBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.RedisUtil;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 翼销售橙分期业务
 * 
 * @author yanghm
 * @version V1.0 2016-12-02
 * @createDate 2016-12-02 上午10:03:44 
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.app.controller.crm.InfoCollectController")
@RequestMapping("/app/infocollect/*")
public class InfoCollectController extends BaseController{
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.print.PrintBmo")
	private PrintBmo printBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
	private MktResBmo MktResBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	
	/**
	 * 手机客户端-实名信息采集新增入口
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 * @throws BusinessException 
	 */
	@RequestMapping(value = "/realname/prepare", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String realNamePrepare(@RequestBody Map<String, Object> params, HttpServletRequest request,Model model, @LogOperatorAnn String optFlowNum,HttpSession session) throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String channelCode =sessionStaff.getCurrentChannelCode();
    	String channelName=sessionStaff.getCurrentChannelName();
    	String areaName=sessionStaff.getCurrentAreaName();
    	String AppKey = SysConstant.CSB_SRC_SYS_ID_APP;
		String ymdStr = DateFormatUtils.format(new Date(), "yyyyMMdd");
		String str10 = "";
		String nonce = RandomStringUtils.randomNumeric(5); //随机字符串
		DataBus _db = null;
		_db = ServiceClient.callService(new HashMap(), PortalServiceCode.SERVICE_GET_LOG_SEQUENCE, null, sessionStaff);
		str10 = nonce + String.format("%05d", _db.getReturnlmap().get("logSeq"));
		String TransactionID = AppKey+ymdStr+str10;
		model.addAttribute("TransactionID", TransactionID);
    	model.addAttribute("channelCode", channelCode);
    	model.addAttribute("channelName", channelName);
    	model.addAttribute("areaName", areaName);
		return "/app/infoCollect/real-info-collect";
    }
	
	/**
	 * 采集单提交
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/collectionOrderCommit", method = {RequestMethod.POST})
	public @ResponseBody JsonResponse collectionOrderCommit(@RequestBody Map<String, Object> param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = orderBmo.cltOrderSubmit(param,null,sessionStaff);
        	if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
	        	Map<String, Object> result = (Map<String, Object>) resMap.get("result");
	        	String olId = (Long) result.get("orderId")+"";
	            String  soNbr = (String) result.get("orderNbr");
	        	if(StringUtil.isEmpty(olId)||StringUtil.isEmpty(soNbr)){
	                jsonResponse = super.failed("返回采集单号为空", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
	            }else{
	                param.put("orderId", olId);
	                param.put("orderNbr", soNbr);
	                jsonResponse = super.successed(param, ResultConstant.SUCCESS.getCode());
	            }
        	} else {
                jsonResponse = super.failed(resMap.get("resultMsg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, param, ErrorCode.CLTORDER_SUBMIT);
		} catch (Exception e) {
			return super.failed(ErrorCode.CLTORDER_SUBMIT, e, param);
		}
        return jsonResponse;
	}
	/**
	 * 采集单确认
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/collectionOrderConfirm", method = {RequestMethod.POST})
	public @ResponseBody JsonResponse collectionOrderConfirm(@RequestBody Map<String, Object> param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	
        	 Map<String, Object> paramMap = new HashMap<String, Object>();
             String orderId = MapUtils.getString(param, "orderId");
             if(StringUtils.isEmpty(orderId)){
                 jsonResponse = super.failed("采集单号为空，不能提交确认，请重试！", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
                 return jsonResponse;
             }
             paramMap.put("orderId", orderId);
             paramMap.put("ifExp", "N");
             Map<String, Object> resMap = orderBmo.cltOrderCommit(paramMap, null, sessionStaff);
             if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
             	jsonResponse = super.successed(ResultConstant.SUCCESS);
             } else {
                 jsonResponse = super.failed(resMap.get("resultMsg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
             }
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, param, ErrorCode.CLTORDER_COMMIT);
		} catch (Exception e) {
			return super.failed(ErrorCode.CLTORDER_COMMIT, e, param);
		}
        return jsonResponse;
	}
	
	@RequestMapping(value = "/gotosubmitOrder", method = RequestMethod.POST)
	public String gotosubmitOrder(@RequestBody Map<String, Object> param,Model model
			,HttpServletResponse response,HttpServletRequest request){
		model.addAttribute("resMap",param);
		model.addAttribute("resMapJson", JsonUtil.buildNormal().objectToJson(param));
		return "/app/infoCollect/info-confirm";
	}
	
	@RequestMapping(value = "/infoPrint", method = RequestMethod.POST)
	public String infoPrint(@RequestBody Map<String, Object> param,Model model
			,HttpServletResponse response,HttpServletRequest request){
		model.addAttribute("resMap",param);
		return "/app/infoCollect/info-print";
	}
//	 @SuppressWarnings("unchecked")
//		@RequestMapping(value = "/custCltReceipt", method = RequestMethod.POST)
//	    public void custCltReceipt(@RequestBody Map<String, Object> params, @LogOperatorAnn String flowNum, HttpServletRequest request, HttpServletResponse response){
//	    	
//	    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
//	    	params.put("areaId", sessionStaff.getCurrentAreaId());
//	    	params.put("printType", SysConstant.PRINT_TYPE_HTML);
//	    	
//	    	params.put("signFlag", SysConstant.PREVIEW_SIGN_PDF);
//			try {
//				Map<String, Object> resultMap = printBmo.printCustCltReceiptApp(params, flowNum, sessionStaff, response);
//				if (MapUtils.isNotEmpty(resultMap)) {
//					Map<String,Object> reObject=signBmo.setPrintInfos(resultMap,super.getRequest(),params);
//					RedisUtil.set("mgrPdf_"+ params.get("olId").toString(), reObject.get("pp"));	
//					reObject.remove("pp");
//					model.addAllAttributes(reObject);
//					model.addAttribute("custName", resultMap.get("custName"));
//					model.addAttribute("idCardNbr", resultMap.get("idCardNbr"));
//				}
//			}catch (BusinessException be) {
//				return super.failedStr(model, be);
//			} catch (InterfaceException ie) {
//				return super.failedStr(model, ie, paramMap, ErrorCode.PRINT_VOUCHER);
//			} catch (Exception e) {
//				return super.failedStr(model,ErrorCode.PRINT_VOUCHER, e, paramMap);
//			}
//			if(paramMap.get("enter")!=null){//新版ui
//				return "/app/order_new/printVoucher";
//			}
//	    	return "/app/print/printVoucher";
//	    	
//	    	
//	    	
//	    	try {
//				String resultCode = printBmo.printCustCltReceipt(params, flowNum, sessionStaff, response);
//				if(ResultCode.R_SUCC.equals(resultCode)){
//					return;
//				}else{
//					response.sendRedirect(request.getContextPath() + "/error/500.jsp");
//				}
//			} catch (BusinessException e) {
//				try {
//					request.getRequestDispatcher("/error/500.jsp").forward(request, response);
//				} catch (Exception e1) {
//					
//				}
//			} catch (InterfaceException ie) {
//				try {
//					JsonResponse jsonResponse = failed(ie, params, ErrorCode.CLTORDER_INFO_PRINT);
//					Map<String, Object> errorMap = new HashMap<String, Object>();
//					errorMap.put("code", "-2");
//					errorMap.put("data", jsonResponse.getData());
//					String errorJson = JsonUtil.toString(errorMap);
//					request.setAttribute("errorJson", errorJson);
//					request.getRequestDispatcher("/error/500.jsp").forward(request, response);
//				} catch (Exception e1) {
//			
//				}
//			} catch (Exception e) {
//				DataBus db = new DataBus();
//				db.setParammap(params);
//				try {
//					JsonResponse jsonResponse = failed(ErrorCode.CLTORDER_INFO_PRINT, e, params);
//					Map<String, Object> errorMap = new HashMap<String, Object>();
//					errorMap.put("code", "-2");
//					errorMap.put("data", jsonResponse.getData());
//					String errorJson = JsonUtil.toString(errorMap);
//					request.setAttribute("errorJson", errorJson);
//					request.getRequestDispatcher("/error/500.jsp").forward(request, response);
//				} catch (Exception e1) {
//			
//				}
//			}
//	    }
}

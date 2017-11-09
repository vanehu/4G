package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.time.DateFormatUtils;
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
import com.al.ecs.common.util.MapUtil;
import com.al.ecs.common.util.StringUtil;
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
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.SignBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.common.DataSignResultModel;
import com.al.lte.portal.common.DataSignTool;
import com.al.lte.portal.common.RedisUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.common.print.PdfUtils;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;
@Controller("com.al.lte.portal.controller.crm.SignController")
@RequestMapping("/order/sign/*")
public class SignController extends BaseController {
    private Log log = Log.getLog(SignController.class);
    @Resource(name = "com.al.lte.portal.bmo.print.PrintBmo")
    private PrintBmo printBmo;
    @Resource(name = "com.al.lte.portal.bmo.crm.SignBmo")
    private SignBmo signBmo;
    @Resource(name ="com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
    /*@RequestMapping(value = "/signVoucher", method = RequestMethod.GET)
   	public String signVoucher(Model model) {
    	return "/sign/signVoucher";
    }
    @RequestMapping(value = "/voucherForSign", method = RequestMethod.GET)
   	public String voucherForSign(Model model,HttpServletRequest request) {
    	String olId=request.getParameter("olId");
    	String soNbr=request.getParameter("soNbr");
    	log.debug("olId={}", olId);
    	model.addAttribute("olId",olId);
    	model.addAttribute("soNbr", soNbr);
    	return "/print/voucherForSign";
    }*/
    /**
     * 返回根据模板生成预览的html
     * @param paramMap
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/previewForSign", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse previewForSign(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
    	paramMap.put("signFlag", SysConstant.PREVIEW_SIGN);
		JsonResponse jsonResponse = null;
		try {
			Map<String, Object> resultMap = printBmo.printVoucher(paramMap, flowNum,
					super.getRequest(), response);
			if (MapUtil.isNotEmpty(resultMap)) {
				if(resultMap.get("code").equals("0")){
					if(paramMap.get("PcFlag")!=null&&paramMap.get("PcFlag").equals("0")){
						resultMap.put("htmlStr", DataSignTool.getbody(resultMap.get("htmlStr").toString()));
					}
					log.debug("htmlStr={}", JsonUtil.toString(resultMap.get("htmlStr")));
					jsonResponse=super.successed(resultMap.get("htmlStr"), ResultConstant.SUCCESS.getCode());
				}else{
					jsonResponse = super.failed(resultMap.get("msg").toString(),
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			} else {
				jsonResponse = super.failed("回执异常",
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (Exception e) {
			return super.failed(ErrorCode.PRINT_VOUCHER, e, paramMap);
		}
    	return jsonResponse;
    }
    
    /**
     * 返回根据模板生成预览的html
     * @param paramMap
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/previewHtmlForSign", method = RequestMethod.POST)
	public String previewHtmlForSign(@RequestBody Map<String, Object> paramMap,Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response, HttpServletRequest request) {
    	paramMap.put("signFlag", SysConstant.PREVIEW_SIGN_PDF);
    	if (request.getSession().getAttribute("APP_OL_ID") != null) {
    		paramMap.put("olId", request.getSession().getAttribute("APP_OL_ID").toString());
		}
		try {
			Map<String, Object> resultMap = printBmo.printVoucher(paramMap, flowNum,
					super.getRequest(), response);
			if (MapUtils.isNotEmpty(resultMap)) {
				resultMap.put("actionFlag", paramMap.get("actionFlag").toString());
				resultMap.put("voice_prepare", paramMap.get("voice_prepare").toString());
				resultMap.put("main_offer", paramMap.get("main_offer").toString());
				Map<String,Object> reObject=signBmo.setPrintInfos(resultMap,super.getRequest(),paramMap);
				RedisUtil.set("mgrPdf_"+ paramMap.get("olId").toString(), reObject.get("pp"));	
				reObject.remove("pp");
				model.addAllAttributes(reObject);
				model.addAttribute("custName", resultMap.get("custName"));
				model.addAttribute("idCardNbr", resultMap.get("idCardNbr"));
			}
		}catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.PRINT_VOUCHER);
		} catch (Exception e) {
			return super.failedStr(model,ErrorCode.PRINT_VOUCHER, e, paramMap);
		}
		if(paramMap.get("enter")!=null){//新版ui
			return "/app/order_new/printVoucher";
		}
    	return "/app/print/printVoucher";
    }
    
    /**
	 * 手机客户端-宽带甩单-回执信息
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/broadband_prodInfoForSign", method = RequestMethod.POST)
	public @ResponseBody JsonResponse broadbandprodInfoForSign(@RequestBody Map<String, Object> reqMap, String optFlowNum,
			HttpServletResponse response,HttpServletRequest request){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String cityid = sessionStaff.getAreaId();//市
		cityid = cityid.substring(0, 5) + "00";//市
		reqMap.put("areaId", cityid);
		JsonResponse jsonResponse = null;
			try {
				Map<String, Object> prtMap = printBmo.queryOrderListInfoForPrintZT(reqMap, optFlowNum,super.getRequest(), response);
	 			if (prtMap != null&& ResultCode.R_SUCCESS.equals(prtMap.get("code").toString())) {
	 				jsonResponse = super.successed(prtMap,ResultConstant.SUCCESS.getCode());
	 			}else{
	 				jsonResponse = super.failed(ErrorCode.ORDER_SUBMIT, prtMap, reqMap);
				}
	        }catch (Exception e) {
				return super.failed(ErrorCode.ORDER_SUBMIT, e, reqMap);
			}
			return jsonResponse;
	}
	
    /**
     * 返回根据模板生成预览的html_宽带甩单
     * @param paramMap
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/broadband_previewHtmlForSign", method = RequestMethod.POST)
	public String broadbandPreviewHtmlForSign(@RequestBody Map<String, Object> paramMap,Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	paramMap.put("signFlag", SysConstant.PREVIEW_SIGN_PDF);
		try {
			Map<String,Object> result = (Map<String, Object>) paramMap.get("result");
			Map<String,Object> orderListInfo = (Map<String, Object>) result.get("orderListInfo");
			orderListInfo.put("areaId", sessionStaff.getCurrentAreaId());
			orderListInfo.put("areaName", sessionStaff.getCurrentAreaName());
			orderListInfo.put("channelId", sessionStaff.getCurrentChannelId());
			orderListInfo.put("channelName", sessionStaff.getCurrentChannelName());
			orderListInfo.put("soDate", DateFormatUtils.format(new Date(), "yyyy-MM-dd"));
			orderListInfo.put("staffId", sessionStaff.getStaffId());
			orderListInfo.put("staffName", sessionStaff.getStaffName());
			orderListInfo.put("staffNumber", sessionStaff.getStaffCode());
			Map<String, Object> resultMap = printBmo.printVoucher(paramMap, flowNum,super.getRequest(), response);
			System.out.println("+++++++++++++++++++"+JsonUtil.toString(resultMap));
			if (MapUtils.isNotEmpty(resultMap)) {
				Map<String,Object> reObject=signBmo.setPrintInfos(resultMap,super.getRequest(),paramMap);
				RedisUtil.set("mgrPdf_"+ paramMap.get("olId").toString(), reObject.get("pp"));	
				reObject.remove("pp");
				model.addAllAttributes(reObject);
				System.out.println("--------------------"+JsonUtil.toString(reObject));
				model.addAttribute("custName", resultMap.get("custName"));
				model.addAttribute("idCardNbr", resultMap.get("idCardNbr"));
			}
		}catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.PRINT_VOUCHER);
		} catch (Exception e) {
			return super.failedStr(model,ErrorCode.PRINT_VOUCHER, e, paramMap);
		}
    	return "/app/print/broadband-printVoucher";
    }
    
    /**
     * 返回根据模板生成预览的html
     * @param paramMap
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/previewHtmlForAgentSign", method = RequestMethod.POST)
	public String previewHtmlForAgentSign(@RequestBody Map<String, Object> paramMap,Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
    	paramMap.put("signFlag", SysConstant.PREVIEW_SIGN_PDF);
		try {
			Map<String, Object> resultMap = printBmo.printVoucher(paramMap, flowNum,
					super.getRequest(), response);
			if (MapUtils.isNotEmpty(resultMap)) {
				Map<String,Object> reObject=signBmo.setPrintInfos(resultMap,super.getRequest(),paramMap);
				RedisUtil.set("mgrPdf_"+ paramMap.get("olId").toString(), reObject.get("pp"));	
				reObject.remove("pp");
				model.addAllAttributes(reObject);
				model.addAttribute("custName", resultMap.get("custName"));
				model.addAttribute("idCardNbr", resultMap.get("idCardNbr"));
			}
		}catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.PRINT_VOUCHER);
		} catch (Exception e) {
			return super.failedStr(model,ErrorCode.PRINT_VOUCHER, e, paramMap);
		}
    	return "/agent/print/printVoucher";
    }
    @RequestMapping(value = "/saveSignPdfForApp", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
	public @ResponseBody JsonResponse saveSignPdfForAppTemp(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
    	JsonResponse jsonResponse=null;
    	Map<String, Object> errorMap = new HashMap<String, Object>();
    	try {
    		if (request.getSession().getAttribute("APP_OL_ID") != null) {
        		paramMap.put("olId", request.getSession().getAttribute("APP_OL_ID").toString());
    		}
    		Object obj=RedisUtil.get("mgrPdf_"+ paramMap.get("olId").toString());
			Map<String,Object> orderInfo=null;
			if(obj!=null){
				orderInfo=(Map<String,Object>)obj;
				paramMap.put("sign", paramMap.get("sign").toString().replaceAll("\\(p/\\)", "="));
				paramMap.put("orderInfo", orderInfo);
				Map<String, Object> resultMap = printBmo.printVoucher(paramMap, flowNum,
						super.getRequest(), response);
				if (MapUtils.isNotEmpty(resultMap)) {
					if (ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
						RedisUtil.remove("mgrPdf_"+ paramMap.get("olId").toString());
		 				jsonResponse = super.successed("签名文件上传成功",
		 						ResultConstant.SUCCESS.getCode());
		 			} else {
		 				errorMap.put("errData", resultMap.get("msg"));
		 				jsonResponse = super.failed(errorMap,
		 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		 			}
				} else {
					errorMap.put("errData", "回执签名文件生成调用异常");
					jsonResponse = super.failed(errorMap,
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			}else{
				errorMap.put("errData", "从缓存中取预览的pdf异常");
				jsonResponse = super.failed(errorMap,
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
			return jsonResponse;
		} catch (BusinessException e) {
			return jsonResponse=super.failed(e);
		} catch (InterfaceException ie) {
			return jsonResponse=super.failed(ie, paramMap, ErrorCode.SAVE_SIGN_PDF);
		} catch (Exception e) {
			return jsonResponse=super.failed(ErrorCode.SAVE_SIGN_PDF, e, paramMap);
		}
    }
    
    
    @RequestMapping(value = "/saveCollectionSignPdfForApp", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
	public @ResponseBody JsonResponse saveCollectionSignPdfForApp(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
    	JsonResponse jsonResponse=null;
    	Map<String, Object> errorMap = new HashMap<String, Object>();
    	try {
    		Object obj=RedisUtil.get("mgrPdf_"+ paramMap.get("orderNbr").toString());
			Map<String,Object> orderInfo=null;
			if(obj!=null){
				orderInfo=(Map<String,Object>)obj;
				paramMap.put("sign", paramMap.get("sign").toString().replaceAll("\\(p/\\)", "="));
				paramMap.put("orderInfo", orderInfo);
				SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
				paramMap.put("areaId", sessionStaff.getCurrentAreaId());
				Map<String, Object> params = (Map<String, Object>) paramMap.get("printParam");
				params.put("areaId", sessionStaff.getCurrentAreaId());
				Map<String, Object> resultMap = printBmo.printCustCltReceiptApp(params, flowNum,
						sessionStaff, response);
				if (MapUtils.isNotEmpty(resultMap)) {
						RedisUtil.remove("mgrPdf_"+ paramMap.get("orderNbr").toString());
		 				jsonResponse = super.successed("签名文件上传成功",
		 						ResultConstant.SUCCESS.getCode());
				} else {
					errorMap.put("errData", "回执签名文件生成调用异常");
					jsonResponse = super.failed(errorMap,
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			}else{
				errorMap.put("errData", "从缓存中取预览的pdf异常");
				jsonResponse = super.failed(errorMap,
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
			return jsonResponse;
		} catch (BusinessException e) {
			return jsonResponse=super.failed(e);
		} catch (InterfaceException ie) {
			return jsonResponse=super.failed(ie, paramMap, ErrorCode.SAVE_SIGN_PDF);
		} catch (Exception e) {
			return jsonResponse=super.failed(ErrorCode.SAVE_SIGN_PDF, e, paramMap);
		}
    }
    
    @RequestMapping(value = "/gotoPrint", method = RequestMethod.POST)
	public String gotosubmitOrder(@RequestBody Map<String, Object> param,Model model
			,HttpServletResponse response,HttpServletRequest request){
		return "/app/print/printConfirm";
	}
    
    /**
     * 电子回执下载
     * @param voucherInfo
     * @param flowNum
     * @param request
     * @param response
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/downVoucher", method = RequestMethod.POST)
	public void voucher(@RequestParam("voucherInfo") String voucherInfo, 
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try {
			paramMap = JsonUtil.toObject(voucherInfo, Map.class);
			
			Map<String, Object> resultMap = signBmo.querySignInfo(paramMap, flowNum,sessionStaff);
			if (resultMap!=null&& ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
				DataSignTool.signPdfPrint(resultMap,response);
			} else {
				//试试转到错误页面
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
			}
		} catch (BusinessException e) {
			this.log.error("电子回执下载服务异常", e);
			try {
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
			} catch (Exception e1) {
			}
		} catch (InterfaceException ie) {
			log.error(ie);
			try {
				JsonResponse jsonResponse = failed(ie, paramMap, ErrorCode.FTP_DOWNLOAD_ERROR);
				Map<String, Object> errorMap = new HashMap<String, Object>();
				errorMap.put("code", "-2");
				errorMap.put("data", jsonResponse.getData());
				String errorJson = JsonUtil.toString(errorMap);
				request.setAttribute("errorJson", errorJson);
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
			} catch (Exception e1) {
				
			}
		} catch (Exception e) {
			log.error(e);
			try {
				JsonResponse jsonResponse = failed(ErrorCode.FTP_DOWNLOAD_ERROR, e, paramMap);
				Map<String, Object> errorMap = new HashMap<String, Object>();
				errorMap.put("code", "-2");
				errorMap.put("data", jsonResponse.getData());
				String errorJson = JsonUtil.toString(errorMap);
				request.setAttribute("errorJson", errorJson);
				request.getRequestDispatcher("/error/500.jsp").forward(request, response);
			} catch (Exception e1) {
				
			}
		}
    }
    
    /**
     * 签名文件生成
     * @param voucherInfo
     * @param flowNum
     * @param request
     * @param response
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/saveSignPdf", method = RequestMethod.POST)
	public void saveSignPdf(@RequestParam("voucherInfo") String voucherInfo, 
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
		Map<String, Object> paramMap = new HashMap<String, Object>();
		JsonResponse jsonResponse = null;
		Map<String, Object> errorMap = new HashMap<String, Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
		String sealInfo="中国电信股份有限公司XX分公司";
		try {
			List<Map<String,Object>> rList=null;
			String tableName="SYSTEM";
			String columnItems="SEALINFO";
			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItems);
			if (obj != null && obj instanceof List) {
				rList = (List<Map<String, Object>>) obj;
			} else {
				Map<String, Object> pMap = new HashMap<String, Object>();
				pMap.put("tableName", tableName);
				pMap.put("columnName", columnItems);
				rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItems, rList);
				if(rList!=null&&rList.size()>0){
					List<Map<String,Object>> ll=(List<Map<String,Object>> )rList.get(0).get("SEALINFO");
					sealInfo=(String)ll.get(0).get("COLUMN_VALUE");
				}
			}
		} catch (BusinessException e) {
		} catch (InterfaceException ie) {
		} catch (Exception e) {	
		}
		String login_area_id = "";
    	Object area=request.getSession().getAttribute("padLogin_area");
    	if(area!=null&&!area.equals("")){
    		login_area_id=area.toString();
    	}else{
    		login_area_id=sessionStaff.getAreaId();
    	}
		String areaName=DataSignTool.getAreaName(login_area_id, sessionStaff);
		if(areaName==null||"".equals(areaName)){
			errorMap.put("errData", "取本地网地市信息为空");
			jsonResponse = super.failed(errorMap,
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}else{
			sealInfo=sealInfo.replaceAll("XX",areaName);
			try {
				paramMap.put("signFlag", SysConstant.SAVE_PDF);
				paramMap.put("sealInfo", sealInfo);
				if(voucherInfo==null||"".equals(voucherInfo)){
					errorMap.put("errData", "签名信息参数为空");
					jsonResponse = super.failed(errorMap,
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
				DataSignResultModel ml=DataSignTool.isRightData(voucherInfo);
				if(ml.isParseSuccess()){
					String signStr=(String)ml.getItemMap().get(DataSignResultModel.SIGN_DATA);
					Map<String,Object> jsonObj=(Map<String,Object>)ml.getItemMap().get(DataSignResultModel.ORDER_MSG);
					paramMap.putAll(jsonObj);
					paramMap.put("busiType", "1");
					paramMap.put("signStr",  signStr);
					Map<String, Object> resultMap = printBmo.printVoucher(paramMap, flowNum,
							super.getRequest(), response);
					log.debug("result={}", JsonUtil.toString(resultMap));
					if (MapUtils.isNotEmpty(resultMap)) {
						if (ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
			 				jsonResponse = super.successed("签名文件上传成功",
			 						ResultConstant.SUCCESS.getCode());
			 			} else {
			 				errorMap.put("errData", resultMap.get("msg"));
			 				jsonResponse = super.failed(errorMap,
			 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			 			}
					} else {
						errorMap.put("errData", "回执签名文件生成调用异常");
						jsonResponse = super.failed(errorMap,
								ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
					}
				}else{
					errorMap.put("errData", "签名信息参数不合法，解析有误");
					jsonResponse = super.failed(errorMap,
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			} catch (BusinessException e) {
				jsonResponse=super.failed(e);
			} catch (InterfaceException ie) {
				jsonResponse=super.failed(ie, paramMap, ErrorCode.FTP_UPLOAD_ERROR);
			} catch (Exception e) {
				jsonResponse=super.failed(ErrorCode.FTP_UPLOAD_ERROR, e, paramMap);
			}
		}
		try {
			Map<String,Object> returnMap=new HashMap<String,Object>();
			returnMap.put("data", jsonResponse.getData());
			returnMap.put("code", String.valueOf(jsonResponse.getCode()));
			String backStr=JsonUtil.toString(returnMap);
			response.setContentType("text/html;charset=UTF-8");
			response.getWriter().write(backStr);
			response.getWriter().close();
		} catch (IOException e) {
			 log.error(e);
		}
	}
    /**
     * 客户端调用回执保存服务
     * @param paramMap
     * @param flowNum
     * @param request
     * @param response
     * @return
     */
	@ResponseBody
    @RequestMapping(value = "/agreePhoto", method = RequestMethod.POST)
	public JsonResponse agreePhoto(@RequestBody Map<String, Object> param,
	        HttpServletRequest request) {
		log.debug("param={}", JsonUtil.toString(param));
    	String olId=MapUtil.asStr(param, "olId");
    	String photos=MapUtil.asStr(param, "photos");
    	JsonResponse jsonResponse=null;
    	Map<String, Object> errorMap = new HashMap<String, Object>();
    	Map<String, Object> paramMap = new HashMap<String, Object>();
    	if(StringUtil.isEmptyStr(olId)||StringUtil.isEmptyStr(photos)){
    		errorMap.put("errData", "入参有误，请确认！");
    		jsonResponse = super.failed(errorMap,
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
    	}else{
	    	try {
	    		List<Map<String, Object>> photoMap=JsonUtil.toObject(photos, List.class);
	    		List<String> photoList=new LinkedList<String>();	    
	    		if(photoMap!=null&&photoMap.size()>0){
	    			for(int i=0;i<photoMap.size();i++){
			    		String photoObj=(String)photoMap.get(i).get("datas");
			    		photoList.add(photoObj);
	    			}
	    		}
	    		Object obj=RedisUtil.get("mgrPdf_"+olId);
				Map<String,Object> orderInfo=null;
				if(obj!=null){
					orderInfo=(Map<String,Object>)obj;
					if(orderInfo.get("mgrPdf")!=null){
						if(photoList!=null&&photoList.size()>0){
							String  pdfStr=PdfUtils.imgMerageToPdf(photoList, orderInfo.get("mgrPdf").toString());
							orderInfo.put("mgrPdf",pdfStr);
							RedisUtil.set("mgrPdf_"+ olId, orderInfo);
						}
						jsonResponse = super.successed("协议拍照上传成功",
		 						ResultConstant.SUCCESS.getCode());
					}else{
						errorMap.put("errData", "从缓存中取预览的pdf异常");
						jsonResponse = super.failed(errorMap,
								ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
					}
				}else{
					errorMap.put("errData", "从缓存中取预览的pdf异常");
					jsonResponse = super.failed(errorMap,
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			} catch (Exception e) {
				jsonResponse=super.failed(ErrorCode.PRINT_VOUCHER, e, paramMap);
			}
    	}
    	return jsonResponse;
//    	try {
//			Map<String,Object> returnMap=new HashMap<String,Object>();
//			if(jsonResponse.getCode()==ResultConstant.SUCCESS.getCode()){
//				returnMap.put("data", jsonResponse.getData());
//			}else{
//				returnMap.put("data", ((Map<String,Object>)jsonResponse.getData()).get("errData"));
//			}
//			returnMap.put("code", String.valueOf(jsonResponse.getCode()));
//			String backStr=JsonUtil.toString(returnMap);
//			response.setContentType("text/html;charset=UTF-8");
//			response.getWriter().write(backStr);
//			response.getWriter().close();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
    }
	
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/custCltReceipt", method = RequestMethod.POST)
    public String custCltReceipt(@RequestBody Map<String, Object> params, @LogOperatorAnn String flowNum, HttpServletRequest request, HttpServletResponse response,Model model){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    	params.put("areaId", sessionStaff.getCurrentAreaId());
//    	params.put("printType", "custCollection/receiptMain");
    	
    	params.put("signFlag", SysConstant.PREVIEW_SIGN_PDF);
//    	params.put("busiType", SysConstant.BUSI_TYPE_TERMINAL_ORDER);
		try {
			Map<String, Object> resultMap = printBmo.printCustCltReceiptApp(params, flowNum,
					sessionStaff, response);
			if (MapUtils.isNotEmpty(resultMap)) {
				Map<String,Object> reObject=signBmo.setPrintInfos(resultMap,super.getRequest(),params);
				RedisUtil.set("mgrPdf_"+ params.get("orderNbr").toString(), reObject.get("pp"));
				Object obj=RedisUtil.get("mgrPdf_"+ params.get("orderNbr").toString());
				reObject.remove("pp");
//				model.addAllAttributes(reObject);
				model.addAttribute("htmlStr", reObject.get("htmlStr"));
				System.out.println(reObject.get("htmlStr"));
				model.addAttribute("custName", resultMap.get("custName"));
				model.addAttribute("idCardNbr", resultMap.get("idCardNbr"));
			}
		}catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, params, ErrorCode.CLTORDER_INFO_PRINT);
		} catch (Exception e) {
			return super.failedStr(model,ErrorCode.CLTORDER_INFO_PRINT, e, params);
		}
    	return "/app/infoCollect/info-confirm";
    	
    }
}

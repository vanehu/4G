package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
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
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.SignBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.common.DataSignResultModel;
import com.al.lte.portal.common.DataSignTool;
import com.al.lte.portal.common.SysConstant;
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
			if (MapUtils.isNotEmpty(resultMap)) {
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
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
    	paramMap.put("signFlag", SysConstant.PREVIEW_SIGN_HTML);
		try {
			Map<String, Object> resultMap = printBmo.printVoucher(paramMap, flowNum,
					super.getRequest(), response);
			if (MapUtils.isNotEmpty(resultMap)) {
				model.addAttribute("htmlStr", resultMap.get("htmlStr").toString().replace("src=\"XXXXXSIGN\"", ""));
				HttpSession session=ServletUtils.getSession(getRequest());
				session.setAttribute("htmlStrSession", resultMap.get("htmlStr")+"</body></html>");
				log.debug("htmlStr={}", JsonUtil.toString(resultMap.get("htmlStr")));
			}
		}catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.PRINT_VOUCHER);
		} catch (Exception e) {
			return super.failedStr(model,ErrorCode.PRINT_VOUCHER, e, paramMap);
		}
    	return "/app/print/printVoucher";
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
    	paramMap.put("signFlag", SysConstant.PREVIEW_SIGN_HTML);
		try {
			Map<String, Object> resultMap = printBmo.printVoucherForAgent(paramMap, flowNum,
					super.getRequest(), response);
			if (MapUtils.isNotEmpty(resultMap)) {
				model.addAttribute("htmlStr", resultMap.get("htmlStr").toString().replace("src=\"XXXXXSIGN\"", ""));
				HttpSession session=ServletUtils.getSession(getRequest());
				session.setAttribute("htmlStrSession", resultMap.get("htmlStr")+"</body></html>");
				log.debug("htmlStr={}", JsonUtil.toString(resultMap.get("htmlStr")));
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
	public @ResponseBody JsonResponse saveSignPdfForApp(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum, 
			HttpServletRequest request, HttpServletResponse response) {
    	JsonResponse jsonResponse=null;
    	Map<String, Object> errorMap = new HashMap<String, Object>();
    	try {
    		HttpSession session=ServletUtils.getSession(getRequest());
//    		byte[] bytes=session.getAttribute("htmlStrSession").toString().getBytes();
//    		String orderInfo=Base64.encodeBase64String(bytes).replaceAll("\n|\r", "");
//    		String sign= java.net.URLDecoder.decode(paramMap.get("sign").toString(),"UTF-8");
    		String orderInfo=session.getAttribute("htmlStrSession").toString();
//    		String sign="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";
    		paramMap.put("orderInfo", orderInfo);
    		paramMap.put("sign", paramMap.get("sign").toString().replaceAll("<p/>", "="));
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
			return jsonResponse;
		} catch (BusinessException e) {
			return jsonResponse=super.failed(e);
		} catch (InterfaceException ie) {
			return jsonResponse=super.failed(ie, paramMap, ErrorCode.FTP_UPLOAD_ERROR);
		} catch (Exception e) {
			return jsonResponse=super.failed(ErrorCode.FTP_UPLOAD_ERROR, e, paramMap);
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
			e.printStackTrace();
		}
	}
}

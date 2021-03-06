package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.FtpUtils;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.BatchBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.ExcelUtil;
import com.al.lte.portal.common.FTPServiceUtils;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.BatchExcelTask;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.controller.crm.BatchOrderControllerLatestVer")
@RequestMapping("/order/batchOrder/latestVer/*")
public class BatchOrderControllerLatestVer  extends BaseController {
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
	private MktResBmo mktResBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.BatchBmo")
	private BatchBmo batchBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.common.FTPServiceUtils")
	private FTPServiceUtils ftpServiceUtils;

	@RequestMapping(value = "/batchForm", method = RequestMethod.GET)
	public String batchForm(Model model, HttpServletRequest request) {
		
		String olId=request.getParameter("olId");
		String olseq=request.getParameter("olseq");
		String type=request.getParameter("type");
		String areaId=request.getParameter("areaId");
		List<Map<String,Object>>time = batchBmo.getTimeListIn5Days();
		
    	model.addAttribute("time", time);
		model.addAttribute("olId", olId);
		model.addAttribute("olseq", olseq);
		model.addAttribute("batchType", type);
		model.addAttribute("areaId", areaId);
		
		return "/batchOrder/batch-order-form";
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchImport", method = RequestMethod.POST)
	public String importData(Model model, HttpServletRequest request,HttpServletResponse response,
			@LogOperatorAnn String flowNum,
			@RequestParam("upFile") MultipartFile file,
			@RequestParam("olId") String olId) {
		
		String message = "";
		String code = "-1";
		boolean isError = false;
		JsonResponse jsonResponse = null;
		String olseq = request.getParameter("olseq");
		String batchType = request.getParameter("batchType");
		String reserveDt = request.getParameter("reserveDt");
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		String currentAreaId = sessionStaff.getCurrentAreaId();
		
		if (olId == null || "".equals(olId)) {
			message = "购物id为空！";
			isError = true;
		}
		if (batchType == null || "".equals(batchType)) {
			message = "种子订单受理类型为空！";
			isError = true;
		}
		if (reserveDt == null || "".equals(reserveDt)) {
			message = "预约时间为空！";
			isError = true;
		}
		
		if (null != file) {
			boolean oldVersion = true;
			String fileName = file.getOriginalFilename();
			if (fileName.matches("^.+\\.(?i)(xls)$")) {
				oldVersion = true;
			} else if (fileName.matches("^.+\\.(?i)(xlsx)$")) {
				oldVersion = false;
			} else {
				message = "导入的文件类型错误，后缀必须为.xls或.xlsx！";
				isError = true;
			}
			if (!isError) {
				Workbook workbook = null;
				try {
					if (oldVersion) {// 2003版本Excel(.xls)
						workbook = new HSSFWorkbook(file.getInputStream());
					} else {// 2007版本Excel或更高版本(.xlsx)
						workbook = new XSSFWorkbook(file.getInputStream());
					}
				} catch (Exception e) {
					message = "文件读取异常：" + e;
					isError = true;
				}
				if (!isError) {
					Map<String,Object> checkResult=null;
					boolean checkResultFlag = false;
					String custStr = sessionStaff.getCustId() +"/"+ sessionStaff.getPartyName() +"/" + sessionStaff.getCardNumber()+"/"+sessionStaff.getCardType();
					Map<String, Object> sessionCustInfo = (Map<String, Object>) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_CURRENT_CUST_INFO);

					checkResult =  batchBmo.readExcel(new BatchExcelTask(workbook, null, batchType, sessionStaff));
					if("0".equals(MapUtils.getString(checkResult, "code", ""))){
						checkResultFlag = true;
					} else{
						message = "批量校验<br/>" + MapUtils.getString(checkResult, "errorData", "");
					}
					
					//Excel校验是否成功
					if(checkResultFlag){
						Map<String, Object> param = new HashMap<String, Object>();
						Map<String, Object> busMap = new HashMap<String, Object>();
						Map<String, Object> ftpResultMap = null;
						
						param.put("custOrderId", olId);
						param.put("custId", custStr);
						param.put("encryptCustName", MapUtils.getString(sessionCustInfo, "CN", "客户定位未获取到CN字段"));//加密后的姓名
						param.put("encryptAddress", MapUtils.getString(sessionCustInfo, "address", "客户定位未获取到address字段"));//加密后的客户地址
						param.put("encryptCertNum", MapUtils.getString(sessionCustInfo, "certNum", "客户定位未获取到certNum字段"));//加密后的证件号码
						param.putAll(getAreaInfos());
						param.put("batchType", batchType);
						param.put("reserveDt", reserveDt);
						param.put("size", checkResult.get("totalDataSize").toString());
						param.put("commonRegionId",currentAreaId);
						busMap.put("batchOrder", param);
						
						//Excel校验成功后上传Excel文件
						try {
							if(!"ON".equals(MDA.CLUSTERFLAG)){
								//上传到单台FTP服务器
								ftpResultMap = ftpServiceUtils.fileUpload2FTP(file.getInputStream(), fileName, batchType);
							} else{
								//根据省份与多台FTP服务器的映射，上传文件到某台FTP服务器
								ftpResultMap = ftpServiceUtils.fileUpload2FTP4Cluster(file.getInputStream(), fileName, batchType, sessionStaff.getCurrentAreaId());
							}
						} catch (Exception e) {
							jsonResponse = super.failed(ErrorCode.FTP_UPLOAD_ERROR, e, busMap);
						};

						//若上传文件发生异常，则直接返回异常信息不再继续执行
						if(jsonResponse == null){
							try {
								if (ftpResultMap != null && ResultCode.R_SUCCESS.equals(ftpResultMap.get("code").toString())) {
									//Excel上传成功后，入参中填充FTP信息
									param.put("ftpInfos", ftpResultMap.get("ftpInfos"));
									//调后台服务通知接口，通知后台上传文件完成同时获取批次号
									Map<String, Object> returnMap = batchBmo.getGroupIDfromSOAfterUpload(busMap, sessionStaff);
									message = "批量导入成功，导入批次号：<strong>"+returnMap.get("groupId")+"</strong>，请到“批量受理查询”功能中查询受理结果";
									code = "0";
					 			}else{
					 				if(ftpResultMap == null || ftpResultMap.get("mess") == null){
					 					message = "批量导入服务调用失败";
					 				} else{
					 					message = ftpResultMap.get("mess").toString();
					 				}
					 			}
							} catch (InterfaceException ie) {
								jsonResponse = super.failed(ie, busMap, ErrorCode.BATCH_FILEUPLOAD_NOTICE);
							} catch (Exception e) {
								jsonResponse = super.failed(ErrorCode.BATCH_FILEUPLOAD_NOTICE, e, busMap);
							}
						}
					}
				}
			}
		} else {
			message="文件读取失败";
		}

		List<Map<String,Object>>time = batchBmo.getTimeListIn5Days();
    	model.addAttribute("time", time);
		model.addAttribute("message", message);
		model.addAttribute("code", code);
		model.addAttribute("olId", olId);
		model.addAttribute("olseq", olseq);
		model.addAttribute("areaId", currentAreaId);
		model.addAttribute("batchType", batchType);
		if(jsonResponse!=null){
			model.addAttribute("errorStack",jsonResponse);
		}
		return "/batchOrder/batch-order-form";
	}
	
	/**
	 * 批量新装、批开活卡两业务，原号码预占业务逻辑转为后台进行，前台不再进行号码和卡号的预占  2016-03-10
	 */
	@Deprecated
	@SuppressWarnings({ "unchecked", "unused" })
	private Map<String,Object> PlReservePhoneNums(List<Map<String,Object>> list,String actionType,String flowNum){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String,Object> param=new HashMap<String,Object>();
		param.put("phoneNumList", list);
		param.put("staffId", sessionStaff.getStaffId());
		param.put("actionType",actionType);
		Map<String,Object> returnMap=new HashMap<String,Object>();
		String flag="1";
		try {
			Map<String,Object> phoneCheck=orderBmo.batchCheckPhoneAndUim(param, flowNum, sessionStaff);
			if(phoneCheck!=null&&ResultCode.R_SUCCESS.equals(phoneCheck.get("code").toString())){
				flag="0";
				if("E".equals(actionType))
					returnMap.put("batchId", phoneCheck.get("batchId"));//号码批量预占批次号
			}else{
				flag="1";
				List<Map<String,Object>> check=new ArrayList<Map<String,Object>>();
				Object obj=phoneCheck.get("result");
				if (obj instanceof List) {
					check=(List<Map<String,Object>>) obj;
				}else{
					check.add((Map<String,Object>)obj);
				}
				returnMap.put("errorlist",check);
				returnMap.put("msg", phoneCheck.get("msg"));
				if("E".equals(actionType))
					returnMap.put("batchId", phoneCheck.get("batchId"));//号码批量预占批次号
			}
			returnMap.put("flag", flag);
		} catch (BusinessException be) {
			returnMap.put("flag", "2");
			returnMap.put("jsonResponse", super.failed(be));
		} catch (InterfaceException ie) {
			returnMap.put("flag", "2");
			returnMap.put("jsonResponse", super.failed(ie, param, ErrorCode.CHECK_UIMANDPHONE));
		} catch (Exception e) {
			returnMap.put("flag", "2");
			returnMap.put("jsonResponse",super.failed(ErrorCode.CHECK_UIMANDPHONE, e, param));
		}
		return returnMap;
	}

	//查询批量订单数据【新装，拆机】
	@RequestMapping(value = "/batchImportQuery", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String batchImportQuery(Model model,HttpServletRequest request,HttpSession session) {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/batchOrder/batchImportQuery"));
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String end = sdf.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
		String start = sdf.format(calendar.getTime());
		model.addAttribute("startDt", start);
		model.addAttribute("endDt", end);

		//根据配置文件portal.properties里的开关，判断执行新旧代码，N执行旧代码，Y执行新代码 By  2015-10
		if("Y".equals(this.batchOrderFlag("batchOrderQry").getData().toString())){
			//获取员工权限
			String permissionsType = CommonMethods.checkBatchQryOperatSpec(staffBmo,super.getRequest(),sessionStaff);
			model.addAttribute("permissionsType", permissionsType);
			model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
			model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
			
			return "/batchOrder/batch-order-imQuery-new";
		}else{
			return "/batchOrder/batch-order-imQuery";
		}
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchImportList", method = RequestMethod.GET)
	public String batchImportList(Model model,@RequestParam Map<String, Object> param,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		param.putAll(getAreaInfos());
		try {
			List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
			Map<String,Object> rMap = orderBmo.batchExcelQuery(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				int total=MapUtils.getIntValue(rMap, "totalSize", 0);
				Object result =rMap.get("objList");
				if (result instanceof List) {
					resultList = (List<Map<String, Object>>) result;
				} else {
					Map<String,Object> tempMap = (Map<String, Object>) result;
					resultList.add(tempMap);
				}
				if(resultList!=null&&resultList.size()>0){
					 PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(param,
		                     "pageIndex", 1), MapUtils.getIntValue(param,"pageSize",10), total, resultList);
		             model.addAttribute("pageModel", pm);
				}
			}
		} catch (BusinessException e) {
			 this.log.error("服务出错", e);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.BATCH_IMP_LIST);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.BATCH_IMP_LIST, e, param);
		}
		return "/batchOrder/batch-order-imlist";
	}

	/**
	 * 批量受理查询，查询结果为符合条件的批次信息，展示列表为批次，某一个批次的具体信息，转移到“进度查询”。
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchOrderQueryList", method = {RequestMethod.POST})
	public String batchOrderQueryList(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response ) {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);

		/**
		* 场景：批量受理查询，新增权限开关；
		* 应用：这是一个判断是否增加权限优化的标识，暂时用于判断是否执行改造后的新代码(增加权限优化)
		* 说明："Y"执行改造后的新代码，"N"仍执行原有的旧代码
		*/
		if("Y".equals(this.batchOrderFlag("batchOrderAuth").getData().toString())){
			/**
			 * 员工权限，由于权限信息已放到js前端，安全起见，在此重新查询权限
			 * 具体权限控制(后台协定)：
			 * 	管理员：渠道和staffId传空字符串，地区可选择，地区ID必传；
			 * 	营业班长：渠道不可空，staffId传空字符，地区不可选，地区ID必传；
			 * 	营业员：渠道不可空，staffId不可空，地区不可选，地区ID必传；
			 */
			String permissionsType = CommonMethods.checkBatchQryOperatSpec(staffBmo,super.getRequest(),sessionStaff);
			if("admin".equals(permissionsType)){//管理员，不传staffId
				param.put("staffId", "");
			} else if("monitor".equals(permissionsType)){//营业班长，不传staffId
				param.put("staffId", "");
			} else {//营业员
				param.put("staffId", sessionStaff.getStaffId());
			}
		} else {
			param.putAll(getAreaInfos());
		}
		
		//根据#52200：现去掉批量受理查询页面的“预约日期”搜索条件，但仍保留该字段，避免后台空指针，传值为空字符串""
		param.put("reserveDt", "");
		
		try {
			List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
			Map<String,Object> rMap = orderBmo.batchOrderQueryList(param, null, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				int total=MapUtils.getIntValue(rMap, "totalSize", 0);
				Object result =rMap.get("objList");
				if (result instanceof List) {
					resultList = (List<Map<String, Object>>) result;
				} else {
					Map<String,Object> tempMap = (Map<String, Object>) result;
					resultList.add(tempMap);
				}
				if(resultList!=null&&resultList.size()>0){
					 PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(param,
		                     "pageIndex", 1), MapUtils.getIntValue(param,"pageSize",10), total, resultList);
		             model.addAttribute("pageModel", pm);
		             model.addAttribute("totalNum", total);
				}
			}
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.BATCH_IMP_LIST);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.BATCH_IMP_LIST, e, param);
		}
		
		//根据配置文件portal.properties里的开关，判断执行新旧代码，N执行旧代码，Y执行新代码
		model.addAttribute("batchOrderFlag", this.batchOrderFlag("batchOrderQry").getData().toString());
		
		return "/batchOrder/batch-order-imlist";
	}
	
	/**
	 * 进度查询，导出Excel
	 * @param param dealStatus:受理状态(可空); orderStatus:订单状态(可空); groupId:批次号(不可空); batchType:受理类型(不可空)
	 * @param model
	 * @param response
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchOrderExport", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse batchOrderExport(@RequestParam Map<String, Object> param, Model model, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		param.putAll(getAreaInfos());
		try {
			List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
			Map<String,Object> rMap = orderBmo.batchProgressQuery(param, null, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				Object result =rMap.get("objList");
				if (result instanceof List) {
					resultList = (List<Map<String, Object>>) result;
				} else {
					Map<String,Object> tempMap = (Map<String, Object>) result;
					resultList.add(tempMap);
				}
				if(resultList != null && resultList.size() > 0){
					String excelTitle = param.get("groupId").toString();
					String[][] headers = {
						{"groupId","phoneNumber","boProd2Td","genOlDt","statusCd","msgInfo","orderStatusName","transactionId","custSoNumber"},
						{"批次号","主接入号","UIM卡号","受理时间","受理状态","反馈信息","订单状态","下省流水","购物车流水"}
					};
					
					Map<String, Object> transferInfo = new HashMap<String, Object>();
					Map<String, Object> paramNameMap = new HashMap<String, Object>();
					paramNameMap.put("PC", "派发成功");
					paramNameMap.put("PD", "派发失败");
					paramNameMap.put("Q", "导入成功");
					paramNameMap.put("S", "购物车生成成功");
					paramNameMap.put("X", "购物车生成失败");
					paramNameMap.put("PW", "正在派发中");
					paramNameMap.put("C", "发送后端成功");
					paramNameMap.put("PE", "等待重新派发");
					paramNameMap.put("F", "发送后端失败");
					paramNameMap.put("DL", "受理处理中");
					paramNameMap.put("RC", "返销成功");
					transferInfo.put("statusCd", paramNameMap);
					ExcelUtil.exportExcelXls(excelTitle, headers, resultList, response, transferInfo);
//					ExcelUtil.exportExcelXlsx(excelTitle, headers, resultList, response, transferInfo);
				}
			}
		} catch (BusinessException be) {
			 this.log.error("服务出错", be);
			 return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.BATCH_IMP_LIST);
		} catch (Exception e) {
			return super.failed(ErrorCode.BATCH_IMP_LIST, e.getStackTrace().toString(), param);
		}
		
		return super.successed("导出成功！");
	}

	/**
	 * 批次信息查询下的进度查询
	 */
	@RequestMapping(value = "/batchProgressQuery", method = {RequestMethod.POST})
	public String batchProgressQuery(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {

		//获取员工权限
		//String permissionsType = CommonMethods.checkStaffOperatSpec(staffBmo,super.getRequest(),sessionStaff);
		//model.addAttribute("permissionsType", permissionsType);		

		model.addAttribute("param", param);
		return "/batchOrder/batch-order-progressQuery-dialog";
	}
	
	/**
	 * 批次信息查询下的进度查询
	 * @param param statusCd:受理状态(可空); orderStatus:订单状态(可空); groupId:批次号(不可空); batchType:受理类型(不可空)
	 * @param model
	 * @param response
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchProgressQueryList", method = {RequestMethod.POST})
	public String batchProgressQueryList(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		param.putAll(getAreaInfos());
		try {
			List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
			Map<String,Object> rMap = orderBmo.batchProgressQuery(param, null, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				int total=MapUtils.getIntValue(rMap, "totalSize", 0);
				Object result =rMap.get("objList");
				if (result instanceof List) {
					resultList = (List<Map<String, Object>>) result;
				} else {
					Map<String,Object> tempMap = (Map<String, Object>) result;
					resultList.add(tempMap);
				}
				if(resultList != null && resultList.size() > 0){
					 PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(param, "pageIndex", 1), MapUtils.getIntValue(param,"pageSize",10), total, resultList);
		             model.addAttribute("pageModel", pm);
		             model.addAttribute("totalAmount", total);
				}
			}
		} catch (BusinessException e) {
			 this.log.error("服务出错", e);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.BATCH_IMP_LIST);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.BATCH_IMP_LIST, e, param);
		}
		
		model.addAttribute("param", param);
		return "/batchOrder/batch-order-progressQuery-dialog-list";
	}
	
	/**
	 * 批量受理结果查询，某一批次的具体处理状态："RC">资源返销 "F">建档算费失败 "X">生成购物车失败 "S">生成购物车成功 "C">建档算费成功 "Q">导入成功
	 * @param model
	 * @param param
	 * @param flowNum
	 * @return
	 * @author 
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchStatusQuery", method = RequestMethod.GET)
	public String batchStatusQuery(Model model,@RequestParam Map<String, Object> param,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		//param.putAll(getAreaInfos());
		Map<String, Object> rMap = null;
		List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
		JsonResponse jsonResponse = null;
		String message = "";
		Object totalNbr = "";//所有处理状态的总数
		
		param.put("commonRegionId", sessionStaff.getAreaId());
		try {
			rMap = orderBmo.batchStatusQuery(param, flowNum, sessionStaff);
			if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())){
				Object result = rMap.get("objList");
				totalNbr =  rMap.get("totalNbr");//后台totalNbr为BigDecimal类型
				if (result instanceof List) {
					resultList = (List<Map<String, Object>>) result;
					model.addAttribute("code", MapUtils.getString(rMap,"code", "-1"));
				}else{
					message = "营业后台封装的回参objList不是List类型，请检查 !";
					model.addAttribute("code", MapUtils.getString(rMap, "code", "-1"));
				}
			} else{
				message = "业务查询发生异常 :" + MapUtils.getString(rMap, "msg", "");
				model.addAttribute("code", MapUtils.getString(rMap,"code", "-1"));
			}
		} catch (BusinessException be) {
			jsonResponse = super.failed(ErrorCode.BATCH_IMP_LIST, be, param);
		} catch (Exception e) {
			jsonResponse = super.failed(ErrorCode.BATCH_IMP_LIST, e, param);
		}
		
		model.addAttribute("batchType", MapUtils.getString(rMap, "batchType", ""));
		model.addAttribute("message", message);
		model.addAttribute("totalNbr", totalNbr);
		if(jsonResponse != null)
			model.addAttribute("errorStack",jsonResponse);
		else
			model.addAttribute("resultList", resultList);
		
		return "/batchOrder/batch-order-statusQuery-dialog";
	}
	
	/**
	 * 进度查询下的“取消”和“删除”
	 * @param param = {"areaId":"登录员工的areaId","batchId":"批次号","action":"cancel或者retry","statusCd":"批次状态", "staffId":"登录员工的staffId","channelId":"登录员工的channelId"}
	 * @param model
	 * @param flowNum
	 * @return {"resultCode":"0或者1""resultMsg":"重发成功/取消成功"}
	 * @author 
	 */
	@RequestMapping(value = "/batchReprocess", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse batchReprocess(@RequestBody Map<String, Object> param,Model model,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		if("1".equals(param.get("flag").toString()))
			param.put("action", "cancel");//进度查询下的"取消"
		else
			param.put("action", "retry");//进度查询下的"重发"
		param.remove("flag");
		param.putAll(getAreaInfos());
		param.put("areaId", sessionStaff.getCurrentAreaId());//原此处为sessionStaff.getAreaId()
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = orderBmo.batchReprocess(param, null, sessionStaff);
			if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())){
				return super.successed(rMap.get("msg").toString());
			} else{
				jsonResponse = super.failed(MapUtils.getString(rMap, "msg", ""), ResultConstant.FAILD.getCode());
			}
		} catch (InterfaceException ie) {
			jsonResponse = super.failed(ie, param,ErrorCode.BATCH_IMP_LIST);
		} catch (IOException e) {
			jsonResponse = super.failed(ErrorCode.BATCH_IMP_LIST, e, param);
		} catch (Exception e) {
			jsonResponse = super.failed(ErrorCode.BATCH_IMP_LIST, e, param);
		}		
		return jsonResponse;
	}
	
	/**
	 * 批次信息查询下的“修改”
	 * @param model
	 * @param param
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/batchOperate", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse batchOperate(@RequestBody Map<String, Object> param,Model model,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		param.putAll(getAreaInfos());
		param.put("areaId", sessionStaff.getAreaId());
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = orderBmo.batchOperate(param, null, sessionStaff);
			if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())){
				return super.successed(rMap.get("msg").toString());
			} else{
				jsonResponse = super.failed(MapUtils.getString(rMap, "msg", ""),ResultConstant.FAILD.getCode());
			}
		} catch (InterfaceException ie) {
			jsonResponse = super.failed(ie, param,ErrorCode.BATCH_IMP_LIST);
		} catch (IOException e) {
			jsonResponse = super.failed(ErrorCode.BATCH_IMP_LIST, e, param);
		} catch (Exception e) {
			jsonResponse = super.failed(ErrorCode.BATCH_IMP_LIST, e, param);
		}		
		return jsonResponse;
	}
	
	/**
	 * 批次信息查询下的“取消”
	 * @param param
	 * @param model
	 * @param flowNum
	 * @return
	 * @author 
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchOperateCancle", method = {RequestMethod.POST})
	public String batchOperateCancle(@RequestBody Map<String, Object> param,Model model,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		param.putAll(getAreaInfos());
		param.put("areaId", sessionStaff.getAreaId());
		param.put("importMode", "file");
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = orderBmo.batchOperate(param, null, sessionStaff);
			Map<String, Object> invalidInfo = (Map<String, Object>) rMap.get("result");
			String message = rMap.get("msg").toString();
			String code = rMap.get("code").toString();
			if (rMap != null && ResultCode.R_SUCCESS.equals(code)){
				if( invalidInfo.size() > 0){
					if(invalidInfo.get("invalidPhoneNumberList") != null)
						model.addAttribute("invalidPhoneNumberList", invalidInfo.get("invalidPhoneNumberList"));
					if(invalidInfo.get("invalidMktResInstList") != null)
						model.addAttribute("invalidMktResInstList", invalidInfo.get("invalidMktResInstList"));
				}
				model.addAttribute("code", ResultCode.R_SUCC);
				model.addAttribute("message",  message);
			} else{
				model.addAttribute("code", code);
				model.addAttribute("message",  message);
			}
		} catch (InterfaceException ie) {
			jsonResponse = super.failed(ie, param, ErrorCode.BATCH_IMP_LIST);
		} catch (IOException e) {
			e.printStackTrace();
		} catch (Exception e) {
			jsonResponse = super.failed(ErrorCode.BATCH_IMP_LIST, e, param);
		}
		
		if(jsonResponse != null)
			model.addAttribute("errorStack",jsonResponse);
		
		return "/batchOrder/batch-order-batchCancel_dialog";
	}
	
	/**
	 * 批次信息查询下的“修改”,该方法用于弹出修改预约时间的对话框
	 * @param model
	 * @param param
	 * @param request
	 * @param session
	 * @return
	 * @author 
	 */
	@RequestMapping(value = "/batchUpdateMain", method = {RequestMethod.POST})
	public String batchUpdateMain(@RequestBody Map<String, Object> param,Model model,HttpServletRequest request,HttpSession session) {
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/batchOrder/batchUpdateMain"));
		model.addAttribute("timeList", batchBmo.getTimeListIn5Days());
		model.addAttribute("param", param);
		
		return "/batchOrder/batch-order-batchUpdate_dialog";
	}
		
	@RequestMapping(value = "/batchOrderQuery", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String batchOrderQuery(Model model,HttpServletRequest request,HttpSession session) {		
		String batchType = request.getParameter("batchType");
		
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
		String end = simpleDateFormat.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
		String start = simpleDateFormat.format(calendar.getTime());
		
		model.addAttribute("startDt", start);
		model.addAttribute("endDt", end);
		model.addAttribute("batchType", batchType);
		model.addAttribute("templateType", batchBmo.getTemplateType(batchType));
		model.addAttribute("batchTypeName", batchBmo.getTypeNames(batchType));
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "order/batchOrder/batchOrderQuery"));
		
		return "/batchOrder/batch-order-query";
	}

	@RequestMapping(value = "/batchEditParty", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String batchOrderEditParty(Model model,HttpServletRequest request,HttpSession session) {

		String batchTypeName =  batchBmo.getTypeNames(SysConstant.BATCH_TYPE.FA_ZHAN_REN);
		
		model.addAttribute("templateType", SysConstant.BATCH_TYPE.FA_ZHAN_REN);
		model.addAttribute("batchTypeName", batchTypeName);
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/batchOrder/batchEditParty"));

		return "/batchOrder/batch-order-editParty";
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchOrderList", method = RequestMethod.GET)
	public String batchOrderList(Model model,@RequestParam Map<String, Object> param,HttpSession session,@LogOperatorAnn String flowNum) {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		boolean flag = false ;//测试先设置为true，用要改成false，控制权限
		if(param.get("templateType")!=null){
			if(param.get("templateType").equals("0")&&EhcacheUtil.pathIsInSessionNofilter(session,"order/batchOrder/batchOrderQuery?batchType=0")){
				flag = true ;
			}else if(param.get("templateType").equals("1")&&EhcacheUtil.pathIsInSessionNofilter(session,"order/batchOrder/batchOrderQuery?batchType=1")){
				flag = true ;
			}else if(param.get("templateType").equals("2")&&EhcacheUtil.pathIsInSessionNofilter(session,"order/batchOrder/batchOrderQuery?batchType=2")){
				flag = true ;
			}else if(param.get("templateType").equals("3")&&EhcacheUtil.pathIsInSessionNofilter(session,"order/batchOrder/batchOrderQuery?batchType=3")){
				flag = true ;
			}else if(param.get("templateType").equals("4")&&EhcacheUtil.pathIsInSessionNofilter(session,"order/batchOrder/batchOrderQuery?batchType=4")){
				flag = true ;
			}else if(param.get("templateType").equals("5")&&EhcacheUtil.pathIsInSessionNofilter(session,"order/batchOrder/batchOrderQuery?batchType=5")){
				flag = true ;
			}else if(param.get("templateType").equals("8")&&EhcacheUtil.pathIsInSessionNofilter(session,"order/batchOrder/batchOrderQuery?batchType=8")){
				flag = true ;
			}else if(param.get("templateType").equals("9")&&EhcacheUtil.pathIsInSession(session,"order/batchOrder/batchEditParty")){
				flag = true ;
			}
			model.addAttribute("templateType", param.get("templateType"));
			
		}
		if(flag){
			param.putAll(getAreaInfos());
			if(param.get("templateType").equals("9")){
				param.put("custSoNumber", "");
				param.put("templateType", "");
				param.put("custOrderId", "");
				param.put("endDt", "");
				param.put("startDt", "");
				param.put("pageSize", "1");
				param.put("templateOrderName", "");
				param.put("pageIndex", "1");
				param.put("staffId", "");
				param.put("channelId", "");
			}
			try {
				List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
				Map<String,Object> rMap = orderBmo.batchOrderQuery(param, flowNum, sessionStaff);
				if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					int total=MapUtils.getIntValue(rMap, "totalSize", 0);
					Object result =rMap.get("objList");
					if (result instanceof List) {
						resultList = (List<Map<String, Object>>) result;
					} else {
						Map<String,Object> tempMap = (Map<String, Object>) result;
						resultList.add(tempMap);
					}
					if(resultList!=null&&resultList.size()>0){
						 PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(param,
			                     "pageIndex", 1), MapUtils.getIntValue(param,"pageSize",10), total, resultList);
			             model.addAttribute("pageModel", pm);
					}
				}
			} catch (BusinessException e) {
				 this.log.error("服务出错", e);
			} catch (InterfaceException ie) {
				return super.failedStr(model, ie, param, ErrorCode.BATCH_ORDER_LIST);
			} catch (Exception e) {
				return super.failedStr(model, ErrorCode.BATCH_ORDER_LIST, e, param);
			}
		}
		return "/batchOrder/batch-order-list";
	}
	
	@RequestMapping(value = "/batchOrderDel", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse checkUim(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = orderBmo.batchOrderDel(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse=super.successed("", ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(MapUtils.getString(rMap, "msg", ""), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("作废种子订单服务出错", e);
			jsonResponse = super.failed("作废种子订单服务出错", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.BATCH_ORDER_DEL);
		} catch (Exception e) {
			return super.failed(ErrorCode.BATCH_ORDER_DEL, e, param);
		}
		return jsonResponse;
	}
	
	/**
	 * 批量订购裸终端
	 */
	@RequestMapping(value = "/batchOrderTerminal", method = RequestMethod.GET)
	public String batchOrderTerminal(HttpSession session, Model model) {
		
		/*List<Map<String, Object>> timeList = batchBmo.getTimeListIn5Days();
		model.addAttribute("time", timeList);
		model.addAttribute("batchType", SysConstant.BATCHORDERTERMINAL);
		model.addAttribute("batchTypeName", batchBmo.getTypeNames(SysConstant.BATCHORDERTERMINAL));
		model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session,"order/batchOrder/batchOrderTerminal"));
		return "/batchOrder/batch-order-terminal";*/
		
		/**
		 * 为了将批量订购裸终端、批量换档、批量换卡整合(三者业务逻辑相同)同时开发#88538批量业务逻辑调整，所以这里将跳转到批量换档页面，
		 * 不再使用原有的batch-order-terminal页面。
		 *  2016-03-14
		 */
		List<Map<String, Object>> timeList = batchBmo.getTimeListIn5Days();
		String batchType = "10";//批量订购裸终端batchType=10
		String batchTypeName  = batchBmo.getTypeNames(batchType);
		
		model.addAttribute("time", timeList);
		model.addAttribute("batchType", batchType);
		model.addAttribute("batchTypeName", batchTypeName);
		model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session,"order/batchOrder/batchOrderTerminal"));
		
		return "/batchOrder/batch-order-change";
		
	}
	
	/**
	 * 批量换档、批量换卡、批量未激活拆机、批量在用拆机
	 * @param session
	 * @param model
	 * @return
	 * @author 
	 */
	@RequestMapping(value = "/batchOrderChange", method = RequestMethod.GET)
	public String batchOrderChange(Model model,HttpServletRequest request,HttpSession session) {
		
		List<Map<String, Object>> timeList = batchBmo.getTimeListIn5Days();
		String batchType = request.getParameter("batchType");
		String batchTypeName  = batchBmo.getTypeNames(batchType);
		
		model.addAttribute("time", timeList);
		model.addAttribute("batchType", batchType);
		model.addAttribute("batchTypeName", batchTypeName);
		
		return "/batchOrder/batch-order-change";
	}
	
	/**
	 * 批量换档、批量换卡、批量订购裸终端、批量未激活拆机、批量在用拆机
	 * @param model
	 * @param request
	 * @param response
	 * @param flowNum
	 * @param file
	 * @param olId
	 * @return
	 * @author 
	 */
	@RequestMapping(value = "/importBatchData", method = RequestMethod.POST)
	public String importBatchData(Model model, HttpServletRequest request,HttpServletResponse response,
			@LogOperatorAnn String flowNum,
			@RequestParam(value="upFile", required=true) MultipartFile file,
			@RequestParam(value="evidenceFile", required=false) MultipartFile evidenceFile,
			@RequestParam(value="batchType", required=true) String batchType,
			@RequestParam(value="reserveDt", required=true) String reserveDt) {
		
		String message = "";
		String code = "-1";
		boolean isError = false;
		JsonResponse jsonResponse = null;
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		
		if(batchType == null || "".equals(batchType)){
			message = "订单受理类型为空！";
			isError = true;
		}
		if (null != file) {
			boolean oldVersion = true;
			String fileName = file.getOriginalFilename();
			if (fileName.matches("^.+\\.(?i)(xls)$")) {
				oldVersion = true;
			} else if (fileName.matches("^.+\\.(?i)(xlsx)$")) {
				oldVersion = false;
			} else {
				message="导入文件的类型错误，后缀必须为.xls或.xlsx的Excel文件 !";
				isError = true;
			}
			if (!isError) {
				Workbook workbook = null;
				try {
					if (oldVersion){// 2003版本Excel(.xls)
						workbook = new HSSFWorkbook(file.getInputStream());
					}else{// 2007版本Excel或更高版本(.xlsx)
						workbook = new XSSFWorkbook(file.getInputStream());
					}
				} catch (Exception e) {
					message="文件读取异常，请检查文件后重新尝试 !";
					isError = true;
				}
				if (!isError) {
					Map<String,Object> checkResult = null;
					boolean flag = false;
					SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
					
					checkResult = batchBmo.readExcel(new BatchExcelTask(workbook, null, batchType, sessionStaff));
					if(checkResult.get("code") != null && ResultCode.R_SUCC.equals(checkResult.get("code"))){//Excel校验成功
						flag = true;
					} else{
						message = "批量校验<br/>" + (String)checkResult.get("errorData");
					}

					if(flag){
						Map<String, Object> param = new HashMap<String, Object>();
						Map<String, Object> ftpResultMap = null;
						Map<String, Object> ftpEvidenceFileResultMap = null;

						param.put("custOrderId", "");//与后台协商，目前传""，但不可不传，避免空指针
						param.put("custId", "");//同上
						param.putAll(this.getAreaInfos());
						param.put("commonRegionId",sessionStaff.getCurrentAreaId());
						param.put("batchType", batchType);
						param.put("reserveDt", reserveDt);
						param.put("size", checkResult.get("totalDataSize").toString());
						Map<String, Object> busMap = new HashMap<String, Object>();
						busMap.put("batchOrder", param);
						param.put("staffCode",sessionStaff.getStaffCode());
						
						try {
							//上传文件
							if(!"ON".equals(propertiesUtils.getMessage("CLUSTERFLAG"))){
								//上传到单台FTP服务器
								ftpResultMap = ftpServiceUtils.fileUpload2FTP(file.getInputStream(), fileName, batchType);
								if(SysConstant.BATCH_TYPE.BLACKLIST.equals(batchType)){
									ftpEvidenceFileResultMap = ftpServiceUtils.fileUpload2FTP(evidenceFile.getInputStream(), evidenceFile.getOriginalFilename(), "evidenceFile");
								}
							} else{
								//根据省份与多台FTP服务器的映射，上传文件到某台FTP服务器
								ftpResultMap = ftpServiceUtils.fileUpload2FTP4Cluster(file.getInputStream(), fileName, batchType, sessionStaff.getCurrentAreaId());
								if(SysConstant.BATCH_TYPE.BLACKLIST.equals(batchType)){
									ftpEvidenceFileResultMap = ftpServiceUtils.fileUpload2FTP4Cluster(evidenceFile.getInputStream(), evidenceFile.getOriginalFilename(), "evidenceFile", sessionStaff.getCurrentAreaId());
								}
							}
						} catch (Exception e) {
							jsonResponse = super.failed(ErrorCode.FTP_UPLOAD_ERROR, e, ftpResultMap);
						};

						//若上传文件发生异常，则直接返回异常信息不再继续执行
						if(jsonResponse == null){
							try {
								if (ftpResultMap != null && ResultCode.R_SUCCESS.equals(ftpResultMap.get("code").toString())) {
									//上传成功后，入参中填充FTP信息
									param.put("ftpInfos", ftpResultMap.get("ftpInfos"));
									if(SysConstant.BATCH_TYPE.BLACKLIST.equals(batchType)){
										param.put("fileUrl",ftpEvidenceFileResultMap.get("ftpInfos"));
									}
									//调后台服务通知接口，通知后台上传文件完成同时获取批次号
									Map<String, Object> returnMap = batchBmo.getGroupIDfromSOAfterUpload(busMap, sessionStaff);
									message = "批量导入成功，导入批次号：<strong>"+returnMap.get("groupId")+"</strong>，请到“批量受理查询”功能中查询受理结果";
									if(SysConstant.BATCH_TYPE.BLACKLIST.equals(batchType)){
										message = "批量导入成功，导入批次号：<strong>"+returnMap.get("groupId")+"</strong>";
									}
									code = "0";
					 			}else{
					 				if(ftpResultMap == null || ftpResultMap.get("mess") == null){
					 					message = "文件上传发生未知异常，请稍后重新尝试";
					 				} else{
					 					message = ftpResultMap.get("mess").toString();
					 				}
					 			}
							} catch (BusinessException be) {
								jsonResponse = super.failed(be);
							} catch (InterfaceException ie) {
								jsonResponse = super.failed(ie, busMap, ErrorCode.BATCH_FILEUPLOAD_NOTICE);
							} catch (Exception e) {
								jsonResponse = super.failed(ErrorCode.BATCH_FILEUPLOAD_NOTICE, e, busMap);
							}
						}
					}
				}
			}
		} else {
			message="文件读取失败";
		}

		model.addAttribute("message", message);
		model.addAttribute("code", code);
		model.addAttribute("batchType", batchType);
		if(jsonResponse != null){
			model.addAttribute("errorStack",jsonResponse);
		}
		
		return "/batchOrder/batch-order-change-list";
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售Excel导入主页面
	 * @param model
	 * @param request
	 * @param session
	 * @return
	 */
	@RequestMapping(value = "/ecsBatchImport", method = RequestMethod.GET)
	public String importEcs(Model model,HttpServletRequest request,HttpSession session) {
		
		String batchType = request.getParameter("batchType");
		String batchTypeName  = batchBmo.getTypeNames(batchType);
		
		model.addAttribute("batchType", batchType);
		model.addAttribute("batchTypeName", batchTypeName);
		
		return "/batchOrder/batch-order-ecsBatchImport";
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售导入Excel文件并解析处理
	 * @param model
	 * @param request
	 * @param response
	 * @param flowNum
	 * @param file
	 * @param batchType
	 * @param reserveDt
	 * @return
	 * @author  2016-04-21
	 */
	@RequestMapping(value = "/ecsBatchfileImport", method = RequestMethod.POST)
	public String ecsBatchfileImport(Model model, 
			HttpServletRequest request, 
			HttpServletResponse response,
			@LogOperatorAnn String flowNum,
			@RequestParam(value="upFile", required=true) MultipartFile file,
			@RequestParam(value="batchType", required=true) String batchType,
			@RequestParam(value="fromRepositoryId", required=false) String fromRepositoryId,
			@RequestParam(value="destRepositoryId", required=false) String destRepositoryId,
			@RequestParam(value="destStatusCd", required=false) String destStatusCd) {
		
		String message = "";
		String code = "-1";
		boolean isError = false;
		JsonResponse jsonResponse = null;		
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");

		if (null != file) {
			boolean oldVersion = true;
			String fileName = file.getOriginalFilename();
			if (fileName.matches("^.+\\.(?i)(xls)$")) {
				oldVersion = true;
			} else if (fileName.matches("^.+\\.(?i)(xlsx)$")) {
				oldVersion = false;
			} else {
				message="导入文件的类型错误，后缀必须为.xls或.xlsx的Excel文件 !";
				isError = true;
			}
			if (!isError) {
				Workbook workbook = null;
				try {
					if (oldVersion){// 2003版本Excel(.xls)
						workbook = new HSSFWorkbook(file.getInputStream());
					}else{// 2007版本Excel或更高版本(.xlsx)
						workbook = new XSSFWorkbook(file.getInputStream());
					}
				} catch (Exception e) {
					message = "文件读取异常，请检查文件后重新尝试 !";
					isError = true;
				}
				if (!isError) {
					Map<String,Object> checkResult = null;
					boolean flag = false;
					SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
					
					checkResult = batchBmo.readExcel(new BatchExcelTask(workbook, null, batchType, sessionStaff));
					if(checkResult.get("code") != null && ResultCode.R_SUCC.equals(checkResult.get("code"))){
						flag = true;
					} else{
						message = "批量校验<br/>" + checkResult.get("errorData").toString();
					}

					if(flag){
						Map<String, Object> ftpResultMap = null;						
						try {
							//上传文件
							if(!"ON".equals(propertiesUtils.getMessage("CLUSTERFLAG"))){
								//上传到单台FTP服务器
								ftpResultMap = ftpServiceUtils.fileUpload2FTP(file.getInputStream(), fileName, batchType);
							} else{
								//根据省份与多台FTP服务器的映射，上传文件到某台FTP服务器
								ftpResultMap = ftpServiceUtils.fileUpload2FTP4Cluster(file.getInputStream(), fileName, batchType, sessionStaff.getCurrentAreaId());
							}
						} catch (Exception e) {
							jsonResponse = super.failed(ErrorCode.FTP_UPLOAD_ERROR, e, ftpResultMap);
						};

						//若上传文件发生异常，则直接返回异常信息不再继续执行
						if(jsonResponse == null){
							Map<String, Object> requestParamMap = batchBmo.getParam2Ecs(batchType, fromRepositoryId, destRepositoryId, destStatusCd);
							try {
								if (ftpResultMap != null && ResultCode.R_SUCCESS.equals(ftpResultMap.get("code").toString())) {
									//上传成功后，入参中填充FTP信息
									requestParamMap.put("ftpInfos", ftpResultMap.get("ftpInfos"));
									requestParamMap.put("staffId", sessionStaff.getStaffId());
									//调后台服务通知接口，通知后台上传文件完成同时获取批次号
									Map<String, Object> returnMap = batchBmo.getEcsNoticedAfterUpload(requestParamMap, batchType, sessionStaff);
									message = "批量导入成功，导入批次号：<strong>"+returnMap.get("batchId")+"</strong>，请到“批量受理查询”功能中查询受理结果";
									code = "0";
					 			}else{
					 				if(ftpResultMap == null || ftpResultMap.get("mess") == null){
					 					message = "文件上传发生未知异常，请稍后重新尝试";
					 				} else{
					 					message = ftpResultMap.get("mess").toString();
					 				}
					 			}
							} catch (BusinessException be) {
								jsonResponse = super.failed(be);
							} catch (InterfaceException ie) {
								jsonResponse = super.failed(ie, requestParamMap, batchBmo.getErrorCode2Ecs(batchType));
							} catch (Exception e) {
								jsonResponse = super.failed(batchBmo.getErrorCode2Ecs(batchType), e, requestParamMap);
							}
						}
					}
				}
			}
		} else {
			message="文件读取失败";
		}

		model.addAttribute("message", message);
		model.addAttribute("code", code);
		model.addAttribute("batchType", batchType);
		if(jsonResponse != null){
			model.addAttribute("errorStack",jsonResponse);
		}
		
		return "/batchOrder/batch-order-change-list";
	}

	/**
	 * 从SessionStaff获取staffId和channelId以Map类型返回
	 * @return Map
	 */
	private Map<String, Object> getAreaInfos(){
    	Map<String,Object> returnMap = new HashMap<String,Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
		String staffId = sessionStaff.getStaffId();
		String channelId = sessionStaff.getCurrentChannelId();
		
		returnMap.put("staffId", staffId);
		returnMap.put("channelId", channelId);
		
		return returnMap;
    }
	
	/**
	 * #“#18396集约CRM系统批量预开通功能优化需求”开关，ON：改造之后(新代码)；OFF：改造之前(旧代码)</br>
	 * BATCHORDER_QRY_FLAG</br>
	 * #“# #26339批量订单查询权限控制优化”开关，ON：改造之后；OFF：改造之前</br>
	 * BATCHORDER_AUTH_FLAG</br>
	 * @return 
	 * @author 
	 * 			
	 */
	@RequestMapping(value = "/batchOrderFlag", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse batchOrderFlag(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {

		String queryFlag = (String) param.get("queryFlag");
		return this.batchOrderFlag(queryFlag);
	}
	
	/**
	 * 根据配置文件portal.properties里的开关，判断执行新旧代码，N执行旧代码，Y执行新代码
	 * @param queryFlag	入参为字符串"batchOrderQry"(判断批量预开通优化是否执行新代码)或者"batchOrderAuth"(判断是否增加权限优化)
	 * @return	返回字符串"N"(执行旧代码)或者"Y"(执行新代码)
	 * @author  2015-10-19
	 */
	private JsonResponse batchOrderFlag(String queryFlag){
		
		JsonResponse jsonResponse = null;
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		
		if("batchOrderQry".equals(queryFlag)){
			String batchOrder_qry_flag = propertiesUtils.getMessage("BATCHORDER_QRY_FLAG");
			if("ON".equals(batchOrder_qry_flag))
				jsonResponse = super.successed("Y", ResultConstant.SUCCESS.getCode());
			else if("OFF".equals(batchOrder_qry_flag))
				jsonResponse = super.successed("N", ResultConstant.SUCCESS.getCode());
			else
				jsonResponse = super.failed("读取配置文件异常", -1);
			
		} else if("batchOrderAuth".equals(queryFlag)){
			String batchOrder_auth_flag = propertiesUtils.getMessage("BATCHORDER_AUTH_FLAG");
			if("ON".equals(batchOrder_auth_flag))
				jsonResponse = super.successed("Y", ResultConstant.SUCCESS.getCode());
			else if("OFF".equals(batchOrder_auth_flag))
				jsonResponse = super.successed("N", ResultConstant.SUCCESS.getCode());
			else
				jsonResponse = super.failed("读取配置文件异常", -1);
		} else{
			jsonResponse = super.failed("判断执行新旧代码的开关入参queryFlag不存在或不正确，请检查", -1);
		}
		
		return jsonResponse; 
	}
	
	/**
	 * 批量一卡双号黑名单
	 */
	@RequestMapping(value = "/importBlacklist", method = RequestMethod.GET)
	public String importBlacklist(Model model,HttpServletRequest request,HttpSession session) {
		
		List<Map<String, Object>> timeList = batchBmo.getTimeListIn5Days();
		String batchType = request.getParameter("batchType");
		String batchTypeName  = batchBmo.getTypeNames(batchType);
		
		model.addAttribute("time", timeList);
		model.addAttribute("batchType", batchType);
		model.addAttribute("batchTypeName", batchTypeName);
		
		return "/batchOrder/batch-order-change";
	}
	
	@RequestMapping(value = "/downloadFile", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse downloadFile(Model model, 
			@RequestParam("fileUrl") String fileUrl, 
			@RequestParam("fileName") String fileName,
			HttpServletResponse response) throws IOException {

		try {
			FtpUtils ftpUtils = new FtpUtils();
//			String fileUrl = (String) param.get("fileUrl");
//			String fileName = (String) param.get("fileName");
			String[] fileUrls = fileUrl.split(",");
			String ftpMapping = fileUrls[0];
			String newFileName = fileUrls[1];
			String filePath = fileUrls[2];
			
			//2.获取FTP服务器的具体登录信息
			//3.根据服务器映射获取对应的FTP服务器配置信息
			PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
			String ftpServiceConfig = propertiesUtils.getMessage(ftpMapping);
			String[] ftpServiceConfigs = ftpServiceConfig.split(",");
			String remoteAddress = ftpServiceConfigs[0];//FTP服务器地址(IP)
			String remotePort = ftpServiceConfigs[1];//FTP服务器端口
			String userName = ftpServiceConfigs[2];//FTP服务器用户名
			String password = ftpServiceConfigs[3];//FTP服务器密码
			
			ServletOutputStream  outputStream = response.getOutputStream();
			
			response.addHeader("Content-Disposition", "attachment;filename="+new String(fileName.getBytes("gb2312"), "ISO8859-1"));
			response.setContentType("application/binary;charset=utf-8");
			
			ftpUtils.connectFTPServer(remoteAddress,remotePort,userName,password);
			boolean isFileExist = ftpUtils.isFileExist(newFileName,filePath);
			if(isFileExist){
				ftpUtils.downloadFileByPath(filePath+newFileName, outputStream);
			}
			outputStream.close();
			return super.successed("导出成功！");
		} catch (Exception e) {
			return super.failed("导出文件异常：<br/>" + e, ResultConstant.FAILD.getCode());
		}
		
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售批次查询(展示查询主页面)
	 * @param model
	 * @param request
	 * @param session
	 * @return
	 */
	@RequestMapping(value = "/queryEcsBatchOrder", method = RequestMethod.GET)
	public String queryEcsBatchOrder(Model model,HttpServletRequest request,HttpSession session) {
		
//		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
//		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/batchOrder/queryEcsBatchOrder"));
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String end = sdf.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
		String start = sdf.format(calendar.getTime());
		model.addAttribute("startDt", start);
		model.addAttribute("endDt", end);

		return "/batchOrder/batch-order-queryEcsBatchOrder";
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售批次查询(查询数据列表)
	 * @param qryParam
	 * @param model
	 * @return
	 * @author  2016-05-04
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryEcsBatchOrderList", method = {RequestMethod.POST})
	public String queryEcsBatchOrderList(@RequestBody Map<String, Object> qryParam, Model model) {		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);	
		
		//处理参数，时间格式要求为yyMMdd形式
		String beginDate = qryParam.get("beginDate").toString();
		String endDate = qryParam.get("endDate").toString();
		beginDate = beginDate.replaceAll("-", "");
		endDate = endDate.replaceAll("-", "");
		qryParam.put("beginDate", beginDate);
		qryParam.put("endDate", endDate);
		qryParam.put("staffCode", sessionStaff.getStaffCode());
		qryParam.putAll(this.getAreaInfos());
		
		try {
			Map<String,Object> resultMap = batchBmo.queryEcsBatchOrderList(qryParam, null, sessionStaff);
			if (resultMap != null && ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
				int totalResultNum = MapUtils.getIntValue(resultMap, "totalResultNum", 0);
				List<Map<String,Object>> resultList = (List<Map<String, Object>>) resultMap.get("resultList");
				if(resultList!=null&&resultList.size()>0){
					 PageModel<Map<String, Object>> pageModel = PageUtil.buildPageModel(MapUtils.getIntValue(qryParam, "pageIndex", 1), MapUtils.getIntValue(qryParam,"pageSize",10), totalResultNum, resultList);
		             model.addAttribute("pageModel", pageModel);
		             model.addAttribute("totalNum", totalResultNum);
				}
			}
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.BATCH_ECS_QUERY, e, qryParam);
		}
		return "/batchOrder/batch-order-queryEcsBatchOrder-list";
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售批次详情查询<br/>
	 * 目前该请求处理很简单，为后期增加查询条件做准备，类似与批量受理查询中的进度查询
	 * @param qryParam
	 * @param model
	 * @return
	 * @author  2016-05-04
	 */
	@RequestMapping(value = "/queryEcsBatchOrderDetail", method = {RequestMethod.POST})
	public String queryEcsBatchOrderDetail(@RequestBody Map<String, Object> qryParam, Model model) {		
//		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);		
		model.addAttribute("batchId_dialog", qryParam.get("batchId"));
		return "/batchOrder/batch-order-queryEcsBatchOrder-detail";
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售批次详情查询，获取数据列表
	 * @param qryParam
	 * @param model
	 * @return
	 * @author  2016-05-04
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryEcsBatchOrderDetailList", method = {RequestMethod.POST})
	public String queryEcsBatchOrderDetailList(@RequestBody Map<String, Object> qryParam, Model model) {		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);		
		
		//处理参数
		qryParam.put("staffCode", sessionStaff.getStaffCode());
		qryParam.putAll(this.getAreaInfos());
		
		try {
			Map<String,Object> resultMap = batchBmo.queryEcsBatchOrderDetailList(qryParam, null, sessionStaff);
			if (resultMap != null && ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
				int totalResultNum = MapUtils.getIntValue(resultMap, "totalResultNum", 0);
				List<Map<String,Object>> resultList = (List<Map<String, Object>>) resultMap.get("resultList");
				if(resultList!=null&&resultList.size()>0){
					 PageModel<Map<String, Object>> pageModel = PageUtil.buildPageModel(MapUtils.getIntValue(qryParam, "pageNo", 1), MapUtils.getIntValue(qryParam,"pageSize",10), totalResultNum, resultList);
		             model.addAttribute("pageModel", pageModel);
		             model.addAttribute("totalNum", totalResultNum);
		             model.addAttribute("batchId_dialog", qryParam.get("batchId"));
				}
			} else{
				model.addAttribute("code", MapUtils.getString(resultMap, "code" ,ResultCode.R_EXCEPTION));
				model.addAttribute("message", MapUtils.getString(resultMap, "msg" ,""));
			}
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.BATCH_ECS_QUERY, e, qryParam);
		}			
		return "/batchOrder/batch-order-queryEcsBatchOrder-detail-list";
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售仓库查询
	 * @param qryParam
	 * @param model
	 * @return
	 * @author  2016-05-04
	 */
	@RequestMapping(value = "/queryEcsRepository", method = {RequestMethod.POST})
	public String queryEcsRepository(@RequestBody Map<String, Object> qryParam, Model model) {
		model.addAttribute("qryParam", qryParam);
		model.addAttribute("batchTypeName", batchBmo.getTypeNames(qryParam.get("batchType").toString()));
		return "/batchOrder/batch-order-queryRepository";
	}
	
	/**
	 * 批量终端领用、批量终端领用回退、批量终端销售仓库列表查询
	 * @param qryParam
	 * @param model
	 * @return
	 * @author  2016-05-04
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryEcsRepositoryList", method = {RequestMethod.POST})
	public String queryEcsRepositoryList(@RequestBody Map<String, Object> qryParam, Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> resultMap = null;
		qryParam.putAll(this.getAreaInfos());
		try {
			resultMap = batchBmo.queryEcsRepositoryByStaffID(qryParam, null, sessionStaff);
			if (resultMap != null && ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())){
				//该接口未返回总记录数，故改用简易分页组件
				/*PageModel<Map<String, Object>> pageModel = PageUtil.buildPageModel(
						MapUtils.getIntValue(qryParam, "pageIndex", 1),
						MapUtils.getIntValue(qryParam,"pageSize",10), 
						MapUtils.getIntValue(resultMap, "totalResultNum", 0), 
						(List<Map<String, Object>>)resultMap.get("resultList"));*/
				PageModel<Map<String, Object>> pageModel = PageUtil.buildPageModel(
						MapUtils.getIntValue(qryParam, "pageIndex", 1), 
						MapUtils.getIntValue(qryParam,"pageSize",10), 
						(List<Map<String, Object>>)resultMap.get("resultList"));
	             model.addAttribute("pageModel", pageModel);
			} else{
				return super.failedStr(model, ErrorCode.BATCH_ECS_REPOSITORY, "终端仓库查询接口返回数据异常", qryParam);
			}
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.BATCH_ECS_REPOSITORY, e, qryParam);
		}		
		return "/batchOrder/batch-order-queryRepository-list";
	}
	
	/**
	 * 批量终端领用、回退、销售：批次详情导出Excel
	 * @param param
	 * @param model
	 * @param response
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/ecsBatchOrderExport", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse ecsBatchOrderExport(@RequestParam Map<String, Object> param, Model model, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		//处理参数，导出Excel需要全部数据，为了能使接口返回全部数据，分页参数特殊设置		
		param.put("pageNo", "1");
		param.put("pageSize", "99999");
		param.put("staffCode", sessionStaff.getStaffCode());
		param.putAll(this.getAreaInfos());
						
		try {
			Map<String,Object> resultMap = batchBmo.queryEcsBatchOrderDetailList(param, null, sessionStaff);
			if (resultMap != null && ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
				List<Map<String,Object>> resultList = (List<Map<String, Object>>) resultMap.get("resultList");
				if(resultList != null && resultList.size() > 0){
					String excelTitle = "ecs_" + param.get("batchId").toString();
					String[][] headers = {
						{"STORE_NAME","AREA_NAME","INST_CODE","STATUS_NAME","CREATE_DATE","UPDATE_DATE","LOG_DESC","REMARK"},
						{"仓库名称","区域名称","终端串码","终端状态","创建日期","更新日期","描 述","备 注"}
					};
					ExcelUtil.exportExcelXls(excelTitle, headers, resultList, response, null);
				}
			}
		} catch (Exception e) {
			return super.failed(ErrorCode.BATCH_ECS_QUERY, e.getStackTrace().toString(), param);
		}
		
		return super.successed("导出成功！");
	}
}

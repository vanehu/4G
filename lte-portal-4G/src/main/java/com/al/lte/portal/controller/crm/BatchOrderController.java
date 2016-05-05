package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.math.BigDecimal;
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
import com.al.ecs.common.util.JsonUtil;
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
import com.al.lte.portal.common.FTPServiceUtils;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.controller.crm.BatchOrderController")
@RequestMapping("/order/batchOrder/*")
public class BatchOrderController  extends BaseController {
	
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
		String areaId = request.getParameter("areaId");
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		
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
		if (areaId == null || "".equals(areaId)) {
			message = "种子订单的地区信息为空！";
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
					SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);				
					String custStr = sessionStaff.getCustId() +"/"+ sessionStaff.getPartyName() +"/" + sessionStaff.getCardNumber()+"/"+sessionStaff.getCardType();
					String encryptCustName = "";//客户定位回参中的CN点
										
					if(SysConstant.BATCHNEWORDER.equals(batchType)){//批量新装						
						//针对批量新装的客户定位，由于脱敏原因，在入参中增加CN节点用于解密，CN即为客户定位回参中的CN节点
						Map<String, Object> sessionCustInfo = (Map<String, Object>) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_CURRENT_CUST_INFO);
						if(sessionCustInfo != null){
							if(sessionCustInfo.get("CN") != null){
								encryptCustName = sessionCustInfo.get("CN").toString();
							} else{
								encryptCustName = sessionStaff.getCN();
							}
						} else{
							encryptCustName = sessionStaff.getCN();
						}	
						
//						long startTime = System.currentTimeMillis();
						checkResult =  batchBmo.readExcel4NewOrder(workbook, batchType, custStr, sessionStaff);
						if(checkResult.get("code") != null && "0".equals(checkResult.get("code"))){
							checkResultFlag = true;
						}else{
							message = "批量导入出错:<br/>" + (String)checkResult.get("errorData");
						}
					}else if(SysConstant.BATCHHUOKA.equals(batchType)){//批开活卡
						checkResult = batchBmo.readExcel4HKUseThreads(workbook, batchType);
						if(checkResult.get("code") != null && "0".equals(checkResult.get("code"))){
							checkResultFlag = true;
						}else{
							message = "批量导入出错:<br/>" + (String) checkResult.get("errorData");
						}
					}else if(SysConstant.BATCHCHAIJI.equals(batchType)//批量拆机
							||SysConstant.BATCHFUSHU.equals(batchType)//批量退订附属
							||SysConstant.BATCHCHANGE.equals(batchType)){//批量在用拆机
						checkResult = batchBmo.readExcel4Common(workbook);
						if(checkResult.get("code") != null && "0".equals(checkResult.get("code"))){
							checkResultFlag = true;
						}else{
							message = "批量导入出错:<br/>" + (String) checkResult.get("errorData");
						}
					}else if(SysConstant.BATCHZUHE.equals(batchType) || SysConstant.BATCHEDITATTR.equals(batchType)){//组合产品纳入退出;批量修改产品属性
						
					}else if(SysConstant.BATCHFAZHANREN.equals(batchType)){//批量修改发展人
						checkResult = batchBmo.readExcel4ExtendCust(workbook);
						if(checkResult.get("code") != null && "0".equals(checkResult.get("code"))){
							checkResultFlag = true;
						}else{
							message = "批量导入出错:<br/>" + (String) checkResult.get("errorData");
						}
					} else{
						message = "批量导入出错：<br/>没有查找到您提交的批量业务受理类型["+batchType+"]，无法继续受理，请稍后刷新页面重新尝试。";
					}
					
					//Excel校验是否成功
					if(checkResultFlag){
						Map<String, Object> param = new HashMap<String, Object>();
						Map<String, Object> busMap = new HashMap<String, Object>();
						Map<String, Object> ftpResultMap = null;
						
						param.put("custOrderId", olId);
						param.put("custId", custStr);
						param.put("encryptCustName", encryptCustName);
						param.putAll(getAreaInfos());
						param.put("batchType", batchType);
						param.put("reserveDt", reserveDt);
						param.put("size", checkResult.get("totalDataSize").toString());
						
						if(SysConstant.BATCHFAZHANREN.equals(batchType)){
							param.put("commonRegionId",sessionStaff.getCurrentAreaId());
						}else{
							param.put("commonRegionId",areaId);
						}
						busMap.put("batchOrder", param);
						
						//Excel校验成功后上传Excel文件
						try {
							if(!"ON".equals(propertiesUtils.getMessage("CLUSTERFLAG"))){
								//上传到单台FTP服务器
								ftpResultMap = ftpServiceUtils.fileUpload2FTP(file.getInputStream(), fileName, batchType);
							} else{
								//根据省份与多台FTP服务器的映射，上传文件到某台FTP服务器
								ftpResultMap = ftpServiceUtils.fileUpload2FTP4Cluster(file.getInputStream(), fileName, batchType, sessionStaff.getProvinceCode());
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
					 				if(ftpResultMap == null || ftpResultMap.get("mess") == null)
					 					message = "批量导入服务调用失败";
					 				else
					 					message = ftpResultMap.get("mess").toString();
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
		model.addAttribute("areaId", areaId);
		model.addAttribute("batchType", batchType);
		if(jsonResponse!=null){
			model.addAttribute("errorStack",jsonResponse);
		}
		return "/batchOrder/batch-order-form";
	}
	
	/**
	 * 批量新装、批开活卡两业务，原号码预占业务逻辑转为后台进行，前台不再进行号码和卡号的预占 ZhangYu 2016-03-10
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

		//根据配置文件portal.properties里的开关，判断执行新旧代码，N执行旧代码，Y执行新代码 By ZhangYu 2015-10
		//JsonResponse jsonResponse = this.batchOrderFlag("batchOrderQry");
		//model.addAttribute("batchOrderFlag", jsonResponse.getData().toString());
		if("Y".equals(this.batchOrderFlag("batchOrderQry").getData().toString())){
			//获取员工权限
			String permissionsType = CommonMethods.checkBatchQryOperatSpec(staffBmo,super.getRequest(),sessionStaff);
			model.addAttribute("permissionsType", permissionsType);
			model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
			model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
			
			return "/batchOrder/batch-order-imQuery-new";
		}else
			return "/batchOrder/batch-order-imQuery";
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
		//return "/batchOrder/batch-order-progressQuery";
	}

	/**
	 * 批量受理查询，查询结果为符合条件的批次信息，展示列表为批次，某一个批次的具体信息，转移到“进度查询”。
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @author ZhangYu 
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
		
		//根据#52200：现去掉批量受理查询页面的“预约日期”搜索条件，但仍保留该字段，避免后台空指针，传值为空字符串"" By ZhangYu
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
					//String excelTitle = "批次查询受理表单"+param.get("groupId");
					String excelTitle = param.get("groupId").toString();
					String[] headers = new String[]{"批次号","主接入号","UIM卡号","受理时间","受理状态","反馈信息","订单状态","下省流水","购物车流水"};
					
					response.addHeader("Content-Disposition", "attachment;filename="+new String( excelTitle.getBytes("gb2312"), "ISO8859-1" )+".xls");
					response.setContentType("application/binary;charset=utf-8");
					 
					ServletOutputStream  outputStream = response.getOutputStream();
					batchBmo.exportExcel(excelTitle, headers, resultList, outputStream);
					outputStream.close();
				}
			}
		} catch (BusinessException be) {
			 this.log.error("服务出错", be);
			 return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.BATCH_IMP_LIST);
		} catch (Exception e) {
			//return super.failedStr(model, ErrorCode.BATCH_IMP_LIST, e, param);
			return super.failed(ErrorCode.BATCH_IMP_LIST, e.getStackTrace().toString(), param);
		}
		
		//return "/batchOrder/batch-order-progressQuery-dialog";
		//return jsonResponse = super.successed(rMap,ResultConstant.SUCCESS.getCode());
		//return jsonResponse = super.successed("导出成功！");
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
					 PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(param,
		                     "pageIndex", 1), MapUtils.getIntValue(param,"pageSize",10), total, resultList);
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
	 * @author ZhangYu
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
					model.addAttribute("code", rMap.get("code").toString());
				}else{
					message = "营业后台封装的回参objList不是List类型，请检查 !";
					model.addAttribute("code", rMap.get("code").toString());
				}
			} else{
				message = "业务查询发生异常 :" + rMap.get("msg").toString();
				model.addAttribute("code", rMap.get("code").toString());
			}
		} catch (BusinessException be) {
			jsonResponse = super.failed(ErrorCode.BATCH_IMP_LIST, be, param);
		} catch (Exception e) {
			jsonResponse = super.failed(ErrorCode.BATCH_IMP_LIST, e, param);
		}
		
		model.addAttribute("batchType", rMap.get("batchType"));
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
	 * @author ZhangYu
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
				jsonResponse = super.failed(rMap.get("msg").toString(),ResultConstant.FAILD.getCode());
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
	 * @author ZhangYu
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
				jsonResponse = super.failed(rMap.get("msg").toString(),ResultConstant.FAILD.getCode());
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
	 * @author ZhangYu
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchOperateCancle", method = {RequestMethod.POST})
	public String batchOperateCancle(@RequestBody Map<String, Object> param,Model model,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		param.putAll(getAreaInfos());
		param.put("areaId", sessionStaff.getAreaId());
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
	 * @author ZhangYu
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
		String batchTypeName = null;
		
		if (batchType != null) {
			batchTypeName = batchBmo.getTypeNames(batchType);
		} else {
			//如果非 拆机，就默认是新装
			batchType = SysConstant.BATCHNEWORDER;
			batchTypeName = batchBmo.getTypeNames(batchType);
		}
		
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
		String end = simpleDateFormat.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
		String start = simpleDateFormat.format(calendar.getTime());
		
		model.addAttribute("startDt", start);
		model.addAttribute("endDt", end);
		model.addAttribute("templateType", batchType);
		model.addAttribute("batchTypeName", batchTypeName);
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "order/batchOrder/batchOrderQuery"));
		
		return "/batchOrder/batch-order-query";
	}

	@RequestMapping(value = "/batchEditParty", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String batchOrderEditParty(Model model,HttpServletRequest request,HttpSession session) {

		String batchTypeName =  batchBmo.getTypeNames(SysConstant.BATCHFAZHANREN);
		
		model.addAttribute("templateType", SysConstant.BATCHFAZHANREN);
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
				jsonResponse = super.failed(rMap.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
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
		 * ZhangYu 2016-03-14
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
	 * @author ZhangYu
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
	 * 批量订购裸终端 - 文件校验</br>
	 * @deprecated #88538：前台将不在进行号码预占等业务操作，非空、去重校验成功后直接上传Excel至FTP服务器，所以此方法目前不再使用
	 * updated by ZhangYu 2016-03-20
	 */
	@Deprecated
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchOrderVerify", method = RequestMethod.POST)
	public String checkTerminal(Model model, HttpServletRequest request, HttpServletResponse response, @LogOperatorAnn String flowNum,
			@RequestParam("upFile") MultipartFile file) {
		
		String message = "";
		String code = "-1";
		boolean isError = false;
		boolean isTrue = false; // 是否能导入文件
		JsonResponse jsonResponse = null;
		Map<String,Object> checkResult = null;
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
			if(!isError){
				Workbook workbook = null;
				try {
					if (oldVersion) {// 2003版本Excel(.xls)
						workbook = new HSSFWorkbook(file.getInputStream());
					} else {// 2007版本Excel或更高版本(.xlsx)
						workbook = new XSSFWorkbook(file.getInputStream());
					}
				} catch (Exception e) {
					message="对不起，文件读取异常！";
					isError = true;
				}
				if(!isError){
					boolean flag=false;
					SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
					// Excel格式校验
					checkResult = batchBmo.readOrderTerminalExcel(workbook);
					if(checkResult.get("code")!=null&&"0".equals(checkResult.get("code"))){
						flag=true;
					}else{
						message="批量文件格式出错:"+(String)checkResult.get("errorData");
					}
					if(flag){
						//Map<String,Object> checkResult = null;
						List<Map<String, Object>> terminalInfo = new ArrayList<Map<String, Object>>(); // 校验后的保存的终端信息
						int successNum = 0;// 校验成功数目
						List<Map<String, Object>> resultList = (List<Map<String, Object>>)checkResult.get("data"); 
						for(Map<String, Object> mktResCode : resultList ){
							Map<String, Object> param = new HashMap<String, Object>();
							// 串码校验
							try {
								Map<String, Object> mktResInfo = new HashMap<String, Object>();
								String excelPrice =  mktResCode.get("salePrice").toString();
								mktResInfo.put("mktResCode",mktResCode.get("mktResCode"));
								mktResInfo.put("salePrice",excelPrice);
								mktResInfo.put("dealer",mktResCode.get("dealer"));
								param.put("channelId", sessionStaff.getCurrentChannelId());
								param.put("instCode",mktResCode.get("mktResCode"));
								param.put("mktResTypeCd", "101000"); //固定类型为终端
								Map<String, Object> mktRes = mktResBmo.checkTerminalCode( param, flowNum, sessionStaff);
								if (MapUtils.isNotEmpty(mktRes)) {
									if(ResultCode.R_SUCC.equals(mktRes.get("code").toString())){
										String statusCd = MapUtils.getString(mktRes, "statusCd","");
										if(SysConstant.MKT_RES_STATUSCD_USABLE.equals(statusCd)){
											String salePrice = "0";
											String colour = "";
											for(Map<String, Object> mktResAttr : (List<Map<String, Object>>)mktRes.get("mktAttrList")){
												if(MapUtils.getString(mktResAttr, "attrId").equals(SysConstant.MKT_RES_ATTR_TERMINAL_PRICE)){
													salePrice = MapUtils.getString(mktResAttr, "attrValue");
												}
												if(MapUtils.getString(mktResAttr, "attrId").equals(SysConstant.MKT_RES_ATTR_TERMINAL_COLOUR)){
													colour = MapUtils.getString(mktResAttr, "attrValue");
												}
											}
											mktResInfo.put("mktResName",mktRes.get("mktResName"));
											mktResInfo.put("salePrice",salePrice);
											mktResInfo.put("colour",colour);
											BigDecimal excelAmount =  new BigDecimal(excelPrice); // 文件里的金额
											BigDecimal terminalAmount =  new BigDecimal(salePrice); // 资源返回金额
											// 金额不一致
											if(terminalAmount.compareTo(excelAmount) == 0){
												++successNum;
											}else{
												mktRes.put("code", "-1");
												mktRes.put("message", "校验失败,填写金额["+excelAmount+"]与资源销售金额["+terminalAmount+"]不一致！");
											}
										}else if(SysConstant.MKT_RES_STATUSCD_HAVESALE.equals(statusCd)){
											mktRes.put("code", "-1");
											mktRes.put("message", "终端当前状态为已销售未补贴[1115],只有在办理话补合约时可用！");
										}else{
											mktRes.put("code", "-1");
											mktRes.put("message", "终端当前状态为不可用状态,请检查！");
										}
									}
									mktResInfo.put("code",mktRes.get("code"));
									mktResInfo.put("message",mktRes.get("message"));
									terminalInfo.add(mktResInfo);
								} else {
									message="校验终端串号失败,校验返回结果为空！";
								}
							} catch (BusinessException be) {
								this.log.error("门户/mktRes/terminal/checkTerminal服务异常", be);
								jsonResponse = super.failed(be);
								break;
							} catch (InterfaceException ie) {
								jsonResponse = super.failed(ie, param, ErrorCode.CHECK_TERMINAL);
								break;
							} catch (Exception e) {
								jsonResponse = super.failed(ErrorCode.CHECK_TERMINAL, e, param);
								break;
							}
						}
						if(resultList.size() == successNum){
							isTrue = true;
						}
						model.addAttribute("isTrue", isTrue==true?"true":"false");
						if(terminalInfo!=null&&terminalInfo.size()>0){
				             model.addAttribute("terminalInfoList", terminalInfo);
				             Map<String,Object> terminalInfoMap = new HashMap<String,Object>();
				             // 保存校验结果到前台
				             terminalInfoMap.put("data",terminalInfo);
				             String terminalInfoJson = JsonUtil.buildNormal().objectToJson(terminalInfoMap);
				             terminalInfoJson = terminalInfoJson.replace("\"", "'");
				 			 model.addAttribute("terminalInfoJson",terminalInfoJson);
						}
					}
				}
			}
		} else {
			message="文件上传失败！";
		}
		model.addAttribute("message", message);
		model.addAttribute("code", code);
		if(jsonResponse!=null){
			model.addAttribute("errorStack",jsonResponse);
		}
		if(isTrue){
			String result = JsonUtil.buildNormal().objectToJson(checkResult);
			result = result.replace("\"", "'");
			model.addAttribute("result",result);
		}
		//model.addAttribute("batchType", batchType);
		return "/batchOrder/batch-order-terminal-list";
	}
	
	/**
	 * 批量订购裸终端 - 文件提交
	 * @deprecated #88538：前台将不在进行号码预占等业务操作，非空、去重校验成功后直接上传Excel至FTP服务器，所以此方法目前不再使用
	 * updated by ZhangYu 2016-03-20
	 */
	@Deprecated
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchTerminalImport", method = RequestMethod.POST)
	public @ResponseBody JsonResponse batchTerminalImport(@RequestBody Map<String, Object> params,HttpServletRequest request,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		List<Map<String,Object>> list=(List<Map<String,Object>>)params.get("data");
		Map<String, Object> rMap = null;
		Map<String, Object> param = new HashMap<String, Object>();
		param.put("orderList", list);
		param.put("custOrderId", "");
		param.putAll(getAreaInfos());
		param.put("commonRegionId",sessionStaff.getCurrentAreaId());
		param.put("batchType", params.get("batchType").toString());
		param.put("reserveDt", params.get("reserveDt").toString());
		Map<String, Object> busMap = new HashMap<String, Object>();
		busMap.put("batchOrder", param);
		try {
			rMap = orderBmo.batchExcelImport(busMap, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				rMap.put("msg", "批量导入成功,导入批次号["+rMap.get("groupId")+"],请到“批量受理查询”功能中查询受理结果");
				jsonResponse = super.successed(rMap,
						ResultConstant.SUCCESS.getCode());
 			}else{
 				if(rMap==null||rMap.get("msg")==null){
 					rMap.put("msg", "批量导入服务调用失败");
 					jsonResponse = super.failed(rMap,
 							ResultConstant.FAILD.getCode());
 				}else{
 					rMap.put("msg", rMap.get("msg").toString());
 					jsonResponse = super.failed(rMap,
 							ResultConstant.FAILD.getCode());
 				}		 				
 			}
			return jsonResponse;
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, busMap, ErrorCode.BATCH_IMP_SUBMIT);
		} catch (Exception e) {
			return super.failed(ErrorCode.BATCH_IMP_SUBMIT, e, busMap);
		}
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
	 * @author ZhangYu
	 */
	@RequestMapping(value = "/importBatchData", method = RequestMethod.POST)
	public String importBatchData(Model model, HttpServletRequest request,HttpServletResponse response,
			@LogOperatorAnn String flowNum,
			@RequestParam("upFile") MultipartFile file,
			@RequestParam("evidenceFile") MultipartFile evidenceFile,
			@RequestParam("batchType") String batchType,
			@RequestParam("reserveDt") String reserveDt) {
		
		String message = "";
		String code = "-1";
		boolean isError = false;
		JsonResponse jsonResponse = null;
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		
		if(batchType == null || "".equals(batchType)){
			message = "订单受理类型为空！";
			isError = true;
		}
		/*if(reserveDt==null||"".equals(reserveDt)){
			message="预约时间为空！";
			isError=true;
		}*/
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
					
					if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType) || SysConstant.BATCHCHANGEUIM.equals(batchType)){
						checkResult = batchBmo.readExcelBatchChange(workbook, batchType);
					} else if(SysConstant.BATCHORDERTERMINAL.equals(batchType)){
						checkResult = batchBmo.readOrderTerminalExcel(workbook);
					}else if(SysConstant.BATCHBLACKLIST.equals(batchType)){
						checkResult = batchBmo.readBlacklistTerminalExcel(workbook);
					} else if(SysConstant.BATCHDISMANTLEINUSE.equals(batchType) || SysConstant.BATCHDISMANTLEINACTIVE.equals(batchType)){
						checkResult = batchBmo.readExcel4Common(workbook);
					}
					
					if(checkResult.get("code") != null && ResultCode.R_SUCC.equals(checkResult.get("code"))){//Excel校验成功
						flag = true;
					} else{
						message = "批量导入出错:" + (String)checkResult.get("errorData");
					}

					if(flag){
						Map<String, Object> param = new HashMap<String, Object>();
						Map<String, Object> ftpResultMap = null;
						Map<String, Object> ftpEvidenceFileResultMap = null;

						param.put("custOrderId", "");//与后台协商，目前传""，但不可不传，避免空指针
						param.put("custId", "");//与后台协商，目前传""，但不可不传，避免空指针
						param.putAll(getAreaInfos());
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
								if(SysConstant.BATCHBLACKLIST.equals(batchType)){
									ftpEvidenceFileResultMap = ftpServiceUtils.fileUpload2FTP(evidenceFile.getInputStream(), evidenceFile.getOriginalFilename(), "evidenceFile");
								}
							} else{
								//根据省份与多台FTP服务器的映射，上传文件到某台FTP服务器
								ftpResultMap = ftpServiceUtils.fileUpload2FTP4Cluster(file.getInputStream(), fileName, batchType, sessionStaff.getProvinceCode());
								if(SysConstant.BATCHBLACKLIST.equals(batchType)){
									ftpEvidenceFileResultMap = ftpServiceUtils.fileUpload2FTP4Cluster(evidenceFile.getInputStream(), evidenceFile.getOriginalFilename(), "evidenceFile", sessionStaff.getProvinceCode());
								}
							}
						} catch (Exception e) {
							jsonResponse = super.failed(ErrorCode.FTP_UPLOAD_ERROR, e, busMap);
						};

						//若上传文件发生异常，则直接返回异常信息不再继续执行
						if(jsonResponse == null){
							try {
								if (ftpResultMap != null && ResultCode.R_SUCCESS.equals(ftpResultMap.get("code").toString())) {
									//上传成功后，入参中填充FTP信息
									param.put("ftpInfos", ftpResultMap.get("ftpInfos"));
									if(SysConstant.BATCHBLACKLIST.equals(batchType)){
										param.put("fileUrl",ftpEvidenceFileResultMap.get("ftpInfos"));
									}
									//调后台服务通知接口，通知后台上传文件完成同时获取批次号
									Map<String, Object> returnMap = batchBmo.getGroupIDfromSOAfterUpload(busMap, sessionStaff);
									message = "批量导入成功，导入批次号：<strong>"+returnMap.get("groupId")+"</strong>，请到“批量受理查询”功能中查询受理结果";
									if(SysConstant.BATCHBLACKLIST.equals(batchType)){
										message = "批量导入成功，导入批次号：<strong>"+returnMap.get("groupId")+"</strong>";
									}
									code = "0";
					 			}else{
					 				if(ftpResultMap == null || ftpResultMap.get("mess") == null)
					 					message = "批量导入服务调用失败";
					 				else
					 					message = ftpResultMap.get("mess").toString();
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
	 * @author ZhangYu
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
	 * @author ZhangYu 2015-10-19
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
}

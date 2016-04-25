package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
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

import com.al.ec.serviceplatform.client.DataBus;
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
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
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

	@RequestMapping(value = "/batchForm", method = RequestMethod.GET)
	public String batchForm(Model model, HttpServletRequest request) {
		String olId=request.getParameter("olId");
		String olseq=request.getParameter("olseq");
		String type=request.getParameter("type");
		String areaId=request.getParameter("areaId");
		//List<Map<String,Object>>time = getTimeList();
		List<Map<String,Object>>time = getTimeListIn5Days();
    	model.addAttribute("time", time);
		model.addAttribute("olId", olId);
		model.addAttribute("olseq", olseq);
		model.addAttribute("batchType", type);
		model.addAttribute("areaId", areaId);
		return "/batchOrder/batch-order-form";
	}
	public List<Map<String,Object>> getTimeList(){
		List<Map<String,Object>> time=new ArrayList<Map<String,Object>>(); 
    	Calendar ca = Calendar.getInstance();
		int hour=ca.get(Calendar.HOUR_OF_DAY)+1;//小时 
		String startDate="";
		String startDateStr="";
		String hourStr="";
    	SimpleDateFormat sp=new SimpleDateFormat("yyyyMMdd");
    	int flag=0;
    	HashMap<String,Object> map=null;
    	for(int i=hour;i<hour+24;i++){
    		map=new HashMap<String,Object>();
    		if(i>23){
    			hourStr="00".substring(String.valueOf(i-24).length())+String.valueOf(i-24);
    			startDateStr="次日"+String.valueOf(i-24)+"时";
    			if(flag==0){
    				ca.add(Calendar.DAY_OF_MONTH, 1);
    				flag++;
    			}
        	}else{
        		hourStr="00".substring(String.valueOf(i).length())+String.valueOf(i);
        		startDateStr="当日"+String.valueOf(i)+"时";
        	}
        	startDate=sp.format(ca.getTime())+hourStr+"0000";
        	map.put("date", startDate);
        	map.put("dateStr", startDateStr);
        	time.add(map);
    	}
    	return time;
	}
	
	/**
	 * 获取未来5天的时间列表，精确到“时”，以实现未来5天的预约时间。该方法目前用于批开活卡、批量新装、批量裸机销售等批量受理。
	 * @return 时间列表
	 * @author ZhangYu
	 */
	public List<Map<String, Object>> getTimeListIn5Days() {
		List<Map<String, Object>> time = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		int hour = calendar.get(Calendar.HOUR_OF_DAY) + 1;// 小时
		String startDate = "";
		String startDateStr = "";
		String hourStr = "";
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
		// int flag = 0;
		// 用于标识获取未来几天的时间列表，当reserveFlag = 1时，获取两天时间列表（即预约时间为两天之内）；当reserveFlag = 4时，获取五天时间列表（即预约时间为五天之内）。
		int reserveFlag = 4;
		HashMap<String, Object> map = null;
		for (int i = hour; i < (hour + 24 * reserveFlag); i++) {
			map = new HashMap<String, Object>();
			if (i > (23 + 24 * 3) && i <= (23 + 24 * 4)) {
				hourStr = "00".substring(String.valueOf(i - 24 * 4).length()) + String.valueOf(i - 24 * 4);
				startDateStr = "第五日" + String.valueOf(i - 24 * 4) + "时";
				if (i == (23 + 24 * 3) + 1) {
					calendar.add(Calendar.DAY_OF_MONTH, 1);
				}
			} else if (i > (23 + 24 * 2) && i <= (23 + 24 * 3)) {
				hourStr = "00".substring(String.valueOf(i - 24 * 3).length()) + String.valueOf(i - 24 * 3);
				startDateStr = "第四日" + String.valueOf(i - 24 * 3) + "时";
				if (i == (23 + 24 * 2) + 1) {
					calendar.add(Calendar.DAY_OF_MONTH, 1);
				}
			} else if (i > (23 + 24 * 1) && i <= (23 + 24 * 2)) {
				hourStr = "00".substring(String.valueOf(i - 24 * 2).length()) + String.valueOf(i - 24 * 2);
				startDateStr = "第三日" + String.valueOf(i - 24 * 2) + "时";
				if (i == (23 + 24 * 1) + 1) {
					calendar.add(Calendar.DAY_OF_MONTH, 1);
				}
			} else if (i > 23 && i <= (23 + 24 * 1)) {
				hourStr = "00".substring(String.valueOf(i - 24 * 1).length()) + String.valueOf(i - 24 * 1);
				startDateStr = "次日" + String.valueOf(i - 24 * 1) + "时";
				if (i == 23 + 1) {
					calendar.add(Calendar.DAY_OF_MONTH, 1);
				}
			} else {
				hourStr = "00".substring(String.valueOf(i).length()) + String.valueOf(i);
				startDateStr = "当日" + String.valueOf(i) + "时";
			}
			startDate = sdf.format(calendar.getTime()) + hourStr + "0000";
			map.put("date", startDate);
			map.put("dateStr", startDateStr);
			time.add(map);
		}
		return time;
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchImport", method = RequestMethod.POST)
	public String importData(Model model,
			HttpServletRequest request,HttpServletResponse response,
			@LogOperatorAnn String flowNum,
			@RequestParam("upFile") MultipartFile file,
			@RequestParam("olId") String olId) {
		String message="";
		String code="-1";
		boolean isError = false;
		//Map<String,Object> errorStack=null;
		JsonResponse jsonResponse = null;
		String olseq=request.getParameter("olseq");
		String batchType=request.getParameter("batchType");
		String reserveDt=request.getParameter("reserveDt");
		log.debug("reserveDt={}", reserveDt);
		String areaId=request.getParameter("areaId");
		if(olId==null||"".equals(olId)){
			message="购物id为空！";
			isError=true;
		}
		if(batchType==null||"".equals(batchType)){
			message="种子订单受理类型为空！";
			isError=true;
		}
		if(reserveDt==null||"".equals(reserveDt)){
			message="预约时间为空！";
			isError=true;
		}
		if(areaId==null||"".equals(areaId)){
			message="种子订单的地区信息为空！";
			isError=true;
		}
		if (null != file) {
			boolean oldVersion = true;
			String fileName = file.getOriginalFilename();
			if (fileName.matches("^.+\\.(?i)(xls)$")) {
				oldVersion = true;
			} else if (fileName.matches("^.+\\.(?i)(xlsx)$")) {
				oldVersion = false;
			} else {
				message="导入的文件类型错误，后缀必须为.xls或.xlsx！";
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
					message="对不起，文件读取异常！";
					isError = true;
				}
				if (!isError) {
					//号码批量预占批次号,在“批开活卡”和“批量新装”情况下，资源的批量预占接口的回参中新增resBatchId，需将resBatchId连同导入的Excel数据传与后台。
					String resBatchId = null;
					//message="批量导入成功,导入批次号："+rMap.get("groupId");
					Map<String,Object> checkResult=null;
					boolean flag=false;
					SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_LOGIN_STAFF);
					String str = sessionStaff.getCustId() +"/"+ sessionStaff.getPartyName() +"/" + sessionStaff.getCardNumber()+"/"+sessionStaff.getCardType();
					String encryptCustName = "";//客户定位回参中的CN点
					
					if(SysConstant.BATCHNEWORDER.equals(batchType)||SysConstant.BATCHHUOKA.equals(batchType)){//批量开卡、批量新装
						if(SysConstant.BATCHNEWORDER.equals(batchType)){// #13802，批量新装的时候门户批量新装的模版去掉客户列，调用服务传的custID为定位的客户信息
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
//							long startTime = System.currentTimeMillis();
							checkResult=readNewOrderExcelBatch(workbook,batchType,str);
//							long endTime = System.currentTimeMillis();
//							System.out.println("******************Excel解析******************共耗时/ms : " + (endTime - startTime));
						}else{
							checkResult=readNewOrderExcel(workbook,batchType);
						}
						if(checkResult.get("code")!=null&&"0".equals(checkResult.get("code"))){
							List<Map<String,Object>> mktResInstList=(List<Map<String,Object>>)checkResult.get("mktResInstList");
							if(mktResInstList.size()>0){
								Map<String,Object> resultMap=PlReservePhoneNums(mktResInstList,"E",flowNum);//批量预占
								resBatchId = (String) resultMap.get("batchId");//导入批次，资源预占成功后返回resBatchId，需记录到后台
								String ff=(String)resultMap.get("flag");
								if(ff.equals("0")){
									flag=true;
								}else if(ff.equals("1")){
									code="-2";
									message=resultMap.get("msg")+",号码状态校验不通过数据有:";
									model.addAttribute("errorlist", resultMap.get("errorlist"));
								}else{
									jsonResponse=(JsonResponse)resultMap.get("jsonResponse");
								}
							}
						}else{
							message="批量导入出错:"+(String)checkResult.get("errorData");
						}	
					}else if(SysConstant.BATCHCHAIJI.equals(batchType)||SysConstant.BATCHFUSHU.equals(batchType)
							||SysConstant.BATCHCHANGE.equals(batchType)){//批量拆机等
						checkResult=readCancelPhoneExcel(workbook);
						if(checkResult.get("code")!=null&&"0".equals(checkResult.get("code"))){
							flag=true;
						}else{
							message="批量导入出错:"+(String)checkResult.get("errorData");
						}	
					}else if(SysConstant.BATCHZUHE.equals(batchType)||SysConstant.BATCHEDITATTR.equals(batchType)){
						
					}else if(SysConstant.BATCHFAZHANREN.equals(batchType)){
						checkResult=readExtendCustExcel(workbook);
						if(checkResult.get("code")!=null&&"0".equals(checkResult.get("code"))){
							flag=true;
						}else{
							message="批量导入出错:"+(String)checkResult.get("errorData");
						}	
					}
					if(flag){
						List<Map<String,Object>> list=(List<Map<String,Object>>)checkResult.get("list");
						if(SysConstant.BATCHNEWORDER.equals(batchType)){//批量新装
							for (int i=0 ; i<list.size(); i++){
								list.get(i).put("custId", str);
							}
						}
						Map<String, Object> rMap = null;
						Map<String, Object> param = new HashMap<String, Object>();
						param.put("orderList", list);
						param.put("custOrderId", olId);
						param.put("encryptCustName", encryptCustName);
						param.putAll(getAreaInfos());
						if(SysConstant.BATCHFAZHANREN.equals(batchType)){
							param.put("commonRegionId",sessionStaff.getCurrentAreaId());
						}else{
							param.put("commonRegionId",areaId);
						}
						param.put("batchType", batchType);
						param.put("reserveDt", reserveDt);
						param.put("resBatchId", (resBatchId != null) ? resBatchId : "");
						Map<String, Object> busMap = new HashMap<String, Object>();
						busMap.put("batchOrder", param);
						try {
							rMap = orderBmo.batchExcelImport(busMap, flowNum, sessionStaff);
							if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
								message="批量导入成功,导入批次号："+rMap.get("groupId")+",请到“批量受理查询”中查询受理结果";
								code="0";
				 			}else{
				 				if(SysConstant.BATCHNEWORDER.equals(batchType)||SysConstant.BATCHHUOKA.equals(batchType)){//批量开卡、批量新装
					 				List<Map<String,Object>> mktResInstList=(List<Map<String,Object>>)checkResult.get("mktResInstList");
									if(mktResInstList.size()>0){
										PlReservePhoneNums(mktResInstList,"F",flowNum);//导入失败调批量释放
									}
				 				}
				 				if(rMap==null||rMap.get("msg")==null){
				 					message="批量导入服务调用失败";
				 				}else{
				 					message=rMap.get("msg").toString();
				 				}		 				
				 			}
						} catch (BusinessException be) {
							jsonResponse = super.failed(be);
							//errorStack=this.failedForm(be);
						} catch (InterfaceException ie) {
							jsonResponse = super.failed(ie, busMap, ErrorCode.BATCH_IMP_SUBMIT);
							//errorStack=this.failedForm(ie, param, ErrorCode.CHECK_UIMANDPHONE);
						} catch (Exception e) {
							jsonResponse = super.failed(ErrorCode.BATCH_IMP_SUBMIT, e, busMap);
							//errorStack=this.failedForm(ErrorCode.CHECK_UIMANDPHONE, e, param);
						}
					}
				}
			}
		} else {
			message="文件读取失败";
		}
//		List<Map<String,Object>>time = getTimeList();
		List<Map<String,Object>>time = this.getTimeListIn5Days();
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
	/**
	 * 批量拆机Excel解析
	 * @param workbook
	 * @param olId
	 * @param batchType
	 * @param flowNum
	 * @return
	 */
	private Map<String,Object> readCancelPhoneExcel(Workbook workbook){
		String message="";
		String code="-1";
		Map<String,Object> returnMap=new HashMap<String,Object>();
		StringBuffer errorData = new StringBuffer();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Set<Object> phoneSets = new TreeSet<Object>();
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			// 得到一个sheet
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			// 得到Excel的行数
			int totalRows = sheet.getPhysicalNumberOfRows();
			Map<String, Object> item = null;
			for (int i = 1; i < totalRows; i++) {
				item = new HashMap<String, Object>();
				Row row = sheet.getRow(i);
				if (null != row) {
					Cell cell = row.getCell(0);
					if (null != cell) {
						String cellValue = checkExcelCellValue(cell);
						if (cellValue == null) {
							errorData.append("第" + (i + 1)
									+ "行,第1列单元格格式不对");
							break;
						} else if (!"".equals(cellValue)) {
							item.put("accessNumber", cellValue);
						}else{
							errorData.append("第" + (i + 1)
									+ "行,第1列主接入号不能为空");
							break;
						}
					}else{
						errorData.append("第" + (i + 1)
								+ "行,第1列数据读取异常");
						break;
					}
					cell = row.getCell(1);
					if (null != cell) {
						String cellValue = checkExcelCellValue(cell);
						if (cellValue == null) {
							errorData.append("第" + (i + 1)
									+ "行,第2列单元格格式不对");
							break;
						} else if (!"".equals(cellValue)) {
							item.put("zoneNumber", cellValue);
						}else{
							errorData.append("第" + (i + 1)
									+ "行,第2列区号不能为空");
							break;
						}
					}else{
						errorData.append("第" + (i + 1)
								+ "行,第2列数据读取异常");
						break;
					}
					item.put("custId", "");
					item.put("accountId", "");
					item.put("uim", "");
					item.put("rentCoupon", "0");
				}
				if (item.size() > 0) {
					list.add(item);
				}
			}
		}
		for (Map<String, Object> phoneMap : list) {
			Object phoneNum = phoneMap.get("accessNumber");
			if (!phoneSets.add(phoneNum)) {
				errorData.append("号码:" + phoneNum + "重复!");
				break;
			}
		}
		
		if("".equals(errorData.toString())){
			code="0";
		}
		returnMap.put("errorData", errorData.toString());
		returnMap.put("list", list);
		returnMap.put("code", code);
		returnMap.put("message", message);
		return returnMap;
	}
	/**
	 * 批量新装Excel解析 修改号卡资源取出判断
	 * 
	 * @param workbook
	 * @param olId
	 * @param batchType
	 * @param flowNum
	 * @return
	 */
	private Map<String, Object> readNewOrderExcel(Workbook workbook,
			String batchType) {
		String message = "";
		String code = "-1";
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> mktResInstList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> uList = new ArrayList<Map<String, Object>>();
		Set<Object> phoneSets = new TreeSet<Object>();
		Set<Object> uSets = new TreeSet<Object>();
		Map<String, Object> item = null;
		Map<String, Object> pitem = null;
		Map<String, Object> uitem = null;
		// 循环读取每个sheet中的数据放入list集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			// 得到当前页sheet
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			// 得到Excel的行数
			int totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				for (int i = 1; i < totalRows; i++) {
					item = new HashMap<String, Object>();
					pitem = new HashMap<String, Object>();
					uitem = new HashMap<String, Object>();
					Row row = sheet.getRow(i);
					if (null != row) {
						boolean cellIsNull = true;
						if (batchType.equals(SysConstant.BATCHNEWORDER)
								|| batchType.equals(SysConstant.BATCHHUOKA)) {
							for (int k = 0; k < 8; k++) {
								Cell cellTemp = row.getCell(k);
								if (null != cellTemp) {
									String cellValue = checkExcelCellValue(cellTemp);
									if (cellValue != null
											&& !cellValue.equals("")
											&& !cellValue.equals("null")) {
										cellIsNull = false;
									}
								}
							}
						} else {
							for (int k = 0; k < 6; k++) {
								Cell cellTemp = row.getCell(k);
								if (null != cellTemp) {
									String cellValue = checkExcelCellValue(cellTemp);
									if (cellValue != null
											&& !cellValue.equals("")
											&& !cellValue.equals("null")) {
										cellIsNull = false;
									}
								}
							}
						}
						if (cellIsNull) {
							continue;
						}
						Cell cell = row.getCell(0);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第1列单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								item.put("custId", cellValue);
							} else {
								errorData.append("第" + (i + 1)
										+ "行,第1列客户id不能为空");
								break;
							}
						} else {
							errorData.append("第" + (i + 1) + "行,第1列客户id不能为空");
							break;
						}
						cell = row.getCell(1);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第2列单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								item.put("accountId", cellValue);
							} else {
								errorData.append("第" + (i + 1)
										+ "行,第2列帐户id不能为空");
								break;
							}
						} else {
							errorData.append("第" + (i + 1) + "行,第2列帐户id不能为空");
							break;
						}
						cell = row.getCell(2);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第3列单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								item.put("accessNumber", cellValue);
								pitem.put("phoneNum", cellValue);
							} else {
								errorData.append("第" + (i + 1)
										+ "行,第3列主接入号不能为空");
								break;
							}
						} else {
							errorData.append("第" + (i + 1) + "行,第3列主接入号不能为空");
							break;
						}
						cell = row.getCell(3);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第4列单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								item.put("uim", cellValue);
								uitem.put("instCode", cellValue);
								pitem.put("mktResInstCode", cellValue);
							} else {
								errorData.append("第" + (i + 1)
										+ "行,第4列uim卡号不能为空");
								break;
							}
						} else {
							errorData.append("第" + (i + 1) + "行,第4列uim卡号不能为空");
							break;
						}
						cell = row.getCell(4);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第5列单元格格式不对");
								break;
							} else {
								if ("".equals(cellValue)) {
									cellValue = "0";
								}
								item.put("rentCoupon", cellValue);
							}
						} else {
							item.put("rentCoupon", "0");
						}
						cell = row.getCell(5);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第6列单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								item.put("zoneNumber", cellValue);
							} else {
								errorData.append("第" + (i + 1) + "行,第6列区号不能为空");
								break;
							}
						} else {
							errorData.append("第" + (i + 1) + "行,第6列区号不能为空");
							break;
						}
						if (batchType.equals(SysConstant.BATCHNEWORDER)
								|| batchType.equals(SysConstant.BATCHHUOKA)) {
							cell = row.getCell(6);
							if (null != cell) {
								String cellValue = checkExcelCellValue(cell);
								if (cellValue == null) {
									errorData.append("第" + (i + 1)
											+ "行,第7列单元格格式不对");
									break;
								} else {
									item.put("linkman", cellValue);
								}
							} else {
								item.put("linkman", "");
							}
							cell = row.getCell(7);
							if (null != cell) {
								String cellValue = checkExcelCellValue(cell);
								if (cellValue == null) {
									errorData.append("第" + (i + 1)
											+ "行,第8列单元格格式不对");
									break;
								} else {
									item.put("linknumber", cellValue);
								}
							} else {
								item.put("linknumber", "");
							}
						} else {
							item.put("linkman", "");
							item.put("linknumber", "");
						}
					}
					if (item.size() > 0) {
						list.add(item);
					}
					if (pitem.size() > 0) {
						mktResInstList.add(pitem);
					}
					if (uitem.size() > 0) {
						uList.add(uitem);
					}
				}

			} else {
				message = "批量导入出错:导入数据为空";
			}

		}

		// 循环完成再做号卡去重判断
		// 号卡资源去重判断
		long time1 = new Date().getTime();
		for (Map<String, Object> phoneMap : mktResInstList) {
			Object phoneNum = phoneMap.get("phoneNum");
			if (!phoneSets.add(phoneNum)) {
				errorData.append("号码:" + phoneNum + "重复!");
				break;
			}
		}
		long time2 = new Date().getTime();
		for (Map<String, Object> uMap : uList) {
			Object uim = uMap.get("instCode");
			if (!uSets.add(uim)) {
				errorData.append("uim卡:" + uim + "重复!");
				break;
			}
		}
		if ("".equals(errorData.toString())) {
			code = "0";
		}
		long time3 = new Date().getTime();
		System.out.println("=============去重判断==============" + "号码去重判断耗时"
				+ (time2 - time1) + "uim卡去重耗时" + (time3 - time2));
		returnMap.put("errorData", errorData.toString());
		returnMap.put("mktResInstList", mktResInstList);
		returnMap.put("list", list);
		returnMap.put("code", code);
		returnMap.put("message", message);

		return returnMap;
	}
	

	/**
	 * 批量修改发展人Excel解析
	 * @param workbook
	 * @param olId
	 * @param batchType
	 * @param flowNum
	 * @return
	 */
	private Map<String,Object> readExtendCustExcel(Workbook workbook){
		String message="";
		String code="-1";
		Map<String,Object> returnMap=new HashMap<String,Object>();
		// 得到第一个sheet
		Sheet sheet = workbook.getSheetAt(0);
		// 得到Excel的行数
		int totalRows = sheet.getPhysicalNumberOfRows();
		StringBuffer errorData = new StringBuffer();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Map<String, Object> item = null;
		for (int i = 1; i < totalRows; i++) {
			item = new HashMap<String, Object>();
			Row row = sheet.getRow(i);
			if (null != row) {
				Cell cell = row.getCell(0);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("第" + (i + 1)
								+ "行,第1列单元格格式不对");
						break;
					} else if (!"".equals(cellValue)) {
						item.put("accessNumber", cellValue);
					}else{
						errorData.append("第" + (i + 1)
								+ "行,第1列主接入号不能为空");
						break;
					}
				}else{
					errorData.append("第" + (i + 1)
							+ "行,第1列数据读取异常");
					break;
				}
				cell = row.getCell(1);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("第" + (i + 1)
								+ "行,第2列单元格格式不对");
						break;
					} else if (!"".equals(cellValue)) {
						item.put("zoneNumber", cellValue);
					}else{
						errorData.append("第" + (i + 1)
								+ "行,第2列区号不能为空");
						break;
					}
				}else{
					errorData.append("第" + (i + 1)
							+ "行,第2列数据读取异常");
					break;
				}
				String maindata="";
				cell = row.getCell(2);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("第" + (i + 1)
								+ "行,第3列单元格格式不对");
						break;
					} else if (!"".equals(cellValue)) {
						String maindata1="";
						maindata1=cellValue;
						String[] data1=maindata1.split("@");
						if(data1.length!=4){
							errorData.append("第" + (i + 1)
									+ "行,第3列产品发展人数据格式应为:1@111@222@333");
							break;
						}else{
							boolean ff=false;
							for(int ii=0;ii<data1.length;ii++){
								if("".equals(data1[ii])){
									ff=true;
									errorData.append("第" + (i + 1)
											+ "行,第4列产品发展人数据格式应为:1@111@222@333");
									break;
								}
							}
							if(ff){
								break;
							}
							maindata=maindata1;
						}
					}
				}else{
					errorData.append("第" + (i + 1)
							+ "行,第3列数据读取异常");
					break;
				}
				cell = row.getCell(3);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("第" + (i + 1)
								+ "行,第4列单元格格式不对");
						break;
					} else if (!"".equals(cellValue)) {
						String maindata2="";
						maindata2=cellValue;
						String[] data2=maindata2.split("@");
						if(data2.length!=4){
							errorData.append("第" + (i + 1)
									+ "行,第4列销售品发展人数据格式应为:2@111@222@333");
							break;
						}else{
							boolean ff=false;
							for(int ii=0;ii<data2.length;ii++){
								if("".equals(data2[ii])){
									ff=true;
									errorData.append("第" + (i + 1)
											+ "行,第4列销售品发展人数据格式应为:2@111@222@333");
									break;
								}
							}
							if(ff){
								break;
							}
							if("".equals(maindata)){
								maindata=maindata2;
							}else{
								maindata=maindata+","+maindata2;
							}
						}
					}
				}else{
					errorData.append("第" + (i + 1)
							+ "行,第4列数据读取异常");
					break;
				}
				if("".equals(maindata)){
					errorData.append("第" + (i + 1)
							+ "行,产品发展人和销售品发展人信息不能同时为空");
					break;
				}else{
					item.put("attr", maindata);
				}
			}
			if (item.size() > 0) {
				list.add(item);
			}
		}
		if("".equals(errorData.toString())){
			code="0";
		}
		returnMap.put("errorData", errorData.toString());
		returnMap.put("list", list);
		returnMap.put("code", code);
		returnMap.put("message", message);
		return returnMap;
	}
	
	/**
	 * 从SessionStaff获取staffId和channelId以Map类型返回
	 * @return map
	 */
	private Map<String, Object> getAreaInfos(){
    	Map<String,Object> map=new HashMap<String,Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String staffId = sessionStaff.getStaffId();
		String channelId = sessionStaff.getCurrentChannelId();
		map.put("staffId", staffId);
		map.put("channelId", channelId);
		return map;
    }
	/*
	private Map<String,Object> failedForm( ErrorCode error, Object data, Map<String, Object> paramMap) {
		Map<String, Object> tempMap = new HashMap<String, Object>();
		tempMap.put("errCode", error.getCode());
		tempMap.put("errMsg", error.getErrMsg());
		tempMap.put("paramMap", JsonUtil.toString(paramMap));
		if (data instanceof Exception) {
			tempMap.put("errData", ExceptionUtils.getFullStackTrace((Throwable) data));			
		} else {
			tempMap.put("errData", data.toString());
		}
		Map<String, Object> retnMap = new HashMap<String, Object>();
		retnMap.put("code", "-2");
		retnMap.put("data", tempMap);
		return retnMap;
	}
	private Map<String,Object>  failedForm(BusinessException be){
		Map<String, Object> tempMap = new HashMap<String, Object>();
		tempMap.put("errCode", be.getError().getCode());
		tempMap.put("errMsg", be.getError().getErrMsg());
		tempMap.put("paramMap", JsonUtil.toString(be.getParamMap()));
		tempMap.put("resultMap", JsonUtil.toString(be.getResultMap()));
		tempMap.put("errData", ExceptionUtils.getFullStackTrace(be));
		
		Map<String, Object> retnMap = new HashMap<String, Object>();
		retnMap.put("code", "-2");
		retnMap.put("data", tempMap);
		return retnMap;
	}
	private Map<String,Object> failedForm(InterfaceException ie, Map<String, Object> paramMap, ErrorCode error) {
		Map<String, Object> tempMap = new HashMap<String, Object>();
		String errCode = "";
		String errMsg = "";
		try {
			if (ie.getErrType() == ErrType.TIMEOUT) {
				
			} else if (ie.getErrType() == ErrType.THROW) {
				errCode = error.getpCode();
				errMsg = error.getpErrMsg();
			} else if (ie.getErrType() == ErrType.PORTAL) {
				errCode = error.getCode();
				errMsg = error.getErrMsg();
			} else if (ie.getErrType() == ErrType.CATCH) {
				errCode = ie.getErrCode();
				errMsg = error.getSysByCode(errCode) + "异常：" + ie.getMsg();
			} else if (ie.getErrType() == ErrType.NONSTANDARD) {
				errCode = error.getpCode();
				errMsg = error.getpErrMsg();
			}
		} catch (Exception e) {
			log.error("获取错误编码出错", e);
		}
		tempMap.put("errCode", errCode);
		tempMap.put("errMsg",  errMsg);
		tempMap.put("paramMap", JsonUtil.toString(paramMap));
		if (ie.getErrType() == ErrType.CATCH) {
			tempMap.put("errData", ie.getErrStack());
		} else if (ie.getErrType() == ErrType.NONSTANDARD) {
			tempMap.put("errData", ie.getErrStack());
		} else if (ie.getErrType() == ErrType.THROW) {
			tempMap.put("errData", ie.getErrStack());
		} else {
			tempMap.put("errData", ExceptionUtils.getFullStackTrace(ie));
		}
		Map<String, Object> retnMap = new HashMap<String, Object>();
		retnMap.put("code", "-2");
		retnMap.put("data", tempMap);
		return retnMap;
	}
	*/
	private String checkExcelCellValue(Cell cell) {
		String cellValue = null;
		if(cell.getCellType() == Cell.CELL_TYPE_BLANK){
			cellValue="";
		}else if (cell.getCellType() == Cell.CELL_TYPE_STRING) {
			cellValue = cell.getStringCellValue();
		}
		if(cellValue!=null){
			cellValue=cellValue.trim();
		}
		return cellValue;
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
  
		param.put("reserveDt", "");//根据#52200：现去掉批量受理查询页面的“预约日期”搜索条件，但仍保留该字段，传值为空字符串"" By ZhangYu
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
	@ResponseBody //@RequestParam @RequestBody
	public JsonResponse batchOrderExport(@RequestParam Map<String, Object> param, Model model, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		param.putAll(getAreaInfos());
		try {
			List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
			Map<String,Object> rMap = orderBmo.batchProgressQuery(param, null, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				int totalSize = MapUtils.getIntValue(rMap, "totalSize", 0);
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
					
					//FileOutputStream fos = new FileOutputStream(new File("c:\\Test\\测试.xls")); 
					//this.exportExcel(excelTitle, headers, resultList, fos, "yyyy-MM-dd");
					//fos.close();
					response.addHeader("Content-Disposition", "attachment;filename="+new String( excelTitle.getBytes("gb2312"), "ISO8859-1" )+".xls");
					response.setContentType("application/binary;charset=utf-8");
					 
					ServletOutputStream  outputStream = response.getOutputStream();
					this.exportExcel(excelTitle, headers, resultList, outputStream);
					outputStream.close();
//					System.out.println("***************Excel导出成功********************");
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
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchProgressQuery", method = {RequestMethod.POST})
	public String batchProgressQuery(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);

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
				}
			}
		} catch (BusinessException e) {
			 this.log.error("服务出错", e);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.BATCH_IMP_LIST);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.BATCH_IMP_LIST, e, param);
//			return super.failedStr(model, ErrorCode.BATCH_IMP_LIST, data, param);
//			failedStr(Model model, ErrorCode error, Object data, Map<String, Object> paramMap)
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
	@SuppressWarnings("unchecked")
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
		param.put("areaId", sessionStaff.getAreaId());
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
	@SuppressWarnings("unchecked")
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
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchUpdateMain", method = {RequestMethod.POST})
	public String batchUpdateMain(@RequestBody Map<String, Object> param,Model model,HttpServletRequest request,HttpSession session) {
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/batchOrder/batchUpdateMain"));
		model.addAttribute("timeList", this.getTimeListIn5Days());
		model.addAttribute("param", param);
		
		return "/batchOrder/batch-order-batchUpdate_dialog";
	}
		
	@RequestMapping(value = "/batchOrderQuery", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String batchOrderQuery(Model model,HttpServletRequest request,HttpSession session) {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/batchOrder/batchOrderQuery"));
		String batchType=request.getParameter("batchType");
		String batchTypeName = "批量开活卡" ;
		if(batchType!=null){
			batchTypeName = getTypeNames(batchType);
		}else{
			batchType = SysConstant.BATCHNEWORDER ;//如果非 拆机，就默认是新装
		}
		/*
		if(SysConstant.BATCHNEWORDER.equals(batchType)){
			batchTypeName="批量新装";
		}else if(SysConstant.BATCHCHAIJI.equals(batchType)){
			batchTypeName="批量拆机";
		}
		*/
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String end = sdf.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
		String start = sdf.format(calendar.getTime());
		model.addAttribute("startDt", start);
		model.addAttribute("endDt", end);
		model.addAttribute("templateType", batchType);
		model.addAttribute("batchTypeName", batchTypeName);
		return "/batchOrder/batch-order-query";
	}

	@RequestMapping(value = "/batchEditParty", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String batchOrderEditParty(Model model,HttpServletRequest request,HttpSession session) {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/batchOrder/batchEditParty"));
		String batchTypeName =  getTypeNames(SysConstant.BATCHFAZHANREN);
		model.addAttribute("templateType", SysConstant.BATCHFAZHANREN);
		model.addAttribute("batchTypeName", batchTypeName);
		return "/batchOrder/batch-order-editParty";
	}
	
	/**
	 * 0--批开活卡		1--批量新装		2--批量订购/退订附属		3--组合产品纳入退出		4--批量修改产品属性<br/>
	 * 5--批量换挡		8--拆机 			9--批量修改发展人  		11--批量换挡				12--批量换卡
	 * @param templateType 上述0~12
	 * @return 批量业务类型名称，以字符串返回，若templateType不为null且没有匹配类型，则默认templateType为"0"，返回"批开活卡"。
	 */
	public String getTypeNames(String templateType){
		Map<String,String> map = new HashMap<String,String>();
		map.put("0", "批开活卡");
		map.put("1", "批量新装");
		map.put("2", "批量订购/退订附属");
		map.put("3", "组合产品纳入退出");
		map.put("4", "批量修改产品属性");
		map.put("5", "批量换挡");//在完成“需求（开发） #18397”时，遇到5和11均表示“批量换挡”的问题，经与后台沟通，仍使用11，5不会影响。
		map.put("8", "拆机");
		map.put("9", "批量修改发展人");
		map.put("11", "批量换挡");
		map.put("12", "批量换卡");
		if(map.get(templateType) != null){
			return map.get(templateType);
		}else{
			return map.get("0");
		}
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchOrderList", method = RequestMethod.GET)
	public String batchOrderList(Model model,@RequestParam Map<String, Object> param,HttpSession session,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
		
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
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = orderBmo.batchOrderDel(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse=super.successed("", ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("作废种子订单服务出错", e);
			jsonResponse = super.failed("作废种子订单服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
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
		model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session,"order/batchOrder/batchOrderTerminal"));
//		List<Map<String, Object>> time = getTimeList();
		List<Map<String, Object>> time = this.getTimeListIn5Days();
		model.addAttribute("time", time);
		model.addAttribute("batchType", "10");
		model.addAttribute("batchTypeName", "批量订购裸终端");
		return "/batchOrder/batch-order-terminal";
	}
	
	/**
	 * 批量换挡、批量换卡
	 * @param session
	 * @param model
	 * @return
	 * @author ZhangYu
	 */
	@RequestMapping(value = "/batchOrderChange", method = RequestMethod.GET)
	public String batchOrderChange(Model model,HttpServletRequest request,HttpSession session) {
		//model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session,"order/batchOrder/batchChangeFeeType"));
		//List<Map<String, Object>> timeList = getTimeList();
		List<Map<String, Object>> timeList = this.getTimeListIn5Days();
		String batchType = request.getParameter("batchType");
		String batchTypeName  = this.getTypeNames(batchType);
		
		model.addAttribute("time", timeList);
		model.addAttribute("batchType", batchType);
		model.addAttribute("batchTypeName", batchTypeName);
		
		return "/batchOrder/batch-order-change";
	}

	/**
	 * 批量订购裸终端 - 文件校验
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchOrderVerify", method = RequestMethod.POST)
	public String checkTerminal(Model model, HttpServletRequest request,
			HttpServletResponse response, @LogOperatorAnn String flowNum,
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
					SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_LOGIN_STAFF);
					// Excel格式校验
					checkResult = readOrderTerminalExcel(workbook);
					if(checkResult.get("code")!=null&&"0".equals(checkResult.get("code"))){
						flag=true;
					}else{
						message="批量文件格式出错:"+(String)checkResult.get("errorData");
					}
					if(flag){
						//Map<String,Object> checkResult = null;
						List<Map<String, Object>> terminalInfo = new ArrayList<Map<String, Object>>(); // 校验后的保存的终端信息
						int successNum = 0;     // 校验成功数目
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
								Map<String, Object> mktRes = mktResBmo.checkTerminalCode(
										param, flowNum, sessionStaff);
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
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchTerminalImport", method = RequestMethod.POST)
	public @ResponseBody JsonResponse batchTerminalImport(@RequestBody Map<String, Object> params,HttpServletRequest request,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
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
	 * 批量订购裸终端Excel解析
	 * @param workbook
	 * @return Map<String,Object>
	 */
	private Map<String,Object> readOrderTerminalExcel(Workbook workbook){
		String message="";
		String code="-1";
		Map<String,Object> returnMap=new HashMap<String,Object>();
		// 得到第一个sheet
		Sheet sheet = workbook.getSheetAt(0);
		// 得到Excel的行数
		int totalRows = sheet.getPhysicalNumberOfRows();
		StringBuffer errorData = new StringBuffer();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<String> mktResCodeList=new ArrayList<String>(); // 保存串码列，验证重复串码
		Map<String, Object> item = null;
		for (int i = 1; i < totalRows; i++) {
			item = new HashMap<String, Object>();
			Row row = sheet.getRow(i);
			if (null != row) {
				Cell cell = row.getCell(0);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("第" + (i + 1)
								+ "行,第1列单元格格式不对");
						break;
					} else if (!"".equals(cellValue)) {
						item.put("mktResCode", cellValue);
						if(mktResCodeList.contains(cellValue)){
							errorData.append("【第" + (i + 1)
									+ "行,第1列】串码重复");
							break;
						}
						mktResCodeList.add(cellValue);
					}else{
						errorData.append("【第" + (i + 1)
								+ "行,第1列】串码不能为空");
						break;
					}
				}else{
					errorData.append("【第" + (i + 1)
							+ "行,第1列】数据读取异常");
					break;
				}
				cell = row.getCell(1);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("【第" + (i + 1)
								+ "行,第2列】单元格格式不对");
						break;
					} else if (!"".equals(cellValue)) {
						item.put("salePrice", cellValue);
						Pattern pattern = Pattern.compile("^[0-9]+(.[0-9]{1,2})?$");
						Matcher matcher = pattern.matcher(cellValue);
						if(!matcher.matches()){
							errorData.append("【第" + (i + 1)
									+ "行,第2列】价格输入错误");
							break;
						}
					}else{
						errorData.append("【第" + (i + 1)
								+ "行,第2列】价格不能为空");
						break;
					}
				}else{
					errorData.append("【第" + (i + 1)
							+ "行,第2列】数据读取异常");
					break;
				}
				cell = row.getCell(2);
				if (null != cell) {
					String cellValue = checkExcelCellValue(cell);
					if (cellValue == null) {
						errorData.append("【第" + (i + 1)
								+ "行,第3列】单元格格式不对");
						break;
					} else {
						item.put("dealer", cellValue);
					}
				}else{
					item.put("dealer", "");
				}
			}
			if (item.size() > 0) {
				list.add(item);
			}
		}
		if("".equals(errorData.toString())){
			code="0";
		}
		returnMap.put("errorData", errorData.toString());
		returnMap.put("data", list);
		returnMap.put("code", code);
		returnMap.put("message", message);
		log.debug("param={}", JsonUtil.toString(returnMap));
		return returnMap;
	}
	/**
	 * 批量新装解析excle
	 * @param workbook
	 * @param batchType
	 * @param str
	 * @return
	 */
	private Map<String, Object> readNewOrderExcelBatch(Workbook workbook, String batchType, String str) {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		String segmentId = sessionStaff.getCustSegmentId();

		//批量新装，Excel模板新增一列“使用人custNumber”，校验客户类型：当客户为政企客户(政企证件)，“使用人custNumber”一列不能为空；公众证件置空。
		boolean custFlag;//政企客户(政企证件)：false；个人账户(公众证件)：true
/*		try {
			List<Map<String, Object>> CertTypeList = new ArrayList<Map<String, Object>>();
			String identifyCd = str.substring(str.lastIndexOf("/") + 1);
			//查询公众(个人)证件类型
			Map<String, Object> param = new HashMap<String, Object>(){
				{put("partyTypeCd", "1");}
			};
			Map<String, Object> rMap = custBmo .queryCertType(param, null, sessionStaff);
			CertTypeList = (List<Map<String, Object>>) rMap.get("result");
			if(!CertTypeList.isEmpty()){
				for(int i = 0; i < CertTypeList.size(); i ++){
					if(identifyCd.equals(CertTypeList.get(i).get("certTypeCd").toString())){
						//若客户定位的(identifyCd)结果与公众证件类型中某一类型(certTypeCd)一致，则其为个人账户(公众证件)
						custFlag = true;
					}
					
				}
			}
		} catch (Exception e) {
			code = "-1";
			message = "处理服务service/intf.custService/queryCertTypeByPartyTypeCd时异常";
			errorData.append(e.getStackTrace());
			returnMap.put("errorData", errorData.toString());
			returnMap.put("code", code);
			returnMap.put("message", message);

			return returnMap;
		}*/
		
		String message = "";
		String code = "-1";
		Map<String, Object> returnMap = new HashMap<String, Object>();
		StringBuffer errorData = new StringBuffer();
		
		if("1000".equals(segmentId))//政企客户
			custFlag = false;
		else if("1100".equals(segmentId))//公众客户
			custFlag = true;
		else{
			code = "-1";
			message = "无法获取客户定位的客户分群标识segmentId";
			errorData.append(message);
			returnMap.put("errorData", errorData.toString());
			returnMap.put("code", code);
			returnMap.put("message", message);

			return returnMap;
		}
		
		
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> mktResInstList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> uList = new ArrayList<Map<String, Object>>();
		Set<Object> phoneSets = new TreeSet<Object>();
		Set<Object> uSets = new TreeSet<Object>();
		Map<String, Object> item = null;
		Map<String, Object> pitem = null;
		Map<String, Object> uitem = null;
		// 循环读取每个sheet中的数据放入list集合中
		for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
			// 得到当前页sheet
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			// 得到Excel的行数
			int totalRows = sheet.getPhysicalNumberOfRows();
			if (totalRows > 1) {
				for (int i = 1; i < totalRows; i++) {
					item = new HashMap<String, Object>();
					pitem = new HashMap<String, Object>();
					uitem = new HashMap<String, Object>();
					Row row = sheet.getRow(i);
					if (null != row) {
						boolean cellIsNull = true;
						if (batchType.equals(SysConstant.BATCHNEWORDER)
								|| batchType.equals(SysConstant.BATCHHUOKA)) {
							for (int k = 0; k < 8; k++) {
								Cell cellTemp = row.getCell(k);
								if (null != cellTemp) {
									String cellValue = checkExcelCellValue(cellTemp);
									if (cellValue != null
											&& !cellValue.equals("")
											&& !cellValue.equals("null")) {
										cellIsNull = false;
									}
								}
							}
						} else {
							for (int k = 0; k < 6; k++) {
								Cell cellTemp = row.getCell(k);
								if (null != cellTemp) {
									String cellValue = checkExcelCellValue(cellTemp);
									if (cellValue != null
											&& !cellValue.equals("")
											&& !cellValue.equals("null")) {
										cellIsNull = false;
									}
								}
							}
						}
						if (cellIsNull) {
							continue;
						}
						item.put("custId", str);
						Cell cell = row.getCell(0);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("第" + (i + 1) + "行,第1列单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								item.put("accountId", cellValue);
							} else {
								errorData.append("第" + (i + 1)
										+ "行,第1列帐户id不能为空");
								break;
							}
						} else {
							errorData.append("第" + (i + 1) + "行,第1列帐户id不能为空");
							break;
						}
						cell = row.getCell(1);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第2列单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								item.put("accessNumber", cellValue);
								pitem.put("phoneNum", cellValue);
							} else {
								errorData.append("第" + (i + 1)
										+ "行,第2列主接入号不能为空");
								break;
							}
						} else {
							errorData.append("第" + (i + 1) + "行,第2列主接入号不能为空");
							break;
						}
						cell = row.getCell(2);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第3列单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								item.put("uim", cellValue);
								uitem.put("instCode", cellValue);
								pitem.put("mktResInstCode", cellValue);
							} else {
								errorData.append("第" + (i + 1)
										+ "行,第3列uim卡号不能为空");
								break;
							}
						} else {
							errorData.append("第" + (i + 1) + "行,第3列uim卡号不能为空");
							break;
						}
						cell = row.getCell(3);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第4列单元格格式不对");
								break;
							} else {
								if ("".equals(cellValue)) {
									cellValue = "0";
								}
								item.put("rentCoupon", cellValue);
							}
						} else {
							item.put("rentCoupon", "0");
						}
						cell = row.getCell(4);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData
										.append("第" + (i + 1) + "行,第5列单元格格式不对");
								break;
							} else if (!"".equals(cellValue)) {
								item.put("zoneNumber", cellValue);
							} else {
								errorData.append("第" + (i + 1) + "行,第5列区号不能为空");
								break;
							}
						} else {
							errorData.append("第" + (i + 1) + "行,第5列区号不能为空");
							break;
						}
						if (batchType.equals(SysConstant.BATCHNEWORDER)
								|| batchType.equals(SysConstant.BATCHHUOKA)) {
							cell = row.getCell(5);
							if (null != cell) {
								String cellValue = checkExcelCellValue(cell);
								if (cellValue == null) {
									errorData.append("第" + (i + 1)
											+ "行,第6列单元格格式不对");
									break;
								} else {
									item.put("linkman", cellValue);
								}
							} else {
								item.put("linkman", "");
							}
							cell = row.getCell(6);
							if (null != cell) {
								String cellValue = checkExcelCellValue(cell);
								if (cellValue == null) {
									errorData.append("第" + (i + 1)
											+ "行,第7列单元格格式不对");
									break;
								} else {
									item.put("linknumber", cellValue);
								}
							} else {
								item.put("linknumber", "");
							}
						} else {
							item.put("linkman", "");
							item.put("linknumber", "");
						}
						//校验“批量新装”新增的一列“使用人”
						//By ZhangYu 2015-09-07
						if (SysConstant.BATCHNEWORDER.equals(batchType)) {
							cell = row.getCell(7);
							if (null != cell && !custFlag) {
								String cellValue = checkExcelCellValue(cell);
								if (cellValue == null || cellValue.length() == 0) {
									errorData.append("第" + (i + 1) + "行,第8列单元格格式不对，政企客户使用人一列不可为空。");
									break;
								} else {
									item.put("custNumber", cellValue);//Excel中第8列“使用人”
								}
							} else if(!custFlag && null == cell){
								errorData.append("第" + (i + 1) + "行,第8列单元格格式不对，政企客户使用人一列不可为空。");
								break;								
							} else{
								item.put("custNumber", "");
							}
						}
					}
					if (item.size() > 0) {
						list.add(item);
					}
					if (pitem.size() > 0) {
						mktResInstList.add(pitem);
					}
					if (uitem.size() > 0) {
						uList.add(uitem);
					}
				}

			} else {
				message = "批量导入出错:导入数据为空";
			}

		}

		// 循环完成再做号卡去重判断
		// 号卡资源去重判断
		long time1 = new Date().getTime();
		for (Map<String, Object> phoneMap : mktResInstList) {
			Object phoneNum = phoneMap.get("phoneNum");
			if (!phoneSets.add(phoneNum)) {
				errorData.append("号码:" + phoneNum + "重复!");
				break;
			}
		}
		long time2 = new Date().getTime();
		for (Map<String, Object> uMap : uList) {
			Object uim = uMap.get("instCode");
			if (!uSets.add(uim)) {
				errorData.append("uim卡:" + uim + "重复!");
				break;
			}
		}
		if ("".equals(errorData.toString())) {
			code = "0";
		}
		long time3 = new Date().getTime();
		System.out.println("=============去重判断==============" + "号码去重判断耗时"
				+ (time2 - time1) + "uim卡去重耗时 " + (time3 - time2));
		returnMap.put("errorData", errorData.toString());
		returnMap.put("mktResInstList", mktResInstList);
		returnMap.put("list", list);
		returnMap.put("code", code);
		returnMap.put("message", message);

		return returnMap;
	
	}
	
	/**
	 * 批量换挡、批量换卡<br/>Excel校验后，将数据提交与后台，并将后台返回的数据封装到model
	 * @param model
	 * @param request
	 * @param response
	 * @param flowNum
	 * @param file
	 * @param olId
	 * @return
	 * @author ZhangYu
	 */
	@SuppressWarnings("unchecked")
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
		//Map<String,Object> errorStack=null;
		JsonResponse jsonResponse = null;
		//String olseq = request.getParameter("olseq");
		//String batchType = request.getParameter("batchType");
		//String reserveDt = request.getParameter("reserveDt");
		log.debug("reserveDt={}", reserveDt);
		//String areaId = request.getParameter("areaId");
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
					if (oldVersion)// 2003版本Excel(.xls)
						workbook = new HSSFWorkbook(file.getInputStream());
					else// 2007版本Excel或更高版本(.xlsx)
						workbook = new XSSFWorkbook(file.getInputStream());
				} catch (Exception e) {
					message="文件读取异常，请检查文件后重新尝试 !";
					isError = true;
				}
				if (!isError) {
					Map<String,Object> checkResult = null;
					boolean flag = false;
					SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
					String str = sessionStaff.getCustId() +"/"+ sessionStaff.getPartyName() +"/" + sessionStaff.getCardNumber()+"/"+sessionStaff.getCardType();
					if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType) || SysConstant.BATCHCHANGEUIM.equals(batchType)){
							checkResult = this.readExcelBatchChange(workbook, batchType, str);
						if(checkResult.get("code") != null && ResultCode.R_SUCC.equals(checkResult.get("code")))//Excel校验成功
							flag = true;
						else
							message = "批量导入出错:" + (String)checkResult.get("errorData");
					}
					if(flag){
						List<Map<String,Object>> orderLists = (List<Map<String,Object>>)checkResult.get("orderLists");
						Map<String, Object> param = new HashMap<String, Object>();
						param.put("orderList", orderLists);
						param.put("custOrderId", "");//与后台协商，目前传""，但不可不传，避免空指针
						param.putAll(getAreaInfos());
						param.put("commonRegionId",sessionStaff.getCurrentAreaId());
						param.put("batchType", batchType);
						param.put("reserveDt", reserveDt);	
						Map<String, Object> busMap = new HashMap<String, Object>();
						busMap.put("batchOrder", param);
						try {
							Map<String, Object> rMap = orderBmo.batchExcelImport(busMap, flowNum, sessionStaff);
							if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
								message = "批量导入成功，导入批次号：<strong>"+rMap.get("groupId")+"</strong>，请到“批量受理查询”功能中查询受理结果";
								code = "0";
				 			}else{
				 				if(rMap == null || rMap.get("msg") == null)
				 					message = "批量导入服务调用失败";
				 				else
				 					message = rMap.get("msg").toString();
				 			}
						} catch (BusinessException be) {
							jsonResponse = super.failed(be);
						} catch (InterfaceException ie) {
							jsonResponse = super.failed(ie, busMap, ErrorCode.BATCH_IMP_SUBMIT);
						} catch (Exception e) {
							jsonResponse = super.failed(ErrorCode.BATCH_IMP_SUBMIT, e, busMap);
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
		if(jsonResponse != null)
			model.addAttribute("errorStack",jsonResponse);
		
		return "/batchOrder/batch-order-change-list";
	}
	
	/**
	 * 批量换挡、批量换卡Excel解析
	 * @param workbook
	 * @param batchType
	 * @param str
	 * @return returnMap
	 * @author ZhangYu
	 */
	private Map<String, Object> readExcelBatchChange(Workbook workbook, String batchType, String str){

	String message = "";
	String code = "-1";
	Map<String, Object> returnMap = new HashMap<String, Object>();
	StringBuffer errorData = new StringBuffer();
	List<Map<String, Object>> orderLists = new ArrayList<Map<String, Object>>();
	Set<Object> accessNumberSets = new TreeSet<Object>();
	Map<String, Object> item = null;
	
	// 循环读取每个sheet中的数据放入list集合中
	for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
		// 得到当前页sheet
		Sheet sheet = workbook.getSheetAt(sheetIndex);
		// 得到Excel的行数
		int totalRows = sheet.getPhysicalNumberOfRows();
		if (totalRows > 1) {
			for (int i = 1; i < totalRows; i++) {
				item = new HashMap<String, Object>();
				Row row = sheet.getRow(i);
				if (null != row) {
					boolean cellIsNull = true;
					if (SysConstant.BATCHCHANGEFEETYPE.equals(batchType) || SysConstant.BATCHCHANGEUIM.equals(batchType)){
						for (int k = 0; k < 2; k++) {
							Cell cellTemp = row.getCell(k);
							if (null != cellTemp) {
								String cellValue = checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false;
								}
							}
						}
					}
					if (cellIsNull) {
						continue;
					}
					Cell cell = row.getCell(0);
					if (null != cell) {
						String cellValue = checkExcelCellValue(cell);
						if (cellValue == null) {
							errorData.append("<br/>【第" + (i + 1) + "行】【第1列】单元格格式不对");
							break;
						} else if (!"".equals(cellValue)) {
							if(checkAccessNbrReg(cellValue)){
								item.put("accessNumber", cellValue);//接入号码
							} else{
								errorData.append("<br/>【第" + (i + 1) + "行】【第1列】接入号码【"+cellValue+"】"+"不符合手机号码格式");
								break;
							}	
						} else {
							errorData.append("<br/>【第" + (i + 1) + "行】【第1列】接入号码不能为空");
							break;
						}
					} else {
						errorData.append("<br/>【第" + (i + 1) + "行】【第1列】接入号码不能为空");
						break;
					}
					cell = row.getCell(1);
					if (null != cell) {
						String cellValue = checkExcelCellValue(cell);
						if (cellValue == null) {
							errorData.append("<br/>【第" + (i + 1) + "行】【第2列】单元格格式不对");
							break;
						} else if (!"".equals(cellValue)) {
							if(checkOfferSpecIdReg(cellValue)){
								if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
									item.put("offerSpecId", cellValue);//批量换挡套餐
								if(SysConstant.BATCHCHANGEUIM.equals(batchType))
									item.put("newUim", cellValue);//新UIM卡号
							} else{
								if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
									errorData.append("<br/>【第" + (i + 1) + "行】【第2列】换挡套餐规格ID：【"+cellValue+"】"+"格式不正确");
								if(SysConstant.BATCHCHANGEUIM.equals(batchType))
									errorData.append("<br/>【第" + (i + 1) + "行】【第2列】UIM卡号：【"+cellValue+"】"+"格式不正确");
								break;
							}
							
						} else {
							if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
								errorData.append("<br/>【第" + (i + 1) + "行】【第2列】换挡套餐规格ID：【"+cellValue+"】"+"格式不正确");
							if(SysConstant.BATCHCHANGEUIM.equals(batchType))
								errorData.append("<br/>【第" + (i + 1) + "行】【第2列】UIM卡号：【"+cellValue+"】"+"格式不正确");
							break;
						}
					} else {
						if(SysConstant.BATCHCHANGEFEETYPE.equals(batchType))
							errorData.append("<br/>【第" + (i + 1) + "行】【第2列】换挡套餐规格ID不能为空");
						if(SysConstant.BATCHCHANGEUIM.equals(batchType))
							errorData.append("<br/>【第" + (i + 1) + "行】【第2列】新UIM卡号不能为空");
						break;
					}
				}
				if (item.size() > 0) {
					orderLists.add(item);
				}
			}
		} else {
			message = "批量导入异常:导入数据为空 !";
		}
	}//循环读取每个sheet中的数据放入list集合中--end

	// 循环完成再做号卡资源去重判断
	long time1 = new Date().getTime();
	for (Map<String, Object> orderList : orderLists) {
		Object accessNumber = orderList.get("accessNumber");
		if (!accessNumberSets.add(accessNumber)) {
			errorData.append("<br/>【" + accessNumber + "】为重复号码，请检查 !");
			break;
		}
	}
	long time2 = new Date().getTime();
	if ("".equals(errorData.toString())) {
		code = ResultCode.R_SUCC;
	}
	System.out.println("=============去重判断==============" + "批量号码去重判断耗时: " + (time2 - time1));
	returnMap.put("errorData", errorData.toString());
	returnMap.put("orderLists", orderLists);
	returnMap.put("code", code);
	returnMap.put("message", message);

	return returnMap;
	}
	
	/**
	 * 校验手机号码是否以1开头的11位数字
	 * @param cellValue
	 * @return 校验成功返回<strong>true</strong>，否则返回<strong>false</strong>
	 */
	private boolean checkAccessNbrReg(String cellValue){
		//Pattern pattern = Pattern.compile("^1\d{10}$");
		//Matcher matcher = pattern.matcher(cellValue);
		//return matcher.matches();
		return Pattern.matches("1\\d{10}", cellValue);
		
	}
	
	/**
	 * 校验换挡套餐ID是否为数字(批量换卡也在使用)
	 * @param cellValue
	 * @return 校验成功返回<strong>true</strong>，否则返回<strong>false</strong>
	 */
	private boolean checkOfferSpecIdReg(String cellValue){
		return Pattern.matches("[1-9]\\d*|0", cellValue);//匹配整数
		
	}
	
	/**
	 * 
	 * @param title
	 * @param headers
	 * @param dataList
	 * @param out
	 */
	protected void exportExcel(String title, String[] headers, List<Map<String, Object>> dataList, OutputStream outputStream){
		//声明一个工作簿
		HSSFWorkbook workbook = new HSSFWorkbook();
		//生成一个表格
		HSSFSheet sheet = workbook.createSheet(title);
		//设置表格默认列宽度为15个字符
		sheet.setDefaultColumnWidth(20);
		//生成一个样式，用来设置标题样式
		HSSFCellStyle headersStyle = workbook.createCellStyle();
		headersStyle.setFillForegroundColor(HSSFColor.SKY_BLUE.index);
		headersStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		headersStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		headersStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		headersStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		//生成一个字体
		HSSFFont headersFont = workbook.createFont();
		headersFont.setColor(HSSFColor.VIOLET.index);
		headersFont.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
		//把字体应用到当前的样式
		headersStyle.setFont(headersFont);
		// 生成并设置另一个样式,用于设置内容样式
		HSSFCellStyle contentStyle = workbook.createCellStyle();
		contentStyle.setFillForegroundColor(HSSFColor.LIGHT_YELLOW.index);
		contentStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
		contentStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		contentStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		contentStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
		contentStyle.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
		// 生成另一个字体
		HSSFFont contentFont = workbook.createFont();
		contentFont.setBoldweight(HSSFFont.BOLDWEIGHT_NORMAL);
		// 把字体应用到当前的样式
		contentStyle.setFont(contentFont);
		//产生表格标题行
		HSSFRow row = sheet.createRow(0);
		for(int i = 0; i < headers.length; i++){
			HSSFCell cell = row.createCell(i);
			cell.setCellStyle(headersStyle);
			cell.setCellValue(new HSSFRichTextString(headers[i]));
		}
		//填充表格数据内容
		for (int i = 0; i < dataList.size(); i++) {
			Map<String,Object> map = (Map<String, Object>) dataList.get(i);
			row = sheet.createRow(i+1);
			int j = 0;
			Object value = null;
			row.createCell(j++).setCellValue(null == map.get("groupId") ? "" : map.get("groupId").toString());
			row.createCell(j++).setCellValue(
					"".equals(map.get("boProdAn").toString()) ? map.get("accessNumber").toString() : map.get("boProdAn").toString());
			row.createCell(j++).setCellValue(null == map.get("boProd2Td") ? "" : map.get("boProd2Td").toString());//uim卡号
			row.createCell(j++).setCellValue(null == map.get("genOlDt") ? "" : map.get("genOlDt").toString());//受理时间
			String tempStr;
			
			if(null == map.get("statusCd")){
				tempStr = "";
			} else{
				String statusCd = map.get("statusCd").toString();
				if("PC".equals(statusCd))
					tempStr = "派发成功";
				else if("PD".equals(statusCd))
					tempStr = "派发失败";
				else if("Q".equals(statusCd))
					tempStr = "导入成功";
				else if("S".equals(statusCd))
					tempStr = "购物车生成成功";
				else if("X".equals(statusCd))
					tempStr = "购物车生成失败";
				else if("PW".equals(statusCd))
					tempStr = "正在派发中";
				else if("C".equals(statusCd))
					tempStr = "发送后端成功";
				else if("PE".equals(statusCd))
					tempStr = "等待重新派发";
				else if("F".equals(statusCd))
					tempStr = "发送后端失败";
				else if("DL".equals(statusCd))
					tempStr = "受理处理中";
				else if("RC".equals(statusCd))
					tempStr = "返销成功";
				else
					tempStr = "";
			}
			row.createCell(j++).setCellValue(tempStr);
			row.createCell(j++).setCellValue(map.get("msgInfo") == null ? "" : map.get("msgInfo").toString());
			row.createCell(j++).setCellValue(map.get("orderStatusName") == null ? "" : map.get("orderStatusName").toString());
			row.createCell(j++).setCellValue(map.get("transactionId") == null ? "" : map.get("transactionId").toString());//下省流水
			row.createCell(j++).setCellValue(map.get("custSoNumber") == null ? "" : map.get("custSoNumber").toString());//购物车流水
		}
		try {
			workbook.write(outputStream);
		} catch (IOException e) {
			e.printStackTrace();/////////////////////////////////////////////异常处理////////////////////////////////////
		}
	}

	/**
	 * #“#18396集约CRM系统批量预开通功能优化需求”开关，ON：改造之后(新代码)；OFF：改造之前(旧代码)
	 * BATCHORDER_QRY_FLAG
	 * #“# #26339批量订单查询权限控制优化”开关，ON：改造之后；OFF：改造之前
	 * BATCHORDER_AUTH_FLAG
	 * @return 
	 * @author ZhangYu
	 * 			
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchOrderFlag", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse batchOrderFlag(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {

		String queryFlag = (String) param.get("queryFlag");
		return batchOrderFlag(queryFlag);
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
				jsonResponse = super.failed("读取配置文件portal.properties异常", -1);
			
		} else if("batchOrderAuth".equals(queryFlag)){
			String batchOrder_auth_flag = propertiesUtils.getMessage("BATCHORDER_AUTH_FLAG");
			if("ON".equals(batchOrder_auth_flag))
				jsonResponse = super.successed("Y", ResultConstant.SUCCESS.getCode());
			else if("OFF".equals(batchOrder_auth_flag))
				jsonResponse = super.successed("N", ResultConstant.SUCCESS.getCode());
			else
				jsonResponse = super.failed("读取配置文件portal.properties异常", -1);
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
	public JsonResponse downloadFile(@RequestParam Map<String, Object> param, Model model, HttpServletResponse response) throws IOException {
		try {
			FtpUtils ftpUtils = new FtpUtils();
			String fileUrl = (String) param.get("fileUrl");
			String fileName = (String) param.get("fileName");
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
			
			response.addHeader("Content-Disposition", "attachment;filename="+fileName);
			response.setContentType("application/binary;charset=utf-8");
			
			ftpUtils.connectFTPServer(remoteAddress,remotePort,userName,password);
			boolean isFileExist = ftpUtils.isFileExist(newFileName,filePath);
			if(isFileExist){
				ftpUtils.downloadFileByPath(filePath+newFileName, outputStream);
			}
			outputStream.close();
			return super.successed("导出成功！");
		} catch (Exception e) {
			return super.failed("导出文件异常",ResultConstant.FAILD.getCode());
		}
		
	}
}

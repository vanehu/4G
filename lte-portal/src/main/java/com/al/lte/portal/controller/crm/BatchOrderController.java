package com.al.lte.portal.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
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

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.controller.crm.BatchOrderController")
@RequestMapping("/order/batchOrder/*")
public class BatchOrderController  extends BaseController {
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;

	@RequestMapping(value = "/batchForm", method = RequestMethod.GET)
	public String batchForm(Model model, HttpServletRequest request) {
		String olId=request.getParameter("olId");
		String olseq=request.getParameter("olseq");
		String type=request.getParameter("type");
		String areaId=request.getParameter("areaId");
		model.addAttribute("olId", olId);
		model.addAttribute("olseq", olseq);
		model.addAttribute("batchType", type);
		model.addAttribute("areaId", areaId);
		return "/batchOrder/batch-order-form";
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
					//message="批量导入成功,导入批次号："+rMap.get("groupId");
					Map<String,Object> checkResult=null;
					boolean flag=false;
					SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_LOGIN_STAFF);
					if(SysConstant.BATCHNEWORDER.equals(batchType)||SysConstant.BATCHHUOKA.equals(batchType)){//批量开卡、批量新装
						checkResult=readNewOrderExcel(workbook,batchType);
						if(checkResult.get("code")!=null&&"0".equals(checkResult.get("code"))){
							List<Map<String,Object>> mktResInstList=(List<Map<String,Object>>)checkResult.get("mktResInstList");
							if(mktResInstList.size()>0){
								Map<String,Object> resultMap=PlReservePhoneNums(mktResInstList,"E",flowNum);//批量预占
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
						Map<String, Object> rMap = null;
						Map<String, Object> param = new HashMap<String, Object>();
						param.put("orderList", list);
						param.put("custOrderId", olId);
						param.putAll(getAreaInfos());
						param.put("commonRegionId",sessionStaff.getCurrentAreaId());
						param.put("batchType", batchType);
						param.put("reserveDt", reserveDt);	
						Map<String, Object> busMap = new HashMap<String, Object>();
						busMap.put("batchOrder", param);
						try {
							rMap = orderBmo.batchExcelImport(busMap, flowNum, sessionStaff);
							if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
								message="批量导入成功,导入批次号："+rMap.get("groupId");
								code="0";
				 			}else{
				 				message="批量导入服务调用失败";
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
				item.put("custId", "");
				item.put("accountId", "");
				item.put("uim", "");
				item.put("rentCoupon", "0");
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
	 * 批量新装Excel解析
	 * @param workbook
	 * @param olId
	 * @param batchType
	 * @param flowNum
	 * @return
	 */
	private Map<String,Object> readNewOrderExcel(Workbook workbook,String batchType){
		String message="";
		String code="-1";
		Map<String,Object> returnMap=new HashMap<String,Object>();
		// 得到第一个sheet
		Sheet sheet = workbook.getSheetAt(0);
		// 得到Excel的行数
		int totalRows = sheet.getPhysicalNumberOfRows();
		StringBuffer errorData = new StringBuffer();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> mktResInstList=new ArrayList<Map<String, Object>>();
		Map<String, Object> item = null;
		Map<String,Object> pitem=null;
		if(totalRows>1 && totalRows<10000){
			for (int i = 1; i < totalRows; i++) {
				item = new HashMap<String, Object>();
				pitem= new HashMap<String, Object>();
				Row row = sheet.getRow(i);
				if (null != row) {
					boolean cellIsNull = true ;
					if(batchType.equals(SysConstant.BATCHNEWORDER)||batchType.equals(SysConstant.BATCHHUOKA)){
						for(int k=0;k<8;k++){
							Cell cellTemp = row.getCell(k);
							if (null != cellTemp) {
								String cellValue = checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false ;
								}
							}
						}
					}else{
						for(int k=0;k<6;k++){
							Cell cellTemp = row.getCell(k);
							if (null != cellTemp) {
								String cellValue = checkExcelCellValue(cellTemp);
								if (cellValue != null && !cellValue.equals("") && !cellValue.equals("null")) {
									cellIsNull = false ;
								}
							}
						}
					}
					if(cellIsNull){
						continue;
					}
					Cell cell = row.getCell(0);
					if (null != cell) {
						String cellValue = checkExcelCellValue(cell);
						if (cellValue == null) {
							errorData.append("第" + (i + 1)
									+ "行,第1列单元格格式不对");
							break;
						} else if (!"".equals(cellValue)) {
							item.put("custId", cellValue);
						}else{
							errorData.append("第" + (i + 1)
									+ "行,第1列客户id不能为空");
							break;
						}
					}else{
						errorData.append("第" + (i + 1)
								+ "行,第1列客户id不能为空");
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
							item.put("accountId", cellValue);
						}else{
							errorData.append("第" + (i + 1)
									+ "行,第2列帐户id不能为空");
							break;
						}
					}else{
						errorData.append("第" + (i + 1)
								+ "行,第2列帐户id不能为空");
						break;
					}
					cell = row.getCell(2);
					if (null != cell) {
						String cellValue = checkExcelCellValue(cell);
						if (cellValue == null) {
							errorData.append("第" + (i + 1)
									+ "行,第3列单元格格式不对");
							break;
						} else if (!"".equals(cellValue)) {
							item.put("accessNumber", cellValue);
							pitem.put("phoneNum", cellValue);
						}else{
							errorData.append("第" + (i + 1)
									+ "行,第3列主接入号不能为空");
							break;
						}
					}else{
						errorData.append("第" + (i + 1)
								+ "行,第3列主接入号不能为空");
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
							item.put("uim", cellValue);
							pitem.put("instCode", cellValue);
						}else{
							errorData.append("第" + (i + 1)
									+ "行,第4列uim卡号不能为空");
							break;
						}
					}else{
						errorData.append("第" + (i + 1)
								+ "行,第4列uim卡号不能为空");
						break;
					}
					cell = row.getCell(4);
					if (null != cell) {
						String cellValue = checkExcelCellValue(cell);
						if (cellValue == null) {
							errorData.append("第" + (i + 1)
									+ "行,第5列单元格格式不对");
							break;
						} else {
							if("".equals(cellValue)){
								cellValue="0";
							}
							item.put("rentCoupon", cellValue);
						}
					}else{
						item.put("rentCoupon", "0");
					}
					cell = row.getCell(5);
					if (null != cell) {
						String cellValue = checkExcelCellValue(cell);
						if (cellValue == null) {
							errorData.append("第" + (i + 1)
									+ "行,第6列单元格格式不对");
							break;
						} else if (!"".equals(cellValue)) {
							item.put("zoneNumber", cellValue);
						}else{
							errorData.append("第" + (i + 1)
									+ "行,第6列区号不能为空");
							break;
						}
					}else{
						errorData.append("第" + (i + 1)
								+ "行,第6列区号不能为空");
						break;
					}
					if(batchType.equals(SysConstant.BATCHNEWORDER)||batchType.equals(SysConstant.BATCHHUOKA)){
						cell = row.getCell(6);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("第" + (i + 1)
										+ "行,第7列单元格格式不对");
								break;
							} else{
								item.put("linkman", cellValue);
							}
						}else{
							item.put("linkman", "");
						}
						cell = row.getCell(7);
						if (null != cell) {
							String cellValue = checkExcelCellValue(cell);
							if (cellValue == null) {
								errorData.append("第" + (i + 1)
										+ "行,第8列单元格格式不对");
								break;
							} else{
								item.put("linknumber", cellValue);
							}
						}else{
							item.put("linknumber", "");
						}
					}else{
						item.put("linkman", "");
						item.put("linknumber", "");
					}
				}
				if (item.size() > 0) {
					list.add(item);
				}
				if(pitem.size()>0){
					mktResInstList.add(pitem);
				}
			}
		} else if(totalRows>=10000){
			errorData.append("导入数据不能超过10000行");
		} else{
			errorData.append("导入数据为空");
		}
		if("".equals(errorData.toString())){
			code="0";
		}
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
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/batchOrder/batchImportQuery"));
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String end = sdf.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
		String start = sdf.format(calendar.getTime());
		model.addAttribute("startDt", start);
		model.addAttribute("endDt", end);
		return "/batchOrder/batch-order-imQuery";
	}
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/batchImportList", method = RequestMethod.GET)
	public String batchImportList(Model model,@RequestParam Map<String, Object> param,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
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
	
	@RequestMapping(value = "/batchOrderQuery", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String batchOrderQuery(Model model,HttpServletRequest request,HttpSession session) {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/batchOrder/batchOrderQuery"));
		String batchType=request.getParameter("batchType");
		String batchTypeName = "批量开活卡" ;
		if(batchType!=null){
			batchTypeName = getTypeNames(batchType);
			if("".equals(batchTypeName)){
				return "/error/500.jsp";
			}
		}else{
			return "/error/500.jsp";
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
	public String getTypeNames(String templateType){
		Map<String,String> map=new HashMap<String,String>();
		//0---批量开活卡 1---批量新装	2---批量订购/退订附属	3---组合产品纳入退出	4---批量修改产品属性	5--批量换挡8---拆机 9---批量修改发展人
		map.put("0", "批开活卡");
		map.put("1", "批量新装");
		map.put("2", "批量订购/退订附属");
		map.put("3", "组合产品纳入退出");
		map.put("4", "批量修改产品属性");
		map.put("5", "批量换挡");
		map.put("8", "拆机");
		map.put("9", "批量修改发展人");
		if(map.get(templateType)!=null){
			return map.get(templateType);
		}else{
			return "";
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
			
		}
		if(flag){
			model.addAttribute("templateType", param.get("templateType"));
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
}

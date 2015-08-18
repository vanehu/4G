package com.al.lte.portal.controller.crm;


import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
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

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PageUtil;
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
import com.al.lte.portal.bmo.crm.BillBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.common.print.CustomizeBillUtils;
import com.al.lte.portal.common.print.bill.CustomizeBill;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 计费相关业务控制层
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portel.controller.crm.BillController")
@RequestMapping("/bill/*")
public class BillController extends BaseController {
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.BillBmo")
	private BillBmo billBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
	private MktResBmo mktResBmo;
	
	private static Object pLock = new Object();

	@RequestMapping(value = "/foregiftmain", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/foregiftmain"));
		return "/bill/foregift-main";
    }
	
	/**
	 *  转至反销帐主页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/reversewriteoffcash", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String reverseWriteOffCashMain(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/reversewriteoffcash"));
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		//获取默认地区
//		String defaultAreaName = sessionStaff.getCurrentAreaAllName();
//		String defaultAreaId = sessionStaff.getCurrentAreaId();
//		String defaultAreaCode = sessionStaff.getCurrentAreaCode();		
		String busiType = super.getRequest().getParameter("busiType");
		if(busiType != null){
			model.addAttribute("busiType", busiType);
		}
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		Map<String, Object> currentDate = new HashMap<String, Object>();
		String currentMonth = sdfShow.format(calendar.getTime());
		String currentCycle = sdfHide.format(calendar.getTime());
		currentDate.put("billingMonth", currentMonth);
		currentDate.put("billingCycle", currentCycle);
		billingDates.add(currentDate);
		for(int n=0;n<5;n++){
			calendar.add(Calendar.MONTH, -1);
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
		}
//		model.addAttribute("defaultAreaName", defaultAreaName);
//		model.addAttribute("defaultAreaId", defaultAreaId);
//		model.addAttribute("defaultAreaCode", defaultAreaCode);
		model.addAttribute("defaultAreaName", CommonMethods.getDefaultAreaName(sessionStaff));
		model.addAttribute("defaultAreaCode", sessionStaff.getAreaCode());
		model.addAttribute("defaultAreaId", sessionStaff.getAreaId());
		model.addAttribute("billingDates", billingDates);
		return "/bill/reverse-writeoffcash-main";
    }
	
	
	/**
	 * 打开滞纳金（欠费查询）页面
	 * @return
	 */
	@RequestMapping(value = "/prepareOwingCharge", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String prepareOwingCharge(){
	    return "/bill/derate_due";
	}
	
	/**
	 * 执行欠费查询操作
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @return
	 */
    @RequestMapping(value = "/getOweCharge", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String getOweCharge(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response)throws BusinessException{
        
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);          
        try{                        
            Map<String, Object> resultMap = mktResBmo.getOweCharge(param, flowNum, sessionStaff);                           
            if(ResultCode.R_SUCCESS.equals(resultMap.get("code"))){
                model.addAttribute("flag", 0);
                String MID = MapUtils.getString(resultMap, "MID", "");
				if(MID.contains("#")){
					MID = MID.split("#")[0];
					model.addAttribute("MID", MID);
				}
                model.addAttribute("owingCharge", resultMap.get("result"));                  
             }
            else{
                 model.addAttribute("flag", 1);
                 if(resultMap.get("message")!=null){
                     model.addAttribute("errorMsg", resultMap.get("message"));
                 }
             }
        }catch(BusinessException be){
             return super.failedStr(model, be);
         }catch(Exception e){
             return super.failedStr(model, ErrorCode.QUERY_OVERDUE, e, param);
         }
         return "/bill/derate_due_list";
     }
	/**
	 * 销帐查询
	 * @param param
	 * @param flowNum
	 * @param model
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryWriteOffCash", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryWriteOffCash(@RequestBody Map<String, Object> params, String flowNum, HttpServletResponse response, HttpSession session){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jr = new JsonResponse();
		Map<String, Object> empty = new HashMap<String, Object>();
		try{
			Map<String,Object> resultMap = billBmo.queryWriteOffCash(params, flowNum, sessionStaff);
    		if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
    			String MID = MapUtils.getString(resultMap, "message", " # ").split("#")[0]; //获取本次查询的MID
    			Map<String, Object> result = MapUtils.getMap(resultMap, "result", empty);
    			if(!result.isEmpty()){
    				List<Map<String, Object>> writeOffInfomation = (List<Map<String, Object>>)result.get("writeOffInfomation");
    				Map<String, Object> jsonRsp = new HashMap<String, Object>();
    				jsonRsp.put("writeOffInfomation", writeOffInfomation);
    				jsonRsp.put("MID", MID);
    				jr = super.successed(jsonRsp);
    			}else{
    				List<Map<String, Object>> writeOffInfomation = new ArrayList<Map<String, Object>>();
    				Map<String, Object> jsonRsp = new HashMap<String, Object>();
    				jsonRsp.put("writeOffInfomation", writeOffInfomation);
    				jsonRsp.put("MID", MID);
    				jr = super.successed(jsonRsp);
    			}
    		}else{
    			jr = super.failed(resultMap.get("message"), ResultConstant.FAILD.getCode());
    		}
    	} catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, params, ErrorCode.QUERY_WRITEOFFCASH);
		} catch (Exception e) {
			log.error("门户/bill/queryWriteOffCash方法异常", e);
			return super.failed(ErrorCode.QUERY_WRITEOFFCASH, e, params);
		}
		return jr;
	}
	
	
	
	/**
	 * 销账 历史记录 打印发票 
	 * @param param
	 * @param flowNum
	 * @param model
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/getInvoiceItems", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getInvoiceItems(@RequestBody Map<String, Object> params, String flowNum, HttpServletResponse response, HttpSession session){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jr = new JsonResponse();
		try{
    		//Map<String, Object> resultMap = billBmo.getBalance(param, flowNum, sessionStaff);
			Map<String,Object> resultMap = billBmo.getInvoiceItems(params, flowNum, sessionStaff);
			if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
    			jr = super.successed(resultMap.get("result"),ResultConstant.SUCCESS.getCode());
    		}
    		else{            		
    			jr = super.failed(resultMap.get("msg"),ResultConstant.FAILD.getCode());            	
    		} 
    	} catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, params, ErrorCode.WRITEOFFCASH_INVOICE_INFO);
		} catch (Exception e) {
			return super.failed(ErrorCode.WRITEOFFCASH_INVOICE_INFO, e, params);
		}
		return jr;
	}
	
	/**
	 * 新新票据打印
	 * @param param
	 * @param flowNum
	 * @param model
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/getNewInvoiceItems", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getNewInvoiceItems(@RequestBody Map<String, Object> params, String flowNum, HttpServletResponse response, HttpSession session){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jr = new JsonResponse();
		try{
    		//Map<String, Object> resultMap = billBmo.getBalance(param, flowNum, sessionStaff);
			Map<String,Object> resultMap = billBmo.getNewInvoiceItems(params, flowNum, sessionStaff);
			if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
    			jr = super.successed(resultMap.get("result"),ResultConstant.SUCCESS.getCode());
    		}
    		else{            		
    			jr = super.failed(resultMap.get("msg"),ResultConstant.FAILD.getCode());            	
    		} 
    	} catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, params, ErrorCode.NEW_WRITEOFFCASH_INVOICE_INFO);
		} catch (Exception e) {
			return super.failed(ErrorCode.NEW_WRITEOFFCASH_INVOICE_INFO, e, params);
		}
		return jr;
	}
	
	/**
	 * 反销帐
	 * @param param
	 * @param flowNum
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/reverseWriteOffCash", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse reverseWriteOffCash(@RequestBody Map<String, Object> params, String flowNum, HttpServletResponse response, HttpSession session){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		params.put("staffId", sessionStaff.getStaffId());
		params.put("areaId", sessionStaff.getAreaId());
		params.put("staffCode", sessionStaff.getStaffCode());
		JsonResponse jr = new JsonResponse();
		try{
			Map<String,Object> resultMap = billBmo.reverseWriteOffCash(params, flowNum, sessionStaff);
    		if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
    			jr = super.successed(resultMap.get("result"), ResultConstant.SUCCESS.getCode());
    		}
    		else{            		
    			jr = super.failed(resultMap.get("message"), ResultConstant.FAILD.getCode());            	
    		}    		    		
    	} catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, params, ErrorCode.REVERSE_WRITEOFFCASH);
		} catch (Exception e) {
			log.error("门户/bill/reverseWriteOffCash方法异常", e);
			return super.failed(ErrorCode.REVERSE_WRITEOFFCASH, e, params);
		}
		return jr;
	}
	
	/**
	 *  转至余额查询页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/preQueryBalance", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String balanceMain(Model model, HttpSession session) throws AuthorityException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);

		model.addAttribute("pageType", "query"); //余额查询的页面标记
		model.addAttribute("defaultAreaName", CommonMethods.getDefaultAreaName(sessionStaff));
		model.addAttribute("defaultAreaCode", sessionStaff.getAreaCode());
		model.addAttribute("defaultAreaId", sessionStaff.getAreaId());
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/preQueryBalance"));
		return "bill/balance-main";
	}
	
	/**
	 * 余额查询
	 * @param params
	 * @param model
	 * @param flowNum
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryBalanceDetail", method = RequestMethod.GET)
	public String queryBalanceDetail(@RequestParam Map<String, Object> params, Model model, @LogOperatorAnn String flowNum, HttpSession session)throws BusinessException{
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> empty = new HashMap<String, Object>();
		
		try{
			Map<String, Object> returnMap = billBmo.getBalance(params, flowNum, sessionStaff);
			if(ResultCode.R_SUCCESS.equals(MapUtils.getString(returnMap, "code", ""))){
				Map<String, Object> resultMap = (Map<String, Object>) returnMap.get("resultMap");
				if(ResultCode.R_SUCCESS.equals(MapUtils.getString(resultMap, "code", ""))){
					if(!MapUtils.getMap(resultMap, "balanceInfo", empty).isEmpty()){
						Map<String, Object> balanceInfo = (Map<String, Object>)resultMap.get("balanceInfo");
						String totalBalanceAvailable = MapUtils.getString(balanceInfo, "totalBalanceAvailable", "").trim();
		    			if(totalBalanceAvailable.equals("")){
		    				totalBalanceAvailable = "0";
		    			}
		    			model.addAttribute("totalBalance", totalBalanceAvailable);//用于前台展示的全部余额
		    			model.addAttribute("queryType", MapUtils.getString(params, "queryItemType", ""));//余额类型 0：全部余额  1：可用余额
		    			int paymentLimit = 0;//【本金】余额记录
		    			if(balanceInfo.get("balanceItemDetail")!=null){
		    				ArrayList<Map<String,Object>> balanceItemDetail = (ArrayList<Map<String, Object>>)balanceInfo.get("balanceItemDetail");
			    			model.addAttribute("balanceDetail", balanceItemDetail);//余额详情列表
			    			//计算账本列表中的【本金】余额
			    			for(int n=0;n<balanceItemDetail.size();n++){
			    				Map<String, Object> balanceItem = balanceItemDetail.get(n);
			    				if(MapUtils.getString(balanceItem, "balanceItemTypeDetail", "").equals("本金")){
			    					int balanceAmount = MapUtils.getIntValue(balanceItem, "balanceAmount", 0);
			    					paymentLimit += balanceAmount;
			    				}
			    			}
		    			}
		    			model.addAttribute("feeAmount", paymentLimit);//将作为余额支取入参的【本金】余额
		    			
		    			session.setAttribute("validNumber", params.get("phoneNumber"));//后台保存合法的余额提取号码
		    			session.setAttribute("paymentLimit", paymentLimit);//后台保存可提取的【本金】余额		    			
					}
					else{
						model.addAttribute("totalBalance", "none");
					}
					String MID = MapUtils.getString(resultMap, "MID", "");
					if(MID.contains("#")){
						MID = MID.split("#")[0];
						model.addAttribute("MID", MID);
					}
					model.addAttribute("pageType", params.get("pageType"));//页面类型：查询/支取
					model.addAttribute("flag", 0);
				}
				else{
					model.addAttribute("flag", 1);
					if(resultMap.get("message")!=null){
						model.addAttribute("errorMsg", resultMap.get("message"));
					}
				}
			}
			else{
				model.addAttribute("flag", 1);
				if(returnMap.get("message")!=null){
					model.addAttribute("errorMsg", returnMap.get("message"));
				}
			}
		} catch (BusinessException be) {
        	return super.failedStr(model, be);
        } catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_BALANCE, e, params);
		}
		return "/bill/balance-detail";
	}
	
	/**
	 * 转至PUK码查询页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/queryPUK-main", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String queryPKU(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId=sessionStaff.getCurrentAreaId();
		String areaCode=sessionStaff.getCurrentAreaCode();
		String areaName=CommonMethods.getDefaultAreaName(sessionStaff);
		model.addAttribute("defaultAreaName",areaName);
		model.addAttribute("defaultAreaId",areaId);
		model.addAttribute("defaultAreaCode",areaCode);
		return "/bill/puk-main";
    }
	
	/**
	 * PUK码查询
	 * @param params
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/queryPUK", method = RequestMethod.POST)
    @ResponseBody
     public JsonResponse mktResInfoByAccessNum(@RequestBody Map<String, Object> params, String flowNum, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> pMap = new HashMap<String, Object>();
		pMap.put("tableName", "SYSTEM");
		pMap.put("columnName", "PUK_COLUMN");
		
    	JsonResponse jr = new JsonResponse();
    	try{
    		//从配置表中读取配置的puk码编号。
    		Map<String, Object> cfgMap = orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff);
    		Object o = MapUtils.getObject(cfgMap, "result");
    		if (o instanceof List){
    			List lt = (List)o;
    			List<Integer> attrIds=new ArrayList<Integer>();
    			for (int i = 0; i<lt.size(); i++){
    				Map mp = (Map)lt.get(i);
    				Object oo = MapUtils.getObject(mp, "PUK_COLUMN");
    				List ltt = (List)oo;
    				for (int j = 0; j<ltt.size(); j++){
    					Map mpp = (Map)ltt.get(j);
    					attrIds.add(MapUtils.getIntValue(mpp, "COLUMN_VALUE"));
    				}
    				params.put("attrIds", attrIds.toArray());
    			}
    		}
    		Map<String, Object> resultMap = billBmo.queryMktResInfoByAccessNum(params, flowNum, sessionStaff);
    		List uimList=(List) resultMap.get("result");
    		if(resultMap!=null){
    			if(ResultCode.R_SUCC.equals(resultMap.get("resultCode"))){
    				if(uimList!=null&&uimList.size()>0){
    					jr = super.successed(uimList.get(0),ResultConstant.SUCCESS.getCode());
    				}else{
    					jr = super.failed("没有查到PUK码信息！",ResultConstant.FAILD.getCode());
    				}
            	}else{
            		jr = super.failed("PKU码查询失败！",ResultConstant.FAILD.getCode());
            	}
    		}
    		else{
    			jr = failed("PKU码查询失败", 1);
    		}
    	} catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, params, ErrorCode.QUERY_MATRESINFO);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_MATRESINFO, e, params);
		}
   		return jr;
    }

	/**
	 * 通用产品查询
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @param httpSession
	 * @return
	 */
	@RequestMapping(value = "/foregiftlist", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
    public String queryCustInfo(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response,HttpSession httpSession) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String type = param.get("type").toString();
		Map resultMap =new HashMap();
		param.put("areaId", sessionStaff.getCurrentAreaId());
		List<Map<String, Object>> list = null;
		if("cust".equals(type)){
			param.put("staffId", sessionStaff.getStaffId());
			try {
				resultMap = custBmo.queryCustInfo(param,flowNum, sessionStaff);
				if (MapUtils.isNotEmpty(resultMap)) {
					model.addAttribute("cust", resultMap);
					model.addAttribute("type", "cust");
				}
			} catch (BusinessException be) {
				this.log.error("客户查询失败", be);
				return super.failedStr(model, be);
			} catch (InterfaceException ie) {
				return super.failedStr(model, ie, param, ErrorCode.QUERY_CUST);
			} catch (Exception e) {
				return super.failedStr(model, ErrorCode.QUERY_CUST, e, param);
			}
		}
		if("prod".equals(type)){
			try {
				Map<String, Object> datamap = this.custBmo.queryCommProduct(param,flowNum, sessionStaff);
				String code = (String) datamap.get("code");
				if (ResultCode.R_SUCCESS.equals(code)) {
					Map<String, Object> temMap=(Map) datamap.get("result");
					list = (List<Map<String, Object>>) temMap.get("commonProdList");
					model.addAttribute("prodinstlist", list);
					model.addAttribute("type","prod");
				}
			} catch (BusinessException be) {
				this.log.error("查询号码信息失败", be);
				return super.failedStr(model, be);
			} catch (InterfaceException ie) {
				return super.failedStr(model, ie, param, ErrorCode.QUERY_COMMPRODUCT);
			} catch (Exception e) {
				return super.failedStr(model, ErrorCode.QUERY_COMMPRODUCT, e, param);
			}
		}
		return "/bill/foregift_custlist";
	}
	
	/**
	 * 历史押金查询
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @param httpSession
	 * @return
	 */
	@RequestMapping(value = "/queryForegiftHistoryDetail", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
    public String queryForegiftHistoryDetail(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response,HttpSession httpSession) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map resultMap =new HashMap();
		param.put("areaId", sessionStaff.getCurrentAreaId());
		try {
			resultMap = billBmo.queryForegiftHistoryDetail(param,flowNum, sessionStaff);
			if(ResultCode.R_SUCCESS.equals(resultMap.get("code"))){
        		model.addAttribute("resultlst",resultMap.get("result"));
        	}
			return "/bill/foregift_historylist";
		} catch (BusinessException be) {
			this.log.error("历史押金列表查询失败", be);
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.QUERY_FOREGIFTOPERHISTORY);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_FOREGIFTOPERHISTORY, e, param);
		}
		
	}
	
	/**
	 * 押金查询
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @param httpSession
	 * @return
	 */
	@RequestMapping(value = "/queryForegift", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
    public String queryForegift(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response,HttpSession httpSession) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map resultMap =new HashMap();
		param.put("areaId", sessionStaff.getCurrentAreaId());
		try {
			resultMap = billBmo.queryForegift(param,flowNum, sessionStaff);
			if(ResultCode.R_SUCCESS.equals(resultMap.get("code"))){
        		model.addAttribute("resultlst",resultMap.get("result"));
        	}
			return "/bill/foregift_list";
		} catch (BusinessException be) {
			this.log.error("押金列表查询失败", be);
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.QUERY_FOREGIFTITEMS);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_FOREGIFTITEMS, e, param);
		}
		
	}
	
	/**
     * 退押金
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/returnForegift", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse returnForegift(@RequestBody Map<String, Object> param, String flowNum, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
    	JsonResponse jr = new JsonResponse();
    	param.put("areaId", sessionStaff.getCurrentAreaId());
		param.put("staffId", sessionStaff.getStaffId());
		param.put("channelId", sessionStaff.getCurrentChannelId());
    	try{
    		Map<String, Object> resultMap = billBmo.updateBamObjForegiftForReturn(param, flowNum, sessionStaff);
    		if(resultMap!=null){
    			if(ResultCode.R_SUCCESS.equals(resultMap.get("code"))){
    				jr = super.successed(resultMap.get("msg"),ResultConstant.SUCCESS.getCode());
            	}else{
            		jr = super.failed(resultMap.get("msg"),ResultConstant.FAILD.getCode());
            	}
    		}
    		else{
    			jr = failed("获取退押金信息失败", 1);
    		}
    		return jr;
   		}catch (BusinessException be) {
   			this.log.error("获取退押金信息失败", be);
   			return super.failed(be);
   		} catch (InterfaceException ie) {
   			return super.failed(ie, param, ErrorCode.BILL_RETUENFOREGIFT);
		} catch (Exception e) {
			log.error("门户/bill/returnForegift方法异常", e);
			return super.failed(ErrorCode.BILL_RETUENFOREGIFT, e, param);
		}
    }
    
    /**
     * 收取押金
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/saveForegift", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse saveForegift(@RequestBody Map<String, Object> params, String flowNum, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	//Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	
    	params.put("areaId", sessionStaff.getCurrentAreaId());
    	params.put("channelId", sessionStaff.getCurrentChannelId());
    	params.put("staffId", sessionStaff.getStaffId());
    	JsonResponse jr = new JsonResponse();
    	try{
    		Map<String, Object> resultMap = billBmo.saveBamObjForegift(params, flowNum, sessionStaff);
    		if(resultMap!=null){
    			if(ResultCode.R_SUCC.equals(resultMap.get("code"))){
    				jr = super.successed(resultMap);
            	}else{
            		jr = super.failed(resultMap,ResultConstant.FAILD.getCode());
            	}
    			
    		}
    		else{
    			jr = failed("收取押金失败", 1);
    		}
    		return jr;
   		}catch (BusinessException be) {
   			this.log.error("收取押金失败", be);
   			return super.failed(be);
   		} catch (InterfaceException ie) {
   			return super.failed(ie, params, ErrorCode.BILL_SAVEFOREGIFT);
		} catch (Exception e) {
			log.error("门户/bill/saveForegift方法异常", e);
			return super.failed(ErrorCode.BILL_SAVEFOREGIFT, e, params);
		}
   		
    }
    
	/**
	 * 转至账单查询页面
	 */
	@RequestMapping(value = "/preQueryBill", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String preQueryBill(HttpSession session, Model model){
		
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		for(int n=0;n<6;n++){
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
			calendar.add(Calendar.MONTH, -1);
		}
		model.addAttribute("billingDates", billingDates);
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/preQueryBill"));		
		return "/bill/bill-query";
	}
	
	/*
	 * 将低级账目项装入所属高级账目项的子项目列
	 */
	private ArrayList<Map<String, Object>> putChildIntoParent(ArrayList<Map<String, Object>> parentList, ArrayList<Map<String, Object>> childList)throws Exception{
		
		try{
			for(int i=0;i<parentList.size();i++){				
				Map<String, Object> parent = parentList.get(i);									
				ArrayList<Map<String, Object>> childChargeItems = new ArrayList<Map<String, Object>>();					
				for(int j=0;j<childList.size();j++){						
					Map<String, Object> child = childList.get(j);													
					if(child.get("parentClassId").equals(parent.get("classId"))){								
						childChargeItems.add(child);							
					}											
				}					
				parent.put("childChargeItems", childChargeItems);					
				parentList.set(i, parent);							
			}			
			return parentList;
		}catch(Exception e){
			log.error("门户系统bill/putChildIntoParent方法异常", e);
			Map<String, Object> dataBusMap = null;
			Map<String, Object> param = new HashMap<String, Object>();
			param.put("parentList", parentList);
			param.put("childList", childList);
			throw new BusinessException(ErrorCode.QUERY_BILL, dataBusMap, param, e);
		}
	}
	/**
	 * 帐单查询
	 * @param param
	 * @param flowNum
	 * @param model
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryBill", method = RequestMethod.GET)
	public String queryBill(@RequestParam Map<String, Object> param, @LogOperatorAnn String flowNum, Model model)throws BusinessException{
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> empty = new HashMap<String, Object>();
		String serviceName = "服务层接口服务 com.linkage.portal.service.lte.core.charge.QueryCustomizeBill 回参缺少";
		
		try{
			Map<String, Object> resultMap = new HashMap<String, Object>();
			param.put("areaId", sessionStaff.getCurrentAreaId());
			String NEW_INTERFACE_QUERYBILL  = MySimulateData.getInstance().getParam(SysConstant.NEW_INTERFACE_QUERYBILL);
			String serviceSerial ="100000"  + UIDGenerator.getRand();
			if("ON".equals(NEW_INTERFACE_QUERYBILL)){
				param.put("accessIp", "");
				param.put("staffID", sessionStaff.getStaffId());
				param.put("branchCode", sessionStaff.getChannelId());
				param.put("mvnoId", sessionStaff.getPartnerId());
				param.put("serviceSerial", serviceSerial);
				param.put("accessChannel", "040632");
				resultMap = billBmo.queryBillNew(param, flowNum, sessionStaff);
			}else{
				resultMap = billBmo.queryBill(param, flowNum, sessionStaff);
			}			
			if(MapUtils.getString(resultMap, "code", "").equals("POR-0000")){
				String MID = MapUtils.getString(resultMap, "MID", "");
				if(MID.contains("#")){
					MID = MID.split("#")[0];
					model.addAttribute("MID", MID);
				}
				if(!MapUtils.getMap(resultMap, "billInformation", empty).isEmpty()){
					Map<String, Object> billInformation = (Map<String, Object>)resultMap.get("billInformation");
					if(billInformation.get("itemInformation")!=null){
						ArrayList<Map<String, Object>> itemInformation = (ArrayList<Map<String, Object>>)billInformation.get("itemInformation");
						ArrayList<Map<String, Object>> itemLv1 = new ArrayList<Map<String, Object>>();
						ArrayList<Map<String, Object>> itemLv2 = new ArrayList<Map<String, Object>>();
						ArrayList<Map<String, Object>> itemLv3 = new ArrayList<Map<String, Object>>();
						ArrayList<Map<String, Object>> itemLv4 = new ArrayList<Map<String, Object>>();
						//将4个层级的账目项分别组装
						for(int n=0;n<itemInformation.size();n++){
							Map<String, Object> item = itemInformation.get(n);
							String showLevel = MapUtils.getString(item, "showLevel", "");
							if(showLevel.equals("1")){
								itemLv1.add(item);
							}
							else if(showLevel.equals("2")){
								itemLv2.add(item);
							}
							else if(showLevel.equals("3")){
								itemLv3.add(item);
							}
							else if(showLevel.equals("4")){
								itemLv4.add(item);
							}
							else{
								itemLv1.add(item);
							}
						}
						//将4个层级的账目项按逐层归属重装成一个树状层级结构的账目项列
						ArrayList<Map<String, Object>> newLv3 = this.putChildIntoParent(itemLv3, itemLv4);
						ArrayList<Map<String, Object>> newLv2 = this.putChildIntoParent(itemLv2, newLv3);
						ArrayList<Map<String, Object>> newLv1 = this.putChildIntoParent(itemLv1, newLv2);
						//将子账目项（被标记为Lv2到Lv4的账目项)汇总并重新分析，捕捉没有被放进树状层级结构的，将他们视为Lv1的账目项直接放入树状层级结构
						ArrayList<Map<String, Object>> childItems = itemLv2;
						childItems.addAll(itemLv3);
						childItems.addAll(itemLv4);
						for(int i=0;i<childItems.size();i++){
							boolean orphan = true;
							Map<String, Object> childItem = childItems.get(i);
							String parentId_real = MapUtils.getString(childItem, "parentClassId", "-1");//当前子账目项的父项ID
							for(int j=0;j<itemInformation.size();j++){
								Map<String, Object> parentItem_test = itemInformation.get(j);
								String parentId_test = MapUtils.getString(parentItem_test, "classId", "-2");//当前被检测的账目项ID
								if(parentId_test.equals(parentId_real)){
									orphan = false;//检测到有账目项是当前子账目项的父项，不做处理，停止遍历
									break;
								}
							}
							if(orphan){
								newLv1.add(childItem);
							}
						}
						model.addAttribute("chargeItems", newLv1);
						model.addAttribute("acctName", billInformation.get("acctName"));
						model.addAttribute("sumCharge", MapUtils.getString(billInformation, "sumCharge", "0"));
						String billingCycle = "";
						String year = param.get("billingCycle").toString().substring(0, 4);
						String month = param.get("billingCycle").toString().substring(4);
						if(month.equals("04")||month.equals("06")||month.equals("09")||month.equals("11")){
							billingCycle = year+"/"+month+"/01-"+year+"/"+month+"/30";
						}
						else if(month.equals("02")){	
							GregorianCalendar gregorianCalendar = new GregorianCalendar();
							if(gregorianCalendar.isLeapYear(Integer.parseInt(year))){
								billingCycle = year+"/"+month+"/01-"+year+"/"+month+"/29";
							}
							else{
								billingCycle = year+"/"+month+"/01-"+year+"/"+month+"/28";
							}
						}
						else{
							billingCycle = year+"/"+month+"/01-"+year+"/"+month+"/31";
						}
						model.addAttribute("billingCycle", billingCycle);
						Calendar calendar = Calendar.getInstance();
						SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");	
						String queryTime = sdf.format(calendar.getTime());
						model.addAttribute("queryTime", queryTime);
						model.addAttribute("flag", 0);
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("errorMsg", "无账单信息，本次查询MID："+MID);
					}
				}
				else{
					model.addAttribute("flag", 1);
					model.addAttribute("errorMsg", "无账单信息，本次查询MID："+MID);
				}
			}
			else{
				model.addAttribute("flag", 1);
				if(resultMap.get("message")!=null){
					model.addAttribute("errorMsg", resultMap.get("message"));
				}
			}
		}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(Exception e){
			return super.failedStr(model, ErrorCode.QUERY_BILL, e, param);
		}
		return "bill/bill-list";
	}

	/**
	 * 转至充值页面
	 */
	@RequestMapping(value = "/charge/cashPrepare", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String cashChargePrepare(HttpSession session, Model model){		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		model.addAttribute("defaultAccNbr", "");
		model.addAttribute("defaultAreaName", CommonMethods.getDefaultAreaName(sessionStaff));
		model.addAttribute("defaultAreaCode", sessionStaff.getAreaCode());
		model.addAttribute("defaultAreaId", sessionStaff.getAreaId());
		model.addAttribute("reqSerial", "");
		model.addAttribute("doCashTypeCd","0");
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/charge/cashPrepare"));
		return "/bill/cash-charge-prepare";
	}
	/**
	 * 余额查询转至充值缴费
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @param session
	 * @return
	 */
	@RequestMapping(value = "/charge/cashDeal", method = RequestMethod.GET)
	public String cashDeal(@RequestParam Map<String, String> param, Model model,
 			@LogOperatorAnn String flowNum,HttpServletResponse response,HttpSession session){
		
		if(EhcacheUtil.pathIsInSession(session,"bill/charge/cashPrepare")){
			model.addAttribute("defaultAccNbr", param.get("accNbr"));
			model.addAttribute("defaultAreaName", param.get("areaName"));
			model.addAttribute("defaultAreaCode", param.get("areaCode"));
			model.addAttribute("defaultAreaId", param.get("areaId"));
			model.addAttribute("reqSerial", "");
			model.addAttribute("doCashTypeCd", "0");
			model.addAttribute("forbid", "0");
		}else{
			model.addAttribute("forbid", "1");
		}
		return "/bill/cash-charge-content";
	}
	
	/**
	 * 转至充值记录查询页面 - CRM充值冲正入口
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/charge/queryCashCorrect", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String cashPositivePrepare(HttpServletRequest request, HttpSession session, Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		String thisCycle = sdfHide.format(calendar.getTime());
		for(int n=0;n<5;n++){
			calendar.add(Calendar.MONTH, -1);
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
		}
		model.addAttribute("thisCycle", thisCycle);
		model.addAttribute("billingDates", billingDates);
		model.addAttribute("defaultAreaName", CommonMethods.getDefaultAreaName(sessionStaff));
		model.addAttribute("defaultAreaCode", sessionStaff.getAreaCode());
		model.addAttribute("defaultAreaId", sessionStaff.getAreaId());
		
		model.addAttribute("pageType", "cashCorrect");//CRM充值冲正入口标识
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/charge/queryCashCorrect"));
		return "/bill/cash-correct-prepare";
	}
	
	/**
	 * 充值记录查询
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @param httpSession
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/charge/correctList", method = RequestMethod.GET)
	public String correctList(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response,HttpSession httpSession){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> empty = new HashMap<String, Object>();
		String serviceName = "服务层接口服务 com.linkage.portal.service.lte.core.charge.QueryPayment 回参缺少";
		
		try{
			DataBus db = billBmo.queryPayNotes(param, flowNum, sessionStaff);
			if(ResultCode.R_SUCCESS.equals(db.getResultCode())){
				Map<String, Object> returnMap = db.getReturnlmap();
				if(ResultCode.R_SUCCESS.equals(returnMap.get("code"))){
					String MID = MapUtils.getString(returnMap, "MID", "");
					if(MID.contains("#")){
						MID = MID.split("#")[0];
						model.addAttribute("MID", MID);
					}
					if(!MapUtils.getMap(returnMap, "recordInfo", empty).isEmpty()){
						Map<String, Object> recordInfo = (Map<String, Object>) returnMap.get("recordInfo");
						if(recordInfo.get("paymentRecordInfo")!=null){
							model.addAttribute("flag", 0);
							model.addAttribute("resultlst", recordInfo.get("paymentRecordInfo"));
							model.addAttribute("param", param);
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("errorMsg", serviceName + "【paymentRecordInfo】节点，请与计费系统确认！");
						}
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("errorMsg", "该号码无充值记录");
					}
				}
				else{
					model.addAttribute("flag", 1);
					model.addAttribute("errorMsg", returnMap.get("message"));
				}
			}
			else{
				model.addAttribute("flag", 1);
				model.addAttribute("errorMsg", db.getResultMsg());
			}
		}catch (BusinessException e) {
  			this.log.error("获取充值缴费记录失败", e);
  		}
  		return "/bill/cash-correct-list";
	}
	
	/**
	 * 转至充值冲正确认页面
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/charge/doCashContent", method = RequestMethod.GET)
	public String cashPositive(@RequestParam Map<String, String> param, Model model,
 			@LogOperatorAnn String flowNum,HttpServletResponse response){
			
		model.addAttribute("defaultAccNbr", param.get("phoneNumber"));
		model.addAttribute("defaultAreaCode", param.get("areaCode"));
		model.addAttribute("defaultAreaId", param.get("areaId"));
		model.addAttribute("reqSerial", param.get("reqSerial"));
		model.addAttribute("amount", param.get("amount"));
		model.addAttribute("doCashTypeCd","1");
		
		return "/bill/cash-charge-content";
	}
	
	/**
	 * 转至现金充值确认页面（充值鉴权）
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/charge/cashConfirm", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse cashConfirm(@RequestBody Map<String, Object> params, @LogOperatorAnn String flowNum, HttpSession session, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);

//		Map<String, Object> empty = new HashMap<String, Object>();
//		String serviceName = "服务层接口服务 com.linkage.portal.service.lte.core.charge.GetBalance 回参缺少";
		
		try{
			Map<String, Object> chargeAuthParams = new HashMap<String, Object>();
			chargeAuthParams.put("phoneNumber", params.get("phoneNumber"));
			chargeAuthParams.put("destinationAttr", params.get("destinationAttr"));
			chargeAuthParams.put("queryFlag", params.get("queryFlag"));
			chargeAuthParams.put("queryItemType", params.get("queryItemType"));
			chargeAuthParams.put("chargeAuth", "0");//充值鉴权标识
			
			Map<String, Object> authResult = billBmo.getBalance(chargeAuthParams, flowNum, sessionStaff);
			
			if(ResultCode.R_SUCCESS.equals(MapUtils.getString(authResult, "code", ""))){
				Map<String, Object> authReturn = (Map<String, Object>) authResult.get("resultMap");
				if(ResultCode.R_SUCCESS.equals(authReturn.get("code"))){
					//鉴权通过，为此次充值发放令牌
					session.setAttribute("doCash", "valid");
					return successed("canDoCash");
				}
				else{
					return failed(MapUtils.getString(authReturn, "message", "未返回错误原因"), 1);
				}
			}
			else{
				return failed(MapUtils.getString(authResult, "message", "未返回错误原因"), 1);
			}
		}catch (BusinessException e) {
			return failed("充值鉴权失败", 1);
   		}catch(Exception e){
   			return failed(ErrorCode.QUERY_BALANCE, e, params);
		}		
	}
	
	/**
	 * 现金充值/充值冲正
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/charge/doCash", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse doCash(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpSession session, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

		//充值的异步请求排队检查充值令牌，无令牌则为非法操作，予以提示并停止充值业务
		if (MapUtils.getString(param, "doCashTypeCd", "").equals("0")) {
			Object token = null;
			synchronized (pLock) {
				token = session.getAttribute("doCash");
				session.removeAttribute("doCash");//移除令牌
				if (!"valid".equals(token)) {
					return failed("非法操作：会话失效，非法跳过鉴权或者表单重复提交！", 1);
				}
			}
		}
		JsonResponse jr = null;
		try{
			param.put("areaId", sessionStaff.getAreaId());
			BigDecimal feeAmount = new BigDecimal(MapUtils.getFloatValue(param, "feeAmount", 0)*100);
			feeAmount = feeAmount.setScale(0, BigDecimal.ROUND_HALF_UP);
			param.put("feeAmount", feeAmount);
			Map<String,Object> resultMap = billBmo.doCash(param, flowNum, sessionStaff);
			if(resultMap!=null){
				if(ResultCode.R_SUCCESS.equals(resultMap.get("code"))){
    				jr = successed(resultMap.get("reqSerial"),ResultConstant.SUCCESS.getCode());
            	}else{
            		jr = failed(resultMap.get("msg"),ResultConstant.FAILD.getCode());
            	}
			}
		}catch (BusinessException e) {
			jr = failed("充值服务回参异常", 1);
   		}catch(Exception e){
   			return failed(ErrorCode.CASH_RECHARGE, e, param);
		}					
		return jr;
	}
	
	/**
	 * 充值请求成功发送后进行的回调查询
	 * @param params
	 * @param flowNum
	 * @param session
	 * @param response
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/charge/queryCallBack", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryChargeCallBack(@RequestBody Map<String, Object> params, @LogOperatorAnn String flowNum, HttpSession session, HttpServletResponse response)throws Exception{
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jr = failed("calledBack", 1);
		try{
			DataBus db = billBmo.queryPayNotes(params, flowNum, sessionStaff);
			if(ResultCode.R_SUCCESS.equals(db.getResultCode())){
				Map<String, Object> returnMap = db.getReturnlmap();
				if(ResultCode.R_SUCCESS.equals(returnMap.get("code"))){
					if(!MapUtils.getMap(returnMap, "recordInfo", new HashMap<String, Object>()).isEmpty()){
						Map<String, Object> recordInfo = (Map<String, Object>) returnMap.get("recordInfo");
						ArrayList<Map<String, Object>> paymentRecordInfo = (ArrayList<Map<String, Object>>) recordInfo.get("paymentRecordInfo");
						Map<String, Object> calledBackRecord = paymentRecordInfo.get(0);
						if(calledBackRecord.get("reqSerial").equals(params.get("reqSerial"))){
							jr =  successed("calledBack");
						}
					}
				}
			}
		}catch(Exception e){
			return failed("calledBack", 1);
		}
		return jr;
	}
	
	/**
	 * 现金充值转至充值收据打印
	 * @param params
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/charge/goToPrintReceipt", method = RequestMethod.GET)
	public String goToPrintChargeInvoice(Model model){
		
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		String thisCycle = sdfHide.format(calendar.getTime());
		for(int n=0;n<5;n++){
			calendar.add(Calendar.MONTH, -1);
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
		}
		model.addAttribute("thisCycle", thisCycle);
		model.addAttribute("billingDates", billingDates);
		
		return "/bill/cash-charge-receipt";
	}
	
	/**
	 * 充值收据/发票打印
	 * @param request
	 * @param session
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/prePrintChargeReceipt", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String prePrintChargeReceipt(HttpServletRequest request, HttpSession session, Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		String thisCycle = sdfHide.format(calendar.getTime());
		for(int n=0;n<5;n++){
			calendar.add(Calendar.MONTH, -1);
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
		}
		model.addAttribute("thisCycle", thisCycle);
		model.addAttribute("billingDates", billingDates);
		model.addAttribute("defaultAreaName", CommonMethods.getDefaultAreaName(sessionStaff));
		model.addAttribute("defaultAreaCode", sessionStaff.getAreaCode());
		model.addAttribute("defaultAreaId", sessionStaff.getAreaId());
		
		model.addAttribute("pageType", "chargeReceipt");//充值收据打印入口标识
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/preQueryChargeHistory"));
		return "/bill/cash-correct-prepare";
	}
	
	/**
	 * 充值收据打印前查询付款人和收款人信息
	 * @param params
	 * @param flowNum
	 * @param session
	 * @param response
	 * @return 客户名称 员工名称 员工工号
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryCustAndStaff", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryCustAndStaff(@RequestBody Map<String, Object> params, @LogOperatorAnn String flowNum, HttpSession session, HttpServletResponse response)throws BusinessException{
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		params.put("staffId", sessionStaff.getStaffId());
		try{
			Map<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("staffName", sessionStaff.getStaffName());
			resultMap.put("staffCode", sessionStaff.getStaffCode());
			resultMap.put("partyName", "");
			Map<String, Object> result = custBmo.queryCustInfo(params, flowNum, sessionStaff);
			if(result != null){
				if(result.get("custInfos")!=null){
					ArrayList<Map<String, Object>> custInfos = (ArrayList<Map<String, Object>>) result.get("custInfos");
					if(custInfos.size()>0){
						Map<String, Object> custInfo = custInfos.get(0);							
						resultMap.put("partyName", MapUtils.getString(custInfo, "partyName", ""));
					}
				}
			}
			return successed(resultMap, 0);
		}catch(BusinessException be){
 			return super.failed(be);
   		}catch(Exception e){
   			return super.failed(ErrorCode.QUERY_CUST, e, params);
		}
	}
	
	/**
	 * 转至充值历史查询页面 - SGW全量查询入口
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/preQueryChargeHistory", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String preQueryChargeHistory(HttpServletRequest request, HttpSession session, Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		String thisCycle = sdfHide.format(calendar.getTime());
		for(int n=0;n<5;n++){
			calendar.add(Calendar.MONTH, -1);
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
		}
		model.addAttribute("thisCycle", thisCycle);
		model.addAttribute("billingDates", billingDates);
		model.addAttribute("defaultAreaName", CommonMethods.getDefaultAreaName(sessionStaff));
		model.addAttribute("defaultAreaCode", sessionStaff.getAreaCode());
		model.addAttribute("defaultAreaId", sessionStaff.getAreaId());
		
		model.addAttribute("pageType", "SGW");//SGW全量查询入口标识
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/preQueryChargeHistory"));
		return "/bill/cash-correct-prepare";
	}
	
	/**
	 * 转至充值订单查询 - 充值平台记录
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/preChargeRecord", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String preChargeRecord(HttpServletRequest request, Model model){
		
		String defaultAcctNum = request.getParameter("phoneNumber");//由充值页面跳转带过来的接入号
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String endTime = f.format(c.getTime());
		c.add(Calendar.DATE, -7);
		String startTime = f.format(c.getTime());
		
		model.addAttribute("defaultAcctNum", defaultAcctNum);
		model.addAttribute("startDt", startTime);
		model.addAttribute("endDt", endTime);

		return "/bill/charge-record-prepare";
	}
	
	/**
	 * 充值订单查询（查询充值平台记录）
	 * @param param
	 * @param request
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/chargeRecord", method = RequestMethod.GET)
    public String chargeRecord(@RequestParam Map<String, Object> param, HttpServletRequest request, Model model) throws BusinessException{
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        
		
		nowPage = MapUtils.getInteger(param, "nowPage", 1);
		pageSize = MapUtils.getInteger(param, "pageSize", 10);
		
		Map<String, Object> map = billBmo.chargeRecord(param, null, sessionStaff);
    	if(map != null && map.containsKey("paymentRecQueryRsp")){
    		list =(List<Map<String, Object>>)map.get("paymentRecQueryRsp");
    		if (list != null && list.size() > (nowPage - 1) * pageSize) {
    			totalSize = list == null ? 0 : list.size();
    			int fromIndex = (nowPage - 1) * pageSize;
    			int toIndex = nowPage * pageSize > totalSize ? totalSize : nowPage * pageSize;
    			list = list.subList(fromIndex, toIndex);
    			
    			for (int i = 0; list != null && i < list.size(); i++) {
        			Map<String, Object> tmpMap = list.get(i);
        			List<Map<String, Object>> paymentRecordInfoList = (List<Map<String, Object>>) tmpMap.get("paymentRecordInfo");
        			for (int j = 0; paymentRecordInfoList != null && j < paymentRecordInfoList.size(); j++) {
        				Map<String, Object> paymentRecordInfo = paymentRecordInfoList.get(j);
        				String paidTime = MapUtils.getString(paymentRecordInfo, "paidTime", "");
        				if (paidTime.length() == 14) {
        					StringBuilder sb = new StringBuilder(paidTime);
        					sb.insert(12, ":");
        					sb.insert(10, ":");
        					sb.insert(8, " ");
        					sb.insert(6, "-");
        					sb.insert(4, "-");
        					paidTime = sb.toString();
        				}
        				paymentRecordInfo.put("paidTime", paidTime);
        				
        				paymentRecordInfoList.set(j, paymentRecordInfo);
        			}
        			tmpMap.put("paymentRecordInfo", paymentRecordInfoList);
        			list.set(i, tmpMap);
        		}
    		} else {
    			list = null;
    			totalSize = 1;
    		}
    		
     	}
    	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
        		nowPage,
        		pageSize,
        		totalSize<1?1:totalSize,
				list);
		model.addAttribute("pageModel", pm);
		model.addAttribute("code", map.get("resultCode"));
		model.addAttribute("mess", map.get("message"));
			
        return "/bill/charge-record";
    }
	
	//转至充值记录查询页面（未明确）
	@RequestMapping(value = "/paynotestmain", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String payNotesMain(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		for(int n=0;n<6;n++){
			calendar.add(Calendar.MONTH, -1);
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
		}
		model.addAttribute("billingDates", billingDates);
		return "/bill/paynotes-main";
    }
	//充值记录查询（未明确）
	@RequestMapping(value = "/paynoteslist", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
     public String queryPayNotes(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
             HttpServletResponse response,HttpSession httpSession){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		param.put("areaId", sessionStaff.getCurrentAreaId());
    	try{
    		DataBus aDataBus=billBmo.queryPayNotes(param, flowNum, sessionStaff);
    		Map<String, Object> returnMap=aDataBus.getReturnlmap();
    		List<Map<String, Object>> list = null;
    		if(null!=returnMap&&ResultCode.R_SUCCESS.equals(returnMap.get("code"))){
    			Map<String, Object> recordInfoMap=(Map<String, Object>) returnMap.get("recordInfo");
				list = (List<Map<String, Object>>) recordInfoMap.get("paymentRecordInfo");
				model.addAttribute("resultlst", list);
        	}
   		}catch (BusinessException e) {
   			this.log.error("获取充值缴费记录失败", e);
   		}
   		return "/bill/paynotes_list";
    }
	/**
	 * 转至套餐余量查询页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/offerusagemain", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String offerUsageMain(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		for(int n=0;n<6;n++){
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
			calendar.add(Calendar.MONTH, -1);
		}
		model.addAttribute("billingDates", billingDates);
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/offerusagemain"));
		return "/bill/offerusage_main";
    }
	/**
	 * 查询套餐余量
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @param httpSession
	 * @return
	 */
	@RequestMapping(value = "/offerusagelist", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
     public String queryOfferUsage(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
             HttpServletResponse response,HttpSession httpSession){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId = sessionStaff.getCurrentAreaId();
		param.put("areaId", sessionStaff.getCurrentAreaId());
		Boolean isNew = false;
		try{
			String areaIds = getApConfigMap(model,flowNum,sessionStaff);
			DataBus aDataBus = new DataBus();
			if(StringUtils.isNotBlank(areaIds)){
				 String[] ids = areaIds.split(",");
				 for(int i=0;i<ids.length;i++){
					 if(ids[i].equals(areaId.substring(0, 3)+"0000")){
						// param.remove("billingCycle");
						// param.put("billingCycle", "201407");
						 aDataBus=billBmo.queryOfferUsageNew(param, flowNum, sessionStaff); 
						 isNew = true;
						 break;
					 }
//					 if(isNew){
//						 break;
//					 }
				 }
				 if(!isNew){
					 aDataBus=billBmo.queryOfferUsage(param, flowNum, sessionStaff);
				 }
			}
			else{
				aDataBus=billBmo.queryOfferUsage(param, flowNum, sessionStaff);
			}
    		Map<String, Object> returnMap=aDataBus.getReturnlmap();
    		String MID = MapUtils.getString(returnMap, "MID", "");
			if(MID.contains("#")){
				MID = MID.split("#")[0];
				model.addAttribute("MID", MID);
			}
    	//	if(null!=returnMap&&ResultCode.R_SUCCESS.equals(returnMap.get("code"))){
				model.addAttribute("resultMap", returnMap);
       // 	}else{
       // 	    model.addAttribute("message", returnMap.get("message"));
        //	}
   		}catch (BusinessException e) {
   		   return super. failedStr(model, e);
   		}
		if(isNew){
			return "/bill/offerusage_list_new";
		}
   		return "/bill/offerusage_list";
    }
    /**
     * 取得租金费用项
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
	private String getApConfigMap(Model model, String flowNum,
			SessionStaff sessionStaff) {
		String tableName = "SYSTEM";
		String columnItem = "OFFER_USAGE_AREAS";
		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
		try {
			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItem);
			if (obj != null && obj instanceof List) {
				rList = (List<Map<String, Object>>) obj;
			} else {
				Map<String, Object> pMap = new HashMap<String, Object>();
				pMap.put("tableName", tableName);
				pMap.put("columnName", columnItem);
				rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItem, rList);
			}
			ArrayList<Map<String, Object>> al = (ArrayList)rList.get(0).get("OFFER_USAGE_AREAS"); 
			return (String)al.get(0).get("COLUMN_VALUE");
		} catch (BusinessException e) {
		  this.log.error("查询配置信息服务出错", e);
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
		return null;
	}
	
	/**
	 * 转至详单查询页面
	 * @param session
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/preQueryBillDetail", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String preQueryBillDetail(HttpSession session, Model model){
		
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		String thisCycle = sdfHide.format(calendar.getTime());
		for(int n=0;n<5;n++){
			calendar.add(Calendar.MONTH, -1);
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
		}
		model.addAttribute("thisCycle", thisCycle);
		model.addAttribute("billingDates", billingDates);
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/preQueryBillDetail"));
		return "/bill/bill-query-detail";
	}
	
	/**
	 * 详单查询
	 * @param param
	 * @param flowNum
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryBillDetail", method = RequestMethod.GET)
	public String queryBillDetail(@RequestParam Map<String, Object> param, @LogOperatorAnn String flowNum, Model model)throws BusinessException{
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);	
		
		Map<String, Object> empty = new HashMap<String, Object>();
		String serviceName = "服务层接口服务 com.linkage.portal.service.lte.core.charge.QueryCustomizeBillDetailNew 回参缺少";
		
		try{
			Map<String, Object> resultMap = new HashMap<String, Object>();
			param.put("areaId", sessionStaff.getCurrentAreaId());
			String NEW_INTERFACE_QUERY  = MySimulateData.getInstance().getParam(SysConstant.NEW_INTERFACE_QUERY);
			String serviceSerial ="100000"  + UIDGenerator.getRand();
			if("ON".equals(NEW_INTERFACE_QUERY)){
				param.put("accessIp", "");
				param.put("staffID", sessionStaff.getStaffId());
				param.put("branchCode", sessionStaff.getChannelId());
				param.put("mvnoId", sessionStaff.getPartnerId());
				param.put("serviceSerial", serviceSerial);
				param.put("accessChannel", "040632");
				resultMap = billBmo.queryBillDetailNew(param, flowNum, sessionStaff);
			}else{
				resultMap = billBmo.queryBillDetail(param, flowNum, sessionStaff);
			}
		
			if(resultMap.get("code").equals("POR-0000")){
				String MID = MapUtils.getString(resultMap, "MID", "");
				if(MID.contains("#")){
					MID = MID.split("#")[0];
					model.addAttribute("MID", MID);
				}
				if(!MapUtils.getMap(resultMap, "billInfo", empty).isEmpty()){
					Map<String, Object> billInfo = (Map<String, Object>)resultMap.get("billInfo");
					ArrayList<Map<String, Object>> infoList = new ArrayList<Map<String, Object>>();
					//语音详单
					if(param.get("billTypeCd").equals("1")){
						if(billInfo.get("voiceInfo")!=null){
							infoList = (ArrayList<Map<String, Object>>)billInfo.get("voiceInfo");
							model.addAttribute("type", 1);
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("errorMsg", "无语音详单记录，本次查询MID："+MID);
							return "bill/bill-detail";
						}
					}
					//短信详单
					if(param.get("billTypeCd").equals("2")){
						if(billInfo.get("smsInfo")!=null){
							infoList = (ArrayList<Map<String, Object>>)billInfo.get("smsInfo");
							model.addAttribute("type", 2);
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("errorMsg", "无短信详单记录，本次查询MID："+MID);
							return "bill/bill-detail";
						}
					}
					//数据详单
					if(param.get("billTypeCd").equals("3")){
						if(billInfo.get("dataInfo")!=null){
							infoList = (ArrayList<Map<String, Object>>)billInfo.get("dataInfo");
							model.addAttribute("type", 3);
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("errorMsg", "无数据详单记录，本次查询MID："+MID);
							return "bill/bill-detail";
						}
					}
					//增值业务详单
					if(param.get("billTypeCd").equals("4")){
						if(billInfo.get("spInfo")!=null){
							infoList = (ArrayList<Map<String, Object>>)billInfo.get("spInfo");
							model.addAttribute("type", 4);
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("errorMsg", "无增值业务详单记录，本次查询MID："+MID);
							return "bill/bill-detail";
						}
					}
					int totalRecords;
					if(!MapUtils.getString(billInfo, "totalRecords", "").equals("")){
						totalRecords = MapUtils.getIntValue(billInfo, "totalRecords", 0);//当查询第一页时，更新计费返回的总条目数
					}else{
						totalRecords = MapUtils.getIntValue(param, "totalRecords", 0);//当计费未返回总条目数时使用原有的总条目数
					}
					int pageSize = MapUtils.getIntValue(param, "pageSize");
					int curPage = MapUtils.getIntValue(param, "curPage");
					PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(curPage, pageSize, totalRecords, infoList);
					model.addAttribute("totalRecords", totalRecords);
					model.addAttribute("pageModel", pm);
					model.addAttribute("sumCharge", billInfo.get("sumCharge"));
					String billingCycle = "";
					String year = param.get("billingCycle").toString().substring(0, 4);
					String month = param.get("billingCycle").toString().substring(4);
					Calendar calendar = Calendar.getInstance();
					SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
					if(param.get("billingCycle").equals(sdfHide.format(calendar.getTime()))){
						SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy/MM/dd");
						billingCycle = year+"/"+month+"/01-"+sdfShow.format(calendar.getTime());
					}
					else{
						if(month.equals("04")||month.equals("06")||month.equals("09")||month.equals("11")){
							billingCycle = year+"/"+month+"/01-"+year+"/"+month+"/30";
						}
						else if(month.equals("02")){
							GregorianCalendar gregorianCalendar = new GregorianCalendar();
							if(gregorianCalendar.isLeapYear(Integer.parseInt(year))){
								billingCycle = year+"/"+month+"/01-"+year+"/"+month+"/29";
							}
							else{
								billingCycle = year+"/"+month+"/01-"+year+"/"+month+"/28";
							}
						}
						else{
							billingCycle = year+"/"+month+"/01-"+year+"/"+month+"/31";
						}
					}
					model.addAttribute("billingCycle", billingCycle);
					
					model.addAttribute("flag", 0);
				}
				else{
					model.addAttribute("flag", 1);
					model.addAttribute("errorMsg", serviceName + "【billInfo】节点或该节点为空，本次查询MID："+MID);
				}
			}
			else{
				model.addAttribute("flag", 1);
				if(resultMap.get("message")!=null){
					model.addAttribute("errorMsg", resultMap.get("message"));
				}
			}
		}catch(BusinessException be){
			return super.failedStr(model, be);
   		}catch(Exception e){
   			return super.failedStr(model, ErrorCode.QUERY_BILL_DETAIL, e, param);
		}
		return "bill/bill-detail";
	}
	
	/*
	 * 转至余额支取页面
	 */
	@RequestMapping(value = "/prePayBalance", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String payBalance(HttpSession session, Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		model.addAttribute("pageType", "pay");//余额支取的页面标记
		model.addAttribute("defaultAreaName", CommonMethods.getDefaultAreaName(sessionStaff));
		model.addAttribute("defaultAreaCode", sessionStaff.getAreaCode());
		model.addAttribute("defaultAreaId", sessionStaff.getAreaId());
		
		//客户鉴权能否跳过权限查询				
		String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_JUMPAUTH+"_"+sessionStaff.getStaffId());				
		try{		 			
			if(iseditOperation==null){		 				
				iseditOperation=staffBmo.checkOperatSpec(SysConstant.JUMPAUTH_CODE,sessionStaff);		 				
				ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_JUMPAUTH+"_"+sessionStaff.getStaffId(), iseditOperation);
			}
		} catch (BusinessException e) {
			iseditOperation="1";
		} catch (InterfaceException ie) {
			iseditOperation="1";
		} catch (Exception e) {
			iseditOperation="1";
		}
		model.addAttribute("jumpAuthflag", iseditOperation);
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/prePayBalance"));
		return "bill/balance-main";
	}
	
	/**
	 * 余额支取
	 * @param params
	 * @param flowNum
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/payBalance", method = RequestMethod.POST)
    @ResponseBody
	public JsonResponse payBalance(@RequestBody Map<String, Object> params, String flowNum, HttpServletResponse response, HttpSession session)throws BusinessException{
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
    	//校验接入号的合法性
    	String validNumber = (String) session.getAttribute("validNumber");
    	if(!MapUtils.getString(params, "phoneNumber", "").equals(validNumber)){
    		return failed("非法操作：该号码为非法用户", 1);
    	}
    	//校验是否超过余额上限
    	Integer paymentLimit = (Integer) session.getAttribute("paymentLimit");
    	Integer feeAmount = Integer.parseInt(MapUtils.getString(params, "feeAmount", "-1"));
    	if(!feeAmount.equals(paymentLimit)){
    		return failed("非法操作：支取金额不符", 1);
    	}
    	Map<String, Object> empty = new HashMap<String, Object>();
    	params.put("areaId", sessionStaff.getAreaId());
    	params.put("staffCode", sessionStaff.getStaffCode());
    	try{
    		Map<String, Object> resultMap = billBmo.payBalance(params, flowNum, sessionStaff);
    		if(resultMap.get("resultCode").equals("0")){
    			if(!MapUtils.getMap(resultMap, "result", empty).isEmpty()){
    				Map<String, Object> balanceInfo = (Map<String, Object>) resultMap.get("result");
        			String sumCharge = MapUtils.getString(balanceInfo, "sumCharge", "0");
    				return successed(Integer.valueOf(sumCharge), 0);
    			}
    			else{
    				return failed("服务层接口服务 com.linkage.portal.service.lte.core.charge.PayBalance 回参缺少【balanceInfo】节点或该节点为空，请与计费系统确认！", 1);
    			}
    		}
    		else{
    			return failed(resultMap.get("result"), 1);
    		}
    	}catch(BusinessException be){
    		this.log.error("余额支取失败", be);
 			return super.failed(be);
   		}catch(Exception e){
   			return super.failed(ErrorCode.PAY_BALANCE, e, params);
		}
	}
	
	/**
	 * 调帐
	 * @param params
	 * @param flowNum
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/doAdjustAccount", method = RequestMethod.GET)
    @ResponseBody
	public JsonResponse doAdjustAccount(@RequestParam("strParam") String param,Model model)
			throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		ArrayList list = JsonUtil.toObject(param, ArrayList.class);
		Map<String, Object> empty = new HashMap<String, Object>();
		Map<String, Object> inMap = new HashMap<String, Object>();
		try {
			//if (paramList != null && paramList.size() > 0) {
				//inMap.put("adjustPaymentReqs", paramList);
				Map<String, Object> resultMap = billBmo.doAdjustAccount(list,null,sessionStaff);
				if (resultMap.get("resultCode").equals("0")) {
					if (!MapUtils.getMap(resultMap, "result", empty).isEmpty()) {
						return successed((Map<String, Object>) resultMap
								.get("result"));
					} else {
						return failed(
								"服务层接口服务 com.linkage.portal.service.lte.core.charge.doAdjustAccount 回参缺少节点或该节点为空，请与计费系统确认！",
								ResultConstant.FAILD.getCode());
					}
				} else {
					return failed(resultMap.get("result"), ResultConstant.FAILD.getCode());
				}
			//}
		} catch (BusinessException be) {
			this.log.error("调账失败", be);
			return super.failed(be);
		} catch (Exception e) {
			return super.failed(ErrorCode.DO_ADJUST_ACCOUNT, e, inMap);
		}
	}
	
	/**
	 * 滞纳金
	 * @param params
	 * @param flowNum
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/doDerateDue", method = RequestMethod.GET)
    @ResponseBody
	public JsonResponse doDerateDue(@RequestParam("strParam") String param,Model model)
			throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String str = "";
		try {
			str = URLDecoder.decode(param, "UTF-8");
		} catch (UnsupportedEncodingException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		Map<String, Object> paramMap =  JsonUtil.toObject(str, Map.class);
		Map<String, Object> empty = new HashMap<String, Object>();
		try {
			    Map<String, Object> resultMap = billBmo.doDerateDue(paramMap,null,sessionStaff);
				if (resultMap.get("resultCode").equals("0")) {
					if (!MapUtils.getMap(resultMap, "result", empty).isEmpty()) {
						return successed((Map<String, Object>) resultMap
								.get("result"));
					} else {
						return failed(
								"服务层接口服务 com.linkage.portal.service.lte.core.charge.doDerateDue 回参缺少节点或该节点为空，请与计费系统确认！",
								ResultConstant.FAILD.getCode());
					}
				} else {
					return failed(resultMap.get("result"), ResultConstant.FAILD.getCode());
				}
			//}
		} catch (BusinessException be) {
			this.log.error("滞纳金失败", be);
			return super.failed(be);
		} catch (Exception e) {
			return super.failed(ErrorCode.DO_DERATE_DUE_ACCOUNT, e, paramMap);
		}
	}
	
	
	/**
	 * 调帐
	 * @param params
	 * @param flowNum
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/doBadDebts", method = RequestMethod.GET)
    @ResponseBody
	public JsonResponse doBadDebts(@RequestParam("strParam") String param,Model model)
			throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		ArrayList list = JsonUtil.toObject(param, ArrayList.class);
		Map<String, Object> empty = new HashMap<String, Object>();
		Map<String, Object> inMap = new HashMap<String, Object>();
		try {
			//if (paramList != null && paramList.size() > 0) {
				//inMap.put("adjustPaymentReqs", paramList);
				Map<String, Object> resultMap = billBmo.doBadDebts(list,null,sessionStaff);
				if (resultMap.get("resultCode").equals("0")) {
					if (!MapUtils.getMap(resultMap, "result", empty).isEmpty()) {
						return successed((Map<String, Object>) resultMap
								.get("result"));
					} else {
						return failed(
								"服务层接口服务 com.linkage.portal.service.lte.core.charge.doBadDebts 回参缺少节点或该节点为空，请与计费系统确认！",
								ResultConstant.FAILD.getCode());
					}
				} else {
					return failed(resultMap.get("result"), ResultConstant.FAILD.getCode());
				}
			//}
		} catch (BusinessException be) {
			this.log.error("呆坏账失败", be);
			return super.failed(be);
		} catch (Exception e) {
			return super.failed(ErrorCode.DO_BAD_DEBTS, e, inMap);
		}
	}
	
		
	/**
	 * 转至客户化账单打印页面
	 */
	@RequestMapping(value = "/prePrintBill", method = RequestMethod.GET)
	public String prePrintBill(String billParam, HttpSession session, Model model){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);	
		
		Map<String, Object> paramMap = JsonUtil.toObject(billParam, Map.class);
		
		ArrayList<Map<String, Object>> billingDates = new ArrayList<Map<String, Object>>();
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdfShow = new SimpleDateFormat("yyyy年MM月");
		SimpleDateFormat sdfHide = new SimpleDateFormat("yyyyMM");
		String firstCycle = "";
		for(int n = 0; n < 6; n++){
			Map<String, Object> billingDate = new HashMap<String, Object>();
			String billingMonth = sdfShow.format(calendar.getTime());
			String billingCycle = sdfHide.format(calendar.getTime());
			billingDate.put("billingMonth", billingMonth);
			billingDate.put("billingCycle", billingCycle);
			billingDates.add(billingDate);
			if (n == 0) {
				firstCycle = billingCycle;
			}
			calendar.add(Calendar.MONTH, -1);
		}
		model.addAttribute("billingDates", billingDates);
		String prePhoneNumber = MapUtils.getString(paramMap, "prePhoneNumber", "");
		String billingCycleChked = MapUtils.getString(paramMap, "billingCycleChked", firstCycle);
		model.addAttribute("prePhoneNumber", prePhoneNumber);
		model.addAttribute("billingCycleChked", billingCycleChked);
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/prePrintBill"));		
		return "/bill/pre-print-bill";
	}
	
	/*
	 * 转至客户化账单打印页面
	 */
	@RequestMapping(value = "/getBillPrintData", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getBillPrintData(@RequestBody Map<String, Object> paramMap, 
			@LogOperatorAnn String flowNum, Model model,
			HttpServletRequest request, HttpServletResponse response){
		Map<String, Object> returnMap = new HashMap<String, Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		try {
			String phoneNumber = MapUtils.getString(paramMap, "phoneNumber", "");
			String billingCycle = MapUtils.getString(paramMap, "billingCycle", "");
			
			Map<String, Object> resultMap = billBmo.getCustomizeBillData(paramMap, flowNum, sessionStaff);
			Map<String, Object> outMap = MapUtils.getMap(resultMap, "outMap");
			Map<String, Object> inMap = MapUtils.getMap(resultMap, "inMap");
			String resultXml = MapUtils.getString(outMap, "result", "");
			CustomizeBillUtils customizeBillUtils = new CustomizeBillUtils();
			CustomizeBill customizeBill = customizeBillUtils.createCustomizeBill(resultXml, JsonUtil.toString(inMap));
			
			returnMap.put("code", customizeBill.getServiceResultCode());
			returnMap.put("msg", customizeBill.getParaFieldResult());
			if (customizeBill.getServiceResultCode() != 0) {
				return successed(returnMap);
			}
			Map<String, Object> retnMap = customizeBillUtils.createHtml(customizeBill);
			String htmlStr = MapUtils.getString(retnMap, "html", "");
			if (StringUtils.isEmpty(htmlStr)) {
				returnMap.put("code", "1");
				returnMap.put("msg", "无法将返回的xml转化为html");
				returnMap.put("resultXml", resultXml);
				return successed(returnMap);
			}
			String maxBodyWidth = MapUtils.getString(retnMap, "maxBodyWidth", "");
			String maxBodyHeight = MapUtils.getString(retnMap, "maxBodyHeight", "");
			String sessionKey = SysConstant.SESSION_KEY_CUSBILL + "-" + phoneNumber + "-" + billingCycle;
			ServletUtils.setSessionAttribute(request, sessionKey, htmlStr);
			ServletUtils.setSessionAttribute(request, sessionKey + "-maxBodyWidth", maxBodyWidth + "mm");
			ServletUtils.setSessionAttribute(request, sessionKey + "-maxBodyHeight", maxBodyHeight + "mm");
			returnMap.put("code", "0");
			returnMap.put("msg", "成功");
			return successed(returnMap);
			
		}catch(BusinessException be){
			return failed(be);
		}catch(InterfaceException ie) {
			return failed(ie, paramMap, ErrorCode.CUSTOMIZE_BILL);
   		}catch(Exception e){
   			return failed(ErrorCode.CUSTOMIZE_BILL, e, paramMap);
		}
	}
	/*
	 * 转至客户化账单打印页面
	 */
	@RequestMapping(value = "/customizeBillPrint", method = RequestMethod.POST)
	public String customizeBillPrint(@RequestParam("billParam") String billParam, 
			@LogOperatorAnn String flowNum, Model model,
			HttpServletRequest request, HttpServletResponse response){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			String billDec = URLDecoder.decode(billParam, "UTF-8");
			billDec = URLDecoder.decode(billDec, "UTF-8");
			Map<String, Object> paramMap = JsonUtil.toObject(billDec, Map.class);
			String phoneNumber = MapUtils.getString(paramMap, "phoneNumber", "");
			String billingCycle = MapUtils.getString(paramMap, "billingCycle", "");
			String sessionKey = SysConstant.SESSION_KEY_CUSBILL + "-" + phoneNumber + "-" + billingCycle;
			String htmlStr = (String) ServletUtils.getSessionAttribute(request, sessionKey);
			String maxBodyWidth = (String) ServletUtils.getSessionAttribute(request, sessionKey + "-maxBodyWidth");
			String maxBodyHeight = (String) ServletUtils.getSessionAttribute(request, sessionKey + "-maxBodyHeight");
			if (StringUtils.isEmpty(htmlStr)) {
				request.setAttribute("errorMsg", "获取Session中的客户化账单打印数据失败");
				return "/error/500.jsp";
			}
			model.addAttribute("htmlStr", htmlStr);
			model.addAttribute("maxBodyWidth", maxBodyWidth);
			model.addAttribute("maxBodyHeight", maxBodyHeight);
			return "bill/customize-bill-print";
		} catch (Exception e) {
			request.setAttribute("errorMsg", "生成客户化账单打印预览页面发生异常，错误信息:" + e.getMessage());
			return "/error/500.jsp";
		}
	}
	
	/**
	 * 转至批量充值
	 * @param session
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/charge/preBatchDoCash", method = RequestMethod.GET)
	public String preBatchDoCash(HttpSession session, Model model){		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"bill/charge/preBatchDoCash"));
		return "bill/batch-charge-prepare";
	}
	
	/**
	 * 批量充值【输入校验】
	 * @param request
	 * @param model
	 * @param flowNum
	 * @param file
	 * @return flag： -1表示解析excel异常，1表示内容校验不通过，0表示内容校验通过，准备进入【充值鉴权】
	 */
	@RequestMapping(value = "/charge/batchInfoCheck", method = RequestMethod.POST)
	public String batchInfoCheck(HttpServletRequest request, Model model, @LogOperatorAnn String flowNum, @RequestParam("fileUpload") MultipartFile file){
		
		if(file != null){
			boolean oldVersion = true;
			String fileName = file.getOriginalFilename();
			if(fileName.matches("^.+\\.(?i)(xls)$")){
				oldVersion = true;
			}else if(fileName.matches("^.+\\.(?i)(xlsx)$")){
				oldVersion = false;
			}else{
				model.addAttribute("flag", -1);
				model.addAttribute("message", "导入的文件类型错误，后缀必须为xls或xlsx！");
				return "bill/batch-charge-prepare";
			}
			Workbook batchChargeExcel = null;
			try{
				if(oldVersion){// 2003版本Excel(.xls)
					batchChargeExcel = new HSSFWorkbook(file.getInputStream());
				}else{// 2007版本Excel或更高版本(.xlsx)
					batchChargeExcel = new XSSFWorkbook(file.getInputStream());
				}
			}catch(Exception e){
				model.addAttribute("flag", -1);		
				model.addAttribute("message", "文件读取异常，请尝试重新上传！");
				return "bill/batch-charge-prepare";
			}
			Sheet sheet = batchChargeExcel.getSheetAt(0);
			int totalRows = sheet.getPhysicalNumberOfRows();
			if(totalRows>1 && totalRows<102){
				boolean excelError = false;
				ArrayList<Map<String, Object>> errorInputExcel = new ArrayList<Map<String, Object>>();//这个List用来装所有输入有误的excel行
				ArrayList<Map<String, Object>> canDoChargeAuthList = new ArrayList<Map<String, Object>>();//这个List用来装所有输入校验无误的excel行（可以进行充值鉴权）
				//开始进行第一轮校验【输入校验】
				for(int m=1;m<totalRows;m++){
					Row row = sheet.getRow(m);
					//略过空行
					if(row==null){
						//需要记录该条空行，总条目+1
						totalRows += 1;
						continue;
					}
					String phoneNum = "";
					String chargeAmount = "";
					boolean checkError = false;//是否有输入错误，true：有错，false：无误
					String errorMsg = "";
					Map<String, Object> errorInputRow = new HashMap<String, Object>();//这个Map用来装输入有误的excel行信息，一个Map装一行的信息：包括excel行数，用户号码，充值金额以及错误提示					
					Map<String, Object> canDoChargeAuthRow = new HashMap<String, Object>();//这个Map用来装输入校验无误的excel行信息（可以进行充值鉴权），一个Map装一行的信息：包括用户号码和充值金额
					for(int n=0;n<2;n++){
						Cell cell = row.getCell(n);
						String cellValue = getCellValueInString(cell);
						if(n==0){
							phoneNum = cellValue;
							if(!cellValue.matches(SysConstant.MVNO_PHONE_HEAD)){
								checkError = true;
								errorMsg += "用户号码输入有误  ";
							}
						}else if(n==1){
							chargeAmount = cellValue;
							if(cellValue.matches("^(([1-9]{1}\\d*(\\.\\d{1,2})?)|(0\\.\\d[1-9])|(0\\.[1-9]\\d?))$")){
								BigDecimal chargeAmountInCent = new BigDecimal(Float.parseFloat(cellValue)*100);
								chargeAmountInCent = chargeAmountInCent.setScale(0, BigDecimal.ROUND_HALF_UP);
								if(chargeAmountInCent.intValue()>1000000){
									checkError = true;
									errorMsg += "充值金额超过10000元";
								}
							}else{
								checkError = true;
								errorMsg += "充值金额输入有误";
							}
						}
					}
					if(checkError){//该行输入校验未通过，封装该行输入校验错误信息，并将该excel标记为异常文件
						errorInputRow.put("rowNum", m+1);
						errorInputRow.put("phoneNum", phoneNum);
						errorInputRow.put("chargeAmount", chargeAmount);
						errorInputRow.put("errorMsg", errorMsg);
						errorInputExcel.add(errorInputRow);
						excelError = true;
					}else if(!checkError){//该行输入校验无误，封装该行至可鉴权列表
						canDoChargeAuthRow.put("rowNum", m+1);
						canDoChargeAuthRow.put("phoneNum", phoneNum);
						canDoChargeAuthRow.put("chargeAmount", chargeAmount);
						canDoChargeAuthList.add(canDoChargeAuthRow);
					}
				}				
				if(excelError){//是异常excel说明输入有误，需要回退excel文件并返回展示所有输入有误的条目信息
					model.addAttribute("flag", 1);
					model.addAttribute("message", "以下用户的充值信息输入有误，请确认后修改或删除这些条目并重新上传excel");
					model.addAttribute("errorList", errorInputExcel);
					return "bill/batch-charge-prepare";
				}else{//【输入校验】校验通过，返回可以进行【充值鉴权】的用户信息
					if(canDoChargeAuthList.size()>0){
						model.addAttribute("flag", 0);
						model.addAttribute("message", "批量信息导入成功，以下用户可以开始");
						model.addAttribute("chargeAuthList", canDoChargeAuthList);
						return "bill/batch-charge-prepare";
					}else{
						model.addAttribute("flag", 1);
						model.addAttribute("message", "无可充值的用户，上传的excel文件无有效信息");
						return "bill/batch-charge-prepare";
					}
				}
			}else if(totalRows>101){
				model.addAttribute("flag", 1);
				model.addAttribute("message", "上传的批量用户信息超过100条，请修改后重新上传");
				return "bill/batch-charge-prepare";
			}else{
				model.addAttribute("flag", 1);
				model.addAttribute("message", "无可充值的用户，上传的excel文件无有效信息");
				return "bill/batch-charge-prepare";
			}
		}else{
			model.addAttribute("flag", -1);
			model.addAttribute("message", "文件上传失败，请重试！");
			return "bill/batch-charge-prepare";
		}	
	}
	
	/**
	 * 批量充值【批量充值】
	 * @param params
	 * @param flowNum
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/charge/batchDoCash", method = RequestMethod.POST)
	public String batchDoCash(@RequestBody Map<String, Object> params, @LogOperatorAnn String flowNum, Model model)throws BusinessException{
		
		if(MapUtils.getString(params, "canDoCash", "N").equals("Y")){
			final SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
			final ArrayList<Map<String, Object>> chargeList = (ArrayList<Map<String, Object>>) params.get("chargeList");
			String groupSize = String.valueOf(chargeList.size());
			String doChargeCount = "";
			for(int n=0;n<4-groupSize.length();n++){
				doChargeCount += "0";
			}
			doChargeCount += groupSize;
			//生成批次号：9位转售商ID+15位时间+8位随机数+4位该批次充值用户数量（不足4位的在前面补0）
			final String chargeGroupId = sessionStaff.getPartnerId() + UIDGenerator.getRand() + doChargeCount;
			//异步进行批量充值
			Thread batchDoCash = new Thread(){
			    public void run(){
			    	for(int j=0;j<chargeList.size();j++){
			    		Map<String, Object> doCashItem = chargeList.get(j);
			    		Map<String, Object> doCashParams = new HashMap<String, Object>();
			    		doCashParams.put("phoneNumber", doCashItem.get("phoneNumber"));
			    		doCashParams.put("unitTypeId", "0");
			    		doCashParams.put("destinationAttr", "2");
			    		BigDecimal feeAmount = new BigDecimal(MapUtils.getFloatValue(doCashItem, "chargeAmount", 0)*100);
						feeAmount = feeAmount.setScale(0, BigDecimal.ROUND_HALF_UP);
						doCashParams.put("feeAmount", feeAmount);
						doCashParams.put("doCashTypeCd", "0");
						doCashParams.put("areaId", sessionStaff.getAreaId());
						doCashParams.put("chargeGroupId", chargeGroupId);
						try{
							billBmo.doCash(doCashParams, null, sessionStaff);
						}catch (BusinessException e){
							//做什么都没意义了
				   		}catch(Exception e){
				   			//所以什么都没写
						}
			    	}
			   }
			};
			batchDoCash.start();
			//先行返回批次号和请求已发送的提示
			model.addAttribute("flag", 0);
			model.addAttribute("message", "充值请求已发送，请稍后前往充值订单查询确认该批次的充值情况，本次充值的批次号是：" + chargeGroupId);
		}else{
			ArrayList<Map<String, Object>> authFailList = (ArrayList<Map<String, Object>>) params.get("authFailList");
			model.addAttribute("flag", 1);
			model.addAttribute("message", "以下用户未通过鉴权，请确认后修改或删除这些条目并重新上传excel");
			model.addAttribute("authFailList", authFailList);
		}
		return "bill/batch-charge";
	}
	
	/**
	 * 以String类型获取excel单元格内的信息
	 * @param cell
	 * @return 单元格信息的String格式
	 */
	private String getCellValueInString(Cell cell){
		if(null==cell) {
			return "";
		}
		switch(cell.getCellType()){
		
		case Cell.CELL_TYPE_FORMULA :
		case Cell.CELL_TYPE_STRING :			
			try{
				String value =cell.getStringCellValue();
				if(value == null){
					return "";
				}
				return value.trim();
			}catch(Exception e){
				return "";
			}
		
		case Cell.CELL_TYPE_BLANK :
		case Cell.CELL_TYPE_ERROR :
			return "";
		
		default :
			try{
				BigDecimal value = BigDecimal.valueOf(cell.getNumericCellValue());
				return String.valueOf(value).trim();
			}catch(Exception e){
				return "";
			}
		}
	}

}

package com.al.lte.portal.app.controller.crm;


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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.Result;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.BillBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.common.print.CustomizeBillUtils;
import com.al.lte.portal.common.print.bill.CustomizeBill;
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
@Controller("com.al.lte.portel.app.controller.crm.BillController")
@RequestMapping("/app/bill/*")
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
    @AuthorityValid(isCheck = false)
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
    			Map<String, Object> result = MapUtils.getMap(resultMap, "result", empty);
    			if(!result.isEmpty()){
    				List<Map<String, Object>> writeOffInfomation = (List<Map<String, Object>>)result.get("writeOffInfomation");
    				jr = super.successed(writeOffInfomation, ResultConstant.SUCCESS.getCode());
    			}
    			else{
    				List<Map<String, Object>> writeOffInfomation = new ArrayList<Map<String, Object>>();
    				jr = super.successed(writeOffInfomation, ResultConstant.SUCCESS.getCode());
    			}
    		}
    		else{
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
        	return super.failed(ie, params, ErrorCode.QUERY_BILL);//REVERSE_WRITEOFFCASH_PRINT_INVOICE
		} catch (Exception e) {
			log.error("门户/bill/getInvoiceItems方法异常", e);
			return super.failed(ErrorCode.QUERY_BILL, e, params);//REVERSE_WRITEOFFCASH_PRINT_INVOICE
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
		    			//后台保存被查号码和余额上限
		    			session.setAttribute("validNumber", params.get("phoneNumber"));
		    			session.setAttribute("paymentLimit", balanceInfo.get("totalBalanceAvailable"));
		    			model.addAttribute("feeAmount", totalBalanceAvailable);//将作为余额支取入参的总余额
		    			model.addAttribute("queryType", MapUtils.getString(params, "queryItemType", ""));//余额类型 0：全部余额  1：可用余额
		    			if(balanceInfo.get("balanceItemDetail")!=null){
		    				ArrayList<Map<String,Object>> balanceItemDetail = (ArrayList<Map<String, Object>>)balanceInfo.get("balanceItemDetail");
			    			model.addAttribute("balanceDetail", balanceItemDetail);//余额详情列表
		    			}
					}
					else{
						model.addAttribute("feeAmount", "none");
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
    @AuthorityValid(isCheck = false)
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
			param.put("areaId", sessionStaff.getCurrentAreaId());
			
			Map<String, Object> resultMap = billBmo.queryBill(param, flowNum, sessionStaff);				
			if(MapUtils.getString(resultMap, "code", "").equals("POR-0000")){
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
						//将4个层级的账目项按逐层归属重装成一个账目项列
						ArrayList<Map<String, Object>> newLv3 = this.putChildIntoParent(itemLv3, itemLv4);
						ArrayList<Map<String, Object>> newLv2 = this.putChildIntoParent(itemLv2, newLv3);
						ArrayList<Map<String, Object>> newLv1 = this.putChildIntoParent(itemLv1, newLv2);
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
						model.addAttribute("errorMsg", serviceName + "【itemInformation】节点，请与计费系统确认！");
					}
				}
				else{
					model.addAttribute("flag", 1);
					model.addAttribute("errorMsg", "无账单信息");
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
			param.put("staffCode", sessionStaff.getStaffCode());
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
			Map<String, Object> result = custBmo.queryCustInfo(params, flowNum, sessionStaff);
			if(result != null){
				if(result.get("custInfos")!=null){
					ArrayList<Map<String, Object>> custInfos = (ArrayList<Map<String, Object>>) result.get("custInfos");
					if(custInfos.size()>0){
						Map<String, Object> custInfo = custInfos.get(0);
						if(!MapUtils.getString(custInfo, "partyName", "").equals("")){
							Map<String, Object> resultMap = new HashMap<String, Object>();
							resultMap.put("partyName", custInfo.get("partyName"));
							resultMap.put("staffName", sessionStaff.getStaffName());
							resultMap.put("staffCode", sessionStaff.getStaffCode());
							return successed(resultMap, 0);
						}
						else{
							return failed("客户查询失败，客户信息回参缺少partyName字段", 1);
						}
					}
					else{
						return failed("客户查询失败，客户信息回参custInfos节点为空", 1);
					}
				}
				else{
					return failed("客户查询失败，客户信息回参缺少custInfos节点", 1);
				}
			}
			else{
				return failed("客户查询失败，客户信息回参缺少result节点", 1);
			}		
		}catch(BusinessException be){
 			return super.failed(be);
   		}catch(Exception e){
   			return super.failed(ErrorCode.QUERY_CUST, e, params);
		}
	}
	
	/**
	 * 转至充值记录查询页面 - SGW全量查询入口
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
	 * 充值记录查询（查询充值平台记录）
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/preChargeRecord", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
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
    @AuthorityValid(isCheck = false)
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
		param.put("areaId", sessionStaff.getCurrentAreaId());
    	try{
    		DataBus aDataBus=billBmo.queryOfferUsage(param, flowNum, sessionStaff);
    		Map<String, Object> returnMap=aDataBus.getReturnlmap();
    		if(null!=returnMap&&ResultCode.R_SUCCESS.equals(returnMap.get("code"))){
				model.addAttribute("resultMap", returnMap);
        	}else{
        	    model.addAttribute("message", returnMap.get("message"));
        	}
   		}catch (BusinessException e) {
   		   return super. failedStr(model, e);
   		}
   		return "/bill/offerusage_list";
    }
	
	/**
	 * 转至详单查询页面
	 * @param session
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/preQueryBillDetail", method = RequestMethod.GET)
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
		String serviceName = "服务层接口服务 com.linkage.portal.service.lte.core.charge.QueryCustomizeBillDetail 回参缺少";
		
		try{
			param.put("areaId", sessionStaff.getCurrentAreaId());
			Map<String, Object> resultMap = billBmo.queryBillDetail(param, flowNum, sessionStaff);
			if(resultMap.get("code").equals("POR-0000")){
				if(!MapUtils.getMap(resultMap, "billInfo", empty).isEmpty()){
					Map<String, Object> billInfo = (Map<String, Object>)resultMap.get("billInfo");
					ArrayList<Map<String, Object>> wholeList = new ArrayList<Map<String, Object>>();
					int pageSize = 10;
					int curPage = Integer.parseInt(param.get("curPage").toString());
					ArrayList<Map<String, Object>> infoList = new ArrayList<Map<String, Object>>();
					//语音详单
					if(param.get("billTypeCd").equals("1")){
						if(billInfo.get("voiceInfo")!=null){
							wholeList = (ArrayList<Map<String, Object>>)billInfo.get("voiceInfo");										
							model.addAttribute("type", 1);
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("errorMsg", "无语音详单记录");
							return "bill/bill-detail"; 
						}
					}
					//短信详单
					if(param.get("billTypeCd").equals("2")){
						if(billInfo.get("smsInfo")!=null){
							wholeList = (ArrayList<Map<String, Object>>)billInfo.get("smsInfo");
							model.addAttribute("type", 2);
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("errorMsg", "无短信详单记录");
							return "bill/bill-detail";
						}
					}
					//数据详单
					if(param.get("billTypeCd").equals("3")){
						if(billInfo.get("dataInfo")!=null){
							wholeList = (ArrayList<Map<String, Object>>)billInfo.get("dataInfo");
							model.addAttribute("type", 3);
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("errorMsg", "无数据详单记录");
							return "bill/bill-detail";
						}
					}
					//增值业务详单
					if(param.get("billTypeCd").equals("4")){
						if(billInfo.get("spInfo")!=null){
							wholeList = (ArrayList<Map<String, Object>>)billInfo.get("spInfo");
							model.addAttribute("type", 4);
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("errorMsg", "无增值业务详单记录");
							return "bill/bill-detail";
						}
					}				
					for(int n=0;n<pageSize;n++){
						if((curPage-1)*pageSize+n>wholeList.size()-1){
							break;
						}
						Map<String, Object> billItem = wholeList.get((curPage-1)*pageSize+n);						
						infoList.add(billItem);
					}
					PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(curPage, pageSize, wholeList.size()<1?1:wholeList.size(), infoList);
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
					model.addAttribute("errorMsg", serviceName + "【billInfo】节点或该节点为空，请与计费系统确认！");
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
    	String validNumber = (String)session.getAttribute("validNumber");
    	if(!MapUtils.getString(params, "phoneNumber", "").equals(validNumber)){
    		return failed("非法操作：该号码为非法用户", 1);
    	}
    	//校验是否超过余额上限
    	Integer paymentLimit = Integer.parseInt((String)session.getAttribute("paymentLimit"));
    	Integer feeAmount = Integer.parseInt((String)params.get("feeAmount"));
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
			String htmlStr = customizeBillUtils.createHtml(customizeBill);
			if (StringUtils.isEmpty(htmlStr)) {
				returnMap.put("code", "1");
				returnMap.put("msg", "无法将返回的xml转化为html");
				returnMap.put("resultXml", resultXml);
				return successed(returnMap);
			}
			
			ServletUtils.setSessionAttribute(request, SysConstant.SESSION_KEY_CUSBILL + "-" + phoneNumber + "-" + billingCycle, htmlStr);
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
			String htmlStr = (String) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CUSBILL + "-" + phoneNumber + "-" + billingCycle);
			if (StringUtils.isEmpty(htmlStr)) {
				request.setAttribute("errorMsg", "获取Session中的客户化账单打印数据失败");
				return "/error/500.jsp";
			}
			model.addAttribute("htmlStr", htmlStr);
			return "bill/customize-bill-print";
		} catch (Exception e) {
			request.setAttribute("errorMsg", "生成客户化账单打印预览页面发生异常，错误信息:" + e.getMessage());
			return "/error/500.jsp";
		}
	}
	
	@RequestMapping(value = "/paymentQueryPrepare", method = RequestMethod.POST)
	public String paymentQueryPrepare() {
		return "/app/bill/payment-query-prepare";
	}
	
	@RequestMapping(value = "/paymentQuery", method = RequestMethod.POST)
	public String paymentQuery(@RequestBody Map<String, Object> paramMap, HttpServletResponse response, Model model, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			String accNbr = MapUtils.getString(paramMap, "accNbr", "");
			if (!accNbr.matches(Const.LTE_PHONE_HEAD)) {
				super.addHeadCode(response,  new Result(ResultConstant.ACCESS_NOT_NORMAL.getCode(), "非法请求！"));
				return null;
			}
			// 以下字段先设定默认值，后续有需求再做调整
			// 1：按ReqSerial 充值订单号查询； 2：按AccNbr充值号码查询;
			paramMap.put("qryType", "2");
			// 有效查询期限为一个月
			paramMap.put("qryFromTime", DateUtil.nearDayDetail(-30));
			paramMap.put("qryEndTime", DateUtil.getNowDefault());
			
			Map<String, Object> resultMap = billBmo.paymentQuery(paramMap, flowNum, sessionStaff);
			if (ResultConstant.SUCCESS.getCode() == MapUtils.getIntValue(resultMap, "resultCode", 1)) {
				model.addAttribute("result", MapUtils.getObject(resultMap, "result"));
			} else {
				model.addAttribute("resultCode", MapUtils.getObject(resultMap, "resultCode"));
				model.addAttribute("message", MapUtils.getObject(resultMap, "message"));
			}
			return "/app/bill/payment-query-result";
		}catch(BusinessException be){
			return failedStr(model, be);
		}catch(InterfaceException ie) {
			return failedStr(model, ie, paramMap, ErrorCode.BILL_PAYMENT_QUERY);
   		}catch(Exception e){
   			return failedStr(model, ErrorCode.BILL_PAYMENT_QUERY, e, paramMap);
		}
	}
	
	
	@RequestMapping(value = "/getTranId", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse getTranId(@RequestParam Map<String, Object> paramMap, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			String tranId = billBmo.getTranId(paramMap, flowNum, sessionStaff);
			return successed(tranId, tranId == null ? ResultConstant.FAILD.getCode() : ResultConstant.SUCCESS.getCode());
		}catch(BusinessException be){
			return failed(be);
		}catch(InterfaceException ie) {
			return failed(ie, paramMap, ErrorCode.BILL_GET_TRAN_ID);
   		}catch(Exception e){
   			return failed(ErrorCode.BILL_GET_TRAN_ID, e, paramMap);
		}
	}
	
	@RequestMapping(value = "/chargePrepare", method = RequestMethod.POST)
    public String chargePrepare() {
		return "/app/bill/charge-prepare";
    }
	
	@RequestMapping(value = "/charge", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse charge(@RequestBody Map<String, Object> paramMap, HttpSession session, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			String feeAmount = MapUtils.getString(paramMap, "feeAmount");
			String destinationId = MapUtils.getString(paramMap, "destinationId");
			if (!(null != feeAmount && null != destinationId 
					&& destinationId.matches(Const.LTE_PHONE_HEAD) 
					&& feeAmount.matches(Const.FEE_AMOUNT) 
					&& Integer.parseInt(feeAmount) <= 50000 
					&& feeAmount.equals((String) session.getAttribute(Const.SESSION_PAY_CHARGE_AMOUNT)))) {
				return super.failed("非法请求！", ResultConstant.ACCESS_NOT_NORMAL.getCode());
			}
			// 以下字段先设定默认值，后续有需求再做调整
			// 缴费用户属性 0：固话 1：小灵通 2：移动用户 3：ADSL（宽带）
			paramMap.put("destinationAttr", "2");
			// 帐本类型 0：默认（全部应缴话费）1：本地话费2：长途话费3：上网费
			paramMap.put("balanceItemTypeID", "0");
			// 充值单位类型 0：分（金额）1：分钟（时长）2：次数3：流量（KB）
			paramMap.put("unitTypeId", "0");

			Map<String, Object> resultMap = billBmo.charge(paramMap, flowNum, sessionStaff);
			return successed(resultMap, MapUtils.getIntValue(resultMap, "resultCode", 1));
		}catch(BusinessException be){
			return failed(be);
		}catch(InterfaceException ie) {
			return failed(ie, paramMap, ErrorCode.BILL_CHARGE);
   		}catch(Exception e){
   			return failed(ErrorCode.BILL_CHARGE, e, paramMap);
		}
	}
	
	@RequestMapping(value = "/balance", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse balance(@RequestBody Map<String, Object> paramMap, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			String destinationId = MapUtils.getString(paramMap, "destinationId");
			if (!destinationId.matches(Const.LTE_PHONE_HEAD)) {
				return super.failed("非法请求！", ResultConstant.ACCESS_NOT_NORMAL.getCode());
			}
			// 以下字段先设定默认值，后续有需求再做调整
			// 欠费查询默认入参
			// 查询条件类型 0：帐户 1：用户 2：输入号码（含区号）
			paramMap.put("billQueryType", "2");
			// 用户属性 0-固话 2-移动 3-宽带
			paramMap.put("destinationAttr", "2");
			// 查询业务类型 0：按帐户查询 1：按用户查询
			paramMap.put("queryFlag", "0");
			// 查询费用类型 0:查询全部费用 1:只查询信息费 2:查询通讯费
			paramMap.put("feeQueryFlag", "0");
			// 欠费查询
			Map<String, Object> arrearsResultMap = billBmo.arrears(paramMap, flowNum, sessionStaff);
			
			// 余额查询默认入参
			// 用户号码类型 0 ：客户ID 1：用户ID 2：用户号码
			paramMap.put("destinationIdType", "2");
			// 用户属性（当号码类型为用户号码时填写） 0：固话 2：移动 3：宽带；（同上）
			paramMap.put("destinationAttr", "2");
			// 电话区号
			paramMap.put("areaCode", StringUtils.isEmpty(sessionStaff.getCurrentAreaCode())? sessionStaff.getAreaCode() : sessionStaff.getCurrentAreaCode());
			// 查询业务类型 0：按帐户查询 1：按用户查询（同上）
			paramMap.put("queryFlag", "0");
			// 查询余额类型 0：表示查询对象拥有的余额帐本 1：表示查询对象可以使用的余额帐本 2：表示查询对象可以划拨到支付帐户的余额帐本 3：查询对象余额总视图：省通信余额+全国中心ABM支付余额
			paramMap.put("queryItemType", "3");
			// 余额查询
			Map<String, Object> balanceResultMap = billBmo.balance(paramMap, flowNum, sessionStaff);
			
			Map<String, Object> returnMap = new HashMap<String, Object>();
			returnMap.put("arrears", arrearsResultMap);
			returnMap.put("balance", balanceResultMap);
			
			// TODO 需要整合上面两个接口的返回
			return successed(returnMap);
		}catch(BusinessException be){
			return failed(be);
		}catch(InterfaceException ie) {
			return failed(ie, paramMap, ErrorCode.BILL_BALANCE);
   		}catch(Exception e){
   			return failed(ErrorCode.BILL_BALANCE, e, paramMap);
		}
	}
	// 校验代理商保证金
	@RequestMapping(value = "/checkDeposit", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse checkDeposit(@RequestBody Map<String, Object> paramMap, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = new JsonResponse();
		try {
//			String destinationId = MapUtils.getString(paramMap, "AccNbr");
//			if (!destinationId.matches(Const.LTE_PHONE_HEAD)) {
//				return super.failed("非法请求！", ResultConstant.ACCESS_NOT_NORMAL.getCode());
//			}
			String iseditOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
	                SysConstant.SESSION_KEY_DEPOSIT + "_" + sessionStaff.getStaffId());
	        try {
	            if (iseditOperation == null) {
	                iseditOperation = staffBmo.checkOperatSpec(SysConstant.DEPOSIT_CODE, sessionStaff);
	                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_DEPOSIT + "_"
	                        + sessionStaff.getStaffId(), iseditOperation);
	            }
	        } catch (BusinessException e) {
	            iseditOperation = "1";
	        } catch (InterfaceException ie) {
	            iseditOperation = "1";
	        } catch (Exception e) {
	            iseditOperation = "1";
	        }
            if ("0".equals(iseditOperation)) {
				Map<String, Object> checkResultMap = billBmo.checkDeposit(paramMap, flowNum, sessionStaff);
				if(ResultCode.R_SUCCESS.equals(checkResultMap.get("code"))){
					return successed(checkResultMap);
	    		}
	    		else{ 
	    			return failed(checkResultMap.get("msg"),ResultConstant.FAILD.getCode());            	
	    		} 
	        }else if("1".equals(iseditOperation)){
				jsonResponse = super.failed("签权接口异常",
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}	
		}catch(BusinessException be){
			return failed(be);
		}catch(InterfaceException ie) {
			return failed(ie, paramMap, ErrorCode.CHECK_DEPOSIT);
   		}catch(Exception e){
   			return failed(ErrorCode.CHECK_DEPOSIT, e, paramMap);
		}
		return jsonResponse;
	}
}

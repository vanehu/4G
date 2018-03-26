package com.al.lte.portal.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.BusiBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.PortalUtils;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 订单受理控制层
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.crm.BusiController")
@RequestMapping("/order/*")
public class BusiController extends BaseController {
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	@Resource(name = "com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	@Resource(name = "com.al.lte.portal.bmo.print.PrintBmo")
	private PrintBmo printBmo;
	@Resource(name = "com.al.lte.portal.bmo.crm.BusiBmo")
	private BusiBmo busiBmo;
	/**
	 * 补退费订单查询
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/refund/QueryOrder", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String refundChargeQuery(Model model, HttpSession session,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		model.addAttribute("current",
				EhcacheUtil.getCurrentPath(session, "order/refund/QueryOrder"));
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String endTime = f.format(c.getTime());
		c.add(Calendar.DATE, -7);
		String startTime = f.format(c.getTime());		
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
		model.addAttribute("p_startTime", startTime);
		model.addAttribute("p_endTime", endTime);
		model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
		model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
		return "/charge/order-refund-query";
	}
    /**
     * 补退费-可打印费用查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
 	@RequestMapping(value = "/refund/chargeList", method = RequestMethod.GET)
     public String getChargeList(@RequestParam Map<String, Object> param, Model model,
 			@LogOperatorAnn String flowNum,HttpServletResponse response){
     	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_LOGIN_STAFF);
     	try {
     		if(param.get("olNbr")!=null){
         		String olNbr=(String)param.get("olNbr");
         		model.addAttribute("olNbr", olNbr);
         		param.remove("olNbr");
     		}
     		Map<String, Object> datamap = printBmo.getInvoiceItems(
     				param, flowNum, sessionStaff);
 			if (datamap != null) {
 	    		String code = (String) datamap.get("resultCode");
 				if (ResultCode.R_SUCC.equals(code)) {
 	    			List<Map<String,Object>> templist=null; 
 	    			if(datamap.get("chargeItems")!=null){
 	    				Object obj=datamap.get("chargeItems");
 	    				if (obj instanceof List) {
 	    					templist=(List<Map<String,Object>>)obj;
 	    				}else{
 	    					templist=new ArrayList<Map<String,Object>>();
 	    					templist.add((Map<String,Object>)obj);
 	    				}
 	    				model.addAttribute("chargeItems", templist);
 	    			}
 	    			templist=null;
 	    			if(datamap.get("prodInfo")!=null){
 	    				Object obj1=datamap.get("prodInfo");
 	    				if (obj1 instanceof List) {
 	    					templist=(List<Map<String,Object>>)obj1;
 	    				}else{
 	    					templist=new ArrayList<Map<String,Object>>();
 	    					templist.add((Map<String,Object>)obj1);
 	    				}
 	    				model.addAttribute("prodInfo", templist);
 	    			}
 	    			if(datamap.get("invoiceInfos")!=null){
 	    				Object obj2=datamap.get("invoiceInfos");
 	    				if (obj2 instanceof List) {
 	    					templist=(List<Map<String,Object>>)obj2;
 	    				}else{
 	    					templist=new ArrayList<Map<String,Object>>();
 	    					templist.add((Map<String,Object>)obj2);
 	    				}
 	    				model.addAttribute("invoiceInfos", templist);
 	    			}
 				}
     		}
 			String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_EDITCHARGE+"_"+sessionStaff.getStaffId());
 			
 			try{
	 			if(iseditOperation==null){
	 				iseditOperation=staffBmo.checkOperatSpec(SysConstant.EDITCHARGE_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_EDITCHARGE+"_"+sessionStaff.getStaffId(), iseditOperation);
	 			}
 			} catch (BusinessException e) {
 				iseditOperation="1";
 	 		} catch (InterfaceException ie) {
 	 			iseditOperation="1";
 			} catch (Exception e) {
 				iseditOperation="1";
 			}
 			String isAddOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_ADDCHARGE+"_"+sessionStaff.getStaffId());
 			try{
	 			if(isAddOperation==null){
	 				isAddOperation=staffBmo.checkOperatSpec(SysConstant.ADDCHARGE_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_ADDCHARGE+"_"+sessionStaff.getStaffId(), isAddOperation);
	 			}
 			} catch (BusinessException e) {
 				isAddOperation="1";
 	 		} catch (InterfaceException ie) {
 	 			isAddOperation="1";
 			} catch (Exception e) {
 				isAddOperation="1";
 			}
 			
 			
 			String isEditAdjustOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_EDITADJUSTCHARGE+"_"+sessionStaff.getStaffId());
 			try{
	 			if(isEditAdjustOperation==null){
	 				isEditAdjustOperation=staffBmo.checkOperatSpec(SysConstant.EDITADJUST_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_EDITADJUSTCHARGE+"_"+sessionStaff.getStaffId(), isEditAdjustOperation);
	 			}
 			} catch (BusinessException e) {
 				isEditAdjustOperation="1";
 	 		} catch (InterfaceException ie) {
 	 			isEditAdjustOperation="1";
 			} catch (Exception e) {
 				isEditAdjustOperation="1";
 			}
 			
 			//String iseditOperation="0";
 			model.addAttribute("iseditOperation", iseditOperation);
 			model.addAttribute("isEditAdjustOperation", isEditAdjustOperation);
 			model.addAttribute("isAddOperation", isAddOperation);
 			model.addAttribute("olId", param.get("olId"));
 			model.addAttribute("refundFlag", "1");
 			getApConfigMap(model, flowNum, sessionStaff);
     	} catch (BusinessException e) {
 			this.log.error("查询信息失败", e);
 			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
 		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.REFUND_CHARGE);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.REFUND_CHARGE, e, param);
		}
     	return "/charge/order-refund-charge";
     }
    
    /**
     * 取得租金费用项
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
	private void getApConfigMap(Model model, String flowNum,
			SessionStaff sessionStaff) {
		String tableName = "SYSTEM";
		String columnItem = "PENALTY_FREE_ITEM";
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
			ArrayList<Map<String, Object>> al = (ArrayList)rList.get(0).get("PENALTY_FREE_ITEM"); 
			model.addAttribute("acctItemTypeId", al.get(0).get("COLUMN_VALUE"));
		} catch (BusinessException e) {
		  this.log.error("查询配置信息服务出错", e);
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
	}
    /**
     * 补退费提交
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/refund/addOrReturnSubmit", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse chargeSubmit(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			rMap = busiBmo.updateForAddOrReturn(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse = super.successed("补退费提交成功",
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("补退费提交服务出错", e);
			jsonResponse = super.failed("补退费提交服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.REFUND_CHARGE);
		} catch (Exception e) {
			log.error("补退费提交异常", e);
			return super.failed(ErrorCode.REFUND_CHARGE, e, param);
		}
		return jsonResponse;
    }
}

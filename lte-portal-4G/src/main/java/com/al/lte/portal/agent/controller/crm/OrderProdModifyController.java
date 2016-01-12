package com.al.lte.portal.agent.controller.crm;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 二次业务控制层 .
 * <P>
 * 
 * @author wuhb
 * @version V1.0 2015-03-16
 * @modifyDate <BR>
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.agent.controller.crm.OrderProdModifyController")
@RequestMapping("/agent/prodModify/*")
public class OrderProdModifyController extends BaseController {

	/** 业务操作类 */
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;

	
	@RequestMapping(value = "/toCheckUimUI", method = {RequestMethod.POST})
	public String toCheckUimUI(@RequestBody Map<String, Object> params, Model model, @LogOperatorAnn String optFlowNum,
            HttpServletResponse response, HttpSession httpSession) {
		return "/agent/changeCard/order-change-card";		
	}
	
	@RequestMapping(value = "/changeCard", method = RequestMethod.POST)
	public String changeCard(@RequestBody Map<String, Object> param,Model model,HttpSession session,@LogOperatorAnn String flowNum) {
		model.addAttribute("prodId",param.get("prodId"));
		return "/agent/changeCard/order-uim";		
	}
	
	
	/**
	 * 客户资料返档
	 * @param params
	 * @param model
	 * @param optFlowNum
	 * @param response
	 * @param httpSession
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/prepare", method = { RequestMethod.POST })
	@AuthorityValid(isCheck = false)
    public String prepare(@RequestBody Map<String, Object> params, Model model, @LogOperatorAnn String optFlowNum,
            HttpServletResponse response, HttpSession httpSession) throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String prodIdInfos=params.get("prodIdInfos").toString().replace("\\", "");
		String custInfos=params.get("custInfos").toString().replace("\\", "");
		String staffInfos=params.get("staffInfos").toString().replace("\\", "");
		Map<String, Object> param = new HashMap<String, Object>();
		param=CommonMethods.getParams(prodIdInfos, custInfos, staffInfos, getRequest());
				
		
		Map<String, Object> paramMap = new HashMap<String, Object>();//客户详情资料查询入参
		
		Map<String, Object> datamap = null;
		Map<String, Object> resultMap = null;
		Map<String, Object> partyListMap = null;
		try {
			param.put("actionFlag", Const.ACTIVERETURN_FLAG);
			Map<String, Object> validatoResutlMap=commonBmo.validatorRule(param, optFlowNum, super.getRequest());
			if(!ResultCode.R_SUCCESS.equals(validatoResutlMap.get("code"))){
				model.addAttribute("validatoResutlMap", validatoResutlMap);
			   return "/app/rule/rulecheck";
			}
			
			
			//客户详情查询
			paramMap.put("partyId", ((Map<String, Object>)param.get("custInfoMap")).get("custId"));
			paramMap.put("areaId", ((Map<String, Object>)param.get("custInfoMap")).get("areaId"));
			datamap = this.custBmo.queryCustDetail(paramMap, optFlowNum,sessionStaff);
			String code = (String) datamap.get("resultCode");
			List<Map<String, Object>> identitiesList = null;
			List<Map<String, Object>> partyContactInfoList = null;

			if (ResultCode.R_SUCC.equals(code)) {
				resultMap = MapUtils.getMap(datamap, "result");
				partyListMap = MapUtils.getMap(resultMap, "partyList");
				if (resultMap != null && (partyListMap.size() > 0)) {

					identitiesList = (List<Map<String, Object>>) partyListMap
							.get("identities");
					partyContactInfoList = (List<Map<String, Object>>) partyListMap
							.get("partyContactInfo");
					// 纳税 人权限查询
					String iseditOperation = (String) ServletUtils
							.getSessionAttribute(super.getRequest(),
									SysConstant.SESSION_KEY_EDITTAXPAYER + "_"
											+ sessionStaff.getStaffId());
					try {
						if (iseditOperation == null) {
							iseditOperation = staffBmo
									.checkOperatSpec(
											SysConstant.EDITTAXPAYER_CODE,
											sessionStaff);
							ServletUtils.setSessionAttribute(
									super.getRequest(),
									SysConstant.SESSION_KEY_EDITTAXPAYER + "_"
											+ sessionStaff.getStaffId(),
									iseditOperation);
						}
					} catch (BusinessException e) {
						iseditOperation = "1";
					} catch (InterfaceException ie) {
						iseditOperation = "1";
					} catch (Exception e) {
						iseditOperation = "1";
					}
					model.addAttribute("identities", identitiesList);
					model.addAttribute("partyContactInfos",partyContactInfoList);
					model.addAttribute("modPartyTypeCd", partyListMap);
					model.addAttribute("soNbr",param.get("soNbr"));
					//TODO 测试数据
//					model.addAttribute("chooseProdInfo",JsonUtil.buildNormal().objectToJson(CommonMethods.getChooseProdInfo(paramMap)));
//					model.addAttribute("staffInfo",JsonUtil.buildNormal().objectToJson(CommonMethods.getStaffInfo(super.getRequest())));
//					model.addAttribute("custInfo",JsonUtil.buildNormal().objectToJson(CommonMethods.getCustInfo(super.getRequest())));
				}
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, paramMap,
					ErrorCode.QUERY_CUST_EXINFO);
		} catch (Exception e) {

			return super.failedStr(model, ErrorCode.QUERY_CUST_EXINFO, datamap,
					paramMap);
		}

		return "/agent/order/cust-activie-return";
	}
}

package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
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
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CmBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.controller.crm.RepairUserController")
@RequestMapping("/user/repair/*")
public class RepairUserController  extends BaseController {
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CmBmo")
	private CmBmo cmBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	
	@RequestMapping(value = "/main", method = RequestMethod.GET)
	public String main(Model model, HttpServletRequest request,HttpSession httpSession) {
		removeAttribute(httpSession);
		return "/repair/user-repair";
	}

	

	/**
	 * 查询使用人信息
	 * 
	 * @param model
	 * @param request
	 * @param session
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryRepairList", method = RequestMethod.GET)
	public String queryRepairList(@RequestParam("strParam") String param,
			Model model, @LogOperatorAnn String flowNum,
			HttpServletResponse response, HttpServletRequest request,
			HttpSession httpSession) {
		
		removeAttribute(httpSession);
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(request,
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		
	    Map<String, Object> userList = new HashMap<String, Object>();
		Map<String, Object> certPhoneNumRelList = new HashMap<String, Object>();
		Map<String, Object> paramMap =  JsonUtil.toObject(param, Map.class);
		Boolean isEqual = false;
		try {
			
			Map<String, Object> userInfoMap = (Map<String, Object>) paramMap.get("userInfo");
			userList = cmBmo.queryProvUserList(userInfoMap, flowNum,
					sessionStaff);
			model.addAttribute("userList", userList);
			if(ResultCode.R_SUCCESS.equals(userList.get("code"))){
				httpSession.setAttribute("enCertNum", userList.get("enCertNum"));
				httpSession.setAttribute("enCertAddress", userList.get("enCertAddress"));
				httpSession.setAttribute("enCustName", userList.get("enCustName"));
			}else{
	    		return super
						.failedStr(model, ErrorCode.QUERY_USER_INO, userInfoMap, paramMap);
	    	}
		} catch (BusinessException e) {
			this.log.error("查询信息失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap,
					ErrorCode.QUERY_USER_INO);
		} catch (Exception e) {
			return super
					.failedStr(model, ErrorCode.QUERY_USER_INO, e, paramMap);
		}

		try {
			Map<String, Object> contractRootMap = (Map<String, Object>) paramMap.get("userInfoFive");
			certPhoneNumRelList = cmBmo.queryRepairList(contractRootMap,
					flowNum, sessionStaff);
			model.addAttribute("certPhoneNumRel", certPhoneNumRelList);
			if(ResultCode.R_SUCCESS.equals(certPhoneNumRelList.get("code"))){
				httpSession.setAttribute("enCertNumFive", certPhoneNumRelList.get("enCertNum"));
				httpSession.setAttribute("enCertAddressFive", certPhoneNumRelList.get("enCertAddress"));
				httpSession.setAttribute("enCustNameFive", certPhoneNumRelList.get("enCustName"));
			}else{
	    		return super
						.failedStr(model, ErrorCode.QUERY_CMP, contractRootMap, paramMap);
	    	}
			
		} catch (BusinessException e) {
			this.log.error("查询信息失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap,
					ErrorCode.QUERY_CMP);
		} catch (Exception e) {
			return super
					.failedStr(model, ErrorCode.QUERY_CMP, e, paramMap);
		}
		
		Map<String, Object> m = new HashMap<String, Object>();
		m.put("partyTypeCd", -1);
		Map<String, Object> rMap;
		try {
			rMap = this.custBmo.queryCertType(m, flowNum, sessionStaff);
			List<Map<String, Object>> map = (List<Map<String, Object>>) rMap.get("result");
			for (Map<String, Object> t : map) {
				if (userList.get("certType") !=null && userList.get("certType").equals(MapUtils.getString(t, "certTypeCd", ""))) {
					userList.put("certTypeName", MapUtils.getString(t, "name", ""));
					
				}
				if (certPhoneNumRelList.get("certType") !=null && certPhoneNumRelList.get("certType").equals(MapUtils.getString(t, "certTypeCd", ""))) {
					certPhoneNumRelList.put("certTypeName", MapUtils.getString(t, "name", ""));
				}
			}
			
		}catch (Exception e) {
			
		}
		
		if(ResultCode.R_SUCCESS.equals(userList.get("code")) && ResultCode.R_SUCCESS.equals(certPhoneNumRelList.get("code"))){
			if(userList.get("enCertNum")!=null && certPhoneNumRelList
					.get("enCertNum")!=null && userList.get("certType")!=null && certPhoneNumRelList
					.get("certType")!=null){
				isEqual = userList.get("enCertNum").equals(certPhoneNumRelList
					.get("enCertNum")) &&  userList.get("certType").equals(certPhoneNumRelList
						.get("certType"));
			}
			// 证件号码秘钥 和 证件类型
			model.addAttribute("isSucceed", "y");
		}
		model.addAttribute("isEqual", isEqual? "y" : "n");
		httpSession.setAttribute("isRepairFive", isEqual? "y" : "n");
		return "/repair/user-repair-list";
	}
	/**
	 * 修复信息 updateUserInfo
	 * @param model
	 * @param request
	 * @param session
	 * @return
	 */
	@RequestMapping(value = "/updateUserInfo", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse updateUserInfo(@RequestBody Map<String, Object> param,Model model,@LogOperatorAnn String flowNum,HttpSession httpSession) {
		JsonResponse jsonResponse = null;

		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> contractRootMap = (Map<String, Object>) param.get("ContractRoot");
		
//		String isRepair = (String)contractRootMap.get("isRepairFive");
//		String isRepairFive = (String) ServletUtils.getSessionAttribute(super.getRequest(), "isRepairFive");
//		if(!isRepair.equals(isRepairFive)){
//			return super.failed("非法操作！",ResultConstant.FAILD.getCode());
//		}
		
		
		Map<String, Object> svcContMap = (Map<String, Object>) contractRootMap.get("SvcCont");
		Map<String, Object> certPhoneNumRelMap = (Map<String, Object>) svcContMap.get("certPhoneNumRel");
		
		
		if(StringUtils.isBlank(certPhoneNumRelMap.get("actionType") +"") && StringUtils.isNotBlank(certPhoneNumRelMap.get("certType1") +"")  && StringUtils.isNotBlank(certPhoneNumRelMap.get("certType") + "")){
		    certPhoneNumRelMap.put("actionType", "MOD");//
		 }
		String enCertNum = (String) ServletUtils.getSessionAttribute(super.getRequest(), "enCertNum");
		certPhoneNumRelMap.put("enCertNum", enCertNum ==null?"":enCertNum);
		
		String enCustName = (String) ServletUtils.getSessionAttribute(super.getRequest(), "enCustName");
		certPhoneNumRelMap.put("enCustName", enCustName==null?"":enCustName);
		
		String enCertAddress = (String) ServletUtils.getSessionAttribute(super.getRequest(), "enCertAddress");
		certPhoneNumRelMap.put("enCertAddress", enCertAddress==null?"":enCertAddress);
		
		
		if("MOD".equals(certPhoneNumRelMap.get("actionType"))){
			String enCertNumFive = (String) ServletUtils.getSessionAttribute(super.getRequest(), "enCertNumFive");
			certPhoneNumRelMap.put("enCertNum", enCertNumFive==null?"":enCertNumFive) ;
			certPhoneNumRelMap.put("enCertNum1", enCertNum ==null?"":enCertNum) ;
		}
		if("DEL".equals(certPhoneNumRelMap.get("actionType"))){
			String enCertNumFive = (String) ServletUtils.getSessionAttribute(super.getRequest(), "enCertNumFive");
			String enCertAddressFive = (String) ServletUtils.getSessionAttribute(super.getRequest(), "enCertAddressFive");
			String enCustNameFive = (String) ServletUtils.getSessionAttribute(super.getRequest(), "enCustNameFive");
			certPhoneNumRelMap.put("enCertNum", enCertNumFive==null?"":enCertNumFive) ;
			certPhoneNumRelMap.put("enCertAddress", enCertAddressFive ==null?"":enCertAddressFive) ;
			certPhoneNumRelMap.put("enCustName", enCustNameFive ==null?"":enCustNameFive) ;
		}
		
		
		
	    Map<String, Object> rMap = new HashMap<String, Object>();
		
		try {
			rMap = cmBmo.updateUserInfo(param, null, sessionStaff);
			if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())){
				return super.successed("修复成功！");
			} else{
				jsonResponse = super.failed(rMap.get("msg").toString(),ResultConstant.FAILD.getCode());
			}
		} catch (InterfaceException ie) {
			jsonResponse = super.failed(ie, param,ErrorCode.UPDATE_USER_INO);
		} catch (IOException e) {
			jsonResponse = super.failed(ErrorCode.UPDATE_USER_INO, e, param);
		} catch (Exception e) {
			jsonResponse = super.failed(ErrorCode.UPDATE_USER_INO, e, param);
		}		
		return jsonResponse;
	}
	private void removeAttribute(HttpSession httpSession) {
		httpSession.removeAttribute("enCertNum");
		httpSession.removeAttribute("enCertNumFive");
	    httpSession.removeAttribute("enCertAddress");
		httpSession.removeAttribute("enCertAddressFive");
		httpSession.removeAttribute("enCustName");
		httpSession.removeAttribute("enCustNameFive");
		httpSession.removeAttribute("isRepairFive");
	}
}

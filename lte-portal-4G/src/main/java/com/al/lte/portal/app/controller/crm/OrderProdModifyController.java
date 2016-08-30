package com.al.lte.portal.app.controller.crm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
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
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
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
@Controller("com.al.lte.portal.app.controller.crm.OrderProdModifyController")
@RequestMapping("/app/prodModify/*")
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
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;

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
			paramMap.put("_test_appFlag", "app_fandang");
			datamap = this.custBmo.queryCustDetail(paramMap, optFlowNum,
					sessionStaff);
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
					model.addAttribute("partyContactInfos",
							partyContactInfoList);
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

		return "/app/order/cust-activie-return";
	}

	
/**
 * 补换卡选择完套餐后点击下一步（查询按钮变下一步按钮后第一次事件）
 * @param params
 * @param model
 * @param optFlowNum
 * @param response
 * @param httpSession
 * @return
 */
	@RequestMapping(value = "/toCheckUimUI", method = {RequestMethod.POST})
	public String toCheckUimUI(@RequestBody Map<String, Object> params, Model model, @LogOperatorAnn String optFlowNum,
            HttpServletResponse response, HttpSession httpSession) {
		return "/app/changeCard/order-change-card";		
	}
	@RequestMapping(value = "/changeCard", method = RequestMethod.POST)
	public String changeCard(@RequestBody Map<String, Object> param,Model model,HttpSession session,@LogOperatorAnn String flowNum) {
		model.addAttribute("prodId",param.get("prodId"));
		return "/app/changeCard/order-uim";		
	}

	
	/**
     * 账户查询
     * @param param
     * @param model
     * @param optFlowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/queryAccountInfo", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryAccountInfo(@RequestBody Map<String, Object> param, Model model,
			@LogOperatorAnn String optFlowNum, HttpServletResponse response) {

    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
	    Map<String, Object>  map=null;
	    // 拼接入参
	 		Map<String, Object> paramMap = new HashMap<String, Object>();
	 		paramMap.put("prodId", param.get("prodId"));
	 		paramMap.put("acctNbr", param.get("acctNbr"));
	 		paramMap.put("areaId", param.get("areaId"));
        try {
        	map = this.orderBmo.queryProdAcctInfo(paramMap, optFlowNum, sessionStaff);
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)){
				jsonResponse = super.successed(map,ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(map,ResultConstant.FAILD.getCode());
			}
        }catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_ACCT);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_ACCT, e, paramMap);
		}
		return jsonResponse;

	}
    
    /**
     * 前置校验接口
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/preCheckBeforeOrde", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse preCheckBeforeOrde(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum,HttpServletResponse response,HttpServletRequest request){
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object>  map=null;
		//参数拼接
		paramMap.put("channelId", sessionStaff.getCurrentChannelId());
		paramMap.put("channelNbr", sessionStaff.getCurrentChannelCode());
		paramMap.put("salesCode", sessionStaff.getSalesCode());
		paramMap.put("staffCode", sessionStaff.getStaffCode());
		HttpSession session = request.getSession();
		String areaId = (String) session.getAttribute("preAreaID");
		String PCCustId = (String) session.getAttribute("preCustId");
		String PCAccNbr = (String) session.getAttribute("preAccNbr");
		if ("".equals(PCCustId) || PCCustId == null || PCAccNbr == null
				|| "".equals(PCAccNbr)) {
			return super.failed("前置校验参数有误！", ResultConstant.FAILD.getCode());
		}
		paramMap.put("custId", PCCustId);
		paramMap.put("accNbr", PCAccNbr);
		if (!"".equals(areaId) && areaId != null) {
			paramMap.put("areaId", areaId.substring(0, 5) + "00");
		} else {
			areaId = sessionStaff.getAreaId();
			paramMap.put("areaId", areaId.substring(0, 5) + "00");
		}
		try {
        	map = this.orderBmo.preCheckBeforeOrde(paramMap, flowNum, sessionStaff);
        	Map<String, Object>  retMap = new HashMap<String, Object>();
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)){
				Map<String, Object> datamap = (Map<String, Object>) map.get("result");
				if(datamap !=null){
					boolean flag = false;
					String type = "0";
					StringBuffer sbcheck = new StringBuffer("");
					StringBuffer sbXZ = new StringBuffer("");
					List<Map<String, Object>> checkResultList = null;
                     if (datamap.get("checkResult") != null) {
                         Object obj = datamap.get("checkResult");
                         if (obj instanceof List) {
                        	 checkResultList = (List<Map<String, Object>>) obj;
                         } else {
                        	 checkResultList = new ArrayList<Map<String, Object>>();
                        	 checkResultList.add((Map<String, Object>) obj);
                         }
                         for(Map<String, Object> checkResult : checkResultList){
     						String checkLevel = (String) checkResult.get("checkLevel");
     						String checkInfo = (String) checkResult.get("checkInfo");
     						if("10".equals(checkLevel)){
     							sbcheck.append(checkInfo).append(",");
     							type = "10";
     						}else if("20".equals(checkLevel)){
     							sbXZ.append(checkInfo).append(",");
     							flag = true;
     						}
     					}
                    }
					if(flag){
						retMap.put("checkLevel", "20");
						retMap.put("checkInfo", sbXZ);
					}else if(type.equals("10")){
						retMap.put("checkLevel", "10");
						retMap.put("checkInfo", sbcheck);
					}else{
						retMap.put("checkLevel", "0");
					}
				}else{
					retMap.put("checkLevel", "0");
				}
				jsonResponse = super.successed(retMap,ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(map,ResultConstant.FAILD.getCode());
			}
        }catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.PRE_CHECK_ORDER);
		} catch (Exception e) {
			return super.failed(ErrorCode.PRE_CHECK_ORDER, e, paramMap);
		}
		return jsonResponse;
    }
}

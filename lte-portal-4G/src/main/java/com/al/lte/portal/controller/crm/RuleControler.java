package com.al.lte.portal.controller.crm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.annotation.session.SessionValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.RuleBmo;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.controller.crm.BaseController")
@RequestMapping("/rule/*")
@AuthorityValid(isCheck = false)
public class RuleControler extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.RuleBmo")
	private RuleBmo ruleBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/prepare", method = { RequestMethod.POST })
	@ResponseBody
	public JsonResponse checkRulePrepare(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response,@LogOperatorAnn String flowNum) throws BusinessException{
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		//填充areaId、channelId、staffId，redmine 24000
		param.put("areaId", sessionStaff.getAreaId());
		param.put("channelId", sessionStaff.getCurrentChannelId());
		param.put("staffId", sessionStaff.getStaffId());
		
		if (log.isDebugEnabled()){
			log.debug("规则校验入参{}", JsonUtil.toString(param));
		}
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
    	Map<String, Object> prodMap = new HashMap<String, Object>();
    	Map<String, Object> ruleMap = new HashMap<String, Object>();
    	Object boInfosObj = null;
		JsonResponse jsonResponse = null;
		
		try {
			String boActionTypeCd = "";
			resultMap = ruleBmo.checkRulePrepare(param, flowNum, sessionStaff);
			/*prodMap = MapUtils.getMap(param, "prodInfo");
			if (MapUtils.isNotEmpty(prodMap)){
				String prodStateCd = MapUtils.getString(prodMap, "prodStateCd");
				String stopRecordCd = MapUtils.getString(prodMap, "stopRecordCd");
				boInfosObj = MapUtils.getObject(param, "boInfos");
				if (boInfosObj instanceof List){
					Object obj = ((List) boInfosObj).get(0);
					if (obj instanceof Map){
						boActionTypeCd = MapUtils.getString((Map)obj, "boActionTypeCd");
					}
				}
				if (StringUtils.isNotBlank(prodStateCd)&&StringUtils.isNotBlank(boActionTypeCd)){
					ruleMap.put("boActionTypeCd", boActionTypeCd);
					ruleMap.put("prodStateCd", prodStateCd);
					if (StringUtils.isNotBlank(stopRecordCd)){
						ruleMap.put("stopRecordCd", stopRecordCd);	
					}
					//先进行门户侧规则校验，校验通过再调用CRM后台规则校验
					resultMap = orderBmo.checkProdRule(ruleMap, flowNum, sessionStaff);
				}
				if (MapUtils.isEmpty(resultMap)){
					param.remove("prodInfo");
					resultMap = ruleBmo.checkRulePrepare(param, flowNum, sessionStaff);
				}
			}else{
				resultMap = ruleBmo.checkRulePrepare(param, flowNum, sessionStaff);
			}*/
			jsonResponse = super.successed(resultMap, ResultConstant.SUCCESS.getCode());

		} catch (BusinessException be) {
			this.log.error("客户级业务规则校验失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.CHECK_RULE);
		} catch (Exception e) {
			log.error("门户/rule/prepare方法异常", e);
			return super.failed(ErrorCode.CHECK_RULE, e, param);
		}
		return jsonResponse;
	}
}

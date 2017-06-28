package com.al.lte.portal.app.controller.crm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.RuleBmo;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.app.controller.crm.RuleControler")
@RequestMapping("/app/rule/*")
@AuthorityValid(isCheck = false)
public class RuleControler extends BaseController {
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.RuleBmo")
	private RuleBmo ruleBmo;
	
	@RequestMapping(value = "/prepare", method = { RequestMethod.POST })
	public String checkRulePrepare(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response,@LogOperatorAnn String flowNum) throws BusinessException{
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			Map<String, Object> ruleMap = ruleBmo.checkRulePrepare(param, flowNum, sessionStaff);
			Map<String, Object> result = MapUtils.getMap(ruleMap, "result");
			List<Map<String, Object>> resultInfo=(List<Map<String,Object>>)result.get("resultInfo");
			if(resultInfo!=null&&(!resultInfo.isEmpty())){
				resultMap.put("ruleMap", result);
				model.addAttribute("validatoResutlMap", resultMap);
			}else{
				model.addAttribute("code", "0");
			}
		} catch (BusinessException be) {
			this.log.error("客户级业务规则校验失败", be);
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.CHECK_RULE);
		} catch (Exception e) {
			log.error("门户/rule/prepare方法异常", e);
			return super.failedStr(model,ErrorCode.CHECK_RULE, e, param);
		}
		if(param.get("newFlag")!=null){
			return "/app/rule/new_rule";
		}
		return "/app/rule/rulecheck";
	}
}

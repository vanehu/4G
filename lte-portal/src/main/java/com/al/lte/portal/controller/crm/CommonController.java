package com.al.lte.portal.controller.crm;

import java.util.ArrayList;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;


/**
 * 公用模块控制层
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.crm.CommonController")
@RequestMapping("/common/*")
public class CommonController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;

	/**
	 * 获取随机码
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/getToken", method = RequestMethod.GET)
	@ResponseBody
    public String getToken(HttpServletRequest request){
		String random = UIDGenerator.getUIDByTime();
		ServletUtils.getSession(request).setAttribute(SysConstant.ORDER_SUBMIT_TOKEN, random);
		return random;
    }
	
	/**
	 * 修改号码UIM状态
	 * @param param
	 * @param model
	 * @param response
	 * @param optFlowNum
	 * @return
	 */
	@RequestMapping(value = "/updateResState", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse updateResState(@RequestParam("strParam") String param,
			Model model, HttpServletResponse response,
			@LogOperatorAnn String optFlowNum){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	ArrayList paramList =  JsonUtil.toObject(param, ArrayList.class);
        	Map<String, Object> resMap = commonBmo.updateResState(paramList,optFlowNum, sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException e) {
        	log.error("修改号码UIM状态失败", e);
        } catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
		return jsonResponse;
	}
	
}

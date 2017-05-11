package com.al.lte.portal.app.controller.crm;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
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
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 翼销售主副卡成员变更
 * 
 * @author yanghm
 * @version V1.0 2017-03-27
 * @createDate 2017-03-27 上午10:03:44 
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.app.controller.crm.CardMemberChangeController")
@RequestMapping("/app/order/prodoffer/memberchange/*")
public class CardMemberChangeController extends BaseController{
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.print.PrintBmo")
	private PrintBmo printBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
	private MktResBmo MktResBmo;
	

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	/**
	 * 手机客户端-规则校验
	 * @param params
	 * @param model
	 * @param optFlowNum
	 * @param response
	 * @param httpSession
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/rulecheck", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String rulecheck(@RequestBody Map<String, Object> params, Model model, @LogOperatorAnn String optFlowNum, HttpSession httpSession) throws BusinessException {
		String result = null;
		Map<String, Object> param = new HashMap<String, Object>();
		try {
			String prodIdInfos=params.get("prodIdInfos").toString().replace("\\", "");
			String custInfos=params.get("custInfos").toString().replace("\\", "");
			String staffInfos=params.get("staffInfos").toString().replace("\\", "");
			param=CommonMethods.getParams(prodIdInfos, custInfos, staffInfos, getRequest());
			param.put("actionFlag", Const.OFFERCHANGE_FLAG);
			param.put("olTypeCd", "15");
			Map<String, Object> validatoResutlMap=commonBmo.validatorRule(param, optFlowNum, super.getRequest());
			if(!ResultCode.R_SUCCESS.equals(validatoResutlMap.get("code"))){
				model.addAttribute("validatoResutlMap", validatoResutlMap);
//				return "/app/rule/rulecheck";
				result = "/app/rule/rulecheck";
			}
			model.addAttribute("flag", Const.OFFERCHANGE_FLAG);
			model.addAttribute("soNbr", param.get("soNbr"));
		} catch (BusinessException e) {
			return super.failedStr(model, e);
		} catch (InterfaceException ie) {
        	return super.failedStr(model, ie, param, null);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.LOAD_INST, e,
					param);
		}
		
		return result;
    }
	
	/**
	 * 手机客户端-主副卡成员变更入口
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 * @throws BusinessException 
	 */
	@RequestMapping(value = "/prepare", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String memberChangePrepare(@RequestBody Map<String, Object> params, HttpServletRequest request,Model model, @LogOperatorAnn String optFlowNum,HttpSession session) throws BusinessException {
		String result = rulecheck(params,model,optFlowNum,session);
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String channelCode =sessionStaff.getCurrentChannelCode();
    	model.addAttribute("channelCode", channelCode);
		if(result != null){
			return result;
		}else return "/app/member/card-change";
    }
	
  //查询主卡或者副卡附属
	@RequestMapping(value = "/queryCardAttachOffer", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryCardAttachOffer(@RequestParam Map<String, Object> paramMap) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
			//已订购附属销售品查询
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(openMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
}

package com.al.lte.portal.app.controller.crm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.collections.map.HashedMap;
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

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
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
 * 翼销售橙分期业务
 * 
 * @author yanghm
 * @version V1.0 2016-12-02
 * @createDate 2016-12-02 上午10:03:44 
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.app.controller.crm.OrangeController")
@RequestMapping("/app/orange/*")
public class OrangeController extends BaseController{
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
	 * 手机客户端-橙分期入口
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 * @throws BusinessException 
	 */
	@RequestMapping(value = "/orange-offer", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String orangePrepare(@RequestBody Map<String, Object> params, HttpServletRequest request,Model model, @LogOperatorAnn String optFlowNum,HttpSession session) throws BusinessException {
		String result = rulecheck(params,model,optFlowNum,session);
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String channelCode =sessionStaff.getCurrentChannelCode();
    	String channelName=sessionStaff.getCurrentChannelName();
    	String areaName=sessionStaff.getCurrentAreaName();
    	model.addAttribute("channelCode", channelCode);
    	model.addAttribute("channelName", channelName);
    	model.addAttribute("areaName", areaName);
		if(result != null){
			return result;
		}else return "/app/orange/orange-offer";
    }
	
	/**
	 * 查询橙分期合约包
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryCanBuyOrange", method = {RequestMethod.POST})
	public @ResponseBody JsonResponse queryCanBuyOrange(@RequestBody Map<String, Object> param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = offerBmo.queryCanBuyAttachSpec(param,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, param, ErrorCode.ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.ATTACH_OFFER, e, param);
		}
        return jsonResponse;
	}
	
    /**
     * 与翼支付消费金融平台--高级实名认证
     * @param session
     * @return 高级实名认证结果
     */
    @RequestMapping(value = "/highRealNameAuthenticate", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse highRealNameAuthenticate(@RequestBody Map<String, Object> param, @LogOperatorAnn String optFlowNum, HttpSession session) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> retMap=new HashedMap();
        Map<String, Object> custInfo;
        JsonResponse jsonResponse = null;
        Map<String, Object> paramMap = new HashedMap();
        try {
            String tmpIdCardNumber = MapUtils.getString(param, "certNumber", "");
            paramMap.put("identityCd", "");
            paramMap.put("areaId", MapUtils.getString(param, "areaId", ""));
            paramMap.put("acctNbr", MapUtils.getString(param, "number", ""));
            paramMap.put("soNbr", MapUtils.getString(param, "soNbr", ""));
            paramMap.put("staffId", sessionStaff.getStaffId());
            boolean isCertUser = false;
            custInfo = custBmo.queryCustInfo(paramMap,
                    optFlowNum, sessionStaff);
            if(null!=custInfo){
                List<Map<String, Object>> custInfos = (List<Map<String, Object>>) MapUtils.getObject(custInfo, "custInfos", null);
                if(null!=custInfos&&custInfos.size()==1){
                    Map<String, Object> cust = custInfos.get(0);
                    if(null!=cust){
                        String identityCd = MapUtils.getString(cust, "identityCd", "");
                        if("1".equals(identityCd)){
                            isCertUser = true;
                        }
                    }
                }
            }
            if (isCertUser) {
                String areaId = MapUtils.getString(param, "areaId", "");
                Map<String, Object> hrnParam = new HashedMap();

                Map<String, Object> body = new HashedMap();
                body.put("userName", MapUtils.getString(param, "userName", ""));
                body.put("idType", MapUtils.getString(param, "idType", ""));
                body.put("idNumber", MapUtils.getString(param, "certNumber", ""));
                body.put("accountNumber", MapUtils.getString(param, "number", ""));
                body.put("acceptAreaCode", (StringUtils.isNotBlank(areaId) && areaId.length() == 7) ? MapUtils.getString(param, "areaId", "").substring(1, 3) + "0000" : "");
                body.put("acceptCityCode", (StringUtils.isNotBlank(areaId) && areaId.length() == 7) ? MapUtils.getString(param, "areaId", "").substring(1) : "");
                body.put("superMerchantCode", sessionStaff.getCurrentChannelCode());
                body.put("superMerchantName", MapUtils.getString(param, "channelName", ""));

                hrnParam.put("body", body);

                Map<String, Object> returnMap = orderBmo.highRealNameAuthenticate(hrnParam, optFlowNum, sessionStaff);
                if (null != returnMap) {
                    retMap = MapUtils.getMap(returnMap, "result");
                    jsonResponse=super.successed(retMap, ResultConstant.SUCCESS.getCode());
                }
            } else {
            	jsonResponse = super.failed("翼支付账户资料信息中证件类型不是身份证！",
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.HIGH_REAL_NAME_AUTHENTICATE);
        } catch (Exception e) {
            log.error("门户调用后台高级实名制认证接口service/intf.acctService/highRealNameAuthenticate方法异常", e);
            return super.failed(ErrorCode.HIGH_REAL_NAME_AUTHENTICATE, e, param);
        }     
        return jsonResponse;
    }
}

package com.al.lte.portal.app.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.CollectionUtils;
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
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MapUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.annotation.session.SessionValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.Base64;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 */
@Controller("com.al.lte.portal.app.controller.crm.CustController")
@RequestMapping("/app/cust/*")
@AuthorityValid(isCheck = false)
public class CustController extends BaseController {

	@Autowired
	PropertiesUtils propertiesUtils;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;
	
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
    private CustBmo custBmo;
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;
    
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
    private MktResBmo mktResBmo;
    
    /**
	 * 新增客户订单查询页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/custQueryAdd", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String custQueryAdd(Model model,HttpSession session,@LogOperatorAnn String flowNum) {
		
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String startTime = f.format(c.getTime());
		
		model.addAttribute("p_startDt", startTime);
		model.addAttribute("p_endDt", startTime);
		
		return "/app/cust/cust-queryAdd";		
	}
	
	/**
	 * 新增客户订单查询列表页面
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/custQueryAddList", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String custQueryAddList(@RequestBody Map<String, Object> paramMap,Model model,HttpSession session,@LogOperatorAnn String flowNum) {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        
        param.put("startDate", paramMap.get("startDt"));
		param.put("endDate", paramMap.get("endDt"));
		param.put("areaId", sessionStaff.getCurrentAreaId());
		param.put("staffId", sessionStaff.getStaffId());
		param.put("olType", "15");
		param.put("boActionTypeCd", "");//新增：C1   反档：1020500000     为空：都查
		try{
    		nowPage = Integer.parseInt(paramMap.get("nowPage").toString());
    		pageSize = Integer.parseInt(paramMap.get("pageSize").toString());
    		param.put("nowPage", nowPage);
    		param.put("pageSize", pageSize);
    		
    		DataBus db = InterfaceClient.callService(param, PortalServiceCode.QUERY_CUST_MODIFY_LIST,null, sessionStaff);
    		Map<String, Object> resultMap = db.getReturnlmap();
    		Map<String, Object> map = (Map<String, Object>) resultMap.get("result");
    		totalSize = (Integer) map.get("totalSize");
    		if(map!=null&&map.get("custOrder")!=null){
        		list =(List<Map<String, Object>>)map.get("custOrder");
    		}
    		PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
            		nowPage,
            		pageSize,
            		totalSize<1?1:totalSize,
    				list);
    		model.addAttribute("pageModel", pm);
		}catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.CUST_ORDER);
		} catch (Exception e) {
			log.error("新增客户订单查询/app/cust/custQueryAddList方法异常", e);
			return super.failedStr(model, ErrorCode.QUERY_CUST, e, param);
		}
		return "/app/cust/cust-queryAdd-list";		
	}
	
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/queryCust", method = { RequestMethod.POST })
    public String queryCust(@RequestBody Map<String, Object> paramMap, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response, HttpSession httpSession) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> resultMap = new HashMap<String, Object>();
        httpSession.setAttribute("ValidateAccNbr", null);
        httpSession.setAttribute("ValidateProdPwd", null);
        httpSession.setAttribute("queryCustAccNbr", paramMap.get("acctNbr"));
        //客户鉴权跳过 权限查询
        String iseditOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_JUMPAUTH + "_" + sessionStaff.getStaffId());
        try {
            if (iseditOperation == null) {
                iseditOperation = this.staffBmo.checkOperatSpec(SysConstant.JUMPAUTH_CODE, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_JUMPAUTH + "_"
                        + sessionStaff.getStaffId(), iseditOperation);
            }
        } catch (BusinessException e) {
            iseditOperation = "1";
        } catch (InterfaceException ie) {
            iseditOperation = "1";
        } catch (Exception e) {
            iseditOperation = "1";
        }
        model.addAttribute("jumpAuthflag", iseditOperation);

        String areaId = (String) paramMap.get("areaId");
        if (("").equals(areaId) || areaId == null) {
            paramMap.put("areaId", sessionStaff.getCurrentAreaId());
        }
        paramMap.put("staffId", sessionStaff.getStaffId());
        if (StringUtils.isNotBlank(MapUtils.getString(paramMap, "custQueryType"))) {
            httpSession.setAttribute("custQueryType", paramMap.get("custQueryType"));
        } else {
            httpSession.setAttribute("custQueryType", "");
        }
        try {
            resultMap = custBmo.queryCustInfo(paramMap, flowNum, sessionStaff);
            if (MapUtils.isNotEmpty(resultMap)) {
                List<Map<String, Object>> custInfos = new ArrayList<Map<String, Object>>();
                custInfos = (List<Map<String, Object>>) resultMap.get("custInfos");
                model.addAttribute("custInfoSize", custInfos.size());
                model.addAttribute("cust", resultMap);
            }
            if (paramMap.containsKey("query")) {
                model.addAttribute("query", paramMap.get("query")); //综合查询调用标志
            }
            return "/app/cust/cust-list";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CUST);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_CUST, e, paramMap);
        }

    }

    
	@RequestMapping(value = "/queryoffercust", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryoffercust(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
		Map<String, Object> resultMap = null;
		JsonResponse jsonResponse = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId=(String) paramMap.get("areaId");
		if(("").equals(areaId)||areaId==null){
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		}
		paramMap.put("staffId", sessionStaff.getStaffId());
		try {
			resultMap = custBmo.queryCustInfo(paramMap,
					flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(resultMap)) {
				jsonResponse = super.successed(resultMap,ResultConstant.SUCCESS.getCode());
			}
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, resultMap, ErrorCode.QUERY_CUST);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_CUST, e, resultMap);
		}
		return jsonResponse;
    }
	@RequestMapping(value = "/offerorderprod", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse offerorderprod(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
		Map<String, Object> datamap = null;
		JsonResponse jsonResponse = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> list = null;
		String areaId=(String) param.get("areaId");
		if(areaId==null||areaId.equals("")){
			areaId=sessionStaff.getCurrentAreaId();
		}
		Map paramMap =new HashMap();
		paramMap.put("areaId", areaId);
		paramMap.put("acctNbr", param.get("acctNbr"));
		paramMap.put("custId", param.get("custId"));
		paramMap.put("curPage", param.get("curPage"));
		String pageSize = "";
        pageSize=(String) param.get("pageSize");
        if("".equals(pageSize)){
        	pageSize="5";
        }
        paramMap.put("pageSize", pageSize);
		try {
			datamap = this.custBmo.queryCustProd(paramMap,
					flowNum, sessionStaff);
			String code = (String) datamap.get("resultCode");
			if (ResultCode.R_SUCC.equals(code)) {
				Map<String, Object> temMap=(Map) datamap.get("result");
				list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
				jsonResponse = super.successed(list,ResultConstant.SUCCESS.getCode());
			}
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, datamap, ErrorCode.ORDER_PROD);
		} catch (Exception e) {
			return super.failed(ErrorCode.ORDER_PROD, e, datamap);
		}
		return jsonResponse;
    }
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/checkIdentity", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkIdentity(@RequestBody Map<String, Object> paramMap, @LogOperatorAnn String flowNum) {
        Map<String, Object> resultMap = null;
        JsonResponse jsonResponse = null;
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String areaId = MapUtils.getString(paramMap, "areaId");
        if (StringUtils.isBlank(areaId)) {
            paramMap.put("areaId", sessionStaff.getCurrentAreaId());
        }
        paramMap.put("staffId", sessionStaff.getStaffId());
        List<Map<String, Object>> list = null;
        try {
            resultMap = this.custBmo.queryCustInfo(paramMap, flowNum, sessionStaff);
            if (resultMap != null) {
                list = (List<Map<String, Object>>) resultMap.get("custInfos");
                if (CollectionUtils.isNotEmpty(list)) {
                    jsonResponse = super.successed("系统已存在此客户", ResultConstant.SUCCESS.getCode());
                } else {
                    jsonResponse = super.failed(resultMap, ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
                }
            } else {
                jsonResponse = super.failed(resultMap, ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, resultMap, ErrorCode.QUERY_CUST);
        } catch (Exception e) {
            this.log.error("客户定位/cust/queryCust方法异常", e);
            return super.failed(ErrorCode.QUERY_CUST, e, resultMap);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/custAuth", method = { RequestMethod.POST })
    public String custAuth(@RequestBody Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response, HttpSession httpSession) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map map = new HashMap();
        Map paramMap = new HashMap();
        Map resultMap = new HashMap();
        String areaName = "";
        String identityCd = "";
        String idCardNumber = "";
        /*{accessNumber:'11969577',areaId:21,prodPwd:'000000'}*/
        paramMap.put("accessNumber", httpSession.getAttribute("queryCustAccNbr"));
        paramMap.put("prodPwd", param.get("prodPwd"));
        paramMap.put("areaId", param.get("areaId"));
        String authFlag = (String) param.get("authFlag");
        areaName = (String) param.get("areaName");
        if (areaName == null) {
            areaName = sessionStaff.getCurrentAreaAllName();
        }
        param.put("areaName", areaName);
        //身份证脱敏操作
        identityCd = (String) param.get("identityCd");
        idCardNumber = (String) param.get("idCardNumber");
        if (identityCd.equals("1")) {
            String isViewOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                    SysConstant.SESSION_KEY_VIEWSENSI + "_" + sessionStaff.getStaffId());
            try {
                if (isViewOperation == null) {
                    isViewOperation = staffBmo.checkOperatSpec(SysConstant.VIEWSENSI_CODE, sessionStaff);
                    ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_VIEWSENSI + "_"
                            + sessionStaff.getStaffId(), isViewOperation);
                }
            } catch (BusinessException e) {
                isViewOperation = "1";
            } catch (InterfaceException ie) {
                isViewOperation = "1";
            } catch (Exception e) {
                isViewOperation = "1";
            }
            Integer aa = idCardNumber.length();
            if (!isViewOperation.equals("0") && idCardNumber.length() == 18) {
                String preStr = idCardNumber.substring(0, 6);
                String subStr = idCardNumber.substring(14);
                idCardNumber = preStr + "********" + subStr;

            } else if (!isViewOperation.equals("0") && idCardNumber.length() == 15) {
                String preStr = idCardNumber.substring(0, 5);
                String subStr = idCardNumber.substring(13);
                idCardNumber = preStr + "********" + subStr;
            }
        }
        param.put("idCardNumber", idCardNumber);

        if ("0".equals(authFlag)) {
            try {
                map = custBmo.custAuth(paramMap, flowNum, sessionStaff);
                String resultCode = MapUtils.getString(map, "resultCode");
                String isValidateStr = MapUtils.getString(map, "isValidate");
                if ("true".equals(isValidateStr)) {
                    httpSession.setAttribute("ValidateAccNbr", paramMap.get("accessNumber"));
                    httpSession.setAttribute("ValidateProdPwd", paramMap.get("prodPwd"));
                }
            } catch (BusinessException be) {
                return super.failedStr(model, be);
            } catch (InterfaceException ie) {

                return super.failedStr(model, ie, paramMap, ErrorCode.CUST_AUTH);
            } catch (Exception e) {

                return super.failedStr(model, ErrorCode.CUST_AUTH, e, paramMap);
            }

        } else {
            map.put("isValidate", "true");
        }
        map.put("custInfo", param);
        model.addAttribute("custAuth", map);
        return "/app/cust/cust-info";
    }

    @ResponseBody
    @RequestMapping(value = "/passwordReset", method = RequestMethod.POST)
    public String passwordReset(@RequestParam Map<String, Object> param, Model model, HttpSession httpSession) {
        httpSession.setAttribute("ValidateAccNbr", null);
        httpSession.setAttribute("ValidateProdPwd", null);
        return "0";
    }

    /**
     * 客户创建入口-实名制客户创建入口
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/create", method = { RequestMethod.POST })
    public String custCreate(HttpServletRequest request,Model model) throws BusinessException {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	model.addAttribute("sessionStaff",JsonUtil.buildNormal().objectToJson(sessionStaff));
    	model.addAttribute("flag", "real");
    	model.addAttribute("currentCT", sessionStaff.getCurrentChannelType());
        return "/app/cust/cust-create";
    }
    
    /**
     * 客户创建入口
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/realCreate", method = { RequestMethod.POST })
    public String realCustCreate(HttpServletRequest request,Model model) throws BusinessException {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	model.addAttribute("sessionStaff",JsonUtil.buildNormal().objectToJson(sessionStaff));
    	model.addAttribute("currentCT", sessionStaff.getCurrentChannelType());
        return "/app/cust/cust-create";
    }
    
    /**
     * 客户创建入口
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/update", method = { RequestMethod.POST })
    public String custUpdate(@RequestBody Map<String, Object> params,HttpServletRequest request,
    		Model model,@LogOperatorAnn String optFlowNum) throws BusinessException {
    	
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
			/*Map<String, Object> validatoResutlMap=commonBmo.validatorRule(param, optFlowNum, super.getRequest());
			if(ResultCode.R_SUCCESS.equals(validatoResutlMap.get("code"))){
				model.addAttribute("validatoResutlMap", validatoResutlMap);
				return "/app/rule/rulecheck";
			}*/
			
			//客户详情查询
			paramMap.put("partyId", ((Map<String, Object>)param.get("custInfoMap")).get("custId"));
			paramMap.put("areaId", ((Map<String, Object>)param.get("custInfoMap")).get("areaId"));
			paramMap.put("_test_appFlag", "app_chuanjian");
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
        return "/app/cust/cust-update";
    }

    /**
     * 客户已订购业务-数据查询入口
     * @param param
     * @param model
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/orderProdPrepare", method = RequestMethod.GET)
    public String orderProdPrepare(@RequestParam Map<String, Object> param, HttpSession session, Model model) {
        String diffPlaceFlag = MapUtils.getString(param, "diffPlaceFlag", "");
        List<Map> businessLink = null;
        //菜单权限编码
        if (diffPlaceFlag.equals("local")) {
            businessLink = EhcacheUtil.getBusinessMenu(session, "YWSL");
        } else if (diffPlaceFlag.equals("diff")) {
            businessLink = EhcacheUtil.getBusinessMenu(session, "YDSL");
        }
        model.addAttribute("businessLink", businessLink);
        model.addAttribute("diffPlaceFlag", diffPlaceFlag);
        return "/app/cust/cust-order-prepare";
    }

    /**
     * 用于首页与分页查询
     * @param param
     * @param model
     * @param session
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/orderprod", method = RequestMethod.GET)
    public String orderprod(@RequestParam Map<String, Object> param, Model model, HttpSession session,
            @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        List<Map<String, Object>> list = null;
        if (param.containsKey("isPurchase")) {
            model.addAttribute("isPurchase", "1");
            param.remove("isPurchase");
        }
        String areaId = MapUtils.getString(param, "areaId", sessionStaff.getCurrentAreaId());
        Map paramMap = new HashMap();
        paramMap.put("areaId", areaId);
        paramMap.put("acctNbr", param.get("acctNbr"));
        paramMap.put("custId", param.get("custId"));
        paramMap.put("curPage", param.get("curPage"));
        String pageSize = MapUtils.getString(param, "pageSize", "8");
        paramMap.put("pageSize", pageSize);
        this.log.debug("param={}", JsonUtil.toString(paramMap));
        try {
            Map<String, Object> datamap = this.custBmo.queryCustProd(paramMap, flowNum, sessionStaff);
            this.log.debug("return={}", JsonUtil.toString(datamap));
            String code = MapUtils.getString(datamap, "resultCode", "");
            if (ResultCode.R_SUCC.equals(code)) {
                Map<String, Object> temMap = (Map) datamap.get("result");
                list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
                if (list == null) {
                    super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
                } else {
                    Map<String, Object> mktPageInfo = MapUtil.map(temMap, "page");
                    // 设置分页对象信息
                    PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(mktPageInfo,
                            "pageIndex", 1), MapUtils.getIntValue(mktPageInfo, "pageSize", 8), MapUtils.getIntValue(
                            mktPageInfo, "totalCount", 1), list);
                    model.addAttribute("pageModel", pm);
                }
            } else {
                model.addAttribute("msg", MapUtils.getString(datamap, "msg", "抱歉,没有找到已订购的业务！"));
            }
            model.addAllAttributes(param);
            return "/app/cust/cust-order-list";
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, paramMap, ErrorCode.ORDER_PROD);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.ORDER_PROD, e, paramMap);
        }

    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/queryprodbynbr", method = RequestMethod.GET)
    public String queryProdByNbr(@RequestParam Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        List<Map<String, Object>> list = null;
        Map paramMap = new HashMap();
        paramMap.put("areaId", sessionStaff.getCurrentAreaId());
        //paramMap.put("areaId", "21");//need modify
        paramMap.put("acctNbr", param.get("acctNbr"));
        paramMap.put("curPage", 1);
        int pageSize = 12;
        paramMap.put("pageSize", String.valueOf(pageSize));
        log.debug("param={}", JsonUtil.toString(paramMap));
        try {
            Map<String, Object> datamap = this.custBmo.queryCustProd(paramMap, flowNum, sessionStaff);
            log.debug("return={}", JsonUtil.toString(datamap));
            String code = (String) datamap.get("resultCode");
            if (ResultCode.R_SUCC.equals(code)) {
                Map<String, Object> temMap = (Map) datamap.get("result");
                list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
                model.addAttribute("prodinstlist", list);
            }
            return "/order/order-prodinst-list";
        } catch (BusinessException be) {
            this.log.error("查询号码信息失败", be);
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, paramMap, ErrorCode.ORDER_PROD);
        } catch (Exception e) {
            log.error("门户/cust/queryprodbynbr方法异常", e);
            return super.failedStr(model, ErrorCode.ORDER_PROD, e, paramMap);
        }
    }

    @RequestMapping(value = "/partyProfileSpecList", method = RequestMethod.GET)
    public String partyProfileSpecList(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) throws Exception {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Map<String, Object> dataBusMap = new HashMap<String, Object>();//规格

        Map result = null;
        List<Map<String, Object>> list = null;
        List<Map<String, Object>> temList = null;
        List<Map<String, Object>> tabList = null;
        List<Map<String, Object>> tabTempList = null;
        try {
            result = this.custBmo.custProfileSpecList(dataBusMap, null, sessionStaff);
            if (result.get("code").equals("0")) {
                //纳税 人权限查询
                String iseditOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_EDITTAXPAYER + "_" + sessionStaff.getStaffId());
                try {
                    if (iseditOperation == null) {
                        iseditOperation = staffBmo.checkOperatSpec(SysConstant.EDITTAXPAYER_CODE, sessionStaff);
                        ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_EDITTAXPAYER + "_"
                                + sessionStaff.getStaffId(), iseditOperation);
                    }
                } catch (BusinessException e) {
                    iseditOperation = "1";
                } catch (InterfaceException ie) {
                    iseditOperation = "1";
                } catch (Exception e) {
                    iseditOperation = "1";
                }
                list = (List<Map<String, Object>>) result.get("profileSpec");
                tabList = (List<Map<String, Object>>) result.get("tabList");
                temList = new ArrayList();
                model.addAttribute("result", result);
                if (list.size() > 0) {
                    for (int i = 0; i < list.size(); i++) {
                        String partyProfileCatgTypeCdStr = String.valueOf(list.get(i).get("partyProfileCatgTypeCd"));
                        if (partyProfileCatgTypeCdStr != null && !"".equals(partyProfileCatgTypeCdStr)) {
                            Integer partyProfileCatgTypeCd = Integer.valueOf(partyProfileCatgTypeCdStr);
                            if ((iseditOperation != "0" && partyProfileCatgTypeCd != 2) || iseditOperation == "0") {
                                temList.add(list.get(i));
                            }
                            ;
                        }

                    }
                    for (int i = 0; i < tabList.size(); i++) {
                        tabTempList = new ArrayList();
                        for (int j = 0; j < list.size(); j++) {
                            String partyProfileCatgTypeCdStr = String
                                    .valueOf(list.get(j).get("partyProfileCatgTypeCd"));
                            if (partyProfileCatgTypeCdStr != null && !"".equals(partyProfileCatgTypeCdStr)) {
                                Integer partyProfileCatgTypeCd = Integer.valueOf(partyProfileCatgTypeCdStr);
                                if (partyProfileCatgTypeCd != 3 || partyProfileCatgTypeCd != 2
                                        || (partyProfileCatgTypeCd == 2 && iseditOperation == "0")) {

                                    if (partyProfileCatgTypeCd == tabList.get(i).get("partyProfileCatgTypeCd")) {
                                        tabTempList.add(list.get(j));

                                    }

                                }
                            }

                        }
                        tabList.get(i).put("tabProfile", tabTempList);

                    }
                    model.addAttribute("code", 0);
                    model.addAttribute("profileSpec", temList);
                    model.addAttribute("profileTabList", tabList);
                    model.addAttribute("profileTabListJson", JsonUtil.buildNormal().objectToJson(tabList));
                    model.addAttribute("profileSpecJson", JsonUtil.buildNormal().objectToJson(temList));
                } else {
                    model.addAttribute("code", 1);
                    model.addAttribute("profileSpec", null);
                    model.addAttribute("profileTabList", null);
                }
            } else {
                model.addAttribute("code", result.get("code"));
            }
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {

            return super.failedStr(model, ie, dataBusMap, ErrorCode.QUERY_PARTYPROFILE);
        } catch (Exception e) {

            return super.failedStr(model, ErrorCode.QUERY_PARTYPROFILE, e, dataBusMap);
        }
        return "/app/cust/cust-query-profile";
    }

    /**
     * 根据员工类型查询员工证件类型
     * @param param 
     * @return List<Map>
     */
    @RequestMapping(value = "/queryCertType", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse queryCertType(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response, @LogOperatorAnn String flowNum) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        String resultList = null;
        try {
            rMap = this.custBmo.queryCertType(param, flowNum, sessionStaff);
            log.debug("return={}", JsonUtil.toString(rMap));
            resultList = rMap.get("result").toString();
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString()) && !"[]".equals(resultList)) {
                jsonResponse = super.successed(rMap.get("result"), ResultConstant.SUCCESS.getCode());
            } else if ("[]".equals(resultList)) {
                jsonResponse = super.failed("根据员工类型查询员工证件类型无数据", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            } else {
                jsonResponse = super.failed(rMap.get("msg").toString(), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("调用根据员工类型查询员工证件类型失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QUERY_CERTTYPE);
        } catch (Exception e) {
            log.error("门户/cust/queryCertType方法异常", e);
            return super.failed(ErrorCode.QUERY_CERTTYPE, e, param);
        }
    }

    /**
     * 转至客户信息查询
     * @param session
     * @param model
     * @return
     */
    @RequestMapping(value = "/preQueryCust", method = RequestMethod.GET)
    public String preQueryCust(HttpSession session, Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        model.addAttribute("defaultAreaName", sessionStaff.getCurrentAreaAllName());
        model.addAttribute("defaultAreaId", sessionStaff.getCurrentAreaId());

        model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "cust/preQueryCust"));
        return "/cust/cust-info-query";
    }

    /**
     * 客户资料查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     * @throws BusinessException
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/queryCustAlone", method = RequestMethod.GET)
    public String queryAccount(@RequestParam Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) throws BusinessException {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String areaId = (String) param.get("areaId");
        if (("").equals(areaId) || areaId == null) {
            param.put("areaId", sessionStaff.getCurrentAreaId());
        }
        param.put("staffId", sessionStaff.getStaffId());

        try {
            Map<String, Object> resultMap = custBmo.queryCustInfo(param, flowNum, sessionStaff);
            if (MapUtils.isNotEmpty(resultMap)) {
                List custInfos = new ArrayList();
                custInfos = (List<Map<String, Object>>) resultMap.get("custInfos");
                model.addAttribute("custInfos", custInfos);
                model.addAttribute("flag", 0);
            } else {
                model.addAttribute("flag", 1);
            }
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.QUERY_CUST);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_CUST, e, param);
        }
        return "/cust/cust-query-list";
    }

    /**
     * 客户详情查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/custInfo", method = { RequestMethod.POST })
    public String custInfo(@RequestBody Map<String, Object> param, Model model, @LogOperatorAnn String optFlowNum,
            HttpServletResponse response, HttpServletRequest request) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        if (!MapUtils.isEmpty(param)) {
            model.addAttribute("modifyCustInfo", param);
        }
        Map paramMap = new HashMap();
        paramMap.put("partyId", param.get("partyId"));
        paramMap.put("areaId", param.get("areaId"));
    	paramMap.put("_test_appFlag", "app_xianqing");
        String sussFlag = "";
        Map<String, Object> datamap = null;
        Map<String, Object> resultMap = null;
        Map<String, Object> partyListMap = null;
        Map<String, Object> profilesMap = null;
        List<Map<String, Object>> partyContactInfoList = null;
        try {
            datamap = this.custBmo.queryCustDetail(paramMap, optFlowNum, sessionStaff);
            log.debug("return={}", JsonUtil.toString(datamap));
            String code = (String) datamap.get("resultCode");
            List<Map<String, Object>> identitiesList = null;
            List<Map<String, Object>> profilesList = null;
            if (ResultCode.R_SUCC.equals(code)) {
                resultMap = MapUtils.getMap(datamap, "result");
                if (resultMap != null) {
                    String isViewOperation = EhcacheUtil.getOperatCode(SysConstant.VIEWSENSI_CODE,
                            SysConstant.SESSION_KEY_VIEWSENSI, request, sessionStaff);
                    model.addAttribute("isViewOperation", isViewOperation);
                    partyListMap = MapUtils.getMap(resultMap, "partyList");
                    profilesMap = MapUtils.getMap(resultMap, "profiles");
                    identitiesList = (List<Map<String, Object>>) partyListMap.get("identities");
                    profilesList = (List<Map<String, Object>>) partyListMap.get("profiles");
                    partyContactInfoList = (List<Map<String, Object>>) partyListMap.get("partyContactInfo");
                    model.addAttribute("result", resultMap);
                    model.addAttribute("identities", identitiesList);
                    model.addAttribute("profiles", profilesList);
                    model.addAttribute("profilesJson", JsonUtil.buildNormal().objectToJson(profilesList));
                    model.addAttribute("partyContactInfos", partyContactInfoList);

                }
            }
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {

            return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CUST_EXINFO);
        } catch (Exception e) {

            return super.failedStr(model, ErrorCode.QUERY_CUST_EXINFO, e, paramMap);
        }

        return "/cust/cust-query-detail";
    }

    @RequestMapping(value = "/mvnoCustCreate", method = RequestMethod.GET)
    public String mvnoCustCreate(Model model, HttpSession session) throws AuthorityException {
        model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "cust/mvnoCustCreate"));
        return "/cust/cust-create-main";
    }
    
    /**
     * 产品信息查询-提供给手机端调用的接口
     * @param param 
     * @return List<Map>
     */
    @RequestMapping(value = "/prodInfoQuery", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse prodInfoQuery(@RequestBody Map<String, Object> param, HttpServletRequest request,
            HttpServletResponse response, @LogOperatorAnn String flowNum) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        
        JsonResponse jsonResponse = null;
        String areaId = MapUtils.getString(param, "areaId", sessionStaff.getCurrentAreaId());
        Map paramMap = new HashMap();
        paramMap.put("areaId", areaId);
        paramMap.put("acctNbr", param.get("acctNbr"));
        paramMap.put("custId", param.get("custId"));
        paramMap.put("curPage", param.get("curPage"));
        String pageSize = MapUtils.getString(param, "pageSize", "8");
        paramMap.put("pageSize", pageSize);
        this.log.debug("param={}", JsonUtil.toString(paramMap));
        try {
            Map<String, Object> datamap = this.custBmo.queryCustProd(paramMap, flowNum, sessionStaff);
            this.log.debug("return={}", JsonUtil.toString(datamap));
            String code = MapUtils.getString(datamap, "resultCode", "");
            if (ResultCode.R_SUCC.equals(code)) {
                Map<String, Object> temMap = (Map) datamap.get("result");
                jsonResponse = super.successed(datamap.get("result"), ResultConstant.SUCCESS.getCode());
            } else {
            	jsonResponse = super.failed(MapUtils.getString(datamap, "msg", "抱歉,没有找到已订购的业务！"), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
            return jsonResponse;
        } catch (BusinessException be) {
            this.log.error("调用产品信息产品接口失败", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.ORDER_PROD);
        } catch (Exception e) {
            log.error("门户/app/cust/prodInfoQuery方法异常", e);
            return super.failed(ErrorCode.ORDER_PROD, e, param);
        }
    }

    /**
     * 客户信息查询-提供给手机客户端使用
     * @param paramMap
     * @param model
     * @param flowNum
     * @param response
     * @param httpSession
     * @return
     */
    @RequestMapping(value = "/queryCustInfo", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse queryCustInfo(@RequestBody Map<String, Object> paramMap,HttpServletRequest request,
            HttpServletResponse response,@LogOperatorAnn String flowNum) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> resultMap = new HashMap<String, Object>();
        HttpSession httpSession=request.getSession();
        httpSession.setAttribute("ValidateAccNbr", null);
        httpSession.setAttribute("ValidateProdPwd", null);
        httpSession.setAttribute("queryCustAccNbr", paramMap.get("acctNbr"));
        String qryAcctNbr=MapUtils.getString(paramMap,"acctNbr","");
        String soNbr=CommonMethods.getUUID();
        JsonResponse jsonResponse = null;
        //客户鉴权跳过 权限查询
        String iseditOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_JUMPAUTH + "_" + sessionStaff.getStaffId());
        try {
            if (iseditOperation == null) {
                iseditOperation = this.staffBmo.checkOperatSpec(SysConstant.JUMPAUTH_CODE, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_JUMPAUTH + "_"
                        + sessionStaff.getStaffId(), iseditOperation);
            }
        } catch (BusinessException e) {
            iseditOperation = "1";
        } catch (InterfaceException ie) {
            iseditOperation = "1";
        } catch (Exception e) {
            iseditOperation = "1";
        }
        
        //是否要脱敏 权限
        String isViewOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId());
		try{
 			if(isViewOperation==null){
 				isViewOperation=staffBmo.checkOperatSpec(SysConstant.VIEWSENSI_CODE,sessionStaff);
 				ServletUtils.setSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId(), isViewOperation);
 			}
			} catch (BusinessException e) {
				isViewOperation="1";
	 		} catch (InterfaceException ie) {
	 			isViewOperation="1";
			} catch (Exception e) {
				isViewOperation="1";
			}
        
        String areaId = (String) paramMap.get("areaId");
        if (("").equals(areaId) || areaId == null) {
            paramMap.put("areaId", sessionStaff.getCurrentAreaId());
        }
        paramMap.put("staffId", sessionStaff.getStaffId());
        if (StringUtils.isNotBlank(MapUtils.getString(paramMap, "custQueryType"))) {
            httpSession.setAttribute("custQueryType", paramMap.get("custQueryType"));
        } else {
            httpSession.setAttribute("custQueryType", "");
        }
      //政企客户证件类型查询,第一次查询完存入session以便后面再次使用
        List zqList = new ArrayList();
        if(httpSession.getAttribute("zqList")!=null){
        	zqList = (List) httpSession.getAttribute("zqList");
        }else{
        	Map<String, Object> zqParam = new HashMap<String, Object>();;
	        zqParam.put("partyTypeCd", 2);
	        Map<String, Object> rMap = null;
	        try {
				rMap = this.custBmo.queryCertType(zqParam, flowNum, sessionStaff);
				zqList = (List) rMap.get("result");
				httpSession.setAttribute("zqList", zqList);
	        }catch(BusinessException be){
				this.log.error("调用根据员工类型查询员工证件类型失败", be);
	   			return super.failed(be);
			} catch (InterfaceException ie) {
				return super.failed(ie, zqParam, ErrorCode.QUERY_CERTTYPE);
			} catch (Exception e) {
				log.error("门户/cust/queryCertType方法异常", e);
				return super.failed(ErrorCode.QUERY_CERTTYPE, e, zqParam);
			}
        }
        //获取省份政企开关
        String govSwitch = "OFF";
        if (SysConstant.ON.equals(propertiesUtils.getMessage("GOV_" + paramMap.get("areaId").toString().substring(0, 3)))) {
        	govSwitch = "ON";
		}
        resultMap.put("govSwitch", govSwitch);
        
        List custInfos = new ArrayList();
        try {
        	String an = paramMap.get("acctNbr").toString();
        	String ic = paramMap.get("identityCd").toString();
        	String in = paramMap.get("identityNum").toString();
        	//接入号  或  证件类型、证件号码不为空时才调用客户资料查询接口
        	if(an.length()>0 || (ic.length()>0 && in.length()>0)){
        		paramMap.put("_test_appFlag", "app");
	            resultMap = custBmo.queryCustInfo(paramMap, flowNum, sessionStaff);
	            if (MapUtils.isNotEmpty(resultMap)) {
	            	if (paramMap.containsKey("query")) {
	            		resultMap.put("query", paramMap.get("query")); //综合查询调用标志
	            	}
	            	
	            	custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
	            	List<String> custIds = new ArrayList<String>();
	            	//脱敏
					for(int i = 0; i < custInfos.size(); i++){
						Map tmpCustInfo =(Map)custInfos.get(i);
//						listCustInfos.put(MapUtils.getString(tmpCustInfo,"custId",""), tmpCustInfo);
						
						String tmpIdCardNumber = (String) tmpCustInfo.get("idCardNumber");
						tmpCustInfo.put("filterIdCardNumber", tmpIdCardNumber);
						if (tmpIdCardNumber != null && tmpIdCardNumber.length() == 18) {
							String preStr = tmpIdCardNumber.substring(0, 6);
							String subStr = tmpIdCardNumber.substring(14);
							tmpIdCardNumber = preStr + "********" + subStr;
							tmpCustInfo.put("filterIdCardNumber", tmpIdCardNumber);
						} else if (tmpIdCardNumber != null && tmpIdCardNumber.length() == 15) {
							String preStr = tmpIdCardNumber.substring(0, 5);
							String subStr = tmpIdCardNumber.substring(13);
							tmpIdCardNumber = preStr + "********" + subStr;
							tmpCustInfo.put("filterIdCardNumber", tmpIdCardNumber);
						}
						custIds.add(MapUtils.getString(tmpCustInfo,"custId",""));
					}
					
	        		//进行身份证脱敏
//					List<Map<String, Object>> custInfos = (List<Map<String, Object>>) resultMap.get("custInfos");
					if (custInfos.size() > 0) {
//						Map<String, Object> custInfoMap = (Map<String, Object>) custInfos.get(0);
//						String idCardNumber = MapUtils.getString(custInfoMap, "idCardNumber");
//						Integer length=idCardNumber.length();
//						if(!isViewOperation.equals("0")&&length==18){
//							 String preStr = idCardNumber.substring(0,6);
//					    	 String subStr = idCardNumber.substring(14);
//					    	 idCardNumber=preStr+"********"+subStr;
//							
//						}else if(!isViewOperation.equals("0")&&length==15){
//							String preStr = idCardNumber.substring(0,5);
//					    	 String subStr = idCardNumber.substring(13);
//					    	 idCardNumber=preStr+"********"+subStr;
//						}
						
						//若省份只返回了一条客户信息，则与原有接口无差异。若省份返回了多条客户信息，则前台需要再次调用后台的新提供的接口，来查询客户下的接入号信息，并拼装报文，按客户ID和接入号逐条展示客户信息
						if(custInfos.size() >= 1){
							String zqstr = "";
							for(int jj=0;jj<zqList.size();jj++){
								Map mm = (Map) zqList.get(jj);
								zqstr = zqstr + mm.get("certTypeCd")+",";
							}
							Map<String, Object> accNbrParamMap = new HashMap<String, Object>();
							accNbrParamMap.put("areaId", paramMap.get("areaId"));
							accNbrParamMap.put("custIds", custIds);
							Map accNbrResultMap = custBmo.queryAccNbrByCust(accNbrParamMap, flowNum, sessionStaff);
							
							List custInfosWithNbr = null;
							if (MapUtils.isNotEmpty(accNbrResultMap)) {
								custInfosWithNbr = new ArrayList();
								List<Map<String, Object>> accNbrCustInfos = (List<Map<String, Object>>) accNbrResultMap.get("custInfos");
								for(Object tmpCustInfo : custInfos){
									Map custInfoMap = (Map)tmpCustInfo;
									String custId = MapUtils.getString(custInfoMap,"custId","");
									
									List<Map<String, Object>> accNbrs = null;
									for(Map<String, Object> accNbrCustInfo : accNbrCustInfos){
										if(custId.equals(MapUtils.getString(accNbrCustInfo,"custId",""))){
											accNbrs = (List<Map<String, Object>>) accNbrCustInfo.get("accNbrInfos");
											break;
										}
									}
									
									if(accNbrs != null && accNbrs.size() != 0){
										for(Map<String, Object> accNbrMap : accNbrs){
											String accNbr = MapUtils.getString(accNbrMap, "accNbr", "");
											Map newCustInfoMap = new HashMap(custInfoMap);
											newCustInfoMap.put("accNbr", accNbr);
											if(StringUtils.isNotBlank(qryAcctNbr)&&!qryAcctNbr.equals(accNbr))
												continue;
											if("ON".equals(govSwitch) && newCustInfoMap.get("identityCd")!=null && zqstr.contains(newCustInfoMap.get("identityCd").toString())){
												//政企客户才去查询使用人信息
												addAccountAndCustInfo(flowNum, sessionStaff, areaId, custId, accNbr, soNbr, newCustInfoMap);
											}
											custInfosWithNbr.add(newCustInfoMap);
										}
										if (custInfosWithNbr.size()==0&&StringUtils.isNotBlank(qryAcctNbr)) {
											Map newCustInfoMap = new HashMap(custInfoMap);
											newCustInfoMap.put("accNbr", qryAcctNbr);
											if("ON".equals(govSwitch) && newCustInfoMap.get("identityCd")!=null && zqstr.contains(newCustInfoMap.get("identityCd").toString())){
												//政企客户才去查询使用人信息
												addAccountAndCustInfo(flowNum, sessionStaff, areaId, custId, qryAcctNbr, soNbr, newCustInfoMap);
											}
											custInfosWithNbr.add(newCustInfoMap);
										}
									} else {
										custInfosWithNbr.add(custInfoMap);
									}
								}
							} else {
								custInfosWithNbr = custInfos;
							}
//							resultMap.put("zqList", zqList);
							for(int ii=0;ii<custInfosWithNbr.size();ii++){
								Map mm = (Map) custInfosWithNbr.get(ii);
								//省份政企开关打开，且客户为政企客户
								if("ON".equals(govSwitch) && mm.get("identityCd")!=null && zqstr.contains(mm.get("identityCd").toString())){
									mm.put("isGov", "Y");
								}else{
									mm.put("isGov", "N");
								}
							}
							resultMap.put("custInfos", custInfosWithNbr);
							resultMap.put("custInfoSize", custInfosWithNbr.size());
//							model.addAttribute("query", paramMap.get("query"));  //综合查询调用标志
//							if(custInfosWithNbr.size()>1){
//								model.addAttribute("multiCust", "Y");  //多客户标识
//							}

//							PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(1, 10, custInfosWithNbr.size(),custInfosWithNbr);
//				    		model.addAttribute("pageModel", pm);
						}
						
//						custInfoMap.put("idCardNumber", idCardNumber);
//						custInfos.remove(custInfoMap);
//						custInfos.add(custInfoMap);
//						resultMap.put("custInfos", custInfos);
					}
	            	resultMap.put("jumpAuthflag", iseditOperation);
	            	jsonResponse=super.successed(resultMap, ResultConstant.SUCCESS.getCode());
	            }else{
	            	jsonResponse=super.failed(MapUtils.getString(resultMap, "msg", "客户资料查询业务！"), ResultConstant.SERVICE_RESULT_FAILTURE
	                        .getCode());
	            }
        	}else{
        		jsonResponse=super.failed(MapUtils.getString(resultMap, "msg", "客户资料查询业务出错，接入号为空或证件类型和证件号码为空！"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        	}
        	System.out.println("+++++++++++++++++++++"+JsonUtil.toString(jsonResponse));
            return jsonResponse;
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, paramMap, ErrorCode.QUERY_CUST);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_CUST, e, paramMap);
        }

    }
    
    /**
     * 客户鉴权-提供给手机客户端使用
     * @param param
     * @param request
     * @param response
     * @param flowNum
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/custInfoAuth", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse custInfoAuth(@RequestBody Map<String, Object> param,HttpServletRequest request,
            HttpServletResponse response,@LogOperatorAnn String flowNum) throws BusinessException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        HttpSession httpSession=request.getSession();
        Map<String, Object> map = new HashMap<String, Object>();
        Map<String, Object> paramMap = new HashMap<String, Object>();
        /*{accessNumber:'11969577',areaId:21,prodPwd:'000000'}*/
        paramMap.put("accessNumber", httpSession.getAttribute("queryCustAccNbr"));
        paramMap.put("prodPwd", param.get("prodPwd"));
        paramMap.put("areaId", param.get("areaId"));
        String authFlag = (String) param.get("authFlag");

        if ("0".equals(authFlag)) {
            try {
                map = custBmo.custAuth(paramMap, flowNum, sessionStaff);
                String isValidateStr = MapUtils.getString(map, "isValidate");
                if ("true".equals(isValidateStr)) {
                    httpSession.setAttribute("ValidateAccNbr", paramMap.get("accessNumber"));
                    httpSession.setAttribute("ValidateProdPwd", paramMap.get("prodPwd"));
                }
            } catch (BusinessException be) {
                return super.failed(be);
            } catch (InterfaceException ie) {

                return super.failed(ie, paramMap, ErrorCode.CUST_AUTH);
            } catch (Exception e) {

                return super.failed(ErrorCode.CUST_AUTH, e, paramMap);
            }

        } else {
            map.put("isValidate", "true");
        }
        JsonResponse jsonResponse=new JsonResponse();
        jsonResponse.setData(map);
        jsonResponse.setCode(ResultConstant.SUCCESS.getCode());
        return jsonResponse;
    }
    
    /**
     * 解密蓝牙读取用户加密信息-提供给手机客户端使用
     * @param param
     * @param request
     * @param response
     * @param flowNum
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/decodeUserInfo", method = { RequestMethod.POST ,RequestMethod.GET})
    @ResponseBody
    @SessionValid(value = false)
    public JsonResponse decodeUserInfo(@RequestBody Map<String, Object> param,HttpServletRequest request,
            HttpServletResponse response,@LogOperatorAnn String flowNum) throws BusinessException {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	Map<String, Object> resMap = new HashMap<String, Object>();
    	String dekeyWord=(String)request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
    	JsonResponse jsonResponse=new JsonResponse();
    	try {
    		resMap = custBmo.decodeUserInfo(param, flowNum, sessionStaff,dekeyWord,request);  
    		if(Integer.valueOf(resMap.get("code").toString())==ResultConstant.SUCCESS.getCode()){
    			//将读卡得到的身份证号码存入session，用于再次比对，防篡改
    			Map<String, Object> data = (Map<String, Object>) resMap.get("data");
    			Map<String, Object> userInfo = (Map<String, Object>) resMap.get("userInfo");
    			request.getSession().setAttribute(Const.CACHE_CERTINFO, userInfo.get("certNumber"));
    			jsonResponse=super.successed(resMap, ResultConstant.SUCCESS.getCode());
    		}else{
    			jsonResponse=super.failed(MapUtils.getString(resMap, "msg", "抱歉,查询蓝牙密钥的decodeUserInfo服务解析异常！"), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
    		}
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, resMap, ErrorCode.CUST_AUTH);
        } catch (Exception e) {
            return super.failed(ErrorCode.CUST_AUTH, e, resMap);
        }
        return jsonResponse;
    }
    
    /**
     * 客户证件鉴权-提供给手机客户端使用
     * @param paramMap
     * @param model
     * @param flowNum
     * @param response
     * @param httpSession
     * @return
     */
    @RequestMapping(value = "/custCertAuth", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse custCertAuth(@RequestBody Map<String, Object> paramMap,HttpServletRequest request,
            HttpServletResponse response,@LogOperatorAnn String flowNum) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> resultMap = new HashMap<String, Object>();
        JsonResponse jsonResponse = null;
        //客户鉴权跳过 权限查询
        String iseditOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_JUMPAUTH + "_" + sessionStaff.getStaffId());
        try {
            if (iseditOperation == null) {
                iseditOperation = this.staffBmo.checkOperatSpec(SysConstant.JUMPAUTH_CODE, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_JUMPAUTH + "_"
                        + sessionStaff.getStaffId(), iseditOperation);
            }
        } catch (BusinessException e) {
            iseditOperation = "1";
        } catch (InterfaceException ie) {
            iseditOperation = "1";
        } catch (Exception e) {
            iseditOperation = "1";
        }
        
        //是否要脱敏 权限
      //身份证脱敏操作
		String identityCd=(String) paramMap.get("identityCd");
		String idCardNumber=(String)paramMap.get("idCardNumber");
        if(identityCd.equals("1")){
	        String isViewOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId());
			try{
				if(isViewOperation==null){
					isViewOperation=staffBmo.checkOperatSpec(SysConstant.VIEWSENSI_CODE,sessionStaff);
					ServletUtils.setSessionAttribute(super.getRequest(),
 					SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId(), isViewOperation);
				}
			} catch (BusinessException e) {
				isViewOperation="1";
	 		} catch (InterfaceException ie) {
	 			isViewOperation="1";
			} catch (Exception e) {
				isViewOperation="1";
			}
        }
        String areaId = (String) paramMap.get("areaId");
        if (("").equals(areaId) || areaId == null) {
            paramMap.put("areaId", sessionStaff.getCurrentAreaId());
        }
        paramMap.put("staffId", sessionStaff.getStaffId());
       
        String oldCustId = paramMap.get("oldCustId").toString();
        paramMap.remove("oldCustId");

        try {
        	String an = paramMap.get("acctNbr").toString();
        	String ic = paramMap.get("identityCd").toString();
        	String in = paramMap.get("identityNum").toString();
        	//接入号  或  证件类型、证件号码不为空时才调用客户资料查询接口
        	if(an.length()>0 || (ic.length()>0 && in.length()>0)){

				Map<String, Object> checkIdMap = new HashMap<String, Object>();
				checkIdMap.put("areaId", MapUtils.getString(paramMap, "areaId", ""));
				checkIdMap.put("custId", oldCustId);
				checkIdMap.put("idCardNumber", in);
				checkIdMap.put("idCardType", ic);
				if ("1".equals(identityCd)) {
					String sessionCertNumber = (String) ServletUtils.getSessionAttribute(getRequest(), Const.CACHE_CERTINFO);
//					ServletUtils.removeSessionAttribute(getRequest(),Const.CACHE_CERTINFO);
					String tmpIdCardNumber = MapUtils.getString(checkIdMap, "idCardNumber", "");
					if(!tmpIdCardNumber.equals(sessionCertNumber)) {
						Map map = new HashMap();
						map.put("code", "1");
						map.put("isChange", SysConstant.STR_Y);
						map.put("custAuthInfo", "非正常读卡数据，信息可能被窜改，此操作将被记录！");
						jsonResponse=super.failed(MapUtils.getString(map, "msg", "非正常读卡数据，信息可能被窜改，此操作将被记录！"), ResultConstant.SERVICE_RESULT_FAILTURE
		                        .getCode());
						return jsonResponse;
					}
				}
				resultMap = mktResBmo.checkIdCardNumber(checkIdMap,
						flowNum, sessionStaff);
				if("0".equals(resultMap.get("code").toString())){
					jsonResponse=super.successed(MapUtils.getString(resultMap, "msg", resultMap.get("message").toString()), ResultConstant.SUCCESS.getCode());
				}else{
					jsonResponse=super.failed(MapUtils.getString(resultMap, "msg", resultMap.get("message").toString()), ResultConstant.SERVICE_RESULT_FAILTURE
	                        .getCode());
				}
        	}else{
        		jsonResponse=super.failed(MapUtils.getString(resultMap, "msg", "客户证件鉴权失败！"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        	}
            return jsonResponse;
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, paramMap, ErrorCode.QUERY_CUST);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_CUST, e, paramMap);
        }

    } 
    
    /**
     * 补换卡入口controller
     * @param model
     * @param session
     * @param flowNum
     * @return
     */
   @RequestMapping(value = "/custQuery/prepare", method = RequestMethod.POST)
   @AuthorityValid(isCheck = false)
   public String custQueryPrepare(Model model,HttpSession session,@LogOperatorAnn String flowNum) {
    	Map<String, Object> custSessionMap =  (Map<String, Object>) session.getAttribute("custMp");
    	//判断是否已经完成客户定位 是Y 否N
		if(custSessionMap!=null){
			model.addAttribute("haveCust", "Y");
		}else{
			model.addAttribute("haveCust", "N");
		}
    	return "/agent/cust/cust-query";		
  }
   
   /**
	 * 已完成客户定位，直接展示客户列表页
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
   @RequestMapping(value = "/showCustList", method = RequestMethod.POST)
   @AuthorityValid(isCheck = false)
   public String showCustList(Model model,HttpSession session,@LogOperatorAnn String flowNum) {
		Map<String, Object> custSessionMap =  (Map<String, Object>) session.getAttribute("custMp");
		model.addAttribute("query", custSessionMap.get("query"));  //综合查询调用标志
		model.addAttribute("multiCust", custSessionMap.get("multiCust"));  //多客户标识
		model.addAttribute("pageModel", custSessionMap.get("pageModel"));
		model.addAttribute("cust", custSessionMap.get("cust"));
		model.addAttribute("custInfoSize", custSessionMap.get("custInfoSize"));
		model.addAttribute("jumpAuthflag", custSessionMap.get("jumpAuthflag"));
		return "/agent/cust/cust-list";		
	}
  
/**
 * 补换卡客户查询
 * add by yangm
 * @param paramMap
 * @param model
 * @param flowNum
 * @param response
 * @param httpSession
 * @param request
 * @return
 */
    @RequestMapping(value = "/appQueryCust", method = { RequestMethod.POST })
    public String queryCust(@RequestBody Map<String, Object> paramMap, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response,HttpSession httpSession,HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		log.debug("agentQueryCust", sessionStaff);
		log.debug("agentQueryCust/staffId", sessionStaff.getStaffId());
		log.debug("agentQueryCust/ChannelId", sessionStaff.getCurrentChannelId());
		Map resultMap =new HashMap();
		httpSession.setAttribute("ValidateAccNbr", null);
		httpSession.setAttribute("ValidateProdPwd", null);
		httpSession.setAttribute("queryCustAccNbr", paramMap.get("acctNbr"));
		//判断是否只能进行本地定位
/*		String diffPlace=(String) param.get("diffPlace");
		if(diffPlace.equals("local")){
			param.put("areaId", sessionStaff.getCurrentAreaId());
		}*/
		//客户鉴权跳过 权限查询
//		String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
//				SysConstant.SESSION_KEY_JUMPAUTH+"_"+sessionStaff.getStaffId());
		String iseditOperation = null; //存在多次定位客户时，有时不显示跳过检验按钮的问题；尝试每次都调用接口重新获取权限；
		try{
 			if(iseditOperation==null){
 				iseditOperation=staffBmo.checkOperatSpec(SysConstant.JUMPAUTH_CODE,sessionStaff);
 				ServletUtils.setSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_JUMPAUTH+"_"+sessionStaff.getStaffId(), iseditOperation);
 			}
			} catch (BusinessException e) {
				iseditOperation="1";
	 		} catch (InterfaceException ie) {
	 			iseditOperation="1";
			} catch (Exception e) {
				iseditOperation="1";
			}
		model.addAttribute("jumpAuthflag", iseditOperation);
		
		String areaId=(String) paramMap.get("areaId");
		if(("").equals(areaId)||areaId==null){
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		}
		paramMap.put("staffId", sessionStaff.getStaffId());
		if(paramMap.get("custQueryType")!=null&&!paramMap.get("custQueryType").equals("")){
			httpSession.setAttribute("custQueryType", paramMap.get("custQueryType"));
		}else{
			httpSession.setAttribute("custQueryType", "");
		}
		//update by huangjj3 异地业务加上权限判断
		String DiffPlaceFlag = (String) (httpSession.getAttribute(SysConstant.SESSION_KEY_DIFFPLACEFLAG)==null?"": httpSession.getAttribute(SysConstant.SESSION_KEY_DIFFPLACEFLAG));
		if("diff".equals(DiffPlaceFlag)){
			try {
				String isCheckFlag=staffBmo.checkOperatSpec(SysConstant.YDBHK,sessionStaff);
				if(!"0".equals(isCheckFlag)){
					model.addAttribute("showDiffcode", "Y");
					return "/cust/cust-list";
				}
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		List custInfos = new ArrayList();
		try {
			String regex = "^[A-Za-z0-9]+$";
			String identityCd = (String) paramMap.get("identityCd");
			// 军人身份证和组织机构代码正则验证与其它不一样
			if ("2".equals(identityCd)) {
				regex = "^[A-Za-z0-9\u4e00-\u9fa5]+$";
			}
			if ("15".equals(identityCd)) {
				regex = "^[A-Za-z0-9-]+$";
			}
			String num = (String) (paramMap.get("acctNbr")==""?paramMap.get("identityNum")==""?paramMap.get("queryTypeValue"):paramMap.get("identityNum"):paramMap.get("acctNbr"));
			if(!num.matches(regex)){
				return "/cust/cust-list";
			}
			resultMap = custBmo.queryCustInfo(paramMap,
					flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(resultMap)) {
				custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
				if(!MapUtils.getString(paramMap,"queryTypeValue","").equals("") && !MapUtils.getString(paramMap,"queryType","").equals("")){
					sessionStaff.setCardNumber(String.valueOf(paramMap.get("queryTypeValue")));
					sessionStaff.setCardType(String.valueOf(paramMap.get("queryType")));
				}else if(!paramMap.get("identityNum").equals("") && !paramMap.get("identityCd").equals("")){
					sessionStaff.setCardNumber(String.valueOf(paramMap.get("identityNum")));
					sessionStaff.setCardType(String.valueOf(paramMap.get("identityCd")));
				}
				
				sessionStaff.setInPhoneNum(String.valueOf(paramMap.get("acctNbr")));
				model.addAttribute("custInfoSize", custInfos.size());
				if(custInfos.size()>0){
					Map custInfo =(Map)custInfos.get(0);
					String idCardNumber = (String) custInfo.get("idCardNumber");
					
					sessionStaff.setCustId(String.valueOf(custInfo.get("custId")));
					sessionStaff.setCardNumber(idCardNumber);
					sessionStaff.setCardType(String.valueOf(custInfo.get("identityCd")));
					sessionStaff.setPartyName(String.valueOf(custInfo.get("partyName")));
					sessionStaff.setCustSegmentId(String.valueOf(custInfo.get("segmentId")));
					
					//在session中保存查询出的所有待选的原始客户信息
					Map<String, Map> listCustInfos = (Map<String, Map>) httpSession.getAttribute(SysConstant.SESSION_LIST_CUST_INFOS);
					if(listCustInfos == null){
						listCustInfos = new HashMap<String, Map>();
						httpSession.setAttribute(SysConstant.SESSION_LIST_CUST_INFOS, listCustInfos);
					}
					ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AREA+"_"+sessionStaff.getStaffId(), custInfo.get("areaId"));
					List<String> custIds = new ArrayList<String>();
					//脱敏
					for(int i = 0; i < custInfos.size(); i++){
						Map tmpCustInfo =(Map)custInfos.get(i);
						listCustInfos.put(MapUtils.getString(tmpCustInfo,"custId",""), tmpCustInfo);
						
						String tmpIdCardNumber = (String) tmpCustInfo.get("idCardNumber");
						tmpCustInfo.put("filterIdCardNumber", tmpIdCardNumber);
						if (tmpIdCardNumber != null && tmpIdCardNumber.length() == 18) {
							String preStr = tmpIdCardNumber.substring(0, 6);
							String subStr = tmpIdCardNumber.substring(14);
							tmpIdCardNumber = preStr + "********" + subStr;
							tmpCustInfo.put("filterIdCardNumber", tmpIdCardNumber);
						} else if (tmpIdCardNumber != null && tmpIdCardNumber.length() == 15) {
							String preStr = tmpIdCardNumber.substring(0, 5);
							String subStr = tmpIdCardNumber.substring(13);
							tmpIdCardNumber = preStr + "********" + subStr;
							tmpCustInfo.put("filterIdCardNumber", tmpIdCardNumber);
						}
						custIds.add(MapUtils.getString(tmpCustInfo,"custId",""));
					}
					
					//若省份只返回了一条客户信息，则与原有接口无差异。若省份返回了多条客户信息，则前台需要再次调用后台的新提供的接口，来查询客户下的接入号信息，并拼装报文，按客户ID和接入号逐条展示客户信息
					if(custInfos.size() > 1){
						List custInfosWithNbr = null;
						String actionFlag = "";
						if(paramMap.get("actionFlag")!=null && paramMap.get("actionFlag")!=""){
							actionFlag = paramMap.get("actionFlag").toString();
						}
						if("1".equals(actionFlag) || "13".equals(actionFlag) || "14".equals(actionFlag)){
							custInfosWithNbr = custInfos;
						}else{
							Map<String, Object> accNbrParamMap = new HashMap<String, Object>();
							accNbrParamMap.put("areaId", paramMap.get("areaId"));
							accNbrParamMap.put("custIds", custIds);
							Map accNbrResultMap = custBmo.queryAccNbrByCust(accNbrParamMap, flowNum, sessionStaff);
							
							if (MapUtils.isNotEmpty(accNbrResultMap)) {
								custInfosWithNbr = new ArrayList();
								List<Map<String, Object>> accNbrCustInfos = (List<Map<String, Object>>) accNbrResultMap.get("custInfos");
								for(Object tmpCustInfo : custInfos){
									Map custInfoMap = (Map)tmpCustInfo;
									String custId = MapUtils.getString(custInfoMap,"custId","");
									
									List<Map<String, Object>> accNbrs = null;
									for(Map<String, Object> accNbrCustInfo : accNbrCustInfos){
										if(custId.equals(MapUtils.getString(accNbrCustInfo,"custId",""))){
											accNbrs = (List<Map<String, Object>>) accNbrCustInfo.get("accNbrInfos");
											break;
										}
									}
									
									if(accNbrs != null && accNbrs.size() != 0){
										for(Map<String, Object> accNbrMap : accNbrs){
											String accNbr = MapUtils.getString(accNbrMap, "accNbr", "");
											Map newCustInfoMap = new HashMap(custInfoMap);
											newCustInfoMap.put("accNbr", accNbr);
											custInfosWithNbr.add(newCustInfoMap);
										}
									} else {
										custInfosWithNbr.add(custInfoMap);
									}
								}
							} else {
								custInfosWithNbr = custInfos;
							}
						}
						resultMap.put("custInfos", custInfosWithNbr);
						model.addAttribute("query", paramMap.get("query"));  //综合查询调用标志
						model.addAttribute("multiCust", "Y");  //多客户标识
						
						PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(1, 10, custInfosWithNbr.size(),custInfosWithNbr);
			    		model.addAttribute("pageModel", pm);
					}
					
				}else{
//					int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+10;
//					httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
				}
				model.addAttribute("cust", resultMap);
			}else{
				int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+10;
				httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
			}
			if(paramMap.containsKey("query")){	
				model.addAttribute("query", paramMap.get("query"));  //综合查询调用标志
			}
			log.debug("结束后sessionStaff", "20151226");
			log.debug("agentQueryCust", sessionStaff);
			log.debug("agentQueryCust/staffId", sessionStaff.getStaffId());
			log.debug("agentQueryCust/ChannelId", sessionStaff.getChannelId());
			return "/agent/cust/cust-list";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CUST);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_CUST, e, paramMap);
		}
	}
    
  /**
   * 补换卡客户身份鉴权
   * add by yanghm
   * @param param
   * @param model
   * @param flowNum
   * @param response
   * @param httpSession
   * @return
   * @throws BusinessException
   */
    @RequestMapping(value = "/custAuth2", method = { RequestMethod.POST })
	public String custAuth2(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession httpSession) throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map map = new HashMap();
		Map paramMap = new HashMap();
		Map resultMap = new HashMap();
		String areaName="";
		String identityCd="";
        String pCustIdentityCd=MapUtils.getString(param,"pCustIdentityCd");
		String idCardNumber="";
		//{accessNumber:'11969577',areaId:21,prodPwd:'000000'}
		String accNbr= (String) httpSession.getAttribute("queryCustAccNbr");
		if(accNbr == null || "".equals(accNbr)) {
			accNbr = (String) param.get("accNbr");
		}
		if (StringUtils.isNotBlank(accNbr)) {
			paramMap.put("accessNumber", accNbr);
		} else {
			paramMap.put("accessNumber", MapUtils.getString(param, "accessNumber", ""));
		}
		paramMap.put("prodPwd", param.get("prodPwd"));
		paramMap.put("areaId",param.get("areaId"));
		String authFlag=(String) param.get("authFlag");
		String identityNum=(String) param.get("identityNum");
		String validateType=(String) param.get("validateType");
		areaName = (String) param.get("areaName");
		if(areaName==null){
			areaName=sessionStaff.getCurrentAreaAllName();	
		}
		param.put("areaName", areaName);
		//身份证脱敏操作
		identityCd=(String) param.get("identityCd");
		idCardNumber=(String) param.get("idCardNumber");
		if(identityCd.equals("1")){
			String isViewOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId());
			try{
	 			if(isViewOperation==null){
	 				isViewOperation=staffBmo.checkOperatSpec(SysConstant.VIEWSENSI_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId(), isViewOperation);
	 			}
				} catch (BusinessException e) {
					isViewOperation="1";
		 		} catch (InterfaceException ie) {
		 			isViewOperation="1";
				} catch (Exception e) {
					isViewOperation="1";
				}
			Integer aa=idCardNumber.length();
			if(!isViewOperation.equals("0")&&idCardNumber.length()==18){
				 String preStr = idCardNumber.substring(0,6);
		    	 String subStr = idCardNumber.substring(14);
		    	 idCardNumber=preStr+"********"+subStr;
				
			}else if(!isViewOperation.equals("0")&&idCardNumber.length()==15){
				String preStr = idCardNumber.substring(0,5);
		    	 String subStr = idCardNumber.substring(13);
		    	 idCardNumber=preStr+"********"+subStr;
			}
		}
		param.put("idCardNumber", idCardNumber);

		Map<String, Map> listCustInfos = (Map<String, Map>) httpSession.getAttribute(SysConstant.SESSION_LIST_CUST_INFOS);
		
		if ("0".equals(authFlag)) {
			if ("1".equals(validateType)) {//兼容客户定位省份证定位和二次业务证件类型定位
				//用户信息查询
				Map custParam = new HashMap();
				try {
					custParam.put("areaId", param.get("areaId"));
					custParam.put("identityCd", identityCd);
					custParam.put("identityNum", StringUtils.isNotBlank(identityNum)?Base64.eryDecoder(identityNum):"");
					custParam.put("staffId", sessionStaff.getStaffId());
					custParam.put("transactionId", param.get("transactionId"));
					resultMap = custBmo.queryCustInfo(custParam, flowNum, sessionStaff);
					if (MapUtil.isNotEmpty(resultMap)) {
						List custInfos = (List<Map<String, Object>>) resultMap.get("custInfos");
						if (custInfos.size() > 0) {
							for (int i = 0; i < custInfos.size(); i++) {
								Map custInfoMap = (Map<String, Object>) custInfos.get(i);
								String queryCustId = MapUtils.getString(custInfoMap, "custId");
								String custId = MapUtils.getString(param,"custId");
								if (custId.equals(queryCustId)) {
									map.put("isValidate", "true");
									// 在session中保存当前客户信息
									Map sessionCustInfo = MapUtils.getMap(listCustInfos, custId);
									if (sessionCustInfo != null) {
										httpSession.setAttribute(SysConstant.SESSION_CURRENT_CUST_INFO,sessionCustInfo);
										listCustInfos.clear();
									}
								}
							}
						}
					}
				} catch (BusinessException be) {
					return super.failedStr(model, be);
				} catch (InterfaceException ie) {
					return super.failedStr(model, ie, custParam, ErrorCode.QUERY_CUST);
				} catch (Exception e) {
					return super.failedStr(model, ErrorCode.QUERY_CUST, e, custParam);
				}
			} else {
				try {
					map = custBmo.custAuth(paramMap,
							flowNum, sessionStaff);
					String resultCode = MapUtils.getString(map, "resultCode");
					String isValidateStr = MapUtils.getString(map, "isValidate");
					if ("true".equals(isValidateStr)) {
						httpSession.setAttribute("ValidateAccNbr", paramMap.get("accessNumber"));
						httpSession.setAttribute("ValidateProdPwd", paramMap.get("prodPwd"));
					}
				} catch (BusinessException be) {
					return super.failedStr(model, be);
				} catch (InterfaceException ie) {
					return super.failedStr(model, ie, paramMap, ErrorCode.CUST_AUTH);
				} catch (Exception e) {
					return super.failedStr(model, ErrorCode.CUST_AUTH, e, paramMap);
				}
			}
		} else {
			map.put("isValidate", "true");
			//在session中保存当前客户信息
			String custId = MapUtils.getString(param, "custId", "");
			Map sessionCustInfo = MapUtils.getMap(listCustInfos, custId);  
			if(sessionCustInfo != null){
				httpSession.setAttribute(SysConstant.SESSION_CURRENT_CUST_INFO, sessionCustInfo);
				listCustInfos.clear();
			}
		}
		
		
		map.put("custInfo", param);
		model.addAttribute("poingtType",sessionStaff.getPoingtType());
		model.addAttribute("custAuth", map);
		return "/agent/cust/cust-info";
	}
    
    /**
     * 补换卡客户定位-已订购业务查询
     * 用于首页与分页查询
     * @param param
     * @param model
     * @param session
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/orderprod2", method = RequestMethod.GET)
	public String orderprod2(@RequestParam Map<String, Object> param, Model model,HttpSession session, 
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> list = null;
		if (param.containsKey("isPurchase")) {
			model.addAttribute("isPurchase", "1");
			param.remove("isPurchase");
		}
		String areaId=(String) param.get("areaId");
		if(areaId==null||areaId.equals("")){
			areaId=sessionStaff.getCurrentAreaId();
		}
		Map paramMap =new HashMap();
		paramMap.put("areaId", areaId);
		paramMap.put("acctNbr", param.get("acctNbr"));
		paramMap.put("custId", param.get("custId"));

		paramMap.put("curPage", param.get("curPage"));
		if (param.containsKey("prodClass")) {
			paramMap.put("prodClass", param.get("prodClass"));
		}
//        int pageSize = sessionStaff.getAgentTypeCd().equals(SysConstant.AGENT_TYPE_IPAD) ? 8 : 12;
		String pageSize = "";
        pageSize=(String) param.get("pageSize");
        if("".equals(pageSize)){
        	pageSize="10";
        }
        paramMap.put("pageSize", pageSize);
		log.debug("param={}", JsonUtil.toString(paramMap));
		try {
			Map<String, Object> datamap = this.custBmo.queryCustProd(paramMap,
					flowNum, sessionStaff);
			log.debug("return={}", JsonUtil.toString(datamap));
			String code = (String) datamap.get("resultCode");
			if (ResultCode.R_SUCC.equals(code)) {
				Map<String, Object> temMap=(Map) datamap.get("result");
				list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
						if (list == null) {
							super.addHeadCode(response,ResultConstant.SERVICE_RESULT_FAILTURE);
						} else {
							if(list.size() > 0){
		                        ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AREA+"_"+sessionStaff.getStaffId(), list.get(0).get("areaId"));
		                	}
							Map<String, Object> mktPageInfo = MapUtil.map(temMap, "page");
							// 设置分页对象信息
							PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
									MapUtils.getIntValue(mktPageInfo, "pageIndex", 1),
									MapUtils.getIntValue(mktPageInfo, "pageSize", 10),
									MapUtils.getIntValue(mktPageInfo, "totalCount", 1),
									list);
							model.addAttribute("pageModel", pm);
							model.addAttribute("custflag", "0");
							/*PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(param,
											"PageIndex", 1), 10, 1, list);
							model.addAttribute("pageModel", pm);*/
						}
				}
			else if (ResultCode.R_FAIL.equals((String) datamap.get("code"))){
				model.addAttribute("custflag", "1");
				model.addAttribute("msg", (String) datamap.get("msg"));
			}
			model.addAllAttributes(param);
			
			String DiffPlaceFlag = param.get("DiffPlaceFlag")==null?"":param.get("DiffPlaceFlag").toString();
			List businessLink = null ;
			if(DiffPlaceFlag.equals("local")){
				businessLink = EhcacheUtil.getBusinessMenu(session,"YWSL");//菜单权限编码
			}else if(DiffPlaceFlag.equals("diff")){
				businessLink = EhcacheUtil.getBusinessMenu(session,"YDSL");
			}
			model.addAttribute("businessLink", businessLink);
			model.addAttribute("DiffPlaceFlag", DiffPlaceFlag);
			ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AGREEMENT+"_"+sessionStaff.getStaffId());
			ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_TERMINAL+"_"+sessionStaff.getStaffId());
			ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_NUMBER+"_"+sessionStaff.getStaffId());
			return "/agent/cust/cust-order-list";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.ORDER_PROD);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.ORDER_PROD, e, paramMap);
		}
	}
    
    /**
	 * 添加账户信息和使用人信息
	 * @param flowNum
	 * @param sessionStaff
	 * @param areaId
	 * @param custId
	 * @param accNbr
	 * @param newCustInfoMap
	 * @throws Exception
	 */
	private void addAccountAndCustInfo(String flowNum, SessionStaff sessionStaff, String areaId, String custId, String accNbr, String soNbr, Map newCustInfoMap) throws Exception {
		//账户和使用人信息查询
		Map<String, Object> auParam = new HashMap<String, Object>();
		auParam.put("areaId", areaId);
		auParam.put("acctNbr", accNbr);
		auParam.put("custId", custId);
		auParam.put("queryType", "1,2,3,4,5");
		auParam.put("soNbr", soNbr);
		auParam.put("type", "2");
		Map<String, Object> auMap = new HashMap<String, Object>();
		if (SysConstant.ON.equals(propertiesUtils.getMessage("GOV_" + areaId.substring(0, 3)))) {
			auMap = custBmo.queryAccountAndUseCustInfo(auParam, flowNum, sessionStaff);
		}
		if (MapUtils.isNotEmpty(auMap)) {
			Map<String, Object> aMap = MapUtils.getMap(auMap, "account");
			Map<String, Object> iMap = MapUtils.getMap(auMap, "identity");
			newCustInfoMap.put("userIdentityCd", MapUtils.getString(iMap, "identityTypeCd"));
			newCustInfoMap.put("userIdentityName", MapUtils.getString(iMap, "identityName"));
			newCustInfoMap.put("userIdentityNum", MapUtils.getString(iMap, "identityNum"));
			newCustInfoMap.put("accountName", MapUtils.getString(aMap, "accountName"));
			newCustInfoMap.put("userName", MapUtils.getString(auMap, "useCustName"));
			newCustInfoMap.put("userCustId", MapUtils.getString(auMap, "useCustId"));
			newCustInfoMap.put("isSame", MapUtils.getString(auMap, "isSame"));
		}
	}
}

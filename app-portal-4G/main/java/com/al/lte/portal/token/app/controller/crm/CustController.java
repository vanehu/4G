package com.al.lte.portal.token.app.controller.crm;

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
import org.springframework.web.context.request.WebRequest;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MapUtil;
import com.al.ecs.common.util.PageUtil;
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
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 */
@Controller("com.al.lte.portal.token.app.controller.crm.CustController")
@RequestMapping("/token/app/cust/*")
@AuthorityValid(isCheck = false)
public class CustController extends BaseController {

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
  //产品密码鉴权
  	@RequestMapping(value = "/custAuthSub", method = { RequestMethod.POST })
  	public @ResponseBody JsonResponse custAuthSub(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession httpSession) throws BusinessException {
  		SessionStaff sessionStaff = (SessionStaff) ServletUtils
  				.getSessionAttribute(super.getRequest(),
  						SysConstant.SESSION_KEY_LOGIN_STAFF);
  		JsonResponse jsonResponse = null;
  		Map map = new HashMap();
  		Map resultMap = new HashMap();
  		//证件类型
  		String identityCd=MapUtils.getString(param,"identityCd");
        String pCustIdentityCd=MapUtils.getString(param,"pCustIdentityCd");
  		//鉴权类别
  		String validateType=MapUtils.getString(param,"validateType");
  		
  		//如果是证件鉴权
  		if(validateType.equals("1")){
  			//用户信息查询
  			Map custParam = new HashMap();
  			try {
  				custParam.put("areaId", param.get("areaId"));
  				custParam.put("idCardType", identityCd);
  				custParam.put("idCardNumber",StringUtils.isNotBlank(MapUtils.getString(param,"identityNum"))?MapUtils.getString(param,"identityNum"):"");//证件号码
  				custParam.put("staffId", sessionStaff.getStaffId());
				custParam.put("custId", param.get("custId"));
				Map<String, Object> datamap = mktResBmo.checkIdCardNumber(custParam,flowNum, sessionStaff);
				if (datamap != null) {
					String code = (String) datamap.get("code");
					if (ResultCode.R_SUCC.equals(code)) {
						map.put("code", "0");
						map.put("isValidate", "true");
						jsonResponse = super.successed(map,ResultConstant.SUCCESS.getCode());
					}
					else{
						map.put("code", "-1");
						map.put("isValidate", "false");
						map.put("message","证件号码错误");
						jsonResponse = super.failed(ErrorCode.QUERY_CUST, map, custParam);
					}
				}	
  			} catch (BusinessException be) {
  				return super.failed(be);
  			} catch (InterfaceException ie) {
  				return super.failed(ie, custParam, ErrorCode.QUERY_CUST);
  			} catch (Exception e) {
  				return super.failed(ErrorCode.QUERY_CUST, e, custParam);
  			}
  		}
  		else if(validateType.equals("3")){
  			try {
  				Map paramMap = new HashMap();
  				paramMap.put("accessNumber", param.get("accessNumber"));
  				paramMap.put("prodPwd", param.get("prodPwd"));
  				paramMap.put("areaId",param.get("areaId"));
  				map=new HashMap();	
  				map = custBmo.custAuth(paramMap,flowNum, sessionStaff);
  				String resultCode = MapUtils.getString(map, "code");
  				String isValidateStr = MapUtils.getString(map, "isValidate");
  				if ("true".equals(isValidateStr)) {
  					jsonResponse = super.successed(map,ResultConstant.SUCCESS.getCode());
  				}
  				else{
  					map.put("code", "-1");
  					map.put("isValidate", "false");
  					map.put("message","产品密码错误");
  					jsonResponse = super.failed(ErrorCode.CUST_AUTH, map, paramMap);
  				}
  			} catch (BusinessException be) {
  				return super.failed(be);
  			} catch (InterfaceException ie) {
  				return super.failed(ie, map, ErrorCode.CUST_AUTH);
  			} 
  		     catch (Exception e) {
  				return super.failed(ErrorCode.CUST_AUTH, e, map);
  			}
  		}

  		return jsonResponse;
  	}
    
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
	        		//进行身份证脱敏
					List<Map<String, Object>> custInfos = (List<Map<String, Object>>) resultMap.get("custInfos");
					if (custInfos.size() > 0) {
						Map<String, Object> custInfoMap = (Map<String, Object>) custInfos.get(0);
						String idCardNumber = MapUtils.getString(custInfoMap, "idCardNumber");
						Integer length=idCardNumber.length();
						if(!isViewOperation.equals("0")&&length==18){
							 String preStr = idCardNumber.substring(0,6);
					    	 String subStr = idCardNumber.substring(14);
					    	 idCardNumber=preStr+"********"+subStr;
							
						}else if(!isViewOperation.equals("0")&&length==15){
							String preStr = idCardNumber.substring(0,5);
					    	 String subStr = idCardNumber.substring(13);
					    	 idCardNumber=preStr+"********"+subStr;
						}
						custInfoMap.put("idCardNumber", idCardNumber);
						custInfos.remove(custInfoMap);
						custInfos.add(custInfoMap);
						resultMap.put("custInfos", custInfos);
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
    
}

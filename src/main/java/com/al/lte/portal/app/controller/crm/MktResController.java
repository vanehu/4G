package com.al.lte.portal.app.controller.crm;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.apache.commons.lang.time.DateFormatUtils;
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
import com.al.ecs.common.entity.LevelLog;
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
import com.al.ecs.exception.Result;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.StringUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

import net.sf.json.JSONArray;

/**
 * 营销资源控制层
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.app.controller.crm.MktResController")
@RequestMapping("/app/mktRes/*")
public class MktResController extends BaseController {

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
    private MktResBmo mktResBmo;
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
    private OrderBmo orderBmo;
    @Autowired
    PropertiesUtils propertiesUtils;

    /**
     * 改号，跳转查询特面
     * @param model
     * @param param
     * @return
     */
    @RequestMapping(value = "/telnumcg-prepare", method = RequestMethod.GET)
    public String telnumChangePrepare(Model model, @RequestParam Map<String, Object> param) {
        model.addAttribute("current", "business");
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String subPage = MapUtils.getString(param, "subPage", "number");
        String phoneNumber = MapUtils.getString(param, "oldPhoneNumber", "");
        String anTypeCd = MapUtils.getString(param, "oldAnTypeCd", "");
        try {//选号页面，查询员工是否有修改号码等级的权限
            String res = staffBmo.checkOperatSpec("CHOOSE_PNLEVEL", sessionStaff);
            model.addAttribute("can_change_level", res);
        } catch (Exception e1) {
        	log.error(e1);
        }
        if (!"".equals(phoneNumber) && !"".equals(anTypeCd)) {
            param.putAll(getAreaInfos(""));
            try {
                param.put("staffId", sessionStaff.getStaffId());
                param.put("orderNo", "");
                mktResBmo.prePhoneNumber(param, "", sessionStaff);
            } catch (BusinessException e) {

            } catch (InterfaceException ie) {

            } catch (Exception e) {

            }
        }
        model.addAttribute("subPage", subPage);
        return "/app/product/telnum-change-prepare";
    }

    /**
     * 改号，跳转号码列表页面
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/telnumcg/list", method = RequestMethod.GET)
    public String telnumcgList(@RequestParam Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        List<Map<String, Object>> list = null;
        String areaId = (String) param.get("areaId");
        param.putAll(getAreaInfos(areaId));
        try {
            Map<String, Object> datamap = this.mktResBmo.queryPhoneNumber(param, flowNum, sessionStaff);
            if (datamap != null) {
                String code = (String) datamap.get("code");
                if (ResultCode.R_SUCCESS.equals(code)) {
                    Object obj = datamap.get("phoneNumList");
                    if (obj instanceof List) {
                        list = (List<Map<String, Object>>) datamap.get("phoneNumList");
                    } else {
                        list = new ArrayList<Map<String, Object>>();
                        list.add((Map<String, Object>) datamap.get("phoneNumList"));
                    }
                    if (list == null) {
                        super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
                    } else {
                        model.addAttribute("phoneNumList", list);
                        model.addAttribute("ispurchased", "0");
                        model.addAttribute("areaId", areaId);
                    }
                }
            }
        } catch (BusinessException e) {
            this.log.error("查询号码信息失败", e);
            super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.PHONENUM_LIST);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.PHONENUM_LIST, e, param);
        }
        model.addAllAttributes(param);
        return "/app/product/telnum-change-list";
    }

    /**
     * 改号，身份证号查询号码预占列表
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/telnumcg/listByIdentity", method = RequestMethod.GET)
    public String telnumcgListByIdentity(@RequestParam Map<String, Object> param, Model model,
            @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        List<Map<String, Object>> list = null;
        try {
            String areaId = (String) param.get("areaId");
            param.putAll(getAreaInfos(areaId));
            param.put("phoneNumber", "");
            Map<String, Object> datamap = this.mktResBmo.queryNumberByIdentityId(param, flowNum, sessionStaff);
            if (datamap != null) {
                String code = (String) datamap.get("code");
                if (ResultCode.R_SUCCESS.equals(code)) {
                    Object obj = datamap.get("phoneNumList");
                    if (obj instanceof List) {
                        list = (List<Map<String, Object>>) datamap.get("phoneNumList");
                    } else {
                        list = new ArrayList<Map<String, Object>>();
                        list.add((Map<String, Object>) datamap.get("phoneNumList"));
                    }
                    if (list == null) {
                        super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
                    } else {
                        model.addAttribute("phoneNumList", list);
                        model.addAttribute("ispurchased", "1");
                        model.addAttribute("areaId", areaId);
                    }
                }
            }
        } catch (BusinessException e) {
            this.log.error("查询号码信息失败", e);
            super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.PHONENUM_IDENTITY);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.PHONENUM_IDENTITY, e, param);
        }
        model.addAllAttributes(param);
        return "/app/product/telnum-change-list";
    }

    /**
     * 产品实例与号码关系查询接口
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/telnumcg/queryProdInstAccNbr", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryProdInstAccNbr(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.queryProdInstAccNbr(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCC.equals(rMap.get("resultCode").toString())) {
                jsonResponse = super.successed(rMap.get("result"), ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap, 1);
            }

        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.PROD_INST_ACC_NBR);
        } catch (Exception e) {
            return super.failed(ErrorCode.PROD_INST_ACC_NBR, e, param);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/phonenumber/prepare", method = RequestMethod.GET)
    public String prepare(Model model, @RequestParam Map<String, Object> param) {
        model.addAttribute("current", "business");
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String subPage = MapUtils.getString(param, "subPage", "number");
        try {//选号页面，查询员工是否有修改号码等级的权限
            String res = staffBmo.checkOperatSpec("CHOOSE_PNLEVEL", sessionStaff);
            model.addAttribute("can_change_level", res);
        } catch (Exception e1) {
        	 log.error(e1);
        }
        model.addAttribute("subPage", subPage);
        return "/app/mktRes/phonenumber-prepare";
    }

    //号池查询
    @RequestMapping(value = "/phonenumber/queryPhoneNbrPool", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse queryPhoneNbrPool(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum)
            throws BusinessException {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            param.put("staffId", sessionStaff.getStaffId());
            param.put("channelId", sessionStaff.getCurrentChannelId());
            //rMap = mktResBmo.uimCheck(param, flowNum, sessionStaff);
            rMap = mktResBmo.queryNbrPool(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(rMap, ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (BusinessException e) {
            this.log.error("号池查询服务出错", e);
            jsonResponse = super.failed("号池查询服务出错", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QRY_NUMBERPOOL);
        } catch (Exception e) {
            log.error("号池查询", e);
            return super.failed(ErrorCode.QRY_NUMBERPOOL, e, param);
        }
        return jsonResponse;
    }
    
    @RequestMapping(value = "/uim/checkUim", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse checkUim(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			param.put("staffId", sessionStaff.getStaffId());
			param.put("channelId", sessionStaff.getCurrentChannelId());
			param.put("orderNo", "");
			rMap = mktResBmo.uimCheck(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("uim卡校验预占服务出错", e);
			jsonResponse = super.failed("uim卡校验预占服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.UIM_E_F);
		} catch (Exception e) {
			log.error("号码预占异常", e);
			return super.failed(ErrorCode.UIM_E_F, e, param);
		}
		return jsonResponse;
	}

    private Map<String, Object> getAreaInfos(String areaId) {
        Map<String, Object> map = new HashMap<String, Object>();
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        if (areaId == null || "".equals(areaId)) {
            areaId = sessionStaff.getCurrentAreaId();
        }
        String provinceId = "";
        if (areaId.matches("\\d{7}")) {
            provinceId = areaId.substring(0, 3) + "0000";
        }
        String channelId = sessionStaff.getCurrentChannelId();
        map.put("channelId", channelId);
        map.put("provinceId", provinceId);
        map.put("areaId", areaId);
        return map;
    }
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/phonenumber/list", method = { RequestMethod.POST })
	public String list(@RequestBody Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession session) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String queryFlag=(String)param.get("isReserveFlag");
		//访问次数限制
		try{
			model.addAttribute("showVerificationcode", "N");
			long endTime = System.currentTimeMillis();
			long beginTime = 0;
			if(session.getAttribute(sessionStaff.getStaffCode()+"nbrtime")!=null){
				beginTime = (Long) session.getAttribute(sessionStaff.getStaffCode()+"nbrtime");
			}
			if(beginTime!=0){
				Date beginDate = new Date(beginTime);
				Date endDate = new Date(endTime);
				long useTime = endDate.getTime()-beginDate.getTime();
				long limit_time = Long.parseLong(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"LIMIT_TIME"));
				int limit_count = Integer.parseInt(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"LIMIT_COUNT"));
				if (useTime<=limit_time){
					int count = (Integer) session.getAttribute(sessionStaff.getStaffCode()+"nbrcount")+1;
					if(count<limit_count){
						session.setAttribute(sessionStaff.getStaffCode()+"nbrcount", count);
					}else if(count==limit_count){
						session.setAttribute(sessionStaff.getStaffCode()+"nbrcount", count);
						model.addAttribute("showVerificationcode", "Y");
					}else if(count>limit_count){
						session.setAttribute(sessionStaff.getStaffCode()+"nbrcount", count);
						if(session.getAttribute(sessionStaff.getStaffCode()+"nbrcount")!=null){
							model.addAttribute("showVerificationcode", "Y");
							//if(queryFlag.equals("1")){
						//		return "/order/reserve-phonenumber-list";
						//	}else{
							    return "/app/mktRes/phonenumber-list";
						//	}
						}
					}
				}else{
					session.setAttribute(sessionStaff.getStaffCode()+"nbrtime", endTime);
					session.setAttribute(sessionStaff.getStaffCode()+"nbrcount", 1);
				}
			}else{
				session.setAttribute(sessionStaff.getStaffCode()+"nbrtime", endTime);
				session.setAttribute(sessionStaff.getStaffCode()+"nbrcount", 1);
			}
		}catch (Exception e) {
			// TODO: handle exception
		}
		
		List<Map<String, Object>> list = null;
		String areaId=(String) param.get("areaId");
		param.putAll(getAreaInfos(areaId));
		param.remove("isReserveFlag");
		try {
			Map<String, Object> datamap = this.mktResBmo.queryPhoneNumber(param,
					flowNum, sessionStaff);
			if (datamap != null) {
				String code = (String) datamap.get("code");
				if (ResultCode.R_SUCCESS.equals(code)) {
					Object obj = datamap.get("phoneNumList");
					if (obj instanceof List) {
						list = (List<Map<String, Object>>) datamap.get("phoneNumList");
					} else {
						list = new ArrayList<Map<String, Object>>();
						list.add((Map<String, Object>) datamap.get("phoneNumList"));
					}
					if (list == null) {
						super.addHeadCode(response,ResultConstant.SERVICE_RESULT_FAILTURE);
					} else {
                        model.addAttribute("phoneNumList", list);
						model.addAttribute("ispurchased", "0");
						model.addAttribute("areaId", areaId);
					}
				}
			}
		} catch (BusinessException e) {
			this.log.error("查询号码信息失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		}catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.PHONENUM_LIST);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.PHONENUM_LIST, e, param);
		}
		model.addAllAttributes(param);
		if(param.get("enter")!=null){
			return "/app/order_new/phonenumber-list";//号卡新装
		}
		//if(queryFlag.equals("1")){
		//	return "/order/reserve-phonenumber-list";
		//}else{
			return "/app/mktRes/phonenumber-list";//购手机
	//	}
	}
	
	/**
	 * 单独提供给LTE新装套餐，主副卡变更功能中，号码信息查询
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @param session
	 * @return
	 */
	@RequestMapping(value = "/phone/numberlist", method = { RequestMethod.POST })
	@ResponseBody
	public JsonResponse phoneNumberList(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession session) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		JsonResponse jsonResponse = null;
		String prodId = String.valueOf(param.get("prodId"));
		try {
			Map<String, Object> datamap = this.mktResBmo.phoneNumInfoQry(param,
					flowNum, sessionStaff);
			if (datamap != null) {
				String code = (String) datamap.get("code");
				if (ResultCode.R_SUCCESS.equals(code)) {
					resultMap.put("datamap", datamap);
					resultMap.put("prodId", prodId);
					jsonResponse=super.successed(resultMap, ResultConstant.SUCCESS.getCode());
				}else{
					resultMap.put("message", (String) datamap.get("msg"));
					jsonResponse = super.failed(resultMap,ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			}
		}catch (BusinessException e) {
			this.log.error("查询号码信息失败", e);
			jsonResponse = super.failed("号码预占服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.PHONENUM_LIST);
		} catch (Exception e) {
			return super.failed(ErrorCode.PHONENUM_LIST, e, param);
		}		
		return jsonResponse;
	}
	
    @RequestMapping(value = "/phonenumber/purchase", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse purchase(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		param.putAll(getAreaInfos(MapUtils.getString(param, "areaId")));
		try {
			param.put("staffId", sessionStaff.getStaffId());
			param.put("orderNo","");
			rMap = mktResBmo.prePhoneNumber(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("号码预占服务出错", e);
			jsonResponse = super.failed("号码预占服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.PHONENUM_E_F_C);
		} catch (Exception e) {
			log.error("号码预占异常", e);
			return super.failed(ErrorCode.PHONENUM_E_F_C, e, param);
		}
		return jsonResponse;
	}
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/phonenumber/listByIdentity", method = RequestMethod.GET)
    public String listByIdentity(@RequestParam Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> list = null;
		try {
			String areaId=(String) param.get("areaId");
			param.putAll(getAreaInfos(areaId));
			param.put("phoneNumber", "");
			Map<String, Object> datamap = this.mktResBmo.queryNumberByIdentityId(param,
					flowNum, sessionStaff);
			if (datamap != null) {
				String code = (String) datamap.get("code");
				if (ResultCode.R_SUCCESS.equals(code)) {
					Object obj = datamap.get("phoneNumList");
					if (obj instanceof List) {
						list = (List<Map<String, Object>>) datamap.get("phoneNumList");
					} else {
						list = new ArrayList<Map<String, Object>>();
						list.add((Map<String, Object>) datamap.get("phoneNumList"));
					}
					if (list == null) {
						super.addHeadCode(response,ResultConstant.SERVICE_RESULT_FAILTURE);
					} else {
						model.addAttribute("phoneNumList", list);
						model.addAttribute("ispurchased", "1");
						model.addAttribute("areaId",areaId);
					}
				}
			}
		} catch (BusinessException e) {
			this.log.error("查询号码信息失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.PHONENUM_IDENTITY);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.PHONENUM_IDENTITY, e, param);
		}
		model.addAllAttributes(param);
		if(param.get("newFlag")!=null){
			return "/app/order_new/phonenumber-list";
		}
        return "/app/mktRes/phonenumber-list";
    }


    @RequestMapping(value = "/uim/getMktResCd", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getMktResCd(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
        Map<String, Object> pMap = new HashMap<String, Object>();
        String prodSpecId = MapUtils.getString(param, "prodSpecId");
        String columnValue = "";
        JsonResponse jsonResponse = null;
        pMap.put("tableName", "SYSTEM_PROD_SPEC_TO_CARD");
        pMap.put("columnName", prodSpecId);
        try {
            rList = (List<Map<String, Object>>) orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get(
                    "result");
            if (rList instanceof List) {
                List lt = (List) rList;
                for (int i = 0; i < lt.size(); i++) {
                    Map mp = (Map) lt.get(i);
                    Object oo = MapUtils.getObject(mp, prodSpecId);
                    List ltt = (List) oo;
                    for (int j = 0; j < ltt.size(); j++) {
                        Map mpp = (Map) ltt.get(j);
                        columnValue = MapUtils.getString(mpp, "COLUMN_VALUE");
                    }
                }
            }
            if (columnValue != "") {
                jsonResponse = super.successed(columnValue, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(columnValue, ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
            }
        } catch (Exception e) {
            log.error("查询卡类型失败", e);
            log.error(e);
        }
        return jsonResponse;
    }

    /**
     * 转至异常单释放页面，释放异常单的号码资源
     */
    @RequestMapping(value = "/phonenumber/preNumRelease", method = RequestMethod.POST)
    public String preNumRelease(HttpSession session, Model model) throws AuthorityException {

        Calendar calendar = Calendar.getInstance();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        String end = sdf.format(calendar.getTime());
        calendar.add(Calendar.DATE, -1);
        String start = sdf.format(calendar.getTime());
        model.addAttribute("p_startTime", start);
        model.addAttribute("p_endTime", end);
//        model.addAttribute("current", EhcacheUtil.getCurrentPath(session, "/app/sourceRelease/sourceRelease-main"));

        return "/app/sourceRelease/sourceRelease-main";
    }

    /**
     * 查询待释放的号码资源
     * @param param
     * @param flowNum
     * @param model
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/phonenumber/queryReleaseNum", method = RequestMethod.GET)
    public String queryReleaseNum(@RequestParam Map<String, Object> param, @LogOperatorAnn String flowNum, Model model,
            HttpServletResponse response) throws BusinessException {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        param.put("staffCode", sessionStaff.getStaffCode());
        param.put("areaId", sessionStaff.getCurrentAreaId());

        try {
            Map<String, Object> resultMap = mktResBmo.queryReleaseNum(param, flowNum, sessionStaff);

            if (resultMap != null && resultMap.get("code") != null) {
                if (resultMap.get("code").equals("POR-0000")) {
                    Map<String, Object> result = (Map<String, Object>) resultMap.get("result");
                    if (result != null && result.get("numberList") != null) {
                        ArrayList<Map<String, Object>> numberList = (ArrayList<Map<String, Object>>) result
                                .get("numberList");
                        if (numberList.size() > 0) {
                            if (result.get("totalNumber") != null) {
                                int pageNo = Integer.parseInt(param.get("pageIndex").toString());
                                int pageSize = Integer.parseInt(param.get("pageSize").toString());
                                int totalRecords = Integer.parseInt(result.get("totalNumber").toString());
                                PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, pageSize,
                                        totalRecords < 1 ? 1 : totalRecords, numberList);
                                model.addAttribute("pageModel", pm);
                                //数据返回正常&&查询成功&&结果不为空
                                model.addAttribute("flag", 0);
                            } else {
                                //数据返回异常
                                model.addAttribute("flag", -1);
                            }
                        } else {
                            //数据返回正常&&查询成功&&结果为空
                            model.addAttribute("flag", 1);
                        }
                    } else {
                        //数据返回异常
                        model.addAttribute("flag", -1);
                    }
                } else {
                    //数据返回正常&&查询失败
                    model.addAttribute("flag", 2);
                }
            } else {
                //数据返回异常
                model.addAttribute("flag", -1);
            }
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_RES_RELEASE, e, param);
        }
        return "/app/sourceRelease/sourceRelease-list";
    }

    /**
     * 异常单号码资源释放
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/phonenumber/releaseErrorNum", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse releaseUIM(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        String numType = param.get("numType").toString();
        String numValue = param.get("numValue").toString();

        Map<String, Object> dataBusMap = new HashMap<String, Object>();

        dataBusMap.put("actionType", "F");
        dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
        dataBusMap.put("staffId", sessionStaff.getStaffId());

        if (numType.equals("1")) {
            dataBusMap.put("phoneNumber", numValue);
        } else {
            dataBusMap.put("instCode", numValue);
        }

        JsonResponse jr = new JsonResponse();

        try {
            Map<String, Object> resultMap = mktResBmo.releaseErrorNum(dataBusMap, flowNum, sessionStaff);

            if (resultMap != null && resultMap.get("resultCode") != null) {
                if (resultMap.get("resultCode").equals("0")) {
                    //号码释放成功，开始更新被释放的号码的状态，重新组装入参
                    dataBusMap.clear();
                    dataBusMap.put("accNbr", numValue);
                    dataBusMap.put("accNbrType", numType);
                    dataBusMap.put("action", "UPDATE");

                    try {
                        Map<String, Object> returnMap = mktResBmo.updateNumStatus(dataBusMap, flowNum, sessionStaff);

                        if (returnMap != null && returnMap.get("code") != null) {
                            if (returnMap.get("code").equals("POR-0000")) {
                                jr = successed("", 0);
                            } else {
                                if (returnMap.get("message") != null) {
                                    jr = failed(returnMap.get("message"), 1);
                                } else {
                                    jr = failed("号码状态更新失败，请联系管理员", 1);
                                }
                            }
                        } else {
                            jr = failed("号码状态更新异常，请联系管理员", 1);
                        }
                    } catch (BusinessException be) {
                        return super.failed(be);
                    } catch (Exception e) {
                        return super.failed(ErrorCode.UPDATE_RES_STATE, e, dataBusMap);
                    }
                } else {
                    if (resultMap.get("resultMsg") != null) {
                        jr = failed(resultMap.get("resultMsg"), -1);
                    } else {
                        jr = failed("", -1);
                    }
                }
            } else {
                jr = failed("", -1);
            }
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            if (dataBusMap.get("accNbrType").toString().equals("1")) {
                return super.failed(ie, dataBusMap, ErrorCode.PHONENUM_E_F_C);
            } else {
                return super.failed(ie, dataBusMap, ErrorCode.UIM_E_F);
            }
        } catch (Exception e) {
            if (dataBusMap.get("accNbrType").toString().equals("1")) {
                return super.failed(ErrorCode.PHONENUM_E_F_C, e, dataBusMap);
            } else {
                return super.failed(ErrorCode.UIM_E_F, e, dataBusMap);
            }
        }
        return jr;
    }

    /**
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/terminal/prepare", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String terminalPrepare(Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        model.addAttribute("default_area_id", sessionStaff.getCurrentAreaId());
        return "/app/mktRes/terminal-prepare";
    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/terminal/list", method = { RequestMethod.POST }, produces = "text/html;charset=UTF-8")
    @LogOperatorAnn(desc = "终端查询", code = "TERMINAL_QUERY", level = LevelLog.DB)
    public String terminalList(@RequestBody Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        param.put("channelId", sessionStaff.getCurrentChannelId());
        try {

            Map<String, Object> mktResMap = mktResBmo.queryMktResInfo(param, flowNum, sessionStaff);
            Object obj = MapUtils.getObject(mktResMap, "mktResList");
            if (obj != null && obj instanceof List) {
                List<Map<String, Object>> mktResList = (List<Map<String, Object>>) obj;
                String mktResPicUrl = propertiesUtils.getMessage(SysConstant.MKT_RES_PIC_URL);
                if (StringUtils.isNotEmpty(mktResPicUrl)) {
                    log.debug("mktResPicUrl:{}", mktResPicUrl);
                    model.addAttribute("mktResPicUrl", mktResPicUrl);
                }
                Map<String, Object> mktPageInfo = MapUtil.map(mktResMap, "mktPageInfo");
                // 设置分页对象信息
                PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(mktPageInfo,
                        "pageIndex", 1), MapUtils.getIntValue(mktPageInfo, "pageSize", 10), MapUtils.getIntValue(
                        mktPageInfo, "totalCount", 0), mktResList);
                model.addAttribute("pageModel", pm);
            } else {
                super.setNoCacheHeader(response);
            }
            model.addAllAttributes(param);
        } catch (BusinessException be) {
            this.log.error("门户/app/mktRes/terminal/list服务异常", be);
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.QUERY_TERMINAL_LIST);
        } catch (Exception e) {
            this.log.error("门户/app/mktRes/terminal/list服务异常", e);
            return super.failedStr(model, ErrorCode.QUERY_TERMINAL_LIST, e, param);
        }
        if(param.get("newFlag") != null){
        	return "/app/mktRes_new/terminal-list";
        }
        return "/app/mktRes/terminal-list";
    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/terminal/detail", method = RequestMethod.POST)
    public String terminalDetail(@RequestBody Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        if (param.get("is4G") != null) {
            Map<String, Object> paramTemp = new HashMap<String, Object>();
            if (param.get("mktSpecCode") != null) {
                String mktSpecCode = param.get("mktSpecCode").toString();
                param.put("mktSpecCode", mktSpecCode);
                if (mktSpecCode.length() >= 22) {
                    mktSpecCode = mktSpecCode.substring(0, 22);
                }
                paramTemp.put("mktSpecCode", mktSpecCode);
            }
            paramTemp.put("pageInfo", param.get("pageInfo"));
            paramTemp.put("mktResCd", "");
            paramTemp.put("mktResName", "");
            paramTemp.put("mktResType", "");
            paramTemp.put("minPrice", "");
            paramTemp.put("maxPrice", "");
            paramTemp.put("attrList", param.get("attrList"));
			paramTemp.put("channelId", sessionStaff.getCurrentChannelId());

            try {

                Map<String, Object> mktResMap = mktResBmo.queryMktResInfo(paramTemp, flowNum, sessionStaff);
                Object obj = MapUtils.getObject(mktResMap, "mktResList");
                if (obj != null && obj instanceof List) {
                    List<Map<String, Object>> mktResList = (List<Map<String, Object>>) obj;
                    String mktResPicUrl = propertiesUtils.getMessage(SysConstant.MKT_RES_PIC_URL);
                    if (StringUtils.isNotEmpty(mktResPicUrl)) {
                        model.addAttribute("mktResPicUrl", mktResPicUrl);
                    }
                    model.addAttribute("mktResList", mktResList);
                } else {
                    super.setNoCacheHeader(response);
                }
            } catch (BusinessException be) {
                this.log.error("门户/app/mktRes/terminal/detail服务异常", be);
                return super.failedStr(model, be);
            } catch (InterfaceException ie) {
                return super.failedStr(model, ie, param, ErrorCode.QUERY_TERMINAL_LIST);
            } catch (Exception e) {
                this.log.error("门户/app/mktRes/terminal/detail服务异常", e);
                return super.failedStr(model, ErrorCode.QUERY_TERMINAL_LIST, e, param);
            }
        }

        param.put("channelId", sessionStaff.getCurrentChannelId());
        String mktPrice = MapUtils.getString(param, "mktPrice", "0");
        if (!mktPrice.matches("([1-9]+[0-9]*|0)(\\.[\\d]+)?")) {
            mktPrice = "0";
        }
        param.put("mktResName", MapUtils.getString(param, "mktName", ""));
        param.put("salePrice", Integer.parseInt(mktPrice));
        param.put("mktPicA", MapUtils.getString(param, "mktPicA", ""));
        model.addAttribute("mktRes", param);
        if(param.get("newFlag") != null){//新版ui
        	 return "/app/mktRes_new/terminal-detail";
        }
        return "/app/mktRes/terminal-detail";
    }

	/**
	 * 终端合约套餐加载
	 * 
	 * @param session
	 * @param model
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/terminal/mktplan", method = RequestMethod.GET)
	public String termainlPlanOffer(@RequestParam Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try {
			String agreementType=param.get("agreementType").toString();
			String mktResCd=param.get("mktResCd").toString();
			paramMap.put("mktResCd", mktResCd);
			paramMap.put("agreementType", agreementType);
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());
			paramMap.put("sysFlag", Const.APP_SEARCH_OFFER_SYSFLAG);//系统标识
			//新接口改造，需要多传下面两个参数
			paramMap.put("channelId", sessionStaff.getCurrentChannelId());
			paramMap.put("staffId", sessionStaff.getStaffId());
			//operatorsId不空则加入传参
			if(sessionStaff.getOperatorsId()!=null && !"".equals(sessionStaff.getOperatorsId())){
				paramMap.put("operatorsId", sessionStaff.getOperatorsId());
			}
			model.addAttribute("agreementType", agreementType);
			
			Map<String, Object> offerByMtkResCdMap = mktResBmo
					.queryOfferByMtkResCd(paramMap, flowNum, sessionStaff);
			
			this.log.debug("offerByMtkResCdMap={}", JsonUtil.toString(offerByMtkResCdMap));
			if (MapUtils.isNotEmpty(offerByMtkResCdMap)) {
				offerByMtkResCdMap = (Map<String, Object>) offerByMtkResCdMap
						.get("result");
				List<Map<String, Object>> agreementOfferList = (List<Map<String, Object>>) offerByMtkResCdMap
						.get("agreementOfferList");

				// 列表为空，则应返回结果为空
				if (agreementOfferList == null
						|| agreementOfferList.size() == 0) {
					super.addHeadCode(response, ResultConstant.SERVICE_RESULT_EMPTY);
				}

				agreementOfferList = sortOfferList(agreementOfferList);
				model.addAttribute("aoList", agreementOfferList);
				model.addAttribute("aoListJson", JsonUtil.toString(agreementOfferList));
			} else {
				String msg = "查询不到终端相对应的合约业务！";
				super.addHeadCode(response, new Result(
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode(), msg));
			}
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/terminal/mktplan服务异常", be);
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_AGREEMENT);
		} catch (Exception e) {
			this.log.error("门户/mktRes/terminal/mktplan服务异常", e);
			return super.failedStr(model, ErrorCode.QUERY_AGREEMENT, e, paramMap);
		}
        if(param.get("newFlag")!=null){
        	return "/app/mktRes_new/terminal-plan-offer";
        }
		return "/app/mktRes/terminal-plan-offer2";
	}
	
	private List<Map<String, Object>> sortOfferList(
			List<Map<String, Object>> list) {
		this.log.debug("sort before={}", JsonUtil.toString(list));
		Collections.sort(list, new Comparator<Map<String, Object>>() {
			public int compare(Map<String, Object> e1, Map<String, Object> e2) {
				Double dbe1 = Double.parseDouble(e1.get("presentFeeRate").toString())*100;
				int inte1 = Integer.parseInt(dbe1.toString().substring(0, dbe1.toString().indexOf(".")));
				Double dbe2 = Double.parseDouble(e2.get("presentFeeRate").toString())*100;
				int inte2 = Integer.parseInt(dbe2.toString().substring(0, dbe2.toString().indexOf(".")));
				if (NumberUtils.isNumber(String.valueOf(inte1))) {
					long price1 = Long.parseLong(String.valueOf(inte1));
					long price2 = Long.parseLong(String.valueOf(inte2));
					if (price1 - price2 >= 0)
						return 1;
					else
						return -1;
				} else {
					return 1;
				}

			}
		});
		// 排序后
		this.log.debug("sort after={}", JsonUtil.toString(list));
		List<Map<String, Object>> periodList = new ArrayList<Map<String, Object>>();
		int period = -1;
		for (int i = 0, j = -1; i < list.size(); i++) {
			Map<String, Object> agreementOfferMap = list.get(i);
			Double dbtmpPeriod = Double.parseDouble(agreementOfferMap.get("presentFeeRate").toString())*100;
			int tmpPeriod = Integer.parseInt(dbtmpPeriod.toString().substring(0, dbtmpPeriod.toString().indexOf(".")));
//			int tmpPeriod = (int) Double.parseDouble(agreementOfferMap.get("presentFeeRate").toString())*100;
//			int tmpPeriod = (Integer) agreementOfferMap.get("agreementPeriod");
			Map<String, Object> tmpMap = new HashMap<String, Object>();
			if (period == tmpPeriod) {
				tmpMap = periodList.get(j);
				int count = Integer.parseInt("" + tmpMap.get("count"));
				tmpMap.put("count", count + 1);
				periodList.set(j, tmpMap);
			} else {
				period = tmpPeriod;
				tmpMap.put("period", period);
				tmpMap.put("count", "1");
				periodList.add(tmpMap);
				j++;
			}
		}
		this.log.debug("sort periodList={}", JsonUtil.toString(periodList));
		for (int i = 0, j = 0; i < periodList.size(); i++) {
			Map<String, Object> periodMap = periodList.get(i);
			int count = Integer.parseInt("" + periodMap.get("count"));
			List<Map<String, Object>> subList = list.subList(j, j + count);
			j += count;
			Collections.sort(subList, new Comparator<Map<String, Object>>() {
				public int compare(Map<String, Object> e1,
						Map<String, Object> e2) {
					if (e1.get("agreementPrice") != null && NumberUtils.isNumber(e1.get("agreementPrice").toString())
							&& e2.get("agreementPrice") != null && NumberUtils.isNumber(e2.get("agreementPrice").toString())) {
						int price1 = (Integer) e1.get("agreementPrice");
						int price2 = (Integer) e2.get("agreementPrice");
						if (price1 - price2 >= 0)
							return 1;
						else
							return -1;
					} else {
						return 1;
					}

				}
			});
			periodMap.put("subList", subList);
			periodList.set(i, periodMap);
		}
		this.log.debug("sort periodList 2nd sort={}",
				JsonUtil.toString(periodList));
		return periodList;
	}

    @RequestMapping(value = "/writeCard/cardDllInfo", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getCardDllInfoJson(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.getCardDllInfoJson(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.CARD_DLL_INFO, rMap, param);
            }
        } catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.CARD_DLL_INFO, e, param);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/writeCard/authCode", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getAuthCode(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.getAuthCode(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.GET_AUTH_CODE, rMap, param);
            }
        } catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.GET_AUTH_CODE, e, param);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/writeCard/cardInfo", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getCardInfo(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.getCardInfo(param, flowNum, sessionStaff);
            if (rMap != null && ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.GET_CARD_INFO, rMap, param);
            }
        } catch (Exception e) {
            return super.failed(ErrorCode.GET_CARD_INFO, e, param);
        }
        return jsonResponse;
    }

    @RequestMapping(value = "/writeCard/completeWriteCard", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse completeWriteCard(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.submitUimCardInfo(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCC.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.COMPLETE_WRITE_CARD, rMap, param);
            }
        } catch (BusinessException e) {
            this.log.error("写卡上报", e);
            jsonResponse = super.failed("写卡上报", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QUERY_COUPON);
        } catch (Exception e) {
            this.log.error("写卡上报", e);
            return super.failed(ErrorCode.COMPLETE_WRITE_CARD, e, param);
        }
        return jsonResponse;
    }

    /**
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/terminal/exchangePrepare", method = RequestMethod.GET)
    public String exchangeTerminal(Model model) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        return "/app/mktRes/terminal-exchange";
    }

    /**
     * 根据终端串码查询终端信息（如果是合约同时返回绑定的产品销售品信息）
     * 
     * @param param
     * @param flowNum
     * @return
     */
    @RequestMapping(value = "/terminal/queryCoupon", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryCoupon(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        param.put("areaId", sessionStaff.getCurrentAreaId());

        try {
            Map<String, Object> retnMap = mktResBmo.queryCoupon(param, flowNum, sessionStaff);
            if (MapUtils.isNotEmpty(retnMap)) {
                return super.successed(retnMap);
            } else {
                return super.failed("根据串号查询终端信息失败!", ResultConstant.FAILD.getCode());
            }
        } catch (BusinessException be) {
            this.log.error("门户/app/mktRes/terminal/queryCoupon服务异常", be);
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.QUERY_COUPON);
        } catch (Exception e) {
            this.log.error("门户/app/mktRes/terminal/queryCoupon服务异常", e);
            return super.failed(ErrorCode.QUERY_COUPON, e, param);
        }
    }

    /**
     * 打开销账（欠费查询）页面
     * @return
     */
    @RequestMapping(value = "/prepareOwingCharge", method = RequestMethod.GET)
    public String prepareOwingCharge() {
        return "/app/mktRes/owing_charge";
    }

    /**
     * 执行欠费查询操作
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/getOweCharge", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String getOweCharge(@RequestParam Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) throws BusinessException {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        try {
            Map<String, Object> resultMap = mktResBmo.getOweCharge(param, flowNum, sessionStaff);
            if (ResultCode.R_SUCCESS.equals(resultMap.get("code"))) {
                model.addAttribute("flag", 0);
                model.addAttribute("owingCharge", resultMap.get("result"));
            } else {
                model.addAttribute("flag", 1);
                if (resultMap.get("message") != null) {
                    model.addAttribute("errorMsg", resultMap.get("message"));
                }
            }
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_OVERDUE, e, param);
        }
        return "/app/mktRes/owing_charge_list";
    }

    /**
     * 销账
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/writeOffCash", method = { RequestMethod.GET, RequestMethod.POST })
    @AuthorityValid(isCheck = false)
    @ResponseBody
    public JsonResponse writeOffCash(@RequestBody Map<String, Object> param, Model model,
            @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        param.put("staffId", sessionStaff.getStaffId());
        param.put("areaId", sessionStaff.getAreaId());
        param.put("staffCode", sessionStaff.getStaffCode());
        try {
            DataBus db = mktResBmo.writeOffCash(param, flowNum, sessionStaff);
            if (ResultCode.R_SUCCESS.equals(db.getResultCode())) {
                Map<String, Object> resultMap = db.getReturnlmap();
                if (ResultCode.R_SUCCESS.equals(MapUtils.getString(resultMap, "code", ""))) {
                    return successed(resultMap, 0);
                } else {
                    return failed(MapUtils.getString(resultMap, "message", "销账失败"), 1);
                }
            } else {
                return super.failed(db.getResultMsg(), 1);
            }
        } catch (Exception e) {
            this.log.error("门户com.linkage.portal.service.lte.core.charge.WriteOffCash服务异常", e);
            return super.failed(ErrorCode.WRITE_OFF_CASH, e, param);
        }
    }

    @RequestMapping("qryPhoneNbrLevelInfoList")
    @AuthorityValid(isCheck = false)
    public String qryPhoneNbrLevelInfoList(Model model, @LogOperatorAnn String flowNum, HttpServletResponse response,
            HttpServletRequest request, HttpSession session) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        String org_level = request.getParameter("org_level");//原始的号码等级
        String pnLevelId = request.getParameter("pnLevelId");//修改过的号码等级
        String areaId = request.getParameter("areaId");
        param.put("queryFlag", "1");
        param.put("pnLevelId", org_level);//注意：页面显示的时候，显示修改以前的所有可选的号码等级。pnLevelId（修改过的号码等级）只是为了页面反选。
        model.addAttribute("pnLevelId", pnLevelId);
        model.addAttribute("org_level", org_level);
        param.put("areaId", areaId);
        try {
            DataBus aDataBus = mktResBmo.qryPhoneNbrLevelInfoList(param, flowNum, sessionStaff);
            Map<String, Object> resMap = aDataBus.getReturnlmap();
            String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
            List PnLevelProdOfferlist = new ArrayList();
            if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(appDesc)) {
                PnLevelProdOfferlist = (List) session.getAttribute(sessionStaff.getPartnerId() + "_"
                        + sessionStaff.getCurrentAreaId().substring(0, 3) + "0000");
            } else if (sessionStaff != null && SysConstant.APPDESC_LTE.equals(appDesc)) {
                PnLevelProdOfferlist = (List) session.getAttribute(sessionStaff.getCurrentAreaId().substring(0, 3)
                        + "0000");
            }
            Map result = new HashMap();
            List phoneNbrLevelList = new ArrayList();
            Map result1 = (Map) resMap.get("result");
            List reslist = (List) result1.get("phoneNbrLevelList");
            for (int i = 0; i < reslist.size(); i++) {
                Map remap = (Map) reslist.get(i);
                Map phmap = new HashMap();
                String flag = "false";
                for (int j = 0; j < PnLevelProdOfferlist.size(); j++) {
                    Map pnmap = (Map) PnLevelProdOfferlist.get(j);
                    if (remap.get("pnLevelId").toString().equals(pnmap.get("pnLevel").toString())) {
                        phmap.put("prePrice", Integer.parseInt(pnmap.get("price").toString()) / 100);
                        phmap.put("pnPrice", Integer.parseInt(pnmap.get("lowPrice").toString()) / 100);
                        flag = "true";
                        break;
                    }
                }
                if ("false".equals(flag)) {
                    phmap.put("prePrice", "0");
                    phmap.put("pnPrice", "0");
                }
                phmap.put("pnLevelCd", remap.get("pnLevelCd"));
                phmap.put("pnLevelDesc", remap.get("pnLevelDesc"));
                phmap.put("pnLevelId", remap.get("pnLevelId"));
                phmap.put("pnLevelName", remap.get("pnLevelName"));
                phoneNbrLevelList.add(phmap);
            }
            result.put("phoneNbrLevelList", phoneNbrLevelList);
            Map resultmap = new HashMap();
            resultmap.put("result", result);
            model.addAttribute("resMap", resultmap);
        } catch (Exception e) {
            this.log.error("门户service/PhoneNumberQryService/qryPhoneNbrLevelInfoList服务异常", e);
        }
        return "/app/mktRes/phonenbr_level_list";
    }
    
    /**
	 * 终端串号校验
	 * 
	 * @param mktInfo
	 *            终端串号信息
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/terminal/checkTerminal", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse checkTerminal(@RequestBody Map<String, Object> mktInfo,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			mktInfo.put("channelId", sessionStaff.getCurrentChannelId());
			mktInfo.put("receiveFlag","1");
			mktInfo.put("staffId",sessionStaff.getStaffId());
			mktInfo.put("channelName",sessionStaff.getCurrentChannelName());
//			String offerSpecName = MapUtils.getString(mktInfo, "offerSpecName")==null?" ":MapUtils.getString(mktInfo, "offerSpecName");
//			mktInfo.remove("offerSpecName");
			Map<String, Object> mktRes = mktResBmo.checkTerminalCodeForAgent(
					mktInfo, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(mktRes)) {
				//redmine 606920销售品构成查询优化
//	             if(ResultCode.R_SUCC.equals(MapUtils.getString(mktRes, "code"))){
					//update by huangjj3 营销资源返回终端可用再调用后台终端规格校验接口
//					if(StringUtils.isNotEmpty(MapUtils.getString(mktInfo, "offerSpecId"))){
//						Map<String, Object> mktInfoBack = new HashMap<String, Object>();
//						mktInfoBack.put("agreementOfferSpecID", MapUtils.getString(mktInfo, "offerSpecId"));
//						mktInfoBack.put("mktResCd", MapUtils.getString(mktRes, "mktResId"));
//						mktInfoBack.put("agreementName", offerSpecName);
//						mktInfoBack.put("mktResName",  MapUtils.getString(mktRes, "mktResName"));
//						Map<String, Object> mktResBack = mktResBmo.checkTerminalCodeBack(
//								mktInfoBack, flowNum, sessionStaff);
//						if(MapUtils.isNotEmpty(mktResBack)){
//							String resultCode = MapUtils.getString(mktResBack, "code");
//							if("1".equals(resultCode)){
//								return super.failed(MapUtils.getString(mktResBack, "message"), ResultConstant.FAILD.getCode());
//							}
//						}
//					}
//				}
				ArrayList obj =  (ArrayList) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_TERMINAL+"_"+sessionStaff.getStaffId());		
				if(obj == null || "null".equals(obj) || "".equals(obj)){
					obj = new ArrayList();
				}	
				List list = (List)obj;
				if(!list.contains(mktInfo.get("instCode"))){
					list.add(mktInfo.get("instCode"));
				}
				
				ArrayList obj2 =  (ArrayList)ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AGREEMENT+"_"+sessionStaff.getStaffId());		
				if(obj2 == null || "null".equals(obj2) || "".equals(obj2)){
					obj2 = new ArrayList();
				}	
				List list2 = (List)obj2;
				if(mktInfo.get("offerSpecId") != null && !list2.contains(mktInfo.get("offerSpecId"))){
					list2.add(mktInfo.get("offerSpecId"));
				}
				ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AGREEMENT+"_"+sessionStaff.getStaffId(), list2);
				ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_TERMINAL+"_"+sessionStaff.getStaffId(), list);
				return super.successed(mktRes);
			} else {
				return super.failed("校验终端串号失败", ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/terminal/checkTerminal服务异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, mktInfo, ErrorCode.CHECK_TERMINAL);
		} catch (Exception e) {
			this.log.error("门户/mktRes/terminal/checkTerminal服务异常", e);
			return super.failed(ErrorCode.CHECK_TERMINAL, e, mktInfo);
		}
	}
	
	@RequestMapping(value = "/uim/checkUim2", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse checkUim2(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		log.debug("session/uim/checkUim", sessionStaff);
		log.debug("session/uim/checkUim", sessionStaff.getStaffId());
		log.debug("session/uim/checkUim", sessionStaff.getCurrentChannelId());
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			if(sessionStaff != null && !"".equals(sessionStaff)){
				if(sessionStaff.getStaffId()!=null && !"".equals(sessionStaff.getStaffId())){
					param.put("staffId", sessionStaff.getStaffId());
				}else{
					param.put("staffId", param.get("staffId"));
				}
				if(sessionStaff.getCurrentChannelId()!=null && !"".equals(sessionStaff.getCurrentChannelId())){
					param.put("channelId", sessionStaff.getCurrentChannelId());
				}
				else{
					param.put("channelId", param.get("channelId"));
				}
				param.put("orderNo", "");
				rMap = mktResBmo.uimCheck(param, flowNum, sessionStaff);
				log.debug("rMap/uim/checkUim", rMap);
				if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
				} else {
					jsonResponse = super.failed(rMap,
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			}else{
				log.debug("sessionStaff为空", sessionStaff);
				log.debug("sessionStaff为空", sessionStaff.getStaffId());
				log.debug("sessionStaff为空", sessionStaff.getCurrentChannelId());
				Map<String, Object> failData = new HashMap<String, Object>();
				String result = JsonUtil.toString(sessionStaff);
				failData.put("msg", result);
				jsonResponse = super.failed(failData, ResultConstant.DATA_NOT_VALID_FAILTURE.getCode());
				return jsonResponse;
			}
		} catch (BusinessException e) {
			this.log.error("uim卡校验预占服务出错", e);
			jsonResponse = super.failed("uim卡校验预占服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.UIM_E_F);
		} catch (Exception e) {
			log.error("号码预占异常", e);
			return super.failed(ErrorCode.UIM_E_F, e, param);
		}
		return jsonResponse;
	}
	
	/**
	 * 翼销售宽带融合-标准地址查询
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/standaddress", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryStandaddress(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.queryStandaddress(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.STAND_ADDRESS, rMap, param);
            }
        } catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, rMap, ErrorCode.STAND_ADDRESS);
		} catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.STAND_ADDRESS, e, param);
        }
        return jsonResponse;
	}
	
	/**
	 * 宽带融合查询资源预占
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/rescapability", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryRescapability(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.queryRescapability(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.RESOURCE_ABILITY, rMap, param);
            }
        } catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.RESOURCE_ABILITY, e, param);
        }
        return jsonResponse;
	}	
	
	/**
	 * 宽带融合-终端预判
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/terminaltype", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryTerminaltype(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.queryTerminaltype(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.TERMINAL_TYPE, rMap, param);
            }
        } catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.TERMINAL_TYPE, e, param);
        }
        return jsonResponse;
	}	
	
	/**
	 * 宽带融合-号码资源查询
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/number", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryNumber(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.queryNumber(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.QUERY_NUMBER, rMap, param);
            }
        } catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.QUERY_NUMBER, e, param);
        }
        return jsonResponse;
	}	
	
	/**
	 * 宽带融合-号码资源预占、释放
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/numberrequest", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse numberRequest(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.numberRequest(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.NUMBER_REQUEST, rMap, param);
            }
        } catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.NUMBER_REQUEST, e, param);
        }
        return jsonResponse;
	}
	
	/**
	 * 宽带融合-账号-接入号-密码生成
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/accountrequest", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse accountRequest(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> rMap = null;
        JsonResponse jsonResponse = null;
        try {
            rMap = mktResBmo.accountRequest(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.ACCOUNT_REQUEST, rMap, param);
            }
        } catch (Exception e) {
            jsonResponse = super.failed(ErrorCode.ACCOUNT_REQUEST, e, param);
        }
        return jsonResponse;
	}
	/**
     * 客户端前台拍照上传服务
     * @param paramMap
     * @param flowNum
     * @param request
     * @param response
     * @return
     */
	@ResponseBody
    @RequestMapping(value = "/upLoadPicturesFileToFtp", method = RequestMethod.POST)
	public JsonResponse upLoadPicturesFileToFtp(@RequestBody Map<String, Object> param,@LogOperatorAnn String flowNum,
	        HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		log.debug("param={}", JsonUtil.toString(param));
//		String picturesInfo = param.get("picturesInfo").toString();
//		JSONArray arr = JSONArray.fromObject(picturesInfo);
//		String olId=MapUtil.asStr(param, "olId");
//		List<Map<String, Object>> picturesInfo = new ArrayList<Map<String, Object>>();
//		picturesInfo = (List<Map<String, Object>>) param.get("picturesInfo");
		
//		String picturesInfo = param.get("picturesInfo").toString();
//		JSONArray arr = JSONArray.fromObject(picturesInfo);
		String olId=MapUtil.asStr(param, "olId");
//		param.put("picturesInfo",arr);
		param.put("areaId", sessionStaff.getCurrentAreaId());
		param.put("srcFlag", "REAL");
		param.put("accNbr", sessionStaff.getInPhoneNum());
		param.put("certType", sessionStaff.getCardType());
		param.put("certNumber", sessionStaff.getCardNumber());
		if(!StringUtil.isEmptyStr(olId)){
			param.put("olId",olId);
		}
    	Map<String, Object> rMap = null;
    	JsonResponse jsonResponse=null;
    	try {
            rMap = mktResBmo.upLoadPicturesFileToFtp(param, flowNum, sessionStaff);
            if (rMap != null && ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
                jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(ErrorCode.FTP_UPLOAD_ERROR, rMap, param);
            }
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
        	jsonResponse = super.failed(ie, param, ErrorCode.FTP_UPLOAD_ERROR);
        } catch (Exception e) {
        	jsonResponse = super.failed(ErrorCode.FTP_UPLOAD_ERROR, rMap, param);
        } 
    	
    	return jsonResponse;
	}
    /**
     * 1主推终端页面
     * @param model
     * @param session
     * @param flowNum
     * @return
     * @throws AuthorityException
     */
    @RequestMapping(value = "/terminalListUI", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String terminalListUI(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        model.addAttribute("default_area_id", sessionStaff.getCurrentAreaId());
        return "/app/mktRes/terminalMainPush-list";
    }
    
    /**
  	 * 终端规格排序
  	 * @param model
  	 * @param param
  	 * @return
  	 */
      @SuppressWarnings({ "unchecked", "deprecation", "rawtypes" })
      @RequestMapping(value = "/termSort", method = {RequestMethod.GET, RequestMethod.POST})
      @ResponseBody
      public JsonResponse termSort(Model model, @LogOperatorAnn String flowNum,@RequestBody Map<String, Object> param) {
      	JsonResponse jsonResponse = null;
      	String resultCode="0";
      	try {
      		
      		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
      				SysConstant.SESSION_KEY_LOGIN_STAFF);
      		Date date = new Date();
    		    String reqTime= DateFormatUtils.format(date, "yyyyMMddHHmmssSSS");
    		    int randInt = RandomUtils.nextInt(900000000) + 100000000;
  	    	Map map =new HashMap();
  	    	Map reqInfoMap =new HashMap();
  	    	String srcSysID = SysConstant.CSB_SRC_SYS_ID_APP;
  	    	reqInfoMap.put("tranId", reqTime + randInt);
  	    	reqInfoMap.put("areaId", sessionStaff.getAreaId());
  	    	reqInfoMap.put("reqTime", reqTime.substring(0, 14));
  	    	reqInfoMap.put("srcSysID", srcSysID);
  	    	//reqInfoMap.put("distributorId", sessionStaff.getPartnerId());
  	    	reqInfoMap.put("requestService", "TermSortService");
  	    	map.put("reqInfo", reqInfoMap);
  	    	map.put("moduleId", 1000);
  	    	map.put("newFlag", 1);
  	    	map.put("objId", sessionStaff.getCurrentChannelId());
  	    	map.put("objType", 20001);
  	    	map.put("areaId", sessionStaff.getAreaId());
  	    	map.put("staffId", sessionStaff.getStaffId());
  	    	/*List<Map> mktResListMap =new ArrayList<Map>();
  	    	Map mktResMap =new HashMap();
  	    	param.get("mktResList");
  	    	mktResMap.put("mktResId", "7345");
  	    	mktResMap.put("sortId", "1");
  	    	mktResListMap.add(0, mktResMap);*/
  	    	/*for(int i = 0 ;i < mktResListMap.size(); i++){
  	    		mktResListMap.add(i, mktResMap);
  	    	}*/
  	    	map.put("mktResList", param.get("mktResList"));
  		    Map<String, Object> resultMap = this.mktResBmo.termSort(map,flowNum,sessionStaff);
  		    /*if(resultCode.equals("POR-0000")){
  		    	jsonResponse = super.successed(resultCode,ResultConstant.SUCCESS.getCode());
  		    }else{
  		    	jsonResponse = super.failed(resultCode,ResultConstant.FAILD.getCode());
  		    }*/
  		    resultCode = resultMap.get("resultCode").toString();
  		    String resultMsg = resultMap.get("resultMsg").toString();
  		    if("0".equals(resultCode)){
  		    	jsonResponse = super.successed(resultMsg,ResultConstant.SUCCESS.getCode());
  		    }else{
  		    	jsonResponse = super.failed(resultMsg,ResultConstant.FAILD.getCode());
  		    }
      	} catch (Exception e) {
      		this.log.error("门户/mktRes/terminal/termSort服务异常", e);
      		jsonResponse = super.failed("服务异常",-1);
  		}
  		return jsonResponse;
      }
    
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/terminalQueryList", method = { RequestMethod.POST }, produces = "text/html;charset=UTF-8")
    @LogOperatorAnn(desc = "主推终端查询", code = "TERMINAL_QUERY", level = LevelLog.DB)
    public String terminalQueryList(@RequestBody Map<String, Object> param, Model model, @LogOperatorAnn String flowNum,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        param.put("channelId", sessionStaff.getCurrentChannelId());
        try {

            Map<String, Object> mktResMap = mktResBmo.queryMktResInfo(param, flowNum, sessionStaff);
            Object obj = MapUtils.getObject(mktResMap, "mktResList");
            if (obj != null && obj instanceof List) {
                List<Map<String, Object>> mktResList = (List<Map<String, Object>>) obj;
                String mktResPicUrl = propertiesUtils.getMessage(SysConstant.MKT_RES_PIC_URL);
                if (StringUtils.isNotEmpty(mktResPicUrl)) {
                    log.debug("mktResPicUrl:{}", mktResPicUrl);
                    model.addAttribute("mktResPicUrl", mktResPicUrl);
                }
                Map<String, Object> mktPageInfo = MapUtil.map(mktResMap, "mktPageInfo");
                // 设置分页对象信息
                PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(mktPageInfo,
                        "pageIndex", 1), MapUtils.getIntValue(mktPageInfo, "pageSize", 10), MapUtils.getIntValue(
                        mktPageInfo, "totalCount", 0), mktResList);
                model.addAttribute("pageModel", pm);
            } else {
                super.setNoCacheHeader(response);
            }
            model.addAllAttributes(param);
        } catch (BusinessException be) {
            this.log.error("门户/app/mktRes/terminalQueryList服务异常", be);
            return super.failedStr(model, be);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, param, ErrorCode.QUERY_TERMINAL_LIST);
        } catch (Exception e) {
            this.log.error("门户/app/mktRes/terminalQueryList服务异常", e);
            return super.failedStr(model, ErrorCode.QUERY_TERMINAL_LIST, e, param);
        }

        return "/app/terminal/terminal-search";
    }
}

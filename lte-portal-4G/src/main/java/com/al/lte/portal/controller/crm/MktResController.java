package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
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
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.bmo.staff.StaffChannelBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.CommonUtils;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.ExcelUtil;
import com.al.lte.portal.common.IDCard;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;
 
/**
 * 营销资源控制层
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.crm.MktResController")
@RequestMapping("/mktRes/*")
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
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffChannelBmo")
	private StaffChannelBmo staffChannelBmo;
	
	/**
	 * 改号，跳转查询特面
	 * @param model
	 * @param param
	 * @return
	 */
	@RequestMapping(value = "/telnumcg-prepare", method = RequestMethod.GET)
	public String telnumChangePrepare(Model model,@RequestParam Map<String, Object> param) {
		model.addAttribute("current", "business");	
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String subPage=MapUtils.getString(param, "subPage", "number");
		String phoneNumber=MapUtils.getString(param, "oldPhoneNumber","");
		String anTypeCd=MapUtils.getString(param, "oldAnTypeCd","");
		try {//选号页面，查询员工是否有修改号码等级的权限
            String res=staffBmo.checkOperatSpec("CHOOSE_PNLEVEL", sessionStaff);
            model.addAttribute("can_change_level", res);
        } catch (Exception e1) {
            e1.printStackTrace();
        }
		if(!"".equals(phoneNumber)&&!"".equals(anTypeCd)){
			param.putAll(getAreaInfos(""));
			try {
				param.put("staffId", sessionStaff.getStaffId());
				param.put("orderNo","");
				mktResBmo.prePhoneNumber(param, "", sessionStaff);
			} catch (BusinessException e) {
				
			} catch (InterfaceException ie) {
				
			} catch (Exception e) {
				
			}
		}
		model.addAttribute("subPage", subPage);
		return "/product/telnum-change-prepare";
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
	public String telnumcgList(@RequestParam Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession session) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> list = null;
		String areaId=(String) param.get("areaId");
		param.putAll(getAreaInfos(areaId));
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
//						String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
//						List PnLevelProdOfferlist = new ArrayList();
//						if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(appDesc)) {
//							PnLevelProdOfferlist = (List) session.getAttribute(sessionStaff.getPartnerId()+"_"+sessionStaff.getCurrentAreaId().substring(0, 3)+"0000");
//						} else if (sessionStaff != null && SysConstant.APPDESC_LTE.equals(appDesc)) {
//							PnLevelProdOfferlist = (List) session.getAttribute(sessionStaff.getCurrentAreaId().substring(0, 3)+"0000");
//						}
//						Map result = new HashMap();
//						List phoneNumList = new ArrayList();
//						for(int i=0;i<list.size();i++){
//							Map remap = (Map)list.get(i);
//							Map phmap = new HashMap();
//							String flag = "false";
//							for (int j=0;PnLevelProdOfferlist != null && j<PnLevelProdOfferlist.size();j++){
//								Map pnmap = (Map)PnLevelProdOfferlist.get(j);
//								if(remap.get("pnLevelId").toString().equals(pnmap.get("pnLevelId").toString())){
//									phmap.put("prePrice", Integer.parseInt(pnmap.get("prePrice").toString()));
//									phmap.put("pnPrice", Integer.parseInt(pnmap.get("pnPrice").toString()));
//									flag = "true";
//									break;
//								}
//							}
//							if("false".equals(flag)){
//								phmap.put("prePrice", "0");
//								phmap.put("pnPrice", "0");
//							}
//							phmap.put("anTypeCd", remap.get("anTypeCd"));
//							phmap.put("areaId", remap.get("areaId"));
// 							phmap.put("zoneNumber", remap.get("zoneNumber"));
//							phmap.put("needPwd", remap.get("needPwd"));
//							phmap.put("phoneNumber", remap.get("phoneNumber"));
//							phmap.put("phoneNumberId", remap.get("phoneNumberId"));
//							phmap.put("pnCharacterId", remap.get("pnCharacterId"));
//							phmap.put("pnLevelId", remap.get("pnLevelId"));
//							phmap.put("provinceId", remap.get("provinceId"));
//							phoneNumList.add(phmap);
//						}
//						result.put("phoneNumList", phoneNumList);
//						Map resultmap = new HashMap();
//						resultmap.put("result", result);
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
		return "/product/telnum-change-list";
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
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
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
		return "/product/telnum-change-list";
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
	public JsonResponse queryProdInstAccNbr(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = mktResBmo.queryProdInstAccNbr(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCC.equals(rMap.get("resultCode").toString())) {
				jsonResponse=super.successed(rMap.get("result"), ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse =super.failed(rMap, 1);
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
	public String prepare(Model model,@RequestParam Map<String, Object> param) {
		model.addAttribute("current", "business");	
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String subPage=MapUtils.getString(param, "subPage", "number");
		try {//选号页面，查询员工是否有修改号码等级的权限
            String res=staffBmo.checkOperatSpec("CHOOSE_PNLEVEL", sessionStaff);
            model.addAttribute("can_change_level", res);
            List<Map<String, Object>> list = null;
            try {
            	param.put("staffId", sessionStaff.getStaffId());
            	Map<String, Object> datamap = this.mktResBmo.pnLowAndPrePriceQry(param,
	    				null, sessionStaff);
	    		if (datamap != null) {
	    			String code2= (String) datamap.get("code");
	    			if (ResultCode.R_SUCCESS.equals(code2)) {
	    				Object obj2 = datamap.get("lowPriceList");
	    				if (obj2 instanceof List) {
	    					list = (List<Map<String, Object>>) datamap.get("lowPriceList");
	    				} if (list == null) {
	    				    
	    				} else {
	                        model.addAttribute("lowPriceList", list);
	    				}
	    			}
	    		}
            } catch (Exception e) {
                
            }
        } catch (Exception e1) {
            e1.printStackTrace();
        }
		model.addAttribute("subPage", subPage);
		return "/order/order-phonenumber-prepare";
	}
	
	//号池查询
	@RequestMapping(value = "/phonenumber/queryPhoneNbrPool", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryPhoneNbrPool(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum) throws BusinessException {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			param.put("staffId", sessionStaff.getStaffId());
			param.put("channelId", sessionStaff.getCurrentChannelId());
			//rMap = mktResBmo.uimCheck(param, flowNum, sessionStaff);
			rMap = mktResBmo.queryNbrPool(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("号池查询服务出错", e);
			jsonResponse = super.failed("号池查询服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QRY_NUMBERPOOL);
		} catch (Exception e) {
			log.error("号池查询", e);
			return super.failed(ErrorCode.QRY_NUMBERPOOL, e, param);
		}
		return jsonResponse;
	}
	
	private Map<String, Object> getAreaInfos(String areaId){
    	Map<String,Object> map=new HashMap<String,Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		if(areaId == null || "".equals(areaId)){
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
	
	@RequestMapping(value = "/phonenumber/list", method = { RequestMethod.POST })
	public String list(@RequestBody Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response,HttpServletRequest request,HttpSession session) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String queryFlag=(String)param.get("isReserveFlag");
		if("1".equals(queryFlag)){
			if(commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)){
				
			}else{
				super.addHeadCode(response,ResultConstant.SERVICE_RESULT_FAILTURE);
				return "/order/reserve-phonenumber-list";
			}
		}
		try{
			//记录表SP_BUSI_RUN_LOG
			String custlogflag = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"CUSTLOGFLAG");
			if("ON".equals(custlogflag)){
				Map<String, Object> logmap = new HashMap<String, Object>();
				logmap.put("STAFF_CODE", sessionStaff.getStaffCode());
				logmap.put("SESSIONINFO", "");
				logmap.put("STATUS_CD", "选择号码");
				logmap.put("STAFF_ID", sessionStaff.getStaffId());
				logmap.put("SALES_CODE", sessionStaff.getSalesCode());
				logmap.put("HOST_IP", CommonUtils.getAllAddrPart());
				logmap.put("INTF_URL", "PnQueryService");
				logmap.put("IDENTIDIES_TYPE", "");
				logmap.put("IDENTITY_NUM", "");
				logmap.put("OPERATION_PLATFORM", SysConstant.APPDESC_LTE);
				logmap.put("ACTION_IP", ServletUtils.getIpAddr(request));
				logmap.put("CHANNEL_ID", sessionStaff.getCurrentChannelId());
				logmap.put("OPERATORS_ID", sessionStaff.getOperatorsId());
				logmap.put("AREA_ID", sessionStaff.getCurrentAreaId());
				logmap.put("IN_PARAM", JsonUtil.toString(param));
				staffBmo.insert_sp_busi_run_log(logmap,flowNum,sessionStaff);
			}
		}catch (Exception e) {
			//异常在之前就捕获了，这里不做处理
		}
		
		try{
			/*//访问次数限制  update by huangjj3 20160411 通过过滤器对过频操作进行限制
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
							if(queryFlag.equals("1")){
								return "/order/reserve-phonenumber-list";
							}else{
								return "/order/order-phonenumber-list";
							}
						}
					}
				}else{
					session.setAttribute(sessionStaff.getStaffCode()+"nbrtime", endTime);
					session.setAttribute(sessionStaff.getStaffCode()+"nbrcount", 1);
				}
			}else{
				session.setAttribute(sessionStaff.getStaffCode()+"nbrtime", endTime);
				session.setAttribute(sessionStaff.getStaffCode()+"nbrcount", 1);
			}*/
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
//						String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
//						List PnLevelProdOfferlist = new ArrayList();
//						if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(appDesc)) {
//							PnLevelProdOfferlist = (List) session.getAttribute(sessionStaff.getPartnerId()+"_"+sessionStaff.getCurrentAreaId().substring(0, 3)+"0000");
//						} else if (sessionStaff != null && SysConstant.APPDESC_LTE.equals(appDesc)) {
//							PnLevelProdOfferlist = (List) session.getAttribute(sessionStaff.getCurrentAreaId().substring(0, 3)+"0000");
//						}
//						Map result = new HashMap();
//						List phoneNumList = new ArrayList();
//						for(int i=0;i<list.size();i++){
//							Map remap = (Map)list.get(i);
//							Map phmap = new HashMap();
//							String flag = "false";
//							for (int j=0;PnLevelProdOfferlist != null && j<PnLevelProdOfferlist.size();j++){
//								Map pnmap = (Map)PnLevelProdOfferlist.get(j);
//								if(remap.get("pnLevelId").toString().equals(pnmap.get("pnLevelId").toString())){
//									phmap.put("prePrice", Integer.parseInt(pnmap.get("prePrice").toString()));
//									phmap.put("pnPrice", Integer.parseInt(pnmap.get("pnPrice").toString()));
//									flag = "true";
//									break;
//								}
//							}
//							if("false".equals(flag)){
//								phmap.put("prePrice", "0");
//								phmap.put("pnPrice", "0");
//							}
//							phmap.put("anTypeCd", remap.get("anTypeCd"));
//							phmap.put("areaId", remap.get("areaId"));
// 							phmap.put("zoneNumber", remap.get("zoneNumber"));
//							phmap.put("needPwd", remap.get("needPwd"));
//						phmap.put("phoneNumber", remap.get("phoneNumber"));
//						phmap.put("phoneNumberId", remap.get("phoneNumberId"));
//						phmap.put("pnCharacterId", remap.get("pnCharacterId"));
//						phmap.put("pnLevelId", remap.get("pnLevelId"));
//						phmap.put("provinceId", remap.get("provinceId"));
//						phoneNumList.add(phmap);
//					}
//						result.put("phoneNumList", phoneNumList);
//						Map resultmap = new HashMap();
//						resultmap.put("result", result);
						model.addAttribute("phoneNumList", list);
						model.addAttribute("ispurchased", "0");
						model.addAttribute("areaId", areaId);
						ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AGREEMENT+"_"+sessionStaff.getStaffId());
						ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_TERMINAL+"_"+sessionStaff.getStaffId());
					//	ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_NUMBER+"_"+sessionStaff.getStaffId());
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
		if(queryFlag.equals("1")){
			return "/order/reserve-phonenumber-list";
		}else{
			return "/order/order-phonenumber-list";
		}
	}
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/phonenumber/listByIdentity", method = RequestMethod.GET)
	public String listByIdentity(@RequestParam Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> list = null;
		Map<String, Object> listByIdentityParam = new HashMap<String, Object>();
		listByIdentityParam.put("identityId", MapUtils.getString(param, "identityId", ""));
		listByIdentityParam.put("areaId", MapUtils.getString(param, "areaId", ""));
		try {
			Map<String, Object> checkIdMap = new HashMap<String, Object>();
			try {
				//客户的身份证件 需要与 号码预约时所使用身份证件号码 相同
				Map sessionCustInfo = (Map) super.getRequest().getSession().getAttribute(SysConstant.SESSION_CURRENT_CUST_INFO);
				if (sessionCustInfo != null && sessionCustInfo.containsKey("custId") && sessionCustInfo.containsKey("areaId")) {
					checkIdMap = param;
					checkIdMap.put("areaId", sessionCustInfo.get("areaId"));
					checkIdMap.put("custId", sessionCustInfo.get("custId"));
					checkIdMap.put("staffId", sessionStaff.getStaffId());
					checkIdMap.put("idCardNumber", MapUtils.getString(param, "identityId", ""));
					checkIdMap.remove("identityId");
					
					Map<String, Object> datamap = this.mktResBmo.checkIdCardNumber(checkIdMap,
							flowNum, sessionStaff);
					if (datamap != null) {
						String code = (String) datamap.get("code");
						if (!ResultCode.R_SUCC.equals(code)) {
							model.addAttribute("isUnified","false");
							return "/order/order-phonenumber-list";
						}
					}
				}
			} catch (BusinessException e) {
				this.log.error("客户证件校验失败", e);
				super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
			} catch (InterfaceException ie) {
				return super.failedStr(model, ie, checkIdMap, ErrorCode.IDCARDNUM_CHECK);
			} catch (Exception e) {
				return super.failedStr(model, ErrorCode.IDCARDNUM_CHECK, e, checkIdMap);
			}

			String areaId=(String) listByIdentityParam.get("areaId");
			listByIdentityParam.putAll(getAreaInfos(areaId));
			listByIdentityParam.put("phoneNumber", "");
			Map<String, Object> datamap = this.mktResBmo.queryNumberByIdentityId(listByIdentityParam,
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
			return super.failedStr(model, ie, listByIdentityParam, ErrorCode.PHONENUM_IDENTITY);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.PHONENUM_IDENTITY, e, listByIdentityParam);
		}
		model.addAllAttributes(listByIdentityParam);
		return "/order/order-phonenumber-list";
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
				Object obj =  ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_NUMBER+"_"+sessionStaff.getStaffId());		
				if(obj == null || "null".equals(obj) || "".equals(obj)){
					obj = new ArrayList();
	            }	
				List list = (List)obj;
				list.remove(param.get("oldPhoneNumber"));
				if(param.get("newPhoneNumber") != null){
					list.add(param.get("newPhoneNumber"));
				}else{
					list.add(param.get("phoneNumber"));
				}
				ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_NUMBER+"_"+sessionStaff.getStaffId(), list);
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
				//新装、加装新号码作为副卡，则经办人必须填写且拍照，这里统一做记录标识，用于session校验，防止绕过
				if("handleCust".equals(MapUtils.getString(param, "queryFlag", ""))){
					ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.IS_ACTION_FLAG_LIMITED, true);
				}
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
	
	@RequestMapping(value = "/uim/getMktResCd", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getMktResCd(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
	    Map<String, Object> pMap = new HashMap<String, Object>();
	    String prodSpecId = MapUtils.getString(param, "prodSpecId");
	    String columnValue = "";
	    JsonResponse jsonResponse = null;
        pMap.put("tableName", "SYSTEM_PROD_SPEC_TO_CARD");
        pMap.put("columnName", prodSpecId);
	    try {
            rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
            if (rList instanceof List){
    			List lt = (List)rList;
    			for (int i = 0; i<lt.size(); i++){
    				Map mp = (Map)lt.get(i);
    				Object oo = MapUtils.getObject(mp, prodSpecId);
    				List ltt = (List)oo;
    				for (int j = 0; j<ltt.size(); j++){
    					Map mpp = (Map)ltt.get(j);
    					columnValue = MapUtils.getString(mpp, "COLUMN_VALUE");
    				}
    			}
    		}
            if (columnValue != "") {
				jsonResponse=super.successed(columnValue, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(columnValue,
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
        } catch (Exception e) {
        	log.error("查询卡类型失败", e);
            e.printStackTrace();
        }
		return jsonResponse;
	}
	
	/**
	 * 转至异常单释放页面，释放异常单的号码资源
	 */
	@RequestMapping(value = "/phonenumber/preNumRelease", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
	public String preNumRelease(HttpSession session, Model model)throws AuthorityException{
		
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String end = sdf.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
		String start = sdf.format(calendar.getTime());
		model.addAttribute("p_startTime", start);
		model.addAttribute("p_endTime", end);
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"mktRes/phonenumber/preNumRelease"));
		
		return "/orderRelease/order-error-query";
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
	public String queryReleaseNum(@RequestParam Map<String, Object> param, @LogOperatorAnn String flowNum, 
			Model model, HttpServletResponse response,HttpServletRequest request)throws BusinessException{
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.
			getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF); 
		
		param.put("staffCode", sessionStaff.getStaffCode());
//		param.put("areaId", sessionStaff.getCurrentAreaId());
		param.put("areaId", MapUtils.getString(param,"areaId",sessionStaff.getCurrentAreaId()));

		try{
			//查询引工号异常单释放是否有查询并释放同一渠道下其它员工异常单权限
			String hasChannelAuth=staffBmo.checkOperatSpec(SysConstant.EXCEPTION_ORDER_CHANNEL_QUERY,sessionStaff);
			if(ResultCode.R_SUCC.equals(hasChannelAuth)){
				param.put("channelId", MapUtils.getString(param,"channelId",sessionStaff.getCurrentChannelId()));
			}
			Map<String, Object> resultMap = mktResBmo.queryReleaseNum(param, flowNum, sessionStaff);
			
			if(resultMap!=null && resultMap.get("code")!=null){
				if(resultMap.get("code").equals("POR-0000")){
					Map<String, Object> result = (Map<String, Object>)resultMap.get("result");
					if(result!=null && result.get("numberList")!=null){
						ArrayList<Map<String, Object>> numberList = (ArrayList<Map<String, Object>>)result.get("numberList");
						HttpSession session = request.getSession();
						session.setAttribute(SysConstant.NUMBERLIST, numberList);
						if(numberList.size()>0){
							if(result.get("totalNumber")!=null){
								int pageNo = Integer.parseInt(param.get("pageIndex").toString());
								int totalRecords = Integer.parseInt(result.get("totalNumber").toString());
								PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, 10, totalRecords<1?1:totalRecords, numberList);
								model.addAttribute("pageModel", pm);
								//数据返回正常&&查询成功&&结果不为空
								model.addAttribute("flag", 0);			
							}
							else{
								//数据返回异常
								model.addAttribute("flag", -1);
							}							
						}
						else{
							//数据返回正常&&查询成功&&结果为空
							model.addAttribute("flag", 1);
						}									
					}
					else{
						//数据返回异常
						model.addAttribute("flag", -1);
					}
				}
				else{		
					//数据返回正常&&查询失败
					model.addAttribute("flag", 2);
				}
			}
			else{
				//数据返回异常
				model.addAttribute("flag", -1);
			}			
		}catch(BusinessException be){
			return super.failedStr(model, be);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_RES_RELEASE, e, param);
		}			
		return "/orderRelease/order-error-list";				
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
	public JsonResponse releaseUIM(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response,HttpServletRequest request) {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		String numType = param.get("numType").toString();
		String numValue = param.get("numValue").toString();
		
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		String serialNumberCode = MapUtils.getString(param, "serialNumberCode", "");
		String type =  MapUtils.getString(param, "type", "");
		param.remove("type");
		dataBusMap.put("actionType", "F");
		dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
		dataBusMap.put("staffId", sessionStaff.getStaffId());
		HttpSession session = request.getSession();
		ArrayList<Map<String, Object>> numberList = (ArrayList<Map<String, Object>>)session.getAttribute(SysConstant.NUMBERLIST);
		if(numType.equals("1")){
			boolean falg = false;
			if(numberList != null){
				for(Map<String, Object> map : numberList){
					String nbr_type = (String) map.get("ACC_NBR_TYPE");
					String acc_nbr = (String) map.get("ACC_NBR");
					if("1".equals(nbr_type) && numValue.equals(acc_nbr)){
						falg = true;
					}
				}
			}
			if(!falg && !"".equals(type)){
				return failed("号码参数有误", -1);
			}
			dataBusMap.put("phoneNumber", numValue);
		}else{
			boolean falg = false;
			if(numberList != null){
				for(Map<String, Object> map : numberList){
					String nbr_type = (String) map.get("ACC_NBR_TYPE");
					String acc_nbr = (String) map.get("ACC_NBR");
					if(!"1".equals(nbr_type) && serialNumberCode.equals(acc_nbr)){
						falg = true;
					}
				}
			}
			if(!falg && !"".equals(type)){
				return failed("UIM卡参数有误", -1);
			}
			dataBusMap.put("instCode", numValue);
		}
		if(param.get("areaId") != null){ //异常单释放取选择的地区，不传（填单释放号码时不传该值）则取当前渠道areaId
			dataBusMap.put("areaId", param.get("areaId").toString());
		}
		
		JsonResponse jr = new JsonResponse();
		String selUimType =  MapUtils.getString(param, "selUimType", "");
		try{
			Map<String, Object> resultMap = mktResBmo.releaseErrorNum(dataBusMap, flowNum, sessionStaff);
			
			if(resultMap!=null && resultMap.get("resultCode")!=null){
				if(resultMap.get("resultCode").equals("0")){
					//号码释放成功，开始更新被释放的号码的状态，重新组装入参
					dataBusMap.clear();
					if("3".equals(selUimType) || "2".equals(selUimType)){
						numValue = serialNumberCode ;
					}
					dataBusMap.put("accNbr", numValue);
					dataBusMap.put("accNbrType", numType);
					dataBusMap.put("action", "UPDATE");
					
					try{
						Map<String, Object> returnMap = mktResBmo.updateNumStatus(dataBusMap, flowNum, sessionStaff);
						
						if(returnMap!=null && returnMap.get("code")!=null){
							if(returnMap.get("code").equals("POR-0000")){
								jr = successed("", 0);
							}
							else{
								if(returnMap.get("message")!=null){
									jr = failed(returnMap.get("message"), 1);
								}
								else{
									jr = failed("号码状态更新失败，请联系管理员", 1);
								}
							}
						}
						else{
							jr = failed("号码状态更新异常，请联系管理员", 1);
						}
					}catch(BusinessException be){
						return super.failed(be);
					} catch (Exception e) {
						return super.failed(ErrorCode.UPDATE_RES_STATE, e, dataBusMap);
					}
				}
				else{
					if(resultMap.get("resultMsg")!=null){
						jr = failed(resultMap.get("resultMsg"), -1);
					}
					else{
						jr = failed("", -1);
					}
				}
			}
			else{
				jr = failed("", -1);
			}
		}catch(BusinessException be){
			return super.failed(be);
		}catch(InterfaceException ie){
			if(dataBusMap.get("accNbrType")==null){
				return super.failed(ie, dataBusMap, ErrorCode.UIM_E_F);
			}else if("1".equals(dataBusMap.get("accNbrType").toString())){
				return super.failed(ie, dataBusMap, ErrorCode.PHONENUM_E_F_C);
			}
			else{
				return super.failed(ie, dataBusMap, ErrorCode.UIM_E_F);
			}			
		}catch(Exception e){
			if(dataBusMap.get("accNbrType")==null){
				return super.failed(ErrorCode.UIM_E_F, e, dataBusMap);
			}else if(dataBusMap.get("accNbrType").toString().equals("1")){
				return super.failed(ErrorCode.PHONENUM_E_F_C, e, dataBusMap);
			}
			else{
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
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		model.addAttribute("default_area_id", sessionStaff.getCurrentAreaId());
		return "/mktRes/terminal-prepare";
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/terminal/list", method = { RequestMethod.POST }, produces = "text/html;charset=UTF-8")
	@LogOperatorAnn(desc = "终端查询", code = "TERMINAL_QUERY", level = LevelLog.DB)
	public String terminalList(@RequestBody Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		param.put("channelId", sessionStaff.getCurrentChannelId());
		try {

			Map<String, Object> mktResMap = mktResBmo.queryMktResInfo(
					param, flowNum, sessionStaff);
			Object obj = MapUtils.getObject(mktResMap, "mktResList");
			if (obj != null && obj instanceof List) {
				List<Map<String, Object>> mktResList = (List<Map<String, Object>>) obj;
				for (int i = 0; i < mktResList.size(); i++) {
					Map<String, Object> tmpResMap = mktResList.get(i);
					
				}
				String mktResPicUrl = propertiesUtils.getMessage(SysConstant.MKT_RES_PIC_URL);
				if (StringUtils.isNotEmpty(mktResPicUrl)) {
					log.debug("mktResPicUrl:{}", mktResPicUrl);
					model.addAttribute("mktResPicUrl", mktResPicUrl);
				}
				Map<String, Object> mktPageInfo = MapUtil.map(mktResMap, "mktPageInfo");
				// 设置分页对象信息
				PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
						MapUtils.getIntValue(mktPageInfo, "pageIndex", 1),
						MapUtils.getIntValue(mktPageInfo, "pageSize", 12),
						MapUtils.getIntValue(mktPageInfo, "totalCount", 0),
						mktResList);
				model.addAttribute("pageModel", pm);
			    ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_AGREEMENT+"_"+sessionStaff.getStaffId());
				ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_TERMINAL+"_"+sessionStaff.getStaffId());
				ServletUtils.removeSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_NUMBER+"_"+sessionStaff.getStaffId());
			} else {
				super.setNoCacheHeader(response);
			}
			model.addAllAttributes(param);
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/terminal/list服务异常", be);
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.QUERY_TERMINAL_LIST);
		} catch (Exception e) {
			this.log.error("门户/mktRes/terminal/list服务异常", e);
			return super.failedStr(model, ErrorCode.QUERY_TERMINAL_LIST, e, param);
		}
		if("zdyy".equals(param.get("pageType"))){
			return "/mktRes/terminal-zdyylist";
		}else if("terminalInfo".equals(param.get("pageType"))){
			return "/mktRes/terminal-infolist";
		}
		return "/mktRes/terminal-list";
	}

	@RequestMapping(value = "/terminal/detail", method = RequestMethod.POST)
	public String terminalDetail(@RequestBody Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		if(param.get("is4G")!=null){
			Map<String, Object> paramTemp=new HashMap<String, Object>();
			if(param.get("mktSpecCode")!=null){
				String mktSpecCode=param.get("mktSpecCode").toString();
				param.put("mktSpecCode", mktSpecCode);
				if(mktSpecCode.length()>=22){
					mktSpecCode=mktSpecCode.substring(0, 22);
				}
				paramTemp.put("mktSpecCode", mktSpecCode);
			}
			paramTemp.put("pageInfo",param.get("pageInfo"));
			paramTemp.put("mktResCd", "");
			paramTemp.put("mktResName", "");
			paramTemp.put("mktResType", "");
			paramTemp.put("minPrice", "");
			paramTemp.put("maxPrice", "");
			paramTemp.put("attrList", param.get("attrList"));
			paramTemp.put("channelId", sessionStaff.getCurrentChannelId());
			
			try {
				
				Map<String, Object> mktResMap = mktResBmo.queryMktResInfo(
						paramTemp, flowNum, sessionStaff);
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
				this.log.error("门户/mktRes/terminal/detail服务异常", be);
				return super.failedStr(model, be);
			} catch (InterfaceException ie) {
				return super.failedStr(model, ie, param, ErrorCode.QUERY_TERMINAL_LIST);
			} catch (Exception e) {
				this.log.error("门户/mktRes/terminal/detail服务异常", e);
				return super.failedStr(model, ErrorCode.QUERY_TERMINAL_LIST, e, param);
			}
		} 
		
		param.put("channelId", sessionStaff.getCurrentChannelId());
		String mktPrice = MapUtils.getString(param, "mktPrice", "0");
		String mktLjPrice = MapUtils.getString(param, "mktLjPrice", "0");
		if (!mktPrice.matches("([1-9]+[0-9]*|0)(\\.[\\d]+)?")) {
			mktPrice = "0";
		}
		if (!mktLjPrice.matches("([1-9]+[0-9]*|0)(\\.[\\d]+)?")) {
			mktLjPrice = "0";
		}
		param.put("mktResName", MapUtils.getString(param, "mktName", ""));
		param.put("contractPrice", Integer.parseInt(mktPrice));
		param.put("salePrice", Integer.parseInt(mktLjPrice));
		param.put("mktPicA", MapUtils.getString(param, "mktPicA", ""));
		model.addAttribute("mktRes", param);
		return "/mktRes/terminal-detail";
	}

	@RequestMapping(value = "/terminal/info",method = RequestMethod.GET)
	public String terminalInfoShow(){
		return "/mktRes/terminal-info-query";
	}

	@RequestMapping(value = "/terminal/infoQuery", method = RequestMethod.POST)
	public String terminalInfoQuery(@RequestBody Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);

			Map<String, Object> paramTemp=new HashMap<String, Object>();

			paramTemp.put("instCode",param.get("instCode"));

			try {
				Map<String, Object> mktResMap = mktResBmo.queryMktResInfoByCode(
						paramTemp, flowNum, sessionStaff);
				String mktResPicUrl = propertiesUtils.getMessage(SysConstant.MKT_RES_PIC_URL);
				if (StringUtils.isNotEmpty(mktResPicUrl)) {
					model.addAttribute("mktResPicUrl", mktResPicUrl);
				}
				model.addAttribute("mktResMap", mktResMap);
			} catch (BusinessException be) {
				this.log.error("门户/mktRes/terminal/info服务异常", be);
				return super.failedStr(model, be);
			} catch (InterfaceException ie) {
				return super.failedStr(model, ie, param, ErrorCode.QUERY_TERMINAL_INFO);
			} catch (Exception e) {
				this.log.error("门户/mktRes/terminal/info服务异常", e);
				return super.failedStr(model, ErrorCode.QUERY_TERMINAL_INFO, e, param);
			}
		return "/mktRes/terminal-info";
	}
	/**
	 * 终端信息查询
	 * 
	 * @param 终端串码
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/terminal/infoQueryByCode", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse terminalInfoQueryByCode(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramTemp = new HashMap<String, Object>();
		Map<String, Object> mktResMap = new HashMap<String, Object>();
		paramTemp.put("instCode",param.get("instCode"));
		paramTemp.put("areaId",param.get("areaId"));
		try {
			mktResMap = mktResBmo.queryMktResInfoByCode2(paramTemp, flowNum, sessionStaff);
		} catch (BusinessException be) {
			this.log.error("门户/terminal/infoQueryByCode服务异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, mktResMap, ErrorCode.CHECK_TERMINAL);
		} catch (Exception e) {
			this.log.error("门户/terminal/infoQueryByCode服务异常", e);
			return super.failed(ErrorCode.CHECK_TERMINAL, e, mktResMap);
		}
		return super.successed(mktResMap);
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
			/*String offerSpecName = MapUtils.getString(mktInfo, "offerSpecName")==null?" ":MapUtils.getString(mktInfo, "offerSpecName");
			mktInfo.remove("offerSpecName");*/
			Map<String, Object> mktRes = mktResBmo.checkTermCompVal(
					mktInfo, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(mktRes)) {
				//redmine 592606 需求
				/*if(ResultCode.R_SUCC.equals(MapUtils.getString(mktRes, "code"))){
					//update by huangjj3 营销资源返回终端可用再调用后台终端规格校验接口
					if(StringUtils.isNotEmpty(MapUtils.getString(mktInfo, "offerSpecId"))){
						Map<String, Object> mktInfoBack = new HashMap<String, Object>();
						mktInfoBack.put("agreementOfferSpecID", MapUtils.getString(mktInfo, "offerSpecId"));
						mktInfoBack.put("mktResCd", MapUtils.getString(mktRes, "mktResId"));
						mktInfoBack.put("agreementName", offerSpecName);
						mktInfoBack.put("mktResName",  MapUtils.getString(mktRes, "mktResName"));
						Map<String, Object> mktResBack = mktResBmo.checkTerminalCodeBack(
								mktInfoBack, flowNum, sessionStaff);
						if(MapUtils.isNotEmpty(mktResBack)){
							String resultCode = MapUtils.getString(mktResBack, "code");
							if("1".equals(resultCode)){
								return super.failed(MapUtils.getString(mktResBack, "message"), ResultConstant.FAILD.getCode());
							}
						}
					}
				}*/
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
	
	/**
	 * 甩单终端串码预占校验
	 * @param paramMap
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/terminal/checkReservedTerminal", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse checkReservedTerminal(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			Map<String, Object> mktRes = mktResBmo.checkReservedTerminal(
					paramMap, flowNum, sessionStaff);
			if (ResultCode.R_SUCCESS.equals(MapUtils.getString(mktRes, "code"))) {
				return super.successed(MapUtils.getMap(mktRes, "result"));
			} else {
				return super.failed(MapUtils.getString(mktRes, "msg"), ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/terminal/checkReservedTerminal服务异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.CHECK_RESERVED_TERMINAL);
		} catch (Exception e) {
			this.log.error("门户/mktRes/terminal/checkReservedTerminal服务异常", e);
			return super.failed(ErrorCode.CHECK_RESERVED_TERMINAL, e, paramMap);
		}
		
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
	public String termainlPlanOffer(@RequestParam("mktResCd") int mktResCd,
			@RequestParam("agreementType") int agreementType, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try {
			paramMap.put("mktResCd", mktResCd);
			paramMap.put("agreementType", agreementType);
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());
			paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
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

		return "/mktRes/terminal-plan-offer2";
	}

	
	/**
	 * 卡应用信息查询
	 * @param flowNum
	 * @param InstCodeList
	 * @param model
	 * @return 卡应用信息List
	 */
	@RequestMapping(value = "/uim/nfcAppInfos", method = RequestMethod.POST)
	public String nfcAppInfos(@RequestBody Map<String, Object> InstCodeList, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try {
			paramMap.put("mktResInstCodeList", MapUtils.getObject(InstCodeList,"mktResInstCodeList",null));
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());

			Map<String, Object> resultMap = mktResBmo.queryNfcAppInfos(paramMap, flowNum, sessionStaff);


			if (MapUtils.isNotEmpty(resultMap)) {
				Map<String, Object> instNfcAppInfoMap =MapUtils.getMap(resultMap,"instNfcAppInfoList",null);

				// 列表为空，则应返回结果为空
				if (instNfcAppInfoMap == null || instNfcAppInfoMap.size() == 0) {
					super.addHeadCode(response, ResultConstant.SERVICE_RESULT_EMPTY);
				}
				model.addAttribute("instNfcAppInfoMap", instNfcAppInfoMap);
			} else {
				String msg = "查询不到卡应用信息！";
				super.addHeadCode(response, new Result(ResultConstant.SERVICE_RESULT_FAILTURE.getCode(), msg));
			}
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/terminal/nfcAppInfos服务异常", be);
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_NFC_APP_INFO);
		} catch (Exception e) {
			this.log.error("门户/mktRes/terminal/nfcAppInfos服务异常", e);
			return super.failedStr(model, ErrorCode.QUERY_NFC_APP_INFO, e, paramMap);
		}

		return "/mktRes/terminal-nfcAppInfos";
	}


	private List<Map<String, Object>> sortOfferList(
			List<Map<String, Object>> list) {
		this.log.debug("sort before={}", JsonUtil.toString(list));
		Collections.sort(list, new Comparator<Map<String, Object>>() {
			public int compare(Map<String, Object> e1, Map<String, Object> e2) {
				if (NumberUtils.isNumber(String.valueOf(e1.get("presentFeeRate")))) {
					Double price1 = Double.parseDouble(String.valueOf(e1.get("presentFeeRate")));
					Double price2 = Double.parseDouble(String.valueOf(e2.get("presentFeeRate")));
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
			int tmpPeriod =(int) (Double.parseDouble(String.valueOf(agreementOfferMap.get("presentFeeRate")))*100);
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
	public JsonResponse getCardDllInfoJson(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = mktResBmo.getCardDllInfoJson(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
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
	public JsonResponse getAuthCode(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = mktResBmo.getAuthCode(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(MapUtils.getString(rMap, "code"))) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(ErrorCode.GET_AUTH_CODE, rMap, param);
			}
		} catch (Exception e) {
			jsonResponse = super.failed(ErrorCode.GET_AUTH_CODE, e, param);
		}
		return jsonResponse;
	}
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryApConf", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse queryAgentPortalConfig(
			@RequestParam Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
	    JsonResponse jsonResponse = null;
		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String tableName = null;
		String columnItems = "SERIALNUM_FILTER";
		tableName = "SYSTEM";
		try {
			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItems);
			if (obj != null && obj instanceof List) {
				rList = (List<Map<String, Object>>) obj;
			} else {
				Map<String, Object> pMap = new HashMap<String, Object>();
				pMap.put("tableName", tableName);
				pMap.put("columnName", columnItems);
				rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItems, rList);
			}
			jsonResponse = super.successed(rList,
					ResultConstant.SUCCESS.getCode());
		} catch (BusinessException e) {
			this.log.error("查询配置信息服务出错", e);
			jsonResponse = super.failed("查询配置信息服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
		return jsonResponse;
	}
	@RequestMapping(value = "/writeCard/cardInfo", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getCardInfo(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			String areaId = (String)param.get("areaId");
			
			//redmine#10671,先判断common_region表中相关地址是否为本地网（region_type为1300），如是则直接透传处理，如否截取两位后补0
			Map<String, Object> areaInfo = CommonMethods.getAreaInfo(areaId);
			if("1300".equals(MapUtils.getString(areaInfo, "regionType"))){
				param.put("areaId", areaId); 
			} else {
				param.put("areaId", areaId.substring(0, 5) + "00"); 
			}
			
			rMap = mktResBmo.getCardInfo(param, flowNum, sessionStaff);
			if (rMap != null&& ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(rMap, "code"))) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(ErrorCode.GET_CARD_INFO, rMap, param);
			}
		} catch(Exception e) {
			return super.failed(ErrorCode.GET_CARD_INFO, e, param);
		}
		return jsonResponse;
	}
	
	@RequestMapping(value = "/writeCard/completeWriteCard", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse completeWriteCard(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletRequest request, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		Map<String, Object> logparam =  new HashMap<String, Object>();
		try {
			String couponInstanceCode =  (String) (param.get("iccserial")==null?"":param.get("iccserial"));
			String iccId = (String) (param.get("iccid")==null?"":param.get("iccid"));
			int serviceCode = (Integer) (param.get("serviceCode")==null?"":param.get("serviceCode"));
			String TransactionID = (String) (param.get("TransactionID")==null?"":param.get("TransactionID"));
			String remark = (String) (param.get("remark")==null?"":param.get("remark"));
			param.remove("serviceCode");
			param.remove("TransactionID");
			param.remove("remark");
			String ip = ServletUtils.getIpAddr(request);
			//入库成功后记录日志
			logparam.put("channelId", sessionStaff.getCurrentChannelId());
			logparam.put("staffId", sessionStaff.getStaffId());
			logparam.put("couponInstanceCode",couponInstanceCode);
			logparam.put("areaId", sessionStaff.getAreaId());
			logparam.put("iccId",iccId);
			logparam.put("serviceCode", serviceCode+"");
			logparam.put("ip", ip);
			logparam.put("cardSource", remark);
			logparam.put("operateDate", new Date());
			logparam.put("contactRecord", TransactionID);
			logparam.put("methodName", "W");//写卡
			String extCustOrderId = (String) (param.get("extCustOrderId")==null?"":param.get("extCustOrderId"));
			String accNbr = (String) (param.get("phoneNumber")==null?"":param.get("phoneNumber"));
			logparam.put("extCustOrderId", extCustOrderId);
			logparam.put("accNbr", accNbr);
			param.put("StaffId", sessionStaff.getStaffId());
			rMap = mktResBmo.submitUimCardInfo(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCC.equals(MapUtils.getString(rMap, "code"))) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
				logparam.put("errDesc", "成功");
				logparam.put("result", ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(ErrorCode.COMPLETE_WRITE_CARD, rMap, param);
				logparam.put("errDesc", rMap);
				logparam.put("result", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
			
		} catch (BusinessException e) {
			this.log.error("写卡上报", e);
			logparam.put("errDesc", e.getResultMap());
			logparam.put("result", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			jsonResponse = super.failed("写卡上报",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}catch (InterfaceException ie) {
			logparam.put("errDesc", ie.getErrStack());
			logparam.put("result", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			return super.failed(ie, param, ErrorCode.QUERY_COUPON);
		}catch (Exception e) {
			this.log.error("写卡上报", e);
			logparam.put("errDesc", "失败");
			logparam.put("result", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			return super.failed(ErrorCode.COMPLETE_WRITE_CARD, e, param);
		}finally{
			try {
				mktResBmo.intcardNubInfoLog(logparam, flowNum, sessionStaff);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return jsonResponse;
	}
	/**
	 * @param param
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/terminal/exchangePrepare", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
	public String exchangeTerminal(Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		return "/mktRes/terminal-exchange";
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
	public JsonResponse queryCoupon(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		param.put("areaId", sessionStaff.getCurrentAreaId());
		
		try {
			Map<String, Object> retnMap = mktResBmo.queryCoupon(param, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(retnMap)) {
				return super.successed(retnMap);
			} else {
				return super.failed("根据串号查询终端信息失败!", ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/terminal/queryCoupon服务异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_COUPON);
		} catch (Exception e) {
			this.log.error("门户/mktRes/terminal/queryCoupon服务异常", e);
			return super.failed(ErrorCode.QUERY_COUPON, e, param);
		}
	}
	/**
	 * 打开销账（欠费查询）页面
	 * @return
	 */
	@RequestMapping(value = "/prepareOwingCharge", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
	public String prepareOwingCharge(){
	    return "/mktRes/owing_charge";
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
    public String getOweCharge(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response)throws BusinessException{
        
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);          
        try{                        
            Map<String, Object> resultMap = mktResBmo.getOweCharge(param, flowNum, sessionStaff);                           
            if(ResultCode.R_SUCCESS.equals(resultMap.get("code"))){
                model.addAttribute("flag", 0);
                model.addAttribute("owingCharge", resultMap.get("result"));                  
             }
            else{
                 model.addAttribute("flag", 1);
                 if(resultMap.get("message")!=null){
                     model.addAttribute("errorMsg", resultMap.get("message"));
                 }
             }
        }catch(BusinessException be){
             return super.failedStr(model, be);
         }catch(Exception e){
             return super.failedStr(model, ErrorCode.QUERY_OVERDUE, e, param);
         }
         return "/mktRes/owing_charge_list";
     }
       /**
        * 销账
        * @param param
        * @param model
        * @param flowNum
        * @param response
        * @return
        */
       @RequestMapping(value = "/writeOffCash", method = {RequestMethod.GET,RequestMethod.POST})
       @AuthorityValid(isCheck = false)
       @ResponseBody
	public JsonResponse writeOffCash(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response){
	       SessionStaff sessionStaff = (SessionStaff) ServletUtils .getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
	       param.put("staffId", sessionStaff.getStaffId());
	       param.put("areaId", sessionStaff.getAreaId());
	       param.put("staffCode", sessionStaff.getStaffCode());
	        try {
	            DataBus db = mktResBmo.writeOffCash(param, flowNum, sessionStaff);
	            if (ResultCode.R_SUCCESS.equals(db.getResultCode())) {
	            	Map<String, Object> resultMap = db.getReturnlmap();
	            	if(ResultCode.R_SUCCESS.equals(MapUtils.getString(resultMap, "code", ""))){
	            		return successed(resultMap, 0);
	            	}
	            	else{
	            		return failed(MapUtils.getString(resultMap, "message", "销账失败"), 1);
	            	}
	            }
	            else{
	                return super.failed(db.getResultMsg(), 1);
	            }
	        } catch (Exception e) {
	            this.log.error("门户com.linkage.portal.service.lte.core.charge.WriteOffCash服务异常", e);
	            return super.failed(ErrorCode.WRITE_OFF_CASH, e, param);
	        }
	}
   @RequestMapping( "qryPhoneNbrLevelInfoList")
   @AuthorityValid(isCheck = false)
   public String qryPhoneNbrLevelInfoList(Model model,@LogOperatorAnn String flowNum,
           HttpServletResponse response,HttpServletRequest request,HttpSession session){
       SessionStaff sessionStaff = (SessionStaff) ServletUtils .getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
       Map<String, Object> param=new HashMap<String, Object>();
       String org_level=request.getParameter("org_level");//原始的号码等级
       String pnLevelId=request.getParameter("pnLevelId");//修改过的号码等级
       String areaId=request.getParameter("areaId");
       param.put("queryFlag", "1");
       param.put("pnLevelId",org_level);//注意：页面显示的时候，显示修改以前的所有可选的号码等级。pnLevelId（修改过的号码等级）只是为了页面反选。
       model.addAttribute("pnLevelId", pnLevelId);
       model.addAttribute("org_level", org_level);
       param.put("areaId", areaId);
        try {
            DataBus aDataBus= mktResBmo.qryPhoneNbrLevelInfoList(param, flowNum, sessionStaff);
            Map<String,Object> resMap=aDataBus.getReturnlmap();
//            String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
//			List PnLevelProdOfferlist = new ArrayList();
//			if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(appDesc)) {
//				PnLevelProdOfferlist = (List) session.getAttribute(sessionStaff.getPartnerId()+"_"+sessionStaff.getCurrentAreaId().substring(0, 3)+"0000");
//			} else if (sessionStaff != null && SysConstant.APPDESC_LTE.equals(appDesc)) {
//				PnLevelProdOfferlist = (List) session.getAttribute(sessionStaff.getCurrentAreaId().substring(0, 3)+"0000");
//			}
//			Map result = new HashMap();
//			List phoneNbrLevelList = new ArrayList();
//			Map result1 = (Map)resMap.get("result");
//			List reslist = (List)result1.get("phoneNbrLevelList");
//			for(int i=0;i<reslist.size();i++){
//				Map remap = (Map)reslist.get(i);
//				Map phmap = new HashMap();
//				String flag = "false";
//				for (int j=0;j<PnLevelProdOfferlist.size();j++){
//					Map pnmap = (Map)PnLevelProdOfferlist.get(j);
//					if(remap.get("pnLevelId").toString().equals(pnmap.get("pnLevelId").toString())){
//						phmap.put("prePrice", Integer.parseInt(pnmap.get("prePrice").toString()));
//						phmap.put("pnPrice", Integer.parseInt(pnmap.get("pnPrice").toString()));
//						flag = "true";
//						break;
//					}
//				}
//				if("false".equals(flag)){
//					phmap.put("prePrice", "0");
//					phmap.put("pnPrice", "0");
//				}
//				phmap.put("pnLevelCd", remap.get("pnLevelCd"));
//				phmap.put("pnLevelDesc", remap.get("pnLevelDesc"));
//				phmap.put("pnLevelId", remap.get("pnLevelId"));
//				phmap.put("pnLevelName", remap.get("pnLevelName"));
//				phoneNbrLevelList.add(phmap);
//			}
//			result.put("phoneNbrLevelList", phoneNbrLevelList);
//			Map resultmap = new HashMap();
//			resultmap.put("result", result);
            model.addAttribute("resMap", resMap);
        } catch (Exception e) {
            this.log.error("门户service/PhoneNumberQryService/qryPhoneNbrLevelInfoList服务异常", e);
        }
        return "/mktRes/phonenbr_level_list";
   }
   
 //靓号预存和保底金额查询
	@RequestMapping(value = "/phonenumber/queryPnLevelProdOffer", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryPnLevelProdOffer(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpSession session) throws BusinessException {
		String appDesc = propertiesUtils.getMessage(SysConstant.APPDESC);
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		List relist = new ArrayList();
		try {
			param.put("pnLevelId", " ");
			param.put("queryFlag", "0");
//			param.put("areaId", sessionStaff.getCurrentAreaId());
			if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(appDesc)) {
				relist = (List) session.getAttribute(sessionStaff.getPartnerId()+"_"+sessionStaff.getCurrentAreaId().substring(0, 3)+"0000");
			} else if (sessionStaff != null && SysConstant.APPDESC_LTE.equals(appDesc)) {
				relist = (List) session.getAttribute(sessionStaff.getCurrentAreaId().substring(0, 3)+"0000");
			}
			if(relist!=null){
				jsonResponse=super.successed(relist, ResultConstant.SUCCESS.getCode());
			}else{
				rMap = mktResBmo.queryPnLevelProdOffer(param, flowNum, sessionStaff);
				if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					if (sessionStaff != null && SysConstant.APPDESC_MVNO.equals(appDesc)) {
						session.setAttribute(sessionStaff.getPartnerId()+"_"+sessionStaff.getCurrentAreaId().substring(0, 3)+"0000", rMap.get("result"));
					} else if (sessionStaff != null && SysConstant.APPDESC_LTE.equals(appDesc)) {
						session.setAttribute(sessionStaff.getCurrentAreaId().substring(0, 3)+"0000", rMap.get("result"));
					}
					jsonResponse=super.successed(rMap.get("result"), ResultConstant.SUCCESS.getCode());
				} else {
					jsonResponse = super.failed(rMap,
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			}
		} catch (BusinessException e) {
			this.log.error("靓号预存和保底金额查询出错", e);
			jsonResponse = super.failed("靓号预存和保底金额查询出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QRY_PNLEVELPRODOFFER);
		} catch (Exception e) {
			log.error("靓号预存和保底金额查询", e);
			return super.failed(ErrorCode.QRY_PNLEVELPRODOFFER, e, param);
		}
		return jsonResponse;
	}
	/**
	 * 号码预约页面
	 * @param model
	 * @param param
	 * @return
	 */
	@RequestMapping(value = "/reservenumber/prepare", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String reservePrepare(Model model,@RequestParam Map<String, Object> param) {
		model.addAttribute("current", "business");	
		return "/order/reserve-phonenumber-prepare";
	}
	/**
	 * 号码预约查询页面
	 * @param model
	 * @param param
	 * @return
	 */
	@RequestMapping(value = "/reservenumber/query", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String reservecontent(Model model,@RequestParam Map<String, Object> param) {
		model.addAttribute("current", "business");	
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String end = sdf.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
		String start = sdf.format(calendar.getTime());
		model.addAttribute("startDt", start);
		model.addAttribute("endDt", end);
		return "/order/reserve-phonenumber-query";
	}
	/**
	 * 号码预约查询
	 * @param model
	 * @param param
	 * @param session
	 * @param flowNum
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/reservenumber/queryList", method = RequestMethod.GET)
	public String batchOrderList(Model model,@RequestParam Map<String, Object> param,HttpSession session,@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
			try {
				param.put("beginDate", param.get("beginDate").toString().replaceAll("-", ""));
				param.put("endDate", param.get("endDate").toString().replaceAll("-", ""));
				List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
				Map<String,Object> rMap = mktResBmo.reserveQuery(param, flowNum, sessionStaff);
				if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					int total=MapUtils.getIntValue(rMap, "pnCount", 1);
					Object result =rMap.get("pnOrderList");
					if (result instanceof List) {
						resultList = (List<Map<String, Object>>) result;
					} else {
						Map<String,Object> tempMap = (Map<String, Object>) result;
						resultList.add(tempMap);
					}
					if(resultList!=null&&resultList.size()>0){
						 PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(MapUtils.getIntValue(param,
			                     "pageNo", 1), MapUtils.getIntValue(param,"pageSize",10), total, resultList);
			             model.addAttribute("pageModel", pm);
					}
				}
			} catch (BusinessException e) {
				 this.log.error("门户/mktRes/reservenumber/queryList服务异常", e);
				 return super.failedStr(model, e);
			} catch (InterfaceException ie) {
				 return super.failedStr(model, ie, param, ErrorCode.RESERVENUM_QUERY);
			} catch (Exception e) {
				 this.log.error("门户/mktRes/reservenumber/queryList服务异常", e);
				 return super.failedStr(model, ErrorCode.RESERVENUM_QUERY, e, param);
			}
		return "/order/reserve-phonenumber-main";
	}
	/**
	 * 号码预约提交
	 * @param params
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/reservenumber/submit", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse reserveSubmit(@RequestBody Map<String, Object> param,HttpSession httpSession,
			@LogOperatorAnn String flowNum,HttpServletResponse response,HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try{
			//访问次数限制
			long endTime = System.currentTimeMillis();
			long beginTime = 0;
			if(httpSession.getAttribute(sessionStaff.getStaffCode()+"reservenumbertime")!=null){
				beginTime = (Long) httpSession.getAttribute(sessionStaff.getStaffCode()+"reservenumbertime");
			}
			if(beginTime!=0){
				Date beginDate = new Date(beginTime);
				Date endDate = new Date(endTime);
				long useTime = endDate.getTime()-beginDate.getTime();
				long limit_time = Long.parseLong(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"LIMIT_TIME"));
				int limit_count = Integer.parseInt(MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"LIMIT_COUNT"));
				if (useTime<=limit_time){
					int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"reservenumbercount")+1;
					if(count<limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+"reservenumbercount", count);
					}else if(count==limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+"reservenumbercount", count);
					}else if(count>limit_count){
						httpSession.setAttribute(sessionStaff.getStaffCode()+"reservenumbercount", count);
						if(httpSession.getAttribute(sessionStaff.getStaffCode()+"reservenumbercount")!=null){
							return super.failed("您的操作频繁，请稍后再试！",ResultConstant.ACCESS_LIMIT_FAILTURE.getCode());
						}
					}
				}else{
					httpSession.setAttribute(sessionStaff.getStaffCode()+"reservenumbertime", endTime);
					httpSession.setAttribute(sessionStaff.getStaffCode()+"reservenumbercount", 1);
				}
			}else{
				httpSession.setAttribute(sessionStaff.getStaffCode()+"reservenumbertime", endTime);
				httpSession.setAttribute(sessionStaff.getStaffCode()+"reservenumbercount", 1);
			}
		}catch (Exception e) {
			// TODO: handle exception
		}
		try {
			if(commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)){
				String identityId = param.get("identityId").toString();
				String idCardFlag = IDCard.IDCardValidate(identityId);
				if(idCardFlag!=""){
					Map<String,Object> resMap =new HashMap<String,Object>();
					resMap.put("msg", idCardFlag);
					return jsonResponse = super.failed(resMap,
							ResultConstant.FAILD.getCode());
				}
				param.put("staffId", sessionStaff.getStaffId());
				if(param.get("actionType").toString().equals("E")){
					param.putAll(getAreaInfos(MapUtils.getString(param, "areaId")));
					param.put("staffCode", sessionStaff.getStaffCode());
					param.put("channelName", sessionStaff.getCurrentChannelName());
					param.put("orderNo","");
				}
				rMap = mktResBmo.reserveSubmit(param, flowNum, sessionStaff);
				if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
				} else {
					jsonResponse = super.failed(rMap,
							ResultConstant.FAILD.getCode());
				}
			}else{
				super.addHeadCode(response,ResultConstant.SERVICE_RESULT_FAILTURE);
			}
			return jsonResponse;
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/reservenumber/submit服务异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.RESERVENUM_SUBMIT);
		} catch (Exception e) {
			this.log.error("门户/mktRes/reservenumber/submit服务异常", e);
			return super.failed(ErrorCode.RESERVENUM_SUBMIT, e, param);
		}
	}
	
	/**
	 * 号码预约批量释放
	 * 
	 * @param params
	 * @param flowNum
	 * @return JsonResponse
	 */
	/*@RequestMapping(value = "/reservenumber/reserveBatchSubmit", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse reserveBatchSubmit(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try{
			param.put("staffId", sessionStaff.getStaffId());
			
			rMap = mktResBmo.reserveBatchSubmit(param, flowNum, sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse = super.successed(rMap,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,
						ResultConstant.FAILD.getCode());
			}
			return jsonResponse;
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/reservenumber/reserveBatchSubmit服务异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.RESERVENUM_BATCHSUBMIT);
		} catch (Exception e) {
			this.log.error("门户/mktRes/reservenumber/reserveBatchSubmit服务异常", e);
			return super.failed(ErrorCode.RESERVENUM_BATCHSUBMIT, e, param);
		}
	}*/
	/**
	 * 进入终端领用和退回页面
	 * 
	 * @param param
	 * @param model
	 * @param flowNum
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/prepareTerminalUse", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String prepareTerminalUse(@RequestParam Map<String, Object> param,
			Model model, @LogOperatorAnn String flowNum,
			HttpServletResponse response) throws BusinessException {

		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			model.addAttribute("flag", param.get("flag"));
			param.remove("flag");
			param.put("staffId", sessionStaff.getStaffId());
			Map<String, Object> resultMap = mktResBmo.getTermianlStore(param,
					flowNum, sessionStaff);
			if (ResultCode.R_SUCCESS.equals(resultMap.get("code"))) {
				//model.addAttribute("flag", 0);
				model.addAttribute("list", resultMap.get("result"));
			} else {
				//model.addAttribute("flag", 1);
				if (resultMap.get("message") != null) {
					model.addAttribute("errorMsg", resultMap.get("message"));
				}
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_TERINAL_STORE, e, param);
		}
		return "/mktRes/terminal_use_prepare";
	}

	// 终端领用_终端校验
	@RequestMapping(value = "/terminal/addTerminal", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse addTerminal(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpSession session)
			throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			param.put("staffId", sessionStaff.getStaffId());
			param.put("channelCode", sessionStaff.getCurrentChannelId());
			param.put("channelName", sessionStaff.getCurrentChannelName());
			rMap = mktResBmo.checkTermianl(param, flowNum, sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse = super.successed(rMap.get("result"),
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,
						ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("终端添加出错", e);
			jsonResponse = super.failed("终端添加出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.CHECK_TERINAL_USE);
		} catch (Exception e) {
			log.error("终端添加出错", e);
			return super.failed(ErrorCode.CHECK_TERINAL_USE, e, param);
		}
		return jsonResponse;
	}

	// 终端领用_终端领用
	@RequestMapping(value = "/terminal/termianlUse", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse termianlUse(@RequestParam("strParam") String param,
			@LogOperatorAnn String flowNum, HttpSession session)
			throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		// “是否使用精品渠道终端销售系统”，取值及说明：10： 否、20 ：是。如为使用精品渠道销售系统的门店（包括该渠道的店中商），则限制不允许办理
		if ("20".equals(sessionStaff.getIsUseGTS())) {
			return super.failed("请到精品渠道终端销售系统进行串码的领用和回退", ResultConstant.ACCESS_NOT_NORMAL.getCode());
		}
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
		paramMap =  JsonUtil.toObject(param, Map.class);
		try {
			paramMap.put("staffId", sessionStaff.getStaffId());
			paramMap.put("channelCode", sessionStaff.getCurrentChannelId());
			paramMap.put("channelName", sessionStaff.getCurrentChannelName());
			rMap = mktResBmo.termianlUse(paramMap, flowNum, sessionStaff);
			if (rMap != null
					&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse = super.successed(rMap.get("result"),
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,
						ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("终端领用出错", e);
			jsonResponse = super.failed("终端领用出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.CHECK_TERINAL_USE);
		} catch (Exception e) {
			log.error("终端领用出错", e);
			return super.failed(ErrorCode.DO_TERINAL_USE, e, paramMap);
		}
		return jsonResponse;
	}
	
	//终端预约联动查询
	@RequestMapping(value = "/termOrderQuery", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse termOrderQuery(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpSession session) throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = mktResBmo.termOrderQuery(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse=super.successed(rMap.get("result"), ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg"),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			jsonResponse = super.failed("终端预约联动查询出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		}catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.TERM_ORDER_QUERY_SERVICE);
		} catch (Exception e) {
			return super.failed(ErrorCode.TERM_ORDER_QUERY_SERVICE, e, param);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取UIM卡类型
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/writeCard/getCardType", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getCardType(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		JsonResponse jsonResponse = null;
		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String	columnItems = "4G_AND_NFC_CARD";
		String	tableName = "SYSTEM";
		try {
//			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItems);
//			if (obj != null && obj instanceof List) {
//				rList = (List<Map<String, Object>>) obj;
//			} else {
			Map<String, Object> pMap = new HashMap<String, Object>();
			pMap.put("tableName", tableName);
			pMap.put("columnName", columnItems);
			rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
//				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItems, rList);
			if(rList.size()>0){
				rList=(List<Map<String, Object>>)rList.get(0).get("4G_AND_NFC_CARD");
			}
//			}
			jsonResponse = super.successed(rList,
					ResultConstant.SUCCESS.getCode());
		} catch (BusinessException e) {
			this.log.error("查询配置信息服务出错", e);
			jsonResponse = super.failed("查询配置信息服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
		return jsonResponse;
	}
	
	/**
	 * @param param
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/terminal/zdyyPrepare", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
	public String terminalPreparezdyy(Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		model.addAttribute("default_area_id", sessionStaff.getCurrentAreaId());
		return "/mktRes/terminal-zdyyprepare";
	}
	
	@RequestMapping(value = "/terminal/detailzdyy", method = RequestMethod.POST)
	public String terminalDetailzdyy(@RequestBody Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		if(param.get("is4G")!=null){
			Map<String, Object> paramTemp=new HashMap<String, Object>();
			if(param.get("mktSpecCode")!=null){
				String mktSpecCode=param.get("mktSpecCode").toString();
				param.put("mktSpecCode", mktSpecCode);
				if(mktSpecCode.length()>=22){
					mktSpecCode=mktSpecCode.substring(0, 22);
				}
				paramTemp.put("mktSpecCode", param.get("mktSpecCode"));
			}
			paramTemp.put("pageInfo",param.get("pageInfo"));
			paramTemp.put("mktResCd", "");
			paramTemp.put("mktResName", "");
			paramTemp.put("mktResType", "");
			paramTemp.put("minPrice", "");
			paramTemp.put("maxPrice", "");
			paramTemp.put("attrList", param.get("attrList"));
			paramTemp.put("channelId", sessionStaff.getCurrentChannelId());
			paramTemp.put("pageType",param.get("pageType"));
			paramTemp.put("termSpecCode",param.get("termSpecCode"));
			
			try {
				
				Map<String, Object> mktResMap = mktResBmo.queryMktResInfo(
						paramTemp, flowNum, sessionStaff);
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
				this.log.error("门户/mktRes/terminal/detailzdyy服务异常", be);
				return super.failedStr(model, be);
			} catch (InterfaceException ie) {
				return super.failedStr(model, ie, param, ErrorCode.QUERY_TERMINAL_LIST);
			} catch (Exception e) {
				this.log.error("门户/mktRes/terminal/detailzdyy服务异常", e);
				return super.failedStr(model, ErrorCode.QUERY_TERMINAL_LIST, e, param);
			}
		}
		param.put("channelId", sessionStaff.getCurrentChannelId());
		String mktPrice = MapUtils.getString(param, "mktPrice", "0");
		String mktLjPrice = MapUtils.getString(param, "mktLjPrice", "0");
		if (!mktPrice.matches("([1-9]+[0-9]*|0)(\\.[\\d]+)?")) {
			mktPrice = "0";
		}
		if (!mktLjPrice.matches("([1-9]+[0-9]*|0)(\\.[\\d]+)?")) {
			mktLjPrice = "0";
		}
		param.put("mktResName", MapUtils.getString(param, "mktName", ""));
		param.put("contractPrice", Integer.parseInt(mktPrice));
		param.put("salePrice", Integer.parseInt(mktLjPrice));
		param.put("mktPicA", MapUtils.getString(param, "mktPicA", ""));
		model.addAttribute("mktRes", param);
		return "/mktRes/terminal-zdyydetail";
	}
	
    /*终端配置查询*/
	@RequestMapping(value="/queryCouponConfig", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> queryCouponConfig(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) throws Exception{
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		param.put("areaId", sessionStaff.getCurrentAreaId());
		Map<String, Object> result = mktResBmo.queryCouponConfig(param, null, sessionStaff);
		return result;
	}

	/**
	 * 获取UIM卡类型
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/uim/getResCardType", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getResCardType(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		Map<String, Object> rMap;
		JsonResponse jsonResponse;
		Map<String, Object> pMap = new HashMap<String, Object>();
		List<Map<String,Object>> list=new ArrayList<Map<String, Object>>();
		list.add(param);
		pMap.put("mktResInfoList",list);
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			rMap = mktResBmo.getUimCardType(pMap, flowNum, sessionStaff);
			if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse = super.successed(rMap.get("result"), ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg"), ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			jsonResponse = super.failed("卡类型查询出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			return super.failed(ie, pMap, ErrorCode.RES_UIM_CARD_TYPE_VALIDATE);
		} catch (Exception e) {
			return super.failed(ErrorCode.RES_UIM_CARD_TYPE_VALIDATE, e, pMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 预约码校验
	 * 
	 * @param mktInfo
	 *            预约码校验信息
	 * @param flowNum
	 * @return
	 */
	@RequestMapping(value = "/terminal/queryCouponReserveCodeCheck", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryCouponReserveCodeCheck(@RequestBody Map<String, Object> mktInfo,
			@LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			String luoFlag = (String) mktInfo.get("luoFlag");
			if(luoFlag==null || luoFlag.equals("") || !("Y").equals(luoFlag)){
				String identityNum = (String) mktInfo.get("identityNum");
			    String identityTypeCd = (String) mktInfo.get("identityTypeCd");
			    String custId = mktInfo.get("custId").toString();
			    if(custId!=null && !custId.equals("-1")){
			    	identityNum = sessionStaff.getCardNumber() == null ?"":sessionStaff.getCardNumber();
				    identityTypeCd = sessionStaff.getCardType()== null ?"":sessionStaff.getCardType();
			    }
			    mktInfo.put("identityNum", identityNum);
				mktInfo.put("identityTypeCd", identityTypeCd);
			}
			mktInfo.put("areaId", sessionStaff.getCurrentAreaId());
			Map<String, Object> mktRes = mktResBmo.queryCouponReserveCodeCheck(
					mktInfo, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(mktRes)) {
				return super.successed(mktRes);
			} else {
				return super.failed("校验终端预约码失败", ResultConstant.FAILD.getCode());
			}
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/terminal/queryCouponReserveCodeCheck服务异常", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, mktInfo, ErrorCode.QUERY_COUPON_RESERVE_CODE_CHECK);
		} catch (Exception e) {
			this.log.error("门户/mktRes/terminal/queryCouponReserveCodeCheck服务异常", e);
			return super.failed(ErrorCode.QUERY_COUPON_RESERVE_CODE_CHECK, e, mktInfo);
		}
	}
	
	/**
	 * accii码转hex
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/writeCard/getAsciiToHex", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getAsciiToHex(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		Map<String, Object> rMap = new HashMap<String, Object>();
		JsonResponse jsonResponse;
		String asciiStr =  (String) (param.get("asciiFStr") == null?"":param.get("asciiFStr"));
		byte[] baKeyword = new byte[asciiStr.length() / 2];  
		for (int i = 0; i < baKeyword.length; i++) {  
		    try {  
		     baKeyword[i] = (byte) (0xff & Integer.parseInt(asciiStr.substring(  
		       i * 2, i * 2 + 2), 16));  
		    } catch (Exception e) {  
		     e.printStackTrace();  
		    }  
		 }  
		try {  
			   asciiStr = new String(baKeyword, "ASCII");
			   rMap.put("asciiStr", asciiStr);
		} catch (Exception e) {  
		    e.printStackTrace();  
		}  
		jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
		return jsonResponse;
	}
	
	/**
	 * hex转ASCII码
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/writeCard/getHexToAscii", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getHexToAscii(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		Map<String, Object> rMap = new HashMap<String, Object>();
		JsonResponse jsonResponse;
		String hexStr =  (String) (param.get("hexStr") == null?"":param.get("hexStr"));
		byte[] b = hexStr.getBytes();
		int[] in = new int[b.length];
		for (int i = 0; i < in.length; i++) {
		in[i] = b[i]&0xff;
		}
		String strHex = "";
		for (int j = 0; j < in.length; j++) {
			strHex = strHex+ Integer.toString(in[j], 0x10);
		}
		strHex = strHex.toUpperCase();
		rMap.put("strHex", strHex);
		jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
		return jsonResponse;
	}
	
	/**
	 * 白卡卡号入库
	 * @param param
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/writeCard/intakeSerialNumber", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse intakeSerialNumber(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		Map<String, Object> rMap = new HashMap<String, Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		try {
			param.put("staffId", sessionStaff.getStaffId());
			param.put("channelId", sessionStaff.getCurrentChannelId());
			param.put("orderNo", "");
			String newInstCode = String.valueOf(param.get("instCode"));
			mktResBmo.intakeSerialNumber(param, newInstCode, "3", sessionStaff, flowNum);
		}  catch (Exception e) {
			log.error("白卡入库异常", e);
			return super.failed(ErrorCode.UIM_E_F, e, param);
		}	
		jsonResponse = super.successed(rMap, ResultConstant.SUCCESS.getCode());
		return jsonResponse;
	}
	/**
	 * 翼支付绑卡
	 * 跳转到翼支付绑卡添益宝系统，url上所需参数：
	 * productno：翼支付账号（非必传，但是需要把变量传过去）注：预定传空
	 * inputuid：操作营业员的工号（必传）
	 * inputorg: 4G营业厅编号（channel_NBR）（必传）
	 * 
	 * 生产环境DCN：http://10.251.2.11:7005/alwaysnotj1/businessBind.do?method=load&productno=&inputuid=1111&inputorg=11111
	 * 测试环境DCN：http://10.251.2.248:10888/alwaysnotj1/businessBind.do?method=load&productno=&inputuid=1111&inputorg=11111
	 * 映射生产环境DCN：https://crm.189.cn/alwaysnotj1/businessBind.do?method=load&productno=&inputuid=1111&inputorg=11111
	 * 映射测试环境DCN：http://10.128.90.194:8101/alwaysnotj1/businessBind.do?method=load&productno=&inputuid=1111&inputorg=11111
	 * @param response
	 * @throws Exception 
	 */
	@RequestMapping(value = "/yiPayBoundCard", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public void yiPayBoundcard(HttpServletRequest request,  HttpServletResponse response) throws Exception{  
	    SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
	    StringBuffer url=new StringBuffer();
	    //URL/alwaysnotj1
	    url.append(MySimulateData.getInstance().getNeeded((String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY),"YIPAYBOUNDCARD","url"));	 	    
	    String staffCode=sessionStaff.getStaffCode();
	    String channelCode =sessionStaff.getCurrentChannelCode();
        try {
        	staffCode =URLEncoder.encode(staffCode, "UTF-8");
        	channelCode =URLEncoder.encode(channelCode, "UTF-8");
        } catch (UnsupportedEncodingException e1) {
            e1.printStackTrace();
        }
        url.append("/businessBind.do?method=load&type=4g&productno=").append("&inputuid=").append(staffCode).append("&inputorg=").append(channelCode);
	    log.debug("翼支付绑卡添益宝地址："+url.toString());
	    try {
	        response.setContentType("text/html;charset=UTF-8");
	        response.getWriter().print("<iframe src='"+url+"' style='width: 100%;height: 100%' frameborder = '0'></iframe>");
        } catch (IOException e) {
            e.printStackTrace();
        }
	}
	
	/**
     * 终端规格查询页面
     * @param model
     * @param session
     * @return
     * @throws AuthorityException
     */
    @RequestMapping(value = "/queryTerminalInfo", method = RequestMethod.GET)
    @AuthorityValid(isCheck = true)
    public String queryCardProgress(Model model, HttpSession session) throws AuthorityException {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
        model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
        model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
        model.addAttribute("pageType", "terminalInfo");

        return "/mktRes/terminalInfo-main";
    }
	
	@RequestMapping(value = "/writeCardNew", method = RequestMethod.GET)
	 @AuthorityValid(isCheck = true)
	public String writeCardNew(HttpServletRequest request,Model model,HttpSession session) {
		    SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
		    model.addAttribute("prodId", "0");
		    model.addAttribute("areaCode",sessionStaff.getAreaCode());
		    model.addAttribute("areaId",sessionStaff.getAreaId());
		    model.addAttribute("channelId",sessionStaff.getCurrentChannelId());
		    model.addAttribute("staffId",sessionStaff.getStaffId());
		    Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);

	        model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
	        model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
			return "/order/write-card-new";
	}
	
	@RequestMapping(value = "/writeCard/writecardLog", method = RequestMethod.POST)
	@ResponseBody
	public void writecardLog(@RequestBody Map<String, Object> param,HttpServletRequest request,
			@LogOperatorAnn String flowNum) {
		    SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
		    param.put("channelId", sessionStaff.getCurrentChannelId());
		    param.put("staffId", sessionStaff.getStaffId());
		    param.put("areaId", sessionStaff.getAreaId());
		    param.put("ip", ServletUtils.getIpAddr(request));
		    param.put("operateDate", new Date());
			String methodName = (String) (param.get("methodName")==null?"":param.get("methodName"));
			if(methodName.equals("")){
				param.put("methodName", "U");//卡组件记录
			}
			try {
				mktResBmo.intcardNubInfoLog(param, flowNum, sessionStaff);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	}

	/**
	 * 终端信息统计查询查询主页面:
	 * 精品渠道终端(操作)汇总报表
	 * 精品渠道终端(库存)汇总报表
	 * @param model
	 * @param request
	 * @param session
	 * @return
	 * @author ZhangYu 2016-06-15
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/terminalStatisticQuery", method = {RequestMethod.GET})
	public String terminalStatisticQuery(Model model,HttpServletRequest request,HttpSession session) {
		
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String end = sdf.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
//		String start = sdf.format(calendar.getTime());
		model.addAttribute("startDt", end);
		model.addAttribute("endDt", end);
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		String qryType = request.getParameter("qryType");
		Map<String, Object> channelQryParamMap = null;
		Map<String, Object> terminalTypeQryParamMap = null;
		
		//封装查询类型信息
		if("0".equals(qryType)){
			model.addAttribute("qryTypeName", "精品渠道终端(操作)汇总报表");
		} else if("1".equals(qryType)){
			model.addAttribute("qryTypeName", "精品渠道终端(库存)汇总报表");
		}
		model.addAttribute("qryType", qryType);
		
		//封装渠道列表
		try {
			channelQryParamMap = new HashMap<String, Object>();
			channelQryParamMap.put("staffId", sessionStaff.getStaffId());
			channelQryParamMap.put("dbRouteLog", sessionStaff.getCurrentAreaId());
			channelQryParamMap.put("relaType", "40");//10:受理; 20:渠道经理; 30:归属; 40:受理+归属; null:查询所有
			Map<String, Object> resultMap = staffChannelBmo.queryAllChannelByStaffId(channelQryParamMap, null, sessionStaff);
			if("0".equals(resultMap.get("code"))){
				model.addAttribute("cahnnelList", (List<Map<String, Object>>) resultMap.get("resultList"));
			} else{
				return super.failedStr(model, ErrorCode.QUERY_CHANNEL, "终端信息统计接口返回数据异常", channelQryParamMap);
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_CHANNEL, e, channelQryParamMap);
		}
		
		//终端品牌列表
		try {
			terminalTypeQryParamMap = new HashMap<String, Object>();
			terminalTypeQryParamMap.put("staffId", sessionStaff.getStaffId());
			//当品牌机型颜色都不传入时，返回品牌的集合
			terminalTypeQryParamMap.put("terminalBrand", "");
			terminalTypeQryParamMap.put("terminalType", "");
			terminalTypeQryParamMap.put("terminalColor", "");
			terminalTypeQryParamMap.put("flag", "1");//资源要求：取值：1  报表查询标识（当报表查询时必传）
			Map<String, Object> resultMap = mktResBmo.termOrderQuery(terminalTypeQryParamMap, null, sessionStaff);
			if(ResultCode.R_SUCCESS.equals(resultMap.get("code")) && resultMap.get("result") != null){
				if(resultMap.get("result") != null){
					HashMap<String, Object> subResultMap = (HashMap<String, Object>) resultMap.get("result");
					model.addAttribute("brandList", (ArrayList<Map<String, Object>>) subResultMap.get("terminalBrandInfo"));
				} else{
					return super.failedStr(model, ErrorCode.TERM_ORDER_QUERY_SERVICE, "终端预约联动查询接口result节点未返回数据", terminalTypeQryParamMap);
				}
			} else{
				return super.failedStr(model, ErrorCode.TERM_ORDER_QUERY_SERVICE, "终端预约联动查询接口返回数据异常", terminalTypeQryParamMap);
			}
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.TERM_ORDER_QUERY_SERVICE, e, terminalTypeQryParamMap);
		}
				
		return "/mktRes/terminal-statistic-query";
	}
	
	/**
	 * 精品渠道终端(操作)汇总报表、精品渠道终端(库存)汇总报表 查询数据列表
	 * @param qryParam
	 * @param model
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/terminalStatisticQueryList", method = {RequestMethod.POST})
	public String terminalStatisticQueryList(@RequestBody Map<String, Object> qryParam, Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> resultMap = null;
		String returnString = null;
		
		if(qryParam.get("qryType") == null || "".equals(qryParam.get("qryType"))){
			return super.failedStr(model, ErrorCode.PORTAL_INPARAM_ERROR, new Exception("参数[qryType]缺失或非法值，请稍后刷新页面重新尝试。"), qryParam);
		}
		
		String qryType = MapUtils.getString(qryParam, "qryType", "0");
		
		try {
			resultMap = mktResBmo.terminalStatisticQueryList(qryParam, null, sessionStaff);
			if (resultMap != null && ResultCode.R_SUCC.equals(resultMap.get("code").toString())){		
				PageModel<Map<String, Object>> pageModel = PageUtil.buildPageModel(
						MapUtils.getIntValue(qryParam, "pageIndex", 1), 
						MapUtils.getIntValue(qryParam,"pageSize",10), 
						(ArrayList<Map<String, Object>>)resultMap.get("resultList"));
	             model.addAttribute("pageModel", pageModel);
	             model.addAttribute("totalResultNum", ((ArrayList<Map<String, Object>>)resultMap.get("resultList")).size());
	             //查询成功后，缓存当前的qryParam，以便导出时查询所有数据
	             mktResBmo.cacheParamsInSession(super.getRequest(), qryParam, SysConstant.TERMINAL_STATISTIC);
			} else{
				model.addAttribute("code", resultMap.get("code"));
				model.addAttribute("message", resultMap.get("message"));
			}
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, qryParam, ErrorCode.ECS_TERMSTATISIICSERVICE);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.ECS_TERMSTATISIICSERVICE, e, qryParam);
		}
		
		if("1".equals(qryType)){
			//精品渠道终端(库存)汇总报表
			returnString = "/mktRes/terminal-statistic-query-list-zdkc";
		} else{
			//其他默认为：精品渠道终端(操作)汇总报表
			returnString = "/mktRes/terminal-statistic-query-list-zdcz";
		}
		
		return returnString;
	}
	
	/**
	 * 精品渠道终端进销存明细报表、精品渠道终端进销存(库存)明细报表 主页面
	 * @param model
	 * @param request
	 * @param session
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/terminalStatisticDetailQuery", method = {RequestMethod.GET})
	public String terminalStatisticDetailQuery(Model model,HttpServletRequest request,HttpSession session) {
		
		//初始化时间
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String end = sdf.format(calendar.getTime());
		calendar.add(Calendar.DATE, -1);
//		String start = sdf.format(calendar.getTime());
		model.addAttribute("startDt", end);
		model.addAttribute("endDt", end);
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> qryParamMap = new HashMap<String, Object>();
		String qryType = request.getParameter("qryType");
		Map<String, Object> terminalTypeQryParamMap = null;
		
		//封装查询类型信息
		model.addAttribute("qryType", qryType);	
		if("0".equals(qryType)){
			model.addAttribute("qryTypeName", "精品渠道终端进销存明细报表");
		} else if("1".equals(qryType)){
			model.addAttribute("qryTypeName", "精品渠道终端进销存(库存)明细报表");
		}
		
		//封装渠道信息
		try {
			qryParamMap.put("staffId", sessionStaff.getStaffId());
			qryParamMap.put("dbRouteLog", sessionStaff.getCurrentAreaId());
			qryParamMap.put("relaType", "40");//10:受理; 20:渠道经理; 30:归属; 40:受理+归属; null:查询所有
			Map<String, Object> resultMap = staffChannelBmo.queryAllChannelByStaffId(qryParamMap, null, sessionStaff);
			if("0".equals(resultMap.get("code"))){
				model.addAttribute("cahnnelList", (List<Map<String, Object>>) resultMap.get("resultList"));
			} else{
				return super.failedStr(model, ErrorCode.QUERY_CHANNEL, "终端信息统计接口返回数据异常", qryParamMap);
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_CHANNEL, e, qryParamMap);
		}
		
		//终端品牌列表
		try {
			terminalTypeQryParamMap = new HashMap<String, Object>();
			terminalTypeQryParamMap.put("staffId", sessionStaff.getStaffId());
			//当品牌机型颜色都不传入时，返回品牌的集合
			terminalTypeQryParamMap.put("terminalBrand", "");
			terminalTypeQryParamMap.put("terminalType", "");
			terminalTypeQryParamMap.put("terminalColor", "");
			terminalTypeQryParamMap.put("flag", "1");//资源要求：取值：1  报表查询标识（当报表查询时必传）
			Map<String, Object> resultMap = mktResBmo.termOrderQuery(terminalTypeQryParamMap, null, sessionStaff);
			if(ResultCode.R_SUCCESS.equals(resultMap.get("code")) && resultMap.get("result") != null){
				if(resultMap.get("result") != null){
					HashMap<String, Object> subResultMap = (HashMap<String, Object>) resultMap.get("result");
					model.addAttribute("brandList", (ArrayList<Map<String, Object>>) subResultMap.get("terminalBrandInfo"));
				} else{
					return super.failedStr(model, ErrorCode.TERM_ORDER_QUERY_SERVICE, "终端预约联动查询接口result节点未返回数据", terminalTypeQryParamMap);
				}
			} else{
				return super.failedStr(model, ErrorCode.TERM_ORDER_QUERY_SERVICE, "终端预约联动查询接口返回数据异常", terminalTypeQryParamMap);
			}
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.TERM_ORDER_QUERY_SERVICE, e, terminalTypeQryParamMap);
		}

		return "/mktRes/terminal-statistic-detail-query";
	}
	
	/**
	 * 精品渠道终端进销存明细报表、精品渠道终端进销存(库存)明细报表 查询结果为当日实时数据
	 * @param qryParam
	 * @param model
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/terminalStatisticDetailQueryList", method = {RequestMethod.POST})
	public String terminalStatisticDetailQueryList(@RequestBody Map<String, Object> qryParam, Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> resultMap = null;
		
		if(qryParam.get("qryType") == null || "".equals(qryParam.get("qryType"))){
			return super.failedStr(model, ErrorCode.PORTAL_INPARAM_ERROR, new Exception("参数[qryType]缺失或非法值，请稍后刷新页面重新尝试。"), qryParam);
		}

		try {
			resultMap = mktResBmo.terminalStatisticDetailQueryList(qryParam, null, sessionStaff);
			if (resultMap != null && ResultCode.R_SUCC.equals(resultMap.get("code").toString())){	
				PageModel<Map<String, Object>> pageModel = PageUtil.buildPageModel(
					MapUtils.getIntValue(qryParam, "pageIndex", 1), 
					MapUtils.getIntValue(qryParam,"pageSize",10), 
					MapUtils.getIntValue(resultMap, "totalResultNum", 10),
					(ArrayList<Map<String, Object>>)resultMap.get("resultList")
				);
				model.addAttribute("pageModel", pageModel);
				model.addAttribute("qryType", qryParam.get("qryType"));
				model.addAttribute("totalResultNum", MapUtils.getIntValue(resultMap, "totalResultNum", 10));
				//查询成功后，缓存当前的qryParam，以便导出时查询所有数据
				mktResBmo.cacheParamsInSession(super.getRequest(), qryParam, SysConstant.TERMINAL_STATISTIC_DETAIL);
			} else{
				model.addAttribute("code", resultMap.get("code"));
				model.addAttribute("message", resultMap.get("message"));
			}
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, qryParam, ErrorCode.ECS_TERMDETAILSTATISTICSERVICE);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.ECS_TERMDETAILSTATISTICSERVICE, e, qryParam);
		}
		
		return "/mktRes/terminal-statistic-detail-query-list";
	}
	
	/**
	 * 精品渠道终端(操作)汇总报表、精品渠道终端(库存)汇总报表 导出Excel，导出所有结果列表
	 * @param qryParam
	 * @param model
	 * @param response
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/terminalStatisticExport", method = {RequestMethod.POST, RequestMethod.GET})
	@ResponseBody
	public JsonResponse terminalStatisticExport(@RequestParam Map<String, Object> qryParam, Model model, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> resultMap = null;
		String qryType = MapUtils.getString(qryParam, "qryType", "0");
		String[][] headers = null;
		boolean isParamError = false;
		String errorMsg = null;
		Map<String, Object> cachedParams = null;
		
		//从缓存中获取查询入参，如果获取失败，则使用现有的请求入参
		cachedParams = mktResBmo.getCachedParamsInSession(super.getRequest(), qryParam, SysConstant.TERMINAL_STATISTIC);
		if(cachedParams != null){
			qryParam = cachedParams;
		}

		if(qryParam.get("qryType") != null && !"".equals(qryParam.get("qryType"))){
			if("0".equals(qryType)){//精品渠道终端(操作)汇总报表
				//封装表头信息
				String[][] tempHeaders = {
					{"brand","type","color","lyQty","htQty","lyhjQty","hyxsQty","ljxsQty","xsQty"},
					{"品牌","机型","颜色","领用量","退回量","领用合计","合约","裸机","合计"}
				};
				headers = tempHeaders;
			} else if("1".equals(qryType)){//精品渠道终端(库存)汇总报表
				//封装表头信息
				String[][] tempHeaders = {
					{"brand","type","color","kcQty","cqkcQty","zzcQty"},
					{"品牌","机型","颜色","库存量","超期库存量","自注册激活量"}
				};
				headers = tempHeaders;
			} else{
				isParamError = true;
				errorMsg = "参数[qryType:"+qryType+"]非法值，请稍后刷新页面重新尝试。";
			}
		} else{
			isParamError = true;
			errorMsg = "参数[qryType]缺失，请稍后刷新页面重新尝试。";
		}
		
		if(!isParamError){
			try {
				resultMap = mktResBmo.terminalStatisticQueryList(qryParam, null, sessionStaff);
				if (resultMap != null && ResultCode.R_SUCC.equals(resultMap.get("code").toString())){
					String excelTitle = "terminalStatistic_" + qryType;
					if(((ArrayList<Map<String, Object>>)resultMap.get("resultList")).size() > 0){
						ExcelUtil.exportExcelXls(excelTitle, headers, (ArrayList<Map<String, Object>>)resultMap.get("resultList"), response, null);
					} else{
						Map<String, Object> noticeUserNoData = new LinkedHashMap<String, Object>();
						noticeUserNoData.put("brand", "没有查询到数据");
						List<Map<String, Object>> dataList = new ArrayList<Map<String, Object>>();
						dataList.add(noticeUserNoData);
						ExcelUtil.exportExcelXls(excelTitle, headers, dataList, response, null);
					}
				} else{
					errorMsg = resultMap.get("resultMsg").toString();
					return super.failed(ErrorCode.ECS_TERMSTATISIICSERVICE, new Exception(errorMsg), qryParam);
				}
			} catch (InterfaceException ie) {
				return super.failed(ie, qryParam, ErrorCode.ECS_TERMSTATISIICSERVICE);
			} catch (Exception e) {
				return super.failed(ErrorCode.ECS_TERMSTATISIICSERVICE, e, qryParam);
			}
		} else{
			return super.failed(ErrorCode.PORTAL_INPARAM_ERROR, new Exception(errorMsg), qryParam);
		}
				
		return super.successed("导出成功！");
	}
	
	/**
	 * 精品渠道终端进销存明细报表、精品渠道终端进销存(库存)明细报表  导出Excel，导出所有数据列表
	 * @param qryParam
	 * @param model
	 * @param response
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/terminalStatisticDetailExport", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse terminalStatisticDetailExport(@RequestParam Map<String, Object> qryParam, Model model, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Map<String, Object> resultMap = null;
		String qryType = null;
		String[][] headers = null;
		Map<String, Object> transferInfo = new HashMap<String, Object>();
		boolean isParamError = false;
		String errorMsg = null;
		Map<String, Object> cachedParams = null;
		
		//从缓存中获取查询入参，如果获取失败，则使用现有的请求入参
		cachedParams = mktResBmo.getCachedParamsInSession(super.getRequest(), qryParam, SysConstant.TERMINAL_STATISTIC_DETAIL);
		if(cachedParams != null){
			qryParam = cachedParams;
		}
		
		MapUtils.safeAddToMap(qryParam, "pageIndex", (Integer)1);
		MapUtils.safeAddToMap(qryParam, "pageSize", (Integer)9999);
		
		if(qryParam.get("qryType") != null && !"".equals(qryParam.get("qryType"))){
			qryType = qryParam.get("qryType").toString();
			if(qryType.equals("0")){//精品渠道终端进销存明细报表
				//封装表头信息
				String[][] tempHeaders = {
					{"brand","type","color","instCode","dealType","dealTime","staffCode","staffName","storeName"},
					{"品牌","机型","颜色","串码","操作","操作时间","操作工号","操作姓名","终端仓库"}
				};
				headers = tempHeaders;
				//封装转义信息，dealType需要转义
				Map<String, Object> paramNameMap = new HashMap<String, Object>();
				paramNameMap.put("0", "领用");
				paramNameMap.put("1", "回退");
				paramNameMap.put("2", "裸机销售");
				paramNameMap.put("3", "合约销售");
				transferInfo.put("dealType", paramNameMap);
			} else if(qryType.equals("1")){//精品渠道终端进销存(库存)明细报表
				//封装表头信息
				String[][] tempHeaders = {
					{"brand","type","color","instCode","dealTime","isSelfRegister","storeName","overFlag"},
					{"品牌","机型","颜色","串码","入库时间","是否注册激活","终端仓库","库存超期"}
				};
				headers = tempHeaders;
				//封装转义信息，isSelfRegister、overFlag需要转义
				Map<String, Object> paramNameMapIsSelfRegister = new HashMap<String, Object>();
				Map<String, Object> paramNameMapOverFlag = new HashMap<String, Object>();
				paramNameMapIsSelfRegister.put("0", "否");
				paramNameMapIsSelfRegister.put("1", "是");
				paramNameMapOverFlag.put("0", "是");
				paramNameMapOverFlag.put("1", "否");
				transferInfo.put("isSelfRegister", paramNameMapIsSelfRegister);
				transferInfo.put("overFlag", paramNameMapOverFlag);
			} else{
				isParamError = true;
				errorMsg = "参数[qryType:"+qryType+"]非法值，请稍后刷新页面重新尝试。";
			}
		} else{
			isParamError = true;
			errorMsg = "参数[qryType]缺失，请稍后刷新页面重新尝试。";
		}
		
		if(!isParamError){
			try {
				resultMap = mktResBmo.terminalStatisticDetailQueryList(qryParam, null, sessionStaff);
				if (resultMap != null && ResultCode.R_SUCC.equals(resultMap.get("code").toString())){
					String excelTitle = "terminalDetailStatistic_" + qryType;
					if(((ArrayList<Map<String, Object>>)resultMap.get("resultList")).size() > 0){
						ExcelUtil.exportExcelXls(excelTitle, headers, (ArrayList<Map<String, Object>>)resultMap.get("resultList"), response, transferInfo);
					} else{
						Map<String, Object> noticeUserNoData = new LinkedHashMap<String, Object>();
						noticeUserNoData.put("brand", "没有查询到数据");
						List<Map<String, Object>> dataList = new ArrayList<Map<String, Object>>();
						dataList.add(noticeUserNoData);
						ExcelUtil.exportExcelXls(excelTitle, headers, dataList, response, null);
					}
				} else{
					errorMsg = resultMap.get("resultMsg").toString();
					return super.failed(ErrorCode.ECS_TERMDETAILSTATISTICSERVICE, new Exception(errorMsg), qryParam);
				}	
			} catch (InterfaceException ie) {
				return super.failed(ie, qryParam, ErrorCode.ECS_TERMDETAILSTATISTICSERVICE);
			} catch (Exception e) {
				return super.failed(ErrorCode.ECS_TERMDETAILSTATISTICSERVICE, e.getStackTrace().toString(), qryParam);
			}
		} else{
			return super.failed(ErrorCode.PORTAL_INPARAM_ERROR, new Exception(errorMsg), qryParam);
		}
				
		return super.successed("导出成功！");
	}
	
	@RequestMapping(value = "/writeCard/cardResourceQuery", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse cardResourceQuery(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			String areaId = (String)param.get("areaId");
			
			//redmine#10671,先判断common_region表中相关地址是否为本地网（region_type为1300），如是则直接透传处理，如否截取两位后补0
			Map<String, Object> areaInfo = CommonMethods.getAreaInfo(areaId);
			if("1300".equals(MapUtils.getString(areaInfo, "regionType"))){
				param.put("areaId", areaId); 
			} else {
				param.put("areaId", areaId.substring(0, 5) + "00"); 
			}
			
			rMap = mktResBmo.cardResourceQuery(param, flowNum, sessionStaff);
			if (rMap != null&& ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(rMap, "code"))) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(ErrorCode.CARD_RESOURCE_QUERY, rMap, param);
			}
		} catch(Exception e) {
			return super.failed(ErrorCode.CARD_RESOURCE_QUERY, e, param);
		}
		return jsonResponse;
	}
	
	@RequestMapping(value = "/writeCard/writeCardLogInfo", method = RequestMethod.POST)
	@ResponseBody
	public void writeCardLogInfo(@RequestBody Map<String, Object> param,HttpServletRequest request,
			@LogOperatorAnn String flowNum) {
		    SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
		    param.put("channel_id", sessionStaff.getCurrentChannelId());
		    param.put("staff_id", sessionStaff.getStaffId());
		    param.put("area_id", sessionStaff.getAreaId());
		    param.put("ip", ServletUtils.getIpAddr(request));
			param.put("method_name", "");//卡组件记录
			param.put("IN_PARAM", JsonUtil.toString(param));
			try {
				mktResBmo.writeCardLogInfo("WRITE_CARD_LOG_W",param, flowNum, sessionStaff);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	}
}

package com.al.lte.portal.app.controller.crm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
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
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 */
@Controller("com.al.lte.portal.app.controller.crm.MarketingRecommendController")
@RequestMapping("/app/marketingRecommend/*")
@AuthorityValid(isCheck = false)
public class marketingRecommendController extends BaseController {

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
     * 营销推荐-终端推荐
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/mktresRecommend", method = { RequestMethod.POST })
    public String mktresRecommend(@RequestBody Map<String, Object> param,HttpServletRequest request,Model model,HttpSession session) throws BusinessException {

        return "/app/marketingRecommend/mktresRecommend";
    }
    
    /**
     * 营销推荐-营销推荐清单查询
     * @param param
     * @param flowNum
     * @param model
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "queryMktCustList", method = RequestMethod.GET)
    public String queryMktCustList(@RequestParam Map<String, Object> param, @LogOperatorAnn String flowNum, Model model,HttpServletResponse response,HttpServletRequest request) throws BusinessException {

        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
        String areaId = "";
        HttpSession session = request.getSession();
    	List<Map> channelList = (List<Map>)session.getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL);
		for(int i=0;i<channelList.size();i++){
			Map cl = channelList.get(i);
			if(sessionStaff.getCurrentChannelId().equals(cl.get("id").toString())){
				areaId = cl.get("areaId").toString();
			}
		}
        param.put("areaId", areaId);
        //反馈结果
        List<Map<String, Object>> fk_list = MDA.MKT_CONTACT_RESULT;
        model.addAttribute("fk_list", fk_list);
        try {
        	 Map<String, Object> param1 = new HashMap<String, Object>();
        	 param1.put("areaId", areaId);
        	Map<String, Object> activityMap = mktResBmo.queryMktActivityList(param1, flowNum, sessionStaff);
        	 if (activityMap != null && activityMap.get("code") != null) {
        		if (activityMap.get("code").equals("POR-0000")) {
        			Map<String, Object> a_result = (Map<String, Object>) activityMap.get("result");
                    Map<String, Object> aresult = (Map<String, Object>) a_result.get("result");
                	List<Map<String, Object>> activitylist = (List<Map<String, Object>>) aresult.get("activityList");
                	model.addAttribute("activitylist", activitylist);
                	String activityId= "";
                	for(int i=0;i<activitylist.size();i++){
                		if(param.get("typeName").equals(activitylist.get(i).get("activityName"))){
                			activityId = String.valueOf(activitylist.get(i).get("activityId"));
                		}
                	}
                	param.put("activityId", activityId);
                	 Map<String, Object> resultMap = mktResBmo.queryMktCustList(param, flowNum, sessionStaff);
                     if (resultMap != null && resultMap.get("code") != null) {
                         if (resultMap.get("code").equals("POR-0000")) {
                             Map<String, Object> o_result = (Map<String, Object>) resultMap.get("result");
                             Map<String, Object> result = (Map<String, Object>) o_result.get("result");
                             Map<String, Object> res_page = (Map<String, Object>) result.get("page");
                             if (result != null && result.get("mktCustList") != null) {
                                 ArrayList<Map<String, Object>> mktCustList = (ArrayList<Map<String, Object>>) result.get("mktCustList");
                                 if (mktCustList.size() > 0) {
                                     if (res_page.get("totalCount") != null) {
                                         int pageNo = Integer.parseInt(param.get("pageIndex").toString());
                                         int pageSize = Integer.parseInt(param.get("pageSize").toString());
                                         int totalRecords = Integer.parseInt(res_page.get("totalCount").toString());
                                         PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, pageSize,
                                                 totalRecords < 1 ? 1 : totalRecords, mktCustList);
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
                 }else {
                     //数据返回异常
                     model.addAttribute("flag", 2);
                 } 
        	 }else {
                 //数据返回异常
                 model.addAttribute("flag",-1);
             }
                 
//            Map<String, Object> resultMap = mktResBmo.queryMktCustList(param, flowNum, sessionStaff);
//
//            if (resultMap != null && resultMap.get("code") != null) {
//                if (resultMap.get("code").equals("POR-0000")) {
//                    Map<String, Object> o_result = (Map<String, Object>) resultMap.get("result");
//                    Map<String, Object> result = (Map<String, Object>) o_result.get("result");
//                    Map<String, Object> res_page = (Map<String, Object>) result.get("page");
//                    if (result != null && result.get("mktCustList") != null) {
//                        ArrayList<Map<String, Object>> mktCustList = (ArrayList<Map<String, Object>>) result.get("mktCustList");
//                        if (mktCustList.size() > 0) {
//                            if (res_page.get("totalCount") != null) {
//                                int pageNo = Integer.parseInt(param.get("pageIndex").toString());
//                                int pageSize = Integer.parseInt(param.get("pageSize").toString());
//                                int totalRecords = Integer.parseInt(res_page.get("totalCount").toString());
//                                PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, pageSize,
//                                        totalRecords < 1 ? 1 : totalRecords, mktCustList);
//                                model.addAttribute("pageModel", pm);
//                                //数据返回正常&&查询成功&&结果不为空
//                                model.addAttribute("flag", 0);
//                            } else {
//                                //数据返回异常
//                                model.addAttribute("flag", -1);
//                            }
//                        } else {
//                            //数据返回正常&&查询成功&&结果为空
//                            model.addAttribute("flag", 1);
//                        }
//                    } else {
//                        //数据返回异常
//                        model.addAttribute("flag", -1);
//                    }
//                } else {
//                    //数据返回正常&&查询失败
//                    model.addAttribute("flag", 2);
//                }
//            } else {
//                //数据返回异常
//                model.addAttribute("flag", -1);
//            }
        } catch (BusinessException be) {
            return super.failedStr(model, be);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_MKT_CUST_LIST, e, param);
        }
        return "/app/marketingRecommend/recommend-list";
    }
    
    /**
     * 营销推荐-标签查询
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/queryProdInstStats", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryProdInstStats(@RequestBody Map<String, Object> param,@LogOperatorAnn String flowNum, HttpServletResponse response,HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId = "";
		HttpSession session = request.getSession();
    	List<Map> channelList = (List<Map>)session.getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL);
		for(int i=0;i<channelList.size();i++){
			Map cl = channelList.get(i);
			if(sessionStaff.getCurrentChannelId().equals(cl.get("id").toString())){
				areaId = cl.get("areaId").toString();
			}
		}
    	param.put("areaId", areaId);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
//			param.put("staffId", sessionStaff.getStaffId());
//			param.put("orderNo","");
			rMap = mktResBmo.queryProdInstStats(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("营销标签查询服务出错", e);
			jsonResponse = super.failed("营销标签查询服务出错",ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_PROD_INST_STATS);
		} catch (Exception e) {
			log.error("营销标签查询服务异常", e);
			return super.failed(ErrorCode.QUERY_PROD_INST_STATS, e, param);
		}
		return jsonResponse;
	}
    
    /**
     * 营销推荐-反馈结果记录服务
     * @return
     * @throws BusinessException
     */
    @RequestMapping(value = "/saveMktContactResult", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse saveMktContactResult(@RequestBody Map<String, Object> param,@LogOperatorAnn String flowNum, HttpServletResponse response,HttpServletRequest request) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId = "";
		HttpSession session = request.getSession();
    	List<Map> channelList = (List<Map>)session.getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL);
		for(int i=0;i<channelList.size();i++){
			Map cl = channelList.get(i);
			if(sessionStaff.getCurrentChannelId().equals(cl.get("id").toString())){
				areaId = cl.get("areaId").toString();
			}
		}
    	param.put("areaId", areaId);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = mktResBmo.saveMktContactResult(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse=super.successed(rMap, ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			this.log.error("反馈结果记录服务出错", e);
			jsonResponse = super.failed("反馈结果记录服务出错",ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.SAVE_MKT_CONTACT_RESULT);
		} catch (Exception e) {
			log.error("反馈结果记录服务异常", e);
			return super.failed(ErrorCode.SAVE_MKT_CONTACT_RESULT, e, param);
		}
		return jsonResponse;
	}
  	
}

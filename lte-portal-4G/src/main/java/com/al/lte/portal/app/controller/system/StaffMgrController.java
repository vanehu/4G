package com.al.lte.portal.app.controller.system;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
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
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 工号管理控制类
 * @author xuj
 *
 */
@Controller("com.al.lte.portal.app.controller.system.StaffMgrController")
@RequestMapping("/app/staffMgr/*")
public class StaffMgrController extends com.al.lte.portal.controller.system.StaffMgrController {
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;
	//跳转至重置密码页面
    @RequestMapping(value = "/resetPwd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String preResetPwd(Model model) throws AuthorityException {
    	return "/app/staff/staff-pwd-reset";
    }
	//跳转至修改密码页面
    @RequestMapping(value = "/updatePwd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String preUpdatePwd(HttpSession session,Model model) throws AuthorityException {
    	model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"pad/staffMgr/updatePwd"));
    	return "/app/staff/staff-pwd";
    }
    
    //员工查询及协销人--入口
    @RequestMapping(value = "/getStaffListPrepare", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String getStaffListPrepare(@RequestParam Map<String, Object> param,Model model) throws AuthorityException {
        model.addAttribute("pageParam", param);
        return "/app/order/order-dialog-staff";
    }
    //员工查询及协销人
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/getStaffList", method = RequestMethod.POST)
    public String getStaffList(HttpSession session, Model model, @RequestBody Map<String, Object> param) {
        
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

        Integer totalSize = 1;
        List list = new ArrayList();
        String areaId = sessionStaff.getAreaId();
        Integer iAreaId = areaId == null ? 0 : Integer.parseInt(areaId);
        String pageIndex = MapUtils.getString(param, "pageIndex", "");
        String pageSize = MapUtils.getString(param, "pageSize", "");
        int iPage = 1;
        int iPageSize = 10;
        Map<String, Object> staffParm = new HashMap<String, Object>(param);
        try {
            iPage = Integer.parseInt(pageIndex);
            iPageSize = Integer.parseInt(pageSize);
            if (iPage > 0) {
                staffParm.remove("dealerId");
                staffParm.put("areaId", iAreaId);
                if (staffParm.get("staffName") != null && "".equals(staffParm.get("staffName"))) {
                    staffParm.remove("staffName");
                }
                if (staffParm.get("staffCode") != null && "".equals(staffParm.get("staffCode"))) {
                    staffParm.remove("staffCode");
                }
                Map<String, Object> returnMap = this.staffBmo.queryStaffList(staffParm, null, sessionStaff);
                if (returnMap.get("totalNum") != null) {
                    totalSize = Integer.parseInt(returnMap.get("totalNum").toString());
                    if (totalSize > 0) {
                        list = (List) returnMap.get("result");
                    }
                }
            }
        } catch (BusinessException be) {
            super.failed(be);
        } catch (InterfaceException ie) {
            super.failed(ie, staffParm, ErrorCode.QUERY_STAFF_INFO);
        } catch (Exception e) {
            super.failed(ErrorCode.QUERY_STAFF_INFO, e, staffParm);
        }
        PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(iPage, iPageSize, totalSize < 1 ? 1 : totalSize,
                list);
        model.addAttribute("pageModel", pm);
        model.addAttribute("pageParam", param);
        return "/app/order/order-dialog-staff-list";
    }
    //员工查询及协销人
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/getStaffList2", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getStaffList2(@RequestBody Map param,
			HttpSession session, @LogOperatorAnn String flowNum) {

		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = new JsonResponse();
		Integer totalSize = 1;
		List list = new ArrayList();
		String areaId = sessionStaff.getAreaId();
		Integer iAreaId = areaId == null ? 0 : Integer.parseInt(areaId);
		String pageIndex = MapUtils.getString(param, "pageIndex", "");
		String pageSize = MapUtils.getString(param, "pageSize", "");
		int iPage = 1;
		int iPageSize = 10;
		Map<String, Object> staffParm = new HashMap<String, Object>(param);
		try {
			iPage = Integer.parseInt(pageIndex);
			iPageSize = Integer.parseInt(pageSize);
			if (iPage > 0) {
				staffParm.put("staffName",param.get("name"));
				staffParm.put("staffCode",param.get("code"));
				staffParm.remove("dealerId");
				staffParm.put("areaId", iAreaId);
				if (staffParm.get("staffName") != null
						&& "".equals(staffParm.get("staffName"))) {
					staffParm.remove("staffName");
				}
				if (staffParm.get("staffCode") != null
						&& "".equals(staffParm.get("staffCode"))) {
					staffParm.remove("staffCode");
				}
				Map<String, Object> returnMap = this.staffBmo.queryStaffList(
						staffParm, null, sessionStaff);
				if (returnMap.get("totalNum") != null) {
					totalSize = Integer.parseInt(returnMap.get("totalNum")
							.toString());
					if (totalSize > 0) {
						list = (List) returnMap.get("result");
					}
				}
			}
			jsonResponse.setSuccessed(true);
			jsonResponse.setCode(0);
			jsonResponse.setData(list);
		} catch (Exception e) {
			jsonResponse.setSuccessed(false);
			jsonResponse.setCode(1);
			jsonResponse.setData("失败，请稍后再试");
			log.error("", e);
		}
		return jsonResponse;
	}
    
    /**
     * 设置用户当前渠道
     * @param param
     * @param flowNum
     * @return
     */
    @RequestMapping(value = "/setCurrentChannel", method = { RequestMethod.GET, RequestMethod.POST })
    @ResponseBody
    public JsonResponse  setCurrentChannel(@RequestBody Map param,HttpSession session,
            @LogOperatorAnn String flowNum) {
    	JsonResponse jsonResponse = new JsonResponse();
    	jsonResponse.setSuccessed(false);
		jsonResponse.setCode(1);
		jsonResponse.setData("切换渠道失败，请稍后再试");
    	try{
    		String channelId = MapUtil.asStr(param,"channelId");
    		if(channelId!=null&&!channelId.equals("")&&session.getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL)!=null){
        		List<Map> channelList = (List<Map>)session.getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL);
        		for(Map channelRow:channelList){
        			String id = MapUtils.getString(channelRow, "id", "");
        			if(channelId.equals(id)){
        				SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
        		                SysConstant.SESSION_KEY_LOGIN_STAFF);
        				
						String areaAllName = "" ;
						String areaName = channelRow.get("areaName")==null?null:channelRow.get("areaName").toString();
						String areaId = channelRow.get("areaId")==null?"":channelRow.get("areaId").toString();
						if(!areaId.equals("")){
							areaAllName = areaName ;
							if(areaId.substring(3, 7).equals("0000")){//省份
								if(channelRow.get("provinceName")!=null&&!channelRow.get("provinceName").equals("")){
									areaAllName = channelRow.get("provinceName").toString() ;
								}
							}else if(areaId.substring(5, 7).equals("00")){//市
								if(channelRow.get("provinceName")!=null&&!channelRow.get("provinceName").equals("")){
									areaAllName = channelRow.get("provinceName").toString()+ " > " + areaAllName ;
								}
							}else{
								if(channelRow.get("cityName")!=null&&!channelRow.get("cityName").equals("")){
									areaAllName = channelRow.get("cityName").toString()+ " > " + areaAllName ;
								}
								if(channelRow.get("provinceName")!=null&&!channelRow.get("provinceName").equals("")){
									areaAllName = channelRow.get("provinceName").toString()+ " > " + areaAllName ;
								}
							}
						}
						channelRow.put("areaAllName", areaAllName);
        				
        				SessionStaff.setChannelInfoFromMap(sessionStaff, channelRow);
    					
    			    	ServletUtils.setSessionAttribute(super.getRequest(), 
    			    			SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
    			    	
    			    	jsonResponse.setCode(0);
    			    	jsonResponse.setSuccessed(true);
    			    	jsonResponse.setData(channelRow);
    			    	break;
        			}
        		}
    		}
    	}catch(Exception e) {
    		jsonResponse.setSuccessed(false);
			jsonResponse.setCode(1);
			jsonResponse.setData("切换渠道失败，请稍后再试");
			log.error("",e);
    	}
        return jsonResponse;
    }
    
    /**
     * 主数据查询
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/getCTGMainData", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryCTGMainData(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response, @LogOperatorAnn String flowNum){	
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try{		
 			rMap = staffBmo.queryCTGMainData(param, flowNum, sessionStaff);
 			log.debug("return={}", JsonUtil.toString(rMap));
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
 				jsonResponse = super.successed(rMap.get("result"),
 						ResultConstant.SUCCESS.getCode());
 			} else {
 				jsonResponse = super.failed(rMap.get("msg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("调用主数据接口失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.ORDER_CTGMAINDATA);
		} catch (Exception e) {
			log.error("门户/staffMgr/getCTGMainData方法异常", e);
			return super.failed(ErrorCode.ORDER_CTGMAINDATA, e, param);
		}
	}
}

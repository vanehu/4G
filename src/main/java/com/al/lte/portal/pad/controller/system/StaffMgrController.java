package com.al.lte.portal.pad.controller.system;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
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
@Controller("com.al.lte.portal.pad.controller.system.StaffMgrController")
@RequestMapping("/pad/staffMgr/*")
public class StaffMgrController extends com.al.lte.portal.controller.system.StaffMgrController {
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;
	//跳转至重置密码页面
    @RequestMapping(value = "/resetPwd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String preResetPwd(Model model) throws AuthorityException {
    	return "/pad/staff/staff-pwd-reset";
    }
	//跳转至修改密码页面
    @RequestMapping(value = "/updatePwd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String preUpdatePwd(HttpSession session,Model model) throws AuthorityException {
    	model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"pad/staffMgr/updatePwd"));
    	return "/pad/staff/staff-pwd";
    }
    
    //员工查询及协销人--入口
    @RequestMapping(value = "/getStaffListPrepare", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String getStaffListPrepare(@RequestParam Map<String, Object> param,Model model) throws AuthorityException {
        model.addAttribute("pageParam", param);
        return "/pad/order/order-dialog-staff";
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
        Map<String, Object> staffParm = new HashMap<String, Object>();
        try {
            iPage = Integer.parseInt(pageIndex);
            iPageSize = Integer.parseInt(pageSize);
            staffParm.put("objInstId", param.get("objInstId"));
            staffParm.put("pageIndex", param.get("pageIndex"));
            staffParm.put("pageSize", param.get("pageSize"));
            String staffName=(String)param.get("staffName");
            String staffCode=(String)param.get("staffCode2");
            String qrySalesCode=(String)param.get("qrySalesCode");
            if (iPage > 0) {
              //  staffParm.remove("dealerId");
                staffParm.put("areaId", iAreaId);
                if(staffName!=null && staffName.trim().length()>0){
                	staffParm.put("staffName", staffName);
                }
                if(staffCode!=null && staffCode.trim().length()>0){
                	staffParm.put("staffCode",staffCode);
                }
                if(qrySalesCode!=null && qrySalesCode.trim().length()>0){
                	staffParm.put("qrySalesCode",qrySalesCode);
                }
                /*
                if (staffParm.get("staffName") == null && "".equals(staffParm.get("staffName"))) {
                    staffParm.remove("staffName");
                }
                if (staffParm.get("qryStaffCode") == null && "".equals(staffParm.get("qryStaffCode"))) {
                    staffParm.remove("staffCode");
                }else{
                	staffParm.put("staffCode", staffParm.get("qryStaffCode"));
                }
                */
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
        return "/pad/order/order-dialog-staff-list";
    }
}

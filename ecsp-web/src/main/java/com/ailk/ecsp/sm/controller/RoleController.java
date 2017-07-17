package com.ailk.ecsp.sm.controller;

import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.ailk.ecsp.client.utils.JsonUtil;
import com.ailk.ecsp.mybatis.model.Portal;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.sm.bmo.ParamBmo;
import com.ailk.ecsp.sm.bmo.PortalBmo;
import com.ailk.ecsp.sm.bmo.RoleBmo;
import com.ailk.ecsp.sm.common.ResultMap;
import com.ailk.ecsp.util.MapUtil;


@Controller
@RequestMapping("/role/*")
public class RoleController {
	@Autowired
	private RoleBmo roleBmo;
	@Autowired
	private PortalBmo portalBmo;
	
	private static Logger log = LoggerFactory.getLogger(RoleController.class);
	
    @RequestMapping(value = "/roleIndexPage", method = RequestMethod.GET)
    public String paramPage(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	return "basecfg/role_index";
    }
    
    @RequestMapping(value = "/roleQuery", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> portalQuery(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	int pagesize = MapUtil.asInt(param, "pagesize", 10);
    	int page = MapUtil.asInt(param, "page", 1);
    	Map map = roleBmo.queryRole(page, pagesize);
    	return map;
    }
    
    @RequestMapping(value = "/roleAddPage", method = RequestMethod.GET)
    public String roleAddPage(HttpSession session,Model model){
    	List list = portalBmo.queryAllPortal();
    	model.addAttribute("list", list);
    	log.debug(JsonUtil.toString(model));
    	return "basecfg/role_add";
    }
    
    @RequestMapping(value = "/roleAdd", method = RequestMethod.POST)
    public @ResponseBody ResultMap roleAdd(@RequestBody ServiceRole param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	ResultMap result = roleBmo.insertRole(param);
    	return result;
    }
    
    @RequestMapping(value = "/roleDel", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> roleDel(@RequestBody Long roleId,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(roleId));
    	ResultMap result = roleBmo.deleteRole(roleId);
    	return result;
    }
    
    @RequestMapping(value = "/roleEditPage", method = RequestMethod.GET)
    public String roleEditPage(Model model,HttpSession session){
    	List list = portalBmo.queryAllPortal();
    	model.addAttribute("list", list);
    	return "basecfg/role_edit";
    }
    
    
    @RequestMapping(value = "/roleEdit", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> roleEdit(@RequestBody ServiceRole role,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(role));
    	ResultMap result = roleBmo.updateRole(role);
    	return result;
    }
    
}

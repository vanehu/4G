package com.ailk.ecsp.sm.controller;

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
import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.sm.bmo.ParamBmo;
import com.ailk.ecsp.sm.bmo.PortalBmo;
import com.ailk.ecsp.sm.common.ResultMap;
import com.ailk.ecsp.util.MapUtil;


@Controller
@RequestMapping("/portal/*")
public class PortalController {
	@Autowired
	private PortalBmo portalBmo;
	private static Logger log = LoggerFactory.getLogger(PortalController.class);
	
    @RequestMapping(value = "/portalIndexPage", method = RequestMethod.GET)
    public String paramPage(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	return "basecfg/portal_index";
    }
    
    @RequestMapping(value = "/portalQuery", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> portalQuery(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	int pagesize = MapUtil.asInt(param, "pagesize", 10);
    	int page = MapUtil.asInt(param, "page", 1);
    	Map map = portalBmo.queryPortal(page, pagesize);
    	return map;
    }
    
    @RequestMapping(value = "/portalAddPage", method = RequestMethod.GET)
    public String portalAddPage(HttpSession session){
    	return "basecfg/portal_add";
    }
    
    @RequestMapping(value = "/portalAdd", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> portalAdd(@RequestBody Portal param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	ResultMap result = portalBmo.insertPortal(param);
    	return result;
    }
    
    @RequestMapping(value = "/portalDel", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> portalDel(@RequestBody Long portalId,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(portalId));
    	ResultMap result = portalBmo.deletePortal(portalId);
    	return result;
    }
    
    @RequestMapping(value = "/portalEditPage", method = RequestMethod.GET)
    public String portalEditPage(HttpSession session){
    	return "basecfg/portal_edit";
    }
    
    
    @RequestMapping(value = "/portalEdit", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> paramEdit(@RequestBody Portal param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	ResultMap result = portalBmo.updatePortal(param);
    	return result;
    }
    
}

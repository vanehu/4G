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
import com.ailk.ecsp.mybatis.model.IntfUrl;
import com.ailk.ecsp.sm.bmo.IntfUrlBmo;
import com.ailk.ecsp.sm.common.ResultMap;
import com.ailk.ecsp.util.MapUtil;


@Controller
@RequestMapping("/intf/*")
public class IntfUrlController {

	@Autowired
	private IntfUrlBmo intfUrlBmo;
	
	private static Logger log = LoggerFactory.getLogger(IntfUrlController.class);
	
    @RequestMapping(value = "/intfIndexPage", method = RequestMethod.GET)
    public String intfIndexPage(HttpSession session){
    	return "service/intf_index";
    }
    
    @RequestMapping(value = "/intfQuery", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> intfUrlQuery(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	int pagesize = MapUtil.asInt(param, "pagesize", 10);
    	int page = MapUtil.asInt(param, "page", 1);
    	Map map = intfUrlBmo.queryIntfUrl(page, pagesize);
    	return map;
    }
    
    @RequestMapping(value = "/intfAddPage", method = RequestMethod.GET)
    public String portalAddPage(HttpSession session){
    	return "service/intf_add";
    }
    
    @RequestMapping(value = "/intfAdd", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> intfAdd(@RequestBody IntfUrl param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	ResultMap result = intfUrlBmo.insertIntfUrl(param);
    	return result;
    }
    
    @RequestMapping(value = "/intfDel", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> intfDel(@RequestBody Long intfUrlId,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(intfUrlId));
    	ResultMap result = intfUrlBmo.deleteIntfUrl(intfUrlId);
    	return result;
    }
    
    @RequestMapping(value = "/intfEditPage", method = RequestMethod.GET)
    public String intfEditPage(HttpSession session){
    	return "service/intf_edit";
    }
    
    
    @RequestMapping(value = "/intfEdit", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> intfEdit(@RequestBody IntfUrl param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	ResultMap result = intfUrlBmo.updateIntfUrl(param);
    	return result;
    }
    
}

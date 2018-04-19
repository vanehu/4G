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
import com.ailk.ecsp.core.manager.ServiceManager;
import com.ailk.ecsp.mybatis.model.ServiceModel;
import com.ailk.ecsp.mybatis.model.ServiceRole;
import com.ailk.ecsp.sm.bmo.RoleBmo;
import com.ailk.ecsp.sm.bmo.ServiceBmo;
import com.ailk.ecsp.sm.common.ResultMap;
import com.ailk.ecsp.util.MapUtil;


@Controller
@RequestMapping("/service/*")
public class ServiceController {
	@Autowired
	private RoleBmo roleBmo;
	@Autowired
	private ServiceBmo serviceBmo;
	@Autowired
	private ServiceManager serviceManager;
	
	private static Logger log = LoggerFactory.getLogger(ServiceController.class);
	
    @RequestMapping(value = "/serviceIndexPage", method = RequestMethod.GET)
    public String serviceIndexPage(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	return "service/service_index";
    }
    
    @RequestMapping(value = "/serviceQuery", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> serviceQuery(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	int pagesize = MapUtil.asInt(param, "pagesize", 10);
    	int page = MapUtil.asInt(param, "page", 1);
    	Map map = serviceBmo.queryService(page, pagesize);
    	log.debug(JsonUtil.toString(map));
    	return map;
    }
    
    @RequestMapping(value = "/serviceAddPage", method = RequestMethod.GET)
    public String roleAddPage(HttpSession session,Model model){
    	Map map = serviceBmo.serviceAddPage();
    	model.addAllAttributes(map);
    	log.debug(JsonUtil.toString(model));
    	return "service/service_add";
    }
    
    @RequestMapping(value = "/serviceAdd", method = RequestMethod.POST)
    public @ResponseBody ResultMap serviceAdd(@RequestBody ServiceModel param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	int num = serviceManager.addService(param);
    	ResultMap result = new ResultMap();
    	if(num>0){
    		result.setSuccess("服务增加成功");
    	}else{
    		result.setFail("服务增加失败");
    	}
    	return result;
    }
    
    @RequestMapping(value = "/serviceDel", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> serviceDel(@RequestBody Long serviceId,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(serviceId));
    	int num = serviceBmo.delService(serviceId);
    	ResultMap result = new ResultMap();
    	if(num>=0){
    		result.setSuccess("成功删除");
    	}else{
    		result.setFail("删除失败");
    	}
    	return result;
    }
    
    @RequestMapping(value = "/serviceEditPage", method = RequestMethod.GET)
    public String serviceEditPage(Model model,HttpSession session){
    	return "service/service_edit";
    }
    
    
    @RequestMapping(value = "/serviceEdit", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> serviceEdit(@RequestBody ServiceRole role,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(role));
    	return null;
    }
    
    @RequestMapping(value = "/servOptIndexPage", method = RequestMethod.GET)
    public String  servOptIndexPage(Model model,HttpSession session){
    	return "service/service_opt_index";
    }
    
}

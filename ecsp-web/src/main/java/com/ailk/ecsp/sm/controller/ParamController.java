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
import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.sm.bmo.ParamBmo;
import com.ailk.ecsp.sm.common.ResultMap;
import com.ailk.ecsp.util.MapUtil;


@Controller
@RequestMapping("/param/*")
public class ParamController {
	@Autowired
	private ParamBmo paramBmo;
	private static Logger log = LoggerFactory.getLogger(ParamController.class);
	
    @RequestMapping(value = "/paramIndexPage", method = RequestMethod.GET)
    public String paramPage(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	return "basecfg/param_index";
    }
    
    @RequestMapping(value = "/paramQuery", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> paramQuery(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	int pagesize = MapUtil.asInt(param, "pagesize", 10);
    	int page = MapUtil.asInt(param, "page", 1);
    	Map map = paramBmo.queryParam(page, pagesize);
    	return map;
    }
    
    @RequestMapping(value = "/paramAddPage", method = RequestMethod.GET)
    public String paramAddPage(HttpSession session){
    	return "basecfg/param_add";
    }
    
    @RequestMapping(value = "/paramAdd", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> paramAdd(@RequestBody SysParam param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	ResultMap result = paramBmo.insertSysParam(param);
    	return result;
    }
    
    @RequestMapping(value = "/paramDel", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> paramDel(@RequestBody Long paramId,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(paramId));
    	ResultMap result = paramBmo.deleteSysParam(paramId);
    	return result;
    }
    
    @RequestMapping(value = "/paramEditPage", method = RequestMethod.GET)
    public String paramEditPage(HttpSession session){
    	return "basecfg/param_edit";
    }
    
    
    @RequestMapping(value = "/paramEdit", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> paramEdit(@RequestBody SysParam param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	try {
			Thread.sleep(5000);
		} catch (InterruptedException e) {
			log.error("",e);
		}
    	ResultMap result = paramBmo.updateSysParam(param);
    	return result;
    }
    
}

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
import com.ailk.ecsp.mybatis.model.Pack;
import com.ailk.ecsp.mybatis.model.Portal;
import com.ailk.ecsp.mybatis.model.SysParam;
import com.ailk.ecsp.sm.bmo.PackBmo;
import com.ailk.ecsp.sm.bmo.ParamBmo;
import com.ailk.ecsp.sm.bmo.PortalBmo;
import com.ailk.ecsp.sm.common.ResultMap;
import com.ailk.ecsp.util.MapUtil;


@Controller
@RequestMapping("/pack/*")
public class PackController {
	@Autowired
	private PackBmo packBmo;
	private static Logger log = LoggerFactory.getLogger(PackController.class);
	
    @RequestMapping(value = "/packIndexPage", method = RequestMethod.GET)
    public String packIndexPage(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	return "service/pack_index";
    }
    
    @RequestMapping(value = "/packQuery", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> packQuery(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	int pagesize = MapUtil.asInt(param, "pagesize", 10);
    	int page = MapUtil.asInt(param, "page", 1);
    	Map map = packBmo.queryPack(page, pagesize);
    	return map;
    }
    
    @RequestMapping(value = "/packAddPage", method = RequestMethod.GET)
    public String packAddPage(HttpSession session){
    	return "service/pack_add";
    }
    
    @RequestMapping(value = "/packAdd", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> packAdd(@RequestBody Pack param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	ResultMap result = packBmo.insertPack(param);
    	return result;
    }
    
    @RequestMapping(value = "/packDel", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> packDel(@RequestBody Long packId,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(packId));
    	ResultMap result = packBmo.deletePack(packId);
    	return result;
    }
    
    @RequestMapping(value = "/packEditPage", method = RequestMethod.GET)
    public String packEditPage(HttpSession session){
    	return "service/pack_edit";
    }
    
    
    @RequestMapping(value = "/packEdit", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> packEdit(@RequestBody Pack param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	ResultMap result = packBmo.updatePack(param);
    	return result;
    }
    
    @RequestMapping(value = "/packRestartPage", method = RequestMethod.GET)
    public String packRestartPage(HttpSession session){
    	return "service/pack_restart";
    }
    
    @RequestMapping(value = "/packRestart", method = RequestMethod.POST)
    public @ResponseBody Map<String, Object> packRestart(@RequestBody String param,HttpSession session){
    	log.debug("#param:"+JsonUtil.toString(param));
    	ResultMap result = packBmo.restartPackService(param);
    	return result;
    }
    
}

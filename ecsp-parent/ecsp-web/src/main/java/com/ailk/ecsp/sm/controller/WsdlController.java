package com.ailk.ecsp.sm.controller;

import java.io.StringReader;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpSession;
import javax.xml.parsers.DocumentBuilderFactory;

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
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import com.ailk.ecsp.intf.webservice.WSClient;
import com.ailk.ecsp.sm.common.ResultMap;
import com.ailk.ecsp.util.SoapUtil;
import com.ailk.ecsp.util.XmlUtil;
import com.al.ecs.common.util.JsonUtil;



@Controller
@RequestMapping("/wsdl/*")
public class WsdlController {

	
	private static Logger log = LoggerFactory.getLogger(WsdlController.class);
	
    @RequestMapping(value = "/wsdlIndexPage", method = RequestMethod.GET)
    public String intfIndexPage(HttpSession session){
    	return "service/wsdl_index";
    }
    
    @RequestMapping(value = "/wsdlQuery", method = RequestMethod.POST)
    public @ResponseBody ResultMap wsdlQuery(@RequestBody Map<String, String> param, Model model,HttpSession session){
    	log.debug("---param:{}",param);
    	ResultMap resultMap = new ResultMap();
    	List list = WSClient.getInstance().getWsdlOperationNameList(param.get("url"));
    	resultMap.put("list", list);
    	resultMap.setSuccess("OK");
    	log.debug("---resultMap:{}",JsonUtil.toString(resultMap));
    	return resultMap;
    }
    
    @RequestMapping(value = "/optReqContent", method = RequestMethod.POST)
    public @ResponseBody ResultMap operationReqContent(@RequestBody Map<String, String> param,HttpSession session){
    	log.debug("---param:{}",param);
    	ResultMap resultMap = new ResultMap();
    	String url = param.get("url");
    	String name = param.get("name");
    	String xml = WSClient.getInstance().getOperationRequestContent(url, name);
    	//model.addAttribute("xml", xml);
    	resultMap.put("xml", xml);
    	try{
			Map map = SoapUtil.xmlToMap(xml);				
			resultMap.put("json", JsonUtil.toString(map));
		}catch (Exception e) {
			log.error("",e);
		}
    	resultMap.setSuccess();
    	log.debug(JsonUtil.toString(resultMap));
    	return resultMap;
    	//return "service/wsdl_req_content";
    }
    
}

package com.ailk.ecsp.sm.controller;

import java.util.Map;
import javax.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/*")
public class MainController {
	
    @RequestMapping(value = "/index", method = RequestMethod.GET)
    public String index(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	return "default";
    }
}

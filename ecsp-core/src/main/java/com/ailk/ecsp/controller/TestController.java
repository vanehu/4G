package com.ailk.ecsp.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.ailk.ecsp.util.Toolkit;


@Controller("com.ailk.ecsp.TestController")
@RequestMapping("/test/*")
public class TestController {
    @RequestMapping(value = "/testMethod", method = RequestMethod.GET)
    public @ResponseBody String testMethod(@RequestParam Map<String, Object> param, Model model,HttpSession session){
//        Toolkit.printMsg("####################testMethod");
    	return "good";
    }
}

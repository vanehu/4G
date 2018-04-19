package com.ailk.ecsp.sm.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.core.RouterStrategy;


@Controller
@RequestMapping("/*")
public class MainController {
	
	private static final String urlParamSep = ",";
	private static final String[] legalDbTypes = {"w", "write", "r", "read"};
	private static String legalDbTypesDesc = "";
	static{
		for(String s : legalDbTypes){
			legalDbTypesDesc += s + "/";
		}
		legalDbTypesDesc = legalDbTypesDesc.substring(0, legalDbTypesDesc.length() - 1);
	}
	
    @RequestMapping(value = "/index", method = RequestMethod.GET)
    public String index(@RequestParam Map<String, Object> param, Model model,HttpSession session){
    	return "default";
    }
    
    /**
     * 切换省份正在使用的数据源
     * @param request
     * @param model
     * @return
     */
    @RequestMapping(value = "/switchDB", method = RequestMethod.GET)
    @ResponseBody
    public String switchDB(HttpServletRequest request, Model model, HttpServletResponse response){
    	//根据入参province、dbtype更新datasource-config.properties文件，并重新加载到缓存中
    	JSONObject json = new JSONObject();
    	response.setCharacterEncoding("UTF-8");
        try {
        	Map<String, String> keyMap = new HashMap<String, String>();
        	String provinceStr = request.getParameter("province");
        	String dbtype = request.getParameter("dbtype");
        	if(StringUtils.isBlank(provinceStr) || StringUtils.isBlank(dbtype)){
        		throw new IllegalArgumentException("Illegal argument, please check province and dbtype in url params.");
        	}
        	dbtype = formatDbType(dbtype);
        	if(dbtype == null){
        		throw new IllegalArgumentException("Illegal argument, unknow dbtype, please use " + legalDbTypesDesc + ".");
        	}
        	String[] provinces = provinceStr.split(urlParamSep);
        	for(String province : provinces){
        		province = province.toLowerCase().trim(); 
        		keyMap.put(RouterStrategy.toRouterStrategyKey(province, RouterStrategy.CURRENT_CONST), RouterStrategy.toRouterStrategyKey(province, dbtype));
        	}
        	DataSourceRouter.updateRouterStrategyKey(keyMap);
            json.put("resultCode", "0");
            json.put("resultMsg", "success");
        } catch (Exception e) {
        	e.printStackTrace();
            json.put("resultCode", "1");
            json.put("resultMsg", e.getMessage());
        }
        return json.toString();
    }
    
    /**
     * 刷新数据源配置缓存并获取目前正在使用的各省数据源名称
     * @param request
     * @param model
     * @return
     */
    @RequestMapping(value = "/refreshAndGetCurrentDB", method = RequestMethod.GET)
    @ResponseBody
    public String refreshAndGetCurrentDB(HttpServletRequest request, Model model, HttpServletResponse response){
    	//重新加载datasource-config.properties，并返回该配置文件中各省份正在使用的数据源名称
    	JSONObject json = new JSONObject();
    	response.setCharacterEncoding("UTF-8");
        try {
        	DataSourceRouter.clearCache();
        	//获取当前正在使用的数据源名称
        	Map<String, String> keyMap = DataSourceRouter.getRouterStrategyKeyMap();
            json.put("resultCode", "0");
            json.put("resultMsg", keyMap);
        } catch (Exception e) {
        	e.printStackTrace();
            json.put("resultCode", "1");
            json.put("resultMsg", e.getMessage());
        }
        return json.toString();
    }
    
    private String formatDbType(String dbtype){
    	if(dbtype == null){
    		return null;
    	}
    	dbtype = dbtype.toLowerCase().trim();
    	if(legalDbTypes[0].equals(dbtype) || legalDbTypes[1].equals(dbtype)){
    		return legalDbTypes[1];
    	}
    	if(legalDbTypes[2].equals(dbtype) || legalDbTypes[3].equals(dbtype)){
    		return legalDbTypes[3];
    	}
    	return null;
    }
    
}

package com.al.lte.portal.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import com.al.lte.portal.common.Config;

/**
 * app容灾，当开关开启时返回备用域名
 * 
 * @author yanghm
 * 
 */
public class DataGuardServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private final String[] switchs = { "beijing", "tianjing", "shxi", "neimenggu", "liaoning", "jilin",
			"fujian", "hunan", "chongqing", "guizhou", "yunnan", "xizang", "qinghai", "ningxia", "xinjiang", "guangdong", "jiangsu",
			"sichuang", "zhejiang", "anhui", "shanxi", "hubei", "shanghai", "hebei", "shandong", "guangxi", "henan", "gansu",
			"jiangxi", "hainan", "heilongjiang" };// 各省份容灾开关

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try {
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			List<Map<String, Object>> areaList = new ArrayList<Map<String, Object>>();
			for (String s : switchs) {
				Map<String, Object> urlMap = new HashMap<String, Object>();
				boolean flag = querySwitch("DATAGUARD-" + s);
				if (!flag)
					continue;
				String urlKey = "DATAGUARD-" + s + "-url";
				String url = getUrl(urlKey);
				urlMap.put("area", s);
				urlMap.put("url", url);
				areaList.add(urlMap);
			}
			JSONArray area = JSONArray.fromObject(areaList);
			returnMap.put("data", area);
			returnMap.put("code", "0");
			returnMap.put("successed", "1");
		} catch (Exception e) {
			returnMap.put("code", "1");
			returnMap.put("successed", "2");
			returnMap.put("data", "");
		}
		JSONObject jsonObj = JSONObject.fromObject(returnMap);
		resp.setContentType("application/json");
		try {
			PrintWriter out = resp.getWriter();
			out = resp.getWriter();
			out.print(jsonObj);
			out.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}

	private boolean querySwitch(String s) {
		String dg_switch = null;
		dg_switch = Config.getProperties().getProperty(s);
		if ("ON".equals(dg_switch)) {
			return true;
		}
		return false;
	}

	private String getUrl(String urlKey) {
		String dg_url = "";
		dg_url = Config.getProperties().getProperty(urlKey);
		return dg_url;
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		doGet(req, resp);
	}
}

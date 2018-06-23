package com.al.lte.portal.servlet;

import com.al.lte.portal.common.Config;
import net.sf.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by liuteng on 2016/8/24.
 */
public class VersionServlet extends HttpServlet {
    /**
     * 获取浏览器各种类型对应的设置信息
     * @param req 请求
     * @param resp 响应
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String browserVersion = req.getParameter("browserVersion");
        Map<String, Object> rMap = new HashMap<String, Object>();
        try {
            String recBroStr = Config.getProperties().getProperty("RECOMMEND_BROWSERS");
            String warnBroStr = Config.getProperties().getProperty("WARNING_BROWSERS");
            String forbBroStr = Config.getProperties().getProperty("FORBIDDEN_BROWSERS");
            String[] recBroArr = recBroStr.split(",");
            String[] warnBroArr = warnBroStr.split(",");
            String[] forbBroArr = forbBroStr.split(",");
            rMap.put("recBroStr", recBroStr);
            rMap.put("level", "1");
            browserVersion = browserVersion.replace(".0", "");
            for (String forbBro : forbBroArr) {
                forbBro = forbBro.replace(".0", "");
                if (forbBro.equals(browserVersion)) {
                    rMap.put("level", "3");
                }
            }
            for (String warnBro : warnBroArr) {
                warnBro = warnBro.replace(".0", "");
                if (warnBro.equals(browserVersion)) {
                    rMap.put("level", "2");
                }
            }
            for (String recBro : recBroArr) {
                recBro = recBro.replace(".0", "");
                if (recBro.equals(browserVersion)) {
                    rMap.put("level", "1");
                }
            }
        } catch (Exception e) {
            if (!rMap.containsKey("recBroStr")) {
                rMap.put("recBroStr", "");
            }
        }
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json; charset=utf-8");
        JSONObject jsonObj = JSONObject.fromObject(rMap);
        try {
            PrintWriter out = resp.getWriter();
            out.print(jsonObj.toString());
            out.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

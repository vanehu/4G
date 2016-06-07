package com.al.lte.portal.servlet;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.al.lte.portal.common.Config;

/**
 * **微信公众号请求转发过滤器
 *
 * @author liuteng
 * @version V1.0 2016-6-7
 * @createDate 2016-6-7 11:51:49
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
public class PubPortalServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        doGet(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        resp.setContentType("text/html;charset=utf-8");  //设置响应页面字符编码
        String url = "";
        String province = req.getParameter("prov");
        if (province != null) {
            String Port = Config.getProvVersion("PUB-"+province);
            String domain = Config.getIpconfig(req, province);
            String httpconfig = "";
            if ("81".equals(Port) || "82".equals(Port)) {
                httpconfig = "http";
            } else if ("83".equals(Port) || "84".equals(Port)) {
                httpconfig = "https";
            } else if ("93".equals(Port) || "94".equals(Port)) {
                httpconfig = "https";
            }
            String uri = req.getRequestURI().replace("/ltePortal", "");
            url = httpconfig + "://" + domain + ":" + Port + uri;
            if (req.getQueryString() != null && !("".equals(req.getQueryString()))) {
                url += "?" + req.getQueryString();
            }
        } else {
            url = "http://crm.189.cn/ltePortal/";
        }
        try {
            resp.sendRedirect(url);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

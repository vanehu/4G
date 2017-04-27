package com.al.lte.portal.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;

import com.al.ecs.common.web.ServletUtils;

/**
 * 会话管理
 * 提供：
 *   主动终止会话
 * @version V1.0 
 *          2015-10-15
 * @author liusd
 */
public class SessionCtrlUtil {
    //被终止的会话ID列表
    public static String SESSION_LIST_KEY = "sessionList";

    /**
     * 记录被终止的会话到全局队列
     * @param request
     * @param staffCode
     */
    @SuppressWarnings("unchecked")
    public static void putSession(HttpServletRequest request, String staffCode) {
        if (request == null) {
            return;
        }
        if (StringUtils.isBlank(staffCode)) {
            return;
        }
        HttpSession session = ServletUtils.getSession(request, true);
        String sessionId = (String) session.getServletContext().getAttribute(staffCode);
        List<Map<String, Object>> sessionList = (List<Map<String, Object>>) session.getServletContext().getAttribute(
                SESSION_LIST_KEY);
        Map<String, Object> sid = new HashMap<String, Object>();
        sid.put("staffCode", staffCode);
        sid.put("sessionId", sessionId);
        sid.put("createTime", System.currentTimeMillis());
        if (CollectionUtils.isEmpty(sessionList))
            sessionList = new ArrayList<Map<String, Object>>();
        sessionList.add(sid);
    }

    /**
     * 执行终止会话
     * @param request
     */
    @SuppressWarnings("unchecked")
    public static void invalidateSession(HttpServletRequest request) {
        HttpSession session = ServletUtils.getSession(request);
        List<Map<String, Object>> sessionList = (List<Map<String, Object>>) session.getServletContext().getAttribute(
                SESSION_LIST_KEY);
        if(CollectionUtils.isEmpty(sessionList))return;
        String sessionId = session.getId();
        for (Map<String, Object> sid : sessionList) {
            if (StringUtils.equalsIgnoreCase(sessionId, MapUtils.getString(sid, "sessionId"))) {
                //清除列表中的会话缓存 
                Iterator<Map<String, Object>> iter = sessionList.iterator();
                while (iter.hasNext()) {
                    Map<String, Object> s = iter.next();
                    if (StringUtils.equalsIgnoreCase(sessionId, MapUtils.getString(s, "sessionId"))) {
                        iter.remove();
                    }
                }
                //会话失效 
                session.invalidate();
                return;
            }
        }

    }

    /**
     * 处理后端终止会话后，前端用户没有进行二次点击的情况,
     * 当超过应用会话时长时，自动清除,允许用户再次登陆而不被终止会话
     * @param request
     */
    @SuppressWarnings("unchecked")
    public static void clearTimeOut(HttpServletRequest request) {
        //清除终止会话后，没有二次登陆的缓存会话信息
        HttpSession session = ServletUtils.getSession(request);
        List<Map<String, Object>> sessionList = (List<Map<String, Object>>) session.getServletContext().getAttribute(
                SESSION_LIST_KEY);
        if (CollectionUtils.isEmpty(sessionList))
            return;
        Iterator<Map<String, Object>> iter = sessionList.iterator();
        while (iter.hasNext()) {
            Map<String, Object> s = iter.next();
            long createTime = MapUtils.getLongValue(s, "createTime");
            long now = System.currentTimeMillis();
            long len = now - createTime;
            //如果会话被强行终止之后，用户没有再点击时，全局缓存中的会话信息将根据会话时间进行清除
            if (len > 1000 * 60 * 60 * 2) {
                iter.remove();
            }
        }
    }
}

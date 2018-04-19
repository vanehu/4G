package com.al.lte.portal.filter;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;

import com.al.lte.portal.common.SessionCtrlUtil;

/**
 * 会话控制过滤器
 * 处理非用户操作时，报端管理人员动态终止用户会话
 * 
 * @author liusd
 * @createDate 2015-20-26
 * @version 1.0
 * 
 */
public class SessionCtrlFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        SessionCtrlUtil.clearTimeOut(request);
        SessionCtrlUtil.invalidateSession(request);
        filterChain.doFilter(request, response);
    }

}

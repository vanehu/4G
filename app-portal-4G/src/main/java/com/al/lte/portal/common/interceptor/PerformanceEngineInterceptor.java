package com.al.lte.portal.common.interceptor;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.al.ecs.log.Log;
import com.al.lte.portal.common.PerformanceEngine;

/**
 * 过频操作拦截器，通过扫描用户请求的方法，过虑有设置注解的方法
 * 
 * @author liusd
 * @version V1.0 2015-09-15
 * @createDate 2015-09-15 下午2:23:29
 * @copyRight 亚信电信EC研发部
 */

public class PerformanceEngineInterceptor extends HandlerInterceptorAdapter {

    protected Log log = Log.getLog(PerformanceEngineInterceptor.class);
    @Resource(name = "PE")
    private PerformanceEngine performanceEngine;
    

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws ServletException {
        if (handler instanceof HandlerMethod) {
            this.performanceEngine.process(request);
        }
        return true;
    }

    /**
     * This implementation is empty.
     */
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            ModelAndView modelAndView) throws Exception {

    }
}

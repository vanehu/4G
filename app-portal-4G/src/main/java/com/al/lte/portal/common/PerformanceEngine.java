package com.al.lte.portal.common;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.log.Log;
import com.al.lte.portal.model.SessionStaff;
/**
 * 过频操作控制引擎  ，操作队列存储于会话中，必须加上会话登陆次数限制，不然用户重新登陆后会话内容会重置了，
 * 达不到控制的效果，
 *  超过限制一次，警告并退出会话，
 *  第二次锁定工号，会退出会话  
 * 
 *
 * @version V1.0 
 *          2015-9-17
 * @author liusd
 */
@Component("PE")
public class PerformanceEngine {
    private static final Log log = Log.getLog(PerformanceEngine.class);
    /** 默认队列长度 */
    private final int DEF_L = 10;
    /** 默认时间间隔 */
    private final long DEF_N = 1000 * 30;
    /** 默认时间间隔内次数阀值 */
    private final int DEF_F = 3;
    /** 操作队列 */
    private Queue<Long> queue;
    /** 队列长度  L */
    private int L;
    /** 时间间隔N 毫秒*/
    private long N;
    /** 时间间隔内次数T  */
    private int T = 0;
    /**时间间隔内次数阀值：F*/
    private int F;
    /**警告标识：W*/
    private int W;
    /** web请求作用域 */
    private HttpServletRequest request;
    /** 每个用户自己的唯一标识*/
    private String user;
    /** 每个用户操作的模块标识*/
    private String model;

    private static UrlPathHelper urlPathHelper = new UrlPathHelper();

    public PerformanceEngine() {

    }

    /** 判断结果存储键*/
    private String getCheckResultKey() {
        return this.user + this.model;
    }

    /** 操作信息队列 存储键*/
    private String getQueueKey() {
        return this.user + "_queue_" + this.model;
    }

    /** 操作警告 存储键*/
    private String getWarningKey() {
        return this.user + "_warning_" + this.model;
    }

    /**
     * 取application中队列信息
     * request 会话
     * model为存储某个模块操作队列的key
     * @return
     */
    @SuppressWarnings("unchecked")
    public void process(HttpServletRequest request) {
        //取路由，如果参数放数据库的话
        int flag = -1;
        this.request = request;
        
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(this.request,
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        this.user = sessionStaff.getStaffId();
        this.model = urlPathHelper.getOriginatingRequestUri(request).substring(this.request.getContextPath().length());

        String s = (String) ServletUtils.getSessionAttribute(this.request, SysConstant.SESSION_DATASOURCE_KEY);

        String p = "";
        try {
            p = MySimulateData.getInstance().getParam(s, "REQUEST_QUEUE_LENGTH");
            if (StringUtils.isBlank(p)) {
                this.L = this.DEF_L;
            } else {
                this.L = Integer.parseInt(p);
            }
        } catch (Exception e) {
            this.L = this.DEF_L;
            log.error("Get properties[REQUEST_QUEUE_LENGTH] error:{}",e);
        }
        try {
            p = MySimulateData.getInstance().getParam(s, "REQUEST_INTERVAL");
            if (StringUtils.isBlank(p)) {
                this.N = this.DEF_N;
            } else {
                this.N = Long.parseLong(p);
            }
        } catch (Exception e) {
            this.N = this.DEF_N;
            log.error(" Get properties[REQUEST_INTERVAL] error:{}",e);
        }
        try {
            p = MySimulateData.getInstance().getParam(s, "REQUEST_INTERVAL_THRESHOLD");
            if (StringUtils.isBlank(p)) {
                this.F = this.DEF_F;
            } else {
                this.F = Integer.parseInt(p);
            }
        } catch (Exception e) {
            this.F = this.DEF_F;
            log.error(" Get properties[REQUEST_INTERVAL_THRESHOLD] error:{}",e);
        }
        this.queue = (Queue<Long>) ServletUtils.getSessionAttribute(this.request, this.getQueueKey());
        Object obj = this.request.getSession().getServletContext().getAttribute(this.getWarningKey());
        if (obj != null && obj instanceof Integer)
            this.W = (Integer) obj;
        else
            this.W = 0;

        if (this.queue == null) {
            this.queue = new ConcurrentLinkedQueue<Long>();
        }
        log.debug("Process: W={},T={},F={}", this.W,this.T,this.F);
        //验证操作
        flag = this.check();
        this.request.setAttribute(this.getCheckResultKey(), flag);
    }

    /**
     * 加入队列
     * @param s
     * @throws Exception
     */
    private void put(long s) throws Exception {
        if (this.queue.size() >= this.L) {
            this.remove();
        }
        this.queue.offer(s);
        ServletUtils.setSessionAttribute(this.request, this.getQueueKey(), this.queue);
    }

    /**
     * 移除队列
     * @throws Exception
     */
    private void remove() throws Exception {
        if (!this.queue.isEmpty())
            this.queue.poll();
    }

    /**
     * 过频操作判断 0警告1允许2锁定-1比对失败
     * @return
     * @throws Exception
     */
    private int check() {
        //比对失败 
        int flag = -1;
        try {
            //警告后，再操作锁定与会话失效
            if (this.W == 1) {
                //锁定后释放此用户在当前模块的警告标识，以便下次再统计
                this.request.getSession().getServletContext().removeAttribute(this.getWarningKey());
                flag = 2;
            }
            //加入统计数据
            this.count();
            //警告 会话失效
            if (this.T >= this.F + 1) {
                //存储警告数据到全局中
                this.request.getSession().getServletContext().setAttribute(this.getWarningKey(), 1);
                flag = 0;
            }
            //允许操作
            if (this.T <= this.F) {
                flag = 1;
            }
            log.debug("Check: W={},T={},F={}", this.W,this.T,this.F);
        } catch (Exception e) {
            flag = -1;
            log.error(" Check PE error:{}",e);
        }
        return flag;
    }

    /**
     * 统计操作次数
     * @return
     * @throws Exception
     */
    private void count() throws Exception {
        long now = System.currentTimeMillis();
        this.put(now);
        this.T = 0;
        for (long e : this.queue) {
            if (now - e <= this.N) {
                this.T++;
            }
        }
    }

    /**
     * 提取过频操作判断结果
     * 0:警告1:允许2:锁定 -1:比对失败
     * @param request
     * @return
     */
    public static String getPECheck(HttpServletRequest request) {
        String model = urlPathHelper.getOriginatingRequestUri(request).substring(request.getContextPath().length());
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request,
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        if(sessionStaff == null || StringUtils.isBlank(sessionStaff.getStaffId())){
            log.error("GetPECheck error:session is invalid ");
            return "-1";
        }
        return sessionStaff.getStaffId() + model;
    }
}

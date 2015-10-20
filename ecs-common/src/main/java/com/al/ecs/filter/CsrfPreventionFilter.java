package com.al.ecs.filter;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.apache.oro.text.perl.Perl5Util;
import org.slf4j.MDC;
import org.springframework.web.filter.OncePerRequestFilter;

import com.al.ecs.common.util.PortalConstant;
import com.al.ecs.common.web.AjaxUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.log.Log;

/**
 * CSRF 过虑器. <BR>
 * token:参数名称<BR>
 * isClose:默认打开验证，false:关闭<BR>
 * entryPoints:需要保护资源路径，以逗号隔开
 * 与编码过虑器结合记录资源类型
 * <P>
 * 
 * @author tangzhengyu
 * @version V1.0 2011-12-22
 * @createDate 2011-12-22 下午11:31:00
 * @modifyDate liusd 2015-7-22<BR>
 * @copyRight 亚信电信EC研发部
 */
public class CsrfPreventionFilter extends OncePerRequestFilter {

    private static final Log LOG = Log.getLog(CsrfPreventionFilter.class);

    private static final String CSRF_NONCE_REQUEST_PARAM = "csrf_token";
    private static final String CSRF_NONCE_SESSION_ATTR_NAME = "PORTAL_CSRF_TOKEN_KEY";
    private static final int DEFAULT_CACHE_SIZE = 5;
    private String randomClass = SecureRandom.class.getName();

    private Random randomSource;

    private final Set<String> entryPoints = new HashSet<String>();
    /** 默认缓存大小 5. */
    private int nonceCacheSize = DEFAULT_CACHE_SIZE;
    /** 默认打开. */
    private boolean isClose = true;

    /** 默认要强制验证,客户端不能禁止cookie */
    private boolean cookieCheck = true;

    /** token name default csrf_token. */
    private String token = CSRF_NONCE_REQUEST_PARAM;
    /**全局域名*/
    private String domain = null;
    /**会话健 */
    private String sessionKey;

    private boolean checkReferer(HttpServletRequest request) {
        String headerReferer = request.getHeader("Referer");
        if (domain != null) {
            if (headerReferer == null || headerReferer.length() < 8) {
                return false;
            }
            String headDomain = headerReferer.substring(0, headerReferer.indexOf("/", headerReferer.indexOf(".")));
            Perl5Util matcher = new Perl5Util();
            if (matcher.match("/(http|https):\\/\\/" + domain + ".*$/i", headDomain)) {
                return true;
            }
            return false;
        }
        return true;
    }

    /**
     * 设置关闭csrf token.
     * 
     * @param isClose
     *            true:关闭
     */
    public void setIsClose(boolean isClose) {
        this.isClose = isClose;
    }

    /**
     * 设置token name,默认是csrf_token.
     * 
     * @param token
     *            token name
     */
    public void setToken(String token) {
        this.token = token;
    }

    /**
     * 设置cookie 是否需要验证
     * 
     * @param cookieCheck
     *            cookieCheck name
     */
    public void setCookieCheck(boolean cookieCheck) {
        this.cookieCheck = cookieCheck;
    }

    /**
     * Entry points are URLs that will not be tested for the presence of a valid
     * nonce. They are used to provide a way to navigate back to a protected
     * application after navigating away from it. Entry points will be limited
     * to HTTP GET requests and should not trigger any security sensitive
     * actions.
     * 
     * @param entryPoints
     *            Comma separated list of URLs to be configured as entry points.
     */
    public void setEntryPoints(String entryPoints) {
        String[] values = entryPoints.split(",");
        for (String value : values) {
            this.entryPoints.add(value.trim());
        }
    }

    /**
     * Sets the number of previously issued nonces that will be cached on a LRU
     * basis to support parallel requests, limited use of the refresh and back
     * in the browser and similar behaviors that may result in the submission of
     * a previous nonce rather than the current one. If not set, the default
     * value of 5 will be used.
     * 
     * @param nonceCacheSize
     *            The number of nonces to cache
     */
    public void setNonceCacheSize(int nonceCacheSize) {
        this.nonceCacheSize = nonceCacheSize;
    }

    /**
     * Specify the class to use to generate the nonces. Must be in instance of
     * {@link Random}.
     * 
     * @param randomClass
     *            The name of the class to use
     */
    public void setRandomClass(String randomClass) {
        this.randomClass = randomClass;
    }

    @Override
    public void initFilterBean() throws ServletException {
        // Set the parameters
        try {
            Class<?> clazz = Class.forName(randomClass);
            randomSource = (Random) clazz.newInstance();
        } catch (ClassNotFoundException e) {
            LOG.error("CSRF ", e);
            // ServletException se = new ServletException(sm.getString(
            // "csrfPrevention.invalidRandomClass", randomClass), e);
            // throw se;
        } catch (InstantiationException e) {
            // ServletException se = new ServletException(sm.getString(
            // "csrfPrevention.invalidRandomClass", randomClass), e);
            // throw se;
            LOG.error("CSRF ", e);
        } catch (IllegalAccessException e) {
            // ServletException se = new ServletException(sm.getString(
            // "csrfPrevention.invalidRandomClass", randomClass), e);
            // throw se;
            LOG.error("CSRF ", e);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request)
            throws ServletException {
        //与CharacterAndFileEncodingFilter结合
        String isRul = MDC.get(PortalConstant.MDC_IS_RESOURCE_URL);
        if (StringUtils.isNotBlank(isRul)) {
            return Boolean.parseBoolean(isRul);
        } else {
            return false;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain filterChain)
            throws ServletException, IOException {
        if (this.isClose) {
            //如果会话失效时，不进行csrf拦截,因为会话拦截器在过虑器之后执行
            //有配置会话控制才进行判断会话是否存在
            /*if (StringUtils.isNotBlank(this.sessionKey)) {
                Object obj = req.getSession(true).getAttribute(this.sessionKey);
                if (obj == null) {
                    //删除已存储令牌
                    req.getSession(true).removeAttribute(CSRF_NONCE_SESSION_ATTR_NAME);
                    filterChain.doFilter(req, res);
                    return;
                }
            }*/

            String path = req.getServletPath();
            if (req.getPathInfo() != null) {
                path = path + req.getPathInfo();
            }

            boolean skipNonceCheck = entryPoints.contains(path) ? false : true;
            if (skipNonceCheck) {
                Perl5Util matcher = new Perl5Util();
                for (String entryPoint : entryPoints) {
                    if (!entryPoint.endsWith("$")) {
                        entryPoint = entryPoint + "$";
                    }
                    if (!entryPoint.startsWith("^")) {
                        entryPoint = "^" + entryPoint;
                    }
                    if (matcher.match("/" + entryPoint + "/i", path)) {
                        skipNonceCheck = false;
                        LOG.debug("CSRF check path={}", path);
                        break;
                    }
                }
            }

            @SuppressWarnings("unchecked")
            LruCache<String> nonceCache = (LruCache<String>) req.getSession(true)
            .getAttribute(CSRF_NONCE_SESSION_ATTR_NAME);

            String previousNonce = null;
            if (!skipNonceCheck) {
                // ajax放在head里
                if (AjaxUtils.isAjaxRequest(req)) {
                    previousNonce = req.getHeader(token);
                    // 非ajax放在 input hidden里，或URL里
                } else {
                    previousNonce = req.getParameter(token);
                }
                LOG.debug("previousNonce={}", previousNonce);
                if (!checkReferer(req)) {
                    res.sendError(HttpServletResponse.SC_FORBIDDEN);
                    LOG.warn(" CSRF 访问! FORBIDDEN REFERER ");
                    return;
                }
                if (nonceCache == null || previousNonce == null
                        || (nonceCache != null && !nonceCache.contains(previousNonce))) {
                    res.sendError(HttpServletResponse.SC_FORBIDDEN);
                    LOG.warn(" CSRF 访问! FORBIDDEN ");
                    return;
                }
            }
            if (nonceCache == null) {
                nonceCache = new LruCache<String>(nonceCacheSize);
                String newNonce = generateNonce();
                nonceCache.add(newNonce);
                nonceCache.add(generateNonce());
                HttpSession session = req.getSession(true);
                session.setAttribute(CSRF_NONCE_SESSION_ATTR_NAME, nonceCache);
            } else if (cookieCheck) {
                String tokenCookie = ServletUtils.getCookieValue(req, token);
                if ((!skipNonceCheck && (tokenCookie == null || nonceCache.contains(tokenCookie)))
                        && previousNonce.equals(tokenCookie)) {
                    res.sendError(HttpServletResponse.SC_FORBIDDEN);
                    LOG.warn(" CSRF 访问! FORBIDDEN COOKIE VALUE NOT RIGHT ");
                    return;
                }

                // 针对post方法，都需要增加cookie值
                if (tokenCookie != null && req.getMethod().equalsIgnoreCase("POST")) {
                    String newNonce = generateNonce();
                    nonceCache.remove(tokenCookie);
                    nonceCache.add(newNonce);
                    HttpSession session = req.getSession(false);
                    session.setAttribute(CSRF_NONCE_SESSION_ATTR_NAME, nonceCache);
                }
            }

            Iterator<String> it = nonceCache.cache.keySet().iterator();
            if (it != null && it.hasNext()) {
                req.setAttribute(token, it.next());
                if (cookieCheck) {
                    ServletUtils.addCookieHttpOnly(res, req.getContextPath(), -1, token, it.next());
                }
            }
        }
        filterChain.doFilter(req, res);
    }

    /**
     * Generate a once time token (nonce) for authenticating subsequent
     * requests. This will also add the token to the session. The nonce
     * generation is a simplified version of ManagerBase.generateSessionId().
     * 
     */
    protected String generateNonce() {
        byte random[] = new byte[8];

        // Render the result as a String of hexadecimal digits
        StringBuilder buffer = new StringBuilder();

        randomSource.nextBytes(random);

        for (int j = 0; j < random.length; j++) {
            byte b1 = (byte) ((random[j] & 0xf0) >> 4);
            byte b2 = (byte) (random[j] & 0x0f);
            if (b1 < 10) {
                buffer.append((char) ('0' + b1));
            } else {
                buffer.append((char) ('A' + (b1 - 10)));
            }
            if (b2 < 10) {
                buffer.append((char) ('0' + b2));
            } else {
                buffer.append((char) ('A' + (b2 - 10)));
            }
        }

        return buffer.toString();
    }

    private static class LruCache<T> {

        // Although the internal implementation uses a Map, this cache
        // implementation is only concerned with the keys.
        private final Map<T, T> cache;

        public LruCache(final int cacheSize) {
            cache = new LinkedHashMap<T, T>() {
                private static final long serialVersionUID = 1L;

                @Override
                protected boolean removeEldestEntry(Map.Entry<T, T> eldest) {
                    if (size() > cacheSize) {
                        return true;
                    }
                    return false;
                }
            };
        }

        public void add(T key) {
            cache.put(key, null);
        }

        public void remove(T key) {
            cache.remove(key);
        }

        public boolean contains(T key) {
            return cache.containsKey(key);
        }
    }

    /**
     * @param domain the domain to set
     */
    public void setDomain(String domain) {
        this.domain = domain;
    }

    /**
     * @param sessionKey the sessionKey to set
     */
    public void setSessionKey(String sessionKey) {
        this.sessionKey = sessionKey;
    }

}

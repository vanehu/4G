package com.al.ecs.filter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.StringTokenizer;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;

import com.al.ecs.log.Log;

/**
 * 指定文件类型设置客户端缓存时间 .
 * <BR>
 * <pre>
 * <filter>
 *	 <filter-name>ExpiresFilter</filter-name>
 *	 <filter-class>com.al.ecs.filter.ExpiresFilter</filter-class>
 *	 <init-param>
 *	    <param-name>ExpiresByType image</param-name>
 *	    <param-value>access plus 10 minutes</param-value>
 *	 </init-param>
 *	 <init-param>
 *	    <param-name>ExpiresByType text/css</param-name>
 *	    <param-value>access plus 10 minutes</param-value>
 *	 </init-param>
 *	 <init-param>
 *	    <param-name>ExpiresByType application/javascript</param-name>
 *	    <param-value>access plus 10 minutes</param-value>
 *	 </init-param>
 *	 	 <init-param>
 *	    <param-name>ExpiresByType text/javascript</param-name>
 *	    <param-value>access plus 10 minutes</param-value>
 *	 </init-param>
 *	<filter-mapping>
 *	 <filter-name>ExpiresFilter</filter-name>
 *	 <url-pattern>/*</url-pattern>
 *	 <dispatcher>REQUEST</dispatcher>
 *	</filter-mapping>
 *	</filter>
 * </pre>
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-5-10
 * @createDate 2012-5-10 下午7:50:04
 * @modifyDate tang zheng yu 2012-5-10 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class ExpiresFilter implements Filter {
	private XmlConfigLoader loader;

	public XmlConfigLoader getLoader() {
		return loader;
	}
	private PathMatcher pathMatcher= new AntPathMatcher();
	 /**
     * Duration composed of an {@link #amount} and a {@link #unit}
     */
    protected static class Duration {

        public static Duration minutes(int amount) {
            return new Duration(amount, DurationUnit.MINUTE);
        }

        public static Duration seconds(int amount) {
            return new Duration(amount, DurationUnit.SECOND);
        }

        protected final int amount;

        protected final DurationUnit unit;

        public Duration(int amount, DurationUnit unit) {
            super();
            this.amount = amount;
            this.unit = unit;
        }

        public int getAmount() {
            return amount;
        }

        public DurationUnit getUnit() {
            return unit;
        }

        @Override
        public String toString() {
            return amount + " " + unit;
        }
    }

    /**
     * Duration unit
     */
    protected enum DurationUnit {
        DAY(Calendar.DAY_OF_YEAR), HOUR(Calendar.HOUR), MINUTE(Calendar.MINUTE), MONTH(
                Calendar.MONTH), SECOND(Calendar.SECOND), WEEK(
                Calendar.WEEK_OF_YEAR), YEAR(Calendar.YEAR);
        private final int calendardField;

        private DurationUnit(int calendardField) {
            this.calendardField = calendardField;
        }

        public int getCalendardField() {
            return calendardField;
        }

    }

    /**
     * <p>
     * Main piece of configuration of the filter.
     * </p>
     * <p>
     * Can be expressed like '<tt>access plus 1 month 15   days 2 hours</tt>'.
     * </p>
     */
    protected static class ExpiresConfiguration {
        /**
         * List of duration elements.
         */
        private List<Duration> durations;

        /**
         * Starting point of the elaspse to set in the response.
         */
        private StartingPoint startingPoint;

        public ExpiresConfiguration(StartingPoint startingPoint,
                Duration... durations) {
            this(startingPoint, Arrays.asList(durations));
        }

        public ExpiresConfiguration(StartingPoint startingPoint,
                List<Duration> durations) {
            super();
            this.startingPoint = startingPoint;
            this.durations = durations;
        }

        public List<Duration> getDurations() {
            return durations;
        }

        public StartingPoint getStartingPoint() {
            return startingPoint;
        }

        @Override
        public String toString() {
            return "ExpiresConfiguration[startingPoint=" + startingPoint +
                    ", duration=" + durations + "]";
        }
    }

    /**
     * Expiration configuration starting point. Either the time the
     * html-page/servlet-response was served ({@link StartingPoint#ACCESS_TIME})
     * or the last time the html-page/servlet-response was modified (
     * {@link StartingPoint#LAST_MODIFICATION_TIME}).
     */
    protected enum StartingPoint {
        ACCESS_TIME, LAST_MODIFICATION_TIME
    }

    /**
     * <p>
     * Wrapping extension of the {@link HttpServletResponse} to yrap the
     * "Start Write Response Body" event.
     * </p>
     * <p>
     * For performance optimization : this extended response holds the
     * {@link #lastModifiedHeader} and {@link #cacheControlHeader} values access
     * to the slow {@link #getHeader(String)} and to spare the <tt>string</tt>
     * to <tt>date</tt> to <tt>long</tt> conversion.
     * </p>
     */
    public class XHttpServletResponse extends HttpServletResponseWrapper {

        /**
         * Value of the <tt>Cache-Control/tt> http response header if it has
         * been set.
         */
        private String cacheControlHeader;

        /**
         * Value of the <tt>Last-Modified</tt> http response header if it has
         * been set.
         */
        private long lastModifiedHeader;

        private boolean lastModifiedHeaderSet;

        private PrintWriter printWriter;

        private HttpServletRequest request;

        private ServletOutputStream servletOutputStream;

        private int httpStatus;
        /**
         * Indicates whether calls to write methods (<tt>write(...)</tt>,
         * <tt>print(...)</tt>, etc) of the response body have been called or
         * not.
         */
        private boolean writeResponseBodyStarted;

        public XHttpServletResponse(HttpServletRequest request,
                HttpServletResponse response) {
            super(response);
            this.request = request;
        }

        @Override
        public void addDateHeader(String name, long date) {
            super.addDateHeader(name, date);
            if (!lastModifiedHeaderSet) {
                this.lastModifiedHeader = date;
                this.lastModifiedHeaderSet = true;
            }
        }

        @Override
        public void addHeader(String name, String value) {
            super.addHeader(name, value);
            if (HEADER_CACHE_CONTROL.equalsIgnoreCase(name) &&
                    cacheControlHeader == null) {
                cacheControlHeader = value;
            }
        }

        public String getCacheControlHeader() {
            return cacheControlHeader;
        }

        public long getLastModifiedHeader() {
            return lastModifiedHeader;
        }

        @Override
        public ServletOutputStream getOutputStream() throws IOException {
            if (servletOutputStream == null) {
                servletOutputStream = new XServletOutputStream(
                        super.getOutputStream(), request, this);
            }
            return servletOutputStream;
        }

        @Override
        public PrintWriter getWriter() throws IOException {
            if (printWriter == null) {
                printWriter = new XPrintWriter(super.getWriter(), request, this);
            }
            return printWriter;
        }

        public boolean isLastModifiedHeaderSet() {
            return lastModifiedHeaderSet;
        }

        public boolean isWriteResponseBodyStarted() {
            return writeResponseBodyStarted;
        }

        @Override
        public void reset() {
            super.reset();
            this.lastModifiedHeader = 0;
            this.lastModifiedHeaderSet = false;
            this.cacheControlHeader = null;
        }

        @Override
        public void setDateHeader(String name, long date) {
            super.setDateHeader(name, date);
            if (HEADER_LAST_MODIFIED.equalsIgnoreCase(name)) {
                this.lastModifiedHeader = date;
                this.lastModifiedHeaderSet = true;
            }
        }

        @Override
        public void setHeader(String name, String value) {
            super.setHeader(name, value);
            if (HEADER_CACHE_CONTROL.equalsIgnoreCase(name)) {
                this.cacheControlHeader = value;
            }
        }

        @Override  
        public void sendError(int sc) throws IOException {  
            httpStatus = sc;  
            super.sendError(sc);  
        }  
      
        @Override  
        public void sendError(int sc, String msg) throws IOException {  
            httpStatus = sc;  
            super.sendError(sc, msg);  
        }  
      
      
        @Override  
        public void setStatus(int sc) {  
            httpStatus = sc;  
            super.setStatus(sc);  
        }  
      
        public int getStatus() {  
            return httpStatus;  
        }  
        public void setWriteResponseBodyStarted(boolean writeResponseBodyStarted) {
            this.writeResponseBodyStarted = writeResponseBodyStarted;
        }
      
    }

    /**
     * Wrapping extension of {@link PrintWriter} to trap the
     * "Start Write Response Body" event.
     */
    public class XPrintWriter extends PrintWriter {
        private PrintWriter out;

        private HttpServletRequest request;

        private XHttpServletResponse response;

        public XPrintWriter(PrintWriter out, HttpServletRequest request,
                XHttpServletResponse response) {
            super(out);
            this.out = out;
            this.request = request;
            this.response = response;
        }

        @Override
        public PrintWriter append(char c) {
            fireBeforeWriteResponseBodyEvent();
            return out.append(c);
        }

        @Override
        public PrintWriter append(CharSequence csq) {
            fireBeforeWriteResponseBodyEvent();
            return out.append(csq);
        }

        @Override
        public PrintWriter append(CharSequence csq, int start, int end) {
            fireBeforeWriteResponseBodyEvent();
            return out.append(csq, start, end);
        }

        @Override
        public void close() {
            fireBeforeWriteResponseBodyEvent();
            out.close();
        }

        private void fireBeforeWriteResponseBodyEvent() {
            if (!this.response.isWriteResponseBodyStarted()) {
                this.response.setWriteResponseBodyStarted(true);
                onBeforeWriteResponseBody(request, response);
            }
        }

        @Override
        public void flush() {
            fireBeforeWriteResponseBodyEvent();
            out.flush();
        }

        @Override
        public void print(boolean b) {
            fireBeforeWriteResponseBodyEvent();
            out.print(b);
        }

        @Override
        public void print(char c) {
            fireBeforeWriteResponseBodyEvent();
            out.print(c);
        }

        @Override
        public void print(char[] s) {
            fireBeforeWriteResponseBodyEvent();
            out.print(s);
        }

        @Override
        public void print(double d) {
            fireBeforeWriteResponseBodyEvent();
            out.print(d);
        }

        @Override
        public void print(float f) {
            fireBeforeWriteResponseBodyEvent();
            out.print(f);
        }

        @Override
        public void print(int i) {
            fireBeforeWriteResponseBodyEvent();
            out.print(i);
        }

        @Override
        public void print(long l) {
            fireBeforeWriteResponseBodyEvent();
            out.print(l);
        }

        @Override
        public void print(Object obj) {
            fireBeforeWriteResponseBodyEvent();
            out.print(obj);
        }

        @Override
        public void print(String s) {
            fireBeforeWriteResponseBodyEvent();
            out.print(s);
        }

        @Override
        public PrintWriter printf(Locale l, String format, Object... args) {
            fireBeforeWriteResponseBodyEvent();
            return out.printf(l, format, args);
        }

        @Override
        public PrintWriter printf(String format, Object... args) {
            fireBeforeWriteResponseBodyEvent();
            return out.printf(format, args);
        }

        @Override
        public void println() {
            fireBeforeWriteResponseBodyEvent();
            out.println();
        }

        @Override
        public void println(boolean x) {
            fireBeforeWriteResponseBodyEvent();
            out.println(x);
        }

        @Override
        public void println(char x) {
            fireBeforeWriteResponseBodyEvent();
            out.println(x);
        }

        @Override
        public void println(char[] x) {
            fireBeforeWriteResponseBodyEvent();
            out.println(x);
        }

        @Override
        public void println(double x) {
            fireBeforeWriteResponseBodyEvent();
            out.println(x);
        }

        @Override
        public void println(float x) {
            fireBeforeWriteResponseBodyEvent();
            out.println(x);
        }

        @Override
        public void println(int x) {
            fireBeforeWriteResponseBodyEvent();
            out.println(x);
        }

        @Override
        public void println(long x) {
            fireBeforeWriteResponseBodyEvent();
            out.println(x);
        }

        @Override
        public void println(Object x) {
            fireBeforeWriteResponseBodyEvent();
            out.println(x);
        }

        @Override
        public void println(String x) {
            fireBeforeWriteResponseBodyEvent();
            out.println(x);
        }

        @Override
        public void write(char[] buf) {
            fireBeforeWriteResponseBodyEvent();
            out.write(buf);
        }

        @Override
        public void write(char[] buf, int off, int len) {
            fireBeforeWriteResponseBodyEvent();
            out.write(buf, off, len);
        }

        @Override
        public void write(int c) {
            fireBeforeWriteResponseBodyEvent();
            out.write(c);
        }

        @Override
        public void write(String s) {
            fireBeforeWriteResponseBodyEvent();
            out.write(s);
        }

        @Override
        public void write(String s, int off, int len) {
            fireBeforeWriteResponseBodyEvent();
            out.write(s, off, len);
        }

    }

    /**
     * Wrapping extension of {@link ServletOutputStream} to trap the
     * "Start Write Response Body" event.
     */
    public class XServletOutputStream extends ServletOutputStream {

        private HttpServletRequest request;

        private XHttpServletResponse response;

        private ServletOutputStream servletOutputStream;

        public XServletOutputStream(ServletOutputStream servletOutputStream,
                HttpServletRequest request, XHttpServletResponse response) {
            super();
            this.servletOutputStream = servletOutputStream;
            this.response = response;
            this.request = request;
        }

        @Override
        public void close() throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.close();
        }

        private void fireOnBeforeWriteResponseBodyEvent() {
            if (!this.response.isWriteResponseBodyStarted()) {
                this.response.setWriteResponseBodyStarted(true);
                onBeforeWriteResponseBody(request, response);
            }
        }

        @Override
        public void flush() throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.flush();
        }

        @Override
        public void print(boolean b) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.print(b);
        }

        @Override
        public void print(char c) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.print(c);
        }

        @Override
        public void print(double d) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.print(d);
        }

        @Override
        public void print(float f) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.print(f);
        }

        @Override
        public void print(int i) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.print(i);
        }

        @Override
        public void print(long l) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.print(l);
        }

        @Override
        public void print(String s) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.print(s);
        }

        @Override
        public void println() throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.println();
        }

        @Override
        public void println(boolean b) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.println(b);
        }

        @Override
        public void println(char c) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.println(c);
        }

        @Override
        public void println(double d) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.println(d);
        }

        @Override
        public void println(float f) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.println(f);
        }

        @Override
        public void println(int i) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.println(i);
        }

        @Override
        public void println(long l) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.println(l);
        }

        @Override
        public void println(String s) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.println(s);
        }

        @Override
        public void write(byte[] b) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.write(b);
        }

        @Override
        public void write(byte[] b, int off, int len) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.write(b, off, len);
        }

        @Override
        public void write(int b) throws IOException {
            fireOnBeforeWriteResponseBodyEvent();
            servletOutputStream.write(b);
        }

    }

    /**
     * {@link Pattern} for a comma delimited string that support whitespace
     * characters
     */
    private static final Pattern commaSeparatedValuesPattern = Pattern.compile("\\s*,\\s*");

    private static final String HEADER_CACHE_CONTROL = "Cache-Control";

    private static final String HEADER_EXPIRES = "Expires";

    private static final String HEADER_LAST_MODIFIED = "Last-Modified";

    private static final Log log = Log.getLog(ExpiresFilter.class);

    private static final String PARAMETER_EXPIRES_BY_TYPE = "ExpiresByType";

    private static final String PARAMETER_EXPIRES_DEFAULT = "ExpiresDefault";

    private static final String PARAMETER_EXPIRES_EXCLUDED_RESPONSE_STATUS_CODES = "ExpiresExcludedResponseStatusCodes";
    private static final String PARAMETER_EXPIRES_INCLUDED_RESPONSE_STATUS_CODES = "ExpiresIncludedResponseStatusCodes";
    
    private static final String PARAMETER_CACHE_FILE_CONFIG = "cacheFileConfig";

    /**
     * Convert a comma delimited list of numbers into an <tt>int[]</tt>.
     * 
     * @param commaDelimitedInts
     *            can be <code>null</code>
     * @return never <code>null</code> array
     */
    protected static int[] commaDelimitedListToIntArray(
            String commaDelimitedInts) {
        String[] intsAsStrings = commaDelimitedListToStringArray(commaDelimitedInts);
        int[] ints = new int[intsAsStrings.length];
        for (int i = 0; i < intsAsStrings.length; i++) {
            String intAsString = intsAsStrings[i];
            try {
                ints[i] = Integer.parseInt(intAsString);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Exception parsing number '" + i +
                        "' (zero based) of comma delimited list '" +
                        commaDelimitedInts + "'");
            }
        }
        return ints;
    }

    /**
     * Convert a given comma delimited list of strings into an array of String
     * 
     * @return array of patterns (non <code>null</code>)
     */
    protected static String[] commaDelimitedListToStringArray(
            String commaDelimitedStrings) {
        return (commaDelimitedStrings == null || commaDelimitedStrings.length() == 0) ? new String[0]
                : commaSeparatedValuesPattern.split(commaDelimitedStrings);
    }

    /**
     * Return <code>true</code> if the given <code>str</code> contains the given
     * <code>searchStr</code>.
     */
    protected static boolean contains(String str, String searchStr) {
        if (str == null || searchStr == null) {
            return false;
        }
        return str.indexOf(searchStr) >= 0;
    }

    /**
     * Convert an array of ints into a comma delimited string
     */
    protected static String intsToCommaDelimitedString(int[] ints) {
        if (ints == null) {
            return "";
        }

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < ints.length; i++) {
            result.append(ints[i]);
            if (i < (ints.length - 1)) {
                result.append(", ");
            }
        }
        return result.toString();
    }

    /**
     * Return <code>true</code> if the given <code>str</code> is
     * <code>null</code> or has a zero characters length.
     */
    protected static boolean isEmpty(String str) {
        return str == null || str.length() == 0;
    }

    /**
     * Return <code>true</code> if the given <code>str</code> has at least one
     * character (can be a withespace).
     */
    protected static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }

    /**
     * Return <code>true</code> if the given <code>string</code> starts with the
     * given <code>prefix</code> ignoring case.
     * 
     * @param string
     *            can be <code>null</code>
     * @param prefix
     *            can be <code>null</code>
     */
    protected static boolean startsWithIgnoreCase(String string, String prefix) {
        if (string == null || prefix == null) {
            return string == null && prefix == null;
        }
        if (prefix.length() > string.length()) {
            return false;
        }

        return string.regionMatches(true, 0, prefix, 0, prefix.length());
    }

    /**
     * Return the subset of the given <code>str</code> that is before the first
     * occurence of the given <code>separator</code>. Return <code>null</code>
     * if the given <code>str</code> or the given <code>separator</code> is
     * null. Return and empty string if the <code>separator</code> is empty.
     * 
     * @param str
     *            can be <code>null</code>
     * @param separator
     *            can be <code>null</code>
     */
    protected static String substringBefore(String str, String separator) {
        if (str == null || "".equals(str) || separator == null) {
            return null;
        }

        if ("".equals(separator)) {
            return "";
        }

        int separatorIndex = str.indexOf(separator);
        if (separatorIndex == -1) {
            return str;
        }
        return str.substring(0, separatorIndex);
    }

    /**
     * Default Expires configuration.
     */
    private ExpiresConfiguration defaultExpiresConfiguration;

    /**
     * list of response status code for which the {@link ExpiresFilter} will not
     * generate expiration headers.
     */
    private int[] excludedResponseStatusCodes = new int[] { HttpServletResponse.SC_NOT_MODIFIED };
    private int[] includedResponseStatusCodes = new int[] { HttpServletResponse.SC_INTERNAL_SERVER_ERROR };
    
    /**
     * Expires configuration by content type. Visible for test.
     */
    private Map<String, ExpiresConfiguration> expiresConfigurationByContentType = new LinkedHashMap<String, ExpiresConfiguration>();

    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain) throws IOException, ServletException {
    	
        if (request instanceof HttpServletRequest &&
                response instanceof HttpServletResponse) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            if (response.isCommitted()) {
//                    log.debug("expiresFilter.responseAlreadyCommited={}",
//                            httpRequest.getRequestURL());
                chain.doFilter(request, response);
            } else {
                XHttpServletResponse xResponse = new XHttpServletResponse(
                        httpRequest, httpResponse);
                chain.doFilter(request, xResponse);
                if (!xResponse.isWriteResponseBodyStarted()) {
                    // Empty response, manually trigger
                    // onBeforeWriteResponseBody()
                    onBeforeWriteResponseBody(httpRequest, xResponse);
                }
            }
        } else {
            chain.doFilter(request, response);
        }
    }

    public ExpiresConfiguration getDefaultExpiresConfiguration() {
        return defaultExpiresConfiguration;
    }

    public String getExcludedResponseStatusCodes() {
        return intsToCommaDelimitedString(excludedResponseStatusCodes);
    }

    public int[] getExcludedResponseStatusCodesAsInts() {
        return excludedResponseStatusCodes;
    }

    /**
     * <p>
     * Returns the expiration date of the given {@link XHttpServletResponse} or
     * <code>null</code> if no expiration date has been configured for the
     * declared content type.
     * </p>
     * <p>
     * <code>protected</code> for extension.
     * </p>
     * 
     * @see HttpServletResponse#getContentType()
     */
    protected Date getExpirationDate(XHttpServletResponse response) {
        String contentType = response.getContentType();

        // lookup exact content-type match (e.g.
        // "text/html; charset=iso-8859-1")
        ExpiresConfiguration configuration = expiresConfigurationByContentType.get(contentType);
        if (configuration != null) {
            Date result = getExpirationDate(configuration, response);
//                log.debug(
//                        "expiresFilter.useMatchingConfiguration={}",
//                        configuration, contentType, contentType, result);
            return result;
        }

        if (contains(contentType, ";")) {
            // lookup content-type without charset match (e.g. "text/html")
            String contentTypeWithoutCharset = substringBefore(contentType, ";").trim();
            configuration = expiresConfigurationByContentType.get(contentTypeWithoutCharset);

            if (configuration != null) {
                Date result = getExpirationDate(configuration, response);
//                    log.debug(
//                            "expiresFilter.useMatchingConfiguration={}",
//                            configuration, contentTypeWithoutCharset,
//                            contentType, result);
                
                return result;
            }
        }

        if (contains(contentType, "/")) {
            // lookup major type match (e.g. "text")
            String majorType = substringBefore(contentType, "/");
            configuration = expiresConfigurationByContentType.get(majorType);
            if (configuration != null) {
                Date result = getExpirationDate(configuration, response);
//                    log.debug(
//                            "expiresFilter.useMatchingConfiguration={}",
//                            configuration, majorType, contentType, result);
                
                return result;
            }
        }

        if (defaultExpiresConfiguration != null) {
            Date result = getExpirationDate(defaultExpiresConfiguration,
                    response);
//                log.debug("expiresFilter.useDefaultConfiguration={}",
//                        defaultExpiresConfiguration, contentType, result);
            return result;
        }
//        log.debug(
//                    "expiresFilter.noExpirationConfiguredForContentType={}",
//                    contentType);
        
        return null;
    }

    /**
     * <p>
     * Returns the expiration date of the given {@link ExpiresConfiguration},
     * {@link HttpServletRequest} and {@link XHttpServletResponse}.
     * </p>
     * <p>
     * <code>protected</code> for extension.
     * </p>
     */
    protected Date getExpirationDate(ExpiresConfiguration configuration,
            XHttpServletResponse response) {
        Calendar calendar;
        switch (configuration.getStartingPoint()) {
        case ACCESS_TIME:
            calendar = Calendar.getInstance();
            break;
        case LAST_MODIFICATION_TIME:
            if (response.isLastModifiedHeaderSet()) {
                try {
                    long lastModified = response.getLastModifiedHeader();
                    calendar = Calendar.getInstance();
                    calendar.setTimeInMillis(lastModified);
                } catch (NumberFormatException e) {
                    // default to now
                    calendar = Calendar.getInstance();
                }
            } else {
                // Last-Modified header not found, use now
                calendar = Calendar.getInstance();
            }
            break;
        default:
            throw new IllegalStateException(
                    "expiresFilter.unsupportedStartingPoint: configuration.getStartingPoint()="+configuration.getStartingPoint());
        }
        for (Duration duration : configuration.getDurations()) {
            calendar.add(duration.getUnit().getCalendardField(),
                    duration.getAmount());
        }

        return calendar.getTime();
    }

    public Map<String, ExpiresConfiguration> getExpiresConfigurationByContentType() {
        return expiresConfigurationByContentType;
    }

    protected Log getLogger() {
        return log;
    }

    public void init(FilterConfig filterConfig) throws ServletException {
    	loader=XmlConfigLoader.getInstance();
        for (Enumeration<String> names = filterConfig.getInitParameterNames(); names.hasMoreElements();) {
            String name = names.nextElement();
            String value = filterConfig.getInitParameter(name);

            try {
                if (name.startsWith(PARAMETER_EXPIRES_BY_TYPE)) {
                    String contentType = name.substring(
                            PARAMETER_EXPIRES_BY_TYPE.length()).trim();
                    ExpiresConfiguration expiresConfiguration = parseExpiresConfiguration(value);
                    this.expiresConfigurationByContentType.put(contentType,
                            expiresConfiguration);
                } else if (name.equalsIgnoreCase(PARAMETER_EXPIRES_DEFAULT)) {
                    ExpiresConfiguration expiresConfiguration = parseExpiresConfiguration(value);
                    this.defaultExpiresConfiguration = expiresConfiguration;
                } else if (name.equalsIgnoreCase(PARAMETER_EXPIRES_EXCLUDED_RESPONSE_STATUS_CODES)) {
                    this.excludedResponseStatusCodes = commaDelimitedListToIntArray(value);
                } else if (name.equalsIgnoreCase(PARAMETER_EXPIRES_INCLUDED_RESPONSE_STATUS_CODES)) {
                    this.includedResponseStatusCodes = commaDelimitedListToIntArray(value);
                } else if (name.equalsIgnoreCase(PARAMETER_CACHE_FILE_CONFIG)) {
                	loader.load(filterConfig.getServletContext(),value);
                } else {
                    log.warn(
                            "expiresFilter.unknownParameterIgnored name={} value=", name,
                            value);
                }
            } catch (RuntimeException e) {
                throw new ServletException(
                        "expiresFilter.exceptionProcessingParameter: name="+name+",value="+
                        value, e);
            }
        }

//        log.debug("expiresFilter.filterInitialized={}",
//                this.toString());
    }

    /**
     * 
     * <p>
     * <code>protected</code> for extension.
     * </p>
     */
    protected boolean isEligibleToExpirationHeaderGeneration(
            HttpServletRequest request, XHttpServletResponse response) {
        boolean expirationHeaderHasBeenSet = response.containsHeader(HEADER_EXPIRES) ||
                contains(response.getCacheControlHeader(), "max-age");
        if (expirationHeaderHasBeenSet) {
//                log.debug(
//                        "expiresFilter.expirationHeaderAlreadyDefined uri={} status={} contentType={}",
//                        request.getRequestURI(),
//                        response.getContentType());
            
            return false;
        }

        for (int skippedStatusCode : this.excludedResponseStatusCodes) {
            if (response.getStatus() == skippedStatusCode) {
//                log.debug("expiresFilter.skippedStatusCode uri={} status={} contentType={}",
//                        request.getRequestURI(),
//                        Integer.valueOf(response.getStatus()),
//                        response.getContentType());
                return false;
            }
        }

        return true;
    }

    /**
     * <p>
     * If no expiration header has been set by the servlet and an expiration has
     * been defined in the {@link ExpiresFilter} configuration, sets the '
     * <tt>Expires</tt>' header and the attribute '<tt>max-age</tt>' of the '
     * <tt>Cache-Control</tt>' header.
     * </p>
     * <p>
     * Must be called on the "Start Write Response Body" event.
     * </p>
     * <p>
     * Invocations to <tt>Logger.debug(...)</tt> are guarded by
     * {@link Log#isDebugEnabled()} because
     * {@link HttpServletRequest#getRequestURI()} and
     * {@link HttpServletResponse#getContentType()} costs <tt>String</tt>
     * objects instantiations (as of Tomcat 7).
     * </p>
     */
    public void onBeforeWriteResponseBody(HttpServletRequest request,
            XHttpServletResponse response) {

        if (!isEligibleToExpirationHeaderGeneration(request, response)) {
            return;
        }
        for (int skippedStatusCode : this.includedResponseStatusCodes) {
            if (response.getStatus() == skippedStatusCode) {
            	//Http 1.0 header
        		response.setDateHeader(HEADER_EXPIRES, 0);
        		response.addHeader("Pragma", "no-cache");
        		//Http 1.1 header
        		response.setHeader(HEADER_CACHE_CONTROL, "no-cache");
            	return;
            }
        }
        if(response.containsHeader(HEADER_CACHE_CONTROL)){
        	return;
        }
        Date expirationDate = getExpirationDate(response);
        if (expirationDate == null) {
        } else {
        	long maxAge=expirationDate.getTime() - System.currentTimeMillis();
        	if(maxAge<=1000){//小于１秒，视无缓存
        		//Http 1.0 header
        		response.setDateHeader(HEADER_EXPIRES, 0);
        		response.addHeader("Pragma", "no-cache");
        		//Http 1.1 header
        		response.setHeader(HEADER_CACHE_CONTROL, "no-cache");
                 return;
        	}
            String maxAgeDirective = "max-age=" +
                    ( maxAge/ 1000);

            String cacheControlHeader = response.getCacheControlHeader();
            String newCacheControlHeader = (cacheControlHeader == null) ? maxAgeDirective
                    : cacheControlHeader + ", " + maxAgeDirective;
            response.setHeader(HEADER_CACHE_CONTROL, newCacheControlHeader);
            response.setDateHeader(HEADER_EXPIRES, expirationDate.getTime());
        }
        
        if(loader.getCachUrlList() !=null && loader.getCachUrlList().size()>0){
        	String contentType = response.getContentType();
        	for(CacheUrl cacheUrl:loader.getCachUrlList()){
        		String path = request.getServletPath();
				if (request.getPathInfo() != null) {
					path = path + request.getPathInfo();
				}
        		if(pathMatcher.match(cacheUrl.getPattern(), path)){
        			if(!cacheUrl.isCache()){
        				if(contains(contentType, cacheUrl.getContentType()) || cacheUrl.getContentType().equals("*")){
               				//Http 1.0 header
                    		response.setDateHeader(HEADER_EXPIRES, 0);
                    		response.addHeader("Pragma", "no-cache");
                    		//Http 1.1 header
                    		response.setHeader(HEADER_CACHE_CONTROL, "no-cache");
        				}
        			} else {
        				if(contains(contentType, cacheUrl.getContentType()) || cacheUrl.getContentType().equals("*")){
        					//maxAge单位是秒，不应该除以1000
//        		            String maxAgeDirective = "max-age=" +
//        		                    ( cacheUrl.getMaxAge()/ 1000);
        		            String maxAgeDirective = "max-age=" + cacheUrl.getMaxAge();
        		            
        		            String cacheControlHeader = response.getCacheControlHeader();
        		            String newCacheControlHeader = (cacheControlHeader == null) ? maxAgeDirective
        		                    : cacheControlHeader + ", " + maxAgeDirective;
        		            Calendar calendar = Calendar.getInstance();
        		            calendar.add(Calendar.SECOND, (int) cacheUrl.getMaxAge());
        		            response.setHeader(HEADER_CACHE_CONTROL, newCacheControlHeader);
//        		            response.setDateHeader(HEADER_EXPIRES, expirationDate.getTime());
        		            response.setDateHeader(HEADER_EXPIRES, calendar.getTimeInMillis());
        				}
        			}
        			break;
        		}
        	}
        }

    }

    /**
     * Parse configuration lines like '
     * <tt>access plus 1 month 15 days 2 hours</tt>' or '
     * <tt>modification 1 day 2 hours 5 seconds</tt>'
     * 
     * @param inputLine
     */
    protected ExpiresConfiguration parseExpiresConfiguration(String inputLine) {
        String line = inputLine.trim();

        StringTokenizer tokenizer = new StringTokenizer(line, " ");

        String currentToken;

        try {
            currentToken = tokenizer.nextToken();
        } catch (NoSuchElementException e) {
            throw new IllegalStateException(
                    "expiresFilter.startingPointNotFound="+ line);
        }

        StartingPoint startingPoint;
        if ("access".equalsIgnoreCase(currentToken) ||
                "now".equalsIgnoreCase(currentToken)) {
            startingPoint = StartingPoint.ACCESS_TIME;
        } else if ("modification".equalsIgnoreCase(currentToken)) {
            startingPoint = StartingPoint.LAST_MODIFICATION_TIME;
        } else if (!tokenizer.hasMoreTokens() &&
                startsWithIgnoreCase(currentToken, "a")) {
            startingPoint = StartingPoint.ACCESS_TIME;
            // trick : convert duration configuration from old to new style
            tokenizer = new StringTokenizer(currentToken.substring(1) +
                    " seconds", " ");
        } else if (!tokenizer.hasMoreTokens() &&
                startsWithIgnoreCase(currentToken, "m")) {
            startingPoint = StartingPoint.LAST_MODIFICATION_TIME;
            // trick : convert duration configuration from old to new style
            tokenizer = new StringTokenizer(currentToken.substring(1) +
                    " seconds", " ");
        } else {
            throw new IllegalStateException(
                    "expiresFilter.startingPointInvalid: currentToken="+currentToken+" line"+line);
        }

        try {
            currentToken = tokenizer.nextToken();
        } catch (NoSuchElementException e) {
            throw new IllegalStateException(
                    "Duration not found in directive '{}' line="+line);
        }

        if ("plus".equalsIgnoreCase(currentToken)) {
            // skip
            try {
                currentToken = tokenizer.nextToken();
            } catch (NoSuchElementException e) {
                throw new IllegalStateException(
                        "Duration not found in directive '{"+line+"}'");
            }
        }

        List<Duration> durations = new ArrayList<Duration>();

        while (currentToken != null) {
            int amount;
            try {
                amount = Integer.parseInt(currentToken);
            } catch (NumberFormatException e) {
                throw new IllegalStateException(
                        "Invalid duration (number) '{"+currentToken+"}' in directive '{"+line+"}'");
            }

            try {
                currentToken = tokenizer.nextToken();
            } catch (NoSuchElementException e) {
                throw new IllegalStateException(
                                "Duration unit not found after amount {"+ Integer.valueOf(amount)+"} in directive '{"+line+"}'");
            }
            DurationUnit durationUnit;
            if ("years".equalsIgnoreCase(currentToken)) {
                durationUnit = DurationUnit.YEAR;
            } else if ("month".equalsIgnoreCase(currentToken) ||
                    "months".equalsIgnoreCase(currentToken)) {
                durationUnit = DurationUnit.MONTH;
            } else if ("week".equalsIgnoreCase(currentToken) ||
                    "weeks".equalsIgnoreCase(currentToken)) {
                durationUnit = DurationUnit.WEEK;
            } else if ("day".equalsIgnoreCase(currentToken) ||
                    "days".equalsIgnoreCase(currentToken)) {
                durationUnit = DurationUnit.DAY;
            } else if ("hour".equalsIgnoreCase(currentToken) ||
                    "hours".equalsIgnoreCase(currentToken)) {
                durationUnit = DurationUnit.HOUR;
            } else if ("minute".equalsIgnoreCase(currentToken) ||
                    "minutes".equalsIgnoreCase(currentToken)) {
                durationUnit = DurationUnit.MINUTE;
            } else if ("second".equalsIgnoreCase(currentToken) ||
                    "seconds".equalsIgnoreCase(currentToken)) {
                durationUnit = DurationUnit.SECOND;
            } else {
                throw new IllegalStateException(
                                "Invalid duration unit (years|months|weeks|days|hours|minutes|seconds) '{"+currentToken+"}' in directive '{"+line+"}'");
            }

            Duration duration = new Duration(amount, durationUnit);
            durations.add(duration);

            if (tokenizer.hasMoreTokens()) {
                currentToken = tokenizer.nextToken();
            } else {
                currentToken = null;
            }
        }

        return new ExpiresConfiguration(startingPoint, durations);
    }

    public void setDefaultExpiresConfiguration(
            ExpiresConfiguration defaultExpiresConfiguration) {
        this.defaultExpiresConfiguration = defaultExpiresConfiguration;
    }

    public void setExcludedResponseStatusCodes(int[] excludedResponseStatusCodes) {
        this.excludedResponseStatusCodes = excludedResponseStatusCodes;
    }

    public void setExpiresConfigurationByContentType(
            Map<String, ExpiresConfiguration> expiresConfigurationByContentType) {
        this.expiresConfigurationByContentType = expiresConfigurationByContentType;
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "[excludedResponseStatusCode=[" +
                intsToCommaDelimitedString(this.excludedResponseStatusCodes) +
                "], default=" + this.defaultExpiresConfiguration + ", byType=" +
                this.expiresConfigurationByContentType + "]";
    }

	public void destroy() {
		// TODO Auto-generated method stub
		
	}
}

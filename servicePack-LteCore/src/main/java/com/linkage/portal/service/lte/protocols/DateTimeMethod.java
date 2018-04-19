package com.linkage.portal.service.lte.protocols;




import java.text.SimpleDateFormat;
import java.util.Date;   
import java.util.List;   
import java.util.Locale;

import org.apache.commons.httpclient.util.DateUtil;
import org.apache.http.impl.cookie.DateUtils;
   
import freemarker.template.TemplateMethodModel;   
import freemarker.template.TemplateModelException;   
   
/**  
 * 根 据传入的日期时间格式，在页面上直接取得当前时间的格式化结果  
 * 如果格式为空或者错误，将返回yyyy-MM-dd HH:mm:ss  
 * 页面调用${datetime("yyyy")}/${datetime('yyyy')}  
 * @see com.yourcompany.ExtendedFreemarkerManager#createConfiguration  
 * @author Sunshine  
 *  
 */   
public class DateTimeMethod implements TemplateMethodModel {   
   
    private static final String DEFAULT_PATTERN = "yyyy-MM-dd HH:mm:ss";   
    private static final String GMT_PATTERN = "E MMM dd HH:mm:ss z yyyy"; 
    private static final String COMMON_PATTERN = "yyyyMMddHHmmss";
   
    @SuppressWarnings("unchecked")   
    public Object exec(List args) throws TemplateModelException {   
        Date date = new Date();  
        String dateStr = "";
        String pattern=DEFAULT_PATTERN;
        if(args!=null && args.size()>0){
        	dateStr = args.get(0).toString();
        }  
        String patterns[]= {GMT_PATTERN,DEFAULT_PATTERN,COMMON_PATTERN};
        try {   
        	Date dd = DateUtils.parseDate(dateStr, patterns);
            return new SimpleDateFormat(pattern).format(dd);  
        } catch (Exception e) {   
            return new SimpleDateFormat(DEFAULT_PATTERN).format(date);   
        }   
    }   
}   

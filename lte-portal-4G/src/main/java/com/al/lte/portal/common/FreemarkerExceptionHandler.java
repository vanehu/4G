package com.al.lte.portal.common;

import java.io.IOException;
import java.io.Writer;

import com.al.ecs.log.Log;

import freemarker.core.Environment;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;

/**
 * freemarker异常捕捉类扩展
 * @author liusd
 * @createDate 2013-05-29
 */
public class FreemarkerExceptionHandler implements TemplateExceptionHandler {
    private Log log = Log.getLog(FreemarkerExceptionHandler.class);

    public void handleTemplateException(TemplateException te, Environment env, Writer out) throws TemplateException {
        try {
            StringBuffer sb = new StringBuffer(256);
            sb.append("<script language=javascript>//\"></script>");
            sb.append("<script language=javascript>//\'></script>");
            sb.append("<script language=javascript>//\"></script>");
            sb.append("<script language=javascript>//\'></script>");
            sb.append("</title></xmp></script></noscript></style></object>");
            sb.append("</head></pre></table>");
            sb.append("</form></table></table></table></a></u></i></b>");
            sb.append("<div style='text-transform: none'>");
           
            sb.append("<script type='text/javascript'>");
            sb.append("var webLoc = window.location.toString();");
            sb.append("var arrWebLoc = webLoc.split('/');");
            sb.append("webLoc = arrWebLoc[0]+'//'+arrWebLoc[1]+'/'+arrWebLoc[2]+'/'+arrWebLoc[3];");
            sb.append("window.location.href=webLoc+'/error/error-freemarker.jsp';");
            sb.append("</script>");
            
            sb.append("</div></html>");

            this.log.debug("--location--{}", sb);
            out.write(sb.toString());
            this.log.error("Freemarker Error: ", te);
        } catch (IOException e) {
            this.log.error("异常捕捉失败：", e);
            //throw new TemplateException("Failed to print error message. Cause: " + e, env);
        } finally {
            if (null != out) {
                try {
                    out.flush();
                    out.close();
                } catch (IOException e) {}
            }
        }
    }
}

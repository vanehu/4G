package com.al.ecs.tag.page;


import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.jsp.JspException;
import javax.servlet.jsp.PageContext;
import javax.servlet.jsp.tagext.BodyTagSupport;

import com.al.ecs.log.Log;
  
/** 
 * 分页标签 
 * @author tangs 
 */  
public class PageTag extends BodyTagSupport {
	
	private static final long serialVersionUID = -2537649580045296305L;

	protected Log log = Log.getLog(PageTag.class);

	/** 当前页数 */
	private String pageNo;  
	/** 总页数 */
    private String total;  
    /** 样式 */
    private String styleClass;  
    /** 主题 */
    private String theme;  
    /** url参数 */
    private String includes; 
    /** url */
    private String url;
   
    public void setUrl(String url) {  
        this.url = url;  
    }
    public void setTheme(String theme) {  
        this.theme = theme;  
    }      
    public void setStyleClass(String styleClass) {  
        this.styleClass = styleClass;  
    }  
    public void setPageNo(String pageNo) {  
        this.pageNo = pageNo;  
    }  
    public void setTotal(String total) {  
        this.total = total;  
    }  
    public String getIncludes() {  
        return includes;  
    }  
    public void setIncludes(String includes) {  
        this.includes = includes;  
    }  
  
    @Override
	public int doAfterBody() throws JspException {
			// HTML and/or JavaScript escape, if demanded
			HttpServletRequest  request=(HttpServletRequest)pageContext.getRequest();
			Object param= request.getParameter(pageNo);
			pageNo =param==null?"1":(String)param;  
			param= pageContext.getAttribute("total",PageContext.REQUEST_SCOPE);
			total =param==null?total:String.valueOf(param);    
			param= request.getParameter(url);
			url =param==null?url:(String)param;    
			 StringBuffer perUrl=new StringBuffer("");  
	            if(includes!=null){  
	                String[] perm=includes.split(",");  
	                for(int i=0;i<perm.length;i++){  
	                    String permName=perm[i];  
	                    Object obje=pageContext.getAttribute(permName,PageContext.REQUEST_SCOPE); 
	                    if(obje==null) {
	                    	obje=request.getParameter(permName);  
	                    	  if(obje==null) {
	                    		  continue;
	                    	  }
	                    }  
	                    perUrl.append("&"+permName);  
                        String tmp= String.valueOf(obje);  
                        perUrl.append("="+tmp);  
	                }                 
	            }  
	            log.debug("perUrl={}", perUrl);
	           StringBuilder str = new StringBuilder();
			  int cpageInt = Integer.parseInt(pageNo);  
	            str.append("<div ");  
	            if (styleClass != null) {  
	                str.append(" class='"+styleClass+"'>");  
	            } else {  
	                str.append(">");  
	            }  
	              
	            //文本样式  
	            if (theme == null || "text".equals(theme)) {  
	                //当前页与总页数相等  
	                if (pageNo.equals(total)) {  
	                    //如果total = 1，则无需分页，显示“[第1页] [共1页]”  
	                    if ("1".equals(total)) {  
	                        str.append("[第 " + pageNo + " 页]");  
	                        str.append(" [共 " + total + " 页]");  
	                    } else {  
	                        //到达最后一页,显示“[首页] [上一页] [末页]”  
	                        str.append("<a href='"+url+"?pageNo=1"+perUrl+"'>[首页]</a> ");   
	                        str.append("<a href='"+url+"?pageNo=" + (cpageInt - 1)+perUrl+"'>[上一页]</a>" );  
	                        str.append(" <a href='"+url+"?pageNo=" + total+perUrl+"'>[末页]</a> ");  
	                    }  
	                } else {  
	                    //当前页与总页数不相同  
	                    if ("1".equals(pageNo)) {  
	                        //第一页，显示“[首页] [下一页] [末页]”  
	                        str.append("<a href='"+url+"?pageNo=1"+perUrl+"'>[首页]</a>");  
	                        str.append("<a href='"+url+"?pageNo=" + (cpageInt + 1) +perUrl+"'>[下一页]</a>");                         
	                        str.append("<a href='"+url+"?pageNo=" + total +perUrl+"'>[末页]</a>");  
	                    } else {  
	                        //不是第一页，显示“[首页] [上一页] [下一页] [末页]”  
	                        str.append("<a href='"+url+"?pageNo=1"+perUrl+"'>[首页]</a>");  
	                        str.append("<a href='"+url+"?pageNo=" + (cpageInt - 1)+perUrl+"'>[上一页]</a>");  
	                        str.append("<a href='"+url+"?pageNo=" + (cpageInt + 1)+perUrl+"'>[下一页]</a>");  
	                        str.append("<a href='"+url+"?pageNo=" + total +perUrl+"'>[末页]</a>");  
	                    }  
	                }  
	            } else if ("number".equals(theme)) {  //数字样式 [1 2 3 4 5 6 7 8 9 10 > >>]  
	                int totalInt = Integer.parseInt(total);  
	                 
	                //如果只有一页，则无需分页  
	                if (totalInt == 1) {  
	                	str.append("<span class='disabled '>首页 上一页</span> " );  
	                	 str.append("<span class='current'>1</span> ");
	                    str.append("<span class='disabled '>下一页 末页</span> " );  
	                } else {                      
	                    if (cpageInt > 1) {  
	                        //当前不是第一组，要显示“<< <”  
	                        //<<：返回前一组第一页  
	                        //<：返回前一页  
	                        str.append("<a href='"+url+"?pageNo=1"+perUrl+"'>首页</a> ");  
	                        str.append("<a href='"+url+"?pageNo=" + (cpageInt - 1)+perUrl);  
	                        str.append("'>上一页</a> " );  
	                    }else{                            
	                        str.append("<span class='disabled '>首页 上一页</span> " );  
	                    }  
	                      
	                    int v=((cpageInt-4)>0 && totalInt> 10)?(cpageInt-4):1; 
	                    int v1=(cpageInt+4)<totalInt?(cpageInt+5):totalInt;
	                    if(v1==totalInt&&totalInt>10){ 
	                        v=totalInt-10+1; 
	                    }else if(v==1&&v1<totalInt){ 
	                        v1=totalInt>10?10:totalInt; 
	                    }  
	 
	                    //10个为一组显示  
	                    for (int i = v; i <= v1; i++) {  
	                        if (cpageInt == i) { //当前页要加粗显示  
	                            str.append("<span class='current'>"+i+"</span> ");                                   
	                        }else{  
	                            str.append("<a href='"+url+"?pageNo=" + i +perUrl+"'>" + i + "</a> ");  
	                        }                              
	                    }  
	                    //如果多于1组并且不是最后一组，显示“> >>”  
	                    if (cpageInt<totalInt) {  
	                        //>>：返回下一组最后一页  
	                        //>：返回下一页  
	                        str.append("<a href='"+url+"?pageNo=" + (cpageInt + 1)+perUrl);  
	                        str.append("'>下一页</a> " );  
	                        str.append("<a href='"+url+"?pageNo=" + totalInt+perUrl);  
	                        str.append("'>末页</a> " );  
	                    }else{  
	                        str.append("<span class='disabled '>下一页 末页</span> " );  
	                    }  
	                }  
	                str.append("<span class='current'>共"+totalInt+"页</span>" );  
	            }   else if ("ajaxnumber".equals(theme)) {  //ajax请求数字样式 [1 2 3 4 5 6 7 8 9 10 > >>]  
	                int totalInt = Integer.parseInt(total);  
	                 
	                //如果只有一页，则无需分页  
	                if (totalInt == 1) {  
	                	str.append("<span class='disabled '>首页 上一页</span> " );  
	                	 str.append("<span class='current'>1</span> ");
	                    str.append("<span class='disabled '>下一页 末页</span> " );  
	                } else {                      
	                    if (cpageInt > 1) {  
	                        //当前不是第一组，要显示“<< <”  
	                        //<<：返回前一组第一页  
	                        //<：返回前一页  
	                        str.append("<a href='javascript:page.ajax(\""+url+"?pageNo=1"+perUrl+"\")'>首页</a> ");  
	                        str.append("<a href='javascript:page.ajax(\""+url+"?pageNo=" + (cpageInt - 1)+perUrl);  
	                        str.append("\")'>上一页</a> " );  
	                    }else{                            
	                        str.append("<span class='disabled '>首页 上一页</span> " );  
	                    }  
	                      
	                    int v=((cpageInt-4)>0 && totalInt> 10)?(cpageInt-4):1; 
	                    int v1=(cpageInt+4)<totalInt?(cpageInt+5):totalInt;
	                    if(v1==totalInt&&totalInt>10){ 
	                        v=totalInt-10+1; 
	                    }else if(v==1&&v1<totalInt){ 
	                        v1=totalInt>10?10:totalInt; 
	                    }  
	 
	                    //10个为一组显示  
	                    for (int i = v; i <= v1; i++) {  
	                        if (cpageInt == i) { //当前页要加粗显示  
	                            str.append("<span class='current'>"+i+"</span> ");                                   
	                        }else{  
	                            str.append("<a href='javascript:page.ajax(\""+url+"?pageNo=" + i +perUrl+"\")'>" + i + "</a> ");  
	                        }                              
	                    }  
	                    //如果多于1组并且不是最后一组，显示“> >>”  
	                    if (cpageInt<totalInt) {  
	                        //>>：返回下一组最后一页  
	                        //>：返回下一页  
	                        str.append("<a href='javascript:page.ajax(\""+url+"?pageNo=" + (cpageInt + 1)+perUrl);  
	                        str.append("\")'>下一页</a> " );  
	                        str.append("<a href='javascript:page.ajax(\""+url+"?pageNo=" + totalInt+perUrl);  
	                        str.append("\")'>末页</a> " );  
	                    }else{  
	                        str.append("<span class='disabled '>下一页 末页</span> " );  
	                    }  
	                }  
	                str.append("<span class='current'>共"+totalInt+"页</span>" );  
	            }  
	            str.append("</div>");
			try {
				getPreviousOut().print(str.toString());
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		return SKIP_BODY;
	}
  

} 
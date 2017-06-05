<%@ page language="java" import="java.util.*" pageEncoding="GB18030"%>
<%@ page import="java.sql.*" %>

<!-- 需要更改应用中的数据源beanId,请在些更改状态  -->
<%! static final String CURRENT_DATESOURCE_BEAN_ID  = "serviceDataSource"; %>
<%! static org.springframework.context.ApplicationContext ctx = null; %>

<html>
	<head>
		<title>应用检测Sniffer</title>
		<meta http-equiv="pragma" content="no-cache">
		<meta http-equiv="cache-control" content="no-cache">
		<meta http-equiv="expires" content="0">
		<meta http-equiv="Content-Type" content="text/html; charset=GB18030" />
		<meta http-equiv="refresh" content="60">
		<style type="text/css">
			body,a,table,td,th,input,textarea,button,select{ font: 12px/16px Verdana,"宋体",sans-serif;}
			.btn {
				BORDER-RIGHT: #7b9ebd 1px solid; PADDING-RIGHT: 2px; BORDER-TOP: #7b9ebd 1px solid; PADDING-LEFT: 2px; FONT-SIZE: 16px; font-weight :bold;FILTER: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr=#ffffff, EndColorStr=#cecfde); BORDER-LEFT: #7b9ebd 1px solid; CURSOR: hand; COLOR: black; PADDING-TOP: 2px; BORDER-BOTTOM: #7b9ebd 1px solid
			}
			.title_span {
				font-size: 17; font-weight: bold;
			}
		</style>
	</head>
	<body bgcolor="white">
		<div style="width: 100%; height: 25px;"><span class="title_span" style="margin-right: 30px;">应用及数据库状态侦测</span>
			<button class="btn" onclick="window.location.reload();">检测应用</button><p/>
		</div>
		<hr/><br/>
		<span class="title_span">状态:</span><br/>
		<%
			String getDbStatus = request.getParameter("getDbStatus");
			if (!"y".equalsIgnoreCase(getDbStatus)) {
				out.print("<br/>当前页面正常。<br/>");
			} else {
				java.util.List list = new java.util.ArrayList();
				if(session.getAttribute("_sinffer_list") != null){
					list = (java.util.List)session.getAttribute("_sinffer_list");
				} 
				
				StringBuffer sb = new StringBuffer("[" + new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date())  + "] - ");
				long start = System.currentTimeMillis();
				javax.sql.DataSource ds = null;
				Connection conn = null;
				Statement statement = null;
				ResultSet rs = null;
				try {
					if (ctx == null) {
						ctx = org.springframework.web.context.support.WebApplicationContextUtils
							.getRequiredWebApplicationContext(this.getServletConfig().getServletContext());
					}
					
					// 通过Spring bean获取
					ds =  (javax.sql.DataSource)ctx.getBean(CURRENT_DATESOURCE_BEAN_ID);

					conn = ds.getConnection();
					if(conn != null) {
						sb.append("获取连接成功, 连接是否正常:<font style='color:red; weight:bold;'>" + (!conn.isClosed() ? "正常" : "断开") + "</font>; ");
						statement = conn.createStatement();
						rs = statement.executeQuery("select to_char(sysdate,'yyyy-mm-dd hh24:mi:ss') from dual");
						while(rs.next()){
							sb.append("获取数据库时间:<font style='color:red;'>" +rs.getString(1)+"</font>; ");
						}
					} else{
						sb.append("<font style='color:red;'>ERROR:获取失败，请检查数据库!</font><br/>");
					}
				} catch(Exception e) {
					sb.append("<font style='color:red;'>ERROR:" + e + "</font>; ");
				} finally {
					if(conn != null) {
						try {
							conn.close();	
						} catch(Exception e){
							out.println(e);
						}
						
					}
					if(statement != null) {
						try {
							statement.close();	
						} catch(Exception e){
							out.println(e);
						}
						
					}
					if(rs != null) {
						try {
							rs.close();	
						} catch(Exception e){
							out.println(e);
						}
						
					}
					sb.append("本次数据库处理总耗时：" + (System.currentTimeMillis() - start) + " 毫秒!" );
					list.add(sb.toString());
					int size = list.size();
					if( size > 10) {
						list = list.subList(size - 10, size);
					}
					for(int i = list.size() - 1; i != -1; i--){
						out.println(list.get(i));
						out.println("<br/>");
					}
					session.setAttribute("_sinffer_list", list);
					
					out.print("<br/>当前获取的数据源bean的详请：" + ds + "<br/>");
				}
			}
		%>
		<p></p>
		<hr/>
		<span class="title_span">Sniffer tips:</span>
		<ul>
			<li>1. 当前页面提供数据库连接、应用侦测、Spring的BEAN工厂初始化状态侦测</li>
			<li>2. 连接数据库的数据源通过spring的beanFactory获取,保证后台bean初始化的正确性
			<li>3. 点击刷新按钮,将通过数据库连接获取数据库时间</li>
			<li>4. 正常打开状态,页面每60秒会自动刷新一次</li>
			<li>5. 页面中会展示最近10条记录,相关记录后台不保存</li>
		</ul>
	</body>
</html>



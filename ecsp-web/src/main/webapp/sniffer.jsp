<%@ page language="java" import="java.util.*" pageEncoding="GB18030"%>
<%@ page import="java.sql.*" %>

<!-- ��Ҫ����Ӧ���е�����ԴbeanId,����Щ����״̬  -->
<%! static final String CURRENT_DATESOURCE_BEAN_ID  = "serviceDataSource"; %>
<%! static org.springframework.context.ApplicationContext ctx = null; %>

<html>
	<head>
		<title>Ӧ�ü��Sniffer</title>
		<meta http-equiv="pragma" content="no-cache">
		<meta http-equiv="cache-control" content="no-cache">
		<meta http-equiv="expires" content="0">
		<meta http-equiv="Content-Type" content="text/html; charset=GB18030" />
		<meta http-equiv="refresh" content="60">
		<style type="text/css">
			body,a,table,td,th,input,textarea,button,select{ font: 12px/16px Verdana,"����",sans-serif;}
			.btn {
				BORDER-RIGHT: #7b9ebd 1px solid; PADDING-RIGHT: 2px; BORDER-TOP: #7b9ebd 1px solid; PADDING-LEFT: 2px; FONT-SIZE: 16px; font-weight :bold;FILTER: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr=#ffffff, EndColorStr=#cecfde); BORDER-LEFT: #7b9ebd 1px solid; CURSOR: hand; COLOR: black; PADDING-TOP: 2px; BORDER-BOTTOM: #7b9ebd 1px solid
			}
			.title_span {
				font-size: 17; font-weight: bold;
			}
		</style>
	</head>
	<body bgcolor="white">
		<div style="width: 100%; height: 25px;"><span class="title_span" style="margin-right: 30px;">Ӧ�ü����ݿ�״̬���</span>
			<button class="btn" onclick="window.location.reload();">���Ӧ��</button><p/>
		</div>
		<hr/><br/>
		<span class="title_span">״̬:</span><br/>
		<%
			String getDbStatus = request.getParameter("getDbStatus");
			if (!"y".equalsIgnoreCase(getDbStatus)) {
				out.print("<br/>��ǰҳ��������<br/>");
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
					
					// ͨ��Spring bean��ȡ
					ds =  (javax.sql.DataSource)ctx.getBean(CURRENT_DATESOURCE_BEAN_ID);

					conn = ds.getConnection();
					if(conn != null) {
						sb.append("��ȡ���ӳɹ�, �����Ƿ�����:<font style='color:red; weight:bold;'>" + (!conn.isClosed() ? "����" : "�Ͽ�") + "</font>; ");
						statement = conn.createStatement();
						rs = statement.executeQuery("select to_char(sysdate,'yyyy-mm-dd hh24:mi:ss') from dual");
						while(rs.next()){
							sb.append("��ȡ���ݿ�ʱ��:<font style='color:red;'>" +rs.getString(1)+"</font>; ");
						}
					} else{
						sb.append("<font style='color:red;'>ERROR:��ȡʧ�ܣ��������ݿ�!</font><br/>");
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
					sb.append("�������ݿ⴦���ܺ�ʱ��" + (System.currentTimeMillis() - start) + " ����!" );
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
					
					out.print("<br/>��ǰ��ȡ������Դbean�����룺" + ds + "<br/>");
				}
			}
		%>
		<p></p>
		<hr/>
		<span class="title_span">Sniffer tips:</span>
		<ul>
			<li>1. ��ǰҳ���ṩ���ݿ����ӡ�Ӧ����⡢Spring��BEAN������ʼ��״̬���</li>
			<li>2. �������ݿ������Դͨ��spring��beanFactory��ȡ,��֤��̨bean��ʼ������ȷ��
			<li>3. ���ˢ�°�ť,��ͨ�����ݿ����ӻ�ȡ���ݿ�ʱ��</li>
			<li>4. ������״̬,ҳ��ÿ60����Զ�ˢ��һ��</li>
			<li>5. ҳ���л�չʾ���10����¼,��ؼ�¼��̨������</li>
		</ul>
	</body>
</html>



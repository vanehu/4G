<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script type="text/javascript">
	Service.o_roleList = JSON.parse('${roleList}');
</script>
</head>
<body>
<input type="hidden" id="role_list" value="${roleList}" />
	<div class="l-form l-group-bg" id="service_add_page">
		<table width="700px" cellspacing="0" cellpadding="4" border="0">
			<tbody>
			    <tr>
					<td width="100%" colspan="4" align="right">成功保存后关闭对话框：<input style="width: 15px" id="serviceSaveOkClose" type="checkbox" checked="checked" /></td>
				</tr>
				<tr>
					<td width="15%" align="right"><label>*服务名称：</label></td>
					<td width="85%" colspan="3"><input style="max-width: 590px"  type="text" maxlength="100" value="" id="add_serviceName"></td>
				</tr>
				<tr>
					<td width="15%" align="right"><label>服务类路径：</label></td>
					<td width="85%" colspan="3"><input style="max-width: 590px"  type="text" maxlength="100" value="" id="add_classPath"></td>
				</tr>
				<tr>
					<td width="15%" align="right"><label>*访问方式：</label></td>
					<td width="35%">
						<select id="add_visitType" style="max-width: 300px" >
							<option value="D">定义</option>
							<option value="G">通用</option>
						</select>
					</td>
					<td width="15%" align="right"><label>*服务编码：</label></td>
					<td width="35%"><input style="max-width: 300px" type="text" maxlength="64" value="" id="add_serviceCode"></td>
				</tr>
				<tr>
					<td align="right"><label>接口地址：</label></td>
					<td>
						<select id="add_intfId" style="max-width: 300px" >
							<option value="">---请选择---</option>
							<c:forEach var="item"  items="${intfList}">
								<option value="${item.intfId}">${item.intfName}</option>
							</c:forEach>
						</select>
					</td>
					<td align="right"><label>接口方法：</label></td>
					<td><input style="max-width: 300px" type="text" maxlength="64" value="" id="add_methodName"></td>
				</tr>
				<tr>
				    <td align="right"><label>服务包：</label></td>
					<td>
						<select id="add_packId" style="max-width: 300px" >
							<option value="">---请选择---</option>
							<c:forEach var="item"  items="${packList}">
								<option value="${item.packId}">${item.packName}</option>
							</c:forEach>
						</select>
					</td>	
					<td align="right"><label>服务状态：</label></td>
					<td>
						<select id="add_status" style="max-width: 300px" >
							<option value="A">在用</option>
							<option value="N">停用</option>
						</select>
					</td>
				</tr>
				<tr>
				    <td align="right"><label>输出参数类型：</label></td>
					<td>
						<select id="add_outParamType" style="max-width: 300px" >
							<option value="1">原始数据</option>
							<option value="2">转换为JSON</option>
							<option value="3">转换为XML</option>
						</select>
					</td>	
					<td align="right"><label>服务角色：</label></td>
					<td>
						<input style="max-width: 300px" type="text" maxlength="64" value="" id="selRoleList" />
					</td>
				</tr>
				<tr>	
					<td colspan="4">&nbsp;</td>
				</tr>
				<tr>
					<td align="center" colspan="4" width="100%">
						<input type="button" class="l-button l-button-submit" id="btnAddServiceSave" value="保        存">
						<input type="button" value="取        消" class="l-button l-button-submit" id="btnAddServiceCancle">
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</body>
</html>
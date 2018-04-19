<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
	<div class="l-form l-group-bg" id="role_edit_page">
		<table width="350px" cellspacing="0" cellpadding="4" border="0">
			<tbody>
				<tr>
					<td width="20%" align="right"><label>*角色名称：</label></td>
					<td width="70%"><input style="max-width: 300px"  type="text" maxlength="50" value="" id="roleName"></td>
				</tr>
				<tr>
					<td align="right"><label>*角色编码：</label></td>
					<td><input type="text" disabled="disabled"  style="max-width: 300px" value="" maxlength="4" id="roleCode"></td>
				</tr>
				<tr>	
					<td align="right"><label>*平台编码：</label></td>
					<td>
						<select id="usePortal" style="max-width: 300px">
							<c:forEach var="item"  items="${list}">
								<option value="${item.portalCode}">[${item.portalCode}]${item.portalName}</option>
							</c:forEach>
						</select>
					</td>
				</tr>
				<tr>	
					<td align="right"><label>*角色状态：</label></td>
					<td>
						<select id="status" style="max-width: 300px" >
							<option value="A">在用</option>
							<option value="N">停用</option>
						</select>
					</td>
				</tr>
				<tr>	
					<td colspan="2"  >&nbsp;</td>
				</tr>
				<tr>
					<td align="center" colspan="2" width="100%">
						<input type="button" class="l-button l-button-submit" id="btnEditRoleSave" value="修      改">
						<input type="button" value="取        消" class="l-button l-button-submit" id="btnEditRoleCancle">
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</body>
</html>
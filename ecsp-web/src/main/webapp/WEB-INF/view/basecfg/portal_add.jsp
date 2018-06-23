<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
	<div class="l-form l-group-bg" id="portal_add_page">
		<table width="350px" cellspacing="0" cellpadding="4" border="0">
			<tbody>
			  <tr>
					<td width="100%" colspan="2" align="right">成功保存后关闭对话框：<input style="width: 15px" id="portalSaveOkClose" type="checkbox" checked="checked" /></td>
				</tr>
				<tr>
					<td width="20%" align="right"><label>*平台名称：</label></td>
					<td width="70%"><input style="max-width: 300px"  type="text" maxlength="50" value="" id="portalName"></td>
				</tr>
				<tr>
					<td align="right"><label>*平台编码：</label></td>
					<td><input type="text" style="max-width: 300px" value="" maxlength="4" id="portalCode"></td>
				</tr>
				<tr>	
					<td align="right"><label>*平台密码：</label></td>
					<td><input type="text" style="max-width: 300px" maxlength="10" value="" id="password"></td>
				</tr>
				<tr>	
					<td align="right"><label>*平台状态：</label></td>
					<td>
						<select id="status" style="max-width: 300px" >
							<option selected="selected" value="A">在用</option>
							<option value="N">停用</option>
						</select>
					</td>
				</tr>
				<tr>	
					<td colspan="2"  >&nbsp;</td>
				</tr>
				<tr>
					<td align="center" colspan="2" width="100%">
						<input type="button" class="l-button l-button-submit" id="btnAddPortalSave" value="保        存">
						<input type="button" value="取        消" class="l-button l-button-submit" id="btnAddPortalCancle">
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</body>
</html>
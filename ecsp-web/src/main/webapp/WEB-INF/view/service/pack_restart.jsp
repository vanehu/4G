<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
	<div class="l-form l-group-bg" id="portal_edit_page">
		<table width="350px" cellspacing="0" cellpadding="4" border="0">
			<tbody>
				<tr>
					<td width="25%" align="right"><label>*IP地址：</label></td>
					<td width="70%"><input style="max-width: 300px"  type="text" maxlength="32" value="127.0.0.1" id="addr_ip"></td>
				</tr>
				<tr>
					<td width="20%" align="right"><label>*端口：</label></td>
					<td width="70%"><input style="max-width: 300px" type="text" maxlength="64" value="8887" id="addr_port"></td>
				</tr>
				<tr>	
					<td colspan="2"  >&nbsp;</td>
				</tr>
				<tr>
					<td align="center" colspan="2" width="100%">
						<input type="button" class="l-button l-button-submit" id="btnRestartPack" value="重        启">
						<input type="button" value="取        消" class="l-button l-button-submit" id="btnPackCancle">
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</body>
</html>
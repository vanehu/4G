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
					<td width="25%" align="right"><label>*服务包名称：</label></td>
					<td width="70%"><input style="max-width: 300px"  type="text" maxlength="32" value="" id="packName"></td>
				</tr>
				<tr>
					<td width="20%" align="right"><label>*服务包编码：</label></td>
					<td width="70%"><input style="max-width: 300px" type="text" maxlength="64" value="" id="packCode"></td>
				</tr>
				<tr>	
					<td align="right"><label>服务包状态：</label></td>
					<td>
						<select id="status" style="max-width: 300px" >
							<option value="A">在用</option>
							<option value="N">停用</option>
						</select>
					</td>
				</tr>
				<tr>
					<td align="right"><label>*服务包地址：</label></td>
					<td><textarea rows="2" style="max-width: 300px;min-height:30px" cols="64"  maxlength="511"  id="packPath">/</textarea></td>
				</tr>
				<tr>	
					<td colspan="2"  >&nbsp;</td>
				</tr>
				<tr>
					<td align="center" colspan="2" width="100%">
						<input type="button" class="l-button l-button-submit" id="btnEditPackSave" value="保        存">
						<input type="button" value="取        消" class="l-button l-button-submit" id="btnEditPackCancle">
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</body>
</html>
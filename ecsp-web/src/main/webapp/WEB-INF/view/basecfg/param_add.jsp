<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
	<div class="l-form l-group-bg" id="param_add_page">
		<table width="100%" cellspacing="0" cellpadding="4" border="0">
			<tbody>
			  <tr>
					<td width="100%" colspan="2" align="right">成功保存后关闭对话框：<input style="width: 15px" id="paramSaveOkClose" type="checkbox" checked="checked" /></td>
				</tr>
				<tr>
					<td width="20%" align="right"><label>参数名称：</label></td>
					<td width="70%"><input style="max-width: 300px"  type="text" value="" id="paramName"></td>
				</tr>
				<tr>
					<td align="right"><label>*参数编码：</label></td>
					<td><input type="text" style="max-width: 300px" value="" id="paramCode"></td>
				</tr>
				<tr>	
					<td align="right"><label>*参数数值：</label></td>
					<td><input type="text" style="max-width: 300px" value="" id="paramValue"></td>
				</tr>
				<tr>	
					<td align="right"><label>参数描述：</label></td>
					<td><textarea rows="3" style="max-width: 300px" cols="64"  id="paramDesc"></textarea></td>
				</tr>
				<tr>
					<td align="center" colspan="2" width="100%">
						<input type="button" class="l-button l-button-submit" id="btnAddParamSave" value="保        存">
						<input type="button" value="取        消" class="l-button l-button-submit" id="btnAddParamCancle">
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</body>
</html>
package com.linkage.portal.service.lte.protocols;



import java.util.List;

import freemarker.template.TemplateMethodModel;
import freemarker.template.TemplateModelException;

/**
 * 横向接口结果码转换
 * 
 * @author xuj
 * 
 */
public class TransResCodeMethod implements TemplateMethodModel {

	@SuppressWarnings("unchecked")
	public Object exec(List args) throws TemplateModelException {
		String resultCode = args.get(0).toString();
		String code = "";
		if ("0000".equals(resultCode)){
			code = "POR-0000";
		}else{
			code = "POR-2004";
		}
		return code;
	}
}

package com.linkage.portal.service.lte.protocols;



import java.util.List;

import freemarker.template.TemplateMethodModel;
import freemarker.template.TemplateModelException;
/**
 * 判断是否是数字
 * 
 * @author xuj
 * 
 */
public class CheckIsNumberMethod implements TemplateMethodModel {

	@SuppressWarnings("unchecked")
	public Object exec(List args) throws TemplateModelException {
		String str = args.get(0).toString();
		String code = "";
		for (int i = str.length(); --i >= 0;) {
			if (!Character.isDigit(str.charAt(i))) {
				return false;
			}			
		}
		return true;
	}

}

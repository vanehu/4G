package com.linkage.portal.service.lte.protocols;



import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import freemarker.template.TemplateMethodModel;
import freemarker.template.TemplateModelException;

/**
 * 根 据传入的Id生成订单内部唯一 编码
 * 
 * @author xuj
 * 
 */
public class CreateInstIdMethod implements TemplateMethodModel {

	@SuppressWarnings("unchecked")
	public Object exec(List args) throws TemplateModelException {
		String id = args.get(0).toString();
		if (id.length() < 4) {
			id = id + subZeroAndDot(String.valueOf(Math.abs(Float.valueOf(id) * 1000)));
		}
		String instId = id.substring(id.length() - 4, id.length())
				+ id.substring(0, 4);
		return instId;
	}
	/**
	 * 使用java正则表达式去掉多余的.与0
	 * 
	 * @param s
	 * @return
	 */
	public static String subZeroAndDot(String s) {
		if (s.indexOf(".") > 0) {
			s = s.replaceAll("0+?$", "");// 去掉多余的0
			s = s.replaceAll("[.]$", "");// 如最后一位是.则去掉
		}
		return s;
	}
}

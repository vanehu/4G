package com.linkage.portal.service.lte.protocols;



import java.util.List;

import freemarker.template.TemplateMethodModel;
import freemarker.template.TemplateModelException;

/**
 * 根 据传入的Id生成订单内部唯一 编码
 * 
 * @author xuj
 * 
 */
public class GenerateDstSysIDMethod implements TemplateMethodModel {

	@SuppressWarnings("unchecked")
	public Object exec(List args) throws TemplateModelException {
		String dstOrgID = args.get(0).toString();
		String dstSysID = SrcCRMSystemCode.getValue(dstOrgID);
		return dstSysID;
	}
}

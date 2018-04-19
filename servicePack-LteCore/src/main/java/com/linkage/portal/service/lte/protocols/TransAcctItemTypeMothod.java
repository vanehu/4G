package com.linkage.portal.service.lte.protocols;



import java.util.List;

import freemarker.template.TemplateMethodModel;
import freemarker.template.TemplateModelException;
/**
 * 判断费用类型
 * @author guiwh
 *
 */
public class TransAcctItemTypeMothod implements TemplateMethodModel {

	@SuppressWarnings("unchecked")
	public Object exec(List args) throws TemplateModelException {
		String acctItemTypeId = args.get(0).toString();
		String acctItemName = "";
		if("2007000".equals(acctItemTypeId)) {
			acctItemName = "终端代收费";
		}else if ("2080001".equals(acctItemTypeId)){
			acctItemName = "话费预存款";
		}else if ("2080002".equals(acctItemTypeId)){
			acctItemName = "合约预存款 ";
		}else if ("2090000".equals(acctItemTypeId)){
			acctItemName = "终端补贴金额";
		}else if ("2091000".equals(acctItemTypeId)){
			acctItemName = "赠送话费额";
		}else if("2016000".equals(acctItemTypeId)){
			acctItemName = "违约金";
		}
		else{
			acctItemName = "其它";
		}
		return acctItemName;
	}

}

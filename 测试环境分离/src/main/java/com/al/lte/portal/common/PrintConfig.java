package com.al.lte.portal.common;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrintConfig {
	private static Logger log = LoggerFactory.getLogger(PrintConfig.class);
	private static Map<String,PrintTemp> printTempMap = new HashMap<String,PrintTemp>();
	static{
		printTempMap.put("100000", new PrintTemp("集团", "invoice.htm", "template.htm"));// 集团         
		printTempMap.put("100001", new PrintTemp("集团", "invoice.htm", "template.htm"));// CRM枢纽      
		printTempMap.put("600101", new PrintTemp("广东", "invoice.htm", "template.htm"));// 广东         
		printTempMap.put("600102", new PrintTemp("上海", "invoice.htm", "template.htm"));// 上海         
		printTempMap.put("600103", new PrintTemp("江苏", "invoice_js.htm", "template_js.htm"));// 江苏         
		printTempMap.put("600104", new PrintTemp("浙江", "invoice.htm", "template.htm"));// 浙江         
		printTempMap.put("600105", new PrintTemp("福建", "invoice.htm", "template.htm"));// 福建         
		printTempMap.put("600201", new PrintTemp("四川", "invoice.htm", "template.htm"));// 四川         
		printTempMap.put("600202", new PrintTemp("湖北", "invoice.htm", "template.htm"));// 湖北         
		printTempMap.put("600203", new PrintTemp("湖南", "invoice.htm", "template.htm"));// 湖南         
		printTempMap.put("600204", new PrintTemp("陕西", "invoice.htm", "template.htm"));// 陕西         
		printTempMap.put("600205", new PrintTemp("云南", "invoice.htm", "template.htm"));// 云南         
		printTempMap.put("600301", new PrintTemp("安徽", "invoice.htm", "template.htm"));// 安徽         
		printTempMap.put("600302", new PrintTemp("广西", "invoice.htm", "template.htm"));// 广西         
		printTempMap.put("600303", new PrintTemp("新疆", "invoice.htm", "template.htm"));// 新疆         
		printTempMap.put("600304", new PrintTemp("重庆", "invoice.htm", "template.htm"));// 重庆         
		printTempMap.put("600305", new PrintTemp("江西", "invoice.htm", "template.htm"));// 江西         
		printTempMap.put("600401", new PrintTemp("甘肃", "invoice.htm", "template.htm"));// 甘肃         
		printTempMap.put("600402", new PrintTemp("贵州", "invoice.htm", "template.htm"));// 贵州         
		printTempMap.put("600403", new PrintTemp("海南", "invoice.htm", "template.htm"));// 海南         
		printTempMap.put("600404", new PrintTemp("宁夏", "invoice.htm", "template.htm"));// 宁夏         
		printTempMap.put("600405", new PrintTemp("青海", "invoice.htm", "template.htm"));// 青海         
		printTempMap.put("600406", new PrintTemp("西藏", "invoice.htm", "template.htm"));// 西藏         
		printTempMap.put("609001", new PrintTemp("北京", "invoice.htm", "template.htm"));// 北京         
		printTempMap.put("609001", new PrintTemp("北京", "invoice.htm", "template.htm"));// 北京         
		printTempMap.put("609801", new PrintTemp("港、澳、台", "invoice.htm", "template.htm"));// 港、澳、台   
		printTempMap.put("609902", new PrintTemp("天津", "invoice.htm", "template.htm"));// 天津         
		printTempMap.put("609903", new PrintTemp("山东", "invoice.htm", "template.htm"));// 山东         
		printTempMap.put("609904", new PrintTemp("河南", "invoice.htm", "template.htm"));// 河南         
		printTempMap.put("609905", new PrintTemp("辽宁", "invoice.htm", "template.htm"));// 辽宁         
		printTempMap.put("609906", new PrintTemp("河北", "invoice.htm", "template.htm"));// 河北         
		printTempMap.put("609907", new PrintTemp("山西", "invoice.htm", "template.htm"));// 山西         
		printTempMap.put("609908", new PrintTemp("内蒙古", "invoice.htm", "template.htm"));// 内蒙古       
		printTempMap.put("609909", new PrintTemp("吉林", "invoice.htm", "template.htm"));// 吉林         
		printTempMap.put("609910", new PrintTemp("黑龙江", "invoice.htm", "template.htm"));// 黑龙江  
	}
	
	public static String getReceipt(String provinceCode){
		PrintTemp t = printTempMap.get(provinceCode);
		if(t==null){
			log.info("获取回执模板错误，返回默认模板template.htm");
			return "template.htm";
		}
		return t.getReceipt();
	}
	
	public static String getInvoice(String provinceCode){
		PrintTemp t =  printTempMap.get(provinceCode);
		if(t==null){
			log.info("获取发票模板错误，返回默认模板invoice.htm");
			return "invoice.htm";
		}
		return printTempMap.get(provinceCode).getInvoice();
	}
	
	public static String getProvince(String provinceCode){
		PrintTemp t =  printTempMap.get(provinceCode);
		if(t==null){
			log.info("获取省份错误，返回默认值：集团");
			return "集团";
		}
		return  printTempMap.get(provinceCode).getProvinceName();
	}
	
	
	protected static class PrintTemp{
		private String invoice;
		private String receipt;
		private String provinceName;
		
		public PrintTemp(String provinceName,String invoice,String receipt){
			this.provinceName = provinceName;
			this.invoice = invoice;
			this.receipt = receipt;
		}
		
		public String getInvoice() {
			return invoice;
		}
		public void setInvoice(String invoice) {
			this.invoice = invoice;
		}
		public String getReceipt() {
			return receipt;
		}
		public void setReceipt(String receipt) {
			this.receipt = receipt;
		}
		public String getProvinceName() {
			return provinceName;
		}
		public void setProvinceName(String provinceName) {
			this.provinceName = provinceName;
		}
		
	}
}

package com.al.lte.portal.common.print.bill;

/**
 * 客户化账单dto
 * @author neil
 *
 */
public class CustomizeBill {

	/**
	 * 业务级的结果代码
	 */
	public int serviceResultCode;
	
	/**
	 * 错误描述（出错时填写）
	 */
	public String paraFieldResult;
	
	/**
	 * 帐单类信息组
	 */
	public BillFormatInfo billFormatInfo;

	public int getServiceResultCode() {
		return serviceResultCode;
	}

	public void setServiceResultCode(int serviceResultCode) {
		this.serviceResultCode = serviceResultCode;
	}

	public String getParaFieldResult() {
		return paraFieldResult;
	}

	public void setParaFieldResult(String paraFieldResult) {
		this.paraFieldResult = paraFieldResult;
	}

	public BillFormatInfo getBillFormatInfo() {
		return billFormatInfo;
	}

	public void setBillFormatInfo(BillFormatInfo billFormatInfo) {
		this.billFormatInfo = billFormatInfo;
	}
}

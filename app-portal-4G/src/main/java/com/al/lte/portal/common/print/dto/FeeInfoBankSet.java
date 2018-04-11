package com.al.lte.portal.common.print.dto;
/**
 * 公用信息－费用信息银行信息
 * @author zhangzc
 *
 */
public class FeeInfoBankSet {
	private String bankName;
	private String bankCustName;
	private String bankNumber;
	public String getBankName() {
		return bankName;
	}
	public void setBankName(String bankName) {
		this.bankName = bankName;
	}
	public String getBankCustName() {
		return bankCustName;
	}
	public void setBankCustName(String bankCustName) {
		this.bankCustName = bankCustName;
	}
	public String getBankNumber() {
		return bankNumber;
	}
	public void setBankNumber(String bankNumber) {
		this.bankNumber = bankNumber;
	}
}

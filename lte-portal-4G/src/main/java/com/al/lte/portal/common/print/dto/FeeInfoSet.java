package com.al.lte.portal.common.print.dto;

import java.util.List;

/**
 * 公用信息－费用信息
 * @author zhangzc
 *
 */
public class FeeInfoSet {
	private List<FeeInfoTitleSet> feeInfoTitles;
	private List<FeeInfoAPNSet> acctPayNumbers;
	private List<FeeInfoBankSet> feeInfoBanks;
	private List<FeeInfoRANSet> relaAcceNbrs;
	private List<StringBeanSet> relaAcctInfos;
	public List<FeeInfoTitleSet> getFeeInfoTitles() {
		return feeInfoTitles;
	}
	public void setFeeInfoTitles(List<FeeInfoTitleSet> feeInfoTitles) {
		this.feeInfoTitles = feeInfoTitles;
	}
	public List<FeeInfoAPNSet> getAcctPayNumbers() {
		return acctPayNumbers;
	}
	public void setAcctPayNumbers(List<FeeInfoAPNSet> acctPayNumbers) {
		this.acctPayNumbers = acctPayNumbers;
	}
	public List<FeeInfoBankSet> getFeeInfoBanks() {
		return feeInfoBanks;
	}
	public void setFeeInfoBanks(List<FeeInfoBankSet> feeInfoBanks) {
		this.feeInfoBanks = feeInfoBanks;
	}
	public List<FeeInfoRANSet> getRelaAcceNbrs() {
		return relaAcceNbrs;
	}
	public void setRelaAcceNbrs(List<FeeInfoRANSet> relaAcceNbrs) {
		this.relaAcceNbrs = relaAcceNbrs;
	}
	public List<StringBeanSet> getRelaAcctInfos() {
		return relaAcctInfos;
	}
	public void setRelaAcctInfos(List<StringBeanSet> relaAcctInfos) {
		this.relaAcctInfos = relaAcctInfos;
	}
}

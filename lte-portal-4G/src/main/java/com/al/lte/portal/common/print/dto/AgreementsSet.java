package com.al.lte.portal.common.print.dto;

import java.util.List;

public class AgreementsSet {
	private List<AgreementIphoneSet> iphoneAgreements;
	private List<AgreementSpeNbrSet> speNbrAgreements;
	private List<AgreementTerminalSet> terminalAgreements;
	private List<String> businessAgreements;
	public List<AgreementIphoneSet> getIphoneAgreements() {
		return iphoneAgreements;
	}
	public void setIphoneAgreements(List<AgreementIphoneSet> iphoneAgreements) {
		this.iphoneAgreements = iphoneAgreements;
	}
	public List<AgreementSpeNbrSet> getSpeNbrAgreements() {
		return speNbrAgreements;
	}
	public void setSpeNbrAgreements(List<AgreementSpeNbrSet> speNbrAgreements) {
		this.speNbrAgreements = speNbrAgreements;
	}
	public List<AgreementTerminalSet> getTerminalAgreements() {
		return terminalAgreements;
	}
	public void setTerminalAgreements(List<AgreementTerminalSet> terminalAgreements) {
		this.terminalAgreements = terminalAgreements;
	}
	public List<String> getBusinessAgreements() {
		return businessAgreements;
	}
	public void setBusinessAgreements(List<String> businessAgreements) {
		this.businessAgreements = businessAgreements;
	}
}

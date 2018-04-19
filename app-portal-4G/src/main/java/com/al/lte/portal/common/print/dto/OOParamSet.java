package com.al.lte.portal.common.print.dto;

import java.util.List;
/**
 * 个人定制套餐详情
 *
 */
public class OOParamSet {
	private List<StringBeanSet> ooParamTitle;
	private List<StringBeanSet> flowTitle;
	private List<StringBeanSet> voiceTitle;
	private List<StringBeanSet> messageTitle;
	
	public void setOoParamTitle(List<StringBeanSet> ooParamTitle) {
		this.ooParamTitle = ooParamTitle;
	}

	public List<StringBeanSet> getOoParamTitle() {
		return ooParamTitle;
	}

	public void setFlowTitle(List<StringBeanSet> flowTitle) {
		this.flowTitle = flowTitle;
	}

	public List<StringBeanSet> getFlowTitle() {
		return flowTitle;
	}

	public void setVoiceTitle(List<StringBeanSet> voiceTitle) {
		this.voiceTitle = voiceTitle;
	}

	public List<StringBeanSet> getVoiceTitle() {
		return voiceTitle;
	}

	public void setMessageTitle(List<StringBeanSet> messageTitle) {
		this.messageTitle = messageTitle;
	}

	public List<StringBeanSet> getMessageTitle() {
		return messageTitle;
	}

}

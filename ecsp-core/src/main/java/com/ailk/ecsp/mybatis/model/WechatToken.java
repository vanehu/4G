package com.ailk.ecsp.mybatis.model;

import java.util.Date;

public class WechatToken {   
	
	private Long   tokenId      ;       
	private String   accessToken  ;       
	private String   userNbr      ;       
	private String   openId       ;       
	private String   reqUrl       ;       
	private String   channelId    ;       
	private Date     createTime   ;       
	private String   timestamp     ;       
	private String   isExpired    ;
	
	public Long getTokenId() {
		return tokenId;
	}
	public void setTokenId(Long tokenId) {
		this.tokenId = tokenId;
	}
	public String getAccessToken() {
		return accessToken;
	}
	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}
	public String getUserNbr() {
		return userNbr;
	}
	public void setUserNbr(String userNbr) {
		this.userNbr = userNbr;
	}
	public String getOpenId() {
		return openId;
	}
	public void setOpenId(String openId) {
		this.openId = openId;
	}
	public String getReqUrl() {
		return reqUrl;
	}
	public void setReqUrl(String reqUrl) {
		this.reqUrl = reqUrl;
	}
	public String getChannelId() {
		return channelId;
	}
	public void setChannelId(String channelId) {
		this.channelId = channelId;
	}
	public Date getCreateTime() {
		return createTime;
	}
	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}
	public String getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}
	public String getIsExpired() {
		return isExpired;
	}
	public void setIsExpired(String isExpired) {
		this.isExpired = isExpired;
	}       
}

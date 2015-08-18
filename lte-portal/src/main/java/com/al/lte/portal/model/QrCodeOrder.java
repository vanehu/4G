package com.al.lte.portal.model;

import java.util.HashMap;

import com.al.ecs.common.util.JsonUtil;

/**
 * 二维码实体对象数据
 * @author tang
 *
 */
public class QrCodeOrder extends HashMap<String, Object>{
	private static final long serialVersionUID = -5983156818198061980L;
	/** 
	 * 订单编码  
	 * */
	public void putNO(String no){
		if(no!=null)put("NO",no);
	}
	/** 
	 * 门店编码  
	 * */
	public void putSN(String sn){
		if(sn!=null)put("SN",sn);
	}
	/** 
	 * 受理时间 
	 * */
	public void putDP(String dp){
		if(dp!=null)put("DP",dp);
	}
	/** 
	 * 客户名称 
	 * */
	public void putLN(String ln){
		if(ln!=null)put("LN",ln);
	}
	/** 
	 * 客户类型
	 *  默认 个人
	 *  */
	public void putCT(String ct){
		if(ct!=null)put("CT",ct);
	}
	public void putCT(){
		putCT("个人");
	}
	
	/** 
	 * 订单类型
	 *  默认 New
	 *  */
	public void putAT(String at){
		if(at!=null)put("AT",at);
	}
	public void putAT(){
		putAT("New");
	}
	
	/** 
	 * 帐户号
	 *  */
	public void putBN(String bn){
		if(bn!=null)put("BN",bn);
	}
	/** 
	 * 业务号码
	 *  */
	public void putTN(String tn){
		if(tn!=null)put("TN",tn);
	}
	/** 
	 * 终端串码
	 *  */
	public void putIM(String im){
		if(im!=null)put("IM",im);
	}
	/** 
	 * ICCID
	 *  */
	public void putIC(String ic){
		if(ic!=null)put("IC",ic);
	}
	
	/** 
	 * 合约编码
	 *  */
	public void putVP(String vp){
		if(vp!=null)put("VP",vp);
	}
	
	/** 
	 * 合约主套餐名称
	 *  */
	public void putVD(String vd){
		if(vd!=null)put("VD",vd);
	}

	/** 
	 * 合约基本话费
	 *  */
	public void putVM(String vm){
		if(vm!=null)put("VM",vm);
	}
	
	/** 
	 * 合约计划周期
	 *  */
	public void putTE(String te){
		if(te!=null)put("TE",te);
	}
	
	/** 
	 * 预付费
	 *  */
	public void putPP(String pp){
		if(pp!=null)put("PP",pp);
	}
	/** 
	 * 预付费:pre
	 *  */
	public void putPP(){
		putPP("Pre");
	}
	
	/** 
	 * 存费送机为：Y，购机送费：N
	 *  */
	public void putSU(String su){
		if(su!=null)put("SU",su);
	}
	
	/** 
	 * 手机价格
	 *  */
	public void putPR(Float pr){
		if(pr!=null)put("PR",pr);
	}

	/** 
	 * 设备折扣
	 *  */
	public void putDI(Float di){
		if(di!=null)put("DI",di);
	}
	
	/** 
	 * 现金预存金额
	 *  */
	public void putCP(Float cp){
		if(cp!=null)put("CP",cp);
	}
	
	/** 
	 * 合约预存金额
	 *  */
	public void putHP(Float hp){
		if(hp!=null)put("HP",hp);
	}
	
	/** 
	 * 合约价
	 *  */
	public void putCM(Float cm){
		if(cm!=null)put("CM",cm);
	}
	
	/** 
	 * 订单总金额
	 *  */
	public void putTM(Float tm){
		if(tm!=null)put("TM",tm);
	}
	
	/** 
	 * 币单位
	 *  */
	public void putCU(String cu){
		if(cu!=null)put("CU",cu);
	}

	{
		 putCU("RMB");
	}
	public static void main(String[] args){
		QrCodeOrder qc=new QrCodeOrder();
		qc.putNO("10000000662013031159197249841");
		qc.putSN("SHOP213213");
		System.out.println(JsonUtil.toStringNonNull(qc));
	}

}

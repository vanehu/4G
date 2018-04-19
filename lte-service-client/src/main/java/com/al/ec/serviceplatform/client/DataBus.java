package com.al.ec.serviceplatform.client;

import java.util.Map;

/**
 * =========================================================
 * 亚信联创 电信CRM研发部
 * @author 李茂君
 * @date 2011-4-22 下午04:22:49
 * @Description: TODO(数据总线)
 * @version V1.0
 * =========================================================
 * update date                update author     Description
 * 2011-4-22                    李茂君                            创建文件
 */
public class DataBus implements Cloneable {

    /**
     * 门户ID
     */
    private String portalCode;
    /**
     * 门户密码
     */
    private String password;
    /**
     * 角色ID
     */
    private String roleCode;
    /**
     * 调用服务ID
     */
    private String serviceCode;
    /**
     * 操作号码(包括 各种产品号码,登陆号码等)
     */
    private String operater;
    /**
     * 操作号码所属地区
     */
    private String operaterArea;
    /**
     * 操作号码类型
     */
    private String operaterType;

    /**
     * 省份标识
     */
    private String provinceCode;
    /**
     * 操作员所属渠道
     */
    private String operatChannel;
    /**
    * 操作员所属渠道名称
    */
    private String operatChannelName;
    /**
     * 操作员工号编码
     */
    private String operatStaff;
    /**
     * 操作员ID
     */
    private String operatStaffID;
    /**
     * 操作员名称
     */
    private String operatStaffName;
    /**
     * 操作结果
     */
    private String resultCode;
    /**
     * 返回信息
     */
    private String resultMsg;

    /**
     * 业务流水
     */
    private String busiFlowId;
    /**
     *  测试类型(不填写表示取实际结果。填写预期的结果码取对应的配置数据)
     */
    private String debugCode;
    /**
     * 服务参数
     */
    private Map<String, Object> parammap;
    /**
     * 返回参数
     */
    private Map<String, Object> returnlmap;
    
    private String inIntParam;
    
    private String outIntParam;

    public String getPortalCode() {
        return portalCode;
    }

    public void setPortalCode(String portalCode) {
        this.portalCode = portalCode;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRoleCode() {
        return roleCode;
    }

    public void setRoleCode(String roleCode) {
        this.roleCode = roleCode;
    }

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode;
    }

    public String getOperater() {
        return operater;
    }

    public void setOperater(String operater) {
        this.operater = operater;
    }

    public String getOperaterArea() {
        return operaterArea;
    }

    public void setOperaterArea(String operaterArea) {
        this.operaterArea = operaterArea;
    }

    public String getOperaterType() {
        return operaterType;
    }

    public void setOperaterType(String operaterType) {
        this.operaterType = operaterType;
    }

    public String getOperatChannel() {
        return operatChannel;
    }

    public void setOperatChannel(String operatChannel) {
        this.operatChannel = operatChannel;
    }

    public String getOperatStaff() {
        return operatStaff;
    }

    public void setOperatStaff(String operatStaff) {
        this.operatStaff = operatStaff;
    }

    public String getResultCode() {
        return resultCode;
    }

    public void setResultCode(String resultCode) {
        this.resultCode = resultCode;
    }

    public String getResultMsg() {
        return resultMsg;
    }

    public void setResultMsg(String resultMsg) {
        this.resultMsg = resultMsg;
    }

    public String getBusiFlowId() {
        return busiFlowId;
    }

    public void setBusiFlowId(String busiFlowId) {
        this.busiFlowId = busiFlowId;
    }

    public String getDebugCode() {
        return debugCode;
    }

    public void setDebugCode(String debugCode) {
        this.debugCode = debugCode;
    }

    public Map<String, Object> getParammap() {
        return parammap;
    }

    public void setParammap(Map<String, Object> parammap) {
        this.parammap = parammap;
    }

    public Map<String, Object> getReturnlmap() {
        return returnlmap;
    }

    public void setReturnlmap(Map<String, Object> returnlmap) {
        this.returnlmap = returnlmap;
    }

    public String getOperatChannelName() {
        return operatChannelName;
    }

    public void setOperatChannelName(String operatChannelName) {
        this.operatChannelName = operatChannelName;
    }

    public String getOperatStaffID() {
        return operatStaffID;
    }

    public void setOperatStaffID(String operatStaffID) {
        this.operatStaffID = operatStaffID;
    }

    /**
     * 克隆本类简单对象，复杂对象置空
     */
    @Override
    public DataBus clone() {

        DataBus dataBus = new DataBus();
        try {

            dataBus = (DataBus) super.clone();
            dataBus.setParammap(null);
            dataBus.setReturnlmap(null);

        } catch (CloneNotSupportedException e) {
            return null;
        }
        return dataBus;
    }

    public String getProvinceCode() {
        return provinceCode;
    }

    public void setProvinceCode(String provinceCode) {
        this.provinceCode = provinceCode;
    }

    public String getOperatStaffName() {
        return operatStaffName;
    }

    public void setOperatStaffName(String operatStaffName) {
        this.operatStaffName = operatStaffName;
    }
    
    public String getInIntParam() {
		return inIntParam;
	}

	public void setInIntParam(String inIntParam) {
		this.inIntParam = inIntParam;
	}
    
	public String getOutIntParam() {
		return outIntParam;
	}

	public void setOutIntParam(String outIntParam) {
		this.outIntParam = outIntParam;
	}

}

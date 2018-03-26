package com.al.lte.portal.model;

public enum QRCode {
	SUCCESS(100,"二维码扫描登录成功."),
    NOSTART(101,"二维码未扫描,请登录手机客户端进行扫描!"),
    STARTED(102,"二维码已扫描,请从手机客户端确认授权登录!"),
    INVALID(103,"二维码失效,请重新刷新二维码!");
    
    int code;  
    String msg;
    
    QRCode(int code,String msg){
        this.code=code;
        this.msg=msg;
    }
    
    public int getCode() {
        return code;
    }
   
    public String getMsg() {
        return msg;
    }
}

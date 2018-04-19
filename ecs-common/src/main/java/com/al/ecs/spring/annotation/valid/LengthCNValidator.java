/**********************************************************
 * Copyright © 2012，联创亚信科技(南京)有限公司
 * All Rights Reserved.
 *
 * 文件名称： LengthCNValidator.java
 * 摘    要： 中文长度最大最小值验证器
 *
 * 初始版本：1.0.0
 * 原 作 者：liusd
 * 完成日期：2012-2-20
 *
 ************************************************************/

package com.al.ecs.spring.annotation.valid;

import java.io.UnsupportedEncodingException;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.al.ecs.spring.annotation.valid.LengthCN.CharSet;

/**
 *  中文长度最大最小值验证器.<br/> <table>
 * <tr>
 * <td>负责人/principal: </td>
 * <td colspan="2">liusd</td>
 * <tr>
 * <td>修改记录/revision:</td>
 * <td colspan="2"></td>
 * </tr>
 * <tr>
 * <td>日期:</td>
 * <td>修改人:</td>
 * <td>修改说明:</td>
 * </tr>
 * </table>
 * @author liusd
 * @version V1.0 2012-2-20 上午11:17:26
 */

public class LengthCNValidator implements ConstraintValidator<LengthCN, String> {

    private int min = -1;

    private int max = -1;

    private CharSet charSet;


    public void initialize(LengthCN constraintAnnotation) {
        this.min = constraintAnnotation.min();
        this.max = constraintAnnotation.max();
        this.charSet = constraintAnnotation.charSet();
    }

  
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        //只要有设置其中一个值进入判断,否则返回正确
        if (this.min != -1 || this.max != -1) {
            try {
                byte[] val = null;
                //获取字符集设置，默认为GBK
                if (this.charSet == CharSet.UTF8) {
                    val = value.getBytes("UTF-8");
                } else if (this.charSet == CharSet.GBK) {
                    val = value.getBytes("GBK");
                } else if (this.charSet == CharSet.GB2312) {
                    val = value.getBytes("GB2312");
                } else if (this.charSet == CharSet.GB18030) {
                    val = value.getBytes("GB18030");
                } else {
                    val = value.getBytes("GBK");
                }
                //输入min时
                if(this.max==0 && this.min > 0){
                	return val.length >= this.min;
                //输入max时
                } else  if(this.max > 0 && this.min == 0){
                	return val.length <= this.max;
                //否则都有
                } else {
                	return val.length >= this.min && val.length <= this.max;
                }
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
                return false;
            }
        } else {
            return true;
        }
    }
}

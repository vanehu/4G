/**********************************************************
 * Copyright © 2012，联创亚信科技(南京)有限公司
 * All Rights Reserved.
 *
 * 文件名称： LengthCN.java
 * 摘    要： 扩展hibernate validator 对中文长度验证,解决对中文验证的缺陷
 * （对有包括中文的字符串，所取得的长度不符合oracle中要求的长度。）
 *
 * 初始版本：1.0.0
 * 原 作 者：liusd
 * 完成日期：2012-2-20
 *
 ************************************************************/

package com.al.ecs.spring.annotation.valid;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

/**
 * 扩展hibernate validator 对中文长度验证.<br/> <table>
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
 * @version V1.0 2012-2-20 上午11:10:44
 */
@Target(value = { ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = LengthCNValidator.class)
@Documented
public @interface LengthCN {

    String message() default "字段长度不能超出设置的范围";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    CharSet charSet() default CharSet.UTF8;

    int min() default 0;

    int max() default 0;

    /**
     * 字符集选择
     * 
     */
    public enum CharSet {
        UTF8, GBK, GB2312, GB18030
    }
}

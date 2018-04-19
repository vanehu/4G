/**********************************************************
 * Copyright © 2012，联创亚信科技(南京)有限公司
 * All Rights Reserved.
 *
 * 文件名称： ProductTx.java
 * 摘    要：商品管理事务管理扩展
 *
 * 初始版本：1.0.0
 * 原 作 者：liusd
 * 完成日期：2012-2-13
 *
 * 当前版本：$LastChangedRevision$
 * 作    者：$LastChangedBy$
 * 完成日期：$LastChnagedDate$
 ************************************************************/

package com.al.ecs.spring.annotation.transactional;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.al.ecs.exception.BusinessException;

/**
 * 商品管理事务管理扩展.<br/>
 * <table>
 * <tr>
 * <td>负责人/principal:</td>
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
 * @version $Id$
 */
@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Transactional(isolation = Isolation.READ_COMMITTED, propagation = Propagation.REQUIRED,
rollbackFor ={BusinessException.class}, value = "product")
public @interface ProductTx {

}

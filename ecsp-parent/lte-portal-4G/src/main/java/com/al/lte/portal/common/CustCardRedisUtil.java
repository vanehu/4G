package com.al.lte.portal.common;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections.MapUtils;

import com.al.ecs.common.util.MDA;

/**
 * 
 * @author ynhuang
 *
 */
public class CustCardRedisUtil {

	public static String compareRedisCard(String cardType, String cardNumber, HttpServletRequest request) {
		String switchSave = MDA.SAVE_CUST_ID;
		String card = "";
		if ("ON".equals(switchSave)) {
			if ("1".equals(cardType) && cardNumber != "" && cardNumber != null) {
				String uId = (String) request.getSession().getAttribute("uId");
				if (uId != null) {
					card = ((Map<String, String>) RedisUtil.get(uId)).get("certNumber");
				} else if (uId == null || card == null) {
					return "";
				}
			}
			if (card != "" && card != null && card.equals(cardNumber)) {
				//RedisUtil.remove((String) request.getSession().getAttribute("uId"));
				//request.getSession().removeAttribute("uId");
				return "0";
			}
			return "1";

		}
		return "";
	}
}

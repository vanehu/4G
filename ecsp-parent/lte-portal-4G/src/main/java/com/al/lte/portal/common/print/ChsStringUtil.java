package com.al.lte.portal.common.print;

public class ChsStringUtil {
	private final static String[] num = { "零", "壹", "贰", "叁", "肆", "伍", "陆",
		"柒", "捌", "玖", };
	private final static String[] seqNum = { "一", "二", "三", "四", "五", "六", "七",
			"八", "九", "十" };
	private final static String[] seqNumUnit = { "十", "百", "千" };
	
	/**
	 * 根据数字取对应的中文
	 * @param orderSeq
	 * @return
	 */
	public static String getSeqNumByInt(int orderSeq){
		if(orderSeq <= 10){
			return seqNum[(int)(orderSeq - 1)];
		}
		
		String orderSeqStr = String.valueOf(orderSeq);
		
		int baseNumber = getMultiNumber(10, orderSeqStr.length() - 1);
		int num = (int)Math.ceil(orderSeq / baseNumber);
		int nextNumber = orderSeq - 10 * num;
		
		if(nextNumber == 0){
			return num == 1 ? seqNum[0] : (seqNum[num - 1] + seqNumUnit[0]);
		} else {
			if(num == 1){
				return seqNum[9] + getSeqNumByInt(nextNumber);
			} else {
				return seqNum[num - 1] + seqNumUnit[orderSeqStr.length() - 2] + getSeqNumByInt(nextNumber);
			}
		}
	}
	
	/**
	 * 取某个数的N次方
	 * @param baseNumber
	 * @param number
	 * @return
	 */
	public static int getMultiNumber(int baseNumber, int number){
		if(number <= 0){
			return 0;
		}
		if(number == 1){
			return baseNumber;
		}
		while(number > 1){
			baseNumber *= baseNumber;
			number --;
		}
		return baseNumber;
	}
	
	/**
	 * 人民币小写转大写
	 * 
	 * @param money
	 * @return
	 */
	public static String toChineseDigitl(String money) {
		String chineseDigitl = "";
		if (money == null) {
			return chineseDigitl;
		}

		String[] moneyArry = money.replaceAll(",", "").split("\\.");
		if (moneyArry.length > 0) {
			// 负数处理
			if (moneyArry[0].length() > 0
					&& moneyArry[0].substring(0, 1).equals("-")) {
				chineseDigitl += "负";
				String tmp = moneyArry[0].substring(1, moneyArry[0].length());
				moneyArry[0] = tmp;
			}

			// 金额小于1元单独处理
			if (moneyArry[0].length() == 1 && moneyArry[0].equals("0")) {
				chineseDigitl += parseMoneyInt(moneyArry[0])
						+ parseMoneyFloat(moneyArry.length == 1 ? null
								: moneyArry[1]);
				// 金额大于1元单独处理
			} else {
				chineseDigitl += parseMoneyInt(moneyArry[0])
						+ "元"
						+ parseMoneyFloat(moneyArry.length == 1 ? null
								: moneyArry[1]);
			}
		}

		return chineseDigitl;
	}
	
	private static String parseMoneyFloat(String money) {
		if (money == null) {
			return "";
		}

		String result = "";
		String[] unit = { "角", "分" };

		final int len = money.length();
		for (int i = 0; i < len; i++) {
			String tmp = money.substring(i, i + 1);
			result += num[Integer.parseInt(tmp)] + unit[i];
		}
		return result;

	}

	private static String parseMoneyInt(String money) {
		String[] unit = { "", "拾", "佰", "仟", "万", "亿", "兆", "吉", "太", "拍", "艾" };

		final int len = money.length();
		if (len <= 5) {
			String result = "";
			for (int i = 0; i < len; ++i) {
				if (money.charAt(i) == '0') {
					int j = i + 1;
					while (j < len && money.charAt(j) == '0') {
						++j;
					}
					if (j < len) {
						result += "零";
					}
					i = j - 1;
				} else {
					result = result
							+ num[money.substring(i, i + 1).charAt(0) - '0']
							+ unit[len - i - 1];
				}
			}
			return result;
		} else if (len <= 8) {
			String result = parseMoneyInt(money.substring(0, len - 4));
			if (result.length() != 0) {
				result += unit[4];
			}
			return result + parseMoneyInt(money.substring(len - 4));
		} else {
			String result = parseMoneyInt(money.substring(0, len - 8));
			if (result.length() != 0) {
				result += unit[5];
			}
			return result + parseMoneyInt(money.substring(len - 8));
		}
	}
}

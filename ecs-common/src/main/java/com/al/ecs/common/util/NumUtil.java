package com.al.ecs.common.util;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
/**
 * number Util.
 * @author chylg
 */
public class NumUtil {
	
	/**
	 * 
	 * @param number
	 * @return
	 */
	public static String formatRMB(double number){
		String[] nums = new String[] { "零", "壹", "贰", "叁", "肆", "伍", "陆", "柒",
				"捌", "玖" };
		String[] units = new String[] { "拾", "佰", "仟", "万", "亿" };
		NumberFormat numberFormat = new DecimalFormat("#,####.##");
		String srcNum = numberFormat.format(number); // 按个数转换,如"21,1234,4567,5487.4543544"

		String prefixNum = srcNum;
		String lastNum = "";
		int index = srcNum.indexOf(".");
		if (index != -1) {
			prefixNum = srcNum.substring(0, index); // 小数点前
			lastNum = srcNum.substring(index + 1, srcNum.length());
		}

		StringBuffer result = new StringBuffer(0); // 用于保存结果

		String[] numPices = prefixNum.split(","); // 4个数字一组
		for (int i = 0; i < numPices.length; i++) // 遍历每个组
		{
			for (int j = 0; j < numPices[i].length(); j++) // 遍历组中的每个数字
			{
				int k = Integer.parseInt(String.valueOf(numPices[i].charAt(j)));
				int len = numPices[i].length();
				result.append(nums[k]); // 变成汉字
				result.append(len - 2 - j >= 0 && k > 0 ? units[len - 2 - j]
						: ""); // 添加仟佰拾
				result.append(j != len - 1 ? ""
						: ((i + numPices.length) % 2 == 0 ? (i == numPices.length - 1 ? ""
								: units[3])
								: i != numPices.length - 1 ? units[4] : "")); // 添加亿万
			}
		}

		String resutlStr = result.toString();
		// "零零" to"零"
		resutlStr = resutlStr.replaceAll(nums[0] + "{2,}", nums[0]); 
		// "零万"to "万"
		resutlStr = resutlStr.replaceAll(nums[0] + units[3] + "{1}", units[3]); 
		// "零亿"to"亿"																		
		resutlStr = resutlStr.replaceAll(nums[0] + units[4] + "{1}", units[4]);
		// "亿万"to"亿零"						
		resutlStr = resutlStr.replaceAll(units[4] + units[3] + "{1}", units[4]); 
		// 去掉最后的"零"
		if (resutlStr.lastIndexOf(nums[0]) == resutlStr.length() - 1) {
			resutlStr = resutlStr.substring(0, resutlStr.length() - 1);
		}
		String lastStr = "";
		if (lastNum.length() == 1) {
			int n = Integer.parseInt(lastNum);
			if (n != 0) {
				lastStr = nums[n] + "角";
			}
		} else if (lastNum.length() >= 2) {
			int n = Integer.parseInt(lastNum.substring(0, 2));
			if (n > 0) {
				int a = n / 10;
				if (a != 0) {
					lastStr = nums[a] + "角";
				} else {
					lastStr = "零";
				}
				a = n % 10;
				if (a != 0) {
					lastStr += nums[a] + "分";
				}
			}
		}

		if (resutlStr.length() > 0) {
			if (lastStr.length() == 0) {
				lastStr = "圆整" + lastStr;
			} else {
				lastStr = "圆" + lastStr;
			}
		}

		return resutlStr + lastStr;
	}
	
	/**
	 * 格式数字.
	 * 
	 * @param num 数字
	 * @param newScale
	 *            小数点后位数
	 * @return 格式化数字
	 */
	public static String formatNumber(double num, int newScale) {
		BigDecimal bd = new BigDecimal(String.valueOf(num));
		return bd.setScale(newScale, 1).toString();
	}

	/**
	 * 格式数字.
	 * 
	 * @param num
	 *            被除数
	 * @param divisor
	 *            除数
	 * @param newScale
	 *            小数点后位数
	 * @return 格式化数字
	 */
	public static String formatNumber(double num, int divisor, int newScale) {
		BigDecimal bd = new BigDecimal(String.valueOf(num/divisor));
		return bd.setScale(newScale, 1).toString();
	}
	
	public static void main(String[] args) {
		double d = 123456789.7d;
		System.out.println(d);
		System.out.println(formatRMB(d));
	}
}

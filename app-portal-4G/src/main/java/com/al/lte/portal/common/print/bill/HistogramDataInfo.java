package com.al.lte.portal.common.print.bill;

/**
 * 消费数据
 * @author neil
 *
 */
public class HistogramDataInfo {
	
	/**
	 * 横坐标值
	 */
	public int xValue;
	
	/**
	 * 纵坐标值
	 */
	public int yValue;
	
	/**
	 * 每个柱子颜色（#000000_#FFFFFF）
	 */
	public String graphColour;

	public int getxValue() {
		return xValue;
	}

	public void setxValue(int xValue) {
		this.xValue = xValue;
	}

	public int getyValue() {
		return yValue;
	}

	public void setyValue(int yValue) {
		this.yValue = yValue;
	}

	public String getGraphColour() {
		return graphColour;
	}

	public void setGraphColour(String graphColour) {
		this.graphColour = graphColour;
	}
}

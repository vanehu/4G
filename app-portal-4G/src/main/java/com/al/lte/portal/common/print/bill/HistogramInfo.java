package com.al.lte.portal.common.print.bill;

import java.util.List;

/**
 * 消费柱状图
 * @author neil
 *
 */
public class HistogramInfo {

	/**
	 * 消费柱状图中柱子的宽度（单位：0.1毫米）
	 */
	public int graphColumnWidth;
	
	/**
	 * 是否显示数值（1=是）
	 * <br>Enumerated
	 */
	public int ifDisplaValue;
	
	/**
	 * 消费数据
	 */
	public List<HistogramDataInfo> histogramDataInfoList;

	public int getGraphColumnWidth() {
		return graphColumnWidth;
	}

	public void setGraphColumnWidth(int graphColumnWidth) {
		this.graphColumnWidth = graphColumnWidth;
	}

	public int getIfDisplaValue() {
		return ifDisplaValue;
	}

	public void setIfDisplaValue(int ifDisplaValue) {
		this.ifDisplaValue = ifDisplaValue;
	}

	public List<HistogramDataInfo> getHistogramDataInfoList() {
		return histogramDataInfoList;
	}

	public void setHistogramDataInfoList(
			List<HistogramDataInfo> histogramDataInfoList) {
		this.histogramDataInfoList = histogramDataInfoList;
	}
}

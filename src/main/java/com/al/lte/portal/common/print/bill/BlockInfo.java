package com.al.lte.portal.common.print.bill;

/**
 * 块列表
 * @author neil
 *
 */
public class BlockInfo {

	/**
	 * 起始位置横坐标（单位：0。1毫米）
	 */
	public int locationX;
	
	/**
	 * 起始位置纵坐标（单位：0。1毫米）
	 */
	public int locationY;
	
	/**
	 * 块高度（单位：0。1毫米）
	 */
	public int blockHeight;
	
	/**
	 * 块长度（单位：0。1毫米）
	 */
	public int blockLength;
	
	/**
	 * 块分类（1=表格；2=图片；3=消费柱状图）
	 * <br>Enumerated
	 */
	public int blockType;
	
	/**
	 * 表格
	 */
	public Table table;
	
	/**
	 * 图片
	 */
	public PictureInfo pictureInfo;
	
	/**
	 * 消费柱状图
	 */
	public HistogramInfo histogramInfo;

	public int getLocationX() {
		return locationX;
	}

	public void setLocationX(int locationX) {
		this.locationX = locationX;
	}

	public int getLocationY() {
		return locationY;
	}

	public void setLocationY(int locationY) {
		this.locationY = locationY;
	}

	public int getBlockHeight() {
		return blockHeight;
	}

	public void setBlockHeight(int blockHeight) {
		this.blockHeight = blockHeight;
	}

	public int getBlockLength() {
		return blockLength;
	}

	public void setBlockLength(int blockLength) {
		this.blockLength = blockLength;
	}

	public int getBlockType() {
		return blockType;
	}

	public void setBlockType(int blockType) {
		this.blockType = blockType;
	}

	public Table getTable() {
		return table;
	}

	public void setTable(Table table) {
		this.table = table;
	}

	public PictureInfo getPictureInfo() {
		return pictureInfo;
	}

	public void setPictureInfo(PictureInfo pictureInfo) {
		this.pictureInfo = pictureInfo;
	}

	public HistogramInfo getHistogramInfo() {
		return histogramInfo;
	}

	public void setHistogramInfo(HistogramInfo histogramInfo) {
		this.histogramInfo = histogramInfo;
	}
}

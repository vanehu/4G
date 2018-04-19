package com.al.lte.portal.common.print.bill;

/**
 * 表格格式
 * @author neil
 *
 */
public class TableFormat {

	/**
	 * 行数
	 */
	public int row;
	
	/**
	 * 列数
	 */
	public int column;
	
	/**
	 * 默认行高（单位：0。1毫米）
	 * <br>——该行上下边框中线之间的距离，不包含框线宽度和上、下边距
	 */
	public int defaultRowHeight;
	
	/**
	 * 默认列宽（单位：0。1毫米）
	 * <br>——该列左右边框中线之间的距离，不包含框线宽度和左、右边距
	 */
	public int defaultColumnWidth;
	
	/**
	 * 单元格左边距（单位：0。1毫米）
	 */
	public int cellLeftSpace;
	
	/**
	 * 单元格右边距（单位：0。1毫米）
	 */
	public int cellRightSpace;
	
	/**
	 * 边框（aaaaaa：分别对应“上下左右横列”边框。a的取值：
	 * <br>1=无；
	 * <br>2=普通（0.5磅）；
	 * <br>3=加粗（1磅）；
	 * <br>4=虚线
	 */
	public int frame;

	public int getRow() {
		return row;
	}

	public void setRow(int row) {
		this.row = row;
	}

	public int getColumn() {
		return column;
	}

	public void setColumn(int column) {
		this.column = column;
	}

	public int getDefaultRowHeight() {
		return defaultRowHeight;
	}

	public void setDefaultRowHeight(int defaultRowHeight) {
		this.defaultRowHeight = defaultRowHeight;
	}

	public int getDefaultColumnWidth() {
		return defaultColumnWidth;
	}

	public void setDefaultColumnWidth(int defaultColumnWidth) {
		this.defaultColumnWidth = defaultColumnWidth;
	}

	public int getCellLeftSpace() {
		return cellLeftSpace;
	}

	public void setCellLeftSpace(int cellLeftSpace) {
		this.cellLeftSpace = cellLeftSpace;
	}

	public int getCellRightSpace() {
		return cellRightSpace;
	}

	public void setCellRightSpace(int cellRightSpace) {
		this.cellRightSpace = cellRightSpace;
	}

	public int getFrame() {
		return frame;
	}

	public void setFrame(int frame) {
		this.frame = frame;
	}
}

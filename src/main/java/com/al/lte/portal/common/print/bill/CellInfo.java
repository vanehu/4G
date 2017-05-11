package com.al.lte.portal.common.print.bill;

/**
 * 单元格
 * @author neil
 *
 */
public class CellInfo {

	/**
	 * 行号
	 */
	public int cellRowId;
	
	/**
	 * 列号
	 */
	public int cellColumnId;
	
	/**
	 * 字体信息
	 */
	public FontInfo fontInfo;
	
	/**
	 * 对齐方式
	 */
	public AlignmentInfo alignmentInfo;
	
	/**
	 * 表格底色（#000000_#FFFFFF）
	 */
	public String bottomColour;
	
	/**
	 * 表格内容
	 */
	public String cellContent;

	public int getCellRowId() {
		return cellRowId;
	}

	public void setCellRowId(int cellRowId) {
		this.cellRowId = cellRowId;
	}

	public int getCellColumnId() {
		return cellColumnId;
	}

	public void setCellColumnId(int cellColumnId) {
		this.cellColumnId = cellColumnId;
	}

	public FontInfo getFontInfo() {
		return fontInfo;
	}

	public void setFontInfo(FontInfo fontInfo) {
		this.fontInfo = fontInfo;
	}

	public AlignmentInfo getAlignmentInfo() {
		return alignmentInfo;
	}

	public void setAlignmentInfo(AlignmentInfo alignmentInfo) {
		this.alignmentInfo = alignmentInfo;
	}

	public String getBottomColour() {
		return bottomColour;
	}

	public void setBottomColour(String bottomColour) {
		this.bottomColour = bottomColour;
	}

	public String getCellContent() {
		return cellContent;
	}

	public void setCellContent(String cellContent) {
		this.cellContent = cellContent;
	}
}

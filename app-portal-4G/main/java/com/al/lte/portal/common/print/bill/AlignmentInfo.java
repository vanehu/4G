package com.al.lte.portal.common.print.bill;

/**
 * 对齐方式
 * @author neil
 *
 */
public class AlignmentInfo {

	/**
	 * 上下对齐（1=上、2=中、3=下），基于上下边距之间
	 * <br>Enumerated
	 */
	public int alignmentVertical;
	
	/**
	 * 左右对齐（1=上、2=中、3=下），基于左右边距之间
	 * <br>注：应该指左中右
	 * <br>Enumerated
	 */
	public int alignmentHorizontal;

	public int getAlignmentVertical() {
		return alignmentVertical;
	}

	public void setAlignmentVertical(int alignmentVertical) {
		this.alignmentVertical = alignmentVertical;
	}

	public int getAlignmentHorizontal() {
		return alignmentHorizontal;
	}

	public void setAlignmentHorizontal(int alignmentHorizontal) {
		this.alignmentHorizontal = alignmentHorizontal;
	}
	
}

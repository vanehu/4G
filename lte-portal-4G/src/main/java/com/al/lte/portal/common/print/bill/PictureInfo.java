package com.al.lte.portal.common.print.bill;

/**
 * 图片
 * @author neil
 *
 */
public class PictureInfo {

	/**
	 * 文件名
	 * <br>Enumerated
	 */
	public int fileName;
	
	/**
	 * 显示方式(0=自适应、1=居中)
	 * <br>Enumerated
	 */
	public int display;

	public int getFileName() {
		return fileName;
	}

	public void setFileName(int fileName) {
		this.fileName = fileName;
	}

	public int getDisplay() {
		return display;
	}

	public void setDisplay(int display) {
		this.display = display;
	}
}

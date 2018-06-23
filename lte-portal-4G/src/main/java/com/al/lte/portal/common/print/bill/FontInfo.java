package com.al.lte.portal.common.print.bill;

/**
 * 字体信息
 * @author neil
 *
 */
public class FontInfo {

	/**
	 * 字体（1=宋体；2=黑体）
	 * <br>Enumerated
	 */
	public int fontType;
	
	/**
	 * 字号（单位：磅）
	 */
	public String fontSize;
	
	/**
	 * 字形（0=常规、1=加粗、2=倾斜、3=加粗倾斜）
	 * <br>Enumerated
	 */
	public int fontStyle;
	
	/**
	 * 下划线（1=有下划线）
	 * <br>Enumerated
	 */
	public int fontUnderline;
	
	/**
	 * 字体颜色（#000000_#FFFFFF）
	 */
	public String fontColour;
	
	/**
	 * 缩进（单位：空格）
	 */
	public int indent;

	public int getFontType() {
		return fontType;
	}

	public void setFontType(int fontType) {
		this.fontType = fontType;
	}

	public String getFontSize() {
		return fontSize;
	}

	public void setFontSize(String fontSize) {
		this.fontSize = fontSize;
	}

	public int getFontStyle() {
		return fontStyle;
	}

	public void setFontStyle(int fontStyle) {
		this.fontStyle = fontStyle;
	}

	public int getFontUnderline() {
		return fontUnderline;
	}

	public void setFontUnderline(int fontUnderline) {
		this.fontUnderline = fontUnderline;
	}

	public String getFontColour() {
		return fontColour;
	}

	public void setFontColour(String fontColour) {
		this.fontColour = fontColour;
	}

	public int getIndent() {
		return indent;
	}

	public void setIndent(int indent) {
		this.indent = indent;
	}
}

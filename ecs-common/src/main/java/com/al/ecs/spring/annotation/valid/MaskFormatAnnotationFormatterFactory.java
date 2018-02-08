package com.al.ecs.spring.annotation.valid;

import java.text.ParseException;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import org.springframework.format.AnnotationFormatterFactory;
import org.springframework.format.Formatter;
import org.springframework.format.Parser;
import org.springframework.format.Printer;

/** 
 *  注解:用来判断 字符串格式是否正确.
 *<P>
 *  @MaskFormat("(###) ###-####")
 *<P>
 * @author			tang zheng yu
 * @version			V1.0 2011-12-24 
 * @createDate	2011-12-24 下午10:17:00
 * @modifyDate	tang  2011-12-24<BR>
 * @copyRight	亚信联创电信CRM研发部
 */
public class MaskFormatAnnotationFormatterFactory implements AnnotationFormatterFactory<MaskFormat> {

	public Set<Class<?>> getFieldTypes() {
		Set<Class<?>> fieldTypes = new HashSet<Class<?>>(1, 1);
		fieldTypes.add(String.class);
		return fieldTypes;
	}

	public Parser<?> getParser(MaskFormat annotation, Class<?> fieldType) {
		return new MaskFormatter(annotation.value());
	}

	public Printer<?> getPrinter(MaskFormat annotation, Class<?> fieldType) {
		return new MaskFormatter(annotation.value());
	}
	
	/**
	 * 表达式校验.
	 * @author tang
	 */
	private static class MaskFormatter implements Formatter<String> {

		private javax.swing.text.MaskFormatter delegate;

		public MaskFormatter(String mask) {
			try {
				this.delegate = new javax.swing.text.MaskFormatter(mask);
				this.delegate.setValueContainsLiteralCharacters(false);
			} catch (ParseException e) {
				throw new IllegalStateException("Mask could not be parsed " + mask, e);
			}
		}

		public String print(String object, Locale locale) {
			try {
				return delegate.valueToString(object);
			} catch (ParseException e) {
				throw new IllegalArgumentException("Unable to print using mask " + delegate.getMask(), e);
			}
		}

		public String parse(String text, Locale locale) throws ParseException {
			return (String) delegate.stringToValue(text);
		}

	}

}

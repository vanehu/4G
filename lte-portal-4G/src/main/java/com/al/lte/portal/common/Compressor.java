package com.al.lte.portal.common;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.math.BigInteger;
import java.security.MessageDigest;

import org.apache.commons.lang.StringUtils;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;

import com.al.ecs.log.Log;
import com.yahoo.platform.yui.compressor.CssCompressor;
import com.yahoo.platform.yui.compressor.JavaScriptCompressor;

public class Compressor {

	private static Log log = Log.getLog(Compressor.class);

	public static final String FILE_PROTOCOL = "file:";

	public static final String DEF_CHARSET = "UTF-8";
	public static final int DEF_LINEBREAKPOS = -1;
	public static final int DEF_LINEBREAKPOS8000 = 8000;
	public static final String DEF_TYPE_JS = "js";
	public static final String DEF_TYPE_CSS = "css";
	public static final boolean DEF_MUNGE = true;
	public static final boolean DEF_VERBOSE = false;
	public static final boolean DEF_PRESERVE = false;
	public static final boolean DEF_DISABLE = false;

	public static void main(String[] args) {
		
		// testSingalFile(args);
		String version = "1.0.0";
		// combineBaseCss(version);
		// compressThirdJs(version);
//		compressBaseJs(version);
//		compressBusiJs(version);
	}

	public static int compressThirdJs(String version) {
		String inputFileListName = "resources/merge/js/thirdJsList.txt";
		String outputFilename = "resources/merge/js/third";
		if (StringUtils.isEmpty(version)) {
			outputFilename += "-1.0.0.all.js";
		} else {
			outputFilename += "-" + version + ".all.js";
		}
		int combineResult = combine(inputFileListName, outputFilename);
		if (combineResult == 0) {
			return compress(outputFilename, DEF_TYPE_JS);
		}
		return -1;
	}
	
	public static int compressThirdPADJs(String version) {
		String inputFileListName = "resources/merge/js/thirdPADJsList.txt";
		String outputFilename = "resources/merge/js/thirdPAD";
		if (StringUtils.isEmpty(version)) {
			outputFilename += "-1.0.0.all.js";
		} else {
			outputFilename += "-" + version + ".all.js";
		}
		int combineResult = combine(inputFileListName, outputFilename);
		if (combineResult == 0) {
			return compress(outputFilename, DEF_TYPE_JS);
		}
		return -1;
	}

	public static int compressBaseJs(String version) {
		String inputFileListName = "resources/merge/js/baseJsList.txt";
		String outputFilename = "resources/merge/js/base";
		if (StringUtils.isEmpty(version)) {
			outputFilename += "-1.0.0.all.js";
		} else {
			outputFilename += "-" + version + ".all.js";
		}
		int result = combine(inputFileListName, outputFilename);
		if (result == 0) {
			return compress(outputFilename, DEF_TYPE_JS);
		}
		return -1;
	}

	public static int compressBusiJs(String version) {
		String inputFileListName = "resources/merge/js/busiJsList.txt";
		String outputFilename = "resources/merge/js/busi";
		if (StringUtils.isEmpty(version)) {
			outputFilename += "-1.0.0.all.js";
		} else {
			outputFilename += "-" + version + ".all.js";
		}
		int result = combine(inputFileListName, outputFilename);
		if (result == 0) {
			return compress(outputFilename, DEF_TYPE_JS);
		}
		return -1;
	}
	
	public static int compressBusiPCJs(String version) {
		String inputFileListName = "resources/merge/js/busiPCJsList.txt";
		String outputFilename = "resources/merge/js/busiPC";
		if (StringUtils.isEmpty(version)) {
			outputFilename += "-1.0.0.all.js";
		} else {
			outputFilename += "-" + version + ".all.js";
		}
		int result = combine(inputFileListName, outputFilename);
		if (result == 0) {
			return compress(outputFilename, DEF_TYPE_JS);
		}
		return -1;
	}
	
	public static int compressBusiAPPJs(String version) {
		String inputFileListName = "resources/merge/js/busiAPPJsList.txt";
		String outputFilename = "resources/merge/js/busiAPP";
		if (StringUtils.isEmpty(version)) {
			outputFilename += "-1.0.0.all.js";
		} else {
			outputFilename += "-" + version + ".all.js";
		}
		int result = combine(inputFileListName, outputFilename);
		if (result == 0) {
			return compress(outputFilename, DEF_TYPE_JS);
		}
		return -1;
	}
	
	/**APP版本*/
	public static int compressBusiAppMemJs(String version) {
		String inputFileListName = "resources/merge/js/busiAppMemJsList.txt";
		String outputFilename = "resources/merge/js/busiAppMem";
		if (StringUtils.isEmpty(version)) {
			outputFilename += "-1.0.0.all.js";
		} else {
			outputFilename += "-" + version + ".all.js";
		}
		int result = combine(inputFileListName, outputFilename);
		if (result == 0) {
			return compress(outputFilename, DEF_TYPE_JS);
		}
		return -1;
	}
	
	public static int compressBusiPADJs(String version) {
		String inputFileListName = "resources/merge/js/busiPADJsList.txt";
		String outputFilename = "resources/merge/js/busiPAD";
		if (StringUtils.isEmpty(version)) {
			outputFilename += "-1.0.0.all.js";
		} else {
			outputFilename += "-" + version + ".all.js";
		}
		int result = combine(inputFileListName, outputFilename);
		if (result == 0) {
			return compress(outputFilename, DEF_TYPE_JS);
		}
		return -1;
	}

	@Deprecated
	public static void combineBaseCss(String version) {
		String inputFileListName = "resources/merge/css/baseCssList.txt";
		String outputFilename = "resources/merge/css/base";
		if (StringUtils.isEmpty(version)) {
			outputFilename += "-1.0.0.all.css";
		} else {
			outputFilename += "-" + version + ".all.css";
		}
		combine(inputFileListName, outputFilename);

		compress(outputFilename, DEF_TYPE_CSS);
	}

	public static int combine(String inputFileListName, String outputFilename) {
		BufferedReader bufferedReader = null;
		BufferedWriter bufferedWriter = null;
		try {
			log.info("combine files begin.");
			long beginTime = System.currentTimeMillis();

			String basePath = getBasePath();
			String filename = getInputFileName(inputFileListName, basePath);
			log.info("input :" + filename);

			bufferedReader = new BufferedReader(new InputStreamReader(new FileInputStream(filename), "UTF-8"));
			String str = null;
			StringBuilder sb = new StringBuilder();
			while ((str = bufferedReader.readLine()) != null) {
				// 以#号开头的行认为注释，跳过
				if (str.startsWith("#")) {
					continue;
				}

				// 只处理js和css后缀文件
				if (str.endsWith(".js") || str.endsWith(".css")) {
					String type = str.substring(str.lastIndexOf("."),
							str.length());
					int result = readFileToSb(basePath + str, sb, type);
					// 读取文件到sb失败
					if (result != 0) {
						log.info("find error when read " + str
								+ ", the operation will be stopped.");
						return 1;
					}
					// js文件末尾补全分号，防止异常
					if (".js".equals(type) && sb.length() > 0) {
						sb.append("\n");
					}
				}
			}
			bufferedReader.close();

			// 如果sb中没有内容，则返回
			if (sb.length() == 0) {
				log.info("no data in sb, end up here.");
				return 1;
			}

			outputFilename = basePath + outputFilename;
			log.info("output:" + outputFilename);
			bufferedWriter = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(outputFilename), "UTF-8"));
			bufferedWriter.write(sb.toString());
			bufferedWriter.close();
			// File oldFile = new File(outputFilename);
			// if(!oldFile.canRead()) {
			// log.info("the old .all file cannot be read.");
			// return 1;
			// }
			// String oldFileMD5 = calcMD5(outputFilename);

			// String tmpFileName = outputFilename + ".tmp";
			// fileWriter = new FileWriter(tmpFileName);
			// bufferedWriter = new BufferedWriter(fileWriter);
			// bufferedWriter.write(sb.toString());
			// bufferedWriter.close();
			// fileWriter.close();
			// File tmpFile = new File(tmpFileName);
			// String tmpFileMD5 = calcMD5(outputFilename);
			// if (tmpFileMD5.equals(oldFileMD5)) {
			// tmpFile.delete();
			// log.info("md5 checksum are equal, .all and .min file will not be changed.");
			// return 1;
			// } else {
			// oldFile.delete();
			// tmpFile.renameTo(oldFile);
			// log.info("delete old file and creat new .all file");
			// }

			long usedTime = System.currentTimeMillis() - beginTime;
			log.info("combine files done. total used time is " + usedTime
					+ " ms.");

		} catch (Exception e) {
			close(bufferedReader);
			close(bufferedWriter);
			log.error(e);
			return -1;
		}
		return 0;
	}

	private static void close(Closeable closeable) {
		try {
			if (closeable != null) {
				closeable.close();
			}
		} catch (Exception e) {
			log.error(e);
		}
	}

	private static int readFileToSb(String input, StringBuilder sb, String type) {
		BufferedReader bufferedReader = null;
		try {
			bufferedReader = new BufferedReader(new InputStreamReader(new FileInputStream(input), "UTF-8"));
			int c = -1;
			while ((c = bufferedReader.read()) != -1) {
				sb.append((char) c);
			}
			bufferedReader.close();
		} catch (Exception e) {
			close(bufferedReader);
			log.error(e);
			return 1;
		}

		return 0;
	}
	
	/**
	 * 
	 * @param input
	 * @param sb
	 * @return 0-success 1-fail
	 */
	private static int readFileToSbOld(String input, StringBuilder sb, String type) {
		FileReader fileReader = null;
		BufferedReader bufferedReader = null;
		try {
			fileReader = new FileReader(input);
			bufferedReader = new BufferedReader(fileReader);
			int c = -1;
			while ((c = bufferedReader.read()) != -1) {
				sb.append((char) c);
			}
			bufferedReader.close();
			fileReader.close();
		} catch (Exception e) {
			close(fileReader);
			close(bufferedReader);
			log.error(e);
			return 1;
		}

		return 0;
	}

	public static int compressor(String inputFilename, String outputFilename,
			String charset, String typeOverride, int linebreakpos,
			boolean munge, boolean verbose, boolean preserveAllSemiColons,
			boolean disableOptimizations) {

		Reader in = null;
		Writer out = null;
		// 不使用该功能
		Writer mungemap = null;

		String type = null;
		try {
			if (typeOverride != null) {
				type = typeOverride;
			} else {
				int idx = inputFilename.lastIndexOf('.');
				if (idx >= 0 && idx < inputFilename.length() - 1) {
					type = inputFilename.substring(idx + 1);
				}
			}

			if (type == null || !type.equalsIgnoreCase("js")
					&& !type.equalsIgnoreCase("css")) {
				return -1;
			}

			in = new InputStreamReader(new FileInputStream(inputFilename),
					charset);

			if (type.equalsIgnoreCase("js")) {

				try {
					final String localFilename = inputFilename;

					JavaScriptCompressor compressor = new JavaScriptCompressor(
							in, new ErrorReporter() {

								public void warning(String message,
										String sourceName, int line,
										String lineSource, int lineOffset) {
									log.error("\n[WARNING] in "
											+ localFilename);
									if (line < 0) {
										log.error("  " + message);
									} else {
										log.error("  " + line + ':'
												+ lineOffset + ':' + message);
									}
								}

								public void error(String message,
										String sourceName, int line,
										String lineSource, int lineOffset) {
									log.error("[ERROR] in "
											+ localFilename);
									if (line < 0) {
										log.error("  " + message);
									} else {
										log.error("  " + line + ':'
												+ lineOffset + ':' + message);
									}
								}

								public EvaluatorException runtimeError(
										String message, String sourceName,
										int line, String lineSource,
										int lineOffset) {
									error(message, sourceName, line,
											lineSource, lineOffset);
									return new EvaluatorException(message);
								}
							});

					// Close the input stream first, and then open the output
					// stream,
					// in case the output file should override the input file.
					in.close();
					in = null;

					if (outputFilename == null) {
						out = new OutputStreamWriter(System.out, charset);
					} else {
						out = new OutputStreamWriter(new FileOutputStream(
								outputFilename), charset);
					}

					compressor.compress(out, mungemap, linebreakpos, munge,
							verbose, preserveAllSemiColons,
							disableOptimizations);

				} catch (EvaluatorException e) {

					log.error(e);
					// Return a special error code used specifically by the web
					// front-end.
					return -1;

				}

			} else if (type.equalsIgnoreCase("css")) {

				CssCompressor compressor = new CssCompressor(in);

				// Close the input stream first, and then open the output
				// stream,
				// in case the output file should override the input file.
				in.close();
				in = null;

				if (outputFilename == null) {
					out = new OutputStreamWriter(System.out, charset);
				} else {
					out = new OutputStreamWriter(new FileOutputStream(
							outputFilename), charset);
				}

				compressor.compress(out, linebreakpos);
			}

		} catch (IOException e) {

			log.error(e);
			return -1;

		} finally {

			if (in != null) {
				try {
					in.close();
				} catch (IOException e) {
					log.error(e);
				}
			}

			if (out != null) {
				try {
					out.close();
				} catch (IOException e) {
					log.error(e);
				}
			}
		}
		return 0;
	}

	private static String getBasePath() {
//		String basePath = Compressor.class.getResource("/").getPath();
		String basePath = SysConstant.getSysConfDir();
		log.error("basePath is :" + basePath);
		// 移除最后的 / 符号
		basePath = basePath.substring(0, basePath.length() - 1);
		// 移除最后两层目录
		int lastIndex = basePath.lastIndexOf("/");
		basePath = basePath.substring(0, lastIndex);
		// 判断路径是以target还是WEB-INF结尾
		String suffix = "";
		if (basePath.endsWith("target")) {
			suffix = "src/main/webapp/";
		}
		int secondIndex = basePath.lastIndexOf("/");
		basePath = basePath.substring(0, secondIndex + 1);
		basePath += suffix;
		log.error("basePath finally is:" + basePath);
		return basePath;
	}

	private static String getInputFileName(String input, String basePath) {
		if (input.startsWith("/")) {
			input = input.substring(1);
		}
		return basePath + input;
	}

	private static String getOutputFileName(String output, String input,
			String basePath) {
		if (StringUtils.isEmpty(output)) {
			String suffix = "";
			String type = "";
			if (input.endsWith("all.js")) {
				suffix = ".all.js";
				type = ".js";
			} else if (input.endsWith("all.css")) {
				suffix = ".all.css";
				type = ".css";
			}

			output = input.substring(0, input.length() - suffix.length())
					+ ".min" + type;
		}
		if (output.startsWith("/")) {
			output = output.substring(1);
		}
		return basePath + output;
	}

	public static int compress(String input, String typeOverride) {
		int result = -1;
		String output = "";
		String charset = DEF_CHARSET;
		int linebreakpos = DEF_LINEBREAKPOS8000;
		boolean munge = DEF_MUNGE;
		boolean verbose = DEF_VERBOSE;
		boolean preserveAllSemiColons = DEF_PRESERVE;
		boolean disableOptimizations = DEF_DISABLE;
		try {
			long beginTime = System.currentTimeMillis();
			log.info(" compress begin");

			String basePath = getBasePath();
			String inputFilename = getInputFileName(input, basePath);
			log.info("input :" + inputFilename);

			String outputFilename = getOutputFileName(output, input, basePath);
			log.info("output:" + outputFilename);

			result = compressor(inputFilename, outputFilename, charset, typeOverride,
					linebreakpos, munge, verbose, preserveAllSemiColons,
					disableOptimizations);
			long usedTime = System.currentTimeMillis() - beginTime;
			log.info("compress fin, total used time :" + usedTime + " ms.");
		} catch (Exception e) {
			log.error(e);
			return -1;
		}
		return result;
	}

	public static int compress(String input, String output, String typeOverride) {
		int result = -1;
		String charset = DEF_CHARSET;
		int linebreakpos = DEF_LINEBREAKPOS8000;
		boolean munge = DEF_MUNGE;
		boolean verbose = DEF_VERBOSE;
		boolean preserveAllSemiColons = DEF_PRESERVE;
		boolean disableOptimizations = DEF_DISABLE;
		try {
			long beginTime = System.currentTimeMillis();
			log.info(" compress begin");

			String basePath = getBasePath();
			String inputFilename = getInputFileName(input, basePath);
			log.info("input :" + inputFilename);

			String outputFilename = getOutputFileName(output, input, basePath);
			log.info("output:" + outputFilename);

			result = compressor(inputFilename, outputFilename, charset, typeOverride,
					linebreakpos, munge, verbose, preserveAllSemiColons,
					disableOptimizations);
			long usedTime = System.currentTimeMillis() - beginTime;
			log.info("compress fin, total used time :" + usedTime + " ms.");
		} catch (Exception e) {
			log.error(e);
			return -1;
		}
		return result;
	}
	
	public static String calcMD5(String filename) throws Exception {
		String value = null;
		FileInputStream in = null;
		File file = new File(filename);
		MessageDigest md5 = MessageDigest.getInstance("MD5");
		in = new FileInputStream(file);
		byte[] buffer = new byte[4096];
		int length = -1;
		while ((length = in.read(buffer)) != -1) {
			md5.update(buffer, 0, length);
		}
		BigInteger bi = new BigInteger(1, md5.digest());
		value = bi.toString(16);
		return value;
	}

	public static void testSingalFile(String[] args) {
		String input = "src/main/webapp/resources/js/merge/electron-1.0.0.js";
		String output = "";
		String typeOverride = DEF_TYPE_JS;
		String charset = DEF_CHARSET;
		int linebreakpos = DEF_LINEBREAKPOS;
		boolean munge = DEF_MUNGE;
		boolean verbose = DEF_VERBOSE;
		boolean preserveAllSemiColons = DEF_PRESERVE;
		boolean disableOptimizations = DEF_DISABLE;
		try {
			log.debug("begin");

			String basePath = getBasePath();
			String inputFilename = getInputFileName(input, basePath);
			log.debug("input :" + inputFilename);

			String outputFilename = getOutputFileName(output, input, basePath);
			log.debug("output:" + outputFilename);

			compressor(inputFilename, outputFilename, charset, typeOverride,
					linebreakpos, munge, verbose, preserveAllSemiColons,
					disableOptimizations);
			log.debug("fin");
		} catch (Exception e) {
			log.error(e);
		}
	}
}

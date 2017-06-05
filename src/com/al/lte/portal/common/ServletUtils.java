package com.al.lte.portal.common;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UnsupportedEncodingException;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;

import net.sf.json.JSONObject;

/**
 * Servlet工具类
 * @author ZhangYu
 * @since 2017-06-03
 */
public class ServletUtils {

	public static JSONObject getJsonObjFromRequest(HttpServletRequest request, String charsetName){
		StringBuffer stringBuffer = new StringBuffer();
		JSONObject jsonObj = null;
		
		if(StringUtils.isBlank(charsetName)){
			charsetName = Const.DEFALUT_ENCODE;
		}
		
		try {
			Reader inputStreamReader = new InputStreamReader(request.getInputStream(), charsetName);
			BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
			
			String tempLine = bufferedReader.readLine();
			
			while(tempLine != null){
				stringBuffer.append(tempLine);
				tempLine = bufferedReader.readLine();
			}
			
			bufferedReader.close();
			jsonObj = JSONObject.fromObject(stringBuffer.toString());
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return jsonObj;
	}
}

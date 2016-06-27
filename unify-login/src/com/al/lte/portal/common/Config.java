package com.al.lte.portal.common;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class Config {
	
	/**
	 * @deprecated #59017容灾改造需求：当启用分省域名后，该全局变量可能会被置为分省域名(bj.crm.189.cn)，再使用该变量会出错，不建议使用。
	 */
	@Deprecated
	public static String ip="crm.189.cn";
	
	/**
	 * 获取ip
	 * @return
	 */
	public static String getIpconfig(HttpServletRequest req){
		String IP = "crm.189.cn";
		String ipconfig = getProperties().getProperty("ipconfig");
		if(ipconfig==null){ //获取文件失败
			ipconfig = "0";
		}
		if(!"0".equals(ipconfig)){
			String header =req.getHeader("x-ip-config");
			if(header!=null){
				IP = header;
			}
			//System.out.println("IP:"+IP);
		}
		return IP;
	}
	
	/**
	 * 根据配置文件中的ipconfig判别是否公网，如是公网，则返回分省域名，分省域名从配置文件中读取；如非公网环境，保持原代码逻辑，不做改动。
	 * @param req
	 * @param province 省份拼音，如jiangsu、beijing，根据该拼音，获取对应的分省域名
	 * @return 如果是公网，则以字符串形式返回分省域名；若分省域名获取失败，则返回crm.189.cn，不会返回null或者""。
	 */
	public static String getIpconfig(HttpServletRequest req, String province){
		String IP = "crm.189.cn";
		String ipconfig = getProperties().getProperty("ipconfig");//0表示启用公网， 1表示启用http请求头的ip，2表示测试环境10101
		if(ipconfig==null){
			ipconfig = "0";
			//默认设置为公网时，将ip改为分省域名
			String domain = Config.getDomain(province);
			IP = (null == domain || "".equals(domain)) ? IP : domain;
		}
		if(!"0".equals(ipconfig)){
			String header =req.getHeader("x-ip-config");
			if(header!=null){
				IP = header;
			}
		} else if("0".equals(ipconfig)){//如果是公网环境，将ip改为分省域名
			String domain = Config.getDomain(province);
			IP = (null == domain || "".equals(domain)) ? IP : domain;//若获取分省域名失败，则返回crm.189.cn
		}
		return IP;
	}
	
	/**
	 * 获取密码
	 * @return
	 * @deprecated 安全需求：从首页面去掉忘记密码功能
	 */
	@Deprecated
	public static String getForgetPasswordVersion(HttpServletRequest req){
		String version = getProperties().getProperty("forgetPasswordVersion");
		if(!"81".equals(version) && !"82".equals(version) && !"83".equals(version) && !"84".equals(version)){
			version = "9";
		}
		System.out.println("端口=============="+version);
		return version;
	}
	
	/**
	 * 获取登陆配置文件
	 * @return
	 */
	public static Properties getProperties() {	
		Properties p = new Properties();
		try {
			InputStream in = Config.class.getResourceAsStream("/portal/loginConfig.properties");//服务器环境使用
//			InputStream in = Config.class.getResourceAsStream("/loginConfig.properties");//localhost使用
		    if(in !=null){
				p.load(in);
				in.close();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return p;
	}
	
	public static String getAreaName(String areaId){
		if(areaId==null || "".equals(areaId)){
			return "";
		}
		areaId = areaId.substring(0, 3);
		Integer i = Integer.valueOf(areaId);
		String areaName = "";
		switch(i){
			case 811: areaName = "beijing";  break;
			case 812: areaName = "tianjing"; break;
			case 814: areaName = "shxi"; break;
			case 815: areaName = "neimenggu"; break;
			case 821: areaName = "liaoning"; break;
			case 822: areaName = "jilin"; break;
			case 835: areaName = "fujian";  break;
			case 843: areaName = "hunan"; break;
			case 850: areaName = "chongqing"; break;
			case 852: areaName = "guizhou"; break;
			case 853: areaName = "yunnan"; break;
			case 854: areaName = "xizang"; break;	
			case 863: areaName = "qinghai";  break;
			case 864: areaName = "ningxia"; break;
			case 865: areaName = "xinjiang"; break;
			case 844: areaName = "guangdong"; break;
			case 832: areaName = "jiangsu"; break;
			case 851: areaName = "sichuang"; break;	
			case 833: areaName = "zhejiang";  break;
			case 834: areaName = "anhui"; break;
			case 861: areaName = "shanxi"; break;
			case 842: areaName = "hubei"; break;
			case 831: areaName = "shanghai"; break;
			case 813: areaName = "hebei"; break;
			case 837: areaName = "shandong";  break;
			case 845: areaName = "guangxi"; break;
			case 841: areaName = "henan"; break;
			case 862: areaName = "gansu"; break;
			case 836: areaName = "jiangxi"; break;
			case 846: areaName = "hainan"; break;
			case 823: areaName = "heilongjiang"; break;
			case 899: areaName = "xuni"; break;
		}
		return areaName;
	}
	
	/**
	 * 获取省份版本
	 * @return
	 */
	public static String getProvVersion(String province){
		String version = getProperties().getProperty(province+"Version");
		if(!"81".equals(version) && 
				!"82".equals(version) && 
				!"83".equals(version) && 
				!"84".equals(version) && 
				!"93".equals(version) && 
				!"94".equals(version)){
			version = "9";//获取文件失败
		}
		System.out.println("**********************统一登录[端口版本号]:"+version);
		return version;
	}
	
//	public static String getMACAddr()throws SocketException, UnknownHostException {
//	   // 获得ＩＰ
//	   NetworkInterface netInterface = NetworkInterface.getByInetAddress(InetAddress.getLocalHost());
//	   // 获得Mac地址的byte数组
//	   byte[] macAddr = netInterface.getHardwareAddress();
//	   System.out.print("MAC Addr:\t");
//	   // 循环输出
//	   String mac = "";
//	   for(byte b:macAddr){
//		   mac+=toHexString(b)+" ";
//	   }
//	   return mac;
//	}
	
//	private static String toHexString(int integer) {
//		// 将得来的int类型数字转化为十六进制数
//		String str = Integer.toHexString((int) (integer & 0xff));
//		// 如果遇到单字符，前置0占位补满两格
//		if (str.length() == 1) {
//			str = "0" + str;
//		}
//		return str;
//	}
	
	public static void addCookie(String areaId,HttpServletResponse response,HttpServletRequest request){
	    response.addHeader("P3P", "CP=CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR");
		//向cookie中添加标记
	    delCookie(response, "_UNIFY_LOGIN_AREA_SIGN", null, null, request);
		addCookie(response, "/", 24*60*60, "_UNIFY_LOGIN_AREA_SIGN",areaId);
	}
	
	public static Cookie addCookie(HttpServletResponse response, String path, int expiry, String key, String value) {
        Cookie cook = new Cookie(key, value);
        cook.setMaxAge(expiry);
        cook.setPath(path);
        response.addCookie(cook);
        return cook;
    }
	
	public static void delCookie(HttpServletResponse response, String key, String domain, String path,
            HttpServletRequest request) {
        Cookie[] cooks = request.getCookies();
        //为NULL
        if (cooks == null) {
            return;
        }
        for (int i = 0; i < cooks.length; i++) {
            Cookie cook = cooks[i];
            String name = cook.getName();
            if (name.equals(key)) {
                cook.setMaxAge(0);
                if (domain != null) {
                    cook.setDomain(domain);
                }
                if (path != null) {
                    cook.setPath(path);
                }
                response.addCookie(cook);
            }
        }
    }
	
	public static Cookie getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (int i = 0; i < cookies.length; i++) {
                if (name.equals(cookies[i].getName())) {
                    return cookies[i];
                }
            }
        }
        return null;
    }
	
	/**
	 * 获取分省域名字符串<br/>
	 * 根据营业前台登录，根据选择省分不同，重定向至分省域名 如，选择江苏 重定向至js.crm.189.cn/xxxx
	 * @param province省份拼音
	 * @return 分省域名字符串<br/>
	 * 域名为完整域名，从配置文件中获取。例如：北京域名应为"beijing.crm.189.cn"，山西域名应为"shxi.crm.189.cn"这样的格式，端口信息(如":83")以及HTTP请求头信息(如"http://")不应添加到域名里面。
	 * <br/>如果无法从配置文件读取数据或读取失败，则返回字符串crm.189.cn
	 * @author ZhangYu
	 */
	public static String getDomain(String province){
		String domain = getProperties().getProperty(province+"Domain");
		if((domain == null) ||  ("".equals(domain))){
			System.out.println("**********************统一登录[域名] :"+domain);
			return "crm.189.cn";
		} else{
			System.out.println("**********************统一登录[域名] :"+domain);
			return domain;
		}
	}
}

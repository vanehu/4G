package com.al.lte.portal.common;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.RenderingHints;
import java.awt.Transparency;
import java.awt.geom.AffineTransform;
import java.awt.geom.Point2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;

import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.lte.portal.model.SessionStaff;

/**
 * 无纸化签名工具
 * 
 * @author chenfeng
 * 
 */
public class DataSignTool {

	public static String DES_KEY_E = "hi asiainfo-linkage !!!";
	/**
	 * 加密密钥
	 */
	public static String DES_KEY = "Hello AL Key @0987!@#$%+<>{~!";
	/**
	 * 原文与防篡改密文分隔符
	 */
	public static String SPLIT_1 = "&#&#";
	/**
	 * 每个内容字段的分隔符
	 */
	public static String SPLIT_2 = "&=&=";
	/**
	 * 字段名称跟值的分隔符
	 */
	public static String SPLIT_3 = "&-&-";

	/**
	 * 公章key
	 */
	public static final String COMPANY_SALE = "companyseal";
	/**
	 * 订单信息
	 */
	public static final String ORDER_MSG = "ordermsg";

	/**
	 * html报文key
	 */
	public static final String HTML = "html";

	/**
	 * 证件照片
	 */
	public static final String CAMERA_PICTURE = "picture";

	/**
	 * 签名信息
	 */
	public static final String SIGN_DATA = "signdata";

	/**
	 * 是否解析成功
	 */
	private boolean isParseSuccess;

	/**
	 * 解析后的内容
	 */
	private Map<String, Object> itemMap;

	public boolean isParseSuccess() {
		return isParseSuccess;
	}

	public void setParseSuccess(boolean isParseSuccess) {
		this.isParseSuccess = isParseSuccess;
	}

	public Map<String, Object> getItemMap() {
		return itemMap;
	}

	/**
	 * 
	 * 十六进制转换字符串
	 */

	public static byte[] hexStr2Bytes(String hexStr) {

		hexStr = hexStr.toUpperCase();

		String str = "0123456789ABCDEF";

		char[] hexs = hexStr.toCharArray();

		byte[] bytes = new byte[hexStr.length() / 2];

		int n;

		for (int i = 0; i < bytes.length; i++) {

			n = str.indexOf(hexs[2 * i]) * 16;

			n += str.indexOf(hexs[2 * i + 1]);

			bytes[i] = (byte) (n & 0xff);

		}

		return bytes;

	}

	/**
	 * 是否是正确的报文
	 * 
	 * @param data
	 * @return
	 */
	public static DataSignResultModel isRightData(String data) {
		DataSignResultModel result = new DataSignResultModel();
		DESPlus des = new DESPlus(DES_KEY);
		// System.out.println("报文内容："+data);
		String orgText = des.decrypt(data);
		// System.out.println("解密内容："+orgText);
		String[] messages = orgText.split(SPLIT_1); // 分割报文
		if (messages == null || messages.length != 2) { // 分割后的长度不为2表示报文错误
			result.setParseSuccess(false);
			return result;
		}

		String md5Text = null;
		try {
			md5Text = DigestUtils.md5Hex(messages[0].getBytes("UTF-8"));
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if (md5Text == null || md5Text.equals(messages[1]) == false) {
			result.setParseSuccess(false);
			return result;
		}

		parseData(messages[0], result);
		result.setParseSuccess(true);
		return result;
	}
	public static void signPdfPrint(Map<String,Object> map,HttpServletResponse response)
			throws Exception {
		try {
			if(map.get("orderInfo")!=null){
				GenerateFile(map.get("orderInfo").toString(),response);
			}else{
				throw new Exception("对不起，返回电子订单信息字符串为空！");
			}
        } catch (BusinessException exp) {
        	exp.printStackTrace();
            response.setContentType("text/html; charset=GB18030");
            response.setHeader("Content-Language", "GB18030");
            response.setHeader("encoding", "GB18030");
            response.getWriter().write(exp.getMessage());
        }
	}
	private static void GenerateFile(String str, HttpServletResponse response)
			throws Exception {
		byte[] bytes = Base64.decodeBase64(new String(str).getBytes());
		if (bytes != null && bytes.length > 0) {
			response.reset();
			response.setContentType("application/pdf;charset=GB18030");
			response.setContentLength(bytes.length);
			ServletOutputStream ouputStream = response.getOutputStream();
			ouputStream.write(bytes, 0, bytes.length);
			ouputStream.flush();
			ouputStream.close();
		} else {
			throw new Exception("对不起，解析电子订单数据异常！");
		}
	}

	/**
	 * 解析数据
	 * 
	 * @param string
	 * @param result
	 */
	private static void parseData(String data, DataSignResultModel result) {
		String[] items = data.split(SPLIT_2);
		Map<String, Object> map = new HashMap<String, Object>();
		if (items.length == 0) {
			result.setParseSuccess(false);
		}
		for (String item : items) {
			String[] nameAndValues = item.split(SPLIT_3);
			if (nameAndValues.length != 2) {
				result.setParseSuccess(false);
				break;
			}
			map.put(nameAndValues[0], nameAndValues[1]);
		}
		result.setItemMap(map);
	}
	public static String getAreaName(String areaId,SessionStaff sessionStaff){
		String jsonStr="{\"8652800\":\"巴音郭楞蒙古自治州\",\"8652900\":\"阿克苏地区\",\"8653000\":\"克孜勒苏柯尔克孜自治州\",\"8653100\":\"喀什地区\",\"8653200\":\"和田地区\",\"8654000\":\"伊犁哈萨克自治州\",\"8654200\":\"塔城地区\",\"8654300\":\"阿勒泰地区\",\"8659001\":\"石河子市\",\"8659002\":\"阿拉尔市\",\"8659003\":\"图木舒克市\",\"8659004\":\"五家渠市\",\"8140100\":\"太原市\",\"8140200\":\"大同市\",\"8140300\":\"阳泉市\",\"8140400\":\"长治市\",\"8140500\":\"晋城市\",\"8140600\":\"朔州市\",\"8140700\":\"晋中市\",\"8140800\":\"运城市\",\"8140900\":\"忻州市\",\"8141000\":\"临汾市\",\"8141100\":\"吕梁市\",\"8410100\":\"郑州市\",\"8410200\":\"开封市\",\"8410300\":\"洛阳市\",\"8410400\":\"平顶山市\",\"8410500\":\"安阳市\",\"8410600\":\"鹤壁市\",\"8410700\":\"新乡市\",\"8410800\":\"焦作市\",\"8410900\":\"濮阳市\",\"8411000\":\"许昌市\",\"8411100\":\"漯河市\",\"8411200\":\"三门峡市\",\"8411300\":\"南阳市\",\"8411400\":\"商丘市\",\"8411500\":\"信阳市\",\"8411600\":\"周口市\",\"8411700\":\"驻马店市\",\"8419001\":\"济源市\",\"8210100\":\"沈阳市\",\"8210200\":\"大连市\",\"8210300\":\"鞍山市\",\"8210400\":\"抚顺市\",\"8210500\":\"本溪市\",\"8210600\":\"丹东市\",\"8210700\":\"锦州市\",\"8210800\":\"营口市\",\"8210900\":\"阜新市\",\"8211000\":\"辽阳市\",\"8211100\":\"盘锦市\",\"8211200\":\"铁岭市\",\"8211300\":\"朝阳市\",\"8211400\":\"葫芦岛市\",\"8220100\":\"长春市\",\"8220200\":\"吉林市\",\"8220300\":\"四平市\",\"8220400\":\"辽源市\",\"8220500\":\"通化市\",\"8220600\":\"白山市\",\"8220700\":\"松原市\",\"8220800\":\"白城市\",\"8222400\":\"延边朝鲜族自治州\",\"8230100\":\"哈尔滨市\",\"8230200\":\"齐齐哈尔市\",\"8230300\":\"鸡西市\",\"8230400\":\"鹤岗市\",\"8230500\":\"双鸭山市\",\"8230600\":\"大庆市\",\"8230700\":\"伊春市\",\"8230800\":\"佳木斯市\",\"8230900\":\"七台河市\",\"8231000\":\"牡丹江市\",\"8231100\":\"黑河市\",\"8231200\":\"绥化市\",\"8232700\":\"大兴安岭地区\",\"8150100\":\"呼和浩特市\",\"8150200\":\"包头市\",\"8150300\":\"乌海市\",\"8150400\":\"赤峰市\",\"8150500\":\"通辽市\",\"8150600\":\"鄂尔多斯市\",\"8150700\":\"呼伦贝尔市\",\"8150800\":\"巴彦淖尔市\",\"8150900\":\"乌兰察布市\",\"8152200\":\"兴安盟\",\"8152500\":\"锡林郭勒盟\",\"8152900\":\"阿拉善盟\",\"8320100\":\"南京市\",\"8320200\":\"无锡市\",\"8320300\":\"徐州市\",\"8320400\":\"常州市\",\"8320500\":\"苏州市\",\"8320600\":\"南通市\",\"8320700\":\"连云港市\",\"8320800\":\"淮安市\",\"8320900\":\"盐城市\",\"8321000\":\"扬州市\",\"8321100\":\"镇江市\",\"8321200\":\"泰州市\",\"8321300\":\"宿迁市\",\"8370100\":\"济南市\",\"8370200\":\"青岛市\",\"8370300\":\"淄博市\",\"8370400\":\"枣庄市\",\"8370500\":\"东营市\",\"8370600\":\"烟台市\",\"8370700\":\"潍坊市\",\"8370800\":\"济宁市\",\"8370900\":\"泰安市\",\"8371000\":\"威海市\",\"8371100\":\"日照市\",\"8371200\":\"莱芜市\",\"8371300\":\"临沂市\",\"8371400\":\"德州市\",\"8371500\":\"聊城市\",\"8371600\":\"滨州市\",\"8371700\":\"菏泽市\",\"8340100\":\"合肥市\",\"8340200\":\"芜湖市\",\"8340300\":\"蚌埠市\",\"8340400\":\"淮南市\",\"8340500\":\"马鞍山市\",\"8340600\":\"淮北市\",\"8340700\":\"铜陵市\",\"8340800\":\"安庆市\",\"8341000\":\"黄山市\",\"8341100\":\"滁州市\",\"8341200\":\"阜阳市\",\"8341300\":\"宿州市\",\"8341500\":\"六安市\",\"8341600\":\"亳州市\",\"8341700\":\"池州市\",\"8341800\":\"宣城市\",\"8330100\":\"杭州市\",\"8330200\":\"宁波市\",\"8330300\":\"温州市\",\"8330400\":\"嘉兴市\",\"8330500\":\"湖州市\",\"8330600\":\"绍兴市\",\"8330700\":\"金华市\",\"8330800\":\"衢州市\",\"8330900\":\"舟山市\",\"8331000\":\"台州市\",\"8331100\":\"丽水市\",\"8350100\":\"福州市\",\"8350200\":\"厦门市\",\"8350300\":\"莆田市\",\"8350400\":\"三明市\",\"8350500\":\"泉州市\",\"8350600\":\"漳州市\",\"8350700\":\"南平市\",\"8350800\":\"龙岩市\",\"8350900\":\"宁德市\",\"8420100\":\"武汉市\",\"8420200\":\"黄石市\",\"8420300\":\"十堰市\",\"8420500\":\"宜昌市\",\"8420600\":\"襄阳市\",\"8420700\":\"鄂州市\",\"8420800\":\"荆门市\",\"8420900\":\"孝感市\",\"8421000\":\"荆州市\",\"8421100\":\"黄冈市\",\"8421200\":\"咸宁市\",\"8421300\":\"随州市\",\"8422800\":\"恩施土家族苗族自治州\",\"8429004\":\"仙桃市\",\"8429005\":\"潜江市\",\"8429006\":\"天门市\",\"8429021\":\"神农架林区\",\"8430100\":\"长沙市\",\"8430200\":\"株洲市\",\"8430300\":\"湘潭市\",\"8430400\":\"衡阳市\",\"8430500\":\"邵阳市\",\"8430600\":\"岳阳市\",\"8430700\":\"常德市\",\"8430800\":\"张家界市\",\"8430900\":\"益阳市\",\"8431000\":\"郴州市\",\"8431100\":\"永州市\",\"8431200\":\"怀化市\",\"8431300\":\"娄底市\",\"8433100\":\"湘西土家族苗族自治州\",\"8440100\":\"广州市\",\"8440200\":\"韶关市\",\"8440300\":\"深圳市\",\"8440400\":\"珠海市\",\"8440500\":\"汕头市\",\"8440600\":\"佛山市\",\"8440700\":\"江门市\",\"8440800\":\"湛江市\",\"8440900\":\"茂名市\",\"8441200\":\"肇庆市\",\"8441300\":\"惠州市\",\"8441400\":\"梅州市\",\"8441500\":\"汕尾市\",\"8441600\":\"河源市\",\"8441700\":\"阳江市\",\"8441800\":\"清远市\",\"8441900\":\"东莞市\",\"8442000\":\"中山市\",\"8445100\":\"潮州市\",\"8445200\":\"揭阳市\",\"8445300\":\"云浮市\",\"8450100\":\"南宁市\",\"8450200\":\"柳州市\",\"8450300\":\"桂林市\",\"8450400\":\"梧州市\",\"8450500\":\"北海市\",\"8450600\":\"防城港市\",\"8450700\":\"钦州市\",\"8450800\":\"贵港市\",\"8450900\":\"玉林市\",\"8451000\":\"百色市\",\"8451100\":\"贺州市\",\"8451200\":\"河池市\",\"8451300\":\"来宾市\",\"8451400\":\"崇左市\",\"8360100\":\"南昌市\",\"8360200\":\"景德镇市\",\"8360300\":\"萍乡市\",\"8360400\":\"九江市\",\"8360500\":\"新余市\",\"8360600\":\"鹰潭市\",\"8360700\":\"赣州市\",\"8360800\":\"吉安市\",\"8360900\":\"宜春市\",\"8361000\":\"抚州市\",\"8361100\":\"上饶市\",\"8510100\":\"成都市\",\"8510300\":\"自贡市\",\"8510400\":\"攀枝花市\",\"8510500\":\"泸州市\",\"8510600\":\"德阳市\",\"8510700\":\"绵阳市\",\"8510800\":\"广元市\",\"8510900\":\"遂宁市\",\"8511000\":\"内江市\",\"8511100\":\"乐山市\",\"8511300\":\"南充市\",\"8511400\":\"眉山市\",\"8511500\":\"宜宾市\",\"8511600\":\"广安市\",\"8511700\":\"达州市\",\"8511800\":\"雅安市\",\"8511900\":\"巴中市\",\"8512000\":\"资阳市\",\"8513200\":\"阿坝藏族羌族自治州\",\"8513300\":\"甘孜藏族自治州\",\"8513400\":\"凉山彝族自治州\",\"8460100\":\"海口市\",\"8460200\":\"三亚市\",\"8460300\":\"三沙市\",\"8469001\":\"五指山市\",\"8469002\":\"琼海市\",\"8469003\":\"儋州市\",\"8469005\":\"文昌市\",\"8469006\":\"万宁市\",\"8469007\":\"东方市\",\"8469021\":\"定安县\",\"8469022\":\"屯昌县\",\"8469023\":\"澄迈县\",\"8469024\":\"临高县\",\"8469025\":\"白沙黎族自治县\",\"8469026\":\"昌江黎族自治县\",\"8469027\":\"乐东黎族自治县\",\"8469028\":\"陵水黎族自治县\",\"8469029\":\"保亭黎族苗族自治县\",\"8469030\":\"琼中黎族苗族自治县\",\"8469031\":\"西沙群岛\",\"8469032\":\"南沙群岛\",\"8469033\":\"中沙群岛的岛礁及其海域\",\"8520100\":\"贵阳市\",\"8520200\":\"六盘水市\",\"8520300\":\"遵义市\",\"8520400\":\"安顺市\",\"8522200\":\"铜仁地区\",\"8522300\":\"黔西南布依族苗族自治州\",\"8522400\":\"毕节地区\",\"8522600\":\"黔东南苗族侗族自治州\",\"8522700\":\"黔南布依族苗族自治州\",\"8530100\":\"昆明市\",\"8530300\":\"曲靖市\",\"8530400\":\"玉溪市\",\"8530500\":\"保山市\",\"8530600\":\"昭通市\",\"8530700\":\"丽江市\",\"8530800\":\"普洱市\",\"8530900\":\"临沧市\",\"8532300\":\"楚雄彝族自治州\",\"8532500\":\"红河哈尼族彝族自治州\",\"8532600\":\"文山壮族苗族自治州\",\"8532800\":\"西双版纳傣族自治州\",\"8532900\":\"大理白族自治州\",\"8533100\":\"德宏傣族景颇族自治州\",\"8533300\":\"怒江傈僳族自治州\",\"8533400\":\"迪庆藏族自治州\",\"8540100\":\"拉萨市\",\"8542100\":\"昌都地区\",\"8542200\":\"山南地区\",\"8542300\":\"日喀则地区\",\"8542400\":\"那曲地区\",\"8542500\":\"阿里地区\",\"8542600\":\"林芝地区\",\"8610100\":\"西安市\",\"8610200\":\"铜川市\",\"8610300\":\"宝鸡市\",\"8610400\":\"咸阳市\",\"8610500\":\"渭南市\",\"8610600\":\"延安市\",\"8610700\":\"汉中市\",\"8610800\":\"榆林市\",\"8610900\":\"安康市\",\"8611000\":\"商洛市\",\"8620100\":\"兰州市\",\"8620200\":\"嘉峪关市\",\"8620300\":\"金昌市\",\"8620400\":\"白银市\",\"8620500\":\"天水市\",\"8620600\":\"武威市\",\"8620700\":\"张掖市\",\"8620800\":\"平凉市\",\"8620900\":\"酒泉市\",\"8621000\":\"庆阳市\",\"8621100\":\"定西市\",\"8621200\":\"陇南市\",\"8622900\":\"临夏回族自治州\",\"8623000\":\"甘南藏族自治州\",\"8630100\":\"西宁市\",\"8632100\":\"海东地区\",\"8632200\":\"海北藏族自治州\",\"8632300\":\"黄南藏族自治州\",\"8632500\":\"海南藏族自治州\",\"8632600\":\"果洛藏族自治州\",\"8632700\":\"玉树藏族自治州\",\"8632800\":\"海西蒙古族藏族自治州\",\"8640100\":\"银川市\",\"8640200\":\"石嘴山市\",\"8640300\":\"吴忠市\",\"8640400\":\"固原市\",\"8640500\":\"中卫市\",\"8650100\":\"乌鲁木齐市\",\"8650200\":\"克拉玛依市\",\"8652100\":\"吐鲁番地区\",\"8652200\":\"哈密地区\",\"8652300\":\"昌吉回族自治州\",\"8652700\":\"博尔塔拉蒙古自治州\",\"8130100\":\"石家庄市\",\"8130200\":\"唐山市\",\"8130300\":\"秦皇岛市\",\"8130400\":\"邯郸市\",\"8130500\":\"邢台市\",\"8130600\":\"保定市\",\"8130700\":\"张家口市\",\"8130800\":\"承德市\",\"8130900\":\"沧州市\",\"8131000\":\"廊坊市\",\"8131100\":\"衡水市\",\"8110000\":\"北京市\",\"8310000\":\"上海市\",\"8120000\":\"天津市\",\"8500000\":\"重庆市\"}";
		String returnStr="";
		Map<String,String> map=JsonUtil.toObject(jsonStr, Map.class);
		if(areaId==null||"".equals(areaId)){
			returnStr=sessionStaff.getCityName();
		}else{
			if(map.get(areaId)!=null){
				returnStr=map.get(areaId);
			}else{
				returnStr=sessionStaff.getCityName();
			}
		}
		if("".equals(returnStr)){
			returnStr=sessionStaff.getRegionName();
		}
		if(returnStr.endsWith("市")){
			returnStr=returnStr.substring(0, returnStr.length()-1);
		}else if(returnStr.endsWith("自治州")){
			returnStr=returnStr.substring(0, returnStr.length()-3);
		}else if(returnStr.endsWith("地区")){
			returnStr=returnStr.substring(0, returnStr.length()-2);
		}else if(returnStr.endsWith("自治县")){
			returnStr=returnStr.substring(0, returnStr.length()-3);
		}
		return returnStr;
	}
	public static String getbody(String htmlStr) {
		if (htmlStr.indexOf("</head>") != -1) {
			htmlStr = htmlStr.substring(htmlStr.indexOf("</head>"),
					htmlStr.length());
		}
		htmlStr = htmlStr.replace("</head>", "");
		htmlStr = htmlStr.replace("<html>", "");
		htmlStr = htmlStr
				.replace(
						"<body text=\"#000000\" link=\"#000000\" alink=\"#000000\" vlink=\"#000000\">",
						"");
		htmlStr = htmlStr.replace("</body>", "");
		htmlStr = htmlStr.replace("</html>", "");
		return htmlStr;
	}
	public static byte[] creatImageToByte(String st)throws Exception{
		try {
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			ImageIO.write(creatImage(st), "PNG", out);
			byte[] b = out.toByteArray();
			return b;
		}catch (IOException e) {
			throw new BusinessException(ErrorCode.FTP_UPLOAD_ERROR, null,null, e);
		}
	}
	/*private static BufferedImage creatImage(String st) {
		int width = 300, height = 300;
		BufferedImage image = new BufferedImage(width, height,
				BufferedImage.TYPE_INT_RGB);
		Graphics2D g2 = image.createGraphics();
		image = g2.getDeviceConfiguration().createCompatibleImage(width,
				height, Transparency.TRANSLUCENT);
		g2.dispose();
		g2 = image.createGraphics();
		BasicStroke stroke = new BasicStroke(6); // 创建宽度是6的笔画对象
		g2.setStroke(stroke); // 设置笔画对象
		Color color = new Color(207, 1, 53); // 创建颜色对象
		g2.setColor(color); // 指定颜色
		g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
				RenderingHints.VALUE_ANTIALIAS_ON);
		g2.drawOval(4,4, 292, 292);
		// 绘制文本
		String st2="业务受理专用章";
		char ch[] = st.toCharArray();
		Map<String,Object> info=getFontAndAng(ch);
		int fontSize=(Integer)info.get("fontSize");
		double an= (Double)info.get("angle");
		Font font = new Font("宋体", Font.BOLD, fontSize); // 创建字体
		if(fontSize<26){
			font = new Font("宋体", Font.PLAIN, fontSize); // 创建字体
		}
		g2.setFont(font); // 设置字体
		FontMetrics fm = g2.getFontMetrics();
		int x=(width-fm.stringWidth(st2))/2+2;
		g2.drawString(st2,x, 246); // 绘制文本
		int size=272;
		Point pt = new Point(size/ 2, size / 2);
		int radius = (int) (pt.x * 0.84);//0.84
		drawCircleText(g2,ch, pt, radius, -Math.PI / an, 1.0);
		g2.dispose();
		return image;
	}
	private static Map<String,Object> getFontAndAng(char[] ch){
		Map<String,Object> re=new HashMap<String,Object>();
		double an= 1.67;
		int fontSize=26;
		if(ch.length==10){
			fontSize=30;
			an=2.3;
		}else if(ch.length==11){
			fontSize=30;
			an=2.1;
		}else if(ch.length==12){
			fontSize=30;
			an=1.9;
		}else if(ch.length==13){
			fontSize=30;
			an=1.7;
		}else if(ch.length==14){
			fontSize=28;
			an=1.57;
		}else if(ch.length==15){
		}else if(ch.length==16){
			an= 1.58;
		}else if(ch.length==17){
			an= 1.6;
			fontSize=24;
		}else if(ch.length==18){
			an= 1.52;
			fontSize=24;
		}else if(ch.length==19){
			an= 1.54;
			fontSize=23;
		}else if(ch.length==20){
			an= 1.52;
			fontSize=22;
		}else if(ch.length==21){
			an= 1.52;
			fontSize=21;
		}else if(ch.length==22){
			an= 1.5;
			fontSize=20;
		}else if(ch.length==23){
			an= 1.43;
			fontSize=20;
		}else if(ch.length==24){
			an= 1.48;
			fontSize=19;
		}else if(ch.length==25){
			an= 1.43;
			fontSize=19;
		}
		re.put("fontSize", fontSize);
		re.put("angle", an);
		return re;
	}
	private static void drawCircleText(Graphics2D g, char[] ch, Point center,
			double r, double a1, double af) {
		//char ch[] = st.toCharArray();
		double curangle = a1;
		Point2D c = new Point2D.Double(center.x+14, center.y+14);
		//Point2D c = new Point2D.Double(center.x+20, center.y+20);
		FontMetrics fm = g.getFontMetrics();
		AffineTransform xform1, cxform;
		xform1 = AffineTransform.getTranslateInstance(c.getX(), c.getY());
		for (int i = 0; i < ch.length; i++) {
			double cwid = (double) (getWidth(ch[i], fm));
			if (!(ch[i] == ' ' || Character.isSpaceChar(ch[i]))) {
				cwid = (double) (fm.charWidth(ch[i]));
				cxform = new AffineTransform(xform1);
				cxform.rotate(curangle, 0.0, 0.0);
				String chstr = new String(ch, i, 1);
				g.setTransform(cxform);
				g.drawString(chstr, (float) (-cwid / 2), (float) (-r));
			}
			if (i < (ch.length - 1)) {
				double adv = cwid / 2.0 + fm.getLeading()
						+ getWidth(ch[i + 1], fm) / 2.0;
				curangle += Math.atan(adv / r);

			}
		}
	}

	private static int getWidth(char c, FontMetrics fm) {
		if (c == ' ' || Character.isSpaceChar(c)) {
			return fm.charWidth('n');
		} else {
			return fm.charWidth(c);
		}

	}*/
	private static BufferedImage creatImage(String st) {
		int width = 300, height = 300;
		BufferedImage image = new BufferedImage(width, height,
				BufferedImage.TYPE_INT_RGB);
		Graphics2D g2 = image.createGraphics();
		image = g2.getDeviceConfiguration().createCompatibleImage(width,
				height, Transparency.TRANSLUCENT);
		g2.dispose();
		g2 = image.createGraphics();
		BasicStroke stroke = new BasicStroke(6); // 创建宽度是6的笔画对象
		g2.setStroke(stroke); // 设置笔画对象
		Color color = new Color(207, 1, 53); // 创建颜色对象
		g2.setColor(color); // 指定颜色
		g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
				RenderingHints.VALUE_ANTIALIAS_ON);
		g2.drawOval(6,6, 288, 288);
		// 绘制文本
		String st2="业务受理专用章";
		char ch[] = st.toCharArray();
		Map<String,Object> info=getFontAndAng(ch);
		int fontSize=(Integer)info.get("fontSize");
		double an= (Double)info.get("angle");
		Font font = new Font("宋体", Font.BOLD, fontSize); // 创建字体
		if(fontSize<26){
			font = new Font("宋体", Font.PLAIN, fontSize); // 创建字体
		}
		g2.setFont(font); // 设置字体
		drawText(g2,width,st2);
		int size=260;
		Point pt = new Point(size/ 2, size / 2);
		int radius = (int) (pt.x * 0.84);//0.84
		drawCircleText(g2,ch, pt, radius, -Math.PI / an, 1.0);
		g2.dispose();
		return image;
	}
	private static void drawText(Graphics2D g,int width,String st2) {
		char[] ch=st2.toCharArray();
		FontMetrics fm = g.getFontMetrics();
		int x=(width-(fm.stringWidth(st2)-ch.length*5))/2+2;
		for (int i = 0; i < ch.length; i++) {
			double cwid = (double) (getWidth(ch[i], fm))+10;
			String chstr = new String(ch, i, 1);
			g.drawString(chstr,x, 246);
			x+=cwid*2/2;
		}
	}
	private static Map<String,Object> getFontAndAng(char[] ch){
		Map<String,Object> re=new HashMap<String,Object>();
		double an= 1.72;
		int fontSize=30;
		if(ch.length==10){
			an=2.7;
		}else if(ch.length==11){
			an=2.5;
		}else if(ch.length==12){
			an=2.2;
		}else if(ch.length==13){
			an=2.1;
		}else if(ch.length==14){
			an=1.9;
		}else if(ch.length==15){
		}else if(ch.length==16){
			fontSize=29;
			an= 1.6;
		}else if(ch.length==17){
			fontSize=28;
			an= 1.63;
		}else if(ch.length==18){
			fontSize=27;
			an= 1.65;
		}else if(ch.length==19){
			fontSize=26;
			an= 1.62;
		}else if(ch.length==20){
			fontSize=26;
			an= 1.55;
		}else if(ch.length==21){
			fontSize=26;
			an= 1.48;
		}else if(ch.length==22){
			fontSize=25;
			an= 1.51;
		}else if(ch.length==23){
			fontSize=25;
			an= 1.45;
		}else if(ch.length==24){
			fontSize=24;
			an= 1.44;
		}else if(ch.length==25){
			fontSize=24;
			an= 1.39;
		}
		re.put("fontSize", fontSize);
		re.put("angle", an);
		return re;
	}
	private static void drawCircleText(Graphics2D g, char[] ch, Point center,
			double r, double a1, double af) {
		//char ch[] = st.toCharArray();
		double curangle = a1;
		Point2D c = new Point2D.Double(center.x+20, center.y+20);
		//Point2D c = new Point2D.Double(center.x+20, center.y+20);
		FontMetrics fm = g.getFontMetrics();
		AffineTransform xform1, cxform;
		xform1 = AffineTransform.getTranslateInstance(c.getX(), c.getY());
		for (int i = 0; i < ch.length; i++) {
			double cwid = (double) (getWidth(ch[i], fm));
			if (!(ch[i] == ' ' || Character.isSpaceChar(ch[i]))) {
				cwid = (double) (fm.charWidth(ch[i]));
				cxform = new AffineTransform(xform1);
				cxform.rotate(curangle, 0.0, 0.0);
				String chstr = new String(ch, i, 1);
				g.setTransform(cxform);
				g.drawString(chstr, (float) (-cwid / 2), (float) (-r));
			}
			if (i < (ch.length - 1)) {
				double adv = cwid / 2.0 + fm.getLeading()
						+ getWidth(ch[i + 1], fm) / 2.0;
				curangle += Math.atan(adv / r);

			}
		}
	}

	static int getWidth(char c, FontMetrics fm) {
		if (c == ' ' || Character.isSpaceChar(c)) {
			return fm.charWidth('n');
		} else {
			return fm.charWidth(c)-15;
		}

	}
	public static void main(String[] args) {
		//getbody("<html><head><title>HtmlAnalyse</title></head><body text=\"#000000\" link=\"#000000\" alink=\"#000000\" vlink=\"#000000\"><h1>HtmlAnalyse</h1>it's body</body></html>");
		System.out.println(getAreaName("8130700",null));
	}
}

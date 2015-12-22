package com.al.lte.portal.common;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.model.SessionStaff;


/**
 * Ehcache 工具 类 概述 .
 * <BR>
 *  考虑集群问题
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-8-8
 * @createDate 2012-8-8 上午11:23:01
 * @modifyDate tang zheng yu 2012-8-8 <BR>
 * @copyRight 亚信联创EC研发部
 */
public class EhcacheUtil {
	
	private static StaffBmo staffBmo;

	/**
	 * 删除指定前缀的Key
	 * @param cache
	 * @param prefixkey
	 *//*
	public static  void evictByPrefixkey(Cache cache,String prefixkey){
        if(cache!=null){
            Ehcache ehCache=(Ehcache)cache.getNativeCache();
            if(ehCache!=null){
                List<String> kesyList=ehCache.getKeys();
                if(kesyList !=null){
                	for(String key:kesyList){
                		 if(key.startsWith(prefixkey)) {
            				 cache.evict(key);    
            			 }
                	}
                	
                }
            }

        }
	}
	*//**
	 * 删除指定前缀的Key
	 * @param cache
	 * @param prefixkey
	 *//*
	public static  void evictByPrefixkey(EhCacheCacheManager ehCacheManager,String prefixkey){
		if(ehCacheManager ==null){
			return;
		}
		Collection<String> cachenameList=ehCacheManager.getCacheNames();
		if(cachenameList==null){
			return;
		}
		for(String cachename:cachenameList){
			evictByPrefixkey(ehCacheManager.getCache(cachename),prefixkey);
		}
	}*/
	
	//获取根节点，如果url中有? 会去掉 ? 比对
	public static String getCurrentPath(HttpSession session,String url){
		Object obj = session.getAttribute(SysConstant.SESSION_KEY_MENU_LIST);
		String path = "" ;
		String filterStr1 = "?" ;
		if(obj!=null && obj instanceof List){
			List<Map> list1 = (List<Map>)obj;
			for(Map rowTemp1:list1){
				if(filterHttpUrl(rowTemp1.get("menuPath"),filterStr1,url)){
					return rowTemp1.get("resourceId").toString();
				}
				List<Map> list2 = (List<Map>)rowTemp1.get("childMenuResources");
				for(Map rowTemp2:list2){
					if(filterHttpUrl(rowTemp2.get("menuPath"),filterStr1,url)){
						return rowTemp1.get("resourceId").toString();
					}
					List<Map> list3 = (List<Map>)rowTemp2.get("childMenuResources");
					for(Map rowTemp3:list3){
						if(filterHttpUrl(rowTemp3.get("menuPath"),filterStr1,url)){
							return rowTemp1.get("resourceId").toString();
						}
					}
				}
				
			}
		}
		return "" ;
	}
	
	//检查用户菜单中是否有 某个菜单，可控制用户的操作权限
	public static boolean pathIsInSession(HttpSession session,String url){
		try{
			Object obj = session.getAttribute(SysConstant.SESSION_KEY_MENU_LIST);
			if(obj!=null && obj instanceof List){
				List<Map> list1 = (List<Map>)obj;
				String filterStr1 = "?" ;
				for(Map rowTemp1:list1){
					if(filterHttpUrl(rowTemp1.get("menuPath"),filterStr1,url)){
						return true ;
					}
					List<Map> list2 = (List<Map>)rowTemp1.get("childMenuResources");
					for(Map rowTemp2:list2){
						if(filterHttpUrl(rowTemp2.get("menuPath"),filterStr1,url)){
							return true ;
						}
						List<Map> list3 = (List<Map>)rowTemp2.get("childMenuResources");
						for(Map rowTemp3:list3){
							if(filterHttpUrl(rowTemp3.get("menuPath"),filterStr1,url)){
								return true ;
							}
						}
					}
				}
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return false ;
	}
	//检查用户菜单中是否有 某个菜单，可控制用户的操作权限
		public static boolean pathIsInSessionNofilter(HttpSession session,String url){
			try{
				Object obj = session.getAttribute(SysConstant.SESSION_KEY_MENU_LIST);
				if(obj!=null && obj instanceof List){
					List<Map> list1 = (List<Map>)obj;
					for(Map rowTemp1:list1){
						if(filterHttpUrl(rowTemp1.get("menuPath"),"",url)){
							return true ;
						}
						List<Map> list2 = (List<Map>)rowTemp1.get("childMenuResources");
						for(Map rowTemp2:list2){
							if(filterHttpUrl(rowTemp2.get("menuPath"),"",url)){
								return true ;
							}
							List<Map> list3 = (List<Map>)rowTemp2.get("childMenuResources");
							for(Map rowTemp3:list3){
								if(filterHttpUrl(rowTemp3.get("menuPath"),"",url)){
									return true ;
								}
							}
						}
					}
				}
			}catch(Exception e){
				e.printStackTrace();
			}
			return false ;
		}
	//检查用户菜单中是否有 某个菜单，可控制用户的操作权限
	public static String getMenuOperation(HttpSession session,String url){
		try{
			String operateName = "authenticOperatCd" ;
			Object obj = session.getAttribute(SysConstant.SESSION_KEY_MENU_LIST);
			if(obj!=null && obj instanceof List){
				List<Map> list1 = (List<Map>)obj;
				String filterStr1 = "?" ;
				for(Map rowTemp1:list1){
					if(filterHttpUrl(rowTemp1.get("menuPath"),filterStr1,url)){
						return rowTemp1.get(operateName)==null?"":rowTemp1.get(operateName).toString() ;
					}
					List<Map> list2 = (List<Map>)rowTemp1.get("childMenuResources");
					for(Map rowTemp2:list2){
						if(filterHttpUrl(rowTemp2.get("menuPath"),filterStr1,url)){
							return rowTemp2.get(operateName)==null?"":rowTemp2.get(operateName).toString() ;
						}
						List<Map> list3 = (List<Map>)rowTemp2.get("childMenuResources");
						for(Map rowTemp3:list3){
							if(filterUrl(rowTemp3.get("menuPath"),filterStr1).endsWith(url)){
								return rowTemp3.get(operateName)==null?"":rowTemp3.get(operateName).toString() ;
							}
						}
					}
				}
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return "" ;
	}
	
	//检查用户菜单中是否有 某个菜单，可控制用户的操作权限
	public static String getOperateSpecInfo(HttpSession session,String url){
		try{
			String operateName = "operateSpecInfo" ;
			Object obj = session.getAttribute(SysConstant.SESSION_KEY_MENU_LIST);
			Object objOperate = null ;
			List<String> listOperate = null ;
			String strOpertate = "" ;
			if(obj!=null && obj instanceof List){
				List<Map> list1 = (List<Map>)obj;
				String filterStr1 = "?" ;
				for(Map rowTemp1:list1){
					if(filterHttpUrl(rowTemp1.get("menuPath"),filterStr1,url)){
						return listTOStr(rowTemp1.get(operateName),",");
					}
					List<Map> list2 = (List<Map>)rowTemp1.get("childMenuResources");
					for(Map rowTemp2:list2){
						if(filterHttpUrl(rowTemp2.get("menuPath"),filterStr1,url)){
							return listTOStr(rowTemp2.get(operateName),",");
						}
						List<Map> list3 = (List<Map>)rowTemp2.get("childMenuResources");
						for(Map rowTemp3:list3){
							if(filterHttpUrl(rowTemp3.get("menuPath"),filterStr1,url)){
								return listTOStr(rowTemp3.get(operateName),",");
							}
						}
					}
				}
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return "" ;
	}
	
	@SuppressWarnings("unchecked")
	public static String listTOStr(Object listObj,String SprateStr){
		String result = "" ;
		List<String> list = null ;
		if(listObj!=null && listObj instanceof List){
			list = (List<String>)listObj;
			if(list!=null&&list.size()>0){
				for(String str :list){
					result = result + str + SprateStr ;
				}
				if(result.endsWith(SprateStr)){
					result = result.substring(0,result.length()-1);
				}
				return result ;
			}
		}
		return result ;
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static List<Map> getBusinessMenu(HttpSession session,String resourceCode){
		boolean hasMenu = false ;
		Object obj = session.getAttribute("__menuList");
		List<Map> list = new ArrayList<Map>();
		List<Map> listMenu = new ArrayList<Map>();
		if(obj!=null && obj instanceof List){
			List<Map> list1 = (List<Map>)obj;
			for(Map rowTemp1:list1){
				if(hasMenu){
					break ;
				}
				if(!hasMenu&&rowTemp1.get("resourceCode")!=null&&rowTemp1.get("resourceCode").equals(resourceCode)){
					list = (List<Map>)rowTemp1.get("childMenuResources");
					hasMenu = true ;
				}
				List<Map> list2 = (List<Map>)rowTemp1.get("childMenuResources");
				for(Map rowTemp2:list2){
					if(hasMenu){
						break ;
					}
					if(!hasMenu&&rowTemp2.get("resourceCode")!=null&&rowTemp2.get("resourceCode").equals(resourceCode)){
						list = (List<Map>)rowTemp2.get("childMenuResources");
						hasMenu = true ;
					}
				}
			}
		}
		if(hasMenu&&list!=null&&list.size()>0){
			for(Map rowMap:list){
				if("N".equals(rowMap.get("isMainMenu"))){
					listMenu.add(rowMap);
				}
			}
			if(resourceCode.equals("YWSL")){
				CompareObject comparator=new CompareObject();
				comparator.setType("YWSL");
				Collections.sort(listMenu, comparator);
			}
		}
		return listMenu ;
	}

	public static String filterUrl(Object path,String x){
		if(path==null){
			return "" ;
		}
		String s_path = path.toString();
		if(s_path.contains(x)){
			s_path = s_path.substring(0,s_path.indexOf(x));
		}
		return s_path ;
	}
	
	public static boolean filterHttpUrl(Object path,String x,String url){
		if(path==null){
			return false ;
		}
		String s_path = path.toString();
		if(!"".equals(x)){
			if(s_path.contains(x)){
				s_path = s_path.substring(0,s_path.indexOf(x));
			}
		}
		if(s_path.startsWith("http")){
			return s_path.endsWith(url);
		}else{
			return s_path.equals(url);
		}
	}
	
	public static void main(String[] args) {
		String s = "123456" ;
		System.out.println(s.substring(0,s.indexOf("4")));
		
	}

	public static String getOperatCode(String code,String sessionCode,HttpServletRequest request,SessionStaff sessionStaff){
		String isViewOperation = "1" ;
		if(code==null&&sessionCode!=null){
			return isViewOperation;
		}
		isViewOperation= (String)ServletUtils.getSessionAttribute(request,sessionCode+"_"+sessionStaff.getStaffId());
		try{
 			if(isViewOperation==null){
 				if (staffBmo == null) {
 					staffBmo = (StaffBmo) SpringContextUtil.getBean("com.al.lte.portal.bmo.staff.StaffBmo");
 				}
 				isViewOperation=staffBmo.checkOperatSpec(code,sessionStaff);
 				ServletUtils.setSessionAttribute(request,sessionCode+"_"+sessionStaff.getStaffId(), isViewOperation);
 			}
		} catch (BusinessException e) {
				isViewOperation="1";
	 	} catch (InterfaceException ie) {
	 			isViewOperation="1";
		} catch (Exception e) {
				isViewOperation="1";
		}
		return isViewOperation;
		/*
		String isViewOperation= (String)ServletUtils.getSessionAttribute(request,SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId());
		try{
 			if(isViewOperation==null){
 				if (staffBmo == null) {
 					staffBmo = (StaffBmo) SpringContextUtil.getBean("com.al.lte.portal.bmo.staff.StaffBmo");				
 				}
 				isViewOperation=staffBmo.checkOperatSpec(SysConstant.VIEWSENSI_CODE,sessionStaff);
 				ServletUtils.setSessionAttribute(request,SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId(), isViewOperation);
 			}
			} catch (BusinessException e) {
				isViewOperation="1";
	 		} catch (InterfaceException ie) {
	 			isViewOperation="1";
			} catch (Exception e) {
				isViewOperation="1";
			}
			*/
	}
	
	/*
	 * 获取菜单中被授权访问的url集合;
	 * @param menuList
	 * @return
	 */
	public static Set<String> getAuthUrlInMenuList(Object menuList){
		try {
			if(menuList!=null && menuList instanceof List){
				Set<String> authUrls = new HashSet<String>();
				List<Map> list1 = (List<Map>)menuList;
				for(Map rowTemp1:list1){
					//以数组形式存储在funcs节点中,不以/开头
					Object func1 = rowTemp1.get("funcs");
					if(func1 != null && func1 instanceof List){
						for(String _f1 : (List<String>)func1){
							authUrls.add(_f1);
						}
					}
					List<Map> list2 = (List<Map>)rowTemp1.get("childMenuResources");
					for(Map rowTemp2:list2){
						Object func2 = rowTemp2.get("funcs");
						if(func2 != null && func2 instanceof List){
							for(String _f2 : (List<String>)func2){
								authUrls.add(_f2);
							}
						}
						List<Map> list3 = (List<Map>)rowTemp2.get("childMenuResources");
						for(Map rowTemp3:list3){
							Object func3 = rowTemp3.get("funcs");
							if(func3 != null && func3 instanceof List){
								for(String _f3 : (List<String>)func3){
									authUrls.add(_f3);
								}
							}
						}
					}
				}
				return authUrls;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	
}

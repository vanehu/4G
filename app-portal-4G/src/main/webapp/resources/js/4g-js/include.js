function $import(path, type){  
var i,   
base,   
src = "include.js", //html中已经加载的js文件，为的是取得base路径  
scripts = document.getElementsByTagName("script");  
for (i = 0; i < scripts.length; i++) { //遍历html中已经加载的js，取得整个应用加载js的base路径  
if (scripts[i].src.match(src)) {  
base = scripts[i].src.replace(src, "");  
break;  
}  
}  
  
if (type == "css") {  
document.write("<" + "link href=\"" + base + path + "\" rel=\"stylesheet\" type=\"text/css\"></" + "link>");  
} else {  
document.write("<" + "script src=\"" + base + path + "\"></" + "script>");  
}  
}  
$import('global.js', 'js');
$import('jquery.idTabs.min.js', 'js');
$import('top_plugins.js', 'js');
$import('jquery.scrolltotop.js', 'js');
$import('nav.js', 'js');
//弹出框引用的js
//$import('jquery.simplemodal.js', 'js');
$import('easydialog.min.js', 'js');
//弹出框引用的js
$import('other.js', 'js');
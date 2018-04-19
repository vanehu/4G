$(document).ready(function() {

    jQuery(document).ready(function($) {
    	
    	$('#test1').bind('click', function() {
//          //  e.preventDefault();
//            var dlg = $.Zebra_Dialog('<div id="loadmask" class="loadmask-msg"><div>测试测试测试</div></div>',{
//            	'buttons': false,
//            	'type': false,
//            	'keyboard':false,
//            	'modal':true,
//            	'overlay_close':false
//            });
//            //$("#ZebraDialog").css("box-shadow","0");
//           $(".ZebraDialog").width($("#loadmask").width()+6);
//            //dlg.close();
//    		$.mask("dsdfsfsdfsfsf");
//    		$.unmask();
        });
    	
    	
        $('#example1').bind('click', function(e) {
            e.preventDefault();
            new $.Zebra_Dialog('<strong>Zebra_Dialog</strong>, a small, compact and highly configurable dialog box plugin for jQuery');
            new $.Zebra_Dialog('<strong>Zebra_Dialog</strong>, a small, compact and highly configurable dialog box plugin for jQuery');
        });
        $('#example2_1').bind('click', function(e) {
            e.preventDefault();
            $.Zebra_Dialog('<strong>Zebra_Dialog</strong> has no dependencies other than <em>jQuery 1.5.2+</em> and works in all major' +
                ' browsers like<br>- Firefox<br>- Opera<br>- Safari<br>- Chrome<br>- Internet Explorer 6+', {
                'type':     'error',
                'title':    'Error'
            });
        });
        $('#example2_2').bind('click', function(e) {
            e.preventDefault();
            $.Zebra_Dialog('<strong>Zebra_Dialog</strong> is meant to replace JavaScript\'s <em>alert</em> and <em>confirmation</em>' +
                ' dialog boxes. <br><br> Can also be used as a notification widget - when configured to show no buttons and to close' +
                ' automatically - for updates or errors, without distracting users from their browser experience by displaying obtrusive alerts.', {
                'type':     'warning',
                'title':    'Warning'
            });
        });
        $('#example2_3').bind('click', function(e) {
            e.preventDefault();
            $.Zebra_Dialog('<strong>Zebra_Dialog</strong> can generate 5 types of dialog boxes: confirmation, information, ' +
                ' warning, error and question.<br><br>The appearance of the dialog boxes is easily customizable by changing the CSS file ', {
                'type':     'question',
                'title':    'Question'
            });
        });
        $('#example2_4').bind('click', function(e) {
            e.preventDefault();
            $.Zebra_Dialog('<strong>Zebra_Dialog</strong> dialog boxes can be positioned anywhere on the screen - not just in the middle!' +
                '<br><br>By default, dialog boxes can be closed by pressing the ESC key or by clicking anywhere on the overlay.'
                , {
                'type':     'information',
                'title':    'Information'
            });
        });
        $('#example2_5').bind('click', function(e) {
            e.preventDefault();
            $.Zebra_Dialog('<strong>Zebra_Dialog</strong> is a small (4KB minified), compact (one JS file, no dependencies other than jQuery 1.5.2+)' +
                ' and highly configurable dialog box plugin for jQuery meant to replace JavaScript\'s <em>alert</em> and <em>confirmation</em> dialog boxes.', {
                'type':     'confirmation',
                'title':    'Confirmation'
            });
        });
        $('#example3').bind('click', function(e) {
            e.preventDefault();
            $.Zebra_Dialog('<strong>Zebra_Dialog</strong>, a small, compact and highly configurable dialog box plugin for jQuery', {
                'type':     'confirmation',
                'title':    '确认对话框',
                'buttons':  ['确定', '取消'],
                'onClose':  function(caption) {
                    alert((caption != '' ? '"' + caption + '"' : 'nothing') + ' was clicked');
                }
            });
        });
        $('#example4').bind('click', function(e) {
            e.preventDefault();
            $.Zebra_Dialog('<strong>Zebra_Dialog</strong>, a small, compact and highly configurable dialog box plugin for jQuery', {
                'title':    'Custom positioning',
                'position': ['right - 20', 'top + 20']
            });
        });
        $('#example5').bind('click', function(e) {
            e.preventDefault();
            new $.Zebra_Dialog('<strong>Zebra_Dialog</strong>, a small, compact and highly configurable dialog box plugin for jQuery', {
                'buttons':  false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 2000
            });
        });
        $('#example5_1').bind('click', function(e) {
            e.preventDefault();
             $.Zebra_Dialog('<strong>Zebra_Dialog</strong>, a small, compact and highly configurable dialog box plugin for jQuery', {
            	 'buttons':   ['Yes'],
            	 'overlay_close':false,
                'modal': true,
                'position': "auto",
                'targetEle': $(this)[0]
            });
        });
        
        
        $('#example6').bind('click', function(e) {
            e.preventDefault();
            new $.Zebra_Dialog('<strong>Zebra_Dialog</strong>, a small, compact and highly configurable dialog box plugin for jQuery', {
                'custom_class': 'myclass',
                'title': 'Customizing the appearance'
            });
        });
    });

});
